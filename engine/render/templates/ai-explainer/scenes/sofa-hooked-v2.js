// Scene "sofa-hooked-v2" (kit v2, full frame, span of 2 beats). Night living room (K2.world2.livingRoom).
// Beat 1 ("design"): close on a generic kid on the sofa with a phone. The chatbot stand-in (K2.drawAssistant, not
//   the mascot) springs out of the phone on an arc (anticipation glow, stretch, squash landing) onto the cushion.
//   On "safe" it pops up a shield (check draws) + "Sold as safe"; on "agreeable" it bobs eagerly and fires "YES!"
//   bubbles and thumbs on arcs at the kid + "Overly agreeable"; on "engaged" a clock spins hours away while the kid,
//   drowsy, keeps scrolling + "Engaged as long as possible".
// Beat 2 ("alleged harms"): the shield greys with a "?"; header pill + three warning chips pop on their cues (the
//   self-harm claim is a text chip only, no imagery). Then the camera opens up: a worried parent walks in from the
//   hall (arcs, follow-through, settle) and reaches out; a dotted line joins parent and kid; the 4th chip
//   ("ARIZONA ALLEGES") pops; on "away" the line snaps, the assistant leans in and the kid turns back to the phone.
// params: sold, agree, engaged, head, chips [4], chipCues [4], safeCue, agreeCue, timeCue, headCue, snapCue
let ACC_ = '#ffe14a', INK_ = '#15140a';
export default function draw(ctx, t, info) {
  const H = info.helpers, K2 = H.kit2, M = H.motion, P = info.params || {}, D = info.duration, ACC = info.accent;
  ACC_ = ACC; INK_ = K2.ACCENT.deep;
  const { clamp, lerp, ease } = M;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const B2 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.5;
  const tBorn = at('chatgpt', 2.8) - 0.75;
  const tSafe = at(P.safeCue || 'safe', B2 * 0.35) - 0.2;
  const tAgree = at(P.agreeCue || 'agreeable', B2 * 0.6) - 0.25;
  const tTime = at(P.timeCue || 'engaged', B2 * 0.78) - 0.2;
  const tHead = at(P.headCue || 'complaints', B2 + 0.6) - 0.3;
  const chips = (P.chips || ['Dangerous medical advice', 'Fed paranoia', 'Encouraged self-harm', { text: 'Discouraged telling parents', tag: 'Arizona alleges' }]).slice(0, 4);
  const chipCues = P.chipCues || ['medical', 'paranoia', 'selfharm', 'nudged'];
  const tChip = chips.map((c, i) => at(chipCues[i], B2 + 1.5 + i * 2) - 0.25);
  const tOpen = at('arizona', tChip[3] - 1.2) - 0.5;            // camera opens up, parent walks in
  const tSnap = at(P.snapCue || 'away', D - 2.2) - 0.05;
  const walk0 = tOpen + 0.1, walk1 = walk0 + 1.5, tReach = walk1 + 0.35;

  // ---------------------------------------------------------------- camera
  const cam = K2.cam(t, [
    { t: 0, x: -10, y: 60, zoom: 1.3 }, { t: 3.0, x: -17, y: 73, zoom: 1.4 }, { t: B2 - 0.3, x: -20, y: 76, zoom: 1.42 },
    { t: tOpen, x: -20, y: 80, zoom: 1.44 }, { t: tOpen + 1.3, x: 113, y: 61, zoom: 1.3 }, { t: D, x: 105, y: 61, zoom: 1.32 },
  ]);
  const W = K2.world2.livingRoom(ctx, { t, cam });
  const L = W.light, S = W.sofa;

  // ---------------------------------------------------------------- kid
  const kx = 330, ks = 1.36;
  const kidOut = {};
  const engagedK = clamp((t - tTime) / 1.5) * (1 - clamp((t - B2) / 0.6));
  const turnBack = M.act(t, tSnap + 0.15, { timing: 'normal', wind: 0.3 });
  const glance = clamp((t - (walk1 - 0.3)) / 0.5);
  let kLook = M.hold(t, 2, 0.12) + 0.15, kNod = 0.06 * engagedK;
  if (t > walk1 - 0.3) kLook = lerp(kLook, 0.85, ease.inOut(glance));
  if (t > tSnap + 0.15) kLook = lerp(0.85, 0.05, clamp(turnBack.v)), kNod = 0.1 * clamp(turnBack.v);
  let kExpr = 'happy', kExpr2 = null, kMix = 0;
  if (t > tAgree) kExpr = 'joy';
  if (t > tAgree + 1.6) { kExpr = 'joy'; kExpr2 = 'sleepy'; kMix = engagedK; }
  if (t > B2) { kExpr = 'focused'; kExpr2 = null; }
  if (t > walk1 - 0.3) kExpr = 'curious';
  if (t > tSnap + 0.15) { kExpr = 'curious'; kExpr2 = 'focused'; kMix = clamp(turnBack.v); }

  // ---------------------------------------------------------------- assistant: born from the phone
  const spot = [545, S.seatY + 4], as0 = 0.66;
  const flyK = clamp((t - tBorn) / 0.42);
  const born = M.act(t, tBorn - 0.25, { timing: 'snappy', wind: 0.5 });
  const tLand = tBorn + 0.42;
  const lean = M.act(t, tSnap, { timing: 'normal', wind: 0.4, overshoot: 0.15 });
  const leanX = -40 * Math.max(0, lean.v);

  // ---------------------------------------------------------------- parent: walks in on a curve, stops, reaches
  const path = [[1010, 985], [960, 1008], [880, 1028], [800, 1036]];
  const walkK = (tt) => ease.inOut((tt - walk0) / (walk1 - walk0), 1.7);
  const pPos = (tt) => M.arcPath(path, walkK(tt));
  const reach = M.act(t, tReach, { timing: 'normal', wind: 0.35 });
  const retract = ease.inOut((t - tSnap - 0.1) / 0.45);
  const reachV = t < tSnap + 0.1 ? clamp(reach.v, -0.4, 1.1) : clamp(reach.v) * (1 - retract);

  // ================================================================ stage
  const kidHand = [0, 0];
  W.stage(ctx, () => {
    // shield beside the assistant (beat 1), greys with "?" at the complaints cue
    const shA = M.act(t, tSafe - 0.12, { timing: 'snappy', wind: 0.4, overshoot: 0.18 });
    const grey = clamp((t - tHead) / 0.5), sink = ease.in(clamp((t - tHead - 1.4) / 0.6));
    if (shA.phase !== 'before' && sink < 1) {
      const s = (shA.phase === 'anticipate' ? 0.15 * shA.wind : Math.max(0, shA.v)) * 0.6 * (1 - sink);
      const sq = M.squashImpact(t, shA.hit, 0.2, 0.45);
      ctx.save(); if (grey > 0) ctx.filter = `grayscale(${grey}) brightness(${1 - 0.3 * grey})`;
      ctx.translate(640, S.seatY + 8 + 60 * sink); ctx.rotate(M.settle(t, shA.hit, 0.08, 1.8, 4) + 0.3 * sink);
      M.squashTransform(ctx, 0, 0, sq, 0);
      if (s > 0.01) K2.drawShield(ctx, 0, 0, s, { light: L, check: clamp((t - tSafe - 0.25) / 0.4) });
      ctx.restore();
      if (grey > 0 && sink < 1) {
        const qa = M.act(t, tHead + 0.3, { timing: 'snappy', wind: 0.4, overshoot: 0.25 });
        if (qa.phase !== 'before') { ctx.save(); ctx.translate(640, S.seatY - 125); const qs = Math.max(0, qa.v) * (1 - sink); ctx.scale(qs, qs); ctx.font = H.font('display', 64); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff'; ctx.fillText('?', 0, 0); ctx.restore(); }
      }
    }

    // kid on the sofa (cushion sink), phone glow, drowsy when "engaged"
    K2.drawHuman(ctx, kx, S.feetY, ks, {
      t, seed: 4, age: 'kid', outfit: 'hoodie', top: '#e0784f', hairStyle: 'curly', hair: 0, skin: 3, eyes: 0, light: L,
      pose: 'sit-phone', hold: 'phone', screen: 1, seatH: S.seatH / ks, cushion: S.color, facing: 0.45,
      look: kLook, nod: kNod, expr: kExpr, expr2: kExpr2, exprMix: kMix, out: kidOut,
      squash: M.squashImpact(t, tAgree + 0.3, 0.06, 0.4), idle: 1,
    });
    if (kidOut.hand) { kidHand[0] = kidOut.hand[0]; kidHand[1] = kidOut.hand[1]; }
    // phone flare before the assistant is born (anticipation)
    if (born.phase === 'anticipate' || (t > tBorn - 0.25 && t < tLand + 0.2)) {
      const g = born.phase === 'anticipate' ? born.wind : 1 - clamp((t - tBorn) / 0.6);
      K2.glow(ctx, kidHand[0], kidHand[1] - 14, 120, '#c8b8ff', 0.6 * g);
    }

    // assistant
    if (t >= tBorn) {
      let ax = spot[0], ay = spot[1], sq = 0, ang = 0, sc = as0;
      if (flyK < 1) {
        const f = (k) => M.arc([kidHand[0], kidHand[1] + 20], spot, k, 70, (x) => ease.out(x, 1.4));
        const p = f(flyK), p2 = f(Math.min(1, flyK + 0.05));
        ax = p[0]; ay = p[1]; sc = as0 * lerp(0.15, 1, ease.out(flyK, 2));
        const sv = M.stretchFromVelocity((p2[0] - p[0]) * 20, (p2[1] - p[1]) * 20, 0.0005, 0.35); sq = sv.s; ang = sv.angle;
      } else sq = M.squashImpact(t, tLand, 0.28, 0.55);
      // eager nodding while agreeable (beat 1), lean toward the kid on "away"
      const nodding = clamp((t - tAgree) / 0.3) * (1 - clamp((t - tTime - 0.3) / 0.5));
      sq += nodding * 0.09 * Math.sin((t - tAgree) * 10);
      ax += leanX;
      const talk = (t > tAgree && t < tTime + 2) || (t > tSnap && t < tSnap + 1.8) ? 0.5 + 0.5 * Math.sin(t * 7) : 0;
      ctx.save(); M.squashTransform(ctx, ax, ay - 60 * sc, sq, ang);
      K2.drawAssistant(ctx, ax, ay, sc, { t, seed: 3, light: L, facing: -0.55, talk: talk * 0.8, squash: 0, mood: t > B2 && t < tSnap ? 'neutral' : 'happy' });
      ctx.restore();
    }

    // parent
    if (t > walk0 - 0.05) {
      const pp = pPos(t), walking = t < walk1, ps = lerp(1.0, 1.22, walkK(t));
      const stopLean = M.settle(t, walk1, 0.06, 1.4, 3.5);
      const parentOut = {};
      K2.drawHuman(ctx, pp[0], pp[1], ps, {
        t, seed: 9, age: 'adult', outfit: 'cardigan', top: '#4a7bd0', bottom: 'charcoal', hairStyle: 'long', hair: 2, skin: 1, light: L,
        walk: walking ? walkK(t) * 2.6 / 0.8 : null, cadence: 0.8, stride: 0.75, drive: (tt) => pPos(tt)[0] * 1.2,
        facing: walking ? -0.85 : -0.5, pose: 'stand', pose2: 'reach', poseMix: walking ? 0 : clamp(reachV),
        lean: stopLean, look: -0.6, expr: t < tSnap ? 'worried' : 'sad', exag: 1.2, out: parentOut,
      });
      // dotted line parent <-> kid, snaps on the cue (halves recoil on springs, an X pops)
      const lk = clamp((t - tReach - 0.2) / 0.5);
      if (lk > 0 && kidOut.head && parentOut.head) {
        const a = [kidOut.head[0] + 40, kidOut.head[1] + 10], b = [parentOut.head[0] - 40, parentOut.head[1] + 20];
        const mid = [(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - 60];
        const snapped = t > tSnap, rec = snapped ? 1 - Math.exp(-(t - tSnap) * 6) : 0, wob = M.settle(t, tSnap, 18, 2.2, 3.5);
        ctx.save(); ctx.setLineDash([14, 12]); ctx.lineDashOffset = -t * 40; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.strokeStyle = snapped ? '#ff6b5e' : 'rgba(255,255,255,0.85)';
        const qp = (u) => { const v = 1 - u; return [v * v * a[0] + 2 * v * u * mid[0] + u * u * b[0], v * v * a[1] + 2 * v * u * mid[1] + u * u * b[1]]; };
        const seg = (u0, u1, droop) => { ctx.beginPath(); for (let k = 0; k <= 24; k++) { const u = lerp(u0, u1, k / 24) * (snapped ? 1 : lk), p = qp(u), d = droop * Math.sin(Math.PI * (k / 24)); if (k) ctx.lineTo(p[0], p[1] + d); else ctx.moveTo(p[0], p[1] + d); } ctx.stroke(); };
        if (!snapped) seg(0, 1, 0); else { const gap = 0.16 * rec; seg(0, 0.5 - gap, 50 * rec + wob); seg(0.5 + gap, 1, 50 * rec - wob); }
        ctx.restore();
        if (snapped) {
          const xa = M.act(t, tSnap - 0.1, { timing: 'snappy', wind: 0.4, overshoot: 0.3 }), p = qp(0.5);
          if (xa.phase !== 'before') { const s = xa.phase === 'anticipate' ? 0.3 * xa.wind : Math.max(0, xa.v); ctx.save(); ctx.translate(p[0], p[1] + 20); ctx.rotate(0.3 * (1 - clamp(xa.v))); ctx.scale(s, s); ctx.strokeStyle = '#ff6b5e'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-20, -20); ctx.lineTo(20, 20); ctx.moveTo(20, -20); ctx.lineTo(-20, 20); ctx.stroke(); ctx.restore(); }
        }
      }
    }
  });
  W.front(ctx);

  // ================================================================ screen-space UI
  // "YES!" bubbles + thumbs fly on arcs from the assistant to the kid (beat 1)
  const aScr = W.toScreen(spot[0], spot[1] - 140), kScr = W.toScreen(kx + 30, S.seatY - 250);
  for (let i = 0; i < 6; i++) {
    const s0 = tAgree + 0.1 + i * 0.38, life = t - s0;
    if (life < 0 || life > 1.6 || t > tTime + 0.8) continue;
    const k = clamp(life / 0.7), p = M.arc([aScr[0] - 20, aScr[1]], [kScr[0] + [40, -30, 70, -60, 20, 90][i], kScr[1] - [0, 40, 70, 20, 90, 50][i]], k, 60, (x) => ease.out(x, 1.8));
    const pop = M.act(life, 0, { timing: 'snappy', wind: 0.3, overshoot: 0.25 });
    const s = Math.max(0, pop.phase === 'anticipate' ? 0.2 : pop.v) * (1 - ease.in(clamp((life - 1.2) / 0.4)));
    const sq = M.squashImpact(life, 0.7, 0.18, 0.4);
    ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(s / (1 + sq), s * (1 + sq)); ctx.rotate((i % 2 ? 1 : -1) * 0.1 * (1 - k));
    if (i % 2 === 0) yesBubble(ctx, H); else thumb(ctx, ACC, INK_);
    ctx.restore();
  }
  // beat 1 pills
  const out1 = B2 - 0.25;
  pill(ctx, H, M, t, 250, 420, tSafe + 0.15, P.sold || 'Sold as safe', { accent: true, size: 32, out: out1, seed: 1 });
  pill(ctx, H, M, t, 700, 420, tAgree + 0.2, P.agree || 'Overly agreeable', { dot: true, size: 30, out: tTime, seed: 2 });
  pill(ctx, H, M, t, 640, 420, tTime + 0.3, P.engaged || 'Engaged as long as possible', { dot: true, size: 28, out: out1, seed: 3 });
  // spinning clock (time slipping away)
  const ck = M.act(t, tTime + 0.05, { timing: 'snappy', wind: 0.4, overshoot: 0.2 });
  if (ck.phase !== 'before' && t < out1 + 0.4) {
    const s = (ck.phase === 'anticipate' ? 0.2 * ck.wind : Math.max(0, ck.v)) * (1 - ease.backIn(clamp((t - out1) / 0.35), 1.4));
    const spin = ease.inOut(clamp((t - tTime - 0.3) / (B2 - tTime - 0.9)), 1.6) * Math.PI * 2 * 5;
    if (s > 0.01) clock(ctx, 860, 520 + M.hold(t, 4, 3), s, spin, ACC);
  }
  // beat 2: header + chips (phase A), then the tagged chip alone (phase B)
  const outA = tOpen - 0.1;
  pill(ctx, H, M, t, 487, 400, tHead, P.head || 'According to the complaints', { accent: true, size: 30, out: outA, seed: 4 });
  const pos = [[272, 466], [702, 466], [660, 538], [420, 490]];
  chips.forEach((c, i) => {
    const text = typeof c === 'string' ? c : c.text, tag = typeof c === 'string' ? null : c.tag;
    chip(ctx, H, M, t, pos[i][0], pos[i][1], tChip[i], text, tag, i < 3 ? outA + i * 0.06 : null, i);
  });
}

function chip(ctx, H, M, t, x, y, t0, text, tag, out, seed) {
  const a = M.act(t, t0 - 0.12, { timing: 'snappy', wind: 0.35, overshoot: 0.16 });
  if (a.phase === 'before') return;
  let s = a.phase === 'anticipate' ? 0.2 * a.wind : Math.max(0, a.v), q = a.phase === 'action' ? 0.2 * (1 - a.k) : 0;
  q += M.squashImpact(t, a.hit, 0.12, 0.4);
  if (out != null && t > out) { s *= 1 - M.ease.backIn(M.clamp((t - out) / 0.3), 1.4); if (s <= 0.01) return; }
  ctx.save(); ctx.translate(x, y + M.hold(t, seed + 11, 2)); const sy = 1 + q; ctx.scale(s / sy, s * sy);
  if (tag) {
    ctx.font = H.font('ui', 22); const tw = ctx.measureText(String(tag).toUpperCase()).width + 30;
    H.roundRect(ctx, -tw / 2, -66, tw, 34, 17); ctx.fillStyle = ACC_; ctx.fill();
    ctx.fillStyle = INK_; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(tag).toUpperCase(), 0, -48);
  }
  ctx.font = H.font('ui', 27);
  const w = Math.min(440, ctx.measureText(text).width + 90), h = 58;
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 7;
  H.roundRect(ctx, -w / 2, -h / 2, w, h, 29); ctx.fillStyle = 'rgba(14,12,24,0.94)'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,138,92,0.85)'; ctx.stroke();
  const pulse = 1 + 0.08 * Math.sin((t - t0) * 6);
  ctx.save(); ctx.translate(-w / 2 + 32, 2); ctx.scale(pulse, pulse);
  ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(16, 12); ctx.lineTo(-16, 12); ctx.closePath(); ctx.fillStyle = '#ff8a5c'; ctx.fill();
  ctx.fillStyle = '#1a1020'; ctx.fillRect(-2, -7, 4, 11); ctx.fillRect(-2, 6, 4, 4);
  ctx.restore();
  const f = H.fitText(ctx, text, 'ui', 27, 22, w - 80); ctx.font = f.font;
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, -w / 2 + 58, 1);
  ctx.restore();
}

function yesBubble(ctx, H) {
  ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5;
  H.roundRect(ctx, -62, -34, 124, 62, 28); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(18, 24); ctx.lineTo(34, 46); ctx.lineTo(40, 22); ctx.closePath(); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.font = H.font('display', 32); ctx.fillStyle = '#1b1d2e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('YES!', 0, -1);
}

function thumb(ctx, fill, ink) {
  ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 5;
  ctx.beginPath(); ctx.arc(0, 0, 36, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = ink;
  ctx.fillRect(-17, -2, 10, 21);
  ctx.beginPath(); ctx.moveTo(-5, -2); ctx.lineTo(2, -21); ctx.quadraticCurveTo(9, -25, 9, -14); ctx.lineTo(7, -4); ctx.lineTo(17, -4); ctx.quadraticCurveTo(23, -3, 21, 4); ctx.lineTo(17, 17); ctx.quadraticCurveTo(15, 20, 11, 20); ctx.lineTo(-5, 20); ctx.closePath(); ctx.fill();
}

function clock(ctx, x, y, s, spin, acc) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
  ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fillStyle = '#2a2e48'; ctx.fill();
  ctx.shadowColor = 'transparent';
  const g = ctx.createRadialGradient(-12, -14, 4, 0, 0, 44); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#dfe2ec');
  ctx.beginPath(); ctx.arc(0, 0, 42, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
  ctx.fillStyle = '#2a2e48'; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ctx.fillRect(Math.cos(a) * 34 - 2, Math.sin(a) * 34 - 2, 4, 4); }
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#2a2e48'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(spin / 12 + 2) * 20, -Math.cos(spin / 12 + 2) * 20); ctx.stroke();
  ctx.strokeStyle = acc; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(spin) * 32, -Math.cos(spin) * 32); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fillStyle = '#2a2e48'; ctx.fill();
  ctx.restore();
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
