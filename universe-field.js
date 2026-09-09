let sharedAdapter;
﻿
const shader = `
struct Scene { screen: vec4f, motion: vec4f };
@group(0) @binding(0) var<uniform> scene: Scene;
struct Vertex { @builtin(position) position: vec4f, @location(0) uv: vec2f, @location(1) alpha: f32 };
@vertex fn vs(@builtin(vertex_index) vertex: u32, @builtin(instance_index) instance: u32) -> Vertex {
  let corners = array<vec2f,6>(vec2f(-1,-1),vec2f(1,-1),vec2f(-1,1),vec2f(-1,1),vec2f(1,-1),vec2f(1,1));
  let col = f32(instance % 96u) / 95.0;
  let row = f32(instance / 96u) / 31.0;
  let time = scene.motion.x;
  let x = col * 2.2 - 1.1;
  let wave = sin(col * 9.0 + row * 4.0 + time * 0.16) * 0.13 + cos(col*16.0-row*3.0-time*0.1)*0.04;
  let y = (row - 0.5) * 1.25 + wave;
  let point = vec2f(x,y);
  let pointer = vec2f(scene.screen.z*2.0-1.0,1.0-scene.screen.w*2.0);
  let glow = exp(-distance(point,pointer)*5.0);
  let corner = corners[vertex];
  let size = 0.75 + glow * 1.4;
  var out: Vertex;
  out.position = vec4f(point + corner * size * 2.0 / scene.screen.xy,0,1);
  out.uv = corner;
  out.alpha = (0.10 + glow * 0.36) * (0.35+row*0.65);
  return out;
}
@fragment fn fs(input: Vertex) -> @location(0) vec4f {
  let a = (1.0-smoothstep(0.1,1.0,length(input.uv)))*input.alpha;
  return vec4f(vec3f(0.49,0.69,0.83)*a,a);
}`;

export function mountField(stage,initialPaused=false) {
  let canvas=stage.querySelector('canvas'),dead=false,paused=initialPaused,frame=0,device=null,buffer=null,context=null;
  let width=1,height=1,pointer=[.5,.5],time=0,last=0,render=null,active=true;
  const controller=new AbortController(),opts={signal:controller.signal};
  const draw=()=>{if(render&&!dead)render();};
  const tick=now=>{frame=0;if(dead||paused||document.hidden||!active)return;if(now-last>=32){time+=last?Math.min((now-last)/1000,.06):0;last=now;draw();}frame=requestAnimationFrame(tick);};
  const start=()=>{if(!dead&&!paused&&!document.hidden&&active&&!frame){last=0;frame=requestAnimationFrame(tick);}};
  const stop=()=>{cancelAnimationFrame(frame);frame=0;};
  const resize=()=>{const r=stage.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,1.5);width=Math.max(1,Math.round(r.width*dpr));height=Math.max(1,Math.round(r.height*dpr));if(device){width=Math.min(width,device.limits.maxTextureDimension2D);height=Math.min(height,device.limits.maxTextureDimension2D);}canvas.width=width;canvas.height=height;draw();};
  const ro=new ResizeObserver(resize);ro.observe(stage);
  const io=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active)start();else stop();});io.observe(stage);
  stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();pointer=[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height];if(!paused&&!frame)draw();},opts);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else start();},opts);
  function fallback() {
    if(dead)return;
    const next=document.createElement('canvas');next.className='atlas-field';next.setAttribute('aria-hidden','true');canvas.replaceWith(next);canvas=next;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    stage.dataset.renderer='canvas2d';
    render=()=>{ctx.clearRect(0,0,width,height);for(let row=0;row<24;row++)for(let col=0;col<72;col++){
      const nx=col/71,ny=row/23,wave=Math.sin(nx*9+ny*4+time*.16)*.13+Math.cos(nx*16-ny*3-time*.1)*.04;
      const x=(nx*1.1-.05)*width,y=(.5-((ny-.5)*1.25+wave)/2)*height;
      const glow=Math.exp(-Math.hypot(x/width-pointer[0],y/height-pointer[1])*10),alpha=(.10+glow*.36)*(.35+ny*.65);
      ctx.fillStyle=`rgba(125,176,212,${alpha})`;ctx.beginPath();ctx.arc(x,y,.65+glow,0,Math.PI*2);ctx.fill();
    }};
    resize();draw();start();
  }
  async function init() {
    try {
      if(!navigator.gpu)return;
      const adapter=await (sharedAdapter??=navigator.gpu.requestAdapter({powerPreference:'low-power'}));
      if(dead)return;if(!adapter)return;
      const acquired=await adapter.requestDevice();
      if(dead){acquired.destroy();return;}device=acquired;
      const gpuCanvas=document.createElement('canvas');gpuCanvas.className='atlas-field';gpuCanvas.setAttribute('aria-hidden','true');
      context=gpuCanvas.getContext('webgpu');if(!context)throw Error('No GPU canvas');
      const format=navigator.gpu.getPreferredCanvasFormat();
      context.configure({device,format,alphaMode:'premultiplied'});
      const module=device.createShaderModule({code:shader});
      const info=await module.getCompilationInfo();
      if(dead)return;
      if(info.messages.some(m=>m.type==='error'))throw Error('GPU field compilation failed');
      const pipeline=await device.createRenderPipelineAsync({layout:'auto',vertex:{module,entryPoint:'vs'},fragment:{module,entryPoint:'fs',targets:[{format,blend:{color:{srcFactor:'one',dstFactor:'one-minus-src-alpha'},alpha:{srcFactor:'one',dstFactor:'one-minus-src-alpha'}}}]},primitive:{topology:'triangle-list'}});
      if(dead)return;
      buffer=device.createBuffer({size:32,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST});
      const group=device.createBindGroup({layout:pipeline.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer}}]});
      render=()=>{device.queue.writeBuffer(buffer,0,new Float32Array([width,height,...pointer,time,0,0,0]));const encoder=device.createCommandEncoder();const pass=encoder.beginRenderPass({colorAttachments:[{view:context.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:'clear',storeOp:'store'}]});pass.setPipeline(pipeline);pass.setBindGroup(0,group);pass.draw(6,3072);pass.end();device.queue.submit([encoder.finish()]);};
      canvas.replaceWith(gpuCanvas);canvas=gpuCanvas;
      stage.dataset.renderer='webgpu';
      device.lost.then(()=>{if(!dead&&device===acquired){render=null;buffer=null;device=null;fallback();}});
      resize();draw();start();
    } catch {
      if(dead)return;
      render=null;buffer?.destroy();buffer=null;
      const failed=device;device=null;
      if(context){context.unconfigure();context=null;}
      if(failed)failed.destroy();
      if(stage.isConnected)fallback();
    }
  }
  fallback();init();
  return {setPaused(value){paused=value;if(paused){stop();draw();}else start();},destroy(){dead=true;stop();controller.abort();ro.disconnect();io.disconnect();render=null;buffer?.destroy();context?.unconfigure();device?.destroy();}};
}
