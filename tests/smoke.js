/*
  RepSheet smoke tests. Run from the site folder:  node tests/smoke.js
  Needs Playwright with Chromium (npm i playwright && npx playwright install chromium).
  Checks that:
  - every page loads with no script errors
  - old patient links (made by earlier versions of the site, in tests/old-links.json) still open
  - a handout can be built and its patient link opens on a phone
  - the service worker file list has no missing files
*/
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium, devices } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webmanifest": "application/manifest+json", ".txt": "text/plain" };
let failed = 0;
const ok = (cond, msg) => { console.log((cond ? "  ok   " : "  FAIL ") + msg); if (!cond) failed++; };

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split("?")[0].split("#")[0]);
  if (p.endsWith("/")) p += "index.html";
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end("not found"); }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

(async () => {
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const BASE = "http://127.0.0.1:" + server.address().port + "/";
  const browser = await chromium.launch();
  const watch = (page, errs) => {
    page.on("pageerror", (e) => errs.push(e.message));
    page.on("console", (m) => { if (m.type() === "error" && !/favicon|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  };

  console.log("Pages load without errors");
  const pages = ["index.html", "builder.html", "view.html", "privacy.html", "disclaimer.html", "contact.html", "for-nhs-teams.html", "accessibility.html", "changes.html", "404.html"]
    .filter((f) => fs.existsSync(path.join(ROOT, f)));
  for (const f of pages) {
    const page = await browser.newPage(); const errs = []; watch(page, errs);
    const res = await page.goto(BASE + f); await page.waitForTimeout(400);
    ok(res.ok() && errs.length === 0, f + (errs.length ? " -> " + errs.join(" | ") : ""));
    await page.close();
  }

  console.log("Old patient links still open");
  const phone = await browser.newContext({ ...devices["iPhone 13"] });
  const old = JSON.parse(fs.readFileSync(path.join(__dirname, "old-links.json"), "utf8"));
  for (const link of old) {
    const page = await phone.newPage(); const errs = []; watch(page, errs);
    await page.goto(BASE + "view.html#" + link.code); await page.waitForTimeout(700);
    const names = await page.$$eval("#list > li h2", (n) => n.map((x) => x.textContent.trim()));
    ok(link.names.every((n) => names.some((h) => h.includes(n))) && errs.length === 0, link.name + " (" + names.length + " exercises)" + (errs.length ? " -> " + errs.join(" | ") : ""));
    await page.close();
  }

  console.log("Build a handout and open its patient link");
  {
    const page = await browser.newPage({ viewport: { width: 1300, height: 900 } }); const errs = []; watch(page, errs);
    await page.goto(BASE + "builder.html"); await page.waitForTimeout(500);
    for (const q of ["sit to stand", "bridge"]) { await page.fill("#search", q); await page.press("#search", "Enter"); await page.waitForTimeout(250); }
    const cards = await page.$$eval("#programme-list > li", (n) => n.length);
    ok(cards === 2, "two exercises added from search (" + cards + ")");
    await page.waitForTimeout(500);
    const link = await page.inputValue("#share-link");
    ok(/view\.html#/.test(link), "patient link made");
    const p2 = await phone.newPage(); watch(p2, errs);
    await p2.goto(BASE + "view.html#" + link.split("#")[1]); await p2.waitForTimeout(700);
    const shown = await p2.$$eval("#list > li h2", (n) => n.length);
    ok(shown === 2, "patient page shows both exercises (" + shown + ")");
    ok(errs.length === 0, "no errors" + (errs.length ? " -> " + errs.join(" | ") : ""));
    await page.close(); await p2.close();
  }

  console.log("Refresh keeps the handout in the tab");
  {
    const page = await browser.newPage({ viewport: { width: 1300, height: 900 } }); const errs = []; watch(page, errs);
    await page.goto(BASE + "builder.html"); await page.waitForTimeout(500);
    await page.fill("#search", "bridge"); await page.press("#search", "Enter"); await page.waitForTimeout(700);
    await page.reload(); await page.waitForTimeout(800);
    const kept = await page.$$eval("#programme-list > li", (n) => n.length);
    ok(kept === 1 && errs.length === 0, "exercise still there after refresh (" + kept + ")" + (errs.length ? " -> " + errs.join(" | ") : ""));
    await page.close();
  }

  console.log("Phone handout PDF");
  {
    const page = await phone.newPage(); const errs = []; watch(page, errs);
    await page.goto(BASE + "builder.html"); await page.waitForTimeout(500);
    await page.fill("#search", "sit to stand"); await page.press("#search", "Enter"); await page.waitForTimeout(400);
    await page.click("#btn-print");
    await page.waitForSelector(".pdf-ready:not([hidden]), .pdf-error:not([hidden])", { timeout: 60000 });
    const size = await page.evaluate(() => (window.RepSheetPdf.lastFile() || { size: 0 }).size);
    ok(size > 20000 && errs.length === 0, "PDF made on the phone (" + Math.round(size / 1024) + " KB)" + (errs.length ? " -> " + errs.join(" | ") : ""));
    await page.close();
  }

  console.log("Service worker file list");
  {
    const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
    const list = JSON.parse("[" + sw.match(/const FILES = \[([\s\S]*?)\];/)[1].replace(/,\s*$/, "") + "]");
    const missing = list.filter((f) => f !== "./" && !fs.existsSync(path.join(ROOT, f)));
    ok(missing.length === 0, "every listed file exists" + (missing.length ? " -> missing " + missing.join(", ") : ""));
  }

  await browser.close(); server.close();
  console.log(failed ? "\n" + failed + " check(s) failed" : "\nAll checks passed");
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
