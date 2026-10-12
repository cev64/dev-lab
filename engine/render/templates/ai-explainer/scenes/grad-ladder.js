// Scene "grad-ladder" (full frame). A fresh graduate (cartoon, cap and gown) at the foot of a tall career ladder in a
// city at dusk. The bottom rung is the accent "FIRST JOB" rung.
// modes: "intro"  the graduate walks in, stops at the ladder and looks up; the first rung glows (works under the hook card)
//        "vanish" the graduate reaches for the first rung; at `lessCue` it cracks and a small robot carries it off
//                 to the right (its label turns into `lessLabel`); a hedged note chip lands at `noteCue`
//        "payoff" the bottom rung is missing; a clock + `act` pill at `actCue`, the graduate hops and can't reach
//                 rung 2 at `climbCue`, a big "?" + question at `qCue`; ends settled
// params (all optional): mode "intro" (default) | "vanish" | "payoff"
//         rung       label of the first rung (default "FIRST JOB")
//         vanish:    headline (default "The first rung"), lessLabel (default "LESS DEMAND"),
//                    note (default "Fewer openings for beginners"); cues lessCue (50 %), noteCue (75 %)
//         payoff:    act (default "ACT SOON"), question (default "Where do you start?"); cues actCue (15 %),
//                    climbCue (40 %), qCue (70 %)
//         cue params are narration words (scene-relative timeOf); without them the % of the scene is used.
// Fits: entry-level jobs, graduates, career ladders, "the bottom rung", hiring freezes for juniors.
// (Promoted from 2026-10-12 first-jobs; that story used lessCue "less", noteCue "clearest", actCue "act",
//  climbCue "bottom", qCue "disappears".)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent;
  const mode = P.mode || 'intro';
  const cue = (w, fb) => { const v = w != null ? info.timeOf(w) : null; return v != null ? v : fb; };

  const LX = 610, BASE = 1030, RW = 170, GAP = 92;
  const rungY = (i) => BASE - 78 - i * GAP;       // i = 0 is the first rung
  const NR = 8;

  // ---- camera
  let z = 1.04, cx = 520, cy = 760;
  if (mode === 'intro') { z = lerp(1.0, 1.06, K.phase(t, 0, D)); cy = 780; }
  if (mode === 'vanish') { z = lerp(1.12, 1.04, K.phase(t, 0, D)); cx = 540; cy = lerp(800, 770, K.phase(t, 0, D)); }
  if (mode === 'payoff') { z = lerp(1.0, 1.08, K.phase(t, 0, D)); cx = 520; cy = 740; }
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: z, x: cx, y: cy }]);

  K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });

  // ---- ladder
  const lessAt = cue(P.lessCue, D * 0.5);
  const crack = mode === 'vanish' ? K.phase(t, lessAt, lessAt + 0.45) : 0;
  const carry = mode === 'vanish' ? K.phase(t, lessAt + 0.35, lessAt + 3.2, H.easeInOutCubic) : 0;
  const firstGone = mode === 'payoff' || (mode === 'vanish' && t > lessAt + 0.35);
  drawLadder(ctx, K, H, { x: LX, base: BASE, w: RW, n: NR, rungY, firstGone, glow: mode !== 'payoff', t, crack, ACC });

  // ghost outline where the first rung was
  if (firstGone) {
    const a = mode === 'payoff' ? 0.55 + 0.25 * Math.sin(t * 3) : clamp((t - lessAt - 0.4) / 0.6) * 0.6;
    ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([14, 10]); ctx.lineWidth = 4; ctx.strokeStyle = ACC;
    H.roundRect(ctx, LX - RW / 2 + 6, rungY(0) - 9, RW - 12, 18, 9); ctx.stroke(); ctx.restore();
  }

  // ---- graduate
  const G = { s: 1.45 };
  let gx = mode === 'payoff' ? 455 : 430, walk = null, pose = 'stand', mood = 'happy', hop = 0, flip = false;
  if (mode === 'intro') {
    const k = K.phase(t, 0, 1.9, H.easeOutCubic);
    gx = lerp(150, 430, k);
    if (t < 1.9) walk = t;
  }
  if (mode === 'vanish') {
    const reach = K.phase(t, 0.6, 1.4);
    pose = reach > 0.5 && t < lessAt + 0.2 ? 'point' : 'stand';
    mood = t < lessAt + 0.2 ? 'happy' : t < lessAt + 3 ? 'shocked' : 'worried';
    gx = 430 - 20 * K.phase(t, lessAt + 0.1, lessAt + 0.5, H.easeOutBack);
  }
  if (mode === 'payoff') {
    mood = 'worried';
    const climbAt = cue(P.climbCue, D * 0.4);
    const k = clamp((t - climbAt) / 0.7);
    hop = k > 0 && k < 1 ? Math.sin(k * Math.PI) * 70 : 0;
    pose = k > 0 && k < 1 ? 'cheer' : 'stand';
  }
  drawGrad(ctx, K, gx, BASE - hop, G.s, { t, walk, pose, mood, flip, seed: 2, ACC, look: mode === 'intro' ? 0.6 : 0.4 });

  // ---- robot carries the rung away (vanish)
  if (mode === 'vanish' && t > lessAt + 0.2) {
    const rx = lerp(LX + 120, 1180, carry), ry = BASE;
    const rs = 1.3;
    K.drawRobot(ctx, rx, ry, rs, { t, state: carry > 0 && carry < 1 ? 'working' : 'happy', seed: 4 });
    // the rung held over its head
    if (carry < 1) {
      const hy = ry - 118 * rs;
      ctx.save(); ctx.translate(rx, hy); ctx.rotate(-0.12 + 0.05 * Math.sin(t * 6));
      H.roundRect(ctx, -RW / 2 + 6, -9, RW - 12, 18, 9); ctx.fillStyle = ACC; ctx.fill();
      ctx.restore();
    }
  }
  // crack sparks
  if (mode === 'vanish' && crack > 0 && crack < 1) {
    ctx.save(); ctx.strokeStyle = H.rgba(ACC, 1 - crack); ctx.lineWidth = 4; ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, r0 = 30 + 60 * crack; ctx.beginPath(); ctx.moveTo(LX + Math.cos(a) * r0, rungY(0) + Math.sin(a) * r0 * 0.6); ctx.lineTo(LX + Math.cos(a) * (r0 + 22), rungY(0) + Math.sin(a) * (r0 + 22) * 0.6); ctx.stroke(); }
    ctx.restore();
  }
  ctx.restore(); // camera

  // ---- overlays (screen space, inside the stage x 60-915, y 400-1050)
  if (mode === 'intro') {
    const p = K.popIn(t, 1.2, 0.5);
    if (p > 0) K.drawLabel(ctx, 795, 1010, p, { text: P.rung || 'FIRST JOB', size: 28, accent: true });
  }
  if (mode === 'vanish') {
    const p = K.popIn(t, 0.4, 0.5);
    if (p > 0) {
      const lab = t < lessAt + 0.2 ? (P.rung || 'FIRST JOB') : (P.lessLabel || 'LESS DEMAND');
      K.drawLabel(ctx, 800, 1012, p, { text: lab, size: 28, accent: t < lessAt + 0.2, dot: t >= lessAt + 0.2 });
    }
    const hp = K.popIn(t, 0.2, 0.5);
    if (hp > 0) headline(ctx, K, H, 487, 470, hp, P.headline || 'The first rung', ACC);
    const noteAt = cue(P.noteCue, D * 0.75);
    const np = K.popIn(t, noteAt, 0.5);
    if (np > 0) K.drawLabel(ctx, 487, 585, np, { text: P.note || 'Fewer openings for beginners', size: 27, dot: true });
  }
  if (mode === 'payoff') {
    const actAt = cue(P.actCue, D * 0.15);
    const ap = K.popIn(t, actAt, 0.5);
    if (ap > 0) {
      K.drawClock(ctx, 185, 640, 0.95 * ap, { t, speed: 3 });
      K.drawLabel(ctx, 185, 700, ap, { text: P.act || 'ACT SOON', size: 28, accent: true });
    }
    const qAt = cue(P.qCue, D * 0.7);
    const qp = K.popIn(t, qAt, 0.6);
    if (qp > 0) {
      ctx.save(); ctx.translate(800, 610); ctx.scale(qp, qp);
      ctx.font = K.font.display(190); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(10,12,22,0.9)'; ctx.strokeText('?', 0, 70); ctx.fillStyle = ACC; ctx.fillText('?', 0, 70);
      ctx.restore();
      K.drawLabel(ctx, 520, 490, qp, { text: P.question || 'Where do you start?', size: 36 });
    }
  }
}

function headline(ctx, K, H, x, y, p, text, ACC) {
  ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
  ctx.font = K.font.display(44);
  const w = Math.min(800, ctx.measureText(text.toUpperCase()).width + 60);
  H.roundRect(ctx, -w / 2, -44, w, 88, 22); ctx.fillStyle = 'rgba(10,12,22,0.88)'; ctx.fill();
  ctx.fillStyle = ACC; ctx.fillRect(-w / 2 + 22, 30, w - 44, 5);
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let fs = 44; while (fs > 26 && ctx.measureText(text.toUpperCase()).width > w - 50) { fs -= 2; ctx.font = K.font.display(fs); }
  ctx.fillText(text.toUpperCase(), 0, 2);
  ctx.restore();
}

function drawLadder(ctx, K, H, o) {
  const { x, base, w, n, rungY, firstGone, glow, t, crack, ACC } = o;
  const rail = '#b8c2e0', railS = '#8792b5', rung = '#d6dcf0';
  const top = rungY(n - 1) - 60;
  K.shadow(ctx, x, base, w + 120);
  for (const side of [-1, 1]) {
    const rx = x + side * w / 2;
    H.roundRect(ctx, rx - 11, top, 22, base - top, 10); ctx.fillStyle = side < 0 ? rail : railS; ctx.fill();
  }
  for (let i = 0; i < n; i++) {
    const y = rungY(i);
    if (i === 0) {
      if (firstGone) continue;
      if (glow) K.glow(ctx, x, y, 150, ACC, 0.35 + 0.15 * Math.sin(t * 4));
      ctx.save();
      if (crack > 0) { ctx.translate(x, y); ctx.rotate(0.12 * crack); ctx.translate(-x, -y); ctx.globalAlpha = 1 - 0.3 * crack; }
      H.roundRect(ctx, x - w / 2 + 6, y - 9, w - 12, 18, 9); ctx.fillStyle = ACC; ctx.fill();
      ctx.restore();
      continue;
    }
    H.roundRect(ctx, x - w / 2 + 6, y - 8, w - 12, 16, 8); ctx.fillStyle = rung; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x - w / 2 + 10, y + 3, w - 20, 4);
  }
}

// Graduate: a kit person in a gown colour with an accent stole and a mortarboard with a tassel.
function drawGrad(ctx, K, x, y, s, o) {
  const GOWN = '#4656b8';
  const walking = o.walk != null;
  const bob = walking ? -Math.abs(Math.sin(o.walk * 1.8 * Math.PI * 2)) * 5 : Math.sin((o.t || 0) * 1.6 + (o.seed || 0)) * 1.2;
  K.drawPerson(ctx, x, y, s, { t: o.t, walk: o.walk, pose: o.pose, mood: o.mood, shirt: GOWN, skin: 2, hair: 0, hairStyle: 'short', seed: o.seed, look: o.look, flip: o.flip });
  const hipY = -104 + bob, shY = hipY - 64, headY = shY - 44;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // stole
  ctx.strokeStyle = o.ACC; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-12, shY + 2); ctx.lineTo(-11, hipY - 2); ctx.moveTo(12, shY + 2); ctx.lineTo(11, hipY - 2); ctx.stroke();
  // mortarboard
  const hy = headY - 26;
  ctx.fillStyle = '#1a1d33';
  ctx.beginPath(); ctx.moveTo(-26, hy); ctx.lineTo(26, hy); ctx.lineTo(24, hy + 14); ctx.lineTo(-24, hy + 14); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-50, hy - 4); ctx.lineTo(0, hy - 18); ctx.lineTo(50, hy - 4); ctx.lineTo(0, hy + 8); ctx.closePath(); ctx.fillStyle = '#23274a'; ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 2; ctx.stroke();
  // tassel
  const sw = Math.sin((o.t || 0) * 3) * 3;
  ctx.strokeStyle = o.ACC; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, hy - 5); ctx.lineTo(34, hy - 2); ctx.lineTo(36 + sw, hy + 26); ctx.stroke();
  ctx.fillStyle = o.ACC; ctx.beginPath(); ctx.arc(36 + sw, hy + 30, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
