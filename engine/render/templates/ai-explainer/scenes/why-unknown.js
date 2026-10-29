// Scene "why-unknown" (full frame, the caveat beat). A study room at night: a big clipboard tallies little
// student heads (ticks land one by one) while a magnifier sweeps over it; on `countsCue` a "WHY?" thought cloud
// rises next to it with an empty answer box and a pill (`counts`). On `earlyCue` a panel of 50 tiny college
// buildings appears and the reporting share lights up (`share` %, default 50 -> 25 of 50) with an `early` pill; on
// `finalCue` a desk calendar flips to `month` with a `final` pill. A cartoon researcher shrugs beside it.
// params: counts, countsCue (10%), early, earlyCue (40%), share (50), final, finalCue (75%), month ("?"),
//         why ("WHY?")
// Fits: caveats of a dataset: it counts what happened, not why; early / partial data; final numbers later.
// Cues are narration words ("word#n" = the (n+1)th time spoken in the scene) or a number of seconds.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const tCounts = at(P.countsCue, D * 0.1) - 0.2, tEarly = at(P.earlyCue, D * 0.4) - 0.2, tFinal = at(P.finalCue, D * 0.75) - 0.5;
  const share = clamp(P.share == null ? 50 : Number(P.share), 0, 100);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 400, y: 760 }, { t: tEarly + 0.5, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.03, x: 520, y: 760 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true, plant: true });

  // ---- clipboard on an easel (left)
  const CX = 280, CY0 = 520, CW = 330, CH = 420;
  ctx.fillStyle = '#3b4260'; ctx.fillRect(CX - 8, CY0 + CH - 10, 16, 1040 - (CY0 + CH - 10));
  ctx.save(); ctx.translate(CX, 1040); ctx.rotate(0.25); ctx.fillRect(-6, -180, 12, 180); ctx.restore();
  ctx.save(); ctx.translate(CX, 1040); ctx.rotate(-0.25); ctx.fillRect(-6, -180, 12, 180); ctx.restore();
  roundRect(ctx, CX - CW / 2, CY0, CW, CH, 18); ctx.fillStyle = '#8a6a4a'; ctx.fill();
  roundRect(ctx, CX - CW / 2 + 18, CY0 + 22, CW - 36, CH - 40, 8); ctx.fillStyle = '#f4f6fb'; ctx.fill();
  roundRect(ctx, CX - 50, CY0 - 14, 100, 34, 8); ctx.fillStyle = '#9aa3bd'; ctx.fill();
  // tally of heads: 4 rows x 5
  const nHeads = Math.min(20, Math.floor(t * 4.5) + 6);
  for (let i = 0; i < 20; i++) {
    const r = Math.floor(i / 5), c = i % 5;
    const x = CX - CW / 2 + 60 + c * 52, y = CY0 + 80 + r * 74;
    ctx.fillStyle = i < nHeads ? '#3b4672' : '#dfe4f1';
    ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill();
    roundRect(ctx, x - 17, y + 15, 34, 22, 10); ctx.fill();
  }
  // tick strokes under the heads
  ctx.strokeStyle = '#3b4672'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let g = 0; g < Math.min(4, Math.floor(nHeads / 5)); g++) {
    const x = CX - CW / 2 + 50 + g * 64, y = CY0 + CH - 58;
    ctx.beginPath(); for (let k = 0; k < 4; k++) { ctx.moveTo(x + k * 10, y - 16); ctx.lineTo(x + k * 10, y + 16); } ctx.moveTo(x - 6, y + 12); ctx.lineTo(x + 38, y - 12); ctx.stroke();
  }
  // magnifier sweeping
  const mx = CX + Math.sin(t * 1.3) * 90, my = CY0 + 200 + Math.cos(t * 1.1) * 80;
  ctx.save(); ctx.lineWidth = 12; ctx.strokeStyle = '#3b4260';
  ctx.beginPath(); ctx.moveTo(mx + 42, my + 42); ctx.lineTo(mx + 90, my + 90); ctx.stroke();
  ctx.lineWidth = 9; ctx.strokeStyle = '#dfe4f1'; ctx.beginPath(); ctx.arc(mx, my, 56, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(200,230,255,0.18)'; ctx.fill();
  ctx.restore();

  // ---- WHY? cloud with an empty answer
  const pw = K.popIn(t, tCounts, 0.5);
  if (pw > 0) {
    const wx = 640, wy = 600, gone = clamp((t - tEarly) / 0.4);
    ctx.save(); ctx.globalAlpha = 1 - gone; ctx.translate(wx, wy - gone * 60); ctx.scale(Math.min(1.04, pw), Math.min(1.04, pw)); ctx.translate(0, Math.sin(t * 1.6) * 4);
    ctx.fillStyle = '#f4f6fb';
    for (const [dx, dy, r] of [[-90, 10, 60], [-20, -20, 74], [70, 0, 64], [130, 30, 44], [20, 40, 60], [-120, 50, 40]]) { ctx.beginPath(); ctx.arc(dx, dy, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.font = H.font('display', 64); ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(P.why || 'WHY?'), 0, 10);
    ctx.restore();
    // bubbles to the clipboard
    for (let i = 0; i < 3; i++) { const k = clamp(pw * 3 - i) * (1 - gone); if (k <= 0) continue; ctx.fillStyle = '#f4f6fb'; ctx.beginPath(); ctx.arc(lerp(470, 540, i / 2), lerp(720, 670, i / 2), (8 + i * 5) * k, 0, Math.PI * 2); ctx.fill(); }
    if (P.counts) K.drawLabel(ctx, 487, 470, K.popIn(t, tCounts + 0.3, 0.45), { text: String(P.counts), size: 30, accent: true });
  }
  // ---- 50 colleges, share reporting
  const pe = K.popIn(t, tEarly, 0.5);
  if (pe > 0) {
    const GX0 = 520, GY0 = 600, cols = 10, rows = 5, cell = 38;
    const lit = Math.round(share / 2);
    ctx.save(); ctx.translate(GX0 + 190, GY0 + 100); ctx.scale(Math.min(1.03, pe), Math.min(1.03, pe)); ctx.translate(-(GX0 + 190), -(GY0 + 100));
    roundRect(ctx, GX0 - 20, GY0 - 20, cols * cell + 40, rows * cell + 40, 16); ctx.fillStyle = 'rgba(10,12,24,0.9)'; ctx.fill();
    for (let i = 0; i < cols * rows; i++) {
      const r = Math.floor(i / cols), c = i % cols, x = GX0 + c * cell + cell / 2, y = GY0 + r * cell + cell / 2;
      const order = (i * 37) % (cols * rows);           // scattered fill order
      const on = order < lit && t > tEarly + 0.3 + order * 0.025;
      const col = on ? ACC : '#4a5275';
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(x - 14, y - 4); ctx.lineTo(x, y - 14); ctx.lineTo(x + 14, y - 4); ctx.closePath(); ctx.fill();
      ctx.fillRect(x - 11, y - 3, 4, 14); ctx.fillRect(x - 2, y - 3, 4, 14); ctx.fillRect(x + 7, y - 3, 4, 14);
      ctx.fillRect(x - 14, y + 11, 28, 4);
    }
    ctx.restore();
    if (P.early) K.drawLabel(ctx, GX0 + 190, GY0 - 34, K.popIn(t, tEarly + 0.3, 0.45), { text: String(P.early), size: 28 });
  }
  // ---- desk calendar flips to the month
  const pf = K.popIn(t, tFinal, 0.5);
  if (pf > 0) {
    const kx = 600, ky = 1040;
    ctx.save(); ctx.translate(kx, ky); ctx.scale(pf, pf);
    roundRect(ctx, -70, -150, 140, 150, 14); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    roundRect(ctx, -70, -150, 140, 46, 14); ctx.fillStyle = '#e8786a'; ctx.fill(); ctx.fillRect(-70, -120, 140, 16);
    ctx.fillStyle = '#3b4260'; for (const dx of [-36, 36]) { roundRect(ctx, dx - 6, -164, 12, 28, 6); ctx.fill(); }
    const flip = clamp((t - tFinal - 0.3) / 0.4);
    ctx.font = H.font('display', 46); ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.globalAlpha = flip; ctx.fillText(String(P.month || '?'), 0, -52);
    ctx.restore();
    if (P.final) K.drawLabel(ctx, 600, 862, K.popIn(t, tFinal + 0.35, 0.45), { text: String(P.final), size: 28, accent: true });
  }
  // ---- researcher shrugging (right)
  const sh = t > tCounts + 0.2 && t < tEarly + 0.4;
  K.drawPerson(ctx, 860, 1040, 1.1, { t, pose: sh ? 'shrug' : 'stand', mood: 'neutral', look: -0.7, flip: true, shirt: '#a08be0', skin: 0, hair: 2, hairStyle: 'long', seed: 9 });
  ctx.restore();
}
