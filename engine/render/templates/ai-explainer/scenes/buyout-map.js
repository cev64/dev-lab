// Scene "buyout-map" (full frame, 1 beat). A bird's-eye map of a neighbourhood at dusk: blocks of small house roofs
// between streets, a humming plant (turbines + data center block) in the corner sending sound rings over it. A
// "who said it" pill, then a TARGET counter counts up to `value` while house roofs light up in the accent outward
// from the plant (most of the map: "almost the entire neighbourhood"); a source pill; then `sold` houses get SOLD pins
// and a records pill lands.
// Fits: buyouts / land assembly / "a company wants N homes" numbers; any count of houses or plots near a site.
// params: who ("Who said it"), whoCue (22%), label ("TARGET"), value (400), unit ("homes"), valueCue (45%),
//         source ("Per Source"), sourceCue (60%), sold (4), soldCue (83%), records ("Records: 4 bought so far"),
//         recordsCue (75%), lightShare (0.92)
// Cues are narration words ("word#n" = the (n+1)th time spoken in the scene) or a number of seconds; without them the
// fractions above. Pass the story's figures exactly as published and say who said them.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, rgba } = H;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const TAU = Math.PI * 2;
  const tWho = at(P.whoCue, D * 0.22) - 0.4;
  const tVal = at(P.valueCue, D * 0.45) - 0.5;
  const tSrc = at(P.sourceCue, D * 0.6) - 0.3;
  const tRec = at(P.recordsCue, D * 0.75) - 0.3;
  const tSold = at(P.soldCue, D * 0.83) - 0.2;
  const value = P.value == null ? 400 : P.value, nSold = P.sold == null ? 4 : P.sold;

  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
  // dusk backdrop
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#1c1f45'); g.addColorStop(0.5, '#262a55'); g.addColorStop(1, '#0c0e1c');
  ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, 2400);

  // map board
  const MX0 = 95, MX1 = 880, MY0 = 600, MY1 = 1035;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; roundRect(ctx, MX0 + 8, MY0 + 12, MX1 - MX0, MY1 - MY0, 28); ctx.fill();
  roundRect(ctx, MX0, MY0, MX1 - MX0, MY1 - MY0, 28); ctx.fillStyle = '#2f5a4c'; ctx.fill();
  ctx.clip();
  // streets
  ctx.fillStyle = '#4a5070';
  const colW = 52, rowH = 44, cols = 13, rows = 9, ox = MX0 + 60, oy = MY0 + 40;
  for (let r = 0; r <= rows; r += 3) ctx.fillRect(MX0, oy + r * rowH - 16 + (r / 3) * 18, MX1 - MX0, 14);
  for (let c = 0; c <= cols; c += 4) ctx.fillRect(ox + c * colW - 14 + (c / 4) * 10, MY0, 12, MY1 - MY0);
  // the plant (top-left corner)
  const PX = MX0 + 40, PY = MY0 + 30;
  ctx.restore();

  // house tiles
  const tiles = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = ox + c * colW + Math.floor(c / 4) * 10 + 6, y = oy + r * rowH + Math.floor(r / 3) * 18;
    if (x > MX1 - 40 || y > MY1 - 30) continue;
    if (x < MX0 + 170 && y < MY0 + 110) continue;           // the plant lot
    tiles.push({ x, y, d: Math.hypot(x - PX, y - PY), h: H.hash(r * 31 + c, 7) });
  }
  const order = tiles.slice().sort((a, b) => a.d + a.h * 60 - (b.d + b.h * 60));
  const share = P.lightShare == null ? 0.92 : P.lightShare;
  const countP = clamp((t - tVal) / 1.4);
  const nLit = Math.round(smooth(countP) * share * order.length);
  const lit = new Set(order.slice(0, nLit));
  // sold: the nearest few
  const sold = [];                                         // spread through the nearest third of the map
  for (let i = 0; i < nSold; i++) sold.push(order[Math.min(order.length - 1, 4 + Math.floor(i * order.length * 0.33 / Math.max(1, nSold)))]);
  const roofs = ['#c98a6b', '#a8b4c9', '#d9c7a6', '#9a7a6b'];
  for (const tl of tiles) {
    const on = lit.has(tl);
    ctx.save(); ctx.translate(tl.x, tl.y);
    roundRect(ctx, -18, -14, 36, 28, 4); ctx.fillStyle = roofs[Math.floor(tl.h * 4)]; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.stroke();
    if (on) { ctx.lineWidth = 4; ctx.strokeStyle = ACC; roundRect(ctx, -21, -17, 42, 34, 6); ctx.stroke(); }
    ctx.restore();
  }
  // plant icon + rings
  ctx.save();
  ctx.beginPath(); roundRect(ctx, MX0, MY0, MX1 - MX0, MY1 - MY0, 28); ctx.clip();
  for (let i = 0; i < 5; i++) {
    const R = ((t * 150 + i * 160) % 800) + 30, a = 1 - R / 830;
    ctx.strokeStyle = rgba('#ffb36b', 0.5 * a); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(PX + 40, PY + 30, R, 0, Math.PI / 2); ctx.stroke();
  }
  ctx.restore();
  ctx.save(); ctx.translate(PX + 45, PY + 34);
  roundRect(ctx, -40, -26, 110, 60, 8); ctx.fillStyle = '#d4d9e8'; ctx.fill();
  for (let i = 0; i < 3; i++) { roundRect(ctx, -30 + i * 34, -12, 26, 34, 5); ctx.fillStyle = '#20243f'; ctx.fill(); ctx.beginPath(); ctx.arc(-17 + i * 34, 0, 4, 0, TAU); ctx.fillStyle = Math.sin(t * 6 + i) > 0 ? ACC : '#555b7a'; ctx.fill(); }
  for (let i = 0; i < 3; i++) { const u = (t * 0.7 + i / 3) % 1; ctx.globalAlpha = 0.4 * (1 - u); ctx.beginPath(); ctx.arc(55 + i * 4, -30 - u * 50, 8 + u * 14, 0, TAU); ctx.fillStyle = '#d8d2dc'; ctx.fill(); }
  ctx.restore();

  // SOLD pins
  sold.forEach((tl, i) => {
    const k = K.popIn(t, tSold + i * 0.14, 0.4); if (k <= 0) return;
    const drop = (1 - smooth(clamp((t - tSold - i * 0.14) / 0.35))) * 60;
    ctx.save(); ctx.translate(tl.x, tl.y - 18 - drop); ctx.scale(Math.min(1.1, k), Math.min(1.1, k));
    ctx.fillStyle = '#f4f1e8'; ctx.fillRect(-2, -34, 4, 34);
    roundRect(ctx, -30, -64, 60, 30, 6); ctx.fillStyle = '#e0505a'; ctx.fill();
    ctx.font = H.font('display', 18); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText('SOLD', 0, -48);
    ctx.restore();
  });

  // who said it
  const wk = K.popIn(t, tWho, 0.45);
  if (wk > 0) {
    const out = smooth((t - tVal) / 0.35);
    ctx.save(); ctx.globalAlpha = 1 - 0.0 * out;
    K.drawLabel(ctx, 487, 470, Math.min(1.05, wk), { text: P.who || 'Who said it', size: 30, dot: true });
    ctx.restore();
  }
  // counter panel
  const ck = K.popIn(t, tVal - 0.1, 0.45);
  if (ck > 0) {
    ctx.save(); ctx.translate(487, 535); ctx.scale(Math.min(1.04, ck), Math.min(1.04, ck));
    const W = 520, Hh = 96;
    roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 22); ctx.fillStyle = 'rgba(8,10,24,0.95)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.textBaseline = 'middle';
    ctx.font = H.font('ui', 26); ctx.textAlign = 'left'; ctx.fillStyle = ACC; ctx.fillText(P.label || 'TARGET', -W / 2 + 30, 2);
    const n = Math.round(smooth(countP) * value);
    ctx.font = H.font('display', 62); ctx.textAlign = 'right'; ctx.fillStyle = '#ffffff';
    const unit = P.unit || 'homes';
    ctx.fillText(String(n), 60, 4);
    ctx.font = H.font('bold', 34); ctx.textAlign = 'left'; ctx.fillStyle = '#ffffff'; ctx.fillText(unit, 76, 6);
    ctx.restore();
  }
  // source + records pills (over the map's lower edge, inside the stage)
  const sk = K.popIn(t, tSrc, 0.4), rk = K.popIn(t, tRec, 0.4);
  if (sk > 0 && rk <= 0.01) K.drawLabel(ctx, 487, 1010, Math.min(1.05, sk), { text: P.source || 'Per Source', size: 26 });
  if (rk > 0) K.drawLabel(ctx, 487, 1010, Math.min(1.05, rk), { text: P.records || 'Records: 4 bought so far', size: 28, accent: true });
  void lerp;
}
