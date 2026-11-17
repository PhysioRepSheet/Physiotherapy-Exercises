/*
  RepSheet: exercise handout builder
  Everything runs in the browser. Patient details are never saved or sent anywhere.
  Only the physio's own name and contact details are remembered, and only if they tick the box.
*/
(function () {
  "use strict";

  const H = window.Handout;
  const LIBRARY = H.LIBRARY;
  const STORAGE_KEY = "handout-builder:clinician";

  const $ = (sel) => document.querySelector(sel);
  const el = (tag, attrs = {}, ...children) => {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === false || v == null) continue;
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? "" : v);
    }
    children.flat().forEach((c) => c != null && node.append(c));
    return node;
  };

  // The handout being built. Kept in memory only, so it disappears when the tab closes.
  let programme = [];
  let activeArea = "All";
  // Optional stages: [{ name, when, move }]. Empty means no stages.
  let stages = [];

  function icon(path) {
    const s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = path;
    return s;
  }
  const ICONS = {
    up: '<path d="M6 15l6-6 6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    remove: '<path d="M6 6l12 12M18 6L6 18"/>',
    grip: '<circle cx="9" cy="6" r="1.4"/><circle cx="15" cy="6" r="1.4"/><circle cx="9" cy="12" r="1.4"/><circle cx="15" cy="12" r="1.4"/><circle cx="9" cy="18" r="1.4"/><circle cx="15" cy="18" r="1.4"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4h-9A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>'
  };

  // ---------- Library ----------
  // Favourites and recently added exercises: exercise ids only, kept in this browser (never patient details)
  const FAV_KEY = "handout-builder:favourites", RECENT_KEY = "handout-builder:recent";
  const readIds = (k) => { try { const v = JSON.parse(localStorage.getItem(k) || "[]"); return Array.isArray(v) ? v.filter((x) => typeof x === "string") : []; } catch (e) { return []; } };
  const writeIds = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } };
  let favourites = readIds(FAV_KEY);
  function toggleFavourite(ex) {
    favourites = favourites.includes(ex.id) ? favourites.filter((x) => x !== ex.id) : [ex.id, ...favourites];
    writeIds(FAV_KEY, favourites);
    toast(favourites.includes(ex.id) ? ex.name + " added to favourites" : ex.name + " removed from favourites");
    if (activeArea === "Favourites" && !favourites.length) activeArea = "All";
    renderFilters(); renderLibrary();
  }
  function noteRecent(ex) {
    const had = readIds(RECENT_KEY).length;
    writeIds(RECENT_KEY, [ex.id, ...readIds(RECENT_KEY).filter((x) => x !== ex.id)].slice(0, 12));
    if (!had) renderFilters();
  }

  const TYPES = ["Strength", "Stretch", "Movement", "Balance", "Breathing"];
  let activeType = "Any type";
  function renderFilters() {
    const special = [];
    if (favourites.some((id) => H.byId(id))) special.push("Favourites");
    if (readIds(RECENT_KEY).some((id) => H.byId(id))) special.push("Recent");
    if (!special.includes(activeArea) && (activeArea === "Favourites" || activeArea === "Recent")) activeArea = "All";
    const areas = ["All", ...special, ...new Set(LIBRARY.map((e) => e.area))];
    const box = $("#area-filters");
    box.innerHTML = "";
    areas.forEach((a) =>
      box.append(el("button", {
        type: "button", class: "chip" + (a === "Favourites" || a === "Recent" ? " chip-special" : ""), "aria-pressed": String(a === activeArea),
        text: a === "Favourites" ? "★ Favourites" : a,
        onclick: () => { activeArea = a; renderFilters(); renderLibrary(); if (window.RepSheetBodyMap) window.RepSheetBodyMap.refresh(); }
      }))
    );
    const types = $("#type-filters");
    if (types) {
      types.innerHTML = "";
      ["Any type", ...TYPES].forEach((t) => types.append(el("button", {
        type: "button", class: "chip chip-small", "aria-pressed": String(t === activeType), text: t,
        onclick: () => { activeType = t; renderFilters(); renderLibrary(); }
      })));
    }
  }
  // Called by the body map
  window.RepSheetSetArea = (a) => { activeArea = a; renderFilters(); renderLibrary(); };
  window.RepSheetArea = () => activeArea;

  // ---------- Search ----------
  // Exact words first. If nothing matches, allow small spelling slips ("hamstrng", "calve", "sholder").
  const searchText = (e) => (e.name + " " + e.area + " " + (e.type || "") + " " + (e.bodyArea || "") + " " + (e.aliases || "") + " " + e.instructions.join(" ") + (e.checked === false ? " awaiting check" : "")).toLowerCase();
  const stem = (w) => w.replace(/(ies)$/, "y").replace(/(es|s)$/, "");
  function near(a, b) {
    if (a === b) return true;
    if (Math.abs(a.length - b.length) > 1 || a.length < 4) return false;
    let i = 0, j = 0, edits = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++edits > 1) return false;
      if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; }
    }
    return edits + (a.length - i) + (b.length - j) <= 1;
  }
  function fuzzyMatch(text, q) {
    const words = text.split(/[^a-z0-9]+/).filter(Boolean).map(stem);
    return q.split(/\s+/).filter(Boolean).every((w) => { const sw = stem(w); return words.some((x) => x.startsWith(sw) || near(x, sw)); });
  }
  function libraryMatches() {
    const q = $("#search").value.trim().toLowerCase();
    const recent = readIds(RECENT_KEY);
    let pool = LIBRARY.filter((e) => activeType === "Any type" || e.type === activeType);
    if (activeArea === "Favourites") pool = favourites.map(H.byId).filter((e) => e && pool.includes(e));
    else if (activeArea === "Recent") pool = recent.map(H.byId).filter((e) => e && pool.includes(e));
    else if (activeArea !== "All") pool = pool.filter((e) => e.area === activeArea);
    if (!q) return { list: pool, fuzzy: false };
    const exact = pool.filter((e) => searchText(e).includes(q));
    if (exact.length) return { list: exact, fuzzy: false };
    return { list: pool.filter((e) => fuzzyMatch(searchText(e), q)), fuzzy: true };
  }

  // When a search finds an exercise by another name (e.g. "shoulder bridge" finds "Bridge"),
  // say which name matched. The exercise keeps its own name everywhere else.
  function alsoCalled(ex) {
    const q = $("#search").value.trim().toLowerCase();
    if (!q || !ex.aliases || ex.name.toLowerCase().includes(q)) return null;
    const names = String(ex.aliases).split(",").map((x) => x.trim()).filter(Boolean);
    const words = q.split(/\s+/).filter(Boolean);
    const hit = names.find((n) => n.toLowerCase().includes(q)) || names.find((n) => words.every((w) => n.toLowerCase().includes(w)));
    return hit ? el("div", { class: "also-called", text: "Also called: " + hit }) : null;
  }

  function renderLibrary() {
    const list = $("#library-list");
    list.innerHTML = "";
    const { list: matches, fuzzy } = libraryMatches();
    if (!matches.length) {
      list.append(el("li", { class: "lib-empty", text: activeArea === "Favourites" ? "Tap the star on any exercise to add it here." : "No exercises match your search." }));
      return;
    }
    if (fuzzy) list.append(el("li", { class: "lib-note", text: "No exact match. Showing close spellings." }));
    const inProgramme = new Set(programme.map((p) => p.id));
    matches.forEach((ex) => {
      const added = inProgramme.has(ex.id);
      const fav = favourites.includes(ex.id);
      list.append(el("li", { class: "lib-item" },
        el("button", { type: "button", class: "lib-preview", "aria-label": "Preview " + ex.name, title: "Preview", onclick: () => openPreview(ex) }, H.picture(ex, "thumb").el),
        el("div", { class: "meta" },
          el("button", { type: "button", class: "name name-btn", text: ex.name, title: "Preview " + ex.name, onclick: () => openPreview(ex) }),
          ex.checked === false ? el("span", { class: "awaiting-check", title: "New exercise. Not yet clinically checked.", text: "Awaiting check" }) : null,
          el("div", { class: "area" }, ex.custom ? (ex.bodyArea ? "My exercise · " + ex.bodyArea : "My exercise") : ex.area + (ex.type ? " · " + ex.type : ""), ex.video ? el("span", { class: "has-video", title: "Has a video" }, icon(ICONS.video)) : null),
          alsoCalled(ex)
        ),
        ex.custom ? el("button", { type: "button", class: "icon-btn own-edit", "aria-label": "Edit " + ex.name, title: "Edit", onclick: () => openOwn(ex) }, icon(ICONS.edit)) : null,
        el("button", { type: "button", class: "icon-btn fav" + (fav ? " on" : ""), "aria-pressed": String(fav), "aria-label": (fav ? "Remove " : "Add ") + ex.name + (fav ? " from" : " to") + " favourites", title: fav ? "Favourite" : "Add to favourites", onclick: () => toggleFavourite(ex) }, icon(ICONS.star)),
        el("button", {
          type: "button",
          class: "btn btn-secondary add" + (added ? " added" : ""),
          "aria-label": (added ? "Add another " : "Add ") + ex.name,
          text: added ? "Added ✓" : "Add",
          onclick: () => addExercise(ex)
        })
      ));
    });
  }

  // ---------- Preview a library exercise before adding it ----------
  function openPreview(ex) {
    const dlg = $("#preview-dialog");
    if (!dlg || typeof dlg.showModal !== "function") { addExercise(ex); return; }
    const body = $("#preview-body");
    body.innerHTML = "";
    const pic = H.picture(ex, "anim");
    body.append(
      el("div", { class: "preview-pic" }, H.mediaSwitch(ex, pic)),
      el("h2", { id: "preview-title", text: ex.name }),
      el("p", { class: "hint", text: [ex.area, ex.type].filter(Boolean).join(" · ") + (ex.checked === false ? " · Awaiting check" : "") }),
      el("ol", { class: "ex-steps" }, ex.instructions.map((t) => el("li", { text: t }))),
      ex.defaults && H.describe(ex.defaults) ? el("p", { class: "param-summary", text: "Starts at: " + H.describe(ex.defaults) }) : null,
      (ex.progressions || []).length ? el("div", { class: "preview-opts" }, el("b", { text: "Harder" }), el("ul", {}, ex.progressions.map((t) => el("li", { text: t })))) : null,
      (ex.regressions || []).length ? el("div", { class: "preview-opts" }, el("b", { text: "Easier" }), el("ul", {}, ex.regressions.map((t) => el("li", { text: t })))) : null
    );
    $("#preview-add").onclick = () => { dlg.close(); addExercise(ex); };
    dlg.showModal();
  }

  // ---------- Programme ----------
  let uid = 0;
  let enteringKey = null; // the card that has just been added, so only it animates in

  // ---------- Smooth card movement ----------
  // Before the list is redrawn, note where each card is on screen. After redrawing, each card starts
  // where it was and glides to its new place. Reading the live position means a move can be
  // interrupted by another click at any moment without a jump. Skipped if the person prefers less motion.
  const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function cardPositions() {
    const pos = new Map();
    $("#programme-list").querySelectorAll(".ex-card[data-key]").forEach((c) => pos.set(c.dataset.key, c.getBoundingClientRect().top));
    return pos;
  }
  function glideFrom(before) {
    if (reduceMotion() || !Element.prototype.animate) return;
    $("#programme-list").querySelectorAll(".ex-card[data-key]").forEach((c) => {
      const was = before.get(c.dataset.key);
      if (was == null) return;
      const dy = was - c.getBoundingClientRect().top;
      if (Math.abs(dy) < 1) return;
      c.animate([{ transform: "translateY(" + dy + "px)" }, { transform: "none" }],
        { duration: 380, easing: "cubic-bezier(.25, .9, .3, 1)" }); // close to a critically damped spring
    });
  }

  function addExercise(ex) {
    programme.push({
      key: ++uid,
      id: ex.id,
      sets: ex.defaults.sets ?? "",
      reps: ex.defaults.reps ?? "",
      hold: ex.defaults.hold ?? "",
      frequency: ex.defaults.frequency ?? "",
      notes: "",
      prog: [],
      reg: [],
      progText: "",
      regText: "",
      side: "",
      stage: stages.length ? (programme.length ? programme[programme.length - 1].stage || 1 : 1) : 0
    });
    enteringKey = uid;
    renderProgramme();
    enteringKey = null;
    renderLibrary();
    changed();
    noteRecent(ex);
    toast(ex.name + " added");
  }

  // Up and down arrows (dragging was removed at Alex's request, 17 Nov 2026: it wasn't smooth)
  function move(index, delta) {
    moveTo(index, index + delta, delta < 0 ? ".move-up" : ".move-down");
  }

  // Move one exercise to a new position (used by the up and down buttons)
  function moveTo(from, to, focusSelector) {
    if (to < 0 || to >= programme.length || to === from) return;
    const before = cardPositions();
    const [item] = programme.splice(from, 1);
    programme.splice(to, 0, item);
    renderProgramme();
    glideFrom(before);
    changed();
    const card = $("#programme-list").children[to];
    if (card) {
      card.classList.add("just-moved");
      setTimeout(() => card.classList.remove("just-moved"), 900);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      card.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
      if (focusSelector) {
        let f = card.querySelector(focusSelector);
        if (f && f.disabled) f = card.querySelector(focusSelector === ".move-up" ? ".move-down" : ".move-up");
        if (f && !f.disabled) f.focus({ preventScroll: true });
      }
    }
    const ex = H.byId(item.id);
    toast((ex ? ex.name : "Exercise") + " moved to position " + (to + 1));
  }


  function removeAt(index) {
    const card = $("#programme-list").children[index];
    const finish = () => {
      const i = programme.indexOf(item);
      if (i < 0) return;
      const before = cardPositions();
      programme.splice(i, 1);
      renderProgramme();
      glideFrom(before);
      afterRemove(item, i);
    };
    const item = programme[index];
    if (!item) return;
    // Leave the way it came in (fade and drop slightly), then close the gap
    if (card && !reduceMotion() && card.animate) {
      card.style.pointerEvents = "none";
      card.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(6px) scale(.985)" }],
        { duration: 160, easing: "cubic-bezier(.4, 0, 1, 1)", fill: "forwards" }).finished.then(finish, finish);
    } else finish();
  }
  function afterRemove(gone, at) {
    renderLibrary();
    changed();
    const ex = H.byId(gone.id);
    undoToast((ex ? ex.name : "Exercise") + " removed", () => {
      enteringKey = gone.key;
      programme.splice(Math.min(at, programme.length), 0, gone);
      renderProgramme();
      enteringKey = null;
      renderLibrary();
      changed();
    });
  }

  // ---------- Undo ----------
  // Removing an exercise or clearing the handout can be undone for 8 seconds (button, or Ctrl+Z).
  let undoTimer, undoFn = null;
  function undoToast(msg, fn) {
    const bar = $("#undo-bar");
    $("#undo-msg").textContent = msg;
    undoFn = fn;
    bar.hidden = false;
    requestAnimationFrame(() => bar.classList.add("show"));
    clearTimeout(undoTimer);
    undoTimer = setTimeout(hideUndo, 8000);
  }
  function hideUndo() { const bar = $("#undo-bar"); bar.classList.remove("show"); undoFn = null; setTimeout(() => { if (!undoFn) bar.hidden = true; }, 250); }
  function runUndo() { const fn = undoFn; hideUndo(); if (fn) { fn(); toast("Undone"); } }

  // The big-number dosage box on the printed handout: "10 times · 3 rounds · 5 seconds hold"
  function fillDose(box, item) {
    if (!box) return box;
    box.innerHTML = "";
    const sets = Number(item.sets), reps = Number(item.reps), hold = Number(item.hold);
    const cells = [];
    if (reps > 1) cells.push([reps, "times"]);
    if (sets > 1) cells.push([sets, sets === 1 ? "round" : "rounds"]);
    if (hold) cells.push([hold + "s", "hold"]);
    const row = el("div", { class: "dose-nums" }, cells.map(([n, w]) => el("div", { class: "dose-cell" }, el("b", { text: String(n) }), el("span", { text: w }))));
    if (cells.length) box.append(row);
    const freq = String(item.frequency || "").trim();
    const load = String(item.load || "").trim();
    const side = H.sideLabel(item);
    if (side) box.prepend(el("p", { class: "dose-side", text: side }));
    if (load) box.append(el("p", { class: "dose-load", text: "Use: " + load }));
    if (freq) box.append(el("p", { class: "dose-freq", text: freq }));
    box.hidden = !cells.length && !freq && !load && !side;
    return box;
  }

  // Left, right or both. Shown before the dose ("Left side · 10 times, 3 rounds") on the handout and patient page.
  function sideField(item) {
    const id = "side-" + item.key;
    const sel = el("select", { id, onchange: (e) => {
      item.side = e.target.value;
      const card = e.target.closest(".ex-card");
      if (card) { card.querySelector(".param-summary").textContent = H.describe(item); fillDose(card.querySelector(".dose-panel"), item); }
      changed();
    } }, el("option", { value: "", text: "Not set" }), Object.entries(H.SIDES).map(([v, t]) => el("option", { value: v, text: t })));
    sel.value = item.side || "";
    return el("div", { class: "field side" }, el("label", { for: id, text: "Side" }), sel);
  }

  // Which stage an exercise belongs to. Changing it keeps each stage's exercises together.
  function stageField(item) {
    const id = "stage-" + item.key;
    const sel = el("select", { id, onchange: (e) => {
      item.stage = Number(e.target.value) || 1;
      sortByStage();
      renderProgramme();
      changed();
      const card = $('#programme-list .ex-card[data-key="' + item.key + '"]');
      if (card) { card.scrollIntoView({ block: "nearest" }); const f = card.querySelector("#" + id); if (f) f.focus(); }
    } }, stages.map((s, n) => el("option", { value: String(n + 1), text: s.name })));
    sel.value = String(item.stage || 1);
    return el("div", { class: "field stage" }, el("label", { for: id, text: "Stage" }), sel);
  }
  function sortByStage() {
    if (!stages.length) return;
    programme = programme.map((it, i) => [it, i]).sort((a, b) => ((a[0].stage || 1) - (b[0].stage || 1)) || (a[1] - b[1])).map((x) => x[0]);
  }
  function renderStages() {
    const box = $("#stage-editor");
    $("#use-stages").checked = stages.length > 0;
    box.hidden = !stages.length;
    box.innerHTML = "";
    stages.forEach((st, n) => {
      const last = n === stages.length - 1;
      const upd = (key) => (e) => { st[key] = e.target.value; changed(); };
      box.append(el("fieldset", { class: "stage-row" },
        el("legend", { text: "Stage " + (n + 1) }),
        el("div", { class: "stage-grid" },
          el("label", {}, "Name", el("input", { type: "text", maxlength: "40", value: st.name, oninput: upd("name"), onchange: () => renderProgramme() })),
          el("label", {}, "When", el("input", { type: "text", maxlength: "60", value: st.when, placeholder: n === 0 ? "e.g. Weeks 0 to 2" : "e.g. Weeks 2 to 6", oninput: upd("when"), onchange: () => renderProgramme() }))
        ),
        last ? null : el("label", { class: "stage-move-field" }, "Move on when (optional)",
          el("textarea", { rows: "2", maxlength: "240", placeholder: "e.g. You can stand up from a chair without using your hands", oninput: upd("move"), onchange: () => renderProgramme() }, st.move)),
        stages.length > 2 ? el("button", { type: "button", class: "btn btn-ghost stage-remove", text: "Remove this stage", onclick: () => {
          stages.splice(n, 1);
          programme.forEach((it) => { if (it.stage > n + 1) it.stage--; else if (it.stage === n + 1) it.stage = Math.max(1, n); });
          sortByStage(); renderStages(); renderProgramme(); changed();
        } }) : null
      ));
    });
    if (stages.length && stages.length < 6) box.append(el("button", { type: "button", class: "btn btn-secondary", text: "+ Add a stage", onclick: () => {
      stages.push({ name: "Stage " + (stages.length + 1), when: "", move: "" }); renderStages(); renderProgramme(); changed();
    } }));
    if (stages.length) box.append(el("p", { class: "hint", text: "Pick each exercise's stage on its card. The patient sees one stage at a time and chooses when to move on. Names and “move on when” go in the link, so no patient details." }));
  }

  // A copy of the exercise straight after it, with the same settings (handy for left and right with different doses)
  function duplicateAt(index) {
    const src = programme[index];
    if (!src) return;
    const copy = JSON.parse(JSON.stringify(src));
    copy.key = ++uid;
    if (src.side === "l") copy.side = "r"; else if (src.side === "r") copy.side = "l";
    programme.splice(index + 1, 0, copy);
    enteringKey = copy.key;
    renderProgramme();
    enteringKey = null;
    renderLibrary();
    changed();
    const ex = H.byId(src.id);
    toast((ex ? ex.name : "Exercise") + " duplicated");
  }

  function paramField(item, key, label, type, cls, placeholder) {
    const id = "p-" + item.key + "-" + key;
    const input = el("input", {
      id, type, value: item[key] || "", placeholder: placeholder || null,
      min: type === "number" ? "0" : null, inputmode: type === "number" ? "numeric" : null,
      oninput: (e) => {
        item[key] = e.target.value;
        const card = input.closest(".ex-card");
        card.querySelector(".param-summary").textContent = H.describe(item);
        fillDose(card.querySelector(".dose-panel"), item);
        updateSummary();
        changed();
      }
    });
    return el("div", { class: "field " + (cls || "") }, el("label", { for: id, text: label }), input);
  }

  // Ticks for "make it harder / easier". Only ticked options go on the handout.
  // extra() gives the physio's own written line (free-text progression), printed after the ticked ones.
  function optionList(item, ex, key, listKey, title, extra) {
    const options = ex[listKey] || [];
    if (!options.length && !extra) return null;
    const printList = el("ul");
    const printBox = el("div", { class: "print-only options-print" }, el("strong", { text: title + ":" }), printList);
    const refreshPrint = () => {
      printList.innerHTML = "";
      item[key].slice().sort((a, b) => a - b).forEach((i) => printList.append(el("li", { text: options[i] })));
      const own = extra ? String(extra() || "").trim() : "";
      if (own) printList.append(el("li", { text: own }));
      printBox.hidden = !printList.children.length;
    };
    refreshPrint();
    if (!options.length) return [null, printBox, refreshPrint];
    const group = el("fieldset", { class: "options no-print" }, el("legend", { text: title }),
      options.map((text, i) => {
        const id = "o-" + item.key + "-" + key + "-" + i;
        return el("div", { class: "check" },
          el("input", {
            type: "checkbox", id, checked: item[key].includes(i),
            onchange: (e) => {
              item[key] = e.target.checked ? [...item[key], i] : item[key].filter((x) => x !== i);
              refreshPrint();
              changed();
            }
          }),
          el("label", { for: id, text })
        );
      })
    );
    return [group, printBox, refreshPrint];
  }

  function updateSummary() {
    const n = programme.length;
    $("#programme-summary").hidden = !n;
    $("#programme-summary").textContent = n ? n + " exercise" + (n === 1 ? "" : "s") + " · about " + H.estimateMinutes(programme) + " minutes each time" : "";
    $("#too-many-tip").hidden = n <= 5;
  }

  function renderProgramme() {
    const list = $("#programme-list");
    list.innerHTML = "";
    $("#empty-state").hidden = programme.length > 0;
    updateSummary();

    programme.forEach((item, i) => {
      const ex = H.byId(item.id);
      if (!ex) return;
      const notesId = "n-" + item.key;
      const notesPrint = el("p", { class: "print-only", text: item.notes });
      const harder = optionList(item, ex, "prog", "progressions", "To make it harder", () => item.progText);
      const easier = optionList(item, ex, "reg", "regressions", "To make it easier", () => item.regText);
      const optionCount = (ex.progressions || []).length + (ex.regressions || []).length;
      const ticked = item.prog.length + item.reg.length;
      // The physio's own progression and regression, in their words. They go in the link, so no patient details.
      const ownBox = (prop, id, label, placeholder, refresh) => el("div", { class: "own-prog-field" },
        el("label", { for: id, text: label }),
        el("textarea", {
          id, class: "own-prog-text", "data-prop": prop, rows: "2", maxlength: "300", placeholder, "aria-describedby": "own-hint-" + item.key,
          oninput: (e) => { item[prop] = e.target.value; refresh(); changed(); }
        })
      );

      const st = stages.length ? stages[(item.stage || 1) - 1] : null;
      const firstOfStage = st && (i === 0 || (programme[i - 1].stage || 1) !== (item.stage || 1));
      list.append(el("li", { class: "ex-card" + (item.key === enteringKey ? " entering" : "") + (firstOfStage ? " stage-first" : ""), "data-key": item.key, "data-id": item.id },
        firstOfStage ? el("div", { class: "stage-head" },
          el("span", { class: "stage-name", text: st.name }), st.when ? el("span", { class: "stage-when", text: st.when }) : null,
          st.move ? el("p", { class: "stage-move", text: "Move on to the next stage when: " + st.move }) : null) : null,
        el("div", { class: "ex-media no-print" }, H.mediaSwitch(ex, H.picture(ex, "anim", { offset: i * 0.4 }))),
        el("div", { class: "ex-body" },
          el("div", { class: "ex-top" },
            el("h3", { class: "ex-title", text: ex.name }),
            el("div", { class: "ex-tools no-print" },
              el("button", { type: "button", class: "icon-btn move-btn move-up", "aria-label": "Move " + ex.name + " up", title: "Move up", hidden: programme.length < 2, onclick: () => move(i, -1), disabled: i === 0 }, icon(ICONS.up)),
              el("button", { type: "button", class: "icon-btn move-btn move-down", "aria-label": "Move " + ex.name + " down", title: "Move down", hidden: programme.length < 2, onclick: () => move(i, 1), disabled: i === programme.length - 1 }, icon(ICONS.down)),
              el("button", { type: "button", class: "icon-btn duplicate", "aria-label": "Duplicate " + ex.name, title: "Duplicate (for example to give left and right different doses)", onclick: () => duplicateAt(i) }, icon(ICONS.copy)),
              el("button", { type: "button", class: "icon-btn remove", "aria-label": "Remove " + ex.name, title: "Remove", onclick: () => removeAt(i) }, icon(ICONS.remove))
            )
          ),
          ex.custom ? el("p", { class: "own-label" }, el("span", { class: "no-print", text: "Your own exercise · not checked by RepSheet" }), el("span", { class: "print-only", text: "Written by your physio" })) : null,
          el("div", { class: "print-only ex-steps-pics" }, H.picture(ex, "steps").el),
          el("ol", { class: "ex-steps" }, ex.instructions.map((s) => el("li", { text: s })))
        ),
        // Dose, note and progressions run the full width of the card, so there's no gap under the picture
        el("div", { class: "ex-more" },
          el("div", { class: "params" },
            paramField(item, "sets", "Sets", "number"),
            paramField(item, "reps", "Reps", "number"),
            paramField(item, "hold", "Hold (secs)", "number"),
            paramField(item, "frequency", "How often", "text", "freq"),
            paramField(item, "load", "Weight or band", "text", "load", "e.g. 2 kg"),
            sideField(item),
            stages.length ? stageField(item) : null
          ),
          el("p", { class: "param-summary", text: H.describe(item) }),
          fillDose(el("div", { class: "print-only dose-panel" }), item),
          H.equipment(ex).length ? el("p", { class: "print-only print-kit" }, el("strong", { text: "You'll need: " }), H.equipment(ex).join(", ")) : null,
          el("div", { class: "field ex-notes" },
            // Folded away until needed, to keep the card short (opens by itself when there is a note)
            el("details", { class: "note-toggle no-print", open: !!item.notes },
              el("summary", {}, "Note for this exercise ", el("span", { class: "hint", text: "(optional)" })),
              el("label", { for: notesId, class: "visually-hidden", text: "Note for this exercise" }),
              el("textarea", {
                id: notesId, rows: "2", placeholder: "e.g. Use a 2kg weight. Keep pain below 3 out of 10.",
                oninput: (e) => { item.notes = e.target.value; notesPrint.textContent = e.target.value; changed(); }
              })
            ),
            notesPrint
          ),
          el("details", { class: "progressions no-print", open: ticked > 0 || !!item.progText || !!item.regText },
            el("summary", {}, "Progressions and regressions ",
              el("span", { class: "hint", text: optionCount ? "(tick, or write your own)" : "(optional)" })),
            optionCount ? el("div", { class: "options-grid" }, harder && harder[0], easier && easier[0]) : null,
            el("div", { class: "own-prog" },
              el("div", { class: "own-prog-grid" },
                ownBox("progText", "pt-" + item.key, "Your own progression", "e.g. When this feels easy, hold a 1 kg weight", harder[2]),
                ownBox("regText", "rt-" + item.key, "Your own regression", "e.g. If this is too hard, hold on to a chair", easier[2])
              ),
              el("p", { class: "hint", id: "own-hint-" + item.key, text: "These show under \u201cTo make it harder\u201d and \u201cTo make it easier\u201d. Please don\u2019t include any patient details." })
            )
          ),
          harder && harder[1], easier && easier[1]
        )
      ));
      // Simple view: say what else is set on this exercise, so nothing is hidden by surprise
      const extras = [];
      if (item.side) extras.push(H.sideLabel(item).toLowerCase());
      if (item.load) extras.push(item.load);
      if (item.notes) extras.push("a note");
      const pr = (item.prog || []).length + (item.reg || []).length + (item.progText ? 1 : 0) + (item.regText ? 1 : 0);
      if (pr) extras.push(pr + (pr === 1 ? " progression or regression" : " progressions and regressions"));
      if (st) extras.push(st.name);
      if (extras.length) list.lastChild.querySelector(".ex-more").append(el("p", { class: "ex-extras no-print", text: "Also set: " + extras.join(", ") }));
      list.lastChild.querySelector("textarea").value = item.notes;
      list.lastChild.querySelectorAll(".own-prog-text").forEach((t) => { t.value = item[t.dataset.prop] || ""; });
    });
  }

  // ---------- Patient link and QR code ----------
  let currentLink = "";
  let linkTimer;
  function changed() {
    clearTimeout(linkTimer);
    linkTimer = setTimeout(updateLink, 250);
    saveDraftSoon();
    const m = $("#patient-message"), mc = $("#message-count");
    if (m && mc) mc.textContent = String(m.maxLength - m.value.length);
  }

  // ---------- Keep the handout if the page is refreshed ----------
  // Saved in this browser tab only (sessionStorage). It survives a refresh, and is wiped
  // when the tab or browser is closed, so nothing about a patient stays on the computer.
  const DRAFT_KEY = "repsheet:draft";
  let draftTimer = null, draftReady = false;
  function saveDraftSoon() { clearTimeout(draftTimer); draftTimer = setTimeout(saveDraft, 300); }
  function saveDraft() {
    if (!draftReady) return;
    try {
      const empty = !programme.length && !$("#patient-name").value.trim() && !$("#general-notes").value.trim();
      if (empty) { sessionStorage.removeItem(DRAFT_KEY); return; }
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
        v: 1, t: templateData(),
        name: $("#patient-name").value, date: $("#handout-date").value,
        c: $("#clinician").value, ct: $("#contact").value,
        goal: $("#goal").value, plan: $("#plan").value, msg: $("#patient-message").value
      }));
    } catch (e) { /* storage unavailable or full: carry on without it */ }
  }
  function restoreDraft() {
    let d = null;
    try { d = JSON.parse(sessionStorage.getItem(DRAFT_KEY) || "null"); } catch (e) { d = null; }
    if (!d || !d.t || !Array.isArray(d.t.x) || !d.t.x.length) return false;
    try { applyTemplate(d.t, true); } catch (e) { return false; }
    $("#patient-name").value = d.name || "";
    if (d.date) $("#handout-date").value = d.date;
    if (d.c) $("#clinician").value = d.c;
    if (d.ct) $("#contact").value = d.ct;
    $("#goal").value = d.goal || "";
    $("#plan").value = d.plan || "";
    $("#patient-message").value = d.msg || "";
    ["#patient-name", "#goal", "#plan", "#patient-message", "#clinician", "#contact"].forEach((sel) => $(sel).dispatchEvent(new Event("input", { bubbles: true })));
    changed();
    toast("Your handout is back as you left it. Press Clear to start a new one.", 5000);
    return true;
  }

  function programmeData() {
    // Patient name is deliberately NOT included in the link.
    return {
      d: $("#handout-date").value,
      c: $("#clinician").value.trim(),
      t: $("#contact").value.trim(),
      g: $("#general-notes").value.trim(),
      x: programme.map(H.packItem),
      ...ownDefs(),
      // Physio's short message to this patient (shown at the top). Not kept in templates.
      ...($("#patient-message").value.trim() ? { pm: $("#patient-message").value.trim() } : {}),
      ...($("#goal").value.trim() ? { go: $("#goal").value.trim() } : {}),
      ...($("#plan").value.trim() ? { pl: $("#plan").value.trim() } : {}),
      ...($("#large-print").checked ? { lp: 1 } : {}),
      ...($("#easy-read").checked ? { er: 1 } : {}),
      ...($("#tick-chart").checked ? { tc: 1 } : {}),
      ...($("#check-in").checked ? { ci: 1 } : {}),
      ...(stages.length ? { st: H.packStages(stages) } : {}),
      ...($("#pain-guide").checked ? { pg: Number($("#pain-level").value) || 1 } : {}),
      ...($("#duration").value.trim() ? { du: $("#duration").value.trim() } : {}),
      // Patient's language (i18n-builder.js): just a code like "pl", and whether to show English too
      ...(window.RepSheetI18nBuilder ? window.RepSheetI18nBuilder.linkData() : {})
    };
  }

  async function updateLink() {
    const box = $("#share");
    if (!programme.length) { currentLink = ""; box.hidden = true; $("#print-qr").hidden = true; $("#btn-copy-patient").disabled = true; return; }
    const data = programmeData();
    const code = await H.encode(data);
    if (window.RepSheetI18nBuilder) window.RepSheetI18nBuilder.update(data);
    const url = new URL("view.html", location.href);
    url.hash = code;
    currentLink = url.href;
    $("#btn-copy-patient").disabled = false;
    box.hidden = false;
    $("#share-link").value = currentLink;
    $("#share-open").href = currentLink;
    $("#share-local").hidden = location.protocol !== "file:";

    let svg = "";
    for (const level of ["M", "L"]) {
      try {
        const qr = qrcode(0, level);
        qr.addData(currentLink);
        qr.make();
        svg = qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true, alt: "QR code linking to the patient's exercise page" });
        break;
      } catch (e) { /* too long for this level: try the next */ }
    }
    $("#share-qr").innerHTML = svg || '<p class="hint">Too much text for a QR code. Shorten the notes to get one.</p>';
    $("#print-qr-code").innerHTML = svg;
    $("#print-qr").hidden = !svg;
  }

  // Both "Copy" buttons (patient link box, and "Copy patient page link" in the actions row).
  // The button itself says "Copied!" for a moment, so it's clear it worked.
  async function copyLink(e) {
    const btn = e && e.currentTarget;
    if (!programme.length || !currentLink) { toast("Add at least one exercise first"); return; }
    await updateLink(); // make sure the link has the very latest changes
    let ok = false;
    try { await navigator.clipboard.writeText(currentLink); ok = true; } catch (err) {
      // Older browsers: copy from a hidden selection instead
      const box = $("#share-link");
      box.value = currentLink;
      box.select();
      try { ok = document.execCommand("copy"); } catch (err2) { ok = false; }
    }
    if (!ok) { $("#share-link").select(); toast("Press Ctrl+C to copy"); return; }
    toast("Patient page link copied");
    if (btn) {
      if (!btn.dataset.label) btn.dataset.label = btn.textContent;
      btn.textContent = "Copied!";
      btn.classList.add("copied");
      clearTimeout(btn._copiedTimer);
      btn._copiedTimer = setTimeout(() => { btn.textContent = btn.dataset.label; btn.classList.remove("copied"); }, 2000);
    }
  }

  // ---------- Share as template ----------
  // A template link holds only the exercises, their settings and notes, and the general advice.
  // It never holds the patient's name, the date or the physio's contact details.
  function templateData() {
    const name = $("#template-name").value.trim();
    return {
      n: name || undefined,
      g: $("#general-notes").value.trim() || undefined,
      x: programme.map(H.packItem),
      ...ownDefs(),
      ...($("#large-print").checked ? { lp: 1 } : {}),
      ...($("#easy-read").checked ? { er: 1 } : {}),
      ci: $("#check-in").checked ? 1 : 0,
      ...(stages.length ? { st: H.packStages(stages) } : {}),
      ...($("#tick-chart").checked ? { tc: 1 } : {}),
      ...($("#pain-guide").checked ? {} : { npg: 1 }),
      ...($("#pain-level").value !== "1" ? { pgl: Number($("#pain-level").value) } : {}),
      ...($("#duration").value.trim() ? { du: $("#duration").value.trim() } : {}),
      ...($("#bw-print").checked ? { bw: 1 } : {}),
      ...($("#paper-saver").checked ? { ps: 1 } : {})
    };
  }

  async function updateTemplateLink() {
    const url = new URL("builder.html", location.href);
    url.hash = "t=" + await H.encode(templateData());
    $("#template-link").value = url.href;
  }

  async function openTemplate() {
    if (!programme.length) { toast("Add at least one exercise first"); return; }
    $("#template-local").hidden = location.protocol !== "file:";
    await updateTemplateLink();
    $("#template-dialog").showModal();
    $("#template-name").focus();
  }

  async function copyTemplate() {
    await updateTemplateLink();
    try {
      await navigator.clipboard.writeText($("#template-link").value);
      toast("Template link copied");
    } catch (e) {
      $("#template-link").select();
      toast("Press Ctrl+C to copy");
    }
  }

  // Fill the builder from template data (from a link or from My templates).
  // Every option is set, so nothing is left over from the previous handout.
  // The patient's name, goal and plan are cleared: they belong to the last patient.
  function applyTemplate(data, quiet) {
    // Own exercises in a template from another computer are added for now (not saved) so they can be used
    H.registerCustom((data.cx || []).map(H.unpackCustom).filter(Boolean));
    renderFilters();
    const items = (data.x || []).map(H.unpackItem).filter((it) => H.byId(it.id));
    if (!items.length) throw new Error("No exercises");
    programme = items.map((it) => Object.assign(it, { key: ++uid }));
    $("#patient-name").value = "";
    $("#goal").value = "";
    $("#plan").value = "";
    $("#patient-message").value = "";
    $("#general-notes").value = data.g || "";
    $("#duration").value = data.du || "";
    const set = (id, on, cls) => { $(id).checked = !!on; if (cls) document.body.classList.toggle(cls, !!on); };
    set("#large-print", data.lp, "large-print");
    set("#easy-read", data.er, "easy-read");
    set("#tick-chart", data.tc); $("#print-ticks").hidden = !data.tc;
    set("#check-in", data.ci == null ? true : data.ci);
    stages = H.unpackStages(data.st);
    renderStages();
    set("#pain-guide", false); $("#print-pain").hidden = true; // pain guide removed (16 Nov 2026)
    $("#pain-level").value = String(data.pgl || 1); applyPainLevel();
    set("#bw-print", data.bw, "bw-print");
    set("#paper-saver", data.ps, "paper-saver");
    $("#template-name").value = data.n || "";
    renderProgramme();
    renderLibrary();
    changed();
    if (quiet) return;
    toast("Template loaded" + (data.n ? ": " + data.n : "") + " (" + items.length + " exercise" + (items.length === 1 ? "" : "s") + ")", 4000);
  }

  // ---------- My own exercises (kept in this browser only) ----------
  // Only the physio's own wording and an optional photo. Never anything about a patient.
  const OWN_KEY = "handout-builder:own-exercises";
  function cleanOwn(o) {
    const ex = o && H.unpackCustom(H.packCustom(o));
    if (!ex) return null;
    const num = (v) => (v === "" || v == null || isNaN(Number(v)) ? "" : String(Math.max(0, Math.round(Number(v)))));
    const d = o.defaults || {};
    ex.defaults = { sets: num(d.sets), reps: num(d.reps), hold: num(d.hold), frequency: String(d.frequency || "").slice(0, 40) };
    ex.image = typeof o.image === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(o.image) ? o.image : "";
    return ex;
  }
  function readOwn() {
    try { const t = JSON.parse(localStorage.getItem(OWN_KEY) || "[]"); return Array.isArray(t) ? t.map(cleanOwn).filter(Boolean) : []; }
    catch (e) { return []; }
  }
  function writeOwn(list) {
    try { localStorage.setItem(OWN_KEY, JSON.stringify(list)); return true; }
    catch (e) { toast("This browser couldn't save it. If you added a photo, try a smaller one.", 5000); return false; }
  }
  function ownDefs() {
    const cx = H.customDefs(programme);
    return cx.length ? { cx } : {};
  }

  let ownEditing = null, ownPhoto = "";
  function showOwnPhoto() {
    const box = $("#own-photo-preview");
    box.innerHTML = ""; box.hidden = !ownPhoto; $("#own-photo-remove").hidden = !ownPhoto;
    if (ownPhoto) box.append(el("img", { src: ownPhoto, alt: "Your picture" }));
  }
  function openOwn(ex) {
    ownEditing = ex || null;
    $("#own-title").textContent = ex ? "Edit your exercise" : "Make your own exercise";
    $("#own-name").value = ex ? ex.name : "";
    $("#own-steps").value = ex ? ex.instructions.join("\n") : "";
    const d = (ex && ex.defaults) || {};
    $("#own-sets").value = d.sets || ""; $("#own-reps").value = d.reps || ""; $("#own-hold").value = d.hold || ""; $("#own-freq").value = d.frequency || "";
    const sel = $("#own-like");
    sel.innerHTML = "";
    sel.append(el("option", { value: "", text: "None (a plain placeholder)" }));
    const stock = LIBRARY.filter((e) => !e.custom);
    [...new Set(stock.map((e) => e.area))].forEach((area) => {
      sel.append(el("optgroup", { label: area }, stock.filter((e) => e.area === area).map((e) => el("option", { value: e.id, text: e.name }))));
    });
    sel.value = (ex && ex.like) || "";
    ownPhoto = (ex && ex.image) || ""; $("#own-photo").value = ""; showOwnPhoto();
    $("#own-delete").hidden = !ex;
    $("#own-dialog").showModal();
    $("#own-name").focus();
  }
  // Shrink a photo so it fits comfortably in the browser's storage (longest side 640 pixels)
  function shrinkPhoto(file) {
    return new Promise((resolve, reject) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        const k = Math.min(1, 640 / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        const g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
        g.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
      img.src = url;
    });
  }
  function saveOwn(addAfter) {
    const name = $("#own-name").value.trim();
    const steps = $("#own-steps").value.split("\n").map((t) => t.trim()).filter(Boolean);
    if (!name || !steps.length) return false;
    const id = ownEditing ? ownEditing.id : "my-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    const like = $("#own-like").value;
    const ex = cleanOwn({
      id, name, instructions: steps, like, bodyArea: like ? (H.byId(like) || {}).area || "" : "",
      image: ownPhoto,
      defaults: { sets: $("#own-sets").value, reps: $("#own-reps").value, hold: $("#own-hold").value, frequency: $("#own-freq").value.trim() }
    });
    if (!ex) return false;
    const mine = readOwn();
    const i = mine.findIndex((m) => m.id === id);
    if (i >= 0) mine[i] = ex; else mine.unshift(ex);
    if (!writeOwn(mine)) return false;
    H.registerCustom([ex], true);
    renderFilters(); renderLibrary(); renderProgramme(); changed();
    if (addAfter) addExercise(ex); else toast((ownEditing ? "Saved changes to " : "Saved ") + ex.name);
    return true;
  }
  function deleteOwn() {
    if (!ownEditing) return;
    const ex = ownEditing;
    writeOwn(readOwn().filter((m) => m.id !== ex.id));
    const used = programme.some((p) => p.id === ex.id);
    programme = programme.filter((p) => p.id !== ex.id);
    H.unregisterCustom(ex.id);
    if (activeArea === H.OWN_AREA && !LIBRARY.some((e) => e.custom)) activeArea = "All";
    $("#own-dialog").close();
    renderFilters(); renderLibrary(); renderProgramme(); changed();
    toast("Deleted " + ex.name + (used ? " (and took it off this handout)" : ""), 4000);
  }

  // ---------- My templates (kept in this browser only) ----------
  const TEMPLATES_KEY = "handout-builder:templates";
  function readTemplates() {
    try { const t = JSON.parse(localStorage.getItem(TEMPLATES_KEY) || "[]"); return Array.isArray(t) ? t : []; }
    catch (e) { return []; }
  }
  function writeTemplates(list) {
    try { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(list)); return true; }
    catch (e) { toast("This browser won't let the site save templates. Use Share as template instead.", 4000); return false; }
  }
  const countText = (t) => { const n = (t.data && t.data.x || []).length; return n + " exercise" + (n === 1 ? "" : "s"); };

  function renderMyTemplates() {
    const list = readTemplates().sort((a, b) => a.name.localeCompare(b.name));
    const ul = $("#mt-list");
    ul.innerHTML = "";
    if (!list.length) ul.append(el("li", { class: "mt-empty", text: "No saved templates yet." }));
    list.forEach((t) => ul.append(el("li", { class: "mt-item" },
      el("div", { class: "mt-meta" }, el("strong", { text: t.name }), el("span", { class: "hint", text: countText(t) + " · saved " + H.formatDate(String(t.saved || "").slice(0, 10)) })),
      el("button", { type: "button", class: "btn btn-secondary", text: "Use", "aria-label": "Use template " + t.name, onclick: () => useTemplate(t) }),
      el("button", { type: "button", class: "icon-btn remove", title: "Delete", "aria-label": "Delete template " + t.name, onclick: () => deleteTemplate(t.name) }, icon(ICONS.remove))
    )));
    const box = $("#empty-templates-list");
    box.innerHTML = "";
    list.slice(0, 8).forEach((t) => box.append(el("button", { type: "button", class: "mt-chip", onclick: () => useTemplate(t) }, t.name, el("span", { text: countText(t) }))));
    $("#empty-templates").hidden = !list.length;
  }

  // ---------- Ready-made starter templates (starters.js) ----------
  const STARTERS = window.STARTERS || [];
  function starterData(s) {
    const x = s.ids.map((id) => {
      const ex = H.byId(id);
      if (!ex) return null;
      const d = Object.assign({}, ex.defaults, (s.dose || {})[id] || {});
      return H.packItem({ id, sets: d.sets ?? "", reps: d.reps ?? "", hold: d.hold ?? "", frequency: d.frequency ?? "" });
    }).filter(Boolean);
    return {
      n: s.name, x, g: s.advice || undefined, du: s.keepGoing || undefined,
      ...(s.pain && s.pain !== 1 ? { pgl: s.pain } : {}),
      ...(s.tickChart ? { tc: 1 } : {})
    };
  }
  function useStarter(i) {
    const s = STARTERS[i];
    if (!s) return;
    if (useTemplate({ name: s.name, data: starterData(s) })) {
      toast("Loaded \"" + s.name + "\". It's a starting point: check it suits your patient.", 5000);
    }
  }
  function renderStarters() {
    const sel = $("#starter-select");
    STARTERS.forEach((s, i) => sel.append(el("option", { value: String(i), text: s.name })));
    const ul = $("#starter-list");
    STARTERS.forEach((s, i) => ul.append(el("li", { class: "mt-item" },
      el("div", { class: "mt-meta" }, el("strong", { text: s.name }), el("span", { class: "hint", text: s.about + " · " + s.ids.length + " exercises" })),
      el("button", { type: "button", class: "btn btn-secondary", text: "Use", "aria-label": "Use ready-made template " + s.name, onclick: () => useStarter(i) })
    )));
  }

  function openMyTemplates() {
    $("#mt-name").value = $("#template-name").value;
    renderMyTemplates();
    $("#my-templates-dialog").showModal();
    (programme.length ? $("#mt-name") : $("#my-templates-dialog .dialog-actions button")).focus();
  }

  function saveMyTemplate() {
    if (!programme.length) { toast("Add at least one exercise first"); return; }
    const name = $("#mt-name").value.trim();
    if (!name) { toast("Give the template a name"); $("#mt-name").focus(); return; }
    const list = readTemplates();
    const existing = list.findIndex((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing >= 0 && !window.confirm('Replace your saved template "' + list[existing].name + '"?')) return;
    $("#template-name").value = name;
    const entry = { name, saved: new Date().toISOString(), data: JSON.parse(JSON.stringify(templateData())) };
    if (existing >= 0) list[existing] = entry; else list.push(entry);
    if (writeTemplates(list)) { renderMyTemplates(); toast("Saved: " + name); }
  }

  function useTemplate(t) {
    const busy = programme.length || $("#patient-name").value.trim();
    if (busy && !window.confirm("Start a new handout from \"" + t.name + "\"? The current handout will be replaced.")) return false;
    try { applyTemplate(Object.assign({}, t.data, { n: t.name })); }
    catch (e) { toast("That template couldn't be opened.", 4000); return false; }
    if ($("#my-templates-dialog").open) $("#my-templates-dialog").close();
    return true;
  }

  function deleteTemplate(name) {
    if (!window.confirm('Delete your template "' + name + '"?')) return;
    if (writeTemplates(readTemplates().filter((t) => t.name !== name))) { renderMyTemplates(); toast("Deleted: " + name); }
  }

  function exportTemplates() {
    const list = readTemplates(), own = readOwn();
    if (!list.length && !own.length) { toast("No templates or own exercises to back up yet"); return; }
    const blob = new Blob([JSON.stringify({ kind: "exercise-handout-templates", version: 2, templates: list, ownExercises: own }, null, 2)], { type: "application/json" });
    const a = el("a", { href: URL.createObjectURL(blob), download: "my-exercise-templates.json" });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }

  async function importTemplates(e) {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const incoming = (parsed.templates || []).filter((t) => t && typeof t.name === "string" && t.data && Array.isArray(t.data.x));
      const ownIn = (Array.isArray(parsed.ownExercises) ? parsed.ownExercises : []).map(cleanOwn).filter(Boolean);
      if (!incoming.length && !ownIn.length) throw new Error("none");
      if (ownIn.length) {
        const mine = readOwn();
        ownIn.forEach((o) => { const i = mine.findIndex((m) => m.id === o.id); if (i >= 0) mine[i] = o; else mine.push(o); });
        if (writeOwn(mine)) { H.registerCustom(mine, true); renderFilters(); renderLibrary(); toast("Loaded " + ownIn.length + " own exercise" + (ownIn.length === 1 ? "" : "s"), 3000); }
      }
      if (!incoming.length) return;
      const list = readTemplates();
      incoming.forEach((t) => {
        const entry = { name: t.name.slice(0, 60), saved: t.saved || new Date().toISOString(), data: t.data };
        const i = list.findIndex((x) => x.name.toLowerCase() === entry.name.toLowerCase());
        if (i >= 0) list[i] = entry; else list.push(entry);
      });
      if (writeTemplates(list)) { renderMyTemplates(); toast("Loaded " + incoming.length + " template" + (incoming.length === 1 ? "" : "s"), 3000); }
    } catch (err) {
      toast("That file isn't a templates backup.", 4000);
    }
  }

  // Opening a template link fills the builder, then tidies the address bar
  async function loadTemplateFromLink() {
    const hash = location.hash.slice(1);
    if (!hash.startsWith("t=")) return;
    try {
      applyTemplate(await H.decode(decodeURIComponent(hash.slice(2))));
    } catch (e) {
      toast("That template link didn't open. It may be incomplete.", 4000);
    }
    history.replaceState(null, "", location.pathname + location.search);
  }

  // ---------- Header details ----------
  function fillPrintMeta() {
    const rows = [
      ["Name", $("#patient-name").value],
      ["Date", H.formatDate($("#handout-date").value)],
      ["Physiotherapist", $("#clinician").value],
      ["Contact", $("#contact").value],
      ["Keep going", $("#duration").value],
      ["Time needed", programme.length ? "About " + H.estimateMinutes(programme) + " minutes each time" : ""]
    ].filter(([, v]) => v && v.trim());
    const dl = $("#print-meta");
    dl.innerHTML = "";
    rows.forEach(([k, v]) => dl.append(el("div", {}, el("dt", { text: k }), el("dd", { text: v }))));
    $("#print-general-notes").textContent = $("#general-notes").value.trim();
    const msg = $("#patient-message").value.trim();
    $("#print-message-text").textContent = msg;
    $("#print-message").hidden = !msg;
    // Goal and plan: blank means "write it in yourself", so leave a line to write on
    [["#goal", "#print-goal"], ["#plan", "#print-plan"]].forEach(([src, out]) => {
      const v = $(src).value.trim();
      $(out).textContent = v;
      $(out).classList.toggle("write-in", !v);
    });
    const who = [$("#clinician").value.trim(), $("#contact").value.trim()].filter(Boolean).join(" · ");
    $("#print-foot-contact").textContent = who ? "Questions? Contact " + who : "";
  }

  function loadClinician() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved) {
        $("#clinician").value = saved.clinician || "";
        $("#contact").value = saved.contact || "";
        $("#remember-me").checked = true;
      }
    } catch (e) { /* storage unavailable: ignore */ }
  }

  function saveClinician() {
    try {
      if ($("#remember-me").checked) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ clinician: $("#clinician").value, contact: $("#contact").value }));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) { /* storage unavailable: ignore */ }
  }

  // ---------- Print / email ----------
  async function printHandout() {
    if (!programme.length) { toast("Add at least one exercise first"); return; }
    clearTimeout(linkTimer);
    await updateLink();
    fillPrintMeta();
    if (window.RepSheetI18nBuilder) await window.RepSheetI18nBuilder.prepare(programmeData());
    if (window.RepSheetPdf && window.RepSheetPdf.wanted()) { window.RepSheetPdf.make(); return; }
    window.print();
  }

  // ---------- Pain level ----------
  function applyPainLevel() {
    const g = H.painGuide($("#pain-level").value);
    document.querySelectorAll(".pg-green-text").forEach((n) => (n.textContent = g.green));
    document.querySelectorAll(".pg-amber-text").forEach((n) => (n.textContent = g.amber));
  }

  // ---------- Copy for notes ----------
  // A clinical summary to paste into the patient's record. Uses clinical terms (sets, reps)
  // and leaves out the patient's name: it goes into their own notes anyway.
  function notesText() {
    const lines = [];
    const date = H.formatDate($("#handout-date").value);
    const n = programme.length;
    lines.push("Home exercise programme" + (date ? " issued " + date : "") + ": " + n + " exercise" + (n === 1 ? "" : "s") + ", about " + H.estimateMinutes(programme) + " min per session.");
    const goal = $("#goal").value.trim(), plan = $("#plan").value.trim(), du = $("#duration").value.trim();
    if (goal) lines.push("Patient goal: " + goal);
    if (plan) lines.push("Plan (when): " + plan);
    if (du) lines.push("Duration: " + du);
    programme.forEach((item, i) => {
      const ex = H.byId(item.id);
      if (stages.length && (i === 0 || (programme[i - 1].stage || 1) !== (item.stage || 1))) {
        const st = stages[(item.stage || 1) - 1];
        lines.push(st.name + (st.when ? " (" + st.when + ")" : "") + ":");
      }
      const dose = [];
      if (Number(item.sets) || Number(item.reps)) dose.push((Number(item.sets) || 1) + " x " + (Number(item.reps) || 1));
      if (Number(item.hold)) dose.push(item.hold + "s hold");
      if (String(item.load || "").trim()) dose.push(String(item.load).trim());
      if (String(item.frequency || "").trim()) dose.push(String(item.frequency).trim().toLowerCase());
      const side = H.sideLabel(item);
      let line = (i + 1) + ". " + ex.name + (side ? " (" + side.toLowerCase() + ")" : "") + (dose.length ? ": " + dose.join(", ") : "");
      const progs = [...item.prog.map((x) => ex.progressions[x]), String(item.progText || "").trim()].filter(Boolean);
      if (progs.length) line += ". Progressions given: " + progs.join("; ");
      const regs = [...item.reg.map((x) => ex.regressions[x]), String(item.regText || "").trim()].filter(Boolean);
      if (regs.length) line += ". Regressions given: " + regs.join("; ");
      if (item.notes.trim()) line += ". Notes: " + item.notes.trim();
      lines.push(line);
    });
    const general = $("#general-notes").value.trim();
    if (general) lines.push("Advice given: " + general);
    const msgN = $("#patient-message").value.trim();
    if (msgN) lines.push("Message on handout: " + msgN);
    if ($("#pain-guide").checked) {
      const lvl = $("#pain-level").value;
      lines.push("Pain guide given: " + (lvl === "1" ? "mild ache only" : "up to " + lvl + "/10 during exercise, settling by next morning") + "; stop and contact if sharp or worsening pain.");
    }
    const extras = [$("#tick-chart").checked && "tick chart", $("#large-print").checked && "large print", $("#easy-read").checked && "easy read"].filter(Boolean);
    lines.push("Given as printed handout" + (currentLink ? " with patient link / QR code" : "") + (extras.length ? " (" + extras.join(", ") + ")" : "") + ".");
    return lines.join("\n");
  }

  async function copyForNotes() {
    if (!programme.length) { toast("Add at least one exercise first"); return; }
    try {
      await navigator.clipboard.writeText(notesText());
      toast("Summary copied: paste it into your notes", 3000);
    } catch (e) {
      $("#notes-text").value = notesText();
      $("#notes-dialog").showModal();
      $("#notes-text").select();
    }
  }

  function emailText() {
    const lines = [];
    const name = $("#patient-name").value.trim();
    lines.push(name ? "Dear " + name + "," : "Hello,");
    const msg = $("#patient-message").value.trim();
    if (msg) lines.push("", msg);
    lines.push("", "Here is your home exercise programme.");
    if (currentLink && location.protocol !== "file:") {
      lines.push("", "Watch your exercises (with moving pictures) here:", currentLink);
    }
    const general = $("#general-notes").value.trim();
    if (general) lines.push("", general);
    programme.forEach((item, i) => {
      const ex = H.byId(item.id);
      if (stages.length && (i === 0 || (programme[i - 1].stage || 1) !== (item.stage || 1))) {
        const st = stages[(item.stage || 1) - 1];
        lines.push("", "== " + st.name.toUpperCase() + (st.when ? " (" + st.when + ")" : "") + " ==");
        if (st.move) lines.push("Move on to the next stage when: " + st.move);
      }
      lines.push("", (i + 1) + ". " + ex.name.toUpperCase());
      ex.instructions.forEach((s) => lines.push("- " + s));
      const d = H.describe(item);
      if (d) lines.push(d);
      if (item.notes.trim()) lines.push("Note: " + item.notes.trim());
      const progs = [...item.prog.map((x) => ex.progressions[x]), String(item.progText || "").trim()].filter(Boolean);
      if (progs.length) lines.push("To make it harder: " + progs.join("; "));
      const regs = [...item.reg.map((x) => ex.regressions[x]), String(item.regText || "").trim()].filter(Boolean);
      if (regs.length) lines.push("To make it easier: " + regs.join("; "));
    });
    lines.push("", "Stop if an exercise causes sharp pain, or pain that gets worse. Then call your physio.");
    const who = [$("#clinician").value.trim(), $("#contact").value.trim()].filter(Boolean);
    if (who.length) lines.push("", "Kind regards,", ...who);
    return lines.join("\n");
  }

  async function openEmail() {
    if (!programme.length) { toast("Add at least one exercise first"); return; }
    clearTimeout(linkTimer);
    await updateLink();
    const dlg = $("#email-dialog");
    dlg.returnValue = "";
    dlg.showModal();
  }

  $("#email-dialog").addEventListener("close", () => {
    if ($("#email-dialog").returnValue !== "send") return;
    const to = $("#email-to").value.trim();
    const href = "mailto:" + encodeURIComponent(to) +
      "?subject=" + encodeURIComponent("Your home exercise programme") +
      "&body=" + encodeURIComponent(emailText());
    $("#email-to").value = ""; // don't keep the address around
    window.location.href = href;
  });

  function clearAll() {
    if (!programme.length && !$("#patient-name").value && !$("#general-notes").value) return;
    const was = programme.slice(), wasNotes = $("#general-notes").value;
    programme = [];
    $("#patient-name").value = "";
    $("#large-print").checked = false;
    document.body.classList.remove("large-print");
    $("#easy-read").checked = false;
    document.body.classList.remove("easy-read");
    const wasStages = stages;
    stages = [];
    renderStages();
    $("#tick-chart").checked = false;
    $("#print-ticks").hidden = true;
    $("#general-notes").value = "";
    $("#goal").value = "";
    $("#plan").value = "";
    $("#patient-message").value = "";
    $("#duration").value = "";
    $("#pain-level").value = "1";
    applyPainLevel();
    renderProgramme();
    renderLibrary();
    changed();
    if (was.length || wasNotes) {
      undoToast("Handout cleared", () => { programme = was; stages = wasStages; renderStages(); $("#general-notes").value = wasNotes; $("#general-notes").dispatchEvent(new Event("input", { bubbles: true })); renderProgramme(); renderLibrary(); changed(); });
      return;
    }
    toast("Handout cleared");
  }

  // ---------- Animations on / off ----------
  let animPaused = window.PhysioFigures && window.PhysioFigures.reduceMotion;
  function setAnimButton() {
    const b = $("#btn-motion");
    b.textContent = animPaused ? "Play animations" : "Pause animations";
    b.setAttribute("aria-pressed", String(animPaused));
    if (window.PhysioFigures) window.PhysioFigures.setAllPaused(animPaused);
  }

  let toastTimer;
  function toast(msg, ms) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), ms || 1800);
  }

  // ---------- Start ----------
  $("#handout-date").value = new Date().toISOString().slice(0, 10);
  $("#search").addEventListener("input", renderLibrary);
  // Enter in the search box adds the top result
  $("#search").addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const top = libraryMatches().list[0];
    if (top) addExercise(top);
  });
  // Keyboard: "/" jumps to search; Ctrl+Z undoes a removal while the Undo button shows
  document.addEventListener("keydown", (e) => {
    const typing = e.target.matches && e.target.matches("input, textarea, select, [contenteditable]");
    if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !document.querySelector("dialog[open]")) { e.preventDefault(); $("#search").focus(); $("#search").select(); }
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z" && undoFn && !typing) { e.preventDefault(); runUndo(); }
  });
  $("#undo-btn").addEventListener("click", runUndo);
  $("#preview-close").addEventListener("click", () => $("#preview-dialog").close());
  $("#preview-dialog").addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });

  // ---------- Simple / Advanced view of the exercise cards (remembered on this device) ----------
  const VIEW_KEY = "handout-builder:view";
  function setView(v, save) {
    const simple = v === "simple";
    document.body.classList.toggle("view-simple", simple);
    $("#view-simple").setAttribute("aria-pressed", String(simple));
    $("#view-advanced").setAttribute("aria-pressed", String(!simple));
    if (save) { try { localStorage.setItem(VIEW_KEY, v); } catch (e) { /* storage unavailable */ } }
  }
  $("#view-simple").addEventListener("click", () => { setView("simple", true); renderProgramme(); });
  $("#view-advanced").addEventListener("click", () => { setView("advanced", true); renderProgramme(); });
  try { setView(localStorage.getItem(VIEW_KEY) === "simple" ? "simple" : "advanced", false); } catch (e) { setView("advanced", false); }

  // ---------- "In this handout": a short summary that stays in view (tablets and computers) ----------
  // Tap an exercise to jump to its card.
  const EXS_KEY = "handout-builder:summary-hidden";
  let exsHidden = false;
  try { exsHidden = localStorage.getItem(EXS_KEY) === "1"; } catch (e) { /* storage unavailable */ }
  function shortDose(it) {
    const bits = [];
    if (it.sets && it.reps && Number(it.sets) > 1) bits.push(it.sets + " × " + it.reps);
    else if (it.reps && Number(it.sets) === 1) bits.push(it.reps + " times");
    else if (it.reps) bits.push(it.reps + " times");
    else if (it.sets) bits.push(it.sets + " rounds");
    if (it.hold) bits.push(it.hold + "s hold");
    if (it.load) bits.push(it.load);
    if (it.frequency) bits.push(it.frequency);
    return bits.join(" · ");
  }
  function renderExSummary() {
    const nav = $("#ex-summary"), list = $("#exs-list");
    nav.hidden = programme.length < 1;
    nav.classList.toggle("is-collapsed", exsHidden);
    $("#exs-toggle").textContent = exsHidden ? "Show" : "Hide";
    $("#exs-toggle").setAttribute("aria-expanded", String(!exsHidden));
    list.hidden = exsHidden;
    list.innerHTML = "";
    let stage = -1;
    programme.forEach((it, i) => {
      const ex = H.byId(it.id);
      if (!ex) return;
      if (stages.length && it.stage !== stage) {
        stage = it.stage;
        const st = stages[(it.stage || 1) - 1];
        if (st) list.append(el("li", { class: "exs-stage", text: st.name || ("Stage " + it.stage) }));
      }
      const side = H.sideLabel(it);
      const b = el("button", { type: "button", class: "exs-item" },
        el("span", { class: "exs-num", text: String(i + 1) }),
        el("span", { class: "exs-name", text: ex.name + (side ? " (" + side.toLowerCase().replace(" side", "") + ")" : "") }),
        el("span", { class: "exs-dose", text: shortDose(it) || "No dose set" }));
      b.addEventListener("click", () => {
        const card = $("#programme-list").children[i];
        if (!card) return;
        // Land the card just below the summary (which stays at the top of the screen)
        const nav = $("#ex-summary");
        const stuck = getComputedStyle(nav).position === "sticky" ? (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-h")) || 64) + 2 + nav.getBoundingClientRect().height : 80;
        window.scrollTo({ top: window.scrollY + card.getBoundingClientRect().top - stuck - 12, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
        card.classList.add("just-moved");
        setTimeout(() => card.classList.remove("just-moved"), 1200);
        const first = card.querySelector("input, select, textarea, button");
        if (first) setTimeout(() => first.focus({ preventScroll: true }), 400);
      });
      list.append(el("li", {}, b));
    });
  }
  $("#exs-toggle").addEventListener("click", () => {
    exsHidden = !exsHidden;
    try { localStorage.setItem(EXS_KEY, exsHidden ? "1" : "0"); } catch (e) { /* storage unavailable */ }
    renderExSummary();
  });
  // Sit the summary just under the header, whatever height the header is
  const setHeaderH = () => { const h = document.querySelector(".site-header"); if (h) document.documentElement.style.setProperty("--header-h", Math.round(h.getBoundingClientRect().height) + "px"); };
  setHeaderH(); window.addEventListener("resize", setHeaderH);
  new MutationObserver(renderExSummary).observe($("#programme-list"), { childList: true });
  $("#programme-list").addEventListener("input", () => { clearTimeout(renderExSummary.t); renderExSummary.t = setTimeout(renderExSummary, 150); });
  $("#programme-list").addEventListener("change", () => { clearTimeout(renderExSummary.t); renderExSummary.t = setTimeout(renderExSummary, 150); });
  renderExSummary();

  // ---------- Change several exercises at once ----------
  // Tick the exercises to change (all by default), fill in only the boxes to change, press Apply.
  const BULK = [["sets", "#bulk-sets", "sets", true], ["reps", "#bulk-reps", "reps", true], ["hold", "#bulk-hold", "hold", true],
    ["frequency", "#bulk-freq", "how often", false], ["load", "#bulk-load", "weight", false]];
  const bulkOff = new Set(); // exercises unticked, by card key
  function bulkPicked() { return programme.filter((it) => !bulkOff.has(it.key)); }
  function bulkButton() {
    const n = bulkPicked().length;
    $("#bulk-apply").textContent = n === programme.length && n > 1 ? "Apply to all " + n + " exercises" : "Apply to " + n + " exercise" + (n === 1 ? "" : "s");
    $("#bulk-apply").disabled = !n;
  }
  function renderBulkList() {
    const box = $("#bulk-list");
    const keys = new Set(programme.map((it) => it.key));
    [...bulkOff].forEach((k) => { if (!keys.has(k)) bulkOff.delete(k); });
    box.innerHTML = "";
    programme.forEach((it, i) => {
      const ex = H.byId(it.id);
      if (!ex) return;
      const side = H.sideLabel(it);
      const cb = el("input", { type: "checkbox", id: "bulk-x-" + it.key });
      cb.checked = !bulkOff.has(it.key);
      cb.addEventListener("change", () => { if (cb.checked) bulkOff.delete(it.key); else bulkOff.add(it.key); bulkButton(); });
      box.append(el("label", { class: "bulk-item", for: cb.id }, cb,
        el("span", { class: "bulk-num", text: String(i + 1) }),
        el("span", { class: "bulk-name", text: ex.name + (side ? " (" + side.toLowerCase() + ")" : "") }),
        el("span", { class: "bulk-dose", text: H.describe(it) })));
    });
    bulkButton();
  }
  new MutationObserver(() => { if ($("#bulk-tools").open) renderBulkList(); }).observe($("#programme-list"), { childList: true });
  $("#bulk-tools").addEventListener("toggle", () => { if ($("#bulk-tools").open) renderBulkList(); });
  $("#bulk-all").addEventListener("click", () => { bulkOff.clear(); renderBulkList(); });
  $("#bulk-none").addEventListener("click", () => { programme.forEach((it) => bulkOff.add(it.key)); renderBulkList(); });
  $("#bulk-reset").addEventListener("click", () => { BULK.forEach(([, sel]) => { $(sel).value = ""; }); $("#bulk-sets").focus(); });
  $("#bulk-apply").addEventListener("click", () => {
    const picked = bulkPicked();
    if (!picked.length) { toast("Tick at least one exercise"); return; }
    const changes = BULK.map(([key, sel, word, num]) => {
      let v = $(sel).value.trim();
      if (v === "") return null;
      if (num) { const n = Math.round(Number(v)); if (isNaN(n) || n < 0) return null; v = n === 0 ? "" : String(n); }
      return { key, v, word };
    }).filter(Boolean);
    if (!changes.length) { toast("Fill in at least one box, such as Sets or How often"); $("#bulk-sets").focus(); return; }
    const before = programme.map((it) => ({ key: it.key, ...Object.fromEntries(BULK.map(([k]) => [k, it[k]])) }));
    picked.forEach((it) => changes.forEach((c) => { it[c.key] = c.v; }));
    renderProgramme(); renderBulkList(); changed();
    const what = changes.map((c) => c.word).join(", ");
    undoToast("Changed " + what + " for " + picked.length + " exercise" + (picked.length === 1 ? "" : "s"), () => {
      before.forEach((b) => { const it = programme.find((x) => x.key === b.key); if (it) BULK.forEach(([k]) => { it[k] = b[k]; }); });
      renderProgramme(); renderBulkList(); changed();
    });
  });

  // "What's new" note, shown once per update (only the update name is remembered)
  const NEWS = "2026-11-17-builder";
  try {
    if (localStorage.getItem("handout-builder:news-seen") !== NEWS) $("#whats-new").hidden = false;
  } catch (e) { /* storage unavailable */ }
  $("#whats-new-close").addEventListener("click", () => {
    $("#whats-new").hidden = true;
    try { localStorage.setItem("handout-builder:news-seen", NEWS); } catch (e) { /* storage unavailable */ }
  });
  $("#btn-print").addEventListener("click", printHandout);
  // Soft shadow under the header only once the page has scrolled under it
  const onScroll = () => document.documentElement.classList.toggle("is-scrolled", window.scrollY > 4);
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // Details panel: always open in the three-column layout, folded away on smaller screens to start with
  (function () {
    const sd = $("#settings-details"); const wide = window.matchMedia("(min-width: 1240px)");
    sd.open = wide.matches;
    wide.addEventListener("change", () => { if (wide.matches) sd.open = true; });
  })();
  $("#btn-email").addEventListener("click", openEmail);
  $("#btn-clear").addEventListener("click", clearAll);
  $("#btn-copy").addEventListener("click", copyLink);
  $("#btn-copy-patient").addEventListener("click", copyLink);
  $("#btn-template").addEventListener("click", openTemplate);
  $("#btn-template-copy").addEventListener("click", copyTemplate);
  $("#template-name").addEventListener("input", updateTemplateLink);
  $("#bw-print").addEventListener("change", (e) => document.body.classList.toggle("bw-print", e.target.checked));
  $("#paper-saver").addEventListener("change", (e) => document.body.classList.toggle("paper-saver", e.target.checked));
  $("#check-in").addEventListener("change", changed);
  $("#use-stages").addEventListener("change", (e) => {
    if (e.target.checked) {
      stages = [{ name: "Stage 1", when: "", move: "" }, { name: "Stage 2", when: "", move: "" }];
      programme.forEach((it) => { it.stage = 1; });
    } else {
      stages = [];
      programme.forEach((it) => { it.stage = 0; });
    }
    renderStages(); renderProgramme(); changed();
  });
  $("#tick-chart").addEventListener("change", (e) => {
    $("#print-ticks").hidden = !e.target.checked;
    changed();
  });
  $("#btn-motion").addEventListener("click", () => { animPaused = !animPaused; setAnimButton(); });
  $("#remember-me").addEventListener("change", saveClinician);
  $("#easy-read").addEventListener("change", (e) => { document.body.classList.toggle("easy-read", e.target.checked); changed(); });
  $("#large-print").addEventListener("change", (e) => {
    document.body.classList.toggle("large-print", e.target.checked);
    changed();
  });
  ["#clinician", "#contact"].forEach((s) => $(s).addEventListener("input", () => { saveClinician(); changed(); }));
  $("#pain-guide").addEventListener("change", (e) => { $("#print-pain").hidden = !e.target.checked; $("#pain-level").disabled = !e.target.checked; changed(); });
  $("#pain-level").addEventListener("change", () => { applyPainLevel(); changed(); });
  $("#btn-notes").addEventListener("click", copyForNotes);
  $("#btn-my-templates").addEventListener("click", openMyTemplates);
  $("#btn-mt-save").addEventListener("click", saveMyTemplate);
  $("#mt-name").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); saveMyTemplate(); } });
  $("#btn-mt-export").addEventListener("click", exportTemplates);
  // Own exercises
  H.registerCustom(readOwn(), true);
  $("#btn-own-new").addEventListener("click", () => openOwn(null));
  $("#own-delete").addEventListener("click", deleteOwn);
  $("#own-photo-remove").addEventListener("click", () => { ownPhoto = ""; $("#own-photo").value = ""; showOwnPhoto(); });
  $("#own-photo").addEventListener("change", async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try { ownPhoto = await shrinkPhoto(f); showOwnPhoto(); }
    catch (err) { toast("That file couldn't be opened as a picture.", 4000); e.target.value = ""; }
  });
  $("#own-form").addEventListener("submit", (e) => {
    const how = e.submitter && e.submitter.value;
    if (how !== "save" && how !== "add") return;
    e.preventDefault();
    if (saveOwn(how === "add")) $("#own-dialog").close();
  });
  $("#mt-import").addEventListener("change", importTemplates);
  ["#general-notes", "#handout-date", "#goal", "#plan", "#duration", "#patient-message"].forEach((s) => $(s).addEventListener("input", changed));
  // Characters left in the patient message
  const msgCount = () => { const m = $("#patient-message"); $("#message-count").textContent = String(m.maxLength - m.value.length); };
  $("#patient-message").addEventListener("input", msgCount);
  msgCount();
  window.addEventListener("beforeprint", fillPrintMeta);

  loadClinician();
  renderFilters();
  renderLibrary();
  renderProgramme();
  setAnimButton();
  renderMyTemplates();
  renderStarters();
  $("#btn-starter").addEventListener("click", () => {
    const v = $("#starter-select").value;
    if (v === "") { toast("Choose a condition first"); $("#starter-select").focus(); return; }
    useStarter(Number(v));
  });
  // A template link wins over the kept handout; otherwise bring back the handout from before a refresh
  if (!location.hash.startsWith("#t=")) restoreDraft();
  draftReady = true;
  loadTemplateFromLink();
  // Save on any typing or option change, and just before the page goes away
  document.addEventListener("input", saveDraftSoon, true);
  document.addEventListener("change", saveDraftSoon, true);
  window.addEventListener("pagehide", saveDraft);
})();
