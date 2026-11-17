/*
  RepSheet: translations for the patient page and the printed handout.

  HOW IT WORKS
  - English (below, in EN) is the master text. Every other language lives in its own file in the
    "lang" folder, e.g. lang/pl.js for Polish. A language file only loads when someone picks it.
  - The physio picks the patient's language in the builder. The patient link carries just the
    language code (for example "pl"), nothing else.
  - Anything missing from a language file falls back to English, so a half-finished language still works.
  - The physio's own typed words (notes, goal, own exercises, own progressions) are never translated.
    They show exactly as typed.

  ADDING OR CHECKING A LANGUAGE
  - Copy an existing file in "lang", change the code and the words.
  - Each file starts with  status: "draft".  Draft languages show a "Draft translation" notice on the
    patient page and handout. Once a native-speaking clinician has checked every line, change it to
    status: "checked"  and the notice goes away.
  - Add the language to LANGS below.
*/
(function () {
  "use strict";

  // code, English name, the language's own name, direction, and the voice to use for "Read aloud"
  const LANGS = [
    { code: "en", name: "English", own: "English", dir: "ltr", voice: "en-GB" },
    { code: "pl", name: "Polish", own: "Polski", dir: "ltr", voice: "pl-PL" },
    { code: "ro", name: "Romanian", own: "Română", dir: "ltr", voice: "ro-RO" },
    { code: "pa", name: "Punjabi (Gurmukhi)", own: "ਪੰਜਾਬੀ", dir: "ltr", voice: "pa-IN" },
    { code: "ur", name: "Urdu", own: "اردو", dir: "rtl", voice: "ur-PK" },
    { code: "bn", name: "Bengali", own: "বাংলা", dir: "ltr", voice: "bn-BD" },
    { code: "ar", name: "Arabic", own: "العربية", dir: "rtl", voice: "ar-SA" }
  ];

  // Master English wording. {n}, {t}, {name} and so on are filled in by the page.
  // Where a value is an object (one / other), the right form is picked for the number.
  const EN = {
    // Language bar
    "lang.label": "Language",
    "lang.showEnglish": "Show English too",
    "lang.draft": "Beta: this translation is still being tested. It has not been checked by a native speaker yet. If anything is unclear, ask your physio.",

    // Header and intro
    "page.title": "Your exercises",
    "hdr.pause": "Pause pictures",
    "hdr.play": "Play pictures",
    "hdr.large": "Larger text",
    "hdr.normal": "Normal text",
    "hdr.print": "Print",
    "intro.title": "Your home exercise programme",
    "intro.minutes": { one: "About {n} minute each time", other: "About {n} minutes each time" },
    "fa.start": "Start my exercises",
    "fa.startHint": "Go through them one at a time, with a counter and a timer.",
    "msg.title": "A message from your physio",
    "install.title": "Keep your exercises one tap away",
    "install.android": "Add this page to your home screen. It opens like an app, even without internet.",
    "install.ios": "Tap the Share button {icon} in Safari, then tap “Add to Home Screen”.",
    "install.button": "Add to home screen",
    "install.close": "Not now",
    "install.gotIt": "Got it",
    "goal.title": "My goal",
    "plan.title": "My plan: when I'll do them",
    "du.title": "How long to keep going",
    "old.note": "Your physio gave you this programme {n} weeks ago. If you're not sure it's still right for you, check with them.",

    // Exercise cards
    "card.read": "Read aloud",
    "card.stopRead": "Stop reading",
    "card.pause": "Pause",
    "card.play": "Play",
    "card.own": "Written by your physio",
    "card.ownLike": "The picture shows a similar exercise. Follow your physio's steps below.",
    "card.ownShow": "Your physio will show you how to do this one.",
    "card.need": "You'll need:",
    "card.harder": "To make it harder",
    "card.easier": "To make it easier",
    "pic.moving": "Moving illustration of {name}",
    "pic.steps": "Step by step pictures of {name}",
    "pic.still": "Illustration of {name}",
    "media.picture": "Picture",
    "media.video": "Video",
    "media.show": "Show video of {name}",

    // Dose
    "side.l": "Left side",
    "side.r": "Right side",
    "side.b": "Both sides",
    "dose.times": { one: "once", other: "{n} times" },
    "dose.rounds": { one: "{n} round", other: "{n} rounds" },
    "dose.hold": { one: "hold for {n} second", other: "hold for {n} seconds" },
    "dose.holdEach": { one: "hold for {n} second each time", other: "hold for {n} seconds each time" },
    "dose.with": "with {x}",
    "dose.use": "Use: {x}",
    "cell.times": { one: "time", other: "times" },
    "cell.rounds": { one: "round", other: "rounds" },
    "cell.hold": "hold",
    "cell.sec": "{n}s",

    // Week chart
    "ticks.title": "Your week",
    "ticks.prev": "Previous week",
    "ticks.next": "Next week",
    "ticks.help": "Tap a day when you've done your exercises.",
    "ticks.days": "Days of the week",
    "ticks.saved": "Your ticks are saved on this phone only. Nothing is sent anywhere.",
    "ticks.thisWeek": "This week",
    "ticks.weekOf": "Week of {d}",
    "ticks.today": "today",
    "ticks.done": "done",
    "ticks.count": "{n} of 7 days done.",
    "ticks.great": "{n} of 7 days done. Great work!",
    "ticks.none": "No days ticked yet this week.",
    "ticks.streak": "You've done them {n} days in a row. Keep it going!",
    "ticks.week": "Week {n}",
    "ticks.printTitle": "Tick a box each day you do your exercises",

    // Error
    "error.title": "We couldn't open this programme",
    "error.text": "The link may be incomplete. Try scanning the QR code again, or ask your physiotherapist to send you the link again.",

    // Reminder
    "rem.title": "Remind me",
    "rem.text": "Doing your exercises at the same time each day makes them easier to remember.",
    "rem.days": "Days",
    "rem.daily": "Every day",
    "rem.weekdays": "Monday to Friday",
    "rem.mwf": "Monday, Wednesday and Friday",
    "rem.time": "Time",
    "rem.button": "Add a reminder to my calendar",
    "rem.hint": "This adds a reminder to your phone's calendar for the next 6 weeks. Nothing is sent to us.",
    "rem.summary": "Do my exercises",
    "rem.open": "Open your exercises:",
    "rem.alarm": "Time for your exercises",

    // Display
    "disp.title": "Make this page easier to read",
    "disp.large": "Larger text",
    "disp.easy": "Easier reading",
    "disp.contrast": "High contrast",
    "disp.hint": "Easier reading uses a cream background and more space between lines. These choices are saved on this phone only.",

    // Safety and footer
    "safe.title": "Stay safe:",
    "safe.text": "Stop if an exercise causes sharp pain, or pain that gets worse. Then call your physio.",
    "foot.privacy": "This page is built from your link. Your programme is not stored anywhere.",
    "foot.privacyLink": "Privacy",
    "foot.disclaimer": "Disclaimer",

    // Contact my physio
    "contact.title": "Questions about your exercises?",
    "contact.textEmailPhone": "Contact your physio. This opens your own email or phone app. Nothing goes through RepSheet.",
    "contact.textEmail": "Contact your physio. This opens your own email app. Nothing goes through RepSheet.",
    "contact.textPhone": "Contact your physio. This opens your own phone app. Nothing goes through RepSheet.",
    "contact.email": "Email my physio",
    "contact.call": "Call {x}",
    "contact.text": "Text my physio",

    // How is it going?
    "ci.title": "How is it going?",
    "ci.intro": "After a week or so, tell us how each exercise feels. Show your answers to your physio at your next appointment.",
    "ci.easy": "Too easy",
    "ci.right": "About right",
    "ci.hard": "Too hard",
    "ci.feel": "How does {name} feel?",
    "ci.show": "Show this to your physio",
    "ci.days": "{n} of 7",
    "ci.daysText": "days in the last week",
    "ci.notAnswered": "Not answered",
    "ci.copy": "Copy to send to my physio",
    "ci.clear": "Clear my answers",
    "ci.saved": "Saved on this phone only. Nothing is sent to RepSheet. If you send it, it goes in your own message.",
    "ci.copied": "Copied",
    "ci.noCopy": "Couldn't copy on this phone",

    // Stages
    "stage.nav": "Stages",
    "stage.on": "You are on {name}.",
    "stage.onWhen": "You are on {name} ({when}).",
    "stage.ready": "Ready for {name}?",
    "stage.moveWhen": "Move on when:",
    "stage.moveDefault": "Move on when your physio says you're ready.",
    "stage.notSure": "Not sure? Ask your physio first.",
    "stage.go": "Go to {name}",
    "stage.last": "This is the last stage",
    "stage.lastText": "Keep going with these exercises until your physio tells you otherwise.",
    "stage.nextWhen": "Move on to the next stage when:",

    // Follow along
    "fa.close": "Close",
    "fa.soundOn": "Sound on",
    "fa.soundOff": "Sound off",
    "fa.back": "Back",
    "fa.next": "Next",
    "fa.finish": "Finish",
    "fa.nav": "Move between exercises",
    "fa.pos": "Exercise {n} of {t}",
    "fa.howTo": "How to do it",
    "fa.takeOff": "Take one off",
    "fa.again": "Start again",
    "fa.round": "Round {n} of {t}",
    "fa.hold": "Hold",
    "fa.seconds": { one: "second", other: "seconds" },
    "fa.rest": "Rest",
    "fa.nextRound": "Next: round {n} of {t}",
    "fa.stopHold": "Stop the hold",
    "fa.skipRest": "Skip the rest",
    "fa.finished": "Finished",
    "fa.wellDone": "Well done!",
    "fa.nextEx": "Next exercise",
    "fa.count": "Count",
    "fa.ofDone": "of {n} done",
    "fa.startHold": "Start hold ({n} seconds)",
    "fa.didOne": "I did one (+1)",
    "fa.ready": "When you're ready",
    "fa.secondHold": "second hold",
    "fa.didRound": "I did this round",
    "fa.didIt": "I've done it",
    "fa.allDone": "All done",
    "fa.ticked": "Today is ticked",
    "fa.tickToday": "Tick today on my chart",
    "fa.tickedSay": "Today is ticked on your chart.",
    "fa.finishedText": "You've finished your exercises for now.",
    "fa.tickSaved": "Your tick is saved on this phone only.",
    "fa.finishedSafety": "If anything caused sharp pain, or pain that got worse, call your physio.",
    "fa.sayDone": "{n} of {t} done",
    "fa.sayRoundDone": "Round {n} done. Rest for {s} seconds.",
    "fa.sayExDone": "Well done. That exercise is finished.",
    "fa.sayRound": "Round {n}. Off you go.",
    "fa.sayRoundShort": "Round {n}.",
    "fa.sayHoldStopped": "Hold stopped. Not counted.",
    "fa.sayTakenOff": "Taken one off.",
    "fa.sayAgain": "Starting this exercise again.",

    // Printed handout (from the builder)
    "print.kicker": "Home exercise programme",
    "print.name": "Name",
    "print.date": "Date",
    "print.physio": "Physiotherapist",
    "print.contact": "Contact",
    "print.keepGoing": "Keep going",
    "print.time": "Time needed",
    "print.scan": "Scan me to watch your exercises move",
    "print.safe": "Stay safe.",
    "print.questions": "Questions? Contact {x}"
  };

  // Frequencies the library uses as defaults. Anything else the physio types stays as typed.
  const FREQ = ["Once a day", "Twice a day", "3 times a day", "Every other day", "3 times a week",
    "Twice a day, and before you get up", "Every 2 hours", "Every hour", "Every time you cough, sneeze or lift"];

  const PACKS = {};
  let current = "en", pack = null, showEnglish = false;

  const langInfo = (code) => LANGS.find((l) => l.code === code) || null;
  const known = (code) => !!langInfo(code);

  // A language file calls this when it loads
  function add(code, data) { PACKS[code] = data; }

  const loading = {};
  function load(code) {
    if (!known(code) || code === "en") return Promise.resolve(true);
    if (PACKS[code]) return Promise.resolve(true);
    if (!loading[code]) {
      loading[code] = new Promise((resolve) => {
        const s = document.createElement("script");
        s.src = "lang/" + code + ".js";
        s.onload = () => resolve(!!PACKS[code]);
        s.onerror = () => { delete loading[code]; resolve(false); };
        document.head.append(s);
      });
    }
    return loading[code];
  }

  // Switch the words used by t() and friends. Does not touch the page; see apply().
  async function use(code, english) {
    if (!known(code)) code = "en";
    const ok = await load(code);
    current = ok ? code : "en";
    pack = current === "en" ? null : PACKS[current];
    showEnglish = !!english && current !== "en";
    return current;
  }

  // Same as use(), for a language that has already loaded (no waiting). Returns false if it hasn't.
  function useNow(code, english) {
    if (code !== "en" && !PACKS[code]) return false;
    current = known(code) ? code : "en";
    pack = current === "en" ? null : PACKS[current];
    showEnglish = !!english && current !== "en";
    return true;
  }

  const plurals = {};
  function pluralForm(n) {
    try {
      if (!plurals[current]) plurals[current] = new Intl.PluralRules(current);
      return plurals[current].select(Number(n));
    } catch (e) { return Number(n) === 1 ? "one" : "other"; }
  }
  function fill(s, vars) {
    return String(s).replace(/\{(\w+)\}/g, (m, k) => (vars && vars[k] != null ? vars[k] : m));
  }
  function pick(v, vars) {
    if (v && typeof v === "object") {
      const n = vars && vars.n != null ? vars.n : 0;
      const form = pluralForm(n);
      v = v[form] != null ? v[form] : (v.other != null ? v.other : v.one);
    }
    return fill(v, vars);
  }
  // Translated text for a key (falls back to English)
  function t(key, vars) {
    const v = pack && pack.ui && pack.ui[key] != null ? pack.ui[key] : EN[key];
    if (v == null) return key;
    return pick(v, vars);
  }
  // English text for a key, whatever language is on
  function en(key, vars) {
    const v = EN[key];
    if (v == null) return key;
    if (v && typeof v === "object") { const n = vars && vars.n != null ? vars.n : 0; return fill(Number(n) === 1 ? v.one : v.other, vars); }
    return fill(v, vars);
  }
  const translated = (key) => !!(pack && pack.ui && pack.ui[key] != null);

  // ---------- Exercises ----------
  // Language files hold each exercise as: id: [name, [steps], [harder], [easier]]
  function exRow(ex) { return ex && !ex.custom && pack && pack.ex ? pack.ex[ex.id] : null; }
  function exName(ex) { const r = exRow(ex); return (r && r[0]) || ex.name; }
  function exSteps(ex) {
    const r = exRow(ex);
    return (ex.instructions || []).map((s, i) => (r && r[1] && r[1][i]) || s);
  }
  function exOption(ex, list, i) {
    const r = exRow(ex), idx = list === "progressions" ? 2 : 3;
    const base = (ex[list] || [])[i];
    return (r && r[idx] && r[idx][i]) || base;
  }
  const hasEx = (ex) => !!exRow(ex);

  // A short label under a step picture ("Stand tall")
  function label(text) { return (pack && pack.labels && pack.labels[text]) || text; }
  function kit(text) { return (pack && pack.kit && pack.kit[text]) || text; }
  function freq(text) {
    const s = String(text || "").trim();
    if (!pack || !pack.freq) return s;
    const hit = Object.keys(pack.freq).find((k) => k.toLowerCase() === s.toLowerCase());
    return hit ? pack.freq[hit] : s;
  }

  // "Left side · 10 times, 3 rounds · hold for 5 seconds each time · Twice a day", in the chosen language
  function describe(p) {
    const parts = [];
    if (p.side === "l" || p.side === "r" || p.side === "b") parts.push(t("side." + p.side));
    const sets = Number(p.sets), reps = Number(p.reps), hold = Number(p.hold);
    const times = (n) => t("dose.times", { n });
    const rounds = (n) => t("dose.rounds", { n });
    const comma = (pack && pack.comma) || ", "; // Arabic and Urdu use their own comma
    if (sets > 1 && reps > 1) parts.push(times(reps) + comma + rounds(sets));
    else if (reps > 1) parts.push(times(reps));
    else if (sets > 1) parts.push(rounds(sets));
    if (hold) parts.push(t(reps > 1 || sets > 1 ? "dose.holdEach" : "dose.hold", { n: hold }));
    if (p.load && String(p.load).trim()) parts.push(t("dose.with", { x: String(p.load).trim() }));
    if (p.frequency && String(p.frequency).trim()) parts.push(freq(p.frequency));
    const text = parts.join(" · ");
    return text ? text.charAt(0).toLocaleUpperCase(current) + text.slice(1) : "";
  }

  // Some browsers lack date names for a language (for example Punjabi on some Chrome builds) and show "2026 M11 17".
  // A language file can give its own names (months: 12, days: 7 starting Sunday) to use when that happens.
  function intlOk() {
    try { return Intl.DateTimeFormat.supportedLocalesOf([current]).length > 0 && !/M\d/.test(new Date(2026, 10, 17).toLocaleDateString(current, { month: "long" })); }
    catch (e) { return false; }
  }
  function ownDate(d, opts) {
    const o = opts || { day: "numeric", month: "long", year: "numeric" }, parts = [];
    if (o.weekday) parts.push(pack.days[d.getDay()]);
    if (o.day) parts.push(d.getDate());
    if (o.month) parts.push(pack.months[d.getMonth()]);
    if (o.year) parts.push(d.getFullYear());
    return parts.join(" ");
  }
  function formatDate(iso, opts) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    if (current !== "en" && pack && pack.months && !intlOk()) return ownDate(d, opts);
    try { return d.toLocaleDateString(current === "en" ? "en-GB" : current, opts || { day: "numeric", month: "long", year: "numeric" }); }
    catch (e) { return d.toLocaleDateString("en-GB", opts); }
  }
  function weekdayShort(date) {
    if (current !== "en" && pack && pack.days && !intlOk()) return pack.days[date.getDay()];
    try { return date.toLocaleDateString(current === "en" ? "en-GB" : current, { weekday: "short" }); }
    catch (e) { return date.toLocaleDateString("en-GB", { weekday: "short" }); }
  }

  // ---------- Putting words on the page ----------
  // Elements with data-i18n="key" get their text swapped. With "Show English too",
  // a small English line is added underneath (class "en-also").
  function enLine(text, tag) {
    const s = document.createElement(tag || "span");
    s.className = "en-also";
    s.lang = "en";
    s.dir = "ltr";
    s.textContent = text;
    return s;
  }
  // Fill an element with the translation, plus English underneath when wanted
  function put(node, key, vars, opts) {
    if (!node) return node;
    node.textContent = t(key, vars);
    if (showEnglish && translated(key) && !(opts && opts.noEnglish)) node.append(enLine(en(key, vars)));
    return node;
  }
  // Text that came from somewhere else (an exercise step), with its English
  function putPair(node, text, english) {
    node.textContent = text;
    if (showEnglish && english && english !== text) node.append(enLine(english));
    return node;
  }
  function apply(root) {
    (root || document).querySelectorAll("[data-i18n]").forEach((n) => put(n, n.dataset.i18n, null, { noEnglish: n.hasAttribute("data-i18n-plain") }));
    (root || document).querySelectorAll("[data-i18n-aria]").forEach((n) => n.setAttribute("aria-label", t(n.dataset.i18nAria)));
  }
  // Set lang and dir on the page, and a class for the right fonts
  function setPage() {
    const info = langInfo(current) || LANGS[0];
    document.documentElement.lang = current === "en" ? "en-GB" : current;
    document.documentElement.dir = info.dir;
    document.body.classList.remove(...LANGS.map((l) => "lang-" + l.code));
    document.body.classList.add("lang-" + current);
    document.body.classList.toggle("show-english", showEnglish);
    document.body.classList.toggle("rtl", info.dir === "rtl");
  }
  // Is the current language still a draft?
  const isDraft = () => current !== "en" && (!pack || pack.status !== "checked");

  window.RepSheetI18n = {
    LANGS, EN, FREQ, add, load, use, useNow, t, en, translated, exName, exSteps, exOption, hasEx, label, kit, freq,
    describe, formatDate, weekdayShort, enLine, put, putPair, apply, setPage, isDraft, langInfo,
    get lang() { return current; }, get showEnglish() { return showEnglish; }, get pack() { return pack; }, packs: PACKS
  };
})();
