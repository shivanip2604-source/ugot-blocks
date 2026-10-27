/**
 * AIA UGOT backend v3 (Criteria A, B, C and D + student portfolio with image uploads)
 * Saves logins, quiz scores and strand answers into this spreadsheet,
 * calculates percentages and builds a gradebook automatically.
 *
 * SETUP (about 3 minutes; your existing deployment keeps working):
 *  1. Open your Google Sheet, then Extensions -> Apps Script.
 *  2. Delete the old code and paste this whole file in. Save.
 *  3. Deploy -> Manage deployments -> pencil icon -> Version: New version -> Deploy.
 *     (First time ever: Deploy -> New deployment -> Web app, Execute as: Me,
 *      Who has access: Anyone. Copy the /exec URL into assets/config.js.)
 *  4. Reload the Sheet. A menu "UGOT" appears. Choose UGOT -> Rebuild gradebook.
 *  5. FIRST TIME ONLY after adding this version: in the Apps Script editor choose the
 *     function authorizeDrive (top toolbar), press Run and click Allow, so the script
 *     may save uploaded images into your Drive. Then do step 3 again (New version).
 *
 * SHEETS (created automatically):
 *   Logins            every login (Timestamp, Name, Class, Lesson)
 *   Quiz_Scores       every quiz attempt: Timestamp, Name, Class, Criterion,
 *                     Topic, Lesson, Quiz, Score, Total, Percent, Points,
 *                     MCQ, Fill, Match, TimeTakenSec
 *   Strand_Responses  written answers from the interactive challenges
 *   Best_Scores       best attempt per student per quiz (rebuilt automatically)
 *   Gradebook         one row per student: average % for A, B, C, D, overall %,
 *                     quizzes taken, last activity (rebuilt automatically)
 *   Class_Summary     one row per class and criterion: students, average %
 *   Portfolio         every piece of work a student adds to a strand (A1..D4): text and
 *                     images. Images are saved in your Google Drive folder
 *                     "UGOT Portfolio images" and shown in the sheet as previews.
 *   Portfolio_Summary one row per student and criterion: entries per strand, images
 *
 * RULES
 *   Percent = round(Score / Total x 100) and is recalculated here, so it is
 *   always correct even if a page sends a wrong value.
 *   The criterion average uses each student's BEST score on each quiz.
 *   Criterion is read from the "Criterion" field (A, B, C or D). Older rows
 *   without it are treated as B.
 */

var CRITERIA = ["A", "B", "C", "D", "P"];   // P = Python Practice challenges (not part of Overall %)
var GRADED = ["A", "B", "C", "D"];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var body = JSON.parse(e.postData.contents);
    var type = body.type;
    var row = body.data || {};
    if (type === "portfolio") return jsonOut_(handlePortfolio_(row));
    row.Timestamp = new Date();

    var sheetName =
      type === "login" ? "Logins" :
      type === "quiz" ? "Quiz_Scores" :
      type === "strand" ? "Strand_Responses" : null;
    if (!sheetName) return jsonOut_({ ok: false, error: "Unknown submission type: " + type });

    if (type === "quiz") {
      var c = String(row.Criterion || "").toUpperCase();
      row.Criterion = CRITERIA.indexOf(c) >= 0 ? c : "B";
      var sc = Number(row.Score), tot = Number(row.Total);
      if (tot > 0) row.Percent = Math.round(sc / tot * 100);
    }
    appendRow_(sheetName, row);
    if (type === "quiz") rebuildGradebook_();
    return jsonOut_({ ok: true });
  } catch (err) {
    return jsonOut_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (x) {}
  }
}

function doGet(e) {
  var p = e.parameter || {};
  if (p.action === "leaderboard") {
    return jsonOut_({ ok: true, rows: readLeaderboard_(p.quiz || "", p.criterion || "") });
  }
  if (p.action === "portfolio") {
    return jsonOut_({ ok: true, rows: readPortfolio_(p.name || "", p.klass || "") });
  }
  if (p.action === "student") {
    return jsonOut_({ ok: true, rows: readStudent_(p.name || "", p.klass || "") });
  }
  return jsonOut_({ ok: true, message: "UGOT backend v3 is running." });
}

function onOpen() {
  SpreadsheetApp.getUi().createMenu("UGOT")
    .addItem("Rebuild gradebook", "rebuildGradebook_")
    .addItem("Rebuild portfolio summary", "rebuildPortfolioSummary_")
    .addItem("Authorise Drive for image uploads", "authorizeDrive")
    .addToUi();
}

/* ---------- writing ---------- */
function appendRow_(sheetName, rowObj) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    var first = sheetName === "Quiz_Scores"
      ? ["Timestamp", "Name", "Class", "Criterion", "Topic", "Lesson", "Quiz", "Score", "Total", "Percent", "Points", "MCQ", "Fill", "Match", "TimeTakenSec"]
      : Object.keys(rowObj);
    sheet.appendRow(first);
    sheet.setFrozenRows(1);
  }
  var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  Object.keys(rowObj).forEach(function (key) {
    if (headers.indexOf(key) === -1) {
      sheet.getRange(1, headers.length + 1).setValue(key);
      headers.push(key);
    }
  });
  sheet.appendRow(headers.map(function (h) {
    return Object.prototype.hasOwnProperty.call(rowObj, h) ? rowObj[h] : "";
  }));
}

/* ---------- reading ---------- */
function readQuizRows_() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Quiz_Scores");
  if (!sheet || sheet.getLastRow() < 2) return [];
  var v = sheet.getDataRange().getValues();
  var h = v.shift();
  var ix = function (n) { return h.indexOf(n); };
  return v.map(function (r) {
    var crit = String(ix("Criterion") >= 0 ? r[ix("Criterion")] : "").toUpperCase();
    var score = Number(r[ix("Score")]), total = Number(r[ix("Total")]);
    return {
      time: r[ix("Timestamp")],
      name: String(r[ix("Name")] || "").trim(),
      klass: String(r[ix("Class")] || "").trim(),
      criterion: CRITERIA.indexOf(crit) >= 0 ? crit : "B",
      quiz: String(r[ix("Quiz")] || ""),
      score: score, total: total,
      pct: total > 0 ? Math.round(score / total * 100) : 0
    };
  }).filter(function (r) { return r.name && r.total > 0; });
}

function readLeaderboard_(quizFilter, critFilter) {
  return readQuizRows_()
    .filter(function (r) { return (!quizFilter || r.quiz === quizFilter) && (!critFilter || r.criterion === critFilter); })
    .sort(function (a, b) { return b.pct - a.pct || b.score - a.score; })
    .slice(0, 10)
    .map(function (r) { return { name: r.name, quiz: r.quiz, criterion: r.criterion, score: r.score, total: r.total, percent: r.pct }; });
}

function readStudent_(name, klass) {
  return readQuizRows_().filter(function (r) {
    return r.name.toLowerCase() === String(name).toLowerCase() &&
      (!klass || r.klass.toLowerCase() === String(klass).toLowerCase());
  }).map(function (r) { return { criterion: r.criterion, quiz: r.quiz, score: r.score, total: r.total, percent: r.pct, time: r.time }; });
}

/* ---------- gradebook ---------- */
function rebuildGradebook_() {
  var rows = readQuizRows_();
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // best attempt per student + quiz
  var best = {};
  rows.forEach(function (r) {
    var k = [r.name.toLowerCase(), r.klass.toLowerCase(), r.criterion, r.quiz].join("|");
    var b = best[k];
    if (!b) { best[k] = { r: r, attempts: 1, last: r.time }; return; }
    b.attempts++;
    if (r.time > b.last) b.last = r.time;
    if (r.pct > b.r.pct || (r.pct === b.r.pct && r.score > b.r.score)) b.r = r;
  });
  var bestRows = Object.keys(best).map(function (k) { return best[k]; })
    .sort(function (a, b) {
      return (a.r.klass + a.r.name + a.r.criterion + a.r.quiz).localeCompare(b.r.klass + b.r.name + b.r.criterion + b.r.quiz);
    });
  var out1 = [["Name", "Class", "Criterion", "Quiz", "Best score", "Total", "Best %", "Attempts", "Last attempt"]];
  bestRows.forEach(function (b) {
    out1.push([b.r.name, b.r.klass, b.r.criterion, b.r.quiz, b.r.score, b.r.total, b.r.pct, b.attempts, b.last]);
  });
  writeSheet_(ss, "Best_Scores", out1);

  // gradebook: per student
  var stu = {};
  bestRows.forEach(function (b) {
    var k = b.r.name.toLowerCase() + "|" + b.r.klass.toLowerCase();
    var s = stu[k] || (stu[k] = { name: b.r.name, klass: b.r.klass, sums: {}, counts: {}, n: 0, last: b.last });
    s.sums[b.r.criterion] = (s.sums[b.r.criterion] || 0) + b.r.pct;
    s.counts[b.r.criterion] = (s.counts[b.r.criterion] || 0) + 1;
    s.n++;
    if (b.last > s.last) s.last = b.last;
  });
  var out2 = [["Name", "Class", "A avg %", "B avg %", "C avg %", "D avg %", "Overall %", "Practice challenges passed", "Quizzes taken", "Last activity"]];
  var classAgg = {};
  Object.keys(stu).sort().forEach(function (k) {
    var s = stu[k], line = [s.name, s.klass], tot = 0, cnt = 0;
    GRADED.forEach(function (c) {
      if (s.counts[c]) {
        var avg = Math.round(s.sums[c] / s.counts[c]);
        line.push(avg); tot += avg; cnt++;
        var ck = s.klass + "|" + c, a = classAgg[ck] || (classAgg[ck] = { klass: s.klass, c: c, sum: 0, n: 0 });
        a.sum += avg; a.n++;
      } else line.push("");
    });
    line.push(cnt ? Math.round(tot / cnt) : "", s.n - (s.counts.P || 0), s.last);
    line.splice(7, 0, s.counts.P || 0);   // practice count column after Overall
    // keep column order: ..., Overall %, Practice passed, Quizzes taken, Last activity
    out2.push(line);
  });
  writeSheet_(ss, "Gradebook", out2);

  var out3 = [["Class", "Criterion", "Students", "Class average %"]];
  Object.keys(classAgg).sort().forEach(function (k) {
    var a = classAgg[k];
    out3.push([a.klass, a.c, a.n, Math.round(a.sum / a.n)]);
  });
  writeSheet_(ss, "Class_Summary", out3);
}

function writeSheet_(ss, name, table) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clearContents();
  sh.getRange(1, 1, table.length, table[0].length).setValues(table);
  sh.getRange(1, 1, 1, table[0].length).setFontWeight("bold").setBackground("#0f2a43").setFontColor("#ffffff");
  sh.setFrozenRows(1);
  if (name === "Gradebook") {
    var rng = sh.getRange(2, 3, Math.max(table.length - 1, 1), 5);  // A-D + Overall only
    sh.setConditionalFormatRules([
      SpreadsheetApp.newConditionalFormatRule().whenNumberLessThan(50).setBackground("#f8d7d0").setRanges([rng]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenNumberBetween(50, 74).setBackground("#fff3cd").setRanges([rng]).build(),
      SpreadsheetApp.newConditionalFormatRule().whenNumberGreaterThanOrEqualTo(75).setBackground("#d6f0dd").setRanges([rng]).build()
    ]);
  }
  sh.autoResizeColumns(1, table[0].length);
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* =====================================================================
   STUDENT PORTFOLIO (strand work + image uploads)
   ===================================================================== */
var PF_HEAD = ["Timestamp", "EntryID", "Name", "Class", "Criterion", "Strand", "Topic", "Entry text",
  "Images", "Image links", "Preview 1", "Preview 2", "Preview 3", "Captions", "Status", "Updated", "ImagesJSON"];
var PF_FOLDER = "UGOT Portfolio images";

/** Run once from the editor (Run button) so Google asks you to allow Drive access. */
function authorizeDrive() {
  var f = pfRoot_();
  Logger.log("Drive is ready. Folder: " + f.getUrl());
}

function pfRoot_() {
  var it = DriveApp.getFoldersByName(PF_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(PF_FOLDER);
}
function pfSub_(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}
function pfClean_(s, max) {
  return String(s == null ? "" : s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").slice(0, max || 45000);
}
function pfSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Portfolio");
  if (!sh) {
    sh = ss.insertSheet("Portfolio");
    sh.appendRow(PF_HEAD);
    sh.getRange(1, 1, 1, PF_HEAD.length).setFontWeight("bold").setBackground("#0f2a43").setFontColor("#ffffff");
    sh.setFrozenRows(1);
    sh.setColumnWidth(8, 420);
  }
  return sh;
}
function pfFindRow_(sh, id) {
  var last = sh.getLastRow();
  if (last < 2) return 0;
  var ids = sh.getRange(2, 2, last - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) if (String(ids[i][0]) === String(id)) return i + 2;
  return 0;
}
function pfThumb_(id, w) { return "https://drive.google.com/thumbnail?id=" + id + "&sz=w" + (w || 400); }

/** Saves one portfolio entry (new or edited) and any new images. Returns the final image list. */
function handlePortfolio_(d) {
  var id = pfClean_(d.EntryID, 80);
  var name = pfClean_(d.Name, 80).trim(), klass = pfClean_(d.Class, 40).trim();
  if (!id || !name) return { ok: false, error: "EntryID and Name are required" };
  var crit = String(d.Criterion || "").toUpperCase();
  if (["A", "B", "C", "D"].indexOf(crit) < 0) return { ok: false, error: "Criterion must be A, B, C or D" };
  var sh = pfSheet_();
  var row = pfFindRow_(sh, id);
  var deleted = d.Deleted === true || d.Deleted === "true";
  var imgsOut = [];

  if (!deleted) {
    var inImgs = (d.Images || []).slice(0, 8);
    var folder = null;
    inImgs.forEach(function (im, k) {
      if (im.fileId) {                       // image saved earlier: keep it
        imgsOut.push({ id: String(im.fileId), name: pfClean_(im.name, 120), caption: pfClean_(im.caption, 300) });
      } else if (im.b64) {                   // new image: save to Drive
        if (!folder) folder = pfSub_(pfSub_(pfRoot_(), crit + " " + (klass || "class")), name);
        var mime = /^image\/(jpeg|png|gif|webp)$/.test(im.mime || "") ? im.mime : "image/jpeg";
        var ext = mime.split("/")[1].replace("jpeg", "jpg");
        var fname = crit + (d.Strand || "") + "_" + name.replace(/[^\w]+/g, "_") + "_" + id.slice(-5) + "_" + (k + 1) + "." + ext;
        var blob = Utilities.newBlob(Utilities.base64Decode(im.b64), mime, fname);
        var f = folder.createFile(blob);
        try { f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (e) {}
        imgsOut.push({ id: f.getId(), name: pfClean_(im.name || fname, 120), caption: pfClean_(im.caption, 300) });
      }
    });
  } else if (row) {                          // keep the old image list on a deleted row
    try { imgsOut = JSON.parse(sh.getRange(row, 17).getValue() || "[]"); } catch (e) { imgsOut = []; }
  }

  var now = new Date();
  var prevTime = row ? sh.getRange(row, 1).getValue() : now;
  var links = imgsOut.map(function (m) { return "https://drive.google.com/file/d/" + m.id + "/view"; }).join("\n");
  var caps = imgsOut.map(function (m, i) { return (i + 1) + ". " + (m.caption || ""); }).join("\n");
  var vals = [prevTime, id, name, klass, crit, pfClean_(d.Strand, 8), pfClean_(d.Topic, 120), pfClean_(d.Text, 45000),
    imgsOut.length, links, "", "", "", caps, deleted ? "Deleted" : "Active", now, JSON.stringify(imgsOut)];
  if (!row) { sh.appendRow(vals); row = sh.getLastRow(); }
  else sh.getRange(row, 1, 1, vals.length).setValues([vals]);
  for (var p = 0; p < 3; p++) {
    var cell = sh.getRange(row, 11 + p);
    if (imgsOut[p] && !deleted) cell.setFormula('=IMAGE("' + pfThumb_(imgsOut[p].id, 300) + '")'); else cell.setValue("");
  }
  if (imgsOut.length && !deleted) sh.setRowHeight(row, 110);
  rebuildPortfolioSummary_();
  return { ok: true, id: id, images: imgsOut };
}

function readPortfolio_(name, klass) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Portfolio");
  if (!sh || sh.getLastRow() < 2 || !name) return [];
  var v = sh.getRange(2, 1, sh.getLastRow() - 1, PF_HEAD.length).getValues();
  var nm = String(name).trim().toLowerCase(), kl = String(klass || "").trim().toLowerCase();
  var out = [];
  v.forEach(function (r) {
    if (String(r[14]) !== "Active") return;
    if (String(r[2]).trim().toLowerCase() !== nm) return;
    if (kl && String(r[3]).trim().toLowerCase() !== kl) return;
    var imgs = []; try { imgs = JSON.parse(r[16] || "[]"); } catch (e) {}
    out.push({ id: String(r[1]), criterion: r[4], strand: r[5], topic: r[6], text: r[7], images: imgs,
      created: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
      updated: r[15] instanceof Date ? r[15].toISOString() : String(r[15]) });
  });
  return out;
}

function rebuildPortfolioSummary_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName("Portfolio");
  var head = ["Name", "Class", "Criterion", "Strands with work", "Entries", "Images",
    "Strand 1 entries", "Strand 2 entries", "Strand 3 entries", "Strand 4 entries", "Last update"];
  var out = [head];
  if (sh && sh.getLastRow() > 1) {
    var v = sh.getRange(2, 1, sh.getLastRow() - 1, PF_HEAD.length).getValues(), g = {};
    v.forEach(function (r) {
      if (String(r[14]) !== "Active") return;
      var k = [String(r[2]).toLowerCase(), String(r[3]).toLowerCase(), r[4]].join("|");
      var o = g[k] || (g[k] = { name: r[2], klass: r[3], crit: r[4], s: [0, 0, 0, 0], n: 0, img: 0, last: r[15] });
      var si = parseInt(String(r[5]).replace(/\D/g, ""), 10) - 1;
      if (si >= 0 && si < 4) o.s[si]++;
      o.n++; o.img += Number(r[8]) || 0;
      if (r[15] > o.last) o.last = r[15];
    });
    Object.keys(g).sort().forEach(function (k) {
      var o = g[k], filled = o.s.filter(function (x) { return x > 0; }).length;
      out.push([o.name, o.klass, o.crit, filled + " / 4", o.n, o.img, o.s[0], o.s[1], o.s[2], o.s[3], o.last]);
    });
  }
  writeSheet_(ss, "Portfolio_Summary", out);
}
