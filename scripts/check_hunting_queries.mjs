import assert from 'node:assert/strict';
import {services} from '../catalog.js';
import {huntingQueries} from '../hunting-queries.js';

const serviceIds=services.map(service=>service.id);
const queryIds=Object.keys(huntingQueries);
assert.deepEqual([...queryIds].sort(),[...serviceIds].sort(),'Every service must have exactly one hunt query');

for(const id of serviceIds){
  const item=huntingQueries[id];
  assert.equal(item.platform,'CloudTrail Lake',id+': unexpected query platform');
  assert.ok(item.title&&item.coverage,id+': missing query context');
  assert.match(item.source,/^https:\/\/docs\.aws\.amazon\.com\/awscloudtrail\//,id+': query source must be official CloudTrail documentation');
  assert.ok(item.eventSources.length>0,id+': no event source');
  assert.equal(new Set(item.eventSources).size,item.eventSources.length,id+': duplicate event source');
  assert.ok(item.eventNames.length>0,id+': no event names');
  assert.equal(new Set(item.eventNames).size,item.eventNames.length,id+': duplicate event name');
  for(const source of item.eventSources){
    assert.match(source,/^[a-z0-9-]+\.amazonaws\.com$/,id+': invalid CloudTrail eventSource '+source);
    assert.ok(item.query.includes(`'${source}'`),id+': query omits event source '+source);
  }
  for(const name of item.eventNames){
    assert.match(name,/^[A-Z][A-Za-z0-9]+$/,id+': invalid API event name '+name);
    assert.ok(item.query.includes(`'${name}'`),id+': query omits API event '+name);
  }
  assert.match(item.query,/^SELECT\n/,'Query must be read-only SELECT: '+id);
  assert.ok(item.query.includes('FROM <EVENT_DATA_STORE_ID>'),id+': event data store placeholder missing');
  assert.ok(item.query.includes("timestamp '<START_TIME>'"),id+': start-time placeholder missing');
  assert.ok(item.query.includes("timestamp '<END_TIME>'"),id+': end-time placeholder missing');
  assert.match(item.query,/userIdentity\.arn AS actor/,id+': actor field missing');
  assert.match(item.query,/ORDER BY eventTime DESC;/,id+': time ordering missing');
  assert.doesNotMatch(item.query,/\b(?:UPDATE|INSERT INTO|DELETE FROM|DROP TABLE|ALTER TABLE|CREATE TABLE)\b/i,id+': mutating SQL is not allowed');
}

console.log('Checked '+queryIds.length+' sourced, read-only service hunt queries.');
