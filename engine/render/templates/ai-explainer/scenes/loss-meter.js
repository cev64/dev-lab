// Scene "loss-meter" (full frame). Night office: a glass money tank on a stand; coins drop in from a "Revenue" pipe
// at the top-left while slightly more coins drain out of a "Costs" pipe at the bottom-right, so the level never
// rises. A robot accountant watches with a clipboard. Above, a loss panel: at nowCue a red bar for the latest period
// pops with its figure; at beforeCue a longer, faded bar for the earlier period slides in under it with a "down"
// arrow chip. At warnCue a warning sign pops and a verbatim quote panel types in with its attribution.
// Fits: "still losing money, but less than before" + a published risk warning. Numbers only as published.
// params: head ("OPERATING LOSS"), now {label, value, amount}, before {label, value, amount}, down ("Smaller loss"),
//         inLabel ("Revenue"), outLabel ("Costs"), quote, by, cues: lossCue, nowCue, beforeCue, warnCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, rgba, roundRect } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const tLoss = at(P.lossCue, D * 0.05);
  const tNow = at(P.nowCue, D * 0.25) - 0.1;
  const tBefore = at(P.beforeCue, D * 0.45) - 0.1;
  const tWarn = at(P.warnCue, D * 0.72) - 0.2;
  const NOW = Object.assign({ label: 'This year', value: '-$1M', amount: 1 }, P.now || {});
  const BEF = Object.assign({ label: 'Last year', value: '-$2M', amount: 2 }, P.before || {});
  const RED = '#ff6b5e';

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 487, y: 800 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  K.world.office(ctx, { t, time: 'night' });

  // --- tank on a stand
  const TX = 400, TT = 760, TB = 1000, TW = 250;
  K.shadow(ctx, TX, 1035, 320);
  roundRect(ctx, TX - TW / 2 - 14, TB, TW + 28, 20, 6); ctx.fillStyle = '#3b4260'; ctx.fill();
  ctx.fillStyle = '#2a2f45'; ctx.fillRect(TX - TW / 2, TB + 20, 16, 15); ctx.fillRect(TX + TW / 2 - 16, TB + 20, 16, 15);
  roundRect(ctx, TX - TW / 2, TT, TW, TB - TT, 18); ctx.fillStyle = 'rgba(160,200,255,0.08)'; ctx.fill();
  const level = 0.42 + 0.03 * Math.sin(t * 1.7) - 0.06 * K.phase(t, tLoss, tLoss + 2.5);
  const lvY = TB - level * (TB - TT);
  ctx.save(); roundRect(ctx, TX - TW / 2 + 5, TT + 5, TW - 10, TB - TT - 10, 14); ctx.clip();
  const lg = ctx.createLinearGradient(0, lvY, 0, TB); lg.addColorStop(0, H.mixHex(ACC, '#ffffff', 0.2)); lg.addColorStop(1, H.mixHex(ACC, '#000000', 0.4));
  ctx.fillStyle = lg; ctx.fillRect(TX - TW / 2, lvY + Math.sin(t * 3) * 2, TW, TB - lvY);
  for (let yy = TB - 18; yy > lvY + 10; yy -= 24) for (let x = 0; x < 6; x++) {
    ctx.beginPath(); ctx.ellipse(TX - TW / 2 + 24 + x * 40 + (Math.round(yy / 24) % 2) * 16, yy, 16, 6, 0, 0, Math.PI * 2);
    ctx.fillStyle = rgba(H.mixHex(ACC, '#000000', 0.5), 0.35); ctx.fill();
  }
  ctx.restore();
  ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(200,225,255,0.55)'; roundRect(ctx, TX - TW / 2, TT, TW, TB - TT, 18); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(TX - TW / 2 + 16, TT + 16, 12, TB - TT - 32);

  // in-pipe (top-left) with coins dropping in
  ctx.fillStyle = '#4b6a88'; ctx.fillRect(TX - 200, TT - 64, 150, 30); ctx.fillRect(TX - 74, TT - 64, 30, 50);
  for (let i = 0; i < 4; i++) {
    const u = (t * 1.1 + i / 4) % 1, y = lerp(TT - 20, lvY - 10, u);
    K.drawCoin(ctx, TX - 59, y, 0.55, { spin: t * 7 + i, shadow: false });
  }
  K.drawLabel(ctx, TX - 170, TT + 60, 1, { text: P.inLabel || 'Revenue', size: 24 });
  // out-pipe (bottom-right) with more coins draining out
  ctx.fillStyle = '#4b6a88'; ctx.fillRect(TX + TW / 2 - 4, TB - 52, 120, 30);
  for (let i = 0; i < 6; i++) {
    const u = (t * 1.5 + i / 6) % 1, x = TX + TW / 2 + 110 + u * 120, y = TB - 30 + u * u * 50;
    ctx.save(); ctx.globalAlpha = 1 - u; K.drawCoin(ctx, x, y, 0.5, { spin: t * 9 + i, shadow: false }); ctx.restore();
  }
  K.drawLabel(ctx, TX + TW / 2 + 70, TB - 60, 1, { text: P.outLabel || 'Costs', size: 24 });

  // robot accountant (worried look: thinking)
  K.drawRobot(ctx, 800, 1035, 0.9, { t, state: t > tWarn ? 'thinking' : 'working', seed: 5, flip: true });

  // --- loss panel (top)
  const pk = K.popIn(t, tNow, 0.45);
  if (pk > 0) {
    const PX = 487, PY = 440, PW = 800, PH = 250;
    ctx.save(); ctx.translate(PX, PY + PH / 2); ctx.scale(Math.min(1.03, pk), Math.min(1.03, pk)); ctx.translate(-PX, -(PY + PH / 2));
    roundRect(ctx, PX - PW / 2, PY, PW, PH, 22); ctx.fillStyle = 'rgba(10,12,22,0.88)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.stroke();
    ctx.font = H.font('ui', 26); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = rgba('#ffffff', 0.7);
    ctx.fillText(P.head || 'OPERATING LOSS', PX - PW / 2 + 32, PY + 38);
    const maxA = Math.max(NOW.amount, BEF.amount), BWmax = 330, x0 = PX - PW / 2 + 250;
    const row = (y, d, k, faded) => {
      ctx.font = H.font('bold', 28); ctx.textAlign = 'left'; ctx.fillStyle = faded ? rgba('#ffffff', 0.6) : '#ffffff';
      ctx.fillText(d.label, PX - PW / 2 + 32, y);
      const w = Math.max(20, BWmax * (d.amount / maxA) * k);
      roundRect(ctx, x0, y - 20, w, 40, 20); ctx.fillStyle = faded ? rgba(RED, 0.4) : RED; ctx.fill();
      ctx.font = H.font('display', 36); ctx.fillStyle = faded ? rgba('#ffffff', 0.7) : '#ffffff';
      ctx.fillText(d.value, x0 + w + 16, y + 2);
    };
    row(PY + 110, NOW, H.easeOutCubic(clamp((t - tNow) / 0.8)), false);
    const bk = clamp((t - tBefore) / 0.8);
    if (bk > 0) {
      ctx.save(); ctx.globalAlpha = clamp(bk * 2); row(PY + 190, BEF, H.easeOutCubic(bk), true); ctx.restore();
    }
    ctx.restore();
    const dk = K.popIn(t, tBefore + 0.9, 0.4);
    if (dk > 0) K.drawLabel(ctx, 760, 452, Math.min(1.05, dk), { text: P.down || 'Smaller loss', size: 24, accent: true });
  }

  // --- warning + verbatim quote (replaces the panel area's lower half over the robot)
  const wk = K.popIn(t, tWarn, 0.45);
  if (wk > 0) {
    K.drawWarning(ctx, 630, 1035, 0.8 * Math.min(1.05, wk), { pulse: 0.5 + 0.5 * Math.sin(t * 5) });
    const QX = 487, QY = 706, QW = 820;
    const q = String(P.quote || 'Quote goes here');
    const shown = K.typewriter ? K.typewriter(q, t, 40, tWarn + 0.3) : q;
    ctx.save(); ctx.globalAlpha = clamp(wk);
    roundRect(ctx, QX - QW / 2, QY, QW, 96, 18); ctx.fillStyle = ACC; ctx.fill();
    ctx.font = H.font('bold', 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#10142a';
    ctx.fillText('“' + shown + (shown.length >= q.length ? '”' : ''), QX, QY + 36);
    ctx.font = H.font('ui', 20); ctx.fillStyle = rgba('#10142a', 0.75);
    ctx.fillText(P.by || 'Source', QX, QY + 74);
    ctx.restore();
  }
  ctx.restore();
}
