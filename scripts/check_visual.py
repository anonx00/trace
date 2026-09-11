"""Graph legibility, relationship focus and shared reader navigation."""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL = 'http://127.0.0.1:4173/'
OUT = Path(__file__).resolve().parents[1] / 'artifacts'
OUT.mkdir(exist_ok=True)

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL, wait_until='networkidle')
    page.locator('[data-detail="services"]').click()
    expect(page.locator('.atlas-service-card')).to_have_count(40)
    assert page.locator('.atlas-service-node').evaluate_all("""nodes => nodes.every(n => {
      const text = n.querySelector('text').getBBox(), card = n.querySelector('rect').getBBox();
      return text.x >= card.x && text.x + text.width < card.x + card.width - 26;
    })"""), 'Service labels must fit inside their cards'
    node = page.locator('[data-service-id="iam"]')
    node.focus()
    page.keyboard.press('ArrowDown')
    expect(node).not_to_be_focused()
    page.locator('[data-edge="0"]').focus()
    expect(page.locator('.atlas-service-node.atlas-related')).to_have_count(2)
    page.locator('.atlas-stage').scroll_into_view_if_needed()
    page.mouse.move(0, 0)
    page.screenshot(path=str(OUT / 'visual-atlas-services.png'))

    for width in [1440, 1024, 768, 390, 320]:
        page.set_viewport_size({'width': width, 'height': 1000})
        page.goto(URL + '#/service/s3', wait_until='networkidle')
        expect(page.locator('[data-nav="map"]')).to_have_attribute('aria-current', 'page')
        graph = page.locator('.world-svg')
        nodes = page.locator('.mind-graph-node')
        page.mouse.move(0, 0)
        assert nodes.evaluate_all("""nodes => nodes.every(n => {
          const card = n.getBoundingClientRect(), svg = n.closest('svg').getBoundingClientRect();
          const copy = n.querySelector('.mind-node-copy');
          const title = copy.querySelector('h3');
          return card.left >= svg.left - 1 && card.right <= svg.right + 1 &&
            card.top >= svg.top - 1 && card.bottom <= svg.bottom + 1 &&
            copy.scrollHeight <= Number(copy.parentElement.getAttribute('height')) + 1 &&
            parseFloat(getComputedStyle(title).fontSize) * n.getScreenCTM().a >= 12;
        })"""), ('Clipped or illegible node', width)
        assert nodes.evaluate_all("""nodes => nodes.every(n => {
          const svg = n.closest('svg'), edge = svg.querySelector('#mind-edge-' + n.dataset.edgeIndex);
          const hub = svg.querySelector('.mind-hub').transform.baseVal.consolidate().matrix;
          const start = edge.getPointAtLength(0), end = edge.getPointAtLength(edge.getTotalLength());
          const distance = p => Math.hypot(p.x - hub.e, p.y - hub.f);
          return n.dataset.incoming === 'true' ? distance(end) < distance(start) : distance(start) < distance(end);
        })"""), ('Connection direction changed', width)
        nodes.first.focus()
        expect(page.locator('.mind-link.is-node-active')).to_have_count(1)
        expect(page.locator('#graph-tooltip')).to_have_css('opacity', '0')
        page.keyboard.press('ArrowDown')
        expect(nodes.nth(1)).to_be_focused()
        page.keyboard.press('End')
        expect(nodes.last).to_be_focused()
        page.keyboard.press('Escape')
        expect(graph).to_be_focused()
        expect(page.locator('.mind-link.is-node-active')).to_have_count(0)
        page.locator('.canvas-wrap').scroll_into_view_if_needed()
        page.mouse.move(0, 0)
        if width in [1440, 390]:
            page.screenshot(path=str(OUT / f'visual-graph-{width}.png'))
        page.locator('.graph-reading-hint button').click()
        expect(page.locator('.mind-ledger')).to_be_focused()
        page.get_by_role('tab', name='Intel', exact=True).focus()
        page.keyboard.press('End')
        expect(page.get_by_role('tab', name='AWS docs', exact=True)).to_be_focused()
        expect(page.locator('[role="tab"][tabindex="0"]')).to_have_count(1)
        page.keyboard.press('Home')
        expect(page.get_by_role('tab', name='Intel', exact=True)).to_be_focused()
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), width

    page.set_viewport_size({'width': 1440, 'height': 1000})
    page.goto(URL + '#/sources', wait_until='networkidle')
    expect(page.locator('[data-nav="sources"]')).to_have_attribute('aria-current', 'page')
    page.screenshot(path=str(OUT / 'visual-sources.png'))
    page.get_by_role('button', name='AWS documentation', exact=True).click()
    expect(page.locator('.aws-source-index')).to_be_focused()
    page.goto(URL + '#/library', wait_until='networkidle')
    page.locator('[data-filter="data"]').click()
    expect(page.locator('[data-filter="data"]')).to_have_attribute('aria-pressed', 'true')
    expect(page.locator('[data-filter="all"]')).to_have_attribute('aria-pressed', 'false')
    page.screenshot(path=str(OUT / 'visual-library.png'))
    page.goto(URL + '#/scenario/web-to-role', wait_until='networkidle')
    expect(page.locator('.story-stop[tabindex="0"]')).to_have_count(1)
    page.locator('.story-stop[tabindex="0"]').focus()
    page.keyboard.press('End')
    expect(page.locator('.story-stop').last).to_have_attribute('aria-current', 'step')
    expect(page.locator('.story-stop[tabindex="0"]')).to_have_count(1)
    page.locator('.story-player').scroll_into_view_if_needed()
    page.screenshot(path=str(OUT / 'visual-scenario.png'))
    assert not errors, errors
    print('Graph legibility at five widths, keyboard focus, shared navigation: passed')
    browser.close()
