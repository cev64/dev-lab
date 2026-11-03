// Scene "grid-protect" (full frame). A hot evening on the edge of town: a big AI data center on the left, two power
// pylons carrying a cable to a row of houses with air-conditioner units on the right, a grid-load gauge in the sky.
// When the grid is strained the data center "backs off": its rack lights dim row by row, energy pulses race down the
// cable to the homes, the ACs spin up and the gauge falls from red to green. Generic shapes, no logos; companies
// appear only as text pills. Modes:
//   hook    cold open (~3.5 s): already in crisis at frame 0 (red gauge shaking, homes flickering, warning sign);
//           the data center dims, power flows to the homes, gauge drops, pills `dcPill` / `pill` pop.
//   launch  (~12 s): calm dusk; date pill (dateCue), company pill over the data center (whoCue), a program banner
//           drops in on ropes (signCue); the heat rises and the gauge goes red (strainCue); the centre cuts its use
//           and the homes recover (cutCue).
//   number  (~12 s): a PLANNED campus (dashed outline + crane); map pin + place pill (placeCue); a utility worker at a
//           big dial + utility pill (utilityCue); the dial turns and "UP TO n MW" counts up (mwCue); a field of small
//           houses lights up behind the street + homes pill (homesCue).
//   how     (~12 s): an AGREEMENT card between two parties with rows that tick on rowCues; below, an on-site
//           generator (genCue) and a battery (batCue) pop in front of the data center and feed the cable.
//   bills   (~11 s): living room at night: a worried person on the sofa, a POWER BILL card with a rising bar and
//           "?" (billCue), a thought bubble (worryCue); then a panel: who says it pays + what (paysCue).
//   caveat  (~11 s): the empty site with fence and crane, NOT BUILT YET tag (builtCue), a calendar flips to `year`
//           (yearCue), then a power plant rises on the right with a pill (riseCue / plantsCue).
// Cues: narration words ("word#n" = the (n+1)th time) or seconds; without them fixed fractions of the scene.
// Defaults are generic placeholders ("Company", "Utility", "Place", "Date", "PROGRAM NAME", 1000 MW, year "Year");
// pass the story's names and published numbers.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, easeInOutCubic, roundRect, rgba, mixHex } = H;
  const TAU = Math.PI * 2;
  const cue = (v, frac) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v) {
      const [w, n] = v.split('#'); const s = info.timeOf(w, n ? parseInt(n, 10) : 0);
      if (s != null) return s;
    }
    return D * frac;
  };
  const ph = (a, b, e) => H.phase(t, a, b, e || easeInOutCubic);
  const mode = P.mode || 'hook';
  const GY = 1010;
  const RED = '#ff5f57', GREEN = '#57e38a';

  // ------------------------------------------------------------------ shared drawing
  function sky(heat) {
    const g = ctx.createLinearGradient(0, -100, 0, GY);
    g.addColorStop(0, mixHex('#0b1030', '#1a0d24', heat));
    g.addColorStop(0.6, mixHex('#2a2f63', '#5a2340', heat));
    g.addColorStop(1, mixHex('#a9566b', '#e0603c', heat));
    ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, GY + 200);
    for (let i = 0; i < 46; i++) {
      const x = H.hash(i, 11) * 1080, y = 140 + H.hash(i, 12) * 520, a = (0.15 + 0.25 * Math.abs(Math.sin(t * 1.1 + i))) * (1 - 0.6 * heat);
      ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(x, y, 3, 3);
    }
    // low sun behind the pylons
    const sx = 585, sy = GY - 40;
    K.glow(ctx, sx, sy, 260 + 60 * heat, mixHex('#ffb36b', '#ff6a3a', heat), 0.35 + 0.25 * heat);
    ctx.beginPath(); ctx.arc(sx, sy, 90, 0, TAU); ctx.fillStyle = mixHex('#ffd08a', '#ff8a4a', heat); ctx.fill();
    // heat shimmer lines
    if (heat > 0.05) {
      ctx.save(); ctx.globalAlpha = 0.25 * heat; ctx.strokeStyle = '#ffd7a8'; ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const y0 = GY - 70 - i * 26; ctx.beginPath();
        for (let x = 470; x <= 700; x += 10) { const y = y0 + Math.sin(x * 0.05 + t * 4 + i) * 4; x === 470 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
      }
      ctx.restore();
    }
    // far skyline silhouettes
    ctx.fillStyle = mixHex('#232650', '#3a1b33', heat);
    for (let i = 0; i < 14; i++) { const x = -40 + i * 86, h = 30 + H.hash(i, 3) * 60; ctx.fillRect(x, GY - h, 70, h); }
  }
  function ground() {
    const g = ctx.createLinearGradient(0, GY, 0, 1920);
    g.addColorStop(0, '#24304a'); g.addColorStop(1, '#0c1020');
    ctx.fillStyle = g; ctx.fillRect(-200, GY, 1480, 1200);
    ctx.fillStyle = '#34445f'; ctx.fillRect(-200, GY, 1480, 6);
  }
  // data center: act 0..1 = how much power it draws (rack LEDs, fans); ghost = planned outline only
  const DX0 = 110, DX1 = 450, DTOP = 770;
  function dataCenter(act, opts = {}) {
    const ghost = opts.ghost || 0;
    if (ghost >= 1) {
      ctx.save(); ctx.setLineDash([18, 12]); ctx.lineDashOffset = -t * 30; ctx.lineWidth = 5; ctx.strokeStyle = rgba(ACC, 0.85);
      roundRect(ctx, DX0, DTOP, DX1 - DX0, GY - DTOP, 12); ctx.stroke();
      ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.4);
      for (let c = 1; c < 5; c++) { ctx.beginPath(); ctx.moveTo(DX0 + c * (DX1 - DX0) / 5, DTOP + 14); ctx.lineTo(DX0 + c * (DX1 - DX0) / 5, GY - 10); ctx.stroke(); }
      ctx.restore();
      ctx.fillStyle = rgba(ACC, 0.06); roundRect(ctx, DX0, DTOP, DX1 - DX0, GY - DTOP, 12); ctx.fill();
      return;
    }
    K.shadow(ctx, (DX0 + DX1) / 2, GY, 420);
    K.glow(ctx, (DX0 + DX1) / 2, DTOP + 100, 260, '#4cc9ff', 0.08 + 0.22 * act);
    roundRect(ctx, DX0, DTOP, DX1 - DX0, GY - DTOP, 12); ctx.fillStyle = '#3a4270'; ctx.fill();
    ctx.fillStyle = '#2c335c'; ctx.fillRect(DX0 + (DX1 - DX0) * 0.76, DTOP, (DX1 - DX0) * 0.24, GY - DTOP);
    roundRect(ctx, DX0 - 10, DTOP - 18, DX1 - DX0 + 20, 24, 8); ctx.fillStyle = '#4c5590'; ctx.fill();
    for (let i = 0; i < 3; i++) {
      const fx = DX0 + 70 + i * 100, fy = DTOP - 36;
      roundRect(ctx, fx - 38, fy - 6, 76, 26, 6); ctx.fillStyle = '#2a2f55'; ctx.fill();
      ctx.save(); ctx.translate(fx, fy + 6); ctx.rotate(t * (0.6 + 9 * act) + i);
      ctx.fillStyle = '#8a93c8'; for (let b = 0; b < 3; b++) { ctx.rotate(TAU / 3); ctx.fillRect(-3, -13, 6, 13); }
      ctx.restore();
    }
    // rack windows: rows switch off from the top as act drops
    const rows = 3, cols = 5;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const wx = DX0 + 22 + c * 62, wy = DTOP + 28 + r * 62;
      const rowOn = clamp((act - (rows - 1 - r) / rows * 0.85) * 3);
      roundRect(ctx, wx, wy, 50, 44, 6); ctx.fillStyle = '#151a33'; ctx.fill();
      for (let l = 0; l < 3; l++) {
        const on = H.hash(r * 5 + c, Math.floor(t * 4 + l)) < 0.25 + 0.7 * rowOn;
        ctx.fillStyle = on && rowOn > 0.05 ? mixHex('#2a3050', '#4cc9ff', rowOn) : '#252b48';
        ctx.fillRect(wx + 8 + l * 14, wy + 18, 8, 8);
      }
    }
    roundRect(ctx, DX1 - 52, GY - 56, 34, 56, 4); ctx.fillStyle = '#20264a'; ctx.fill();
    // power meter on the wall
    const mx = DX0 + 26, my = GY - 30, mw = 200;
    roundRect(ctx, mx, my - 14, mw, 16, 8); ctx.fillStyle = '#151a33'; ctx.fill();
    roundRect(ctx, mx, my - 14, Math.max(16, mw * act), 16, 8); ctx.fillStyle = mixHex(ACC, '#4cc9ff', 0.3); ctx.fill();
  }
  // pylons + cable from the data center to the houses
  const PYL = [520, 640];
  const cable = [];
  {
    const segs = [[DX1, 840, PYL[0] - 38, GY - 210], [PYL[0] + 38, GY - 210, PYL[1] - 38, GY - 210], [PYL[1] + 38, GY - 210, 700, 905]];
    for (const [x0, y0, x1, y1] of segs) for (let k = 0; k <= 10; k++) { const u = k / 10; cable.push([lerp(x0, x1, u), lerp(y0, y1, u) + Math.sin(u * Math.PI) * 22]); }
  }
  function pylons() {
    for (const px of PYL) {
      ctx.strokeStyle = '#6b7396'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(px - 32, GY); ctx.lineTo(px, GY - 240); ctx.lineTo(px + 32, GY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(px - 40, GY - 210); ctx.lineTo(px + 40, GY - 210); ctx.moveTo(px - 22, GY - 130); ctx.lineTo(px + 22, GY - 130);
      ctx.moveTo(px - 26, GY - 100); ctx.lineTo(px + 14, GY - 170); ctx.moveTo(px + 26, GY - 100); ctx.lineTo(px - 14, GY - 170); ctx.stroke();
    }
    ctx.strokeStyle = '#4a527a'; ctx.lineWidth = 5; ctx.beginPath(); cable.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  }
  function pulses(level, path = cable, speed = 1) {
    if (level <= 0.01) return;
    const n = 2 + Math.round(5 * level);
    for (let i = 0; i < n; i++) {
      const u = (t * (0.3 + 0.5 * level) * speed + i / n) % 1;
      const [x, y] = K.pathPoint(path, u);
      K.glow(ctx, x, y, 30 + 22 * level, ACC, 0.35 + 0.5 * level);
      ctx.beginPath(); ctx.arc(x, y, 5 + 3 * level, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill();
    }
  }
  // a house with an AC unit; lit 0..1, ac 0..1 (fan speed), flick 0..1 (flicker amount)
  function house(cx, w, h, lit, ac, seed, flick = 0, body = '#c97b63') {
    const x0 = cx - w / 2, top = GY - h;
    K.shadow(ctx, cx, GY, w + 60);
    ctx.fillStyle = body; ctx.fillRect(x0, top, w, h);
    ctx.fillStyle = mixHex(body, '#000000', 0.2); ctx.fillRect(x0 + w * 0.72, top, w * 0.28, h);
    ctx.beginPath(); ctx.moveTo(x0 - 16, top + 4); ctx.lineTo(cx, top - h * 0.55); ctx.lineTo(x0 + w + 16, top + 4); ctx.closePath();
    ctx.fillStyle = '#5a3a4a'; ctx.fill();
    const f = flick > 0 ? (H.hash(seed, Math.floor(t * 9)) < 0.5 ? 1 - flick : 1) : 1;
    const L = lit * f;
    for (let i = 0; i < 2; i++) {
      const wx = x0 + 14 + i * (w * 0.5), wy = top + 22, ww = w * 0.3, wh = h * 0.3;
      roundRect(ctx, wx, wy, ww, wh, 4); ctx.fillStyle = mixHex('#1a1f38', '#ffe3a0', L); ctx.fill();
      if (L > 0.3) K.glow(ctx, wx + ww / 2, wy + wh / 2, 50, '#ffd98a', 0.3 * L);
    }
    roundRect(ctx, cx - 14, GY - h * 0.42, 28, h * 0.42, 3); ctx.fillStyle = '#3b2733'; ctx.fill();
    // AC unit on the side
    const ax = cx + w * 0.16, ay = GY - 46;
    roundRect(ctx, ax, ay, 54, 46, 6); ctx.fillStyle = '#c9cfdc'; ctx.fill();
    ctx.beginPath(); ctx.arc(ax + 27, ay + 23, 17, 0, TAU); ctx.fillStyle = '#4a5068'; ctx.fill();
    ctx.save(); ctx.translate(ax + 27, ay + 23); ctx.rotate(t * (0.3 + 14 * ac) + seed);
    ctx.fillStyle = '#e8ecf5'; for (let b = 0; b < 3; b++) { ctx.rotate(TAU / 3); ctx.fillRect(-3, -15, 6, 15); }
    ctx.restore();
    if (ac > 0.4) { // cool air puffs
      for (let k = 0; k < 3; k++) {
        const u = (t * 0.9 + k / 3 + seed * 0.1) % 1;
        ctx.strokeStyle = `rgba(150,220,255,${0.6 * (1 - u) * ac})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(ax + 27, ay - 8 - u * 34, 8 + u * 12, Math.PI + 0.7, TAU - 0.7); ctx.stroke();
      }
    }
  }
  function houses(lit, ac, flick = 0) {
    house(740, 150, 116, lit, ac, 1, flick, '#c97b63');
    house(862, 104, 96, lit, ac, 2, flick, '#7f8fc9');
  }
  function gauge(x, y, r, load, label, shake = 0) {
    const sx = shake ? Math.sin(t * 60) * 4 * shake : 0;
    ctx.save(); ctx.translate(x + sx, y);
    roundRect(ctx, -r - 26, -r - 24, 2 * r + 52, r + 86, 24); ctx.fillStyle = 'rgba(10,12,24,0.82)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.stroke();
    const segs = [[GREEN, 0, 0.45], ['#ffd34d', 0.45, 0.72], [RED, 0.72, 1]];
    ctx.lineWidth = 22; ctx.lineCap = 'butt';
    for (const [c, a, b] of segs) { ctx.beginPath(); ctx.arc(0, 0, r - 12, Math.PI + a * Math.PI, Math.PI + b * Math.PI); ctx.strokeStyle = c; ctx.stroke(); }
    const ang = Math.PI + clamp(load) * Math.PI + (shake ? Math.sin(t * 37) * 0.06 * shake : 0);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * (r - 26), Math.sin(ang) * (r - 26)); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.font = H.font('ui', 26); ctx.letterSpacing = '2px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = load > 0.72 ? RED : 'rgba(255,255,255,0.85)'; ctx.fillText(label || 'GRID LOAD', 0, 40);
    ctx.letterSpacing = '0px';
    ctx.restore();
  }
  function downBadge(x, y, p) { // accent circle with a down arrow: "power use down"
    if (p <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
    K.glow(ctx, 0, 0, 90, ACC, 0.4);
    ctx.beginPath(); ctx.arc(0, 0, 44, 0, TAU); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = K.ACCENT.deep;
    ctx.beginPath(); ctx.moveTo(-12, -26); ctx.lineTo(12, -26); ctx.lineTo(12, 2); ctx.lineTo(26, 2); ctx.lineTo(0, 30); ctx.lineTo(-26, 2); ctx.lineTo(-12, 2); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function crane(x, swing) {
    ctx.strokeStyle = '#f0b43c'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, GY); ctx.lineTo(x, GY - 330); ctx.stroke();
    for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.moveTo(x - 0, GY - k * 46); ctx.lineTo(x + 0, GY - k * 46 - 46); ctx.stroke(); }
    ctx.lineWidth = 3; for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.moveTo(x - 14, GY - k * 46); ctx.lineTo(x + 14, GY - k * 46 - 46); ctx.stroke(); }
    ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x - 60, GY - 330); ctx.lineTo(x + 230, GY - 330); ctx.stroke();
    ctx.fillStyle = '#c98f2a'; ctx.fillRect(x - 80, GY - 346, 50, 32);
    const hx = x + 170 + Math.sin(t * 1.4) * 10 * swing, hy = GY - 190;
    ctx.strokeStyle = '#9aa3c0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + 170, GY - 330); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = '#6b7396'; ctx.fillRect(hx - 40, hy, 80, 22);
  }
  function fence() {
    ctx.strokeStyle = 'rgba(200,210,235,0.55)'; ctx.lineWidth = 3;
    for (let x = 90; x <= 480; x += 30) { ctx.beginPath(); ctx.moveTo(x, GY); ctx.lineTo(x, GY - 54); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(90, GY - 48); ctx.lineTo(480, GY - 48); ctx.moveTo(90, GY - 20); ctx.lineTo(480, GY - 20); ctx.stroke();
  }
  function pin(x, y, p) {
    if (p <= 0) return;
    const yy = y - (1 - easeOutCubic(clamp(p))) * 220;
    ctx.save(); ctx.globalAlpha = clamp(p * 2);
    K.glow(ctx, x, yy - 40, 80, ACC, 0.4);
    ctx.beginPath(); ctx.moveTo(x, yy); ctx.bezierCurveTo(x - 40, yy - 50, x - 40, yy - 95, x, yy - 95); ctx.bezierCurveTo(x + 40, yy - 95, x + 40, yy - 50, x, yy); ctx.fillStyle = ACC; ctx.fill();
    ctx.beginPath(); ctx.arc(x, yy - 66, 14, 0, TAU); ctx.fillStyle = K.ACCENT.deep; ctx.fill();
    ctx.restore();
  }
  function panel(x0, y0, w, h, a = 0.92) {
    roundRect(ctx, x0, y0, w, h, 26); ctx.fillStyle = `rgba(12,14,28,${a})`; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = rgba(ACC, 0.55); ctx.stroke();
  }
  function centerText(txt, x, y, kind, size, color, maxW) {
    const fs = maxW ? H.fitText(ctx, txt, kind, size, Math.round(size * 0.55), maxW).size : size;
    ctx.font = H.font(kind, fs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(txt, x, y);
  }
  function scaleAt(x, y, s, fn) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y); fn(); ctx.restore(); }

  ctx.save();
  // ================================================================== modes
  if (mode === 'hook') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 760 }, { t: D, zoom: 1.04, x: 520, y: 770 }]);
    const dim = ph(0.25, 1.3), rec = ph(0.9, 2.1);
    sky(1 - 0.35 * rec); ground();
    dataCenter(lerp(1, 0.12, dim));
    pylons(); pulses(0.25 + 0.75 * ph(0.5, 1.1));
    houses(lerp(0.45, 1, rec), lerp(0.1, 1, rec), 0.75 * (1 - rec));
    if (rec < 1) K.drawWarning(ctx, 805, 840, 0.55 * (1 - rec), { pulse: Math.abs(Math.sin(t * 8)) });
    gauge(487, 600, 120, lerp(0.95, 0.3, rec), 'GRID LOAD', 1 - rec);
    downBadge(DX1 - 20, DTOP - 10, K.popIn(t, 0.45, 0.4));
    const p1 = K.popIn(t, 1.25, 0.4); if (p1 > 0) K.drawLabel(ctx, 280, 735, p1, { text: P.dcPill || 'AI backs off', size: 28, accent: true });
    const p2 = K.popIn(t, 1.9, 0.4); if (p2 > 0) K.drawLabel(ctx, 715, 815, p2, { text: P.pill || 'Power back to homes', size: 26, dot: true });
  } else if (mode === 'launch') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.05, x: 487, y: 760 }]);
    const tDate = cue(P.dateCue, 0.12), tWho = cue(P.whoCue, 0.2), tSign = cue(P.signCue, 0.3), tStrain = cue(P.strainCue, 0.65), tCut = cue(P.cutCue, 0.82);
    const strain = ph(tStrain - 0.6, tStrain + 0.3), cut = ph(tCut - 0.1, tCut + 0.9);
    const heat = 0.25 + 0.75 * strain * (1 - 0.5 * cut);
    sky(heat); ground();
    dataCenter(lerp(0.95, 0.15, cut));
    pylons(); pulses(0.25 + 0.75 * cut);
    houses(lerp(1, lerp(0.5, 1, cut), strain), lerp(0.7, lerp(0.15, 1, cut), strain), 0.7 * strain * (1 - cut));
    const load = lerp(0.35, 0.95, strain) - 0.6 * cut;
    gauge(735, 722, 88, load, 'GRID LOAD', strain * (1 - cut));
    downBadge(DX1 - 20, DTOP - 10, K.popIn(t, tCut, 0.4));
    if (strain > 0 && cut < 1) K.drawWarning(ctx, 870, 822, 0.45 * strain * (1 - cut), { pulse: Math.abs(Math.sin(t * 8)) });
    const pw = K.popIn(t, tWho, 0.4); if (pw > 0) K.drawLabel(ctx, 280, 730, pw, { text: P.who || 'Company', size: 30, dot: true });
    const pd = K.popIn(t, tDate, 0.4); if (pd > 0) K.drawLabel(ctx, 290, 655, pd, { text: P.date || 'Date', size: 26 });
    // the banner drops in on two ropes, swings and settles
    const sp = ph(tSign - 0.1, tSign + 0.7, easeOutCubic);
    if (sp > 0) {
      const sw = Math.sin((t - tSign) * 5) * 0.05 * Math.exp(-(t - tSign) * 1.4) * (t > tSign ? 1 : 0);
      const by = lerp(150, 448, sp);
      ctx.save(); ctx.translate(487, by - 60); ctx.rotate(sw); ctx.translate(-487, -(by - 60));
      ctx.strokeStyle = 'rgba(220,226,245,0.6)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(250, by - 200); ctx.lineTo(250, by); ctx.moveTo(724, by - 200); ctx.lineTo(724, by); ctx.stroke();
      roundRect(ctx, 150, by, 674, 150, 26); ctx.fillStyle = '#f4f6fb'; ctx.fill();
      roundRect(ctx, 150, by, 18, 150, 9); ctx.fillStyle = ACC; ctx.fill();
      K.drawShield(ctx, 240, by + 128, 0.72, { check: ph(tSign + 0.4, tSign + 1.0), shadow: false });
      const words = String(P.sign || 'PROGRAM NAME').split(' ');
      const l1 = words.slice(0, 2).join(' '), l2 = words.slice(2).join(' ');
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#141829';
      ctx.font = H.font('display', H.fitText(ctx, l1, 'display', 50, 30, 500).size); ctx.fillText(l1, 310, by + 56);
      ctx.font = H.font('ui', 32); ctx.letterSpacing = '6px'; ctx.fillStyle = '#4a5270'; ctx.fillText(l2, 312, by + 108); ctx.letterSpacing = '0px';
      ctx.restore();
    }
  } else if (mode === 'number') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 760 }, { t: D, zoom: 1.05, x: 500, y: 760 }]);
    const tPlace = cue(P.placeCue, 0.1), tUt = cue(P.utilityCue, 0.3), tMw = cue(P.mwCue, 0.5) - 0.7, tHomes = cue(P.homesCue, 0.75) - 1.0;
    const turn = ph(tMw, tMw + 1.6), homes = ph(tHomes, tHomes + 1.4);
    sky(0.35); ground();
    // a field of small houses lights up beyond the street
    const field = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) field.push([560 + c * 40 + (r % 2) * 20, 905 + r * 18, r, c]);
    field.forEach(([x, y, r, c], i) => {
      const local = clamp((homes * 1.4 - (c / 9) * 0.6 - r * 0.08) * 2);
      if (local <= 0) return;
      ctx.save(); ctx.globalAlpha = local; ctx.translate(x, y); const s = 0.6 + 0.4 * local; ctx.scale(s, s);
      ctx.fillStyle = '#3c4470'; ctx.fillRect(-14, -18, 28, 18);
      ctx.beginPath(); ctx.moveTo(-18, -16); ctx.lineTo(0, -32); ctx.lineTo(18, -16); ctx.closePath(); ctx.fillStyle = '#2b3158'; ctx.fill();
      ctx.fillStyle = H.hash(i, Math.floor(t * 2)) < 0.9 ? '#ffe3a0' : '#7a6a50'; ctx.fillRect(-6, -13, 12, 9);
      ctx.restore();
    });
    dataCenter(0, { ghost: 1 });
    crane(160, 1);
    pylons(); pulses(0.15 + 0.85 * turn);
    houses(1, 0.4 + 0.6 * turn);
    const pt = K.popIn(t, 0.1, 0.4); if (pt > 0) K.drawLabel(ctx, 280, 860, pt, { text: P.planned || 'PLANNED', size: 26 });
    pin(280, 760, ph(tPlace - 0.2, tPlace + 0.5, easeOutCubic));
    const pp = K.popIn(t, tPlace + 0.2, 0.4) * (1 - ph(tHomes + 0.2, tHomes + 0.6)); if (pp > 0) K.drawLabel(ctx, 345, 650, pp, { text: P.place || 'Place', size: 30, dot: true });
    // the utility worker at a big dial
    const wp = ph(tUt - 0.3, tUt + 0.4, easeOutCubic);
    if (wp > 0) {
      ctx.save(); ctx.globalAlpha = clamp(wp * 2); ctx.translate(0, (1 - wp) * 40);
      const bx = 560, by = GY;
      roundRect(ctx, bx - 52, by - 150, 104, 150, 12); ctx.fillStyle = '#4a5490'; ctx.fill();
      ctx.beginPath(); ctx.arc(bx, by - 98, 36, 0, TAU); ctx.fillStyle = '#20264a'; ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = rgba(ACC, 0.9); ctx.beginPath(); ctx.arc(bx, by - 98, 36, Math.PI * 0.75, Math.PI * 0.75 + turn * Math.PI * 1.5); ctx.stroke();
      const ka = Math.PI * 0.75 + turn * Math.PI * 1.5;
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(bx, by - 98); ctx.lineTo(bx + Math.cos(ka) * 28, by - 98 + Math.sin(ka) * 28); ctx.stroke();
      K.drawPerson(ctx, 470, GY + 6, 0.95, { t, pose: turn > 0 && turn < 1 ? 'point' : 'stand', mood: 'neutral', shirt: '#f0a43c', hair: 1, skin: 2, seed: 4, talk: 0 });
      ctx.restore();
      const pu = K.popIn(t, tUt, 0.4); if (pu > 0) K.drawLabel(ctx, 520, 760, pu, { text: P.utility || 'Utility', size: 28, accent: true });
    }
    // the big counter
    const cp = K.popIn(t, tMw, 0.45);
    if (cp > 0) {
      scaleAt(487, 500, cp, () => {
        panel(170, 425, 634, 160);
        centerText('UP TO', 487, 462, 'ui', 28, 'rgba(255,255,255,0.75)');
        const v = Math.round(K.countUp(P.mw || 1000, t, tMw + 0.1, 1.4, 0));
        centerText(`${v.toLocaleString('en-US')} ${P.unit || 'MW'}`, 487, 532, 'display', 86, ACC, 580);
      });
    }
    const hp = K.popIn(t, tHomes + 0.5, 0.4);
    if (hp > 0) {
      scaleAt(700, 640, hp, () => {
        panel(540, 600, 320, 112);
        centerText('≈ ' + (P.homes || 'N homes'), 700, 640, 'display', 36, '#ffffff', 280);
        centerText(P.homesBy || 'per source', 700, 684, 'ui', 24, 'rgba(255,255,255,0.75)');
      });
    }
  } else if (mode === 'how') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.04, x: 487, y: 750 }]);
    const rows = P.rows || ['How much?', 'How fast?', 'How long?'];
    const rc = (P.rowCues || []);
    const rowT = rows.map((_, i) => cue(rc[i], 0.25 + i * 0.12));
    const tGen = cue(P.genCue, 0.8), tBat = cue(P.batCue, 0.88);
    sky(0.4); ground();
    const g = ph(tGen - 0.3, tGen + 0.3), b = ph(tBat - 0.3, tBat + 0.3);
    dataCenter(0.6 + 0.2 * Math.sin(t * 0.8));
    pylons(); pulses(0.4 + 0.5 * Math.max(g, b));
    houses(1, 0.8);
    // generator + battery in front of the data center, feeding a short cable to the line
    if (g > 0) {
      ctx.save(); ctx.globalAlpha = clamp(g * 2); const s = K.popIn(t, tGen - 0.3, 0.5);
      scaleAt(205, GY, s, () => {
        K.shadow(ctx, 205, GY, 160);
        roundRect(ctx, 140, GY - 92, 130, 92, 12); ctx.fillStyle = '#6a7a52'; ctx.fill();
        ctx.fillStyle = '#56653f'; ctx.fillRect(230, GY - 92, 40, 92);
        for (let k = 0; k < 4; k++) { ctx.fillStyle = '#3a4430'; ctx.fillRect(152, GY - 80 + k * 16, 64, 7); }
        ctx.fillStyle = '#3a4430'; ctx.fillRect(240, GY - 126, 16, 36);
        for (let k = 0; k < 3; k++) { const u = (t * 0.7 + k / 3) % 1; ctx.beginPath(); ctx.arc(248 + u * 20, GY - 134 - u * 70, 10 + u * 16, 0, TAU); ctx.fillStyle = `rgba(210,215,230,${0.45 * (1 - u)})`; ctx.fill(); }
      });
      ctx.restore();
    }
    if (b > 0) {
      ctx.save(); ctx.globalAlpha = clamp(b * 2); const s = K.popIn(t, tBat - 0.3, 0.5);
      scaleAt(365, GY, s, () => {
        K.shadow(ctx, 365, GY, 130);
        roundRect(ctx, 318, GY - 120, 94, 120, 12); ctx.fillStyle = '#e8ecf5'; ctx.fill();
        roundRect(ctx, 345, GY - 134, 40, 16, 5); ctx.fillStyle = '#c3c9d8'; ctx.fill();
        const lvl = 0.55 + 0.4 * Math.sin(t * 1.6);
        for (let k = 0; k < 4; k++) { const on = (k + 1) / 4 <= lvl + 0.15; roundRect(ctx, 330, GY - 26 - k * 24, 70, 18, 4); ctx.fillStyle = on ? ACC : '#9aa3bb'; ctx.fill(); }
      });
      ctx.restore();
    }
    if (g > 0 || b > 0) {
      const feed = [[205, GY - 96], [300, GY - 160], [DX1, 840]];
      const pts = K.bezier(205, GY - 96, 260, GY - 220, 380, GY - 200, DX1, 845, 18);
      ctx.strokeStyle = rgba(ACC, 0.5 * Math.max(g, b)); ctx.lineWidth = 4; ctx.setLineDash([10, 10]); ctx.lineDashOffset = -t * 40;
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.setLineDash([]);
      pulses(Math.max(g, b) * 0.6, pts, 1.3);
      void feed;
      const sp = K.popIn(t, tGen + 0.1, 0.4); if (sp > 0) K.drawLabel(ctx, 250, 900, sp, { text: P.gen || 'Generator', size: 24 });
      const bp = K.popIn(t, tBat + 0.05, 0.4); if (bp > 0) K.drawLabel(ctx, 400, 850, bp, { text: P.bat || 'Batteries', size: 24 });
      const sm = K.popIn(t, tGen - 0.2, 0.4); if (sm > 0) K.drawLabel(ctx, 320, 790, sm, { text: P.some || 'Some sites', size: 26, accent: true });
    }
    // the agreement card
    const ap = K.popIn(t, 0.2, 0.5);
    const lift = ph(tGen - 0.6, tGen + 0.2);
    if (ap > 0) {
      scaleAt(487, 560, ap * lerp(1, 0.86, lift), () => {
        ctx.save(); ctx.translate(0, -lift * 30);
        roundRect(ctx, 150, 420, 674, 300, 26); ctx.fillStyle = '#f4f6fb'; ctx.fill();
        roundRect(ctx, 150, 420, 674, 64, 26); ctx.fillStyle = '#e1e5f0'; ctx.fill(); ctx.fillRect(150, 460, 674, 24);
        ctx.font = H.font('ui', 26); ctx.letterSpacing = '3px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3b4672';
        ctx.fillText('AGREEMENT', 487, 454); ctx.letterSpacing = '0px';
        // party chips
        const pa = String(P.partyA || 'Company'), pb = String(P.partyB || 'Utility');
        ctx.font = H.font('ui', 26);
        const chip = (txt, cx, fill, ink) => { const w = ctx.measureText(txt).width + 40; roundRect(ctx, cx - w / 2, 498, w, 46, 23); ctx.fillStyle = fill; ctx.fill(); ctx.fillStyle = ink; ctx.fillText(txt, cx, 522); };
        chip(pa, 330, '#141829', '#ffffff'); chip(pb, 644, ACC, K.ACCENT.deep);
        // handshake arrows
        const hs = Math.sin(t * 3) * 6;
        ctx.strokeStyle = '#3b4672'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(440 + hs, 514); ctx.lineTo(534 - hs, 514); ctx.moveTo(522 - hs, 504); ctx.lineTo(534 - hs, 514); ctx.lineTo(522 - hs, 524);
        ctx.moveTo(534 - hs, 532); ctx.lineTo(440 + hs, 532); ctx.moveTo(452 + hs, 522); ctx.lineTo(440 + hs, 532); ctx.lineTo(452 + hs, 542); ctx.stroke();
        rows.forEach((txt, i) => {
          const y = 590 + i * 48, on = K.popIn(t, rowT[i] - 0.15, 0.35);
          ctx.globalAlpha = 0.35 + 0.65 * clamp(on);
          roundRect(ctx, 200, y - 20, 40, 40, 10); ctx.fillStyle = on > 0 ? ACC : '#c8cede'; ctx.fill();
          if (on > 0) { ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(209, y); ctx.lineTo(217, y + 9); ctx.lineTo(232, y - 9); ctx.stroke(); }
          ctx.font = H.font('display', 34); ctx.textAlign = 'left'; ctx.fillStyle = '#141829'; ctx.fillText(txt, 262, y + 2);
          // little bar that fills as the row is agreed
          roundRect(ctx, 560, y - 9, 220, 18, 9); ctx.fillStyle = '#d5dae8'; ctx.fill();
          roundRect(ctx, 560, y - 9, Math.max(18, 220 * clamp(on) * (0.45 + 0.25 * i)), 18, 9); ctx.fillStyle = mixHex(ACC, '#4a5490', 0.35); ctx.fill();
          ctx.globalAlpha = 1;
        });
        ctx.restore();
      });
    }
  } else if (mode === 'bills') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 760 }, { t: D, zoom: 1.05, x: 480, y: 770 }]);
    const tWorry = cue(P.worryCue, 0.25), tBill = cue(P.billCue, 0.45), tPays = cue(P.paysCue, 0.72);
    const room = K.world.livingRoomNight(ctx, { t, lampOn: 1 });
    const relief = ph(tPays, tPays + 1.0);
    K.drawPerson(ctx, room.sofa.x - 60, room.sofa.feetY, 1.9, { t, pose: 'sit', seat: false, mood: relief > 0.5 ? 'neutral' : 'worried', look: relief > 0.3 ? 0.6 : -0.4, shirt: 3, hair: 2, hairStyle: 'long', skin: 1, seed: 9 });
    // the bill card (left), bar rises with "?"
    const bp = K.popIn(t, 0.15, 0.45);
    if (bp > 0) {
      const rise = ph(tBill - 0.4, tBill + 0.8);
      scaleAt(270, 540, bp, () => {
        const wob = Math.sin(t * 2.2) * 0.03;
        ctx.save(); ctx.translate(270, 540); ctx.rotate(-0.04 + wob); ctx.translate(-270, -540);
        roundRect(ctx, 120, 430, 300, 230, 18); ctx.fillStyle = '#f4f6fb'; ctx.fill();
        roundRect(ctx, 120, 430, 300, 54, 18); ctx.fillStyle = ACC; ctx.fill(); ctx.fillRect(120, 466, 300, 18);
        ctx.font = H.font('ui', 26); ctx.letterSpacing = '2px'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = K.ACCENT.deep;
        ctx.fillText(P.bill || 'POWER BILL', 270, 458); ctx.letterSpacing = '0px';
        const bars = [0.35, 0.45, 0.55, 0.55 + 0.4 * rise];
        bars.forEach((v, i) => { const h = 130 * v; roundRect(ctx, 150 + i * 62, 640 - h, 44, h, 8); ctx.fillStyle = i === 3 ? mixHex('#8a93b8', RED, rise) : '#8a93b8'; ctx.fill(); });
        if (rise > 0.3) {
          const qp = K.popIn(t, tBill + 0.3, 0.4);
          ctx.save(); ctx.translate(372, 640 - 130 * (0.55 + 0.4 * rise) - 30); ctx.scale(qp, qp);
          ctx.font = H.font('display', 44); ctx.fillStyle = RED; ctx.textAlign = 'center'; ctx.fillText('?', 0, 0); ctx.restore();
        }
        ctx.restore();
      });
    }
    // worry bubble -> pays panel
    const wp = K.popIn(t, tWorry, 0.4), out = ph(tPays - 0.3, tPays);
    if (wp > 0 && out < 1) {
      ctx.save(); ctx.globalAlpha = 1 - out;
      K.drawSpeechBubble(ctx, 560, 720, wp, { text: P.worry || 'Will it go up?', size: 34, maxW: 330, tail: 'left' });
      ctx.restore();
    }
    const pp = K.popIn(t, tPays, 0.45);
    if (pp > 0) {
      scaleAt(680, 540, pp, () => {
        panel(460, 430, 420, 240);
        // pylon icon
        ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.lineCap = 'round';
        const ix = 670, iy = 650;
        ctx.beginPath(); ctx.moveTo(ix - 26, iy); ctx.lineTo(ix, iy - 120); ctx.lineTo(ix + 26, iy); ctx.moveTo(ix - 32, iy - 100); ctx.lineTo(ix + 32, iy - 100); ctx.moveTo(ix - 18, iy - 60); ctx.lineTo(ix + 18, iy - 60); ctx.stroke();
        centerText(P.pays || 'Company pays', 670, 472, 'display', 36, '#ffffff', 380);
        centerText(P.paysSub || 'Lines + service', 670, 514, 'ui', 28, ACC, 380);
      });
      // coins arc into the pylon icon
      for (let i = 0; i < 6; i++) {
        const s0 = tPays + 0.4 + i * 0.25, u = (t - s0) / 0.9;
        if (u < 0 || u > 1) continue;
        const x = lerp(880, 690, u), y = lerp(760, 640, u) - Math.sin(u * Math.PI) * 50;
        ctx.save(); ctx.globalAlpha = 1 - smooth((u - 0.8) / 0.2); K.drawCoin(ctx, x, y, 0.6, { spin: t * 6 + i }); ctx.restore();
      }
    }
  } else if (mode === 'caveat') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 760 }, { t: D, zoom: 1.05, x: 470, y: 770 }]);
    const tBuilt = cue(P.builtCue, 0.18), tYear = cue(P.yearCue, 0.32), tRise = cue(P.riseCue, 0.65), tPl = cue(P.plantsCue, 0.9);
    sky(0.3); ground();
    // the power plant rises on the right
    const rise = ph(tRise - 0.2, tRise + 1.4, easeOutCubic);
    if (rise > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(-200, 0, 1480, GY); ctx.clip();
      ctx.translate(0, (1 - rise) * 330);
      const cx = 690;
      // cooling tower
      ctx.beginPath(); ctx.moveTo(cx - 110, GY); ctx.quadraticCurveTo(cx - 60, GY - 150, cx - 80, GY - 280); ctx.lineTo(cx + 80, GY - 280); ctx.quadraticCurveTo(cx + 60, GY - 150, cx + 110, GY); ctx.closePath();
      ctx.fillStyle = '#b8bfd2'; ctx.fill();
      ctx.save(); ctx.clip(); ctx.fillStyle = '#9ca4bb'; ctx.fillRect(cx + 20, GY - 300, 120, 300); ctx.restore();
      // stack
      ctx.fillStyle = '#7a829e'; ctx.fillRect(cx + 120, GY - 330, 36, 330);
      ctx.fillStyle = RED; ctx.fillRect(cx + 120, GY - 330, 36, 14); ctx.fillRect(cx + 120, GY - 290, 36, 10);
      for (let k = 0; k < 4; k++) { const u = (t * 0.35 + k / 4) % 1; ctx.beginPath(); ctx.arc(cx - 10 + u * 50, GY - 300 - u * 120, 34 + u * 40, 0, TAU); ctx.fillStyle = `rgba(235,238,248,${0.5 * (1 - u) * rise})`; ctx.fill(); }
      ctx.restore();
    }
    pylons(); houses(1, 0.6);
    fence();
    dataCenter(0, { ghost: 1 });
    crane(150, 1);
    // NOT BUILT YET tag swings on a nail
    const np = K.popIn(t, tBuilt - 0.1, 0.45);
    if (np > 0) {
      const sw = Math.sin((t - tBuilt) * 4) * 0.12 * Math.exp(-Math.max(0, t - tBuilt) * 0.9);
      ctx.save(); ctx.translate(280, 820); ctx.rotate(sw); ctx.scale(np, np);
      ctx.strokeStyle = '#d5dae8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-60, 0); ctx.lineTo(0, -40); ctx.lineTo(60, 0); ctx.stroke();
      roundRect(ctx, -140, 0, 280, 70, 12); ctx.fillStyle = ACC; ctx.fill();
      ctx.font = H.font('display', 34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = K.ACCENT.deep; ctx.fillText(P.notBuilt || 'NOT BUILT YET', 0, 37);
      ctx.restore();
    }
    // calendar flips through years to `year`
    const cp = K.popIn(t, tYear - 0.3, 0.45);
    if (cp > 0) {
      const flip = ph(tYear, tYear + 1.2), yr = P.year || 'Year'; // never shows a wrong year, the page just flips in
      scaleAt(487, 520, cp, () => {
        panel(170, 425, 634, 170);
        centerText(P.yearLabel || 'From', 487, 466, 'ui', 28, 'rgba(255,255,255,0.8)', 560);
        // calendar page
        roundRect(ctx, 397, 492, 180, 88, 14); ctx.fillStyle = '#f4f6fb'; ctx.fill();
        roundRect(ctx, 397, 492, 180, 20, 8); ctx.fillStyle = RED; ctx.fill();
        const fp = (flip * 3) % 1, flipping = flip > 0 && flip < 1;
        ctx.save(); if (flipping) { ctx.translate(487, 492); ctx.scale(1, 0.6 + 0.4 * Math.abs(Math.cos(fp * Math.PI))); ctx.translate(-487, -492); }
        centerText(String(yr), 487, 550, 'display', 52, '#141829');
        ctx.restore();
      });
    }
    const pl = K.popIn(t, tPl - 0.5, 0.45);
    if (pl > 0) K.drawLabel(ctx, 560, 655, pl, { text: P.plants || 'Still needs power plants', size: 28, dot: true });
  }
  ctx.restore();
}
