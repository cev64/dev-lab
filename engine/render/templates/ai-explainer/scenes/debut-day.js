// Scene "debut-day" (full frame). A night stock-exchange hall on a listing day. A big quote board shows the new
// stock's ticker pill, a price readout and an intraday line chart against a dashed "IPO price" line; the kit robot
// (the company stand-in, text pill only, no logo) rings a brass opening bell on the floor; generic cartoon traders
// watch the board. modes:
//   hook   (cold open, ~3.5 s; action from frame 0): bell ringing, confetti already flying, the line rockets up to the
//          open and peaks (green), then turns red and slides; traders go from cheering to shocked; a red pill drops.
//   open   (~20 s, span 2): a price tag pops with the sale price (priceCue); the header flips to the exchange
//          (exchangeCue) as the robot rings the bell; the readout flips to the first trade with an up chip (tradeCue)
//          and confetti; then the board flips to a facts page: value at the open (valueCue), money raised (raisedCue)
//          and a RECORD stamp (recordCue).
//   close  (~11 s): the line slides from the peak to the close (closeCue), readout counts down, "+x% vs IPO" chip
//          (stillCue); then the chart shrinks and index rows drop in with red arrows (rows [{name, value, cue}]).
//   caveat (~7 s): the full day's chart, worry bubbles over the traders, a "worry" pill (worryCue), then a calendar
//          page "DAY 1" lands (dayCue).
// params: mode, ticker ("ABC"), exchange ("EXCHANGE"), ipo (83), open (111.5), close (97.17), openChip ("+34%"),
//         stillChip ("+17% vs $83"), value, valueLabel, raised, raisedLabel, record, rows, hookPill, worry, day, daySub,
//         cues: priceCue, exchangeCue, tradeCue, valueCue, raisedCue, recordCue, closeCue, stillCue, worryCue, dayCue
// Cues are narration words ("word#n" = the (n+1)th time in the scene) or seconds; else fractions of the scene.
// Fits: any IPO / listing-day / "stock popped then dropped" story.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const at = (w, d) => {
    if (w == null || w === '') return d;
    if (typeof w === 'number') return w;
    const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? d : v;
  };
  const mode = P.mode || 'hook';
  const FLOOR = 1010;
  const S = { H, K, P, D, ACC, at, t, info, FLOOR, RED: '#ff5d5d', GOLD: '#ffd34d' };

  ctx.save();
  if (mode === 'hook') K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 487, y: 700 }, { t: D, zoom: 1.0, x: 487, y: 720 }]);
  else if (mode === 'open') K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 700 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 487, y: 720 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  hall(ctx, S);

  if (mode === 'hook') hook(ctx, S);
  else if (mode === 'open') openMode(ctx, S);
  else if (mode === 'close') closeMode(ctx, S);
  else caveat(ctx, S);
  ctx.restore();
}

// ------------------------------------------------------------------ price path (u = 0..1 of the trading day)
const KEYS = [[0, 83], [0.1, 83], [0.13, 111.5], [0.2, 113.2], [0.27, 114.4], [0.34, 110.6], [0.45, 108.4],
  [0.58, 103.8], [0.7, 101.6], [0.82, 99.2], [0.92, 98.4], [1, 97.17]];
const PEAK_U = 0.27, OPEN_U = 0.13;
function priceAt(u) {
  u = Math.max(0, Math.min(1, u));
  for (let i = 1; i < KEYS.length; i++) {
    const [u1, p1] = KEYS[i];
    if (u <= u1) {
      const [u0, p0] = KEYS[i - 1]; const k = (u - u0) / (u1 - u0 || 1);
      const base = p0 + (p1 - p0) * k;
      const wig = u > OPEN_U && u < 0.99 ? Math.sin(u * 61) * 0.9 + Math.sin(u * 23 + 1) * 0.7 : 0;
      return base + wig * Math.sin(k * Math.PI);
    }
  }
  return KEYS[KEYS.length - 1][1];
}

// ------------------------------------------------------------------ setting
function hall(ctx, S) {
  const { H, t, FLOOR } = S, { rgba } = H;
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#111633'); g.addColorStop(0.45, '#1b2250'); g.addColorStop(1, '#0a0e20');
  ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, 2320);
  for (const cx of [30, 1050]) {
    ctx.fillStyle = '#262d5c'; ctx.fillRect(cx - 50, -200, 100, FLOOR + 200);
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(cx - 50, -200, 18, FLOOR + 200);
  }
  // ticker strip (abstract bars, no real symbols)
  ctx.fillStyle = '#0a0d1f'; ctx.fillRect(-200, 300, 1480, 50);
  ctx.save(); ctx.beginPath(); ctx.rect(-200, 300, 1480, 50); ctx.clip();
  const off = (t * 80) % 180;
  for (let i = -2; i < 9; i++) {
    const x = i * 180 - off;
    ctx.fillStyle = rgba('#9fb0ff', 0.3); ctx.fillRect(x + 14, 317, 60, 14);
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(x + 90, 317, 50, 14);
  }
  ctx.restore();
  const fg = ctx.createLinearGradient(0, FLOOR, 0, 1920);
  fg.addColorStop(0, '#2a2238'); fg.addColorStop(1, '#0f0c18');
  ctx.fillStyle = fg; ctx.fillRect(-200, FLOOR, 1480, 1200);
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(-200, FLOOR, 1480, 4);
  ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 2;
  for (let i = -8; i < 16; i++) { ctx.beginPath(); ctx.moveTo(540 + i * 45, FLOOR + 4); ctx.lineTo(540 + i * 150, 1920); ctx.stroke(); }
}

// board frame; returns geometry
const BX = 100, BY = 410, BW = 775, BH = 410;
function boardFrame(ctx, S, glowCol) {
  const { H, K, t } = S;
  H.roundRect(ctx, BX - 14, BY - 14, BW + 28, BH + 28, 22); ctx.fillStyle = '#05060f'; ctx.fill();
  H.roundRect(ctx, BX, BY, BW, BH, 14); ctx.fillStyle = '#0d1126'; ctx.fill();
  ctx.save(); H.roundRect(ctx, BX, BY, BW, BH, 14); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.022)'; for (let y = BY; y < BY + BH; y += 6) ctx.fillRect(BX, y, BW, 2);
  ctx.restore();
  if (glowCol) K.glow(ctx, BX + BW / 2, BY + BH / 2, 430, glowCol, 0.05 + 0.03 * Math.sin(t * 2.2));
}

// header: ticker pill + exchange text (flip) on the left, price readout on the right
function header(ctx, S, o) {
  const { H, K, P, ACC, RED } = S;
  ctx.save(); ctx.textBaseline = 'middle';
  const tk = String(P.ticker || 'ABC');
  ctx.font = K.font.display(34); const tw = ctx.measureText(tk).width + 40;
  H.roundRect(ctx, BX + 28, BY + 26, tw, 56, 14); ctx.fillStyle = ACC; ctx.fill();
  ctx.fillStyle = '#10131f'; ctx.textAlign = 'center'; ctx.fillText(tk, BX + 28 + tw / 2, BY + 56);
  // exchange text flips in
  const f = o.exFlip == null ? 1 : o.exFlip;
  if (f > 0) {
    ctx.save(); ctx.translate(BX + 28 + tw + 20, BY + 55); ctx.scale(1, 0.1 + 0.9 * Math.min(1, f));
    ctx.textAlign = 'left'; ctx.font = K.font.ui(30); ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.globalAlpha = Math.min(1, f * 1.5);
    ctx.fillText(o.exText || String(P.exchange || 'EXCHANGE'), 0, 0); ctx.restore();
  }
  // price readout
  if (o.price != null) {
    const col = o.priceCol || '#ffffff';
    ctx.textAlign = 'right'; ctx.font = K.font.display(62); ctx.fillStyle = col;
    const sx = o.priceFlip == null ? 1 : Math.abs(1 - 2 * o.priceFlip) * 0.9 + 0.1;
    ctx.save(); ctx.translate(BX + BW - 30, BY + 58); ctx.scale(1, sx);
    ctx.fillText('$' + o.price.toFixed(2), 0, 0); ctx.restore();
    if (o.priceLabel) { ctx.font = K.font.ui(24); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText(o.priceLabel, BX + BW - 32, BY + 108); }
  }
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(BX + 28, BY + 128, BW - 56, 3);
  ctx.restore();
}

// chart of the price path from u=0 to u=prog inside box
function chart(ctx, S, prog, box, o = {}) {
  const { H, K, ACC, RED } = S;
  const [x0, y0, x1, y1] = box, lo = 78, hi = 120;
  const X = (u) => x0 + u * (x1 - x0), Y = (p) => y1 - (p - lo) / (hi - lo) * (y1 - y0);
  // IPO price dashed line
  ctx.save(); ctx.setLineDash([12, 10]); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(x0, Y(83)); ctx.lineTo(x1, Y(83)); ctx.stroke(); ctx.restore();
  ctx.font = K.font.ui(24); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.textAlign = o.ipoRight ? 'right' : 'left'; ctx.textBaseline = 'top';
  ctx.fillText(o.ipoLabel || 'IPO price $83', o.ipoRight ? x1 - 4 : x0 + 4, Y(83) + 8);
  if (prog <= 0) return { X, Y };
  const n = 140, pts = [];
  for (let i = 0; i <= n; i++) { const u = prog * i / n; pts.push([X(u), Y(priceAt(u))]); }
  // split color: green up to the peak, red after
  const drawPart = (from, to, col, w) => {
    if (to <= from) return;
    ctx.beginPath();
    for (let i = from; i <= to; i++) { const p = pts[i]; if (i === from) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); }
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke();
  };
  const peakI = Math.min(n, Math.round(n * Math.min(1, PEAK_U / prog)));
  // pre-open flat segment dashed-ish faint
  drawPart(0, peakI, ACC, 9);
  drawPart(peakI, n, RED, 9);
  const end = pts[n];
  const col = prog > PEAK_U ? RED : ACC;
  K.glow(ctx, end[0], end[1], 40, col, 0.6);
  ctx.beginPath(); ctx.arc(end[0], end[1], 11, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
  return { X, Y, end };
}

function chip(ctx, S, x, y, text, col, pop, ink = '#10131f') {
  const { H, K } = S;
  if (pop <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop);
  ctx.font = K.font.display(34); const w = ctx.measureText(text).width + 40;
  H.roundRect(ctx, -w / 2, -30, w, 60, 30); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 2);
  ctx.restore();
}

// opening bell on a stand + the robot (company stand-in) ringing it
function bellAndRobot(ctx, S, ringAt, o = {}) {
  const { H, K, t, ACC, FLOOR } = S;
  const bx = o.x || 640, sy = FLOOR;
  const age = t - ringAt, ringing = age > 0 && age < 2.4;
  const swing = ringing ? Math.sin(age * 22) * 0.35 * Math.max(0, 1 - age / 2.4) : 0;
  K.shadow(ctx, bx, sy, 150);
  ctx.fillStyle = '#3a2f55'; H.roundRect(ctx, bx - 70, sy - 26, 140, 26, 8); ctx.fill();
  ctx.fillStyle = '#4a3d6b'; ctx.fillRect(bx - 8, sy - 150, 16, 126);
  ctx.save(); ctx.translate(bx, sy - 160); ctx.rotate(swing);
  ctx.beginPath(); ctx.moveTo(-48, 70); ctx.quadraticCurveTo(-46, 0, 0, -6); ctx.quadraticCurveTo(46, 0, 48, 70); ctx.closePath();
  const bg = ctx.createLinearGradient(-48, 0, 48, 0); bg.addColorStop(0, '#c9962e'); bg.addColorStop(0.45, '#ffd76a'); bg.addColorStop(1, '#a8761c');
  ctx.fillStyle = bg; ctx.fill();
  ctx.fillStyle = '#8a5f14'; H.roundRect(ctx, -54, 64, 108, 12, 6); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 84, 9, 0, Math.PI * 2); ctx.fillStyle = '#7a5310'; ctx.fill();
  ctx.restore();
  if (ringing) {
    for (let k = 0; k < 3; k++) {
      const r = ((age * 1.6 + k / 3) % 1);
      ctx.strokeStyle = H.rgba(ACC, 0.7 * (1 - r)); ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(bx, sy - 130, 60 + r * 90, -Math.PI * 0.85, -Math.PI * 0.15); ctx.stroke();
    }
  }
  // robot to the right, arm reaching (state working while ringing)
  const rx = o.rx || 805;
  K.drawRobot(ctx, rx, FLOOR + 2, 0.95, { t, state: ringing ? 'working' : (o.state || 'idle'), talk: 0, flip: true, seed: 3 });
  if (o.pill !== false) K.drawLabel(ctx, rx, FLOOR - 228, 1, { text: o.pillText || 'THE COMPANY', size: 22 });
}

function traders(ctx, S, mood, opts = {}) {
  const { K, t, FLOOR } = S;
  const crowd = [
    { x: 165, skin: 0, hair: 1, shirt: 0, hs: 'short' },
    { x: 330, skin: 2, hair: 0, shirt: 4, hs: 'long' },
    { x: 480, skin: 4, hair: 4, shirt: 1, hs: 'curly' },
  ];
  crowd.forEach((c, i) => {
    const m = typeof mood === 'function' ? mood(i) : mood;
    const pose = m === 'cheer' ? 'cheer' : (m === 'shocked' && i === 1 ? 'shrug' : (m === 'point' ? 'point' : 'stand'));
    const md = m === 'cheer' ? 'happy' : (m === 'shocked' ? 'shocked' : (m === 'worried' ? 'worried' : 'neutral'));
    K.drawPerson(ctx, c.x, FLOOR + 4, 0.86, { t, pose, mood: md, look: 0.3, skin: c.skin, hair: c.hair, shirt: c.shirt, hairStyle: c.hs, seed: i * 7 + 1 });
  });
}

function confetti(ctx, S, burstAt, n = 70) {
  const { H, t, ACC } = S;
  const age = t - burstAt;
  if (age < 0 || age > 4) return;
  const cols = [ACC, '#ffffff', '#7fd4ff', '#ffd34d', '#ff8fd1'];
  for (let i = 0; i < n; i++) {
    const hx = H.hash(i, 1), hy = H.hash(i, 2), hv = H.hash(i, 3);
    const x = 80 + hx * 820 + Math.sin(age * 3 + i) * 24;
    const vy0 = -500 - hv * 500;
    const y = 640 + hy * 120 + vy0 * age + 520 * age * age;
    if (y > 1040) continue;
    ctx.save(); ctx.globalAlpha = Math.max(0, 1 - age / 4);
    ctx.translate(x, y); ctx.rotate(age * (4 + hv * 6) + i);
    ctx.fillStyle = cols[i % cols.length]; ctx.fillRect(-9, -5, 18, 10); ctx.restore();
  }
}

// ------------------------------------------------------------------ modes
function hook(ctx, S) {
  const { H, K, P, t, ACC, RED } = S;
  const prog = Math.min(1, 0.16 + t * 0.27);           // peak (u 0.27) at ~0.4 s, keeps sliding to the end
  const dropAt = S.at(P.dropCue || 'then', 1.9);
  boardFrame(ctx, S, prog > PEAK_U ? RED : ACC);
  const price = priceAt(prog);
  header(ctx, S, { price, priceCol: prog > PEAK_U + 0.03 ? RED : ACC, exFlip: 1 });
  chart(ctx, S, prog, [BX + 40, BY + 160, BX + BW - 40, BY + BH - 30]);
  bellAndRobot(ctx, S, -0.4, { state: t > dropAt ? 'thinking' : 'happy' });
  traders(ctx, S, (i) => (t < dropAt ? 'cheer' : (t > dropAt + 0.15 * i ? 'shocked' : 'cheer')));
  confetti(ctx, S, -0.6, 80);
  chip(ctx, S, 487, 360, String(P.hookPill || 'RECORD IPO'), ACC, K.popIn(t, 0.0, 0.35));
  const dp = K.popIn(t, dropAt + 0.15, 0.4);
  if (dp > 0) {
    ctx.save(); ctx.translate(BX + BW / 2, BY + BH - 70); ctx.scale(dp, dp);
    chip(ctx, S, 0, 0, String(P.dropPill || 'AI STOCKS  ▼'), RED, 1, '#ffffff');
    ctx.restore();
  }
}

function openMode(ctx, S) {
  const { H, K, P, D, t, ACC, RED, GOLD, FLOOR } = S;
  const priceAt0 = S.at(P.priceCue || '$83', D * 0.2);
  const exAt = S.at(P.exchangeCue || 'nasdaq', D * 0.35);
  const tradeAt = S.at(P.tradeCue || 'hundred', D * 0.45);
  const valueAt = S.at(P.valueCue || 'trillion', D * 0.6);
  const raisedAt = S.at(P.raisedCue || 'billion', D * 0.75);
  const recordAt = S.at(P.recordCue || 'record', D * 0.9);
  const pageAt = valueAt - 1.0;                       // board flips to the facts page
  const ringAt = exAt - 0.6;
  const page = K.phase(t, pageAt - 0.2, pageAt + 0.2);

  boardFrame(ctx, S, t > tradeAt ? ACC : null);
  if (page < 0.5) {
    // page 1: ticker, price, chart
    const sq = page > 0 ? 1 - page * 2 : 1;
    ctx.save(); ctx.translate(0, BY + BH / 2); ctx.scale(1, Math.max(0.05, sq)); ctx.translate(0, -(BY + BH / 2));
    const exF = K.phase(t, exAt - 0.3, exAt + 0.2);
    const flip = K.phase(t, tradeAt - 0.15, tradeAt + 0.15);
    const price = flip < 0.5 ? 83 : Number(P.open || 111.5);
    header(ctx, S, { price: t > priceAt0 - 0.3 ? price : null, priceFlip: flip, priceCol: flip < 0.5 ? '#ffffff' : ACC,
      priceLabel: flip < 0.5 ? 'IPO price' : 'first trade', exFlip: exF, exText: String(P.exchange || 'EXCHANGE') });
    // chart: flat at the IPO price before the first trade, then jumps and climbs toward the peak
    const prog = t < tradeAt ? Math.min(0.1, 0.1 * K.phase(t, priceAt0, exAt)) : Math.min(PEAK_U, 0.1 + (t - tradeAt) * 0.12);
    chart(ctx, S, Math.max(0.001, prog), [BX + 40, BY + 160, BX + BW - 40, BY + BH - 30]);
    const cp = K.popIn(t, tradeAt + 0.3, 0.45);
    chip(ctx, S, BX + BW - 120, BY + 175, String(P.openChip || '+34%'), ACC, cp);
    ctx.restore();
  } else {
    // page 2: facts
    const sq = (page - 0.5) * 2;
    ctx.save(); ctx.translate(0, BY + BH / 2); ctx.scale(1, Math.max(0.05, sq)); ctx.translate(0, -(BY + BH / 2));
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const v = K.popIn(t, valueAt - 0.4, 0.5);
    if (v > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, v); ctx.translate(BX + BW / 2, BY + 95); ctx.scale(0.7 + 0.3 * v, 0.7 + 0.3 * v);
      const vf = H.fitText(ctx, String(P.value || '≈ $X BILLION'), 'display', 72, 40, BW - 80); ctx.font = vf.font;
      ctx.fillStyle = ACC; ctx.fillText(String(P.value || '≈ $X BILLION'), 0, 0);
      ctx.font = K.font.ui(28); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillText(String(P.valueLabel || 'company value at the open'), 0, 56);
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(BX + 60, BY + 200, BW - 120, 3);
    const r = K.popIn(t, raisedAt - 0.5, 0.5);
    if (r > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, r); ctx.translate(BX + BW / 2 - 90, BY + 280); ctx.scale(0.7 + 0.3 * r, 0.7 + 0.3 * r);
      const k = K.phase(t, raisedAt - 0.5, raisedAt + 0.9, H.easeOutCubic);
      const txt = String(P.raised || '$10B'); const m = txt.match(/^(.*?)(\d+(?:\.\d+)?)(.*)$/);
      let shown = txt; if (m) { const dec = (m[2].split('.')[1] || '').length; shown = m[1] + (parseFloat(m[2]) * k).toFixed(dec) + m[3]; }
      ctx.font = K.font.display(66); ctx.fillStyle = '#ffffff'; ctx.fillText(shown, 0, 0);
      ctx.font = K.font.ui(28); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillText(String(P.raisedLabel || 'raised in the share sale'), 0, 56);
      ctx.restore();
      // money stack next to it
      K.drawBills(ctx, BX + 95, BY + 330, 0.8 * Math.min(1, r), { count: 1 + Math.floor(5 * k) });
    }
    ctx.restore();
    if (t > recordAt - 0.25) K.drawStamp(ctx, BX + BW - 100, BY + 395, 0.62, { kind: 'check', text: String(P.record || 'RECORD'), land: (t - recordAt + 0.25) / 0.5 });
  }
  // price tag that swings in with the sale price
  const tp = K.popIn(t, priceAt0 - 0.3, 0.5);
  if (tp > 0 && t < pageAt) {
    const away = K.phase(t, tradeAt - 0.2, tradeAt + 0.4);
    ctx.save(); ctx.globalAlpha = 1 - away; ctx.translate(lerp(0, -60, away), 0);
    K.drawPriceTag(ctx, 487, 790, 1.25 * tp, { text: '$83', t });
    ctx.restore();
  }
  bellAndRobot(ctx, S, ringAt, { state: t > tradeAt ? 'happy' : 'idle', pill: page < 0.5 });
  traders(ctx, S, (i) => (t > tradeAt + 0.1 * i ? 'cheer' : (t > exAt ? 'point' : 'neutral')));
  confetti(ctx, S, tradeAt + 0.1, 70);
  function lerp(a, b, k) { return a + (b - a) * k; }
}

function closeMode(ctx, S) {
  const { H, K, P, D, t, ACC, RED } = S;
  const closeAt = S.at(P.closeCue || 'ninetyseven', D * 0.18);
  const stillAt = S.at(P.stillCue || '17%', D * 0.33);
  const marketAt = S.at(P.marketCue || 'wider', D * 0.55);
  const rows = (P.rows || [{ name: 'Index A', value: '≈ 1%' }, { name: 'Index B', value: '≈ 1%' }]).slice(0, 2);
  const rowAt = rows.map((r, i) => S.at(r.cue, marketAt + 0.8 + i * 1.2));
  // the slide: from the peak to the close by closeAt
  const prog = PEAK_U + (1 - PEAK_U) * K.phase(t, 0, closeAt + 0.3, H.easeInOutCubic);
  const shrink = K.phase(t, marketAt - 0.3, marketAt + 0.4, H.easeInOutCubic);
  boardFrame(ctx, S, RED);
  const price = priceAt(prog);
  header(ctx, S, { price, priceCol: prog > PEAK_U + 0.03 ? RED : ACC, priceLabel: prog >= 0.999 ? 'close' : '', exFlip: 0 });
  const y1 = (BY + BH - 30) - shrink * 130;
  chart(ctx, S, prog, [BX + 40, BY + 160, BX + BW - 40, y1], { ipoRight: true });
  const sp = K.popIn(t, stillAt - 0.1, 0.45);
  chip(ctx, S, BX + BW / 2 + 10, BY + 56, String(P.stillChip || '+5% vs IPO'), ACC, sp * 0.8);
  // index rows
  rows.forEach((r, i) => {
    const p = K.popIn(t, rowAt[i] - 0.1, 0.45);
    if (p <= 0) return;
    const y = BY + BH - 108, half = (BW - 70) / 2;
    const x = BX + 28 + i * (half + 14);
    ctx.save(); ctx.globalAlpha = Math.min(1, p); ctx.translate(0, (1 - Math.min(1, p)) * 30);
    H.roundRect(ctx, x, y - 2, half, 92, 14); ctx.fillStyle = 'rgba(255,93,93,0.14)'; ctx.fill();
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left'; ctx.fillStyle = '#ffffff';
    const nf = H.fitText(ctx, String(r.name), 'bold', 34, 22, half - 170); ctx.font = nf.font; ctx.fillText(String(r.name), x + 22, y + 44);
    ctx.textAlign = 'right'; ctx.font = K.font.display(38); ctx.fillStyle = RED; ctx.fillText(String(r.value), x + half - 18, y + 46);
    const vw = ctx.measureText(String(r.value)).width;
    const ax = x + half - 18 - vw - 26, drop = Math.sin(Math.min(1, Math.max(0, (t - rowAt[i]) / 0.6)) * Math.PI) * 8;
    ctx.save(); ctx.translate(ax, y + 44 + drop); ctx.scale(0.7, 0.7);
    ctx.beginPath(); ctx.moveTo(-10, -26); ctx.lineTo(10, -26); ctx.lineTo(10, 2); ctx.lineTo(24, 2); ctx.lineTo(0, 30); ctx.lineTo(-24, 2); ctx.lineTo(-10, 2); ctx.closePath();
    ctx.fillStyle = RED; ctx.fill(); ctx.restore();
    ctx.restore();
  });
  if (shrink > 0) {
    ctx.save(); ctx.globalAlpha = shrink; ctx.font = K.font.ui(24); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(String(P.marketLabel || 'THE WIDER MARKET'), BX + 30, BY + BH - 128); ctx.restore();
  }
  bellAndRobot(ctx, S, -10, { state: 'idle', pill: false });
  traders(ctx, S, (i) => (t > rowAt[0] ? (i === 1 ? 'shocked' : 'worried') : (t > 0.6 + i * 0.3 ? 'worried' : 'neutral')));
}

function caveat(ctx, S) {
  const { H, K, P, D, t, ACC, RED, FLOOR } = S;
  const whyAt = S.at(P.whyCue || 'why', 0.1);
  const worryAt = S.at(P.worryCue || 'chips', D * 0.45);
  const dayAt = S.at(P.dayCue || 'day', D * 0.75);
  boardFrame(ctx, S, null);
  header(ctx, S, { price: Number(P.close || 97.17), priceCol: RED, priceLabel: 'close', exFlip: 1 });
  chart(ctx, S, 1, [BX + 40, BY + 160, BX + BW - 40, BY + BH - 30]);
  // worry pill over the chart
  const wp = K.popIn(t, worryAt - 0.4, 0.5);
  if (wp > 0) {
    ctx.save(); ctx.translate(BX + BW / 2, BY + 195); ctx.scale(wp, wp);
    ctx.font = K.font.bold(32); const txt = String(P.worry || 'Worry: placeholder');
    const w = Math.min(BW - 60, ctx.measureText(txt).width + 110);
    H.roundRect(ctx, -w / 2, -40, w, 80, 22); ctx.fillStyle = 'rgba(10,12,22,0.92)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = RED; ctx.stroke();
    // tiny chip icon
    ctx.fillStyle = '#c8d0ff'; H.roundRect(ctx, -w / 2 + 22, -18, 36, 36, 6); ctx.fill();
    ctx.fillStyle = '#6a74b0'; for (let k = -1; k <= 1; k++) { ctx.fillRect(-w / 2 + 16, k * 10 - 2, 6, 4); ctx.fillRect(-w / 2 + 58, k * 10 - 2, 6, 4); }
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
    const f = H.fitText(ctx, txt, 'bold', 32, 22, w - 100); ctx.font = f.font; ctx.fillText(txt, -w / 2 + 76, 2);
    ctx.restore();
  }
  // calendar page DAY 1
  const dp = K.popIn(t, dayAt - 0.1, 0.5);
  if (dp > 0) {
    const cx = BX + BW - 260, cy = BY + BH + 5;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.06 * dp); ctx.scale(dp, dp);
    H.roundRect(ctx, -105, -170, 210, 190, 16); ctx.fillStyle = '#f4f1ea'; ctx.fill();
    ctx.save(); H.roundRect(ctx, -105, -170, 210, 190, 16); ctx.clip(); ctx.fillStyle = RED; ctx.fillRect(-105, -170, 210, 52); ctx.restore();
    ctx.fillStyle = '#ffffff'; ctx.font = K.font.ui(26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(P.daySub || 'TRADING'), 0, -143);
    ctx.fillStyle = '#1a1d2e'; ctx.font = K.font.display(58); ctx.fillText(String(P.day || 'DAY 1'), 0, -50);
    for (const rx of [-60, 60]) { ctx.fillStyle = '#555'; ctx.beginPath(); ctx.arc(rx, -170, 8, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  bellAndRobot(ctx, S, -10, { state: 'thinking', pill: false });
  traders(ctx, S, (i) => (t > dayAt ? 'neutral' : 'worried'));
  // worry bubbles over the traders' heads
  [165, 330, 480].forEach((x, i) => {
    const bp = K.popIn(t, whyAt + 0.2 + i * 0.25, 0.4) * (1 - K.phase(t, dayAt + 0.2, dayAt + 0.7));
    if (bp > 0.02) K.drawSpeechBubble(ctx, x + 30, FLOOR - 215 + Math.sin(t * 3 + i) * 4, 1, { text: '?', size: 40, pop: bp, tail: 'left' });
  });
}
