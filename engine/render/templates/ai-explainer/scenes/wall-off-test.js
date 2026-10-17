// Scene "wall-off-test" (full frame; 1 beat). Two fixes, acted out. Night office.
// Lower stage: a robot in a glass TEST pen is wired to a REAL SYSTEMS tower (packets flow); on cue a brick wall rises
//   between them, the packets stop, the robot bumps into the wall ("Walled off" pill).
// Upper stage: first a "personal data" folder of generic person tiles; then a header pill (e.g. "The agency's advice");
//   later a code sheet slides in, a magnifier sweeps it and stops on a line holding a key (red, "found" pill); on
//   the change cue the old key spins away and a fresh key spins in (line turns green, "changed" pill).
// Fits: "separate test from production", "rotate exposed credentials", "audit code for secrets", "what to do now".
// params (all optional): test, live, wall, scan, changed, head, folder, code (code-sheet caption, "app code")
//        cues: personalCue, headCue, wallCue, scanCue, changeCue
function drawKey(ctx, x, y, s, rot, color, dark) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = color; ctx.strokeStyle = dark; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(-26, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(-26, 0, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color; ctx.fillRect(-10, -6, 50, 12); ctx.strokeRect(-10, -6, 50, 12);
  ctx.fillRect(26, 6, 8, 12); ctx.fillRect(14, 6, 7, 9);
  ctx.restore();
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent, N = K.NEUTRAL;
  const at = (w, d) => { const v = w != null ? info.timeOf(w) : null; return v == null ? d : v; };
  const tPers = at(P.personalCue, D * 0.1), tHead = at(P.headCue, D * 0.25) - 0.2, tWall = at(P.wallCue, D * 0.4) - 0.1;
  const tScan = at(P.scanCue, D * 0.7) - 0.3, tChange = at(P.changeCue, D * 0.9) - 0.1;
  const feet = 1012;
  const pill = (text, x, y, a, b, o = {}) => {
    if (t < a || t > b + 0.35) return;
    ctx.save(); ctx.globalAlpha = K.fadeOut(t, b, 0.35);
    K.drawLabel(ctx, x, y, K.popIn(t, a, 0.4), { text, size: o.size || 26, dot: !o.accent, accent: o.accent });
    ctx.restore();
  };

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 487, y: 740 }, { t: tWall, zoom: 1.0, x: 487, y: 770 }, { t: tWall + 1.2, zoom: 1.03, x: 487, y: 790 },
    { t: tScan, zoom: 1.0, x: 487, y: 760 }, { t: D, zoom: 1.02, x: 487, y: 760 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 920 });

  // ---------------- lower stage: pen, cable, wall, tower
  const p0 = 100, p1 = 360, py = 840, wallX = 560;
  const wallUp = K.phase(t, tWall, tWall + 0.7, easeOutCubic);
  // cable + packets
  ctx.strokeStyle = '#11142a'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(p1, feet - 40); ctx.lineTo(730, feet - 40); ctx.stroke();
  for (let i = 0; i < 6; i++) {
    const u = (t * 0.45 + i / 6) % 1, x = lerp(p1 + 10, 735, u);
    if (wallUp > 0.3 && x > wallX - 50) continue; // blocked by the wall
    if (wallUp > 0.9) continue;
    K.glow(ctx, x, feet - 40, 24, ACC, 0.5); ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(x, feet - 40, 6, 0, Math.PI * 2); ctx.fill();
  }
  K.drawBuilding(ctx, 785, feet - 4, 0.45, { t, color: '#3f6f8f', floors: 8, lit: 0.5 });
  // pen + robot
  H.roundRect(ctx, p0 + 8, feet - 28, p1 - p0 - 16, 24, 8); ctx.fillStyle = '#2f3a63'; ctx.fill();
  const bump = t > tWall + 0.8 && t < tWall + 2.4;
  const rx = 235 + (bump ? Math.max(0, Math.sin((t - tWall - 0.8) * 3)) * 30 : 0) + K.motion.shake(t, tWall + 1.25, 0.4, 6);
  K.drawRobot(ctx, rx, feet - 26, 0.72, { t, state: t > tWall + 1.2 && t < tWall + 2.6 ? 'thinking' : 'working', seed: 2 });
  ctx.save(); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(170,220,255,0.75)'; ctx.fillStyle = 'rgba(140,200,255,0.09)';
  H.roundRect(ctx, p0, py, p1 - p0, feet - 4 - py, 14); ctx.fill(); ctx.stroke(); ctx.restore();
  // brick wall rising
  if (wallUp > 0) {
    const wh = 260 * wallUp, wy = feet - 4 - wh;
    ctx.save(); ctx.beginPath(); ctx.rect(wallX - 45, wy, 90, wh); ctx.clip();
    for (let r = 0; r < 10; r++) for (let c = -1; c < 3; c++) {
      const bx = wallX - 45 + c * 44 + (r % 2) * 22, by = feet - 4 - (r + 1) * 26;
      H.roundRect(ctx, bx + 2, by + 2, 40, 22, 3); ctx.fillStyle = (r + c) % 3 ? '#b5654a' : '#a0573f'; ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle = '#7b3f2c'; ctx.fillRect(wallX - 48, wy - 8, 96, 10);
    K.shadow(ctx, wallX, feet - 2, 140);
    // dust puffs at the base while rising
    if (wallUp < 1 || t < tWall + 1) { ctx.fillStyle = 'rgba(220,210,200,0.35)'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(wallX - 60 + i * 40, feet - 8 - ((t * 40 + i * 9) % 18), 12, 0, Math.PI * 2); ctx.fill(); } }
  }
  pill(P.test || 'TEST', (p0 + p1) / 2, py - 12, 0.2, D + 1, { size: 24 });
  pill(P.live || 'REAL SYSTEMS', 785, 795, 0.4, D + 1, { size: 22 });
  pill(P.wall || 'Walled off', wallX, feet - 280, tWall + 0.6, tScan - 0.4, { size: 28, accent: true });

  // ---------------- upper stage
  // phase A: personal data folder
  if (t < tHead + 0.4) {
    const a = K.popIn(t, 0.1, 0.45), out = K.fadeOut(t, tHead, 0.35);
    ctx.save(); ctx.globalAlpha = out; ctx.translate(487, 590); ctx.scale(a, a);
    H.roundRect(ctx, -300, -150, 160, 40, 12); ctx.fillStyle = '#e8c23a'; ctx.fill();
    H.roundRect(ctx, -300, -125, 600, 250, 18); ctx.fillStyle = '#f2d04f'; ctx.fill();
    H.roundRect(ctx, -280, -105, 560, 210, 12); ctx.fillStyle = '#f7f1df'; ctx.fill();
    for (let i = 0; i < 8; i++) {
      const cx = -210 + (i % 4) * 140, cy = -45 + Math.floor(i / 4) * 100;
      const lit = t >= tPers + i * 0.08 ? 1 : 0;
      const col = lit ? ['#5b6aa8', '#e8786a', '#4fb3a6', '#9a6ad0'][i % 4] : '#c3c9dc';
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx, cy - 8 + K.bob(t, 2, 0.6, i * 0.2) * lit, 18, 0, Math.PI * 2); ctx.fill();
      H.roundRect(ctx, cx - 28, cy + 14, 56, 28, 14); ctx.fill();
    }
    ctx.restore();
    pill(P.folder || 'Personal data', 487, 462, 0.4, tHead, { size: 28, accent: true });
  }
  pill(P.head || 'The advice', 487, 545, tHead, D + 1, { size: 30, accent: true });
  // phase C: code sheet + magnifier
  if (t >= tScan - 0.2) {
    const k = easeOutCubic(clamp((t - tScan + 0.2) / 0.5));
    const x0 = 115, y0 = lerp(620, 565, k), w = 490, lh = 26, top = 46, rowsN = 5;
    ctx.save(); ctx.globalAlpha = k;
    H.roundRect(ctx, x0, y0, w, rowsN * lh + 24 + top, 16); ctx.fillStyle = 'rgba(14,17,33,0.95)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke();
    if (t < tScan + 1.0) { ctx.fillStyle = '#8a92b8'; ctx.font = K.font.ui(22); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(P.code || 'app code', x0 + 24, y0 + 30); }
    const hitRow = 3, found = t >= tScan + 1.0, changed = t >= tChange;
    for (let r = 0; r < rowsN; r++) {
      const y = y0 + top + 10 + r * lh;
      if (r === hitRow && found) { H.roundRect(ctx, x0 + 12, y - 1, w - 24, lh - 2, 8); ctx.fillStyle = changed ? 'rgba(110,231,168,0.25)' : 'rgba(255,107,94,0.3)'; ctx.fill(); }
      ctx.fillStyle = '#5a6488'; ctx.font = K.font.ui(20); ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(String(r + 1), x0 + 44, y + lh / 2 - 2);
      const segs = [[60, 80, '#9a6ad0'], [150, 120 + ((r * 53) % 90), '#4fb3a6'], [300 + ((r * 31) % 60), 90, '#c3c9dc']];
      segs.forEach(([sx, sw, c]) => { if (r === hitRow && sx > 200) return; H.roundRect(ctx, x0 + sx, y + 6, Math.min(sw, w - 30 - sx), 12, 6); ctx.fillStyle = c; ctx.fill(); });
      if (r === hitRow) {
        const kx = x0 + 360, ky = y + lh / 2 - 2;
        const out = changed ? clamp((t - tChange) / 0.4) : 0, inn = changed ? K.popIn(t, tChange + 0.25, 0.4) : 0;
        if (out < 1) { ctx.save(); ctx.globalAlpha = 1 - out; drawKey(ctx, kx + out * 160, ky - out * 60, 0.62, out * 4, found ? '#ff6b5e' : '#c3c9dc', '#5a1f1a'); ctx.restore(); }
        if (inn > 0) drawKey(ctx, kx, ky, 0.62 * inn, (1 - inn) * -3, ACC, '#4a5a12');
      }
    }
    // magnifier sweeps down and settles on the hit row
    const sweep = K.phase(t, tScan + 0.1, tScan + 1.0);
    const my = y0 + top + 10 + lerp(0, hitRow, sweep) * lh + lh / 2, mx = x0 + 360 + Math.sin(sweep * Math.PI * 2) * 100;
    ctx.restore();
    if (k > 0.5 && t < tChange + 0.2) {
      ctx.save(); ctx.globalAlpha = K.fadeOut(t, tChange - 0.1, 0.3);
      ctx.strokeStyle = '#dfe4f1'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(mx, my, 36, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(200,230,255,0.12)'; ctx.fill();
      ctx.strokeStyle = '#9a6a46'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(mx + 26, my + 26); ctx.lineTo(mx + 62, my + 62); ctx.stroke();
      ctx.restore();
    }
    pill(P.scan || 'Exposed key found', x0 + 300, y0 + 44, tScan + 1.0, tChange - 0.1, { size: 26 });
    pill(P.changed || 'Key changed', x0 + 300, y0 + 44, tChange + 0.3, D + 1, { size: 28, accent: true });
  }
  ctx.restore();
}
