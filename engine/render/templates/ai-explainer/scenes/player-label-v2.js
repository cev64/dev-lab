// Scene "player-label-v2" (full frame, kit v2). Night living room. A listener in headphones bobs to a song on the sofa
// (notes drift up on arcs); a "?" thought pops; they lift the phone and the player page flies out of their hand on an
// arc into a big screen-space insert (stretch in flight, squash on landing). Date pill and "New" pill pop with
// anticipation. On the label cue the "AI label" pill pops on the player page and the listener does a take. On the tap
// cue a hand winds up, presses the label on an arc (finger + pill squash, ripple) and the "About this track" sheet
// springs up with staggered rows. mode "payoff": label already there, tap opens the sheet, then the phone sinks back
// and a question card (play / skip buttons) pops while the listener strikes a thinking pose.
// params: mode intro|payoff, date, newText, label, sheetTitle, rows, question; cues: dateCue, newCue, labelCue,
//         menuCue (intro), tapCue, qCue (payoff). Text defaults are the v1 texts.
export default function draw(ctx, t, info) {
  const H = info.helpers, K2 = H.kit2, M = H.motion, P = info.params || {};
  const { clamp, lerp, ease } = M;
  const D = info.duration, ACC = info.accent;
  const payoff = P.mode === 'payoff';
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tDate = at(P.dateCue || 'October', D * 0.15);
  const tNew = at(P.newCue || 'labels', D * 0.35);
  const tLabel = payoff ? -10 : at(P.labelCue || 'label', D * 0.6);
  const tMenu = at(payoff ? (P.tapCue || 'check') : (P.menuCue || 'tapping'), D * (payoff ? 0.3 : 0.8));
  const tQ = payoff ? at(P.qCue || 'Would', D * 0.55) : 1e9;
  const tLift = payoff ? -10 : Math.max(2.7, tDate - 0.55);           // listener raises the phone
  const tFly = payoff ? -10 : tLift + 0.35;                           // player page flies out of the hand
  const flyDur = 0.62;

  // ---------------------------------------------------------------- camera (pose-to-pose, eased, moving hold)
  const PX = 487, PY = 725;
  const frame = (wx, wy, z, sx, sy) => ({ x: wx - PX - (sx - PX) / z, y: wy - PY - (sy - PY) / z, zoom: z });
  const LX = 318, FEET = 1030;                                         // listener on the left seat
  const close = frame(LX, FEET, 1.6, 487, 1046), wide = frame(LX, FEET, 1.42, 238, 1046);
  const tight = frame(LX, FEET, 1.5, 222, 1046);
  const keys = payoff
    ? [{ t: 0, ...wide }, { t: tQ - 0.2, ...wide }, { t: tQ + 0.9, ...tight }, { t: D, ...frame(LX, FEET, 1.53, 222, 1046) }]
    : [{ t: 0, ...frame(LX, FEET, 1.56, 487, 1046) }, { t: tLift, ...close }, { t: tFly + 0.7, ...wide }, { t: tLabel, ...frame(LX, FEET, 1.44, 236, 1046) },
      { t: tLabel + 0.5, ...tight }, { t: D, ...frame(LX, FEET, 1.52, 224, 1046) }];
  const cam = K2.cam(t, keys);
  const W = K2.world2.livingRoom(ctx, { t, cam });
  const L = W.light, s = 1.18;

  // ---------------------------------------------------------------- listener acting
  const sawLabel = !payoff && t > tLabel + 0.15;
  const take = M.act(t, tLabel + 0.12, { timing: 'take', wind: 0.6, exag: 1.3 });
  const lift = M.act(t, tLift, { timing: 'normal', wind: 0.3, overshoot: 0.06 });
  let pose = 'sit-phone', pose2 = null, poseMix = 0;
  if (!payoff && t < tLift + 0.6) { pose = 'sit'; pose2 = 'sit-phone'; poseMix = clamp(lift.v); }
  if (payoff && t > tQ - 0.1) { pose = 'sit-phone'; pose2 = Object.assign({}, K2.POSES['sit-phone'], { sN: 0.2, eN: 2.75, sF: 0.12, eF: 1.25, tilt: 0.12, nod: -0.1, handN: 'fist', handF: 'relax', farFront: true, hold: null }); poseMix = ease.inOut((t - tQ + 0.1) / 0.55); }
  const music = payoff ? 0.45 : 1 - clamp((t - tLabel) / 0.5);           // the groove stops at the label
  const bob = Math.sin(t * Math.PI * 2 * 1.05) * 0.09 * music * (1 - 0.7 * clamp(poseMix));
  let squash = 0, lean = 0, nod = bob;
  if (!payoff && t > tLabel) {
    if (take.phase === 'anticipate') squash = -0.12 * take.wind;
    else if (take.phase === 'action') squash = 0.18 * (1 - take.k * 0.4);
    squash += M.squashImpact(t, take.hit + 0.02, 0.1, 0.55);
    lean = -0.1 * clamp(take.v) + M.settle(t, take.hit, 0.03, 1.2, 3);
  }
  if (!payoff && t > tMenu - 0.6) lean += 0.08 * ease.inOut((t - tMenu + 0.6) / 0.5);  // leans in to tap
  if (!payoff && lift.phase === 'anticipate') lean -= 0.05 * lift.wind;
  // expressions (pose-to-pose on the face)
  const bliss = { brow: [0.2, 0.05], lid: 0.62, low: 0.35, mouth: 'smile', open: 0.12 };
  let expr = bliss, expr2 = null, exprMix = 0;
  if (payoff) {
    expr = 'happy';
    if (t > tMenu + 0.4) { expr2 = 'curious'; exprMix = ease.inOut((t - tMenu - 0.4) / 0.4); }
    if (t > tQ) { expr = 'curious'; expr2 = 'thinking'; exprMix = ease.inOut((t - tQ) / 0.5); }
  } else {
    if (t > 1.2) { expr2 = 'curious'; exprMix = ease.inOut((t - 1.2) / 0.35); }
    if (t > tFly + 0.5) { expr = 'curious'; expr2 = 'happy'; exprMix = ease.inOut((t - tFly - 0.5) / 0.5); }
    if (sawLabel) { expr = take.phase === 'anticipate' ? 'focused' : 'shocked'; expr2 = null; }
    if (t > tLabel + 1.4) { expr = 'shocked'; expr2 = 'curious'; exprMix = ease.inOut((t - tLabel - 1.4) / 0.7); }
  }
  const look = payoff ? (t > tQ ? 0.15 : 0.55) : t < tLift ? M.hold(t, 3, 0.2) : sawLabel ? 0.7 : 0.45;
  const bounceY = (tt) => { const a = M.act(tt, tLabel + 0.12, { timing: 'take', wind: 0.6, exag: 1.3 }); return !payoff && a.phase === 'action' ? -26 * Math.sin(a.k * Math.PI) : 0; };

  const out = {};
  W.stage(ctx, () => {
    K2.drawHuman(ctx, LX, FEET, s, {
      t, seed: 3, age: 'adult', body: 'average', skin: 2, hair: 0, hairStyle: 'curly', eyes: 1, outfit: 'hoodie', top: '#3f9c8f', bottom: 'denim',
      pose, pose2, poseMix, seatH: W.sofa.seatH / s, cushion: W.sofa.color, facing: 0.45, light: L, look, nod, lean, squash,
      expr, expr2, exprMix, screen: t > tLift + 0.3 || payoff ? 1 : 0.2, driveY: bounceY, exag: sawLabel ? 1.25 : 1, out,
    });
    if (out.head) headphones(out.head, out.top);
    // music notes drift up from the headphones on arcs (secondary action); thin out when the groove stops
    if (out.head) for (let i = 0; i < 7; i++) {
      const life = (t * 0.42 + i / 7) % 1, side = i % 2 ? 1 : -1;
      const p = M.arc([out.head[0] + side * 30, out.head[1] - 10], [out.head[0] + side * (90 + 40 * M.hash(i, 3)), out.head[1] - 230 - 60 * M.hash(i, 4)], life, 40 * side, ease.out);
      const a = music * Math.sin(life * Math.PI) * 0.95 * clamp((W.toScreen(p[0], p[1])[1] - 410) / 90);
      if (a > 0.02) note(p[0], p[1], 0.7 + 0.3 * M.hash(i, 5), i % 3 ? '#f4f1ff' : ACC, a, Math.sin(t * 3 + i) * 0.25);
    }
  });
  W.front(ctx);

  // ---------------------------------------------------------------- "?" thought (intro hook)
  if (!payoff && out.head) {
    const pq = pop(t, 1.15, { timing: 'snappy', wind: 0.4, overshoot: 0.22 });
    const gone = 1 - ease.in((t - tLift) / 0.35);
    if (pq && gone > 0.01) {
      const hp = W.toScreen(out.head[0], out.head[1]);
      const bx = Math.min(800, hp[0] + 175), by = Math.max(470, hp[1] - 40) + M.hold(t, 5, 4);
      ctx.save(); ctx.globalAlpha = gone;
      for (let i = 0; i < 2; i++) { const k = clamp(pq.s * 1.4 - i * 0.2); dot(hp[0] + 70 + i * 34, hp[1] - 10 - i * 14, (8 + i * 5) * k); }
      ctx.translate(bx, by); ctx.scale(pq.s * pq.sx * gone, pq.s * pq.sy * gone); ctx.rotate(M.settle(t, pq.hit, 0.08, 1.6, 3));
      cloud(0, 0, 70);
      ctx.font = K2.font.display(76); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1a1d2e'; ctx.fillText('?', 0, 4);
      ctx.restore();
    }
  }

  // ---------------------------------------------------------------- phone insert (screen space)
  const fx = 668, fcy = 790, PS = 0.86;                       // centre + scale of the 350x590 phone design
  let ph = null;
  if (payoff) {
    const sink = ease.inOut((t - tQ + 0.15) / 0.5);
    ph = { x: fx, y: fcy + 60 * sink, s: PS * (1 - 0.1 * sink), rot: 0, sx: 1, sy: 1, dim: sink };
  } else if (t > tFly && out.hand) {
    const k = clamp((t - tFly) / flyDur), hs = W.toScreen(out.hand[0], out.hand[1]);
    const p = M.arc(hs, [fx, fcy], k, 120, (x) => ease.inOut(x, 2.2));
    const kk = ease.inOut(k, 2.2), dk = 0.02, p2 = M.arc(hs, [fx, fcy], Math.min(1, k + dk), 120, (x) => ease.inOut(x, 2.2));
    const st = k < 1 ? M.stretchFromVelocity((p2[0] - p[0]) / dk, (p2[1] - p[1]) / dk, 0.00028, 0.28) : { s: 0, angle: 0 };
    const land = M.squashImpact(t, tFly + flyDur, 0.13, 0.5);
    ph = { x: p[0], y: p[1], s: PS * lerp(0.12, 1, kk), rot: (1 - kk) * -0.5, stretch: st, land, dim: 0 };
  }
  if (ph) drawPlayer(ph);

  // ---------------------------------------------------------------- date + "new" pills (intro)
  if (!payoff) {
    const dp = pop(t, Math.max(tDate - 0.12, 2.95));
    if (dp) pill(668, 432, dp, P.date || 'Oct 14, 2026', { size: 32, dot: true });
    const np = pop(t, tNew - 0.12);
    const nOut = 1 - ease.in((t - tLabel + 0.2) / 0.3);
    if (np && nOut > 0.01) { ctx.save(); ctx.globalAlpha = nOut; pill(640, 492, np, P.newText || 'New: labels for AI songs', { size: 30, accent: true }); ctx.restore(); }
  }

  // ---------------------------------------------------------------- question card (payoff)
  if (payoff) {
    const qp = pop(t, tQ - 0.1, { timing: 'normal', wind: 0.3, overshoot: 0.12 });
    if (qp) {
      const cx = 668, cy = 700 + M.hold(t, 4, 3), w = 400, h = 330;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(qp.s * qp.sx, qp.s * qp.sy);
      ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
      H.roundRect(ctx, -w / 2, -h / 2, w, h, 34); ctx.fillStyle = 'rgba(12,14,26,0.94)'; ctx.fill();
      ctx.shadowColor = 'transparent';
      const gg = ctx.createLinearGradient(0, -h / 2, 0, 0); gg.addColorStop(0, 'rgba(255,255,255,0.08)'); gg.addColorStop(1, 'rgba(255,255,255,0)');
      H.roundRect(ctx, -w / 2, -h / 2, w, h, 34); ctx.fillStyle = gg; ctx.fill();
      ctx.strokeStyle = H.rgba(ACC, 0.85); ctx.lineWidth = 4; ctx.stroke();
      const q = P.question || 'Still listen if it said FULLY AI?';
      let fs = 46, lines = H.wrap(ctx, q, 'display', fs, w - 70);
      while (lines.length > 3 && fs > 28) { fs -= 2; lines = H.wrap(ctx, q, 'display', fs, w - 70); }
      ctx.font = H.font('display', fs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
      const l0 = -h / 2 + 34 + fs * 0.6;
      lines.forEach((ln, i) => ctx.fillText(ln, 0, l0 + i * fs * 1.12));
      const byy = h / 2 - 56;
      const b1 = pop(t, tQ + 0.45, { overshoot: 0.25 }), b2 = pop(t, tQ + 0.62, { overshoot: 0.25 });
      const beat = 1 + 0.06 * Math.max(0, Math.sin((t - tQ) * 5.5)) * clamp(t - tQ - 1.2);   // play button breathes
      if (b1) button(-88, byy, b1, beat, true);
      if (b2) button(88, byy, b2, 1, false);
      ctx.restore();
    }
  }

  // ================================================================ helpers
  function drawPlayer(o) {
    ctx.save(); ctx.translate(o.x, o.y);
    if (o.stretch && o.stretch.s > 0.001) { ctx.rotate(o.stretch.angle); const q = M.squash(o.stretch.s); ctx.scale(q.sx, q.sy); ctx.rotate(-o.stretch.angle); }
    if (o.land) { ctx.translate(0, 295 * o.s); const q = M.squash(o.land); ctx.scale(q.sx, q.sy); ctx.translate(0, -295 * o.s); }
    ctx.rotate(o.rot || 0); ctx.scale(o.s, o.s);
    const fw = 350, fh = 590, x0 = -fw / 2, y0 = -fh / 2;
    // body with soft drop shadow + bevel
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
    H.roundRect(ctx, x0, y0, fw, fh, 46); ctx.fillStyle = '#23283a'; ctx.fill(); ctx.restore();
    const bz = ctx.createLinearGradient(x0, y0, x0 + fw, y0 + fh); bz.addColorStop(0, '#4a5170'); bz.addColorStop(0.5, '#262b3e'); bz.addColorStop(1, '#171a28');
    H.roundRect(ctx, x0, y0, fw, fh, 46); ctx.fillStyle = bz; ctx.fill();
    H.roundRect(ctx, x0 + 13, y0 + 13, fw - 26, fh - 26, 34); ctx.fillStyle = '#10131f'; ctx.fill();
    ctx.save(); H.roundRect(ctx, x0 + 13, y0 + 13, fw - 26, fh - 26, 34); ctx.clip();
    const sg = ctx.createLinearGradient(0, y0, 0, y0 + fh); sg.addColorStop(0, '#1d2140'); sg.addColorStop(1, '#0d0f1c'); ctx.fillStyle = sg; ctx.fillRect(x0, y0, fw, fh);
    // cover art: abstract shapes (no brand), slow sun pulse
    const cx0 = -120, cy0 = y0 + 50, cs = 240;
    const g = ctx.createLinearGradient(cx0, cy0, cx0 + cs, cy0 + cs); g.addColorStop(0, '#6f4fd0'); g.addColorStop(1, '#e8786a');
    H.roundRect(ctx, cx0, cy0, cs, cs, 22); ctx.fillStyle = g; ctx.fill();
    ctx.save(); H.roundRect(ctx, cx0, cy0, cs, cs, 22); ctx.clip();
    const sr = 56 + 4 * Math.sin(t * 2.1);
    const sun = ctx.createRadialGradient(cx0 + 140, cy0 + 90, 4, cx0 + 150, cy0 + 100, sr); sun.addColorStop(0, '#fff0b0'); sun.addColorStop(1, '#ffb455');
    ctx.beginPath(); ctx.arc(cx0 + 150, cy0 + 100, sr, 0, Math.PI * 2); ctx.fillStyle = sun; ctx.fill();
    ctx.beginPath(); ctx.moveTo(cx0, cy0 + 200); ctx.quadraticCurveTo(cx0 + 120, cy0 + 120 + 6 * Math.sin(t * 1.3), cx0 + cs, cy0 + 190); ctx.lineTo(cx0 + cs, cy0 + cs); ctx.lineTo(cx0, cy0 + cs); ctx.closePath(); ctx.fillStyle = '#2b1f5c'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(cx0, cy0); ctx.lineTo(cx0 + 90, cy0); ctx.lineTo(cx0, cy0 + 110); ctx.closePath(); ctx.fill();
    ctx.restore();
    noteFlat(cx0 + 70, cy0 + 120, 1.1, '#ffffff');
    H.roundRect(ctx, cx0, cy0 + cs + 26, 120, 18, 9); ctx.fillStyle = '#dfe4f1'; ctx.fill();
    H.roundRect(ctx, cx0, cy0 + cs + 56, 110, 14, 7); ctx.fillStyle = 'rgba(223,228,241,0.45)'; ctx.fill();
    // waveform (flickering screen = secondary action)
    const wy = y0 + 420, play = payoff ? 0.6 : 1 - 0.5 * clamp((t - tLabel) / 0.6);
    for (let k = 0; k < 22; k++) {
      const x = -130 + k * 12.4, hh = 8 + 26 * play * Math.abs(Math.sin(k * 1.7 + t * 4)) * (0.5 + 0.5 * M.hash(k, 9));
      ctx.fillStyle = k < 9 + ((t * 0.3) % 1) * 2 ? ACC : 'rgba(255,255,255,0.35)';
      H.roundRect(ctx, x, wy - hh / 2, 7, hh, 3); ctx.fill();
    }
    const by = y0 + 500;
    ctx.fillStyle = '#ffffff'; tri(-92, by, -1); tri(92, by, 1);
    ctx.beginPath(); ctx.arc(0, by, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#121527'; ctx.fillRect(-11, by - 13, 8, 26); ctx.fillRect(3, by - 13, 8, 26);
    // AI label pill on the player page
    const lx = 78, ly = cy0 + cs + 52;
    const lp = payoff ? { s: 1, sx: 1, sy: 1 } : pop(t, tLabel - 0.14, { timing: 'snappy', wind: 0.45, overshoot: 0.3 });
    let press = 0;
    const tapT = t - tMenu;
    if (tapT > -0.05 && tapT < 0.35) press = Math.sin(clamp((tapT + 0.05) / 0.4) * Math.PI);
    if (lp) {
      const pulse = 1 + 0.04 * Math.sin((t - tLabel) * 5) * (payoff ? 0.4 : 1);
      if (lp.s > 0.6) K2.glow(ctx, lx, ly, 90 + 30 * Math.max(0, 1 - (t - tLabel) / 1.2), ACC, payoff ? 0.25 : 0.45);
      const q = M.squash(-0.22 * press);
      pill(lx, ly, { s: lp.s * pulse, sx: lp.sx * q.sx, sy: lp.sy * q.sy }, P.label || 'AI label', { size: 28, accent: true, local: true });
    }
    // ripple
    if (tapT > 0 && tapT < 0.8) {
      const rp = ease.out(tapT / 0.8);
      ctx.strokeStyle = H.rgba('#ffffff', 0.85 * (1 - rp)); ctx.lineWidth = 6 * (1 - rp) + 1;
      ctx.beginPath(); ctx.ellipse(lx, ly, 70 + 60 * rp, 30 + 40 * rp, 0, 0, Math.PI * 2); ctx.stroke();
    }
    // info sheet springs up (overshoot + settle), rows stagger in
    const sOpen = payoff ? (t < tMenu + 0.15 ? 0 : M.spring(t, tMenu + 0.15, 0, 1, 1.6, 0.45)) : (t < tMenu + 0.15 ? 0 : M.spring(t, tMenu + 0.15, 0, 1, 1.6, 0.45));
    if (sOpen > 0.001) {
      const sh = 250, sy = y0 + fh - 13 - sh * sOpen;
      ctx.fillStyle = 'rgba(5,7,16,' + (0.5 * clamp(sOpen)) + ')'; ctx.fillRect(x0, y0, fw, fh);
      H.roundRect(ctx, x0 + 13, sy, fw - 26, sh + 60, 28); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      H.roundRect(ctx, -30, sy + 14, 60, 8, 4); ctx.fillStyle = '#b9c1d6'; ctx.fill();
      ctx.font = K2.font.bold(28); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#161927';
      ctx.fillText(P.sheetTitle || 'About this track', x0 + 44, sy + 60);
      const rows = P.rows || [['Composition', 'AI'], ['Vocals', 'AI']];
      rows.forEach((r, i) => {
        const rp = pop(t, tMenu + 0.55 + i * 0.28, { overshoot: 0.25 });
        if (!rp) return;
        const ry = sy + 122 + i * 66;
        ctx.save(); ctx.globalAlpha = clamp(rp.s * 1.5);
        ctx.font = K2.font.ui(26); ctx.textAlign = 'left'; ctx.fillStyle = '#2a2f45'; ctx.fillText(r[0], x0 + 44, ry);
        ctx.translate(104, ry); ctx.scale(rp.s * rp.sx, rp.s * rp.sy);
        H.roundRect(ctx, -38, -20, 76, 40, 20); ctx.fillStyle = ACC; ctx.fill();
        ctx.font = K2.font.ui(22); ctx.textAlign = 'center'; ctx.fillStyle = H.mixHex(ACC, '#000000', 0.62); ctx.fillText(r[1], 0, 1);
        ctx.restore();
      });
    }
    // glass sheen
    const gl = ctx.createLinearGradient(x0, y0, x0 + fw, y0 + fh * 0.6); gl.addColorStop(0, 'rgba(255,255,255,0.07)'); gl.addColorStop(0.45, 'rgba(255,255,255,0)'); ctx.fillStyle = gl; ctx.fillRect(x0, y0, fw, fh);
    ctx.restore();
    if (o.dim) { ctx.fillStyle = 'rgba(5,7,16,' + (0.45 * o.dim) + ')'; H.roundRect(ctx, x0, y0, fw, fh, 46); ctx.fill(); }
    ctx.restore();
    // the tapping hand (screen space, enters on an arc, winds up, presses, retracts)
    tapHand(o, lx, ly);
  }
  function tapHand(o, lx, ly) {
    const t0 = tMenu - 0.75, t3 = tMenu + 0.75;
    if (t < t0 || t > t3) return;
    const tip = [o.x + lx * o.s + 6, o.y + ly * o.s + 8];
    const start = [tip[0] + 230, tip[1] + 250], hover = [tip[0] + 34, tip[1] + 42];
    let p, sq = 0, rot = -0.55;
    if (t < tMenu - 0.25) p = M.arc(start, hover, (t - t0) / 0.5, -50, ease.out);       // swing in on an arc
    else if (t < tMenu - 0.08) { const k = (t - tMenu + 0.25) / 0.17; p = M.arc(hover, [hover[0] + 16, hover[1] + 20], ease.sine(k), 0, (x) => x); sq = 0.1 * ease.sine(k); } // wind-up: pulls back
    else if (t < tMenu) { const k = (t - tMenu + 0.08) / 0.08; p = M.arc([hover[0] + 16, hover[1] + 20], tip, k, 8, ease.in); sq = 0.15; }       // snap in, stretched
    else if (t < tMenu + 0.25) { p = [tip[0], tip[1]]; sq = M.squashImpact(t, tMenu, 0.22, 0.35); }   // press: squash
    else p = M.arc(tip, start, (t - tMenu - 0.25) / 0.5, 60, ease.in);                       // retract on an arc
    const fade = clamp((t - t0) / 0.12) * clamp((t3 - t) / 0.15);
    ctx.save(); ctx.globalAlpha = fade; ctx.translate(p[0], p[1]); ctx.rotate(rot);
    const q = M.squash(sq); ctx.scale(q.sx, q.sy);
    const skin = K2.SKIN[2], m = K2.mat(skin, { dir: -1, key: '#ffc58a', keyA: 0.2, rim: '#a7c0ff', rimA: 0.5, amb: '#151a3c', ambA: 0.4, ao: 0.5 });
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 10;
    K2.solid(ctx, () => { ctx.beginPath(); ctx.moveTo(-14, 0); ctx.quadraticCurveTo(-16, -6, -8, -10); ctx.quadraticCurveTo(0, -12, 8, -9); ctx.quadraticCurveTo(15, -5, 14, 4); ctx.lineTo(18, 70); ctx.quadraticCurveTo(52, 70, 62, 104); ctx.quadraticCurveTo(70, 150, 40, 182); ctx.lineTo(28, 260); ctx.lineTo(-44, 260); ctx.lineTo(-40, 170); ctx.quadraticCurveTo(-58, 140, -46, 100); ctx.quadraticCurveTo(-30, 80, -16, 80); ctx.closePath(); }, m, [-60, -12, 132, 272], -1, { rim: 3 });
    ctx.shadowColor = 'transparent';
    // knuckle creases + nail
    ctx.strokeStyle = H.rgba(m.deep, 0.5); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-10, 40); ctx.quadraticCurveTo(0, 44, 10, 40); ctx.stroke();
    for (let i = 0; i < 2; i++) { ctx.beginPath(); ctx.moveTo(20 + i * 12, 96 + i * 18); ctx.quadraticCurveTo(36 + i * 10, 104 + i * 18, 50 + i * 6, 100 + i * 20); ctx.stroke(); }
    H.roundRect(ctx, -8, -6, 16, 18, 7); ctx.fillStyle = H.rgba('#ffffff', 0.35); ctx.fill();
    // sleeve cuff
    H.roundRect(ctx, -52, 196, 104, 70, 16); ctx.fillStyle = '#3f9c8f'; ctx.fill();
    ctx.restore();
  }
  function headphones(hc, top) {
    const r = Math.max(10, hc[1] - top[1]);
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = '#1f2232'; ctx.lineWidth = r * 0.24;
    ctx.beginPath(); ctx.arc(hc[0] - r * 0.12, hc[1] + r * 0.05, r * 1.12, Math.PI * 1.03, Math.PI * 1.97); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = r * 0.06;
    ctx.beginPath(); ctx.arc(hc[0] - r * 0.12, hc[1] + r * 0.02, r * 1.12, Math.PI * 1.2, Math.PI * 1.5); ctx.stroke();
    const cup = (x, y, w, h) => { const g = ctx.createLinearGradient(x - w, y, x + w, y); g.addColorStop(0, '#3a3f58'); g.addColorStop(1, '#14161f'); H.roundRect(ctx, x - w / 2, y - h / 2, w, h, w * 0.45); ctx.fillStyle = g; ctx.fill(); H.roundRect(ctx, x - w / 2 + w * 0.2, y - h / 2 + h * 0.15, w * 0.25, h * 0.7, w * 0.12); ctx.fillStyle = ACC; ctx.fill(); };
    cup(hc[0] + r * 0.95, hc[1] + r * 0.15, r * 0.34, r * 0.72);
    cup(hc[0] - r * 1.2, hc[1] + r * 0.12, r * 0.5, r * 0.9);
    ctx.restore();
  }
  function note(x, y, sc, col, a, rot) {
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
    ctx.shadowColor = H.rgba(col, 0.6); ctx.shadowBlur = 10; noteFlat(0, 0, 1, col); ctx.restore();
  }
  function noteFlat(x, y, sc, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(8, 12); ctx.lineTo(8, -30); ctx.lineTo(30, -36); ctx.lineTo(30, 4); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 14, 11, 8, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(22, 6, 11, 8, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function tri(x, y, dir) { ctx.beginPath(); ctx.moveTo(x - 12 * dir, y - 14); ctx.lineTo(x + 8 * dir, y); ctx.lineTo(x - 12 * dir, y + 14); ctx.closePath(); ctx.fill(); ctx.fillRect(x + 8 * dir - (dir > 0 ? 0 : 4), y - 14, 4, 28); }
  function dot(x, y, r) { if (r <= 0.5) return; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#f2f4fa'; ctx.fill(); }
  function cloud(x, y, r) {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
    ctx.beginPath();
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; ctx.moveTo(x + Math.cos(a) * r * 0.62 + r * 0.42, y + Math.sin(a) * r * 0.5); ctx.arc(x + Math.cos(a) * r * 0.62, y + Math.sin(a) * r * 0.5, r * 0.42, 0, Math.PI * 2); }
    ctx.arc(x, y, r * 0.7, 0, Math.PI * 2);
    const g = ctx.createLinearGradient(0, y - r, 0, y + r); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d9def0'); ctx.fillStyle = g; ctx.fill();
    ctx.restore();
  }
  function button(x, y, p, beat, play) {
    ctx.save(); ctx.translate(x, y); ctx.scale(p.s * p.sx * beat, p.s * p.sy * beat);
    const g = ctx.createLinearGradient(0, -34, 0, 34); g.addColorStop(0, play ? H.mixHex(ACC, '#ffffff', 0.35) : '#ffffff'); g.addColorStop(1, play ? H.mixHex(ACC, '#000000', 0.2) : '#b9c1d6');
    ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = '#161927'; ctx.beginPath();
    if (play) { ctx.moveTo(-10, -16); ctx.lineTo(16, 0); ctx.lineTo(-10, 16); ctx.closePath(); ctx.fill(); }
    else { ctx.moveTo(-14, -14); ctx.lineTo(6, 0); ctx.lineTo(-14, 14); ctx.closePath(); ctx.fill(); ctx.fillRect(8, -14, 6, 28); }
    ctx.restore();
  }
  // pop-in with anticipation (bud squeezes), stretch on the way up, overshoot, squash on settle
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
