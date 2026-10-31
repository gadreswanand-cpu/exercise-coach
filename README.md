# Exercise Coach

A free, installable phone app (PWA) for my daily physio exercises: neck, knees & legs, and lower back.
Each exercise has a moving demonstration, step-by-step instructions, a guided mode with timers and spoken cues,
and a daily tick list with a streak and a 6-week calendar. It works offline once installed, and adapts to a
foldable phone: one column when folded, list + details side by side when unfolded.

## Install on the phone
1. Open the app link in **Chrome**.
2. Tap the **⋮** menu → **Install app** (or **Add to Home screen**).
3. Open it from the home screen. It now works without internet.

## Change or add an exercise
All exercises live in [`exercises.js`](exercises.js). Each one is a small block of text: name, reps, sets,
hold time, steps, a caution, and the poses for the animation. To use your own GIF or video instead of the
drawn figure, put the file in the `media/` folder and add `media: "media/my-file.gif"` to the exercise.

After changing files, raise `VERSION` in [`sw.js`](sw.js) (for example `ec-v2`) so installed phones pick up the update.

## Ideas taken from leading exercise and physio apps
Looked at the general approach of home-exercise and rehab apps (physio "home exercise programme" apps,
digital back/knee care apps and timer-based workout apps). No content or artwork was copied; these are the
UX patterns used here:
- A looping demonstration next to clear dose: sets, reps, hold time, each side.
- A guided "follow along" mode: hold countdowns, rep counter, rest and side-switch timers, spoken cues, screen kept awake.
- A daily checklist with a progress ring and a streak to build the habit.
- A quick "how did it feel?" (easy / OK / painful) after each exercise, to share with the doctor.
- Short safety notes on every exercise.

The placeholder exercises are common, gentle physiotherapy exercises. They are not medical advice.
