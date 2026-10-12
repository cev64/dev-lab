// Scene "apps-fail" (full frame). Night street: a cartoon person stands at the curb with a phone. A big phone mock-up
// shows a generic ride app (little map, route, car icon, "Finding a car..." spinner). At the dark cue a small
// data-center icon in the corner of the phone blinks out; at the fail cue the spinner turns into an error card and the
// person looks worried, then shrugs. At the later cues two app tiles (voice assistant, music) pop above the person and
// grey out with an "offline" cross. Ends settled. Generic icons only, no brands.
// Fits: outages, "your apps stopped working", cloud failures hitting everyday services.
// params (all optional): app ("Taxi"), finding ("Finding a car..."), error ("Can't order a ride"), tiles ([{ kind: 'voice'|'music'|'bank'|'chat', text, cue }]),
//         cues: darkCue (10 %), failCue (40 %)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth } = H;
  const D = info.duration, ACC = info.accent, RED = K.NEUTRAL.danger;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tDark = at(P.darkCue, D * 0.1), tFail = at(P.failCue, D * 0.4);
  const tiles = (P.tiles || [{ kind: 'voice', text: 'Voice assistant' }, { kind: 'music', text: 'Music' }])
    .map((x, i) => ({ ...x, t: at(x.cue, D * (0.65 + 0.15 * i)) }));

  const z = lerp(1.0, 1.04, K.phase(t, 0, D));
  ctx.save(); ctx.translate(487, 760); ctx.scale(z, z); ctx.translate(-487, -760);
  K.world.city(ctx, { t, time: 'night', groundY: 980 });
  ctx.fillStyle = 'rgba(5,7,16,0.35)'; ctx.fillRect(0, 0, 1080, 1920);

  // person at the curb
  const px = 250, feet = 1030;
  const worried = t > tFail + 0.3, shrug = t > (tiles.length ? tiles[tiles.length - 1].t + 0.6 : D * 0.9);
  K.drawPerson(ctx, px, feet, 1.45, { t, pose: shrug ? 'shrug' : 'phone', mood: worried ? 'worried' : 'neutral', skin: 2, hair: 1, hairStyle: 'short', shirt: 3, look: shrug ? 0 : 0.6, seed: 7 });

  // big phone mock-up on the right
  const fx = 680, fy = 470, fw = 330, fh = 540;
  const pp = Math.min(1, K.popIn(t, 0.15, 0.5));
  ctx.save(); ctx.translate(fx, fy + fh); ctx.scale(pp, pp); ctx.translate(-fx, -(fy + fh));
  K.shadow(ctx, fx, fy + fh + 6, 300);
  H.roundRect(ctx, fx - fw / 2, fy, fw, fh, 40); ctx.fillStyle = '#2a2f45'; ctx.fill();
  H.roundRect(ctx, fx - fw / 2 + 14, fy + 14, fw - 28, fh - 28, 30); ctx.fillStyle = '#121527'; ctx.fill();
  ctx.save(); H.roundRect(ctx, fx - fw / 2 + 14, fy + 14, fw - 28, fh - 28, 30); ctx.clip();
  // app header
  ctx.fillStyle = '#1c2033'; ctx.fillRect(fx - fw / 2, fy + 14, fw, 74);
  ctx.font = K.font.ui(30); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
  ctx.fillText(P.app || 'Taxi', fx - fw / 2 + 40, fy + 54);
  // tiny data-center status icon in the header (goes dark)
  const dcOn = t < tDark ? 1 : 1 - smooth((t - tDark) / 0.5);
  const ix = fx + fw / 2 - 66, iy = fy + 54;
  H.roundRect(ctx, ix - 26, iy - 16, 52, 32, 6); ctx.fillStyle = H.mixHex('#3b4260', '#dfe4f1', dcOn); ctx.fill();
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(ix - 14 + k * 14, iy, 4, 0, Math.PI * 2); ctx.fillStyle = dcOn > 0.5 && Math.floor(t * 4 + k) % 3 ? ACC : 'rgba(255,255,255,0.25)'; ctx.fill(); }
  // map
  const my = fy + 100, mh = 250;
  ctx.fillStyle = '#1d2547'; ctx.fillRect(fx - fw / 2, my, fw, mh);
  ctx.strokeStyle = 'rgba(160,190,255,0.18)'; ctx.lineWidth = 10;
  for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(fx - fw / 2, my + 30 + k * 65); ctx.lineTo(fx + fw / 2, my + 10 + k * 70); ctx.stroke(); }
  for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(fx - 110 + k * 110, my); ctx.lineTo(fx - 80 + k * 100, my + mh); ctx.stroke(); }
  ctx.strokeStyle = ACC; ctx.lineWidth = 6; ctx.setLineDash([12, 10]);
  ctx.beginPath(); ctx.moveTo(fx - 100, my + 200); ctx.quadraticCurveTo(fx, my + 120, fx + 90, my + 60); ctx.stroke(); ctx.setLineDash([]);
  ctx.beginPath(); ctx.arc(fx - 100, my + 200, 12, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
  // pin
  ctx.beginPath(); ctx.arc(fx + 90, my + 50, 18, 0, Math.PI * 2); ctx.fillStyle = RED; ctx.fill();
  ctx.beginPath(); ctx.arc(fx + 90, my + 50, 7, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
  // car icon wandering (stops when the service fails)
  const carU = t < tFail ? 0.5 + 0.5 * Math.sin(t * 1.3) : 0.5 + 0.5 * Math.sin(tFail * 1.3);
  const cx = lerp(fx - 120, fx + 100, carU), cy = my + 150 + 20 * Math.sin(carU * 3);
  ctx.globalAlpha = t < tFail ? 1 : 0.35;
  H.roundRect(ctx, cx - 26, cy - 14, 52, 28, 10); ctx.fillStyle = '#ffcc33'; ctx.fill();
  H.roundRect(ctx, cx - 14, cy - 24, 28, 14, 6); ctx.fill();
  ctx.globalAlpha = 1;
  // bottom card: spinner or error
  const by = my + mh + 20;
  const fail = smooth((t - tFail) / 0.3);
  H.roundRect(ctx, fx - fw / 2 + 30, by, fw - 60, 140, 20); ctx.fillStyle = H.mixHex('#2a2f45', '#3a1e28', fail); ctx.fill();
  if (fail < 1) {
    ctx.globalAlpha = 1 - fail;
    ctx.strokeStyle = ACC; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(fx, by + 48, 22, t * 6, t * 6 + 4.2); ctx.stroke();
    ctx.font = K.font.ui(24); ctx.textAlign = 'center'; ctx.fillStyle = '#dfe4f1'; ctx.fillText(P.finding || 'Finding a car...', fx, by + 106);
    ctx.globalAlpha = 1;
  }
  if (fail > 0) {
    const ep = Math.min(1.08, K.popIn(t, tFail, 0.4));
    ctx.save(); ctx.translate(fx, by + 48); ctx.scale(ep, ep);
    ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fillStyle = RED; ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(10, 10); ctx.moveTo(10, -10); ctx.lineTo(-10, 10); ctx.stroke();
    ctx.restore();
    ctx.globalAlpha = fail; ctx.font = K.font.ui(25); ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff';
    ctx.fillText(P.error || "Can't order a ride", fx, by + 106); ctx.globalAlpha = 1;
  }
  ctx.restore();
  ctx.restore();

  // app tiles above the person
  tiles.forEach((tile, i) => {
    const p = K.popIn(t, tile.t, 0.45);
    if (p <= 0) return;
    const tx = 185 + i * 200, ty = 525, s = 150;
    const off = smooth((t - tile.t - 0.7) / 0.5);
    ctx.save(); ctx.translate(tx, ty); ctx.scale(Math.min(1.06, p), Math.min(1.06, p));
    H.roundRect(ctx, -s / 2, -s / 2, s, s, 34); ctx.fillStyle = H.mixHex('#4b5bd0', '#3b4260', off); ctx.fill();
    ctx.strokeStyle = H.mixHex('#ffffff', '#8a90a8', off); ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 8; ctx.lineCap = 'round';
    if (tile.kind === 'music') {
      ctx.beginPath(); ctx.moveTo(-10, 30); ctx.lineTo(-10, -32); ctx.lineTo(28, -40); ctx.lineTo(28, 20); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-22, 32, 15, 11, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(16, 22, 15, 11, -0.3, 0, Math.PI * 2); ctx.fill();
    } else {
      for (let k = -3; k <= 3; k++) { const h = (14 + 26 * Math.abs(Math.cos(k * 0.9))) * (1 - 0.7 * off) * (1 + 0.25 * Math.sin(t * 8 + k) * (1 - off)); ctx.beginPath(); ctx.moveTo(k * 13, -h); ctx.lineTo(k * 13, h); ctx.stroke(); }
    }
    if (off > 0) {
      const xp = K.popIn(t, tile.t + 0.7, 0.4);
      ctx.save(); ctx.translate(48, -48); ctx.scale(xp, xp);
      ctx.beginPath(); ctx.arc(0, 0, 28, 0, Math.PI * 2); ctx.fillStyle = RED; ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(10, 10); ctx.moveTo(10, -10); ctx.lineTo(-10, 10); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    K.drawLabel(ctx, tx, ty + s / 2 + 58, Math.min(1, p), { text: tile.text, size: 24 });
  });
}
