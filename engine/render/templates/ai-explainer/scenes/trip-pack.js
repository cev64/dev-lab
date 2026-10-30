// Scene "trip-pack" (full frame, 1 beat). Dusk bedroom: a cartoon traveller with a phone next to an open suitcase.
// Two input pills ("Where?" with a map pin, "How long?" with a calendar) pop on their cues; on planCue they fold
// into a row of day cards (Day 1..n); on forecastCue each card gets a weather icon (sun / rain / cloud / snow); on
// actCue small activity chips land under them; then a folded outfit drops from each card into the suitcase, the lid
// closes and a tick pops. Ends settled.
// Fits: trip / itinerary planners, packing lists, any "plans your week around X" feature.
// params: dest, length, days [weather kinds], acts [strings], cues: destCue, lenCue, planCue, forecastCue, actCue
const CLOTH = ['#e8786a', '#4fb3a6', '#a08be0', '#f2b84b', '#6f86e0'];

function weather(ctx, kind, x, y, s, t, ACC) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const cloud = (cx, cy, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx - 16, cy, 15, 0, 7); ctx.arc(cx + 2, cy - 9, 19, 0, 7); ctx.arc(cx + 20, cy, 14, 0, 7); ctx.fill(); ctx.fillRect(cx - 16, cy - 2, 36, 16); };
  if (kind === 'sun') {
    ctx.save(); ctx.rotate(t * 0.6); ctx.strokeStyle = '#ffcc33'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 26, Math.sin(a) * 26); ctx.lineTo(Math.cos(a) * 36, Math.sin(a) * 36); ctx.stroke(); }
    ctx.restore(); ctx.beginPath(); ctx.arc(0, 0, 19, 0, 7); ctx.fillStyle = '#ffcc33'; ctx.fill();
  } else if (kind === 'rain') {
    cloud(0, -6, '#9aa6c4');
    ctx.strokeStyle = '#6fb6ff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const o = ((t * 1.6 + i * 0.33) % 1) * 18; ctx.beginPath(); ctx.moveTo(-14 + i * 14, 14 + o); ctx.lineTo(-18 + i * 14, 22 + o); ctx.stroke(); }
  } else if (kind === 'snow') {
    cloud(0, -6, '#c9d2e6'); ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 3; i++) { const o = ((t * 0.8 + i * 0.33) % 1) * 18; ctx.beginPath(); ctx.arc(-14 + i * 14, 18 + o, 4, 0, 7); ctx.fill(); }
  } else {
    ctx.beginPath(); ctx.arc(12, -14, 14, 0, 7); ctx.fillStyle = '#ffcc33'; ctx.fill();
    cloud(-2 + Math.sin(t) * 2, 2, '#c9d2e6');
  }
  ctx.restore();
}

function folded(ctx, H, x, y, w, col) {
  const sh = col;
  H.roundRect(ctx, x - w / 2, y - 30, w, 30, 8); ctx.fillStyle = sh; ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x - w / 2 + 6, y - 14, w - 12, 4);
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; H.roundRect(ctx, x - w / 2 + 8, y - 26, w * 0.4, 8, 4); ctx.fill();
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, easeInOutCubic, roundRect } = H;
  const at = (w, d) => { if (!w) return d; const v = info.timeOf(w); return v == null ? d : v; };
  const tDest = at(P.destCue, D * 0.18) - 0.3, tLen = at(P.lenCue, D * 0.3) - 0.3;
  const tPlan = at(P.planCue, D * 0.48) - 0.6, tFc = at(P.forecastCue, D * 0.7) - 0.3, tAct = at(P.actCue, D * 0.85) - 0.5;
  const days = (P.days || ['sun', 'rain', 'cloud', 'sun']).slice(0, 4), n = days.length;
  const acts = P.acts || [];
  const tPack0 = tAct + 0.35, packStep = Math.max(0.18, Math.min(0.35, (D - 1.2 - tPack0) / n));
  const tClose = tPack0 + n * packStep + 0.25;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 487, y: 760 }, { t: D, zoom: 1.0 }]);
  K.world.room(ctx, { t, time: 'day', window: true, picture: false, lamp: false, plant: true, wall: '#3a3566', floor: '#2a2650' });
  ctx.save(); ctx.translate(560, 1035); ctx.scale(1, 0.16); ctx.beginPath(); ctx.arc(0, 0, 420, 0, 7); ctx.fillStyle = '#463b78'; ctx.fill(); ctx.restore();

  // ---------------- suitcase (open, lid up behind) at the floor
  const SX = 600, SY = 1012, SW = 470, SH = 120;
  const close = H.phase(t, tClose, tClose + 0.5, easeInOutCubic);
  K.shadow(ctx, SX, SY + 6, 560, 0.45);
  // lid: a rect that rotates from upright (behind) to closed (on top)
  const lidH = 140 * Math.cos(close * Math.PI / 2) + 0, lidTop = SY - SH - lidH;
  if (close < 0.98) {
    ctx.fillStyle = '#b5543f'; roundRect(ctx, SX - SW / 2, lidTop, SW, Math.max(10, lidH), 22); ctx.fill();
    ctx.fillStyle = '#ead9bd'; roundRect(ctx, SX - SW / 2 + 16, lidTop + 14, SW - 32, Math.max(4, lidH - 22), 16); ctx.fill();
    ctx.fillStyle = '#d2bd98'; for (let i = 0; i < 2; i++) ctx.fillRect(SX - 120 + i * 220, lidTop + 14, 22, Math.max(0, lidH - 22));
    ctx.fillStyle = '#c4ab80'; roundRect(ctx, SX - 140, lidTop + 30, 280, Math.max(0, lidH * 0.4), 12); ctx.fill();
  }
  // body
  ctx.fillStyle = '#c96a50'; roundRect(ctx, SX - SW / 2, SY - SH, SW, SH, 22); ctx.fill();
  ctx.fillStyle = close < 0.5 ? '#ead9bd' : '#7d3527'; roundRect(ctx, SX - SW / 2 + 16, SY - SH + 10, SW - 32, 52, 12); ctx.fill();
  // packed clothes (stack inside)
  const packed = [];
  for (let i = 0; i < n; i++) if (t > tPack0 + i * packStep + 0.35) packed.push(i);
  packed.forEach((i, k) => folded(ctx, H, SX - 150 + i * 100, SY - SH + 50 - (i % 2) * 6, 92, CLOTH[i % CLOTH.length]));
  if (close > 0) {
    // closing lid drawn on top
    const h = 30 + 0 * close;
    ctx.save(); ctx.globalAlpha = smooth(close * 2 - 0.8);
    ctx.fillStyle = '#b5543f'; roundRect(ctx, SX - SW / 2 - 4, SY - SH - 16, SW + 8, 50, 20); ctx.fill();
    ctx.fillStyle = '#e0d4a8'; for (let i = 0; i < 10; i++) ctx.fillRect(SX - SW / 2 + 30 + i * 42, SY - SH + 6, 18, 4);
    ctx.restore(); void h;
  }
  // handle + wheels
  ctx.fillStyle = '#2a2f45'; roundRect(ctx, SX - 50, SY - SH - (close > 0.5 ? 46 : 2) + (close > 0.5 ? 0 : 0), 100, 18, 9); ctx.fill();
  ctx.fillStyle = '#1c2033'; ctx.beginPath(); ctx.arc(SX - SW / 2 + 40, SY + 4, 10, 0, 7); ctx.arc(SX + SW / 2 - 40, SY + 4, 10, 0, 7); ctx.fill();
  const tk = K.popIn(t, tClose + 0.45, 0.4);
  if (tk > 0) { ctx.save(); ctx.translate(SX + SW / 2 - 20, SY - SH - 40); ctx.scale(tk, tk); ctx.beginPath(); ctx.arc(0, 0, 34, 0, 7); ctx.fillStyle = ACC; ctx.fill(); ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-4, 11); ctx.lineTo(15, -11); ctx.stroke(); ctx.restore(); }

  // ---------------- traveller with phone (left)
  K.drawPerson(ctx, 150, 1032, 1.3, { t, pose: tk > 0 ? 'cheer' : 'phone', typing: t < tPlan ? 1 : 0, mood: 'happy', skin: 4, hair: 0, hairStyle: 'curly', shirt: '#4fb3a6', seed: 9, look: 1 });

  // ---------------- input pills -> day cards
  const fold = H.phase(t, tPlan, tPlan + 0.5, easeInOutCubic);
  const pills = [[P.dest || 'Where?', tDest, 'pin'], [P.length || 'How long?', tLen, 'cal']];
  pills.forEach(([txt, t0, icon], i) => {
    const k = K.popIn(t, t0, 0.45); if (k <= 0 || fold >= 1) return;
    const x = 300 + i * 360, y = 520;
    ctx.save(); ctx.globalAlpha = 1 - fold; ctx.translate(x, y - fold * 40); ctx.scale(k * (1 - 0.4 * fold), k * (1 - 0.4 * fold));
    ctx.fillStyle = '#f4f6fb'; roundRect(ctx, -160, -46, 320, 92, 46); ctx.fill();
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(-108, 0, 30, 0, 7); ctx.fill();
    ctx.fillStyle = K.ACCENT.deep;
    if (icon === 'pin') { ctx.beginPath(); ctx.moveTo(-108, 18); ctx.bezierCurveTo(-124, 0, -124, -18, -108, -18); ctx.bezierCurveTo(-92, -18, -92, 0, -108, 18); ctx.fill(); ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(-108, -6, 5, 0, 7); ctx.fill(); }
    else { roundRect(ctx, -124, -14, 32, 30, 5); ctx.fill(); ctx.fillStyle = ACC; ctx.fillRect(-120, -6, 24, 3); }
    ctx.font = H.font('display', 36); ctx.fillStyle = '#141829'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(txt, -64, 2);
    ctx.restore();
  });
  // day cards
  const CW = 180, gap = 22, x0 = 487 - ((n * CW + (n - 1) * gap) / 2) + CW / 2;
  for (let i = 0; i < n; i++) {
    const k = K.popIn(t, tPlan + 0.25 + i * 0.12, 0.45); if (k <= 0) continue;
    const x = x0 + i * (CW + gap), y = 445;
    ctx.save(); ctx.translate(x, y + 120); ctx.scale(k, k); ctx.translate(-x, -(y + 120));
    ctx.fillStyle = '#f4f6fb'; roundRect(ctx, x - CW / 2, y, CW, 255, 24); ctx.fill();
    ctx.font = H.font('ui', 26); ctx.fillStyle = '#3b4672'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Day ' + (i + 1), x, y + 34);
    // weather
    const w = K.popIn(t, tFc + i * 0.15, 0.4);
    if (w > 0) weather(ctx, days[i], x, y + 92, w * 1.15, t, ACC);
    // outfit on the card until it is packed
    const tp = tPack0 + i * packStep;
    if (t < tp) { folded(ctx, H, x, y + 238, 120, CLOTH[i % CLOTH.length]); }
    ctx.restore();
    // activity chip
    if (acts[i]) {
      const a = K.popIn(t, tAct + i * 0.12, 0.4);
      if (a > 0) K.drawLabel(ctx, x, y + 190, a, { text: acts[i], size: 24, accent: i % 2 === 0 });
    }
    // packing flight: card outfit -> suitcase
    const u = (t - tp) / 0.4;
    if (u > 0 && u < 1) {
      const e = easeInOutCubic(u);
      const fx = lerp(x, SX - 150 + i * 100, e), fy = lerp(y + 238, SY - SH + 50, e) - Math.sin(Math.PI * e) * 60;
      folded(ctx, H, fx, fy, lerp(120, 92, e), CLOTH[i % CLOTH.length]);
    }
  }
  ctx.restore();
}
