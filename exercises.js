/*
  EXERCISE LIBRARY
  ================
  This is the only file you need to edit to add, change or remove exercises.

  Each exercise is one block between { and }. Copy an existing block to add a new one.
  Fields:
    id            A short unique name with no spaces (e.g. "knee-straight-leg-raise").
    name          The title patients will see.
    area          Body area. Used for the filter buttons. Use one of the existing areas
                  or type a new one and a new filter button will appear automatically.
    aliases       Optional. Other names physios search for, separated by commas
                  (e.g. "SLR, quadriceps"). Only used by the search box; patients never see them.
    image         Optional. Your own picture, photo or GIF in the "images" folder,
                  e.g. "images/slr.gif". Leave as "" to use the built-in moving illustration.
    instructions  The steps, one per line, in plain English for patients.
                  Keep them easy to read: short sentences (under 15 words), everyday words,
                  one action per step. Say "bottom" not "buttocks", "times" not "reps".
    defaults      The starting parameters. The physio can change these for each patient.
                  sets, reps, hold (seconds) and frequency are all optional.
    progressions  Ways to make it harder. The physio can tick which to show the patient.
    regressions   Ways to make it easier. Same as above.
    video         Optional. A YouTube or Vimeo link, or a file in the "videos" folder
                  (e.g. "videos/bridge.mp4"). Shown on the patient's online page.
*/

window.EXERCISES = [
  // ---------- Knee ----------
{
    id: "knee-static-quads",
    name: "Static quads",
    area: "Knee",
    aliases: "static quadriceps, quads isometric, quad sets, VMO, knee extension",
    image: "",
    instructions: [
      "Sit or lie down with your leg out straight.",
      "Tighten the muscle on the top of your thigh.",
      "Push the back of your knee down into the bed.",
      "Hold it. Then relax slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 5, frequency: "3 times a day" },
    progressions: ["Lift your heel off the bed as you tighten", "Sit with your leg resting on a stool"],
    regressions: ["Do fewer, and hold for a shorter time"],
    video: ""
  },
  {
    id: "knee-straight-leg-raise",
    name: "Straight leg raise",
    area: "Knee",
    aliases: "SLR, quadriceps, quads, hip flexion",
    image: "",
    instructions: [
      "Lie on your back. Bend one knee. Keep the other leg straight.",
      "Tighten the top of your thigh on the straight leg.",
      "Lift the straight leg up to the height of your other knee.",
      "Hold it. Then lower it slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 3, frequency: "Twice a day" },
    progressions: ["Wear an ankle weight (start with half a kilo to 1 kilo)", "Hold your leg up for longer"],
    regressions: ["Lift your leg just a little way", "Do the knee push (static quads) first"],
    video: ""
  },
  {
    id: "knee-sit-to-stand",
    name: "Sit to stand",
    area: "Knee",
    aliases: "STS, squat, chair stand, functional, quadriceps, glutes",
    image: "",
    instructions: [
      "Sit near the front of a firm chair.",
      "Put your feet flat, a little apart.",
      "Lean forward. Stand up. Try not to use your hands.",
      "Sit back down slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Use a lower chair", "Hold a weight against your chest", "Take 3 to 5 seconds to sit down"],
    regressions: ["Use a higher chair, or sit on a cushion", "Push up with your hands"],
    video: ""
  },
  {
    id: "knee-heel-slides",
    name: "Heel slides",
    area: "Knee",
    aliases: "knee flexion, range of movement, ROM, TKR, knee replacement",
    image: "",
    instructions: [
      "Lie on your back with your legs straight.",
      "Slide your heel up towards your bottom. Your knee will bend.",
      "Only go as far as feels OK.",
      "Slide your heel back down until your leg is straight."
    ],
    defaults: { sets: 2, reps: 15, hold: 0, frequency: "3 times a day" },
    progressions: ["Hold your knee bent for 5 seconds", "Sit on a chair and slide your foot back under it"],
    regressions: ["Put a towel or plastic bag under your heel so it slides more easily"],
    video: ""
  },
  {
    id: "knee-seated-extension",
    name: "Sitting knee straightening",
    area: "Knee",
    aliases: "seated knee extension, long arc quads, LAQ, quadriceps, quads, OKC",
    image: "",
    instructions: [
      "Sit on a firm chair with your back straight.",
      "Slowly straighten one knee until your leg is out straight.",
      "Hold it. Then lower your foot slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 3, frequency: "Twice a day" },
    progressions: ["Wear an ankle weight (start with half a kilo to 1 kilo)", "Hold for 5 seconds at the top"],
    regressions: ["Only straighten your knee part of the way"],
    video: ""
  },
  {
    id: "knee-mini-squat",
    name: "Mini squat",
    area: "Knee",
    aliases: "partial squat, quarter squat, quadriceps, glutes, CKC, closed chain",
    image: "",
    instructions: [
      "Stand and hold on to a worktop or chair.",
      "Put your feet a little apart.",
      "Bend your knees a little. Keep your heels down.",
      "Push back up until you are standing tall."
    ],
    defaults: { sets: 3, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Bend your knees a bit further", "Hold on with one hand, then no hands", "Hold at the bottom for 3 seconds"],
    regressions: ["Make the bend smaller", "Hold on with both hands"],
    video: ""
  },
  {
    id: "knee-wall-squat",
    name: "Wall squat",
    area: "Knee",
    aliases: "wall sit, wall slide squat, isometric squat, quadriceps, patellofemoral, PFP",
    image: "",
    instructions: [
      "Stand with your back against a wall.",
      "Put your feet a step away from the wall.",
      "Slide down the wall a little way, bending your knees.",
      "Hold it. Then slide back up."
    ],
    defaults: { sets: 3, reps: 5, hold: 10, frequency: "Once a day" },
    progressions: ["Slide down a bit further", "Hold for longer"],
    regressions: ["Only slide down a little way", "Hold for a shorter time"],
    video: ""
  },
  {
    id: "knee-step-up",
    name: "Step ups",
    area: "Knee",
    aliases: "step up, stair, functional, quadriceps, glutes, CKC",
    image: "",
    instructions: [
      "Stand at the bottom of a stair. Hold the rail.",
      "Step up with one foot.",
      "Push through that foot to stand up on the step.",
      "Step back down slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Use a higher step", "Hold the rail more lightly", "Step down slowly, taking 3 seconds"],
    regressions: ["Use a lower step", "Hold the rail with both hands"],
    video: ""
  },
  {
    id: "knee-hamstring-curl",
    name: "Standing knee bends",
    area: "Knee",
    aliases: "hamstring curl, standing knee flexion, hamstrings, knee flexion",
    image: "",
    instructions: [
      "Stand and hold on to a worktop or chair.",
      "Bend one knee. Bring your heel up towards your bottom.",
      "Keep your knees side by side.",
      "Lower your foot slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Wear an ankle weight", "Hold at the top for 3 seconds"],
    regressions: ["Only lift your heel a little way"],
    video: ""
  },
  // ---------- Hip ----------
{
    id: "hip-bridge",
    name: "Bridge",
    area: "Hip",
    aliases: "glute bridge, gluteus maximus, hip extension, core, lumbar",
    image: "",
    instructions: [
      "Lie on your back. Bend your knees. Put your feet flat on the floor.",
      "Squeeze your bottom.",
      "Lift your hips up until your body makes a straight line.",
      "Hold it. Then lower slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 3, frequency: "Once a day" },
    progressions: ["Do it with one leg up in the air", "Hold at the top for 5 seconds", "Put a band around your knees"],
    regressions: ["Lift up a little less", "Lift your bottom only just off the floor"],
    video: ""
  },
  {
    id: "hip-clam",
    name: "Clam",
    area: "Hip",
    aliases: "clamshell, gluteus medius, glute med, hip abduction, external rotation",
    image: "",
    instructions: [
      "Lie on your side. Bend your hips and knees. Keep your feet together.",
      "Lift your top knee up. Keep your feet touching.",
      "Do not let your hips roll back.",
      "Lower your knee slowly."
    ],
    defaults: { sets: 3, reps: 12, hold: 0, frequency: "Once a day" },
    progressions: ["Put an exercise band around your knees", "Hold your knee up for 3 seconds"],
    regressions: ["Make the movement smaller", "Lie on your back and let one knee drop out to the side"],
    video: ""
  },
  {
    id: "hip-standing-abduction",
    name: "Standing hip abduction",
    area: "Hip",
    aliases: "gluteus medius, glute med, side leg raise, hip abductors",
    image: "",
    instructions: [
      "Stand up tall. Hold on to a kitchen worktop or chair.",
      "Keep your toes pointing forward.",
      "Lift one leg out to the side.",
      "Bring it back slowly. Keep your body straight the whole time."
    ],
    defaults: { sets: 3, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Put an exercise band around your ankles", "Hold on more lightly"],
    regressions: ["Lie on your back and slide your leg out to the side"],
    video: ""
  },
  {
    id: "hip-side-lying-abduction",
    name: "Side lying leg lift",
    area: "Hip",
    aliases: "side lying hip abduction, SLHA, gluteus medius, glute med, abductors",
    image: "",
    instructions: [
      "Lie on your side. Bend your bottom knee to help you balance.",
      "Keep your top leg straight, in line with your body.",
      "Lift your top leg up towards the ceiling.",
      "Lower it slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 2, frequency: "Once a day" },
    progressions: ["Wear an ankle weight", "Hold at the top for 5 seconds"],
    regressions: ["Lift your leg only a little way", "Do the clam exercise instead"],
    video: ""
  },
  {
    id: "hip-standing-extension",
    name: "Standing leg back",
    area: "Hip",
    aliases: "standing hip extension, gluteus maximus, glutes, hip extensors",
    image: "",
    instructions: [
      "Stand tall. Hold on to a worktop or chair.",
      "Keep your leg straight.",
      "Move it backwards. Do not lean forward.",
      "Bring it back slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Put an exercise band around your ankles", "Hold at the back for 3 seconds"],
    regressions: ["Make the movement smaller"],
    video: ""
  },
  {
    id: "hip-standing-flexion",
    name: "Standing knee lift",
    area: "Hip",
    aliases: "standing hip flexion, hip flexors, iliopsoas, marching",
    image: "",
    instructions: [
      "Stand tall. Hold on to a worktop or chair.",
      "Lift one knee up in front of you.",
      "Lift it as high as feels OK.",
      "Lower your foot slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Wear an ankle weight", "Hold your knee up for 3 seconds"],
    regressions: ["Do it sitting on a chair"],
    video: ""
  },
  {
    id: "hip-flexor-stretch",
    name: "Front of hip stretch",
    area: "Hip",
    aliases: "hip flexor stretch, half kneeling stretch, iliopsoas, rectus femoris",
    image: "",
    instructions: [
      "Kneel on one knee on a cushion. Put your other foot in front.",
      "Keep your body upright.",
      "Gently move your hips forward.",
      "You should feel a stretch at the front of your hip. Hold it."
    ],
    defaults: { sets: 1, reps: 3, hold: 30, frequency: "Twice a day" },
    progressions: ["Reach the arm on the kneeling side up over your head"],
    regressions: ["Do it standing: take a big step forward and bend your front knee", "Hold on to a chair for balance"],
    video: ""
  },
  // ---------- Ankle ----------
{
    id: "ankle-calf-raise",
    name: "Calf raises",
    area: "Ankle",
    aliases: "heel raise, calf, gastrocnemius, soleus, plantarflexion, Achilles",
    image: "",
    instructions: [
      "Stand and hold on to a worktop or chair.",
      "Go up onto your toes, as high as you can.",
      "Lower your heels back down slowly."
    ],
    defaults: { sets: 3, reps: 15, hold: 0, frequency: "Once a day" },
    progressions: ["Do it on one leg", "Stand on the edge of a step"],
    regressions: ["Do it sitting down", "Hold on with both hands"],
    video: ""
  },
  {
    id: "ankle-alphabet",
    name: "Ankle alphabet",
    area: "Ankle",
    aliases: "ankle range of movement, ROM, ankle sprain, mobility",
    image: "",
    instructions: [
      "Sit down. Rest your leg on a stool so your foot hangs off the end.",
      "Pretend your big toe is a pen.",
      "Write the letters A to Z in the air.",
      "Only move your ankle. Keep your leg still."
    ],
    defaults: { sets: 1, reps: 1, hold: 0, frequency: "3 times a day" },
    progressions: ["Put an exercise band around your foot"],
    regressions: ["Just move your foot up and down"],
    video: ""
  },
  {
    id: "ankle-single-leg-balance",
    name: "Single leg balance",
    area: "Ankle",
    aliases: "SLS, single leg stance, proprioception, balance, falls, ankle sprain",
    image: "",
    instructions: [
      "Stand next to a worktop so you can hold on if you need to.",
      "Lift one foot off the floor.",
      "Balance on the other leg.",
      "To make it harder, close your eyes or stand on a cushion."
    ],
    defaults: { sets: 3, reps: 1, hold: 30, frequency: "Twice a day" },
    progressions: ["Close your eyes", "Stand on a cushion", "Turn your head from side to side"],
    regressions: ["Keep one hand on the worktop", "Stand with your feet close together instead"],
    video: ""
  },
  {
    id: "ankle-calf-stretch",
    name: "Calf stretch",
    area: "Ankle",
    aliases: "gastrocnemius stretch, calf, Achilles, wall stretch, dorsiflexion",
    image: "",
    instructions: [
      "Stand facing a wall. Put your hands on it.",
      "Step one foot back. Keep that leg straight.",
      "Keep your back heel on the floor.",
      "Bend your front knee until you feel a stretch in your back calf. Hold it."
    ],
    defaults: { sets: 1, reps: 3, hold: 30, frequency: "Twice a day" },
    progressions: ["Step your back foot further away", "Bend your back knee a little to stretch lower down"],
    regressions: ["Take a smaller step back"],
    video: ""
  },
  {
    id: "ankle-toe-raise",
    name: "Toe raises",
    area: "Ankle",
    aliases: "toe lifts, dorsiflexion, tibialis anterior, heel stand, foot drop",
    image: "",
    instructions: [
      "Stand and hold on to a worktop or chair.",
      "Lift your toes up off the floor.",
      "Keep your heels down.",
      "Lower your toes slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 2, frequency: "Once a day" },
    progressions: ["Hold on more lightly", "Do it on one leg"],
    regressions: ["Do it sitting down"],
    video: ""
  },
  {
    id: "ankle-seated-heel-toe",
    name: "Sitting heel and toe rocks",
    area: "Ankle",
    aliases: "seated heel raises, seated toe raises, ankle range of movement, ROM, circulation",
    image: "",
    instructions: [
      "Sit on a chair with your feet flat on the floor.",
      "Lift your heels up. Keep your toes down.",
      "Put your heels down.",
      "Then lift your toes up. Keep your heels down."
    ],
    defaults: { sets: 2, reps: 10, hold: 0, frequency: "3 times a day" },
    progressions: ["Push down with your hands on your knees", "Do it standing up"],
    regressions: ["Make the movement smaller"],
    video: ""
  },
  // ---------- Back ----------
{
    id: "back-knee-rolls",
    name: "Knee rolls",
    area: "Back",
    aliases: "lumbar rotation, trunk rotation, low back pain, LBP, mobility",
    image: "",
    instructions: [
      "Lie on your back. Bend your knees. Put your feet flat.",
      "Keep your shoulders on the floor.",
      "Let both knees roll gently to one side.",
      "Bring them back to the middle. Then roll to the other side."
    ],
    defaults: { sets: 2, reps: 10, hold: 0, frequency: "Twice a day" },
    progressions: ["Lift your feet off the floor"],
    regressions: ["Make the movement smaller"],
    video: ""
  },
  {
    id: "back-knee-to-chest",
    name: "Knee to chest stretch",
    area: "Back",
    aliases: "lumbar flexion, single knee to chest, low back pain, LBP, stretch",
    image: "",
    instructions: [
      "Lie on your back with your knees bent.",
      "Bring one knee up towards your chest.",
      "Hold it gently with your hands. You should feel a stretch.",
      "Lower your leg. Then do the other leg."
    ],
    defaults: { sets: 1, reps: 3, hold: 20, frequency: "Twice a day" },
    progressions: ["Hug both knees to your chest"],
    regressions: ["Hold the back of your thigh, not your knee"],
    video: ""
  },
  {
    id: "back-cat-camel",
    name: "Cat and camel",
    area: "Back",
    aliases: "cat cow, spinal mobility, lumbar, thoracic, flexion extension, LBP",
    image: "",
    instructions: [
      "Get on your hands and knees.",
      "Put your hands under your shoulders and your knees under your hips.",
      "Slowly push your back up to the ceiling. Tuck your chin in.",
      "Then let your back dip down gently. Lift your head."
    ],
    defaults: { sets: 2, reps: 10, hold: 0, frequency: "Twice a day" },
    progressions: ["Pause for a moment at the top and at the bottom"],
    regressions: ["Sit on a chair. Round your back, then arch it"],
    video: ""
  },
  {
    id: "back-pelvic-tilt",
    name: "Pelvic tilt",
    area: "Back",
    aliases: "posterior pelvic tilt, lumbar flattening, core, transversus abdominis, TA, LBP",
    image: "",
    instructions: [
      "Lie on your back. Bend your knees. Put your feet flat.",
      "Tighten your tummy muscles.",
      "Gently flatten your lower back into the floor.",
      "Hold it. Then relax."
    ],
    defaults: { sets: 2, reps: 10, hold: 5, frequency: "Twice a day" },
    progressions: ["Lift one foot just off the floor while you hold", "Do it sitting or standing against a wall"],
    regressions: ["Make the movement smaller", "Hold for a shorter time"],
    video: ""
  },
  {
    id: "back-press-up",
    name: "Lying back bend",
    area: "Back",
    aliases: "prone press up, McKenzie, extension in lying, EIL, REIL, lumbar extension, LBP",
    image: "",
    instructions: [
      "Lie on your front. Put your hands flat under your shoulders.",
      "Keep your hips on the floor.",
      "Push with your arms to lift your chest up.",
      "Let your back relax. Then lower down slowly."
    ],
    defaults: { sets: 1, reps: 10, hold: 2, frequency: "3 times a day" },
    progressions: ["Push up higher, until your arms are straight", "Breathe out at the top"],
    regressions: ["Lean on your elbows instead of your hands", "Just lie on your front for a few minutes"],
    video: ""
  },
  {
    id: "back-bird-dog",
    name: "Arm and leg reach",
    area: "Back",
    aliases: "bird dog, four point kneeling, quadruped, core stability, multifidus, LBP",
    image: "",
    instructions: [
      "Get on your hands and knees.",
      "Keep your back flat like a table.",
      "Slowly reach one arm forward and the other leg back.",
      "Hold it. Then come back. Swap sides."
    ],
    defaults: { sets: 2, reps: 8, hold: 3, frequency: "Once a day" },
    progressions: ["Hold for longer", "Draw a small square with your hand and foot"],
    regressions: ["Just lift one arm, or just one leg"],
    video: ""
  },
  {
    id: "back-hamstring-stretch",
    name: "Back of thigh stretch",
    area: "Back",
    aliases: "hamstring stretch, seated hamstring stretch, hamstrings, sciatic, posterior chain",
    image: "",
    instructions: [
      "Sit near the front of a chair.",
      "Put one leg out straight with your heel on the floor.",
      "Keep your back straight. Lean forward from your hips.",
      "You should feel a stretch behind your thigh. Hold it."
    ],
    defaults: { sets: 1, reps: 3, hold: 30, frequency: "Twice a day" },
    progressions: ["Pull your toes up towards you"],
    regressions: ["Lean forward only a little"],
    video: ""
  },
  {
    id: "back-standing-extension",
    name: "Standing back bend",
    area: "Back",
    aliases: "standing lumbar extension, McKenzie, extension in standing, EIS, LBP",
    image: "",
    instructions: [
      "Stand tall with your feet apart.",
      "Put your hands on the small of your back.",
      "Gently lean backwards. Keep your knees straight.",
      "Come back up to standing."
    ],
    defaults: { sets: 1, reps: 10, hold: 2, frequency: "Every 2 hours" },
    progressions: ["Lean back a little further"],
    regressions: ["Make the movement smaller", "Stand with your back to a worktop for support"],
    video: ""
  },
  // ---------- Shoulder ----------
{
    id: "shoulder-pendulum",
    name: "Pendulum",
    area: "Shoulder",
    aliases: "Codman, frozen shoulder, adhesive capsulitis, post-op, passive",
    image: "",
    instructions: [
      "Lean forward. Rest your good arm on a table.",
      "Let your sore arm hang down loose.",
      "Gently swing it forward and back.",
      "Then swing it side to side, then in small circles."
    ],
    defaults: { sets: 1, reps: 10, hold: 0, frequency: "3 times a day" },
    progressions: ["Hold something light, like a tin of beans"],
    regressions: ["Make the swings smaller"],
    video: ""
  },
  {
    id: "shoulder-wall-slide",
    name: "Wall slides",
    area: "Shoulder",
    aliases: "wall walk, shoulder flexion, elevation, range of movement, ROM",
    image: "",
    instructions: [
      "Stand facing a wall.",
      "Put your hands on the wall at shoulder height.",
      "Slowly slide your hands up the wall. Only go as high as feels OK.",
      "Slide them back down slowly."
    ],
    defaults: { sets: 2, reps: 10, hold: 0, frequency: "Twice a day" },
    progressions: ["At the top, lift your hands off the wall", "Stand side-on to the wall"],
    regressions: ["Slide a cloth or towel up the wall"],
    video: ""
  },
  {
    id: "shoulder-band-external-rotation",
    name: "External rotation with band",
    area: "Shoulder",
    aliases: "ER, external rotation, rotator cuff, infraspinatus, theraband, resistance band",
    image: "",
    instructions: [
      "Stand up. Bend your elbow so your hand points forward.",
      "Keep your elbow tucked in by your side.",
      "Hold an exercise band. Tie the other end to something on your other side.",
      "Turn your hand out to the side. Keep your elbow by your side. Then come back slowly."
    ],
    defaults: { sets: 3, reps: 12, hold: 0, frequency: "Once a day" },
    progressions: ["Use a stronger band", "Take 3 seconds to come back"],
    regressions: ["Do it with no band", "Put a rolled-up towel under your elbow"],
    video: ""
  },
  {
    id: "shoulder-table-slide",
    name: "Table slides",
    area: "Shoulder",
    aliases: "table slide, shoulder flexion, assisted flexion, frozen shoulder, post-op, range of movement, ROM",
    image: "",
    instructions: [
      "Sit at a table. Put your hand on a towel on the table.",
      "Slide your hand forward along the table.",
      "Lean forward to help it go further.",
      "Slide it back slowly."
    ],
    defaults: { sets: 1, reps: 10, hold: 3, frequency: "3 times a day" },
    progressions: ["Slide your hand further", "Stand up and slide your hand up a wall"],
    regressions: ["Make the slide smaller"],
    video: ""
  },
  {
    id: "shoulder-blade-squeeze",
    name: "Shoulder blade squeeze",
    area: "Shoulder",
    aliases: "scapular retraction, scapular setting, posture, rhomboids, middle trapezius",
    image: "",
    instructions: [
      "Sit or stand up tall.",
      "Bend your elbows by your sides.",
      "Gently squeeze your shoulder blades back and together.",
      "Hold it. Then relax."
    ],
    defaults: { sets: 2, reps: 10, hold: 5, frequency: "Twice a day" },
    progressions: ["Hold an exercise band in both hands and pull it apart"],
    regressions: ["Make the squeeze smaller"],
    video: ""
  },
  {
    id: "shoulder-band-row",
    name: "Rowing with a band",
    area: "Shoulder",
    aliases: "band row, seated row, scapular retraction, rhomboids, rotator cuff, theraband, resistance band",
    image: "",
    instructions: [
      "Tie a band to a door handle. Hold the ends.",
      "Stand tall, facing the door. Keep your arms out in front.",
      "Pull your elbows back. Squeeze your shoulder blades.",
      "Let your arms go forward slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Use a stronger band", "Step further away from the door"],
    regressions: ["Use a lighter band", "Do it with no band"],
    video: ""
  },
  {
    id: "shoulder-wall-push-up",
    name: "Wall push ups",
    area: "Shoulder",
    aliases: "wall press up, push up, serratus anterior, pectorals, upper limb strength",
    image: "",
    instructions: [
      "Stand facing a wall, a big step away.",
      "Put your hands on the wall at shoulder height.",
      "Bend your elbows to bring your chest towards the wall.",
      "Push back out until your arms are straight."
    ],
    defaults: { sets: 3, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Stand further from the wall", "Do it on a kitchen worktop"],
    regressions: ["Stand closer to the wall"],
    video: ""
  },
  {
    id: "shoulder-arm-raise",
    name: "Arm raise forward",
    area: "Shoulder",
    aliases: "shoulder flexion, active flexion, front raise, anterior deltoid, range of movement",
    image: "",
    instructions: [
      "Stand or sit up tall.",
      "Keep your arm straight. Thumb pointing up.",
      "Lift your arm forward and up, as high as feels OK.",
      "Lower it slowly."
    ],
    defaults: { sets: 2, reps: 10, hold: 0, frequency: "Twice a day" },
    progressions: ["Hold something light, like a tin of beans", "Lie on your back and lift your arm over your head"],
    regressions: ["Lift only to shoulder height", "Help it up with your other hand"],
    video: ""
  },
  // ---------- Neck ----------
{
    id: "neck-chin-tuck",
    name: "Chin tucks",
    area: "Neck",
    aliases: "cervical retraction, deep neck flexors, DNF, posture, neck pain",
    image: "",
    instructions: [
      "Sit up straight. Look straight ahead.",
      "Gently slide your chin straight back. You will make a double chin.",
      "Hold it. Then relax."
    ],
    defaults: { sets: 1, reps: 10, hold: 5, frequency: "Every 2 hours" },
    progressions: ["Lie on your back and press your head gently into the pillow"],
    regressions: ["Make the movement smaller"],
    video: ""
  },
  {
    id: "neck-rotation",
    name: "Neck rotation",
    area: "Neck",
    aliases: "cervical rotation, neck range of movement, ROM, neck pain, stiffness",
    image: "",
    instructions: [
      "Sit up straight. Let your shoulders relax.",
      "Slowly turn your head to look over one shoulder.",
      "Only go as far as feels OK.",
      "Come back to the middle. Then turn to the other side."
    ],
    defaults: { sets: 1, reps: 10, hold: 0, frequency: "3 times a day" },
    progressions: ["At the end, push gently with your hand"],
    regressions: ["Turn only a little way"],
    video: ""
  },
  {
    id: "neck-side-bend",
    name: "Neck side bend",
    area: "Neck",
    aliases: "cervical lateral flexion, side flexion, upper trapezius stretch, neck stretch",
    image: "",
    instructions: [
      "Sit up straight. Let your shoulders relax.",
      "Tip your ear down towards your shoulder.",
      "Keep looking straight ahead.",
      "Come back to the middle. Then do the other side."
    ],
    defaults: { sets: 1, reps: 5, hold: 5, frequency: "3 times a day" },
    progressions: ["Hold the seat of the chair with your other hand"],
    regressions: ["Make the movement smaller"],
    video: ""
  },
  {
    id: "neck-nod",
    name: "Look down and up",
    area: "Neck",
    aliases: "cervical flexion, cervical extension, neck range of movement, ROM",
    image: "",
    instructions: [
      "Sit up straight. Look straight ahead.",
      "Slowly bend your head forward. Chin to chest.",
      "Come back to the middle.",
      "Then slowly look up, only as far as feels OK."
    ],
    defaults: { sets: 1, reps: 10, hold: 0, frequency: "3 times a day" },
    progressions: ["Hold for 3 seconds at each end"],
    regressions: ["Make the movement smaller"],
    video: ""
  },
  // ---------- Balance ----------
  {
    id: "balance-tandem-stance",
    name: "Heel to toe standing",
    area: "Balance",
    aliases: "tandem stance, semi-tandem, balance, falls prevention, Otago, proprioception",
    image: "",
    instructions: [
      "Stand next to a worktop so you can hold on.",
      "Put one foot right in front of the other.",
      "The heel of your front foot touches the toes of your back foot.",
      "Stand tall and look ahead. Hold it. Then swap feet."
    ],
    defaults: { sets: 1, reps: 3, hold: 10, frequency: "Once a day" },
    progressions: ["Hold on more lightly, then let go", "Hold for 30 seconds"],
    regressions: ["Put your feet side by side, close together", "Put your front foot a little to the side"],
    video: ""
  },
  {
    id: "balance-marching",
    name: "Marching on the spot",
    area: "Balance",
    aliases: "standing march, marching, balance, falls prevention, Otago, hip flexion",
    image: "",
    instructions: [
      "Stand next to a worktop so you can hold on.",
      "Lift one knee up. Then put it down.",
      "Then lift the other knee.",
      "Keep going, like marching on the spot."
    ],
    defaults: { sets: 2, reps: 20, hold: 0, frequency: "Once a day" },
    progressions: ["Lift your knees higher", "Hold on more lightly, then let go"],
    regressions: ["Do it sitting on a chair", "Hold on with both hands"],
    video: ""
  },
  {
    id: "balance-side-step",
    name: "Sideways walking",
    area: "Balance",
    aliases: "side stepping, lateral walking, balance, falls prevention, Otago, hip abductors",
    image: "",
    instructions: [
      "Stand facing a worktop. Hold on to it.",
      "Step sideways with one foot.",
      "Bring your other foot next to it.",
      "Take 10 steps one way. Then come back."
    ],
    defaults: { sets: 2, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Hold on more lightly", "Put an exercise band around your ankles"],
    regressions: ["Take small steps"],
    video: ""
  },
  {
    id: "balance-heel-toe-walk",
    name: "Heel to toe walking",
    area: "Balance",
    aliases: "tandem walk, tandem gait, balance, falls prevention, Otago",
    image: "",
    instructions: [
      "Stand next to a worktop so you can hold on.",
      "Walk forward with one foot right in front of the other.",
      "Your heel touches the toes of your back foot each step.",
      "Take 10 steps. Then turn round and come back."
    ],
    defaults: { sets: 2, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Hold on more lightly, then let go", "Walk backwards, toe to heel"],
    regressions: ["Take normal steps but keep your feet close together"],
    video: ""
  },
  // ---------- After surgery ----------
  {
    id: "postop-ankle-pumps",
    name: "Ankle pumps",
    area: "After surgery",
    aliases: "ankle pumps, foot pumps, circulation, DVT prevention, post-op, ankle range of movement",
    image: "",
    instructions: [
      "Lie or sit with your legs out straight.",
      "Pull your toes up towards you.",
      "Then point your toes away from you.",
      "Keep going, at a steady pace."
    ],
    defaults: { sets: 1, reps: 20, hold: 0, frequency: "Every hour" },
    progressions: ["Draw circles with your feet both ways"],
    regressions: ["Make the movement smaller"],
    video: ""
  },
  {
    id: "postop-glute-squeeze",
    name: "Buttock squeezes",
    area: "After surgery",
    aliases: "gluteal sets, glute squeezes, isometric gluteus maximus, post-op, THR, hip replacement",
    image: "",
    instructions: [
      "Lie on your back with your legs out straight.",
      "Squeeze your buttocks together.",
      "Hold it.",
      "Then relax slowly."
    ],
    defaults: { sets: 1, reps: 10, hold: 5, frequency: "Every 2 hours" },
    progressions: ["Hold for 10 seconds"],
    regressions: ["Hold for a shorter time"],
    video: ""
  },
  {
    id: "postop-short-arc-quads",
    name: "Knee straightening over a roll",
    area: "After surgery",
    aliases: "short arc quads, SAQ, inner range quads, IRQ, quadriceps, TKR, knee replacement, post-op",
    image: "",
    instructions: [
      "Lie on your back. Put a rolled-up towel under your knee.",
      "Keep the back of your knee on the towel.",
      "Lift your heel up until your knee is straight.",
      "Hold it. Then lower your heel slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 5, frequency: "3 times a day" },
    progressions: ["Use a bigger roll", "Wear an ankle weight"],
    regressions: ["Lift your heel only a little way"],
    video: ""
  },
  {
    id: "postop-deep-breathing",
    name: "Deep breathing",
    area: "After surgery",
    aliases: "deep breathing exercises, breathing exercises, thoracic expansion, chest clearance, post-op, respiratory",
    image: "",
    instructions: [
      "Sit up as straight as you can.",
      "Breathe in slowly and deeply through your nose.",
      "Fill your chest. Hold it for a moment.",
      "Breathe out slowly through your mouth."
    ],
    defaults: { sets: 1, reps: 5, hold: 3, frequency: "Every hour" },
    progressions: ["After 5 breaths, give a strong huff or cough"],
    regressions: ["Take smaller breaths and rest between them"],
    video: ""
  }
];
