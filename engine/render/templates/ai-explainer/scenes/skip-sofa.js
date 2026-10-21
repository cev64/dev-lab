// Scene "skip-sofa" (full frame). Night living room: a cartoon listener with headphones on the sofa; a big generic
// music-player phone (robot-face cover art, no brand) on the right. The listener skips tracks (finger taps the skip
// button, covers slide away), ignores one (looks away, "z z" bubble), and taps "Not interested" on another. Each
// rejected track drops into a tray of small tiles on the left with its reason ("Skipped", "Ignored", ...). On
// `againCue` the tray shakes, then the reason tags flip to stamps ("SLOP" / "SPAM") on `slopCue` / `spamCue`.
// Fits: listener feedback as a signal, "what people skip", engagement-based detection, recommendation feedback.
// params: head ("What listeners skip"), reasons (["Skipped","Skipped","Ignored","Not for me"]), tags (["SLOP","SPAM","SLOP","SPAM"]),
//         menu ("Not interested"), cues: headCue, skipCue, ignoreCue, noCue, againCue, slopCue, spamCue (narration
//         words, "word#n" = (n+1)th time spoken; else fractions of the scene)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const T = {
    head: at(P.headCue, D * 0.2), skip: at(P.skipCue, D * 0.35), ignore: at(P.ignoreCue, D * 0.45),
    no: at(P.noCue, D * 0.58), again: at(P.againCue, D * 0.72), slop: at(P.slopCue, D * 0.85), spam: at(P.spamCue, D * 0.9),
  };
  // events: [tap time, kind of leave, tray index]
  const skips = [T.skip, T.skip + 0.55];
  const EV = [
    { t: skips[0], how: 'skip' }, { t: skips[1], how: 'skip' }, { t: T.ignore + 0.6, how: 'ignore' }, { t: T.no + 0.5, how: 'no' },
  ];
  const reasons = P.reasons || ['Skipped', 'Skipped', 'Ignored', 'Not for me'];
  const tags = P.tags || ['SLOP', 'SPAM', 'SLOP', 'SPAM'];
  const ignoring = t > T.ignore - 0.1 && t < T.ignore + 1.1;

  // ---- room
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.3, x: 560, y: 770 }, { t: D, zoom: 1.42, x: 640, y: 765 }]);
  const room = K.world.livingRoomNight(ctx, { t });
  const sofa = room.sofa || { x: 480, feetY: 1030 };
  const mood = ignoring ? 'neutral' : t > T.again ? 'worried' : t > T.skip - 0.2 ? 'neutral' : 'happy';
  K.drawPerson(ctx, sofa.x, sofa.feetY, 1.9, {
    t, pose: 'sit-phone', seat: false, mood, skin: 1, hair: 2, shirt: '#e8786a', hairStyle: 'curly', look: ignoring ? -0.8 : 0.5, seed: 5,
  });
  const hx = sofa.x, hy = sofa.feetY - 1.9 * 188 + Math.sin(t * 1.6 + 5) * 1.2 * 1.9;
  ctx.save(); ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(hx, hy + 6, 64, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  H.roundRect(ctx, hx - 74, hy - 2, 22, 44, 10); ctx.fillStyle = ACC; ctx.fill();
  H.roundRect(ctx, hx + 52, hy - 2, 22, 44, 10); ctx.fill();
  ctx.restore();
  ctx.restore();

  // "z z" bubble while ignoring (screen space, near the head)
  const zp = smooth((t - T.ignore) / 0.3) * (1 - smooth((t - T.ignore - 1.1) / 0.3));
  if (zp > 0.01) {
    ctx.save(); ctx.globalAlpha = zp; ctx.font = K.font.display(44); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
    for (let i = 0; i < 3; i++) { const u = ((t - T.ignore) * 0.8 + i / 3) % 1; ctx.globalAlpha = zp * Math.sin(u * Math.PI); ctx.fillText('z', 200 - i * 10 + u * 20, 700 - u * 90); }
    ctx.restore();
  }

  // ---- phone (screen space, right)
  const fx = 710, fw = 320, fy = 600, fh = 445;
  K.shadow(ctx, fx, fy + fh + 4, 300);
  H.roundRect(ctx, fx - fw / 2, fy, fw, fh, 44); ctx.fillStyle = '#2a2f45'; ctx.fill();
  H.roundRect(ctx, fx - fw / 2 + 14, fy + 14, fw - 28, fh - 28, 32); ctx.fillStyle = '#121527'; ctx.fill();
  ctx.save(); H.roundRect(ctx, fx - fw / 2 + 14, fy + 14, fw - 28, fh - 28, 32); ctx.clip();
  ctx.beginPath(); ctx.arc(fx - fw / 2 + 50, fy + 50, 12, 0, Math.PI * 2); ctx.fillStyle = '#3ddc84'; ctx.fill();
  ctx.font = K.font.ui(22); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('Now playing', fx - fw / 2 + 72, fy + 51);
  // cover carousel
  const idx = EV.filter((e) => t > e.t).length;
  const cy = fy + 175;
  for (let k = Math.max(0, idx - 1); k <= idx; k++) {
    let x = fx;
    if (k < idx) { const u = clamp((t - EV[k].t) / 0.45); x = lerp(fx, fx - 340, easeOutCubic(u)); if (u >= 1) continue; }
    else if (k > 0) { const u = clamp((t - EV[k - 1].t) / 0.45); x = lerp(fx + 340, fx, easeOutCubic(u)); }
    tile(ctx, x, cy, 1.55, 'ai', k);
  }
  // title bars + progress
  H.roundRect(ctx, fx - 110, fy + 270, 150, 18, 9); ctx.fillStyle = '#dfe4f1'; ctx.fill();
  H.roundRect(ctx, fx - 110, fy + 296, 100, 14, 7); ctx.fillStyle = 'rgba(223,228,241,0.45)'; ctx.fill();
  const lastT = idx > 0 ? EV[idx - 1].t : 0, prog = clamp((t - lastT) / 6);
  H.roundRect(ctx, fx - 120, fy + 322, 240, 8, 4); ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fill();
  H.roundRect(ctx, fx - 120, fy + 322, 240 * prog + 4, 8, 4); ctx.fillStyle = ACC; ctx.fill();
  // controls
  const by = fy + 380;
  ctx.fillStyle = '#ffffff';
  tri(ctx, fx - 90, by, -1); tri(ctx, fx + 90, by, 1);
  ctx.beginPath(); ctx.arc(fx, by, 32, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#121527'; ctx.fillRect(fx - 11, by - 12, 8, 24); ctx.fillRect(fx + 3, by - 12, 8, 24);
  // "not interested" button (minus in a circle), top right of the screen
  const nbx = fx + 112, nby = fy + 52;
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(nbx, nby, 18, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.fillRect(nbx - 9, nby - 2, 18, 4);
  // "Not interested" menu chip
  const mp = smooth((t - T.no) / 0.3) * (1 - smooth((t - T.no - 1.0) / 0.3));
  if (mp > 0.01) {
    ctx.globalAlpha = mp;
    H.roundRect(ctx, fx - 140, fy + 80, 280, 64, 18); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.font = K.font.bold(26); ctx.textAlign = 'center'; ctx.fillStyle = '#161927'; ctx.fillText(P.menu || 'Not interested', fx, fy + 113);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  // fingertip taps: skip button (skips), menu (no)
  const taps = [[skips[0], fx + 90, by], [skips[1], fx + 90, by], [T.no - 0.05, nbx, nby], [T.no + 0.45, fx, fy + 112]];
  taps.forEach(([tt, x, y]) => {
    const u = t - tt;
    if (u < -0.4 || u > 0.6) return;
    const rp = clamp((u + 0.05) / 0.55);
    ctx.strokeStyle = H.rgba('#ffffff', 0.9 * (1 - rp)); ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(x, y, 16 + 46 * rp, 0, Math.PI * 2); ctx.stroke();
    const fp = 1 - smooth((u - 0.2) / 0.3);
    if (fp > 0) { ctx.globalAlpha = fp; ctx.beginPath(); ctx.ellipse(x + 20, y + 30 + 30 * (1 - smooth((u + 0.4) / 0.4)), 22, 28, -0.3, 0, Math.PI * 2); ctx.fillStyle = '#c98e6a'; ctx.fill(); ctx.globalAlpha = 1; }
  });

  // ---- tray of rejected tracks (left, top of the stage)
  const hp = K.popIn(t, T.head, 0.45);
  if (hp > 0) K.drawLabel(ctx, 250, 480, Math.min(1, hp), { text: P.head || 'What listeners skip', size: 28, dot: true });
  const shake = t > T.again && t < T.again + 0.8 ? Math.sin((t - T.again) * 40) * 5 * (1 - (t - T.again) / 0.8) : 0;
  EV.forEach((e, i) => {
    const tx = 530 + i * 110 + shake, ty = 498;
    const u = clamp((t - e.t - 0.2) / 0.7);
    if (u <= 0) {
      // empty slot
      H.roundRect(ctx, tx - 36, ty - 36, 72, 72, 12); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.stroke(); ctx.setLineDash([]);
      return;
    }
    const x = lerp(fx - 120, tx, easeOutCubic(u)), y = lerp(fy + 175, ty, easeOutCubic(u)) - Math.sin(u * Math.PI) * 60;
    tile(ctx, x, y, lerp(1.3, 0.72, u), 'ai', i);
    if (u >= 1) {
      const flipT = i % 2 === 0 ? T.slop : T.spam;
      const flipped = t > flipT;
      if (!flipped) {
        ctx.font = K.font.ui(20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(5,7,16,0.85)'; ctx.strokeText(reasons[i], tx, ty + 58);
        ctx.fillStyle = '#ffffff'; ctx.fillText(reasons[i], tx, ty + 58);
      } else {
        const sp = K.popIn(t, flipT + (i > 1 ? 0.15 : 0), 0.35);
        ctx.save(); ctx.translate(tx, ty + 58); ctx.rotate(-0.08); ctx.scale(Math.min(1.1, sp), Math.min(1.1, sp));
        H.roundRect(ctx, -48, -20, 96, 40, 10); ctx.fillStyle = ACC; ctx.fill();
        ctx.font = K.font.display(24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = H.mixHex(ACC, '#000000', 0.7);
        ctx.fillText(tags[i], 0, 1);
        ctx.restore();
      }
    }
  });

  function tile(c, x, y, s, kind, seed = 0) {
    c.save(); c.translate(x, y); c.scale(s, s);
    const tints = ['#c9cfe0', '#c4d2e6', '#d0cbe2', '#c9d8d6', '#d6cfd0'];
    H.roundRect(c, -50, -50, 100, 100, 16); c.fillStyle = tints[seed % tints.length]; c.fill();
    H.roundRect(c, -34, -30, 68, 50, 14); c.fillStyle = '#ffffff'; c.fill();
    H.roundRect(c, -26, -20, 52, 28, 9); c.fillStyle = '#161927'; c.fill();
    c.fillStyle = ACC; H.roundRect(c, -17, -13, 10, 14, 3); c.fill(); H.roundRect(c, 7, -13, 10, 14, 3); c.fill();
    c.font = K.font.ui(22); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#3b4260'; c.fillText('AI', 0, 36);
    c.restore();
    void kind;
  }
  function tri(c, x, y, dir) {
    c.beginPath(); c.moveTo(x - 12 * dir, y - 14); c.lineTo(x + 8 * dir, y); c.lineTo(x - 12 * dir, y + 14); c.closePath(); c.fill();
    c.fillRect(x + 8 * dir - (dir > 0 ? 0 : 4), y - 14, 4, 28);
  }
}
