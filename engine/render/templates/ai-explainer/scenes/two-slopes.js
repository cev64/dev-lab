// Scene "two-slopes" (full frame, 1 beat). Growth rates as two hills at dusk: on the left a cliff that curves up
// exponentially ("try every combo") where a hiker climbs, slows and slides back; on the right a gentler hill that
// still rises ("claimed method") which the kit robot walks up steadily. A claim pill opens the beat, "still
// rises" / "not exponential" tags land on gentleCue, and a "not X" chip with a strike lands on notCue.
// Fits: "a faster algorithm" / "it still gets harder, just slower" / growth-rate comparisons.
// params: claim ("The paper: a faster way"), steep, gentle, still ("Still climbs"), notExp ("Just not exponentially"),
//         notChip ('Not "solved"'), gentleCue, notCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, easeInOutCubic } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tGentle = at(P.gentleCue, D * 0.3);
  const tNot = at(P.notCue, D * 0.85) - 0.6;
  const base = 1035;

  // curves
  const steepX0 = 80, steepX1 = 470, steepH = 520;
  const gentX0 = 520, gentX1 = 960, gentH = 300;
  const steepY = (u) => base - steepH * (Math.exp(4.2 * u) - 1) / (Math.exp(4.2) - 1);
  const gentY = (u) => base - gentH * Math.pow(u, 1.35);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.04, x: 520, y: 760 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 1040 });
  // ground band
  ctx.fillStyle = '#20223f'; ctx.fillRect(0, 1035, 1080, 900);

  const hill = (x0, x1, fy, col, edge) => {
    ctx.beginPath(); ctx.moveTo(x0, base + 10);
    for (let i = 0; i <= 40; i++) { const u = i / 40; ctx.lineTo(lerp(x0, x1, u), fy(u)); }
    ctx.lineTo(x1 + 30, fy(1)); ctx.lineTo(x1 + 30, base + 10); ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
    ctx.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40; const x = lerp(x0, x1, u), y = fy(u); if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
    ctx.lineWidth = 8; ctx.strokeStyle = edge; ctx.lineCap = 'round'; ctx.stroke();
  };
  hill(steepX0, steepX1, steepY, '#3a2f55', '#ff6b5e');
  hill(gentX0, gentX1, gentY, '#2f4a5a', ACC);

  // flags at the tops
  const flag = (x, y, col) => { ctx.fillStyle = '#d5dae8'; ctx.fillRect(x - 3, y - 80, 6, 80); ctx.beginPath(); ctx.moveTo(x + 3, y - 80); ctx.lineTo(x + 52, y - 66 + Math.sin(t * 4) * 4); ctx.lineTo(x + 3, y - 52); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
  flag(steepX1 + 10, steepY(1), '#ff6b5e');
  flag(gentX1 + 10, gentY(1), ACC);

  // hiker on the steep cliff: climbs fast at first, stalls, slides back, repeats (pure function of t)
  const cyc = 3.4, ph = (t % cyc) / cyc;
  const uS = ph < 0.7 ? 0.62 * easeOutCubic(ph / 0.7) : 0.62 * (1 - easeInOutCubic((ph - 0.7) / 0.3) * 0.55);
  const sx = lerp(steepX0, steepX1, uS), sy = steepY(uS);
  K.drawPerson(ctx, sx, sy, 0.95, { t, walk: ph < 0.7 ? t : undefined, pose: ph < 0.7 ? 'stand' : 'shrug', mood: uS > 0.4 ? 'shocked' : 'worried', skin: 1, hair: 2, shirt: 2, hairStyle: 'short', seed: 9 });

  // robot on the gentle hill: steady walk to the top by the end
  const uR = clamp(easeInOutCubic(clamp((t - 0.6) / (D - 1.4))) * 0.96);
  const rx = lerp(gentX0, gentX1, uR), ry = gentY(uR);
  K.drawRobot(ctx, rx, ry, 0.85, { t, state: uR >= 0.95 ? 'happy' : 'working', seed: 2 });
  // dotted trail behind the robot
  ctx.save(); ctx.fillStyle = ACC;
  for (let i = 0; i < 24; i++) { const u = (i / 24) * uR; if (u < uR - 0.05) { ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(lerp(gentX0, gentX1, u), gentY(u) - 8, 5, 0, Math.PI * 2); ctx.fill(); } }
  ctx.restore();
  ctx.restore();

  // labels (screen space; camera is gentle so they stay close)
  tag(H, ctx, 250, 1000, K.popIn(t, 0.3, 0.4), P.steep || 'Try every combo', '#ff6b5e');
  tag(H, ctx, 760, 1000, K.popIn(t, 0.7, 0.4), P.gentle || 'Claimed method', ACC);
  pill(H, ctx, 487, 438, K.popIn(t, 0.2, 0.45) * (1 - smooth((t - tNot + 0.2) / 0.3)), P.claim || 'The paper: a faster way', ACC, true);
  pill(H, ctx, 720, 560, K.popIn(t, tGentle + 0.2, 0.4), P.still || 'Still climbs...', ACC, false);
  pill(H, ctx, 720, 640, K.popIn(t, tGentle + 1.8, 0.4), P.notExp || '...just not exponentially', ACC, false);
  // the "not X" chip
  const nk = K.popIn(t, tNot, 0.45);
  if (nk > 0.01) {
    ctx.save(); ctx.translate(487, 468); ctx.scale(Math.min(1.05, nk), Math.min(1.05, nk));
    const f = H.fitText(ctx, P.notChip || 'Not "solved"', 'display', 46, 26, 560); ctx.font = f.font;
    const w = ctx.measureText(f.text).width + 80;
    H.roundRect(ctx, -w / 2, -44, w, 88, 22); ctx.fillStyle = 'rgba(10,12,24,0.95)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = '#ff6b5e'; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 3);
    ctx.restore();
  }
}

function tag(H, ctx, x, y, k, text, col) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1, k), Math.min(1, k));
  const f = H.fitText(ctx, text, 'ui', 28, 20, 360); ctx.font = f.font;
  const w = ctx.measureText(f.text).width + 40;
  H.roundRect(ctx, -w / 2, -24, w, 48, 12); ctx.fillStyle = 'rgba(10,12,24,0.88)'; ctx.fill();
  ctx.fillStyle = col; ctx.fillRect(-w / 2, -24, 8, 48);
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 4, 2);
  ctx.restore();
}

function pill(H, ctx, x, y, k, text, ACC, solid) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y + 30); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  const f = H.fitText(ctx, text, 'ui', 32, 22, 420); ctx.font = f.font;
  const w = ctx.measureText(f.text).width + 56;
  H.roundRect(ctx, -w / 2, -30, w, 60, 30); ctx.fillStyle = solid ? ACC : 'rgba(10,12,24,0.92)'; ctx.fill();
  if (!solid) { ctx.lineWidth = 2.5; ctx.strokeStyle = ACC; ctx.stroke(); }
  ctx.fillStyle = solid ? '#14160a' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
  ctx.restore();
}
