// Scene "locked-model" (full frame). A company's most powerful AI model is kept locked in a glass chamber in a night
// lab: the model is the kit robot glowing inside, a name plate on top (text only, no logo). Generic cartoon people
// only; hooded figure has no face. Cue params are narration words ("word#n" = the (n+1)th time it is spoken in the
// scene); without them a mode uses fixed fractions of its duration. Every mode ends settled. A cue may also be a number of seconds.
// Fits: "too dangerous to release", "only vetted partners get access", "dual-use (cyber) model", staged rollouts.
// modes:
//   hook   (cold open, ~3 s): bars are already sliding down over the chamber at frame 0, they slam, bolts + padlock,
//          a stamp lands on lockCue; two people outside the rope react.
//          params: name, stamp ("LOCKED"), lockCue
//   who    (one beat, ~10-12 s): date pill, name plate glows (nameCue), claim pill (claimCue); a person with a phone
//          walks to the bars and gets a crossed "no access" chip (youCue); three defenders with shield badges queue
//          under a hanging sign (gateCue); key cards fly from the chamber to each of them, checks (keyCue).
//          params: name, date, claim, you, gate (sign, "\n" or auto-wrap), cues nameCue claimCue youCue gateCue keyCue
//   bugs   (one beat): the model robot sweeps a scanner beam over a big code panel; bug markers pop on lines, then
//          turn into ticks; quote pill (leapCue); counter card counts up (countCue) with a label + source line.
//          params: leap, value (number, 90), suffix ("%"), decimals (auto), label, source, cues leapCue scanCue countCue
//   dual   (one beat): a brick wall with a hole; the robot's beam finds it (holeCue); defender on the left gets a
//          "fix" pill + shield (fixCue); a hooded figure on the right reaches for it with a "break in?" pill
//          (breakCue); then the scene dims under a quote pill (rolloutCue) and a document card (docCue).
//          params: fix, breakLabel, rollout, doc, docTag, cues holeCue fixCue breakCue rolloutCue docCue
//   queue  (one beat, dusk street): a lab gate with a sign (signCue); trusted partners walk in (partnersCue); a queue
//          behind a rope gets "later" tags one by one (laterCues); quote pill (asapCue); calendar + "?" (dateCue).
//          params: sign, partners, later [3], laterTag, laterX [3] (label centres x, [235, 305, 425]), asap, date,
//          cues partnersCue signCue laterCues[3] asapCue dateCue
//   caveat (one beat): three robots on pillars almost the same height; a pill (claimsCue) and a bracket showing the
//          small gap with a label + attribution (gapCue).
//          params: name, rivals [2], claims, gap, by, cues claimsCue gapCue
export default function draw(ctx, t, info) {
  const P = info.params || {};
  const mode = P.mode || 'hook';
  const fn = { hook, who, bugs, dual, queue, caveat }[mode] || hook;
  ctx.save();
  fn(ctx, t, info, P);
  ctx.restore();
}

const DANGER = '#ff6b5e', GOOD = '#5be38a';

function cueAt(info) {
  return (w, d) => {
    if (w == null || w === '') return d;
    if (typeof w === 'number') return w;
    const [word, n] = String(w).split('#');
    const v = info.timeOf(word, n ? +n : 0);
    return v == null ? d : v;
  };
}

// ---------- shared drawing ----------
function lab(ctx, H, K, t, o = {}) {
  const fy = 1000;
  const wall = ctx.createLinearGradient(0, 0, 0, fy);
  wall.addColorStop(0, '#0d1024'); wall.addColorStop(1, '#1b2142');
  ctx.fillStyle = wall; ctx.fillRect(-200, -200, 1480, fy + 200);
  // wall panels
  ctx.strokeStyle = 'rgba(140,160,230,0.08)'; ctx.lineWidth = 3;
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-60 + i * 150, 300); ctx.lineTo(-60 + i * 150, fy); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-200, 640); ctx.lineTo(1280, 640); ctx.stroke();
  // ceiling light strips
  for (let i = 0; i < 4; i++) {
    const x = 120 + i * 280;
    H.roundRect(ctx, x - 70, 318, 140, 12, 6); ctx.fillStyle = '#e8eeff'; ctx.fill();
    K.glow(ctx, x, 330, 120, '#cfe0ff', 0.12);
  }
  // server racks at the far sides, blinking LEDs
  for (const [x, s] of [[40, 1], [1040, 1]]) {
    H.roundRect(ctx, x - 50, 560, 100, 440, 8); ctx.fillStyle = '#151a33'; ctx.fill();
    for (let r = 0; r < 14; r++) {
      H.roundRect(ctx, x - 40, 578 + r * 30, 80, 20, 4); ctx.fillStyle = '#1f2648'; ctx.fill();
      const on = H.hash(r * 7 + s, Math.floor(t * 3 + r)) > 0.45;
      ctx.beginPath(); ctx.arc(x + 26, 588 + r * 30, 4, 0, Math.PI * 2); ctx.fillStyle = on ? (r % 3 ? GOOD : '#ffcf5a') : '#2c345c'; ctx.fill();
    }
  }
  // floor
  const fl = ctx.createLinearGradient(0, fy, 0, 1920);
  fl.addColorStop(0, '#2a3158'); fl.addColorStop(0.3, '#161a33'); fl.addColorStop(1, '#0a0c18');
  ctx.fillStyle = fl; ctx.fillRect(-200, fy, 1480, 1100);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 2;
  for (let i = -8; i < 14; i++) { ctx.beginPath(); ctx.moveTo(487 + i * 50, fy); ctx.lineTo(487 + i * 190, 1920); ctx.stroke(); }
  if (o.dim) { ctx.fillStyle = `rgba(5,6,14,${o.dim})`; ctx.fillRect(-200, -200, 1480, 2320); }
  return { floorY: fy, feetY: 1030 };
}

// glass chamber with the model robot inside; bars slide down (bars 0 = up/hidden, 1 = down).
// anchor bottom-centre; ~380x470 at s = 1
function chamber(ctx, H, K, x, y, s, o) {
  const t = o.t || 0, acc = o.acc, bars = H.clamp(o.bars || 0), W = 380, Hh = 440;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.shadow(ctx, 0, 0, 460, 0.5);
  // plinth
  H.roundRect(ctx, -W / 2 - 20, -40, W + 40, 40, 10); ctx.fillStyle = '#39406a'; ctx.fill();
  H.roundRect(ctx, -W / 2 - 20, -40, W + 40, 10, 5); ctx.fillStyle = '#4b5385'; ctx.fill();
  // inside: dark glass + glow + robot
  H.roundRect(ctx, -W / 2, -40 - Hh, W, Hh, 18); ctx.fillStyle = 'rgba(16,22,48,0.96)'; ctx.fill();
  ctx.save(); H.roundRect(ctx, -W / 2, -40 - Hh, W, Hh, 18); ctx.clip();
  const pulse = 0.5 + 0.12 * Math.sin(t * 2.4);
  K.glow(ctx, 0, -230, 240, acc, pulse * (o.glow == null ? 1 : o.glow));
  // pedestal
  H.roundRect(ctx, -80, -80, 160, 40, 8); ctx.fillStyle = '#262d55'; ctx.fill();
  K.drawRobot(ctx, 0, -80, 1.45, { t, state: o.state || 'idle', seed: 11, talk: o.talk || 0 });
  // glass reflections
  ctx.strokeStyle = 'rgba(220,235,255,0.16)'; ctx.lineWidth = 14;
  ctx.beginPath(); ctx.moveTo(-W / 2 + 40, -60); ctx.lineTo(-W / 2 + 140, -40 - Hh + 20); ctx.stroke();
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-W / 2 + 90, -60); ctx.lineTo(-W / 2 + 190, -40 - Hh + 20); ctx.stroke();
  // bars slide down from the top
  if (bars > 0) {
    const bh = Hh * bars;
    for (let i = 0; i < 7; i++) {
      const bx = -W / 2 + 30 + i * ((W - 60) / 6);
      H.roundRect(ctx, bx - 9, -40 - Hh, 18, bh, 9); ctx.fillStyle = '#aab3cc'; ctx.fill();
      H.roundRect(ctx, bx - 9, -40 - Hh, 6, bh, 3); ctx.fillStyle = '#d7deef'; ctx.fill();
    }
    // bottom rail of the gate
    H.roundRect(ctx, -W / 2, -40 - Hh + bh - 22, W, 26, 8); ctx.fillStyle = '#7d87a6'; ctx.fill();
    H.roundRect(ctx, -W / 2, -40 - Hh + bh - 22, W, 8, 4); ctx.fillStyle = '#c3cbe0'; ctx.fill();
  }
  ctx.restore();
  // frame
  ctx.lineWidth = 14; ctx.strokeStyle = '#6a7398'; H.roundRect(ctx, -W / 2, -40 - Hh, W, Hh, 18); ctx.stroke();
  ctx.lineWidth = 4; ctx.strokeStyle = H.rgba(acc, 0.55); H.roundRect(ctx, -W / 2 + 10, -30 - Hh, W - 20, Hh - 20, 12); ctx.stroke();
  // name plate on top
  if (o.name) {
    const glowName = o.nameGlow || 0;
    ctx.font = H.font('display', 30); const tw = Math.min(W + 40, ctx.measureText(o.name).width + 56);
    if (glowName > 0) K.glow(ctx, 0, -40 - Hh - 32, 200, acc, 0.35 * glowName);
    H.roundRect(ctx, -tw / 2, -40 - Hh - 62, tw, 56, 14); ctx.fillStyle = '#0b0d1a'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = H.mixHex('#5a6390', acc, glowName); ctx.stroke();
    const ft = H.fitText(ctx, o.name.toUpperCase(), 'display', 30, 18, tw - 36);
    ctx.fillStyle = H.mixHex('#ffffff', acc, glowName); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(o.name.toUpperCase(), 0, -40 - Hh - 33);
  }
  ctx.restore();
}

function rope(ctx, H, x0, x1, y) {
  for (const px of [x0, x1]) {
    H.roundRect(ctx, px - 8, y - 110, 16, 110, 6); ctx.fillStyle = '#c9a451'; ctx.fill();
    ctx.beginPath(); ctx.arc(px, y - 112, 13, 0, Math.PI * 2); ctx.fillStyle = '#e8c86d'; ctx.fill();
    H.roundRect(ctx, px - 26, y - 8, 52, 10, 5); ctx.fillStyle = '#8d7232'; ctx.fill();
  }
  ctx.strokeStyle = '#b0303f'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x0, y - 100); ctx.quadraticCurveTo((x0 + x1) / 2, y - 60, x1, y - 100); ctx.stroke();
}

function crossChip(ctx, H, x, y, text, k, col = DANGER, tick = false) {
  if (k <= 0) return;
  const s = Math.min(1.05, k);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = H.font('bold', 28); const w = ctx.measureText(text).width + 88;
  H.roundRect(ctx, -w / 2, -30, w, 60, 30); ctx.fillStyle = 'rgba(10,12,22,0.92)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(col, 0.85); ctx.stroke();
  ctx.beginPath(); ctx.arc(-w / 2 + 32, 0, 17, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
  ctx.strokeStyle = '#141829'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  if (tick) { ctx.moveTo(-w / 2 + 24, 0); ctx.lineTo(-w / 2 + 30, 7); ctx.lineTo(-w / 2 + 41, -7); }
  else { ctx.moveTo(-w / 2 + 25, -7); ctx.lineTo(-w / 2 + 39, 7); ctx.moveTo(-w / 2 + 39, -7); ctx.lineTo(-w / 2 + 25, 7); }
  ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, -w / 2 + 60, 2);
  ctx.restore();
}

// key card, centre anchored, ~96x62 at s = 1
function keyCard(ctx, H, K, x, y, s, acc, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  K.glow(ctx, 0, 0, 70, acc, 0.35);
  H.roundRect(ctx, -48, -31, 96, 62, 10); ctx.fillStyle = acc; ctx.fill();
  H.roundRect(ctx, -48, -31, 96, 16, 8); ctx.fillStyle = H.mixHex(acc, '#000000', 0.25); ctx.fill();
  H.roundRect(ctx, -36, -2, 26, 20, 4); ctx.fillStyle = '#e9d27a'; ctx.fill();
  ctx.fillStyle = H.mixHex(acc, '#000000', 0.55);
  H.roundRect(ctx, 0, 0, 36, 6, 3); ctx.fill(); H.roundRect(ctx, 0, 12, 24, 6, 3); ctx.fill();
  ctx.restore();
}

// defender: kit person + a small shield badge on the chest
function defender(ctx, H, K, x, y, s, o) {
  K.drawPerson(ctx, x, y, s, o);
  const dir = o.flip ? -1 : 1;
  K.drawShield(ctx, x + dir * 10 * s, y - 150 * s, 0.28 * s, { check: o.check == null ? 1 : o.check, shadow: false });
}

// shadowy hooded figure (generic; no face, two glowing eyes), bottom-centre, ~120x260 at s = 1
function hooded(ctx, H, K, x, y, s, o = {}) {
  const t = o.t || 0, walk = !!o.walk;
  const ph = t * 1.8 * Math.PI * 2, bob = walk ? -Math.abs(Math.sin(ph)) * 5 : Math.sin(t * 1.5) * 1.5;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  K.shadow(ctx, 0, 0, 110);
  const cloak = '#343a5a', cloakS = '#252a44';
  for (const side of [-1, 1]) {
    const a = walk ? Math.sin(ph + (side > 0 ? Math.PI : 0)) * 0.35 : 0;
    ctx.save(); ctx.translate(side * 14, -70 + bob); ctx.rotate(a);
    H.roundRect(ctx, -9, 0, 18, 66, 8); ctx.fillStyle = '#14162a'; ctx.fill();
    H.roundRect(ctx, -12, 58, 30, 14, 7); ctx.fillStyle = '#0c0d18'; ctx.fill();
    ctx.restore();
  }
  ctx.translate(0, bob);
  ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -62); ctx.lineTo(54, -62); ctx.quadraticCurveTo(58, -110, 34, -178); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = cloakS; ctx.fillRect(18, -190, 60, 140); ctx.restore();
  // reaching arm (reach 0..1)
  const r = o.reach || 0;
  ctx.strokeStyle = cloak; ctx.lineWidth = 17; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(26, -160); ctx.lineTo(48 + 30 * r, -122 - 20 * r); ctx.lineTo(62 + 50 * r, -132 - 30 * r); ctx.stroke();
  ctx.save(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -62); ctx.stroke(); ctx.restore();
  ctx.beginPath(); ctx.moveTo(0, -262); ctx.quadraticCurveTo(46, -250, 44, -200); ctx.quadraticCurveTo(42, -170, 0, -168); ctx.quadraticCurveTo(-42, -170, -44, -200); ctx.quadraticCurveTo(-46, -244, 0, -262); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(4, -204, 26, 25, 0, 0, Math.PI * 2); ctx.fillStyle = '#07080f'; ctx.fill();
  const blink = ((t + 0.7) % 3.1) < 0.12;
  for (const ex of [-6, 14]) { ctx.beginPath(); ctx.ellipse(ex, -206, 5, blink ? 1 : 4, 0, 0, Math.PI * 2); ctx.fillStyle = '#ff8a7a'; ctx.fill(); }
  ctx.restore();
}

function quotePill(ctx, H, K, x, y, k, text, accent = true) {
  if (k <= 0) return;
  K.drawLabel(ctx, x, y, Math.min(1.05, k), { text, size: 32, accent });
}

// calendar page with "?" (centre anchored, ~130x140)
function calendar(ctx, H, x, y, s, k, acc) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * Math.min(1.05, k), s * Math.min(1.05, k)); ctx.rotate(Math.sin(k * 6) * 0.04);
  H.roundRect(ctx, -65, -70, 130, 140, 14); ctx.fillStyle = '#f4f6fb'; ctx.fill();
  H.roundRect(ctx, -65, -70, 130, 38, 14); ctx.fillStyle = DANGER; ctx.fill();
  ctx.fillStyle = DANGER; ctx.fillRect(-65, -48, 130, 16);
  for (const rx of [-32, 32]) { H.roundRect(ctx, rx - 5, -84, 10, 28, 5); ctx.fillStyle = '#3b4260'; ctx.fill(); }
  ctx.font = H.font('display', 78); ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 22);
  ctx.restore();
}

// ---------- modes ----------
function hook(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent, at = cueAt(info);
  const { clamp, smooth, lerp } = H;
  const tSlam = 0.85;                                   // bars hit the floor
  const tLock = Math.max(tSlam + 0.35, at(P.lockCue, D * 0.6) - 0.15);
  // camera: starts close on the chamber, small kick on the slam
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 487, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 735 }]);
  K.cameraShake(ctx, t, tSlam, 0.35, 9);
  lab(ctx, H, K, t);
  // bars: already a third of the way down at frame 0, accelerate, slam, tiny bounce
  const u = clamp(t / tSlam);
  let bars = lerp(0.38, 1, u * u);
  if (t > tSlam) bars = 1 - 0.035 * Math.exp(-(t - tSlam) * 9) * Math.abs(Math.sin((t - tSlam) * 22));
  chamber(ctx, H, K, 487, 1010, 1.0, { t, acc: ACC, bars, name: P.name || 'Frontier Model', nameGlow: 1, state: t > tSlam ? 'thinking' : 'idle' });
  // dust puff on the slam
  const dp = (t - tSlam) / 0.6;
  if (dp > 0 && dp < 1) for (let i = 0; i < 8; i++) {
    const a = Math.PI + (i / 7) * Math.PI, r = 40 + 120 * dp;
    ctx.beginPath(); ctx.arc(487 + Math.cos(a) * r * 1.8, 975 + Math.sin(a) * r * 0.3, 14 * (1 - dp) + 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,210,235,${0.35 * (1 - dp)})`; ctx.fill();
  }
  // padlock drops onto the gate rail
  const lk = K.popIn(t, tSlam + 0.15, 0.4);
  if (lk > 0) K.drawLock(ctx, 487, 1000 - 40 - 10 + lerp(-60, 0, smooth(clamp((t - tSlam - 0.15) / 0.3))), 0.8 * Math.min(1.05, lk), { open: 0 });
  // people outside the rope react
  rope(ctx, H, 92, 238, 1035); rope(ctx, H, 736, 882, 1035);
  const react = t > tSlam;
  K.drawPerson(ctx, 165, 1040, 1.15, { t, pose: react ? 'shrug' : 'point', mood: react ? 'shocked' : 'neutral', skin: 3, hair: 1, shirt: 2, hairStyle: 'curly', seed: 4, look: 0.7 });
  K.drawPerson(ctx, 810, 1040, 1.15, { t, pose: react ? 'phone' : 'stand', mood: react ? 'worried' : 'happy', skin: 0, hair: 2, shirt: 3, hairStyle: 'long', seed: 8, flip: true, look: -0.7 });
  // stamp
  const land = (t - tLock) / 0.5;
  if (land > 0) K.drawStamp(ctx, 700, 760, 0.95, { kind: 'cross', text: P.stamp || 'LOCKED', land });
}

function who(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent, at = cueAt(info);
  const { clamp, smooth, lerp, easeOutCubic } = H;
  const tName = at(P.nameCue, D * 0.2) - 0.2, tClaim = at(P.claimCue, D * 0.4) - 0.2;
  const tYou = at(P.youCue, D * 0.55) - 0.5, tGate = at(P.gateCue, D * 0.72) - 0.4, tKey = at(P.keyCue, D * 0.85) - 0.3;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 745 }]);
  lab(ctx, H, K, t);
  const cx = 470;
  const ng = smooth(clamp((t - tName) / 0.5));
  chamber(ctx, H, K, cx, 1010, 0.8, { t, acc: ACC, bars: 1, name: P.name || 'Frontier Model', nameGlow: ng, state: t > tKey ? 'happy' : 'idle' });
  K.drawLock(ctx, cx, 1010 - 32 - 8, 0.62, { open: 0 });
  // date pill
  const dk = K.popIn(t, 0.2, 0.4);
  if (dk > 0 && P.date) K.drawLabel(ctx, 487, 470, Math.min(1.05, dk), { text: P.date, size: 28, dot: true });
  // claim pill
  quotePill(ctx, H, K, 487, 540, K.popIn(t, tClaim, 0.45), P.claim || '"Our strongest model"');
  // you: person with phone walks to the rope, gets crossed chip
  const yIn = smooth(clamp((t - tYou + 1.0) / 1.0));
  const yx = lerp(-80, 150, yIn);
  const turned = t > tYou + 0.3;
  rope(ctx, H, 236, 300, 1035);
  K.drawPerson(ctx, yx, 1040, 1.12, { t, walk: yIn > 0 && yIn < 1 ? t : null, pose: turned ? 'shrug' : 'phone', mood: turned ? 'worried' : 'happy', skin: 2, hair: 0, shirt: 4, hairStyle: 'short', seed: 2, look: 0.6 });
  crossChip(ctx, H, 245, 700, P.you || 'You: no access', K.popIn(t, tYou + 0.4, 0.4));
  // defenders queue on the right under a sign
  const gs = K.popIn(t, tGate - 0.2, 0.45);
  if (gs > 0) {
    const sw = Math.sin((t - tGate) * 3) * 0.05 * Math.exp(-Math.max(0, t - tGate) * 1.2);
    ctx.save(); ctx.translate(790, 600); ctx.rotate(sw); ctx.scale(Math.min(1.05, gs), Math.min(1.05, gs));
    ctx.strokeStyle = '#8a93b5'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-70, -60); ctx.lineTo(-70, -20); ctx.moveTo(70, -60); ctx.lineTo(70, -20); ctx.stroke();
    const words = String(P.gate || 'DEFENDERS ONLY').split(/\s+/);
    const mid = Math.ceil(words.length / 2);
    const lines = P.gate && P.gate.includes('\n') ? P.gate.split('\n') : [words.slice(0, mid).join(' '), words.slice(mid).join(' ')].filter(Boolean);
    H.roundRect(ctx, -125, -20, 250, 30 + lines.length * 36, 12); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach((ln, i) => { const ft = H.fitText(ctx, ln, 'display', 30, 16, 220); ctx.fillText(ln, 0, 15 + 18 + i * 36 - 18 + 2); });
    ctx.restore();
  }
  const dxs = [720, 800, 875];
  dxs.forEach((x, i) => {
    const din = smooth(clamp((t - tGate + 0.9 - i * 0.25) / 1.0));
    if (din <= 0) return;
    const xx = lerp(1180, x, easeOutCubic(din));
    const got = t > tKey + 0.6 + i * 0.2;
    defender(ctx, H, K, xx, 1040, 0.98, { t, walk: din < 1 ? t + i : null, pose: got ? 'cheer' : 'stand', mood: 'happy', skin: (i + 1) % 5, hair: (i + 3) % 5, shirt: 1, hairStyle: ['bun', 'short', 'curly'][i], seed: 20 + i, flip: true, look: -0.6, check: 1 });
  });
  // key cards fly from the chamber to each defender
  dxs.forEach((x, i) => {
    const k0 = tKey + i * 0.2; if (t < k0) return;
    const u = clamp((t - k0) / 0.7), e = easeOutCubic(u);
    const kx = lerp(cx + 120, x - 10, e), ky = lerp(800, 850, e) - Math.sin(u * Math.PI) * 70;
    keyCard(ctx, H, K, kx, ky + (u >= 1 ? K.bob(t, 4, 1, i) : 0), 0.62, ACC, (1 - e) * 2.5);
  });
}

function bugs(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent, at = cueAt(info);
  const { clamp, smooth, lerp } = H;
  const tLeap = at(P.leapCue, D * 0.18) - 0.3, tScan = at(P.scanCue, D * 0.45) - 0.4, tCount = at(P.countCue, D * 0.75) - 0.2;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 520, y: 730 }]);
  lab(ctx, H, K, t);
  // code panel
  const X0 = 420, X1 = 905, Y0 = 560, Y1 = 860;
  H.roundRect(ctx, X0, Y0, X1 - X0, Y1 - Y0, 20); ctx.fillStyle = '#0b0e1d'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(160,180,255,0.25)'; ctx.stroke();
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(X0 + 28 + i * 24, Y0 + 24, 7, 0, Math.PI * 2); ctx.fillStyle = ['#ff6b5e', '#ffcf5a', '#5be38a'][i]; ctx.fill(); }
  const rows = 8, rowH = 30;
  const bugRows = [1, 4, 6];
  const sweepDur = Math.max(1.5, (tCount - tScan) * 0.8);
  const sweep = clamp((t - tScan) / sweepDur); // 0..1 down the panel
  for (let r = 0; r < rows; r++) {
    const y = Y0 + 56 + r * rowH, ind = (r % 3) * 26;
    const w1 = 80 + 160 * H.hash(r, 3), w2 = 60 + 120 * H.hash(r, 5);
    H.roundRect(ctx, X0 + 30 + ind, y, w1, 12, 6); ctx.fillStyle = r % 2 ? '#5b8cff' : '#9aa6d6'; ctx.fill();
    H.roundRect(ctx, X0 + 44 + ind + w1, y, w2, 12, 6); ctx.fillStyle = '#c47bff'; ctx.globalAlpha = 0.75; ctx.fill(); ctx.globalAlpha = 1;
    const bi = bugRows.indexOf(r);
    if (bi >= 0) {
      const found = sweep > (r + 0.5) / rows;
      const tFound = tScan + (r + 0.5) / rows * sweepDur;
      const fixed = t > tCount - 0.2 + bi * 0.25;
      if (found) {
        const k = K.popIn(t, tFound, 0.3);
        const bx = X1 - 60, by = y + 6;
        if (!fixed) {
          ctx.save(); ctx.translate(bx, by); ctx.scale(Math.min(1.05, k || 1), Math.min(1.05, k || 1));
          H.roundRect(ctx, -(X1 - X0) + 80, -16, (X1 - X0) - 100, 32, 8); ctx.fillStyle = H.rgba(DANGER, 0.18); ctx.fill();
          bugIcon(ctx, H, 0, 0, 1, t + r);
          ctx.restore();
        } else {
          const fk = K.popIn(t, tCount - 0.2 + bi * 0.25, 0.35);
          ctx.save(); ctx.translate(bx, by); ctx.scale(Math.min(1.05, fk), Math.min(1.05, fk));
          ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.fillStyle = GOOD; ctx.fill();
          ctx.strokeStyle = '#0d2a18'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-2, 7); ctx.lineTo(9, -7); ctx.stroke();
          ctx.restore();
        }
      }
    }
  }
  // robot + scanner beam
  const rx = 255, ry = 1035;
  const scanning = t > tScan && t < tScan + sweepDur + 0.3;
  K.drawRobot(ctx, rx, ry, 1.4, { t, state: scanning ? 'working' : t > tCount ? 'happy' : 'thinking', seed: 11, talk: 0 });
  K.glow(ctx, rx, ry - 160, 170, ACC, 0.22);
  if (scanning) {
    const by = Y0 + 50 + sweep * (rows * rowH);
    ctx.save(); ctx.globalAlpha = 0.28;
    ctx.beginPath(); ctx.moveTo(rx + 40, ry - 255); ctx.lineTo(X0 + 4, by - 26); ctx.lineTo(X0 + 4, by + 26); ctx.closePath();
    ctx.fillStyle = ACC; ctx.fill(); ctx.restore();
    ctx.fillStyle = H.rgba(ACC, 0.55); ctx.fillRect(X0 + 6, by - 2, X1 - X0 - 12, 4);
  }
  // quote pill
  quotePill(ctx, H, K, 520, 520, K.popIn(t, tLeap, 0.45), P.leap || '"Significant leap"');
  // counter card under the panel
  const ck = K.popIn(t, tCount, 0.45);
  if (ck > 0) {
    const s = Math.min(1.04, ck);
    ctx.save(); ctx.translate(660, 960); ctx.scale(s, s);
    H.roundRect(ctx, -245, -80, 490, 160, 26); ctx.fillStyle = 'rgba(10,12,22,0.94)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(ACC, 0.7); ctx.stroke();
    const val = Number(P.value == null ? 90 : P.value);
    const dec = P.decimals != null ? P.decimals : (String(P.value).split('.')[1] || '').length;
    const shown = Math.max(0, K.countUp(val, t, tCount + 0.1, 1.0, dec));
    const txt = (typeof shown === 'number' ? shown.toFixed(dec) : shown) + (P.suffix == null ? '%' : P.suffix);
    ctx.font = H.font('display', 84); ctx.fillStyle = ACC; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(txt, -220, 16);
    const lab1 = String(P.label || 'of bugs found');
    const ft = H.fitText(ctx, lab1, 'bold', 30, 22, 300); ctx.fillStyle = '#ffffff';
    const lines = H.wrap(ctx, lab1, 'bold', 30, 170); ctx.font = H.font('bold', 30);
    lines.slice(0, 2).forEach((ln, i) => ctx.fillText(ln, 52, -14 + i * 34));
    ctx.font = H.font('ui', 22); ctx.fillStyle = 'rgba(255,255,255,0.62)';
    ctx.fillText(String(P.source || ''), -220, 58);
    ctx.restore();
  }
}

function bugIcon(ctx, H, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 6) * 0.12);
  ctx.strokeStyle = DANGER; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (const sy of [-6, 2, 10]) { ctx.beginPath(); ctx.moveTo(-10, sy); ctx.lineTo(-20, sy - 4); ctx.moveTo(10, sy); ctx.lineTo(20, sy - 4); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, 3, 11, 14, 0, 0, Math.PI * 2); ctx.fillStyle = DANGER; ctx.fill();
  ctx.beginPath(); ctx.arc(0, -13, 7, 0, Math.PI * 2); ctx.fillStyle = '#c94a40'; ctx.fill();
  ctx.restore();
}

function dual(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent, at = cueAt(info);
  const { clamp, smooth, lerp } = H;
  const tHole = at(P.holeCue, D * 0.15) - 0.2, tFix = at(P.fixCue, D * 0.3) - 0.2, tBreak = at(P.breakCue, D * 0.45) - 0.3;
  const tRoll = at(P.rolloutCue, D * 0.65) - 0.3, tDoc = at(P.docCue, D * 0.8) - 0.3;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tRoll, zoom: 1.03, x: 487, y: 740 }, { t: D, zoom: 1.05, x: 487, y: 730 }]);
  lab(ctx, H, K, t);
  // robot behind the wall
  const beamOn = t > tHole && t < tRoll + 0.3;
  K.drawRobot(ctx, 487, 930, 1.25, { t, state: beamOn ? 'working' : 'thinking', seed: 11 });
  K.glow(ctx, 487, 720, 150, ACC, 0.2);
  // wall
  const WX0 = 300, WX1 = 675, WY0 = 810, WY1 = 1040;
  for (let r = 0; r < 8; r++) for (let c = -1; c < 8; c++) {
    const bw = 60, bh = 30, x = WX0 + c * bw + (r % 2) * 30, y = WY0 + r * bh;
    const x0 = Math.max(WX0, x), x1 = Math.min(WX1, x + bw - 4);
    if (x1 <= x0) continue;
    H.roundRect(ctx, x0, y, x1 - x0, bh - 4, 4); ctx.fillStyle = H.hash(r, c + 9) > 0.5 ? '#8a4d42' : '#7a4239'; ctx.fill();
  }
  ctx.fillStyle = '#5f342d'; ctx.fillRect(WX0, WY0 - 12, WX1 - WX0, 14);
  // the hole
  const hx = 487, hy = 935;
  ctx.beginPath(); ctx.ellipse(hx, hy, 48, 38, 0.1, 0, Math.PI * 2); ctx.fillStyle = '#05060c'; ctx.fill();
  if (t > tHole) {
    const hk = K.popIn(t, tHole, 0.4);
    K.glow(ctx, hx, hy, 110, ACC, 0.45 * Math.min(1, hk));
    ctx.lineWidth = 6; ctx.strokeStyle = H.rgba(ACC, 0.9 * Math.min(1, hk)); ctx.beginPath(); ctx.ellipse(hx, hy, 58 + 6 * Math.sin(t * 4), 48 + 5 * Math.sin(t * 4), 0.1, 0, Math.PI * 2); ctx.stroke();
  }
  if (beamOn) {
    ctx.save(); ctx.globalAlpha = 0.25; ctx.beginPath(); ctx.moveTo(487 + 30, 770); ctx.lineTo(hx - 40, hy - 10); ctx.lineTo(hx + 40, hy + 10); ctx.closePath(); ctx.fillStyle = ACC; ctx.fill(); ctx.restore();
  }
  // defender left with a patch
  const fixed = t > tFix + 0.3;
  defender(ctx, H, K, 170, 1040, 1.15, { t, pose: fixed ? 'point' : 'stand', mood: 'happy', skin: 1, hair: 4, shirt: 1, hairStyle: 'bun', seed: 3, look: 0.6, check: 1 });
  if (fixed) K.drawShield(ctx, 270, 860, 0.6 * K.popIn(t, tFix + 0.3, 0.4), { check: K.phase(t, tFix + 0.6, tFix + 1.0), shadow: false });
  crossChip(ctx, H, 220, 690, P.fix || 'Fix it', K.popIn(t, tFix, 0.4), GOOD, true);
  // hooded figure right, walks in and reaches
  const hIn = smooth(clamp((t - tBreak + 1.0) / 1.0));
  if (hIn > 0) {
    const reach = smooth(clamp((t - tBreak) / 0.6));
    hooded(ctx, H, K, lerp(1180, 800, hIn), 1040, 1.15, { t, walk: hIn < 1, flip: true, reach });
  }
  crossChip(ctx, H, 760, 690, P.breakLabel || 'Break in?', K.popIn(t, tBreak + 0.2, 0.4), DANGER, false);
  // rollout: dim + quote + document card
  const dm = smooth(clamp((t - tRoll) / 0.5));
  if (dm > 0) { ctx.fillStyle = `rgba(5,6,14,${0.55 * dm})`; ctx.fillRect(-200, -200, 1480, 2320); }
  quotePill(ctx, H, K, 487, 520, K.popIn(t, tRoll, 0.45), P.rollout || '"Deliberate approach"');
  const dk = K.popIn(t, tDoc, 0.45);
  if (dk > 0) {
    const s = Math.min(1.04, dk);
    ctx.save(); ctx.translate(487, 760); ctx.scale(s, s);
    H.roundRect(ctx, -300, -150, 600, 270, 26); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    K.drawDocument(ctx, -200, 100, 1.1, { lines: 6, shadow: false, seal: true });
    const doc = String(P.doc || 'Pre-release testing');
    const lines = H.wrap(ctx, doc, 'display', 38, 330);
    ctx.font = H.font('display', 38); ctx.fillStyle = '#141829'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    lines.slice(0, 3).forEach((ln, i) => ctx.fillText(ln, -100, -70 + i * 46));
    ctx.restore();
    if (P.docTag !== '') K.drawLabel(ctx, 487 + 100 + 80, 760 + 100, Math.min(1.05, K.popIn(t, tDoc + 0.35, 0.4)), { text: P.docTag || 'Voluntary', size: 28, accent: true });
  }
}

function queue(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent, at = cueAt(info);
  const { clamp, smooth, lerp } = H;
  const tPart = at(P.partnersCue, D * 0.12) - 0.4, tSign = at(P.signCue, D * 0.3) - 0.3;
  const lc = P.laterCues || [];
  const tLater = [0, 1, 2].map((i) => at(lc[i], D * (0.45 + i * 0.07)) - 0.2);
  const tAsap = at(P.asapCue, D * 0.75) - 0.3, tDate = at(P.dateCue, D * 0.9) - 0.3;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 500, y: 745 }]);
  const city = K.world.city(ctx, { t, time: 'dusk', groundY: 990 });
  // lab building with a gate on the right
  const bx0 = 600, bx1 = 960, top = 600;
  H.roundRect(ctx, bx0, top, bx1 - bx0, 1000 - top, 14); ctx.fillStyle = '#2b3360'; ctx.fill();
  ctx.fillStyle = '#232a50'; ctx.fillRect(bx1 - 90, top + 10, 90, 990 - top);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    if (r === 2 && (c === 1 || c === 2)) continue;
    H.roundRect(ctx, bx0 + 28 + c * 82, top + 120 + r * 80, 56, 50, 6);
    ctx.fillStyle = H.hash(r, c) > 0.4 ? 'rgba(255,217,138,0.55)' : 'rgba(120,140,200,0.25)'; ctx.fill();
  }
  // door (glowing for partners)
  const doorX = 740, doorW = 140, doorTop = 830;
  H.roundRect(ctx, doorX - doorW / 2, doorTop, doorW, 1000 - doorTop, 10); ctx.fillStyle = '#0c0f22'; ctx.fill();
  const open = smooth(clamp((t - tPart) / 0.6)) * (1 - smooth(clamp((t - tPart - 3.2) / 0.6)));
  if (open > 0) { K.glow(ctx, doorX, 920, 120, ACC, 0.5 * open); H.roundRect(ctx, doorX - doorW / 2 + 8, doorTop + 8, (doorW - 16) * open, 1000 - doorTop - 8, 6); ctx.fillStyle = H.rgba(ACC, 0.35 * open); ctx.fill(); }
  // sign on the facade
  const sk = smooth(clamp((t - tSign) / 0.4));
  ctx.save();
  H.roundRect(ctx, bx0 + 20, top + 24, 320, 72, 14); ctx.fillStyle = H.mixHex('#151a36', ACC, 0.9 * sk); ctx.fill();
  if (sk > 0) K.glow(ctx, bx0 + 180, top + 60, 190, ACC, 0.3 * sk);
  const sft = H.fitText(ctx, String(P.sign || 'PARTNER PROGRAM'), 'display', 32, 16, 290); 
  ctx.fillStyle = sk > 0.5 ? '#141829' : 'rgba(255,255,255,0.35)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(P.sign || 'PARTNER PROGRAM'), bx0 + 180, top + 61);
  ctx.restore();
  // partners walk in and vanish into the door
  for (let i = 0; i < 2; i++) {
    const u = clamp((t - tPart - i * 0.5) / 2.2);
    if (u <= 0 || u >= 1) continue;
    const x = lerp(590, doorX, smooth(u));
    ctx.save(); ctx.globalAlpha = 1 - smooth(clamp((u - 0.8) / 0.2));
    defender(ctx, H, K, x, 1035, 0.95, { t, walk: t + i, pose: 'stand', mood: 'happy', skin: i + 2, hair: i + 1, shirt: 1, hairStyle: i ? 'short' : 'long', seed: 40 + i, check: 1 });
    ctx.restore();
  }
  const pk = K.popIn(t, tPart, 0.4);
  if (pk > 0) K.drawLabel(ctx, 770, 585, Math.min(1.05, pk), { text: P.partners || 'Trusted partners', size: 28, dot: true });
  // rope + queue on the left
  rope(ctx, H, 505, 565, 1035);
  const later = P.later || ['Developers', 'Businesses', 'You'];
  const qx = [185, 305, 425];
  const lx = Array.isArray(P.laterX) && P.laterX.length >= 3 ? P.laterX : [235, 305, 425];
  later.slice(0, 3).forEach((lab1, i) => {
    const k = K.popIn(t, tLater[i], 0.4);
    const tagged = k > 0;
    const o = { t, pose: i === 2 ? (tagged ? 'shrug' : 'phone') : 'stand', mood: tagged ? 'neutral' : 'happy', skin: (i * 2) % 5, hair: (i + 2) % 5, shirt: (i + 2) % 5, hairStyle: ['short', 'long', 'curly'][i], seed: 50 + i, look: 0.6 };
    K.drawPerson(ctx, qx[i], 1040, 0.95, o);
    if (i === 0) K.drawLaptop(ctx, qx[i] + 4, 1040 - 90, 0.3, { t, screen: 'code' });
    if (i === 1) K.drawBriefcase(ctx, qx[i] + 50, 1040, 0.4);
    if (k > 0) {
      K.drawLabel(ctx, lx[i], [690, 772, 690][i], Math.min(1.05, k), { text: lab1, size: 24 });
      // "Later" tag swings under the label
      const sw = Math.sin((t - tLater[i]) * 5) * 0.25 * Math.exp(-(t - tLater[i]) * 1.5);
      ctx.save(); ctx.translate(lx[i], [690, 772, 690][i] + 4); ctx.rotate(sw);
      const lt = String(P.laterTag || 'Later'); ctx.font = H.font('bold', 24); const w = ctx.measureText(lt).width + 30;
      H.roundRect(ctx, -w / 2, 0, w, 36, 8); ctx.fillStyle = DANGER; ctx.globalAlpha = clamp(k); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lt, 0, 19);
      ctx.restore();
    }
  });
  // quote + calendar
  quotePill(ctx, H, K, 487, 480, K.popIn(t, tAsap, 0.45), P.asap || '"As soon as possible"');
  const ck = K.popIn(t, tDate, 0.45);
  calendar(ctx, H, 300, 565, 0.72, ck, ACC);
  if (ck > 0 && P.date !== '') K.drawLabel(ctx, 450, 600, Math.min(1.05, ck), { text: P.date || 'Date: ?', size: 28, accent: true });
}

function caveat(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent, at = cueAt(info);
  const { clamp, smooth, lerp } = H;
  const tClaims = at(P.claimsCue, D * 0.3) - 0.3, tGap = at(P.gapCue, D * 0.7) - 0.3;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 745 }]);
  lab(ctx, H, K, t);
  const rivals = P.rivals || ['Rival A', 'Rival B'];
  const cols = [
    { x: 487, h: 178, name: P.name || 'Ours', acc: true },
    { x: 240, h: 160, name: rivals[0] },
    { x: 734, h: 155, name: rivals[1] },
  ];
  const grow = smooth(clamp(t / 1.2));
  cols.forEach((c, i) => {
    const h = c.h * grow, top = 1030 - h;
    H.roundRect(ctx, c.x - 100, top, 200, h, 14); ctx.fillStyle = c.acc ? H.mixHex('#2b3360', ACC, 0.35) : '#2b3360'; ctx.fill();
    H.roundRect(ctx, c.x - 100, top, 200, 14, 7); ctx.fillStyle = c.acc ? ACC : '#4b5385'; ctx.fill();
    const ft = H.fitText(ctx, c.name, 'bold', 28, 18, 180); 
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (h > 80) ctx.fillText(c.name, c.x, top + 60);
    K.drawRobot(ctx, c.x, top, 0.9, { t: t + i * 0.7, state: c.acc ? 'happy' : 'idle', seed: 11 + i * 5 });
  });
  // claims pill
  quotePill(ctx, H, K, 487, 485, K.popIn(t, tClaims, 0.45), P.claims || "Company's own numbers", false);
  // gap bracket between the top of ours and the top of rival 1
  const gk = smooth(clamp((t - tGap) / 0.5));
  if (gk > 0) {
    const yA = 1030 - cols[0].h, yB = 1030 - cols[1].h;
    const bx = 345;
    ctx.save(); ctx.globalAlpha = gk;
    ctx.fillStyle = H.rgba(ACC, 0.22); ctx.fillRect(cols[1].x - 100, yA, cols[2].x + 100 - (cols[1].x - 100), yB - yA);
    ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cols[1].x - 100, yB); ctx.lineTo(cols[2].x + 100, yB); ctx.stroke();
    ctx.setLineDash([12, 10]); ctx.beginPath(); ctx.moveTo(cols[1].x - 100, yA); ctx.lineTo(cols[2].x + 100, yA); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(bx, yA); ctx.lineTo(bx, yB); ctx.stroke();
    ctx.restore();
    // magnifier-style callout
    const k = K.popIn(t, tGap, 0.45);
    K.drawLabel(ctx, 487, 565, Math.min(1.05, k), { text: P.gap || 'Gap: a few points', size: 34, accent: true });
    if (P.by) K.drawLabel(ctx, 487, 618, Math.min(1.05, K.popIn(t, tGap + 0.3, 0.4)), { text: P.by, size: 24 });
  }
}
