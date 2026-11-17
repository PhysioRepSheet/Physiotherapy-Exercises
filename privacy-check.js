/*
  RepSheet: privacy check (builder)
  Warns when a box that goes into the patient link looks like it could identify the patient:
  an NHS number (with a valid check digit), phone number, email, date, postcode, hospital number, or a name with a title.
  Runs on this computer only. Nothing is sent or stored. It warns; it never blocks.
*/
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);

  // NHS numbers carry a check digit (modulus 11), so ordinary 10-digit numbers are rarely flagged.
  function nhsValid(d) {
    if (d.length !== 10) return false;
    let s = 0;
    for (let i = 0; i < 9; i++) s += (+d[i]) * (10 - i);
    let c = 11 - (s % 11);
    if (c === 11) c = 0;
    return c !== 10 && c === +d[9];
  }
  const RULES = [
    ["an NHS number", /(?:\bNHS\s*(?:no\.?|number)?:?\s*)?\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/gi, (m) => nhsValid(m.replace(/\D/g, ""))],
    ["a phone number (fine if it's the clinic's)", /(?:\+44\s?|\b0)\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g],
    ["an email address", /[\w.+-]+@[\w-]+\.[\w.]+/g],
    ["a date (could be a date of birth)", /\b\d{1,2}[\/.-]\d{1,2}[\/.-](?:19|20)?\d{2}\b/g],
    ["a postcode", /\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/gi],
    ["a name with a title", /\b(?:Mr|Mrs|Ms|Miss|Mx)\.?\s+[A-Z][a-z]+/g],
    ["“DOB”", /\b(?:DOB|D\.O\.B\.?|date of birth)\b/gi],
    ["a hospital number", /\b(?:MRN|hospital (?:no|number))\b/gi]
  ];
  function scan(text) {
    const hits = [];
    RULES.forEach(([label, re, ok]) => (String(text).match(re) || []).forEach((m) => { if (!ok || ok(m)) hits.push([label, m]); }));
    return hits;
  }
  // Boxes that travel in the patient link. The patient's name is never in the link, and the physio's own
  // name and contact details are meant to be there, so those are not checked.
  const WATCHED = "#programme-list textarea, #programme-list input[type=text], #patient-message, #general-notes, #goal, #plan, #duration, #stage-editor input, #stage-editor textarea";
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function warnFor(f) {
    const w = f.nextElementSibling;
    return w && w.classList.contains("pc-warn") ? w : null;
  }
  function checkField(f) {
    const hits = scan(f.value);
    let w = warnFor(f);
    if (!hits.length) { if (w) w.remove(); f.classList.remove("pc-flag"); f.removeAttribute("aria-describedby"); return false; }
    if (!w) {
      w = document.createElement("div");
      w.className = "pc-warn no-print";
      w.id = "pc-" + Math.random().toString(36).slice(2, 8);
      f.after(w);
    }
    f.classList.add("pc-flag");
    f.setAttribute("aria-describedby", w.id);
    w.innerHTML = '<b>This may identify your patient.</b> It goes into the patient link and QR code. Found: ' +
      hits.map(([l, m]) => l + ' <mark>' + esc(m) + '</mark>').join(", ") +
      '. <button type="button" class="pc-fix">Take them out</button>';
    w.querySelector(".pc-fix").onclick = () => {
      let v = f.value;
      scan(v).forEach(([, m]) => { v = v.split(m).join(""); });
      f.value = v.replace(/\b(?:for|from|of)\s*(?=[,.]|$)/gi, "").replace(/[ \t]{2,}/g, " ").replace(/\s+([.,])/g, "$1").replace(/^[\s,.;:]+|[\s,;:]+$/g, "").trim();
      f.dispatchEvent(new Event("input", { bubbles: true }));
      f.focus();
    };
    return true;
  }
  function checkAll() {
    let n = 0;
    document.querySelectorAll(WATCHED).forEach((f) => { if (checkField(f)) n++; });
    const share = $("#share");
    let b = $("#pc-share-warn");
    if (share && n) {
      if (!b) { b = document.createElement("p"); b.id = "pc-share-warn"; b.className = "pc-warn no-print"; b.setAttribute("role", "status"); share.before(b); }
      b.innerHTML = "<b>Check before sharing:</b> " + (n === 1 ? "one box looks like it has" : n + " boxes look like they have") + " details that could identify your patient.";
    } else if (b) b.remove();
  }
  let t;
  const soon = () => { clearTimeout(t); t = setTimeout(checkAll, 150); };
  document.addEventListener("input", (e) => { if (e.target.matches && e.target.matches(WATCHED)) soon(); }, true);
  const list = $("#programme-list");
  if (list) new MutationObserver(soon).observe(list, { childList: true });
  const share = $("#share");
  if (share) new MutationObserver(soon).observe(share, { attributes: true, attributeFilter: ["hidden"] });

  window.RepSheetPrivacy = { scan, checkAll, nhsValid };
  checkAll();
})();
