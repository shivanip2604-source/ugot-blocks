# UGOT Simulator

Robot missions for students (built for Grade 8). Each mission has four steps:

1. **Your mission**: what the robot must do and the goals to tick off, in plain words.
2. **Sensors the robot uses**: what each sensor measures and the block that reads it.
3. **Plan it with a flowchart**: standard shapes (oval Start/End, rectangle action, parallelogram sensor reading, diamond question, dashed loop). Every step shows the block that does it; tap it to add the block to the program.
4. **Build your program**: Scratch-style blocks (or Python) next to a virtual UGOT robot. Press Run and watch the goals get ticked.

Live site: https://shivanip2604-source.github.io/ugot-blocks/

## Missions
Starter: Free Drive (sandbox), Drive a Square, Climb the Step.
Explorer: Colour Sorter, Parcel Sorter, Find the Clap, Line Patrol, Safe Driving.
Expert: Spot the Bottle, Find Amira, Plate Tracker, Parcel Delivery, Rescue Mission.

## Files
- `index.html`: mission picker. `mission.html?topic=NN`: one mission.
- `assets/missions.js`: mission text, sensors, flowcharts and goal names. Edit this file to change what students read.
- `assets/blocks.js`: the Blocks / Python editor. The blocks write Python, which the simulator runs. Robot blocks are made automatically from each topic's functions.
- `assets/blockly/`: Blockly 10.4.3 (Apache-2.0), stored here so no extra website needs to be allowed.
- `sim/`: the virtual UGOT engine and one file per mission (`tNN.js`), with physics, sensors and the goal checks.

## Notes
- Python runs in the browser with Pyodide from cdn.jsdelivr.net, so the school network must allow that site.
- Function names in the simulator are teaching names that mirror the uCode blocks. Check them against the real UGOT Python library before using them on a physical robot. Physics and sensor noise are estimates.
- Nothing is saved to a server. Programs stay in the student's browser tab.

## Credit
The simulator engine and the 13 topic simulations come from the AIA UGOT design portfolio by mudassarqu (https://mudassarqu.github.io/UGOT/). This site adds the student missions, sensors, flowcharts and block coding. The full portfolio (criteria pages, lessons, quizzes) is in this repository's history.
