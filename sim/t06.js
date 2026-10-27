(function(){
const U=UGOT,clamp=U.clamp,num=U.num,normA=U.normA,rad=U.rad,deg=U.deg;
const RX=1500,RY=1100,FOV=50,NOTE={C:523,D:587,E:659,F:698,G:784,A:880,B:988};
const WHERE={front:0,right:80,left:-70};
U.register({
  id:"06",name:"Observant Eyes",emoji:"👁️",maxT:30,
  tagline:"Your Gimbal-Eye: a camera on a pan/tilt arm that sweeps a room to find one registered face.",
  brief:`<p>The <strong>Gimbal-Eye</strong> design (B1 7.1) mounts the camera on a pan/tilt arm so the robot can <strong>look around</strong> without driving. It must find <strong>Amira</strong> (registered), ignore everyone else, show a green light and play a tone.</p>
  <ol><li>The camera only sees about 50° at a time, so one fixed look is not enough: sweep with <code>pan_to(angle)</code> (-90 to 90).</li><li>Let the camera settle before reading a face.</li><li>Recognition gets worse with distance and in dim light (B1 7.1), and other people must <em>not</em> trigger the light.</li></ol>`,
  cfg:{world:{w:3000,h:2200},rad:100,mmps:5,degps:3},
  controls:[
    {id:"where",type:"select",label:"Amira is",def:"right",options:[["right","At the right (80°)"],["left","At the left (-70°)"],["front","In front (0°)"]]},
    {id:"dist",type:"select",label:"Distance",def:"1000",options:[["500","0.5 m"],["1000","1 m"],["2000","2 m"]]},
    {id:"light",type:"select",label:"Lighting",def:"bright",options:[["bright","Bright classroom"],["dim","Dim room (more mistakes)"]]},
    {id:"cable",type:"check",label:"Cable clip blocks the camera at the left end stop",def:false}],
  init(s){const p=s.opts.pos||{};s.x=RX;s.y=RY;s.h=0;const d=Number(s.opts.dist),a=WHERE[s.opts.where];
    const P=(ang,dist)=>[RX+Math.cos(rad(ang))*dist,RY+Math.sin(rad(ang))*dist];
    s.people=[{n:"Amira",reg:true,pos:p.Amira||P(a,d)},{n:"Chen",reg:false,pos:p.Chen||P(15,1800)},{n:"Ben",reg:false,pos:p.Ben||P(-50,1300)}];
    s.st={pan:0,panT:0,tilt:0,tiltT:0,led:null,mode:false,calls:0,inview:0,hits:0,falseAcc:0,falseCalls:0,panMin:0,panMax:0,tFirst:null,tReach:0,found:false,blockedSeen:false,cableHit:false,toneT:null}},
  step(s){const st=s.st;st.pan+=clamp(st.panT-st.pan,-150*U.DT,150*U.DT);st.tilt+=clamp(st.tiltT-st.tilt,-120*U.DT,120*U.DT);
    if(st.pan<st.panMin){st.panMin=st.pan;st.tReach=s.t}if(st.pan>st.panMax){st.panMax=st.pan;st.tReach=s.t}
    if(s.opts.cable&&st.pan<=-80)st.cableHit=true;},
  view(s){const st=s.st,a=s.h+st.pan,out=[];if(Math.abs(st.tilt)>17)return out;
    for(const p of s.people){const dx=p.pos[0]-s.x,dy=p.pos[1]-s.y,ang=normA(deg(Math.atan2(dy,dx))-a),d=Math.hypot(dx,dy);if(Math.abs(ang)<=FOV/2&&d<=2600)out.push({p,ang,d})}return out},
  snap(s){const st=s.st;return{pan:st.pan,tilt:st.tilt,led:st.led,sv:[st.pan,st.tilt],ppl:s.people.map(p=>p.pos),vis:s.view(s).map(v=>[v.p.n,v.ang,v.d]),rec:s.rec&&s.t-s.rec.t<0.4?s.rec:null,blk:s.opts.cable&&st.pan<=-80,tone:s.st.toneT!==null&&s.t-s.st.toneT<0.8}},
  chart:{series:[{label:"pan angle (°)",get:s=>s.st.pan}],ymin:-90,ymax:90,unit:"°"},
  buttons:[{label:"◀ Pan 15°",fn:s=>{s.st.panT=clamp(s.st.panT-15,-90,90)}},{label:"Pan 15° ▶",fn:s=>{s.st.panT=clamp(s.st.panT+15,-90,90)}},{label:"Centre",fn:s=>{s.st.panT=0;s.st.tiltT=0}},{label:"Tilt up",fn:s=>{s.st.tiltT=clamp(s.st.tiltT+10,-30,30)}},{label:"Tilt down",fn:s=>{s.st.tiltT=clamp(s.st.tiltT-10,-30,30)}}],
  drag:s=>s.people.map(p=>({id:p.n,x:p.pos[0],y:p.pos[1],r:130})),
  setPos(s,id,x,y){const p=s.people.find(q=>q.n===id);if(p)p.pos=[x,y]},
  api:[{n:"switch_to_face_recognition",a:"",d:"Turn on the camera's face recognition mode.",f:s=>{s.st.mode=true}},
    {n:"face_recognised",a:"name",d:"True if the camera sees the registered face of that name right now. Each check takes 50 ms. Works best near and in good light; other faces can occasionally fool it.",
     f:(s,name)=>{s.tick();const st=s.st;st.calls++;const dim=s.opts.light==="dim";let res=false,seen=null;
       if(!st.mode){return false}
       for(const v of s.view(s)){const reg=v.p.reg&&v.p.n===name;const pc=v.d<=600?0.98:(v.d<=1200?0.92:(v.d<=2100?0.6:0.3));
         if(reg){st.inview++;seen=v;if(s.rnd()<pc*(dim?0.8:1)){res=true;st.hits++}}
         else{st.falseCalls++;if(s.rnd()<(dim?0.14:0.03)){res=true;st.falseAcc++;seen={...v,wrong:true}}}}
       if(res&&!seen)res=false;s.rec={t:s.t,ok:res,name:seen?seen.p.n:null,ang:seen?seen.ang:0,wrong:seen&&seen.wrong};
       if(res&&!(seen&&seen.wrong))st.found=true;return res}},
    {n:"light_on",a:"colour",d:"Turn the robot's light on: \"green\", \"red\", \"blue\"...",f:(s,c)=>{if(s.rec&&s.rec.wrong&&s.t-s.rec.t<0.3&&String(c)==="green"){s.st.wrongLights=(s.st.wrongLights||0)+1}if(s.st.led!==String(c)){s.ev("light")}s.st.led=String(c)}},
    {n:"light_off",a:"",d:"Turn the light off.",f:s=>{s.st.led=null}},
    {n:"pan_to",a:"angle",d:"Turn the camera to this pan angle (-90 left to 90 right). The arm moves at 150°/s and your program carries on straight away.",
     f:(s,a)=>{const g=clamp(num(a,0),-90,90);if(s.st.tFirst===null&&Math.abs(g-s.st.pan)>1)s.st.tFirst=s.t;s.st.panT=g}},
    {n:"tilt_to",a:"angle",d:"Tilt the camera (-30 down to 30 up). Faces are at eye level, so tilt more than 17° loses them.",f:(s,a)=>{s.st.tiltT=clamp(num(a,0),-30,30)}},
    {n:"play_tone_until_end",a:"note",d:"Play a note (\"C\" to \"B\") on the speaker and wait until it ends (0.5 s).",f:(s,n)=>{s.st.toneT=s.t;s.ev("note","",{f:NOTE[String(n).toUpperCase()]||523});s.runFor(0.5)}}],
  hud(f,s){return[["Robot time",f.t.toFixed(1)+" s"],["Pan",f.pan.toFixed(0)+"°"],["Tilt",f.tilt.toFixed(0)+"°"],["Camera sees",f.vis.length?f.vis.map(v=>v[0]).join(", "):"nobody"],["Light",f.led||"off"]]},
  insetTitle:"What the camera sees",
  inset(ix,f,w,h,s){
    ix.fillStyle=f.blk?"#222":"#1c2a38";ix.fillRect(0,0,w,h);
    if(f.blk){ix.fillStyle="#bbb";ix.font="bold 20px system-ui";ix.fillText("IMAGE BLOCKED BY CABLE",w/2-150,h/2);return}
    ix.strokeStyle="rgba(255,255,255,.12)";for(let i=1;i<4;i++){ix.beginPath();ix.moveTo(w*i/4,0);ix.lineTo(w*i/4,h);ix.stroke()}
    for(const v of f.vis){const x=w/2+v[1]/(FOV/2)*(w/2),r=clamp(900/v[2]*34,16,62);const reg=v[0]==="Amira";
      ix.fillStyle=reg?"#e8b04b":"#7fa3c7";ix.beginPath();ix.arc(x,h/2,r,0,7);ix.fill();ix.fillStyle="#222";ix.beginPath();ix.arc(x-r*.3,h/2-r*.1,r*.08,0,7);ix.arc(x+r*.3,h/2-r*.1,r*.08,0,7);ix.fill();ix.beginPath();ix.arc(x,h/2+r*.25,r*.3,0.1*Math.PI,0.9*Math.PI);ix.stroke();
      ix.fillStyle="#fff";ix.font="13px system-ui";ix.textAlign="center";ix.fillText((v[2]/1000).toFixed(1)+" m",x,h/2+r+18);
      if(f.rec&&f.rec.name===v[0]){ix.strokeStyle=f.rec.ok?(f.rec.wrong?"#c4372a":"#4fcf84"):"#c98a00";ix.lineWidth=4;ix.strokeRect(x-r-8,h/2-r-8,2*r+16,2*r+16);ix.fillStyle=ix.strokeStyle;ix.fillText((f.rec.wrong?"WRONG: ":"")+(f.rec.ok?f.rec.name+" ✓":"checking…"),x,h/2-r-14)}}
    ix.textAlign="left";ix.fillStyle="#fff";ix.font="13px system-ui";ix.fillText("pan "+f.pan.toFixed(0)+"°  tilt "+f.tilt.toFixed(0)+"°",10,20);
    ix.strokeStyle="rgba(255,255,255,.4)";ix.strokeRect(1,1,w-2,h-2);
  },
  draw(ctx,f,H,s){
    const W=3000,Hh=2200;ctx.fillStyle=H.css("--floor");ctx.fillRect(0,0,W,Hh);H.grid(W,Hh,250);H.border(W,Hh);
    H.cone(f.x,f.y,f.h+f.pan,FOV,2600,"rgba(31,182,229,.4)");
    const names=["Amira","Chen","Ben"];
    f.ppl.forEach((pp,i)=>{const reg=i===0,vis=f.vis.some(v=>v[0]===names[i]);ctx.fillStyle=reg?"#e8b04b":"#7fa3c7";ctx.beginPath();ctx.arc(pp[0],pp[1],85,0,7);ctx.fill();ctx.strokeStyle=vis?"#1fb6e5":"rgba(0,0,0,.25)";ctx.lineWidth=vis?10:4;ctx.stroke();
      H.text(names[i]+(reg?" (registered)":""),pp[0],pp[1]+135,16,H.css("--ink"),"center");
      if(f.rec&&f.rec.name===names[i]&&f.rec.ok){ctx.strokeStyle=f.rec.wrong?"#c4372a":"#1b8a4b";ctx.lineWidth=10;ctx.beginPath();ctx.arc(pp[0],pp[1],125,0,7);ctx.stroke()}});
    H.robot(f.x,f.y,f.h,{});
    if(f.led){const col={green:"#2ea05a",red:"#e04a3a",blue:"#2a6fe0"}[f.led]||f.led;ctx.fillStyle=col;ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(f.x,f.y,170,0,7);ctx.fill();ctx.globalAlpha=1;ctx.fillStyle=col;ctx.beginPath();ctx.arc(f.x,f.y,34,0,7);ctx.fill()}
    // camera arm
    ctx.strokeStyle="#ff7a21";ctx.lineWidth=14;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+Math.cos(rad(f.h+f.pan))*95,f.y+Math.sin(rad(f.h+f.pan))*95);ctx.stroke();
  },
  checks(s){
    const st=s.st,out=[];
    const rate=st.inview?st.hits/st.inview:null;
    out.push({t:"T1 Recognition",b:"B1 7.1",ok:st.found&&rate>=0.8,d:st.inview===0?"Amira was never in the camera's 50° view. Pan the camera to find her.":"Amira was in view for "+st.inview+" checks and was recognised "+st.hits+" times ("+Math.round(rate*100)+"%, need 80% at 1 m)."+(st.found?"":" Never confirmed.")});
    const wl=st.wrongLights||0;
    out.push({t:"T2 False alarm",b:"B1 7.1",ok:wl===0&&st.calls>0,d:st.calls===0?"Your program never called face_recognised().":(wl===0?"Wrong lights: 0. The camera mistook an unregistered face "+st.falseAcc+" time(s) in "+st.falseCalls+" checks"+(st.falseAcc?", but your code did not act on it.":"."):"Green light turned on for the wrong person "+wl+" time(s) (must be 0). Check the face more than once before you accept it.")});
    const span=st.panMax-st.panMin,t0=st.tFirst,tt=t0===null?null:(st.tReach-t0);
    const est=(tt!==null&&span>=90)?tt*180/span:null;
    out.push({t:"T3 Sweep time",b:"B1 7.1",ok:est!==null&&est<3,d:est===null?"Pan at least 90° so the sweep time can be measured.":"Full 180° sweep would take about "+est.toFixed(1)+" s at your pace (target under 3 s). Covered "+Math.round(span)+"°."});
    const both=st.panMin<=-85&&st.panMax>=85;
    out.push({t:"T4 View",b:"B1 7.2",ok:both&&!st.cableHit,d:st.cableHit?"A cable clip blocked the image at the left end stop.":(both?"Nothing blocked the image at either end stop.":"Not tested yet: pan to both end stops (-90 and 90) to check the view.")});
    return out},
  tests:[1,2,3,4],
  examples:{
    v1:{label:"watch_v1.py (Criterion C, Lesson 4)",code:`switch_to_face_recognition()
while True:
    if face_recognised("Amira"):
        light_on("green")
    else:
        light_off()
`},
    v2:{label:"sweep_v2.py (Criterion C, Lesson 5)",code:`ANGLES = [-90, -45, 0, 45, 90]
switch_to_face_recognition()
found = False
while not found:
    for a in ANGLES:
        pan_to(a)
        sleep(0.6)               # let the camera settle
        if face_recognised("Amira"):
            light_on("green"); play_tone_until_end("C")
            found = True
            break
light_off()
`},
    confirm:{label:"Experiment: confirm 3 times before accepting",code:`# Accept a face only if 3 checks in a row agree. Try the dim room!
switch_to_face_recognition()
found = False
while not found:
    for a in [-90, -45, 0, 45, 90]:
        pan_to(a)
        sleep(0.6)
        votes = 0
        for i in range(3):
            if face_recognised("Amira"):
                votes += 1
        if votes == 3:
            light_on("green"); play_tone_until_end("E")
            found = True
            break
`,opts:{light:"dim"}}
  }
});
})();
