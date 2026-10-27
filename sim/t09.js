(function(){
const U=UGOT,clamp=U.clamp,num=U.num,rad=U.rad;
const ORDER=["red","blue","green","yellow","red","white","green","blue","yellow","red","blue","white","green","yellow","blue","red"];
const BIN={red:0,green:60,blue:120,yellow:180},COL={red:"#d9382c",green:"#2ea05a",blue:"#2a6fe0",yellow:"#f0c020",white:"#f4f4f4",none:"#556"};
const SLOT=2.5,PRES=2.0,T0=0.4;
const CONF={red:["yellow","yellow","green"],yellow:["red","green","red"],green:["blue","yellow","blue"],blue:["green","green","red"]};
function cardAt(s,t){const k=Math.floor((t-T0)/SLOT);if(k<0||k>=ORDER.length)return null;const o=(t-T0)-k*SLOT;if(o>PRES)return null;return k}
function condAt(s,k){const sc=s.opts.scn;let dist=Number(s.opts.dist),dim=false;if(sc==="sweep")dist=k<5?10:(k<10?25:40);if(sc==="lamp")dim=k>=8;if(sc==="dim")dim=true;return{dist,dim}}
U.register({
  id:"09",name:"Colour Detective",emoji:"🎨",maxT:50,
  tagline:"Your Chroma-Carousel: a colour sensor reads each card and a servo points the chute at the right bin.",
  brief:`<p>The <strong>Chroma-Carousel</strong> design (B1 7.1) sorts coloured cards. Cards arrive one by one under the colour sensor. Your program reads the colour and turns the servo to the bin: <strong>red 0°, green 60°, blue 120°, yellow 180°</strong>. The card drops when its time under the sensor ends.</p>
  <ol><li><code>read_colour()</code> returns a colour name and can be wrong, especially in dim light or at the wrong distance (B1 7.2).</li><li>Take several readings and use <code>most_common()</code> to filter noise.</li><li>Cards that are not red, green, blue or yellow (white) must not be forced into a bin.</li></ol>`,
  cfg:{world:{w:1800,h:1200},rad:100,mmps:5,degps:3},
  controls:[
    {id:"scn",type:"select",label:"Test",def:"norm",options:[["norm","Normal: 25 mm, bright"],["sweep","Distance sweep: 10, 25, 40 mm"],["lamp","Lamp switches off after 8 cards"],["dim","Dim room all the time"]]},
    {id:"dist",type:"select",label:"Card distance",def:"25",options:[["10","10 mm"],["25","25 mm"],["40","40 mm"]]},
    {id:"noise",type:"check",label:"Sensor noise",def:true}],
  init(s){s.x=-500;s.y=-500;s.h=0;s.st={servo:0,servoT:0,reads:[],recent:[],cards:ORDER.map((c,k)=>({c,k,reads:[],bin:null,ok:null,drop:false})),dropped:0,okN:0,done:false,lastRead:null,tally:{red:[0,0],green:[0,0],blue:[0,0],yellow:[0,0]}}},
  pre(s){},
  step(s){const st=s.st;st.servo+=clamp(st.servoT-st.servo,-400*U.DT,400*U.DT);
    ORDER.forEach((c,k)=>{const cd=st.cards[k];if(!cd.drop&&s.t>=T0+k*SLOT+PRES-1e-9){cd.drop=true;cd.dropT=s.t;cd.servoAt=st.servo;st.dropped++;
      if(c==="white"){cd.ok=null;cd.bin="tray";s.ev("click")}
      else{const want=BIN[c];cd.ok=Math.abs(st.servo-want)<=8;let bin=null;for(const [n,a] of Object.entries(BIN))if(Math.abs(st.servo-a)<=8)bin=n;cd.bin=bin||"missed";
        if(cd.ok){st.okN++;st.tally[c][0]++;s.ev("sort");}else{if(bin)st.tally[bin][1]++;s.ev("bad");s.log("Card "+(k+1)+" ("+c+") went to "+(bin||"no bin")+": wrong.","err")}}}});
    if(!st.done&&s.t>=T0+ORDER.length*SLOT){st.done=true}},
  done(s){if(s.st.done)return"All "+ORDER.length+" cards have passed the sensor."},
  snap(s){const st=s.st,k=cardAt(s,s.t);let sl=null;if(k!==null)sl=[k,ORDER[k],(s.t-T0)-k*SLOT];return{sv:[st.servo],servo:st.servo,card:sl,cond:k!==null?condAt(s,k):null,recent:st.recent.slice(-14),tally:JSON.parse(JSON.stringify(st.tally)),okN:st.okN,dropped:st.dropped,drops:st.cards.filter(c=>c.drop&&s.t-c.dropT<0.5).map(c=>[c.c,c.ok,s.t-c.dropT,c.servoAt])}},
  chart:{series:[{label:"servo angle (°)",get:s=>s.st.servo}],ymin:0,ymax:180,unit:"°",lines:[[0,"red 0"],[60,"green 60"],[120,"blue 120"],[180,"yellow 180"]]},
  api:[{n:"read_colour",a:"",d:"Name of the colour under the sensor: \"red\", \"green\", \"blue\", \"yellow\", \"white\" or \"none\" when no card is there. Each reading takes 50 ms and can be wrong in dim light or at the wrong distance.",
     f:s=>{s.tick();const st=s.st,k=cardAt(s,s.t);let r="none";
       if(k!==null){const c=ORDER[k],cd=condAt(s,k);r=c;
         if(c!=="white"){let pc=0.97;if(cd.dim)pc=0.8;if(cd.dist===10)pc-=0.04;if(cd.dist===40)pc-=0.1;if(s.opts.noise===false)pc=1;
           if(s.rnd()>pc){const o=CONF[c];r=o[Math.floor(s.rnd()*o.length)]}}
         st.cards[k].reads.push(r);const dim=cd.dim;st.reads.push({k,t:s.t,ok:r===c,dim,dist:cd.dist})}
       st.recent.push(r);st.lastRead=r;return r}},
    {n:"servo_to",a:"angle",d:"Turn the servo to this angle (0 to 180°). It moves at 400°/s and your program carries on straight away.",f:(s,a)=>{s.st.servoT=clamp(num(a,0),0,180)}}],
  hud(f,s){return[["Robot time",f.t.toFixed(1)+" s"],["Card",f.card?(f.card[0]+1)+" of "+ORDER.length:"–"],["Servo",f.servo.toFixed(0)+"°"],["Sorted right",f.okN+" of "+f.dropped],["Light",f.cond?(f.cond.dim?"dim":"bright")+", "+f.cond.dist+" mm":"–"]]},
  insetTitle:"Last 14 readings from read_colour()",
  inset(ix,f,w,h){
    ix.fillStyle="#1c2a38";ix.fillRect(0,0,w,h);const n=14,cw=w/n;
    f.recent.forEach((c,i)=>{const x=i*cw+cw/2,y=h/2;ix.fillStyle=COL[c]||"#556";ix.beginPath();ix.arc(x,y,cw*0.36,0,7);ix.fill();ix.strokeStyle="rgba(255,255,255,.4)";ix.stroke();ix.fillStyle="#fff";ix.font="10px system-ui";ix.textAlign="center";ix.fillText(c,x,y+cw*0.36+14)});
    ix.textAlign="left";ix.fillStyle="#9bb0c4";ix.font="13px system-ui";ix.fillText("Wrong readings jump to a similar colour.",10,22);
    if(f.card){ix.fillStyle="#fff";ix.fillText("Real card: "+f.card[1],10,h-12)}
  },
  draw(ctx,f,H,s){
    const W=1800,Hh=1200;ctx.fillStyle=H.css("--floor");ctx.fillRect(0,0,W,Hh);ctx.strokeStyle=H.css("--grid");ctx.lineWidth=2;
    // feeder
    ctx.fillStyle="#3a4756";ctx.fillRect(60,540,520,120);H.text("CARD FEEDER",70,700,18,H.css("--muted"));
    const sx=330,sy=600;ctx.fillStyle="#222d38";ctx.fillRect(sx-60,330,120,110);ctx.fillStyle="#1fb6e5";ctx.fillRect(sx-14,440,28,20);
    const cond=f.cond||{dist:Number(s.opts.dist),dim:false},gap=cond.dist*2.2;
    if(f.card){const col=COL[f.card[1]];ctx.fillStyle="rgba(31,182,229,.25)";ctx.beginPath();ctx.moveTo(sx-14,460);ctx.lineTo(sx+14,460);ctx.lineTo(sx+40,540);ctx.lineTo(sx-40,540);ctx.fill();
      ctx.fillStyle=col;ctx.fillRect(sx-80,540,160,100);ctx.strokeStyle="#111";ctx.lineWidth=4;ctx.strokeRect(sx-80,540,160,100);H.text("card "+(f.card[0]+1)+": "+f.card[1],sx,680,20,H.css("--ink"),"center")}
    H.text("colour sensor",sx,320,18,H.css("--ink"),"center");H.text("distance "+cond.dist+" mm"+(cond.dim?"  · DIM":""),sx,740,18,cond.dim?"#c98a00":H.css("--muted"),"center");
    if(cond.dim){ctx.fillStyle="rgba(10,20,40,.25)";ctx.fillRect(0,0,W,Hh)}
    // chute + hub
    const hx=1000,hy=600,R=470;ctx.strokeStyle="#3a4756";ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(580,600);ctx.lineTo(hx,hy);ctx.stroke();
    for(const [n,a] of Object.entries(BIN)){const d=rad(-90+a),bx=hx+Math.cos(d)*R,by=hy+Math.sin(d)*R;ctx.fillStyle=COL[n];ctx.globalAlpha=.85;ctx.beginPath();ctx.roundRect(bx-90,by-60,180,120,14);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle="#111";ctx.lineWidth=3;ctx.stroke();
      H.text(n.toUpperCase()+" "+a+"°",bx,by-12,17,n==="yellow"||n==="white"?"#222":"#fff","center");H.text("✔ "+f.tally[n][0]+"   ✘ "+f.tally[n][1],bx,by+22,17,n==="yellow"?"#222":"#fff","center")}
    const d=rad(-90+f.servo);ctx.strokeStyle="#ff7a21";ctx.lineWidth=22;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(hx+Math.cos(d)*330,hy+Math.sin(d)*330);ctx.stroke();ctx.fillStyle="#14263a";ctx.beginPath();ctx.arc(hx,hy,48,0,7);ctx.fill();H.text(Math.round(f.servo)+"°",hx,hy+7,20,"#fff","center");
    for(const dr of f.drops){const col=COL[dr[0]],tt=dr[2]/0.5;const ang=rad(-90+dr[3]);const px=dr[0]==="white"?hx:hx+Math.cos(ang)*R*tt,py=dr[0]==="white"?hy+tt*600:hy+Math.sin(ang)*R*tt;ctx.fillStyle=col;ctx.fillRect(px-40,py-25,80,50);ctx.strokeStyle=dr[1]===false?"#c4372a":"#111";ctx.lineWidth=5;ctx.strokeRect(px-40,py-25,80,50)}
    H.text("Score: "+f.okN+" correct of "+f.dropped+" dropped",W/2,60,24,H.css("--ink"),"center");
  },
  checks(s){
    const st=s.st,out=[];const R=st.reads.filter(r=>!r.dim&&r.dist===25);
    const acc=R.length?R.filter(r=>r.ok).length/R.length:null;
    out.push({t:"T1 Colour accuracy",b:"B1 7.1",ok:acc!==null&&acc>=0.9,d:acc===null?"No readings at 25 mm in bright light yet. Run the 'Normal' test.":"read_colour() was right on "+R.filter(r=>r.ok).length+" of "+R.length+" readings at 25 mm in bright light ("+Math.round(acc*100)+"%, need 90%)."});
    const bad=[];const dists=new Set();for(const cd of st.cards){if(cd.c==="white"||cd.reads.length<3)continue;const cnt={};cd.reads.forEach(r=>cnt[r]=(cnt[r]||0)+1);const top=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0][0];dists.add(condAt(s,cd.k).dist);if(top!==cd.c)bad.push((cd.k+1));}
    out.push({t:"T2 Distance",b:"B1 7.1",ok:dists.size>0&&bad.length===0,d:dists.size===0?"Your program has not read any card yet.":("Most common reading matched the card at "+[...dists].sort((a,b)=>a-b).join(", ")+" mm"+(bad.length?" except cards "+bad.join(", "):"")+"."+(dists.size<3?" (Run the 'Distance sweep' test to cover 10, 25 and 40 mm.)":""))});
    const ph=(dimv)=>{const cs=st.cards.filter(c=>c.c!=="white"&&c.drop&&condAt(s,c.k).dim===dimv);return cs.length?cs.filter(c=>c.ok).length/cs.length:null};
    const b=ph(false),d=ph(true);
    out.push({t:"T3 Light change",b:"B1 7.2",ok:b!==null&&d!==null&&Math.abs(b-d)<0.1,d:(b===null||d===null)?"Run the 'Lamp switches off' test to compare bright and dim light.":"Cards sorted right: bright "+Math.round(b*100)+"%, dim "+Math.round(d*100)+"% (change under 10 points needed)."});
    const col=st.cards.filter(c=>c.c!=="white");const done=col.filter(c=>c.drop);const okc=done.filter(c=>c.ok).length;
    out.push({t:"T4 Servo bin",b:"B1 7.1",ok:done.length===col.length&&okc===col.length,d:done.length===0?"No card has dropped yet.":okc+" of "+done.length+" coloured cards went to the correct bin"+(done.length<col.length?" (run finished early).":" (need all).")});
    return out},
  tests:[1,2,3,4],
  examples:{
    v1:{label:"sort_v1.py (Criterion C, Lesson 4)",code:`while True:
    c = read_colour()
    print(c)
    if c == "red":
        servo_to(0)
    elif c == "green":
        servo_to(60)
`},
    v2:{label:"sort_v2.py (Criterion C, Lesson 5)",code:`BINS = {"red": 0, "green": 60, "blue": 120, "yellow": 180}
while True:
    readings = [read_colour() for _ in range(5)]
    c = most_common(readings)
    if c in BINS:
        servo_to(BINS[c])
        print("Sorted", c)
    else:
        print("Unknown colour, no move")
`},
    lamp:{label:"v2 in a changing light (lamp off after 8 cards)",code:`BINS = {"red": 0, "green": 60, "blue": 120, "yellow": 180}
while True:
    readings = [read_colour() for _ in range(5)]
    c = most_common(readings)
    if c in BINS:
        servo_to(BINS[c])
        print("Sorted", c)
`,opts:{scn:"lamp"}}
  }
});
})();
