/* Block coding for the UGOT pages. Adds a "Blocks / Python" switch above a Python editor.
   The blocks write Python into the same textarea, so the page's own Run button runs them unchanged.
   Python put into the textarea by the page (examples, starters) is turned back into blocks with Python's own parser.
   Needs Blockly (assets/blockly/) loaded first. Usage: UBlocks.attach({textarea:"code", api:[{n,a,d}], getPy, onCode}). */
(function(){
const BASE=((document.currentScript&&document.currentScript.src)||"").replace(/[^\/]*$/,"");
const UB=window.UBlocks={};
let G=null,O=null,common=false;
const COL={move:"#1f6fe5",sense:"#0e9aa7",act:"#f26a21",wait:"#c98a00",loops:"#5ba55b",logic:"#5b80a5",math:"#5b67a5",text:"#5ba58c",lists:"#745ba5",vars:"#a55b80",py:"#6b7785"};

/* ---------- robot functions -> block specs ---------- */
const TEXTY=/^(name|colour|color|text|note|kind|joint|label|message)$/;
const NUM_DEF={speed:30,seconds:1,angle:45,deg:90,mm:100,position:100};
const VAL_D=/^(True\b|Which|Where|Height|Colou?r|Name of|Tilt|List|X position|Odometry|The most likely|Wait for the next|Distance|Wheel encoder|TOF distance)/;
const VAL_N=/^(tof_|read_|gyro_|loudness|sound_direction|best_match|tag_|lane_offset|monorail_offset|plate_|person_visible|scan_code|odometer|button_pressed|body_y|face_recognised|recognised|sign_recognised|heading$|position$)/;
const MOVE_N=/^(drive|turn|translate|shift_x|rotate_z|stop$|move_mm)/;
const human=s=>s.replace(/_/g," ");
function parseArgs(s){return String(s||"").split(",").map(x=>x.trim()).filter(Boolean).map(x=>{const p=x.split("=").map(y=>y.trim());return{name:p[0],def:p.length>1?p[1]:null}})}
function quoted(d){return[...new Set([...String(d||"").matchAll(/"([^"]+)"/g)].map(m=>m[1]))]}
function firstLiteral(fn,ex){const m=new RegExp("\\b"+fn+"\\(\\s*\"([^\"]*)\"").exec(ex||"");return m?m[1]:null}
function buildSpec(api,ex){
  return(api||[]).filter(a=>!a.hide&&a.n!=="sleep"&&a.n!=="time").map(a=>{
    const d=a.d||"",value=VAL_N.test(a.n)||VAL_D.test(d),opts=quoted(d);
    const args=parseArgs(a.a).map((g,i)=>{
      const r={name:g.name,def:g.def};
      if(TEXTY.test(g.name)){
        let o=opts;if(g.name==="note"&&o.length<3)o=["C","D","E","F","G","A","B"];
        const lit=i===0?firstLiteral(a.n,ex):null;
        if(o.length>=2&&g.name!=="text"){if(lit&&!o.includes(lit))o=[lit,...o];r.opts=o;r.opt_type="ub_opt_"+a.n+"_"+i;r.shadow={type:r.opt_type,fields:{OPT:lit||o[0]}}}
        else r.shadow={type:"text",fields:{TEXT:lit||o[0]||(g.name==="text"?"Hello":"")}};
      }else if(g.def==="True"||g.def==="False")r.shadow={type:"logic_boolean",fields:{BOOL:g.def.toUpperCase()}};
      else if(g.def==="None")r.optional=true;
      else if(g.def!==null&&!isNaN(Number(g.def)))r.shadow={type:"math_number",fields:{NUM:Number(g.def)}};
      else r.shadow={type:"math_number",fields:{NUM:NUM_DEF[g.name]!==undefined?NUM_DEF[g.name]:0}};
      return r});
    return{n:a.n,d,value,bool:value&&/^True\b/.test(d),args,cat:value?"sense":(MOVE_N.test(a.n)?"move":"act")};
  });
}
function defineApi(spec){
  for(const f of spec){
    const type="ub_"+f.n;let msg=human(f.n);const args0=[];
    f.args.forEach((g,i)=>{msg+=" "+human(g.name)+" %"+(i+1);args0.push({type:"input_value",name:"A"+i})});
    const json={type,message0:msg,args0,inputsInline:true,colour:COL[f.cat],tooltip:f.d};
    if(f.value)json.output=f.bool?"Boolean":null;else{json.previousStatement=null;json.nextStatement=null}
    Blockly.Blocks[type]={init(){this.jsonInit(json)}};
    G.forBlock[type]=function(b,g){
      const parts=[];let kw=false;
      f.args.forEach((a,i)=>{const v=g.valueToCode(b,"A"+i,O.NONE);
        if(!v){if(a.optional){kw=true;return}parts.push((kw?a.name+"=":"")+(a.def||"None"));return}
        parts.push((kw?a.name+"=":"")+v)});
      const code=f.n+"("+parts.join(", ")+")";
      return f.value?[code,O.FUNCTION_CALL]:code+"\n"};
    f.args.forEach(a=>{if(!a.opts)return;
      Blockly.Blocks[a.opt_type]={init(){this.jsonInit({type:a.opt_type,message0:"%1",args0:[{type:"field_dropdown",name:"OPT",options:a.opts.map(o=>[o,o])}],output:"String",colour:COL[f.cat],tooltip:f.d})}};
      G.forBlock[a.opt_type]=(b,g)=>[g.quote_(b.getFieldValue("OPT")),O.ATOMIC]});
  }
}

/* ---------- blocks shared by every page ---------- */
function defineCommon(cfg){
  const def=(type,json,gen)=>{json.type=type;Blockly.Blocks[type]={init(){this.jsonInit(json)}};G.forBlock[type]=gen};
  const stmt={previousStatement:null,nextStatement:null};
  def("ub_forever",{message0:"repeat forever %1 %2",args0:[{type:"input_dummy"},{type:"input_statement",name:"DO"}],...stmt,colour:COL.loops,tooltip:"Keep doing the blocks inside, again and again. Python: while True:"},
    (b,g)=>"while True:\n"+(g.statementToCode(b,"DO")||g.PASS));
  const modTime=cfg.sleep==="module";
  const needTime=(c,g)=>{if(modTime&&/\btime\./.test(c))g.definitions_.import_time="import time"};
  def("ub_sleep",{message0:"wait %1 seconds",args0:[{type:"input_value",name:"S",check:"Number"}],inputsInline:true,...stmt,colour:COL.wait,tooltip:"Wait. Robot time passes."},
    (b,g)=>{if(modTime)g.definitions_.import_time="import time";return(modTime?"time.sleep(":"sleep(")+(g.valueToCode(b,"S",O.NONE)||"0")+")\n"});
  def("ub_time",{message0:"robot time (seconds)",output:"Number",colour:COL.wait,tooltip:"How many seconds since the program started."},
    (b,g)=>{if(modTime)g.definitions_.import_time="import time";return[modTime?"time.time()":"time()",O.FUNCTION_CALL]});
  def("ub_in",{message0:"%1 is in %2",args0:[{type:"input_value",name:"A"},{type:"input_value",name:"B"}],inputsInline:true,output:"Boolean",colour:COL.logic,tooltip:"True if the first thing is inside the list or text."},
    (b,g)=>[(g.valueToCode(b,"A",O.RELATIONAL)||"None")+" in "+(g.valueToCode(b,"B",O.RELATIONAL)||"[]"),O.RELATIONAL]);
  def("ub_isnone",{message0:"%1 %2",args0:[{type:"input_value",name:"A"},{type:"field_dropdown",name:"OP",options:[["is None (nothing)","IS"],["is not None","NOT"]]}],inputsInline:true,output:"Boolean",colour:COL.logic,tooltip:"Sensors answer None when they see nothing."},
    (b,g)=>[(g.valueToCode(b,"A",O.RELATIONAL)||"None")+(b.getFieldValue("OP")==="IS"?" is None":" is not None"),O.RELATIONAL]);
  def("ub_range",{message0:"numbers 0 to %1 − 1",args0:[{type:"input_value",name:"N",check:"Number"}],inputsInline:true,output:"Array",colour:COL.loops,tooltip:"range(n): the numbers 0, 1, 2 … up to n − 1."},
    (b,g)=>["range("+(g.valueToCode(b,"N",O.NONE)||"0")+")",O.FUNCTION_CALL]);
  def("ub_round2",{message0:"round %1 to %2 decimals",args0:[{type:"input_value",name:"NUM",check:"Number"},{type:"input_value",name:"DIGITS",check:"Number"}],inputsInline:true,output:"Number",colour:COL.math,tooltip:"round(x, n)"},
    (b,g)=>["round("+(g.valueToCode(b,"NUM",O.NONE)||"0")+", "+(g.valueToCode(b,"DIGITS",O.NONE)||"0")+")",O.FUNCTION_CALL]);
  [2,3,4].forEach(n=>{const a=[];let m="print";for(let i=0;i<n;i++){m+=" %"+(i+1);a.push({type:"input_value",name:"A"+i})}
    def("ub_print"+n,{message0:m,args0:a,inputsInline:true,...stmt,colour:COL.text,tooltip:"Show several things on one line in the console."},
      (b,g)=>{const v=[];for(let i=0;i<n;i++)v.push(g.valueToCode(b,"A"+i,O.NONE)||"''");return"print("+v.join(", ")+")\n"})});
  [["median","middle value (median) of"],["mean","average (mean) of"],["most_common","most common item in"]].forEach(([fn,label])=>
    def("ub_"+fn,{message0:label+" %1",args0:[{type:"input_value",name:"LIST"}],inputsInline:true,output:null,colour:COL.lists,tooltip:fn+"(list): helps filter noisy sensor readings."},
      (b,g)=>[fn+"("+(g.valueToCode(b,"LIST",O.NONE)||"[]")+")",O.FUNCTION_CALL]));
  def("ub_pystmt",{message0:"Python %1",args0:[{type:"field_multilinetext",name:"CODE",text:"print('hello')",spellcheck:false}],...stmt,colour:COL.py,tooltip:"Type any Python here. It runs exactly as written."},
    (b,g)=>{const c=b.getFieldValue("CODE")||"pass";needTime(c,g);return c.replace(/\s+$/,"")+"\n"});
  def("ub_pyexpr",{message0:"Python %1",args0:[{type:"field_input",name:"CODE",text:"x",spellcheck:false}],output:null,colour:COL.py,tooltip:"Any Python value or expression."},
    (b,g)=>{const c=b.getFieldValue("CODE")||"None";needTime(c,g);return[c,O.NONE]});
  // x += 1 reads better than Blockly's default for "change by"
  G.forBlock.math_change=function(b,g){const n=g.getVariableName(b.getFieldValue("VAR")),d=g.valueToCode(b,"DELTA",O.ADDITIVE)||"0";
    return /^-\d/.test(d)?n+" -= "+d.slice(1)+"\n":n+" += "+d+"\n"};
  G.INDENT="    ";
  const fin=G.finish;
  G.finish=function(code){if(this.definitions_)delete this.definitions_.variables;return fin.call(this,code)};
}

/* ---------- Python -> blocks (runs inside Pyodide) ---------- */
const CONV=String.raw`
import ast as _ub_ast, json as _ub_json
def _ub_convert(src, spec_json):
    ast=_ub_ast; spec=_ub_json.loads(spec_json); API=spec["api"]; HELP=set(spec["helpers"])
    try:
        tree=ast.parse(src)
    except SyntaxError as e:
        return _ub_json.dumps({"error":"line %s: %s"%(e.lineno,e.msg)})
    VARS={}; raw=[0]
    def var(n):
        if n not in VARS: VARS[n]="v%d_%s"%(len(VARS),n)
        return {"id":VARS[n]}
    def seg(node):
        s=ast.get_source_segment(src,node)
        if s is None: return ast.unparse(node)
        parts=s.split("\n"); out=[parts[0]]
        for p in parts[1:]:
            k=0
            while k<node.col_offset and k<len(p) and p[k] in " \t": k+=1
            out.append(p[k:])
        return "\n".join(out)
    def rs(node):
        raw[0]+=1; return {"type":"ub_pystmt","fields":{"CODE":seg(node)}}
    def rx(node):
        raw[0]+=1; return {"type":"ub_pyexpr","fields":{"CODE":ast.unparse(node)}}
    def inp(b):
        if b["type"] in ("math_number","text") or b["type"].startswith("ub_opt_"): return {"shadow":b}
        return {"block":b}
    def num(v): return {"type":"math_number","fields":{"NUM":v}}
    def isnum(n): return isinstance(n,ast.Constant) and isinstance(n.value,(int,float)) and not isinstance(n.value,bool)
    def cname(f):
        if isinstance(f,ast.Name): return f.id
        if isinstance(f,ast.Attribute) and isinstance(f.value,ast.Name) and f.value.id=="time": return "time."+f.attr
        return None
    CMP={ast.Eq:"EQ",ast.NotEq:"NEQ",ast.Lt:"LT",ast.LtE:"LTE",ast.Gt:"GT",ast.GtE:"GTE"}
    ARI={ast.Add:"ADD",ast.Sub:"MINUS",ast.Mult:"MULTIPLY",ast.Div:"DIVIDE",ast.Pow:"POWER"}
    def argx(a,n):
        if a.get("opts") and isinstance(n,ast.Constant) and n.value in a["opts"]:
            return {"type":a["opt_type"],"fields":{"OPT":n.value}}
        return expr(n)
    def apicall(name,n,want):
        a=API[name]
        if a["value"]!=want: return None
        names=[x["name"] for x in a["args"]]
        if len(n.args)>len(names): return None
        ins={}
        for i,x in enumerate(n.args):
            if isinstance(x,ast.Starred): return None
            ins["A%d"%i]=inp(argx(a["args"][i],x))
        for k in n.keywords:
            if k.arg not in names: return None
            i=names.index(k.arg); ins["A%d"%i]=inp(argx(a["args"][i],k.value))
        return {"type":"ub_"+name,"inputs":ins}
    def cmp1(l,op,r):
        t=type(op)
        if t in (ast.Is,ast.IsNot) and isinstance(r,ast.Constant) and r.value is None:
            return {"type":"ub_isnone","fields":{"OP":"IS" if t is ast.Is else "NOT"},"inputs":{"A":inp(expr(l))}}
        if t in CMP: return {"type":"logic_compare","fields":{"OP":CMP[t]},"inputs":{"A":inp(expr(l)),"B":inp(expr(r))}}
        if t is ast.In: return {"type":"ub_in","inputs":{"A":inp(expr(l)),"B":inp(expr(r))}}
        if t is ast.NotIn: return {"type":"logic_negate","inputs":{"BOOL":inp({"type":"ub_in","inputs":{"A":inp(expr(l)),"B":inp(expr(r))}})}}
        return None
    def call(n):
        nm=cname(n.func); a=n.args
        if nm in API:
            b=apicall(nm,n,True)
            if b: return b
        if n.keywords: return rx(n)
        if nm in ("time","time.time") and not a: return {"type":"ub_time"}
        if nm=="round" and len(a)==1: return {"type":"math_round","fields":{"OP":"ROUND"},"inputs":{"NUM":inp(expr(a[0]))}}
        if nm=="round" and len(a)==2: return {"type":"ub_round2","inputs":{"NUM":inp(expr(a[0])),"DIGITS":inp(expr(a[1]))}}
        if nm=="len" and len(a)==1: return {"type":"lists_length","inputs":{"VALUE":inp(expr(a[0]))}}
        if nm in HELP and len(a)==1: return {"type":"ub_"+nm,"inputs":{"LIST":inp(expr(a[0]))}}
        if nm=="range" and len(a)==1: return {"type":"ub_range","inputs":{"N":inp(expr(a[0]))}}
        return rx(n)
    def expr(n):
        if isinstance(n,ast.Constant):
            v=n.value
            if isinstance(v,bool): return {"type":"logic_boolean","fields":{"BOOL":"TRUE" if v else "FALSE"}}
            if v is None: return {"type":"logic_null"}
            if isinstance(v,(int,float)): return num(v)
            if isinstance(v,str): return {"type":"text","fields":{"TEXT":v}}
            return rx(n)
        if isinstance(n,ast.Name): return {"type":"variables_get","fields":{"VAR":var(n.id)}}
        if isinstance(n,ast.UnaryOp):
            if isinstance(n.op,ast.USub) and isnum(n.operand): return num(-n.operand.value)
            if isinstance(n.op,ast.Not): return {"type":"logic_negate","inputs":{"BOOL":inp(expr(n.operand))}}
            if isinstance(n.op,ast.USub): return {"type":"math_single","fields":{"OP":"NEG"},"inputs":{"NUM":inp(expr(n.operand))}}
            return rx(n)
        if isinstance(n,ast.BinOp):
            if type(n.op) in ARI: return {"type":"math_arithmetic","fields":{"OP":ARI[type(n.op)]},"inputs":{"A":inp(expr(n.left)),"B":inp(expr(n.right))}}
            if isinstance(n.op,ast.Mod): return {"type":"math_modulo","inputs":{"DIVIDEND":inp(expr(n.left)),"DIVISOR":inp(expr(n.right))}}
            return rx(n)
        if isinstance(n,ast.BoolOp):
            op="AND" if isinstance(n.op,ast.And) else "OR"; b=expr(n.values[0])
            for v in n.values[1:]: b={"type":"logic_operation","fields":{"OP":op},"inputs":{"A":inp(b),"B":inp(expr(v))}}
            return b
        if isinstance(n,ast.Compare):
            if len(n.ops)>1 and not all(isinstance(c,(ast.Name,ast.Constant)) for c in n.comparators[:-1]): return rx(n)
            parts=[]; l=n.left
            for op,r in zip(n.ops,n.comparators):
                parts.append(cmp1(l,op,r)); l=r
            if None in parts: return rx(n)
            b=parts[0]
            for p in parts[1:]: b={"type":"logic_operation","fields":{"OP":"AND"},"inputs":{"A":inp(b),"B":inp(p)}}
            return b
        if isinstance(n,ast.Call): return call(n)
        if isinstance(n,ast.List):
            return {"type":"lists_create_with","extraState":{"itemCount":len(n.elts)},"inputs":{"ADD%d"%i:inp(expr(e)) for i,e in enumerate(n.elts)}}
        return rx(n)
    def setv(name,v): return {"type":"variables_set","fields":{"VAR":var(name)},"inputs":{"VALUE":inp(expr(v))}}
    def chain(bs):
        for i in range(len(bs)-1): bs[i]["next"]={"block":bs[i+1]}
        return bs[0] if bs else None
    def body(ss):
        c=chain(stmts(ss)); return {"block":c} if c else None
    def stmts(ss):
        out=[]
        for s in ss: out.extend(stmt(s))
        return out
    def stmt(s):
        if isinstance(s,ast.Expr):
            v=s.value
            if isinstance(v,ast.Constant) and isinstance(v.value,str): return []
            if isinstance(v,ast.Call):
                nm=cname(v.func)
                if nm in API:
                    b=apicall(nm,v,False)
                    if b: return [b]
                if nm in ("sleep","time.sleep") and len(v.args)==1 and not v.keywords:
                    return [{"type":"ub_sleep","inputs":{"S":inp(expr(v.args[0]))}}]
                if nm=="print" and not v.keywords and 1<=len(v.args)<=4:
                    if len(v.args)==1: return [{"type":"text_print","inputs":{"TEXT":inp(expr(v.args[0]))}}]
                    return [{"type":"ub_print%d"%len(v.args),"inputs":{"A%d"%i:inp(expr(a)) for i,a in enumerate(v.args)}}]
            return [rs(s)]
        if isinstance(s,ast.Assign) and len(s.targets)==1:
            t=s.targets[0]
            if isinstance(t,ast.Name): return [setv(t.id,s.value)]
            if isinstance(t,ast.Tuple) and isinstance(s.value,ast.Tuple) and len(t.elts)==len(s.value.elts) and all(isinstance(e,ast.Name) for e in t.elts):
                names={e.id for e in t.elts}; used={x.id for x in ast.walk(s.value) if isinstance(x,ast.Name)}
                if not names & used: return [setv(e.id,v) for e,v in zip(t.elts,s.value.elts)]
            return [rs(s)]
        if isinstance(s,ast.AugAssign) and isinstance(s.target,ast.Name):
            if isinstance(s.op,ast.Add): return [{"type":"math_change","fields":{"VAR":var(s.target.id)},"inputs":{"DELTA":inp(expr(s.value))}}]
            if isinstance(s.op,ast.Sub) and isnum(s.value): return [{"type":"math_change","fields":{"VAR":var(s.target.id)},"inputs":{"DELTA":inp(num(-s.value.value))}}]
            return [rs(s)]
        if isinstance(s,ast.If):
            b={"type":"controls_if","inputs":{}}; k=0; n=s
            while True:
                b["inputs"]["IF%d"%k]=inp(expr(n.test)); d=body(n.body)
                if d: b["inputs"]["DO%d"%k]=d
                if len(n.orelse)==1 and isinstance(n.orelse[0],ast.If):
                    n=n.orelse[0]; k+=1; continue
                break
            es={}
            if k: es["elseIfCount"]=k
            if n.orelse:
                es["hasElse"]=True; e=body(n.orelse)
                if e: b["inputs"]["ELSE"]=e
            if es: b["extraState"]=es
            return [b]
        if isinstance(s,ast.While) and not s.orelse:
            t=s.test
            if isinstance(t,ast.Constant) and t.value is True: b={"type":"ub_forever","inputs":{}}
            elif isinstance(t,ast.UnaryOp) and isinstance(t.op,ast.Not): b={"type":"controls_whileUntil","fields":{"MODE":"UNTIL"},"inputs":{"BOOL":inp(expr(t.operand))}}
            else: b={"type":"controls_whileUntil","fields":{"MODE":"WHILE"},"inputs":{"BOOL":inp(expr(t))}}
            d=body(s.body)
            if d: b["inputs"]["DO"]=d
            return [b]
        if isinstance(s,ast.For) and not s.orelse and isinstance(s.target,ast.Name):
            it=s.iter; used=any(isinstance(x,ast.Name) and x.id==s.target.id for st in s.body for x in ast.walk(st))
            if isinstance(it,ast.Call) and cname(it.func)=="range" and len(it.args)==1 and not it.keywords and not used:
                b={"type":"controls_repeat_ext","inputs":{"TIMES":inp(expr(it.args[0]))}}
            else:
                b={"type":"controls_forEach","fields":{"VAR":var(s.target.id)},"inputs":{"LIST":inp(expr(it))}}
            d=body(s.body)
            if d: b["inputs"]["DO"]=d
            return [b]
        if isinstance(s,ast.Break): return [{"type":"controls_flow_statements","fields":{"FLOW":"BREAK"}}]
        if isinstance(s,ast.Continue): return [{"type":"controls_flow_statements","fields":{"FLOW":"CONTINUE"}}]
        if isinstance(s,ast.Pass): return []
        if isinstance(s,ast.Import) and len(s.names)==1 and s.names[0].name=="time" and not s.names[0].asname and spec["sleep"]=="module": return []
        return [rs(s)]
    top=chain(stmts(tree.body)); blocks=[]
    if top:
        top["x"]=24; top["y"]=24; blocks.append(top)
    return _ub_json.dumps({"blocks":{"languageVersion":0,"blocks":blocks},"variables":[{"name":k,"id":v} for k,v in VARS.items()],"raw":raw[0]})
`;

/* ---------- toolbox ---------- */
function toolbox(spec,cfg){
  const B=(type,extra)=>Object.assign({kind:"block",type},extra||{});
  const N=v=>({shadow:{type:"math_number",fields:{NUM:v}}}),T=v=>({shadow:{type:"text",fields:{TEXT:v}}});
  const api=cat=>spec.filter(f=>f.cat===cat).flatMap(f=>{
    const inputs={};f.args.forEach((a,i)=>{if(a.shadow)inputs["A"+i]={shadow:a.shadow}});
    const out=[B("ub_"+f.n,{inputs})];
    if(f.args.some(a=>a.optional)){const i2={...inputs};f.args.forEach((a,i)=>{if(a.optional)i2["A"+i]=N(1)});out.push(B("ub_"+f.n,{inputs:i2}))}
    return out});
  const cats=[];
  const add=(name,colour,contents)=>{if(contents.length)cats.push({kind:"category",name,colour,contents})};
  add("Move",COL.move,api("move"));add("Robot",COL.act,api("act"));add("Sensors",COL.sense,api("sense"));
  if(spec.length)cats.push({kind:"sep"});
  add("Wait",COL.wait,[B("ub_sleep",{inputs:{S:N(1)}}),B("ub_time")]);
  add("Loops",COL.loops,[B("controls_repeat_ext",{inputs:{TIMES:N(4)}}),B("ub_forever"),B("controls_whileUntil"),B("controls_forEach"),B("ub_range",{inputs:{N:N(5)}}),B("controls_flow_statements")]);
  add("Logic",COL.logic,[B("controls_if"),B("controls_if",{extraState:{hasElse:true}}),B("controls_if",{extraState:{elseIfCount:1,hasElse:true}}),
    B("logic_compare",{inputs:{B:N(0)}}),B("logic_operation"),B("logic_negate"),B("logic_boolean"),B("ub_isnone"),B("ub_in")]);
  add("Maths",COL.math,[B("math_number"),B("math_arithmetic",{inputs:{A:N(1),B:N(1)}}),B("math_round",{inputs:{NUM:N(3.7)}}),B("ub_round2",{inputs:{NUM:N(3.14159),DIGITS:N(1)}}),
    B("math_modulo",{inputs:{DIVIDEND:N(10),DIVISOR:N(3)}}),B("math_random_int",{inputs:{FROM:N(1),TO:N(6)}})]);
  add("Text",COL.text,[B("text"),B("text_print",{inputs:{TEXT:T("Hello")}}),B("ub_print2",{inputs:{A0:T("distance"),A1:N(0)}}),B("text_join")]);
  cats.push({kind:"category",name:"Variables",colour:COL.vars,custom:"VARIABLE"});
  const lists=[B("lists_create_with",{extraState:{itemCount:3}}),B("lists_create_empty"),B("lists_length"),B("ub_in")];
  if(cfg.helpers)lists.push(B("ub_median"),B("ub_mean"),B("ub_most_common"));
  add("Lists",COL.lists,lists);
  add("Python",COL.py,[B("ub_pystmt"),B("ub_pyexpr")]);
  return{kind:"categoryToolbox",contents:cats};
}

/* ---------- look ---------- */
const themes={};
function isDark(){const t=document.documentElement.getAttribute("data-theme");return t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches}
function theme(){
  const k=isDark()?"dark":"light";if(themes[k])return themes[k];
  const cs=getComputedStyle(document.documentElement),v=(n,f)=>cs.getPropertyValue(n).trim()||f;
  const panel=v("--panel",k==="dark"?"#12263a":"#ffffff"),bg=v("--bg",k==="dark"?"#0b1824":"#f2f5f9"),ink=v("--ink",k==="dark"?"#e4ebf3":"#14263a"),line=v("--line",k==="dark"?"#27425c":"#d5dce4");
  themes[k]=Blockly.Theme.defineTheme("ugot-"+k,{base:Blockly.Themes.Classic,
    componentStyles:{workspaceBackgroundColour:panel,toolboxBackgroundColour:bg,toolboxForegroundColour:ink,flyoutBackgroundColour:bg,flyoutForegroundColour:ink,flyoutOpacity:0.96,scrollbarColour:line,scrollbarOpacity:0.8,insertionMarkerColour:ink,insertionMarkerOpacity:0.3,cursorColour:ink},
    fontStyle:{family:'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif',weight:"600",size:11}});
  return themes[k];
}
function css(){
  if(document.getElementById("ub-style"))return;
  const s=document.createElement("style");s.id="ub-style";
  s.textContent=`.ub-switch{display:flex;flex-wrap:wrap;align-items:center;gap:6px 8px;margin:0 0 8px}
.ub-switch button{font:inherit;font-size:.9rem;font-weight:700;padding:6px 14px;border-radius:99px;border:1px solid var(--line,#d5dce4);background:var(--chip,transparent);color:var(--ink,#14263a);cursor:pointer}
.ub-switch button[aria-selected="true"]{background:var(--accent,#f26a21);border-color:var(--accent,#f26a21);color:#fff}
.ub-switch button:focus-visible{outline:3px solid var(--blue,#1f6fe5);outline-offset:2px}
.ub-msg{font-size:.84rem;color:var(--muted,#5a6b7d);flex:1 1 220px;min-width:0}
.ub-msg.bad{color:var(--bad,#c4372a);font-weight:600}
.ub-act{font:inherit;font-size:.84rem;font-weight:700;padding:3px 10px;border-radius:99px;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer}
.ub-ws{height:480px;border:1px solid var(--line,#d5dce4);border-radius:10px;overflow:hidden;background:var(--panel,#fff)}
@media (max-width:600px){.ub-ws{height:400px}}
.ub-peek{margin-top:8px}
.ub-peek summary{cursor:pointer;font-size:.86rem;font-weight:700;color:var(--muted,#5a6b7d)}
.ub-code{margin:6px 0 0;background:var(--code-bg,#0f2a43);color:var(--code-ink,#e6eef7);border-radius:10px;padding:10px 12px;font:12.5px/1.55 Consolas,Menlo,monospace;max-height:220px;overflow:auto;white-space:pre}
.ub-code i{font-style:normal;opacity:.45;user-select:none;display:inline-block;min-width:2.2em}
.blocklyToolboxDiv{font-weight:600}`;
  document.head.appendChild(s);
}

/* ---------- attach to one editor ---------- */
UB.attach=function(cfg){
  const ta=document.getElementById(cfg.textarea);
  if(!ta||!window.Blockly||!window.python)return null;
  css();
  if(!G){G=python.pythonGenerator;O=python.Order}
  if(!common){defineCommon(cfg);common=true}
  const spec=buildSpec(cfg.api,cfg.examples);defineApi(spec);
  G.addReservedWords(spec.map(f=>f.n).concat(["sleep","time","median","mean","most_common"]).join(","));
  const specJson=JSON.stringify({api:Object.fromEntries(spec.map(f=>[f.n,{value:f.value,args:f.args.map(a=>({name:a.name,opts:a.opts||null,opt_type:a.opt_type||null}))}])),
    helpers:cfg.helpers?["median","mean","most_common"]:[],sleep:cfg.sleep||"global"});
  const KEY="ugot_code_mode:"+location.pathname.split("/").pop()+":"+cfg.textarea;
  const editor=ta.closest(".editor")||ta;
  const bar=document.createElement("div");bar.className="ub-switch";bar.setAttribute("role","tablist");bar.setAttribute("aria-label","How do you want to code?");
  bar.innerHTML='<button type="button" role="tab" data-m="blocks" aria-selected="false">🧩 Blocks</button><button type="button" role="tab" data-m="python" aria-selected="true">🐍 Python</button><span class="ub-msg" aria-live="polite"></span>';
  const wrap=document.createElement("div");wrap.className="ub-wrap";wrap.style.display="none";
  wrap.innerHTML='<div class="ub-ws"></div><details class="ub-peek" open><summary>The Python your blocks make (this is what runs)</summary><pre class="ub-code"></pre></details>';
  editor.parentNode.insertBefore(bar,editor);editor.parentNode.insertBefore(wrap,editor.nextSibling);
  const msgEl=bar.querySelector(".ub-msg"),peek=wrap.querySelector(".ub-code"),wsDiv=wrap.querySelector(".ub-ws");
  const say=(t,bad,action)=>{msgEl.textContent=t||"";msgEl.classList.toggle("bad",!!bad);
    if(action){const b=document.createElement("button");b.type="button";b.className="ub-act";b.textContent=action[0];b.onclick=action[1];msgEl.append(" ",b)}};
  const emptyBlocks=["Start with empty blocks",async()=>{lastGen=null;quiet=true;ta.value="";quiet=false;await setMode("blocks")}];
  let ws=null,mode="python",lastGen=null,quiet=false,pending=null,editorDisplay=editor.style.display;

  // Notice when the page itself puts new code in the editor (an example, a challenge starter).
  const D=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,"value");
  Object.defineProperty(ta,"value",{configurable:true,get(){return D.get.call(this)},set(v){D.set.call(this,v);if(!quiet&&mode==="blocks"){clearTimeout(pending);pending=setTimeout(fromPage,0)}}});
  async function fromPage(){if(!(await toBlocks(ta.value))&&mode==="blocks"){const why=msgEl.textContent;await setMode("python");say(why,true,emptyBlocks)}}
  function write(code){quiet=true;ta.value=code;quiet=false;lastGen=code;
    peek.innerHTML=code.split("\n").map((l,i)=>"<i>"+(i+1)+"</i>"+l.replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]))).join("\n");
    if(cfg.onCode)cfg.onCode()}
  function regen(){if(ws)write(G.workspaceToCode(ws))}
  function ensureWs(){
    if(ws)return;
    ws=Blockly.inject(wsDiv,{toolbox:toolbox(spec,cfg),renderer:"zelos",theme:theme(),media:BASE+"blockly/media/",trashcan:true,sounds:true,
      zoom:{controls:true,wheel:false,startScale:0.75,maxScale:2,minScale:0.4,scaleSpeed:1.15},move:{scrollbars:true,drag:true,wheel:true}});
    let t=null;
    ws.addChangeListener(e=>{if(e.isUiEvent||mode!=="blocks")return;clearTimeout(t);t=setTimeout(regen,60)});
    const retheme=()=>ws.setTheme(theme());
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change",retheme);
    new MutationObserver(retheme).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
    if(window.ResizeObserver)new ResizeObserver(()=>Blockly.svgResize(ws)).observe(wsDiv);
  }
  async function toBlocks(src){
    if(!ws)return false;
    if(!src.trim()){ws.clear();regen();say("Drag blocks from the list on the left to build your program.");return true}
    say("Turning the Python into blocks…");
    let py;try{py=await cfg.getPy()}catch(e){say("Python could not load, so blocks cannot read this code. Check your internet connection and reload.",true);return false}
    if(!py._ubConvert){py.runPython(CONV);py._ubConvert=py.globals.get("_ub_convert")}
    let r;try{r=JSON.parse(py._ubConvert(src,specJson))}catch(e){say("Blocks could not read this code.",true);return false}
    if(r.error){say("This code is not finished Python yet ("+r.error+"), so blocks can't show it. Finish it in the Python tab, or:",true);return false}
    ws.clear();Blockly.serialization.workspaces.load({blocks:r.blocks,variables:r.variables},ws);
    const top=ws.getTopBlocks(true)[0];if(top){const xy=top.getRelativeToSurfaceXY();ws.scroll(16-xy.x*ws.scale,16-xy.y*ws.scale)}
    regen();
    say(r.raw?"Grey “Python” blocks hold code that has no block yet. They still run.":"");
    return true;
  }
  async function setMode(m){
    bar.querySelectorAll("button").forEach(b=>b.setAttribute("aria-selected",String(b.dataset.m===m)));
    if(m==="blocks"){
      editor.style.display="none";wrap.style.display="";mode="blocks";ensureWs();Blockly.svgResize(ws);
      if(ta.value!==lastGen&&!(await toBlocks(ta.value))){const keep=msgEl.textContent;await setMode("python");say(keep,true,/not finished/.test(keep)?emptyBlocks:null);return}
    }else{
      mode="python";wrap.style.display="none";editor.style.display=editorDisplay;say("");if(cfg.onCode)cfg.onCode();
    }
    try{localStorage.setItem(KEY,m)}catch(e){}
  }
  bar.addEventListener("click",e=>{const b=e.target.closest("button[data-m]");if(b&&b.dataset.m!==mode)setMode(b.dataset.m)});
  let start=cfg.mode||"python";try{start=localStorage.getItem(KEY)||start}catch(e){}
  if(start==="blocks")setMode("blocks");
  return{setMode,get mode(){return mode}};
};
})();
