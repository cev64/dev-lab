// Scene "kids-question-v2" (kit v2, full frame, 1 beat, payoff). Night living room (K2.world2.livingRoom).
// A generic parent and kid share the sofa (cushion sink), the kid on a glowing phone. "8 STATES" pops, "VS" slams
// in (anticipation, heavy squash), the chatbot stand-in (K2.drawAssistant, not the mascot) springs up from behind the
// sofa arm (dip, stretch, squash) with "1 CHATBOT". The row clears and the question card drops in on an arc and
// lands with squash; the answer pills pop on their cues (the assistant bobs at "companies", the parent gives an
// exaggerated seated shrug at "parents"), the kid looks up from the phone (a small take) and a "?" settles between.
// params: left, right, vs, question, a {text, cue}, b {text, cue}, rightCue, qCue
let ACC_ = '#ffe14a', INK_ = '#15140a';
export default function draw(ctx, t, info) {
  const H = info.helpers, K2 = H.kit2, M = H.motion, P = info.params || {}, D = info.duration, ACC = info.accent;
  ACC_ = ACC; INK_ = K2.ACCENT.deep;
  const { clamp, lerp, ease } = M;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const tVs = at('versus', 0.6) - 0.05;
  const tR = at(P.rightCue || 'chatbot', 1.3) - 0.3;
  const tQ = at(P.qCue || 'who', D * 0.38) - 0.2;
  const A = P.a || { text: 'The companies', cue: 'companies' }, B = P.b || { text: 'The parents', cue: 'parents' };
  const tA = at(A.cue, D * 0.68) - 0.25, tB = at(B.cue, D * 0.84) - 0.25;

  const cam = K2.cam(t, [{ t: 0, x: -20, y: 30, zoom: 1.1 }, { t: tQ, x: -22, y: 22, zoom: 1.14 }, { t: D, x: -24, y: 24, zoom: 1.16 }]);
  const W = K2.world2.livingRoom(ctx, { t, cam });
  const L = W.light, S = W.sofa;

  // assistant springs up from behind the sofa's right arm
  const pop = M.act(t, tR - 0.1, { timing: 'snappy', wind: 0.5, overshoot: 0.2 });
  const ax = 640, ay = S.seatY + 4;
  const shrug = M.act(t, tB + 0.05, { timing: 'normal', wind: 0.3, overshoot: 0.2, exag: 1.3 });
  const lookUp = M.act(t, tB + 0.3, { timing: 'take', wind: 0.4, exag: 1.1 });

  W.stage(ctx, () => {
    // parent
    K2.drawHuman(ctx, 285, S.feetY, 1.12, {
      t, seed: 9, age: 'adult', outfit: 'cardigan', top: '#4a7bd0', bottom: 'charcoal', hairStyle: 'long', hair: 2, skin: 1, light: L,
      pose: 'sit', pose2: 'sit-talk', poseMix: clamp(shrug.v, 0, 1.2), rig: { lift: 9 * Math.max(0, shrug.v) * (1 - clamp((t - tB - 1.1) / 0.5)) },
      seatH: S.seatH / 1.12, cushion: S.color, facing: 0.4, look: t < tQ ? 0.5 : t < tB ? 0.3 + M.hold(t, 4, 0.1) : -0.1,
      expr: t < tQ ? 'worried' : t < tB ? 'thinking' : 'smirk', expr2: t > tB ? 'worried' : null, exprMix: 0.4, exag: 1.25,
    });
    // kid with phone; looks up at the end
    const up = clamp(lookUp.v, -0.3, 1.2);
    K2.drawHuman(ctx, 470, S.feetY, 1.3, {
      t, seed: 4, age: 'kid', outfit: 'hoodie', top: '#e0784f', hairStyle: 'curly', hair: 0, skin: 3, eyes: 0, light: L,
      pose: 'sit-phone', hold: 'phone', screen: 1, seatH: S.seatH / 1.3, cushion: S.color, facing: 0.35,
      nod: -0.4 * up, look: -0.35 * clamp(up), expr: up > 0.3 ? 'curious' : 'focused',
      squash: lookUp.phase === 'anticipate' ? -0.06 * lookUp.wind : M.squashImpact(t, lookUp.hit, 0.07, 0.4),
    });
    // assistant (behind the sofa arm until it pops)
    if (pop.phase !== 'before') {
      const v = pop.v, rise = (1 - clamp(v)) * 120;
      let sq = pop.phase === 'anticipate' ? -0.2 * pop.wind : pop.phase === 'action' ? 0.3 * (1 - pop.k) : 0;
      sq += M.squashImpact(t, pop.hit, 0.22, 0.5);
      const bob = t > tA && t < tA + 1 ? 0.08 * Math.sin((t - tA) * 12) * (1 - (t - tA)) : 0;
      ctx.save(); ctx.beginPath(); ctx.rect(-400, -400, 1900, ay + 400 + (pop.phase === 'settle' || pop.phase === 'done' ? 400 : 0)); ctx.clip();
      ctx.save(); M.squashTransform(ctx, ax, ay, sq + bob, 0);
      K2.drawAssistant(ctx, ax, ay + rise, 0.62 * clamp(v + 0.3, 0, 1.15), { t, seed: 3, light: L, facing: -0.5, mood: t > tA ? 'thinking' : 'happy' });
      ctx.restore(); ctx.restore();
    }
  });
  W.front(ctx);

  // row: 8 STATES  VS  1 CHATBOT (clears for the question)
  const rowOut = tQ - 0.05;
  pill(ctx, H, M, t, 245, 470, 0.1, String(P.left || '8 states').toUpperCase(), { accent: true, size: 40, out: rowOut, seed: 1 });
  pill(ctx, H, M, t, 735, 470, tR + 0.05, String(P.right || '1 chatbot').toUpperCase(), { dot: true, size: 40, out: rowOut + 0.05, seed: 2 });
  const vs = M.act(t, tVs - 0.25, { timing: 'heavy', wind: 0.4, overshoot: 0.1 });
  if (vs.phase !== 'before' && t < rowOut + 0.3) {
    const s = (vs.phase === 'anticipate' ? 1.8 + 0.4 * vs.wind : lerp(1.8, 1, clamp(vs.v))) * (1 - ease.backIn(clamp((t - rowOut) / 0.3), 1.4));
    const q = M.squashImpact(t, vs.hit, 0.3, 0.5), a = vs.phase === 'anticipate' ? 0.4 * vs.wind : clamp(vs.v + 0.4);
    ctx.save(); ctx.globalAlpha = clamp(a); ctx.translate(490, 470); ctx.scale(s / (1 + q), s * (1 + q)); ctx.rotate(-0.06);
    ctx.font = H.font('display', 56); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(10,10,24,0.85)'; ctx.strokeText(P.vs || 'VS', 0, 0); ctx.fillStyle = '#ffffff'; ctx.fillText(P.vs || 'VS', 0, 0);
    ctx.restore();
  }
  // question card: drops on an arc, lands with squash, moving hold
  if (t > tQ - 0.05) {
    const land = tQ + 0.35, k = clamp((t - tQ + 0.05) / 0.4);
    const p = M.arc([520, 380], [487, 430], ease.in(k, 1.6), 12, (x) => x);
    const sq = t < land ? 0.12 * k : M.squashImpact(t, land, 0.14, 0.5);
    const Wd = 820, Hh = 150, sc = lerp(0.5, 1, ease.out(k, 2));
    ctx.save(); M.squashTransform(ctx, p[0], p[1] + Hh / 2, sq, 0); ctx.translate(p[0], p[1] + M.hold(t, 7, 2)); ctx.scale(sc, sc);
    ctx.rotate(t < land ? 0.06 * (1 - k) : M.settle(t, land, 0.015, 1.5, 4));
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 26; ctx.shadowOffsetY = 10;
    H.roundRect(ctx, -Wd / 2, -Hh / 2, Wd, Hh, 28); ctx.fillStyle = 'rgba(10,11,26,0.96)'; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
    let size = 48, lines; for (; size >= 30; size -= 2) { lines = H.wrap(ctx, P.question || 'Who should keep kids safe with AI?', 'display', size, Wd - 60); if (lines.length <= 2) break; }
    ctx.font = H.font('display', size); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lh = size * 1.15, y0 = 2 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, j) => ctx.fillText(ln, 0, y0 + j * lh));
    ctx.restore();
  }
  // answers + a settling "?"
  pill(ctx, H, M, t, 760, 530, tA, A.text, { dot: true, size: 32, seed: 3 });
  pill(ctx, H, M, t, 220, 530, tB, B.text, { dot: true, size: 32, seed: 4 });
  const qm = M.act(t, Math.max(tA, tB) + 0.3, { timing: 'snappy', wind: 0.45, overshoot: 0.3 });
  if (qm.phase !== 'before') {
    const s = qm.phase === 'anticipate' ? 0.25 * qm.wind : Math.max(0, qm.v), q = M.squashImpact(t, qm.hit, 0.25, 0.5);
    ctx.save(); ctx.translate(490, 535 + M.hold(t, 9, 3)); ctx.rotate(M.settle(t, qm.hit, 0.2, 1.8, 3)); ctx.scale(s / (1 + q), s * (1 + q));
    K2.glow(ctx, 0, -6, 70, ACC, 0.45);
    ctx.font = H.font('display', 76); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 0);
    ctx.restore();
  }
}

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
