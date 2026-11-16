# RepSheet

A free, browser-only tool for physiotherapists to build home exercise handouts.

## Try it
Double-click `index.html`. It opens in your web browser and works without the internet.
(Patient links and QR codes only work on patients' phones once the site is online.)

## What it does
- Pick exercises from a library and set sets, reps, hold time, how often and notes.
- Tick progressions (harder) and regressions (easier) to include for each exercise.
- Moving illustrations on screen, and numbered step-by-step pictures with arrows on the printed handout.
- Print or save as PDF, or open a pre-filled email in your own mail program.
- Optional weekly tick chart on the handout and patient page (patient ticks are saved on their own phone only).
- Optional patient goal and plan ("when I'll do them"), printed as write-in lines if left blank. Included in the patient link, never in templates.
- Green, amber, red pain guide (on by default) on the handout and patient page, with a pain limit setting (mild ache only, up to 3/10, up to 5/10).
- 50 exercises across knee, hip, ankle, back, shoulder, neck, balance and after surgery, all with moving pictures.
- 10 ready-made condition templates in starters.js (starting points only), from the empty handout or "My templates".
- Works offline once opened, and can be installed as an app (manifest.webmanifest, sw.js). **When you change any file, change VERSION at the top of sw.js** so devices fetch the new files.
- Opens patient links on older phones without built-in decompression (vendor/tiny-inflate.js, MIT licence).
- "My templates": save programmes in the physio's own browser (no patient details), start a new handout from one, and download or load a backup file.
- "Copy for notes": a clinical summary (sets x reps, load, progressions given, pain guide) to paste into the patient record. Copied on the device only.
- "Weight or band" per exercise, and "How long to keep going" for the whole programme.
- Search understands clinical terms (e.g. SLR, STS, glute med, Codman, DNF) via `aliases` in exercises.js.
- Time estimate ("about N minutes each time") and a tip when a programme has more than 5 exercises.
- "Add a daily reminder to my calendar" on the patient page: makes a calendar file on the phone, nothing is sent.
- Black and white printing (for mono printers, saves ink) and a paper saver (two columns, fits on fewer pages).
- Drag exercises into order with the grip handle (or use the arrow buttons or the arrow keys).
- "Share as template": a link that opens the builder pre-filled with the same exercises, settings and notes, for colleagues or reuse. It leaves out the patient's name, the date and contact details.
- "Read aloud" on the patient page (uses the phone's own voice; nothing is recorded or sent).
- Plain, easy-read wording: short sentences and everyday words. Keep to this style when adding exercises (see the note at the top of `exercises.js`).
- A QR code and link that opens the patient's own programme page (`view.html`) with moving pictures and optional videos.

## Files you might edit
- `exercises.js`: **the exercise library**: names, steps, default dosage, progressions, regressions, image and video.
- `illustrations.js`: the poses for the built-in drawings (only needed when adding a new drawn exercise).
- `config.js`: where the "Send feedback" and "Request an exercise" links go.
- `styles.css`: colours and look (brand colour is at the top).
- `images/`: your own pictures, photos or GIFs. Set `image: "images/your-file.gif"` in `exercises.js` to use one instead of the drawing.
- `videos/`: your own video files. Or use a YouTube/Vimeo link in the `video` field.

## Files you shouldn't need to touch
`app.js` (builder), `view.js` / `view.html` / `view.css` (patient page), `figures.js` (drawing engine),
`common.js` (shared helpers), `feedback.js`, `vendor/qrcode.js` (QR code maker, MIT licence, Kazuhiko Arase).

## Logs
- `FEEDBACK.md`: running log of feedback and what happened to it.
- `EXERCISE-REQUESTS.md`: exercises people have asked for.

## Privacy
- Patient details are never saved, sent or tracked. They disappear when the tab is closed.
- The patient link holds the programme itself after the `#`. That part of a link is never sent to the web server,
  and the patient's name is never put in it.
- "Email" opens the physio's own mail program; the website sends nothing.
- Videos from YouTube use the privacy-enhanced player and only load when the patient presses "Watch video".
- Only the physio's own name and contact details can be remembered, on their own device, if they tick the box.

## Hosting
It is a plain static website (no server or database), so it can be hosted anywhere by uploading this folder:
GitHub Pages, Netlify, Cloudflare Pages, or an NHS trust web server.
