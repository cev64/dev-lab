/* Style "neural": a slowly turning 3D neural network. Signals race along edges and neurons fire
 * while the speaker talks (envelope + onsets); a breathing nebula sits behind it. */
(function () {
  const K = window.CLIPKIT;
  const { clamp, hash2, fract, drawGlow, glow, rgba } = K;

  K.registerStyle({
    name: 'neural',
    caption: 'montserrat',
    hook: 'montserrat',
    palettes: [
      { bg0: '#03050f', bg1: '#0a1230', node: '#4cc9ff', edge: '#3a7bff', pulse: '#9be7ff', neb1: '#1b3cff', neb2: '#7a2cff', accent: '#ffe14a', accent2: '#4cc9ff' },
      { bg0: '#02060c', bg1: '#06202a', node: '#39f2d0', edge: '#1fa7a0', pulse: '#c8fff2', neb1: '#0a6a7a', neb2: '#1340a8', accent: '#c4ff3a', accent2: '#39f2d0' },
      { bg0: '#06030f', bg1: '#1a0b33', node: '#b48cff', edge: '#7b5cff', pulse: '#efe2ff', neb1: '#4d1bd1', neb2: '#c42a8f', accent: '#ffe14a', accent2: '#b48cff' },
    ],
    init(S) {
      const r = S.rng;
      const N = 96;
      const nodes = [];
      for (let i = 0; i < N; i++) {
        // points in a squashed ellipsoid, denser toward the centre
        let x, y, z, d;
        do { x = r() * 2 - 1; y = r() * 2 - 1; z = r() * 2 - 1; d = x * x + y * y + z * z; } while (d > 1);
        const k = 0.55 + 0.45 * Math.sqrt(r());
        nodes.push({ x: x * 560 * k, y: y * 640 * k, z: z * 420 * k, off: r(), sens: 0.5 + r() * 0.8, size: 0.7 + r() * 0.7 });
      }
      const edges = [];
      const seen = new Set();
      for (let i = 0; i < N; i++) {
        const ds = nodes.map((n, j) => [j, (n.x - nodes[i].x) ** 2 + (n.y - nodes[i].y) ** 2 + (n.z - nodes[i].z) ** 2]).sort((a, b) => a[1] - b[1]);
        for (let k = 1; k <= 3; k++) {
          const j = ds[k][0], key = i < j ? i + ':' + j : j + ':' + i;
          if (seen.has(key)) continue;
          seen.add(key);
          edges.push({ a: i, b: j, off: r(), speed: 0.6 + r() * 0.9, id: edges.length });
        }
      }
      // background dust
      const dust = [];
      for (let i = 0; i < 160; i++) dust.push({ x: r() * S.W, y: r() * S.H, s: 0.6 + r() * 1.6, tw: r() * 6.28, sp: 0.2 + r() * 0.6 });
      S.nn = { nodes, edges, dust, proj: new Float32Array(N * 3) };
    },
    draw(ctx, S, t) {
      const { W, H, pal, A } = S;
      const env = A.env(t), on = A.onset(t), cum = A.cum(t);
      const nn = S.nn;
      // backdrop
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, pal.bg0); g.addColorStop(0.55, pal.bg1); g.addColorStop(1, pal.bg0);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'lighter';
      const cx = 500, cy = 760;
      drawGlow(ctx, glow(pal.neb1, 0.2), cx - 160 + 60 * Math.sin(t * 0.21), cy - 120, 760 + 80 * env, 0.32 + 0.22 * env);
      drawGlow(ctx, glow(pal.neb2, 0.2), cx + 220 + 70 * Math.cos(t * 0.17), cy + 260, 640, 0.22 + 0.14 * env);
      // dust
      ctx.fillStyle = rgba(pal.pulse, 0.5);
      for (const d of nn.dust) {
        const y = ((d.y - (t * 14 + cum * 30) * d.sp) % H + H) % H;
        ctx.globalAlpha = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.3 + d.tw));
        ctx.fillRect(d.x, y, d.s, d.s);
      }
      // project nodes
      const a = t * 0.11 + cum * 0.05, b = 0.32 + 0.08 * Math.sin(t * 0.13);
      const ca = Math.cos(a), sa = Math.sin(a), cb = Math.cos(b), sb = Math.sin(b);
      const P = nn.proj, F = 1500, CZ = 1350;
      for (let i = 0; i < nn.nodes.length; i++) {
        const n = nn.nodes[i];
        const breathe = 1 + 0.05 * env;
        let x = n.x * ca - n.z * sa, z = n.x * sa + n.z * ca, y = n.y;
        const y2 = y * cb - z * sb; z = y * sb + z * cb; y = y2;
        const s = F / (CZ + z);
        P[i * 3] = cx + x * s * breathe; P[i * 3 + 1] = cy + y * s * breathe; P[i * 3 + 2] = clamp((CZ - z - 700) / 1400, 0.15, 1); // nearness 0..1
      }
      // edges
      ctx.globalAlpha = 1;
      ctx.lineWidth = 1.6;
      for (let bucket = 0; bucket < 3; bucket++) {
        ctx.beginPath();
        for (const e of nn.edges) {
          const d = (P[e.a * 3 + 2] + P[e.b * 3 + 2]) / 2;
          if (Math.min(2, Math.floor(d * 3)) !== bucket) continue;
          ctx.moveTo(P[e.a * 3], P[e.a * 3 + 1]); ctx.lineTo(P[e.b * 3], P[e.b * 3 + 1]);
        }
        ctx.strokeStyle = rgba(pal.edge, 0.10 + bucket * 0.09 + env * 0.12);
        ctx.stroke();
      }
      // signals travelling along edges: more of them, faster, while speech is loud
      const sprP = glow(pal.pulse, 0.25);
      const clock = t * 0.35 + cum * 0.95;
      for (const e of nn.edges) {
        const u = e.off + clock * e.speed;
        const cycle = Math.floor(u), ph = u - cycle;
        const live = hash2(e.id, cycle) < 0.12 + 0.55 * env;
        if (!live) continue;
        const dir = hash2(cycle, e.id + 7) < 0.5;
        const k = dir ? ph : 1 - ph;
        const x = P[e.a * 3] + (P[e.b * 3] - P[e.a * 3]) * k, y = P[e.a * 3 + 1] + (P[e.b * 3 + 1] - P[e.a * 3 + 1]) * k;
        const d = (P[e.a * 3 + 2] + P[e.b * 3 + 2]) / 2;
        const fade = Math.sin(ph * Math.PI);
        drawGlow(ctx, sprP, x, y, 10 + 22 * d * (0.6 + env), (0.35 + 0.6 * d) * fade);
      }
      // neurons
      const sprN = glow(pal.node, 0.3);
      const fireClock = cum * 2.4 + t * 0.15;
      for (let i = 0; i < nn.nodes.length; i++) {
        const n = nn.nodes[i], d = P[i * 3 + 2];
        const fu = fireClock + n.off * 7;
        const fc = Math.floor(fu);
        const fires = hash2(i, fc) < 0.08 + 0.5 * on * n.sens;
        const flash = fires ? Math.pow(1 - (fu - fc), 2) : 0;
        const base = 0.25 + 0.45 * d + 0.25 * env * n.sens;
        const r = (9 + 16 * d) * n.size * (1 + 1.4 * flash);
        drawGlow(ctx, sprN, P[i * 3], P[i * 3 + 1], r * 2.4, (base + flash) * 0.75);
        ctx.globalAlpha = clamp(0.5 + d * 0.5 + flash);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(P[i * 3], P[i * 3 + 1], (1.6 + 2.6 * d) * n.size * (1 + flash), 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';
    },
  });
})();
