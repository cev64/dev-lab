// Scene "song-flood-v2" (full frame, kit v2). City street at dusk. A generic passer-by walks in and stops (body
// settles, follow-through), a first song card thumps down beside them, they look up; a trickle of cards falls on
// gravity arcs (stretch in flight, squash on landing), then after the count cue the trickle becomes a flood: a take
// (anticipation, stretch, shocked), arms up to shield, buried to the knees, then a big shrug. Stats sit in the upper
// stage: source pill, a count card that counts up, and a split bar that fills past the middle with a spring.
// params: source, prefix, value, unit, share, shareFill, shareLabel, aiShare; cues: srcCue, countCue, halfCue.
// Text defaults are the v1 texts.
export default function draw(ctx, t, info) {
  const H = info.helpers, K2 = H.kit2, M = H.motion, P = info.params || {};
  const { clamp, lerp, ease } = M;
  const D = info.duration, ACC = info.accent;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tSrc = at(P.srcCue || 'Deezer', D * 0.28), tCount = at(P.countCue || 'ninety', D * 0.42), tHalf = at(P.halfCue || 'half', D * 0.78);
  const tFlood = at('flooded', 2.3);
  const FEET = 1035, WX = 250, WS = 1.3;

  // ---------------------------------------------------------------- camera: close on the walker, then open for stats
  const PX = 487, PY = 725;
  const frame = (wx, wy, z, sx, sy) => ({ x: wx - PX - (sx - PX) / z, y: wy - PY - (sy - PY) / z, zoom: z });
  const cam = K2.cam(t, [
    { t: 0, ...frame(WX - 60, FEET, 1.3, 420, 1046) }, { t: 1.6, ...frame(WX, FEET, 1.32, 420, 1046) }, { t: tFlood + 0.2, ...frame(WX, FEET, 1.3, 400, 1046) },
    { t: tSrc + 0.4, ...frame(WX, FEET, 1.12, 150, 1046) }, { t: D, ...frame(WX, FEET, 1.15, 150, 1046) },
  ]);
  const W = K2.world2.cityStreet(ctx, { t, cam, time: 'dusk' });
  const L = W.light;

  // ---------------------------------------------------------------- card schedule (trickle, then flood)
  const N = 132, slow = 16, FL = 0.9;
  const first = tFlood - 0.5;
  const startOf = (i) => (i === 0 ? first - FL : i < slow ? first + (i / slow) * (tCount - 0.2 - first) : tCount - 0.2 + (i - slow) * 0.042);
  const slot = (i) => {
    if (i === 0) return [WX + 120, FEET - 8, 0.3];
    const r = Math.floor((i - 1) / 21);
    let x = 140 + M.hash(i, 11) * 820;
    if (i < slow && Math.abs(x - WX) < 70) x += 140;           // the trickle misses the walker
    return [x, FEET - 10 - r * 26 - M.hash(i, 2) * 12, (M.hash(i, 3) - 0.5) * 0.9];
  };
  const kindOf = (i) => (M.hash(i, 5) < (P.aiShare || 0.75) ? 'ai' : 'human');

  // ---------------------------------------------------------------- walker acting
  const walkT0 = 0, walkT1 = 1.55;
  const wk = (tt) => ease.inOut((tt - walkT0) / (walkT1 - walkT0), 1.7);
  const wx = (tt) => lerp(WX - 260, WX, wk(tt));
  const walking = t < walkT1;
  const stopLean = M.settle(t, walkT1, 0.06, 1.3, 3.5);
  const take = M.act(t, tCount + 0.15, { timing: 'take', wind: 0.6, exag: 1.3 });
  const shrug = M.act(t, tHalf + 0.35, { timing: 'normal', wind: 0.4, exag: 1.3 });
  const SHIELD = { sN: 2.5, eN: 1.5, sF: -2.4, eF: -1.45, tilt: 0.05, nod: -0.1, lean: -0.04, handN: 'open', handF: 'open' };
  let pose = 'stand', pose2 = null, poseMix = 0, expr = 'neutral', expr2 = null, exprMix = 0, look = 0.2, nod = 0, squash = 0;
  if (t > first + 0.1) { expr = 'neutral'; expr2 = 'curious'; exprMix = ease.inOut((t - first - 0.1) / 0.3); look = 0.6; nod = -0.2 * ease.inOut((t - tFlood) / 0.4); }
  if (t > tFlood + 0.3) { expr = 'curious'; expr2 = 'surprised'; exprMix = ease.inOut((t - tFlood - 0.3) / 0.4); nod = -0.35; look = 0.4; }
  if (t > tCount + 0.15) {
    expr = take.phase === 'anticipate' ? 'focused' : 'shocked'; nod = -0.4;
    if (take.phase === 'anticipate') squash = -0.12 * take.wind; else if (take.phase === 'action') squash = 0.2 * (1 - take.k * 0.4);
    squash += M.squashImpact(t, take.hit + 0.02, 0.1, 0.55);
    pose2 = SHIELD; poseMix = ease.inOut((t - take.hit - 0.2) / 0.45);
  }
  if (t > take.hit + 1.2) { expr = 'shocked'; expr2 = 'worried'; exprMix = ease.inOut((t - take.hit - 1.2) / 0.6); }
  if (t > tHalf + 0.35) { pose = SHIELD; pose2 = 'shrug'; poseMix = clamp(shrug.v); expr = 'worried'; expr2 = 'sad'; exprMix = 0.35; nod = lerp(-0.4, 0.05, clamp(shrug.v)); look = 0.1; }
  const bounceY = (tt) => { const a = M.act(tt, tCount + 0.15, { timing: 'take', wind: 0.6, exag: 1.3 }); return a.phase === 'action' ? -30 * Math.sin(a.k * Math.PI) : 0; };

  // ================================================================ world plane
  W.stage(ctx, () => {
    K2.drawHuman(ctx, wx(t), FEET, WS, {
      t, seed: 9, age: 'adult', body: 'slim', skin: 1, hair: 5, hairStyle: 'short', eyes: 2, outfit: 'hoodie', top: '#4f6fc2', bottom: 'charcoal',
      pose, pose2, poseMix, walk: walking ? wk(t) * 2.6 : null, cadence: 0.9, stride: 0.8, drive: (tt) => wx(tt) * 1.1, driveY: bounceY,
      facing: walking ? 0.8 : 0.4, lean: stopLean, look, nod, expr, expr2, exprMix, squash, light: L, exag: t > tCount ? 1.2 : 1,
    });
    // landed cards (the pile), then falling cards in front
    for (let i = 0; i < N; i++) {
      const s0 = startOf(i);
      if (t < s0 + FL) continue;
      const [x, y, rot] = slot(i);
      const q = M.squashImpact(t, s0 + FL, 0.3, 0.35);
      card(x, y - 18, 0.44, rot, kindOf(i), q, 0);
    }
    for (let i = 0; i < N; i++) {
      const s0 = startOf(i), u = (t - s0) / FL;
      if (u <= 0 || u >= 1) continue;
      const [x, y, rot] = slot(i);
      const x0 = x + (M.hash(i, 7) - 0.5) * 160, p0 = [x0, 430], p1 = [x, y - 18];
      const f = (k) => M.arc(p0, p1, k, (M.hash(i, 9) - 0.5) * 60, (z) => ease.in(z, 2));
      const p = f(u), pn = f(Math.min(1, u + 0.04));
      const st = M.stretchFromVelocity((pn[0] - p[0]) / (0.04 * FL), (pn[1] - p[1]) / (0.04 * FL), 0.00035, 0.32);
      const fadeIn = clamp((W.toScreen(p[0], p[1])[1] - 405) / 60);
      if (fadeIn <= 0) continue;
      ctx.save(); ctx.globalAlpha = fadeIn;
      card(p[0], p[1], 0.5, rot + (1 - u) * 3.2 * (M.hash(i, 8) - 0.5), kindOf(i), 0, st);
      ctx.restore();
    }
  });
  W.front(ctx);

  // ================================================================ stats (screen space)
  const sp = pop(t, tSrc - 0.12);
  if (sp) pill(560, 455, sp, P.source || 'Deezer, Oct 13, 2026', { size: 30, dot: true });
  const cp = pop(t, tCount - 0.2, { timing: 'normal', wind: 0.3, overshoot: 0.12 });
  if (cp) {
    ctx.save(); ctx.translate(560, 600 + M.hold(t, 3, 3)); ctx.scale(cp.s * cp.sx, cp.s * cp.sy);
    panelBox(-290, -100, 580, 200);
    ctx.font = K2.font.ui(28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(P.prefix || 'Nearly', 0, -66);
    const k = ease.out(clamp((t - tCount) / 1.4), 3);
    const v = Math.round((P.value || 90000) * k / 100) * 100;
    const kick = 1 + 0.06 * M.squashImpact(t, tCount + 1.4, -1, 0.4);
    ctx.save(); ctx.scale(kick, kick);
    ctx.font = K2.font.display(104); ctx.fillStyle = ACC; ctx.shadowColor = H.rgba(ACC, 0.5); ctx.shadowBlur = 24;
    ctx.fillText(v.toLocaleString('en-US'), 0, 6); ctx.restore();
    ctx.font = K2.font.ui(28); ctx.fillStyle = '#ffffff'; ctx.fillText(P.unit || 'fully AI tracks a day', 0, 74);
    ctx.restore();
  }
  const hp = pop(t, tHalf - 0.3, { timing: 'normal', wind: 0.3, overshoot: 0.12 });
  if (hp) {
    const w = 500;
    ctx.save(); ctx.translate(560, 800 + M.hold(t, 8, 3)); ctx.scale(hp.s * hp.sx, hp.s * hp.sy);
    panelBox(-w / 2 - 22, -56, w + 44, 154);
    H.roundRect(ctx, -w / 2, -30, w, 52, 26); ctx.fillStyle = '#3b4260'; ctx.fill();
    const f = (P.shareFill || 0.55) * clamp(M.spring(t, tHalf, 0, 1, 1.1, 0.42), 0, 1.15);
    if (f > 0.02) { const g = ctx.createLinearGradient(0, -30, 0, 22); g.addColorStop(0, H.mixHex(ACC, '#ffffff', 0.25)); g.addColorStop(1, H.mixHex(ACC, '#000000', 0.1)); H.roundRect(ctx, -w / 2, -30, w * f, 52, 26); ctx.fillStyle = g; ctx.fill(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -42); ctx.lineTo(0, 34); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = K2.font.display(32); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = H.mixHex(ACC, '#000000', 0.62);
    if (f > 0.15) ctx.fillText(P.share || '>50%', -w / 2 + 22, -3);
    ctx.font = K2.font.ui(26); ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff'; ctx.fillText(P.shareLabel || 'of new music on peak days', 0, 62);
    ctx.restore();
  }

  // ================================================================ helpers
  function panelBox(x, y, w, h) {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 28; ctx.shadowOffsetY = 10;
    H.roundRect(ctx, x, y, w, h, 30); ctx.fillStyle = 'rgba(12,14,26,0.9)'; ctx.fill(); ctx.restore();
    const g = ctx.createLinearGradient(0, y, 0, y + h * 0.5); g.addColorStop(0, 'rgba(255,255,255,0.08)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    H.roundRect(ctx, x, y, w, h, 30); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 2; ctx.stroke();
  }
  function card(x, y, s, rot, kind, q, st) {
    ctx.save();
    if (st && st.s > 0.001) M.squashTransform(ctx, x, y, st.s, st.angle);
    ctx.translate(x, y);
    if (q) { ctx.translate(0, 50 * s); const z = M.squash(q); ctx.scale(z.sx, z.sy); ctx.translate(0, -50 * s); }
    ctx.rotate(rot); ctx.scale(s, s);
    const base = kind === 'ai' ? ACC : '#f2f4fa';
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
    const g = ctx.createLinearGradient(-50, -50, 50, 50); g.addColorStop(0, H.mixHex(base, '#ffffff', 0.22)); g.addColorStop(1, H.mixHex(base, '#3a2a4a', 0.25));
    H.roundRect(ctx, -50, -50, 100, 100, 18); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 4; ctx.stroke();
    if (kind === 'ai') {
      H.roundRect(ctx, -30, -24, 60, 46, 12); ctx.fillStyle = '#ffffff'; ctx.fill();
      H.roundRect(ctx, -22, -14, 44, 22, 8); ctx.fillStyle = '#161927'; ctx.fill();
      ctx.fillStyle = '#7ff3ff'; ctx.fillRect(-14, -7, 8, 8); ctx.fillRect(6, -7, 8, 8);
    } else {
      ctx.fillStyle = '#161927'; ctx.strokeStyle = '#161927'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-4, 22); ctx.lineTo(-4, -26); ctx.lineTo(22, -32); ctx.lineTo(22, 14); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-14, 24, 13, 10, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(12, 16, 13, 10, -0.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.moveTo(-46, -46); ctx.lineTo(4, -46); ctx.lineTo(-46, 4); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function pop(tt, t0, o = {}) {
    const a = M.act(tt, t0, Object.assign({ timing: 'snappy', wind: 0.35, overshoot: 0.16 }, o));
    if (a.phase === 'before') return null;
    let sc, q;
    if (a.phase === 'anticipate') { sc = 0.25 * a.wind + 0.02; q = -0.3 * a.wind; }
    else { const w0 = -(o.wind == null ? 0.35 : o.wind) * 0.75; sc = 0.27 + 0.73 * (a.v - w0) / (1 - w0); q = a.phase === 'action' ? 0.2 * (1 - a.k) : M.squashImpact(tt, a.hit, 0.12, 0.42); }
    const z = M.squash(q);
    return { s: Math.max(0.02, sc), sx: z.sx, sy: z.sy, hit: a.hit };
  }
  function pill(x, y, p, text, o = {}) {
    const size = o.size || 26;
    ctx.save(); ctx.translate(x, y); ctx.scale(p.s * (p.sx || 1), p.s * (p.sy || 1));
    ctx.font = K2.font.ui(size);
    const tw = ctx.measureText(text).width, padL = o.dot ? size * 1.35 : size * 0.75, w = tw + padL + size * 0.75, h = size * 1.75;
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
    H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
    if (o.accent) { const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, H.mixHex(ACC, '#ffffff', 0.25)); g.addColorStop(1, H.mixHex(ACC, '#000000', 0.12)); ctx.fillStyle = g; }
    else ctx.fillStyle = 'rgba(14,16,30,0.9)';
    ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = o.accent ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.16)'; ctx.lineWidth = 2; ctx.stroke();
    if (o.dot) { ctx.beginPath(); ctx.arc(-w / 2 + size * 0.78, 0, size * 0.22, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill(); }
    ctx.fillStyle = o.accent ? H.mixHex(ACC, '#000000', 0.68) : '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(text, -w / 2 + padL, 1);
    ctx.restore();
  }
}
