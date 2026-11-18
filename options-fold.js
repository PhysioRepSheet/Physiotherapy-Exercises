/*
  FOLD-AWAY BOXES in Handout details: "Handout options", "Patient and physio" and "Advice and goals"
  Each opens and closes (a <details> box) with a short slide and a turning arrow.
  When closed, a short line shows what is switched on or filled in.
  Open or closed is remembered on this device only. Both start closed.
*/
(function () {
  "use strict";
  const calm = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (id) => document.getElementById(id);
  const shown = (el) => el && !el.closest("[hidden]");

  function fold(boxId, sumId, key, summarise) {
    const box = $(boxId);
    if (!box) return;
    const summary = box.querySelector("summary");
    const body = box.querySelector(".options-fold-body");
    const sumLine = $(sumId);
    try { box.open = localStorage.getItem(key) === "1"; } catch (e) { /* storage unavailable */ }

    box.addEventListener("toggle", () => {
      try { if (box.open) localStorage.setItem(key, "1"); else localStorage.removeItem(key); } catch (e) { /* storage unavailable */ }
      try { window.dispatchEvent(new Event("resize")); } catch (e) { /* old browser */ }
    });

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

    function refresh() { if (sumLine) sumLine.textContent = summarise().join(" · "); }
    box.addEventListener("change", refresh);
    box.addEventListener("input", refresh);
    // Templates, drafts and "Clear" change these boxes without an event, so check again after any click
    document.addEventListener("click", () => setTimeout(refresh, 60), true);
    window.addEventListener("load", () => setTimeout(refresh, 300));
    refresh();
  }

  const OPTIONS = [["large-print", "Large print"], ["easy-read", "Easy read"], ["tick-chart", "Tick chart"], ["bw-print", "Black & white"], ["paper-saver", "Paper saver"]];
  fold("options-fold", "options-fold-sum", "repsheet:options-open", () => {
    const bits = [];
    const lang = $("handout-lang");
    if (lang && lang.selectedIndex >= 0) bits.push(lang.options[lang.selectedIndex].text);
    OPTIONS.forEach(([id, name]) => { const c = $(id); if (c && c.checked && shown(c)) bits.push(name); });
    return bits;
  });

  const PHYSIO = [["patient-name", "Patient name"], ["clinician", "Physio"], ["contact", "Contact"]];
  fold("physio-fold", "physio-fold-sum", "repsheet:physio-open", () => {
    const bits = PHYSIO.filter(([id]) => { const f = $(id); return f && f.value.trim(); }).map(([, name]) => name);
    return bits.length ? bits : ["Optional"];
  });

  const ADVICE = [["patient-message", "Message"], ["general-notes", "Advice"], ["goal", "Goal"], ["plan", "When"], ["duration", "How long"]];
  fold("advice-fold", "advice-fold-sum", "repsheet:advice-open", () => {
    const bits = ADVICE.filter(([id]) => { const f = $(id); return f && f.value.trim(); }).map(([, name]) => name);
    return bits.length ? bits : ["Optional"];
  });
})();
