/* Criterion C quiz bank. Edit questions here. */
window.QUIZ_BANK={
 "topics": {
  "02": {
   "name": "Climbing over Obstacles",
   "emoji": "🧗",
   "mcq": [
    {
     "q": "How does a TOF module measure distance?",
     "o": [
      "It measures how long a laser pulse takes to bounce back",
      "It measures the brightness of the object",
      "It measures the sound of the motors",
      "It counts wheel turns"
     ],
     "c": 0,
     "w": "It sends a laser beam and times the reflection: distance = (speed × time) ÷ 2."
    },
    {
     "q": "In the formula distance = (speed × time) ÷ 2, why divide by 2?",
     "o": [
      "The light has to go there AND back",
      "The sensor has two lenses",
      "Speed is measured twice",
      "The robot has two wheels"
     ],
     "c": 0,
     "w": "The pulse travels to the target and back, so the one-way distance is half."
    },
    {
     "q": "What does the TOF module return when the object is closer than 4 cm?",
     "o": [
      "0",
      "4",
      "200",
      "Error and the program stops"
     ],
     "c": 0,
     "w": "4 cm is the blind spot, and the module returns 0 there."
    },
    {
     "q": "What does it return when the object is farther than 200 cm?",
     "o": [
      "200",
      "0",
      "999",
      "Nothing"
     ],
     "c": 0,
     "w": "The maximum reading is 200, so 200 can also mean \"far away\"."
    },
    {
     "q": "Which block repeats code until a condition is true?",
     "o": [
      "Repeat until",
      "If … then",
      "Forever",
      "Wait"
     ],
     "c": 0,
     "w": "Repeat until runs the blocks again and again until the condition is met."
    },
    {
     "q": "Which sensor would tell you the robot is tilting too much when it climbs?",
     "o": [
      "Gyro / IMU",
      "TOF module",
      "Microphone",
      "Colour sensor"
     ],
     "c": 0,
     "w": "The gyro (IMU) measures tilt and rotation."
    }
   ],
   "fill": [
    {
     "t": "A TOF module can measure distances from ___ cm to 200 cm.",
     "a": [
      "4"
     ],
     "w": "The kit TOF module range is 4–200 cm."
    },
    {
     "t": "A conditional loop that stops when a condition is met is called \"repeat ___\".",
     "a": [
      "until"
     ],
     "w": "Repeat until."
    },
    {
     "t": "while tof_distance_cm() ___ STOP_CM:  # keep driving while the obstacle is FAR",
     "a": [
      ">"
     ],
     "w": "Keep driving while the distance is greater than the stop value."
    }
   ],
   "match": {
    "title": "Match the part to its job",
    "pairs": [
     [
      "TOF module",
      "Measures distance with a laser"
     ],
     [
      "Gyro / IMU",
      "Measures tilt and turning"
     ],
     [
      "Flipper servo",
      "Lifts the front of the car"
     ],
     [
      "Drive motors",
      "Move the car forwards"
     ]
    ]
   }
  },
  "03": {
   "name": "Finding People by Sound",
   "emoji": "🎧",
   "mcq": [
    {
     "q": "Which values can sound direction return?",
     "o": [
      "Front, behind, left, right",
      "Up and down",
      "North and south",
      "Red and blue"
     ],
     "c": 0,
     "w": "The controller reports front, behind, left or right."
    },
    {
     "q": "What is the loudness range of the UGOT sound sensor?",
     "o": [
      "−90 dB to 0 dB",
      "0 to 100 dB",
      "10 to 200 dB",
      "−10 to 10 dB"
     ],
     "c": 0,
     "w": "Loudness is reported from −90 dB (quiet) to 0 dB (loud)."
    },
    {
     "q": "The robot gets closer to a sound. What happens to the loudness value?",
     "o": [
      "It gets greater (closer to 0)",
      "It gets smaller",
      "It stays the same",
      "It becomes negative infinity"
     ],
     "c": 0,
     "w": "Nearer sources sound louder, so the value rises towards 0."
    },
    {
     "q": "Speech monitoring runs for how long before timing out?",
     "o": [
      "3 seconds",
      "30 seconds",
      "1 second",
      "Until the program ends"
     ],
     "c": 0,
     "w": "Monitoring lasts 3 seconds, with the controller light green."
    },
    {
     "q": "Why must you use \"plays speech until done\" inside a forever loop?",
     "o": [
      "A plain \"plays speech\" can cut off and crash the server",
      "It is louder",
      "It changes the language",
      "It saves battery"
     ],
     "c": 0,
     "w": "Plain playback in a forever loop can stop mid-sentence and crash the server."
    },
    {
     "q": "How many characters can the \"heard\" input box match?",
     "o": [
      "20",
      "5",
      "100",
      "Unlimited"
     ],
     "c": 0,
     "w": "The input accepts up to 20 characters, Chinese or English."
    }
   ],
   "fill": [
    {
     "t": "Sound source localisation is ___ by default.",
     "a": [
      "on",
      "enabled",
      "switched on"
     ],
     "w": "It is enabled by default."
    },
    {
     "t": "The speech monitoring block makes the controller light ___ while listening.",
     "a": [
      "green"
     ],
     "w": "The light stays green during monitoring."
    },
    {
     "t": "if level ___ STOP_DB:  # stop when the sound is LOUD ENOUGH",
     "a": [
      ">="
     ],
     "w": "Greater than or equal to the stop value."
    }
   ],
   "match": {
    "title": "Match the block to what it does",
    "pairs": [
     [
      "Sound direction",
      "Tells you front, behind, left or right"
     ],
     [
      "Get loudness",
      "Returns −90 to 0 dB"
     ],
     [
      "Speech heard",
      "Turns what was said into text"
     ],
     [
      "Plays speech until done",
      "Finishes the sentence before moving on"
     ]
    ]
   }
  },
  "05": {
   "name": "Flexible Movement",
   "emoji": "🛞",
   "mcq": [
    {
     "q": "Which direction is 0° on the mecanum wheel car?",
     "o": [
      "Forward",
      "Left",
      "Right",
      "Backward"
     ],
     "c": 0,
     "w": "The car faces forward at 0°. Left and right each use 0–180°."
    },
    {
     "q": "What does \"Mecanum Wheel Car is translated\" do?",
     "o": [
      "Moves in a chosen angle without turning",
      "Spins in place",
      "Plays a sound",
      "Resets the wheels"
     ],
     "c": 0,
     "w": "It moves in a specific direction at a specific speed without rotating."
    },
    {
     "q": "A wheel rotation value is positive. What happens?",
     "o": [
      "The wheel turns forwards",
      "The wheel turns backwards",
      "The wheel stops",
      "The speed is zero"
     ],
     "c": 0,
     "w": "Positive values turn the wheel forwards; negative values turn it backwards."
    },
    {
     "q": "Why can a mecanum car slide sideways?",
     "o": [
      "The rollers on each wheel are angled, and the wheels are combined",
      "It has two engines",
      "It has a rudder",
      "Its wheels are bigger"
     ],
     "c": 0,
     "w": "Angled rollers plus different wheel directions give sideways motion."
    },
    {
     "q": "What does \"turn left/right in place\" change?",
     "o": [
      "The direction the robot faces, not its position",
      "Only its speed",
      "Only its colour",
      "Its battery"
     ],
     "c": 0,
     "w": "It rotates the body on the spot."
    },
    {
     "q": "Which block lets you control each of the four wheels separately?",
     "o": [
      "Wheel rotation",
      "Forward/Backward",
      "Translated",
      "Stop"
     ],
     "c": 0,
     "w": "The wheel rotation block sets each wheel's direction and speed."
    }
   ],
   "fill": [
    {
     "t": "On the mecanum car, 0° means ___.",
     "a": [
      "forward",
      "forwards"
     ],
     "w": "0° is the forward direction."
    },
    {
     "t": "A negative wheel speed makes the wheel turn ___.",
     "a": [
      "backwards",
      "backward"
     ],
     "w": "Negative values reverse the wheel."
    },
    {
     "t": "for angle in DIRECTIONS:  # a ___ loop repeats for each item in the list",
     "a": [
      "for"
     ],
     "w": "A for loop runs once for each item."
    }
   ],
   "match": {
    "title": "Match the block to the movement",
    "pairs": [
     [
      "Translated at 90°",
      "Slides to the side, nose still forward"
     ],
     [
      "Turn in place",
      "Rotates on the spot"
     ],
     [
      "Forward / Backward",
      "Drives straight at a speed"
     ],
     [
      "Wheel rotation",
      "Sets one wheel at a time"
     ]
    ]
   }
  },
  "06": {
   "name": "Observant Eyes",
   "emoji": "👁️",
   "mcq": [
    {
     "q": "What does the \"face was recognized\" block return?",
     "o": [
      "True (1) or False (0)",
      "The name as text",
      "A photo",
      "A number from 1 to 10"
     ],
     "c": 0,
     "w": "It returns True (1) if the specific face is recognised and False (0) if not."
    },
    {
     "q": "Before you can recognise a specific face, what must you do?",
     "o": [
      "Register the face photo and train the model",
      "Plug in a TOF module",
      "Turn off the camera",
      "Play a tone"
     ],
     "c": 0,
     "w": "Faces must be registered so the model can compare them."
    },
    {
     "q": "Which block can tell the gender or whether someone wears a mask?",
     "o": [
      "Identifying human features",
      "Play tone",
      "Switch servo",
      "Compare"
     ],
     "c": 0,
     "w": "The Identifying human features block returns gender and mask information."
    },
    {
     "q": "Why do we wait after moving the camera?",
     "o": [
      "The image blurs while it moves",
      "The servo is loud",
      "The light turns off",
      "The tone plays"
     ],
     "c": 0,
     "w": "A moving camera gives a blurry image and missed faces."
    },
    {
     "q": "Why should you only register classmates' faces with their permission?",
     "o": [
      "Faces are personal data",
      "Cameras break",
      "It is faster",
      "It is a coding rule"
     ],
     "c": 0,
     "w": "Face data is personal, so you need consent and you should delete it afterwards."
    },
    {
     "q": "What does \"Play tone till the end\" do?",
     "o": [
      "Plays the tone and waits for it to finish",
      "Plays it forever",
      "Mutes the robot",
      "Records sound"
     ],
     "c": 0,
     "w": "The program continues after the tone has completely played."
    }
   ],
   "fill": [
    {
     "t": "The face recognition block returns True (1) or ___ (0).",
     "a": [
      "false"
     ],
     "w": "False (0) when the face is not recognised."
    },
    {
     "t": "Before recognition works, you must ___ the face first.",
     "a": [
      "register",
      "train"
     ],
     "w": "Register the face photo so the model can be trained."
    },
    {
     "t": "if face_recognised(\"Amira\") == ___:  # runs when the face IS recognised",
     "a": [
      "true",
      "1"
     ],
     "w": "True or 1 means recognised."
    }
   ],
   "match": {
    "title": "Match the block to its job",
    "pairs": [
     [
      "Face was recognized",
      "True when the target face is seen"
     ],
     [
      "Identifying human features",
      "Gender and mask information"
     ],
     [
      "Play tone till the end",
      "A signal that finishes before the program goes on"
     ],
     [
      "Pan servo",
      "Turns the camera left and right"
     ]
    ]
   }
  },
  "07": {
   "name": "Automatic Patrol",
   "emoji": "🛰️",
   "mcq": [
    {
     "q": "What does \"Get monorail offset\" return?",
     "o": [
      "The distance of the line from the camera centre",
      "The colour of the line",
      "The speed of the car",
      "The battery level"
     ],
     "c": 0,
     "w": "The offset tells how far the line is from the centre; 0 means centred."
    },
    {
     "q": "If offset is large, how should the car steer?",
     "o": [
      "More",
      "Less",
      "Not at all",
      "Backwards only"
     ],
     "c": 0,
     "w": "Proportional steering: the bigger the offset, the bigger the correction."
    },
    {
     "q": "Why use round() before rotating?",
     "o": [
      "The movement block needs whole numbers",
      "To make it faster",
      "To change the colour",
      "To save memory"
     ],
     "c": 0,
     "w": "Axis movement values must be integers."
    },
    {
     "q": "Which block moves the car forward and backward in the X/Y/Z block?",
     "o": [
      "Shift along Y",
      "Shift along X",
      "Rotate along Z",
      "Stop"
     ],
     "c": 0,
     "w": "Y is forward/backward, X is left/right and Z is rotation."
    },
    {
     "q": "What should the patrol robot do when no line is recognised?",
     "o": [
      "Stop",
      "Speed up",
      "Spin forever",
      "Turn off the camera"
     ],
     "c": 0,
     "w": "Failing safe is part of a patrol program."
    },
    {
     "q": "Which sensor does the patrol use to avoid obstacles?",
     "o": [
      "TOF module",
      "Microphone",
      "Colour sensor",
      "Gyro only"
     ],
     "c": 0,
     "w": "The TOF module measures distance."
    }
   ],
   "fill": [
    {
     "t": "Shift along ___ moves the car left and right.",
     "a": [
      "x",
      "x-axis",
      "x axis"
     ],
     "w": "X is left/right."
    },
    {
     "t": "Rotating the car is done along the ___ axis.",
     "a": [
      "z",
      "z-axis",
      "z axis"
     ],
     "w": "Z is rotation."
    },
    {
     "t": "rotate_z(___(offset * KP))  # make it a whole number",
     "a": [
      "round"
     ],
     "w": "round() gives an integer."
    }
   ],
   "match": {
    "title": "Match the axis to the movement",
    "pairs": [
     [
      "Shift along X",
      "Left or right"
     ],
     [
      "Shift along Y",
      "Forward or backward"
     ],
     [
      "Rotate along Z",
      "Turn left or right"
     ],
     [
      "Monorail offset",
      "How far the line is from centre"
     ]
    ]
   }
  },
  "08": {
   "name": "Tracking and Tracing",
   "emoji": "🧭",
   "mcq": [
    {
     "q": "What does the \"Contains\" block check?",
     "o": [
      "Whether the plate text is inside the results",
      "Whether the plate is clean",
      "The plate colour",
      "The plate size"
     ],
     "c": 0,
     "w": "It tests whether the target plate text is in the recognition results."
    },
    {
     "q": "Which logic block means BOTH conditions must be true?",
     "o": [
      "AND",
      "OR",
      "NOT",
      "IF"
     ],
     "c": 0,
     "w": "AND is true only when both conditions are true."
    },
    {
     "q": "How do you write 210 ≤ X ≤ 430 in code?",
     "o": [
      "x >= 210 and x <= 430",
      "x = 210 or 430",
      "x > 430",
      "x == 320"
     ],
     "c": 0,
     "w": "Both limits are joined with AND."
    },
    {
     "q": "Why does the light flash red in the exemplar?",
     "o": [
      "To show the plate has not been found",
      "To show the battery is low",
      "To turn off the camera",
      "To play a tone"
     ],
     "c": 0,
     "w": "The red flash signals that the plate has not been found yet."
    },
    {
     "q": "What can make a plate misread?",
     "o": [
      "Glare or poor light",
      "The wheel colour",
      "The robot name",
      "The laptop brand"
     ],
     "c": 0,
     "w": "Cameras struggle with glare, shadows and low light."
    },
    {
     "q": "Which sensor does the tracking robot rely on most?",
     "o": [
      "Camera",
      "Microphone",
      "Gyro",
      "Gripper"
     ],
     "c": 0,
     "w": "Plate recognition uses the camera."
    }
   ],
   "fill": [
    {
     "t": "The \"___\" block checks whether the target plate is in the results.",
     "a": [
      "contains"
     ],
     "w": "Contains."
    },
    {
     "t": "Both conditions must be true: use ___.",
     "a": [
      "and"
     ],
     "w": "AND."
    },
    {
     "t": "if 210 <= x ___ 430:  # x must also be at most 430",
     "a": [
      "<=",
      "and x <=",
      "<= 430"
     ],
     "w": "Less than or equal to 430."
    }
   ],
   "match": {
    "title": "Match the code to its meaning",
    "pairs": [
     [
      "Plate results",
      "The list of recognised plate texts"
     ],
     [
      "Contains",
      "Checks the target is in the list"
     ],
     [
      "AND",
      "Both conditions true"
     ],
     [
      "Plate centre X",
      "Where the plate is across the image"
     ]
    ]
   }
  },
  "09": {
   "name": "Colour Detective",
   "emoji": "🎨",
   "mcq": [
    {
     "q": "What should you do first when using a colour sensor?",
     "o": [
      "Print what it reads",
      "Move the servo",
      "Turn off the light",
      "Write the final code"
     ],
     "c": 0,
     "w": "Always print the real readings before writing decisions."
    },
    {
     "q": "Why can room light change a colour reading?",
     "o": [
      "The sensor measures reflected light",
      "The servo gets hot",
      "Python is slower",
      "The card changes colour"
     ],
     "c": 0,
     "w": "Reflected light changes with the room lighting."
    },
    {
     "q": "What does a dictionary like BINS store?",
     "o": [
      "Key and value pairs",
      "Only numbers",
      "Only text",
      "Photos"
     ],
     "c": 0,
     "w": "It links each colour (key) to an angle (value)."
    },
    {
     "q": "Why take five readings?",
     "o": [
      "To remove one-off wrong readings",
      "To make the servo faster",
      "To save power",
      "To change colour"
     ],
     "c": 0,
     "w": "The most common value is more reliable than one reading."
    },
    {
     "q": "What should the robot do for an unknown colour?",
     "o": [
      "Do nothing and print a message",
      "Move to a random bin",
      "Stop forever",
      "Restart the computer"
     ],
     "c": 0,
     "w": "A safe default avoids sorting an item into the wrong bin."
    },
    {
     "q": "Which part moves the sorted item to the right place?",
     "o": [
      "Servo",
      "Colour sensor",
      "Laptop",
      "Battery"
     ],
     "c": 0,
     "w": "The servo turns to the bin angle."
    }
   ],
   "fill": [
    {
     "t": "The data type that stores key and value pairs is a ___.",
     "a": [
      "dictionary",
      "dict"
     ],
     "w": "A dictionary."
    },
    {
     "t": "A colour sensor works by measuring ___ light.",
     "a": [
      "reflected"
     ],
     "w": "It measures light reflected from the object."
    },
    {
     "t": "if c ___ BINS:  # check the colour is in the dictionary",
     "a": [
      "in"
     ],
     "w": "The \"in\" keyword tests membership."
    }
   ],
   "match": {
    "title": "Match the part to its job",
    "pairs": [
     [
      "Colour sensor",
      "Reads the colour of an object"
     ],
     [
      "Servo",
      "Turns to the right bin"
     ],
     [
      "Dictionary",
      "Links each colour to an angle"
     ],
     [
      "Shade card",
      "Keeps room light off the sensor"
     ]
    ]
   }
  },
  "10": {
   "name": "Smart Recognition",
   "emoji": "🔎",
   "mcq": [
    {
     "q": "What is \"confidence\" in AI recognition?",
     "o": [
      "How sure the AI is about its answer",
      "The battery level",
      "The speed of the camera",
      "The number of objects"
     ],
     "c": 0,
     "w": "Confidence is a score showing how sure the AI is."
    },
    {
     "q": "Why use a minimum confidence rule?",
     "o": [
      "To stop wrong answers being accepted",
      "To save memory",
      "To speed up the servo",
      "To change the colour"
     ],
     "c": 0,
     "w": "Low-confidence answers are often wrong."
    },
    {
     "q": "What must run before recognition blocks work?",
     "o": [
      "Switch to the AI vision function",
      "Move the servo",
      "Play a tone",
      "Reset the robot"
     ],
     "c": 0,
     "w": "The correct AI vision mode must be switched on first."
    },
    {
     "q": "Which gives a result that can be seen from far away?",
     "o": [
      "Display and light together",
      "Console print only",
      "A small icon",
      "A quiet tone"
     ],
     "c": 0,
     "w": "The B1 target needs the result readable at 2 m."
    },
    {
     "q": "A false positive means…",
     "o": [
      "A wrong object is accepted",
      "The right object is rejected",
      "The camera is off",
      "The result is slow"
     ],
     "c": 0,
     "w": "False positives accept the wrong thing."
    },
    {
     "q": "Which part decides TICK or CROSS?",
     "o": [
      "The if / else in the program",
      "The battery",
      "The wheel",
      "The cable"
     ],
     "c": 0,
     "w": "The decision is made by the if/else."
    }
   ],
   "fill": [
    {
     "t": "A score showing how sure the AI is, is called ___.",
     "a": [
      "confidence"
     ],
     "w": "Confidence."
    },
    {
     "t": "Accepting the wrong object is called a false ___.",
     "a": [
      "positive"
     ],
     "w": "False positive."
    },
    {
     "t": "if name == \"bottle\" and conf ___ MIN_CONFIDENCE:  # at least this sure",
     "a": [
      ">="
     ],
     "w": "Greater than or equal to."
    }
   ],
   "match": {
    "title": "Match the term to its meaning",
    "pairs": [
     [
      "Confidence",
      "How sure the AI is"
     ],
     [
      "False positive",
      "The wrong object is accepted"
     ],
     [
      "Threshold",
      "The lowest score you accept"
     ],
     [
      "Display",
      "Shows the result to the client"
     ]
    ]
   }
  },
  "12": {
   "name": "Smart Sorting",
   "emoji": "📦",
   "mcq": [
    {
     "q": "What does a QR code store?",
     "o": [
      "Text or data a camera can read",
      "A colour only",
      "Sound",
      "Battery level"
     ],
     "c": 0,
     "w": "A QR code holds text or data."
    },
    {
     "q": "Why use a dictionary for bin angles?",
     "o": [
      "Easy to add a bin",
      "It makes the robot faster",
      "It changes the colour",
      "It saves battery"
     ],
     "c": 0,
     "w": "One line per bin and no copied code."
    },
    {
     "q": "What should happen to an unreadable item?",
     "o": [
      "It is held for the operator",
      "It is put in bin A",
      "It is dropped",
      "The program closes"
     ],
     "c": 0,
     "w": "Never guess: a wrong sort is worse than a delay."
    },
    {
     "q": "Why wait after moving the servo gate?",
     "o": [
      "The gate needs time to reach the angle",
      "The camera is slow",
      "Python needs a rest",
      "The bin is full"
     ],
     "c": 0,
     "w": "Releasing too early drops the item in the wrong chute."
    },
    {
     "q": "How do you measure sorting accuracy?",
     "o": [
      "Correct items ÷ total items × 100",
      "Total items × speed",
      "Bins × angle",
      "Time ÷ bins"
     ],
     "c": 0,
     "w": "Accuracy is the percentage that went into the correct bin."
    },
    {
     "q": "Which part makes the physical choice of bin?",
     "o": [
      "Servo gate",
      "Camera",
      "Laptop",
      "Cable"
     ],
     "c": 0,
     "w": "The servo gate directs the item."
    }
   ],
   "fill": [
    {
     "t": "Accuracy = correct ÷ ___ × 100.",
     "a": [
      "total"
     ],
     "w": "Divide by the total number of items."
    },
    {
     "t": "counts[code] ___= 1  # add one to the count",
     "a": [
      "+"
     ],
     "w": "+= adds one."
    },
    {
     "t": "A QR code is read by the ___.",
     "a": [
      "camera"
     ],
     "w": "The camera scans it."
    }
   ],
   "match": {
    "title": "Match the part to its job",
    "pairs": [
     [
      "Camera",
      "Reads the QR / barcode"
     ],
     [
      "Servo gate",
      "Chooses the chute"
     ],
     [
      "Dictionary",
      "Links code to angle"
     ],
     [
      "Counter",
      "Records sorted items for testing"
     ]
    ]
   }
  },
  "04": {
   "name": "Joint Rescue",
   "emoji": "🦾",
   "mcq": [
    {
     "q": "How many joints does the UGOT mechanical arm have, plus a gripper?",
     "o": [
      "3 joints",
      "1 joint",
      "5 joints",
      "No joints"
     ],
     "c": 0,
     "w": "The arm has Joint 1, Joint 2 and Joint 3, plus the gripper."
    },
    {
     "q": "What does action recording do?",
     "o": [
      "Saves servo positions so they can be played back",
      "Records sound",
      "Records video",
      "Saves the battery"
     ],
     "c": 0,
     "w": "It stores the servo rotation positions of a posture, and plays a series back later."
    },
    {
     "q": "What is the default duration of a newly recorded action?",
     "o": [
      "1200 ms",
      "100 ms",
      "5 s",
      "No duration"
     ],
     "c": 0,
     "w": "A new action defaults to 1200 ms."
    },
    {
     "q": "Why should an action not be too short?",
     "o": [
      "The arm could rotate too far",
      "The battery drains",
      "The sound stops",
      "The wheels slip"
     ],
     "c": 0,
     "w": "Very short actions can cause excessive rotation of the arm."
    },
    {
     "q": "Why must you watch the critical angles (for example 180°)?",
     "o": [
      "The arm can rotate the wrong way round",
      "The camera turns off",
      "The program ends",
      "The light changes"
     ],
     "c": 0,
     "w": "Near 180° the arm may rotate in the opposite direction."
    },
    {
     "q": "What is a variable?",
     "o": [
      "A named box that stores data",
      "A kind of wire",
      "A motor",
      "A sensor"
     ],
     "c": 0,
     "w": "A variable stores data under a name so the program can use it."
    }
   ],
   "fill": [
    {
     "t": "The gripper has two states: ___ and close.",
     "a": [
      "open"
     ],
     "w": "Open and close."
    },
    {
     "t": "A recorded arm action is replayed with the block \"Mechanical arm select ___\".",
     "a": [
      "actions",
      "action"
     ],
     "w": "The block is Mechanical arm select actions."
    },
    {
     "t": "GRIP_DISTANCE = 80  # a named number is called a ___",
     "a": [
      "variable",
      "constant"
     ],
     "w": "A variable (or constant) stores a named value."
    }
   ],
   "match": {
    "title": "Match the block to its job",
    "pairs": [
     [
      "Record action",
      "Saves the arm posture"
     ],
     [
      "Gripper",
      "Opens or closes the claw"
     ],
     [
      "Set variable",
      "Stores a value under a name"
     ],
     [
      "Expression recognised",
      "Detects whether someone looks happy or calm"
     ]
    ]
   }
  },
  "13": {
   "name": "Safe Driving",
   "emoji": "🚦",
   "mcq": [
    {
     "q": "What does posture recognition return for a person that is not found?",
     "o": [
      "0",
      "200",
      "−1",
      "The last position"
     ],
     "c": 0,
     "w": "No posture recognised returns the coordinate 0."
    },
    {
     "q": "Which hand signal rule means \"Stop\" in the lesson?",
     "o": [
      "Left hand above the left elbow, and the elbow above the left shoulder",
      "Both hands down",
      "Hands on hips",
      "Left hand on the shoulder"
     ],
     "c": 0,
     "w": "Y differences of at least 50 pixels each."
    },
    {
     "q": "At what speed should the car slow for the \"Take care of children\" sign in the lesson?",
     "o": [
      "30 cm/s",
      "300 cm/s",
      "3 cm/s",
      "0 cm/s"
     ],
     "c": 0,
     "w": "The program slows to 30 cm/s."
    },
    {
     "q": "Which sensor does the traffic-sign program mainly use?",
     "o": [
      "Camera",
      "Microphone",
      "Colour sensor",
      "Gripper"
     ],
     "c": 0,
     "w": "Sign and posture recognition use the camera."
    },
    {
     "q": "In image coordinates, what happens to Y as you go DOWN the picture?",
     "o": [
      "It increases",
      "It decreases",
      "It stays 0",
      "It is negative"
     ],
     "c": 0,
     "w": "Y grows downward, so a hand above the elbow has a smaller Y."
    },
    {
     "q": "Why does the display print a message?",
     "o": [
      "To show the driver what the robot sees",
      "To charge the battery",
      "To move the wheels",
      "To restart"
     ],
     "c": 0,
     "w": "Feedback helps the user trust the robot."
    }
   ],
   "fill": [
    {
     "t": "If no posture is recognised, the coordinate returned is ___.",
     "a": [
      "0",
      "zero"
     ],
     "w": "0."
    },
    {
     "t": "The sign program slows to ___ cm/s for the child sign.",
     "a": [
      "30"
     ],
     "w": "30 cm/s."
    },
    {
     "t": "if sh_y ___ 0:  # only use the value when a person was found",
     "a": [
      "!="
     ],
     "w": "Not equal to 0."
    }
   ],
   "match": {
    "title": "Match the recognition to its use",
    "pairs": [
     [
      "Traffic sign recognition",
      "Slow for the child sign"
     ],
     [
      "Human posture recognition",
      "Detect the Stop hand signal"
     ],
     [
      "Display print",
      "Show a message to the user"
     ],
     [
      "TOF module",
      "Measure distance to an obstacle"
     ]
    ]
   }
  },
  "14": {
   "name": "Precise Delivery",
   "emoji": "📮",
   "mcq": [
    {
     "q": "What does the P in PID steering do?",
     "o": [
      "A bigger offset gives a bigger turn",
      "It plays a tone",
      "It stops the robot",
      "It saves the program"
     ],
     "c": 0,
     "w": "Proportional control multiplies the offset by a coefficient."
    },
    {
     "q": "Why do you round the rotation value?",
     "o": [
      "The movement block only takes whole numbers",
      "To change colour",
      "To go faster",
      "To save battery"
     ],
     "c": 0,
     "w": "Axis values must be integers."
    },
    {
     "q": "Why make a custom function with an input?",
     "o": [
      "Reuse the same code with different values",
      "To change the camera",
      "To add sound",
      "To lengthen the program"
     ],
     "c": 0,
     "w": "Inputs let one function handle different cases."
    },
    {
     "q": "Where does an AprilTag appear in the image as the car approaches (camera facing down)?",
     "o": [
      "It moves from top to bottom",
      "It stays still",
      "It moves left to right",
      "It disappears"
     ],
     "c": 0,
     "w": "The Y position of the tag centre increases."
    },
    {
     "q": "What does the double-track offset equal when the camera is centred on the lane?",
     "o": [
      "0",
      "100",
      "−100",
      "200"
     ],
     "c": 0,
     "w": "The offset is 0 when the centrelines coincide."
    },
    {
     "q": "Which sensor measures the distance to the canteen gate?",
     "o": [
      "TOF module",
      "Camera only",
      "Microphone",
      "Gyro"
     ],
     "c": 0,
     "w": "The TOF module measures distance."
    }
   ],
   "fill": [
    {
     "t": "Rotation value = offset × ___ coefficient.",
     "a": [
      "proportion",
      "proportional",
      "steering",
      "p"
     ],
     "w": "The steering proportion coefficient."
    },
    {
     "t": "A function that takes values when you call it has an ___.",
     "a": [
      "input",
      "parameter"
     ],
     "w": "Input (parameter)."
    },
    {
     "t": "while tof_distance_cm() ___ GATE_CM:  # keep going while FAR from the gate",
     "a": [
      ">"
     ],
     "w": "Greater than."
    }
   ],
   "match": {
    "title": "Match the term to its meaning",
    "pairs": [
     [
      "AprilTag",
      "A square code the camera locates"
     ],
     [
      "Lane offset",
      "Gap to the lane centre"
     ],
     [
      "Custom function",
      "Reusable code with inputs"
     ],
     [
      "TOF",
      "Measures the distance to the gate"
     ]
    ]
   }
  },
  "15": {
   "name": "Community Rescue",
   "emoji": "🚑",
   "mcq": [
    {
     "q": "What does a state variable do?",
     "o": [
      "Remembers which step the robot is in",
      "Plays sound",
      "Measures distance",
      "Charges the battery"
     ],
     "c": 0,
     "w": "It stores the current step, like SEARCH or APPROACH."
    },
    {
     "q": "Why add an emergency stop?",
     "o": [
      "A human must be able to stop a robot near people",
      "To save memory",
      "To speed up the car",
      "To change the display"
     ],
     "c": 0,
     "w": "Safety near people comes first."
    },
    {
     "q": "Why stop 30 cm from a person?",
     "o": [
      "To avoid bumping into them",
      "To save time",
      "To use more battery",
      "To read the sign"
     ],
     "c": 0,
     "w": "A stopping distance prevents collisions."
    },
    {
     "q": "Which sensor measures the distance to the person?",
     "o": [
      "TOF / proximity",
      "Microphone",
      "Colour sensor",
      "Barcode"
     ],
     "c": 0,
     "w": "TOF or a proximity sensor measures distance."
    },
    {
     "q": "In a state machine, what moves the program from SEARCH to APPROACH?",
     "o": [
      "A condition (person visible)",
      "Waiting 10 seconds",
      "Restarting",
      "The battery level"
     ],
     "c": 0,
     "w": "Conditions trigger state changes."
    },
    {
     "q": "What is the best way to test a rescue robot?",
     "o": [
      "Repeat the same course and count the results",
      "Run it once",
      "Skip the tests",
      "Only test the code, not the robot"
     ],
     "c": 0,
     "w": "Repeated, counted trials give evidence."
    }
   ],
   "fill": [
    {
     "t": "The robot should stop ___ cm from the person in the exemplar.",
     "a": [
      "30"
     ],
     "w": "30 cm."
    },
    {
     "t": "A program that moves through steps like SEARCH and APPROACH is a ___ machine.",
     "a": [
      "state"
     ],
     "w": "A state machine."
    },
    {
     "t": "elif state == ___:  # the state name for the final step",
     "a": [
      "\"done\"",
      "done",
      "'done'"
     ],
     "w": "The final state is DONE."
    }
   ],
   "match": {
    "title": "Match the part to its job",
    "pairs": [
     [
      "State variable",
      "Remembers the current step"
     ],
     [
      "TOF sensor",
      "Measures the distance to the person"
     ],
     [
      "Hoist",
      "Lowers the medical kit"
     ],
     [
      "Emergency stop",
      "Lets a human stop the robot"
     ]
    ]
   }
  },
  "py": {
   "name": "Python skills for UGOT",
   "emoji": "🐍",
   "mcq": [
    {
     "q": "Which symbol gives a variable a value?",
     "o": [
      "=",
      "==",
      "!=",
      ":"
     ],
     "c": 0,
     "w": "One = assigns a value. Two == compares."
    },
    {
     "q": "What does print(5 > 3) show?",
     "o": [
      "True",
      "False",
      "5",
      "An error"
     ],
     "c": 0,
     "w": "5 is greater than 3, so the answer is True."
    },
    {
     "q": "Which keyword repeats code while a condition stays true?",
     "o": [
      "while",
      "if",
      "def",
      "import"
     ],
     "c": 0,
     "w": "A while loop repeats while its condition is true."
    },
    {
     "q": "What does range(3) give you?",
     "o": [
      "0, 1, 2",
      "1, 2, 3",
      "0, 1, 2, 3",
      "3 only"
     ],
     "c": 0,
     "w": "range(3) counts 0, 1, 2."
    },
    {
     "q": "Why is indentation important in Python?",
     "o": [
      "It shows which lines belong inside a block",
      "It makes the code faster",
      "It adds colour",
      "It is only for comments"
     ],
     "c": 0,
     "w": "Indented lines belong to the if, while, for or def above them."
    },
    {
     "q": "What does round(2.6) return?",
     "o": [
      "3",
      "2",
      "2.6",
      "26"
     ],
     "c": 0,
     "w": "round() gives the nearest whole number."
    },
    {
     "q": "Which one is a list?",
     "o": [
      "[10, 20, 30]",
      "(10 20 30)",
      "{10; 20}",
      "<10, 20>"
     ],
     "c": 0,
     "w": "Lists use square brackets."
    },
    {
     "q": "What does len([4, 5, 6]) return?",
     "o": [
      "3",
      "4",
      "6",
      "15"
     ],
     "c": 0,
     "w": "len() counts the items in the list."
    },
    {
     "q": "What does def do?",
     "o": [
      "Defines a function",
      "Deletes a variable",
      "Defines a comment",
      "Starts a loop"
     ],
     "c": 0,
     "w": "def creates a function you can reuse."
    },
    {
     "q": "A while True loop has no break and no stop. What happens?",
     "o": [
      "It runs until you stop the program",
      "It runs once",
      "It stops after 10 times",
      "It crashes the laptop at once"
     ],
     "c": 0,
     "w": "while True never ends by itself, so always include a way to stop."
    },
    {
     "q": "Which test means \"at least 50\"?",
     "o": [
      "x >= 50",
      "x > 50",
      "x == 50",
      "x <= 50"
     ],
     "c": 0,
     "w": ">= means greater than or equal to."
    },
    {
     "q": "d = {\"red\": 0, \"blue\": 90}. What is d[\"blue\"]?",
     "o": [
      "90",
      "0",
      "\"red\"",
      "An error"
     ],
     "c": 0,
     "w": "A dictionary looks up a value by its key."
    },
    {
     "q": "What is the best first step when your robot does something unexpected?",
     "o": [
      "print() the values and look",
      "Rewrite everything",
      "Turn the speed up",
      "Ignore it"
     ],
     "c": 0,
     "w": "Printing shows what the program really sees."
    },
    {
     "q": "Why use a named constant like STOP_CM = 15?",
     "o": [
      "You change it in one place after testing",
      "It makes Python faster",
      "It stops the robot",
      "It is required by Python"
     ],
     "c": 0,
     "w": "One named value is easy to tune and easy to read."
    }
   ],
   "fill": [
    {
     "t": "for i in ___(5):  # repeat 5 times",
     "a": [
      "range"
     ],
     "w": "range(5) gives 0 to 4."
    },
    {
     "t": "if x > 3 ___ x < 10:  # BOTH must be true",
     "a": [
      "and"
     ],
     "w": "and needs both conditions to be true."
    },
    {
     "t": "def add(a, b):\n    ___ a + b",
     "a": [
      "return"
     ],
     "w": "return sends a value back."
    },
    {
     "t": "speed = 30  # a named value is called a ___",
     "a": [
      "variable"
     ],
     "w": "A variable stores a value under a name."
    },
    {
     "t": "print(len([1, 2, 3]))  # prints ___",
     "a": [
      "3"
     ],
     "w": "The list has three items."
    },
    {
     "t": "# this is a ___ and Python ignores it",
     "a": [
      "comment"
     ],
     "w": "Comments start with #."
    }
   ],
   "match": {
    "title": "Match the Python word to its job",
    "pairs": [
     [
      "=",
      "Gives a variable a value"
     ],
     [
      "==",
      "Checks if two values are equal"
     ],
     [
      "while",
      "Repeats while a condition is true"
     ],
     [
      "def",
      "Defines a function"
     ],
     [
      "round()",
      "Makes a whole number"
     ],
     [
      "len()",
      "Counts the items in a list"
     ]
    ]
   }
  }
 },
 "order": [
  "02",
  "03",
  "04",
  "05",
  "06",
  "07",
  "08",
  "09",
  "10",
  "12",
  "13",
  "14",
  "15",
  "py"
 ]
};
