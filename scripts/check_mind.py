
import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
URL='http://127.0.0.1:4173/'
errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch()
    page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(URL,wait_until='networkidle')
    expect(page.locator('.atlas-domain-node')).to_have_count(8)
    page.locator('[data-route="#/domain/data"]').focus()
    expect(page.locator('.atlas-preview h2')).to_have_text('Data protection')
    page.locator('[data-scope="data"]').click()
    expect(page.locator('.atlas-domain-node:not(.scope-muted)')).to_have_count(1)
    page.locator('[data-scope="all"]').click()
    expect(page.locator('#atlas-motion')).to_have_attribute('aria-pressed','true')
    page.locator('[data-detail="story"]').click()
    expect(page.locator('.atlas-home-story')).to_be_visible()
    assert not page.locator('.atlas-stage').is_visible()
    page.locator('.atlas-home-story #story-next').click()
    expect(page.locator('.atlas-home-story [data-stage="1"]')).to_have_attribute('aria-pressed','true')
    page.locator('#atlas-story-select').select_option(index=1)
    expect(page.locator('.atlas-home-story [data-stage="0"]')).to_have_attribute('aria-pressed','true')
    page.locator('[data-detail="overview"]').click()
    expect(page.locator('.atlas-stage')).to_be_visible()
    page.locator('#atlas-find').click()
    page.locator('#search-input').fill('Athena')
    expect(page.locator('.search-result').first).to_contain_text('Athena')
    page.locator('#search-close').click()
    page.locator('[data-route="#/domain/data"]').click()
    page.wait_for_url('**/#/domain/data')
    assert page.locator('.canvas-wrap').bounding_box()['height']>400
    page.locator('[data-route="#/service/s3"]').click()
    page.wait_for_url('**/#/service/s3')
    expect(page.locator('.mind-page')).to_be_visible()
    before=page.locator('.mind-node-copy').first.inner_text()
    page.get_by_role('tab',name='Evidence',exact=True).click()
    after=page.locator('.mind-node-copy').first.inner_text()
    assert before!=after
    assert 'Evidence' in after
    page.get_by_role('tab',name='Defense',exact=True).click()
    expect(page.locator('.mind-node-copy').first).to_contain_text('Defense')
    page.locator('#mind-reading').click()
    assert not page.locator('.canvas-wrap').is_visible()
    expect(page.locator('.inspector')).to_be_visible()
    page.locator('#focus-graph').click()
    expect(page.locator('.canvas-wrap')).to_be_visible()
    assert not page.locator('.inspector').is_visible()
    page.locator('#focus-graph').click()
    page.get_by_role('tab',name='AWS docs',exact=True).click()
    first=page.locator('.mind-graph-node').first.get_attribute('data-route')
    page.locator('#graph-next').click()
    assert first!=page.locator('.mind-graph-node').first.get_attribute('data-route')
    page.locator('#graph-previous').click()
    page.locator('.topic-link').first.click()
    expect(page.locator('.topic-security-lens')).to_be_visible()
    assert 'This heading was extracted' not in page.locator('body').inner_text()
    page.goto(URL+'#/scenario/web-to-role',wait_until='networkidle')
    expect(page.locator('[data-stage="0"]')).to_have_attribute('aria-pressed','true')
    page.locator('#story-next').click()
    expect(page.locator('[data-stage="1"]')).to_have_attribute('aria-pressed','true')
    page.locator('[data-lens="evidence"]').click()
    expect(page.locator('.story-context h3')).to_have_text('What would prove this stage?')
    page.locator('[data-lens="defense"]').click()
    expect(page.locator('.story-signal')).to_contain_text('RESPONDER QUESTION')
    page.locator('[data-stage="1"]').focus()
    page.keyboard.press('End')
    expect(page.locator('#story-next')).to_be_disabled()
    page.screenshot(path=str(ROOT/'artifacts/mind-investigation-desktop.png'),full_page=True)
    print('Interaction journeys passed',flush=True)

    data=json.loads((ROOT/'generated/docs.json').read_text(encoding='utf-8'))
    overflow=[]
    for doc in data['documents']:
        if doc.get('status')!='ok':continue
        page.goto(URL+'#/service/'+doc['id'],wait_until='domcontentloaded')
        page.locator('.inspector').wait_for()
        for tab in ['Intel','Evidence','Defense','AWS docs']:
            page.get_by_role('tab',name=tab,exact=True).click()
            if tab=='Defense':
                expect(page.locator('.field-command')).to_have_count(1)
                expect(page.locator('.field-command code')).to_contain_text('aws ')
                expect(page.locator('.field-command a')).to_have_attribute('href',re.compile(r'^https://docs\.aws\.amazon\.com/cli/'))
            clipped=page.locator('.mind-node-copy').evaluate_all("(els)=>els.filter(e=>e.scrollHeight>Number(e.parentElement.getAttribute('height'))+1).map(e=>e.innerText)")
            if clipped:overflow.append({'service':doc['id'],'tab':tab,'text':clipped})
    assert not overflow,overflow
    print('All 38 services / four lenses: full graph text',flush=True)

    routes=['#/','#/domain/data','#/service/s3','#/service/rds/topic/13','#/paths','#/scenario/web-to-role','#/library','#/sources']
    layout=[]
    for width in [1440,1024,768,390,320]:
        page.set_viewport_size({'width':width,'height':900})
        for route in routes:
            page.goto(URL+route,wait_until='domcontentloaded')
            page.locator('h1').wait_for()
            if page.evaluate('document.documentElement.scrollWidth>innerWidth+1'):
                layout.append({'width':width,'route':route})
        print('Layout checked: '+str(width),flush=True)
    assert not layout,layout
    page.set_viewport_size({'width':390,'height':844})
    page.goto(URL,wait_until='networkidle')
    page.locator('[data-detail="services"]').click()
    expect(page.locator('.atlas-service-index')).to_be_visible()
    assert page.locator('.atlas-service-index a').count()==38
    page.locator('.atlas-service-index a[href="#/service/iam"]').click()
    page.wait_for_url('**/#/service/iam')
    page.locator('#mind-reading').click()
    expect(page.locator('.inspector')).to_be_visible()
    page.screenshot(path=str(ROOT/'artifacts/mind-mobile-reading.png'),full_page=True)
    assert not errors,errors
    print(json.dumps({'result':'passed','pageErrors':errors,'layouts':len(routes)*5,'services':38}))
    browser.close()
