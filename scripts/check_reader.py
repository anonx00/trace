"""Reader navigation, source-data fidelity and responsive visual checks."""
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
URL = 'http://127.0.0.1:4173/'
OUT = ROOT / 'artifacts'
OUT.mkdir(exist_ok=True)

with sync_playwright() as pw:
    browser = pw.chromium.launch()
    page = browser.new_page(viewport={'width':1440,'height':1000}, reduced_motion='reduce')
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto(URL+'#/paths', wait_until='networkidle')
    scenarios = page.evaluate("async()=> (await import('./scenario-data.js')).scenarios")
    expect(page.locator('.scenario-card')).to_have_count(len(scenarios))
    for scenario in scenarios:
        card = page.locator(f'.reader-path-card[href="#/scenario/{scenario["id"]}"]')
        expect(card.locator('.path-card-kicker')).to_have_text(scenario['kicker'])
        expect(card.locator('.reader-mini-chain li')).to_have_count(len(scenario['stages']))
        expect(card.locator('.reader-chain-node')).to_have_count(len(scenario['stages']))
    page.locator('#path-search').fill('T1552.005')
    expected = sum('T1552.005' in s['mitre'] for s in scenarios)
    expect(page.locator('.scenario-card')).to_have_count(expected)
    page.locator('#path-search').fill('not-a-real-scenario')
    expect(page.locator('.path-empty')).to_be_visible()
    page.locator('.path-reset').click()
    expect(page.locator('.scenario-card')).to_have_count(len(scenarios))
    page.locator('[data-path-domain="runtime"]').click()
    runtime_ids = {'ec2','lambda','ecs','eks','fargate'}
    expect(page.locator('.scenario-card')).to_have_count(sum(bool(runtime_ids.intersection(s['services'])) for s in scenarios))
    page.locator('[data-path-domain="all"]').click()
    page.screenshot(path=str(OUT/'reader-paths.png'))

    for scenario in scenarios:
        page.goto(URL+'#/scenario/'+scenario['id'], wait_until='domcontentloaded')
        stage_count = len(scenario['stages'])
        expect(page.locator('.story-stop')).to_have_count(stage_count)
        expect(page.locator('.story-stage-role')).to_have_count(stage_count)
        expect(page.locator('.story-stage-role').first).to_have_text('START')
        expect(page.locator('.story-stage-role').last).to_have_text('OUTCOME')
        expect(page.locator('.story-progress-markers i')).to_have_count(stage_count)
        expect(page.locator('.story-progress')).to_have_attribute('aria-valuemax', str(stage_count))
        expect(page.locator('.story-progress')).to_have_attribute('aria-valuenow', '1')
        expect(page.locator('.story-stop.is-current')).to_have_count(1)
        expect(page.locator('.story-stop.is-complete')).to_have_count(0)
        expect(page.locator('.story-stop.is-upcoming')).to_have_count(stage_count - 1)
        expect(page.locator('.story-progress-markers i.is-current')).to_have_count(1)
        expect(page.locator('.story-progress-markers i.is-complete')).to_have_count(0)
        for i, stage in enumerate(scenario['stages']):
            page.locator(f'[data-stage="{i}"]').click()
            expect(page.locator('.story-context h3')).to_have_text(stage['title'])
            expect(page.locator('.story-context>p')).to_have_text(stage['detail'])
            expect(page.locator('.story-signal>p')).to_have_text(stage['signal'])
            expect(page.locator('.story-progress')).to_have_attribute('aria-valuenow', str(i + 1))
            expect(page.locator('.story-stop.is-current')).to_have_count(1)
            expect(page.locator('.story-stop.is-complete')).to_have_count(i)
            expect(page.locator('.story-stop.is-upcoming')).to_have_count(stage_count - i - 1)
            expect(page.locator('.story-progress-markers i.is-current')).to_have_count(1)
            expect(page.locator('.story-progress-markers i.is-complete')).to_have_count(i)
        page.locator('.story-overview-toggle').click()
        expect(page.locator('.story-overview')).to_be_visible()
        expect(page.locator('.story-reading')).not_to_be_visible()
        assert page.locator('.story-evidence-grid article>p').all_text_contents() == [stage['signal'] for stage in scenario['stages']]
        page.locator('[data-jump-stage="0"]').click()
        expect(page.locator('[data-stage="0"]')).to_have_attribute('aria-current','step')
        expect(page.locator('.story-stop.is-complete')).to_have_count(0)
        expect(page.locator('.story-stop.is-upcoming')).to_have_count(stage_count - 1)
        expect(page.locator('.story-progress-markers i.is-current')).to_have_count(1)
        expect(page.locator('.story-progress-markers i.is-complete')).to_have_count(0)
        expect(page.locator('.story-reading')).to_be_visible()
        assert page.locator('.story-references a').count() >= 1
    print('All scenario stages and evidence panels match source data.', flush=True)

    page.goto(URL+'#/scenario/web-to-role',wait_until='networkidle')
    page.locator('.story-player').scroll_into_view_if_needed()
    page.screenshot(path=str(OUT/'reader-chain-desktop.png'))
    page.locator('.story-overview-toggle').click()
    page.locator('.story-overview').scroll_into_view_if_needed()
    page.screenshot(path=str(OUT/'reader-evidence-overview.png'))
    page.locator('.scenario-section-nav button',has_text='Response').click()
    expect(page.locator('.response-grid')).to_be_focused()
    page.locator('.scenario-full-notes>summary').click()
    expect(page.locator('.trace-stage').first).to_be_visible()

    # Expanded notes preserve a five-stage causal row on larger screens and
    # intentionally become a vertical sequence on phones without page overflow.
    five_stage = next(s for s in scenarios if len(s['stages']) == 5)
    for width, expected_columns in [(1440, 5), (768, 5), (390, 1)]:
        page.set_viewport_size({'width':width, 'height':1000})
        page.goto(URL+'#/scenario/'+five_stage['id'], wait_until='domcontentloaded')
        page.locator('.scenario-full-notes>summary').click()
        expect(page.locator('.trace-stage')).to_have_count(5)
        columns = page.locator('.trace-stages').evaluate(
            "el => getComputedStyle(el).gridTemplateColumns.split(' ').length"
        )
        assert columns == expected_columns, ('expanded trace columns', width, columns)
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'), (
            'expanded trace overflow', width
        )

    concept = page.evaluate("async()=> (await import('./catalog.js')).insights[0].id")
    routes = ['#/','#/domain/identity','#/service/s3','#/service/rds/topic/13','#/paths','#/scenario/web-to-role','#/library','#/sources','#/concept/'+concept]
    for width in [1440,1024,768,390,320]:
        page.set_viewport_size({'width':width,'height':1000})
        for route in routes:
            page.goto(URL+route,wait_until='domcontentloaded')
            page.locator('h1').wait_for()
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(width,route)
            assert page.locator('link[href="./reader.css"]').count()==1
            if route == '#/paths' and width <= 600:
                assert page.locator('.reader-mini-chain').evaluate_all(
                    'els=>els.every(el=>el.scrollWidth<=el.clientWidth+1)'
                ), ('nested path rail overflow', width)
        page.goto(URL+'#/scenario/web-to-role',wait_until='domcontentloaded')
        page.locator('[data-stage="0"]').focus()
        page.keyboard.press('End')
        expect(page.locator('#story-next')).to_be_disabled()
        assert page.locator('[aria-current="step"]').evaluate("el=>{const a=el.getBoundingClientRect(),b=el.closest('.story-track').getBoundingClientRect();return a.left>=b.left-1 && a.right<=b.right+1}")
        page.locator('.story-overview-toggle').click()
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),('overview',width)
        if width==390:
            page.locator('.story-overview').scroll_into_view_if_needed()
            page.screenshot(path=str(OUT/'reader-chain-mobile.png'))
        page.goto(URL,wait_until='domcontentloaded')
        page.locator('[data-detail="story"]').click()
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),('home story',width)
        boxes=page.locator('.atlas-preview-section').evaluate_all("els=>els.filter(e=>e.getClientRects().length).map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})")
        for i,a in enumerate(boxes):
            for b in boxes[i+1:]:
                assert min(a['x']+a['w'],b['x']+b['w'])-max(a['x'],b['x'])<=1 or min(a['y']+a['h'],b['y']+b['h'])-max(a['y'],b['y'])<=1,('homepage preview overlap',width)

    page.set_viewport_size({'width':1440,'height':1000})
    for route,name in [('#/','home'),('#/service/s3','service'),('#/sources','sources'),('#/library','library'),('#/domain/identity','domain')]:
        page.goto(URL+route,wait_until='networkidle')
        page.screenshot(path=str(OUT/f'reader-{name}.png'))
    research = page.evaluate("async()=>{const m=await import('./hacktricks-data.js');return {items:m.hacktricksServiceResearch,s3:m.hacktricksForService('s3')}}")
    page.goto(URL+'#/sources',wait_until='networkidle')
    expect(page.locator('.source-section-nav button')).to_have_count(5)
    expect(page.locator('.source-section-nav button').nth(3)).to_have_text('Current intel')
    expect(page.locator('.hacktricks-domain a')).to_have_count(len(research['items']))
    expect(page.locator('.hacktricks-source-index')).to_contain_text('4 explicit gaps')
    page.locator('.hacktricks-source-index').scroll_into_view_if_needed()
    page.screenshot(path=str(OUT/'reader-service-research-index.png'))
    page.goto(URL+'#/service/s3',wait_until='networkidle')
    expect(page.locator('.service-research-card h3')).to_have_text(research['s3']['title'])
    expect(page.locator('.service-research-links a')).to_have_count(2)
    page.locator('.service-research-card').scroll_into_view_if_needed()
    page.screenshot(path=str(OUT/'reader-service-research-card.png'))
    page.goto(URL+'#/service/identity-center',wait_until='networkidle')
    expect(page.locator('.service-research-gap')).to_be_visible()
    page.goto(URL+'#/library',wait_until='networkidle')
    page.locator('#library-search').fill('PollForJobs')
    expect(page.locator('.library-card h2')).to_have_text('AWS CodePipeline')
    page.goto(URL+'#/service/s3',wait_until='networkidle')
    page.get_by_role('tab',name='Detections',exact=True).click()
    page.locator('.detection-card').scroll_into_view_if_needed()
    page.screenshot(path=str(OUT/'reader-detection.png'))
    assert not errors,errors
    print(json.dumps({'result':'passed','scenarios':len(scenarios),'routeLayouts':len(routes)*5,'errors':errors}))
    browser.close()
