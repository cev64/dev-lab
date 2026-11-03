// Scene "token-chop" (full frame, 1 beat). What a token is: a night room with the kit robot reading. A sentence
// strip (tagged "Example") floats over the desk; on tokenCue a "TOKEN?" pill pops; on chopCue a laser line sweeps
// the strip and it splits into token tiles (gaps open, alternating tints); a rule pill lands; on countCue the tiles
// drop one by one into a TOKENS counter box on the desk that ticks up; on billCue a price-tag pill with a coin swings
// in. Ends settled (all tiles counted, tag still).
// params: sentence, pieces [strings; joined they should equal the sentence], example, ask ("TOKEN?"), rule, bill,
//         counter ("TOKENS"); cues tokenCue, chopCue, countCue, billCue (narration words, "word#n", or seconds)
// Fits: explaining tokens / how AI usage is metered and billed.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba, easeOutCubic } = H;
  const at = (w, d) => {
    if (w == null || w === '') return d;
    if (typeof w === 'number') return w;
    const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? d : v;
  };
  const pieces = (P.pieces && P.pieces.length ? P.pieces : ['Plan', ' my', ' trip', ' to', ' Den', 'ver']).slice(0, 8);
  const tAsk = at(P.tokenCue, 0.4) - 0.1;
  const tChop = at(P.chopCue, D * 0.2) - 0.1;
  const tCount = at(P.countCue, D * 0.65) - 0.6;
  const tBill = at(P.billCue, D * 0.85) - 0.15;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 487, y: 700 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  K.world.room(ctx, { t, time: 'night', floorY: 1000, lamp: true, window: true, picture: false, plant: true });

  // robot reading, right
  const RX = 790, RF = 1040;
  K.drawRobot(ctx, RX, RF, 1.15, { t, state: t < tChop ? 'thinking' : 'working', flip: true, seed: 11 });
  // desk + counter box, left
  K.drawDesk(ctx, 360, 1040, 1.1);
  const deskTop = 1040 - 110 * 1.1;
  const BX = 360, BW = 300, BH = 120, BY = deskTop - BH / 2;
  roundRect(ctx, BX - BW / 2, BY - BH / 2, BW, BH, 22); ctx.fillStyle = '#23283f'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = '#3b4266'; ctx.stroke();
  roundRect(ctx, BX - 70, BY - BH / 2 - 10, 140, 20, 10); ctx.fillStyle = '#0a0c14'; ctx.fill(); // slot
  ctx.fillStyle = '#b9c1d6'; ctx.font = K.font.ui(22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(P.counter || 'TOKENS', BX, BY - 28);

  // geometry of the strip / tiles
  ctx.font = H.font('display', 56);
  const widths = pieces.map((s) => ctx.measureText(s.trim()).width + 34);
  const gapK = easeOutCubic(clamp((t - tChop - 0.45) / 0.5));
  const gap = 4 + 16 * gapK;
  const total = widths.reduce((a, b) => a + b, 0) + gap * (pieces.length - 1);
  const scale = Math.min(1, 820 / total);
  const SY = 560;
  let x = 487 - (total * scale) / 2;
  const slots = widths.map((w) => { const c = x + (w * scale) / 2; x += (w + gap) * scale; return c; });

  // how many have been counted
  const step = Math.max(0.18, Math.min(0.32, (tBill - tCount) / (pieces.length + 1)));
  const dropT = pieces.map((_, i) => tCount + i * step);
  const counted = dropT.filter((d) => t > d + 0.45).length;

  // the strip before the chop (one solid card) / tiles after
  const sp = K.popIn(t, 0.0, 0.35);
  if (t < tChop + 0.45) {
    ctx.save(); ctx.translate(487, SY); ctx.scale(sp * scale, sp * scale);
    const w = total / 1;
    roundRect(ctx, -w / 2 - 10, -52, w + 20, 104, 22); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = '#161927'; ctx.font = H.font('display', 56); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.sentence || pieces.join(''), 0, 4);
    ctx.restore();
    // laser sweep
    if (t > tChop) {
      const u = clamp((t - tChop) / 0.45), lx = lerp(487 - (total * scale) / 2 - 20, 487 + (total * scale) / 2 + 20, u);
      K.glow(ctx, lx, SY, 90, ACC, 0.6);
      ctx.fillStyle = ACC; ctx.fillRect(lx - 3, SY - 80, 6, 160);
    }
  } else {
    pieces.forEach((s, i) => {
      let px = slots[i], py = SY, sc = scale, a = 1;
      const dt = t - dropT[i];
      if (dt > 0) {
        const u = clamp(dt / 0.5), e = u * u;
        px = lerp(slots[i], BX, easeOutCubic(u)); py = lerp(SY, BY - BH / 2, e) - Math.sin(u * Math.PI) * 80; sc = lerp(scale, scale * 0.45, u);
        a = u < 0.9 ? 1 : 1 - (u - 0.9) / 0.1;
        if (u >= 1) return;
      }
      ctx.save(); ctx.globalAlpha = a; ctx.translate(px, py + Math.sin(t * 3 + i) * 3 * (dt > 0 ? 0 : 1)); ctx.scale(sc, sc);
      const w = widths[i];
      roundRect(ctx, -w / 2, -50, w, 100, 18); ctx.fillStyle = i % 2 ? '#f2f4fa' : H.mixHex('#f2f4fa', ACC, 0.45); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.9); ctx.stroke();
      ctx.fillStyle = '#161927'; ctx.font = H.font('display', 56); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(s.trim(), 0, 4);
      ctx.restore();
    });
  }
  // example tag
  const exA = 1 - clamp((t - tCount) / 0.4);
  if (sp > 0 && exA > 0) { ctx.save(); ctx.globalAlpha = exA; K.drawLabel(ctx, Math.max(150, 487 - (total * scale) / 2 + 70), SY - 66, sp, { text: P.example || 'Example', size: 24 }); ctx.restore(); }
  // TOKEN? pill
  if (t > tAsk && t < tChop + 0.6) {
    const p = K.popIn(t, tAsk, 0.4), fo = 1 - clamp((t - tChop - 0.2) / 0.4);
    ctx.save(); ctx.globalAlpha = fo; K.drawLabel(ctx, 487, 470, p, { text: P.ask || 'TOKEN?', size: 34, accent: true }); ctx.restore();
  }
  // rule pill
  if (t > tChop + 0.7) K.drawLabel(ctx, 487, 700, K.popIn(t, tChop + 0.7, 0.45), { text: P.rule || '1 token ≈ a few letters', size: 32, accent: true });

  // counter digits
  const n = counted;
  ctx.fillStyle = n > 0 ? ACC : '#55607e'; ctx.font = K.font.display(64); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const bump = n > 0 ? 1 + 0.15 * Math.exp(-(t - dropT[n - 1] - 0.45) * 8) : 1;
  ctx.save(); ctx.translate(BX, BY + 16); ctx.scale(bump, bump); ctx.fillText(String(n), 0, 0); ctx.restore();

  // bill pill with a coin, swinging in
  if (t > tBill) {
    const p = K.popIn(t, tBill, 0.45), sw = Math.sin((t - tBill) * 5) * 0.08 * Math.exp(-(t - tBill) * 1.5);
    ctx.save(); ctx.translate(487, 775); ctx.rotate(sw);
    K.drawLabel(ctx, 30, 0, p, { text: P.bill || 'Billed per million tokens', size: 32 });
    ctx.restore();
    ctx.save(); ctx.font = K.font.ui(32); const lw = ctx.measureText(P.bill || 'Billed per million tokens').width; ctx.restore();
    if (p > 0) K.drawCoin(ctx, 487 + 30 - lw / 2 - 60, 775 - 6, 0.75 * Math.min(1, p), { spin: t * 4, symbol: '$' });
  }
  ctx.restore();
}
