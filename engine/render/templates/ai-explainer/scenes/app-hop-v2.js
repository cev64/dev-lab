// Scene "app-hop-v2" (full frame, kit v2). Night living room. A phone player (screen-space insert, left) shows the
// "AI label" pill; a TV on a media console (world, right) plays a generic video app. At the hop cue the label crouches
// (anticipation), leaps on an arc to the TV player (stretch along velocity), lands with a squash and the "Main app too"
// pill pops. At the unknown cue the room dims to a pool of light, a generic musician (guitar on the back, which
// swings and settles) walks in from the right, stops (body settles), winds up and shrugs big; the "YouTube hasn't said"
// pill and two question bubbles pop on their cues. Generic shapes only, no brands or logos.
// params: label, tvTag, unknown, q1, q2; cues: hopCue, hasntCue, recCue, paidCue. Text defaults are the v1 texts.
export default function draw(ctx, t, info) {
  const H = info.helpers, K2 = H.kit2, M = H.motion, P = info.params || {};
  const { clamp, lerp, ease } = M;
  const D = info.duration, ACC = info.accent;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tHop = at(P.hopCue || 'main', D * 0.17), tUnk = at(P.hasntCue || "hasn't", D * 0.45);
  const tQ1 = at(P.recCue || 'recommended', D * 0.7), tQ2 = at(P.paidCue || 'paid', D * 0.87);
  const FEET = 1030, TVX = 700;
  const walkT0 = tUnk - 0.75, walkT1 = tUnk + 0.85, MX0 = 1180, MX1 = 560, MS = 1.28;

  // ---------------------------------------------------------------- camera
  const PX = 487, PY = 725;
  const frame = (wx, wy, z, sx, sy) => ({ x: wx - PX - (sx - PX) / z, y: wy - PY - (sy - PY) / z, zoom: z });
  const cam = K2.cam(t, [
    { t: 0, ...frame(TVX, FEET, 1.18, 700, 1046) }, { t: tHop + 1.2, ...frame(TVX, FEET, 1.12, 690, 1046) },
    { t: tUnk - 0.3, ...frame(TVX, FEET, 1.12, 690, 1046) }, { t: walkT1 + 0.2, ...frame(MX1, FEET, 1.1, 487, 1046) }, { t: D, ...frame(MX1, FEET, 1.13, 487, 1046) },
  ]);
  const W = K2.world2.livingRoom(ctx, { t, cam, lamp: 0.8 });
  const L = W.light;

  // ---------------------------------------------------------------- musician acting
  const wk = (tt) => ease.inOut((tt - walkT0) / (walkT1 - walkT0), 1.6);
  const mx = (tt) => lerp(MX0, MX1, wk(tt));
  const walking = t > walkT0 && t < walkT1;
  const stopLean = M.settle(t, walkT1, -0.06, 1.3, 3.5);
  const shrug = M.act(t, tQ1 - 0.35, { timing: 'normal', wind: 0.45, exag: 1.3 });
  const shrug2 = M.act(t, tQ2 - 0.3, { timing: 'snappy', wind: 0.3, exag: 1.2 });
  let pose = 'stand', pose2 = null, poseMix = 0, expr = 'neutral', expr2 = null, exprMix = 0, squash = 0;
  if (t > walkT1 - 0.1) { pose2 = 'think'; poseMix = ease.inOut((t - walkT1 + 0.1) / 0.5); expr = 'thinking'; }
  if (t > tQ1 - 0.35) {
    pose = 'think'; pose2 = 'shrug'; poseMix = clamp(shrug.v); expr = 'thinking'; expr2 = 'worried'; exprMix = clamp(shrug.v);
    if (shrug.phase === 'anticipate') squash = -0.1 * shrug.wind; else if (shrug.phase === 'action') squash = 0.12 * (1 - shrug.k);
    squash += M.squashImpact(t, shrug.hit, 0.07, 0.5);
  }
  if (t > tQ2 - 0.3) { pose = 'shrug'; pose2 = { sN: 0.55, eN: 1.2, sF: -0.55, eF: -1.2, lift: 12, tilt: -0.14, handN: 'open', handF: 'open' }; poseMix = clamp(shrug2.v) * 0.9; expr = 'worried'; expr2 = null; }
  const lift = (tt) => { const a = M.act(tt, tQ1 - 0.35, { timing: 'normal', wind: 0.45, exag: 1.3 }); return a.phase === 'action' ? -14 * Math.sin(a.k * Math.PI) : 0; };

  // ================================================================ world plane
  const dim = ease.inOut((t - tUnk + 0.35) / 0.6);
  W.stage(ctx, () => {
    tvSet();
    if (t > walkT0) {
      const x = mx(t), fac = walking ? -0.85 : -0.35;
      // guitar slung on the back: swings with the walk and settles (follow-through)
      const sw = M.chain((tt) => mx(tt) * 1.0, t, 2, { gain: 0.0035, freq: 1.6, damp: 0.25, max: 0.6 });
      const bob = walking ? Math.abs(Math.sin(wk(t) * 7 * Math.PI)) * 6 : 0;
      guitar(x + 34 * MS, FEET - 236 * MS - bob, MS, 0.45 + sw[0] + sw[1] * 0.6);
      K2.drawHuman(ctx, x, FEET, MS, {
        t, seed: 11, age: 'adult', body: 'broad', skin: 4, hair: 0, hairStyle: 'afro', eyes: 0, outfit: 'tee', top: '#7b5aa6', bottom: 'denim',
        pose, pose2, poseMix, walk: walking ? wk(t) * 3.2 : null, cadence: 0.85, stride: 0.85, drive: (tt) => mx(tt), driveY: lift,
        facing: fac, lean: stopLean, look: walking ? -0.3 : 0.05, expr, expr2, exprMix, squash, light: L, exag: 1.2,
      });
      // strap across the chest
      ctx.save(); ctx.strokeStyle = '#3a2618'; ctx.lineWidth = 7 * MS; ctx.lineCap = 'round'; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(x + 30 * MS, FEET - 300 * MS - bob); ctx.quadraticCurveTo(x - 4 * MS, FEET - 250 * MS - bob, x - 26 * MS, FEET - 200 * MS - bob); ctx.stroke(); ctx.restore();
    }
  });
  W.front(ctx);
  // dim to a pool of light on the musician (staging)
  if (dim > 0) {
    const c = W.toScreen(mx(t), FEET - 250);
    const g = ctx.createRadialGradient(c[0], c[1], 120, c[0], c[1], 620);
    g.addColorStop(0, 'rgba(5,7,16,0)'); g.addColorStop(1, 'rgba(5,7,16,' + (0.62 * dim) + ')');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  }

  // ================================================================ phone insert + label hop (screen space)
  const phOut = ease.inOut((t - tUnk + 0.3) / 0.5);
  const php = { x: lerp(205, 70, phOut), y: 760, s: 0.62 };
  const tv = W.toScreen(TVX - 70, 770);                          // TV player centre on screen
  const lStart = [php.x + 50 * php.s, php.y + 70 * php.s];
  if (phOut < 1) {
    ctx.save(); ctx.globalAlpha = 1 - phOut; miniPhone(php);
    // the label stays on the phone (a copy hops to the TV)
    pill(lStart[0], lStart[1], { s: 1, sx: 1, sy: 1 }, P.label || 'AI label', { size: 26, accent: true });
    ctx.restore();
  }
  const hopA = M.act(t, tHop - 0.25, { timing: 'normal', wind: 0.4, overshoot: 0 });
  const tLand = hopA.hit + 0.55;
  if (t > tHop - 0.25) {
    let p = lStart, q = { sx: 1, sy: 1 }, rot = 0, sc = 1;
    if (hopA.phase === 'anticipate') { q = M.squash(-0.35 * hopA.wind); }
    else if (t < tLand) {
      const k = clamp((t - (hopA.hit - 0.28)) / (tLand - hopA.hit + 0.28));
      const f = (kk) => M.arc(lStart, tv, kk, 170, (x) => ease.inOut(x, 1.8));
      p = f(k); const pn = f(Math.min(1, k + 0.03));
      const st = M.stretchFromVelocity((pn[0] - p[0]) / 0.025, (pn[1] - p[1]) / 0.025, 0.00008, 0.35);
      // dotted trail along the arc
      ctx.save(); ctx.strokeStyle = H.rgba(ACC, 0.5); ctx.setLineDash([8, 12]); ctx.lineWidth = 4; ctx.beginPath();
      for (let j = 0; j <= 16; j++) { const pp = f((j / 16) * k); if (j) ctx.lineTo(pp[0], pp[1]); else ctx.moveTo(pp[0], pp[1]); }
      ctx.stroke(); ctx.restore();
      ctx.save(); M.squashTransform(ctx, p[0], p[1], st.s, st.angle);
      pill(p[0], p[1], { s: lerp(1, 1.15, Math.sin(k * Math.PI)), sx: 1, sy: 1 }, P.label || 'AI label', { size: 26, accent: true });
      ctx.restore();
      p = null;
    } else {
      p = tv; q = M.squash(M.squashImpact(t, tLand, 0.3, 0.5));
      K2.glow(ctx, tv[0], tv[1], 120, ACC, (0.35 + 0.1 * Math.sin(t * 5)) * (1 - dim));
    }
    if (p) { ctx.save(); ctx.globalAlpha = 1 - dim * (p === tv ? 1 : 0); pill(p[0], p[1], { s: sc, sx: q.sx, sy: q.sy }, P.label || 'AI label', { size: 26, accent: true }); ctx.restore(); }
    void rot;
  }
  const tp = pop(t, tLand + 0.05);
  if (tp) { ctx.save(); ctx.globalAlpha = 1 - dim; const tt = W.toScreen(TVX, 600); pill(tt[0], Math.max(452, tt[1]), tp, P.tvTag || 'Main app too', { size: 30, dot: true }); ctx.restore(); }

  // ================================================================ caveat pills + question bubbles
  const up = pop(t, tUnk - 0.05, { overshoot: 0.2 });
  if (up) pill(487, 455, up, P.unknown || "YouTube hasn't said", { size: 34, accent: true });
  bubble(tQ1 - 0.12, 200, 700, P.q1 || 'Recommended less?', 1);
  bubble(tQ2 - 0.12, 775, 690, P.q2 || 'Paid less?', -1);

  // ================================================================ helpers
  function tvSet() {
    const cw = 400, ch = 120, top = FEET - ch;
    K2.contactShadow(ctx, TVX, FEET, cw * 1.05, 0.55);
    const wm = K2.mat('#6b4a33', L);
    K2.solid(ctx, () => H.roundRect(ctx, TVX - cw / 2, top, cw, ch, 10), wm, [TVX - cw / 2, top, cw, ch], -1, { rim: 2, ao: 0.3, top: 0.3 });
    ctx.save(); H.roundRect(ctx, TVX - cw / 2, top, cw, ch, 10); ctx.clip(); K2.texture(ctx, 'wood', TVX - cw / 2, top, cw, ch, '#2a160c', 0.3, 5); ctx.restore();
    for (const k of [-1, 1]) { H.roundRect(ctx, TVX + k * 95 - 80, top + 18, 160, ch - 36, 6); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fill(); }
    // TV
    const tw = 400, th = 240, ty = top - 34 - th;
    H.roundRect(ctx, TVX - 14, top - 36, 28, 36, 4); ctx.fillStyle = '#20232f'; ctx.fill();
    H.roundRect(ctx, TVX - 70, top - 8, 140, 10, 5); ctx.fill();
    K2.solid(ctx, () => H.roundRect(ctx, TVX - tw / 2, ty, tw, th, 14), K2.mat('#262a36', L), [TVX - tw / 2, ty, tw, th], -1, { rim: 3 });
    H.roundRect(ctx, TVX - tw / 2 + 10, ty + 10, tw - 20, th - 20, 8); ctx.fillStyle = '#0f1222'; ctx.fill();
    const vx = TVX - tw / 2 + 24, vy = ty + 24, vw = 230, vh = 132;
    const flick = 0.9 + 0.1 * Math.sin(t * 13) * Math.sin(t * 7.1);
    const vg = ctx.createLinearGradient(vx, vy, vx + vw, vy + vh); vg.addColorStop(0, H.mixHex('#2b6c8f', '#000000', 1 - flick)); vg.addColorStop(1, '#4fb3a6');
    H.roundRect(ctx, vx, vy, vw, vh, 8); ctx.fillStyle = vg; ctx.fill();
    ctx.beginPath(); ctx.arc(vx + vw / 2, vy + vh / 2, 24, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
    ctx.fillStyle = '#0f1222'; ctx.beginPath(); ctx.moveTo(vx + vw / 2 - 8, vy + vh / 2 - 12); ctx.lineTo(vx + vw / 2 + 13, vy + vh / 2); ctx.lineTo(vx + vw / 2 - 8, vy + vh / 2 + 12); ctx.closePath(); ctx.fill();
    H.roundRect(ctx, vx, vy + vh + 14, 170, 12, 6); ctx.fillStyle = '#dfe4f1'; ctx.fill();
    H.roundRect(ctx, vx, vy + vh + 34, 110, 10, 5); ctx.fillStyle = 'rgba(223,228,241,0.4)'; ctx.fill();
    for (let k = 0; k < 3; k++) { H.roundRect(ctx, TVX + tw / 2 - 128, ty + 26 + k * 66, 104, 54, 6); ctx.fillStyle = ['#a08be0', '#e8786a', '#6f86e0'][k]; ctx.fill(); }
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.beginPath(); ctx.moveTo(TVX - tw / 2 + 10, ty + 10); ctx.lineTo(TVX - tw / 2 + 150, ty + 10); ctx.lineTo(TVX - tw / 2 + 10, ty + 150); ctx.closePath(); ctx.fill();
    K2.glow(ctx, TVX, ty + th / 2, 300, '#6fc0d8', 0.12 * flick);
  }
  function guitar(x, y, s, a) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.scale(s, s);
    const m = K2.mat('#b57a46', L);
    K2.solid(ctx, () => { ctx.beginPath(); ctx.ellipse(0, 40, 34, 40, 0, 0, Math.PI * 2); ctx.ellipse(0, -8, 26, 28, 0, 0, Math.PI * 2); }, m, [-34, -36, 68, 116], -1, { rim: 2 });
    ctx.beginPath(); ctx.arc(0, 18, 10, 0, Math.PI * 2); ctx.fillStyle = '#2a211e'; ctx.fill();
    ctx.fillStyle = '#5b3b25'; ctx.fillRect(-5, -120, 10, 92); H.roundRect(ctx, -9, -140, 18, 26, 4); ctx.fill();
    ctx.restore();
  }
  function miniPhone(o) {
    ctx.save(); ctx.translate(o.x, o.y); ctx.scale(o.s, o.s);
    const fw = 300, fh = 540;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 16;
    H.roundRect(ctx, -fw / 2, -fh / 2, fw, fh, 42); ctx.fillStyle = '#23283a'; ctx.fill(); ctx.restore();
    H.roundRect(ctx, -fw / 2 + 12, -fh / 2 + 12, fw - 24, fh - 24, 32); ctx.fillStyle = '#10131f'; ctx.fill();
    const g = ctx.createLinearGradient(-100, -220, 100, -20); g.addColorStop(0, '#6f4fd0'); g.addColorStop(1, '#e8786a');
    H.roundRect(ctx, -100, -220, 200, 200, 18); ctx.fillStyle = g; ctx.fill();
    ctx.beginPath(); ctx.arc(30, -140, 46 + 4 * Math.sin(t * 2), 0, Math.PI * 2); ctx.fillStyle = '#ffcc66'; ctx.fill();
    for (let k = 0; k < 18; k++) { const h = 6 + 22 * Math.abs(Math.sin(k * 1.7 + t * 4)); H.roundRect(ctx, -100 + k * 11.5, 150 - h / 2, 6, h, 3); ctx.fillStyle = k < 7 ? ACC : 'rgba(255,255,255,0.35)'; ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, 215, 30, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.fillStyle = '#121527'; ctx.fillRect(-10, 203, 7, 24); ctx.fillRect(3, 203, 7, 24);
    ctx.restore();
  }
  function bubble(t0, x, y, text, side) {
    const p = pop(t, t0, { overshoot: 0.22 });
    if (!p) return;
    const yy = y + M.hold(t, x, 4);
    ctx.save(); ctx.translate(x, yy); ctx.rotate(M.settle(t, p.hit, 0.06 * side, 1.5, 3)); ctx.scale(p.s * p.sx, p.s * p.sy);
    ctx.font = K2.font.bold(30);
    const lines = H.wrap(ctx, text, 'bold', 30, 220), w = 260, h = 30 + lines.length * 38;
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
    ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 28);
    ctx.moveTo(side * w * 0.25, h / 2 - 2); ctx.lineTo(side * w * 0.5 + side * 20, h / 2 + 34); ctx.lineTo(side * w * 0.05, h / 2 - 2);
    ctx.fillStyle = 'rgba(14,16,30,0.94)'; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach((ln, i) => ctx.fillText(ln, 0, -h / 2 + 34 + i * 38));
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
