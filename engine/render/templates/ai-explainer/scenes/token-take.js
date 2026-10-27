// Scene "token-take" (full frame; the closing beat of every explainer since 2026-10-27). The channel mascot, the kit
// robot named Token, stands in its night studio with a name tag; a "TOKEN'S TAKE" card pops beside it and the
// verdict types in while it talks; on qCue the card gives way to a question card with two answer chips (the
// comment prompt). Ends settled (robot idle, card still) so the loop dissolve back to the opening is clean.
// Fits: the recurring sign-off. The take is an opinion in plain words (no advice, no new facts; see the skill).
// params: name ("Token"), take (the verdict), question, a, b, cues: takeCue (default: start), qCue (default 62%)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration;
  const { clamp, roundRect, rgba } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const name = String(P.name || 'Token');
  const take = String(P.take || 'Watch what it does, not what it says.');
  const tTake = Math.max(0.15, at(P.takeCue, 0.15) - 0.2);
  const hasQ = !!P.question;
  const tQ = hasQ ? at(P.qCue, D * 0.62) - 0.35 : Infinity;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 500, y: 735 }]);
  K.world.room(ctx, { t, time: 'night', lamp: true, window: true, picture: false, plant: true });

  // Token: big, on the right, talking while the take is read, happy once the question is up
  const RX = 735, RY = 1032, RS = 1.75;
  const talking = t < tQ ? info.env : 0;
  K.drawRobot(ctx, RX, RY, RS, { t, state: t >= tQ ? 'happy' : 'idle', talk: talking, seed: 7 });
  // name tag above the head
  const tagPop = K.popIn(t, 0.05, 0.4);
  if (tagPop > 0) K.drawLabel(ctx, RX, RY - 225 * RS - 26, tagPop, { text: name.toUpperCase(), size: 28, accent: true });

  // the take card (left), with a tail pointing at Token
  const X0 = 82, X1 = 612, CW = X1 - X0, PAD = 30;
  const out = clamp((t - tQ) / 0.3);                 // take card leaves as the question arrives
  const pop = K.popIn(t, tTake, 0.45);
  if (pop > 0 && out < 1) {
    const bodySize = 40, lines = H.wrap(ctx, take, 'display', bodySize, CW - 2 * PAD);
    const cardH = PAD + 34 + 22 + lines.length * bodySize * 1.18 + PAD;
    const Y0 = 452;
    ctx.save();
    ctx.globalAlpha = 1 - out;
    ctx.translate((X0 + X1) / 2, Y0 + cardH / 2 - out * 60);
    const s = Math.min(1.04, 0.7 + 0.3 * pop); ctx.scale(s, s);
    ctx.translate(-(X0 + X1) / 2, -(Y0 + cardH / 2));
    // tail
    ctx.beginPath(); ctx.moveTo(X1 - 4, Y0 + cardH * 0.55); ctx.lineTo(X1 + 46, Y0 + cardH * 0.7); ctx.lineTo(X1 - 4, Y0 + cardH * 0.78); ctx.closePath();
    ctx.fillStyle = '#f4f6fb'; ctx.fill();
    roundRect(ctx, X0, Y0, CW, cardH, 28); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    // header: accent bar + "TOKEN'S TAKE"
    roundRect(ctx, X0 + PAD, Y0 + PAD + 4, 10, 30, 5); ctx.fillStyle = info.accent; ctx.fill();
    ctx.font = H.font('ui', 26); ctx.letterSpacing = '2px'; ctx.fillStyle = '#3b4672'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(`${name.toUpperCase()}'S TAKE`, X0 + PAD + 24, Y0 + PAD + 20);
    ctx.letterSpacing = '0px';
    // body: types in, whole words
    const shown = K.typewriter(take, t, 34, tTake + 0.3).length;
    ctx.font = H.font('display', bodySize); ctx.fillStyle = '#141829'; ctx.textBaseline = 'alphabetic';
    let used = 0;
    lines.forEach((ln, i) => {
      const n = clamp(shown - used, 0, ln.length); used += ln.length + 1;
      let txt = ln.slice(0, n); const sp = txt.lastIndexOf(' ');
      if (n < ln.length) txt = sp > 0 ? txt.slice(0, sp) : ''; // whole words only
      if (txt) ctx.fillText(txt, X0 + PAD, Y0 + PAD + 34 + 22 + bodySize * 0.95 + i * bodySize * 1.18);
    });
    ctx.restore();
  }

  // question card + two chips
  if (hasQ && t >= tQ) {
    const qp = K.popIn(t, tQ + 0.15, 0.45);
    const qSize = 38, lines = H.wrap(ctx, String(P.question), 'display', qSize, CW - 2 * PAD);
    const chipsH = 64, cardH = PAD + lines.length * qSize * 1.18 + 26 + chipsH + PAD;
    const Y0 = 440;
    ctx.save();
    ctx.translate((X0 + X1) / 2, Y0 + cardH / 2);
    const s = Math.min(1.04, 0.7 + 0.3 * qp); ctx.scale(s, s); ctx.globalAlpha = clamp(qp * 2);
    ctx.translate(-(X0 + X1) / 2, -(Y0 + cardH / 2));
    roundRect(ctx, X0, Y0, CW, cardH, 28); ctx.fillStyle = 'rgba(12,14,26,0.92)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = rgba(info.accent, 0.7); ctx.stroke();
    ctx.font = H.font('display', qSize); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    lines.forEach((ln, i) => ctx.fillText(ln, X0 + PAD, Y0 + PAD + qSize * 0.95 + i * qSize * 1.18));
    const cy = Y0 + PAD + lines.length * qSize * 1.18 + 26;
    const chips = [P.a, P.b].filter(Boolean).map(String);
    let cx = X0 + PAD;
    chips.forEach((c, i) => {
      const cp = K.popIn(t, tQ + 0.45 + i * 0.18, 0.35);
      if (cp <= 0) return;
      ctx.font = H.font('ui', 28);
      const w = ctx.measureText(c).width + 48;
      ctx.save(); ctx.translate(cx + w / 2, cy + chipsH / 2); ctx.scale(Math.min(1.05, cp), Math.min(1.05, cp)); ctx.translate(-(cx + w / 2), -(cy + chipsH / 2));
      roundRect(ctx, cx, cy, w, chipsH, chipsH / 2); ctx.fillStyle = i === 0 ? info.accent : 'rgba(255,255,255,0.12)'; ctx.fill();
      ctx.fillStyle = i === 0 ? '#141829' : '#ffffff'; ctx.textBaseline = 'middle'; ctx.fillText(c, cx + 24, cy + chipsH / 2 + 1);
      ctx.restore();
      cx += w + 18;
    });
    ctx.restore();
  }
  ctx.restore();
}
