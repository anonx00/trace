"""Verify newcomer learning, recovery into research, and responsive navigation."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL = os.environ.get('TRACE_TEST_URL', 'http://127.0.0.1:4173/').rstrip('/') + '/'
OUT = Path(__file__).resolve().parents[1] / 'artifacts'
OUT.mkdir(exist_ok=True)

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(URL, wait_until='networkidle')
    expect(page.locator('h1')).to_have_count(1)
    expect(page.locator('.thread-tile')).to_have_count(8)
    expect(page.locator('.thread-art')).to_have_class('thread-art is-paused')
    page.screenshot(path=str(OUT / 'first-trace-desktop.png'))
    page.locator('[data-thread-start]').click()
    expect(page.locator('#first-lesson-title')).to_be_focused()
    expect(page.locator('[data-lesson-back]')).to_be_disabled()
    for step in ['iam', 'sts', 's3', 'cloudtrail']:
        expect(page.locator(f'[data-lesson="{step}"]')).to_have_attribute('aria-current', 'step')
        page.locator('.lesson-quiz summary').click()
        expect(page.locator('.lesson-quiz')).to_have_attribute('open', '')
        assert page.locator('.lesson-sources a').first.get_attribute('href').startswith('https://docs.aws.amazon.com/')
        if step != 'cloudtrail':
            page.locator('[data-lesson-next]').click()
            expect(page.locator('.lesson-content h3')).to_be_focused()
    assert page.url.endswith('learn=cloudtrail')
    page.reload(wait_until='networkidle')
    expect(page.locator('[data-lesson="cloudtrail"]')).to_have_attribute('aria-current', 'step')
    page.locator('.lesson-controls a').click()
    expect(page.locator('#tab-evidence')).to_have_attribute('aria-selected', 'true')
    page.go_back(wait_until='networkidle')
    expect(page.locator('[data-lesson="cloudtrail"]')).to_have_attribute('aria-current', 'step')
    page.locator('[data-lesson="iam"]').focus()
    page.keyboard.press('Enter')
    expect(page.locator('[data-lesson="iam"]')).to_have_attribute('aria-current', 'step')
    page.locator('[data-thread-map]').first.click()
    expect(page.locator('#explore-atlas')).to_be_focused()
    page.locator('[data-detail="services"]').click()
    expect(page.locator('.atlas-service-node')).to_have_count(40)
    page.locator('#atlas-find').click()
    expect(page.locator('#search-dialog')).to_be_visible()
    page.keyboard.press('Escape')
    for width in [1440, 1024, 768, 390, 320]:
        page.set_viewport_size({'width': width, 'height': 900})
        page.goto(URL, wait_until='networkidle')
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), f'Horizontal overflow at {width}'
        if width<=650:
            assert page.locator('.primary-nav a').evaluate_all('''links=>links.every(a=>{const r=a.getBoundingClientRect(),h=a.closest('.topbar').getBoundingClientRect();return r.top>=h.top&&r.bottom<=h.bottom&&r.left>=h.left&&r.right<=h.right})'''), 'Mobile navigation must fit inside its header'
        page.locator('[data-thread-start]').click()
        page.locator('[data-lesson="s3"]').click()
        expect(page.locator('.lesson-content h3')).to_have_text('Look at the resource boundary.')
        if width == 390:
            page.screenshot(path=str(OUT / 'first-trace-lesson-mobile.png'))
            page.evaluate('scrollTo(0,0)')
            page.screenshot(path=str(OUT / 'first-trace-mobile.png'))
    page.goto(URL + '#/?learn=invalid', wait_until='networkidle')
    expect(page.locator('[data-lesson="iam"]')).to_have_attribute('aria-current', 'step')
    page.locator('.thread-tile[href="#/service/iam"]').focus()
    page.keyboard.press('Enter')
    expect(page.locator('.service-primer')).to_be_visible()
    page.locator('.service-primer a[href$="tab=evidence"]').click()
    expect(page.locator('#tab-evidence')).to_have_attribute('aria-selected', 'true')
    page.emulate_media(reduced_motion='no-preference')
    page.goto(URL, wait_until='networkidle')
    line=page.locator('.thread-signal').first
    offset=lambda: line.evaluate('e=>getComputedStyle(e).strokeDashoffset')
    before=offset()
    page.wait_for_timeout(150)
    assert offset()!=before, 'Illustration must animate with motion enabled'
    page.locator('.thread-motion').click()
    frozen=offset()
    page.wait_for_timeout(150)
    assert offset()==frozen, 'Pause must stop illustration motion'
    page.emulate_media(reduced_motion='reduce')
    expect(page.locator('.thread-motion')).to_be_disabled()
    assert not errors, errors
    browser.close()
    print('First trace: lessons, source links, keyboard controls, deep links, research navigation, and five viewport widths passed.')
