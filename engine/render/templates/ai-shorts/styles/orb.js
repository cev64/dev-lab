/* Style "orb": a rotating sphere of light points that deforms with the voice, a circular signal
 * waveform around it, and shock rings emitted on every speech attack, over a faint dot matrix. */
(function () {
  const K = window.CLIPKIT;
  const { clamp, drawGlow, glow, rgba, mixHex } = K;

  K.registerStyle({
    name: 'orb',
    caption: 'montserrat',
    hook: 'anton',
    palettes: [
      { bg0: '#010302', bg1: '#06140c', c1: '#5cff8a', c2: '#2fd8ff', ring: '#b7ff5a', accent: '#ffe14a', accent2: '#5cff8a' },
      { bg0: '#03020a', bg1: '#0c0a24', c1: '#7aa2ff', c2: '#ff5fd2', ring: '#9be7ff', accent: '#c4ff3a', accent2: '#7aa2ff' },
      { bg0: '#060302', bg1: '#1c0d06', c1: '#ffb347', c2: '#ff4f6d', ring: '#ffd36b', accent: '#c4ff3a', accent2: '#ffb347' },
    ],
    init(S) {
      const N = 520;
      const pts = [];
      const ga = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < N; i++) {
        const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i;
        pts.push([Math.cos(th) * r, y, Math.sin(th) * r]);
      }
      S.orb = { pts, cx: 488, cy: 790, R: 215 };
    },
    draw(ctx, S, t) {
      const { W, H, pal, A } = S;
      const env = A.env(t), cum = A.cum(t), on = A.onset(t);
      const { pts, cx, cy, R } = S.orb;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 1300);
      g.addColorStop(0, pal.bg1); g.addColorStop(1, pal.bg0);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // dot matrix, lit near the orb
      ctx.fillStyle = rgba(pal.c1, 1);
      for (let y = 30; y < H; y += 44) {
        for (let x = 22; x < W; x += 44) {
          const d = Math.hypot(x - cx, y - cy);
          const a = 0.05 + 0.22 * Math.exp(-d / 420) * (0.5 + env);
          ctx.globalAlpha = a;
          ctx.fillRect(x, y, 2.4, 2.4);
        }
      }
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glow(pal.c1, 0.2), cx, cy, R * 3.1, 0.3 + 0.35 * env);
      drawGlow(ctx, glow(pal.c2, 0.2), cx, cy + 40, R * 2, 0.18 + 0.25 * on);

      // shock rings: one every 0.45 s, strength = speech energy at birth
      ctx.lineWidth = 3;
      for (let k = Math.floor(t / 0.45); k >= 0 && k > Math.floor(t / 0.45) - 5; k--) {
        const born = k * 0.45, age = t - born;
        const e0 = A.onset(born) * 0.7 + A.env(born) * 0.3;
        if (e0 < 0.15) continue;
        const rr = R * 1.15 + age * 420;
        ctx.strokeStyle = rgba(pal.ring, clamp(e0 * (1 - age / 2.2)) * 0.55);
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
      }
      // circular waveform: radius at angle a = recent envelope history
      for (let layer = 0; layer < 2; layer++) {
        ctx.beginPath();
        const n = 180;
        for (let i = 0; i <= n; i++) {
          const a = (i / n) * Math.PI * 2;
          const m = Math.abs(((i + layer * 45) % n) - n / 2) / (n / 2); // 0..1 mirror
          const v = A.raw(Math.max(0, t - m * 0.6));
          const wob = Math.sin(a * 7 + t * 3 + layer * 2) * 0.5 + Math.sin(a * 13 - t * 4.3) * 0.5;
          const rr = R * (1.36 + layer * 0.12) + (14 + 50 * v) * wob * (0.3 + v);
          const x = cx + Math.cos(a - Math.PI / 2) * rr, y = cy + Math.sin(a - Math.PI / 2) * rr;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = rgba(layer ? pal.c2 : pal.ring, 0.45 + 0.4 * env);
        ctx.lineWidth = layer ? 2 : 3;
        ctx.stroke();
      }
      // sphere of points
      const ay = t * 0.35 + cum * 0.25, ax = 0.4 + 0.2 * Math.sin(t * 0.3);
      const cyA = Math.cos(ay), syA = Math.sin(ay), cxA = Math.cos(ax), sxA = Math.sin(ax);
      const spr1 = glow(pal.c1, 0.35), spr2 = glow(pal.c2, 0.35);
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        let x = p[0] * cyA - p[2] * syA, z = p[0] * syA + p[2] * cyA, y = p[1];
        const y2 = y * cxA - z * sxA; z = y * sxA + z * cxA; y = y2;
        const n = Math.sin(p[0] * 5 + t * 1.7) * Math.sin(p[1] * 6 - t * 1.3) * Math.sin(p[2] * 4 + t);
        const rad = R * (1 + (0.04 + 0.22 * env) * n + 0.05 * env);
        const s = 900 / (900 + z * R * 0.9);
        const px = cx + x * rad * s, py = cy + y * rad * s;
        const front = (1 - z) / 2; // 1 = front
        const sz = (1.3 + 3.2 * front) * (1 + 0.6 * env * Math.max(0, n));
        if (i % 6 === 0) drawGlow(ctx, front > 0.5 ? spr1 : spr2, px, py, sz * 5, 0.2 + 0.5 * front);
        ctx.globalAlpha = 0.25 + 0.75 * front;
        ctx.fillStyle = front > 0.55 ? '#ffffff' : mixHex(pal.c2, pal.c1, front);
        ctx.fillRect(px - sz / 2, py - sz / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
  });
})();
