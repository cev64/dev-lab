// Scene "deal-handshake" (full frame, 1 beat, ~10-14 s). Dusk street: two company towers with text name pills (no
// logos). Two generic cartoon dealmakers step out and shake hands in front of them; a date pill pops; a contract sheet
// floats between them and signs itself, a deal-type pill (e.g. "All cash") lands. Then a stock-ticker board hanging
// over the right tower (exchange + ticker as plain text) blinks and goes dark, and a "Going private" pill + stamp land.
// An optional calendar pill (expected close) pops last. Ends settled.
// Fits: "X agreed to buy Y", take-privates, mergers, any "two companies sign a deal" beat.
// params: buyer ("Buyer"), target ("Target"), date ("Date"), kind ("All cash"), board ("EXCHANGE"), ticker ("ABC"),
//         priv ("Going private"), close ("" hides; e.g. "Close expected: Q1 2027"),
//         cues: dateCue (15%), signCue (35%), kindCue (50%), boardCue (65%), darkCue (82%), closeCue (92%)
// Cues are narration words ("word#n" = the (n+1)th time spoken in the scene) or seconds; else the fractions above.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const TAU = Math.PI * 2;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const tDate = at(P.dateCue, D * 0.15), tSign = at(P.signCue, D * 0.35), tKind = at(P.kindCue, D * 0.5);
  const tBoard = at(P.boardCue, D * 0.65), tDark = at(P.darkCue, D * 0.82), tClose = at(P.closeCue, D * 0.92);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 500, y: 720 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 960 });
  const feet = 1012;

  // towers
  const AX = 250, BX = 735, S = 1.0;
  K.drawBuilding(ctx, AX, 980, S, { t, color: '#5b6aa8', floors: 5, lit: 0.55, label: '' });
  const dark = K.phase(t, tDark, tDark + 0.8);
  K.drawBuilding(ctx, BX, 980, S, { t, color: '#3f6f9a', floors: 5, lit: 0.6 - 0.25 * dark, label: '' });
  const topY = 980 - (60 + 5 * 44) * S;
  K.drawLabel(ctx, AX, topY - 24, K.popIn(t, 0.1, 0.4), { text: P.buyer || 'Buyer', size: 28 });
  K.drawLabel(ctx, BX, topY - 24, K.popIn(t, 0.25, 0.4) * (1 - K.phase(t, tDark, tDark + 0.4)), { text: P.target || 'Target', size: 28, accent: true });

  // dealmakers walk in and shake hands in the middle
  const walkIn = K.phase(t, 0, 1.4, H.easeOutCubic);
  const MX = 490, gap = 98 * 1.35;
  const ax = lerp(MX - gap - 160, MX - gap, walkIn), bx = lerp(MX + gap + 160, MX + gap, walkIn);
  const walking = walkIn < 1;
  const shaking = !walking;
  K.drawPerson(ctx, ax, feet + 30, 1.35, walking ? { t, walk: t, shirt: '#2d3350', skin: 1, hair: 0, seed: 2 }
    : { t, pose: 'point', mood: 'happy', shirt: '#2d3350', skin: 1, hair: 0, seed: 2, look: 0.4 });
  K.drawPerson(ctx, bx, feet + 30, 1.35, walking ? { t, walk: t, flip: true, shirt: '#4a3a5c', skin: 3, hair: 2, hairStyle: 'bun', seed: 5 }
    : { t, pose: 'point', mood: 'happy', flip: true, shirt: '#4a3a5c', skin: 3, hair: 2, hairStyle: 'bun', seed: 5, look: -0.4 });
  if (shaking) {
    // clasped hands: one blob over both pointing hands, pumping up and down
    const hy = feet + 30 + (-104 - 64 - 8) * 1.35 + Math.sin(t * 9) * 6 * Math.exp(-Math.max(0, t - 1.4) * 0.5);
    ctx.beginPath(); ctx.ellipse(MX, hy, 22, 15, 0, 0, TAU); ctx.fillStyle = K.SKIN ? H.mixHex(K.SKIN[1], K.SKIN[3], 0.5) : '#c58c63'; ctx.fill();
    ctx.strokeStyle = rgba('#ffffff', 0.5); ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(MX + d * 30, hy - 26); ctx.lineTo(MX + d * 40, hy - 36); ctx.stroke(); }
  }

  // date pill
  const dp = K.popIn(t, tDate - 0.15, 0.4);
  if (dp > 0) K.drawLabel(ctx, 300, 480, dp, { text: P.date || 'Date', size: 30, dot: true });

  // contract floats above the handshake and signs itself
  const cp = K.popIn(t, tSign - 0.5, 0.45);
  if (cp > 0) {
    const fly = K.phase(t, tBoard - 0.4, tBoard + 0.4, H.easeInOutCubic);
    const cx = lerp(MX, AX + 30, fly), cy = lerp(760, 820, fly), cs = lerp(1.15, 0.7, fly) * cp;
    K.drawDocument(ctx, cx, cy, cs, { lines: 4, title: 'DEAL', sign: K.phase(t, tSign, tSign + 1.0), seal: t > tSign + 1.0 });
  }
  // deal kind pill
  const kp = K.popIn(t, tKind - 0.15, 0.4);
  const kOut = P.close ? K.phase(t, tClose - 0.2, tClose + 0.1) : 0;
  if (kp > 0 && kOut < 1) { ctx.save(); ctx.globalAlpha = 1 - kOut; K.drawLabel(ctx, 300, 556, kp, { text: P.kind || 'All cash', size: 30, accent: true }); ctx.restore(); }

  // ticker board over the right tower
  const bp = K.popIn(t, tBoard - 0.2, 0.45);
  if (bp > 0) {
    const BX0 = 600, BX1 = 900, BY = 440, BH = 120;
    ctx.save(); ctx.translate((BX0 + BX1) / 2, BY); ctx.scale(bp, bp); ctx.translate(-(BX0 + BX1) / 2, -BY);
    ctx.strokeStyle = '#8a90a8'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(BX0 + 40, BY - 40); ctx.lineTo(BX0 + 40, BY); ctx.moveTo(BX1 - 40, BY - 40); ctx.lineTo(BX1 - 40, BY); ctx.stroke();
    roundRect(ctx, BX0, BY, BX1 - BX0, BH, 14); ctx.fillStyle = '#0d1020'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#2b3150'; ctx.stroke();
    const on = 1 - dark;
    const flick = t > tDark && t < tDark + 0.6 ? (Math.sin(t * 60) > 0 ? 1 : 0.3) : 1;
    ctx.globalAlpha = Math.max(0.12, on * flick);
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#9fe8ff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.board || 'EXCHANGE', (BX0 + BX1) / 2, BY + 30);
    ctx.font = H.font('display', 50); ctx.fillStyle = ACC; ctx.fillText(P.ticker || 'ABC', (BX0 + BX1) / 2 - 30, BY + 80);
    // tiny up arrow
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(BX1 - 70, BY + 92); ctx.lineTo(BX1 - 50, BY + 62); ctx.lineTo(BX1 - 30, BY + 92); ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
    // going private stamp + pill
    if (t > tDark) {
      const pp = K.popIn(t, tDark + 0.5, 0.4);
      if (pp > 0) K.drawLabel(ctx, (BX0 + BX1) / 2, BY + BH + 58, pp, { text: P.priv || 'Going private', size: 28, accent: true });
    }
  }
  // expected close calendar pill
  if (P.close) {
    const clp = K.popIn(t, tClose - 0.15, 0.4);
    if (clp > 0) K.drawLabel(ctx, 300, 556, clp, { text: P.close, size: 26, dot: true });
  }
  ctx.restore();
}
