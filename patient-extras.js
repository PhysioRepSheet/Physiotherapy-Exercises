/*
  RepSheet: extra parts of the patient page.
  - "Make this page easier to read" (larger text, easier reading, high contrast). The choice is saved on this phone.
  - A note when a programme is more than 12 weeks old.
  - "Contact my physio", using the contact details the physio typed (opens the phone's own email, phone or text app).
  - "How is it going?" check-in, when the physio switched it on. Answers stay on this phone.
  Nothing on this page is sent to RepSheet.
*/
(function () {
  "use strict";
  const H = window.Handout, $ = (s) => document.querySelector(s);
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  function shortHash(str) { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0; return h.toString(36); }
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* storage unavailable */ } }
  };

  // ---------- Display choices ----------
  const DISPLAY_KEY = "repsheet:display";
  const disp = store.get(DISPLAY_KEY, {}) || {};
  function applyDisplay() {
    document.body.classList.toggle("easy-read-screen", !!disp.easy);
    document.body.classList.toggle("high-contrast", !!disp.contrast);
    const e = $("#btn-easy"), c = $("#btn-contrast");
    if (e) e.setAttribute("aria-pressed", String(!!disp.easy));
    if (c) c.setAttribute("aria-pressed", String(!!disp.contrast));
  }
  const easyBtn = $("#btn-easy"), conBtn = $("#btn-contrast"), large2 = $("#btn-large-2"), large1 = $("#btn-large");
  if (easyBtn) easyBtn.addEventListener("click", () => { disp.easy = !disp.easy; store.set(DISPLAY_KEY, disp); applyDisplay(); });
  if (conBtn) conBtn.addEventListener("click", () => { disp.contrast = !disp.contrast; store.set(DISPLAY_KEY, disp); applyDisplay(); });
  if (large2 && large1) {
    const sync = () => large2.setAttribute("aria-pressed", String(document.body.classList.contains("large-print")));
    large2.addEventListener("click", () => { large1.click(); sync(); });
    large1.addEventListener("click", () => setTimeout(sync));
    setTimeout(sync, 300);
  }
  applyDisplay();

  async function start() {
    const code = decodeURIComponent(location.hash.slice(1));
    if (!code) { const d = $("#display"); if (d) d.hidden = true; return; }
    let data;
    try { data = await H.decode(code); } catch (e) { const d = $("#display"); if (d) d.hidden = true; return; }
    const items = (data.x || []).map(H.unpackItem).filter((it) => H.byId(it.id));
    if (!items.length) return;

    // ---------- Older programme note ----------
    if (data.d) {
      const issued = new Date(data.d + "T00:00:00");
      const weeks = Math.floor((Date.now() - issued) / (7 * 86400000));
      if (!isNaN(weeks) && weeks >= 12) {
        const p = document.createElement("p");
        p.className = "p-old-note";
        p.textContent = "Your physio gave you this programme " + weeks + " weeks ago. If you're not sure it's still right for you, check with them.";
        const meta = $("#meta"); if (meta) meta.after(p);
      }
    }

    // ---------- Contact my physio ----------
    const contact = String(data.t || "") + " " + String(data.c || "");
    const email = (contact.match(/[\w.+-]+@[\w-]+\.[\w.]+/) || [])[0];
    const phone = (contact.match(/(?:\+44\s?|\b0)\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}\b/) || [])[0];
    if (email || phone) {
      const sec = document.createElement("section");
      sec.className = "panel p-contact no-print";
      sec.setAttribute("aria-labelledby", "contact-title");
      const subject = encodeURIComponent("Question about my exercises");
      const tel = phone ? phone.replace(/[^\d+]/g, "") : "";
      sec.innerHTML = '<h2 id="contact-title">Questions about your exercises?</h2>' +
        '<p>Contact your physio. This opens your own ' + (email && phone ? "email or phone" : email ? "email" : "phone") + ' app. Nothing goes through RepSheet.</p>' +
        '<div class="p-contact-row">' +
        (email ? '<a class="btn btn-secondary" href="mailto:' + esc(email) + '?subject=' + subject + '">Email my physio</a>' : "") +
        (phone ? '<a class="btn btn-secondary" href="tel:' + esc(tel) + '">Call ' + esc(phone) + '</a>' : "") +
        (phone && /^(?:\+447|07)/.test(tel) ? '<a class="btn btn-secondary" href="sms:' + esc(tel) + '">Text my physio</a>' : "") +
        '</div>';
      const anchor = $("#reminder"); if (anchor) anchor.before(sec);
    }

    // ---------- How is it going? (only when the physio switched it on) ----------
    if (data.ci) checkIn(code, data, items);
  }

  function checkIn(code, data, items) {
    const key = "repsheet-checkin:" + shortHash(code);
    let st = store.get(key, {}) || {};
    st.feel = st.feel || {};
    const save = () => store.set(key, st);
    function daysDone() {
      if (!data.tc) return null;
      const set = new Set(store.get("exercise-ticks:" + shortHash(code), []) || []);
      let n = 0;
      for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); if (set.has(iso(d))) n++; }
      return n;
    }
    const LABEL = { easy: "Too easy", right: "About right", hard: "Too hard" };
    const sec = document.createElement("section");
    sec.className = "panel ci no-print";
    sec.setAttribute("aria-labelledby", "ci-title");
    sec.innerHTML = '<h2 id="ci-title">How is it going?</h2>' +
      '<p class="hint ci-intro">After a week or so, tell us how each exercise feels. Show your answers to your physio at your next appointment.</p>' +
      '<div class="ci-list"></div><div class="ci-sum" aria-live="polite"></div>';
    const list = sec.querySelector(".ci-list");
    items.forEach((it, idx) => {
      const ex = H.byId(it.id);
      const k = it.id + ":" + idx;
      const side = H.sideLabel(it);
      const row = document.createElement("div");
      row.className = "ci-row";
      row.append(H.picture(ex, "thumb").el);
      const r = document.createElement("div");
      r.innerHTML = "<b>" + esc(ex.name) + (side ? " <span class=\"hint\">(" + esc(side.toLowerCase()) + ")</span>" : "") + '</b><div class="ci-opts" role="group" aria-label="How does ' + esc(ex.name) + ' feel?"></div>';
      Object.entries(LABEL).forEach(([v, l]) => {
        const b = document.createElement("button");
        b.type = "button"; b.textContent = l;
        b.setAttribute("aria-pressed", String(st.feel[k] === v));
        b.addEventListener("click", () => {
          st.feel[k] = st.feel[k] === v ? undefined : v;
          save();
          r.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b && st.feel[k] === v)));
          summary();
        });
        r.querySelector(".ci-opts").append(b);
      });
      row.append(r);
      list.append(row);
    });
    function text() {
      const d = daysDone();
      return ["My exercises: how it's going (" + new Date().toLocaleDateString("en-GB") + ")",
        d != null ? "Days done in the last week: " + d + " of 7" : null,
        ...items.map((it, idx) => H.byId(it.id).name + (H.sideLabel(it) ? " (" + H.sideLabel(it).toLowerCase() + ")" : "") + ": " + (LABEL[st.feel[it.id + ":" + idx]] || "not answered"))
      ].filter(Boolean).join("\n");
    }
    function summary() {
      const box = sec.querySelector(".ci-sum");
      const answered = items.filter((it, idx) => st.feel[it.id + ":" + idx]).length;
      if (!answered) { box.innerHTML = ""; return; }
      const d = daysDone();
      box.innerHTML = '<div class="ci-card"><h3>Show this to your physio</h3>' +
        (d != null ? '<p class="ci-big"><b>' + d + ' of 7</b> days in the last week</p>' : "") +
        "<dl>" + items.map((it, idx) => "<dt>" + esc(H.byId(it.id).name) + (H.sideLabel(it) ? " (" + esc(H.sideLabel(it).toLowerCase()) + ")" : "") + "</dt><dd>" + (LABEL[st.feel[it.id + ":" + idx]] || "Not answered") + "</dd>").join("") + "</dl>" +
        '<div class="ci-actions"><button type="button" class="btn btn-primary ci-copy">Copy to send to my physio</button><button type="button" class="btn btn-secondary ci-clear">Clear my answers</button></div>' +
        '<p class="hint">Saved on this phone only. Nothing is sent to RepSheet. If you send it, it goes in your own message.</p></div>';
      box.querySelector(".ci-copy").addEventListener("click", async (e) => {
        try { await navigator.clipboard.writeText(text()); e.target.textContent = "Copied"; } catch (x) { e.target.textContent = "Couldn't copy on this phone"; }
      });
      box.querySelector(".ci-clear").addEventListener("click", () => {
        st = { feel: {} }; store.del(key);
        sec.querySelectorAll(".ci-opts button").forEach((x) => x.setAttribute("aria-pressed", "false"));
        summary();
      });
    }
    summary();
    const anchor = $("#reminder");
    if (anchor) anchor.before(sec);
  }

  start();
})();
