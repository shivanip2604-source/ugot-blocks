(function(){
const U=UGOT,clamp=U.clamp,num=U.num,normA=U.normA,rad=U.rad,deg=U.deg;
const mec=U.apiMecanum().filter(a=>["shift_x","rotate_z"].includes(a.n));
const FOV=60,RX=1600,RY=1800;
function cam(s){const fx=Math.cos(rad(s.h)),fy=Math.sin(rad(s.h)),out=[];
  for(const p of s.plates){const dx=p.x-s.x,dy=p.y-s.y,fw=dx*fx+dy*fy,la=-dx*fy+dy*fx;if(fw<=60)continue;const b=deg(Math.atan2(la,fw)),d=Math.hypot(dx,dy);if(Math.abs(b)<=FOV/2&&d<=1300)out.push({p,b,d,x:320+b/(FOV/2)*320})}return out}
U.register({
  id:"08",name:"Tracking and Tracing",emoji:"🔢",maxT:45,
  tagline:"Your Line-Wing: the camera reads number plates and the car slides to keep the right one centred.",
  brief:`<p>The <strong>Line-Wing</strong> design (B1 7.1) uses the camera's plate recogniser to <strong>track plate D12345</strong>, ignore other plates, and keep it in the centre of the image (X between 210 and 430 out of 640) while the plate moves.</p>
  <ol><li><code>plate_results()</code> lists the plate texts the camera reads right now.</li><li><code>plate_centre_x()</code> gives the plate's X position in the image (0 to 640).</li><li>Show a <strong>green light only</strong> when the right plate is read <em>and</em> centred (use AND, B1 5.2).</li></ol>`,
  cfg:{world:{w:3600,h:2200},rad:100,mmps:15,degps:6,mecanum:true},
  controls:[
    {id:"scn",type:"select",label:"Plate",def:"left",options:[["left","Stands to the left (turn to find it)"],["centre","Stands straight ahead"],["right","Stands to the right"],["move","Moves along a 2 m path (follow it)"]]},
    {id:"dist",type:"select",label:"Distance",def:"400",options:[["200","20 cm"],["400","40 cm"],["800","80 cm"]]},
    {id:"noise",type:"check",label:"Camera noise and similar-plate mix-ups",def:true}],
  init(s){const p=s.opts.pos||{};s.x=RX;s.y=RY;s.h=-90;const d=Number(s.opts.dist),sc=s.opts.scn;
    const lat={left:-0.62*d,centre:0,right:0.62*d,move:-1000}[sc];
    const tx=p.target?p.target[0]:RX+lat,ty=p.target?p.target[1]:RY-d-20;
    s.plates=[{t:"D12345",x:tx,y:ty,target:true},{t:"D12354",x:tx+420,y:ty,target:false},{t:"B55555",x:tx-520,y:ty-60,target:false}];
    s.st={calls:0,seen:0,read:0,greens:[],wrongGreen:0,losses:0,wasIn:false,everSeen:false,xs:[],led:null,centredT:0,movedT:0}},
  pre(s){if(s.opts.scn==="move"&&s.t>=1&&s.t<=21){const dx=100*U.DT;s.plates.forEach(p=>p.x+=dx)}},
  step(s){const st=s.st,v=cam(s),tIn=v.some(c=>c.p.target);
    if(st.everSeen&&st.wasIn&&!tIn)st.losses++;if(tIn)st.everSeen=true;st.wasIn=tIn;
    const t=v.find(c=>c.p.target);if(t&&t.x>=210&&t.x<=430&&Math.hypot(s.cmd.vx,s.cmd.vy)===0&&s.cmd.wz===0)st.centredT+=U.DT;else st.centredT=0;
    if(s.opts.scn==="move"&&s.t>=22)st.movedT=1;},
  done(s){const st=s.st;if(s.opts.scn==="move"){if(s.t>=24)return"The plate reached the end of its path."}else if(st.centredT>=2)return"Plate D12345 is centred and the robot is holding it."},
  snap(s){const v=cam(s);return{pl:s.plates.map(p=>[p.x,p.y,p.t,p.target]),vis:v.map(c=>[c.p.t,c.x,c.d,c.p.target]),led:s.st.led,x0:(s.xT===s.t?s.xV:undefined),rd:s.rdT&&s.t-s.rdT<0.3?s.rdV:null}},
  chart:{series:[{label:"plate_centre_x()",get:s=>(s.t-(s.xT||-9)<0.06&&s.xV!==null&&s.xV!==undefined)?s.xV:null}],ymin:0,ymax:640,unit:"px",lines:[[210,"210"],[430,"430"]]},
  drag:s=>[{id:"target",x:s.plates[0].x,y:s.plates[0].y,r:130}],
  setPos(s,id,x,y){s.plates[0].x=x;s.plates[0].y=y;s.plates[1].x=x+420;s.plates[1].y=y;s.plates[2].x=x-520;s.plates[2].y=y-60},
  api:[...mec,
    {n:"switch_to_plate_recognition",a:"",d:"Turn on the camera's number-plate recogniser.",f:s=>{s.st.mode=true}},
    {n:"plate_results",a:"",d:"List of plate texts the camera reads right now, e.g. [\"D12345\"]. Empty list if none. Each call takes 50 ms. Reads worse the further away the plate is, and similar plates can be mixed up.",
     f:s=>{s.tick();const st=s.st;st.calls++;const out=[];const n=s.opts.noise!==false;
       for(const c of cam(s)){let pr=c.d<=300?0.99:(c.d<=500?0.95:(c.d<=900?0.78:0.45));
         if(c.p.target){st.seen++;if(!n||s.rnd()<pr){out.push(c.p.t);st.read++}}
         else{let mix=c.p.t==="D12354"?(c.d<=300?0:(c.d<=500?0.015:0.05)):0;if(n&&s.rnd()<mix){out.push("D12345");st.mixup=(st.mixup||0)+1}else if(!n||s.rnd()<pr)out.push(c.p.t)}}
       s.rdT=s.t;s.rdV=out;return out}},
    {n:"plate_centre_x",a:"",d:"X position of plate D12345 in the image: 0 (left edge) to 640 (right edge). Centre = 320. Returns None if the plate is not in view.",
     f:s=>{s.tick();const t=cam(s).find(c=>c.p.target);let x=null;if(t){x=Math.round(t.x+(s.opts.noise!==false?(s.rnd()*2-1)*3:0))}s.xT=s.t;s.xV=x;return x}},
    {n:"light",a:"colour",d:"Set the robot light: \"green\", \"red_flash\", \"off\"...",f:(s,c)=>{c=String(c);const st=s.st;
       if(c==="green"){const t=cam(s).find(q=>q.p.target);st.greens.push(t?t.x:null);if(!t)st.wrongGreen++}
       if(st.led!==c){if(c==="green")s.ev("good");else if(c==="red_flash")s.ev("click")}st.led=c}},
    {n:"stop",a:"",d:"Stop all wheels.",f:s=>s.setVel(0,0,0)}],
  hud(f,s){const t=f.vis.find(v=>v[3]);return[["Robot time",f.t.toFixed(1)+" s"],["Plate X",t?Math.round(t[1]):"not in view"],["Distance",t?(t[2]/10).toFixed(0)+" cm":"–"],["Light",f.led||"off"],["Plates seen",f.vis.map(v=>v[0]).join(", ")||"none"]]},
  insetTitle:"What the camera sees (640 px wide)",
  inset(ix,f,w,h,s){
    ix.fillStyle="#1c2a38";ix.fillRect(0,0,w,h);
    ix.fillStyle="rgba(79,207,132,.18)";ix.fillRect(210/640*w,0,220/640*w,h);ix.strokeStyle="rgba(79,207,132,.8)";ix.setLineDash([6,6]);[210,430].forEach(x=>{ix.beginPath();ix.moveTo(x/640*w,0);ix.lineTo(x/640*w,h);ix.stroke()});ix.setLineDash([]);
    ix.fillStyle="#9fd8b4";ix.font="12px system-ui";ix.fillText("centre zone 210–430",210/640*w+6,16);
    for(const v of f.vis){const x=v[1]/640*w,pw=clamp(520/v[2]*90,50,200),ph=pw*0.36;
      ix.fillStyle="#f4f1e0";ix.fillRect(x-pw/2,h/2-ph/2,pw,ph);ix.strokeStyle=v[3]?"#1b8a4b":"#6a7885";ix.lineWidth=v[3]?5:2;ix.strokeRect(x-pw/2,h/2-ph/2,pw,ph);
      ix.fillStyle="#222";ix.font="bold "+Math.round(ph*0.45)+"px system-ui";ix.textAlign="center";ix.fillText(v[0],x,h/2+ph*0.16);
      if(v[3]){ix.fillStyle="#fff";ix.font="12px system-ui";ix.fillText("x = "+Math.round(v[1]),x,h/2+ph/2+18)}}
    ix.textAlign="left";if(!f.vis.length){ix.fillStyle="#9bb0c4";ix.font="16px system-ui";ix.fillText("no plate in view",w/2-60,h/2)}
    ix.strokeStyle="rgba(255,255,255,.4)";ix.lineWidth=1;ix.strokeRect(1,1,w-2,h-2);
  },
  draw(ctx,f,H,s){
    const W=3600,Hh=2200;ctx.fillStyle=H.css("--floor");ctx.fillRect(0,0,W,Hh);H.grid(W,Hh,300);H.border(W,Hh);
    H.cone(f.x,f.y,f.h,FOV,1400,"rgba(31,182,229,.4)");
    H.trail(s,f.t,"#f26a21",7);
    for(const p of f.pl){const inV=f.vis.some(v=>v[0]===p[2]);ctx.fillStyle="#f4f1e0";ctx.fillRect(p[0]-110,p[1]-38,220,76);ctx.strokeStyle=p[3]?"#1b8a4b":"#6a7885";ctx.lineWidth=inV?9:4;ctx.strokeRect(p[0]-110,p[1]-38,220,76);H.text(p[2],p[0],p[1]+12,26,"#222","center")}
    if(s.opts.scn==="move"){ctx.strokeStyle="rgba(0,0,0,.2)";ctx.setLineDash([20,20]);ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(1000,f.pl[0][1]+90);ctx.lineTo(3100,f.pl[0][1]+90);ctx.stroke();ctx.setLineDash([])}
    H.robot(f.x,f.y,f.h,{led:f.led==="green"?"#2ea05a":(f.led==="red_flash"?"#e04a3a":"#5a6b7d")});
    if(f.led==="green"){ctx.fillStyle="rgba(46,160,90,.35)";ctx.beginPath();ctx.arc(f.x,f.y,170,0,7);ctx.fill()}
  },
  checks(s){
    const st=s.st,out=[];const rate=st.seen?st.read/st.seen:null;
    out.push({t:"T1 Plate read",b:"B1 7.2",ok:rate!==null&&rate>=0.8&&st.calls>0,d:st.seen===0?"Plate D12345 was never in the camera view when you read plates.":"D12345 read correctly "+st.read+" of "+st.seen+" times ("+Math.round(rate*100)+"%, need 80%)."});
    out.push({t:"T2 Wrong plate",b:"B1 7.1",ok:st.calls>0&&st.wrongGreen===0,d:st.calls===0?"Your program never called plate_results().":(st.wrongGreen===0?"No wrong green lights. Other plates ignored"+(st.mixup?" (even after "+st.mixup+" mix-up(s) of D12354).":"."):"Green light turned on "+st.wrongGreen+" time(s) when D12345 was not in view (a similar plate was mistaken).")});
    const bad=st.greens.filter(x=>x===null||x<190||x>450).length;
    out.push({t:"T3 Centre check",b:"B1 7.1",ok:st.greens.length>0&&bad===0,d:st.greens.length===0?"Your program never turned the green light on.":(bad===0?"Green light only when the plate was centred ("+st.greens.length+" times).":"Green light turned on "+bad+" of "+st.greens.length+" times while the plate was NOT centred (210 to 430, allowing 20 px for reading delay).")});
    out.push({t:"T4 Follow",b:"B1 7.1",ok:s.opts.scn==="move"&&st.everSeen&&st.losses<2,d:s.opts.scn!=="move"?"Choose the 'Moves along a 2 m path' plate to test following.":(!st.everSeen?"The plate was never found.":"Plate lost from view "+st.losses+" time(s) (need fewer than 2).")});
    return out},
  tests:[1,2,3,4],
  examples:{
    v1:{label:"plate_v1.py (Criterion C, Lesson 4)",code:`switch_to_plate_recognition()
while True:
    plates = plate_results()
    if "D12345" in plates:
        light("green")
    else:
        light("red_flash")
`},
    v2:{label:"track_v2.py (Criterion C, Lesson 5)",code:`switch_to_plate_recognition()
while True:
    if "D12345" in plate_results():
        x = plate_centre_x()
        if 210 <= x <= 430:        # AND: both conditions
            stop(); light("green")
        elif x < 210:
            shift_x(-10)
        else:
            shift_x(10)
    else:
        light("red_flash"); rotate_z(5)
`,opts:{scn:"move"}},
    sweep:{label:"Experiment: print what the camera reads",code:`switch_to_plate_recognition()
rotate_z(4)
for i in range(30):
    print(plate_results(), plate_centre_x())
    sleep(0.2)
stop()
`}
  }
});
})();
