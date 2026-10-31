// Scene "age-gate" (full frame, 1 beat). Night hallway with a glowing arch whose plate reads "AGE ESTIMATE ?".
// Cartoon people walk left -> right through it: adults get a grey "18+" tag and walk on; the teen gets an accent
// "Under 18" tag + a shield and stops in a "Teen mode" spot. On signalCue small glowing dots stream from the walkers
// into the plate with a "Signals from use" pill (hedged: it is an estimate). On rollCue a calendar card pops with the
// rollout timing. Ends settled (teen standing, arch humming).
// Fits: age prediction / age assurance / "who counts as a minor" stories.
// params: plate ("AGE ESTIMATE"), under ("Under 18"), over ("18+"), mode ("Teen mode"), signals ("Signals from use"),
//   rollHead ("Rolling out"), roll ("Coming soon"), cues: gateCue (teen reaches the arch), signalCue, rollCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const tGate = at(P.gateCue, D * 0.3);
  const tSig = at(P.signalCue, D * 0.5) - 0.3;
  const tRoll = at(P.rollCue, D * 0.8) - 0.3;
  const AX = 487, V = 165, FEET = 1032;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 520, y: 740 }]);
  K.world.room(ctx, { t, time: 'night', floorY: 960, lamp: false, window: false, picture: false, plant: true });

  // walkers: x(t) = start + V * (t - t0), the teen stops at its spot
  const teenStop = 790;
  const walkers = [
    { x0: 140, t0: 0, s: 1.35, teen: false, skin: 3, hair: 0, shirt: '#7a5cff', hs: 'short', seed: 51 },
    { x0: -90, t0: tGate - (AX + 90) / V, s: 1.2, teen: true, skin: 2, hair: 2, shirt: '#4f8cff', hs: 'curly', seed: 31 },
    { x0: -90, t0: tGate + 1.4, s: 1.35, teen: false, skin: 0, hair: 4, shirt: '#2f9e7a', hs: 'long', seed: 57 },
  ];
  const posOf = (w) => { let x = w.x0 + V * Math.max(0, t - w.t0); if (w.teen) x = Math.min(x, teenStop); return x; };
  const tags = [];
  // arch back post + plate drawn behind the walkers, front post after
  const PL = 360, PR = 614, TOP = 560;
  const hum = 0.5 + 0.5 * Math.sin(t * 3.2);
  K.glow(ctx, AX, 760, 260, ACC, 0.12 + 0.05 * hum);
  roundRect(ctx, PL - 22, TOP, 44, FEET - TOP, 14); ctx.fillStyle = '#2b3160'; ctx.fill();
  // adults walk behind (further back), the teen in front
  const feetOf = (w) => (w.teen ? FEET + 14 : FEET - 34);
  [walkers[0], walkers[2], walkers[1]].forEach((w) => {
    if (t < w.t0 - 0.01 && w.x0 < 0) return;
    const x = posOf(w);
    if (x > 1180) return;
    const moving = !(w.teen && x >= teenStop) && t >= w.t0;
    const passed = x > AX + 30;
    K.drawPerson(ctx, x, feetOf(w), w.s, { t: t + w.seed, pose: 'stand', walk: moving ? t + w.seed : undefined, mood: passed ? 'happy' : 'neutral',
      skin: w.skin, hair: w.hair, shirt: w.shirt, hairStyle: w.hs, seed: w.seed, flip: moving, look: moving ? 0.8 : -0.3 });
    if (passed) tags.push({ x, y: feetOf(w) - 248 * w.s - 18, teen: w.teen, k: clamp((x - AX - 30) / 70) });
  });
  // front post + beam + scanner light
  roundRect(ctx, PR - 22, TOP, 44, FEET - TOP, 14); ctx.fillStyle = '#353c75'; ctx.fill();
  roundRect(ctx, PL - 40, TOP - 26, PR - PL + 80, 46, 20); ctx.fillStyle = '#353c75'; ctx.fill();
  const scanY = TOP + 40 + (FEET - TOP - 80) * (0.5 + 0.5 * Math.sin(t * 2.4));
  ctx.fillStyle = rgba(ACC, 0.22); ctx.fillRect(PL + 22, scanY - 4, PR - PL - 44, 8);
  for (const px of [PL, PR]) for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.arc(px, TOP + 90 + i * 100, 7, 0, Math.PI * 2);
    ctx.fillStyle = rgba(ACC, 0.35 + 0.5 * clamp(Math.sin(t * 4 + i) * 0.5 + 0.5)); ctx.fill();
  }
  // plate
  const plateY = 452;
  roundRect(ctx, PL - 30, plateY, PR - PL + 60, 78, 22); ctx.fillStyle = '#141829'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.6 + 0.4 * hum); ctx.stroke();
  ctx.font = H.font('ui', 30); ctx.letterSpacing = '2px'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const plate = (P.plate || 'AGE ESTIMATE');
  ctx.fillText(plate, AX - 22, plateY + 40); ctx.letterSpacing = '0px';
  const qw = ctx.measureText(plate).width;
  ctx.font = H.font('display', 40); ctx.fillStyle = ACC;
  ctx.save(); ctx.translate(AX - 22 + qw / 2 + 34, plateY + 42); const qs = 1 + 0.08 * Math.sin(t * 5); ctx.scale(qs, qs); ctx.fillText('?', 0, 0); ctx.restore();
  // plate stem
  ctx.fillStyle = '#353c75'; ctx.fillRect(AX - 8, plateY + 78, 16, TOP - 26 - plateY - 78);

  // tags above the people (screen space, follow camera roughly: same transform not needed for tiny drift)
  tags.forEach((g) => {
    const p = K.popIn(g.k * 0.6, 0, 0.4);
    if (p <= 0) return;
    if (g.teen) {
      K.drawLabel(ctx, g.x, g.y, p, { text: P.under || 'Under 18', size: 28, accent: true });
      K.drawShield(ctx, g.x + 120, g.y - 2, 0.32 * p, { shadow: false });
    } else K.drawLabel(ctx, g.x, g.y, p, { text: P.over || '18+', size: 26 });
  });
  // teen-mode spot under the teen
  const teen = walkers[1], tx = posOf(teen);
  if (tx >= teenStop - 1) {
    const sp = K.popIn(t, teen.t0 + (teenStop - teen.x0) / V, 0.4);
    if (sp > 0) {
      ctx.save(); ctx.globalAlpha = clamp(sp); ctx.beginPath(); ctx.ellipse(teenStop, FEET + 18, 120 * sp, 22 * sp, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(ACC, 0.3); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke(); ctx.restore();
    }
  }
  // signal dots: walkers -> plate
  if (t > tSig) {
    for (let i = 0; i < 14; i++) {
      const u = ((t - tSig) * 0.7 + i / 14) % 1;
      const w = walkers[i % 3], wx = posOf(w);
      if (t < w.t0 && w.x0 < 0) continue;
      const sx = wx, sy = feetOf(w) - 200 * w.s, ex = AX, ey = 500;
      const x = lerp(sx, ex, u), y = lerp(sy, ey, u) - Math.sin(u * Math.PI) * 80;
      ctx.beginPath(); ctx.arc(x, y, 6 + 3 * Math.sin(u * Math.PI), 0, Math.PI * 2);
      ctx.fillStyle = rgba(ACC, clamp((t - tSig) / 0.4) * (0.9 - 0.5 * u)); ctx.fill();
    }
    const lp = K.popIn(t, tSig, 0.4);
    if (lp > 0) K.drawLabel(ctx, 300, 660, lp, { text: P.signals || 'Signals from use', size: 28, dot: true });
  }
  // calendar card
  const cp = K.popIn(t, tRoll, 0.45);
  if (cp > 0) {
    const x0 = 656, x1 = 910, y0 = 440, y1 = 576;
    ctx.save(); ctx.translate((x0 + x1) / 2, (y0 + y1) / 2); ctx.scale(cp, cp); ctx.translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
    roundRect(ctx, x0, y0, x1 - x0, y1 - y0, 22); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    // calendar icon
    roundRect(ctx, x0 + 18, y0 + 16, 46, 46, 8); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#3b4672'; ctx.stroke();
    ctx.fillStyle = ACC; ctx.fillRect(x0 + 19, y0 + 17, 44, 13);
    ctx.fillStyle = '#3b4672'; for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) ctx.fillRect(x0 + 25 + c * 13, y0 + 36 + r * 12, 8, 7);
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#5a6488'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText((P.rollHead || 'Rolling out').toUpperCase(), x0 + 78, y0 + 40);
    const fs = H.fitText(ctx, P.roll || 'Coming soon', 'bold', 30, 20, x1 - x0 - 36);
    ctx.font = fs.font; ctx.fillStyle = '#141829'; ctx.textBaseline = 'alphabetic'; ctx.fillText(fs.text, x0 + 18, y0 + 112);
    ctx.restore();
  }
  ctx.restore();
}
