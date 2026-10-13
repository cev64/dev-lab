// Scene "fund-link" (full frame). Living room at night: a big wall screen shows two donut charts (an index and how much
// of it is chip stocks); each slice sweeps in at its cue with its label. At fundCue a person on the sofa looks at their
// phone, a "Your index fund" pill pops over it and little chip tokens stream from both donuts into the phone.
// params: kospi / sp (donut titles), kospiShare / spShare (0..1, drawn as published, e.g. 0.5, 0.18),
//         kospiLabel / spLabel (text under each donut), fund (pill text), cues: kospiCue (15 %), spCue (45 %), fundCue (75 %)
// Fits: "why should you care: your savings own this" beats (index weights, pension exposure).
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent;
  const cue = (w, fb) => { const v = w != null ? info.timeOf(w) : null; return v != null ? v : fb; };
  const aAt = cue(P.kospiCue, D * 0.15), bAt = cue(P.spCue, D * 0.45), fAt = cue(P.fundCue, D * 0.75);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.02, x: 487, y: 725 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, plant: true, lamp: true });
  // wall screen
  const sx = 95, sy = 400, sw = 785, sh = 330;
  H.roundRect(ctx, sx - 14, sy - 14, sw + 28, sh + 28, 18); ctx.fillStyle = '#05060f'; ctx.fill();
  const sg = ctx.createLinearGradient(0, sy, 0, sy + sh); sg.addColorStop(0, '#1a2150'); sg.addColorStop(1, '#0f1433');
  H.roundRect(ctx, sx, sy, sw, sh, 10); ctx.fillStyle = sg; ctx.fill();
  K.glow(ctx, sx + sw / 2, sy + sh, 420, '#7f9bff', 0.08);

  const donuts = [
    { cx: sx + 200, title: P.kospi || 'INDEX A', share: +P.kospiShare || 0.5, label: P.kospiLabel || '', at: aAt },
    { cx: sx + sw - 200, title: P.sp || 'INDEX B', share: +P.spShare || 0.18, label: P.spLabel || '', at: bAt },
  ];
  const cy = sy + 145, R = 74;
  donuts.forEach((d) => {
    const ap = K.popIn(t, d.at - 0.5, 0.5);
    if (ap <= 0) return;
    ctx.save(); ctx.translate(d.cx, cy); ctx.scale(ap, ap);
    ctx.lineWidth = 36; ctx.strokeStyle = '#2c3566';
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
    const sweep = K.phase(t, d.at, d.at + 1.0, H.easeOutCubic) * d.share;
    if (sweep > 0) { ctx.strokeStyle = ACC; ctx.lineCap = 'butt'; ctx.beginPath(); ctx.arc(0, 0, R, -Math.PI / 2, -Math.PI / 2 + sweep * Math.PI * 2); ctx.stroke(); }
    // little chip icon in the middle
    H.roundRect(ctx, -26, -26, 52, 52, 8); ctx.fillStyle = '#1b1f33'; ctx.fill();
    ctx.fillStyle = '#d9b64a'; for (let i = 0; i < 4; i++) { ctx.fillRect(-20 + i * 12, -34, 5, 8); ctx.fillRect(-20 + i * 12, 26, 5, 8); ctx.fillRect(-34, -20 + i * 12, 8, 5); ctx.fillRect(26, -20 + i * 12, 8, 5); }
    H.roundRect(ctx, -12, -12, 24, 24, 4); ctx.fillStyle = ACC; ctx.fill();
    ctx.restore();
    ctx.save(); ctx.globalAlpha = clamp(ap);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
    ctx.font = K.font.display(36); ctx.fillText(d.title, d.cx, sy + 40);
    const lp = K.phase(t, d.at + 0.4, d.at + 0.9);
    if (lp > 0 && d.label) {
      ctx.globalAlpha = lp;
      const lines = String(d.label).split('\n');
      lines.forEach((ln, j) => {
        const ft = H.fitText(ctx, ln, j ? 'display' : 'ui', j ? 34 : 28, 22, 360); ctx.font = ft.font; ctx.fillStyle = j ? ACC : '#ffffff';
        ctx.fillText(ln, d.cx, sy + sh - 28 - (lines.length - 1 - j) * 38);
      });
    }
    ctx.restore();
  });

  // person standing at the right with a phone
  const looking = t > fAt - 0.4;
  K.drawPerson(ctx, 800, 1045, 1.1, { t, pose: 'phone', mood: t > fAt + 0.6 ? 'shocked' : (looking ? 'neutral' : 'happy'), look: -0.5, skin: 2, hair: 1, shirt: 1, hairStyle: 'curly', seed: 7 });
  ctx.restore(); // camera

  // tokens stream from the donuts into the phone (screen space, approximately where the phone is)
  const phoneX = 805, phoneY = 885;
  if (t > fAt) {
    const n = 10;
    for (let i = 0; i < n; i++) {
      const d = donuts[i % 2];
      const u = (t - fAt - i * 0.18) / 0.9;
      if (u <= 0 || u >= 1) continue;
      const e = H.easeInOutCubic(u);
      const x = lerp(d.cx, phoneX, e), y = lerp(cy, phoneY, e) - Math.sin(u * Math.PI) * 80;
      ctx.save(); ctx.translate(x, y); const s = lerp(1, 0.5, u);
      H.roundRect(ctx, -18 * s, -18 * s, 36 * s, 36 * s, 6 * s); ctx.fillStyle = '#1b1f33'; ctx.fill();
      H.roundRect(ctx, -8 * s, -8 * s, 16 * s, 16 * s, 3 * s); ctx.fillStyle = ACC; ctx.fill();
      ctx.restore();
    }
    K.glow(ctx, phoneX, phoneY, 120, ACC, 0.3 * K.phase(t, fAt, fAt + 0.6));
  }
  const fp = K.popIn(t, fAt, 0.45);
  if (fp > 0) K.drawLabel(ctx, 440, 900, fp, { text: P.fund || 'Your index fund', size: 32, accent: true, dot: false });
}
