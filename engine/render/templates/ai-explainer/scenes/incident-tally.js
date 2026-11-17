// Scene "incident-tally" (full frame, 1 beat). Night control room with a big wall board of incident tiles (a tiny
// robot-head icon in each). First one tile lights in the accent and grows a tag ("Admitted" + name); then a header
// pill ("The lawsuit claims") pops and the other tiles flip red one by one while a counter in the header runs up;
// on countCue a card lands over the board: small "AT LEAST", a big number, and a one-line label. A cartoon operator
// on the left looks up worried; an agent robot on the right scratches its head.
// Fits: "not a one-off: N incidents", "it happened N times", any count of alleged / reported incidents.
// params (all optional): count (80), first ("Hugging Face"), admit ("Admitted"), head ("The lawsuit claims"),
//        prefix ("AT LEAST"), label ("times OpenAI lost control of its agents"), source ("in testing"),
//        cues: admitCue, claimCue, countCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent, N = K.NEUTRAL;
  const { clamp, lerp, smooth, roundRect, rgba } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const RED = '#ff5a52';
  const count = Math.max(1, Math.round(+P.count || 80));
  const tAdmit = at(P.admitCue, 0.4) - 0.2, tClaim = Math.max(tAdmit + 1, at(P.claimCue, D * 0.3) - 0.2);
  const tCount = Math.max(tClaim + 1.5, at(P.countCue, D * 0.8) - 0.3);
  const fillEnd = tCount - 0.1;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.1, x: 420, y: 760 }, { t: tClaim, zoom: 1.02, x: 487, y: 760 }, { t: tCount, zoom: 1.0, x: 487, y: 760 }, { t: D, zoom: 1.03, x: 487, y: 760 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 980 });

  // board
  const BX0 = 130, BX1 = 845, BY0 = 585, BY1 = 975, COLS = 10, ROWS = Math.ceil(count / 10);
  roundRect(ctx, BX0 - 14, BY0 - 14, BX1 - BX0 + 28, BY1 - BY0 + 28, 22); ctx.fillStyle = '#0b0e1d'; ctx.fill();
  roundRect(ctx, BX0, BY0, BX1 - BX0, BY1 - BY0, 14); ctx.fillStyle = '#151a33'; ctx.fill();
  const gx = 8, gy = 8, top = BY0 + 66;
  const cw = (BX1 - BX0 - 30 - gx * (COLS - 1)) / COLS, ch = (BY1 - top - 16 - gy * (ROWS - 1)) / ROWS;
  // lit count: tile 0 at admit, the rest between claim and fillEnd
  const prog = smooth(clamp((t - tClaim - 0.4) / Math.max(0.5, fillEnd - tClaim - 0.4)));
  const lit = t < tClaim + 0.4 ? (t >= tAdmit ? 1 : 0) : 1 + Math.floor(prog * (count - 1) + 1e-6);
  for (let i = 0; i < count; i++) {
    const c = i % COLS, r = Math.floor(i / COLS);
    const x = BX0 + 15 + c * (cw + gx), y = top + r * (ch + gy);
    const on = i < lit;
    const fresh = on && i > 0 ? clamp(1 - (prog * (count - 1) - (i - 1)) / 6) : 0;
    roundRect(ctx, x, y, cw, ch, 8);
    ctx.fillStyle = !on ? '#20264a' : i === 0 ? ACC : H.mixHex(RED, '#ffffff', 0.3 * fresh); ctx.fill();
    // tiny robot head icon
    const hx = x + cw / 2, hy = y + ch / 2 + 2, hs = Math.min(cw, ch) * 0.3;
    ctx.fillStyle = on ? (i === 0 ? '#1b2140' : '#2b0f12') : '#2c3360';
    roundRect(ctx, hx - hs, hy - hs * 0.75, hs * 2, hs * 1.5, hs * 0.5); ctx.fill();
    ctx.fillStyle = on ? '#ffffff' : '#3a4275';
    ctx.beginPath(); ctx.arc(hx - hs * 0.42, hy, hs * 0.2, 0, Math.PI * 2); ctx.arc(hx + hs * 0.42, hy, hs * 0.2, 0, Math.PI * 2); ctx.fill();
  }
  // board title / counter
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = H.font('ui', 26); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.letterSpacing = '2px';
  ctx.fillText('INCIDENTS', BX0 + 18, BY0 + 34); ctx.letterSpacing = '0px';
  if (t >= tAdmit) {
    ctx.textAlign = 'right'; ctx.font = H.font('display', 38); ctx.fillStyle = lit > 1 ? RED : ACC;
    ctx.fillText(String(lit), BX1 - 18, BY0 + 36);
  }
  // first tile highlight + tag
  if (t >= tAdmit) {
    const k = K.popIn(t, tAdmit, 0.45), x = BX0 + 15 + cw / 2, y = top + ch / 2;
    H.glow(ctx, x, y, 90, ACC, 0.5 * k * (1 - 0.6 * smooth(clamp((t - tClaim) / 0.6))));
    ctx.save(); ctx.lineWidth = 5; ctx.strokeStyle = ACC; roundRect(ctx, x - cw / 2 - 6, y - ch / 2 - 6, cw + 12, ch + 12, 10); ctx.stroke(); ctx.restore();
    const tagOut = 1 - smooth(clamp((t - tCount + 0.2) / 0.3));
    if (tagOut > 0) {
      ctx.save(); ctx.globalAlpha = tagOut;
      K.drawLabel(ctx, x + 170, top - 2 + 70, Math.min(1.05, k), { text: (P.admit || 'Admitted') + ': ' + (P.first || 'Hugging Face'), size: 26, accent: true });
      ctx.restore();
    }
  }

  // characters
  const worried = t > tClaim + 1;
  K.drawPerson(ctx, 140, 1060, 1.0, { t, pose: worried ? 'shrug' : 'stand', mood: worried ? 'worried' : 'neutral', look: 0.6, skin: 3, hair: 2, shirt: '#3f7a6a', hairStyle: 'short', seed: 9 });
  K.drawRobot(ctx, 845, 1060, 0.85, { t, state: 'thinking', flip: true, seed: 2 });

  // count card
  if (t >= tCount) {
    const k = K.popIn(t, tCount, 0.5);
    ctx.fillStyle = `rgba(6,7,16,${0.5 * clamp((t - tCount) / 0.4)})`; ctx.fillRect(-200, -200, 1500, 2400);
    ctx.save(); ctx.translate(487, 760); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
    const W = 640, Hh = 360;
    roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 30); ctx.fillStyle = 'rgba(10,12,26,0.97)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = RED; roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 30); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = H.font('ui', 30); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.letterSpacing = '3px';
    ctx.fillText(P.prefix || 'AT LEAST', 0, -Hh / 2 + 46); ctx.letterSpacing = '0px';
    const n = Math.round(lerp(Math.max(1, count - 20), count, smooth(clamp((t - tCount) / 0.6))));
    ctx.font = H.font('display', 150); ctx.fillStyle = RED; ctx.fillText(String(n), 0, -6);
    const f = H.fitText(ctx, P.label || 'times OpenAI lost control of its agents', 'bold', 32, 22, W - 60); ctx.font = f.font; ctx.fillStyle = '#ffffff';
    ctx.fillText(f.text, 0, Hh / 2 - 82);
    ctx.font = H.font('ui', 24); ctx.fillStyle = ACC; ctx.fillText(P.source || 'in testing, the lawsuit claims', 0, Hh / 2 - 38);
    ctx.restore();
  }
  ctx.restore();
  if (t >= tClaim && t < tCount + 0.3) { ctx.save(); ctx.globalAlpha = 1 - clamp((t - tCount) / 0.3); K.drawLabel(ctx, 487, 520, K.popIn(t, tClaim, 0.4), { text: P.head || 'The lawsuit claims', size: 30, dot: true }); ctx.restore(); }
  void N; void rgba;
}
