/*
  ACCESSIBILITY MENU
  One "Accessibility" button in the page header opens and closes a panel holding the display choices
  (larger text, easier reading, high contrast, dark screen, pause pictures).
  Whether the panel is open is remembered on this device only (localStorage). Nothing is sent anywhere.
*/
(function () {
  "use strict";
  const btn = document.getElementById("btn-a11y");
  const panel = document.getElementById("a11y-panel");
  if (!btn || !panel) return;
  const KEY = "repsheet:a11y-open:" + (document.body.classList.contains("patient") ? "patient" : "builder");

  function set(open, save) {
    btn.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
    if (save) { try { if (open) localStorage.setItem(KEY, "1"); else localStorage.removeItem(KEY); } catch (e) { /* storage unavailable */ } }
    // The header is sticky: tell the page its height may have changed
    try { window.dispatchEvent(new Event("resize")); } catch (e) { /* old browser */ }
  }

  let open = false;
  try { open = localStorage.getItem(KEY) === "1"; } catch (e) { /* storage unavailable */ }
  set(open, false);

  btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true", true));
  // Escape closes the panel and puts the keyboard back on the button
  panel.addEventListener("keydown", (e) => {
    if (e.key === "Escape" || e.key === "Esc") { e.preventDefault(); set(false, true); btn.focus(); }
  });
})();
