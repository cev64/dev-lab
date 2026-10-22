// Scene "beta-gate" (full frame, 1 beat, ~6-9 s; caveat). Dusk plaza: on the left a glowing gateway arch with a name
// plate gets a swinging "BETA" tag on betaCue; two cartoon developers with laptops walk through it under a "first" pill.
// On the right a big phone-style settings card with a robot avatar and a toggle; on offCue the toggle flips OFF, the
// avatar's eyes go dark and an "Off any time" pill pops. Ends settled.
// Fits: "it starts as a beta / invite-only for developers", "you can switch it off anytime", rollout caveats.
// params: gate ("Agent Gateway"), beta ("BETA"), first ("Developers first"), card ("Agent Profile"), off ("Off any time"),
//         cues ("word#n"; without them fractions): betaCue, firstCue, offCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tBeta = at(P.betaCue, D * 0.18) - 0.2;
  const tFirst = at(P.firstCue, D * 0.3) - 0.2;
  const tOff = at(P.offCue, D * 0.75) - 0.15;
  const GREEN = '#3fbf7f';

  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 500, y: 760 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });
  const feet = 1030;

  // ---- gateway arch (left) ----
  const ax0 = 110, ax1 = 430, topY = 700;
  K.glow(ctx, (ax0 + ax1) / 2, 860, 230, ACC, 0.18 + 0.04 * Math.sin(t * 3));
  ctx.save(); ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.strokeStyle = ACC; ctx.shadowColor = ACC; ctx.shadowBlur = 22;
  ctx.beginPath(); ctx.moveTo(ax0, 1005); ctx.lineTo(ax0, topY + 40); ctx.quadraticCurveTo(ax0, topY, ax0 + 40, topY);
  ctx.lineTo(ax1 - 40, topY); ctx.quadraticCurveTo(ax1, topY, ax1, topY + 40); ctx.lineTo(ax1, 1005); ctx.stroke(); ctx.restore();
  for (let i = 0; i < 8; i++) { const u = ((i / 8) + t * 0.35) % 1; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.arc(lerp(ax0, ax1, u), topY, 4, 0, Math.PI * 2); ctx.fill(); }
  K.drawLabel(ctx, (ax0 + ax1) / 2, topY - 14, Math.min(1.05, K.popIn(t, 0.1, 0.4)), { text: P.gate || 'Agent Gateway', size: 28, accent: true });
  // swinging BETA tag hanging from the arch
  const bk = K.popIn(t, tBeta, 0.45);
  if (bk > 0) {
    const sw = 0.35 * Math.exp(-2.2 * Math.max(0, t - tBeta)) * Math.sin((t - tBeta) * 8);
    ctx.save(); ctx.translate(ax1 - 70, topY + 8); ctx.rotate(sw); ctx.scale(Math.min(1.05, bk), Math.min(1.05, bk));
    ctx.strokeStyle = '#e8edf8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 14); ctx.stroke();
    roundRect(ctx, -62, 14, 124, 56, 10); ctx.fillStyle = '#ff6b5e'; ctx.fill();
    ctx.font = H.font('display', 32); ctx.fillStyle = '#2a0f0c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.beta || 'BETA', 0, 44);
    ctx.restore();
  }
  // developers with laptops walk through
  for (let i = 0; i < 2; i++) {
    const t0 = tFirst - 0.4 + i * 0.7;
    const u = smooth(clamp((t - t0) / 2.2));
    const x = lerp(-60 - i * 40, 230 + i * 130, u);
    if (t < t0) continue;
    K.drawPerson(ctx, x, feet, 1.0, { t: t + i, pose: 'stand', walk: u < 1 ? t : undefined, mood: 'happy', skin: i ? 4 : 2, hair: i ? 1 : 3, shirt: i ? 0 : 4, hairStyle: i ? 'bun' : 'short', seed: 20 + i, look: 0.4 });
    K.drawLaptop(ctx, x + 36, 915, 0.3, { t, screen: 'code' });
  }
  if (t > tFirst) K.drawLabel(ctx, 330, 600, Math.min(1.05, K.popIn(t, tFirst, 0.4)), { text: P.first || 'Developers first', size: 28 });

  // ---- settings card with toggle (right) ----
  const cx = 705, cy = 790, CW = 360, CH = 300;
  const ck = K.popIn(t, 0.3, 0.5);
  if (ck > 0) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(Math.min(1.03, ck), Math.min(1.03, ck));
    roundRect(ctx, -CW / 2 - 12, -CH / 2 - 12, CW + 24, CH + 24, 36); ctx.fillStyle = '#1c2033'; ctx.fill();
    roundRect(ctx, -CW / 2, -CH / 2, CW, CH, 26); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    const off = smooth((t - tOff) / 0.35);
    // avatar
    const ay = -40;
    roundRect(ctx, -60, ay - 50, 120, 96, 28); ctx.fillStyle = '#e9edf6'; ctx.fill(); ctx.strokeStyle = '#9aa3bd'; ctx.lineWidth = 3; ctx.stroke();
    roundRect(ctx, -44, ay - 30, 88, 44, 16); ctx.fillStyle = '#1b1f33'; ctx.fill();
    const blink = Math.sin(t * 2.1) > 0.96 ? 0.3 : 1;
    ctx.fillStyle = rgba(ACC, 1 - 0.85 * off);
    ctx.beginPath(); ctx.ellipse(-17, ay - 8, 8, 8 * blink, 0, 0, Math.PI * 2); ctx.ellipse(17, ay - 8, 8, 8 * blink, 0, 0, Math.PI * 2); ctx.fill();
    // toggle row
    ctx.fillStyle = '#283152'; ctx.font = H.font('ui', 28); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.card || 'Agent Profile', -CW / 2 + 28, 90);
    const sx = CW / 2 - 70;
    roundRect(ctx, sx - 42, 66, 84, 50, 25); ctx.fillStyle = off > 0.5 ? '#c3c9da' : GREEN; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(lerp(sx + 17, sx - 17, off), 91, 20, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // tapping hand
    const hin = smooth((t - (tOff - 1.0)) / 0.8), press = clamp(1 - Math.abs(t - tOff) / 0.15);
    const hout = smooth((t - tOff - 0.6) / 0.5);
    if (t > tOff - 1.0 && hout < 1) {
      const hx = cx + lerp(260, 125, hin) + hout * 140, hy = cy + lerp(260, 120, hin) + 8 * press + hout * 120;
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.35);
      ctx.fillStyle = '#eab894'; ctx.strokeStyle = '#7a4a30'; ctx.lineWidth = 3;
      roundRect(ctx, -11, -10, 22, 50, 11); ctx.fill(); ctx.stroke();
      roundRect(ctx, -22, 26, 56, 60, 18); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    if (t > tOff + 0.2) K.drawLabel(ctx, cx, 610, Math.min(1.05, K.popIn(t, tOff + 0.2, 0.4)), { text: P.off || 'Off any time', size: 28, accent: true });
  }
}
