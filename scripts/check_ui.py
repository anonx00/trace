import json
import re
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
out=ROOT/'artifacts';out.mkdir(exist_ok=True)
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True)
    page=browser.new_page(viewport={'width':1600,'height':1050},device_scale_factor=1)
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:4173',wait_until='networkidle')
    page.locator('.world-svg').wait_for()
    assert page.locator('.map-node').count()==8
    page.get_by_role('button',name='Explore domains',exact=True).click()
    assert page.locator('.sidebar').is_visible()
    page.get_by_role('button',name='Explore domains',exact=True).click()
    assert not page.locator('.sidebar').is_visible()
    page.screenshot(path=str(out/'universe-desktop.png'),full_page=True)
    page.locator('[data-detail="services"]').click()
    assert page.locator('.map-node').count()==48
    page.locator('[data-detail="overview"]').click()
    assert page.locator('.map-node').count()==8
    page.locator('[data-route="#/domain/data"]').click()
    page.wait_for_url('**/#/domain/data')
    expect(page.locator('.map-node')).to_have_count(6)
    page.locator('[data-route="#/service/s3"]').click()
    page.wait_for_url('**/#/service/s3')
    expect(page.locator('.inspector h2')).to_have_text('Amazon S3')
    page.locator('#save-service').click()
    expect(page.locator('#save-service')).to_have_attribute('aria-pressed','true')
    page.locator('#focus-graph').click()
    assert not page.locator('.inspector').is_visible()
    page.locator('#focus-graph').click()
    assert page.locator('.inspector').is_visible()
    page.get_by_role('tab',name='Detections',exact=True).click()
    expect(page.locator('.detection-card')).to_have_count(1)
    expect(page.locator('.detection-card h3')).to_have_text('AWS S3 Data Management Tampering')
    expect(page.locator('.detection-card-head')).to_contain_text('EXACT UPSTREAM SELECTION')
    expect(page.locator('.detection-signals li')).to_have_count(2)
    expect(page.locator('.detection-links a')).to_have_count(2)
    expect(page.locator('.detection-links a').first).to_have_attribute('href',re.compile(r'^https://detections\.ai/detections/'))
    page.screenshot(path=str(out/'s3-community-detections.png'),full_page=True)
    page.get_by_role('tab',name='Intel',exact=True).click()
    expect(page.locator('.detection-intel-list')).to_contain_text('AWS S3 Data Management Tampering')
    page.get_by_role('tab',name='Evidence',exact=True).click()
    expect(page.locator('.detection-evidence-list')).to_contain_text('PutBucketLogging')
    page.get_by_role('tab',name='Defense',exact=True).click()
    expect(page.locator('.detection-tuning-list')).to_contain_text('configuration alone')
    page.get_by_role('tab',name='AWS docs',exact=True).click()
    assert page.locator('.topic-link').count()>10
    page.locator('.world-layer').evaluate('(el)=>Promise.all(el.getAnimations().map(a=>a.finished))')
    page.screenshot(path=str(out/'s3-topics.png'),full_page=True)
    page.locator('.topic-link').first.click()
    page.wait_for_url('**/topic/0')
    page.get_by_role('link',name='Open exact AWS section').wait_for()
    expect(page.locator('.topic-security-lens')).to_be_visible()
    assert 'This heading was extracted' not in page.locator('.inspector').inner_text()
    assert 'OBSERVABLE EVIDENCE' in page.locator('.inspector').inner_text()
    assert not any('…' in value for value in page.locator('.map-node text').all_text_contents())
    page.goto('http://127.0.0.1:4173/#/service/rds')
    page.get_by_role('tab',name='AWS docs',exact=True).click()
    page.locator('.topic-filter').fill('Amazon RDS monitoring')
    monitoring=page.locator('.topic-link',has_text='Amazon RDS monitoring').first
    expect(monitoring).to_be_visible()
    monitoring.click()
    expect(page.locator('.topic-security-lens')).to_be_visible()
    expect(page.locator('.inspector h2')).to_contain_text('Amazon RDS monitoring')
    rds_text=page.locator('.inspector').inner_text()
    assert 'This heading was extracted' not in rds_text
    assert 'ATTACK HYPOTHESES' in rds_text
    assert 'OBSERVABLE EVIDENCE' in rds_text
    assert 'CONTROLS TO TEST' in rds_text
    assert 'RESPONDER QUESTION' in rds_text
    assert not any('…' in value for value in page.locator('.map-node text').all_text_contents())
    page.locator('.world-layer').evaluate('(el)=>Promise.all(el.getAnimations().map(a=>a.finished))')
    page.screenshot(path=str(out/'rds-monitoring-analysis.png'),full_page=True)
    page.goto('http://127.0.0.1:4173/#/service/guardduty')
    page.get_by_role('tab',name='Evidence',exact=True).click()
    assert page.locator('.map-link.documented').count()>=1
    assert page.locator('.mind-source-link').count()>=1
    page.locator('.world-layer').evaluate('(el)=>Promise.all(el.getAnimations().map(a=>a.finished))')
    page.screenshot(path=str(out/'guardduty-connections.png'),full_page=True)
    initial=page.locator('.world-svg').get_attribute('viewBox')
    page.get_by_role('button',name='Zoom in',exact=True).click()
    assert page.locator('.world-svg').get_attribute('viewBox')!=initial
    page.get_by_role('button',name='Fit graph to view').click()
    assert page.locator('.world-svg').get_attribute('viewBox')==initial
    page.keyboard.press('Control+k')
    page.locator('#search-input').fill('CreateAccessKey')
    assert page.locator('.search-result').count()>0
    expect(page.locator('.search-result').first).to_contain_text('IAM')
    page.locator('.search-result').first.click()
    assert not page.locator('#search-dialog').is_visible()
    page.goto('http://127.0.0.1:4173/#/library')
    assert page.locator('.library-card').count()==40
    page.locator('[data-filter="saved"]').click()
    expect(page.locator('.library-card')).to_have_count(1)
    page.locator('[data-filter="all"]').click()
    page.locator('#library-search').fill('s3')
    assert page.locator('.library-card').count()>0
    page.goto('http://127.0.0.1:4173/#/sources')
    assert page.locator('tbody tr').count()==40
    assert page.locator('.reference-grid a').count()>=10
    expect(page.locator('.community-source-grid a')).to_have_count(28)
    page.screenshot(path=str(out/'community-detection-index.png'),full_page=True)
    page.goto('http://127.0.0.1:4173/#/service/athena')
    page.get_by_role('tab',name='Detections',exact=True).click()
    expect(page.locator('.detection-gap')).to_be_visible()
    expect(page.locator('.detection-card')).to_have_count(0)
    page.screenshot(path=str(out/'athena-detection-gap.png'),full_page=True)
    page.goto('http://127.0.0.1:4173/#/paths')
    assert page.locator('.scenario-card').count()==21
    page.locator('.scenario-card').first.click()
    page.wait_for_url('**/#/scenario/*')
    expect(page.locator('.trace-stage')).to_have_count(4)
    expect(page.locator('.scenario-detections')).to_be_visible()
    assert page.locator('.scenario-detection-grid a').count()>0
    page.screenshot(path=str(out/'scenario-community-coverage.png'),full_page=True)
    expect(page.locator('.scenario-sources a').first).to_be_visible()
    assert page.locator('.scenario-sources a').count()>=5
    for scenario in ('alb-rule-auth-bypass','appsync-api-key-persistence','appsync-resolver-data-access','cloudfront-function-cookie-theft','lambda-edge-request-exfiltration'):
        page.goto('http://127.0.0.1:4173/#/scenario/'+scenario,wait_until='domcontentloaded')
        expect(page.locator('.trace-stage')).to_have_count(4)
        assert page.locator('.scenario-sources a').count()>=3,scenario
        assert page.locator('.stage-service').count()==4,scenario
    for scenario in ('cloudformation-template-role-escalation','athena-valid-role-data-access','kinesis-cross-account-stream-access','opensearch-domain-policy-exposure','cloudformation-secret-to-rds-access'):
        page.goto('http://127.0.0.1:4173/#/scenario/'+scenario,wait_until='domcontentloaded')
        assert page.locator('.trace-stage').count()>=4,scenario
        assert page.locator('.scenario-sources a').count()>=4,scenario
    for scenario in ('ssm-run-command-host-execution','ebs-snapshot-cross-account-exposure','s3-replication-cross-account-exfiltration'):
        page.goto('http://127.0.0.1:4173/#/scenario/'+scenario,wait_until='domcontentloaded')
        expect(page.locator('.trace-stage')).to_have_count(5)
        assert page.locator('.scenario-sources a').count()>=4,scenario
        assert page.locator('.stage-service').count()==5,scenario
    page.goto('http://127.0.0.1:4173/#/scenario/cloudformation-secret-to-rds-access',wait_until='domcontentloaded')
    expect(page.locator('.trace-stage')).to_have_count(4)
    expect(page.locator('.scenario-confidence')).to_contain_text('review prompt only')
    expect(page.locator('.scenario-sources')).to_contain_text('DISCOVERY ONLY')
    expect(page.locator('.scenario-sources')).to_contain_text('DATASET REVIEW')
    expect(page.locator('.scenario-sources')).to_contain_text('CloudFormation parameter masking')
    page.screenshot(path=str(out/'dataset-vetted-scenario.png'),full_page=True)
    page.goto('http://127.0.0.1:4173/#/service/cloudformation',wait_until='domcontentloaded')
    expect(page.locator('.scenario-mini-list')).to_contain_text('Readable template secret becomes a database path')
    expect(page.locator('.intel-list')).to_contain_text('NoEcho masking')
    page.get_by_role('tab',name='Evidence',exact=True).click()
    expect(page.locator('.evidence-list')).to_contain_text('NoEcho flags')
    page.get_by_role('tab',name='Defense',exact=True).click()
    expect(page.locator('.defense-list').first).to_contain_text('secure-string dynamic references')
    page.set_viewport_size({'width':390,'height':844})
    page.goto('http://127.0.0.1:4173/#/')
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    page.locator('.world-layer').evaluate('(el)=>Promise.all(el.getAnimations().map(a=>a.finished))')
    page.screenshot(path=str(out/'universe-mobile.png'),full_page=True)
    page.goto('http://127.0.0.1:4173/#/service/s3')
    assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth')
    assert not errors,errors
    print(json.dumps({'result':'passed','consoleErrors':errors,'screenshots':str(out)}))
    browser.close()
