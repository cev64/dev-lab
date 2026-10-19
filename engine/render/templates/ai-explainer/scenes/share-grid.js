// Scene "share-grid" (full frame, 1 beat). Night office wall: a 10x10 grid of squares stands for all of a company's
// shares. The new fund's cells glow in the accent colour; a pledge paper signs itself and two cartoon employees toss
// tokens, which light more cells in a second colour (no split between those sources is implied); then a bracket
// wraps all lit cells and a big total ("~30%") with a caption lands. Ends settled (lit cells shimmer).
// Fits: "with X and Y, about N% of shares / revenue / seats now go to Z" (shares of a whole built from parts).
// params: fundCells (10), otherCells (20), title ("100 squares = all shares"), fund ("New fund: 10%"),
//         otherA ("Pledges"), otherB ("Matching"), matchBadge ("x2"), total ("~30%"), totalLabel ("set aside in all"),
//         cues: otherCue, matchCue, totalCue (optional; else fractions)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, rgba, roundRect } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const nF = P.fundCells || 10, nO = P.otherCells || 20;
  const tO = at(P.otherCue, D * 0.1) - 0.2;
  const tM = at(P.matchCue, D * 0.4) - 0.2;
  const tT = at(P.totalCue, D * 0.66) - 0.3;
  const OTHER = '#8fd0ff';

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.02, x: 487, y: 700 }]);
  // office at night: wall, floor, window
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#151a33'); g.addColorStop(0.55, '#202748'); g.addColorStop(1, '#0a0d1c');
  ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, 2320);
  ctx.fillStyle = '#262c4d'; ctx.fillRect(-200, 1030, 1480, 900);
  ctx.fillStyle = '#30375e'; ctx.fillRect(-200, 1024, 1480, 10);
  K.props.plant(ctx, 40, 1030, 0.9);

  // grid board
  const GX = 505, GY = 455, C = 36, G = 4, GW = 10 * (C + G) - G;
  roundRect(ctx, GX - 18, GY - 18, GW + 36, GW + 36, 18); ctx.fillStyle = 'rgba(8,10,24,0.9)'; ctx.fill();
  ctx.font = H.font('ui', 26); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(P.title || '100 squares = all shares', GX + GW / 2, GY - 44);
  const fundOn = (i) => clamp((t - 0.3 - i * 0.12) / 0.3);
  const otherOn = (j) => clamp((t - (tO + 0.5 + (j / nO) * (tM + 1.2 - tO))) / 0.3);
  for (let i = 0; i < 100; i++) {
    const r = Math.floor(i / 10), c = i % 10, x = GX + c * (C + G), y = GY + r * (C + G);
    let col = 'rgba(255,255,255,0.10)', k = 0;
    if (i < nF) { k = fundOn(i); col = k > 0 ? ACC : col; }
    else if (i < nF + nO) { k = otherOn(i - nF); col = k > 0 ? OTHER : col; }
    const s = k > 0 ? 0.7 + 0.3 * K.motion.popIn(k, 0, 1) : 1;
    ctx.save(); ctx.translate(x + C / 2, y + C / 2); ctx.scale(Math.min(1.1, s), Math.min(1.1, s));
    ctx.globalAlpha = k > 0 ? 0.55 + 0.45 * k : 1;
    roundRect(ctx, -C / 2, -C / 2, C, C, 7); ctx.fillStyle = col; ctx.fill();
    if (k > 0 && t > tT + 1) { const sh = 0.5 + 0.5 * Math.sin(t * 3 - i * 0.4); ctx.globalAlpha = 0.25 * sh; ctx.fillStyle = '#ffffff'; roundRect(ctx, -C / 2, -C / 2, C, C * 0.4, 7); ctx.fill(); }
    ctx.restore();
  }

  // legend pills (left column)
  const fk = K.popIn(t, 0.5, 0.4), ak = K.popIn(t, tO + 0.1, 0.4), bk = K.popIn(t, tM + 0.1, 0.4);
  if (fk > 0) K.drawLabel(ctx, 275, 500, Math.min(1.05, fk), { text: P.fund || 'New fund: 10%', size: 26, accent: true });
  const legend = (y, k, text) => {
    if (k <= 0) return;
    K.drawLabel(ctx, 275, y, Math.min(1.05, k), { text, size: 24 });
    ctx.save(); ctx.font = H.font('ui', 24); const w = ctx.measureText(text).width + 34; ctx.restore();
    roundRect(ctx, 275 - w / 2 - 30, y - 34, 24, 24, 5); ctx.globalAlpha = Math.min(1, k); ctx.fillStyle = OTHER; ctx.fill(); ctx.globalAlpha = 1;
  };
  legend(566, ak, P.otherA || 'Pledges');
  legend(626, bk, P.otherB || 'Matching');

  // pledge paper (signs at tO), tokens fly from it to the grid
  const DX = 175, DYb = 860;
  K.drawDocument(ctx, DX, DYb, 1.05, { sign: K.phase(t, tO, tO + 1.2), seal: t > tO + 1.3 });
  // two employees toss tokens (from tM)
  const tossing = (i) => t > tM + i * 0.3 && t < tM + 2.6;
  K.drawPerson(ctx, 290, 1032, 0.8, { t, pose: tossing(0) ? 'point' : 'stand', mood: 'happy', skin: 1, hair: 2, shirt: '#6f86e0', hairStyle: 'long', seed: 31, look: 1 });
  K.drawPerson(ctx, 400, 1032, 0.8, { t, pose: tossing(1) ? 'point' : 'stand', mood: 'happy', skin: 3, hair: 0, shirt: '#4fb3a6', hairStyle: 'short', seed: 32, look: 1 });
  // flying tokens: from the paper (tO..tM) then from the employees (tM..tM+1.2)
  for (let j = 0; j < nO; j++) {
    const land = tO + 0.5 + (j / nO) * (tM + 1.2 - tO), start = land - 0.7;
    if (t < start || t > land) continue;
    const fromPaper = land < tM + 0.3;
    const sx = fromPaper ? DX + 30 : (j % 2 ? 400 : 290), sy = fromPaper ? DYb - 140 : 1032 - 190;
    const idx = nF + j, ex = GX + (idx % 10) * (C + G) + C / 2, ey = GY + Math.floor(idx / 10) * (C + G) + C / 2;
    const u = H.easeInOutCubic((t - start) / 0.7);
    const x = sx + (ex - sx) * u, y = sy + (ey - sy) * u - Math.sin(u * Math.PI) * 120;
    K.glow(ctx, x, y, 30, OTHER, 0.6);
    roundRect(ctx, x - 12, y - 12, 24, 24, 6); ctx.fillStyle = OTHER; ctx.fill();
  }
  // "x2" match badge near the employees
  const mk = K.popIn(t, tM + 0.6, 0.4) * (1 - clamp((t - tT) / 0.4));
  if (mk > 0.02) { ctx.save(); ctx.translate(345, 735); ctx.scale(Math.min(1.05, mk), Math.min(1.05, mk)); ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fillStyle = OTHER; ctx.fill(); ctx.font = H.font('display', 30); ctx.fillStyle = '#10223a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.matchBadge || 'x2', 0, 2); ctx.restore(); }

  // bracket + total
  const bk2 = K.phase(t, tT, tT + 0.5, H.easeOutCubic);
  if (bk2 > 0) {
    const lastRow = Math.floor((nF + nO - 1) / 10), y1 = GY + (lastRow + 1) * (C + G) - G + 8;
    ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.globalAlpha = bk2;
    roundRect(ctx, GX - 8, GY - 8, GW + 16, (y1 - GY + 8) * bk2, 10); ctx.stroke(); ctx.restore();
    K.glow(ctx, GX + GW / 2, GY + 40, 220, ACC, 0.15 * bk2);
  }
  const tk = K.popIn(t, tT + 0.2, 0.45);
  if (tk > 0) {
    ctx.save(); ctx.translate(GX + GW / 2, 930); ctx.scale(Math.min(1.05, tk), Math.min(1.05, tk));
    ctx.font = H.font('display', 76); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.total || '~30%', 0, 0);
    ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.fillText(P.totalLabel || 'set aside in all', 0, 58);
    ctx.restore();
  }
  ctx.restore();
  void rgba;
}
