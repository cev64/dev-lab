// Scene "money-flow" (full frame). Two labelled buildings on a city street; coins arc from one to the other in a
// stream while a big amount counts up between them; bills pile up at the receiver, which lights up. Ends settled.
// params (optional): from    label of the payer building, default "Big Tech"
//                    to      label of the receiver, default "AI Lab"
//                    amount  the figure, counted up keeping its format ("$10B", "$2.5 billion"), default "$10B"
//                    caption small line under the amount (e.g. "investment"), optional
//                    time    "day" | "dusk" | "night" (default "dusk")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, smooth, lerp, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const flow0 = Math.min(1.2, D * 0.12), flow1 = Math.max(flow0 + 1, D * 0.72);

  const z = lerp(1.0, 1.06, K.phase(t, 0, D));
  ctx.save(); ctx.translate(487, 725); ctx.scale(z, z); ctx.translate(-487, -725);
  K.world.city(ctx, { t, time: P.time || 'dusk', groundY: 960 });
  const feet = 1010;
  const A = { x: 225, s: 0.95 }, B = { x: 755, s: 0.95 };
  const aTop = feet - (60 + 7 * 44 + 30) * A.s, bTop = feet - (60 + 7 * 44 + 30) * B.s;
  const recv = K.phase(t, flow0 + 1, flow1 + 0.6);
  K.drawBuilding(ctx, A.x, feet, A.s, { t, color: '#5b6aa8', floors: 7, lit: 0.45, label: P.from || 'Big Tech' });
  K.drawBuilding(ctx, B.x, feet, B.s, { t, color: '#4f8f8a', floors: 7, lit: 0.3 + 0.6 * recv, label: P.to || 'AI Lab' });
  K.glow(ctx, B.x, feet - 200, 260, ACC, 0.25 * recv);

  // coin stream along an arc between the roofs
  const arc = K.bezier(A.x + 70, aTop + 20, A.x + 160, aTop - 260, B.x - 160, bTop - 260, B.x - 70, bTop + 20, 40);
  ctx.save(); ctx.strokeStyle = H.rgba('#ffffff', 0.18); ctx.lineWidth = 4; ctx.setLineDash([3, 16]); ctx.lineCap = 'round';
  K.pathDraw(ctx, arc, K.phase(t, flow0 - 0.6, flow0 + 0.2)); ctx.restore();
  const GAP = 0.22, TRAVEL = 1.25;
  let landed = 0;
  const kMax = Math.floor((Math.min(t, flow1) - flow0) / GAP);
  for (let k = Math.max(0, Math.floor((t - flow0 - TRAVEL) / GAP)); k <= kMax; k++) {
    const s0 = flow0 + k * GAP, u = (t - s0) / TRAVEL;
    if (u < 0 || u > 1) continue;
    const [x, y] = K.pathPoint(arc, easeOutCubic(u) * 0.35 + u * 0.65);
    K.drawCoin(ctx, x, y + 32, 0.95, { spin: t * 7 + k, shadow: false });
  }
  landed = clamp(Math.floor((Math.min(t, flow1 + TRAVEL) - flow0 - TRAVEL) / GAP) + 1, 0, 999);
  // bills piling up next to the receiver
  const piles = Math.min(3, Math.floor(landed / 8) + (landed > 0 ? 1 : 0));
  for (let i = 0; i < piles; i++) {
    const cnt = clamp(landed - i * 8, 1, 8);
    const pop = K.popIn(t, flow0 + TRAVEL + i * 8 * GAP, 0.3);
    if (pop > 0) K.drawBills(ctx, B.x - 210 + i * 70, feet + 18 + i * 6, 0.62 * pop, { count: Math.ceil(cnt / 2) });
  }

  // the amount, counting up in the sky between the buildings
  const txt = String(P.amount || '$10B');
  const m = txt.match(/^([^0-9]*?)(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?(.*)$/);
  const k = K.phase(t, flow0, flow1, easeOutCubic);
  let shown = txt;
  if (m && k < 1) {
    const dec = m[3] ? m[3].length - 1 : 0, v = parseFloat(m[2].replace(/,/g, '') + (m[3] || '')) * k;
    let n = v.toFixed(dec); if (m[2].includes(',')) n = n.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    shown = m[1] + n + m[4];
  }
  const ap = K.popIn(t, flow0 - 0.2, 0.45);
  if (ap > 0) {
    ctx.save(); ctx.translate(487, 610); ctx.scale(ap, ap);
    const ft = H.fitText(ctx, txt, 'display', 120, 60, 520);
    ctx.font = ft.font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(6,7,14,0.85)'; ctx.strokeText(shown, 0, 0);
    ctx.fillStyle = ACC; ctx.fillText(shown, 0, 0);
    if (P.caption) { ctx.font = H.font('ui', 30); ctx.lineWidth = 8; ctx.strokeText(String(P.caption), 0, 52); ctx.fillStyle = '#fff'; ctx.fillText(String(P.caption), 0, 52); }
    ctx.restore();
  }
  // a pedestrian walks by on the street for life
  const wx = lerp(-80, 1160, clamp(t / Math.max(6, D)));
  K.drawPerson(ctx, wx, feet + 28, 0.8, { t, walk: t, skin: 0, shirt: 3, hair: 2, hairStyle: 'long', seed: 9 });
  ctx.restore();
}
