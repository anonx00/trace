const base='https://docs.aws.amazon.com/eventbridge/latest/userguide/';
const sources={events:base+'eb-events.html',patterns:base+'eb-event-patterns.html',targets:base+'eb-targets.html',dlq:base+'eb-rule-dlq.html',permissions:base+'eb-use-resource-based.html'};
const glyphs={source:'M7 6h18v20H7zM12 12h8m-8 5h8m-8 5h5',bus:'M4 16h24M9 8v16m7-20v24m7-20v16',rule:'M5 7h22L19 17v9l-6-3v-6Z',target:'m18 4-9 14h8l-3 10 10-15h-8Z',dlq:'M5 9h22v18H5zM5 18h7l2 4h4l2-4h7M11 5h10'};
const nodes=[['source','01','An event happens','Custom application','source'],['bus','02','The bus receives it','Custom event bus','bus'],['rule','03','A rule checks it','Match the event pattern','rule'],['target','04','A target gets it','AWS Lambda','target'],['dlq','05','Keep failed deliveries','Amazon SQS · optional DLQ','dlq']];
const cases={
  delivered:{label:'Matched + delivered',severity:'high',route:['source','bus','rule','target'],title:'The event reaches the target.',summary:'This sample matches the rule and is delivered to Lambda. Delivery acceptance is not proof that the function completed successfully.',outcome:'DELIVERED TO TARGET'},
  unmatched:{label:'No rule match',severity:'low',route:['source','bus','rule'],title:'An accepted event can go no further.',summary:'The sample has low severity. This rule requires high, so it does not invoke its target. Other rules on the bus could still match.',outcome:'THIS RULE DOES NOT MATCH'},
  failed:{label:'Target permission denied',severity:'high',route:['source','bus','rule','target','dlq'],title:'A match is not a successful delivery.',summary:'In this example, missing target permissions prevent delivery. EventBridge sends the event directly to the configured, permitted target DLQ; this error is not retried.',outcome:'FAILED DELIVERY → TARGET DLQ'}
};
const notes={
  source:{title:'Start with the producer.',body:'Our fictional security application publishes a finding. The source and detail fields describe the event; those strings alone do not establish who was authorized to publish it.',check:'Check producer permissions and the identity behind the request.',source:sources.events,label:'AWS event structure'},
  bus:{title:'A bus receives. Rules decide.',body:'An event bus receives events and evaluates its rules. This diagram shows one illustrative custom bus and one rule, not the customer’s actual configuration.',check:'Inspect the bus policy and who can publish or change routing.',source:sources.events,label:'AWS event buses and events'},
  rule:{title:'Read the condition, not just the line.',body:'The example requires source acme.security, detail-type Finding, and detail.severity high. All three conditions must match for this rule to route the event.',check:'Compare the exact event fields with the current event pattern.',source:sources.patterns,label:'AWS event patterns'},
  target:{title:'Follow delivery into execution.',body:'A matched event is routed to the configured Lambda target when the necessary permissions are present. A successful delivery does not establish that downstream processing succeeded.',check:'Verify the target configuration, permissions and function evidence.',source:sources.targets,label:'AWS EventBridge targets'},
  dlq:{title:'Keep the evidence of failed delivery.',body:'A target dead-letter queue is an optional standard SQS queue. It can retain undelivered events and error attributes. It must be configured and permitted; its presence is not automatic.',check:'Inspect the error code, rule ARN and target ARN before redriving.',source:sources.dlq,label:'AWS dead-letter queues'}
};
const icon=id=>`<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="${glyphs[id]}"/></svg>`;

export function mountEventFlow(page){
  page.classList.add('eventbridge-page');
  page.querySelector('.map-subtitle').textContent='An event is only the beginning. Follow the rule, the target, and the evidence left behind.';
  const section=document.createElement('section');section.className='event-flow';section.setAttribute('aria-label','Interactive EventBridge event journey');
  section.innerHTML=`<header class="ef-heading"><div><span class="ef-eyebrow">THE SERVICE, IN MOTION / 01</span><h2>One event.<br><em>Follow every decision.</em></h2></div><p>Change the example. Inspect a step.<br>See why an event reaches its destination—or doesn’t.</p></header>
    <div class="ef-workbench"><div class="ef-toolbar"><div class="ef-case-picker" role="group" aria-label="Choose an example">${Object.entries(cases).map(([key,c])=>`<button type="button" data-case="${key}" aria-pressed="${key==='delivered'}">${c.label}</button>`).join('')}</div><span class="ef-example-label"><i></i> Illustrative example</span></div>
    <div class="ef-canvas"><div class="ef-zone"><span>EVENTBRIDGE / CUSTOM BUS</span></div><svg class="ef-wires" aria-hidden="true"></svg><div class="ef-diagram-label">FROM AN EVENT TO AN OUTCOME</div>
    ${nodes.map(([id,n,title,sub,glyph])=>`<button type="button" class="ef-node ef-${id}" data-node="${id}" aria-pressed="false"><span class="ef-node-top"><span class="ef-node-icon">${icon(glyph)}</span><span class="ef-node-number">${n}</span></span><strong>${title}</strong><span class="ef-node-sub">${sub}</span><span class="ef-node-state"></span><i class="ef-port ef-port-in"></i><i class="ef-port ef-port-out"></i></button>`).join('')}
    <div class="ef-terminal"><span class="ef-terminal-mark">↳</span><span>Not matched by this rule</span></div><div class="ef-route-note"><b>FOLLOW THE SIGNAL</b><span>Solid: event route · Dashed: failure path</span></div></div>
    <div class="ef-playbar"><div class="ef-step-state" role="status" aria-live="polite"></div><div class="ef-play-controls"><button type="button" class="ef-back" aria-label="Previous event step">←</button><button type="button" class="ef-next">Next step →</button><button type="button" class="ef-motion" aria-pressed="false">Pause motion</button></div></div>
    <div class="ef-inspection"><article class="ef-explanation"><span class="ef-eyebrow">INSPECT THE STEP</span><h3></h3><p class="ef-step-copy"></p><div class="ef-check"><span>INVESTIGATOR’S QUESTION</span><p></p></div><a class="ef-source-link" target="_blank" rel="noopener noreferrer"></a></article><div class="ef-payload"><div class="ef-code-heading"><span>THE EVENT</span><span class="ef-payload-label">Sample fields · not a full event</span></div><pre aria-label="Example event fields"><code></code></pre><div class="ef-pattern"><span>THE RULE EXPECTS</span><code>source = acme.security<br>detail-type = Finding<br>detail.severity = high</code><span class="ef-match-result"></span></div></div></div>
    <footer class="ef-outcome" role="status"><span class="ef-outcome-icon">↗</span><div><span class="ef-outcome-label"></span><h3></h3><p></p></div></footer></div>
    <nav class="ef-next-links" aria-label="Continue the EventBridge investigation"><a href="#/service/eventbridge?tab=evidence">Find the evidence <span>↗</span></a><a href="#/service/eventbridge?tab=defense">Review the controls <span>↗</span></a><button type="button" class="ef-to-map">Explore connected services <span>↓</span></button></nav>`;
  page.querySelector('.mind-header').after(section);
  const $=selector=>section.querySelector(selector),all=selector=>[...section.querySelectorAll(selector)];
  const media=matchMedia('(prefers-reduced-motion: reduce)'),abort=new AbortController();
  const on=(el,type,fn)=>el.addEventListener(type,fn,{signal:abort.signal});
  let selected='source',mode='delivered',paused=media.matches,frame=0,destroyed=false;
  function draw(){
    if(destroyed)return;
    const canvas=$('.ef-canvas'),bounds=canvas.getBoundingClientRect(),mobile=$('[data-node="bus"]').offsetTop>$('[data-node="source"]').offsetTop,svg=$('.ef-wires');
    svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);
    const point=(id,exit)=>{const b=$(`[data-node="${id}"]`).getBoundingClientRect();return mobile?{x:b.left-bounds.left+b.width/2,y:b.top-bounds.top+(exit?b.height:0)}:{x:b.left-bounds.left+(exit?b.width:0),y:b.top-bounds.top+b.height/2};};
    const route=cases[mode].route;
    const wires=[['source','bus'],['bus','rule'],['rule','target'],['target','dlq']];
    svg.innerHTML=`<defs><marker id="ef-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="m2 1 6 4-6 4" fill="none" stroke="currentColor" stroke-width="1.6"/></marker></defs>`+wires.map(([from,to],i)=>{
      let a=point(from,true),b=point(to,false),d;
      if(to==='dlq'&&!mobile){const t=$('[data-node="target"]').getBoundingClientRect(),q=$('[data-node="dlq"]').getBoundingClientRect();a={x:t.left-bounds.left+t.width/2,y:t.bottom-bounds.top};b={x:q.left-bounds.left+q.width/2,y:q.top-bounds.top};d=`M${a.x} ${a.y}V${b.y}`;}
      else d=mobile?`M${a.x} ${a.y}C${a.x} ${(a.y+b.y)/2},${b.x} ${(a.y+b.y)/2},${b.x} ${b.y}`:`M${a.x} ${a.y}C${(a.x+b.x)/2} ${a.y},${(a.x+b.x)/2} ${b.y},${b.x} ${b.y}`;
      const active=route.includes(to),failure=to==='dlq';
      return `<g class="ef-edge ${active?'is-on':'is-off'} ${failure?'is-failure':''}"><path id="ef-wire-${i}" d="${d}" marker-end="url(#ef-arrow)"/>${active?`<circle class="ef-signal" r="4.5"><animateMotion dur="${2.5+i*.3}s" begin="-${i*.8}s" repeatCount="indefinite"><mpath href="#ef-wire-${i}"/></animateMotion></circle>`:''}</g>`;
    }).join('');
    if(paused||media.matches)svg.pauseAnimations();else svg.unpauseAnimations();
  }
  function render(){
    const c=cases[mode],note=notes[selected],index=c.route.indexOf(selected);
    section.dataset.case=mode;
    all('[data-case]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.case===mode)));
    all('[data-node]').forEach(b=>{const id=b.dataset.node,active=c.route.includes(id);b.setAttribute('aria-pressed',String(id===selected));b.classList.toggle('is-unused',!active);b.querySelector('.ef-node-state').textContent=id==='dlq'?(mode==='failed'?'Configured · receives event':'Configured · not used'):id==='rule'?(mode==='unmatched'?'NO MATCH':'MATCH'):id==='target'?(mode==='unmatched'?'Not invoked':mode==='failed'?'Permission denied':'Delivery accepted'):id==='bus'?'Evaluate the rules':'Publish event';});
    $('.ef-step-state').textContent=`${index<0?'Outside this route':`Step ${index+1} of ${c.route.length}`} · ${nodes.find(n=>n[0]===selected)[2]}`;
    $('.ef-back').disabled=index<=0;
    $('.ef-next').textContent=index===c.route.length-1?'Restart trace ↺':'Next step →';
    $('.ef-explanation h3').textContent=note.title;$('.ef-step-copy').textContent=note.body;$('.ef-check p').textContent=note.check;
    $('.ef-source-link').href=note.source;$('.ef-source-link').textContent=note.label+' ↗';
    $('.ef-payload pre code').innerHTML=`{\n  <span>"source"</span>: "acme.security",\n  <span>"detail-type"</span>: "Finding",\n  <span>"detail"</span>: {\n    <span>"severity"</span>: <mark>"${c.severity}"</mark>\n  }\n}`;
    $('.ef-match-result').textContent=mode==='unmatched'?'≠ low does not match high':'✓ All example conditions match';
    $('.ef-outcome-label').textContent=c.outcome;$('.ef-outcome h3').textContent=c.title;$('.ef-outcome p').textContent=c.summary;
    $('.ef-terminal').hidden=mode!=='unmatched';
    $('.ef-motion').textContent=media.matches?'Reduced motion':paused?'Resume motion':'Pause motion';$('.ef-motion').disabled=media.matches;$('.ef-motion').setAttribute('aria-pressed',String(paused));
    cancelAnimationFrame(frame);frame=requestAnimationFrame(draw);
  }
  all('[data-case]').forEach(b=>on(b,'click',()=>{mode=b.dataset.case;selected=mode==='unmatched'?'rule':mode==='failed'?'dlq':'target';render();}));
  all('[data-node]').forEach(b=>on(b,'click',()=>{selected=b.dataset.node;render();}));
  all('[data-node]').forEach((b,i)=>on(b,'keydown',event=>{let next;if(event.key==='ArrowRight'||event.key==='ArrowDown')next=(i+1)%nodes.length;else if(event.key==='ArrowLeft'||event.key==='ArrowUp')next=(i+nodes.length-1)%nodes.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=nodes.length-1;else return;event.preventDefault();const node=all('[data-node]')[next];selected=node.dataset.node;render();node.focus();}));
  on($('.ef-next'),'click',()=>{const r=cases[mode].route;selected=r[(r.indexOf(selected)+1)%r.length];render();});
  on($('.ef-back'),'click',()=>{const r=cases[mode].route;selected=r[Math.max(0,r.indexOf(selected)-1)];render();});
  on($('.ef-motion'),'click',()=>{paused=!paused;render();});
  on(media,'change',()=>{paused=media.matches;render();});
  on($('.ef-to-map'),'click',()=>{const graph=page.querySelector('.mind-workspace');graph.scrollIntoView({behavior:'instant',block:'start'});page.querySelector('#mind-reading').focus({preventScroll:true});});
  const resize=new ResizeObserver(()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(draw);});resize.observe($('.ef-canvas'));
  render();
  return ()=>{destroyed=true;abort.abort();resize.disconnect();cancelAnimationFrame(frame);};
}
