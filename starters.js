/*
  STARTER TEMPLATES
  =================
  Ready-made programmes for common conditions. They are STARTING POINTS ONLY:
  the physio should check every exercise, dose and setting suits the patient in front of them.

  Each starter uses the exercise ids from exercises.js and each exercise's default dose,
  unless "dose" gives a different one, as { "exercise id": { sets, reps, hold, frequency } }.
    name       Shown on the button.
    about      One line saying who it is for.
    ids        The exercises, in order.
    advice     General advice printed on the handout (optional).
    keepGoing  "How long to keep going" (optional).
    pain       Pain allowed while exercising: 1 = mild ache only, 3 or 5 = up to that out of 10.
    tickChart  true to switch on the weekly tick chart.
*/
window.STARTERS = [
  {
    name: "Knee osteoarthritis",
    about: "Strength and confidence for knee arthritis",
    ids: ["knee-sit-to-stand", "knee-mini-squat", "knee-seated-extension", "knee-straight-leg-raise", "knee-step-up"],
    advice: "Exercise is safe for knee arthritis and is one of the best treatments for it. Some aching while you exercise is normal. Keep going on most days.",
    keepGoing: "For 12 weeks",
    pain: 3,
    tickChart: true
  },
  {
    name: "Knee replacement: first weeks",
    about: "Early exercises after a knee replacement",
    ids: ["postop-ankle-pumps", "knee-static-quads", "postop-short-arc-quads", "knee-heel-slides", "knee-straight-leg-raise"],
    advice: "Do these little and often through the day. Keep walking short distances as your team has shown you.",
    keepGoing: "Until your next appointment",
    pain: 3
  },
  {
    name: "Hip osteoarthritis",
    about: "Strength for hip arthritis",
    ids: ["hip-bridge", "hip-clam", "hip-standing-abduction", "knee-sit-to-stand", "hip-standing-extension"],
    advice: "Exercise is safe for hip arthritis and helps it. Some aching while you exercise is normal. Keep going on most days.",
    keepGoing: "For 12 weeks",
    pain: 3,
    tickChart: true
  },
  {
    name: "Hip replacement: first weeks",
    about: "Early exercises after a hip replacement",
    ids: ["postop-ankle-pumps", "postop-glute-squeeze", "knee-static-quads", "knee-heel-slides", "hip-standing-abduction", "hip-standing-extension"],
    advice: "Do these little and often through the day. Follow any movement advice your surgical team gave you.",
    keepGoing: "Until your next appointment",
    pain: 1,
    dose: { "hip-standing-abduction": { sets: 2, reps: 10, hold: 0, frequency: "3 times a day" }, "hip-standing-extension": { sets: 2, reps: 10, hold: 0, frequency: "3 times a day" } }
  },
  {
    name: "Low back pain",
    about: "Gentle movement and strength for back pain",
    ids: ["back-knee-rolls", "back-pelvic-tilt", "back-cat-camel", "back-knee-to-chest", "hip-bridge", "back-bird-dog"],
    advice: "Back pain is common and usually gets better. Keeping moving helps. Some discomfort while you exercise is OK and is not a sign of harm.",
    keepGoing: "For 6 weeks",
    pain: 3
  },
  {
    name: "Shoulder pain (rotator cuff)",
    about: "Strength for rotator cuff related shoulder pain",
    ids: ["shoulder-band-external-rotation", "shoulder-band-row", "shoulder-blade-squeeze", "shoulder-arm-raise", "shoulder-wall-slide"],
    advice: "Some ache in the shoulder while you exercise is OK. It should settle by the next day. Build up slowly.",
    keepGoing: "For 12 weeks",
    pain: 3
  },
  {
    name: "Stiff shoulder (frozen shoulder)",
    about: "Gentle movement for a stiff shoulder",
    ids: ["shoulder-pendulum", "shoulder-table-slide", "shoulder-wall-slide", "shoulder-arm-raise"],
    advice: "Move little and often. Go to the point of a gentle stretch, not strong pain.",
    keepGoing: "Until your next appointment",
    pain: 3
  },
  {
    name: "Ankle sprain",
    about: "Movement, strength and balance after a sprain",
    ids: ["ankle-alphabet", "ankle-calf-stretch", "ankle-calf-raise", "ankle-toe-raise", "ankle-single-leg-balance"],
    advice: "Moving your ankle early helps it heal. Build up your walking a little each day.",
    keepGoing: "For 6 weeks",
    pain: 3
  },
  {
    name: "Balance and falls prevention",
    about: "Strength and balance to help prevent falls",
    ids: ["knee-sit-to-stand", "ankle-calf-raise", "ankle-toe-raise", "balance-tandem-stance", "balance-marching", "balance-side-step", "balance-heel-toe-walk"],
    advice: "Always have something sturdy to hold on to. Do these 3 times a week. Keep going: the benefit stops if you stop.",
    keepGoing: "For at least 6 months",
    pain: 1,
    tickChart: true,
    dose: {
      "knee-sit-to-stand": { sets: 1, reps: 10, hold: 0, frequency: "3 times a week" },
      "ankle-calf-raise": { sets: 1, reps: 10, hold: 0, frequency: "3 times a week" },
      "ankle-toe-raise": { sets: 1, reps: 10, hold: 0, frequency: "3 times a week" },
      "balance-tandem-stance": { sets: 1, reps: 1, hold: 10, frequency: "3 times a week" },
      "balance-marching": { sets: 1, reps: 20, hold: 0, frequency: "3 times a week" },
      "balance-side-step": { sets: 1, reps: 10, hold: 0, frequency: "3 times a week" },
      "balance-heel-toe-walk": { sets: 1, reps: 10, hold: 0, frequency: "3 times a week" }
    }
  },
  {
    name: "Neck pain",
    about: "Movement and posture for neck pain",
    ids: ["neck-chin-tuck", "neck-rotation", "neck-side-bend", "neck-nod", "shoulder-blade-squeeze"],
    advice: "Neck pain is common and usually gets better. Keep moving your neck gently through the day.",
    keepGoing: "For 6 weeks",
    pain: 1
  }
];
