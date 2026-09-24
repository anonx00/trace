"""Release-level journeys, deep links, evidence fidelity, and design screenshots."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL=os.environ.get('TRACE_TEST_URL','http://127.0.0.1:4174/').rstrip('/')+'/'
OUT=Path(__file__).resolve().parents[1]/'artifacts'
OUT.mkdir(exist_ok=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch()
    page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    for route,name in [('#/','map'),('#/paths','paths'),('#/scenario/web-to-role','investigation'),('#/coverage','coverage'),('#/evidence','evidence'),('#/service/s3?tab=evidence','service')]:
        page.goto(URL+route,wait_until='networkidle')
        expect(page.locator('h1')).to_be_visible()
        page.screenshot(path=str(OUT/f'workspace-{name}.png'))
    for width in [1440,1024,768,390,320]:
        page.set_viewport_size({'width':width,'height':1000})
        for route,name in [('#/','map'),('#/paths','paths'),('#/scenario/web-to-role','investigation'),('#/coverage','coverage'),('#/evidence','evidence')]:
            page.goto(URL+route,wait_until='networkidle')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),(width,route)
            if width==390:page.screenshot(path=str(OUT/f'workspace-{name}-mobile.png'))
    page.set_viewport_size({'width':1440,'height':1000})
    # Direct entry and refresh, including query strings and encoded fragments.
    for route in ['#/coverage','#/coverage/','#%2Fcoverage','#/coverage?view=services']:
        page.goto(URL+route,wait_until='networkidle')
        expect(page.locator('.coverage-page')).to_be_visible()
        page.reload(wait_until='networkidle')
        expect(page.locator('.coverage-page')).to_be_visible()
    page.goto(URL+'#/paths?service=s3&layout=compact',wait_until='networkidle')
    expect(page.locator('#path-service')).to_have_value('s3')
    expect(page.locator('.scenario-grid')).to_have_class('scenario-grid is-compact')
    paths=page.locator('.scenario-card').count()
    page.locator('.scenario-card').first.click()
    page.go_back(wait_until='networkidle')
    expect(page.locator('#path-service')).to_have_value('s3')
    expect(page.locator('.scenario-card')).to_have_count(paths)
    page.goto(URL+'#/scenario/web-to-role?stage=3',wait_until='networkidle')
    expect(page.locator('[data-stage="2"]')).to_have_attribute('aria-current','step')
    page.locator('#story-next').click()
    assert page.url.endswith('?stage=4')
    page.reload(wait_until='networkidle')
    expect(page.locator('[data-stage="3"]')).to_have_attribute('aria-current','step')
    page.goto(URL+'#/evidence?service=s3',wait_until='networkidle')
    expect(page.locator('#evidence-service')).to_have_value('s3')
    expect(page.locator('.evidence-guide')).to_have_count(2)
    assert page.locator('.evidence-official-source').evaluate_all("es=>es.every(e=>new URL(e.href).hostname==='docs.aws.amazon.com')")
    page.goto(URL+'#/service/s3?tab=evidence',wait_until='networkidle')
    expect(page.locator('#tab-evidence')).to_have_attribute('aria-selected','true')
    expect(page.locator('.service-evidence-guides')).to_be_visible()
    # Every supported content route must render in the actual static build.
    routes=page.evaluate("""async()=>{const [{services,domains,insights},{scenarios}]=await Promise.all([import('./catalog.js'),import('./scenario-data.js')]);return [...services.map(s=>'#/service/'+s.id),...domains.map(d=>'#/domain/'+d.id),...scenarios.map(s=>'#/scenario/'+s.id),...insights.map(i=>'#/concept/'+i.id)];}""")
    for route in routes:
        page.goto(URL+route,wait_until='domcontentloaded')
        expect(page.locator('h1')).to_be_visible()
        expect(page.locator('.route-recovery')).to_have_count(0)
        assert page.locator('#view a[href^="#/"]').evaluate_all("links=>links.every(a=>!a.getAttribute('href').includes('undefined'))"),route
    print(f'All {len(routes)} service, domain, scenario, and concept routes render in the static release.',flush=True)
    page.goto(URL+'#/a-broken-old-link',wait_until='networkidle')
    expect(page.locator('.recovery-links a')).to_have_count(3)
    page.locator('.recovery-search').click()
    expect(page.locator('#search-dialog')).to_be_visible()
    page.locator('#search-close').click()
    page.locator('.recovery-links a[href="#/coverage"]').click()
    expect(page.locator('.coverage-page')).to_be_visible()
    assert not errors,errors
    print('Workspace: 25 layouts, direct/reloaded coverage links, back navigation, stage links, evidence data, and route recovery passed.')
    browser.close()
