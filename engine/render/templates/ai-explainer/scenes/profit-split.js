// Scene "profit-split" (full frame). Factory floor at night: coins ride a conveyor into a sorting machine that drops
// each one either into a big PROFIT jar or a COSTS bin (share = margin). At splitCue the jar's percentage counts up.
// At beatCue a forecast pill ("Analysts expected ...") pops at the top and a BEAT stamp lands on it. At hpcCue the
// top panel turns into a donut: the published share of sales from one segment, with its label.
// params: margin (0..1, default 0.511), marginText ("51.1%"), jar ("PROFIT"), bin ("COSTS"), forecast (pill text),
//         stamp ("BEAT"), share (0..1), shareText, shareLabel, shareSub, cues: splitCue (10 %), beatCue (35 %), hpcCue (60 %)
// Fits: "half of every dollar is profit", margins, "X% of sales came from Y" beats. Numbers as published.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent;
  const cue = (w, fb) => { const v = w != null ? info.timeOf(w) : null; return v != null ? v : fb; };
  const splitAt = cue(P.splitCue, D * 0.1), beatAt = cue(P.beatCue, D * 0.35), hpcAt = cue(P.hpcCue, D * 0.6);
  const margin = P.margin != null ? +P.margin : 0.511;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 780 }, { t: D, zoom: 1.0, x: 487, y: 735 }]);
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#141032'); g.addColorStop(0.5, '#241b4d'); g.addColorStop(1, '#0a0817');
  ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, 2320);
  for (let i = 0; i < 8; i++) { ctx.fillStyle = 'rgba(255,255,255,0.035)'; ctx.fillRect(-60 + i * 160, 380, 70, 600); }
  ctx.fillStyle = '#2c2358'; ctx.fillRect(-200, 1010, 1480, 14);
  ctx.fillStyle = '#100c22'; ctx.fillRect(-200, 1024, 1480, 1000);

  // conveyor (left -> sorter at x 487)
  const cy = 735;
  H.roundRect(ctx, 40, cy, 420, 26, 13); ctx.fillStyle = '#3b3f66'; ctx.fill();
  for (let i = 0; i < 9; i++) { const x = 60 + ((i * 48 + t * 120) % 400); ctx.fillStyle = '#545a8a'; ctx.fillRect(x, cy + 6, 22, 14); }
  ctx.fillStyle = '#2a2d4c'; ctx.fillRect(80, cy + 26, 14, 250); ctx.fillRect(400, cy + 26, 14, 250);

  // bins
  const jar = { x: 690, top: 800, bot: 1010, w: 230 }, bin = { x: 290, top: 880, bot: 1010, w: 200 };
  // coins: spawn every 0.32 s; travel conveyor 1.4 s, then drop 0.6 s into jar or bin
  const SP = 0.32, start = 0.0;
  let inJar = 0, inBin = 0;
  const n = Math.floor((t - start) / SP);
  for (let i = Math.max(0, n - 12); i <= n; i++) {
    const st = start + i * SP, u = t - st;
    if (u < 0) continue;
    const toJar = H.hash(i, 77) < margin;
    let x, y;
    if (u < 1.4) { x = lerp(40, 470, u / 1.4); y = cy + 2; }
    else if (u < 2.0) {
      const v = (u - 1.4) / 0.6, tx = toJar ? jar.x : bin.x, ty = toJar ? jar.bot - 40 : bin.bot - 30;
      x = lerp(487, tx + (H.hash(i, 5) - 0.5) * 80, v); y = lerp(cy + 70, ty, v * v) - Math.sin(v * Math.PI) * 60;
    } else continue;
    K.drawCoin(ctx, x, y, 0.7, { spin: t * 6 + i, shadow: false });
  }
  for (let i = 0; i <= n - 7; i++) { if (H.hash(i, 77) < margin) inJar++; else inBin++; }

  // bin (COSTS)
  const binFill = clamp(inBin / 40, 0, 0.8);
  H.roundRect(ctx, bin.x - bin.w / 2, bin.top, bin.w, bin.bot - bin.top, 14); ctx.fillStyle = '#3a3554'; ctx.fill();
  ctx.fillStyle = '#6a6188'; ctx.fillRect(bin.x - bin.w / 2, bin.bot - (bin.bot - bin.top - 10) * binFill, bin.w, (bin.bot - bin.top - 10) * binFill);
  H.roundRect(ctx, bin.x - bin.w / 2 - 10, bin.top - 12, bin.w + 20, 22, 8); ctx.fillStyle = '#4a4468'; ctx.fill();
  ctx.font = K.font.display(30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#d8d2f0'; ctx.fillText(P.bin || 'COSTS', bin.x, bin.top + 55);
  // jar (PROFIT)
  const jarFill = clamp(inJar / 40, 0, 0.85);
  H.roundRect(ctx, jar.x - jar.w / 2, jar.top, jar.w, jar.bot - jar.top, 30); ctx.fillStyle = 'rgba(200,230,255,0.10)'; ctx.fill();
  ctx.save(); H.roundRect(ctx, jar.x - jar.w / 2 + 6, jar.top + 6, jar.w - 12, jar.bot - jar.top - 12, 26); ctx.clip();
  const jy = jar.bot - (jar.bot - jar.top) * jarFill;
  ctx.fillStyle = ACC; ctx.fillRect(jar.x - jar.w / 2, jy, jar.w, jar.bot - jy);
  for (let yy = jar.bot - 16; yy > jy + 8; yy -= 22) for (let xx = 0; xx < 5; xx++) { ctx.beginPath(); ctx.ellipse(jar.x - 90 + xx * 45 + (Math.round(yy / 22) % 2) * 20, yy, 18, 7, 0, 0, Math.PI * 2); ctx.fillStyle = H.rgba(H.mixHex(ACC, '#000000', 0.45), 0.35); ctx.fill(); }
  ctx.restore();
  ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(210,235,255,0.6)'; H.roundRect(ctx, jar.x - jar.w / 2, jar.top, jar.w, jar.bot - jar.top, 30); ctx.stroke();
  H.roundRect(ctx, jar.x - 70, jar.top - 22, 140, 26, 10); ctx.fillStyle = '#8fa6c8'; ctx.fill();
  // sorter machine
  H.roundRect(ctx, 430, cy - 70, 115, 150, 18); ctx.fillStyle = '#5c6bb0'; ctx.fill();
  H.roundRect(ctx, 448, cy - 50, 79, 40, 10); ctx.fillStyle = '#10142c'; ctx.fill();
  const lamp = (Math.floor(t / SP) % 2) ? ACC : '#9aa3c7';
  ctx.beginPath(); ctx.arc(487, cy - 30, 10, 0, Math.PI * 2); ctx.fillStyle = lamp; ctx.fill();
  ctx.beginPath(); ctx.moveTo(452, cy + 80); ctx.lineTo(522, cy + 80); ctx.lineTo(500, cy + 108); ctx.lineTo(474, cy + 108); ctx.closePath(); ctx.fillStyle = '#4a5796'; ctx.fill();

  ctx.restore(); // camera

  // jar percentage label (counts up at splitCue)
  const sp = K.popIn(t, splitAt, 0.45);
  if (sp > 0) {
    const pct = (margin * 100) * H.easeOutCubic(clamp((t - splitAt) / 1.4));
    ctx.save(); ctx.translate(690, 880); ctx.scale(sp, sp);
    ctx.fillStyle = '#10142c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    H.roundRect(ctx, -105, -46, 210, 92, 20); ctx.fillStyle = 'rgba(8,10,24,0.88)'; ctx.fill();
    ctx.fillStyle = ACC; ctx.font = K.font.display(46); ctx.fillText(t > splitAt + 1.4 ? (P.marginText || '51.1%') : pct.toFixed(1) + '%', 0, -8);
    ctx.font = K.font.ui(22); ctx.fillStyle = '#ffffff'; ctx.fillText(P.jar || 'PROFIT', 0, 28);
    ctx.restore();
  }

  // top panel: forecast pill + BEAT stamp, later the donut
  const fIn = K.popIn(t, beatAt, 0.45), toDonut = K.phase(t, hpcAt - 0.3, hpcAt + 0.2);
  if (fIn > 0 && toDonut < 1) {
    ctx.save(); ctx.globalAlpha = 1 - toDonut;
    ctx.save(); ctx.translate(430, 540); ctx.scale(fIn, fIn);
    H.roundRect(ctx, -330, -60, 660, 120, 26); ctx.fillStyle = 'rgba(8,10,24,0.86)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke();
    ctx.fillStyle = H.rgba('#ffffff', 0.7); ctx.font = K.font.ui(24); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.forecastHead || 'Analysts expected profit of', -300, -22);
    ctx.fillStyle = '#ffffff'; const ft = H.fitText(ctx, P.forecast || 'NT$746.34 billion', 'display', 40, 26, 420); ctx.font = ft.font; ctx.fillText(P.forecast || 'NT$746.34 billion', -300, 22);
    ctx.restore();
    K.drawStamp(ctx, 790, 640, 0.62, { kind: 'check', text: P.stamp || 'BEAT', land: clamp((t - beatAt - 0.5) / 0.5) });
    ctx.restore();
  }
  const dIn = K.popIn(t, hpcAt, 0.5);
  if (dIn > 0) {
    ctx.save(); ctx.translate(487, 545); ctx.scale(dIn, dIn);
    H.roundRect(ctx, -410, -110, 820, 220, 28); ctx.fillStyle = 'rgba(8,10,24,0.88)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = H.rgba(ACC, 0.35); ctx.stroke();
    const share = P.share != null ? +P.share : 0.68, sw = K.phase(t, hpcAt + 0.2, hpcAt + 1.4, H.easeOutCubic);
    const dx = -290;
    ctx.lineWidth = 34; ctx.strokeStyle = '#2f3560'; ctx.beginPath(); ctx.arc(dx, 0, 70, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = ACC; ctx.beginPath(); ctx.arc(dx, 0, 70, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * share * sw); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = K.font.display(36);
    ctx.fillText(sw >= 1 ? (P.shareText || '68%') : Math.round(share * 100 * sw) + '%', dx, 2);
    ctx.textAlign = 'left';
    const l1 = P.shareLabel || 'of sales: high-performance computing';
    const ft = H.fitText(ctx, l1, 'bold', 34, 24, 530); ctx.font = ft.font; ctx.fillText(l1, -180, -24);
    ctx.fillStyle = ACC; ctx.font = K.font.ui(26); ctx.fillText(P.shareSub || 'the category that includes AI chips', -180, 30);
    ctx.restore();
  }
}
