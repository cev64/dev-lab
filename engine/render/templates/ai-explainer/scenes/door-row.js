// Scene "door-row" (full frame, 1 beat). Dusk street with two doors side by side, each with a text name pill (no logos).
// Left: a diner whose door has a coin-slot gate and a "<aSign>" board; an agent robot drops a coin, the arm lifts, it
// walks in. Right: an airline gate desk with a departures board and a belt barrier; a second robot with a boarding pass
// walks up, the barrier stays shut, a "<bSign>" board drops and a cross stamp lands. Camera drifts left, then right.
// Fits: "site A only lets in paying bots, site B doesn't let bots book", any "pay to enter vs. closed" comparison.
// params: a ("Diner"), aSign ("Paid agents only"), b ("Airline"), bSign ("No outside agents"), stamp ("NO BOOKING"),
//         cues (narration words; without them, fractions of the scene): aCue, payCue ("pay"), bCue, bookCue ("book")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tA = at(P.aCue, D * 0.18) - 0.2;
  const tPay = at(P.payCue || 'pay', D * 0.36) - 0.3;
  const tB = at(P.bCue, D * 0.55) - 0.2;
  const tBook = at(P.bookCue || 'book', D * 0.85) - 0.3;
  const danger = '#ff6b5e', feet = 1030;

  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });

  // ---------- left: diner ----------
  const ax0 = 40, ax1 = 500, aTop = 610, aDoor = 330;
  roundRect(ctx, ax0, aTop, ax1 - ax0, 1000 - aTop, 12); ctx.fillStyle = '#7a3e4e'; ctx.fill();
  ctx.fillStyle = '#5e2f3c'; ctx.fillRect(ax0, aTop + 70, ax1 - ax0, 10);
  roundRect(ctx, ax0 + 25, 780, 170, 130, 8); ctx.fillStyle = 'rgba(255,217,138,0.85)'; ctx.fill();
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(ax0 + 60 + i * 50, 860, 14, 0, Math.PI * 2); ctx.fillStyle = 'rgba(122,62,78,0.5)'; ctx.fill(); }
  // door
  const open = smooth((t - tPay - 0.7) / 0.5);
  roundRect(ctx, aDoor - 70, 760, 140, 240, 8); ctx.fillStyle = '#fff1c4'; ctx.fill();
  ctx.fillStyle = '#4a2430'; ctx.fillRect(aDoor - 70, 760, 140 * (1 - 0.75 * open), 240);
  // name pill + board
  K.drawLabel(ctx, (ax0 + ax1) / 2, 668, Math.min(1.05, K.popIn(t, tA, 0.4)), { text: P.a || 'Diner', size: 30, dot: true });
  const sbk = K.popIn(t, tA + 0.35, 0.4);
  if (sbk > 0) {
    ctx.save(); ctx.translate(aDoor - 20, 716); ctx.scale(Math.min(1.05, sbk), Math.min(1.05, sbk));
    const f = H.fitText(ctx, String(P.aSign || 'Paid agents only').toUpperCase(), 'bold', 28, 18, 330);
    ctx.font = f.font; const w = ctx.measureText(f.text).width + 40;
    roundRect(ctx, -w / 2, -26, w, 52, 12); ctx.fillStyle = '#15182e'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
    ctx.restore();
  }
  // coin gate: post with slot + arm
  ctx.fillStyle = '#c9cfe0'; roundRect(ctx, 228, 870, 34, 130, 8); ctx.fill();
  ctx.fillStyle = '#2a2f45'; ctx.fillRect(238, 890, 14, 5);
  const arm = smooth((t - tPay - 0.45) / 0.4);
  ctx.save(); ctx.translate(245, 905); ctx.rotate(-arm * 1.35);
  roundRect(ctx, 0, -7, 150, 14, 7); ctx.fillStyle = arm > 0.5 ? ACC : danger; ctx.fill(); ctx.restore();
  // robot A: walks up, pays, walks in
  const aIn = smooth((t - tPay - 0.9) / 1.2);
  const aX = lerp(lerp(80, 175, smooth((t - 0.2) / 1.6)), aDoor, aIn);
  const aFade = 1 - smooth((t - tPay - 1.7) / 0.5);
  if (aFade > 0) {
    ctx.save(); ctx.globalAlpha = aFade;
    K.drawRobot(ctx, aX, feet - 2, 0.95, { t, state: t > tPay + 0.5 ? 'happy' : 'idle', seed: 4 });
    ctx.restore();
  }
  // coin arc
  const cu = clamp((t - tPay) / 0.45);
  if (cu > 0 && cu < 1) {
    const cx = lerp(aX + 40, 245, cu), cy = lerp(880, 892, cu) - Math.sin(cu * Math.PI) * 80;
    K.drawCoin(ctx, cx, cy + 20, 0.6, { spin: t * 9 });
  }
  if (t > tPay + 0.45) { const ck = K.popIn(t, tPay + 0.45, 0.35); K.drawLabel(ctx, 245, 862, Math.min(1.05, ck) * (1 - smooth((t - tB) / 0.4)), { text: 'Paid', size: 24, accent: true }); }

  // ---------- right: airline gate ----------
  const bx0 = 540, bx1 = 1040, bTop = 600;
  roundRect(ctx, bx0, bTop, bx1 - bx0, 1000 - bTop, 12); ctx.fillStyle = '#2f4f7a'; ctx.fill();
  // departures board
  roundRect(ctx, 590, 650, 300, 130, 10); ctx.fillStyle = '#121527'; ctx.fill();
  for (let r = 0; r < 4; r++) {
    const blink = (r === 1 && t > tBook) ? (Math.sin(t * 8) > 0 ? 1 : 0.4) : 1;
    ctx.fillStyle = r === 1 && t > tBook ? rgba(danger, blink) : 'rgba(255,217,138,0.9)';
    ctx.fillRect(606, 668 + r * 27, 90, 12); ctx.fillRect(712, 668 + r * 27, 60, 12);
    ctx.fillStyle = 'rgba(223,228,241,0.6)'; ctx.fillRect(790, 668 + r * 27, 80, 12);
  }
  // window with a plane tail silhouette
  roundRect(ctx, 905, 650, 120, 200, 10); ctx.fillStyle = '#8fb2e0'; ctx.fill();
  ctx.fillStyle = '#e8edf8'; ctx.beginPath(); ctx.moveTo(940, 850); ctx.lineTo(975, 740); ctx.lineTo(1000, 740); ctx.lineTo(995, 850); ctx.fill();
  // gate desk
  roundRect(ctx, 760, 890, 150, 110, 10); ctx.fillStyle = '#dfe4f1'; ctx.fill(); ctx.fillStyle = '#b9c1d6'; ctx.fillRect(760, 890, 150, 18);
  K.drawPerson(ctx, 835, 905, 0.9, { t, pose: t > tBook ? 'shrug' : 'stand', flip: true, mood: 'neutral', skin: 0, hair: 1, shirt: '#2f4f7a', hairStyle: 'bun', seed: 8, look: -0.6 });
  roundRect(ctx, 760, 890, 150, 110, 10); ctx.fillStyle = '#dfe4f1'; ctx.fill(); ctx.fillStyle = '#b9c1d6'; ctx.fillRect(760, 890, 150, 18);
  // belt barrier posts
  for (const px of [610, 740]) { ctx.fillStyle = '#c9cfe0'; roundRect(ctx, px - 6, 900, 12, 100, 6); ctx.fill(); ctx.beginPath(); ctx.arc(px, 898, 10, 0, Math.PI * 2); ctx.fill(); }
  const belt = 0.6 + 0.4 * smooth((t - tBook) / 0.3);
  ctx.strokeStyle = t > tBook ? danger : '#ff9a8e'; ctx.lineWidth = 9 * belt; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(610, 912); ctx.quadraticCurveTo(675, 930, 740, 912); ctx.stroke();
  K.drawLabel(ctx, (bx0 + 915) / 2, 640, Math.min(1.05, K.popIn(t, tB, 0.4)), { text: P.b || 'Airline', size: 30, dot: true });
  // robot B with a boarding pass, walks up to the barrier and stops
  const bArr = smooth((t - tB) / 1.4);
  if (t > tB - 0.6) {
    const bX = lerp(470, 560, bArr) - K.shake(t, tBook + 0.1, 0.35, 5);
    K.drawRobot(ctx, bX, feet - 2, 0.95, { t, state: t > tBook + 0.2 ? 'thinking' : 'happy', seed: 6 });
    ctx.save(); ctx.translate(bX + 62, 900); ctx.rotate(-0.25);
    roundRect(ctx, -26, -40, 52, 80, 6); ctx.fillStyle = '#f2f4fa'; ctx.fill(); ctx.fillStyle = ACC; ctx.fillRect(-26, -40, 52, 20);
    ctx.fillStyle = '#b9c1d6'; ctx.fillRect(-16, -6, 32, 5); ctx.fillRect(-16, 6, 22, 5); ctx.restore();
  }
  // sign drops above the gate + stamp
  const dk = K.popIn(t, tBook - 0.5, 0.45);
  if (dk > 0) {
    const drop = (1 - smooth((t - tBook + 0.5) / 0.45)) * -80;
    ctx.save(); ctx.translate(735, 540 + drop);
    const txt = P.bSign || 'No outside agents';
    ctx.font = H.font('bold', 28); const w = Math.min(380, ctx.measureText(txt).width + 50);
    roundRect(ctx, -w / 2, -34, w, 68, 14); ctx.fillStyle = '#15182e'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = danger; ctx.stroke();
    const f = H.fitText(ctx, txt, 'bold', 28, 20, w - 30); ctx.font = f.font; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
    ctx.restore();
  }
  const st = (t - tBook - 0.15) / 0.55;
  if (st > 0) K.drawStamp(ctx, 675, 960, 0.85, { kind: 'cross', text: P.stamp || 'NO BOOKING', land: st });
}
