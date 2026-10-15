// Scene "earnings-vault" (full frame). A vault room: two big glass tanks side by side, fed by coin pipes from the
// ceiling. At revCue coins pour into the left tank (REVENUE) and its figure + growth pill pop above it; at profitCue the
// right tank (PROFIT) fills. Each tank's fill height is proportional to its value (shared scale), and a dashed
// "a year ago" line shows the year-earlier level (value / (1 + growth)). A robot clerk ticks a clipboard between them.
// params: rev {label, value (text), amount (number), growth (number, %), pill}, profit {same}, ago (dashed-line text),
//         cues: revCue (10 %), profitCue (55 %)
// Fits: "revenue X up Y%, profit Z up W%" beats. Numbers only as published.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent;
  const cue = (w, fb) => { const v = w != null ? info.timeOf(w) : null; return v != null ? v : fb; };
  const revAt = cue(P.revCue, D * 0.1), proAt = cue(P.profitCue, D * 0.55);
  const R = Object.assign({ label: 'REVENUE', value: 'NT$1.49 trillion', amount: 1494.24, growth: 50.9, pill: '+50.9% vs a year ago' }, P.rev || {});
  const Q = Object.assign({ label: 'PROFIT', value: 'NT$763.06 billion', amount: 763.06, growth: 68.7, pill: '+68.7% vs a year ago' }, P.profit || {});
  const maxA = Math.max(R.amount, Q.amount);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 487, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  // vault room: steel wall with rivets, dark floor
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#0e1a2a'); g.addColorStop(0.5, '#173049'); g.addColorStop(1, '#070c14');
  ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, 2320);
  for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) { ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.beginPath(); ctx.arc(-20 + c * 140, 260 + r * 90, 4, 0, Math.PI * 2); ctx.fill(); }
  // big round vault door in the back, slightly open
  ctx.save(); ctx.globalAlpha = 0.35;
  ctx.beginPath(); ctx.arc(487, 700, 300, 0, Math.PI * 2); ctx.fillStyle = '#20384f'; ctx.fill();
  ctx.lineWidth = 14; ctx.strokeStyle = '#2b4a66'; ctx.stroke();
  ctx.save(); ctx.translate(487, 700); ctx.rotate(t * 0.15);
  for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.fillStyle = '#2b4a66'; ctx.fillRect(-6, 60, 12, 200); }
  ctx.restore(); ctx.restore();
  ctx.fillStyle = '#1b2a3c'; ctx.fillRect(-200, 1000, 1480, 16);
  ctx.fillStyle = '#0c131e'; ctx.fillRect(-200, 1016, 1480, 1000);

  const tanks = [
    { x: 255, d: R, at: revAt },
    { x: 720, d: Q, at: proAt },
  ];
  const top = 600, bot = 1000, TW = 290, TH = bot - top;
  tanks.forEach((k, idx) => {
    const fillU = K.phase(t, k.at + 0.2, k.at + 3.2, H.easeInOutCubic);
    const target = 0.92 * k.d.amount / maxA, level = target * fillU;
    const ago = 0.92 * (k.d.amount / (1 + k.d.growth / 100)) / maxA;
    // pipe from the ceiling
    ctx.fillStyle = '#3c5874'; ctx.fillRect(k.x - 24, 380, 48, top - 380 - 6);
    H.roundRect(ctx, k.x - 36, top - 30, 72, 26, 8); ctx.fillStyle = '#4b6a88'; ctx.fill();
    // tank back
    H.roundRect(ctx, k.x - TW / 2, top, TW, TH, 22); ctx.fillStyle = 'rgba(160,200,255,0.08)'; ctx.fill();
    // coins inside (stacked rows up to the level)
    ctx.save(); H.roundRect(ctx, k.x - TW / 2 + 6, top + 6, TW - 12, TH - 12, 18); ctx.clip();
    const lvY = bot - 6 - level * (TH - 12);
    const lg = ctx.createLinearGradient(0, lvY, 0, bot); lg.addColorStop(0, H.mixHex(ACC, '#ffffff', 0.25)); lg.addColorStop(1, H.mixHex(ACC, '#000000', 0.35));
    ctx.fillStyle = lg; ctx.fillRect(k.x - TW / 2, lvY, TW, bot - lvY);
    for (let yy = bot - 20; yy > lvY + 8; yy -= 26) for (let xx = 0; xx < 7; xx++) {
      const cx = k.x - TW / 2 + 22 + xx * 41 + ((Math.round(yy / 26)) % 2) * 18;
      ctx.beginPath(); ctx.ellipse(cx, yy, 18, 7, 0, 0, Math.PI * 2); ctx.fillStyle = H.rgba(H.mixHex(ACC, '#000000', 0.45), 0.35); ctx.fill();
    }
    ctx.restore();
    // falling coins while filling
    if (fillU > 0 && fillU < 1) {
      for (let i = 0; i < 7; i++) {
        const u = ((t * 1.6 + i / 7) % 1);
        const y = lerp(top - 4, lvY, u), x = k.x + (H.hash(i, idx) - 0.5) * 60;
        if (y < lvY - 10) K.drawCoin(ctx, x, y + 32 * 0.7, 0.7, { spin: t * 8 + i, shadow: false });
      }
    }
    // "a year ago" dashed line
    const agoIn = K.phase(t, k.at + 2.6, k.at + 3.3);
    if (agoIn > 0) {
      const ay = bot - 6 - ago * (TH - 12);
      ctx.save(); ctx.globalAlpha = agoIn; ctx.setLineDash([12, 10]); ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(k.x - TW / 2 - 8, ay); ctx.lineTo(k.x + TW / 2 + 8, ay); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = K.font.ui(24); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      H.roundRect(ctx, k.x - 85, ay + 8, 170, 36, 18); ctx.fillStyle = 'rgba(8,10,22,0.85)'; ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle'; ctx.fillText(P.ago || 'a year ago', k.x, ay + 27);
      ctx.restore();
    }
    // glass front + rim
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(200,225,255,0.55)'; H.roundRect(ctx, k.x - TW / 2, top, TW, TH, 22); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(k.x - TW / 2 + 18, top + 20, 16, TH - 40);
    // label + value above the tank
    const lp = K.popIn(t, k.at, 0.45);
    ctx.save(); ctx.globalAlpha = 0.5 + 0.5 * clamp(lp);
    ctx.font = K.font.ui(26); ctx.fillStyle = H.rgba('#ffffff', 0.8); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(k.d.label, k.x, 432);
    ctx.restore();
    if (lp > 0) {
      ctx.save(); ctx.translate(k.x, 482); ctx.scale(lp, lp);
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const ft = H.fitText(ctx, k.d.value, 'display', 44, 26, 350); ctx.font = ft.font; ctx.fillText(k.d.value, 0, 0);
      ctx.restore();
    }
    const gp = K.popIn(t, k.at + 1.4, 0.4);
    if (gp > 0) K.drawLabel(ctx, k.x, 572, gp, { text: k.d.pill, size: 24, accent: true });
  });

  // robot clerk between the tanks
  const tick = (t > revAt + 3 && t < revAt + 3.6) || (t > proAt + 3 && t < proAt + 3.6);
  K.drawRobot(ctx, 487, 1030, 0.8, { t, state: tick ? 'happy' : 'working', seed: 3 });
  ctx.restore();
}
