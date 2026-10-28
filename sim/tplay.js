/* Playground: free coding in VEXcode VR style. Every motor, sensor and AI camera mode in one robot, with several worlds.
   Sensors are worked out on every step (st.dash) so the dashboard shows live values while driving by keyboard or watching a program. */
(function(){
const U=UGOT,clamp=U.clamp,num=U.num,rad=U.rad,deg=U.deg,normA=U.normA;
const W=4800,Hh=3200,FOV=25;
const NOTE={C:523,D:587,E:659,F:698,G:784,A:880,B:988};
const COLS={red:"#d9382c",green:"#2ea05a",blue:"#2a6fe0",yellow:"#f0c020",white:"#f4f6f8"};
const RANGE={face:1500,person:3000,sign:1000,object:1200};
const MODES=["face","object","sign","person","line","off"];
function rrect(x0,y0,x1,y1,r){const p=[],arc=(cx,cy,a0)=>{for(let i=0;i<=8;i++){const a=rad(a0+i*90/8);p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r])}};
  arc(x1-r,y0+r,-90);arc(x1-r,y1-r,0);arc(x0+r,y1-r,90);arc(x0+r,y0+r,180);return p}
const WORLDS={
 all:{label:"Everything (start here)",start:[500,1600,0],
  boxes:[[2700,1600,300,300],[3900,700,300,300]],
  pads:[["red",900,1450,300,300],["green",1300,1450,300,300],["blue",1700,1450,300,300],["yellow",4300,2700,400,400]],
  line:rrect(1100,250,3300,1050,300),
  things:[["person","Amira",1200,2650,150],["sign","children",2100,2750,90],["object","bottle",2900,2650,60],["object","vase",3500,2650,70],["person","Ben",4300,1600,150]]},
 field:{label:"Open field with boxes",start:[2400,1600,0],
  boxes:[[1000,800,300,300],[3800,800,300,300],[1000,2400,300,300],[3800,2400,300,300],[3600,1600,300,600]],
  pads:[["red",250,250,450,450],["green",4100,250,450,450],["blue",250,2500,450,450],["yellow",4100,2500,450,450]],line:null,things:[]},
 maze:{label:"Wall maze (spiral)",start:[400,2800,-90],
  boxes:[[800,2000,80,2400],[2400,800,3200,80],[4000,1600,80,1600],[2800,2400,2400,80],[1600,2000,80,800]],
  pads:[["green",2400,950,600,500]],line:null,things:[]},
 line:{label:"Line track",start:[1700,600,0],boxes:[],
  pads:[["green",1150,450,300,300]],line:rrect(600,600,4200,2600,600),things:[]},
 colours:{label:"Colour grid",start:[400,1600,0],boxes:[],
  pads:(()=>{const c=["red","green","blue","yellow","white"],o=[];for(let i=0;i<5;i++)for(let j=0;j<3;j++)o.push([c[(i+j)%5],800+i*800,400+j*900,700,700]);return o})(),line:null,things:[]},
 ai:{label:"AI camera room",start:[2400,1600,0],boxes:[],pads:[],line:null,
  things:[["sign","stop",4300,1600,90],["person","Amira",2400,450,150],["person","Ben",1100,1600,150],["object","bottle",3100,2300,60],["object","vase",1700,2300,70],["object","ball",1700,900,60],["sign","children",3100,900,90]]}
};
function inRect(x,y,r){return x>r[1]&&x<r[1]+r[3]&&y>r[2]&&y<r[2]+r[4]}
function ray(s,ang){const ox=s.x+Math.cos(rad(ang))*100,oy=s.y+Math.sin(rad(ang))*100,dx=Math.cos(rad(ang)),dy=Math.sin(rad(ang));let best=Infinity;
  const box=(x0,y0,x1,y1)=>{let t0=-1e9,t1=1e9;for(const [o,d,a,b] of [[ox,dx,x0,x1],[oy,dy,y0,y1]]){if(Math.abs(d)<1e-9){if(o<a||o>b)return}else{let ta=(a-o)/d,tb=(b-o)/d;if(ta>tb)[ta,tb]=[tb,ta];t0=Math.max(t0,ta);t1=Math.min(t1,tb)}}if(t0<=t1&&t1>=0)best=Math.min(best,Math.max(t0,0))};
  box(-50,-50,W+50,0);box(-50,Hh,W+50,Hh+50);box(-50,0,0,Hh);box(W,0,W+50,Hh);
  for(const o of s.obs)box(o.x-o.w/2,o.y-o.h/2,o.x+o.w/2,o.y+o.h/2);
  for(const t of s.things)box(t.x-t.r,t.y-t.r,t.x+t.r,t.y+t.r);
  return best}
function tofRaw(s){const d=ray(s,s.h)/10;return d<4?0:(d>200?200:Math.round(d*10)/10)}
function colourAt(s){for(const p of s.pads)if(inRect(s.x,s.y,p))return p[0];return"none"}
function lineOffset(s){
  const L=s.line;if(!L)return null;
  const fx=Math.cos(rad(s.h)),fy=Math.sin(rad(s.h)),px=s.x+fx*300,py=s.y+fy*300;let best=1e9,bx=0,by=0;
  for(let i=0;i<L.length;i++){const a=L[i],b=L[(i+1)%L.length],vx=b[0]-a[0],vy=b[1]-a[1],l2=vx*vx+vy*vy||1;
    const t=clamp(((px-a[0])*vx+(py-a[1])*vy)/l2,0,1),qx=a[0]+vx*t,qy=a[1]+vy*t,d=Math.hypot(px-qx,py-qy);if(d<best){best=d;bx=qx;by=qy}}
  if(best>250)return null;
  const lat=(bx-px)*(-fy)+(by-py)*fx;return clamp(Math.round(lat/150*100),-100,100)}
function onLine(s){const L=s.line;if(!L)return false;let best=1e9;
  for(let i=0;i<L.length;i++){const a=L[i],b=L[(i+1)%L.length],vx=b[0]-a[0],vy=b[1]-a[1],l2=vx*vx+vy*vy||1,t=clamp(((s.x-a[0])*vx+(s.y-a[1])*vy)/l2,0,1);best=Math.min(best,Math.hypot(s.x-a[0]-vx*t,s.y-a[1]-vy*t))}
  return best<60}
// What the camera sees in a mode: the nearest matching thing inside the ±25° view, in range and not hidden behind a box.
function cameraSees(s,mode){
  if(mode==="line")return lineOffset(s)===null?null:{name:"line"};
  const type=mode==="face"||mode==="person"?"person":mode,cx=s.x+Math.cos(rad(s.h))*100,cy=s.y+Math.sin(rad(s.h))*100;let best=null;
  for(const t of s.things){if(t.type!==type)continue;const dx=t.x-cx,dy=t.y-cy,d=Math.hypot(dx,dy),a=normA(deg(Math.atan2(dy,dx))-s.h);
    if(Math.abs(a)>FOV||d>RANGE[mode])continue;if(ray(s,s.h+a)<d-t.r-30)continue;if(!best||d<best.d)best={id:t.id,name:t.name,d,a}}
  return best}
function needMode(s,want,fn){if(s.st.mode===want)return true;
  if(!s.st.hints[fn]){s.st.hints[fn]=1;s.log("💡 "+fn+"() needs the camera in "+want+" mode first. Add: ai_mode(\""+want+"\")","sys")}return false}
function motorText(v,mmps,degps){const f=Math.round(v[0]),sl=Math.round(v[1]),tw=Math.round(v[2]);
  if(!f&&!sl&&!tw)return"stopped";const p=[];
  if(f)p.push((f>0?"forward ":"backward ")+Math.round(Math.abs(f)/mmps));
  if(sl)p.push("slide "+(sl>0?"right ":"left ")+Math.round(Math.abs(sl)/mmps));
  if(tw)p.push("turn "+(tw>0?"right ":"left ")+Math.round(Math.abs(tw)/degps));return p.join(", ")}
const spd=v=>clamp(Math.abs(num(v,30)),0,100);

U.register({
  id:"play",name:"Playground",emoji:"🧪",maxT:90,noScore:true,
  tagline:"Free coding: every motor, sensor and AI camera mode in one robot.",
  brief:"<p>Free coding with every UGOT part. No marks.</p>",
  cfg:{world:{w:W,h:Hh},rad:100,mmps:10,degps:3,mecanum:true},
  controls:[{id:"world",type:"select",label:"World",def:"all",options:Object.entries(WORLDS).map(([k,v])=>[k,v.label])},{id:"noise",type:"check",label:"Sensor noise (real sensors are never perfect)",def:true}],
  init(s){const w=WORLDS[s.opts.world]||WORLDS.all,p=s.opts.pos||{};
    s.x=w.start[0];s.y=w.start[1];s.h=w.start[2];s.pads=w.pads;s.line=w.line;
    s.obs=w.boxes.map((o,i)=>{const id="b"+i,q=p[id];return{id,x:q?q[0]:o[0],y:q?q[1]:o[1],w:o[2],h:o[3]}});
    s.things=w.things.map((t,i)=>{const id="t"+i,q=p[id];return{id,type:t[0],name:t[1],x:q?q[0]:t[2],y:q?q[1]:t[3],r:t[4]}});
    s.st={mode:"off",led:null,txt:null,servo:90,servoT:90,speech:null,hints:{},seen:new Set(),colours:new Set(),path:0,px:s.x,py:s.y,dash:{}};
    this.step(s)},
  blocked(s,x,y){for(const o of s.obs)if(Math.abs(x-o.x)<o.w/2+100&&Math.abs(y-o.y)<o.h/2+100)return"box";
    for(const t of s.things)if(Math.hypot(x-t.x,y-t.y)<t.r+100)return t.type==="person"?"person (careful!)":t.type;return null},
  step(s){const st=s.st;st.servo+=clamp(st.servoT-st.servo,-300*U.DT,300*U.DT);st.path+=Math.hypot(s.x-st.px,s.y-st.py);st.px=s.x;st.py=s.y;
    const c=colourAt(s);if(c!=="none")st.colours.add(c);
    const sees=st.mode==="off"?null:cameraSees(s,st.mode);if(sees&&sees.name)st.seen.add(sees.name);
    st.dash={tof:tofRaw(s),col:c,line:st.mode==="line"?lineOffset(s):undefined,sees:sees?sees.name:null,seesId:sees?sees.id:null}},
  snap(s){const st=s.st,d=st.dash;return{sv:[st.servo],servo:st.servo,led:st.led,txt:st.txt,sp:st.speech,mode:st.mode,tof:d.tof,col:d.col,line:d.line,sees:d.sees,seesId:d.seesId,
    obs:s.obs.map(o=>[o.x,o.y,o.w,o.h]),things:s.things.map(t=>[t.x,t.y]),tofT:s.tofT||-9}},
  buttons:MODES.map(m=>({label:"📷 "+m,fn:s=>{s.st.mode=m}})),
  drag:s=>[...s.obs.map(o=>({id:o.id,x:o.x,y:o.y,r:Math.max(o.w,o.h)/2})),...s.things.map(t=>({id:t.id,x:t.x,y:t.y,r:t.r+60}))],
  setPos(s,id,x,y){const o=s.obs.find(q=>q.id===id)||s.things.find(q=>q.id===id);if(o){o.x=x;o.y=y}},
  api:[...U.apiDrive(),
    {n:"drive_and_turn",a:"speed=30, turn=0",d:"Drive forward and steer at the same time. Turn from −100 (left) to 100 (right); 0 drives straight. Great for following a line.",
     f:(s,sp,tr)=>{s.setVel(spd(sp)*s.cfg.mmps,0,clamp(num(tr,0),-100,100)*s.cfg.degps)}},
    U.apiMecanum().find(a=>a.n==="translate"),
    {n:"tof_distance_cm",a:"",d:"Distance sensor: how far away the thing in front is, in cm (4 to 200). 200 means nothing is close. Each reading takes 50 ms.",
     f:s=>{s.tick();let d=tofRaw(s);if(s.opts.noise!==false&&d>4&&d<200)d=Math.round((d+(s.rnd()*2-1)*0.5)*10)/10;s.tofLast=d;s.tofT=s.t;return d}},
    {n:"read_colour",a:"",d:"Colour sensor: the colour of the floor under the robot: \"red\", \"green\", \"blue\", \"yellow\", \"white\" or \"none\". Each reading takes 50 ms.",
     f:s=>{s.tick();return colourAt(s)}},
    {n:"heading",a:"",d:"Which way the nose points (gyro), in degrees: 0 = right, 90 = down, −90 = up.",f:s=>Math.round(s.h*10)/10},
    {n:"position",a:"",d:"Where the robot is: (x, y) in mm from the top-left corner, worked out by the wheel encoders.",tuple:true,f:s=>[Math.round(s.x),Math.round(s.y)]},
    {n:"ai_mode",a:"mode",d:"Choose what the AI camera looks for: \"face\", \"object\", \"sign\", \"person\", \"line\" or \"off\". Takes 0.3 s.",
     f:(s,m)=>{m=String(m).toLowerCase();if(!MODES.includes(m)){s.log("ai_mode: unknown mode \""+m+"\". Use face, object, sign, person, line or off.","err");return}
       s.st.mode=m;s.log("📷 Camera mode: "+m,"sys");s.runFor(0.3)}},
    {n:"camera_sees",a:"",d:"Name of what the AI camera sees right now in the current mode, like \"Amira\", \"bottle\", \"stop\", \"person\" or \"line\". \"none\" if nothing. Each check takes 50 ms.",
     f:s=>{s.tick();if(s.st.mode==="off"){needMode(s,"face","camera_sees");return"none"}const r=cameraSees(s,s.st.mode);
       if(!r)return"none";if(s.opts.noise!==false&&s.rnd()<0.06)return s.st.mode==="object"?({bottle:"vase",vase:"bottle"}[r.name]||r.name):"none";return s.st.mode==="person"?"person":r.name}},
    {n:"face_recognised",a:"name",d:"True if the camera (face mode) sees this person's face: \"Amira\" or \"Ben\". Works up to 1.5 m away. Each check takes 50 ms.",
     f:(s,n)=>{s.tick();if(!needMode(s,"face","face_recognised"))return false;const r=cameraSees(s,"face");return!!r&&r.name===String(n)&&!(s.opts.noise!==false&&s.rnd()<0.05)}},
    {n:"recognised",a:"name",d:"True if the camera (object mode) sees this object: \"bottle\", \"vase\" or \"ball\". Works up to 1.2 m away. Each check takes 50 ms.",
     f:(s,n)=>{s.tick();if(!needMode(s,"object","recognised"))return false;const r=cameraSees(s,"object");return!!r&&r.name===String(n)&&!(s.opts.noise!==false&&s.rnd()<0.05)}},
    {n:"sign_recognised",a:"name",d:"True if the camera (sign mode) sees this traffic sign: \"stop\" or \"children\". Signs are readable up to 1 m away. Each check takes 50 ms.",
     f:(s,n)=>{s.tick();if(!needMode(s,"sign","sign_recognised"))return false;const r=cameraSees(s,"sign");return!!r&&r.name===String(n)&&!(s.opts.noise!==false&&s.rnd()<0.05)}},
    {n:"person_visible",a:"",d:"True if the camera (person mode) sees a person straight ahead, up to 3 m away. Each check takes 50 ms.",
     f:s=>{s.tick();if(!needMode(s,"person","person_visible"))return false;return!!cameraSees(s,"person")}},
    {n:"line_offset",a:"",d:"Where the black line is, 30 cm ahead (camera in line mode): −100 far left, 0 straight ahead, 100 far right. None if no line is seen. Each reading takes 50 ms.",
     f:s=>{s.tick();if(!needMode(s,"line","line_offset"))return null;const o=lineOffset(s);return o===null?null:clamp(o+(s.opts.noise!==false?Math.round((s.rnd()*2-1)*2):0),-100,100)}},
    {n:"servo_to",a:"angle",d:"Turn the servo arm to an angle from 0 to 180°.",f:(s,a)=>{s.st.servoT=clamp(num(a,90),0,180)}},
    {n:"light",a:"colour",d:"Set the robot's light: \"red\", \"green\", \"blue\", \"yellow\", \"white\" or \"off\".",f:(s,c)=>{if(s.st.led!==String(c))s.ev("light");s.st.led=String(c)}},
    {n:"show",a:"text",d:"Show text on the robot's screen.",f:(s,t)=>{s.st.txt=String(t)}},
    {n:"play_tone",a:"note, seconds=0.4",d:"Play a note (\"C\" to \"B\") and wait until it ends.",f:(s,n,sec)=>{s.ev("note","",{f:NOTE[String(n).toUpperCase()]||523});s.runFor(num(sec,0.4))}},
    {n:"speak",a:"text",d:"Say the text out loud and wait 1.5 s.",f:(s,t)=>{s.ev("say",String(t));s.st.speech=String(t);s.log("🔊 \""+t+"\"","sys");s.runFor(1.5);s.st.speech=null}}],
  hud(f,s){const c=s.cfg,d=f.tof;return[
    ["⏱ Time",f.t.toFixed(1)+" s"],["⚙️ Motors",motorText(f.v,c.mmps,c.degps)],
    ["📏 Distance",d===undefined?"–":(d>=200?"200 cm (nothing close)":d+" cm")],["🎨 Colour",f.col||"none"],
    ["🧭 Heading",Math.round(f.h)+"°"],["📍 Position",Math.round(f.x)+", "+Math.round(f.y)+" mm"],
    ["📷 AI camera",f.mode==="off"?"off":f.mode+" → "+(f.sees||"none")],["〰️ Line",f.mode!=="line"?"line mode off":(f.line===null?"no line":f.line)],
    ["🦾 Servo",Math.round(f.servo)+"°"],["💡 Light",f.led||"off"],["🖥️ Screen",f.txt||"–"]]},
  draw(ctx,f,H,s){
    ctx.fillStyle=H.css("--floor");ctx.fillRect(0,0,W,Hh);H.grid(W,Hh,400);H.border(W,Hh);
    for(const p of s.pads){ctx.fillStyle=COLS[p[0]];ctx.globalAlpha=.6;ctx.fillRect(p[1],p[2],p[3],p[4]);ctx.globalAlpha=1;ctx.strokeStyle=p[0]==="white"?"#9aa7b4":COLS[p[0]];ctx.lineWidth=6;ctx.strokeRect(p[1],p[2],p[3],p[4]);
      H.text(p[0],p[1]+p[3]/2,p[2]+p[4]/2+8,15,p[0]==="white"||p[0]==="yellow"?"#333":"#fff","center")}
    if(s.line){ctx.save();ctx.strokeStyle="#1b2430";ctx.lineWidth=50;ctx.lineJoin="round";ctx.beginPath();s.line.forEach((q,i)=>i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]));ctx.closePath();ctx.stroke();ctx.restore()}
    for(const o of f.obs){ctx.fillStyle="#7a8794";ctx.fillRect(o[0]-o[2]/2,o[1]-o[3]/2,o[2],o[3]);ctx.strokeStyle="#3a4756";ctx.lineWidth=6;ctx.strokeRect(o[0]-o[2]/2,o[1]-o[3]/2,o[2],o[3])}
    s.things.forEach((t,i)=>{const x=f.things[i][0],y=f.things[i][1];ctx.save();
      if(t.type==="person"){ctx.fillStyle="#3d6fb6";ctx.beginPath();ctx.ellipse(x,y,t.r,t.r*0.7,0,0,7);ctx.fill();ctx.fillStyle="#e9b98f";ctx.beginPath();ctx.arc(x,y,t.r*0.5,0,7);ctx.fill();ctx.fillStyle="#3a2a1d";ctx.beginPath();ctx.arc(x,y-t.r*0.12,t.r*0.38,Math.PI,0);ctx.fill()}
      else if(t.type==="sign"){if(t.name==="stop"){ctx.fillStyle="#d32f2f";ctx.beginPath();for(let k=0;k<8;k++){const a=rad(22.5+k*45);ctx.lineTo(x+Math.cos(a)*t.r,y+Math.sin(a)*t.r)}ctx.closePath();ctx.fill();H.text("STOP",x,y+9,11,"#fff","center")}
        else{ctx.fillStyle="#f6c21c";ctx.beginPath();ctx.moveTo(x,y-t.r);ctx.lineTo(x+t.r,y);ctx.lineTo(x,y+t.r);ctx.lineTo(x-t.r,y);ctx.closePath();ctx.fill();ctx.strokeStyle="#222";ctx.lineWidth=5;ctx.stroke()}}
      else{ctx.fillStyle={bottle:"#29a3d6",vase:"#8e5bd0",ball:"#f28c28"}[t.name]||"#888";ctx.beginPath();ctx.arc(x,y,t.r,0,7);ctx.fill();if(t.name!=="ball"){ctx.fillStyle="rgba(255,255,255,.6)";ctx.beginPath();ctx.arc(x,y,t.r*0.4,0,7);ctx.fill()}}
      if(f.seesId===t.id){ctx.strokeStyle="#16c784";ctx.lineWidth=12;ctx.setLineDash([24,14]);ctx.beginPath();ctx.arc(x,y,t.r+40,0,7);ctx.stroke();ctx.setLineDash([])}
      ctx.restore();H.text(t.name,x,y+t.r+44,14,H.css("--ink"),"center")});
    if(f.mode&&f.mode!=="off"&&f.mode!=="line")H.cone(f.x+Math.cos(rad(f.h))*100,f.y+Math.sin(rad(f.h))*100,f.h,FOV*2,RANGE[f.mode],"rgba(22,199,132,.32)");
    if(f.mode==="line"){ctx.fillStyle="rgba(22,199,132,.55)";ctx.beginPath();ctx.arc(f.x+Math.cos(rad(f.h))*300,f.y+Math.sin(rad(f.h))*300,26,0,7);ctx.fill()}
    if(f.tof!==undefined&&f.tof<200){ctx.strokeStyle="#1fb6e5";ctx.lineWidth=6;ctx.globalAlpha=.7;ctx.beginPath();ctx.moveTo(f.x+Math.cos(rad(f.h))*100,f.y+Math.sin(rad(f.h))*100);ctx.lineTo(f.x+Math.cos(rad(f.h))*(100+f.tof*10),f.y+Math.sin(rad(f.h))*(100+f.tof*10));ctx.stroke();ctx.globalAlpha=1}
    H.trail(s,f.t,"#f26a21",6);
    H.robot(f.x,f.y,f.h,{led:f.led&&f.led!=="off"?(COLS[f.led]||f.led):"#5a6b7d"});
    ctx.strokeStyle="#ff7a21";ctx.lineWidth=14;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+Math.cos(rad(f.h+f.servo-90))*85,f.y+Math.sin(rad(f.h+f.servo-90))*85);ctx.stroke();
    if(f.txt)H.text(f.txt,f.x,f.y-150,22,H.css("--ink"),"center");
    if(f.sp)H.text("“"+f.sp+"”",f.x,f.y+175,20,"#1b8a4b","center");
  },
  checks(s){const st=s.st;return[{t:"Distance driven",d:(st.path/1000).toFixed(2)+" m in "+s.t.toFixed(1)+" s.",ok:true},{t:"Bumps",d:s.crashes?s.crashes+" bump(s). Use the distance sensor to stop in time.":"No bumps.",ok:true},
    {t:"Colours driven over",d:st.colours.size?[...st.colours].join(", "):"none yet.",ok:true},{t:"AI camera saw",d:st.seen.size?[...st.seen].join(", "):"nothing yet. Choose an AI mode first.",ok:true}]},
  tests:[],
  examples:{
   hello:{label:"1. Hello robot: motors, light, screen and sound",code:`show("Hello!")
light("green")
play_tone("C")
play_tone("E")
drive_forward(30, 2)
turn_right(30, 1)
drive_forward(30, 1)
servo_to(0)
servo_to(180)
light("blue")
speak("I can move")
`,opts:{world:"all"}},
   distance:{label:"2. Distance sensor: stop before the box",code:`drive_forward(30)
while tof_distance_cm() > 30:
    print(tof_distance_cm())
stop()
light("red")
speak("Something is close")
`,opts:{world:"all"}},
   colour:{label:"3. Colour sensor: name every colour you drive over",code:`drive_forward(20)
for count in range(55):
    colour = read_colour()
    show(colour)
    if colour == "red":
        light("red")
    elif colour == "green":
        light("green")
    elif colour == "blue":
        light("blue")
    sleep(0.1)
stop()
`,opts:{world:"all"}},
   slide:{label:"4. Mecanum wheels: slide around a square",code:`for angle in [0, 90, 180, -90]:
    translate(angle, 30)
    sleep(1.5)
    stop()
print(position())
print(heading())
`,opts:{world:"field"}},
   line:{label:"5. AI line mode: follow the black line",code:`ai_mode("line")
for count in range(1500):
    offset = line_offset()
    if offset is None:
        stop()
        break
    drive_and_turn(25, offset * 0.4)
    if read_colour() == "green":
        stop()
        speak("Green stop")
        break
`,opts:{world:"line"}},
   face:{label:"6. AI face mode: turn until you find Amira",code:`ai_mode("face")
for count in range(24):
    if face_recognised("Amira"):
        stop()
        light("green")
        speak("Hello Amira")
        break
    turn_left(20, 0.3)
`,opts:{world:"ai"}},
   objects:{label:"7. AI object mode: look around and name objects",code:`ai_mode("object")
for count in range(24):
    thing = camera_sees()
    show(thing)
    if thing != "none":
        print("I see a", thing)
    turn_right(20, 0.3)
`,opts:{world:"ai"}},
   sign:{label:"8. AI sign mode: stop at the stop sign",code:`ai_mode("sign")
drive_forward(20)
while not sign_recognised("stop"):
    sleep(0.05)
stop()
show("STOP")
light("red")
`,opts:{world:"ai"}},
   maze:{label:"9. Wall maze: turn when a wall is close",code:`for count in range(120):
    if tof_distance_cm() < 40:
        stop()
        turn_right(30, 1)
    else:
        drive_forward(30, 0.5)
    if read_colour() == "green":
        stop()
        speak("I found the exit")
        break
`,opts:{world:"maze"}}
  }
});
})();
