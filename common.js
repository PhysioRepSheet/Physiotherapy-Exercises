/*
  Shared helpers used by both the builder (index.html) and the patient page (view.html).
*/
(function () {
  "use strict";

  const LIBRARY = window.EXERCISES || [];
  const ILLUSTRATIONS = window.ILLUSTRATIONS || {};
  const byId = (id) => LIBRARY.find((e) => e.id === id);

  // ---------- "3 sets of 10 reps · hold for 5 seconds · twice a day" ----------
  function plural(n, word) { return n + " " + word + (Number(n) === 1 ? "" : "s"); }
  function describe(p) {
    const parts = [];
    const sets = Number(p.sets), reps = Number(p.reps), hold = Number(p.hold);
    // Plain words for patients: "10 times, 3 rounds" rather than "3 sets of 10 reps"
    const times = (n) => (n === 1 ? "once" : n + " times");
    const rounds = (n) => plural(n, "round");
    if (sets > 1 && reps > 1) parts.push(times(reps) + ", " + rounds(sets));
    else if (reps > 1) parts.push(times(reps));
    else if (sets > 1) parts.push(rounds(sets));
    if (hold) parts.push("hold for " + plural(hold, "second") + (reps > 1 || sets > 1 ? " each time" : ""));
    if (p.load && String(p.load).trim()) parts.push("with " + String(p.load).trim());
    if (p.frequency && String(p.frequency).trim()) parts.push(String(p.frequency).trim());
    const text = parts.join(" · ");
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
  }

  // ---------- pictures ----------
  const PLACEHOLDER =
    '<svg viewBox="0 0 48 48" class="placeholder" aria-hidden="true"><circle cx="24" cy="9" r="5"/><path d="M24 15v15M24 20l-10 6M24 20l10 6M24 30l-7 13M24 30l7 13"/></svg>';

  // mode: "thumb" (small still), "anim" (moving, like a GIF), "steps" (numbered pictures for printing)
  function picture(ex, mode, opts = {}) {
    const box = document.createElement("div");
    box.className = "pic pic-" + mode;
    if (ex.image) {
      const img = document.createElement("img");
      img.src = ex.image;
      img.alt = "Illustration of " + ex.name;
      img.loading = "lazy";
      box.append(img);
      return { el: box };
    }
    const ill = ILLUSTRATIONS[ex.id];
    if (!ill || !window.PhysioFigures) { box.innerHTML = PLACEHOLDER; return { el: box }; }
    if (mode === "thumb") {
      box.innerHTML = window.PhysioFigures.frameSVG(ill, ill.frames.length - 1, { arrows: false, alt: ex.name });
      return { el: box };
    }
    if (mode === "steps") {
      box.innerHTML = window.PhysioFigures.stripSVG(ill, "Step by step pictures of " + ex.name);
      return { el: box };
    }
    const controls = window.PhysioFigures.animate(box, ill, { alt: "Moving illustration of " + ex.name, offset: opts.offset });
    return { el: box, controls };
  }

  // ---------- videos ----------
  // Turns a YouTube / Vimeo link or a local file into something we can embed.
  function videoInfo(url) {
    if (!url) return null;
    let m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
    if (m) return { kind: "iframe", src: "https://www.youtube-nocookie.com/embed/" + m[1] + "?rel=0", host: "YouTube" };
    m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (m) return { kind: "iframe", src: "https://player.vimeo.com/video/" + m[1] + "?dnt=1", host: "Vimeo" };
    if (/^https?:\/\//.test(url) || /\.(mp4|webm|ogg|mov)$/i.test(url)) return { kind: "file", src: url };
    return null;
  }

  // ---------- packing a programme into a link (nothing is stored anywhere) ----------
  function toBase64Url(bytes) {
    let bin = "";
    bytes.forEach((b) => (bin += String.fromCharCode(b)));
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  function fromBase64Url(str) {
    const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(bin, (c) => c.charCodeAt(0));
  }
  async function streamBytes(bytes, stream) {
    const out = await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer();
    return new Uint8Array(out);
  }
  const canCompress = typeof CompressionStream === "function" && typeof DecompressionStream === "function";

  async function encode(data) {
    const bytes = new TextEncoder().encode(JSON.stringify(data));
    if (canCompress) {
      try { return "z" + toBase64Url(await streamBytes(bytes, new CompressionStream("deflate-raw"))); } catch (e) { /* fall through */ }
    }
    return "j" + toBase64Url(bytes);
  }

  async function decode(str) {
    const kind = str.charAt(0), bytes = fromBase64Url(str.slice(1));
    let raw = bytes;
    if (kind === "z") {
      if (typeof DecompressionStream === "function") {
        try { raw = await streamBytes(bytes, new DecompressionStream("deflate-raw")); } catch (e) { raw = null; }
      } else raw = null;
      // Older phones (for example iPhones stuck on iOS 15) lack DecompressionStream: use the small fallback
      if (!raw && window.tinyInflate) raw = window.tinyInflate(bytes, new Uint8Array(512 * 1024));
      if (!raw) throw new Error("Can't unpack this link on this browser");
    }
    return JSON.parse(new TextDecoder().decode(raw));
  }

  // Compact form of one programme item: [id, sets, reps, hold, frequency, notes, [progressions], [regressions]]
  function packItem(it) {
    const arr = [it.id, it.sets, it.reps, it.hold, it.frequency, it.notes || "", it.prog || [], it.reg || [], it.load || ""];
    while (arr.length > 5 && (arr[arr.length - 1] === "" || (Array.isArray(arr[arr.length - 1]) && !arr[arr.length - 1].length))) arr.pop();
    return arr;
  }
  function unpackItem(a) {
    return { id: a[0], sets: a[1] ?? "", reps: a[2] ?? "", hold: a[3] ?? "", frequency: a[4] ?? "", notes: a[5] || "", prog: a[6] || [], reg: a[7] || [], load: a[8] || "" };
  }

  // Rough time for one session: about 4 seconds a rep plus any hold, 30 seconds rest
  // between rounds and 30 seconds to get set up. Rounded up to the next 5 minutes.
  function estimateMinutes(items) {
    let secs = 0;
    items.forEach((it) => {
      const sets = Number(it.sets) || 1, reps = Number(it.reps) || 1, hold = Number(it.hold) || 0;
      secs += sets * reps * (4 + hold) + (sets - 1) * 30 + 30;
    });
    return Math.max(5, Math.ceil(secs / 300) * 5);
  }

  // Pain guide wording. level 1 = mild ache only; 3 or 5 = pain allowed up to that score out of 10.
  function painGuide(level) {
    const n = Number(level) || 1;
    if (n <= 1) return {
      green: "A mild ache or stretch that settles within an hour or so.",
      amber: "Pain that lasts after the exercises, or is worse the next morning. Do fewer, or do them more gently."
    };
    return {
      green: "Pain up to " + n + " out of 10 while you exercise is OK. It should settle by the next morning.",
      amber: "Pain above " + n + " out of 10, or pain that is worse the next morning. Do fewer, or do them more gently."
    };
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return isNaN(d) ? iso : d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  }

  window.Handout = { LIBRARY, byId, describe, picture, videoInfo, encode, decode, packItem, unpackItem, formatDate, estimateMinutes, painGuide, canCompress };
})();
