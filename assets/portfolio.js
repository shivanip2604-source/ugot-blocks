/* Student portfolio workspace for Criteria A-D.
   <section id="portfolio-root" data-criterion="B" data-topic="02"></section>
   - data-criterion: A, B, C or D (required)
   - data-topic: fixed topic number (lesson pages). Leave it out on hub pages to show a topic picker.
   Entries (text + images) are saved on this device (IndexedDB) and sent to the Google Sheet
   ("Portfolio" tab); images go to the teacher's Google Drive. Needs site.js and config.js. */
(function () {
  "use strict";
  var STR = {
    A: [["A1", "Explain and justify the need for a solution", "Who is the client or target audience? What is the problem and why does it need solving?", ["Who has the problem, and where does it happen?", "What evidence shows it is a real problem (data, photos, interview)?", "Why does it need a solution now?"]],
        ["A2", "Identify and prioritise the research needed", "Plan the primary and secondary research that will help you design the solution.", ["What do you need to find out? List your research questions in order of importance.", "Which are primary (survey, interview, test) and which are secondary (websites, reports)?", "Why is the first one most important?"]],
        ["A3", "Analyse existing products that inspire a solution", "Study a range of similar products and say what you can learn from them.", ["Which products or robots solve a similar problem?", "What works well, and what does not? Use the ACCESSFM factors.", "What will you take from each into your own design?"]],
        ["A4", "Develop a detailed design brief", "Summarise your research and say what your solution must do.", ["What is the problem, the client and the context in one paragraph?", "What did your research tell you the solution must include?", "What are the limits (time, kit, safety, cost)?"]]],
    B: [["B1", "Develop a design specification", "Write clear, measurable success criteria for the solution.", ["Which criteria can you measure with a number?", "How will you test each one?", "How does each link back to your research?"]],
        ["B2", "Develop a range of feasible design ideas", "Draw several different ideas that others can understand.", ["How many different ideas do you have, and how do they differ?", "Are they labelled so another student could interpret them?", "Which are feasible with the UGOT kit?"]],
        ["B3", "Present the chosen design and justify it", "Show the idea you chose and give evidence-based reasons.", ["Which idea did you choose?", "How does it meet your success criteria better than the others?", "What evidence supports your choice?"]],
        ["B4", "Develop planning drawings and outline requirements", "System diagram, flowchart, wireframe, pseudocode and what you need to build it.", ["Does the flowchart match the pseudocode?", "Are parts, tools and time listed?", "Could another student follow your plan?"]]],
    C: [["C1", "Construct a logical plan", "Tasks and sub-tasks with time and resources so a peer can follow it.", ["What are the major tasks and sub-tasks, in order?", "How long will each take and what resources do you need?", "Where do you test and debug?"]],
        ["C2", "Demonstrate technical skills", "Show and explain the robot, your code and how they solve the problem.", ["Which technical skills did you use (assembly, sensors, Python)?", "What does each important line of code do and why?", "How did you test it?"]],
        ["C3", "Follow the plan: the making log", "A log for every lesson with images of the current development.", ["What was your goal this lesson and what did you do?", "What problems did you meet and how did you solve them?", "Does the robot work as intended? Show evidence."]],
        ["C4", "Justify changes to the design and plan", "Compare the final robot with the B3 design and the C1 plan.", ["What changed from the design and the plan?", "What test result or problem caused each change?", "How did each change improve the solution?"]]],
    D: [["D1", "Design testing methods", "Tests that generate data to measure the success of the solution.", ["Which tests will measure each success criterion?", "How many trials and what pass mark?", "How will you record the data?"]],
        ["D2", "Evaluate the success of the solution", "Use your test data to judge the solution against the specification.", ["Which criteria were met, partly met or not met?", "What numbers show this?", "How reliable is your evidence?"]],
        ["D3", "Explain how the solution could be improved", "Say what you would change and why.", ["What are the biggest weaknesses?", "What would you change in the design, code or build?", "What evidence suggests the change would help?"]],
        ["D4", "Explain the impact on the client or audience", "How does your solution affect the people it was made for?", ["Who benefits and how?", "Could it cause any harm or problems?", "What feedback did the client give?"]]]
  };
  var TOPICS = window.UGOT_TOPICS || [["whole", "Whole unit (no single topic)"]];
  var NAMES = { A: "Investigating", B: "Developing ideas", C: "Creating the solution", D: "Evaluating" };
  var MAXIMG = 8, MAXSIDE = 1400, QUAL = 0.8;
  var root = document.getElementById("portfolio-root");
  if (!root) return;
  var CRIT = (root.dataset.criterion || "A").toUpperCase(), FIXED = root.dataset.topic || "";
  var E = window.escapeHtml || function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var db = null, entries = [], topicFilter = FIXED || "all", editing = {}, pending = {}, openForm = {};

  /* ---------- storage (IndexedDB, fallback to memory) ---------- */
  function userKey() { var u = currentUser(); return u ? (u.name.trim().toLowerCase() + "|" + u.klass.trim().toLowerCase()) : "guest"; }
  function openDB() {
    return new Promise(function (res) {
      try {
        var rq = indexedDB.open("ugot_portfolio", 1);
        rq.onupgradeneeded = function () { rq.result.createObjectStore("entries", { keyPath: "id" }); };
        rq.onsuccess = function () { db = rq.result; res(); };
        rq.onerror = function () { res(); };
      } catch (e) { res(); }
    });
  }
  function idbAll() { return new Promise(function (res) { if (!db) return res(null); var r = db.transaction("entries").objectStore("entries").getAll(); r.onsuccess = function () { res(r.result || []); }; r.onerror = function () { res(null); }; }); }
  function idbPut(en) { return new Promise(function (res) { if (!db) return res(); var t = db.transaction("entries", "readwrite"); t.objectStore("entries").put(en); t.oncomplete = res; t.onerror = res; }); }
  function idbDel(id) { return new Promise(function (res) { if (!db) return res(); var t = db.transaction("entries", "readwrite"); t.objectStore("entries").delete(id); t.oncomplete = res; t.onerror = res; }); }
  async function loadLocal() {
    var all = await idbAll(); if (all === null) all = window.__pfMem || [];
    entries = all.filter(function (e) { return e.owner === userKey(); });
  }
  async function put(en) { if (db) await idbPut(en); else { window.__pfMem = (window.__pfMem || []).filter(function (x) { return x.id !== en.id; }); window.__pfMem.push(en); } }
  async function del(id) { if (db) await idbDel(id); else window.__pfMem = (window.__pfMem || []).filter(function (x) { return x.id !== id; }); }

  /* ---------- helpers ---------- */
  function newId() { return "pf_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function topicLabel(code) { var t = TOPICS.filter(function (x) { return x[0] === code; })[0]; return t ? t[1] : code; }
  function thumb(id, w) { return "https://drive.google.com/thumbnail?id=" + id + "&sz=w" + (w || 900); }
  function imgSrc(im) { return im.dataUrl || (im.fileId ? thumb(im.fileId, 900) : ""); }
  function shrink(file) {
    return new Promise(function (res, rej) {
      if (!/^image\//.test(file.type)) return rej(new Error("Not an image: " + file.name));
      var url = URL.createObjectURL(file), img = new Image();
      img.onload = function () {
        var w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, MAXSIDE / Math.max(w, h));
        var c = document.createElement("canvas"); c.width = Math.round(w * k); c.height = Math.round(h * k);
        var g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url); res({ name: file.name || "image.jpg", mime: "image/jpeg", dataUrl: c.toDataURL("image/jpeg", QUAL), caption: "" });
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error("Could not read " + file.name)); };
      img.src = url;
    });
  }
  function status(sid, msg, bad) { var el = document.getElementById("pfst-" + sid); if (el) { el.textContent = msg; el.style.color = bad ? "#b3261e" : ""; } }

  /* ---------- sync with the Google Sheet ---------- */
  function payload(en, deleted) {
    var u = currentUser();
    return { type: "portfolio", data: { EntryID: en.id, Name: u.name, Class: u.klass, Criterion: en.criterion, Strand: en.strand,
      Topic: topicLabel(en.topic), Text: en.text, Deleted: !!deleted,
      Images: (en.images || []).map(function (im) {
        return im.fileId ? { fileId: im.fileId, name: im.name, caption: im.caption || "" }
          : { name: im.name, mime: im.mime, caption: im.caption || "", b64: (im.dataUrl || "").split(",")[1] || "" };
      }) } };
  }
  async function sync(en, deleted) {
    var u = currentUser();
    if (!u || !hasUrl()) return { ok: false, offline: true };
    try {
      var r = await fetch(APPS_SCRIPT_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload(en, deleted)) });
      var j = await r.json();
      if (!j.ok) return { ok: false, error: j.error || "Sheet error" };
      if (!deleted && j.images) {   // swap local data for Drive ids
        en.images = j.images.map(function (m, i) { var old = (en.images || [])[i] || {}; return { fileId: m.id, name: m.name, caption: m.caption, dataUrl: old.dataUrl && !old.fileId ? old.dataUrl : null }; });
        en.synced = true; await put(en);
      }
      return { ok: true };
    } catch (e) { return { ok: false, error: String(e && e.message || e) }; }
  }
  async function pull() {
    var u = currentUser(); if (!u || !hasUrl()) return;
    try {
      var r = await fetch(APPS_SCRIPT_URL + "?action=portfolio&name=" + encodeURIComponent(u.name) + "&klass=" + encodeURIComponent(u.klass));
      var j = await r.json(); if (!j.ok) return;
      var have = {}; entries.forEach(function (e) { have[e.id] = e; });
      for (var i = 0; i < j.rows.length; i++) {
        var m = j.rows[i], loc = have[m.id];
        if (loc && (!loc.synced || (loc.updated || "") >= (m.updated || ""))) continue;
        var en = { id: m.id, owner: userKey(), criterion: m.criterion, strand: m.strand, topic: codeFromLabel(m.topic), text: m.text, updated: m.updated, created: m.created, synced: true,
          images: (m.images || []).map(function (x) { return { fileId: x.id, name: x.name, caption: x.caption, dataUrl: null }; }) };
        await put(en);
      }
      await loadLocal();
    } catch (e) { /* offline is fine */ }
  }
  function codeFromLabel(label) { var t = TOPICS.filter(function (x) { return x[1] === label; })[0]; return t ? t[0] : "whole"; }
  async function retryUnsynced() {
    var todo = entries.filter(function (e) { return !e.synced && !e.deletedLocal; });
    for (var i = 0; i < todo.length; i++) await sync(todo[i], false);
    await loadLocal(); render();
  }

  /* ---------- rendering ---------- */
  function css() {
    if (document.getElementById("pf-css")) return;
    var s = document.createElement("style"); s.id = "pf-css";
    s.textContent = ".pf h2{margin-top:0}.pf .bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:8px 0 14px}.pf select,.pf textarea,.pf input[type=text]{font:inherit;border:2px solid #cfd8e1;border-radius:8px;padding:8px 10px;background:#fff;color:inherit;box-sizing:border-box}.pf textarea{width:100%;min-height:110px;resize:vertical}"
      + ".pf .prog{display:flex;gap:6px}.pf .prog i{width:34px;height:10px;border-radius:5px;background:#dbe3ea}.pf .prog i.on{background:#2e9e5b}.pf .sc{border:1px solid #d6dee6;border-left:6px solid #e8622c;border-radius:12px;padding:14px 16px;margin:14px 0;background:#fff}"
      + ".pf .sc h3{margin:0 0 2px;color:#0f2a43}.pf .sc .d{color:#5b6b7a;margin:0 0 6px}.pf details.q{margin:6px 0}.pf details.q summary{cursor:pointer;font-weight:700;color:#0f2a43}.pf .en{border:1px solid #d6dee6;border-radius:10px;padding:10px 12px;margin:10px 0;background:#f8fafc}"
      + ".pf .en .m{font-size:.8rem;color:#5b6b7a;display:flex;gap:8px;flex-wrap:wrap;align-items:center}.pf .en p.t{white-space:pre-wrap;margin:6px 0}.pf .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-top:6px}"
      + ".pf .g figure{margin:0}.pf .g img{width:100%;height:110px;object-fit:cover;border-radius:8px;border:1px solid #cfd8e1;cursor:zoom-in;background:#eef2f6}.pf .g figcaption{font-size:.78rem;color:#5b6b7a;margin-top:2px}"
      + ".pf button.b{background:#0f2a43;color:#fff;border:0;border-radius:8px;padding:8px 14px;font:inherit;font-weight:700;cursor:pointer}.pf button.b.alt{background:#e8eef4;color:#0f2a43}.pf button.b.red{background:#fdecea;color:#b3261e}.pf button.b.sm{padding:4px 10px;font-size:.84rem}.pf button:disabled{opacity:.5}"
      + ".pf .pill{border-radius:999px;padding:1px 9px;font-size:.74rem;font-weight:700;background:#e8eef4;color:#0f2a43}.pf .pill.ok{background:#d6f0dd;color:#14532d}.pf .pill.wait{background:#fff3cd;color:#7a5b00}"
      + ".pf .drop{border:2px dashed #b9c6d3;border-radius:10px;padding:10px;text-align:center;color:#5b6b7a;margin:8px 0}.pf .drop.over{background:#eaf3fb;border-color:#2b78c2}.pf .pv{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}.pf .pv .it{width:150px}.pf .pv img{width:150px;height:100px;object-fit:cover;border-radius:8px;border:1px solid #cfd8e1}.pf .pv input{width:100%;font-size:.82rem;padding:4px 6px;margin-top:3px}"
      + ".pf .st{font-size:.88rem;margin-left:8px}#pf-lb{position:fixed;inset:0;background:rgba(0,0,0,.85);display:none;align-items:center;justify-content:center;z-index:9999;cursor:zoom-out}#pf-lb img{max-width:94vw;max-height:92vh;border-radius:8px}"
      + "@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .pf .sc,:root:not([data-theme=light]) .pf .en{background:#14202c;border-color:#2d3f50}.pf select,.pf textarea,.pf input[type=text]{background:#0f1923;border-color:#2d3f50}}";
    document.head.appendChild(s);
    var lb = document.createElement("div"); lb.id = "pf-lb"; lb.innerHTML = "<img alt=''>"; lb.onclick = function () { lb.style.display = "none"; }; document.body.appendChild(lb);
  }
  function list(sid) { return entries.filter(function (e) { return e.criterion === CRIT && e.strand === sid && !e.deletedLocal && (topicFilter === "all" || e.topic === topicFilter); }).sort(function (a, b) { return (b.updated || "").localeCompare(a.updated || ""); }); }
  function entryHtml(en) {
    var imgs = (en.images || []).map(function (im, i) { var s = imgSrc(im); return s ? '<figure><img src="' + E(s) + '" data-big="' + E(imgSrc(im).replace(/sz=w\d+/, "sz=w1600")) + '" alt="' + E(im.caption || im.name || "") + '" loading="lazy">' + (im.caption ? "<figcaption>" + E(im.caption) + "</figcaption>" : "") + "</figure>" : ""; }).join("");
    return '<div class="en" data-id="' + E(en.id) + '"><div class="m"><span>' + E(new Date(en.updated || en.created || Date.now()).toLocaleString()) + '</span><span class="pill">' + E(topicLabel(en.topic)) + '</span><span class="pill ' + (en.synced ? "ok" : "wait") + '">' + (en.synced ? "✔ in Google Sheet" : "⏳ on this device only") + '</span>'
      + '<span style="margin-left:auto"><button class="b alt sm" data-act="edit">Edit</button> <button class="b red sm" data-act="del">Delete</button></span></div>'
      + (en.text ? '<p class="t">' + E(en.text) + "</p>" : "") + (imgs ? '<div class="g">' + imgs + "</div>" : "") + "</div>";
  }
  function formHtml(sid, en) {
    var imgs = (en ? en.images : pending[sid] || []);
    return '<div class="frm" data-sid="' + sid + '">'
      + '<label style="font-weight:700">' + (en ? "Edit your entry" : "Add to " + sid) + '</label><textarea id="pftx-' + sid + '" placeholder="Write or paste your work here: explain, justify, describe what you did, add your results...">' + E(en ? en.text : "") + "</textarea>"
      + '<div class="drop" data-drop="' + sid + '">📷 Drag pictures here, or <label style="cursor:pointer;text-decoration:underline;font-weight:700"><input type="file" accept="image/*" multiple hidden data-file="' + sid + '">choose pictures</label> (you can also paste a screenshot with Ctrl+V). Up to ' + MAXIMG + ' pictures.</div>'
      + '<div class="pv" id="pfpv-' + sid + '">' + pvHtml(imgs) + "</div>"
      + '<div class="bar" style="margin-bottom:0"><button class="b" data-act="save" ' + (en ? 'data-edit="' + E(en.id) + '"' : "") + '>💾 Save to my portfolio</button><button class="b alt" data-act="cancel">Cancel</button><span class="st" id="pfst-' + sid + '"></span></div></div>';
  }
  function pvHtml(imgs) { return (imgs || []).map(function (im, i) { return '<div class="it"><img src="' + E(imgSrc(im)) + '" alt=""><input type="text" placeholder="Caption (optional)" value="' + E(im.caption || "") + '" data-cap="' + i + '"><button class="b red sm" style="margin-top:3px" data-rm="' + i + '">Remove</button></div>'; }).join(""); }
  function render() {
    var u = currentUser(), filled = 0, body = "";
    STR[CRIT].forEach(function (s) {
      var sid = s[0], es = list(sid); if (es.length) filled++;
      body += '<div class="sc" id="pf-' + sid + '"><h3>' + sid + " · " + E(s[1]) + '</h3><p class="d">' + E(s[2]) + "</p>"
        + '<details class="q"><summary>Questions to help you</summary><ul>' + s[3].map(function (q) { return "<li>" + E(q) + "</li>"; }).join("") + "</ul></details>"
        + es.map(function (en) { return editing[en.id] ? '<div class="en">' + formHtml(sid, en) + "</div>" : entryHtml(en); }).join("")
        + (openForm[sid] ? formHtml(sid, null) : '<button class="b" data-act="add" data-sid="' + sid + '">➕ Add work to ' + sid + "</button>") + "</div>";
    });
    var opts = FIXED ? "" : '<label style="font-weight:700">Topic: <select id="pf-topic"><option value="all">All topics</option>' + TOPICS.map(function (t) { return '<option value="' + t[0] + '"' + (topicFilter === t[0] ? " selected" : "") + ">" + E(t[1]) + "</option>"; }).join("") + "</select></label>";
    var unsynced = entries.filter(function (e) { return !e.synced && !e.deletedLocal; }).length;
    root.innerHTML = '<div class="pf"><h2>🗂️ My Criterion ' + CRIT + " portfolio: " + NAMES[CRIT] + '</h2><p style="margin-top:0">Add your own writing and pictures to each strand. Your work is saved on this device straight away and sent to your teacher\'s Google Sheet when you are logged in.</p>'
      + (u ? "" : '<div class="en" style="border-color:#e0b92e;background:#fff8e1;color:#4a3a00">⚠️ Log in with your name and class (bar at the top of the page) so your work reaches your teacher.</div>')
      + '<div class="bar">' + opts + '<span class="prog" title="Strands with work">' + STR[CRIT].map(function (s) { return "<i class='" + (list(s[0]).length ? "on" : "") + "'></i>"; }).join("") + '</span><span>' + filled + " of 4 strands have work</span>"
      + (unsynced && u ? '<button class="b alt sm" data-act="retry">⟳ Send ' + unsynced + " waiting to the Sheet</button>" : "")
      + '<a class="b alt sm" style="text-decoration:none;display:inline-block" href="' + (root.dataset.base || "") + 'portfolio-view.html">🖨️ My full portfolio (print / PDF)</a></div>' + body + "</div>";
    wire();
  }
  function wire() {
    var t = document.getElementById("pf-topic"); if (t) t.onchange = function () { topicFilter = t.value; render(); };
    root.querySelectorAll("[data-file]").forEach(function (f) { f.onchange = function () { addFiles(f.dataset.file, f.files); f.value = ""; }; });
    root.querySelectorAll("[data-drop]").forEach(function (d) {
      d.ondragover = function (e) { e.preventDefault(); d.classList.add("over"); }; d.ondragleave = function () { d.classList.remove("over"); };
      d.ondrop = function (e) { e.preventDefault(); d.classList.remove("over"); addFiles(d.dataset.drop, e.dataTransfer.files); };
    });
    root.querySelectorAll("textarea[id^=pftx-]").forEach(function (ta) {
      ta.onpaste = function (e) { var fs = []; for (var i = 0; i < e.clipboardData.items.length; i++) { var it = e.clipboardData.items[i]; if (it.kind === "file" && /^image\//.test(it.type)) fs.push(it.getAsFile()); } if (fs.length) { e.preventDefault(); addFiles(ta.id.slice(5), fs); } };
    });
    root.querySelectorAll("[data-big]").forEach(function (im) { im.onclick = function () { var lb = document.getElementById("pf-lb"); lb.firstChild.src = im.dataset.big || im.src; lb.style.display = "flex"; }; });
  }
  function curImgs(sid) { var f = root.querySelector('.frm[data-sid="' + sid + '"]'); var eid = f && f.querySelector("[data-edit]") ? f.querySelector("[data-edit]").dataset.edit : null; return eid ? entries.filter(function (e) { return e.id === eid; })[0].images : (pending[sid] = pending[sid] || []); }
  async function addFiles(sid, files) {
    files = Array.prototype.slice.call(files);
    var imgs = curImgs(sid), msgs = [];
    for (var i = 0; i < files.length; i++) {
      if (imgs.length >= MAXIMG) { msgs.push("Maximum " + MAXIMG + " pictures."); break; }
      try { imgs.push(await shrink(files[i])); } catch (e) { msgs.push(e.message); }
    }
    document.getElementById("pfpv-" + sid).innerHTML = pvHtml(imgs); bindPv(sid); status(sid, msgs.join(" "), !!msgs.length);
  }
  function bindPv(sid) {
    var pv = document.getElementById("pfpv-" + sid), imgs = curImgs(sid);
    pv.querySelectorAll("[data-rm]").forEach(function (b) { b.onclick = function () { imgs.splice(+b.dataset.rm, 1); pv.innerHTML = pvHtml(imgs); bindPv(sid); }; });
    pv.querySelectorAll("[data-cap]").forEach(function (c) { c.oninput = function () { imgs[+c.dataset.cap].caption = c.value; }; });
  }
  root.addEventListener("click", async function (e) {
    var b = e.target.closest("[data-act]"); if (!b) return; var act = b.dataset.act;
    if (act === "add") { openForm[b.dataset.sid] = true; render(); bindPv(b.dataset.sid); return; }
    if (act === "cancel") { var f = b.closest(".frm"), sid = f.dataset.sid; openForm[sid] = false; delete pending[sid]; Object.keys(editing).forEach(function (k) { delete editing[k]; }); await loadLocal(); render(); return; }
    if (act === "retry") { b.disabled = true; await retryUnsynced(); return; }
    var card = b.closest(".en");
    if (act === "edit") { editing[card.dataset.id] = true; render(); var en = entries.filter(function (x) { return x.id === card.dataset.id; })[0]; bindPv(en.strand); return; }
    if (act === "del") {
      var en2 = entries.filter(function (x) { return x.id === card.dataset.id; })[0];
      if (!confirm("Delete this entry? It will also be marked deleted in your teacher's sheet.")) return;
      en2.deletedLocal = true; await sync(en2, true); await del(en2.id); await loadLocal(); render(); return;
    }
    if (act === "save") {
      var frm = b.closest(".frm"), sid2 = frm.dataset.sid, text = document.getElementById("pftx-" + sid2).value.trim(), eid = b.dataset.edit;
      var imgs = curImgs(sid2);
      if (!text && !imgs.length) { status(sid2, "Write something or add a picture first.", true); return; }
      var en3;
      if (eid) { en3 = entries.filter(function (x) { return x.id === eid; })[0]; en3.text = text; }
      else en3 = { id: newId(), owner: userKey(), criterion: CRIT, strand: sid2, topic: FIXED || (topicFilter === "all" ? "whole" : topicFilter), text: text, images: imgs.slice(), created: new Date().toISOString() };
      en3.updated = new Date().toISOString(); en3.synced = false; en3.owner = userKey();
      b.disabled = true; status(sid2, "Saving...");
      await put(en3);
      var r = await sync(en3, false);
      await loadLocal();
      delete pending[sid2]; openForm[sid2] = false; delete editing[en3.id];
      render();
      var st = document.getElementById("pfst-" + sid2);
      var cardMsg = r.ok ? "✅ Saved to your Google Sheet." : r.offline ? "Saved on this device. Log in (top of page) to send it to the Sheet." : "Saved on this device. Could not reach the Sheet (" + (r.error || "offline") + "). Use the Send button to try again.";
      var anchor = document.getElementById("pf-" + sid2); var note = document.createElement("p"); note.className = "st"; note.style.color = r.ok ? "#14532d" : "#7a5b00"; note.textContent = cardMsg; anchor.appendChild(note); setTimeout(function () { note.remove(); }, 9000);
    }
  });
  async function start() {
    css(); await openDB(); await loadLocal(); render();
    if (!document.getElementById("loginbar")) {   // pages without a login bar get one
      var lb = document.createElement("div"); lb.className = "loginbar"; lb.id = "loginbar";
      lb.innerHTML = '<span>👋 Enter your name and class to save your work to the class Google Sheet:</span><input id="loginName" type="text" placeholder="Your name" autocomplete="off"><input id="loginClass" type="text" placeholder="Class (e.g. 10B)" autocomplete="off"><button onclick="doLogin()">Start / Log in</button>';
      root.parentNode.insertBefore(lb, root); if (typeof renderLoginBar === "function") renderLoginBar();
    }
    await pull(); await retryUnsynced();
  }
  var _login = window.doLogin;
  window.doLogin = function () { _login(); setTimeout(async function () { await loadLocal(); await pull(); render(); await retryUnsynced(); }, 50); };
  window.PF = { STR: STR, reload: async function () { await loadLocal(); render(); }, entries: function () { return entries; } };
  start();
})();
