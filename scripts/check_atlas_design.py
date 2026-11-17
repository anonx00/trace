"""Verify the shared design reaches the atlas and every research view."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
URL=os.environ.get('TRACE_TEST_URL','http://127.0.0.1:4173/').rstrip('/')+'/'
OUT=Path(__file__).resolve().parents[1]/'artifacts'
OUT.mkdir(exist_ok=True)
ROUTES=[('#/','atlas'),('#/domain/identity','domain'),('#/service/s3','service'),('#/paths','paths'),('#/scenario/web-to-role','investigation'),('#/library','services'),('#/evidence','evidence'),('#/coverage','coverage'),('#/sources','sources')]
with sync_playwright() as pw:
    browser=pw.chromium.launch()
    page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='reduce')
    errors=[]
    dark_surfaces=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    for width in [1440,768,390,320]:
        page.set_viewport_size({'width':width,'height':1000})
        for route,name in ROUTES:
            page.goto(URL+route,wait_until='networkidle')
            expect(page.locator('h1')).to_be_visible()
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(route,width,'page overflow')
            assert page.evaluate(r'''()=>{const c=getComputedStyle(document.body).backgroundColor.match(/[\d.]+/g).map(Number);return c.slice(0,3).every(x=>x>200)}'''),(route,'old dark shell')
            if name=='atlas':
                expect(page.locator('.domain-card-emblem')).to_have_count(8)
                expect(page.locator('.atlas-card-question')).to_have_count(16)
                assert page.get_by_text('The connected surface',exact=True).count()==0
                page.locator('.atlas-workspace').evaluate('e=>e.scrollIntoView({block:"start"})')
            if name in ['domain','service']:
                expect(page.locator('.station-top')).to_have_count(1)
                page.locator('.mind-workspace').scroll_into_view_if_needed()
            if name=='services': expect(page.locator('.library-emblem')).to_have_count(40)
            if name=='evidence': expect(page.locator('.evidence-emblem')).to_have_count(6)
            if name=='sources': expect(page.locator('.source-journey')).to_be_visible()
            if width in [1440,390]: page.screenshot(path=str(OUT/f'atlas-design-{name}-{width}.png'))
            if width==1440:
                dark=page.evaluate(r'''()=>[...document.querySelectorAll('#view *')].filter(e=>{const b=e.getBoundingClientRect();const c=getComputedStyle(e).backgroundColor.match(/[\d.]+/g)?.map(Number);return b.width>90&&b.height>35&&c&&c.slice(0,3).every(x=>x<100)&&(c.length<4||c[3]>.8)}).map(e=>e.className).filter(x=>typeof x==='string')''')
                if dark: dark_surfaces.append((route,dark))
    page.set_viewport_size({'width':1440,'height':1000})
    page.goto(URL,wait_until='networkidle')
    page.locator('[data-detail="services"]').click()
    expect(page.locator('.atlas-service-card')).to_have_count(40)
    page.locator('.atlas-workspace').scroll_into_view_if_needed()
    page.screenshot(path=str(OUT/'atlas-design-service-map.png'))
    page.locator('[data-detail="story"]').click()
    expect(page.locator('.atlas-home-story .atlas-emblem').first).to_be_visible()
    assert not errors,errors
    assert not dark_surfaces,dark_surfaces
    browser.close()
    print('Shared atlas design: nine views, four widths, illustrations, 40 service nodes, and legacy-surface checks passed.')

