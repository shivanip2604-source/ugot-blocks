/* Virtual UGOT engine: physics loop, Python bridge (Pyodide), sound, playback and UI.
   Each topic file calls UGOT.register({...}). Units: millimetres, seconds, degrees. Heading 0 = east, clockwise positive (screen y points down). */
(function(){
const U=window.UGOT={topics:{},register(t){U.topics[t.id]=t}};
const DT=0.05;U.DT=DT;
const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const num=(v,d)=>(v===undefined||v===null||isNaN(Number(v)))?d:Number(v);
U.clamp=clamp;U.rad=rad;U.deg=deg;U.num=num;U.esc=esc;
const normA=a=>{a%=360;if(a>180)a-=360;if(a<-180)a+=360;return a};U.normA=normA;
let T=null,S=null,py=null,P={t:0,end:0,playing:false,speed:1,last:0,logShown:-1,done:false,live:false};
let opts={},keys={},seedBase=7,liveAcc=0;
/* ---------- sim state ---------- */
function newSim(){
  const cfg=T.cfg;
  const s={t:0,x:0,y:0,h:0,cmd:{vx:0,vy:0,wz:0},opts:{...opts},cfg,frames:[],logs:[],events:[],st:{},finished:false,reason:"",error:null,
    seed:seedBase,doneAt:null,crashes:0,odo:0};
  s.rnd=()=>{s.seed=(s.seed*1664525+1013904223)>>>0;return s.seed/4294967296};
  s.log=(m,c)=>s.logs.push({t:s.t,msg:String(m),cls:c||""});
  s.ev=(type,say,extra)=>s.events.push({t:s.t,type,say:say||"",...(extra||{})});
  s.tick=()=>tick(s);
  s.runFor=sec=>{const n=Math.max(0,Math.round(sec/DT));for(let i=0;i<n;i++)tick(s)};
  s.setVel=(vx,vy,wz)=>{s.cmd.vx=vx;s.cmd.vy=vy;s.cmd.wz=wz};
  if(T.view)s.view=x=>T.view(x||s);
  T.init(s);
  record(s);
  return s;
}
function record(s){
  const f={t:s.t,x:s.x,y:s.y,h:s.h,v:[s.cmd.vx,s.cmd.vy,s.cmd.wz],...(T.snap?T.snap(s):{})};
  if(T.chart)f.c=T.chart.series.map(x=>x.get(s));
  s.frames.push(f);
}
function robotBlocked(s,x,y,h){
  const c=s.cfg,r=c.rad||100,W=c.world;
  if(x<r||y<r||x>W.w-r||y>W.h-r)return"wall";
  return T.blocked?T.blocked(s,x,y,h):null;
}
function tick(s){
  if(s.finished)return;
  if(s.t>=T.maxT){s.finished=true;s.reason="timeout";throw new Error("SIM_TIME: the simulator stopped the program after "+T.maxT+" s of robot time.")}
  if(T.pre)T.pre(s);
  const c=s.cmd,r=rad(s.h),fx=Math.cos(r),fy=Math.sin(r);
  let vx=c.vx,vy=c.vy,wz=c.wz;
  if(T.slip)({vx,vy,wz}=T.slip(s,{vx,vy,wz}));
  const nx=s.x+(fx*vx-fy*vy)*DT,ny=s.y+(fy*vx+fx*vy)*DT,nh=normA(s.h+wz*DT);
  if(vx||vy||wz){
    const hit=robotBlocked(s,nx,ny,nh);
    if(hit){if(!s.inContact){s.crashes++;s.inContact=true;s.ev("bump","Collision");s.log("Bump! The robot hit the "+hit+" and the wheels stopped.","err");if(T.onBump)T.onBump(s,hit)}
      s.cmd.vx=s.cmd.vy=s.cmd.wz=0}
    else{s.inContact=false;s.odo+=(vx)*DT;s.x=nx;s.y=ny;s.h=nh}
  }
  if(T.step)T.step(s);
  s.t=Math.round((s.t+DT)*1000)/1000;
  record(s);
  if(T.done&&s.doneAt===null){const d=T.done(s);if(d){s.doneAt=s.t+(T.doneDelay===undefined?1:T.doneDelay);s.doneReason=d;s.log(d,"sys")}}
  if(s.doneAt!==null&&s.t>=s.doneAt){s.finished=true;s.reason="done";throw new Error("SIM_DONE")}
}
/* ---------- shared API groups ---------- */
const spd=v=>clamp(Math.abs(num(v,30)),0,100);
U.apiDrive=function(extra){return[
  {n:"drive_forward",a:"speed=30, seconds=None",d:"Start driving forward (speed 0 to 100). With seconds, it drives for that time and stops.",f:(s,sp,sec)=>{s.setVel(spd(sp)*s.cfg.mmps,0,0);if(sec!=null){s.runFor(num(sec,0));s.setVel(0,0,0)}}},
  {n:"drive_backward",a:"speed=30, seconds=None",d:"Start driving backward.",f:(s,sp,sec)=>{s.setVel(-spd(sp)*s.cfg.mmps,0,0);if(sec!=null){s.runFor(num(sec,0));s.setVel(0,0,0)}}},
  {n:"turn_left",a:"speed=30, seconds=None",d:"Start turning left on the spot. Keeps turning until you call stop() or another move.",f:(s,sp,sec)=>{s.setVel(0,0,-spd(sp)*s.cfg.degps);if(sec!=null){s.runFor(num(sec,0));s.setVel(0,0,0)}}},
  {n:"turn_right",a:"speed=30, seconds=None",d:"Start turning right on the spot.",f:(s,sp,sec)=>{s.setVel(0,0,spd(sp)*s.cfg.degps);if(sec!=null){s.runFor(num(sec,0));s.setVel(0,0,0)}}},
  {n:"stop",a:"",d:"Stop the wheels.",f:s=>{s.setVel(0,0,0)}}
]};
U.apiMecanum=function(){return[
  {n:"translate",a:"angle, speed=30",d:"Slide in any direction while the nose keeps facing forward. 0 = forward, 90 = right, 180 = back, -90 = left.",f:(s,a,sp)=>{const v=spd(sp)*s.cfg.mmps,r=rad(num(a,0));const R=z=>Math.abs(z)<1e-9?0:z;s.setVel(R(Math.cos(r))*v,R(Math.sin(r))*v,0)}},
  {n:"shift_x",a:"speed",d:"Slide sideways. Positive = right, negative = left.",f:(s,v)=>{s.cmd.vy=clamp(num(v,0),-100,100)*s.cfg.mmps}},
  {n:"drive_y",a:"speed",d:"Drive forward (positive) or backward (negative).",f:(s,v)=>{s.cmd.vx=clamp(num(v,0),-100,100)*s.cfg.mmps}},
  {n:"rotate_z",a:"speed",d:"Rotate on the spot. Positive = clockwise (right), negative = anticlockwise.",f:(s,v)=>{s.cmd.wz=clamp(num(v,0),-100,100)*s.cfg.degps}},
  {n:"turn_right_in_place",a:"speed=30, seconds=None",d:"Turn right on the spot. With seconds, it turns for that time and stops.",f:(s,sp,sec)=>{s.setVel(0,0,spd(sp)*s.cfg.degps);if(sec!=null){s.runFor(num(sec,0));s.setVel(0,0,0)}}},
  {n:"turn_left_in_place",a:"speed=30, seconds=None",d:"Turn left on the spot.",f:(s,sp,sec)=>{s.setVel(0,0,-spd(sp)*s.cfg.degps);if(sec!=null){s.runFor(num(sec,0));s.setVel(0,0,0)}}}
]};
/* TOF: the topic supplies T.rayAhead(s) -> distance in mm to the nearest thing ahead (Infinity if none). */
U.apiTof=function(){return[
  {n:"tof_distance_cm",a:"",d:"TOF distance in cm. Range 4 to 200 cm: under 4 cm it returns 0, over 200 cm it returns 200. Each reading takes 50 ms.",
   f:s=>{s.tick();let d=T.rayAhead(s)/10;if(s.opts.noise!==false)d+=(s.rnd()*2-1)*0.6;
     if(s.opts.spikes&&s.rnd()<0.04)d=4+s.rnd()*26;
     s.st.tofReads=(s.st.tofReads||0)+1;s.tofLast=d<4?0:(d>200?200:Math.round(d*10)/10);return s.tofLast}}
]};
U.apiTime=function(){return[
  {n:"sleep",a:"seconds",d:"Wait. Robot time passes.",f:(s,x)=>{s.runFor(num(x,0))},hide:true},
  {n:"time",a:"",d:"Robot time in seconds.",f:s=>s.t,hide:true}
]};
/* ---------- Python bridge ---------- */
function buildPrelude(){
  let p=`import sys, types, json
import ugot_js as _j
def _c(name,*a):
    return json.loads(_j.c(name,*a))
def sleep(seconds): _c("sleep",seconds)
def time(): return _c("time")
_t=types.ModuleType('time')
_t.sleep=sleep
_t.time=time
_t.perf_counter=time
_t.monotonic=time
sys.modules['time']=_t
def median(values):
    v=sorted(values); n=len(v)
    return v[n//2] if n%2 else (v[n//2-1]+v[n//2])/2
def mean(values): return sum(values)/len(values)
def most_common(values):
    best=None; bc=0
    for x in values:
        c=values.count(x)
        if c>bc: best,bc=x,c
    return best
`;
  for(const a of T.api){
    if(a.hide)continue;
    const names=a.a.split(",").map(x=>x.trim().split("=")[0].trim()).filter(Boolean);
    p+=`def ${a.n}(${a.a}):\n    r=_c("${a.n}"${names.map(n=>","+n).join("")})\n    return ${a.tuple?"tuple(r)":"r"}\n`;
  }
  return p;
}
const RUNNER=`
import sys
_G={}
def _run(src,fresh=True):
    global _G
    real_time=sys.modules.get('time')
    if fresh or not _G:
        _G={'__name__':'__main__'}
        exec(compile(PRELUDE,'<prelude>','exec'),_G)
    code=compile(src,'<student>','exec')
    n=[0]
    def tr(frame,event,arg):
        if frame.f_code.co_filename!='<student>': return None
        n[0]+=1
        if n[0]>400000: raise RuntimeError('Your program ran too many steps without finishing. Is there a loop with nothing inside that never ends?')
        return tr
    sys.settrace(tr)
    try: exec(code,_G)
    finally:
        sys.settrace(None)
        if real_time is not None: sys.modules['time']=real_time
`;
const PYO=new URLSearchParams(location.search).get("pyo")||"https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
U.PYO=PYO;
U.loadPyodideOnce=function(cb,fail){
  if(U._py){cb(U._py);return}
  if(U._loading){U._loading.push([cb,fail]);return}
  U._loading=[[cb,fail]];
  const s=document.createElement("script");s.src=PYO+"pyodide.js";
  s.onload=async()=>{try{U._py=await loadPyodide({indexURL:PYO});const q=U._loading;U._loading=null;q.forEach(x=>x[0](U._py))}catch(e){const q=U._loading;U._loading=null;q.forEach(x=>x[1]&&x[1](e))}};
  s.onerror=()=>{const q=U._loading;U._loading=null;q.forEach(x=>x[1]&&x[1](new Error("Could not load Python")))};
  document.head.appendChild(s);
};
function callApi(name,...args){
  const a=T.apiMap[name];if(!a)throw new Error("Unknown function "+name);
  if(S.finished){throw new Error(S.reason==="timeout"?"SIM_TIME: stopped":"SIM_DONE")}
  const out=a.f(S,...args);
  return JSON.stringify(out===undefined?null:out);
}
/* ---------- audio ---------- */
const AUD=U.AUD=(()=>{
  let ac=null,master=null,hum=null,humG=null,hum2=null,servoG=null,on=true,nextBeep=0,lastF=null;
  try{on=localStorage.getItem("ugot_sound")!=="off"}catch(e){}
  function init(){
    if(ac)return;const C=window.AudioContext||window.webkitAudioContext;if(!C)return;
    ac=new C();master=ac.createGain();master.gain.value=Number($("vol").value)/100*0.5;master.connect(ac.destination);
    hum=ac.createOscillator();hum.type="sawtooth";hum.frequency.value=70;const lp=ac.createBiquadFilter();lp.type="lowpass";lp.frequency.value=380;
    humG=ac.createGain();humG.gain.value=0;hum.connect(lp);lp.connect(humG);humG.connect(master);hum.start();
    hum2=ac.createOscillator();hum2.type="square";hum2.frequency.value=420;servoG=ac.createGain();servoG.gain.value=0;hum2.connect(servoG);servoG.connect(master);hum2.start();
  }
  function tone(f,d,type,vol,delay,slide){
    if(!ac||!on)return;const t=ac.currentTime+(delay||0),o=ac.createOscillator(),g=ac.createGain();
    o.type=type||"sine";o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);
    g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.5,t+0.012);g.gain.exponentialRampToValueAtTime(0.0001,t+d);
    o.connect(g);g.connect(master);o.start(t);o.stop(t+d+0.05);
  }
  function noise(d,vol,delay,freq){
    if(!ac||!on)return;const t=ac.currentTime+(delay||0),n=Math.floor(ac.sampleRate*d),b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);
    for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=ac.createBufferSource();s.buffer=b;
    const f=ac.createBiquadFilter();f.type="lowpass";f.frequency.value=freq||500;const g=ac.createGain();g.gain.value=vol||0.8;s.connect(f);f.connect(g);g.connect(master);s.start(t);
  }
  function say(t){
    if(!on||!$("voice").checked||!("speechSynthesis" in window))return;
    try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(t);u.rate=1.05;u.volume=Number($("vol").value)/100;speechSynthesis.speak(u)}catch(e){}
  }
  function fire(e){
    switch(e.type){
      case"bump":noise(0.35,1,0,300);tone(110,0.3,"sine",0.7,0,50);tone(180,0.4,"square",0.18,0.05,90);break;
      case"good":tone(900,0.05,"square",0.3);tone(600,0.08,"square",0.3,0.06);tone(1200,0.18,"triangle",0.4,0.15);break;
      case"bad":tone(300,0.18,"sawtooth",0.3);tone(200,0.25,"sawtooth",0.3,0.18);break;
      case"deliver":[784,988,1175].forEach((f,i)=>tone(f,0.14,"triangle",0.4,i*0.11));break;
      case"crush":noise(0.3,0.9,0,1800);tone(240,0.25,"sawtooth",0.3,0.02,90);break;
      case"lift":tone(500,0.09,"sine",0.25);tone(700,0.1,"sine",0.25,0.08);break;
      case"click":tone(700,0.04,"square",0.2);break;
      case"clap":noise(0.12,1,0,3500);tone(900,0.05,"square",0.12);break;
      case"light":tone(1046,0.12,"sine",0.3);tone(1318,0.14,"sine",0.3,0.1);break;
      case"note":tone(e.f||523,0.35,"triangle",0.4);break;
      case"sort":tone(440,0.06,"square",0.2);tone(660,0.09,"square",0.2,0.07);break;
      case"error":tone(160,0.5,"sawtooth",0.4);tone(120,0.6,"sawtooth",0.4,0.15);break;
    }
    if(e.say)say(e.say);
  }
  return{
    unlock(){init();if(ac&&ac.state==="suspended")ac.resume();lastF=null;nextBeep=0},
    toggle(){on=!on;try{localStorage.setItem("ugot_sound",on?"on":"off")}catch(e){}if(!on&&humG){humG.gain.value=0;servoG.gain.value=0;try{speechSynthesis.cancel()}catch(e){}}init();return on},
    isOn(){return on},setVol(v){if(master)master.gain.value=v/100*0.5},
    step(t0,t1){
      if(!ac||!on||!S)return;
      const f=frameAt(t1);
      if(!P.playing&&!P.live){humG.gain.setTargetAtTime(0,ac.currentTime,0.03);servoG.gain.setTargetAtTime(0,ac.currentTime,0.03);lastF=f;return}
      if(t1>t0)for(const e of S.events)if(e.t>t0&&e.t<=t1)fire(e);
      const mv=Math.hypot(f.v[0],f.v[1])/(S.cfg.mmps||10),tw=Math.abs(f.v[2])/(S.cfg.degps||3),run=mv>0||tw>0;
      humG.gain.setTargetAtTime(run?0.14:0,ac.currentTime,0.05);hum.frequency.setTargetAtTime(55+mv*2.2+tw*0.6,ac.currentTime,0.05);
      let mov=false;if(lastF&&f.sv&&lastF.sv)for(let i=0;i<f.sv.length;i++)if(Math.abs(f.sv[i]-lastF.sv[i])>0.05)mov=true;
      servoG.gain.setTargetAtTime(mov?0.05:0,ac.currentTime,0.03);if(mov)hum2.frequency.setTargetAtTime(380+(f.sv[0]||0)*1.2,ac.currentTime,0.03);
      const d=f.beep;if(d!==null&&d!==undefined&&d>0&&d<=(T.beepMax||300)){const now=performance.now();if(now>=nextBeep){tone(d<=60?1500:1000,0.06,"square",0.18);nextBeep=now+(80+d*1.8)/Math.max(P.speed,1)}}
      lastF=f;
    },
    result(oks,pass,total){
      init();if(!ac||!on)return;if(humG){humG.gain.setTargetAtTime(0,ac.currentTime,0.03);servoG.gain.setTargetAtTime(0,ac.currentTime,0.03)}
      oks.slice(0,12).forEach((ok,i)=>ok?tone(660+i*60,0.09,"triangle",0.3,0.13*i):tone(180,0.14,"square",0.22,0.13*i));
      const t=0.13*Math.min(oks.length,12)+0.2;
      if(pass===total){[523,659,784,1046].forEach((fq,i)=>tone(fq,0.22,"triangle",0.45,t+i*0.14));tone(1046,0.7,"sine",0.35,t+0.58);say("Mission complete. All "+total+" tests passed.")}
      else if(pass>=Math.ceil(total/2)){tone(440,0.2,"triangle",0.4,t);tone(554,0.3,"triangle",0.4,t+0.2);say(pass+" of "+total+" tests passed. Check the red ones.")}
      else{tone(300,0.25,"sawtooth",0.3,t);tone(220,0.4,"sawtooth",0.3,t+0.25);say(pass+" of "+total+" tests passed. Try again.")}
    },
    click(){init();if(ac&&ac.state==="suspended")ac.resume()}
  };
})();
/* ---------- playback ---------- */
function frameAt(t){const F=S.frames;let lo=0,hi=F.length-1;while(lo<hi){const m=(lo+hi+1)>>1;F[m].t<=t?lo=m:hi=m-1}return F[lo]}
const cv=()=>$("arena");
let SC=1;
function draw(){
  if(!S||!T)return;
  const f=frameAt(P.t),c=cv(),ctx=c.getContext("2d");
  SC=c.width/T.cfg.world.w;
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,c.width,c.height);
  ctx.setTransform(SC,0,0,SC,0,0);
  T.draw(ctx,f,U.helpers(ctx),S);
  if(T.inset){const ic=$("inset"),ix=ic.getContext("2d");ix.setTransform(1,0,0,1,0,0);ix.clearRect(0,0,ic.width,ic.height);T.inset(ix,f,ic.width,ic.height,S)}
  if(T.chart)drawChart(f);
  const hud=T.hud(f,S);$("hud").innerHTML=hud.map(h=>`<div><span>${esc(h[0])}</span><b>${esc(h[1])}</b></div>`).join("");
  const upto=S.logs.filter(l=>l.t<=P.t+1e-6);
  if(upto.length!==P.logShown){P.logShown=upto.length;const con=$("console");con.innerHTML=upto.map(l=>`<div class="${l.cls}"><span class="t">[${l.t.toFixed(1)}s]</span> ${esc(l.msg)}</div>`).join("");con.scrollTop=con.scrollHeight}
  $("scrub").value=Math.round(P.t*100);
}
const css=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();U.css=css;
function drawChart(f){
  const ch=$("chart"),cc=ch.getContext("2d"),w=ch.width,h=ch.height,pl=52,pr=10,pt=14,pb=26,Tm=Math.max(P.end,10),C=T.chart,YM=C.ymax;
  cc.setTransform(1,0,0,1,0,0);cc.clearRect(0,0,w,h);cc.fillStyle=css("--panel");cc.fillRect(0,0,w,h);cc.font="12px system-ui";cc.fillStyle=css("--muted");cc.strokeStyle=css("--grid");cc.lineWidth=1;
  const X=t=>pl+(w-pl-pr)*t/Tm,Y=v=>pt+(h-pt-pb)*(1-clamp(v,C.ymin||0,YM)/YM+((C.ymin||0)/YM)*0);
  const y0=C.ymin||0,Yv=v=>pt+(h-pt-pb)*(1-(clamp(v,y0,YM)-y0)/(YM-y0));
  for(let i=0;i<=4;i++){const v=y0+(YM-y0)*i/4;cc.beginPath();cc.moveTo(pl,Yv(v));cc.lineTo(w-pr,Yv(v));cc.stroke();cc.fillText((YM<=2?v.toFixed(2):Math.round(v))+" "+C.unit,4,Yv(v)+4)}
  const step=Tm>40?10:(Tm>15?5:2);for(let t=0;t<=Tm;t+=step)cc.fillText(t+"s",X(t)-6,h-8);
  for(const L of (C.lines||(C.line?[C.line]:[]))){cc.strokeStyle=css('--accent');cc.setLineDash([4,4]);cc.beginPath();cc.moveTo(pl,Yv(L[0]));cc.lineTo(w-pr,Yv(L[0]));cc.stroke();cc.setLineDash([]);cc.fillStyle=css('--accent');cc.fillText(L[1],w-pr-cc.measureText(L[1]).width,Yv(L[0])-5)}
  const cols=["--blue","--accent","--ok","--bad"];
  C.series.forEach((se,i)=>{cc.strokeStyle=css(cols[i%4]);cc.lineWidth=2;cc.beginPath();let first=true;
    for(const fr of S.frames){if(fr.t>P.t)break;const v=fr.c&&fr.c[i];if(v===null||v===undefined)continue;first?cc.moveTo(X(fr.t),Yv(v)):cc.lineTo(X(fr.t),Yv(v));first=false}cc.stroke();
    cc.fillStyle=css(cols[i%4]);cc.fillText(se.label,pl+8+i*130,pt+10)});
  cc.strokeStyle=css("--ink");cc.lineWidth=1;cc.beginPath();cc.moveTo(X(P.t),pt);cc.lineTo(X(P.t),h-pb);cc.stroke();
}
U.helpers=function(ctx){
  return{
    css,
    text(str,x,y,px,color,align){ctx.save();ctx.fillStyle=color||css("--ink");ctx.font=(px/SC)+"px system-ui";ctx.textAlign=align||"left";ctx.fillText(str,x,y);ctx.restore()},
    robot(x,y,h,o){o=o||{};ctx.save();ctx.translate(x,y);ctx.rotate(rad(h));
      const L=o.L||200,W=o.W||160;
      ctx.fillStyle="rgba(0,0,0,.18)";ctx.beginPath();ctx.roundRect(-L/2+8,-W/2+10,L,W,18);ctx.fill();
      ctx.fillStyle="#0b1d30";for(const px of [-L/2+12,L/2-52])for(const py of [-W/2-14,W/2-12]){ctx.fillRect(px,py,40,26)}
      ctx.strokeStyle="#5f7690";ctx.lineWidth=2;for(const px of [-L/2+12,L/2-52])for(const py of [-W/2-14,W/2-12])for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(px+6+k*9,py+2);ctx.lineTo(px+12+k*9,py+24);ctx.stroke()}
      const g=ctx.createLinearGradient(0,-W/2,0,W/2);g.addColorStop(0,"#4a5866");g.addColorStop(1,"#2b3540");
      ctx.fillStyle=g;ctx.strokeStyle=o.edge||"#ff7a21";ctx.lineWidth=5;ctx.beginPath();ctx.roundRect(-L/2,-W/2,L,W,18);ctx.fill();ctx.stroke();
      ctx.fillStyle="#ff7a21";ctx.fillRect(-L/2+22,-10,L*0.22,20);
      ctx.fillStyle=o.led||"#5a6b7d";ctx.beginPath();ctx.arc(-L/4+10,W*0.26,10,0,7);ctx.fill();
      ctx.fillStyle="#1fb6e5";ctx.beginPath();ctx.arc(L/2-8,0,9,0,7);ctx.fill();
      ctx.fillStyle="#fff";ctx.beginPath();ctx.moveTo(L/2-34,-14);ctx.lineTo(L/2-14,0);ctx.lineTo(L/2-34,14);ctx.closePath();ctx.globalAlpha=.8;ctx.fill();
      ctx.restore()},
    cone(x,y,h,fov,len,color){ctx.save();ctx.translate(x,y);ctx.rotate(rad(h));const g=ctx.createRadialGradient(0,0,10,0,0,len);g.addColorStop(0,color||"rgba(31,182,229,.35)");g.addColorStop(1,"rgba(31,182,229,0)");ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,len,rad(-fov/2),rad(fov/2));ctx.closePath();ctx.fill();ctx.restore()},
    grid(w,h,step){ctx.save();ctx.strokeStyle=css("--grid");ctx.lineWidth=2/SC;ctx.fillStyle=css("--muted");ctx.font=(11/SC)+"px system-ui";
      for(let x=0;x<=w;x+=step){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();if(x&&x%(step*2)===0)ctx.fillText((x/1000)+" m",x+8,h-10)}
      for(let y=0;y<=h;y+=step){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();if(y&&y%(step*2)===0)ctx.fillText((y/1000)+" m",8,y-8)}ctx.restore()},
    trail(s,t,col,w){ctx.save();ctx.strokeStyle=col||'#f26a21';ctx.lineWidth=w||7;ctx.globalAlpha=.75;ctx.lineJoin='round';ctx.beginPath();let first=true;const F=s.frames;for(let i=0;i<F.length;i+=2){if(F[i].t>t)break;first?ctx.moveTo(F[i].x,F[i].y):ctx.lineTo(F[i].x,F[i].y);first=false}ctx.stroke();ctx.restore()},
    border(w,h){ctx.save();ctx.strokeStyle=css("--wall");ctx.lineWidth=10;ctx.strokeRect(0,0,w,h);ctx.restore()},
    ctx
  };
};
/* ---------- checks ---------- */
function renderChecks(show,snd){
  const ul=$("checks"),sc=$("score");
  if(show===null){ul.innerHTML='<li class="wait"><span class="ic">·</span><div>Run your program to see the test results.</div></li>';sc.innerHTML="";return}
  if(show===false){ul.innerHTML='<li class="wait"><span class="ic">▶</span><div>Watch the simulation. Results appear when it finishes.</div></li>';sc.innerHTML="";return}
  if(T.noScore){const r0=T.checks(S);sc.innerHTML='<div><strong>Free play: information only</strong><div class="note">No marks here. Use these numbers as evidence in your own tests.</div></div>';ul.innerHTML=r0.map(x=>`<li class="ok"><span class="ic">·</span><div><strong>${esc(x.t)}</strong><small>${esc(x.d)}</small></div></li>`).join('');if(snd)AUD.result([true,true],2,2);return}
  const r=T.checks(S),pass=r.filter(x=>x.ok).length,pct=Math.round(pass/r.length*100);if(snd)AUD.result(r.map(x=>x.ok),pass,r.length);
  sc.innerHTML=`<div class="ring" style="--p:${pct}"><i>${pct}%</i></div><div><strong>${pass} of ${r.length} tests passed</strong><div class="note">${esc(T.tests?T.tests.length+" tests from your Criterion C test plan plus safety checks":"")}</div></div>`;
  ul.innerHTML=r.map(x=>`<li class="${x.ok?"ok":"no"}"><span class="ic">${x.ok?"✔":"✘"}</span><div><strong>${esc(x.t)}</strong>${x.b?'<span class="b1">'+esc(x.b)+'</span>':''}<small>${esc(x.d)}</small></div></li>`).join("");
  if(snd)postResult(pass,r.length);
}
function postResult(pass,total){
  try{
    if(typeof postToSheet!=="function"||typeof currentUser!=="function")return;
    const u=currentUser();if(!u)return;
    postToSheet("quiz",{Name:u.name,Class:u.klass,Criterion:"C",Topic:"Topic "+T.id,Lesson:T.name,Quiz:"Simulator · Topic "+T.id+" "+T.name+" · "+(S.opts.scenario||"default"),Score:pass,Total:total,Percent:Math.round(pass/total*100),TimeTakenSec:Math.round(S.t)});
    $("copyStatus").textContent="Result saved to the class Google Sheet.";
  }catch(e){}
}
/* ---------- run ---------- */
function applyOpts(){
  opts={};
  for(const c of (T.controls||[])){const el=$("opt_"+c.id);opts[c.id]=c.type==="check"?el.checked:(c.type==="range"?Number(el.value):el.value)}
  opts.scenario=(T.controls&&T.controls[0]&&$("opt_"+T.controls[0].id)&&$("opt_"+T.controls[0].id).selectedOptions)?$("opt_"+T.controls[0].id).selectedOptions[0].textContent:"default";
  opts.pos=opts.pos||{};
}
let posOverride={};
function hardReset(){
  stopLive();applyOpts();opts.pos=posOverride;S=newSim();
  P={...P,t:0,end:0,playing:false,done:false,logShown:-1};
  $("scrub").max=0;$("scrub").value=0;$("playBtn").disabled=true;$("copyBtn").disabled=true;renderChecks(null);draw();
}
async function runProgram(fresh){
  const pyo=U._py;if(!pyo)return;stopLive();
  if(fresh){applyOpts();opts.pos=posOverride;S=newSim();S.seed=seedBase}
  const startT=fresh?0:S.t;S.finished=false;S.reason="";S.doneAt=null;
  P={...P,playing:false,done:false,logShown:-1};
  pyo.setStdout({batched:s=>S.log(s)});pyo.setStderr({batched:s=>S.log(s,"err")});
  let err=null;
  try{pyo.globals.get("_run")($("code").value,fresh)}catch(e){err=e}
  const msg=err?String(err.message||err):"";
  if(err&&!msg.includes("SIM_DONE")){
    if(msg.includes("SIM_TIME")){S.log("⏱ The simulator stopped the program after "+T.maxT+" s of robot time. (Loops that never end are normal for robot programs.)","sys");S.timedOut=true}
    else{const m=msg.trim().split("\n"),last=m[m.length-1];const ln=[...msg.matchAll(/File "<student>", line (\d+)/g)].pop();
      S.error=(ln?"Line "+ln[1]+": ":"")+last;S.ev("error","Error in your code");S.log("❌ "+S.error,"err")}
  }else if(err)S.log(S.doneReason?"Finished: "+S.doneReason:"The run ended.","sys");
  else S.log("Program finished.","sys");
  const last=S.frames[S.frames.length-1];P.end=last.t;$("scrub").max=Math.round(last.t*100);$("playBtn").disabled=false;$("copyBtn").disabled=false;
  renderChecks(false);P.t=startT;P.logShown=-1;AUD.unlock();P.playing=true;
}
/* ---------- live drive ---------- */
function startLive(){
  if(P.live)return;
  if(!S||S.finished||P.t<P.end){hardReset()}
  P.live=true;P.playing=false;liveAcc=0;$("liveBtn").classList.add("on");$("liveBtn").textContent="■ Stop live drive";$("liveTag").innerHTML='<span class="pill-live">LIVE</span>';AUD.unlock();
  $("livePanel").style.display="block";
}
function stopLive(){
  if(!P.live)return;P.live=false;$("liveBtn").classList.remove("on");$("liveBtn").textContent="🎮 Live drive";$("liveTag").innerHTML="";
  if(S){S.setVel(0,0,0);P.end=S.t;$("scrub").max=Math.round(S.t*100);if(S.t>0){$("playBtn").disabled=false;$("copyBtn").disabled=false;renderChecks(true,false)}}
}
function liveStep(dtReal){
  liveAcc+=Math.min(dtReal,0.1);
  const sp=Number($("liveSpeed").value);
  while(liveAcc>=DT){
    liveAcc-=DT;if(S.finished){stopLive();break}
    const vx=((keys.w||keys.ArrowUp?1:0)-(keys.s||keys.ArrowDown?1:0))*sp*S.cfg.mmps;
    let vy=0,wz=((keys.e?1:0)-(keys.q?1:0))*sp*S.cfg.degps;
    const lr=((keys.d||keys.ArrowRight?1:0)-(keys.a||keys.ArrowLeft?1:0));
    if(S.cfg.mecanum)vy=lr*sp*S.cfg.mmps;else wz+=lr*sp*S.cfg.degps;
    S.cmd.vx=vx;S.cmd.vy=vy;S.cmd.wz=wz;
    if(T.live)T.live(S,keys);
    try{S.tick()}catch(e){if(!String(e.message).includes("SIM_")){console.error(e)}S.finished=true}
  }
  P.t=S.t;P.end=S.t;$("scrub").max=Math.round(S.t*100);
}
/* ---------- UI ---------- */
function syncGutter(){const n=$("code").value.split("\n").length;let s="";for(let i=1;i<=n;i++)s+=i+"\n";$("gutter").textContent=s;$("gutter").scrollTop=$("code").scrollTop}
U.syncGutter=syncGutter;
function setExample(k){
  const ex=T.examples[k];if(!ex)return;
  $("code").value=ex.code;syncGutter();
  if(ex.opts)for(const [id,v] of Object.entries(ex.opts)){const el=$("opt_"+id);if(!el)continue;if(el.type==="checkbox")el.checked=v;else el.value=v}
  hardReset();
}
function buildUI(){
  cv().height=Math.round(cv().width*T.cfg.world.h/T.cfg.world.w);
  document.title="Virtual UGOT · Topic "+T.id+" "+T.name;
  $("title").textContent=T.emoji+" Virtual UGOT: Topic "+T.id+" "+T.name;
  $("tagline").innerHTML=T.tagline;
  $("brief").innerHTML=T.brief;
  $("links").innerHTML=`<a href="lessons/topic-${T.id}.html">Criterion B</a> · <a href="lessons/criteria-c-${T.id}.html">Criterion C</a>`;
  // controls
  const box=$("controls");box.innerHTML="";
  for(const c of (T.controls||[])){
    const l=document.createElement("label");l.className="note";
    if(c.type==="select"){l.innerHTML=esc(c.label)+' <select id="opt_'+c.id+'">'+c.options.map(o=>`<option value="${esc(o[0])}"${o[0]===c.def?" selected":""}>${esc(o[1])}</option>`).join("")+"</select>"}
    else if(c.type==="check"){l.innerHTML=`<input type="checkbox" id="opt_${c.id}"${c.def?" checked":""}> ${esc(c.label)}`}
    else if(c.type==="range"){l.innerHTML=esc(c.label)+` <input type="range" id="opt_${c.id}" min="${c.min}" max="${c.max}" step="${c.step||1}" value="${c.def}" style="width:120px"> <b id="optv_${c.id}">${c.def}${c.unit||""}</b>`}
    box.appendChild(l);
    const el=l.querySelector("select,input");el.onchange=hardReset;
    if(c.type==="range")el.oninput=()=>{$("optv_"+c.id).textContent=el.value+(c.unit||"");};
  }
  // examples
  $("example").innerHTML=Object.entries(T.examples).map(([k,v])=>`<option value="${k}">${esc(v.label)}</option>`).join("");
  $("example").onchange=()=>setExample($("example").value);
  // api table
  $("apiTable").innerHTML='<tr><th>Function</th><th>What it does</th></tr>'+T.api.filter(a=>!a.hide).map(a=>`<tr><td>${esc(a.n)}(${esc(a.a)})</td><td>${esc(a.d)}</td></tr>`).join("")+'<tr><td>sleep(seconds), time()</td><td>Robot time, not your laptop\'s time.</td></tr><tr><td>median(list), mean(list), most_common(list)</td><td>Helpers for filtering sensor readings.</td></tr>';
  // buttons
  const bb=$("liveButtons");bb.innerHTML="";
  for(const b of (T.buttons||[])){const x=document.createElement("button");x.className="btn alt sm";x.textContent=b.label;x.onclick=()=>{AUD.click();if(!P.live&&!(S.t===0))return;if(!P.live)startLive();b.fn(S)};bb.appendChild(x)}
  $("inset").parentElement.style.display=T.inset?"":"none";
  $("chart").parentElement.style.display=T.chart?"":"none";
  if(!T.inset&&T.chart)$("chart").parentElement.style.gridColumn="1/-1";
  $("insetTitle").textContent=T.insetTitle||"Close-up";
  $("keyhelp").innerHTML=T.cfg.mecanum?'<span class="kbd">W</span><span class="kbd">S</span> drive · <span class="kbd">A</span><span class="kbd">D</span> slide · <span class="kbd">Q</span><span class="kbd">E</span> turn':'<span class="kbd">W</span><span class="kbd">S</span> drive · <span class="kbd">A</span><span class="kbd">D</span> turn';
}
function worldPos(ev){const c=cv(),r=c.getBoundingClientRect();return[(ev.clientX-r.left)/r.width*T.cfg.world.w,(ev.clientY-r.top)/r.height*T.cfg.world.h]}
function bindEvents(){
  $("runBtn").onclick=()=>runProgram(true);
  $("replBtn").onclick=()=>runProgram(false);
  $("resetBtn").onclick=hardReset;
  $("liveBtn").onclick=()=>{AUD.click();P.live?stopLive():startLive()};
  $("playBtn").onclick=()=>{if(P.live)return;if(P.t>=P.end)P.t=0,P.logShown=-1,P.done=false;P.playing=!P.playing};
  $("speedSel").onchange=()=>P.speed=Number($("speedSel").value);
  $("scrub").oninput=()=>{AUD.click();if(P.live)stopLive();P.t=Number($("scrub").value)/100;P.playing=false;P.logShown=-1;P.done=P.t>=P.end-0.001;if(P.done&&S.t>0)renderChecks(true)};
  $("soundBtn").onclick=()=>{AUD.click();AUD.toggle();syncSoundBtn()};
  $("vol").oninput=()=>{AUD.click();AUD.setVol(Number($("vol").value))};
  $("copyBtn").onclick=()=>{
    const r=T.checks(S),txt="Virtual UGOT test (Topic "+T.id+" "+T.name+", "+(S.opts.scenario||"")+", "+new Date().toLocaleString()+")\n"+r.map(x=>(x.ok?"PASS ":"FAIL ")+x.t+" - "+x.d).join("\n")+"\n\nCode tested:\n"+$("code").value;
    const done=()=>{$("copyStatus").textContent="Copied. Paste it into your C3 log and say it came from the simulator."};
    const fb=()=>{$("code").select();$("copyStatus").textContent="Copy blocked: select and copy manually."};
    try{navigator.clipboard.writeText(txt).then(done,fb)}catch(e){fb()}
  };
  $("code").addEventListener("input",syncGutter);$("code").addEventListener("scroll",()=>{$("gutter").scrollTop=$("code").scrollTop});
  $("code").addEventListener("keydown",e=>{
    if(e.key==="Tab"){e.preventDefault();const t=e.target,a=t.selectionStart;t.value=t.value.slice(0,a)+"    "+t.value.slice(t.selectionEnd);t.selectionStart=t.selectionEnd=a+4;syncGutter()}
    if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();runProgram(true)}});
  window.addEventListener("keydown",e=>{
    if(!P.live)return;const tg=e.target.tagName;if(tg==="TEXTAREA"||tg==="INPUT"||tg==="SELECT")return;
    const k=e.key.length===1?e.key.toLowerCase():e.key;keys[k]=true;if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(e.key))e.preventDefault()});
  window.addEventListener("keyup",e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;delete keys[k]});
  // touch pad
  document.querySelectorAll("#pad button").forEach(b=>{const k=b.dataset.k;
    const dn=e=>{e.preventDefault();if(!P.live)startLive();keys[k]=true;b.classList.add("dn")},up=e=>{delete keys[k];b.classList.remove("dn")};
    b.addEventListener("pointerdown",dn);b.addEventListener("pointerup",up);b.addEventListener("pointerleave",up);b.addEventListener("pointercancel",up)});
  // drag
  let drag=null;const c=cv();
  c.addEventListener("pointerdown",ev=>{
    if(!T.drag||P.playing)return;const [x,y]=worldPos(ev);const list=T.drag(S);
    let best=null,bd=1e9;for(const o of list){const d=Math.hypot(o.x-x,o.y-y);if(d<(o.r||120)+40&&d<bd){bd=d;best=o}}
    if(best){drag=best;c.setPointerCapture(ev.pointerId);c.style.cursor="grabbing"}});
  c.addEventListener("pointermove",ev=>{
    const [x,y]=worldPos(ev);
    if(!drag){c.style.cursor=(T.drag&&!P.playing&&T.drag(S).some(o=>Math.hypot(o.x-x,o.y-y)<(o.r||120)+40))?"grab":"default";return}
    const w=T.cfg.world,nx=clamp(x,50,w.w-50),ny=clamp(y,50,w.h-50);
    if(P.live){if(T.setPos)T.setPos(S,drag.id,nx,ny)}
    else{posOverride[drag.id]=[nx,ny];S=newSim();S.seed=seedBase;P.t=0;P.end=0;draw()}});
  c.addEventListener("pointerup",()=>{drag=null;c.style.cursor="default"});
}
function syncSoundBtn(){const o=AUD.isOn();$("soundBtn").textContent=o?"🔊 Sound on":"🔇 Sound off";$("soundBtn").setAttribute("aria-pressed",o)}
function loop(ts){
  const dtReal=(ts-P.last)/1000;const pt=P.t;
  if(S){
    if(P.live){liveStep(dtReal)}
    else if(P.playing){P.t+=Math.min(0.1,dtReal)*P.speed;if(P.t>=P.end){P.t=P.end;P.playing=false;if(!P.done){P.done=true;renderChecks(true,true)}}}
    AUD.step(pt,P.t);draw();
  }
  P.last=ts;requestAnimationFrame(loop);
}
U.mount=function(id){
  T=U.topics[id];if(!T){document.body.innerHTML="<p style='padding:24px'>Unknown topic.</p>";return}
  T.apiMap={};
  T.api=[...T.api,...U.apiTime()];
  for(const a of T.api)T.apiMap[a.n]=a;
  buildUI();bindEvents();syncSoundBtn();
  const first=Object.keys(T.examples)[0];$("example").value=first;
  $("code").value=T.examples[first].code;syncGutter();
  if(T.examples[first].opts)for(const [k,v] of Object.entries(T.examples[first].opts)){const el=$("opt_"+k);if(el){if(el.type==="checkbox")el.checked=v;else el.value=v}}
  hardReset();
  $("pystatus").textContent="Loading Python…";$("runBtn").disabled=true;$("replBtn").disabled=true;
  U.loadPyodideOnce(pyo=>{
    pyo.registerJsModule("ugot_js",{c:callApi});
    pyo.globals.set("PRELUDE",buildPrelude());pyo.runPython(RUNNER);
    $("pystatus").textContent="Python ready";$("runBtn").disabled=false;$("replBtn").disabled=false;
  },e=>{$("pystatus").textContent="Could not load Python. Check your internet connection and reload."});
  requestAnimationFrame(loop);
};
U._state=()=>({S,P,T});
})();
