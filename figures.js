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
    parts.feet = {
      N: limbPoints(o.hipN, sk.legN)[2],
      F: limbPoints(o.hipF, sk.legF)[2]
    };
    parts.toes = {
      N: add(parts.feet.N, dir(sk.legN.f), sk.legN.fl),
      F: add(parts.feet.F, dir(sk.legF.f), sk.legF.fl)
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
        const h = pr.toes ? parts.toes[pr.toes] : pr.foot ? parts.feet[pr.foot] : parts.hands[pr.hand || "N"];
        const f = pr.fromHand ? parts.hands[pr.fromHand] : pr.from;
        return `<path d="M${n(f[0])} ${n(f[1])}L${n(h[0])} ${n(h[1])}" stroke="${COLOURS.band}" stroke-width="3" stroke-linecap="round"/>`;
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


  // ---------- close-up hand pictures (ill.kind === "hand") ----------
  // A frame has "hand" instead of "pose". Two views:
  //   view "side": forearm, palm and fingers seen from the side. base = forearm direction,
  //     wrist = wrist bend, mcp/pip/dip = finger joint bends, thumb = thumb angle,
  //     ball / weight (size) and stick (direction) for things held in the hand.
  //   view "palm": hand seen from the front, forearm pointing down. turn = 0 palm, 180 back of hand,
  //     spread = how far apart the fingers are, flex = [index, middle, ring, little] bend from 0 to 1,
  //     touch = which finger (0 to 3) the thumb touches, fist = 0 to 1, stick = direction of a held stick.
  function resolveHand(h) {
    const P = {}, N = {};
    if ((h.view || "side") === "side") {
      const W = h.at || [104, 96], base = h.base || 0;
      const pa = base + (h.wrist || 0);
      P.E = add(W, dir(base), -84); P.W = W;
      P.K = add(W, dir(pa), 27);
      const a1 = pa + (h.mcp || 0), a2 = a1 + (h.pip || 0), a3 = a2 + (h.dip || 0);
      P.F1 = add(P.K, dir(a1), 17); P.F2 = add(P.F1, dir(a2), 12); P.F3 = add(P.F2, dir(a3), 9);
      const ta = pa + (h.thumb != null ? h.thumb : 26);
      P.T0 = add(add(W, dir(pa), 8), dir(pa + 90), 4);
      P.T1 = add(P.T0, dir(ta), 14); P.T2 = add(P.T1, dir(ta + (h.thumbBend || 0)), 11);
      P.G = add(add(P.K, dir(pa), 3), dir(pa + 90), 9 + (h.ball || 0) * 0.3);
      if (h.objAt) P.G = add(P.K, dir(pa + h.objAt[0]), h.objAt[1]);
      N.ball = h.ball || 0; N.weight = h.weight || 0;
      N.stick = h.stick != null ? h.stick : 0; N.hasStick = h.stick != null ? 1 : 0;
    } else {
      const W = h.at || [95, 120], c = Math.cos(rad(h.turn || 0)), sg = c < 0 ? -1 : 1;
      const fist = h.fist || 0;
      P.E = add(W, [0, 1], 70); P.W = W;
      P.K = add(W, [0, -30], 1);
      N.palmW = Math.max(12, 29 * Math.abs(c));
      const xs = [10.5, 3.5, -3.5, -10.5], L = [25, 28, 26, 20], fan = [1.4, 0.45, -0.45, -1.4];
      const flex = h.flex || [0, 0, 0, 0];
      for (let i = 0; i < 4; i++) {
        const f = Math.max(flex[i] || 0, fist, h.touch === i ? 0.45 : 0);
        const a = -90 + (h.spread || 0) * fan[i] * sg;
        const B = add(P.K, [xs[i] * c, 2], 1);
        const len = L[i] * (1 - 0.62 * f);
        P["B" + i] = B; P["M" + i] = add(B, dir(a), len * 0.55); P["F" + i] = add(B, dir(a), len);
      }
      P.T0 = add(W, [15 * c, -7], 1);
      let tip;
      if (h.touch != null) tip = add(P["F" + h.touch], [5 * c, 2], 1);
      else if (fist) tip = add(P.K, [6 * c, -4], 1);
      else tip = add(P.T0, [17 * c, -18], 1);
      P.T2 = tip;
      const mid = [(P.T0[0] + tip[0]) / 2, (P.T0[1] + tip[1]) / 2];
      P.T1 = add(mid, [c * 6, 2], 1);
      P.G = add(P.K, [0, 4], 1);
      N.ball = 0; N.weight = 0;
      N.stick = h.stick != null ? h.stick : -90; N.hasStick = h.stick != null ? 1 : 0;
      N.band = h.band ? 1 : 0;
      N.nails = Math.max(0, -c);
    }
    return { view: h.view || "side", P, N };
  }

  function mixHand(A, B, t) {
    const P = {}, N = {};
    for (const k in A.P) P[k] = [lerp(A.P[k][0], B.P[k][0], t), lerp(A.P[k][1], B.P[k][1], t)];
    for (const k in A.N) N[k] = k === "stick" ? lerpAngle(A.N[k], B.N[k], t) : lerp(A.N[k], B.N[k], t);
    return { view: A.view, P, N };
  }

  function handSVG(hd) {
    const P = hd.P, N = hd.N;
    let out = "";
    const stick = () => {
      if (!N.hasStick) return "";
      const a = dir(N.stick), s = add(P.G, a, -16), e = add(P.G, a, 42), pp = dir(N.stick + 90);
      return `<path d="M${n(s[0])} ${n(s[1])}L${n(e[0])} ${n(e[1])}" stroke="${COLOURS.prop}" stroke-width="6" stroke-linecap="round"/>` +
        `<path d="M${n(e[0] - pp[0] * 9)} ${n(e[1] - pp[1] * 9)}L${n(e[0] + pp[0] * 9)} ${n(e[1] + pp[1] * 9)}" stroke="${COLOURS.prop}" stroke-width="11" stroke-linecap="round"/>`;
    };
    if (hd.view === "side") {
      out += renderGroup([{ t: "seg", p: P.T0, q: P.T1, w: 8 }, { t: "seg", p: P.T1, q: P.T2, w: 7 }], COLOURS.far);
      out += stick();
      if (N.ball > 0.5) out += `<circle cx="${n(P.G[0])}" cy="${n(P.G[1])}" r="${n(N.ball)}" fill="#f2c7a8" stroke="${COLOURS.move}" stroke-width="1.8"/>`;
      out += renderGroup([
        { t: "seg", p: P.E, q: P.W, w: 16 },
        { t: "seg", p: P.W, q: P.K, w: 15 },
        { t: "seg", p: P.K, q: P.F1, w: 9.5 },
        { t: "seg", p: P.F1, q: P.F2, w: 8.5 },
        { t: "seg", p: P.F2, q: P.F3, w: 7.5 }
      ], COLOURS.body);
      if (N.weight > 0.5) {
        out += `<circle cx="${n(P.G[0])}" cy="${n(P.G[1])}" r="${n(N.weight)}" fill="${COLOURS.prop}" stroke="${COLOURS.line}" stroke-width="1.8"/>` +
          `<circle cx="${n(P.G[0])}" cy="${n(P.G[1])}" r="${n(N.weight * 0.35)}" fill="${COLOURS.propFill}"/>`;
      }
    } else {
      out += stick();
      const fingers = [];
      for (let i = 3; i >= 0; i--) fingers.push({ t: "seg", p: P["B" + i], q: P["M" + i], w: 7.5 }, { t: "seg", p: P["M" + i], q: P["F" + i], w: 7 });
      out += renderGroup([{ t: "seg", p: P.E, q: P.W, w: 17 }].concat(fingers, [{ t: "seg", p: add(P.W, [0, -3], 1), q: add(P.K, [0, 3], 1), w: N.palmW }]), COLOURS.body);
      if (N.nails > 0.05) {
        for (let i = 0; i < 4; i++) {
          const a = dir(ang(P["M" + i], P["F" + i])), q = add(P["F" + i], a, -2.5);
          out += `<ellipse cx="${n(q[0])}" cy="${n(q[1])}" rx="${n(2.4 * N.nails)}" ry="${n(3 * N.nails)}" fill="#fff" stroke="${COLOURS.line}" stroke-width="0.9"/>`;
        }
      }
      out += renderGroup([{ t: "seg", p: P.T0, q: P.T1, w: 8.5 }, { t: "seg", p: P.T1, q: P.T2, w: 7.5 }], COLOURS.body);
      if (N.band > 0.5) {
        const m = [3, 2, 1, 0].map((i) => add(P["B" + i], dir(ang(P["B" + i], P["F" + i])), 13));
        const top = m.map((p) => `${n(p[0])} ${n(p[1] - 3)}`).join("L"), bot = m.slice().reverse().map((p) => `${n(p[0])} ${n(p[1] + 3)}`).join("L");
        out += `<path d="M${top}L${bot}Z" fill="none" stroke="${COLOURS.band}" stroke-width="2.6" stroke-linejoin="round"/>`;
      }
    }
    return out;
  }

  function handPanel(ill, hd, arrows, markerId) {
    const c = crop(ill);
    const props = (ill.props || []).map((pr) => {
      if (pr.type === "tableTop") return `<rect x="${pr.x1}" y="${pr.y}" width="${pr.x2 - pr.x1}" height="${pr.h || 10}" rx="2" stroke="${COLOURS.prop}" stroke-width="2" fill="${COLOURS.propFill}"/>`;
      if (pr.type === "roll") return propSVG(pr);
      return "";
    }).join("");
    return `<rect x="${c[0]}" y="${c[1]}" width="${c[2]}" height="${c[3]}" rx="${n(c[3] / 14)}" fill="${COLOURS.panel}"/>` +
      props + handSVG(hd) + (arrows || []).map((a) => arrowSVG(a, markerId)).join("");
  }

  const isHand = (ill) => ill.kind === "hand";
  const resolveFrame = (ill, fr) => (isHand(ill) ? resolveHand(fr.hand) : resolve(fr.pose));
  const drawPanel = (ill, sk, arrows, id) => (isHand(ill) ? handPanel(ill, sk, arrows, id) : panelInner(ill, sk, arrows, id));

  // ---------- public: static pictures ----------
  function frameSVG(ill, index, opts = {}) {
    const id = "ah" + ++uid;
    const fr = ill.frames[index];
    const extra = (fr.text || []).map((t) => propSVG(Object.assign({ type: "text" }, t))).join("");
    return `<svg viewBox="${crop(ill).join(" ")}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXML(opts.alt || fr.label)}">${defs(id)}${drawPanel(ill, resolveFrame(ill, fr), opts.arrows === false ? [] : fr.arrows, id)}${extra}</svg>`;
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
      body += `<svg x="${n(x)}" y="0" width="${n(pw)}" height="${H}" viewBox="${c.join(" ")}">${drawPanel(ill, resolveFrame(ill, fr), fr.arrows, id)}${extra}</svg>` +
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
        if (t < acc + st.move) { anim.draw(anim.blend(anim.skels[st.a], anim.skels[st.b], ease((t - acc) / st.move))); break; }
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
    const skels = ill.frames.map((f) => resolveFrame(ill, f));
    const blend = isHand(ill) ? mixHand : mix;
    const steps = timeline(ill);
    const anim = {
      svg, skels, steps, blend,
      total: steps.reduce((s, st) => s + st.hold + st.move, 0),
      start: performance.now() - (opts.offset || 0) * 1000, lastDraw: 0,
      paused: false,
      draw: (sk) => { svg.innerHTML = defs(id) + drawPanel(ill, sk, [], id); }
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
