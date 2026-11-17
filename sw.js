/*
  OFFLINE SUPPORT
  Keeps a copy of the site's own files on the device so it still opens without a signal
  (for example in a clinic with poor Wi-Fi, or a patient at home).
  It only stores the site's files. It never stores or sends anything a person types.

  When you change the site, change VERSION below (any new text), so phones fetch the new files.
*/
const VERSION = "repsheet-2026-11-17-dark-dropdowns";
// Natural-voice recordings (audio/...) are kept in their own store. Each file's name comes from its words,
// so a file never changes: they are saved the first time they play and are not re-downloaded on updates.
const AUDIO = "repsheet-audio-1";
const FILES = [
  "./", "index.html", "builder.html", "view.html", "privacy.html", "disclaimer.html", "for-nhs-teams.html", "accessibility.html", "changes.html", "404.html", "pacing.html",
  "styles.css", "view.css", "landing.css", "pacing.css", "i18n.css", "dark.css",
  "config.js", "theme.js", "i18n.js", "i18n-builder.js", "exercises.js", "illustrations.js", "figures.js", "starters.js", "common.js", "voice.js", "feedback.js", "app.js", "view.js", "privacy-check.js", "bodymap.js", "patient-extras.js", "pdf-maker.js", "pacing.js", "install-start.js", "install.js", "a11y-menu.js", "options-fold.js", "vendor/jspdf.umd.min.js", "vendor/html2canvas.min.js",
  "vendor/qrcode.js", "vendor/tiny-inflate.js",
  "manifest.webmanifest", "view.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png",
  "images/landing/builder.jpg", "images/landing/phone.jpg", "images/landing/handout.jpg"
];

self.addEventListener("install", (event) => {
  // "reload" skips the browser's own short-term copy, so a new version never mixes old and new files
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== AUDIO).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Online: always get the latest files (checking with the server, which is quick), and keep a copy.
// Offline, or no answer within 4 seconds: use the copy saved on the device.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  if (/\/audio\/[^/]+\/[^/]+\.mp3$/.test(new URL(req.url).pathname)) {
    event.respondWith(caches.open(AUDIO).then(async (cache) => {
      const hit = await cache.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res && res.ok && res.status === 200) cache.put(req, res.clone());
      return res;
    }));
    return;
  }
  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const network = fetch(req, { cache: "no-cache" }).then((res) => {
        if (res && res.ok && res.type === "basic") cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      const timeout = new Promise((r) => setTimeout(() => r(null), 4000));
      const first = await Promise.race([network, timeout]);
      if (first) return first;
      const cached = await cache.match(req, { ignoreSearch: true });
      if (cached) { event.waitUntil(network); return cached; }
      const late = await network;
      return late || new Response("You're offline, and this page hasn't been saved on this device yet.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    })
  );
});
