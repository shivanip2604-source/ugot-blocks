# UGOT Design Portfolio with Block Coding

A copy of the AIA UGOT design portfolio and virtual simulators (original site: https://mudassarqu.github.io/UGOT/ by mudassarqu), with a **Blocks / Python** switch added for younger students. See "Block coding" at the end of this file.

Saving to a Google Sheet is turned off in this copy. To turn it on, follow "Upload" below with your own Apps Script and paste its /exec URL into `assets/config.js`. Until then, answers and scores stay in each student's own browser.

---

# AIA UGOT Design Portfolio (Criteria A–D, 13 lessons)

## Upload
1. Upload EVERYTHING in this folder to your GitHub repo root (replace old files). Settings → Pages → main / root.
2. `assets/config.js` already holds your Apps Script /exec URL.
3. Replace the code in your Apps Script project with `google-apps-script/Code.gs`, then Deploy → Manage deployments → New version. Reload the Sheet and use **UGOT → Rebuild gradebook**.

## What is here
- `criteria-b.html` and `lessons/topic-NN.html`: Criterion B for each lesson (no 3D printing; B4 has system diagram, flowchart, wireframe, pseudocode).
- `criteria-c.html` and `lessons/criteria-c-NN.html`: Criterion C for each lesson, linked to Criterion B. The hub has the booklet download (`downloads/G10_UGOT_Criterion_C_Summative_Booklet.docx`). To replace it, overwrite that file.
- `criteria-c-quiz.html` + `assets/quiz-engine.js` + `assets/quizzes-c.js`: Kahoot-style multiple choice, fill in the blank, match the columns, plus Python questions. Edit questions in `quizzes-c.js`.
- To make quizzes for Criterion A or D: copy `criteria-c-quiz.html`, set `window.QUIZ_CRITERION="A"` (or "D") and load your own bank file defining `window.QUIZ_BANK` (same format). Scores go to the same Sheet.

## Google Sheet tabs
Logins, Quiz_Scores (raw attempts), Strand_Responses, Best_Scores (best attempt per quiz), Gradebook (A/B/C/D averages and overall %), Class_Summary.

Notes: Python function names in the exemplars mirror the uCode blocks and are teaching placeholders: check them against the real UGOT Python API. Sensor ranges: TOF 4–200 cm, verify with the datasheet.

---

## Simulators, Python Playground and Tutorials (added)

| Page | What it is |
|---|---|
| `simulator.html?topic=NN` | Virtual UGOT for Topics 02–15 (04 opens `simulator-04.html`) plus `topic=lab` Robot Sandbox. Each runs the student's Python on a virtual robot and checks the B1 tests T1–T4 from that topic's Criterion B and C pages. Files: `sim/engine.js`, `sim/tNN.js`, `sim/sim.css`. |
| `playground.html` | Python Lab (free coding) and 53 auto-checked challenges in 8 levels. Data: `assets/challenges.js`; runner: `assets/pyrunner.js`. Progress in the browser; passed challenges post to the Sheet as Criterion "P". |
| `tutorials.html`, `tutorial.html?id=NN` | 14 Python lessons with runnable cells and a narrated video each. Data: `assets/tutorials.js`. Videos go in `videos/lesson-NN.mp4` (with `poster-NN.jpg`). |

Notes
- Python runs in the browser with Pyodide loaded from cdn.jsdelivr.net, so the school network must allow that domain. (Test offline with `?pyo=<url of a local pyodide folder>/`.)
- Re-deploy `google-apps-script/Code.gs` (new deployment version). It adds Criterion "P" (Practice), shown in the Gradebook as "Practice challenges passed" and excluded from Overall %.
- The robot function names in the simulators are teaching names that mirror the uCode blocks. Check them against the real UGOT Python library before students use them on a physical robot.
- Physics (speeds, turn rates, noise) in the simulators is an estimate, not a measurement of the real kit.

## Student portfolio (Criteria A–D)
- Every Criteria page (A, B, C, D) and every lesson page now has "My portfolio" workspace: strands A1–D4, each with guiding questions, text entries and picture upload (choose, drag, or paste a screenshot). Pictures are shrunk in the browser (max 1400 px).
- Entries are kept on the student's device first and sent to the Google Sheet tab **Portfolio**. Images go to your Drive folder **UGOT Portfolio images** (sub-folders by criterion/class and student) and appear as previews in the sheet. **Portfolio_Summary** counts strands, entries and images per student.
- Students can edit and delete entries, and see their work on any device after logging in with the same name and class. `portfolio-view.html` shows everything together to print or save as PDF.
- Files added: `assets/portfolio.js`, `assets/topics.js`, `portfolio-view.html`. Criteria A and D pages are now full pages.

### Update the script (once)
1. Apps Script: replace all code with `google-apps-script/Code.gs`, Save.
2. Choose the function `authorizeDrive`, press Run, click Allow (lets the script save images to Drive).
3. Deploy, Manage deployments, pencil, Version: New version, Deploy. The /exec URL stays the same.
Note: uploaded images are shared as "anyone with the link can view" so they show on the pages; the links are long and unguessable but not password protected.

## Criterion A samples (all 13 topics)
- `criteria-a.html` is now a hub: strand summary, 13 topic cards, how A feeds B and C, and the portfolio workspace.
- `lessons/criteria-a-NN.html` (one per topic) has a complete sample of A1 need, A2 research plan, A3 existing products and A4 design brief, matched to that topic's Criterion B problem, sensors and measurable success criteria.
- Every Topic (B) and Criterion C page now has an A · B · C bar linking the three pages for the same topic.
- Survey and test numbers are marked EXEMPLAR (made up). Product notes are general public knowledge: students must check and cite their own sources.
- `assets/site.js`: text-only "Your turn" boxes are no longer locked before login.

## Criterion D (added)
- `criteria-d.html` is the hub: the four strands (your class rubric wording), how D links to A, B and C, and 13 topic cards.
- `lessons/criteria-d-NN.html` (13 pages): a complete worked sample per topic. D1 = 8 test methods with why they are valid and useful and the results expected. D2 = every B1 success criterion judged Met / Partly met / Not met with test evidence. D3 = three improvements justified against D2. D4 = impact on the client, referring back to the A1 problem.
- All test results and client quotes are EXEMPLAR (made up). Students must replace them with their own tests.
- A, B, C and D pages now share one A · B · C · D bar.

## Criterion A (rebuilt in the student-report layout) and CAD downloads (restored)
- `lessons/criteria-a-NN.html`: A1 numbered challenges, mind map and annotated product picture; A2 colour-coded SMART table (codes Aa to Ag, ACCESSFM, High/Medium/Low, justification, source); a table linking each research code to B1 numbers; A3 products; A4 design brief citing codes and B1 numbers.
- B1 tables now show "From research: Aa…" on the matching rows.
- `lessons/topic-NN.html` has a CAD section: Tinkercad tutorial video, steps list, STL files, view downloads (orthographic, three isometric, exploded, integration) and a per-lesson zip in `downloads/`.
- New folders: `guides/` (picture-by-picture Tinkercad guides with quiz), `stl/` (STL files), `videos/tNN.mp4` (Tinkercad videos). `videos/lesson-NN.mp4` are the Python tutorial videos.

## Summative booklets
`downloads/G10_UGOT_Criterion_A_Summative_Booklet.docx`, `..._C_...` and `..._D_...`: rubric levels, command terms, guiding questions and answer space. A and D level wording is a plain-language paraphrase of the MYP strands (D clarification uses the class D1-D4 rubric); check it against the school rubric.

## Criterion A is solution-neutral
Criterion A pages and the A booklet only cover the client's problem, why a solution is needed, research, a wide range of existing products from different fields, and a brief that states what the solution must do. They never name the product you will make or the kit parts. The solution is chosen in Criterion B.

## Block coding (Blocks / Python switch)
Every Python editor on `simulator.html` (all topics and the Sandbox), `simulator-04.html` and `playground.html` (Challenges and Python Lab) now has a **🧩 Blocks / 🐍 Python** switch, for younger students.
- Students drag blocks (Scratch-style). The blocks write real Python into the same editor, and the normal Run / Check buttons run it, so test results, Sheet logging and "Copy test evidence" work the same way.
- "The Python your blocks make" under the blocks shows the code that runs, with line numbers that match error messages. Students can switch to Python at any time to keep editing it.
- Loading an example (or a challenge) while in Blocks turns the Python into blocks. Python with no block yet (functions, dictionaries, list comprehensions) shows as grey "Python" blocks that still run. Comments are not kept in blocks.
- The robot blocks are made automatically from each topic's function list (`api` in `sim/tNN.js`), so a new function gets a block with no extra work. Text arguments with choices in the description (e.g. `"red"`, `"green"`) become dropdowns.
- The page remembers the last choice (Blocks or Python) in the browser.
- Files: `assets/blocks.js` (the block editor and the Python-to-blocks converter) and `assets/blockly/` (Blockly 10.4.3, Apache-2.0, stored locally so no extra domain needs to be allowed). Each page loads them with five `<script>` tags at the end.
