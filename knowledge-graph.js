import {glyphs} from './node-symbols.js';
﻿
import {services,domains,serviceById,domainFor,connections} from './catalog.js';
import {profileFor} from './security-data.js';
import {scenariosForService} from './scenario-data.js';
import {detectionsForService} from './community-detections.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const detectionSummary=id=>{const rules=detectionsForService(id);return rules.length?`${rules.length} reviewed rule${rules.length===1?'':'s'} · ${rules[0].title}`:'No reviewed community rule mapped · visible coverage gap';};
const detectionDetail=id=>{const rules=detectionsForService(id);return rules.length?rules.map(rule=>`${rule.title}: ${rule.signals[0]}`).join('. '):'No reviewed community rule is mapped to this service. TRACE does not generate substitute logic.';};
export function knowledgeGraph({type,d,s,topic,topicIndex,doc,tab,page=0,references=[]}) {
  let items=[],legend='',hubTitle=s?.short||d.short,hubDescription=topic?'AWS documentation':s?'Selected security node':'Editorial security domain';
  if(type==='domain'){
    items=d.services.map(id=>({service:serviceById(id),kind:'membership',relation:'Domain member',url:'#/service/'+id}));
    legend='Dashed: editorial domain membership';
  }else if(topic||tab==='docs'){
    let sections=(doc?.sections||[]).map((v,index)=>({...v,index}));
    if(topic){const children=[];for(let i=topicIndex+1;i<sections.length&&sections[i].level>topic.level;i++)children.push(sections[i]);sections=children.length?children:sections.filter(v=>v.index!==topicIndex);}
    items=sections.map(t=>({title:t.title,description:'Read the AWS section and service security context.',kind:'membership',relation:'AWS guide / section '+(t.index+1),url:`#/service/${s.id}/topic/${t.index}`,source:t.url}));
    legend='Dashed: documentation hierarchy';
  }else {
    items=connections.filter(c=>c.from===s.id||c.to===s.id).map(c=>{const target=c.from===s.id?c.to:c.from;return {service:serviceById(target),relation:c.label,kind:'documented',description:c.detail,source:c.source,incoming:c.to===s.id,url:'#/service/'+target};});
    for(const scenario of scenariosForService(s.id)){
      scenario.stages.slice(1).forEach((stage,i)=>{const before=scenario.stages[i];if(stage.service!==s.id&&before.service!==s.id)return;const target=stage.service===s.id?before.service:stage.service;
        if(items.some(v=>v.service?.id===target))return;
        items.push({service:serviceById(target),relation:'Adjacent scenario stage',kind:'attack',description:scenario.title,scenario,incoming:stage.service===s.id,url:'#/service/'+target});
      });
    }
    for(const ref of references){if(ref.to!==s.id&&!items.some(v=>v.service?.id===ref.to)&&serviceById(ref.to))items.push({service:serviceById(ref.to),relation:'Linked from AWS guide',kind:'references',url:'#/service/'+ref.to,source:doc?.resolvedUrl});}
    legend='Mint: AWS capability · Coral: scenario sequence · Dotted: guide reference';
  }
  const total=items.length,pages=Math.max(1,Math.ceil(total/6)),current=Math.max(0,Math.min(page,pages-1)),visible=items.slice(current*6,current*6+6);
  let links='',nodes='';
  const hub={x:465,y:325,w:270,h:148};
  visible.forEach((v,i)=>{
    const left=i<3,x=left?30:910,y=75+(i%3)*240,service=v.service,domain=service?domainFor(service.id):d,color=domain.color;
    const title=service?.name||v.title;
    const profile=service?profileFor(service.id):null;
    const summary=profile?(tab==='evidence'?profile.evidence[0]:tab==='detections'?detectionSummary(service.id):tab==='defense'?profile.defenses[0]:v.description||profile.boundary):v.description;
    const lens=tab==='evidence'&&profile?'Evidence':tab==='detections'&&profile?'Detection':tab==='defense'&&profile?'Defense':v.relation;
    const a=left?{x:x+260,y:y+84}:{x:hub.x+hub.w,y:hub.y+74},b=left?{x:hub.x,y:hub.y+74}:{x,y:y+84};
    links+=`<path class="map-link ${v.kind} mind-link" d="M${a.x},${a.y} C${(a.x+b.x)/2},${a.y} ${(a.x+b.x)/2},${b.y} ${b.x},${b.y}" style="--color:${color}" id="mind-edge-${i}"><title>${esc(v.relation)}</title></path>`;
    nodes+=`<g class="map-node mind-graph-node" tabindex="0" role="link" aria-label="${esc(title)}" data-route="${esc(v.url)}" data-incoming="${!!v.incoming}" data-kind="${v.kind}" transform="translate(${x},${y})" style="--color:${color}"><title>${esc(title)} — ${esc(v.relation)}</title><rect class="mind-node-back" width="260" height="250" rx="13"/><g class="mind-neuron" transform="translate(130 48)"><circle class="mind-neuron-glow" r="66"/><circle class="mind-neuron-ring" r="49"/><circle class="mind-neuron-body" r="34"/><path class="mind-neuron-icon" d="${glyphs[domain.id]}" /></g><foreignObject x="17" y="111" width="226" height="150"><div xmlns="http://www.w3.org/1999/xhtml" class="mind-node-copy"><span>${esc(lens)}</span><h3>${esc(title)}</h3><p>${esc(summary)}</p></div></foreignObject></g>`;
    if(v.kind!=='membership')links+=`<circle class="mind-signal" r="4" fill="${v.kind==='attack'?'#ffb08b':'#b6e3d5'}"><animateMotion dur="${4.5+i*.55}s" repeatCount="indefinite"><mpath href="#mind-edge-${i}"/></animateMotion></circle>`;
  });
  const hubMarkup=`<g class="mind-hub mind-neuron-hub" transform="translate(600 400)"><circle class="mind-hub-glow" r="115"/><circle class="mind-hub-ring" r="77"/><circle class="mind-hub-body" r="55"/><path class="mind-hub-icon" d="${glyphs[d.id]}" transform="scale(1.6)"/><text class="mind-hub-name" y="111" style="font-size:${hubTitle.length>16?19:28}px">${esc(hubTitle)}</text><text class="mind-hub-caption" y="137">${esc(hubDescription)}</text></g>`;
  const empty=!total?'<text x="600" y="540" class="node-label">Explore this service using the research panel.</text>':'';
  const markup=`<defs><marker id="mind-direction" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M1 1 9 5 1 9" fill="none" stroke="#c7b2dc" stroke-width="1.5"/></marker><pattern id="mind-grid" width="35" height="35" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".7" fill="#bba6d5" opacity=".15"/></pattern></defs><rect width="1200" height="800" fill="url(#mind-grid)" pointer-events="none"/><g class="world-layer">${links}${hubMarkup}${nodes}${empty}</g>`;
  const ledger=visible.map(v=>`<div class="mind-relation"><span class="relation-kind ${v.kind}">${v.kind==='documented'?'AWS CAPABILITY':v.kind==='attack'?'SCENARIO SEQUENCE':v.kind==='references'?'GUIDE REFERENCE':'KNOWLEDGE LINK'}</span><a class="mind-relation-title" href="${esc(v.url)}">${esc(v.service?.name||v.title)} <span>↗</span></a><p>${esc(v.service&&tab==='evidence'?profileFor(v.service.id).evidence.join('. '):v.service&&tab==='detections'?detectionDetail(v.service.id):v.service&&tab==='defense'?profileFor(v.service.id).defenses.join('. '):v.description||v.relation)}</p>${v.source?`<a class="mind-source-link" href="${esc(v.source)}" target="_blank" rel="noopener noreferrer">${esc(v.relation)} · AWS source ↗</a>`:v.scenario?`<a class="mind-source-link" href="#/scenario/${v.scenario.id}">Read the complete scenario ↗</a>`:''}</div>`).join('');
  return {markup,legend,pages,current,total,ledger};
}
