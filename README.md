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
- Three-column builder on wide screens: library, the handout, and a handout details panel (actions, patient and physio details, print options, advice, goal and plan). On smaller screens the details fold away above the handout.
- Gentle border on every printed page.
- (The green, amber, red pain guide was removed on 16 Nov 2026 at Alex's request. Older links that had it switched on still open, without it.)
- 50 exercises across knee, hip, ankle, back, shoulder, neck, balance and after surgery, all with moving pictures.
- 10 ready-made condition templates in starters.js (starting points only), from the empty handout or "My templates".
- Works offline once opened, and can be installed as an app (manifest.webmanifest, sw.js). **When you change any file, change VERSION at the top of sw.js** so devices fetch the new files.
- Opens patient links on older phones without built-in decompression (vendor/tiny-inflate.js, MIT licence).
- "My templates": save programmes in the physio's own browser (no patient details), start a new handout from one, and download or load a backup file.
- "Make your own exercise": physios write their own exercise (name, steps, dose, optional photo, and a similar library drawing for the patient's phone). Saved in their browser only, included in the backup file. In links only the words travel, never the photo. Labelled "not checked by RepSheet" in the builder and "Written by your physio" for patients.
- Pages: index.html is the landing page for physios, builder.html is the handout builder, view.html is the patient page. Old template links (index.html#t=...) forward to the builder.
- "Copy for notes": a clinical summary (sets x reps, load, progressions given) to paste into the patient record. Copied on the device only.
- "Weight or band" per exercise, and "How long to keep going" for the whole programme.
- Search understands clinical terms (e.g. SLR, STS, glute med, Codman, DNF) via `aliases` in exercises.js.
- Time estimate ("about N minutes each time") and a tip when a programme has more than 5 exercises.
- "Add a daily reminder to my calendar" on the patient page: makes a calendar file on the phone, nothing is sent.
- Black and white printing (for mono printers, saves ink) and a paper saver (two columns, fits on fewer pages).
- Put exercises in order with the up and down arrow buttons on each exercise.
- "Share as template": a link that opens the builder pre-filled with the same exercises, settings and notes, for colleagues or reuse. It leaves out the patient's name, the date and contact details.
- "Read aloud" on the patient page (uses the phone's own voice; nothing is recorded or sent).
- Plain, easy-read wording: short sentences and everyday words. Keep to this style when adding exercises (see the note at the top of `exercises.js`).
- A QR code and link that opens the patient's own programme page (`view.html`) with moving pictures and optional videos.
- (17 Nov 2026 update) Builder: spelling-tolerant search and goal words ("stairs"), body map (bodymap.js), type filter (`type` in exercises.js), favourites and recent, preview before adding, left/right/both sides with one-click copy for the other side, undo (also Ctrl+Z), "/" to search and Enter to add, set "How often" for all, a privacy check that warns about patient details in notes (privacy-check.js, warns only), stages (e.g. Weeks 0 to 2), easy read handouts (one exercise per page), and a "You'll need" equipment line.
- (17 Nov 2026 update) Patient page (patient-extras.js and view.js): larger text, easier reading and high contrast, saved on the phone; "How is it going?" check-in (too easy / about right / too hard, no pain score, physio switches it on); "Contact my physio" from the contact details typed; reminder days; days in a row; a note when a programme is 12 weeks old or more; one stage at a time.
- Pages: for-nhs-teams.html (information governance summary), accessibility.html, changes.html (what's changed: add a line when you publish something new).

## Files you might edit
- `exercises.js`: **the exercise library**: names, steps, default dosage, progressions, regressions, image and video.
- `illustrations.js`: the poses for the built-in drawings (only needed when adding a new drawn exercise).
- `config.js`: where the "Send feedback" and "Request an exercise" links go.
- `styles.css`: colours and look (brand colour is at the top).
- `images/`: your own pictures, photos or GIFs. Set `image: "images/your-file.gif"` in `exercises.js` to use one instead of the drawing.
- `videos/`: your own video files. Or use a YouTube/Vimeo link in the `video` field.
  Adding a video to an exercise makes a little "Picture | Video" switch appear under its moving picture, in the builder and on the patient page. Exercises with no video show no switch.

## Translations (patient page and printed handout)
- The clinician picks the patient's language under "Print and patient page options". The patient link carries only a language code (`lg`) and a "show English too" flag (`le`). Nothing else changes.
- `i18n.js` holds the English master wording and the list of languages. Each language is one file in `lang/` (for example `lang/pl.js`), loaded only when needed.
- Every language file starts as `status: "draft"`, which shows a "Draft translation" notice to patients. When a native-speaking clinician has checked every line, change it to `status: "checked"`.
- Clinicians' own typed notes, goals and own exercises always stay exactly as typed.
- After changing English wording or adding an exercise, run `node tools/check-translations.js` to list what each language is missing.
- To add a language: add it to `LANGS` in `i18n.js`, copy a file in `lang/`, translate it, and run the check.

## Files you shouldn't need to touch
`app.js` (builder), `view.js` / `view.html` / `view.css` (patient page), `figures.js` (drawing engine),
`common.js` (shared helpers), `feedback.js`, `vendor/qrcode.js` (QR code maker, MIT licence, Kazuhiko Arase).

## Checks
- `node tests/smoke.js` loads every page, opens old patient links (tests/old-links.json, made by earlier versions) and builds a handout. GitHub runs it on every push (.github/workflows/check.yml).
- Each page has a Content-Security-Policy tag. **If you change an inline `<script>`, run `python3 tests/update-csp.py`**, or that script will be blocked.

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

## Contact form (contact.html)
Messages are sent through Web3Forms (free, 250 a month) and emailed to you. Your email address never appears in the site's code.
1. Go to web3forms.com, type in the RepSheet email address and press "Create Access Key". The key arrives by email.
2. Paste the key into `contactFormKey` in config.js. Until then the page says the form isn't switched on yet.
3. In the Web3Forms dashboard, set how long submissions are kept to the shortest option (the privacy page says we do this).
