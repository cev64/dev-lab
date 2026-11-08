// Scene "paper-trail" (full frame, 1 beat ~11-14 s). Night newsroom: an investigation cork board. Index cards pin on
// in turn (company + an age badge; "its owners"; a linked firm with a status tag; another company with a tiny empty-
// room sketch and a status pill), joined by red string that draws in on cue, with a hedged label on the link
// ("ties, per the Times"). A cartoon reporter with a phone stands in front and turns to the board. Text only: no
// photos, no logos, no real faces.
// Fits: ownership / connection stories ("filings tie X to Y"), "a second case", investigations told with attribution.
// params: cards: c1 {title, sub}, c2 {title, sub}, c3 {title, sub, tag}, c4 {title, sub}; link ("Ties, per the Times");
//         cues: c1Cue ("seventeen" -> c1 sub), c2Cue ("owners"), linkCue ("ties"), c3Cue ("blacklist"),
//               c4Cue ("another"), c4SubCue ("deserted")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const c1 = Object.assign({ title: 'NEW MATRIX', sub: '17 months old' }, P.c1 || {});
  const c2 = Object.assign({ title: 'Its owners', sub: 'of New Matrix' }, P.c2 || {});
  const c3 = Object.assign({ title: 'Investment firm', sub: 'On a US blacklist', tag: 'Since 2024' }, P.c3 || {});
  const c4 = Object.assign({ title: 'Approved firm #2', sub: 'Office: deserted' }, P.c4 || {});
  const t1s = at(P.c1Cue || 'seventeen', D * 0.05) - 0.1;
  const t2 = at(P.c2Cue || 'owners', D * 0.2) - 0.3;
  const tLink = at(P.linkCue || 'ties', D * 0.26) - 0.1;
  const t3 = at(P.c3Cue || 'blacklist', D * 0.4) - 0.5;
  const t4 = at(P.c4Cue || 'another', D * 0.62) - 0.2;
  const t4s = at(P.c4SubCue || 'deserted', D * 0.9) - 0.35;
  const FLOOR = 1030;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 720 }, { t: D, zoom: 1.03, x: 487, y: 730 }]);
  // room: dark wall, desk lamp glow
  K.world.room(ctx, { t, time: 'night', lamp: false, window: false, picture: false, plant: false });
  ctx.fillStyle = 'rgba(10,12,30,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
  // cork board
  const BX0 = 145, BX1 = 830, BY0 = 445, BY1 = 945;
  roundRect(ctx, BX0 - 16, BY0 - 16, BX1 - BX0 + 32, BY1 - BY0 + 32, 14); ctx.fillStyle = '#5a3b26'; ctx.fill();
  roundRect(ctx, BX0, BY0, BX1 - BX0, BY1 - BY0, 8); ctx.fillStyle = '#b8895a'; ctx.fill();
  for (let i = 0; i < 160; i++) { ctx.fillStyle = 'rgba(90,55,30,' + (0.12 + 0.15 * H.hash(i, 2)) + ')'; ctx.beginPath(); ctx.arc(BX0 + 10 + H.hash(i, 5) * (BX1 - BX0 - 20), BY0 + 10 + H.hash(i, 9) * (BY1 - BY0 - 20), 2 + 2 * H.hash(i, 1), 0, Math.PI * 2); ctx.fill(); }
  K.glow(ctx, 487, 700, 420, '#ffd9a0', 0.12);

  // card geometry
  const CW = 300, CH = 190;
  const pos = { 1: [315, 560], 2: [660, 560], 3: [660, 820], 4: [315, 820] };
  // strings (behind the cards, drawn after cards are pinned)
  const str = (a, b, prog, dashed) => {
    if (prog <= 0) return;
    const [x0, y0] = pos[a], [x1, y1] = pos[b];
    const pts = []; for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push([lerp(x0, x1, u), lerp(y0, y1, u) + Math.sin(u * Math.PI) * 18]); }
    ctx.save(); ctx.strokeStyle = '#d63a3a'; ctx.lineWidth = 5; ctx.lineCap = 'round'; if (dashed) ctx.setLineDash([12, 10]);
    K.pathDraw(ctx, pts, prog); ctx.restore();
  };
  str(1, 2, smooth(clamp((t - t2 - 0.2) / 0.6)), false);
  str(2, 3, smooth(clamp((t - tLink) / 0.8)), false);
  str(1, 4, smooth(clamp((t - t4 - 0.2) / 0.6)), true);

  const card = (n, pop, title, sub, subP, opts = {}) => {
    if (pop <= 0) return;
    const [x, y] = pos[n], k = Math.min(1.04, pop), rot = (H.hash(n, 3) - 0.5) * 0.06;
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; roundRect(ctx, -CW / 2 + 8, -CH / 2 + 10, CW, CH, 10); ctx.fill();
    roundRect(ctx, -CW / 2, -CH / 2, CW, CH, 10); ctx.fillStyle = '#f6f2e7'; ctx.fill();
    ctx.fillStyle = opts.band || '#2b3150'; roundRect(ctx, -CW / 2, -CH / 2, CW, 14, 10); ctx.fill();
    const tf = H.fitText(ctx, title, 'display', 34, 22, CW - 40);
    ctx.fillStyle = '#1b2033'; ctx.font = tf.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(tf.text, 0, opts.sketch ? -CH / 2 + 44 : -28);
    if (opts.sketch) emptyRoom(ctx, H, 0, 10, t);
    if (subP > 0) {
      ctx.globalAlpha = clamp(subP * 2);
      const sf = H.fitText(ctx, sub, 'bold', 28, 18, CW - 40);
      ctx.font = sf.font; ctx.fillStyle = opts.subColor || '#3a4058';
      ctx.fillText(sf.text, 0, opts.sketch ? CH / 2 - 30 : 22);
      ctx.globalAlpha = 1;
    }
    if (opts.tag && opts.tagP > 0) {
      const tp = Math.min(1.05, opts.tagP); ctx.save(); ctx.translate(0, 64); ctx.scale(tp, tp);
      ctx.font = H.font('bold', 24); const w = ctx.measureText(opts.tag).width + 30;
      roundRect(ctx, -w / 2, -20, w, 40, 20); ctx.fillStyle = '#e5484d'; ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillText(opts.tag, 0, 1); ctx.restore();
    }
    ctx.restore();
    // push pin
    ctx.fillStyle = '#d63a3a'; ctx.beginPath(); ctx.arc(x, y - CH / 2 + 6, 11, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(x - 3, y - CH / 2 + 3, 4, 0, Math.PI * 2); ctx.fill();
  };
  card(1, K.popIn(t, 0.0, 0.4) + (t > 0 ? 0 : 0), c1.title, c1.sub, K.popIn(t, t1s, 0.4), { band: ACC });
  // age badge on card 1 (calendar)
  const ab = K.popIn(t, t1s + 0.1, 0.45);
  void ab;
  card(2, K.popIn(t, t2, 0.4), c2.title, c2.sub, K.popIn(t, t2 + 0.4, 0.4));
  card(3, K.popIn(t, t3, 0.45), c3.title, c3.sub, K.popIn(t, t3 + 0.35, 0.4), { tag: c3.tag, tagP: K.popIn(t, t3 + 0.9, 0.4), band: '#e5484d', subColor: '#b3262b' });
  card(4, K.popIn(t, t4, 0.45), c4.title, c4.sub, K.popIn(t, t4s, 0.4), { sketch: true });

  // hedged link label on the 2 -> 3 string
  const lp = K.popIn(t, tLink + 0.5, 0.4);
  if (lp > 0) pill(ctx, H, 660, 690, lp, P.link || 'Ties, per the Times', { size: 24, accent: true });

  // reporter in front, phone in hand, turns to the board
  K.drawPerson(ctx, 880, FLOOR + 20, 1.2, { t, pose: 'phone', mood: t > t3 ? 'worried' : 'neutral', look: -0.8, flip: true, skin: 3, hair: 0, shirt: 1, hairStyle: 'short', seed: 22 });
  ctx.restore();
}

function emptyRoom(ctx, H, x, y, t) {
  ctx.save(); ctx.translate(x, y);
  H.roundRect(ctx, -70, -40, 140, 80, 6); ctx.fillStyle = '#8d929e'; ctx.fill();
  ctx.fillStyle = '#6f7480'; ctx.fillRect(-70, 18, 140, 22);
  ctx.strokeStyle = '#20232c'; ctx.lineWidth = 2.5;
  for (let i = 0; i < 3; i++) { const wx = -40 + i * 40, sw = Math.sin(t * 1.4 + i) * 3; ctx.beginPath(); ctx.moveTo(wx, -40); ctx.quadraticCurveTo(wx + sw, -20, wx + sw * 1.5, -6 - i * 4); ctx.stroke(); }
  ctx.restore();
}

function calendar(ctx, H, x, y, s, n, ACC) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.12);
  H.roundRect(ctx, -46, -46, 92, 96, 12); ctx.fillStyle = '#ffffff'; ctx.fill();
  H.roundRect(ctx, -46, -46, 92, 28, 12); ctx.fillStyle = ACC; ctx.fill(); ctx.fillRect(-46, -30, 92, 12);
  ctx.fillStyle = '#1b2033'; ctx.font = H.font('display', 40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(n, 0, 12);
  ctx.font = H.font('bold', 14); ctx.fillText('MONTHS', 0, 38);
  ctx.restore();
}

function pill(ctx, H, x, y, pop, text, o = {}) {
  const size = o.size || 30;
  ctx.save(); ctx.font = H.font('bold', size);
  const tw = ctx.measureText(text).width, w = tw + size * 1.4, h = size * 1.8;
  const cx = Math.max(130 + w / 2, Math.min(845 - w / 2, x));
  const k = Math.min(1.04, pop);
  ctx.translate(cx, y); ctx.scale(k, k);
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
  ctx.fillStyle = o.accent ? H.kit.ACCENT.base : 'rgba(10,12,22,0.9)'; ctx.fill();
  if (!o.accent) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.stroke(); }
  ctx.fillStyle = o.accent ? H.kit.ACCENT.deep : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 2);
  ctx.restore();
}
