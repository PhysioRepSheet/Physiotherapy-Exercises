/*
  VISITOR COUNTER (GoatCounter, no cookies)
  Counts page views so we know roughly how many people use RepSheet.

  It is OFF until goatcounterCode is filled in config.js.

  What is sent, and nothing else:
  - which page it was, as a bare name such as "/view.html". Never the part of the link
    after "?" or "#", so a patient's exercises, notes or diary are never sent.
  - a fixed page label from the list below (never the page's own title).
  - screen size (for the phone / tablet / computer split).
  - where the visitor came from, as a website name only (e.g. "google.com"),
    and never on patient pages.
  GoatCounter also sees the visitor's IP address and browser type when the count arrives,
  like any website. It uses them to avoid counting the same person twice and does not keep them.

  Your own visits: open any page with ?count=off at the end (e.g. .../builder.html?count=off)
  and that browser stops being counted. ?count=on turns it back on.
  The media page (media.html) does not load this file, so it is never counted.
*/
(function () {
  "use strict";
  var cfg = window.SITE_CONFIG || {};
  var code = String(cfg.goatcounterCode || "").trim().toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(code)) return;            // not switched on
  if (location.protocol !== "https:") return;                       // local copies and testing
  if (/^(localhost|127\.|\[::1\])/.test(location.hostname)) return;
  if (navigator.webdriver) return;                                   // automated browsers
  if (document.visibilityState === "prerender") return;

  // ?count=off / ?count=on: switch counting for this browser (for Alex's own visits)
  try {
    var flag = new URLSearchParams(location.search).get("count");
    if (flag === "off") localStorage.setItem("repsheet:no-count", "1");
    if (flag === "on") localStorage.removeItem("repsheet:no-count");
    if (localStorage.getItem("repsheet:no-count") === "1") return;
  } catch (e) { /* storage blocked: just count */ }

  var LABELS = {
    "/": "Home",
    "/builder.html": "Handout builder",
    "/view.html": "Patient handout",
    "/pacing.html": "Pacing diary",
    "/privacy.html": "Privacy",
    "/disclaimer.html": "Disclaimer",
    "/accessibility.html": "Accessibility",
    "/contact.html": "Contact",
    "/changes.html": "What's new",
    "/for-nhs-teams.html": "For NHS teams",
    "/404": "Page not found"
  };
  var PATIENT_PAGES = { "/view.html": 1, "/pacing.html": 1 };

  // Bare page name only: last part of the address, no ?query and no #fragment.
  var path;
  if (document.documentElement.getAttribute("data-count-as") === "404") path = "/404";
  else {
    var last = location.pathname.split("/").pop() || "";
    path = (last === "" || last === "index.html") ? "/" : "/" + last;
  }
  if (!LABELS[path]) return;                                         // only count known pages

  // Referrer: website name only, only from other sites, never on patient pages.
  var ref = "";
  if (!PATIENT_PAGES[path]) {
    try {
      var r = document.referrer ? new URL(document.referrer) : null;
      if (r && /^https?:$/.test(r.protocol) && r.hostname !== location.hostname) ref = r.hostname.replace(/^www\./, "");
    } catch (e) { ref = ""; }
  }

  var q = "p=" + encodeURIComponent(path) +
    "&t=" + encodeURIComponent(LABELS[path]) +
    "&s=" + encodeURIComponent([screen.width, screen.height, window.devicePixelRatio || 1].join(",")) +
    "&r=" + encodeURIComponent(ref) +
    "&rnd=" + Math.random().toString(36).slice(2);

  function send() {
    var img = new Image();
    img.referrerPolicy = "no-referrer";                              // never send the full address
    img.src = "https://" + code + ".goatcounter.com/count?" + q;
  }
  if (document.readyState === "complete") send();
  else window.addEventListener("load", send);
})();
