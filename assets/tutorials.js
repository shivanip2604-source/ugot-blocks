window.TUTORIALS=[
 {
  "id": "01",
  "title": "Hello, Python and print()",
  "emoji": "👋",
  "mins": 4,
  "goal": "Write and run your first program, and see how Python reads code one line at a time.",
  "slides": [
   {
    "h": "Python talks to your robot",
    "say": "Welcome. Python is the language you will use to control your UGOT. In this lesson you will run your first program, and learn the one command you will use every day: print.",
    "code": null,
    "bullets": [
     "Python is read top to bottom, one line at a time",
     "print() shows a message on the screen",
     "Every robot program starts with small steps like this"
    ],
    "note": null,
    "out": null
   },
   {
    "h": "Your first program",
    "say": "This is a complete program. The word print is a function. The brackets hold what we want to show, and the quote marks tell Python that this is text. Press Run and the message appears in the output box.",
    "code": "print(\"Hello, UGOT!\")",
    "bullets": null,
    "note": null,
    "out": "Hello, UGOT!"
   },
   {
    "h": "Print more than one thing",
    "say": "You can print several things at once by separating them with commas. Python puts a space between each one. Numbers do not need quote marks.",
    "code": "print(\"Speed is\", 30, \"centimetres per second\")\nprint(\"Battery:\", 85, \"percent\")",
    "bullets": null,
    "note": null,
    "out": "Speed is 30 centimetres per second\nBattery: 85 percent"
   },
   {
    "h": "Order matters",
    "say": "Python runs the first line, then the second, then the third. A robot program is just a list of instructions in the right order. If you swap the lines, the output swaps too.",
    "code": "print(\"1. Look\")\nprint(\"2. Think\")\nprint(\"3. Move\")",
    "bullets": null,
    "note": null,
    "out": "1. Look\n2. Think\n3. Move"
   },
   {
    "h": "Comments are notes to humans",
    "say": "A hash symbol starts a comment. Python ignores everything after it. Use comments to explain why you wrote something. Your teacher and your future self will thank you.",
    "code": "# This line is ignored by Python\nprint(\"Robot ready\")  # so is this part",
    "bullets": null,
    "note": null,
    "out": "Robot ready"
   },
   {
    "h": "Fixing mistakes",
    "say": "Everyone makes mistakes. When Python cannot understand a line, it tells you which line and what is wrong. Read the message, find the line, fix it. Here a closing bracket is missing, so try adding it back.",
    "code": "print(\"Starting motors\"",
    "bullets": null,
    "note": null,
    "out": "SyntaxError: '(' was never closed (line 1)"
   }
  ],
  "task": "Print a three-line welcome message for your robot: its name, its job, and its top speed.",
  "challenges": [
   "hello",
   "fstring"
  ]
 },
 {
  "id": "02",
  "title": "Variables and data types",
  "emoji": "📦",
  "mins": 5,
  "goal": "Store values with names, and know the four basic types: int, float, str and bool.",
  "slides": [
   {
    "h": "A variable is a labelled box",
    "say": "A variable is a name that remembers a value. You make one with a single equals sign. The name goes on the left and the value on the right. Choose names that explain themselves, like speed or distance_cm.",
    "code": "speed = 30\nname = \"UGOT\"\nprint(name, \"drives at\", speed)",
    "bullets": null,
    "note": null,
    "out": "UGOT drives at 30"
   },
   {
    "h": "Changing a variable",
    "say": "Variables can change while the program runs. That is why they are called variables. Here the speed starts at 30 and then we increase it. The equals sign here means store, not equal.",
    "code": "speed = 30\nprint(speed)\nspeed = speed + 10\nprint(speed)\nspeed += 10     # shortcut for the line above\nprint(speed)",
    "bullets": null,
    "note": null,
    "out": "30\n40\n50"
   },
   {
    "h": "Four basic types",
    "say": "Every value has a type. An int is a whole number. A float has a decimal point. A str is text in quotes. A bool is True or False. The type function tells you which one you have.",
    "code": "print(type(30))\nprint(type(2.5))\nprint(type(\"hi\"))\nprint(type(True))",
    "bullets": null,
    "note": null,
    "out": "<class 'int'>\n<class 'float'>\n<class 'str'>\n<class 'bool'>"
   },
   {
    "h": "Sensors give you numbers",
    "say": "A distance sensor gives a number. A colour sensor gives text. A touch sensor gives True or False. Knowing the type tells you what you can do with the value.",
    "code": "distance_cm = 42.5\ncolour = \"red\"\ntouched = False\nprint(distance_cm, colour, touched)",
    "bullets": null,
    "note": null,
    "out": "42.5 red False"
   },
   {
    "h": "Converting types",
    "say": "Sometimes you need to change type. int turns a decimal into a whole number by cutting off the end. float and str work the same way. Be careful, text and numbers do not mix until you convert them.",
    "code": "text = \"25\"\nnumber = int(text) + 5\nprint(number)\nprint(int(3.9))\nprint(\"Speed: \" + str(number))",
    "bullets": null,
    "note": null,
    "out": "30\n3\nSpeed: 30"
   },
   {
    "h": "Naming rules",
    "say": "Names use letters, numbers and underscores, and cannot start with a number. Python cares about capital letters, so Speed and speed are different. By convention we write names in lowercase with underscores.",
    "code": "max_speed = 60\nturn_angle = 90\nis_ready = True\nprint(max_speed, turn_angle, is_ready)",
    "bullets": null,
    "note": null,
    "out": "60 90 True"
   }
  ],
  "task": "Make variables for your robot's name, speed, battery percent and whether it is ready. Print them all in one line.",
  "challenges": [
   "types",
   "fstring"
  ]
 },
 {
  "id": "03",
  "title": "Numbers and maths for robots",
  "emoji": "🧮",
  "mins": 5,
  "goal": "Use arithmetic, rounding and the math module to turn sensor numbers into robot actions.",
  "slides": [
   {
    "h": "Python is a calculator",
    "say": "You can use plus, minus, star for multiply, and slash for divide. Two stars means power. Percent gives the remainder, and double slash divides and drops the decimals.",
    "code": "print(7 + 3, 7 - 3, 7 * 3)\nprint(7 / 2)\nprint(7 // 2)\nprint(7 % 2)\nprint(3 ** 2)",
    "bullets": null,
    "note": null,
    "out": "10 4 21\n3.5\n3\n1\n9"
   },
   {
    "h": "Distance equals speed times time",
    "say": "This is the most useful formula in robotics. If you know how fast the robot moves and how long it drives, you know how far it went. Variables make it easy to change one number and see the result.",
    "code": "speed_mm_s = 100\ntime_s = 4.5\ndistance = speed_mm_s * time_s\nprint(\"Distance:\", distance, \"mm\")",
    "bullets": null,
    "note": null,
    "out": "Distance: 450.0 mm"
   },
   {
    "h": "Rounding",
    "say": "Sensors give numbers with long decimals. The round function tidies them up. The second number says how many decimal places to keep.",
    "code": "reading = 41.66666\nprint(round(reading))\nprint(round(reading, 1))\nprint(round(reading, 2))",
    "bullets": null,
    "note": null,
    "out": "42\n41.7\n41.67"
   },
   {
    "h": "The math module",
    "say": "Python has extra tools in modules. Import math to get square root, pi and trigonometry. Robots use these to work out angles and distances between points.",
    "code": "import math\nprint(math.sqrt(144))\nprint(round(math.pi, 4))\nprint(math.hypot(3, 4))   # straight line distance",
    "bullets": null,
    "note": null,
    "out": "12.0\n3.1416\n5.0"
   },
   {
    "h": "Angles and turning",
    "say": "Trigonometry gives the direction to a target. The atan2 function finds the angle, and degrees converts from radians. This is how a robot works out which way to turn.",
    "code": "import math\ndx, dy = 100, 100\nangle = math.degrees(math.atan2(dy, dx))\nprint(\"Turn to\", angle, \"degrees\")",
    "bullets": null,
    "note": null,
    "out": "Turn to 45.0 degrees"
   },
   {
    "h": "Min, max and clamp",
    "say": "Motors have limits. min and max keep a number inside a safe range. Putting them together makes a clamp, which you will use in almost every control program.",
    "code": "power = 140\nsafe = max(-100, min(100, power))\nprint(safe)\nprint(max(3, 9, 5), min(3, 9, 5))",
    "bullets": null,
    "note": null,
    "out": "100\n9 3"
   }
  ],
  "task": "Work out how long the robot must drive to cover 1.2 metres at 80 mm per second. Print the time rounded to one decimal.",
  "challenges": [
   "rounding",
   "clamp"
  ]
 },
 {
  "id": "04",
  "title": "Strings and f-strings",
  "emoji": "🔤",
  "mins": 4,
  "goal": "Build clear messages and parse text commands from sensors and users.",
  "slides": [
   {
    "h": "Strings are text",
    "say": "A string is text between quote marks, single or double. You can join strings with plus, repeat them with star, and measure them with len.",
    "code": "word = \"UGOT\"\nprint(word + \" robot\")\nprint(word * 3)\nprint(len(word))",
    "bullets": null,
    "note": null,
    "out": "UGOT robot\nUGOTUGOTUGOT\n4"
   },
   {
    "h": "f-strings: the easy way",
    "say": "Put the letter f before the quote and then write variables inside curly brackets. Python fills them in. You can even do maths and rounding inside the brackets.",
    "code": "name = \"UGOT\"\ndistance = 41.6667\nprint(f\"{name} sees an object {distance:.1f} cm away\")\nprint(f\"Double is {distance * 2:.0f}\")",
    "bullets": null,
    "note": null,
    "out": "UGOT sees an object 41.7 cm away\nDouble is 83"
   },
   {
    "h": "Changing case and cleaning",
    "say": "Upper, lower and strip tidy text up. Sensors and people are not consistent, so you clean text before you compare it. Always compare lowercase to lowercase.",
    "code": "command = \"  FORWARD  \"\nclean = command.strip().lower()\nprint(clean)\nprint(clean == \"forward\")",
    "bullets": null,
    "note": null,
    "out": "forward\nTrue"
   },
   {
    "h": "Splitting text",
    "say": "The split method breaks a string into a list of pieces. It is perfect for text commands like move forward 30.",
    "code": "text = \"move forward 30\"\nparts = text.split()\nprint(parts)\nprint(parts[0], parts[2])\nprint(int(parts[2]) * 2)",
    "bullets": null,
    "note": null,
    "out": "['move', 'forward', '30']\nmove 30\n60"
   },
   {
    "h": "Checking inside text",
    "say": "The word in tells you if one piece of text is inside another. startswith and endswith check the ends. This is how a robot can react to a keyword.",
    "code": "speech = \"please turn left now\"\nprint(\"left\" in speech)\nprint(speech.startswith(\"please\"))\nprint(speech.replace(\"left\", \"right\"))",
    "bullets": null,
    "note": null,
    "out": "True\nTrue\nplease turn right now"
   }
  ],
  "task": "Parse the command 'drive 50 mm' into an action, a number and a unit, then print a friendly sentence using an f-string.",
  "challenges": [
   "fstring",
   "parse_command"
  ]
 },
 {
  "id": "05",
  "title": "Decisions with if, elif and else",
  "emoji": "🔀",
  "mins": 5,
  "goal": "Make the robot choose between actions using conditions and comparisons.",
  "slides": [
   {
    "h": "Asking a question",
    "say": "A condition is a question with a True or False answer. Comparison symbols are equal equal, not equal, less than, greater than, and the two with an equals sign. One equals sign stores a value, two equals signs ask a question.",
    "code": "distance = 25\nprint(distance < 30)\nprint(distance == 25)\nprint(distance != 25)\nprint(distance >= 100)",
    "bullets": null,
    "note": null,
    "out": "True\nTrue\nFalse\nFalse"
   },
   {
    "h": "if runs code only when true",
    "say": "After if comes a condition and a colon. The indented lines underneath only run when the condition is True. The indent is how Python knows which lines belong together, so use four spaces.",
    "code": "distance = 25\nif distance < 30:\n    print(\"Obstacle! Stop.\")\nprint(\"Done checking\")",
    "bullets": null,
    "note": null,
    "out": "Obstacle! Stop.\nDone checking"
   },
   {
    "h": "else and elif",
    "say": "Else runs when the condition is false. Elif means else if and lets you test more than two cases. Python checks from the top and stops at the first one that is true, so the order matters.",
    "code": "distance = 45\nif distance < 30:\n    print(\"STOP\")\nelif distance < 60:\n    print(\"SLOW\")\nelse:\n    print(\"GO\")",
    "bullets": null,
    "note": null,
    "out": "SLOW"
   },
   {
    "h": "and, or, not",
    "say": "Combine conditions with and, or, and not. And needs both to be true. Or needs one. Not flips the answer. A robot might stop only when something is close and the way is not clear.",
    "code": "distance = 20\nbattery = 15\nif distance < 30 or battery < 10:\n    print(\"Stop\")\nif distance < 50 and battery > 10:\n    print(\"Careful but OK\")\nprint(not (distance > 30))",
    "bullets": null,
    "note": null,
    "out": "Stop\nCareful but OK\nTrue"
   },
   {
    "h": "Real example: traffic light",
    "say": "Here is a small decision table like the ones in your Criterion B plan. Each branch gives the robot one action. Try changing the colour variable and running it again.",
    "code": "colour = \"red\"\nif colour == \"red\":\n    action = \"stop\"\nelif colour == \"yellow\":\n    action = \"slow\"\nelif colour == \"green\":\n    action = \"go\"\nelse:\n    action = \"ignore\"\nprint(colour, \"->\", action)",
    "bullets": null,
    "note": null,
    "out": "red -> stop"
   },
   {
    "h": "Common mistakes",
    "say": "Three mistakes catch everybody. Forgetting the colon, using one equals sign instead of two, and mixing up the order of elif tests. If your robot always chooses the first branch, check the order of your conditions.",
    "code": "x = 50\n# Wrong order: the first test is true for everything under 100\nif x < 100:\n    print(\"small\")\nelif x < 60:\n    print(\"never reached\")",
    "bullets": null,
    "note": null,
    "out": "small"
   }
  ],
  "task": "Write a function-free program that prints STOP, SLOW or GO from a distance, using your own thresholds.",
  "challenges": [
   "speed_zone",
   "is_centred",
   "which_side"
  ]
 },
 {
  "id": "06",
  "title": "Loops: repeat and repeat",
  "emoji": "🔁",
  "mins": 5,
  "goal": "Use for and while loops so the robot can repeat actions and keep checking its sensors.",
  "slides": [
   {
    "h": "Why loops",
    "say": "A square has four equal sides and four equal turns. Writing the same lines four times is slow and easy to get wrong. A loop repeats code for you.",
    "code": null,
    "bullets": [
     "for loop: repeat a known number of times",
     "while loop: repeat until a condition changes",
     "break and continue give you extra control"
    ],
    "note": null,
    "out": null
   },
   {
    "h": "The for loop",
    "say": "For i in range 5 runs the indented code five times. The counter i goes from zero to four. Use range with two numbers to choose where to start.",
    "code": "for i in range(5):\n    print(\"step\", i)\nfor n in range(1, 4):\n    print(\"count\", n)",
    "bullets": null,
    "note": null,
    "out": "step 0\nstep 1\nstep 2\nstep 3\nstep 4\ncount 1\ncount 2\ncount 3"
   },
   {
    "h": "A square the smart way",
    "say": "Four sides, four turns. The loop makes the program short and it is easy to change to a triangle or a hexagon by changing the numbers.",
    "code": "sides = 4\nfor side in range(sides):\n    print(\"drive 300 mm\")\n    print(\"turn\", 360 // sides, \"degrees\")",
    "bullets": null,
    "note": null,
    "out": "drive 300 mm\nturn 90 degrees\ndrive 300 mm\nturn 90 degrees\ndrive 300 mm\nturn 90 degrees\ndrive 300 mm\nturn 90 degrees"
   },
   {
    "h": "The while loop",
    "say": "A while loop keeps going as long as its condition is true. It is perfect for keep driving until you see something. You must change something inside the loop, or it will never end.",
    "code": "distance = 100\nwhile distance > 30:\n    print(\"distance\", distance, \"- driving\")\n    distance -= 25\nprint(\"Stop at\", distance)",
    "bullets": null,
    "note": null,
    "out": "distance 100 - driving\ndistance 75 - driving\ndistance 50 - driving\nStop at 25"
   },
   {
    "h": "break and continue",
    "say": "Break leaves the loop early. Continue skips to the next round. Together they let a robot ignore a bad reading or stop as soon as it finds what it needs.",
    "code": "readings = [55, 48, 0, 31, 22, 15]\nfor r in readings:\n    if r == 0:\n        continue        # glitch, skip it\n    print(\"reading\", r)\n    if r < 25:\n        print(\"close enough, stop\")\n        break",
    "bullets": null,
    "note": null,
    "out": "reading 55\nreading 48\nreading 31\nreading 22\nclose enough, stop"
   },
   {
    "h": "Accumulating",
    "say": "A loop can build up an answer. Start with a total of zero and add each value. This is how you calculate averages, counts and totals from sensor data.",
    "code": "values = [12, 15, 11, 14]\ntotal = 0\nfor v in values:\n    total += v\nprint(\"total\", total)\nprint(\"average\", total / len(values))",
    "bullets": null,
    "note": null,
    "out": "total 52\naverage 13.0"
   }
  ],
  "task": "Use a loop to print a countdown from 5 to 1 and then Lift off. Then change it to count in steps of 2.",
  "challenges": [
   "countdown",
   "total",
   "steps_until",
   "grid"
  ]
 },
 {
  "id": "07",
  "title": "Lists: a row of values",
  "emoji": "📋",
  "mins": 5,
  "goal": "Store many sensor readings in a list and use indexing, slicing and list methods.",
  "slides": [
   {
    "h": "A list holds many values",
    "say": "A list is written in square brackets with commas between items. It is ideal for a series of sensor readings. len tells you how many items it has.",
    "code": "readings = [52, 50, 49, 47, 44]\nprint(readings)\nprint(len(readings))",
    "bullets": null,
    "note": null,
    "out": "[52, 50, 49, 47, 44]\n5"
   },
   {
    "h": "Indexing starts at zero",
    "say": "Python counts positions from zero, so the first item is at index zero. A negative index counts from the end, so minus one is the last item. Slices take a section.",
    "code": "r = [52, 50, 49, 47, 44]\nprint(r[0])\nprint(r[-1])\nprint(r[1:4])\nprint(r[:2])",
    "bullets": null,
    "note": null,
    "out": "52\n44\n[50, 49, 47]\n[52, 50]"
   },
   {
    "h": "Adding and removing",
    "say": "Append adds to the end. Remove deletes a value. Pop takes one off the end and gives it back. A robot can keep only its latest few readings by appending and popping.",
    "code": "path = []\npath.append(\"forward\")\npath.append(\"left\")\npath.append(\"forward\")\nprint(path)\nprint(path.pop())\nprint(path)",
    "bullets": null,
    "note": null,
    "out": "['forward', 'left', 'forward']\nforward\n['forward', 'left']"
   },
   {
    "h": "Looping through a list",
    "say": "A for loop can visit every item. Use enumerate if you also need the position. This is how you check every reading in turn.",
    "code": "r = [52, 50, 49, 47, 44]\nfor i, v in enumerate(r):\n    print(i, v)",
    "bullets": null,
    "note": null,
    "out": "0 52\n1 50\n2 49\n3 47\n4 44"
   },
   {
    "h": "Useful list functions",
    "say": "sum, min, max and sorted work on whole lists. Combined with len they give an average. Sorted returns a new list without changing the original.",
    "code": "r = [52, 50, 49, 47, 44]\nprint(sum(r), min(r), max(r))\nprint(\"average\", sum(r) / len(r))\nprint(sorted(r))",
    "bullets": null,
    "note": null,
    "out": "242 44 52\naverage 48.4\n[44, 47, 49, 50, 52]"
   },
   {
    "h": "List comprehensions",
    "say": "A comprehension builds a new list in one line. It is a loop and an if, packed together. Here we keep only readings that are inside the sensor's trusted range.",
    "code": "raw = [51, 250, 49, 3, 47]\ngood = [v for v in raw if 4 <= v <= 200]\nprint(good)\ndoubled = [v * 2 for v in good]\nprint(doubled)",
    "bullets": null,
    "note": null,
    "out": "[51, 49, 47]\n[102, 98, 94]"
   }
  ],
  "task": "Given [12, 15, 11, 90, 13] drop the glitch and print the average of what is left.",
  "challenges": [
   "average",
   "filter_spikes",
   "median",
   "make_bins"
  ]
 },
 {
  "id": "08",
  "title": "Dictionaries and tuples",
  "emoji": "🗂️",
  "mins": 5,
  "goal": "Label data with keys, and group related values in tuples.",
  "slides": [
   {
    "h": "A dictionary has keys",
    "say": "A list uses numbers to find items. A dictionary uses names, called keys. It is written with curly brackets. Use a dictionary when each value has a meaning, like a speed and a battery level.",
    "code": "robot = {\"name\": \"UGOT\", \"speed\": 30, \"battery\": 85}\nprint(robot[\"name\"])\nprint(robot[\"battery\"])",
    "bullets": null,
    "note": null,
    "out": "UGOT\n85"
   },
   {
    "h": "Changing a dictionary",
    "say": "Assign to a key to add or change a value. The get method gives a safe default when a key is missing, so your program does not crash.",
    "code": "robot = {\"name\": \"UGOT\", \"speed\": 30}\nrobot[\"speed\"] = 45\nrobot[\"mode\"] = \"patrol\"\nprint(robot)\nprint(robot.get(\"colour\", \"unknown\"))",
    "bullets": null,
    "note": null,
    "out": "{'name': 'UGOT', 'speed': 45, 'mode': 'patrol'}\nunknown"
   },
   {
    "h": "Looping over a dictionary",
    "say": "Items gives you each key and value together. This lets a robot walk through a table, such as what to do for each colour it sees.",
    "code": "actions = {\"red\": \"stop\", \"yellow\": \"slow\", \"green\": \"go\"}\nfor colour, act in actions.items():\n    print(colour, \"->\", act)",
    "bullets": null,
    "note": null,
    "out": "red -> stop\nyellow -> slow\ngreen -> go"
   },
   {
    "h": "Counting with a dictionary",
    "say": "One of the most useful patterns in programming. Go through the data, and for each item add one to its count. The get method starts a missing key at zero.",
    "code": "seen = [\"red\", \"blue\", \"red\", \"green\", \"red\"]\ncounts = {}\nfor c in seen:\n    counts[c] = counts.get(c, 0) + 1\nprint(counts)",
    "bullets": null,
    "note": null,
    "out": "{'red': 3, 'blue': 1, 'green': 1}"
   },
   {
    "h": "Tuples: a fixed pair",
    "say": "A tuple is like a list that cannot change. Round brackets are typical. Tuples are perfect for positions, because x and y belong together. You can unpack them straight into variables.",
    "code": "position = (300, 150)\nx, y = position\nprint(x, y)\nroute = [(0, 0), (300, 0), (300, 150)]\nfor px, py in route:\n    print(\"go to\", px, py)",
    "bullets": null,
    "note": null,
    "out": "300 150\ngo to 0 0\ngo to 300 0\ngo to 300 150"
   },
   {
    "h": "Lookup tables in robot code",
    "say": "A dictionary can replace a long chain of elif. Each colour, command or sensor value points straight to its action. It is shorter to write and easier to extend.",
    "code": "speed_for = {\"clear\": 100, \"near\": 40, \"blocked\": 0}\nstate = \"near\"\nprint(\"Speed:\", speed_for[state])",
    "bullets": null,
    "note": null,
    "out": "Speed: 40"
   }
  ],
  "task": "Count how many times each word appears in 'go stop go go turn stop' and print the most common one.",
  "challenges": [
   "count_items",
   "most_common",
   "route_points"
  ]
 },
 {
  "id": "09",
  "title": "Functions: reusable code",
  "emoji": "🧩",
  "mins": 6,
  "goal": "Package steps into functions with parameters and return values.",
  "slides": [
   {
    "h": "Write it once, use it many times",
    "say": "A function is a named block of code. You define it with def, then call it by name whenever you need it. Functions make robot programs shorter and easier to fix, because a change happens in one place.",
    "code": "def say_ready():\n    print(\"Robot ready\")\n\nsay_ready()\nsay_ready()",
    "bullets": null,
    "note": null,
    "out": "Robot ready\nRobot ready"
   },
   {
    "h": "Parameters",
    "say": "Parameters are inputs. Put them in the brackets when you define the function. When you call it, give the actual values. Now one function can handle any speed or distance.",
    "code": "def drive(distance_mm, speed=100):\n    seconds = distance_mm / speed\n    print(f\"Drive {distance_mm} mm in {seconds} s\")\n\ndrive(300)\ndrive(300, 50)",
    "bullets": null,
    "note": null,
    "out": "Drive 300 mm in 3.0 s\nDrive 300 mm in 6.0 s"
   },
   {
    "h": "Return gives an answer back",
    "say": "Print only shows something. Return hands a value back to the code that called the function, so you can store it and use it later. A function stops as soon as it returns.",
    "code": "def stopping_distance(speed, reaction=0.4):\n    return speed * reaction\n\nd = stopping_distance(200)\nprint(\"Need\", d, \"mm\")\nprint(stopping_distance(100) < 50)",
    "bullets": null,
    "note": null,
    "out": "Need 80.0 mm\nTrue"
   },
   {
    "h": "Functions that decide",
    "say": "A function can contain if statements and return different answers. This is the best way to build the decision tables from your planning. Each function does one clear job.",
    "code": "def zone(distance_cm):\n    if distance_cm < 30:\n        return \"STOP\"\n    elif distance_cm < 60:\n        return \"SLOW\"\n    return \"GO\"\n\nfor d in (10, 45, 90):\n    print(d, zone(d))",
    "bullets": null,
    "note": null,
    "out": "10 STOP\n45 SLOW\n90 GO"
   },
   {
    "h": "Functions calling functions",
    "say": "Big programs are built from small functions that call each other. Each one is simple to test. This is called decomposition, and it is a key idea in your design cycle.",
    "code": "def clamp(v, lo, hi):\n    return max(lo, min(hi, v))\n\ndef motor_power(error, gain=2):\n    return clamp(error * gain, -100, 100)\n\nprint(motor_power(10))\nprint(motor_power(80))\nprint(motor_power(-80))",
    "bullets": null,
    "note": null,
    "out": "20\n100\n-100"
   },
   {
    "h": "Scope: local variables",
    "say": "A variable made inside a function only exists inside it. That keeps functions tidy and stops them from interfering with each other. Pass values in with parameters and out with return.",
    "code": "def double(x):\n    result = x * 2\n    return result\n\nprint(double(21))\nprint(\"result\" in dir())   # False: it stayed inside",
    "bullets": null,
    "note": null,
    "out": "42\nFalse"
   }
  ],
  "task": "Write a function lap_time(distance_mm, speed_mm_s) that returns seconds rounded to 1 decimal, and test it three ways.",
  "challenges": [
   "is_centred",
   "clamp",
   "stopping_distance",
   "drive_time",
   "convert"
  ]
 },
 {
  "id": "10",
  "title": "Cleaning noisy sensor data",
  "emoji": "📡",
  "mins": 6,
  "goal": "Handle spikes, noise and false readings with filters, median, smoothing and debouncing.",
  "slides": [
   {
    "h": "Real sensors are noisy",
    "say": "Sensors never give perfect numbers. A distance sensor can jump to a huge value, or to zero, for a moment. If your robot trusts every reading, it will make silly decisions. Good programmers clean the data first.",
    "code": "readings = [51, 50, 250, 52, 49, 3, 51]\nprint(readings)\nprint(\"average with glitches:\", round(sum(readings) / len(readings), 1))",
    "bullets": null,
    "note": null,
    "out": "[51, 50, 250, 52, 49, 3, 51]\naverage with glitches: 72.3"
   },
   {
    "h": "Range filter",
    "say": "Throw away values outside what the sensor can really measure. A comprehension makes this one line. After filtering, the average is much closer to the truth.",
    "code": "readings = [51, 50, 250, 52, 49, 3, 51]\ngood = [r for r in readings if 4 <= r <= 200]\nprint(good)\nprint(\"average:\", round(sum(good) / len(good), 1))",
    "bullets": null,
    "note": null,
    "out": "[51, 50, 52, 49, 51]\naverage: 50.6"
   },
   {
    "h": "The median",
    "say": "The median is the middle value after sorting. A single big glitch cannot change it much. Many robots take the median of a few quick readings.",
    "code": "import statistics\nreadings = [51, 50, 250, 52, 49]\nprint(\"mean\", sum(readings) / len(readings))\nprint(\"median\", statistics.median(readings))",
    "bullets": null,
    "note": null,
    "out": "mean 90.4\nmedian 51"
   },
   {
    "h": "Smoothing",
    "say": "A moving average blends the new reading with the old. Alpha controls how much you trust the new value. A small alpha is smooth but slow, a large alpha is quick but noisy.",
    "code": "def smooth(values, alpha=0.5):\n    out = [values[0]]\n    for v in values[1:]:\n        out.append(alpha * v + (1 - alpha) * out[-1])\n    return [round(x, 1) for x in out]\n\nprint(smooth([50, 52, 80, 51, 50]))",
    "bullets": null,
    "note": null,
    "out": "[50, 51.0, 65.5, 58.2, 54.1]"
   },
   {
    "h": "Debounce: ignore a single blip",
    "say": "A debounce means do not react until you see the same thing several times in a row. A single wrong colour reading will not make the robot stop. This is how you stop face recognition from flickering.",
    "code": "def stable(values, need=3):\n    run = 1\n    for a, b in zip(values, values[1:]):\n        run = run + 1 if a == b else 1\n        if run >= need:\n            return b\n    return None\n\nprint(stable([\"red\", \"blue\", \"red\", \"red\", \"red\"]))",
    "bullets": null,
    "note": null,
    "out": "red"
   },
   {
    "h": "Calibration",
    "say": "Sensors differ, and light changes. A calibration step measures the real black and white first, then sets the threshold halfway between them. Calibrated robots work in more rooms.",
    "code": "black, white = 18, 82\nthreshold = (black + white) / 2\nprint(\"threshold\", threshold)\nfor reading in (20, 49, 51, 80):\n    print(reading, \"dark\" if reading < threshold else \"light\")",
    "bullets": null,
    "note": null,
    "out": "threshold 50.0\n20 dark\n49 dark\n51 light\n80 light"
   }
  ],
  "task": "Take [30, 31, 0, 29, 300, 30] and return a cleaned average, then try the median as well. Which one is better?",
  "challenges": [
   "smooth",
   "debounce",
   "find_spikes",
   "calibrate",
   "filter_spikes"
  ]
 },
 {
  "id": "11",
  "title": "State machines",
  "emoji": "🚦",
  "mins": 6,
  "goal": "Organise robot behaviour into clear states and transitions.",
  "slides": [
   {
    "h": "Robots are always in some state",
    "say": "Think about the traffic light. It is red, or green, or yellow, never in between. A robot behaves the same way. It is searching, or tracking, or stopped. A state machine makes this explicit, which makes your program much easier to test.",
    "code": null,
    "bullets": [
     "A state is what the robot is doing now",
     "A transition is the rule for changing state",
     "Draw it first, then code it"
    ],
    "note": null,
    "out": null
   },
   {
    "h": "States in code",
    "say": "A string variable can hold the state, and an if chain runs the right code for it. Each pass through the loop is one tick. This is the shape of nearly every UGOT program you will write.",
    "code": "state = \"search\"\nfor tick in range(4):\n    if state == \"search\":\n        print(\"looking for the line\")\n        state = \"follow\"\n    elif state == \"follow\":\n        print(\"following the line\")",
    "bullets": null,
    "note": null,
    "out": "looking for the line\nfollowing the line\nfollowing the line\nfollowing the line"
   },
   {
    "h": "Transitions from sensors",
    "say": "The sensor decides when to change state. Here the robot follows until it sees an obstacle, then stops. Notice that each state has only one job.",
    "code": "readings = [90, 80, 60, 28, 25]\nstate = \"follow\"\nfor d in readings:\n    if state == \"follow\" and d < 30:\n        state = \"stop\"\n    print(d, \"->\", state)",
    "bullets": null,
    "note": null,
    "out": "90 -> follow\n80 -> follow\n60 -> follow\n28 -> stop\n25 -> stop"
   },
   {
    "h": "A transition table",
    "say": "Instead of if chains you can write the rules in a dictionary. The keys are the current state and the event, and the value is the next state. It reads just like your Criterion B diagram.",
    "code": "rules = {\n    (\"search\", \"found\"): \"track\",\n    (\"track\", \"lost\"): \"search\",\n    (\"track\", \"close\"): \"stop\",\n}\nstate = \"search\"\nfor event in [\"found\", \"close\"]:\n    state = rules.get((state, event), state)\n    print(event, \"->\", state)",
    "bullets": null,
    "note": null,
    "out": "found -> track\nclose -> stop"
   },
   {
    "h": "Adding a timer",
    "say": "Many states need to time out, for example search for five seconds then give up. Count ticks in a variable and make the transition when it reaches the limit.",
    "code": "state, ticks = \"search\", 0\nwhile state == \"search\":\n    ticks += 1\n    print(\"searching\", ticks)\n    if ticks == 3:\n        state = \"give_up\"\nprint(state)",
    "bullets": null,
    "note": null,
    "out": "searching 1\nsearching 2\nsearching 3\ngive_up"
   },
   {
    "h": "Test every state",
    "say": "A good test visits every state and every transition at least once. Write the list of events a test will send, and check the states you expect. This is exactly what your test plan in Criterion B does.",
    "code": "def step(state, event):\n    return {(\"idle\",\"start\"):\"run\",(\"run\",\"stop\"):\"idle\"}.get((state, event), state)\n\nassert step(\"idle\",\"start\") == \"run\"\nassert step(\"run\",\"stop\") == \"idle\"\nassert step(\"idle\",\"stop\") == \"idle\"\nprint(\"all transitions pass\")",
    "bullets": null,
    "note": null,
    "out": "all transitions pass"
   }
  ],
  "task": "Design a three-state patrol robot (patrol, avoid, stop) and write the transition table as a dictionary.",
  "challenges": [
   "next_state",
   "ramp",
   "needs_light"
  ]
 },
 {
  "id": "12",
  "title": "Control: P and PID",
  "emoji": "🎯",
  "mins": 7,
  "goal": "Make smooth, accurate motion by turning error into motor power.",
  "slides": [
   {
    "h": "Bang-bang is jerky",
    "say": "The simplest controller is on or off. Turn left if you are too far right, and right if too far left. The robot zig-zags. We want the correction to be big when the error is big, and small when it is small.",
    "code": "error = 30\nprint(\"on/off:\", 100 if error > 0 else -100)\nerror = 2\nprint(\"on/off:\", 100 if error > 0 else -100)",
    "bullets": null,
    "note": null,
    "out": "on/off: 100\non/off: 100"
   },
   {
    "h": "Proportional control",
    "say": "The P in PID means proportional. The correction is the error times a gain called kp. A big error gives a big correction, a small error a small one, and zero error gives no correction.",
    "code": "kp = 1.5\nfor error in (40, 10, 2, 0, -15):\n    print(error, \"->\", kp * error)",
    "bullets": null,
    "note": null,
    "out": "40 -> 60.0\n10 -> 15.0\n2 -> 3.0\n0 -> 0.0\n-15 -> -22.5"
   },
   {
    "h": "Simulating a controller",
    "say": "Let us run it. Each step measures the error, calculates power, and moves the robot a little. Watch the error shrink towards zero. Try changing kp and see what happens.",
    "code": "target, pos, kp = 100, 0, 0.4\nfor step in range(8):\n    error = target - pos\n    pos += kp * error\n    print(step, round(pos, 1), round(error, 1))",
    "bullets": null,
    "note": null,
    "out": "0 40.0 100\n1 64.0 60.0\n2 78.4 36.0\n3 87.0 21.6\n4 92.2 13.0\n5 95.3 7.8\n6 97.2 4.7\n7 98.3 2.8"
   },
   {
    "h": "Too much gain",
    "say": "If kp is too big the robot overshoots the target, and keeps swinging past it. Too small and it is very slow. Finding a good value is called tuning. Try one point nine here and compare.",
    "code": "target, pos, kp = 100, 0, 1.9\nfor step in range(8):\n    error = target - pos\n    pos += kp * error\n    print(step, round(pos, 1))",
    "bullets": null,
    "note": null,
    "out": "0 190.0\n1 19.0\n2 172.9\n3 34.4\n4 159.0\n5 46.9\n6 147.8\n7 57.0"
   },
   {
    "h": "Adding I and D",
    "say": "The I term adds up past error so a small steady offset is eventually removed. The D term looks at how fast the error is changing, which calms the swing. Together they make PID.",
    "code": "def pid(err, prev, total, kp=0.6, ki=0.05, kd=0.2):\n    total += err\n    out = kp * err + ki * total + kd * (err - prev)\n    return out, total\n\nout, total = pid(10, 0, 0)\nprint(round(out, 2))",
    "bullets": null,
    "note": null,
    "out": "8.5"
   },
   {
    "h": "Always clamp the output",
    "say": "Motors have limits. Whatever the controller says, clamp the final power. Also stop when the error is small enough, otherwise the robot will jitter around the target forever.",
    "code": "def p_control(error, kp=2, limit=100, deadband=1):\n    if abs(error) <= deadband:\n        return 0\n    return max(-limit, min(limit, kp * error))\n\nprint(p_control(80), p_control(0.5), p_control(-10))",
    "bullets": null,
    "note": null,
    "out": "100 0 -20"
   }
  ],
  "task": "Change kp until the simulation reaches the target in the fewest steps without overshoot.",
  "challenges": [
   "p_control",
   "pid",
   "ramp"
  ]
 },
 {
  "id": "13",
  "title": "Errors and debugging",
  "emoji": "🐞",
  "mins": 6,
  "goal": "Read error messages, find bugs, and make code safe with try and except.",
  "slides": [
   {
    "h": "Errors are clues",
    "say": "When Python stops with a message, do not panic. Read from the bottom. The last line tells you the kind of error, and the line above tells you where. There are three kinds you will meet most: syntax, name and type errors.",
    "code": "print(speed)",
    "bullets": null,
    "note": null,
    "out": "NameError: name 'speed' is not defined (line 1)"
   },
   {
    "h": "Name and type errors",
    "say": "A name error means you used a variable that does not exist, usually a typo. A type error means you mixed types, like adding text to a number. Convert with int or str to fix it.",
    "code": "speed = 30\nprint(\"Speed is \" + speed)",
    "bullets": null,
    "note": null,
    "out": "TypeError: can only concatenate str (not \"int\") to str (line 2)"
   },
   {
    "h": "Logic errors",
    "say": "The worst bugs make no message at all. The program runs but gives the wrong answer. Use print statements to look inside, and compare what you expected with what you got.",
    "code": "readings = [10, 20, 30]\ntotal = 0\nfor r in readings:\n    total = r      # bug: should be +=\nprint(\"average\", total / len(readings))",
    "bullets": null,
    "note": null,
    "out": "average 10.0"
   },
   {
    "h": "Debug with print",
    "say": "Add a print inside the loop to watch the variable. You will see the problem straight away. Remove the extra prints when it works.",
    "code": "readings = [10, 20, 30]\ntotal = 0\nfor r in readings:\n    total += r\n    print(\"after\", r, \"total is\", total)\nprint(\"average\", total / len(readings))",
    "bullets": null,
    "note": null,
    "out": "after 10 total is 10\nafter 20 total is 30\nafter 30 total is 60\naverage 20.0"
   },
   {
    "h": "try and except",
    "say": "Some errors you cannot prevent, like a sensor returning nothing. Put risky code inside try. If it fails, the except part runs instead of crashing the whole program.",
    "code": "def safe_read(value):\n    try:\n        return float(value)\n    except (ValueError, TypeError):\n        return None\n\nprint(safe_read(\"42.5\"))\nprint(safe_read(\"error\"))\nprint(safe_read(None))",
    "bullets": null,
    "note": null,
    "out": "42.5\nNone\nNone"
   },
   {
    "h": "Asserts: check your assumptions",
    "say": "An assert is a self check. If it is false the program stops and tells you. Use asserts in tests to prove a function does what the test plan says it should.",
    "code": "def clamp(v, lo, hi):\n    return max(lo, min(hi, v))\n\nassert clamp(150, -100, 100) == 100\nassert clamp(-150, -100, 100) == -100\nassert clamp(5, -100, 100) == 5\nprint(\"clamp passes all tests\")",
    "bullets": null,
    "note": null,
    "out": "clamp passes all tests"
   }
  ],
  "task": "Find and fix the bug in a function that is meant to return the largest reading but returns the first one.",
  "challenges": [
   "safe_read",
   "retry",
   "find_spikes"
  ]
 },
 {
  "id": "14",
  "title": "Classes and your own robot project",
  "emoji": "🏗️",
  "mins": 7,
  "goal": "Group data and behaviour into a class, then plan a complete robot program.",
  "slides": [
   {
    "h": "Why classes",
    "say": "A class is a blueprint for an object. It bundles data and the functions that use it. A Robot class holds the position, heading and speed, and has methods to move and turn. It keeps big programs organised.",
    "code": null,
    "bullets": [
     "Attributes are the data inside an object",
     "Methods are the functions inside an object",
     "self means this particular object"
    ],
    "note": null,
    "out": null
   },
   {
    "h": "Your first class",
    "say": "The init method runs when you create an object. Self dot x stores a value in that object. Each object keeps its own values.",
    "code": "class Robot:\n    def __init__(self, name):\n        self.name = name\n        self.x = 0\n        self.y = 0\n\nr = Robot(\"UGOT-1\")\nprint(r.name, r.x, r.y)",
    "bullets": null,
    "note": null,
    "out": "UGOT-1 0 0"
   },
   {
    "h": "Methods",
    "say": "Methods are functions inside the class, and their first parameter is always self. Calling a method changes the object. Here every move is remembered.",
    "code": "class Robot:\n    def __init__(self):\n        self.x, self.y, self.moves = 0, 0, 0\n    def move(self, dx, dy):\n        self.x += dx\n        self.y += dy\n        self.moves += 1\n\nr = Robot()\nr.move(300, 0)\nr.move(0, 150)\nprint(r.x, r.y, r.moves)",
    "bullets": null,
    "note": null,
    "out": "300 150 2"
   },
   {
    "h": "Two robots, two states",
    "say": "Each object has its own data. You can create as many as you like, so a class is perfect for a team or a fleet. Notice they do not affect each other.",
    "code": "class Counter:\n    def __init__(self):\n        self.n = 0\n    def tick(self):\n        self.n += 1\n\na, b = Counter(), Counter()\na.tick(); a.tick(); b.tick()\nprint(a.n, b.n)",
    "bullets": null,
    "note": null,
    "out": "2 1"
   },
   {
    "h": "Putting it together",
    "say": "Here is a tiny complete program. It has a class, a state, a loop, a decision, and a clamp. This is the shape of a real UGOT project. Read it slowly and predict the output before you run it.",
    "code": "class Rover:\n    def __init__(self):\n        self.pos, self.state = 0, \"go\"\n    def tick(self, distance):\n        if distance < 30:\n            self.state = \"stop\"\n        if self.state == \"go\":\n            self.pos += 10\n        return self.state\n\nr = Rover()\nfor d in (80, 60, 40, 25, 70):\n    print(d, r.tick(d), r.pos)",
    "bullets": null,
    "note": null,
    "out": "80 go 10\n60 go 20\n40 go 30\n25 stop 30\n70 stop 30"
   },
   {
    "h": "Plan your project",
    "say": "Before you code, write the plan. What is the goal, what sensors and actuators will you use, what states does it have, and what are your tests. Then code one small piece, test it, and add the next. That is the design cycle in action, and it is exactly what Criteria B and C ask for.",
    "code": null,
    "bullets": [
     "1. Goal and success criteria",
     "2. Inputs, outputs, states",
     "3. Test plan before code",
     "4. Build small, test often, record evidence"
    ],
    "note": null,
    "out": null
   }
  ],
  "task": "Create a Rover class with drive, turn and report methods. Test it with three different routes.",
  "challenges": [
   "robot_class",
   "fib",
   "chunks"
  ]
 }
];
