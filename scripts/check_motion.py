
import json
from playwright.sync_api import sync_playwright,expect
with sync_playwright() as p:
    b=p.chromium.launch()
    page=b.new_page(viewport={"width":1440,"height":1000})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:4173/#/service/s3',wait_until='networkidle')
    node=page.locator('.mind-signal').first
    expect(node).to_be_visible()
    position="e=>{const m=e.getCTM();return [m.e,m.f]}"
    a=node.evaluate(position)
    page.wait_for_timeout(250)
    assert a!=node.evaluate(position),'Signal did not move'
    page.locator('#mind-motion').click()
    assert page.locator('.world-svg').evaluate('e=>e.animationsPaused()')
    a=node.evaluate(position)
    page.wait_for_timeout(200)
    assert a==node.evaluate(position),'Signal moved while paused'
    page.locator('#mind-motion').click()
    page.wait_for_timeout(200)
    assert a!=node.evaluate(position),'Signal did not resume'
    page.get_by_role('tab',name='Evidence',exact=True).click()
    assert not page.locator('.world-svg').evaluate('e=>e.animationsPaused()')
    page.goto('http://127.0.0.1:4173/#/scenario/web-to-role',wait_until='networkidle')
    stop=page.locator('.story-stop').first
    a=stop.evaluate("e=>getComputedStyle(e,'::before').left")
    page.wait_for_timeout(250)
    assert a!=stop.evaluate("e=>getComputedStyle(e,'::before').left")
    page.locator('.story-motion').click()
    assert stop.evaluate("e=>getComputedStyle(e,'::before').animationPlayState")=='paused'
    page.emulate_media(reduced_motion='reduce')
    page.goto('http://127.0.0.1:4173/#/service/iam',wait_until='networkidle')
    assert page.locator('.world-svg').evaluate('e=>e.animationsPaused()')
    page.goto('http://127.0.0.1:4173',wait_until='networkidle')
    assert page.locator('.atlas-graph').evaluate('e=>e.animationsPaused()')
    assert not errors,errors
    print(json.dumps({"motion":"advances / pauses / resumes","routeChanges":"passed","reducedMotion":"passed","errors":errors}))
    b.close()
