// Scene "sandbox-escape" (full frame; span 2 beats). A night test lab: an AI robot works inside a glass "sandbox"
// (a box with a sand tray), wired by a floor cable through a wall socket to two outside office towers.
// Beat 1 "escape": a crack opens in the box wall, a mini copy of the robot squeezes out and rides the cable to the
//   towers, whose windows flash red with warning signs; then a verbatim quote panel lands at the top.
// Beat 2 "airgap": everything resets, the box gets a padlock (lock it down), a technician pulls the plug at the socket
//   (spark, an AIR GAP marker over the gap), the cable goes dark and an internet globe above the towers greys out.
// Fits: "AI escaped its sandbox / test environment", "containment", "air-gap / unplug from the internet", "lock it down".
// params (all optional): box (default "TEST SANDBOX"), boxLater (box label in beat 2, default = box),
//        outside (default "Outside systems"), disclosed (default "Disclosed incidents"), slip (default "Slipped out"),
//        breach (default "Broke into outside systems"), quote / quoteBy (verbatim only; omitted = no panel),
//        ask (default "FIRST ASK"), lock (default "Lock it down"), gap (default "AIR GAP"), offline (default "No internet")
//        cues (narration words; else fractions): disclosedCue, slipCue, breachCue, quoteCue, askCue, boxCue, lockCue,
//        gapCue, offlineCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent, N = K.NEUTRAL;
  const at = (w, d) => { const v = w != null ? info.timeOf(w) : null; return v == null ? d : v; };
  const tB = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.55;
  const tDisc = at(P.disclosedCue, tB * 0.1), tSlip = at(P.slipCue, tB * 0.22), tBreach = at(P.breachCue, tB * 0.4);
  const tQuote = at(P.quoteCue, tB * 0.72) - 0.4;
  const tAsk = at(P.askCue, tB + 0.6), tBox = at(P.boxCue, tB + (D - tB) * 0.25), tLock = at(P.lockCue, tB + (D - tB) * 0.42);
  const tGap = at(P.gapCue, tB + (D - tB) * 0.62) - 0.2, tOff = at(P.offlineCue, tB + (D - tB) * 0.85);
  const beat2 = t >= tB;
  const reset = K.phase(t, tB - 0.1, tB + 0.6);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 487, y: 800 }, { t: tSlip, zoom: 1.12, x: 470, y: 830 },
    { t: tBreach + 0.6, zoom: 1.1, x: 540, y: 820 }, { t: tB - 0.3, zoom: 1.06, x: 487, y: 800 },
    { t: tLock, zoom: 1.12, x: 420, y: 830 }, { t: tGap + 0.4, zoom: 1.14, x: 540, y: 850 }, { t: D, zoom: 1.08, x: 500, y: 820 }]);
  K.cameraShake(ctx, t, tBreach, 0.45, 10);
  K.cameraShake(ctx, t, tLock + 0.2, 0.35, 9);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 900 });
  const feet = 1012;

  // ---- outside towers (right) + internet globe
  const breached = !beat2 && t >= tBreach;
  const redK = breached ? 0.5 + 0.5 * Math.sin((t - tBreach) * 9) : 0;
  const TW = [{ x: 735, c: '#4f7f9a' }, { x: 852, c: '#7a5ba8' }];
  TW.forEach((w, i) => {
    K.drawBuilding(ctx, w.x, feet, 0.52, { t, color: w.c, floors: 9, lit: 0.6 });
    if (breached && t >= tBreach + i * 0.25) {
      const hgt = (60 + 9 * 44) * 0.52;
      ctx.save(); ctx.globalAlpha = 0.25 + 0.3 * redK; ctx.fillStyle = N.danger;
      H.roundRect(ctx, w.x - 57, feet - hgt, 114, hgt, 6); ctx.fill(); ctx.restore();
      K.drawWarning(ctx, w.x, feet - hgt - 30, 0.55 * K.popIn(t, tBreach + i * 0.25, 0.4), { pulse: t });
    }
  });
  const off = K.phase(t, tOff - 0.2, tOff + 0.4);
  // globe hovering over the towers ("the internet")
  ctx.save(); ctx.globalAlpha = 1 - 0.65 * off;
  K.drawGlobe(ctx, 795, 690 + K.bob(t, 5, 0.4), 0.62, { t, arcs: off > 0.5 ? 0 : 3, shadow: false });
  ctx.restore();
  if (off > 0) { // cross over the globe
    ctx.save(); ctx.strokeStyle = N.danger; ctx.lineWidth = 10; ctx.lineCap = 'round';
    const r = 44 * off, gx = 795, gy = 637;
    ctx.beginPath(); ctx.moveTo(gx - r, gy - r); ctx.lineTo(gx + r, gy + r); ctx.moveTo(gx + r, gy - r); ctx.lineTo(gx - r, gy + r); ctx.stroke(); ctx.restore();
  }

  // ---- cable: box -> plug/socket -> towers
  const sockX = 585, cabY = feet - 6;
  const pulled = t >= tGap ? easeOutCubic(clamp((t - tGap) / 0.35)) : 0;
  const live = pulled < 0.5;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#11142a'; ctx.lineWidth = 12;
  ctx.beginPath(); ctx.moveTo(sockX + 30, cabY); ctx.lineTo(TW[0].x, cabY); ctx.lineTo(TW[1].x, cabY); ctx.stroke();
  // cable from the box to the plug
  const plugX = lerp(sockX - 26, sockX - 92, pulled), plugY = lerp(cabY, cabY - 70, pulled);
  ctx.beginPath(); ctx.moveTo(470, cabY); ctx.quadraticCurveTo(lerp(530, 500, pulled), cabY + 4, plugX, plugY); ctx.stroke();
  // socket box
  H.roundRect(ctx, sockX - 4, cabY - 34, 44, 50, 8); ctx.fillStyle = N.lightS; ctx.fill();
  ctx.fillStyle = N.ink; H.roundRect(ctx, sockX + 4, cabY - 20, 6, 14, 2); ctx.fill(); H.roundRect(ctx, sockX + 18, cabY - 20, 6, 14, 2); ctx.fill();
  // plug
  ctx.save(); ctx.translate(plugX, plugY); ctx.rotate(-0.5 * pulled);
  H.roundRect(ctx, -26, -18, 30, 32, 6); ctx.fillStyle = '#e8786a'; ctx.fill();
  ctx.fillStyle = N.lightS; ctx.fillRect(4, -12, 14, 5); ctx.fillRect(4, 2, 14, 5);
  ctx.restore();
  // data packets along the cable while live
  if (live) for (let i = 0; i < 6; i++) {
    const u = ((t * 0.35 + i / 6) % 1); const x = lerp(470, TW[1].x, u);
    K.glow(ctx, x, cabY, 26, ACC, 0.5); ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(x, cabY, 6, 0, Math.PI * 2); ctx.fill();
  }
  // spark at the moment of pulling
  if (t >= tGap && t < tGap + 0.7) {
    const k = (t - tGap) / 0.7;
    ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = ACC; ctx.lineWidth = 5;
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r0 = 16 + 50 * k; ctx.beginPath(); ctx.moveTo(sockX + Math.cos(a) * r0, cabY - 14 + Math.sin(a) * r0); ctx.lineTo(sockX + Math.cos(a) * (r0 + 18), cabY - 14 + Math.sin(a) * (r0 + 18)); ctx.stroke(); }
    ctx.restore();
  }

  // ---- the sandbox (left)
  const bx0 = 92, bx1 = 470, by0 = 640;
  // sand tray + toys
  H.roundRect(ctx, bx0 + 10, feet - 40, bx1 - bx0 - 20, 40, 10); ctx.fillStyle = '#d9b26a'; ctx.fill();
  ctx.fillStyle = '#c49a52'; ctx.beginPath(); ctx.ellipse(bx0 + 90, feet - 38, 60, 16, 0, Math.PI, 0); ctx.fill();
  H.roundRect(ctx, bx1 - 80, feet - 74, 34, 36, 6); ctx.fillStyle = '#4fb3a6'; ctx.fill();
  // robot inside
  const robotState = beat2 ? (t >= tLock ? 'idle' : 'thinking') : (t >= tSlip && t < tBreach + 1 ? 'happy' : 'working');
  K.drawRobot(ctx, 282, feet - 36, 1.12, { t, state: robotState, seed: 4 });
  // glass walls
  H.roundRect(ctx, bx0, by0, bx1 - bx0, feet - by0 + 6, 16);
  ctx.fillStyle = 'rgba(140,200,255,0.10)'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(170,220,255,0.75)'; ctx.stroke();
  ctx.save(); ctx.globalAlpha = 0.35; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(bx0 + 30, by0 + 50); ctx.lineTo(bx0 + 80, by0 + 26); ctx.stroke(); ctx.restore();
  // crack on the right wall (beat 1), fades on reset
  const crack = (t >= tSlip - 0.3 ? clamp((t - tSlip + 0.3) / 0.35) : 0) * (1 - reset);
  if (crack > 0) {
    ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.lineJoin = 'round';
    K.pathDraw(ctx, [[bx1, 760], [bx1 - 22, 800], [bx1 + 8, 840], [bx1 - 18, 890], [bx1 + 6, 940], [bx1 - 8, 990]], crack);
    ctx.restore();
  }
  // mini robot escaping along the cable (beat 1)
  if (!beat2 && t >= tSlip) {
    const u = smooth(clamp((t - tSlip) / Math.max(0.6, tBreach - tSlip)));
    const mx = lerp(bx1 - 20, TW[0].x - 20, u), my = cabY - 8 - Math.abs(Math.sin(u * Math.PI * 4)) * 26;
    const a = t >= tBreach ? 1 - clamp((t - tBreach) / 0.5) : 1;
    if (a > 0) { ctx.save(); ctx.globalAlpha = a; K.drawRobot(ctx, mx, my, 0.42, { t, state: 'happy', seed: 8 }); ctx.restore(); }
  }
  // padlock on the box (beat 2)
  if (t >= tLock) {
    const k = clamp((t - tLock) / 0.35), y = lerp(by0 - 160, by0 + 170, easeOutCubic(k));
    K.drawLock(ctx, bx1 - 30, y, 0.9, { open: 0, shadow: false });
  }
  // technician walks in at beat 2 and pulls the plug
  if (beat2) {
    const walkIn = clamp((t - tB) / 1.2);
    const px = lerp(1100, 690, easeOutCubic(walkIn));
    K.drawPerson(ctx, px, 1036, 1.1, { t, walk: walkIn < 1 ? t - tB : 0, pose: t >= tGap - 0.6 ? 'point' : 'stand', mood: t >= tGap ? 'happy' : 'neutral', flip: true, look: -1, shirt: 1, skin: 2, hair: 4, hairStyle: 'bun', seed: 6 });
  }
  // air gap marker
  if (t >= tGap + 0.25) {
    const p = K.popIn(t, tGap + 0.25, 0.4);
    ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.moveTo(plugX + 6, cabY - 80); ctx.lineTo(plugX + 6, cabY + 20); ctx.moveTo(sockX - 4, cabY - 80); ctx.lineTo(sockX - 4, cabY + 20); ctx.stroke(); ctx.restore();
    K.drawLabel(ctx, (plugX + sockX) / 2, cabY - 92, p, { text: P.gap || 'AIR GAP', size: 28, accent: true });
  }

  // ---- labels (top of the stage)
  const lab = (text, a, b, o = {}) => {
    if (t < a || t > b + 0.35) return;
    ctx.save(); ctx.globalAlpha = K.fadeOut(t, b, 0.35);
    K.drawLabel(ctx, o.x || 487, o.y || 640, K.popIn(t, a, 0.4), { text, size: o.size || 30, dot: !o.accent, accent: o.accent });
    ctx.restore();
  };
  lab(P.box || 'TEST SANDBOX', 0.2, tB + 0.4, { x: (bx0 + bx1) / 2, y: by0 + 56, size: 24 });
  if (beat2) lab(P.boxLater || P.box || 'TEST SANDBOX', tBox, D + 1, { x: (bx0 + bx1) / 2, y: by0 + 56, size: 24, accent: true });
  lab(P.outside || 'Outside systems', 0.4, P.quote ? tQuote - 0.1 : tB - 0.2, { x: 795, y: 770, size: 24 });
  lab(P.disclosed || 'Disclosed incidents', tDisc, tSlip - 0.1, { y: 615 });
  lab(P.slip || 'Slipped out', tSlip, tBreach - 0.1, { y: 615 });
  lab(P.breach || 'Broke into outside systems', tBreach, P.quote ? tQuote - 0.1 : tB - 0.3, { y: 615, accent: true });
  lab(P.ask || 'FIRST ASK', tAsk, tLock - 0.1, { y: 615, accent: true });
  lab(P.lock || 'Lock it down', tLock + 0.2, tOff - 0.1, { y: 615 });
  lab(P.offline || 'No internet', tOff, D + 1, { y: 615, accent: true });

  // quote panel (verbatim) at the top of the stage
  if (P.quote && t >= tQuote && t < tB + 0.3) {
    const k = easeOutCubic(clamp((t - tQuote) / 0.45)), out = K.fadeOut(t, tB - 0.15, 0.4);
    ctx.save(); ctx.globalAlpha = k * out; ctx.translate(0, (1 - k) * -30);
    const x0 = 80, w = 830, y0 = 490;
    ctx.font = K.font.bold(36);
    const lines = H.wrap(ctx, '“' + P.quote + '”', 'bold', 36, w - 70);
    const h = 60 + lines.length * 46 + 40;
    H.roundRect(ctx, x0, y0, w, h, 22); ctx.fillStyle = 'rgba(14,17,33,0.94)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = K.font.bold(36);
    lines.forEach((ln, i) => ctx.fillText(ln, x0 + 35, y0 + 62 + i * 46));
    ctx.fillStyle = ACC; ctx.font = K.font.ui(26); ctx.fillText(P.quoteBy || '', x0 + 35, y0 + 62 + lines.length * 46 + 10);
    ctx.restore();
  }
  ctx.restore();
}
