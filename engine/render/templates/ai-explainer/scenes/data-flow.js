// Scene "data-flow" (full frame). Night city street: people on phones and a laptop send glowing data packets
// along curved paths over the street into a big data center, which lights up as the flow ramps up.
// The camera pushes in slowly; the flow settles into a steady stream for the last third.
// params (optional): sources  labels over the senders (2-3), default ["You", "Apps", "Sensors"]
//                    label    sign on the data center, default "Data center"
//                    time     "night" | "dusk" (default "night")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, smooth, lerp } = H;
  const D = info.duration, ACC = info.accent;
  const labels = (P.sources || ['You', 'Apps', 'Sensors']).slice(0, 3);

  // camera: slow push towards the data center
  const z = lerp(1, 1.1, H.phase(t, 0.5, D)), cx = lerp(487, 560, H.phase(t, 0.5, D)), cy = 725;
  ctx.save(); ctx.translate(487, 725); ctx.scale(z, z); ctx.translate(-cx, -cy);

  const city = K.world.city(ctx, { t, time: P.time || 'night', groundY: 960 });
  const feet = 1030;
  // senders: two people with phones + one laptop on a bench-like stand
  const senders = [
    { x: 120, kind: 'person', opts: { pose: 'phone', skin: 1, shirt: 1, hair: 4, hairStyle: 'bun', seed: 1 } },
    { x: 270, kind: 'person', opts: { pose: 'phone', skin: 3, shirt: 2, hair: 0, hairStyle: 'short', seed: 4 } },
    { x: 410, kind: 'laptop' },
  ].slice(0, Math.max(2, labels.length));
  const DC = { x: 735, y: feet - 6, s: 1.12 };
  const ramp = (s) => 0.25 + 0.75 * smooth(s / Math.max(1, D * 0.55));
  const act = ramp(t);
  K.drawDataCenter(ctx, DC.x, DC.y, DC.s, { t, activity: act, label: P.label || 'Data center' });

  // source points + curved paths into the roof of the data center
  const srcPt = (sd) => (sd.kind === 'laptop' ? [sd.x, feet - 150] : [sd.x + 12, feet - 152]);
  const paths = senders.map((sd, i) => {
    const [x0, y0] = srcPt(sd), x1 = DC.x - 120 + i * 90, y1 = DC.y - 180 * DC.s;
    return K.bezier(x0, y0 - 10, x0 + 40, 480 - i * 30, x1 - 80, 470 + i * 20, x1, y1, 48);
  });
  // paths draw in, then packets stream along them
  paths.forEach((pts, i) => {
    const k = K.phase(t, 0.3 + i * 0.15, 1.3 + i * 0.15);
    ctx.save(); ctx.strokeStyle = H.rgba('#ffffff', 0.16); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.setLineDash([2, 14]);
    K.pathDraw(ctx, pts, k); ctx.restore();
  });
  const GAP = 0.36, TRAVEL = 1.9;
  let arriving = 0;
  paths.forEach((pts, i) => {
    const off = H.hash(i, 7) * GAP;
    const k1 = Math.floor((t - off) / GAP), k0 = Math.max(0, Math.floor((t - off - TRAVEL - 0.5) / GAP));
    for (let k = k0; k <= k1; k++) {
      const s0 = off + k * GAP + 1.2;
      if (H.hash(i * 131 + 3, k) > ramp(s0)) continue;
      const u = (t - s0) / TRAVEL;
      if (u < 0) continue;
      if (u > 1) { if (u < 1.15) arriving += 1 - (u - 1) / 0.15; continue; }
      for (let j = 3; j >= 0; j--) {
        const [x, y] = K.pathPoint(pts, u - j * 0.02);
        const a = (1 - j * 0.25) * smooth(u / 0.06) * (1 - smooth((u - 0.94) / 0.06));
        if (j === 0) K.glow(ctx, x, y, 34, ACC, 0.9 * a);
        ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(x, y, j === 0 ? 8 : 5.5 - j, 0, Math.PI * 2);
        ctx.fillStyle = j === 0 ? '#ffffff' : ACC; ctx.fill(); ctx.globalAlpha = 1;
      }
    }
  });
  // roof flash when packets land
  K.glow(ctx, DC.x, DC.y - 190 * DC.s, 200, ACC, Math.min(0.6, 0.25 * arriving));

  // senders on top of the street
  senders.forEach((sd, i) => {
    const pop = K.popIn(t, 0.15 * i, 0.4);
    if (pop <= 0) return;
    ctx.save(); ctx.translate(sd.x, feet); ctx.scale(1, pop); ctx.translate(-sd.x, -feet);
    if (sd.kind === 'person') {
      // look up at the packets now and then, otherwise tap the phone
      K.drawPerson(ctx, sd.x, feet, 0.92, Object.assign({ t, typing: 1, mood: 'happy' }, sd.opts));
    } else {
      ctx.fillStyle = K.NEUTRAL.darkL; H.roundRect(ctx, sd.x - 70, feet - 96, 140, 14, 6); ctx.fill();
      ctx.fillRect(sd.x - 6, feet - 84, 12, 84);
      K.drawLaptop(ctx, sd.x, feet - 96, 0.5, { t, screen: 'chart', typing: false, shadow: false });
    }
    ctx.restore();
    if (labels[i]) {
      const lp = K.popIn(t, 0.5 + 0.15 * i, 0.4);
      if (lp > 0) K.drawLabel(ctx, sd.x, (sd.kind === 'laptop' ? feet - 190 : feet - 250) - 10, lp, { text: labels[i], size: 24 });
    }
  });
  ctx.restore();
}
