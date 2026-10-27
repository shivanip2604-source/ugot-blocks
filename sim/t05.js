(function(){
const U=UGOT,clamp=U.clamp,num=U.num,rad=U.rad;
const SX=700,SY=600;
const drv=U.apiDrive().filter(a=>["drive_forward","drive_backward","stop"].includes(a.n));
const mec=U.apiMecanum().filter(a=>["translate","turn_right_in_place","turn_left_in_place"].includes(a.n));
U.register({
  id:"05",name:"Flexible Movement",emoji:"🛞",maxT:40,
  tagline:"Your Omni-Pod: a mecanum car that can slide sideways. Drive a 1 m square course.",
  brief:`<p>The <strong>Omni-Pod</strong> design (B1 7.1) uses the mecanum wheel car's ability to <strong>slide in any direction without turning</strong>. Your program must drive the 1 m tape square and come back to the start.</p>
  <ol><li>Speed 30 should give about 1 m/s (B1 7.2). Strafing is a little slower.</li><li>Turning on the spot makes small angle errors that <strong>add up</strong> over four corners.</li><li><code>translate(angle, speed)</code> keeps the nose facing forward: 0 = forward, 90 = right, 180 = back, -90 = left.</li></ol>`,
  cfg:{world:{w:2800,h:2200},rad:100,mmps:33.3,degps:3,mecanum:true},
  controls:[
    {id:"floor",type:"select",label:"Floor",def:"grip",options:[["grip","Classroom floor (grippy)"],["smooth","Smooth tiles (more slip)"]]},
    {id:"noise",type:"check",label:"Wheel slip and random errors",def:true}],
  init(s){s.x=SX;s.y=SY;s.h=0;const sm=s.opts.floor==="smooth",n=s.opts.noise!==false;
    s.k={fwd:n?0.96+s.rnd()*0.02:1,lat:n?(sm?0.82:0.9):1,turn:n?(sm?1.09:1.06)+s.rnd()*0.02:1,drift:n?(sm?2.4:1.4):0};
    s.st={fwdT:0,fwdD:0,leftT:0,leftD:0,rightT:0,rightD:0,drifts:[],seg:null,path:0,flag:null,px:s.x,py:s.y,planned:0}},
  slip(s,v){
    const k=s.k;let {vx,vy,wz}=v;vx*=k.fwd;vy*=k.lat;wz*=k.turn;
    if(vy!==0)wz+=Math.sign(vy)*k.drift*(Math.abs(vy)/900);
    return{vx,vy,wz}},
  pre(s){const c=s.cmd,st=s.st;st.px=s.x;st.py=s.y;
    st.flag=(c.vx>0&&c.vy===0&&c.wz===0)?"f":(c.vy!==0&&c.vx===0?(c.vy>0?"r":"l"):null);
    const seg=st.flag==="r"||st.flag==="l"?st.flag:null;
    if(seg&&!st.seg){st.seg={h0:s.h,dir:seg}}
    if(!seg&&st.seg){st.drifts.push(Math.abs(U.normA(s.h-st.seg.h0)));st.seg=null}},
  step(s){const st=s.st,d=Math.hypot(s.x-st.px,s.y-st.py);st.path+=d;
    if(st.flag==="f"){st.fwdT+=U.DT;st.fwdD+=d}
    if(st.flag==="r"){st.rightT+=U.DT;st.rightD+=d}
    if(st.flag==="l"){st.leftT+=U.DT;st.leftD+=d}},
  snap(s){return{}},
  chart:{series:[{label:"heading (°)",get:s=>s.h}],ymin:-60,ymax:60,unit:"°",line:[5,"5° limit"]},
  api:[...drv,...mec],
  hud(f,s){const dd=Math.hypot(f.x-SX,f.y-SY),sp=Math.hypot(f.v[0],f.v[1]);return[["Robot time",f.t.toFixed(1)+" s"],["Heading",f.h.toFixed(1)+"°"],["From start",(dd/1000).toFixed(2)+" m"],["Position",Math.round(f.x-SX)+", "+Math.round(f.y-SY)+" mm"],["Commanded speed",(sp/33.3).toFixed(0)]]},
  draw(ctx,f,H,s){
    const W=2800,Hh=2200;ctx.fillStyle=H.css("--floor");ctx.fillRect(0,0,W,Hh);H.grid(W,Hh,200);H.border(W,Hh);
    ctx.strokeStyle="#f2c230";ctx.lineWidth=18;ctx.setLineDash([60,30]);ctx.strokeRect(SX,SY,1000,1000);ctx.setLineDash([]);
    H.text("START",SX-70,SY-30,18,"#c98a00");H.text("1 m tape square",SX+350,SY+1060,16,"#c98a00");
    ctx.fillStyle="rgba(46,160,90,.25)";ctx.beginPath();ctx.arc(SX,SY,100,0,7);ctx.fill();ctx.strokeStyle="#1b8a4b";ctx.lineWidth=5;ctx.stroke();H.text("100 mm",SX+110,SY-100,13,"#1b8a4b");
    H.trail(s,f.t,"#f26a21",8);
    H.robot(f.x,f.y,f.h,{});
  },
  checks(s){
    const st=s.st,out=[];
    if(st.drifts.length===0&&st.seg===null);
    const sp=st.fwdT>0?st.fwdD/st.fwdT:null;
    out.push({t:"T1 Speed",b:"B1 7.2",ok:sp!==null&&Math.abs(sp-1000)<=100,d:sp===null?"Your program never drove forward in a straight line.":"Forward speed "+(sp/1000).toFixed(2)+" m/s at speed 30 (plan 1.00 m/s, ±10%)."});
    const rs=st.rightT>0?st.rightD/st.rightT:null,ls=st.leftT>0?st.leftD/st.leftT:null;
    out.push({t:"T2 Strafe speed",b:"B1 7.1",ok:rs!==null&&ls!==null&&rs>=200&&ls>=200,d:(rs===null||ls===null)?"Your program has not strafed both left and right yet.":"Right "+(rs/1000).toFixed(2)+" m/s, left "+(ls/1000).toFixed(2)+" m/s (need at least 0.2)."});
    const dr=[...st.drifts];if(st.seg)dr.push(Math.abs(U.normA(s.h-st.seg.h0)));
    const md=dr.length?Math.max(...dr):null;
    out.push({t:"T3 Heading drift",b:"B1 7.1",ok:md!==null&&md<5,d:md===null?"Strafe sideways to measure heading drift.":"Biggest nose angle change in a strafe: "+md.toFixed(1)+"° (limit 5°)."});
    const dd=Math.hypot(s.x-SX,s.y-SY),still=Math.hypot(s.cmd.vx,s.cmd.vy)+Math.abs(s.cmd.wz)===0;
    out.push({t:"T4 Square route",b:"B1 7.2",ok:st.path>2500&&dd<=100&&still,d:st.path<=2500?"Drive the whole lap (about 4 m of path) first.":"Ended "+Math.round(dd)+" mm from the start after "+(st.path/1000).toFixed(1)+" m (limit 100 mm)."+(Math.abs(s.h)>10?" Nose angle error "+s.h.toFixed(0)+"°.":"")});
    return out},
  tests:[1,2,3,4],
  examples:{
    v1:{label:"square_v1.py (Criterion C, Lesson 4)",code:`for side in range(4):
    drive_forward(30, seconds=1)
    turn_right_in_place(30, seconds=1)
`},
    v2:{label:"square_v2.py (Criterion C, Lesson 5)",code:`SPEED, SIDE_TIME = 30, 1.0
DIRECTIONS = [0, 90, 180, -90]      # forward, right, back, left
for angle in DIRECTIONS:
    translate(angle, SPEED)         # nose stays facing forward
    sleep(SIDE_TIME)
    stop()
    sleep(0.3)
`},
    diamond:{label:"Experiment: diagonal slide",code:`# Slide diagonally while the nose keeps facing forward.
for angle in [45, -45, -135, 135]:
    translate(angle, 30)
    sleep(1)
    stop()
    sleep(0.3)
`}
  }
});
})();
