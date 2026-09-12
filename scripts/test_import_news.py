import json
import sys
import tempfile
import unittest
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import import_news as news  # noqa: E402


UTC = timezone.utc
NOW = datetime(2026, 9, 12, 12, 0, tzinfo=UTC)


class NewsImporterTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config = json.loads((ROOT / "scripts" / "news_sources.json").read_text(encoding="utf-8"))
        cls.sources = {source["id"]: source for source in cls.config["sources"]}
        cls.aliases = cls.config["serviceAliases"]
        cls.published = json.loads((ROOT / "generated" / "news.json").read_text(encoding="utf-8"))

    def entry(self, **overrides):
        values = {
            "title": "AWS Systems Manager security advisory",
            "url": "https://aws.amazon.com/security/example/",
            "uid": "fixture-1",
            "published_at": datetime(2026, 9, 10, tzinfo=UTC),
            "summary": "An important vulnerability affects SSM Agent on Amazon EC2 instances.",
            "categories": ("AWS", "security"),
        }
        values.update(overrides)
        return news.FeedEntry(**values)

    def test_feed_parser_strips_html_and_rejects_dtd(self):
        payload = b"""<?xml version='1.0'?><rss><channel><item>
          <title>AWS Systems Manager &amp; SSM Agent update</title>
          <link>https://aws.amazon.com/security/example/?utm_source=rss</link>
          <guid>fixture-guid</guid><pubDate>Thu, 10 Sep 2026 18:30:00 +0000</pubDate>
          <description>&lt;b&gt;Important&lt;/b&gt; fix for Amazon EC2.</description>
        </item></channel></rss>"""
        entries = news.parse_feed(payload, self.sources["aws-security-bulletins"])
        self.assertEqual(len(entries), 1)
        self.assertEqual(entries[0].summary, "Important fix for Amazon EC2.")
        self.assertNotIn("utm_source", entries[0].url)
        with self.assertRaises(news.NewsError):
            news.parse_feed(b"<!DOCTYPE rss [<!ENTITY xxe SYSTEM 'file:///etc/passwd'>]><rss/>", self.sources["aws-security-bulletins"])

    def test_url_policy_removes_tracking_and_rejects_unsafe_schemes(self):
        url = news.validate_https_url(
            "https://aws.amazon.com/security/example/?utm_campaign=x&keep=yes#fragment",
            {"aws.amazon.com"},
            "fixture",
        )
        self.assertEqual(url, "https://aws.amazon.com/security/example/?keep=yes")
        for unsafe in ("javascript:alert(1)", "http://aws.amazon.com/example", "https://user:pass@aws.amazon.com/example"):
            with self.subTest(unsafe=unsafe), self.assertRaises(news.NewsError):
                news.validate_https_url(unsafe, {"aws.amazon.com"}, "fixture")

    def test_longest_alias_wins_for_identity_center(self):
        entry = self.entry(
            title="AWS IAM Identity Center policy update",
            summary="A policy change affects workforce access.",
        )
        mappings = news.map_services(entry, self.sources["aws-security-blog"], self.aliases)
        self.assertIn("identity-center", {mapping["service"] for mapping in mappings})
        self.assertNotIn("iam", {mapping["service"] for mapping in mappings})
        self.assertEqual(next(mapping for mapping in mappings if mapping["service"] == "identity-center")["term"], "AWS IAM Identity Center")

    def test_broad_story_stays_unmapped_but_scoped_feed_is_explicit(self):
        broad = self.entry(
            title="Cloud security teams publish annual outlook",
            summary="General security guidance for defenders.",
            url="https://securitylabs.datadoghq.com/articles/example/",
        )
        self.assertEqual(news.map_services(broad, self.sources["datadog-security-labs"], self.aliases), [])
        scoped = news.map_services(broad, self.sources["guardduty-doc-history"], self.aliases)
        self.assertEqual(scoped[0]["service"], "guardduty")
        self.assertEqual(scoped[0]["method"], "fixed-source")

    def test_suppressed_marketing_is_not_a_candidate(self):
        entry = self.entry(
            title="Join our Amazon EC2 security vulnerability webinar",
            summary="Register for a training event about authentication.",
        )
        candidate = news.normalize_candidate(entry, self.sources["aws-security-blog"], self.config, NOW)
        self.assertIsNone(candidate)

    def test_candidate_is_pending_plain_text_and_time_bounded(self):
        entry = self.entry(
            title="CVE-2026-99999 affects AWS Systems Manager SSM Agent",
            summary="<p>Important affected versions and a mitigation for Amazon EC2.</p>",
        )
        candidate = news.normalize_candidate(entry, self.sources["aws-security-bulletins"], self.config, NOW)
        self.assertIsNotNone(candidate)
        self.assertEqual(candidate["review"], {"status": "pending", "reviewedAt": None})
        self.assertEqual(candidate["checks"], [])
        self.assertNotIn("<p>", candidate["summary"])
        self.assertLessEqual(len(candidate["services"]), 5)
        self.assertEqual((news._parse_datetime(candidate["expiresAt"], "expires") - entry.published_at).days, 45)

    def test_dedupe_and_expiry_cleanup_are_deterministic(self):
        first = json.loads(json.dumps(self.published["items"][0]))
        duplicate = json.loads(json.dumps(first))
        duplicate["id"] = "news-duplicate-fixture"
        self.assertEqual(len(news.dedupe_candidates([first, duplicate])), 1)
        active = news.active_items(self.published["items"], datetime(2026, 10, 20, tzinfo=UTC))
        self.assertLess(len(active), len(self.published["items"]))
        self.assertTrue(all(news._parse_datetime(item["expiresAt"], "expires") > datetime(2026, 10, 20, tzinfo=UTC) for item in active))

    def test_documentation_updates_use_stable_entry_ids_not_recurring_titles(self):
        original = next(item for item in self.published["items"] if item["source"]["kind"] == "official-doc-update")
        duplicate = json.loads(json.dumps(original))
        duplicate["id"] = "news-documentation-duplicate-fixture"
        duplicate["source"]["url"] = duplicate["source"]["url"] + "?version=duplicate"
        self.assertEqual(len(news.dedupe_candidates([original, duplicate])), 2)
        same_entry = json.loads(json.dumps(original))
        self.assertEqual(len(news.dedupe_candidates([original, same_entry])), 1)

    def test_pruning_does_not_refresh_editorial_clock(self):
        source_by_id = {source["id"]: source for source in self.config["sources"]}
        pruned, removed = news.prune_published(
            json.loads(json.dumps(self.published)),
            self.config,
            source_by_id,
            set(self.aliases),
            datetime(2026, 10, 20, tzinfo=UTC),
        )
        self.assertGreater(removed, 0)
        self.assertEqual(pruned["generatedAt"], self.published["generatedAt"])
        self.assertEqual(pruned["snapshotExpiresAt"], self.published["snapshotExpiresAt"])

    def test_automated_mapping_cannot_be_promoted_as_reviewed(self):
        candidate = news.normalize_candidate(
            self.entry(title="CVE-2026-99999 affects AWS Systems Manager SSM Agent"),
            self.sources["aws-security-bulletins"],
            self.config,
            NOW,
        )
        self.assertIsNotNone(candidate)
        candidate["whyItMatters"] = "A reviewer must replace automation with evidence before this becomes public."
        candidate["checks"] = ["Confirm the affected component against the original bulletin."]
        snapshot = news._snapshot([candidate], NOW, self.config["policy"], "review-only")
        source_by_id = {source["id"]: source for source in self.config["sources"]}
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "candidates.json"
            path.write_text(json.dumps(snapshot), encoding="utf-8")
            with self.assertRaisesRegex(news.NewsError, "replace automated provenance"):
                news._promote(
                    [candidate["id"]],
                    path,
                    self.published,
                    self.config,
                    source_by_id,
                    set(self.aliases),
                    NOW,
                )

    def test_candidate_clock_alone_does_not_rewrite_review_queue(self):
        original = news._snapshot([], NOW, self.config["policy"], "review-only")
        later = news._snapshot(
            [],
            datetime(2026, 9, 13, 12, 0, tzinfo=UTC),
            self.config["policy"],
            "review-only",
        )
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "candidates.json"
            path.write_text(json.dumps(original), encoding="utf-8")
            changed = news._write_json_if_changed(path, later, ignore_generated_at=True)
            self.assertFalse(changed)
            self.assertEqual(json.loads(path.read_text(encoding="utf-8")), original)


if __name__ == "__main__":
    unittest.main()
