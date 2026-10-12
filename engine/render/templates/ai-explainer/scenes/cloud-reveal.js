// Scene "cloud-reveal" (full frame). Night sky over the horizon: a big soft cartoon cloud with a "THE CLOUD" sign
// floats; at the reveal cue it splits and drifts apart, uncovering a real data-center building (cut-away front with
// server racks and blinking chips) standing on the ground; at the chips cue a row of chip tiles pops up from the racks
// and a pill lands. Ends settled with the building humming.
// Fits: "the cloud is really buildings", AI's physical footprint, energy/water/data-center explainers.
// params (all optional): cloud ("THE CLOUD"), reveal ("Buildings full of chips"), cues: revealCue (35 %), chipsCue (75 %)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth } = H;
  const D = info.duration, ACC = info.accent;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tRev = at(P.revealCue, D * 0.35), tChips = at(P.chipsCue, D * 0.75);
  const open = K.phase(t, tRev, tRev + 1.1);

  // sky + ground
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#0a1030'); g.addColorStop(0.5, '#27306a'); g.addColorStop(0.56, '#3b3a72'); g.addColorStop(1, '#070912');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 40; i++) {
    const sx = H.hash(i, 1) * 1080, sy = 300 + H.hash(i, 2) * 600, tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i));
    ctx.globalAlpha = 0.5 * tw; ctx.fillStyle = '#ffffff'; ctx.fillRect(sx, sy, 3, 3);
  }
  ctx.globalAlpha = 1;
  const gy = 1010;
  ctx.fillStyle = '#141a36'; ctx.fillRect(0, gy, 1080, 910);
  ctx.fillStyle = 'rgba(160,190,255,0.14)'; ctx.fillRect(0, gy, 1080, 4);

  const z = lerp(1.0, 1.06, K.phase(t, 0, D));
  ctx.save(); ctx.translate(487, 760); ctx.scale(z, z); ctx.translate(-487, -760);

  // the building (behind the cloud), cut-away front
  const bx = 487, bw = 600, bh = 360, top = gy - bh;
  const reveal = smooth((t - tRev + 0.2) / 0.8);
  if (reveal > 0) {
    ctx.save(); ctx.globalAlpha = reveal;
    K.shadow(ctx, bx, gy, 680);
    K.glow(ctx, bx, gy - 200, 420, ACC, 0.16);
    H.roundRect(ctx, bx - bw / 2, top, bw, bh, 18); ctx.fillStyle = '#dfe4f1'; ctx.fill();
    H.roundRect(ctx, bx - bw / 2, top, bw, 22, 10); ctx.fillStyle = '#f5f7fc'; ctx.fill();
    // roof units
    for (let i = 0; i < 4; i++) { H.roundRect(ctx, bx - 250 + i * 135, top - 34, 90, 36, 8); ctx.fillStyle = '#b9c1d6'; ctx.fill(); }
    // cut-away interior
    H.roundRect(ctx, bx - bw / 2 + 26, top + 44, bw - 52, bh - 70, 12); ctx.fillStyle = '#0d1126'; ctx.fill();
    ctx.restore();
    // racks inside
    for (let r = 0; r < 4; r++) {
      const rx = bx - 205 + r * 137;
      ctx.save(); ctx.globalAlpha = reveal;
      K.drawServerRack(ctx, rx, gy - 30, 1.2 * Math.min(1, 0.6 + 0.4 * reveal), { t: t + r, activity: 0.85, shadow: false });
      ctx.restore();
    }
  }

  // chips popping up
  const chipsK = K.stagger([0, 1, 2, 3, 4], t, 0.12, tChips);
  chipsK.forEach((lt, i) => {
    const p = K.popIn(lt, 0, 0.45);
    if (p <= 0) return;
    const cx = bx - 240 + i * 120, cy = top - 75 + K.bob(t, 6, 0.6, i * 0.2);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(Math.min(1.1, p), Math.min(1.1, p));
    K.glow(ctx, 0, 0, 70, ACC, 0.5);
    H.roundRect(ctx, -36, -36, 72, 72, 10); ctx.fillStyle = '#2a2f45'; ctx.fill();
    H.roundRect(ctx, -20, -20, 40, 40, 6); ctx.fillStyle = ACC; ctx.fill();
    ctx.strokeStyle = '#b9c1d6'; ctx.lineWidth = 4;
    for (let k = -1; k <= 1; k++) for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(k * 18, s * 36); ctx.lineTo(k * 18, s * 48); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(s * 36, k * 18); ctx.lineTo(s * 48, k * 18); ctx.stroke();
    }
    ctx.restore();
  });

  // the cloud: two halves that drift apart and fade
  const cloudY = 760 + K.bob(t, 8, 0.25);
  for (const side of [-1, 1]) {
    const dx = side * open * 520, a = 1 - smooth((open - 0.4) / 0.6);
    if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(dx, -open * 60);
    const puffs = side < 0 ? [[300, 60, 120], [400, -10, 150], [230, 120, 90], [470, 100, 110]] : [[580, -30, 150], [690, 50, 130], [760, 120, 90], [510, 110, 110]];
    puffs.forEach(([px, py, r]) => { ctx.beginPath(); ctx.arc(px, cloudY + py, r, 0, Math.PI * 2); ctx.fillStyle = '#e9edf8'; ctx.fill(); });
    puffs.forEach(([px, py, r]) => { ctx.beginPath(); ctx.arc(px, cloudY + py + r * 0.35, r * 0.75, 0, Math.PI); ctx.fillStyle = '#c3cbe0'; ctx.fill(); });
    ctx.restore();
  }
  // cloud sign, before the split
  const signA = 1 - smooth((t - tRev) / 0.3);
  if (signA > 0) {
    const sp = Math.min(1.06, K.popIn(t, 0.2, 0.5));
    ctx.save(); ctx.globalAlpha = signA; ctx.translate(487, cloudY + 70); ctx.scale(sp, sp);
    ctx.font = K.font.display(76); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#2a2f45';
    ctx.fillText(P.cloud || 'THE CLOUD', 0, 0); ctx.restore();
  }
  ctx.restore();
  // reveal pill (top slot)
  const lp = K.popIn(t, tChips + 0.2, 0.45);
  if (lp > 0) K.drawLabel(ctx, 487, 500, Math.min(1.06, lp), { text: P.reveal || 'Buildings full of chips', size: 34, accent: true });
}
