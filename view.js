/*
  Patient page. Reads the programme from the part of the link after "#".
  That part of a link is never sent to the web server, so nothing about the patient leaves their phone.
*/
(function () {
  "use strict";
  const H = window.Handout;
  const I = window.RepSheetI18n;
  const T = (k, v) => I.t(k, v);
  const $ = (s) => document.querySelector(s);
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    kids.flat().forEach((c) => c != null && n.append(c));
    return n;
  };

  // ---------- Read aloud ----------
  // Plays recorded natural-voice clips (voice.js) where they exist, otherwise the phone's own voice.
  // Nothing is recorded from the patient or sent anywhere.
  const canSpeak = "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function";
  let speaking = null; // the button whose card is being read
  // The voice for the page's language (for example Polish). Phones without one can't read that language aloud.
  function speechLang() { const info = I.langInfo(I.lang); return info ? info.voice : "en-GB"; }
  function pickVoice() {
    const want = speechLang(), base = want.split("-")[0].toLowerCase();
    const voices = speechSynthesis.getVoices();
    return voices.find((v) => v.lang.replace("_", "-") === want) || voices.find((v) => v.lang.toLowerCase().split(/[-_]/)[0] === base) || null;
  }
  // Hide "Read aloud" when this phone has no voice for the chosen language
  function syncReadButtons() {
    if (!canSpeak) return;
    const voices = speechSynthesis.getVoices();
    const ok = I.lang === "en" || !voices.length || !!pickVoice();
    document.querySelectorAll(".p-read").forEach((b) => { b.hidden = !ok; });
  }
  if (canSpeak && "onvoiceschanged" in speechSynthesis) speechSynthesis.addEventListener("voiceschanged", syncReadButtons);
  const readLabel = () => "\uD83D\uDD0A " + T("card.read");
  function stopReading() {
    if (window.RepVoice) window.RepVoice.stop();
    else if (!canSpeak) return;
    else speechSynthesis.cancel();
    document.querySelectorAll(".reading").forEach((n) => n.classList.remove("reading"));
    if (speaking) { speaking.textContent = readLabel(); speaking.setAttribute("aria-pressed", "false"); speaking = null; }
  }
  function readCard(btn, cardEl) {
    if (speaking === btn) { stopReading(); return; }
    stopReading();
    const parts = [...cardEl.querySelectorAll("h2, .p-dose, .p-steps li, .p-notes, .p-options h3, .p-options li")];
    if (!parts.length) return;
    speaking = btn;
    btn.textContent = "\u25A0 " + T("card.stopRead");
    btn.setAttribute("aria-pressed", "true");
    // Natural voice (voice.js): plays the recorded clips where they exist, phone's voice for the rest.
    // English only: other languages always use the phone's voice.
    if (window.RepVoice) {
      const spoken = parts.map((part) => {
        const copy = part.cloneNode(true);
        copy.querySelectorAll(".en-also").forEach((x) => x.remove());
        return { el: part, text: copy.textContent, group: part.matches(".p-steps li") ? "steps" : "" };
      });
      const mark = (els) => { document.querySelectorAll(".reading").forEach((x) => x.classList.remove("reading")); els.forEach((x) => x.classList.add("reading")); };
      window.RepVoice.read(spoken, {
        lang: I.lang === "en" ? "en" : "", voice: speechLang(),
        onPart: (p) => mark(p.els || [p.el]),
        onEnd: () => { if (speaking === btn) stopReading(); }
      });
      return;
    }
    const voice = pickVoice();
    parts.forEach((part, n) => {
      // Read the patient's language only, not the small English lines
      const copy = part.cloneNode(true);
      copy.querySelectorAll(".en-also").forEach((x) => x.remove());
      const u = new SpeechSynthesisUtterance(copy.textContent.replace(/·/g, ","));
      u.lang = speechLang();
      if (voice) u.voice = voice;
      u.rate = 0.9;
      u.onstart = () => { document.querySelectorAll(".reading").forEach((x) => x.classList.remove("reading")); part.classList.add("reading"); };
      if (n === parts.length - 1) { u.onend = () => { if (speaking === btn) stopReading(); }; u.onerror = u.onend; }
      speechSynthesis.speak(u);
    });
  }

  function pauseButton(pic) {
    const b = el("button", { type: "button", class: "p-pause", "aria-pressed": String(pic.controls.paused) }, T(pic.controls.paused ? "card.play" : "card.pause"));
    b.addEventListener("click", () => {
      if (pic.controls.paused) pic.controls.play(); else pic.controls.pause();
      b.textContent = T(pic.controls.paused ? "card.play" : "card.pause");
      b.setAttribute("aria-pressed", String(pic.controls.paused));
    });
    return b;
  }
  // The follow-along "Next" button: next, finish or close. Arrows point the reading way.
  function setNext(kind) {
    const rtl = document.documentElement.dir === "rtl";
    const b = $("#fa-next");
    b.textContent = "";
    if (kind === "close") b.textContent = T("fa.close");
    else if (kind === "finish") b.append(T("fa.finish") + " \u2713");
    else b.append(T("fa.next") + " " + (rtl ? "\u2190" : "\u2192"));
  }

  // Steps the physio wrote themselves for this patient. They can't be translated, so in another
  // language they show as typed (English), with a short line saying so.
  function stepsList(item, ex) {
    const ol = el("ol", { class: "p-steps p-steps-own" }, H.stepsOf(item, ex).map((s) => el("li", { text: s, dir: "auto" })));
    if (I.lang === "en") return ol;
    ol.lang = "en";
    return [I.put(el("p", { class: "p-steps-note hint" }), "card.stepsEnglish", null, { noEnglish: true }), ol];
  }

  function card(item, i) {
    const ex = H.byId(item.id);
    if (!ex) return null;
    const pic = H.picture(ex, "anim", { offset: i * 0.4 });
    let pauseBtn = null;
    if (pic.controls) {
      pauseBtn = pauseButton(pic);
    }
    const dose = I.describe(item);
    // Each line as [shown, English]. The physio's own typed words have no English twin: they show as typed.
    const harder = [...(item.prog || []).filter((x) => (ex.progressions || [])[x]).map((x) => [I.exOption(ex, "progressions", x), ex.progressions[x]]), item.progText ? [item.progText] : null].filter(Boolean);
    const easier = [...(item.reg || []).filter((x) => (ex.regressions || [])[x]).map((x) => [I.exOption(ex, "regressions", x), ex.regressions[x]]), item.regText ? [item.regText] : null].filter(Boolean);
    const ownSteps = H.stepsEdited(item);
    const steps = ownSteps ? H.stepsOf(item, ex) : I.exSteps(ex);
    const kit = H.equipment(ex);

    const readBtn = canSpeak ? el("button", { type: "button", class: "btn btn-secondary p-read no-print", "aria-pressed": "false" }, readLabel()) : null;
    const li = el("li", { class: "p-card" },
      el("div", { class: "p-card-head" }, I.putPair(el("h2"), I.exName(ex), ex.name), readBtn),
      ex.custom ? I.put(el("p", { class: "p-own" }), "card.own") : null,
      el("div", { class: "p-media" }, H.mediaSwitch(ex, pic, { extra: pauseBtn })),
      ex.custom ? I.put(el("p", { class: "p-own-pic hint" }), ex.like ? "card.ownLike" : "card.ownShow") : null,
      el("div", { class: "p-steps-pics" }, H.picture(ex, "steps").el),
      dose ? I.putPair(el("p", { class: "p-dose" }), dose, H.describe(item)) : null,
      kit.length ? el("p", { class: "p-kit" }, el("strong", { text: T("card.need") + " " }), kit.map(I.kit).join(", ")) : null,
      ownSteps ? stepsList(item, ex) : el("ol", { class: "p-steps" }, steps.map((s, n) => I.putPair(el("li"), s, ex.instructions[n]))),
      item.notes ? el("p", { class: "p-notes", text: item.notes, dir: "auto" }) : null,
      harder.length || easier.length ? el("div", { class: "p-options" },
        harder.length ? [I.put(el("h3"), "card.harder"), el("ul", {}, harder.map((t) => I.putPair(el("li", { dir: t[1] ? null : "auto" }), t[0], t[1])))] : null,
        easier.length ? [I.put(el("h3"), "card.easier"), el("ul", {}, easier.map((t) => I.putPair(el("li", { dir: t[1] ? null : "auto" }), t[0], t[1])))] : null
      ) : null
    );
    if (readBtn) readBtn.addEventListener("click", () => readCard(readBtn, li));
    li.dataset.stage = String(item.stage || 1);
    return li;
  }

  // ---------- Weekly tick chart (only if the physio switched it on) ----------
  // Ticks are kept in this phone's own browser storage. They are never sent anywhere.
  const DAYS = [0, 1, 2, 3, 4, 5, 6]; // Monday first; names come from the phone in the chosen language
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  function mondayOf(d) {
    const m = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    m.setDate(m.getDate() - ((m.getDay() + 6) % 7));
    return m;
  }
  function shortHash(str) {
    let h = 5381;
    for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    return h.toString(36);
  }

  function setupTicks(code) {
    const key = "exercise-ticks:" + shortHash(code);
    let done = new Set();
    try { done = new Set(JSON.parse(localStorage.getItem(key) || "[]")); } catch (e) { /* storage unavailable */ }
    const save = () => { try { localStorage.setItem(key, JSON.stringify([...done])); } catch (e) { /* storage unavailable */ } };
    const today = new Date();
    const thisMonday = mondayOf(today);
    let weekStart = new Date(thisMonday);

    function render() {
      const box = $("#week-days");
      box.innerHTML = "";
      let count = 0;
      DAYS.forEach((i) => {
        const d = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
        const name = I.weekdayShort(d);
        const id = iso(d), isToday = id === iso(today), future = d > today && !isToday, on = done.has(id);
        if (on) count++;
        box.append(el("button", {
          type: "button", class: "p-day" + (isToday ? " today" : "") + (on ? " done" : ""),
          "aria-pressed": String(on), disabled: future ? "" : null, "data-today": isToday ? T("ticks.today") : null,
          "aria-label": I.formatDate(iso(d), { weekday: "long", day: "numeric", month: "long" }) + (isToday ? ", " + T("ticks.today") : "") + (on ? ", " + T("ticks.done") : ""),
          onclick: () => { if (done.has(id)) done.delete(id); else done.add(id); save(); render(); }
        }, el("span", { class: "p-day-name", text: name }), el("span", { class: "p-day-date", text: String(d.getDate()) }), el("span", { class: "p-day-tick", "aria-hidden": "true", text: on ? "✓" : "" })));
      });
      const sameWeek = weekStart.getTime() === thisMonday.getTime();
      $("#week-label").textContent = sameWeek ? T("ticks.thisWeek") : T("ticks.weekOf", { d: I.formatDate(iso(weekStart), { day: "numeric", month: "short" }) });
      $("#week-next").disabled = sameWeek;
      // Days in a row, counting back from today (or from yesterday if today isn't ticked yet)
      let run = 0;
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      if (!done.has(iso(d))) d.setDate(d.getDate() - 1);
      while (done.has(iso(d)) && run < 400) { run++; d.setDate(d.getDate() - 1); }
      const streak = run >= 2 ? " " + T("ticks.streak", { n: run }) : "";
      $("#week-count").textContent = (count ? T(count >= 5 ? "ticks.great" : "ticks.count", { n: count }) : T("ticks.none")) + (sameWeek ? streak : "");
    }
    $("#week-prev").addEventListener("click", () => { weekStart.setDate(weekStart.getDate() - 7); render(); });
    $("#week-next").addEventListener("click", () => { if (weekStart < thisMonday) { weekStart.setDate(weekStart.getDate() + 7); render(); } });
    $("#ticks").hidden = false;
    render();
    return {
      isTodayDone: () => done.has(iso(new Date())),
      tickToday: () => { done.add(iso(new Date())); save(); render(); }
    };
  }
  let ticks = null;

  // ---------- Daily calendar reminder ----------
  // Builds a calendar file on the phone and hands it straight to the calendar app.
  // Nothing is sent anywhere.
  let minutes = 0;
  function icsText(str) { return String(str).replace(/\\/g, "\\\\").replace(/([;,])/g, "\\$1").replace(/\n/g, "\\n"); }
  function fold(line) {
    const out = [];
    while (line.length > 74) { out.push(line.slice(0, 74)); line = " " + line.slice(74); }
    out.push(line);
    return out.join("\r\n");
  }
  function stamp(d, utc) {
    const p = (n) => String(n).padStart(2, "0");
    return utc
      ? d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) + "T" + p(d.getUTCHours()) + p(d.getUTCMinutes()) + p(d.getUTCSeconds()) + "Z"
      : d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "T" + p(d.getHours()) + p(d.getMinutes()) + "00";
  }
  // Repeats for about 6 weeks
  function ruleFor(days) {
    if (days === "weekdays") return "RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;COUNT=30";
    if (days === "mwf") return "RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR;COUNT=18";
    return "RRULE:FREQ=DAILY;COUNT=42";
  }
  function addReminder() {
    const [h, m] = ($("#reminder-time").value || "09:00").split(":").map(Number);
    const first = new Date();
    first.setHours(h || 0, m || 0, 0, 0);
    if (first < new Date()) first.setDate(first.getDate() + 1);
    const lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//RepSheet//EN", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      "UID:" + Date.now().toString(36) + Math.random().toString(36).slice(2) + "@exercise-handout",
      "DTSTAMP:" + stamp(new Date(), true),
      "DTSTART:" + stamp(first, false),
      "DURATION:PT" + (minutes || 15) + "M",
      ruleFor($("#reminder-days") ? $("#reminder-days").value : "daily"),
      "SUMMARY:" + icsText(T("rem.summary")),
      "DESCRIPTION:" + icsText(T("rem.open") + " " + location.href),
      "URL:" + location.href,
      "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:PT0M", "DESCRIPTION:" + icsText(T("rem.alarm")), "END:VALARM",
      "END:VEVENT", "END:VCALENDAR"
    ];
    const blob = new Blob([lines.map(fold).join("\r\n") + "\r\n"], { type: "text/calendar" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "exercise-reminder.ics";
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  $("#btn-reminder").addEventListener("click", addReminder);


  // ---------- Follow-along: one exercise at a time ----------
  // A rep counter, a hold timer and a short rest between rounds.
  // Everything lives in this page only. Nothing is saved or sent anywhere
  // (the one exception is the patient choosing to tick today on their own chart, which stays on this phone).
  let programme = [];
  const REST_SECONDS = 30;
  const fa = { open: false, i: 0, states: [], timer: null, wake: null, sound: true, audio: null, pic: null };
  const num = (v, max) => Math.max(0, Math.min(max, Math.floor(Number(v) || 0)));

  function plan(item) {
    const reps = num(item.reps, 200), hold = num(item.hold, 900);
    return { sets: Math.max(1, num(item.sets, 30)), reps: Math.max(1, reps), hold, countsReps: reps > 1 };
  }
  function stateFor(i) {
    if (!fa.states[i]) fa.states[i] = { round: 1, rep: 0, phase: "ready", ends: 0, length: 0 };
    return fa.states[i];
  }

  // A short gentle beep and a buzz (where the phone allows) when a hold or rest ends
  function beep() {
    if (navigator.vibrate) { try { navigator.vibrate(180); } catch (e) { /* not allowed */ } }
    if (!fa.sound || !fa.audio) return;
    try {
      const ctx = fa.audio, o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime;
      o.type = "sine"; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + 0.4);
    } catch (e) { /* no sound on this phone */ }
  }
  function say(text) { $("#fa-live").textContent = ""; setTimeout(() => { $("#fa-live").textContent = text; }, 30); }

  // Keep the screen on while following along, where the phone supports it
  async function keepAwake() {
    if (!fa.open || fa.wake || !("wakeLock" in navigator)) return;
    try { fa.wake = await navigator.wakeLock.request("screen"); fa.wake.addEventListener("release", () => { fa.wake = null; }); } catch (e) { /* not allowed */ }
  }
  function letSleep() { if (fa.wake) { fa.wake.release().catch(() => {}); fa.wake = null; } }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") keepAwake(); });

  function stopTimer() { if (fa.timer) { clearInterval(fa.timer); fa.timer = null; } }

  function startTimer(st, phase, seconds) {
    stopTimer();
    st.phase = phase; st.length = seconds; st.ends = Date.now() + seconds * 1000;
    fa.timer = setInterval(() => {
      if (Date.now() >= st.ends) { stopTimer(); timerDone(st); } else drawCounter();
    }, 200);
    drawCounter();
  }

  function finishRep(st) {
    const p = plan(programme[fa.i]);
    st.rep++;
    if (st.rep < p.reps) { st.phase = "ready"; if (p.countsReps) say(T("fa.sayDone", { n: st.rep, t: p.reps })); return drawCounter(); }
    if (st.round < p.sets) {
      say(T("fa.sayRoundDone", { n: st.round, s: REST_SECONDS }));
      return startTimer(st, "rest", REST_SECONDS);
    }
    st.phase = "done";
    say(T("fa.sayExDone"));
    drawCounter();
  }

  function timerDone(st) {
    beep();
    if (st.phase === "hold") { finishRep(st); return; }
    if (st.phase === "rest") { st.round++; st.rep = 0; st.phase = "ready"; say(T("fa.sayRound", { n: st.round })); drawCounter(); }
  }

  function mainAction() {
    const st = stateFor(fa.i), p = plan(programme[fa.i]);
    if (st.phase === "ready") { if (p.hold) { say(T("fa.hold")); startTimer(st, "hold", p.hold); } else finishRep(st); }
    else if (st.phase === "hold") { stopTimer(); st.phase = "ready"; say(T("fa.sayHoldStopped")); drawCounter(); }
    else if (st.phase === "rest") { stopTimer(); st.round++; st.rep = 0; st.phase = "ready"; say(T("fa.sayRoundShort", { n: st.round })); drawCounter(); }
    else if (st.phase === "done") go(1);
  }
  function undo() {
    const st = stateFor(fa.i), p = plan(programme[fa.i]);
    stopTimer();
    if (st.phase === "done" || st.phase === "rest") { st.phase = "ready"; st.rep = p.reps - 1; }
    else if (st.rep > 0) st.rep--;
    else if (st.round > 1) { st.round--; st.rep = p.reps - 1; }
    st.phase = "ready";
    say(T("fa.sayTakenOff"));
    drawCounter();
  }
  function restartExercise() { stopTimer(); fa.states[fa.i] = null; say(T("fa.sayAgain")); drawCounter(); }

  function drawCounter() {
    const box = $("#fa-count");
    if (!box) return;
    const st = stateFor(fa.i), p = plan(programme[fa.i]);
    const last = fa.i === programme.length - 1;
    const left = Math.max(0, Math.ceil((st.ends - Date.now()) / 1000));
    let label = "", big = "", sub = "", btn = "", frac = 0;
    const roundText = p.sets > 1 ? T("fa.round", { n: st.round, t: p.sets }) : "";
    const fwd = I.langInfo(I.lang) && I.langInfo(I.lang).dir === "rtl" ? " \u2190" : " \u2192";

    if (st.phase === "hold") {
      label = T("fa.hold"); big = String(left); sub = T("fa.seconds", { n: left });
      frac = 1 - (st.ends - Date.now()) / (st.length * 1000); btn = T("fa.stopHold");
    } else if (st.phase === "rest") {
      label = T("fa.rest"); big = String(left); sub = T("fa.nextRound", { n: st.round + 1, t: p.sets });
      frac = 1 - (st.ends - Date.now()) / (st.length * 1000); btn = T("fa.skipRest");
    } else if (st.phase === "done") {
      label = T("fa.finished"); big = "\u2713"; sub = T("fa.wellDone"); frac = 1;
      btn = last ? T("fa.finish") : T("fa.nextEx") + fwd;
    } else if (p.countsReps) {
      label = roundText || T("fa.count"); big = String(st.rep); sub = T("fa.ofDone", { n: p.reps });
      frac = st.rep / p.reps;
      btn = p.hold ? T("fa.startHold", { n: p.hold }) : T("fa.didOne");
    } else {
      label = roundText || T("fa.ready"); big = p.hold ? String(p.hold) : ""; sub = p.hold ? T("fa.secondHold") : "";
      btn = p.hold ? T("fa.startHold", { n: p.hold }) : (p.sets > 1 ? T("fa.didRound") : T("fa.didIt"));
    }
    if (st.phase === "hold" || st.phase === "rest") label = (roundText ? roundText + " · " : "") + label;

    box.className = "fa-count fa-" + st.phase + (!p.countsReps && !p.hold && st.phase === "ready" ? " fa-simple" : "");
    box.querySelector(".fa-label").textContent = label;
    box.querySelector(".fa-big").textContent = big;
    box.querySelector(".fa-sub").textContent = sub;
    box.querySelector(".fa-meter span").style.width = Math.round(Math.max(0, Math.min(1, frac)) * 100) + "%";
    const main = box.querySelector(".fa-main");
    main.textContent = btn;
    main.classList.toggle("btn-primary", st.phase !== "hold");
    main.classList.toggle("btn-secondary", st.phase === "hold");
    box.querySelector(".fa-undo").disabled = st.round === 1 && st.rep === 0 && st.phase !== "done";
    $("#fa-next").classList.toggle("fa-ready", st.phase === "done");
  }

  function drawStep() {
    stopTimer();
    stopReading();
    const item = programme[fa.i], ex = H.byId(item.id), p = plan(item), n = programme.length;
    $("#fa-pos").textContent = T("fa.pos", { n: fa.i + 1, t: n });
    $("#fa-bar-fill").style.width = Math.round(((fa.i + 1) / n) * 100) + "%";
    $("#fa-back").disabled = fa.i === 0;
    setNext(fa.i === n - 1 ? "finish" : "next");

    const pic = H.picture(ex, "anim");
    let pauseBtn = null;
    if (pic.controls) pauseBtn = pauseButton(pic);
    const dose = I.describe(item);
    const readBtn = canSpeak ? el("button", { type: "button", class: "btn btn-secondary p-read", "aria-pressed": "false" }, readLabel()) : null;
    const count = el("div", { class: "fa-count", id: "fa-count" },
      el("p", { class: "fa-label" }),
      el("p", { class: "fa-num", "aria-hidden": "true" }, el("span", { class: "fa-big" }), el("span", { class: "fa-sub" })),
      el("div", { class: "fa-meter", "aria-hidden": "true" }, el("span")),
      el("button", { type: "button", class: "btn btn-primary fa-main", onclick: mainAction }),
      el("div", { class: "fa-small" },
        el("button", { type: "button", class: "btn-ghost fa-undo", onclick: undo }, T("fa.takeOff")),
        el("button", { type: "button", class: "btn-ghost", onclick: restartExercise }, T("fa.again")))
    );
    const body = $("#fa-body");
    body.innerHTML = "";
    const card = el("div", { class: "fa-card" },
      el("div", { class: "p-card-head" }, I.putPair(el("h2", { id: "fa-title", tabindex: "-1" }), I.exName(ex), ex.name), readBtn),
      ex.custom ? I.put(el("p", { class: "p-own" }), "card.own") : null,
      el("div", { class: "fa-media p-media" }, H.mediaSwitch(ex, pic, { extra: pauseBtn })),
      ex.custom ? I.put(el("p", { class: "p-own-pic hint" }), ex.like ? "card.ownLike" : "card.ownShow") : null,
      dose ? I.putPair(el("p", { class: "p-dose" }), dose, H.describe(item)) : null,
      count,
      item.notes ? el("p", { class: "p-notes", text: item.notes, dir: "auto" }) : null,
      el("details", { class: "fa-how", open: "" }, el("summary", { text: T("fa.howTo") }),
        H.stepsEdited(item) ? stepsList(item, ex) : el("ol", { class: "p-steps" }, I.exSteps(ex).map((t, k) => I.putPair(el("li"), t, ex.instructions[k]))))
    );
    if (readBtn) readBtn.addEventListener("click", () => readCard(readBtn, card));
    body.append(card);
    syncReadButtons();
    drawCounter();
    window.scrollTo(0, 0);
    $("#fa-title").focus({ preventScroll: true });
  }

  function drawFinished() {
    stopTimer();
    stopReading();
    $("#fa-pos").textContent = T("fa.allDone");
    $("#fa-bar-fill").style.width = "100%";
    $("#fa-back").disabled = false;
    setNext("close");
    $("#fa-next").classList.remove("fa-ready");
    const tickBtn = ticks ? el("button", { type: "button", class: "btn btn-primary fa-tick" }) : null;
    const syncTick = () => {
      const on = ticks.isTodayDone();
      tickBtn.textContent = on ? "\u2713 " + T("fa.ticked") : T("fa.tickToday");
      tickBtn.disabled = on;
    };
    if (tickBtn) { tickBtn.addEventListener("click", () => { ticks.tickToday(); syncTick(); say(T("fa.tickedSay")); }); syncTick(); }
    const body = $("#fa-body");
    body.innerHTML = "";
    body.append(el("div", { class: "fa-card fa-finished" },
      el("p", { class: "fa-finished-mark", "aria-hidden": "true", text: "✓" }),
      I.put(el("h2", { id: "fa-title", tabindex: "-1" }), "fa.wellDone"),
      I.put(el("p"), "fa.finishedText"),
      tickBtn,
      tickBtn ? I.put(el("p", { class: "hint" }), "fa.tickSaved") : null,
      I.put(el("p", { class: "fa-finished-safety" }), "fa.finishedSafety")
    ));
    window.scrollTo(0, 0);
    $("#fa-title").focus({ preventScroll: true });
  }

  function go(step) {
    if (fa.i >= programme.length) { if (step < 0) { fa.i = programme.length - 1; drawStep(); } else closeFollow(); return; }
    const next = fa.i + step;
    if (next < 0) return;
    fa.i = next;
    if (fa.i >= programme.length) drawFinished(); else drawStep();
  }

  function openFollow() {
    if (!programme.length) return;
    // Sound has to be switched on by a tap on iPhones, so set it up now
    if (!fa.audio) { const AC = window.AudioContext || window.webkitAudioContext; if (AC) { try { fa.audio = new AC(); } catch (e) { /* no sound */ } } }
    if (fa.audio && fa.audio.state === "suspended") fa.audio.resume().catch(() => {});
    fa.open = true;
    fa.i = 0;
    fa.states = [];
    fa.scrollY = window.scrollY;
    document.body.classList.add("fa-open");
    $("#follow").hidden = false;
    syncLarge();
    try { history.pushState({ follow: true }, ""); } catch (e) { /* fine without */ }
    keepAwake();
    drawStep();
  }
  function closeFollow(fromHistory) {
    if (!fa.open) return;
    if (!fromHistory && history.state && history.state.follow) { history.back(); return; } // popstate closes it
    fa.open = false;
    stopTimer();
    stopReading();
    letSleep();
    $("#fa-body").innerHTML = ""; // stops the moving picture and any video
    $("#follow").hidden = true;
    document.body.classList.remove("fa-open");
    window.scrollTo(0, fa.scrollY || 0);
    $("#btn-follow").focus({ preventScroll: true });
  }
  window.addEventListener("popstate", () => { if (fa.open) closeFollow(true); });

  $("#btn-follow").addEventListener("click", openFollow);
  $("#fa-close").addEventListener("click", () => closeFollow());
  $("#fa-back").addEventListener("click", () => go(-1));
  $("#fa-next").addEventListener("click", () => go(1));
  $("#fa-sound").addEventListener("click", (e) => {
    fa.sound = !fa.sound;
    e.currentTarget.textContent = T(fa.sound ? "fa.soundOn" : "fa.soundOff");
    e.currentTarget.setAttribute("aria-pressed", String(fa.sound));
  });
  document.addEventListener("keydown", (e) => { if (fa.open && e.key === "Escape") closeFollow(); });

  async function start() {
    const code = decodeURIComponent(location.hash.slice(1));
    try {
      if (!code) throw new Error("No programme in link");
      const data = await H.decode(code);
      await setupLanguage(data, code);
      H.registerCustom((data.cx || []).map(H.unpackCustom).filter(Boolean));
      const items = (data.x || []).map(H.unpackItem).filter((it) => H.byId(it.id));
      minutes = items.length ? H.estimateMinutes(items) : 0;
      // Each part kept apart, so English names and phone numbers read the right way round in Arabic or Urdu
      const iso1 = (v) => (v && I.lang !== "en" ? "\u2068" + v + "\u2069" : v);
      const meta = [I.formatDate(data.d), iso1(data.c), iso1(data.t)].filter(Boolean).join(" · ");
      $("#meta").textContent = meta + (minutes ? (meta ? " · " : "") + T("intro.minutes", { n: minutes }) : "");
      // The physio's own short message, shown as typed (never translated)
      if (data.pm) { $("#physio-message-text").textContent = String(data.pm).slice(0, 300); $("#physio-message-text").dir = "auto"; $("#physio-message").hidden = false; }
      if (data.go) { $("#goal-text").textContent = data.go; $("#goal-box").hidden = false; }
      if (data.pl) { $("#plan-text").textContent = data.pl; $("#plan-box").hidden = false; }
      if (data.du) { $("#du-text").textContent = data.du; $("#du-box").hidden = false; }
      $("#goal-plan").hidden = !(data.go || data.pl || data.du);
      $("#pain-wrap").hidden = true; // pain guide removed (16 Nov 2026), even for older links
      if (data.pg) {
        const g = H.painGuide(data.pg);
        $(".pg-green-text").textContent = g.green;
        $(".pg-amber-text").textContent = g.amber;
      }
      if (data.lp) { document.body.classList.add("large-print"); syncLarge(); }
      if (data.er) document.body.classList.add("easy-read");
      if (data.g) { $("#general").textContent = data.g; $("#general").hidden = false; }
      if (data.tc) ticks = setupTicks(code);
      const list = $("#list");
      (data.x || []).map(H.unpackItem).forEach((it, i) => { const c = card(it, i); if (c) list.append(c); });
      if (!list.children.length) throw new Error("Empty programme");
      syncReadButtons();
      programme = items;
      $("#fa-start-wrap").hidden = false;
      setupStages(H.unpackStages(data.st), items, code);
    } catch (e) {
      $("#intro").hidden = true;
      $("#reminder").hidden = true; // no programme, so no daily reminder to offer
      $("#error").hidden = false;
      I.apply();
    }
  }

  // ---------- Language ----------
  // The physio picks it (lg in the link). The patient can change it; their choice is kept on this phone
  // for this programme only. Changing it reloads the page in the new language.
  async function setupLanguage(data, code) {
    const key = "repsheet-lang:" + shortHash(code);
    let saved = null;
    try { saved = JSON.parse(localStorage.getItem(key) || "null"); } catch (e) { /* storage unavailable */ }
    const want = saved && I.langInfo(saved.lg) ? saved.lg : (I.langInfo(data.lg) ? data.lg : "en");
    const english = saved ? !!saved.le : !!data.le;
    await I.use(want, english);
    I.setPage();
    I.apply();
    if (window.RepTheme) window.RepTheme.label();
    document.title = T("page.title") + " \u00B7 RepSheet";
    // Days in the printed tick chart
    const head = document.querySelectorAll("#ticks-print-table thead th");
    head.forEach((th, i) => { if (i) th.textContent = I.weekdayShort(new Date(2024, 0, i)); }); // 1 Jan 2024 was a Monday
    document.querySelectorAll("#ticks-print-table tbody th").forEach((th, i) => { th.textContent = T("ticks.week", { n: i + 1 }); });

    // The picker: each language in its own words, with the English name for the physio
    const pickEl = $("#lang-pick"), enBox = $("#lang-en");
    pickEl.innerHTML = "";
    I.LANGS.forEach((l) => pickEl.append(el("option", { value: l.code, lang: l.code, text: l.code === "en" ? "English" : l.own + " (" + l.name + ")" })));
    pickEl.value = I.lang;
    enBox.checked = I.showEnglish;
    $("#lang-en-wrap").hidden = I.lang === "en";
    $("#lang-bar").hidden = false;
    const remember = (lg, le) => { try { localStorage.setItem(key, JSON.stringify({ lg, le })); } catch (e) { /* storage unavailable */ } };
    pickEl.addEventListener("change", () => { remember(pickEl.value, pickEl.value === "en" ? false : (I.lang === "en" ? true : enBox.checked)); location.reload(); });
    enBox.addEventListener("change", () => { remember(I.lang, enBox.checked); location.reload(); });

    // Draft notice, in the patient's language and in English
    const box = $("#lang-draft");
    if (I.isDraft()) {
      box.innerHTML = "";
      box.append(el("p", { text: T("lang.draft") }), el("p", { class: "lang-draft-en", lang: "en", dir: "ltr", text: I.en("lang.draft") }));
      box.hidden = false;
    }
    syncLarge();
    setMotion();
    $("#fa-sound").textContent = T(fa.sound ? "fa.soundOn" : "fa.soundOff");
  }

  // ---------- Stages: one stage at a time, the patient moves on when ready ----------
  // Which stage they're on is remembered on this phone only.
  function setupStages(stages, items, code) {
    if (!stages.length) return;
    const key = "repsheet-stage:" + shortHash(code);
    let cur = 1;
    try { cur = Math.min(stages.length, Math.max(1, parseInt(localStorage.getItem(key), 10) || 1)); } catch (e) { /* storage unavailable */ }
    const nav = el("nav", { class: "p-stages no-print", "aria-label": T("stage.nav") });
    const intro = el("p", { class: "p-stage-now" });
    const next = el("div", { class: "p-stage-next no-print" });
    const list = $("#list");
    list.before(nav, intro);
    list.after(next);
    function show(n, focus) {
      cur = n;
      try { localStorage.setItem(key, String(n)); } catch (e) { /* storage unavailable */ }
      nav.innerHTML = "";
      stages.forEach((st, i) => nav.append(el("button", {
        type: "button", class: "p-stage-tab" + (i + 1 < cur ? " done" : ""), "aria-current": i + 1 === cur ? "step" : null,
        onclick: () => show(i + 1, true)
      }, (i + 1 < cur ? "\u2713 " : "") + st.name, st.when ? el("small", { text: st.when }) : null)));
      const st = stages[cur - 1];
      intro.textContent = T(st.when ? "stage.onWhen" : "stage.on", { name: st.name, when: st.when });
      [...list.children].forEach((li) => { li.hidden = li.dataset.stage !== String(cur); });
      programme = items.filter((it) => (it.stage || 1) === cur);
      minutes = programme.length ? H.estimateMinutes(programme) : minutes;
      next.innerHTML = "";
      if (cur < stages.length) {
        const nx = stages[cur];
        next.append(el("h2", { text: T("stage.ready", { name: nx.name }) }),
          st.move ? el("p", {}, el("strong", { text: T("stage.moveWhen") + " " }), el("span", { dir: "auto", text: st.move })) : I.put(el("p"), "stage.moveDefault"),
          I.put(el("p", { class: "hint" }), "stage.notSure"),
          el("button", { type: "button", class: "btn btn-primary", onclick: () => { show(cur + 1, true); window.scrollTo({ top: 0, behavior: "smooth" }); } }, T("stage.go", { name: nx.name })));
      } else if (stages.length > 1) {
        next.append(I.put(el("h2"), "stage.last"), I.put(el("p"), "stage.lastText"));
      }
      if (focus) { const t = nav.querySelector('[aria-current="step"]'); if (t) t.focus(); }
    }
    show(cur, false);
  }

  let paused = window.PhysioFigures && window.PhysioFigures.reduceMotion;
  const motionBtn = $("#btn-motion");
  const setMotion = () => {
    motionBtn.textContent = T(paused ? "hdr.play" : "hdr.pause");
    motionBtn.setAttribute("aria-pressed", String(paused));
    window.PhysioFigures && window.PhysioFigures.setAllPaused(paused);
  };
  motionBtn.addEventListener("click", () => { paused = !paused; setMotion(); });
  $("#btn-print").addEventListener("click", () => window.print());
  const largeBtn = $("#btn-large");
  const faLargeBtn = $("#fa-large");
  function syncLarge() {
    const on = document.body.classList.contains("large-print");
    [largeBtn, faLargeBtn].forEach((b) => { b.textContent = T(on ? "hdr.normal" : "hdr.large"); b.setAttribute("aria-pressed", String(on)); });
  }
  [largeBtn, faLargeBtn].forEach((b) => b.addEventListener("click", () => { document.body.classList.toggle("large-print"); syncLarge(); }));
  window.addEventListener("pagehide", stopReading);
  setMotion();
  start();
})();
