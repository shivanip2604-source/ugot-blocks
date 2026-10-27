# UGOT Simulator

Robot missions for complete beginners (built for Grade 8). Every mission is spoon-fed in five steps:

1. **Your mission**: what the robot must do and the goals to tick off, in plain words.
2. **Sensors the robot uses**: what each sensor measures and the block that reads it.
3. **The plan**: a flowchart with standard shapes (oval Start/End, rectangle action, parallelogram sensor reading, diamond question, dashed loop), and the same plan as a ready-made program in blocks and Python. Every flowchart step shows its block, already filled in; tap it to add it.
4. **Run it**: the sample program is already loaded next to a virtual UGOT robot. Press Run and watch the goals get ticked.
5. **Try these changes**: 3 or 4 small edits (change one number or word), each with what to watch for.

The **Block Guide** (`guide.html`) explains every block with a tiny program and a "Try it in Free Drive" button.

Live site: https://shivanip2604-source.github.io/ugot-blocks/

## Missions
Starter: Free Drive (sandbox), Drive a Square, Climb the Step.
Explorer: Colour Sorter, Parcel Sorter, Find the Clap, Line Patrol, Safe Driving.
Expert: Spot the Bottle, Find Amira, Plate Tracker, Parcel Delivery, Rescue Mission.

## Files
- `index.html`: mission picker. `mission.html?topic=NN`: one mission. `guide.html`: the Block Guide.
- `assets/missions.js`: mission text, sensors, flowcharts (which also make the sample programs), changes to try and goal names. Edit this file to change what students read.
- `assets/guide.js`: Block Guide entries and their sample programs.
- `assets/blocks.js`: the Blocks / Python editor. The blocks write Python, which the simulator runs. Robot blocks are made automatically from each topic's functions.
- `assets/blockly/`: Blockly 10.4.3 (Apache-2.0), stored here so no extra website needs to be allowed.
- `sim/`: the virtual UGOT engine and one file per mission (`tNN.js`), with physics, sensors and the goal checks.

## Notes
- Python runs in the browser with Pyodide from cdn.jsdelivr.net, so the school network must allow that site.
- Function names in the simulator are teaching names that mirror the uCode blocks. Check them against the real UGOT Python library before using them on a physical robot. Physics and sensor noise are estimates.
- Nothing is saved to a server. Programs stay in the student's browser tab.

## Credit
The simulator engine and the 13 topic simulations come from the AIA UGOT design portfolio by mudassarqu (https://mudassarqu.github.io/UGOT/). This site adds the student missions, sensors, flowcharts and block coding. The full portfolio (criteria pages, lessons, quizzes) is in this repository's history.
