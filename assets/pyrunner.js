/* Python runner for the playground and tutorials (Pyodide). Exposes window.PyRun. */
(function(){
const PYO=new URLSearchParams(location.search).get("pyo")||"https://cdn.jsdelivr.net/pyodide/v0.26.4/full/";
const HARNESS=`
import sys, io, traceback, types, json
class SD(dict):
    def __missing__(self,k):
        import builtins
        if hasattr(builtins,k): return getattr(builtins,k)
        raise NameError("You need to define '%s' first"%k)
_clock=[0.0]
def _fake_sleep(s): _clock[0]+=float(s)
def _fake_time(): return _clock[0]
def _install_time():
    m=types.ModuleType('time'); m.sleep=_fake_sleep; m.time=_fake_time; m.perf_counter=_fake_time; m.monotonic=_fake_time; sys.modules['time']=m
def _input(prompt=""): raise RuntimeError("input() is not available in this page. Put the value in a variable instead.")
class _Limit(Exception): pass
def _guard(limit):
    n=[0]
    def tr(frame,ev,arg):
        if frame.f_code.co_filename!='<student>': return None
        n[0]+=1
        if n[0]>limit: raise RuntimeError('Your program ran too many steps without finishing. Is there a loop that never ends?')
        return tr
    return tr
def _fmt(e):
    tb=traceback.extract_tb(e.__traceback__)
    ln=[f.lineno for f in tb if f.filename=='<student>']
    return (("Line %d: "%ln[-1]) if ln else "")+type(e).__name__+": "+str(e)
def _run(src, tests=None, limit=400000):
    _clock[0]=0.0
    _install_time()
    buf=io.StringIO(); old=sys.stdout; sys.stdout=buf
    g=SD({'__name__':'__main__','input':_input})
    err=None; results=[]
    sys.settrace(_guard(limit))
    try:
        exec(compile(src,'<student>','exec'),g)
    except BaseException as e:
        err=_fmt(e)
    finally:
        sys.settrace(None)
    out=buf.getvalue()
    if tests is not None and err is None:
        def check(label,ok,detail=""): results.append([str(label),bool(ok),str(detail)])
        def t(label,f,want,approx=False):
            try: got=f()
            except BaseException as e:
                check(label,False,_fmt(e)); return
            ok=(abs(got-want)<=0.011) if approx and isinstance(want,(int,float)) and isinstance(got,(int,float)) else got==want
            check(label,ok,"" if ok else "got %r, wanted %r"%(got,want))
        ns={'S':g,'OUT':out,'SRC':src,'check':check,'t':t}
        sys.settrace(_guard(limit))
        try:
            exec(compile(tests,'<student>','exec'),ns)
        except BaseException as e:
            results.append(["Your code raised an error",False,_fmt(e)])
        finally:
            sys.settrace(None)
    sys.stdout=old
    return json.dumps({"out":out,"err":err,"results":results,"time":_clock[0]})
`;
let py=null,loading=null;
window.PyRun={
  init(){
    if(py)return Promise.resolve(py);
    if(loading)return loading;
    loading=new Promise((res,rej)=>{
      const s=document.createElement("script");s.src=PYO+"pyodide.js";
      s.onload=async()=>{try{py=await loadPyodide({indexURL:PYO});py.runPython(HARNESS);res(py)}catch(e){rej(e)}};
      s.onerror=()=>rej(new Error("Could not load Python. Check your internet connection and reload."));
      document.head.appendChild(s);
    });
    return loading;
  },
  async run(src,tests){
    const p=await this.init();
    const r=p.globals.get("_run")(src,tests===undefined?null:tests);
    return JSON.parse(r);
  }
};
})();
