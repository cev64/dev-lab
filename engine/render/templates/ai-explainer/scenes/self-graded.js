// Scene "self-graded" (full frame). A night race track: three generic robots with plain-text labels run toward a
// finish line; the first one (the claimant) crosses and cheers. Then the judge's booth sign lights up showing who did the
// judging (judgeCue) with a "?" bubble, and a document with an hourglass pops (reportCue).
// Fits: "the company's own benchmarks say it wins", "not independently verified", "report still to come".
// params (all optional): me (winner label, default "Meta"), rivals [2 labels], judge (booth sign text),
//                        report (document pill text, '' hides), raceCue, judgeCue, reportCue (else 10% / 50% / 75%)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic, easeInOutCubic, roundRect, mixHex } = H;
  const D = info.duration, ACC = info.accent;
  const tw = (w, f) => { const v = w ? info.timeOf(w) : null; return v != null ? v : D * f; };
  const tRace = tw(P.raceCue, 0.1), tJudge = tw(P.judgeCue, 0.5), tRep = tw(P.reportCue, 0.75);
  const rivals = P.rivals || ['Rival 1', 'Rival 2'];

  // ---- set
  const sky = ctx.createLinearGradient(0, 0, 0, 1920);
  sky.addColorStop(0, '#0a0c1e'); sky.addColorStop(0.45, '#1a2048'); sky.addColorStop(1, '#090b16');
  ctx.fillStyle = sky; ctx.fillRect(0, 0, 1080, 1920);
  // stadium lights
  for (const lx of [150, 930]) {
    ctx.fillStyle = '#2a2f55'; ctx.fillRect(lx - 6, 330, 12, 560);
    roundRect(ctx, lx - 60, 310, 120, 40, 8); ctx.fillStyle = '#3b4260'; ctx.fill();
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(lx - 42 + i * 28, 330, 10, 0, Math.PI * 2); ctx.fillStyle = '#fff7d6'; ctx.fill(); }
    K.glow(ctx, lx, 330, 160, '#fff7d6', 0.25);
  }
  // crowd stands
  ctx.fillStyle = '#20264a'; ctx.fillRect(0, 760, 1080, 130);
  for (let i = 0; i < 46; i++) {
    const x = 12 + i * 23.5, y = 790 + (i % 3) * 30 + Math.sin(t * 5 + i) * (t > tRace + 1.4 ? 4 : 1.5);
    ctx.beginPath(); ctx.arc(x, y, 9, 0, Math.PI * 2); ctx.fillStyle = H.hash(i, 4) > 0.5 ? '#3a4275' : '#2e3563'; ctx.fill();
  }
  // track
  const tr = ctx.createLinearGradient(0, 890, 0, 1080);
  tr.addColorStop(0, '#9c4a3c'); tr.addColorStop(1, '#7a362b');
  ctx.fillStyle = tr; ctx.fillRect(0, 890, 1080, 200);
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; for (const ly of [940, 990]) ctx.fillRect(0, ly, 1080, 4);
  // finish line (checkered)
  const fx = 700;
  for (let r = 0; r < 10; r++) for (let c = 0; c < 2; c++) { ctx.fillStyle = (r + c) % 2 ? '#111' : '#f2f4fa'; ctx.fillRect(fx + c * 14, 890 + r * 19, 14, 19); }

  // ---- runners: progress along the track
  const runP = (finishAt, endX) => {
    const u = H.phase(t, 0, finishAt, H.easeOutCubic);
    return lerp(endX - 420, endX, u);
  };
  const tWin = tRace + 0.9;
  const runners = [
    { label: rivals[0] || 'Rival 1', feet: 935, s: 0.78, x: runP(tWin + 0.9, 540), seed: 12, done: tWin + 0.9 },
    { label: P.me || 'Meta', feet: 985, s: 0.9, x: runP(tWin, 790), seed: 4, done: tWin, me: true },
    { label: rivals[1] || 'Rival 2', feet: 1040, s: 1.0, x: runP(tWin + 1.2, 330), seed: 13, done: tWin + 1.2 },
  ];
  for (const r of runners) {
    const moving = t < r.done;
    const hop = moving ? Math.abs(Math.sin(t * 11 + r.seed)) * 14 : 0;
    K.drawRobot(ctx, r.x, r.feet - hop, r.s, { t, state: r.me && !moving ? 'happy' : moving ? 'working' : 'thinking', seed: r.seed });
    if (moving) for (let k = 1; k <= 3; k++) { ctx.fillStyle = `rgba(255,255,255,${0.18 / k})`; ctx.fillRect(r.x - 70 * r.s - k * 26, r.feet - 120 * r.s + k * 8, 40, 5); }
    const lp = K.popIn(t, 0.2, 0.4);
    if (lp > 0) K.drawLabel(ctx, r.x, r.feet - 235 * r.s, lp, { text: r.label, size: 26, accent: !!r.me });
  }
  // win burst
  const wb = H.phase(t, tWin, tWin + 0.7);
  if (wb > 0 && wb < 1) {
    ctx.save(); ctx.strokeStyle = H.rgba(ACC, 1 - wb); ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r0 = 90 + 80 * wb; ctx.beginPath(); ctx.moveTo(790 + Math.cos(a) * r0, 870 + Math.sin(a) * r0); ctx.lineTo(790 + Math.cos(a) * (r0 + 26), 870 + Math.sin(a) * (r0 + 26)); ctx.stroke(); }
    ctx.restore();
  }

  // ---- judge's booth (top right) with a sign that lights up on the judge cue
  const bx = 735, bw = 330, by = 430, bh = 150;
  roundRect(ctx, bx - bw / 2, by, bw, bh, 18); ctx.fillStyle = '#2a2f55'; ctx.fill();
  ctx.fillStyle = '#1c2040'; ctx.fillRect(bx - bw / 2 + 20, by + bh - 10, 16, 340); ctx.fillRect(bx + bw / 2 - 36, by + bh - 10, 16, 340);
  ctx.font = H.font('ui', 24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#9aa3c8';
  ctx.fillText('JUDGES', bx, by + 30);
  const jp = H.phase(t, tJudge, tJudge + 0.5);
  if (jp > 0) K.glow(ctx, bx, by + 95, 260, ACC, 0.4 * jp);
  roundRect(ctx, bx - bw / 2 + 18, by + 56, bw - 36, 78, 14); ctx.fillStyle = mixHex('#151933', ACC, jp); ctx.fill();
  if (jp > 0) {
    const txt = P.judge || 'Self-graded';
    const fs = H.fitText(ctx, txt, 'display', 34, 22, bw - 60).size;
    ctx.save(); ctx.globalAlpha = jp; ctx.font = H.font('display', fs); ctx.fillStyle = K.ACCENT.deep; ctx.fillText(txt, bx, by + 97); ctx.restore();
  }
  // "?" bubble
  const qp = K.popIn(t, tJudge + 0.5, 0.45);
  if (qp > 0) K.drawSpeechBubble(ctx, 530, 640 + K.bob(t, 4, 0.6), 1, { text: '?', size: 44, tail: 'right', pop: qp });

  // ---- report document with hourglass (top left)
  const rp = P.report === '' ? 0 : K.popIn(t, tRep, 0.5);
  if (rp > 0) {
    ctx.save(); ctx.translate(230, 640); ctx.scale(rp, rp); ctx.rotate(-0.06);
    K.drawDocument(ctx, 0, 0, 1.0, { lines: 5, title: true });
    ctx.restore();
    // hourglass, flips slowly
    const hx = 330, hy = 560, rot = Math.PI * smooth(((t - tRep) % 2.2) / 0.5 - 3);
    ctx.save(); ctx.translate(hx, hy); ctx.scale(rp, rp); ctx.rotate(rot);
    ctx.fillStyle = '#c9a646'; ctx.fillRect(-30, -44, 60, 8); ctx.fillRect(-30, 36, 60, 8);
    ctx.beginPath(); ctx.moveTo(-24, -36); ctx.lineTo(24, -36); ctx.lineTo(4, 0); ctx.lineTo(24, 36); ctx.lineTo(-24, 36); ctx.lineTo(-4, 0); ctx.closePath();
    ctx.fillStyle = 'rgba(220,235,255,0.85)'; ctx.fill();
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(-14, 36); ctx.lineTo(14, 36); ctx.lineTo(0, 16); ctx.closePath(); ctx.fill();
    ctx.restore();
    K.drawLabel(ctx, 250, 720, rp, { text: P.report || 'Report: coming', size: 28, dot: true });
  }
}
