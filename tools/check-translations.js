/*
  Checks the translation files in lang/ against the English master text.
  Run from the site folder:  node tools/check-translations.js
  It lists anything missing, or any exercise whose number of steps doesn't match English.
*/
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..");
global.window = {}; global.document = undefined;
require(path.join(root, "exercises.js"));
require(path.join(root, "i18n.js"));
const I = window.RepSheetI18n;
global.RepSheetI18n = I;
const labels = [...new Set([...fs.readFileSync(path.join(root, "illustrations.js"), "utf8").matchAll(/label:\s*"([^"]*)"/g)].map((m) => m[1]))];
const KIT = ["a firm chair", "an exercise band", "a step or stair", "a wall", "a towel", "a light weight (a tin will do)", "a table or worktop", "a bottle", "somewhere to lie down", "a soft ball", "a rolled-up towel"];
let bad = 0;
const only = process.argv[2];
I.LANGS.filter((l) => l.code !== "en" && (!only || l.code === only)).forEach((l) => {
  const file = path.join(root, "lang", l.code + ".js");
  if (!fs.existsSync(file)) { console.log(l.code + ": no file yet"); return; }
  require(file);
  const p = I.packs[l.code], out = [];
  Object.keys(I.EN).forEach((k) => {
    if (p.ui[k] == null) out.push("ui missing: " + k);
    else if (typeof I.EN[k] === "object" && typeof p.ui[k] !== "object") out.push("ui needs number forms: " + k);
    else {
      // Number words like "once" or "two" may leave out {n}, so only the general ("other") form must have every gap
      const vars = [...new Set(JSON.stringify(I.EN[k]).match(/\{\w+\}/g) || [])].join();
      const forms = typeof p.ui[k] === "object" ? [p.ui[k].other] : [p.ui[k]];
      forms.forEach((f) => { const have = new Set(f.match(/\{\w+\}/g) || []); (vars ? vars.split(",") : []).forEach((v) => { if (!have.has(v) && !(k.startsWith("dose.times") || k.startsWith("cell."))) out.push("ui " + k + " lacks " + v + " in: " + f); }); });
    }
  });
  Object.keys(p.ui).forEach((k) => { if (I.EN[k] == null) out.push("ui extra key (not in English): " + k); });
  I.FREQ.forEach((f) => { if (!p.freq || !p.freq[f]) out.push("freq missing: " + f); });
  KIT.forEach((f) => { if (!p.kit || !p.kit[f]) out.push("kit missing: " + f); });
  labels.forEach((f) => { if (!p.labels || !p.labels[f]) out.push("label missing: " + f); });
  window.EXERCISES.forEach((ex) => {
    const r = p.ex && p.ex[ex.id];
    if (!r) { out.push("exercise missing: " + ex.id); return; }
    if (r[1].length !== ex.instructions.length) out.push(ex.id + ": steps " + r[1].length + " vs English " + ex.instructions.length);
    if ((r[2] || []).length !== (ex.progressions || []).length) out.push(ex.id + ": harder " + (r[2] || []).length + " vs " + (ex.progressions || []).length);
    if ((r[3] || []).length !== (ex.regressions || []).length) out.push(ex.id + ": easier " + (r[3] || []).length + " vs " + (ex.regressions || []).length);
  });
  Object.keys(p.ex || {}).forEach((id) => { if (!window.EXERCISES.some((e) => e.id === id)) out.push("exercise not in library: " + id); });
  console.log(l.code + " (" + l.name + "), status " + p.status + ": " + (out.length ? out.length + " problems" : "complete"));
  out.forEach((o) => console.log("   " + o));
  bad += out.length;
});
process.exitCode = bad ? 1 : 0;
