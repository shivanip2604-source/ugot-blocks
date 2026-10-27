(function(){
const U=UGOT,clamp=U.clamp,num=U.num,rad=U.rad,deg=U.deg,normA=U.normA;
const RX=900,RY=1300,FOVH=8;
const drv=U.apiDrive().filter(a=>["drive_forward","turn_left","turn_right","stop"].includes(a.n));
const POS={ahead:[6100,1300],left:[2900,350],right:[2000,2300]};
function persBear(s){return normA(deg(Math.atan2(s.per.y-s.y,s.per.x-s.x))-s.h)}
U.register({
  id:"15",name:"Community Rescue",emoji:"🛟",maxT:70,beepMax:300,
  tagline:"Your Shield-Wing: search for a person, approach, stop 30 cm away and lower the medical kit safely.",
  brief:`<p>The <strong>Shield-Wing</strong> design (B1 7.1) carries a <strong>medical kit</strong> on its hoist. It searches by turning until the camera sees the <strong>person</strong>, drives up, stops about <strong>30 cm</strong> away using the TOF sensor, lowers the kit and releases it within 300 mm of the person.</p>
  <ol><li><code>person_visible()</code> only sees a narrow ±8° cone, so the robot must turn to find the person.</li><li>Use a <strong>state machine</strong> (SEARCH, APPROACH, DELIVER, DONE) so each step happens once and in order (B1 5.2).</li><li>Never bump the person or drop the kit: lower the hoist <em>before</em> you release.</li></ol>`,
  cfg:{world:{w:6800,h:2600},rad:100,mmps:6,degps:2,mecanum:false},
  controls:[
    {id:"where",type:"select",label:"Person is",def:"ahead",options:[["ahead","Straight ahead (5.2 m away)"],["left","Ahead-left (3 m, needs a turn)"],["right","Back-right (turn left almost all the way round)"]]},
    {id:"noise",type:"check",label:"Camera and sensor noise",def:true}],
  init(s){const p=s.opts.pos||{};s.x=RX;s.y=RY;s.h=0;const P=p.person||POS[s.opts.where];s.per={x:P[0],y:P[1]};
    s.d0=Math.hypot(s.per.x-s.x,s.per.y-s.y);s.st={hoist:0,hoistT:0,kit:"carried",kitPos:null,carried:0,dropped:false,calls:0,inview:0,hits:0,stopD:null,wasMoving:false,delivered:null,tofReads:0,released:false,pv:false}},
  blocked(s,x,y){return Math.hypot(x-s.per.x,y-s.per.y)<250?"person":null},
  onBump(s){if(s.st.kit==="carried"){s.st.kit="dropped";s.st.dropped=true;const fx=Math.cos(rad(s.h)),fy=Math.sin(rad(s.h));s.st.kitPos=[s.x+fx*180,s.y+fy*180];s.ev("crush");s.log("The bump knocked the kit off the hoist!","err")}},
  step(s){const st=s.st;st.hoist+=clamp(st.hoistT-st.hoist,-1*U.DT,1*U.DT);
    const mv=Math.abs(s.cmd.vx)+Math.abs(s.cmd.wz)>0;if(mv)st.wasMoving=true;
    if(st.kit==="carried"&&Math.abs(s.cmd.vx)>0)st.carried+=Math.abs(s.cmd.vx)*U.DT;
    const d=Math.hypot(s.per.x-s.x,s.per.y-s.y)-150;if(!mv&&st.wasMoving&&st.stopD===null&&st.kit!=="dropped")st.stopD=d-100;
    if(mv)st.stopD=null},
  done(s){if(s.st.delivered!==null)return"The kit was released."},
  tofTrue(s){const fx=Math.cos(rad(s.h)),fy=Math.sin(rad(s.h)),nx=s.x+fx*100,ny=s.y+fy*100,dx=s.per.x-nx,dy=s.per.y-ny,al=dx*fx+dy*fy,la=Math.abs(-dx*fy+dy*fx);if(al>0&&la<170)return Math.max(al-150,0);return 9999},
  snap(s){const st=s.st;return{hoist:st.hoist,kit:st.kit,kitPos:st.kitPos,per:[s.per.x,s.per.y],bear:persBear(s),tof:s.tofLast,tofT:s.tofT||-9,beep:(s.t-(s.tofT||-9)<0.15)?s.tofLast*10:null,sv:[st.hoist*60],pv:s.pvT&&s.t-s.pvT<0.15?s.pvV:false}},
  chart:{series:[{label:"TOF reading (cm)",get:s=>(s.t-(s.tofT||-9)<0.06&&s.tofLast!==undefined)?s.tofLast:null}],ymax:200,unit:"cm",line:[30,"STOP_CM 30"]},
  drag:s=>[{id:"person",x:s.per.x,y:s.per.y,r:200}],
  setPos(s,id,x,y){s.per={x,y}},
  api:[...drv,
    {n:"person_visible",a:"",d:"True if the camera sees the person in its narrow ±8° view (up to 6 m). Each call takes 50 ms. Works about 95% of the time up close and 85% further away.",
     f:s=>{s.tick();const st=s.st;st.calls++;const b=Math.abs(persBear(s)),d=Math.hypot(s.per.x-s.x,s.per.y-s.y);let r=false;
       if(b<=FOVH&&d<=6000){st.inview++;const p=d<=2500?0.97:0.88;if(s.opts.noise===false||s.rnd()<p){r=true;st.hits++}}
       s.pvT=s.t;s.pvV=r;return r}},
    {n:"tof_distance_cm",a:"",d:"TOF distance ahead in cm (4 to 200). Each reading takes 50 ms.",
     f:s=>{s.tick();let d=this_T().tofTrue(s)/10;if(s.opts.noise!==false&&d<500)d+=(s.rnd()*2-1)*0.4;const r=d<4?0:(d>200?200:Math.round(d*10)/10);s.tofLast=r;s.tofT=s.t;s.st.tofReads++;return r}},
    {n:"hoist_lower",a:"",d:"Lower the medical kit on the hoist to the floor. Waits until it arrives (1 s).",f:s=>{s.st.hoistT=1;s.ev("lift");s.runFor(1.05)}},
    {n:"hoist_release",a:"",d:"Let go of the kit. Lower the hoist first, or the kit will drop and break.",
     f:s=>{const st=s.st;if(st.kit!=="carried")return;const fx=Math.cos(rad(s.h)),fy=Math.sin(rad(s.h));const ok=st.hoist>=0.95;const px=s.x+fx*(ok?330:240),py=s.y+fy*(ok?330:240);
       st.kit=ok?"delivered":"dropped";st.kitPos=[px,py];st.released=true;st.dropped=!ok;st.delivered=ok?Math.hypot(px-s.per.x,py-s.per.y):null;if(ok){s.ev("deliver");s.log("Kit placed on the floor "+Math.round(st.delivered)+" mm from the person.","sys")}else{s.ev("crush");s.log("The kit fell from the hoist and broke! Lower the hoist before releasing.","err")}}}],
  hud(f,s){const d=Math.hypot(f.per[0]-f.x,f.per[1]-f.y);return[["Robot time",f.t.toFixed(1)+" s"],["Person bearing",Math.round(f.bear)+"°"],["Distance",(d/1000).toFixed(2)+" m"],["Hoist",f.hoist<0.05?"up":(f.hoist>0.95?"down":"moving")],["Kit",f.kit]]},
  draw(ctx,f,H,s){
    const W=6800,Hh=2600;ctx.fillStyle=H.css("--floor");ctx.fillRect(0,0,W,Hh);H.grid(W,Hh,500);H.border(W,Hh);
    H.cone(f.x,f.y,f.h,FOVH*2,6000,"rgba(31,182,229,.45)");
    ctx.fillStyle="rgba(46,160,90,.18)";ctx.beginPath();ctx.arc(f.per[0],f.per[1],300,0,7);ctx.fill();ctx.strokeStyle="#1b8a4b";ctx.setLineDash([16,12]);ctx.lineWidth=6;ctx.stroke();ctx.setLineDash([]);H.text("300 mm delivery circle",f.per[0],f.per[1]-330,18,"#1b8a4b","center");
    ctx.fillStyle="#e8b04b";ctx.beginPath();ctx.arc(f.per[0],f.per[1],110,0,7);ctx.fill();ctx.fillStyle="#2e5f9a";ctx.beginPath();ctx.arc(f.per[0],f.per[1]-135,50,0,7);ctx.fill();ctx.fillStyle="#fff";ctx.fillRect(f.per[0]-8,f.per[1]-30,16,60);ctx.fillRect(f.per[0]-30,f.per[1]-8,60,16);H.text("PERSON",f.per[0],f.per[1]+170,18,H.css("--ink"),"center");
    H.trail(s,f.t,"#f26a21",6);
    H.robot(f.x,f.y,f.h,{});
    if(f.kit==="carried"){ctx.save();ctx.translate(f.x,f.y);ctx.rotate(rad(f.h));const e=f.hoist*230;ctx.fillStyle="#d9382c";ctx.fillRect(-40+e,-40,80,80);ctx.fillStyle="#fff";ctx.fillRect(-8+e,-26,16,52);ctx.fillRect(-26+e,-8,52,16);ctx.strokeStyle="#111";ctx.lineWidth=5;ctx.strokeRect(-40+e,-40,80,80);ctx.restore()}
    else if(f.kitPos){ctx.fillStyle=f.kit==="delivered"?"#d9382c":"#7a3a3a";ctx.fillRect(f.kitPos[0]-40,f.kitPos[1]-40,80,80);ctx.strokeStyle=f.kit==="delivered"?"#111":"#c4372a";ctx.lineWidth=6;ctx.strokeRect(f.kitPos[0]-40,f.kitPos[1]-40,80,80);H.text(f.kit==="delivered"?"kit":"broken",f.kitPos[0],f.kitPos[1]+8,14,"#fff","center")}
    if(f.pv){ctx.strokeStyle="#1b8a4b";ctx.lineWidth=8;ctx.beginPath();ctx.arc(f.per[0],f.per[1],160,0,7);ctx.stroke()}
  },
  checks(s){
    const st=s.st,out=[];const r=st.inview?st.hits/st.inview:null;
    out.push({t:"T1 Detect",b:"B1 7.2",ok:r!==null&&r>=0.8,d:st.inview===0?"The person was never in the camera's narrow view when your program looked. Turn to find them.":"Person detected "+st.hits+" of "+st.inview+" checks in view ("+Math.round(r*100)+"%, need 80%)."});
    let sd=st.stopD;const still=Math.abs(s.cmd.vx)+Math.abs(s.cmd.wz)===0;if(sd===null&&st.wasMoving&&still&&st.kit!=="dropped")sd=Math.max(0,Math.hypot(s.per.x-s.x,s.per.y-s.y)-150-100);
    out.push({t:"T2 Stop",b:"B1 7.1",ok:sd!==null&&sd>=200&&sd<=330&&s.crashes===0&&st.released,d:s.crashes?"The robot bumped the person.":(sd===null?"The robot never stopped near the person.":"Stopped "+Math.round(sd)+" mm from the person (target about 300 mm, within 200 to 330)."+(st.released?"":" Kit not released yet."))});
    out.push({t:"T3 Carry",b:"B1 7.1",ok:st.carried>=0.9*(s.d0-550)&&!(st.dropped&&st.kit!=="delivered")&&st.kit!=="dropped",d:st.kit==="dropped"?"The kit was dropped or broken.":(st.carried<0.9*(s.d0-550)?"The robot has carried the kit only "+(st.carried/1000).toFixed(1)+" m (needs about "+((s.d0-550)/1000).toFixed(1)+" m to reach the person).":"Carried the kit "+(st.carried/1000).toFixed(1)+" m without dropping it.")});
    out.push({t:"T4 Deliver",b:"B1 7.1",ok:st.delivered!==null&&st.delivered<=300,d:st.kit==="dropped"?"The kit was dropped, not delivered.":(st.delivered===null?"The kit has not been delivered.":"Kit landed "+Math.round(st.delivered)+" mm from the person (limit 300 mm).")});
    return out},
  tests:[1,2,3,4],
  examples:{
    v1:{label:"rescue_v1.py (Criterion C, Lesson 4)",code:`while True:
    if person_visible():
        drive_forward(20)
    else:
        turn_left(10)
`},
    v2:{label:"rescue_v2.py (Criterion C, Lesson 5)",code:`STOP_CM = 30
state = "SEARCH"
while state != "DONE":
    if state == "SEARCH":
        if person_visible(): state = "APPROACH"
        else: turn_left(10)
    elif state == "APPROACH":
        if tof_distance_cm() <= STOP_CM:
            stop(); state = "DELIVER"
        else: drive_forward(20)
    elif state == "DELIVER":
        hoist_lower(); sleep(2); hoist_release()
        state = "DONE"
stop()
`},
    centre:{label:"Improved: centre on the person first (works from any side)",code:`STOP_CM = 30
state = "SEARCH"
while state != "DONE":
    if state == "SEARCH":
        if person_visible():
            first = time()
            misses = 0
            while misses < 3:                # turn slowly until the person has left the view
                misses = 0 if person_visible() else misses + 1
                turn_left(5)
            width = time() - first - 0.15    # how long the person was in the cone
            turn_right(5)
            sleep(width / 2)                 # turn back to the middle of the cone
            stop()
            state = "APPROACH"
        else:
            turn_left(10)
    elif state == "APPROACH":
        if tof_distance_cm() <= STOP_CM:
            stop(); state = "DELIVER"
        else:
            drive_forward(20)
    elif state == "DELIVER":
        hoist_lower(); sleep(2); hoist_release()
        state = "DONE"
stop()
`,opts:{where:"left"}}
  }
});
function this_T(){return UGOT.topics["15"]}
})();
