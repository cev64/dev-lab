// Scene "agent-splits" (full frame). Office at night: the agent robot holds a GOAL card; a short plan pops up step by
// step, dashed links reach server racks ("your systems"); then the robot glows and splits off three small helper bots
// that fly to three app windows and work in parallel; each window fills with content and finishes with a check.
// Fits: "an AI agent plans a task", "sub-agents / parallel agents", "works across your apps and systems".
// params (all optional): steps     2-3 plan step labels (default ["Plan", "Tools", "Systems"])
//                        stepCues  narration words for each step (else evenly in the first ~45%)
//                        apps      3 window titles (default ["Docs", "Inbox", "Data"])
//                        cue       narration word when the helpers split off (else 55% of the scene)
//                        label     accent pill over the windows (default "Sub-agents"; '' hides)
//                        goal      card held by the robot (default "GOAL")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, smooth, lerp, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const steps = (P.steps || ['Plan', 'Tools', 'Systems']).slice(0, 3);
  const cues = P.stepCues || [];
  const stepT = steps.map((_, i) => { const v = cues[i] ? info.timeOf(cues[i]) : null; return v != null ? v : D * (0.08 + i * 0.12); });
  const sysT = stepT[stepT.length - 1];
  const tSplit = (P.cue && info.timeOf(P.cue)) ?? D * 0.55;
  const apps = (P.apps || ['Docs', 'Inbox', 'Data']).slice(0, 3);

  const z = lerp(1.0, 1.05, H.phase(t, 0, D));
  ctx.save(); ctx.translate(487, 725); ctx.scale(z, z); ctx.translate(-487, -740);
  K.world.office(ctx, { t, time: 'night' });
  const feet = 1035, rx = 487, rS = 1.2;

  // server racks on the right ("your systems")
  const sysOn = K.phase(t, sysT, sysT + 0.6);
  for (let i = 0; i < 2; i++) {
    const x = 800 + i * 95, s = 0.75;
    K.drawServerRack(ctx, x, feet - 6 - i * 4, s, { t, activity: 0.2 + 0.8 * sysOn });
  }
  if (sysOn > 0) {
    ctx.save(); ctx.strokeStyle = H.rgba(ACC, 0.75 * sysOn); ctx.lineWidth = 5; ctx.setLineDash([6, 12]); ctx.lineDashOffset = -t * 40; ctx.lineCap = 'round';
    for (let i = 0; i < 2; i++) {
      const pts = K.bezier(rx + 60, feet - 170, rx + 160, feet - 260, 740 + i * 95, feet - 280, 800 + i * 95, feet - 180, 30);
      K.pathDraw(ctx, pts, sysOn);
    }
    ctx.restore();
  }

  // the agent
  const glowA = K.phase(t, tSplit - 0.6, tSplit) * (1 - K.phase(t, tSplit + 0.4, tSplit + 1.4));
  if (glowA > 0) K.glow(ctx, rx, feet - 150, 260, ACC, 0.7 * glowA);
  const squash = 1 - 0.06 * Math.sin(clamp((t - tSplit + 0.4) / 0.6) * Math.PI);
  ctx.save(); ctx.translate(rx, feet); ctx.scale(1 / squash, squash); ctx.translate(-rx, -feet);
  const state = t < stepT[0] ? 'idle' : t < tSplit - 0.6 ? 'thinking' : t < D - 1.2 ? 'working' : 'happy';
  K.drawRobot(ctx, rx, feet, rS, { t, state, seed: 2 });
  ctx.restore();
  // goal card above the robot (fades once the helpers are out)
  const gA = 1 - K.phase(t, tSplit, tSplit + 0.5);
  if (gA > 0) {
    ctx.save(); ctx.globalAlpha = gA;
    K.drawLabel(ctx, rx, feet - 225 * rS - 40 + Math.sin(t * 2) * 4, 1, { text: P.goal || 'GOAL', size: 30, accent: true });
    ctx.restore();
  }

  // plan steps (left column), fade out before the split
  const stepFade = 1 - K.phase(t, tSplit - 0.5, tSplit);
  if (stepFade > 0) {
    steps.forEach((txt, i) => {
      const p = K.popIn(t, stepT[i] - 0.1, 0.4);
      if (p <= 0) return;
      const y = 560 + i * 92;
      ctx.save(); ctx.globalAlpha = stepFade;
      K.drawLabel(ctx, 245, y, p, { text: `${i + 1}  ${txt}`, size: 30, dot: true });
      ctx.restore();
    });
  }

  // helpers split off and fly to app windows
  const winY = 505, winH = 170, winW = 250;
  const slots = [205, 487, 769];
  apps.forEach((name, i) => {
    const born = tSplit + i * 0.18, age = t - born;
    if (age < 0) return;
    const wx = slots[i];
    // window
    const wp = K.popIn(t, born + 0.35, 0.45);
    if (wp > 0) {
      ctx.save(); ctx.translate(wx, winY + winH / 2); ctx.scale(wp, wp); ctx.translate(-wx, -(winY + winH / 2));
      const x0 = wx - winW / 2;
      H.roundRect(ctx, x0, winY, winW, winH, 16); ctx.fillStyle = '#eef1f8'; ctx.fill();
      H.roundRect(ctx, x0, winY, winW, 40, 16); ctx.fillStyle = '#2a2f45'; ctx.fill(); ctx.fillRect(x0, winY + 24, winW, 16);
      for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(x0 + 20 + k * 18, winY + 20, 5.5, 0, Math.PI * 2); ctx.fillStyle = ['#ff6b5e', '#ffcc33', '#5fd38d'][k]; ctx.fill(); }
      ctx.font = H.font('ui', 24); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(name, x0 + 80, winY + 21);
      // content fills in while the helper works (each a little different)
      const work = clamp((t - born - 0.9) / Math.max(1.2, D - born - 2.2));
      const cx0 = x0 + 18, cy0 = winY + 56;
      if (i === 1) { // inbox rows
        for (let r = 0; r < 4; r++) { const v = clamp(work * 4 - r); if (v <= 0) break; H.roundRect(ctx, cx0, cy0 + r * 22, (winW - 36) * v, 14, 7); ctx.fillStyle = r % 2 ? '#b9c1d6' : '#8f9ab8'; ctx.fill(); }
      } else if (i === 2) { // bars
        for (let r = 0; r < 5; r++) { const hgt = (25 + 55 * H.hash(r, 5)) * clamp(work * 5 - r); H.roundRect(ctx, cx0 + 8 + r * 40, cy0 + 86 - hgt, 26, Math.max(0.1, hgt), 5); ctx.fillStyle = r === 3 ? ACC : '#8f9ab8'; ctx.fill(); }
      } else { // document lines
        for (let r = 0; r < 4; r++) { const v = clamp(work * 4 - r); if (v <= 0) break; H.roundRect(ctx, cx0, cy0 + r * 22, (winW - 36) * (0.55 + 0.45 * H.hash(r, 1)) * v, 10, 5); ctx.fillStyle = r === 0 ? '#4b5577' : '#b9c1d6'; ctx.fill(); }
      }
      // progress bar + done check
      H.roundRect(ctx, x0 + 14, winY + winH - 22, winW - 28, 10, 5); ctx.fillStyle = '#d5dae8'; ctx.fill();
      H.roundRect(ctx, x0 + 14, winY + winH - 22, Math.max(10, (winW - 28) * work), 10, 5); ctx.fillStyle = ACC; ctx.fill();
      if (work >= 1) {
        const c = K.popIn(t, born + 0.9 + Math.max(1.2, D - born - 2.2), 0.35);
        ctx.save(); ctx.translate(x0 + winW - 22, winY + 8); ctx.scale(c, c);
        ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
        ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-2, 8); ctx.lineTo(10, -8); ctx.stroke(); ctx.restore();
      }
      ctx.restore();
    }
    // helper bot flies from the agent to under its window, then hovers there working
    const u = clamp(age / 0.9), e = H.easeInOutCubic(u);
    const hx = lerp(rx, wx, e), hy = lerp(feet - 120, winY + winH + 125, e) - Math.sin(u * Math.PI) * 120;
    const hs = lerp(0.25, 0.58, easeOutCubic(clamp(age / 0.5)));
    if (u < 1) K.glow(ctx, hx, hy - 60, 90, ACC, 0.5 * (1 - u));
    const workDone = t > born + 0.9 + Math.max(1.2, D - born - 2.2);
    K.drawRobot(ctx, hx, hy, hs, { t: t + i, state: u < 1 ? 'idle' : workDone ? 'happy' : 'working', seed: 6 + i, shadow: false });
  });
  ctx.restore();

  // label over the windows
  if (P.label !== '') {
    const lp = K.popIn(t, tSplit + 0.6, 0.45);
    if (lp > 0) K.drawLabel(ctx, 487, 448, lp, { text: P.label || 'Sub-agents', size: 30, accent: true });
  }
}
