(function(){
const U=UGOT,clamp=U.clamp,num=U.num,normA=U.normA,rad=U.rad,deg=U.deg;
const sector=rel=>{const r=normA(rel);return Math.abs(r)<=45?"front":(Math.abs(r)>=135?"behind":(r>0?"right":"left"))};
const drv=U.apiDrive();
U.register({
  id:"03",name:"Finding People by Sound",emoji:"👂",maxT:45,
  tagline:"Your Echo-Ring: the microphones tell you which side a clap came from, and how loud it is.",
  brief:`<p>After a collapse, a trapped person can only <strong>call out or clap</strong>. Your <strong>Echo-Ring</strong> design uses the main controller microphones (B1 7.1) to find which side the sound comes from, turn towards it, drive closer and stop about <strong>0.5 m</strong> away, then speak.</p>
  <ol><li><code>sound_direction()</code> returns front, behind, left or right.</li><li><code>loudness_db()</code> gets louder (closer to 0 dB) as you get nearer (B1 7.2).</li><li>Stop when the level reaches <code>STOP_DB</code> and say "I am here".</li></ol>`,
  cfg:{world:{w:3600,h:2400},rad:100,mmps:5,degps:3},
  controls:[
    {id:"side",type:"select",label:"Person is",def:"front",options:[["front","In front"],["behind","Behind"],["left","On the left"],["right","On the right"]]},
    {id:"mode",type:"select",label:"Sound",def:"cont",options:[["cont","Calling out every 0.4 s"],["slow","One clap every 1.5 s (hard)"]]},
    {id:"noise",type:"check",label:"Microphone noise (±1 dB, 6% wrong sector)",def:true}],
  init(s){const p=s.opts.pos||{};s.x=1800;s.y=1200;s.h=0;
    const D={front:[2800,1200],behind:[800,1200],left:[1800,200],right:[1800,2200]}[s.opts.side]||[2800,1200];
    s.src=p.src?{x:p.src[0],y:p.src[1]}:{x:D[0],y:D[1]};
    s.st={heard:null,heardT:-9,reads:0,dirOK:0,dirN:0,llog:[],firstMove:null,wasMoving:false,nextClap:0.1,spoke:false,clapAt:-9};
  },
  blocked(s,x,y){return Math.hypot(x-s.src.x,y-s.src.y)<170?"person":null},
  step(s){
    const st=s.st;
    if(s.t>=st.nextClap){st.nextClap=s.t+(s.opts.mode==="slow"?1.5:0.4);
      const rel=deg(Math.atan2(s.src.y-s.y,s.src.x-s.x))-s.h;let sec=sector(rel);const truth=sec;
      if(s.opts.noise!==false&&s.rnd()<0.06){const all=["front","right","behind","left"];sec=all[(all.indexOf(sec)+(s.rnd()<0.5?1:3))%4]}
      st.heard=sec;st.truth=truth;st.heardT=s.t;st.clapAt=s.t;s.ev("clap")}
    const mv=Math.hypot(s.cmd.vx,s.cmd.vy)+Math.abs(s.cmd.wz)>0;
    if(mv&&st.firstMove===null)st.firstMove=s.t;
    if(mv)st.wasMoving=true;
  },
  snap(s){return{src:[s.src.x,s.src.y],heard:s.st.heard,clap:s.t-s.st.clapAt<0.5?(s.t-s.st.clapAt):null,lvl:s.lvl,lvlT:s.lvlT||-9,sv:null,spoke:s.st.spoke}},
  chart:{series:[{label:"loudness_db()",get:s=>(s.t-(s.lvlT||-9)<0.06&&s.lvl!==undefined)?s.lvl:null}],ymin:-60,ymax:0,unit:"dB",line:[-25,"STOP_DB −25"]},
  drag:s=>[{id:"src",x:s.src.x,y:s.src.y,r:160}],
  api:[...drv,
    {n:"sound_localisation",a:"on=True",d:"Switch the microphone array on, so sound_direction() works.",f:(s,on)=>{s.st.on=on!==false}},
    {n:"sound_direction",a:"",d:"Which side the last sound came from: \"front\", \"behind\", \"left\" or \"right\". Each reading takes 50 ms. The robot's own turning makes the answer a little old.",
     f:s=>{s.tick();s.st.reads++;const h=s.st.heard;if(h&&s.st.truth){s.st.dirN++;if(h===s.st.truth)s.st.dirOK++}return h}},
    {n:"loudness_db",a:"",d:"Loudness of the sound in dB, from -90 (silent) to 0 (very loud). About -25 dB at 0.5 m; it drops 6 dB each time the distance doubles.",
     f:s=>{s.tick();const d=Math.max(Math.hypot(s.src.x-s.x,s.src.y-s.y),60)/1000;let l=-25-20*Math.log10(d/0.5);if(s.opts.noise!==false)l+=(s.rnd()*2-1);l=clamp(Math.round(l*10)/10,-90,0);
       s.lvl=l;s.lvlT=s.t;s.st.llog.push([d*1000,l]);return l}},
    {n:"speak_until_done",a:"text",d:"Say the text through the robot speaker and wait until it has finished.",
     f:(s,t)=>{s.st.spoke=true;s.ev("note","",{f:660});s.ev("say",String(t));s.log("🔊 \""+t+"\"","sys");s.runFor(2)}}],
  hud(f,s){const d=Math.hypot(f.src[0]-f.x,f.src[1]-f.y);return[["Robot time",f.t.toFixed(1)+" s"],["Heard from",f.heard||"–"],["Loudness",f.lvl===undefined?"–":f.lvl+" dB"],["Distance",(d/1000).toFixed(2)+" m"],["Heading",Math.round(f.h)+"°"]]},
  draw(ctx,f,H,s){
    const W=3600,Hh=2400;ctx.fillStyle=H.css("--floor");ctx.fillRect(0,0,W,Hh);H.grid(W,Hh,300);H.border(W,Hh);
    ctx.fillStyle="rgba(46,160,90,.14)";ctx.beginPath();ctx.arc(f.src[0],f.src[1],500,0,7);ctx.fill();ctx.strokeStyle="#1b8a4b";ctx.setLineDash([20,16]);ctx.lineWidth=5;ctx.stroke();ctx.setLineDash([]);
    H.text("0.5 m stop ring",f.src[0]-190,f.src[1]-520,15,"#1b8a4b");
    ctx.save();ctx.translate(f.x,f.y);ctx.rotate(rad(f.h));ctx.strokeStyle="rgba(120,140,160,.5)";ctx.lineWidth=4;ctx.setLineDash([14,14]);[45,135,-45,-135].forEach(a=>{ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(rad(a))*420,Math.sin(rad(a))*420);ctx.stroke()});ctx.setLineDash([]);
    ctx.fillStyle=H.css("--muted");ctx.font=(13/(ctx.getTransform().a))+"px system-ui";ctx.textAlign="center";ctx.fillText("FRONT",360,0);ctx.fillText("BEHIND",-360,0);ctx.fillText("RIGHT",0,360);ctx.fillText("LEFT",0,-360);ctx.restore();
    if(f.clap!==null){for(let k=0;k<3;k++){const r=(f.clap+k*0.15)*1400;ctx.strokeStyle="rgba(242,106,33,"+Math.max(0,.6-f.clap*1.1-k*.1)+")";ctx.lineWidth=8;ctx.beginPath();ctx.arc(f.src[0],f.src[1],r,0,7);ctx.stroke()}}
    ctx.fillStyle="#e8b04b";ctx.beginPath();ctx.arc(f.src[0],f.src[1],72,0,7);ctx.fill();ctx.fillStyle="#2e5f9a";ctx.beginPath();ctx.arc(f.src[0],f.src[1]-90,34,0,7);ctx.fill();
    H.text("PERSON",f.src[0],f.src[1]+130,16,H.css("--ink"),"center");
    if(f.spoke)H.text("“I am here. Say help.”",f.x,f.y-150,18,"#1b8a4b","center");
    H.robot(f.x,f.y,f.h,{led:f.v[0]||f.v[2]?"#2ea05a":"#5a6b7d"});
    if(f.heard)H.text("heard: "+f.heard,f.x,f.y+150,17,"#f26a21","center");
  },
  checks(s){
    const st=s.st,out=[];
    const acc=st.dirN?st.dirOK/st.dirN:null;
    out.push({t:"T1 Direction",b:"B1 7.1",ok:st.reads>0&&acc!==null&&acc>=0.8,d:st.reads===0?"Your program never called sound_direction().":"Correct side on "+st.dirOK+" of "+st.dirN+" readings ("+Math.round(acc*100)+"%, need 80%)."});
    const L=st.llog;let viol=0,pairs=0;for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){if(Math.abs(L[i][0]-L[j][0])>200){pairs++;const near=L[i][0]<L[j][0]?L[i]:L[j],far=L[i][0]<L[j][0]?L[j]:L[i];if(near[1]<=far[1])viol++}}
    out.push({t:"T2 Loudness",b:"B1 7.2",ok:pairs>=1&&viol===0,d:L.length<2?"Read loudness_db() while the distance changes to test this.":(pairs===0?"Not enough change in distance between readings.":(viol===0?"Louder when nearer in all "+pairs+" comparisons.":viol+" of "+pairs+" comparisons were not louder when nearer."))});
    const d=Math.hypot(s.src.x-s.x,s.src.y-s.y),still=Math.hypot(s.cmd.vx,s.cmd.vy)+Math.abs(s.cmd.wz)===0;
    out.push({t:"T3 Stop distance",b:"B1 7.1",ok:still&&st.wasMoving&&(st.spoke||(s.lvl!==undefined&&s.lvl>=-26))&&d<=600&&s.crashes===0&&d>=250,d:!st.wasMoving?"The robot never moved.":(!still?"The robot never stopped.":"Stopped "+(d/1000).toFixed(2)+" m from the person (target within 0.5 m, with a little margin)."+(s.crashes?" It bumped the person.":""))});
    out.push({t:"T4 Response time",b:"B1 7.1",ok:st.firstMove!==null&&st.firstMove<2,d:st.firstMove===null?"The robot never started to move.":"Started turning "+st.firstMove.toFixed(1)+" s after the first clap (target under 2 s)."});
    return out},
  done(s){if(s.st.spoke)return"The robot spoke to the person."},
  tests:[1,2,3,4],
  examples:{
    v1:{label:"turn_v1.py (Criterion C, Lesson 4)",code:`sound_localisation(True)
while True:
    side = sound_direction()   # "front", "behind", "left", "right"
    if side == "left":
        turn_left(30)
    elif side == "right":
        turn_right(30)
`},
    v2:{label:"find_v2.py (Criterion C, Lesson 5)",code:`STOP_DB = -25
sound_localisation(True)
while True:
    side = sound_direction()
    level = loudness_db()           # -90 to 0 dB
    if level >= STOP_DB:
        stop()
        speak_until_done("I am here. Say help.")
        break
    elif side == "front":  drive_forward(25)
    elif side == "behind": drive_backward(25)
    elif side == "left":   turn_left(25)
    elif side == "right":  turn_right(25)
`},
    log:{label:"Experiment: loudness against distance",code:`# Drive towards the person and print the loudness every 0.5 s.
sound_localisation(True)
drive_forward(20)
for i in range(8):
    print(round(loudness_db(), 1), "dB")
    sleep(0.5)
stop()
`,opts:{side:"front"}}
  }
});
})();
