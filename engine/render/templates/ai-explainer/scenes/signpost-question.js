// Scene "signpost-question" (full frame, 1 beat payoff). Dusk street: a person holds a phone with a glowing Share
// button; a tall public signpost grows beside them and arrow signs swing in carrying private-sounding chat titles
// (illustrative), passers-by glance up; then a question card lands at the top with two answer chips. Ends settled
// (signs sway gently, Share button pulses).
// Fits: privacy payoffs: "anything you share could end up in public", "would you still post / share it?".
// params (all optional): signs [3 strings], button ("Share"), question ("Would you still hit share?"),
//   cues: shareCue, signCue, qCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, roundRect } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tShare = at(P.shareCue, D * 0.12) - 0.2, tSign = at(P.signCue, D * 0.45) - 0.6, tQ = at(P.qCue, D * 0.72) - 0.3;
  const signs = (P.signs || ['loan-application', 'q3-revenue-review', 'team-vacation']).slice(0, 3);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 420, y: 820 }, { t: tSign, zoom: 1.0 }, { t: D, zoom: 1.02, x: 487, y: 740 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });
  ctx.fillStyle = 'rgba(8,10,24,0.25)'; ctx.fillRect(-200, -200, 1480, 2320);

  // passers-by in the back
  const pw = (t * 0.06) % 1;
  K.drawPerson(ctx, lerp(1000, 760, smooth(clamp(t / D))), 1010, 0.9, { t, pose: 'stand', walk: t, mood: 'shocked', skin: 4, hair: 1, shirt: 1, hairStyle: 'curly', seed: 5, flip: true, look: -1 });
  void pw;

  // signpost
  const PX = 560, grow = H.phase(t, tSign - 0.3, tSign + 0.4, easeOutCubic);
  const topY = lerp(1000, 560, grow);
  ctx.fillStyle = '#6b7590'; roundRect(ctx, PX - 14, topY, 28, 1000 - topY, 8); ctx.fill();
  ctx.fillStyle = '#4f5874'; roundRect(ctx, PX - 14, topY, 10, 1000 - topY, 5); ctx.fill();
  K.shadow(ctx, PX, 1004, 120);
  signs.forEach((txt, i) => {
    const u = K.popIn(t, tSign + 0.15 + i * 0.25, 0.5); if (u <= 0) return;
    const right = true, y = 600 + i * 120;
    const sway = Math.sin(t * 1.6 + i) * 0.025;
    ctx.save(); ctx.translate(PX, y); ctx.rotate(sway + (1 - u) * (right ? -0.6 : 0.6));
    ctx.font = H.font('ui', 27);
    const w = ctx.measureText(txt).width + 70, h = 70;
    const dir = right ? 1 : -1;
    ctx.save(); ctx.scale(dir, 1);
    ctx.beginPath(); ctx.moveTo(-10, -h / 2); ctx.lineTo(w - 30, -h / 2); ctx.lineTo(w, 0); ctx.lineTo(w - 30, h / 2); ctx.lineTo(-10, h / 2); ctx.closePath();
    ctx.fillStyle = i === 1 ? ACC : '#eef1f8'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.stroke();
    ctx.restore();
    ctx.fillStyle = i === 1 ? K.ACCENT.deep : '#1f2438'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(txt, dir * (w / 2 - 20), 2);
    ctx.restore();
  });

  // person with phone + floating share button
  K.drawPerson(ctx, 250, 1030, 1.5, { t, pose: 'phone', typing: 0, mood: t > tSign + 0.5 ? 'worried' : 'happy', skin: 3, hair: 1, shirt: 2, hairStyle: 'short', seed: 12, look: t > tSign ? 1 : 0 });
  const bp = K.popIn(t, tShare, 0.45);
  if (bp > 0) {
    const hover = t > tSign ? 1 : 0;
    ctx.save(); ctx.translate(250, 640 + K.bob(t, 6, 0.4)); ctx.scale(bp, bp);
    K.glow(ctx, 0, 0, 170, ACC, 0.35 + 0.15 * Math.sin(t * 4));
    roundRect(ctx, -115, -40, 230, 80, 40); ctx.fillStyle = ACC; ctx.fill();
    ctx.font = H.font('display', 36); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = K.ACCENT.deep; ctx.fillText(P.button || 'Share', 0, 3);
    // a thumb hovering, not pressing
    if (hover) {
      const hy = 70 + 8 * Math.sin(t * 3);
      ctx.fillStyle = '#e8b48a'; roundRect(ctx, 40, hy, 32, 110, 16); ctx.fill();
      ctx.fillStyle = '#f4d5bd'; roundRect(ctx, 46, hy + 4, 20, 22, 8); ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();

  // question card
  const qp = K.popIn(t, tQ, 0.5);
  if (qp > 0) {
    const q = P.question || 'Would you still hit share?';
    ctx.save(); ctx.translate(487, 470); ctx.scale(qp, qp);
    const fs = H.fitText(ctx, q, 'display', 52, 30, 780).size;
    ctx.font = H.font('display', fs);
    const bw = Math.min(840, ctx.measureText(q).width + 70);
    K.glow(ctx, 0, 0, bw * 0.55, ACC, 0.3);
    roundRect(ctx, -bw / 2, -fs * 0.95, bw, fs * 1.9, 26); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#161927'; ctx.fillText(q, 0, 3);
    ctx.restore();
  }
}
