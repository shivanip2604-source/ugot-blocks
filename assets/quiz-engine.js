/* Criterion quiz engine: Kahoot-style multiple choice + fill in the blanks + match the columns.
   Needs: config.js, quizzes-c.js (window.QUIZ_BANK), site.js (postToSheet, currentUser, doLogin).
   Scores are posted as: Criterion, Topic, Quiz, Score, Total, Percent, Points, MCQ/Fill/Match breakdown. */
(function () {
  const CRITERION = window.QUIZ_CRITERION || "C";
  const BANK = window.QUIZ_BANK;
  const Q_TIME = 20;
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (a, n) => shuffle(a).slice(0, n);
  let S = null, timer = null;

  function buildQuiz(key) {
    const t = BANK.topics[key];
    let mcq = shuffle(t.mcq).map(q => ({ ...q }));
    let fill = shuffle(t.fill).slice();
    if (key !== "py" && BANK.topics.py) { // add Python skills to every topic quiz
      mcq = mcq.concat(sample(BANK.topics.py.mcq, 3).map(q => ({ ...q, py: true })));
      fill = fill.concat(sample(BANK.topics.py.fill, 2).map(f => ({ ...f, py: true })));
    }
    return { key, name: t.name, emoji: t.emoji, mcq, fill, match: t.match };
  }
  function start(key) {
    S = { quiz: buildQuiz(key), stage: "mcq", i: 0, mcq: 0, fill: 0, match: 0, points: 0, t0: Date.now() };
    S.total = S.quiz.mcq.length + S.quiz.fill.length + S.quiz.match.pairs.length;
    $("picker").style.display = "none"; $("result").style.display = "none"; $("play").style.display = "block";
    $("title").textContent = S.quiz.emoji + " " + S.quiz.name;
    history.replaceState(null, "", "?topic=" + key);
    showMcq();
  }
  /* ---------- Part 1: multiple choice (Kahoot style) ---------- */
  function setHead(label, text) { $("qnum").textContent = label; $("qtext").innerHTML = text; $("scorePill").textContent = S.points; }
  function showMcq() {
    clearInterval(timer);
    const q = S.quiz.mcq[S.i];
    setHead(`PART 1 · MULTIPLE CHOICE · ${S.i + 1} / ${S.quiz.mcq.length}${q.py ? " · PYTHON" : ""}`, esc(q.q));
    $("timerWrap").style.display = "block";
    const order = shuffle(q.o.map((txt, idx) => ({ txt, ok: idx === q.c })));
    q._ok = order.findIndex(o => o.ok);
    const body = $("body"); body.innerHTML = '<div class="opt-grid" id="optGrid"></div><div id="explain"></div>';
    order.forEach((o, oi) => {
      const b = document.createElement("button"); b.className = "opt c" + oi; b.textContent = o.txt;
      b.onclick = () => answerMcq(oi); $("optGrid").appendChild(b);
    });
    let remaining = Q_TIME * 10; const bar = $("timerBar"); bar.style.width = "100%"; S.qStart = Date.now();
    timer = setInterval(() => { remaining--; bar.style.width = (remaining / (Q_TIME * 10) * 100) + "%"; if (remaining <= 0) { clearInterval(timer); answerMcq(-1); } }, 100);
  }
  function answerMcq(choice) {
    clearInterval(timer);
    const q = S.quiz.mcq[S.i], ok = choice === q._ok;
    document.querySelectorAll("#optGrid .opt").forEach((b, bi) => { b.disabled = true; if (bi === q._ok) b.classList.add("correct"); else if (bi === choice) b.classList.add("wrong"); });
    if (ok) { S.mcq++; const frac = Math.max(0, 1 - (Date.now() - S.qStart) / (Q_TIME * 1000)); S.points += Math.round(500 + 500 * frac); }
    $("scorePill").textContent = S.points;
    const last = S.i + 1 >= S.quiz.mcq.length;
    $("explain").innerHTML = `<div class="exbox ${ok ? "ok" : "no"}"><strong>${ok ? "✅ Correct!" : (choice === -1 ? "⏱️ Time's up. " : "❌ Not quite. ") + "The answer: " + esc(q.o[q.c])}</strong><br>${esc(q.w)}<div><button class="nbtn" id="nextBtn">${last ? "Go to Part 2 →" : "Next question →"}</button></div></div>`;
    $("nextBtn").onclick = () => { if (last) { S.i = 0; showFill(); } else { S.i++; showMcq(); } };
  }
  /* ---------- Part 2: fill in the blanks ---------- */
  function showFill() {
    const f = S.quiz.fill[S.i]; $("timerWrap").style.display = "none";
    setHead(`PART 2 · FILL IN THE BLANK · ${S.i + 1} / ${S.quiz.fill.length}${f.py ? " · PYTHON" : ""}`, "Type the missing word, symbol or number.");
    const parts = f.t.split("___");
    const isCode = /[=:()\[\]#]/.test(f.t) || f.t.indexOf("\n") >= 0;
    const inp = '<input id="fillIn" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" class="fillin" placeholder="…">';
    const line = esc(parts[0]) + inp + esc(parts.slice(1).join("___"));
    $("body").innerHTML = `<div class="${isCode ? "codeq" : "textq"}">${line}</div><div id="explain"></div><div style="margin-top:14px"><button class="nbtn" id="checkBtn">Check</button></div>`;
    const go = () => checkFill(f); $("checkBtn").onclick = go; $("fillIn").addEventListener("keydown", e => { if (e.key === "Enter") go(); }); $("fillIn").focus();
  }
  const norm = s => String(s).trim().toLowerCase().replace(/\s+/g, " ").replace(/^["']|["']$/g, "");
  function checkFill(f) {
    const inp = $("fillIn"); if (inp.disabled) return;
    const ans = norm(inp.value), ok = f.a.some(a => norm(a) === ans);
    inp.disabled = true; inp.classList.add(ok ? "good" : "bad"); if (ok) { S.fill++; S.points += 500; }
    $("scorePill").textContent = S.points; $("checkBtn").style.display = "none";
    const last = S.i + 1 >= S.quiz.fill.length;
    $("explain").innerHTML = `<div class="exbox ${ok ? "ok" : "no"}"><strong>${ok ? "✅ Correct!" : "❌ The answer: " + esc(f.a[0])}</strong><br>${esc(f.w)}<div><button class="nbtn" id="nextBtn">${last ? "Go to Part 3 →" : "Next →"}</button></div></div>`;
    $("nextBtn").onclick = () => { if (last) showMatch(); else { S.i++; showFill(); } };
  }
  /* ---------- Part 3: match the columns ---------- */
  function showMatch() {
    const m = S.quiz.match; $("timerWrap").style.display = "none";
    setHead("PART 3 · MATCH THE COLUMNS", esc(m.title));
    const rights = shuffle(m.pairs.map(p => p[1]));
    let h = '<table class="mtable">';
    m.pairs.forEach((p, i) => { h += `<tr><td class="ml">${esc(p[0])}</td><td><select id="m${i}"><option value="">Choose…</option>${rights.map(r => `<option value="${esc(r)}">${esc(r)}</option>`).join("")}</select></td></tr>`; });
    $("body").innerHTML = h + '</table><div id="explain"></div><div style="margin-top:14px"><button class="nbtn" id="checkBtn">Check my matches</button></div>';
    $("checkBtn").onclick = () => {
      let ok = 0;
      m.pairs.forEach((p, i) => { const sel = $("m" + i); const good = sel.value === p[1]; sel.disabled = true; sel.classList.add(good ? "good" : "bad"); if (good) { ok++; S.points += 250; } else sel.insertAdjacentHTML("afterend", `<div class="fixit">✔ ${esc(p[1])}</div>`); });
      S.match = ok; $("scorePill").textContent = S.points; $("checkBtn").style.display = "none";
      $("explain").innerHTML = `<div class="exbox ${ok === m.pairs.length ? "ok" : "no"}"><strong>${ok} of ${m.pairs.length} matched correctly.</strong><div><button class="nbtn" id="nextBtn">See my score →</button></div></div>`;
      $("nextBtn").onclick = finish;
    };
  }
  /* ---------- result ---------- */
  function finish() {
    $("play").style.display = "none"; $("result").style.display = "block";
    const score = S.mcq + S.fill + S.match, pct = Math.round(score / S.total * 100), secs = Math.round((Date.now() - S.t0) / 1000);
    $("finalScore").textContent = `${score} / ${S.total} (${pct}%)`;
    $("breakdown").innerHTML = `Multiple choice <b>${S.mcq}/${S.quiz.mcq.length}</b> · Fill in the blank <b>${S.fill}/${S.quiz.fill.length}</b> · Matching <b>${S.match}/${S.quiz.match.pairs.length}</b> · Points <b>${S.points}</b>`;
    const u = currentUser(), st = $("submitStatus");
    const quizName = `${CRITERION} Quiz · ${S.quiz.key === "py" ? "Python skills" : "Topic " + S.quiz.key + " " + S.quiz.name}`;
    if (!u) st.textContent = "Log in at the top of the page next time to save your score.";
    else {
      postToSheet("quiz", { Name: u.name, Class: u.klass, Criterion: CRITERION, Topic: S.quiz.key === "py" ? "Python" : "Topic " + S.quiz.key, Lesson: S.quiz.name, Quiz: quizName,
        Score: score, Total: S.total, Percent: pct, Points: S.points, MCQ: S.mcq + "/" + S.quiz.mcq.length, Fill: S.fill + "/" + S.quiz.fill.length, Match: S.match + "/" + S.quiz.match.pairs.length, TimeTakenSec: secs });
      st.textContent = (window.APPS_SCRIPT_URL ? "✅ Score saved to the class Google Sheet." : "✅ Score saved in this browser (Sheet link not configured yet).");
    }
    $("again").onclick = () => start(S.quiz.key); $("others").onclick = () => { $("result").style.display = "none"; $("picker").style.display = "block"; history.replaceState(null, "", location.pathname); };
  }
  /* ---------- picker ---------- */
  function renderPicker() {
    let h = "";
    BANK.order.forEach(k => { const t = BANK.topics[k]; const n = t.mcq.length + t.fill.length + t.match.pairs.length + (k === "py" ? 0 : 5);
      h += `<button class="tcard${k === "py" ? " py" : ""}" data-k="${k}"><span class="e">${t.emoji}</span><b>${k === "py" ? "Python skills" : "Topic " + k}</b><span>${esc(t.name)}</span><small>${n} questions</small></button>`; });
    $("tgrid").innerHTML = h; document.querySelectorAll(".tcard").forEach(b => b.onclick = () => start(b.dataset.k));
  }
  window.addEventListener("DOMContentLoaded", () => {
    renderPicker();
    const k = new URLSearchParams(location.search).get("topic");
    if (k && BANK.topics[k]) { const go = () => start(k); go(); }
  });
})();
