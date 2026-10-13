// Scene "tv-box-lab" (full frame). A lab at night: two generic cartoon researchers at a bench with a shelf of cheap
// streaming boxes. The boxes pop in one by one (count label), a price tag swings in, then one AI model runs across
// them all: a glowing token snakes box to box (each box holds a slice of the model) and a robot hologram rises above
// the shelf. Finally the shelf dims and a 3x3 grid of generic hardware tiles gets ticked one by one (n of 9).
// Fits: "they ran an AI on cheap devices", distributed / edge inference, "a small model worked on X of Y machines".
// params: count (label, "15 TV boxes"), price (pill, "~$55 each"), hw ("8 of 9"), hwLabel ("hardware types tested"),
//         hits (ticked tiles, default 8), boxesCue, priceCue, runCue, smallCue (grid appears), hwCue (count lands)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const TAU = Math.PI * 2;
  const tc = (w, d) => { const v = w ? info.timeOf(w) : null; return v != null ? v : d; };
  const rr = (x, y, w, h, r, fill) => { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); };
  const circle = (x, y, r, fill) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); };
  const boxesAt = tc(P.boxesCue, D * 0.12), priceAt = tc(P.priceCue, D * 0.3), runAt = tc(P.runCue, D * 0.45);
  const gridAt = tc(P.smallCue, D * 0.68) - 0.3, hwAt = tc(P.hwCue, D * 0.85);
  function big(text, x, y, size, color, a) {
    if (a <= 0) return;
    const r = H.fitText(ctx, text, 'display', size, 26, 800);
    ctx.save(); ctx.globalAlpha *= clamp(a); ctx.font = r.font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round'; ctx.lineWidth = r.size * 0.16; ctx.strokeStyle = 'rgba(8,10,22,0.92)'; ctx.strokeText(r.text, x, y);
    ctx.fillStyle = color; ctx.fillText(r.text, x, y); ctx.restore();
  }

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 487, y: 800 }, { t: runAt, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.02, x: 487, y: 740 }]);
  K.world.room(ctx, { t, time: 'night', floorY: 880, window: false, picture: false, lamp: false, plant: false, wall: '#26304f' });
  // pegboard on the wall
  rr(120, 430, 840, 230, 16, '#2f3a60');
  for (let r = 0; r < 6; r++) for (let c = 0; c < 22; c++) circle(150 + c * 37, 452 + r * 37, 3, '#26304f');

  const dim = 1 - 0.8 * clamp((t - gridAt) / 0.5);
  ctx.save(); ctx.globalAlpha = dim;
  // bench
  K.shadow(ctx, 487, 1012, 640);
  rr(190, 900, 600, 26, 10, '#8a6a52'); rr(210, 926, 22, 84, 6, '#5d4636'); rr(748, 926, 22, 84, 6, '#5d4636');
  // shelf frame
  rr(205, 676, 570, 14, 6, '#4a5170'); rr(205, 756, 570, 10, 5, '#4a5170'); rr(205, 832, 570, 10, 5, '#4a5170');
  rr(205, 676, 12, 224, 5, '#4a5170'); rr(763, 676, 12, 224, 5, '#4a5170');
  // 15 boxes: 5 x 3, snake order for the pipeline
  const boxes = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
    const cc = r % 2 ? 4 - c : c;
    boxes.push({ x: 230 + cc * 108, y: 718 + r * 76 });
  }
  const runU = t > runAt ? ((t - runAt) * 3.2) % 15 : -1;
  // cables (snake)
  const shown = boxes.filter((b, i) => t > boxesAt - 0.3 + i * 0.07);
  if (shown.length > 1) {
    ctx.strokeStyle = t > runAt ? rgba(ACC, 0.55) : 'rgba(170,180,220,0.45)'; ctx.lineWidth = 4; ctx.beginPath();
    shown.forEach((b, i) => { const x = b.x + 46, y = b.y + 18; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }); ctx.stroke();
  }
  boxes.forEach((b, i) => {
    const p = K.popIn(t, boxesAt - 0.3 + i * 0.07, 0.35);
    if (p <= 0) return;
    ctx.save(); ctx.translate(b.x + 46, b.y + 34); ctx.scale(p, p); ctx.translate(-46, -34);
    const hot = runU >= 0 ? Math.max(0, 1 - Math.abs(runU - i) / 1.2) : 0;
    const on = t > runAt + i * 0.05;
    if (hot > 0) K.glow(ctx, 46, 18, 70, ACC, 0.6 * hot);
    rr(0, 0, 92, 36, 9, '#1d2033'); rr(0, 0, 92, 10, 5, '#2b2f48');
    circle(78, 20, 5, on ? ACC : (Math.sin(t * 4 + i) > 0 ? '#ff6b5e' : '#6a2f38'));
    if (on) for (let k = 0; k < 4; k++) rr(10 + k * 12, 16, 7, 9, 2, hot > 0.3 || Math.floor(t * 6 + i + k) % 3 ? ACC : '#4a5a7a');
    ctx.restore();
  });
  // token running through the pipeline
  if (runU >= 0) {
    const i0 = Math.floor(runU), f = runU - i0, a = boxes[i0], b = boxes[Math.min(14, i0 + 1)];
    const x = lerp(a.x, b.x, f) + 46, y = lerp(a.y, b.y, f) + 18;
    K.glow(ctx, x, y, 40, ACC, 0.9); circle(x, y, 8, '#ffffff');
  }
  // hologram robot above the shelf
  const hp = clamp((t - runAt - 0.2) / 0.6);
  if (hp > 0) {
    ctx.save(); ctx.globalAlpha *= 0.85 * hp;
    ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, 560, 0, 690); g.addColorStop(0, rgba(ACC, 0)); g.addColorStop(1, rgba(ACC, 0.25));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(420, 560); ctx.lineTo(554, 560); ctx.lineTo(700, 690); ctx.lineTo(274, 690); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.globalAlpha *= hp; K.drawRobot(ctx, 487, lerp(700, 676, hp), 0.62, { t, state: 'working', seed: 2 }); ctx.restore();
  }
  // price tag hanging from the shelf
  const pp = K.popIn(t, priceAt - 0.15, 0.45);
  if (pp > 0) {
    ctx.save(); ctx.translate(742, 676); ctx.rotate(Math.sin((t - priceAt) * 2.4) * 0.12 * Math.exp(-(t - priceAt) * 0.5)); ctx.scale(pp, pp);
    ctx.strokeStyle = '#c4c9d8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.stroke();
    rr(-62, 30, 124, 64, 14, ACC); circle(0, 42, 6, '#1a1e33');
    ctx.fillStyle = '#1a1e33'; ctx.font = H.font('display', 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('~$55', 0, 70);
    ctx.restore();
  }
  ctx.restore(); // dim

  // researchers (generic cartoons)
  const cheer = t > runAt + 0.6 && t < gridAt;
  K.drawPerson(ctx, 125, 1030, 1.05, { t, pose: t > boxesAt && t < runAt ? 'point' : cheer ? 'cheer' : 'stand', mood: cheer ? 'happy' : 'neutral', skin: 1, hair: 0, shirt: '#e6eaf4', hairStyle: 'bun', look: 0.6, seed: 2 });
  K.drawPerson(ctx, 852, 1030, 1.05, { t, pose: t > runAt + 0.3 && t < gridAt ? 'cheer' : 'stand', flip: true, mood: 'happy', skin: 3, hair: 2, shirt: '#e6eaf4', hairStyle: 'short', look: 0.6, seed: 6 });

  // labels
  const lOut = 1 - clamp((t - gridAt) / 0.4);
  if (lOut > 0) {
    ctx.save(); ctx.globalAlpha = lOut;
    const cp = K.popIn(t, boxesAt + 0.2, 0.45);
    if (cp > 0) { ctx.save(); ctx.translate(487, 530); ctx.scale(cp, cp); big(P.count || '15 TV boxes', 0, 0, 74, ACC, 1); ctx.restore(); }
    const sp = K.popIn(t, priceAt + 0.1, 0.4);
    if (sp > 0) K.drawLabel(ctx, 487, 600, sp, { text: P.price || '~$55 each', size: 30 });
    ctx.restore();
  }

  // hardware grid
  if (t > gridAt) {
    const hits = P.hits == null ? 8 : P.hits, miss = 5;
    const order = [0, 1, 2, 3, 4, 6, 7, 8]; // tiles that get ticked, in order; tile `miss` gets the cross
    for (let i = 0; i < 9; i++) {
      const c = i % 3, r = Math.floor(i / 3), x = 252 + c * 170, y = 590 + r * 128;
      const p = K.popIn(t, gridAt + 0.1 + i * 0.05, 0.4);
      if (p <= 0) continue;
      ctx.save(); ctx.translate(x + 75, y + 55); ctx.scale(p, p); ctx.translate(-75, -55);
      rr(0, 0, 150, 110, 16, 'rgba(14,17,34,0.94)'); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; roundRect(ctx, 0, 0, 150, 110, 16); ctx.stroke();
      // generic hardware glyphs
      const k = i % 5;
      if (k === 0) { rr(35, 30, 80, 52, 6, '#3d7a5a'); for (let j = 0; j < 4; j++) rr(42 + j * 18, 40, 10, 10, 2, '#c9a64a'); rr(70, 60, 30, 16, 3, '#1a1e33'); }
      else if (k === 1) { rr(40, 34, 70, 46, 10, '#c9cede'); circle(98, 46, 4, ACC); }
      else if (k === 2) { rr(38, 28, 74, 46, 5, '#1a1e33'); rr(42, 32, 66, 38, 3, '#2c3a6a'); rr(28, 74, 94, 8, 4, '#9aa0b8'); }
      else if (k === 3) { rr(30, 40, 90, 34, 6, '#2c3048'); for (let j = 0; j < 2; j++) circle(55 + j * 40, 57, 12, '#4b5075'); }
      else { rr(58, 22, 34, 66, 6, '#3a4166'); circle(75, 36, 5, ACC); rr(64, 60, 22, 4, 2, '#5a6390'); }
      ctx.restore();
      const idx = order.indexOf(i);
      if (idx >= 0 && idx < hits) {
        const at = lerp(gridAt + 0.6, hwAt - 0.1, idx / Math.max(1, hits - 1));
        const q = K.popIn(t, at, 0.3);
        if (q > 0) { ctx.save(); ctx.translate(x + 128, y + 16); ctx.scale(q, q); circle(0, 0, 20, ACC); ctx.strokeStyle = '#1a1e33'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-2, 7); ctx.lineTo(10, -7); ctx.stroke(); ctx.restore(); }
      } else if (i === miss) {
        const q = K.popIn(t, hwAt + 0.4, 0.3);
        if (q > 0) { ctx.save(); ctx.translate(x + 128, y + 16); ctx.scale(q, q); circle(0, 0, 20, '#7d8299'); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-7, -7); ctx.lineTo(7, 7); ctx.moveTo(7, -7); ctx.lineTo(-7, 7); ctx.stroke(); ctx.restore(); }
      }
    }
    const hp2 = K.popIn(t, hwAt - 0.1, 0.45);
    if (hp2 > 0) { ctx.save(); ctx.translate(487, 545); ctx.scale(hp2, hp2); big(P.hw || '8 of 9', 0, 0, 80, ACC, 1); ctx.restore(); }
    const lp = K.popIn(t, hwAt + 0.3, 0.4);
    if (lp > 0) K.drawLabel(ctx, 487, 1000, lp, { text: P.hwLabel || 'hardware types tested', size: 28 });
  }
  ctx.restore();
}
