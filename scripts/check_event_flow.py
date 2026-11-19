"""Exercise EventBridge's illustrated example and verify real connector geometry."""
import os
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
URL=os.environ.get('TRACE_TEST_URL','http://127.0.0.1:4173').rstrip('/')
OUT=Path(__file__).resolve().parents[1]/'artifacts'
OUT.mkdir(exist_ok=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch()
    page=browser.new_page(viewport={'width':1440,'height':1000},reduced_motion='no-preference')
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    for width in [1440,1024,768,748,747,390,320]:
        page.set_viewport_size({'width':width,'height':1000})
        page.goto(URL+'/#/service/eventbridge',wait_until='networkidle')
        expect(page.locator('.ef-node')).to_have_count(5)
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),width
        for mode,count in [('delivered',3),('unmatched',2),('failed',4)]:
            page.locator(f'button[data-case="{mode}"]').click()
            expect(page.locator('.ef-edge.is-on')).to_have_count(count)
            assert page.locator('.ef-node').evaluate_all('''nodes=>nodes.every(n=>{const b=n.getBoundingClientRect(),c=n.parentElement.getBoundingClientRect();return b.left>=c.left&&b.right<=c.right+1&&b.top>=c.top&&b.bottom<=c.bottom+1&&[...n.querySelectorAll('strong,.ef-node-sub,.ef-node-state')].every(t=>{const r=t.getBoundingClientRect();return r.left>=b.left&&r.right<=b.right&&r.bottom<=b.bottom-4})})'''),(width,mode,'node clipping')
            assert page.locator('.ef-wires').evaluate('''svg=>[...svg.querySelectorAll('.ef-edge>path')].every((p,i)=>{const from=['source','bus','rule','target'][i],to=['bus','rule','target','dlq'][i],box=svg.getBoundingClientRect(),a=svg.parentElement.querySelector('[data-node='+from+']').getBoundingClientRect(),b=svg.parentElement.querySelector('[data-node='+to+']').getBoundingClientRect(),start=p.getPointAtLength(0),end=p.getPointAtLength(p.getTotalLength()),vertical=a.top!==b.top;return Math.abs(start.x+box.left-(vertical?a.left+a.width/2:a.right))<2&&Math.abs(start.y+box.top-(vertical?a.bottom:a.top+a.height/2))<2&&Math.abs(end.x+box.left-(vertical?b.left+b.width/2:b.left))<2&&Math.abs(end.y+box.top-(vertical?b.top:b.top+b.height/2))<2})'''),(width,mode,'detached connector')
        expect(page.locator('.ef-outcome')).to_contain_text('not retried')
        page.locator('button[data-case="unmatched"]').click()
        expect(page.locator('.ef-payload mark')).to_have_text('"low"')
        expect(page.locator('.ef-target .ef-node-state')).to_have_text('Not invoked')
        page.locator('button[data-case="delivered"]').click()
        page.locator('[data-node="source"]').click()
        page.locator('.ef-next').click()
        expect(page.locator('[data-node="bus"]')).to_have_attribute('aria-pressed','true')
        page.locator('.ef-back').click()
        expect(page.locator('[data-node="source"]')).to_have_attribute('aria-pressed','true')
        page.locator('[data-node="source"]').focus()
        page.keyboard.press('ArrowRight')
        expect(page.locator('[data-node="bus"]')).to_be_focused()
        page.keyboard.press('End')
        expect(page.locator('[data-node="dlq"]')).to_be_focused()
        assert page.locator('.ef-source-link').get_attribute('href').endswith('eb-rule-dlq.html')
    page.set_viewport_size({'width':1440,'height':1000})
    page.locator('button[data-case="delivered"]').click()
    page.locator('.ef-canvas').scroll_into_view_if_needed()
    position='e=>{const m=e.getCTM();return [m.e,m.f]}'
    dot=page.locator('.ef-signal').first
    previous=dot.evaluate(position)
    page.wait_for_timeout(180)
    assert previous!=dot.evaluate(position),'Signal must move'
    page.locator('.ef-motion').click()
    page.wait_for_function('document.querySelector(".ef-wires").animationsPaused()')
    previous=dot.evaluate(position)
    page.wait_for_timeout(180)
    assert previous==dot.evaluate(position),'Paused signal moved'
    page.locator('.ef-motion').click()
    page.wait_for_function('!document.querySelector(".ef-wires").animationsPaused()')
    previous=dot.evaluate(position)
    page.wait_for_timeout(180)
    assert previous!=dot.evaluate(position),'Signal did not resume'
    page.emulate_media(reduced_motion='reduce')
    expect(page.locator('.ef-motion')).to_have_text('Reduced motion')
    expect(page.locator('.ef-motion')).to_be_disabled()
    page.wait_for_function('document.querySelector(".ef-wires").animationsPaused()')
    page.locator('.ef-heading').evaluate('e=>e.scrollIntoView({block:"start"})')
    page.screenshot(path=str(OUT/'eventbridge-flow-checked.png'))
    page.locator('.ef-next-links a').first.click()
    expect(page.locator('#tab-evidence')).to_have_attribute('aria-selected','true')
    page.goto(URL+'/#/service/s3',wait_until='networkidle')
    expect(page.locator('.event-flow')).to_have_count(0)
    page.goto(URL+'/#/service/eventbridge',wait_until='networkidle')
    expect(page.locator('.event-flow')).to_have_count(1)
    page.locator('.ef-to-map').click()
    expect(page.locator('#mind-reading')).to_be_focused()
    assert not errors,errors
    browser.close()
print('EventBridge flow: three outcomes, seven widths, attached connectors, keyboard, motion, sources and route cleanup passed.')
