import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {activeNewsForService,activeNewsItems,snapshotStatus} from '../news-intel.js';
import {validateNewsSnapshot} from './check_news.mjs';

const ROOT=fileURLToPath(new URL('../',import.meta.url));
const [snapshot,sourceConfig]=await Promise.all([
  readFile(path.join(ROOT,'generated','news.json'),'utf8').then(JSON.parse),
  readFile(path.join(ROOT,'scripts','news_sources.json'),'utf8').then(JSON.parse)
]);
const NOW=Date.parse('2026-09-12T12:00:00Z');

const result=await validateNewsSnapshot(snapshot,sourceConfig);
assert.equal(result.items,snapshot.items.length,'Every published item must pass validation');
assert.equal(result.services,new Set(snapshot.items.flatMap(item=>item.services)).size,'Coverage must reflect explicit mappings');

const fixture={
  schemaVersion:1,
  publication:'published',
  generatedAt:'2026-09-12T00:00:00Z',
  snapshotExpiresAt:'2026-09-26T00:00:00Z',
  policy:{maxItemsPerService:3,staleAfterDays:14,expiredItems:'hidden',pendingItems:'excluded',linksPerItem:2},
  items:[{
    id:'news-browser-independent-fixture',
    title:'CVE-2026-99999 reviewed fixture for AWS Systems Manager',
    summary:'A deterministic test record exercises the reviewed news publication boundary.',
    whyItMatters:'It verifies that only current approved records reach an explicitly mapped node.',
    checks:['Confirm the source event before drawing a conclusion.'],
    category:'vulnerability',
    services:['systemsmanager'],
    mapping:[{service:'systemsmanager',method:'editorial-review',term:'AWS Systems Manager',basis:'The reviewed source names the affected Systems Manager component.'}],
    basis:'TRACE-reviewed deterministic test evidence for the publication and display guardrails.',
    publishedAt:'2026-09-10T00:00:00Z',
    retrievedAt:'2026-09-11T00:00:00Z',
    expiresAt:'2026-10-20T00:00:00Z',
    source:{
      publisher:'AWS',kind:'official-bulletin',
      url:'https://aws.amazon.com/security/security-bulletins/test-fixture/',
      feedLabel:'AWS Security Bulletins',
      feedUrl:'https://aws.amazon.com/security/security-bulletins/rss/feed/'
    },
    references:[{label:'AWS security guidance',url:'https://docs.aws.amazon.com/systems-manager/latest/userguide/security.html'}],
    review:{status:'approved',reviewedAt:'2026-09-11T12:00:00Z'}
  }]
};

await validateNewsSnapshot(fixture,sourceConfig);
assert.equal(snapshotStatus(fixture,NOW).stale,false);
assert.equal(activeNewsItems(fixture,NOW).length,1);
assert.equal(activeNewsForService(fixture,'systemsmanager',NOW).length,1);
assert.equal(activeNewsForService(fixture,'s3',NOW).length,0);
assert.equal(activeNewsForService(fixture,'systemsmanager',NOW)[0].freshness,'NEW');

const stale=structuredClone(fixture);
stale.snapshotExpiresAt='2026-09-12T11:59:59Z';
assert.equal(snapshotStatus(stale,NOW).stale,true);
assert.deepEqual(activeNewsItems(stale,NOW),[],'A stale snapshot must not imply current intelligence');

const filtered=structuredClone(fixture);
filtered.snapshotExpiresAt='2026-09-30T00:00:00Z';
filtered.items.push({...structuredClone(filtered.items[0]),id:'news-pending-fixture',review:{status:'pending',reviewedAt:null}});
filtered.items.push({...structuredClone(filtered.items[0]),id:'news-expired-fixture',expiresAt:'2026-09-12T11:59:59Z'});
assert.equal(activeNewsItems(filtered,NOW).length,1,'Pending and expired records must remain invisible');

const capped=structuredClone(fixture);
capped.snapshotExpiresAt='2026-09-30T00:00:00Z';
capped.items=[];
for(let index=0;index<4;index++){
  const item=structuredClone(fixture.items[0]);
  item.id=`news-cap-fixture-${index}`;
  item.services=['systemsmanager'];
  item.publishedAt=`2026-09-${String(8+index).padStart(2,'0')}T00:00:00Z`;
  capped.items.push(item);
}
assert.equal(activeNewsForService(capped,'systemsmanager',NOW).length,3,'A node may render at most three current items');

async function rejected(mutator,message){
  const value=structuredClone(fixture);mutator(value);
  await assert.rejects(()=>validateNewsSnapshot(value,sourceConfig),undefined,message);
}
await rejected(value=>{value.items[0].review.status='pending';},'Pending records may not enter the published snapshot');
await rejected(value=>{value.items[0].services=['not-a-trace-node'];value.items[0].mapping[0].service='not-a-trace-node';},'Unknown service mappings must fail');
await rejected(value=>{value.items[0].source.url='http://aws.amazon.com/example';},'Source URLs must use HTTPS');
await rejected(value=>{value.items[0].rawBody='<script>alert(1)</script>';},'Raw feed bodies must not be published');
await rejected(value=>{value.items[0].references.push({label:'Duplicate',url:'https://docs.aws.amazon.com/example'});},'Cards are limited to one supporting reference');
await rejected(value=>{value.items[0].expiresAt=value.generatedAt;},'Expired records must be pruned');
await rejected(value=>{value.items[0].password='must-not-publish';},'Unexpected fields must fail closed');
await rejected(value=>{value.items[0].references[0].url='https://github.com/not-aws/example';},'GitHub references must belong to an AWS organization');

console.log('News snapshot helpers and publication guardrails passed.');
