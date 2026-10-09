/* Style "horizon": a glowing perspective grid racing toward the viewer, a striped "core" disc on
 * the horizon that pulses with the voice, and a mirrored waveform skyline built from the envelope. */
(function () {
  const K = window.CLIPKIT;
  const { clamp, fract, drawGlow, glow, rgba } = K;

  K.registerStyle({
    name: 'horizon',
    caption: 'montserratMixed',
    hook: 'montserrat',
    palettes: [
      { bg0: '#02030a', bg1: '#0d0726', grid: '#3df0ff', sun1: '#ff3fb4', sun2: '#ffb347', bars: '#3df0ff', accent: '#ffe14a', accent2: '#3df0ff' },
      { bg0: '#010806', bg1: '#04201a', grid: '#2fffa8', sun1: '#2fd8ff', sun2: '#b7ff5a', bars: '#2fffa8', accent: '#c4ff3a', accent2: '#2fffa8' },
      { bg0: '#05020a', bg1: '#1d0830', grid: '#b48cff', sun1: '#ff5f6d', sun2: '#ffc371', bars: '#ff7ad9', accent: '#ffe14a', accent2: '#b48cff' },
    ],
    init(S) {
      const r = S.rng;
      const stars = [];
      for (let i = 0; i < 180; i++) stars.push({ x: r() * S.W, y: r() * 900, s: 0.6 + r() * 1.8, ph: r() * 6.28 });
      S.hz = { stars, HZ: 1000, VX: 488 };
    },
    draw(ctx, S, t) {
      const { W, H, pal, A } = S;
      const env = A.env(t), cum = A.cum(t);
      const { HZ, VX, stars } = S.hz;
      // sky
      const g = ctx.createLinearGradient(0, 0, 0, HZ);
      g.addColorStop(0, pal.bg0); g.addColorStop(1, pal.bg1);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, HZ);
      const g2 = ctx.createLinearGradient(0, HZ, 0, H);
      g2.addColorStop(0, pal.bg1); g2.addColorStop(0.25, pal.bg0); g2.addColorStop(1, '#000000');
      ctx.fillStyle = g2; ctx.fillRect(0, HZ, W, H - HZ);
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = '#ffffff';
      for (const s of stars) { ctx.globalAlpha = 0.15 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.7 + s.ph)) * (1 - s.y / 1100); ctx.fillRect(s.x, s.y, s.s, s.s); }

      // core disc on the horizon: stripes scroll down, radius breathes
      const R = 250 + 26 * env, cy = HZ - 170;
      drawGlow(ctx, glow(pal.sun1, 0.25), VX, cy, R * 2.6, 0.35 + 0.35 * env);
      ctx.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.beginPath(); ctx.arc(VX, cy, R, 0, Math.PI * 2); ctx.clip();
      const sg = ctx.createLinearGradient(0, cy - R, 0, cy + R);
      sg.addColorStop(0, pal.sun2); sg.addColorStop(1, pal.sun1);
      ctx.fillStyle = sg; ctx.fillRect(VX - R, cy - R, R * 2, R * 2);
      ctx.fillStyle = pal.bg1;
      const scroll = fract(t * 0.25 + cum * 0.35);
      for (let i = 0; i < 9; i++) {
        const k = (i + scroll) / 9; // 0 top .. 1 bottom
        if (k < 0.4) continue;
        const y = cy - R + k * 2 * R, h = (k - 0.38) * 34;
        ctx.fillRect(VX - R, y, R * 2, h);
      }
      ctx.restore();
      // ring halo
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 3;
      ctx.strokeStyle = rgba(pal.sun2, 0.25 + 0.4 * env);
      ctx.beginPath(); ctx.arc(VX, cy, R + 26 + 18 * env, 0, Math.PI * 2); ctx.stroke();

      // waveform skyline: bar i shows the envelope at an increasing delay outward from the centre
      ctx.globalCompositeOperation = 'source-over';
      const nb = 34, bw = 26, span = nb * bw;
      for (let i = 0; i < nb; i++) {
        const d = Math.abs(i - (nb - 1) / 2);
        const v = A.env(Math.max(0, t - d * 0.035));
        const h = 8 + 210 * v * (1 - d / nb * 0.6);
        const x = VX - span / 2 + i * bw + 4;
        const bg = ctx.createLinearGradient(0, HZ - h, 0, HZ);
        bg.addColorStop(0, rgba(pal.bars, 0.95)); bg.addColorStop(1, rgba(pal.bars, 0.15));
        ctx.fillStyle = bg;
        ctx.fillRect(x, HZ - h, bw - 8, h);
        ctx.fillStyle = rgba(pal.bars, 0.12);
        ctx.fillRect(x, HZ + 4, bw - 8, h * 0.45);
      }
      ctx.globalCompositeOperation = 'lighter';
      // grid floor
      const floorH = H - HZ;
      ctx.lineWidth = 2;
      const speed = t * 0.55 + cum * 0.9;
      ctx.beginPath();
      for (let i = 0; i < 22; i++) {
        const z = fract(i / 22 - speed * 0.25);
        const p = Math.pow(z, 2.6);
        const y = HZ + p * floorH;
        ctx.moveTo(0, y); ctx.lineTo(W, y);
      }
      ctx.strokeStyle = rgba(pal.grid, 0.32 + 0.25 * env);
      ctx.stroke();
      ctx.beginPath();
      for (let i = -16; i <= 16; i++) {
        const xb = VX + i * 150;
        ctx.moveTo(VX + i * 6, HZ); ctx.lineTo(VX + (xb - VX) * 4.2, H);
      }
      ctx.strokeStyle = rgba(pal.grid, 0.26 + 0.2 * env);
      ctx.stroke();
      // fade grid into horizon haze
      ctx.globalCompositeOperation = 'source-over';
      const hz = ctx.createLinearGradient(0, HZ - 4, 0, HZ + 160);
      hz.addColorStop(0, rgba(pal.bg1, 0.0)); hz.addColorStop(0.05, rgba(pal.bg1, 0.85)); hz.addColorStop(1, rgba(pal.bg1, 0));
      ctx.fillStyle = hz; ctx.fillRect(0, HZ, W, 160);
      ctx.globalCompositeOperation = 'lighter';
      const line = ctx.createLinearGradient(0, 0, W, 0);
      line.addColorStop(0, rgba(pal.grid, 0)); line.addColorStop(0.46, rgba(pal.grid, 0.9)); line.addColorStop(1, rgba(pal.grid, 0));
      ctx.fillStyle = line; ctx.fillRect(0, HZ - 1, W, 3);
      drawGlow(ctx, glow(pal.grid, 0.2), VX, HZ, 520, 0.18 + 0.2 * env);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
  });
})();
