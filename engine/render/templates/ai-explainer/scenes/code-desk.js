// Scene "code-desk" (full frame). An office at dusk: on the right the robot types code at a desk, code chips
// streaming up from its laptop into a growing stack; on the left a wall board of job cards under a title. On
// `boardCue` the cards drop off one by one (fall, spin, fade) until `keep` remain; a new graduate (cartoon, cap +
// backpack, holding a CV) stands in front of the board and turns worried on `gradCue`. A `by` attribution pill
// lands on `byCue` (who says so: keep claims attributed).
// params: by (attribution pill; none if unset), byCue (20%), board ("ENTRY-LEVEL JOBS"), boardCue (40%), cards (6), keep (2),
//         grad (label over the graduate, e.g. "NEW GRAD"; none if unset), gradCue (70%)
// Fits: AI doing entry-level work, fewer junior openings, new grads struggling to get hired.
// Cues are narration words ("word#n" = the (n+1)th time spoken in the scene) or a number of seconds.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const tBy = at(P.byCue, D * 0.2) - 0.2, tBoard = at(P.boardCue, D * 0.4) - 0.1, tGrad = at(P.gradCue, D * 0.7) - 0.2;
  const nCards = clamp(P.cards || 6, 2, 6), keep = clamp(P.keep == null ? 2 : P.keep, 0, nCards);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.06, x: 440, y: 760 }]);
  K.world.office(ctx, { t, time: 'dusk' });

  // ---- job board (left wall)
  const BX0 = 80, BX1 = 520, BY0 = 510, BY1 = 860;
  roundRect(ctx, BX0, BY0, BX1 - BX0, BY1 - BY0, 18); ctx.fillStyle = '#8a6a4a'; ctx.fill();
  roundRect(ctx, BX0 + 12, BY0 + 12, BX1 - BX0 - 24, BY1 - BY0 - 24, 12); ctx.fillStyle = '#b48a5e'; ctx.fill();
  ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  roundRect(ctx, BX0 + 30, BY0 + 26, BX1 - BX0 - 60, 50, 10); ctx.fillStyle = '#0d1020'; ctx.fill();
  const ft = H.fitText(ctx, String(P.board || 'ENTRY-LEVEL JOBS'), 'ui', 26, 16, BX1 - BX0 - 90); ctx.font = ft.font; ctx.fillStyle = '#ffffff';
  ctx.fillText(ft.text, (BX0 + BX1) / 2, BY0 + 52);
  const cols = 3, cw = 116, ch = 104;
  const order = [4, 1, 5, 0, 3, 2];                    // which cards fall first
  for (let i = 0; i < nCards; i++) {
    const r = Math.floor(i / cols), c = i % cols;
    const cx = BX0 + 40 + c * (cw + 22) + cw / 2, cy = BY0 + 100 + r * (ch + 20);
    const rank = order.indexOf(i), falls = rank >= 0 && rank < nCards - keep;
    const tf = tBoard + Math.max(0, rank) * 0.45;
    const k = falls ? clamp((t - tf) / 0.9) : 0;
    if (k >= 1) continue;
    ctx.save();
    ctx.translate(cx + k * 40 * (c - 1), cy + k * k * 520); ctx.rotate(k * (c % 2 ? 0.9 : -0.8)); ctx.globalAlpha = 1 - k * k;
    roundRect(ctx, -cw / 2, 0, cw, ch, 8); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    ctx.fillStyle = '#e8786a'; ctx.beginPath(); ctx.arc(0, 4, 8, 0, Math.PI * 2); ctx.fill();   // pin
    // a tiny code glyph + lines
    ctx.strokeStyle = '#3b4672'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-30, 30); ctx.lineTo(-42, 42); ctx.lineTo(-30, 54); ctx.moveTo(-12, 30); ctx.lineTo(0, 42); ctx.lineTo(-12, 54); ctx.stroke();
    roundRect(ctx, -42, 66, 84, 8, 4); ctx.fillStyle = '#c9d0e6'; ctx.fill();
    roundRect(ctx, -42, 82, 56, 8, 4); ctx.fill();
    ctx.restore();
  }

  // ---- the graduate in front of the board
  const GX = 300, GY = 1045, GS = 1.2, worried = t > tGrad;
  ctx.save(); ctx.translate(GX, GY); ctx.scale(GS, GS);
  roundRect(ctx, 22, -176, 36, 60, 12); ctx.fillStyle = '#c94f6d'; ctx.fill();
  ctx.restore();
  K.drawPerson(ctx, GX, GY, GS, { t, pose: 'stand', mood: worried ? 'worried' : 'neutral', look: worried ? 0.6 : -0.5, shirt: '#6f86e0', skin: 3, hair: 0, hairStyle: 'curly', seed: 2 });
  // mortarboard
  ctx.save(); ctx.translate(GX, GY - 245 * GS + (worried ? 2 : 0)); ctx.rotate(-0.06);
  ctx.fillStyle = '#141829'; roundRect(ctx, -30, -8, 60, 18, 6); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-64, -10); ctx.lineTo(0, -34); ctx.lineTo(64, -10); ctx.lineTo(0, 12); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = ACC; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(44, 2); ctx.lineTo(46, 30 + Math.sin(t * 3) * 3); ctx.stroke();
  ctx.restore();
  // CV in hand
  ctx.save(); ctx.translate(GX + 52 * GS, GY - 120 * GS); ctx.rotate(0.12 + Math.sin(t * 2) * 0.03);
  roundRect(ctx, -22, -34, 44, 58, 4); ctx.fillStyle = '#f4f6fb'; ctx.fill();
  for (let i = 0; i < 4; i++) { ctx.fillStyle = '#c9d0e6'; ctx.fillRect(-14, -24 + i * 12, i === 0 ? 20 : 28, 4); }
  ctx.restore();
  const pg = K.popIn(t, tGrad, 0.45);
  if (pg > 0 && P.grad) K.drawLabel(ctx, GX, GY - 330 * GS + 24, pg, { text: String(P.grad), size: 26, accent: true });

  // ---- the robot coding at its desk (right)
  const RX = 760, RY = 1045;
  K.drawRobot(ctx, RX, RY - 40, 1.25, { t, state: 'working', seed: 5 });
  K.drawDesk(ctx, RX, RY, 1.05);
  K.drawLaptop(ctx, RX - 10, RY - 116, 0.75, { t: (t * 1.6) % 3, screen: 'code', shadow: false });
  // code chips stream up into a stack
  const every = 0.55;
  for (let i = 0; i < 12; i++) {
    const t0 = i * every - 2, age = t - t0;
    if (age < 0 || age > 1.2) continue;
    const u = H.easeInOutCubic(clamp(age / 1.2));
    const x = lerp(RX - 10, 870, u) + Math.sin(i * 2.1) * 10, y = lerp(RY - 220, 560, u);
    ctx.save(); ctx.globalAlpha = clamp(age * 4) * (1 - clamp((age - 1.0) / 0.2));
    roundRect(ctx, x - 34, y - 16, 68, 32, 8); ctx.fillStyle = i % 3 === 1 ? ACC : '#dfe4f1'; ctx.fill();
    ctx.strokeStyle = '#141829'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 14, y - 7); ctx.lineTo(x - 22, y); ctx.lineTo(x - 14, y + 7); ctx.moveTo(x + 14, y - 7); ctx.lineTo(x + 22, y); ctx.lineTo(x + 14, y + 7); ctx.stroke();
    ctx.restore();
  }
  // the stack of finished code (grows)
  const nStack = Math.min(9, Math.floor(clamp((t + 0.8) / every, 0, 99)));
  for (let i = 0; i < nStack; i++) { roundRect(ctx, 836, 560 + 210 - i * 24, 68, 20, 6); ctx.fillStyle = i % 3 === 1 ? ACC : '#c9d0e6'; ctx.fill(); }

  // ---- attribution pill
  const pb = K.popIn(t, tBy, 0.45);
  if (pb > 0 && P.by) K.drawLabel(ctx, 487, 482, pb, { text: String(P.by), size: 30, dot: true });
  ctx.restore();
}
