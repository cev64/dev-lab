// Scene "power-bet" (full frame). Night plain: a giant data center on the left, power pylons carrying a cable to a
// tiny phone with a tiny chat bubble on the right (huge infrastructure for a small chat). A stream of coins pours into
// the data center (betCue); a verbatim quote panel with attribution and a big amount pop (moneyCue); the data center
// lights up with a power badge and energy pulses race down the cable to the chat bubble (gwCue).
// Fits: "spending $X billion on AI", "N gigawatts of compute", "a huge bet before seeing results".
// params (all optional): quote (verbatim, with quote marks), by (attribution), amount, gw (badge text), site (pill
//                        under the building, '' hides), bubble (tiny chat text), betCue, moneyCue, gwCue
//                        (else 5% / 30% / 70%)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic, roundRect, mixHex } = H;
  const D = info.duration, ACC = info.accent;
  const tw = (w, f) => { const v = w ? info.timeOf(w) : null; return v != null ? v : D * f; };
  const tBet = tw(P.betCue, 0.05), tMoney = tw(P.moneyCue, 0.3), tGw = tw(P.gwCue, 0.7);
  const groundY = 1000;

  ctx.save();
  const z = lerp(1.0, 1.05, H.phase(t, 0, D));
  ctx.translate(487, 800); ctx.scale(z, z); ctx.translate(-487, -800);
  // sky + stars + ground
  const sky = ctx.createLinearGradient(0, 0, 0, groundY);
  sky.addColorStop(0, '#070918'); sky.addColorStop(1, '#1b2150');
  ctx.fillStyle = sky; ctx.fillRect(-100, -100, 1280, groundY + 100);
  for (let i = 0; i < 70; i++) {
    const x = H.hash(i, 1) * 1080, y = 120 + H.hash(i, 2) * 820, tw2 = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i));
    ctx.fillStyle = `rgba(255,255,255,${0.25 * tw2})`; ctx.fillRect(x, y, 3, 3);
  }
  const gr = ctx.createLinearGradient(0, groundY, 0, 1920);
  gr.addColorStop(0, '#1d2a3a'); gr.addColorStop(1, '#0c1018');
  ctx.fillStyle = gr; ctx.fillRect(-100, groundY, 1280, 1000);
  ctx.fillStyle = '#2b3c50'; ctx.fillRect(-100, groundY, 1280, 6);

  // ---- data center (big, custom)
  const lit = H.phase(t, tGw, tGw + 0.8);
  const dx0 = 90, dx1 = 510, dTop = 720;
  K.shadow(ctx, (dx0 + dx1) / 2, groundY, 520);
  if (lit > 0) K.glow(ctx, (dx0 + dx1) / 2, 820, 360, ACC, 0.35 * lit);
  roundRect(ctx, dx0, dTop, dx1 - dx0, groundY - dTop, 12); ctx.fillStyle = '#3a4270'; ctx.fill();
  ctx.fillStyle = '#2c335c'; ctx.fillRect(dx0 + (dx1 - dx0) * 0.72, dTop, (dx1 - dx0) * 0.28, groundY - dTop);
  roundRect(ctx, dx0 - 10, dTop - 18, dx1 - dx0 + 20, 24, 8); ctx.fillStyle = '#4c5590'; ctx.fill();
  // cooling fans on the roof
  for (let i = 0; i < 3; i++) {
    const fx = dx0 + 70 + i * 120, fy = dTop - 36;
    roundRect(ctx, fx - 40, fy - 6, 80, 26, 6); ctx.fillStyle = '#2a2f55'; ctx.fill();
    ctx.save(); ctx.translate(fx, fy + 6); ctx.rotate(t * (2 + 10 * lit) + i);
    ctx.fillStyle = '#7a84b8'; for (let b = 0; b < 3; b++) { ctx.rotate((Math.PI * 2) / 3); ctx.fillRect(-3, -14, 6, 14); }
    ctx.restore();
  }
  // server windows: blinking LEDs, more after the power cue
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) {
    const wx = dx0 + 24 + c * 64, wy = dTop + 26 + r * 62;
    roundRect(ctx, wx, wy, 50, 44, 6); ctx.fillStyle = '#151a33'; ctx.fill();
    for (let l = 0; l < 3; l++) {
      const on = H.hash(r * 6 + c, Math.floor(t * 4 + l)) < 0.35 + 0.5 * lit;
      ctx.fillStyle = on ? mixHex('#4cc9ff', ACC, lit) : '#2a3050';
      ctx.fillRect(wx + 8 + l * 14, wy + 16, 8, 8);
    }
  }

  // ---- pylons + cable to the tiny phone
  const pyl = [[620, groundY], [740, groundY]];
  for (const [px, py] of pyl) {
    ctx.strokeStyle = '#6b7396'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(px - 34, py); ctx.lineTo(px, py - 230); ctx.lineTo(px + 34, py); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px - 40, py - 200); ctx.lineTo(px + 40, py - 200); ctx.moveTo(px - 24, py - 120); ctx.lineTo(px + 24, py - 120); ctx.stroke();
  }
  const cable = [];
  const segs = [[dx1, 790, pyl[0][0] - 40, groundY - 200], [pyl[0][0] + 40, groundY - 200, pyl[1][0] - 40, groundY - 200], [pyl[1][0] + 40, groundY - 200, 850, 905]];
  for (const [x0, y0, x1, y1] of segs) for (let k = 0; k <= 12; k++) { const u = k / 12; cable.push([lerp(x0, x1, u), lerp(y0, y1, u) + Math.sin(u * Math.PI) * 26]); }
  ctx.strokeStyle = '#4a527a'; ctx.lineWidth = 5; ctx.beginPath(); cable.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  // energy pulses
  const nP = 3 + Math.round(5 * lit);
  for (let i = 0; i < nP; i++) {
    const u = ((t * (0.25 + 0.45 * lit) + i / nP) % 1);
    const [x, y] = K.pathPoint(cable, u);
    K.glow(ctx, x, y, 34 + 20 * lit, ACC, 0.4 + 0.5 * lit);
    ctx.beginPath(); ctx.arc(x, y, 6 + 3 * lit, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
  }
  // tiny phone + tiny chat bubble
  K.drawPhone(ctx, 870, groundY, 0.55, { t, bubbles: 3, every: 0.9 });
  const bp = 0.8 + 0.2 * Math.abs(Math.sin(t * 3)) * lit;
  K.drawSpeechBubble(ctx, 860, 845, 1, { text: P.bubble || 'hi!', size: 24, maxW: 120, tail: 'center', pop: bp });

  // ---- coins pour into the roof
  for (let i = 0; i < 36; i++) {
    const s0 = tBet + i * 0.11, tt = t - s0;
    if (tt < 0 || tt > 0.9) continue;
    const x = dx0 + 60 + H.hash(i, 7) * (dx1 - dx0 - 120), y = lerp(380, dTop - 20, easeOutCubic(tt / 0.9) * 0 + (tt / 0.9) * (tt / 0.9));
    ctx.save(); ctx.globalAlpha = 1 - smooth((tt - 0.75) / 0.15);
    K.drawCoin(ctx, x, y, 0.7, { spin: t * 6 + i });
    ctx.restore();
  }
  // power badge on the roof
  const gp = K.popIn(t, tGw + 0.2, 0.5);
  if (gp > 0) {
    ctx.save(); ctx.translate(300, 640); ctx.scale(gp, gp);
    K.glow(ctx, 0, 0, 170, ACC, 0.45);
    roundRect(ctx, -130, -52, 260, 104, 52); ctx.fillStyle = ACC; ctx.fill();
    // bolt
    ctx.fillStyle = K.ACCENT.deep; ctx.beginPath(); ctx.moveTo(-88, -34); ctx.lineTo(-108, 6); ctx.lineTo(-88, 6); ctx.lineTo(-100, 38); ctx.lineTo(-62, -8); ctx.lineTo(-82, -8); ctx.lineTo(-68, -34); ctx.closePath(); ctx.fill();
    ctx.font = H.font('display', 58); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.gw || '1 GW', 22, 4);
    ctx.restore();
  }
  ctx.restore();

  // ---- screen-space: quote panel, amount, site pill
  const qp = H.phase(t, tMoney - 0.1, tMoney + 0.5, easeOutCubic);
  if (qp > 0 && P.quote !== '') {
    ctx.save(); ctx.globalAlpha = qp; ctx.translate(0, (1 - qp) * -30);
    const x0 = 80, x1 = 900, y0 = 432;
    const txt = P.quote || '“A quote”';
    // wrap to <= 3 lines
    let fs = 34, lines;
    for (; fs >= 26; fs -= 2) { lines = H.wrap(ctx, txt, 'bold', fs, x1 - x0 - 60); if (lines.length <= 3) break; }
    const hh = lines.length * fs * 1.22 + 74;
    roundRect(ctx, x0, y0, x1 - x0, hh, 22); ctx.fillStyle = 'rgba(242,244,250,0.96)'; ctx.fill();
    roundRect(ctx, x0, y0, 12, hh, 6); ctx.fillStyle = ACC; ctx.fill();
    ctx.font = H.font('bold', fs); ctx.fillStyle = '#161927'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    lines.forEach((l, i) => ctx.fillText(l, x0 + 34, y0 + 22 + fs + i * fs * 1.22));
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#4a5270';
    ctx.fillText('— ' + (P.by || 'Speaker'), x0 + 34, y0 + hh - 20);
    ctx.restore();
  }
  const ap = K.popIn(t, tMoney + 0.7, 0.5);
  if (ap > 0 && P.amount !== '') {
    ctx.save(); ctx.translate(745, 690); ctx.scale(ap, ap);
    const fs = H.fitText(ctx, P.amount || '$1B', 'display', 64, 34, 300).size;
    ctx.font = H.font('display', fs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    K.glow(ctx, 0, 0, 170, ACC, 0.3);
    ctx.fillStyle = ACC; ctx.fillText(P.amount || '$1B', 0, 0);
    ctx.restore();
  }
  const sp = P.site === '' ? 0 : K.popIn(t, tGw, 0.45);
  if (sp > 0) K.drawLabel(ctx, 300, 1045, sp, { text: P.site || 'Data center', size: 28, dot: true });
}
