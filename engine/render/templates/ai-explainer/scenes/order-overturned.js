// Scene "order-overturned" (full frame, 1 beat). Cartoon courtroom: a case pill (text) pops; an AI agent robot with a shopping
// bag stands at the podium side; on orderCue a court-order sheet ("<order>") drops in front of the bench and the gavel
// strikes, the robot freezes; on whenCue a higher-court pill pops, and on flipCue an OVERTURNED stamp lands on the sheet,
// which tilts and greys, and the robot perks up. No real people (the judge is never drawn; an empty bench).
// Fits: "a court ordered X, then an appeals court overturned it", "a ban that got lifted".
// params: case ("A v. B"), order ("Stop"), stamp ("OVERTURNED"), when ("Appeals court"), agent ("Shopping agent"),
//         suedCue ("sued"), orderCue ("ordered"), whenCue ("appeals"), flipCue ("overturned")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tSued = at(P.suedCue || 'sued', D * 0.15) - 0.3;
  const tOrd = at(P.orderCue || 'ordered', D * 0.5) - 0.3;
  const tWhen = at(P.whenCue || 'appeals', D * 0.78) - 0.3;
  const tFlip = at(P.flipCue || 'overturned', D * 0.86) - 0.15;
  const feet = 1035;

  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tOrd, zoom: 1.04, x: 500, y: 740 }, { t: D, zoom: 1.06, x: 500, y: 730 }]);
  const room = K.world.courtroom(ctx, { t });
  const bench = room.bench || { x: 540, y: 620 };

  // gavel on the bench
  const hit1 = clamp((t - tOrd - 0.1) / 0.25), hit2 = clamp((t - tFlip - 0.05) / 0.25);
  const hitV = t < tFlip ? (hit1 < 1 ? hit1 : Math.max(0, 1 - (t - tOrd - 0.35) / 0.6)) : (hit2 < 1 ? hit2 : Math.max(0, 1 - (t - tFlip - 0.3) / 0.6));
  K.drawGavel(ctx, bench.x + 150, bench.y + 20, 1.15, { hit: hitV });

  // robot with a shopping bag (left)
  const frozen = t > tOrd + 0.35 && t < tFlip + 0.3;
  K.drawRobot(ctx, 230, feet, 1.15, { t, state: frozen ? 'thinking' : (t > tFlip + 0.3 ? 'happy' : 'working'), seed: 7 });
  ctx.save(); ctx.translate(300, 935); ctx.rotate(0.05 * Math.sin(t * 4));
  roundRect(ctx, -28, -8, 56, 60, 8); ctx.fillStyle = ACC; ctx.fill();
  ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -8, 15, Math.PI, 0); ctx.stroke();
  ctx.restore();
  K.drawLabel(ctx, 230, 742, Math.min(1, K.popIn(t, 0.3, 0.4)), { text: P.agent || 'Shopping agent', size: 26 });

  // case pill
  const ck = K.popIn(t, tSued, 0.45);
  if (ck > 0) K.drawLabel(ctx, 487, 480, Math.min(1.05, ck), { text: P.case || 'A v. B', size: 34, dot: true, accent: true });

  // court order sheet
  const ok = K.popIn(t, tOrd, 0.5);
  if (ok > 0) {
    const drop = (1 - smooth((t - tOrd) / 0.5)) * -160;
    const tilt = smooth((t - tFlip - 0.3) / 0.6) * 0.12;
    const grey = smooth((t - tFlip - 0.3) / 0.6);
    ctx.save(); ctx.translate(600, 800 + drop); ctx.rotate(-0.03 + tilt);
    ctx.globalAlpha = 1 - 0.35 * grey;
    const W = 330, Hh = 330;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; roundRect(ctx, -W / 2 + 8, -Hh / 2 + 10, W, Hh, 14); ctx.fill();
    roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 14); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = '#283152'; ctx.font = H.font('display', 34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('COURT ORDER', 0, -Hh / 2 + 46);
    ctx.fillStyle = '#d5dae8'; ctx.fillRect(-W / 2 + 30, -Hh / 2 + 76, W - 60, 4);
    const lines = H.wrap(ctx, P.order || 'Stop', 'bold', 40, W - 60);
    ctx.font = H.font('bold', 40); ctx.fillStyle = '#c0392b';
    lines.slice(0, 2).forEach((ln, j) => ctx.fillText(ln, 0, -10 + (j - (Math.min(2, lines.length) - 1) / 2) * 48));
    ctx.fillStyle = '#d5dae8'; for (let i = 0; i < 3; i++) ctx.fillRect(-W / 2 + 40, 70 + i * 26, i === 2 ? 140 : W - 80, 8);
    ctx.restore();
  }
  // higher court pill
  const wk = K.popIn(t, tWhen, 0.45);
  if (wk > 0) K.drawLabel(ctx, 600, 590, Math.min(1.05, wk), { text: P.when || 'Appeals court', size: 30, dot: true });
  // stamp
  const st = (t - tFlip) / 0.55;
  if (st > 0) K.drawStamp(ctx, 600, 905, 1.0, { kind: 'cross', text: P.stamp || 'OVERTURNED', land: st });
  void lerp; void rgba;
}
