import {domains,serviceById,domainFor} from './catalog.js';
import {scenarios,scenarioSources} from './scenario-data.js';
import {glyphs} from './node-symbols.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const glyph=d=>`<svg viewBox="-22 -22 44 44" aria-hidden="true"><path d="${glyphs[d.id]}"/></svg>`;

export function mountPathIndex(root){
  let domain='all';
  root.innerHTML=`<section class="content-page paths-page"><div class="breadcrumb"><a href="#/">Atlas</a><span>/</span><span>Attack paths</span></div>
    <div class="content-hero paths-hero"><div><span class="eyebrow">FIELD NOTES / ${scenarios.length} RESEARCH PATHS</span><h1>Follow the attack.<br><em>Read the evidence.</em></h1><p>Explore a scenario one stage at a time. See the service involved, the evidence to collect, and the controls to review.</p></div><div class="path-index-guide"><span class="reader-label">HOW TO READ A PATH</span><p><b>01</b> Choose a question</p><p><b>02</b> Follow the service sequence</p><p><b>03</b> Compare evidence and response</p></div></div>
    <div class="path-discovery"><label for="path-search">Find an investigation<input id="path-search" type="search" placeholder="Service, scenario, or MITRE ID…"></label><div class="path-domain-filters" role="group" aria-label="Filter paths by service domain"><button data-path-domain="all" aria-pressed="true">All paths</button>${domains.map(d=>`<button data-path-domain="${d.id}" aria-pressed="false" style="--color:${d.color}">${esc(d.short)}</button>`).join('')}</div></div>
    <div class="path-results-line"><p class="path-result-count" role="status" aria-live="polite"></p><span>Arrows show scenario order · domains are editorial groupings</span></div><div class="scenario-grid"></div></section>`;
  function render(){
    const query=root.querySelector('#path-search').value.toLowerCase().trim();
    const results=scenarios.filter(s=>(domain==='all'||s.services.some(id=>domainFor(id).id===domain))&&[s.title,s.summary,...s.mitre,...s.services.map(id=>serviceById(id).name),...s.stages.map(stage=>stage.title)].join(' ').toLowerCase().includes(query));
    root.querySelector('.path-result-count').textContent=`${results.length} of ${scenarios.length} research paths`;
    root.querySelector('.scenario-grid').innerHTML=results.map(s=>`<a class="scenario-card reader-path-card" href="#/scenario/${s.id}"><div class="scenario-card-top"><span>FIELD NOTE / ${String(scenarios.indexOf(s)+1).padStart(2,'0')}</span><span>${s.stages.length} STAGES</span></div><div class="path-card-kicker">${esc(s.kicker)}</div><h2>${esc(s.title)}</h2><p>${esc(s.summary)}</p><ol class="reader-mini-chain" style="--stage-count:${s.stages.length}" aria-label="Scenario service sequence">${s.stages.map((stage,i)=>{const d=domainFor(stage.service),service=serviceById(stage.service);return `<li style="--color:${d.color}" aria-label="Stage ${i+1}, ${esc(service.name)}: ${esc(stage.title)}"><span class="reader-chain-index">${String(i+1).padStart(2,'0')}</span><span class="reader-chain-node">${glyph(d)}</span><strong>${esc(service.short)}</strong></li>`;}).join('')}</ol><div class="path-card-span"><span><small>START</small>${esc(serviceById(s.stages[0].service).short)}</span><i>→</i><span><small>OUTCOME</small>${esc(serviceById(s.stages.at(-1).service).short)}</span></div><div class="path-card-basis"><span>BASIS</span>${esc(s.confidence)} · ${scenarioSources(s).length} sources</div><div class="mitre-row">${s.mitre.map(id=>`<span>${esc(id)}</span>`).join('')}</div><strong class="open-path">Read investigation <span>↗</span></strong></a>`).join('')||'<div class="path-empty"><h2>No paths match these filters.</h2><p>Try a service name or clear the filters.</p><button class="path-reset">Clear filters</button></div>';
    const reset=root.querySelector('.path-reset');if(reset)reset.onclick=()=>{domain='all';root.querySelector('#path-search').value='';updateFilters();render();};
  }
  function updateFilters(){root.querySelectorAll('[data-path-domain]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.pathDomain===domain)));}
  root.querySelector('#path-search').oninput=render;
  root.querySelectorAll('[data-path-domain]').forEach(button=>button.onclick=()=>{domain=button.dataset.pathDomain;updateFilters();render();});
  render();
}

export function enhanceScenarioReader(page){
  const story=page.querySelector('.mind-story-host'),trace=page.querySelector('.attack-trace');
  const notes=document.createElement('details');notes.className='scenario-full-notes';
  const summary=document.createElement('summary');summary.textContent='Read the full stage notes';
  trace.before(notes);notes.append(summary,trace);
  const targets=[['Sequence',story],['Response',page.querySelector('.response-grid')],['Related service rules',page.querySelector('.scenario-detections')],['Sources',page.querySelector('.scenario-sources')]];
  const nav=document.createElement('nav');nav.className='scenario-section-nav';nav.setAttribute('aria-label','On this investigation');
  nav.innerHTML='<span>ON THIS PAGE</span>';
  targets.forEach(([label,element],i)=>{
    element.id=`investigation-section-${i}`;
    const button=document.createElement('button');button.textContent=label;
    button.onclick=()=>{element.scrollIntoView({behavior:'instant',block:'start'});element.setAttribute('tabindex','-1');element.focus({preventScroll:true});};
    nav.append(button);
  });
  story.before(nav);
}

export function enhanceSourceReader(page){
  const nav=document.createElement('nav');
  nav.className='scenario-section-nav source-section-nav';
  nav.setAttribute('aria-label','On this sources page');
  nav.innerHTML='<span>ON THIS PAGE</span>';
  [['Research & playbooks','.reference-catalog'],['Service research','.hacktricks-source-index'],['Community rules','.community-source-index'],['AWS documentation','.aws-source-index']].forEach(([label,selector])=>{
    const section=page.querySelector(selector),button=document.createElement('button');
    button.textContent=label;
    button.onclick=()=>{section.scrollIntoView({behavior:'instant',block:'start'});section.setAttribute('tabindex','-1');section.focus({preventScroll:true});};
    nav.append(button);
  });
  page.querySelector('.source-principles').after(nav);
}
