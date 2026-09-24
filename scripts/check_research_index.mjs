import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {services,connections} from '../catalog.js';
import {scenarios} from '../scenario-data.js';
import {communityDetections} from '../community-detections.js';
import {scenarioFacts,scenarioSearchText,coverageRows} from '../research-index.js';

const documents=JSON.parse(await readFile(new URL('../generated/docs.json',import.meta.url),'utf8')).documents;
const rows=coverageRows(documents);
assert.equal(rows.length,services.length);
assert.equal(new Set(rows.map(row=>row.service.id)).size,services.length);
for(const row of rows){
  const id=row.service.id;
  assert.equal(row.rules.length,communityDetections.filter(rule=>rule.services.includes(id)).length);
  assert.equal(row.links.length,connections.filter(link=>link.from===id||link.to===id).length);
  assert.equal(row.paths.length,scenarios.filter(scenario=>scenario.services.includes(id)).length);
  assert.equal(row.topics,documents.find(doc=>doc.id===id&&doc.status==='ok')?.sections.length??0);
}

// Losing a source index must not convert unknown coverage into an asserted gap.
assert.ok(coverageRows([],false).every(row=>row.topics===null));
assert.ok(coverageRows([]).every(row=>row.topics===0));
assert.equal(coverageRows([{id:'s3',status:'error',sections:[{title:'Stale'}]}]).find(row=>row.service.id==='s3').topics,0);

// Repeated stages do not inflate service counts or repeat the same rule.
const repeated={...scenarios[0],stages:[...scenarios[0].stages,scenarios[0].stages[0]]};
assert.equal(scenarioFacts(repeated).serviceIds.length,scenarioFacts(scenarios[0]).serviceIds.length);
assert.equal(scenarioFacts(repeated).rules.length,scenarioFacts(scenarios[0]).rules.length);
for(const scenario of scenarios){
  const facts=scenarioFacts(scenario);
  assert.equal(new Set(facts.rules.map(rule=>rule.id)).size,facts.rules.length);
  assert.deepEqual(facts.gaps,facts.serviceIds.filter(id=>!communityDetections.some(rule=>rule.services.includes(id))));
  assert.ok(scenarioSearchText(scenario).includes(scenario.title.toLowerCase()));
  assert.ok(scenarioSearchText(scenario).includes(scenario.stages[0].signal.toLowerCase()));
}
console.log('Research coverage: source fidelity, unknown states, repeated stages, and search passed.');
