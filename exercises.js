/*
  EXERCISE LIBRARY
  ================
  This is the only file you need to edit to add, change or remove exercises.

  Each exercise is one block between { and }. Copy an existing block to add a new one.
  Fields:
    id            A short unique name with no spaces (e.g. "knee-straight-leg-raise").
    name          The title patients will see.
    type          Optional. Strength, Stretch, Movement, Balance or Breathing. Used by the type filter.
    difficulty    Optional. Easy, Medium or Harder. Used by the difficulty filter in the builder.
                  (Levels were drafted on 17 Nov 2026 and still need a clinical check.)
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
                  (e.g. "videos/knee-static-quads.mp4"). When set, a little "Picture | Video"
                  switch appears under the moving picture in the builder and on the patient's
                  page. Leave as "" and there is no switch, just the moving picture.
    checked       Optional. Set to false for an exercise that has not had a clinical check yet.
                  The builder shows an "Awaiting check" label on it. Delete the line (or set
                  it to true) once it has been checked.
*/

window.EXERCISES = [
  // ---------- Knee ----------
{
    id: "knee-static-quads",
    name: "Static quads",
    area: "Knee",
    type: "Strength",
    difficulty: "Easy",
    aliases: "static quadriceps, quads isometric, quad sets, VMO, knee extension, static quad, quad clench, knee press, push knee down, tighten thigh, isometric quads",
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
    type: "Strength",
    difficulty: "Easy",
    aliases: "SLR, quadriceps, quads, hip flexion, straight leg lift, leg raise, lying leg raise, quad lift",
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
    type: "Strength",
    difficulty: "Medium",
    aliases: "STS, squat, chair stand, functional, quadriceps, glutes, getting up from a chair, standing up, toilet, car, sit to stands, chair squat, box squat, chair rise, stand up from chair, sit stand",
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
    type: "Movement",
    difficulty: "Easy",
    aliases: "knee flexion, range of movement, ROM, TKR, knee replacement, heel slide, knee bend in lying, lying knee bend, bend knee in bed",
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
    type: "Strength",
    difficulty: "Easy",
    aliases: "seated knee extension, long arc quads, LAQ, quadriceps, quads, OKC, knee extension in sitting, seated leg raise, kick out, leg straightening, sitting leg kick",
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
    type: "Strength",
    difficulty: "Medium",
    aliases: "partial squat, quarter squat, quadriceps, glutes, CKC, closed chain, getting up from a chair, gardening, half squat, small squat, mini squats, squat",
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
    type: "Strength",
    difficulty: "Medium",
    aliases: "wall sit, wall slide squat, isometric squat, quadriceps, patellofemoral, PFP, wall slide, wall sits, back against wall squat, wall squats",
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
    type: "Strength",
    difficulty: "Medium",
    aliases: "step up, stair, functional, quadriceps, glutes, CKC, stairs, steps, climbing, kerb, step-up, box step up, step ups forward, stair climb",
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
    type: "Strength",
    difficulty: "Easy",
    aliases: "hamstring curl, standing knee flexion, hamstrings, knee flexion, standing hamstring curl, knee curl, heel to bottom, hamstring curls, leg curl",
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
  {
    id: "knee-lunge",
    name: "Lunge",
    area: "Knee",
    type: "Strength",
    difficulty: "Harder",
    aliases: "split squat, forward lunge, quadriceps, glutes, functional strength, knee rehab, getting up from the floor, kneeling, lunges, split squats, static lunge",
    image: "",
    instructions: [
      "Stand with one foot a big step in front of the other.",
      "Hold on to something if you need to.",
      "Bend both knees. Lower your back knee towards the floor.",
      "Push back up. Keep your front knee over your foot."
    ],
    defaults: { sets: 3, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Hold a weight in each hand", "Step forward into the lunge each time"],
    regressions: ["Make the dip smaller", "Hold on to a worktop"],
    video: "",
    checked: false
  },
  {
    id: "knee-hip-hinge",
    name: "Hip hinge",
    area: "Knee",
    type: "Strength",
    difficulty: "Medium",
    aliases: "hip hinge, Romanian deadlift, RDL, deadlift, hamstrings, glutes, posterior chain, lifting, bending, picking things up, good morning, bend from the hips, hinge, hip hinges",
    image: "",
    instructions: [
      "Stand with your feet a little apart. Knees soft.",
      "Push your bottom back. Lean forward from your hips.",
      "Keep your back straight. Let your hands slide down your thighs.",
      "Squeeze your bottom to stand up tall."
    ],
    defaults: { sets: 3, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Hold a weight in your hands", "Do it standing on one leg"],
    regressions: ["Make the movement smaller"],
    video: "",
    checked: false
  },
  {
    id: "knee-single-leg-squat",
    name: "Single leg mini squat",
    area: "Knee",
    type: "Strength",
    difficulty: "Harder",
    aliases: "single leg squat, SLS, quadriceps, knee control, late stage rehab, ACL, one leg squat, single leg squats, pistol squat",
    image: "",
    instructions: [
      "Stand next to a worktop. Hold on lightly.",
      "Lift one foot off the floor.",
      "Bend your standing knee a little. Keep it over your toes.",
      "Straighten up slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Let go of the worktop", "Bend a little further"],
    regressions: ["Rest your other toes on the floor", "Do mini squats on both legs"],
    video: "",
    checked: false
  },
  // ---------- Hip ----------
{
    id: "hip-bridge",
    name: "Bridge",
    area: "Hip",
    type: "Strength",
    difficulty: "Medium",
    aliases: "glute bridge, gluteus maximus, hip extension, core, lumbar, getting in and out of bed, rolling in bed, shoulder bridge, hip bridge, bridging, bridges, bottom lift, bum lift, hip lift, pelvic lift, hip raise",
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
    type: "Strength",
    difficulty: "Easy",
    aliases: "clamshell, gluteus medius, glute med, hip abduction, external rotation, clams, clamshells, clam shell, side lying clam, knee opening",
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
    type: "Strength",
    difficulty: "Easy",
    aliases: "gluteus medius, glute med, side leg raise, hip abductors, leg out to the side, standing leg raise sideways, hip abduction standing, side kick",
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
    type: "Strength",
    difficulty: "Medium",
    aliases: "side lying hip abduction, SLHA, gluteus medius, glute med, abductors, side leg lift, side lying leg raise, leg lift on side, side lying abduction",
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
    type: "Strength",
    difficulty: "Easy",
    aliases: "standing hip extension, gluteus maximus, glutes, hip extensors, leg back, standing leg back kick, back kick, hip extension standing",
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
    type: "Strength",
    difficulty: "Easy",
    aliases: "standing hip flexion, hip flexors, iliopsoas, marching, knee lift, knee up, standing march, hip flexion standing",
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
    type: "Stretch",
    difficulty: "Medium",
    aliases: "hip flexor stretch, half kneeling stretch, iliopsoas, rectus femoris, hip flexor, kneeling hip stretch, lunge stretch, front of hip stretch, psoas stretch",
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
  {
    id: "hip-lying-abduction",
    name: "Lying leg slide out",
    area: "Hip",
    type: "Strength",
    difficulty: "Easy",
    aliases: "supine hip abduction, hip abduction in lying, THR, hip replacement, hip fracture, post-op, glute med, leg slide out, lying hip abduction, leg slides, abduction slides",
    image: "",
    instructions: [
      "Lie on your back with your legs straight.",
      "Keep your toes pointing up to the ceiling.",
      "Slide one leg out to the side.",
      "Then slide it back. Do not let it cross the middle."
    ],
    defaults: { sets: 1, reps: 10, hold: 0, frequency: "3 times a day" },
    progressions: ["Hold your leg out for 3 seconds"],
    regressions: ["Put a plastic bag under your heel so it slides easily", "Slide only a little way"],
    video: "",
    checked: false
  },
  {
    id: "hip-band-extension",
    name: "Leg back with a band",
    area: "Hip",
    type: "Strength",
    difficulty: "Medium",
    aliases: "resisted hip extension, glute max, theraband, THR, hip replacement rehab, band kick back, banded hip extension, leg back with band, resistance band kick back",
    image: "",
    instructions: [
      "Tie a band round your ankle. Fix the other end low down behind you.",
      "Stand facing a worktop. Hold on.",
      "Keep your leg straight. Take it back against the band.",
      "Bring it back slowly. Do not lean forward."
    ],
    defaults: { sets: 3, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Use a stronger band"],
    regressions: ["Do it with no band"],
    video: "",
    checked: false
  },
  // ---------- Ankle ----------
{
    id: "ankle-calf-raise",
    name: "Calf raises",
    area: "Ankle",
    type: "Strength",
    difficulty: "Medium",
    aliases: "heel raise, calf, gastrocnemius, soleus, plantarflexion, Achilles, walking, stairs, push off, heel raises, heel lift, up on toes, tip toes, calf rise, calf raise",
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
    type: "Movement",
    difficulty: "Easy",
    aliases: "ankle range of movement, ROM, ankle sprain, mobility, write the alphabet with your foot, ankle circles, foot alphabet, ankle writing",
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
    type: "Balance",
    difficulty: "Medium",
    aliases: "SLS, single leg stance, proprioception, balance, falls, ankle sprain, unsteady, stand on one leg, one leg stand, one leg balance, single leg stand, stork stand",
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
    type: "Stretch",
    difficulty: "Easy",
    aliases: "gastrocnemius stretch, calf, Achilles, wall stretch, dorsiflexion, wall calf stretch, straight knee calf stretch, gastroc stretch, runner's stretch",
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
    type: "Strength",
    difficulty: "Easy",
    aliases: "toe lifts, dorsiflexion, tibialis anterior, heel stand, foot drop, toe raise, toes up, lift toes, front of shin",
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
    type: "Movement",
    difficulty: "Easy",
    aliases: "seated heel raises, seated toe raises, ankle range of movement, ROM, circulation, heel toe rocks, sitting heel raises, sitting toe lifts, seated calf raise, rock heel toe",
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
  {
    id: "ankle-single-leg-heel-raise",
    name: "Single leg calf raise",
    area: "Ankle",
    type: "Strength",
    difficulty: "Harder",
    aliases: "single leg heel raise, SLHR, calf strength, gastrocnemius, Achilles tendinopathy, plantar heel pain, one leg calf raise, single calf raise, one leg heel raise",
    image: "",
    instructions: [
      "Stand next to a worktop. Hold on lightly.",
      "Lift one foot off the floor.",
      "Rise up onto the toes of your standing foot.",
      "Lower down slowly. Count to 3 on the way down."
    ],
    defaults: { sets: 3, reps: 15, hold: 0, frequency: "Once a day" },
    progressions: ["Stand on a step and let your heel drop below it", "Wear a rucksack with some weight in it"],
    regressions: ["Do calf raises on both feet", "Take more weight through your hands"],
    video: "",
    checked: false
  },
  {
    id: "ankle-bent-knee-heel-raise",
    name: "Bent knee calf raise",
    area: "Ankle",
    type: "Strength",
    difficulty: "Medium",
    aliases: "soleus raise, bent knee heel raise, soleus strengthening, Achilles tendinopathy, plantar fasciopathy, soleus raises, bent knee calf raises, seated soleus",
    image: "",
    instructions: [
      "Stand next to a worktop. Hold on lightly.",
      "Bend your knees a little. Keep them bent.",
      "Rise up onto your toes.",
      "Lower down slowly."
    ],
    defaults: { sets: 3, reps: 15, hold: 0, frequency: "Once a day" },
    progressions: ["Do it on one leg", "Hold a weight"],
    regressions: ["Do it sitting down, with a weight on your knees"],
    video: "",
    checked: false
  },
  {
    id: "ankle-soleus-stretch",
    name: "Bent knee calf stretch",
    area: "Ankle",
    type: "Stretch",
    difficulty: "Easy",
    aliases: "soleus stretch, lower calf stretch, Achilles stretch, ankle dorsiflexion, soleus, bent knee stretch, lower calf",
    image: "",
    instructions: [
      "Stand facing a wall. Put your hands on it.",
      "Step one foot back. Keep both heels down.",
      "Bend both knees until you feel a stretch low in your calf.",
      "Hold it. Then swap legs."
    ],
    defaults: { sets: 1, reps: 3, hold: 30, frequency: "Twice a day" },
    progressions: ["Step your back foot further back"],
    regressions: ["Make the bend smaller"],
    video: "",
    checked: false
  },
  {
    id: "ankle-plantar-fascia-stretch",
    name: "Sole of foot stretch",
    area: "Ankle",
    type: "Stretch",
    difficulty: "Easy",
    aliases: "plantar fascia stretch, plantar fasciitis, plantar fasciopathy, heel pain, towel stretch, foot stretch, arch stretch, towel foot stretch, toe stretch, plantar stretch",
    image: "",
    instructions: [
      "Sit with one leg out straight.",
      "Put a towel round your toes. Hold both ends.",
      "Pull your toes back towards you.",
      "Feel a stretch under your foot. Hold it."
    ],
    defaults: { sets: 1, reps: 3, hold: 30, frequency: "Twice a day, and before you get up" },
    progressions: ["Cross your foot over your other knee. Pull your toes back with your hand"],
    regressions: ["Pull more gently"],
    video: "",
    checked: false
  },
  {
    id: "ankle-foot-roll",
    name: "Roll your foot over a bottle",
    area: "Ankle",
    type: "Movement",
    difficulty: "Easy",
    aliases: "plantar fascia massage, foot roll, frozen bottle, tennis ball, plantar heel pain, ball roll, bottle roll, foot massage, golf ball roll, rolling foot",
    image: "",
    instructions: [
      "Sit on a chair. Put a bottle or ball under your foot.",
      "Roll it from your heel to your toes and back.",
      "Press down as much as feels OK.",
      "Keep going for 1 to 2 minutes."
    ],
    defaults: { sets: 1, reps: 10, hold: 0, frequency: "Twice a day" },
    progressions: ["Use a frozen bottle of water"],
    regressions: ["Use a softer ball", "Press more gently"],
    video: "",
    checked: false
  },
  {
    id: "ankle-towel-scrunch",
    name: "Towel scrunch with toes",
    area: "Ankle",
    type: "Strength",
    difficulty: "Easy",
    aliases: "toe curls, intrinsic foot strengthening, short foot, towel curls, foot strength, toe scrunches, towel grab, toe grip, marble pick up",
    image: "",
    instructions: [
      "Sit with your foot flat on a towel.",
      "Keep your heel on the floor.",
      "Curl your toes to pull the towel towards you.",
      "Spread your toes. Then scrunch again."
    ],
    defaults: { sets: 2, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Put a tin on the far end of the towel"],
    regressions: ["Just curl and spread your toes, with no towel"],
    video: "",
    checked: false
  },
  {
    id: "ankle-band-in-out",
    name: "Ankle in and out with a band",
    area: "Ankle",
    type: "Strength",
    difficulty: "Easy",
    aliases: "inversion, eversion, resisted ankle, peroneals, tibialis posterior, ankle sprain rehab, theraband, ankle inversion, ankle eversion, band ankle, ankle in out, foot in and out",
    image: "",
    instructions: [
      "Sit with a band round the front of your foot.",
      "Hold the band, or tie it to something firm.",
      "Keep your heel still. Turn your foot out against the band.",
      "Then move the band over and turn your foot in."
    ],
    defaults: { sets: 3, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Use a stronger band"],
    regressions: ["Do it with no band"],
    video: "",
    checked: false
  },
  // ---------- Back ----------
{
    id: "back-knee-rolls",
    name: "Knee rolls",
    area: "Back",
    type: "Movement",
    difficulty: "Easy",
    aliases: "lumbar rotation, trunk rotation, low back pain, LBP, mobility, stiff back in the morning, bed, knee roll, knee rocking, lumbar rotation in lying, knees side to side, windscreen wipers, knee drops",
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
    type: "Stretch",
    difficulty: "Easy",
    aliases: "lumbar flexion, single knee to chest, low back pain, LBP, stretch, knee hug, double knee to chest, knee hugs, knees to chest",
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
    type: "Movement",
    difficulty: "Easy",
    aliases: "cat cow, spinal mobility, lumbar, thoracic, flexion extension, LBP, cat camel, cat stretch, cat and cow, round and arch back",
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
    type: "Movement",
    difficulty: "Easy",
    aliases: "posterior pelvic tilt, lumbar flattening, core, transversus abdominis, TA, LBP, pelvic tilts, pelvic rock, back flattening, tilt",
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
    type: "Movement",
    difficulty: "Medium",
    aliases: "prone press up, McKenzie, extension in lying, EIL, REIL, lumbar extension, LBP, press up on front, cobra, sphinx, back extension lying, McKenzie press up",
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
    type: "Strength",
    difficulty: "Medium",
    aliases: "bird dog, four point kneeling, quadruped, core stability, multifidus, LBP, bird dogs, birddog, superman, arm and leg raise, opposite arm and leg",
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
    type: "Stretch",
    difficulty: "Easy",
    aliases: "hamstring stretch, seated hamstring stretch, hamstrings, sciatic, posterior chain, back of leg stretch, sitting hamstring stretch, toe touch",
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
    type: "Movement",
    difficulty: "Easy",
    aliases: "standing lumbar extension, McKenzie, extension in standing, EIS, LBP, standing back extension, lean back, back arch, standing extension",
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
  {
    id: "back-four-point-reach",
    name: "All fours arm or leg reach",
    area: "Back",
    type: "Strength",
    difficulty: "Medium",
    aliases: "four point kneeling, quadruped, bird dog regression, core stability, lumbar stability, arm reach on all fours, leg reach on all fours, four point kneeling arm lift, half bird dog",
    image: "",
    instructions: [
      "Kneel on all fours. Hands under shoulders, knees under hips.",
      "Keep your back flat. Reach one arm out in front.",
      "Put it down. Then slide one leg back and lift it.",
      "Keep your hips level. Then swap sides."
    ],
    defaults: { sets: 2, reps: 10, hold: 3, frequency: "Once a day" },
    progressions: ["Reach your arm and opposite leg together"],
    regressions: ["Slide your hand or foot along the floor, with no lift"],
    video: "",
    checked: false
  },
  {
    id: "back-plank",
    name: "Plank",
    area: "Back",
    type: "Strength",
    difficulty: "Medium",
    aliases: "prone plank, front plank, core stability, trunk endurance, abdominals, plank hold, elbow plank, forearm plank, box plank",
    image: "",
    instructions: [
      "Lie on your front. Lean on your elbows and forearms.",
      "Keep your knees on the floor.",
      "Lift your hips so your body is in a straight line.",
      "Hold it. Breathe normally. Then lower."
    ],
    defaults: { sets: 1, reps: 5, hold: 10, frequency: "Once a day" },
    progressions: ["Lift your knees and go up onto your toes", "Hold for longer"],
    regressions: ["Lean on a worktop instead, standing up"],
    video: "",
    checked: false
  },
  {
    id: "back-side-plank",
    name: "Side plank",
    area: "Back",
    type: "Strength",
    difficulty: "Harder",
    aliases: "side bridge, lateral plank, obliques, quadratus lumborum, core stability, glute med, side planks, side hold",
    image: "",
    instructions: [
      "Lie on your side. Lean on your elbow, under your shoulder.",
      "Bend your knees behind you.",
      "Lift your hips off the floor.",
      "Hold it. Then lower slowly. Do both sides."
    ],
    defaults: { sets: 1, reps: 5, hold: 10, frequency: "Once a day" },
    progressions: ["Straighten your legs and go onto your feet", "Hold for longer"],
    regressions: ["Lean side-on against a wall, standing up"],
    video: "",
    checked: false
  },
  {
    id: "back-prone-leg-lift",
    name: "Lying leg lift on your front",
    area: "Back",
    type: "Strength",
    difficulty: "Medium",
    aliases: "prone hip extension, back extensors, glute max, lumbar extensors, leg lift on front, prone leg raise, reverse leg raise, lying leg back",
    image: "",
    instructions: [
      "Lie on your front. Rest your head on your hands.",
      "Keep your leg straight. Tighten your bottom.",
      "Lift one leg a little off the floor.",
      "Hold it. Lower it slowly. Then do the other leg."
    ],
    defaults: { sets: 2, reps: 10, hold: 3, frequency: "Once a day" },
    progressions: ["Wear an ankle weight", "Lift the opposite arm too"],
    regressions: ["Put a pillow under your tummy", "Just squeeze your bottom, with no lift"],
    video: "",
    checked: false
  },
  // ---------- Shoulder ----------
{
    id: "shoulder-pendulum",
    name: "Pendulum",
    area: "Shoulder",
    type: "Movement",
    difficulty: "Easy",
    aliases: "Codman, frozen shoulder, adhesive capsulitis, post-op, passive, pendulums, pendular exercise, arm swing, Codman's, Codmans, dangling arm",
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
    type: "Movement",
    difficulty: "Easy",
    aliases: "wall walk, shoulder flexion, elevation, range of movement, ROM, reaching up, shelf, hair brushing, finger walk, spider walk, wall crawl, wall slide",
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
    type: "Strength",
    difficulty: "Medium",
    aliases: "ER, external rotation, rotator cuff, infraspinatus, theraband, resistance band, ER band, band ER, outward rotation, turn arm out",
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
    type: "Movement",
    difficulty: "Easy",
    aliases: "table slide, shoulder flexion, assisted flexion, frozen shoulder, post-op, range of movement, ROM, table slides, towel slide, forward slide, table polish, wiping table",
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
    type: "Strength",
    difficulty: "Easy",
    aliases: "scapular retraction, scapular setting, posture, rhomboids, middle trapezius, shoulder squeeze, squeeze shoulder blades, scapular squeeze, retraction, posture squeeze",
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
    type: "Strength",
    difficulty: "Medium",
    aliases: "band row, seated row, scapular retraction, rhomboids, rotator cuff, theraband, resistance band, posture, carrying, pulling, rows, band rows, row, rowing, theraband row",
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
    type: "Strength",
    difficulty: "Medium",
    aliases: "wall press up, push up, serratus anterior, pectorals, upper limb strength, wall press ups, wall push-ups, wall pushups, push ups against wall, standing push up",
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
    type: "Strength",
    difficulty: "Easy",
    aliases: "shoulder flexion, active flexion, front raise, anterior deltoid, range of movement, reaching up, shelf, cupboard, arm lift, arm raises, forward arm raise, shoulder raise",
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
  {
    id: "shoulder-isometric",
    name: "Shoulder push against a wall",
    area: "Shoulder",
    type: "Strength",
    difficulty: "Easy",
    aliases: "isometric shoulder, isometrics, rotator cuff, flexion, extension, abduction, external rotation, internal rotation, pain relief, static shoulder, shoulder isometrics, push into wall, isometric holds",
    image: "",
    instructions: [
      "Stand next to a wall. Bend your elbow. Make a loose fist.",
      "Push your fist into the wall. Your arm should not move.",
      "Push gently. Hold it. Then relax.",
      "Your physio will tell you which ways to push."
    ],
    defaults: { sets: 1, reps: 5, hold: 10, frequency: "3 times a day" },
    progressions: ["Push a little harder", "Hold for longer, up to 30 seconds"],
    regressions: ["Push more gently", "Put a folded towel between your fist and the wall"],
    video: "",
    checked: false
  },
  {
    id: "shoulder-lying-arm-raise",
    name: "Lying arm raise",
    area: "Shoulder",
    type: "Strength",
    difficulty: "Easy",
    aliases: "supine flexion, anterior deltoid programme, rotator cuff tear, massive cuff tear, shoulder flexion, ROM, lying arm lift, arm raise in lying, supine arm raise, deltoid programme",
    image: "",
    instructions: [
      "Lie on your back with your knees bent.",
      "Lift your arm up to point at the ceiling.",
      "Keep your elbow straight. Take your arm back over your head.",
      "Bring it back up. Then lower it by your side."
    ],
    defaults: { sets: 2, reps: 10, hold: 0, frequency: "Twice a day" },
    progressions: ["Hold a light weight", "Do it sitting up a little on pillows"],
    regressions: ["Help with your other hand", "Only lift your arm to point at the ceiling"],
    video: "",
    checked: false
  },
  {
    id: "shoulder-band-internal-rotation",
    name: "Turn arm in with a band",
    area: "Shoulder",
    type: "Strength",
    difficulty: "Medium",
    aliases: "internal rotation, IR, rotator cuff strengthening, subscapularis, theraband, resistance band, IR band, band IR, inward rotation, turn arm in",
    image: "",
    instructions: [
      "Tie a band to a door handle at elbow height.",
      "Stand side on. Hold the band in the hand nearest the door.",
      "Keep your elbow at your side, bent to a right angle.",
      "Pull your hand in across your tummy. Go back slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Use a stronger band", "Stand further from the door"],
    regressions: ["Use a lighter band", "Push your hand into your other hand, with no movement"],
    video: "",
    checked: false
  },
  {
    id: "shoulder-rolls",
    name: "Shoulder rolls",
    area: "Shoulder",
    type: "Movement",
    difficulty: "Easy",
    aliases: "shoulder circles, scapular mobility, posture, neck and shoulder tension, warm up, shoulder roll, shrugs, shoulder shrug",
    image: "",
    instructions: [
      "Sit or stand tall. Let your arms hang.",
      "Lift your shoulders up towards your ears.",
      "Roll them back and down.",
      "Keep going in slow circles."
    ],
    defaults: { sets: 1, reps: 10, hold: 0, frequency: "3 times a day" },
    progressions: ["Roll them forwards too"],
    regressions: ["Make the circles smaller"],
    video: "",
    checked: false
  },
  {
    id: "shoulder-hand-behind-back",
    name: "Hand behind back stretch",
    area: "Shoulder",
    type: "Stretch",
    difficulty: "Medium",
    aliases: "internal rotation stretch, HBB, frozen shoulder, adhesive capsulitis, towel stretch, functional reach, getting dressed, bra, tucking in shirt, back pocket, hand up back, behind back stretch, internal rotation behind back, HBB stretch",
    image: "",
    instructions: [
      "Stand tall. Put your hand behind your back.",
      "Rest the back of your hand on your lower back.",
      "Slowly slide your hand up your back.",
      "Stop when you feel a stretch. Hold it."
    ],
    defaults: { sets: 1, reps: 5, hold: 10, frequency: "3 times a day" },
    progressions: ["Use a towel. Pull it up with your other hand from above"],
    regressions: ["Only slide your hand as far as your waist"],
    video: "",
    checked: false
  },
  // ---------- Elbow, wrist and hand ----------
  {
    id: "hand-elbow-bend",
    name: "Bend and straighten your elbow",
    area: "Elbow, wrist and hand",
    type: "Movement",
    difficulty: "Easy",
    aliases: "elbow flexion, elbow extension, elbow range of movement, ROM, elbow fracture, stiffness, elbow bend, elbow bending, elbow flexion extension, bend elbow",
    image: "",
    instructions: [
      "Sit or stand with your arm by your side.",
      "Turn your palm to face forward.",
      "Bend your elbow. Bring your hand up to your shoulder.",
      "Then straighten your arm all the way down."
    ],
    defaults: { sets: 1, reps: 10, hold: 0, frequency: "3 times a day" },
    progressions: ["Hold a light weight, like a tin of beans", "Hold for 5 seconds at each end"],
    regressions: ["Help with your other hand", "Rest your arm on a table while you do it"],
    video: "",
    checked: false
  },
  {
    id: "hand-forearm-turn",
    name: "Turn palm up and down",
    area: "Elbow, wrist and hand",
    type: "Movement",
    difficulty: "Easy",
    aliases: "pronation, supination, forearm rotation, wrist fracture, elbow range of movement, ROM, turning door handles, keys, taps, palm up palm down, turning forearm, pronation supination, supination pronation",
    image: "",
    instructions: [
      "Sit with your elbow tucked into your side.",
      "Bend your elbow so your hand points forward.",
      "Turn your palm up to the ceiling.",
      "Then turn it down to the floor."
    ],
    defaults: { sets: 1, reps: 10, hold: 0, frequency: "3 times a day" },
    progressions: ["Hold a tin or a light hammer", "Hold for 5 seconds at each end"],
    regressions: ["Rest your forearm on a table", "Help with your other hand"],
    video: "",
    checked: false
  },
  {
    id: "hand-wrist-bend",
    name: "Wrist bend up and down",
    area: "Elbow, wrist and hand",
    type: "Movement",
    difficulty: "Easy",
    aliases: "wrist flexion, wrist extension, wrist range of movement, ROM, wrist fracture, Colles, wrist bends, wrist up and down, wrist flexion extension, wrist curls",
    image: "",
    instructions: [
      "Rest your forearm on a table.",
      "Let your hand hang over the edge, palm down.",
      "Bend your hand down. Then lift it up.",
      "Keep your forearm still on the table."
    ],
    defaults: { sets: 1, reps: 10, hold: 0, frequency: "3 times a day" },
    progressions: ["Do it with your palm facing up too", "Hold for 5 seconds at each end"],
    regressions: ["Make the movement smaller", "Help with your other hand"],
    video: "",
    checked: false
  },
  {
    id: "hand-grip",
    name: "Grip squeeze",
    area: "Elbow, wrist and hand",
    type: "Strength",
    difficulty: "Easy",
    aliases: "grip strength, power grip, stress ball, putty, hand strengthening, hand osteoarthritis, OA, opening jars, carrying bags, hand squeeze, grip, ball squeeze, putty squeeze, fist squeeze, making a fist",
    image: "",
    instructions: [
      "Rest your forearm on a table.",
      "Hold a soft ball or a rolled-up sock.",
      "Squeeze it as hard as feels OK.",
      "Hold it. Then let go slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 3, frequency: "Once a day" },
    progressions: ["Use a firmer ball or exercise putty", "Hold the squeeze for longer"],
    regressions: ["Use a softer ball or a sponge", "Squeeze more gently"],
    video: "",
    checked: false
  },
  {
    id: "hand-tendon-glides",
    name: "Finger tendon glides",
    area: "Elbow, wrist and hand",
    type: "Movement",
    difficulty: "Easy",
    aliases: "tendon gliding, finger range of movement, ROM, hand stiffness, hand osteoarthritis, hook fist, straight fist, tabletop, finger glides, finger exercises, fist positions",
    image: "",
    instructions: [
      "Hold your hand up with your fingers straight.",
      "Bend the tips of your fingers to make a hook.",
      "Make a full fist. Then straighten your fingers.",
      "Bend only at the big knuckles, like a table top.",
      "Then curl into a flat fist. Straighten and start again."
    ],
    defaults: { sets: 1, reps: 5, hold: 3, frequency: "3 times a day" },
    progressions: ["Hold each shape for 5 seconds"],
    regressions: ["Do only the shapes that feel OK", "Warm your hands in water first"],
    video: "",
    checked: false
  },
  {
    id: "hand-wrist-extension-weight",
    name: "Wrist lift with a weight",
    area: "Elbow, wrist and hand",
    type: "Strength",
    difficulty: "Medium",
    aliases: "wrist extensor strengthening, tennis elbow, lateral elbow tendinopathy, lateral epicondylalgia, eccentric, isotonic, wrist extension, reverse wrist curl, wrist lifts, tennis elbow exercise",
    image: "",
    instructions: [
      "Rest your forearm on a table, palm down.",
      "Let your hand hang over the edge. Hold a light weight.",
      "Lift your hand up as far as feels OK.",
      "Lower it slowly. Count to 3 on the way down."
    ],
    defaults: { sets: 3, reps: 15, hold: 0, frequency: "Once a day" },
    progressions: ["Use a heavier weight", "Lower even more slowly"],
    regressions: ["Use a lighter weight, or none", "Help lift with your other hand. Lower on your own"],
    video: "",
    checked: false
  },
  {
    id: "hand-thumb-opposition",
    name: "Thumb to fingertips",
    area: "Elbow, wrist and hand",
    type: "Movement",
    difficulty: "Easy",
    aliases: "thumb opposition, thumb range of movement, CMC joint, base of thumb osteoarthritis, OA, dexterity, thumb touches, thumb to finger, finger touching, opposition",
    image: "",
    instructions: [
      "Hold your hand up with your fingers straight.",
      "Touch your thumb to the tip of your first finger.",
      "Make an O shape. Then open your hand.",
      "Do the same with each finger in turn."
    ],
    defaults: { sets: 1, reps: 5, hold: 0, frequency: "3 times a day" },
    progressions: ["Press the tips together firmly for 3 seconds"],
    regressions: ["Rest your hand on a table", "Go only as far as feels OK"],
    video: "",
    checked: false
  },
  {
    id: "hand-finger-spread",
    name: "Finger spread with a band",
    area: "Elbow, wrist and hand",
    type: "Strength",
    difficulty: "Easy",
    aliases: "finger abduction, interossei, intrinsic strengthening, hand osteoarthritis, rubber band, finger spreads, spread fingers, finger abduction band, rubber band finger",
    image: "",
    instructions: [
      "Put a rubber band round your fingers.",
      "Keep your fingers straight.",
      "Spread them apart, against the band.",
      "Hold it. Then bring them back slowly."
    ],
    defaults: { sets: 3, reps: 10, hold: 3, frequency: "Once a day" },
    progressions: ["Use a thicker band, or two bands"],
    regressions: ["Do it with no band", "Rest your hand flat on a table. Slide your fingers apart"],
    video: "",
    checked: false
  },
  {
    id: "hand-forearm-twist",
    name: "Forearm twist with a hammer",
    area: "Elbow, wrist and hand",
    type: "Strength",
    difficulty: "Medium",
    aliases: "pronation, supination, forearm rotation strengthening, tennis elbow, golfer's elbow, wrist rehab, hammer twist, hammer rotation, forearm rotation with hammer, hammer exercise",
    image: "",
    instructions: [
      "Rest your forearm on a table.",
      "Hold a hammer near the bottom, pointing up.",
      "Slowly turn it one way. Then back to the middle.",
      "Then slowly turn it the other way."
    ],
    defaults: { sets: 3, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Hold the hammer further down the handle"],
    regressions: ["Hold the hammer near the head", "Use a wooden spoon instead"],
    video: "",
    checked: false
  },
  // ---------- Neck ----------
{
    id: "neck-chin-tuck",
    name: "Chin tucks",
    area: "Neck",
    type: "Strength",
    difficulty: "Easy",
    aliases: "cervical retraction, deep neck flexors, DNF, posture, neck pain, chin tuck, chin in, chin retraction, double chin, head back, neck retraction",
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
    type: "Movement",
    difficulty: "Easy",
    aliases: "cervical rotation, neck range of movement, ROM, neck pain, stiffness, neck turns, head turns, look over shoulder, turn head, neck turn",
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
    type: "Movement",
    difficulty: "Easy",
    aliases: "cervical lateral flexion, side flexion, upper trapezius stretch, neck stretch, neck side flexion, ear to shoulder, head tilt, side neck stretch, upper trap stretch",
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
    type: "Movement",
    difficulty: "Easy",
    aliases: "cervical flexion, cervical extension, neck range of movement, ROM, neck nods, head nod, chin to chest, neck flexion extension, look up and down",
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
  // ---------- Upper back ----------
  {
    id: "upperback-seated-rotation",
    name: "Sitting upper back twist",
    area: "Upper back",
    type: "Movement",
    difficulty: "Easy",
    aliases: "thoracic rotation, T-spine mobility, trunk rotation, upper back stiffness, posture, seated twist, trunk twist, upper back rotation, sitting twist, thoracic twist",
    image: "",
    instructions: [
      "Sit on a firm chair with your feet flat.",
      "Cross your arms over your chest.",
      "Turn your upper body to one side. Keep your hips still.",
      "Come back to the middle. Then turn to the other side."
    ],
    defaults: { sets: 1, reps: 10, hold: 0, frequency: "3 times a day" },
    progressions: ["Hold for 5 seconds at the end"],
    regressions: ["Make the turn smaller"],
    video: "",
    checked: false
  },
  {
    id: "upperback-towel-opener",
    name: "Chest opener over a towel",
    area: "Upper back",
    type: "Stretch",
    difficulty: "Easy",
    aliases: "thoracic extension, T-spine extension, towel roll, posture, kyphosis, pec stretch, towel roll stretch, chest stretch lying, thoracic extension over towel, upper back stretch",
    image: "",
    instructions: [
      "Roll up a towel. Lie on your back with it across your upper back.",
      "Bend your knees. Keep your feet flat.",
      "Slowly take your arms back over your head.",
      "Rest there and breathe. Then bring your arms back."
    ],
    defaults: { sets: 1, reps: 5, hold: 20, frequency: "Once a day" },
    progressions: ["Use a bigger towel roll", "Hold for longer"],
    regressions: ["Use a thinner towel", "Keep your hands on your chest"],
    video: "",
    checked: false
  },
  {
    id: "upperback-side-bend",
    name: "Sitting side bend",
    area: "Upper back",
    type: "Movement",
    difficulty: "Easy",
    aliases: "thoracic side flexion, lateral flexion, trunk mobility, upper back stiffness, side bend, seated side bend, side stretch, trunk side bend",
    image: "",
    instructions: [
      "Sit tall on a firm chair. Let your arms hang.",
      "Lean to one side. Let your hand slide towards the floor.",
      "Come back up to the middle.",
      "Then lean to the other side."
    ],
    defaults: { sets: 1, reps: 10, hold: 0, frequency: "3 times a day" },
    progressions: ["Reach your other arm over your head as you lean"],
    regressions: ["Make the lean smaller"],
    video: "",
    checked: false
  },
  // ---------- Balance ----------
  {
    id: "balance-tandem-stance",
    name: "Heel to toe standing",
    area: "Balance",
    type: "Balance",
    difficulty: "Medium",
    aliases: "tandem stance, semi-tandem, balance, falls prevention, Otago, proprioception, falls, unsteady, wobbly, heel toe stand, tandem stand, feet in line, one foot in front, heel to toe stance",
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
    type: "Balance",
    difficulty: "Easy",
    aliases: "standing march, marching, balance, falls prevention, Otago, hip flexion, falls, walking, unsteady, march on the spot, marching in place, high knees, standing marching",
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
    type: "Balance",
    difficulty: "Medium",
    aliases: "side stepping, lateral walking, balance, falls prevention, Otago, hip abductors, side steps, crab walk, side walking, sidestep, walking sideways",
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
    type: "Balance",
    difficulty: "Medium",
    aliases: "tandem walk, tandem gait, balance, falls prevention, Otago, tightrope walk, heel to toe walk, line walking, tandem walking",
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
  {
    id: "balance-backwards-walk",
    name: "Walking backwards",
    area: "Balance",
    type: "Balance",
    difficulty: "Medium",
    aliases: "backward walking, retro walking, balance, falls prevention, Otago, backward walk, reverse walking, walking backward",
    image: "",
    instructions: [
      "Stand side on to a worktop. Hold on.",
      "Take a small step backwards.",
      "Then step back with your other foot.",
      "Take 10 steps. Then walk forwards."
    ],
    defaults: { sets: 1, reps: 10, hold: 0, frequency: "Once a day" },
    progressions: ["Hold on more lightly, then let go"],
    regressions: ["Take very small steps"],
    video: "",
    checked: false
  },
  {
    id: "balance-walk-turn",
    name: "Walk and turn round",
    area: "Balance",
    type: "Balance",
    difficulty: "Medium",
    aliases: "walking and turning, figure of 8, balance, falls prevention, Otago, gait, falls, turning, unsteady, walk and turn, turn around, about turn",
    image: "",
    instructions: [
      "Walk forward at your normal speed.",
      "Turn round in a slow, wide circle.",
      "Walk back to where you started.",
      "Turn the other way next time."
    ],
    defaults: { sets: 1, reps: 4, hold: 0, frequency: "Once a day" },
    progressions: ["Make the turns tighter", "Walk in a figure of 8"],
    regressions: ["Use your walking aid", "Walk close to a worktop or wall"],
    video: "",
    checked: false
  },
  {
    id: "balance-heels-then-toes",
    name: "Heel walking and toe walking",
    area: "Balance",
    type: "Balance",
    difficulty: "Medium",
    aliases: "heel walk, toe walk, balance, falls prevention, Otago, ankle strength, heel walking, toe walking, walk on heels, walk on toes, tip toe walking",
    image: "",
    instructions: [
      "Stand next to a worktop. Hold on.",
      "Lift your toes. Walk 10 steps on your heels.",
      "Turn round. Rise up onto your toes.",
      "Walk 10 steps back on your toes."
    ],
    defaults: { sets: 1, reps: 2, hold: 0, frequency: "Once a day" },
    progressions: ["Hold on more lightly, then let go"],
    regressions: ["Take fewer steps"],
    video: "",
    checked: false
  },
  // ---------- After surgery ----------
  {
    id: "postop-ankle-pumps",
    name: "Ankle pumps",
    area: "After surgery",
    type: "Movement",
    difficulty: "Easy",
    aliases: "ankle pumps, foot pumps, circulation, DVT prevention, post-op, ankle range of movement, ankle pump, pumping feet, ankle circles in bed, circulation exercise",
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
    type: "Strength",
    difficulty: "Easy",
    aliases: "gluteal sets, glute squeezes, isometric gluteus maximus, post-op, THR, hip replacement, buttock clench, bottom squeeze, bum squeeze, glute sets, gluteal squeeze, buttock squeeze",
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
    type: "Strength",
    difficulty: "Easy",
    aliases: "short arc quads, SAQ, inner range quads, IRQ, quadriceps, TKR, knee replacement, post-op, short arc quad, inner range quad, knee over roll, towel under knee, quads over roll",
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
    type: "Breathing",
    difficulty: "Easy",
    aliases: "deep breathing exercises, breathing exercises, thoracic expansion, chest clearance, post-op, respiratory, breathing, deep breaths, breathing exercise, chest expansion, ACBT, active cycle of breathing",
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
  },
  // ---------- Pelvic floor ----------
  {
    id: "pelvic-long-squeeze",
    name: "Pelvic floor long squeezes",
    area: "Pelvic floor",
    type: "Strength",
    difficulty: "Easy",
    aliases: "pelvic floor muscle training, PFMT, Kegels, slow contractions, stress incontinence, bladder leakage, antenatal, postnatal, prostatectomy, pelvic floor, Kegel, Kegel exercises, slow squeezes, long holds, pelvic floor exercises, PF exercises",
    image: "",
    instructions: [
      "Sit, stand or lie in a comfy position. Breathe normally.",
      "Squeeze and lift the muscles you use to stop wind and wee.",
      "Hold the squeeze. Do not hold your breath or squeeze your bottom.",
      "Let go fully. Rest for a few seconds."
    ],
    defaults: { sets: 1, reps: 10, hold: 5, frequency: "3 times a day" },
    progressions: ["Hold for longer, up to 10 seconds", "Do them standing up"],
    regressions: ["Hold for 2 to 3 seconds", "Do them lying down"],
    video: "",
    checked: false
  },
  {
    id: "pelvic-quick-squeeze",
    name: "Pelvic floor quick squeezes",
    area: "Pelvic floor",
    type: "Strength",
    difficulty: "Easy",
    aliases: "fast contractions, quick flicks, PFMT, Kegels, urgency, stress incontinence, pelvic floor, Kegel, fast squeezes, quick squeezes, quick contractions, pelvic floor exercises",
    image: "",
    instructions: [
      "Sit, stand or lie in a comfy position.",
      "Squeeze and lift your pelvic floor quickly.",
      "Let go straight away.",
      "Rest for a second. Then squeeze again."
    ],
    defaults: { sets: 1, reps: 10, hold: 1, frequency: "3 times a day" },
    progressions: ["Do them standing up"],
    regressions: ["Rest for longer between squeezes"],
    video: "",
    checked: false
  },
  {
    id: "pelvic-knack",
    name: "Squeeze before you cough",
    area: "Pelvic floor",
    type: "Strength",
    difficulty: "Medium",
    aliases: "the Knack, pre-contraction, stress incontinence, cough, sneeze, lifting, bladder leakage, leaking when coughing, sneezing, knack, squeeze before cough, squeeze before sneeze, pelvic floor brace",
    image: "",
    instructions: [
      "Squeeze and lift your pelvic floor.",
      "Keep holding it while you cough, sneeze or lift.",
      "Then let go.",
      "Practise until it becomes a habit."
    ],
    defaults: { sets: 1, reps: 5, hold: 0, frequency: "Every time you cough, sneeze or lift" },
    progressions: ["Use it when you stand up from a chair too"],
    regressions: ["Practise with a pretend cough first"],
    video: "",
    checked: false
  }
];
