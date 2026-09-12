const snapshotUrl=new URL('./generated/news.json',import.meta.url);
const listeners=new Set();
const MAX_SNAPSHOT_BYTES=512*1024;
const NEW_WINDOW_MS=7*24*60*60*1000;
const EXPIRING_WINDOW_MS=3*24*60*60*1000;

const sourceKindLabels=Object.freeze({
  'official-bulletin':'AWS SECURITY BULLETIN',
  'official-research':'AWS SECURITY RESEARCH',
  'official-update':'AWS SERVICE UPDATE',
  'official-doc-update':'AWS DOCUMENTATION UPDATE',
  'official-advisory':'OFFICIAL ADVISORY',
  'independent-research':'INDEPENDENT RESEARCH',
  'aws-security-bulletin':'AWS SECURITY BULLETIN',
  'aws-documentation':'AWS SERVICE UPDATE',
  'aws-service-docs':'AWS SERVICE UPDATE',
  'aws-security-blog':'AWS SECURITY BLOG',
  'aws-whats-new':'AWS WHAT\u2019S NEW',
  'amazon-linux-advisory':'AMAZON LINUX ADVISORY',
  'official-github-release':'OFFICIAL RELEASE',
  'official-documentation':'OFFICIAL DOCUMENTATION',
  'official-release':'OFFICIAL RELEASE'
});

let snapshot={phase:'loading',generatedAt:null,snapshotExpiresAt:null,items:[]};

const timestamp=value=>{
  if(typeof value!=='string'||!value.trim())return null;
  const parsed=Date.parse(value);
  return Number.isFinite(parsed)?parsed:null;
};
const text=value=>typeof value==='string'?value.trim():'';
const httpsUrl=value=>{
  try{
    const parsed=new URL(value);
    return parsed.protocol==='https:'&&!parsed.username&&!parsed.password?parsed.href:null;
  }catch{return null;}
};

function normalizeReference(value){
  if(!value||typeof value!=='object')return null;
  const url=httpsUrl(value.url);
  if(!url)return null;
  return {
    url,
    label:text(value.label)||text(value.title)||text(value.publisher)||'Primary reference'
  };
}

function normalizeItem(value){
  if(!value||typeof value!=='object'||value.review?.status!=='approved')return null;
  const publishedAt=timestamp(value.publishedAt),expiresAt=timestamp(value.expiresAt),reviewedAt=timestamp(value.review.reviewedAt);
  const services=Array.isArray(value.services)?[...new Set(value.services.filter(id=>typeof id==='string'&&id.trim()).map(id=>id.trim()))]:[];
  const mapping=Array.isArray(value.mapping)?value.mapping.map(entry=>({
    service:text(entry?.service),
    method:text(entry?.method),
    term:text(entry?.term),
    basis:text(entry?.basis)
  })).filter(entry=>entry.service&&entry.term&&entry.basis):[];
  const title=text(value.title),summary=text(value.summary),whyItMatters=text(value.whyItMatters);
  const checks=Array.isArray(value.checks)?value.checks.map(text).filter(Boolean):[];
  const sourceUrl=httpsUrl(value.source?.url),publisher=text(value.source?.publisher);
  if(!publishedAt||!expiresAt||!reviewedAt||expiresAt<=publishedAt||expiresAt<=reviewedAt||!services.length||services.some(service=>!mapping.some(entry=>entry.service===service))||!title||!summary||!whyItMatters||!checks.length||!sourceUrl||!publisher)return null;
  const firstReference=Array.isArray(value.references)?normalizeReference(value.references[0]):null;
  return {
    id:text(value.id)||sourceUrl,
    title,
    summary,
    whyItMatters,
    checks,
    services,
    mapping,
    publishedAt,
    expiresAt,
    reviewedAt,
    source:{
      url:sourceUrl,
      publisher,
      kind:text(value.source.kind),
      kindLabel:sourceKindLabels[text(value.source.kind)]||'REVIEWED SOURCE'
    },
    reference:firstReference&&firstReference.url!==sourceUrl?firstReference:null
  };
}

function normalizeSnapshot(value){
  if(!value||typeof value!=='object'||Array.isArray(value)||value.schemaVersion!==1||value.publication!=='published')throw new Error('Invalid news snapshot');
  const generatedAt=timestamp(value.generatedAt),snapshotExpiresAt=timestamp(value.snapshotExpiresAt);
  if(!generatedAt||!snapshotExpiresAt||snapshotExpiresAt<=generatedAt||!Array.isArray(value.items))throw new Error('Invalid news snapshot metadata');
  return {
    phase:'ready',
    generatedAt,
    snapshotExpiresAt,
    items:value.items.slice(0,250).map(normalizeItem).filter(Boolean)
  };
}

function normalized(value){
  if(value?.phase==='ready'&&Number.isFinite(value.generatedAt)&&Number.isFinite(value.snapshotExpiresAt)&&Array.isArray(value.items))return value;
  return normalizeSnapshot(value);
}

function displayItem(item,now){
  return {
    ...item,
    publishedAt:new Date(item.publishedAt).toISOString(),
    expiresAt:new Date(item.expiresAt).toISOString(),
    reviewedAt:new Date(item.reviewedAt).toISOString(),
    freshness:item.expiresAt-now<=EXPIRING_WINDOW_MS?'EXPIRING':now-item.publishedAt<=NEW_WINDOW_MS?'NEW':'CURRENT'
  };
}

export function snapshotStatus(value,now=Date.now()){
  try{
    const candidate=normalized(value);
    return {
      valid:true,
      stale:now>=candidate.snapshotExpiresAt,
      generatedAt:new Date(candidate.generatedAt).toISOString(),
      snapshotExpiresAt:new Date(candidate.snapshotExpiresAt).toISOString()
    };
  }catch{return {valid:false,stale:false,generatedAt:null,snapshotExpiresAt:null};}
}

export function activeNewsItems(value,now=Date.now()){
  try{
    const candidate=normalized(value);
    if(now>=candidate.snapshotExpiresAt)return [];
    return candidate.items
      .filter(item=>item.publishedAt<=now&&item.expiresAt>now)
      .sort((a,b)=>b.publishedAt-a.publishedAt||a.id.localeCompare(b.id))
      .map(item=>displayItem(item,now));
  }catch{return [];}
}

export function activeNewsForService(value,serviceId,now=Date.now()){
  return activeNewsItems(value,now).filter(item=>item.services.includes(serviceId)).slice(0,3);
}

function notify(){
  listeners.forEach(listener=>{
    try{listener();}catch{/* News must never interrupt the atlas. */}
  });
}

async function loadSnapshot(){
  try{
    const response=await fetch(snapshotUrl,{cache:'no-store',credentials:'same-origin',headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error(`News snapshot request failed: ${response.status}`);
    const raw=await response.text();
    if(raw.length>MAX_SNAPSHOT_BYTES)throw new Error('News snapshot is too large');
    snapshot=normalizeSnapshot(JSON.parse(raw));
  }catch{
    snapshot={phase:'unavailable',generatedAt:null,snapshotExpiresAt:null,items:[]};
  }
  notify();
}

export function newsSnapshotState(now=Date.now()){
  const status=snapshotStatus(snapshot,now);
  return {
    phase:snapshot.phase,
    stale:status.stale,
    generatedAt:status.generatedAt,
    snapshotExpiresAt:status.snapshotExpiresAt
  };
}

export function newsForService(serviceId,now=Date.now()){
  return snapshot.phase==='ready'?activeNewsForService(snapshot,serviceId,now):[];
}

export function currentNewsItems(now=Date.now()){
  return snapshot.phase==='ready'?activeNewsItems(snapshot,now):[];
}

export function newsSearchText(serviceId,now=Date.now()){
  return newsForService(serviceId,now).map(item=>[
    item.title,item.summary,item.whyItMatters,item.source.publisher,item.source.kindLabel,
    ...item.mapping.flatMap(entry=>[entry.term,entry.basis]),...item.checks
  ].join(' ')).join(' ');
}

export function onNewsIntelUpdate(listener){
  if(typeof listener!=='function')return()=>{};
  listeners.add(listener);
  return()=>listeners.delete(listener);
}

void loadSnapshot();
