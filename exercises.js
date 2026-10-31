/* =====================================================================
 * MY EXERCISES
 * ---------------------------------------------------------------------
 * These are common, gentle physiotherapy exercises used as placeholders.
 * Replace them with the exercises your doctor prescribed.
 *
 * Each exercise:
 *   id        short unique name (keep it the same once you start, so your
 *             history stays linked)
 *   areas     which body areas it appears under: "neck", "legs", "back"
 *   name      title shown in the app
 *   reps      repetitions per set         sets   how many sets
 *   holdSec   seconds to hold at the "H" frames (0 = no hold)
 *   sides     true = do it on one side, then the other
 *   steps     the instructions, one line each
 *   caution   a short safety note
 *   media     OPTIONAL path to a GIF/video/image (e.g. "media/neck-1.gif").
 *             If given, it is shown instead of the drawn animation.
 *   view, base, props, ground, frames
 *             the drawn animation (see figure.js for what each pose key means).
 *             frames[0] is the start pose; the figure moves through every
 *             frame and back to frames[0], which counts as one repetition.
 *             In a frame, t = seconds to move there, hold = seconds to stay,
 *             hold: "H" uses holdSec, label = the cue shown and spoken.
 * ===================================================================== */

const AREAS = [
  { id: "neck", name: "Neck", icon: "neck", blurb: "Stiffness, posture and neck pain" },
  { id: "legs", name: "Knees & Legs", icon: "knee", blurb: "Knee support and leg strength" },
  { id: "back", name: "Lower Back", icon: "back", blurb: "Waist and lower back care" },
];

// Shared starting poses
const SIT = { x: 80, y: 137, torso: 180, neck: 180, ua: 10, fa: 70, ua2: 14, fa2: 70, th: 90, sh: 0, ft: 90, th2: 88, sh2: 2, ft2: 90 };
const STAND = { x: 100, y: 105, torso: 180, neck: 180 };
const STAND_HOLD = Object.assign({}, STAND, { wx: 139, wy: 82, wx2: 137, wy2: 84 });
const LIE = { x: 112, y: 174, torso: -90, neck: -103, wx: 109, wy: 176, wx2: 107, wy2: 176, esign: 1, th: 90, sh: 90, ft: 180, th2: 90, sh2: 90, ft2: 180 };
const LIE_BENT = Object.assign({}, LIE, { fx: 154, fy: 174, fx2: 152, fy2: 174, ft: 90, ft2: 90 });
const FOURS = { x: 70, y: 141, torso: 106, neck: 118, nod: -18, th: 0, sh: -90, ft: -130, th2: 2, sh2: -90, ft2: -130, wx: 121, wy: 175, wx2: 117, wy2: 175, esign: 1 };
const PRONE = { x: 92, y: 174, torso: 90, neck: 100, nod: 0, th: -90, sh: -90, ft: -150, th2: -90, sh2: -92, ft2: -150, wx: 139, wy: 175, wx2: 137, wy2: 175 };

const EXERCISES = [
  /* ------------------------------- NECK ------------------------------- */
  {
    id: "chin-tuck", areas: ["neck"], name: "Chin tucks",
    reps: 10, sets: 1, holdSec: 5, sides: false,
    steps: [
      "Sit tall in a chair, shoulders relaxed, looking straight ahead.",
      "Gently slide your chin straight back, as if making a double chin.",
      "Keep your eyes level. Do not tip your head up or down.",
      "Hold, then relax back to the start.",
    ],
    caution: "Small movement only. Stop if you feel pain spreading into your arm.",
    view: "side", base: SIT, props: ["chair"],
    frames: [
      { p: {}, t: 1, label: "Relax" },
      { p: { neck: 194, nod: -14 }, t: 1.2, hold: "H", label: "Tuck your chin back" },
    ],
  },
  {
    id: "neck-tilt", areas: ["neck"], name: "Side neck stretch",
    reps: 5, sets: 1, holdSec: 15, sides: false,
    steps: [
      "Sit or stand tall with your shoulders down.",
      "Slowly tilt your ear toward your shoulder until you feel a gentle stretch.",
      "Hold, come back to the middle, then repeat on the other side.",
    ],
    caution: "Do not lift your shoulder to meet your ear. Keep the stretch gentle.",
    view: "front", base: {}, props: [],
    frames: [
      { p: {}, t: 1.2, label: "Back to the middle" },
      { p: { tilt: 28 }, t: 1.6, hold: "H", label: "Tilt to the left" },
      { p: {}, t: 1.4, label: "Back to the middle" },
      { p: { tilt: -28 }, t: 1.6, hold: "H", label: "Tilt to the right" },
    ],
  },
  {
    id: "neck-turn", areas: ["neck"], name: "Neck rotation",
    reps: 5, sets: 1, holdSec: 5, sides: false,
    steps: [
      "Sit tall and look straight ahead.",
      "Slowly turn your head to look over one shoulder, as far as is comfortable.",
      "Hold, return to the middle, then turn to the other side.",
    ],
    caution: "Move slowly. Stop if you feel dizzy.",
    view: "front", base: {}, props: [],
    frames: [
      { p: {}, t: 1.2, label: "Look straight ahead" },
      { p: { turn: 1 }, t: 1.6, hold: "H", label: "Turn to the left" },
      { p: {}, t: 1.4, label: "Look straight ahead" },
      { p: { turn: -1 }, t: 1.6, hold: "H", label: "Turn to the right" },
    ],
  },
  {
    id: "chin-chest", areas: ["neck"], name: "Chin to chest stretch",
    reps: 5, sets: 1, holdSec: 10, sides: false,
    steps: [
      "Sit tall with both feet flat on the floor.",
      "Slowly lower your chin toward your chest.",
      "Feel the stretch at the back of your neck, hold, then lift slowly.",
    ],
    caution: "Let the head drop gently. Do not push it down with your hands.",
    view: "side", base: SIT, props: ["chair"],
    frames: [
      { p: {}, t: 1.4, label: "Lift your head" },
      { p: { neck: 135, nod: -15 }, t: 1.8, hold: "H", label: "Chin toward chest" },
    ],
  },
  {
    id: "shrugs", areas: ["neck"], name: "Shoulder shrugs",
    reps: 10, sets: 1, holdSec: 2, sides: false,
    steps: [
      "Stand or sit with your arms relaxed by your sides.",
      "Lift both shoulders up toward your ears.",
      "Hold briefly, then let them drop down and relax.",
    ],
    caution: "Breathe out as you lower your shoulders.",
    view: "front", base: {}, props: [],
    frames: [
      { p: {}, t: 0.9, label: "Drop and relax" },
      { p: { shrug: 1, armL: 6, armR: 6 }, t: 0.9, hold: "H", label: "Shoulders up" },
    ],
  },
  {
    id: "blade-squeeze", areas: ["neck", "back"], name: "Shoulder blade squeeze",
    reps: 10, sets: 1, holdSec: 5, sides: false,
    steps: [
      "Sit tall, elbows bent at your sides.",
      "Squeeze your shoulder blades back and together, pulling the elbows back.",
      "Keep your shoulders down away from your ears. Hold, then relax.",
    ],
    caution: "Keep your chin level; do not arch your back.",
    view: "side", base: Object.assign({}, SIT, { ua: 0, fa: 90, ua2: 4, fa2: 90 }), props: ["chair"],
    frames: [
      { p: {}, t: 1, label: "Relax" },
      { p: { ua: -28, fa: 70, ua2: -24, fa2: 72, torso: 182 }, t: 1, hold: "H", label: "Squeeze back" },
    ],
  },

  /* --------------------------- KNEES & LEGS --------------------------- */
  {
    id: "straight-leg-raise", areas: ["legs"], name: "Straight leg raise",
    reps: 10, sets: 2, holdSec: 3, sides: true,
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
    id: "heel-slide", areas: ["legs"], name: "Heel slides",
    reps: 10, sets: 2, holdSec: 2, sides: true,
    steps: [
      "Lie on your back with both legs straight.",
      "Slide one heel along the floor toward your bottom, bending the knee.",
      "Bend only as far as is comfortable, hold, then slide back out.",
    ],
    caution: "Keep the heel touching the floor the whole time.",
    view: "side", base: LIE, props: ["mat"],
    frames: [
      { p: { fx: 182, fy: 174 }, t: 1.4, label: "Slide the heel out" },
      { p: { fx: 150, fy: 174, ft: 120 }, t: 1.6, hold: "H", label: "Slide heel toward you" },
    ],
  },
  {
    id: "knee-extension", areas: ["legs"], name: "Seated knee extension",
    reps: 10, sets: 2, holdSec: 5, sides: true,
    steps: [
      "Sit tall on a chair with both feet on the floor.",
      "Straighten one knee, lifting the foot until the leg is straight.",
      "Pull the toes toward you and tighten the thigh. Hold.",
      "Lower the foot slowly back to the floor.",
    ],
    caution: "Do not lock the knee hard. Move slowly in both directions.",
    view: "side", base: SIT, props: ["chair"],
    frames: [
      { p: {}, t: 1.4, label: "Lower slowly" },
      { p: { sh: 86, ft: 176 }, t: 1.4, hold: "H", label: "Straighten your knee" },
    ],
  },
  {
    id: "sit-to-stand", areas: ["legs"], name: "Sit to stand",
    reps: 10, sets: 1, holdSec: 0, sides: false,
    steps: [
      "Sit near the front of a sturdy chair, feet flat and hip-width apart.",
      "Lean forward a little, with your nose over your toes.",
      "Push through your heels to stand up fully.",
      "Slowly sit back down with control.",
    ],
    caution: "Use your hands on the chair if you need support. Keep knees in line with toes.",
    view: "side", base: Object.assign({}, SIT, { fx: 112, fy: 173, fx2: 110, fy2: 173, ua: 30, fa: 40, ua2: 32, fa2: 42 }), props: ["chair"],
    frames: [
      { p: {}, t: 1.3, label: "Sit down slowly" },
      { p: { torso: 148, neck: 160, nod: 10, x: 84, y: 134, ua: 70, fa: 75, ua2: 72, fa2: 77 }, t: 0.9, label: "Lean forward" },
      { p: { x: 108, y: 106, torso: 178, neck: 180, nod: 0, ua: 6, fa: 4, ua2: 8, fa2: 6 }, t: 1.2, hold: 0.6, label: "Stand up" },
      { p: { torso: 150, neck: 162, nod: 8, x: 86, y: 132, ua: 70, fa: 75, ua2: 72, fa2: 77 }, t: 1.3, label: "Lower down" },
    ],
  },
  {
    id: "mini-squat", areas: ["legs"], name: "Mini squats",
    reps: 10, sets: 2, holdSec: 2, sides: false,
    steps: [
      "Stand behind a chair holding its back, feet hip-width apart.",
      "Bend your knees and push your hips back, as if starting to sit.",
      "Go down only a little, keeping your heels on the floor. Hold.",
      "Straighten back up.",
    ],
    caution: "Knees should stay behind your toes. Stop if your knee hurts.",
    view: "side", base: Object.assign({}, STAND_HOLD, { fx: 100, fy: 175, fx2: 98, fy2: 175 }), props: ["chair-back"],
    frames: [
      { p: {}, t: 1.2, label: "Stand up tall" },
      { p: { x: 91, y: 118, torso: 170 }, t: 1.4, hold: "H", label: "Bend your knees" },
    ],
  },
  {
    id: "calf-raise", areas: ["legs"], name: "Calf raises",
    reps: 15, sets: 2, holdSec: 2, sides: false,
    steps: [
      "Stand tall holding the back of a chair.",
      "Rise up onto your toes, lifting your heels as high as you can.",
      "Hold, then lower your heels slowly.",
    ],
    caution: "Keep your body tall, do not lean forward.",
    view: "side", base: Object.assign({}, STAND, { ua: 64, fa: 72, ua2: 62, fa2: 70 }), props: ["chair-back"], ground: true,
    frames: [
      { p: {}, t: 1.2, label: "Lower your heels" },
      { p: { ft: 30, ft2: 30 }, t: 1, hold: "H", label: "Up on your toes" },
    ],
  },
  {
    id: "hamstring-curl", areas: ["legs"], name: "Standing hamstring curl",
    reps: 10, sets: 2, holdSec: 3, sides: true,
    steps: [
      "Stand holding the back of a chair.",
      "Bend one knee, bringing your heel up toward your bottom.",
      "Keep your thighs side by side. Hold, then lower slowly.",
    ],
    caution: "Do not arch your back or swing the leg.",
    view: "side", base: Object.assign({}, STAND, { ua: 64, fa: 72, ua2: 62, fa2: 70 }), props: ["chair-back"], ground: true,
    frames: [
      { p: {}, t: 1.2, label: "Lower slowly" },
      { p: { th: 6, sh: -95, ft: 0 }, t: 1.2, hold: "H", label: "Heel toward bottom" },
    ],
  },

  /* ---------------------------- LOWER BACK ---------------------------- */
  {
    id: "knee-chest", areas: ["back"], name: "Knee to chest stretch",
    reps: 5, sets: 1, holdSec: 15, sides: true,
    steps: [
      "Lie on your back with both knees bent and feet flat.",
      "Bring one knee up toward your chest, holding it with both hands.",
      "Keep the other foot on the floor. Hold the gentle stretch.",
      "Lower the leg slowly and switch sides.",
    ],
    caution: "Pull gently; the stretch should be felt in the lower back and buttock.",
    view: "side", base: LIE_BENT, props: ["mat"],
    frames: [
      { p: {}, t: 1.5, label: "Lower the leg" },
      { p: { fx: 122, fy: 146, ft: 95, wx: 103, wy: 136, wx2: 101, wy2: 138 }, t: 1.6, hold: "H", label: "Knee to chest" },
    ],
  },
  {
    id: "pelvic-tilt", areas: ["back"], name: "Pelvic tilt",
    reps: 10, sets: 1, holdSec: 5, sides: false,
    steps: [
      "Lie on your back with your knees bent and feet flat.",
      "Tighten your tummy muscles and press the small of your back into the floor.",
      "Your pelvis tilts slightly up. Hold, then relax.",
    ],
    caution: "Keep breathing normally during the hold.",
    view: "side", base: Object.assign({}, LIE_BENT, { bend: -4, y: 172 }), props: ["mat"],
    frames: [
      { p: {}, t: 1.2, label: "Relax" },
      { p: { bend: 3, y: 170, torso: -93 }, t: 1.2, hold: "H", label: "Flatten your back" },
    ],
  },
  {
    id: "bridge", areas: ["back", "legs"], name: "Glute bridge",
    reps: 10, sets: 2, holdSec: 5, sides: false,
    steps: [
      "Lie on your back with knees bent, feet flat and hip-width apart.",
      "Squeeze your buttocks and lift your hips off the floor.",
      "Make a straight line from shoulders to knees. Hold.",
      "Lower down slowly, one part of the spine at a time.",
    ],
    caution: "Do not push the hips too high or arch your back.",
    view: "side", base: LIE_BENT, props: ["mat"],
    frames: [
      { p: {}, t: 1.5, label: "Lower down slowly" },
      { p: { x: 104, y: 148, torso: -62, neck: -88 }, t: 1.4, hold: "H", label: "Lift your hips" },
    ],
  },
  {
    id: "cat-cow", areas: ["back"], name: "Cat and cow",
    reps: 8, sets: 1, holdSec: 2, sides: false,
    steps: [
      "Kneel on all fours: hands under shoulders, knees under hips.",
      "Breathe out and round your back up toward the ceiling, head down (cat).",
      "Breathe in and let your tummy drop, lifting your head gently (cow).",
    ],
    caution: "Move within a comfortable range. Keep the movement slow.",
    view: "side", base: FOURS, props: ["mat"],
    frames: [
      { p: {}, t: 1.2, label: "Back to flat" },
      { p: { bend: 13, neck: 62, nod: 0 }, t: 1.6, hold: "H", label: "Round your back up" },
      { p: {}, t: 1.4, label: "Back to flat" },
      { p: { bend: -9, neck: 150, nod: -20 }, t: 1.6, hold: "H", label: "Let your back dip" },
    ],
  },
  {
    id: "bird-dog", areas: ["back"], name: "Bird dog",
    reps: 8, sets: 2, holdSec: 5, sides: true,
    steps: [
      "Start on all fours with a flat back.",
      "Reach one arm forward and the opposite leg straight back.",
      "Keep your hips level and your tummy tight. Hold.",
      "Return to all fours and switch sides.",
    ],
    caution: "Only lift as high as you can while keeping your back flat.",
    view: "side", base: FOURS, props: ["mat"],
    frames: [
      { p: {}, t: 1.3, label: "Back to all fours" },
      { p: { wx: 168, wy: 122, th2: -88, sh2: -90, ft2: -170, nod: -25 }, t: 1.5, hold: "H", label: "Reach arm and leg" },
    ],
  },
  {
    id: "press-up", areas: ["back"], name: "Prone press-up",
    reps: 10, sets: 1, holdSec: 3, sides: false,
    steps: [
      "Lie on your tummy with your hands flat under your shoulders.",
      "Keep your hips on the floor and slowly push your upper body up.",
      "Let your lower back relax. Hold, then lower slowly.",
    ],
    caution: "Only for back pain your doctor has said this suits. Stop if pain moves into the leg.",
    view: "side", base: PRONE, props: ["mat"],
    frames: [
      { p: {}, t: 1.5, label: "Lower down slowly" },
      { p: { torso: 124, neck: 140, nod: 0, bend: -5 }, t: 1.6, hold: "H", label: "Push up" },
    ],
  },
];
