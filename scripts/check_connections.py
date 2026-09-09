"""Check rendered capability paths and every security domain."""
import json
from playwright.sync_api import sync_playwright, expect
with sync_playwright() as p:
    b=p.chromium.launch()
    page=b.new_page(viewport={'width':1440,'height':1050})
    errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:4173',wait_until='networkidle')
    data=page.evaluate("async()=>{const {services,domains,connections}=await import('./catalog.js');return {services,domains,connections}}")
    ids={s['id'] for s in data['services']}
    covered={c[k] for c in data['connections'] for k in ('from','to')}
    assert ids==covered,(ids-covered,covered-ids)
    assert all(c['source'].startswith('https://docs.aws.amazon.com/') and c['detail'] for c in data['connections'])
    page.locator('[data-detail="services"]').click()
    expect(page.locator('.atlas-service-node')).to_have_count(len(ids))
    expect(page.locator('.atlas-connection')).to_have_count(len(data['connections']))
    assert page.locator('.atlas-stage').bounding_box()['height']>=600
    assert page.locator('.atlas-service-node').evaluate_all("ns=>ns.every(n=>{const r=n.getBoundingClientRect(),s=n.closest('svg').getBoundingClientRect();return r.width>0&&r.height>0&&r.left>=s.left-1&&r.right<=s.right+1&&r.top>=s.top-1&&r.bottom<=s.bottom+1})"),'Node outside map bounds'
    for i,c in enumerate(data['connections']):
        edge=page.locator('[data-edge="'+str(i)+'"]')
        edge.focus()
        expect(page.locator('.atlas-preview h2')).to_have_text(c['label'])
        expect(page.locator('.atlas-preview-enter')).to_have_attribute('href',c['source'])
        assert page.locator('.atlas-graph.has-edge-preview .atlas-service-node.atlas-related').count()==2
    signal=page.locator('.atlas-service-flow').first
    position='e=>{const m=e.getCTM();return [m.e,m.f]}'
    a=signal.evaluate(position);page.wait_for_timeout(250)
    assert a!=signal.evaluate(position),'Service capability motion missing'
    page.locator('#atlas-motion').click()
    a=signal.evaluate(position);page.wait_for_timeout(200)
    assert a==signal.evaluate(position),'Pause failed'
    for d in data['domains']:
        page.goto('http://127.0.0.1:4173/#/domain/'+d['id'],wait_until='networkidle')
        expect(page.locator('.mind-graph-node')).to_have_count(len(d['services']))
        expect(page.locator('.mind-link.membership')).to_have_count(len(d['services']))
        assert page.locator('.canvas-wrap').bounding_box()['height']>400
        assert page.locator('.mind-graph-node').evaluate_all('ns=>ns.every(n=>n.getBoundingClientRect().width>20)')
    for s in ('codepipeline','cloudformation','ecr'):
        page.goto('http://127.0.0.1:4173/#/service/'+s,wait_until='networkidle')
        assert page.locator('.mind-link.documented').count()>0,s
        assert page.locator('.mind-source-link[href^="https://docs.aws.amazon.com/"]').count()>0,s
    assert not errors,errors
    print(json.dumps({'nodes':len(ids),'sourcedCapabilities':len(data['connections']),'domains':len(data['domains']),'isolatedNodes':0,'sourceInspection':'passed','motion':'passed','errors':errors}))
    b.close()
