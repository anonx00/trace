import assert from 'node:assert/strict';
import {services} from '../catalog.js';
import {defensiveCommands} from '../defensive-commands.js';

const serviceIds=services.map(service=>service.id).sort();
const commandIds=Object.keys(defensiveCommands).sort();
assert.deepEqual(commandIds,serviceIds,'Every service must have exactly one field command');

const mutating=['create-','delete-','disable-','enable-','execute-','invoke-','put-','purge-','restore-','run-','send-','start-','stop-','update-'];
for(const [id,item] of Object.entries(defensiveCommands)){
  assert.match(item.command,/^aws [a-z0-9-]+ [a-z0-9-]+(?: |$)/,id+': malformed AWS CLI command');
  assert.ok(!mutating.some(action=>item.command.includes(' '+action)),id+': field command must be read-only');
  assert.match(item.source,/^https:\/\/docs\.aws\.amazon\.com\/cli\/latest\/reference\/.+\.html$/,id+': source must be an AWS CLI reference');
  assert.ok(item.title.length>=12,id+': add a useful command purpose');
}

console.log('Checked '+commandIds.length+' read-only AWS CLI field commands.');
