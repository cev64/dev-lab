// Scene "emergency-brake" (full frame; 1-2 beats). Control room: an AI agent robot rides a cart along a rail, busy
// with a task (progress bar). A glass containment box slams down around its stretch of track; then a big red brake
// lever lights up next to a human operator, who pulls it: sparks, the cart stops dead, the task freezes mid-way,
// the robot powers down and a stamp lands. mode "payoff": the same room, settled - robot rolling slowly inside its
// box, operator's hand by the lever, a quote pill and a closing question.
// Fits: "kill switch", "pause the AI", "sandbox / contain the model", "human in control", "stop button".
// params (all optional): mode        "story" (default) | "payoff"
//                        compLabel   first pill (default "Assume it can go wrong"); compCue word (default 20 %)
//                        cageLabel   pill when the box drops (default "Contain it from the start")
//                        pauseLabel  pill after the pull (default "Pause or shut down")
//                        lever       pill over the lever (default "EMERGENCY BRAKE")
//                        stamp       stamp text (default "STOPPED")
//                        cageCue     word: the box slams down (default 35 %)
//                        brakeCue    word: the lever lights up (default 50 %)
//                        pullCue     word: the operator pulls (default 80 %); stopCue word: power-down (default pull + 0.7 s)
//                        payoff: quote (default "Humans keep the brake"; pass a real quote only verbatim and
//                                attributed), quoteCue (default 40 %), question (default "A BRAKE ON EVERY AI?"), qCue (70 %)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent, N = K.NEUTRAL;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const payoff = P.mode === 'payoff';

  const tComp = payoff ? -99 : at(P.compCue, D * 0.2);
  const tCage = payoff ? -99 : at(P.cageCue, D * 0.35) - 0.2;
  const tBrake = payoff ? -99 : at(P.brakeCue, D * 0.5) - 0.2;
  const tPull = payoff ? 1e9 : at(P.pullCue, D * 0.8) - 0.15;
  const tStop = payoff ? 1e9 : at(P.stopCue, tPull + 0.7);
  const tQuote = payoff ? at(P.quoteCue, D * 0.4) - 0.2 : 1e9;
  const tQ = payoff ? at(P.qCue, D * 0.7) - 0.1 : 1e9;

  ctx.save();
  if (payoff) K.camera(ctx, t, [{ t: 0, zoom: 1.1, x: 540, y: 790 }, { t: D, zoom: 1.03, x: 510, y: 770 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 760 }, { t: tCage + 0.6, zoom: 1.04, x: 540, y: 780 }, { t: tBrake, zoom: 1.04, x: 500, y: 780 }, { t: tPull - 0.2, zoom: 1.08, x: 500, y: 800 }, { t: D, zoom: 1.05, x: 500, y: 790 }]);
  K.cameraShake(ctx, t, tCage + 0.45, 0.4, 10);
  K.cameraShake(ctx, t, tPull + 0.15, 0.45, 12);

  K.world.serverHall(ctx, { t, activity: t >= tStop ? 0.25 : 0.7 });
  const railY = 1000, feet = 1035;
  // rails + ties
  ctx.fillStyle = '#2a2f45'; for (let x = 20; x < 1080; x += 70) { H.roundRect(ctx, x, railY - 6, 40, 22, 5); ctx.fill(); }
  ctx.fillStyle = '#8a93a8'; ctx.fillRect(0, railY - 14, 1080, 8); ctx.fillRect(0, railY + 2, 1080, 6);

  // box geometry
  const bx0 = 525, bx1 = 905, byTop = 630;
  // cart motion: shuttles inside the box; brakes hard at tPull
  const speed = payoff ? 0.5 : 1.0;
  const motionT = t < tPull ? t : tPull + 0.35 * (1 - Math.exp(-(t - tPull) * 8));
  const s = Math.sin(motionT * speed * 1.1);
  const cartX = lerp(bx0 + 110, bx1 - 110, 0.5 + 0.5 * s);

  // cage behind? draw back of box first (faint), then cart, then glass front
  const dk = clamp((t - tCage) / 0.45), drop = payoff ? 1 : dk * dk;
  const boxY = lerp(-500, 0, drop);

  // cart + robot
  const off = t >= tStop;
  const robotT = off ? tStop : t;
  cart(ctx, H, cartX, railY, t, off || t >= tPull + 0.35 ? 0 : 1);
  ctx.save();
  if (t >= tPull && t < tPull + 0.35) ctx.translate(Math.sin((t - tPull) * 50) * 6, 0);
  const tilt = t >= tPull && t < tPull + 0.6 ? Math.sin(clamp((t - tPull) / 0.6) * Math.PI) * 0.08 : 0;
  ctx.translate(cartX, railY - 50); ctx.rotate(tilt); ctx.translate(-cartX, -(railY - 50));
  K.drawRobot(ctx, cartX, railY - 50, 1.25, { t: robotT, state: off ? 'idle' : (t >= tPull ? 'thinking' : 'working'), seed: 3 });
  if (off) { // visor goes dark
    const hov = Math.sin(robotT * 2.1 + 3) * 3 * 0.4, sc = 1.25, k = K.phase(t, tStop, tStop + 0.5);
    ctx.save(); ctx.globalAlpha = 0.9 * k; H.roundRect(ctx, cartX - 42 * sc, railY - 50 + (-196 + hov) * sc, 84 * sc, 48 * sc, 18 * sc); ctx.fillStyle = N.screen; ctx.fill(); ctx.restore();
  }
  ctx.restore();
  // sparks at the wheels on braking
  if (t >= tPull && t < tPull + 0.8) {
    const k = (t - tPull) / 0.8;
    for (let i = 0; i < 9; i++) {
      const a = Math.PI + 0.3 + i * 0.25, r = 30 + 110 * k * (0.6 + (i % 3) * 0.2);
      ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = i % 2 ? ACC : '#ffb347'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      const sx = cartX - 60, sy = railY - 10;
      ctx.beginPath(); ctx.moveTo(sx + Math.cos(a) * r * 0.6, sy + Math.sin(a) * r * 0.4); ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r * 0.65); ctx.stroke(); ctx.restore();
    }
  }
  // task progress bar over the robot
  const prog = clamp(0.12 + Math.min(t, tPull) * 0.03, 0, 0.62);
  const bw = 200, bxp = cartX - bw / 2, byp = byTop - 30;
  if (!payoff) {
  H.roundRect(ctx, bxp - 12, byp - 44, bw + 24, 72, 16); ctx.fillStyle = 'rgba(10,12,22,0.86)'; ctx.fill();
  ctx.font = K.font.ui(24); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(t >= tPull ? 'PAUSED' : 'TASK', bxp, byp - 20);
  ctx.textAlign = 'right'; ctx.fillStyle = t >= tPull ? N.danger : ACC; ctx.fillText(Math.round(prog * 100) + '%', bxp + bw, byp - 20);
  H.roundRect(ctx, bxp, byp + 2, bw, 12, 6); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill();
  H.roundRect(ctx, bxp, byp + 2, Math.max(12, bw * prog), 12, 6); ctx.fillStyle = t >= tPull ? N.danger : ACC; ctx.fill();
  }

  // glass containment box (front)
  if (drop > 0) {
    ctx.save(); ctx.translate(0, boxY);
    H.roundRect(ctx, bx0, byTop, bx1 - bx0, railY + 24 - byTop, 18);
    ctx.fillStyle = 'rgba(140,200,255,0.10)'; ctx.fill();
    ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(170,220,255,0.75)'; ctx.stroke();
    ctx.globalAlpha = 0.35; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(bx0 + 30, byTop + 40); ctx.lineTo(bx0 + 90, byTop + 20); ctx.stroke();
    ctx.globalAlpha = 1;
    for (const [cx, cy] of [[bx0, byTop], [bx1, byTop], [bx0, railY + 24], [bx1, railY + 24]]) { ctx.fillStyle = '#c9d4ff'; ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
    if (!payoff && t > tCage + 0.45 && t < tCage + 1.2) { // dust on impact
      const k = (t - tCage - 0.45) / 0.75; ctx.save(); ctx.globalAlpha = 0.5 * (1 - k); ctx.fillStyle = '#c9cfdf';
      for (let i = 0; i < 6; i++) { const sx = i < 3 ? bx0 - 20 - k * 60 - (i % 3) * 25 : bx1 + 20 + k * 60 + (i % 3) * 25; ctx.beginPath(); ctx.arc(sx, railY + 10 - (i % 3) * 22, 14 + 12 * k, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
  }

  // emergency brake lever (left) + operator
  const lx = 400;
  const lit = payoff ? 1 : K.phase(t, tBrake, tBrake + 0.4);
  let ang = -0.55; // lever angle (up/back)
  if (t > tPull - 0.35 && t < tPull) ang = lerp(-0.55, -0.75, smooth((t - tPull + 0.35) / 0.3)); // wind-up
  if (t >= tPull) ang = lerp(-0.75, 0.75, H.easeOutBack(clamp((t - tPull) / 0.3)));
  lever(ctx, H, K, lx, feet, ang, lit, t, ACC);
  const pulled = t >= tPull;
  K.drawPerson(ctx, 205, feet, 1.4, { t, pose: pulled ? 'point' : (t >= tBrake || payoff ? 'point' : 'stand'), mood: pulled ? 'neutral' : (payoff ? 'happy' : 'neutral'), look: 1, skin: 3, hair: 4, shirt: 3, hairStyle: 'bun', seed: 9 });
  if (lit > 0 && !payoff) {
    const p = K.popIn(t, tBrake + 0.1, 0.4);
    K.drawLabel(ctx, lx - 40, 690, p, { text: P.lever || 'EMERGENCY BRAKE', size: 28, accent: true });
  }

  // labels
  const lab = (text, a, b, accent) => {
    if (t < a || t > b + 0.4) return;
    const p = K.popIn(t, a, 0.4), out = 1 - smooth((t - b) / 0.4);
    ctx.save(); ctx.globalAlpha = clamp(out); K.drawLabel(ctx, payoff ? 487 : 360, payoff ? 595 : 546, p, { text, size: 28, dot: !accent, accent }); ctx.restore();
  };
  if (!payoff) {
    lab(P.compLabel || 'Assume it can go wrong', tComp, tCage + 0.4);
    lab(P.cageLabel || 'Contain it from the start', tCage + 0.5, tBrake - 0.1);
    lab(P.pauseLabel || 'Pause or shut down', tPull + 0.1, D + 1);
    if (t >= tStop) K.drawStamp(ctx, cartX, 940, 0.62, { kind: 'cross', text: P.stamp || 'STOPPED', land: clamp((t - tStop) / 0.55) });
  } else {
    lab(P.quote || 'Humans keep the brake', tQuote, tQ - 0.1);
    if (t >= tQ) K.drawLabel(ctx, 487, 595, K.popIn(t, tQ, 0.45), { text: P.question || 'A BRAKE ON EVERY AI?', size: 38, accent: true });
  }
  ctx.restore();
}

function cart(ctx, H, x, railY, t, moving) {
  H.roundRect(ctx, x - 95, railY - 62, 190, 46, 14); ctx.fillStyle = '#3b4260'; ctx.fill();
  H.roundRect(ctx, x - 95, railY - 62, 190, 12, 6); ctx.fillStyle = '#4b5378'; ctx.fill();
  for (const dx of [-60, 60]) {
    ctx.save(); ctx.translate(x + dx, railY - 14); ctx.rotate(t * 6 * moving);
    ctx.fillStyle = '#161927'; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#8a93a8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.moveTo(0, -12); ctx.lineTo(0, 12); ctx.stroke();
    ctx.restore();
  }
}
function lever(ctx, H, K, x, feet, ang, lit, t, acc) {
  K.shadow(ctx, x, feet, 170);
  // striped base
  H.roundRect(ctx, x - 75, feet - 90, 150, 90, 14); ctx.fillStyle = '#2a2f45'; ctx.fill();
  ctx.save(); H.roundRect(ctx, x - 70, feet - 84, 140, 32, 8); ctx.clip();
  for (let i = -4; i < 10; i++) { ctx.fillStyle = i % 2 ? '#ffcc33' : '#161927'; ctx.beginPath(); ctx.moveTo(x - 70 + i * 22, feet - 84); ctx.lineTo(x - 50 + i * 22, feet - 84); ctx.lineTo(x - 70 + i * 22, feet - 52); ctx.lineTo(x - 90 + i * 22, feet - 52); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  // slot
  H.roundRect(ctx, x - 50, feet - 104, 100, 16, 8); ctx.fillStyle = '#0b0d17'; ctx.fill();
  // arm
  ctx.save(); ctx.translate(x, feet - 96); ctx.rotate(ang);
  H.roundRect(ctx, -9, -200, 18, 200, 9); ctx.fillStyle = '#b9c1d6'; ctx.fill();
  const r = 40;
  if (lit > 0) K.glow(ctx, 0, -210, 120, '#ff4d3d', 0.35 * lit * (0.7 + 0.3 * Math.sin(t * 7)));
  ctx.fillStyle = '#e8453c'; ctx.beginPath(); ctx.arc(0, -210, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff8a80'; ctx.beginPath(); ctx.arc(-12, -222, 12, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // hub
  ctx.fillStyle = '#8a93a8'; ctx.beginPath(); ctx.arc(x, feet - 96, 16, 0, Math.PI * 2); ctx.fill();
}
