/* Shared logic: login, challenge saving, Kahoot-style quiz. Reads window.LESSON. */
const APPS_SCRIPT_URL = window.APPS_SCRIPT_URL || "";
const LESSON_NAME = (window.LESSON && window.LESSON.name) || "UGOT Unit";
const QUIZ_QUESTIONS = (window.LESSON && window.LESSON.quiz) || [];
const Q_TIME = 15;
let quizState = null, quizTimerInterval = null;

function hasUrl() { return APPS_SCRIPT_URL && APPS_SCRIPT_URL.indexOf("PASTE_YOUR") !== 0; }
function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }

function postToSheet(type, data) {
  const payload = { type, data };
  const key = "ugot_backup_" + type;
  let backup = [];
  try { backup = JSON.parse(ls(key) || "[]"); } catch (e) {}
  backup.push(payload); ls(key, JSON.stringify(backup));
  if (!hasUrl()) return Promise.resolve({ ok: false, offline: true });
  return fetch(APPS_SCRIPT_URL, { method: "POST", mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) })
    .then(() => ({ ok: true })).catch(() => ({ ok: false }));
}
function currentUser() { try { return JSON.parse(ls("ugot_user") || "null"); } catch (e) { return null; } }
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

function doLogin() {
  const name = document.getElementById("loginName").value.trim();
  const klass = document.getElementById("loginClass").value.trim();
  if (!name || !klass) { alert("Please enter both your name and your class."); return; }
  ls("ugot_user", JSON.stringify({ name, klass }));
  postToSheet("login", { Name: name, Class: klass, Lesson: LESSON_NAME });
  renderLoginBar(); unlockGated();
}
function renderLoginBar() {
  const bar = document.getElementById("loginbar"); const u = currentUser();
  if (bar && u) {
    bar.classList.add("done");
    bar.innerHTML = `<span>✅ Logged in as <span class="who">${escapeHtml(u.name)} (${escapeHtml(u.klass)})</span> &mdash; your answers and quiz scores will be saved.</span>
      <button onclick="doLogout()" style="background:#777;">Not you? Log out</button>`;
  }
}
function doLogout() { try { localStorage.removeItem("ugot_user"); } catch (e) {} location.reload(); }
function unlockGated() { document.querySelectorAll(".challenge, #quizCard").forEach(el => el.classList.remove("gated")); }

function saveChallenge(strand, prompt, textareaId) {
  const u = currentUser();
  const st = document.getElementById("status-" + strand.toLowerCase());
  const text = document.getElementById(textareaId).value.trim();
  if (!text) { if (st) st.textContent = "Write something first!"; return; }
  if (!u) { if (st) st.textContent = "Log in above first, then save."; return; }
  postToSheet("strand", { Name: u.name, Class: u.klass, Lesson: LESSON_NAME, Strand: strand, Prompt: prompt, Response: text });
  if (st) st.textContent = "✅ Saved " + new Date().toLocaleTimeString();
}

function startQuiz() {
  quizState = { idx: 0, score: 0, startedAt: Date.now() };
  document.getElementById("quizStart").style.display = "none";
  document.getElementById("quizResult").style.display = "none";
  document.getElementById("quizPlay").style.display = "block";
  showQuestion();
}
function showQuestion() {
  clearInterval(quizTimerInterval);
  const i = quizState.idx, item = QUIZ_QUESTIONS[i];
  document.getElementById("qnum").textContent = `QUESTION ${i + 1} / ${QUIZ_QUESTIONS.length}`;
  document.getElementById("qtext").textContent = item.q;
  document.getElementById("scorePill").textContent = quizState.score;
  document.getElementById("feedbackMsg").textContent = "";
  const oldEx = document.getElementById("explainBox"); if (oldEx) oldEx.remove();
  const grid = document.getElementById("optGrid"); grid.innerHTML = "";
  item.opts.forEach((opt, oi) => {
    const b = document.createElement("button"); b.className = "opt c" + oi; b.textContent = opt;
    b.onclick = () => answerQuestion(oi); grid.appendChild(b);
  });
  let remaining = Q_TIME * 10; const bar = document.getElementById("timerBar"); bar.style.width = "100%";
  quizTimerInterval = setInterval(() => {
    remaining -= 1; bar.style.width = (remaining / (Q_TIME * 10) * 100) + "%";
    if (remaining <= 0) { clearInterval(quizTimerInterval); answerQuestion(-1); }
  }, 100);
}
function answerQuestion(choice) {
  clearInterval(quizTimerInterval);
  const item = QUIZ_QUESTIONS[quizState.idx];
  document.querySelectorAll("#optGrid .opt").forEach((b, bi) => {
    b.disabled = true;
    if (bi === item.correct) b.classList.add("correct"); else if (bi === choice) b.classList.add("wrong");
  });
  const fb = document.getElementById("feedbackMsg");
  if (choice === item.correct) { quizState.score++; fb.textContent = "✅ Correct!"; }
  else fb.textContent = choice === -1 ? "⏱️ Time's up!" : "❌ Not quite.";
  document.getElementById("scorePill").textContent = quizState.score;
  const advance = () => { quizState.idx++; quizState.idx < QUIZ_QUESTIONS.length ? showQuestion() : finishQuiz(); };
  if (item.why) {
    const ok = choice === item.correct, box = document.createElement("div"); box.id = "explainBox";
    box.style.cssText = "margin-top:16px;padding:14px 16px;border-radius:10px;font-size:.95rem;line-height:1.5;" + (ok ? "background:#effaf3;border:1px solid #9bd8b4" : "background:#fff4f0;border:1px solid #f1b7a4");
    box.innerHTML = "<strong>" + (ok ? "✅ Why this is right" : "💡 The right answer: " + escapeHtml(item.opts[item.correct])) + "</strong><br>" + escapeHtml(item.why) + '<div style="margin-top:10px;"><button id="nextQ" style="background:#0f2a43;color:#fff;border:none;border-radius:7px;padding:8px 18px;font:inherit;font-weight:700;cursor:pointer;">' + (quizState.idx + 1 < QUIZ_QUESTIONS.length ? "Next question →" : "See my score →") + "</button></div>";
    document.getElementById("optGrid").after(box); document.getElementById("nextQ").onclick = advance; return;
  }
  setTimeout(advance, 1200);
}
function finishQuiz() {
  document.getElementById("quizPlay").style.display = "none";
  document.getElementById("quizResult").style.display = "block";
  const total = QUIZ_QUESTIONS.length;
  document.getElementById("finalScore").textContent = `${quizState.score} / ${total}`;
  const u = currentUser(), st = document.getElementById("submitStatus");
  const t = Math.round((Date.now() - quizState.startedAt) / 1000);
  if (!u) st.textContent = "Log in above next time to save your score.";
  else {
    postToSheet("quiz", { Name: u.name, Class: u.klass, Criterion: (window.QUIZ_CRITERION || "B"), Lesson: LESSON_NAME, Quiz: LESSON_NAME + " Quiz",
      Score: quizState.score, Total: total, Percent: Math.round(quizState.score / total * 100), TimeTakenSec: t });
    st.textContent = hasUrl() ? "✅ Score saved to the class Google Sheet." : "✅ Score saved in this browser (Sheet link not configured yet).";
  }
  loadLeaderboard();
}
function loadLeaderboard() {
  const el = document.getElementById("leaderboard");
  if (!hasUrl()) { el.innerHTML = "<p class='legend'>Leaderboard needs the Apps Script URL configured in assets/config.js.</p>"; return; }
  fetch(`${APPS_SCRIPT_URL}?action=leaderboard&quiz=${encodeURIComponent(LESSON_NAME + " Quiz")}`)
    .then(r => r.json()).then(d => {
      if (!d.ok || !d.rows || !d.rows.length) { el.innerHTML = ""; return; }
      let h = "<h4 style='color:var(--navy);'>🏆 Top scores</h4><table>";
      d.rows.forEach((r, i) => { h += `<tr><td>${i + 1}.</td><td>${escapeHtml(r.name)}</td><td>${r.score}/${r.total}</td></tr>`; });
      el.innerHTML = h + "</table>";
    }).catch(() => {});
}
(function init() {
  if (currentUser()) { renderLoginBar(); unlockGated(); }
  else document.querySelectorAll(".challenge, #quizCard").forEach(el => { if (el.id === "quizCard" || el.querySelector("textarea")) el.classList.add("gated"); });
})();
