import assert from 'node:assert/strict';
import {services} from '../catalog.js';
import {communityDetections,detectionsForService,detectionCoverage,detectionLibraryUrl,detectionReviewDate} from '../community-detections.js';

const serviceIds=new Set(services.map(service=>service.id));
const expectedGaps=['appsync','athena','cloudformation','codepipeline','cognito','dynamodb','eventbridge','kinesis','opensearch','sqs','stepfunctions'];

assert.equal(communityDetections.length,28,'The reviewed community corpus changed; review sources and coverage before updating this invariant');
assert.match(detectionLibraryUrl,/^https:\/\/detections\.ai\/detections\?q=AWS$/);
assert.match(detectionReviewDate,/^\d{4}-\d{2}-\d{2}$/);
assert.equal(new Set(communityDetections.map(rule=>rule.id)).size,communityDetections.length,'Detection IDs must be unique');
assert.equal(new Set(communityDetections.map(rule=>rule.title)).size,communityDetections.length,'Detection titles must be unique');

for(const rule of communityDetections){
  assert.match(rule.id,/^[0-9a-f-]{36}$/i,rule.title+': invalid detections.ai identifier');
  assert.equal(rule.source,`https://detections.ai/detections/${rule.id}`,rule.title+': source must be the exact community rule page');
  assert.ok(rule.services.length,rule.title+': no mapped service');
  assert.equal(new Set(rule.services).size,rule.services.length,rule.title+': duplicate service mapping');
  rule.services.forEach(id=>assert.ok(serviceIds.has(id),rule.title+': unknown service '+id));
  for(const field of ['language','contributor','collection','status','level','basis','summary','telemetry','tune']){
    assert.ok(typeof rule[field]==='string'&&rule[field].trim(),rule.title+': missing '+field);
  }
  assert.ok(['Exact upstream selection','Publisher summary','Public matched content'].includes(rule.basis),rule.title+': unsupported evidence basis');
  assert.ok(Array.isArray(rule.signals)&&rule.signals.length,rule.title+': no reviewed signal');
  rule.signals.forEach(signal=>assert.ok(typeof signal==='string'&&signal.length>8,rule.title+': weak signal description'));
  rule.mitre.forEach(id=>assert.match(id,/^T\d{4}(?:\.\d{3})?$/,rule.title+': invalid MITRE technique '+id));
  assert.equal('query' in rule,false,rule.title+': translated executable queries are intentionally not stored');
  if(rule.language==='Sigma'){
    assert.equal(rule.basis,'Exact upstream selection',rule.title+': Sigma entry must be reviewed against upstream');
    assert.match(rule.upstream,/^https:\/\/github\.com\/SigmaHQ\/sigma\/blob\/[0-9a-f]{40}\/rules\/cloud\/aws\/cloudtrail\/[a-z0-9_]+\.yml$/,rule.title+': Sigma source must be commit-pinned');
  }else{
    assert.equal(rule.upstream,undefined,rule.title+': summary-only rule must not imply an independently reviewed upstream source');
  }
}

const actualGaps=services.filter(service=>detectionsForService(service.id).length===0).map(service=>service.id).sort();
assert.deepEqual(actualGaps,expectedGaps,'Coverage gaps changed; add a reviewed source or keep the gap explicit');
assert.equal(detectionCoverage(services.map(service=>service.id)).length,communityDetections.length,'Coverage helper dropped a rule');

console.log(`Checked ${communityDetections.length} sourced community detections across ${services.length-actualGaps.length} services; ${actualGaps.length} explicit gaps.`);
