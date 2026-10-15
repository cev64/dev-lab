// Scene "company-reply" (full frame, 1 beat). Dusk city street: a generic company tower (name as a text pill at its
// base, no logo). A verbatim quote panel types in ("<who>" + quote), a shield with a check rises in front of the tower,
// feature pills pop on their cues. Then the caveat: everything dims and a card lands with a level balance scale,
// "These are allegations" / "Not proven in court".
// Fits: a company's response to a lawsuit / regulator, followed by an "allegations, not findings" caveat.
// params: company ("OpenAI"), by ("OpenAI spokesperson"), quote ("industry-leading age-specific protections"),
//         feats [{text, cue}] (max 2), banner1 ("These are allegations"), banner2 ("Not proven in court"),
//         quoteCue ("industry"), shieldCue ("protections"), cautionCue ("allegations"), provenCue ("proven")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, rgba } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const tQ = at(P.quoteCue || 'industry', 1.8) - 0.4;
  const tSh = at(P.shieldCue || 'protections', 3.6) - 0.3;
  const feats = (P.feats || [{ text: 'Parental controls', cue: 'parental' }, { text: 'Break reminders', cue: 'break' }]).slice(0, 2);
  const tF = feats.map((f, i) => at(f.cue, 5 + i * 1.4) - 0.25);
  const tC = at(P.cautionCue || 'allegations', D * 0.75) - 0.3;
  const tP = at(P.provenCue || 'proven', tC + 1.4) - 0.2;

  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 780 }, { t: tC, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 720 }]);
  const city = K.world.city(ctx, { t, time: 'dusk', groundY: 990 });
  K.drawBuilding(ctx, 487, 990, 0.82, { t, color: '#5b6aa8', floors: 7, lit: 0.6 });
  K.drawLabel(ctx, 487, 1030, 1, { text: P.company || 'OpenAI', size: 28, dot: true });

  // passers-by (generic) glance at the tower
  K.drawPerson(ctx, 110, 1030, 1.1, { t, walk: t < 4 ? t : undefined, pose: 'phone', skin: 2, hair: 3, shirt: 2, hairStyle: 'short', mood: 'neutral', seed: 11 });
  K.drawPerson(ctx, 880, 1030, 1.15, { t, pose: 'stand', flip: true, skin: 4, hair: 0, shirt: '#e0784f', hairStyle: 'curly', mood: t > tC ? 'neutral' : 'happy', seed: 4, look: -0.4 });

  const dim = smooth((t - tC) / 0.45);
  ctx.save(); ctx.globalAlpha = 1 - 0.7 * dim;
  // shield rises in front of the tower
  const sk = K.popIn(t, tSh, 0.5);
  if (sk > 0) {
    const rise = (1 - smooth((t - tSh) / 0.5)) * 80;
    K.glow(ctx, 487, 900, 170, ACC, 0.35 * sk);
    K.drawShield(ctx, 487, 990 + rise, 1.25 * Math.min(1.05, sk), { check: clamp((t - tSh - 0.35) / 0.4) });
  }
  // feature pills
  const fx = [255, 720];
  feats.forEach((f, i) => {
    const k = K.popIn(t, tF[i], 0.4);
    if (k > 0) K.drawLabel(ctx, fx[i], 705 + K.bob(t, 4, 1.5, i), Math.min(1.05, k), { text: f.text, size: 30, dot: true });
  });
  // quote panel (types in)
  const qk = K.popIn(t, tQ, 0.45);
  if (qk > 0) {
    ctx.save(); ctx.translate(487, 535); ctx.scale(Math.min(1.04, qk), Math.min(1.04, qk));
    const W = 820, Hh = 190;
    roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 26); ctx.fillStyle = 'rgba(8,10,24,0.94)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.8); roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 26); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = H.font('ui', 26); ctx.fillStyle = ACC; ctx.fillText(String(P.by || 'OpenAI spokesperson').toUpperCase(), 0, -Hh / 2 + 36);
    const full = '“' + (P.quote || 'industry-leading age-specific protections') + '”';
    const shown = K.typewriter(full, t, 30, tQ + 0.3);
    let size = 42, lines; for (; size >= 28; size -= 2) { lines = H.wrap(ctx, full, 'bold', size, W - 70); if (lines.length <= 2) break; }
    ctx.font = H.font('bold', size); ctx.fillStyle = '#ffffff';
    // reveal line by line with the typed character count
    let left = shown.length; const lh = size * 1.2, y0 = 22 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, j) => { const part = ln.slice(0, Math.max(0, left)); left -= ln.length + 1; ctx.fillText(part, 0 - (ctx.measureText(ln).width - ctx.measureText(part).width) / 2, y0 + j * lh); });
    ctx.restore();
  }
  ctx.restore();

  // caveat card
  const ck = K.popIn(t, tC, 0.5);
  if (ck > 0) {
    ctx.fillStyle = `rgba(6,7,16,${0.45 * dim})`; ctx.fillRect(-100, -100, 1300, 2200);
    ctx.save(); ctx.translate(487, 760); ctx.scale(Math.min(1.05, ck), Math.min(1.05, ck));
    const W = 760, Hh = 330;
    roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 30); ctx.fillStyle = 'rgba(8,10,24,0.96)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 30); ctx.stroke();
    // level balance scale (gentle sway that settles level)
    const sway = 0.12 * Math.sin((t - tC) * 4) * Math.exp(-(t - tC) * 1.2);
    ctx.save(); ctx.translate(0, -78);
    ctx.strokeStyle = ACC; ctx.fillStyle = ACC; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -46); ctx.lineTo(0, 40); ctx.moveTo(-34, 40); ctx.lineTo(34, 40); ctx.stroke();
    ctx.rotate(sway);
    ctx.beginPath(); ctx.moveTo(-96, -40); ctx.lineTo(96, -40); ctx.stroke();
    for (const dx of [-96, 96]) {
      ctx.save(); ctx.translate(dx, -40); ctx.rotate(-sway);
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-24, 34); ctx.moveTo(0, 0); ctx.lineTo(24, 34); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 34, 26, 0, Math.PI); ctx.fill();
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(0, -46, 9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const f1 = H.fitText(ctx, P.banner1 || 'These are allegations', 'display', 50, 30, W - 70); ctx.font = f1.font; ctx.fillStyle = '#ffffff'; ctx.fillText(f1.text, 0, 46);
    const pk = K.popIn(t, tP, 0.4);
    if (pk > 0) {
      ctx.save(); ctx.translate(0, 110); ctx.scale(Math.min(1.05, pk), Math.min(1.05, pk));
      const f2 = H.fitText(ctx, P.banner2 || 'Not proven in court', 'ui', 34, 24, W - 120); ctx.font = f2.font;
      const w2 = ctx.measureText(f2.text).width + 56;
      roundRect(ctx, -w2 / 2, -30, w2, 60, 30); ctx.fillStyle = ACC; ctx.fill();
      ctx.fillStyle = K.ACCENT.deep; ctx.fillText(f2.text, 0, 2);
      ctx.restore();
    }
    ctx.restore();
  }
  void city; void lerp;
}
