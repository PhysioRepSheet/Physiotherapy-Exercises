/*
  HANDOUT OPTIONS: fold away
  The "Handout options" group in Handout details opens and closes (a <details> box) with a short slide.
  When closed, a short line shows what is switched on. Open or closed is remembered on this device only.
*/
(function () {
  "use strict";
  const box = document.getElementById("options-fold");
  if (!box) return;
  const summary = box.querySelector("summary");
  const body = box.querySelector(".options-fold-body");
  const sumLine = document.getElementById("options-fold-sum");
  const KEY = "repsheet:options-open";
  const calm = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try { box.open = localStorage.getItem(KEY) === "1"; } catch (e) { /* storage unavailable */ }

  function saved() {
    try { if (box.open) localStorage.setItem(KEY, "1"); else localStorage.removeItem(KEY); } catch (e) { /* storage unavailable */ }
    try { window.dispatchEvent(new Event("resize")); } catch (e) { /* old browser */ }
  }
  box.addEventListener("toggle", saved);

  // Slide open and closed (skipped if the device asks for less motion, or the browser can't animate)
  let anim = null;
  if (summary && body && body.animate) {
    summary.addEventListener("click", (e) => {
      if (calm()) return; // let the browser open/close it straight away
      e.preventDefault();
      if (anim) anim.cancel();
      const opening = !box.open;
      if (opening) box.open = true;
      const full = body.scrollHeight;
      anim = body.animate(
        [{ height: (opening ? 0 : full) + "px", opacity: opening ? 0 : 1 }, { height: (opening ? full : 0) + "px", opacity: opening ? 1 : 0 }],
        { duration: 220, easing: "cubic-bezier(.2,.7,.3,1)" }
      );
      anim.onfinish = () => { anim = null; if (!opening) box.open = false; };
    });
  }

  const NAMES = [["large-print", "Large print"], ["easy-read", "Easy read"], ["tick-chart", "Tick chart"], ["bw-print", "Black and white"], ["paper-saver", "Paper saver"]];
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
