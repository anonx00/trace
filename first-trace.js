import {serviceById, domainFor, connections} from './catalog.js';
import {glyphs,glyphFor} from './node-symbols.js';

const esc = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow = '<span aria-hidden="true">↗</span>';
const icon = id => `<svg viewBox="-22 -22 44 44" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${glyphFor(id,domainFor(id).id)}"/></svg>`;

export const lessons = [
  {id:'iam',label:'Identity',question:'Who is allowed to ask?',term:'IAM · Identity and Access Management',title:'Start with the identity.',body:'An application needs to read a file in S3. Before following the request, identify the role it uses and the policies that apply. A role’s trust policy describes who can assume it; permission policies describe allowed actions and resources.',check:'Find the role, its trust policy, and the permissions relevant to the request. A service name alone does not tell you what is allowed.',clue:'Principal → policy → permission',quiz:'Does permission to assume a role mean permission to read every S3 object?',answer:'No. Assuming the role and accessing an object are separate authorization decisions. The resulting request is evaluated against the applicable policies and conditions.',source:'https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html',sourceLabel:'AWS: policies and permissions'},
  {id:'sts',label:'Session',question:'Which credentials are acting?',term:'STS · Security Token Service',title:'Follow the temporary session.',body:'An approved AssumeRole request returns temporary credentials for a role session. That session is the identity used for later API requests. Session policies can further restrict what the role’s credentials are allowed to do.',check:'Connect the assumed-role session to the role and the caller that created it. Keep the session’s scope and expiry in view.',clue:'AssumeRole → temporary credentials',quiz:'Can a session policy give a role more permissions?',answer:'No. The session permissions are the intersection of the role’s identity policies and its session policies. Session policies restrict; they cannot expand the role’s permissions.',source:'https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html',sourceLabel:'AWS: AssumeRole API'},
  {id:'s3',label:'Resource',question:'What can the session reach?',term:'S3 · Simple Storage Service',title:'Look at the resource boundary.',body:'Now follow the request to the object. Identity and resource policies can affect access, along with other applicable controls. If the object uses SSE-KMS encryption, the relevant KMS permissions also matter.',check:'Identify the bucket, object, requested action, and applicable policies. Follow the S3 → KMS connection when investigating encrypted objects.',clue:'Request → object → access decision',quiz:'Does encryption by itself prevent an authorized read?',answer:'No. Encryption protects stored data, but authorized requests can still read it. For SSE-KMS objects, assess the relevant S3 and KMS permissions together.',source:'https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html',sourceLabel:'AWS: S3 and SSE-KMS'},
  {id:'cloudtrail',label:'Evidence',question:'Would you see what happened?',term:'CloudTrail · AWS API activity',title:'Check the evidence before the verdict.',body:'S3 object reads such as GetObject are data events. Trails and event data stores do not log data events by default. You need logging configured for the relevant activity before you can rely on it during an investigation.',check:'Confirm that S3 data-event logging covers the relevant objects and time period. An empty management-event history does not prove no object was read.',clue:'Configured data events → investigation',quiz:'Is ordinary event history enough to investigate S3 object reads?',answer:'No. CloudTrail event history shows management events. Object operations such as GetObject require the relevant data-event logging; check scope and retention before drawing a conclusion.',source:'https://docs.aws.amazon.com/awscloudtrail/latest/userguide/logging-data-events-with-cloudtrail.html',sourceLabel:'AWS: logging data events'}
];

// These are real catalog capabilities. Positions are an editorial layout, not an AWS account topology.
const positions = {lambda:[115,185],iam:[310,105],sts:[495,185],cloudwatch:[90,355],s3:[325,305],kms:[525,370],cloudtrail:[315,495],guardduty:[110,530]};
function cloudIllustration(){
  // Relay order follows the lesson: identity, session, resource, evidence. Every hop is a sourced catalog capability.
  const relay = ['sts>iam','lambda>iam','s3>kms','cloudtrail>s3','guardduty>cloudtrail','lambda>cloudwatch'];
  const rank = c => {const i=relay.indexOf(c.from+'>'+c.to);return i<0?relay.length:i;};
  const links = connections.filter(c=>positions[c.from]&&positions[c.to]).sort((a,b)=>rank(a)-rank(b));
  const slot = 1.5, cycle = slot*links.length;
  return `<svg class="thread-cloud" viewBox="0 0 660 640" role="group" aria-labelledby="thread-cloud-title thread-cloud-desc">
    <title id="thread-cloud-title">A connected view of AWS security</title><desc id="thread-cloud-desc">An illustrated selection of documented relationships. Each service tile links to its research page. This is an educational map.</desc>
    <defs><pattern id="thread-grid" width="32" height="32" patternUnits="userSpaceOnUse" patternTransform="skewY(-25)"><path d="M32 0H0V32" fill="none" stroke="#dcd6c9" stroke-width=".7"/></pattern><filter id="thread-shadow" x="-80%" y="-60%" width="260%" height="240%"><feDropShadow dx="0" dy="16" stdDeviation="13" flood-color="#393a3020"/></filter><marker id="thread-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L9 5L1 9" fill="none" stroke="#b7ac99" stroke-width="1.3"/></marker></defs>
    <ellipse cx="330" cy="350" rx="285" ry="245" fill="url(#thread-grid)" opacity=".55"/>
    <ellipse cx="330" cy="350" rx="270" ry="245" fill="none" stroke="#ddd6c9" stroke-dasharray="3 8"/>
    ${links.map((c,i)=>{const a=positions[c.from],b=positions[c.to],mid=(a[1]+b[1])/2,d=`M${a[0]} ${a[1]}C${a[0]} ${mid},${b[0]} ${mid},${b[0]} ${b[1]}`;return `<g class="thread-wire" data-ends="${c.from} ${c.to}" style="--cycle:${cycle}s;--delay:${i*slot}s;--slot:${(slot/cycle*100).toFixed(2)}%"><title>${esc(serviceById(c.from).short+' → '+serviceById(c.to).short+': '+c.label)}</title><path d="${d}" marker-end="url(#thread-arrow)"/><path class="thread-signal" pathLength="1" d="${d}"/></g>`}).join('')}
    ${links.map((c,i)=>{const b=positions[c.to];return `<ellipse class="thread-ping" cx="${b[0]}" cy="${b[1]-10}" rx="50" ry="28" style="--cycle:${cycle}s;--delay:${i*slot+slot*.82}s" aria-hidden="true"/>`}).join('')}
    ${Object.entries(positions).map(([id,[x,y]])=>{const d=domainFor(id),s=serviceById(id);return `<a class="thread-tile" data-tile="${id}" href="#/service/${id}" aria-label="Explore ${esc(s.name)}" style="--tile-color:${id==='s3'?'#ed6036':id==='iam'?'#8b755c':'#536b65'}" transform="translate(${x} ${y})"><title>${esc(s.name)} · ${esc(s.label)}</title><g filter="url(#thread-shadow)"><path class="tile-side" d="M-60-9 0 23 60-9V12L0 45-60 12Z"/><path class="tile-top" d="M0-43 60-9 0 23-60-9Z"/><path class="tile-seam" d="M0 23V45"/></g><g transform="translate(0 -14) scale(.75)"><path class="tile-icon" d="${glyphFor(id,d.id)}"/></g><rect x="-63" y="52" width="126" height="26" rx="13"/><text y="69" text-anchor="middle">${esc(s.short)}</text></a>`}).join('')}
    <g class="thread-callout" transform="translate(402 474)"><rect width="205" height="74" rx="12"/><circle cx="17" cy="20" r="3"/><text x="29" y="24">FOLLOW THE EVIDENCE</text><text x="16" y="46" class="callout-body">S3 object activity?</text><text x="16" y="61" class="callout-small">Check data-event logging.</text></g>
    <text x="25" y="40" class="cloud-coordinate">FIELD MAP / 001</text><text x="635" y="605" text-anchor="end" class="cloud-coordinate">IDENTITY · RESOURCE · EVIDENCE</text>
  </svg>`;
}

export function firstTraceMarkup(){
  return `<div class="first-trace">
    <header class="thread-hero">
      <div class="thread-intro"><p class="thread-kicker"><i></i> A FIELD GUIDE TO AWS SECURITY</p><h1>Follow the thread.<br>Understand <em>AWS.</em></h1><p class="thread-lede">The cloud makes more sense when you see the connections.</p><p class="thread-description">Explore how AWS services, permissions, and evidence fit together. Turn a wall of service names into a story you can follow.</p><div class="thread-actions"><button class="thread-primary" data-thread-start>Take your first trace <span aria-hidden="true">→</span></button><button class="thread-secondary" data-thread-map>Explore the atlas ${arrow}</button></div><p class="thread-caption">Open source. Source-linked. No AWS account required.</p></div>
      <div class="thread-art">${cloudIllustration()}<div class="thread-art-caption"><span><i></i> DOCUMENTED CONNECTIONS · SELECT A SERVICE</span><button class="thread-motion" aria-pressed="false" aria-label="Pause illustration">Pause motion</button></div></div>
    </header>
    <div class="thread-strip"><span>ONE CONNECTED WAY TO LEARN</span><p><b>Understand the identity</b><i>→</i><b>Follow the access</b><i>→</i><b>Find the evidence</b></p><a href="#/sources">Built on documented sources ${arrow}</a></div>
    <section class="first-lesson" aria-labelledby="first-lesson-title">
      <div class="thread-section-head"><div><p class="thread-kicker">YOUR FIRST TRACE / FOUR STEPS</p><h2 id="first-lesson-title" tabindex="-1">One request.<br><em>Four useful questions.</em></h2></div><p>An application wants to read an S3 object. Follow the idea from permission to evidence, one concept at a time.</p></div>
      <div class="lesson-workspace"><div class="lesson-map"><div class="lesson-map-label"><span>A LEARNING SEQUENCE</span><span>ILLUSTRATIVE EXAMPLE</span></div><ol class="lesson-steps" aria-label="Choose a learning step">${lessons.map((s,i)=>`<li><button data-lesson="${s.id}" aria-controls="lesson-content" aria-pressed="${i===0}"><span class="lesson-step-number">0${i+1}</span><span class="lesson-step-icon">${icon(s.id)}</span><span><b>${esc(serviceById(s.id).short)}</b><small>${s.label}</small></span><i aria-hidden="true">↗</i></button></li>`).join('')}</ol><p class="lesson-map-foot">Learn the sequence here. Open any service’s research to explore its documented relationships.</p></div><article class="lesson-content" id="lesson-content" aria-label="Current learning step"></article></div>
    </section>
    <section class="thread-wayfinder" aria-label="Choose what to explore next"><div class="thread-wayfinder-heading"><p class="thread-kicker">PICK UP ANOTHER THREAD</p><h2>What brings you here?</h2></div><div class="thread-routes"><button data-thread-map><span class="route-number">01 / EXPLORE</span><h3>“I want the big picture.”</h3><p>Find your starting point across eight AWS security domains.</p><span class="route-link">Open the connected atlas ${arrow}</span></button><a href="#/paths"><span class="route-number">02 / INVESTIGATE</span><h3>“How could this unfold?”</h3><p>Walk through an incident scenario, from entry to response.</p><span class="route-link">Follow an attack path ${arrow}</span></a><a href="#/evidence"><span class="route-number">03 / VERIFY</span><h3>“Which logs would I need?”</h3><p>Understand what each evidence source records and what it misses.</p><span class="route-link">Explore evidence guides ${arrow}</span></a></div></section>
  </div>`;
}

export function mountFirstTrace(root,{initialLesson,signal}={}){
  let index=Math.max(0,lessons.findIndex(s=>s.id===initialLesson));
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let paused=motion.matches;
  const panel=root.querySelector('#lesson-content'),hero=root.querySelector('.thread-art'),motionButton=root.querySelector('.thread-motion');
  const on=(el,event,fn)=>el.addEventListener(event,fn,{signal});
  const moveTo=el=>{el.scrollIntoView({behavior:motion.matches?'instant':'smooth',block:'start'});el.focus({preventScroll:true});};
  const cloud=root.querySelector('.thread-cloud');
  function focusTile(id,source='lesson'){
    if(!cloud)return;
    if(source==='lesson')cloud.dataset.focus=id;
    const active=cloud.dataset.hover||cloud.dataset.focus;
    cloud.querySelectorAll('[data-tile]').forEach(t=>t.classList.toggle('is-focus',t.dataset.tile===active));
    cloud.querySelectorAll('.thread-wire').forEach(w=>w.classList.toggle('is-lit',w.dataset.ends.split(' ').includes(active)));
    cloud.classList.toggle('has-hover',Boolean(cloud.dataset.hover));
  }
  if(cloud)['pointerover','focusin'].forEach(type=>on(cloud,type,e=>{const tile=e.target.closest('[data-tile]');if(tile){cloud.dataset.hover=tile.dataset.tile;focusTile(tile.dataset.tile,'hover');}}));
  if(cloud)['pointerleave','focusout'].forEach(type=>on(cloud,type,e=>{if(type==='focusout'&&cloud.contains(e.relatedTarget))return;delete cloud.dataset.hover;focusTile(null,'hover');}));
  function draw({updateURL=false,focus=false}={}){
    const s=lessons[index];
    root.querySelectorAll('[data-lesson]').forEach(b=>{const active=b.dataset.lesson===s.id;b.setAttribute('aria-pressed',String(active));if(active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
    panel.innerHTML=`<div class="lesson-topline"><span>${s.term}</span><span>0${index+1} / 04</span></div><p class="lesson-question">${s.question}</p><h3 tabindex="-1">${s.title}</h3><p class="lesson-body">${s.body}</p><div class="lesson-check"><span>WHAT TO LOOK FOR</span><p>${s.check}</p></div><div class="lesson-clue"><span aria-hidden="true">↳</span> ${s.clue}</div><details class="lesson-quiz"><summary>Quick check: ${s.quiz}</summary><p>${s.answer}</p></details><div class="lesson-sources"><a href="${s.source}" target="_blank" rel="noopener noreferrer">${s.sourceLabel} ↗</a><a href="#/service/${s.id}">Go deeper into ${esc(serviceById(s.id).short)} →</a></div><div class="lesson-controls"><button data-lesson-back ${index===0?'disabled':''}>← Previous</button><span class="lesson-progress" aria-label="Step ${index+1} of 4">${lessons.map((_,i)=>`<i class="${i<=index?'complete':''}"></i>`).join('')}</span>${index<lessons.length-1?'<button data-lesson-next>Next concept →</button>':'<a href="#/service/cloudtrail?tab=evidence">Explore the evidence →</a>'}</div>`;
    if(s.id==='cloudtrail')panel.querySelector('.lesson-sources').insertAdjacentHTML('beforeend','<a href="https://docs.aws.amazon.com/awscloudtrail/latest/userguide/view-cloudtrail-events.html" target="_blank" rel="noopener noreferrer">AWS: event history limits ↗</a>');
    focusTile(s.id);
    if(updateURL){const query=new URLSearchParams(location.hash.split('?')[1]||'');query.set('learn',s.id);history.replaceState(null,'',`#/?${query}`);}
    if(focus)panel.querySelector('h3').focus({preventScroll:true});
  }
  function setMotion(value){paused=value||motion.matches;hero.classList.toggle('is-paused',paused);motionButton.disabled=motion.matches;motionButton.textContent=motion.matches?'Reduced motion':paused?'Resume motion':'Pause motion';motionButton.setAttribute('aria-label',motion.matches?'Illustration paused by your reduced motion preference':paused?'Resume illustration':'Pause illustration');motionButton.setAttribute('aria-pressed',String(paused));}
  on(root,'click',event=>{
    if(event.target.closest('[data-thread-start]'))moveTo(root.querySelector('#first-lesson-title'));
    if(event.target.closest('[data-thread-map]'))moveTo(root.querySelector('#explore-atlas'));
    const step=event.target.closest('[data-lesson]');
    if(step){index=lessons.findIndex(s=>s.id===step.dataset.lesson);draw({updateURL:true});}
    if(event.target.closest('[data-lesson-next]')){index=Math.min(lessons.length-1,index+1);draw({updateURL:true,focus:true});}
    if(event.target.closest('[data-lesson-back]')){index=Math.max(0,index-1);draw({updateURL:true,focus:true});}
  });
  on(motionButton,'click',()=>setMotion(!paused));on(motion,'change',()=>setMotion(motion.matches));
  draw();setMotion(paused);
  const frame=initialLesson?requestAnimationFrame(()=>moveTo(root.querySelector('#first-lesson-title'))):0;
  return ()=>cancelAnimationFrame(frame);
}
