import {domains,serviceById,domainFor} from './catalog.js';
import {scenarios,scenarioSources} from './scenario-data.js';
import {glyphs} from './node-symbols.js';
import {scenarioFacts,scenarioSearchText} from './research-index.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const glyph=d=>`<svg viewBox="-22 -22 44 44" aria-hidden="true"><path d="${glyphs[d.id]}"/></svg>`;

export function mountPathIndex(root){
  const params=new URLSearchParams(location.hash.split('?')[1]||'');
  let domain=domains.some(d=>d.id===params.get('domain'))?params.get('domain'):'all',layout=params.get('layout')==='compact'?'compact':'cards';
  root.innerHTML=`<section class="content-page paths-page"><div class="breadcrumb"><a href="#/">Atlas</a><span>/</span><span>Attack paths</span></div>
    <div class="content-hero paths-hero"><div><span class="eyebrow">FIELD NOTES / ${scenarios.length} RESEARCH PATHS</span><h1>Follow the attack.<br><em>Read the evidence.</em></h1><p>Explore a scenario one stage at a time. See the service involved, the evidence to collect, and the controls to review.</p></div><div class="path-index-guide"><span class="reader-label">HOW TO READ A PATH</span><p><b>01</b> Choose a question</p><p><b>02</b> Follow the service sequence</p><p><b>03</b> Compare evidence and response</p></div></div>
    <div class="path-discovery"><label for="path-search">Find an investigation<input id="path-search" type="search" placeholder="Service, scenario, or MITRE ID…"></label><div class="path-domain-filters" role="group" aria-label="Filter paths by service domain"><button data-path-domain="all" aria-pressed="true">All paths</button>${domains.map(d=>`<button data-path-domain="${d.id}" aria-pressed="false" style="--color:${d.color}">${esc(d.short)}</button>`).join('')}</div></div>
    <div class="path-refine"><label>Service<select id="path-service"><option value="all">Every service</option>${domains.map(d=>`<optgroup label="${esc(d.name)}">${d.services.map(id=>`<option value="${id}">${esc(serviceById(id).name)}</option>`).join('')}</optgroup>`).join('')}</select></label><label>Rule mapping<select id="path-coverage"><option value="all">Any mapping</option><option value="gaps">Has unmapped stage services</option><option value="mapped">All stage services mapped</option></select></label><label>Order by<select id="path-sort"><option value="editorial">Editorial order</option><option value="shortest">Fewest stages</option><option value="sources">Most references</option><option value="title">Title A–Z</option></select></label><button class="path-clear" hidden>Clear filters</button></div>
    <div class="path-results-line"><p class="path-result-count" role="status" aria-live="polite"></p><div class="path-layout" role="group" aria-label="Path layout"><button data-path-layout="cards" aria-pressed="true">Cards</button><button data-path-layout="compact" aria-pressed="false">Compact</button></div><a class="path-coverage-link" href="#/coverage">Explore service coverage ↗</a></div><p class="path-mapping-note">Rule counts are service mappings in this atlas. They do not measure whether a scenario is detectable.</p><div class="scenario-grid"></div></section>`;
  function render(){
    const query=root.querySelector('#path-search').value.toLowerCase().trim();
    const service=root.querySelector('#path-service').value,coverage=root.querySelector('#path-coverage').value,sort=root.querySelector('#path-sort').value;
    const state=new URLSearchParams();if(query)state.set('q',root.querySelector('#path-search').value.trim());if(domain!=='all')state.set('domain',domain);if(service!=='all')state.set('service',service);if(coverage!=='all')state.set('mapping',coverage);if(sort!=='editorial')state.set('sort',sort);if(layout!=='cards')state.set('layout',layout);history.replaceState(null,'','#/paths'+(state.size?'?'+state:''));
    const results=scenarios.filter(s=>{
      const facts=scenarioFacts(s);
      return (domain==='all'||s.services.some(id=>domainFor(id).id===domain))&&(service==='all'||s.services.includes(service))&&(coverage==='all'||(coverage==='gaps'?facts.gaps.length>0:facts.gaps.length===0))&&scenarioSearchText(s).includes(query);
    });
    if(sort==='shortest')results.sort((a,b)=>a.stages.length-b.stages.length);
    if(sort==='sources')results.sort((a,b)=>scenarioSources(b).length-scenarioSources(a).length);
    if(sort==='title')results.sort((a,b)=>a.title.localeCompare(b.title));
    root.querySelector('.path-clear').hidden=!(query||domain!=='all'||service!=='all'||coverage!=='all'||sort!=='editorial');
    root.querySelector('.path-result-count').textContent=`${results.length} of ${scenarios.length} research paths`;
    root.querySelector('.scenario-grid').innerHTML=results.map(s=>`<a class="scenario-card reader-path-card" href="#/scenario/${s.id}"><div class="scenario-card-top"><span>FIELD NOTE / ${String(scenarios.indexOf(s)+1).padStart(2,'0')}</span><span>${s.stages.length} STAGES</span></div><div class="path-card-kicker">${esc(s.kicker)}</div><h2>${esc(s.title)}</h2><p>${esc(s.summary)}</p><ol class="reader-mini-chain" style="--stage-count:${s.stages.length}" aria-label="Scenario service sequence">${s.stages.map((stage,i)=>{const d=domainFor(stage.service),service=serviceById(stage.service);return `<li style="--color:${d.color}" aria-label="Stage ${i+1}, ${esc(service.name)}: ${esc(stage.title)}"><span class="reader-chain-index">${String(i+1).padStart(2,'0')}</span><span class="reader-chain-node">${glyph(d)}</span><strong>${esc(service.short)}</strong></li>`;}).join('')}</ol><div class="path-card-span"><span><small>START</small>${esc(serviceById(s.stages[0].service).short)}</span><i>→</i><span><small>OUTCOME</small>${esc(serviceById(s.stages.at(-1).service).short)}</span></div><div class="path-card-basis"><span>BASIS</span>${esc(s.confidence)} · ${scenarioSources(s).length} sources</div><div class="mitre-row">${s.mitre.map(id=>`<span>${esc(id)}</span>`).join('')}</div><strong class="open-path">Read investigation <span>↗</span></strong></a>`).join('')||'<div class="path-empty"><h2>No paths match these filters.</h2><p>Try a service name or clear the filters.</p><button class="path-reset">Clear filters</button></div>';
    root.querySelectorAll('.reader-path-card').forEach(card=>{
      const scenario=scenarios.find(s=>card.getAttribute('href')==='#/scenario/'+s.id),facts=scenarioFacts(scenario);
      const metrics=document.createElement('div');metrics.className='path-facts';
      metrics.innerHTML=`<span><b>${facts.serviceIds.length}</b> stage services</span><span><b>${facts.rules.length}</b> related rules</span><span class="${facts.gaps.length?'has-gaps':'is-mapped'}"><b>${facts.gaps.length}</b> unmapped services</span>`;
      card.querySelector('.path-card-basis').before(metrics);
      card.querySelectorAll('.reader-mini-chain li').forEach((stage,i)=>{const label=document.createElement('small');label.className='path-stage-title';label.textContent=scenario.stages[i].title;stage.append(label);});
    });
    root.querySelector('.scenario-grid').classList.toggle('is-compact',layout==='compact');
    const reset=root.querySelector('.path-reset');if(reset)reset.onclick=clear;
  }
  function clear(){domain='all';root.querySelector('#path-search').value='';root.querySelector('#path-service').value='all';root.querySelector('#path-coverage').value='all';root.querySelector('#path-sort').value='editorial';updateFilters();render();}
  function updateFilters(){root.querySelectorAll('[data-path-domain]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.pathDomain===domain)));}
  root.querySelector('#path-search').oninput=render;
  root.querySelectorAll('.path-refine select').forEach(select=>select.onchange=render);
  root.querySelector('.path-clear').onclick=clear;
  root.querySelectorAll('[data-path-layout]').forEach(button=>button.onclick=()=>{layout=button.dataset.pathLayout;root.querySelectorAll('[data-path-layout]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));render();});
  root.querySelectorAll('[data-path-domain]').forEach(button=>button.onclick=()=>{domain=button.dataset.pathDomain;updateFilters();render();});
  root.querySelector('#path-search').value=params.get('q')||'';
  for(const [selector,key,fallback] of [['#path-service','service','all'],['#path-coverage','mapping','all'],['#path-sort','sort','editorial']]){const select=root.querySelector(selector),value=params.get(key);select.value=[...select.options].some(option=>option.value===value)?value:fallback;}
  root.querySelectorAll('[data-path-layout]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.pathLayout===layout)));
  updateFilters();render();
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
  [['Research & playbooks','.reference-catalog'],['Service research','.hacktricks-source-index'],['Community rules','.community-source-index'],['Current intel','.news-source-index'],['AWS documentation','.aws-source-index']].forEach(([label,selector])=>{
    const button=document.createElement('button');
    button.textContent=label;
    button.onclick=()=>{const section=page.querySelector(selector);if(!section)return;section.scrollIntoView({behavior:'instant',block:'start'});section.setAttribute('tabindex','-1');section.focus({preventScroll:true});};
    nav.append(button);
  });
  page.querySelector('.source-principles').after(nav);
}
