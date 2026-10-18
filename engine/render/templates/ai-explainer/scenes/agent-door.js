// Scene "agent-door" (full frame, best as a 2-beat span). Dusk shopping street: a person on the left sends an AI agent
// robot (shopping bag, "AI agent" pill) walking to a glowing store front with the store's name as a text pill (no logo).
// "Browse" / "Buy" chips pop as it walks; on bounceCue a cartoon doorman steps out, hand up, the doors slide shut and
// the robot recoils; a date pill pops, a BLOCKED stamp lands on the doors and the robot's pill renames to `named`.
// Fits: "a website / store blocks AI agents", "an agent gets turned away", "access denied to bots".
// params: store ("Store"), sign ("SHOP"), agent ("AI agent"), named (pill text after nameCue; '' keeps agent),
//         chips (["Browse", "Buy"]), chipCues (["browse", "buy"]), date ("" hides), stamp ("BLOCKED"),
//         check ("Door check", the doorman's pill), cues (narration words; without them, fractions of the scene /
//         chained after the bounce): bounceCue, dateCue, storeCue, stampCue, nameCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba, mixHex } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const chips = P.chips || ['Browse', 'Buy'];
  const chipCues = P.chipCues || ['browse', 'buy'];
  const tChip = chips.map((c, i) => at(chipCues[i], 3.5 + i * 0.8) - 0.15);
  const tBounce = at(P.bounceCue, D * 0.55) - 0.35;
  const tDate = at(P.dateCue, tBounce + 1.6) - 0.1;
  const tStore = at(P.storeCue, tDate + 1.2) - 0.2;
  const tStamp = at(P.stampCue, tStore + 0.3) - 0.05;
  const tName = at(P.nameCue, tStamp + 1.5) - 0.3;

  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tBounce, zoom: 1.04, x: 520, y: 760 }, { t: D, zoom: 1.08, x: 560, y: 770 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });
  const feet = 1030;

  // ---- store front (right) ----
  const sx0 = 540, sx1 = 960, sTop = 520, doorX = 750, doorW = 200, doorTop = 760;
  roundRect(ctx, sx0, sTop, sx1 - sx0, 1000 - sTop, 12); ctx.fillStyle = '#343a6a'; ctx.fill();
  ctx.fillStyle = '#2b3058'; ctx.fillRect(sx0, sTop + 150, sx1 - sx0, 12);
  // shop windows (warm) either side of the door
  for (const wx of [sx0 + 22, doorX + doorW / 2 + 22]) {
    const ww = (wx < doorX ? doorX - doorW / 2 - 22 - wx : sx1 - 22 - wx);
    roundRect(ctx, wx, 800, ww, 150, 8); ctx.fillStyle = '#ffd98a'; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
    for (let i = 0; i < 2; i++) { roundRect(ctx, wx + 10 + i * (ww / 2), 880, ww / 2 - 20, 60, 6); ctx.fillStyle = 'rgba(80,60,40,0.35)'; ctx.fill(); }
  }
  // striped awning
  const aw0 = sx0 - 10, aw1 = sx1 + 10, ay = 700;
  for (let i = 0; i < 9; i++) {
    const x0 = lerp(aw0, aw1, i / 9), x1 = lerp(aw0, aw1, (i + 1) / 9);
    ctx.beginPath(); ctx.moveTo(x0, ay); ctx.lineTo(x1, ay); ctx.lineTo(x1 + 4, ay + 52); ctx.arc((x0 + x1) / 2 + 4, ay + 52, (x1 - x0) / 2, 0, Math.PI); ctx.closePath();
    ctx.fillStyle = i % 2 ? '#e8edf8' : ACC; ctx.fill();
  }
  // sign board on the facade
  ctx.save(); ctx.translate((sx0 + sx1) / 2, 600);
  roundRect(ctx, -150, -42, 300, 84, 14); ctx.fillStyle = '#15182e'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = rgba(ACC, 0.9); ctx.stroke();
  ctx.font = H.font('display', 46); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ACC;
  ctx.fillText(P.sign || 'SHOP', 0, 3);
  ctx.restore();

  // doorway glow + sliding doors (close on bounce)
  const shut = smooth((t - tBounce - 0.15) / 0.5);
  K.glow(ctx, doorX, 880, 230, ACC, 0.3 * (1 - 0.8 * shut));
  roundRect(ctx, doorX - doorW / 2 - 10, doorTop - 10, doorW + 20, 1000 - doorTop + 10, 10); ctx.fillStyle = '#1a1d36'; ctx.fill();
  const g = ctx.createLinearGradient(0, doorTop, 0, 1000); g.addColorStop(0, '#fff1c4'); g.addColorStop(1, mixHex('#ffd98a', ACC, 0.3));
  ctx.fillStyle = g; ctx.fillRect(doorX - doorW / 2, doorTop, doorW, 1000 - doorTop);
  const half = (doorW / 2) * shut;
  ctx.fillStyle = '#5a6496';
  ctx.fillRect(doorX - doorW / 2, doorTop, half, 1000 - doorTop);
  ctx.fillRect(doorX + doorW / 2 - half, doorTop, half, 1000 - doorTop);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  if (half > 6) { ctx.fillRect(doorX - doorW / 2 + 12, doorTop + 14, Math.max(0, half - 24), 26); ctx.fillRect(doorX + doorW / 2 - half + 12, doorTop + 14, Math.max(0, half - 24), 26); }
  if (shut > 0.95) { ctx.fillStyle = '#2a2f45'; ctx.fillRect(doorX - 2, doorTop, 4, 1000 - doorTop); }

  // ---- doorman steps out in front of the door ----
  const out = smooth((t - tBounce) / 0.45);
  if (t > tBounce - 0.05) {
    const bx = lerp(doorX, 640, out);
    K.drawPerson(ctx, bx, feet, 1.35, { t, pose: out > 0.6 ? 'point' : 'stand', flip: true, mood: 'neutral', skin: 3, hair: 0,
      shirt: '#1c2034', hairStyle: 'none', look: -0.6, walk: out < 1 ? t : undefined, seed: 5 });
    if (out > 0.5) K.drawLabel(ctx, bx, 712, Math.min(1, K.popIn(t, tBounce + 0.25, 0.35)), { text: P.check || 'Door check', size: 24 });
  }

  // ---- person sending the agent (left) ----
  K.drawPerson(ctx, 115, feet, 1.25, { t, pose: 'phone', mood: t > tBounce + 0.4 ? 'worried' : 'happy', skin: 1, hair: 2, shirt: 1, hairStyle: 'long', seed: 2, look: 0.5 });

  // ---- robot shopper walks, then recoils ----
  const walkU = smooth(clamp((t - 0.4) / Math.max(1, tBounce - 0.4)));
  const recoil = smooth((t - tBounce - 0.2) / 0.4) * 40 - 12 * Math.sin(clamp((t - tBounce - 0.2) / 0.4) * Math.PI);
  const rx = lerp(260, 470, walkU) - recoil, rBob = t < tBounce ? -Math.abs(Math.sin(t * 6)) * 6 : 0;
  // signal from the phone to the robot
  const link = 1 - smooth((t - 2.6) / 0.6);
  if (link > 0) {
    ctx.save(); ctx.setLineDash([10, 12]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = rgba(ACC, 0.8 * link); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(150, 850); ctx.quadraticCurveTo((150 + rx) / 2, 760, rx - 30, 860); ctx.stroke(); ctx.restore();
  }
  const sh = K.shake(t, tBounce + 0.2, 0.4, 6);
  K.drawRobot(ctx, rx + sh, feet + rBob, 1.15, { t, state: t > tBounce + 0.2 ? 'thinking' : 'happy', seed: 2 });
  // shopping bag in its hand
  ctx.save(); ctx.translate(rx + 70 + sh, 930 + rBob); ctx.rotate(0.06 * Math.sin(t * 5));
  roundRect(ctx, -30, -10, 60, 64, 8); ctx.fillStyle = ACC; ctx.fill();
  ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -10, 16, Math.PI, 0); ctx.stroke();
  ctx.restore();
  // agent pill (renames on nameCue)
  const renamed = P.named && t > tName;
  const pk = K.popIn(t, 0.3, 0.4) * (renamed ? Math.min(1.08, 0.7 + 0.3 * K.popIn(t, tName, 0.4)) : 1);
  K.drawLabel(ctx, rx, 735, Math.min(1.08, pk), { text: renamed ? P.named : (P.agent || 'AI agent'), size: 28, dot: true, accent: !!renamed });
  // browse / buy chips
  chips.forEach((c, i) => {
    const k = K.popIn(t, tChip[i], 0.35) * (1 - smooth((t - tBounce) / 0.3));
    if (k > 0.01) K.drawLabel(ctx, rx - 70 + i * 150, 660 + K.bob(t, 4, 1.6, i), Math.min(1.05, k), { text: c, size: 26 });
  });

  // ---- store name pill, date pill, stamp ----
  const nk = K.popIn(t, Math.min(0.5, tStore), 0.4);
  const flash = clamp(1 - Math.abs(t - tStore - 0.2) / 0.4);
  if (flash > 0) K.glow(ctx, (sx0 + sx1) / 2, 505, 160, ACC, 0.5 * flash);
  K.drawLabel(ctx, (sx0 + sx1) / 2, 530, Math.min(1.05, nk) * (1 + 0.08 * flash), { text: P.store || 'Store', size: 30, dot: true });
  if (P.date) {
    const dk = K.popIn(t, tDate, 0.4);
    if (dk > 0) K.drawLabel(ctx, 300, 520, Math.min(1.05, dk), { text: P.date, size: 30, accent: true });
  }
  const st = (t - tStamp) / 0.55;
  if (st > 0) K.drawStamp(ctx, doorX, 1000, 0.95, { kind: 'cross', text: P.stamp || 'BLOCKED', land: st });
}
