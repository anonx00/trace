"""Source pages preserve exact headings without invented security relationships."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL=os.environ.get('TRACE_TEST_URL','http://127.0.0.1:4173').rstrip('/')
with sync_playwright() as pw:
    browser=pw.chromium.launch()
    page=browser.new_page()
    errors=[]
    page.on('pageerror',lambda error:errors.append(str(error)))
    page.goto(URL)
    documents=page.evaluate("fetch('./generated/docs.json').then(r=>r.json()).then(d=>d.documents.filter(x=>x.status==='ok'))")
    count=0
    for doc in documents:
        for index,topic in enumerate(doc['sections']):
            page.goto(f'{URL}/#/service/{doc["id"]}/topic/{index}')
            expect(page.locator('h1')).to_have_text(topic['title'])
            expect(page.get_by_role('link',name='Open exact AWS section')).to_have_attribute('href',topic['url'])
            assert page.locator('.world-svg,.inspector,.topic-security-lens,.mind-ledger').count()==0
            count+=1
    for width in (1440,768,390,320):
        page.set_viewport_size({'width':width,'height':1000})
        page.goto(URL+'/#/service/ecr/topic/2')
        expect(page.locator('h1')).to_have_text('How to get started with Amazon ECR')
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),width
        assert 'ATTACK HYPOTHESES' not in page.locator('#view').inner_text()
        page.get_by_role('link',name='Next section').click()
        expect(page.locator('h1')).to_have_text('Pricing for Amazon ECR')
        page.get_by_role('link',name='All AWS topics').click()
        expect(page.get_by_role('tab',name='AWS docs',exact=True)).to_have_attribute('aria-selected','true')
    page.goto(URL+'/#/service/ecr/topic/2')
    Path('artifacts').mkdir(exist_ok=True)
    page.screenshot(path='artifacts/source-topic-mobile.png',full_page=True)
    assert not errors,errors
    print(f'Checked {count} exact topic links, no duplicate graphs, and four ECR layouts.')
    browser.close()
