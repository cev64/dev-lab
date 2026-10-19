// Scene "trust-question" (full frame, 1 beat, payoff). Dusk street: generic townspeople walk in and raise simple
// signs ("?", "Jobs?"...) on backlashCue, facing a small glowing fund vault. A verbatim quote panel (speaker named as
// text only, never drawn) pops on quoteCue; on qCue it gives way to a question card with two answer chips and a
// pulsing "?"; the crowd turns toward the vault. Ends settled.
// Fits: payoff that ties a company move to public mood and asks the viewer to pick (who should get / decide).
// params: quote, by, question, a, b, signs (<= 4), fund ("Fund"), backlashCue, quoteCue, qCue (cues optional)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, roundRect } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const tB = at(P.backlashCue, D * 0.22) - 0.3;
  const tQ = at(P.quoteCue, D * 0.45) - 0.6;
  const tAsk = at(P.qCue, D * 0.75) - 0.35;
  const signs = P.signs || ['?', 'Jobs?', 'Trust?', '?'];

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 487, y: 760 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 990 });

  // small fund vault on the right
  const VX = 790, VF = 1020, W = 180, HH = 160, x0 = VX - W / 2, y0 = VF - HH;
  K.shadow(ctx, VX, VF, 220);
  roundRect(ctx, x0, y0, W, HH, 12); ctx.fillStyle = '#5d6b86'; ctx.fill();
  roundRect(ctx, x0 - 10, y0 - 14, W + 20, 22, 8); ctx.fillStyle = '#7b89a6'; ctx.fill();
  const DY = VF - 78;
  ctx.beginPath(); ctx.arc(VX, DY, 54, 0, Math.PI * 2); ctx.fillStyle = '#3a4459'; ctx.fill();
  ctx.beginPath(); ctx.arc(VX, DY, 46, 0, Math.PI * 2); ctx.fillStyle = H.mixHex('#8d9ab4', ACC, 0.5); ctx.fill();
  ctx.save(); ctx.translate(VX, DY); ctx.rotate(t * 0.5); ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 5; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(28, 0); ctx.stroke(); }
  ctx.restore();
  const vg = t > tAsk ? 0.35 + 0.12 * Math.sin(t * 4) : 0.18;
  K.glow(ctx, VX, DY, 130, ACC, vg);
  K.drawLabel(ctx, VX, y0 - 22, 1, { text: P.fund || 'Fund', size: 24, accent: true });

  // crowd walks in from the left and raises signs
  const crowd = [
    { x: 120, sk: 0, hr: 1, sh: '#6f86e0', hs: 'short' },
    { x: 235, sk: 3, hr: 0, sh: '#e8786a', hs: 'long' },
    { x: 350, sk: 2, hr: 4, sh: '#4fb3a6', hs: 'bun' },
    { x: 465, sk: 4, hr: 0, sh: '#a08be0', hs: 'curly' },
  ];
  const walkU = K.phase(t, 0, 1.8, H.easeOutCubic);
  crowd.forEach((c, i) => {
    const x = c.x - (1 - walkU) * 420;
    const walking = walkU < 1;
    const up = clamp((t - tB - i * 0.12) / 0.35);
    const lookV = t > tAsk ? 1 : 0.2;
    K.drawPerson(ctx, x, 1032, 0.9, { t, walk: walking ? t : undefined, pose: 'stand', mood: t > tAsk ? 'neutral' : 'worried', skin: c.sk, hair: c.hr, shirt: c.sh, hairStyle: c.hs, seed: 51 + i, look: lookV });
    if (up > 0) {
      const sy = 1032 - 215 - 70 * H.easeOutCubic(up) + Math.sin(t * 3 + i) * 4;
      ctx.save(); ctx.translate(x + 30, sy); ctx.rotate(Math.sin(t * 2 + i * 1.7) * 0.06);
      ctx.fillStyle = '#9a6a46'; ctx.fillRect(-4, 0, 8, 110);
      roundRect(ctx, -60, -70, 120, 74, 8); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      ctx.font = H.font('display', signs[i % signs.length].length > 2 ? 26 : 40); ctx.fillStyle = '#2a2f45'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(signs[i % signs.length], 0, -33);
      ctx.restore();
    }
  });

  // quote panel -> question card
  const qk = K.popIn(t, tQ, 0.45), qOut = clamp((t - tAsk) / 0.3);
  if (qk > 0 && qOut < 1) {
    ctx.save(); ctx.globalAlpha = 1 - qOut; ctx.translate(487, 480); const s = Math.min(1.04, qk); ctx.scale(s, s);
    const Wp = 820, Hp = 230;
    roundRect(ctx, -Wp / 2, -Hp / 2, Wp, Hp, 26); ctx.fillStyle = 'rgba(8,10,24,0.93)'; ctx.fill();
    ctx.fillStyle = ACC; roundRect(ctx, -Wp / 2, -Hp / 2, 10, Hp, 5); ctx.fill();
    ctx.font = H.font('display', 44); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const qt = '“' + (P.quote || 'Quote here') + '”';
    let fs = 46; for (; fs > 30; fs -= 2) { ctx.font = H.font('display', fs); if (ctx.measureText(qt).width < Wp - 70) break; }
    ctx.fillText(qt, 0, -40);
    const lines = H.wrap(ctx, P.by || 'Speaker, where said', 'ui', 26, Wp - 80).slice(0, 2);
    ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff';
    lines.forEach((ln, j) => ctx.fillText(ln, 0, 30 + j * 34));
    ctx.restore();
  }
  const ak = K.popIn(t, tAsk, 0.45);
  if (ak > 0) {
    ctx.save(); ctx.translate(487, 460); const s = Math.min(1.05, ak); ctx.scale(s, s);
    const Wq = 820, Hq = 150;
    roundRect(ctx, -Wq / 2, -Hq / 2, Wq, Hq, 28); ctx.fillStyle = 'rgba(8,10,24,0.95)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; roundRect(ctx, -Wq / 2, -Hq / 2, Wq, Hq, 28); ctx.stroke();
    let size = 50, lines; for (; size >= 30; size -= 2) { lines = H.wrap(ctx, P.question || 'Who should decide?', 'display', size, Wq - 60); if (lines.length <= 2) break; }
    ctx.font = H.font('display', size); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lh = size * 1.15, y0q = 2 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, j) => ctx.fillText(ln, 0, y0q + j * lh));
    ctx.restore();
    const c1 = K.popIn(t, tAsk + 0.45, 0.4), c2 = K.popIn(t, tAsk + 0.7, 0.4), mk = K.popIn(t, tAsk + 1.0, 0.45);
    if (c1 > 0) K.drawLabel(ctx, 250, 618 + K.bob(t, 3, 1.4, 0), Math.min(1.05, c1), { text: P.a || 'Option A', size: 34, dot: true });
    if (c2 > 0) K.drawLabel(ctx, 724, 618 + K.bob(t, 3, 1.4, 1.5), Math.min(1.05, c2), { text: P.b || 'Option B', size: 34, dot: true });
    if (mk > 0) {
      ctx.save(); ctx.translate(487, 590); ctx.scale(Math.min(1.08, mk), Math.min(1.08, mk));
      K.glow(ctx, 0, -10, 70, ACC, 0.5);
      ctx.font = H.font('display', 60); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();
}
