// Scene "go-underground" (full frame). Payoff. A ground cross-section: night sky above, soil layers below. A data center
// stands on the surface humming (pill "Real buildings" at the real cue); at the target cue a warning sign pulses beside
// it; at the move cue the building sinks smoothly into a dug bunker in the soil, earth closes over it leaving small
// vents and a hatch, and a question pill lands. Ends settled with the vents breathing softly.
// Fits: payoffs about resilience, "should it move underground / be protected", bunkers, hardening infrastructure.
// params (all optional): tag ("AI cloud"), real ("Real buildings"), question ("Underground?"), cues: realCue (25 %), targetCue (55 %), moveCue (80 %)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth } = H;
  const D = info.duration, ACC = info.accent;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tReal = at(P.realCue, D * 0.25), tTarget = at(P.targetCue, D * 0.55), tMove = at(P.moveCue, D * 0.8);

  const gy = 780;
  const g = ctx.createLinearGradient(0, 0, 0, gy); g.addColorStop(0, '#080c22'); g.addColorStop(1, '#2c3470');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, gy);
  for (let i = 0; i < 30; i++) { ctx.globalAlpha = 0.4 * (0.5 + 0.5 * Math.sin(t * 1.3 + i)); ctx.fillStyle = '#fff'; ctx.fillRect(H.hash(i, 9) * 1080, 300 + H.hash(i, 8) * 380, 3, 3); }
  ctx.globalAlpha = 1;
  // soil layers
  const layers = ['#3a2d3e', '#33283a', '#2a2133', '#1f1928', '#16121e'];
  layers.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(0, gy + i * 70, 1080, 1920); });
  for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(H.hash(i, 2) * 1080, gy + 30 + H.hash(i, 3) * 320, 4 + 6 * H.hash(i, 4), 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fill(); }
  ctx.fillStyle = '#3e5a4a'; ctx.fillRect(0, gy - 6, 1080, 14);

  const z = lerp(1.0, 1.04, K.phase(t, 0, D));
  ctx.save(); ctx.translate(487, 760); ctx.scale(z, z); ctx.translate(-487, -760);
  const sink = K.phase(t, tMove, tMove + 1.2);
  const bx = 487, s = 1.25, by = lerp(gy, gy + 250, sink);
  // bunker hole outline (appears as it sinks)
  if (sink > 0) {
    ctx.save(); ctx.globalAlpha = smooth(sink / 0.3);
    H.roundRect(ctx, bx - 235, gy + 8, 470, 260, 16); ctx.fillStyle = '#0b0912'; ctx.fill();
    ctx.strokeStyle = 'rgba(223,228,241,0.25)'; ctx.lineWidth = 6; ctx.stroke(); ctx.restore();
  }
  ctx.save();
  if (sink > 0) { ctx.beginPath(); ctx.rect(0, 0, 1080, gy + 268); ctx.clip(); }
  K.drawDataCenter(ctx, bx, by, s, { t, activity: 0.8, shadow: sink === 0 });
  ctx.restore();
  // earth closing over: a lid that slides in once the building is down
  const lid = K.phase(t, tMove + 0.9, tMove + 1.6);
  if (lid > 0) {
    ctx.fillStyle = '#3a2d3e'; ctx.fillRect(bx - 240, gy - 2, 480 * lid, 16);
    ctx.fillStyle = '#3e5a4a'; ctx.fillRect(bx - 240, gy - 6, 480 * lid, 8);
    if (lid >= 1) {
      // vents + hatch
      for (const vx of [bx - 140, bx + 140]) {
        H.roundRect(ctx, vx - 18, gy - 50, 36, 50, 6); ctx.fillStyle = '#b9c1d6'; ctx.fill();
        H.roundRect(ctx, vx - 26, gy - 60, 52, 16, 6); ctx.fillStyle = '#dfe4f1'; ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3;
        for (let k = 0; k < 2; k++) { const ph = ((t * 0.6 + k * 0.5) % 1); ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.7; ctx.beginPath(); ctx.moveTo(vx, gy - 66 - ph * 50); ctx.quadraticCurveTo(vx + 10, gy - 76 - ph * 50, vx, gy - 86 - ph * 50); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      H.roundRect(ctx, bx - 40, gy - 14, 80, 16, 6); ctx.fillStyle = '#5a6274'; ctx.fill();
    }
  }
  // tag on the building while it is up
  const tagA = (1 - smooth(sink / 0.3)) * Math.min(1, K.popIn(t, 0.2, 0.45));
  if (tagA > 0) K.drawLabel(ctx, bx, by - 260, tagA, { text: P.tag || 'AI cloud', size: 28, dot: true });
  // warning sign beside it
  const wp = K.popIn(t, tTarget, 0.4) * (1 - smooth((t - tMove) / 0.5));
  if (wp > 0) K.drawWarning(ctx, 820, gy - 10, Math.min(1.06, wp) * 0.9, { pulse: 0.5 + 0.5 * Math.sin(t * 7) });
  // big question mark when underground
  const qp = K.popIn(t, tMove + 1.2, 0.5);
  if (qp > 0) {
    ctx.save(); ctx.translate(bx, gy - 30); ctx.rotate(0.07 * Math.sin(t * 2)); ctx.scale(qp, qp);
    ctx.font = K.font.display(160); ctx.textAlign = 'center'; ctx.lineWidth = 12; ctx.strokeStyle = '#0a0d1c'; ctx.strokeText('?', 0, 0); ctx.fillStyle = ACC; ctx.fillText('?', 0, 0);
    ctx.restore();
  }
  ctx.restore();
  // top pill slot: "real buildings" then the question
  const rp = K.popIn(t, tReal, 0.45) * (1 - smooth((t - tMove) / 0.3));
  if (rp > 0) K.drawLabel(ctx, 487, 520, Math.min(1.06, rp), { text: P.real || 'Real buildings', size: 34, accent: true });
  const q2 = K.popIn(t, tMove + 0.3, 0.45);
  if (q2 > 0) K.drawLabel(ctx, 487, 520, Math.min(1.06, q2), { text: P.question || 'Underground?', size: 36, accent: true });
}
