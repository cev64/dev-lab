// Scene "blocked-street" (full frame, 1 beat ~7-10 s). Dusk street with three generic shop fronts side by side (a
// columned bank, a shop with an awning, an airline office with a plane-tail window), each with a text name pill (no
// logos). Small agent robots walk to the first two doors on their cues and bounce off as the doors shut with a padlock;
// on the last cue the third front's doors shut too, a spotlight hits it and a big "<first>" ribbon lands above it.
// Fits: "X isn't alone: banks and stores also block AI agents", "first airline / first company to do Y".
// params: shops [{name, sign, cue}] (3; kinds in order bank | shop | airline), first ("First to say it"), firstCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const danger = '#ff6b5e';
  const shops = (P.shops || [{ name: 'Bank', sign: 'BANK' }, { name: 'Store', sign: 'SHOP' }, { name: 'Airline', sign: 'AIRLINE' }]).slice(0, 3);
  const cue = shops.map((s, i) => at(s.cue, D * (0.2 + i * 0.25)) - 0.2);
  const tFirst = at(P.firstCue, D * 0.7) - 0.2;
  const gy = 1000;

  K.world.city(ctx, { t, time: 'dusk', groundY: gy });
  const cx = [225, 487, 740], W = 240, top = 640;

  shops.forEach((s, i) => {
    const x = cx[i], kind = i;
    // spotlight on the airline after firstCue
    if (i === 2 && t > tFirst) {
      const sp = smooth((t - tFirst) / 0.5);
      ctx.save(); ctx.globalAlpha = 0.28 * sp; ctx.fillStyle = '#fff3c4';
      ctx.beginPath(); ctx.moveTo(x - 40, 380); ctx.lineTo(x + 40, 380); ctx.lineTo(x + W / 2 + 30, gy + 30); ctx.lineTo(x - W / 2 - 30, gy + 30); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    const body = ['#5a6688', '#7a3e4e', '#2f4f7a'][kind];
    K.shadow(ctx, x, gy + 4, W + 20);
    roundRect(ctx, x - W / 2, top, W, gy - top, 10); ctx.fillStyle = body; ctx.fill();
    ctx.fillStyle = H.mixHex(body, '#000000', 0.25); ctx.fillRect(x - W / 2, top, W, 16);
    if (kind === 0) { // columns + pediment
      ctx.fillStyle = '#d9d2c4'; ctx.beginPath(); ctx.moveTo(x - W / 2 - 8, top + 2); ctx.lineTo(x, top - 50); ctx.lineTo(x + W / 2 + 8, top + 2); ctx.closePath(); ctx.fill();
      for (const dx of [-100, -60, 60, 100]) { roundRect(ctx, x + dx - 10, top + 70, 20, gy - top - 80, 6); ctx.fill(); }
    } else if (kind === 1) { // awning stripes + window
      for (let k = 0; k < 6; k++) { ctx.fillStyle = k % 2 ? '#f4f1e8' : '#e8786a'; ctx.fillRect(x - W / 2 + k * (W / 6), top + 50, W / 6, 40); }
      roundRect(ctx, x - W / 2 + 14, top + 110, 60, 110, 6); ctx.fillStyle = 'rgba(255,217,138,0.8)'; ctx.fill();
      roundRect(ctx, x + W / 2 - 74, top + 110, 60, 110, 6); ctx.fill();
    } else { // airline: window with a tail
      roundRect(ctx, x + 50, top + 60, 66, 120, 8); ctx.fillStyle = '#8fb2e0'; ctx.fill();
      ctx.fillStyle = '#e8edf8'; ctx.beginPath(); ctx.moveTo(x + 64, top + 180); ctx.lineTo(x + 86, top + 100); ctx.lineTo(x + 104, top + 100); ctx.lineTo(x + 104, top + 180); ctx.fill();
      roundRect(ctx, x - 116, top + 60, 66, 120, 8); ctx.fillStyle = 'rgba(255,217,138,0.8)'; ctx.fill();
    }
    // sign plate (generic word)
    roundRect(ctx, x - 70, top + 18, 140, 38, 8); ctx.fillStyle = '#15182e'; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('bold', 22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s.sign || '', x, top + 38);
    // doors: open (glow) until the cue, then slide shut
    const shut = smooth((t - cue[i] - 0.35) / 0.35);
    const dX0 = x - 55, dW = 110, dY = gy - 170;
    roundRect(ctx, dX0, dY, dW, 170, 6); ctx.fillStyle = '#fff1c4'; ctx.fill();
    ctx.fillStyle = H.mixHex(body, '#000000', 0.45);
    ctx.fillRect(dX0, dY, dW / 2 * shut, 170); ctx.fillRect(dX0 + dW - dW / 2 * shut, dY, dW / 2 * shut, 170);
    if (shut > 0.9) { ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fillRect(x - 1, dY, 2, 170); }
    const lk = K.popIn(t, cue[i] + 0.6, 0.35);
    if (lk > 0) K.drawLock(ctx, x, dY + 110, Math.min(1.05, lk) * 0.55, { open: 0 });
    // name pill
    const np = K.popIn(t, 0.15 + i * 0.25, 0.4);
    K.drawLabel(ctx, x, top - (kind === 0 ? 62 : 14), Math.min(1.05, np), { text: s.name, size: 22, dot: i === 2 });
    // robot walking to the door, bouncing off (first two on their cues; the third on firstCue)
    const tc = cue[i];
    const walk = smooth((t - tc + 1.2) / 1.1), bounce = smooth((t - tc - 0.4) / 0.5);
    const rx = lerp(x - 170, x - 20, walk) - bounce * 70 + K.shake(t, tc + 0.35, 0.35, 5);
    if (walk > 0) {
      K.drawRobot(ctx, rx, gy + 30, 0.62, { t, state: bounce > 0.2 ? 'thinking' : 'happy', seed: 3 + i });
    }
  });

  // big ribbon over the airline
  const rp = K.popIn(t, tFirst + 0.3, 0.5);
  if (rp > 0) {
    ctx.save(); ctx.translate(520, 500); const s = Math.min(1.05, rp); ctx.scale(s, s); ctx.rotate(-0.03);
    const f = H.fitText(ctx, P.first || 'First to say it', 'display', 38, 22, 520);
    ctx.font = f.font; const w = ctx.measureText(f.text).width + 60;
    ctx.fillStyle = H.mixHex(ACC, '#000000', 0.35);
    ctx.beginPath(); ctx.moveTo(-w / 2 - 30, -10); ctx.lineTo(-w / 2 + 6, -10); ctx.lineTo(-w / 2 + 6, 46); ctx.lineTo(-w / 2 - 30, 46); ctx.lineTo(-w / 2 - 14, 18); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(w / 2 + 30, -10); ctx.lineTo(w / 2 - 6, -10); ctx.lineTo(w / 2 - 6, 46); ctx.lineTo(w / 2 + 30, 46); ctx.lineTo(w / 2 + 14, 18); ctx.closePath(); ctx.fill();
    roundRect(ctx, -w / 2, -34, w, 70, 12); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = '#15182e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 3);
    ctx.restore();
  }
}
