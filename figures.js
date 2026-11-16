/*
  FIGURE DRAWING ENGINE
  Draws the exercise illustrations from the poses in illustrations.js.
  You should not need to edit this file. To change how an exercise looks, edit illustrations.js.
  To use a photo, GIF or AI image instead, set "image" for that exercise in exercises.js.
*/
(function (root) {
  "use strict";

  const COLOURS = {
    line: "#173a3a", body: "#d6ebe5", far: "#a6cfc4", prop: "#8b9792", propFill: "#eef1ee",
    move: "#c2410c", band: "#7a4fa3", text: "#17232b", panel: "#f1f7f5", chevron: "#b9c4bf"
  };
  const LEN = { torso: 46, headDist: 15, headR: 9, ua: 30, fa: 27, th: 38, sh: 36, foot: 11, heel: 3 };
  const WIDTH = { torso: 17, torsoFront: 26, neck: 8, ua: 8, fa: 7, th: 11, sh: 9, foot: 6 };
  const OUT = 2.2;           // outline thickness
  const PW = 190, PH = 170;  // one picture panel
  const GROUND = 160;

  // ---------- maths helpers ----------
  const rad = (d) => (d * Math.PI) / 180;
  const deg = (r) => (r * 180) / Math.PI;
  const dir = (a) => [Math.cos(rad(a)), Math.sin(rad(a))];
  const add = (p, v, s = 1) => [p[0] + v[0] * s, p[1] + v[1] * s];
  const ang = (p, q) => deg(Math.atan2(q[1] - p[1], q[0] - p[0]));
  const dist = (p, q) => Math.hypot(q[0] - p[0], q[1] - p[1]);
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerpAngle = (a, b, t) => { let d = ((b - a) % 360 + 540) % 360 - 180; return a + d * t; };
  const n = (v) => (Math.round(v * 10) / 10).toString();

  function ik(a, end, l1, l2, bend) {
    const d = Math.max(0.001, Math.min(dist(a, end), l1 + l2 - 0.001));
    const base = ang(a, end);
    const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
    const alpha = deg(Math.acos(Math.max(-1, Math.min(1, cosA))));
    return add(a, dir(base + (bend || -1) * alpha), l1);
  }

  // ---------- turn a pose description into angles and lengths ----------
  function origins(sk) {
    const td = dir(sk.torso);
    const S = add(sk.hip, td, LEN.torso);
    if (sk.view !== "front") return { S, hipN: sk.hip, hipF: sk.hip, shN: S, shF: S };
    const perp = dir(sk.torso + 90);
    return {
      S,
      hipN: add(sk.hip, perp, -7), hipF: add(sk.hip, perp, 7),
      shN: add(add(S, perp, -13), td, -4), shF: add(add(S, perp, 13), td, -4)
    };
  }

  function resolveLimb(o, spec, l1, l2, isLeg) {
    spec = spec || {};
    let m, e;
    if (spec.pts) { m = spec.pts[0]; e = spec.pts[1]; }
    else if (spec.to) { m = ik(o, spec.to, l1, l2, spec.bend); e = add(m, dir(ang(m, spec.to)), l2); }
    else {
      const a = spec.a || (isLeg ? [90, 90] : [90, 90]);
      m = add(o, dir(a[0]), l1); e = add(m, dir(a[1]), l2);
    }
    const limb = { a1: ang(o, m), a2: ang(m, e), l1: dist(o, m), l2: dist(m, e) };
    if (isLeg) {
      limb.f = spec.f != null ? spec.f : limb.a2 + (spec.fr != null ? spec.fr : -90);
      limb.fl = spec.fl != null ? spec.fl : LEN.foot;
      limb.fh = spec.fh != null ? spec.fh : LEN.heel;
    }
    return limb;
  }

  function resolve(pose) {
    const sk = {
      view: pose.view || "side",
      hip: pose.hip.slice(),
      torso: pose.torso != null ? pose.torso : -90,
      curve: pose.curve || 0,
      faceTurn: pose.faceTurn || 0
    };
    sk.headA = pose.head && pose.head.a != null ? pose.head.a : sk.torso;
    sk.headShift = (pose.head && pose.head.shift) || [0, 0];
    sk.face = pose.face === false ? null : (pose.face != null ? pose.face : sk.headA + 90);
    const o = origins(sk);
    sk.legN = resolveLimb(o.hipN, pose.legN, LEN.th, LEN.sh, true);
    sk.legF = resolveLimb(o.hipF, pose.legF || pose.legN, LEN.th, LEN.sh, true);
    sk.armN = resolveLimb(o.shN, pose.armN, LEN.ua, LEN.fa, false);
    sk.armF = resolveLimb(o.shF, pose.armF || pose.armN, LEN.ua, LEN.fa, false);
    return sk;
  }

  function mix(A, B, t) {
    const out = {
      view: A.view, hip: [lerp(A.hip[0], B.hip[0], t), lerp(A.hip[1], B.hip[1], t)],
      torso: lerpAngle(A.torso, B.torso, t), curve: lerp(A.curve, B.curve, t),
      headA: lerpAngle(A.headA, B.headA, t), faceTurn: lerp(A.faceTurn, B.faceTurn, t),
      headShift: [lerp(A.headShift[0], B.headShift[0], t), lerp(A.headShift[1], B.headShift[1], t)],
      face: A.face == null || B.face == null ? (t < 0.5 ? A.face : B.face) : lerpAngle(A.face, B.face, t)
    };
    ["legN", "legF", "armN", "armF"].forEach((k) => {
      const a = A[k], b = B[k], r = {};
      for (const key in a) r[key] = /^(a1|a2|f)$/.test(key) ? lerpAngle(a[key], b[key], t) : lerp(a[key], b[key], t);
      out[k] = r;
    });
    return out;
  }

  // ---------- drawing ----------
  function limbPoints(o, l) {
    const m = add(o, dir(l.a1), l.l1);
    const e = add(m, dir(l.a2), l.l2);
    return [o, m, e];
  }

  function renderGroup(shapes, fill) {
    const outline = [], inner = [];
    shapes.forEach((s) => {
      if (s.t === "seg") {
        const d = `M${n(s.p[0])} ${n(s.p[1])}L${n(s.q[0])} ${n(s.q[1])}`;
        outline.push(`<path d="${d}" stroke-width="${n(s.w + OUT * 2)}"/>`);
        inner.push(`<path d="${d}" stroke-width="${n(s.w)}"/>`);
      } else if (s.t === "quad") {
        const d = `M${n(s.p[0])} ${n(s.p[1])}Q${n(s.c[0])} ${n(s.c[1])} ${n(s.q[0])} ${n(s.q[1])}`;
        outline.push(`<path d="${d}" stroke-width="${n(s.w + OUT * 2)}"/>`);
        inner.push(`<path d="${d}" stroke-width="${n(s.w)}"/>`);
      } else if (s.t === "circ") {
        outline.push(`<circle cx="${n(s.c[0])}" cy="${n(s.c[1])}" r="${n(s.r + OUT)}" stroke="none" fill="${COLOURS.line}"/>`);
        inner.push(`<circle cx="${n(s.c[0])}" cy="${n(s.c[1])}" r="${n(s.r)}" stroke="none" fill="${fill}"/>`);
      }
    });
    return `<g fill="none" stroke-linecap="round" stroke-linejoin="round"><g stroke="${COLOURS.line}">${outline.join("")}</g><g stroke="${fill}">${inner.join("")}</g></g>`;
  }

  function figureParts(sk) {
    const front = sk.view === "front";
    const o = origins(sk);
    const parts = {};

    const leg = (origin, l) => {
      const [h, k, a] = limbPoints(origin, l);
      const fd = dir(l.f);
      return [
        { t: "seg", p: h, q: k, w: WIDTH.th },
        { t: "seg", p: k, q: a, w: WIDTH.sh },
        { t: "seg", p: add(a, fd, -l.fh), q: add(a, fd, l.fl), w: WIDTH.foot }
      ];
    };
    const arm = (origin, l) => {
      const [s, e, w] = limbPoints(origin, l);
      return [
        { t: "seg", p: s, q: e, w: WIDTH.ua },
        { t: "seg", p: e, q: w, w: WIDTH.fa },
        { t: "circ", c: add(w, dir(l.a2), 2), r: 4.3 }
      ];
    };
    parts.legN = leg(o.hipN, sk.legN);
    parts.legF = leg(o.hipF, sk.legF);
    parts.armN = arm(o.shN, sk.armN);
    parts.armF = arm(o.shF, sk.armF);

    const C = add(add(o.S, dir(sk.headA), LEN.headDist), sk.headShift);
    const body = [{ t: "seg", p: o.S, q: C, w: WIDTH.neck }];
    if (sk.curve) {
      const mid = [(sk.hip[0] + o.S[0]) / 2, (sk.hip[1] + o.S[1]) / 2];
      const c = add(mid, dir(sk.torso - 90), sk.curve * 2);
      body.push({ t: "quad", p: sk.hip, c, q: o.S, w: WIDTH.torso });
    } else {
      body.push({ t: "seg", p: sk.hip, q: o.S, w: front ? WIDTH.torsoFront : WIDTH.torso });
    }
    if (!front && sk.face != null) body.push({ t: "circ", c: add(C, dir(sk.face), 8.2), r: 2.6 });
    body.push({ t: "circ", c: C, r: LEN.headR });
    parts.body = body;
    parts.headC = C;
    parts.hands = {
      N: limbPoints(o.shN, sk.armN)[2],
      F: limbPoints(o.shF, sk.armF)[2]
    };
    return parts;
  }

  function figureSVG(sk) {
    const p = figureParts(sk);
    const order = sk.view === "front"
      ? [["legF", COLOURS.body], ["legN", COLOURS.body], ["body", COLOURS.body], ["armF", COLOURS.body], ["armN", COLOURS.body]]
      : [["legF", COLOURS.far], ["armF", COLOURS.far], ["body", COLOURS.body], ["legN", COLOURS.body], ["armN", COLOURS.body]];
    let svg = order.map(([k, fill]) => renderGroup(p[k], fill)).join("");
    if (sk.view === "front") {
      // simple face: two eyes and a nose that move when the head turns
      const C = p.headC, s = sk.faceTurn * 4.5;
      svg += `<g fill="${COLOURS.line}"><circle cx="${n(C[0] - 3.2 + s)}" cy="${n(C[1] - 1)}" r="1.1"/><circle cx="${n(C[0] + 3.2 + s)}" cy="${n(C[1] - 1)}" r="1.1"/></g>` +
        `<path d="M${n(C[0] + s * 1.25)} ${n(C[1] + 0.5)}l${n(sk.faceTurn * 1.5)} 2.6" stroke="${COLOURS.line}" stroke-width="1.2" fill="none" stroke-linecap="round"/>`;
    }
    return { svg, parts: p };
  }

  // ---------- props (furniture etc.) ----------
  function propSVG(pr, parts) {
    const s = `stroke="${COLOURS.prop}" stroke-width="2" fill="${COLOURS.propFill}" stroke-linejoin="round"`;
    switch (pr.type) {
      case "floor":
        return `<path d="M6 ${GROUND + 1}H${PW - 6}" stroke="${COLOURS.prop}" stroke-width="2" stroke-linecap="round"/>`;
      case "mat":
        return `<rect x="${pr.x1}" y="155" width="${pr.x2 - pr.x1}" height="5" rx="2.5" ${s}/>`;
      case "chair": { // side-on chair, back on the left
        const x = pr.x, w = pr.w || 42, y = pr.seat || 127;
        return `<path d="M${x} ${y}V${y - 48}" stroke="${COLOURS.prop}" stroke-width="4" stroke-linecap="round"/>` +
          `<path d="M${x + 3} ${y + 4}V${GROUND}M${x + w - 3} ${y + 4}V${GROUND}" stroke="${COLOURS.prop}" stroke-width="3" stroke-linecap="round"/>` +
          `<rect x="${x - 2}" y="${y}" width="${w + 2}" height="5" rx="2" ${s}/>`;
      }
      case "chairFront": { // chair seen from the front
        const x = pr.x, w = pr.w || 50, y = pr.seat || 127;
        return `<rect x="${x + 4}" y="${y - 50}" width="${w - 8}" height="46" rx="4" ${s}/>` +
          `<path d="M${x + 4} ${y + 4}V${GROUND}M${x + w - 4} ${y + 4}V${GROUND}" stroke="${COLOURS.prop}" stroke-width="3" stroke-linecap="round"/>` +
          `<rect x="${x}" y="${y}" width="${w}" height="6" rx="2" ${s}/>`;
      }
      case "stool": {
        const { x, w, top } = pr;
        return `<rect x="${x}" y="${top}" width="${w}" height="${GROUND - top}" rx="4" ${s}/>`;
      }
      case "table": {
        const { x1, x2, top } = pr;
        return `<path d="M${x1 + 6} ${top}V${GROUND}M${x2 - 6} ${top}V${GROUND}" stroke="${COLOURS.prop}" stroke-width="3"/>` +
          `<rect x="${x1}" y="${top}" width="${x2 - x1}" height="6" rx="2" ${s}/>`;
      }
      case "wall":
        return `<rect x="${pr.x}" y="4" width="${pr.w || 10}" height="${GROUND - 3}" ${s}/>`;
      case "roll":
        return `<circle cx="${pr.c[0]}" cy="${pr.c[1]}" r="${pr.r || 5}" ${s}/>`;
      case "door":
        return `<rect x="${pr.x}" y="10" width="8" height="${GROUND - 10}" ${s}/><circle cx="${pr.x + 8}" cy="${pr.y}" r="2.5" fill="${COLOURS.prop}"/>`;
      case "band": {
        const h = parts.hands[pr.hand || "N"];
        return `<path d="M${pr.from[0]} ${pr.from[1]}L${n(h[0])} ${n(h[1])}" stroke="${COLOURS.band}" stroke-width="3" stroke-linecap="round"/>`;
      }
      case "text":
        return `<text x="${pr.x}" y="${pr.y}" font-size="${pr.size || 13}" font-weight="700" fill="${COLOURS.move}" font-family="system-ui, sans-serif">${pr.text}</text>`;
      default: return "";
    }
  }

  function arrowSVG(a, id) {
    const d = a.c
      ? `M${a.from[0]} ${a.from[1]}Q${a.c[0]} ${a.c[1]} ${a.to[0]} ${a.to[1]}`
      : `M${a.from[0]} ${a.from[1]}L${a.to[0]} ${a.to[1]}`;
    return `<path d="${d}" fill="none" stroke="${COLOURS.move}" stroke-width="2.6" stroke-linecap="round" marker-end="url(#${id})"${a.both ? ` marker-start="url(#${id})"` : ""}/>`;
  }

  let uid = 0;
  function defs(id) {
    return `<defs><marker id="${id}" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.2" markerHeight="4.2" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${COLOURS.move}"/></marker></defs>`;
  }

  // One panel: background, props (behind), figure, props in front, arrows
  function panelInner(ill, sk, arrows, markerId) {
    const fig = figureSVG(sk);
    const back = (ill.props || []).filter((p) => !p.front && p.type !== "band" && p.type !== "text");
    const front = (ill.props || []).filter((p) => p.front || p.type === "band");
    const c = crop(ill);
    return `<rect x="${c[0]}" y="${c[1]}" width="${c[2]}" height="${c[3]}" rx="${n(c[3] / 14)}" fill="${COLOURS.panel}"/>` +
      `<path d="M${c[0] + 6} ${GROUND + 1}H${c[0] + c[2] - 6}" stroke="${COLOURS.prop}" stroke-width="2" stroke-linecap="round"/>` +
      back.map((p) => propSVG(p, fig.parts)).join("") +
      fig.svg +
      front.map((p) => propSVG(p, fig.parts)).join("") +
      (arrows || []).map((a) => arrowSVG(a, markerId)).join("");
  }

  // The part of the drawing area shown for an exercise: [x, y, width, height]
  const crop = (ill) => ill.crop || [0, 0, PW, PH];

  // ---------- public: static pictures ----------
  function frameSVG(ill, index, opts = {}) {
    const id = "ah" + ++uid;
    const fr = ill.frames[index];
    const extra = (fr.text || []).map((t) => propSVG(Object.assign({ type: "text" }, t))).join("");
    return `<svg viewBox="${crop(ill).join(" ")}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXML(opts.alt || fr.label)}">${defs(id)}${panelInner(ill, resolve(fr.pose), opts.arrows === false ? [] : fr.arrows, id)}${extra}</svg>`;
  }

  // All frames side by side, numbered, with arrows: used on the printed handout
  function stripSVG(ill, alt) {
    const id = "ah" + ++uid;
    const c = crop(ill), H = 170, scale = H / c[3], pw = c[2] * scale;
    const gap = 24, count = ill.frames.length, w = count * pw + (count - 1) * gap, h = H + 38;
    let body = "";
    ill.frames.forEach((fr, i) => {
      const x = i * (pw + gap);
      const extra = (fr.text || []).map((t) => propSVG(Object.assign({ type: "text" }, t))).join("");
      body += `<svg x="${n(x)}" y="0" width="${n(pw)}" height="${H}" viewBox="${c.join(" ")}">${panelInner(ill, resolve(fr.pose), fr.arrows, id)}${extra}</svg>` +
        `<g transform="translate(${n(x)} 0)"><circle cx="15" cy="${H + 20}" r="13" fill="${COLOURS.line}"/><text x="15" y="${H + 26}" text-anchor="middle" font-size="16" font-weight="700" fill="#fff" font-family="system-ui, sans-serif">${i + 1}</text>` +
        `<text x="35" y="${H + 26}" font-size="17" font-weight="600" fill="${COLOURS.text}" font-family="system-ui, sans-serif">${escapeXML(fr.label)}</text></g>`;
      if (i < count - 1) {
        const cx = x + pw + gap / 2;
        body += `<path d="M${n(cx - 4)} ${H / 2 - 8}l8 8-8 8" fill="none" stroke="${COLOURS.chevron}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;
      }
    });
    return `<svg viewBox="0 0 ${n(w)} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXML(alt || "Exercise steps")}">${defs(id)}${body}</svg>`;
  }

  function escapeXML(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  // ---------- public: animation (like a looping GIF) ----------
  const MOVE = 1.1, HOLD = 0.8; // seconds
  const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  function timeline(ill) {
    const n = ill.frames.length;
    const order = [];
    for (let i = 0; i < n; i++) order.push(i);
    if (ill.loop === "cycle") order.push(0);
    else for (let i = n - 2; i > 0; i--) order.push(i);
    const steps = [];
    for (let i = 0; i < order.length; i++) {
      const a = order[i], b = order[(i + 1) % order.length];
      steps.push({ a, b, hold: ill.frames[a].hold != null ? ill.frames[a].hold : HOLD, move: ill.frames[b].move || MOVE });
    }
    return steps;
  }

  const running = new Set();
  let rafId = null, paused = false;
  const reduceMotion = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function tick(now) {
    running.forEach((anim) => {
      if (!anim.svg.isConnected) { running.delete(anim); return; }
      if (anim.paused || paused) return;
      if (now - anim.lastDraw < 33) return; // ~30 frames a second is plenty
      anim.lastDraw = now;
      const t = ((now - anim.start) / 1000) % anim.total;
      let acc = 0;
      for (const st of anim.steps) {
        if (t < acc + st.hold) { anim.draw(anim.skels[st.a]); break; }
        acc += st.hold;
        if (t < acc + st.move) { anim.draw(mix(anim.skels[st.a], anim.skels[st.b], ease((t - acc) / st.move))); break; }
        acc += st.move;
      }
    });
    rafId = running.size ? requestAnimationFrame(tick) : null;
  }

  function animate(container, ill, opts = {}) {
    const id = "ah" + ++uid;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", crop(ill).join(" "));
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", opts.alt || "Animated exercise illustration");
    container.innerHTML = "";
    container.append(svg);
    const skels = ill.frames.map((f) => resolve(f.pose));
    const steps = timeline(ill);
    const anim = {
      svg, skels, steps,
      total: steps.reduce((s, st) => s + st.hold + st.move, 0),
      start: performance.now() - (opts.offset || 0) * 1000, lastDraw: 0,
      paused: false,
      draw: (sk) => { svg.innerHTML = defs(id) + panelInner(ill, sk, [], id); }
    };
    anim.draw(skels[0]);
    running.add(anim);
    if (!rafId) rafId = requestAnimationFrame(tick);
    return {
      pause() { anim.paused = true; },
      play() { anim.paused = false; anim.start = performance.now(); },
      get paused() { return anim.paused; }
    };
  }

  root.PhysioFigures = {
    frameSVG, stripSVG, animate, resolve, reduceMotion,
    setAllPaused(v) { paused = v; }
  };
  if (typeof module !== "undefined") module.exports = root.PhysioFigures;
})(typeof window !== "undefined" ? window : globalThis);
