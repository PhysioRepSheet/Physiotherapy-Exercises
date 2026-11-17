/*
  RepSheet pacing diary (pacing.html)
  Everything the patient writes is kept in this browser only (localStorage "repsheet-pacing").
  Nothing is sent anywhere. A physio can put starting limits in the link (#l=...), which hold
  only activity names and minutes, and are added only when the patient says yes.
*/
(function () {
  "use strict";
  const KEY = "repsheet-pacing";
  const BIG = "repsheet-pacing:big";
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const LVL = { 0: "Rest", 1: "Easy", 2: "Medium", 3: "Hard" };
  const QUICK = ["Walking", "Housework", "Shower or bath", "Cooking", "Shopping", "Work or study", "Seeing people", "My exercises", "Screen time", "Rest"];
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // ---------- Storage ----------
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY) || "null");
      if (d && d.v === 1 && d.days && Array.isArray(d.limits)) return d;
    } catch (e) { /* storage blocked or broken: start fresh */ }
    return { v: 1, days: {}, limits: [] };
  }
  let data = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(data)); }
    catch (e) { toast("Couldn't save on this phone. Is private browsing on?"); }
  }
  const uid = () => Math.random().toString(36).slice(2, 9);

  // ---------- Dates ----------
  const pad = (n) => String(n).padStart(2, "0");
  const dkey = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const today0 = () => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; };
  const monday = (d) => addDays(d, -((d.getDay() + 6) % 7));
  const longDate = (d) => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const shortDate = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  const day = (k) => data.days[k] || { acts: [] };
  function dayW(k) { if (!data.days[k]) data.days[k] = { acts: [] }; return data.days[k]; }
  const mins = (n) => n >= 60 ? Math.floor(n / 60) + " h" + (n % 60 ? " " + (n % 60) + " min" : "") : n + " min";
  const limitFor = (name) => data.limits.find((l) => l.name.trim().toLowerCase() === String(name).trim().toLowerCase());

  let curDay = today0();
  let curWeek = monday(today0());

  // ---------- Toast ----------
  let toastT;
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 2600);
  }

  // ---------- Tabs ----------
  const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
  function showTab(tab, focus) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", on); t.tabIndex = on ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
    if (tab.id === "tab-week") renderWeek();
    if (tab.id === "tab-limits") renderLimits();
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => showTab(t));
    t.addEventListener("keydown", (e) => {
      const n = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (n) { e.preventDefault(); showTab(tabs[(i + n + tabs.length) % tabs.length], true); }
    });
  });

  // ---------- Larger text ----------
  function setBig(on) {
    document.body.classList.toggle("big", on);
    $("#big-text").setAttribute("aria-pressed", on);
    try { localStorage.setItem(BIG, on ? "1" : ""); } catch (e) { /* fine */ }
  }
  $("#big-text").addEventListener("click", () => setBig(!document.body.classList.contains("big")));
  try { if (localStorage.getItem(BIG)) setBig(true); } catch (e) { /* fine */ }

  // ---------- Today: scales ----------
  function buildScale(el, field, label) {
    for (let i = 0; i <= 10; i++) {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = i; b.setAttribute("role", "radio");
      b.setAttribute("aria-label", label + " " + i + " out of 10");
      b.addEventListener("click", () => {
        const d = dayW(dkey(curDay));
        d[field] = d[field] === i ? null : i; // tap again to clear
        save(); renderDay();
      });
      b.addEventListener("keydown", (e) => {
        const n = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
        if (!n) return;
        e.preventDefault();
        const j = Math.min(10, Math.max(0, i + n));
        const d = dayW(dkey(curDay)); d[field] = j; save(); renderDay();
        el.children[j].focus();
      });
      el.appendChild(b);
    }
  }
  buildScale($("#energy"), "en", "Energy");
  buildScale($("#symptoms"), "sy", "Symptoms");

  function setScale(el, v) {
    Array.from(el.children).forEach((b, i) => {
      b.setAttribute("aria-checked", v === i);
      b.tabIndex = (v == null ? i === 0 : v === i) ? 0 : -1;
    });
  }

  // ---------- Today: render ----------
  function renderDay() {
    const k = dkey(curDay);
    const isToday = k === dkey(today0());
    $("#day-title").textContent = isToday ? "Today, " + longDate(curDay) : longDate(curDay);
    $("#day-next").disabled = isToday;
    $("#add-title").textContent = isToday ? "Add something I did" : "Add something I did on " + curDay.toLocaleDateString("en-GB", { weekday: "long" });
    const d = day(k);
    setScale($("#energy"), d.en == null ? null : d.en);
    setScale($("#symptoms"), d.sy == null ? null : d.sy);

    const ul = $("#acts");
    ul.innerHTML = d.acts.map((a) => {
      const lim = a.lvl ? limitFor(a.name) : null;
      const over = lim && a.min > lim.min ? ' · <span class="over">over your limit of ' + lim.min + ' min</span>' : "";
      return '<li><i class="dot l' + a.lvl + '" aria-hidden="true"></i><div class="act-main"><b>' + esc(a.name) + "</b><span>" +
        mins(a.min) + " · " + LVL[a.lvl] + over + '</span></div><button type="button" class="icon-x" data-del="' + a.id + '" aria-label="Remove ' + esc(a.name) + '">Remove</button></li>';
    }).join("");
    $("#acts-empty").hidden = d.acts.length > 0;
    const t = { 0: 0, 1: 0, 2: 0, 3: 0 };
    d.acts.forEach((a) => { t[a.lvl] += a.min; });
    const active = t[1] + t[2] + t[3];
    $("#day-sum").textContent = d.acts.length ? "Active: " + mins(active) + (t[3] ? " (hard: " + mins(t[3]) + ")" : "") + " · Rest: " + mins(t[0]) : "";
  }
  $("#acts").addEventListener("click", (e) => {
    const id = e.target.getAttribute("data-del");
    if (!id) return;
    const d = dayW(dkey(curDay));
    const a = d.acts.find((x) => x.id === id);
    d.acts = d.acts.filter((x) => x.id !== id);
    save(); renderDay();
    if (a) toast("Removed " + a.name);
  });
  $("#day-prev").addEventListener("click", () => { curDay = addDays(curDay, -1); renderDay(); });
  $("#day-next").addEventListener("click", () => { if (dkey(curDay) !== dkey(today0())) { curDay = addDays(curDay, 1); renderDay(); } });

  // ---------- Today: add form ----------
  const nameIn = $("#act-name"), minIn = $("#act-min");
  $("#quick-acts").innerHTML = QUICK.map((q) => '<button type="button" aria-pressed="false">' + esc(q) + "</button>").join("");
  $("#quick-mins").innerHTML = [5, 10, 15, 20, 30, 45, 60].map((m) => '<button type="button" data-m="' + m + '" aria-label="' + m + ' minutes">' + m + "</button>").join("");
  $("#quick-acts").addEventListener("click", (e) => {
    if (e.target.tagName !== "BUTTON") return;
    nameIn.value = e.target.textContent; formChanged();
  });
  $("#quick-mins").addEventListener("click", (e) => {
    const m = e.target.getAttribute("data-m"); if (!m) return;
    minIn.value = m; formChanged();
  });
  document.querySelectorAll(".step-btn").forEach((b) => b.addEventListener("click", () => {
    const v = (parseInt(minIn.value, 10) || 0) + parseInt(b.getAttribute("data-step"), 10);
    minIn.value = Math.max(1, Math.min(600, v)); formChanged();
  }));
  nameIn.addEventListener("input", formChanged);
  minIn.addEventListener("input", formChanged);
  const isRest = (n) => /^rest(ing)?$/i.test(String(n).trim());
  function formChanged() {
    const n = nameIn.value.trim();
    Array.from($("#quick-acts").children).forEach((b) => b.setAttribute("aria-pressed", b.textContent.toLowerCase() === n.toLowerCase()));
    $("#effort-set").hidden = isRest(n);
    const lim = limitFor(n), m = parseInt(minIn.value, 10) || 0;
    const note = $("#limit-note");
    if (lim && !isRest(n)) {
      note.hidden = false;
      note.textContent = m > lim.min
        ? "Your limit for " + lim.name.toLowerCase() + " is " + lim.min + " minutes. Next time, try to stop sooner, or split it up with a rest" + (lim.rest ? " of " + lim.rest + " minutes." : ".")
        : "Inside your limit of " + lim.min + " minutes. Well done.";
    } else note.hidden = true;
  }
  $("#add-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const n = nameIn.value.trim(), m = parseInt(minIn.value, 10);
    if (!n) { nameIn.focus(); return; }
    if (!(m > 0)) { minIn.focus(); toast("Type how many minutes"); return; }
    const lvl = isRest(n) ? 0 : parseInt((document.querySelector('input[name="lvl"]:checked') || { value: 2 }).value, 10);
    dayW(dkey(curDay)).acts.push({ id: uid(), name: n.slice(0, 40), min: Math.min(600, m), lvl });
    save(); renderDay();
    toast("Added " + n);
    nameIn.value = ""; minIn.value = 10; formChanged();
  });

  // ---------- Activity timer ----------
  let tm = null; // { name, total, left, endAt, paused, done, startMs, used }
  function fillTimerPick() {
    const opts = data.limits.map((l) => '<option value="l:' + l.id + '">' + esc(l.name) + " (limit " + l.min + " min)</option>").join("") +
      QUICK.filter((q) => !isRest(q) && !limitFor(q)).map((q) => "<option>" + esc(q) + "</option>").join("") + '<option value="">Something else</option>';
    $("#timer-pick").innerHTML = opts;
    pickChanged();
  }
  function pickChanged() {
    const v = $("#timer-pick").value;
    if (v.startsWith("l:")) { const l = data.limits.find((x) => "l:" + x.id === v); if (l) $("#timer-min").value = l.min; }
  }
  $("#timer-pick").addEventListener("change", pickChanged);
  const fmt = (s) => Math.floor(s / 60) + ":" + pad(Math.floor(s % 60));
  let tick, wake = null;
  $("#timer-start").addEventListener("click", async () => {
    const m = parseInt($("#timer-min").value, 10);
    if (!(m > 0)) { $("#timer-min").focus(); return; }
    const sel = $("#timer-pick");
    let name = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text.replace(/ \(limit .*\)$/, "") : "";
    if (!sel.value && sel.value !== undefined && name === "Something else") name = "";
    tm = { name, total: m * 60, used: 0, runFrom: Date.now(), paused: false, done: false };
    $("#timer-set").hidden = true; $("#timer-run").hidden = false; $("#timer-run").classList.remove("done");
    $("#timer-what").textContent = name ? name + ": stop after " + m + " min" : "Stop after " + m + " min";
    $("#timer-msg").textContent = ""; $("#timer-pause").textContent = "Pause"; $("#timer-pause").hidden = false;
    primeSound();
    try { if (navigator.wakeLock) wake = await navigator.wakeLock.request("screen"); } catch (e) { /* not supported */ }
    clearInterval(tick); tick = setInterval(timerTick, 250); timerTick();
  });
  const usedSecs = () => tm.used + (tm.paused ? 0 : (Date.now() - tm.runFrom) / 1000);
  function timerTick() {
    if (!tm) return;
    const u = usedSecs(), left = tm.total - u;
    if (left > 0) { $("#timer-clock").textContent = fmt(Math.ceil(left)); return; }
    $("#timer-clock").textContent = "+" + fmt(-left);
    if (!tm.done) {
      tm.done = true;
      $("#timer-run").classList.add("done");
      $("#timer-msg").textContent = "Time to stop and rest.";
      $("#timer-pause").hidden = true;
      beep(); try { navigator.vibrate && navigator.vibrate([300, 150, 300, 150, 300]); } catch (e) { /* fine */ }
    }
  }
  $("#timer-pause").addEventListener("click", () => {
    if (!tm) return;
    if (tm.paused) { tm.paused = false; tm.runFrom = Date.now(); $("#timer-pause").textContent = "Pause"; }
    else { tm.used = usedSecs(); tm.paused = true; $("#timer-pause").textContent = "Carry on"; }
  });
  function endTimer() {
    clearInterval(tick);
    try { wake && wake.release(); } catch (e) { /* fine */ } wake = null;
    $("#timer-set").hidden = false; $("#timer-run").hidden = true;
  }
  $("#timer-cancel").addEventListener("click", () => { tm = null; endTimer(); });
  $("#timer-stop").addEventListener("click", () => {
    if (!tm) return;
    const m = Math.max(1, Math.round(usedSecs() / 60)), n = tm.name;
    tm = null; endTimer();
    curDay = today0(); renderDay();
    nameIn.value = n; minIn.value = m; formChanged();
    $("#add-form").scrollIntoView({ behavior: "smooth", block: "start" });
    (n ? document.querySelector('input[name="lvl"]:checked') : nameIn).focus({ preventScroll: true });
    toast("Choose how hard it was, then tap Add");
  });
  let actx;
  function primeSound() { try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); actx.resume(); } catch (e) { /* no sound */ } }
  function beep() {
    if (!actx) return;
    [0, .35, .7].forEach((t) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(actx.destination);
      g.gain.setValueAtTime(.0001, actx.currentTime + t);
      g.gain.exponentialRampToValueAtTime(.3, actx.currentTime + t + .02);
      g.gain.exponentialRampToValueAtTime(.0001, actx.currentTime + t + .28);
      o.start(actx.currentTime + t); o.stop(actx.currentTime + t + .3);
    });
  }

  // ---------- Week ----------
  function weekDays(start) {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(start, i), d = day(dkey(date));
      const t = { 0: 0, 1: 0, 2: 0, 3: 0 };
      d.acts.forEach((a) => { t[a.lvl] += a.min; });
      return { date, d, t, active: t[1] + t[2] + t[3], busy: t[2] + t[3], has: d.acts.length > 0 || d.en != null || d.sy != null };
    });
  }
  function renderWeek() {
    const isThis = dkey(curWeek) === dkey(monday(today0()));
    $("#week-title").textContent = isThis ? "This week" : "Week of " + shortDate(curWeek);
    $("#week-next").disabled = isThis;
    const w = weekDays(curWeek);
    const tk = dkey(today0());

    // Chart (SVG): stacked minutes, energy line on top
    const W = Math.round(Math.max(340, Math.min(700, $("#chart").clientWidth || 700))), H = 310, top = 74, base = 250, colW = W / 7, barW = Math.min(46, colW * .5);
    const maxM = Math.max(60, ...w.map((x) => x.active + x.t[0]));
    const scaleMax = Math.ceil(maxM / 60) * 60;
    const y = (m) => base - (m / scaleMax) * (base - top);
    let s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Chart of minutes active and energy for each day of the week">';
    for (let g = 0; g <= scaleMax; g += scaleMax / (scaleMax >= 240 ? 4 : 2)) s += '<line class="grid" x1="0" x2="' + W + '" y1="' + y(g) + '" y2="' + y(g) + '"/>';
    const pts = [];
    w.forEach((x, i) => {
      const cx = colW * i + colW / 2;
      let yy = base;
      [1, 2, 3, 0].forEach((l) => {
        if (!x.t[l]) return;
        const h = (x.t[l] / scaleMax) * (base - top);
        yy -= h;
        s += '<rect class="b' + l + '" x="' + (cx - barW / 2) + '" y="' + yy + '" width="' + barW + '" height="' + h + '" rx="3"/>';
      });
      if (x.active + x.t[0]) s += '<text class="mins" x="' + cx + '" y="' + (yy - 5) + '" text-anchor="middle">' + (x.active + x.t[0]) + "m</text>";
      const isT = dkey(x.date) === tk;
      s += '<text class="lab' + (isT ? " today" : "") + '" x="' + cx + '" y="' + (base + 20) + '" text-anchor="middle">' + DAYS[i].slice(0, 3) + "</text>";
      s += '<text class="lab" x="' + cx + '" y="' + (base + 38) + '" text-anchor="middle">' + x.date.getDate() + "</text>";
      if (x.d.en != null) pts.push([cx, 0, x.d.en, i]);
    });
    // energy strip along the top: circle per day, line joins them, height shows 0 to 10
    const ey = (v) => 14 + (10 - v) * 3.6;
    if (pts.length > 1) s += '<polyline class="en-line" points="' + pts.map((p) => p[0] + "," + ey(p[2])).join(" ") + '"/>';
    pts.forEach((p) => { s += '<circle class="en-dot" cx="' + p[0] + '" cy="' + ey(p[2]) + '" r="12"/><text class="en-txt" x="' + p[0] + '" y="' + (ey(p[2]) + 4) + '" text-anchor="middle">' + p[2] + "</text>"; });
    s += "</svg>";
    $("#chart").innerHTML = s;

    // Screen reader table
    $("#week-table").innerHTML = "<caption>Your week, day by day</caption><tr><th>Day</th><th>Active minutes</th><th>Hard minutes</th><th>Rest minutes</th><th>Energy</th><th>Symptoms</th></tr>" +
      w.map((x, i) => "<tr><td>" + DAYS[i] + " " + x.date.getDate() + "</td><td>" + x.active + "</td><td>" + x.t[3] + "</td><td>" + x.t[0] + "</td><td>" + (x.d.en ?? "not given") + "</td><td>" + (x.d.sy ?? "not given") + "</td></tr>").join("");

    // Numbers
    const days = w.filter((x) => x.has);
    const ens = w.filter((x) => x.d.en != null).map((x) => x.d.en);
    const avg = (a) => a.length ? Math.round(a.reduce((p, c) => p + c, 0) / a.length) : null;
    const actDays = w.filter((x) => x.active);
    $("#week-nums").innerHTML = [
      ["Days written down", days.length + " of 7"],
      ["Average active time", actDays.length ? mins(avg(actDays.map((x) => x.active))) + " a day" : "–"],
      ["Most active day", actDays.length ? (() => { const m = actDays.reduce((a, b) => (b.active > a.active ? b : a)); return DAYS[w.indexOf(m)] + ", " + mins(m.active); })() : "–"],
      ["Average energy", ens.length ? avg(ens) + " out of 10" : "–"],
      ["Rest", mins(w.reduce((p, x) => p + x.t[0], 0)) + " this week"]
    ].map((r) => "<div><dt>" + r[0] + "</dt><dd>" + r[1] + "</dd></div>").join("");

    // Boom and bust: a much busier day, then low energy in the next 2 days (this week, or the start of next)
    const tip = $("#week-tip");
    const busyAvg = actDays.length ? actDays.reduce((p, x) => p + x.busy, 0) / actDays.length : 0;
    let found = null;
    w.forEach((x, i) => {
      if (found || actDays.length < 3 || x.busy < 60 || x.busy < busyAvg * 1.5) return;
      for (let j = 1; j <= 2; j++) {
        const nd = day(dkey(addDays(x.date, j)));
        if (nd.en != null && (nd.en <= 3 || (x.d.en != null && nd.en <= x.d.en - 3))) { found = { i, j, en: nd.en }; break; }
      }
    });
    if (found) {
      const bd = DAYS[found.i];
      tip.hidden = false;
      tip.innerHTML = "<h3>Is this boom and bust?</h3><p>" + bd + " was a busy day. Your energy was " + found.en + " out of 10 " +
        (found.j === 1 ? "the next day" : "two days later") + ".</p><p>Try to spread busy jobs across the week, and rest before you get tired. Talk to your physio about it.</p>";
    } else if (days.length >= 3 && w.some((x) => x.active) && !w.some((x) => x.t[0])) {
      tip.hidden = false;
      tip.innerHTML = "<h3>Remember to rest</h3><p>You haven't written down any rest this week. Planned rest is part of pacing. Add it like any other activity.</p>";
    } else tip.hidden = true;
  }
  $("#week-prev").addEventListener("click", () => { curWeek = addDays(curWeek, -7); renderWeek(); });
  $("#week-next").addEventListener("click", () => { if (dkey(curWeek) !== dkey(monday(today0()))) { curWeek = addDays(curWeek, 7); renderWeek(); } });

  // ---------- Printing ----------
  function printNow(html) {
    $("#print-area").innerHTML = html;
    setTimeout(() => window.print(), 50);
  }
  window.addEventListener("afterprint", () => { $("#print-area").innerHTML = ""; });
  $("#print-week").addEventListener("click", () => {
    const w = weekDays(curWeek);
    const lims = data.limits.length ? "<p><b>My limits:</b> " + data.limits.map((l) => esc(l.name) + " " + l.min + " min" + (l.rest ? " then rest " + l.rest + " min" : "")).join("; ") + "</p>" : "";
    printNow("<h1>My pacing diary: week of " + shortDate(curWeek) + "</h1>" + lims +
      '<table><tr><th style="width:14%">Day</th><th>What I did (E = easy, M = medium, H = hard, R = rest)</th><th style="width:10%">Active</th><th style="width:9%">Energy (0 to 10)</th><th style="width:9%">Symptoms (0 to 10)</th></tr>' +
      w.map((x, i) => "<tr><td>" + DAYS[i] + " " + x.date.getDate() + "</td><td>" + (x.d.acts.map((a) => esc(a.name) + " " + a.min + " min (" + LVL[a.lvl][0] + ")").join(", ") || "&nbsp;") +
        "</td><td>" + (x.active ? mins(x.active) : "") + "</td><td>" + (x.d.en ?? "") + "</td><td>" + (x.d.sy ?? "") + "</td></tr>").join("") +
      '</table><p class="key">Made with RepSheet pacing diary. Energy: 0 = none, 10 = lots. Symptoms: 0 = none, 10 = the worst.</p>');
  });
  $("#print-blank").addEventListener("click", () => {
    printNow("<h1>My pacing diary</h1><p>Week starting: ____________________ &nbsp; Write what you did and for how long. Put E (easy), M (medium), H (hard) or R (rest) next to each one.</p>" +
      '<table><tr><th style="width:12%">Day</th><th>Morning</th><th>Afternoon</th><th>Evening</th><th style="width:9%">Energy (0 to 10)</th><th style="width:9%">Symptoms (0 to 10)</th></tr>' +
      DAYS.map((d) => '<tr><td class="blank">' + d + '</td><td></td><td></td><td></td><td></td><td></td></tr>').join("") +
      '</table><p class="key">Energy: 0 = none, 10 = lots. Symptoms: 0 = none, 10 = the worst. Tips: do about the same each day, rest before you get tired, and break big jobs into small parts.</p>');
  });

  // ---------- Limits ----------
  let editId = null;
  function renderLimits() {
    $("#limits").innerHTML = data.limits.map((l) =>
      '<li><div class="act-main"><b>' + esc(l.name) + "</b><span>Up to " + l.min + " min at a time" + (l.rest ? ", then rest " + l.rest + " min" : "") +
      '</span></div><button type="button" class="icon-x" data-edit="' + l.id + '" aria-label="Change ' + esc(l.name) + '">Change</button><button type="button" class="icon-x" data-rm="' + l.id + '" aria-label="Remove ' + esc(l.name) + '">Remove</button></li>').join("");
    $("#limits-empty").hidden = data.limits.length > 0;
    $("#lim-suggest").innerHTML = QUICK.filter((q) => !isRest(q)).map((q) => '<option value="' + esc(q) + '">').join("");
    fillTimerPick();
  }
  function resetLimitForm() {
    editId = null; $("#limit-form").reset(); $("#lim-min").value = 10;
    $("#limit-form-title").textContent = "Add a limit"; $("#lim-cancel").hidden = true;
  }
  $("#limits").addEventListener("click", (e) => {
    const rm = e.target.getAttribute("data-rm"), ed = e.target.getAttribute("data-edit");
    if (rm) { data.limits = data.limits.filter((l) => l.id !== rm); save(); renderLimits(); toast("Limit removed"); }
    if (ed) {
      const l = data.limits.find((x) => x.id === ed); if (!l) return;
      editId = ed; $("#lim-name").value = l.name; $("#lim-min").value = l.min; $("#lim-rest").value = l.rest || "";
      $("#limit-form-title").textContent = "Change limit"; $("#lim-cancel").hidden = false; $("#lim-min").focus();
    }
  });
  $("#lim-cancel").addEventListener("click", resetLimitForm);
  $("#limit-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = $("#lim-name").value.trim().slice(0, 40), min = parseInt($("#lim-min").value, 10), rest = parseInt($("#lim-rest").value, 10) || 0;
    if (!name || !(min > 0)) return;
    const same = limitFor(name);
    if (editId) Object.assign(data.limits.find((l) => l.id === editId) || {}, { name, min, rest });
    else if (same) Object.assign(same, { min, rest });
    else data.limits.push({ id: uid(), name, min, rest });
    save(); resetLimitForm(); renderLimits(); toast("Limit saved");
  });

  // ---------- Wipe ----------
  $("#wipe").addEventListener("click", () => {
    const b = $("#wipe");
    if (b.dataset.sure !== "1") { b.dataset.sure = "1"; b.textContent = "Tap again to delete everything"; setTimeout(() => { b.dataset.sure = ""; b.textContent = "Delete my whole diary"; }, 5000); return; }
    data = { v: 1, days: {}, limits: [] };
    try { localStorage.removeItem(KEY); } catch (e) { /* fine */ }
    b.dataset.sure = ""; b.textContent = "Delete my whole diary";
    renderDay(); renderLimits(); toast("Your diary has been deleted");
  });

  // ---------- Limits from a physio's link (#l=...) ----------
  function readPreset() {
    const m = /^#l=(.+)$/.exec(location.hash);
    if (!m) return null;
    try {
      const arr = JSON.parse(decodeURIComponent(m[1]));
      const out = arr.filter((r) => Array.isArray(r) && r[0] && r[1] > 0).slice(0, 12)
        .map((r) => ({ name: String(r[0]).slice(0, 40), min: Math.min(600, parseInt(r[1], 10)), rest: Math.min(240, parseInt(r[2], 10) || 0) }));
      return out.length ? out : null;
    } catch (e) { return null; }
  }
  const preset = readPreset();
  function clearHash() { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { /* fine */ } }
  if (preset) {
    $("#preset").hidden = false;
    $("#preset-list").innerHTML = preset.map((p) => "<li><b>" + esc(p.name) + "</b>: up to " + p.min + " min at a time" + (p.rest ? ", then rest " + p.rest + " min" : "") + "</li>").join("");
    $("#preset-use").addEventListener("click", () => {
      preset.forEach((p) => { const s = limitFor(p.name); if (s) Object.assign(s, { min: p.min, rest: p.rest }); else data.limits.push(Object.assign({ id: uid() }, p)); });
      save(); $("#preset").hidden = true; clearHash(); renderLimits(); renderDay(); toast("Limits added"); showTab($("#tab-limits"));
    });
    $("#preset-no").addEventListener("click", () => { $("#preset").hidden = true; clearHash(); });
  }

  // ---------- For physios: make a link with starting limits ----------
  function phRow(n, m, r) {
    const div = document.createElement("div");
    div.className = "ph-row";
    const id = uid();
    div.innerHTML = '<div><label for="pa' + id + '">Activity</label><input type="text" id="pa' + id + '" maxlength="40" value="' + esc(n || "") + '"></div>' +
      '<div><label for="pm' + id + '">Minutes</label><input type="number" id="pm' + id + '" min="1" max="600" value="' + (m || "") + '"></div>' +
      '<div><label for="pr' + id + '">Rest after</label><input type="number" id="pr' + id + '" min="0" max="240" value="' + (r || "") + '"></div>' +
      '<button type="button" class="icon-x" aria-label="Remove this row">✕</button>';
    div.querySelector("button").addEventListener("click", () => { div.remove(); phBuild(); });
    div.addEventListener("input", phBuild);
    $("#ph-rows").appendChild(div);
  }
  let phLink = "";
  function phBuild() {
    const rows = Array.from(document.querySelectorAll(".ph-row")).map((d) => {
      const i = d.querySelectorAll("input");
      return [i[0].value.trim(), parseInt(i[1].value, 10) || 0, parseInt(i[2].value, 10) || 0];
    }).filter((r) => r[0] && r[1] > 0).map((r) => (r[2] ? r : r.slice(0, 2)));
    $("#ph-out").hidden = !rows.length;
    if (!rows.length) return;
    phLink = location.href.split("#")[0].split("?")[0] + "#l=" + encodeURIComponent(JSON.stringify(rows));
    $("#ph-link").value = phLink;
    let svg = "";
    try { const q = qrcode(0, "M"); q.addData(phLink); q.make(); svg = q.createSvgTag({ cellSize: 4, margin: 0, scalable: true, alt: "QR code for the pacing diary with your limits" }); } catch (e) { /* too long */ }
    $("#ph-qr").innerHTML = svg || '<p class="hint">Too long for a QR code. Use fewer activities.</p>';
    phRows = rows;
  }
  let phRows = [];
  phRow("Walking", 10, 10); phRow("Housework", 15, 10);
  $("#ph-add").addEventListener("click", () => { phRow(); document.querySelector(".ph-row:last-child input").focus(); });
  $("#ph-copy").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(phLink); toast("Link copied"); } catch (e) { $("#ph-link").select(); toast("Press Ctrl + C to copy"); }
  });
  $("#ph-print").addEventListener("click", () => {
    printNow('<h1>Your pacing diary</h1><div class="pq">' + $("#ph-qr").innerHTML + "<div><p>Scan this code with your phone camera to open your pacing diary. Tap <b>Use these limits</b>.</p><p><b>Your limits</b></p><ul>" +
      phRows.map((r) => "<li>" + esc(r[0]) + ": up to " + r[1] + " min at a time" + (r[2] ? ", then rest " + r[2] + " min" : "") + "</li>").join("") +
      "</ul><p>Your diary is saved only on your phone.</p></div></div>");
  });
  $(".physio").addEventListener("toggle", phBuild);

  // ---------- Start ----------
  renderDay(); renderLimits(); formChanged();
  if (location.hash === "#week") showTab($("#tab-week"));
  let rz; window.addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { if (!$("#panel-week").hidden) renderWeek(); }, 200); });
  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(function () {});
})();
