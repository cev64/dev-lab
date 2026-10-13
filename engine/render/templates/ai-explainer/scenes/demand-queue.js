// Scene "demand-queue" (full frame). Server hall: a big balance scale. Order slips pile onto the DEMAND pan (from
// demandCue) while only a few chip crates arrive on the SUPPLY pan (supplyCue); the beam tips towards demand with a
// wobble and settles. A robot technician carries one more crate. At unknownCue a calendar pill with "?" pops up, at
// adviceCue a small "Not financial advice" pill.
// params: demand, supply (pan labels), unknown (question pill), advice (pill), cues: demandCue (15 %), supplyCue (45 %),
//         unknownCue (70 %), adviceCue (88 %)
// Fits: "demand still outruns supply" / shortage / backlog beats.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent;
  const cue = (w, fb) => { const v = w != null ? info.timeOf(w) : null; return v != null ? v : fb; };
  const dAt = cue(P.demandCue, D * 0.15), sAt = cue(P.supplyCue, D * 0.45), uAt = cue(P.unknownCue, D * 0.7), aAt = cue(P.adviceCue, D * 0.88);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
  K.world.serverHall(ctx, { t, activity: 0.8 });
  // dark floor plate so the scale reads
  ctx.save(); ctx.translate(487, 1035); ctx.scale(1, 0.18); K.glow(ctx, 0, 0, 420, '#000000', 0.0); ctx.beginPath(); ctx.arc(0, 0, 430, 0, Math.PI * 2); ctx.fillStyle = 'rgba(4,6,14,0.7)'; ctx.fill(); ctx.restore();

  // how many slips / crates are on the pans
  const slips = Math.floor(clamp((t - dAt) / 0.22, 0, 12));
  const crates = Math.floor(clamp((t - sAt) / 0.9, 0, 3)) + (t > sAt ? 1 : 0);
  const imbalance = clamp((slips * 1.0 - crates * 1.5) / 10, -0.2, 1);
  const tiltTarget = 0.2 * imbalance;
  const lastChange = Math.max(dAt + slips * 0.22, sAt);
  const wob = Math.sin((t - lastChange) * 9) * 0.03 * Math.exp(-Math.max(0, t - lastChange) * 2.5);
  const ang = t < dAt ? Math.sin(t * 1.2) * 0.01 : tiltTarget + wob;

  // stand
  const CX = 487, CY = 600;
  ctx.fillStyle = '#2b3152'; H.roundRect(ctx, CX - 14, CY, 28, 420, 8); ctx.fill();
  H.roundRect(ctx, CX - 120, 1010, 240, 28, 12); ctx.fillStyle = '#3a4270'; ctx.fill();
  ctx.beginPath(); ctx.arc(CX, CY, 22, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
  // beam (positive angle = left side down: demand on the left)
  const L = 265;
  const lx = CX - Math.cos(ang) * L, ly = CY + Math.sin(ang) * L;
  const rx = CX + Math.cos(ang) * L, ry = CY - Math.sin(ang) * L;
  ctx.strokeStyle = '#c9d0ea'; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke();

  const pan = (x, y, label, side) => {
    ctx.strokeStyle = 'rgba(201,208,234,0.8)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 100, y + 190); ctx.moveTo(x, y); ctx.lineTo(x + 100, y + 190); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y + 196, 118, 22, 0, 0, Math.PI * 2); ctx.fillStyle = '#8d97c2'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(x, y + 190, 118, 18, 0, 0, Math.PI * 2); ctx.fillStyle = '#b6bfe0'; ctx.fill();
    K.drawLabel(ctx, x, y + 290, 1, { text: label, size: 30, accent: side === 'demand', dot: side !== 'demand' });
  };
  // DEMAND pan: order slips piling up
  pan(lx, ly, P.demand || 'DEMAND', 'demand');
  for (let i = 0; i < slips; i++) {
    const land = K.phase(t, dAt + i * 0.22, dAt + i * 0.22 + 0.25);
    const x = lx - 64 + (i % 3) * 64 + (H.hash(i, 4) - 0.5) * 16, y = ly + 186 - Math.floor(i / 3) * 34 - (1 - land) * 120;
    ctx.save(); ctx.translate(x, y); ctx.rotate((H.hash(i, 9) - 0.5) * 0.3);
    H.roundRect(ctx, -32, -28, 64, 28, 5); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = '#9aa3c0'; ctx.fillRect(-26, -22, 40, 4); ctx.fillRect(-26, -13, 30, 4);
    ctx.fillStyle = ACC; ctx.fillRect(18, -23, 10, 10);
    ctx.restore();
  }
  // SUPPLY pan: a few chip crates
  pan(rx, ry, P.supply || 'SUPPLY', 'supply');
  for (let i = 0; i < crates; i++) {
    const land = K.phase(t, sAt + i * 0.9, sAt + i * 0.9 + 0.3);
    const x = i === 3 ? rx : rx - 54 + i * 54, y = ry + 186 - (i === 3 ? 48 : 0) - (1 - land) * 120;
    ctx.save(); ctx.translate(x, y);
    H.roundRect(ctx, -26, -48, 52, 48, 6); ctx.fillStyle = '#7a5a3c'; ctx.fill();
    ctx.fillStyle = '#5c422b'; ctx.fillRect(-26, -26, 52, 4);
    H.roundRect(ctx, -12, -42, 24, 14, 3); ctx.fillStyle = '#1b1f33'; ctx.fill(); ctx.fillStyle = ACC; ctx.fillRect(-5, -38, 10, 6);
    ctx.restore();
  }
  // robot technician walking in with one more crate (towards supply)
  const rwalk = clamp((t - sAt + 0.5) / 3.5);
  const rbx = lerp(1060, 860, H.easeOutCubic(rwalk));
  K.drawRobot(ctx, rbx, 1060, 0.78, { t, state: t > uAt ? 'thinking' : 'working', flip: true, seed: 2 });
  ctx.save(); ctx.translate(rbx - 10, 1000); H.roundRect(ctx, -30, -44, 60, 44, 6); ctx.fillStyle = '#7a5a3c'; ctx.fill(); ctx.restore();
  ctx.restore(); // camera

  // overlays
  const up = K.popIn(t, uAt, 0.5);
  if (up > 0) {
    ctx.save(); ctx.translate(487, 455); ctx.scale(up, up);
    const q = String(P.unknown || 'Will it last? Unknown');
    ctx.font = K.font.bold(36); const w = Math.min(800, ctx.measureText(q).width + 140);
    H.roundRect(ctx, -w / 2, -42, w, 84, 42); ctx.fillStyle = 'rgba(8,10,22,0.9)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(ACC, 0.7); ctx.stroke();
    // little calendar with "?"
    H.roundRect(ctx, -w / 2 + 22, -26, 52, 52, 8); ctx.fillStyle = '#f2f4fa'; ctx.fill(); ctx.fillStyle = '#e8786a'; ctx.fillRect(-w / 2 + 22, -26, 52, 14);
    ctx.fillStyle = '#1a1d33'; ctx.font = K.font.display(30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', -w / 2 + 48, 8);
    ctx.fillStyle = '#ffffff'; const ft = H.fitText(ctx, q, 'bold', 36, 24, w - 120); ctx.font = ft.font; ctx.fillText(q, 30, 2);
    ctx.restore();
  }
  const ap = K.popIn(t, aAt, 0.4);
  if (ap > 0) K.drawLabel(ctx, 487, 1000, ap, { text: P.advice || 'Not financial advice', size: 28, dot: true });
}
