
import {serviceById,domainFor} from './catalog.js';
import {profileFor} from './security-data.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function mountStory(host,scenario){
  let index=0,lens='intel',paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
  host.innerHTML=`<section class="story-player" aria-label="Interactive investigation timeline"><div class="story-player-heading"><div><span class="mind-eyebrow">FOLLOW THE SEQUENCE</span><h2>Every stage leaves a signal.</h2></div><div class="story-heading-controls"><span class="story-position"></span><button class="story-motion" aria-pressed="${paused}">${paused?'Resume motion':'Pause motion'}</button></div></div><div class="story-track" role="group" aria-label="Investigation stages">${scenario.stages.map((stage,i)=>{const service=serviceById(stage.service),d=domainFor(service.id);return `<button class="story-stop" data-stage="${i}" aria-pressed="${i===0}" style="--color:${d.color}"><span class="story-stop-node">${String(i+1).padStart(2,'0')}</span><span class="story-stop-label"><strong>${esc(service.short)}</strong><small>${esc(stage.title)}</small></span></button>`;}).join('')}</div><div class="story-reading"><div class="story-lenses" role="group" aria-label="Investigation perspective"><button data-lens="intel" aria-pressed="true">Threat context</button><button data-lens="evidence" aria-pressed="false">Evidence</button><button data-lens="defense" aria-pressed="false">Defense</button></div><div class="story-selected"></div><div class="story-controls"><button id="story-back">← Previous stage</button><button id="story-next">Next stage →</button></div></div></section>`;
  function render(){
    const stage=scenario.stages[index],service=serviceById(stage.service),profile=profileFor(service.id),d=domainFor(service.id);
    host.style.setProperty('--stage-color',d.color);
    host.querySelector('.story-position').textContent=`STAGE ${index+1} / ${scenario.stages.length}`;
    host.querySelectorAll('[data-stage]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.stage)===index)));
    host.querySelectorAll('[data-lens]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lens===lens)));
    const heading=lens==='intel'?stage.title:lens==='evidence'?'What would prove this stage?':'Where can the path be interrupted?';
    const body=lens==='intel'?stage.detail:lens==='evidence'?stage.signal:profile.defenses.join('. ')+'.';
    host.querySelector('.story-selected').innerHTML=`<div class="story-context"><span class="mind-eyebrow">${esc(service.name)} / ${esc(d.short)}</span><h3>${esc(heading)}</h3><p>${esc(body)}</p><a href="#/service/${service.id}">Open this security node ↗</a></div><aside class="story-signal"><span>${lens==='defense'?'RESPONDER QUESTION':'OBSERVABLE SIGNAL'}</span><p>${esc(lens==='defense'?profile.responder:stage.signal)}</p><a href="${esc(profile.source)}" target="_blank" rel="noopener noreferrer">AWS service security guidance ↗</a></aside>`;
    host.querySelector('#story-back').disabled=index===0;host.querySelector('#story-next').disabled=index===scenario.stages.length-1;
    document.querySelectorAll('.trace-stage').forEach((el,i)=>el.classList.toggle('is-current',i===index));
  }
  host.querySelectorAll('[data-stage]').forEach(b=>b.onclick=()=>{index=Number(b.dataset.stage);render();});
  host.querySelectorAll('[data-lens]').forEach(b=>b.onclick=()=>{lens=b.dataset.lens;render();});
  host.querySelector('#story-back').onclick=()=>{index=Math.max(0,index-1);render();};
  host.querySelector('#story-next').onclick=()=>{index=Math.min(scenario.stages.length-1,index+1);render();};
  host.querySelector('.story-track').onkeydown=e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();index=e.key==='Home'?0:e.key==='End'?scenario.stages.length-1:Math.max(0,Math.min(scenario.stages.length-1,index+(e.key==='ArrowRight'?1:-1)));render();host.querySelector(`[data-stage="${index}"]`).focus();};
  const motionButton=host.querySelector('.story-motion');
  host.classList.toggle('story-paused',paused);
  motionButton.onclick=()=>{paused=!paused;host.classList.toggle('story-paused',paused);motionButton.setAttribute('aria-pressed',String(paused));motionButton.textContent=paused?'Resume motion':'Pause motion';};
  render();
}
