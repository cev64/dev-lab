// Scene "court-asks-v2" (kit v2, full frame, 1 beat). Courtroom (K2.world2.courtroom).
// Shot A (medium, on the bench): a generic lawyer (left) presents each request with an arcing reach (wind-up,
//   overshoot, settle). Header pill "The states ask for"; on "penalties" heavy coins fall (accelerating) and
//   stack with squash; on "compensation" bills flutter down on swaying arcs; on "changes" a big wrench swings in on
//   an arc (anticipation pull-back) and tightens a bolt on the chatbot stand-in (K2.drawAssistant, never the
//   mascot), which squashes with each turn. A text pill labels each request.
// Shot B (wide, eased pull-back): the judge behind the bench, a timeline card draws itself: "June / Florida sues
//   alone" then "Oct. / 8 more states" (dots pop with squash, the line grows with slow-in/out).
// params: head, tiles [{text, cue}] (3), early {when, text}, late {when, text}, headCue ("want"), earlyCue ("florida")
let ACC_ = '#ffe14a', INK_ = '#15140a';
export default function draw(ctx, t, info) {
  const H = info.helpers, K2 = H.kit2, M = H.motion, P = info.params || {}, D = info.duration, ACC = info.accent;
  ACC_ = ACC; INK_ = K2.ACCENT.deep;
  const { clamp, lerp, ease } = M;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const tiles = (P.tiles || [
    { text: 'Financial penalties', cue: 'penalties' },
    { text: 'Compensation for consumers', cue: 'compensation' },
    { text: 'Changes to how ChatGPT works', cue: 'changes' },
  ]).slice(0, 3);
  const tHead = at(P.headCue || 'want', 0.4) - 0.3;
  const tT = tiles.map((x, i) => at(x.cue, 1.4 + i * 1.8));
  const tEarly = at(P.earlyCue || 'florida', D * 0.7) - 0.2;
  const tLate = tEarly + 1.4;
  const early = P.early || { when: 'June', text: 'Florida sues alone' };
  const late = P.late || { when: 'Oct.', text: '8 more states' };
  const tWide = tEarly - 0.9;

  const cam = K2.cam(t, [
    { t: 0, x: 50, y: 30, zoom: 1.14 }, { t: tT[1], x: 60, y: 38, zoom: 1.2 }, { t: tWide - 0.3, x: 60, y: 40, zoom: 1.22 },
    { t: tWide + 0.9, x: 50, y: 45, zoom: 1.12 }, { t: D, x: 50, y: 45, zoom: 1.16 },
  ]);
  const W = K2.world2.courtroom(ctx, { t, cam });
  const L = W.light, benchY = 622;
  const props = [[410, benchY], [575, benchY], [745, benchY]];

  // lawyer reach: pose-to-pose between targets, wind-up dip, overshoot, settle (arcs)
  const lx = 270, ls = 1.4;
  const rest = [40, -175];
  const tgt = props.map((p) => [(p[0] - lx) / ls, (p[1] - 30 - 1035) / ls]);
  const reachPt = (tt) => {
    let prev = rest, cur = rest, a = null;
    for (let i = 0; i < 3; i++) if (tt >= tT[i] - 0.55) { prev = i ? tgt[i - 1] : rest; cur = tgt[i]; a = M.act(tt, tT[i] - 0.55, { timing: 'normal', wind: 0.25, overshoot: 0.1 }); }
    if (tt > tWide - 0.4) { const k = ease.inOut((tt - tWide + 0.4) / 0.6); return [lerp(tgt[2][0], rest[0], k), lerp(tgt[2][1], rest[1], k)]; }
    if (!a) return [rest[0] + M.hold(tt, 1, 3), rest[1] + M.hold(tt, 2, 3)];
    const v = a.v, b = Math.sin(Math.PI * clamp(v)) * 22;
    return [lerp(prev[0], cur[0], v), lerp(prev[1], cur[1], v) - b];
  };
  const gesturing = t > tT[0] - 0.6 && t < tWide;

  // ================================================================ stage
  W.stage(ctx, () => {
    // judge behind the bench (seen in the wide)
    ctx.save(); ctx.beginPath(); ctx.rect(-400, -400, 1900, benchY + 404); ctx.clip();
    K2.drawHuman(ctx, 600, 866, 1.18, { t, seed: 21, age: 'older', outfit: 'robe', hairStyle: 'short', hair: 4, skin: 4, glasses: true, facing: -0.2, light: L, pose: 'stand', look: t > tEarly ? -0.5 : 0, expr: 'neutral', shadow: false });
    ctx.restore();
    K2.drawGavel(ctx, 845, benchY + 2, 0.8, { hit: 1, light: L });

    // 1) coins: heavy, accelerate as they fall, squash on landing, stack
    let landed = 0;
    for (let i = 0; i < 4; i++) {
      const d0 = tT[0] - 0.42 + i * 0.16, d1 = d0 + 0.32;
      if (t < d0) continue;
      if (t >= d1) { landed++; continue; }
      const k = ease.in((t - d0) / 0.32, 2.2), y = lerp(benchY - 150, props[0][1] - landed * 9, k);
      const sv = 0.25 * k;
      ctx.save(); M.squashTransform(ctx, props[0][0] - 10 + i * 6, y - 30, sv, 0);
      K2.drawCoin(ctx, props[0][0] - 10 + i * 6 + (1 - k) * -30, y, 0.85, { spin: t * 9 + i, light: L, shadow: false });
      ctx.restore();
    }
    if (landed > 0) {
      let sq = 0; for (let i = 0; i < 4; i++) sq += M.squashImpact(t, tT[0] - 0.42 + i * 0.16 + 0.32, 0.2, 0.4);
      ctx.save(); M.squashTransform(ctx, props[0][0], props[0][1], sq, 0);
      K2.drawCoin(ctx, props[0][0], props[0][1], 0.85, { count: landed, spin: 0.25 * Math.sin(t * 1.5), light: L });
      ctx.restore();
    }

    // 2) bills: flutter down on swaying arcs, then add to the stack
    let bl = 0;
    for (let i = 0; i < 5; i++) {
      const d0 = tT[1] - 0.6 + i * 0.17, d1 = d0 + 0.7;
      if (t < d0) continue;
      if (t >= d1) { bl++; continue; }
      const k = (t - d0) / 0.7, y = lerp(benchY - 160, benchY - 20 - bl * 6, ease.inOut(k, 1.6)), x = props[1][0] + Math.sin(k * Math.PI * 2 + i) * 50 * (1 - k);
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(k * Math.PI * 3 + i) * 0.5 * (1 - k)); ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.cos(k * 6 + i)));
      const g = ctx.createLinearGradient(-60, -26, 60, 26); g.addColorStop(0, '#9fd0a6'); g.addColorStop(1, '#5f9a6b');
      H.roundRect(ctx, -62, -28, 124, 56, 5); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; H.roundRect(ctx, -54, -20, 108, 40, 4); ctx.stroke();
      ctx.restore();
    }
    if (bl > 0) {
      let sq = 0; for (let i = 0; i < 5; i++) sq += M.squashImpact(t, tT[1] - 0.6 + i * 0.17 + 0.7, 0.1, 0.35);
      ctx.save(); M.squashTransform(ctx, props[1][0], props[1][1], sq, 0);
      K2.drawBills(ctx, props[1][0], props[1][1], 0.9, { count: bl, light: L });
      ctx.restore();
    }

    // 3) assistant on the bench end; a wrench swings in and tightens a bolt on it
    const wA = M.act(t, tT[2] - 0.55, { timing: 'heavy', wind: 0.5, overshoot: 0.06 });
    const turns = t > wA.hit ? Math.max(0, Math.sin((t - wA.hit) * 9)) * (1 - clamp((t - wA.hit) / 1.6)) : 0;
    const asq = (t > wA.hit && t < wA.hit + 1.6 ? -0.1 * turns : 0) + M.squashImpact(t, wA.hit, 0.2, 0.5);
    K2.drawAssistant(ctx, props[2][0], props[2][1], 0.56, { t, seed: 5, light: L, facing: -0.4, squash: asq, mood: t > wA.hit - 0.3 && t < wA.hit + 1.3 ? 'alert' : 'thinking' });
    if (wA.phase !== 'before') {
      const bolt = [props[2][0] + 50, props[2][1] - 110];
      const from = [bolt[0] + 200, bolt[1] - 90], v = wA.v;
      const p = [lerp(from[0], bolt[0], v) + Math.sin(Math.PI * clamp(v)) * 60, lerp(from[1], bolt[1], v) - Math.sin(Math.PI * clamp(v)) * 50];
      const out = ease.inOut((t - wA.hit - 1.7) / 0.5);
      const ang = lerp(-1.2, 0.35, clamp(v)) + 0.5 * turns + M.settle(t, wA.hit, 0.1, 2, 5);
      ctx.save(); ctx.globalAlpha = 1 - out; ctx.translate(p[0] + out * 220, p[1] - out * 200); ctx.rotate(ang);
      wrench(ctx, L);
      ctx.restore();
      if (turns > 0.6) for (let i = 0; i < 4; i++) { const a = i * 1.7 + t * 3; ctx.fillStyle = `rgba(255,240,180,${0.7 * turns})`; ctx.beginPath(); ctx.arc(bolt[0] + Math.cos(a) * 36, bolt[1] + Math.sin(a) * 30, 4, 0, Math.PI * 2); ctx.fill(); }
    }

    // lawyer (front, left): presents each request with an arcing reach
    K2.drawHuman(ctx, lx, 1035, ls, {
      t, seed: 6, age: 'adult', outfit: 'suit', top: '#3b4580', bottom: '#2a3050', hairStyle: 'bun', hair: 1, skin: 0, light: L,
      facing: 0.5, pose: gesturing ? 'present' : 'stand', reach: gesturing ? reachPt(t) : null, look: gesturing ? 0.5 : 0.1,
      expr: t > tWide ? 'smirk' : 'focused', drive: (tt) => reachPt(tt)[0] * 0.8, exag: 1.1,
    });
  });
  W.front(ctx);

  // ================================================================ UI
  const outA = tWide - 0.2;
  pill(ctx, H, M, t, 487, 418, tHead, P.head || 'The states ask for', { accent: true, size: 32, out: outA, seed: 1 });
  const ps = [[360, 630], [520, 700], [690, 770]];
  tiles.forEach((tile, i) => pill(ctx, H, M, t, ps[i][0], ps[i][1], tT[i] - 0.1, tile.text, { dot: true, size: 28, out: outA + 0.05 * i, seed: 2 + i, maxW: 380 }));

  // timeline card (shot B)
  const ck = M.act(t, tEarly - 0.45, { timing: 'normal', wind: 0, overshoot: 0.1 });
  if (ck.phase !== 'before') {
    const s = ck.phase === 'anticipate' ? 0.3 * ck.wind : Math.max(0, ck.v);
    const x0 = 300, x1 = 680, y = 545;
    ctx.save(); ctx.translate(487, y + M.hold(t, 9, 2)); ctx.scale(s, s); ctx.translate(-487, -y);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    H.roundRect(ctx, x0 - 120, y - 120, x1 - x0 + 240, 200, 26); ctx.fillStyle = 'rgba(10,10,22,0.93)'; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
    const lk = ease.inOut((t - tEarly) / (tLate - tEarly + 0.2));
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, lk), y); ctx.stroke();
    const dot = (x, t0, when, text, hot) => {
      const a = M.act(t, t0 - 0.12, { timing: 'snappy', wind: 0.4, overshoot: 0.22 });
      if (a.phase === 'before') return;
      const k = a.phase === 'anticipate' ? 0.3 * a.wind : Math.max(0, a.v), q = M.squashImpact(t, a.hit, 0.2, 0.4);
      ctx.save(); ctx.translate(x, y); ctx.scale(k / (1 + q), k * (1 + q));
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fillStyle = hot ? ACC : '#c9d2f5'; ctx.fill();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = H.font('display', 34); ctx.fillStyle = hot ? ACC : '#ffffff'; ctx.fillText(String(when).toUpperCase(), 0, -60);
      const f = H.fitText(ctx, text, 'ui', 28, 22, 260); ctx.font = f.font; ctx.fillStyle = '#ffffff'; ctx.fillText(f.text, 0, 46);
      ctx.restore();
    };
    dot(x0, tEarly, early.when, early.text, false);
    dot(x1, tLate, late.when, late.text, true);
    ctx.restore();
  }
}

function wrench(ctx, L) {
  const g = ctx.createLinearGradient(-14, 0, 14, 0); g.addColorStop(0, '#e9edf5'); g.addColorStop(0.5, '#b9c0cf'); g.addColorStop(1, '#7d8598');
  ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
  ctx.fillStyle = g; H_rr(ctx, -13, 10, 26, 190, 13); ctx.fill();
  ctx.strokeStyle = g; ctx.lineWidth = 26; ctx.beginPath(); ctx.arc(0, 0, 27, -Math.PI / 2 + 0.62, Math.PI * 1.5 - 0.62); ctx.stroke();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; H_rr(ctx, -8, 30, 5, 150, 3); ctx.fill();
  void L;
}
function H_rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }

// pill (screen space): seed dot gathers (anticipation), pops with stretch + overshoot, squashes, moving hold
function pill(ctx, H, M, t, x, y, t0, text, o = {}) {
  const a = M.act(t, t0 - 0.12, { timing: 'snappy', wind: 0.35, overshoot: 0.16 });
  if (a.phase === 'before') return;
  let s, q = 0;
  if (a.phase === 'anticipate') { s = 0.2 * a.wind; q = -0.25 * a.wind; } else { s = Math.max(0, a.v); q = a.phase === 'action' ? 0.2 * (1 - a.k) : 0; }
  q += M.squashImpact(t, a.hit, 0.12, 0.4) + (o.bump || 0);
  if (o.out != null && t > o.out) { const e = M.ease.backIn(M.clamp((t - o.out) / 0.3), 1.4); s *= 1 - e; if (s <= 0.01) return; }
  const size = o.size || 30;
  ctx.save();
  ctx.translate(x, y + M.hold(t, o.seed || 0, 2.2));
  const sy = Math.max(0.5, 1 + q); ctx.scale(s / sy, s * sy);
  ctx.font = H.font('ui', size);
  const tw = Math.min(o.maxW || 760, ctx.measureText(text).width), dotW = o.dot ? size * 0.9 : 0;
  const w = tw + dotW + size * 1.4, h = size * 1.9;
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.accent ? (o.ACC || ACC_) : 'rgba(12,12,24,0.92)';
  if (o.accent) ctx.fillStyle = o.fill || ctx.fillStyle;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  if (!o.accent) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke(); }
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  let tx = -w / 2 + size * 0.7;
  if (o.dot) { ctx.beginPath(); ctx.arc(tx + size * 0.25, 1, size * 0.22, 0, Math.PI * 2); ctx.fillStyle = o.ACC || ACC_; ctx.fill(); tx += dotW; }
  ctx.fillStyle = o.accent ? (o.ink || INK_) : '#ffffff';
  const f = H.fitText(ctx, text, 'ui', size, size * 0.7, tw + 1); ctx.font = f.font;
  ctx.fillText(f.text, tx, 2);
  ctx.restore();
}
