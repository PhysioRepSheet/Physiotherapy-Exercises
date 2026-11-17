/*
  TUTORIAL CHECK: run "node tools/check-tutorial.js" before publishing.
  Lists buttons, headings and options on the builder and patient page whose words do not
  appear anywhere in tutorial.html, so the guide can be updated when features change.
  It only warns; it never stops a publish. Add words to IGNORE when they need no explaining.
*/
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const read = (f) => fs.readFileSync(path.join(root, f), "utf8");
const strip = (s) => s.replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/&#?\w+;/g, " ").replace(/\s+/g, " ").trim();
const tutorial = strip(read("tutorial.html")).toLowerCase();
const IGNORE = new Set(["close", "hide", "use", "apply", "cancel", "save", "delete", "remove", "ok", "done", "back", "next",
  "tick all", "untick all", "empty the boxes", "simple", "advanced", "copy", "preview", "undo", "date", "name", "when",
  // Headings and dialog wording that explain themselves on screen
  "exercise library", "patient handout", "in this handout", "hold secs", "change these exercises", "build a handout in three steps",
  "message left", "about", "email this handout", "patient email address", "open email", "my templates", "save the current programme as",
  "summary for your notes", "starting dose", "save and add", "share as a template", "template name", "template link", "not now", "days",
  "language / language", "we couldn't open this programme", "a message from your physio", "my goal", "my plan when i'll do them",
  "how long to keep going", "your week", "how much pain is ok?", "tick a box each day you do your exercises",
  "ready-made templates for common conditions", "next edit and print →", "no exercises yet", "← choose exercises", "picture for the patient's phone", "your own photo or drawing"]);
const missing = new Map();
for (const file of ["builder.html", "view.html"]) {
  const html = read(file).replace(/<!--[\s\S]*?-->/g, "");
  const re = /<(button|summary|h2|h3|legend|label)\b(?![^>]*\bhidden\b)[^>]*>([\s\S]*?)<\/\1>/g;
  let m;
  while ((m = re.exec(html))) {
    let text = strip(m[2].replace(/<span class="(hint|visually-hidden)[^"]*"[^>]*>[\s\S]*?<\/span>/g, "")).replace(/[()…:]/g, "").trim();
    if (!text || text.length < 3 || text.length > 60 || IGNORE.has(text.toLowerCase())) continue;
    if (!tutorial.includes(text.toLowerCase())) missing.set(text, file);
  }
}
if (!missing.size) { console.log("Tutorial check: every on-screen label is mentioned in tutorial.html."); process.exit(0); }
console.log("Tutorial check: these on-screen labels are not mentioned in tutorial.html.");
console.log("If any is a new or renamed feature, update the guide (and its Last updated date):\n");
for (const [t, f] of missing) console.log("  " + f.padEnd(13) + t);
