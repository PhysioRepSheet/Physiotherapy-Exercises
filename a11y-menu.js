/*
  ACCESSIBILITY MENU
  One "Accessibility" button in the page header opens a small dropdown holding the display choices
  (larger text, easier reading, high contrast, dark screen, pause pictures).
  It closes with the button, the Escape key, or a click anywhere else. Nothing is saved or sent anywhere.
*/
(function () {
  "use strict";
  const btn = document.getElementById("btn-a11y");
  const panel = document.getElementById("a11y-panel");
  if (!btn || !panel) return;
  const menu = btn.parentElement;

  function set(open) {
    btn.setAttribute("aria-expanded", String(open));
    panel.hidden = !open;
  }
  set(false);

  btn.addEventListener("click", () => set(btn.getAttribute("aria-expanded") !== "true"));
  // Escape closes the menu and puts the keyboard back on the button
  menu.addEventListener("keydown", (e) => {
    if ((e.key === "Escape" || e.key === "Esc") && !panel.hidden) { e.preventDefault(); set(false); btn.focus(); }
  });
  // A click or tap anywhere else closes it
  // (composedPath, because a button inside can redraw itself while it is clicked)
  document.addEventListener("click", (e) => {
    if (panel.hidden) return;
    const path = e.composedPath ? e.composedPath() : [e.target];
    if (path.indexOf(menu) === -1 && !(e.target.isConnected === false)) set(false);
  });
  // Moving the keyboard out of the menu closes it
  menu.addEventListener("focusout", (e) => { if (!panel.hidden && e.relatedTarget && !menu.contains(e.relatedTarget)) set(false); });
})();
