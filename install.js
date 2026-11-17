/*
  RepSheet: "Add to home screen", part 2 of 2 (see install-start.js).
  - Android (Chrome, Edge, Samsung Internet): a button that opens the phone's own "Install" box.
  - iPhone and iPad: a short tip, because Safari has no install button a page can use.
  - Shown once the programme has loaded and the patient has had a moment to look (or has scrolled).
  - Never shown when already opened from the home screen, on a computer, or if they chose "Not now"
    in the last 30 days (that choice is the only thing saved, on their phone).
*/
(function () {
  "use strict";
  const S = window.RepSheetInstall, I = window.RepSheetI18n;
  const T = (k, v) => (I ? I.t(k, v) : k);
  const $ = (s) => document.querySelector(s);
  const box = $("#install");
  if (!S || !box || S.standalone || location.protocol === "file:") return;

  const HIDE_KEY = "repsheet:install-hidden";
  const DAY = 864e5;
  try { const t = Number(localStorage.getItem(HIDE_KEY)); if (t && Date.now() - t < 30 * DAY) return; } catch (e) { /* carry on */ }

  const touch = window.matchMedia && matchMedia("(pointer: coarse)").matches;
  let mode = S.ios ? "ios" : (S.prompt ? "android" : "");
  let ready = false, shown = false;

  const shareIcon = '<svg class="share-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="Share"><path d="M12 15V3"/><path d="M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function fill() {
    if (I && I.apply) I.apply(box);
    const text = $("#install-text"), btn = $("#btn-install");
    if (mode === "ios") {
      text.innerHTML = esc(T("install.ios", { icon: "{icon}" })).replace("{icon}", shareIcon);
      btn.hidden = true;
      $("#btn-install-close").textContent = T("install.gotIt");
    } else {
      text.textContent = T("install.android");
      btn.hidden = false;
    }
  }

  function show() {
    if (shown || !ready || !mode) return;
    const follow = $("#follow");
    if (follow && !follow.hidden) return; // not while they're doing their exercises step by step
    if ($("#error") && !$("#error").hidden) return;
    shown = true;
    fill();
    box.hidden = false;
    document.body.classList.add("install-open");
  }
  function hide(remember) {
    box.hidden = true;
    document.body.classList.remove("install-open");
    if (remember) { try { localStorage.setItem(HIDE_KEY, String(Date.now())); } catch (e) { /* fine */ } }
  }
  function keepProgramme() {
    try { if (location.hash.length > 1) localStorage.setItem(S.key, location.hash.slice(1)); } catch (e) { /* fine */ }
  }

  document.addEventListener("repsheet:can-install", () => { if (!S.ios) { mode = "android"; show(); } });
  window.addEventListener("appinstalled", () => { keepProgramme(); hide(false); });

  $("#btn-install").addEventListener("click", async () => {
    const p = S.prompt;
    if (!p) { hide(false); return; }
    keepProgramme(); // so the home screen app opens this programme
    p.prompt();
    try {
      const r = await p.userChoice;
      S.prompt = null;
      if (r && r.outcome === "accepted") hide(false); else hide(true);
    } catch (e) { hide(false); }
  });
  $("#btn-install-close").addEventListener("click", () => hide(true));

  // Wait until the programme is on screen (not the "link doesn't work" page), then give them a moment
  if (!touch) return; // phones and tablets only (and on a Mac, Safari reports "iPad"-like: this skips it)
  let n = 0;
  (function wait() {
    const loaded = $("#fa-start-wrap") && !$("#fa-start-wrap").hidden;
    if (!loaded) { if (n++ < 100) setTimeout(wait, 150); return; }
    const go = () => { if (ready) return; ready = true; show(); };
    setTimeout(go, 12000);
    window.addEventListener("scroll", function once() {
      if (window.scrollY > 400) { window.removeEventListener("scroll", once); go(); }
    }, { passive: true });
    // Also a good moment: right after they finish a follow-along session
    const fc = $("#fa-close");
    if (fc) fc.addEventListener("click", () => setTimeout(go, 400));
  })();
})();
