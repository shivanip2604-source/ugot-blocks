(function(){
const U=UGOT,clamp=U.clamp,num=U.num;
const BX=1350,BD=350,FACE=BX;
const drv=U.apiDrive().filter(a=>["drive_forward","drive_backward","stop"].includes(a.n));
function pitchModel(s){
  const H=Number(s.opts.step),fl=s.st.flip,P=4+0.28*fl+0.12*H,nose=s.x+100,c=s.x;
  if(!s.st.canClimb||nose<=FACE)return 0;
  const up=clamp((nose-FACE)/150,0,1),dn=c>FACE+100?clamp(1-(c-FACE-100)/150,0,1):1;
  return P*Math.min(up,dn);
}
U.register({
  id:"02",name:"Climbing over Obstacles",emoji:"🚙",maxT:60,beepMax:300,
  tagline:"Your flipper car, TOF sensor and gyro on a test track with a step to climb.",
  brief:`<p>Your <strong>Flipper-Lift</strong> design must stop in front of an obstacle, raise its flipper and climb over without tipping (B1 5.2, 7.1). The TOF sensor measures the distance, the gyro measures tilt.</p>
  <ol><li>Use the TOF sensor (B1 7.2) to stop 10 to 20 cm from the block.</li><li>Raise the flipper far enough for the step (about 0.9 degrees per mm of step height) but not so far that the car tips.</li><li>Watch the gyro tilt: the car must stay below 35° and stop if it goes above your limit.</li></ol>`,
  cfg:{world:{w:1800,h:1200},rad:100,mmps:5,degps:3},
  controls:[
    {id:"step",type:"select",label:"Step height",def:"40",options:[["20","Step 20 mm"],["40","Step 40 mm"],["60","Step 60 mm"]]},
    {id:"spikes",type:"check",label:"TOF noise spikes (sensor glitches 4% of readings)",def:true},
    {id:"noise",type:"check",label:"Normal sensor noise (±6 mm)",def:true}],
  init(s){const p=s.opts.pos||{};s.x=250;s.y=600;s.h=0;s.st={flip:0,flipT:0,pitchReads:0,maxPitch:0,tofErr:[],reads:0,onTop:false,canClimb:false,tipped:false,stopMin:null,stoppedAt:null,climbed:false};
    s.bx=p.block?p.block[0]-BD/2:BX;s.st.canClimb=false},
  blocked(s,x,y){const H=Number(s.opts.step);if(x+100>FACE+2&&!s.st.canClimb)return"block";return null},
  pre(s){const H=Number(s.opts.step);s.st.canClimb=s.st.flip>=0.9*H-0.01},
  step(s){
    const st=s.st,d=st.flipT-st.flip;st.flip+=clamp(d,-90*U.DT,90*U.DT);
    const H=Number(s.opts.step);st.canClimb=st.flip>=0.9*H-0.01;
    s.pitch=pitchModel(s);st.maxPitch=Math.max(st.maxPitch,s.pitch);
    if(s.pitch>35&&!st.tipped){st.tipped=true;s.ev("error","The car tipped over");s.log("The car tipped over! Tilt reached "+s.pitch.toFixed(0)+"° (limit 35°).","err");s.setVel(0,0,0);s.finished=true;s.reason="tip"}
    if(s.x>=FACE+50&&!st.climbed){st.climbed=true;s.ev("good","Climbed the step");s.log("Climbed onto the block.","sys")}
    const nose=s.x+100,dist=FACE-nose;
    const mv=Math.hypot(s.cmd.vx,s.cmd.vy)>0;if(mv)st.wasMoving=true;else if(st.wasMoving&&st.firstStop==null){st.firstStop=dist}
  },
  done(s){if(s.st.tipped)return"The car tipped over.";return null},
  rayAhead(s){const d=FACE-(s.x+100);return d},
  snap(s){return{flip:s.st.flip,pitch:s.pitch||0,sv:[s.st.flip],tof:s.tofLast,tofT:s.tofT||-9,beep:(s.t-(s.tofT||-9)<0.15)?s.tofLast*10:null,tipped:s.st.tipped,bx:s.bx}},
  chart:{series:[{label:"TOF reading (cm)",get:s=>(s.t-(s.tofT||-9)<0.06&&s.tofLast!==undefined)?s.tofLast:null}],ymax:200,unit:"cm",line:[15,"STOP_CM 15"]},
  api:[...drv,
    {n:"tof_distance_cm",a:"",d:"TOF distance in cm. Range 4 to 200 cm: under 4 cm it returns 0, over 200 cm it returns 200. Each reading takes 50 ms and can glitch.",
     f:s=>{s.tick();const tr=(FACE-(s.x+100))/10;let d=tr;if(s.opts.noise!==false)d+=(s.rnd()*2-1)*0.6;
       if(s.opts.spikes&&s.rnd()<0.04)d=4+s.rnd()*26;
       s.st.tofReads=(s.st.tofReads||0)+1;const r=d<4?0:(d>200?200:Math.round(d*10)/10);s.tofLast=r;s.tofT=s.t;
       if(tr>=5&&tr<=190&&!(s.opts.spikes&&r<31&&Math.abs(r-tr)>2))s.st.tofErr.push(Math.abs(r-tr));return r}},
    {n:"flipper_raise",a:"angle",d:"Move the flipper arm to this angle (0 to 90°) and wait until it arrives. Higher angle lifts the nose more but tilts the car more.",
     f:(s,a)=>{const g=clamp(num(a,0),0,90);const w=Math.abs(g-s.st.flipT)/90;s.st.flipT=g;s.runFor(w+0.05)}},
    {n:"gyro_pitch",a:"",d:"Tilt of the car in degrees (0 = flat). Each reading takes 50 ms.",
     f:s=>{s.tick();s.st.pitchReads++;return Math.round(((s.pitch||0)+(s.rnd()-0.5)*0.6)*10)/10}}],
  buttons:[{label:"Flipper up 60°",fn:s=>{s.st.flipT=60}},{label:"Flipper down 0°",fn:s=>{s.st.flipT=0}}],
  drag:s=>[{id:"block",x:s.bx+BD/2,y:600,r:350}],
  setPos(){},
  hud(f,s){const nose=f.x+100;return[["Robot time",f.t.toFixed(1)+" s"],["Distance to block",Math.max(0,(s.bx-nose)/10).toFixed(0)+" cm"],["TOF reading",f.tof===undefined?"–":f.tof+" cm"],["Flipper",f.flip.toFixed(0)+"°"],["Tilt",f.pitch.toFixed(1)+"°"],["Speed",(f.v[0]/5).toFixed(0)]]},
  insetTitle:"Side view (heights exaggerated)",
  inset(ix,f,w,h,s){
    const H=Number(s.opts.step),sx=0.5,sy=1.3,gy=h-70,cx=w*0.4;
    const X=mm=>cx+(mm-f.x)*sx;
    ix.fillStyle=U.css("--bg");ix.fillRect(0,0,w,h);
    ix.fillStyle=U.css("--line");ix.fillRect(0,gy,w,h-gy);
    ix.fillStyle="#9a8a7a";ix.fillRect(X(s.bx),gy-H*sy,BD*sx,H*sy);
    ix.fillStyle=U.css("--muted");ix.font="13px system-ui";ix.fillText("step "+H+" mm",X(s.bx)+4,gy-H*sy-6);
    ix.fillStyle="rgba(31,182,229,.5)";const d=s.bx-(f.x+100);
    ix.save();const lift=H*sy*clamp((f.x+100-s.bx+200)/200,0,1)*(f.x>s.bx-100?1:0.0)*(1);
    ix.translate(cx,gy-14-(f.x>s.bx-100?H*sy*clamp((f.x-s.bx+100)/200,0,1):0));ix.rotate(-U.rad(f.pitch));
    ix.fillStyle="#3a4756";ix.strokeStyle="#ff7a21";ix.lineWidth=3;ix.beginPath();ix.roundRect(-100*sx,-50,200*sx,50,6);ix.fill();ix.stroke();
    ix.fillStyle="#111";[-70,70].forEach(x=>{ix.beginPath();ix.arc(x*sx,-2,13,0,7);ix.fill()});
    ix.fillStyle="#1fb6e5";ix.fillRect(100*sx-4,-34,8,12);
    ix.save();ix.translate(100*sx-6,-8);ix.rotate(-U.rad(f.flip));ix.fillStyle="#ff7a21";ix.fillRect(0,-5,70*sx+10,9);ix.restore();
    ix.restore();
    ix.fillStyle=U.css("--ink");ix.fillText("tilt "+f.pitch.toFixed(1)+"°   flipper "+f.flip.toFixed(0)+"°",10,22);
    if(f.pitch>30){ix.fillStyle="#c4372a";ix.fillText("TILT WARNING",10,42)}
  },
  draw(ctx,f,H,s){
    const W=1800,Hh=1200;ctx.fillStyle=H.css("--floor");ctx.fillRect(0,0,W,Hh);H.grid(W,Hh,200);H.border(W,Hh);
    ctx.fillStyle="rgba(46,160,90,.18)";ctx.fillRect(s.bx-200,0,100,Hh);H.text("STOP ZONE 10–20 cm",s.bx-195,40,12,"#1b8a4b");
    const st=Number(s.opts.step);ctx.fillStyle="#9a8a7a";ctx.fillRect(s.bx,150,BD,900);ctx.strokeStyle="#6e5f50";ctx.lineWidth=6;ctx.strokeRect(s.bx,150,BD,900);
    H.text("BLOCK",s.bx+BD/2,570,20,"#fff","center");H.text(st+" mm step",s.bx+BD/2,620,16,"#fff","center");
    if(f.tof!==undefined&&f.t-f.tofT<0.5){ctx.strokeStyle="#1fb6e5";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(f.x+100,f.y);ctx.lineTo(Math.min(s.bx,f.x+100+f.tof*10),f.y);ctx.stroke()}
    H.robot(f.x,f.y,f.h,{led:f.tipped?"#c4372a":(f.pitch>30?"#c98a00":"#2ea05a")});
    if(f.pitch>25)H.text("tilt "+f.pitch.toFixed(0)+"°",f.x,f.y-110,18,f.pitch>30?"#c4372a":"#c98a00","center");
  },
  checks(s){
    const st=s.st,H=Number(s.opts.step),out=[];
    const fsd=st.firstStop!=null?st.firstStop:((st.wasMoving&&Math.hypot(s.cmd.vx,s.cmd.vy)===0)?(s.bx-(s.x+100)):null);st.firstStop=fsd;
    const errs=[...st.tofErr].sort((a,b)=>a-b),med=errs.length?errs[Math.floor(errs.length/2)]:null;
    out.push({t:"T1 Sensor accuracy",b:"B1 7.2",ok:med!==null&&med<=1,d:med===null?"Your program never read the TOF sensor.":"Typical TOF error "+med.toFixed(1)+" cm (target within ±1 cm), "+errs.length+" readings checked."});
    const sm=st.stopMin;const nose=s.x+100,dist=(s.bx-nose);
    const stopped=(Math.hypot(s.cmd.vx,s.cmd.vy)===0);
    out.push({t:"T2 Stop distance",b:"B1 7.1",ok:st.firstStop!=null&&st.firstStop>=100&&st.firstStop<=200&&s.crashes===0,d:st.firstStop==null?(s.crashes?"The car hit the block.":"The car never stopped in front of the block."):"Stopped "+(st.firstStop/10).toFixed(1)+" cm from the block (target 10–20 cm)."+(s.crashes?" It then bumped the block.":"")});
    out.push({t:"T3 Climb success",b:"B1 7.1",ok:st.climbed&&!st.tipped,d:st.tipped?"The car tipped over.":(st.climbed?"Climbed the "+H+" mm step.":(st.canClimb?"Flipper was high enough but the car never drove onto the block.":"Did not climb. A "+H+" mm step needs the flipper at "+Math.ceil(0.9*H)+"° or more (you used "+st.flip.toFixed(0)+"°)."))});
    out.push({t:"T4 Tilt safety",b:"B1 7.1",ok:st.pitchReads>0&&st.maxPitch<35&&!st.tipped,d:st.pitchReads===0?"Your program never read gyro_pitch(), so it cannot stop the car if it tilts too far.":"Maximum tilt "+st.maxPitch.toFixed(1)+"° (limit 35°)."+(st.maxPitch>=30?" Your code should stop above 30°.":"")});
    return out},
  tests:[1,2,3,4],
  examples:{
    v1:{label:"stop_v1.py (Criterion C, Lesson 4)",code:`STOP_CM = 15
drive_forward(30)
while tof_distance_cm() > STOP_CM:
    pass
stop()
`},
    v2:{label:"climb_v2.py (Criterion C, Lesson 5)",code:`STOP_CM, MAX_TILT = 15, 30

def read_distance():
    d = median([tof_distance_cm() for _ in range(5)])
    return 4 if d == 0 else d      # 0 = inside the 4 cm blind spot

drive_forward(30)
while read_distance() > STOP_CM:
    sleep(0.05)
stop()
flipper_raise(60)
drive_forward(15)
start = time()
while time() - start < 4:
    if gyro_pitch() > MAX_TILT:
        stop(); flipper_raise(0); break
stop()
`},
    tip:{label:"Experiment: flipper too high (does it tip?)",code:`# Try 20, 60, 90. What is the highest safe angle for a 60 mm step?
drive_forward(30)
while tof_distance_cm() > 15:
    sleep(0.05)
stop()
flipper_raise(90)
drive_forward(15, 4)
print("max tilt check", gyro_pitch())
`,opts:{spikes:false,step:"60"}},
    low:{label:"Experiment: flipper too low (what happens?)",code:`drive_forward(30)
while tof_distance_cm() > 15:
    sleep(0.05)
stop()
flipper_raise(20)
drive_forward(15, 4)
`,opts:{spikes:false,step:"60"}}
  }
});
})();
