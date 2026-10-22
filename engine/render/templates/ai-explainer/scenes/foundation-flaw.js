// Scene "foundation-flaw" (was php-foundation) (full frame). A skyline of websites (buildings with browser-window facades) stands on ONE
// shared underground foundation slab (cut-away view) named after the software everyone builds on; hidden cracks in it
// are the security holes. Modes:
//   find    (best as 2-beat span) dusk: the slab with faint cracks; a finder robot scans with a torch beam; share pill
//           (websites light up), date pill, the cracks flare red with ring markers + flaws pill; a second finder
//           robot walks in; text name pills over each robot (no logos)
//   layers  close-up cut-away: the slab as stacked strata (oldest at the bottom, labelled versions); one crack runs up
//           through every layer; "every version" pill; an AI-agent robot with model-name chips pulls two cartoon
//           bugs out of the crack into a jar
//   patch   dusk -> night: all sites light up (+ "millions" pill), a generic agency building (text pill only) rises
//           with a pulsing warning sign, then glowing patch plates slap onto the cracks under a verbatim quote panel
//   payoff  night: patched slab, guard robot with a shield, a person updates on a laptop (progress bar -> check),
//           question card ("|" = line break)
// params: mode, base (slab name, short: "CORE"; e.g. a language / library name),
//   find:   share, date, flaws, ai, a, b, shareCue, dateCue, flawsCue, aiCue, aCue, bCue
//   layers: layers [bottom..top], every, every_by, agent, models [2], oldCue, everyCue, agentCue, modelsCue, digCue
//   patch:  millions, agency, warn, quote, by, millionsCue, agencyCue, warnCue, quoteCue
//   payoff: first, update, question, firstCue, updateCue, qCue
// Cue params are narration words; "word#n" = the (n+1)th time it is spoken in this scene. Without them, fractions.
// Fits: a flaw in shared infrastructure everybody builds on (a language, a library, a protocol, a chip).
const RED = '#ff5a52';
const CRACKS = [230, 720];

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration;
  const at = (w, d) => {
    if (!w) return d;
    const [word, n] = String(w).split('#');
    const v = info.timeOf(word, n ? parseInt(n, 10) : 0);
    return v == null ? d : v;
  };
  const mode = P.mode || 'find';
  ctx.save();
  if (mode === 'layers') layers(ctx, t, info, H, K, P, D, at);
  else if (mode === 'patch') patch(ctx, t, info, H, K, P, D, at);
  else if (mode === 'payoff') payoff(ctx, t, info, H, K, P, D, at);
  else find(ctx, t, info, H, K, P, D, at);
  ctx.restore();
}

// ------------------------------------------------------------------ shared world: skyline on a foundation slab
const GY = 760;               // street level
const SLAB = [GY + 34, 1040]; // slab top / bottom
function world(ctx, H, K, t, o) {
  const { roundRect, rgba, mixHex } = H;
  const night = o.night || 0; // 0 dusk .. 1 night
  // sky
  const g = ctx.createLinearGradient(0, 0, 0, GY);
  g.addColorStop(0, mixHex('#2e2f63', '#0a0f2b', night)); g.addColorStop(1, mixHex('#c97a6a', '#1d2654', night));
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, GY);
  for (let i = 0; i < 30; i++) {
    const sx = H.hash(i, 3) * 1080, sy = 120 + H.hash(i, 4) * 420;
    ctx.globalAlpha = night * (0.3 + 0.4 * (0.5 + 0.5 * Math.sin(t * 2 + i))); ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(sx, sy, 1.5 + H.hash(i, 5) * 1.4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
  // far skyline silhouettes
  for (let i = 0; i < 12; i++) {
    const w = 90 + 50 * H.hash(i, 11), h = 120 + 200 * H.hash(i, 12), x = -40 + i * 98;
    roundRect(ctx, x, GY - h, w, h, 6); ctx.fillStyle = mixHex('#3f3c6c', '#151a3c', night); ctx.fill();
  }
  // website buildings (browser-window facades)
  const sites = o.sites || SITES;
  sites.forEach((s, i) => site(ctx, H, K, s, t, o.lit == null ? 0.4 : (typeof o.lit === 'function' ? o.lit(i) : o.lit), i, o.acc));
  // street
  roundRect(ctx, 0, GY, 1080, 14, 0); ctx.fillStyle = '#4b5175'; ctx.fill();
  // earth + slab cut-away
  const eg = ctx.createLinearGradient(0, GY + 14, 0, 1920); eg.addColorStop(0, '#3b2f3f'); eg.addColorStop(1, '#120e18');
  ctx.fillStyle = eg; ctx.fillRect(0, GY + 14, 1080, 1920 - GY - 14);
  for (let i = 0; i < 40; i++) { // pebbles
    const px = H.hash(i, 21) * 1080, py = GY + 22 + H.hash(i, 22) * 900;
    if (py > SLAB[0] - 6 && py < SLAB[1] + 8) continue;
    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.ellipse(px, py, 6 + 6 * H.hash(i, 23), 4, 0, 0, Math.PI * 2); ctx.fill();
  }
  if (o.slab !== false) slab(ctx, H, K, t, o);
}
const SITES = [
  { x: 125, w: 150, h: 190, c: '#8fb0dc', sign: 'SHOP' },
  { x: 295, w: 170, h: 225, c: '#e0a77a', sign: 'NEWS' },
  { x: 470, w: 140, h: 175, c: '#9fd3b5', sign: 'BLOG' },
  { x: 640, w: 170, h: 210, c: '#c7a6e8', sign: 'BANK' },
  { x: 820, w: 150, h: 185, c: '#f2c86b', sign: 'SCHOOL' },
];
function site(ctx, H, K, s, t, lit, i, acc) {
  const { roundRect, rgba } = H;
  const x = s.x, w = s.w, h = s.h, top = GY - h;
  roundRect(ctx, x - w / 2 - 6, top - 6, w + 12, h + 6, 12); ctx.fillStyle = '#2a2f52'; ctx.fill();
  roundRect(ctx, x - w / 2, top, w, h - 40, 9); ctx.fillStyle = '#f4f1e8'; ctx.fill();
  roundRect(ctx, x - w / 2, top, w, 24, 9); ctx.fillStyle = '#d7d2c4'; ctx.fill();
  for (let d = 0; d < 3; d++) { ctx.beginPath(); ctx.arc(x - w / 2 + 15 + d * 14, top + 12, 4.5, 0, Math.PI * 2); ctx.fillStyle = ['#ef6b6b', '#f2c86b', '#7bd389'][d]; ctx.fill(); }
  ctx.font = H.font('display', 24); ctx.fillStyle = '#20243f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(s.sign, x, top + 48);
  roundRect(ctx, x - w / 2 + 14, top + 66, w - 28, Math.min(70, h * 0.25), 6); ctx.fillStyle = s.c; ctx.fill();
  const rows = Math.max(2, Math.floor((h - 190) / 18));
  for (let r = 0; r < rows; r++) { roundRect(ctx, x - w / 2 + 14, top + 66 + Math.min(70, h * 0.25) + 14 + r * 17, r === rows - 1 ? w * 0.4 : w - 28, 7, 3); ctx.fillStyle = '#c9c4b5'; ctx.fill(); }
  // ground floor with door and lit shop windows
  roundRect(ctx, x - w / 2, GY - 40, w, 40, 0); ctx.fillStyle = '#3d4470'; ctx.fill();
  roundRect(ctx, x - 16, GY - 36, 32, 36, 4); ctx.fillStyle = '#1f2340'; ctx.fill();
  for (const side of [-1, 1]) {
    const on = H.hash(i * 7 + side, Math.floor(t * 0.5)) < 0.3 + 0.7 * lit;
    roundRect(ctx, x + side * (w / 4 + 6) - 14, GY - 32, 28, 22, 3); ctx.fillStyle = on ? rgba('#ffe7a8', 0.4 + 0.5 * lit) : '#2a2f52'; ctx.fill();
  }
  if (lit > 0.7) K.glow(ctx, x, top + h / 2, w * 0.9, acc || '#ffe14a', 0.18 * (lit - 0.7) / 0.3);
}
// slab: stone blocks + big name plate; cracks drawn by crack()
function slab(ctx, H, K, t, o) {
  const { roundRect, rgba, mixHex } = H;
  const [y0, y1] = SLAB;
  roundRect(ctx, 30, y0, 1020, y1 - y0, 18); ctx.fillStyle = '#6b6f8e'; ctx.fill();
  ctx.save(); roundRect(ctx, 30, y0, 1020, y1 - y0, 18); ctx.clip();
  ctx.fillStyle = '#5a5e7c'; ctx.fillRect(30, y0 + (y1 - y0) * 0.62, 1020, 200);
  ctx.strokeStyle = 'rgba(20,22,40,0.35)'; ctx.lineWidth = 4;
  for (let r = 0; r < 4; r++) {
    const yy = y0 + r * (y1 - y0) / 4; ctx.beginPath(); ctx.moveTo(30, yy); ctx.lineTo(1050, yy); ctx.stroke();
    for (let c = 0; c < 7; c++) { const xx = 30 + (c + (r % 2) * 0.5) * 160; ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx, yy + (y1 - y0) / 4); ctx.stroke(); }
  }
  ctx.restore();
  roundRect(ctx, 30, y0, 1020, 14, 7); ctx.fillStyle = '#8a8eb0'; ctx.fill();
  // name plate (left of centre, between the cracks)
  const name = String(o.base || 'CORE');
  roundRect(ctx, 405, y0 + 70, 170, 84, 16); ctx.fillStyle = 'rgba(12,14,26,0.82)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = rgba('#ffffff', 0.25); ctx.stroke();
  ctx.font = H.font('display', 54); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(name, 490, y0 + 114);
  // cracks
  const cx = o.cracks || CRACKS;
  cx.forEach((x, i) => crack(ctx, H, K, x, y0 + 4, y1 - 6, o.crack ? o.crack(i) : { show: 0.3 }, t, i));
}
function crackPts(x, y0, y1, i) {
  const pts = [], n = 7;
  for (let k = 0; k <= n; k++) pts.push([x + (k % 2 ? 1 : -1) * (14 + 8 * ((k * 7 + i * 3) % 3)) * (k === 0 || k === n ? 0.3 : 1), y0 + (y1 - y0) * k / n]);
  return pts;
}
// state: { show 0..1 (draw-in), hot 0..1 (red glow), ring 0..1, patch 0..1 }
function crack(ctx, H, K, x, y0, y1, st, t, i) {
  const pts = crackPts(x, y0, y1, i), show = st.show || 0, hot = st.hot || 0, patch = st.patch || 0;
  if (show <= 0) return;
  ctx.save();
  if (hot > 0) K.glow(ctx, x, (y0 + y1) / 2, 150, RED, 0.45 * hot * (0.8 + 0.2 * Math.sin(t * 6 + i)));
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#141626'; ctx.lineWidth = 16; K.pathDraw(ctx, pts, show);
  ctx.strokeStyle = H.mixHex('#2a2c44', RED, hot); ctx.lineWidth = 7; K.pathDraw(ctx, pts, show);
  ctx.restore();
  if (st.ring > 0) {
    const r = 120 * Math.min(1.1, st.ring);
    ctx.save(); ctx.globalAlpha = Math.min(1, st.ring) * (1 - patch); ctx.strokeStyle = RED; ctx.lineWidth = 6; ctx.setLineDash([16, 12]);
    ctx.lineDashOffset = -t * 30;
    ctx.beginPath(); ctx.ellipse(x, (y0 + y1) / 2, r * 0.62, r, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  if (patch > 0) {
    const k = Math.min(1.08, patch), y = (y0 + y1) / 2, acc = st.acc || '#c4ff3a';
    ctx.save(); ctx.translate(x, y - (1 - Math.min(1, patch)) * 120); ctx.scale(k, k); ctx.rotate(-0.04 + 0.08 * (i % 2));
    K.glow(ctx, 0, 0, 160, acc, 0.35);
    H.roundRect(ctx, -62, -96, 124, 192, 18); ctx.fillStyle = acc; ctx.fill();
    H.roundRect(ctx, -62, -96, 124, 192, 18); ctx.lineWidth = 5; ctx.strokeStyle = K.ACCENT.deep; ctx.stroke();
    for (const [sx, sy] of [[-42, -76], [42, -76], [-42, 76], [42, 76]]) { ctx.beginPath(); ctx.arc(sx, sy, 7, 0, Math.PI * 2); ctx.fillStyle = K.ACCENT.deep; ctx.fill(); }
    ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    K.pathDraw(ctx, [[-30, 2], [-8, 26], [32, -24]], H.clamp((patch - 0.5) / 0.5));
    ctx.restore();
  }
}
// torch beam from (x, y) to a target point
function beam(ctx, H, x, y, tx, ty, a, col) {
  if (a <= 0) return;
  const ang = Math.atan2(ty - y, tx - x), len = Math.hypot(tx - x, ty - y), spread = 70;
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  const g = ctx.createLinearGradient(0, 0, len, 0); g.addColorStop(0, H.rgba(col, 0.55 * a)); g.addColorStop(1, H.rgba(col, 0.08 * a));
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(len, -spread); ctx.lineTo(len, spread); ctx.lineTo(0, 8); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.globalAlpha = 0.35 * a; ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(tx, ty, 34, 80, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
}
function torch(ctx, H, x, y, flip) {
  ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1);
  H.roundRect(ctx, -26, -11, 44, 22, 6); ctx.fillStyle = '#2a2f45'; ctx.fill();
  H.roundRect(ctx, 14, -15, 14, 30, 4); ctx.fillStyle = '#c9cfdf'; ctx.fill();
  ctx.restore();
}
function pillStack(ctx, K, t, items) {
  items.forEach((it) => {
    const k = K.popIn(t, it.t, 0.45);
    if (k > 0) K.drawLabel(ctx, it.x || 487, it.y + K.bob(t, 3, 1.2, it.y), Math.min(1.05, k), { text: it.text, size: it.size || 30, dot: it.dot, accent: it.accent });
  });
}

// ------------------------------------------------------------------ mode: find
function find(ctx, t, info, H, K, P, D, at) {
  const { clamp, smooth, lerp, easeOutCubic } = H;
  const ACC = info.accent;
  const tS = at(P.shareCue, D * 0.4) - 0.2, tD = at(P.dateCue, D * 0.5) - 0.2, tF = at(P.flawsCue, D * 0.57) - 0.3;
  const tAI = at(P.aiCue, D * 0.68) - 0.2, tA = at(P.aCue, D * 0.78) - 0.2, tB = at(P.bCue, D * 0.92) - 0.9;
  const tB0 = tA + 0.5; // second finder starts walking in
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 487, y: 860 }, { t: 3.2, zoom: 1.08, x: 487, y: 860 }, { t: 5.5, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 760 }]);
  const lit = (i) => 0.35 + 0.65 * smooth((t - tS - i * 0.12) / 0.5);
  const cr = CRACKS;
  world(ctx, H, K, t, {
    acc: ACC, lit, cracks: cr, base: P.base,
    crack: (i) => ({ show: 0.25 + 0.75 * smooth((t - 1.0 - i * 0.3) / 1.2), hot: smooth((t - tF - i * 0.2) / 0.5), ring: K.popIn(t, tAI + 0.4 + i * 0.6, 0.5) }),
  });
  // share lines to the sites
  const sk = K.popIn(t, tS, 0.45);
  if (sk > 0) {
    ctx.save(); ctx.globalAlpha = clamp(sk) * 0.7; ctx.strokeStyle = ACC; ctx.lineWidth = 3; ctx.setLineDash([6, 8]);
    SITES.forEach((s) => { ctx.beginPath(); ctx.moveTo(487, 470); ctx.lineTo(s.x, GY - s.h - 6); ctx.stroke(); });
    ctx.restore();
  }
  // finder robot 1 (left, from the start) with a torch beam sweeping the slab
  const r1x = 120, fy = 1036;
  const sweep = t < tAI ? 0.5 + 0.5 * Math.sin(t * 0.9) : 0;
  const target1 = [lerp(lerp(120, 560, sweep), cr[0], smooth((t - tAI) / 0.8)), 900];
  beam(ctx, H, r1x + 50, fy - 150, target1[0], target1[1], smooth((t - 0.8) / 0.6), ACC);
  K.drawRobot(ctx, r1x, fy, 0.95, { t, state: t > tAI + 0.4 ? 'happy' : 'working', seed: 2 });
  torch(ctx, H, r1x + 52, fy - 150, false);
  // finder robot 2 walks in from the right
  const w2 = clamp((t - tB0) / 1.4);
  if (w2 > 0) {
    const r2x = lerp(1180, 860, easeOutCubic(w2));
    beam(ctx, H, r2x - 50, fy - 150, cr[1], 900, smooth((t - tB0 - 1.2) / 0.5), ACC);
    K.drawRobot(ctx, r2x, fy - Math.abs(Math.sin(w2 * Math.PI * 4)) * 8 * (1 - w2), 0.95, { t, state: w2 >= 1 ? 'happy' : 'idle', flip: true, seed: 6 });
    torch(ctx, H, r2x - 52, fy - 150, true);
  }
  // name pills over the robots
  pillStack(ctx, K, t, [
    { t: tA, x: 230, y: 792, text: P.a || 'Finder A', size: 28, dot: true },
    { t: tB, x: 690, y: 792, text: P.b || 'Finder B', size: 28, dot: true },
  ]);
  // top pills
  pillStack(ctx, K, t, [
    { t: tS, y: 486, text: P.share || 'Most websites', size: 38, accent: true },
    { t: tD, x: 290, y: 556, text: P.date || 'Patched', size: 28, dot: true },
    { t: tAI, x: 720, y: 556, text: P.ai || 'Found with AI', size: 28, dot: true },
    { t: tF, x: 490, y: 1022, text: P.flaws || 'Critical flaws', size: 28 },
  ]);
}

// ------------------------------------------------------------------ mode: layers (close-up strata)
function layers(ctx, t, info, H, K, P, D, at) {
  const { clamp, smooth, lerp, easeOutCubic, roundRect, rgba, mixHex } = H;
  const ACC = info.accent;
  const tO = at(P.oldCue, 0.4) - 0.1, tE = at(P.everyCue, D * 0.15) - 0.2, tAg = at(P.agentCue, D * 0.55) - 0.4;
  const tM = at(P.modelsCue, D * 0.7) - 0.2, tDig = at(P.digCue, D * 0.88) - 1.0;
  const names = (P.layers || ['v1', 'v2', 'v3', 'v4']).slice(0, 5);
  const n = names.length;
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 470, y: 780 }, { t: D, zoom: 1.0 }]);
  // background: earth with a strip of street + mini skyline on top
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#1d2654'); g.addColorStop(0.3, '#2a2346'); g.addColorStop(1, '#0f0c16');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  const top = 610, bot = 1040, x0 = 70, x1 = 640;
  for (let i = 0; i < 6; i++) { const w = 70 + 30 * H.hash(i, 31), h = 60 + 90 * H.hash(i, 32), x = x0 + i * 95; roundRect(ctx, x, top - 18 - h, w, h, 5); ctx.fillStyle = '#34396a'; ctx.fill(); for (let r = 0; r < 3; r++) { ctx.fillStyle = rgba('#ffd98a', H.hash(i, r + Math.floor(t * 0.5)) > 0.5 ? 0.6 : 0.1); ctx.fillRect(x + 12, top - h + r * 24, 14, 12); } }
  roundRect(ctx, 30, top - 18, 1020, 18, 0); ctx.fillStyle = '#4b5175'; ctx.fill();
  // strata appear bottom -> top (oldest first)
  const lh = (bot - top) / n, tones = ['#4d4a6e', '#5b5d82', '#6a6f94', '#7b81a8', '#8a90b6'];
  for (let k = 0; k < n; k++) {
    const yB = bot - k * lh, a = smooth((t - tO - k * 0.35) / 0.45);
    if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 30);
    roundRect(ctx, x0, yB - lh + 3, x1 - x0, lh - 6, 12); ctx.fillStyle = tones[k % tones.length]; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; for (let p = 0; p < 9; p++) { ctx.beginPath(); ctx.ellipse(x0 + 30 + H.hash(k, p) * (x1 - x0 - 60), yB - lh * 0.5 + (H.hash(p, k) - 0.5) * lh * 0.6, 8, 4, 0, 0, Math.PI * 2); ctx.fill(); }
    roundRect(ctx, x0 + 18, yB - lh / 2 - 22, 150, 44, 22); ctx.fillStyle = 'rgba(10,12,22,0.8)'; ctx.fill();
    ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(names[k], x0 + 93, yB - lh / 2 + 1);
    ctx.restore();
  }
  // the crack through every layer (draws bottom -> top on "every")
  const cx = 430, cpts = crackPts(cx, bot - 6, top + 6, 1);
  const cu = smooth((t - tE) / 1.6), hot = 0.5 + 0.5 * smooth((t - tE - 1.0) / 0.6);
  if (cu > 0) {
    K.glow(ctx, cx, (top + bot) / 2, 220, RED, 0.35 * hot * cu);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#141626'; ctx.lineWidth = 20; K.pathDraw(ctx, cpts, cu);
    ctx.strokeStyle = RED; ctx.lineWidth = 8; K.pathDraw(ctx, cpts, cu);
  }
  // bracket on the right side of the strata: "every version"
  const bk = smooth((t - tE - 1.4) / 0.5);
  if (bk > 0) {
    ctx.save(); ctx.globalAlpha = bk; ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x1 + 14, top + 8); ctx.lineTo(x1 + 30, top + 8); ctx.lineTo(x1 + 30, bot - 8); ctx.lineTo(x1 + 14, bot - 8); ctx.stroke(); ctx.restore();
  }
  pillStack(ctx, K, t, [{ t: tE + 1.2, y: 486, text: P.every || 'Every version', size: 36, accent: true }]);
  const byk = K.popIn(t, tE + 1.6, 0.4);
  if (byk > 0) K.drawLabel(ctx, 487, 546, Math.min(1.05, byk), { text: P.every_by || 'per source', size: 24 });
  // the AI agent robot walks in from the right, jar beside it
  const rx = lerp(1180, 820, easeOutCubic(clamp((t - tAg + 0.6) / 1.2))), fy = 1036;
  const jarX = 690;
  const caught = (i) => clamp((t - tDig - i * 0.35) / 1.0);
  // jar (behind the bugs' landing)
  if (t > tAg) jar(ctx, H, K, jarX, fy, 1, smooth((t - tAg) / 0.5), clamp((t - tDig - 1.6) / 0.4), ACC);
  // grabber beam from the robot to the crack while digging
  const dg = smooth((t - tDig + 0.2) / 0.3) * (1 - smooth((t - tDig - 1.6) / 0.4));
  if (dg > 0) beam(ctx, H, rx - 70, fy - 170, cx + 20, 820, dg, ACC);
  K.drawRobot(ctx, rx, fy, 1.25, { t, state: t > tDig + 1.6 ? 'happy' : t > tM ? 'thinking' : 'working', flip: true, seed: 2 });
  // bugs: hide in the crack, then fly out in arcs into the jar
  for (let i = 0; i < 2; i++) {
    const u = caught(i), sx = cx + (i ? 16 : -10), sy = i ? 760 : 900;
    if (t < tE + 1.2) continue;
    const pts = K.bezier(sx, sy, sx + 60, sy - 260, jarX - 40, 600, jarX + (i ? 14 : -14), fy - 70, 24);
    const [bx, by] = u <= 0 ? [sx, sy] : K.pathPoint(pts, easeOutCubic(u));
    bug(ctx, H, bx, by + (u <= 0 ? Math.sin(t * 9 + i) * 3 : 0), u > 0 && u < 1 ? 0.9 : 0.75, t + i, u >= 1);
  }
  // agent pill + model chips
  pillStack(ctx, K, t, [{ t: tAg + 0.3, x: 790, y: 712, text: P.agent || 'AI agent', size: 28, dot: true }]);
  const models = (P.models || ['Model A', 'Model B']).slice(0, 2);
  models.forEach((m, i) => {
    const k = K.popIn(t, tM + i * 0.5, 0.45);
    if (k <= 0) return;
    const mx = 720 + i * 135, my = 618 + K.bob(t, 4, 1.4, i);
    ctx.save(); ctx.globalAlpha = clamp(k) * 0.6; ctx.strokeStyle = ACC; ctx.lineWidth = 3; ctx.setLineDash([5, 7]);
    ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(rx, fy - 250); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(mx, my); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
    ctx.font = H.font('bold', 26); const w = ctx.measureText(m).width + 34;
    K.glow(ctx, 0, 0, 70, ACC, 0.25);
    roundRect(ctx, -w / 2, -24, w, 48, 12); ctx.fillStyle = '#161927'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(m, 0, 1);
    ctx.restore();
  });
}
function bug(ctx, H, x, y, s, t, still) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const wig = still ? 0 : Math.sin(t * 20) * 0.4;
  ctx.strokeStyle = '#1a1020'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (const side of [-1, 1]) for (let l = 0; l < 3; l++) { ctx.beginPath(); ctx.moveTo(side * 12, -6 + l * 9); ctx.lineTo(side * (28 + 4 * Math.sin(wig + l)), -12 + l * 12); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-6, -20); ctx.lineTo(-14, -34); ctx.moveTo(6, -20); ctx.lineTo(14, -34); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 4, 18, 22, 0, 0, Math.PI * 2); ctx.fillStyle = RED; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(0, 26); ctx.strokeStyle = '#7a1f22'; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -18, 11, 0, Math.PI * 2); ctx.fillStyle = '#2a1424'; ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-4, -20, 3.2, 0, Math.PI * 2); ctx.arc(4, -20, 3.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function jar(ctx, H, K, x, y, s, a, lid, acc) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
  K.shadow(ctx, 0, 0, 120);
  H.roundRect(ctx, -48, -120, 96, 120, 20); ctx.fillStyle = 'rgba(190,220,255,0.18)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(220,235,255,0.6)'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; H.roundRect(ctx, -36, -104, 10, 70, 5); ctx.fill();
  const ly = -150 + 22 * lid;
  ctx.save(); ctx.translate(0, ly); ctx.rotate(-0.5 * (1 - lid));
  H.roundRect(ctx, -54, -8, 108, 22, 8); ctx.fillStyle = acc; ctx.fill(); ctx.restore();
  ctx.restore();
}

// ------------------------------------------------------------------ mode: patch
function patch(ctx, t, info, H, K, P, D, at) {
  const { clamp, smooth, lerp, easeOutCubic, roundRect } = H;
  const ACC = info.accent;
  const tMil = at(P.millionsCue, D * 0.1) - 0.2, tAg = at(P.agencyCue, D * 0.45) - 0.5, tW = at(P.warnCue, D * 0.6) - 0.2;
  const tQ = at(P.quoteCue, D * 0.78) - 0.3;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tQ, zoom: 1.02, x: 487, y: 760 }, { t: D, zoom: 1.04, x: 487, y: 800 }]);
  const night = smooth(t / (D * 0.6));
  const cr = CRACKS;
  // the agency building rises behind the skyline (right)
  const rise = easeOutCubic(clamp((t - tAg) / 1.0));
  world(ctx, H, K, t, {
    acc: ACC, night, cracks: cr, base: P.base, slab: false,
    lit: (i) => 0.3 + 0.7 * smooth((t - tMil - i * 0.15) / 0.5),
  });
  // agency tower drawn over the far skyline but behind the street pills: generic grey building + text pill
  if (rise > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, GY); ctx.clip();
    K.drawBuilding(ctx, 735, GY + (1 - rise) * 420, 0.62, { t, color: '#6f7a90', floors: 7, lit: 0.6, shadow: false });
    ctx.restore();
    // re-draw the two front sites so the tower sits behind them
    site(ctx, H, K, SITES[3], t, 1, 3, ACC);
    site(ctx, H, K, SITES[4], t, 1, 4, ACC);
    roundRect(ctx, 0, GY, 1080, 14, 0); ctx.fillStyle = '#4b5175'; ctx.fill();
  }
  slab(ctx, H, K, t, {
    base: P.base, cracks: cr,
    crack: (i) => ({ show: 1, hot: 1 - smooth((t - tQ - 0.6 - i * 0.4) / 0.4), ring: 0, patch: clamp((t - tQ - 0.3 - i * 0.4) / 0.6), acc: ACC }),
  });
  const ak = K.popIn(t, tAg + 0.6, 0.4);
  const towerTop = GY + (1 - rise) * 420 - (60 + 7 * 44) * 0.62;
  if (ak > 0) K.drawLabel(ctx, 735, towerTop - 14, Math.min(1.05, ak), { text: P.agency || 'AGENCY', size: 30, dot: true });
  // warning sign + siren rays
  const wk = K.popIn(t, tW, 0.45);
  if (wk > 0) {
    const wx = 860, wy = towerTop + 40;
    const pulse = 0.5 + 0.5 * Math.sin((t - tW) * 6);
    ctx.save(); ctx.globalAlpha = clamp(wk) * (0.25 + 0.35 * pulse); ctx.strokeStyle = RED; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let k = 0; k < 6; k++) { const a = -Math.PI / 2 + (k - 2.5) * 0.42, r0 = 92, r1 = 120 + 10 * pulse; ctx.beginPath(); ctx.moveTo(wx + Math.cos(a) * r0, wy - 60 + Math.sin(a) * r0); ctx.lineTo(wx + Math.cos(a) * r1, wy - 60 + Math.sin(a) * r1); ctx.stroke(); }
    ctx.restore();
    K.drawWarning(ctx, wx, wy, 0.62 * Math.min(1.05, wk), { pulse, shadow: false });
    K.drawLabel(ctx, 700, towerTop + 112, Math.min(1.05, wk), { text: P.warn || 'Warning issued', size: 26 });
  }
  // a person on the street checking a phone
  K.drawPerson(ctx, 470, GY + 4, 0.62, { t, pose: 'phone', mood: t > tW ? 'worried' : 'neutral', skin: 2, hair: 1, shirt: 3, hairStyle: 'long', seed: 4, look: 0.5 });
  // pills + quote panel
  ctx.save(); ctx.globalAlpha = 1 - smooth((t - tQ) / 0.3);
  pillStack(ctx, K, t, [{ t: tMil, y: 486, text: P.millions || 'Millions of sites', size: 38, accent: true }]);
  ctx.restore();
  const qk = K.popIn(t, tQ, 0.5);
  if (qk > 0) quotePanel(ctx, H, K, 487, 520, Math.min(1.03, qk), P.quote || 'Quote here', P.by || 'Source', ACC, t - tQ);
}
function quotePanel(ctx, H, K, x, y, s, q, by, acc, lt) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const W = 800, Hh = 150;
  H.roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 24); ctx.fillStyle = 'rgba(10,12,24,0.92)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(acc, 0.7); ctx.stroke();
  ctx.font = H.font('display', 80); ctx.fillStyle = acc; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('“', -W / 2 + 22, -Hh / 2 + 82);
  const txt = q, full = '“' + txt + '”';
  const ft = H.fitText(ctx, full, 'bold', 40, 24, W - 140);
  ctx.font = ft.font; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  // words fade in left to right (a sweeping reveal), attribution after
  const rev = H.clamp(lt / 0.9);
  ctx.save(); ctx.beginPath(); ctx.rect(-W / 2, -Hh / 2, W * rev + 40, Hh); ctx.clip();
  ctx.fillText(full, 20, -14); ctx.restore();
  ctx.globalAlpha = H.clamp((lt - 0.8) / 0.4);
  ctx.font = H.font('ui', 26); ctx.fillStyle = H.rgba('#ffffff', 0.75); ctx.fillText('— ' + by, 20, 40);
  ctx.restore();
}

// ------------------------------------------------------------------ mode: payoff
function payoff(ctx, t, info, H, K, P, D, at) {
  const { clamp, smooth, roundRect } = H;
  const ACC = info.accent;
  const tF = at(P.firstCue, D * 0.3) - 0.3, tU = at(P.updateCue, D * 0.6) - 0.3, tQ = at(P.qCue, D * 0.75) - 0.2;
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 800 }, { t: D, zoom: 1.0 }]);
  const cr = CRACKS;
  world(ctx, H, K, t, {
    acc: ACC, night: 1, cracks: cr, base: P.base, lit: 1,
    crack: () => ({ show: 1, hot: 0, ring: 0, patch: 1, acc: ACC }),
  });
  // guard robot with shield on the right, on the slab's front
  const fy = 1036;
  K.drawRobot(ctx, 870, fy, 0.9, { t, state: t > tF ? 'happy' : 'idle', flip: true, seed: 2 });
  const sk = K.popIn(t, tF, 0.45);
  if (sk > 0) K.drawShield(ctx, 838, fy - 12, 0.7 * Math.min(1.05, sk), { check: K.phase(t, tF + 0.3, tF + 0.8), shadow: false });
  if (sk > 0) K.drawLabel(ctx, 790, 832, Math.min(1.05, sk), { text: P.first || 'Found first', size: 30, accent: true });
  // a person on the street at a desk with a laptop running the update
  const sy = GY + 4;
  K.drawDesk(ctx, 300, sy, 0.85);
  K.drawPerson(ctx, 110, sy, 0.85, { t, pose: t > tU + 1.6 ? 'cheer' : 'stand', mood: 'happy', skin: 3, hair: 0, shirt: 4, hairStyle: 'short', seed: 7, look: 0.8 });
  const LS = 0.95, lx = 305, ly = sy - 94;
  K.drawLaptop(ctx, lx, ly, LS, { t, screen: 'blank', shadow: false });
  // screen overlay (laptop-local coordinates): label + progress bar + check
  const prog = clamp((t - tU) / 1.5);
  ctx.save(); ctx.translate(lx, ly); ctx.scale(LS, LS);
  roundRect(ctx, -102, -141, 204, 120, 6); ctx.save(); ctx.clip();
  ctx.fillStyle = '#0e1226'; ctx.fillRect(-102, -141, 204, 120);
  ctx.font = H.font('bold', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(P.update || 'Update', 0, -114);
  roundRect(ctx, -80, -86, 160, 24, 12); ctx.fillStyle = '#2a2f52'; ctx.fill();
  if (prog > 0) { roundRect(ctx, -80, -86, Math.max(24, 160 * prog), 24, 12); ctx.fillStyle = ACC; ctx.fill(); }
  ctx.font = H.font('ui', 24); ctx.fillStyle = H.rgba('#ffffff', 0.85); ctx.fillText(prog >= 1 ? 'Done' : Math.round(prog * 100) + '%', 0, -44);
  ctx.restore(); ctx.restore();
  if (prog >= 1) K.drawStamp(ctx, lx + 118, ly - 96, 0.4, { kind: 'check', text: '', land: (t - tU - 1.5) / 0.4 });
  // question card
  const qk = K.popIn(t, tQ, 0.5);
  if (qk > 0) {
    const lines = String(P.question || 'Question?').split('|');
    ctx.save(); ctx.translate(487, 452); ctx.scale(Math.min(1.04, qk), Math.min(1.04, qk)); ctx.rotate(Math.sin(t * 2) * 0.01);
    roundRect(ctx, -420, -86, 840, 172, 28); ctx.fillStyle = 'rgba(10,12,24,0.9)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = H.rgba(ACC, 0.8); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach((ln, i) => {
      const ft = H.fitText(ctx, ln.trim().toUpperCase(), 'display', 56, 30, 760);
      ctx.font = ft.font; ctx.fillStyle = i === lines.length - 1 ? ACC : '#ffffff';
      ctx.fillText(ln.trim().toUpperCase(), 0, (i - (lines.length - 1) / 2) * 66 + 2);
    });
    ctx.restore();
  }
}
