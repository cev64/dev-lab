// Scene "fund-paths" (full frame, 1 beat). Dusk town: a fund vault on a small hill; below it three possible
// destinations: a nonprofit house with a heart sign, a small group of people, a worker next to a busy robot. On each
// destination's cue a stream of coins arcs from the vault door to it and its pill lights up (people cheer / the
// worker relaxes). On noCue a lectern with a mic (stand-in for lobbying / politics) gets a cross stamp and a pill.
// A "Possible uses" pill heads the scene (keeps it hedged). Ends settled (vault turning, coins glinting).
// Fits: where a fund / grant / settlement / tax money could go; "may fund A, B, C, but not D".
// params: fund ("Fund"), head ("Possible uses"), paths [{text, cue}] x3 (nonprofit house, group, worker + robot),
//         no ("Not for politics"), noCue (optional; else 84%), stamp ("NO")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, rgba, roundRect, mixHex } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const paths = P.paths || [{ text: 'Nonprofits', cue: null }, { text: 'Specific groups', cue: null }, { text: 'Workers', cue: null }];
  const tP = paths.map((p, i) => at(p.cue, D * (0.25 + i * 0.18)) - 0.4);
  const tNo = at(P.noCue, D * 0.84) - 0.25;
  const tHead = Math.min(1.4, tP[0] - 0.6);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 487, y: 640 }, { t: D, zoom: 1.0 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 990 });
  // hill
  ctx.beginPath(); ctx.ellipse(487, 1000, 300, 290, 0, Math.PI, 0); ctx.fillStyle = '#3a3f6e'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(487, 1000, 300, 290, 0, Math.PI * 1.55, 0); ctx.lineTo(487, 1000); ctx.closePath(); ctx.fillStyle = '#323764'; ctx.fill();

  // vault on the hill
  const VX = 487, VF = 722, W = 220, HH = 190, x0 = VX - W / 2, y0 = VF - HH;
  K.shadow(ctx, VX, VF, 260);
  roundRect(ctx, x0, y0, W, HH, 14); ctx.fillStyle = '#5d6b86'; ctx.fill();
  ctx.fillStyle = '#4c5870'; ctx.fillRect(x0 + W * 0.68, y0 + 10, W * 0.32 - 4, HH - 10);
  roundRect(ctx, x0 - 12, y0 - 16, W + 24, 26, 8); ctx.fillStyle = '#7b89a6'; ctx.fill();
  const DY = VF - 92;
  ctx.beginPath(); ctx.arc(VX, DY, 64, 0, Math.PI * 2); ctx.fillStyle = '#3a4459'; ctx.fill();
  ctx.beginPath(); ctx.arc(VX, DY, 55, 0, Math.PI * 2); ctx.fillStyle = mixHex('#8d9ab4', ACC, 0.45); ctx.fill();
  ctx.save(); ctx.translate(VX, DY); ctx.rotate(t * 0.5); ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(34, 0); ctx.stroke(); }
  ctx.restore();
  K.glow(ctx, VX, DY, 120, ACC, 0.22 + 0.05 * Math.sin(t * 2.5));
  K.drawLabel(ctx, VX, y0 - 22, 1, { text: P.fund || 'Fund', size: 24, accent: true });

  // head pill
  const hk = K.popIn(t, tHead, 0.4);
  const hOut = clamp((t - tNo - 0.2) / 0.3);
  if (hk > 0 && hOut < 1) K.drawLabel(ctx, 487, 420, Math.min(1.05, hk) * (1 - hOut), { text: P.head || 'Possible uses', size: 30, dot: true });

  // destinations
  const DX = [175, 487, 800], PILLY = 800, FEET = 1032;
  const lit = tP.map((tp) => clamp((t - tp - 1.2) / 0.4));
  // 1) nonprofit house with a heart
  {
    const x = DX[0], hw = 105, top = 850;
    K.shadow(ctx, x, FEET, 240);
    roundRect(ctx, x - hw, top, hw * 2, FEET - top, 8); ctx.fillStyle = mixHex('#7c6aa8', '#b79be8', lit[0] * 0.4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - hw - 16, top + 6); ctx.lineTo(x, top - 70); ctx.lineTo(x + hw + 16, top + 6); ctx.closePath(); ctx.fillStyle = '#5a4a82'; ctx.fill();
    roundRect(ctx, x - 24, FEET - 74, 48, 74, 6); ctx.fillStyle = '#2a2f45'; ctx.fill();
    for (const wx of [x - 70, x + 46]) { roundRect(ctx, wx, top + 40, 26, 30, 4); ctx.fillStyle = lit[0] > 0 ? 'rgba(255,231,168,0.9)' : '#3b4260'; ctx.fill(); }
    // heart sign
    const hs = 1 + 0.08 * lit[0] * Math.sin(t * 5);
    ctx.save(); ctx.translate(x, top - 18); ctx.scale(hs, hs);
    ctx.beginPath(); ctx.moveTo(0, 14); ctx.bezierCurveTo(-30, -6, -16, -30, 0, -14); ctx.bezierCurveTo(16, -30, 30, -6, 0, 14);
    ctx.fillStyle = lit[0] > 0 ? '#ff7a8a' : '#c45d6c'; ctx.fill(); ctx.restore();
  }
  // 2) a small group of people
  const grpMood = lit[1] > 0 ? 'happy' : 'neutral';
  [[-62, 1, 2, '#e8786a', 'long'], [0, 3, 0, '#6f86e0', 'short'], [62, 0, 1, '#4fb3a6', 'curly']].forEach((g, i) => {
    K.drawPerson(ctx, DX[1] + g[0], FEET, 0.82, { t, pose: lit[1] > 0.5 && i === 1 ? 'cheer' : 'stand', mood: grpMood, skin: g[1], hair: g[2], shirt: g[3], hairStyle: g[4], seed: 11 + i, look: 0 });
  });
  // 3) a worker beside a working robot
  K.drawRobot(ctx, 880, FEET, 0.55, { t, state: 'working', seed: 3 });
  K.drawPerson(ctx, 765, FEET, 0.86, { t, pose: lit[2] > 0.5 ? 'cheer' : 'shrug', mood: lit[2] > 0.5 ? 'happy' : 'worried', skin: 2, hair: 0, shirt: '#d38a3a', hairStyle: 'short', seed: 21, look: 0.4 });

  // coin streams + pills
  paths.forEach((p, i) => {
    const t0 = tP[i];
    const pts = K.bezier(VX, DY, VX + (DX[i] - VX) * 0.3, DY - 160, DX[i], PILLY - 220, DX[i], PILLY - 40, 30);
    const pa = clamp((t - t0) / 0.3) * (1 - 0.6 * clamp((t - t0 - 2) / 0.6));
    if (pa > 0) { ctx.save(); ctx.globalAlpha = pa; ctx.strokeStyle = rgba('#ffffff', 0.35); ctx.lineWidth = 4; ctx.setLineDash([3, 14]); ctx.lineCap = 'round'; K.pathDraw(ctx, pts, clamp((t - t0) / 0.5)); ctx.restore(); }
    for (let c = 0; c < 6; c++) {
      const u = (t - t0 - c * 0.18) / 1.0;
      if (u <= 0 || u >= 1) continue;
      const q = K.pathPoint(pts, H.easeInOutCubic(u));
      K.drawCoin(ctx, q[0], q[1] + 22, 0.62, { spin: t * 8 + c, shadow: false });
    }
    const pk = K.popIn(t, t0 + 0.1, 0.4);
    if (pk > 0) K.drawLabel(ctx, DX[i], PILLY, Math.min(1.05, pk), { text: p.text, size: 28, accent: lit[i] > 0.5, dot: lit[i] <= 0.5 });
    if (lit[i] > 0) K.glow(ctx, DX[i], PILLY + 120, 130, ACC, 0.14 * lit[i]);
  });

  // lobbying / politics: lectern + mic gets a cross stamp
  const nk = K.popIn(t, tNo - 0.5, 0.4);
  if (nk > 0) {
    const LX = 800, LF = 690, s = 0.8 * Math.min(1.05, nk);
    K.drawLectern(ctx, LX, LF, s);
    ctx.save(); ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(LX + 20 * s, LF - 232 * s); ctx.lineTo(LX + 40 * s, LF - 300 * s); ctx.stroke();
    ctx.beginPath(); ctx.arc(LX + 44 * s, LF - 312 * s, 14 * s, 0, Math.PI * 2); ctx.fillStyle = '#2a2f45'; ctx.fill(); ctx.restore();
    K.drawStamp(ctx, LX, LF + 10, 0.8, { kind: 'cross', text: P.stamp || 'NO', land: (t - tNo) / 0.5 });
    const pk = K.popIn(t, tNo + 0.4, 0.4);
    if (pk > 0) K.drawLabel(ctx, 487, 420, Math.min(1.05, pk), { text: P.no || 'Not for politics', size: 30, dot: true });
  }
  ctx.restore();
}
