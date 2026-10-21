// Scene "signal-scanner" (full frame). Night sorting room: a conveyor carries song tiles (colourful music-note tiles
// and grey robot-face "AI" tiles) left to right through a scanner arch with robot eyes. Four signal panels above
// (2x2) light up one by one on their cues and beam into the arch; the more signals are lit, the more robot-face tiles
// the arch flags (accent ring + "!") and drops through a trapdoor into a bin, while music tiles roll on to a
// "For you" pill. Then a burst of identical tiles ("Mass uploads" pill) and a tiny tile ("Artificially short" pill)
// arrive and are all flagged.
// Fits: detection with several combined signals, spam filters, moderation pipelines, "how they spot it".
// params: signals (4 strings: listener reactions / upload patterns / track details / AI detectors), dest ("For you"),
//         extra ([{text, cue}] x2: "Mass uploads", "Artificially short"), sigCues [4 narration words]
//         (cues accept "word#n" = (n+1)th time spoken; without them fixed fractions of the scene)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth } = H;
  const D = info.duration, ACC = info.accent;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const sigs = P.signals || ['Listener reactions', 'Upload patterns', 'Track details', 'AI detectors'];
  const sigCues = P.sigCues || [];
  const TS = sigs.map((s, i) => at(sigCues[i], D * (0.15 + i * 0.13)));
  const extra = P.extra || [{ text: 'Mass uploads' }, { text: 'Artificially short' }];
  const TM = at(extra[0].cue, D * 0.75), TSH = at(extra[1].cue, D * 0.88);
  const lit = (tt) => TS.filter((x) => tt > x + 0.3).length;
  const BELT = 935, ARCH = 487, DROP = 690, X0 = 40, SPEED = 180;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 740 }]);
  K.world.room(ctx, { t, time: 'night', floorY: 980, window: false, lamp: false, picture: false, plant: false });
  ctx.fillStyle = 'rgba(5,7,16,0.25)'; ctx.fillRect(0, 0, 1080, 1920);
  K.glow(ctx, ARCH, 800, 420, '#8fa0ff', 0.10 + 0.04 * lit(t));

  // ---- signal panels (2x2) + beams to the arch
  sigs.forEach((s, i) => {
    const cx = i % 2 === 0 ? 270 : 704, cy = 520 + Math.floor(i / 2) * 88;
    const on = smooth((t - TS[i]) / 0.35), pop = K.popIn(t, TS[i], 0.4);
    if (on > 0) {
      ctx.save(); ctx.globalAlpha = 0.35 * on * (0.75 + 0.25 * Math.sin(t * 6 + i));
      ctx.strokeStyle = ACC; ctx.lineWidth = 4; ctx.setLineDash([10, 10]); ctx.lineDashOffset = -t * 60;
      ctx.beginPath(); ctx.moveTo(cx, cy + 34); ctx.quadraticCurveTo(cx, 690, ARCH, 718); ctx.stroke();
      ctx.restore();
    }
    const sc = 1 + 0.06 * Math.max(0, pop - 1) + (on > 0 && on < 1 ? 0.05 * Math.sin(on * Math.PI) : 0);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
    H.roundRect(ctx, -200, -34, 400, 68, 34); ctx.fillStyle = on > 0.5 ? 'rgba(20,24,40,0.95)' : 'rgba(10,12,22,0.75)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = on > 0.5 ? ACC : 'rgba(255,255,255,0.15)'; H.roundRect(ctx, -200, -34, 400, 68, 34); ctx.stroke();
    ctx.beginPath(); ctx.arc(-160, 0, 24, 0, Math.PI * 2); ctx.fillStyle = on > 0.5 ? ACC : '#3b4260'; ctx.fill();
    icon(i, -160, 0, on > 0.5 ? H.mixHex(ACC, '#000000', 0.7) : 'rgba(255,255,255,0.6)');
    ctx.font = K.font.ui(26); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = on > 0.5 ? '#ffffff' : 'rgba(255,255,255,0.45)';
    ctx.fillText(s, -122, 1);
    ctx.restore();
  });

  // ---- bin under the trapdoor
  H.roundRect(ctx, DROP - 80, BELT + 26, 160, 90, 14); ctx.fillStyle = '#1c2033'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 3; ctx.stroke();

  // ---- belt
  H.roundRect(ctx, 20, BELT, 1040, 24, 12); ctx.fillStyle = '#2a2f45'; ctx.fill();
  for (let x = 20; x < 1060; x += 30) { const xx = x + ((t * SPEED) % 30); if (xx < 1050 && Math.abs(xx - DROP) > 60) { ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(xx, BELT + 4, 3, 16); } }
  ctx.fillStyle = '#05060d'; ctx.fillRect(DROP - 55, BELT, 110, 24);

  // ---- tiles
  const items = [];
  for (let k = 0; k < 40; k++) {
    const e = k * 0.62 - 2.4;
    const ai = H.hash(k, 1) < 0.55;
    items.push({ e, ai, s: 0.78, id: k, flag: ai && (H.hash(k, 2) < 0.15 + lit(e + 2.6) * 0.25) });
  }
  for (let j = 0; j < 7; j++) items.push({ e: TM - 1.6 + j * 0.13, ai: true, s: 0.66, id: 100, flag: true, burst: true });
  items.push({ e: TSH - 1.9, ai: true, s: 0.42, id: 200, flag: true, short: true });
  const flagsShown = [];
  items.forEach((it) => {
    const lt = t - it.e;
    if (lt < 0) return;
    let x = X0 + lt * SPEED, y = BELT - 50 * it.s / 0.78 - 2;
    if (x > 1120) return;
    let rot = 0;
    if (it.flag && x > DROP) {
      const ft = (x - DROP) / SPEED;
      if (ft > 0.7) return;
      x = DROP + ft * 30; y += 900 * ft * ft; rot = ft * 4;
    }
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    tile(ctx, 0, 0, it.s, it.ai ? 'ai' : 'human', it.id);
    if (it.flag && x > ARCH - 10) {
      const fp = clamp((x - ARCH + 10) / 40);
      ctx.strokeStyle = ACC; ctx.lineWidth = 6; H.roundRect(ctx, -46 * it.s / 0.78 * 1.2, -46 * it.s / 0.78 * 1.2, 92 * it.s / 0.78 * 1.2, 92 * it.s / 0.78 * 1.2, 16); ctx.globalAlpha = fp; ctx.stroke();
      ctx.beginPath(); ctx.arc(34 * it.s / 0.78, -40 * it.s / 0.78, 16, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
      ctx.font = K.font.display(22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#161927'; ctx.fillText('!', 34 * it.s / 0.78, -39 * it.s / 0.78);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  });
  void flagsShown;

  // ---- scanner arch (drawn over the tiles' middle)
  const L = lit(t);
  ctx.save();
  // scan curtain
  ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(0, 730, 0, BELT);
  g.addColorStop(0, H.rgba(ACC, 0.05 + 0.06 * L)); g.addColorStop(1, H.rgba(ACC, 0.12 + 0.08 * L));
  ctx.fillStyle = g; ctx.fillRect(ARCH - 80, 730, 160, BELT - 730);
  const sweepY = 740 + ((t * 1.6) % 1) * (BELT - 760);
  ctx.fillStyle = H.rgba(ACC, 0.25 + 0.1 * L); ctx.fillRect(ARCH - 80, sweepY, 160, 5);
  ctx.restore();
  H.roundRect(ctx, ARCH - 120, 700, 36, BELT - 690, 12); ctx.fillStyle = '#5b6aa8'; ctx.fill();
  H.roundRect(ctx, ARCH + 84, 700, 36, BELT - 690, 12); ctx.fill();
  H.roundRect(ctx, ARCH - 140, 680, 280, 70, 24); ctx.fillStyle = '#6f7fbf'; ctx.fill();
  H.roundRect(ctx, ARCH - 70, 692, 140, 46, 14); ctx.fillStyle = '#161927'; ctx.fill();
  const blink = (t % 2.7) < 0.12 ? 0.2 : 1;
  ctx.fillStyle = ACC; H.roundRect(ctx, ARCH - 40, 704, 20, 22 * blink, 5); ctx.fill(); H.roundRect(ctx, ARCH + 20, 704, 20, 22 * blink, 5); ctx.fill();
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(ARCH - 105 + i * 0 + (i < 2 ? 0 : 210), 700 + 20 + (i % 2) * 24, 7, 0, Math.PI * 2); ctx.fillStyle = i < L ? ACC : '#2a2f45'; ctx.fill(); }

  // ---- destination + extra pills
  K.drawLabel(ctx, 850, 880, 1, { text: P.dest || 'For you', size: 26, dot: true });
  extra.forEach((x, i) => {
    const tt = i === 0 ? TM : TSH, p = K.popIn(t, tt, 0.4);
    if (p > 0) K.drawLabel(ctx, 220, 790 + i * 70, Math.min(1, p), { text: x.text, size: 26, accent: true });
  });
  ctx.restore();

  // ---- helpers
  function icon(i, x, y, col) {
    ctx.save(); ctx.translate(x, y); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 4; ctx.lineCap = 'round';
    if (i === 0) { ctx.beginPath(); ctx.arc(0, 2, 12, Math.PI, 0); ctx.stroke(); ctx.fillRect(-14, 0, 6, 11); ctx.fillRect(8, 0, 6, 11); }
    else if (i === 1) { ctx.beginPath(); ctx.moveTo(0, 12); ctx.lineTo(0, -10); ctx.moveTo(-8, -3); ctx.lineTo(0, -12); ctx.lineTo(8, -3); ctx.stroke(); }
    else if (i === 2) { for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-10, -8 + k * 8); ctx.lineTo(k === 2 ? 4 : 10, -8 + k * 8); ctx.stroke(); } }
    else { ctx.beginPath(); ctx.arc(-3, -3, 8, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(3, 3); ctx.lineTo(11, 11); ctx.stroke(); }
    ctx.restore();
  }
  function tile(c, x, y, s, kind, seed = 0) {
    c.save(); c.translate(x, y); c.scale(s, s);
    if (kind === 'ai') {
      H.roundRect(c, -50, -50, 100, 100, 16); c.fillStyle = '#c9cfe0'; c.fill();
      H.roundRect(c, -34, -30, 68, 50, 14); c.fillStyle = '#ffffff'; c.fill();
      H.roundRect(c, -26, -20, 52, 28, 9); c.fillStyle = '#161927'; c.fill();
      c.fillStyle = ACC; H.roundRect(c, -17, -13, 10, 14, 3); c.fill(); H.roundRect(c, 7, -13, 10, 14, 3); c.fill();
      c.font = K.font.ui(22); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#3b4260'; c.fillText('AI', 0, 36);
    } else {
      const cols = ['#e8786a', '#6f86e0', '#4fb3a6', '#a08be0', '#f2b84b'];
      H.roundRect(c, -50, -50, 100, 100, 16); c.fillStyle = cols[seed % cols.length]; c.fill();
      c.fillStyle = '#ffffff'; c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-4, 22); c.lineTo(-4, -26); c.lineTo(22, -32); c.lineTo(22, 14); c.stroke();
      c.beginPath(); c.ellipse(-14, 24, 13, 10, -0.4, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(12, 16, 13, 10, -0.4, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  }
}
