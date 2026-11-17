/*
  DARK MODE
  Follows the phone or computer's own light/dark setting. The "Dark screen" / "Light screen" button
  overrides it on this device only (saved in this browser; nothing is sent anywhere).
  Printing is always on white paper, whatever the screen shows.
  High contrast and easier reading (patient page) always use their own light colours.
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
  const MOON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="theme-ico"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';
  const SUN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="theme-ico"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';
  function label() {
    const b = document.getElementById("btn-theme");
    if (!b) return;
    if (!can) { b.hidden = true; return; }
    const dark = wanted();
    // The button says what it will switch to
    b.innerHTML = (dark ? SUN : MOON) + "<span></span>";
    b.lastChild.textContent = dark ? text("hdr.light", "Light screen") : text("hdr.dark", "Dark screen");
    b.setAttribute("aria-pressed", String(dark));
    b.hidden = lightOnly();
  }

  function toggle() {
    const next = wanted() ? "light" : "dark";
    // Matching the device again means "follow the device" from now on
    choice = (next === "dark") === osDark() ? null : next;
    try { if (choice) localStorage.setItem(KEY, choice); else localStorage.removeItem(KEY); } catch (e) { /* storage unavailable */ }
    apply();
  }

  apply();
  if (mq) { const f = () => { if (!choice) apply(); }; mq.addEventListener ? mq.addEventListener("change", f) : mq.addListener(f); }
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
