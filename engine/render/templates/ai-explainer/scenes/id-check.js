// Scene "id-check" (full frame, 1 beat). Close-up at a store door at dusk: a cartoon doorman with a clipboard checks an
// AI agent robot. Left card ("<leftHead>") gets two rows on their cues: a blank name badge with "?" pops on the robot's
// chest (noId), then a key card appears in its hand and gets flagged (logins). Then the right card ("<rightHead>")
// slides in with a shield and the other side's reply. Two-sided: one party's stated reasons vs the other's answer.
// Fits: "site says the bot doesn't identify itself / handles passwords", "company A says X, company B says Y".
// params: leftHead ("Store says"), noId ("No ID shown"), logins ("Stores logins?"), rightHead ("Maker says"),
//         reply ("Can't see passwords"), cues (narration words; without them, fractions of the scene):
//         idCue ("identify"), loginCue ("logins"), replyCue (e.g. the maker's name)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tId = at(P.idCue || 'identify', D * 0.15) - 0.3;
  const tLog = at(P.loginCue || 'logins', D * 0.45) - 0.9;
  const tRep = at(P.replyCue, D * 0.68) - 0.2;
  const ink = '#ffffff', danger = '#ff6b5e';

  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });
  const feet = 1035;
  // big closed store doors behind
  roundRect(ctx, 40, 640, 1000, 370, 12); ctx.fillStyle = '#343a6a'; ctx.fill();
  roundRect(ctx, 520, 690, 360, 320, 8); ctx.fillStyle = '#5a6496'; ctx.fill();
  ctx.fillStyle = '#2a2f45'; ctx.fillRect(698, 690, 4, 320);
  ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(535, 705, 150, 30); ctx.fillRect(715, 705, 150, 30);
  for (const wx of [80, 300]) { roundRect(ctx, wx, 760, 180, 150, 8); ctx.fillStyle = 'rgba(255,217,138,0.75)'; ctx.fill(); }

  // robot (left), doorman (right)
  const lean = smooth((t - tLog) / 0.4) - smooth((t - tRep) / 0.5);
  K.drawRobot(ctx, 300, feet, 1.45, { t, state: t > tRep + 0.3 ? 'happy' : (t > tId ? 'thinking' : 'idle'), seed: 2 });
  K.drawPerson(ctx, 700, feet, 1.45, { t, pose: t > tId && t < tRep ? 'point' : 'stand', flip: true, mood: 'neutral', skin: 3, hair: 0,
    shirt: '#1c2034', hairStyle: 'none', look: -0.5, seed: 5 });
  // clipboard in front of the doorman
  ctx.save(); ctx.translate(745, 860); ctx.rotate(-0.12);
  roundRect(ctx, -46, -60, 92, 120, 8); ctx.fillStyle = '#9a6a46'; ctx.fill();
  roundRect(ctx, -38, -50, 76, 102, 4); ctx.fillStyle = '#f2f4fa'; ctx.fill();
  ctx.fillStyle = '#b9c1d6'; for (let i = 0; i < 4; i++) ctx.fillRect(-28, -34 + i * 22, i === 3 ? 34 : 56, 6);
  ctx.restore();

  // name badge on the robot's chest with "?"
  const bk = K.popIn(t, tId + 0.2, 0.4);
  if (bk > 0) {
    ctx.save(); ctx.translate(300, 860); ctx.scale(Math.min(1.05, bk), Math.min(1.05, bk));
    roundRect(ctx, -52, -30, 104, 60, 10); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = danger; ctx.stroke();
    ctx.font = H.font('display', 40); ctx.fillStyle = danger; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('?', 0, 3);
    ctx.restore();
  }
  // key card held out to the side (logins)
  const kk = K.popIn(t, tLog + 0.3, 0.4);
  if (kk > 0) {
    const kx = 160 - 10 * lean, ky = 870 + K.bob(t, 3, 2);
    ctx.save(); ctx.translate(kx, ky); ctx.rotate(-0.2); ctx.scale(Math.min(1.05, kk), Math.min(1.05, kk));
    roundRect(ctx, -60, -38, 120, 76, 10); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = K.ACCENT.deep; ctx.beginPath(); ctx.arc(-28, 0, 16, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(-28, 0, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = K.ACCENT.deep; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(4 + i * 18, 0, 5, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    const fk = K.popIn(t, tLog + 0.8, 0.35);
    if (fk > 0) K.drawWarning(ctx, kx + 40, ky - 46, 0.45 * Math.min(1.05, fk), { pulse: t });
  }

  // ---- cards ----
  const card = (cx, cy, w, h, k, head, accentBorder, dim) => {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(Math.min(1.04, k), Math.min(1.04, k)); ctx.globalAlpha = dim;
    roundRect(ctx, -w / 2, -h / 2, w, h, 24); ctx.fillStyle = 'rgba(8,10,24,0.94)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = accentBorder ? ACC : 'rgba(255,255,255,0.25)'; ctx.stroke();
    ctx.font = H.font('ui', 26); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(head).toUpperCase(), 0, -h / 2 + 34);
    ctx.restore();
  };
  const W = 400, Hc = 250, cyc = 545;
  const lk = K.popIn(t, tId - 0.2, 0.45);
  const lx = 268, rxC = 707;
  if (lk > 0) {
    const dimL = 1 - 0.35 * smooth((t - tRep) / 0.5);
    card(lx, cyc, W, Hc, lk, P.leftHead || 'Store says', false, dimL);
    const rows = [{ text: P.noId || 'No ID shown', t0: tId + 0.2 }, { text: P.logins || 'Stores logins?', t0: tLog + 0.6 }];
    rows.forEach((r, i) => {
      const k = K.popIn(t, r.t0, 0.35);
      if (k <= 0) return;
      ctx.save(); ctx.globalAlpha = dimL * clamp(k); ctx.translate(lx - W / 2 + 34, cyc - 30 + i * 74);
      // cross icon
      ctx.beginPath(); ctx.arc(14, 0, 18, 0, Math.PI * 2); ctx.fillStyle = danger; ctx.fill();
      ctx.strokeStyle = '#2a0f0c'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(7, -7); ctx.lineTo(21, 7); ctx.moveTo(21, -7); ctx.lineTo(7, 7); ctx.stroke();
      const f = H.fitText(ctx, r.text, 'bold', 34, 22, W - 110); ctx.font = f.font; ctx.fillStyle = ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(f.text, 46, 2);
      ctx.restore();
    });
  }
  const rk = K.popIn(t, tRep, 0.45);
  if (rk > 0) {
    const slide = (1 - smooth((t - tRep) / 0.45)) * 120;
    ctx.save(); ctx.translate(slide, 0);
    card(rxC, cyc, W, Hc, rk, P.rightHead || 'Maker says', true, 1);
    K.drawShield(ctx, rxC - W / 2 + 50, cyc + 62, 0.42, { check: clamp((t - tRep - 0.3) / 0.4) });
    let rs = 30, lines; for (; rs >= 24; rs -= 2) { lines = H.wrap(ctx, P.reply || "Can't see passwords", 'bold', rs, W - 112); if (lines.length <= 3) break; }
    ctx.font = H.font('bold', rs); ctx.fillStyle = ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const shown = K.typewriter(lines.join(' '), t, 34, tRep + 0.35);
    let left = shown.length;
    lines.slice(0, 3).forEach((ln, j) => { const part = ln.slice(0, Math.max(0, left)); left -= ln.length + 1; ctx.fillText(part, rxC - W / 2 + 92, cyc + 22 + (j - (Math.min(3, lines.length) - 1) / 2) * rs * 1.25); });
    ctx.restore();
  }
  void lerp; void rgba;
}
