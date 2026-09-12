#!/usr/bin/env python3
"""Build TRACE's reviewed, time-bounded AWS security-news snapshot.

The browser never reads feeds directly. This importer turns allowlisted RSS/Atom
entries into a separate review queue. Only a deliberately reviewed,
schema-validated ``generated/news.json`` is published by the site build.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from html.parser import HTMLParser
from pathlib import Path
from typing import Any, Iterable


ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "scripts" / "news_sources.json"
PUBLISHED_PATH = ROOT / "generated" / "news.json"
DEFAULT_CANDIDATE_PATH = ROOT / "generated" / "news-candidates.json"
USER_AGENT = "TRACE-AWS-Security-Atlas-News/1.0 (+https://anonx00.github.io/trace/)"
UTC = timezone.utc
ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]{4,95}$")
SPACE_RE = re.compile(r"\s+")
TAG_RE = re.compile(r"\{[^}]+\}")
TRACKING_QUERY_KEYS = {
    "utm_campaign", "utm_content", "utm_medium", "utm_source", "utm_term",
    "fbclid", "gclid", "mc_cid", "mc_eid",
}
ALLOWED_REFERENCE_HOSTS = {
    "aws.amazon.com", "docs.aws.amazon.com", "github.com", "www.cve.org", "cve.org",
    "www.cisa.gov", "cisa.gov", "alas.aws.amazon.com",
}
ALLOWED_GITHUB_REFERENCE_OWNERS = {"aws", "awslabs"}
PLAIN_TEXT_RE = re.compile(r"</?[a-z][^>]*>|<!doctype|<\?xml|javascript:", re.IGNORECASE)
ITEM_FIELDS = {
    "id", "title", "summary", "whyItMatters", "checks", "category", "services", "mapping", "basis",
    "publishedAt", "retrievedAt", "expiresAt", "source", "references", "review",
}


class NewsError(RuntimeError):
    """Raised for a rejected feed or invalid snapshot."""


class _TextExtractor(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []

    def handle_data(self, data: str) -> None:
        self.parts.append(data)


@dataclass(frozen=True)
class FeedEntry:
    title: str
    url: str
    uid: str
    published_at: datetime
    summary: str
    categories: tuple[str, ...]


class _AllowlistedRedirects(urllib.request.HTTPRedirectHandler):
    def __init__(self, allowed_hosts: set[str]) -> None:
        super().__init__()
        self.allowed_hosts = allowed_hosts

    def redirect_request(self, req, fp, code, msg, headers, newurl):  # type: ignore[no-untyped-def]
        _require_https_url(newurl, self.allowed_hosts, "feed redirect")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def _now() -> datetime:
    return datetime.now(UTC).replace(microsecond=0)


def _parse_datetime(value: str, field: str) -> datetime:
    value = (value or "").strip()
    if not value:
        raise NewsError(f"{field}: missing timestamp")
    try:
        if value.endswith("Z"):
            parsed = datetime.fromisoformat(value[:-1] + "+00:00")
        else:
            parsed = datetime.fromisoformat(value)
    except ValueError:
        try:
            parsed = parsedate_to_datetime(value)
        except (TypeError, ValueError) as exc:
            raise NewsError(f"{field}: invalid timestamp {value!r}") from exc
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=UTC)
    return parsed.astimezone(UTC).replace(microsecond=0)


def _iso(value: datetime) -> str:
    return value.astimezone(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def _clean_text(value: str, limit: int = 420) -> str:
    parser = _TextExtractor()
    try:
        parser.feed(html.unescape(value or ""))
        parser.close()
    except Exception:
        parser.parts = [value or ""]
    text = SPACE_RE.sub(" ", " ".join(parser.parts)).strip()
    if len(text) <= limit:
        return text
    shortened = text[: limit - 1].rsplit(" ", 1)[0].rstrip(" ,;:")
    return (shortened or text[: limit - 1]).rstrip() + "…"


def _require_https_url(value: str, allowed_hosts: set[str] | None, label: str) -> str:
    parsed = urllib.parse.urlsplit(value)
    host = (parsed.hostname or "").lower()
    if parsed.scheme.lower() != "https" or not host or parsed.username or parsed.password:
        raise NewsError(f"{label}: only credential-free HTTPS URLs are allowed")
    try:
        port = parsed.port
    except ValueError as exc:
        raise NewsError(f"{label}: invalid port") from exc
    if port not in (None, 443):
        raise NewsError(f"{label}: non-standard port is not allowed")
    if allowed_hosts is not None and host not in allowed_hosts:
        raise NewsError(f"{label}: host {host!r} is not allowlisted")
    query = urllib.parse.parse_qsl(parsed.query, keep_blank_values=True)
    query = [
        (key, val)
        for key, val in query
        if key.lower() not in TRACKING_QUERY_KEYS
        and not key.lower().startswith(("utm_", "mc_"))
    ]
    clean_path = re.sub(r"/{2,}", "/", parsed.path or "/")
    return urllib.parse.urlunsplit(("https", parsed.netloc.lower(), clean_path, urllib.parse.urlencode(query), ""))


def _load_json(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError as exc:
        raise NewsError(f"Missing {path.relative_to(ROOT)}") from exc
    except json.JSONDecodeError as exc:
        raise NewsError(f"Invalid JSON in {path.relative_to(ROOT)}: {exc}") from exc
    if not isinstance(data, dict):
        raise NewsError(f"{path.relative_to(ROOT)} must contain a JSON object")
    return data


def _write_json_if_changed(path: Path, data: dict[str, Any], ignore_generated_at: bool = False) -> bool:
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        try:
            existing = json.loads(path.read_text(encoding="utf-8"))
            left = dict(existing) if isinstance(existing, dict) else existing
            right = dict(data)
            if ignore_generated_at and isinstance(left, dict):
                left.pop("generatedAt", None)
                left.pop("snapshotExpiresAt", None)
                right.pop("generatedAt", None)
                right.pop("snapshotExpiresAt", None)
            if left == right:
                return False
        except (json.JSONDecodeError, OSError):
            pass
    rendered = json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", newline="\n", delete=False, dir=path.parent) as handle:
        handle.write(rendered)
        temporary = Path(handle.name)
    temporary.replace(path)
    return True


def _catalog_service_ids() -> set[str]:
    script = "import {services} from './catalog.js'; console.log(JSON.stringify(services.map(s=>s.id)));"
    try:
        result = subprocess.run(
            ["node", "--input-type=module", "-e", script],
            cwd=ROOT,
            capture_output=True,
            check=True,
            text=True,
            encoding="utf-8",
        )
        ids = json.loads(result.stdout)
    except (FileNotFoundError, subprocess.CalledProcessError, json.JSONDecodeError) as exc:
        raise NewsError("Could not load service IDs from catalog.js with Node.js") from exc
    return {str(value) for value in ids}


def _load_config() -> tuple[dict[str, Any], dict[str, dict[str, Any]], set[str]]:
    config = _load_json(CONFIG_PATH)
    if config.get("schemaVersion") != 1:
        raise NewsError("news_sources.json: unsupported schemaVersion")
    catalog_ids = _catalog_service_ids()
    aliases = config.get("serviceAliases")
    if not isinstance(aliases, dict) or set(aliases) != catalog_ids:
        missing = sorted(catalog_ids - set(aliases or {}))
        extra = sorted(set(aliases or {}) - catalog_ids)
        raise NewsError(f"news_sources.json aliases must match catalog.js (missing={missing}, extra={extra})")
    sources = config.get("sources")
    if not isinstance(sources, list) or not sources:
        raise NewsError("news_sources.json: sources must be a non-empty array")
    by_id: dict[str, dict[str, Any]] = {}
    seen_urls: set[str] = set()
    for source in sources:
        if not isinstance(source, dict) or not ID_RE.fullmatch(str(source.get("id", ""))):
            raise NewsError("news_sources.json: every source needs a stable lowercase id")
        source_id = source["id"]
        if source_id in by_id:
            raise NewsError(f"news_sources.json: duplicate source id {source_id}")
        hosts = {str(host).lower() for host in source.get("allowedItemHosts", [])}
        if not hosts:
            raise NewsError(f"{source_id}: allowedItemHosts is required")
        feed_url = _require_https_url(str(source.get("feedUrl", "")), hosts, f"{source_id}.feedUrl")
        if feed_url in seen_urls:
            raise NewsError(f"news_sources.json: duplicate feed URL {feed_url}")
        seen_urls.add(feed_url)
        fixed = set(source.get("fixedServices", []))
        if not fixed <= catalog_ids:
            raise NewsError(f"{source_id}: unknown fixed service IDs {sorted(fixed - catalog_ids)}")
        by_id[source_id] = source
    return config, by_id, catalog_ids


def _fetch_feed(source: dict[str, Any], policy: dict[str, Any]) -> bytes:
    hosts = {str(host).lower() for host in source["allowedItemHosts"]}
    feed_url = _require_https_url(source["feedUrl"], hosts, f"{source['id']}.feedUrl")
    opener = urllib.request.build_opener(_AllowlistedRedirects(hosts))
    request = urllib.request.Request(
        feed_url,
        headers={
            "Accept": "application/atom+xml, application/rss+xml, application/xml, text/xml;q=0.9",
            "Accept-Encoding": "identity",
            "User-Agent": USER_AGENT,
        },
    )
    limit = int(policy["maxFeedBytes"])
    timeout = int(policy["requestTimeoutSeconds"])
    last_error: Exception | None = None
    for attempt in range(2):
        try:
            with opener.open(request, timeout=timeout) as response:
                _require_https_url(response.geturl(), hosts, f"{source['id']} final feed URL")
                content_type = response.headers.get_content_type().lower()
                if content_type not in {
                    "application/atom+xml",
                    "application/rss+xml",
                    "application/xml",
                    "text/xml",
                    "text/plain",
                    "application/octet-stream",
                }:
                    raise NewsError(f"{source['id']}: unexpected Content-Type {content_type!r}")
                payload = response.read(limit + 1)
                if len(payload) > limit:
                    raise NewsError(f"{source['id']}: feed exceeds {limit} bytes")
                return payload
        except (OSError, urllib.error.URLError, NewsError) as exc:
            last_error = exc
            if attempt == 0:
                time.sleep(1)
    raise NewsError(f"{source['id']}: fetch failed: {last_error}")


def _local_name(tag: str) -> str:
    return TAG_RE.sub("", tag).lower()


def _child_text(parent: ET.Element, names: Iterable[str]) -> str:
    wanted = {name.lower() for name in names}
    for child in list(parent):
        if _local_name(child.tag) in wanted:
            return "".join(child.itertext()).strip()
    return ""


def _parse_feed(payload: bytes, source: dict[str, Any]) -> list[FeedEntry]:
    lowered = payload.lower()
    if b"<!doctype" in lowered or b"<!entity" in lowered:
        raise NewsError(f"{source['id']}: DTD/entity declarations are rejected")
    try:
        root = ET.fromstring(payload)
    except ET.ParseError as exc:
        raise NewsError(f"{source['id']}: invalid XML: {exc}") from exc
    root_name = _local_name(root.tag)
    nodes = [node for node in root.iter() if _local_name(node.tag) == ("entry" if root_name == "feed" else "item")]
    entries: list[FeedEntry] = []
    allowed_hosts = {str(host).lower() for host in source["allowedItemHosts"]}
    for node in nodes:
        title = _clean_text(_child_text(node, ["title"]), 200)
        link = ""
        if root_name == "feed":
            for child in list(node):
                if _local_name(child.tag) == "link" and child.attrib.get("rel", "alternate") in {"", "alternate"}:
                    link = child.attrib.get("href", "")
                    if link:
                        break
        else:
            link = _child_text(node, ["link"])
        try:
            link = _require_https_url(link, allowed_hosts, f"{source['id']} item URL")
        except NewsError:
            continue
        uid = _clean_text(_child_text(node, ["guid", "id"]), 300) or link
        published = _child_text(node, ["pubdate", "published", "updated", "date"])
        try:
            published_at = _parse_datetime(published, f"{source['id']} item date")
        except NewsError:
            continue
        summary_parts = []
        for child in list(node):
            if _local_name(child.tag) in {"description", "summary", "content", "encoded"}:
                summary_parts.append("".join(child.itertext()))
        summary = _clean_text(" ".join(summary_parts), 420)
        categories: list[str] = []
        for child in list(node):
            if _local_name(child.tag) != "category":
                continue
            value = child.attrib.get("term", "") or "".join(child.itertext())
            categories.extend(part.strip() for part in value.split(",") if part.strip())
        if title:
            entries.append(FeedEntry(title, link, uid, published_at, summary, tuple(categories)))
    return entries


def _alias_hits(text: str, aliases: dict[str, list[str]]) -> list[tuple[str, str]]:
    """Return longest non-overlapping service aliases.

    A shorter alias contained by a longer service name must not create a second
    mapping (for example, ``AWS IAM`` inside ``AWS IAM Identity Center``).
    """
    hits: list[tuple[int, int, str, str]] = []
    for service, service_aliases in aliases.items():
        for alias in service_aliases:
            escaped = re.escape(alias)
            match = re.search(rf"(?<![A-Za-z0-9]){escaped}(?![A-Za-z0-9])", text, re.IGNORECASE)
            if match:
                hits.append((match.start(), match.end(), service, alias))
    selected: list[tuple[int, int, str, str]] = []
    for hit in sorted(hits, key=lambda value: (-(value[1] - value[0]), value[0], value[2])):
        start, end, service, _ = hit
        if any(start >= kept_start and end <= kept_end and service != kept_service for kept_start, kept_end, kept_service, _ in selected):
            continue
        if any(service == kept_service for _, _, kept_service, _ in selected):
            continue
        selected.append(hit)
    return [(service, alias) for _, _, service, alias in sorted(selected)]


def _map_services(entry: FeedEntry, source: dict[str, Any], aliases: dict[str, list[str]]) -> list[dict[str, str]]:
    mappings: list[dict[str, str]] = []
    mapped: set[str] = set()

    def add(service: str, method: str, term: str, basis: str) -> None:
        if service not in mapped and len(mappings) < 5:
            mapped.add(service)
            mappings.append({"service": service, "method": method, "term": term, "basis": basis})

    for service in source.get("fixedServices", []):
        add(service, "fixed-source", source["feedLabel"], f"Source feed is scoped to {service}")
    for service, alias in _alias_hits(entry.title, aliases):
        add(service, "title-exact", alias, f"Exact title phrase: {alias}")
    searchable = f"{entry.summary} {' '.join(entry.categories)}"
    for service, alias in _alias_hits(searchable, aliases):
        if service not in mapped:
            add(service, "component-exact", alias, f"Exact summary phrase: {alias}")
    return mappings


def _stable_item_id(source_id: str, entry: FeedEntry) -> str:
    combined = f"{entry.title} {entry.summary} {entry.uid}"
    for pattern in (r"\b(\d{4}-\d{2,4}-AWS)\b", r"\b(ALAS\d{4}-\d{4}-\d+)\b", r"\b(GHSA-[a-z0-9-]+)\b"):
        match = re.search(pattern, combined, re.IGNORECASE)
        if match:
            token = re.sub(r"[^a-z0-9]+", "-", match.group(1).lower()).strip("-")
            return f"news-{source_id}-{token}"[:96].rstrip("-")
    digest = hashlib.sha256(f"{source_id}\0{entry.uid}\0{entry.url}".encode("utf-8")).hexdigest()[:14]
    return f"news-{source_id}-{digest}"


def _category(entry: FeedEntry) -> str:
    text = f"{entry.title} {entry.summary}".lower()
    if re.search(r"\bcve-\d{4}-\d{4,}\b|security advisory|security bulletin|vulnerabilit", text):
        return "vulnerability"
    if re.search(r"detection rule|finding type|security control|network scanning", text):
        return "detection-change"
    if re.search(r"permission|policy|condition key|service-linked role|authentication|authorization", text):
        return "policy-change"
    if re.search(r"attack|campaign|threat actor|defense evasion|exfiltrat", text):
        return "threat-research"
    return "service-change"


def _is_actionable(entry: FeedEntry, config: dict[str, Any]) -> bool:
    text = f"{entry.title} {entry.summary} {' '.join(entry.categories)}"
    actionable = any(re.search(pattern, text, re.IGNORECASE) for pattern in config["actionablePatterns"])
    if not actionable:
        return False
    suppressed = any(re.search(pattern, text, re.IGNORECASE) for pattern in config["suppressPatterns"])
    has_identifier = re.search(r"\b(?:CVE-\d{4}-\d{4,}|GHSA-[a-z0-9-]+|ALAS\d{4}-\d{4}-\d+)\b", text, re.IGNORECASE)
    return not suppressed or bool(has_identifier)


def _candidate_from_entry(
    entry: FeedEntry,
    source: dict[str, Any],
    config: dict[str, Any],
    retrieved_at: datetime,
) -> dict[str, Any] | None:
    if len(entry.title) < 12:
        return None
    if not _is_actionable(entry, config):
        return None
    mappings = _map_services(entry, source, config["serviceAliases"])
    if not mappings:
        return None
    ttl_days = int(source.get("ttlDays", config["policy"]["defaultTtlDays"]))
    expires_at = entry.published_at + timedelta(days=ttl_days)
    if expires_at <= retrieved_at or entry.published_at > retrieved_at:
        return None
    evidence = "; ".join(mapping["basis"] for mapping in mappings)
    summary = _clean_text(entry.summary, 420)
    if len(summary) < 24:
        summary = "The feed supplied no reviewable summary; open the original source before evaluating this candidate."
    return {
        "id": _stable_item_id(source["id"], entry),
        "title": entry.title,
        "summary": summary or "No feed summary was supplied; open the source before reviewing this candidate.",
        "whyItMatters": "",
        "checks": [],
        "category": _category(entry),
        "services": [mapping["service"] for mapping in mappings],
        "mapping": mappings,
        "basis": f"Automated candidate from an allowlisted feed. Mapping evidence: {evidence}. Human review and primary-source corroboration required.",
        "publishedAt": _iso(entry.published_at),
        "retrievedAt": _iso(retrieved_at),
        "expiresAt": _iso(expires_at),
        "source": {
            "publisher": source["publisher"],
            "kind": source["kind"],
            "url": entry.url,
            "feedLabel": source["feedLabel"],
            "feedUrl": source["feedUrl"],
        },
        "references": [],
        "review": {"status": "pending", "reviewedAt": None},
    }


def _item_sort_key(item: dict[str, Any]) -> tuple[datetime, str]:
    return (_parse_datetime(item["publishedAt"], f"{item.get('id', 'item')}.publishedAt"), item.get("id", ""))


def _snapshot(items: list[dict[str, Any]], generated_at: datetime, policy: dict[str, Any], publication: str) -> dict[str, Any]:
    items = sorted(items, key=_item_sort_key, reverse=True)
    return {
        "schemaVersion": 1,
        "publication": publication,
        "generatedAt": _iso(generated_at),
        "snapshotExpiresAt": _iso(generated_at + timedelta(days=int(policy["staleAfterDays"]))),
        "policy": {
            "maxItemsPerService": int(policy["maxItemsPerService"]),
            "staleAfterDays": int(policy["staleAfterDays"]),
            "expiredItems": "hidden",
            "pendingItems": "excluded",
            "linksPerItem": 2,
        },
        "items": items,
    }


def _dedupe_candidates(items: Iterable[dict[str, Any]]) -> list[dict[str, Any]]:
    """Return newest-first candidates unique by stable ID and canonical source URL."""
    kept: list[dict[str, Any]] = []
    seen_ids: set[str] = set()
    seen_urls: set[str] = set()
    for item in sorted(items, key=_item_sort_key, reverse=True):
        item_id = str(item.get("id", ""))
        source = item.get("source", {})
        source_url = str(source.get("url", ""))
        dedupe_url = source.get("kind") != "official-doc-update"
        if item_id in seen_ids or (dedupe_url and source_url in seen_urls):
            continue
        seen_ids.add(item_id)
        if dedupe_url:
            seen_urls.add(source_url)
        kept.append(item)
    return kept


def _active_items(items: Iterable[dict[str, Any]], as_of: datetime) -> list[dict[str, Any]]:
    """Drop expired entries without mutating the supplied list."""
    return [
        item
        for item in items
        if _parse_datetime(item["expiresAt"], f"{item.get('id', 'item')}.expiresAt") > as_of
    ]


def _require_exact_keys(value: dict[str, Any], expected: set[str], label: str) -> None:
    actual = set(value)
    missing = sorted(expected - actual)
    extra = sorted(actual - expected)
    if missing or extra:
        raise NewsError(f"{label}: schema mismatch (missing={missing}, extra={extra})")


def _require_plain_text(value: Any, label: str, minimum: int, maximum: int) -> str:
    if not isinstance(value, str) or value != value.strip() or not minimum <= len(value) <= maximum:
        raise NewsError(f"{label}: must be {minimum}-{maximum} trimmed characters")
    if "\n" in value or "\r" in value or PLAIN_TEXT_RE.search(value):
        raise NewsError(f"{label}: must be one plain-text paragraph")
    return value


def _validate_reference_url(value: str, label: str) -> str:
    normalized = _require_https_url(value, ALLOWED_REFERENCE_HOSTS, label)
    if normalized != value:
        raise NewsError(f"{label}: must be canonical and contain no tracking parameters or fragment")
    parsed = urllib.parse.urlsplit(normalized)
    if parsed.hostname == "github.com":
        parts = [urllib.parse.unquote(part).casefold() for part in parsed.path.split("/") if part]
        if not parts or parts[0] not in ALLOWED_GITHUB_REFERENCE_OWNERS:
            raise NewsError(f"{label}: GitHub references must belong to an allowlisted AWS organization")
    return normalized


def _validate_item(
    item: dict[str, Any],
    index: int,
    source_by_id: dict[str, dict[str, Any]],
    catalog_ids: set[str],
    published: bool,
) -> None:
    label = f"items[{index}]"
    _require_exact_keys(item, ITEM_FIELDS, label)
    if not ID_RE.fullmatch(str(item["id"])):
        raise NewsError(f"{label}.id: invalid stable id")
    _require_plain_text(item["title"], f"{label}.title", 12, 200)
    _require_plain_text(item["summary"], f"{label}.summary", 24, 500)
    _require_plain_text(item["basis"], f"{label}.basis", 20, 900)
    if item["whyItMatters"] == "":
        if published:
            raise NewsError(f"{label}.whyItMatters: approved items require reviewed analysis")
    else:
        _require_plain_text(item["whyItMatters"], f"{label}.whyItMatters", 20, 420)
    allowed_categories = {"vulnerability", "detection-change", "policy-change", "threat-research", "service-change"}
    if item.get("category") not in allowed_categories:
        raise NewsError(f"{label}.category: must be one of {sorted(allowed_categories)}")
    checks = item["checks"]
    if not isinstance(checks, list) or len(checks) > 3:
        raise NewsError(f"{label}.checks: use at most three concise checks")
    for check_index, value in enumerate(checks):
        _require_plain_text(value, f"{label}.checks[{check_index}]", 12, 240)
    if published and not checks:
        raise NewsError(f"{label}: approved items require whyItMatters and at least one check")
    services = item["services"]
    if not isinstance(services, list) or not services or len(services) > 5 or len(set(services)) != len(services):
        raise NewsError(f"{label}.services: require 1-5 unique service IDs")
    unknown = set(services) - catalog_ids
    if unknown:
        raise NewsError(f"{label}.services: unknown IDs {sorted(unknown)}")
    mappings = item["mapping"]
    if (
        not isinstance(mappings, list)
        or len(mappings) != len(services)
        or {entry.get("service") for entry in mappings if isinstance(entry, dict)} != set(services)
    ):
        raise NewsError(f"{label}.mapping: must explain every service and no others")
    allowed_methods = {"fixed-source", "title-exact", "title-with-aws-context", "component-exact", "editorial-review"}
    if any(
        not isinstance(entry, dict)
        or set(entry) != {"service", "method", "term", "basis"}
        or entry.get("method") not in allowed_methods
        or not isinstance(entry.get("term"), str)
        or not 1 <= len(entry["term"]) <= 120
        or not isinstance(entry.get("basis"), str)
        or not 8 <= len(entry["basis"]) <= 260
        for entry in mappings
    ):
        raise NewsError(f"{label}.mapping: every mapping needs method, term, and a concise basis")
    for mapping_index, entry in enumerate(mappings):
        _require_plain_text(entry["term"], f"{label}.mapping[{mapping_index}].term", 1, 120)
        _require_plain_text(entry["basis"], f"{label}.mapping[{mapping_index}].basis", 8, 260)
    published_at = _parse_datetime(item["publishedAt"], f"{label}.publishedAt")
    retrieved_at = _parse_datetime(item["retrievedAt"], f"{label}.retrievedAt")
    expires_at = _parse_datetime(item["expiresAt"], f"{label}.expiresAt")
    if retrieved_at < published_at or expires_at <= published_at:
        raise NewsError(f"{label}: timestamps are out of order")
    source = item["source"]
    if not isinstance(source, dict):
        raise NewsError(f"{label}.source: must be an object")
    _require_exact_keys(source, {"publisher", "kind", "url", "feedLabel", "feedUrl"}, f"{label}.source")
    source_id = next((key for key, candidate in source_by_id.items() if candidate["feedUrl"] == source.get("feedUrl")), None)
    if source_id is None:
        raise NewsError(f"{label}.source.feedUrl: feed is not allowlisted")
    configured = source_by_id[source_id]
    for field in ("publisher", "feedLabel", "kind"):
        if source.get(field) != configured[field]:
            raise NewsError(f"{label}.source.{field}: does not match allowlisted source")
    _require_plain_text(source["publisher"], f"{label}.source.publisher", 1, 80)
    _require_plain_text(source["feedLabel"], f"{label}.source.feedLabel", 1, 120)
    hosts = {str(host).lower() for host in configured["allowedItemHosts"]}
    if _require_https_url(str(source.get("url", "")), hosts, f"{label}.source.url") != source["url"]:
        raise NewsError(f"{label}.source.url: must be canonical and contain no tracking parameters or fragment")
    references = item["references"]
    if not isinstance(references, list) or len(references) > 1:
        raise NewsError(f"{label}.references: at most one supporting link is allowed")
    for reference in references:
        if not isinstance(reference, dict):
            raise NewsError(f"{label}.references: each reference must be an object")
        _require_exact_keys(reference, {"label", "url"}, f"{label}.references")
        if not 3 <= len(str(reference.get("label", ""))) <= 100:
            raise NewsError(f"{label}.references: each reference needs a short label")
        _require_plain_text(reference["label"], f"{label}.references.label", 3, 100)
        _validate_reference_url(str(reference.get("url", "")), f"{label}.references.url")
    review = item["review"]
    if not isinstance(review, dict):
        raise NewsError(f"{label}.review: must be an object")
    _require_exact_keys(review, {"status", "reviewedAt"}, f"{label}.review")
    expected_status = "approved" if published else "pending"
    if review.get("status") != expected_status:
        raise NewsError(f"{label}.review.status: must be {expected_status!r}")
    if published:
        _parse_datetime(str(review.get("reviewedAt", "")), f"{label}.review.reviewedAt")
    elif review.get("reviewedAt") is not None:
        raise NewsError(f"{label}.review.reviewedAt: pending items must use null")


def _validate_snapshot(
    data: dict[str, Any],
    config: dict[str, Any],
    source_by_id: dict[str, dict[str, Any]],
    catalog_ids: set[str],
    publication: str,
) -> None:
    _require_exact_keys(
        data,
        {"schemaVersion", "publication", "generatedAt", "snapshotExpiresAt", "policy", "items"},
        "snapshot",
    )
    if data.get("schemaVersion") != 1 or data.get("publication") != publication:
        raise NewsError(f"Snapshot must use schemaVersion 1 and publication={publication!r}")
    generated_at = _parse_datetime(str(data.get("generatedAt", "")), "generatedAt")
    snapshot_expires = _parse_datetime(str(data.get("snapshotExpiresAt", "")), "snapshotExpiresAt")
    expected_expiry = generated_at + timedelta(days=int(config["policy"]["staleAfterDays"]))
    if snapshot_expires != expected_expiry:
        raise NewsError("snapshotExpiresAt must equal generatedAt plus the configured freshness window")
    expected_policy = {
        "maxItemsPerService": int(config["policy"]["maxItemsPerService"]),
        "staleAfterDays": int(config["policy"]["staleAfterDays"]),
        "expiredItems": "hidden",
        "pendingItems": "excluded",
        "linksPerItem": 2,
    }
    if data.get("policy") != expected_policy:
        raise NewsError("Snapshot policy does not match scripts/news_sources.json")
    if not isinstance(data.get("policy"), dict):
        raise NewsError("Snapshot policy must be an object")
    _require_exact_keys(data["policy"], set(expected_policy), "snapshot.policy")
    items = data.get("items")
    if not isinstance(items, list):
        raise NewsError("items must be an array")
    if len(items) > (50 if publication == "published" else int(config["policy"]["maxCandidates"])):
        raise NewsError("Snapshot contains too many items")
    seen_ids: set[str] = set()
    seen_urls: set[str] = set()
    service_counts = {service: 0 for service in catalog_ids}
    for index, item in enumerate(items):
        if not isinstance(item, dict):
            raise NewsError(f"items[{index}] must be an object")
        _validate_item(item, index, source_by_id, catalog_ids, publication == "published")
        published_at = _parse_datetime(item["publishedAt"], f"items[{index}].publishedAt")
        retrieved_at = _parse_datetime(item["retrievedAt"], f"items[{index}].retrievedAt")
        expires_at = _parse_datetime(item["expiresAt"], f"items[{index}].expiresAt")
        if not published_at <= retrieved_at <= generated_at:
            raise NewsError(f"items[{index}]: publication, retrieval, and snapshot timestamps are out of order")
        if expires_at <= generated_at:
            raise NewsError(f"items[{index}]: expired items must be removed before snapshot publication")
        if expires_at - published_at > timedelta(days=120):
            raise NewsError(f"items[{index}]: expiry window exceeds 120 days")
        if publication == "published":
            reviewed_at = _parse_datetime(item["review"]["reviewedAt"], f"items[{index}].review.reviewedAt")
            if not retrieved_at <= reviewed_at <= generated_at:
                raise NewsError(f"items[{index}]: retrieval, review, and snapshot timestamps are out of order")
        if item["id"] in seen_ids:
            raise NewsError(f"Duplicate news id {item['id']}")
        is_doc = item["source"]["kind"] == "official-doc-update"
        if not is_doc and item["source"]["url"] in seen_urls:
            raise NewsError(f"Duplicate canonical source URL {item['source']['url']}")
        seen_ids.add(item["id"])
        if not is_doc:
            seen_urls.add(item["source"]["url"])
        if publication == "published":
            for service in item["services"]:
                service_counts[service] += 1
    crowded = {
        service: count
        for service, count in service_counts.items()
        if count > int(config["policy"]["maxItemsPerService"])
    }
    if crowded:
        raise NewsError(f"Published snapshot exceeds per-service item limit: {crowded}")
    if items != sorted(items, key=_item_sort_key, reverse=True):
        raise NewsError("items must be sorted newest first")


def _refresh_candidates(
    path: Path,
    published: dict[str, Any],
    config: dict[str, Any],
    source_by_id: dict[str, dict[str, Any]],
    catalog_ids: set[str],
    as_of: datetime,
) -> tuple[int, list[str], bool]:
    approved_ids = {item["id"] for item in published["items"]}
    approved_urls = {
        item["source"]["url"]
        for item in published["items"]
        if item["source"]["kind"] != "official-doc-update"
    }
    candidates: list[dict[str, Any]] = []
    failures: list[str] = []
    existing_by_id: dict[str, dict[str, Any]] = {}
    if path.exists():
        existing = _load_json(path)
        _validate_snapshot(existing, config, source_by_id, catalog_ids, "review-only")
        existing_by_id = {
            item["id"]: item
            for item in _active_items(existing["items"], as_of)
        }
    per_source = int(config["policy"]["maxCandidatesPerSource"])
    for source in source_by_id.values():
        try:
            payload = _fetch_feed(source, config["policy"])
            entries = sorted(_parse_feed(payload, source), key=lambda entry: entry.published_at, reverse=True)
        except NewsError as exc:
            failures.append(str(exc))
            continue
        accepted = 0
        for entry in entries:
            candidate = _candidate_from_entry(entry, source, config, as_of)
            if candidate is None or candidate["id"] in approved_ids:
                continue
            is_doc = candidate["source"]["kind"] == "official-doc-update"
            if not is_doc and candidate["source"]["url"] in approved_urls:
                continue
            if candidate["id"] in existing_by_id:
                candidate = existing_by_id[candidate["id"]]
            candidates.append(candidate)
            accepted += 1
            if accepted >= per_source:
                break
    queued_ids = {item["id"] for item in candidates}
    queued_urls = {item["source"]["url"] for item in candidates if item["source"]["kind"] != "official-doc-update"}
    for item in existing_by_id.values():
        is_doc = item["source"]["kind"] == "official-doc-update"
        if item["id"] in approved_ids or item["id"] in queued_ids:
            continue
        if not is_doc and (item["source"]["url"] in approved_urls or item["source"]["url"] in queued_urls):
            continue
        candidates.append(item)
    candidates = _dedupe_candidates(candidates)[: int(config["policy"]["maxCandidates"])]
    snapshot = _snapshot(candidates, as_of, config["policy"], "review-only")
    _validate_snapshot(snapshot, config, source_by_id, catalog_ids, "review-only")
    changed = _write_json_if_changed(path, snapshot, ignore_generated_at=True)
    return len(candidates), failures, changed


def _prune_published(
    data: dict[str, Any],
    config: dict[str, Any],
    source_by_id: dict[str, dict[str, Any]],
    catalog_ids: set[str],
    as_of: datetime,
) -> tuple[dict[str, Any], int]:
    retained = _active_items(data["items"], as_of)
    removed = len(data["items"]) - len(retained)
    if removed:
        # Pruning is housekeeping, not editorial review. Preserve the review
        # clock so automation cannot make retained intelligence look newer.
        data = {**data, "items": sorted(retained, key=_item_sort_key, reverse=True)}
    _validate_snapshot(data, config, source_by_id, catalog_ids, "published")
    return data, removed


def _promote(
    ids: list[str],
    candidate_path: Path,
    published: dict[str, Any],
    config: dict[str, Any],
    source_by_id: dict[str, dict[str, Any]],
    catalog_ids: set[str],
    reviewed_at: datetime,
) -> tuple[dict[str, Any], dict[str, Any]]:
    candidates = _load_json(candidate_path)
    _validate_snapshot(candidates, config, source_by_id, catalog_ids, "review-only")
    wanted = set(ids)
    available = {item["id"]: item for item in candidates["items"]}
    missing = sorted(wanted - set(available))
    if missing:
        raise NewsError(f"Candidate IDs not found: {missing}")
    promoted: list[dict[str, Any]] = []
    for item_id in ids:
        item = json.loads(json.dumps(available[item_id]))
        if _parse_datetime(item["expiresAt"], f"{item_id}.expiresAt") <= reviewed_at:
            raise NewsError(f"{item_id}: candidate is expired and cannot be promoted")
        if len(item.get("whyItMatters", "")) < 20 or not item.get("checks"):
            raise NewsError(f"{item_id}: add reviewed whyItMatters and checks before promotion")
        if item.get("basis", "").startswith("Automated candidate") or any(
            mapping.get("method") != "editorial-review" for mapping in item.get("mapping", [])
        ):
            raise NewsError(
                f"{item_id}: replace automated provenance and mappings with reviewed editorial evidence before promotion"
            )
        item["review"] = {"status": "approved", "reviewedAt": _iso(reviewed_at)}
        promoted.append(item)
    existing = [
        item
        for item in _active_items(published["items"], reviewed_at)
        if item["id"] not in wanted
    ]
    published = _snapshot(existing + promoted, reviewed_at, config["policy"], "published")
    candidates = _snapshot([item for item in candidates["items"] if item["id"] not in wanted], reviewed_at, config["policy"], "review-only")
    _validate_snapshot(published, config, source_by_id, catalog_ids, "published")
    _validate_snapshot(candidates, config, source_by_id, catalog_ids, "review-only")
    return published, candidates


def _relative_or_value(path: Path) -> str:
    try:
        return str(path.relative_to(ROOT))
    except ValueError:
        return str(path)


# Public, side-effect-free helpers used by the deterministic importer tests.
# Network access and file writes remain isolated in ``_fetch_feed`` and ``main``.
parse_feed = _parse_feed
map_services = _map_services
normalize_candidate = _candidate_from_entry
validate_https_url = _require_https_url
prune_published = _prune_published
dedupe_candidates = _dedupe_candidates
active_items = _active_items


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Validate the reviewed published snapshot")
    parser.add_argument("--strict-fresh", action="store_true", help="Fail when the snapshot or an item is stale")
    parser.add_argument("--refresh", action="store_true", help="Fetch allowlisted feeds into the review-only candidate snapshot")
    parser.add_argument("--candidate", type=Path, default=DEFAULT_CANDIDATE_PATH, help="Review-only candidate JSON path")
    parser.add_argument("--prune", action="store_true", help="Remove expired approved items from the published snapshot")
    parser.add_argument("--promote", nargs="+", metavar="ID", help="Promote edited, reviewed candidate IDs")
    parser.add_argument("--reviewed-at", help="UTC review timestamp for --promote (defaults to now)")
    parser.add_argument("--as-of", help="UTC clock override for deterministic validation")
    args = parser.parse_args(argv)

    try:
        config, source_by_id, catalog_ids = _load_config()
        as_of = _parse_datetime(args.as_of, "--as-of") if args.as_of else _now()
        published = _load_json(PUBLISHED_PATH)
        _validate_snapshot(published, config, source_by_id, catalog_ids, "published")

        if args.prune:
            published, removed = _prune_published(published, config, source_by_id, catalog_ids, as_of)
            changed = _write_json_if_changed(PUBLISHED_PATH, published)
            print(f"Pruned {removed} expired item(s); {_relative_or_value(PUBLISHED_PATH)} {'updated' if changed else 'unchanged'}.")

        if args.refresh:
            count, failures, changed = _refresh_candidates(
                args.candidate.resolve(), published, config, source_by_id, catalog_ids, as_of
            )
            print(f"Wrote {count} review candidate(s) to {_relative_or_value(args.candidate.resolve())} ({'changed' if changed else 'unchanged'}).")
            for failure in failures:
                print(f"WARNING: {failure}", file=sys.stderr)
            if len(failures) == len(source_by_id):
                raise NewsError("Every configured feed failed; refusing to treat this refresh as successful")

        if args.promote:
            reviewed_at = _parse_datetime(args.reviewed_at, "--reviewed-at") if args.reviewed_at else as_of
            published, candidates = _promote(
                args.promote,
                args.candidate.resolve(),
                published,
                config,
                source_by_id,
                catalog_ids,
                reviewed_at,
            )
            _write_json_if_changed(PUBLISHED_PATH, published)
            _write_json_if_changed(args.candidate.resolve(), candidates)
            print(f"Promoted {len(args.promote)} reviewed candidate(s).")

        if args.strict_fresh:
            snapshot_expiry = _parse_datetime(published["snapshotExpiresAt"], "snapshotExpiresAt")
            if snapshot_expiry <= as_of:
                raise NewsError(f"Published snapshot expired at {_iso(snapshot_expiry)}")
            expired = [item["id"] for item in published["items"] if _parse_datetime(item["expiresAt"], f"{item['id']}.expiresAt") <= as_of]
            if expired:
                raise NewsError(f"Published snapshot contains expired items: {expired}")

        if args.check or not (args.refresh or args.prune or args.promote):
            print(f"Validated {len(published['items'])} approved news item(s) across {len(catalog_ids)} catalog services.")
        return 0
    except NewsError as exc:
        print(f"news importer: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
