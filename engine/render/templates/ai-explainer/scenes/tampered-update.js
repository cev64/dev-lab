// Scene "tampered-update" (full frame). A tampered look-alike software package in an add-on store, and what it does
// on a developer's laptop. Generic cartoons only: packages are plain boxes with a text label (no logos), the attacker
// is a hooded silhouette, the store keeper and the developer are kit people. Metaphor only, no technical steps.
// Fits: supply-chain / tampered update / fake extension / poisoned package stories, "auto-update pulled in malware",
// "store pulled the add-on", "uninstalling may not be enough".
// modes (cues are narration words, "word#n" = the (n+1)th time in the scene; without them fractions of the scene):
//   hook    (cold open, 1 beat) night desk: a package with a hidden little door rides an "update" arc into a big
//           laptop, the screen flips red, the door on screen creaks open, the developer recoils; small laptops in the
//           back light red one by one; a count pill. params: pkg, update, count (text, default "Thousands of users")
//   swap    store interior: shelf of add-on boxes; a hooded figure sneaks in and swaps the official box for a
//           look-alike with a hidden door (tamper pill), slips out; store sign glows; a shopper walks off; then a
//           verbatim quote panel over the lower shelf. params: pkg, store, tamper, quote, by; cues: swapCue, tamperCue,
//           storeCue, quoteCue
//   spread  the look-alike on a pedestal sends copies to a 3x3 grid of laptops that turn red; a clock races with an
//           hours pill + window line; a counter counts up; update arrows spin on every laptop.
//           params: pkg, hours, when, count (a number, default 1000), countLabel, by, auto; cues: hoursCue, countCue, autoCue
//   inside  big laptop: attribution pill; a "details" card is gathered from the screen and flies to a dark server
//           with the hooded figure; a hidden door on the laptop tries to open, little cartoon bugs crawl on its hinge
//           and it jams (chain + pill). params: by, details, attacker, door, jam; cues: byCue, detailsCue, sentCue,
//           doorCue, jamCue
//   pull    store again: the keeper pulls the look-alike into a bin, a shutter rolls down (CLOSED) with a check pill
//           and rolls up; then a desk scene: the box is dragged off the laptop into a trash can but the little door
//           stays (warning pill); envelopes fly to people (contact pill).
//           params: pkg, store, closed, check, warn, warnBy, contact; cues: pullCue, shutCue, warnCue, contactCue
// Ends settled in every mode.

const RED = '#ff6b5e';

function hooded(ctx, H, K, x, y, s, o = {}) {
  const t = o.t || 0, walk = !!o.walk;
  const ph = t * 1.8 * Math.PI * 2, bob = walk ? -Math.abs(Math.sin(ph)) * 5 : Math.sin(t * 1.5) * 1.5;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  K.shadow(ctx, 0, 0, 110);
  const cloak = '#343a5a', cloakS = '#252a44';
  for (const side of [-1, 1]) {
    const a = walk ? Math.sin(ph + (side > 0 ? Math.PI : 0)) * 0.35 : 0;
    ctx.save(); ctx.translate(side * 14, -70 + bob); ctx.rotate(a);
    H.roundRect(ctx, -9, 0, 18, 66, 8); ctx.fillStyle = '#14162a'; ctx.fill();
    H.roundRect(ctx, -12, 58, 30, 14, 7); ctx.fillStyle = '#0c0d18'; ctx.fill();
    ctx.restore();
  }
  ctx.translate(0, bob);
  ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -62); ctx.lineTo(54, -62); ctx.quadraticCurveTo(58, -110, 34, -178); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = cloakS; ctx.fillRect(18, -190, 60, 140); ctx.restore();
  const r = o.reach || 0;
  ctx.strokeStyle = cloak; ctx.lineWidth = 17; ctx.lineCap = 'round';
  const hx = 48 + r * 60, hy = -122 - r * 70;
  ctx.beginPath(); ctx.moveTo(26, -160); ctx.lineTo(40 + r * 30, -140 - r * 40); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.fillStyle = '#14162a'; ctx.beginPath(); ctx.arc(hx, hy, 10, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -62); ctx.stroke(); ctx.restore();
  ctx.beginPath(); ctx.moveTo(0, -262); ctx.quadraticCurveTo(46, -250, 44, -200); ctx.quadraticCurveTo(42, -170, 0, -168); ctx.quadraticCurveTo(-42, -170, -44, -200); ctx.quadraticCurveTo(-46, -244, 0, -262); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(4, -204, 26, 25, 0, 0, Math.PI * 2); ctx.fillStyle = '#07080f'; ctx.fill();
  const blink = (t % 3.1) < 0.12 ? 0.2 : 1;
  ctx.fillStyle = o.eye || '#ffe14a';
  for (const ex of [-6, 14]) { ctx.beginPath(); ctx.ellipse(ex, -206, 5, 4 * blink, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  return { hand: [x + (o.flip ? -1 : 1) * hx * s, y + (hy + bob) * s] };
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const TAU = Math.PI * 2;
  const mode = P.mode || 'swap';
  const at = (w, d) => {
    if (w == null || w === '') return d;
    if (typeof w === 'number') return w;
    const m = String(w).match(/^(.*)#(\d+)$/);
    const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? d : v;
  };
  const pkgName = P.pkg || 'Add-on';

  // ------------------------------------------------------------------ helpers
  function txt(str, x, y, kind, size, color, align = 'center') {
    ctx.font = H.font(kind, size); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
  }
  function pill(text, x, y, a, o = {}) {
    if (t < a) return;
    const out = o.until != null ? K.fadeOut(t, o.until, 0.35) : 1;
    if (out <= 0) return;
    ctx.save(); ctx.globalAlpha = out;
    K.drawLabel(ctx, x, y, K.popIn(t, a, 0.4), { text, size: o.size || 28, dot: !!o.dot, accent: !!o.accent });
    ctx.restore();
  }
  function redPill(text, x, y, a, size = 28) {
    if (t < a) return;
    const k = K.popIn(t, a, 0.4);
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.font = H.font('ui', size);
    const w = ctx.measureText(text).width + size * 2.2, h = size * 1.75;
    roundRect(ctx, -w / 2, -h, w, h, h / 2); ctx.fillStyle = '#5a1d22'; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = RED; roundRect(ctx, -w / 2, -h, w, h, h / 2); ctx.stroke();
    ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(-w / 2 + size * 0.85, -h / 2, size * 0.22, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, -w / 2 + size * 1.35, -h / 2 + 1);
    ctx.restore();
  }
  // a package box anchored bottom-centre, ~170x140 at s=1. o: official (check badge), tampered (small door + glint),
  // door 0..1 (door opens, red glow), label, alpha, glint
  function pkgBox(x, y, s, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.shadow !== false) K.shadow(ctx, 0, 0, 210, 0.3);
    const W = 210, Hh = 140;
    // body
    roundRect(ctx, -W / 2, -Hh, W, Hh, 14); ctx.fillStyle = '#e9b866'; ctx.fill();
    ctx.save(); roundRect(ctx, -W / 2, -Hh, W, Hh, 14); ctx.clip();
    ctx.fillStyle = '#d29e4c'; ctx.fillRect(W * 0.18, -Hh, W * 0.4, Hh);
    ctx.fillStyle = '#c48f40'; ctx.fillRect(-W / 2, -Hh, W, 30);
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(-W / 2, -Hh + 30, W, 6);
    ctx.restore();
    // tape
    ctx.fillStyle = 'rgba(255,240,200,0.55)'; ctx.fillRect(-14, -Hh, 28, 30);
    // label strip
    roundRect(ctx, -W / 2 + 12, -Hh + 46, W - 24, 46, 10); ctx.fillStyle = '#f6f2e8'; ctx.fill();
    const f = H.fitText(ctx, o.label || pkgName, 'bold', 32, 18, W - 36);
    ctx.font = f.font; ctx.fillStyle = '#1b1f33'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, -Hh + 70);
    if (o.official) {
      ctx.beginPath(); ctx.arc(W / 2 - 18, -Hh + 14, 22, 0, TAU); ctx.fillStyle = '#3fbf7f'; ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(W / 2 - 28, -Hh + 14); ctx.lineTo(W / 2 - 20, -Hh + 22); ctx.lineTo(W / 2 - 6, -Hh + 5); ctx.stroke();
    }
    if (o.tampered) {
      // the hidden little door at the lower right of the box
      const dx = 66, dy = -10, dw = 36, dh = 36;
      const op = clamp(o.door || 0);
      if (op > 0) K.glow(ctx, dx, dy - dh / 2, 70, RED, 0.6 * op);
      roundRect(ctx, dx - dw / 2, dy - dh, dw, dh, 4); ctx.fillStyle = op > 0 ? H.mixHex('#3a1418', RED, 0.6 * op) : '#b98236'; ctx.fill();
      // door leaf swings (narrows)
      const leaf = dw * (1 - 0.8 * op);
      roundRect(ctx, dx - dw / 2, dy - dh, leaf, dh, 4); ctx.fillStyle = '#9c6a2a'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = '#6e4a1c'; roundRect(ctx, dx - dw / 2, dy - dh, dw, dh, 4); ctx.stroke();
      ctx.fillStyle = '#3a2a10'; ctx.beginPath(); ctx.arc(dx - dw / 2 + leaf - 6, dy - dh / 2, 3, 0, TAU); ctx.fill();
      if (o.glint) { const g = 0.5 + 0.5 * Math.sin(t * 6); K.glow(ctx, dx, dy - dh, 40, RED, 0.35 * g * o.glint); }
    }
    ctx.restore();
  }
  // a small laptop with a status overlay on its screen. state: 0 normal, 1 infected (red). spin: update arrow 0..1
  function miniLaptop(x, y, s, red, spin) {
    K.drawLaptop(ctx, x, y, s, { t, screen: 'code', typing: false, glow: false });
    if (red > 0) {
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      ctx.globalAlpha = clamp(red);
      roundRect(ctx, -102, -141, 204, 120, 6); ctx.fillStyle = 'rgba(150,30,40,0.78)'; ctx.fill();
      // little door on screen
      roundRect(ctx, -22, -118, 44, 74, 5); ctx.fillStyle = '#2a0c10'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = RED; roundRect(ctx, -22, -118, 44, 74, 5); ctx.stroke();
      ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(12, -80, 5, 0, TAU); ctx.fill();
      ctx.restore();
      if (red >= 1) K.glow(ctx, x, y - 80 * s, 110 * s, RED, 0.25 + 0.1 * Math.sin(t * 5 + x));
    }
    if (spin > 0) {
      ctx.save(); ctx.translate(x + 92 * s, y - 150 * s); ctx.scale(K.popIn(spin, 0, 0.35) * s, K.popIn(spin, 0, 0.35) * s);
      ctx.beginPath(); ctx.arc(0, 0, 34, 0, TAU); ctx.fillStyle = 'rgba(10,12,22,0.9)'; ctx.fill();
      ctx.rotate(spin * 5);
      ctx.strokeStyle = ACC; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, 20, 0.3, TAU - 0.9); ctx.stroke();
      ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(20, -14); ctx.lineTo(32, 2); ctx.lineTo(8, 2); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
  // big laptop screen overlay (laptop drawn at x, y, s). red 0..1, door 0..1 open, jam 0..1, bugs 0..1
  function bigScreen(x, y, s, o) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const red = clamp(o.red || 0);
    if (red > 0) {
      ctx.save(); roundRect(ctx, -102, -141, 204, 120, 6); ctx.clip();
      ctx.globalAlpha = red; ctx.fillStyle = 'rgba(140,24,36,0.85)'; ctx.fillRect(-102, -141, 204, 120);
      // scan lines
      for (let i = 0; i < 6; i++) { ctx.fillStyle = 'rgba(255,107,94,0.18)'; ctx.fillRect(-102, -141 + ((i * 22 + t * 40) % 120), 204, 4); }
      ctx.restore();
    }
    if (o.door != null && o.doorShow > 0) {
      ctx.save(); ctx.globalAlpha = clamp(o.doorShow);
      const op = clamp(o.door), jx = (o.rattle || 0);
      const dx = 0 + jx, top = -128, dw = 50, dh = 92;
      K.glow(ctx, dx, top + dh / 2, 80, RED, 0.5 * op);
      roundRect(ctx, dx - dw / 2, top, dw, dh, 5); ctx.fillStyle = H.mixHex('#200a0e', RED, 0.55 * op); ctx.fill();
      const leaf = dw * (1 - 0.75 * op);
      roundRect(ctx, dx - dw / 2, top, leaf, dh, 5); ctx.fillStyle = '#5a2a30'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = RED; roundRect(ctx, dx - dw / 2, top, dw, dh, 5); ctx.stroke();
      ctx.fillStyle = '#ffb0a8'; ctx.beginPath(); ctx.arc(dx - dw / 2 + leaf - 8, top + dh / 2, 4, 0, TAU); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  // cartoon bug (insect) at x, y, size r, heading a
  function bug(x, y, r, a, k) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(k, k);
    ctx.strokeStyle = '#1a1c2a'; ctx.lineWidth = r * 0.16; ctx.lineCap = 'round';
    for (const sd of [-1, 1]) for (let i = -1; i <= 1; i++) {
      const w = Math.sin(t * 22 + i + sd) * r * 0.15;
      ctx.beginPath(); ctx.moveTo(i * r * 0.35, 0); ctx.lineTo(i * r * 0.45 + w, sd * r * 0.85); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(0, 0, r * 0.75, r * 0.5, 0, 0, TAU); ctx.fillStyle = '#7ad15a'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-r * 0.1, -r * 0.5); ctx.lineTo(-r * 0.1, r * 0.5); ctx.strokeStyle = '#3e7a2a'; ctx.lineWidth = r * 0.1; ctx.stroke();
    ctx.beginPath(); ctx.arc(r * 0.75, 0, r * 0.32, 0, TAU); ctx.fillStyle = '#2a3a22'; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(r * 0.85, -r * 0.12, r * 0.1, 0, TAU); ctx.arc(r * 0.85, r * 0.12, r * 0.1, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // store interior: wall, sign board, two shelves. Layout kept inside x 120-860, y 450-1000 (the template zooms
  // full scenes ~1.1-1.15x around (487, 500), so this lands inside the safe box and under the docked header).
  function store(o = {}) {
    K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 1000, wall: '#2a2f55', wallS: '#232848' });
    const glowK = o.signGlow || 0;
    roundRect(ctx, 170, 458, 640, 78, 18); ctx.fillStyle = '#141830'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = H.mixHex('#3a4270', ACC, glowK); roundRect(ctx, 170, 458, 640, 78, 18); ctx.stroke();
    if (glowK > 0) K.glow(ctx, 490, 497, 340, ACC, 0.25 * glowK);
    const f = H.fitText(ctx, o.sign || 'ADD-ON STORE', 'display', 40, 24, 580);
    ctx.font = f.font; ctx.fillStyle = H.mixHex('#ffffff', ACC, glowK * 0.6); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 490, 499);
    for (let i = 0; i < 8; i++) { const lx = 200 + i * 83; ctx.beginPath(); ctx.arc(lx, 556 + Math.sin(i) * 4, 6, 0, TAU); ctx.fillStyle = H.mixHex('#ffd27a', ACC, (i % 3) / 3); ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 2 + i); ctx.fill(); ctx.globalAlpha = 1; }
    roundRect(ctx, 140, 730, 700, 26, 6); ctx.fillStyle = '#6b4a34'; ctx.fill();
    roundRect(ctx, 140, 900, 700, 22, 6); ctx.fillStyle = '#6b4a34'; ctx.fill();
    ctx.fillStyle = '#4e3626'; ctx.fillRect(150, 756, 18, 244); ctx.fillRect(812, 756, 18, 244);
    ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(140, 756, 700, 10); ctx.fillRect(140, 922, 700, 8);
    return { top: 730, mid: 900, slots: [270, 490, 710] };
  }
  function quotePanel(cx, cy, tq, quote, by) {
    if (t <= tq - 0.15 || !quote) return;
    const k = K.popIn(t, tq - 0.15, 0.45);
    const lines = H.wrap(ctx, '“…' + quote + '”', 'bold', 34, 660);
    const lh = 44, ph = 56 + lines.length * lh + 34;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
    roundRect(ctx, -370, -ph / 2, 740, ph, 24); ctx.fillStyle = 'rgba(10,12,22,0.95)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.75); roundRect(ctx, -370, -ph / 2, 740, ph, 24); ctx.stroke();
    const shownN = Math.floor(clamp((t - tq) / 1.5) * 999);
    let used = 0;
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('bold', 34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const y0 = -ph / 2 + 44;
    lines.forEach((ln, i) => { const n = clamp(shownN - used, 0, ln.length); used += ln.length; ctx.fillText(ln.slice(0, n), 0, y0 + i * lh); });
    ctx.fillStyle = '#b9c1d6'; ctx.font = K.font.ui(25); ctx.fillText('— ' + (by || 'Company'), 0, ph / 2 - 30);
    ctx.restore();
  }

  ctx.save();

  // ================================================================== HOOK
  if (mode === 'hook') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04 }]);
    K.world.room(ctx, { t, time: 'night', window: true, picture: false, lamp: true, plant: false, floorY: 940, wall: '#262a4a', wallS: '#1f2244' });
    // back row: small laptops on a far shelf lighting red one after another (others are being hit too)
    roundRect(ctx, 150, 700, 690, 14, 5); ctx.fillStyle = '#3a3050'; ctx.fill();
    [205, 330, 650, 775].forEach((rx, i) => { const hit = 0.45 + i * 0.3; miniLaptop(rx, 700, 0.45, K.phase(t, hit, hit + 0.25), 0); });
    // desk + big laptop
    const feet = 1015, lx = 430, ds = 1.55, ls = 1.8;
    K.drawDesk(ctx, lx, feet, ds);
    const ly = feet - 110 * ds;
    K.drawLaptop(ctx, lx, ly, ls, { t, screen: 'code', typing: 0.8 });
    const tLand = 0.85;
    bigScreen(lx, ly, ls, { red: K.phase(t, tLand, tLand + 0.3), door: K.phase(t, 1.25, 2.0), doorShow: K.phase(t, tLand + 0.1, tLand + 0.35) });
    if (t > tLand) K.glow(ctx, lx, ly - 150, 300, RED, 0.5 * K.fadeOut(t, tLand, 0.6));
    // developer: stands right of the desk, recoils
    const shocked = t > 1.3;
    K.drawPerson(ctx, 735, feet, 1.4, { t, pose: shocked ? 'shrug' : 'stand', mood: shocked ? 'shocked' : 'neutral', flip: true, look: -1, shirt: 2, hair: 1, seed: 3 });
    // the package riding the update arc into the screen (already mid-flight at frame 0)
    const arc = K.motion.bezier(150, 760, 140, 560, 300, 500, lx, ly - 120 * ls, 40);
    const u = clamp(0.3 + (t / tLand) * 0.7);
    if (t < tLand + 0.15) {
      ctx.save(); ctx.setLineDash([14, 14]); ctx.lineDashOffset = -t * 60; ctx.strokeStyle = rgba(ACC, 0.75); ctx.lineWidth = 6;
      K.motion.pathDraw(ctx, arc, u); ctx.restore();
      const p = K.motion.pathPoint(arc, u);
      const sc = lerp(1.0, 0.45, K.phase(t, tLand - 0.35, tLand + 0.1));
      pkgBox(p[0], p[1] + 70 * sc, sc, { tampered: true, door: 0.3, glint: 1, alpha: 1 - K.phase(t, tLand, tLand + 0.15), shadow: false });
    }
    pill(P.update || 'Auto-update', 250, 860, 0, { until: 1.6, accent: true, size: 28 });
    redPill(P.count || 'Thousands of users', lx, ly - 150 * ls - 14, 0.45, 32);
    ctx.restore();
    return;
  }

  // ================================================================== SWAP
  if (mode === 'swap') {
    const tSwap = at(P.swapCue, D * 0.2), tTamper = at(P.tamperCue, D * 0.25);
    const tStore = at(P.storeCue, D * 0.55), tQuote = at(P.quoteCue, D * 0.75);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tSwap + 1.5, zoom: 1.04 }, { t: tQuote - 0.3, zoom: 1.04 }, { t: tQuote + 0.5, zoom: 1.0 }, { t: D, zoom: 1.02 }]);
    const S = store({ sign: P.store || 'ADD-ON STORE', signGlow: K.phase(t, tStore - 0.1, tStore + 0.4) * (1 - 0.6 * K.phase(t, tStore + 2, tStore + 3)) });
    pkgBox(S.slots[0], S.top, 0.8, { label: 'Add-on' });
    pkgBox(S.slots[2], S.top, 0.8, { label: 'Add-on' });
    pkgBox(S.slots[0], S.mid, 0.75, { label: 'Add-on' });
    pkgBox(S.slots[2], S.mid, 0.75, { label: 'Add-on' });
    // the hooded figure: walks in, swaps at tSwap, walks out
    const inEnd = tSwap - 0.1, outStart = tSwap + 1.6;
    const fxIn = lerp(-120, 340, K.phase(t, Math.max(0, inEnd - 2.2), inEnd));
    const fx = t < outStart ? fxIn : lerp(340, -170, K.phase(t, outStart, outStart + 2.4));
    const walking = (t < inEnd && t > inEnd - 2.2) || (t > outStart && t < outStart + 2.4);
    const reach = K.phase(t, tSwap - 0.15, tSwap + 0.25) * (1 - K.phase(t, tSwap + 1.1, tSwap + 1.5));
    const lift = K.phase(t, tSwap, tSwap + 0.5), drop = K.phase(t, tSwap + 0.5, tSwap + 1.0);
    if (t < tSwap + 0.5) pkgBox(S.slots[1] - lift * 120, S.top - lift * 60, 1.05, { official: true, alpha: 1 - lift });
    if (t > tSwap + 0.4) {
      const dy = (1 - H.easeOutCubic(drop)) * -50;
      pkgBox(S.slots[1], S.top + dy, 1.05, { tampered: true, door: 0.35 * (0.5 + 0.5 * Math.sin(t * 2.5)) * K.phase(t, tTamper, tTamper + 0.4), glint: 1, alpha: clamp(drop * 2) });
    }
    hooded(ctx, H, K, fx, 1010, 1.3, { t, walk: walking, reach, flip: t > outStart, eye: ACC });
    const leave = K.phase(t, tQuote - 2.2, tQuote - 0.2, (k) => k);
    if (leave < 1) K.drawPerson(ctx, lerp(720, 1180, leave), 1010, 1.25, { t, pose: 'stand', walk: leave > 0 && leave < 1 ? t : null, mood: t > tSwap + 1 ? 'worried' : 'neutral', flip: leave <= 0, look: leave > 0 ? 0 : -0.6, shirt: 3, hair: 2, hairStyle: 'long', seed: 5 });
    // tamper pill under the swapped box (the middle of the lower shelf is left empty for it)
    redPill(P.tamper || 'Tampered copy', S.slots[1], 820, Math.max(tTamper, tSwap + 0.8), 28);
    // quote panel over the lower shelf (the swapped box stays visible above it)
    quotePanel(487, 900, tQuote, P.quote, P.by);
    ctx.restore();
    return;
  }

  // ================================================================== SPREAD
  if (mode === 'spread') {
    const tHours = at(P.hoursCue, D * 0.12), tCount = at(P.countCue, D * 0.5), tAuto = at(P.autoCue, D * 0.8);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03 }]);
    K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 1000, wall: '#262a4a', wallS: '#1f2244' });
    // clock (top left) + hours pill
    const bx = 245;
    K.drawClock(ctx, bx, 735, 1.0, { t, speed: t > tHours ? 3.2 : 0.4, hour: 2.4 });
    pill(P.hours || 'For hours', 290, 560, tHours - 0.1, { accent: true, size: 30 });
    // pedestal + look-alike box (left)
    roundRect(ctx, bx - 85, 900, 170, 105, 12); ctx.fillStyle = '#3a4270'; ctx.fill();
    roundRect(ctx, bx - 100, 886, 200, 22, 8); ctx.fillStyle = '#4a5488'; ctx.fill();
    pkgBox(bx, 888, 0.85, { tampered: true, door: 0.6 + 0.2 * Math.sin(t * 3), glint: 1 });
    // grid of laptops (right)
    const cols = [480, 615, 750], rows = [770, 895, 1020];
    const cells = [];
    rows.forEach((ry, r) => cols.forEach((cx, c) => cells.push([cx, ry, r * 3 + c])));
    const order = [4, 0, 8, 2, 6, 1, 7, 3, 5];
    const span0 = 0.3, span1 = Math.max(span0 + 2, tCount + 0.6);
    cells.forEach(([cx, ry, i]) => {
      const k = order.indexOf(i), hit = span0 + (span1 - span0) * (k / 8) + 0.55;
      const spinStart = tAuto + k * 0.08;
      miniLaptop(cx, ry, 0.52, K.phase(t, hit, hit + 0.25), t > spinStart ? t - spinStart : 0);
    });
    cells.forEach(([cx, ry, i]) => {
      const k = order.indexOf(i), t0 = span0 + (span1 - span0) * (k / 8), u = (t - t0) / 0.55;
      if (u <= 0 || u >= 1) return;
      const pts = K.motion.bezier(bx + 30, 760, bx + 120, 640, cx - 80, ry - 230, cx, ry - 80, 24);
      ctx.save(); ctx.strokeStyle = rgba(RED, 0.45); ctx.lineWidth = 4; ctx.setLineDash([10, 10]); K.motion.pathDraw(ctx, pts, u); ctx.restore();
      const p = K.motion.pathPoint(pts, H.easeInOutCubic(u));
      pkgBox(p[0], p[1] + 25, 0.3, { tampered: true, shadow: false });
    });
    // counter panel (top right)
    if (t > tCount - 0.4) {
      const k = K.popIn(t, tCount - 0.4, 0.4);
      ctx.save(); ctx.translate(615, 545); ctx.scale(k, k);
      roundRect(ctx, -185, -78, 370, 156, 22); ctx.fillStyle = 'rgba(10,12,22,0.93)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = RED; roundRect(ctx, -185, -78, 370, 156, 22); ctx.stroke();
      const n = K.countUp(+P.count || 1000, t, tCount - 0.3, 1.0);
      txt(n.toLocaleString('en-US'), 0, -26, 'display', 62, '#ffffff');
      txt(P.countLabel || 'users affected', 0, 26, 'ui', 26, '#ffb0a8');
      if (P.by) txt(P.by, 0, 58, 'ui', 22, '#b9c1d6');
      ctx.restore();
    }
    pill(P.auto || 'Auto-update', 615, 690, tAuto, { accent: true, size: 26 });
    ctx.restore();
    return;
  }

  // ================================================================== INSIDE
  if (mode === 'inside') {
    const tBy = at(P.byCue, D * 0.1), tDet = at(P.detailsCue, D * 0.22), tSent = at(P.sentCue, D * 0.4);
    const tDoor = at(P.doorCue, D * 0.6), tJam = at(P.jamCue, D * 0.8);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03 }]);
    K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true, plant: false, floorY: 940, wall: '#262a4a', wallS: '#1f2244' });
    const feet = 1015, lx = 320, ds = 1.45, ls = 1.7, ly = feet - 110 * ds;
    K.drawDesk(ctx, lx, feet, ds);
    K.drawLaptop(ctx, lx, ly, ls, { t, screen: 'code', typing: 0.4 });
    const show = K.phase(t, tDoor - 0.2, tDoor + 0.2);
    const tryOpen = K.phase(t, tDoor + 0.1, tDoor + 0.9) * (1 - 0.85 * K.phase(t, tJam - 0.1, tJam + 0.3));
    const rattle = t > tJam - 0.1 ? K.shake(t, tJam - 0.1, 1.4, 4, 40) : 0;
    bigScreen(lx, ly, ls, { red: 0.55 * K.phase(t, tDet - 0.2, tDet + 0.4), door: tryOpen * 0.55, doorShow: show, rattle });
    // the attacker's server + hooded figure (right)
    const sx = 690;
    K.drawServerRack(ctx, sx, feet - 5, 1.05, { t, activity: t > tSent ? 0.9 : 0.3 });
    hooded(ctx, H, K, 790, feet + 5, 0.95, { t, flip: true, eye: RED });
    pill(P.attacker || "Attacker's server", 715, 735, tSent + 0.3, { size: 24 });
    // details card: pops out of the screen, then flies to the server
    if (t > tDet - 0.1) {
      const g = K.popIn(t, tDet - 0.1, 0.5);
      const fly = K.phase(t, tSent, tSent + 1.1);
      const pts = K.motion.bezier(lx, 560, lx + 180, 470, sx - 120, 520, sx, 800, 30);
      const p = fly > 0 ? K.motion.pathPoint(pts, fly) : [lx, 560];
      if (fly > 0 && fly < 1) { ctx.save(); ctx.setLineDash([12, 12]); ctx.lineDashOffset = -t * 50; ctx.strokeStyle = rgba(RED, 0.6); ctx.lineWidth = 5; K.motion.pathDraw(ctx, pts, fly); ctx.restore(); }
      const sc = g * lerp(0.9, 0.3, fly);
      const alpha = 1 - K.phase(t, tSent + 0.95, tSent + 1.15);
      if (alpha > 0) {
        ctx.save(); ctx.globalAlpha = alpha; ctx.translate(p[0], p[1]); ctx.scale(sc, sc);
        roundRect(ctx, -170, -62, 340, 124, 16); ctx.fillStyle = '#f2f4fa'; ctx.fill();
        ctx.fillStyle = '#6f86e0'; roundRect(ctx, -152, -44, 72, 88, 10); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-116, -14, 16, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(-116, 30, 25, 15, 0, Math.PI, 0); ctx.fill();
        const f = H.fitText(ctx, P.details || 'Computer details', 'bold', 32, 22, 220);
        ctx.font = f.font; ctx.fillStyle = '#1b1f33'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, -66, -18);
        for (let i = 0; i < 2; i++) { const w = [190, 140][i], vis = clamp((t - tDet - 0.2 - i * 0.25) / 0.3); ctx.fillStyle = '#b9c1d6'; roundRect(ctx, -66, 12 + i * 22, w * vis, 11, 5); ctx.fill(); }
        ctx.restore();
      }
      if (fly >= 1) K.glow(ctx, sx, feet - 140, 160, RED, 0.35 * K.fadeOut(t, tSent + 1.1, 0.8));
    }
    // dashed tunnel trying to reach the server from the door; snaps on jam
    if (t > tDoor + 0.3) {
      const pts = [[lx + 40, ly - 90 * ls], [lx + 210, ly - 250], [sx - 60, ly - 170]];
      const prog = K.phase(t, tDoor + 0.3, tDoor + 1.6), snap = K.phase(t, tJam, tJam + 0.3);
      ctx.save(); ctx.setLineDash([8, 12]); ctx.strokeStyle = rgba(RED, 0.75 * (1 - snap)); ctx.lineWidth = 5; K.motion.pathDraw(ctx, pts, prog * (1 - 0.6 * snap)); ctx.restore();
    }
    // bugs crawl onto the door hinge, a chain + padlock: jammed
    if (t > tJam - 0.5) {
      const doorX = lx - 25 * ls, doorTop = ly - 128 * ls, doorBot = ly - 36 * ls;
      for (let i = 0; i < 3; i++) {
        const k = K.phase(t, tJam - 0.5 + i * 0.18, tJam + 0.1 + i * 0.18);
        const tx = doorX + 4, ty = lerp(doorTop + 22, doorBot - 22, i / 2);
        const bxp = lerp(lx - 230, tx, H.easeOutCubic(k)), byp = lerp(ty + 160, ty, H.easeOutCubic(k));
        bug(bxp + Math.sin(t * 9 + i) * 3, byp, 20, -0.6 + i * 0.3, K.popIn(t, tJam - 0.5 + i * 0.18, 0.3));
      }
      const ch = K.phase(t, tJam + 0.1, tJam + 0.5);
      if (ch > 0) {
        ctx.save(); ctx.strokeStyle = '#c9cfe0'; ctx.lineWidth = 7;
        K.motion.pathDraw(ctx, [[lx - 38 * ls, ly - 100 * ls], [lx + 38 * ls, ly - 64 * ls]], ch);
        K.motion.pathDraw(ctx, [[lx + 38 * ls, ly - 100 * ls], [lx - 38 * ls, ly - 64 * ls]], ch);
        ctx.restore();
        if (ch >= 1) K.drawLock(ctx, lx, ly - 48 * ls, 0.5, { open: 0 });
      }
    }
    // pills: attribution (top right), door (bottom), then jammed (bottom)
    pill(P.by || 'According to the company', 640, 525, tBy - 0.1, { dot: true, size: 26 });
    pill(P.door || 'Hidden back door', lx, 1042, tDoor + 0.1, { size: 26, until: tJam + 0.2 });
    pill(P.jam || 'Jammed on most machines', lx + 60, 1042, tJam + 0.5, { accent: true, size: 26 });
    ctx.restore();
    return;
  }

  // ================================================================== PULL
  if (mode === 'pull') {
    const tPull = at(P.pullCue, D * 0.05), tShut = at(P.shutCue, D * 0.12), tWarn = at(P.warnCue, D * 0.5), tCon = at(P.contactCue, D * 0.8);
    const tSwitch = Math.max(tShut + 2.6, tWarn - 1.8);
    const cut = K.phase(t, tSwitch, tSwitch + 0.5);
    if (cut < 1) {
      ctx.save(); ctx.globalAlpha = 1 - cut;
      K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tSwitch, zoom: 1.03 }]);
      const S = store({ sign: P.store || 'ADD-ON STORE' });
      pkgBox(S.slots[0], S.top, 0.8, { label: 'Add-on' });
      pkgBox(S.slots[2], S.top, 0.8, { label: 'Add-on' });
      pkgBox(S.slots[0], S.mid, 0.75, { label: 'Add-on' });
      pkgBox(S.slots[2], S.mid, 0.75, { label: 'Add-on' });
      const take = K.phase(t, Math.max(0, tPull - 0.3), tPull + 0.5);
      const bin = [520, 1010];
      roundRect(ctx, bin[0] - 70, bin[1] - 110, 140, 110, 12); ctx.fillStyle = '#4a5070'; ctx.fill();
      roundRect(ctx, bin[0] - 82, bin[1] - 122, 164, 20, 8); ctx.fillStyle = '#5c6488'; ctx.fill();
      if (take < 1) {
        const p = [lerp(S.slots[1], bin[0], take), lerp(S.top, bin[1] - 100, take) - Math.sin(take * Math.PI) * 120];
        pkgBox(p[0], p[1], 1.05 * lerp(1, 0.6, take), { tampered: true, door: 0.4, glint: 1 });
      }
      K.drawPerson(ctx, 720, 1010, 1.3, { t, pose: t < tPull + 0.6 ? 'point' : 'stand', mood: 'worried', flip: true, look: -0.8, shirt: 1, hair: 3, hairStyle: 'bun', seed: 8 });
      // shutter rolls down over the shelves, then back up
      const down = K.phase(t, tShut, tShut + 0.6) * (1 - K.phase(t, tSwitch - 0.9, tSwitch - 0.2));
      if (take >= 1 && down < 0.3) K.drawStamp(ctx, bin[0], bin[1] - 20, 0.5, { kind: 'cross', text: 'PULLED', land: (t - tPull - 0.5) / 0.5 });
      if (down > 0) {
        const bottom = lerp(560, 1000, down);
        ctx.save(); ctx.beginPath(); ctx.rect(130, 560, 720, bottom - 560); ctx.clip();
        ctx.fillStyle = '#8a92b0'; ctx.fillRect(130, 560, 720, 450);
        for (let y = 560; y < 1010; y += 28) { ctx.fillStyle = '#6d7594'; ctx.fillRect(130, y, 720, 6); }
        ctx.restore();
        roundRect(ctx, 124, bottom - 14, 732, 22, 6); ctx.fillStyle = '#5a6080'; ctx.fill();
        if (down > 0.8) {
          const k = K.popIn(t, tShut + 0.5, 0.4);
          ctx.save(); ctx.translate(490, 740); ctx.rotate(-0.06); ctx.scale(k, k);
          roundRect(ctx, -190, -60, 380, 120, 16); ctx.fillStyle = '#c63d3a'; ctx.fill();
          txt(P.closed || 'CLOSED', 0, 4, 'display', 72, '#ffffff');
          ctx.restore();
          pill(P.check || 'Checking every add-on', 490, 900, tShut + 0.7, { dot: true, size: 28 });
        }
      }
      ctx.restore();
    }
    if (cut > 0) {
      ctx.save(); ctx.globalAlpha = cut;
      K.camera(ctx, t, [{ t: tSwitch, zoom: 1.0 }, { t: D, zoom: 1.03 }]);
      K.world.room(ctx, { t, time: 'night', window: true, picture: false, lamp: false, plant: false, floorY: 940, wall: '#262a4a', wallS: '#1f2244' });
      const feet = 1015, lx = 310, ds = 1.4, ls = 1.6, ly = feet - 110 * ds;
      K.drawDesk(ctx, lx, feet, ds);
      K.drawLaptop(ctx, lx, ly, ls, { t, screen: 'code', typing: 0.3 });
      bigScreen(lx, ly, ls, { red: 0.35, door: 0.4 + 0.1 * Math.sin(t * 3), doorShow: 1 });
      const tDrag = tSwitch + 0.4, drag = K.phase(t, tDrag, tDrag + 1.0);
      const trash = [540, 1010];
      roundRect(ctx, trash[0] - 46, trash[1] - 100, 92, 100, 10); ctx.fillStyle = '#4a5070'; ctx.fill();
      roundRect(ctx, trash[0] - 56, trash[1] - 112, 112, 18, 8); ctx.fillStyle = '#5c6488'; ctx.fill();
      if (drag < 1) {
        const p = [lerp(lx + 80, trash[0], drag), lerp(ly - 200, trash[1] - 95, drag) - Math.sin(drag * Math.PI) * 110];
        pkgBox(p[0], p[1], lerp(0.6, 0.4, drag), { tampered: true, shadow: false });
      }
      pill('Uninstalled', trash[0], trash[1] - 125, tDrag + 1.0, { size: 22 });
      if (t > tWarn - 0.2) {
        const pulse = 0.5 + 0.5 * Math.sin((t - tWarn) * 6);
        K.glow(ctx, lx, ly - 80 * ls, 150, RED, 0.4 * pulse);
      }
      quoteWarn();
      const people = [[665, 0], [790, 1]];
      people.forEach(([px, i]) => K.drawPerson(ctx, px, 1010, 1.1, { t, pose: t > tCon + 0.9 + i * 0.2 ? 'phone' : 'stand', mood: 'neutral', flip: true, look: -0.5, shirt: 3 + i, hair: i, hairStyle: i ? 'long' : 'short', seed: 11 + i }));
      people.forEach(([px, i]) => {
        const u = K.phase(t, tCon + i * 0.25, tCon + 0.8 + i * 0.25);
        if (u <= 0 || u >= 1) return;
        const x = lerp(487, px, u), y = lerp(640, 760, u) - Math.sin(u * Math.PI) * 80;
        ctx.save(); ctx.translate(x, y); ctx.rotate(-0.15);
        roundRect(ctx, -34, -22, 68, 44, 6); ctx.fillStyle = '#f2f4fa'; ctx.fill();
        ctx.strokeStyle = '#9aa3bf'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-34, -20); ctx.lineTo(0, 6); ctx.lineTo(34, -20); ctx.stroke();
        ctx.restore();
      });
      pill(P.contact || 'Contacting affected users', 680, 720, tCon + 0.2, { accent: true, size: 24 });
      ctx.restore();
    }
    ctx.restore();
    return;

    function quoteWarn() {
      if (t <= tWarn - 0.1) return;
      const k = K.popIn(t, tWarn - 0.1, 0.45);
      ctx.save(); ctx.translate(487, 560); ctx.scale(k, k);
      roundRect(ctx, -360, -72, 720, 144, 22); ctx.fillStyle = 'rgba(10,12,22,0.94)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = RED; roundRect(ctx, -360, -72, 720, 144, 22); ctx.stroke();
      const f = H.fitText(ctx, P.warn || 'Uninstalling may not be enough', 'bold', 40, 26, 660);
      ctx.font = f.font; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, -16);
      txt('— ' + (P.warnBy || 'the company'), 0, 38, 'ui', 26, '#b9c1d6');
      ctx.restore();
    }
  }
  ctx.restore();
}
