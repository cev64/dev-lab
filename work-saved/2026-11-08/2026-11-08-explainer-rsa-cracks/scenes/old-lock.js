// Scene "old-lock" (full frame). Encryption as a big cartoon padlock: an OLD (rusty, short-key) lock next to a
// MODERN (steel, long-key) one, at night. News level only: cracks are glowing lines on the lock, never steps.
// Modes:
//   hook     cold open: a brick wall with an old wooden door + rusty padlock and a modern steel door + bright padlock;
//            the AI robot (name pill) shines a torch on the old lock; cracks draw in from frame 0, flare red, ring,
//            the old lock shakes; the modern lock keeps a calm accent glow + check
//   what     the big lock with a name plate (lockName); top pill (who); robot + person with pills (agents, human);
//            on twoCue the cracks + rings + red pill (two); on msgCue / sigCue an envelope and a sealed document fly
//            out of the lock (what it protects)
//   keys     a short old key (oldKey pill) and a long modern key (newKey); on obsCue an "Obsolete" tag swings from
//            the short key; the long key gets a "Not affected" check pill
//   seal     a signed document with a wax seal; on fakeCue a dashed ghost copy slides out with a red "?" seal + pill;
//            a counter counts up to `value` + suffix on valueCue; a hedged note pill on noteCue
//   batch    a shelf of small old locks; a tall coin stack under the first, then one small stack per extra lock as
//            each pops open; pills tag / extra / avg
//   safe     night living room: a person on the sofa with a phone ("?" then relief), a shield with a check + pill on
//            secureCue; on oldCue an old server box in the corner gets a warning sign + pill
//   sandbox  a glass box (sign) holding the robot and an already-open old lock (solved tag); live server racks
//            outside (live pill); on liveCue a dashed link between them gets a red cross + untouched pill
// params: mode + the texts / cues listed in each mode (cue = narration word; "word#n" = (n+1)th time; else fractions)
// Fits: "a flaw found in an old / legacy version of a security standard", "old keys vs new keys", "the lock is fine
// if you upgraded" stories (encryption, passwords, certificates, old protocols).
const RED = '#ff6b5e';

function cue(info, w, d) {
  if (!w) return d;
  const m = String(w).split('#');
  const v = info.timeOf(m[0], m[1] ? +m[1] : 0);
  return v == null ? d : v;
}

// ---------- shared drawing ----------
// Padlock anchored bottom-centre. body 240x200, shackle above. o: old, open 0..1, crack 0..1, hot 0..1, ring 0..1,
// plate (text), glow 0..1, check 0..1, dim 0..1
function padlock(ctx, H, K, x, y, s, t, o = {}) {
  const { roundRect, clamp, mixHex, rgba } = H;
  const old = !!o.old, op = clamp(o.open || 0);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.glow > 0) K.glow(ctx, 0, -150, 260, K.ACCENT.base, 0.22 * o.glow);
  if (o.hot > 0) K.glow(ctx, 0, -110, 240, RED, 0.4 * o.hot * (0.85 + 0.15 * Math.sin(t * 7)));
  K.shadow(ctx, 0, 0, 230);
  // shackle
  ctx.save(); ctx.translate(62, -190 - 40 * op); ctx.rotate(-0.45 * op); ctx.translate(-62, 0);
  ctx.strokeStyle = old ? '#8f8a80' : '#dfe6f4'; ctx.lineWidth = 30; ctx.lineCap = 'butt';
  ctx.beginPath(); ctx.moveTo(-62, 10); ctx.lineTo(-62, -40); ctx.arc(0, -40, 62, Math.PI, 0); ctx.lineTo(62, 10); ctx.stroke();
  ctx.strokeStyle = old ? 'rgba(80,60,40,0.55)' : 'rgba(255,255,255,0.5)'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(-68, 4); ctx.lineTo(-68, -40); ctx.arc(0, -40, 68, Math.PI, Math.PI * 1.4); ctx.stroke();
  ctx.restore();
  // body
  const base = old ? '#9a7048' : '#c9d3e8', shade = mixHex(base, '#000000', 0.28);
  roundRect(ctx, -120, -200, 240, 200, 34); ctx.fillStyle = shade; ctx.fill();
  roundRect(ctx, -120, -200, 240, 184, 34); ctx.fillStyle = base; ctx.fill();
  if (old) { // rust spots + rivets
    for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(-80 + (i * 53) % 170, -170 + (i * 37) % 140, 14 + (i % 3) * 5, 9, i, 0, Math.PI * 2); ctx.fillStyle = 'rgba(110,62,30,0.55)'; ctx.fill(); }
    for (const [rx, ry] of [[-96, -178], [96, -178], [-96, -36], [96, -36]]) { ctx.beginPath(); ctx.arc(rx, ry, 7, 0, Math.PI * 2); ctx.fillStyle = '#6e4e33'; ctx.fill(); }
  } else {
    roundRect(ctx, -120, -200, 240, 26, 13); ctx.fillStyle = K.ACCENT.base; ctx.fill();
    ctx.globalAlpha = 0.35; roundRect(ctx, -100, -164, 40, 120, 20); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.globalAlpha = 1;
  }
  // keyhole or plate
  if (o.plate) {
    roundRect(ctx, -84, -150, 168, 70, 14); ctx.fillStyle = old ? '#4a3524' : '#1c2240'; ctx.fill();
    ctx.font = H.font('display', 46); ctx.fillStyle = old ? '#f1d9b8' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(o.plate), 0, -113);
    ctx.beginPath(); ctx.arc(0, -52, 13, 0, Math.PI * 2); ctx.fillStyle = old ? '#3a2818' : '#1c2240'; ctx.fill();
  } else {
    ctx.beginPath(); ctx.arc(0, -112, 22, 0, Math.PI * 2); ctx.fillStyle = old ? '#3a2818' : '#1c2240'; ctx.fill();
    roundRect(ctx, -9, -112, 18, 50, 8); ctx.fill();
  }
  // cracks (fixed polylines, drawn in)
  if (o.crack > 0) {
    const C = [
      [[-120, -150], [-80, -138], [-58, -110], [-30, -104], [-16, -70], [10, -58]],
      [[120, -70], [86, -84], [70, -120], [40, -132], [30, -170], [10, -200]],
      [[-58, -110], [-74, -76], [-60, -40]],
    ];
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    C.forEach((pts, i) => {
      const k = clamp(o.crack * 1.4 - i * 0.2);
      if (k <= 0) return;
      ctx.strokeStyle = '#120e14'; ctx.lineWidth = 12; K.pathDraw(ctx, pts, k);
      ctx.strokeStyle = mixHex('#3a2a2a', RED, clamp(o.hot || 0)); ctx.lineWidth = 5; K.pathDraw(ctx, pts, k);
    });
  }
  if (o.ring > 0) {
    ctx.save(); ctx.globalAlpha = clamp(o.ring); ctx.strokeStyle = RED; ctx.lineWidth = 7; ctx.setLineDash([18, 12]); ctx.lineDashOffset = -t * 40;
    const r = 175 * Math.min(1.08, o.ring);
    ctx.beginPath(); ctx.ellipse(0, -140, r, r * 1.08, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  }
  if (o.check > 0) {
    ctx.beginPath(); ctx.arc(92, -190, 40 * Math.min(1.08, o.check), 0, Math.PI * 2); ctx.fillStyle = K.ACCENT.base; ctx.fill();
    ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    K.pathDraw(ctx, [[74, -190], [87, -176], [110, -204]], clamp((o.check - 0.4) / 0.6));
  }
  if (o.dim > 0) { roundRect(ctx, -130, -330, 260, 340, 30); ctx.fillStyle = rgba('#0b0e1e', 0.55 * o.dim); ctx.fill(); }
  ctx.restore();
}

// Horizontal key, ring centre at (x, y), total length len. o: old, dim
function key(ctx, H, K, x, y, len, s, o = {}) {
  const { roundRect, mixHex } = H;
  const col = o.old ? '#b48a52' : K.ACCENT.base, sh = mixHex(col, '#000000', 0.3);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = o.dim ? 1 - 0.55 * o.dim : 1;
  ctx.beginPath(); ctx.arc(0, 0, 54, 0, Math.PI * 2); ctx.fillStyle = sh; ctx.fill();
  ctx.beginPath(); ctx.arc(-3, -3, 50, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
  ctx.beginPath(); ctx.arc(-3, -3, 20, 0, Math.PI * 2); ctx.fillStyle = '#141829'; ctx.fill();
  roundRect(ctx, 44, -14, len - 44, 28, 10); ctx.fillStyle = sh; ctx.fill();
  roundRect(ctx, 44, -16, len - 44, 24, 10); ctx.fillStyle = col; ctx.fill();
  // teeth: more teeth on longer keys
  const n = Math.max(2, Math.floor((len - 120) / 46));
  for (let i = 0; i < n; i++) { const tx = len - 30 - i * 46, th = 26 + ((i * 17) % 3) * 12; roundRect(ctx, tx - 14, 4, 28, th, 5); ctx.fillStyle = col; ctx.fill(); }
  ctx.restore();
}

function backdrop(ctx, H, K, t) {
  K.world.city(ctx, { t, time: 'night', groundY: 1010 });
  // brick wall panel in front of the city
  const { roundRect } = H;
  roundRect(ctx, 70, 430, 940, 590, 18); ctx.fillStyle = '#2a2f52'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let r = 0; r < 13; r++) for (let c = 0; c < 10; c++) {
    const bx = 78 + c * 96 + (r % 2 ? 48 : 0), by = 438 + r * 44;
    if (bx + 88 < 1008 && by + 38 < 1012) { roundRect(ctx, bx, by, 88, 38, 5); ctx.fill(); }
  }
}

function envelope(ctx, H, x, y, s, acc) {
  const { roundRect } = H;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  roundRect(ctx, -70, -48, 140, 96, 12); ctx.fillStyle = '#f2f4fa'; ctx.fill();
  ctx.strokeStyle = '#b9c1d6'; ctx.lineWidth = 5; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-66, -42); ctx.lineTo(0, 8); ctx.lineTo(66, -42); ctx.stroke();
  ctx.beginPath(); ctx.arc(46, 34, 24, 0, Math.PI * 2); ctx.fillStyle = acc; ctx.fill();
  roundRect(ctx, 34, 30, 24, 18, 4); ctx.fillStyle = '#141829'; ctx.fill();
  ctx.strokeStyle = '#141829'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(46, 30, 8, Math.PI, 0); ctx.stroke();
  ctx.restore();
}

function waxSeal(ctx, x, y, r, col, t, txt) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, rr = r * (1 + 0.08 * Math.sin(i * 2.7)); ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 4; ctx.stroke();
  if (txt) { ctx.font = `900 ${Math.round(r * 0.8)}px Montserrat, sans-serif`; ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 2); }
  ctx.restore();
}

function pill(ctx, K, x, y, k, o) { if (k > 0) K.drawLabel(ctx, x, y, Math.min(1.05, k), o); }

function redPill(ctx, H, x, y, k, text, size = 30) {
  if (k <= 0) return;
  const { roundRect } = H;
  ctx.save(); ctx.font = H.font('ui', size);
  const w = ctx.measureText(text).width + size * 1.6, h = size * 1.8;
  ctx.translate(x, y - h / 2); const s = Math.min(1.05, k); ctx.scale(s, s);
  roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = RED; ctx.fill();
  ctx.fillStyle = '#2a0f0c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 2);
  ctx.restore();
}

function checkPill(ctx, H, K, x, y, k, text, size = 28) {
  if (k <= 0) return;
  const { roundRect } = H;
  ctx.save(); ctx.font = H.font('ui', size);
  const w = ctx.measureText(text).width + size * 3, h = size * 1.8;
  ctx.translate(x, y - h / 2); const s = Math.min(1.05, k); ctx.scale(s, s);
  roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(10,12,22,0.9)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = K.ACCENT.base; ctx.stroke();
  const cx = -w / 2 + size * 1.1;
  ctx.beginPath(); ctx.arc(cx, 0, size * 0.6, 0, Math.PI * 2); ctx.fillStyle = K.ACCENT.base; ctx.fill();
  ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(cx - 8, 0); ctx.lineTo(cx - 2, 7); ctx.lineTo(cx + 10, -8); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, cx + size * 0.95, 2);
  ctx.restore();
}

// ---------- modes ----------
function hook(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, { smooth, clamp, lerp } = H;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.06, x: 430, y: 725 }]);
  backdrop(ctx, H, K, t);
  // doors
  const { roundRect } = H;
  roundRect(ctx, 220, 560, 250, 450, 14); ctx.fillStyle = '#5b3f2a'; ctx.fill();
  for (let i = 0; i < 4; i++) { roundRect(ctx, 236 + i * 58, 576, 46, 420, 6); ctx.fillStyle = i % 2 ? '#6a4a32' : '#644530'; ctx.fill(); }
  roundRect(ctx, 600, 560, 250, 450, 14); ctx.fillStyle = '#4a5578'; ctx.fill();
  roundRect(ctx, 618, 578, 214, 414, 10); ctx.fillStyle = '#56628a'; ctx.fill();
  // locks
  const crack = 0.3 + 0.7 * smooth(t / 1.4), hot = smooth((t - 1.0) / 0.5), ring = K.popIn(t, 1.5, 0.45);
  const sh = K.shake(t, 1.2, 0.5, 6);
  padlock(ctx, H, K, 345 + sh, 960, 0.78, t, { old: true, crack, hot, ring, plate: P.oldPlate || '1024' });
  padlock(ctx, H, K, 725, 960, 0.78, t, { glow: 1, plate: P.newPlate || '2048', check: K.popIn(t, 1.9, 0.4) });
  // torch beam from the robot onto the old lock
  const rx = 140, sweep = Math.sin(t * 2.2) * 18;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const g = ctx.createLinearGradient(rx + 40, 900, 345, 860); g.addColorStop(0, 'rgba(255,240,180,0.35)'); g.addColorStop(1, 'rgba(255,240,180,0.04)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(rx + 40, 905); ctx.lineTo(410, 770 + sweep); ctx.lineTo(420, 960 + sweep); ctx.closePath(); ctx.fill();
  ctx.restore();
  K.drawRobot(ctx, rx, 1035, 0.95, { t, state: 'working', seed: 3 });
  roundRectTorch(ctx, H, rx + 30, 900);
  pill(ctx, K, 290, 565, 1, { text: P.who || "Google's AI", size: 30, dot: true, accent: true });
  redPill(ctx, H, 345, 640, K.popIn(t, 1.55, 0.4), P.oldTag || 'Old lock', 28);
  pill(ctx, K, 725, 640, K.popIn(t, 1.9, 0.4), { text: P.newTag || 'Modern lock', size: 28 });
}
function roundRectTorch(ctx, H, x, y) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.25);
  H.roundRect(ctx, -10, -14, 52, 28, 8); ctx.fillStyle = '#3b4260'; ctx.fill();
  H.roundRect(ctx, 38, -18, 14, 36, 5); ctx.fillStyle = '#ffe9a8'; ctx.fill();
  ctx.restore();
}

function what(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, { smooth, clamp, lerp, easeOutCubic } = H;
  const tWho = cue(info, P.whoCue, D * 0.1) - 0.3, tAg = cue(info, P.agentsCue, D * 0.25) - 0.25,
    tHu = cue(info, P.humanCue, D * 0.4) - 0.25, tTwo = cue(info, P.twoCue, D * 0.55) - 0.3,
    tLock = cue(info, P.lockCue, D * 0.65) - 0.2, tMsg = cue(info, P.msgCue, D * 0.78) - 0.3, tSig = cue(info, P.sigCue, D * 0.9) - 0.3;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 487, y: 725 }]);
  backdrop(ctx, H, K, t);
  const crack = smooth((t - tTwo) / 0.9), hot = smooth((t - tTwo - 0.5) / 0.5);
  padlock(ctx, H, K, 487, 1000, 1.2, t, { old: true, plate: P.lockName || 'RSA', crack, hot, ring: K.popIn(t, tTwo + 0.7, 0.45) * (1 - smooth((t - tMsg) / 0.5)), glow: smooth((t - tLock) / 0.4) * 0.8 });
  // robot (left) and supervisor (right)
  K.drawRobot(ctx, 155, 1035, 0.95, { t, state: t > tTwo ? 'happy' : 'working', seed: 3 });
  K.drawPerson(ctx, 830, 1035, 1.1, { t, pose: t > tHu && t < tHu + 2.2 ? 'point' : 'stand', flip: true, mood: 'neutral', skin: 1, hair: 2, shirt: 3, hairStyle: 'short', seed: 4, look: -0.6, talk: 0 });
  // clipboard
  ctx.save(); ctx.translate(782, 900); ctx.rotate(0.12); H.roundRect(ctx, -26, -36, 52, 70, 6); ctx.fillStyle = '#c99a62'; ctx.fill(); H.roundRect(ctx, -20, -28, 40, 56, 4); ctx.fillStyle = '#f2f4fa'; ctx.fill(); ctx.restore();
  pill(ctx, K, 487, 565, K.popIn(t, tWho, 0.4), { text: P.who || 'Company', size: 32, dot: true, accent: true });
  const lower = 1 - smooth((t - tTwo) / 0.35);
  if (lower > 0) {
    ctx.save(); ctx.globalAlpha = lower;
    pill(ctx, K, 260, 660, K.popIn(t, tAg, 0.4), { text: P.agents || 'AI agents', size: 28 });
    pill(ctx, K, 680, 660, K.popIn(t, tHu, 0.4), { text: P.human || 'Human supervision', size: 28 });
    ctx.restore();
  }
  redPill(ctx, H, 487, 660, K.popIn(t, tTwo + 0.2, 0.4), P.two || '2 weak spots', 30);
  // what the lock protects: envelope + sealed document fly out to the sides
  const fly = (t0, x1, y1) => { const k = easeOutCubic(clamp((t - t0) / 0.7)); return [lerp(487, x1, k), lerp(860, y1, k), k]; };
  if (t > tMsg) { const [x, y, k] = fly(tMsg, 255, 760); envelope(ctx, H, x, y, 0.6 + 0.4 * k, K.ACCENT.base); pill(ctx, K, 255, 700, K.popIn(t, tMsg + 0.5, 0.35), { text: P.msg || 'Messages', size: 26 }); }
  if (t > tSig) {
    const [x, y, k] = fly(tSig, 720, 820);
    K.drawDocument(ctx, x, y, 0.55 + 0.25 * k, { lines: 5, sign: 1 });
    waxSeal(ctx, x + 34 * (0.55 + 0.25 * k), y - 24 * (0.55 + 0.25 * k), 16 * (0.55 + 0.25 * k) * 1.4, K.ACCENT.base, t);
    pill(ctx, K, 720, 700, K.popIn(t, tSig + 0.5, 0.35), { text: P.sig || 'Signatures', size: 26 });
  }
}

function keys(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, { smooth, clamp, lerp } = H;
  const tOld = cue(info, P.oldCue, D * 0.25) - 0.3, tObs = cue(info, P.obsCue, D * 0.75) - 0.3;
  const tNew = Math.min(D - 1.0, tOld + 1.4);
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 470, y: 725 }]);
  backdrop(ctx, H, K, t);
  const { roundRect } = H;
  // the old key: slides in, highlighted
  const kin = K.popIn(t, Math.max(0, tOld - 0.4), 0.5);
  const kx = lerp(-200, 260, smooth(clamp((t - Math.max(0, tOld - 0.6)) / 0.6)));
  if (t > tOld - 0.6) {
    K.glow(ctx, kx + 140, 660, 220, RED, 0.18 * smooth((t - tOld) / 0.4));
    key(ctx, H, K, kx, 660, 300, 1, { old: true });
  }
  pill(ctx, K, 390, 575, K.popIn(t, tOld, 0.4), { text: P.oldKey || 'Old key', size: 30, accent: true });
  // obsolete tag swings from the ring
  if (t > tObs) {
    const sw = Math.sin((t - tObs) * 5) * Math.exp(-(t - tObs) * 1.6) * 0.5;
    ctx.save(); ctx.translate(kx, 700); ctx.rotate(sw);
    ctx.strokeStyle = '#c9cfe0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 60); ctx.stroke();
    ctx.font = H.font('display', 34); const w = ctx.measureText(P.obsolete || 'Obsolete').width + 50;
    roundRect(ctx, -w / 2, 60, w, 64, 10); ctx.fillStyle = RED; ctx.fill();
    ctx.fillStyle = '#2a0f0c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.obsolete || 'Obsolete', 0, 94);
    ctx.restore();
  }
  // modern long key below, calmer, with a check pill
  const nin = smooth(clamp((t - tNew) / 0.6));
  if (nin > 0) {
    ctx.save(); ctx.globalAlpha = nin;
    key(ctx, H, K, 170, 900, 540, 1, { old: false });
    ctx.restore();
    pill(ctx, K, 470, 860, K.popIn(t, tNew + 0.2, 0.4), { text: P.newKey || 'New key', size: 28 });
    checkPill(ctx, H, K, 470, 1010, K.popIn(t, tNew + 0.6, 0.4), P.notThis || 'Not affected', 28);
  }
  K.drawRobot(ctx, 830, 1035, 0.8, { t, state: t > tObs ? 'thinking' : 'idle', seed: 3, flip: true });
}

function seal(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, { smooth, clamp, lerp, easeOutCubic } = H;
  const tFake = cue(info, P.fakeCue, D * 0.1) - 0.2, tSeal = cue(info, P.sealCue, D * 0.3) - 0.2,
    tVal = cue(info, P.valueCue, D * 0.75) - 0.6, tNote = cue(info, P.noteCue, D * 0.6) - 0.3;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 725 }]);
  backdrop(ctx, H, K, t);
  // desk
  H.roundRect(ctx, 90, 1000, 900, 30, 10); ctx.fillStyle = '#6b4a33'; ctx.fill();
  pill(ctx, K, 487, 565, K.popIn(t, 0.05, 0.4), { text: P.tag || 'Crack 1', size: 30, dot: true, accent: true });
  // real document
  const ds = 1.45, dx = 320, dy = 1000;
  K.drawDocument(ctx, dx, dy, ds, { lines: 6, sign: smooth(t / 0.8), seal: false });
  const pulse = 1 + 0.1 * Math.sin(clamp((t - tSeal) / 0.6) * Math.PI);
  K.glow(ctx, dx + 40 * ds, dy - 34 * ds, 90, K.ACCENT.base, 0.35 * smooth((t - tSeal) / 0.3));
  waxSeal(ctx, dx + 40 * ds, dy - 34 * ds, 30 * pulse, K.ACCENT.base, t, '');
  // forged ghost copy slides out to the right
  const f = easeOutCubic(clamp((t - tFake) / 0.8));
  if (f > 0) {
    const gx = lerp(dx, 640, f);
    ctx.save(); ctx.globalAlpha = 0.85 * f;
    K.drawDocument(ctx, gx, dy, ds, { lines: 6, sign: 1, seal: false, shadow: false });
    ctx.restore();
    ctx.save(); ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = RED; ctx.lineWidth = 5;
    H.roundRect(ctx, gx - 75 * ds, dy - 186 * ds, 150 * ds, 192 * ds, 14); ctx.stroke(); ctx.restore();
    waxSeal(ctx, gx + 40 * ds, dy - 34 * ds, 30, RED, t, '?');
    redPill(ctx, H, 640, 900, K.popIn(t, tFake + 0.5, 0.4), P.fake || 'Forged?', 28);
  }
  // counter
  if (t > tVal) {
    const v = Math.round((P.value || 100) * easeOutCubic(clamp((t - tVal) / 1.1)));
    const txt = v.toLocaleString('en-US') + (P.suffix || 'x');
    const k = K.popIn(t, tVal, 0.4);
    ctx.save(); ctx.translate(487, 680); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
    const fs = H.fitText ? 92 : 92; ctx.font = H.font('display', fs); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(10,12,22,0.85)'; ctx.lineJoin = 'round'; ctx.strokeText(txt, 0, 0);
    ctx.fillStyle = K.ACCENT.base; ctx.fillText(txt, 0, 0);
    ctx.restore();
  }
  pill(ctx, K, 487, 745, K.popIn(t, Math.max(tNote, tVal + 0.8), 0.4), { text: P.note || 'Estimate', size: 26 });
}

function batch(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, { smooth, clamp } = H;
  const tLots = cue(info, P.lotsCue, D * 0.15) - 0.3, tExtra = cue(info, P.extraCue, D * 0.45) - 0.2, tCheap = cue(info, P.cheapCue, D * 0.75) - 0.4;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 725 }]);
  backdrop(ctx, H, K, t);
  pill(ctx, K, 487, 565, K.popIn(t, 0.05, 0.4), { text: P.tag || 'Crack 2', size: 30, dot: true, accent: true });
  // shelf
  H.roundRect(ctx, 100, 862, 880, 22, 8); ctx.fillStyle = '#6b4a33'; ctx.fill();
  const n = 6, xs = Array.from({ length: n }, (_, i) => 175 + i * 126);
  xs.forEach((x, i) => {
    const appear = K.popIn(t, Math.max(0, tLots - 0.2) + i * 0.12, 0.35);
    if (appear <= 0) return;
    const tOpen = i === 0 ? tLots + 1.2 : tExtra + 0.3 + (i - 1) * 0.45;
    const open = smooth((t - tOpen) / 0.4);
    padlock(ctx, H, K, x, 862, 0.44 * Math.min(1.05, appear), t, { old: true, open, plate: false });
    // coin stack on the floor under each lock: tall for key 1, small for the extras
    const coins = i === 0 ? 9 : 1;
    const shown = i === 0 ? Math.floor(coins * smooth((t - tLots - 0.2) / 1.0)) : (t > tOpen - 0.1 ? 1 : 0);
    for (let c = 0; c < shown; c++) K.drawCoin(ctx, x, 1012 - c * 11, 0.62, { spin: 0.4 + c * 0.7 });
  });
  pill(ctx, K, 175, 712, K.popIn(t, tLots + 0.9, 0.35), { text: P.first || 'Key 1', size: 24 });
  pill(ctx, K, 487, 640, K.popIn(t, tCheap, 0.45), { text: P.extra || 'Each extra key: cheaper', size: 30, accent: true });
  if (P.avg) { const k = K.popIn(t, tCheap + 0.5, 0.35); if (k > 0) { ctx.save(); ctx.globalAlpha = Math.min(1, k); ctx.font = H.font('ui', 26); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.textAlign = 'center'; ctx.fillText(P.avg, 487, 682); ctx.restore(); } }
}

function safe(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, { smooth, clamp } = H;
  const tNo = cue(info, P.noCue || 'no', D * 0.22) - 0.1, tSec = cue(info, P.secureCue, D * 0.6) - 0.3, tOld = cue(info, P.oldCue, D * 0.8) - 0.3;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 500, y: 725 }]);
  const room = K.world.livingRoomNight(ctx, { t });
  const s = room.sofa;
  K.drawPerson(ctx, s.x - 60, s.feetY, 1.9, { t, pose: 'sit-phone', seat: false, mood: t < tNo ? 'worried' : 'happy', skin: 3, hair: 1, shirt: 2, hairStyle: 'long', seed: 11 });
  // "?" above the head, then relief
  const qk = K.popIn(t, 0.05, 0.4) * (1 - smooth((t - tNo) / 0.3));
  if (qk > 0) K.drawSpeechBubble(ctx, s.x + 40, 600, Math.min(1.05, qk), { text: '?', size: 60, tail: 'left' });
  // shield + secure pill
  const sk = K.popIn(t, tSec, 0.45);
  if (sk > 0) { K.drawShield(ctx, 250, 760, 1.1 * Math.min(1.05, sk), { check: clamp((t - tSec - 0.3) / 0.5) }); }
  pill(ctx, K, 420, 565, sk, { text: P.secure || 'Still secure', size: 30, accent: true });
  // old server box in the corner
  const ok = K.popIn(t, tOld, 0.45);
  if (ok > 0) {
    const flick = 0.4 + 0.3 * (Math.sin(t * 13) > 0.6 ? 1 : 0);
    ctx.save(); ctx.globalAlpha = Math.min(1, ok);
    K.drawServerRack(ctx, 815, 1015, 0.9 * Math.min(1.05, ok), { t, activity: flick });
    ctx.restore();
    K.drawWarning(ctx, 815, 770, 0.55 * Math.min(1.05, ok), { pulse: t });
    redPill(ctx, H, 610, 650, ok, P.old || 'Old systems', 28);
  }
}

function sandbox(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, { smooth, clamp } = H;
  const tBox = cue(info, P.boxCue, D * 0.2) - 0.4, tSol = cue(info, P.solvedCue, D * 0.45) - 0.3, tLive = cue(info, P.liveCue, D * 0.8) - 0.4;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 725 }]);
  K.world.serverHall(ctx, { t, activity: 0.5 });
  const { roundRect, rgba } = H;
  // glass box
  const bx0 = 110, bx1 = 540, by0 = 610, by1 = 1030;
  const drop = smooth(clamp((t - Math.max(0, tBox - 0.3)) / 0.6));
  K.drawRobot(ctx, 220, 1020, 0.9, { t, state: 'working', seed: 3 });
  padlock(ctx, H, K, 420, 1020, 0.62, t, { old: true, open: 0.6 + 0.4 * smooth(t / 0.5), plate: false, crack: 1 });
  ctx.save(); ctx.translate(0, (1 - drop) * -500); ctx.globalAlpha = Math.max(0.0, drop);
  roundRect(ctx, bx0, by0, bx1 - bx0, by1 - by0, 18); ctx.fillStyle = rgba('#9fd8ff', 0.12); ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = rgba('#bfe6ff', 0.75); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx0 + 40, by0 + 40); ctx.lineTo(bx0 + 110, by0 + 40); ctx.moveTo(bx0 + 40, by0 + 60); ctx.lineTo(bx0 + 80, by0 + 60);
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.stroke();
  ctx.restore();
  pill(ctx, K, (bx0 + bx1) / 2, 590, K.popIn(t, tBox + 0.3, 0.4), { text: P.box || 'SANDBOX', size: 30, accent: true });
  checkPill(ctx, H, K, 400, 820, K.popIn(t, tSol, 0.4), P.solved || 'Already solved', 26);
  // live systems outside
  const lk = K.popIn(t, Math.max(0.2, tLive - 0.6), 0.5);
  if (lk > 0) {
    K.drawServerRack(ctx, 700, 1030, 1.0 * Math.min(1.05, lk), { t, activity: 0.9 });
    K.drawServerRack(ctx, 830, 1030, 1.0 * Math.min(1.05, lk), { t: t + 0.7, activity: 0.9 });
    pill(ctx, K, 765, 740, lk, { text: P.live || 'Live systems', size: 28 });
  }
  // dashed link, crossed out
  const ln = smooth((t - tLive) / 0.5);
  if (ln > 0) {
    ctx.save(); ctx.setLineDash([16, 12]); ctx.strokeStyle = RED; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(545, 900); ctx.lineTo(545 + (640 - 545) * ln, 900); ctx.stroke(); ctx.restore();
    const xk = K.popIn(t, tLive + 0.4, 0.35);
    if (xk > 0) {
      ctx.save(); ctx.translate(595, 900); ctx.scale(Math.min(1.05, xk), Math.min(1.05, xk));
      ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fillStyle = RED; ctx.fill();
      ctx.strokeStyle = '#2a0f0c'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-11, -11); ctx.lineTo(11, 11); ctx.moveTo(11, -11); ctx.lineTo(-11, 11); ctx.stroke(); ctx.restore();
    }
    pill(ctx, K, 700, 650, K.popIn(t, tLive + 0.6, 0.4), { text: P.untouched || 'Not touched', size: 28 });
  }
}

const MODES = { hook, what, keys, seal, batch, safe, sandbox };

export default function draw(ctx, t, info) {
  const P = info.params || {};
  ctx.save();
  (MODES[P.mode] || hook)(ctx, t, info, P);
  ctx.restore();
}
