/*
  "Add photos and videos" page (media.html).

  How it works, in plain words:
  - You pick an exercise and drop photos (up to 3) or a video on it.
  - Photos are joined side by side, numbered, shrunk to a sensible size and saved as a fresh JPEG.
    Re-drawing them removes hidden details such as the place they were taken (GPS).
  - Videos keep their picture and sound, but the hidden details inside the file
    (place, phone model, date) are blanked out before upload.
  - "Put on the website" saves the files to the website's GitHub folder in one go and updates media.js,
    which tells the builder and patient pages which exercises have your own photo or video.
  - It needs a GitHub key with "Contents: Read and write" on this one repository. The key stays in this
    browser only. Nothing about patients is ever involved.
*/
(function () {
  "use strict";

  // Where the website lives on GitHub
  const REPO = "PhysioRepSheet/Physiotherapy-Exercises";
  const BRANCH = "main";
  const API = "https://api.github.com/repos/" + REPO;
  const KEY_STORE = "repsheet:media-key";
  const AUTHOR = { name: "RepSheet", email: "357596869+PhysioRepSheet@users.noreply.github.com" };

  const MAX_PHOTOS = 3;
  const VIDEO_WARN_MB = 25;
  const VIDEO_MAX_MB = 90; // GitHub refuses files over 100 MB
  const VIDEO_WARN_SECONDS = 90;

  const H = window.Handout;
  const LIBRARY = window.EXERCISES || [];
  const $ = (s) => document.querySelector(s);

  // What's on the website now (from media.js); refreshed from GitHub once connected
  let live = JSON.parse(JSON.stringify(window.REPSHEET_MEDIA || {}));
  let key = "";
  let selected = null;     // exercise being edited
  let draft = null;        // { photos: [{file, url}], video: {file, url, ext, warn}, delImage, delVideo }
  const queue = [];        // [{ id, name, image: {blob, url} | null, video: {blob, ext} | null, delImage, delVideo }]

  // ---------- storage (the key only; wrapped because private windows can refuse) ----------
  function store(get, k, v) {
    try {
      if (get) return localStorage.getItem(k) || sessionStorage.getItem(k) || "";
      if (v === null) { localStorage.removeItem(k); sessionStorage.removeItem(k); }
      else ($("#remember").checked ? localStorage : sessionStorage).setItem(k, v);
    } catch (e) { /* not available */ }
    return "";
  }

  // ---------- GitHub ----------
  async function gh(path, opts = {}) {
    const res = await fetch(path.startsWith("http") ? path : API + path, {
      method: opts.method || "GET",
      headers: Object.assign({ Accept: "application/vnd.github+json", Authorization: "Bearer " + key, "X-GitHub-Api-Version": "2022-11-28" },
        opts.body ? { "Content-Type": "application/json" } : {}),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: "no-store"
    });
    if (opts.allow404 && res.status === 404) return null;
    if (!res.ok) {
      let detail = "";
      try { detail = (await res.json()).message || ""; } catch (e) { /* no body */ }
      const err = new Error(detail || ("GitHub said " + res.status));
      err.status = res.status;
      throw err;
    }
    return res.status === 204 ? null : res.json();
  }

  function b64ToText(b64) {
    const bin = atob(b64.replace(/\s/g, ""));
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
  }
  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(",")[1] || "");
      r.onerror = () => reject(r.error);
      r.readAsDataURL(blob);
    });
  }

  // media.js keeps the list as JSON between "window.REPSHEET_MEDIA = " and the end marker
  const LIST_RE = /window\.REPSHEET_MEDIA = ([\s\S]*?);\n\/\/ ---- end of list ----/;
  function parseMediaFile(text) {
    const m = text && text.match(LIST_RE);
    if (!m) return null;
    try { return JSON.parse(m[1]); } catch (e) { return null; }
  }
  function writeMediaFile(text, map) {
    const sorted = {};
    Object.keys(map).sort().forEach((id) => {
      const e = map[id] || {};
      if (e.image || e.video) sorted[id] = { image: e.image || "", video: e.video || "" };
    });
    const json = Object.keys(sorted).length ? JSON.stringify(sorted, null, 2) : "{}";
    return text.replace(LIST_RE, () => "window.REPSHEET_MEDIA = " + json + ";\n// ---- end of list ----");
  }

  async function readLiveList(ref) {
    const f = await gh("/contents/media.js?ref=" + encodeURIComponent(ref || BRANCH), { allow404: true });
    if (!f) throw new Error("media.js isn't on the website yet. Ask Claude to publish the photo and video update first.");
    const text = b64ToText(f.content);
    const map = parseMediaFile(text);
    if (!map) throw new Error("media.js on the website has been changed by hand and can't be read. Ask Claude to check it.");
    return { text, map };
  }

  // ---------- connect ----------
  function setConnected(on) {
    $("#connect-status").textContent = on ? "Connected" : "Not connected";
    $("#connect-status").classList.toggle("on", on);
    $("#connect-body").hidden = on;
    $("#connected-body").hidden = !on;
    updateButtons();
  }
  function connectMsg(text, kind) { const m = $("#connect-msg"); m.textContent = text; m.className = "mx-msg" + (kind ? " " + kind : ""); }

  async function connect(k, quiet) {
    key = k.trim();
    if (!key) { connectMsg("Paste your key first.", "bad"); return false; }
    if (!quiet) connectMsg("Checking…");
    try {
      const repo = await gh("");
      if (!repo.permissions || !repo.permissions.push) throw Object.assign(new Error("no-write"), { status: 403 });
      try { live = (await readLiveList()).map; } catch (e) { /* media.js not published yet: handled when saving */ }
      store(false, KEY_STORE, key);
      $("#key").value = "";
      connectMsg("");
      setConnected(true);
      renderList();
      if (selected) select(selected.id, true);
      return true;
    } catch (e) {
      key = "";
      setConnected(false);
      if (quiet) { store(false, KEY_STORE, null); connectMsg("Your saved key no longer works (it may have run out). Please make a new one.", "bad"); return false; }
      const why = e.status === 401 ? "GitHub didn't accept that key. Check you copied all of it."
        : e.status === 404 || e.status === 403 ? "That key can't change the website. In step 3 pick Physiotherapy-Exercises, and in step 4 set Contents to Read and write."
        : "Couldn't reach GitHub. Check your internet connection and try again.";
      connectMsg(why, "bad");
      return false;
    }
  }

  // ---------- the exercise list ----------
  function mediaState(id) {
    const q = queue.find((x) => x.id === id);
    const l = live[id] || {};
    return { photo: !!l.image, video: !!l.video, waiting: !!q };
  }

  function renderList() {
    const q = $("#q").value.trim().toLowerCase();
    const area = $("#area").value;
    const ul = $("#list");
    ul.innerHTML = "";
    LIBRARY.filter((ex) => (!area || ex.area === area) &&
      (!q || (ex.name + " " + (ex.aliases || "") + " " + ex.area).toLowerCase().includes(q)))
      .forEach((ex) => {
        const li = document.createElement("li");
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.id = ex.id;
        if (selected && selected.id === ex.id) b.setAttribute("aria-current", "true");
        const st = mediaState(ex.id);
        b.append(H.picture(ex, "thumb").el);
        const t = document.createElement("span");
        t.className = "mx-li-text";
        const n = document.createElement("span"); n.className = "mx-li-name"; n.textContent = ex.name;
        const s = document.createElement("span"); s.className = "mx-li-sub";
        const tags = [];
        if (st.photo) tags.push('<span class="mx-tag">Your photo</span>');
        if (st.video) tags.push('<span class="mx-tag">Video</span>');
        if (st.waiting) tags.push('<span class="mx-tag wait">Waiting to go on</span>');
        s.innerHTML = tags.join("") + (tags.length ? "" : escapeHtml(ex.area));
        t.append(n, s);
        b.append(t);
        b.addEventListener("click", () => select(ex.id));
        li.append(b);
        ul.append(li);
      });
    if (!ul.children.length) { const li = document.createElement("li"); li.className = "mx-empty"; li.textContent = "No exercises match."; ul.append(li); }
  }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

  // ---------- editing one exercise ----------
  function freshDraft() { return { photos: [], video: null, delImage: false, delVideo: false }; }

  function select(id, keepDraft) {
    const ex = LIBRARY.find((e) => e.id === id);
    if (!ex) return;
    if (!keepDraft || !selected || selected.id !== id) { clearDraftUrls(); draft = freshDraft(); }
    selected = ex;
    $("#consent").checked = false;
    $("#edit-empty").hidden = true;
    $("#edit").hidden = false;
    $("#ex-name").textContent = ex.name;
    $("#drop-msg").hidden = true;
    document.querySelectorAll("#list button").forEach((b) => b.toggleAttribute("aria-current", b.dataset.id === id));
    document.querySelectorAll("#list button[aria-current]").forEach((b) => b.setAttribute("aria-current", "true"));
    renderDraft();
    if (window.innerWidth < 860) $("#edit-h").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearDraftUrls() {
    if (!draft) return;
    draft.photos.forEach((p) => URL.revokeObjectURL(p.url));
    if (draft.video) URL.revokeObjectURL(draft.video.url);
    if (draft.previewUrl) URL.revokeObjectURL(draft.previewUrl);
  }

  function dropMsg(text) { const m = $("#drop-msg"); m.textContent = text || ""; m.hidden = !text; }

  async function addFiles(files) {
    if (!selected) return;
    const msgs = [];
    $("#drop").classList.add("busy");
    for (const file of Array.from(files)) {
      const name = file.name || "file";
      const isVideo = /^video\//.test(file.type) || /\.(mp4|mov|m4v|webm)$/i.test(name);
      const isImage = /^image\//.test(file.type) || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(name);
      if (isVideo) {
        const mb = file.size / 1048576;
        if (mb > VIDEO_MAX_MB) { msgs.push(`"${name}" is ${Math.round(mb)} MB, too big for the website (the limit is ${VIDEO_MAX_MB} MB). Try a shorter clip.`); continue; }
        const v = await checkVideo(file);
        if (!v.ok) { msgs.push(`This browser can't play "${name}", so many phones won't either. On an iPhone, go to Settings, Camera, Formats and choose "Most Compatible", then film it again.`); continue; }
        if (draft.video) URL.revokeObjectURL(draft.video.url);
        const ext = /\.webm$/i.test(name) || file.type === "video/webm" ? "webm" : /\.mov$/i.test(name) || file.type === "video/quicktime" ? "mov" : "mp4";
        draft.video = { file, url: v.url, ext, seconds: v.seconds, mb };
        draft.delVideo = false;
        if (mb > VIDEO_WARN_MB) msgs.push(`The video is ${Math.round(mb)} MB. It will work, but under ${VIDEO_WARN_MB} MB loads faster on patients' phones.`);
        if (v.seconds > VIDEO_WARN_SECONDS) msgs.push(`The video is ${Math.round(v.seconds)} seconds long. Short clips (under a minute) work best.`);
      } else if (isImage) {
        if (draft.photos.length >= MAX_PHOTOS) { msgs.push(`You can use up to ${MAX_PHOTOS} photos for one exercise.`); continue; }
        const img = await loadImage(file);
        if (!img) { msgs.push(`This browser can't open "${name}". iPhone photos (HEIC) work in Safari; in other browsers, save the photo as a JPEG first.`); continue; }
        const isGif = /gif$/i.test(file.type) || /\.gif$/i.test(name);
        draft.photos.push({ file, url: URL.createObjectURL(file), img, isGif });
        draft.delImage = false;
      } else {
        msgs.push(`"${name}" isn't a photo or a video.`);
      }
    }
    $("#drop").classList.remove("busy");
    dropMsg(msgs.join(" "));
    renderDraft();
  }

  function checkVideo(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const v = document.createElement("video");
      v.preload = "metadata";
      v.muted = true;
      const done = (ok) => { clearTimeout(t); resolve({ ok, url, seconds: v.duration || 0 }); if (!ok) URL.revokeObjectURL(url); };
      const t = setTimeout(() => done(false), 15000);
      v.onloadedmetadata = () => done(v.videoWidth > 0 || v.duration > 0);
      v.onerror = () => done(false);
      v.src = url;
    });
  }

  function loadImage(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img.naturalWidth ? img : null); };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
      img.src = url;
    });
  }

  // Joins 1 to 3 photos side by side at the same height, numbers them, and makes a clean JPEG.
  // A single GIF is kept as it is, so it still moves (GIFs don't hold location details).
  async function buildPhoto(photos) {
    if (photos.length === 1 && photos[0].isGif && photos[0].file.size < 6 * 1048576) return { blob: photos[0].file, ext: "gif" };
    const many = photos.length > 1;
    const maxH = many ? 900 : 1200, maxW = many ? 2400 : 1400, gap = many ? 16 : 0;
    let h = Math.min(maxH, ...photos.map((p) => p.img.naturalHeight));
    let widths = photos.map((p) => p.img.naturalWidth * h / p.img.naturalHeight);
    let total = widths.reduce((a, b) => a + b, 0) + gap * (photos.length - 1);
    if (total > maxW) { const k = (maxW - gap * (photos.length - 1)) / (total - gap * (photos.length - 1)); h *= k; widths = widths.map((w) => w * k); total = maxW; }
    const c = document.createElement("canvas");
    c.width = Math.round(total); c.height = Math.round(h);
    const g = c.getContext("2d");
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, c.width, c.height);
    let x = 0;
    photos.forEach((p, i) => {
      g.drawImage(p.img, Math.round(x), 0, Math.round(widths[i]), c.height);
      if (many) {
        const r = Math.max(22, Math.round(h * 0.09)), cx = x + r + r * 0.5, cy = r + r * 0.5;
        g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fillStyle = "#0e6b62"; g.fill();
        g.lineWidth = Math.max(2, r * 0.12); g.strokeStyle = "#ffffff"; g.stroke();
        g.fillStyle = "#ffffff"; g.font = "700 " + Math.round(r * 1.15) + "px system-ui, -apple-system, Segoe UI, Arial, sans-serif";
        g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(String(i + 1), cx, cy + r * 0.05);
      }
      x += widths[i] + gap;
    });
    const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.85));
    return { blob, ext: "jpg" };
  }

  // Blanks out the hidden details in an MP4 / MOV file (place filmed, phone, date) without touching
  // the picture or sound: the boxes that hold them are filled with zeros and renamed "free", which players skip.
  // Sizes don't change, so nothing else in the file needs adjusting.
  function cleanVideo(buf) {
    const bytes = new Uint8Array(buf);
    const view = new DataView(buf);
    const type = (o) => String.fromCharCode(bytes[o + 4], bytes[o + 5], bytes[o + 6], bytes[o + 7]);
    const setFree = (o) => { bytes[o + 4] = 0x66; bytes[o + 5] = 0x72; bytes[o + 6] = 0x65; bytes[o + 7] = 0x65; };
    const DROP = { udta: 1, meta: 1, uuid: 1, XMP_: 1 };
    const DIVE = { moov: 1, trak: 1, mdia: 1, minf: 1 };
    let found = 0;
    function walk(start, end, depth) {
      let o = start;
      while (o + 8 <= end) {
        let size = view.getUint32(o);
        let header = 8;
        if (size === 1) {
          if (o + 16 > end) return;
          size = view.getUint32(o + 8) * 4294967296 + view.getUint32(o + 12);
          header = 16;
        } else if (size === 0) size = end - o;
        if (size < header || o + size > end) return; // not a box we understand: stop safely
        const t = type(o);
        if (DROP[t]) { setFree(o); bytes.fill(0, o + header, o + size); found++; } // blank the contents too, not just the label
        else if (DIVE[t]) walk(o + header, o + size, depth + 1);
        o += size;
      }
    }
    walk(0, bytes.length, 0);
    return { buf, found };
  }

  async function buildVideo(v) {
    if (v.ext === "webm") return { blob: v.file, ext: v.ext }; // WebM from browsers carries no location
    const buf = await v.file.arrayBuffer();
    const { buf: out } = cleanVideo(buf);
    return { blob: new Blob([out], { type: v.ext === "mov" ? "video/quicktime" : "video/mp4" }), ext: v.ext };
  }

  // ---------- show the draft ----------
  function renderDraft() {
    if (!selected) return;
    const ex = selected;
    const l = live[ex.id] || {};

    // Photos chosen
    const ol = $("#photos");
    ol.innerHTML = "";
    draft.photos.forEach((p, i) => {
      const li = document.createElement("li");
      const img = document.createElement("img"); img.src = p.url; img.alt = "Photo " + (i + 1);
      const tools = document.createElement("div"); tools.className = "mx-thumb-tools";
      const mk = (label, text, fn, dis) => { const b = document.createElement("button"); b.type = "button"; b.className = "btn btn-ghost btn-sm"; b.textContent = text; b.setAttribute("aria-label", label); b.disabled = !!dis; b.addEventListener("click", fn); return b; };
      tools.append(
        mk("Move photo " + (i + 1) + " earlier", "←", () => { draft.photos.splice(i - 1, 0, draft.photos.splice(i, 1)[0]); renderDraft(); }, i === 0),
        mk("Remove photo " + (i + 1), "Remove", () => { URL.revokeObjectURL(p.url); draft.photos.splice(i, 1); renderDraft(); }),
        mk("Move photo " + (i + 1) + " later", "→", () => { draft.photos.splice(i + 1, 0, draft.photos.splice(i, 1)[0]); renderDraft(); }, i === draft.photos.length - 1)
      );
      li.append(img, tools);
      ol.append(li);
    });
    $("#photos-box").hidden = !draft.photos.length;
    $("#video-box").hidden = !draft.video;
    if (draft.video) $("#video-info").textContent = (draft.video.file.name || "Video") + " · " + draft.video.mb.toFixed(1) + " MB · " + Math.round(draft.video.seconds) + " seconds";
    $("#chosen").hidden = !draft.photos.length && !draft.video;

    // Already live
    $("#current").hidden = !l.image && !l.video;
    $("#btn-del-image").hidden = !l.image;
    $("#btn-del-video").hidden = !l.video;
    $("#btn-del-image").setAttribute("aria-pressed", draft.delImage ? "true" : "false");
    $("#btn-del-video").setAttribute("aria-pressed", draft.delVideo ? "true" : "false");
    $("#btn-del-image").textContent = draft.delImage ? "Photo will be removed (undo)" : "Remove my photo (go back to the drawing)";
    $("#btn-del-video").textContent = draft.delVideo ? "Video will be removed (undo)" : "Remove my video";

    renderPreview();
    updateButtons();
  }

  let previewSeq = 0;
  async function renderPreview() {
    const seq = ++previewSeq;
    const ex = selected;
    const l = live[ex.id] || {};
    let image = ex.image;
    if (draft.delImage) image = "";
    if (draft.photos.length) {
      const built = await buildPhoto(draft.photos);
      if (seq !== previewSeq) return;
      if (draft.previewUrl) URL.revokeObjectURL(draft.previewUrl);
      draft.previewUrl = URL.createObjectURL(built.blob);
      draft.built = built;
      image = draft.previewUrl;
    } else draft.built = null;
    let video = ex.video;
    if (draft.delVideo) video = l.video === ex.video ? "" : ex.video;
    if (draft.video) video = draft.video.url + "#.mp4"; // the ending tells the player it's a file
    const fake = Object.assign({}, ex, { image, video });
    const box = $("#preview");
    box.innerHTML = "";
    box.append(H.mediaSwitch(fake, H.picture(fake, "anim")));
  }

  function hasChange() { return !!(draft && (draft.photos.length || draft.video || draft.delImage || draft.delVideo)); }

  function updateButtons() {
    $("#btn-add").disabled = !hasChange() || ((draft.photos.length || draft.video) && !$("#consent").checked);
    $("#consent-row").hidden = !(draft && (draft.photos.length || draft.video));
    $("#btn-publish").disabled = !queue.length || !key;
    $("#publish-hint").textContent = key ? "This makes the changes public. They show on the site about 2 minutes later."
      : "Connect to your website first (at the top of this page).";
  }

  // ---------- the list of changes waiting ----------
  async function addToQueue() {
    if (!hasChange()) return;
    const ex = selected;
    const item = { id: ex.id, name: ex.name, image: null, video: null, delImage: draft.delImage, delVideo: draft.delVideo };
    $("#btn-add").disabled = true;
    if (draft.photos.length) {
      const built = draft.built && draft.built.blob ? draft.built : await buildPhoto(draft.photos);
      item.image = { blob: built.blob, ext: built.ext, url: URL.createObjectURL(built.blob) };
    }
    if (draft.video) item.video = Object.assign(await buildVideo(draft.video), { mb: draft.video.mb });
    const i = queue.findIndex((q) => q.id === ex.id);
    if (i >= 0) { if (queue[i].image) URL.revokeObjectURL(queue[i].image.url); queue.splice(i, 1, item); } else queue.push(item);
    clearDraftUrls();
    draft = freshDraft();
    $("#consent").checked = false;
    dropMsg("");
    renderDraft();
    renderQueue();
    renderList();
    publishMsg("Added " + ex.name + " to your list. Pick another exercise, or press Put on the website.", "ok");
  }

  function describeItem(q) {
    const bits = [];
    if (q.image) bits.push("new photo");
    if (q.video) bits.push("new video (" + q.video.mb.toFixed(1) + " MB)");
    if (q.delImage && !q.image) bits.push("remove photo");
    if (q.delVideo && !q.video) bits.push("remove video");
    const s = bits.join(", ");
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function renderQueue() {
    const ul = $("#queue");
    ul.innerHTML = "";
    queue.forEach((q, i) => {
      const li = document.createElement("li");
      if (q.image) { const img = document.createElement("img"); img.src = q.image.url; img.alt = ""; li.append(img); }
      const t = document.createElement("div"); t.className = "mx-q-text";
      t.innerHTML = "<strong></strong><span></span>";
      t.firstChild.textContent = q.name; t.lastChild.textContent = describeItem(q);
      const b = document.createElement("button"); b.type = "button"; b.className = "btn btn-ghost btn-sm"; b.textContent = "Remove";
      b.setAttribute("aria-label", "Remove " + q.name + " from the list");
      b.addEventListener("click", () => { if (q.image) URL.revokeObjectURL(q.image.url); queue.splice(i, 1); renderQueue(); renderList(); });
      li.append(t, b);
      ul.append(li);
    });
    $("#queue-empty").hidden = !!queue.length;
    $("#publish-row").hidden = !queue.length;
    updateButtons();
  }

  function publishMsg(text, kind) { const m = $("#publish-msg"); m.textContent = text; m.className = "mx-msg" + (kind ? " " + kind : ""); }

  // ---------- put it on the website (one commit) ----------
  function stamp() { const d = new Date(), p = (n) => String(n).padStart(2, "0"); return "" + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()); }
  const ownFile = (path) => /^(images\/exercises|videos)\/[\w.-]+$/.test(path || "");

  async function publish() {
    if (!queue.length || !key) return;
    const btn = $("#btn-publish");
    btn.disabled = true;
    const bar = document.createElement("div"); bar.className = "mx-progress"; bar.innerHTML = "<div></div>";
    $("#publish-msg").after(bar);
    const setBar = (f) => { bar.firstChild.style.width = Math.round(f * 100) + "%"; };
    try {
      // 1. Upload the files themselves
      const s = stamp();
      const files = []; // { path, sha }
      const plan = queue.map((q) => ({ q, image: null, video: null }));
      const uploads = [];
      plan.forEach((p) => {
        if (p.q.image) uploads.push({ p, kind: "image", blob: p.q.image.blob, path: "images/exercises/" + p.q.id + "-" + s + "." + p.q.image.ext });
        if (p.q.video) uploads.push({ p, kind: "video", blob: p.q.video.blob, path: "videos/" + p.q.id + "-" + s + "." + p.q.video.ext });
      });
      for (let i = 0; i < uploads.length; i++) {
        const u = uploads[i];
        publishMsg("Uploading " + (i + 1) + " of " + uploads.length + " (" + u.p.q.name + ")…");
        const blob = await gh("/git/blobs", { method: "POST", body: { content: await blobToBase64(u.blob), encoding: "base64" } });
        files.push({ path: u.path, sha: blob.sha });
        u.p[u.kind] = u.path;
        setBar((i + 1) / (uploads.length + 1));
      }

      // 2. Update the list and save everything in one go (tries again if the site changed meanwhile)
      publishMsg("Saving…");
      let done = false;
      for (let attempt = 0; attempt < 3 && !done; attempt++) {
        const ref = await gh("/git/ref/heads/" + BRANCH);
        const head = ref.object.sha;
        const commit = await gh("/git/commits/" + head);
        const { text, map } = await readLiveList(head);
        const remove = [];
        plan.forEach(({ q, image, video }) => {
          const e = map[q.id] = Object.assign({ image: "", video: "" }, map[q.id]);
          if (image || q.delImage) { if (ownFile(e.image)) remove.push(e.image); e.image = image || ""; }
          if (video || q.delVideo) { if (ownFile(e.video)) remove.push(e.video); e.video = video || ""; }
        });
        const tree = files.map((f) => ({ path: f.path, mode: "100644", type: "blob", sha: f.sha }))
          .concat([{ path: "media.js", mode: "100644", type: "blob", content: writeMediaFile(text, map) }])
          .concat(remove.map((p) => ({ path: p, mode: "100644", type: "blob", sha: null })));
        const newTree = await gh("/git/trees", { method: "POST", body: { base_tree: commit.tree.sha, tree } });
        const names = queue.map((q) => q.name);
        const message = "Add exercise photos and videos: " + (names.length > 3 ? names.slice(0, 3).join(", ") + " and " + (names.length - 3) + " more" : names.join(", "));
        const now = new Date().toISOString();
        const c = await gh("/git/commits", { method: "POST", body: { message, tree: newTree.sha, parents: [head], author: Object.assign({ date: now }, AUTHOR), committer: Object.assign({ date: now }, AUTHOR) } });
        try {
          await gh("/git/refs/heads/" + BRANCH, { method: "PATCH", body: { sha: c.sha, force: false } });
          live = map;
          done = true;
        } catch (e) {
          if (e.status !== 422 && e.status !== 409) throw e; // someone else saved at the same moment: try again
        }
      }
      if (!done) throw new Error("The website was busy. Please press Put on the website again.");
      setBar(1);
      const n = queue.length;
      queue.forEach((q) => { if (q.image) URL.revokeObjectURL(q.image.url); });
      queue.length = 0;
      renderQueue();
      renderList();
      if (selected) renderDraft();
      publishMsg("Done. " + n + (n === 1 ? " exercise is" : " exercises are") + " updated. The website shows the change in about 2 minutes (refresh the page if you don't see it).", "ok");
    } catch (e) {
      const why = e.status === 401 ? "GitHub didn't accept your key any more (it may have run out). Forget it at the top and connect with a new one."
        : e.status === 403 || e.status === 404 ? "Your key isn't allowed to change the website. Make a new key and set Contents to Read and write."
        : e.message && !/fetch/i.test(e.message) ? e.message
        : "Couldn't reach GitHub. Check your internet connection and try again. Your list is still here.";
      publishMsg("Nothing was changed. " + why, "bad");
    } finally {
      setTimeout(() => bar.remove(), 1500);
      updateButtons();
    }
  }

  // ---------- wire up ----------
  function init() {
    const areas = [...new Set(LIBRARY.map((e) => e.area))];
    areas.forEach((a) => { const o = document.createElement("option"); o.value = a; o.textContent = a; $("#area").append(o); });
    $("#q").addEventListener("input", renderList);
    $("#area").addEventListener("change", renderList);
    renderList();

    const drop = $("#drop"), input = $("#file");
    drop.addEventListener("click", () => input.click());
    drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
    input.addEventListener("change", () => { addFiles(input.files); input.value = ""; });
    ["dragenter", "dragover"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add("over"); }));
    ["dragleave", "dragend"].forEach((t) => drop.addEventListener(t, () => drop.classList.remove("over")));
    drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("over"); addFiles(e.dataTransfer.files); });
    // A file dropped anywhere else on the page shouldn't open it in the browser
    window.addEventListener("dragover", (e) => e.preventDefault());
    window.addEventListener("drop", (e) => { e.preventDefault(); if (selected && !drop.contains(e.target)) addFiles(e.dataTransfer.files); });

    $("#btn-drop-video").addEventListener("click", () => { URL.revokeObjectURL(draft.video.url); draft.video = null; renderDraft(); });
    $("#btn-del-image").addEventListener("click", () => { draft.delImage = !draft.delImage; renderDraft(); });
    $("#btn-del-video").addEventListener("click", () => { draft.delVideo = !draft.delVideo; renderDraft(); });
    $("#consent").addEventListener("change", updateButtons);
    $("#btn-add").addEventListener("click", addToQueue);
    $("#btn-clear").addEventListener("click", () => { clearDraftUrls(); draft = freshDraft(); dropMsg(""); renderDraft(); });
    $("#btn-publish").addEventListener("click", publish);
    $("#btn-connect").addEventListener("click", () => connect($("#key").value));
    $("#key").addEventListener("keydown", (e) => { if (e.key === "Enter") connect($("#key").value); });
    $("#btn-forget").addEventListener("click", () => { store(false, KEY_STORE, null); key = ""; setConnected(false); connectMsg("Forgotten. This computer can't change the website any more.", "ok"); });
    window.addEventListener("beforeunload", (e) => { if (queue.length) { e.preventDefault(); e.returnValue = ""; } });

    draft = freshDraft();
    updateButtons();
    const saved = store(true, KEY_STORE);
    if (saved) connect(saved, true);
  }

  // For the tests
  window.RepSheetMediaTool = { cleanVideo, parseMediaFile, writeMediaFile };
  init();
})();
