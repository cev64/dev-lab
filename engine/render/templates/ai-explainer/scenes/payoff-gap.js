// Scene "payoff-gap" (full frame; was ai-payoff, 2026-10-26). "A few giants win, everyone else waits": a cluster of
// ordinary company towers next to seven tall glowing "giant" towers. Generic cartoon skyline, no logos, no real people
// (an analyst / speaker appears as text only). Fits: AI (or any tech) pays off for the biggest firms but not (yet) the
// rest, winner-take-most gaps, "the index minus the giants" stories.
// modes:
//   city      (2-beat span: hook + who/what) establishing skyline, workers on the street; a "note" card with name /
//             role / date pills; an "all companies" bracket over every tower, then the giants slide apart and the rest
//             get their own bracket.  params: author, role, date, note, allLabel, restLabel, giantsLabel,
//             noteCue, dateCue, allCue, restCue, splitCue, giantsCue
//   charts    office wall board with two panels (e.g. revenue per worker, profit margins): giants' line rises, the
//             rest's line stays flat (shapes only, "shape" note), FLAT tags, productivity pill with a stuck gauge.
//             params: panels [2], giants, rest, shapeNote, prod, riseCue, risingCue, restCue, flatCue, prodCue
//   cost      dusk street: a typical company tower pays coins into an "AI tools" building; the return path stays
//             empty, "Payoff: zero" lands; verbatim quote panel; then a GROWTH jar is crossed and an "AI spending"
//             receipt drops into a COST bin.  params: company, ai, zero, quote, by, growth, cost, receipt,
//             payCue, zeroCue, quoteCue, binCue, costCue
//   judgment  office: robot by a giant calculator (digits racing) vs a cartoon manager weighing two option cards;
//             verbatim quote panel; then 3 chips (Trust / Accountability / Unwritten rules) link to the manager and
//             dashed links to the robot break with a "?".  params: quote, by, calc, judge, chips [3], chipCues [3],
//             quoteCue, calcCue, judgeCue, missCue
//   caveat    night skyline of ordinary towers: "one note / based on charts" pills, a magnifier finds a few lit
//             windows in two towers ("gains in single firms?"), then an hourglass "or later?" pill.
//             params: note, charts, hidden, later, noteCue, chartsCue, hideCue, laterCue
//   payoff    the skyline again: giants glow with rising arrows, workers wait by the rest with clocks; question card
//             + two chips.  params: question, a, b, climbCue, waitCue, qCue
// Defaults are generic placeholders ("Firm A", "This week", "Quote goes here"); pass the story's names, verbatim
// quotes and published figures. Cue params are optional narration words ("word#n" = the (n+1)th time spoken);
// without them fixed fractions of the scene.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect } = H;
  const at = (w, d, nth = 0) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w, nth); return v == null ? d : v; };
  const mode = P.mode || 'city';
  const GY = 1000;

  // ---------- shared drawing helpers
  function tower(x, w, h, col, lit, seed, opts = {}) {
    const top = GY - h, sh = H.mixHex(col, '#000000', 0.28), hi = H.mixHex(col, '#ffffff', 0.16);
    roundRect(ctx, x, top, w, h + 4, 5); ctx.fillStyle = col; ctx.fill();
    ctx.fillStyle = sh; ctx.fillRect(x + w * 0.68, top + 4, w * 0.32, h);
    roundRect(ctx, x - 3, top - 8, w + 6, 12, 4); ctx.fillStyle = hi; ctx.fill();
    if (opts.spire) { ctx.fillStyle = hi; ctx.fillRect(x + w / 2 - 2, top - 34, 4, 28); H.glow(ctx, x + w / 2, top - 36, 14, ACC, 0.6 * (opts.glow || 0)); }
    const cols = Math.max(1, Math.floor((w - 8) / 12)), rows = Math.floor((h - 24) / 18);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const on = H.hash(seed * 31 + r * 7 + c, Math.floor(t * 0.5 + H.hash(r, seed) * 4)) < lit;
      const wx = x + 6 + c * 12, wy = top + 14 + r * 18;
      ctx.fillStyle = on ? (opts.accentWin ? H.rgba(ACC, 0.9) : 'rgba(255,224,150,0.85)') : 'rgba(10,14,36,0.55)';
      ctx.fillRect(wx, wy, 6, 9);
    }
    if (opts.glow > 0) H.glow(ctx, x + w / 2, top + h * 0.4, w * 1.6, ACC, 0.18 * opts.glow);
  }
  const REST = [], GIANTS = [];
  for (let i = 0; i < 10; i++) REST.push({ x: 70 + i * 52, w: 44, h: 150 + Math.round(150 * H.hash(i, 3)), col: ['#7a86b8', '#8a7fb0', '#6f8fbf', '#9a8cc4'][i % 4] });
  for (let i = 0; i < 7; i++) GIANTS.push({ x: 612 + i * 42, w: 36, h: 380 + Math.round(100 * H.hash(i, 7)), col: '#2a3a78' });
  function skyline(sep, gGlow, restDim, restLit, opts = {}) {
    ctx.save(); const sg = ctx.createLinearGradient(0, 300, 0, GY); sg.addColorStop(0, 'rgba(10,12,30,0.15)'); sg.addColorStop(1, 'rgba(10,12,30,0.55)');
    ctx.fillStyle = sg; ctx.fillRect(0, 0, 1080, GY); ctx.restore();
    REST.forEach((b, i) => {
      ctx.save(); ctx.globalAlpha = 1 - 0.35 * restDim;
      tower(b.x - sep * 6, b.w, b.h, b.col, restLit, 10 + i, { glow: 0 });
      ctx.restore();
      if (opts.restHi) { ctx.fillStyle = H.rgba('#ffffff', 0.08 * opts.restHi); ctx.fillRect(b.x - sep * 6, GY - b.h, b.w, b.h); }
    });
    GIANTS.forEach((b, i) => {
      const bob = gGlow > 0 ? Math.sin(t * 2 + i) * 1.5 : 0;
      tower(b.x + sep * 28, b.w, b.h + (opts.grow || 0) * (20 + 10 * (i % 3)) + bob, b.col, 0.35 + 0.5 * gGlow, 50 + i, { spire: true, glow: gGlow, accentWin: gGlow > 0.3 });
    });
  }
  function walkers(n, speed, y = 1030, scale = 0.62, seed = 0) {
    for (let i = 0; i < n; i++) {
      const dir = i % 2 ? -1 : 1;
      const span = 1180, x0 = H.hash(i, 300 + seed) * span;
      const x = ((x0 + dir * t * speed * (0.8 + 0.4 * H.hash(i, 301))) % span + span) % span - 50;
      K.drawPerson(ctx, x, y, scale, { t, walk: t + i, flip: dir < 0, mood: 'neutral', skin: i % 5, hair: (i + 2) % 5, shirt: i % 5, hairStyle: ['short', 'long', 'bun', 'curly', 'short'][i % 5], seed: 60 + i + seed });
    }
  }
  function panel(cx, cy, w, h, alpha, scale) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy); ctx.scale(scale, scale);
    roundRect(ctx, -w / 2, -h / 2, w, h, 24); ctx.fillStyle = 'rgba(8,10,24,0.93)'; ctx.fill();
    ctx.fillStyle = ACC; roundRect(ctx, -w / 2, -h / 2, 10, h, 5); ctx.fill();
  }
  function quotePanel(cx, cy, k, out, text, by, maxLines = 3) {
    if (k <= 0 || out >= 1) return;
    const W = 830;
    let size = 44, lines; for (; size >= 30; size -= 2) { lines = H.wrap(ctx, '“' + text + '”', 'display', size, W - 80); if (lines.length <= maxLines) break; }
    const lh = size * 1.18, Hh = lines.length * lh + 90;
    panel(cx, cy, W, Hh, 1 - out, Math.min(1.04, k));
    ctx.font = H.font('display', size); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const y0 = -Hh / 2 + 34 + lh / 2;
    lines.forEach((ln, j) => ctx.fillText(ln, 0, y0 + j * lh));
    ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.fillText('— ' + by, 0, Hh / 2 - 30);
    ctx.restore();
  }
  function poly(pts, u) { // partial polyline 0..1
    const n = pts.length - 1, upto = u * n; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i <= n; i++) {
      if (i <= upto) ctx.lineTo(pts[i][0], pts[i][1]);
      else { const f = upto - (i - 1); if (f > 0) ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)); break; }
    }
    ctx.stroke();
    const f = Math.min(n, upto), i0 = Math.min(n - 1, Math.floor(f)), fr = f - i0;
    return [lerp(pts[i0][0], pts[i0 + 1][0], fr), lerp(pts[i0][1], pts[i0 + 1][1], fr)];
  }
  function questionMark(x, y, s, a) {
    ctx.save(); ctx.globalAlpha = a; ctx.font = H.font('display', 64 * s); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    H.glow(ctx, x, y, 50 * s, ACC, 0.4); ctx.fillText('?', x, y); ctx.restore();
  }

  ctx.save();
  if (mode === 'city') {
    const tNote = at(P.noteCue, D * 0.21) - 0.3;
    const tDate = at(P.dateCue, D * 0.48) - 0.2;
    const tAll = at(P.allCue, D * 0.64) - 0.2;
    const tRest = at(P.restCue, D * 0.69) - 0.1;
    const tSplit = at(P.splitCue, D * 0.86) - 0.1;
    const tGiants = at(P.giantsCue, D * 0.92) - 0.2;
    K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 487, y: 800 }, { t: 3.2, zoom: 1.0 }, { t: D, zoom: 1.0 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: GY });
    const sep = H.easeInOutCubic(clamp((t - tSplit) / 0.9));
    const gGlow = clamp((t - tGiants) / 0.6);
    const restHi = clamp((t - tRest) / 0.4) * (1 - sep);
    skyline(sep, gGlow, 0, 0.35, { restHi });
    walkers(5, 40, 1030, 0.62, 0);

    // the note card
    const nk = K.popIn(t, tNote, 0.45), nOut = clamp((t - tAll + 0.5) / 0.4);
    if (nk > 0 && nOut < 1) {
      ctx.save(); ctx.globalAlpha = 1 - nOut; ctx.translate(300, 560 + K.bob(t, 4, 1.2, 0)); ctx.scale(Math.min(1.04, nk), Math.min(1.04, nk)); ctx.rotate(-0.04);
      roundRect(ctx, -170, -130, 340, 250, 16); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      roundRect(ctx, -170, -130, 340, 64, 16); ctx.fillStyle = '#2a2f45'; ctx.fill(); ctx.fillRect(-170, -86, 340, 20);
      ctx.font = H.font('display', 32); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(P.note || 'DAILY NOTE', 0, -96);
      for (let i = 0; i < 4; i++) { ctx.fillStyle = i === 1 ? ACC : '#c9cfe0'; roundRect(ctx, -140, -40 + i * 36, i === 3 ? 160 : 280, 14, 7); ctx.fill(); }
      ctx.restore();
      const p1 = K.popIn(t, tNote + 0.35, 0.4), p2 = K.popIn(t, tNote + 1.4, 0.4), p3 = K.popIn(t, tDate, 0.4);
      ctx.save(); ctx.globalAlpha = 1 - nOut;
      if (p1 > 0) K.drawLabel(ctx, 640, 500, Math.min(1.05, p1), { text: P.author || 'Analyst name', size: 32, accent: true });
      if (p2 > 0) K.drawLabel(ctx, 640, 572, Math.min(1.05, p2), { text: P.role || 'Chief economist, Firm A', size: 26, dot: true });
      if (p3 > 0) K.drawLabel(ctx, 640, 644, Math.min(1.05, p3), { text: P.date || 'This week', size: 26 });
      ctx.restore();
    }
    // "all companies" bracket over every tower, then the split labels
    const ak = K.popIn(t, tAll, 0.45), aOut = clamp((t - tSplit) / 0.35);
    function bracket(x0, x1, y, a, text, accent) {
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = accent ? ACC : '#ffffff'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y + 22); ctx.lineTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1, y + 22); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.globalAlpha = a; K.drawLabel(ctx, (x0 + x1) / 2, y - 8, 1, { text, size: 30, accent }); ctx.restore();
    }
    if (ak > 0 && aOut < 1) bracket(70, 906, 480, Math.min(1, ak) * (1 - aOut), P.allLabel || 'All big companies', false);
    const rk = clamp((t - tSplit - 0.3) / 0.4), gk = clamp((t - tGiants) / 0.4);
    if (rk > 0) bracket(64, 584, 640 - 10 * (1 - rk), rk, P.restLabel || 'Everyone else', false);
    if (gk > 0) bracket(636, 918, 500 - 10 * (1 - gk), gk, P.giantsLabel || 'Tech giants', true);
  }

  else if (mode === 'charts') {
    const tRise = at(P.riseCue, D * 0.04) - 0.1;
    const tRising = at(P.risingCue, D * 0.32);
    const tFlat0 = at(P.restCue, D * 0.46) - 0.2;
    const tFlat = at(P.flatCue, D * 0.62) - 0.2;
    const tProd = at(P.prodCue, D * 0.91) - 1.6;
    K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 487, y: 680 }, { t: D, zoom: 1.0 }]);
    K.world.office(ctx, { t, time: 'dusk' });
    // board
    const BX0 = 72, BX1 = 908, BY0 = 420, BY1 = 830;
    roundRect(ctx, BX0 + 8, BY0 + 10, BX1 - BX0, BY1 - BY0, 18); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    roundRect(ctx, BX0, BY0, BX1 - BX0, BY1 - BY0, 18); ctx.fillStyle = '#1b2140'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#3c4670'; ctx.stroke();
    const panels = P.panels || ['Revenue per worker', 'Profit margins'];
    const riseU = H.easeInOutCubic(clamp((t - tRise) / Math.max(0.8, tRising - tRise + 0.4)));
    const flatU = H.easeInOutCubic(clamp((t - tFlat0) / 1.6));
    [0, 1].forEach((pi) => {
      const x0 = BX0 + 24 + pi * 418, x1 = x0 + 390, y0 = BY0 + 24, y1 = BY1 - 64;
      roundRect(ctx, x0, y0, x1 - x0, y1 - y0, 12); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      ctx.font = H.font('bold', 28); ctx.fillStyle = '#161927'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      let fs = 28; while (fs > 22 && ctx.measureText(panels[pi]).width > x1 - x0 - 36) { fs--; ctx.font = H.font('bold', fs); }
      ctx.fillText(panels[pi], x0 + 18, y0 + 32);
      const ax0 = x0 + 30, ax1 = x1 - 24, ay0 = y0 + 70, ay1 = y1 - 26;
      ctx.strokeStyle = '#9aa3bd'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ax0, ay0); ctx.lineTo(ax0, ay1); ctx.lineTo(ax1, ay1); ctx.stroke();
      ctx.strokeStyle = '#dde1ec'; ctx.lineWidth = 2; for (let g = 1; g < 4; g++) { const gy = lerp(ay1, ay0, g / 4); ctx.beginPath(); ctx.moveTo(ax0 + 4, gy); ctx.lineTo(ax1, gy); ctx.stroke(); }
      const N = 9, rise = [], flat = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N, x = lerp(ax0 + 6, ax1 - 10, u);
        const rv = 0.28 + 0.6 * Math.pow(u, 1.25) + 0.035 * Math.sin(i * 2.1 + pi);
        const fv = 0.24 + 0.025 * Math.sin(i * 1.7 + pi * 2);
        rise.push([x, lerp(ay1, ay0, rv)]); flat.push([x, lerp(ay1, ay0, fv)]);
      }
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (riseU > 0) { ctx.strokeStyle = H.mixHex(ACC, '#000000', 0.15); ctx.lineWidth = 8; const e = poly(rise, riseU); H.glow(ctx, e[0], e[1], 22, ACC, 0.5); ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(e[0], e[1], 8, 0, Math.PI * 2); ctx.fill(); }
      if (flatU > 0) { ctx.strokeStyle = '#7a8299'; ctx.lineWidth = 8; const e = poly(flat, flatU); ctx.fillStyle = '#7a8299'; ctx.beginPath(); ctx.arc(e[0], e[1], 8, 0, Math.PI * 2); ctx.fill(); }
      // series tags
      const rk = K.popIn(t, tRise + 0.6 + pi * 0.15, 0.35), fk = K.popIn(t, tFlat0 + 0.6 + pi * 0.15, 0.35);
      if (rk > 0) { ctx.save(); ctx.translate(ax0 + 90, ay0 + 22); ctx.scale(Math.min(1.05, rk), Math.min(1.05, rk)); roundRect(ctx, -70, -18, 140, 36, 18); ctx.fillStyle = ACC; ctx.fill(); ctx.font = H.font('ui', 22); ctx.fillStyle = '#1b1a10'; ctx.textAlign = 'center'; ctx.fillText(P.giants || 'Tech giants', 0, 1); ctx.restore(); }
      const sk = clamp((t - tFlat - pi * 0.2) / 0.4);
      if (fk > 0) {
        const txt = (P.rest || 'Everyone else') + (sk > 0 ? ': FLAT' : ''), fy = lerp(ay1, ay0, 0.24);
        ctx.save(); ctx.font = H.font('ui', 22); const tw = ctx.measureText(txt).width + 30;
        ctx.translate(ax0 + 22 + tw / 2 + 40, fy + 29); const pk = Math.min(1.05, fk) * (1 + 0.12 * Math.sin(Math.PI * sk));
        ctx.scale(pk, pk); roundRect(ctx, -tw / 2, -18, tw, 36, 18); ctx.fillStyle = sk > 0 ? '#ff6b5e' : '#4a5068'; ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.fillText(txt, 0, 1); ctx.restore();
      }
    });
    ctx.font = H.font('body', 22); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.shapeNote || 'Shapes only, not to scale', 490, BY1 - 30);
    // productivity pill with a stuck gauge
    const pk = K.popIn(t, tProd, 0.45);
    if (pk > 0) {
      ctx.save(); ctx.translate(487, 925); const s = Math.min(1.05, pk); ctx.scale(s, s);
      roundRect(ctx, -300, -46, 600, 92, 46); ctx.fillStyle = 'rgba(8,10,24,0.92)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.save(); ctx.translate(-238, 18); ctx.strokeStyle = '#4a5068'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 34, Math.PI, 0); ctx.stroke();
      const ang = Math.PI * 1.12 + 0.05 * Math.sin(t * 9); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang) * 30, Math.sin(ang) * 30); ctx.stroke(); ctx.restore();
      ctx.font = H.font('ui', 30); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(P.prod || 'Productivity: no AI boost yet', -186, 2);
      ctx.restore();
    }
    // two cartoon office workers
    const flatNow = t > tFlat;
    K.drawPerson(ctx, 120, 1032, 0.85, { t, pose: t > tRise && t < tFlat0 + 1 ? 'point' : 'stand', mood: flatNow ? 'worried' : 'neutral', skin: 1, hair: 3, shirt: '#6f86e0', hairStyle: 'short', seed: 11, look: 1, talk: 0 });
    K.drawPerson(ctx, 860, 1032, 0.85, { t, pose: flatNow ? 'shrug' : 'stand', mood: flatNow ? 'worried' : 'neutral', skin: 3, hair: 0, shirt: '#e8786a', hairStyle: 'bun', seed: 12, look: -1, flip: true });
  }

  else if (mode === 'cost') {
    const tPay = at(P.payCue, D * 0.16) - 0.8;
    const tQuote = at(P.quoteCue, D * 0.33) - 0.4;
    const tZero = at(P.zeroCue, D * 0.36) - 0.15;
    const tBin = at(P.binCue, D * 0.71) - 0.2;
    const tCost = at(P.costCue, D * 0.95);
    K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 780 }, { t: D, zoom: 1.0 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: GY });
    // company tower (left) and the AI tools building (right)
    K.drawBuilding(ctx, 250, 1010, 0.6, { t, color: '#5b6aa8', floors: 8, lit: 0.5 });
    K.drawLabel(ctx, 250, 735, 1, { text: P.company || 'Typical company', size: 24, dot: true });
    K.drawDataCenter(ctx, 735, 1010, 0.92, { t, activity: 0.8 });
    K.drawLabel(ctx, 735, 800, 1, { text: P.ai || 'AI tools', size: 24, accent: true });
    // coins flow out
    const pts = K.bezier(320, 820, 440, 690, 590, 700, 690, 850, 40);
    const flowOn = t > tPay, flowOff = tBin + 1.5;
    if (flowOn) for (let i = 0; i < 6; i++) {
      const u = ((t - tPay) * 0.55 + i / 6) % 1, tEmit = tPay + (i / 6) / 0.55 * 0;
      void tEmit;
      if (t > flowOff && u > ((t - flowOff) * 0.55)) continue;
      const fade = Math.sin(u * Math.PI);
      const p = K.pathPoint(pts, u);
      ctx.save(); ctx.globalAlpha = fade; K.drawCoin(ctx, p[0], p[1] + 30, 0.6, { spin: t * 6 + i }); ctx.restore();
    }
    // return path: dashed, empty
    const rp = K.bezier(660, 960, 580, 1000, 420, 1000, 340, 960, 30);
    const rk = clamp((t - tPay - 1.2) / 1.0);
    if (rk > 0) {
      ctx.save(); ctx.setLineDash([14, 14]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = H.rgba('#ffffff', 0.55); ctx.lineWidth = 5; K.pathDraw(ctx, rp, rk); ctx.restore();
    }
    const zk = K.popIn(t, tZero, 0.5);
    if (zk > 0) {
      ctx.save(); ctx.translate(500, 905); const s = Math.min(1.08, zk); ctx.scale(s, s);
      roundRect(ctx, -150, -40, 300, 80, 40); ctx.fillStyle = 'rgba(8,10,24,0.94)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.font = H.font('display', 34); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.zero || 'Payoff: zero', 0, 2);
      ctx.restore();
    }
    // worker by the tower, worried at "zero"
    K.drawPerson(ctx, 105, 1032, 0.8, { t, pose: t > tZero ? 'shrug' : 'phone', mood: t > tZero ? 'worried' : 'neutral', skin: 2, hair: 1, shirt: '#4fb3a6', hairStyle: 'long', seed: 21, look: 1 });
    // quote panel
    quotePanel(487, 520, K.popIn(t, tQuote, 0.45), clamp((t - tBin) / 0.35), P.quote || 'Quote goes here', P.by || 'Speaker, Firm A', 2);
    // GROWTH jar crossed + COST bin catches the receipt
    const bk = K.popIn(t, tBin + 0.2, 0.45);
    if (bk > 0) {
      const s = Math.min(1.05, bk);
      // growth jar
      ctx.save(); ctx.translate(290, 580); ctx.scale(s, s);
      roundRect(ctx, -80, -110, 160, 150, 26); ctx.fillStyle = 'rgba(180,220,255,0.16)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(220,235,255,0.7)'; ctx.stroke();
      roundRect(ctx, -60, -128, 120, 22, 8); ctx.fillStyle = '#8d9ab4'; ctx.fill();
      ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.growth || 'Growth', 0, 72);
      ctx.restore();
      const xk = clamp((t - tBin - 0.9) / 0.4);
      if (xk > 0) { ctx.save(); ctx.translate(290, 545); ctx.strokeStyle = '#ff6b5e'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-50, -50); ctx.lineTo(-50 + 100 * xk, -50 + 100 * xk); if (xk > 0.5) { const k2 = (xk - 0.5) * 2; ctx.moveTo(50, -50); ctx.lineTo(50 - 100 * k2, -50 + 100 * k2); } ctx.stroke(); ctx.restore(); }
      // cost bin
      const lit = clamp((t - tCost + 0.3) / 0.3);
      ctx.save(); ctx.translate(690, 580); ctx.scale(s, s);
      ctx.beginPath(); ctx.moveTo(-90, -100); ctx.lineTo(90, -100); ctx.lineTo(72, 40); ctx.lineTo(-72, 40); ctx.closePath(); ctx.fillStyle = H.mixHex('#4a5068', ACC, 0.6 * lit); ctx.fill();
      roundRect(ctx, -100, -112, 200, 22, 8); ctx.fillStyle = '#6b7390'; ctx.fill();
      if (lit > 0) H.glow(ctx, 0, -40, 130, ACC, 0.3 * lit);
      ctx.font = H.font('display', 34); ctx.fillStyle = lit > 0.5 ? '#1b1a10' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.cost || 'COST', 0, -30);
      ctx.restore();
      // receipt flies from the AI building into the bin
      const fk = clamp((t - (tCost - 1.4)) / 1.1);
      if (fk > 0) {
        const e = H.easeInOutCubic(fk), x = lerp(735, 690, e), y = lerp(860, 520, e) - Math.sin(e * Math.PI) * 140;
        if (fk < 1) {
          ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(e * 6) * 0.3);
          roundRect(ctx, -70, -46, 140, 92, 8); ctx.fillStyle = '#f2f4fa'; ctx.fill();
          ctx.font = H.font('ui', 20); ctx.fillStyle = '#161927'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.receipt || 'AI spending', 0, -16);
          ctx.fillStyle = '#c9cfe0'; ctx.fillRect(-50, 6, 100, 8); ctx.fillRect(-50, 22, 64, 8);
          ctx.restore();
        } else {
          ctx.save(); ctx.translate(690, 470); K.drawLabel(ctx, 0, 0, Math.min(1.05, K.popIn(t, tCost - 0.3 + 1.1 - 1.1, 0.4)), { text: P.receipt || 'AI spending', size: 22 }); ctx.restore();
        }
      }
    }
  }

  else if (mode === 'judgment') {
    const tQuote = at(P.quoteCue, D * 0.06) - 0.4;
    const tCalc = at(P.calcCue, D * 0.19) - 0.3;
    const tJudge = at(P.judgeCue, D * 0.48) - 0.2;
    const chipsTxt = P.chips || ['Trust', 'Accountability', 'Unwritten rules'];
    const cueW = P.chipCues || [];
    const tChip = chipsTxt.map((c, i) => at(cueW[i], D * (0.61 + 0.06 * i)) - 0.15);
    const tMiss = at(P.missCue, D * 0.92) - 0.4;
    K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 487, y: 760 }, { t: D, zoom: 1.0 }]);
    K.world.office(ctx, { t, time: 'day' });
    // calculator (left)
    const CX = 330, CY = 1030;
    K.shadow(ctx, CX, CY, 200);
    ctx.save(); ctx.translate(CX, CY); ctx.rotate(-0.04);
    roundRect(ctx, -85, -250, 170, 250, 22); ctx.fillStyle = '#39405e'; ctx.fill();
    roundRect(ctx, -70, -232, 140, 56, 10); ctx.fillStyle = '#c9e3b0'; ctx.fill();
    const racing = t > tCalc ? Math.floor(H.hash(Math.floor(t * 14), 5) * 99999999) : 0;
    ctx.font = H.font('condensed', 34); ctx.fillStyle = '#1b2a14'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(String(racing), 60, -203);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
      const press = t > tCalc && H.hash(Math.floor(t * 10), r * 4 + c) > 0.8;
      roundRect(ctx, -66 + c * 34, -160 + r * 38 + (press ? 3 : 0), 28, 30, 7); ctx.fillStyle = c === 3 ? ACC : press ? '#8d97b8' : '#5d6584'; ctx.fill();
    }
    ctx.restore();
    // flying digits out of the calculator
    if (t > tCalc) for (let i = 0; i < 6; i++) {
      const u = ((t - tCalc) * 0.7 + i / 6) % 1;
      ctx.save(); ctx.globalAlpha = Math.sin(u * Math.PI) * 0.9; ctx.font = H.font('display', 30); ctx.fillStyle = ACC; ctx.textAlign = 'center';
      ctx.fillText(String(Math.floor(H.hash(i, Math.floor((t - tCalc) * 0.7 + i / 6)) * 10)), CX - 60 + i * 24, 770 - u * 90); ctx.restore();
    }
    const missed = t > tMiss;
    K.drawRobot(ctx, 150, 1032, 1.05, { t, state: missed ? 'thinking' : t > tCalc ? 'working' : 'idle', seed: 3 });
    const ck = K.popIn(t, tCalc + 0.2, 0.4);
    if (ck > 0) K.drawLabel(ctx, 240, 728, Math.min(1.05, ck), { text: P.calc || 'Great calculator', size: 26, dot: true });
    // manager (right) weighing two option cards
    const jk = clamp((t - tJudge) / 0.4);
    const tilt = Math.sin(t * 1.6) * 0.18 * (1 - jk * 0.6);
    ctx.save(); ctx.translate(760, 700);
    ctx.strokeStyle = '#c9cfe0'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 40); ctx.stroke();
    ctx.save(); ctx.rotate(tilt);
    ctx.beginPath(); ctx.moveTo(-95, 0); ctx.lineTo(95, 0); ctx.stroke();
    [-1, 1].forEach((sd) => { ctx.save(); ctx.translate(sd * 95, 0); ctx.rotate(-tilt); roundRect(ctx, -34, 4, 68, 46, 8); ctx.fillStyle = sd < 0 ? '#f2f4fa' : H.mixHex('#f2f4fa', ACC, 0.5); ctx.fill(); ctx.font = H.font('display', 26); ctx.fillStyle = '#161927'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(sd < 0 ? 'A' : 'B', 0, 28); ctx.restore(); });
    ctx.restore(); ctx.restore();
    K.drawPerson(ctx, 760, 1032, 1.0, { t, pose: jk > 0 ? 'point' : 'stand', mood: jk > 0 ? 'happy' : 'neutral', skin: 4, hair: 2, shirt: '#a08be0', hairStyle: 'short', seed: 31, look: -0.4 });
    if (jk > 0) { K.drawLightbulb(ctx, 880, 760, 0.55, { on: jk, t }); }
    const lk = K.popIn(t, tJudge + 0.1, 0.4);
    if (lk > 0) K.drawLabel(ctx, 760, 640, Math.min(1.05, lk), { text: P.judge || 'Judgment', size: 30, accent: true });
    // quote panel, then the chips
    const qOut = clamp((t - tChip[0] + 0.35) / 0.3);
    quotePanel(487, 500, K.popIn(t, tQuote, 0.45), qOut, P.quote || 'Quote goes here', P.by || 'Speaker, Firm A', 3);
    const CH = [{ x: 210, y: 470 }, { x: 487, y: 530 }, { x: 760, y: 470 }];
    chipsTxt.forEach((c, i) => {
      const k = K.popIn(t, tChip[i], 0.4); if (k <= 0) return;
      const p = CH[i];
      // links: solid to the manager, dashed + broken to the robot
      ctx.save(); ctx.globalAlpha = clamp((t - tChip[i] - 0.2) / 0.3);
      ctx.strokeStyle = H.rgba(ACC, 0.8); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(760, 600); ctx.stroke();
      if (missed) {
        const mk = clamp((t - tMiss) / 0.4);
        ctx.setLineDash([10, 12]); ctx.strokeStyle = H.rgba('#ff6b5e', 0.85 * mk); ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(lerp(p.x, 150, 0.55), lerp(p.y, 790, 0.55)); ctx.stroke();
      }
      ctx.restore();
      K.drawLabel(ctx, p.x, p.y + 24, Math.min(1.05, k), { text: c, size: 30, dot: true });
    });
    if (missed) {
      const mk = K.popIn(t, tMiss + 0.2, 0.45);
      questionMark(150, 760 + K.bob(t, 5, 1.6, 0), Math.min(1.1, mk), clamp(mk));
    }
  }

  else if (mode === 'caveat') {
    const tNote = at(P.noteCue, D * 0.26) - 0.6;
    const tCharts = at(P.chartsCue, D * 0.38) - 0.3;
    const tHide = at(P.hideCue, D * 0.6) - 0.5;
    const tLater = at(P.laterCue, D * 0.92) - 1.0;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 800 }]);
    K.world.city(ctx, { t, time: 'night', groundY: GY });
    const B = [{ x: 80, w: 150, h: 300 }, { x: 250, w: 130, h: 250 }, { x: 400, w: 170, h: 320 }, { x: 590, w: 140, h: 270 }, { x: 750, w: 160, h: 300 }];
    const hot = [2, 4];
    const hk = clamp((t - tHide - 0.6) / 0.5);
    B.forEach((b, i) => {
      tower(b.x, b.w, b.h, ['#4a5a8c', '#566489', '#5b6aa8', '#62709c', '#4a5a8c'][i], 0.3, 200 + i, {});
      if (hot.includes(i) && hk > 0) {
        for (let k = 0; k < 4; k++) {
          const wx = b.x + 18 + (k % 2) * 48 + i * 0, wy = GY - b.h + 50 + Math.floor(k / 2) * 54;
          H.glow(ctx, wx + 7, wy + 9, 40, ACC, 0.7 * hk); ctx.fillStyle = H.rgba(ACC, hk); ctx.fillRect(wx, wy, 16, 20);
        }
      }
    });
    walkers(4, 30, 1030, 0.6, 7);
    // magnifier sweeps the towers
    const mU = clamp((t - tHide) / 2.0);
    if (t > tHide - 0.3) {
      const mx = lerp(150, 830, H.easeInOutCubic(mU)), my = 800 + Math.sin(mU * Math.PI * 2) * 30;
      ctx.save(); ctx.translate(mx, my);
      ctx.strokeStyle = '#c9cfe0'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(44, 44); ctx.lineTo(96, 96); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 60, 0, Math.PI * 2); ctx.fillStyle = 'rgba(180,220,255,0.16)'; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = '#c9cfe0'; ctx.stroke();
      ctx.restore();
    }
    // pills
    const n1 = K.popIn(t, tNote, 0.4), n2 = K.popIn(t, tCharts, 0.4), n3 = K.popIn(t, tHide + 0.8, 0.4), n4 = K.popIn(t, tLater, 0.4);
    if (n1 > 0) K.drawLabel(ctx, 487, 480, Math.min(1.05, n1), { text: P.note || 'One analyst’s note', size: 32, accent: true });
    if (n2 > 0) K.drawLabel(ctx, 487, 548, Math.min(1.05, n2), { text: P.charts || 'Based on charts', size: 26, dot: true });
    if (n3 > 0) K.drawLabel(ctx, 487, 618, Math.min(1.05, n3), { text: P.hidden || 'Gains inside single firms?', size: 28, dot: true });
    if (n4 > 0) {
      K.drawLabel(ctx, 487, 688, Math.min(1.05, n4), { text: P.later || 'Or later?', size: 28, dot: true });
      // hourglass beside it
      ctx.save(); ctx.translate(640, 664); ctx.scale(Math.min(1.05, n4), Math.min(1.05, n4)); ctx.rotate(Math.sin(t * 2) * 0.1);
      ctx.fillStyle = '#f2f4fa'; ctx.beginPath(); ctx.moveTo(-16, -24); ctx.lineTo(16, -24); ctx.lineTo(0, 0); ctx.lineTo(16, 24); ctx.lineTo(-16, 24); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
      const sand = (t * 0.4) % 1; ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(-10 * (1 - sand), -18 + 14 * sand); ctx.lineTo(10 * (1 - sand), -18 + 14 * sand); ctx.lineTo(0, -2); ctx.closePath(); ctx.fill();
      ctx.fillRect(-2, -2, 4, 24 * sand); ctx.restore();
    }
  }

  else if (mode === 'payoff') {
    const tClimb = at(P.climbCue, D * 0.18) - 0.5;
    const tWait = at(P.waitCue, D * 0.41) - 0.4;
    const tQ = at(P.qCue, D * 0.55) - 0.3;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 760 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: GY });
    const grow = H.easeInOutCubic(clamp((t - tClimb) / 1.2));
    skyline(1, 1, clamp((t - tWait) / 0.6) * 0.6, 0.3, { grow });
    // up arrows over the giants
    if (grow > 0) GIANTS.forEach((b, i) => {
      const u = ((t - tClimb) * 0.8 + i * 0.17) % 1, x = b.x + 28 + b.w / 2, y = GY - b.h - 40 - u * 70;
      ctx.save(); ctx.globalAlpha = Math.sin(u * Math.PI) * clamp(grow * 2); ctx.fillStyle = ACC;
      ctx.beginPath(); ctx.moveTo(x, y - 18); ctx.lineTo(x + 13, y); ctx.lineTo(x + 5, y); ctx.lineTo(x + 5, y + 16); ctx.lineTo(x - 5, y + 16); ctx.lineTo(x - 5, y); ctx.lineTo(x - 13, y); ctx.closePath(); ctx.fill(); ctx.restore();
    });
    // waiting workers in front of the rest with clocks
    const wk = clamp((t - tWait) / 0.5);
    [110, 250, 390, 530].forEach((x, i) => {
      K.drawPerson(ctx, x, 1032, 0.72, { t, pose: wk > 0 && i % 2 ? 'shrug' : 'stand', mood: wk > 0 ? 'worried' : 'neutral', skin: (i + 1) % 5, hair: i % 5, shirt: i % 5, hairStyle: ['short', 'curly', 'long', 'bun'][i], seed: 80 + i, look: 1 });
      if (wk > 0 && i % 2 === 0) { ctx.save(); ctx.globalAlpha = wk; K.drawClock(ctx, x + 10, 820 + K.bob(t, 3, 1.5, i), 0.42, { t, speed: 3 }); ctx.restore(); }
    });
    // question card + chips
    const ak = K.popIn(t, tQ, 0.45);
    if (ak > 0) {
      ctx.save(); ctx.fillStyle = H.rgba('#05060f', 0.35 * clamp(ak)); ctx.fillRect(0, 400, 1080, 300); ctx.restore();
      ctx.save(); ctx.translate(487, 500); const s = Math.min(1.05, ak); ctx.scale(s, s);
      const Wq = 830, Hq = 160;
      roundRect(ctx, -Wq / 2, -Hq / 2, Wq, Hq, 28); ctx.fillStyle = 'rgba(8,10,24,0.95)'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = ACC; roundRect(ctx, -Wq / 2, -Hq / 2, Wq, Hq, 28); ctx.stroke();
      let size = 50, lines; for (; size >= 30; size -= 2) { lines = H.wrap(ctx, P.question || 'Will AI pay off outside tech?', 'display', size, Wq - 70); if (lines.length <= 2) break; }
      ctx.font = H.font('display', size); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lh = size * 1.15, y0 = 2 - ((lines.length - 1) * lh) / 2;
      lines.forEach((ln, j) => ctx.fillText(ln, 0, y0 + j * lh));
      ctx.restore();
      const c1 = K.popIn(t, tQ + 0.5, 0.4), c2 = K.popIn(t, tQ + 0.8, 0.4);
      if (c1 > 0) K.drawLabel(ctx, 265, 660 + K.bob(t, 3, 1.4, 0), Math.min(1.05, c1), { text: P.a || 'Pays off later', size: 32, dot: true });
      if (c2 > 0) K.drawLabel(ctx, 710, 660 + K.bob(t, 3, 1.4, 1.5), Math.min(1.05, c2), { text: P.b || 'Stays a cost', size: 32, dot: true });
    }
  }
  ctx.restore();
}
