// Scene "market-board" (full frame). A trading hall at dusk: a big quote board on the wall. First a jagged line
// slides down across the board (rushCue); at titleCue the board header flips to the market/date; each row pops in at its
// cue with a red down arrow and its figure counting up (e.g. "> 8%"); generic cartoon investors in front of the board
// turn worried, then hurry out to the right with briefcases. Ends settled (board full, floor empty but one).
// params: rows [{name, value ("> 8%", digits are counted up), cue}] (max 4), title, titleCue, rushCue,
//         note (small caption under the rows, e.g. "intraday lows"), board (header before titleCue, default "CHIP STOCKS")
// Fits: any "stocks / prices / index fell (or rose) by X" beat. Numbers only as published.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent;
  const RED = '#ff5d5d';
  const cue = (w, fb) => { const v = w != null ? info.timeOf(w) : null; return v != null ? v : fb; };
  const rows = (P.rows || [{ name: 'Stock A', value: '> 8%' }, { name: 'Stock B', value: '> 9%' }]).slice(0, 4);
  const rowAt = rows.map((r, i) => cue(r.cue, D * (0.35 + i * 0.15)));
  const titleAt = cue(P.titleCue, D * 0.2), rushAt = cue(P.rushCue, D * 0.1);
  const leaveAt = rowAt[rowAt.length - 1] + 0.6;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 487, y: 700 }, { t: D, zoom: 1.0, x: 487, y: 720 }]);
  // hall
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#0d1230'); g.addColorStop(0.5, '#18204a'); g.addColorStop(1, '#070915');
  ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, 2320);
  ctx.fillStyle = '#20295a'; ctx.fillRect(-200, 900, 1480, 12);
  ctx.fillStyle = '#10142c'; ctx.fillRect(-200, 912, 1480, 1200);
  for (let i = 0; i < 10; i++) { ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fillRect(-40 + i * 120, 912, 4, 400); }

  // board frame
  const bx = 95, by = 400, bw = 785, bh = 370;
  H.roundRect(ctx, bx - 14, by - 14, bw + 28, bh + 28, 20); ctx.fillStyle = '#05060f'; ctx.fill();
  H.roundRect(ctx, bx, by, bw, bh, 12); ctx.fillStyle = '#0d1126'; ctx.fill();
  // scanlines
  ctx.save(); H.roundRect(ctx, bx, by, bw, bh, 12); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.025)'; for (let y = by; y < by + bh; y += 6) ctx.fillRect(bx, y, bw, 2);
  // the sliding line (background of the board)
  const rp = K.phase(t, rushAt - 1.2, rushAt + 1.2);
  if (rp > 0) {
    const pts = [];
    for (let i = 0; i <= 24; i++) { const u = i / 24; pts.push([bx + 20 + u * (bw - 40), by + 150 + u * 240 + Math.sin(i * 2.3) * 22 * (1 - u * 0.3)]); }
    ctx.save(); ctx.strokeStyle = H.rgba(RED, 0.35); ctx.lineWidth = 6; ctx.lineJoin = 'round';
    K.pathDraw(ctx, pts, rp); ctx.restore();
  }
  ctx.restore();

  // header
  ctx.textBaseline = 'middle';
  const flip = K.phase(t, titleAt - 0.15, titleAt + 0.15);
  const head = flip < 0.5 ? String(P.board || 'CHIP STOCKS') : String(P.title || 'MARKET');
  ctx.save(); ctx.translate(bx + bw / 2, by + 46); ctx.scale(1, Math.abs(1 - 2 * flip) * 0.9 + 0.1);
  ctx.textAlign = 'center'; const hf = H.fitText(ctx, head, 'display', 46, 26, bw - 80); ctx.font = hf.font;
  ctx.fillStyle = flip < 0.5 ? '#ffffff' : ACC; ctx.fillText(head, 0, 0);
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(bx + 30, by + 82, bw - 60, 3);

  // rows
  const rowH = 76, ry0 = by + 128;
  rows.forEach((r, i) => {
    const p = K.popIn(t, rowAt[i] - 0.1, 0.45);
    if (p <= 0) return;
    const y = ry0 + i * rowH;
    ctx.save(); ctx.globalAlpha = clamp(p);
    ctx.translate(lerp(-60, 0, clamp(p)), 0);
    H.roundRect(ctx, bx + 24, y - 33, bw - 48, 66, 14); ctx.fillStyle = 'rgba(255,93,93,0.10)'; ctx.fill();
    ctx.textAlign = 'left'; ctx.fillStyle = '#ffffff'; const nf = H.fitText(ctx, String(r.name), 'bold', 40, 26, 400); ctx.font = nf.font;
    ctx.fillText(String(r.name), bx + 54, y + 2);
    // value with counted digits
    const v = String(r.value || '');
    const m = v.match(/^(.*?)(\d+(?:\.\d+)?)(.*)$/);
    const k = K.phase(t, rowAt[i], rowAt[i] + 0.9, H.easeOutCubic);
    let shown = v;
    if (m) { const dec = (m[2].split('.')[1] || '').length; shown = m[1] + (parseFloat(m[2]) * k).toFixed(dec) + m[3]; }
    ctx.textAlign = 'right'; ctx.font = K.font.display(48); ctx.fillStyle = RED; ctx.fillText(shown, bx + bw - 54, y + 4);
    const vw = ctx.measureText(v).width;
    // falling arrow
    const ax = bx + bw - 54 - vw - 46, drop = Math.sin(clamp((t - rowAt[i]) / 0.6) * Math.PI) * 10;
    ctx.save(); ctx.translate(ax, y + drop); ctx.scale(0.85, 0.85);
    ctx.beginPath(); ctx.moveTo(-10, -26); ctx.lineTo(10, -26); ctx.lineTo(10, 2); ctx.lineTo(24, 2); ctx.lineTo(0, 30); ctx.lineTo(-24, 2); ctx.lineTo(-10, 2); ctx.closePath();
    ctx.fillStyle = RED; ctx.fill(); ctx.restore();
    ctx.restore();
  });
  if (P.note && t > rowAt[rowAt.length - 1]) {
    ctx.globalAlpha = K.phase(t, rowAt[rowAt.length - 1], rowAt[rowAt.length - 1] + 0.5);
    ctx.font = K.font.ui(28); ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(String(P.note), bx + bw / 2, by + bh - 24); ctx.globalAlpha = 1;
  }
  K.glow(ctx, bx + bw / 2, by + bh / 2, 420, RED, 0.05 + 0.04 * Math.sin(t * 2));

  // investors in front of the board
  const crowd = [
    { x: 170, skin: 0, hair: 1, shirt: 0, hs: 'short', leave: 0 },
    { x: 360, skin: 2, hair: 0, shirt: 4, hs: 'long', leave: 0.5 },
    { x: 600, skin: 4, hair: 4, shirt: 1, hs: 'curly', leave: 0.25 },
    { x: 800, skin: 1, hair: 2, shirt: 3, hs: 'bun', leave: -1 },
  ];
  crowd.forEach((c, i) => {
    const worried = t > rowAt[0];
    const go = c.leave >= 0 ? Math.max(0, t - leaveAt - c.leave) : 0;
    const x = c.x + go * 260;
    if (x > 1200) return;
    const pose = go > 0 ? 'stand' : (worried ? (i === 3 ? 'shrug' : 'stand') : 'point');
    const mood = worried ? (i % 2 ? 'shocked' : 'worried') : 'neutral';
    K.drawPerson(ctx, x, 1045, 1.0, { t, pose, mood, walk: go > 0 ? go : undefined, look: -0.4, skin: c.skin, hair: c.hair, shirt: c.shirt, hairStyle: c.hs, seed: i * 5 });
    if (go > 0) K.drawBriefcase(ctx, x + 26, 960, 0.3, {});
  });
  ctx.restore();
}
