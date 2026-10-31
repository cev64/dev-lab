// Scene "order-flood" (full frame). A night delivery hub with two ways in. Left: a big glowing "App orders" chute
// pours a non-stop torrent of paper takeout bags onto a growing mountain. Right: a tiny dusty "AI agents" hatch with a
// cobweb and an empty pickup shelf under it; the kit robot waits beside it, and now and then a single bag plops out.
// modes:
//   hook  (cold open, ~3-4 s): the torrent is already flowing at frame 0; one lonely bag drops from the hatch at ~1.4 s.
//   count (~10-12 s): same hub; a counter panel over the chute counts up to `big` (with a date pill), a panel over the
//         hatch shows `small` (text, e.g. "Several hundred") with its own sub pill, then a "vs" chip and a closing pill.
// Fits: "a huge number vs a tiny one", "everyone uses A, almost nobody uses B", adoption that hasn't happened yet.
// params: mode, left ("App orders"), right ("AI agents"), big (1000000), bigText ("1 million"), bigSub ("Last quarter"),
//         small ("Several hundred"), smallSub ("In total, so far"), closer ("Not even close"),
//         cues ("word#n"; without them fractions): countCue, countEndCue, dateCue, smallCue, closerCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba, hash } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const mode = P.mode || 'hook';
  const count = mode === 'count';
  const tCount = at(P.countCue, D * 0.45) - 0.2;
  const tCountEnd = Math.max(tCount + 0.6, at(P.countEndCue, tCount + 1.6));
  const tDate = at(P.dateCue, D * 0.2) - 0.15;
  const tSmall = at(P.smallCue, D * 0.72) - 0.2;
  const tCloser = at(P.closerCue, D * 0.85) - 0.2;
  const feet = 1030;

  ctx.save();
  if (count) K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.04, x: 487, y: 745 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 470, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 735 }]);

  // ---- setting: warehouse wall + floor ----
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#141a33'); g.addColorStop(0.5, '#1d2547'); g.addColorStop(1, '#0d1124');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  // wall panels
  for (let i = 0; i < 7; i++) { ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.08)'; ctx.fillRect(i * 160, 0, 160, 1000); }
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let y = 300; y < 1000; y += 120) ctx.fillRect(0, y, 1080, 3);
  // floor
  ctx.fillStyle = '#10142a'; ctx.fillRect(0, 1000, 1080, 920);
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, 1000, 1080, 4);
  for (let i = -6; i < 14; i++) { ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(540 + i * 40, 1004); ctx.lineTo(540 + i * 140, 1920); ctx.stroke(); }
  // hanging lamps
  for (const lx of [300, 760]) {
    ctx.strokeStyle = '#3a4270'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, 330); ctx.stroke();
    ctx.fillStyle = '#2c3360'; ctx.beginPath(); ctx.moveTo(lx - 40, 360); ctx.lineTo(lx + 40, 360); ctx.lineTo(lx + 18, 330); ctx.lineTo(lx - 18, 330); ctx.closePath(); ctx.fill();
    K.glow(ctx, lx, 380, lx < 500 ? 330 : 200, '#fff1c4', lx < 500 ? 0.12 : 0.05);
  }

  // ---- left: the big app chute ----
  const mx = 205, my = 610;                 // chute mouth
  // chute body coming down from the top-left
  ctx.save();
  ctx.fillStyle = '#39427a';
  ctx.beginPath(); ctx.moveTo(70, 300); ctx.lineTo(230, 300); ctx.lineTo(290, 560); ctx.lineTo(290, 660); ctx.lineTo(120, 660); ctx.lineTo(70, 520); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2b3263'; ctx.fillRect(120, 640, 170, 22);
  ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.shadowColor = ACC; ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.moveTo(120, 662); ctx.lineTo(290, 662); ctx.stroke();
  ctx.restore();
  K.glow(ctx, 205, 680, 170, ACC, 0.22 + 0.05 * Math.sin(t * 6));
  // rivets
  for (let i = 0; i < 4; i++) { ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(110 + i * 45, 330, 5, 0, Math.PI * 2); ctx.fill(); }

  // the mountain of bags (static stack, grows a little in count mode)
  const grow = count ? 0.75 + 0.25 * smooth(clamp((t - tCount) / Math.max(0.6, tCountEnd - tCount))) : 0.7 + 0.04 * clamp(t / D);
  const pileCx = 300, pileW = 420, pileH = 300 * grow;
  K.shadow(ctx, pileCx, 1010, pileW * 1.05);
  for (let row = 0; row < 7; row++) {
    const yRow = 1005 - row * 46;
    const half = (pileW / 2) * (1 - (1005 - yRow) / (pileH + 40));
    if (half < 30 || 1005 - yRow > pileH) continue;
    const n = Math.max(1, Math.floor((half * 2) / 62));
    for (let i = 0; i < n; i++) {
      const x = pileCx - half + (i + 0.5) * (half * 2 / n) + (hash(row, i) - 0.5) * 14;
      bag(ctx, x, yRow, 0.62, (hash(i, row + 7) - 0.5) * 0.5, H, ACC, hash(row + 3, i));
    }
  }
  // torrent: bags flying out of the mouth (deterministic stream)
  const rate = 11, flight = 0.75;
  const k0 = Math.floor((t - 0.2) * rate) - 1, k1 = Math.floor((t + 0.6) * rate) + 1;
  for (let k = k0; k <= k1; k++) {
    const born = k / rate, age = t - born + 0.6;     // +0.6: already mid-air at frame 0
    if (age < 0 || age > flight) continue;
    const vx = 220 + 330 * hash(k, 1), vy = -60 + 120 * hash(k, 2);
    const x = mx + vx * age, y = my + 40 + vy * age + 0.5 * 1500 * age * age;
    const landY = 1005 - pileH * (1 - Math.abs(x - pileCx) / (pileW / 2 + 40)) * 0.9;
    if (y > landY + 10) continue;
    bag(ctx, x, y, 0.6, (age * 5 + hash(k, 3) * 6) * (hash(k, 4) > 0.5 ? 1 : -1), H, ACC, hash(k, 5));
  }
  // speed streaks at the mouth
  for (let i = 0; i < 5; i++) {
    const u = ((t * 2.2 + i / 5) % 1);
    ctx.strokeStyle = rgba('#ffffff', 0.25 * (1 - u)); ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(150 + i * 28, 668 + u * 40); ctx.lineTo(150 + i * 28, 690 + u * 60); ctx.stroke();
  }

  // ---- right: the tiny AI agents hatch ----
  const hx = 700, hy = 640, hw = 130, hh = 100;
  roundRect(ctx, hx - hw / 2 - 12, hy - hh / 2 - 12, hw + 24, hh + 24, 14); ctx.fillStyle = '#2a3058'; ctx.fill();
  roundRect(ctx, hx - hw / 2, hy - hh / 2, hw, hh, 10); ctx.fillStyle = '#151a33'; ctx.fill();
  // flap
  const tDrop = count ? D * 0.62 : 1.25;
  const flap = clamp(1 - Math.abs(t - tDrop) / 0.35);
  ctx.save(); ctx.translate(hx, hy - hh / 2); ctx.scale(1, 1 - 0.7 * flap);
  roundRect(ctx, -hw / 2, 0, hw, hh, 8); ctx.fillStyle = '#4a5288'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.fillRect(-hw / 2 + 14, hh - 24, hw - 28, 6);
  ctx.restore();
  // cobweb in the corner
  ctx.save(); ctx.strokeStyle = 'rgba(220,226,245,0.45)'; ctx.lineWidth = 1.6;
  const cx0 = hx + hw / 2 + 10, cy0 = hy - hh / 2 - 10;
  for (let a = 0; a < 5; a++) { const an = Math.PI / 2 + (a / 4) * (Math.PI / 2); ctx.beginPath(); ctx.moveTo(cx0, cy0); ctx.lineTo(cx0 + Math.cos(an) * 60, cy0 + Math.sin(an) * 60); ctx.stroke(); }
  for (let r = 1; r <= 3; r++) { ctx.beginPath(); ctx.arc(cx0, cy0, r * 18, Math.PI / 2, Math.PI); ctx.stroke(); }
  ctx.restore();
  // the robot waiting next to an empty pickup shelf
  const got = t > tDrop + 0.45;
  const RX = 845, RS = 0.95;
  K.drawRobot(ctx, RX, feet, RS, { t, state: got ? 'happy' : 'idle', seed: 3 });
  const trayY = 860, SX = hx;
  ctx.fillStyle = '#c9cfdf'; roundRect(ctx, SX - 80, trayY, 160, 14, 6); ctx.fill();
  ctx.fillStyle = '#9aa3bd'; ctx.fillRect(SX - 60, trayY + 14, 10, 146); ctx.fillRect(SX + 50, trayY + 14, 10, 146);
  // the single bag: slides out and drops onto the tray
  const u = clamp((t - tDrop) / 0.5);
  if (t > tDrop - 0.05) {
    const bx = SX, by = u < 1 ? lerp(hy + 50, trayY, u * u) : trayY;
    bag(ctx, bx, by + 2, 0.5, (1 - u) * 0.4, H, ACC, 0.3);
    if (u >= 1 && t < tDrop + 1.1) {        // little "1" pop
      const pk = K.popIn(t, tDrop + 0.5, 0.35) * (1 - clamp((t - tDrop - 0.9) / 0.2));
      if (pk > 0) { ctx.save(); ctx.globalAlpha = pk; ctx.font = H.font('display', 40); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.fillText('+1', SX + 70, trayY - 50 - 20 * pk); ctx.restore(); }
    }
  }
  if (!count) {
    // waiting dots over the robot
    const dots = Math.floor(t * 3) % 4;
    if (!got) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; for (let i = 0; i < dots; i++) { ctx.beginPath(); ctx.arc(RX - 24 + i * 24, feet - 255 * RS, 7, 0, Math.PI * 2); ctx.fill(); } }
  }

  // ---- labels ----
  const lp = count ? Math.min(1.05, K.popIn(t, 0.0, 0.35)) : 1;
  if (!count) {
    K.drawLabel(ctx, 300, 470, lp, { text: P.left || 'App orders', size: 34, accent: true, dot: true });
    K.drawLabel(ctx, hx, 540, lp, { text: P.right || 'AI agents', size: 30 });
  } else {
    // small name pills on the objects
    K.drawLabel(ctx, 205, 720, lp, { text: P.left || 'App orders', size: 26, accent: true });
    K.drawLabel(ctx, hx, 720, lp, { text: P.right || 'AI agents', size: 26 });
  }
  ctx.restore(); // camera

  if (!count) return;

  // ---- count mode: the two figures (screen space, inside the stage) ----
  // left panel: big counter
  const pk = K.popIn(t, Math.min(tDate, tCount) - 0.1, 0.45);
  if (pk > 0) {
    ctx.save(); ctx.translate(290, 500); ctx.scale(Math.min(1.03, pk), Math.min(1.03, pk));
    roundRect(ctx, -205, -78, 410, 156, 24); ctx.fillStyle = 'rgba(10,12,24,0.88)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.7); ctx.stroke();
    const cu = smooth(clamp((t - tCount) / Math.max(0.6, tCountEnd - tCount)));
    const big = Number(P.big || 1000000);
    const val = t < tCount ? 0 : Math.round(big * cu);
    const txt = cu >= 1 ? String(P.bigText || '1 million') : val.toLocaleString('en-US');
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
    ctx.font = H.font('display', H.fitText(ctx, txt, 'display', 60, 30, 370)); ctx.fillText(txt, 0, -14);
    ctx.font = H.font('ui', 26); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillText('orders completed', 0, 44);
    ctx.restore();
  }
  const dp = K.popIn(t, tDate, 0.4);
  if (dp > 0) K.drawLabel(ctx, 290, 618, Math.min(1.05, dp), { text: P.bigSub || 'Last quarter', size: 26, dot: true });
  // right panel: the small figure
  const sp = K.popIn(t, tSmall, 0.45);
  if (sp > 0) {
    ctx.save(); ctx.translate(730, 500); ctx.scale(Math.min(1.03, sp), Math.min(1.03, sp));
    roundRect(ctx, -150, -78, 300, 156, 24); ctx.fillStyle = 'rgba(10,12,24,0.88)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
    const s = String(P.small || 'Several hundred');
    const lines = H.wrap(ctx, s, 'display', 40, 260);
    ctx.font = H.font('display', 40);
    lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, 0, -30 + i * 44 - (lines.length > 1 ? 0 : -14)));
    ctx.font = H.font('ui', 24); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillText(P.smallSub || 'In total, so far', 0, 56);
    ctx.restore();
  }
  // "vs" chip between them
  const vp = K.popIn(t, tSmall + 0.25, 0.35);
  if (vp > 0) {
    ctx.save(); ctx.translate(530, 500); ctx.scale(Math.min(1.05, vp), Math.min(1.05, vp));
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#10142a'; ctx.font = H.font('display', 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('vs', 0, 2);
    ctx.restore();
  }
  // closer pill
  const cp = K.popIn(t, tCloser, 0.45);
  if (cp > 0) K.drawLabel(ctx, 600, 778, Math.min(1.05, cp), { text: P.closer || 'Not even close', size: 34, accent: true });
}

// paper takeout bag anchored at its bottom centre; v = variation 0..1 (sticker colour / size)
function bag(ctx, x, y, s, rot, H, ACC, v) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * (0.92 + 0.16 * v), s * (0.92 + 0.16 * v));
  const w = 90, h = 104;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, 2, w * 0.55, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = v > 0.5 ? '#d9b07a' : '#cfa269';
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2 + 6, -h); ctx.lineTo(w / 2 - 6, -h); ctx.lineTo(w / 2, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(w / 2 - 22, -h, 16, h);
  // folded top
  ctx.fillStyle = '#e8c58f'; ctx.fillRect(-w / 2 + 6, -h - 16, w - 12, 18);
  ctx.strokeStyle = '#9c7444'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-w / 2 + 6, -h + 2); ctx.lineTo(w / 2 - 6, -h + 2); ctx.stroke();
  // sticker
  ctx.fillStyle = v > 0.66 ? ACC : v > 0.33 ? '#ffffff' : '#7fb3ff';
  H.roundRect(ctx, -18, -h * 0.62, 36, 26, 6); ctx.fill();
  ctx.restore();
}
