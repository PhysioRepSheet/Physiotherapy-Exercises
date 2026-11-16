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

  function videoBlock(ex) {
    const info = H.videoInfo(ex.video);
    if (!info) return null;
    const box = el("div", { class: "p-video" });
    if (info.kind === "file") {
      box.append(el("div", { class: "p-video-frame" }, el("video", { src: info.src, controls: "", preload: "none", playsinline: "" })));
      return box;
    }
    // Only load the video player when the patient asks for it
    const btn = el("button", {
      type: "button", class: "btn btn-secondary p-video-btn",
      onclick: () => {
        box.innerHTML = "";
        box.append(el("div", { class: "p-video-frame" }, el("iframe", {
          src: info.src + (info.src.includes("?") ? "&" : "?") + "autoplay=1",
          title: "Video: " + ex.name, allow: "autoplay; fullscreen; picture-in-picture", allowfullscreen: "", referrerpolicy: "strict-origin-when-cross-origin"
        })));
      }
    }, "▶ Watch video");
    box.append(btn, el("p", { class: "hint", text: "The video plays from " + info.host + "." }));
    return box;
  }

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
    const harder = (item.prog || []).map((x) => (ex.progressions || [])[x]).filter(Boolean);
    const easier = (item.reg || []).map((x) => (ex.regressions || [])[x]).filter(Boolean);

    const readBtn = canSpeak ? el("button", { type: "button", class: "btn btn-secondary p-read no-print", "aria-pressed": "false" }, "🔊 Read aloud") : null;
    const li = el("li", { class: "p-card" },
      el("div", { class: "p-card-head" }, el("h2", { text: ex.name }), readBtn),
      el("div", { class: "p-media" }, pic.el, pauseBtn),
      el("div", { class: "p-steps-pics" }, H.picture(ex, "steps").el),
      dose ? el("p", { class: "p-dose", text: dose }) : null,
      el("ol", { class: "p-steps" }, ex.instructions.map((s) => el("li", { text: s }))),
      item.notes ? el("p", { class: "p-notes", text: item.notes }) : null,
      harder.length || easier.length ? el("div", { class: "p-options" },
        harder.length ? [el("h3", { text: "To make it harder" }), el("ul", {}, harder.map((t) => el("li", { text: t })))] : null,
        easier.length ? [el("h3", { text: "To make it easier" }), el("ul", {}, easier.map((t) => el("li", { text: t })))] : null
      ) : null,
      videoBlock(ex)
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
  }

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

  async function start() {
    const code = decodeURIComponent(location.hash.slice(1));
    try {
      if (!code) throw new Error("No programme in link");
      const data = await H.decode(code);
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
      if (data.tc) setupTicks(code);
      const list = $("#list");
      (data.x || []).map(H.unpackItem).forEach((it, i) => { const c = card(it, i); if (c) list.append(c); });
      if (!list.children.length) throw new Error("Empty programme");
    } catch (e) {
      $("#intro").hidden = true;
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
  const syncLarge = () => {
    const on = document.body.classList.contains("large-print");
    largeBtn.textContent = on ? "Normal text" : "Larger text";
    largeBtn.setAttribute("aria-pressed", String(on));
  };
  largeBtn.addEventListener("click", () => { document.body.classList.toggle("large-print"); syncLarge(); });
  window.addEventListener("pagehide", stopReading);
  setMotion();
  start();
})();
