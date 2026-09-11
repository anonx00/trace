import assert from 'node:assert/strict';
import {services} from '../catalog.js';
import {hacktricksServiceResearch,hacktricksCoverageGaps,hacktricksForService,hacktricksReviewCommit} from '../hacktricks-data.js';

const serviceIds=new Set(services.map(service=>service.id));
const mappedIds=hacktricksServiceResearch.map(item=>item.service);
assert.equal(hacktricksServiceResearch.length,36,'Expected 36 direct HackTricks service mappings');
assert.equal(new Set(mappedIds).size,mappedIds.length,'HackTricks service mappings must be unique');
assert.deepEqual([...hacktricksCoverageGaps].sort(),['backup','fargate','identity-center','opensearch'],'Coverage gaps changed without review');

for(const item of hacktricksServiceResearch){
  assert(serviceIds.has(item.service),`Unknown service mapping: ${item.service}`);
  assert(item.title&&item.summary&&item.sourcePath,`Incomplete research metadata: ${item.service}`);
  assert.equal(item.focus.length,2,`Expected two research focus points: ${item.service}`);
  assert(item.focus.every(Boolean),`Empty research focus point: ${item.service}`);
  assert(item.url.startsWith('https://cloud.hacktricks.wiki/en/pentesting-cloud/aws-security/aws-services/'),`Unexpected live source: ${item.service}`);
  assert(item.reviewedSource.includes(`/blob/${hacktricksReviewCommit}/src/pentesting-cloud/aws-security/aws-services/`),`Source is not pinned to reviewed commit: ${item.service}`);
  assert.equal(hacktricksForService(item.service),item,`Lookup mismatch: ${item.service}`);
}

const allCoverage=new Set([...mappedIds,...hacktricksCoverageGaps]);
assert.equal(allCoverage.size,services.length,'Every TRACE service must be mapped or an explicit gap');
assert.deepEqual([...allCoverage].sort(),[...serviceIds].sort(),'HackTricks coverage does not match the TRACE catalog');
for(const gap of hacktricksCoverageGaps)assert.equal(hacktricksForService(gap),undefined,`Gap unexpectedly mapped: ${gap}`);

const requiredClaims={
  codepipeline:'PollForJobs',
  kinesis:'GetShardIterator',
  eventbridge:'Schedule target Input',
  appsync:'API key listing',
  cloudformation:'pending change-set disclosure',
};
for(const [service,claim] of Object.entries(requiredClaims)){
  const text=[hacktricksForService(service).summary,...hacktricksForService(service).focus].join(' ');
  assert(text.includes(claim),`Missing reviewed high-value focus for ${service}: ${claim}`);
}

console.log(`HackTricks coverage validated: ${mappedIds.length} mapped services, ${hacktricksCoverageGaps.length} explicit gaps, source ${hacktricksReviewCommit.slice(0,7)}.`);
