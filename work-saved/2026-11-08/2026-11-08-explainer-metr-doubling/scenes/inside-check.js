// Scene "inside-check" (full frame; one mode per beat). Outside testers (generic cartoons with lanyard badges and
// clipboards) check an AI lab from the inside, where AI is helping build the next AI.
// modes:
//   cold    - cold open: in a night lab a builder robot "prints" a bigger robot (scan beam, sparks) while a wall gauge
//             needle swings from 1x to 2x and a big "2x" pops; an outside tester points at it. Lab name pill from frame 0.
//   arrive  - phase A: the company stand-in robot by a lectern with its filing booklet, "Days ago" + `claim` pills;
//             on metrCue a dark flash cuts to the lab, where two testers walk in through a doorway; group pill, then a
//             calendar card (`dates`, `weeks` cells fill), then access chips (`items`, check marks).
//   share   - a researcher and a robot assistant at a desk; the robot does most of the work (pages fly to a stack); a
//             card asks `ask`, then `guess` subtitle, then a bar fills to `share` % ("AI helping with research").
//   outpace - a build machine pushes new robots onto a conveyor, faster and faster, past a worried rule-writer with a
//             rulebook ("could outrun the rules?"); on nowCue the belt slows, a researcher steps in beside a robot
//             helper, "For now: AI mostly assists" and a cross stamp "NOT ALONE" on a "Running research alone" chip.
//   redact  - an outside tester by a big report on an easel; three caveat chips pop (cues); on redactCue black bars
//             sweep over most of the report's lines, a REDACTED stamp lands, then a `reason` pill.
// params: mode, per-mode text (company, claim, group, dates, weeks, items, ask, guess, share, shareLabel, ...) and cue
// words (see each mode); without cues each mode uses fixed fractions of its duration. Defaults are generic.
// Fits: outside audits / evaluations inside AI labs; AI-speeds-up-AI stories; redacted or partial reports.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const E = { H, K, P, D, info, at, ACC: info.accent };
  ctx.save();
  ({ cold, arrive, share, outpace, redact }[P.mode] || cold)(ctx, t, E);
  ctx.restore();
}

// ---------------------------------------------------------------- shared pieces
function lab(ctx, t, E, o = {}) {
  const { H, K } = E;
  K.world.room(ctx, { t, time: 'night', lamp: o.lamp !== false, window: false, picture: false, plant: false });
  ctx.save();
  H.roundRect(ctx, 70, 455, 300, 190, 14); ctx.fillStyle = 'rgba(20,24,44,0.55)'; ctx.fill();
  for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.arc(95 + i * 42, 480 + j * 44, 3, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill(); }
  ctx.fillStyle = '#8a93a8'; ctx.fillRect(120, 500, 10, 70); ctx.fillRect(108, 495, 34, 12);
  ctx.fillStyle = '#e8786a'; ctx.fillRect(200, 505, 60, 14); ctx.fillStyle = '#6f86e0'; ctx.fillRect(290, 498, 12, 80);
  ctx.restore();
}

// centred pill (cx, cy = centre), pops with k
function pill(E, ctx, cx, cy, k, text, o = {}) {
  const { H, ACC } = E;
  if (k <= 0.01) return;
  const size = o.size || 30;
  ctx.save(); ctx.translate(cx, cy); const s = Math.min(1.05, k); ctx.scale(s, s);
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  ctx.font = H.font('ui', size);
  const extra = o.check ? size * 1.0 : 0;
  const w = Math.min(o.maxW || 740, ctx.measureText(text).width + size * 1.6 + extra), h = size * 1.8;
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
  ctx.fillStyle = o.solid ? ACC : 'rgba(10,12,24,0.92)'; ctx.fill();
  if (!o.solid) { ctx.lineWidth = 2.5; ctx.strokeStyle = H.rgba(ACC, 0.75); ctx.stroke(); }
  let tx = 0;
  if (o.check) {
    tx = size * 0.5; const cx2 = -w / 2 + size * 0.95;
    ctx.strokeStyle = o.solid ? '#14160a' : ACC; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(cx2 - 9, 1); ctx.lineTo(cx2 - 2, 8); ctx.lineTo(cx2 + 11, -8); ctx.stroke();
  }
  ctx.fillStyle = o.solid ? '#14160a' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const f = H.fitText(ctx, text, 'ui', size, 18, w - size * 1.4 - extra); ctx.font = f.font;
  ctx.fillText(f.text, tx, 2);
  ctx.restore();
}

// an outside tester: kit person + lanyard badge + clipboard under the far arm
function tester(E, ctx, x, y, s, o) {
  const { H, K, ACC } = E;
  K.drawPerson(ctx, x, y, s, o);
  const bob = o.walk != null ? -Math.abs(Math.sin(o.walk * 1.8 * Math.PI * 2)) * 5 : 0;
  const shY = -168 + bob, dir = o.flip ? -1 : 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = ACC; ctx.lineWidth = 3; ctx.beginPath();
  ctx.moveTo(-9, shY - 2); ctx.lineTo(0, shY + 30); ctx.lineTo(9, shY - 2); ctx.stroke();
  H.roundRect(ctx, -12, shY + 28, 24, 30, 4); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.fillStyle = ACC; ctx.fillRect(-12, shY + 28, 24, 9);
  ctx.fillStyle = '#9aa3bd'; ctx.fillRect(-7, shY + 42, 14, 3); ctx.fillRect(-7, shY + 49, 10, 3);
  if (o.clipboard !== false) {
    ctx.save(); ctx.translate(-dir * 40, shY + 56); ctx.rotate(-dir * 0.12);
    H.roundRect(ctx, -20, -30, 40, 54, 5); ctx.fillStyle = '#9a6a46'; ctx.fill();
    H.roundRect(ctx, -16, -24, 32, 44, 3); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    H.roundRect(ctx, -8, -34, 16, 9, 3); ctx.fillStyle = '#c9ced9'; ctx.fill();
    ctx.fillStyle = '#b9c1d6'; for (let i = 0; i < 4; i++) ctx.fillRect(-11, -16 + i * 9, i === 3 ? 12 : 22, 3);
    ctx.restore();
  }
  ctx.restore();
}

// speed gauge: m is the multiplier shown (0 .. MAX), ticks labelled 1x and 2x
function gauge(E, ctx, x, y, r, m, o = {}) {
  const { H, ACC } = E, MAX = 2.4, A0 = Math.PI * 0.8, A1 = Math.PI * 2.2;
  const ang = (v) => A0 + (A1 - A0) * H.clamp(v / MAX);
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r + 18, 0, Math.PI * 2); ctx.fillStyle = '#1b2036'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = '#3b4260'; ctx.stroke();
  ctx.lineCap = 'round'; ctx.lineWidth = 16;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.arc(x, y, r - 10, A0, A1); ctx.stroke();
  ctx.strokeStyle = H.rgba(ACC, 0.95); ctx.beginPath(); ctx.arc(x, y, r - 10, A0, ang(m)); ctx.stroke();
  ctx.font = H.font('ui', 24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  [[1, '1x'], [2, '2x']].forEach(([v, s]) => {
    const a = ang(v); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * (r - 26), y + Math.sin(a) * (r - 26)); ctx.lineTo(x + Math.cos(a) * (r + 6), y + Math.sin(a) * (r + 6)); ctx.stroke();
    ctx.fillStyle = v === 2 ? ACC : 'rgba(255,255,255,0.8)'; ctx.fillText(s, x + Math.cos(a) * (r + 44), y + Math.sin(a) * (r + 44));
  });
  const na = ang(m); ctx.lineWidth = 9; ctx.strokeStyle = '#ffffff';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(na) * (r - 30), y + Math.sin(na) * (r - 30)); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
  if (o.big > 0) {
    ctx.save(); ctx.translate(x, y + r * 0.52); const s = Math.min(1.08, o.big); ctx.scale(s, s);
    ctx.font = H.font('display', 54); ctx.fillStyle = ACC; ctx.fillText(o.bigText || '2x', 0, 0); ctx.restore();
  }
  ctx.restore();
}

// a robot being built: solid up to `prog`, the rest a faint wireframe; scan beam + sparks while building
function printRobot(E, ctx, t, x, y, s, prog, o = {}) {
  const { H, K, ACC } = E, top = y - 236 * s, cut = y - (y - top) * prog;
  H.roundRect(ctx, x - 120 * s, y - 6, 240 * s, 22, 10); ctx.fillStyle = '#3b4260'; ctx.fill();
  ctx.save(); ctx.globalAlpha = 0.18; K.drawRobot(ctx, x, y, s, { t, state: 'idle', seed: 11 }); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(x - 200 * s, cut, 400 * s, y - cut + 40); ctx.clip();
  K.drawRobot(ctx, x, y, s, { t, state: o.state || 'idle', seed: 11 }); ctx.restore();
  if (prog < 1) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, cut - 20, 0, cut + 20); g.addColorStop(0, H.rgba(ACC, 0)); g.addColorStop(0.5, H.rgba(ACC, 0.9)); g.addColorStop(1, H.rgba(ACC, 0));
    ctx.fillStyle = g; ctx.fillRect(x - 150 * s, cut - 20, 300 * s, 40);
    const f = Math.floor(t * 18);
    for (let i = 0; i < 9; i++) {
      const u = H.hash(f, i), w = H.hash(i, f + 7), sx = x + (u - 0.5) * 220 * s, sy = cut + (w - 0.5) * 14;
      ctx.strokeStyle = H.rgba('#ffe9a8', 0.8); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + (w - 0.5) * 40, sy - 10 - u * 26); ctx.stroke();
    }
    ctx.restore();
  }
}

function booklet(E, ctx, x, y, s, title) {
  const { H } = E;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  H.roundRect(ctx, -80, -110, 160, 220, 12); ctx.fillStyle = '#3b4672'; ctx.fill();
  H.roundRect(ctx, -66, -96, 132, 192, 8); ctx.fillStyle = '#f2f4fa'; ctx.fill();
  ctx.font = H.font('display', 30); ctx.fillStyle = '#3b4672'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(title, 0, -60);
  for (let i = 0; i < 6; i++) { H.roundRect(ctx, -50, -24 + i * 20, 100 * (0.55 + 0.45 * H.hash(i, 9)), 8, 4); ctx.fillStyle = '#d5dae8'; ctx.fill(); }
  ctx.restore();
}

// ---------------------------------------------------------------- cold open
function cold(ctx, t, E) {
  const { H, K, P, D } = E;
  K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 487, y: 735 }, { t: D, zoom: 1.07, x: 487, y: 735 }]);
  lab(ctx, t, E);
  const rise = K.phase(t, 0, 1.7, H.easeOutCubic);
  const m = 1.15 + 0.85 * rise + (t > 1.5 ? 0.06 * Math.sin((t - 1.5) * 14) * Math.exp(-(t - 1.5) * 1.6) : 0);
  const tBig = 1.55;
  gauge(E, ctx, 660, 610, 108, m, { big: K.popIn(t, tBig, 0.4), bigText: P.big || '2x' });
  pill(E, ctx, 640, 785, 1, P.gauge || 'Pace of progress', { size: 24 });
  const prog = 0.4 + 0.6 * K.phase(t, 0, 2.3, H.easeInOutCubic);
  printRobot(E, ctx, t, 450, 1032, 1.25, prog, { state: t > 2.4 ? 'happy' : 'idle' });
  K.drawRobot(ctx, 190, 1035, 0.95, { t, state: 'working', seed: 3 });
  ctx.save(); ctx.strokeStyle = H.rgba(E.ACC, 0.7); ctx.lineWidth = 5; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 90;
  ctx.beginPath(); ctx.moveTo(235, 920); ctx.quadraticCurveTo(300, 860, 350, 900); ctx.stroke(); ctx.restore();
  // the outside tester on the right, pointing at the gauge
  tester(E, ctx, 855, 1035, 1.1, { t, pose: t > 1.0 ? 'point' : 'stand', mood: t > tBig ? 'shocked' : 'neutral', flip: true, look: -1, shirt: '#4fb3a6', skin: 1, hair: 0, hairStyle: 'bun', seed: 2 });
  // lab name: fully visible from frame 0 (cold open + loop)
  pill(E, ctx, 300, 530, 1, P.company || 'AI LAB', { size: 28, solid: true });
}

// ---------------------------------------------------------------- the testers arrive
function arrive(ctx, t, E) {
  const { H, K, P, D, at } = E, { clamp, smooth } = H;
  const tDays = at(P.daysCue, D * 0.08) - 0.2;
  const tClaim = at(P.claimCue, D * 0.22) - 0.3;
  const tM = at(P.metrCue, D * 0.45) - 0.35;          // the cut
  const tGroup = at(P.groupCue, tM + 0.8) - 0.3;
  const tCal = at(P.weeksCue, D * 0.75) - 0.3;
  const items = (P.items || ['Internal data', 'Staff interviews']).slice(0, 2);
  const tItem = at(P.itemCue, D * 0.88) - 0.3;
  if (t < tM) {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: tM, zoom: 1.06, x: 470, y: 760 }]);
    K.world.office(ctx, { t, time: 'dusk' });
    K.drawLectern(ctx, 330, 1035, 0.95, {});
    booklet(E, ctx, 330, 1035 - 232 * 0.95 - 70, 0.85, P.doc || 'FILING');
    K.drawRobot(ctx, 640, 1035, 1.2, { t, state: t > tClaim ? 'thinking' : 'idle', talk: 0, seed: 4, flip: true });
    pill(E, ctx, 640, 730, K.popIn(t, 0.1, 0.4), P.company || 'COMPANY', { size: 26, solid: true });
    pill(E, ctx, 487, 535, K.popIn(t, tDays, 0.4), P.days || 'Days ago: its own filing', { size: 28 });
    pill(E, ctx, 487, 610, K.popIn(t, tClaim, 0.4), P.claim || 'Self-building AI may be close', { size: 30, solid: true });
    const fo = smooth((t - (tM - 0.3)) / 0.3);
    if (fo > 0) { ctx.fillStyle = `rgba(6,7,16,${0.9 * fo})`; ctx.fillRect(-100, -100, 1280, 2120); }
    return;
  }
  const lt = t - tM;
  K.camera(ctx, lt, [{ t: 0, zoom: 1.05, x: 487, y: 760 }, { t: Math.max(0.5, D - tM), zoom: 1.0, x: 487, y: 740 }]);
  lab(ctx, t, E);
  // the lab's work: robot at a bench + a rack
  H.roundRect(ctx, 600, 930, 260, 24, 8); ctx.fillStyle = '#3b4260'; ctx.fill();
  ctx.fillStyle = '#2a2f45'; ctx.fillRect(615, 954, 14, 80); ctx.fillRect(831, 954, 14, 80);
  K.drawLaptop(ctx, 650, 930, 0.55, { t, screen: 'code', typing: 1 });
  K.drawRobot(ctx, 770, 930, 0.85, { t, state: 'working', seed: 9 });
  K.drawServerRack(ctx, 880, 1035, 0.75, { t, activity: 0.9 });
  // doorway on the left; two testers walk in through it
  ctx.fillStyle = '#20253f'; ctx.fillRect(60, 690, 170, 345);
  ctx.fillStyle = H.rgba(E.ACC, 0.12 + 0.08 * Math.sin(t * 2)); ctx.fillRect(72, 702, 146, 333);
  ctx.strokeStyle = '#5b6380'; ctx.lineWidth = 10; ctx.strokeRect(60, 690, 170, 345);
  const shirts = ['#4fb3a6', '#e0a84f'];
  [0, 1].forEach((i) => {
    const u = K.phase(lt, 0.1 + i * 0.35, 1.9 + i * 0.35, H.easeOutCubic);
    const x = -60 + (i ? 300 : 440) * u;
    const walking = u > 0 && u < 1;
    tester(E, ctx, x, 1035, 1.0, { t, walk: walking ? t + i * 0.2 : undefined, pose: !walking && t > tItem ? 'point' : 'stand', mood: 'happy', look: 1, shirt: shirts[i], skin: i ? 3 : 1, hair: i ? 2 : 0, hairStyle: i ? 'short' : 'bun', seed: 2 + i * 5 });
  });
  pill(E, ctx, 487, 540, K.popIn(t, tGroup, 0.4), P.group || 'Independent testers', { size: 30, solid: true });
  // the calendar card
  const ck = K.popIn(t, tCal, 0.45);
  if (ck > 0) {
    ctx.save(); ctx.translate(487, 655); const s = Math.min(1.04, 0.6 + 0.4 * ck); ctx.scale(s, s);
    H.roundRect(ctx, -330, -58, 660, 116, 22); ctx.fillStyle = 'rgba(10,12,22,0.92)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(E.ACC, 0.6); ctx.stroke();
    ctx.font = H.font('display', 30); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.weeks || '11 weeks inside', -300, -22);
    ctx.font = H.font('ui', 23); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.textAlign = 'right';
    ctx.fillText(P.dates || 'Dates', 300, -22);
    const n = Math.max(1, parseInt(P.cells || '11', 10) || 11), fill = K.phase(t, tCal + 0.3, tCal + 1.6, (u) => u);
    const cw = (600 - (n - 1) * 8) / n;
    for (let i = 0; i < n; i++) { H.roundRect(ctx, -300 + i * (cw + 8), 8, cw, 32, 6); ctx.fillStyle = fill * n > i ? E.ACC : 'rgba(255,255,255,0.15)'; ctx.fill(); }
    ctx.restore();
  }
  items.forEach((it, i) => pill(E, ctx, i ? 590 : 290, 768 + K.bob(t, 3, 0.9, i * 0.3), K.popIn(t, tItem + i * 0.25, 0.4), it, { size: 26, check: true, maxW: 300 }));
  const fin = 1 - smooth(lt / 0.35);
  if (fin > 0) { ctx.fillStyle = `rgba(6,7,16,${0.9 * fin})`; ctx.fillRect(-100, -100, 1280, 2120); }
}

// ---------------------------------------------------------------- what's driving it: AI does the research
function share(ctx, t, E) {
  const { H, K, P, D, at, ACC } = E, { clamp, smooth } = H;
  const tGuess = at(P.guessCue, D * 0.2) - 0.2;
  const tAI = at(P.aiCue, D * 0.3) - 0.2;
  const tUse = at(P.useCue, D * 0.5) - 0.2;
  const tPct = at(P.pctCue, D * 0.8) - 0.3;
  const pct = Number(P.share || 80);
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.05, x: 487, y: 745 }]);
  lab(ctx, t, E);
  K.drawDesk(ctx, 450, 1035, 1.25);
  K.drawLaptop(ctx, 420, 1035 - 110 * 1.25 + 6, 0.85, { t, screen: t > tUse ? 'chart' : 'code', typing: 1 });
  K.drawPerson(ctx, 175, 1035, 1.3, { t, pose: t > tAI ? 'point' : 'stand', mood: 'happy', look: 1, hair: 3, hairStyle: 'curly', shirt: 2, skin: 2, seed: 5 });
  const glowK = smooth((t - tAI) / 0.4);
  if (glowK > 0) K.glow(ctx, 660, 900, 170, ACC, 0.25 * glowK);
  K.drawRobot(ctx, 660, 1035, 1.0, { t, state: t > tAI ? 'working' : 'thinking', seed: 9, flip: true });
  // finished pages fly from the robot onto a growing stack
  const stackX = 800, flyStart = tUse, per = 0.45;
  const done = t > flyStart ? Math.floor((t - flyStart) / per) : 0;
  const nStack = Math.min(12, done);
  for (let i = 0; i < nStack; i++) { H.roundRect(ctx, stackX - 45 + (H.hash(i, 3) - 0.5) * 8, 1030 - i * 9, 90, 8, 2); ctx.fillStyle = i % 2 ? '#e9edf7' : '#d5dae8'; ctx.fill(); }
  if (t > flyStart && done < 12) {
    const u = ((t - flyStart) % per) / per, x = H.lerp(670, stackX, u), y = H.lerp(860, 1020 - nStack * 9, u) - Math.sin(u * Math.PI) * 90;
    ctx.save(); ctx.translate(x, y); ctx.rotate(u * 3); H.roundRect(ctx, -26, -32, 52, 64, 4); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = ACC; ctx.fillRect(-18, -22, 30, 6); ctx.fillStyle = '#c3c9da'; for (let j = 0; j < 4; j++) ctx.fillRect(-18, -8 + j * 9, 36, 4); ctx.restore();
  }
  pill(E, ctx, 660, 770, K.popIn(t, tAI, 0.4), P.aiTag || 'AI itself', { size: 26, solid: true });
  // the card
  const ck = K.popIn(t, 0.1, 0.45);
  if (ck > 0) {
    ctx.save(); ctx.translate(500, 625); const s = Math.min(1.04, 0.6 + 0.4 * ck); ctx.scale(s, s);
    H.roundRect(ctx, -350, -105, 700, 210, 24); ctx.fillStyle = 'rgba(10,12,22,0.93)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(ACC, 0.6); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let f = H.fitText(ctx, P.ask || "What's behind the speed-up?", 'display', 36, 24, 640); ctx.font = f.font; ctx.fillStyle = '#ffffff'; ctx.fillText(f.text, 0, -66);
    const gk = smooth((t - tGuess) / 0.3);
    if (gk > 0) { ctx.globalAlpha = gk; f = H.fitText(ctx, P.guess || 'Best guess', 'ui', 25, 18, 640); ctx.font = f.font; ctx.fillStyle = ACC; ctx.fillText(f.text, 0, -30); ctx.globalAlpha = 1; }
    // bar
    const bx = -310, bw = 620, by = -2, bh = 46;
    H.roundRect(ctx, bx, by, bw, bh, 14); ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fill();
    const fill = K.phase(t, tPct, tPct + 1.0, H.easeOutCubic) * pct / 100;
    if (fill > 0.005) { H.roundRect(ctx, bx, by, Math.max(28, bw * fill), bh, 14); ctx.fillStyle = ACC; ctx.fill(); }
    if (fill > 0.05) { ctx.font = H.font('display', 30); ctx.fillStyle = '#14160a'; ctx.textAlign = 'left'; ctx.fillText((P.approx || '~') + Math.round(fill * 100) + '%', bx + 18, by + bh / 2 + 2); }
    const lk = smooth((t - tPct - 0.8) / 0.3);
    if (lk > 0) {
      ctx.globalAlpha = lk; ctx.font = H.font('ui', 22); ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.fillText(P.shareLabel || 'AI helping with the work', bx, by + bh + 34);
      ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillText(P.restLabel || 'other', bx + bw, by + bh + 34);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
}

// ---------------------------------------------------------------- could it outrun the rules? / for now it assists
function outpace(ctx, t, E) {
  const { H, K, P, D, at, ACC } = E, { clamp, smooth } = H;
  const tNew = at(P.newCue, D * 0.28) - 0.3;
  const tRules = at(P.rulesCue, D * 0.43) - 0.3;
  const tNow = at(P.nowCue, D * 0.55) - 0.3;
  const tAssist = Math.min(at(P.assistCue, D * 0.74) - 0.4, tNow + 0.5);
  const tAlone = at(P.aloneCue, D * 0.92) - 0.5;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: tNow, zoom: 1.05, x: 520, y: 760 }, { t: D, zoom: 1.03, x: 500, y: 750 }]);
  lab(ctx, t, E, { lamp: false });
  // belt speed: slow, ramps up after tNew, eases back after tNow; position = integral (fixed steps, deterministic)
  const speed = (u) => 90 + 430 * K.phase(u, tNew, tRules + 0.6) * (1 - 0.75 * K.phase(u, tNow, tNow + 0.8));
  const N = 80; let pos = 0; for (let i = 0; i < N; i++) pos += speed((i + 0.5) * t / N) * t / N;
  const v = speed(t);
  // belt from the build machine (x 420) to the right edge
  const BY = 905;
  ctx.fillStyle = '#2a2f45'; for (let x = 470; x < 1100; x += 160) ctx.fillRect(x, BY + 18, 14, 1035 - BY - 18);
  H.roundRect(ctx, 400, BY - 4, 720, 26, 13); ctx.fillStyle = '#3b4260'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  for (let k = 0; k < 14; k++) { const x = 400 + ((k * 60 + pos) % 840); if (x < 1110) ctx.fillRect(x, BY + 4, 18, 6); }
  // robots on the belt
  const gap = 190;
  for (let k = -1; k < 5; k++) {
    const x = 470 + ((pos % gap) + k * gap);
    if (x < 450 || x > 1160) continue;
    K.drawRobot(ctx, x, BY - 2, 0.55, { t: t + k, state: 'happy', seed: 30 + ((Math.floor(pos / gap) - k) % 7 + 7) % 7 });
  }
  if (v > 250) { ctx.strokeStyle = H.rgba(ACC, clamp((v - 250) / 200) * 0.6); ctx.lineWidth = 5; ctx.lineCap = 'round'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(560 + k * 140, 800 + k * 18); ctx.lineTo(500 + k * 140, 800 + k * 18); ctx.stroke(); } }
  // the build machine
  H.roundRect(ctx, 330, 700, 170, 335, 20); ctx.fillStyle = '#4a5486'; ctx.fill();
  H.roundRect(ctx, 352, 730, 126, 80, 12); ctx.fillStyle = '#1b2036'; ctx.fill();
  const lamp = 0.5 + 0.5 * Math.sin(t * (4 + v / 40));
  ctx.beginPath(); ctx.arc(415, 770, 22, 0, Math.PI * 2); ctx.fillStyle = H.mixHex('#3b4260', ACC, lamp); ctx.fill();
  ctx.save(); ctx.translate(415, 900); ctx.rotate(pos / 60); ctx.fillStyle = '#c8cee0';
  for (let k = 0; k < 8; k++) { ctx.rotate(Math.PI / 4); ctx.fillRect(-8, -44, 16, 16); }
  ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fillStyle = '#4a5486'; ctx.fill(); ctx.restore();
  // the rule-writer on the left with a rulebook
  const flip = Math.floor(t * (1 + 2 * K.phase(t, tNew, tRules)));
  K.drawDesk(ctx, 275, 1035, 0.5);
  K.drawPerson(ctx, 150, 1035, 1.2, { t, pose: 'stand', mood: t > tRules && t < tNow ? 'worried' : 'neutral', look: 1, hair: 1, hairStyle: 'long', shirt: 3, skin: 4, seed: 12 });
  K.drawRulebook(ctx, 275, 985, 0.5, { open: 0.75 + 0.25 * Math.sin(flip * 1.7), title: P.book || 'RULES' });
  // the researcher steps in beside a robot helper
  const wk = K.phase(t, tNow, tNow + 1.1, H.easeInOutCubic);
  if (wk > 0) {
    K.drawRobot(ctx, 760, 1040, 0.85, { t, state: 'working', seed: 9, flip: true });
    K.drawPerson(ctx, 1150 - 530 * wk, 1040, 1.2, { t, walk: wk < 1 ? t : undefined, pose: wk >= 1 ? 'point' : 'stand', flip: true, look: -1, mood: 'happy', hair: 0, hairStyle: 'short', shirt: 0, skin: 3, seed: 4 });
  }
  // pills
  const outA = smooth((t - tRules) / 0.3), outB = smooth((t - tNow) / 0.3);
  pill(E, ctx, 600, 545, K.popIn(t, tNew, 0.4) * (1 - outA), P.faster || 'New models, faster', { size: 30 });
  pill(E, ctx, 600, 545, K.popIn(t, tRules, 0.4) * (1 - outB), P.rules || 'Could they outrun the rules?', { size: 30, solid: true });
  pill(E, ctx, 540, 545, K.popIn(t, tAssist, 0.4), P.assist || 'For now: AI mostly assists', { size: 30, solid: true });
  const ak = K.popIn(t, tAlone, 0.4);
  if (ak > 0) {
    pill(E, ctx, 540, 635, ak, P.alone || 'Running the research alone', { size: 26 });
    K.drawStamp(ctx, 800, 810, 0.55, { kind: 'cross', text: P.no || 'NOT YET', land: clamp((t - tAlone - 0.15) / 0.5) });
  }
}

// ---------------------------------------------------------------- caveats + the blacked-out report
function redact(ctx, t, E) {
  const { H, K, P, D, at, ACC } = E, { clamp, smooth } = H;
  const chips = (P.chips || ['Not confident', "Staff didn't all agree", 'May overestimate']).slice(0, 3);
  const cues = P.chipCues || [];
  const tChip = chips.map((_, i) => at(cues[i], D * (0.18 + i * 0.18)) - 0.3);
  const tRed = at(P.redactCue, D * 0.72) - 0.2;
  const tStamp = at(P.stampCue, D * 0.82) - 0.1;
  const tWhy = at(P.whyCue, D * 0.9) - 0.4;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: tRed, zoom: 1.0, x: 487, y: 735 }, { t: tRed + 1.2, zoom: 1.07, x: 560, y: 780 }, { t: D, zoom: 1.08, x: 560, y: 780 }]);
  K.world.office(ctx, { t, time: 'night' });
  // easel with the report
  const RX = 410, RY = 700, RW = 420, RH = 330;
  ctx.strokeStyle = '#764d31'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(RX + 60, RY + RH); ctx.lineTo(RX + 20, 1035); ctx.moveTo(RX + RW - 60, RY + RH); ctx.lineTo(RX + RW - 20, 1035); ctx.stroke();
  H.roundRect(ctx, RX - 10, RY - 10, RW + 20, RH + 20, 14); ctx.fillStyle = '#3b4672'; ctx.fill();
  H.roundRect(ctx, RX, RY, RW, RH, 10); ctx.fillStyle = '#f4f6fb'; ctx.fill();
  ctx.font = H.font('display', 32); ctx.fillStyle = '#3b4672'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  let f = H.fitText(ctx, P.report || 'REPORT', 'display', 32, 20, RW - 50); ctx.font = f.font; ctx.fillText(f.text, RX + 26, RY + 40);
  ctx.font = H.font('ui', 20); ctx.fillStyle = '#7a84a8'; ctx.fillText(P.reportSub || '', RX + 26, RY + 76);
  const rows = 7, hidden = P.keep || [2, 5];      // rows that stay visible
  let k = 0;
  for (let i = 0; i < rows; i++) {
    const y = RY + 110 + i * 29 - 2, w = (RW - 60) * (0.6 + 0.4 * H.hash(i, 4));
    H.roundRect(ctx, RX + 26, y, w, 10, 5); ctx.fillStyle = '#c9cfdf'; ctx.fill();
    if (hidden.includes(i)) continue;
    const u = K.phase(t, tRed + k * 0.16, tRed + k * 0.16 + 0.28, H.easeOutCubic); k++;
    if (u > 0) {
      H.roundRect(ctx, RX + 20, y - 7, (w + 12) * u, 24, 5); ctx.fillStyle = '#111320'; ctx.fill();
      if (u < 1) { // marker tip
        const mx = RX + 20 + (w + 12) * u;
        ctx.save(); ctx.translate(mx, y + 5); ctx.rotate(-0.6);
        H.roundRect(ctx, -10, -70, 20, 64, 5); ctx.fillStyle = '#2a2f45'; ctx.fill();
        ctx.fillStyle = '#111320'; ctx.beginPath(); ctx.moveTo(-10, -6); ctx.lineTo(10, -6); ctx.lineTo(0, 8); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    }
  }
  const sk = clamp((t - tStamp) / 0.5);
  if (sk > 0) K.drawStamp(ctx, RX + RW / 2 + 40, RY + RH / 2 + 95 * 0.8 + 40, 0.8, { kind: 'cross', text: P.stamp || 'REDACTED', land: sk });
  // the tester on the left
  const shrug = t > tChip[0] + 0.3 && t < tRed;
  tester(E, ctx, 200, 1035, 1.2, { t, pose: shrug ? 'shrug' : (t >= tRed ? 'point' : 'stand'), mood: t >= tRed ? 'worried' : 'neutral', look: 1, shirt: '#4fb3a6', skin: 1, hair: 0, hairStyle: 'bun', seed: 2, clipboard: !shrug });
  // caveat chips (top band), leave when the bars start
  const out = smooth((t - tRed) / 0.35);
  chips.forEach((c, i) => pill(E, ctx, 487, 525 + i * 58, K.popIn(t, tChip[i], 0.4) * (1 - out), c, { size: 24, check: false }));
  pill(E, ctx, 487, 560, K.popIn(t, tWhy, 0.4), P.why || 'Reason given: confidential', { size: 28, solid: true });
}
