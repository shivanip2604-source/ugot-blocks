(function(){
const U=UGOT,clamp=U.clamp,num=U.num,rad=U.rad;
const RY=900,SX=1300,PX=3000,ONSET=2300,END=3700,START=300;
const drv=U.apiDrive().filter(a=>["drive_forward","stop"].includes(a.n));
U.register({
  id:"13",name:"Safe Driving",emoji:"🚸",maxT:40,doneDelay:0.2,
  tagline:"Your Signal-Mast: the car reads a children sign and a traffic officer's Stop signal.",
  brief:`<p>The <strong>Signal-Mast</strong> design (B1 7.1) drives along a road. It must <strong>slow down</strong> when it recognises the <strong>children</strong> sign, then <strong>stop</strong> when the traffic officer raises an arm in the Stop signal, and must never stop when no signal is given.</p>
  <ol><li><code>sign_recognised("children")</code> works only within about 80 cm of the sign.</li><li><code>body_y(joint)</code> gives the height of a body joint in the image, or 0 if no body is seen. A raised arm has the shoulder lowest, then the elbow, then the hand highest (B1 5.2).</li><li>Stop within 200 mm of the signal and show "STOP" (B1 7.1).</li></ol>`,
  cfg:{world:{w:4000,h:1500},rad:100,mmps:9,degps:3},
  controls:[
    {id:"scn",type:"select",label:"Officer",def:"stop",options:[["stop","Gives the Stop signal"],["none","Arms down (no signal)"]]},
    {id:"sign",type:"check",label:"Children sign beside the road",def:true},
    {id:"noise",type:"check",label:"Camera noise",def:true}],
  init(s){s.x=START;s.y=RY;s.h=0;s.st={mode:false,txt:null,calls:0,signCalls:0,signHit:0,recT:null,recX:null,speedSamp:[],stopX:null,wasMoving:false,stopped:false,passed:false,falseStop:false,reads:0,onsetT:null}},
  pre(s){},
  step(s){const st=s.st,nose=s.x+100;
    if(s.opts.scn==="stop"&&nose>=ONSET&&st.onsetT===null){st.onsetT=s.t;s.ev("click");s.log("The officer raises an arm: STOP signal.","sys")}
    const mv=Math.abs(s.cmd.vx)>0;if(mv)st.wasMoving=true;
    if(st.recX!==null&&nose>=st.recX&&nose<=st.recX+500){st.speedSamp.push(Math.abs(s.cmd.vx)*(1))}
    if(!mv&&st.wasMoving&&st.stopX===null){st.stopX=nose;st.stopped=true}
    if(mv)st.stopX=null,st.stopped=false;
    if(nose>=PX-100)st.passed=true},
  onBump(s,why){},
  blocked(s,x,y){if(x+100>PX-60&&Math.abs(y-(RY-300))<200)return null;return null},
  done(s){const st=s.st,nose=s.x+100;if(st.stopped&&s.t>1&&st.wasMoving&&s.t>0.5&&Math.abs(s.cmd.vx)===0&&!(nose<5))return st.stopped?"The car stopped.":null;if(nose>=END-50)return"The car reached the end of the road."},
  signVis(s){const nose=s.x+100,d=SX-nose;return s.opts.sign!==false&&d>=50&&d<=800?d:null},
  bodyVis(s){const nose=s.x+100,fw=PX-nose;return fw>=430&&fw<=1500},
  snap(s){const st=s.st,nose=s.x+100;const sv=this.signVis(s);return{sign:sv,arm:s.opts.scn==="stop"&&nose>=ONSET,body:this.bodyVis(s),txt:st.txt,spd:Math.abs(s.cmd.vx)/10,onset:st.onsetT!==null}},
  chart:{series:[{label:"speed (cm/s)",get:s=>Math.abs(s.cmd.vx)/10}],ymin:0,ymax:50,unit:"cm/s",lines:[[30,"30 cm/s"]]},
  api:[...drv,
    {n:"switch_to_traffic_sign",a:"",d:"Turn on the camera's traffic-sign and body-pose recogniser.",f:s=>{s.st.mode=true}},
    {n:"sign_recognised",a:"name",d:"True if the camera recognises this sign right now (\"children\"). Printed signs are only readable within about 80 cm. Each call takes 50 ms.",
     f:(s,n)=>{s.tick();const st=s.st;const d=this_T().signVis(s);if(d===null||String(n)!=="children")return false;
       st.signCalls++;const pr=d<=250?0.99:(d<=500?0.95:0.8);const ok=s.opts.noise===false||s.rnd()<pr;if(ok){st.signHit++;if(st.recT===null){st.recT=s.t;st.recX=s.x+100}}return ok}},
    {n:"display",a:"text",d:"Show text on the robot's screen.",f:(s,t)=>{s.st.txt=String(t)}},
    {n:"body_y",a:"joint",d:"Height (pixel row) of a body joint such as \"left_shoulder\", \"left_elbow\", \"left_hand\". 0 means no body is seen. Smaller numbers are higher in the image. Each call takes 50 ms.",
     f:(s,j)=>{s.tick();const st=s.st;st.reads++;if(!this_T().bodyVis(s)||!s.st.mode)return 0;
       const up=s.opts.scn==="stop"&&s.st.onsetT!==null&&s.t-s.st.onsetT>=0.2;const Y={left_shoulder:[300,300],left_elbow:[400,215],left_hand:[500,110]}[String(j)];if(!Y)return 0;
       const v=up?Y[1]:Y[0];return Math.round(v+(s.opts.noise===false?0:(s.rnd()*2-1)*8))}}],
  hud(f,s){return[["Robot time",f.t.toFixed(1)+" s"],["Speed",f.spd.toFixed(0)+" cm/s"],["Sign in range",f.sign===null?"no":(f.sign/10).toFixed(0)+" cm"],["Officer's arm",f.arm?"UP (Stop)":"down"],["Display",f.txt||"–"]]},
  draw(ctx,f,H,s){
    const W=4000,Hh=1500;ctx.fillStyle=H.css("--floor");ctx.fillRect(0,0,W,Hh);
    ctx.fillStyle="#58626d";ctx.fillRect(0,RY-260,W,520);ctx.strokeStyle="#f2f2f2";ctx.lineWidth=10;ctx.setLineDash([80,60]);ctx.beginPath();ctx.moveTo(0,RY);ctx.lineTo(W,RY);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle="#f2c230";ctx.lineWidth=12;[RY-260,RY+260].forEach(y=>{ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()});
    if(s.opts.sign!==false){ctx.fillStyle="rgba(46,160,90,.15)";ctx.fillRect(SX-800,RY-260,800,520);H.text("sign readable here",SX-790,RY+240,18,"#1b8a4b");
      ctx.fillStyle="#555";ctx.fillRect(SX-6,RY-520,12,260);ctx.fillStyle="#f2c230";ctx.beginPath();ctx.moveTo(SX,RY-760);ctx.lineTo(SX+130,RY-520);ctx.lineTo(SX-130,RY-520);ctx.closePath();ctx.fill();ctx.strokeStyle="#111";ctx.lineWidth=8;ctx.stroke();
      ctx.fillStyle="#111";ctx.beginPath();ctx.arc(SX-30,RY-650,16,0,7);ctx.arc(SX+35,RY-650,12,0,7);ctx.fill();ctx.fillRect(SX-38,RY-634,16,50);ctx.fillRect(SX+28,RY-638,14,44);H.text("CHILDREN",SX,RY-780,20,H.css("--ink"),"center")}
    // officer
    const ox=PX,oy=RY-440;ctx.fillStyle="#2e5f9a";ctx.beginPath();ctx.arc(ox,oy,62,0,7);ctx.fill();ctx.fillStyle="#e8b04b";ctx.beginPath();ctx.arc(ox,oy-8,36,0,7);ctx.fill();
    ctx.strokeStyle="#2e5f9a";ctx.lineWidth=22;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+(f.arm?0:50),oy+(f.arm?-170:70));ctx.stroke();
    H.text(f.arm?"STOP signal":"officer",ox,oy-210,20,f.arm?"#c4372a":H.css("--ink"),"center");
    ctx.strokeStyle="rgba(196,55,42,.5)";ctx.setLineDash([16,12]);ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(ONSET,RY-300);ctx.lineTo(ONSET,RY+300);ctx.stroke();ctx.beginPath();ctx.moveTo(ONSET+200,RY-300);ctx.lineTo(ONSET+200,RY+300);ctx.stroke();ctx.setLineDash([]);
    H.text("signal",ONSET-60,RY+300,16,"#c4372a");H.text("+200 mm limit",ONSET+30,RY+330,16,"#c4372a");
    H.robot(f.x,f.y,f.h,{});
    if(f.txt)H.text(f.txt,f.x,f.y-130,30,f.txt==="STOP"?"#c4372a":"#c98a00","center");
  },
  checks(s){
    const st=s.st,out=[];const r=st.signCalls?st.signHit/st.signCalls:null;
    out.push({t:"T1 Sign read",b:"B1 7.1",ok:r!==null&&r>=0.8,d:s.opts.sign===false?"Switch the children sign on to test this.":(st.signCalls===0?"The sign was never in range when your program checked it (readable within 80 cm).":"Sign recognised "+st.signHit+" of "+st.signCalls+" checks in range ("+Math.round(r*100)+"%, need 80%).")});
    const sp=st.speedSamp.length?(st.speedSamp.reduce((a,b)=>a+b,0)/st.speedSamp.length)/10:null;
    out.push({t:"T2 Slow down",b:"B1 7.1",ok:sp!==null&&sp<30&&st.speedSamp.length>=20,d:sp===null?"The car never recognised the sign, so it never slowed down.":"Average speed over the 50 cm after recognising the sign: "+sp.toFixed(1)+" cm/s (need under 30)."});
    if(st.stopX===null&&st.wasMoving&&Math.abs(s.cmd.vx)===0)st.stopX=s.x+100;
    const travel=st.stopX!==null&&st.onsetT!==null?st.stopX-ONSET:null;
    out.push({t:"T3 Stop signal",b:"B1 7.1",ok:s.opts.scn==="stop"&&travel!==null&&travel<=200&&travel>=0,d:s.opts.scn!=="stop"?"Choose 'Gives the Stop signal' for this test.":(st.onsetT===null?"The signal was never given.":(travel===null?"The car never stopped for the signal"+(st.passed?" and drove past the officer.":"."):"Stopped "+Math.round(travel)+" mm after the signal (limit 200 mm)."))});
    if(st.stopX===null&&st.wasMoving&&Math.abs(s.cmd.vx)===0){st.stopped=true}
    const falseStop=s.opts.scn==="none"&&st.stopped&&s.x+100<END-120;
    out.push({t:"T4 No signal",b:"B1 7.1",ok:s.opts.scn==="none"&&st.wasMoving&&!falseStop&&s.x+100>=END-120,d:s.opts.scn!=="none"?"Choose 'Arms down (no signal)' for this test.":(falseStop?"False stop: the car stopped with no signal.":(s.x+100>=END-120?"No false stop: the car drove past with arms down.":"The car did not finish the road."))});
    return out},
  tests:[1,2,3,4],
  examples:{
    v1:{label:"signs_v1.py (Criterion C, Lesson 4)",code:`switch_to_traffic_sign()
drive_forward(40)
while True:
    if sign_recognised("children"):
        drive_forward(30)
        display("Take care of children")
`},
    v2:{label:"signs_v2.py (Criterion C, Lesson 5)",code:`NORMAL, SLOW = 40, 30
switch_to_traffic_sign()
drive_forward(NORMAL)
while True:
    if sign_recognised("children"):
        drive_forward(SLOW); display("Take care of children")
    else:
        drive_forward(NORMAL)
    sh_y, el_y, hd_y = body_y("left_shoulder"), body_y("left_elbow"), body_y("left_hand")
    if sh_y != 0 and (sh_y - el_y >= 50) and (el_y - hd_y >= 50):
        stop(); display("STOP"); break
`},
    v2none:{label:"v2 with the officer's arms down",code:`NORMAL, SLOW = 40, 30
switch_to_traffic_sign()
drive_forward(NORMAL)
while True:
    if sign_recognised("children"):
        drive_forward(SLOW); display("Take care of children")
    else:
        drive_forward(NORMAL)
    sh_y, el_y, hd_y = body_y("left_shoulder"), body_y("left_elbow"), body_y("left_hand")
    if sh_y != 0 and (sh_y - el_y >= 50) and (el_y - hd_y >= 50):
        stop(); display("STOP"); break
`,opts:{scn:"none"}}
  }
});
function this_T(){return UGOT.topics["13"]}
})();
