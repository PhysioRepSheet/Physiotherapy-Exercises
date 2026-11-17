/*
  RepSheet builder: the patient's language.
  - Adds the "Patient's language" choice. The patient link carries only the language code (lg)
    and whether to show English too (le).
  - When printing (or making the PDF), the exercise names, steps, dose, "you'll need" list,
    harder/easier lines and the handout's own headings are printed in that language.
    The builder screen itself stays in English.
  - The physio's own typed words (notes, goal, plan, own exercises, own progressions) print as typed.
  Nothing is stored or sent anywhere.
*/
(function () {
  "use strict";
  const I = window.RepSheetI18n, H = window.Handout;
  if (!I || !H) return;
  const $ = (s) => document.querySelector(s);
  const sel = $("#handout-lang"), enBox = $("#handout-lang-en"), enRow = $("#handout-lang-en-row"), note = $("#handout-lang-note");
  if (!sel) return;

  I.LANGS.filter((l) => l.code !== "en").forEach((l) => {
    const o = document.createElement("option");
    o.value = l.code;
    o.textContent = l.name + " (" + l.own + ")";
    sel.append(o);
  });

  const chosen = () => (I.langInfo(sel.value) ? sel.value : "en");
  function linkData() {
    const lg = chosen();
    return lg === "en" ? {} : { lg, ...(enBox.checked ? { le: 1 } : {}) };
  }
  function syncControls() {
    const lg = chosen();
    enRow.hidden = lg === "en";
    note.hidden = lg === "en";
    if (lg !== "en") I.load(lg).then(() => { const p = I.packs[lg]; note.hidden = !!(p && p.status === "checked"); });
  }
  // Nudge the builder to rebuild the patient link and QR code
  function poke() {
    const d = $("#handout-date");
    if (d) d.dispatchEvent(new Event("input", { bubbles: true }));
  }
  sel.addEventListener("change", () => { syncControls(); poke(); });
  enBox.addEventListener("change", poke);
  // A new patient starts in English
  const clearBtn = $("#btn-clear");
  if (clearBtn) clearBtn.addEventListener("click", () => setTimeout(() => {
    if (!document.querySelector("#programme-list .ex-card")) { sel.value = "en"; syncControls(); clean(); }
  }, 60));
  syncControls();

  // ---------- Building the translated printed parts ----------
  const make = (tag, cls, attrs) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    Object.entries(attrs || {}).forEach(([k, v]) => { if (v != null) n.setAttribute(k, v); });
    return n;
  };
  let lastData = null;

  function trAttrs(n) {
    const info = I.langInfo(I.lang);
    n.lang = I.lang;
    n.dir = info.dir;
    n.classList.add("tr-only", "print-only", "tr-" + I.lang);
    return n;
  }

  // Swap the text of a fixed part of the printed page, remembering the English to put back later
  function swap(node, key, vars) {
    if (!node) return;
    if (!node.hasAttribute("data-en-html")) node.setAttribute("data-en-html", node.innerHTML);
    node.innerHTML = "";
    I.put(node, key, vars);
    node.lang = I.lang;
    node.dir = I.langInfo(I.lang).dir;
    node.classList.add("tr-" + I.lang);
  }
  function unswap() {
    document.querySelectorAll("[data-en-html]").forEach((n) => {
      n.innerHTML = n.getAttribute("data-en-html");
      n.removeAttribute("data-en-html");
      n.removeAttribute("lang");
      n.removeAttribute("dir");
      [...n.classList].filter((c) => c.startsWith("tr-")).forEach((c) => n.classList.remove(c));
    });
  }
  function clean() {
    document.querySelectorAll(".tr-only").forEach((n) => n.remove());
    document.querySelectorAll(".ex-card.tr-done").forEach((n) => n.classList.remove("tr-done"));
    unswap();
    document.body.classList.remove("tr-print");
  }

  function headings() {
    swap($(".print-head .print-kicker"), "print.kicker");
    swap($(".print-head h1"), "page.title");
    const qr = $("#print-qr p");
    swap(qr, "print.scan");
    const gp = document.querySelectorAll(".gp-print h2");
    swap(gp[0], "goal.title");
    swap(gp[1], "plan.title");
    swap($("#print-message h2"), "msg.title");
    swap($("#print-ticks h2"), "ticks.printTitle");
    document.querySelectorAll("#print-ticks thead th").forEach((th, i) => { if (i) { th.setAttribute("data-en-html", th.innerHTML); th.textContent = I.weekdayShort(new Date(2024, 0, i)); } });
    document.querySelectorAll("#print-ticks tbody th").forEach((th, i) => swap(th, "ticks.week", { n: i + 1 }));
    const safe = $(".print-foot .print-safety");
    if (safe) {
      safe.setAttribute("data-en-html", safe.innerHTML);
      safe.innerHTML = "";
      safe.lang = I.lang; safe.dir = I.langInfo(I.lang).dir; safe.classList.add("tr-" + I.lang);
      const strong = document.createElement("strong");
      strong.textContent = I.t("print.safe") + " ";
      safe.append(strong, I.t("safe.text"));
      if (I.showEnglish) safe.append(I.enLine(I.en("print.safe") + " " + I.en("safe.text")));
    }
    // Name, date, physio... (rebuilt in English by the builder before each print)
    const KEYS = { "Name": "print.name", "Date": "print.date", "Physiotherapist": "print.physio", "Contact": "print.contact", "Keep going": "print.keepGoing", "Time needed": "print.time" };
    document.querySelectorAll("#print-meta > div").forEach((row) => {
      const dt = row.querySelector("dt"), dd = row.querySelector("dd");
      const key = dt && KEYS[dt.textContent.trim()];
      if (!key) return;
      swap(dt, key);
      if (key === "print.date") {
        const v = $("#handout-date") && $("#handout-date").value;
        if (v) { dd.setAttribute("data-en-html", dd.innerHTML); dd.textContent = I.formatDate(v); }
      }
      if (key === "print.time") {
        const m = dd.textContent.match(/\d+/);
        if (m) { dd.setAttribute("data-en-html", dd.innerHTML); dd.textContent = I.t("intro.minutes", { n: Number(m[0]) }); }
      }
    });
    const foot = $("#print-foot-contact");
    if (foot && foot.textContent.trim()) {
      const who = [$("#clinician").value.trim(), $("#contact").value.trim()].filter(Boolean).join(" · ");
      if (who) { foot.setAttribute("data-en-html", foot.innerHTML); foot.textContent = I.t("print.questions", { x: "⁨" + who + "⁩" }); foot.dir = I.langInfo(I.lang).dir; }
    }
    // Draft notice at the top of the handout
    if (I.isDraft()) {
      const box = trAttrs(make("div", "print-lang-draft"));
      const p1 = make("p"); p1.textContent = I.t("lang.draft");
      const p2 = make("p", "lang-draft-en", { lang: "en", dir: "ltr" }); p2.textContent = I.en("lang.draft");
      box.append(p1, p2);
      const head = $(".handout .handout-head");
      if (head) head.after(box);
    }
  }

  function doseBox(item) {
    const box = trAttrs(make("div", "dose-panel"));
    const sets = Number(item.sets), reps = Number(item.reps), hold = Number(item.hold);
    const cells = [];
    if (reps > 1) cells.push([String(reps), I.t("cell.times", { n: reps })]);
    if (sets > 1) cells.push([String(sets), I.t("cell.rounds", { n: sets })]);
    if (hold) cells.push([I.t("cell.sec", { n: hold }), I.t("cell.hold")]);
    if (item.side) { const p = make("p", "dose-side"); p.textContent = I.t("side." + item.side); box.append(p); }
    if (cells.length) {
      const row = make("div", "dose-nums");
      cells.forEach(([n, w]) => { const c = make("div", "dose-cell"); const b = make("b"); b.textContent = n; const s = make("span"); s.textContent = w; c.append(b, s); row.append(c); });
      box.append(row);
    }
    const load = String(item.load || "").trim(), freq = String(item.frequency || "").trim();
    if (load) { const p = make("p", "dose-load"); p.textContent = I.t("dose.use", { x: load }); box.append(p); }
    if (freq) { const p = make("p", "dose-freq"); I.putPair(p, I.freq(freq), freq); box.append(p); }
    return box.childNodes.length ? box : null;
  }

  function optionsBox(ex, item, key, list, ownText, title) {
    const lines = (item[key] || []).slice().sort((a, b) => a - b).filter((i) => (ex[list] || [])[i]).map((i) => [I.exOption(ex, list, i), ex[list][i]]);
    if (String(ownText || "").trim()) lines.push([String(ownText).trim()]);
    if (!lines.length) return null;
    const box = trAttrs(make("div", "options-print"));
    const strong = make("strong");
    strong.textContent = I.t(title) + ":";
    const ul = make("ul");
    lines.forEach(([t, en]) => { const li = make("li", null, en ? null : { dir: "auto" }); I.putPair(li, t, en); ul.append(li); });
    box.append(strong, ul);
    return box;
  }

  function cardParts(li, item) {
    const ex = H.byId(item.id);
    if (!ex) return;
    li.classList.add("tr-done");
    // Name
    const title = li.querySelector(".ex-title:not(.tr-only)");
    if (title) {
      const h = trAttrs(make("h3", "ex-title"));
      const span = make("span");
      I.putPair(span, I.exName(ex), ex.name);
      h.append(span);
      title.after(h);
    }
    // "Written by your physio"
    const own = li.querySelector(".own-label");
    if (own) { const s = trAttrs(make("span")); I.put(s, "card.own"); own.append(s); }
    // Step pictures, with the words under each picture translated
    const pics = li.querySelector(".ex-steps-pics:not(.tr-only)");
    if (pics) { const d = trAttrs(make("div", "ex-steps-pics")); d.dir = "ltr"; d.append(H.picture(ex, "steps").el); pics.after(d); }
    // Steps
    const steps = li.querySelector(".ex-steps:not(.tr-only)");
    if (steps) {
      const ol = trAttrs(make("ol", "ex-steps"));
      I.exSteps(ex).forEach((s, n) => { const x = make("li"); I.putPair(x, s, ex.instructions[n]); ol.append(x); });
      steps.after(ol);
    }
    // Dose
    const dose = li.querySelector(".dose-panel:not(.tr-only)");
    const d = doseBox(item);
    if (dose && d) dose.after(d);
    // What you'll need
    const kit = H.equipment(ex), kitOld = li.querySelector(".print-kit:not(.tr-only)");
    if (kit.length && kitOld) {
      const p = trAttrs(make("p", "print-kit"));
      const b = make("strong"); b.textContent = I.t("card.need") + " ";
      p.append(b, kit.map(I.kit).join(", "));
      kitOld.after(p);
    }
    // Harder and easier
    const more = li.querySelector(".ex-more");
    if (more) {
      const harder = optionsBox(ex, item, "prog", "progressions", item.progText, "card.harder");
      const easier = optionsBox(ex, item, "reg", "regressions", item.regText, "card.easier");
      if (harder) more.append(harder);
      if (easier) more.append(easier);
    }
    // Stage heading: "Move on to the next stage when: ..."
    const move = li.querySelector(".stage-move:not(.tr-only)");
    if (move) {
      const typed = move.textContent.replace(/^Move on to the next stage when:\s*/, "");
      const p = trAttrs(make("p", "stage-move"));
      p.append(I.t("stage.nextWhen") + " ");
      const s = make("span", null, { dir: "auto" }); s.textContent = typed; p.append(s);
      move.after(p);
    }
  }

  // Build everything for one language. Runs with the words switched to that language, then back to English.
  function build(data) {
    clean();
    const lg = data && I.langInfo(data.lg) ? data.lg : "en";
    if (lg === "en" || !I.packs[lg]) return;
    if (!I.useNow(lg, !!data.le)) return;
    try {
      document.body.classList.add("tr-print");
      headings();
      const cards = [...document.querySelectorAll("#programme-list > .ex-card")];
      (data.x || []).forEach((packed, i) => {
        const item = H.unpackItem(packed), li = cards[i];
        if (li && li.dataset.id === item.id) cardParts(li, item);
      });
    } finally {
      I.useNow("en", false);
    }
  }

  // Called by the builder each time the patient link changes
  function update(data) {
    lastData = data;
    const lg = data && data.lg;
    if (!lg) { clean(); return; }
    I.load(lg).then(() => { if (lastData === data) build(data); });
  }
  // Called just before printing or making the PDF: makes sure the language has loaded
  async function prepare(data) {
    lastData = data;
    if (data && data.lg) await I.load(data.lg);
    build(data);
  }
  // Ctrl+P / Cmd+P without the Print button
  window.addEventListener("beforeprint", () => { if (lastData) build(lastData); });

  window.RepSheetI18nBuilder = { linkData, update, prepare };
})();
