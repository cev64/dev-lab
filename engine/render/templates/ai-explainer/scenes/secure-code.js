// Scene "secure-code" (full frame, one beat). Night lab: the kit robot scans a big code panel with a beam; three bug
// markers pop on lines, each with a named-flaw chip under the panel ("Code injection" / "Memory safety" /
// "Access control"); on fixCue the bugs turn into green ticks and the chips get ticks; on hiCue one chip lights in the
// accent colour. A "Works + secure?" pill pops on leapCue. No numbers. Ends settled.
// Fits: "the model's code is checked for security, not just whether it runs", secure coding, code review bots.
// params: leap, chips [3], cues leapCue scanCue fixCue hiCue (+ hiIndex, default 0). Cues are narration words
//         ("word#n" = (n+1)th time spoken) or numbers (scene seconds); else fixed fractions.
const DANGER = '#ff6b5e', GOOD = '#5be38a';

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp } = H;
  const at = (w, d) => {
    if (w == null || w === '') return d;
    if (typeof w === 'number') return w;
    const m = String(w).match(/^(.*)#(\d+)$/);
    const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? d : v;
  };
  const tLeap = at(P.leapCue, D * 0.12) - 0.3, tScan = at(P.scanCue, D * 0.3) - 0.3;
  const tFix = at(P.fixCue, D * 0.6) - 0.2, tHi = at(P.hiCue, D * 0.75) - 0.2;
  const chips = (P.chips || ['Code injection', 'Memory safety', 'Access control']).slice(0, 3);
  const hiIndex = P.hiIndex == null ? 0 : P.hiIndex;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 500, y: 740 }]);
  K.world.room(ctx, { t, time: 'night', floorY: 1000, window: false, lamp: false, picture: false, plant: false });
  ctx.fillStyle = 'rgba(5,7,16,0.30)'; ctx.fillRect(0, 0, 1080, 1920);

  // code panel
  const X0 = 400, X1 = 900, Y0 = 520, Y1 = 830;
  H.roundRect(ctx, X0, Y0, X1 - X0, Y1 - Y0, 20); ctx.fillStyle = '#0b0e1d'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(160,180,255,0.25)'; ctx.stroke();
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(X0 + 28 + i * 24, Y0 + 24, 7, 0, Math.PI * 2); ctx.fillStyle = ['#ff6b5e', '#ffcf5a', '#5be38a'][i]; ctx.fill(); }
  const rows = 8, rowH = 30, bugRows = [1, 4, 6];
  const sweepDur = Math.max(1.5, (tFix - tScan) * 0.85);
  const sweep = clamp((t - tScan) / sweepDur);
  const foundAt = bugRows.map((r) => tScan + (r + 0.5) / rows * sweepDur);
  for (let r = 0; r < rows; r++) {
    const y = Y0 + 56 + r * rowH, ind = (r % 3) * 26;
    const w1 = 80 + 160 * H.hash(r, 3), w2 = 60 + 120 * H.hash(r, 5);
    H.roundRect(ctx, X0 + 30 + ind, y, w1, 12, 6); ctx.fillStyle = r % 2 ? '#5b8cff' : '#9aa6d6'; ctx.fill();
    H.roundRect(ctx, X0 + 44 + ind + w1, y, w2, 12, 6); ctx.fillStyle = '#c47bff'; ctx.globalAlpha = 0.75; ctx.fill(); ctx.globalAlpha = 1;
    const bi = bugRows.indexOf(r);
    if (bi < 0 || t < foundAt[bi]) continue;
    const bx = X1 - 50, by = y + 6, tf = tFix + bi * 0.25;
    if (t < tf) {
      const k = Math.min(1.05, K.popIn(t, foundAt[bi], 0.3));
      ctx.save(); ctx.translate(bx, by); ctx.scale(k, k);
      H.roundRect(ctx, -(X1 - X0) + 70, -16, (X1 - X0) - 90, 32, 8); ctx.fillStyle = H.rgba(DANGER, 0.18); ctx.fill();
      bug(ctx, t + r);
      ctx.restore();
    } else {
      const fk = Math.min(1.05, K.popIn(t, tf, 0.35));
      ctx.save(); ctx.translate(bx, by); ctx.scale(fk, fk); tick(ctx); ctx.restore();
    }
  }

  // robot + beam
  const rx = 262, ry = 1035;
  const scanning = t > tScan && t < tScan + sweepDur + 0.2;
  K.glow(ctx, rx, ry - 160, 170, ACC, 0.2);
  K.drawRobot(ctx, rx, ry, 1.25, { t, state: scanning ? 'working' : t > tFix ? 'happy' : 'thinking', seed: 11 });
  if (scanning) {
    const by = Y0 + 56 + sweep * rows * rowH;
    ctx.save(); ctx.globalAlpha = 0.26;
    ctx.beginPath(); ctx.moveTo(rx + 40, ry - 245); ctx.lineTo(X0 + 4, by - 26); ctx.lineTo(X0 + 4, by + 26); ctx.closePath();
    ctx.fillStyle = ACC; ctx.fill(); ctx.restore();
    ctx.fillStyle = H.rgba(ACC, 0.55); ctx.fillRect(X0 + 6, by - 2, X1 - X0 - 12, 4);
  }

  // pill over the panel
  const lp = K.popIn(t, tLeap, 0.45);
  if (lp > 0) K.drawLabel(ctx, 650, 485, Math.min(1.05, lp), { text: String(P.leap || 'Works + secure?'), size: 30, accent: true });

  // flaw chips under the panel, one per bug
  chips.forEach((c, i) => {
    const k = K.popIn(t, foundAt[i] + 0.1, 0.4);
    if (k <= 0) return;
    const fixed = t > tFix + i * 0.25, hi = t > tHi && i === hiIndex;
    const cx = 650, cy = 900 + i * 62;
    ctx.save(); ctx.translate(cx, cy); const s = Math.min(1.05, k); ctx.scale(s, s);
    ctx.font = H.font('ui', 28);
    const w = ctx.measureText(c).width + 100, h = 50;
    if (hi) K.glow(ctx, 0, 0, 160, ACC, 0.25);
    H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = hi ? ACC : 'rgba(10,12,22,0.9)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = hi ? ACC : fixed ? H.rgba(GOOD, 0.7) : H.rgba(DANGER, 0.7); ctx.stroke();
    ctx.save(); ctx.translate(-w / 2 + 30, 0);
    if (fixed) { ctx.scale(0.75, 0.75); tick(ctx); } else { ctx.scale(0.75, 0.75); bug(ctx, t + i); }
    ctx.restore();
    ctx.fillStyle = hi ? K.ACCENT.deep : '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(c, -w / 2 + 60, 1);
    ctx.restore();
  });
  ctx.restore();

  function bug(c, tt) {
    c.save(); c.rotate(Math.sin(tt * 6) * 0.12);
    c.strokeStyle = DANGER; c.lineWidth = 3; c.lineCap = 'round';
    for (const sy of [-6, 2, 10]) { c.beginPath(); c.moveTo(-10, sy); c.lineTo(-20, sy - 4); c.moveTo(10, sy); c.lineTo(20, sy - 4); c.stroke(); }
    c.beginPath(); c.ellipse(0, 3, 11, 14, 0, 0, Math.PI * 2); c.fillStyle = DANGER; c.fill();
    c.beginPath(); c.arc(0, -13, 7, 0, Math.PI * 2); c.fillStyle = '#c94a40'; c.fill();
    c.restore();
  }
  function tick(c) {
    c.beginPath(); c.arc(0, 0, 17, 0, Math.PI * 2); c.fillStyle = GOOD; c.fill();
    c.strokeStyle = '#0d2a18'; c.lineWidth = 5; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-8, 0); c.lineTo(-2, 7); c.lineTo(9, -7); c.stroke();
  }
}
