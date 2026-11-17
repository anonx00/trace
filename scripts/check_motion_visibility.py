"""Check signal contrast, screen size, focus visibility, and actual movement."""
import os
from playwright.sync_api import sync_playwright

URL=os.environ.get('TRACE_TEST_URL','http://127.0.0.1:4173').rstrip('/')
STYLE=r'''e=>{const s=getComputedStyle(e);return {fill:s.fill,opacity:Number(s.opacity),radius:parseFloat(s.r),stroke:s.stroke,width:parseFloat(s.strokeWidth),screen:e.getBoundingClientRect().width}}'''
POSITION='e=>{const m=e.getCTM();return [m.e,m.f]}'
def luminance(rgb):
    values=[v/255 for v in rgb]
    values=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in values]
    return sum(v*w for v,w in zip(values,[.2126,.7152,.0722]))
def contrast(color):
    import re
    rgb=[float(x) for x in re.findall(r'[\d.]+',color)[:3]]
    return (luminance([242,244,233])+.05)/(luminance(rgb)+.05)
def check_dot(dot):
    style=dot.evaluate(STYLE)
    assert style['opacity']==1,style
    assert contrast(style['fill'])>=4.5,style
    assert style['screen']>=5,style
    assert style['width']>=1.5,style
    before=dot.evaluate(POSITION)
    dot.page.wait_for_timeout(180)
    assert before!=dot.evaluate(POSITION),'Visible marker must move'

with sync_playwright() as pw:
    browser=pw.chromium.launch()
    page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='no-preference')
    for width in [1440,390]:
        page.set_viewport_size({'width':width,'height':1000})
        page.goto(URL+'/#/',wait_until='networkidle')
        check_dot(page.locator('.atlas-flow').first)
        hero=page.locator('.thread-signal').first.evaluate('e=>({color:getComputedStyle(e).stroke,width:parseFloat(getComputedStyle(e).strokeWidth)})')
        assert contrast(hero['color'])>=4.5 and hero['width']>=3,hero
        if width==1440:
            page.locator('[data-detail="services"]').click()
            check_dot(page.locator('.atlas-service-flow').first)
        page.goto(URL+'/#/service/s3',wait_until='networkidle')
        check_dot(page.locator('.mind-signal').first)
        page.locator('.mind-graph-node').first.focus()
        active=page.locator('.mind-link.is-node-active + .mind-signal')
        assert active.count()==1
        check_dot(active)
        page.goto(URL+'/#/scenario/web-to-role',wait_until='networkidle')
        marker=page.locator('.story-stop.is-current').evaluate('e=>{const s=getComputedStyle(e,"::before");return {color:s.backgroundColor,width:parseFloat(s.width),opacity:s.opacity,display:s.display}}')
        assert contrast(marker['color'])>=4.5 and marker['width']>=7 and marker['opacity']=='1' and marker['display']!='none',marker
    browser.close()
print('Visible motion: high-contrast markers, desktop/mobile size, hero, investigations, and focused service connections passed.')
