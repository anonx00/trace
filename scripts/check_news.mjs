import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {services} from '../catalog.js';

const ROOT=fileURLToPath(new URL('../',import.meta.url));
const SNAPSHOT=path.join(ROOT,'generated','news.json');
const SOURCE_CONFIG=path.join(ROOT,'scripts','news_sources.json');
const serviceIds=new Set(services.map(service=>service.id));
const allowedCategories=new Set([
  'vulnerability','service-change','policy-change','detection-change','threat-research'
]);
const allowedMappingMethods=new Set([
  'fixed-source','title-exact','title-with-aws-context','component-exact','editorial-review'
]);
const allowedReferenceHosts=new Set([
  'aws.amazon.com','docs.aws.amazon.com','github.com','www.cve.org','cve.org',
  'www.cisa.gov','cisa.gov','alas.aws.amazon.com'
]);
const allowedGithubOwners=new Set(['aws','awslabs']);
const itemFields=new Set([
  'id','title','summary','whyItMatters','checks','category','services','mapping','basis',
  'publishedAt','retrievedAt','expiresAt','source','references','review'
]);
const forbiddenKeys=new Set([
  'raw','rawBody','rawHtml','body','bodyHtml','content','contentHtml','oauth',
  'token','accessToken','refreshToken','clientId','clientSecret','authorization'
].map(key=>key.toLowerCase()));
const htmlPattern=/<\/?[a-z][^>]*>|<!doctype|<\?xml|javascript:/i;
const trackingPattern=/(?:^|[?&])(utm_[^=]*|fbclid|gclid|mc_[^=]*)=/i;

function parseIso(value,label){
  assert.equal(typeof value,'string',`${label} must be an ISO timestamp`);
  assert.match(value,/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/,`${label} must be normalized to UTC`);
  const parsed=Date.parse(value);
  assert.ok(Number.isFinite(parsed),`${label} is invalid`);
  return parsed;
}

function parseHttps(value,label){
  assert.equal(typeof value,'string',`${label} must be a URL`);
  const parsed=new URL(value);
  assert.equal(parsed.protocol,'https:',`${label} must use HTTPS`);
  assert.equal(parsed.username,'',`${label} must not contain credentials`);
  assert.equal(parsed.password,'',`${label} must not contain credentials`);
  assert.equal(parsed.hash,'',`${label} must not contain a fragment`);
  assert.doesNotMatch(parsed.search,trackingPattern,`${label} must not contain tracking parameters`);
  return parsed;
}

function text(value,label,{min=1,max=400}={}){
  assert.equal(typeof value,'string',`${label} must be text`);
  assert.equal(value,value.trim(),`${label} must not have surrounding whitespace`);
  assert.ok(value.length>=min&&value.length<=max,`${label} must be ${min}-${max} characters`);
  assert.doesNotMatch(value,htmlPattern,`${label} must be plain text`);
  assert.doesNotMatch(value,/\r|\n/,`${label} must be a single readable paragraph`);
}

function rejectPrivateFields(value,trail='snapshot'){
  if(!value||typeof value!=='object')return;
  for(const [key,child] of Object.entries(value)){
    assert.ok(!forbiddenKeys.has(key.toLowerCase()),`${trail}.${key} is not publishable`);
    rejectPrivateFields(child,`${trail}.${key}`);
  }
}

function exactKeys(value,expected,label){
  assert.ok(value&&typeof value==='object'&&!Array.isArray(value),`${label} must be an object`);
  assert.deepEqual(Object.keys(value).sort(),[...expected].sort(),`${label} has missing or unsupported fields`);
}

export async function validateNewsSnapshot(snapshot,sourceConfig){
  exactKeys(snapshot,new Set(['schemaVersion','publication','generatedAt','snapshotExpiresAt','policy','items']),'snapshot');
  assert.equal(snapshot?.schemaVersion,1,'Unsupported news schema');
  assert.equal(snapshot.publication,'published','Only the reviewed publication may be copied to the site');
  assert.ok(snapshot.policy&&typeof snapshot.policy==='object','Snapshot policy is required');
  exactKeys(snapshot.policy,new Set(['maxItemsPerService','staleAfterDays','expiredItems','pendingItems','linksPerItem']),'snapshot.policy');
  assert.equal(snapshot.policy.maxItemsPerService,3,'Published UI density must remain capped at three items per service');
  assert.equal(snapshot.policy.staleAfterDays,14,'Snapshot freshness window must remain fourteen days');
  const generatedAt=parseIso(snapshot.generatedAt,'generatedAt');
  const snapshotExpiresAt=parseIso(snapshot.snapshotExpiresAt,'snapshotExpiresAt');
  assert.ok(snapshotExpiresAt>generatedAt,'snapshotExpiresAt must follow generatedAt');
  assert.equal(snapshotExpiresAt-generatedAt,14*24*60*60*1000,'Snapshot freshness must be exactly fourteen days');
  assert.ok(Array.isArray(snapshot.items),'items must be an array');
  assert.ok(snapshot.items.length<=50,'Published snapshot is too large');

  assert.equal(sourceConfig?.schemaVersion,1,'Unsupported source configuration');
  const configuredSources=new Map(sourceConfig.sources.map(source=>[source.feedUrl,source]));
  assert.equal(configuredSources.size,sourceConfig.sources.length,'Feed URLs must be unique');
  const seenIds=new Set(),seenUrls=new Set(),perService=new Map();

  for(const [index,item] of snapshot.items.entries()){
    const label=`items[${index}]`;
    exactKeys(item,itemFields,label);
    text(item.id,`${label}.id`,{max:160});
    assert.match(item.id,/^[a-z0-9][a-z0-9-]+$/,`${label}.id must be stable and URL-safe`);
    assert.ok(!seenIds.has(item.id),`${label}.id is duplicated`);seenIds.add(item.id);
    text(item.title,`${label}.title`,{min:12,max:200});
    text(item.summary,`${label}.summary`,{min:24,max:500});
    text(item.whyItMatters,`${label}.whyItMatters`,{min:20,max:420});
    assert.ok(allowedCategories.has(item.category),`${label}.category is unsupported`);
    text(item.basis,`${label}.basis`,{min:20,max:900});

    const publishedAt=parseIso(item.publishedAt,`${label}.publishedAt`);
    const retrievedAt=parseIso(item.retrievedAt,`${label}.retrievedAt`);
    const expiresAt=parseIso(item.expiresAt,`${label}.expiresAt`);
    assert.ok(publishedAt<=retrievedAt,`${label} was retrieved before publication`);
    assert.ok(retrievedAt<=generatedAt,`${label} retrieval is newer than the snapshot`);
    assert.ok(expiresAt>generatedAt,`${label} is already expired and must be pruned`);
    assert.ok(expiresAt-publishedAt<=120*24*60*60*1000,`${label} remains visible for too long`);

    assert.ok(Array.isArray(item.services)&&item.services.length>=1&&item.services.length<=5,`${label}.services must contain 1-5 nodes`);
    assert.equal(new Set(item.services).size,item.services.length,`${label}.services contains duplicates`);
    for(const serviceId of item.services){
      assert.ok(serviceIds.has(serviceId),`${label} maps unknown service ${serviceId}`);
      perService.set(serviceId,(perService.get(serviceId)||0)+1);
    }
    assert.ok(Array.isArray(item.mapping)&&item.mapping.length===item.services.length,`${label}.mapping must explain every service`);
    assert.deepEqual([...new Set(item.mapping.map(entry=>entry.service))].sort(),[...item.services].sort(),`${label}.mapping must match services exactly`);
    for(const [mappingIndex,mapping] of item.mapping.entries()){
      exactKeys(mapping,new Set(['service','method','term','basis']),`${label}.mapping[${mappingIndex}]`);
      assert.ok(allowedMappingMethods.has(mapping.method),`${label}.mapping[${mappingIndex}].method is unsupported`);
      text(mapping.term,`${label}.mapping[${mappingIndex}].term`,{max:120});
      text(mapping.basis,`${label}.mapping[${mappingIndex}].basis`,{min:8,max:260});
    }

    assert.ok(Array.isArray(item.checks)&&item.checks.length>=1&&item.checks.length<=3,`${label}.checks must contain 1-3 defensive checks`);
    item.checks.forEach((check,checkIndex)=>text(check,`${label}.checks[${checkIndex}]`,{min:12,max:240}));

    assert.ok(item.source&&typeof item.source==='object',`${label}.source is required`);
    exactKeys(item.source,new Set(['publisher','kind','url','feedLabel','feedUrl']),`${label}.source`);
    text(item.source.publisher,`${label}.source.publisher`,{max:80});
    text(item.source.feedLabel,`${label}.source.feedLabel`,{max:120});
    const feed=parseHttps(item.source.feedUrl,`${label}.source.feedUrl`);
    const configured=configuredSources.get(feed.href);
    assert.ok(configured,`${label}.source.feedUrl is not allowlisted`);
    assert.equal(item.source.kind,configured.kind,`${label}.source.kind does not match its allowlisted feed`);
    assert.equal(item.source.publisher,configured.publisher,`${label}.source.publisher does not match its allowlisted feed`);
    assert.equal(item.source.feedLabel,configured.feedLabel,`${label}.source.feedLabel does not match its allowlisted feed`);
    const sourceUrl=parseHttps(item.source.url,`${label}.source.url`);
    assert.equal(sourceUrl.href,item.source.url,`${label}.source.url must be canonical`);
    assert.ok(configured.allowedItemHosts.includes(sourceUrl.hostname.toLowerCase()),`${label}.source.url left the source allowlist`);
    // Documentation history feeds legitimately point several dated entries at
    // one changelog page. Other source kinds still require one canonical URL
    // per published item.
    if(item.source.kind!=='official-doc-update'){
      assert.ok(!seenUrls.has(sourceUrl.href),`${label}.source.url is duplicated`);
      seenUrls.add(sourceUrl.href);
    }

    assert.ok(Array.isArray(item.references)&&item.references.length<=1,`${label}.references must contain at most one primary reference`);
    for(const [referenceIndex,reference] of item.references.entries()){
      exactKeys(reference,new Set(['label','url']),`${label}.references[${referenceIndex}]`);
      text(reference.label,`${label}.references[${referenceIndex}].label`,{min:3,max:100});
      const referenceUrl=parseHttps(reference.url,`${label}.references[${referenceIndex}].url`);
      assert.equal(referenceUrl.href,reference.url,`${label}.references[${referenceIndex}].url must be canonical`);
      assert.ok(allowedReferenceHosts.has(referenceUrl.hostname.toLowerCase()),`${label}.references[${referenceIndex}] is not a primary-source host`);
      if(referenceUrl.hostname.toLowerCase()==='github.com'){
        const owner=decodeURIComponent(referenceUrl.pathname.split('/').filter(Boolean)[0]||'').toLowerCase();
        assert.ok(allowedGithubOwners.has(owner),`${label}.references[${referenceIndex}] must use an allowlisted AWS GitHub organization`);
      }
      assert.notEqual(referenceUrl.href,sourceUrl.href,`${label} repeats its original source as a reference`);
    }

    assert.deepEqual(Object.keys(item.review||{}).sort(),['reviewedAt','status'],`${label}.review contains unsupported claims`);
    assert.equal(item.review.status,'approved',`${label} is not approved and must not be published`);
    const reviewedAt=parseIso(item.review.reviewedAt,`${label}.review.reviewedAt`);
    assert.ok(reviewedAt>=retrievedAt,`${label} was reviewed before retrieval`);
    assert.ok(reviewedAt<=generatedAt,`${label} review is newer than the snapshot`);
  }
  for(const [serviceId,count] of perService)assert.ok(count<=3,`${serviceId} has ${count} items; publish at most three`);
  rejectPrivateFields(snapshot);
  return {items:snapshot.items.length,services:perService.size};
}

async function main(){
  const [snapshot,sourceConfig]=await Promise.all([
    readFile(SNAPSHOT,'utf8').then(JSON.parse),
    readFile(SOURCE_CONFIG,'utf8').then(JSON.parse)
  ]);
  const result=await validateNewsSnapshot(snapshot,sourceConfig);
  console.log(`Checked ${result.items} approved time-sensitive items across ${result.services} AWS services.`);
}

if(process.argv[1]&&pathToFileURL(path.resolve(process.argv[1])).href===import.meta.url)await main();
