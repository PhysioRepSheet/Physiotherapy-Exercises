/*
  DARK MODE
  Follows the phone or computer's own light/dark setting. The "Dark mode" on/off switch in the header
  overrides it on this device only (saved in this browser; nothing is sent anywhere).
  Printing is always on white paper, whatever the screen shows.
  High contrast and easier reading (patient page) always use their own light colours.
  Switching between light and dark fades gently (about half a second), both ways. No fade when the
  page first opens, and none at all if the device is set to reduce motion.
*/
(function () {
  "use strict";
  const KEY = "repsheet:theme";
  const root = document.documentElement;
  const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  const osDark = () => !!(mq && mq.matches);
  let choice = null; // "dark", "light" or null (follow the device)
  try { choice = localStorage.getItem(KEY); } catch (e) { /* storage unavailable */ }
  if (choice !== "dark" && choice !== "light") choice = null;

  // Very old browsers can't read the dark colours file properly, so they stay light
  let can = true;
  try { can = !!(window.CSS && CSS.supports && CSS.supports("selector(:is(a))")); } catch (e) { can = false; }
  const wanted = () => can && (choice ? choice === "dark" : osDark());
  // Light-only reading modes on the patient page
  const lightOnly = () => !!(document.body && document.body.classList && (document.body.classList.contains("high-contrast") || document.body.classList.contains("easy-read-screen")));

  // Gentle fade between light and dark. Uses the browser's own cross-fade where it has one,
  // otherwise briefly lets colours drift (see "theme-fading" in dark.css).
  const FADE_MS = 600;
  let fadeTimer = 0;
  const reduceMotion = () => !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  function fade(change) {
    if (reduceMotion() || !document.body) { change(); return; }
    if (document.startViewTransition) {
      root.classList.add("theme-vt");
      try {
        const t = document.startViewTransition(change);
        const done = () => root.classList.remove("theme-vt");
        t.finished.then(done, done);
        return;
      } catch (e) { root.classList.remove("theme-vt"); }
    }
    root.classList.add("theme-fading");
    void root.offsetWidth; // let the browser see the transition before the colours change
    change();
    clearTimeout(fadeTimer);
    fadeTimer = setTimeout(() => root.classList.remove("theme-fading"), FADE_MS + 100);
  }

  function apply() {
    const dark = wanted() && !lightOnly();
    root.setAttribute("data-theme", dark ? "dark" : "light");
    root.style.colorScheme = dark ? "dark" : "light";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0f1719" : "#0e6b62");
    label();
  }

  function text(key, en) {
    const I = window.RepSheetI18n;
    if (document.body && document.body.classList.contains("patient") && I && I.t) { const s = I.t(key); if (s && s !== key) return s; }
    return en;
  }
  function label() {
    const b = document.getElementById("btn-theme");
    if (!b) return;
    if (!can) { b.hidden = true; return; }
    const on = wanted() && !lightOnly();
    // An on/off switch that is always on show. The words stay "Dark mode"; the switch shows on or off.
    const words = b.querySelector(".ts-label");
    if (words) words.textContent = text("hdr.dark", "Dark mode");
    b.setAttribute("aria-checked", String(on));
    // High contrast and easier reading use their own light colours, so the switch rests while they are on
    b.disabled = lightOnly();
    if (b.disabled) b.title = text("hdr.darkoff", "Turn off high contrast or easier reading to use dark mode");
    else b.removeAttribute("title");
  }

  function toggle() {
    const next = wanted() ? "light" : "dark";
    // Matching the device again means "follow the device" from now on
    choice = (next === "dark") === osDark() ? null : next;
    try { if (choice) localStorage.setItem(KEY, choice); else localStorage.removeItem(KEY); } catch (e) { /* storage unavailable */ }
    fade(apply);
  }

  apply();
  if (mq) { const f = () => { if (!choice) fade(apply); }; mq.addEventListener ? mq.addEventListener("change", f) : mq.addListener(f); }
  function ready() {
    const b = document.getElementById("btn-theme");
    if (b) b.addEventListener("click", toggle);
    apply();
    // Re-check when high contrast or easier reading is switched on or off
    if (window.MutationObserver) new MutationObserver(apply).observe(document.body, { attributes: true, attributeFilter: ["class"] });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", ready); else ready();
  window.RepTheme = { apply, label, toggle };
})();
