/*
  RepSheet: "Add to home screen", part 1 of 2 (runs first, before the patient page reads its link).

  Why this is needed: an app added to the home screen on Android opens at a fixed address,
  without the programme part of the link (after the "#"). So when the patient adds it, the programme
  part is kept on their own phone (localStorage "repsheet:my-programme") and put back here.
  It holds only what the link already holds: no name, nothing sent anywhere.

  iPhones and iPads add the page exactly as it is, link and all, so they get no manifest here
  (that keeps their home screen icon opening the right programme).
*/
(function () {
  "use strict";
  var KEY = "repsheet:my-programme";
  var ua = navigator.userAgent || "";
  var ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  window.RepSheetInstall = { key: KEY, ios: ios, standalone: standalone, prompt: null };

  try {
    var code = location.hash.slice(1);
    if (code && standalone) localStorage.setItem(KEY, code); // opened as the app with a (new) link: remember it
    else if (!code) {
      var saved = localStorage.getItem(KEY);
      if (saved) history.replaceState(null, "", location.pathname + location.search + "#" + saved);
    }
  } catch (e) { /* storage unavailable: the page works as before */ }

  if (!ios && location.protocol !== "file:") {
    var link = document.createElement("link");
    link.rel = "manifest";
    link.href = "view.webmanifest";
    document.head.appendChild(link);
  }
  // Android Chrome (and Edge, Samsung Internet) say when the page can be installed. Keep that for the button.
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    window.RepSheetInstall.prompt = e;
    document.dispatchEvent(new Event("repsheet:can-install"));
  });
})();
