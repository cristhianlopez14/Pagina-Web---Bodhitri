const cur=document.getElementById('cursor'),tra=document.getElementById('cursor-trail');
document.addEventListener('mousemove',e=>{
  cur.style.left=e.clientX+'px';cur.style.top=e.clientY+'px';
  setTimeout(()=>{tra.style.left=e.clientX+'px';tra.style.top=e.clientY+'px';},80);
});
document.querySelectorAll('button,a,.c-card,.val-item').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('hov'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('hov'));
});

const canvas=document.getElementById('ringCanvas');
const ctx=canvas.getContext('2d');
let W,H,RCX,RCY,maxR;
function resizeCanvas(){
  const p=document.getElementById('panel0');
  W=p.offsetWidth;H=p.offsetHeight;
  canvas.width=W;canvas.height=H;
  RCX=W*0.75;
  RCY=H*0.5;
  maxR=Math.min(W*0.45,H*0.45);
}
function centerOnLogo(){
  const logo=document.getElementById('logoCenter');
  const panel=document.getElementById('panel0');
  if(!logo||!panel)return;
  const lr=logo.getBoundingClientRect();
  const pr=panel.getBoundingClientRect();
  if(lr.width===0)return;
  RCX=lr.left-pr.left+lr.width/2;
  RCY=lr.top-pr.top+lr.height/2;
  maxR=lr.width*1.4;
}
const NUM_RINGS=7;
const rings=Array.from({length:NUM_RINGS},(_,i)=>({baseR:(i+1)/NUM_RINGS,phase:i*0.52,amplitude:0,targetAmp:0}));
const ripples=[];let lastRipple=0;
canvas.addEventListener('mousemove',e=>{
  const rect=canvas.getBoundingClientRect();
  const mx=e.clientX-rect.left,my=e.clientY-rect.top;
  const dx=mx-RCX,dy=my-RCY,dist=Math.sqrt(dx*dx+dy*dy);
  rings.forEach(ring=>{const rr=ring.baseR*maxR;ring.targetAmp=Math.max(0,1-Math.abs(dist-rr)/maxR*5)*18;});
});
canvas.addEventListener('mouseleave',()=>rings.forEach(r=>r.targetAmp=0));
function draw(ts){
  requestAnimationFrame(draw);
  ctx.clearRect(0,0,W,H);
  const wt=ts*0.0008;
  rings.forEach((ring,i)=>{
    ring.amplitude+=(ring.targetAmp-ring.amplitude)*0.06;
    const r=ring.baseR*maxR+Math.sin(wt*1.1-ring.phase)*4+ring.amplitude*Math.sin(wt*3-i*0.7);
    const baseA=0.06+(1-ring.baseR)*0.04;
    const pA=baseA+Math.abs(Math.sin(wt*1.1-ring.phase))*0.08;
    const hA=ring.amplitude>1?pA+ring.amplitude/18*0.35:pA;
    const t=Math.min(ring.amplitude/18,1);
    const rc=Math.round(249+(196-249)*t),gc=Math.round(237+(149-237)*t),bc=Math.round(220+(106-220)*t);
    ctx.beginPath();ctx.arc(RCX,RCY,Math.max(r,2),0,Math.PI*2);
    ctx.strokeStyle=`rgba(${rc},${gc},${bc},${hA})`;
    ctx.lineWidth=ring.amplitude>1?2.4+t*1.6:1.6;ctx.stroke();
  });
  if(ts-lastRipple>3200){lastRipple=ts;ripples.push({birth:ts});}
  for(let i=ripples.length-1;i>=0;i--){
    const rp=ripples[i],p=(ts-rp.birth)/2200;
    if(p>=1){ripples.splice(i,1);continue;}
    ctx.beginPath();ctx.arc(RCX,RCY,p*maxR*1.05,0,Math.PI*2);
    ctx.strokeStyle=`rgba(196,149,106,${(1-p)*0.22})`;
    ctx.lineWidth=3*(1-p);ctx.stroke();
  }
}
window.addEventListener('resize',()=>{resizeCanvas();setTimeout(centerOnLogo,50);});
resizeCanvas();
const _logo=document.getElementById('logoCenter');
function _initRings(){resizeCanvas();centerOnLogo();}
if(_logo.complete&&_logo.naturalWidth>0){_initRings();}
else{_logo.addEventListener('load',_initRings);}
requestAnimationFrame(()=>setTimeout(centerOnLogo,100));
requestAnimationFrame(draw);

const TOTAL=4;
let current=0,scrolling=false;
const panelEls=document.querySelectorAll('.panel');
const dots=document.querySelectorAll('.nav-dot');
const progEl=document.getElementById('progress');
const hint=document.getElementById('scrollHint');
let countersRan=false;
function goTo(idx,dir=1){
  if(idx<0||idx>=TOTAL||scrolling)return;
  scrolling=true;
  const prev=current;current=idx;
  panelEls[prev].classList.remove('active');
  panelEls[prev].classList.add('past');
  if(dir<0)panelEls[prev].style.transform='translateY(100%)';
  panelEls[current].classList.remove('past');
  panelEls[current].style.transform=dir>0?'translateY(100%)':'translateY(-100%)';
  panelEls[current].style.opacity='0';
  panelEls[current].getBoundingClientRect();
  panelEls[current].style.transform='';
  panelEls[current].style.opacity='';
  panelEls[current].classList.add('active');
  dots.forEach((d,i)=>d.classList.toggle('active',i===current));
  progEl.style.width=(current/(TOTAL-1)*100)+'%';
  hint.classList.toggle('hidden',current>0);
  if(current===3&&!countersRan){countersRan=true;setTimeout(animateCounters,500);}
  setTimeout(()=>{panelEls[prev].style.transform='';panelEls[prev].style.opacity='';scrolling=false;},950);
}
let wd=0,wTimer;
document.addEventListener('wheel',e=>{
  e.preventDefault();wd+=e.deltaY;
  clearTimeout(wTimer);
  wTimer=setTimeout(()=>{if(Math.abs(wd)>40)goTo(current+(wd>0?1:-1),wd>0?1:-1);wd=0;},60);
},{passive:false});
let ty0=0;
document.addEventListener('touchstart',e=>ty0=e.touches[0].clientY,{passive:true});
document.addEventListener('touchend',e=>{
  const d=ty0-e.changedTouches[0].clientY;
  if(Math.abs(d)>40){
    const panel=panelEls[current];
    if(panel.scrollHeight>panel.clientHeight){
      const atBottom=panel.scrollTop+panel.clientHeight>=panel.scrollHeight-2;
      const atTop=panel.scrollTop<=0;
      if(d>0&&!atBottom)return;
      if(d<0&&!atTop)return;
    }
    goTo(current+(d>0?1:-1),d>0?1:-1);
  }
},{passive:true});
document.addEventListener('keydown',e=>{
  if(e.key==='ArrowDown'||e.key==='PageDown')goTo(current+1,1);
  if(e.key==='ArrowUp'||e.key==='PageUp')goTo(current-1,-1);
});
dots.forEach(d=>d.addEventListener('click',()=>{const t=+d.dataset.target;goTo(t,t>current?1:-1);}));
document.querySelectorAll('[data-panel]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();const t=+a.dataset.panel;goTo(t,t>current?1:-1);}));
function animateCounters(){
  [[0,5],[1,360],[2,8]].forEach(([i,target])=>{
    const el=document.getElementById('mn'+i);if(!el)return;
    const suf=el.querySelector('span').outerHTML;let n=0;
    const step=Math.ceil(target/30);
    const timer=setInterval(()=>{n=Math.min(n+step,target);el.innerHTML=n+suf;if(n>=target)clearInterval(timer);},35);
  });
}
panelEls.forEach((p,i)=>{if(i===0)p.classList.add('active');else p.classList.add('past');});

/* ── Sonido ambiental de bosque (Web Audio API) ── */
let audioCtx=null,forestNodes=[],forestOn=false;

function buildForest(){
  audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  const master=audioCtx.createGain();
  master.gain.setValueAtTime(0,audioCtx.currentTime);
  master.gain.linearRampToValueAtTime(0.55,audioCtx.currentTime+3);
  master.connect(audioCtx.destination);

  const bufSize=2*audioCtx.sampleRate;
  const buf=audioCtx.createBuffer(1,bufSize,audioCtx.sampleRate);
  const d=buf.getChannelData(0);
  let last=0;
  for(let i=0;i<bufSize;i++){last=(last+0.02*(Math.random()*2-1))/1.02;d[i]=last*3.5;}
  const wind=audioCtx.createBufferSource();
  wind.buffer=buf;wind.loop=true;
  const lp=audioCtx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=320;
  const lp2=audioCtx.createBiquadFilter();lp2.type='lowpass';lp2.frequency.value=180;
  const windGain=audioCtx.createGain();windGain.gain.value=0.7;
  wind.connect(lp);lp.connect(lp2);lp2.connect(windGain);windGain.connect(master);
  wind.start();

  const lfo=audioCtx.createOscillator();
  const lfoGain=audioCtx.createGain();
  lfo.frequency.value=0.07;lfoGain.gain.value=0.18;
  lfo.connect(lfoGain);lfoGain.connect(windGain.gain);
  lfo.start();

  const buf2=audioCtx.createBuffer(1,bufSize,audioCtx.sampleRate);
  const d2=buf2.getChannelData(0);
  for(let i=0;i<bufSize;i++)d2[i]=Math.random()*2-1;
  const leaves=audioCtx.createBufferSource();
  leaves.buffer=buf2;leaves.loop=true;
  const hp=audioCtx.createBiquadFilter();hp.type='bandpass';hp.frequency.value=3200;hp.Q.value=0.4;
  const leafGain=audioCtx.createGain();leafGain.gain.value=0.045;
  leaves.connect(hp);hp.connect(leafGain);leafGain.connect(master);
  leaves.start();

  function bird(freq,delay,interval){
    function chirp(){
      const osc=audioCtx.createOscillator();
      const g=audioCtx.createGain();
      osc.type='sine';
      osc.frequency.setValueAtTime(freq,audioCtx.currentTime);
      osc.frequency.linearRampToValueAtTime(freq*1.18,audioCtx.currentTime+0.06);
      g.gain.setValueAtTime(0,audioCtx.currentTime);
      g.gain.linearRampToValueAtTime(0.08,audioCtx.currentTime+0.02);
      g.gain.linearRampToValueAtTime(0,audioCtx.currentTime+0.12);
      osc.connect(g);g.connect(master);
      osc.start();osc.stop(audioCtx.currentTime+0.14);
      setTimeout(chirp,interval+(Math.random()-0.5)*interval*0.4);
    }
    setTimeout(chirp,delay);
  }
  bird(1800,2000,4200);
  bird(2400,5500,6800);
  bird(1550,9000,9500);

  forestNodes={master,wind,leaves,lfo};
}

function toggleForest(){
  const btn=document.getElementById('forestBtn');
  if(!forestOn){
    if(!audioCtx)buildForest();
    else{forestNodes.master.gain.cancelScheduledValues(audioCtx.currentTime);
         forestNodes.master.gain.setValueAtTime(forestNodes.master.gain.value,audioCtx.currentTime);
         forestNodes.master.gain.linearRampToValueAtTime(0.55,audioCtx.currentTime+2);}
    forestOn=true;
    btn.classList.add('active');
    btn.title='Silenciar sonido';
  }else{
    forestNodes.master.gain.cancelScheduledValues(audioCtx.currentTime);
    forestNodes.master.gain.setValueAtTime(forestNodes.master.gain.value,audioCtx.currentTime);
    forestNodes.master.gain.linearRampToValueAtTime(0,audioCtx.currentTime+1.5);
    forestOn=false;
    btn.classList.remove('active');
    btn.title='Activar sonido del bosque';
  }
}
document.getElementById('forestBtn').addEventListener('click',toggleForest);
