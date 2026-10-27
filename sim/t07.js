(function(){
const U=UGOT,clamp=U.clamp,num=U.num,normA=U.normA,rad=U.rad,deg=U.deg;
const CX=1500,CY=1000,A=800,B=550,R=250,LOOK=300;
function sdf(px,py){px-=CX;py-=CY;const sx=px<0?-1:1,sy=py<0?-1:1,qx=Math.abs(px)-(A-R),qy=Math.abs(py)-(B-R);let d,nx,ny;
  if(qx>0&&qy>0){const l=Math.hypot(qx,qy);d=l-R;nx=qx/l*sx;ny=qy/l*sy}
  else if(qx>qy){d=Math.abs(px)-A;nx=sx;ny=0}else{d=Math.abs(py)-B;nx=0;ny=sy}
  return{d,nx,ny}}
function lineAt(s,x,y,h){const fx=Math.cos(rad(h)),fy=Math.sin(rad(h)),px=x+fx*LOOK,py=y+fy*LOOK,r=sdf(px,py);
  const Nx=px-r.d*r.nx,Ny=py-r.d*r.ny,lat=(Nx-px)*(-fy)+(Ny-py)*fx;return{dist:Math.abs(r.d),lat}}
const mec=U.apiMecanum().filter(a=>["shift_x","drive_y","rotate_z"].includes(a.n));
U.register({
  id:"07",name:"Automatic Patrol",emoji:"🛤️",maxT:70,beepMax:300,
  tagline:"Your Beacon-Tower: a mecanum patrol car that follows a tape line with its camera and stops for obstacles.",
  brief:`<p>The <strong>Beacon-Tower</strong> design (B1 7.1) patrols a <strong>5 m tape loop</strong> using the camera's line recogniser and the TOF sensor. It must stay on the line, stop if the line is lost, and stop for an obstacle 30 cm ahead.</p>
  <ol><li><code>monorail_offset()</code> says how far the line is to the right (+) or left (−) of the nose. It returns <code>None</code> when no line is seen.</li><li>Sliding sideways alone cannot follow a corner: the nose must <em>rotate</em> (<code>rotate_z</code>).</li><li>Always handle <code>None</code> before using the number.</li></ol>`,
  cfg:{world:{w:3000,h:2000},rad:100,mmps:15,degps:6,mecanum:true},
  controls:[
    {id:"scn",type:"select",label:"Test",def:"lap",options:[["lap","Patrol the loop (2 laps)"],["block","Block on the line (stop 30 cm before it)"],["lift","Lift the car off the line at 5 s"]]},
    {id:"noise",type:"check",label:"Camera jitter (±3 units)",def:true}],
  init(s){const p=s.opts.pos||{};s.x=p.robot?p.robot[0]:CX;s.y=p.robot?p.robot[1]:CY-B;s.h=0;s.theta0=-90;
    s.blk=p.block?{x:p.block[0],y:p.block[1]}:{x:CX-200,y:CY+B};
    s.st={reads:0,signOK:0,signN:0,lapTheta:0,lastTheta:null,laps:0,leftLine:false,maxOff:0,lostT:null,stopAfterLost:null,tofMin:9999,hitBlock:false,stillT:0,moved:false,nones:0,lifted:false,stopT:null}},
  slip(s,v){if(s.st.lifted)return{vx:0,vy:0,wz:0};return v},
  blocked(s,x,y){if(s.opts.scn==="block"&&Math.abs(x-s.blk.x)<100+100&&Math.abs(y-s.blk.y)<100+100)return"block";return null},
  pre(s){if(s.opts.scn==="lift"&&s.t>=5&&!s.st.lifted){s.st.lifted=true;s.st.lostT=s.t;s.ev("bad","Car lifted");s.log("The car was lifted off the line.","sys")}},
  step(s){const st=s.st,r=sdf(s.x,s.y);st.maxOff=Math.max(st.maxOff,Math.abs(r.d));
    if(Math.abs(r.d)>130)st.leftLine=true;
    const th=deg(Math.atan2(s.y-CY,s.x-CX));if(st.lastTheta!==null){let dth=normA(th-st.lastTheta);st.lapTheta+=dth;st.laps=Math.floor((st.lapTheta)/360)}st.lastTheta=th;
    const mv=Math.hypot(s.cmd.vx,s.cmd.vy)+Math.abs(s.cmd.wz)>0;if(mv)st.moved=true;
    if(!mv&&st.moved)st.stillT+=U.DT;else st.stillT=0;
    if(st.lostT!==null&&st.stopAfterLost===null&&!mv)st.stopAfterLost=s.t-st.lostT;
    if(s.crashes>0)st.hitBlock=true;
    if(s.opts.scn==="block"){const l=this.tofTrue(s);st.tofMin=Math.min(st.tofMin,l)}},
  tofTrue(s){if(s.opts.scn!=="block")return 9999;const fx=Math.cos(rad(s.h)),fy=Math.sin(rad(s.h)),nx=s.x+fx*100,ny=s.y+fy*100,al=(s.blk.x-nx)*fx+(s.blk.y-ny)*fy,la=Math.abs(-(s.blk.x-nx)*fy+(s.blk.y-ny)*fx);return (al>0&&la<160)?Math.max(al-100,0):9999},
  done(s){const st=s.st;if(s.opts.scn==="lap"&&st.laps>=2)return"2 laps completed.";if(s.opts.scn==="block"&&st.moved&&st.stillT>=1.5)return"The robot stopped in front of the block.";if(s.opts.scn==="lift"&&st.stillT>=1.5)return"The robot stopped after the line was lost."},
  snap(s){const L=lineAt(s,s.x,s.y,s.h);return{off:s.offT===s.t?s.offV:undefined,lift:s.st.lifted,lk:[s.x+Math.cos(rad(s.h))*LOOK,s.y+Math.sin(rad(s.h))*LOOK],lat:L.lat,tof:s.tofLast,tofT:s.tofT||-9,beep:(s.t-(s.tofT||-9)<0.15)?s.tofLast*10:null,laps:s.st.laps,blk:[s.blk.x,s.blk.y],dline:sdf(s.x,s.y).d}},
  chart:{series:[{label:"monorail_offset()",get:s=>(s.t-(s.offT||-9)<0.06&&s.offV!==null)?s.offV:null}],ymin:-100,ymax:100,unit:""},
  drag:s=>[{id:"robot",x:s.x,y:s.y,r:150},...(s.opts.scn==="block"?[{id:"block",x:s.blk.x,y:s.blk.y,r:150}]:[])],
  setPos(){},
  api:[...mec,
    {n:"switch_to_line_patrol",a:"",d:"Turn on the camera's line (monorail) recogniser.",f:s=>{s.st.mode=true}},
    {n:"monorail_offset",a:"",d:"Where the tape line is, 300 mm ahead of the nose: -100 (far left) to +100 (far right), 0 = centred. Returns None when no line is seen. Each reading takes 50 ms.",
     f:s=>{s.tick();const st=s.st;st.reads++;const L=lineAt(s,s.x,s.y,s.h);let r;
       if(st.lifted||L.dist>220){r=null;st.nones++;if(st.lostT===null){st.lostT=s.t}}
       else{r=clamp(L.lat*0.4,-100,100);if(s.opts.noise!==false)r+=(s.rnd()*2-1)*3;r=Math.round(r*10)/10;
         if(Math.abs(L.lat)>=75){st.signN++;if(Math.sign(r)===Math.sign(L.lat))st.signOK++}}
       s.offT=s.t;s.offV=r;return r}},
    {n:"tof_distance_cm",a:"",d:"TOF distance ahead in cm (4 to 200). Each reading takes 50 ms.",
     f:s=>{s.tick();let d=this_tof(s)/10;if(s.opts.noise!==false&&d<500)d+=(s.rnd()*2-1)*0.5;const r=d<4?0:(d>200?200:Math.round(d*10)/10);s.tofLast=r;s.tofT=s.t;return r}},
    {n:"stop",a:"",d:"Stop all wheels.",f:s=>s.setVel(0,0,0)}],
  hud(f,s){return[["Robot time",f.t.toFixed(1)+" s"],["Laps",String(f.laps)],["Offset",f.off===undefined?"–":(f.off===null?"None":f.off)],["Off the line",Math.abs(f.dline).toFixed(0)+" mm"],["TOF",f.tof===undefined?"–":f.tof+" cm"]]},
  draw(ctx,f,H,s){
    const W=3000,Hh=2000;ctx.fillStyle=H.css("--floor");ctx.fillRect(0,0,W,Hh);H.grid(W,Hh,250);H.border(W,Hh);
    ctx.strokeStyle="#1a1f26";ctx.lineWidth=46;ctx.lineJoin="round";ctx.beginPath();ctx.roundRect(CX-A,CY-B,2*A,2*B,R);ctx.stroke();
    ctx.strokeStyle="#f2c230";ctx.lineWidth=6;ctx.setLineDash([30,30]);ctx.beginPath();ctx.roundRect(CX-A,CY-B,2*A,2*B,R);ctx.stroke();ctx.setLineDash([]);
    H.text("START",CX-60,CY-B-50,16,"#c98a00");ctx.strokeStyle="#1b8a4b";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(CX,CY-B-45);ctx.lineTo(CX,CY-B+45);ctx.stroke();
    H.trail(s,f.t,"#f26a21",7);
    if(s.opts.scn==="block"){ctx.fillStyle="#c4372a";ctx.fillRect(f.blk[0]-100,f.blk[1]-100,200,200);H.text("BLOCK",f.blk[0],f.blk[1]+8,16,"#fff","center");ctx.strokeStyle="rgba(196,55,42,.4)";ctx.setLineDash([16,12]);ctx.lineWidth=5;ctx.beginPath();ctx.arc(f.blk[0],f.blk[1],100+300,0,7);ctx.stroke();ctx.setLineDash([])}
    ctx.fillStyle="#1fb6e5";ctx.beginPath();ctx.arc(f.lk[0],f.lk[1],18,0,7);ctx.fill();
    ctx.save();ctx.translate(f.x,f.y);ctx.rotate(rad(f.h));ctx.strokeStyle="rgba(31,182,229,.5)";ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(100,0);ctx.lineTo(LOOK,0);ctx.stroke();ctx.restore();
    if(f.lift){ctx.fillStyle="rgba(0,0,0,.2)";ctx.beginPath();ctx.ellipse(f.x+30,f.y+50,120,80,0,0,7);ctx.fill();H.text("LIFTED",f.x,f.y-130,20,"#c4372a","center")}
    H.robot(f.x-(f.lift?10:0),f.y-(f.lift?25:0),f.h,{});
  },
  checks(s){
    const st=s.st,out=[];const rate=st.signN?st.signOK/st.signN:null;
    out.push({t:"T1 Line offset",b:"B1 7.1",ok:st.reads>0&&(rate===null||rate>=0.95),d:st.reads===0?"Your program never called monorail_offset().":(rate===null?"Offset read "+st.reads+" times. Drag the robot left and right of the line to test the sign.":"Sign matched the side on "+st.signOK+" of "+st.signN+" readings.")});
    const lapOK=st.laps>=1&&!st.leftLine;
    out.push({t:"T2 Lap success",b:"B1 7.1",ok:s.opts.scn==="lap"?(st.laps>=2&&!st.leftLine):false,d:s.opts.scn!=="lap"?"Run the 'Patrol the loop' test for this one.":(st.leftLine?"The robot left the line (up to "+Math.round(st.maxOff)+" mm off) after "+st.laps+" lap(s).":(st.laps>=2?"2 laps completed, never more than "+Math.round(st.maxOff)+" mm from the line.":"Only "+st.laps+" lap(s) finished."))});
    let sl=st.stopAfterLost;if(sl===null&&st.lostT!==null&&Math.hypot(s.cmd.vx,s.cmd.vy)+Math.abs(s.cmd.wz)===0)sl=s.t-st.lostT;
    out.push({t:"T3 Line lost",b:"B1 7.1",ok:s.opts.scn!=="lap"||st.lostT!==null?(sl!==null&&sl<=1):false,d:st.lostT===null?"The line was never lost. Run the 'Lift the car off the line' test.":(sl===null?"The wheels kept running after the line was lost.":"Stopped "+sl.toFixed(1)+" s after the line was lost (limit 1 s).")});
    out.push({t:"T4 Obstacle",b:"B1 7.1",ok:s.opts.scn==="block"&&st.moved&&!st.hitBlock&&st.stillT>0,d:s.opts.scn!=="block"?"Run the 'Block on the line' test for this one.":(st.hitBlock?"The robot hit the block.":(st.stillT>0?"Stopped "+(Math.max(0,st.tofMin)/10).toFixed(0)+" cm before the block (target about 30 cm).":"The robot did not stop for the block."))});
    return out},
  tests:[1,2,3,4],
  examples:{
    v1:{label:"patrol_v1.py (Criterion C, Lesson 4)",code:`switch_to_line_patrol()
while True:
    offset = monorail_offset()
    shift_x(offset * 0.2)
    drive_y(20)
`},
    v2:{label:"patrol_v2.py (Criterion C, Lesson 5)",code:`KP, SPEED, STOP_CM = 0.2, 20, 30
switch_to_line_patrol()
while True:
    if tof_distance_cm() < STOP_CM:
        stop(); continue
    offset = monorail_offset()
    if offset is None:             # no line recognised
        stop(); break
    rotate_z(round(offset * KP))
    drive_y(SPEED)
`},
    gain:{label:"Experiment: change KP (try 0.05 and 0.6)",code:`KP, SPEED = 0.6, 20
switch_to_line_patrol()
while True:
    offset = monorail_offset()
    if offset is None:
        stop(); break
    rotate_z(round(offset * KP))
    drive_y(SPEED)
`}
  }
});
function this_tof(s){const T=UGOT.topics["07"];return T.tofTrue(s)}
})();
