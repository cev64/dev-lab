// Scene "laptop-closed" (full frame). A room with a big sky window: a little cloud with helper bots working inside
// appears; a wall clock races and the sky cycles day -> night -> day; the worker closes the laptop and walks out; the
// bots keep working; the worker walks back in to a finished stack of documents and a DONE stamp.
// Fits: "AI keeps working in the background / overnight / for hours or days while you're away", long-running tasks.
// params (all optional): cloud     label on the cloud (default "In the cloud")
//                        words     [[cueWord, label], ...] accent pills by the clock, e.g. [["hours","Hours"],["days","Days"]]
//                        cloudCue / spinCue / closeCue / backCue  narration words for cloud / clock racing / laptop
//                                  closing / worker back (else 12% / first `words` cue or 35% / 60% / 82%)
//                        done      stamp text (default "DONE")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, smooth, lerp, easeOutCubic, mixHex } = H;
  const D = info.duration, ACC = info.accent;
  const tw = (w, f) => { const v = w ? info.timeOf(w) : null; return v != null ? v : D * f; };
  const words = (P.words || []).map(([w, l]) => [tw(w, 0.4), l]);
  const tCloud = tw(P.cloudCue, 0.12);
  const tSpin = P.spinCue ? tw(P.spinCue, 0.35) : words.length ? words[0][0] : D * 0.35;
  const tClose = tw(P.closeCue, 0.6);
  const tBack = Math.max(tClose + 1.6, tw(P.backCue, 0.82));
  const tDone = Math.min(D - 0.5, tBack + 0.5);

  const z = lerp(1.0, 1.05, H.phase(t, 0, D));
  ctx.save(); ctx.translate(487, 725); ctx.scale(z, z); ctx.translate(-500, -740);

  // time of day: clock races from tSpin, two full day/night cycles until tBack
  const cyc = K.phase(t, tSpin, tBack, (x) => x) * 2;          // 0..2 cycles
  const night = (1 - Math.cos(cyc * Math.PI * 2)) / 2;           // 0 day .. 1 night
  const wallDay = '#36406e', wallNight = '#1d2242';
  K.world.room(ctx, { t, time: 'day', window: false, picture: false, plant: true, lamp: true,
    wall: mixHex(wallDay, wallNight, night), floor: mixHex('#2a3058', '#15182f', night) });

  // big sky window
  const W = { x: 470, y: 420, w: 450, h: 340 };
  ctx.save();
  H.roundRect(ctx, W.x - 14, W.y - 14, W.w + 28, W.h + 28, 14); ctx.fillStyle = '#d6dbea'; ctx.fill();
  H.roundRect(ctx, W.x, W.y, W.w, W.h, 6); ctx.clip();
  const g = ctx.createLinearGradient(0, W.y, 0, W.y + W.h);
  g.addColorStop(0, mixHex('#6fa6e8', '#0d1230', night)); g.addColorStop(1, mixHex('#bfe0ff', '#232a5a', night));
  ctx.fillStyle = g; ctx.fillRect(W.x, W.y, W.w, W.h);
  // stars at night
  for (let i = 0; i < 26; i++) { ctx.globalAlpha = night * (0.4 + 0.6 * H.hash(i, 2)); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(W.x + W.w * H.hash(i, 3), W.y + W.h * 0.7 * H.hash(i, 4), 2.2, 0, Math.PI * 2); ctx.fill(); }
  ctx.globalAlpha = 1;
  // sun / moon travel across the window each half cycle
  const half = (cyc * 2) % 2, k = half % 1, isMoon = half >= 1;
  const bx = lerp(W.x - 40, W.x + W.w + 40, k), by = W.y + W.h * 0.75 - Math.sin(k * Math.PI) * W.h * 0.55;
  if (!isMoon) { K.glow(ctx, bx, by, 90, '#ffd36a', 0.6); ctx.fillStyle = '#ffd36a'; ctx.beginPath(); ctx.arc(bx, by, 34, 0, Math.PI * 2); ctx.fill(); }
  else { ctx.fillStyle = '#f2f4ff'; ctx.beginPath(); ctx.arc(bx, by, 28, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = mixHex('#6fa6e8', '#0d1230', night); ctx.beginPath(); ctx.arc(bx + 12, by - 8, 24, 0, Math.PI * 2); ctx.fill(); }
  // distant city
  for (let i = 0; i < 9; i++) { const bw = 40 + 30 * H.hash(i, 8), bh = 50 + 90 * H.hash(i, 9); ctx.fillStyle = mixHex('#5d78a8', '#151a38', night); ctx.fillRect(W.x + i * 52 - 10, W.y + W.h - bh, bw, bh);
    if (night > 0.4) for (let r = 0; r < 3; r++) { if (H.hash(i, r + 20) > 0.5) { ctx.fillStyle = H.rgba('#ffd98a', night); ctx.fillRect(W.x + i * 52 + 2, W.y + W.h - bh + 12 + r * 24, 8, 10); } } }
  // the cloud with helper bots working inside
  const cp = K.popIn(t, tCloud, 0.6);
  if (cp > 0) {
    const cx = W.x + W.w / 2, cy = W.y + 175 + Math.sin(t * 1.3) * 5;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(cp, cp);
    K.glow(ctx, 0, 0, 230, ACC, 0.25);
    ctx.fillStyle = mixHex('#ffffff', '#c7cdf0', night * 0.6);
    for (const [ox, oy, r] of [[-120, 20, 62], [-50, -24, 82], [40, -34, 88], [118, 10, 66], [0, 30, 80]]) { ctx.beginPath(); ctx.arc(ox, oy, r, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillRect(-170, 20, 340, 62); H.roundRect(ctx, -180, 30, 360, 60, 30); ctx.fill();
    for (let i = 0; i < 3; i++) K.drawRobot(ctx, -90 + i * 90, 78, 0.42, { t: t + i * 0.7, state: t > tDone ? 'happy' : 'working', seed: 4 + i });
    ctx.restore();
  }
  ctx.restore();
  if (cp > 0) K.drawLabel(ctx, W.x + W.w / 2, W.y + 66, cp, { text: P.cloud || 'In the cloud', size: 28, dot: true });

  // wall clock (races)
  const clockH = 9 + (t < tSpin ? t * 0.05 : (t - tSpin) * 2.5 + tSpin * 0.05);
  K.drawClock(ctx, 250, 625, 1.25, { t, hour: clockH, speed: 0, shadow: false });
  // cue pills by the clock
  words.forEach(([wt, lab], i) => {
    const next = words[i + 1] ? words[i + 1][0] : tClose;
    const p = K.popIn(t, wt, 0.35) * (1 - smooth((t - next + 0.05) / 0.2));
    if (p > 0) K.drawLabel(ctx, 250, 448, p, { text: lab, size: 34, accent: true });
  });

  // desk + laptop that closes
  const feet = 1035, deskX = 420, deskS = 1.15, deskTop = feet - 110 * deskS;
  // worker: present until tClose, walks out left, walks back in at tBack
  const outT = tClose + 0.35, goneT = outT + 1.1;
  let wx = 250, flip = false, walk = null, pose = 'stand', mood = 'neutral';
  if (t >= outT && t < goneT) { const u = (t - outT) / 1.1; wx = lerp(250, -120, u); flip = true; walk = t - outT; }
  else if (t >= goneT && t < tBack) wx = -200;
  else if (t >= tBack) { const u = clamp((t - tBack) / 0.9); wx = lerp(-120, 250, easeOutCubic(u)); walk = u < 1 ? t - tBack : null; }
  if (t >= tClose - 0.2 && t < outT + 0.2) pose = 'point';
  if (t >= tDone + 0.2) { pose = 'cheer'; mood = 'happy'; }
  else if (t < tClose) mood = 'happy';
  if (wx > -150) K.drawPerson(ctx, wx, feet, 1.5, { t, pose, mood, walk, flip, look: flip ? -0.6 : 0.6, skin: 2, hair: 0, shirt: 1, hairStyle: 'short', seed: 11 });
  K.drawDesk(ctx, deskX, feet, deskS);
  const lid = 1 - H.easeInOutCubic(clamp((t - tClose) / 0.45));
  ctx.save(); ctx.translate(deskX - 50, deskTop + 2); ctx.scale(1, 0.08 + 0.92 * lid); ctx.translate(-(deskX - 50), -(deskTop + 2));
  K.drawLaptop(ctx, deskX - 50, deskTop + 2, 0.6, { t, screen: 'chat', typing: false, shadow: false, glow: lid > 0.5 });
  ctx.restore();
  // finished stack appears on the desk while the worker is away
  const nDocs = 5;
  for (let i = 0; i < nDocs; i++) {
    const born = lerp(tClose + 0.6, tBack - 0.1, i / nDocs), u = clamp((t - born) / 0.5);
    if (u <= 0) continue;
    ctx.save(); ctx.globalAlpha = clamp(u * 2); ctx.translate(deskX + 95, deskTop - 2 - i * 9 - (1 - easeOutCubic(u)) * 90);
    ctx.rotate((H.hash(i, 6) - 0.5) * 0.1); K.drawDocument(ctx, 0, 0, 0.38, { shadow: false, lines: 4, sign: 1 }); ctx.restore();
  }
  if (t >= tDone) K.drawStamp(ctx, deskX + 95, deskTop - 70, 0.7, { kind: 'check', text: P.done || 'DONE', land: clamp((t - tDone) / 0.55) });
  ctx.restore();
}
