// Scene "control-room" (full frame, 1 beat, ~12-16 s). A home-security monitoring room at night: a wall of six
// screens showing generic cartoon houses (doors, windows, a blinking camera dot) that switch on one by one on homesCue (no label: the docked header sits above);
// a cartoon operator with a headset sits at the desk. On botCue the kit robot rolls in from the right and takes the
// seat beside the operator, who turns and nods; a "together" pill pops. On quoteCue the screens dim and a verbatim
// quote panel (speaker named as text only, never drawn) with a padlock lands over them. Ends settled.
// Fits: "AI is coming to home security / alarm monitoring", "engineers will work alongside the company's staff", any
// "a robot joins the control room" beat; privacy quote payoffs.
// params: together ("Engineers + staff"), quote, by, cues: homesCue (15%), botCue (45%),
//         quoteCue (72%)
// Cues are narration words ("word#n" = the (n+1)th time spoken in the scene) or seconds; else the fractions above.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const TAU = Math.PI * 2;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const tHomes = at(P.homesCue, D * 0.15), tBot = at(P.botCue, D * 0.45), tQuote = at(P.quoteCue, D * 0.72);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  K.world.room(ctx, { t, time: 'night', floorY: 1000, lamp: false, window: false, picture: false, plant: true });
  const rr = (x, y, w, h, r, c) => { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); };

  // ---- screen wall ----
  const SW = 236, SH = 140, GX = 22, GY = 20, X0 = 487 - (3 * SW + 2 * GX) / 2, Y0 = 470;
  rr(X0 - 24, Y0 - 24, 3 * SW + 2 * GX + 48, 2 * SH + GY + 48, 18, '#151829');
  const dim = K.phase(t, tQuote - 0.3, tQuote + 0.4);
  for (let i = 0; i < 6; i++) {
    const c = i % 3, r = Math.floor(i / 3), x = X0 + c * (SW + GX), y = Y0 + r * (SH + GY);
    const on = K.phase(t, tHomes - 0.3 + i * 0.25, tHomes - 0.05 + i * 0.25);
    rr(x, y, SW, SH, 10, '#0a0c16');
    if (on > 0) {
      ctx.save(); roundRect(ctx, x, y, SW, SH, 10); ctx.clip(); ctx.globalAlpha = on * (1 - 0.65 * dim);
      const nightFeed = i % 2 === 1;
      const sky = ctx.createLinearGradient(0, y, 0, y + SH); sky.addColorStop(0, nightFeed ? '#1a2a4a' : '#3a5a8a'); sky.addColorStop(1, nightFeed ? '#2c3d5c' : '#7aa0c8');
      ctx.fillStyle = sky; ctx.fillRect(x, y, SW, SH);
      ctx.fillStyle = nightFeed ? '#21402f' : '#4f8a5c'; ctx.fillRect(x, y + SH - 26, SW, 26);
      // a generic house, varied per feed
      const hx = x + SW / 2 + (H.hash(i, 2) - 0.5) * 50, hy = y + SH - 22, body = ['#d9c7a6', '#c9d4e6', '#e6c9b8'][i % 3];
      rr(hx - 52, hy - 50, 104, 50, 3, body);
      ctx.beginPath(); ctx.moveTo(hx - 62, hy - 48); ctx.lineTo(hx, hy - 84); ctx.lineTo(hx + 62, hy - 48); ctx.closePath(); ctx.fillStyle = ['#6b4a3f', '#4a5a7a', '#7a4a4a'][i % 3]; ctx.fill();
      rr(hx + 12, hy - 34, 18, 34, 2, '#7a5a3c');
      rr(hx - 38, hy - 38, 22, 18, 2, nightFeed ? '#ffd98a' : '#cfe3ff');
      // camera overlay: REC dot + corner brackets + scan line
      ctx.fillStyle = Math.sin(t * 4 + i) > 0 ? '#ff5a4e' : '#5a2a2a'; ctx.beginPath(); ctx.arc(x + 16, y + 16, 6, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 2;
      for (const [cx, cy, dx, dy] of [[x + 8, y + 8, 1, 1], [x + SW - 8, y + 8, -1, 1], [x + 8, y + SH - 8, 1, -1], [x + SW - 8, y + SH - 8, -1, -1]]) {
        ctx.beginPath(); ctx.moveTo(cx, cy + dy * 14); ctx.lineTo(cx, cy); ctx.lineTo(cx + dx * 14, cy); ctx.stroke();
      }
      const sl = y + ((t * 40 + i * 30) % SH); ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(x, sl, SW, 4);
      ctx.restore();
    }
  }
  const hp = K.popIn(t, tHomes - 0.2, 0.4);
  void hp; // (screens label dropped: the docked header sits right above the wall)

  // ---- desk with operator + robot ----
  const DY = 1000;
  // chairs drawn by drawPerson(sit) seat; desk in front afterwards
  const botIn = K.phase(t, tBot - 0.6, tBot + 0.6, H.easeOutCubic);
  const turned = t > tBot + 0.4;
  K.drawPerson(ctx, 330, DY + 10, 1.35, { t, pose: turned ? 'sit' : 'sit-laptop', typing: turned ? 0 : 1, mood: turned ? 'happy' : 'neutral', look: turned ? 0.8 : 0.2, skin: 4, hair: 3, hairStyle: 'short', shirt: 1, seed: 6 });
  // headset on the operator
  ctx.save(); ctx.strokeStyle = '#22263a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(330, DY + 10 + (-78 - 64 - 44) * 1.35 - 4, 34, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.restore();
  if (botIn > 0) {
    const rx = lerp(1180, 640, botIn);
    K.drawRobot(ctx, rx, DY + 10, 1.2, { t, state: botIn < 1 ? 'idle' : (t > tQuote ? 'thinking' : 'working'), seed: 7 });
  }
  // desk
  rr(150, DY - 70, 700, 24, 8, '#5a4a6a');
  rr(170, DY - 48, 660, 50, 6, '#463a56');
  K.drawLaptop(ctx, 330, DY - 68, 0.6, { t, screen: 'chart', typing: turned ? 0 : 1 });
  K.drawLaptop(ctx, 640, DY - 68, 0.6, { t, screen: botIn >= 1 ? 'code' : 'blank', typing: botIn >= 1 ? 1 : 0 });
  K.props.mug(ctx, 480, DY - 68, 0.8, t);
  const tp = K.popIn(t, tBot + 0.5, 0.4);
  if (tp > 0) K.drawLabel(ctx, 487, 1040, tp, { text: P.together || 'Engineers + staff', size: 28, accent: true });

  // ---- quote panel ----
  const qp = K.popIn(t, tQuote - 0.1, 0.45);
  if (qp > 0 && P.quote !== '') {
    const QX0 = 110, QX1 = 870, QY0 = 455;
    const quote = String(P.quote || 'Quote goes here.');
    const qSize = 38, lines = H.wrap(ctx, '“' + quote + '”', 'display', qSize, QX1 - QX0 - 170);
    const QH = 40 + lines.length * qSize * 1.2 + 60;
    ctx.save(); ctx.translate((QX0 + QX1) / 2, QY0 + QH / 2); const s = Math.min(1.03, 0.75 + 0.25 * qp); ctx.scale(s, s); ctx.globalAlpha = clamp(qp * 2); ctx.translate(-(QX0 + QX1) / 2, -(QY0 + QH / 2));
    roundRect(ctx, QX0, QY0, QX1 - QX0, QH, 26); ctx.fillStyle = 'rgba(12,14,26,0.95)'; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = rgba(ACC, 0.75); ctx.stroke();
    K.drawLock(ctx, QX0 + 75, QY0 + QH / 2 + 50, 0.85, { open: 0 });
    ctx.font = H.font('display', qSize); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    lines.forEach((ln, i) => ctx.fillText(ln, QX0 + 145, QY0 + 30 + qSize + i * qSize * 1.2));
    ctx.font = H.font('ui', 26); ctx.fillStyle = ACC;
    ctx.fillText('— ' + String(P.by || 'Speaker'), QX0 + 145, QY0 + QH - 28);
    ctx.restore();
  }
  ctx.restore();
}
