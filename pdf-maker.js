/*
  RepSheet: "Your handout is ready" on phones and tablets.
  On an iPhone, iPad or Android device, "Print or save as PDF" makes a real PDF file on the device,
  then shows clear buttons: Save or share, Open, Download, or Print instead.
  The PDF is made from the same printed layout, entirely on this device. Nothing is sent anywhere.
  Libraries (MIT licence): vendor/jspdf.umd.min.js, vendor/html2canvas.min.js. They only load when needed.
  On computers the normal print window is used, which already has "Save as PDF".
*/
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const ua = navigator.userAgent || "";
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isTouch = isIOS || /Android/i.test(ua) || (window.matchMedia && matchMedia("(pointer: coarse)").matches && !matchMedia("(pointer: fine)").matches);
  const params = new URLSearchParams(location.search);
  // ?pdf=1 forces this on a computer (for testing). ?pdf=0 turns it off.
  const wanted = () => params.get("pdf") === "1" || (params.get("pdf") !== "0" && isTouch);

  const btn = $("#btn-print");
  if (btn && wanted()) btn.textContent = "Make handout PDF";

  let libs = null;
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = () => rej(new Error("Couldn't load " + src));
      document.head.append(s);
    });
  }
  function loadLibs() {
    if (!libs) libs = Promise.all([
      window.jspdf ? null : loadScript("vendor/jspdf.umd.min.js"),
      window.html2canvas ? null : loadScript("vendor/html2canvas.min.js")
    ]).catch((e) => { libs = null; throw e; });
    return libs;
  }

  // ---------- Dialog ----------
  const dlg = document.createElement("dialog");
  dlg.id = "pdf-dialog";
  dlg.className = "pdf-dialog";
  dlg.setAttribute("aria-labelledby", "pdf-title");
  dlg.innerHTML =
    '<div class="dialog-body">' +
      '<div class="pdf-making">' +
        '<h2 id="pdf-title">Making your handout…</h2>' +
        '<p class="pdf-progress-text" aria-live="polite">Getting ready</p>' +
        '<div class="pdf-bar" aria-hidden="true"><span></span></div>' +
      '</div>' +
      '<div class="pdf-ready" hidden>' +
        '<div class="pdf-ready-head">' +
          '<svg class="pdf-file-icon" viewBox="0 0 40 48" aria-hidden="true"><path d="M6 2h20l12 12v30a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" fill="#fff" stroke="currentColor" stroke-width="2.5"/><path d="M26 2v12h12" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M12 31l5 5 11-12" fill="none" stroke="#0e6b62" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '<div><h2 class="pdf-ready-title" tabindex="-1">Your handout is ready</h2><p class="pdf-file-name"></p></div>' +
        '</div>' +
        '<div class="pdf-buttons">' +
          '<button type="button" class="btn btn-primary pdf-share">Save or share the PDF</button>' +
          '<a class="btn btn-secondary pdf-open" target="_blank" rel="noopener">Open the PDF</a>' +
          '<a class="btn btn-secondary pdf-download">Download the PDF</a>' +
        '</div>' +
        '<p class="hint pdf-tip"></p>' +
        '<div class="dialog-actions pdf-foot">' +
          '<button type="button" class="btn btn-secondary pdf-print">Print instead</button>' +
          '<button type="button" class="btn btn-secondary pdf-close">Done</button>' +
        '</div>' +
      '</div>' +
      '<div class="pdf-error" hidden>' +
        '<h2>Sorry, the PDF didn\'t work on this device</h2>' +
        '<p>You can still print it, or save it as a PDF from the print screen.</p>' +
        '<div class="dialog-actions"><button type="button" class="btn btn-primary pdf-print">Print or save as PDF</button><button type="button" class="btn btn-secondary pdf-close">Close</button></div>' +
      '</div>' +
    '</div>';
  document.body.append(dlg);

  let file = null, url = "", busy = false;
  const show = (part) => ["making", "ready", "error"].forEach((p) => { dlg.querySelector(".pdf-" + p).hidden = p !== part; });
  const progress = (text, frac) => {
    dlg.querySelector(".pdf-progress-text").textContent = text;
    dlg.querySelector(".pdf-bar span").style.width = Math.round(Math.max(.04, frac) * 100) + "%";
  };
  dlg.addEventListener("click", (e) => {
    if (e.target.closest(".pdf-close")) dlg.close();
    if (e.target.closest(".pdf-print")) { dlg.close(); setTimeout(() => window.print(), 150); }
  });
  dlg.addEventListener("cancel", (e) => { if (busy) e.preventDefault(); });
  dlg.addEventListener("close", () => { if (url) { const u = url; setTimeout(() => URL.revokeObjectURL(u), 60000); url = ""; } });
  dlg.querySelector(".pdf-share").addEventListener("click", async (e) => {
    try { await navigator.share({ files: [file], title: "Exercise handout" }); }
    catch (x) { if (x && x.name !== "AbortError") e.target.textContent = "Couldn't share. Try Open instead"; }
  });

  // ---------- Build a copy of the printed handout in a hidden frame ----------
  function printCss() {
    let css = "";
    const walk = (rules, inPrint) => {
      for (const r of rules) {
        if (r.type === CSSRule.MEDIA_RULE) {
          const m = r.media.mediaText;
          if (/\bprint\b/.test(m) && !/not\s+print/.test(m)) walk(r.cssRules, true);
          else if (/\bscreen\b/.test(m)) continue;
          else css += r.cssText + "\n";
        } else if (r.type === CSSRule.PAGE_RULE) {
          continue;
        } else css += r.cssText + "\n";
      }
    };
    for (const sheet of document.styleSheets) {
      let rules; try { rules = sheet.cssRules; } catch (e) { continue; }
      if (rules) walk(rules, false);
    }
    return css;
  }
  function pageMarginMm() {
    // Same margins as the printed page (styles.css @page rules)
    return document.body.classList.contains("paper-saver") ? 5 : 8;
  }
  const MM = 96 / 25.4; // CSS pixels per mm

  function buildFrame() {
    const margin = pageMarginMm();
    const W = Math.round((210 - 2 * margin) * MM);
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.cssText = "position:fixed;left:-10000px;top:0;width:" + W + "px;height:2000px;border:0;visibility:hidden;";
    document.body.append(frame);
    const d = frame.contentDocument;
    d.open(); d.write("<!doctype html><html><head><meta charset='utf-8'></head><body></body></html>"); d.close();
    const style = d.createElement("style");
    style.textContent = printCss() + "\nhtml,body{margin:0;padding:0;background:#fff !important;} .page-frame{display:none !important;}";
    d.head.append(style);
    d.documentElement.className = document.documentElement.className;
    d.body.className = document.body.className;
    // Rebuild the chain of parents so selectors such as ".layout .handout" still match
    const src = $(".handout");
    let parent = d.body;
    const chain = [];
    for (let n = src.parentElement; n && n !== document.body; n = n.parentElement) chain.unshift(n);
    chain.forEach((n) => { const c = d.createElement(n.tagName); if (n.id) c.id = n.id; if (n.className) c.className = n.className; parent.append(c); parent = c; });
    const copy = src.cloneNode(true);
    // Copy what people typed into boxes that also print
    const a = src.querySelectorAll("input, textarea, select"), b = copy.querySelectorAll("input, textarea, select");
    a.forEach((el, i) => { if (b[i]) { b[i].value = el.value; if (el.type === "checkbox") b[i].checked = el.checked; } });
    parent.append(copy);
    return { frame, doc: d, root: copy, W };
  }

  // Bake computed styles into the drawings, so they look the same once turned into a picture
  function bakeSvg(doc, root) {
    const win = doc.defaultView;
    const PROPS = ["fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "opacity", "fill-opacity", "stroke-opacity", "stroke-dasharray"];
    root.querySelectorAll("svg *").forEach((el) => {
      const cs = win.getComputedStyle(el);
      PROPS.forEach((p) => { const v = cs.getPropertyValue(p); if (v) el.style.setProperty(p, v); });
      if (cs.display === "none") el.style.display = "none";
    });
    // Lock in anything the printed page hides (e.g. empty boxes hidden with :empty), because the picture-maker adds hidden helper elements that would show them again
    root.querySelectorAll("*").forEach((el) => {
      if (win.getComputedStyle(el).display === "none") el.style.setProperty("display", "none", "important");
    });
    root.querySelectorAll("svg").forEach((svg) => {
      if (svg.ownerSVGElement) return;
      // The picture-maker clips drawings that have a margin, so move the margin onto a wrapper
      const cs = win.getComputedStyle(svg);
      if (parseFloat(cs.marginTop) || parseFloat(cs.marginBottom)) {
        const wrap = doc.createElement("div");
        wrap.style.cssText = "padding:" + cs.marginTop + " 0 " + cs.marginBottom + ";margin:0;line-height:0;";
        svg.before(wrap); wrap.append(svg);
        svg.style.setProperty("margin", "0", "important");
      }
      const r = svg.getBoundingClientRect();
      if (r.width && !svg.getAttribute("width")) { svg.setAttribute("width", r.width); svg.setAttribute("height", r.height); }
    });
  }

  // Choose where each page starts, so an exercise is never cut in half
  function paginate(doc, root, pageH) {
    const win = doc.defaultView;
    const top0 = root.getBoundingClientRect().top;
    const blocks = [];
    const add = (el) => {
      const cs = win.getComputedStyle(el);
      if (cs.display === "none" || el.hidden) return;
      const r = el.getBoundingClientRect();
      if (!r.height) return;
      blocks.push({ top: r.top - top0, bottom: r.bottom - top0, force: cs.breakBefore === "page" || cs.pageBreakBefore === "always" });
    };
    const list = root.querySelector("#programme-list");
    root.querySelectorAll(":scope > *").forEach((el) => {
      if (list && el.contains(list)) {
        // Blocks before the list inside the same wrapper, then each exercise card
        const walk = (node) => {
          [...node.children].forEach((c) => {
            if (c === list) [...list.children].forEach((li) => { [...li.children].filter((k) => k.classList.contains("stage-head")).forEach(add); add(li); });
            else if (c.contains(list)) walk(c);
            else add(c);
          });
        };
        walk(el);
      } else add(el);
    });
    blocks.sort((x, y) => x.top - y.top);
    const total = root.getBoundingClientRect().height;
    const starts = [0];
    let start = 0;
    for (const bl of blocks) {
      if (bl.top <= start + 1) continue;
      const tooLong = bl.bottom - start > pageH;
      if (bl.force || tooLong) {
        start = bl.top;
        starts.push(start);
        // A block taller than a page is split at page height
        while (bl.bottom - start > pageH) { start += pageH; starts.push(start); }
      }
    }
    return starts.map((s, i) => ({ top: s, height: Math.min((starts[i + 1] != null ? starts[i + 1] : total) - s, pageH) })).filter((p) => p.height > 4);
  }

  async function make() {
    if (busy) return;
    busy = true;
    if (url) { URL.revokeObjectURL(url); url = ""; }
    show("making"); progress("Getting ready", 0.04);
    if (!dlg.open) dlg.showModal();
    let built = null;
    try {
      await loadLibs();
      built = buildFrame();
      const { doc, root, W } = built;
      await new Promise((r) => setTimeout(r, 60));
      if (doc.fonts && doc.fonts.ready) await doc.fonts.ready;
      bakeSvg(doc, root);
      const margin = pageMarginMm();
      const pageH = Math.floor((297 - 2 * margin) * MM);
      built.frame.style.height = Math.ceil(root.getBoundingClientRect().height + 40) + "px";
      const pages = paginate(doc, root, pageH);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
      const scale = 2;
      const mono = document.body.classList.contains("bw-print");
      for (let i = 0; i < pages.length; i++) {
        progress("Page " + (i + 1) + " of " + pages.length, (i + 0.5) / pages.length);
        const pg = pages[i];
        const canvas = await window.html2canvas(root, {
          scale, backgroundColor: "#ffffff", logging: false, useCORS: false,
          x: 0, y: pg.top, width: W, height: pg.height,
          windowWidth: W, windowHeight: Math.max(pageH, doc.documentElement.scrollHeight)
        });
        if (i) pdf.addPage();
        const img = canvas.toDataURL("image/jpeg", 0.9);
        pdf.addImage(img, "JPEG", margin, margin, 210 - 2 * margin, pg.height / MM, undefined, "FAST");
        // Gentle border, like the printed page
        pdf.setDrawColor(mono ? 180 : 201, mono ? 180 : 214, mono ? 180 : 209);
        pdf.setLineWidth(0.4);
        pdf.roundedRect(margin / 2, margin / 2, 210 - margin, 297 - margin, 4, 4, "S");
        canvas.width = canvas.height = 0; // free memory on phones
      }
      progress("Finishing", 1);
      const date = (document.getElementById("handout-date") || {}).value || new Date().toISOString().slice(0, 10);
      const name = "Exercise handout " + date + ".pdf";
      const blob = pdf.output("blob");
      file = new File([blob], name, { type: "application/pdf" });
      url = URL.createObjectURL(blob);
      const canShare = !!(navigator.canShare && navigator.canShare({ files: [file] }));
      dlg.querySelector(".pdf-file-name").textContent = pages.length + (pages.length === 1 ? " page" : " pages") + " · " + name;
      dlg.querySelector(".pdf-share").hidden = !canShare;
      dlg.querySelector(".pdf-share").textContent = "Save or share the PDF";
      const open = dlg.querySelector(".pdf-open"); open.href = url;
      open.classList.toggle("btn-primary", !canShare); open.classList.toggle("btn-secondary", canShare);
      const dl = dlg.querySelector(".pdf-download"); dl.href = url; dl.download = name; dl.hidden = isIOS;
      dlg.querySelector(".pdf-tip").textContent = canShare
        ? (isIOS ? "\"Save or share\" lets you save it to Files, print it, or send it by email, Messages or WhatsApp."
                 : "\"Save or share\" lets you save it, print it, or send it in another app.")
        : isIOS ? "Open it, then tap the Share button to save it to Files, print it or send it."
                : "Download it, or open it to print or share.";
      show("ready");
      dlg.querySelector(".pdf-ready-title").focus();
    } catch (e) {
      console.warn("PDF", e);
      show("error");
    } finally {
      if (built) built.frame.remove();
      busy = false;
    }
  }

  window.RepSheetPdf = { wanted, make, lastFile: () => file };
})();
