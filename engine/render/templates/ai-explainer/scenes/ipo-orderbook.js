// Scene "ipo-orderbook" (full frame). A night exchange hall (columns, a dark wall with a ticker strip, wooden floor).
// The shares on offer are a small stack of gold share certificates in a glass case on a pedestal; the orders are white
// paper order slips. modes:
//   hook  (cold open, ~3 s; action from frame 0): order slips already pour down from both sides and pile into two
//         mountains that press against the little glass case of shares; cartoon investors at both sides wave slips;
//         the case rattles, then a big "<mult>" badge slams in over it (~1.3 s) with a "<label>" pill.
//   pitch (~10-13 s): roadshow: the kit robot (the company stand-in, text name pill only) talks at a lectern; an event
//         pill pops (eventCue); a terms board on the right lands its rows on their cues (rows [{text, cue}] <= 3);
//         seated cartoon investors in the front row raise order slips one by one, and the slips flutter to the board.
//   book  (~9-11 s): the order book as two glass tubes on the hall floor: SHARES (short, gold cards) vs ORDERS (paper
//         slips). Investors drop slips into ORDERS; on each step's cue the slip column rises to `mult` x the shares
//         column (ruler ticks 1x..max), with a "<label>: ~<mult>x" tag; a source pill lands on sourceCue.
// Fits: IPO demand / oversubscription, "more buyers than supply", any "orders vs what's on offer" money story.
// params: mode, mult ("6x"), label ("orders vs shares"), shares ("Shares"), orders ("Orders"),
//         company ("Company"), event ("Roadshow"), eventCue, rows [{text, cue}], board ("THE OFFER"),
//         steps [{mult, label, cue}] (book; default [{2,"Day 1"},{6,"Day 3"}]), source (""), sourceCue
// Cues are narration words ("word#n" = the (n+1)th time spoken in the scene) or seconds; else fractions of the scene.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba, hash } = H;
  const at = (w, d) => {
    if (w == null || w === '') return d;
    if (typeof w === 'number') return w;
    const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? d : v;
  };
  const mode = P.mode || 'hook';
  const FLOOR = 1010;

  ctx.save();
  if (mode === 'hook') K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 487, y: 760 }, { t: D, zoom: 1.02, x: 487, y: 740 }]);
  else if (mode === 'pitch') K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 730 }, { t: D, zoom: 1.05, x: 500, y: 740 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 487, y: 740 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);

  hall(ctx, t, H, K, ACC, FLOOR);

  if (mode === 'hook') hook(ctx, t, info, H, K, P, D, ACC, FLOOR);
  else if (mode === 'pitch') pitch(ctx, t, info, H, K, P, D, ACC, FLOOR, at);
  else book(ctx, t, info, H, K, P, D, ACC, FLOOR, at);
  ctx.restore();
}

// ---------------------------------------------------------------- setting
function hall(ctx, t, H, K, ACC, FLOOR) {
  const { rgba } = H;
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#121735'); g.addColorStop(0.45, '#1c2350'); g.addColorStop(1, '#0b0f22');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  // columns
  for (const cx of [40, 1040]) {
    ctx.fillStyle = '#262d5c'; ctx.fillRect(cx - 50, 0, 100, FLOOR);
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(cx - 50, 0, 18, FLOOR);
    ctx.fillStyle = '#2f3768'; ctx.fillRect(cx - 62, FLOOR - 30, 124, 30);
  }
  // ticker strip across the top of the wall: abstract bars scrolling (no real symbols)
  ctx.fillStyle = '#0a0d1f'; ctx.fillRect(0, 300, 1080, 54);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 300, 1080, 54); ctx.clip();
  const off = (t * 90) % 180;
  for (let i = -1; i < 8; i++) {
    const x = i * 180 - off;
    ctx.fillStyle = rgba('#9fb0ff', 0.35); ctx.fillRect(x + 14, 318, 60, 16);
    const up = (i + Math.floor((t * 90) / 180)) % 3 !== 0;
    ctx.fillStyle = up ? rgba(ACC, 0.75) : 'rgba(255,120,120,0.6)';
    ctx.beginPath();
    if (up) { ctx.moveTo(x + 92, 334); ctx.lineTo(x + 104, 318); ctx.lineTo(x + 116, 334); }
    else { ctx.moveTo(x + 92, 318); ctx.lineTo(x + 104, 334); ctx.lineTo(x + 116, 318); }
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x + 126, 320, 34, 12);
  }
  ctx.restore();
  // wall panelling
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let x = 120; x < 1000; x += 150) ctx.fillRect(x, 380, 4, FLOOR - 380);
  // floor (wood planks, perspective lines)
  const fg = ctx.createLinearGradient(0, FLOOR, 0, 1920);
  fg.addColorStop(0, '#2a2238'); fg.addColorStop(1, '#0f0c18');
  ctx.fillStyle = fg; ctx.fillRect(0, FLOOR, 1080, 1920 - FLOOR);
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(0, FLOOR, 1080, 4);
  ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 2;
  for (let i = -8; i < 16; i++) { ctx.beginPath(); ctx.moveTo(540 + i * 45, FLOOR + 4); ctx.lineTo(540 + i * 150, 1920); ctx.stroke(); }
  // soft hanging lights
  for (const lx of [260, 720]) {
    ctx.strokeStyle = '#3a4270'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx, 354); ctx.lineTo(lx, 392); ctx.stroke();
    ctx.fillStyle = '#353d70'; ctx.beginPath(); ctx.ellipse(lx, 398, 46, 12, 0, 0, Math.PI * 2); ctx.fill();
    K.glow(ctx, lx, 430, 260, '#fff1c4', 0.07);
  }
}

// order slip (paper ticket) centred at x, y; s scale; rot radians; v 0..1 variation
function slip(ctx, x, y, s, rot, ACC, v) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.fillRect(-33, -19, 70, 44);
  ctx.fillStyle = v > 0.5 ? '#f4f6fb' : '#e6eaf5'; ctx.fillRect(-36, -23, 70, 44);
  ctx.fillStyle = v > 0.75 ? ACC : '#6b7bd6'; ctx.fillRect(-36, -23, 12, 44);
  ctx.fillStyle = '#9aa3c0'; ctx.fillRect(-18, -13, 40, 5); ctx.fillRect(-18, -2, 30, 5); ctx.fillRect(-18, 9, 36, 5);
  ctx.restore();
}

// gold share certificate, bottom-centre anchored
function cert(ctx, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = '#b8862b'; ctx.fillRect(-60, -16, 120, 16);
  ctx.fillStyle = '#f2c45a'; ctx.fillRect(-60, -18, 120, 13);
  ctx.strokeStyle = '#fff0bf'; ctx.lineWidth = 2; ctx.strokeRect(-54, -16, 108, 9);
  ctx.restore();
}

// a single flat share certificate face (for close-ups), centred
function certFace(ctx, x, y, w, h, H) {
  const { roundRect } = H;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, 10); ctx.fillStyle = '#f2c45a'; ctx.fill();
  roundRect(ctx, x - w / 2 + 8, y - h / 2 + 8, w - 16, h - 16, 6); ctx.strokeStyle = '#a0721c'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = '#a0721c'; ctx.beginPath(); ctx.arc(x + w / 2 - 34, y + h / 2 - 32, 16, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#7a5410'; ctx.font = H.font('display', Math.round(h * 0.22)); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('SHARE', x - 8, y - 4);
}

// glass case with a stack of `n` certificates, standing on a pedestal; returns case top y
function shareCase(ctx, x, FLOOR, n, shake, K, H, ACC) {
  const { roundRect, rgba } = H;
  // pedestal
  K.shadow(ctx, x, FLOOR, 220);
  roundRect(ctx, x - 90, FLOOR - 150, 180, 150, 8); ctx.fillStyle = '#3a3360'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(x - 90, FLOOR - 150, 26, 150);
  roundRect(ctx, x - 104, FLOOR - 166, 208, 20, 6); ctx.fillStyle = '#4a4278'; ctx.fill();
  const top = FLOOR - 166;
  ctx.save(); ctx.translate(x + shake, top);
  for (let i = 0; i < n; i++) cert(ctx, 0, -i * 15, 1, (i % 2 ? 0.02 : -0.02));
  K.glow(ctx, 0, -40, 120, '#ffd76a', 0.18);
  // glass box
  roundRect(ctx, -84, -150, 168, 150, 10); ctx.fillStyle = 'rgba(180,210,255,0.10)'; ctx.fill();
  ctx.strokeStyle = 'rgba(200,225,255,0.55)'; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(-70, -138, 10, 110);
  ctx.restore();
  return top - 150;
}

// ---------------------------------------------------------------- hook
function hook(ctx, t, info, H, K, P, D, ACC, FLOOR) {
  const { clamp, smooth, lerp, hash, rgba } = H;
  const CX = 487;
  const tSlam = Math.min(1.3, D * 0.45);
  const grow = 0.62 + 0.38 * smooth(clamp(t / Math.max(1, D * 0.9)));
  const shake = t < tSlam + 0.4 ? Math.sin(t * 55) * 4 * (0.6 + 0.4 * Math.sin(t * 7)) : Math.sin(t * 40) * 4 * Math.max(0, 1 - (t - tSlam - 0.4) / 0.6);
  // the two mountains of slips
  const piles = [{ cx: 230, side: -1 }, { cx: 744, side: 1 }];
  for (const p of piles) {
    const W = 330, Hh = 330 * grow;
    for (let row = 0; row < 9; row++) {
      const y = FLOOR - 18 - row * 36;
      if (FLOOR - y > Hh) continue;
      const frac = (FLOOR - y) / (Hh + 30);
      const half = (W / 2) * (1 - frac * 0.85);
      const lean = p.side * -frac * 70;            // piles lean toward the case
      const n = Math.max(1, Math.floor(half * 2 / 60));
      for (let i = 0; i < n; i++) {
        const x = p.cx + lean - half + (i + 0.5) * (half * 2 / n) + (hash(row, i + p.cx) - 0.5) * 16;
        slip(ctx, x, y, 0.9, (hash(i, row + p.cx) - 0.5) * 0.9, ACC, hash(row + 3, i + p.cx));
      }
    }
  }
  const caseTop = shareCase(ctx, CX, FLOOR, 4, shake, K, H, ACC);
  // investors at the sides waving slips
  const crowd = [
    { x: 92, s: 1.25, shirt: 2, hair: 1, skin: 0, flip: false }, { x: 175, s: 1.05, shirt: 4, hair: 3, skin: 3, flip: false },
    { x: 882, s: 1.25, shirt: 1, hair: 2, skin: 2, flip: true }, { x: 800, s: 1.05, shirt: 3, hair: 0, skin: 4, flip: true },
  ];
  crowd.forEach((c, i) => {
    const pose = (Math.floor(t * 2.2 + i) % 2) ? 'cheer' : 'point';
    K.drawPerson(ctx, c.x, FLOOR + 30, c.s, { t, pose, mood: 'happy', shirt: c.shirt, hair: c.hair, skin: c.skin, flip: c.flip, seed: i + 1 });
    const hy = FLOOR + 30 - 250 * c.s + Math.sin(t * 9 + i) * 8;
    slip(ctx, c.x + (c.flip ? -40 : 40) * c.s, hy, 0.85, Math.sin(t * 8 + i) * 0.3, ACC, 0.8);
  });
  // the torrent: slips flying in from both top corners toward the case (already mid-air at frame 0)
  const rate = 16, flight = 0.9;
  const k0 = Math.floor((t - 1.2) * rate) - 1, k1 = Math.floor((t + 0.2) * rate) + 1;
  for (let k = k0; k <= k1; k++) {
    const born = k / rate - 0.7, age = t - born;
    if (age < 0 || age > flight) continue;
    const side = k % 2 ? -1 : 1;
    const sx = CX + side * (330 + 120 * hash(k, 1)), sy = 420 + 60 * hash(k, 2);
    const tx = CX + side * (90 + 160 * hash(k, 3)), ty = FLOOR - 120 - 200 * hash(k, 4);
    const u = age / flight;
    const x = lerp(sx, tx, u), y = lerp(sy, ty, u) - Math.sin(u * Math.PI) * 90;
    slip(ctx, x, y, 0.85, age * 6 * side + hash(k, 5) * 3, ACC, hash(k, 6));
  }
  // labels
  K.drawLabel(ctx, CX, caseTop - 16, 1, { text: P.shares || 'Shares', size: 30 });
  // the big multiplier badge slams in
  const land = clamp((t - tSlam) / 0.5);
  if (land > 0) {
    const sc = 1 + 1.4 * Math.pow(1 - H.easeOutCubic(clamp(land / 0.6)), 2);
    ctx.save(); ctx.translate(CX, 560); ctx.scale(sc, sc); ctx.rotate(-0.06);
    ctx.globalAlpha = clamp(land / 0.25);
    K.glow(ctx, 0, 0, 230, ACC, 0.3);
    ctx.font = H.font('display', 190); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 16; ctx.strokeStyle = '#0b0f22'; ctx.strokeText(String(P.mult || '6x'), 0, 0);
    ctx.fillStyle = ACC; ctx.fillText(String(P.mult || '6x'), 0, 0);
    ctx.restore();
    const b = (land - 0.55) / 0.45;
    if (b > 0 && b < 1) {
      ctx.strokeStyle = rgba(ACC, 1 - b); ctx.lineWidth = 5; ctx.lineCap = 'round';
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r0 = 170 + 50 * b; ctx.beginPath(); ctx.moveTo(CX + Math.cos(a) * r0, 560 + Math.sin(a) * r0 * 0.6); ctx.lineTo(CX + Math.cos(a) * (r0 + 26), 560 + Math.sin(a) * (r0 + 26) * 0.6); ctx.stroke(); }
    }
    const lp = K.popIn(t, tSlam + 0.35, 0.35);
    if (lp > 0 && P.label !== '') K.drawLabel(ctx, CX, 700, lp, { text: P.label || 'orders vs shares', size: 30, accent: true });
  }
}

// ---------------------------------------------------------------- pitch
function pitch(ctx, t, info, H, K, P, D, ACC, FLOOR, at) {
  const { clamp, smooth, lerp, roundRect, rgba, hash } = H;
  const rows = (P.rows && P.rows.length ? P.rows : [{ text: 'Shares on offer' }, { text: 'Price range' }, { text: 'Exchange: ABC' }]).slice(0, 3);
  const rowT = rows.map((r, i) => at(r.cue, D * (0.4 + i * 0.15)) - 0.15);
  const tEvent = at(P.eventCue, D * 0.18) - 0.2;
  const lastRow = rowT[rowT.length - 1];

  // stage platform
  ctx.fillStyle = '#2b2550'; ctx.fillRect(60, FLOOR - 40, 470, 40);
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(60, FLOOR - 40, 470, 5);
  // spotlight on the lectern
  ctx.save(); ctx.globalAlpha = 0.12 + 0.02 * Math.sin(t * 2);
  const sg = ctx.createLinearGradient(0, 380, 0, FLOOR);
  sg.addColorStop(0, 'rgba(255,240,190,0)'); sg.addColorStop(1, 'rgba(255,240,190,1)');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(250, 380); ctx.lineTo(330, 380); ctx.lineTo(440, FLOOR - 40); ctx.lineTo(140, FLOOR - 40); ctx.closePath(); ctx.fill();
  ctx.restore();

  // robot behind the lectern (company stand-in)
  const RX = 290, RY = FLOOR - 40;
  K.drawRobot(ctx, RX + 6, RY - 40, 1.25, { t, state: t > lastRow + 0.4 ? 'happy' : 'idle', talk: info.env, seed: 4 });
  K.drawLectern(ctx, RX, RY, 0.95, {});
  // mic
  ctx.strokeStyle = '#9aa3c0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(RX + 40, RY - 222); ctx.lineTo(RX + 18, RY - 262); ctx.stroke();
  ctx.fillStyle = '#5b6488'; ctx.beginPath(); ctx.arc(RX + 16, RY - 266, 9, 0, Math.PI * 2); ctx.fill();
  const np = K.popIn(t, 0.1, 0.4);
  if (np > 0) K.drawLabel(ctx, RX, 520, np, { text: P.company || 'Company', size: 30, dot: true });
  const ep = K.popIn(t, tEvent, 0.4);
  if (ep > 0) K.drawLabel(ctx, RX, 600, ep, { text: P.event || 'Roadshow', size: 26, accent: true });

  // terms board (right)
  const BX0 = 530, BX1 = 910, BY0 = 430, BY1 = 760;
  const bp = smooth(clamp(t / 0.5));
  ctx.save(); ctx.globalAlpha = bp; ctx.translate(0, (1 - bp) * -30);
  ctx.strokeStyle = '#3a4270'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(BX0 + 60, 354); ctx.lineTo(BX0 + 60, BY0); ctx.moveTo(BX1 - 60, 354); ctx.lineTo(BX1 - 60, BY0); ctx.stroke();
  roundRect(ctx, BX0, BY0, BX1 - BX0, BY1 - BY0, 22); ctx.fillStyle = '#0d1230'; ctx.fill();
  ctx.strokeStyle = rgba(ACC, 0.55); ctx.lineWidth = 3; ctx.stroke();
  ctx.font = H.font('ui', 24); ctx.letterSpacing = '3px'; ctx.fillStyle = '#9fb0ff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(P.board || 'THE OFFER'), (BX0 + BX1) / 2, BY0 + 42); ctx.letterSpacing = '0px';
  ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fillRect(BX0 + 30, BY0 + 70, BX1 - BX0 - 60, 2);
  rows.forEach((r, i) => {
    const p = K.popIn(t, rowT[i], 0.4);
    if (p <= 0) return;
    const y = BY0 + 125 + i * 85;
    ctx.save(); ctx.globalAlpha = clamp(p); ctx.translate((BX0 + BX1) / 2, y); ctx.scale(Math.min(1.05, 0.6 + 0.4 * p), Math.min(1.05, 0.6 + 0.4 * p));
    const fs = H.fitText(ctx, r.text, 'display', 46, 24, BX1 - BX0 - 50);
    ctx.font = H.font('display', fs); ctx.fillStyle = i === 0 ? ACC : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(r.text, 0, 0);
    ctx.restore();
    // flash under the new row
    const f = clamp(1 - (t - rowT[i]) / 0.6);
    if (f > 0 && f < 1) { ctx.fillStyle = rgba(ACC, 0.25 * f); ctx.fillRect(BX0 + 20, y - 40, BX1 - BX0 - 40, 80); }
  });
  ctx.restore();

  // front row of seated investors (backs of chairs in the foreground), raising slips one by one
  const seats = [560, 660, 760, 860];
  seats.forEach((x, i) => {
    const raiseT = Math.min(D - 1.2, lastRow + 0.3 + i * 0.35);
    const up = t > raiseT;
    K.drawPerson(ctx, x, FLOOR + 40, 1.0, { t, pose: 'sit', mood: up ? 'happy' : 'neutral', shirt: i, hair: (i + 2) % 5, skin: (i * 2) % 5, seat: true, seed: 10 + i, flip: true });
    if (up) {
      // slip lifts off and flutters up to the board
      const u = clamp((t - raiseT - 0.3) / 1.1);
      const x0 = x - 10, y0 = FLOOR + 40 - 215 - 30 * smooth(clamp((t - raiseT) / 0.3));
      const xs = lerp(x0, 600 + i * 80, smooth(u)), ys = lerp(y0, BY1 + 60, smooth(u)) - Math.sin(u * Math.PI) * 60;
      ctx.save(); ctx.globalAlpha = 1 - smooth(clamp((u - 0.6) / 0.4));
      slip(ctx, xs, ys, 0.8 - 0.25 * u, Math.sin(t * 7 + i) * 0.4, ACC, 0.9);
      ctx.restore();
    }
  });
}

// ---------------------------------------------------------------- book
function book(ctx, t, info, H, K, P, D, ACC, FLOOR, at) {
  const { clamp, smooth, lerp, roundRect, rgba, hash } = H;
  const steps = (P.steps && P.steps.length ? P.steps : [{ mult: 2, label: 'Day 1' }, { mult: 6, label: 'Day 3' }]).slice(0, 3);
  const stepT = steps.map((s, i) => at(s.cue, D * (0.25 + i * 0.3)) - 0.2);
  const maxM = Math.max(...steps.map(s => +s.mult || 1));
  const tSrc = at(P.sourceCue, D * 0.8) - 0.2;
  const UNIT = Math.min(80, 420 / maxM);         // px per 1x
  const BASE = FLOOR - 40;
  // current multiple
  let m = 0.25 + 0.15 * smooth(clamp(t / Math.max(0.5, stepT[0])));
  let prev = 0.4;
  steps.forEach((s, i) => { const u = smooth(clamp((t - stepT[i]) / 1.1)); if (u > 0) m = lerp(prev, +s.mult, u); prev = +s.mult; });
  const wob = Math.sin(t * 10) * 3 * Math.max(0, 1 - Math.min(...stepT.map(st => Math.abs(t - st - 1.1))) / 0.4);

  // tubes
  const tubes = [{ x: 215, label: P.shares || 'Shares', h: UNIT, gold: true }, { x: 470, label: P.orders || 'Orders', h: UNIT * m + wob, gold: false }];
  const TW = 190, TOP = BASE - UNIT * maxM - 30;
  // ruler
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2;
  ctx.font = H.font('ui', 24); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let k = 1; k <= maxM; k++) {
    const y = BASE - UNIT * k;
    ctx.setLineDash([8, 10]); ctx.beginPath(); ctx.moveTo(130, y); ctx.lineTo(580, y); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillText(k + 'x', 112, y);
  }
  tubes.forEach((tb, ti) => {
    K.shadow(ctx, tb.x, FLOOR, TW + 60);
    // base
    roundRect(ctx, tb.x - TW / 2 - 14, BASE, TW + 28, 40, 8); ctx.fillStyle = '#3a3360'; ctx.fill();
    // contents
    ctx.save(); roundRect(ctx, tb.x - TW / 2, TOP, TW, BASE - TOP, 16); ctx.clip();
    if (tb.gold) {
      const n = Math.round(tb.h / 15);
      for (let i = 0; i < n; i++) cert(ctx, tb.x, BASE - i * 15, 1.35, (i % 2 ? 0.02 : -0.02));
      K.glow(ctx, tb.x, BASE - tb.h / 2, 140, '#ffd76a', 0.15);
    } else {
      const rowsN = Math.ceil(tb.h / 26);
      for (let r = 0; r < rowsN; r++) for (let c = 0; c < 3; c++) {
        const y = BASE - 14 - r * 26;
        if (BASE - y > tb.h + 4) continue;
        slip(ctx, tb.x - 58 + c * 58 + (hash(r, c) - 0.5) * 10, y, 0.78, (hash(c, r + 9) - 0.5) * 0.7, ACC, hash(r + 1, c + 2));
      }
    }
    ctx.restore();
    // glass
    roundRect(ctx, tb.x - TW / 2, TOP, TW, BASE - TOP, 16); ctx.fillStyle = 'rgba(180,210,255,0.07)'; ctx.fill();
    ctx.strokeStyle = 'rgba(200,225,255,0.5)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(tb.x - TW / 2 + 14, TOP + 16, 10, BASE - TOP - 40);
  });
  // slips dropping into the orders tube
  const rate = 7;
  for (let k = Math.floor((t - 0.8) * rate); k <= Math.floor(t * rate) + 1; k++) {
    const age = t - k / rate; if (age < 0 || age > 0.8) continue;
    const x = 470 + (hash(k, 1) - 0.5) * 120, y = lerp(TOP - 80, BASE - UNIT * m - 10, age / 0.8);
    slip(ctx, x, y, 0.75, age * 5 * (hash(k, 2) > 0.5 ? 1 : -1), ACC, hash(k, 3));
  }
  tubes.forEach((tb, ti) => K.drawLabel(ctx, tb.x, TOP - 14, 1, { text: tb.label, size: 28, accent: ti === 1 }));
  // an investor on the right tossing slips in
  const toss = (Math.floor(t * 1.6) % 2) === 0;
  K.drawPerson(ctx, 850, FLOOR + 30, 1.2, { t, pose: toss ? 'point' : 'cheer', mood: 'happy', shirt: 2, hair: 4, skin: 1, flip: true, seed: 21 });

  // multiple tag next to the orders column top
  const yTop = BASE - UNIT * m;
  let cur = -1; steps.forEach((s, i) => { if (t >= stepT[i]) cur = i; });
  if (cur >= 0) {
    const s = steps[cur], p = K.popIn(t, stepT[cur], 0.4);
    const txt = `${s.label}: ~${s.mult}x`;
    ctx.save(); ctx.translate(742, Math.min(690, Math.max(TOP + 60, yTop + 10))); ctx.scale(Math.min(1.05, p), Math.min(1.05, p));
    ctx.font = H.font('display', 40); const w = ctx.measureText(txt).width + 40;
    roundRect(ctx, -w / 2 - 20, -34, w, 68, 34); ctx.fillStyle = cur === steps.length - 1 ? ACC : '#f4f6fb'; ctx.fill();
    ctx.fillStyle = '#0b0f22'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, -20, 2);
    ctx.restore();
  }
  // source pill
  const sp = K.popIn(t, tSrc, 0.4);
  if (P.source && sp > 0) K.drawLabel(ctx, 487, 1052, sp, { text: P.source, size: 24 });
}
