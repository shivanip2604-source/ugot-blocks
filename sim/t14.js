(function(){
const U=UGOT,clamp=U.clamp,num=U.num,rad=U.rad,deg=U.deg,normA=U.normA;
const LY0=1000,START=300,LOOK=300,AMP=150,LEN=3000,HALF=150;
const mec=U.apiMecanum().filter(a=>["rotate_z","drive_y"].includes(a.n));
const drv=U.apiDrive().filter(a=>["drive_forward","stop"].includes(a.n));
function geo(s){const d=Number(s.opts.dist),tagX=START+100+d,xL0=tagX-300;return{tagX,xL0,xG:xL0+LEN}}
function LY(s,x){const g=geo(s);if(x<=g.xL0)return LY0;return LY0+AMP*Math.sin(2*Math.PI*(x-g.xL0)/LEN)}
U.register({
  id:"14",name:"Precise Delivery",emoji:"📮",maxT:70,
  tagline:"Your Drop-Hatch: find the AprilTag, follow the double-track lane, stop at the gate and place the parcel in the square.",
  brief:`<p>The <strong>Drop-Hatch</strong> design (B1 7.1) has four jobs: <strong>1)</strong> stop when the AprilTag reaches the middle band of the camera image, <strong>2)</strong> follow a 3 m double-track lane without leaving it, <strong>3)</strong> stop <strong>20 cm</strong> from the gate card using the TOF sensor, <strong>4)</strong> place the parcel in a taped <strong>15 cm square</strong>.</p>
  <ol><li><code>tag_y()</code> is the tag's height in the image (0 = not seen). The band starts at 240.</li><li><code>lane_offset()</code> tells you how far the lane centre is to the right (+) or left (−).</li><li><code>arm_action("place_parcel")</code> puts the parcel about 125 mm in front of the nose.</li></ol>`,
  cfg:{world:{w:5200,h:1800},rad:100,mmps:5,degps:6,mecanum:true},
  controls:[
    {id:"dist",type:"select",label:"Tag start distance",def:"1400",options:[["1000","1.0 m from the tag"],["1400","1.4 m from the tag"],["1800","1.8 m from the tag"]]},
    {id:"noise",type:"check",label:"Sensor noise and floor slip",def:true}],
  init(s){s.x=START;s.y=LY0;s.h=0;s.st={cam:"down",tagSeen:0,firstStop:null,wasMoving:false,stopErr:null,lane:false,laneOK:false,exits:0,inLane:true,laneTrav:0,gate:null,gateStop:null,dropped:false,land:null,mode:false,tofReads:0,tagMin:null}},
  slip(s,v){if(s.opts.noise!==false)return{vx:v.vx,vy:v.vy,wz:v.wz+0.15*Math.sin(s.t*1.3)};return v},
  step(s){const st=s.st,g=geo(s),ly=LY(s,s.x),off=Math.abs(s.y-ly);
    const mv=Math.abs(s.cmd.vx)+Math.abs(s.cmd.wz)>0;
    if(mv)st.wasMoving=true;else if(st.wasMoving&&st.firstStop===null&&st.tagSeen>0)st.firstStop=s.x;
    if(s.x>g.xL0+100&&s.x<g.xG-250){st.laneTrav=Math.max(st.laneTrav,s.x-g.xL0);if(off>HALF&&st.inLane){st.exits++;st.inLane=false;s.ev("bad");s.log("The robot left the lane!","err")}else if(off<=HALF-20)st.inLane=true}},
  tagY(s){const g=geo(s),ahead=g.tagX-(s.x+100);if(s.st.cam!=="down")return 0;const y=240+(400-ahead)*0.5;return(y>=1&&y<=480)?y:0},
  done(s){if(s.st.dropped)return"The parcel was placed."},
  tofTrue(s){const g=geo(s),fx=Math.cos(rad(s.h)),fy=Math.sin(rad(s.h)),nx=s.x+100*fx,ny=s.y+100*fy;if(Math.abs(fx)<0.2)return 9999;const t=(g.xG-nx)/fx,yy=ny+fy*t;if(t<0||Math.abs(yy-LY(s,g.xG))>350)return 9999;return t},
  snap(s){const g=geo(s);return{tagY:this.tagY(s),cam:s.st.cam,ly:LY(s,s.x),land:s.st.land,tof:s.tofLast,tofT:s.tofT||-9,beep:(s.t-(s.tofT||-9)<0.15)?s.tofLast*10:null,laneOffV:s.loV,laneT:s.loT||-9,sv:[0],exits:s.st.exits}},
  chart:{series:[{label:"lane_offset()",get:s=>(s.t-(s.loT||-9)<0.06&&s.loV!==null&&s.loV!==undefined)?s.loV:null},{label:"tag_y() ÷ 4.8",get:s=>{const v=UGOT.topics["14"].tagY(s);return v?v/4.8:null}}],ymin:-100,ymax:100,unit:""},
  api:[...drv,...mec,
    {n:"arm_action",a:"name",d:"Run a preset arm action: \"camera_down\" (look at the floor), \"camera_up\", \"grab_parcel\" or \"place_parcel\". Waits until it finishes (1.5 s).",
     f:(s,n)=>{n=String(n);const st=s.st;if(n==="camera_down")st.cam="down";else if(n==="camera_up")st.cam="up";
       else if(n==="place_parcel"){const fx=Math.cos(rad(s.h)),fy=Math.sin(rad(s.h)),px=s.x+(100+125)*fx,py=s.y+(100+125)*fy;st.land=[px,py];st.dropped=true;s.ev("deliver");s.log("Parcel placed.","sys")}
       s.runFor(1.5)}},
    {n:"tag_y",a:"",d:"Height of the AprilTag in the camera image, 0 (top) to 480 (bottom), growing as you get closer. Returns 0 when no tag is seen. The middle band starts at 240. Each call takes 50 ms.",
     f:s=>{s.tick();const v=this_T().tagY(s);if(v)s.st.tagSeen++;return Math.round(v+(v&&s.opts.noise!==false?(s.rnd()*2-1)*2:0))}},
    {n:"tag_centred",a:"",d:"True when the tag is inside the middle band of the image (y 240 to 280). Each call takes 50 ms.",
     f:s=>{s.tick();const v=this_T().tagY(s);if(v)s.st.tagSeen++;return v>=240&&v<=280}},
    {n:"switch_to_lane_mode",a:"",d:"Turn on the camera's lane recogniser.",f:s=>{s.st.mode=true;s.st.cam="up"}},
    {n:"set_lane",a:"kind",d:"Choose the lane type: \"single\" or \"double\" (double-track).",f:(s,k)=>{s.st.lane=String(k)}},
    {n:"lane_offset",a:"",d:"Where the lane centre is, 300 mm ahead of the nose: -100 (left) to +100 (right). Returns None if the lane is not seen. Each call takes 50 ms.",
     f:s=>{s.tick();const g=geo(s);const px=s.x+Math.cos(rad(s.h))*LOOK,py=s.y+Math.sin(rad(s.h))*LOOK;const yl=LY(s,px);const fx=Math.cos(rad(s.h)),fy=Math.sin(rad(s.h));
       const lat=(px-px)*(-fy)+(yl-py)*fx;let r;if(Math.abs(s.y-LY(s,s.x))>320||!s.st.mode)r=null;else{r=clamp(lat*0.4,-100,100)+(s.opts.noise!==false?(s.rnd()*2-1)*2:0);r=Math.round(r*10)/10}s.loT=s.t;s.loV=r;return r}},
    {n:"tof_distance_cm",a:"",d:"TOF distance ahead in cm (4 to 200). Each reading takes 50 ms.",
     f:s=>{s.tick();let d=this_T().tofTrue(s)/10;if(s.opts.noise!==false&&d<500)d+=(s.rnd()*2-1)*0.15;const r=d<4?0:(d>200?200:Math.round(d*10)/10);s.tofLast=r;s.tofT=s.t;s.st.tofReads++;return r}}],
  hud(f,s){return[["Robot time",f.t.toFixed(1)+" s"],["tag_y()",f.tagY?Math.round(f.tagY):"not seen"],["TOF",f.tof===undefined?"–":f.tof+" cm"],["Lane exits",String(f.exits)],["Camera",f.cam]]},
  draw(ctx,f,H,s){
    const W=5200,Hh=1800,g=geo(s);ctx.fillStyle=H.css("--floor");ctx.fillRect(0,0,W,Hh);H.grid(W,Hh,400);
    // lane
    ctx.lineJoin="round";[-HALF,HALF].forEach(o=>{ctx.strokeStyle="#1a1f26";ctx.lineWidth=22;ctx.beginPath();for(let x=g.xL0;x<=g.xG;x+=40){const y=LY(s,x)+o;x===g.xL0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke()});
    ctx.strokeStyle="#f2c230";ctx.lineWidth=6;ctx.setLineDash([30,30]);ctx.beginPath();for(let x=g.xL0;x<=g.xG;x+=40){const y=LY(s,x);x===g.xL0?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke();ctx.setLineDash([]);
    H.text("double-track lane (3 m)",g.xL0+900,LY0-330,22,H.css("--muted"));
    // tag
    ctx.fillStyle="#fff";ctx.fillRect(g.tagX-45,LY0-330,90,90);ctx.fillStyle="#111";for(let i=0;i<4;i++)for(let j=0;j<4;j++)if((i*3+j*5)%3!==0)ctx.fillRect(g.tagX-40+i*20,LY0-325+j*20,18,18);H.text("AprilTag",g.tagX,LY0-345,18,H.css("--ink"),"center");
    // band marker
    ctx.strokeStyle="rgba(46,160,90,.6)";ctx.lineWidth=6;ctx.setLineDash([14,10]);ctx.beginPath();ctx.moveTo(g.tagX-400,LY0-250);ctx.lineTo(g.tagX-400,LY0+250);ctx.stroke();ctx.setLineDash([]);H.text("band: stop here",g.tagX-480,LY0+290,16,"#1b8a4b");
    // gate
    ctx.fillStyle="#8a5a3a";ctx.fillRect(g.xG,LY(s,g.xG)-350,40,700);H.text("GATE",g.xG+20,LY(s,g.xG)-370,22,H.css("--ink"),"center");
    ctx.strokeStyle="rgba(196,55,42,.6)";ctx.setLineDash([12,8]);ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(g.xG-300,LY(s,g.xG)-300);ctx.lineTo(g.xG-300,LY(s,g.xG)+300);ctx.stroke();ctx.setLineDash([]);H.text("20 cm + nose",g.xG-330,LY(s,g.xG)-320,16,"#c4372a","right");
    const ty=LY(s,g.xG);ctx.strokeStyle="#1b8a4b";ctx.lineWidth=8;ctx.strokeRect(g.xG-150,ty-75,150,150);ctx.fillStyle="rgba(46,160,90,.18)";ctx.fillRect(g.xG-150,ty-75,150,150);H.text("15 cm target",g.xG-75,ty+120,16,"#1b8a4b","center");
    H.trail(s,f.t,"#f26a21",6);
    if(f.land){ctx.fillStyle="#c98a00";ctx.fillRect(f.land[0]-35,f.land[1]-35,70,70);ctx.strokeStyle="#111";ctx.lineWidth=5;ctx.strokeRect(f.land[0]-35,f.land[1]-35,70,70);H.text("parcel",f.land[0],f.land[1]+8,14,"#fff","center")}
    else if(true){ctx.fillStyle="#c98a00";ctx.fillRect(f.x-35,f.y-35,70,70);}
    H.robot(f.x,f.y,f.h,{});
    if(!f.land){ctx.fillStyle="#c98a00";ctx.fillRect(f.x-30,f.y-30,60,60);ctx.strokeStyle="#111";ctx.lineWidth=4;ctx.strokeRect(f.x-30,f.y-30,60,60)}
  },
  checks(s){
    const st=s.st,g=geo(s),out=[];
    if(st.firstStop===null&&st.wasMoving&&Math.abs(s.cmd.vx)+Math.abs(s.cmd.wz)===0&&st.tagSeen>0)st.firstStop=s.x;
    const ft=st.firstStop;let err=null;if(ft!==null){const ahead=g.tagX-(ft+100);err=ahead<=400?Math.max(0,400-ahead-40):ahead-400}
    out.push({t:"T1 Tag stop",b:"B1 7.1",ok:ft!==null&&err!==null&&err<=20,d:ft===null?"The car has not stopped for the tag yet (or never saw it).":"First stop was "+(ft!==null?Math.round(g.tagX-(ft+100)):0)+" mm from the tag; the band begins at 400 mm ("+Math.round(err)+" mm outside the band, limit 20)."});
    out.push({t:"T2 Patrol",b:"B1 7.1",ok:st.laneTrav>=2000&&st.exits===0,d:st.laneTrav<2000?"The car did not follow the lane for at least 2 m yet.":(st.exits===0?"Followed "+(st.laneTrav/1000).toFixed(1)+" m of lane with no exits.":st.exits+" lane exit(s).")});
    const nose=s.x+100*Math.cos(rad(s.h)),gd=Math.min(9999,UGOT.topics['14'].tofTrue(s));const stillAtGate=st.laneTrav>=2000&&Math.abs(s.cmd.vx)+Math.abs(s.cmd.wz)===0;
    out.push({t:"T3 Gate stop",b:"B1 7.2",ok:stillAtGate&&Math.abs(gd-200)<=10,d:!stillAtGate?"The car has not stopped at the gate.":"Stopped "+(gd/10).toFixed(1)+" cm from the gate (target 20 cm ± 1 cm)."});
    let dd=null;if(st.land){const T=[g.xG-75,LY(s,g.xG)];dd=[st.land[0]-T[0],st.land[1]-T[1]]}
    out.push({t:"T4 Drop",b:"B1 7.1",ok:dd!==null&&Math.abs(dd[0])<=75&&Math.abs(dd[1])<=75,d:dd===null?"The parcel has not been placed yet.":"Parcel landed "+Math.round(dd[0])+" mm along and "+Math.round(dd[1])+" mm across from the target centre (needs to be within 75 mm each way)."});
    return out},
  tests:[1,2,3,4],
  examples:{
    v1:{label:"tag_v1.py (Criterion C, Lesson 4)",code:`arm_action("camera_down")
drive_forward(20)
while not tag_centred():
    pass
stop()
`},
    v2:{label:"deliver_v2.py (Criterion C, Lesson 5)",code:`KP, GATE_CM = 0.4, 20

def find_tag(max_y):
    drive_forward(20)
    while tag_y() < max_y:
        sleep(0.05)
    stop()

find_tag(240)
switch_to_lane_mode(); set_lane("double")
while tof_distance_cm() > GATE_CM:
    offset = lane_offset()
    rotate_z(round(offset * KP))
    drive_y(20)
stop()
arm_action("place_parcel")
`}
  }
});
function this_T(){return UGOT.topics["14"]}
})();
