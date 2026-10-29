// Scene "report-drop" (full frame). An office at dusk: a thick report flies in and thumps onto a desk (title +
// subtitle on its cover), a `who` pill names the publisher; a wall board pops with a zero-axis bar chart whose bars
// grow from a left baseline (gains accent, drops red) with their values (a bar may carry its own `cue`); on
// `biggestCue` the biggest drop's row is ringed and a stamp slams beside the board. A cartoon analyst reads beside the desk, then turns to point at the board.
// params: report ("REPORT"), reportSub, who, board (chart title), bars [{label, value, cue?}] (2-4, published
//         numbers in %), stamp ("BIGGEST DROP"), cues: whoCue (15%), boardCue (35%), overallCue (55%: when gains
//         grow), biggestCue (80%)
// Fits: a new report / survey / dataset lands; which category rose and which fell; enrollment, sales, usage data.
// Cues are narration words ("word#n" = the (n+1)th time spoken in the scene) or a number of seconds.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const RED = '#ff5a6e';
  const tWho = at(P.whoCue, D * 0.15) - 0.2;
  const tBoard = at(P.boardCue, D * 0.35) - 0.3;
  const tAll = at(P.overallCue, D * 0.55) - 0.2;
  const tBig = at(P.biggestCue, D * 0.8) - 0.15;
  const bars = (P.bars || [{ label: 'A', value: 5 }, { label: 'B', value: -10 }]).slice(0, 4);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 470, y: 860 }, { t: tBoard + 0.4, zoom: 1.0, x: 487, y: 730 }, { t: D, zoom: 1.04, x: 487, y: 700 }]);
  K.world.office(ctx, { t, time: 'dusk' });

  // ---- desk + report + analyst
  const DKX = 330, DKY = 1040;
  const look = t < tBoard + 0.3 ? -0.2 : 0.6;
  K.drawPerson(ctx, 740, 1040, 1.2, { t, pose: t > tBig - 0.2 ? 'point' : 'stand', mood: t > tBig ? 'shocked' : 'neutral', look, shirt: '#4fb3a6', hairStyle: 'bun', hair: 1, skin: 2, seed: 4, talk: 0 });
  K.drawDesk(ctx, DKX, DKY, 1.2);
  K.props.mug(ctx, DKX + 120, DKY - 132, 1.0, t);
  // report flies in from the top-left and lands with a bounce + dust
  const land = 0.55, fly = clamp(t / land), RS = 0.62;
  const ry = lerp(560, DKY - 130, H.easeInOutCubic(fly)) - (t > land ? Math.abs(Math.sin((t - land) * 9)) * 18 * Math.exp(-(t - land) * 5) : 0);
  const rx = lerp(120, DKX - 30, H.easeOutCubic(fly)), rot = (1 - fly) * -0.5;
  ctx.save(); ctx.translate(rx, ry); ctx.rotate(rot); ctx.scale(RS, RS);
  for (let i = 3; i >= 1; i--) { roundRect(ctx, -82, -16, 164, 16, 4); ctx.fillStyle = i % 2 ? '#d5dae8' : '#f2f4fa'; ctx.fill(); ctx.translate(0, -8); }
  roundRect(ctx, -88, -200, 176, 200, 10); ctx.fillStyle = '#f4f6fb'; ctx.fill();
  roundRect(ctx, -88, -200, 176, 56, 10); ctx.fillStyle = ACC; ctx.fill(); ctx.fillRect(-88, -160, 176, 16);
  ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let f = H.fitText(ctx, String(P.report || 'REPORT'), 'display', 30, 18, 160); ctx.font = f.font; ctx.fillText(f.text, 0, -170);
  if (P.reportSub) { f = H.fitText(ctx, String(P.reportSub), 'ui', 22, 14, 150); ctx.font = f.font; ctx.fillStyle = '#3b4672'; ctx.fillText(f.text, 0, -122); }
  for (let i = 0; i < 4; i++) { roundRect(ctx, -64, -96 + i * 20, i === 3 ? 70 : 128, 8, 4); ctx.fillStyle = '#d5dae8'; ctx.fill(); }
  ctx.restore();
  if (t > land && t < land + 0.5) { const k = (t - land) / 0.5; ctx.save(); ctx.globalAlpha = 1 - k; for (let i = 0; i < 6; i++) { const a = Math.PI + i * Math.PI / 5; ctx.beginPath(); ctx.arc(DKX - 30 + Math.cos(a) * (100 + 70 * k), DKY - 130 + Math.sin(a) * 18 * k, 7 * (1 - k) + 2, 0, Math.PI * 2); ctx.fillStyle = '#c9d0e6'; ctx.fill(); } ctx.restore(); }
  // who pill over the report
  const pw = K.popIn(t, tWho, 0.45);
  if (pw > 0 && P.who) K.drawLabel(ctx, 487, 490, pw, { text: String(P.who), size: 28, dot: true });

  // ---- the wall board: one bar per row from a left baseline (gains accent, drops red)
  const pb = K.popIn(t, tBoard, 0.5);
  let BY1 = 0;
  if (pb > 0) {
    const BX0 = 80, BX1 = 895, BY0 = 508, cx = (BX0 + BX1) / 2, rowH = 50;
    BY1 = BY0 + 58 + rowH * bars.length + 10;
    ctx.save(); ctx.translate(cx, BY0); const s = Math.min(1.03, pb); ctx.scale(s, s); ctx.translate(-cx, -BY0);
    roundRect(ctx, BX0, BY0, BX1 - BX0, BY1 - BY0, 22); ctx.fillStyle = 'rgba(10,12,24,0.93)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#9aa3bd';
    f = H.fitText(ctx, String(P.board || ''), 'ui', 26, 20, 720); ctx.font = f.font; ctx.fillText(f.text, BX0 + 28, BY0 + 36);
    const LX = BX0 + 28, AX = 380, maxV = Math.max(...bars.map((b) => Math.abs(Number(b.value) || 0)), 1), span = 360;
    let iMin = 0; bars.forEach((b, i) => { if ((Number(b.value) || 0) < (Number(bars[iMin].value) || 0)) iMin = i; });
    bars.forEach((b, i) => {
      const v = Number(b.value) || 0, neg = v < 0;
      const tb = neg ? Math.max(tBoard + 0.6, tBig - 1.2) : (b.cue ? at(b.cue, tAll) - 0.2 : Math.max(tBoard + 0.4, tAll - 0.2) + i * 0.25);
      const k = K.phase(t, tb, tb + 0.8, H.easeOutCubic);
      const yc = BY0 + 58 + rowH * (i + 0.5);
      if (i === iMin && neg && t > tBig) {
        ctx.save(); ctx.globalAlpha = 0.6 + 0.4 * Math.sin((t - tBig) * 6);
        roundRect(ctx, BX0 + 10, yc - rowH / 2 + 2, BX1 - BX0 - 20, rowH - 4, 14); ctx.lineWidth = 4; ctx.strokeStyle = RED; ctx.stroke();
        ctx.restore();
      }
      ctx.textAlign = 'left'; ctx.fillStyle = k > 0 ? '#ffffff' : '#7d86a3';
      f = H.fitText(ctx, String(b.label), 'bold', 28, 18, AX - LX - 16); ctx.font = f.font; ctx.fillText(f.text, LX, yc);
      const w = Math.max(10, span * Math.abs(v) / maxV * k);
      roundRect(ctx, AX, yc - 16, w, 32, 9); ctx.fillStyle = k > 0 ? (neg ? RED : ACC) : 'rgba(255,255,255,0.08)'; ctx.fill();
      if (k <= 0) return;
      ctx.font = H.font('display', 32); ctx.fillStyle = neg ? RED : ACC; ctx.textAlign = 'left';
      ctx.fillText((v > 0 ? '+' : v < 0 ? '-' : '') + Math.abs(v * k).toFixed(1) + '%', AX + w + 14, yc + 2);
    });
    ctx.restore();
  }
  // stamp for the biggest drop, beside the board
  if (pb > 0 && t > tBig) K.drawStamp(ctx, 560, BY1 + 150, 0.55, { kind: 'cross', text: String(P.stamp || 'BIGGEST DROP'), land: (t - tBig) / 0.45 });
  ctx.restore();
}
