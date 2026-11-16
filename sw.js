/*
  OFFLINE SUPPORT
  Keeps a copy of the site's own files on the device so it still opens without a signal
  (for example in a clinic with poor Wi-Fi, or a patient at home).
  It only stores the site's files. It never stores or sends anything a person types.

  When you change the site, change VERSION below (any new text), so phones fetch the new files.
*/
const VERSION = "repsheet-2026-11-16d";
const FILES = [
  "./", "index.html", "view.html", "privacy.html", "disclaimer.html",
  "styles.css", "view.css",
  "config.js", "exercises.js", "illustrations.js", "figures.js", "starters.js", "common.js", "feedback.js", "app.js", "view.js",
  "vendor/qrcode.js", "vendor/tiny-inflate.js",
  "manifest.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Serve from the device straight away, and refresh the copy in the background when online.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(VERSION).then(async (cache) => {
      const cached = await cache.match(req, { ignoreSearch: true });
      const network = fetch(req).then((res) => {
        if (res && res.ok && res.type === "basic") cache.put(req, res.clone());
        return res;
      }).catch(() => null);
      if (cached) { event.waitUntil(network); return cached; }
      const res = await network;
      return res || new Response("You're offline, and this page hasn't been saved on this device yet.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    })
  );
});
