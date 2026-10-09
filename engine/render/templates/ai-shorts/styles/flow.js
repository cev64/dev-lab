/* Style "flow": layered silk-like signal ribbons that swell with the voice, plus a drifting
 * particle stream that speeds up while someone is talking. */
(function () {
  const K = window.CLIPKIT;
  const { clamp, drawGlow, glow, rgba, mixHex } = K;

  K.registerStyle({
    name: 'flow',
    caption: 'anton',
    hook: 'anton',
    palettes: [
      { bg0: '#05020c', bg1: '#170830', c1: '#ff3fb4', c2: '#7b5cff', c3: '#2fd8ff', accent: '#ffe14a', accent2: '#ff3fb4' },
      { bg0: '#020608', bg1: '#062226', c1: '#2fffc1', c2: '#2a8bff', c3: '#b7ff5a', accent: '#c4ff3a', accent2: '#2fffc1' },
      { bg0: '#0a0405', bg1: '#2a0c10', c1: '#ff7a3d', c2: '#ff3f7f', c3: '#ffd36b', accent: '#ffe14a', accent2: '#ff7a3d' },
    ],
    init(S) {
      const r = S.rng;
      const ribbons = [];
      for (let band = 0; band < 2; band++) {
        const lines = [];
        const n = band === 0 ? 30 : 18;
        for (let i = 0; i < n; i++) lines.push({ k: i / (n - 1), ph: r() * 6.28, f: 0.0042 + r() * 0.0016, f2: 0.009 + r() * 0.004, ph2: r() * 6.28 });
        ribbons.push({ lines, y: band === 0 ? 800 : 1000, amp: band === 0 ? 170 : 80, spread: band === 0 ? 180 : 60, speed: band === 0 ? 0.6 : -0.45 });
      }
      const parts = [];
      for (let i = 0; i < 150; i++) parts.push({ x: r() * 1180 - 50, y: r() * 2000, sp: 0.4 + r() * 1.2, w: 0.3 + r() * 1.2, ph: r() * 6.28, s: 1.6 + r() * 2.2, hue: r() });
      S.flow = { ribbons, parts };
    },
    draw(ctx, S, t) {
      const { W, H, pal, A } = S;
      const env = A.env(t), cum = A.cum(t);
      const g = ctx.createLinearGradient(0, 0, W * 0.3, H);
      g.addColorStop(0, pal.bg0); g.addColorStop(0.5, pal.bg1); g.addColorStop(1, pal.bg0);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glow(pal.c2, 0.2), 480, 720, 820, 0.28 + 0.2 * env);
      drawGlow(ctx, glow(pal.c1, 0.2), 300 + 80 * Math.sin(t * 0.2), 980, 560, 0.16 + 0.14 * env);

      // ribbons: a soft wide pass for glow, then crisp threads
      const phase = t * 0.9 + cum * 1.6;
      for (const rb of S.flow.ribbons) {
        const amp = rb.amp * (0.55 + 0.8 * env);
        for (let pass = 0; pass < 2; pass++) {
          for (let li = 0; li < rb.lines.length; li++) {
            const L = rb.lines[li];
            if (pass === 0 && li % 3) continue;
            const col = L.k < 0.5 ? mixHex(pal.c1, pal.c2, L.k * 2) : mixHex(pal.c2, pal.c3, (L.k - 0.5) * 2);
            const off = (L.k - 0.5) * rb.spread;
            ctx.beginPath();
            for (let x = -40; x <= W + 40; x += 20) {
              const bell = Math.exp(-(((x - 500) / 560) ** 2));
              const y = rb.y + off * (0.5 + 0.8 * bell) +
                amp * bell * Math.sin(x * L.f + phase * rb.speed + L.ph * 0.25 + L.k * 1.4) +
                amp * 0.3 * Math.sin(x * L.f2 - phase * rb.speed * 1.3 + L.ph2);
              if (x === -40) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            const mid = 1 - Math.abs(L.k - 0.5) * 1.2;
            if (pass === 0) { ctx.strokeStyle = rgba(col, 0.07 + 0.08 * env); ctx.lineWidth = 26; }
            else { ctx.strokeStyle = rgba(col, (0.32 + 0.45 * env) * mid + 0.08); ctx.lineWidth = 2.6; }
            ctx.stroke();
          }
        }
      }
      // particles drifting up and right, faster with speech
      const P = S.flow.parts, drive = t * 40 + cum * 160;
      const sprA = glow(pal.c3, 0.3), sprB = glow(pal.c1, 0.3);
      for (let i = 0; i < P.length; i++) {
        const p = P[i];
        const y = ((p.y - drive * p.sp) % 2000 + 2000) % 2000 - 40;
        const x = p.x + Math.sin(y * 0.004 + p.ph) * 60 * p.w;
        const tw = 0.5 + 0.5 * Math.sin(t * 2 + p.ph * 3);
        if (i % 9 === 0) drawGlow(ctx, p.hue < 0.5 ? sprA : sprB, x, y, 8 + 14 * p.s * (0.5 + env), 0.35 + 0.4 * tw);
        else {
          ctx.globalAlpha = 0.25 + 0.5 * tw;
          ctx.fillStyle = p.hue < 0.5 ? pal.c3 : pal.c1;
          ctx.fillRect(x, y, p.s, p.s * (1 + 3 * env));
        }
      }
      // focal: a voice ring where the ribbons converge
      K.drawWaveRing(ctx, S, t, { cx: 500, cy: 800, R: 150, color: pal.c1, color2: pal.c3 });
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
  });
})();
