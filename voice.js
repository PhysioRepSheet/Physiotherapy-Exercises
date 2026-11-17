/*
  RepSheet: natural-voice "Read aloud".

  HOW IT WORKS
  - Every exercise name, step, "harder / easier" line and common dose ("10 times, 3 rounds")
    has a short pre-recorded MP3 in the "audio/en" folder, made once with the free Kokoro voice.
  - Each recording is named after a short code worked out from its exact words (see key() below),
    so a recording only plays when the words on screen match it exactly.
  - Anything without a recording (the physio's own notes, own exercises, weights, other languages,
    or a step you have just edited) is read by the phone's own built-in voice instead.
  - Recordings are only downloaded when someone taps "Read aloud", then kept on the phone for offline use.
  - Nothing is recorded from the patient and nothing is sent anywhere.

  AFTER EDITING EXERCISES
  - Changed or new wording simply falls back to the phone's voice until you re-run the recorder
    (tools/voice/README.md explains how). Nothing breaks.
*/
(function () {
  "use strict";

  const BASE = "audio/";
  const canSynth = typeof window !== "undefined" && "speechSynthesis" in window && typeof SpeechSynthesisUtterance === "function";
  const canAudio = typeof window !== "undefined" && typeof Audio === "function";

  // Same words, same code: lower case, plain punctuation, no full stop at the end.
  function norm(text) {
    return String(text || "")
      .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-")
      .replace(/\s*·\s*/g, ", ")
      .replace(/\s+/g, " ").trim().toLowerCase()
      .replace(/[.!?:;,\s]+$/, "");
  }
  // A short code for some words (FNV-1a hash, written in base 36)
  function key(text) {
    const s = norm(text);
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
    return h.toString(36);
  }
  // The dose line is several bits joined by " · ". Each bit is looked up on its own.
  function pieces(text) {
    return String(text || "").split(/\s*·\s*/).map((t) => t.trim()).filter(Boolean);
  }

  // ---------- which recordings exist ----------
  const lists = {}; // lang -> Promise<Set of codes>
  function clipsFor(lang) {
    if (!canAudio) return Promise.resolve(new Set());
    if (!lists[lang]) {
      lists[lang] = fetch(BASE + lang + "/index.json")
        .then((r) => (r.ok ? r.json() : { clips: [] }))
        .then((j) => new Set(j.clips || []))
        .catch(() => new Set());
    }
    return lists[lang];
  }

  // ---------- playing ----------
  let player = null;  // one audio element, reused (phones only let a tap start sound)
  let runId = 0;      // goes up on every stop, so old callbacks know to give up
  let deviceVoice = null;

  function pickDeviceVoice(langTag) {
    if (!canSynth) return null;
    const voices = speechSynthesis.getVoices();
    const base = langTag.split("-")[0].toLowerCase();
    return voices.find((v) => v.lang === langTag) || voices.find((v) => v.lang.toLowerCase().startsWith(base)) || null;
  }

  // Fetched as a whole file then played (iPhones can't play sound straight from the offline store)
  const blobs = new Map();
  function getClip(code, lang) {
    const url = BASE + lang + "/" + code + ".mp3";
    if (!blobs.has(url)) {
      blobs.set(url, fetch(url).then((r) => (r.ok ? r.blob() : null)).then((b) => (b ? URL.createObjectURL(b) : null)).catch(() => null));
    }
    return blobs.get(url);
  }
  async function playClip(code, lang, id) {
    if (!player) { player = new Audio(); player.preload = "auto"; }
    const src = await getClip(code, lang);
    if (!src || id !== runId) return false;
    return new Promise((resolve) => {
      const done = (ok) => { player.onended = player.onerror = null; resolve(ok); };
      player.onended = () => done(true);
      player.onerror = () => done(false);
      player.src = src;
      const p = player.play();
      if (p && p.catch) p.catch(() => done(false));
    });
  }

  function sayWithDevice(text, langTag, id) {
    return new Promise((resolve) => {
      if (!canSynth || id !== runId) return resolve();
      const u = new SpeechSynthesisUtterance(text.replace(/·/g, ","));
      u.lang = langTag;
      deviceVoice = deviceVoice && deviceVoice.lang === langTag ? deviceVoice : pickDeviceVoice(langTag);
      if (deviceVoice) u.voice = deviceVoice;
      u.rate = 0.9;
      u.onend = u.onerror = () => resolve();
      speechSynthesis.speak(u);
    });
  }

  // Phones only allow sound that starts straight from a tap. This plays a tiny silent sound
  // during the tap, so the recordings that follow (after a short download) are allowed too.
  let unlocked = false;
  function unlock() {
    if (unlocked || !canAudio) return;
    unlocked = true;
    if (!player) { player = new Audio(); player.preload = "auto"; }
    const n = 160, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const str = (o, t) => { for (let i = 0; i < t.length; i++) v.setUint8(o + i, t.charCodeAt(i)); };
    str(0, "RIFF"); v.setUint32(4, 36 + n * 2, true); str(8, "WAVEfmt "); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, 8000, true); v.setUint32(28, 16000, true);
    v.setUint16(32, 2, true); v.setUint16(34, 16, true); str(36, "data"); v.setUint32(40, n * 2, true);
    player.src = URL.createObjectURL(new Blob([buf], { type: "audio/wav" }));
    const p = player.play();
    if (p && p.catch) p.catch(() => { unlocked = false; });
  }

  const pause = (ms) => new Promise((r) => setTimeout(r, ms));

  /*
    Read a list of things out loud, one after another.
    parts:  array of { text, el, group } (el is only passed back to onPart; parts next to each other
            with the same group, like the steps, are played as one recording if there is one)
    opts:   { lang: "en" (or "" for phone's voice only), voice: "en-GB", onPart(part), onEnd() }
  */
  async function read(parts, opts = {}) {
    stop();
    if (opts.lang) unlock();
    const id = runId;
    const lang = opts.lang || "";          // "" = no recordings, phone's voice only
    const langTag = opts.voice || "en-GB";
    const have = lang ? await clipsFor(lang) : new Set();
    // Parts with the same "group" (the steps) are recorded as one flowing passage.
    const runs = [];
    parts.forEach((p) => {
      const last = runs[runs.length - 1];
      if (p.group && last && last.group === p.group) last.items.push(p);
      else runs.push({ group: p.group, items: [p] });
    });
    const say = async (text) => {
      for (const bit of pieces(text)) {
        if (id !== runId) return;
        const code = key(bit);
        let ok = false;
        if (have.has(code)) ok = await playClip(code, lang, id);
        if (id !== runId) return;
        if (!ok) await sayWithDevice(bit, langTag, id);
        await pause(250);
      }
    };
    for (const run of runs) {
      if (id !== runId) return;
      const whole = run.items.map((p) => p.text.trim()).join(" ");
      if (run.items.length > 1 && have.has(key(whole))) {
        if (opts.onPart) opts.onPart({ text: whole, els: run.items.map((p) => p.el).filter(Boolean) });
        const ok = await playClip(key(whole), lang, id);
        if (id !== runId) return;
        if (ok) { await pause(250); continue; }
      }
      for (const part of run.items) {
        if (id !== runId) return;
        if (opts.onPart) opts.onPart(part);
        await say(part.text);
      }
    }
    if (id === runId && opts.onEnd) opts.onEnd();
  }

  function stop() {
    runId++;
    if (player) { player.onended = player.onerror = null; try { player.pause(); } catch (e) { /* ignore */ } }
    if (canSynth) speechSynthesis.cancel();
  }

  const api = { read, stop, key, norm, pieces, available: canSynth || canAudio };
  if (typeof window !== "undefined") window.RepVoice = api;
  if (typeof module !== "undefined") module.exports = api;
})();
