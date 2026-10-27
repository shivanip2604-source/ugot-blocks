(function(){
const U=UGOT,clamp=U.clamp,num=U.num,rad=U.rad,deg=U.deg,normA=U.normA;
const W=3600,Hh=2400;
const ZONES=[{c:"red",x:200,y:200,w:500,h:500,col:"#d9382c"},{c:"green",x:2900,y:200,w:500,h:500,col:"#2ea05a"},{c:"blue",x:200,y:1700,w:500,h:500,col:"#2a6fe0"},{c:"yellow",x:2900,y:1700,w:500,h:500,col:"#f0c020"}];
const NOTE={C:523,D:587,E:659,F:698,G:784,A:880,B:988};
function ray(s,ang){const ox=s.x+Math.cos(rad(ang))*100,oy=s.y+Math.sin(rad(ang))*100,dx=Math.cos(rad(ang)),dy=Math.sin(rad(ang));let best=Infinity;
  const box=(x0,y0,x1,y1)=>{let t0=-1e9,t1=1e9;for(const [o,d,a,b] of [[ox,dx,x0,x1],[oy,dy,y0,y1]]){if(Math.abs(d)<1e-9){if(o<a||o>b)return;}else{let ta=(a-o)/d,tb=(b-o)/d;if(ta>tb)[ta,tb]=[tb,ta];t0=Math.max(t0,ta);t1=Math.min(t1,tb)}}if(t0<=t1&&t1>=0)best=Math.min(best,Math.max(t0,0))};
  box(-50,-50,W+50,0);box(-50,Hh,W+50,Hh+50);box(-50,0,0,Hh);box(W,0,W+50,Hh);
  for(const o of s.obs)box(o.x-o.w/2,o.y-o.h/2,o.x+o.w/2,o.y+o.h/2);
  // walls are reversed (inside): ray hits inner side; handle by treating border boxes as obstacles outside
  return best}
U.register({
  id:"lab",name:"Robot Sandbox",emoji:"🧪",maxT:120,noScore:true,
  tagline:"Free play: every UGOT function in one arena. Experiment, explore and test your own ideas.",
  brief:`<p>This is a <strong>free sandbox</strong> with no marks. Use it to try out a new idea, test a function from the tutorials, or build your own mini-mission before you apply it to a topic simulator.</p>
  <ol><li>Drive with the keyboard in <em>Live drive</em>, then write code that does the same thing.</li><li>The four coloured corners are read by <code>read_colour()</code>. The boxes can be dragged anywhere.</li><li><code>position()</code> and <code>heading()</code> give the robot's odometry so you can plan routes with maths.</li></ol>`,
  cfg:{world:{w:W,h:Hh},rad:100,mmps:10,degps:3,mecanum:true},
  controls:[{id:"obst",type:"select",label:"Arena",def:"boxes",options:[["boxes","Three boxes"],["empty","Empty arena"],["maze","Wall maze"]]},{id:"noise",type:"check",label:"Sensor noise",def:true}],
  init(s){const p=s.opts.pos||{};s.x=1800;s.y=1200;s.h=0;
    const sets={boxes:[{x:1000,y:700,w:260,h:260},{x:2800,y:1200,w:260,h:260},{x:1000,y:1900,w:260,h:260}],empty:[],maze:[{x:1200,y:600,w:1200,h:80},{x:2400,y:1300,w:1200,h:80},{x:1200,y:1900,w:1200,h:80}]};
    s.obs=(sets[s.opts.obst]||sets.boxes).map((o,i)=>({...o,id:"o"+i,...(p["o"+i]?{x:p["o"+i][0],y:p["o"+i][1]}:{})}));
    s.st={led:null,txt:null,servo:0,servoT:0,colours:new Set(),tone:null,speech:null,path:0,px:s.x,py:s.y}},
  blocked(s,x,y){for(const o of s.obs){if(Math.abs(x-o.x)<o.w/2+100&&Math.abs(y-o.y)<o.h/2+100)return"box"}return null},
  step(s){const st=s.st;st.servo+=clamp(st.servoT-st.servo,-300*U.DT,300*U.DT);st.path+=Math.hypot(s.x-st.px,s.y-st.py);st.px=s.x;st.py=s.y;
    for(const z of ZONES)if(s.x>z.x&&s.x<z.x+z.w&&s.y>z.y&&s.y<z.y+z.h&&!st.colours.has(z.c)){st.colours.add(z.c);s.ev("good")}},
  snap(s){return{sv:[s.st.servo],servo:s.st.servo,led:s.st.led,txt:s.st.txt,obs:s.obs.map(o=>[o.x,o.y,o.w,o.h]),tof:s.tofLast,tofT:s.tofT||-9,beep:(s.t-(s.tofT||-9)<0.15&&s.tofLast!==undefined)?s.tofLast*10:null,sp:s.st.speech}},
  chart:{series:[{label:"TOF (cm)",get:s=>(s.t-(s.tofT||-9)<0.06&&s.tofLast!==undefined)?s.tofLast:null}],ymax:200,unit:"cm"},
  drag:s=>s.obs.map(o=>({id:o.id,x:o.x,y:o.y,r:Math.max(o.w,o.h)/2})),
  setPos(s,id,x,y){const o=s.obs.find(q=>q.id===id);if(o){o.x=x;o.y=y}},
  api:[...U.apiDrive(),...U.apiMecanum().filter(a=>["translate"].includes(a.n)),
    {n:"tof_distance_cm",a:"",d:"TOF distance ahead in cm (4 to 200). Each reading takes 50 ms.",f:s=>{s.tick();let d=ray(s,s.h)/10;if(s.opts.noise!==false&&d<500)d+=(s.rnd()*2-1)*0.5;const r=d<4?0:(d>200?200:Math.round(d*10)/10);s.tofLast=r;s.tofT=s.t;return r}},
    {n:"read_colour",a:"",d:"Colour of the floor under the robot: \"red\", \"green\", \"blue\", \"yellow\" or \"none\". Each reading takes 50 ms.",f:s=>{s.tick();for(const z of ZONES)if(s.x>z.x&&s.x<z.x+z.w&&s.y>z.y&&s.y<z.y+z.h)return z.c;return"none"}},
    {n:"position",a:"",d:"Odometry: (x, y) in mm from the arena's top-left corner.",tuple:true,f:s=>[Math.round(s.x),Math.round(s.y)]},
    {n:"heading",a:"",d:"Which way the nose points in degrees: 0 = east (right), 90 = south (down), -90 = north (up).",f:s=>Math.round(s.h*10)/10},
    {n:"servo_to",a:"angle",d:"Turn the arm servo to this angle (0 to 180°) at 300°/s.",f:(s,a)=>{s.st.servoT=clamp(num(a,0),0,180)}},
    {n:"light",a:"colour",d:"Set the robot light: \"red\", \"green\", \"blue\", \"yellow\", \"white\" or \"off\".",f:(s,c)=>{if(s.st.led!==String(c))s.ev("light");s.st.led=String(c)}},
    {n:"show",a:"text",d:"Show text on the robot's display.",f:(s,t)=>{s.st.txt=String(t)}},
    {n:"play_tone",a:"note, seconds=0.4",d:"Play a note (\"C\" to \"B\") for some seconds and wait.",f:(s,n,sec)=>{s.ev("note","",{f:NOTE[String(n).toUpperCase()]||523});s.runFor(num(sec,0.4))}},
    {n:"speak",a:"text",d:"Say the text out loud and wait 1.5 s.",f:(s,t)=>{s.ev("say",String(t));s.st.speech=String(t);s.log("🔊 \""+t+"\"","sys");s.runFor(1.5);s.st.speech=null}}],
  hud(f,s){const sx=Math.round(f.x),sy=Math.round(f.y);return[["Robot time",f.t.toFixed(1)+" s"],["Position",sx+", "+sy],["Heading",Math.round(f.h)+"°"],["TOF",f.tof===undefined?"–":f.tof+" cm"],["Servo",f.servo.toFixed(0)+"°"],["Light",f.led||"off"]]},
  draw(ctx,f,H,s){
    ctx.fillStyle=H.css("--floor");ctx.fillRect(0,0,W,Hh);H.grid(W,Hh,300);H.border(W,Hh);
    for(const z of ZONES){ctx.fillStyle=z.col;ctx.globalAlpha=.55;ctx.fillRect(z.x,z.y,z.w,z.h);ctx.globalAlpha=1;ctx.strokeStyle=z.col;ctx.lineWidth=6;ctx.strokeRect(z.x,z.y,z.w,z.h);H.text(z.c,z.x+z.w/2,z.y+z.h/2+8,22,"#fff","center")}
    for(const o of f.obs){ctx.fillStyle="#7a8794";ctx.fillRect(o[0]-o[2]/2,o[1]-o[3]/2,o[2],o[3]);ctx.strokeStyle="#3a4756";ctx.lineWidth=6;ctx.strokeRect(o[0]-o[2]/2,o[1]-o[3]/2,o[2],o[3])}
    if(f.tof!==undefined&&f.t-f.tofT<0.5){ctx.strokeStyle="#1fb6e5";ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(f.x+Math.cos(rad(f.h))*100,f.y+Math.sin(rad(f.h))*100);ctx.lineTo(f.x+Math.cos(rad(f.h))*(100+f.tof*10),f.y+Math.sin(rad(f.h))*(100+f.tof*10));ctx.stroke()}
    H.trail(s,f.t,"#f26a21",6);
    H.robot(f.x,f.y,f.h,{led:f.led&&f.led!=="off"?({green:"#2ea05a",red:"#e04a3a",blue:"#2a6fe0",yellow:"#f0c020",white:"#fff"}[f.led]||f.led):"#5a6b7d"});
    ctx.strokeStyle="#ff7a21";ctx.lineWidth=14;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.lineTo(f.x+Math.cos(rad(f.h+f.servo-90))*85,f.y+Math.sin(rad(f.h+f.servo-90))*85);ctx.stroke();
    if(f.txt)H.text(f.txt,f.x,f.y-140,24,H.css("--ink"),"center");
    if(f.sp)H.text("“"+f.sp+"”",f.x,f.y+170,22,"#1b8a4b","center");
  },
  checks(s){const st=s.st;return[{t:"Distance driven",d:(st.path/1000).toFixed(2)+" m in "+s.t.toFixed(1)+" s.",ok:true},{t:"Collisions",d:s.crashes+" bump(s).",ok:true},{t:"Coloured corners visited",d:st.colours.size?[...st.colours].join(", "):"none yet.",ok:true},{t:"Sensor readings",d:(s.tofLast!==undefined?"Last TOF reading "+s.tofLast+" cm.":"No TOF reading yet."),ok:true}]},
  tests:[],
  examples:{
    start:{label:"Starter: drive a square with odometry",code:`# Drive a square and print where you are.
for side in range(4):
    drive_forward(30)
    sleep(1.5)
    stop()
    print("at", position(), "heading", heading())
    turn_right(30, 1)
`},
    wall:{label:"Wall stopper: drive until something is close",code:`drive_forward(30)
while tof_distance_cm() > 30:
    sleep(0.05)
stop()
light("red")
show("Wall!")
print("stopped at", position())
`},
    colours:{label:"Colour hunt: visit the red corner then the green",code:`def go_to(x, y):
    """Drive to a point (x, y) using position() and heading()."""
    pass   # challenge: write this using atan2 from math!

light("white")
show("Find red, then green")
`},
    explore:{label:"Explore: spin and print the distances",code:`for angle in range(8):
    print(angle * 45, "degrees:", tof_distance_cm(), "cm")
    turn_right(30, 1.5)      # about 45 degrees
`}
  }
});
})();
