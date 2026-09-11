import assert from 'node:assert/strict';
import {services} from '../catalog.js';
import {researchSources,scenarios} from '../scenario-data.js';

const serviceIds=new Set(services.map(service=>service.id));
const expectedNewScenarios=['ebs-snapshot-cross-account-exposure','s3-replication-cross-account-exfiltration','ssm-run-command-host-execution'];
const pinnedResearch={
  offensiveCloud:'f91d349debbd6fc697962c42c6922c8e14a4967e',
  awesomeAwsSecurity:'b613b720f0c2d68636e9f3bfc0e4b295a8848241',
  awsDetectionLab:'4a985c0bb78862748591387b1eaebbd3568df89f'
};
assert.equal(scenarios.length,20,'The scenario corpus changed; review provenance and update this invariant');
assert.equal(new Set(scenarios.map(scenario=>scenario.id)).size,scenarios.length,'Scenario IDs must be unique');
assert.deepEqual(scenarios.filter(scenario=>expectedNewScenarios.includes(scenario.id)).map(scenario=>scenario.id).sort(),expectedNewScenarios);

for(const scenario of scenarios){
  assert.ok(scenario.title&&scenario.summary&&scenario.confidence,scenario.id+': missing description');
  assert.ok(scenario.stages.length>=4,scenario.id+': expected at least four stages');
  assert.equal(new Set(scenario.services).size,scenario.services.length,scenario.id+': duplicate service');
  assert.equal(new Set(scenario.sources).size,scenario.sources.length,scenario.id+': duplicate source');
  assert.equal(scenario.detect.length,3,scenario.id+': expected three detection actions');
  assert.equal(scenario.contain.length,3,scenario.id+': expected three containment actions');
  assert.equal(scenario.harden.length,3,scenario.id+': expected three hardening actions');
  for(const id of scenario.services)assert.ok(serviceIds.has(id),scenario.id+': unknown service '+id);
  for(const stage of scenario.stages){
    assert.ok(serviceIds.has(stage.service),scenario.id+': unknown stage service '+stage.service);
    assert.ok(scenario.services.includes(stage.service),scenario.id+': stage service omitted from scenario services: '+stage.service);
    assert.ok(stage.title&&stage.detail&&stage.signal,scenario.id+': incomplete stage');
  }
  for(const source of scenario.sources)assert.ok(researchSources[source],scenario.id+': unknown source '+source);
}

const sourceUrls=new Set();
for(const [id,source] of Object.entries(researchSources)){
  assert.match(source.url,/^https:\/\//,id+': source URL must use HTTPS');
  assert.ok(source.label&&source.publisher&&source.kind,id+': incomplete source metadata');
  assert.ok(!sourceUrls.has(source.url),id+': duplicate source URL');
  sourceUrls.add(source.url);
}

for(const [id,commit] of Object.entries(pinnedResearch))assert.ok(researchSources[id].url.includes(commit),id+': source must remain commit-pinned');
const labRules=Object.entries(researchSources).filter(([id])=>/^awsDetection(?:Root|CloudTrail|NoMfa|ConsoleBrute|S3Public|IamPolicy|SecurityGroup|UnusedRegion)$/.test(id));
assert.equal(labRules.length,8,'Expected all eight reviewed native detection references');
labRules.forEach(([id,source])=>assert.ok(source.url.includes(pinnedResearch.awsDetectionLab),id+': detection reference must be commit-pinned'));
for(const id of expectedNewScenarios){
  const scenario=scenarios.find(item=>item.id===id);
  assert.ok(scenario.sources.includes('offensiveCloud'),id+': missing requested offensive research source');
  assert.ok(scenario.sources.some(key=>researchSources[key].kind==='OFFICIAL'),id+': attack mechanics require an official behavior source');
}

const coveredServices=new Set(scenarios.flatMap(scenario=>scenario.services));
assert.deepEqual([...coveredServices].sort(),[...serviceIds].sort(),'Every service must appear in at least one sourced scenario');

console.log('Checked '+scenarios.length+' sourced attack and response scenarios.');
