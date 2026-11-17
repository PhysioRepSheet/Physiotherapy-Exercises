/*
  Patient page. Reads the programme from the part of the link after "#".
  That part of a link is never sent to the web server, so nothing about the patient leaves their phone.
*/
(function () {
  "use strict";
  const H = window.Handout;
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
  // Uses the phone's own built-in voice. Nothing is recorded or sent anywhere.
  const canSpeak = "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function";
  let speaking = null; // the button whose card is being read
  function pickVoice() {
    const voices = speechSynthesis.getVoices();
    return voices.find((v) => v.lang === "en-GB") || voices.find((v) => /^en/i.test(v.lang)) || null;
  }
  function stopReading() {
    if (!canSpeak) return;
    speechSynthesis.cancel();
    document.querySelectorAll(".reading").forEach((n) => n.classList.remove("reading"));
    if (speaking) { speaking.textContent = "🔊 Read aloud"; speaking.setAttribute("aria-pressed", "false"); speaking = null; }
  }
  function readCard(btn, cardEl) {
    if (speaking === btn) { stopReading(); return; }
    stopReading();
    const parts = [...cardEl.querySelectorAll("h2, .p-dose, .p-steps li, .p-notes, .p-options h3, .p-options li")];
    if (!parts.length) return;
    speaking = btn;
    btn.textContent = "■ Stop reading";
    btn.setAttribute("aria-pressed", "true");
    const voice = pickVoice();
    parts.forEach((part, n) => {
      const u = new SpeechSynthesisUtterance(part.textContent.replace(/·/g, ","));
      u.lang = "en-GB";
      if (voice) u.voice = voice;
      u.rate = 0.9;
      u.onstart = () => { document.querySelectorAll(".reading").forEach((x) => x.classList.remove("reading")); part.classList.add("reading"); };
      if (n === parts.length - 1) { u.onend = () => { if (speaking === btn) stopReading(); }; u.onerror = u.onend; }
      speechSynthesis.speak(u);
    });
  }

  function card(item, i) {
    const ex = H.byId(item.id);
    if (!ex) return null;
    const pic = H.picture(ex, "anim", { offset: i * 0.4 });
    let pauseBtn = null;
    if (pic.controls) {
      pauseBtn = el("button", { type: "button", class: "p-pause", "aria-pressed": String(pic.controls.paused) }, pic.controls.paused ? "Play" : "Pause");
      pauseBtn.addEventListener("click", () => {
        if (pic.controls.paused) pic.controls.play(); else pic.controls.pause();
        pauseBtn.textContent = pic.controls.paused ? "Play" : "Pause";
        pauseBtn.setAttribute("aria-pressed", String(pic.controls.paused));
      });
    }
    const dose = H.describe(item);
    const harder = [...(item.prog || []).map((x) => (ex.progressions || [])[x]), item.progText].filter(Boolean);
    const easier = [...(item.reg || []).map((x) => (ex.regressions || [])[x]), item.regText].filter(Boolean);

    const readBtn = canSpeak ? el("button", { type: "button", class: "btn btn-secondary p-read no-print", "aria-pressed": "false" }, "🔊 Read aloud") : null;
    const li = el("li", { class: "p-card" },
      el("div", { class: "p-card-head" }, el("h2", { text: ex.name }), readBtn),
      ex.custom ? el("p", { class: "p-own", text: "Written by your physio" }) : null,
      el("div", { class: "p-media" }, H.mediaSwitch(ex, pic, { extra: pauseBtn })),
      ex.custom ? el("p", { class: "p-own-pic hint", text: ex.like ? "The picture shows a similar exercise. Follow your physio's steps below." : "Your physio will show you how to do this one." }) : null,
      el("div", { class: "p-steps-pics" }, H.picture(ex, "steps").el),
      dose ? el("p", { class: "p-dose", text: dose }) : null,
      el("ol", { class: "p-steps" }, ex.instructions.map((s) => el("li", { text: s }))),
      item.notes ? el("p", { class: "p-notes", text: item.notes }) : null,
      harder.length || easier.length ? el("div", { class: "p-options" },
        harder.length ? [el("h3", { text: "To make it harder" }), el("ul", {}, harder.map((t) => el("li", { text: t })))] : null,
        easier.length ? [el("h3", { text: "To make it easier" }), el("ul", {}, easier.map((t) => el("li", { text: t })))] : null
      ) : null
    );
    if (readBtn) readBtn.addEventListener("click", () => readCard(readBtn, li));
    return li;
  }

  // ---------- Weekly tick chart (only if the physio switched it on) ----------
  // Ticks are kept in this phone's own browser storage. They are never sent anywhere.
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
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
      DAYS.forEach((name, i) => {
        const d = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
        const id = iso(d), isToday = id === iso(today), future = d > today && !isToday, on = done.has(id);
        if (on) count++;
        box.append(el("button", {
          type: "button", class: "p-day" + (isToday ? " today" : "") + (on ? " done" : ""),
          "aria-pressed": String(on), disabled: future ? "" : null,
          "aria-label": d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" }) + (isToday ? ", today" : "") + (on ? ", done" : ""),
          onclick: () => { if (done.has(id)) done.delete(id); else done.add(id); save(); render(); }
        }, el("span", { class: "p-day-name", text: name }), el("span", { class: "p-day-date", text: String(d.getDate()) }), el("span", { class: "p-day-tick", "aria-hidden": "true", text: on ? "✓" : "" })));
      });
      const sameWeek = weekStart.getTime() === thisMonday.getTime();
      $("#week-label").textContent = sameWeek ? "This week" : "Week of " + weekStart.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      $("#week-next").disabled = sameWeek;
      $("#week-count").textContent = count ? count + " of 7 days done" + (count >= 5 ? ". Great work!" : "") : "No days ticked yet this week.";
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
      "RRULE:FREQ=DAILY;COUNT=42",
      "SUMMARY:" + icsText("Do my exercises"),
      "DESCRIPTION:" + icsText("Open your exercises: " + location.href),
      "URL:" + location.href,
      "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:PT0M", "DESCRIPTION:" + icsText("Time for your exercises"), "END:VALARM",
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
    if (st.rep < p.reps) { st.phase = "ready"; if (p.countsReps) say(st.rep + " of " + p.reps + " done"); return drawCounter(); }
    if (st.round < p.sets) {
      say("Round " + st.round + " done. Rest for " + REST_SECONDS + " seconds.");
      return startTimer(st, "rest", REST_SECONDS);
    }
    st.phase = "done";
    say("Well done. That exercise is finished.");
    drawCounter();
  }

  function timerDone(st) {
    beep();
    if (st.phase === "hold") { finishRep(st); return; }
    if (st.phase === "rest") { st.round++; st.rep = 0; st.phase = "ready"; say("Round " + st.round + ". Off you go."); drawCounter(); }
  }

  function mainAction() {
    const st = stateFor(fa.i), p = plan(programme[fa.i]);
    if (st.phase === "ready") { if (p.hold) { say("Hold"); startTimer(st, "hold", p.hold); } else finishRep(st); }
    else if (st.phase === "hold") { stopTimer(); st.phase = "ready"; say("Hold stopped. Not counted."); drawCounter(); }
    else if (st.phase === "rest") { stopTimer(); st.round++; st.rep = 0; st.phase = "ready"; say("Round " + st.round + "."); drawCounter(); }
    else if (st.phase === "done") go(1);
  }
  function undo() {
    const st = stateFor(fa.i), p = plan(programme[fa.i]);
    stopTimer();
    if (st.phase === "done" || st.phase === "rest") { st.phase = "ready"; st.rep = p.reps - 1; }
    else if (st.rep > 0) st.rep--;
    else if (st.round > 1) { st.round--; st.rep = p.reps - 1; }
    st.phase = "ready";
    say("Taken one off.");
    drawCounter();
  }
  function restartExercise() { stopTimer(); fa.states[fa.i] = null; say("Starting this exercise again."); drawCounter(); }

  function drawCounter() {
    const box = $("#fa-count");
    if (!box) return;
    const st = stateFor(fa.i), p = plan(programme[fa.i]);
    const last = fa.i === programme.length - 1;
    const left = Math.max(0, Math.ceil((st.ends - Date.now()) / 1000));
    let label = "", big = "", sub = "", btn = "", frac = 0;
    const roundText = p.sets > 1 ? "Round " + st.round + " of " + p.sets : "";

    if (st.phase === "hold") {
      label = "Hold"; big = String(left); sub = left === 1 ? "second" : "seconds";
      frac = 1 - (st.ends - Date.now()) / (st.length * 1000); btn = "Stop the hold";
    } else if (st.phase === "rest") {
      label = "Rest"; big = String(left); sub = "Next: round " + (st.round + 1) + " of " + p.sets;
      frac = 1 - (st.ends - Date.now()) / (st.length * 1000); btn = "Skip the rest";
    } else if (st.phase === "done") {
      label = "Finished"; big = "✓"; sub = "Well done!"; frac = 1;
      btn = last ? "Finish" : "Next exercise →";
    } else if (p.countsReps) {
      label = roundText || "Count"; big = String(st.rep); sub = "of " + p.reps + " done";
      frac = st.rep / p.reps;
      btn = p.hold ? "Start hold (" + p.hold + " seconds)" : "I did one (+1)";
    } else {
      label = roundText || "When you're ready"; big = p.hold ? String(p.hold) : ""; sub = p.hold ? "second hold" : "";
      btn = p.hold ? "Start hold (" + p.hold + " seconds)" : (p.sets > 1 ? "I did this round" : "I've done it");
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
    $("#fa-pos").textContent = "Exercise " + (fa.i + 1) + " of " + n;
    $("#fa-bar-fill").style.width = Math.round(((fa.i + 1) / n) * 100) + "%";
    $("#fa-back").disabled = fa.i === 0;
    $("#fa-next").innerHTML = fa.i === n - 1 ? "Finish &#10003;" : "Next &rarr;";

    const pic = H.picture(ex, "anim");
    let pauseBtn = null;
    if (pic.controls) {
      pauseBtn = el("button", { type: "button", class: "p-pause", "aria-pressed": String(pic.controls.paused) }, pic.controls.paused ? "Play" : "Pause");
      pauseBtn.addEventListener("click", () => {
        if (pic.controls.paused) pic.controls.play(); else pic.controls.pause();
        pauseBtn.textContent = pic.controls.paused ? "Play" : "Pause";
        pauseBtn.setAttribute("aria-pressed", String(pic.controls.paused));
      });
    }
    const dose = H.describe(item);
    const readBtn = canSpeak ? el("button", { type: "button", class: "btn btn-secondary p-read", "aria-pressed": "false" }, "🔊 Read aloud") : null;
    const count = el("div", { class: "fa-count", id: "fa-count" },
      el("p", { class: "fa-label" }),
      el("p", { class: "fa-num", "aria-hidden": "true" }, el("span", { class: "fa-big" }), el("span", { class: "fa-sub" })),
      el("div", { class: "fa-meter", "aria-hidden": "true" }, el("span")),
      el("button", { type: "button", class: "btn btn-primary fa-main", onclick: mainAction }),
      el("div", { class: "fa-small" },
        el("button", { type: "button", class: "btn-ghost fa-undo", onclick: undo }, "Take one off"),
        el("button", { type: "button", class: "btn-ghost", onclick: restartExercise }, "Start again"))
    );
    const body = $("#fa-body");
    body.innerHTML = "";
    const card = el("div", { class: "fa-card" },
      el("div", { class: "p-card-head" }, el("h2", { id: "fa-title", tabindex: "-1", text: ex.name }), readBtn),
      ex.custom ? el("p", { class: "p-own", text: "Written by your physio" }) : null,
      el("div", { class: "fa-media p-media" }, H.mediaSwitch(ex, pic, { extra: pauseBtn })),
      ex.custom ? el("p", { class: "p-own-pic hint", text: ex.like ? "The picture shows a similar exercise. Follow your physio's steps below." : "Your physio will show you how to do this one." }) : null,
      dose ? el("p", { class: "p-dose", text: dose }) : null,
      count,
      item.notes ? el("p", { class: "p-notes", text: item.notes }) : null,
      el("details", { class: "fa-how", open: "" }, el("summary", { text: "How to do it" }),
        el("ol", { class: "p-steps" }, ex.instructions.map((t) => el("li", { text: t }))))
    );
    if (readBtn) readBtn.addEventListener("click", () => readCard(readBtn, card));
    body.append(card);
    drawCounter();
    window.scrollTo(0, 0);
    $("#fa-title").focus({ preventScroll: true });
  }

  function drawFinished() {
    stopTimer();
    stopReading();
    $("#fa-pos").textContent = "All done";
    $("#fa-bar-fill").style.width = "100%";
    $("#fa-back").disabled = false;
    $("#fa-next").innerHTML = "Close";
    $("#fa-next").classList.remove("fa-ready");
    const tickBtn = ticks ? el("button", { type: "button", class: "btn btn-primary fa-tick" }) : null;
    const syncTick = () => {
      const on = ticks.isTodayDone();
      tickBtn.textContent = on ? "✓ Today is ticked" : "Tick today on my chart";
      tickBtn.disabled = on;
    };
    if (tickBtn) { tickBtn.addEventListener("click", () => { ticks.tickToday(); syncTick(); say("Today is ticked on your chart."); }); syncTick(); }
    const body = $("#fa-body");
    body.innerHTML = "";
    body.append(el("div", { class: "fa-card fa-finished" },
      el("p", { class: "fa-finished-mark", "aria-hidden": "true", text: "✓" }),
      el("h2", { id: "fa-title", tabindex: "-1", text: "Well done!" }),
      el("p", { text: "You've finished your exercises for now." }),
      tickBtn,
      tickBtn ? el("p", { class: "hint", text: "Your tick is saved on this phone only." }) : null,
      el("p", { class: "fa-finished-safety", text: "If anything caused sharp pain, or pain that got worse, call your physio." })
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
    e.currentTarget.textContent = fa.sound ? "Sound on" : "Sound off";
    e.currentTarget.setAttribute("aria-pressed", String(fa.sound));
  });
  document.addEventListener("keydown", (e) => { if (fa.open && e.key === "Escape") closeFollow(); });

  async function start() {
    const code = decodeURIComponent(location.hash.slice(1));
    try {
      if (!code) throw new Error("No programme in link");
      const data = await H.decode(code);
      H.registerCustom((data.cx || []).map(H.unpackCustom).filter(Boolean));
      const items = (data.x || []).map(H.unpackItem).filter((it) => H.byId(it.id));
      minutes = items.length ? H.estimateMinutes(items) : 0;
      const meta = [H.formatDate(data.d), data.c, data.t].filter(Boolean).join(" · ");
      $("#meta").textContent = meta + (minutes ? (meta ? " · " : "") + "About " + minutes + " minutes each time" : "");
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
      if (data.g) { $("#general").textContent = data.g; $("#general").hidden = false; }
      if (data.tc) ticks = setupTicks(code);
      const list = $("#list");
      (data.x || []).map(H.unpackItem).forEach((it, i) => { const c = card(it, i); if (c) list.append(c); });
      if (!list.children.length) throw new Error("Empty programme");
      programme = items;
      $("#fa-start-wrap").hidden = false;
    } catch (e) {
      $("#intro").hidden = true;
      $("#reminder").hidden = true; // no programme, so no daily reminder to offer
      $("#error").hidden = false;
    }
  }

  let paused = window.PhysioFigures && window.PhysioFigures.reduceMotion;
  const motionBtn = $("#btn-motion");
  const setMotion = () => {
    motionBtn.textContent = paused ? "Play pictures" : "Pause pictures";
    motionBtn.setAttribute("aria-pressed", String(paused));
    window.PhysioFigures && window.PhysioFigures.setAllPaused(paused);
  };
  motionBtn.addEventListener("click", () => { paused = !paused; setMotion(); });
  $("#btn-print").addEventListener("click", () => window.print());
  const largeBtn = $("#btn-large");
  const faLargeBtn = $("#fa-large");
  function syncLarge() {
    const on = document.body.classList.contains("large-print");
    [largeBtn, faLargeBtn].forEach((b) => { b.textContent = on ? "Normal text" : "Larger text"; b.setAttribute("aria-pressed", String(on)); });
  }
  [largeBtn, faLargeBtn].forEach((b) => b.addEventListener("click", () => { document.body.classList.toggle("large-print"); syncLarge(); }));
  window.addEventListener("pagehide", stopReading);
  setMotion();
  start();
})();
