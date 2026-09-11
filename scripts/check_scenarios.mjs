import assert from 'node:assert/strict';
import {services} from '../catalog.js';
import {researchSources,scenarios} from '../scenario-data.js';

const serviceIds=new Set(services.map(service=>service.id));
assert.equal(new Set(scenarios.map(scenario=>scenario.id)).size,scenarios.length,'Scenario IDs must be unique');

for(const scenario of scenarios){
  assert.ok(scenario.title&&scenario.summary&&scenario.confidence,scenario.id+': missing description');
  assert.ok(scenario.stages.length>=4,scenario.id+': expected at least four stages');
  assert.equal(scenario.detect.length,3,scenario.id+': expected three detection actions');
  assert.equal(scenario.contain.length,3,scenario.id+': expected three containment actions');
  assert.equal(scenario.harden.length,3,scenario.id+': expected three hardening actions');
  for(const id of scenario.services)assert.ok(serviceIds.has(id),scenario.id+': unknown service '+id);
  for(const stage of scenario.stages){
    assert.ok(serviceIds.has(stage.service),scenario.id+': unknown stage service '+stage.service);
    assert.ok(stage.title&&stage.detail&&stage.signal,scenario.id+': incomplete stage');
  }
  for(const source of scenario.sources)assert.ok(researchSources[source],scenario.id+': unknown source '+source);
}

for(const [id,source] of Object.entries(researchSources)){
  assert.match(source.url,/^https:\/\//,id+': source URL must use HTTPS');
  assert.ok(source.label&&source.publisher&&source.kind,id+': incomplete source metadata');
}

const coveredServices=new Set(scenarios.flatMap(scenario=>scenario.services));
assert.deepEqual([...coveredServices].sort(),[...serviceIds].sort(),'Every service must appear in at least one sourced scenario');

console.log('Checked '+scenarios.length+' sourced attack and response scenarios.');
