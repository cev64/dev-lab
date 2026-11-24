// Scene "blur-machine" (full frame, 1 beat per mode; added to the library 2026-11-24, from state lawsuits over an AI
// image tool's deepfakes). An abstract "image machine" (a boxy console with a text pill, no logo) spits out picture
// cards that are only grey mosaic blocks under a black "BLURRED" bar (never any imagery).
// modes:
//   "hook"  cold open, courtroom: at frame 0 the machine is already spraying cards and two cartoon lawyers are
//           striding in; each slams a case folder (`left` / `right`, sub-line `vs`) onto the bench, the gavel strikes
//           and a `stamp` lands on the machine, which stops (red lights). Peak inside ~2.2 s, then settles.
//   "count" night room: the machine floods cards onto a pile, a `source` pill, a panel ("`before`" + "Day n of N"
//           while counting the `days`, then "In `days`, about") counts up to `value` with a `label`, then a red pill
//           (`kids`) lands; a cartoon researcher with a clipboard reacts.
// Fits: lawsuits / probes over an AI image tool's harmful output (deepfakes) told without showing any images.
// params (generic placeholder defaults; pass the story's names and published figures): mode, machine ("Image tool"),
//   left ("STATE A"), right ("STATE B"), vs ("v. Company"), stamp ("SUED"),
//   count: value (1000000), label ("images (estimate)"), days ("10 days"; its leading number drives the day count),
//          before ("Back then"), source ("Source: watchdog report"), kids ("~X flagged as most harmful"),
//          cues: srcCue, daysCue, countCue, kidsCue (narration words; without them fractions of the scene)
const RED = '#ff5a52';

function machine(ctx, H, K, x, y, s, o) {
  // bottom-centre anchor; ~300 x 330 at s = 1. o: t, run (0..1 shake), stopped (bool), label
  const { roundRect } = H, t = o.t;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.shadow(ctx, 0, 0, 320);
  const jig = o.run ? Math.sin(t * 38) * 2.2 * o.run : 0;
  ctx.translate(jig, 0);
  // body
  roundRect(ctx, -150, -330, 300, 330, 26); ctx.fillStyle = '#3a4266'; ctx.fill();
  roundRect(ctx, -150, -330, 300, 60, 26); ctx.fillStyle = '#4a5482'; ctx.fill(); ctx.fillRect(-150, -300, 300, 30);
  ctx.fillStyle = '#2c3352'; ctx.fillRect(60, -270, 90, 270);
  // screen with a spinning "working" ring
  roundRect(ctx, -110, -250, 220, 120, 16); ctx.fillStyle = '#12152a'; ctx.fill();
  ctx.lineWidth = 9; ctx.lineCap = 'round';
  if (!o.stopped) {
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(0, -190, 34, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = o.accent; ctx.beginPath(); ctx.arc(0, -190, 34, t * 7, t * 7 + 1.9); ctx.stroke();
  } else {
    ctx.strokeStyle = RED; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(-22, -212); ctx.lineTo(22, -168); ctx.moveTo(22, -212); ctx.lineTo(-22, -168); ctx.stroke();
  }
  // output slot
  roundRect(ctx, -120, -100, 240, 34, 14); ctx.fillStyle = '#0c0e1c'; ctx.fill();
  // lights
  for (let i = 0; i < 3; i++) {
    const on = o.stopped ? true : Math.floor(t * 6 + i * 1.7) % 3 === 0;
    const c = o.stopped ? RED : o.accent;
    if (on) K.glow(ctx, -90 + i * 34, -36, 22, c, 0.5);
    ctx.fillStyle = on ? c : 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.arc(-90 + i * 34, -36, 9, 0, Math.PI * 2); ctx.fill();
  }
  // feet
  roundRect(ctx, -130, -8, 60, 12, 6); ctx.fillStyle = '#22273f'; ctx.fill();
  roundRect(ctx, 70, -8, 60, 12, 6); ctx.fill();
  ctx.restore();
  if (o.label) K.drawLabel(ctx, x, y - 330 * s - 18, o.labelPop == null ? 1 : o.labelPop, { text: o.label, size: 28, dot: true });
}

function blurCard(ctx, H, x, y, s, rot, seed) {
  // an abstract "picture" card: grey mosaic blocks + a black BLURRED bar. Centre anchor, 120 x 150 at s = 1.
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; H.roundRect(ctx, -56, -69, 120, 150, 12); ctx.fill();
  ctx.fillStyle = '#eef1f8'; H.roundRect(ctx, -60, -75, 120, 150, 12); ctx.fill();
  for (let r = 0; r < 5; r++) for (let c = 0; c < 4; c++) {
    const v = H.hash(seed * 7 + r * 4 + c, 3);
    const g = Math.round(120 + v * 70);
    ctx.fillStyle = `rgb(${g},${g + 4},${g + 14})`;
    ctx.fillRect(-50 + c * 25, -65 + r * 22, 25, 22);
  }
  ctx.fillStyle = '#0d0f1a'; ctx.fillRect(-60, -14, 120, 30);
  ctx.fillStyle = '#ffffff'; ctx.font = H.font('ui', 15); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('BLURRED', 0, 1);
  ctx.restore();
}

function folder(ctx, H, x, y, s, rot, top, sub, acc) {
  // case folder, centre anchor, 170 x 120 at s = 1
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; H.roundRect(ctx, -80, -50, 170, 120, 10); ctx.fill();
  ctx.fillStyle = '#d9a648'; H.roundRect(ctx, -85, -72, 70, 24, 8); ctx.fill();
  ctx.fillStyle = '#f0c063'; H.roundRect(ctx, -85, -60, 170, 120, 10); ctx.fill();
  ctx.fillStyle = '#1b2140'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const f = H.fitText(ctx, top, 'display', 30, 16, 150); ctx.font = f.font; ctx.fillText(f.text, 0, -14);
  ctx.font = H.font('ui', 20); ctx.fillStyle = '#3b3220'; ctx.fillText(sub, 0, 22);
  ctx.fillStyle = acc; ctx.fillRect(-60, 42, 120, 5);
  ctx.restore();
}

export default function draw(ctx, t, info) {
  const P = info.params || {};
  if ((P.mode || 'hook') === 'count') return drawCount(ctx, t, info);
  return drawHook(ctx, t, info);
}

function drawHook(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, easeOutCubic } = H;
  const tA = 0.55, tB = 0.95, tGavel = 1.45, tStamp = 1.7;
  const FEET = 1040;

  ctx.save();
  K.cameraShake(ctx, t, tStamp + 0.2, 0.35, 10);
  K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 487, y: 760 }, { t: tStamp + 0.3, zoom: 1.0, x: 487, y: 735 }, { t: Math.max(D, 3), zoom: 1.03, x: 487, y: 730 }]);
  const room = K.world.courtroom(ctx, { t });
  const BY = room.bench.y;

  // gavel on the bench (centre-right), strikes on tGavel
  const hit = t < tGavel - 0.25 ? 0 : t < tGavel ? easeOutCubic((t - tGavel + 0.25) / 0.25) : 1;
  K.drawGavel(ctx, 865, BY + 4, 0.8, { hit, shadow: false });

  // machine (left), spraying cards until the stamp
  const stopped = t > tStamp + 0.15;
  const MX = 250;
  // cards: emitted every 0.12 s from t = -1.2 (so the air is already full at frame 0) until the stamp
  const EVERY = 0.12, T0 = -1.2, FL = 1.1;
  const nCards = Math.floor((tStamp - T0) / EVERY);
  // landed ones first (floor pile around the machine)
  for (let i = 0; i < nCards; i++) {
    const s0 = T0 + i * EVERY;
    if (t < s0 + FL) continue;
    const lx = 90 + H.hash(i, 21) * 380, ly = 1030 - H.hash(i, 22) * 40;
    blurCard(ctx, H, lx, ly, 0.42, (H.hash(i, 23) - 0.5) * 1.2, i);
  }
  machine(ctx, H, K, MX, FEET, 0.82, { t, run: stopped ? 0 : 1, stopped, label: P.machine || 'Image tool', accent: ACC });
  for (let i = 0; i < nCards; i++) {
    const s0 = T0 + i * EVERY, u = (t - s0) / FL;
    if (u <= 0 || u >= 1) continue;
    const x0 = MX, y0 = FEET - 82;
    const lx = 90 + H.hash(i, 21) * 380, ly = 1030 - H.hash(i, 22) * 40;
    const peak = 520 + H.hash(i, 24) * 160;
    const x = lerp(x0, lx, u), y = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * peak + u * u * ly;
    blurCard(ctx, H, x, y, lerp(0.35, 0.5, Math.sin(u * Math.PI)), (H.hash(i, 23) - 0.5) * 1.2 + (1 - u) * 4 * (H.hash(i, 25) - 0.5), i);
  }

  // two lawyers stride in and slam their folders onto the bench
  const law = [
    { x1: 650, tS: tA, top: P.left || 'STATE A', bx: 450, by: BY - 52, rot: -0.12, skin: 1, hair: 0, hs: 'bun', shirt: '#2f3b6e', seed: 12 },
    { x1: 830, tS: tB, top: P.right || 'STATE B', bx: 700, by: BY - 56, rot: 0.1, skin: 3, hair: 2, hs: 'short', shirt: '#6b3a5e', seed: 4 },
  ];
  for (const L of law) {
    const walkEnd = L.tS - 0.25;
    const x = t < walkEnd ? lerp(L.x1 + 150, L.x1, easeOutCubic(clamp((t + 0.6) / (walkEnd + 0.6)))) : L.x1;
    const walking = t < walkEnd;
    const pose = t > L.tS - 0.3 && t < L.tS + 0.9 ? 'point' : 'stand';
    K.drawPerson(ctx, x, FEET, 1.25, { t, pose, walk: walking ? t : null, mood: t > tStamp ? 'neutral' : 'angry', look: -0.8, flip: true, skin: L.skin, hair: L.hair, hairStyle: L.hs, shirt: L.shirt, seed: L.seed });
    // folder: carried at the hand, then thrown in an arc to the bench
    const hx = x - 70, hy = FEET - 165;
    const u = clamp((t - (L.tS - 0.3)) / 0.3);
    if (u <= 0) folder(ctx, H, hx, hy, 0.55, 0.3, L.top, P.vs || 'v. Company', ACC);
    else {
      const e = easeOutCubic(u);
      const fx = lerp(hx, L.bx, e), fy = lerp(hy, L.by, e) - Math.sin(e * Math.PI) * 120;
      const sc = lerp(0.55, 1.0, e) * (u >= 1 ? 1 + 0.08 * Math.max(0, 1 - (t - L.tS) / 0.25) : 1);
      folder(ctx, H, fx, fy, sc, lerp(0.3, L.rot, e), L.top, P.vs || 'v. Company', ACC);
    }
  }

  // SUED stamp on the machine
  K.drawStamp(ctx, MX, FEET - 120, 0.8, { kind: 'cross', text: P.stamp || 'SUED', land: (t - tStamp) / 0.5 });
  ctx.restore();
}

function drawCount(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, easeOutCubic } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tSrc = at(P.srcCue, D * 0.1) - 0.2, tDays = at(P.daysCue, D * 0.3) - 0.2;
  const tCount = at(P.countCue, D * 0.5) - 0.3, tKids = at(P.kidsCue, D * 0.85) - 0.6;
  const FEET = 1036;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 760 }, { t: tCount, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.03, x: 487, y: 730 }]);
  K.world.room(ctx, { t, time: 'night', lamp: false, window: false, picture: false, plant: false });
  ctx.fillStyle = 'rgba(5,7,16,0.35)'; ctx.fillRect(0, 0, 1080, 1920);

  // card flood: a trickle, then a rush after the count cue
  const N = 110, slow = 16;
  const startOf = (i) => (i < slow ? 0.1 + i * (Math.max(1, tCount) / slow) : tCount + (i - slow) * 0.055);
  const FL = 0.9, MX = 215;
  const slot = (i) => [420 + H.hash(i, 31) * 330, 1032 - Math.floor(i / 22) * 16 - H.hash(i, 32) * 12, (H.hash(i, 33) - 0.5) * 1.1];
  for (let i = 0; i < N; i++) {
    const s0 = startOf(i);
    if (t < s0 + FL) continue;
    const [x, y, r] = slot(i);
    blurCard(ctx, H, x, y - 18, 0.4, r, i + 50);
  }
  const rush = t > tCount ? 1 : 0.4;
  machine(ctx, H, K, MX, FEET, 0.72, { t, run: rush, stopped: false, label: P.machine || 'Image tool', labelPop: 1 - clamp((t - tKids) / 0.3), accent: ACC });
  for (let i = 0; i < N; i++) {
    const s0 = startOf(i), u = (t - s0) / FL;
    if (u <= 0 || u >= 1) continue;
    const [x, y, r] = slot(i);
    const y0 = FEET - 72, peak = 760 + H.hash(i, 34) * 80;
    const px = lerp(MX + 40, x, u), py = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * peak + u * u * (y - 18);
    blurCard(ctx, H, px, py, 0.42, r + (1 - u) * 3, i + 50);
  }
  // researcher with a clipboard (right)
  const shocked = t > tCount + 0.6;
  K.drawPerson(ctx, 860, FEET, 1.15, { t, pose: shocked ? 'shrug' : 'stand', mood: t > tKids ? 'worried' : shocked ? 'shocked' : 'neutral', look: -0.7, flip: true, skin: 2, hair: 1, hairStyle: 'long', shirt: '#2f9e7a', seed: 22 });
  if (!shocked) {
    ctx.save(); ctx.translate(815, FEET - 150); ctx.rotate(-0.2);
    H.roundRect(ctx, -24, -32, 48, 64, 6); ctx.fillStyle = '#8a5a3c'; ctx.fill();
    ctx.fillStyle = '#f4f6fb'; ctx.fillRect(-18, -24, 36, 50);
    ctx.fillStyle = '#9aa3bf'; for (let k = 0; k < 4; k++) ctx.fillRect(-13, -16 + k * 11, 26, 4);
    ctx.restore();
  }
  ctx.restore();

  // ---- overlays (screen space)
  const sp = K.popIn(t, tSrc, 0.4);
  if (sp > 0) K.drawLabel(ctx, 487, 478, Math.min(1, sp), { text: P.source || 'Source: watchdog report', size: 26, dot: true });
  const pp = K.popIn(t, tDays, 0.5);
  if (pp > 0) {
    const s = Math.min(1.04, pp);
    ctx.save(); ctx.translate(487, 600); ctx.scale(s, s);
    H.roundRect(ctx, -340, -95, 680, 190, 30); ctx.fillStyle = 'rgba(10,12,22,0.9)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = K.font.ui(28); ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(t < tCount ? (P.before || 'Back then') : 'In ' + (P.days || '10 days') + ', about', 0, -60);
    if (t < tCount) {
      const nd = parseInt(P.days || '10', 10) || 10;
      const d = 1 + Math.floor(clamp((t - tDays) / Math.max(0.5, tCount - tDays - 0.15)) * (nd - 1) + 0.0001);
      ctx.font = K.font.display(76); ctx.fillStyle = '#ffffff'; ctx.fillText('Day ' + Math.min(nd, d) + ' of ' + nd, 0, 8);
    } else {
      const v = Math.round((P.value || 1000000) * easeOutCubic(clamp((t - tCount) / 1.4)) / 1000) * 1000;
      ctx.font = K.font.display(96); ctx.fillStyle = ACC; ctx.fillText(v.toLocaleString('en-US'), 0, 8);
    }
    ctx.font = K.font.ui(26); ctx.fillStyle = '#ffffff'; ctx.fillText(P.label || 'images (estimate)', 0, 70);
    ctx.restore();
  }
  const kp = K.popIn(t, tKids, 0.45);
  if (kp > 0) {
    const s = Math.min(1.05, kp), txt = P.kids || '~X flagged as most harmful';
    ctx.save(); ctx.translate(487, 748); ctx.scale(s, s);
    ctx.font = K.font.bold(32);
    const w = Math.min(800, ctx.measureText(txt).width + 70);
    H.roundRect(ctx, -w / 2, -36, w, 72, 36); ctx.fillStyle = RED; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const f = H.fitText(ctx, txt, 'bold', 32, 20, w - 50); ctx.font = f.font; ctx.fillText(f.text, 0, 2);
    ctx.restore();
  }
  void lerp;
}
