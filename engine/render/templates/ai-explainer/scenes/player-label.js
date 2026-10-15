// Scene "player-label" (full frame). Night living room: a cartoon listener on the sofa with a phone, music notes
// floating up. A big generic music-player phone mock-up (abstract cover art, waveform, controls; no brand) slides in
// on the right; a date pill, then an "AI label" pill lands on the player page and pulses; a tap ripple opens a small
// info sheet ("About this track": rows with AI chips). mode "payoff": same room, the label is already there, a tap
// opens the sheet, then a question card with two round buttons (play / skip) pops at the top of the stage.
// Fits: AI disclosure labels on songs/videos/apps, "this was made with AI" badges, transparency features.
// params: mode intro|payoff, date ("Oct 14, 2026"), label ("AI label"), sheetTitle ("About this track"),
//         rows ([["Composition", "AI"], ["Vocals", "AI"]]), question ("Still listen if it said FULLY AI?"),
//         cues: dateCue (October), labelCue (label), menuCue (tapping); payoff: tapCue (check), qCue (Would)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth } = H;
  const D = info.duration, ACC = info.accent;
  const payoff = P.mode === 'payoff';
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tDate = at(P.dateCue || 'October', D * 0.15);
  const tLabel = payoff ? -1 : at(P.labelCue || 'label', D * 0.6);
  const tMenu = at(payoff ? (P.tapCue || 'check') : (P.menuCue || 'tapping'), D * (payoff ? 0.3 : 0.8));
  const tQ = payoff ? at(P.qCue || 'Would', D * 0.55) : 1e9;
  const tPhone = payoff ? -1 : Math.min(tDate + 0.4, D * 0.3);

  // ---- room (world space, camera pans so the sofa sits left and the phone mock-up fits right)
  ctx.save();
  if (payoff) K.camera(ctx, t, [{ t: 0, zoom: 1.4, x: 642, y: 760 }, { t: D, zoom: 1.45, x: 640, y: 765 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.15, x: 480, y: 770 }, { t: 1.6, zoom: 1.2, x: 480, y: 770 }, { t: tPhone, zoom: 1.4, x: 642, y: 760 }, { t: D, zoom: 1.44, x: 640, y: 765 }]);
  const room = K.world.livingRoomNight(ctx, { t });
  const sofa = room.sofa || { x: 480, feetY: 1030 };
  const sawLabel = t > tLabel + 0.4;
  const mood = payoff ? (t > tQ ? 'neutral' : 'happy') : (sawLabel ? 'shocked' : 'happy');
  K.drawPerson(ctx, sofa.x, sofa.feetY, 1.9, {
    t, pose: 'sit-phone', seat: false, mood, skin: 2, hair: 0, shirt: '#4fb3a6', hairStyle: 'short', look: sawLabel || payoff ? 0.5 : 0.2, seed: 3,
  });
  // headphones band over the head (simple arc + cups)
  const hx = sofa.x, hy = sofa.feetY - 1.9 * 188 + Math.sin(t * 1.6 + 3) * 1.2 * 1.9;
  ctx.save(); ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(hx, hy + 6, 64, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  H.roundRect(ctx, hx - 74, hy - 2, 22, 44, 10); ctx.fillStyle = ACC; ctx.fill();
  H.roundRect(ctx, hx + 52, hy - 2, 22, 44, 10); ctx.fill();
  ctx.restore();
  // floating notes from the phone (fade when the label shows)
  const noteA = payoff ? 0.5 : 1 - 0.6 * smooth((t - tLabel) / 0.6);
  for (let i = 0; i < 6; i++) {
    const life = ((t * 0.5 + i / 6) % 1), nx = sofa.x + 40 + Math.sin(i * 2.1 + t) * 40 + life * 60 * (i % 2 ? 1 : -1), ny = sofa.feetY - 330 - life * 260;
    ctx.globalAlpha = noteA * Math.sin(life * Math.PI);
    note(ctx, nx, ny, 0.8 + 0.3 * H.hash(i, 4), i % 3 ? '#ffffff' : ACC);
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // ---- hook "?" bubble over the listener (intro only, before the phone arrives)
  if (!payoff) {
    const qp = K.popIn(t, 1.2, 0.4) * (1 - smooth((t - tPhone) / 0.4));
    if (qp > 0.01) K.drawSpeechBubble(ctx, 600, 560, qp, { text: '?', size: 80, tail: 'left', pop: qp });
  }

  // ---- phone mock-up (screen space, right side)
  const fx = 690, fw = 350, fy = 455, fh = 590;
  const pp = payoff ? 1 : Math.min(1, K.popIn(t, tPhone, 0.55));
  if (pp > 0) {
    ctx.save(); ctx.translate(fx, fy + fh); ctx.scale(pp, pp); ctx.translate(-fx, -(fy + fh));
    K.shadow(ctx, fx, fy + fh + 4, 320);
    H.roundRect(ctx, fx - fw / 2, fy, fw, fh, 44); ctx.fillStyle = '#2a2f45'; ctx.fill();
    H.roundRect(ctx, fx - fw / 2 + 14, fy + 14, fw - 28, fh - 28, 32); ctx.fillStyle = '#121527'; ctx.fill();
    ctx.save(); H.roundRect(ctx, fx - fw / 2 + 14, fy + 14, fw - 28, fh - 28, 32); ctx.clip();
    // cover art: abstract gradient square with shapes
    const cx0 = fx - 120, cy0 = fy + 50, cs = 240;
    const g = ctx.createLinearGradient(cx0, cy0, cx0 + cs, cy0 + cs); g.addColorStop(0, '#6f4fd0'); g.addColorStop(1, '#e8786a');
    H.roundRect(ctx, cx0, cy0, cs, cs, 22); ctx.fillStyle = g; ctx.fill();
    ctx.globalAlpha = 0.85;
    ctx.beginPath(); ctx.arc(cx0 + 150, cy0 + 100, 56 + 4 * Math.sin(t * 2), 0, Math.PI * 2); ctx.fillStyle = '#ffcc66'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx0, cy0 + 200); ctx.quadraticCurveTo(cx0 + 120, cy0 + 120, cx0 + cs, cy0 + 190); ctx.lineTo(cx0 + cs, cy0 + cs); ctx.lineTo(cx0, cy0 + cs); ctx.closePath(); ctx.fillStyle = '#2b1f5c'; ctx.fill();
    ctx.globalAlpha = 1;
    note(ctx, cx0 + 70, cy0 + 120, 1.1, '#ffffff');
    // title bars
    H.roundRect(ctx, cx0, cy0 + cs + 26, 120, 18, 9); ctx.fillStyle = '#dfe4f1'; ctx.fill();
    H.roundRect(ctx, cx0, cy0 + cs + 56, 110, 14, 7); ctx.fillStyle = 'rgba(223,228,241,0.45)'; ctx.fill();
    // waveform / progress
    const wy = fy + 420;
    for (let k = 0; k < 22; k++) {
      const x = fx - 130 + k * 12.4, h = 8 + 26 * Math.abs(Math.sin(k * 1.7 + t * 4)) * (0.5 + 0.5 * H.hash(k, 9));
      ctx.fillStyle = k < 9 + (t * 0.3 % 1) * 2 ? ACC : 'rgba(255,255,255,0.35)';
      H.roundRect(ctx, x, wy - h / 2, 7, h, 3); ctx.fill();
    }
    // controls
    const by = fy + 500;
    ctx.fillStyle = '#ffffff';
    tri(ctx, fx - 92, by, -1); tri(ctx, fx + 92, by, 1);
    ctx.beginPath(); ctx.arc(fx, by, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#121527'; ctx.fillRect(fx - 11, by - 13, 8, 26); ctx.fillRect(fx + 3, by - 13, 8, 26);

    // AI label pill on the player page
    const lx = fx + 78, ly = cy0 + cs + 74;
    const lp = payoff ? 1 : K.popIn(t, tLabel, 0.5);
    if (lp > 0) {
      const pulse = 1 + 0.05 * Math.sin((t - tLabel) * 5) * (payoff ? 0.4 : 1);
      if (lp > 0.6) K.glow(ctx, lx, ly - 20, 80, ACC, 0.35);
      K.drawLabel(ctx, lx, ly, Math.min(1.1, lp) * pulse, { text: P.label || 'AI label', size: 24, accent: true });
    }
    // tap ripple + info sheet
    const tapT = t - tMenu;
    if (tapT > -0.4 && tapT < 0.9) {
      const rp = clamp((tapT + 0.1) / 0.8);
      ctx.strokeStyle = H.rgba('#ffffff', 0.9 * (1 - rp)); ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(lx, ly - 20, 18 + 50 * rp, 0, Math.PI * 2); ctx.stroke();
      // fingertip
      const fp = 1 - smooth((tapT - 0.3) / 0.4);
      if (fp > 0) { ctx.globalAlpha = fp; ctx.beginPath(); ctx.ellipse(lx + 18, ly + 4 + 30 * (1 - smooth((tapT + 0.4) / 0.4)), 22, 28, -0.3, 0, Math.PI * 2); ctx.fillStyle = '#eab894'; ctx.fill(); ctx.globalAlpha = 1; }
    }
    const sp = smooth((t - tMenu - 0.25) / 0.5) * (payoff ? 1 - smooth((t - tQ + 0.1) / 0.3) : 1);
    if (sp > 0) {
      const sh = 250, sy = fy + fh - 14 - sh * sp;
      ctx.fillStyle = 'rgba(5,7,16,' + (0.45 * sp) + ')'; ctx.fillRect(fx - fw / 2, fy, fw, fh);
      H.roundRect(ctx, fx - fw / 2 + 14, sy, fw - 28, sh + 40, 28); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      H.roundRect(ctx, fx - 30, sy + 14, 60, 8, 4); ctx.fillStyle = '#b9c1d6'; ctx.fill();
      ctx.font = K.font.bold(28); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#161927';
      ctx.fillText(P.sheetTitle || 'About this track', fx - fw / 2 + 44, sy + 60);
      const rows = P.rows || [['Composition', 'AI'], ['Vocals', 'AI']];
      rows.forEach((r, i) => {
        const rpp = K.popIn(t, tMenu + 0.6 + i * 0.3, 0.35);
        if (rpp <= 0) return;
        const ry = sy + 120 + i * 66;
        ctx.globalAlpha = Math.min(1, rpp);
        ctx.font = K.font.ui(26); ctx.textAlign = 'left'; ctx.fillStyle = '#2a2f45'; ctx.fillText(r[0], fx - fw / 2 + 44, ry);
        H.roundRect(ctx, fx + 66, ry - 20, 76, 40, 20); ctx.fillStyle = ACC; ctx.fill();
        ctx.font = K.font.ui(22); ctx.textAlign = 'center'; ctx.fillStyle = H.mixHex(ACC, '#000000', 0.62); ctx.fillText(r[1], fx + 104, ry + 1);
        ctx.globalAlpha = 1;
      });
    }
    ctx.restore();
    ctx.restore();
  }

  // ---- date pill (intro)
  if (!payoff) {
    const dp = K.popIn(t, tDate, 0.45);
    if (dp > 0) K.drawLabel(ctx, 487, 470, Math.min(1, dp), { text: P.date || 'Oct 14, 2026', size: 30, dot: true });
    const tNew = at(P.newCue || 'labels', D * 0.35);
    const np = K.popIn(t, tNew, 0.45) * (1 - smooth((t - tLabel) / 0.4));
    if (np > 0.01) K.drawLabel(ctx, 487, 545, Math.min(1, np), { text: P.newText || 'New: labels for AI songs', size: 30, accent: true });
  }
  // ---- question card (payoff)
  if (payoff) {
    const qp = K.popIn(t, tQ, 0.5);
    if (qp > 0) {
      const s = Math.min(1.04, qp), cx = 690, cy = 700, w = 420, h = 330;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
      H.roundRect(ctx, -w / 2, -h / 2, w, h, 34); ctx.fillStyle = 'rgba(10,12,22,0.92)'; ctx.fill();
      ctx.strokeStyle = H.rgba(ACC, 0.8); ctx.lineWidth = 4; H.roundRect(ctx, -w / 2, -h / 2, w, h, 34); ctx.stroke();
      const q = P.question || 'Still listen if it said FULLY AI?';
      let fs = 46, lines = H.wrap(ctx, q, 'display', fs, w - 70);
      while (lines.length > 3 && fs > 28) { fs -= 2; lines = H.wrap(ctx, q, 'display', fs, w - 70); }
      ctx.font = H.font('display', fs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
      const l0 = -h / 2 + 30 + fs * 0.6;
      lines.forEach((ln, i) => ctx.fillText(ln, 0, l0 + i * fs * 1.12));
      // play / skip buttons
      const b1 = K.popIn(t, tQ + 0.5, 0.35), b2 = K.popIn(t, tQ + 0.7, 0.35), byy = h / 2 - 52;
      if (b1 > 0) { ctx.save(); ctx.translate(-90, byy); ctx.scale(b1, b1); ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill(); ctx.fillStyle = '#161927'; ctx.beginPath(); ctx.moveTo(-10, -16); ctx.lineTo(16, 0); ctx.lineTo(-10, 16); ctx.closePath(); ctx.fill(); ctx.restore(); }
      if (b2 > 0) { ctx.save(); ctx.translate(90, byy); ctx.scale(b2, b2); ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fillStyle = '#dfe4f1'; ctx.fill(); ctx.fillStyle = '#161927'; ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(6, 0); ctx.lineTo(-14, 14); ctx.closePath(); ctx.fill(); ctx.fillRect(8, -14, 6, 28); ctx.restore(); }
      ctx.restore();
    }
  }

  function note(c, x, y, s, col) {
    c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col; c.strokeStyle = col; c.lineWidth = 6; c.lineCap = 'round';
    c.beginPath(); c.moveTo(8, 12); c.lineTo(8, -30); c.lineTo(30, -36); c.lineTo(30, 4); c.stroke();
    c.beginPath(); c.ellipse(0, 14, 11, 8, -0.4, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(22, 6, 11, 8, -0.4, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  function tri(c, x, y, dir) {
    c.beginPath(); c.moveTo(x - 12 * dir, y - 14); c.lineTo(x + 8 * dir, y); c.lineTo(x - 12 * dir, y + 14); c.closePath(); c.fill();
    c.fillRect(x + 8 * dir - (dir > 0 ? 0 : 4), y - 14, 4, 28);
  }
}
