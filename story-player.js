import {serviceById,domainFor} from './catalog.js';
import {profileFor} from './security-data.js';
import {scenarioSources} from './scenario-data.js';
import {glyphs} from './node-symbols.js';
import {scenarioFacts} from './research-index.js';
import {detectionsForService} from './community-detections.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const symbol=d=>`<svg viewBox="-22 -22 44 44" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="${glyphs[d.id]}"/></svg>`;

export function mountStory(host,scenario,{onStageChange,showMotion=true,initialPaused}={}){
  let index=0,lens='intel',overview=false,paused=initialPaused??matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sources=scenarioSources(scenario);
  const facts=scenarioFacts(scenario);
  host.innerHTML=`<section class="story-player" aria-label="Interactive investigation timeline">
    <div class="story-player-heading"><div><span class="mind-eyebrow">READ THE CHAIN</span><h2>Follow the path. Find the evidence.</h2></div><div class="story-heading-controls"><span class="story-position" role="status" aria-live="polite"></span>${showMotion?`<button class="story-motion" aria-label="${paused?'Resume':'Pause'} path animation">${paused?'Resume motion':'Pause motion'}</button>`:''}</div></div>
    <div class="story-facts" aria-label="Scenario research context"><span><b>${facts.stages}</b> stages</span><span><b>${facts.serviceIds.length}</b> stage services</span><span><b>${sources.length}</b> references</span><span class="${facts.gaps.length?'has-gaps':'is-mapped'}"><b>${facts.gaps.length}</b> services without rule mappings</span></div>
    <div class="story-map-caption" id="story-map-instructions"><span><i></i>Start → transitions → outcome</span><span>Choose any stage · arrow keys move through the path</span></div>
    <div class="story-track" role="group" aria-label="Investigation stages">${scenario.stages.map((stage,i)=>{
      const service=serviceById(stage.service),d=domainFor(service.id);
      const role=i===0?'START':i===scenario.stages.length-1?'OUTCOME':'TRANSITION';
      return `<button class="story-stop ${i===0?'is-current':'is-upcoming'}" data-stage="${i}" aria-pressed="${i===0}" aria-describedby="story-map-instructions" style="--color:${d.color}"><span class="story-stage-role">${role}</span><span class="story-stop-top"><span class="story-stop-node">${symbol(d)}</span><span class="story-stage-number">${String(i+1).padStart(2,'0')}</span></span><span class="story-stop-label"><span class="story-domain">${esc(d.short)}</span><strong>${esc(service.short)}</strong><small>${esc(stage.title)}</small></span><span class="story-stop-state">${i===0?'Reading this stage':'Read stage'}</span></button>`;
    }).join('')}</div>
    <div class="story-progress" role="progressbar" aria-label="Investigation progress" aria-valuemin="1" aria-valuemax="${scenario.stages.length}" aria-valuenow="1"><span></span><div class="story-progress-markers" aria-hidden="true">${scenario.stages.map((_,i)=>`<i style="--position:${scenario.stages.length===1?0:i/(scenario.stages.length-1)*100}%"></i>`).join('')}</div></div>
    <div class="story-view-bar"><div class="story-lenses" role="group" aria-label="Investigation perspective"><button data-lens="intel" aria-pressed="true">Threat context</button><button data-lens="evidence" aria-pressed="false">Evidence</button><button data-lens="defense" aria-pressed="false">Defense</button></div><button class="story-overview-toggle" aria-expanded="false" aria-controls="story-overview">Compare stage evidence</button></div>
    <div class="story-overview" id="story-overview" hidden><div class="story-overview-heading"><h3>Evidence across the sequence</h3><p>Read each stage’s observable signal alongside its service. These are the observations described by the cited scenario.</p></div><div class="story-evidence-grid">${scenario.stages.map((stage,i)=>{
      const service=serviceById(stage.service),d=domainFor(service.id),profile=profileFor(service.id),rules=detectionsForService(service.id);
      return `<article style="--color:${d.color}"><div class="story-overview-service">${symbol(d)}<span>${String(i+1).padStart(2,'0')} / ${esc(service.name)}</span></div><h4>${esc(stage.title)}</h4><p>${esc(stage.signal)}</p><details class="story-telemetry"><summary>Service evidence sources <span>${profile.evidence.length}</span></summary><ul>${profile.evidence.map(item=>`<li>${esc(item)}</li>`).join('')}</ul><a href="${esc(profile.source)}" target="_blank" rel="noopener noreferrer">AWS security guidance ↗</a></details><a class="story-rule-mapping ${rules.length?'is-mapped':'has-gaps'}" href="#/service/${service.id}"><i aria-hidden="true"></i>${rules.length?`${rules.length} related service rule${rules.length===1?'':'s'}`:'No reviewed service rule mapped'} <span aria-hidden="true">↗</span></a><button data-jump-stage="${i}">Read stage ${i+1} <span aria-hidden="true">→</span></button></article>`;
    }).join('')}</div></div>
    <div class="story-reading"><div class="story-selected"></div><div class="story-controls"><button id="story-back">← Previous stage</button><span class="story-next-label"></span><button id="story-next">Next stage →</button></div></div>
    <details class="story-references"><summary>Research behind this scenario <span>${sources.length} sources</span></summary><div>${sources.map(source=>`<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(source.publisher)}</strong><span>${esc(source.label)} ↗</span></a>`).join('')}</div></details>
  </section>`;
  const track=host.querySelector('.story-track');
  const comparisonNote=document.createElement('p');comparisonNote.className='story-mapping-note';comparisonNote.textContent='Rule mappings and evidence sources apply to the service. Validate their relevance to each stage; a mapping does not prove detection of this sequence.';
  host.querySelector('.story-overview-heading').append(comparisonNote);
  function render(){
    const stage=scenario.stages[index],service=serviceById(stage.service),profile=profileFor(service.id),d=domainFor(service.id);
    host.style.setProperty('--stage-color',d.color);
    host.querySelector('.story-position').textContent=`Stage ${index+1} of ${scenario.stages.length} · ${service.short}`;
    host.querySelectorAll('[data-stage]').forEach(button=>{
      const position=Number(button.dataset.stage),active=position===index,complete=position<index;
      button.setAttribute('aria-pressed',String(active));
      if(active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
      button.classList.toggle('is-current',active);button.classList.toggle('is-complete',complete);button.classList.toggle('is-upcoming',position>index);
      button.querySelector('.story-stop-state').textContent=active?'● Reading this stage':complete?'✓ Earlier stage':'Read stage →';
      button.tabIndex=active?0:-1;
    });
    host.querySelectorAll('[data-lens]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lens===lens&&!overview)));
    const progress=host.querySelector('.story-progress');progress.setAttribute('aria-valuenow',String(index+1));progress.querySelector('span').style.width=`${scenario.stages.length===1?100:index/(scenario.stages.length-1)*100}%`;
    progress.querySelectorAll('.story-progress-markers i').forEach((marker,i)=>{marker.classList.toggle('is-complete',i<index);marker.classList.toggle('is-current',i===index);});
    host.querySelector('.story-overview').hidden=!overview;
    host.querySelector('.story-reading').hidden=overview;
    host.querySelector('.story-overview-toggle').setAttribute('aria-expanded',String(overview));
    host.querySelector('.story-overview-toggle').textContent=overview?'Return to selected stage':'Compare stage evidence';
    const heading=lens==='intel'?stage.title:lens==='evidence'?'What would prove this stage?':'Where can the path be interrupted?';
    const body=lens==='intel'?`<p>${esc(stage.detail)}</p>`:lens==='evidence'?`<p>${esc(stage.signal)}</p>`:`<ul class="story-control-list">${profile.defenses.map(text=>`<li>${esc(text)}</li>`).join('')}</ul>`;
    const side=lens==='evidence'?`<span>SERVICE EVIDENCE SOURCES</span><ul>${profile.evidence.map(text=>`<li>${esc(text)}</li>`).join('')}</ul>`:`<span>${lens==='defense'?'RESPONDER QUESTION':'OBSERVABLE SIGNAL'}</span><p>${esc(lens==='defense'?profile.responder:stage.signal)}</p>`;
    host.querySelector('.story-selected').innerHTML=`<div class="story-context"><span class="mind-eyebrow">STAGE ${String(index+1).padStart(2,'0')} / ${esc(service.name)}</span><h3>${esc(heading)}</h3>${body}<a href="#/service/${service.id}">Explore ${esc(service.short)} <span aria-hidden="true">↗</span></a></div><aside class="story-signal">${side}<a href="${esc(profile.source)}" target="_blank" rel="noopener noreferrer">AWS service security guidance ↗</a>${lens==='defense'?'<small>Service controls; assess applicability to this scenario.</small>':''}</aside>`;
    host.querySelector('#story-back').disabled=index===0;
    host.querySelector('#story-next').disabled=index===scenario.stages.length-1;
    host.querySelector('.story-next-label').textContent=index<scenario.stages.length-1?`Next: ${serviceById(scenario.stages[index+1].service).short}`:'End of sequence · Review the evidence or sources below';
    host.closest('.scenario-page')?.querySelectorAll('.trace-stage').forEach((el,i)=>el.classList.toggle('is-current',i===index));
  }
  function selectStage(next,focus=false){
    index=Math.max(0,Math.min(scenario.stages.length-1,next));overview=false;render();
    const button=host.querySelector(`[data-stage="${index}"]`);
    const bounds=button.getBoundingClientRect(),area=track.getBoundingClientRect();
    if(bounds.left<area.left||bounds.right>area.right)track.scrollTo({left:track.scrollLeft+bounds.left-area.left-20,behavior:'instant'});
    if(focus)button.focus({preventScroll:true});
    const stage=scenario.stages[index],service=serviceById(stage.service);onStageChange?.({index,stage,service,domain:domainFor(service.id)});
  }
  host.querySelectorAll('[data-stage]').forEach(button=>button.onclick=()=>selectStage(Number(button.dataset.stage)));
  host.querySelectorAll('[data-jump-stage]').forEach(button=>button.onclick=()=>selectStage(Number(button.dataset.jumpStage),true));
  host.querySelectorAll('[data-lens]').forEach(button=>button.onclick=()=>{lens=button.dataset.lens;overview=false;render();});
  host.querySelector('#story-back').onclick=()=>selectStage(index-1);
  host.querySelector('#story-next').onclick=()=>selectStage(index+1);
  host.querySelector('.story-overview-toggle').onclick=()=>{overview=!overview;render();};
  track.onkeydown=event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();selectStage(event.key==='Home'?0:event.key==='End'?scenario.stages.length-1:index+(event.key==='ArrowRight'?1:-1),true);
  };
  const motionButton=host.querySelector('.story-motion');
  const setPaused=value=>{paused=value;host.classList.toggle('story-paused',paused);if(motionButton){motionButton.setAttribute('aria-label',`${paused?'Resume':'Pause'} path animation`);motionButton.textContent=paused?'Resume motion':'Pause motion';}};
  setPaused(paused);
  if(motionButton)motionButton.onclick=()=>setPaused(!paused);
  render();
  const first=scenario.stages[0],firstService=serviceById(first.service);onStageChange?.({index:0,stage:first,service:firstService,domain:domainFor(firstService.id)});
  return {setPaused,selectedStage:()=>index};
}
