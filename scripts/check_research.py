"""Research discovery, coverage truthfulness, and responsive reading flows."""
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
    page.goto(URL + '#/coverage', wait_until='networkidle')
    expect(page.locator('[data-nav="coverage"]')).to_have_attribute('aria-current', 'page')
    expect(page.locator('[data-coverage-service]')).to_have_count(40)
    data = page.evaluate("""async () => {
      const [{services, domains}, {scenarios}, {communityDetections}, {hacktricksCoverageGaps}] = await Promise.all([
        import('./catalog.js'), import('./scenario-data.js'), import('./community-detections.js'), import('./hacktricks-data.js')
      ]);
      return {services, domains, scenarios, rules: communityDetections, researchGaps: hacktricksCoverageGaps};
    }""")
    covered = {service for rule in data['rules'] for service in rule['services']}
    for service in data['services']:
        row = page.locator(f'[data-coverage-service="{service["id"]}"]')
        count = sum(service['id'] in rule['services'] for rule in data['rules'])
        expect(row.locator('td').nth(3)).to_have_text(str(count) if count else '—')
    page.screenshot(path=str(OUT / 'research-coverage-desktop.png'))
    page.locator('#coverage-filter').select_option('rules')
    expect(page.locator('[data-coverage-service]')).to_have_count(len(data['services']) - len(covered))
    page.locator('[data-coverage-domain="identity"]').click()
    identity = next(domain['services'] for domain in data['domains'] if domain['id'] == 'identity')
    expect(page.locator('[data-coverage-service]')).to_have_count(sum(s not in covered for s in identity))
    page.locator('.coverage-reset').click()
    page.locator('#coverage-filter').select_option('research')
    assert set(page.locator('[data-coverage-service]').evaluate_all('(rows)=>rows.map(row=>row.dataset.coverageService)')) == set(data['researchGaps'])
    page.locator('#coverage-search').fill('not-a-service')
    expect(page.locator('.coverage-empty')).to_be_visible()
    page.locator('.coverage-reset').click()
    expect(page.locator('[data-coverage-service]')).to_have_count(40)

    page.goto(URL + '#/paths', wait_until='networkidle')
    expect(page.locator('.reader-path-card')).to_have_count(len(data['scenarios']))
    page.locator('#path-service').select_option('s3')
    page.locator('#path-coverage').select_option('gaps')
    expected = [s for s in data['scenarios'] if 's3' in s['services'] and any(stage['service'] not in covered for stage in s['stages'])]
    expect(page.locator('.reader-path-card')).to_have_count(len(expected))
    page.locator('#path-sort').select_option('title')
    titles = page.locator('.reader-path-card h2').all_text_contents()
    assert titles == sorted(titles, key=str.lower)
    page.locator('[data-path-layout="compact"]').click()
    expect(page.locator('.scenario-grid')).to_have_class('scenario-grid is-compact')
    page.screenshot(path=str(OUT / 'research-paths-compact.png'))
    page.locator('#path-search').fill('no-such-investigation')
    expect(page.locator('.path-empty')).to_be_visible()
    page.locator('.path-reset').click()
    expect(page.locator('#path-service')).to_have_value('all')
    expect(page.locator('#path-coverage')).to_have_value('all')
    expect(page.locator('.reader-path-card')).to_have_count(len(data['scenarios']))
    page.locator('[data-path-layout="cards"]').click()
    page.screenshot(path=str(OUT / 'research-paths-desktop.png'))
    page.locator('.reader-path-card').first.scroll_into_view_if_needed()
    page.screenshot(path=str(OUT / 'research-path-cards.png'))

    scenario = data['scenarios'][0]
    page.locator('.search-launch').click()
    page.locator('#search-input').fill(scenario['title'])
    result = page.locator(f'#search-results a[href="#/scenario/{scenario["id"]}"]')
    expect(result).to_be_visible()
    result.click()
    expect(page.locator('#search-dialog')).not_to_be_visible()
    expect(page.locator('.scenario-header h1')).to_have_text(scenario['title'])
    page.locator('.story-overview-toggle').click()
    expect(page.locator('.story-evidence-grid article')).to_have_count(len(scenario['stages']))
    for i, stage in enumerate(scenario['stages']):
        card = page.locator('.story-evidence-grid article').nth(i)
        expect(card.locator(':scope > p')).to_have_text(stage['signal'])
        card.locator('.story-telemetry summary').click()
        expect(card.locator('.story-telemetry ul')).to_be_visible()
    page.locator('.story-overview').scroll_into_view_if_needed()
    page.screenshot(path=str(OUT / 'research-evidence-desktop.png'))
    page.locator('[data-jump-stage="1"]').click()
    expect(page.locator('[data-stage="1"]')).to_be_focused()
    page.keyboard.press('End')
    expect(page.locator('.story-stop').last).to_have_attribute('aria-current', 'step')

    for width in [1440, 1024, 768, 390, 320]:
        page.set_viewport_size({'width': width, 'height': 1000})
        for route in ['#/coverage', '#/paths', '#/scenario/' + scenario['id'], '#/']:
            page.goto(URL + route, wait_until='networkidle')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), (width, route, page.evaluate("""() => [...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1).slice(0,12).map(el=>({tag:el.tagName,cls:el.className,right:el.getBoundingClientRect().right}))"""))
            if width == 390:
                name = route.split('/')[1] or 'home'
                page.screenshot(path=str(OUT / f'research-{name}-mobile.png'))

    # Missing source data must remain unknown through filtering and reload.
    page.route('**/generated/docs.json', lambda route: route.abort())
    page.goto(URL + '#/coverage', wait_until='networkidle')
    page.reload(wait_until='networkidle')
    expect(page.locator('.coverage-unavailable')).to_be_visible()
    expect(page.locator('.coverage-value.unknown')).to_have_count(40)
    page.locator('#coverage-filter').select_option('docs')
    expect(page.locator('[data-coverage-service]')).to_have_count(0)
    assert not errors, errors
    print('Research UI passed: counts, combined filters, search, evidence, keyboard, 20 layouts, and unavailable docs.')
    browser.close()
