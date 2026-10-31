/* =====================================================================
 * MY EXERCISES (from my doctor's exercise sheets)
 * ---------------------------------------------------------------------
 * Each exercise:
 *   id        short unique name (keep it the same once you start, so your
 *             history stays linked)
 *   areas     which body areas it appears under: "neck", "legs", "back"
 *   name      title shown in the app
 *   reps      repetitions per set         sets   how many sets
 *   holdSec   seconds to hold at the "H" frames (0 = no hold)
 *   sides     true = do it on one side, then the other
 *   phases    instead of sides: a list of parts, e.g. one direction and then
 *             the other ({ name, say, mirror, reverse })
 *   sidesText how "each side" is worded for this exercise
 *   doseNote  where the reps/hold come from
 *   steps     the instructions, one line each
 *   caution   a short safety note
 *   media     OPTIONAL path to a GIF/video/image (e.g. "media/neck-1.gif").
 *             If given, it is shown instead of the drawn animation.
 *   view, base, props, ground, frames, linear, wrap
 *             the drawn animation (see figure.js for what each pose key means).
 *             frames[0] is the start pose; the figure moves through every
 *             frame and back to frames[0], which counts as one repetition.
 *             In a frame, t = seconds to move there, hold = seconds to stay,
 *             hold: "H" uses holdSec, label = the cue shown and spoken.
 * Reps, sets and hold times can also be changed inside the app.
 * ===================================================================== */

const AREAS = [
  { id: "neck", name: "Neck", icon: "neck", blurb: "Neck and shoulder exercises", thumb: "neck-ear-shoulder" },
  { id: "legs", name: "Knees & Legs", icon: "knee", blurb: "Knee support and thigh strength", thumb: "knee-extension" },
  { id: "back", name: "Lower Back", icon: "back", blurb: "Waist and lower back care", thumb: "bridge" },
];

const SHEET = "Hold time from your exercise sheet.";
const SUGGESTED = "Your sheet doesn't give a number, so this is a common starting dose. Change it if your doctor said otherwise.";
const BACK_SHEET = "From your lower back sheet: hold 30 seconds, timed by the watch, only as far as is comfortable.";

// Shared starting poses
const SIT = { x: 80, y: 137, torso: 180, neck: 180, ua: 10, fa: 70, ua2: 14, fa2: 70, th: 90, sh: 0, ft: 90, th2: 88, sh2: 2, ft2: 90 };
const STAND = { x: 100, y: 105, torso: 180, neck: 180 };
const STAND_HOLD = Object.assign({}, STAND, { wx: 139, wy: 82, wx2: 137, wy2: 84 });
const LIE = { x: 112, y: 174, torso: -90, neck: -103, wx: 109, wy: 176, wx2: 107, wy2: 176, esign: 1, th: 90, sh: 90, ft: 180, th2: 90, sh2: 90, ft2: 180 };
const LIE_BENT = Object.assign({}, LIE, { fx: 154, fy: 174, fx2: 152, fy2: 174, ft: 90, ft2: 90 });
const SIDE_LIE = Object.assign({}, LIE, { neck: -122, nod: 10, ua2: -90, fa2: 175, wx2: undefined, wy2: undefined, wx: 98, wy: 176, ft: 100, ft2: 100 });
const FOURS = { x: 70, y: 141, torso: 106, neck: 118, nod: -18, th: 0, sh: -90, ft: -130, th2: 2, sh2: -90, ft2: -130, wx: 121, wy: 175, wx2: 117, wy2: 175, esign: 1 };
const PRONE = { x: 92, y: 174, torso: 90, neck: 100, nod: 0, th: -90, sh: -90, ft: -150, th2: -90, sh2: -92, ft2: -150, wx: 96, wy: 176, wx2: 94, wy2: 176 };

const EXERCISES = [
  /* ------------------------------- NECK ------------------------------- */
  {
    id: "neck-forward-tilt", areas: ["neck"], name: "Forward tilt",
    reps: 3, sets: 1, holdSec: 15, sides: false, doseNote: "Hold 15 to 30 seconds (from your sheet). Number of repeats is a suggestion.",
    steps: [
      "Stand or sit tall with your shoulders straight.",
      "Slowly lower your chin toward your chest.",
      "Hold the stretch for 15 to 30 seconds.",
      "Relax and slowly lift your chin back to the starting position.",
    ],
    caution: "Keep your shoulders still. The stretch should be gentle.",
    view: "side", base: STAND, props: [],
    frames: [
      { p: {}, t: 1.6, label: "Slowly lift your chin" },
      { p: { neck: 138, nod: -14 }, t: 1.8, hold: "H", label: "Chin toward your chest" },
    ],
  },
  {
    id: "neck-side-turn", areas: ["neck"], name: "Side tilt (turn your head)",
    reps: 3, sets: 1, holdSec: 15, sides: false, sidesText: "both sides", doseNote: "Hold 15 to 30 seconds each side (from your sheet).",
    steps: [
      "Stand or sit tall with your shoulders straight.",
      "Turn your head to one side, as far as is comfortable.",
      "Hold for 15 to 30 seconds.",
      "Relax, slowly come back to the middle, then repeat on the other side.",
    ],
    caution: "Keep your shoulders facing forward. Move slowly.",
    view: "front", base: {}, props: [],
    frames: [
      { p: {}, t: 1.4, label: "Back to the middle" },
      { p: { turn: 1 }, t: 1.8, hold: "H", label: "Turn your head to the left" },
      { p: {}, t: 1.6, label: "Back to the middle" },
      { p: { turn: -1 }, t: 1.8, hold: "H", label: "Turn your head to the right" },
    ],
  },
  {
    id: "neck-ear-shoulder", areas: ["neck"], name: "Side rotation (ear to shoulder)",
    reps: 3, sets: 1, holdSec: 15, sides: false, sidesText: "both sides", doseNote: "Hold 15 to 30 seconds each side (from your sheet).",
    steps: [
      "Stand or sit tall, looking straight ahead.",
      "Tilt your head so your ear moves toward your shoulder.",
      "Hold for 15 to 30 seconds.",
      "Relax, slowly return to the middle, then tilt to the other side.",
    ],
    caution: "Do not lift your shoulder up to meet your ear.",
    view: "front", base: {}, props: [],
    frames: [
      { p: {}, t: 1.4, label: "Back to the middle" },
      { p: { tilt: 30 }, t: 1.8, hold: "H", label: "Left ear toward left shoulder" },
      { p: {}, t: 1.6, label: "Back to the middle" },
      { p: { tilt: -30 }, t: 1.8, hold: "H", label: "Right ear toward right shoulder" },
    ],
  },
  {
    id: "neck-rolls", areas: ["neck"], name: "Neck rolls",
    reps: 5, sets: 1, holdSec: 0, sides: false, sidesText: "each direction", doseNote: "5 times in each direction (from your sheet).",
    steps: [
      "Tilt your head to the right.",
      "Slowly roll it down, chin to chest, and across to the left, making a U shape.",
      "Then roll it back down and across to the right.",
      "Repeat 5 times in each direction. Only roll from side to side, never backwards.",
    ],
    caution: "Do not tip your head back. Keep the movement slow and smooth.",
    view: "front", base: {}, props: [],
    frames: [
      { p: { tilt: -30 }, t: 1.4, label: "Up to the right" },
      { p: { nod: 1 }, t: 1.4, label: "Roll down, chin to chest" },
      { p: { tilt: 30 }, t: 1.4, label: "Up to the left" },
      { p: { nod: 1 }, t: 1.4, label: "Roll down, chin to chest" },
    ],
  },
  {
    id: "shoulder-circles", areas: ["neck"], name: "Shoulder circles",
    reps: 10, sets: 1, holdSec: 0, sidesText: "each direction", doseNote: "10 backwards, then 10 forwards (from your sheet).",
    phases: [{ name: "Backwards" }, { name: "Forwards", reverse: true, say: "Now roll your shoulders forwards" }],
    steps: [
      "Stand upright with a slight bend in your upper back.",
      "Roll your shoulders up, back and down in one smooth circle.",
      "Do this 10 times.",
      "Then switch direction and roll your shoulders forwards 10 times.",
    ],
    caution: "Keep your arms relaxed and your neck still.",
    view: "side", base: Object.assign({}, STAND, { torso: 177, neck: 176 }), props: [], linear: true,
    frames: [
      { p: { sx: 6, sy: -1 }, t: 0.45, label: "" },
      { p: { sx: 0, sy: -8 }, t: 0.45, label: "Up" },
      { p: { sx: -7, sy: -1 }, t: 0.45, label: "Back" },
      { p: { sx: 0, sy: 3 }, t: 0.45, label: "Down" },
    ],
  },
  {
    id: "shoulder-squeeze", areas: ["neck"], name: "Shoulder squeeze",
    reps: 10, sets: 1, holdSec: 5, sides: false, doseNote: "10 times, twice a day, hold 5 seconds (from your sheet).",
    steps: [
      "Stand tall and clasp your hands loosely behind your back.",
      "Squeeze your shoulder blades together.",
      "Hold for 5 seconds. Don't squeeze too hard; it should feel comfortable.",
      "Relax. Repeat 10 times, twice a day.",
    ],
    caution: "Keep your chin level and your shoulders down.",
    view: "side", base: Object.assign({}, STAND, { wx: 90, wy: 104, wx2: 88, wy2: 104 }), props: [],
    frames: [
      { p: {}, t: 1, label: "Relax" },
      { p: { sx: -5, sy: 1, wx: 84, wy: 106, wx2: 82, wy2: 106 }, t: 1, hold: "H", label: "Squeeze your shoulder blades" },
    ],
  },
  {
    id: "reverse-prayer", areas: ["neck"], name: "Reverse prayer pose",
    reps: 3, sets: 1, holdSec: 15, sides: false, doseNote: SUGGESTED,
    steps: [
      "Stand tall with your back straight.",
      "Bring both hands behind your back.",
      "Let your palms come together in a prayer position, fingers pointing up.",
      "Feel your shoulder blades open. Hold, then lower your hands.",
    ],
    caution: "Go only as high as is comfortable. Palms can stay lower at first.",
    view: "side", base: Object.assign({}, STAND, { wx: 100, wy: 103, wx2: 99, wy2: 103 }), props: [],
    frames: [
      { p: {}, t: 1.4, label: "Lower your hands" },
      { p: { wx: 87, wy: 84, wx2: 86, wy2: 86, esign: 1, sx: -2 }, t: 1.8, hold: "H", label: "Palms together behind your back" },
    ],
  },
  {
    id: "arm-circles", areas: ["neck"], name: "Arm circles",
    reps: 10, sets: 1, holdSec: 0, sidesText: "each direction, each arm", doseNote: "10 times in each direction, then the other arm (from your sheet).",
    phases: [
      { name: "Arm 1, forwards" },
      { name: "Arm 1, backwards", reverse: true, say: "Now circle the other way" },
      { name: "Arm 2, forwards", mirror: true, say: "Switch to the other arm" },
      { name: "Arm 2, backwards", mirror: true, reverse: true, say: "Now circle the other way" },
    ],
    steps: [
      "Stand near a wall, side on, standing tall.",
      "Make big, slow circles with the arm closest to the wall.",
      "Get as close to the wall as you can.",
      "Do 10 in each direction, then turn round and do the other arm.",
    ],
    caution: "Do not slouch or round your back forward.",
    view: "side", base: STAND, props: [], linear: true, wrap: ["ua", "fa"],
    frames: [
      { p: { ua: 0, fa: 0 }, t: 0.8, label: "" },
      { p: { ua: 90, fa: 90 }, t: 0.8, label: "" },
      { p: { ua: 180, fa: 180 }, t: 0.8, label: "" },
      { p: { ua: 270, fa: 270 }, t: 0.8, label: "" },
    ],
  },

  /* --------------------------- KNEES & LEGS --------------------------- */
  {
    id: "towel-press", areas: ["legs"], name: "Knee press on rolled towel",
    reps: 10, sets: 1, holdSec: 5, sides: true, doseNote: SUGGESTED,
    steps: [
      "Lie on your back with a rolled towel under one knee.",
      "Tighten the front of your thigh and press the back of your knee down into the towel.",
      "Pull your toes toward you. Hold.",
      "Relax, then repeat.",
    ],
    caution: "Press firmly but without pain. Keep breathing.",
    view: "side", base: Object.assign({}, LIE, { th: 98, sh: 82, ft: 175 }), props: ["mat", "towel"],
    frames: [
      { p: {}, t: 0.8, label: "Relax" },
      { p: { th: 93, sh: 88, ft: 198 }, t: 0.8, hold: "H", label: "Press your knee down" },
    ],
  },
  {
    id: "bolster-heel-lift", areas: ["legs"], name: "Heel lift over bolster",
    reps: 10, sets: 1, holdSec: 5, sides: true, doseNote: SUGGESTED,
    steps: [
      "Lie on your back with a bolster or rolled blanket under one knee.",
      "Keep the knee resting on the bolster.",
      "Lift your heel up until the knee is straight. Hold.",
      "Lower the heel slowly.",
    ],
    caution: "The back of the knee stays on the bolster the whole time.",
    view: "side", base: Object.assign({}, LIE, { th: 120, sh: 62, ft: 150 }), props: ["mat", "bolster"],
    frames: [
      { p: {}, t: 1.2, label: "Lower your heel" },
      { p: { sh: 118, ft: 205 }, t: 1.2, hold: "H", label: "Lift your heel up" },
    ],
  },
  {
    id: "heel-slide", areas: ["legs"], name: "Bend and straighten your knee",
    reps: 10, sets: 1, holdSec: 2, sides: true, doseNote: SUGGESTED,
    steps: [
      "Lie on your back with both legs straight.",
      "Slide one heel along the floor toward your bottom, bending the knee.",
      "Bend only as far as is comfortable, then slide back until the knee is straight.",
    ],
    caution: "Keep the heel touching the floor the whole time.",
    view: "side", base: LIE, props: ["mat"],
    frames: [
      { p: { fx: 182, fy: 174 }, t: 1.4, label: "Straighten your knee" },
      { p: { fx: 150, fy: 174, ft: 120 }, t: 1.6, hold: "H", label: "Bend your knee" },
    ],
  },
  {
    id: "straight-leg-raise", areas: ["legs"], name: "Lift your leg straight",
    reps: 10, sets: 1, holdSec: 3, sides: true, doseNote: SUGGESTED,
    steps: [
      "Lie on your back. Bend one knee with that foot flat on the floor.",
      "Keep the other leg straight and tighten the front of that thigh.",
      "Lift the straight leg to the height of the bent knee.",
      "Hold, then lower it slowly.",
    ],
    caution: "Keep the knee of the lifting leg straight and your lower back relaxed.",
    view: "side", base: Object.assign({}, LIE, { fx2: 152, fy2: 174, ft2: 90 }), props: ["mat"],
    frames: [
      { p: {}, t: 1.5, label: "Lower slowly" },
      { p: { th: 128, sh: 128, ft: 218 }, t: 1.4, hold: "H", label: "Lift the straight leg" },
    ],
  },
  {
    id: "side-lying-lift", areas: ["legs"], name: "Side-lying leg lift",
    reps: 10, sets: 1, holdSec: 3, sides: true, doseNote: SUGGESTED,
    steps: [
      "Lie on one side with your head resting on your lower arm.",
      "Keep both legs straight, one on top of the other.",
      "Lift the top leg straight up, toes pointing forward. Hold.",
      "Lower it slowly. Turn over to do the other leg.",
    ],
    caution: "Don't roll backwards. Keep your hips stacked.",
    view: "side", base: SIDE_LIE, props: ["mat"],
    frames: [
      { p: {}, t: 1.4, label: "Lower slowly" },
      { p: { th: 122, sh: 122, ft: 200 }, t: 1.4, hold: "H", label: "Lift the top leg" },
    ],
  },
  {
    id: "prone-knee-bend", areas: ["legs"], name: "Fold your knee lying on tummy",
    reps: 10, sets: 1, holdSec: 3, sides: true, doseNote: SUGGESTED,
    steps: [
      "Lie on your tummy with your legs straight.",
      "Bend one knee, bringing your heel toward your bottom.",
      "Hold, then lower the leg slowly.",
    ],
    caution: "Keep your hips pressed to the floor.",
    view: "side", base: PRONE, props: ["mat"],
    frames: [
      { p: {}, t: 1.4, label: "Lower slowly" },
      { p: { sh: -178, ft: -250 }, t: 1.4, hold: "H", label: "Fold your knee" },
    ],
  },
  {
    id: "knee-extension", areas: ["legs"], name: "Raise your leg from the knee",
    reps: 10, sets: 1, holdSec: 5, sides: true, doseNote: SUGGESTED,
    steps: [
      "Sit up straight on a chair with both feet on the floor.",
      "Straighten one knee, lifting the foot until the leg is straight.",
      "Pull the toes toward you and tighten the thigh. Hold.",
      "Lower the foot slowly back to the floor.",
    ],
    caution: "Don't lean back. Move slowly in both directions.",
    view: "side", base: SIT, props: ["chair"],
    frames: [
      { p: {}, t: 1.4, label: "Lower slowly" },
      { p: { sh: 86, ft: 176 }, t: 1.4, hold: "H", label: "Straighten your knee" },
    ],
  },
  {
    id: "prone-leg-lift", areas: ["legs"], name: "Lift one leg straight lying on tummy",
    reps: 10, sets: 1, holdSec: 3, sides: true, doseNote: SUGGESTED,
    steps: [
      "Lie on your tummy with your legs straight.",
      "Tighten your buttock and lift one straight leg a little off the floor.",
      "Hold, then lower it slowly.",
    ],
    caution: "Lift only a little. Don't twist your hips or arch your back.",
    view: "side", base: PRONE, props: ["mat"],
    frames: [
      { p: {}, t: 1.3, label: "Lower slowly" },
      { p: { th: -110, sh: -110, ft: -170 }, t: 1.3, hold: "H", label: "Lift your leg" },
    ],
  },
  {
    id: "standing-march", areas: ["legs"], name: "Lift your thigh up and down",
    reps: 10, sets: 1, holdSec: 2, sides: true, doseNote: SUGGESTED,
    steps: [
      "Stand tall holding a table, rail or chair back.",
      "Lift one thigh up in front of you, bending the knee.",
      "Hold briefly, then lower it slowly.",
    ],
    caution: "Stand tall; don't lean back as you lift.",
    view: "side", base: STAND_HOLD, props: ["chair-back"],
    frames: [
      { p: {}, t: 1, label: "Lower slowly" },
      { p: { th: 82, sh: 4 }, t: 1, hold: "H", label: "Thigh up" },
    ],
  },
  {
    id: "hamstring-curl", areas: ["legs"], name: "Bend your knee behind",
    reps: 10, sets: 1, holdSec: 3, sides: true, doseNote: SUGGESTED,
    steps: [
      "Stand holding the back of a chair.",
      "Bend one knee, bringing your heel up toward your bottom.",
      "Keep your thighs side by side. Hold, then lower slowly.",
    ],
    caution: "Don't arch your back or swing the leg.",
    view: "side", base: STAND_HOLD, props: ["chair-back"],
    frames: [
      { p: {}, t: 1.2, label: "Lower slowly" },
      { p: { th: 6, sh: -95, ft: 0 }, t: 1.2, hold: "H", label: "Heel toward bottom" },
    ],
  },
  {
    id: "leg-sideways", areas: ["legs"], name: "Take your leg sideways",
    reps: 10, sets: 1, holdSec: 2, sides: true, doseNote: SUGGESTED,
    steps: [
      "Stand tall holding a chair or rail for balance.",
      "Keeping your toes pointing forward, lift one leg out to the side.",
      "Hold briefly, then bring it back slowly.",
    ],
    caution: "Don't lean your body to the other side.",
    view: "front", base: {}, props: [],
    frames: [
      { p: {}, t: 1, label: "Bring it back" },
      { p: { legL: 30 }, t: 1, hold: "H", label: "Leg out to the side" },
    ],
  },
  {
    id: "leg-behind", areas: ["legs"], name: "Take your leg straight behind",
    reps: 10, sets: 1, holdSec: 2, sides: true, doseNote: SUGGESTED,
    steps: [
      "Stand tall holding a table, rail or chair back.",
      "Keeping the knee straight, take one leg back behind you.",
      "Hold briefly, then bring it back slowly.",
    ],
    caution: "Don't lean forward or arch your back.",
    view: "side", base: STAND_HOLD, props: ["chair-back"],
    frames: [
      { p: {}, t: 1, label: "Bring it back" },
      { p: { th: -26, sh: -26, ft: 50 }, t: 1, hold: "H", label: "Leg straight behind" },
    ],
  },
  {
    id: "quad-stretch-wall", areas: ["legs"], name: "Thigh stretch at the wall",
    reps: 3, sets: 1, holdSec: 20, sides: true, doseNote: SUGGESTED,
    steps: [
      "Stand facing a wall with one hand on it for balance.",
      "Bend one knee and hold that ankle with the hand on the same side.",
      "Gently pull your heel toward your bottom. Keep knees close together.",
      "Hold, feeling the stretch in the front of the thigh, then lower.",
    ],
    caution: "Stand tall. Use a towel around the ankle if you can't reach it.",
    view: "side", base: Object.assign({}, STAND, { x: 108, wx2: 152, wy2: 62, wx: 108, wy: 103 }), props: ["wall-front"],
    frames: [
      { p: {}, t: 1.4, label: "Lower your foot" },
      { p: { th: 6, sh: -160, ft: -95, wx: 99, wy: 105, esign: 1 }, t: 1.6, hold: "H", label: "Heel to bottom, hold" },
    ],
  },
  {
    id: "step-up-down", areas: ["legs"], name: "Step up and step down",
    reps: 10, sets: 1, holdSec: 0, sides: false, doseNote: SUGGESTED,
    steps: [
      "Stand in front of a low step, holding a rail if you have one.",
      "Step up with your good leg first, then bring the other leg up.",
      "Step down with your painful leg first, then bring the good leg down.",
    ],
    caution: "Use a low step and hold on. Remember: up with the good, down with the painful.",
    view: "side", base: Object.assign({}, STAND, { x: 92, fx: 94, fy: 175, fx2: 91, fy2: 175 }), props: ["step"],
    frames: [
      { p: {}, t: 0.9, label: "Good leg down" },
      { p: { fx: 126, fy: 155, torso: 174 }, t: 0.9, label: "Good leg up on the step" },
      { p: { x: 122, y: 85, fx: 126, fy: 155, fx2: 120, fy2: 155, torso: 180 }, t: 1.1, hold: 0.4, label: "Step up" },
      { p: { x: 101, y: 105, fx: 126, fy: 155, fx2: 96, fy2: 175, torso: 178 }, t: 1.1, label: "Painful leg down first" },
    ],
  },

  /* ---------------------------- LOWER BACK ---------------------------- */
  {
    id: "bridge", areas: ["back"], name: "Lift your hips",
    reps: 1, sets: 1, holdSec: 30, sides: false, doseNote: BACK_SHEET,
    steps: [
      "Lie on your back with knees bent and feet flat on the floor.",
      "Lift your waist and bottom off the floor.",
      "Hold for 30 seconds, timing it by the watch.",
      "Lower down slowly.",
    ],
    caution: "Lift only as high as is comfortable. Don't arch your back.",
    view: "side", base: LIE_BENT, props: ["mat"],
    frames: [
      { p: {}, t: 1.5, label: "Lower down slowly" },
      { p: { x: 104, y: 148, torso: -62, neck: -88 }, t: 1.6, hold: "H", label: "Lift your hips" },
    ],
  },
  {
    id: "knee-chest", areas: ["back"], name: "Pull one leg to your stomach",
    reps: 1, sets: 1, holdSec: 30, sides: true, doseNote: BACK_SHEET,
    steps: [
      "Lie on your back with both knees bent and feet flat.",
      "Bring one knee up toward your stomach, holding it with both hands.",
      "Keep the other foot on the floor. Hold for 30 seconds.",
      "Lower the leg slowly and switch sides.",
    ],
    caution: "Pull gently; you should feel a stretch in the lower back and buttock.",
    view: "side", base: LIE_BENT, props: ["mat"],
    frames: [
      { p: {}, t: 1.5, label: "Lower the leg" },
      { p: { fx: 122, fy: 146, ft: 95, wx: 103, wy: 136, wx2: 101, wy2: 138 }, t: 1.6, hold: "H", label: "Knee to your stomach" },
    ],
  },
  {
    id: "elbow-chest-lift", areas: ["back"], name: "Press elbows down, lift your chest",
    reps: 1, sets: 1, holdSec: 30, sides: false, doseNote: BACK_SHEET,
    steps: [
      "Lie on your back with your legs straight.",
      "Bend your elbows so your forearms point up, elbows by your sides.",
      "Press your elbows into the floor to lift your chest a little.",
      "Keep your head resting on the floor. Hold for 30 seconds, then relax.",
    ],
    caution: "A small lift is enough. Stop if it pinches your back.",
    view: "side", base: Object.assign({}, LIE, { wx: undefined, wy: undefined, wx2: undefined, wy2: undefined, ua: 90, fa: 175, ua2: 90, fa2: 178 }), props: ["mat"],
    frames: [
      { p: {}, t: 1.4, label: "Relax down" },
      { p: { torso: -101, bend: -6, neck: -80, nod: -12, ua: 70, ua2: 70 }, t: 1.6, hold: "H", label: "Press elbows, lift chest" },
    ],
  },
  {
    id: "prone-chin-lift", areas: ["back"], name: "Lift your chin lying on tummy",
    reps: 1, sets: 1, holdSec: 30, sides: false, doseNote: BACK_SHEET,
    steps: [
      "Lie on your tummy with your arms by your sides.",
      "Slowly lift your chin and look forward, raising your head a little.",
      "Hold for 30 seconds, then lower your head slowly.",
    ],
    caution: "Keep your hips on the floor. Lift gently.",
    view: "side", base: PRONE, props: ["mat"],
    frames: [
      { p: {}, t: 1.4, label: "Lower your head" },
      { p: { torso: 97, neck: 138, nod: 38 }, t: 1.6, hold: "H", label: "Lift your chin" },
    ],
  },
  {
    id: "prone-knee-hold", areas: ["back"], name: "Bend one knee lying on tummy",
    reps: 1, sets: 1, holdSec: 30, sides: true, doseNote: BACK_SHEET,
    steps: [
      "Lie on your tummy with your legs straight.",
      "Bend one knee so the foot points to the ceiling.",
      "Hold for 30 seconds, then lower and switch legs.",
    ],
    caution: "Keep both hips on the floor.",
    view: "side", base: PRONE, props: ["mat"],
    frames: [
      { p: {}, t: 1.4, label: "Lower slowly" },
      { p: { sh: -178, ft: -250 }, t: 1.4, hold: "H", label: "Bend your knee" },
    ],
  },
  {
    id: "all-fours", areas: ["back"], name: "Hold the crawling position",
    reps: 1, sets: 1, holdSec: 30, sides: false, doseNote: BACK_SHEET,
    steps: [
      "Kneel on the floor.",
      "Lean forward and place your hands on the floor under your shoulders, knees under hips.",
      "Keep your back flat and your neck in line. Hold for 30 seconds.",
    ],
    caution: "Use a soft mat under your knees.",
    view: "side", base: FOURS, props: ["mat"],
    frames: [
      { p: { torso: 180, neck: 180, nod: 0, wx: 74, wy: 138, wx2: 72, wy2: 138, esign: -1 }, t: 1.4, label: "Kneel up" },
      { p: {}, t: 1.6, hold: "H", label: "Hands down, back flat" },
    ],
  },
];
