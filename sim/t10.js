(function(){
const U=UGOT,clamp=U.clamp,num=U.num;
const SEQ=["bottle","cup","bottle","vase","phone","bottle","book","vase","bottle","cup","bottle","vase"];
const SLOT=3.6,PRES=3.0,T0=0.4,DELAY=0.4;
const TRUE_CONF={bottle:{20:0.95,35:0.9,50:0.72},cup:0.9,phone:0.92,book:0.9};
function objAt(t){const k=Math.floor((t-T0)/SLOT);if(k<0||k>=SEQ.length)return null;const o=(t-T0)-k*SLOT;return o>PRES?null:{k,o}}
function cand(s,k){const n=SEQ[k],d=Number(s.opts.dist);
  if(n==="bottle")return[["bottle",TRUE_CONF.bottle[d]],["vase",0.12],["cup",0.05]];
  if(n==="vase")return[["bottle",0.62],["cup",0.2],["vase",0.1]];
  return[[n,TRUE_CONF[n]],["bottle",0.08],["cup",0.05]]}
U.register({
  id:"10",name:"Smart Recognition",emoji:"🔍",maxT:50,
  tagline:"Your Scanner-Arch: the camera recognises one trained object and shows a tick or a cross.",
  brief:`<p>The <strong>Scanner-Arch</strong> design (B1 7.1) checks objects one at a time under a camera arch. Only a <strong>bottle</strong> may get a green tick. Everything else, including a <strong>vase that looks like a bottle</strong>, must get a cross.</p>
  <ol><li><code>recognised("bottle")</code> says yes at a low confidence. <code>best_match()</code> gives the name <em>and</em> the confidence so you can set <code>MIN_CONFIDENCE</code>.</li><li>The camera needs about 0.4 s to think after an object appears.</li><li>Show the result on the display (<code>show</code>) as well as by colour so a classmate can read it from 2 m (B1 7.2).</li></ol>`,
  cfg:{world:{w:1800,h:1200},rad:100,mmps:5,degps:3},
  controls:[
    {id:"dist",type:"select",label:"Object distance",def:"35",options:[["20","20 cm"],["35","35 cm"],["50","50 cm (weak)"]]},
    {id:"noise",type:"check",label:"Confidence noise (±0.05)",def:true}],
  init(s){s.x=-500;s.y=-500;s.h=0;s.st={led:null,text:null,calls:0,showCalls:0,res:SEQ.map((n,k)=>({n,k,end:null,acc:null,txt:null,firstAcc:null,seen:false})),lastConf:null,bm:null,done:false,usedShow:false}},
  step(s){const st=s.st,o=objAt(s.t);
    SEQ.forEach((n,k)=>{const r=st.res[k],ap=T0+k*SLOT;
      if(!r.seen&&s.t>=ap){r.seen=true;}
      if(s.t>=ap&&s.t<ap+PRES){const acc=(st.led==="green"||st.text==="TICK");if(acc&&r.firstAcc===null)r.firstAcc=s.t-ap}
      if(r.end===null&&s.t>=ap+PRES-0.05){r.end=s.t;r.acc=(st.led==="green"||st.text==="TICK");r.txt=st.text;
        const truth=n==="bottle";if(r.acc===truth){s.ev(truth?"good":"click")}else{s.ev("bad");s.log("Object "+(k+1)+" ("+n+") was "+(r.acc?"accepted":"rejected")+": wrong.","err")}}});
    if(!st.done&&s.t>=T0+SEQ.length*SLOT)st.done=true},
  done(s){if(s.st.done)return"All "+SEQ.length+" objects have been checked."},
  snap(s){const st=s.st,o=objAt(s.t);return{obj:o?[o.k,SEQ[o.k],o.o]:null,led:st.led,text:st.text,cand:o&&o.o>=DELAY?cand(s,o.k):null,conf:st.confT===s.t?st.conf:undefined,res:st.res.map(r=>r.end===null?null:[r.acc,r.n==="bottle"]),ok:st.res.filter(r=>r.end!==null&&r.acc===(r.n==="bottle")).length,fin:st.res.filter(r=>r.end!==null).length}},
  chart:{series:[{label:"best_match() confidence",get:s=>(s.t-(s.st.confT||-9)<0.06&&s.st.conf!==undefined)?s.st.conf:null}],ymin:0,ymax:1,unit:"",lines:[[0.8,"MIN_CONFIDENCE 0.8"]]},
  api:[{n:"switch_to_object_recognition",a:"",d:"Turn on the camera's object recognition mode.",f:s=>{s.st.mode=true}},
    {n:"best_match",a:"",d:"The most likely object as a tuple (name, confidence). Confidence is 0 to 1. Returns (\"none\", 0.0) when nothing is under the camera or while it is still thinking (0.4 s). Each call takes 50 ms.",tuple:true,
     f:s=>{s.tick();const st=s.st,o=objAt(s.t);let r=["none",0];
       if(o&&o.o>=DELAY){const c=cand(s,o.k)[0];r=[c[0],Math.round(clamp(c[1]+(s.opts.noise===false?0:(s.rnd()*2-1)*0.05),0,1)*100)/100]}
       st.confT=s.t;st.conf=r[1];st.calls++;return r}},
    {n:"recognised",a:"name",d:"True if the camera thinks the object is this name with confidence of at least 0.5 (a loose limit). Each call takes 50 ms.",
     f:(s,n)=>{s.tick();const st=s.st,o=objAt(s.t);st.calls++;if(!o||o.o<DELAY)return false;const c=cand(s,o.k)[0],cf=c[1]+(s.opts.noise===false?0:(s.rnd()*2-1)*0.05);st.confT=s.t;st.conf=Math.round(cf*100)/100;return c[0]===String(n)&&cf>=0.5}},
    {n:"show",a:"text",d:"Show big text on the main controller display, e.g. \"TICK\" or \"CROSS\".",f:(s,t)=>{s.st.text=String(t);s.st.usedShow=true}},
    {n:"light",a:"colour",d:"Set the controller light: \"green\" or \"red\".",f:(s,c)=>{s.st.led=String(c)}}],
  hud(f,s){return[["Robot time",f.t.toFixed(1)+" s"],["Object",f.obj?(f.obj[0]+1)+" of "+SEQ.length:"–"],["Display",f.text||"–"],["Light",f.led||"off"],["Correct",f.ok+" of "+f.fin]]},
  insetTitle:"What the camera thinks",
  inset(ix,f,w,h){
    ix.fillStyle="#1c2a38";ix.fillRect(0,0,w,h);ix.font="14px system-ui";
    if(!f.obj){ix.fillStyle="#9bb0c4";ix.fillText("no object under the camera",20,40);return}
    if(!f.cand){ix.fillStyle="#9bb0c4";ix.fillText("thinking… (0.4 s)",20,40);return}
    f.cand.forEach((c,i)=>{const y=40+i*80;ix.fillStyle="#fff";ix.fillText(c[0],20,y);ix.fillStyle="#35506b";ix.fillRect(110,y-16,w-140,26);ix.fillStyle=c[1]>=0.8?"#4fcf84":(c[1]>=0.5?"#f0b64a":"#7fa3c7");ix.fillRect(110,y-16,(w-140)*c[1],26);ix.fillStyle="#fff";ix.fillText(c[1].toFixed(2),w-60,y+3)});
    const x=110+(w-140)*0.8;ix.strokeStyle="#ff8a4c";ix.setLineDash([5,5]);ix.beginPath();ix.moveTo(x,14);ix.lineTo(x,h-30);ix.stroke();ix.setLineDash([]);ix.fillStyle="#ff8a4c";ix.fillText("0.8",x-10,h-12);
  },
  draw(ctx,f,H,s){
    const W=1800,Hh=1200;ctx.fillStyle=H.css("--floor");ctx.fillRect(0,0,W,Hh);
    // arch
    ctx.strokeStyle="#3a4756";ctx.lineWidth=40;ctx.beginPath();ctx.moveTo(250,1000);ctx.lineTo(250,300);ctx.lineTo(950,300);ctx.lineTo(950,1000);ctx.stroke();ctx.fillStyle="#222d38";ctx.fillRect(560,300,120,110);ctx.fillStyle="#1fb6e5";ctx.beginPath();ctx.arc(620,410,16,0,7);ctx.fill();
    ctx.fillStyle="#3a4756";ctx.fillRect(150,960,900,50);
    if(f.obj){const k=f.obj[0],n=f.obj[1],x=600,y=900;ctx.fillStyle="rgba(31,182,229,.18)";ctx.beginPath();ctx.moveTo(600,425);ctx.lineTo(470,960);ctx.lineTo(730,960);ctx.fill();
      ctx.save();ctx.translate(x,y);ctx.lineWidth=6;ctx.strokeStyle="#111";
      if(n==="bottle"){ctx.fillStyle="#3aa0d6";ctx.beginPath();ctx.roundRect(-45,-170,90,200,16);ctx.fill();ctx.stroke();ctx.fillRect(-18,-230,36,60);ctx.strokeRect(-18,-230,36,60);ctx.fillStyle="#fff";ctx.fillRect(-45,-90,90,50)}
      else if(n==="vase"){ctx.fillStyle="#b86a3a";ctx.beginPath();ctx.moveTo(-26,-200);ctx.quadraticCurveTo(-110,-40,-50,30);ctx.lineTo(50,30);ctx.quadraticCurveTo(110,-40,26,-200);ctx.closePath();ctx.fill();ctx.stroke()}
      else if(n==="cup"){ctx.fillStyle="#e9eef4";ctx.beginPath();ctx.moveTo(-60,-120);ctx.lineTo(60,-120);ctx.lineTo(45,30);ctx.lineTo(-45,30);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(68,-70,32,-1.2,1.2);ctx.stroke()}
      else if(n==="phone"){ctx.fillStyle="#222";ctx.beginPath();ctx.roundRect(-40,-190,80,220,12);ctx.fill();ctx.fillStyle="#6db3e8";ctx.fillRect(-32,-175,64,175)}
      else{ctx.fillStyle="#8a3a3a";ctx.fillRect(-90,-70,180,100);ctx.strokeRect(-90,-70,180,100);ctx.fillStyle="#fff";ctx.fillRect(-80,-20,160,12)}
      ctx.restore();H.text(n,x,1060,22,H.css("--ink"),"center")}
    // display
    const dx=1180,dy=240;ctx.fillStyle="#0b1824";ctx.beginPath();ctx.roundRect(dx,dy,520,300,24);ctx.fill();ctx.strokeStyle="#3a4756";ctx.lineWidth=8;ctx.stroke();
    if(f.text){H.text(f.text,dx+260,dy+185,90,f.text==="TICK"?"#4fcf84":"#ff7a6b","center")}else H.text("display off",dx+260,dy+160,26,"#6a7885","center");
    H.text("main controller display",dx+260,dy+340,18,H.css("--muted"),"center");
    const col={green:"#2ea05a",red:"#e04a3a"}[f.led]||"#556";ctx.fillStyle=col;ctx.globalAlpha=f.led?0.35:0;ctx.beginPath();ctx.arc(dx+260,dy+470,110,0,7);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle=col;ctx.beginPath();ctx.arc(dx+260,dy+470,50,0,7);ctx.fill();H.text("light",dx+260,dy+570,18,H.css("--muted"),"center");
    // results strip
    for(let i=0;i<SEQ.length;i++){const r=f.res[i],x=1180+i*44,y=800;ctx.fillStyle=r===null?"rgba(120,140,160,.35)":((r[0]===r[1])?"#2ea05a":"#c4372a");ctx.beginPath();ctx.arc(x+20,y,17,0,7);ctx.fill();H.text(SEQ[i][0].toUpperCase(),x+20,y+6,13,"#fff","center")}
    H.text("Result of each object (green = correct)",1180,860,16,H.css("--muted"));
  },
  checks(s){
    const st=s.st,out=[];const bot=st.res.filter(r=>r.n==="bottle"&&r.end!==null),oth=st.res.filter(r=>r.n!=="bottle"&&r.end!==null);
    const ba=bot.filter(r=>r.acc).length;
    out.push({t:"T1 Recognition",b:"B1 7.1",ok:bot.length>0&&ba/bot.length>=0.8,d:bot.length===0?"No bottle has been checked yet.":"Bottle accepted "+ba+" of "+bot.length+" times ("+Math.round(ba/bot.length*100)+"%, need 80% at 35 cm)."});
    const wa=oth.filter(r=>r.acc);
    out.push({t:"T2 False accept",b:"B1 7.1",ok:oth.length>0&&wa.length===0,d:oth.length===0?"No other object has been checked yet.":(wa.length===0?"0 wrong ticks on "+oth.length+" other objects.":wa.length+" wrong tick(s): "+[...new Set(wa.map(r=>r.n))].join(", ")+" was accepted as a bottle (must be 0).")});
    const ts=bot.filter(r=>r.firstAcc!==null).map(r=>r.firstAcc).sort((a,b)=>a-b),med=ts.length?ts[Math.floor(ts.length/2)]:null;
    out.push({t:"T3 Speed",b:"B1 7.1",ok:med!==null&&med<1,d:med===null?"The result never appeared for a bottle.":"Median time from showing the bottle to the tick: "+med.toFixed(2)+" s (target under 1 s)."});
    const wrong=st.res.filter(r=>r.end!==null&&(r.txt!==(r.n==="bottle"?"TICK":"CROSS")));
    out.push({t:"T4 Visible result",b:"B1 7.2",ok:st.usedShow&&st.res.some(r=>r.end!==null)&&wrong.length===0,d:!st.usedShow?"Only the light shows the result. Use show() so it can be read from 2 m without relying on colour.":(wrong.length===0?"The display text was correct for every object.":"The display text was wrong for "+wrong.length+" object(s).")});
    return out},
  tests:[1,2,3,4],
  examples:{
    v1:{label:"scan_v1.py (Criterion C, Lesson 4)",code:`switch_to_object_recognition()
while True:
    if recognised("bottle"):
        light("green")
    else:
        light("red")
`},
    v2:{label:"scan_v2.py (Criterion C, Lesson 5)",code:`MIN_CONFIDENCE = 0.8
switch_to_object_recognition()
while True:
    name, conf = best_match()
    if name == "bottle" and conf >= MIN_CONFIDENCE:
        show("TICK"); light("green")
    else:
        show("CROSS"); light("red")
    sleep(0.3)
`},
    far:{label:"Experiment: bottle at 50 cm (does it still pass?)",code:`MIN_CONFIDENCE = 0.6
switch_to_object_recognition()
while True:
    name, conf = best_match()
    print(name, conf)
    if name == "bottle" and conf >= MIN_CONFIDENCE:
        show("TICK"); light("green")
    else:
        show("CROSS"); light("red")
    sleep(0.3)
`,opts:{dist:"50"}}
  }
});
})();
