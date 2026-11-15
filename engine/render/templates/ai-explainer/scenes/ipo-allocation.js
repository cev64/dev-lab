// Scene "ipo-allocation" (full frame). Who actually gets IPO shares, in the same night exchange hall as
// ipo-orderbook.js (columns, ticker strip, wooden floor; gold share certificate, white order slips). modes:
//   hands  (~11-13 s): a big word card ("OVERSUBSCRIBED") + definition pill land; one big gold share certificate sits
//          on a table; six cartoon investors around it reach for it (handsCue); on partCue the certificate cuts into
//          slices that fly to them, each holding only a thin strip ("Most get only part"); on firstCue two of them get
//          gold BACKER tags, step forward and their strips grow wider ("Existing backers first").
//   retail (~10-12 s): a donut of all the shares; on pctCue a `pct`% wedge lifts out in the accent with a big
//          "<pctText>" + label; three regular people with phones stand under it; on rulesCue three plain broker booths
//          ("Broker A/B/C", no brands) light up with different rule cards; on finalCue a pill + a small balance scale.
//   next   (~12-16 s): two calendar pages flip in on d1Cue / d2Cue (price tag with "?" swings on day 1, a ticker board
//          with the ticker text lights on day 2); then on raiseCue two money columns rise: the raise (accent, label)
//          and a taller grey `rival` column ("raised more", no figure); on caveatCue the scene dims and a caveat pill
//          with a magnifier lands. Ends settled.
// Fits: IPO allocation / "who gets the shares", retail slice of an offering, "what happens next" date beats.
// params (all optional): mode; hands: word, def, partial, first, wordCue, handsCue, partCue, firstCue;
//         retail: pct (20), pctText, pctLabel, rules, final, source, brokers [3], pctCue, rulesCue, finalCue;
//         next: d1, d1Label, d2, d2Label, ticker, raise, raiseLabel, rival, rivalLabel, rivalRatio (1.17), caveat,
//               d1Cue, d2Cue, raiseCue, rivalCue, caveatCue
// Cues are narration words ("word#n" = the (n+1)th time spoken in the scene) or seconds; else fractions of the scene.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const at = (w, d) => {
    if (w == null || w === '') return d;
    if (typeof w === 'number') return w;
    const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? d : v;
  };
  const mode = P.mode || 'hands';
  const FLOOR = 1010;
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 728 }, { t: D, zoom: 1.04, x: 487, y: 740 }]);
  hall(ctx, t, H, K, ACC, FLOOR);
  if (mode === 'retail') retail(ctx, t, info, H, K, P, D, ACC, FLOOR, at);
  else if (mode === 'next') next(ctx, t, info, H, K, P, D, ACC, FLOOR, at);
  else hands(ctx, t, info, H, K, P, D, ACC, FLOOR, at);
  ctx.restore();
}

function hall(ctx, t, H, K, ACC, FLOOR) {
  const { rgba } = H;
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#121735'); g.addColorStop(0.45, '#1c2350'); g.addColorStop(1, '#0b0f22');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  for (const cx of [40, 1040]) {
    ctx.fillStyle = '#262d5c'; ctx.fillRect(cx - 50, 0, 100, FLOOR);
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(cx - 50, 0, 18, FLOOR);
    ctx.fillStyle = '#2f3768'; ctx.fillRect(cx - 62, FLOOR - 30, 124, 30);
  }
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
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let x = 120; x < 1000; x += 150) ctx.fillRect(x, 380, 4, FLOOR - 380);
  const fg = ctx.createLinearGradient(0, FLOOR, 0, 1920);
  fg.addColorStop(0, '#2a2238'); fg.addColorStop(1, '#0f0c18');
  ctx.fillStyle = fg; ctx.fillRect(0, FLOOR, 1080, 1920 - FLOOR);
  ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(0, FLOOR, 1080, 4);
  ctx.strokeStyle = 'rgba(255,255,255,0.035)'; ctx.lineWidth = 2;
  for (let i = -8; i < 16; i++) { ctx.beginPath(); ctx.moveTo(540 + i * 45, FLOOR + 4); ctx.lineTo(540 + i * 150, 1920); ctx.stroke(); }
}

function certFace(ctx, x, y, w, h, H, label = 'SHARE') {
  const { roundRect } = H;
  roundRect(ctx, x - w / 2, y - h / 2, w, h, Math.min(10, w / 4)); ctx.fillStyle = '#f2c45a'; ctx.fill();
  if (w > 40) {
    roundRect(ctx, x - w / 2 + 8, y - h / 2 + 8, w - 16, h - 16, 6); ctx.strokeStyle = '#a0721c'; ctx.lineWidth = 3; ctx.stroke();
  }
  if (w > 150 && label) {
    ctx.fillStyle = '#7a5410'; ctx.font = H.font('display', Math.round(h * 0.24)); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y + 2);
  }
}

function pill(ctx, K, x, y, p, text, o = {}) { if (p > 0) K.drawLabel(ctx, x, y, Math.min(1.05, p), Object.assign({ text, size: 28 }, o)); }

// ---------------------------------------------------------------- hands
function hands(ctx, t, info, H, K, P, D, ACC, FLOOR, at) {
  const { clamp, smooth, lerp, roundRect, rgba, easeOutBack } = H;
  const tWord = Math.max(0.1, at(P.wordCue, 0.3) - 0.25);
  const tHands = at(P.handsCue, D * 0.3) - 0.4;
  const tPart = at(P.partCue, D * 0.55) - 0.3;
  const tFirst = at(P.firstCue, D * 0.8) - 0.3;
  const CX = 487;

  // word card
  const wp = K.popIn(t, tWord, 0.45);
  if (wp > 0) {
    const word = String(P.word || 'OVERSUBSCRIBED');
    ctx.save(); ctx.translate(CX, 525); ctx.scale(Math.min(1.04, wp), Math.min(1.04, wp));
    const fs = H.fitText(ctx, word, 'display', 66, 36, 780);
    ctx.font = H.font('display', fs); const w = ctx.measureText(word).width + 60;
    roundRect(ctx, -w / 2, -52, w, 104, 22); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(word, 0, 4);
    ctx.restore();
  }
  pill(ctx, K, CX, 640, K.popIn(t, tWord + 0.7, 0.4), P.def || 'More orders than shares', { accent: true });

  // table + certificate
  const TY = 860;
  K.shadow(ctx, CX, FLOOR, 320);
  roundRect(ctx, CX - 150, TY, 300, 18, 8); ctx.fillStyle = '#4a4278'; ctx.fill();
  ctx.fillStyle = '#2f2a55'; ctx.fillRect(CX - 20, TY + 18, 40, FLOOR - TY - 18);
  roundRect(ctx, CX - 70, FLOOR - 12, 140, 12, 6); ctx.fill();

  // six investors: 3 left, 3 right; index 0 and 3 are the backers (front)
  const ppl = [
    { x: 195, s: 1.1, sh: 1, hr: 2, sk: 0, flip: false }, { x: 268, s: 1.0, sh: 3, hr: 0, sk: 3, flip: false }, { x: 340, s: 0.9, sh: 4, hr: 3, sk: 1, flip: false },
    { x: 780, s: 1.1, sh: 2, hr: 1, sk: 4, flip: true }, { x: 706, s: 1.0, sh: 0, hr: 4, sk: 2, flip: true }, { x: 634, s: 0.9, sh: 3, hr: 1, sk: 0, flip: true },
  ];
  const backer = (i) => i === 0 || i === 3;
  const fu = smooth(clamp((t - tFirst) / 0.8));
  const cut = smooth(clamp((t - tPart) / 0.9));
  // certificate (before the cut)
  const CW = 300, CH = 180, CY = TY - CH / 2 - 6;
  if (cut < 1) {
    const sh = t > tHands && t < tPart ? Math.sin(t * 40) * 3 : 0;
    ctx.save(); ctx.globalAlpha = 1 - cut;
    K.glow(ctx, CX, CY, 220, '#ffd76a', 0.2);
    certFace(ctx, CX + sh, CY, CW, CH, H);
    ctx.restore();
  }
  ppl.forEach((p, i) => {
    const reach = t > tHands - 0.1 + i * 0.08;
    const isB = backer(i);
    const fwd = isB ? fu * (p.flip ? -30 : 30) : 0;
    const x = p.x + fwd;
    let pose = 'stand', mood = 'neutral';
    if (reach && t < tPart + 0.6) { pose = 'point'; mood = 'happy'; }
    else if (t >= tPart + 0.6) { pose = isB && t > tFirst ? 'cheer' : 'shrug'; mood = isB && t > tFirst ? 'happy' : 'worried'; }
    K.drawPerson(ctx, x, FLOOR + (i % 3) * 14, p.s, { t, pose, mood, shirt: p.sh, hair: p.hr, skin: p.sk, flip: p.flip, seed: 30 + i });
    // reaching hand-wiggle lines
    if (pose === 'point') {
      const hx = x + (p.flip ? -1 : 1) * 98 * p.s, hy = FLOOR + (i % 3) * 14 - 172 * p.s;
      ctx.strokeStyle = rgba('#ffffff', 0.5); ctx.lineWidth = 3; ctx.lineCap = 'round';
      const k = (t * 3 + i * 0.3) % 1;
      ctx.beginPath(); ctx.arc(hx, hy, 14 + 12 * k, 0, Math.PI * 2); ctx.globalAlpha = 1 - k; ctx.stroke(); ctx.globalAlpha = 1;
    }
    // slices: fly from the certificate to above each person's head
    if (cut > 0) {
      const sliceW = CW / 6;
      const sx0 = CX - CW / 2 + sliceW * (i < 3 ? i : 8 - i) + sliceW / 2;
      const headY = FLOOR + (i % 3) * 14 - 270 * p.s;
      const u = cut;
      const sx = lerp(sx0, x, u), sy = lerp(CY, headY - 40, u) + Math.sin(u * Math.PI) * 40;
      const w = lerp(sliceW - 4, 30, u) + (isB ? fu * 34 : 0);
      const h = lerp(CH, 70, Math.min(1, u * 1.6));
      certFace(ctx, sx, sy, w, h, H, '');
    }
  });
  if (fu > 0) [0, 3].forEach(i => pill(ctx, K, ppl[i].x + (ppl[i].flip ? -30 : 30) * fu, FLOOR + 50, K.popIn(t, tFirst + 0.2, 0.35), 'BACKER', { size: 24, accent: true }));
  pill(ctx, K, CX, 700, K.popIn(t, tPart + 0.5, 0.4) * (1 - smooth(clamp((t - tFirst) / 0.3))), P.partial || 'Most get only part');
  pill(ctx, K, CX, 700, K.popIn(t, tFirst + 0.1, 0.4), P.first || 'Existing backers first', { dot: true });
}

// ---------------------------------------------------------------- retail
function retail(ctx, t, info, H, K, P, D, ACC, FLOOR, at) {
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const pct = clamp((+P.pct || 20) / 100, 0.02, 0.98);
  const tPct = at(P.pctCue, D * 0.3) - 0.3;
  const tRules = at(P.rulesCue, D * 0.6) - 0.3;
  const tFinal = at(P.finalCue, D * 0.82) - 0.25;
  // donut of all shares (left-centre)
  const DX = 320, DY = 690, R = 165, r = 90;
  const sweep = smooth(clamp(t / 0.8));
  const lift = smooth(clamp((t - tPct) / 0.6));
  const a0 = -Math.PI / 2, aW = a0 + pct * Math.PI * 2;
  // rest of the pie
  ctx.beginPath(); ctx.arc(DX, DY, R, aW, a0 + Math.PI * 2 * sweep); ctx.arc(DX, DY, r, a0 + Math.PI * 2 * sweep, aW, true); ctx.closePath();
  ctx.fillStyle = '#4b5596'; ctx.fill();
  ctx.font = H.font('ui', 24); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('All the', DX, DY - 16); ctx.fillText('shares', DX, DY + 16);
  // wedge
  if (sweep > pct) {
    const mid = (a0 + aW) / 2, off = 46 * lift;
    ctx.save(); ctx.translate(Math.cos(mid) * off, Math.sin(mid) * off);
    ctx.beginPath(); ctx.arc(DX, DY, R + 8 * lift, a0, aW); ctx.arc(DX, DY, r, aW, a0, true); ctx.closePath();
    ctx.fillStyle = lift > 0 ? H.mixHex('#7d87c4', ACC, lift) : '#7d87c4'; ctx.fill();
    if (lift > 0) K.glow(ctx, DX + Math.cos(mid) * 130, DY + Math.sin(mid) * 130, 90, ACC, 0.25 * lift);
    ctx.restore();
  }
  // big percentage panel (right)
  const pp = K.popIn(t, tPct + 0.2, 0.45);
  if (pp > 0) {
    ctx.save(); ctx.translate(700, 580); ctx.scale(Math.min(1.04, pp), Math.min(1.04, pp));
    const txt = String(P.pctText || 'Up to 20%');
    const fs = H.fitText(ctx, txt, 'display', 72, 40, 380);
    ctx.font = H.font('display', fs); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 0);
    ctx.font = H.font('ui', 28); ctx.fillStyle = '#ffffff'; ctx.fillText(String(P.pctLabel || 'for retail investors'), 0, 56);
    ctx.restore();
  }
  if (P.source) pill(ctx, K, 700, 520, K.popIn(t, tPct + 0.6, 0.4), P.source, { size: 22 });
  // regular people with phones under the wedge (front)
  const folk = [{ x: 160, sh: 2, hr: 1, sk: 3 }, { x: 260, sh: 4, hr: 2, sk: 0 }, { x: 360, sh: 0, hr: 3, sk: 2 }];
  folk.forEach((f, i) => {
    const look = t > tPct ? 'phone' : 'stand';
    K.drawPerson(ctx, f.x, FLOOR + 20, 1.0, { t, pose: t > tFinal ? 'shrug' : look, mood: t > tFinal ? 'neutral' : 'happy', shirt: f.sh, hair: f.hr, skin: f.sk, seed: 40 + i, typing: 1 });
  });
  // broker booths (right): three counters with different rule cards
  const brokers = (P.brokers && P.brokers.length === 3) ? P.brokers : ['Broker A', 'Broker B', 'Broker C'];
  const bx = [560, 700, 840];
  brokers.forEach((b, i) => {
    const on = K.popIn(t, tRules + i * 0.25, 0.4);
    const x = bx[i], y = FLOOR;
    // booth
    roundRect(ctx, x - 62, y - 150, 124, 150, 10); ctx.fillStyle = on > 0 ? '#3a3a72' : '#2a2c55'; ctx.fill();
    roundRect(ctx, x - 70, y - 160, 140, 20, 6); ctx.fillStyle = '#4a4a88'; ctx.fill();
    ctx.font = H.font('ui', 24); ctx.fillStyle = on > 0 ? '#ffffff' : 'rgba(255,255,255,0.5)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(b, x, y - 120);
    if (on > 0) {
      // rule card with a different number of lines + a tick/cross icon
      ctx.save(); ctx.translate(x, y - 250 - 8 * Math.sin(t * 2 + i)); ctx.scale(Math.min(1.05, on), Math.min(1.05, on));
      roundRect(ctx, -52, -64, 104, 128, 10); ctx.fillStyle = '#f4f6fb'; ctx.fill();
      ctx.fillStyle = '#9aa3c0'; for (let l = 0; l < 2 + i; l++) ctx.fillRect(-36, -40 + l * 20, 72 - (l % 2) * 20, 8);
      ctx.strokeStyle = i === 1 ? '#e2554f' : '#2fa36b'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath();
      if (i === 1) { ctx.moveTo(-12, 26); ctx.lineTo(12, 50); ctx.moveTo(12, 26); ctx.lineTo(-12, 50); }
      else { ctx.moveTo(-14, 38); ctx.lineTo(-3, 50); ctx.lineTo(16, 26); }
      ctx.stroke();
      ctx.restore();
    }
  });
  pill(ctx, K, 700, 708, K.popIn(t, tRules + 0.8, 0.4), P.rules || 'Each broker: own rules');
  // final: scale icon + pill (centre, above the folks)
  const fp = K.popIn(t, tFinal, 0.45);
  if (fp > 0) {
    const tilt = Math.sin((t - tFinal) * 4) * 0.12 * Math.max(0, 1 - (t - tFinal) / 2.5);
    ctx.save(); ctx.translate(487, 905); ctx.scale(Math.min(1.05, fp), Math.min(1.05, fp));
    roundRect(ctx, -330, -46, 660, 92, 46); ctx.fillStyle = 'rgba(10,12,22,0.9)'; ctx.fill();
    ctx.strokeStyle = rgba(ACC, 0.8); ctx.lineWidth = 3; ctx.stroke();
    // scale icon
    ctx.save(); ctx.translate(-270, 6); ctx.strokeStyle = ACC; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, 22); ctx.moveTo(-16, 22); ctx.lineTo(16, 22); ctx.stroke();
    ctx.rotate(tilt); ctx.beginPath(); ctx.moveTo(-30, -26); ctx.lineTo(30, -26); ctx.stroke();
    ctx.beginPath(); ctx.arc(-30, -12, 10, 0, Math.PI); ctx.arc(30, -12, 10, 0, Math.PI); ctx.stroke();
    ctx.restore();
    const txt = String(P.final || 'Final amounts: based on demand');
    const fs = H.fitText(ctx, txt, 'ui', 32, 22, 520);
    ctx.font = H.font('ui', fs); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(txt, -222, 2);
    ctx.restore();
  }
}

// ---------------------------------------------------------------- next
function next(ctx, t, info, H, K, P, D, ACC, FLOOR, at) {
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const t1 = at(P.d1Cue, D * 0.12) - 0.3;
  const t2 = at(P.d2Cue, D * 0.3) - 0.3;
  const tRaise = at(P.raiseCue, D * 0.45) - 0.3;
  const tRival = at(P.rivalCue, D * 0.65) - 0.3;
  const tCav = at(P.caveatCue, D * 0.85) - 0.3;
  const dim = smooth(clamp((t - tCav) / 0.5));

  // ---- two calendar pages (top row)
  const cal = (x, y, p, day, label, i) => {
    if (p <= 0) return;
    const flip = clamp(p);
    ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.05, p), Math.min(1.05, flip));
    roundRect(ctx, -150, -100, 300, 200, 18); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    ctx.save(); roundRect(ctx, -150, -100, 300, 200, 18); ctx.clip(); ctx.fillStyle = i === 0 ? ACC : '#6b7bd6'; ctx.fillRect(-150, -100, 300, 54); ctx.restore();
    ctx.fillStyle = '#c9cfdf'; ctx.beginPath(); ctx.arc(-90, -100, 9, 0, Math.PI * 2); ctx.arc(90, -100, 9, 0, Math.PI * 2); ctx.fill();
    ctx.font = H.font('ui', 26); ctx.fillStyle = i === 0 ? '#141829' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, 0, -72);
    ctx.font = H.font('display', 58); ctx.fillStyle = '#141829'; ctx.fillText(day, 0, 12);
    ctx.restore();
  };
  ctx.save(); ctx.globalAlpha = 1 - 0.65 * dim;
  cal(290, 540, K.popIn(t, t1, 0.45), P.d1 || 'Day 1', P.d1Label || 'Price set', 0);
  cal(690, 540, K.popIn(t, t2, 0.45), P.d2 || 'Day 2', P.d2Label || 'Trading starts', 1);
  // price tag with "?" swinging off calendar 1
  if (t > t1 + 0.3) {
    const sw = Math.sin((t - t1) * 3) * 0.25 * Math.max(0.2, 1 - (t - t1) / 4);
    ctx.save(); ctx.translate(430, 470); ctx.rotate(sw);
    ctx.strokeStyle = '#c9cfdf'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 40); ctx.stroke();
    roundRect(ctx, -40, 40, 80, 96, 12); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = '#141829'; ctx.beginPath(); ctx.arc(0, 56, 7, 0, Math.PI * 2); ctx.fill();
    ctx.font = H.font('display', 44); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$?', 0, 100);
    ctx.restore();
  }
  // ticker board lights under calendar 2
  if (t > t2 + 0.3) {
    const lp = smooth(clamp((t - t2 - 0.3) / 0.5));
    ctx.save(); ctx.globalAlpha *= lp;
    roundRect(ctx, 590, 660, 200, 64, 12); ctx.fillStyle = '#0a0d1f'; ctx.fill();
    for (let i = 0; i < 12; i++) { const on = Math.floor(t * 8 + i) % 3 === 0; ctx.fillStyle = on ? ACC : rgba(ACC, 0.25); ctx.beginPath(); ctx.arc(600 + i * 16.4, 656, 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.font = H.font('display', 40); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(P.ticker || 'ABC'), 690, 694);
    ctx.restore();
  }
  ctx.restore();

  // ---- money columns (bottom): the raise vs the rival
  const BASE = FLOOR - 10, MAXH = 160;
  const ratio = +P.rivalRatio || 1.17;
  const hA = MAXH / ratio * smooth(clamp((t - tRaise) / 1.0));
  const hB = MAXH * smooth(clamp((t - tRival) / 1.0));
  const colm = (x, h, col, label, sub, p) => {
    if (p <= 0) return;
    K.shadow(ctx, x, FLOOR, 200);
    const n = Math.floor(h / 14);
    for (let i = 0; i < n; i++) {
      roundRect(ctx, x - 100, BASE - (i + 1) * 14, 200, 12, 5); ctx.fillStyle = i % 2 ? col : H.mixHex(col, '#000000', 0.18); ctx.fill();
    }
    ctx.save(); ctx.translate(x, BASE - h - 80); ctx.scale(Math.min(1.05, p), Math.min(1.05, p));
    const fs = H.fitText(ctx, label, 'display', 46, 26, 300);
    ctx.font = H.font('display', fs); ctx.fillStyle = col === '#8d93b5' ? '#e7e9f5' : ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, 0);
    ctx.font = H.font('ui', 28); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fillText(sub, 0, 42);
    ctx.restore();
  };
  ctx.save(); ctx.globalAlpha = 1 - 0.65 * dim;
  colm(300, hA, ACC, String(P.raise || 'Up to $X'), String(P.raiseLabel || 'this raise'), K.popIn(t, tRaise + 0.4, 0.4));
  colm(680, hB, '#8d93b5', String(P.rival || 'Record'), String(P.rivalLabel || 'raised more'), K.popIn(t, tRival + 0.4, 0.4));
  // a cartoon onlooker comparing them
  K.drawPerson(ctx, 490, FLOOR + 30, 0.95, { t, pose: t > tRival + 0.5 ? 'point' : 'stand', mood: 'neutral', shirt: 1, hair: 2, skin: 3, flip: t > tRival + 0.5 ? false : true, seed: 51 });
  ctx.restore();

  // ---- caveat
  if (dim > 0) {
    const cp = K.popIn(t, tCav + 0.1, 0.45);
    ctx.save(); ctx.translate(487, 790); ctx.scale(Math.min(1.05, cp), Math.min(1.05, cp));
    const txt = String(P.caveat || 'Unofficial figures');
    ctx.font = H.font('display', 40); const w = Math.min(820, ctx.measureText(txt).width + 150);
    const fs = H.fitText(ctx, txt, 'display', 40, 24, w - 150);
    roundRect(ctx, -w / 2, -56, w, 112, 28); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    // magnifier
    ctx.save(); ctx.translate(-w / 2 + 62, -4); ctx.rotate(Math.sin(t * 2) * 0.15);
    ctx.strokeStyle = '#3b4672'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.stroke();
    ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(14, 14); ctx.lineTo(30, 30); ctx.stroke();
    ctx.restore();
    ctx.font = H.font('display', fs); ctx.fillStyle = '#141829'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(txt, -w / 2 + 112, 3);
    ctx.restore();
  }
}
