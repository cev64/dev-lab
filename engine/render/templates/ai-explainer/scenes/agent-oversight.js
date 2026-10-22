// Scene "agent-oversight" (full frame). Night office: a manager holds a flashlight over a floor of AI agent robots
// busy with tasks; the beam can only light one or two at a time and the robots outside it get "?" marks (too little
// oversight), with a share pill on worryCue. On blameCue the room dims, a ceiling spotlight lands on the manager,
// and the robots' decision cards fly into the manager's arms while a second share pill lands (held accountable).
// params: worry ("Top worry"), worrySub ("too little human oversight"), blame ("Fear being held
//         accountable"), blameSub ("for an agent's decisions"), card ("Decision"), nervousCue, worryCue, blameCue
// Fits: oversight of AI agents, "who is responsible", humans supervising many bots, accountability worries.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp } = H;
  const at = (w, d, n = 0) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w, n); return v == null ? d : v; };
  const tNerv = at(P.nervousCue, D * 0.08), tWorry = Math.max(tNerv + 0.8, at(P.worryCue, D * 0.25));
  const tBlame = Math.max(tWorry + 2, at(P.blameCue, D * 0.62));
  const dim = K.phase(t, tBlame, tBlame + 0.6);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 520, y: 790 }, { t: tBlame, zoom: 1.0, x: 487, y: 760 }, { t: D, zoom: 1.08, x: 380, y: 820 }]);
  K.world.office(ctx, { t, time: 'night' });
  // robots at work
  const bots = [[520, 920, 0.62], [660, 920, 0.62], [800, 920, 0.62], [560, 1045, 0.8], [705, 1045, 0.8], [850, 1045, 0.8]];
  const sweepX = lerp(560, 840, 0.5 + 0.5 * Math.sin(t * 1.3 - 1.2));
  bots.forEach(([x, y, s], i) => {
    const jit = Math.sin(t * 3 + i * 1.7) * 3;
    K.drawRobot(ctx, x + jit, y, s, { t: t + i * 0.7, state: 'working', seed: 70 + i, flip: i % 2 === 1 });
  });
  // manager with a flashlight
  const shocked = t > tBlame + 0.4;
  if (dim === 0) K.drawPerson(ctx, 200, 1045, 1.25, { t, pose: 'point', mood: shocked ? 'shocked' : t > tNerv ? 'worried' : 'neutral', shirt: '#4fb3a6', skin: 3, hair: 2, hairStyle: 'bun', seed: 2, look: 0.9 });
  // sweat drop when nervous
  if (t > tNerv && !shocked) {
    const ph = ((t - tNerv) * 0.9) % 1;
    ctx.save(); ctx.globalAlpha = Math.sin(ph * Math.PI); ctx.fillStyle = '#8fd3ff';
    ctx.beginPath(); const dx = 245, dy = 745 + ph * 30; ctx.moveTo(dx, dy - 14); ctx.quadraticCurveTo(dx + 10, dy, dx, dy + 6); ctx.quadraticCurveTo(dx - 10, dy, dx, dy - 14); ctx.fill(); ctx.restore();
  }
  // flashlight beam (fades as the spotlight takes over)
  const beamA = (1 - dim) * K.phase(t, 0.2, 0.8);
  if (beamA > 0) {
    const hx = 300, hy = 800;
    ctx.save(); ctx.globalAlpha = 0.28 * beamA;
    const g = ctx.createLinearGradient(hx, hy, sweepX, 950); g.addColorStop(0, '#fff6c8'); g.addColorStop(1, 'rgba(255,246,200,0.15)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(hx, hy - 8); ctx.lineTo(sweepX - 90, 1060); ctx.lineTo(sweepX + 90, 1060); ctx.lineTo(hx, hy + 8); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(Math.atan2(950 - hy, sweepX - hx));
    H.roundRect(ctx, -30, -10, 46, 20, 6); ctx.fillStyle = '#2a2f45'; ctx.fill(); H.roundRect(ctx, 12, -14, 14, 28, 4); ctx.fillStyle = '#ffe7a8'; ctx.fill();
    ctx.restore();
  }
  // "?" over robots outside the beam
  if (t > tWorry && dim < 1) bots.forEach(([x, y, s], i) => {
    const inBeam = Math.abs(x - sweepX) < 75;
    const p = K.popIn(t, tWorry + 0.15 * i, 0.35) * (1 - dim);
    if (p <= 0 || inBeam) return;
    ctx.save(); ctx.globalAlpha = clamp(p); ctx.fillStyle = ACC; ctx.font = H.font('display', 40); ctx.textAlign = 'center';
    ctx.fillText('?', x + 30 * s, y - 230 * s - 6 + Math.sin(t * 4 + i) * 4); ctx.restore();
  });
  ctx.restore();

  // dim + spotlight on the manager
  if (dim > 0) {
    ctx.save(); ctx.fillStyle = `rgba(5,6,14,${0.55 * dim})`; ctx.fillRect(0, 0, info.width, info.height); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.32 * dim; ctx.fillStyle = '#fff6c8';
    ctx.beginPath(); ctx.moveTo(150, 380); ctx.lineTo(250, 380); ctx.lineTo(340, 1050); ctx.lineTo(60, 1050); ctx.closePath(); ctx.fill();
    ctx.globalAlpha = 0.4 * dim; ctx.beginPath(); ctx.ellipse(200, 1045, 140, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // redraw the manager on top, lit
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 520, y: 790 }, { t: tBlame, zoom: 1.0, x: 487, y: 760 }, { t: D, zoom: 1.08, x: 380, y: 820 }]);
    K.drawPerson(ctx, 200, 1045, 1.25, { t, pose: 'shrug', mood: shocked ? 'shocked' : 'worried', shirt: '#4fb3a6', skin: 3, hair: 2, hairStyle: 'bun', seed: 2, look: 0.9 });
    // decision cards fly from the robots into the manager's arms
    for (let i = 0; i < 6; i++) {
      const t0 = tBlame + 0.5 + i * 0.32, k = K.phase(t, t0, t0 + 0.75, H.easeInOutCubic);
      if (k <= 0) continue;
      const [bx, by, bs] = bots[i];
      const sx = bx, sy = by - 200 * bs, ex = 205 + (i % 2 ? 10 : -10), ey = 905 - i * 12;
      const x = lerp(sx, ex, k), y = lerp(sy, ey, k) - Math.sin(k * Math.PI) * 140;
      ctx.save(); ctx.translate(x, y); ctx.rotate((1 - k) * (i % 2 ? 0.6 : -0.6));
      H.roundRect(ctx, -46, -30, 92, 60, 8); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      H.roundRect(ctx, -36, -18, 24, 20, 5); ctx.fillStyle = '#1c2033'; ctx.fill();
      ctx.fillStyle = ACC; ctx.fillRect(-32, -13, 5, 5); ctx.fillRect(-22, -13, 5, 5);
      ctx.fillStyle = '#b9c1d6'; ctx.fillRect(-4, -14, 40, 6); ctx.fillRect(-36, 10, 70, 6);
      ctx.restore();
    }
    ctx.restore();
  }

  // pills
  const pw = K.popIn(t, tWorry, 0.45), fadeW = 1 - clamp((t - tBlame) / 0.35);
  if (pw > 0 && fadeW > 0) {
    ctx.save(); ctx.globalAlpha = fadeW;
    K.drawLabel(ctx, 487, 500, pw, { text: P.worry || 'Top worry', size: 34, accent: true });
    const ps = K.popIn(t, tWorry + 0.4, 0.45);
    if (ps > 0) K.drawLabel(ctx, 487, 566, ps, { text: P.worrySub || 'too little human oversight', size: 30 });
    ctx.restore();
  }
  const pb = K.popIn(t, tBlame + 0.1, 0.45);
  if (pb > 0) {
    K.drawLabel(ctx, 520, 500, pb, { text: P.blame || 'Fear being held accountable', size: 32, accent: true });
    const ps = K.popIn(t, tBlame + 0.5, 0.45);
    if (ps > 0) K.drawLabel(ctx, 520, 566, ps, { text: P.blameSub || "for an agent's decisions", size: 30 });
  }
}
