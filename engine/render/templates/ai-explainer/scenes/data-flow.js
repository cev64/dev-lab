// Scene "data-flow": packets flow from labelled sources along curved paths into a glowing server rack.
// The flow ramps up over the first half of the beat, then holds steady (settled state).
// params (optional): sources  ["Phones", "Apps", "Sensors", "Cameras"] (2-5)
//                    label    text under the rack, e.g. "Data center"
export default function draw(ctx, t, info) {
  const H = info.helpers, P = info.params || {};
  const { clamp, smooth, easeOutCubic, roundRect, rgba, hash } = H;
  const D = info.duration, ACC = info.accent, W = info.width, HH = info.height;
  const sources = (P.sources || ['Phones', 'Apps', 'Sensors', 'Cameras']).slice(0, 5);
  const n = sources.length;

  // ---- rack geometry
  const RX = 590, RW = 190, RY = 52, RH = 330, UNITS = 7;
  const inlet = (i) => RY + 70 + (RH - 140) * (n > 1 ? i / (n - 1) : 0.5);
  const ramp = (s) => 0.3 + 0.7 * smooth(s / Math.max(0.5, D * 0.5)); // packet density over time
  const activity = ramp(t) * (0.75 + 0.25 * info.env);

  // ---- sources + curved paths (sampled cubic beziers)
  const sy = (i) => 70 + (HH - 140) * (n > 1 ? i / (n - 1) : 0.5);
  const paths = sources.map((label, i) => {
    const fit = H.fitText(ctx, label, 'ui', 26, 18, 170);
    ctx.font = fit.font;
    const lw = ctx.measureText(fit.text).width;
    const x0 = 64 + 26 + lw + 16, y0 = sy(i), x1 = RX - 6, y1 = inlet(i);
    const cx = (x0 + x1) / 2, pts = [];
    for (let k = 0; k <= 48; k++) {
      const u = k / 48, a = 1 - u;
      pts.push([a * a * a * x0 + 3 * a * a * u * cx + 3 * a * u * u * cx + u * u * u * x1,
        a * a * a * y0 + 3 * a * a * u * y0 + 3 * a * u * u * y1 + u * u * u * y1]);
    }
    return { label: fit, y: y0, pts };
  });
  const at = (pts, u) => {
    const f = clamp(u) * (pts.length - 1), k = Math.min(pts.length - 2, Math.floor(f)), r = f - k;
    return [pts[k][0] + (pts[k + 1][0] - pts[k][0]) * r, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * r];
  };

  // rack glow (behind everything)
  H.glow(ctx, RX + RW / 2, RY + RH / 2, 260, ACC, 0.10 + 0.22 * activity * smooth(t / 0.8));

  // paths draw in, staggered
  paths.forEach((p, i) => {
    const k = easeOutCubic((t - 0.1 - i * 0.08) / 0.8);
    if (k <= 0) return;
    const m = Math.max(1, Math.round(k * (p.pts.length - 1)));
    ctx.beginPath(); ctx.moveTo(p.pts[0][0], p.pts[0][1]);
    for (let j = 1; j <= m; j++) ctx.lineTo(p.pts[j][0], p.pts[j][1]);
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.lineCap = 'round'; ctx.stroke();
  });

  // source nodes + labels
  paths.forEach((p, i) => {
    const k = easeOutCubic((t - i * 0.08) / 0.4);
    ctx.save();
    ctx.globalAlpha *= k;
    ctx.beginPath(); ctx.arc(64, p.y, 13, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(64, p.y, 5, 0, Math.PI * 2); ctx.fillStyle = info.ink; ctx.fill();
    ctx.font = p.label.font; ctx.fillStyle = info.ink; ctx.textBaseline = 'middle';
    ctx.fillText(p.label.text, 64 + 26 - (1 - k) * 12, p.y + 1);
    ctx.restore();
  });

  // packets: spawn on a fixed grid per path, kept or skipped by a hash vs the density ramp (deterministic)
  const GAP = 0.42, TRAVEL = 1.7;
  const flash = new Array(n).fill(0);
  paths.forEach((p, i) => {
    const off = hash(i, 7) * GAP;
    const kMax = Math.floor((t - off) / GAP), kMin = Math.max(0, Math.floor((t - off - TRAVEL - 0.4) / GAP));
    for (let k = kMin; k <= kMax; k++) {
      const s = off + k * GAP + 0.6; // first packets leave once the paths are drawn
      if (hash(i * 131 + 3, k) > ramp(s)) continue;
      const u = (t - s) / TRAVEL;
      if (u < 0) continue;
      if (u > 1) { flash[i] = Math.max(flash[i], 1 - (u - 1) * TRAVEL / 0.35); continue; }
      const e = u * u * (3 - 2 * u) * 0.35 + u * 0.65; // slight ease along the path
      for (let j = 3; j >= 0; j--) { // short tail
        const [x, y] = at(p.pts, e - j * 0.018);
        ctx.globalAlpha = (1 - j * 0.24) * smooth(u / 0.08) * (1 - smooth((u - 0.92) / 0.08));
        if (j === 0) H.glow(ctx, x, y, 22, ACC, 0.9 * ctx.globalAlpha);
        ctx.beginPath(); ctx.arc(x, y, j === 0 ? 5 : 3.5 - j * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = j === 0 ? '#ffffff' : ACC; ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  });

  // ---- rack
  const rk = easeOutCubic(t / 0.6);
  ctx.save();
  ctx.globalAlpha *= rk;
  ctx.translate(0, (1 - rk) * 20);
  roundRect(ctx, RX, RY, RW, RH, 18);
  const g = ctx.createLinearGradient(0, RY, 0, RY + RH);
  g.addColorStop(0, '#1a1d2b'); g.addColorStop(1, '#0d0f18');
  ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = 2.5; ctx.strokeStyle = rgba(ACC, 0.25 + 0.35 * activity); ctx.stroke();
  const uh = (RH - 36) / UNITS;
  for (let u = 0; u < UNITS; u++) {
    const y = RY + 18 + u * uh;
    roundRect(ctx, RX + 14, y + 4, RW - 28, uh - 8, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 1.5; ctx.stroke();
    // vents
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    for (let v = 0; v < 5; v++) ctx.fillRect(RX + 28 + v * 14, y + uh / 2 - 6, 6, 12);
    // LEDs blink with activity (stepped clock -> deterministic)
    for (let l = 0; l < 3; l++) {
      const on = hash(u * 3 + l, Math.floor(t * 7 + u * 0.37 + l * 0.61)) < 0.25 + 0.65 * activity;
      const lx = RX + RW - 36 - l * 18, ly = y + uh / 2;
      if (on) H.glow(ctx, lx, ly, 14, ACC, 0.7);
      ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2);
      ctx.fillStyle = on ? ACC : 'rgba(255,255,255,0.18)'; ctx.fill();
    }
  }
  ctx.restore();
  // inlet flashes where packets arrive
  flash.forEach((f, i) => { if (f > 0) H.glow(ctx, RX, inlet(i), 40, ACC, 0.8 * f); });

  // label under the rack
  if (P.label) {
    const fit = H.fitText(ctx, String(P.label).toUpperCase(), 'ui', 22, 16, RW + 40);
    ctx.save(); ctx.globalAlpha *= smooth((t - 0.4) / 0.4);
    ctx.font = fit.font; ctx.letterSpacing = '2px'; ctx.textAlign = 'center'; ctx.fillStyle = info.muted;
    ctx.fillText(fit.text, RX + RW / 2, RY + RH + 44);
    ctx.restore();
  }
}
