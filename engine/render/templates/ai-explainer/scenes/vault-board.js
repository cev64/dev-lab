// Scene "vault-board" (full frame, 2-beat span: cold open + what happened). Night classroom: a giant chalkboard holds a
// round vault door with a famous problem's name plate. A generic cartoon mathematician spins the dial while the kit
// robot listens at the door with a stethoscope; the bolts slide, the door swings ajar and light spills out, and a
// "MAYBE?" tag swings on the handle (it is a claim). Beat 2: date pill, a name card (text only, the person is a generic
// stand-in), an "unreleased version" chip at the robot, an age plate (year -> now, counted), then a row of prime
// numbers lights up across the top of the board with a wavy chalk line and a "hidden pattern?" tag.
// Fits: "an AI (with a human) claims to have cracked a famous old problem" stories.
// params: plate, maybe, date, name, role, model, from, to, ageLabel, primes [], pattern,
//         cues: dateCue, nameCue, modelCue, ageCue, primeCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const b2 = info.beats && info.beats[1] ? info.beats[1].t0 : 3.0;
  const tOpen = 0.85;                       // door swings ajar (cold open peak)
  const tMaybe = 1.55;
  const tDate = at(P.dateCue, b2 + 0.3) - 0.15;
  const tName = at(P.nameCue, b2 + 2) - 0.2;
  const tModel = at(P.modelCue, b2 + 6) - 0.2;
  const tAge = at(P.ageCue, b2 + 8.5) - 0.2;
  const tPrime = at(P.primeCue, b2 + 11) - 0.3;
  const feet = 1035;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 487, y: 700 }, { t: 2.6, zoom: 1.0, x: 487, y: 725 }, { t: tAge, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 700 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 905 });

  // chalkboard
  const bx = 92, by = 430, bw = 800, bh = 450;
  H.roundRect(ctx, bx - 16, by - 16, bw + 32, bh + 32, 14); ctx.fillStyle = '#7a5235'; ctx.fill();
  H.roundRect(ctx, bx, by, bw, bh, 8); ctx.fillStyle = '#1d3a34'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.035)';
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(bx + 110 + i * 130, by + 90 + (i % 2) * 220, 90, 38, 0.3, 0, Math.PI * 2); ctx.fill(); }
  // faint old attempts (crossed-out chalk scribbles) in the corners
  ctx.save(); ctx.strokeStyle = 'rgba(235,240,248,0.22)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let r = 0; r < 4; r++) {
    for (const side of [0, 1]) {
      const x0 = side ? bx + bw - 170 : bx + 30, y0 = by + 150 + r * 62;
      ctx.beginPath();
      for (let s = 0; s <= 10; s++) { const xx = x0 + s * 13, yy = y0 + Math.sin(s * 1.9 + r + side) * 6; if (s) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }
      ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x0 - 4, y0 + 8); ctx.lineTo(x0 + 134, y0 - 8); ctx.stroke();
    }
  }
  ctx.restore();

  // vault door (in the middle of the board)
  const vx = 525, vy = 712, vr = 145;
  const open = easeOutCubic(clamp((t - tOpen) / 0.9)) * 0.42;   // 0 closed .. 0.42 ajar
  // light from the gap
  if (open > 0.01) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(vx, vy, 10, vx, vy, vr * 1.9);
    g.addColorStop(0, H.rgba(ACC, 0.55 * open / 0.42)); g.addColorStop(1, H.rgba(ACC, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(vx, vy, vr * 1.9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // the opening behind the door
    ctx.beginPath(); ctx.arc(vx, vy, vr - 6, 0, Math.PI * 2); ctx.fillStyle = H.mixHex(ACC, '#ffffff', 0.35); ctx.fill();
  }
  // frame ring
  ctx.beginPath(); ctx.arc(vx, vy, vr + 14, 0, Math.PI * 2); ctx.fillStyle = '#5c6378'; ctx.fill();
  ctx.beginPath(); ctx.arc(vx, vy, vr + 4, 0, Math.PI * 2); ctx.fillStyle = '#2b3042'; ctx.fill();
  if (open > 0.01) { ctx.beginPath(); ctx.arc(vx, vy, vr - 6, 0, Math.PI * 2); ctx.fillStyle = H.mixHex(ACC, '#ffffff', 0.35); ctx.fill(); }
  // hinge on the left: the door squashes horizontally and shifts left as it swings
  ctx.save();
  const sx = Math.cos(open * Math.PI * 0.95);
  ctx.translate(vx - vr, vy); ctx.scale(sx, 1); ctx.translate(-(vx - vr), -vy);
  ctx.translate(-open * 60, 0);
  ctx.beginPath(); ctx.arc(vx, vy, vr, 0, Math.PI * 2); ctx.fillStyle = '#9aa3b8'; ctx.fill();
  ctx.beginPath(); ctx.arc(vx, vy, vr - 16, 0, Math.PI * 2); ctx.fillStyle = '#b8c0d2'; ctx.fill();
  // bolts (slide in as it unlocks)
  const unbolt = smooth((t - 0.35) / 0.5);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2, rr = vr - 22 - unbolt * 16;
    ctx.beginPath(); ctx.arc(vx + Math.cos(a) * rr, vy + Math.sin(a) * rr, 9, 0, Math.PI * 2); ctx.fillStyle = '#6f7890'; ctx.fill();
  }
  const plate = String(P.plate || 'A famous problem');
  const lines = H.wrap(ctx, plate, 'bold', 24, 236);
  // the dial: spins fast, then stops
  const spinU = clamp(t / 0.8);
  const ang = (1 - Math.pow(1 - spinU, 3)) * Math.PI * 7;
  ctx.save(); ctx.translate(vx, vy + 20);
  ctx.beginPath(); ctx.arc(0, 0, 54, 0, Math.PI * 2); ctx.fillStyle = '#3a4054'; ctx.fill();
  ctx.rotate(ang);
  ctx.beginPath(); ctx.arc(0, 0, 44, 0, Math.PI * 2); ctx.fillStyle = '#d7dceb'; ctx.fill();
  ctx.strokeStyle = '#3a4054'; ctx.lineWidth = 3;
  for (let k = 0; k < 12; k++) { const a = (k / 12) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 32, Math.sin(a) * 32); ctx.lineTo(Math.cos(a) * 42, Math.sin(a) * 42); ctx.stroke(); }
  ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(0, -36, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // handle (spokes)
  ctx.save(); ctx.translate(vx + 92, vy + 20); ctx.rotate(ang * 0.15 + unbolt * 0.8);
  ctx.strokeStyle = '#4a5166'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  for (let k = 0; k < 3; k++) { const a = (k / 3) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 30, Math.sin(a) * 30); ctx.stroke(); }
  ctx.restore();
  ctx.restore();

  // name plate on the frame ring (stays readable when the door swings)
  {
    const py = vy - vr - 36;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; H.roundRect(ctx, vx - 146, py + 6, 292, 68, 10); ctx.fill();
    H.roundRect(ctx, vx - 150, py, 300, 68, 10); ctx.fillStyle = '#e9d9a6'; ctx.fill();
    ctx.fillStyle = '#2b2414'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lines = H.wrap(ctx, plate, 'bold', 26, 270);
    if (lines.length > 1) { ctx.font = H.font('bold', 25); ctx.fillText(lines[0], vx, py + 21); ctx.fillText(lines.slice(1).join(' '), vx, py + 49); }
    else { const pl = H.fitText(ctx, plate, 'bold', 30, 16, 270); ctx.font = pl.font; ctx.fillText(pl.text, vx, py + 35); }
  }

  // click sparks while the dial turns
  if (t < 0.85) {
    for (let i = 0; i < 5; i++) {
      const u = ((t * 3 + i * 0.21) % 1);
      ctx.fillStyle = H.rgba('#ffffff', 0.8 * (1 - u));
      ctx.beginPath(); ctx.arc(vx + 60 + u * 50 * Math.cos(i), vy - 10 - u * 50 * Math.sin(i + 1), 4, 0, Math.PI * 2); ctx.fill();
    }
  }

  // "MAYBE?" tag swinging on a string from the frame (right side)
  const mk = K.popIn(t, tMaybe, 0.45);
  if (mk > 0) {
    const sw = Math.sin((t - tMaybe) * 4.2) * 0.32 * Math.exp(-(t - tMaybe) * 0.9);
    const hx = vx + vr + 4, hy = vy - 70;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(sw); ctx.scale(mk, mk);
    ctx.strokeStyle = '#e7ebf3'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 54); ctx.stroke();
    ctx.translate(0, 54);
    H.roundRect(ctx, -82, 0, 164, 74, 12); ctx.fillStyle = ACC; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 12, 6, 0, Math.PI * 2); ctx.fillStyle = '#14160a'; ctx.fill();
    ctx.fillStyle = '#14160a'; ctx.font = H.font('display', 34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(P.maybe || 'MAYBE?'), 0, 44);
    ctx.restore();
  }

  // age plate: year -> now, counting
  const ak = K.popIn(t, tAge, 0.45);
  if (ak > 0) {
    const from = +P.from || 1900, to = +P.to || 2026;
    const yr = Math.round(lerp(from, to, easeOutCubic(clamp((t - tAge) / 1.3))));
    ctx.save(); ctx.translate(vx, vy + 92); ctx.scale(ak, ak);
    H.roundRect(ctx, -150, -30, 300, 60, 30); ctx.fillStyle = 'rgba(10,12,22,0.9)'; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('ui', 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${from}  →  ${yr}`, 0, 2);
    ctx.restore();
    const ak2 = K.popIn(t, tAge + 1.2, 0.4);
    if (ak2 > 0) pill(H, ctx, vx, vy + 160, ak2, String(P.ageLabel || (to - from) + ' years unsolved'), ACC, true, 30);
  }

  // prime numbers row across the top of the board + wavy chalk line + tag
  const primes = P.primes || [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
  if (t > tPrime) {
    const n = primes.length, x0 = bx + 60, x1 = bx + bw - 60;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const x = lerp(x0, x1, i / (n - 1)), y = by + 38 + Math.sin(i * 1.1) * 6;
      pts.push([x, y + 30]);
      const k = K.popIn(t, tPrime + i * 0.08, 0.3);
      if (k <= 0) continue;
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
      ctx.fillStyle = 'rgba(240,244,250,0.95)'; ctx.font = H.font('display', 34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(primes[i]), 0, 0);
      ctx.restore();
    }
    const lineU = smooth((t - tPrime - 0.4) / 1.0);
    if (lineU > 0) {
      ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 4; ctx.setLineDash([10, 9]); ctx.lineCap = 'round';
      const wav = []; for (let s = 0; s <= 60; s++) { const u = s / 60; wav.push([lerp(x0, x1, u), by + 72 + Math.sin(u * Math.PI * 5) * 8]); }
      K.pathDraw(ctx, wav, lineU);
      ctx.restore();
    }
    const tk = K.popIn(t, tPrime + 0.9, 0.4);
    if (tk > 0) pill(H, ctx, bx + bw - 125, by + 190, tk, String(P.pattern || 'a hidden pattern?'), ACC, false, 28);
  }

  // characters: mathematician (left) turning the dial, robot (right) listening with a stethoscope
  const pT = t < tOpen ? 'point' : (t < b2 ? 'cheer' : 'stand');
  K.drawPerson(ctx, 175, feet, 1.38, { t, pose: pT, mood: t < tOpen ? 'neutral' : 'happy', skin: 2, hair: 1, shirt: 2, hairStyle: 'short', talk: 0, seed: 5 });
  const rState = t < tOpen ? 'working' : (t < b2 + 0.6 ? 'happy' : 'idle');
  K.drawRobot(ctx, 808, feet, 1.3, { t, state: rState, flip: true, seed: 4 });
  // stethoscope from the robot head to the door while cracking
  const steth = 1 - smooth((t - tOpen - 0.2) / 0.4);
  if (steth > 0.02) {
    ctx.save(); ctx.globalAlpha = steth; ctx.strokeStyle = '#dfe4f0'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(808 - 40, feet - 250); ctx.bezierCurveTo(760, feet - 200, 730, feet - 380, vx + vr - 10, vy + 30); ctx.stroke();
    ctx.beginPath(); ctx.arc(vx + vr - 10, vy + 30, 12, 0, Math.PI * 2); ctx.fillStyle = '#c9cfde'; ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // beat 2 overlays (screen space)
  const dk = K.popIn(t, tDate, 0.4) * (1 - smooth((t - tPrime + 0.4) / 0.35));
  if (dk > 0.01) pill(H, ctx, 215, 478, dk, String(P.date || 'DATE'), ACC, false, 30);
  const nk = K.popIn(t, tName, 0.45) * (1 - smooth((t - tAge + 0.1) / 0.35));
  if (nk > 0.01) nameCard(H, ctx, 240, 625, nk, String(P.name || 'A mathematician'), String(P.role || 'mathematician'), ACC);
  const mo = K.popIn(t, tModel, 0.45) * (1 - smooth((t - tAge + 0.1) / 0.35));
  if (mo > 0.01) pill(H, ctx, 712, 478, mo, String(P.model || 'with an unreleased AI'), ACC, true, 26);
}

function pill(H, ctx, x, y, k, text, ACC, solid, size = 32) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  const f = H.fitText(ctx, text, 'ui', size, 20, 520); ctx.font = f.font;
  const w = ctx.measureText(f.text).width + 52, h = size * 1.8;
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = solid ? ACC : 'rgba(10,12,24,0.92)'; ctx.fill();
  if (!solid) { ctx.lineWidth = 2.5; ctx.strokeStyle = ACC; ctx.stroke(); }
  ctx.fillStyle = solid ? '#14160a' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
  ctx.restore();
}

function nameCard(H, ctx, x, y, k, name, role, ACC) {
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  ctx.font = H.font('display', 34); const w1 = ctx.measureText(name).width;
  ctx.font = H.font('ui', 24); const w2 = ctx.measureText(role).width;
  const w = Math.min(290, Math.max(w1, w2) + 40), h = 104;
  H.roundRect(ctx, -w / 2, -h / 2, w, h, 18); ctx.fillStyle = 'rgba(10,12,24,0.93)'; ctx.fill();
  ctx.fillStyle = ACC; H.roundRect(ctx, -w / 2, -h / 2, 10, h, 5); ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const f = H.fitText(ctx, name, 'display', 34, 22, w - 40); ctx.font = f.font; ctx.fillStyle = '#ffffff'; ctx.fillText(f.text, 4, -16);
  const g = H.fitText(ctx, role, 'ui', 24, 18, w - 40); ctx.font = g.font; ctx.fillStyle = ACC; ctx.fillText(g.text, 4, 24);
  ctx.restore();
}
