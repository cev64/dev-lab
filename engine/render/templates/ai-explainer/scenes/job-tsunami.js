// Scene "job-tsunami" (full frame). Dusk shore: ten generic workers stand on the sand while a big, slow wave builds
// behind them. Name chip at `nameCue`, a quote chip at `waveCue` (workers turn to look), the name/quote give way to an
// estimate pill at `estCue`, outcome chips land at their cues, then the big share counts up at `shareCue` and that
// share of the workers (4 of 10 for 40%) get accent rings. Ends settled.
// params (all optional): name (default "Economists warn"; a real person's name as plain text only),
//         quote (default "A big, slow wave of change"; pass a real quote only verbatim, in quotes, and attributed
//         via `name`), estimate (default "Estimate · over time"),
//         chips (default ["Augmented", "Downgraded", "Eliminated"], 1-3), share (default 40), unit (default "OF JOBS")
//         cues (narration words; else % of the scene): nameCue (8 %), waveCue (33 %), estCue (47 %),
//         chipCues [70 %, 76 %, 82 %], shareCue (87 %)
// Fits: "AI could affect X% of jobs", a big slow-moving change coming for workers.
// (Promoted from 2026-10-12 first-jobs; that story used nameCue "kristalina", waveCue "tsunami", estCue "estimates",
//  chipCues ["augment", "downgrade", "eliminate"], shareCue "forty".)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent;
  const cue = (w, fb) => { const v = w != null ? info.timeOf(w) : null; return v != null ? v : fb; };
  const nameAt = cue(P.nameCue, D * 0.08);
  const waveAt = cue(P.waveCue, D * 0.33);
  const estAt = cue(P.estCue, D * 0.47);
  const chips = P.chips || ['Augmented', 'Downgraded', 'Eliminated'];
  const chipCues = P.chipCues || [];
  const chipAt = chips.map((_, i) => cue(chipCues[i], D * (0.7 + i * 0.06)));
  const shareAt = cue(P.shareCue, D * 0.87);
  const share = P.share == null ? 40 : P.share;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 487, y: 745 }]);

  // sky + sun
  const sg = ctx.createLinearGradient(0, 0, 0, 900); sg.addColorStop(0, '#1b1f4a'); sg.addColorStop(0.6, '#5a4a86'); sg.addColorStop(1, '#d98a7a');
  ctx.fillStyle = sg; ctx.fillRect(-200, -200, 1480, 1100);
  K.glow(ctx, 760, 690, 260, '#ffd2a0', 0.35);
  ctx.beginPath(); ctx.arc(760, 700, 70, 0, Math.PI * 2); ctx.fillStyle = '#ffd9a8'; ctx.fill();
  // sea
  const seaY = 720;
  const og = ctx.createLinearGradient(0, seaY, 0, 900); og.addColorStop(0, '#2a3f86'); og.addColorStop(1, '#1a2558');
  ctx.fillStyle = og; ctx.fillRect(-200, seaY, 1480, 220);

  // the wave: grows slowly from the quote on
  const grow = K.phase(t, waveAt - 1.2, D, (k) => k);
  const hgt = lerp(30, 330, grow);
  const top = (x) => 880 - hgt * (0.35 + 0.65 * Math.exp(-Math.pow((x - 260) / 520, 2))) - 10 * Math.sin(x * 0.02 + t * 1.2);
  ctx.beginPath(); ctx.moveTo(-200, 900);
  for (let x = -200; x <= 1280; x += 20) ctx.lineTo(x, top(x));
  ctx.lineTo(1280, 900); ctx.closePath();
  const wg = ctx.createLinearGradient(0, 880 - hgt, 0, 900); wg.addColorStop(0, '#4f86e0'); wg.addColorStop(1, '#22409a');
  ctx.fillStyle = wg; ctx.fill();
  // foam line + streaks
  ctx.strokeStyle = 'rgba(235,245,255,0.85)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); for (let x = -200; x <= 1280; x += 20) { const y = top(x); if (x === -200) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke();
  ctx.strokeStyle = 'rgba(235,245,255,0.25)'; ctx.lineWidth = 4;
  for (let i = 0; i < 9; i++) { const x = ((i * 150 + t * 40) % 1400) - 150, y = top(x) + 30 + (i % 3) * 22; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 70, y + 4); ctx.stroke(); }
  // curl on the crest
  if (grow > 0.1) {
    const cx = 260, cy = top(260) + 40, r = 36 * clamp(grow * 1.5);
    ctx.strokeStyle = 'rgba(235,245,255,0.85)'; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(cx + r, cy, r, Math.PI, Math.PI * 2.3); ctx.stroke();
  }
  // sand
  const bg = ctx.createLinearGradient(0, 890, 0, 1920); bg.addColorStop(0, '#c9a77a'); bg.addColorStop(0.25, '#8d7356'); bg.addColorStop(1, '#2a2233');
  ctx.beginPath(); ctx.moveTo(-200, 900); for (let x = -200; x <= 1280; x += 40) ctx.lineTo(x, 895 + 6 * Math.sin(x * 0.01 + t * 0.8)); ctx.lineTo(1280, 2100); ctx.lineTo(-200, 2100); ctx.closePath(); ctx.fillStyle = bg; ctx.fill();

  // workers
  const back = [200, 360, 520, 680, 840].map((x, i) => ({ x, y: 940, s: 0.8, i }));
  const front = [120, 285, 450, 615, 780].map((x, i) => ({ x, y: 1035, s: 1.0, i: i + 5 }));
  const nHi = Math.round((share / 100) * 10);
  const hiOrder = [6, 3, 8, 0, 1, 9, 4, 5, 2, 7];
  const hi = new Set(hiOrder.slice(0, nHi));
  const hiP = K.phase(t, shareAt, shareAt + 0.6, H.easeOutBack);
  const lookWave = K.phase(t, waveAt, waveAt + 0.5);
  for (const w of [...back, ...front]) {
    const isHi = hi.has(w.i) && hiP > 0;
    if (isHi) {
      ctx.save(); ctx.translate(w.x, w.y); ctx.scale(1, 0.28);
      ctx.strokeStyle = ACC; ctx.lineWidth = 9; ctx.globalAlpha = clamp(hiP);
      ctx.beginPath(); ctx.arc(0, 0, 70 * w.s * clamp(hiP, 0, 1.2), 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      K.glow(ctx, w.x, w.y - 110 * w.s, 120 * w.s, ACC, 0.25 * clamp(hiP));
    }
    K.drawPerson(ctx, w.x, w.y, w.s * 1.15, {
      t, pose: 'stand', seed: w.i * 3 + 1, shirt: w.i % 5, skin: (w.i * 2) % 5, hair: (w.i * 3) % 5,
      hairStyle: ['short', 'long', 'curly', 'bun', 'short'][w.i % 5], look: -lookWave * (0.6 + 0.4 * ((w.i % 3) / 2)),
      mood: isHi ? 'worried' : (lookWave > 0.5 ? 'neutral' : 'happy'),
    });
  }
  ctx.restore(); // camera

  // overlays
  const np = K.popIn(t, nameAt, 0.45) * (1 - K.phase(t, estAt - 0.3, estAt + 0.1));
  if (np > 0.01) K.drawLabel(ctx, 487, 480, np, { text: P.name || 'Economists warn', size: 34, dot: true });
  const qp = K.popIn(t, waveAt - 0.4, 0.5) * (1 - K.phase(t, estAt - 0.3, estAt + 0.1));
  if (qp > 0.01) quoteChip(ctx, K, H, 487, 600, qp, P.quote || 'A big, slow wave of change', ACC);
  const ep = K.popIn(t, estAt, 0.45);
  if (ep > 0) K.drawLabel(ctx, 487, 480, ep, { text: P.estimate || 'Estimate · over time', size: 32, dot: true });
  // chips in a row
  ctx.save(); ctx.font = K.font.ui(30); ctx.letterSpacing = '1px';
  const widths = chips.map((c) => ctx.measureText(c).width + 30 * 1.4);
  ctx.restore();
  const gap = 16, total = widths.reduce((a, b) => a + b, 0) + gap * (chips.length - 1);
  let x = 487 - total / 2;
  chips.forEach((c, i) => {
    const cp = K.popIn(t, chipAt[i], 0.4);
    if (cp > 0) K.drawLabel(ctx, x + widths[i] / 2, 580, cp, { text: c, size: 30, accent: i === 0 });
    x += widths[i] + gap;
  });
  // big share
  const sp = K.popIn(t, shareAt - 0.1, 0.5);
  if (sp > 0) {
    const v = Math.round(share * K.phase(t, shareAt - 0.1, shareAt + 0.7, H.easeOutCubic));
    ctx.save(); ctx.translate(487, 700); ctx.scale(sp, sp);
    ctx.textBaseline = 'alphabetic';
    ctx.font = K.font.display(130); const s1 = v + '%'; const w1 = ctx.measureText(share + '%').width;
    ctx.font = K.font.display(44); const unit = P.unit || 'OF JOBS'; const w2 = ctx.measureText(unit).width;
    const tw = w1 + 24 + w2, x0 = -tw / 2;
    ctx.font = K.font.display(130); ctx.textAlign = 'left';
    ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(10,12,22,0.85)'; ctx.lineJoin = 'round';
    ctx.strokeText(s1, x0, 0); ctx.fillStyle = ACC; ctx.fillText(s1, x0, 0);
    ctx.font = K.font.display(44); ctx.strokeText(unit, x0 + w1 + 24, -8); ctx.fillStyle = '#ffffff'; ctx.fillText(unit, x0 + w1 + 24, -8);
    ctx.restore();
  }
}

function quoteChip(ctx, K, H, x, y, p, text, ACC) {
  ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
  let fs = 46; ctx.font = K.font.display(fs);
  while (fs > 28 && ctx.measureText(text).width > 750) { fs -= 2; ctx.font = K.font.display(fs); }
  const w = Math.min(820, ctx.measureText(text).width + 70);
  H.roundRect(ctx, -w / 2, -50, w, 100, 26); ctx.fillStyle = 'rgba(10,12,22,0.88)'; ctx.fill();
  ctx.fillStyle = ACC; ctx.fillRect(-w / 2 + 26, 36, w - 52, 5);
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 0);
  ctx.restore();
}
