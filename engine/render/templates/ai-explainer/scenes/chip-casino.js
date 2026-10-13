// Scene "chip-casino" (full frame). A dim casino room: a green felt table where the betting chips are literal computer
// chips (dark squares with gold pins and a glowing die), a kit robot as the dealer, a spinning wheel, generic
// cartoon investors at both ends, a neon sign above.
// modes: "hook"   investors slide chip stacks onto the table at betCue, the wheel spins and the neon flares at spinCue.
//        "payoff" the table is busy, at jumpCue the investors jump back (shocked) and the stacks wobble; at qCue the
//                 big question lands over the table and the room settles.
// params: mode, sign (neon text, default "AI TABLE"), question (default "CASINO OR GOLD RUSH?"),
//         cues: betCue (20 %), spinCue (55 %), jumpCue (35 %), qCue (60 %)
// Fits: AI-bubble / speculation / "it's a gamble" money stories. No logos, no real people.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent, mode = P.mode || 'hook';
  const cue = (w, fb) => { const v = w != null ? info.timeOf(w) : null; return v != null ? v : fb; };
  const betAt = cue(P.betCue, D * 0.2), spinAt = cue(P.spinCue, D * 0.55);
  const jumpAt = cue(P.jumpCue, D * 0.35), qAt = cue(P.qCue, D * 0.6);
  const payoff = mode === 'payoff';

  ctx.save();
  if (payoff) K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 760 }, { t: qAt, zoom: 1.04, x: 487, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 740 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.12, x: 487, y: 860 }, { t: D, zoom: 1.0, x: 487, y: 780 }]);
  if (payoff) K.cameraShake(ctx, t, jumpAt, 0.45, 9);

  // room: dark wall with velvet panels, warm floor
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#120c22'); g.addColorStop(0.45, '#22163a'); g.addColorStop(1, '#0a0714');
  ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, 2320);
  for (let i = 0; i < 8; i++) { H.roundRect(ctx, -60 + i * 160, 260, 130, 640, 16); ctx.fillStyle = i % 2 ? '#2a1a44' : '#2f1d4c'; ctx.fill(); }
  ctx.fillStyle = '#3a2052'; ctx.fillRect(-200, 880, 1480, 14);
  ctx.fillStyle = '#190f27'; ctx.fillRect(-200, 894, 1480, 1200);
  // carpet pattern
  ctx.fillStyle = 'rgba(255,255,255,0.035)';
  for (let r = 0; r < 6; r++) for (let c = 0; c < 9; c++) { ctx.beginPath(); ctx.arc(c * 130 + (r % 2) * 65, 940 + r * 70, 14, 0, Math.PI * 2); ctx.fill(); }

  // neon sign (flares at spinCue in hook mode, steady in payoff)
  const flare = payoff ? 1 : K.phase(t, spinAt - 0.15, spinAt + 0.25);
  const flick = payoff ? 1 : (t < spinAt ? 0.35 + 0.1 * Math.sin(t * 17) : 1);
  const signTxt = String(P.sign || 'AI TABLE');
  ctx.save();
  ctx.font = K.font.display(64); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const sw = ctx.measureText(signTxt).width + 90;
  H.roundRect(ctx, 487 - sw / 2, 440, sw, 110, 26); ctx.fillStyle = '#0c0818'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = H.rgba(ACC, 0.35 + 0.65 * flick); ctx.stroke();
  K.glow(ctx, 487, 495, 300, ACC, 0.18 * flick + 0.2 * flare);
  ctx.fillStyle = H.rgba(ACC, 0.4 + 0.6 * flick); ctx.fillText(signTxt, 487, 497);
  ctx.restore();

  // pendant lamp over the table
  const sway = Math.sin(t * 1.1) * 0.04;
  ctx.save(); ctx.translate(487, 560); ctx.rotate(sway);
  ctx.strokeStyle = '#3b3352'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 70); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-90, 120); ctx.lineTo(-40, 70); ctx.lineTo(40, 70); ctx.lineTo(90, 120); ctx.closePath(); ctx.fillStyle = '#2d6b4f'; ctx.fill();
  ctx.restore();
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const cg = ctx.createLinearGradient(0, 680, 0, 900); cg.addColorStop(0, 'rgba(255,236,190,0.16)'); cg.addColorStop(1, 'rgba(255,236,190,0.02)');
  ctx.beginPath(); ctx.moveTo(397, 680); ctx.lineTo(577, 680); ctx.lineTo(850, 900); ctx.lineTo(124, 900); ctx.closePath(); ctx.fillStyle = cg; ctx.fill();
  ctx.restore();

  // dealer robot behind the table
  const dealerState = payoff ? (t > jumpAt ? 'thinking' : 'working') : (t > spinAt ? 'happy' : 'working');
  K.drawRobot(ctx, 487, 860, 1.05, { t, state: dealerState, talk: 0, seed: 5 });

  // the table (front view ellipse)
  const TX = 487, TY = 900, RX = 400, RY = 105;
  ctx.save();
  K.shadow(ctx, TX, TY + 150, 760, 0.45);
  ctx.fillStyle = '#5a3524'; ctx.fillRect(TX - RX + 30, TY, 2 * RX - 60, 120);
  ctx.beginPath(); ctx.ellipse(TX, TY + 120, RX - 30, RY * 0.5, 0, 0, Math.PI); ctx.fill();
  ctx.beginPath(); ctx.ellipse(TX, TY + 6, RX + 14, RY + 14, 0, 0, Math.PI * 2); ctx.fillStyle = '#7a4a30'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(TX, TY, RX, RY, 0, 0, Math.PI * 2); ctx.fillStyle = '#1d6a4b'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(TX, TY, RX - 40, RY - 26, 0, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 3; ctx.stroke();
  // betting boxes on the felt
  for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(TX - 150 + i * 150, TY + 18); ctx.scale(1, 0.4); H.roundRect(ctx, -55, -55, 110, 110, 10); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 5; ctx.stroke(); ctx.restore(); }
  ctx.restore();

  // the wheel (top view squashed), left side of the table
  const spinV = payoff ? 2.2 : (t < spinAt ? 0.4 : 0.4 + 9 * Math.min(1, (t - spinAt) / 0.5));
  const ang = payoff ? t * spinV * (t > qAt ? Math.max(0.15, 1 - (t - qAt) / 3) : 1) : (t < spinAt ? t * 0.4 : spinAt * 0.4 + (t - spinAt) * spinV);
  ctx.save(); ctx.translate(TX - 250, TY - 20); ctx.scale(1, 0.42);
  ctx.beginPath(); ctx.arc(0, 0, 92, 0, Math.PI * 2); ctx.fillStyle = '#4a2c1e'; ctx.fill();
  for (let i = 0; i < 16; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 78, ang + i * Math.PI / 8, ang + (i + 1) * Math.PI / 8); ctx.closePath(); ctx.fillStyle = i % 2 ? '#1c1a2a' : (i % 4 === 0 ? ACC : '#c44a4a'); ctx.fill(); }
  ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fillStyle = '#d7b25a'; ctx.fill();
  ctx.restore();

  // chip stacks on the felt: [x, y, n, arrive delay]
  const stacks = [[TX - 70, TY + 30, 5, 0], [TX + 60, TY + 40, 7, 0.15], [TX + 190, TY + 20, 4, 0.3], [TX + 10, TY - 40, 3, 0.45]];
  stacks.forEach(([sx, sy, n, dl], i) => {
    let slide = 1, wob = 0;
    if (!payoff) slide = K.phase(t, betAt + dl - 0.3, betAt + dl + 0.35, H.easeOutCubic);
    else wob = t > jumpAt ? Math.sin((t - jumpAt) * 14 + i) * 6 * Math.exp(-(t - jumpAt) * 2.2) : 0;
    const from = i % 2 ? 420 : -420;
    const x = lerp(sx + from, sx, slide);
    if (!payoff && slide <= 0) return;
    for (let k = 0; k < n; k++) chipSlab(ctx, H, ACC, x + wob * (k / n), sy - k * 15, 1, k === n - 1, t + i);
  });

  // investors at both ends of the table
  const jump = payoff ? K.phase(t, jumpAt, jumpAt + 0.35) : 0;
  const lean = payoff ? 0 : K.phase(t, betAt - 0.4, betAt + 0.3);
  const people = [
    { x: 170, flip: false, skin: 1, hair: 0, shirt: 0, hs: 'short' },
    { x: 805, flip: true, skin: 3, hair: 4, shirt: 2, hs: 'bun' },
  ];
  people.forEach((p, i) => {
    const dx = payoff ? (p.flip ? 22 : -22) * jump : (p.flip ? -18 : 18) * lean;
    const hop = payoff && t > jumpAt ? -Math.max(0, Math.sin(clamp((t - jumpAt) / 0.4) * Math.PI)) * 40 : 0;
    const pose = payoff ? (t > jumpAt ? (t > qAt ? 'shrug' : 'stand') : 'point') : (t > spinAt ? 'cheer' : 'point');
    const mood = payoff ? (t > jumpAt ? (t > qAt ? 'worried' : 'shocked') : 'happy') : 'happy';
    K.drawPerson(ctx, p.x + dx, 1045 + hop, 1.45, { t, pose, mood, flip: p.flip, skin: p.skin, hair: p.hair, shirt: p.shirt, hairStyle: p.hs, seed: i * 3 + 1 });
  });
  ctx.restore(); // camera

  // payoff question card (screen space, stage band)
  if (payoff) {
    const qp = K.popIn(t, qAt, 0.5);
    if (qp > 0) {
      ctx.save(); ctx.translate(487, 680); ctx.scale(qp, qp);
      const q = String(P.question || 'CASINO OR GOLD RUSH?');
      const ft = H.fitText(ctx, q, 'display', 66, 36, 760);
      H.roundRect(ctx, -405, -80, 810, 130, 28); ctx.fillStyle = 'rgba(8,6,16,0.88)'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = H.rgba(ACC, 0.8); ctx.stroke();
      ctx.font = ft.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ACC; ctx.fillText(q, 0, -14);
      ctx.restore();
    }
  }
}

// one computer chip as a casino chip seen from the side: dark slab with gold pins; the top one shows its die
function chipSlab(ctx, H, ACC, x, y, s, top, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // pins
  ctx.fillStyle = '#d9b64a';
  for (let i = 0; i < 6; i++) ctx.fillRect(-36 + i * 13, 2, 5, 6);
  H.roundRect(ctx, -44, -12, 88, 15, 5); ctx.fillStyle = '#1b1f33'; ctx.fill();
  ctx.fillStyle = '#2c3352'; ctx.fillRect(-40, -12, 80, 4);
  if (top) {
    ctx.save(); ctx.scale(1, 0.38);
    H.roundRect(ctx, -44, -80, 88, 80, 8); ctx.fillStyle = '#262c46'; ctx.fill();
    ctx.fillStyle = '#d9b64a';
    for (let i = 0; i < 5; i++) { ctx.fillRect(-34 + i * 16, -86, 6, 8); ctx.fillRect(-34 + i * 16, -2, 6, 8); }
    H.roundRect(ctx, -18, -58, 36, 36, 5); ctx.fillStyle = ACC; ctx.globalAlpha = 0.75 + 0.25 * Math.sin(t * 3); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
}
