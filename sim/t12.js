(function(){
const U=UGOT,clamp=U.clamp,num=U.num,rad=U.rad;
const CODES="ABCABCCABBACBCAABC".split("");
const BIN={A:0,B:60,C:120},COL={A:"#d9382c",B:"#2a6fe0",C:"#2ea05a"};
const SLOT=3.2,T0=0.6,READ=0.4,DROPAT=2.6;
function arr(k){return T0+k*SLOT}
U.register({
  id:"12",name:"Smart Sorting",emoji:"📦",maxT:90,
  tagline:"Your Chute-Sorter: the camera scans each block's code and a servo gate sends it down the right chute.",
  brief:`<p>The <strong>Chute-Sorter</strong> design (B1 7.1) sorts labelled blocks on a belt into chutes. The camera reads the code on each block, and the servo gate must point at the right chute before the block reaches the end of the belt.</p>
  <ol><li><code>scan_code()</code> waits (up to 6 s) for the next block and returns its code, or <code>None</code> if it cannot read it.</li><li>Gate angles: <strong>A 0°, B 60°, C 120°</strong> (B1 5.2). Any other angle sends the block to the wrong place.</li><li>Count your blocks and handle unreadable codes safely.</li></ol>`,
  cfg:{world:{w:1800,h:1200},rad:100,mmps:5,degps:3},
  controls:[
    {id:"dist",type:"select",label:"Block distance from camera",def:"20",options:[["10","10 cm (too close, blurry)"],["20","20 cm"],["30","30 cm (far)"]]},
    {id:"noise",type:"check",label:"Dirty / unreadable codes",def:true}],
  init(s){s.x=-500;s.y=-500;s.h=0;s.st={gate:0,gateT:0,blocks:CODES.map((c,k)=>({c,k,scanned:false,scanT:null,read:null,gateSet:null,drop:false,ok:null,arr:arr(k),readable:null})),next:0,scans:0,scanOK:0,unread:0,tally:{A:[0,0],B:[0,0],C:[0,0]},gateAngles:[],done:false,okN:0,lastCode:null}},
  step(s){const st=s.st;st.gate+=clamp(st.gateT-st.gate,-360*U.DT,360*U.DT);
    st.blocks.forEach(b=>{if(!b.drop&&s.t>=b.arr+DROPAT){b.drop=true;b.servoAt=st.gate;const want=BIN[b.c];b.ok=Math.abs(st.gate-want)<=8;let bin=null;for(const [n,a] of Object.entries(BIN))if(Math.abs(st.gate-a)<=8)bin=n;b.bin=bin;
      if(b.ok){st.okN++;st.tally[b.c][0]++;s.ev("sort")}else{if(bin)st.tally[bin][1]++;s.ev("bad");s.log("Block "+(b.k+1)+" (code "+b.c+") went to "+(bin?"chute "+bin:"no chute")+": wrong.","err")}}});
    if(!st.done&&s.t>=arr(CODES.length-1)+DROPAT+0.2)st.done=true},
  done(s){if(s.st.done)return"All "+CODES.length+" blocks have been sorted."},
  snap(s){const st=s.st;return{sv:[st.gate],gate:st.gate,blocks:st.blocks.map(b=>[b.c,s.t-b.arr,b.drop,b.ok,b.bin,b.servoAt]),tally:JSON.parse(JSON.stringify(st.tally)),okN:st.okN,dropped:st.blocks.filter(b=>b.drop).length,lastCode:st.lastCode,scanning:s.scanWait||false}},
  chart:{series:[{label:"gate angle (°)",get:s=>s.st.gate}],ymin:0,ymax:180,unit:"°",lines:[[0,"A 0"],[60,"B 60"],[120,"C 120"]]},
  api:[{n:"scan_code",a:"",d:"Wait for the next block under the camera (up to 6 s) and return its code: \"A\", \"B\" or \"C\". Returns None if the code cannot be read or no block arrives. Reading takes 0.4 s.",
     f:s=>{const st=s.st,limit=s.t+6;
       while(true){const b=st.blocks.find(x=>!x.scanned&&s.t>=x.arr&&s.t<=x.arr+DROPAT-0.2);
         if(b){b.scanned=true;s.tick();s.runFor(READ);st.scans++;const d=Number(s.opts.dist);let pu=d===10?0.06:(d===20?0.015:0.14);if(s.opts.noise===false)pu=0;
           const rd=s.rnd()>=pu;b.readable=rd;b.scanT=s.t;b.read=rd?b.c:null;st.lastCode=b.read;if(rd)st.scanOK++;else{st.unread++}return b.read}
         if(s.t>=limit)return null;s.tick()}}},
    {n:"gate_to",a:"angle",d:"Turn the servo gate to this angle (0 to 180°). It moves at 360°/s and your program carries on straight away.",f:(s,a)=>{const g=clamp(num(a,0),0,180);s.st.gateT=g;s.st.gateAngles.push(g);for(const b of s.st.blocks)if(b.scanned&&!b.drop&&b.gateSet===null)b.gateSet=s.t}}],
  hud(f,s){return[["Robot time",f.t.toFixed(1)+" s"],["Blocks dropped",f.dropped+" of "+CODES.length],["Sorted right",f.okN+" of "+f.dropped],["Gate",f.gate.toFixed(0)+"°"],["Last code",f.lastCode===null?"–":f.lastCode]]},
  draw(ctx,f,H,s){
    const W=1800,Hh=1200;ctx.fillStyle=H.css("--floor");ctx.fillRect(0,0,W,Hh);
    ctx.fillStyle="#2a3440";ctx.fillRect(100,520,900,120);ctx.strokeStyle="#58687a";ctx.lineWidth=4;for(let x=100;x<1000;x+=60){ctx.beginPath();ctx.moveTo(x+((f.t*120)%60),520);ctx.lineTo(x+((f.t*120)%60),640);ctx.stroke()}
    H.text("CONVEYOR",110,690,18,H.css("--muted"));
    ctx.fillStyle="#222d38";ctx.fillRect(480,330,130,110);ctx.fillStyle="#1fb6e5";ctx.fillRect(536,440,18,22);H.text("camera + scan zone",545,310,18,H.css("--ink"),"center");
    ctx.fillStyle="rgba(31,182,229,.18)";ctx.fillRect(470,470,150,50);
    const hx=1050,hy=580;
    for(const [n,a] of Object.entries(BIN)){const d=rad(a-60),L=500,bx=hx+Math.cos(d)*L,by=hy+Math.sin(d)*L;ctx.strokeStyle="#3a4756";ctx.lineWidth=70;ctx.lineCap="butt";ctx.beginPath();ctx.moveTo(hx+Math.cos(d)*100,hy+Math.sin(d)*100);ctx.lineTo(bx,by);ctx.stroke();
      ctx.fillStyle=COL[n];ctx.globalAlpha=.85;ctx.beginPath();ctx.arc(bx+Math.cos(d)*50,by+Math.sin(d)*50,70,0,7);ctx.fill();ctx.globalAlpha=1;H.text(n,bx+Math.cos(d)*50,by+Math.sin(d)*50+10,34,"#fff","center");
      H.text("chute "+n+" ("+a+"°)  ✔"+f.tally[n][0]+" ✘"+f.tally[n][1],bx+Math.cos(d)*50,by+Math.sin(d)*50+(a===0?-100:100),16,H.css("--ink"),"center")}
    const g=rad(f.gate-60);ctx.strokeStyle="#ff7a21";ctx.lineWidth=26;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx+Math.cos(g)*130,hy+Math.sin(g)*130);ctx.stroke();ctx.fillStyle="#14263a";ctx.beginPath();ctx.arc(hx,hy,40,0,7);ctx.fill();H.text(Math.round(f.gate)+"°",hx,hy+6,16,"#fff","center");
    for(const b of f.blocks){const el=b[1];if(el<0||b[2]&&el>s&&false)continue;
      if(el<0)continue;
      let x,y;if(!b[2]){x=100+el/2.6*(hx-100-40);y=580}else{const t2=el-2.6;if(t2>0.9)continue;const ang=rad(b[5]-60),L=500*Math.min(1,t2/0.8);x=hx+Math.cos(ang)*L;y=hy+Math.sin(ang)*L}
      ctx.fillStyle=COL[b[0]];ctx.fillRect(x-35,y-35,70,70);ctx.strokeStyle=b[2]&&b[3]===false?"#c4372a":"#111";ctx.lineWidth=5;ctx.strokeRect(x-35,y-35,70,70);H.text(b[0],x,y+11,30,"#fff","center")}
    H.text("Score: "+f.okN+" correct of "+f.dropped+" dropped",W/2,70,24,H.css("--ink"),"center");
  },
  checks(s){
    const st=s.st,out=[];const sc=st.scans;
    out.push({t:"T1 Scan accuracy",b:"B1 7.1",ok:sc>0&&st.scanOK/sc>=0.9,d:sc===0?"Your program never called scan_code().":"Code read correctly "+st.scanOK+" of "+sc+" scans ("+Math.round(st.scanOK/sc*100)+"%, need 90% at 20 cm)."});
    const ga=[...new Set(st.gateAngles)],bad=ga.filter(a=>![0,60,120].includes(a));
    out.push({t:"T2 Gate angle",b:"B1 5.2",ok:ga.length>=3&&bad.length===0,d:ga.length===0?"Your program never moved the gate.":("Gate angles used: "+ga.sort((a,b)=>a-b).join(", ")+"°."+(bad.length?" Chute angles are 0, 60 and 120 only (not "+bad.join(", ")+").":(ga.length<3?" Only "+ga.length+" of 3 chutes were used.":" All three chutes reached.")))});
    const dd=st.blocks.filter(b=>b.drop),okp=dd.length?st.okN/dd.length:null;
    out.push({t:"T3 Sort accuracy",b:"B1 7.1",ok:dd.length===CODES.length&&okp>=0.9,d:dd.length===0?"No block has reached the end of the belt yet.":st.okN+" of "+dd.length+" blocks in the right chute ("+Math.round(okp*100)+"%, need 90%)."+(dd.length<CODES.length?" Run until all "+CODES.length+" blocks are done.":"")});
    const ts=st.blocks.filter(b=>b.scanned&&b.gateSet!==null&&b.ok).map(b=>b.gateSet-b.arr);const mx=ts.length?Math.max(...ts):null;
    out.push({t:"T4 Speed",b:"B1 7.1",ok:mx!==null&&mx<=5,d:mx===null?"No block was sorted correctly, so speed cannot be measured.":"Slowest block: "+mx.toFixed(1)+" s from arriving to the gate set (limit 5 s)."});
    return out},
  tests:[1,2,3,4],
  examples:{
    v1:{label:"sort_v1.py (Criterion C, Lesson 4)",code:`while True:
    code = scan_code()
    if code == "A":
        gate_to(0)
    elif code == "B":
        gate_to(90)
`},
    v2:{label:"sort_v2.py (Criterion C, Lesson 5)",code:`BIN_ANGLE = {"A": 0, "B": 60, "C": 120}
counts = {"A": 0, "B": 0, "C": 0}
while True:
    code = scan_code()
    if code in BIN_ANGLE:
        gate_to(BIN_ANGLE[code])
        sleep(0.5)
        counts[code] += 1
        print(code, counts)
    else:
        print("Unreadable, hold for the operator")
`}
  }
});
})();
