"""Browser checks for reviewed news cards, stale hiding, and fail-open behavior."""

from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path

from playwright.sync_api import Route, expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
URL = "http://127.0.0.1:4173/"
OUT = ROOT / "artifacts"
OUT.mkdir(exist_ok=True)
UTC = timezone.utc


def iso(value: datetime) -> str:
    return value.astimezone(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def fixture_snapshot(*, stale: bool = False) -> dict:
    now = datetime.now(UTC).replace(microsecond=0)
    generated = now - timedelta(hours=2)
    snapshot_expires = now - timedelta(minutes=1) if stale else now + timedelta(days=10)

    def item(index: int, *, status: str = "approved", expired: bool = False) -> dict:
        title = (
            "<img src=x onerror=window.__traceNewsXss=1> literal markup"
            if index == 0
            else f"CVE-2099-000{index} reviewed Systems Manager signal"
        )
        published = now - timedelta(hours=index + 3)
        return {
            "id": f"news-browser-fixture-{status}-{index}",
            "title": title,
            "summary": "A deterministic browser fixture for AWS Systems Manager and IAM.",
            "whyItMatters": "It verifies that reviewed time-sensitive context reaches only explicitly mapped nodes.",
            "checks": [
                "Confirm the source event in CloudTrail before drawing a conclusion.",
                "Validate the affected component and version in the owned environment.",
            ],
            "services": ["systemsmanager", "iam"],
            "mapping": [
                {
                    "service": "systemsmanager",
                    "method": "editorial-review",
                    "term": "AWS Systems Manager",
                    "basis": "The reviewed fixture explicitly names the Systems Manager component.",
                },
                {
                    "service": "iam",
                    "method": "editorial-review",
                    "term": "AWS IAM",
                    "basis": "The reviewed fixture explicitly identifies IAM identity impact.",
                },
            ],
            "publishedAt": iso(published),
            "expiresAt": iso(now - timedelta(minutes=1) if expired else now + timedelta(days=7)),
            "source": {
                "publisher": "AWS",
                "kind": "official-bulletin",
                "url": f"https://aws.amazon.com/security/security-bulletins/browser-fixture-{index}/",
            },
            "references": [
                {
                    "label": "Primary AWS guidance",
                    "url": "https://docs.aws.amazon.com/systems-manager/latest/userguide/security.html",
                },
                {
                    "label": "This extra reference must not render",
                    "url": "javascript:alert(1)",
                },
            ],
            "review": {"status": status, "reviewedAt": iso(now - timedelta(hours=1))},
        }

    items = [item(index) for index in range(4)]
    items.extend([item(10, status="pending"), item(11, expired=True)])
    return {
        "schemaVersion": 1,
        "publication": "published",
        "generatedAt": iso(generated),
        "snapshotExpiresAt": iso(snapshot_expires),
        "items": items,
    }


def fulfill_json(payload: dict):
    def handler(route: Route) -> None:
        route.fulfill(status=200, content_type="application/json", json=payload)

    return handler


def delayed_news_context(browser, payload: dict):
    context = browser.new_context(viewport={"width": 1200, "height": 900}, reduced_motion="reduce")
    script = """
    (payload => {
      const nativeFetch = window.fetch.bind(window);
      window.fetch = (input, init) => {
        const url = input instanceof Request ? input.url : String(input);
        if (url.includes('/generated/news.json')) {
          return new Promise(resolve => {
            window.__releaseTraceNews = () => resolve(new Response(JSON.stringify(payload), {
              status: 200,
              headers: {'Content-Type': 'application/json'}
            }));
          });
        }
        return nativeFetch(input, init);
      };
    })(%s);
    """ % json.dumps(payload)
    context.add_init_script(script=script)
    return context


with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)

    context = browser.new_context(viewport={"width": 1440, "height": 1000}, reduced_motion="reduce")
    context.route("**/generated/news.json", fulfill_json(fixture_snapshot()))
    page = context.new_page()
    errors: list[str] = []
    page.on("pageerror", lambda error: errors.append(str(error)))

    page.goto(URL + "#/service/systemsmanager", wait_until="networkidle")
    expect(page.locator(".inspector h2")).to_have_text("AWS Systems Manager")
    expect(page.locator(".news-intel")).to_be_visible()
    expect(page.locator(".news-intel-card")).to_have_count(3)
    expect(page.locator(".news-intel-card").first).to_contain_text("literal markup")
    expect(page.locator(".news-intel-context").first).to_contain_text(
        "explicitly names the Systems Manager component"
    )
    assert page.locator(".news-intel-card img").count() == 0
    assert page.evaluate("window.__traceNewsXss") is None
    assert page.locator(".news-intel-card", has_text="pending").count() == 0
    for card in page.locator(".news-intel-card").all():
        assert card.locator("a").count() <= 2
        for link in card.locator("a").all():
            assert (link.get_attribute("href") or "").startswith("https://")
            assert link.get_attribute("rel") == "noopener noreferrer"
    page.locator(".news-intel").scroll_into_view_if_needed()
    page.screenshot(path=str(OUT / "news-intel-systemsmanager.png"), full_page=True)

    page.goto(URL + "#/service/iam", wait_until="networkidle")
    expect(page.locator(".news-intel-context").first).to_contain_text("explicitly identifies IAM identity impact")
    expect(page.locator(".news-intel-context").first).not_to_contain_text("Systems Manager component")

    page.goto(URL + "#/service/s3", wait_until="networkidle")
    expect(page.locator(".news-intel")).to_have_count(0)

    page.goto(URL + "#/library", wait_until="networkidle")
    page.locator("#library-search").fill("CVE-2099-0001")
    assert set(page.locator(".library-card h2").all_text_contents()) == {"AWS IAM", "AWS Systems Manager"}

    page.locator(".search-launch").click()
    page.locator("#search-input").fill("CVE-2099-0001")
    expect(page.locator(".search-result", has_text="Time-sensitive intel").first).to_be_visible()
    page.locator("#search-close").click()

    page.goto(URL + "#/sources", wait_until="networkidle")
    expect(page.locator(".source-section-nav button")).to_have_count(5)
    expect(page.locator(".source-section-nav button").nth(3)).to_have_text("Current intel")
    expect(page.locator(".news-source-index")).to_be_visible()
    expect(page.locator(".news-source-grid a")).to_have_count(4)
    expect(page.locator(".news-source-index")).not_to_contain_text("pending")

    page.set_viewport_size({"width": 320, "height": 900})
    page.goto(URL + "#/service/systemsmanager", wait_until="networkidle")
    expect(page.locator(".news-intel-card")).to_have_count(3)
    assert page.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
    assert not errors, errors
    context.close()

    delayed_service_context = delayed_news_context(browser, fixture_snapshot())
    delayed_service_page = delayed_service_context.new_page()
    delayed_service_page.goto(URL + "#/service/systemsmanager", wait_until="networkidle")
    delayed_service_page.wait_for_function("typeof window.__releaseTraceNews === 'function'")
    research_link = delayed_service_page.locator(".service-research-links a").first
    research_link.focus()
    delayed_service_page.evaluate("window.__releaseTraceNews()")
    expect(delayed_service_page.locator(".news-intel-card")).to_have_count(3)
    expect(research_link).to_be_focused()
    delayed_service_context.close()

    delayed_source_context = delayed_news_context(browser, fixture_snapshot())
    delayed_source_page = delayed_source_context.new_page()
    delayed_source_page.goto(URL + "#/sources", wait_until="networkidle")
    delayed_source_page.wait_for_function("typeof window.__releaseTraceNews === 'function'")
    current_button = delayed_source_page.locator(".source-section-nav button").nth(3)
    current_button.focus()
    delayed_source_page.evaluate("window.__releaseTraceNews()")
    expect(delayed_source_page.locator(".news-source-grid a")).to_have_count(4)
    expect(current_button).to_be_focused()
    current_button.click()
    expect(delayed_source_page.locator(".news-source-index")).to_be_focused()
    delayed_source_context.close()

    delayed_library_context = delayed_news_context(browser, fixture_snapshot())
    delayed_library_page = delayed_library_context.new_page()
    delayed_library_page.goto(URL + "#/library", wait_until="networkidle")
    delayed_library_page.wait_for_function("typeof window.__releaseTraceNews === 'function'")
    library_search = delayed_library_page.locator("#library-search")
    library_search.fill("CVE-2099-0001   ")
    expect(delayed_library_page.locator(".library-card")).to_have_count(0)
    delayed_library_page.evaluate("window.__releaseTraceNews()")
    expect(delayed_library_page.locator(".library-card")).to_have_count(2)
    expect(library_search).to_be_focused()
    delayed_library_context.close()

    stale_context = browser.new_context()
    stale_context.route("**/generated/news.json", fulfill_json(fixture_snapshot(stale=True)))
    stale_page = stale_context.new_page()
    stale_page.goto(URL + "#/service/systemsmanager", wait_until="networkidle")
    expect(stale_page.locator(".news-intel")).to_have_count(0)
    stale_page.goto(URL + "#/sources", wait_until="networkidle")
    expect(stale_page.locator(".news-source-index")).to_contain_text("expired")
    expect(stale_page.locator(".news-source-grid")).to_have_count(0)
    stale_context.close()

    broken_context = browser.new_context()
    broken_context.route(
        "**/generated/news.json",
        lambda route: route.fulfill(status=200, content_type="application/json", body="{"),
    )
    broken_page = broken_context.new_page()
    broken_errors: list[str] = []
    broken_page.on("pageerror", lambda error: broken_errors.append(str(error)))
    broken_page.goto(URL + "#/service/systemsmanager", wait_until="networkidle")
    expect(broken_page.locator(".inspector h2")).to_have_text("AWS Systems Manager")
    expect(broken_page.locator(".news-intel")).to_have_count(0)
    broken_page.goto(URL + "#/sources", wait_until="networkidle")
    expect(broken_page.locator(".news-source-index")).to_contain_text("unavailable")
    assert not broken_errors, broken_errors
    broken_context.close()

    browser.close()
    print("News cards, search, responsive layout, stale hiding, escaping, and fail-open behavior passed.")
