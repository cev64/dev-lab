// Scene "closet-build" (full frame). A cosy dusk bedroom: a big generic phone shows a 3x3 grid of old photo posts
// (each tile a coloured snapshot with a garment in it); the tiles lift off the screen, arc across and turn into real
// clothes on hangers in a wardrobe that assembles itself (side panels slide in, the rail drops, the doors swing open).
// No app logos: the phone header is plain text.
// modes:
//   cold  - cold open: tiles already flying at frame 0, wardrobe assembling, all six hangers full by ~2 s, then a
//           name pill pops over the wardrobe. Ends settled.
//   build - the long beat: "Connect ..." button on the phone is tapped (ripple) and the grid fills; tiles fly into an
//           empty wardrobe on flyCue; on snapCue the phone becomes a camera, flash, a jacket joins; on mixCue the
//           phone slides away and three outfit cards (top + bottom) fill from the hangers with ticks + a pill.
// Fits: any "your photos / posts become data / a catalogue" story (wardrobe apps, photo-to-inventory features).
// params: mode, app ("AI app"), connect ("Connect account"), outfitLabel, header ("Your posts"),
//   cues: connectCue, flyCue, snapCue, mixCue
const GARMENTS = [
  { kind: 'tee', c: '#e8786a' }, { kind: 'dress', c: '#a08be0' }, { kind: 'pants', c: '#4f6fb8' },
  { kind: 'hoodie', c: '#4fb3a6' }, { kind: 'skirt', c: '#f2b84b' }, { kind: 'shirt', c: '#eef1f8' },
];
const JACKET = { kind: 'jacket', c: '#c0703c' };

function mix(a, b, k) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const r = Math.round(((pa >> 16) & 255) * (1 - k) + ((pb >> 16) & 255) * k);
  const g = Math.round(((pa >> 8) & 255) * (1 - k) + ((pb >> 8) & 255) * k);
  const bl = Math.round((pa & 255) * (1 - k) + (pb & 255) * k);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1);
}

// a garment hanging from its hook at (0, 0), ~110 wide, ~190 tall at s = 1
export function drawGarment(ctx, H, g, x, y, s, hanger = true) {
  const { roundRect } = H, c = g.c, sh = mix(c, '#101020', 0.25), li = mix(c, '#ffffff', 0.25);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (hanger) {
    ctx.strokeStyle = '#c9cfdd'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -6, 8, Math.PI, Math.PI * 2.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(-50, 26); ctx.lineTo(50, 26); ctx.closePath(); ctx.stroke();
  }
  ctx.translate(0, 22);
  const fill = (fn, col) => { ctx.beginPath(); fn(); ctx.fillStyle = col; ctx.fill(); };
  const k = g.kind;
  if (k === 'tee' || k === 'shirt' || k === 'hoodie' || k === 'jacket') {
    const long = k !== 'tee', L = k === 'jacket' ? 150 : 128;
    fill(() => { // body + sleeves
      ctx.moveTo(-26, 0); ctx.lineTo(-56, 12); ctx.lineTo(long ? -64 : -66, long ? 108 : 46); ctx.lineTo(long ? -48 : -46, long ? 110 : 54);
      ctx.lineTo(-40, 36); ctx.lineTo(-40, L); ctx.lineTo(40, L); ctx.lineTo(40, 36); ctx.lineTo(long ? 48 : 46, long ? 110 : 54);
      ctx.lineTo(long ? 64 : 66, long ? 108 : 46); ctx.lineTo(56, 12); ctx.lineTo(26, 0); ctx.quadraticCurveTo(0, 14, -26, 0); ctx.closePath();
    }, c);
    ctx.save(); ctx.beginPath(); ctx.rect(14, 0, 60, L + 2); ctx.clip();
    fill(() => { ctx.moveTo(26, 0); ctx.lineTo(56, 12); ctx.lineTo(66, 108); ctx.lineTo(40, L); ctx.lineTo(14, L); ctx.lineTo(14, 0); ctx.closePath(); }, sh);
    ctx.restore();
    if (k === 'shirt') { ctx.fillStyle = '#b9c1d6'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(0, 26 + i * 26, 3.5, 0, 7); ctx.fill(); } fill(() => { ctx.moveTo(-26, 0); ctx.lineTo(-6, 22); ctx.lineTo(-14, 2); ctx.closePath(); }, '#d5dae8'); fill(() => { ctx.moveTo(26, 0); ctx.lineTo(6, 22); ctx.lineTo(14, 2); ctx.closePath(); }, '#d5dae8'); }
    if (k === 'hoodie') { fill(() => { ctx.ellipse(0, 4, 30, 16, 0, 0, 7); }, sh); ctx.fillStyle = sh; roundRect(ctx, -24, 82, 48, 30, 10); ctx.fill(); }
    if (k === 'jacket') { ctx.strokeStyle = sh; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(0, L); ctx.stroke(); fill(() => { ctx.moveTo(-26, 0); ctx.lineTo(0, 44); ctx.lineTo(-20, 50); ctx.closePath(); }, li); fill(() => { ctx.moveTo(26, 0); ctx.lineTo(0, 44); ctx.lineTo(20, 50); ctx.closePath(); }, sh); }
    if (k === 'tee') { ctx.globalAlpha = 0.5; fill(() => { ctx.arc(-6, 60, 14, 0, 7); }, li); ctx.globalAlpha = 1; }
  } else if (k === 'dress') {
    fill(() => { ctx.moveTo(-20, 0); ctx.lineTo(-26, 50); ctx.lineTo(-58, 168); ctx.quadraticCurveTo(0, 180, 58, 168); ctx.lineTo(26, 50); ctx.lineTo(20, 0); ctx.quadraticCurveTo(0, 12, -20, 0); ctx.closePath(); }, c);
    ctx.save(); ctx.beginPath(); ctx.rect(10, 0, 60, 190); ctx.clip();
    fill(() => { ctx.moveTo(-20, 0); ctx.lineTo(-26, 50); ctx.lineTo(-58, 168); ctx.quadraticCurveTo(0, 180, 58, 168); ctx.lineTo(26, 50); ctx.lineTo(20, 0); ctx.closePath(); }, sh);
    ctx.restore();
    ctx.fillStyle = li; roundRect(ctx, -28, 48, 56, 9, 4); ctx.fill();
  } else if (k === 'pants') {
    fill(() => { ctx.moveTo(-36, 0); ctx.lineTo(36, 0); ctx.lineTo(42, 168); ctx.lineTo(8, 168); ctx.lineTo(0, 40); ctx.lineTo(-8, 168); ctx.lineTo(-42, 168); ctx.closePath(); }, c);
    fill(() => { ctx.moveTo(0, 40); ctx.lineTo(8, 168); ctx.lineTo(42, 168); ctx.lineTo(38, 60); ctx.closePath(); }, sh);
    ctx.fillStyle = sh; ctx.fillRect(-36, 0, 72, 10);
  } else if (k === 'skirt') {
    fill(() => { ctx.moveTo(-30, 0); ctx.lineTo(30, 0); ctx.lineTo(58, 110); ctx.quadraticCurveTo(0, 122, -58, 110); ctx.closePath(); }, c);
    ctx.strokeStyle = sh; ctx.lineWidth = 4; for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.moveTo(i * 10, 12); ctx.lineTo(i * 24, 112); ctx.stroke(); }
    ctx.fillStyle = sh; ctx.fillRect(-30, 0, 60, 10);
  }
  ctx.restore();
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, easeInOutCubic, roundRect } = H;
  const at = (w, d) => { if (!w) return d; const v = info.timeOf(w); return v == null ? d : v; };
  const mode = P.mode === 'build' ? 'build' : 'cold';
  const cold = mode === 'cold';

  // timeline
  const tConnect = cold ? -9 : at(P.connectCue, D * 0.08) - 0.1;
  const tGrid = cold ? -9 : tConnect + 0.45;
  const tFly = cold ? -0.55 : at(P.flyCue, D * 0.18) - 0.1;
  const step = cold ? 0.32 : 0.42;
  const tBuild = cold ? -0.35 : -9;                        // wardrobe assembles (cold) / already there (build)
  const tSnap = cold ? 99 : at(P.snapCue, D * 0.5) - 0.15;
  const tMix = cold ? 99 : at(P.mixCue, D * 0.68) - 0.35;
  const tPill = cold ? 2.0 : 99;

  ctx.save();
  if (cold) K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 500, y: 740 }, { t: D, zoom: 1.0 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tMix, zoom: 1.02, x: 487, y: 730 }, { t: D, zoom: 1.0 }]);
  K.world.room(ctx, { t, time: 'dusk', window: false, picture: false, lamp: false, plant: true, wall: '#3a3566', floor: '#2a2650' });
  // fairy-light string on the wall
  for (let i = 0; i < 12; i++) {
    const x = 80 + i * 80, y = 412 + Math.sin(i * 0.8) * 10;
    const on = 0.55 + 0.45 * Math.sin(t * 2.2 + i * 1.7);
    K.glow(ctx, x, y, 26, i % 3 ? '#ffd98a' : ACC, 0.25 * on);
    ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fillStyle = i % 3 ? '#ffe7b0' : ACC; ctx.fill();
  }
  // rug
  ctx.save(); ctx.translate(487, 1035); ctx.scale(1, 0.16); ctx.beginPath(); ctx.arc(0, 0, 420, 0, 7); ctx.fillStyle = '#463b78'; ctx.fill(); ctx.restore();

  // ---------------- wardrobe (right)
  const WX0 = 500, WX1 = 890, WY0 = 450, WY1 = 1012, WC = (WX0 + WX1) / 2;
  const b = (d) => H.phase(t, tBuild + d, tBuild + d + 0.45, easeOutCubic);
  const pL = b(0), pR = b(0.08), pTop = b(0.18), pRail = b(0.3), pDoor = b(0.45);
  K.shadow(ctx, WC, WY1 + 4, 460, 0.4 * pL);
  // back wall of the wardrobe
  ctx.globalAlpha = smooth(pL);
  ctx.fillStyle = '#2b2449'; roundRect(ctx, WX0 + 14, WY0 + 14, WX1 - WX0 - 28, WY1 - WY0 - 20, 10); ctx.fill();
  ctx.globalAlpha = 1;
  // side panels slide in
  ctx.fillStyle = '#b07a52'; roundRect(ctx, WX0 - (1 - pL) * 260, WY0, 22, WY1 - WY0, 8); ctx.fill();
  ctx.fillStyle = '#8f5f3d'; roundRect(ctx, WX1 - 22 + (1 - pR) * 260, WY0, 22, WY1 - WY0, 8); ctx.fill();
  // top + plinth drop in
  ctx.save(); ctx.globalAlpha = smooth(pTop * 3);
  ctx.fillStyle = '#c48b60'; roundRect(ctx, WX0 - 12, WY0 - 18 - (1 - pTop) * 300, WX1 - WX0 + 24, 30, 10); ctx.fill();
  ctx.fillStyle = '#8f5f3d'; roundRect(ctx, WX0 - 6, WY1 - 14 + (1 - pTop) * 120, WX1 - WX0 + 12, 22, 8); ctx.fill();
  ctx.restore();
  // shelf + shoes
  if (pRail > 0) {
    ctx.globalAlpha = smooth(pRail);
    ctx.fillStyle = '#b07a52'; ctx.fillRect(WX0 + 20, 905, WX1 - WX0 - 40, 12); ctx.fillRect(WX0 + 20, 790, WX1 - WX0 - 40, 12);
    // folded stacks on the middle shelf
    [['#6f86e0', '#eef1f8', '#e8786a'], ['#4fb3a6', '#f2b84b'], ['#a08be0', '#8a93a8', '#4f6fb8']].forEach((st, j) => st.forEach((c, k) => { const x = WX0 + 90 + j * 105, y = 790 - k * 26; ctx.fillStyle = c; roundRect(ctx, x - 44, y - 26, 88, 26, 8); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(x - 38, y - 12, 76, 3); }));
    for (let i = 0; i < 3; i++) { const x = WX0 + 80 + i * 115; ctx.fillStyle = ['#e8786a', '#eef1f8', '#4fb3a6'][i]; roundRect(ctx, x - 34, 960, 68, 30, 14); ctx.fill(); roundRect(ctx, x - 34, 948, 30, 30, 12); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  // rail
  const railY = 498;
  if (pRail > 0) { ctx.fillStyle = '#d9dee9'; roundRect(ctx, WX0 + 20, railY - 5 - (1 - pRail) * 40, (WX1 - WX0 - 40) * pRail, 10, 5); ctx.fill(); }
  // hangers: slot i -> x
  const allG = GARMENTS.concat(cold ? [] : [JACKET]);
  const slotX = (i) => WX0 + 72 + i * (WX1 - WX0 - 144) / (allG.length - 1);
  // which garments have landed / are flying
  const flights = [];
  GARMENTS.forEach((g, i) => flights.push({ g, i, t0: tFly + i * step, from: null }));
  if (!cold) flights.push({ g: JACKET, i: 6, t0: tSnap + 0.75, snap: true });
  // garments taken out to outfit cards later
  const OUT = [[0, 2], [3, 4], [6, 5]]; // top idx, bottom idx (6 = jacket)
  const outT = (gi) => { for (let c = 0; c < 3; c++) { const k = OUT[c].indexOf(gi); if (k >= 0) return { c, k, t0: tMix + 0.35 + c * 0.55 + k * 0.12 }; } return null; };

  // phone geometry
  const phSlide = cold ? 0 : H.phase(t, tMix, tMix + 0.6, easeInOutCubic);
  const PX = 255 - phSlide * 520, PYB = 1000, PW = 300, PHh = 560, PY0 = PYB - PHh;
  const tile = (i) => { const c = i % 3, r = (i / 3) | 0; return [PX - 129 + c * 88 + 40, PY0 + 128 + r * 88 + 40]; };

  // landed garments (behind flying ones)
  allG.forEach((g, gi) => {
    const f = flights[gi]; if (!f) return;
    const land = f.t0 + 0.75;
    if (t < land) return;
    const o = outT(gi), x = slotX(gi), sway = Math.sin((t - land) * 7) * Math.exp(-(t - land) * 3) * 0.18;
    ctx.save(); ctx.translate(x, railY - 2); ctx.rotate(sway); drawGarment(ctx, H, g, 0, 0, 0.85); ctx.restore();
  });
  // doors (open, either side)
  if (pDoor > 0) {
    const dw = 70 * pDoor;
    ctx.fillStyle = '#c48b60'; ctx.beginPath(); ctx.moveTo(WX0 - 6, WY0 + 6); ctx.lineTo(WX0 - 6 - dw, WY0 + 30); ctx.lineTo(WX0 - 6 - dw, WY1 - 34); ctx.lineTo(WX0 - 6, WY1 - 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#9b6a45'; ctx.beginPath(); ctx.moveTo(WX1 + 6, WY0 + 6); ctx.lineTo(WX1 + 6 + dw * 0.6, WY0 + 30); ctx.lineTo(WX1 + 6 + dw * 0.6, WY1 - 34); ctx.lineTo(WX1 + 6, WY1 - 10); ctx.closePath(); ctx.fill();
  }

  // ---------------- phone (left)
  if (PX > -200) {
    K.shadow(ctx, PX, PYB + 6, 300, 0.4);
    ctx.fillStyle = '#20243a'; roundRect(ctx, PX - PW / 2, PY0, PW, PHh, 44); ctx.fill();
    ctx.fillStyle = '#121527'; roundRect(ctx, PX - PW / 2 + 14, PY0 + 16, PW - 28, PHh - 32, 32); ctx.fill();
    ctx.fillStyle = '#20243a'; roundRect(ctx, PX - 40, PY0 + 24, 80, 18, 9); ctx.fill();
    const camMode = !cold && t > tSnap && t < tSnap + 1.3;
    // header (plain text)
    ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(camMode ? 'Add a piece' : (P.header || 'Your posts'), PX - 118, PY0 + 82);
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(PX + 110, PY0 + 82, 8, 0, 7); ctx.fill();
    if (camMode) {
      // camera view: a jacket on a hanger, shutter button, flash
      const k = t - tSnap;
      ctx.fillStyle = '#2b3150'; roundRect(ctx, PX - 128, PY0 + 116, 256, 330, 18); ctx.fill();
      ctx.strokeStyle = ACC; ctx.lineWidth = 4; const cx0 = PX - 100, cy0 = PY0 + 140, cw = 200, ch = 280, L = 30;
      [[cx0, cy0, 1, 1], [cx0 + cw, cy0, -1, 1], [cx0, cy0 + ch, 1, -1], [cx0 + cw, cy0 + ch, -1, -1]].forEach(([x, y, sx, sy]) => { ctx.beginPath(); ctx.moveTo(x, y + sy * L); ctx.lineTo(x, y); ctx.lineTo(x + sx * L, y); ctx.stroke(); });
      if (k < 0.75) drawGarment(ctx, H, JACKET, PX, PY0 + 170, 0.95);
      ctx.beginPath(); ctx.arc(PX, PY0 + 498, 30, 0, 7); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.beginPath(); ctx.arc(PX, PY0 + 498, 22 - 6 * Math.max(0, 1 - Math.abs(k - 0.45) / 0.15), 0, 7); ctx.fillStyle = '#d5dae8'; ctx.fill();
      const fl = Math.max(0, 1 - Math.abs(k - 0.55) / 0.18);
      if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${0.85 * fl})`; roundRect(ctx, PX - PW / 2 + 14, PY0 + 16, PW - 28, PHh - 32, 32); ctx.fill(); }
    } else {
      // connect button (build mode, before the grid)
      if (!cold && t < tGrid + 0.3) {
        const bp = K.popIn(t, 0.1, 0.4), tap = clamp((t - tConnect) / 0.4);
        ctx.save(); ctx.translate(PX, PY0 + 290); ctx.scale(bp * (1 - 0.08 * Math.sin(Math.PI * tap)), bp * (1 - 0.08 * Math.sin(Math.PI * tap)));
        ctx.globalAlpha = 1 - clamp((t - tGrid) / 0.3);
        ctx.font = H.font('ui', 25); const txt = P.connect || 'Connect account';
        const w = Math.min(250, ctx.measureText(txt).width + 40);
        roundRect(ctx, -w / 2 - 6, -36, w + 12, 72, 36); ctx.fillStyle = ACC; ctx.fill();
        ctx.fillStyle = K.ACCENT.deep; ctx.textAlign = 'center'; ctx.font = H.font('ui', H.fitText(ctx, txt, 'ui', 25, 18, w).size); ctx.fillText(txt, 0, 2);
        if (tap > 0 && tap < 1) { ctx.strokeStyle = `rgba(255,255,255,${1 - tap})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(30, 10, 20 + 90 * tap, 0, 7); ctx.stroke(); }
        ctx.restore();
        // the finger
        if (t > tConnect - 0.6 && t < tGrid + 0.2) {
          const fy = PY0 + 330 + 90 * (1 - H.phase(t, tConnect - 0.6, tConnect, easeOutCubic)) + 30 * H.phase(t, tConnect + 0.15, tGrid + 0.2);
          ctx.fillStyle = '#eab894'; roundRect(ctx, PX + 18, fy, 36, 150, 18); ctx.fill();
          ctx.fillStyle = '#f7d7bd'; roundRect(ctx, PX + 25, fy + 6, 22, 24, 9); ctx.fill();
        }
      }
      // photo grid
      const gp = cold ? 1 : clamp((t - tGrid) / 0.5);
      if (gp > 0) for (let i = 0; i < 9; i++) {
        const [cx, cy] = tile(i);
        const f = flights[i];
        const ap = cold ? 1 : K.popIn(t, tGrid + i * 0.05, 0.35);
        if (ap <= 0) continue;
        const gone = f && t > f.t0;
        const g = i < 6 ? GARMENTS[i] : [{ kind: 'tee', c: '#8a93a8' }, { kind: 'pants', c: '#6f86e0' }, { kind: 'dress', c: '#e8786a' }][i - 6];
        ctx.save(); ctx.translate(cx, cy); ctx.scale(ap, ap);
        if (gone) { ctx.globalAlpha = 0.35; ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2; roundRect(ctx, -40, -40, 80, 80, 10); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); continue; }
        drawTile(ctx, H, g, i);
        ctx.restore();
      }
    }
  }

  // ---------------- flying tiles -> garments
  flights.forEach((f) => {
    const k = (t - f.t0) / 0.75;
    if (k <= 0 || k >= 1) return;
    const e = easeInOutCubic(k);
    const [sx, sy] = f.snap ? [PX, PY0 + 280] : tile(f.i);
    const ex = slotX(f.i), ey = railY - 2;
    const x = lerp(sx, ex, e), y = lerp(sy, ey, e) - Math.sin(Math.PI * e) * 170;
    const morph = smooth((k - 0.25) / 0.5);
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(Math.PI * e) * 0.35);
    // trail sparkles
    K.glow(ctx, 0, 30, 90, ACC, 0.35 * Math.sin(Math.PI * k));
    if (morph < 1) { ctx.save(); ctx.globalAlpha = 1 - morph; ctx.scale(1 + 0.3 * e, 1 + 0.3 * e); drawTile(ctx, H, f.g, f.i); ctx.restore(); }
    if (morph > 0) { ctx.globalAlpha = morph; drawGarment(ctx, H, f.g, 0, -40 * (1 - e), lerp(0.35, 0.85, e)); }
    ctx.restore();
  });
  // landing sparkle
  flights.forEach((f) => {
    const k = (t - f.t0 - 0.7) / 0.4; if (k <= 0 || k >= 1) return;
    const x = slotX(f.i), y = railY + 70;
    ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 4; ctx.globalAlpha = 1 - k;
    for (let r = 0; r < 6; r++) { const a = r * Math.PI / 3; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * (20 + 30 * k), y + Math.sin(a) * (20 + 30 * k)); ctx.lineTo(x + Math.cos(a) * (32 + 40 * k), y + Math.sin(a) * (32 + 40 * k)); ctx.stroke(); }
    ctx.restore();
  });

  // ---------------- outfit cards (build mode, after mixCue)
  if (!cold && t > tMix) {
    for (let c = 0; c < 3; c++) {
      const cy = 455 + c * 190, cx = 290;
      const cp = K.popIn(t, tMix + 0.2 + c * 0.55, 0.45);
      if (cp <= 0) continue;
      ctx.save(); ctx.translate(cx, cy + 85); ctx.scale(cp, cp); ctx.translate(-cx, -(cy + 85));
      ctx.fillStyle = '#f4f6fb'; roundRect(ctx, cx - 165, cy, 330, 170, 24); ctx.fill();
      ctx.font = H.font('ui', 24); ctx.fillStyle = '#3b4672'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText('Outfit ' + (c + 1), cx - 145, cy + 32);
      // tick once both pieces are in
      const done = tMix + 0.35 + c * 0.55 + 0.12 + 0.6;
      const tk = K.popIn(t, done, 0.35);
      if (tk > 0) { ctx.save(); ctx.translate(cx - 115, cy + 110); ctx.scale(tk, tk); ctx.beginPath(); ctx.arc(0, 0, 28, 0, 7); ctx.fillStyle = ACC; ctx.fill(); ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(-3, 10); ctx.lineTo(13, -10); ctx.stroke(); ctx.restore(); }
      ctx.restore();
    }
    // pieces flying from the hangers into the cards
    OUT.forEach((pair, c) => pair.forEach((gi, k) => {
      const g = allG[gi]; if (!g) return;
      const t0 = tMix + 0.35 + c * 0.55 + k * 0.12, u = (t - t0) / 0.6;
      if (u <= 0) return;
      const e = easeInOutCubic(clamp(u));
      const ex = 290 - 5 + k * 105, ey = 455 + c * 190 + 18;
      const x = lerp(slotX(gi), ex, e), y = lerp(railY - 2, ey, e) - Math.sin(Math.PI * e) * 80;
      drawGarment(ctx, H, g, x, y, lerp(0.85, 0.62, e), false);
    }));
    const lp = K.popIn(t, tMix + 2.2, 0.45);
    if (lp > 0) K.drawLabel(ctx, 290, 1040, lp, { text: P.outfitLabel || 'From what you own', size: 28, accent: true });
  }

  // name pill (cold)
  const np = K.popIn(t, tPill, 0.45);
  if (np > 0) K.drawLabel(ctx, WC, 470, np, { text: P.app || 'AI app', size: 30, accent: true, dot: false });
  ctx.restore();
}

// a photo post tile: coloured backdrop + a small garment, ~80x80 centred at (0, 0)
function drawTile(ctx, H, g, i) {
  const bgs = ['#f2b84b', '#4fb3a6', '#e8786a', '#6f86e0', '#a08be0', '#ff9a8a', '#86c38f', '#f2b84b', '#4fb3a6'];
  ctx.save(); H.roundRect(ctx, -40, -40, 80, 80, 10); ctx.clip();
  ctx.fillStyle = bgs[i % bgs.length]; ctx.fillRect(-40, -40, 80, 80);
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(22, -22, 12, 0, 7); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-40, 24, 80, 16);
  drawGarment(ctx, H, g, 0, -36, 0.32, false);
  ctx.restore();
}
