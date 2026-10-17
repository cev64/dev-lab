// Scene "who-checks-locks" (full frame; 1 beat, payoff). Night hallway with a big locked door between a robot (left)
// and an office worker (right).
// Phase 1: a notice card lists who is involved; black redaction bars swipe over the names, a "Not named" stamp lands.
// Phase 2: the card flips into a question card; the door's padlock swings; answer chips pop above the robot and the
//   worker on their cues; both look at the lock; settles with a gently pulsing "?".
// Fits: "who is responsible", "names withheld", any security payoff question with two sides.
// params (all optional): rows [2], notNamed, question, a, b; cues: nameCue, qCue, aCue, bCue (bCue = last occurrence)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent, N = K.NEUTRAL;
  const at = (w, d) => { const v = w != null ? info.timeOf(w) : null; return v == null ? d : v; };
  const lastOf = (w, d) => { if (w == null) return d; let v = null; for (let n = 0; n < 8; n++) { const x = info.timeOf(w, n); if (x == null) break; v = x; } return v == null ? d : v; };
  const tName = at(P.nameCue, 0.6), tQ = at(P.qCue, D * 0.5) - 0.4, tA = at(P.aCue, D * 0.7), tBb = lastOf(P.bCue, D * 0.83);
  const rows = (P.rows && P.rows.length ? P.rows : ['AI companies', 'Organisations']).slice(0, 2);
  const feet = 1012;
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 487, y: 720 }, { t: tQ, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.06, x: 487, y: 760 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true, plant: false, floorY: 910 });

  // door + padlock
  const dx = 487, dTop = feet - 300;
  H.roundRect(ctx, dx - 92, dTop - 12, 184, 312, 10); ctx.fillStyle = '#1c2033'; ctx.fill();
  H.roundRect(ctx, dx - 80, dTop, 160, 296, 6); ctx.fillStyle = '#764d31'; ctx.fill();
  ctx.fillStyle = '#9a6a46'; H.roundRect(ctx, dx - 66, dTop + 16, 132, 120, 4); ctx.fill(); H.roundRect(ctx, dx - 66, dTop + 152, 132, 128, 4); ctx.fill();
  // hasp + padlock swinging after the question
  ctx.fillStyle = '#b9c1d6'; H.roundRect(ctx, dx + 30, dTop + 140, 60, 18, 6); ctx.fill();
  const swing = t > tQ ? Math.sin((t - tQ) * 4) * 0.25 * Math.exp(-(t - tQ) * 0.5) : 0;
  ctx.save(); ctx.translate(dx + 70, dTop + 150); ctx.rotate(swing); K.drawLock(ctx, 0, 110, 0.85, { open: 0, shadow: false }); ctx.restore();
  if (t > tQ) K.glow(ctx, dx + 70, dTop + 220, 90, ACC, 0.25 + 0.1 * Math.sin(t * 4));

  // robot (left) and office worker (right) looking at the lock
  K.drawRobot(ctx, 230, feet - 4, 1.0, { t, state: t >= tA ? 'thinking' : 'idle', seed: 7 });
  K.drawPerson(ctx, 760, feet + 18, 1.1, { t, pose: t >= tBb ? 'shrug' : 'stand', mood: 'neutral', flip: true, look: -1, shirt: 2, skin: 1, hair: 1, hairStyle: 'short', seed: 3 });

  // phase 1: notice card with names redacted
  const out1 = K.fadeOut(t, tQ - 0.1, 0.3);
  if (out1 > 0) {
    const pop = K.popIn(t, 0.05, 0.45);
    ctx.save(); ctx.globalAlpha = out1; ctx.translate(487, 560); ctx.scale(pop, pop);
    H.roundRect(ctx, -330, -120, 660, 240, 22); ctx.fillStyle = 'rgba(14,17,33,0.95)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke();
    rows.forEach((r, i) => {
      const y = -50 + i * 100;
      ctx.fillStyle = '#c9cfe6'; ctx.font = K.font.ui(30); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(r + ':', -290, y);
      const bar = K.phase(t, tName + i * 0.35, tName + 0.4 + i * 0.35);
      H.roundRect(ctx, 20, y - 22, 260 * Math.max(0.02, bar), 44, 8); ctx.fillStyle = bar > 0 ? '#000000' : 'rgba(255,255,255,0.1)'; ctx.fill();
      if (bar <= 0) { ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillText('?????', 40, y); }
    });
    ctx.restore();
    const tStamp = tName + 1.0;
    if (t >= tStamp) { ctx.save(); ctx.globalAlpha = out1; K.drawStamp(ctx, 760, 700, 0.62, { kind: 'cross', text: P.notNamed || 'Not named', land: (t - tStamp) / 0.5 }); ctx.restore(); }
  }
  // phase 2: question card
  if (t >= tQ) {
    const k = easeOutCubic(clamp((t - tQ) / 0.5));
    ctx.save(); ctx.translate(487, 560); ctx.scale(1, Math.max(0.05, k));
    H.roundRect(ctx, -340, -110, 680, 200, 24); ctx.fillStyle = 'rgba(14,17,33,0.96)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
    const qf = H.fitText(ctx, P.question || 'Who checks the locks?', 'display', 60, 34, 600);
    ctx.font = qf.font; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(qf.text, 0, -10);
    ctx.restore();
    // pulsing ? over the door
    const qa = K.popIn(t, tQ + 0.6, 0.4);
    if (qa > 0) { ctx.save(); ctx.translate(dx, dTop - 50); ctx.scale(qa * (1 + 0.06 * Math.sin(t * 5)), qa * (1 + 0.06 * Math.sin(t * 5))); ctx.fillStyle = ACC; ctx.font = K.font.display(76); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 0); ctx.restore(); }
  }
  // answer chips above the two sides
  const chip = (text, x, a, accent) => { if (t < a) return; K.drawLabel(ctx, x, 730, K.popIn(t, a, 0.4), { text, size: 30, dot: !accent, accent }); };
  chip(P.a || 'AI labs', 230, tA, true);
  chip(P.b || 'Companies', 760, tBb, true);
  ctx.restore();
}
