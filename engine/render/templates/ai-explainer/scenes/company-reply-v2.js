// Scene "company-reply-v2" (kit v2, full frame, 1 beat). Dusk city street (K2.world2.cityStreet).
// A generic company tower (name only as a plain text pill, no logo). A generic spokesperson (left) holds a statement
// and gestures pose-to-pose (stand -> present -> point) with follow-through. A verbatim quote panel pops and types in;
// on "protections" a shield dips (anticipation), springs up with stretch, lands with squash and draws its check;
// feature pills pop on their cues while a generic parent and kid stroll past (walk cycles, secondary action).
// Caveat: the street dims, a card drops on an arc and lands with squash; its balance scale swings and settles level
// (follow-through); "Not proven in court" pops on its cue.
// params: company, by, quote, feats [{text, cue}], banner1, banner2, quoteCue, shieldCue, cautionCue, provenCue
let ACC_ = '#ffe14a', INK_ = '#15140a';
export default function draw(ctx, t, info) {
  const H = info.helpers, K2 = H.kit2, M = H.motion, P = info.params || {}, D = info.duration, ACC = info.accent;
  ACC_ = ACC; INK_ = K2.ACCENT.deep;
  const { clamp, lerp, ease } = M;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const tQ = at(P.quoteCue || 'industry', 1.8) - 0.4;
  const tSh = at(P.shieldCue || 'protections', 3.6) - 0.3;
  const feats = (P.feats || [{ text: 'Parental controls', cue: 'parental' }, { text: 'Break reminders', cue: 'break' }]).slice(0, 2);
  const tF = feats.map((f, i) => at(f.cue, 5 + i * 1.4) - 0.25);
  const tC = at(P.cautionCue || 'allegations', D * 0.75) - 0.3;
  const tP = at(P.provenCue || 'proven', tC + 1.4) - 0.2;

  const cam = K2.cam(t, [
    { t: 0, x: 80, y: 40, zoom: 1.12 }, { t: tQ + 0.4, x: 0, y: 70, zoom: 1.3 }, { t: tC, x: 10, y: 72, zoom: 1.36 }, { t: D, x: 10, y: 80, zoom: 1.42 },
  ]);
  const W = K2.world2.cityStreet(ctx, { t, cam });
  const L = W.light, gy = W.groundY;
  const towerX = 640;

  // spokesperson pose-to-pose
  const pA = M.act(t, tQ - 0.3, { timing: 'normal', wind: 0.3 });
  const pB = M.act(t, tSh - 0.35, { timing: 'normal', wind: 0.35, overshoot: 0.12 });
  const pC = ease.inOut((t - tC + 0.2) / 0.6);
  let pose = 'stand', pose2 = 'present', mix = clamp(pA.v, -0.3, 1.1);
  if (t > tSh - 0.35) { pose = 'present'; pose2 = 'point'; mix = clamp(pB.v, -0.3, 1.1); }
  if (t > tC - 0.2) { pose = 'point'; pose2 = 'stand'; mix = pC; }
  const armSig = (tt) => (tt > tSh - 0.35 ? M.act(tt, tSh - 0.35, { timing: 'normal', wind: 0.35 }).v : M.act(tt, tQ - 0.3, { timing: 'normal', wind: 0.3 }).v) * 30;

  // shield: dips (anticipation), springs up (stretch), lands (squash), check
  const sA = M.act(t, tSh - 0.15, { timing: 'heavy', wind: 0.35, overshoot: 0.1 });

  // strolling parent + kid (from the right, toward the left)
  const s0 = tF[0] - 1.6, s1 = s0 + 5.2;
  const walkX = (tt) => lerp(1180, 380, ease.inOut((tt - s0) / (s1 - s0), 1.4));

  const dim = ease.inOut((t - tC) / 0.45);
  W.stage(ctx, () => {
    K2.drawBuilding(ctx, towerX, gy, 0.98, { t, color: '#5b6aa8', floors: 7, lit: 0.6, light: L });
    // shield in front of the tower base
    if (sA.phase !== 'before') {
      const v = sA.v, rise = (1 - clamp(v)) * 140;
      let sq = sA.phase === 'anticipate' ? -0.2 * sA.wind : sA.phase === 'action' ? 0.25 * (1 - sA.k) : 0;
      sq += M.squashImpact(t, sA.hit, 0.18, 0.5);
      const sc = 1.05 * clamp(sA.phase === 'anticipate' ? 0.25 : v, 0, 1.1);
      K2.glow(ctx, towerX, gy - 110, 190, ACC, 0.3 * clamp(v));
      ctx.save(); M.squashTransform(ctx, towerX, gy, sq, 0);
      if (sc > 0.01) K2.drawShield(ctx, towerX, gy + rise * 0.3, sc, { light: L, check: clamp((t - sA.hit - 0.1) / 0.45) });
      ctx.restore();
    }
    // strolling pair (depth: slightly behind the spokesperson)
    if (t > s0 && t < s1 + 0.1) {
      const wx = walkX(t), ph = (1180 - wx) / 150;
      K2.drawHuman(ctx, wx, gy - 6, 1.05, { t, seed: 13, age: 'adult', outfit: 'tee', top: '#d98a9a', hairStyle: 'ponytail', hair: 3, skin: 2, facing: -0.8, walk: ph, cadence: 0.85, stride: 0.8, drive: (tt) => walkX(tt), light: L, look: -0.2, expr: 'happy' });
      K2.drawHuman(ctx, wx + 95, gy - 4, 1.1, { t, seed: 14, age: 'kid', outfit: 'hoodie', top: '#3f9c8f', hairStyle: 'short', hair: 0, skin: 4, facing: -0.8, walk: ph * 1.35, cadence: 0.95, stride: 0.9, drive: (tt) => walkX(tt) + 95, light: L, look: -0.4, expr: 'happy', hold: 'phone', screen: 0.7 });
    }
    // spokesperson
    K2.drawHuman(ctx, 300, gy, 1.28, {
      t, seed: 31, age: 'adult', outfit: 'office', top: '#eef1f6', bottom: 'charcoal', tie: '#5b6aa8', hairStyle: 'bob', hair: 1, skin: 2, light: L,
      facing: 0.5, pose, pose2, poseMix: mix, hold: 'paper', look: t > tSh ? 0.55 : 0.25, expr: t > tC ? 'neutral' : 'happy', drive: armSig, exag: 1.1,
    });
  });
  W.front(ctx);

  // ================================================================ UI
  ctx.save(); ctx.globalAlpha = 1 - 0.75 * dim;
  const tw = W.toScreen(towerX, gy - 250);
  pill(ctx, H, M, t, Math.min(800, tw[0]), Math.max(640, tw[1]), 0.15, P.company || 'OpenAI', { dot: true, size: 30, seed: 1 });
  feats.forEach((f, i) => pill(ctx, H, M, t, 700, 760 + i * 92, tF[i], f.text, { dot: true, size: 30, seed: 2 + i }));
  // quote panel (pops, types in)
  const qa = M.act(t, tQ - 0.12, { timing: 'snappy', wind: 0.3, overshoot: 0.1 });
  if (qa.phase !== 'before') {
    const s = qa.phase === 'anticipate' ? 0.2 * qa.wind : Math.max(0, qa.v), q = M.squashImpact(t, qa.hit, 0.08, 0.4);
    const Wd = 520, Hh = 240, cx = 640, cy = 520 + M.hold(t, 5, 2);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s / (1 + q), s * (1 + q));
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    H.roundRect(ctx, -Wd / 2, -Hh / 2, Wd, Hh, 26); ctx.fillStyle = 'rgba(10,10,24,0.94)'; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    // little tail toward the spokesperson
    ctx.beginPath(); ctx.moveTo(-Wd / 2 + 30, Hh / 2 - 40); ctx.lineTo(-Wd / 2 - 34, Hh / 2 + 20); ctx.lineTo(-Wd / 2 + 70, Hh / 2 - 2); ctx.closePath(); ctx.fillStyle = 'rgba(10,10,24,0.94)'; ctx.fill();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = H.font('ui', 24); ctx.fillStyle = ACC; ctx.fillText(String(P.by || 'OpenAI spokesperson').toUpperCase(), 0, -Hh / 2 + 34);
    const full = '“' + (P.quote || 'industry-leading age-specific protections') + '”';
    let size = 40, lines; for (; size >= 28; size -= 2) { lines = H.wrap(ctx, full, 'bold', size, Wd - 60); if (lines.length <= 3) break; }
    ctx.font = H.font('bold', size); ctx.fillStyle = '#ffffff';
    const n = Math.floor(clamp((t - tQ - 0.25) * 30, 0, full.length));
    let left = n; const lh = size * 1.18, y0 = 22 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, j) => { const part = ln.slice(0, Math.max(0, left)); left -= ln.length + 1; const fw = ctx.measureText(ln).width, pw = ctx.measureText(part).width; ctx.textAlign = 'left'; ctx.fillText(part, -fw / 2, y0 + j * lh); void pw; });
    ctx.restore();
  }
  ctx.restore();

  // caveat card: drops on an arc, squashes on landing, balance swings and settles level
  if (t > tC - 0.1) {
    ctx.fillStyle = `rgba(6,7,16,${0.55 * dim})`; ctx.fillRect(0, 0, 1080, 1920);
    const land = tC + 0.38, k = clamp((t - tC + 0.1) / 0.48);
    const p = M.arc([540, 470], [487, 740], ease.in(k, 1.7), 20, (x) => x);
    let sq = t < land ? 0.16 * k : M.squashImpact(t, land, 0.14, 0.5);
    const Wd = 780, Hh = 360;
    ctx.save(); M.squashTransform(ctx, p[0], p[1] + Hh / 2, sq, 0); ctx.translate(p[0], p[1]); ctx.rotate(t < land ? 0.08 * (1 - k) : M.settle(t, land, 0.02, 1.6, 4)); const scK = lerp(0.55, 1, ease.out(k, 2)); ctx.scale(scK, scK);
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    H.roundRect(ctx, -Wd / 2, -Hh / 2, Wd, Hh, 30); ctx.fillStyle = 'rgba(10,11,26,0.97)'; ctx.fill();
    ctx.shadowColor = 'transparent'; ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
    // balance scale: beam swings (follow-through) and settles level; pans hang with lag
    const beam = t < land ? -0.3 : M.settle(t, land, 0.34, 0.9, 1.5) + M.hold(t, 3, 0.01);
    const pans = M.chain((tt) => (tt < land ? -0.3 : M.settle(tt, land, 0.34, 0.9, 1.5)) * 120, t, 1, { gain: 0.006 })[0];
    ctx.save(); ctx.translate(0, -84);
    ctx.strokeStyle = ACC; ctx.fillStyle = ACC; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -50); ctx.lineTo(0, 48); ctx.moveTo(-40, 48); ctx.lineTo(40, 48); ctx.stroke();
    ctx.rotate(beam);
    ctx.beginPath(); ctx.moveTo(-110, -44); ctx.lineTo(110, -44); ctx.stroke();
    for (const dx of [-110, 110]) {
      ctx.save(); ctx.translate(dx, -44); ctx.rotate(-beam + pans);
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-26, 38); ctx.moveTo(0, 0); ctx.lineTo(26, 38); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 38, 30, 0, Math.PI); ctx.fill();
      ctx.restore();
    }
    ctx.beginPath(); ctx.arc(0, -50, 10, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const f1 = H.fitText(ctx, P.banner1 || 'These are allegations', 'display', 54, 30, Wd - 70); ctx.font = f1.font; ctx.fillStyle = '#ffffff'; ctx.fillText(f1.text, 0, 46);
    const pa = M.act(t, tP - 0.12, { timing: 'snappy', wind: 0.4, overshoot: 0.2 });
    if (pa.phase !== 'before') {
      const s = pa.phase === 'anticipate' ? 0.2 * pa.wind : Math.max(0, pa.v), q = M.squashImpact(t, pa.hit, 0.15, 0.4);
      ctx.save(); ctx.translate(0, 122); ctx.scale(s / (1 + q), s * (1 + q));
      const f2 = H.fitText(ctx, P.banner2 || 'Not proven in court', 'ui', 36, 24, Wd - 120); ctx.font = f2.font;
      const w2 = ctx.measureText(f2.text).width + 60;
      H.roundRect(ctx, -w2 / 2, -32, w2, 64, 32); ctx.fillStyle = ACC; ctx.fill();
      ctx.fillStyle = INK_; ctx.fillText(f2.text, 0, 2);
      ctx.restore();
    }
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
