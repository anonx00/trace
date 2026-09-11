import {glyphs} from './node-symbols.js';
import {mountStory} from './story-player.js';
﻿
import {domains, services, serviceById, domainFor, connections} from './catalog.js';
import {profileFor} from './security-data.js';
import {scenarios, scenariosForService} from './scenario-data.js';
import {communityDetections, detectionsForService, detectionCoverage} from './community-detections.js';
import {mountField} from './universe-field.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const coords = [[370,130],[775,125],[1000,310],[825,535],[435,555],[175,415],[155,195],[620,365]];

const symbol = d => `<svg viewBox="-22 -22 44 44" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${glyphs[d.id]}"/></svg>`;
const metricPaths={
  nodes:'M5 6h5v5H5zM14 5h5v5h-5zM7 15h5v5H7zM15 14h4v4h-4zM10 8.5h4M9.5 11l1 4m6-5v4',
  paths:'M4 18c3-8 5-11 9-11 3 0 4 3 7 3M4 18h.01M13 7h.01M20 10h.01',
  rules:'M12 3 5 6v5c0 5 3 8 7 10 4-2 7-5 7-10V6l-7-3Zm-3 8 2 2 4-5',
  topics:'M6 3h8l4 4v14H6zM14 3v5h4M9 12h6M9 16h6',
};
const metricIcon=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${metricPaths[name]}"/></svg>`;

export function mountResearchHome(root,{topicCount=0,openSearch}={}) {
  let detail=false,storyMode=false,selected=domains[0],activeDomain=null,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,storyStageIndex=0,storyController=null;
  const compact=matchMedia('(max-width:600px)');
  const serviceList=matchMedia('(max-width:1100px)');
  const base=()=>detail&&!compact.matches?{x:0,y:0,w:1280,h:840}:compact.matches?{x:0,y:0,w:720,h:1030}:{x:0,y:0,w:1160,h:680};
  let camera=base();
  const abort=new AbortController(), on=(el,event,fn)=>el.addEventListener(event,fn,{signal:abort.signal});
  document.title='TRACE — Explore the AWS security surface';
  const headlineStats=[
    {value:services.length,label:'Security nodes',detail:'Browse the index',href:'#/library',icon:'nodes'},
    {value:scenarios.length.toString().padStart(2,'0'),label:'Research paths',detail:'Follow a sequence',href:'#/paths',icon:'paths'},
    {value:communityDetections.length,label:'Community rules',detail:'Review provenance',href:'#/sources',icon:'rules'},
    {value:topicCount,label:'AWS topics',detail:'Open source index',href:'#/sources',icon:'topics'},
  ];
  root.innerHTML=`<section class="research-home">
    <header class="atlas-hero">
      <div><p class="atlas-eyebrow"><span></span>THE AWS SECURITY RESEARCH ATLAS <b>VOL. 01 / FIELD NOTES</b></p>
      <h1>Everything connects.<br><em>Learn where it leads.</em></h1>
      <p class="atlas-lede">A visual field guide to cloud security. Explore the identities, workloads, and evidence behind every service boundary.</p>
      <div class="hero-links"><button class="atlas-primary" id="atlas-find">Find a service <span>⌕</span></button><a href="#/paths">Follow an investigation <span>↗</span></a></div></div>
      <div class="atlas-manifest"><span>BUILT FOR THE CURIOUS DEFENDER</span><p>Understand the surface.<br>Follow the evidence.<br><strong>Make the next decision.</strong></p><div class="atlas-stats">${headlineStats.map(stat=>`<a href="${stat.href}" aria-label="${stat.value} ${stat.label}. ${stat.detail}."><i>${metricIcon(stat.icon)}</i><b>${stat.value}</b><span>${stat.label.toUpperCase()}</span><small>${stat.detail} <em>↗</em></small></a>`).join('')}</div></div>
    </header>
    <section class="atlas-workspace" aria-label="Interactive security atlas">
      <div class="atlas-toolbar"><div class="atlas-map-heading"><span class="atlas-cross">✳</span><div><h2>The connected surface</h2><p id="atlas-map-context">Eight domains. Choose your point of entry.</p></div></div>
      <div class="atlas-toolbar-actions"><div class="atlas-segment" role="group" aria-label="Graph detail"><button data-detail="overview" aria-pressed="true" class="active">Domains <small>${domains.length}</small></button><button data-detail="services" aria-pressed="false">Services <small>${services.length}</small></button><button data-detail="story" aria-pressed="false">Stories <small>${scenarios.length}</small></button></div><button id="atlas-motion" aria-label="${paused?'Resume':'Pause'} atlas animation">${paused?'Resume motion':'Pause motion'}</button></div></div>
      <div class="atlas-grid">
        <div class="atlas-map-area"><div class="atlas-home-stories" hidden><label for="atlas-story-select">CHOOSE AN INVESTIGATION</label><select id="atlas-story-select">${scenarios.map(s=>`<option value="${s.id}">${esc(s.title)}</option>`).join('')}</select><div class="atlas-home-story"></div></div>
          <nav class="atlas-filters" aria-label="Filter map by domain"><button data-scope="all" class="active" aria-pressed="true">All domains</button>${domains.map(d=>`<button data-scope="${d.id}" aria-pressed="false" style="--node:${d.color}"><i></i>${esc(d.short)}</button>`).join('')}</nav>
          <div class="atlas-stage">
            <canvas class="atlas-field" aria-hidden="true"></canvas>
            <div class="atlas-coordinates" aria-hidden="true"><span>MAP / AWS</span><span>IDENTITY → EVIDENCE → RESPONSE</span></div>
            <svg class="atlas-graph world-svg" viewBox="0 0 1160 680" role="group" aria-label="AWS security knowledge map. Tab to a node and press Enter to open it. Drag to pan." tabindex="0"></svg>
            <div class="atlas-stage-footer"><span id="atlas-legend"><i></i>Editorial domain map</span><div class="atlas-zoom"><button id="zoom-out" aria-label="Zoom out">−</button><button id="zoom-fit" aria-label="Fit graph to view">100%</button><button id="zoom-in" aria-label="Zoom in">+</button></div></div>
          </div>
          <div class="atlas-service-index" hidden></div><div class="atlas-map-note"><span>EXPLORE WITH INTENT</span><p>Select a link for its source · Select a node to enter · Motion illustrates relationships, not live traffic</p></div>
        </div>
        <aside class="atlas-preview" aria-label="Selected domain preview"></aside>
      </div>
    </section>
    <section class="atlas-reading" aria-label="Guided research"><div class="atlas-reading-heading"><div><p class="atlas-eyebrow">A PLACE TO START</p><h2>Follow a question.<br>Find the connections.</h2></div><a href="#/paths">All research paths <span>↗</span></a></div><div class="atlas-paths">${scenarios.slice(0,3).map((s,i)=>`<a class="atlas-path" href="#/scenario/${s.id}"><div><span>FIELD NOTE / 0${i+1}</span><b>↗</b></div><h3>${esc(s.title)}</h3><p>${esc(s.summary)}</p><div class="atlas-path-services">${s.services.slice(0,5).map(id=>`<span style="--node:${domainFor(id).color}">${esc(serviceById(id).short)}</span>`).join('<i>→</i>')}</div><small>${s.services.length} services · ${detectionCoverage(s.services).length} reviewed rules</small></a>`).join('')}</div></section>
    <footer class="atlas-footer"><span>TRACE. <b>INDEPENDENT SECURITY RESEARCH</b></span><a href="#/sources">AWS documentation + sourced community detections ↗</a></footer>
  </section>`;
  const page=root.querySelector('.research-home'),stage=page.querySelector('.atlas-stage'),svg=page.querySelector('.atlas-graph'),preview=page.querySelector('.atlas-preview');
  const field=mountField(stage,paused);
  function showPreview(domain,service=null) {
    selected=domain;
    const p=service?profileFor(service.id):null,rules=service?detectionsForService(service.id):[],scope=service?[service.id]:domain.services;
    const paths=service?scenariosForService(service.id):scenarios.filter(scenario=>scenario.services.some(id=>scope.includes(id)));
    const links=connections.filter(connection=>scope.includes(connection.from)||scope.includes(connection.to));
    const metrics=service?[[links.length,'SOURCED LINKS'],[paths.length,'ATTACK PATHS'],[rules.length,'RULES']]:[[scope.length,'NODES'],[paths.length,'ATTACK PATHS'],[detectionCoverage(scope).length,'RULES']];
    preview.style.setProperty('--node',domain.color);
    const previewLabel=storyMode&&service?`CURRENT STAGE / ${String(storyStageIndex+1).padStart(2,'0')}`:`${service?'SERVICE':'DOMAIN'} / ${String(domains.indexOf(domain)+1).padStart(2,'0')}`;
    const previewContext=storyMode&&service?`${domain.short.toUpperCase()} · ${service.short.toUpperCase()}`:'RESEARCH CONTEXT';
    preview.innerHTML=`<div class="atlas-preview-top"><span>${previewLabel}</span><i>${esc(previewContext)}</i></div><div class="atlas-preview-symbol">${symbol(domain)}</div><h2>${esc(service?.name||domain.name)}</h2><p class="atlas-preview-description">${esc(p?.boundary||domain.description)}</p><div class="atlas-preview-metrics">${metrics.map(([value,label])=>`<div><b>${value}</b><span>${label}</span></div>`).join('')}</div><a class="atlas-preview-enter" href="#/${service?'service/'+service.id:'domain/'+domain.id}">Open ${service?'security node':'domain'} <span>↗</span></a>
      <div class="atlas-preview-section"><h3>${service?'EVIDENCE TO EXPLORE':'INSIDE THIS DOMAIN'} <span>${service?p.evidence.length:domain.services.length}</span></h3>${service?`<ul class="atlas-preview-evidence">${p.evidence.map(v=>`<li>${esc(v)}</li>`).join('')}</ul>`:`<div class="atlas-preview-services">${domain.services.map(id=>{const s=serviceById(id);return `<a href="#/service/${id}">${esc(s.name)}<span>↗</span></a>`;}).join('')}</div>`}</div>
      ${service?`<div class="atlas-preview-section atlas-detection-preview"><h3>REVIEWED DETECTIONS <span>${rules.length}</span></h3><div class="atlas-preview-detections">${rules.slice(0,2).map(rule=>`<a href="${esc(rule.source)}" target="_blank" rel="noopener noreferrer"><strong>${esc(rule.title)}</strong><span>${esc(rule.language)} · ${esc(rule.contributor)} ↗</span></a>`).join('')||'<p>No mapped community rule — visible coverage gap.</p>'}</div></div><div class="atlas-preview-section"><h3>DOCUMENTED CONNECTIONS <span>${links.length}</span></h3><div class="atlas-preview-connections">${connections.filter(c=>c.from===service.id||c.to===service.id).map(c=>`<a href="${esc(c.source)}" target="_blank" rel="noopener noreferrer"><span class="atlas-preview-link-kicker ${c.from===service.id?'outbound':'inbound'}">${c.from===service.id?'OUTBOUND':'INBOUND'}</span><strong>${esc(serviceById(c.from).short)} → ${esc(serviceById(c.to).short)}</strong><span>${esc(c.label)} ↗</span></a>`).join('')}</div></div>`:''}
      <div class="atlas-preview-bottom"><span>READ THE SIGNAL</span><p>${service?esc(p.responder):'Each service connects security context, observable evidence, defensive controls, and source documentation.'}</p><a href="#/${service?'service/'+service.id:'sources'}">${service?'Explore the full analysis':'Sources & methodology'} ↗</a></div>`;
  }
  function applyCamera(){svg.setAttribute('viewBox',`${camera.x} ${camera.y} ${camera.w} ${camera.h}`);page.querySelector('#zoom-fit').textContent=Math.round(base().w/camera.w*100)+'%';}
  function zoom(f){const w=Math.max(base().w*.25,Math.min(base().w*1.5,camera.w*f)),h=w*base().h/base().w;camera={x:camera.x+(camera.w-w)/2,y:camera.y+(camera.h-h)/2,w,h};applyCamera();}
  function draw() {
    svg.classList.remove('has-preview','has-edge-preview');
    page.classList.toggle('atlas-story-mode',storyMode);
    page.classList.toggle('atlas-services-mode',detail&&!storyMode);
    page.querySelector('.atlas-home-stories').hidden=!storyMode;

    let nodes='',links='',panels='',positions=new Map();
    const included=domains.filter(d=>!activeDomain||d.id===activeDomain);
    const coreServices=new Set(activeDomain?domains.find(d=>d.id===activeDomain).services:services.map(s=>s.id)),scopedServices=new Set(coreServices);
    if(activeDomain)connections.filter(c=>coreServices.has(c.from)||coreServices.has(c.to)).forEach(c=>{scopedServices.add(c.from);scopedServices.add(c.to);});
    const domainPoints=domains.map((d,i)=>({d,x:detail?160+(i%4)*320:compact.matches?180+(i%2)*360:coords[i][0],y:detail?50+Math.floor(i/4)*420:compact.matches?95+Math.floor(i/2)*245:coords[i][1]}));
    for(const {d,x,y} of domainPoints) {
      const muted=activeDomain&&d.id!==activeDomain,domainLinks=connections.filter(c=>domainFor(c.from).id===d.id||domainFor(c.to).id===d.id).length;
      if(detail) {
        panels+=`<rect class="atlas-domain-panel ${muted?'scope-muted':''}" x="${x-148}" y="${y-34}" width="296" height="398" rx="14"/>`;
        d.services.forEach((id,j)=>positions.set(id,{x,y:y+62+j*42}));
      }
      const satellites=Array.from({length:d.services.length},(_,j)=>{const a=j*2.399+domains.indexOf(d);return `<circle class="atlas-satellite" cx="${Math.cos(a)*58}" cy="${Math.sin(a)*58}" r="2" style="animation-delay:-${j*1.5}s"/>`;}).join('');
      nodes+=`<g class="map-node atlas-domain-node ${muted?'scope-muted':''}" data-domain-id="${d.id}" data-route="#/domain/${d.id}" role="link" tabindex="0" aria-label="${esc(d.name)}" transform="translate(${x} ${y})" style="--node:${d.color}"><title>${esc(d.name)} — open domain</title>${detail?`<rect class="atlas-domain-header" x="-138" y="-24" width="276" height="44" rx="8"/><path class="atlas-node-icon" d="${glyphs[d.id]}" transform="translate(-113 0) scale(.65)"/><text class="atlas-node-title" x="-87" y="5">${esc(d.short)}</text><text class="atlas-node-count" x="121" y="-2">${String(d.services.length).padStart(2,'0')} NODES</text><text class="atlas-domain-link-count" x="121" y="11">${String(domainLinks).padStart(2,'0')} LINKS</text>`:`<circle class="atlas-node-aura" r="65"/><circle class="atlas-node-orbit" r="50"/>${Array.from({length:3},(_,ring)=>`<circle class="atlas-node-pulse" r="${36+ring*7}" style="animation-delay:-${ring*1.2}s"/>`).join('')}<circle class="atlas-node-disc" r="33"/>${satellites}<path class="atlas-node-icon" d="${glyphs[d.id]}"/><text class="atlas-node-title" y="90">${esc(d.short)}</text><text class="atlas-node-count" y="109">${String(d.services.length).padStart(2,'0')} NODES · ${String(domainLinks).padStart(2,'0')} LINKS</text>`}</g>`;
      if(detail) d.services.forEach(id=>{const p=positions.get(id),s=serviceById(id),degree=connections.filter(c=>c.from===id||c.to===id).length,serviceMuted=activeDomain&&!scopedServices.has(id);links+=`<path class="atlas-membership ${muted?'scope-muted':''}" d="M${x-132},${y+24} V${p.y} H${p.x-120}"/>`;nodes+=`<g class="map-node atlas-service-node ${serviceMuted?'scope-muted':''}" data-domain-id="${d.id}" data-service-id="${id}" data-route="#/service/${id}" role="link" tabindex="0" aria-label="${esc(s.name)}, ${degree} sourced connections" transform="translate(${p.x} ${p.y})" style="--node:${d.color}"><title>${esc(s.name)} — ${degree} sourced connections</title><rect class="atlas-service-card" x="-120" y="-17" width="248" height="34" rx="7"/><circle class="atlas-service-core" cx="-102" r="3.5"/><text x="-88" y="5">${esc(s.short)}</text><text class="atlas-service-degree" x="100" y="4">${degree}</text><text class="atlas-service-arrow" x="116" y="5">↗</text></g>`;});
    }
    if(detail) links+=connections.filter(c=>positions.has(c.from)&&positions.has(c.to)).map((c,i)=>{
      const a=positions.get(c.from),b=positions.get(c.to),muted=activeDomain&&domainFor(c.from).id!==activeDomain&&domainFor(c.to).id!==activeDomain;
      const sameColumn=a.x===b.x,direction=b.x>a.x?1:-1;
      const start={x:a.x+(sameColumn?128:direction>0?128:-120),y:a.y},end={x:b.x+(sameColumn?128:direction>0?-120:128),y:b.y};
      const bend=sameColumn?a.x+150:(start.x+end.x)/2;
      const path=`M${start.x},${start.y} C${bend},${start.y} ${bend},${end.y} ${end.x},${end.y}`;
      return `<g class="atlas-edge ${muted?'scope-muted':''}" data-from="${c.from}" data-to="${c.to}" data-edge="${i}" tabindex="0" role="button" aria-label="${esc(serviceById(c.from).short+' to '+serviceById(c.to).short+': '+c.label)}"><path class="atlas-edge-hit" d="${path}"/><path id="atlas-capability-${i}" class="atlas-connection" d="${path}" marker-end="url(#atlas-direction)"/><circle class="atlas-service-flow" r="3.5"><animateMotion dur="${5+i%5}s" begin="-${i%5}s" repeatCount="indefinite"><mpath href="#atlas-capability-${i}"/></animateMotion></circle><title>${esc(c.label)} — select to read the AWS source</title></g>`;
    }).join('');
    else {
      const hub=compact.matches?{x:360,y:470}:{x:500,y:305};
      links=domainPoints.map(({d,x,y},i)=>`<g class="atlas-domain-route ${activeDomain&&d.id!==activeDomain?'scope-muted':''}" data-domain-id="${d.id}" style="--node:${d.color}"><path class="atlas-nav-line" id="atlas-line-${i}" d="M${hub.x},${hub.y} Q${(hub.x+x)/2},${y} ${x},${y}"/><circle class="atlas-flow" r="2" fill="${d.color}"><animateMotion dur="${8+i}s" repeatCount="indefinite"><mpath href="#atlas-line-${i}"/></animateMotion></circle></g>`).join('');
    }
    const hub=compact.matches?{x:360,y:470}:{x:500,y:305};
    svg.innerHTML=`<defs><marker id="atlas-direction" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="#9ed9cb" stroke-width="1.5"/></marker><marker id="atlas-direction-in" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="#e9a889" stroke-width="1.5"/></marker><marker id="atlas-direction-out" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M1 1 L9 5 L1 9" fill="none" stroke="#a7ead7" stroke-width="1.5"/></marker></defs><g class="world-layer atlas-world">${panels}<g class="atlas-links">${links}</g>${!detail?`<g class="atlas-center" transform="translate(${hub.x} ${hub.y})" aria-hidden="true"><circle class="atlas-center-ring" r="50"/><rect x="-63" y="-29" width="126" height="58" rx="12"/><text y="-1">AWS</text><text class="atlas-center-sub" y="17">SECURITY ATLAS</text></g>`:''}${nodes}</g>`;
    svg.classList.toggle('atlas-detail-view',detail);
    const index=page.querySelector('.atlas-service-index');
    const listMode=serviceList.matches&&detail;
    stage.hidden=listMode||storyMode;index.hidden=!listMode||storyMode;
    if(listMode){
      const listDomains=activeDomain?[domains.find(d=>d.id===activeDomain),...domains.filter(d=>d.id!==activeDomain&&d.services.some(id=>scopedServices.has(id)))]:domains;
      index.innerHTML=listDomains.map(d=>{const ids=activeDomain?d.services.filter(id=>scopedServices.has(id)):d.services,neighbor=activeDomain&&d.id!==activeDomain;return '<section class="'+(neighbor?'atlas-neighbor-section':'')+'" style="--node:'+d.color+'"><h3><span>'+esc(d.name)+'</span>'+(neighbor?'<small>CONNECTED NEIGHBORS</small>':'')+'</h3>'+ids.map(id=>{const degree=connections.filter(c=>c.from===id||c.to===id).length,paths=scenariosForService(id).length;return '<a href="#/service/'+id+'"><span>'+esc(serviceById(id).name)+'<small>'+degree+' sourced links · '+paths+' paths</small></span><b>↗</b></a>';}).join('')+'</section>';}).join('');
    }
    applyCamera();
    if(paused)svg.pauseAnimations();else svg.unpauseAnimations();
    page.querySelector('#atlas-legend').innerHTML=detail?'<i></i>Solid: sourced capability · Dashed: editorial grouping':'<i></i>Editorial domain map · Not live account data';
    page.querySelector('#atlas-map-context').textContent=storyMode?`${storyScenario.stages.length} stages · ${storyScenario.title}`:activeDomain?`${included[0].name} / ${included[0].services.length} services`:detail?`${connections.length} sourced capabilities across ${services.length} security nodes.`:'Eight domains. Choose your point of entry.';
    updateMotionControl();
    const resetHighlight=()=>{svg.classList.remove('has-preview','has-edge-preview');svg.querySelectorAll('.atlas-edge').forEach(e=>{e.classList.remove('edge-active','edge-incoming','edge-outgoing');e.querySelector('.atlas-connection')?.setAttribute('marker-end','url(#atlas-direction)');});svg.querySelectorAll('.atlas-related').forEach(element=>element.classList.remove('atlas-related'));};
    const showEdge=edge=>{
      const c=connections[Number(edge.dataset.edge)];
      resetHighlight();svg.classList.add('has-edge-preview');edge.classList.add('edge-active');
      svg.querySelectorAll('.map-node').forEach(n=>n.classList.toggle('atlas-related',[c.from,c.to].includes(n.dataset.serviceId)));
      preview.style.setProperty('--node','#a7ddce');
      preview.innerHTML=`<div class="atlas-preview-top"><span>SOURCED CAPABILITY / ${String(Number(edge.dataset.edge)+1).padStart(2,'0')}</span><i>DIRECTED LINK</i></div><div class="atlas-preview-symbol">${symbol(domainFor(c.from))}</div><h2>${esc(c.label)}</h2><div class="atlas-edge-endpoints"><a href="#/service/${c.from}"><small>SOURCE</small>${esc(serviceById(c.from).name)}</a><span>↓</span><a href="#/service/${c.to}"><small>DESTINATION</small>${esc(serviceById(c.to).name)}</a></div><p class="atlas-preview-description">${esc(c.detail)}</p><a class="atlas-preview-enter" href="${esc(c.source)}" target="_blank" rel="noopener noreferrer">Read supporting AWS documentation ↗</a><div class="atlas-preview-bottom"><span>HOW TO READ THIS LINK</span><p>The arrow reads as a sentence from source to destination. It describes a capability, not a deployed integration or a proven attack path.</p><a href="#/paths">Explore separately labeled research scenarios ↗</a></div>`;
    };
    svg.querySelectorAll('.atlas-edge').forEach(edge=>{edge.addEventListener('click',()=>showEdge(edge));edge.addEventListener('pointerenter',()=>showEdge(edge));edge.addEventListener('pointerleave',()=>{if(document.activeElement!==edge)resetHighlight();});edge.addEventListener('focus',()=>showEdge(edge));edge.addEventListener('blur',resetHighlight);edge.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();showEdge(edge);}});});
    for(const n of svg.querySelectorAll('.map-node')){
      const inspect=()=>{const d=domains.find(v=>v.id===n.dataset.domainId),s=serviceById(n.dataset.serviceId);resetHighlight();showPreview(d,s);svg.classList.add('has-preview');const related=new Set(s?[s.id,...connections.filter(c=>c.from===s.id||c.to===s.id).flatMap(c=>[c.from,c.to])]:d.services);svg.querySelectorAll('.map-node').forEach(el=>el.classList.toggle('atlas-related',related.has(el.dataset.serviceId)||!s&&el.dataset.domainId===d.id));svg.querySelectorAll('.atlas-domain-route').forEach(route=>route.classList.toggle('atlas-related',route.dataset.domainId===d.id));svg.querySelectorAll('.atlas-edge').forEach(e=>{const active=s?[e.dataset.from,e.dataset.to].includes(s.id):[e.dataset.from,e.dataset.to].some(id=>d.services.includes(id)),outgoing=Boolean(s)&&active&&e.dataset.from===s.id,incoming=Boolean(s)&&active&&e.dataset.to===s.id;e.classList.toggle('edge-active',active);e.classList.toggle('edge-outgoing',outgoing);e.classList.toggle('edge-incoming',incoming);if(outgoing||incoming)e.querySelector('.atlas-connection')?.setAttribute('marker-end',`url(#atlas-direction-${outgoing?'out':'in'})`);});};
      n.addEventListener('pointerenter',inspect);n.addEventListener('focus',inspect);
      n.addEventListener('pointerleave',()=>{if(document.activeElement!==n)resetHighlight();});
      n.addEventListener('blur',resetHighlight);
    }
  }
  let storyScenario=scenarios[0];
  const storyHost=page.querySelector('.atlas-home-story');
  const loadStory=()=>{storyStageIndex=0;storyController=mountStory(storyHost,storyScenario,{showMotion:false,initialPaused:paused,onStageChange:({index,service,domain})=>{storyStageIndex=index;if(storyMode)showPreview(domain,service);}});if(storyMode){const service=serviceById(storyScenario.stages[0].service);showPreview(domainFor(service.id),service);}};
  loadStory();
  on(page.querySelector('#atlas-story-select'),'change',e=>{storyScenario=scenarios.find(s=>s.id===e.target.value);loadStory();});
  on(page.querySelector('#atlas-find'),'click',openSearch);
  page.querySelectorAll('[data-detail]').forEach(b=>on(b,'click',()=>{detail=b.dataset.detail==='services';storyMode=b.dataset.detail==='story';if(storyMode)loadStory();else showPreview(activeDomain?domains.find(d=>d.id===activeDomain):domains[0]);camera=base();page.querySelectorAll('[data-detail]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});draw();}));
  page.querySelectorAll('[data-scope]').forEach(b=>on(b,'click',()=>{activeDomain=b.dataset.scope==='all'?null:b.dataset.scope;camera=base();page.querySelectorAll('[data-scope]').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b));});if(activeDomain)showPreview(domains.find(d=>d.id===activeDomain));draw();}));
  function updateMotionControl(){const b=page.querySelector('#atlas-motion'),subject=storyMode?'investigation':'atlas';b.setAttribute('aria-label',`${paused?'Resume':'Pause'} ${subject} animation`);b.textContent=paused?'Resume motion':'Pause motion';}
  function setMotion(value){paused=value;page.classList.toggle('motion-paused',paused);updateMotionControl();field.setPaused(paused);storyController?.setPaused(paused);if(paused)svg.pauseAnimations();else svg.unpauseAnimations();}
  on(page.querySelector('#atlas-motion'),'click',()=>setMotion(!paused));
  const motion=matchMedia('(prefers-reduced-motion: reduce)');on(motion,'change',()=>setMotion(motion.matches));
  on(page.querySelector('#zoom-in'),'click',()=>zoom(.8));on(page.querySelector('#zoom-out'),'click',()=>zoom(1.25));on(page.querySelector('#zoom-fit'),'click',()=>{camera=base();applyCamera();});
  let drag=null,moved=false;
  on(svg,'pointerdown',e=>{if(e.button!==0)return;moved=false;drag={x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y};if(!e.target.closest('.map-node'))svg.setPointerCapture(e.pointerId);});
  on(svg,'pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>5)moved=true;if(moved){const scale=camera.w/svg.getBoundingClientRect().width;camera.x=drag.cx-dx*scale;camera.y=drag.cy-dy*scale;applyCamera();}});
  on(svg,'pointerup',()=>{drag=null;});on(svg,'pointercancel',()=>{drag=null;});on(svg,'lostpointercapture',()=>{drag=null;});
  on(svg,'click',e=>{const node=e.target.closest('[data-route]');if(node&&!moved)location.hash=node.dataset.route;});
  on(svg,'keydown',e=>{
    const node=e.target.closest('[data-route]');
    if(node&&e.key.startsWith('Arrow')){
      e.preventDefault();const origin=node.transform.baseVal.consolidate().matrix,horizontal=['ArrowLeft','ArrowRight'].includes(e.key),direction=['ArrowRight','ArrowDown'].includes(e.key)?1:-1;
      const candidates=[...svg.querySelectorAll('.map-node:not(.scope-muted)')].filter(n=>n!==node).map(n=>{const m=n.transform.baseVal.consolidate().matrix,dx=m.e-origin.e,dy=m.f-origin.f;return {n,forward:(horizontal?dx:dy)*direction,side:Math.abs(horizontal?dy:dx)};}).filter(n=>n.forward>1).sort((a,b)=>(a.forward+a.side*3)-(b.forward+b.side*3));
      candidates[0]?.n.focus();return;
    }
    if(node&&['Enter',' '].includes(e.key)){e.preventDefault();location.hash=node.dataset.route;}else if(['+','=','-'].includes(e.key)){e.preventDefault();zoom(e.key==='-'?1.25:.8);}else if(e.target===svg&&e.key.startsWith('Arrow')){e.preventDefault();camera.x+=e.key==='ArrowLeft'?-45:e.key==='ArrowRight'?45:0;camera.y+=e.key==='ArrowUp'?-45:e.key==='ArrowDown'?45:0;applyCamera();}else if(e.key==='Home'&&e.target===svg){e.preventDefault();camera=base();applyCamera();}else if(e.key==='Escape'){svg.focus();svg.classList.remove('has-preview','has-edge-preview');svg.querySelectorAll('.edge-active,.edge-incoming,.edge-outgoing,.atlas-related').forEach(el=>el.classList.remove('edge-active','edge-incoming','edge-outgoing','atlas-related'));}
  });
  on(compact,'change',()=>{camera=base();draw();});
  on(serviceList,'change',()=>{camera=base();draw();});
  draw();showPreview(selected);setMotion(paused);
  return ()=>{abort.abort();field.destroy();};
}
