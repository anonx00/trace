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

    # The homepage credibility metrics remain visible, linked navigation—not
    # decorative counters—and map to the four advertised collections.
    metrics = page.locator('.atlas-stats a')
    expect(metrics).to_have_count(4)
    assert metrics.evaluate_all("""links => links.every(link =>
      link.getAttribute('href')?.startsWith('#/') &&
      link.querySelector('b')?.textContent.trim() &&
      link.querySelector('span')?.textContent.trim()
    )"""), 'Homepage metrics must be complete internal links'
    assert metrics.evaluate_all("links => links.map(link => link.getAttribute('href'))") == [
        '#/library', '#/paths', '#/sources', '#/sources'
    ]
    metrics.first.focus()
    expect(metrics.first).to_have_css('outline-style', 'solid')
    expect(metrics.first).to_have_css('outline-width', '2px')

    page.locator('[data-detail="services"]').click()
    expect(page.locator('.atlas-service-card')).to_have_count(40)
    expect(page.locator('.atlas-service-degree')).to_have_count(40)
    expected_degrees = page.evaluate("""async () => {
      const {services, connections} = await import('./catalog.js');
      return Object.fromEntries(services.map(service => [
        service.id,
        connections.filter(link => link.from === service.id || link.to === service.id).length
      ]));
    }""")
    actual_degrees = page.locator('.atlas-service-node').evaluate_all("""nodes => Object.fromEntries(
      nodes.map(node => [node.dataset.serviceId, Number(node.querySelector('.atlas-service-degree').textContent)])
    )""")
    assert actual_degrees == expected_degrees, 'Every service node must show its sourced-link degree'
    assert page.locator('.atlas-service-node').evaluate_all("""nodes => nodes.every(n => {
      const text = n.querySelector('text').getBBox(), card = n.querySelector('rect').getBBox();
      return text.x >= card.x && text.x + text.width < card.x + card.width - 26;
    })"""), 'Service labels must fit inside their cards'

    # Data has sourced links to KMS. Domain focus must retain that one-hop
    # endpoint instead of leaving a bright edge terminating at a muted node.
    page.locator('[data-scope="data"]').click()
    kms = page.locator('[data-service-id="kms"]')
    assert 'scope-muted' not in (kms.get_attribute('class') or '').split()
    expect(kms).to_have_css('opacity', '1')
    node = page.locator('[data-service-id="iam"]')
    node.focus()
    page.keyboard.press('ArrowDown')
    expect(node).not_to_be_focused()
    page.locator('[data-edge="0"]').focus()
    expect(page.locator('.atlas-service-node.atlas-related')).to_have_count(2)
    page.locator('.atlas-stage').scroll_into_view_if_needed()
    page.mouse.move(0, 0)
    expect(page.locator('.atlas-service-node.atlas-related')).to_have_count(2)
    page.locator('#atlas-motion').focus()
    expect(page.locator('.atlas-service-node.atlas-related')).to_have_count(0)
    page.locator('.atlas-edge:not(.scope-muted) .atlas-edge-hit').first.hover(force=True)
    expect(page.locator('.atlas-service-node.atlas-related')).to_have_count(2)
    page.mouse.move(0, 0)
    expect(page.locator('.atlas-service-node.atlas-related')).to_have_count(0)
    page.screenshot(path=str(OUT / 'visual-atlas-services.png'))

    # Stories owns the existing atlas motion control and keeps the toolbar and
    # preview synchronized for keyboard-driven stage changes.
    first_scenario = page.evaluate("async () => (await import('./scenario-data.js')).scenarios[0]")
    page.locator('[data-detail="story"]').click()
    expect(page.locator('#atlas-motion')).to_have_attribute(
        'aria-label', 'Resume investigation animation'
    )
    expect(page.locator('#atlas-map-context')).to_have_text(
        f"{len(first_scenario['stages'])} stages · {first_scenario['title']}"
    )
    expect(page.locator('#atlas-map-context')).not_to_contain_text('Eight domains')
    expect(page.locator('.atlas-workspace #atlas-motion')).to_be_visible()
    expect(page.locator('.atlas-home-story .story-motion')).to_have_count(0)
    page.locator('.atlas-home-story [data-stage="0"]').focus()
    page.keyboard.press('End')
    last_index = len(first_scenario['stages']) - 1
    last_service = page.evaluate("""async ({scenarioId, stageIndex}) => {
      const [{scenarioById}, {serviceById}] = await Promise.all([
        import('./scenario-data.js'), import('./catalog.js')
      ]);
      return serviceById(scenarioById(scenarioId).stages[stageIndex].service).name;
    }""", {'scenarioId': first_scenario['id'], 'stageIndex': last_index})
    expect(page.locator('.atlas-home-story [aria-current="step"]')).to_have_attribute(
        'data-stage', str(last_index)
    )
    expect(page.locator('.atlas-preview-top span')).to_have_text(
        f'CURRENT STAGE / {last_index + 1:02d}'
    )
    expect(page.locator('.atlas-preview h2')).to_have_text(last_service)

    page.locator('[data-detail="overview"]').click()
    expect(page.locator('.atlas-preview-top span')).to_contain_text('DOMAIN /')
    expect(page.locator('.atlas-preview h2')).to_have_text('Data protection')

    # The compact overview keeps both the evidence counters and the visual
    # domain routes rather than degrading into eight disconnected nodes.
    page.set_viewport_size({'width': 390, 'height': 1000})
    page.goto(URL, wait_until='networkidle')
    expect(page.locator('.atlas-domain-route')).to_have_count(8)
    assert page.locator('.atlas-domain-route').evaluate_all(
        "routes => routes.every(route => getComputedStyle(route).display !== 'none')"
    ), 'Mobile overview must render all eight domain connectors'
    expect(page.locator('.atlas-stats a')).to_have_count(4)
    assert page.locator('.atlas-stats a').evaluate_all(
        "links => links.every(link => link.getClientRects().length > 0)"
    ), 'All four homepage metrics must remain visible on mobile'

    page.set_viewport_size({'width': 1024, 'height': 1000})
    page.goto(URL, wait_until='networkidle')
    page.locator('[data-detail="services"]').click()
    page.locator('[data-scope="data"]').click()
    expect(page.locator('.atlas-service-index')).to_be_visible()
    expect(page.locator('.atlas-service-index section').first.locator('h3 span')).to_have_text(
        'Data protection'
    )
    expect(page.locator('.atlas-service-index a[href="#/service/kms"]')).to_be_visible()
    expected_neighbor_domains = page.evaluate("""async () => {
      const {domains, connections} = await import('./catalog.js');
      const core = new Set(domains.find(domain => domain.id === 'data').services);
      const scoped = new Set(core);
      connections.filter(link => core.has(link.from) || core.has(link.to))
        .forEach(link => { scoped.add(link.from); scoped.add(link.to); });
      return domains.filter(domain => domain.id !== 'data' &&
        domain.services.some(service => scoped.has(service))).length;
    }""")
    expect(page.locator('.atlas-neighbor-section')).to_have_count(expected_neighbor_domains)

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
