import {serviceById,domainFor} from './catalog.js';
import {profileFor} from './security-data.js';
import {scenarioSources} from './scenario-data.js';
import {glyphs} from './node-symbols.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const symbol=d=>`<svg viewBox="-22 -22 44 44" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="${glyphs[d.id]}"/></svg>`;

export function mountStory(host,scenario){
  let index=0,lens='intel',overview=false,paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sources=scenarioSources(scenario);
  host.innerHTML=`<section class="story-player" aria-label="Interactive investigation timeline">
    <div class="story-player-heading"><div><span class="mind-eyebrow">READ THE CHAIN</span><h2>Follow the path. Find the evidence.</h2></div><div class="story-heading-controls"><span class="story-position" role="status" aria-live="polite"></span><button class="story-motion" aria-pressed="${paused}">${paused?'Resume motion':'Pause motion'}</button></div></div>
    <div class="story-map-caption"><span><i></i>Arrows show scenario order</span><span>Choose any stage to read its context</span></div>
    <div class="story-track" role="group" aria-label="Investigation stages">${scenario.stages.map((stage,i)=>{
      const service=serviceById(stage.service),d=domainFor(service.id);
      return `<button class="story-stop" data-stage="${i}" aria-pressed="${i===0}" style="--color:${d.color}"><span class="story-stop-top"><span class="story-stop-node">${symbol(d)}</span><span class="story-stage-number">${String(i+1).padStart(2,'0')}</span></span><span class="story-stop-label"><span class="story-domain">${esc(d.short)}</span><strong>${esc(service.short)}</strong><small>${esc(stage.title)}</small></span><span class="story-stop-state">${i===0?'Reading this stage':'Read stage'}</span></button>`;
    }).join('')}</div>
    <div class="story-progress" aria-hidden="true"><span></span></div>
    <div class="story-view-bar"><div class="story-lenses" role="group" aria-label="Investigation perspective"><button data-lens="intel" aria-pressed="true">Threat context</button><button data-lens="evidence" aria-pressed="false">Evidence</button><button data-lens="defense" aria-pressed="false">Defense</button></div><button class="story-overview-toggle" aria-expanded="false">Compare stage evidence</button></div>
    <div class="story-overview" hidden><div class="story-overview-heading"><h3>Evidence across the sequence</h3><p>Read each stage’s observable signal alongside its service. These are the observations described by the cited scenario.</p></div><div class="story-evidence-grid">${scenario.stages.map((stage,i)=>{
      const service=serviceById(stage.service),d=domainFor(service.id);
      return `<article style="--color:${d.color}"><div class="story-overview-service">${symbol(d)}<span>${String(i+1).padStart(2,'0')} / ${esc(service.name)}</span></div><h4>${esc(stage.title)}</h4><p>${esc(stage.signal)}</p><button data-jump-stage="${i}">Read stage ${i+1} <span aria-hidden="true">→</span></button></article>`;
    }).join('')}</div></div>
    <div class="story-reading"><div class="story-selected"></div><div class="story-controls"><button id="story-back">← Previous stage</button><span class="story-next-label"></span><button id="story-next">Next stage →</button></div></div>
    <details class="story-references"><summary>Research behind this scenario <span>${sources.length} sources</span></summary><div>${sources.map(source=>`<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer"><strong>${esc(source.publisher)}</strong><span>${esc(source.label)} ↗</span></a>`).join('')}</div></details>
  </section>`;
  const track=host.querySelector('.story-track');
  function render(){
    const stage=scenario.stages[index],service=serviceById(stage.service),profile=profileFor(service.id),d=domainFor(service.id);
    host.style.setProperty('--stage-color',d.color);
    host.querySelector('.story-position').textContent=`Stage ${index+1} of ${scenario.stages.length} · ${service.short}`;
    host.querySelectorAll('[data-stage]').forEach(button=>{
      const active=Number(button.dataset.stage)===index;
      button.setAttribute('aria-pressed',String(active));
      if(active)button.setAttribute('aria-current','step');else button.removeAttribute('aria-current');
      button.querySelector('.story-stop-state').textContent=active?'● Reading this stage':'Read stage →';
      button.tabIndex=active?0:-1;
    });
    host.querySelectorAll('[data-lens]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lens===lens&&!overview)));
    host.querySelector('.story-progress span').style.width=`${(index+1)/scenario.stages.length*100}%`;
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
  host.classList.toggle('story-paused',paused);
  motionButton.onclick=()=>{paused=!paused;host.classList.toggle('story-paused',paused);motionButton.setAttribute('aria-pressed',String(paused));motionButton.textContent=paused?'Resume motion':'Pause motion';};
  render();
}
