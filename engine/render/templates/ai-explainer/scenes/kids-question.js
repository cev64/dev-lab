// Scene "kids-question" (full frame, 1 beat, payoff). Living room at night: a generic parent and kid share the sofa,
// the kid on a phone. A "8 STATES vs 1 CHATBOT" row pops (the echo of the hook), then flips into a question card;
// two answer chips pop on their cues (left / right) and a pulsing "?" settles between them. The parent glances at the
// phone, the kid looks up at the end.
// Fits: payoff questions about who is responsible (companies vs parents, regulators vs users...).
// params: left ("8 states"), right ("1 chatbot"), vs ("VS"), question ("Who should keep kids safe with AI?"),
//         a ({text: "The companies", cue: "companies"}), b ({text: "The parents", cue: "parents"}),
//         rightCue ("chatbot"), qCue ("who")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, roundRect, rgba } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const tR = at(P.rightCue || 'chatbot', 1.3) - 0.3;
  const tQ = at(P.qCue || 'who', D * 0.38) - 0.2;
  const A = P.a || { text: 'The companies', cue: 'companies' }, B = P.b || { text: 'The parents', cue: 'parents' };
  const tA = at(A.cue, D * 0.68) - 0.25, tB = at(B.cue, D * 0.84) - 0.25;

  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 487, y: 760 }]);
  const room = K.world.livingRoomNight(ctx, { t, lampOn: 1 });
  const feet = room.sofa.feetY;
  K.glow(ctx, 600, feet - 170, 130, ACC, 0.2 + 0.06 * Math.sin(t * 3));
  K.drawPerson(ctx, 370, feet, 1.6, { pose: 'sit', seat: false, t, skin: 1, hair: 2, shirt: '#4a7bd0', hairStyle: 'long', mood: t > tQ ? 'neutral' : 'worried', seed: 9, look: 0.6 });
  K.drawPerson(ctx, 590, feet, 1.35, { pose: 'sit-phone', seat: false, t, typing: t < tB ? 1 : 0, skin: 3, hair: 1, shirt: '#e0784f', hairStyle: 'curly', mood: 'neutral', seed: 4, look: t > tB + 0.2 ? -0.5 : 0 });

  // row: 8 STATES  VS  1 CHATBOT (flips away when the question lands)
  const rowOut = smooth((t - tQ) / 0.35);
  if (rowOut < 1) {
    ctx.save(); ctx.globalAlpha = 1 - rowOut;
    const lk = K.popIn(t, 0.05, 0.4), vk = K.popIn(t, 0.55, 0.35), rk = K.popIn(t, tR, 0.4);
    if (lk > 0) K.drawLabel(ctx, 250, 560, Math.min(1.05, lk), { text: String(P.left || '8 states').toUpperCase(), size: 40, accent: true });
    if (vk > 0) { ctx.save(); ctx.translate(487, 535); ctx.scale(vk, vk); ctx.font = H.font('display', 52); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.vs || 'VS', 0, 0); ctx.restore(); }
    if (rk > 0) K.drawLabel(ctx, 725, 560, Math.min(1.05, rk), { text: String(P.right || '1 chatbot').toUpperCase(), size: 40, dot: true });
    ctx.restore();
  }
  // question card
  const qk = K.popIn(t, tQ, 0.45);
  if (qk > 0) {
    ctx.save(); ctx.translate(487, 540); ctx.scale(Math.min(1.05, qk), Math.min(1.05, qk));
    const W = 820, Hh = 150;
    roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 28); ctx.fillStyle = 'rgba(8,10,24,0.95)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 28); ctx.stroke();
    let size = 48, lines; for (; size >= 30; size -= 2) { lines = H.wrap(ctx, P.question || 'Who should keep kids safe with AI?', 'display', size, W - 60); if (lines.length <= 2) break; }
    ctx.font = H.font('display', size); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lh = size * 1.15, y0 = 2 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, j) => ctx.fillText(ln, 0, y0 + j * lh));
    ctx.restore();
  }
  // answer chips + a settling "?"
  const ak = K.popIn(t, tA, 0.4), bk = K.popIn(t, tB, 0.4);
  if (ak > 0) K.drawLabel(ctx, 245, 700 + K.bob(t, 3, 1.4, 0), Math.min(1.05, ak), { text: A.text, size: 32, dot: true });
  if (bk > 0) K.drawLabel(ctx, 735, 700 + K.bob(t, 3, 1.4, 1.5), Math.min(1.05, bk), { text: B.text, size: 32, dot: true });
  const mk = K.popIn(t, Math.max(tA, tB) + 0.35, 0.45);
  if (mk > 0) {
    ctx.save(); ctx.translate(487, 680); ctx.scale(Math.min(1.08, mk), Math.min(1.08, mk));
    K.glow(ctx, 0, -10, 70, ACC, 0.5);
    ctx.font = H.font('display', 72); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 0);
    ctx.restore();
  }
  void clamp; void rgba;
}
