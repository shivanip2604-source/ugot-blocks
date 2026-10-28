# Teacher notes: UGOT Simulator

## Your links
- Website for students: https://shivanip2604-source.github.io/ugot-blocks/
- Playground (free coding): https://shivanip2604-source.github.io/ugot-blocks/playground.html
- Block Guide: https://shivanip2604-source.github.io/ugot-blocks/guide.html
- The files (GitHub): https://github.com/shivanip2604-source/ugot-blocks
- Turn the website on or off: https://github.com/shivanip2604-source/ugot-blocks/settings/pages

The website is free and has no time limit. It keeps working while the repository stays public and is not renamed or deleted.

## What students do in each mission
1. Read the mission and the goals.
2. Meet the sensors the robot uses.
3. Look at the plan: a flowchart and the same plan as blocks and Python.
4. Press Run: the sample program is already loaded.
5. Try the small changes, one at a time, and tick them off.

Buttons in step 4: "Put the sample back" (if they break it) and "Start with empty blocks" (to rebuild it themselves from the flowchart).

Some goals need a different **Test setting** (under the arena). The goal says which one, for example "(test setting: Block on the line)".

## Playground (free coding)
Like VEXcode VR: code on the left, robot world on the right, and a live sensor dashboard underneath.
- **World** (top left): Everything (start here), Open field, Wall maze (spiral), Line track, Colour grid, AI camera room.
- **Start from an example**: 9 programs, one for each part (motors, distance, colour, mecanum slide, line, face, objects, signs, maze). Each one switches to the right world.
- **Live drive**: drive with W A S D Q E or the on-screen buttons. Pick a camera mode (face, object, sign, person, line) and watch the dashboard change.
- The AI camera blocks need a mode first: the **ai mode** block (Robot group). If a student forgets, Robot messages tells them.
- Drag boxes, people, signs and objects to new places, then run again.

## Missions
- Starter: Free Drive, Drive a Square, Climb the Step
- Explorer: Colour Sorter, Parcel Sorter, Find the Clap, Line Patrol, Safe Driving
- Expert: Spot the Bottle, Find Amira, Plate Tracker, Parcel Delivery, Rescue Mission

## Changing things
All the words students read are in `assets/missions.js` (missions) and `assets/guide.js` (Block Guide).
1. Open the file on GitHub and click the pencil (Edit).
2. Change the text between the quotes, for example a mission's `text:"..."` or one of its `changes`.
3. Click "Commit changes". The website updates in about a minute (press Ctrl+F5 to see it).

Keep the quotes, commas and brackets as they are. If the page breaks, open the file's History on GitHub and go back to the last version.

## Good to know
- Python runs in the browser from cdn.jsdelivr.net. If a school computer says "Could not load Python", ask IT to allow that site.
- Nothing is saved on a server. Students' programs and ticks stay in their own browser.
- The robot function names are teaching names. Check them against the real UGOT Python library before using them on a physical robot.
- The simulator engine comes from the AIA UGOT portfolio by mudassarqu (https://mudassarqu.github.io/UGOT/).

## Continuing with Claude later
Start a new Claude Code session with the repository `shivanip2604-source/ugot-blocks` selected, then paste:

> This is my UGOT Simulator website for Grade 8 beginners (GitHub Pages). Read TEACHER_NOTES.md and README.md first. Missions are in assets/missions.js, the Block Guide in assets/guide.js, the block editor in assets/blocks.js and the mission page in mission.html. I want to: ...
