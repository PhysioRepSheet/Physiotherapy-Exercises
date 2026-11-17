/*
  BUILT-IN ILLUSTRATIONS
  Each exercise (matched by its id in exercises.js) has a list of "frames": the numbered steps
  shown on the printed handout. On screen the figure moves smoothly between the frames, like a GIF.

  You don't need to edit this file to use your own pictures: set "image" in exercises.js
  and that picture (photo, GIF or AI image) is used instead.

  Drawing area for each frame is 190 wide by 170 high; the floor is at height 160.
  Angles are in degrees: 0 = pointing right, 90 = down, 180 = left, -90 = up.
*/
(function () {
  // Common starting positions
  const lying = (extra) => Object.assign({ hip: [104, 146], torso: 180, armN: { a: [2, 0] } }, extra);
  const straightLeg = { a: [0, 0] };
  const bentLeg = { to: [150, 150], bend: -1, f: 0 };
  const standing = (x, extra) => Object.assign({ hip: [x, 83], torso: -90, legN: { a: [90, 90] }, armN: { a: [92, 88] } }, extra);
  const mat = { type: "mat", x1: 18, x2: 186 };

  window.ILLUSTRATIONS = {
    "knee-static-quads": {
      crop: [0, 72, 190, 98],
      props: [mat, { type: "roll", c: [141, 150], r: 5 }],
      frames: [
        { label: "Relax", pose: lying({ legN: { a: [-7, 6] }, legF: bentLeg }), arrows: [{ from: [141, 116], to: [141, 133] }] },
        { label: "Push knee down", pose: lying({ legN: { a: [0, 0], fr: -100 }, legF: bentLeg }), hold: 1.6 }
      ]
    },
    "knee-straight-leg-raise": {
      crop: [0, 72, 190, 98],
      props: [mat],
      frames: [
        { label: "Start", pose: lying({ legN: straightLeg, legF: bentLeg }), arrows: [{ from: [184, 136], c: [186, 104], to: [168, 92] }] },
        { label: "Lift leg", pose: lying({ legN: { a: [-35, -35] }, legF: bentLeg }), hold: 1.2 }
      ]
    },
    "knee-sit-to-stand": {
      props: [{ type: "chair", x: 26, w: 44, seat: 127 }],
      frames: [
        { label: "Sit", pose: { hip: [52, 121], torso: -82, legN: { a: [0, 90] }, armN: { a: [20, 5] } }, arrows: [{ from: [68, 46], c: [90, 44], to: [102, 60] }] },
        { label: "Lean forward", pose: { hip: [52, 121], torso: -50, legN: { a: [0, 90] }, armN: { a: [12, 2] } }, arrows: [{ from: [124, 120], c: [130, 90], to: [118, 66] }] },
        { label: "Stand up", pose: standing(88), hold: 1 }
      ]
    },
    "knee-heel-slides": {
      crop: [0, 72, 190, 98],
      props: [mat],
      frames: [
        { label: "Start", pose: lying({ legN: straightLeg, legF: straightLeg }), arrows: [{ from: [182, 130], to: [150, 130] }] },
        { label: "Slide heel up", pose: lying({ legN: { to: [142, 150], bend: -1, f: 0 }, legF: straightLeg }) }
      ]
    },
    "hip-bridge": {
      crop: [0, 72, 190, 98],
      props: [mat],
      frames: [
        { label: "Start", pose: lying({ legN: { to: [152, 150], bend: -1, f: 0 }, armN: { a: [3, 3] } }), arrows: [{ from: [92, 128], to: [92, 106] }] },
        { label: "Lift hips", pose: { hip: [97.8, 123], torso: 150, head: { a: 180 }, legN: { to: [152, 150], bend: -1, f: 0 }, armN: { a: [3, 3] } }, hold: 1.2 }
      ]
    },
    "hip-clam": {
      crop: [0, 72, 190, 98],
      props: [mat],
      frames: [
        {
          label: "Lie on side", arrows: [{ from: [140, 128], c: [142, 108], to: [130, 98] }],
          pose: { hip: [100, 142], torso: 180, face: false, armN: { a: [-3, 3] }, armF: { pts: [[26, 148], [40, 132]] },
            legF: { pts: [[127, 147], [152, 148]], f: 0, fl: 6, fh: 2 }, legN: { pts: [[127, 138], [152, 143]], f: 0, fl: 6, fh: 2 } }
        },
        {
          label: "Lift top knee",
          pose: { hip: [100, 142], torso: 180, face: false, armN: { a: [-3, 3] }, armF: { pts: [[26, 148], [40, 132]] },
            legF: { pts: [[127, 147], [152, 148]], f: 0, fl: 6, fh: 2 }, legN: { pts: [[121, 108], [152, 143]], f: 0, fl: 6, fh: 2 } }
        }
      ]
    },
    "hip-standing-abduction": {
      props: [{ type: "table", x1: 6, x2: 52, top: 84 }],
      frames: [
        {
          label: "Stand tall", arrows: [{ from: [122, 152], c: [140, 154], to: [146, 138] }],
          pose: { view: "front", hip: [100, 83], torso: -90, armN: { to: [46, 83], bend: 1 }, armF: { a: [82, 90] },
            legN: { a: [90, 90], f: 180, fl: 6, fh: 1 }, legF: { a: [90, 90], f: 0, fl: 6, fh: 1 } }
        },
        {
          label: "Lift leg out",
          pose: { view: "front", hip: [100, 83], torso: -90, armN: { to: [46, 83], bend: 1 }, armF: { a: [82, 90] },
            legN: { a: [90, 90], f: 180, fl: 6, fh: 1 }, legF: { a: [66, 66], f: 0, fl: 6, fh: 1 } }
        }
      ]
    },
    "ankle-calf-raise": {
      props: [{ type: "table", x1: 120, x2: 186, top: 84 }],
      frames: [
        { label: "Stand", pose: standing(100, { armN: { to: [124, 84], bend: 1 } }), arrows: [{ from: [84, 152], to: [84, 128] }] },
        { label: "Rise onto toes", pose: { hip: [101, 73], torso: -90, legN: { a: [90, 90], f: 55 }, armN: { to: [124, 84], bend: 1 } } }
      ]
    },
    "ankle-alphabet": {
      crop: [10, 40, 170, 130],
      loop: "cycle",
      props: [{ type: "chair", x: 22, w: 44, seat: 127 }, { type: "stool", x: 92, w: 26, top: 129 }],
      frames: [
        { label: "Start", text: [{ x: 132, y: 92, text: "A B C" }],
          pose: { hip: [46, 121], torso: -88, legN: { a: [0, 8] }, legF: { to: [78, 157], bend: -1, f: 0 }, armN: { to: [78, 117], bend: 1 } } },
        { label: "Point toes", text: [{ x: 132, y: 92, text: "A B C" }],
          pose: { hip: [46, 121], torso: -88, legN: { a: [0, 8], fr: -40 }, legF: { to: [78, 157], bend: -1, f: 0 }, armN: { to: [78, 117], bend: 1 } } },
        { label: "Pull toes up", text: [{ x: 132, y: 92, text: "A B C" }],
          pose: { hip: [46, 121], torso: -88, legN: { a: [0, 8], fr: -115 }, legF: { to: [78, 157], bend: -1, f: 0 }, armN: { to: [78, 117], bend: 1 } } }
      ]
    },
    "ankle-single-leg-balance": {
      props: [{ type: "table", x1: 124, x2: 186, top: 84 }],
      frames: [
        { label: "Stand", pose: standing(100, { armN: { to: [128, 84], bend: 1 } }), arrows: [{ from: [80, 152], c: [66, 146], to: [68, 130] }] },
        { label: "Lift one foot", pose: standing(100, { armN: { to: [128, 84], bend: 1 }, legN: { a: [100, 175], f: 85 }, legF: { a: [90, 90] } }), hold: 2 }
      ]
    },
    "back-knee-rolls": {
      crop: [0, 72, 190, 98],
      props: [mat],
      frames: [
        { label: "Start", pose: lying({ legN: bentLeg }), arrows: [{ from: [118, 106], c: [146, 96], to: [150, 118] }] },
        { label: "Roll knees to side", pose: lying({ legN: { pts: [[138, 134], [150, 150]], f: 0 }, legF: { pts: [[141, 125], [153, 148]], f: 0 } }) }
      ]
    },
    "back-knee-to-chest": {
      crop: [0, 72, 190, 98],
      props: [mat],
      frames: [
        { label: "Start", pose: lying({ legN: bentLeg }), arrows: [{ from: [140, 108], c: [118, 84], to: [96, 98] }] },
        { label: "Hug knee in", pose: lying({ legN: { a: [-115, 40] }, legF: bentLeg, armN: { to: [96, 116], bend: 1 } }), hold: 1.6 }
      ]
    },
    "back-cat-camel": {
      crop: [0, 50, 190, 120],
      props: [mat],
      frames: (function () {
        const base = { hip: [62, 116], torso: -8, legN: { a: [90, 180], f: 180, fl: 9 }, armN: { pts: [[108.5, 131], [110, 155]] } };
        return [
          { label: "On all fours", pose: Object.assign({}, base, { head: { a: -8 } }), arrows: [{ from: [85, 96], to: [85, 78] }] },
          { label: "Arch back up", pose: Object.assign({}, base, { curve: 7, head: { a: 55 } }), arrows: [{ from: [85, 64], to: [85, 82] }] },
          { label: "Let back sag", pose: Object.assign({}, base, { curve: -5, head: { a: -35 } }) }
        ];
      })()
    },
    "shoulder-pendulum": {
      crop: [0, 28, 190, 142],
      loop: "pingpong",
      props: [{ type: "table", x1: 128, x2: 186, top: 84 }],
      frames: (function () {
        const pose = (arm) => ({ hip: [72, 83], torso: -35, head: { a: -20 }, armN: { a: [arm, arm] }, armF: { to: [136, 83], bend: 1 },
          legN: { a: [80, 92] }, legF: { a: [100, 95] } });
        return [
          { label: "Let arm hang", pose: pose(90), arrows: [{ from: [92, 126], c: [110, 138], to: [128, 124], both: true }] },
          { label: "Swing forward", pose: pose(68) },
          { label: "Swing back", pose: pose(114) }
        ];
      })()
    },
    "shoulder-wall-slide": {
      props: [{ type: "wall", x: 152, w: 10 }],
      frames: [
        { label: "Hands on wall", pose: standing(110, { armN: { to: [148, 42], bend: 1 } }), arrows: [{ from: [174, 62], to: [174, 20] }] },
        { label: "Slide hands up", pose: standing(110, { armN: { to: [146, 6], bend: 1 } }) }
      ]
    },
    "shoulder-band-external-rotation": {
      props: [{ type: "door", x: 8, y: 74 }, { type: "band", from: [16, 74], hand: "F" }],
      frames: [
        {
          label: "Elbow at side", arrows: [{ from: [122, 92], c: [138, 94], to: [144, 82] }],
          pose: { view: "front", hip: [100, 83], torso: -90, armN: { a: [100, 88] }, armF: { pts: [[116, 74], [104, 78]] },
            legN: { a: [90, 90], f: 180, fl: 6, fh: 1 }, legF: { a: [90, 90], f: 0, fl: 6, fh: 1 } }
        },
        {
          label: "Turn arm out",
          pose: { view: "front", hip: [100, 83], torso: -90, armN: { a: [100, 88] }, armF: { pts: [[116, 74], [143, 74]] },
            legN: { a: [90, 90], f: 180, fl: 6, fh: 1 }, legF: { a: [90, 90], f: 0, fl: 6, fh: 1 } }
        }
      ]
    },
    "neck-chin-tuck": {
      crop: [10, 40, 140, 130],
      props: [{ type: "chair", x: 22, w: 44, seat: 127 }],
      frames: [
        { label: "Sit tall", pose: { hip: [46, 121], torso: -90, head: { shift: [5, 1] }, legN: { a: [0, 90] }, armN: { to: [80, 117], bend: 1 } }, arrows: [{ from: [92, 58], to: [74, 58] }] },
        { label: "Tuck chin in", pose: { hip: [46, 121], torso: -90, head: { shift: [-2, 0] }, legN: { a: [0, 90] }, armN: { to: [80, 117], bend: 1 } }, hold: 1.6 }
      ]
    },
    "neck-rotation": {
      crop: [40, 24, 120, 140],
      props: [{ type: "chairFront", x: 70, w: 60, seat: 127 }],
      frames: (function () {
        const pose = (turn) => ({ view: "front", hip: [100, 121], torso: -90, faceTurn: turn,
          legN: { pts: [[91, 130], [90, 157]], f: 180, fl: 5, fh: 1 }, legF: { pts: [[109, 130], [110, 157]], f: 0, fl: 5, fh: 1 },
          armN: { to: [86, 126], bend: 1 }, armF: { to: [114, 126], bend: -1 } });
        return [
          { label: "Look ahead", pose: pose(0), arrows: [{ from: [82, 42], c: [100, 30], to: [118, 42], both: true }] },
          { label: "Turn one way", pose: pose(1) },
          { label: "Turn the other way", pose: pose(-1) }
        ];
      })()
    }
  };

  // ===================== Added November 2026: wider library =====================
  (function () {
    const lying = (extra) => Object.assign({ hip: [104, 146], torso: 180, armN: { a: [2, 0] } }, extra);
    const bentLeg = { to: [150, 150], bend: -1, f: 0 };
    const standing = (x, extra) => Object.assign({ hip: [x, 83], torso: -90, legN: { a: [90, 90], f: 0 }, armN: { a: [92, 88] } }, extra);
    const sitting = (extra) => Object.assign({ hip: [52, 121], torso: -88, legN: { a: [0, 90], f: 0 }, armN: { to: [84, 118], bend: 1 } }, extra);
    const mat = { type: "mat", x1: 18, x2: 186 };
    const chair = { type: "chair", x: 26, w: 44, seat: 127 };
    const worktopR = { type: "table", x1: 124, x2: 186, top: 84 };
    const worktopL = { type: "table", x1: 6, x2: 56, top: 84 };
    const front = (extra) => Object.assign({ view: "front", hip: [100, 83], torso: -90,
      legN: { a: [90, 90], f: 180, fl: 6, fh: 1 }, legF: { a: [90, 90], f: 0, fl: 6, fh: 1 } }, extra);
    const LYING_CROP = [0, 72, 190, 98];

    Object.assign(window.ILLUSTRATIONS, {
      // ---------- Knee ----------
      "knee-seated-extension": {
        crop: [10, 30, 170, 140],
        props: [chair],
        frames: [
          { label: "Sit tall", pose: sitting({ armN: { to: [62, 124], bend: 1 } }), arrows: [{ from: [100, 154], c: [124, 150], to: [128, 128] }] },
          { label: "Straighten knee", pose: sitting({ armN: { to: [62, 124], bend: 1 }, legN: { a: [0, -4] }, legF: { a: [0, 90], f: 0 } }), hold: 1.2 }
        ]
      },
      "knee-mini-squat": {
        props: [worktopR],
        frames: [
          { label: "Stand", pose: standing(100, { armN: { to: [128, 84], bend: 1 } }), arrows: [{ from: [70, 74], to: [70, 98] }] },
          { label: "Bend knees a little", pose: { hip: [92, 98], torso: -78, legN: { to: [100, 157], bend: -1, f: 0 }, armN: { to: [128, 84], bend: 1 } }, hold: 0.8 }
        ]
      },
      "knee-wall-squat": {
        props: [{ type: "wall", x: 18, w: 10 }],
        frames: [
          { label: "Back on wall", pose: { hip: [37, 83], torso: -90, head: { a: -88 }, legN: { to: [66, 157], bend: -1, f: 0 }, armN: { a: [95, 90] } }, arrows: [{ from: [58, 60], to: [58, 88] }] },
          { label: "Slide down", pose: { hip: [37, 112], torso: -90, head: { a: -88 }, legN: { to: [72, 157], bend: -1, f: 0 }, armN: { a: [95, 90] } }, hold: 1.6 }
        ]
      },
      "knee-step-up": {
        crop: [0, -18, 190, 188],
        props: [{ type: "stool", x: 104, w: 80, top: 138 }],
        frames: [
          { label: "Foot on step", pose: { hip: [80, 83], torso: -88, legN: { to: [116, 135], bend: -1, f: 0 }, legF: { a: [94, 92], f: 0 } }, arrows: [{ from: [56, 70], c: [70, 46], to: [96, 46] }] },
          { label: "Step up", pose: { hip: [116, 63], torso: -90, legN: { a: [90, 90], f: 0 }, legF: { a: [100, 128], f: 60 } }, hold: 0.8 }
        ]
      },
      "knee-hamstring-curl": {
        props: [worktopR],
        frames: [
          { label: "Stand", pose: standing(100, { armN: { to: [128, 84], bend: 1 } }), arrows: [{ from: [86, 150], c: [62, 150], to: [66, 124] }] },
          { label: "Bend knee up", pose: standing(100, { armN: { to: [128, 84], bend: 1 }, legN: { a: [93, 205] }, legF: { a: [90, 90], f: 0 } }), hold: 0.8 }
        ]
      },

      // ---------- Hip ----------
      "hip-side-lying-abduction": {
        crop: [0, 62, 190, 108],
        props: [mat],
        frames: [
          { label: "Lie on side", arrows: [{ from: [172, 128], c: [178, 112], to: [168, 100] }],
            pose: { hip: [100, 142], torso: 180, face: false, armN: { a: [-3, 3] }, armF: { pts: [[26, 148], [40, 132]] },
              legF: { pts: [[128, 152], [150, 150]], f: 0, fl: 6, fh: 2 }, legN: { a: [0, 0], f: 0, fl: 6, fh: 2 } } },
          { label: "Lift top leg",
            pose: { hip: [100, 142], torso: 180, face: false, armN: { a: [-3, 3] }, armF: { pts: [[26, 148], [40, 132]] },
              legF: { pts: [[128, 152], [150, 150]], f: 0, fl: 6, fh: 2 }, legN: { a: [-24, -24], f: -24, fl: 6, fh: 2 } }, hold: 0.8 }
        ]
      },
      "hip-standing-extension": {
        props: [worktopR],
        frames: [
          { label: "Stand tall", pose: standing(100, { armN: { to: [128, 84], bend: 1 } }), arrows: [{ from: [94, 152], c: [80, 156], to: [70, 146] }] },
          { label: "Leg back", pose: standing(100, { armN: { to: [128, 84], bend: 1 }, legN: { a: [114, 114] }, legF: { a: [90, 90], f: 0 } }), hold: 0.8 }
        ]
      },
      "hip-standing-flexion": {
        props: [worktopL],
        frames: [
          { label: "Stand tall", pose: standing(88, { armN: { to: [52, 84], bend: -1 } }), arrows: [{ from: [118, 140], c: [134, 122], to: [126, 102] }] },
          { label: "Lift knee", pose: standing(88, { armN: { to: [52, 84], bend: -1 }, legN: { a: [8, 92], f: 10 }, legF: { a: [90, 90], f: 0 } }), hold: 0.8 }
        ]
      },
      "hip-flexor-stretch": {
        props: [{ type: "stool", x: 66, w: 30, top: 152 }],
        frames: [
          { label: "Kneel on one knee", arrows: [{ from: [76, 98], to: [92, 98] }],
            pose: { hip: [82, 112], torso: -90, legN: { to: [124, 157], bend: -1, f: 0 }, legF: { pts: [[80, 149], [46, 152]], f: 172 }, armN: { to: [112, 112], bend: 1 } } },
          { label: "Hips forward", pose: { hip: [94, 114], torso: -92, legN: { to: [124, 157], bend: -1, f: 0 }, legF: { pts: [[80, 149], [46, 152]], f: 172 }, armN: { to: [118, 116], bend: 1 } }, hold: 2 }
        ]
      },

      // ---------- Ankle ----------
      "ankle-calf-stretch": {
        props: [{ type: "wall", x: 170, w: 10 }],
        frames: [
          { label: "Step one foot back", arrows: [{ from: [88, 84], to: [104, 90] }],
            pose: { hip: [96, 92], torso: -76, legN: { to: [128, 157], bend: -1, f: 0 }, legF: { to: [60, 157], bend: -1, f: 0 }, armN: { to: [166, 58], bend: 1 } } },
          { label: "Lean into the wall", pose: { hip: [104, 96], torso: -70, legN: { to: [128, 157], bend: -1, f: 0 }, legF: { to: [60, 157], bend: -1, f: 0 }, armN: { to: [166, 58], bend: 1 } }, hold: 2 }
        ]
      },
      "ankle-toe-raise": {
        props: [worktopR],
        frames: [
          { label: "Stand", pose: standing(100, { armN: { to: [128, 84], bend: 1 } }), arrows: [{ from: [124, 154], to: [124, 136] }] },
          { label: "Lift toes up", pose: standing(100, { armN: { to: [128, 84], bend: 1 }, legN: { a: [90, 90], f: -28 } }), hold: 0.8 }
        ]
      },
      "ankle-seated-heel-toe": {
        crop: [10, 30, 170, 140],
        loop: "cycle",
        props: [chair],
        frames: [
          { label: "Feet flat", pose: sitting({}), arrows: [{ from: [80, 160], to: [80, 144] }] },
          { label: "Heels up", pose: sitting({ legN: { a: [-6, 82], f: 32 } }) },
          { label: "Toes up", pose: sitting({ legN: { a: [0, 90], f: -30 } }) }
        ]
      },

      // ---------- Back ----------
      "back-pelvic-tilt": {
        crop: LYING_CROP,
        props: [mat],
        frames: [
          { label: "Start", pose: lying({ curve: -3, legN: bentLeg }), arrows: [{ from: [86, 126], to: [86, 140] }] },
          { label: "Flatten back down", pose: lying({ curve: 1, legN: bentLeg }), hold: 1.6 }
        ]
      },
      "back-press-up": {
        crop: [0, 62, 190, 108],
        props: [mat],
        frames: [
          { label: "Lie on your front", arrows: [{ from: [46, 132], c: [44, 112], to: [56, 100] }],
            pose: { hip: [106, 147], torso: 180, face: 90, legN: { a: [1, 0], f: 84 }, armN: { pts: [[78, 150], [64, 151]] } } },
          { label: "Push chest up", pose: { hip: [106, 148], torso: -138, head: { a: -160 }, face: 160, legN: { a: [1, 0], f: 84 }, armN: { to: [70, 153], bend: 1 } }, hold: 1 }
        ]
      },
      "back-bird-dog": {
        crop: [-16, 40, 206, 130],
        props: [mat],
        frames: (function () {
          const base = { hip: [62, 116], torso: -8, head: { a: -8 }, legN: { a: [90, 180], f: 180, fl: 9 }, legF: { a: [90, 180], f: 180, fl: 9 },
            armN: { pts: [[108.5, 131], [110, 155]] }, armF: { pts: [[108.5, 131], [110, 155]] } };
          return [
            { label: "On all fours", pose: base, arrows: [{ from: [124, 112], c: [140, 92], to: [162, 92] }, { from: [48, 140], c: [34, 122], to: [20, 116] }] },
            { label: "Reach arm and leg", pose: Object.assign({}, base, { armN: { a: [-10, -10] }, legF: { a: [184, 184], f: 150, fl: 9 } }), hold: 1.2 }
          ];
        })()
      },
      "back-hamstring-stretch": {
        crop: [10, 30, 170, 140],
        props: [{ type: "chair", x: 20, w: 44, seat: 127 }],
        frames: [
          { label: "Leg out straight", arrows: [{ from: [70, 56], c: [92, 56], to: [100, 72] }],
            pose: { hip: [52, 121], torso: -88, legN: { a: [27, 27], f: -62 }, legF: { a: [0, 90], f: 0 }, armN: { to: [86, 132], bend: 1 } } },
          { label: "Lean forward", pose: { hip: [52, 121], torso: -52, legN: { a: [27, 27], f: -62 }, legF: { a: [0, 90], f: 0 }, armN: { to: [104, 140], bend: 1 } }, hold: 2 }
        ]
      },
      "back-standing-extension": {
        frames: [
          { label: "Stand tall", pose: standing(95, { armN: { to: [86, 82], bend: -1 } }), arrows: [{ from: [116, 22], c: [110, 8], to: [94, 10] }] },
          { label: "Lean back gently", pose: { hip: [99, 83], torso: -104, head: { a: -112 }, legN: { a: [92, 90], f: 0 }, armN: { to: [90, 82], bend: -1 } }, hold: 1 }
        ]
      },

      // ---------- Shoulder ----------
      "shoulder-table-slide": {
        props: [{ type: "chair", x: 14, w: 44, seat: 127 }, { type: "table", x1: 84, x2: 186, top: 96 }],
        frames: [
          { label: "Hand on table", pose: { hip: [40, 121], torso: -88, legN: { a: [0, 90], f: 0 }, armN: { to: [102, 95], bend: 1 } }, arrows: [{ from: [110, 88], to: [150, 88] }] },
          { label: "Slide it forward", pose: { hip: [40, 121], torso: -58, legN: { a: [0, 90], f: 0 }, armN: { to: [122, 95], bend: 1 } }, hold: 1.2 }
        ]
      },
      "shoulder-blade-squeeze": {
        frames: [
          { label: "Stand tall", pose: standing(96, { armN: { a: [92, 2] } }), arrows: [{ from: [84, 52], to: [70, 52] }] },
          { label: "Squeeze shoulder blades", pose: standing(96, { torso: -92, armN: { a: [106, 10] } }), hold: 1.6 }
        ]
      },
      "shoulder-band-row": {
        props: [{ type: "door", x: 176, y: 62 }, { type: "band", from: [178, 62], hand: "N" }],
        frames: [
          { label: "Arms forward", pose: standing(92, { armN: { a: [12, 8] } }), arrows: [{ from: [132, 38], to: [108, 38] }] },
          { label: "Pull elbows back", pose: standing(92, { armN: { a: [118, 4] } }), hold: 0.8 }
        ]
      },
      "shoulder-wall-push-up": {
        props: [{ type: "wall", x: 170, w: 10 }],
        frames: [
          { label: "Arms straight", pose: { hip: [96, 90], torso: -70, head: { a: -68 }, legN: { to: [72, 157], bend: -1, f: 0 }, armN: { to: [167, 46], bend: 1 } }, arrows: [{ from: [126, 26], to: [146, 34] }] },
          { label: "Bend elbows", pose: { hip: [106, 90], torso: -64, head: { a: -62 }, legN: { to: [72, 157], bend: -1, f: 0 }, armN: { to: [167, 46], bend: 1 } }, hold: 0.6 }
        ]
      },
      "shoulder-arm-raise": {
        frames: [
          { label: "Arm by side", pose: standing(84), arrows: [{ from: [104, 96], c: [146, 70], to: [118, 14] }] },
          { label: "Lift arm up", pose: standing(84, { armN: { a: [-70, -72] } }), hold: 0.8 }
        ]
      },

      // ---------- Neck ----------
      "neck-side-bend": {
        crop: [40, 24, 120, 140],
        loop: "cycle",
        props: [{ type: "chairFront", x: 70, w: 60, seat: 127 }],
        frames: (function () {
          const pose = (tilt) => ({ view: "front", hip: [100, 121], torso: -90, head: { a: -90 + tilt },
            legN: { pts: [[91, 130], [90, 157]], f: 180, fl: 5, fh: 1 }, legF: { pts: [[109, 130], [110, 157]], f: 0, fl: 5, fh: 1 },
            armN: { to: [86, 126], bend: 1 }, armF: { to: [114, 126], bend: -1 } });
          return [
            { label: "Look ahead", pose: pose(0), arrows: [{ from: [88, 30], c: [74, 32], to: [70, 46] }] },
            { label: "Ear to shoulder", pose: pose(-40) },
            { label: "Other side", pose: pose(40) }
          ];
        })()
      },
      "neck-nod": {
        crop: [10, 20, 140, 140],
        loop: "cycle",
        props: [{ type: "chair", x: 22, w: 44, seat: 127 }],
        frames: (function () {
          const pose = (a) => ({ hip: [46, 121], torso: -90, head: { a }, legN: { a: [0, 90], f: 0 }, armN: { to: [80, 117], bend: 1 } });
          return [
            { label: "Look ahead", pose: pose(-90), arrows: [{ from: [74, 40], c: [82, 52], to: [74, 64] }] },
            { label: "Chin to chest", pose: pose(-48) },
            { label: "Look up", pose: pose(-122) }
          ];
        })()
      },

      // ---------- Balance ----------
      "balance-tandem-stance": {
        props: [worktopR],
        frames: [
          { label: "Feet together", pose: standing(100, { armN: { to: [128, 84], bend: 1 } }), arrows: [{ from: [96, 150], c: [104, 140], to: [114, 150] }] },
          { label: "Heel to toe", pose: { hip: [104, 83], torso: -90, legN: { to: [116, 157], bend: -1, f: 0 }, legF: { to: [100, 157], bend: -1, f: 0 }, armN: { to: [130, 84], bend: 1 } }, hold: 2 }
        ]
      },
      "balance-marching": {
        loop: "cycle",
        props: [worktopL],
        frames: [
          { label: "Stand tall", pose: standing(88, { armN: { to: [52, 84], bend: -1 } }) },
          { label: "Lift one knee", pose: standing(88, { armN: { to: [52, 84], bend: -1 }, legN: { a: [20, 95], f: 10 }, legF: { a: [90, 90], f: 0 } }) },
          { label: "Lift the other knee", pose: standing(88, { armN: { to: [52, 84], bend: -1 }, legN: { a: [90, 90], f: 0 }, legF: { a: [20, 95], f: 10 } }) }
        ]
      },
      "balance-side-step": {
        loop: "cycle",
        props: [{ type: "table", x1: 40, x2: 160, top: 90 }],
        frames: [
          { label: "Feet together", pose: front({ hip: [86, 83], armN: { to: [66, 90], bend: 1 }, armF: { to: [106, 90], bend: -1 } }), arrows: [{ from: [100, 150], to: [124, 150] }] },
          { label: "Step to the side", pose: front({ hip: [96, 83], armN: { to: [76, 90], bend: 1 }, armF: { to: [116, 90], bend: -1 }, legN: { a: [98, 98], f: 180, fl: 6, fh: 1 }, legF: { a: [74, 74], f: 0, fl: 6, fh: 1 } }) },
          { label: "Feet together again", pose: front({ hip: [110, 83], armN: { to: [90, 90], bend: 1 }, armF: { to: [130, 90], bend: -1 } }) }
        ]
      },
      "balance-heel-toe-walk": {
        loop: "cycle",
        frames: [
          { label: "Heel to toe", pose: { hip: [94, 83], torso: -90, legN: { to: [88, 157], bend: -1, f: 0 }, legF: { to: [102, 157], bend: -1, f: 0 }, armN: { a: [80, 78] }, armF: { a: [100, 98] } }, arrows: [{ from: [88, 136], c: [104, 122], to: [118, 140] }] },
          { label: "Step forward", pose: { hip: [102, 81], torso: -90, legN: { to: [110, 146], bend: -1, f: -8 }, legF: { to: [102, 157], bend: -1, f: 0 }, armN: { a: [86, 84] }, armF: { a: [94, 92] } } },
          { label: "Heel to toe again", pose: { hip: [110, 83], torso: -90, legN: { to: [116, 157], bend: -1, f: 0 }, legF: { to: [102, 157], bend: -1, f: 0 }, armN: { a: [100, 98] }, armF: { a: [80, 78] } } }
        ]
      },

      // ---------- After surgery ----------
      "postop-ankle-pumps": {
        crop: [0, 72, 200, 98],
        loop: "pingpong",
        props: [mat],
        frames: [
          { label: "Pull toes up", pose: lying({ legN: { a: [0, 0], f: -118 } }), arrows: [{ from: [188, 122], c: [196, 132], to: [194, 144], both: true }] },
          { label: "Point toes", pose: lying({ legN: { a: [0, 0], f: -30 } }) }
        ]
      },
      "postop-glute-squeeze": {
        crop: LYING_CROP,
        props: [mat],
        frames: [
          { label: "Relax", pose: lying({ legN: { a: [0, 0] } }), arrows: [{ from: [92, 128], to: [101, 137] }, { from: [118, 128], to: [109, 137] }] },
          { label: "Squeeze", pose: lying({ hip: [104, 145], legN: { a: [0, 0] } }), hold: 1.6 }
        ]
      },
      "postop-short-arc-quads": {
        crop: LYING_CROP,
        props: [mat, { type: "roll", c: [141, 148], r: 8 }],
        frames: [
          { label: "Knee over roll", pose: lying({ legN: { a: [-12, 30], f: -60 }, legF: { a: [0, 0] } }), arrows: [{ from: [184, 152], c: [190, 140], to: [184, 128] }] },
          { label: "Straighten knee", pose: lying({ legN: { a: [-12, -12], f: -100 }, legF: { a: [0, 0] } }), hold: 1.6 }
        ]
      },
      "postop-deep-breathing": {
        crop: [10, 20, 140, 140],
        props: [{ type: "chair", x: 22, w: 44, seat: 127 }],
        frames: [
          { label: "Breathe in", pose: { hip: [46, 121], torso: -90, curve: -3, head: { a: -94 }, legN: { a: [0, 90], f: 0 }, armN: { to: [62, 92], bend: 1 } }, arrows: [{ from: [64, 70], to: [80, 64] }] },
          { label: "Breathe out", pose: { hip: [46, 121], torso: -90, legN: { a: [0, 90], f: 0 }, armN: { to: [60, 94], bend: 1 } }, hold: 1.4 }
        ]
      }
    });
  })();

  // ===================== Added 17 November 2026: 39 exercises awaiting clinical check =====================
  (function () {
    const lying = (extra) => Object.assign({ hip: [104, 146], torso: 180, armN: { a: [2, 0] } }, extra);
    const bentLeg = { to: [150, 150], bend: -1, f: 0 };
    const standing = (x, extra) => Object.assign({ hip: [x, 83], torso: -90, legN: { a: [90, 90], f: 0 }, armN: { a: [92, 88] } }, extra);
    const sitting = (extra) => Object.assign({ hip: [52, 121], torso: -88, legN: { a: [0, 90], f: 0 }, armN: { to: [84, 118], bend: 1 } }, extra);
    const mat = { type: "mat", x1: 18, x2: 186 };
    const chair = { type: "chair", x: 26, w: 44, seat: 127 };
    const worktopR = { type: "table", x1: 124, x2: 186, top: 84 };
    const worktopL = { type: "table", x1: 6, x2: 56, top: 84 };
    const front = (extra) => Object.assign({ view: "front", hip: [100, 83], torso: -90,
      legN: { a: [90, 90], f: 180, fl: 6, fh: 1 }, legF: { a: [90, 90], f: 0, fl: 6, fh: 1 } }, extra);
    const frontSit = (extra) => Object.assign({ view: "front", hip: [100, 121], torso: -90,
      legN: { pts: [[91, 130], [90, 157]], f: 180, fl: 5, fh: 1 }, legF: { pts: [[109, 130], [110, 157]], f: 0, fl: 5, fh: 1 },
      armN: { to: [86, 126], bend: 1 }, armF: { to: [114, 126], bend: -1 } }, extra);
    const LYING_CROP = [0, 72, 190, 98];
    const table = { type: "tableTop", x1: -10, x2: 104, y: 104 };
    const relaxed = { mcp: 10, pip: 14, dip: 8 };
    const onTable = (extra) => Object.assign({ view: "side", at: [104, 95], base: 0 }, relaxed, extra);
    const HAND_CROP = [0, 30, 190, 120];

    Object.assign(window.ILLUSTRATIONS, {
      // ---------- Elbow, wrist and hand ----------
      "hand-elbow-bend": {
        crop: [36, 4, 110, 110],
        frames: [
          { label: "Arm straight", pose: standing(84), arrows: [{ from: [100, 104], c: [124, 92], to: [106, 64] }] },
          { label: "Bend elbow", pose: standing(84, { armN: { a: [96, -62] } }), hold: 0.8 }
        ]
      },
      "hand-forearm-turn": {
        kind: "hand",
        crop: [20, 30, 150, 140],
        frames: [
          { label: "Palm up", hand: { view: "palm", turn: 0 }, arrows: [{ from: [62, 44], c: [95, 30], to: [128, 44], both: true }] },
          { label: "Palm down", hand: { view: "palm", turn: 180 }, hold: 1 }
        ]
      },
      "hand-wrist-bend": {
        kind: "hand",
        crop: HAND_CROP,
        props: [table],
        frames: [
          { label: "Hand over the edge", hand: onTable({}), arrows: [{ from: [150, 112], c: [160, 124], to: [146, 138] }] },
          { label: "Bend hand down", hand: onTable({ wrist: 55 }) },
          { label: "Lift hand up", hand: onTable({ wrist: -50 }) }
        ]
      },
      "hand-grip": {
        kind: "hand",
        crop: HAND_CROP,
        props: [table],
        frames: [
          { label: "Hold the ball", hand: onTable({ mcp: 30, pip: 40, dip: 25, thumb: 40, ball: 12 }), arrows: [{ from: [170, 86], c: [176, 100], to: [168, 114] }] },
          { label: "Squeeze", hand: onTable({ mcp: 62, pip: 78, dip: 50, thumb: 62, ball: 10 }), hold: 1.6 }
        ]
      },
      "hand-tendon-glides": {
        kind: "hand",
        crop: [40, 36, 110, 110],
        loop: "cycle",
        frames: (function () {
          const h = (mcp, pip, dip, thumb) => ({ view: "side", at: [86, 118], base: -90, mcp, pip, dip, thumb });
          return [
            { label: "Straight", hand: h(0, 0, 0, 20) },
            { label: "Hook", hand: h(0, 95, 70, 20) },
            { label: "Fist", hand: h(88, 100, 70, 60) },
            { label: "Table top", hand: h(88, 0, 0, 20) },
            { label: "Flat fist", hand: h(88, 95, 0, 20) }
          ];
        })()
      },
      "hand-wrist-extension-weight": {
        kind: "hand",
        crop: HAND_CROP,
        props: [table],
        frames: [
          { label: "Hand down", hand: onTable({ wrist: 42, mcp: 88, pip: 96, dip: 60, thumb: 70, weight: 10 }), arrows: [{ from: [170, 132], c: [182, 112], to: [168, 88] }] },
          { label: "Lift hand up", hand: onTable({ wrist: -38, mcp: 88, pip: 96, dip: 60, thumb: 70, weight: 10 }), hold: 1 }
        ]
      },
      "hand-thumb-opposition": {
        kind: "hand",
        crop: [20, 30, 150, 140],
        loop: "cycle",
        frames: [
          { label: "Hand open", hand: { view: "palm" } },
          { label: "First finger", hand: { view: "palm", touch: 0 } },
          { label: "Middle finger", hand: { view: "palm", touch: 1 } },
          { label: "Ring finger", hand: { view: "palm", touch: 2 } },
          { label: "Little finger", hand: { view: "palm", touch: 3 } }
        ]
      },
      "hand-finger-spread": {
        kind: "hand",
        crop: [20, 30, 150, 140],
        frames: [
          { label: "Band round fingers", hand: { view: "palm", spread: 2, band: 1 }, arrows: [{ from: [80, 46], to: [62, 42] }, { from: [110, 46], to: [128, 42] }] },
          { label: "Spread fingers", hand: { view: "palm", spread: 11, band: 1 }, hold: 1 }
        ]
      },
      "hand-forearm-twist": {
        kind: "hand",
        crop: [20, 10, 150, 160],
        frames: [
          { label: "Hold it upright", hand: { view: "palm", turn: 0, fist: 1, stick: -90 }, arrows: [{ from: [60, 40], c: [95, 18], to: [130, 40], both: true }] },
          { label: "Turn one way", hand: { view: "palm", turn: 0, fist: 1, stick: -150 } },
          { label: "Other way", hand: { view: "palm", turn: 0, fist: 1, stick: -30 } }
        ]
      },

      // ---------- Shoulder ----------
      "shoulder-isometric": {
        crop: [40, 0, 140, 130],
        props: [{ type: "wall", x: 142, w: 10 }],
        frames: [
          { label: "Fist on the wall", pose: standing(108, { armN: { a: [90, 0] } }), arrows: [{ from: [118, 56], to: [134, 56] }] },
          { label: "Push, do not move", pose: standing(108, { torso: -88, armN: { a: [88, 0] } }), arrows: [{ from: [118, 56], to: [134, 56] }], hold: 2 }
        ]
      },
      "shoulder-lying-arm-raise": {
        crop: LYING_CROP,
        props: [mat],
        frames: [
          { label: "Arm by side", pose: lying({ legN: bentLeg }), arrows: [{ from: [96, 130], c: [92, 96], to: [64, 92] }] },
          { label: "Arm up", pose: lying({ legN: bentLeg, armN: { a: [-90, -90] } }) },
          { label: "Over your head", pose: lying({ legN: bentLeg, armN: { a: [-148, -152] } }), hold: 1 }
        ]
      },
      "shoulder-band-internal-rotation": {
        props: [{ type: "door", x: 176, y: 74 }, { type: "band", from: [176, 74], hand: "F" }],
        frames: [
          { label: "Hand out to side", arrows: [{ from: [140, 84], c: [124, 94], to: [108, 86] }],
            pose: front({ armN: { a: [100, 88] }, armF: { pts: [[116, 74], [143, 74]] } }) },
          { label: "Turn arm in", pose: front({ armN: { a: [100, 88] }, armF: { pts: [[116, 74], [104, 80]] } }), hold: 0.8 }
        ]
      },
      "shoulder-rolls": {
        crop: [36, 0, 120, 120],
        loop: "cycle",
        frames: [
          { label: "Stand tall", pose: standing(96), arrows: [{ from: [112, 44], c: [108, 18], to: [84, 28] }] },
          { label: "Shoulders up", pose: standing(96, { head: { shift: [0, 5] }, armN: { a: [90, 88] } }) },
          { label: "Back and down", pose: standing(96, { torso: -91, armN: { a: [100, 96] } }) }
        ]
      },
      "shoulder-hand-behind-back": {
        crop: [30, 0, 130, 130],
        frames: [
          { label: "Hand behind back", pose: standing(96, { armN: { a: [108, 150] } }), arrows: [{ from: [62, 84], to: [64, 56] }] },
          { label: "Slide hand up", pose: standing(96, { armN: { a: [120, -75] } }), hold: 1.6 }
        ]
      },

      // ---------- Upper back ----------
      "upperback-seated-rotation": {
        crop: [40, 24, 120, 140],
        loop: "cycle",
        props: [{ type: "chairFront", x: 70, w: 60, seat: 127 }],
        frames: (function () {
          const pose = (turn) => frontSit({ faceTurn: turn, armN: { to: [110 + turn * 8, 72], bend: 1 }, armF: { to: [90 + turn * 8, 72], bend: -1 } });
          return [
            { label: "Arms crossed", pose: pose(0), arrows: [{ from: [74, 92], c: [100, 106], to: [126, 92], both: true }] },
            { label: "Turn one way", pose: pose(1), hold: 1 },
            { label: "Other way", pose: pose(-1), hold: 1 }
          ];
        })()
      },
      "upperback-towel-opener": {
        crop: LYING_CROP,
        props: [mat, { type: "roll", c: [72, 149], r: 6 }],
        frames: [
          { label: "Towel under back", pose: lying({ legN: bentLeg }), arrows: [{ from: [92, 128], c: [70, 92], to: [32, 116] }] },
          { label: "Arms over head", pose: lying({ legN: bentLeg, armN: { a: [-170, -178] } }), hold: 2 }
        ]
      },
      "upperback-side-bend": {
        crop: [40, 24, 120, 140],
        loop: "cycle",
        props: [{ type: "chairFront", x: 70, w: 60, seat: 127 }],
        frames: (function () {
          const pose = (t) => frontSit({ torso: -90 + t, head: { a: -90 + t }, armN: { a: [96 - t * 0.2, 92 - t * 0.2] }, armF: { a: [84 - t * 0.2, 88 - t * 0.2] } });
          return [
            { label: "Sit tall", pose: pose(0), arrows: [{ from: [92, 30], c: [76, 32], to: [70, 48] }] },
            { label: "Lean one way", pose: pose(-16), hold: 1 },
            { label: "Other way", pose: pose(16), hold: 1 }
          ];
        })()
      },

      // ---------- Back ----------
      "back-four-point-reach": {
        crop: [-16, 40, 206, 130],
        loop: "cycle",
        props: [mat],
        frames: (function () {
          const base = { hip: [62, 116], torso: -8, head: { a: -8 }, legN: { a: [90, 180], f: 180, fl: 9 }, legF: { a: [90, 180], f: 180, fl: 9 },
            armN: { pts: [[108.5, 131], [110, 155]] }, armF: { pts: [[108.5, 131], [110, 155]] } };
          return [
            { label: "On all fours", pose: base, arrows: [{ from: [124, 112], c: [140, 92], to: [162, 92] }] },
            { label: "Reach one arm", pose: Object.assign({}, base, { armN: { a: [-10, -10] } }), hold: 1.2 },
            { label: "Back to all fours", pose: base, arrows: [{ from: [48, 140], c: [34, 122], to: [20, 116] }] },
            { label: "Reach one leg", pose: Object.assign({}, base, { legF: { a: [184, 184], f: 150, fl: 9 } }), hold: 1.2 }
          ];
        })()
      },
      "back-plank": {
        crop: [0, 62, 190, 108],
        props: [mat],
        frames: (function () {
          const pose = (hipY, t) => ({ hip: [112, hipY], torso: t, head: { a: t }, face: 115,
            armN: { pts: [[68, 152], [42, 154]] }, legN: { pts: [[148, 151], [180, 152]], f: 20, fl: 8 } });
          return [
            { label: "Lie on your front", pose: pose(146, 172), arrows: [{ from: [112, 128], to: [112, 112] }] },
            { label: "Lift hips into a line", pose: pose(130, -164), hold: 2 }
          ];
        })()
      },
      "back-side-plank": {
        crop: [0, 62, 190, 108],
        props: [mat],
        frames: (function () {
          const pose = (hipY, t, arm) => ({ view: "front", hip: [118, hipY], torso: t, head: { a: t },
            armN: { pts: arm }, armF: { a: [t + 180 - 8, t + 180 - 8] },
            legN: { pts: [[154, 152], [180, 153]], f: 0, fl: 5, fh: 1 }, legF: { pts: [[154, 148], [180, 149]], f: 0, fl: 5, fh: 1 } });
          return [
            { label: "Lie on your side", pose: pose(150, -168, [[70, 152], [58, 153]]), arrows: [{ from: [118, 132], to: [118, 116] }] },
            { label: "Lift hips up", pose: pose(134, -152, [[75, 142], [64, 152]]), hold: 2 }
          ];
        })()
      },
      "back-prone-leg-lift": {
        crop: [0, 62, 190, 108],
        props: [mat],
        frames: [
          { label: "Lie on your front", pose: { hip: [106, 147], torso: 180, face: 90, legN: { a: [1, 0], f: 84 }, armN: { pts: [[78, 150], [64, 151]] } }, arrows: [{ from: [172, 140], c: [180, 128], to: [170, 120] }] },
          { label: "Lift one leg", pose: { hip: [106, 147], torso: 180, face: 90, legN: { a: [-13, -13], f: 70 }, legF: { a: [1, 0], f: 84 }, armN: { pts: [[78, 150], [64, 151]] } }, hold: 1.2 }
        ]
      },

      // ---------- Hip ----------
      "hip-lying-abduction": {
        crop: [0, 50, 190, 100],
        frames: (function () {
          const pose = (a) => ({ view: "front", hip: [100, 100], torso: 180, head: { a: 180 },
            armN: { a: [4, 2] }, armF: { a: [-4, -2] },
            legN: { a: [a, a], f: -90, fl: 4, fh: 1 }, legF: { a: [-2, -2], f: -90, fl: 4, fh: 1 } });
          return [
            { label: "Legs straight", pose: pose(2), arrows: [{ from: [178, 120], c: [182, 132], to: [170, 142] }] },
            { label: "Slide leg out", pose: pose(26), hold: 0.8 }
          ];
        })()
      },
      "hip-band-extension": {
        props: [worktopR, { type: "band", from: [10, 154], foot: "N" }],
        frames: [
          { label: "Stand tall", pose: standing(100, { armN: { to: [128, 84], bend: 1 } }), arrows: [{ from: [94, 152], c: [80, 156], to: [70, 146] }] },
          { label: "Leg back", pose: standing(100, { armN: { to: [128, 84], bend: 1 }, legN: { a: [114, 114] }, legF: { a: [90, 90], f: 0 } }), hold: 0.8 }
        ]
      },

      // ---------- Knee ----------
      "knee-lunge": {
        frames: [
          { label: "Step forward", pose: { hip: [96, 86], torso: -90, legN: { to: [124, 157], bend: -1, f: 0 }, legF: { to: [66, 157], bend: -1, f: 60, fl: 9 }, armN: { a: [92, 88] } }, arrows: [{ from: [70, 70], to: [70, 96] }] },
          { label: "Bend both knees", pose: { hip: [94, 110], torso: -90, legN: { to: [124, 157], bend: -1, f: 0 }, legF: { pts: [[78, 146], [56, 152]], f: 56, fl: 9 }, armN: { a: [92, 88] } }, hold: 0.8 }
        ]
      },
      "knee-hip-hinge": {
        frames: [
          { label: "Stand tall", pose: standing(100), arrows: [{ from: [120, 28], c: [146, 34], to: [150, 58] }] },
          { label: "Bend from hips", pose: { hip: [92, 86], torso: -36, head: { a: -30 }, legN: { to: [100, 157], bend: -1, f: 0 }, armN: { a: [88, 88] } }, hold: 0.8 }
        ]
      },
      "knee-single-leg-squat": {
        props: [worktopR],
        frames: [
          { label: "Stand on one leg", pose: standing(100, { armN: { to: [128, 84], bend: 1 }, legF: { a: [70, 100], f: 10 } }), arrows: [{ from: [70, 74], to: [70, 94] }] },
          { label: "Bend knee a little", pose: { hip: [98, 90], torso: -84, legN: { to: [104, 157], bend: -1, f: 0 }, legF: { a: [50, 95], f: 10 }, armN: { to: [128, 84], bend: 1 } }, hold: 0.8 }
        ]
      },

      // ---------- Ankle and foot ----------
      "ankle-single-leg-heel-raise": {
        props: [{ type: "table", x1: 120, x2: 186, top: 84 }],
        frames: [
          { label: "Stand on one leg", pose: standing(100, { armN: { to: [124, 84], bend: 1 }, legF: { a: [96, 150], f: 60 } }), arrows: [{ from: [84, 152], to: [84, 128] }] },
          { label: "Rise onto toes", pose: { hip: [101, 73], torso: -90, legN: { a: [90, 90], f: 55 }, legF: { a: [96, 150], f: 60 }, armN: { to: [124, 84], bend: 1 } }, hold: 0.8 }
        ]
      },
      "ankle-bent-knee-heel-raise": {
        props: [{ type: "table", x1: 120, x2: 186, top: 84 }],
        frames: [
          { label: "Bend knees a little", pose: { hip: [94, 94], torso: -82, legN: { to: [102, 157], bend: -1, f: 0 }, armN: { to: [124, 84], bend: 1 } }, arrows: [{ from: [84, 152], to: [84, 130] }] },
          { label: "Rise onto toes", pose: { hip: [96, 81], torso: -82, legN: { to: [104, 144], bend: -1, f: 58 }, armN: { to: [124, 84], bend: 1 } }, hold: 0.8 }
        ]
      },
      "ankle-soleus-stretch": {
        props: [{ type: "wall", x: 170, w: 10 }],
        frames: [
          { label: "Step one foot back", arrows: [{ from: [92, 92], to: [96, 112] }],
            pose: { hip: [98, 96], torso: -78, legN: { to: [128, 157], bend: -1, f: 0 }, legF: { to: [76, 157], bend: -1, f: 0 }, armN: { to: [166, 62], bend: 1 } } },
          { label: "Bend both knees", pose: { hip: [102, 110], torso: -76, legN: { to: [128, 157], bend: -1, f: 0 }, legF: { to: [76, 157], bend: -1, f: 0 }, armN: { to: [166, 66], bend: 1 } }, hold: 2 }
        ]
      },
      "ankle-plantar-fascia-stretch": {
        crop: [10, 30, 170, 140],
        props: [chair, { type: "band", fromHand: "N", toes: "N" }],
        frames: [
          { label: "Towel round your toes", pose: sitting({ torso: -80, legN: { a: [12, 12], f: -72 }, legF: { a: [0, 90], f: 0 }, armN: { to: [102, 104], bend: 1 } }), arrows: [{ from: [118, 92], to: [102, 86] }] },
          { label: "Pull toes back", pose: sitting({ torso: -84, legN: { a: [12, 12], f: -92 }, legF: { a: [0, 90], f: 0 }, armN: { to: [92, 96], bend: 1 } }), hold: 2 }
        ]
      },
      "ankle-foot-roll": {
        crop: [10, 30, 170, 140],
        props: [chair, { type: "roll", c: [98, 154], r: 6 }],
        frames: [
          { label: "Foot on the bottle", pose: sitting({ legN: { to: [88, 147], bend: -1, f: 2 } }), arrows: [{ from: [96, 136], to: [118, 136], both: true }] },
          { label: "Roll it forward", pose: sitting({ legN: { to: [76, 147], bend: -1, f: 2 } }) },
          { label: "Roll it back", pose: sitting({ legN: { to: [100, 147], bend: -1, f: 2 } }) }
        ]
      },
      "ankle-towel-scrunch": {
        crop: [10, 30, 170, 140],
        props: [chair, { type: "mat", x1: 76, x2: 124 }],
        frames: [
          { label: "Foot on a towel", pose: sitting({ legN: { to: [90, 153], bend: -1, f: 0, fl: 12 } }), arrows: [{ from: [114, 140], to: [102, 140] }] },
          { label: "Scrunch it up", pose: sitting({ legN: { to: [90, 153], bend: -1, f: 0, fl: 8 } }), hold: 1 }
        ]
      },
      "ankle-band-in-out": {
        crop: [52, 96, 96, 72],
        props: [{ type: "chairFront", x: 70, w: 60, seat: 127 }, { type: "band", from: [116, 156], toes: "N" }],
        frames: [
          { label: "Band round foot", pose: frontSit({ legN: { pts: [[91, 130], [90, 155]], f: 180, fl: 10, fh: 1 } }), arrows: [{ from: [74, 160], c: [66, 154], to: [70, 144] }] },
          { label: "Turn foot out", pose: frontSit({ legN: { pts: [[91, 130], [90, 155]], f: 218, fl: 10, fh: 1 } }), hold: 0.8 }
        ]
      },

      // ---------- Balance ----------
      "balance-backwards-walk": {
        loop: "cycle",
        props: [{ type: "table", x1: 20, x2: 180, top: 92 }],
        frames: [
          { label: "Stand tall", pose: standing(120, { armN: { to: [134, 92], bend: 1 } }), arrows: [{ from: [100, 150], to: [76, 150] }] },
          { label: "Step back", pose: { hip: [108, 83], torso: -90, legN: { to: [118, 157], bend: -1, f: 0 }, legF: { to: [94, 157], bend: -1, f: 0 }, armN: { to: [122, 92], bend: 1 } } },
          { label: "Step back again", pose: standing(92, { armN: { to: [106, 92], bend: 1 } }) }
        ]
      },
      "balance-walk-turn": {
        loop: "cycle",
        frames: (function () {
          const walk = (x, faceLeft) => ({ hip: [x, 83], torso: -90, face: faceLeft ? 180 : 0,
            legN: { to: [x + (faceLeft ? -10 : 10), 157], bend: faceLeft ? 1 : -1, f: faceLeft ? 180 : 0 },
            legF: { to: [x + (faceLeft ? 10 : -10), 157], bend: faceLeft ? 1 : -1, f: faceLeft ? 180 : 0 },
            armN: { a: [faceLeft ? 98 : 82, faceLeft ? 98 : 82] }, armF: { a: [faceLeft ? 82 : 98, faceLeft ? 82 : 98] } });
          return [
            { label: "Walk forward", pose: walk(60, false), arrows: [{ from: [120, 20], c: [160, 20], to: [150, 50] }] },
            { label: "Turn round", pose: walk(120, false) },
            { label: "Walk back", pose: walk(120, true) }
          ];
        })()
      },
      "balance-heels-then-toes": {
        loop: "cycle",
        props: [worktopR],
        frames: [
          { label: "Stand tall", pose: standing(100, { armN: { to: [128, 84], bend: 1 } }) },
          { label: "Walk on heels", pose: standing(100, { armN: { to: [128, 84], bend: 1 }, legN: { a: [90, 90], f: -30 } }), arrows: [{ from: [90, 140], to: [110, 140] }], hold: 1 },
          { label: "Walk on toes", pose: { hip: [101, 73], torso: -90, legN: { a: [90, 90], f: 55 }, armN: { to: [124, 84], bend: 1 } }, arrows: [{ from: [90, 140], to: [110, 140] }], hold: 1 }
        ]
      },

      // ---------- Pelvic floor ----------
      "pelvic-long-squeeze": {
        crop: [10, 20, 140, 140],
        props: [{ type: "chair", x: 22, w: 44, seat: 127 }],
        frames: [
          { label: "Sit and relax", pose: { hip: [46, 121], torso: -90, legN: { a: [0, 90], f: 0 }, armN: { to: [80, 117], bend: 1 } } },
          { label: "Squeeze and lift", pose: { hip: [46, 120], torso: -90, legN: { a: [0, 90], f: 0 }, armN: { to: [80, 117], bend: 1 } }, arrows: [{ from: [46, 116], to: [46, 96] }], hold: 2.5 }
        ]
      },
      "pelvic-quick-squeeze": {
        crop: [10, 20, 140, 140],
        props: [{ type: "chair", x: 22, w: 44, seat: 127 }],
        frames: [
          { label: "Relax", pose: { hip: [46, 121], torso: -90, legN: { a: [0, 90], f: 0 }, armN: { to: [80, 117], bend: 1 } } },
          { label: "Quick squeeze", pose: { hip: [46, 120], torso: -90, legN: { a: [0, 90], f: 0 }, armN: { to: [80, 117], bend: 1 } }, arrows: [{ from: [46, 116], to: [46, 96] }], hold: 0.4 }
        ]
      },
      "pelvic-knack": {
        crop: [10, 20, 140, 140],
        props: [{ type: "chair", x: 22, w: 44, seat: 127 }],
        frames: [
          { label: "Squeeze first", pose: { hip: [46, 120], torso: -90, legN: { a: [0, 90], f: 0 }, armN: { to: [80, 117], bend: 1 } }, arrows: [{ from: [46, 116], to: [46, 96] }] },
          { label: "Then cough", pose: { hip: [46, 120], torso: -86, head: { a: -70 }, legN: { a: [0, 90], f: 0 }, armN: { to: [80, 117], bend: 1 } }, arrows: [{ from: [46, 116], to: [46, 96] }], text: [{ x: 76, y: 50, text: "cough" }], hold: 1 }
        ]
      }
    });
  })();
})();
