// Scene "slop-factory" (full frame). Night factory cut-away: a boxy machine with robot eyes pumps out identical
// robot-face song tiles onto a conveyor. On `buryCue` a trapdoor in the floor opens and the tiles drop into a
// basement where a pile grows. A generic green music-app phone ("For you" feed) stands at the right; on `pullCue` a
// scan line sweeps the feed, robot-face rows slide out and fall through the trapdoor, music-note rows take their place.
// Pills: date, a big counter (value + unit counting up) with a sub pill, then basement pills ("Not deleted" ->
// "Still on the app") and a magnifier with "Harder to find". mode "payoff": settled room, glowing pile, "Buried, not
// gone" pill, then a question card with two chips.
// Fits: content removed from recommendations / feeds but not deleted, spam floods, filters, "buried" stories.
// Best as a 2-beat span (hook + what happened) in bury mode; payoff mode for the closing beat.
// params: mode bury|payoff, date ('' hides the pill), value (100), unit ("tracks"), sub ("out of recommendations"),
//         feed ("For you"), notDeleted ("Not deleted"), still ("Still on the app"), harder ("Harder to find"),
//         buriedText ("Buried, not gone"), question, a, b
//         cues (narration words, "word#n" = (n+1)th time spoken; else fractions of the scene): buryCue, dateCue,
//               countCue, pullCue, notCue, stillCue, harderCue; payoff: buriedCue, qCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const payoff = P.mode === 'payoff';
  const at = (w, d) => {
    if (!w) return d;
    const [word, n] = String(w).split('#');
    const v = info.timeOf(word, n ? +n : 0);
    return v == null ? d : v;
  };
  const T = payoff ? {
    bury: -10, pull: -10, buried: at(P.buriedCue, D * 0.22), q: at(P.qCue, D * 0.55),
  } : {
    bury: at(P.buryCue, D * 0.05), date: at(P.dateCue, D * 0.24), count: at(P.countCue, D * 0.37),
    pull: at(P.pullCue, D * 0.35), not: at(P.notCue, D * 0.73), still: at(P.stillCue, D * 0.83),
    harder: at(P.harderCue, D * 0.93),
  };
  const FLOOR = 830, TRAP = 600, PH = { x: 770, w: 270, top: 455, bot: 828 };
  const GREEN = '#3ddc84';

  ctx.save();
  if (payoff) K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 487, y: 760 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: Math.min(3.2, D * 0.25), zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 735 }]);

  // ---- room: wall, floor slab, basement cut-away
  K.world.room(ctx, { t, time: 'night', floorY: FLOOR, window: false, lamp: false, picture: false, plant: false });
  // wall pipes + vents (texture)
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let i = 0; i < 6; i++) H.roundRect(ctx, 60 + i * 170, 300, 18, 520, 9), ctx.fill();
  const bg = ctx.createLinearGradient(0, FLOOR + 30, 0, 1920);
  bg.addColorStop(0, '#11142a'); bg.addColorStop(1, '#05060d');
  ctx.fillStyle = bg; ctx.fillRect(0, FLOOR + 26, 1080, 1920 - FLOOR);
  // basement brick lines
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 2;
  for (let r = 0; r < 6; r++) { const y = FLOOR + 60 + r * 36; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); for (let c = 0; c < 14; c++) { const x = c * 90 + (r % 2) * 45; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 36); ctx.stroke(); } }
  // floor slab
  ctx.fillStyle = '#2f3550'; ctx.fillRect(0, FLOOR, 1080, 26);
  ctx.fillStyle = '#454c6e'; ctx.fillRect(0, FLOOR, 1080, 6);

  // pile in the basement
  const pileN = payoff ? 34 : Math.floor(clamp((t - T.bury - 0.6) / 0.7, 0, 40)) + (t > T.pull + 1.4 ? 3 : 0);
  const pileGlow = payoff ? 0.6 + 0.2 * Math.sin(t * 3) : smooth((t - T.not) / 0.5) * (0.5 + 0.15 * Math.sin(t * 3));
  if (pileGlow > 0) K.glow(ctx, TRAP, 1010, 300, ACC, 0.25 * pileGlow);
  for (let k = 0; k < Math.min(pileN, 40); k++) {
    const row = Math.floor(Math.sqrt(k)), x = TRAP + (H.hash(k, 3) - 0.5) * (120 + row * 70), y = 1022 - row * 18 - H.hash(k, 5) * 10;
    ctx.save(); ctx.translate(x, y); ctx.rotate((H.hash(k, 7) - 0.5) * 1.2); tile(ctx, 0, 0, 0.55, 'ai'); ctx.restore();
  }

  // trapdoor
  const open = payoff ? 1 : smooth((t - T.bury) / 0.4);
  ctx.save();
  ctx.fillStyle = '#05060d'; ctx.fillRect(TRAP - 70, FLOOR, 140, 26 * open + 0.01);
  for (const side of [-1, 1]) {
    ctx.save(); ctx.translate(TRAP + side * 70, FLOOR + 3); ctx.rotate(side * -open * 1.35);
    H.roundRect(ctx, side < 0 ? 0 : -70, -3, 70, 12, 4); ctx.fillStyle = '#6b7396'; ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // ---- factory machine (left)
  const fx = 70, fy = 650, fw = 240, fh = FLOOR - fy;
  const pump = Math.max(0, Math.sin(t * Math.PI * 2 / 0.8));
  // chimney + smoke
  H.roundRect(ctx, fx + 30, fy - 60, 44, 70, 6); ctx.fillStyle = '#3b4260'; ctx.fill();
  for (let i = 0; i < 4; i++) {
    const life = (t * 0.45 + i / 4) % 1;
    ctx.globalAlpha = 0.35 * Math.sin(life * Math.PI);
    ctx.beginPath(); ctx.arc(fx + 52 + Math.sin(life * 5 + i) * 10, fy - 70 - life * 90, 16 + life * 22, 0, Math.PI * 2); ctx.fillStyle = '#8a93b8'; ctx.fill();
  }
  ctx.globalAlpha = 1;
  K.shadow(ctx, fx + fw / 2, FLOOR, 280);
  H.roundRect(ctx, fx, fy, fw, fh, 22); ctx.fillStyle = '#5b6aa8'; ctx.fill();
  H.roundRect(ctx, fx + fw * 0.7, fy, fw * 0.3, fh, 22); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fill();
  // robot-eye screen
  H.roundRect(ctx, fx + 40, fy + 30, 130, 70, 16); ctx.fillStyle = '#161927'; ctx.fill();
  const blink = (t % 3.1) < 0.12 ? 0.15 : 1;
  ctx.fillStyle = ACC;
  H.roundRect(ctx, fx + 70, fy + 52, 22, 26 * blink, 6); ctx.fill();
  H.roundRect(ctx, fx + 118, fy + 52, 22, 26 * blink, 6); ctx.fill();
  // press piston
  const py = fy + 112 + pump * 18;
  H.roundRect(ctx, fx + 196, fy + 104, 26, 20 + pump * 18, 6); ctx.fillStyle = '#3b4260'; ctx.fill();
  H.roundRect(ctx, fx + 184, py + 6, 50, 14, 5); ctx.fillStyle = '#dfe4f1'; ctx.fill();
  // output slot
  H.roundRect(ctx, fx + fw - 18, FLOOR - 92, 30, 74, 8); ctx.fillStyle = '#161927'; ctx.fill();
  // lights
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(fx + 40 + i * 30, fy + 130, 8, 0, Math.PI * 2); ctx.fillStyle = (Math.floor(t * 4) + i) % 3 === 0 ? ACC : '#2a2f45'; ctx.fill(); }

  // ---- conveyor
  const CX0 = fx + fw, CX1 = PH.x - PH.w / 2 - 6, CY = FLOOR - 40;
  H.roundRect(ctx, CX0 - 6, CY, CX1 - CX0 + 12, 20, 10); ctx.fillStyle = '#2a2f45'; ctx.fill();
  const belt = payoff ? 0 : t;
  for (let x = CX0; x < CX1; x += 28) { const xx = x + ((belt * 150) % 28); if (xx < CX1) { ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(xx, CY + 3, 3, 14); } }
  for (const lx of [CX0 + 20, (CX0 + CX1) / 2, CX1 - 20]) { H.roundRect(ctx, lx - 5, CY + 20, 10, FLOOR - CY - 20, 3); ctx.fillStyle = '#3b4260'; ctx.fill(); }

  // tiles on the belt (identical robot-face tiles)
  const SPACING = 0.8, SPEED = 150;
  const kMax = Math.floor(t / SPACING);
  for (let k = Math.max(0, kMax - 8); k <= kMax; k++) {
    const lt = t - k * SPACING;
    if (lt < 0) continue;
    let x = CX0 + 10 + lt * SPEED, y = CY - 32;
    const emitAbs = k * SPACING + (TRAP - CX0 - 10) / SPEED; // time it reaches the trapdoor
    if (payoff && k < kMax - 2) continue;
    if (x >= TRAP && emitAbs > T.bury) {
      // falls through the trapdoor
      const ft = lt - (TRAP - CX0 - 10) / SPEED;
      x = TRAP + ft * 40; y = CY - 32 + 300 * ft * ft + 60 * ft;
      if (y > 1000) continue;
      ctx.save(); ctx.translate(x, y); ctx.rotate(ft * 3); tile(ctx, 0, 0, 0.62, 'ai'); ctx.restore();
      continue;
    }
    if (x > CX1 - 10) continue; // into the phone slot
    tile(ctx, x, y, 0.62, 'ai');
  }

  // ---- phone ("For you" feed)
  const pw = PH.w, ph = PH.bot - PH.top, px = PH.x - pw / 2;
  K.shadow(ctx, PH.x, PH.bot + 2, 260);
  H.roundRect(ctx, px, PH.top, pw, ph, 36); ctx.fillStyle = '#2a2f45'; ctx.fill();
  H.roundRect(ctx, px + 12, PH.top + 12, pw - 24, ph - 24, 26); ctx.fillStyle = '#0f1222'; ctx.fill();
  ctx.save(); H.roundRect(ctx, px + 12, PH.top + 12, pw - 24, ph - 24, 26); ctx.clip();
  // header: generic green app dot + feed name
  ctx.beginPath(); ctx.arc(px + 46, PH.top + 52, 14, 0, Math.PI * 2); ctx.fillStyle = GREEN; ctx.fill();
  ctx.strokeStyle = '#0f1222'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(px + 46, PH.top + 60, 8, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  ctx.font = K.font.bold(28); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
  ctx.fillText(P.feed || 'For you', px + 72, PH.top + 53);
  // rows
  const kinds = ['ai', 'ai', 'human', 'ai'];
  const sweep = payoff ? 2 : (t - T.pull) / 0.9; // 0..1 sweep progress
  const rowY = (i) => PH.top + 108 + i * 76;
  let slot = 0;
  kinds.forEach((kd, i) => {
    const y0 = rowY(i);
    if (kd === 'ai') {
      const hit = clamp(sweep * 4.5 - i * 0.9); // passes row i
      if (hit >= 1) return;
      const out = smooth(hit);
      row(px + 30 - out * 260, y0, 'ai', 1 - out * 0.5, i);
    }
  });
  // human rows: before the sweep the one human row sits at index 2; after it, human rows fill from the top
  const settle = smooth(clamp((sweep - 0.8) / 0.8));
  for (let j = 0; j < 4; j++) {
    const before = j === 0 ? rowY(2) : null;
    const after = rowY(j);
    if (before != null) row(px + 30, lerp(before, after, settle), 'human', 1, 10);
    else if (settle > 0) { const a = smooth(clamp(settle * 3 - j * 0.6)); if (a > 0) row(px + 30 + (1 - a) * 80, after, 'human', a, 10 + j); }
  }
  void slot;
  // scan line
  if (!payoff && sweep > 0 && sweep < 1.2) {
    const sy = lerp(PH.top + 90, PH.bot - 20, clamp(sweep));
    ctx.globalAlpha = 1 - smooth((sweep - 1) / 0.2);
    K.glow(ctx, PH.x, sy, 120, ACC, 0.5);
    ctx.fillStyle = ACC; ctx.fillRect(px + 12, sy - 3, pw - 24, 6);
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // swept rows fly from the phone to the trapdoor
  if (!payoff) {
    [0, 1, 3].forEach((i, n) => {
      const u = clamp((t - (T.pull + 0.25 + n * 0.22 + i * 0.05)) / 1.1);
      if (u <= 0 || u >= 1) return;
      const x = lerp(px - 10, TRAP, easeOutCubic(u)), y = lerp(rowY(i), 1000, u * u) - Math.sin(u * Math.PI) * 90;
      ctx.save(); ctx.translate(x, y); ctx.rotate(u * 4); tile(ctx, 0, 0, 0.62, 'ai'); ctx.restore();
    });
  }

  // ---- pills / counter (bury mode)
  if (!payoff) {
    const dp = K.popIn(t, T.date, 0.45);
    if (dp > 0 && P.date) K.drawLabel(ctx, 300, 478, Math.min(1, dp), { text: P.date, size: 28, dot: true });
    const cp = K.popIn(t, T.count, 0.5);
    if (cp > 0) {
      const v = Math.round(lerp(1, P.value || 100, easeOutCubic(clamp((t - T.count) / 1.1))));
      ctx.save(); ctx.translate(320, 556); ctx.scale(Math.min(1.06, cp), Math.min(1.06, cp));
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.font = K.font.display(60); ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(5,7,16,0.8)';
      const txt = `${v} ${P.unit || 'tracks'}`.toUpperCase();
      ctx.strokeText(txt, 0, 0); ctx.fillStyle = ACC; ctx.fillText(txt, 0, 0);
      ctx.restore();
      const sp = K.popIn(t, T.count + 0.7, 0.4);
      if (sp > 0) K.drawLabel(ctx, 300, 630, Math.min(1, sp), { text: P.sub || 'out of recommendations', size: 28 });
    }
    // basement pill: Not deleted -> Still on the app
    const np = K.popIn(t, T.not, 0.45);
    if (np > 0) {
      const txt = t < T.still ? (P.notDeleted || 'Not deleted') : (P.still || 'Still on the app');
      const sw = Math.abs(t - T.still) < 0.2 ? 1 - Math.abs(t - T.still) / 0.2 : 0;
      K.drawLabel(ctx, 280, 940, Math.min(1, np) * (1 - 0.25 * sw), { text: txt, size: 30, accent: true });
    }
    const hp = K.popIn(t, T.harder, 0.45);
    if (hp > 0) {
      const mx = 700 + Math.sin((t - T.harder) * 2) * 40, my = 930;
      magnifier(ctx, mx, my, Math.min(1, hp));
      K.drawLabel(ctx, 820, 1030, Math.min(1, K.popIn(t, T.harder + 0.25, 0.4)), { text: P.harder || 'Harder to find', size: 26 });
    }
  } else {
    // payoff: buried, not gone
    const bp = K.popIn(t, T.buried, 0.45);
    magnifier(ctx, 760 + Math.sin(t * 1.6) * 40, 935, 1);
    if (bp > 0) K.drawLabel(ctx, 300, 950, Math.min(1, bp), { text: P.buriedText || 'Buried, not gone', size: 30, accent: true });
    const qp = K.popIn(t, T.q, 0.5);
    if (qp > 0) {
      const s = Math.min(1.03, qp), cx = 487, cy = 600, w = 760, h = 300;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
      H.roundRect(ctx, -w / 2, -h / 2, w, h, 34); ctx.fillStyle = 'rgba(10,12,22,0.94)'; ctx.fill();
      ctx.strokeStyle = H.rgba(ACC, 0.8); ctx.lineWidth = 4; H.roundRect(ctx, -w / 2, -h / 2, w, h, 34); ctx.stroke();
      const q = P.question || 'Should your feed filter AI music?';
      let fs = 52, lines = H.wrap(ctx, q, 'display', fs, w - 80);
      while (lines.length > 2 && fs > 30) { fs -= 2; lines = H.wrap(ctx, q, 'display', fs, w - 80); }
      ctx.font = H.font('display', fs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
      const l0 = -h / 2 + 40 + fs * 0.55;
      lines.forEach((ln, i) => ctx.fillText(ln, 0, l0 + i * fs * 1.1));
      const pa = K.popIn(t, T.q + 0.5, 0.35), pb = K.popIn(t, T.q + 0.75, 0.35);
      if (pa > 0) K.drawLabel(ctx, -170, h / 2 - 28, Math.min(1, pa), { text: P.a || 'Filter it', size: 30, accent: true });
      if (pb > 0) K.drawLabel(ctx, 170, h / 2 - 28, Math.min(1, pb), { text: P.b || 'Play it all', size: 30 });
      ctx.restore();
      const pulse = 0.5 + 0.5 * Math.sin((t - T.q) * 4);
      if (t > T.q + 1) K.glow(ctx, cx, cy, 420, ACC, 0.06 * pulse);
    }
  }
  ctx.restore();

  // ---- helpers
  function row(x, y, kind, alpha, seed) {
    ctx.save(); ctx.globalAlpha = clamp(alpha);
    tile(ctx, x + 28, y + 28, 0.56, kind, seed);
    H.roundRect(ctx, x + 72, y + 8, 110 + 30 * H.hash(seed, 2), 14, 7); ctx.fillStyle = kind === 'ai' ? 'rgba(223,228,241,0.85)' : '#dfe4f1'; ctx.fill();
    H.roundRect(ctx, x + 72, y + 32, 70 + 30 * H.hash(seed, 4), 11, 6); ctx.fillStyle = 'rgba(223,228,241,0.4)'; ctx.fill();
    ctx.restore();
  }
  function tile(c, x, y, s, kind, seed = 0) {
    c.save(); c.translate(x, y); c.scale(s, s);
    if (kind === 'ai') {
      H.roundRect(c, -50, -50, 100, 100, 16); c.fillStyle = '#c9cfe0'; c.fill();
      H.roundRect(c, -50, 20, 100, 30, 0); c.fillStyle = 'rgba(0,0,0,0.08)'; c.fill();
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
  function magnifier(c, x, y, s) {
    c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-0.5);
    H.roundRect(c, -9, 40, 18, 70, 8); c.fillStyle = '#6b4a36'; c.fill();
    c.beginPath(); c.arc(0, 0, 46, 0, Math.PI * 2); c.fillStyle = 'rgba(180,220,255,0.18)'; c.fill();
    c.lineWidth = 10; c.strokeStyle = '#dfe4f1'; c.stroke();
    c.restore();
  }
}
