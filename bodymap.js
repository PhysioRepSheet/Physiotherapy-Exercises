/*
  RepSheet: body map (builder)
  A small front and back figure above the area buttons. Tap an area to filter the library.
*/
(function () {
  "use strict";
  const slot = document.getElementById("bodymap-slot");
  if (!slot || !window.RepSheetSetArea) return;
  const ZONES = [
    ["Neck", "both", '<rect x="86" y="58" width="28" height="20" rx="6"/>'],
    ["Shoulder", "both", '<circle cx="66" cy="86" r="14"/><circle cx="134" cy="86" r="14"/>'],
    ["Upper back", "back", '<rect x="72" y="88" width="56" height="44" rx="10"/>'],
    ["Back", "back", '<rect x="72" y="134" width="56" height="54" rx="10"/>'],
    ["Elbow, wrist and hand", "both", '<circle cx="46" cy="160" r="12"/><circle cx="154" cy="160" r="12"/><circle cx="36" cy="218" r="12"/><circle cx="164" cy="218" r="12"/>'],
    ["Hip", "both", '<circle cx="74" cy="206" r="14"/><circle cx="126" cy="206" r="14"/>'],
    ["Pelvic floor", "front", '<ellipse cx="100" cy="214" rx="12" ry="9"/>'],
    ["Knee", "both", '<circle cx="80" cy="288" r="13"/><circle cx="120" cy="288" r="13"/>'],
    ["Ankle", "both", '<ellipse cx="78" cy="366" rx="14" ry="11"/><ellipse cx="122" cy="366" rx="14" ry="11"/>']
  ];
  const BODY = '<circle class="bm-sk" cx="100" cy="38" r="24"/><rect class="bm-sk" x="90" y="60" width="20" height="14" rx="4"/>' +
    '<path class="bm-sk" d="M62 76 Q100 68 138 76 L142 196 Q100 206 58 196 Z"/><path class="bm-sk" d="M60 80 L36 168 L30 220 L42 222 L52 172 L70 112 Z"/>' +
    '<path class="bm-sk" d="M140 80 L164 168 L170 220 L158 222 L148 172 L130 112 Z"/><path class="bm-sk" d="M60 196 Q100 210 140 196 L136 300 L132 372 L112 376 L104 222 L96 222 L88 376 L68 372 L64 300 Z"/>';
  const areas = new Set((window.Handout.LIBRARY || []).map((e) => e.area));

  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "btn btn-secondary bm-toggle"; btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "bodymap");
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.5" r="2.2"/><path d="M8 9h8l-1 6h-2l-.5 6h-1L11 15H9z"/></svg> Body map';
  const pop = document.createElement("div"); pop.id = "bodymap"; pop.className = "bodymap"; pop.hidden = true;
  let side = "front";

  function draw() {
    const now = window.RepSheetArea();
    pop.innerHTML = '<div class="bm-top"><b>Tap an area</b><div class="bm-side" role="group" aria-label="View">' +
      '<button type="button" aria-pressed="' + (side === "front") + '" data-s="front">Front</button>' +
      '<button type="button" aria-pressed="' + (side === "back") + '" data-s="back">Back</button></div></div>' +
      '<svg viewBox="0 0 200 400" class="bm-body" role="group" aria-label="Body areas">' + BODY +
      ZONES.filter((z) => (z[1] === "both" || z[1] === side) && areas.has(z[0])).map((z) =>
        '<g class="bm-zone' + (now === z[0] ? " on" : "") + '" tabindex="0" role="button" aria-pressed="' + (now === z[0]) + '" aria-label="' + z[0] + '" data-a="' + z[0] + '"><title>' + z[0] + '</title>' + z[2] + '</g>').join("") +
      '</svg><p class="hint bm-hint">' + (side === "front" ? "Back and upper back are on the Back view." : "Pelvic floor is on the Front view.") + '</p>';
    pop.querySelectorAll("[data-s]").forEach((b) => b.addEventListener("click", () => { side = b.dataset.s; draw(); pop.querySelector("[data-s=" + side + "]").focus(); }));
    pop.querySelectorAll("[data-a]").forEach((z) => {
      const go = () => { const a = z.dataset.a; window.RepSheetSetArea(window.RepSheetArea() === a ? "All" : a); draw(); const f = pop.querySelector('[data-a="' + a + '"]'); if (f) f.focus(); };
      z.addEventListener("click", go);
      z.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    });
  }
  btn.addEventListener("click", () => {
    pop.hidden = !pop.hidden;
    btn.setAttribute("aria-expanded", String(!pop.hidden));
    if (!pop.hidden) draw();
  });
  slot.append(btn, pop);
  window.RepSheetBodyMap = { refresh: () => { if (!pop.hidden) draw(); } };
})();
