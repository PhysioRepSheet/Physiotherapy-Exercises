/*
  HANDOUT AND PATIENT PAGE OPTIONS: fold away
  The "Handout and patient page options" group in Handout details opens and closes (a <details> box).
  When closed, a short line shows what is switched on. Open or closed is remembered on this device only.
*/
(function () {
  "use strict";
  const box = document.getElementById("options-fold");
  const sumLine = document.getElementById("options-fold-sum");
  if (!box) return;
  const KEY = "repsheet:options-open";
  try { box.open = localStorage.getItem(KEY) === "1"; } catch (e) { /* storage unavailable */ }
  box.addEventListener("toggle", () => {
    try { if (box.open) localStorage.setItem(KEY, "1"); else localStorage.removeItem(KEY); } catch (e) { /* storage unavailable */ }
    try { window.dispatchEvent(new Event("resize")); } catch (e) { /* old browser */ }
  });

  const NAMES = [["large-print", "Large print"], ["easy-read", "Easy read"], ["tick-chart", "Tick chart"], ["check-in", "Check-in"], ["bw-print", "Black and white"], ["paper-saver", "Paper saver"]];
  function refresh() {
    if (!sumLine) return;
    const bits = [];
    const lang = document.getElementById("handout-lang");
    if (lang && lang.selectedIndex >= 0) bits.push(lang.options[lang.selectedIndex].text);
    NAMES.forEach(([id, name]) => { const c = document.getElementById(id); if (c && c.checked && !c.closest("[hidden]")) bits.push(name); });
    sumLine.textContent = bits.join(" · ");
  }
  box.addEventListener("change", refresh);
  // Templates, drafts and "Start again" change these boxes without a change event, so check again after any click
  document.addEventListener("click", () => setTimeout(refresh, 60), true);
  window.addEventListener("load", () => setTimeout(refresh, 300));
  refresh();
})();
