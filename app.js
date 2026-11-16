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
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>'
  };

  // ---------- Library ----------
  function renderFilters() {
    const areas = ["All", ...new Set(LIBRARY.map((e) => e.area))];
    const box = $("#area-filters");
    box.innerHTML = "";
    areas.forEach((a) =>
      box.append(el("button", {
        type: "button", class: "chip", "aria-pressed": String(a === activeArea), text: a,
        onclick: () => { activeArea = a; renderFilters(); renderLibrary(); }
      }))
    );
  }

  function renderLibrary() {
    const q = $("#search").value.trim().toLowerCase();
    const list = $("#library-list");
    list.innerHTML = "";
    const matches = LIBRARY.filter((e) =>
      (activeArea === "All" || e.area === activeArea) &&
      (!q || (e.name + " " + e.area + " " + (e.aliases || "") + " " + e.instructions.join(" ")).toLowerCase().includes(q))
    );
    if (!matches.length) {
      list.append(el("li", { class: "lib-empty", text: "No exercises match your search." }));
      return;
    }
    const inProgramme = new Set(programme.map((p) => p.id));
    matches.forEach((ex) => {
      const added = inProgramme.has(ex.id);
      list.append(el("li", { class: "lib-item" },
        H.picture(ex, "thumb").el,
        el("div", { class: "meta" },
          el("div", { class: "name", text: ex.name }),
          el("div", { class: "area" }, ex.area, ex.video ? el("span", { class: "has-video", title: "Has a video" }, icon(ICONS.video)) : null)
        ),
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

  // ---------- Programme ----------
  let uid = 0;
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
      reg: []
    });
    renderProgramme();
    renderLibrary();
    changed();
    toast(ex.name + " added");
  }

  function move(index, delta) {
    moveTo(index, index + delta);
  }

  // Move one exercise to a new position (used by the arrow buttons, keyboard and dragging)
  function moveTo(from, to, focusSelector) {
    if (to < 0 || to >= programme.length || to === from) return;
    const [item] = programme.splice(from, 1);
    programme.splice(to, 0, item);
    renderProgramme();
    changed();
    const card = $("#programme-list").children[to];
    if (card && focusSelector) { const f = card.querySelector(focusSelector); if (f) f.focus(); }
    const ex = H.byId(item.id);
    toast((ex ? ex.name : "Exercise") + " moved to position " + (to + 1));
  }

  // ---------- Drag to reorder ----------
  // Works with a mouse, a finger or a pen: press the grip handle and drag the card up or down.
  // Keyboard users can focus the handle and press the up and down arrow keys.
  function startDrag(e, index) {
    if (e.button != null && e.button !== 0) return;
    const list = $("#programme-list");
    const cards = [...list.children];
    const card = cards[index];
    if (!card || cards.length < 2) return;
    e.preventDefault();
    const handle = e.currentTarget;
    try { handle.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
    const startY = e.clientY;
    let target = index;
    card.classList.add("dragging");
    list.classList.add("is-sorting");

    const mark = () => {
      cards.forEach((c, i) => {
        c.classList.toggle("drop-before", i === target && target < index);
        c.classList.toggle("drop-after", i === target && target > index);
      });
    };
    const onMove = (ev) => {
      card.style.transform = "translateY(" + (ev.clientY - startY) + "px)";
      // Which position is the pointer over?
      target = index;
      cards.forEach((c, i) => {
        if (i === index) return;
        const r = c.getBoundingClientRect(), mid = r.top + r.height / 2;
        if (i < index && ev.clientY < mid) target = Math.min(target, i);
        if (i > index && ev.clientY > mid) target = Math.max(target, i);
      });
      mark();
      // Scroll the page when dragging near the top or bottom of the window
      const edge = 70;
      if (ev.clientY < edge) window.scrollBy(0, -12);
      else if (ev.clientY > window.innerHeight - edge) window.scrollBy(0, 12);
    };
    const finish = (ev) => {
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", finish);
      handle.removeEventListener("pointercancel", finish);
      card.style.transform = "";
      card.classList.remove("dragging");
      list.classList.remove("is-sorting");
      cards.forEach((c) => c.classList.remove("drop-before", "drop-after"));
      if (ev.type === "pointerup" && target !== index) moveTo(index, target, ".drag-handle");
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", finish);
    handle.addEventListener("pointercancel", finish);
  }

  function handleKeys(e, index) {
    if (e.key === "ArrowUp") { e.preventDefault(); moveTo(index, index - 1, ".drag-handle"); }
    else if (e.key === "ArrowDown") { e.preventDefault(); moveTo(index, index + 1, ".drag-handle"); }
  }

  function removeAt(index) {
    const [gone] = programme.splice(index, 1);
    renderProgramme();
    renderLibrary();
    changed();
    const ex = H.byId(gone.id);
    toast((ex ? ex.name : "Exercise") + " removed");
  }

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
    if (load) box.append(el("p", { class: "dose-load", text: "Use: " + load }));
    if (freq) box.append(el("p", { class: "dose-freq", text: freq }));
    box.hidden = !cells.length && !freq && !load;
    return box;
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
  function optionList(item, ex, key, listKey, title) {
    const options = ex[listKey] || [];
    if (!options.length) return null;
    const printList = el("ul");
    const printBox = el("div", { class: "print-only options-print" }, el("strong", { text: title + ":" }), printList);
    const refreshPrint = () => {
      printList.innerHTML = "";
      item[key].slice().sort((a, b) => a - b).forEach((i) => printList.append(el("li", { text: options[i] })));
      printBox.hidden = !item[key].length;
    };
    refreshPrint();
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
    return [group, printBox];
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
      const harder = optionList(item, ex, "prog", "progressions", "To make it harder");
      const easier = optionList(item, ex, "reg", "regressions", "To make it easier");
      const optionCount = (ex.progressions || []).length + (ex.regressions || []).length;
      const ticked = item.prog.length + item.reg.length;

      list.append(el("li", { class: "ex-card" },
        el("div", { class: "ex-media no-print" }, H.picture(ex, "anim", { offset: i * 0.4 }).el),
        el("div", { class: "ex-body" },
          el("div", { class: "ex-top" },
            el("h3", { class: "ex-title", text: ex.name }),
            el("div", { class: "ex-tools no-print" },
              programme.length > 1 ? el("button", {
                type: "button", class: "icon-btn drag-handle",
                "aria-label": "Reorder " + ex.name + ": drag, or use the up and down arrow keys",
                title: "Drag to reorder",
                onpointerdown: (e) => startDrag(e, i),
                onkeydown: (e) => handleKeys(e, i)
              }, icon(ICONS.grip)) : null,
              el("button", { type: "button", class: "icon-btn", "aria-label": "Move " + ex.name + " up", title: "Move up", onclick: () => move(i, -1), disabled: i === 0 }, icon(ICONS.up)),
              el("button", { type: "button", class: "icon-btn", "aria-label": "Move " + ex.name + " down", title: "Move down", onclick: () => move(i, 1), disabled: i === programme.length - 1 }, icon(ICONS.down)),
              el("button", { type: "button", class: "icon-btn remove", "aria-label": "Remove " + ex.name, title: "Remove", onclick: () => removeAt(i) }, icon(ICONS.remove))
            )
          ),
          el("div", { class: "print-only ex-steps-pics" }, H.picture(ex, "steps").el),
          el("ol", { class: "ex-steps" }, ex.instructions.map((s) => el("li", { text: s }))),
          el("div", { class: "params" },
            paramField(item, "sets", "Sets", "number"),
            paramField(item, "reps", "Reps", "number"),
            paramField(item, "hold", "Hold (secs)", "number"),
            paramField(item, "frequency", "How often", "text", "freq"),
            paramField(item, "load", "Weight or band", "text", "load", "e.g. 2 kg, red band")
          ),
          el("p", { class: "param-summary", text: H.describe(item) }),
          fillDose(el("div", { class: "print-only dose-panel" }), item),
          el("div", { class: "field ex-notes" },
            el("label", { for: notesId, class: "no-print", text: "Notes for this exercise" }),
            el("textarea", {
              id: notesId, rows: "1", placeholder: "e.g. Use a 2kg weight. Keep pain below 3 out of 10.",
              oninput: (e) => { item.notes = e.target.value; notesPrint.textContent = e.target.value; changed(); }
            }),
            notesPrint
          ),
          optionCount ? el("details", { class: "progressions no-print", open: ticked > 0 },
            el("summary", {}, "Progressions and regressions ", el("span", { class: "hint", text: "(tick to include)" })),
            el("div", { class: "options-grid" }, harder && harder[0], easier && easier[0])
          ) : null,
          harder && harder[1], easier && easier[1]
        )
      ));
      list.lastChild.querySelector("textarea").value = item.notes;
    });
  }

  // ---------- Patient link and QR code ----------
  let currentLink = "";
  let linkTimer;
  function changed() {
    clearTimeout(linkTimer);
    linkTimer = setTimeout(updateLink, 250);
  }

  function programmeData() {
    // Patient name is deliberately NOT included in the link.
    return {
      d: $("#handout-date").value,
      c: $("#clinician").value.trim(),
      t: $("#contact").value.trim(),
      g: $("#general-notes").value.trim(),
      x: programme.map(H.packItem),
      ...($("#goal").value.trim() ? { go: $("#goal").value.trim() } : {}),
      ...($("#plan").value.trim() ? { pl: $("#plan").value.trim() } : {}),
      ...($("#large-print").checked ? { lp: 1 } : {}),
      ...($("#tick-chart").checked ? { tc: 1 } : {}),
      ...($("#pain-guide").checked ? { pg: Number($("#pain-level").value) || 1 } : {}),
      ...($("#duration").value.trim() ? { du: $("#duration").value.trim() } : {})
    };
  }

  async function updateLink() {
    const box = $("#share");
    if (!programme.length) { currentLink = ""; box.hidden = true; $("#print-qr").hidden = true; return; }
    const code = await H.encode(programmeData());
    const url = new URL("view.html", location.href);
    url.hash = code;
    currentLink = url.href;
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

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(currentLink);
      toast("Link copied");
    } catch (e) {
      $("#share-link").select();
      toast("Press Ctrl+C to copy");
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
      ...($("#large-print").checked ? { lp: 1 } : {}),
      ...($("#tick-chart").checked ? { tc: 1 } : {}),
      ...($("#pain-guide").checked ? {} : { npg: 1 }),
      ...($("#pain-level").value !== "1" ? { pgl: Number($("#pain-level").value) } : {}),
      ...($("#duration").value.trim() ? { du: $("#duration").value.trim() } : {}),
      ...($("#bw-print").checked ? { bw: 1 } : {}),
      ...($("#paper-saver").checked ? { ps: 1 } : {})
    };
  }

  async function updateTemplateLink() {
    const url = new URL("index.html", location.href);
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
  function applyTemplate(data) {
    const items = (data.x || []).map(H.unpackItem).filter((it) => H.byId(it.id));
    if (!items.length) throw new Error("No exercises");
    programme = items.map((it) => Object.assign(it, { key: ++uid }));
    $("#patient-name").value = "";
    $("#goal").value = "";
    $("#plan").value = "";
    $("#general-notes").value = data.g || "";
    $("#duration").value = data.du || "";
    const set = (id, on, cls) => { $(id).checked = !!on; if (cls) document.body.classList.toggle(cls, !!on); };
    set("#large-print", data.lp, "large-print");
    set("#tick-chart", data.tc); $("#print-ticks").hidden = !data.tc;
    set("#pain-guide", !data.npg); $("#print-pain").hidden = !!data.npg; $("#pain-level").disabled = !!data.npg;
    $("#pain-level").value = String(data.pgl || 1); applyPainLevel();
    set("#bw-print", data.bw, "bw-print");
    set("#paper-saver", data.ps, "paper-saver");
    $("#template-name").value = data.n || "";
    renderProgramme();
    renderLibrary();
    changed();
    toast("Template loaded" + (data.n ? ": " + data.n : "") + " (" + items.length + " exercise" + (items.length === 1 ? "" : "s") + ")", 4000);
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
    const list = readTemplates();
    if (!list.length) { toast("No templates to back up yet"); return; }
    const blob = new Blob([JSON.stringify({ kind: "exercise-handout-templates", version: 1, templates: list }, null, 2)], { type: "application/json" });
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
      if (!incoming.length) throw new Error("none");
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
      const dose = [];
      if (Number(item.sets) || Number(item.reps)) dose.push((Number(item.sets) || 1) + " x " + (Number(item.reps) || 1));
      if (Number(item.hold)) dose.push(item.hold + "s hold");
      if (String(item.load || "").trim()) dose.push(String(item.load).trim());
      if (String(item.frequency || "").trim()) dose.push(String(item.frequency).trim().toLowerCase());
      let line = (i + 1) + ". " + ex.name + (dose.length ? ": " + dose.join(", ") : "");
      if (item.prog.length) line += ". Progressions given: " + item.prog.map((x) => ex.progressions[x]).join("; ");
      if (item.reg.length) line += ". Regressions given: " + item.reg.map((x) => ex.regressions[x]).join("; ");
      if (item.notes.trim()) line += ". Notes: " + item.notes.trim();
      lines.push(line);
    });
    const general = $("#general-notes").value.trim();
    if (general) lines.push("Advice given: " + general);
    if ($("#pain-guide").checked) {
      const lvl = $("#pain-level").value;
      lines.push("Pain guide given: " + (lvl === "1" ? "mild ache only" : "up to " + lvl + "/10 during exercise, settling by next morning") + "; stop and contact if sharp or worsening pain.");
    }
    const extras = [$("#tick-chart").checked && "tick chart", $("#large-print").checked && "large print"].filter(Boolean);
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
    lines.push("", "Here is your home exercise programme.");
    if (currentLink && location.protocol !== "file:") {
      lines.push("", "Watch your exercises (with moving pictures) here:", currentLink);
    }
    const general = $("#general-notes").value.trim();
    if (general) lines.push("", general);
    programme.forEach((item, i) => {
      const ex = H.byId(item.id);
      lines.push("", (i + 1) + ". " + ex.name.toUpperCase());
      ex.instructions.forEach((s) => lines.push("- " + s));
      const d = H.describe(item);
      if (d) lines.push(d);
      if (item.notes.trim()) lines.push("Note: " + item.notes.trim());
      if (item.prog.length) lines.push("To make it harder: " + item.prog.map((x) => ex.progressions[x]).join("; "));
      if (item.reg.length) lines.push("To make it easier: " + item.reg.map((x) => ex.regressions[x]).join("; "));
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
    programme = [];
    $("#patient-name").value = "";
    $("#large-print").checked = false;
    document.body.classList.remove("large-print");
    $("#tick-chart").checked = false;
    $("#print-ticks").hidden = true;
    $("#general-notes").value = "";
    $("#goal").value = "";
    $("#plan").value = "";
    $("#duration").value = "";
    $("#pain-level").value = "1";
    applyPainLevel();
    renderProgramme();
    renderLibrary();
    changed();
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
  $("#btn-print").addEventListener("click", printHandout);
  $("#btn-email").addEventListener("click", openEmail);
  $("#btn-clear").addEventListener("click", clearAll);
  $("#btn-copy").addEventListener("click", copyLink);
  $("#btn-template").addEventListener("click", openTemplate);
  $("#btn-template-copy").addEventListener("click", copyTemplate);
  $("#template-name").addEventListener("input", updateTemplateLink);
  $("#bw-print").addEventListener("change", (e) => document.body.classList.toggle("bw-print", e.target.checked));
  $("#paper-saver").addEventListener("change", (e) => document.body.classList.toggle("paper-saver", e.target.checked));
  $("#tick-chart").addEventListener("change", (e) => {
    $("#print-ticks").hidden = !e.target.checked;
    changed();
  });
  $("#btn-motion").addEventListener("click", () => { animPaused = !animPaused; setAnimButton(); });
  $("#remember-me").addEventListener("change", saveClinician);
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
  $("#mt-import").addEventListener("change", importTemplates);
  ["#general-notes", "#handout-date", "#goal", "#plan", "#duration"].forEach((s) => $(s).addEventListener("input", changed));
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
  loadTemplateFromLink();
})();
