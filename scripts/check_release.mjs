import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseRoute} from '../route-utils.js';
import {evidenceGuides,evidenceReviewDate} from '../evidence-data.js';
import {services} from '../catalog.js';

for(const hash of ['#/coverage','#/coverage/','#%2Fcoverage','#/coverage?view=services'])assert.equal(parseRoute(hash).type,'coverage',hash);
assert.equal(parseRoute('#/nodes').type,'library');
assert.equal(parseRoute('#/universe').type,'');
assert.equal(parseRoute('#/scenario/web-to-role?stage=3').params.get('stage'),'3');
assert.equal(parseRoute('#/paths?q=read%3Fwrite%26test').params.get('q'),'read?write&test');
for(const hash of ['#/missing','#/service','#/service/s3/topic/NaN','#/coverage/extra','#/domain/data/extra','#/%E0%A4%A'])assert.equal(parseRoute(hash).type,'404',hash);
const serviceIds=new Set(services.map(s=>s.id));
assert.equal(new Set(evidenceGuides.map(g=>g.id)).size,evidenceGuides.length);
assert.equal(evidenceGuides.length,6);
assert.match(evidenceReviewDate,/^\d{4}-\d{2}-\d{2}$/);
for(const guide of evidenceGuides){
  assert.equal(new URL(guide.source).hostname,'docs.aws.amazon.com');
  assert.equal(new URL(guide.source).protocol,'https:');
  for(const id of guide.services)assert.ok(serviceIds.has(id),`${guide.id}: unknown service ${id}`);
  for(const field of ['title','category','availability','describes','prerequisite','limitation'])assert.ok(guide[field]?.trim(),`${guide.id}: ${field}`);
  assert.equal(guide.checks.length,2);
}
const root=new URL('../dist/',import.meta.url);
const {release,assets}=JSON.parse(await readFile(new URL('release.json',root),'utf8'));
const html=await readFile(new URL('index.html',root),'utf8');
assert.ok(html.includes(`universe.${release}.js`),'The HTML must use this release’s router');
assert.ok(html.includes(`workspace.${release}.css`));
const outputs=new Set(Object.values(assets));
for(const [source,file] of Object.entries(assets)){
  assert.ok(file.includes(`.${release}.`));
  const body=await readFile(new URL(file,root),'utf8');
  if(source.endsWith('.js'))for(const match of body.matchAll(/['"]\.\/([\w.-]+\.js)['"]/g))assert.ok(outputs.has(match[1]),`${file} has a stale module reference: ${match[1]}`);
}
console.log(`Release ${release}: hashed assets, import graph, route parsing, and six sourced evidence guides passed.`);
