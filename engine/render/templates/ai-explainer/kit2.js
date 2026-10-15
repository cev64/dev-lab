/* ai-explainer illustration kit v2, "storybook realism" (info.helpers.kit2).
 * Modern feature-animation-style 2D: closer-to-real proportions (adults ~5.6 heads), volume from soft gradients
 * with a key light + rim light, contact shadows and ambient occlusion, subtle material texture, layered
 * environments with parallax and a lighting pass. Motion follows the 12 principles via motion.js (K2.motion).
 *
 * Same conventions as kit.js: draw<Thing>(ctx, x, y, scale, opts) anchored at the BOTTOM-CENTRE (x, y), pure
 * functions of opts.t. Characters are generic, never a real or recognisable person, never a logo.
 * Static artwork (world layers, lighting, grain) is cached on offscreen canvases per kit instance (one per scene),
 * so a frame mostly blits a few layers and draws the characters.
 * Old clips are unaffected: kit.js is unchanged and this file only adds window.EXPLAINER_KIT2.
 */
(function () {
  'use strict';
  const K = window.CLIPKIT, M = window.EXPLAINER_MOTION;
  const { clamp, lerp, roundRect, rgba, mixHex, hash2 } = K;
  const TAU = Math.PI * 2, PI = Math.PI;
  const fract = (x) => x - Math.floor(x);
  const sgn = (v) => (v < 0 ? -1 : 1);

  // ------------------------------------------------------------------ palettes (generic, varied, no likenesses)
  const SKIN = ['#f6d6c0', '#e9b997', '#d39a6f', '#a86f4c', '#7a4a30', '#5a3524'];
  const HAIR = ['#2b2220', '#5a3a26', '#a8692f', '#d9b36c', '#c9c4bd', '#8f2f22', '#1c2233'];
  const EYES = ['#4a3426', '#2f5a7a', '#3d6b48', '#6b4a2a', '#30302f'];
  const CLOTH = { blue: '#4f6fc2', teal: '#3f9c8f', coral: '#e0705f', plum: '#7b5aa6', mustard: '#d9a43a', slate: '#5d6a82',
    navy: '#27324f', charcoal: '#363a45', cream: '#efe6d6', white: '#eef1f6', denim: '#3f5a8c', olive: '#6f7a45', rose: '#d98a9a', black: '#1d1f26' };
  const AGE = {
    kid: { H: 250, heads: 3.85, sw: 0.13, hw: 0.105, eye: 1.42, leg: 0.42, arm: 0.92, jaw: 0.0, rx: 0.47, neck: 0.16 },
    teen: { H: 338, heads: 4.9, sw: 0.125, hw: 0.104, eye: 1.15, leg: 0.47, arm: 1, jaw: 0.4, rx: 0.44, neck: 0.22 },
    adult: { H: 380, heads: 5.35, sw: 0.132, hw: 0.108, eye: 1.0, leg: 0.48, arm: 1, jaw: 0.7, rx: 0.425, neck: 0.24 },
    older: { H: 366, heads: 5.25, sw: 0.128, hw: 0.112, eye: 0.95, leg: 0.47, arm: 1, jaw: 0.6, rx: 0.425, neck: 0.22, stoop: 0.07 },
  };
  const BODY = { slim: { w: 0.88, belly: 0 }, average: { w: 1, belly: 0.02 }, broad: { w: 1.14, belly: 0.03 }, round: { w: 1.1, belly: 0.11 } };
  const DEFAULT_LIGHT = { dir: -1, key: '#fff1dc', keyA: 0.16, rim: '#a9c6ff', rimA: 0.5, amb: '#141a33', ambA: 0.3, ao: 0.42 };

  function create(cfg) {
    const ACC = (cfg && cfg.accent) || '#ffe14a';
    const CW = (cfg && cfg.width) || 1080, CH = (cfg && cfg.height) || 1920;
    const PX = CW === 1080 && CH === 1920 ? 487 : CW / 2, PY = CW === 1080 && CH === 1920 ? 725 : CH / 2; // camera pivot
    const A = { base: ACC, shade: mixHex(ACC, '#000000', 0.28), light: mixHex(ACC, '#ffffff', 0.4), deep: mixHex(ACC, '#000000', 0.62) };
    const MASCOT = { eye: '#c4ff3a', head: '#f4f6fb', visor: '#121626' };
    const F = (w, fam, size) => `${w} ${Math.round(size * 10) / 10}px "${fam}"`;
    const font = { display: (s) => F(900, 'Montserrat', s), bold: (s) => F(800, 'Montserrat', s), ui: (s) => F(700, 'Inter', s), body: (s) => F(500, 'Inter', s), condensed: (s) => F(400, 'Anton', s) };

    // ---------------------------------------------------------------- caches (per kit instance = per scene)
    const cache = new Map();
    function cached(key, w, h, paint) {
      let c = cache.get(key);
      if (!c) { c = new OffscreenCanvas(Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h))); const g = c.getContext('2d'); paint(g, c); cache.set(key, c); }
      return c;
    }
    const memo = new Map();
    const mm = (key, fn) => { let v = memo.get(key); if (v === undefined) { v = fn(); memo.set(key, v); } return v; };

    // ---------------------------------------------------------------- colour + material
    const dark = (c, k) => mixHex(c, '#000000', k), tint = (c, k) => mixHex(c, '#ffffff', k);
    const pick = (arr, v, d) => (typeof v === 'string' ? v : arr[((v == null ? d : v | 0) % arr.length + arr.length) % arr.length]);
    const cloth = (v, d) => (v == null ? d : CLOTH[v] || v);
    // material ramp for a base colour under light L: lit, base, shade, deep, rim, spec
    function mat(c, L, warm) {
      L = L || DEFAULT_LIGHT;
      return mm('m' + c + L.key + L.keyA + L.rim + L.rimA + L.amb + L.ambA + (warm ? 'w' : ''), () => {
        const shade = warm ? mixHex(mixHex(c, '#8a3a2c', 0.28), '#000000', 0.2) : mixHex(mixHex(c, '#000000', 0.3), L.amb, L.ambA * 0.55);
        return { lit: mixHex(c, L.key, L.keyA + 0.06), base: c, shade, deep: mixHex(shade, '#000000', 0.3), rim: mixHex(tint(c, warm ? 0.18 : 0.25), L.rim, warm ? L.rimA * 0.45 : L.rimA), spec: mixHex(tint(c, 0.6), L.key, 0.3) };
      });
    }

    // ---------------------------------------------------------------- primitives
    const at = (ctx, x, y, s, fn) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); fn(); ctx.restore(); };
    function circle(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); }
    function ell(ctx, x, y, rx, ry, rot, fill) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, TAU); if (fill) { ctx.fillStyle = fill; ctx.fill(); } }
    function rr(ctx, x, y, w, h, r, fill) { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); }
    function poly(ctx, pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
    function capsulePath(ctx, ax, ay, ra, bx, by, rb) {
      const an = Math.atan2(by - ay, bx - ax);
      ctx.beginPath(); ctx.arc(ax, ay, ra, an + PI / 2, an + PI * 1.5); ctx.arc(bx, by, rb, an - PI / 2, an + PI / 2); ctx.closePath();
    }
    // cylinder shading across a segment: lit side faces the key light (L.dir: -1 = light from screen-left)
    function cylGrad(ctx, ax, ay, bx, by, r, m, ldir) {
      const an = Math.atan2(by - ay, bx - ax), nx = -Math.sin(an), ny = Math.cos(an), mx = (ax + bx) / 2, my = (ay + by) / 2;
      const s = nx * ldir + ny * -0.4 > 0 ? 1 : -1; // the normal side that faces the light
      const g = ctx.createLinearGradient(mx + nx * r * s, my + ny * r * s, mx - nx * r * s, my - ny * r * s);
      g.addColorStop(0, m.lit); g.addColorStop(0.38, m.base); g.addColorStop(0.74, m.shade); g.addColorStop(0.9, m.deep); g.addColorStop(1, m.rim);
      return g;
    }
    function limbSeg(ctx, a, b, ra, rb, m, ldir) { capsulePath(ctx, a[0], a[1], ra, b[0], b[1], rb); ctx.fillStyle = cylGrad(ctx, a[0], a[1], b[0], b[1], Math.max(ra, rb), m, ldir); ctx.fill(); }
    // fill a path with volume: rim crescent on the side away from the key, soft form gradient, optional AO at the bottom
    function solid(ctx, pathFn, m, box, ldir, o = {}) {
      const [x0, y0, w, h] = box, rimW = o.rim == null ? Math.max(2, w * 0.05) : o.rim;
      pathFn(); ctx.fillStyle = m.rim; ctx.fill();
      ctx.save(); pathFn(); ctx.clip();
      ctx.translate(ldir * rimW, -rimW * 0.25); pathFn();
      const g = ctx.createLinearGradient(ldir < 0 ? x0 : x0 + w, 0, ldir < 0 ? x0 + w : x0, 0);
      g.addColorStop(0, m.lit); g.addColorStop(o.mid == null ? 0.42 : o.mid, m.base); g.addColorStop(0.86, m.shade); g.addColorStop(1, m.deep);
      ctx.fillStyle = g; ctx.fill();
      ctx.translate(-ldir * rimW, rimW * 0.25);
      if (o.ao) { const a = ctx.createLinearGradient(0, y0 + h * (1 - o.ao), 0, y0 + h); a.addColorStop(0, 'rgba(0,0,0,0)'); a.addColorStop(1, 'rgba(8,8,20,0.35)'); ctx.fillStyle = a; ctx.fillRect(x0 - 4, y0, w + 8, h + 4); }
      if (o.top) { const a = ctx.createLinearGradient(0, y0, 0, y0 + h * o.top); a.addColorStop(0, rgba(m.spec, 0.35)); a.addColorStop(1, rgba(m.spec, 0)); ctx.fillStyle = a; ctx.fillRect(x0 - 4, y0 - 4, w + 8, h * o.top + 4); }
      ctx.restore();
    }
    function glowAt(ctx, x, y, r, color, a) {
      if (a <= 0.002 || r <= 0) return;
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(color, a)); g.addColorStop(0.35, rgba(color, a * 0.45)); g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
    }
    // ---------------------------------------------------------------- shadows
    // contactShadow: tight dark core + soft falloff where an object meets the floor (ambient occlusion)
    function contactShadow(ctx, x, y, w, alpha = 0.5, squashY = 0.16) {
      ctx.save(); ctx.translate(x, y); ctx.scale(1, squashY);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w / 2);
      g.addColorStop(0, `rgba(4,5,14,${alpha})`); g.addColorStop(0.45, `rgba(4,5,14,${alpha * 0.55})`); g.addColorStop(1, 'rgba(4,5,14,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, w / 2, 0, TAU); ctx.fill(); ctx.restore();
    }
    // castShadow: soft long shadow thrown away from a light at (lx, ly) along the floor; h = object height
    function castShadow(ctx, x, y, w, h, lightX, alpha = 0.28) {
      const dx = clamp((x - lightX) / 600, -1.4, 1.4), len = h * (0.35 + 0.5 * Math.abs(dx));
      ctx.save(); ctx.translate(x, y); ctx.transform(1, 0, dx * 1.6, 1, 0, 0); ctx.scale(1, -0.22);
      const g = ctx.createLinearGradient(0, 0, 0, len);
      g.addColorStop(0, `rgba(4,5,14,${alpha})`); g.addColorStop(1, 'rgba(4,5,14,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, len * 0.5, w * 0.42, len * 0.55, 0, 0, TAU); ctx.fill(); ctx.restore();
    }
    // ---------------------------------------------------------------- grain + textures (deterministic, cached)
    function noiseTile(size, strength, seed) {
      return cached('noise' + size + strength + seed, size, size, (g) => {
        const d = g.createImageData(size, size), p = d.data;
        for (let i = 0; i < size * size; i++) {
          const v = hash2(i % size + seed * 13, Math.floor(i / size) + seed * 7);
          const on = v > 0.5, a = Math.abs(v - 0.5) * 2;
          p[i * 4] = p[i * 4 + 1] = p[i * 4 + 2] = on ? 255 : 0; p[i * 4 + 3] = Math.round(a * a * strength * 255);
        }
        g.putImageData(d, 0, 0);
      });
    }
    // grain(ctx, t, amount): film grain over the frame (12 fps boil), cheap: one pattern fill
    function grain(ctx, t = 0, amount = 0.08, w = CW, h = CH) {
      if (amount <= 0) return;
      const tile = noiseTile(160, 0.55, 1), f = Math.floor(t * 12);
      ctx.save(); ctx.globalAlpha = clamp(amount * 2);
      const pat = ctx.createPattern(tile, 'repeat');
      ctx.translate(-((hash2(f, 3) * 160) | 0), -((hash2(f, 4) * 160) | 0));
      ctx.fillStyle = pat; ctx.fillRect(0, 0, w + 160, h + 160); ctx.restore();
    }
    // texture(ctx, kind, x, y, w, h, color, alpha): material texture inside the current path/clip (use in cached art)
    function texture(ctx, kind, x, y, w, h, color = '#000000', alpha = 0.12, seed = 0) {
      ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.fillStyle = color;
      if (kind === 'wood') {
        ctx.lineWidth = 1.4;
        for (let i = 0; i < h / 5; i++) {
          const yy = y + i * 5 + hash2(i, seed) * 3; ctx.beginPath(); ctx.moveTo(x, yy);
          for (let xx = x; xx <= x + w; xx += 24) ctx.lineTo(xx, yy + Math.sin(xx * 0.013 + i * 0.7 + seed) * 2.2 + (hash2(i, xx) - 0.5) * 1.2);
          ctx.globalAlpha = alpha * (0.4 + hash2(i, seed + 3)); ctx.stroke();
        }
        for (let k = 0; k < Math.max(1, (w * h) / 40000); k++) { ctx.globalAlpha = alpha * 1.4; ell(ctx, x + hash2(k, seed + 5) * w, y + hash2(k, seed + 6) * h, 9, 3, 0); ctx.stroke(); }
      } else if (kind === 'fabric') {
        ctx.lineWidth = 1;
        for (let i = 0; i < w; i += 4) { ctx.globalAlpha = alpha * (0.5 + 0.5 * hash2(i, seed)); ctx.fillRect(x + i, y, 1, h); }
        for (let j = 0; j < h; j += 4) { ctx.globalAlpha = alpha * 0.5 * (0.5 + 0.5 * hash2(j, seed + 1)); ctx.fillRect(x, y + j, w, 1); }
      } else if (kind === 'speckle') {
        for (let i = 0; i < (w * h) / 90; i++) { ctx.globalAlpha = alpha * hash2(i, seed + 9); ctx.fillRect(x + hash2(i, seed + 7) * w, y + hash2(i, seed + 8) * h, 2, 2); }
      } else if (kind === 'brushed') {
        ctx.lineWidth = 1;
        for (let i = 0; i < h; i += 2) { ctx.globalAlpha = alpha * hash2(i, seed + 2); ctx.beginPath(); ctx.moveTo(x, y + i); ctx.lineTo(x + w, y + i); ctx.stroke(); }
      } else if (kind === 'stripes') {
        for (let i = 0; i < w; i += 28) ctx.fillRect(x + i, y, 9, h);
      }
      ctx.restore();
    }

    // ================================================================ HUMAN RIG
    // Pose library: joint angles (radians from straight down; + = toward the facing side). s/e = shoulder/elbow,
    // N/F = near/far arm, h/k = hip/knee, lean (torso), tilt (head), nod (+ = look down), lift (shoulders up px).
    const POSES = {
      stand: { sN: 0.1, eN: 0.22, sF: -0.08, eF: 0.26, hN: 0.04, kN: 0, hF: -0.04, kF: 0, lean: 0, tilt: 0, nod: 0, lift: 0, handN: 'relax', handF: 'relax' },
      point: { sN: 1.72, eN: 0.04, sF: -0.06, eF: 0.3, lean: 0.04, handN: 'point', handF: 'relax' },
      shrug: { sN: 0.42, eN: 1.05, sF: -0.42, eF: -1.05, lift: 7, tilt: 0.1, handN: 'open', handF: 'open' },
      cheer: { sN: 2.55, eN: 0.25, sF: -2.55, eF: -0.25, lean: -0.04, nod: -0.25, handN: 'fist', handF: 'fist' },
      phone: { sN: 0.22, eN: 2.25, sF: 0.05, eF: 2.0, nod: 0.45, tilt: 0.04, handN: 'hold', handF: 'hold', farFront: true, hold: 'phone' },
      type: { sN: 0.55, eN: 1.0, sF: 0.48, eF: 1.08, nod: 0.25, lean: 0.06, handN: 'open', handF: 'open' },
      talk: { sN: 0.3, eN: 1.25, sF: -0.08, eF: 0.32, handN: 'open', handF: 'relax' },
      wave: { sN: 2.25, eN: 0.55, sF: -0.08, eF: 0.28, tilt: -0.06, handN: 'open', handF: 'relax' },
      reach: { sN: 1.42, eN: 0.08, sF: -0.1, eF: 0.4, lean: 0.14, handN: 'open', handF: 'relax' },
      hips: { sN: 0.6, eN: -1.75, sF: -0.6, eF: 1.75, handN: 'fist', handF: 'fist' },
      think: { sN: 0.18, eN: 2.75, sF: 0.32, eF: 1.25, tilt: 0.08, nod: -0.15, handN: 'fist', handF: 'relax', farFront: true },
      present: { sN: 1.2, eN: 0.35, sF: -0.1, eF: 0.3, handN: 'open', handF: 'relax' },
      sit: { sit: 1, hN: 1.52, kN: -1.5, hF: 1.48, kF: -1.46, sN: 0.32, eN: 0.95, sF: 0.22, eF: 1.0, handN: 'relax', handF: 'relax' },
    };
    const sitArms = (p) => Object.assign({}, POSES.sit, p, { sit: 1, hN: POSES.sit.hN, kN: POSES.sit.kN, hF: POSES.sit.hF, kF: POSES.sit.kF });
    POSES['sit-phone'] = sitArms({ sN: 0.3, eN: 2.3, sF: 0.12, eF: 2.05, nod: 0.45, farFront: true, handN: 'hold', handF: 'hold', hold: 'phone' });
    POSES['sit-laptop'] = sitArms({ sN: 0.6, eN: 0.95, sF: 0.5, eF: 1.0, nod: 0.25, handN: 'open', handF: 'open' });
    POSES['sit-talk'] = sitArms({ sN: 0.34, eN: 1.35, sF: 0.22, eF: 1.0, handN: 'open' });
    POSES['sit-reach'] = sitArms({ sN: 1.4, eN: 0.06, sF: 0.22, eF: 1.0, lean: 0.18, handN: 'open' });
    function poseOf(p) { return Object.assign({}, POSES.stand, typeof p === 'string' ? (POSES[p] || POSES.stand) : p || {}); }

    // drawHuman(ctx, x, y, s, opts): articulated generic person, ~380 px tall at scale 1 (adult).
    function drawHuman(ctx, x, y, s, o = {}) {
      const t = o.t || 0, seed = o.seed || 0, age = AGE[o.age] || AGE.adult, H = age.H, hu = H / age.heads;
      const L = Object.assign({}, DEFAULT_LIGHT, o.light || {});
      const facing = o.facing == null ? 0.35 : clamp(o.facing, -1, 1), dirS = facing < 0 ? -1 : 1, f = Math.abs(facing);
      const ld = L.dir * dirS, rimSide = -ld;
      const bt = BODY[o.body] || BODY.average;
      // pose: name or object, blended with pose2 by poseMix (pose-to-pose)
      let P = poseOf(o.pose);
      if (o.pose2 != null && o.poseMix > 0) P = Object.assign(P, M.mix(P, poseOf(o.pose2), clamp(o.poseMix)));
      if (o.rig) P = Object.assign(P, o.rig);
      const ex = o.exag == null ? 1 : o.exag;
      // secondary action: breathing, weight shift, fidget
      const br = M.breathe(t, seed), ws = o.walk == null && !P.sit ? M.weightShift(t, seed) * (o.idle == null ? 1 : o.idle) : 0;
      const fid = M.fidget(t, seed, o.idle == null ? 1 : o.idle);
      const walking = o.walk != null && !P.sit;
      const wph = walking ? o.walk * (o.cadence || 0.95) * TAU : 0;
      // skin/hair/clothes
      const skin = pick(SKIN, o.skin, 1), hairC = pick(HAIR, o.hair, o.age === 'older' ? 4 : 0);
      const outfit = o.outfit || (o.age === 'kid' ? 'hoodie' : 'tee');
      const top = cloth(o.top, { tee: CLOTH.teal, hoodie: CLOTH.coral, office: CLOTH.white, suit: CLOTH.navy, pajamas: CLOTH.blue, dress: CLOTH.plum, cardigan: CLOTH.mustard, lab: CLOTH.white, cleanroom: CLOTH.white, robe: CLOTH.black }[outfit] || CLOTH.teal);
      const bottom = cloth(o.bottom, { tee: CLOTH.denim, hoodie: CLOTH.slate, office: CLOTH.charcoal, suit: CLOTH.navy, pajamas: CLOTH.blue, dress: CLOTH.plum, cardigan: CLOTH.charcoal, lab: CLOTH.slate, cleanroom: CLOTH.white, robe: CLOTH.black }[outfit] || CLOTH.denim);
      const shoeC = cloth(o.shoes, outfit === 'pajamas' ? '#c9ccd6' : outfit === 'cleanroom' ? '#dfe3ea' : outfit === 'tee' || outfit === 'hoodie' ? '#e9ebf0' : '#22242c');
      const inner = outfit === 'suit' ? CLOTH.white : null, tieC = cloth(o.tie, outfit === 'office' || outfit === 'suit' ? A.base : null);
      const mSkin = mat(skin, L, true), mTop = mat(top, L), mBot = mat(bottom, L), mShoe = mat(shoeC, L), mHair = mat(hairC, L);
      const longSleeve = outfit !== 'tee' && outfit !== 'dress';
      // geometry (local: feet at 0, up = -y). widths in 3/4 view: near side +x, far side compressed
      const sw = H * age.sw * bt.w, hipW = H * age.hw * bt.w;
      const xs = (v) => (v >= 0 ? v * (1 - 0.08 * f) : v * (1 - 0.42 * f));
      const legL = H * age.leg, thigh = legL * 0.5, shin = legL * 0.5 - H * 0.035, footH = H * 0.035;
      const upA = H * 0.18 * age.arm, foA = H * 0.15 * age.arm, limbR = H * (o.age === 'kid' ? 0.034 : 0.029) * bt.w;
      const neckH = hu * age.neck;
      // --- legs: forward kinematics + ground contact
      let hN = P.hN, kN = P.kN, hF = P.hF, kF = P.kF;
      if (walking) {
        const amp = 0.4 * ex * (o.stride == null ? 1 : o.stride);
        hN = amp * Math.sin(wph); hF = amp * Math.sin(wph + PI);
        kN = -(0.08 + 1.0 * Math.pow(Math.max(0, Math.cos(wph + 0.55)), 2)); kF = -(0.08 + 1.0 * Math.pow(Math.max(0, Math.cos(wph + PI + 0.55)), 2));
      } else if (!P.sit) { hN += ws * 0.03; hF += ws * 0.03; kN -= Math.max(0, ws) * 0.07; kF -= Math.max(0, -ws) * 0.07; }
      const ff = P.sit ? lerp(0.32, 1, f) : 1; // thigh foreshortening when seated facing the camera
      const legFK = (hx, hy, h, k) => {
        const kx = hx + Math.sin(h) * thigh * ff, ky = hy + Math.cos(h) * thigh;
        const ax = kx + Math.sin(h + k) * shin, ay = ky + Math.cos(h + k) * shin;
        return { hip: [hx, hy], knee: [kx, ky], ankle: [ax, ay] };
      };
      let hipY;
      const hxN = xs(hipW * 0.5), hxF = xs(-hipW * 0.5);
      if (P.sit) hipY = -(o.seatH != null ? o.seatH : shin + footH + 4) - limbR * 0.6;
      else {
        const a = legFK(0, 0, hN, kN), b = legFK(0, 0, hF, kF);
        hipY = -Math.max(a.ankle[1], b.ankle[1]) - footH;
      }
      const crouch = (P.crouch || 0) * H * 0.08;
      hipY += crouch;
      const legN = legFK(hxN, hipY, hN, kN), legF = legFK(hxF, hipY, hF, kF);
      // torso landmarks
      const stoop = (age.stoop || 0) + (walking ? 0.05 : 0);
      const lean = (P.lean || 0) * ex + stoop * 0.5 + (o.lean || 0) + ws * 0.012;
      const shY = hipY - (H - legL - hu - neckH * 0.4) * (P.sit ? 1 : 1) + (P.sit ? 0 : 0) - br.shoulders * 0.6 + (P.lift || 0) * -1 * ex;
      const neckTopY = shY - neckH * 0.85;
      const headCY = neckTopY - hu * 0.42;
      const hipC = [0, hipY];
      // overlap drivers (follow-through for hair, tie, ponytail, drawstrings)
      const drive = o.drive, driveY = o.driveY;
      const sig = (tt) => (drive ? drive(tt) : 0) + (driveY ? driveY(tt) * 0.6 : 0) + (walking ? Math.sin((o.walk - (t - tt)) * (o.cadence || 0.95) * TAU * 2) * 4 : 0);
      const dangle = drive || driveY || walking ? M.chain(sig, t, 3, { gain: 0.006 / Math.max(0.5, s), freq: 2.3, damp: 0.32 }) : [0, 0, 0];
      const swayIdle = M.sway(t, seed, 0.03, 0.35);
      const squashS = o.squash || 0;
      const blinkK = Math.max(M.blink(t, seed), o.blink || 0);

      ctx.save();
      ctx.translate(x, y); ctx.scale(s, s);
      if (o.shadow !== false) contactShadow(ctx, P.sit ? 0 : (legN.ankle[0] + legF.ankle[0]) * 0.5 * dirS, 0, P.sit ? hipW * 3.4 : hipW * 3, (L.ao || 0.42) * (o.shadowA == null ? 1 : o.shadowA));
      if (squashS) { const q = M.squash(squashS); const py = P.sit ? hipY : 0; ctx.translate(0, py); ctx.scale(q.sx, q.sy); ctx.translate(0, -py); }
      if (dirS < 0) ctx.scale(-1, 1);

      // ---- arms FK (in torso space, rotated by lean around the hip)
      const shL = (P.lift || 0) * ex;
      const shoulderN = [xs(sw * 0.84), shY + H * 0.03], shoulderF = [xs(-sw * 0.84), shY + H * 0.03];
      let sN = P.sN, eN = P.eN, sF = P.sF, eF = P.eF;
      if (walking) { const sa = 0.32 * ex; sN = 0.05 - sa * Math.sin(wph); sF = -0.05 - sa * Math.sin(wph + PI); eN = 0.3 + 0.2 * Math.max(0, -Math.sin(wph)); eF = 0.3 + 0.2 * Math.max(0, -Math.sin(wph + PI)); }
      if (o.talk && (P.handN === 'open') && !walking) eN += Math.sin(t * 5.3 + seed) * 0.12 * clamp(o.talk);
      if (o.pose === 'wave' || P.wave) eN += Math.sin(t * 9 + seed) * 0.32;
      sN += fid.hand * 0.4; sF -= fid.hand * 0.3;
      const armFK = (sh, a, e) => { const el = [sh[0] + Math.sin(a) * upA, sh[1] + Math.cos(a) * upA]; const wr = [el[0] + Math.sin(a + e) * foA, el[1] + Math.cos(a + e) * foA]; return { sh, el, wr, fa: a + e }; };
      const armN = armFK(shoulderN, sN * (sN > 0.6 ? ex : 1), eN), armF = armFK(shoulderF, sF * (sF < -0.6 ? ex : 1), eF);
      if (o.reach) { // IK-lite: aim the near hand at a point (local, unscaled coords relative to the feet)
        const tx = o.reach[0] * dirS, ty = o.reach[1];
        const dx = tx - shoulderN[0], dy = ty - shoulderN[1], dist = Math.min(upA + foA - 0.5, Math.hypot(dx, dy));
        const base = Math.atan2(dx, dy), c = clamp((upA * upA + dist * dist - foA * foA) / (2 * upA * dist), -1, 1), off = Math.acos(c);
        const a = base - off * 0.9, el = [shoulderN[0] + Math.sin(a) * upA, shoulderN[1] + Math.cos(a) * upA];
        const fa = Math.atan2(tx - el[0], ty - el[1]);
        armN.el = el; armN.wr = [el[0] + Math.sin(fa) * foA, el[1] + Math.cos(fa) * foA]; armN.fa = fa;
      }

      // ---- draw helpers
      const leg = (lg, m, isFar) => {
        const mm2 = isFar ? mat(dark(m.base, 0.12), L) : m;
        const thR = limbR * (outfit === 'dress' ? 0.9 : 1.32), shR = limbR * 1.0;
        const pantM = outfit === 'dress' ? mat(isFar ? dark(skin, 0.12) : skin, L) : mm2;
        limbSeg(ctx, lg.knee, lg.ankle, thR * 0.92, shR * 0.85, pantM, ld);
        limbSeg(ctx, lg.hip, lg.knee, thR * 1.12, thR * 0.92, outfit === 'dress' ? pantM : mm2, ld);
        // knee/fold crease
        if (outfit !== 'dress') { ctx.strokeStyle = rgba(mm2.deep, 0.55); ctx.lineWidth = 1.6; ctx.beginPath(); const k = lg.knee; ctx.moveTo(k[0] - thR * 0.6, k[1] - 2); ctx.quadraticCurveTo(k[0], k[1] + 3, k[0] + thR * 0.6, k[1] - 1); ctx.stroke(); }
        // shoe: points toward the facing side, foreshortened when frontal
        const an = lg.ankle, fl = H * 0.085 * lerp(0.62, 1, f), sm = isFar ? mat(dark(shoeC, 0.15), L) : mShoe;
        const lift = walking ? clamp(-an[1] / 12) : 0, rot = walking ? (an[1] < -2 ? -0.25 * lift : 0) : 0;
        ctx.save(); ctx.translate(an[0], an[1]); ctx.rotate(rot);
        const path = () => { ctx.beginPath(); ctx.moveTo(-fl * 0.32, -footH * 0.9); ctx.quadraticCurveTo(-fl * 0.42, footH * 0.95, -fl * 0.2, footH); ctx.lineTo(fl * 0.78, footH); ctx.quadraticCurveTo(fl * 0.98, footH * 0.95, fl * 0.86, footH * 0.1); ctx.quadraticCurveTo(fl * 0.6, -footH * 0.6, fl * 0.15, -footH * 1.1); ctx.closePath(); };
        solid(ctx, path, sm, [-fl * 0.4, -footH * 1.1, fl * 1.4, footH * 2.1], ld, { rim: 1.5, top: 0.4 });
        rr(ctx, -fl * 0.24, footH * 0.62, fl * 1.08, footH * 0.42, footH * 0.2, rgba(tint(shoeC, 0.5), 0.75));
        ctx.restore();
      };
      const hand = (wr, fa, mode, isFar) => {
        const hs = H * 0.062 * (o.age === 'kid' ? 1.15 : 1), m = isFar ? mat(dark(skin, 0.1), L, true) : mSkin;
        ctx.save(); ctx.translate(wr[0], wr[1]); ctx.rotate(-fa);
        // local frame: +y runs out of the wrist along the forearm; the thumb sits on the +x side
        const fist = mode === 'fist' || mode === 'point' || mode === 'hold';
        const palm = () => {
          ctx.beginPath();
          if (fist) ctx.ellipse(0, hs * 0.5, hs * 0.42, hs * 0.48, 0, 0, TAU);
          else { ctx.moveTo(-hs * 0.36, hs * 0.05); ctx.quadraticCurveTo(-hs * 0.46, hs * 0.65, -hs * 0.3, hs * 1.05); ctx.quadraticCurveTo(0, hs * 1.22, hs * 0.3, hs * 1.02); ctx.quadraticCurveTo(hs * 0.42, hs * 0.6, hs * 0.34, hs * 0.05); ctx.closePath(); }
        };
        solid(ctx, palm, m, [-hs * 0.46, 0, hs * 0.92, hs * 1.2], ld, { rim: 1.3 });
        ctx.strokeStyle = rgba(m.deep, 0.45); ctx.lineWidth = 1.1;
        if (!fist) for (const k of [-0.13, 0.05, 0.2]) { ctx.beginPath(); ctx.moveTo(hs * k, hs * 0.78); ctx.lineTo(hs * k * 1.1, hs * 1.1); ctx.stroke(); }
        else { ctx.beginPath(); ctx.moveTo(-hs * 0.3, hs * 0.72); ctx.quadraticCurveTo(0, hs * 0.82, hs * 0.3, hs * 0.7); ctx.stroke(); }
        const th = mode === 'open' ? 1.0 : mode === 'hold' ? 0.75 : fist ? 0.45 : 0.55;
        limbSeg(ctx, [hs * 0.26, hs * 0.3], [hs * 0.26 + Math.sin(th) * hs * 0.5, hs * 0.3 + Math.cos(th) * hs * 0.5], hs * 0.17, hs * 0.14, m, ld);
        if (mode === 'point') limbSeg(ctx, [-hs * 0.05, hs * 0.85], [-hs * 0.05, hs * 1.7], hs * 0.14, hs * 0.12, m, ld);
        ctx.restore();
      };
      const arm = (A2, isFar, handMode) => {
        const sm = mat(isFar ? dark(top, 0.14) : top, L), skm = isFar ? mat(dark(skin, 0.1), L) : mSkin;
        const r0 = limbR * 1.15, r1 = limbR * 0.92, r2 = limbR * 0.72;
        if (longSleeve) {
          limbSeg(ctx, A2.el, A2.wr, r1 * 1.05, r2 * 1.08, sm, ld);
          limbSeg(ctx, A2.sh, A2.el, r0, r1 * 1.05, sm, ld);
          // elbow fold + cuff
          ctx.strokeStyle = rgba(sm.deep, 0.6); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(A2.el[0], A2.el[1], r1 * 0.9, -A2.fa + 0.3, -A2.fa + 1.6); ctx.stroke();
          capsulePath(ctx, A2.wr[0] - Math.sin(A2.fa) * 3, A2.wr[1] - Math.cos(A2.fa) * 3, r2 * 1.12, A2.wr[0], A2.wr[1], r2 * 1.12); ctx.fillStyle = sm.shade; ctx.fill();
        } else {
          limbSeg(ctx, A2.el, A2.wr, r1 * 0.9, r2 * 0.9, skm, ld);
          limbSeg(ctx, A2.sh, A2.el, r0 * 0.85, r1 * 0.9, skm, ld);
          const mid = [lerp(A2.sh[0], A2.el[0], 0.55), lerp(A2.sh[1], A2.el[1], 0.55)];
          limbSeg(ctx, A2.sh, mid, r0 * 1.12, r1 * 1.18, sm, ld);
        }
        hand(A2.wr, A2.fa, handMode, isFar);
      };
      const holdProp = (A2) => {
        const kind = o.hold || P.hold; if (!kind || kind === 'none') return;
        ctx.save(); ctx.translate(A2.wr[0] + Math.sin(A2.fa) * H * 0.04, A2.wr[1] + Math.cos(A2.fa) * H * 0.04);
        if (kind === 'phone') {
          ctx.rotate(-0.25 + (o.phoneTilt || 0)); const pw = H * 0.05, ph = H * 0.095;
          rr(ctx, -pw / 2, -ph / 2, pw, ph, pw * 0.2, '#16181f');
          const lit = o.screen == null ? 1 : o.screen;
          const g = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2); g.addColorStop(0, mixHex('#1b2240', A.light, 0.55 * lit)); g.addColorStop(1, mixHex('#141a33', A.base, 0.35 * lit));
          rr(ctx, -pw / 2 + 2, -ph / 2 + 2, pw - 4, ph - 4, pw * 0.15, g);
          rr(ctx, -pw / 2 + 2, -ph / 2 + 2, (pw - 4) * 0.35, ph - 4, pw * 0.15, 'rgba(255,255,255,0.12)');
        } else if (kind === 'mug') {
          rr(ctx, -H * 0.025, -H * 0.03, H * 0.05, H * 0.06, 4, '#e9e4dc');
        } else if (kind === 'paper') {
          ctx.rotate(0.15); rr(ctx, -H * 0.04, -H * 0.05, H * 0.08, H * 0.1, 2, '#f3f1ea');
          ctx.fillStyle = 'rgba(40,50,80,0.35)'; for (let i = 0; i < 4; i++) ctx.fillRect(-H * 0.03, -H * 0.035 + i * H * 0.018, H * 0.06 * (i === 3 ? 0.6 : 1), 1.6);
        }
        ctx.restore();
      };
      const handNMode = P.handN || 'relax', handFMode = P.handF || 'relax';

      // ---- draw order: far arm (behind), back hair, legs, torso, neck, head, near arm
      ctx.save(); ctx.translate(hipC[0], hipC[1]); ctx.rotate(lean); ctx.translate(-hipC[0], -hipC[1]);
      if (!P.farFront) arm(armF, true, handFMode);
      ctx.restore();
      // hair behind the shoulders (long / ponytail) + hood
      const hs = o.hairStyle || (o.age === 'kid' ? 'short' : 'short');
      const headXf = () => { ctx.translate(hipC[0], hipC[1]); ctx.rotate(lean); ctx.translate(-hipC[0], -hipC[1]); ctx.translate(0, neckTopY); ctx.rotate((P.tilt || 0) * ex + fid.head + swayIdle * 0.3); ctx.translate(0, headCY - neckTopY); };
      const rx = hu * age.rx * (o.body === 'round' ? 1.04 : 1), ry = hu * 0.5;
      const look = clamp((o.look || 0) * dirS + fid.look * 0.3, -1, 1), nod = (P.nod || 0) + (o.nod || 0);
      const fx = f * rx * 0.42 + look * rx * 0.16;
      ctx.save(); headXf();
      backHair(ctx, hs, rx, ry, hu, mHair, ld, dangle, t, seed, f);
      ctx.restore();
      // legs (far, then near)
      if (outfit !== 'robe') { leg(legF, mBot, true); leg(legN, mBot, false); }
      if (outfit === 'dress' && P.sit) { // skirt drapes over the thighs to the knees
        const kx = Math.max(legN.knee[0], legF.knee[0]) + limbR * 1.6, ky = legN.knee[1];
        const sk = () => { ctx.beginPath(); ctx.moveTo(xs(-hipW * 1.2), hipY - H * 0.06); ctx.lineTo(xs(hipW * 1.1), hipY - H * 0.06); ctx.quadraticCurveTo(kx, ky - limbR * 1.8, kx + limbR * 0.4, ky + limbR * 1.6); ctx.lineTo(Math.min(xs(-hipW * 1.25), kx - limbR * 6), hipY + limbR * 2.2); ctx.closePath(); };
        solid(ctx, sk, mTop, [xs(-hipW * 1.25), hipY - H * 0.06, kx - xs(-hipW * 1.25) + 4, H * 0.12], ld, { rim: 2 });
      }
      // torso (rotated by lean)
      ctx.save(); ctx.translate(hipC[0], hipC[1]); ctx.rotate(lean); ctx.translate(-hipC[0], -hipC[1]);
      const waistW = sw * (0.78 + bt.belly * 2), bellyOut = H * bt.belly;
      const torsoTop = shY - H * 0.006, torsoBot = hipY + H * (outfit === 'dress' ? 0.16 : outfit === 'robe' ? -hipY / H : outfit === 'lab' ? 0.11 : 0.035);
      // pelvis / pants seat
      if (outfit !== 'dress' && outfit !== 'robe') {
        const pel = () => { ctx.beginPath(); ctx.moveTo(xs(-hipW * 0.98), hipY - H * 0.05); ctx.lineTo(xs(hipW * 0.98), hipY - H * 0.05); ctx.quadraticCurveTo(xs(hipW * 1.08), hipY + H * 0.02, xs(hipW * 0.75), hipY + H * 0.045); ctx.lineTo(xs(-hipW * 0.75), hipY + H * 0.045); ctx.quadraticCurveTo(xs(-hipW * 1.08), hipY + H * 0.02, xs(-hipW * 0.98), hipY - H * 0.05); ctx.closePath(); };
        solid(ctx, pel, mBot, [xs(-hipW), hipY - H * 0.05, xs(hipW) - xs(-hipW), H * 0.1], ld);
      }
      const torso = () => {
        const L0 = xs(-sw), R0 = xs(sw), Lw = xs(-waistW), Rw = xs(waistW + bellyOut * 0.6), hf = outfit === 'dress' ? 1.25 : outfit === 'lab' ? 1.08 : 1.04, Lh = xs(-hipW * hf), Rh = xs(hipW * hf);
        ctx.beginPath();
        ctx.moveTo(xs(-sw * 0.32), torsoTop - H * 0.012);
        ctx.quadraticCurveTo(L0 * 0.8, torsoTop + H * 0.0, L0, torsoTop + H * 0.035);
        ctx.quadraticCurveTo(L0 * 1.02, torsoTop + H * 0.1, Lw, (torsoTop + hipY) * 0.5 + H * 0.02);
        ctx.quadraticCurveTo(Lw * 1.02, hipY - H * 0.02, Lh, torsoBot);
        ctx.quadraticCurveTo(0, torsoBot + H * 0.012, Rh, torsoBot);
        ctx.quadraticCurveTo(Rw * 1.04, hipY - H * 0.02, Rw, (torsoTop + hipY) * 0.5 + H * 0.02);
        ctx.quadraticCurveTo(R0 * 1.02, torsoTop + H * 0.1, R0, torsoTop + H * 0.03);
        ctx.quadraticCurveTo(R0 * 0.8, torsoTop + H * 0.0, xs(sw * 0.32), torsoTop - H * 0.012);
        ctx.closePath();
      };
      const tb = [xs(-sw), torsoTop, xs(sw) - xs(-sw), torsoBot - torsoTop];
      // breathing: chest swells a touch
      ctx.save(); ctx.translate(0, hipY); ctx.scale(1 + br.chest * 0.012, 1 + br.chest * 0.008); ctx.translate(0, -hipY);
      solid(ctx, torso, mTop, tb, ld, { ao: 0.18, rim: 3 });
      ctx.save(); torso(); ctx.clip();
      // clothing details
      ctx.strokeStyle = rgba(mTop.deep, 0.45); ctx.lineWidth = 1.8; ctx.lineCap = 'round';
      const fold = (x0, y0, x1, y1, cx, cy) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(cx, cy, x1, y1); ctx.stroke(); };
      fold(xs(-sw * 0.75), torsoTop + H * 0.06, xs(-sw * 0.35), torsoTop + H * 0.12, xs(-sw * 0.6), torsoTop + H * 0.1);
      fold(xs(sw * 0.75), torsoTop + H * 0.065, xs(sw * 0.4), torsoTop + H * 0.13, xs(sw * 0.62), torsoTop + H * 0.11);
      fold(xs(-waistW * 0.8), hipY - H * 0.02, xs(-waistW * 0.2), hipY - H * 0.035, xs(-waistW * 0.5), hipY - H * 0.015);
      if (outfit === 'hoodie') {
        rr(ctx, xs(-sw * 0.55), hipY - H * 0.1, xs(sw * 0.55) - xs(-sw * 0.55), H * 0.085, H * 0.02, rgba(mTop.shade, 0.55));
        ctx.strokeStyle = rgba(mTop.deep, 0.5); ctx.lineWidth = 1.5; roundRect(ctx, xs(-sw * 0.55), hipY - H * 0.1, xs(sw * 0.55) - xs(-sw * 0.55), H * 0.085, H * 0.02); ctx.stroke();
        rr(ctx, xs(-waistW * 1.1), torsoBot - H * 0.028, xs(waistW * 1.1) - xs(-waistW * 1.1), H * 0.03, 4, rgba(mTop.shade, 0.7));
      }
      if (outfit === 'pajamas') { texture(ctx, 'stripes', xs(-sw) - 10, torsoTop, sw * 2 + 20, torsoBot - torsoTop + 10, tint(top, 0.5), 0.22); }
      if (outfit === 'suit' || outfit === 'lab' || outfit === 'cardigan') {
        // open jacket: shirt V + lapels
        const vx = fx * 0.3, vy = hipY - H * (outfit === 'suit' ? 0.07 : 0.03);
        ctx.beginPath(); ctx.moveTo(xs(-sw * 0.3) + vx, torsoTop - 4); ctx.lineTo(xs(sw * 0.3) + vx, torsoTop - 4); ctx.lineTo(vx + xs(sw * 0.06), vy); ctx.lineTo(vx - xs(sw * 0.06) * 0.5, vy); ctx.closePath();
        ctx.fillStyle = outfit === 'suit' ? CLOTH.white : outfit === 'lab' ? '#7f9cc6' : '#e8e2d6'; ctx.fill();
        ctx.strokeStyle = rgba(mTop.deep, 0.7); ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.moveTo(xs(-sw * 0.3) + vx, torsoTop); ctx.lineTo(vx - 2, vy); ctx.moveTo(xs(sw * 0.3) + vx, torsoTop); ctx.lineTo(vx + 2, vy); ctx.stroke();
        if (outfit === 'suit') { ctx.fillStyle = rgba(mTop.deep, 0.6); circle(ctx, vx + 3, vy + H * 0.03, 2.2, rgba(mTop.deep, 0.8)); }
      }
      if (outfit === 'office') { ctx.strokeStyle = rgba(mTop.deep, 0.35); ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(fx * 0.3 + 1, torsoTop + 6); ctx.lineTo(fx * 0.3 + 1, torsoBot); ctx.stroke(); for (let i = 0; i < 4; i++) circle(ctx, fx * 0.3 + 4, torsoTop + H * 0.05 + i * H * 0.05, 1.5, rgba(mTop.deep, 0.5)); }
      if (outfit === 'cleanroom') { ctx.fillStyle = rgba('#9fb3d6', 0.25); ctx.fillRect(fx * 0.3 - 1, torsoTop, 2.5, torsoBot - torsoTop); }
      ctx.restore();
      // belt line for tucked outfits
      if (outfit === 'office') { rr(ctx, xs(-waistW * 1.0), hipY - H * 0.03, xs(waistW * 1.0) - xs(-waistW * 1.0), H * 0.011, 2, rgba(mBot.deep, 0.85)); rr(ctx, xs(waistW * 0.05) + fx * 0.3, hipY - H * 0.032, H * 0.02, H * 0.015, 2, '#b9a77a'); }
      ctx.restore();
      // neck
      const nw = hu * (o.age === 'kid' ? 0.2 : 0.17) * (bt.w * 0.5 + 0.5);
      limbSeg(ctx, [fx * 0.25, shY + 2], [fx * 0.3, neckTopY - hu * 0.05], nw, nw * 0.95, mat(dark(skin, 0.18), L), ld);
      // collar / neckline
      if (outfit === 'tee' || outfit === 'pajamas' || outfit === 'dress') { ctx.beginPath(); ctx.ellipse(fx * 0.25, shY + 1, nw * 1.35, H * 0.012, 0, 0, PI); ctx.lineWidth = 3; ctx.strokeStyle = mTop.shade; ctx.stroke(); }
      if (outfit === 'hoodie') { // hood bunched behind the neck + drawstrings with follow-through
        ctx.beginPath(); ctx.ellipse(fx * 0.1, shY - 2, sw * 0.62, H * 0.03, 0, PI, TAU); ctx.fillStyle = mTop.shade; ctx.fill();
        ctx.strokeStyle = '#eef0f4'; ctx.lineWidth = 2; ctx.lineCap = 'round';
        for (const k of [-1, 1]) { const x0 = fx * 0.25 + k * nw * 0.9, y0 = shY + 4, a = dangle[0] * 1.4 + swayIdle + lean; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(x0 + Math.sin(a) * 8, y0 + H * 0.05, x0 + Math.sin(a + dangle[1]) * H * 0.04, y0 + H * 0.085); ctx.stroke(); }
      }
      if (outfit === 'office' || outfit === 'suit') {
        const cx0 = fx * 0.28;
        ctx.fillStyle = '#f4f6fa'; poly(ctx, [[cx0 - nw * 1.4, shY - 3], [cx0, shY + H * 0.03], [cx0 - nw * 0.2, shY + H * 0.035], [cx0 - nw * 1.6, shY + H * 0.015]]); ctx.fill();
        poly(ctx, [[cx0 + nw * 1.4, shY - 3], [cx0, shY + H * 0.03], [cx0 + nw * 0.2, shY + H * 0.035], [cx0 + nw * 1.6, shY + H * 0.015]]); ctx.fill();
        if (tieC) { // tie swings with follow-through (overlapping action)
          const tm = mat(tieC, L), a0 = -(lean) + dangle[0] * 1.6 + swayIdle * 0.5, a1 = a0 + dangle[1] * 1.2;
          const p0 = [cx0, shY + H * 0.028], p1 = [p0[0] + Math.sin(a0) * H * 0.09, p0[1] + Math.cos(a0) * H * 0.09], p2 = [p1[0] + Math.sin(a1) * H * 0.075, p1[1] + Math.cos(a1) * H * 0.075];
          ctx.beginPath(); ctx.moveTo(p0[0] - 4, p0[1]); ctx.lineTo(p0[0] + 4, p0[1]); ctx.lineTo(p1[0] + 6, p1[1]); ctx.lineTo(p2[0] + 7, p2[1] - 4); ctx.lineTo(p2[0], p2[1] + 5); ctx.lineTo(p2[0] - 7, p2[1] - 4); ctx.lineTo(p1[0] - 6, p1[1]); ctx.closePath();
          const g = ctx.createLinearGradient(p0[0] - 8, 0, p0[0] + 8, 0); g.addColorStop(0, tm.lit); g.addColorStop(0.6, tm.base); g.addColorStop(1, tm.shade); ctx.fillStyle = g; ctx.fill();
          ell(ctx, p0[0], p0[1] + 1, 5, 4.5, 0, tm.shade);
        }
      }
      ctx.restore();
      // head
      ctx.save(); headXf();
      if (o.hold === 'phone' || P.hold === 'phone') glowAt(ctx, fx, ry * 0.6, hu * 0.9, A.light, 0.18 * (o.screen == null ? 1 : o.screen));
      drawHead(ctx, { rx, ry, hu, fx, f, look, nod, ld, rimSide, mSkin, mHair, hs, skin, hairC, eyeC: pick(EYES, o.eyes, seed), age, o, t, seed, blinkK, dangle, expr: o.expr || o.mood || 'neutral', talk: clamp(o.talk || 0) });
      ctx.restore();
      // near arm (+ far arm in front for two-handed poses), props in hand
      ctx.save(); ctx.translate(hipC[0], hipC[1]); ctx.rotate(lean); ctx.translate(-hipC[0], -hipC[1]);
      if (P.farFront) { arm(armF, true, handFMode); }
      holdProp(armN);
      arm(armN, false, handNMode);
      ctx.restore();
      ctx.restore();
      // anchors in world coordinates for scenes (hand position, head) -> o.out
      if (o.out) {
        const toW = (p) => { const cl = Math.cos(lean), sl = Math.sin(lean), px = p[0] - hipC[0], py = p[1] - hipC[1]; const lx = hipC[0] + px * cl - py * sl, ly = hipC[1] + px * sl + py * cl; return [x + lx * dirS * s, y + ly * s]; };
        o.out.hand = toW(armN.wr); o.out.farHand = toW(armF.wr); o.out.head = toW([fx, headCY]); o.out.top = toW([0, headCY - ry]);
      }
    }

    // ---- hair behind the head (long, ponytail, curly volume, bun base)
    function backHair(ctx, hs, rx, ry, hu, m, ld, dangle, t, seed, f) {
      if (hs === 'long' || hs === 'bob') {
        const len = hs === 'long' ? hu * 1.25 : hu * 0.6, sw = dangle[0] * 18 + M.sway(t, seed + 1, 2, 0.4), sw2 = dangle[1] * 26 + sw;
        const p = () => { ctx.beginPath(); ctx.moveTo(-rx * 1.12, -ry * 0.2); ctx.bezierCurveTo(-rx * 1.25, ry * 0.6, -rx * 1.1 + sw, len * 0.8, -rx * 0.85 + sw2, len); ctx.quadraticCurveTo(0 + sw2, len * 1.08, rx * 0.85 + sw2, len); ctx.bezierCurveTo(rx * 1.1 + sw, len * 0.8, rx * 1.25, ry * 0.6, rx * 1.12, -ry * 0.2); ctx.bezierCurveTo(rx * 1.1, -ry * 1.3, -rx * 1.1, -ry * 1.3, -rx * 1.12, -ry * 0.2); ctx.closePath(); };
        solid(ctx, p, mat(dark(m.base, 0.15), DEFAULT_LIGHT), [-rx * 1.25, -ry * 1.2, rx * 2.5, len + ry * 1.2], ld, { rim: 3 });
      } else if (hs === 'ponytail') {
        const a = [0.35 + dangle[0] * 1.6 + M.sway(t, seed + 2, 0.06, 0.5), 0, 0]; a[1] = a[0] + dangle[1] * 2.2; a[2] = a[1] + dangle[2] * 2.6;
        let px = -rx * 0.7 + f * -rx * 0.25, py = -ry * 0.55; const seg = hu * 0.32;
        const pts = [[px, py]];
        for (let i = 0; i < 3; i++) { px += Math.sin(-a[i] - 0.15) * seg * -1; py += Math.cos(a[i]) * seg; pts.push([px - i * 2, py]); }
        for (let i = 0; i < 3; i++) limbSeg(ctx, pts[i], pts[i + 1], hu * (0.16 - i * 0.035), hu * (0.13 - i * 0.04), m, ld);
      } else if (hs === 'curly' || hs === 'afro') {
        const R = hs === 'afro' ? 1.38 : 1.2;
        for (let i = 0; i < 11; i++) { const an = PI + (i / 10) * PI, rr2 = rx * R; circle(ctx, Math.cos(an) * rr2 * 0.95, -ry * 0.25 + Math.sin(an) * ry * 1.05 * (R - 0.08), rx * 0.42, i % 2 ? m.shade : m.base); }
      }
    }

    // ---- head + face
    const EXPR = {
      // brow: [raise, tilt(+ = inner up / worried)], lid: upper lid closure 0..1, low: lower lid raise, mouth, open
      neutral: { brow: [0, 0], lid: 0.18, low: 0.05, mouth: 'soft', open: 0 },
      happy: { brow: [0.15, 0.05], lid: 0.12, low: 0.3, mouth: 'smile', open: 0.15 },
      joy: { brow: [0.45, 0.1], lid: 0.05, low: 0.42, mouth: 'grin', open: 0.65 },
      surprised: { brow: [0.85, 0.15], lid: -0.12, low: 0, mouth: 'o', open: 0.55, iris: 0.82 },
      shocked: { brow: [1, 0.35], lid: -0.2, low: 0, mouth: 'o', open: 0.9, iris: 0.72 },
      worried: { brow: [0.35, 0.75], lid: 0.12, low: 0.1, mouth: 'frown', open: 0.1 },
      sad: { brow: [0.1, 0.8], lid: 0.38, low: 0.05, mouth: 'frown', open: 0 },
      angry: { brow: [-0.45, -0.85], lid: 0.32, low: 0.25, mouth: 'frown', open: 0.25 },
      thinking: { brow: [0.35, -0.3], lid: 0.28, low: 0.15, mouth: 'smirk', open: 0 },
      focused: { brow: [-0.15, -0.25], lid: 0.32, low: 0.2, mouth: 'flat', open: 0 },
      smirk: { brow: [0.2, -0.2], lid: 0.25, low: 0.25, mouth: 'smirk', open: 0 },
      sleepy: { brow: [-0.05, 0.2], lid: 0.55, low: 0.1, mouth: 'soft', open: 0 },
      curious: { brow: [0.55, 0.0], lid: 0.06, low: 0.12, mouth: 'smile', open: 0.08 },
    };
    function exprOf(e) { if (typeof e === 'object' && e) return Object.assign({}, EXPR.neutral, e); return EXPR[e] || EXPR.neutral; }
    function drawHead(ctx, H) {
      const { rx, ry, hu, fx, f, look, nod, ld, rimSide, mSkin, mHair, hs, skin, hairC, eyeC, age, o, t, seed, blinkK, talk } = H;
      let E = exprOf(H.expr);
      if (o.expr2 && o.exprMix > 0) E = M.mix(E, exprOf(o.expr2), clamp(o.exprMix));
      const ny = nod * hu * 0.07;                 // features shift down when looking down
      const kid = o.age === 'kid';
      // ears (only the visible one in 3/4)
      const earY = ry * 0.05 + ny * 0.5;
      const ear = (x) => { ell(ctx, x, earY, rx * 0.17, ry * 0.2, 0, mSkin.shade); ell(ctx, x + sgn(x) * -1, earY + 1, rx * 0.09, ry * 0.12, 0, dark(skin, 0.3)); };
      if (f < 0.75) ear(rx * 0.98 - f * rx * 0.2);
      ear(-rx * 0.98 + f * rx * 0.25);
      // skull + jaw
      const chinX = fx * 0.75, jaw = age.jaw;
      const head = () => {
        ctx.beginPath(); ctx.moveTo(-rx, -ry * 0.12);
        ctx.bezierCurveTo(-rx, -ry * 1.32, rx, -ry * 1.32, rx, -ry * 0.12);
        ctx.bezierCurveTo(rx * (1.0 + 0.02 * jaw), ry * (0.45 + 0.08 * jaw), chinX + rx * (0.62 - 0.12 * jaw), ry * (0.98), chinX, ry);
        ctx.bezierCurveTo(chinX - rx * (0.62 - 0.12 * jaw) - f * rx * 0.2, ry * 0.98, -rx * (1.0 + 0.02 * jaw), ry * (0.45 + 0.08 * jaw), -rx, -ry * 0.12);
        ctx.closePath();
      };
      head(); ctx.fillStyle = mSkin.rim; ctx.fill();
      ctx.save(); head(); ctx.clip();
      ctx.translate(-rimSide * 3.2, -0.8); head();
      const g = ctx.createRadialGradient(ld * rx * 0.45 + fx * 0.4, -ry * 0.35, rx * 0.1, fx * 0.2, 0, rx * 1.35);
      g.addColorStop(0, mSkin.lit); g.addColorStop(0.5, mSkin.base); g.addColorStop(0.85, mSkin.shade); g.addColorStop(1, mSkin.deep);
      ctx.fillStyle = g; ctx.fill(); ctx.translate(rimSide * 3.2, 0.8);
      // cheek blush, under-hair shadow, jaw shadow
      ell(ctx, fx + rx * 0.42, ry * 0.32 + ny, rx * 0.2, ry * 0.11, 0, 'rgba(230,110,110,0.16)');
      ell(ctx, fx - rx * 0.42 * (1 - 0.4 * f), ry * 0.32 + ny, rx * 0.18 * (1 - 0.3 * f), ry * 0.1, 0, 'rgba(230,110,110,0.14)');
      ctx.restore();
      // ---- eyes
      const eyeY = ry * 0.08 + ny, sp = rx * 0.43, er = hu * 0.08 * age.eye;
      const eyes = [{ x: fx + sp * (1 - 0.12 * f), w: 1 + 0.05 * f, near: true }, { x: fx - sp * (1 - 0.42 * f), w: 1 - 0.32 * f, near: false }];
      const lid = clamp(E.lid + blinkK * (1 - E.lid + 0.05), -0.3, 1), low = E.low;
      const gaze = clamp(look * 0.55 + f * 0.25, -1, 1), gy = nod * 0.35 + (o.gazeY || 0);
      for (const e of eyes) {
        const erx = er * e.w, ery = er * 1.08;
        ctx.save();
        const eyePath = () => { ctx.beginPath(); ctx.ellipse(e.x, eyeY, erx, ery, 0, 0, TAU); };
        eyePath(); ctx.fillStyle = '#f4f1ec'; ctx.fill(); ctx.clip();
        const ir = ery * 0.72 * (E.iris || 1), ix = e.x + gaze * erx * 0.42, iy = eyeY + gy * ery * 0.3 + ery * 0.05;
        circle(ctx, ix, iy, ir, eyeC); circle(ctx, ix, iy, ir * 0.78, mixHex(eyeC, '#000000', 0.25));
        const ig = ctx.createRadialGradient(ix, iy + ir * 0.4, 0, ix, iy + ir * 0.4, ir); ig.addColorStop(0, rgba(tint(eyeC, 0.5), 0.6)); ig.addColorStop(1, rgba(eyeC, 0)); ctx.fillStyle = ig; ctx.fillRect(ix - ir, iy - ir, ir * 2, ir * 2);
        circle(ctx, ix, iy, ir * 0.42, '#0d0d12');
        circle(ctx, ix - ld * ir * 0.38, iy - ir * 0.42, ir * 0.24, 'rgba(255,255,255,0.95)');
        circle(ctx, ix + ld * ir * 0.3, iy + ir * 0.35, ir * 0.1, 'rgba(255,255,255,0.7)');
        // lid shadow on the eyeball
        const sh = ctx.createLinearGradient(0, eyeY - ery, 0, eyeY); sh.addColorStop(0, 'rgba(60,30,30,0.35)'); sh.addColorStop(1, 'rgba(60,30,30,0)'); ctx.fillStyle = sh; ctx.fillRect(e.x - erx, eyeY - ery, erx * 2, ery);
        // upper lid (skin) closes from the top; tilt for angry/sad
        const lidY = eyeY - ery + (ery * 2) * clamp(lid) * 0.98, tilt = (E.brow[1] || 0) * (e.near ? 1 : -1) * ery * 0.25 * (lid > 0.1 ? 1 : 0.3);
        ctx.beginPath(); ctx.moveTo(e.x - erx * 1.3, eyeY - ery * 1.4); ctx.lineTo(e.x + erx * 1.3, eyeY - ery * 1.4);
        ctx.lineTo(e.x + erx * 1.3, lidY + tilt); ctx.quadraticCurveTo(e.x, lidY - ery * 0.25 * (1 - clamp(lid)), e.x - erx * 1.3, lidY - tilt); ctx.closePath();
        ctx.fillStyle = mSkin.base; ctx.fill();
        // lower lid
        if (low > 0) { const ly = eyeY + ery - ery * 1.2 * low; ctx.beginPath(); ctx.moveTo(e.x - erx * 1.3, eyeY + ery * 1.3); ctx.lineTo(e.x - erx * 1.3, ly + ery * 0.3); ctx.quadraticCurveTo(e.x, ly - ery * 0.2, e.x + erx * 1.3, ly + ery * 0.3); ctx.lineTo(e.x + erx * 1.3, eyeY + ery * 1.3); ctx.closePath(); ctx.fillStyle = mSkin.base; ctx.fill(); }
        ctx.restore();
        // lash line (upper) follows the lid; lower crease
        ctx.strokeStyle = '#231a1a'; ctx.lineCap = 'round';
        const ly2 = eyeY - ery + (ery * 2) * clamp(lid) * 0.98;
        ctx.lineWidth = Math.max(1.6, er * 0.32); ctx.beginPath();
        if (lid > 0.9) { ctx.moveTo(e.x - erx * 1.05, ly2 - 1); ctx.quadraticCurveTo(e.x, ly2 + ery * 0.3, e.x + erx * 1.05, ly2 - 1); }
        else { const tl = (E.brow[1] || 0) * (e.near ? 1 : -1) * ery * 0.25 * (lid > 0.1 ? 1 : 0.3); const yy = Math.max(eyeY - ery, ly2); ctx.moveTo(e.x - erx * 1.02, Math.min(eyeY, yy - tl)); ctx.quadraticCurveTo(e.x, yy - ery * 0.32 * (1 - clamp(lid)), e.x + erx * 1.08, Math.min(eyeY, yy + tl) - (e.near ? 1.5 : 0)); }
        ctx.stroke();
        ctx.lineWidth = 1.1; ctx.strokeStyle = rgba(mSkin.deep, 0.6); ctx.beginPath(); ctx.ellipse(e.x, eyeY + 1, erx * 0.95, ery * 1.02, 0, 0.25 * PI, 0.75 * PI); ctx.stroke();
      }
      // ---- brows
      const browY = eyeY - er * 1.75 - E.brow[0] * er * 0.75;
      ctx.lineCap = 'round';
      for (const e of eyes) {
        const inner = e.near ? -1 : 1, bx = e.x, w = er * 1.35 * e.w, tiltB = E.brow[1] * er * 0.55;
        const x0 = bx + inner * w, x1 = bx - inner * w;           // inner end, outer end
        const y0 = browY - tiltB, y1 = browY + tiltB * 0.3;
        ctx.beginPath(); ctx.moveTo(x0, y0 + 1); ctx.quadraticCurveTo(bx, Math.min(y0, y1) - er * 0.35, x1, y1 + 1.5);
        ctx.lineWidth = Math.max(2.2, er * 0.55); ctx.strokeStyle = dark(hairC, 0.15); ctx.stroke();
      }
      // ---- nose
      const nX = fx * 1.12 + rx * 0.02, nY = ry * 0.36 + ny;
      ctx.beginPath(); ctx.moveTo(nX - ld * rx * 0.05 + f * rx * 0.02, nY - ry * 0.2); ctx.quadraticCurveTo(nX + f * rx * 0.16 + rx * 0.06, nY, nX + f * rx * 0.05, nY + ry * 0.03);
      ctx.lineWidth = 1.8; ctx.strokeStyle = rgba(mSkin.deep, 0.55); ctx.stroke();
      ell(ctx, nX - rx * 0.03, nY + ry * 0.02, rx * 0.12, ry * 0.05, 0, rgba(mSkin.deep, 0.18));
      circle(ctx, nX + ld * rx * 0.05, nY - ry * 0.03, rx * 0.04, rgba(mSkin.spec, 0.55));
      // ---- mouth
      const mX = fx * 1.05, mY = ry * 0.6 + ny * 0.8, mw = rx * (kid ? 0.3 : 0.34);
      const flap = talk > 0.04 ? clamp(talk * (0.45 + 0.55 * Math.abs(Math.sin(t * 13.3 + seed) * Math.sin(t * 7.1 + seed * 2)))) : 0;
      const open = clamp(Math.max(E.open, flap));
      const lip = dark(mixHex(skin, '#b3505a', 0.45), 0.1), inside = '#4a1820';
      ctx.lineCap = 'round';
      if (open > 0.08) {
        const oh = ry * 0.22 * open, ow = E.mouth === 'o' ? mw * 0.6 : mw * (E.mouth === 'grin' ? 1.05 : 0.85);
        const curve = E.mouth === 'grin' || E.mouth === 'smile' ? ry * 0.06 : E.mouth === 'frown' ? -ry * 0.05 : 0;
        ctx.beginPath(); ctx.moveTo(mX - ow, mY - curve * 0.3);
        ctx.quadraticCurveTo(mX, mY - oh * 0.35 + curve * 0.2, mX + ow, mY - curve * 0.3);
        ctx.quadraticCurveTo(mX, mY + oh + curve, mX - ow, mY - curve * 0.3); ctx.closePath();
        ctx.fillStyle = inside; ctx.fill();
        ctx.save(); ctx.clip();
        rr(ctx, mX - ow, mY - oh * 0.5, ow * 2, oh * 0.42 + 2, 2, '#f2efe9');
        ell(ctx, mX + ow * 0.15, mY + oh * 0.85, ow * 0.6, oh * 0.45, 0, '#c9545e');
        ctx.restore();
        ctx.strokeStyle = rgba(lip, 0.8); ctx.lineWidth = 1.6; ctx.stroke();
      } else {
        ctx.beginPath();
        const c = E.mouth === 'smile' ? ry * 0.09 : E.mouth === 'grin' ? ry * 0.11 : E.mouth === 'frown' ? -ry * 0.07 : E.mouth === 'soft' ? ry * 0.025 : 0;
        if (E.mouth === 'smirk') { ctx.moveTo(mX - mw * 0.8, mY + 1); ctx.quadraticCurveTo(mX + mw * 0.2, mY + ry * 0.03, mX + mw * 0.85, mY - ry * 0.06); }
        else { ctx.moveTo(mX - mw, mY - c * 0.35); ctx.quadraticCurveTo(mX, mY + c, mX + mw, mY - c * 0.35); }
        ctx.lineWidth = Math.max(2, hu * 0.035); ctx.strokeStyle = dark(lip, 0.25); ctx.stroke();
        // lower lip highlight
        ctx.beginPath(); ctx.ellipse(mX, mY + ry * 0.07 + Math.max(0, c) * 0.4, mw * 0.45, ry * 0.025, 0, 0, TAU); ctx.fillStyle = rgba(mSkin.spec, 0.3); ctx.fill();
      }
      // smile lines for older characters
      if (o.age === 'older') { ctx.strokeStyle = rgba(mSkin.deep, 0.35); ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(mX + mw * 1.05, mY - ry * 0.22); ctx.quadraticCurveTo(mX + mw * 1.35, mY - ry * 0.02, mX + mw * 1.1, mY + ry * 0.1); ctx.stroke(); }
      // glasses
      if (o.glasses) { ctx.strokeStyle = typeof o.glasses === 'string' ? o.glasses : '#2a2422'; ctx.lineWidth = 2.2; for (const e of eyes) { roundRect(ctx, e.x - er * 1.45 * e.w, eyeY - er * 1.15, er * 2.9 * e.w, er * 2.2, er * 0.7); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(eyes[1].x + er * 1.45 * eyes[1].w, eyeY - er * 0.3); ctx.lineTo(eyes[0].x - er * 1.45, eyeY - er * 0.3); ctx.stroke(); }
      // ---- front hair
      frontHair(ctx, hs, rx, ry, hu, fx, f, mHair, ld, H.dangle, t, seed);
    }
    function frontHair(ctx, hs, rx, ry, hu, fx, f, m, ld, dangle, t, seed) {
      if (hs === 'none' || hs === 'bald') { ell(ctx, -ld * rx * 0.35, -ry * 0.75, rx * 0.25, ry * 0.12, -0.3, 'rgba(255,255,255,0.16)'); return; }
      const sheen = (y0) => { ctx.save(); ctx.globalAlpha = 0.55; ctx.strokeStyle = m.spec; ctx.lineWidth = hu * 0.045; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(-ld * rx * 0.1, y0 + ry * 0.55, rx * 0.72, -PI * 0.5 + ld * 0.75 - 0.42, -PI * 0.5 + ld * 0.75 + 0.42); ctx.stroke(); ctx.restore(); };
      const part = fx * 0.6 + rx * 0.25;
      if (hs === 'curly' || hs === 'afro') {
        const R = hs === 'afro' ? 1.32 : 1.12;
        for (let i = 0; i < 9; i++) { const an = PI * 1.08 + (i / 8) * PI * 0.84; circle(ctx, Math.cos(an) * rx * R * 0.92 + fx * 0.2, -ry * 0.3 + Math.sin(an) * ry * R * 0.86, rx * 0.36, i % 3 === 0 ? m.shade : m.base); }
        for (let i = 0; i < 5; i++) { const an = PI * 1.25 + (i / 4) * PI * 0.5; circle(ctx, Math.cos(an) * rx * 0.75 + fx * 0.3 - ld * 3, -ry * 0.45 + Math.sin(an) * ry * 0.75, rx * 0.2, rgba(m.spec, 0.25)); }
        return;
      }
      const cap = () => {
        ctx.beginPath(); ctx.moveTo(-rx * 1.06, ry * (hs === 'short' || hs === 'buzz' ? -0.05 : 0.25));
        const vol = hs === 'short' ? 1.52 : 1.42;
        ctx.bezierCurveTo(-rx * 1.14, -ry * vol, rx * 1.14, -ry * vol, rx * 1.06, ry * (hs === 'short' || hs === 'buzz' ? -0.15 : 0.1));
        if (hs === 'buzz') { ctx.quadraticCurveTo(rx * 0.6, -ry * 0.62, 0, -ry * 0.68); ctx.quadraticCurveTo(-rx * 0.6, -ry * 0.62, -rx * 1.06, -ry * 0.05); }
        else if (hs === 'short') { // tufted fringe swept toward the facing side
          ctx.quadraticCurveTo(rx * 1.0, -ry * 0.5, rx * 0.82, -ry * 0.42);
          ctx.quadraticCurveTo(rx * 0.7, -ry * 0.62, rx * 0.5, -ry * 0.5);
          ctx.quadraticCurveTo(rx * 0.32, -ry * 0.72, part, -ry * 0.56);
          ctx.quadraticCurveTo(part - rx * 0.25, -ry * 0.78, part - rx * 0.5, -ry * 0.6);
          ctx.quadraticCurveTo(-rx * 0.45, -ry * 0.72, -rx * 0.7, -ry * 0.42);
          ctx.quadraticCurveTo(-rx * 0.95, -ry * 0.38, -rx * 1.06, -ry * 0.05);
        } else if (hs === 'ponytail' || hs === 'bun') {
          ctx.quadraticCurveTo(rx * 0.95, -ry * 0.45, part + rx * 0.35, -ry * 0.55);
          ctx.quadraticCurveTo(part, -ry * 0.42, part - rx * 0.15, -ry * 0.62);
          ctx.quadraticCurveTo(-rx * 0.4, -ry * 0.48, -rx * 0.85, -ry * 0.25);
          ctx.quadraticCurveTo(-rx * 1.0, -ry * 0.1, -rx * 1.06, ry * 0.25);
        } else { // long / bob: side-swept fringe framing the face
          const sw = dangle[0] * 8;
          ctx.quadraticCurveTo(rx * 1.1 + sw, ry * 0.5, rx * 0.95 + sw, ry * 0.75);
          ctx.quadraticCurveTo(rx * 0.75, ry * 0.1, rx * 0.68, -ry * 0.35);
          ctx.quadraticCurveTo(part, -ry * 0.25, part - rx * 0.4, -ry * 0.62);
          ctx.quadraticCurveTo(-rx * 0.5, -ry * 0.2, -rx * 0.8, ry * 0.2);
          ctx.quadraticCurveTo(-rx * 0.95 + sw, ry * 0.7, -rx * 1.0 + sw, ry * 0.78);
          ctx.quadraticCurveTo(-rx * 1.12, ry * 0.4, -rx * 1.06, ry * 0.25);
        }
        ctx.closePath();
      };
      solid(ctx, cap, m, [-rx * 1.1, -ry * 1.3, rx * 2.2, ry * 1.6], ld, { rim: 2.5, mid: 0.35 });
      // strand lines + sheen
      ctx.save(); cap(); ctx.clip();
      ctx.strokeStyle = rgba(m.deep, 0.45); ctx.lineWidth = 1.3;
      for (let i = 0; i < 6; i++) { const xx = -rx * 0.8 + i * rx * 0.32; ctx.beginPath(); ctx.moveTo(part, -ry * 1.1); ctx.quadraticCurveTo(xx * 0.8, -ry * 0.95, xx, -ry * 0.35); ctx.stroke(); }
      ctx.restore();
      sheen(-ry * 1.05);
      if (hs === 'bun') { const bx = -rx * 0.1, by = -ry * 1.12; solid(ctx, () => { ctx.beginPath(); ctx.arc(bx, by, rx * 0.42, 0, TAU); }, m, [bx - rx * 0.42, by - rx * 0.42, rx * 0.84, rx * 0.84], ld, { rim: 2 }); }
      if (hs === 'ponytail') { rr(ctx, -rx * 0.95 - f * rx * 0.2, -ry * 0.65, rx * 0.22, ry * 0.18, 3, A.shade); }
    }

    // ================================================================ ROBOTS
    // drawRobot(ctx, x, y, s, opts): the channel mascot restyled (white glossy head, dark visor, lime #c4ff3a eyes),
    // ~300 px tall at scale 1. opts: t, state idle|happy|thinking|talk|surprised|working, pose stand|wave|point|cheer|
    // shrug|present|type, talk 0..1, look -1..1, facing -1..1, squash (s, see motion.squash), drive/driveY (functions of
    // time for antenna follow-through), seed, light, glow (eye glow 0..1), hover (px), out (anchors).
    function drawRobot(ctx, x, y, s, o = {}) {
      const t = o.t || 0, seed = o.seed == null ? 3 : o.seed, st = o.state || 'idle';
      const L = Object.assign({}, DEFAULT_LIGHT, o.light || {});
      const facing = o.facing == null ? 0.2 : clamp(o.facing, -1, 1), dirS = facing < 0 ? -1 : 1, f = Math.abs(facing), ld = L.dir * dirS;
      const W = mat(MASCOT.head, L), D = mat('#2a2f40', L), EYE = MASCOT.eye;
      const br = M.breathe(t, seed, 0.3), hover = o.hover || 0;
      const sig = (tt) => (o.drive ? o.drive(tt) : 0) + (o.driveY ? o.driveY(tt) * 0.8 : 0) + M.sway(tt, seed, 3, 0.4);
      const ant = M.chain(sig, t, 2, { gain: 0.012 / Math.max(0.5, s), freq: 3, damp: 0.22, max: 1.2 });
      const blinkK = M.blink(t, seed + 2);
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      if (o.shadow !== false) contactShadow(ctx, 0, 0, 150 * (1 - Math.min(0.5, hover / 200)), (L.ao || 0.42) * (o.shadowA == null ? 1 : o.shadowA));
      ctx.translate(0, -hover);
      if (o.squash) { const q = M.squash(o.squash); ctx.scale(q.sx, q.sy); }
      if (dirS < 0) ctx.scale(-1, 1);
      // legs
      for (const k of [-1, 1]) {
        const lx = k * 24 * (k < 0 ? 1 - 0.3 * f : 1);
        limbSeg(ctx, [lx, -78], [lx, -24], 12, 11, k < 0 ? mat('#3a4052', L) : D, ld);
        const fp = () => { ctx.beginPath(); ctx.ellipse(lx + 6 * f, -12, 27, 15, 0, PI, TAU); ctx.lineTo(lx + 33, -2); ctx.quadraticCurveTo(lx, 2, lx - 21, -2); ctx.closePath(); };
        solid(ctx, fp, k < 0 ? mat(dark(MASCOT.head, 0.12), L) : W, [lx - 27, -27, 60, 28], ld, { rim: 2, top: 0.5 });
        rr(ctx, lx - 22, -6, 50, 6, 3, '#2a2f40');
      }
      // arms (pose angles like the human rig, + = toward the facing side)
      const POSE = { stand: [0.18, 0.25, -0.18, -0.25], wave: [2.3, 0.6 + Math.sin(t * 9) * 0.35, -0.2, -0.2], point: [1.65, 0.05, -0.2, -0.25], cheer: [2.6, 0.2, -2.6, -0.2], shrug: [0.5, 1.1, -0.5, -1.1], present: [1.15, 0.4, -0.2, -0.25], type: [0.6, 1.0, 0.45, 1.05] }[o.pose || (st === 'happy' ? 'cheer' : st === 'working' ? 'type' : 'stand')] || [0.18, 0.25, -0.18, -0.25];
      const idle = M.hold(t, seed, 0.06);
      const shY = -196 + br.k * 1.2;
      const armFK = (k, a, e) => { const sh = [k * 64 * (k < 0 ? 1 - 0.35 * f : 1), shY]; const el = [sh[0] + Math.sin(a) * 52, sh[1] + Math.cos(a) * 52]; const fa = a + e; return { sh, el, wr: [el[0] + Math.sin(fa) * 46, el[1] + Math.cos(fa) * 46], fa }; };
      const aN = armFK(1, POSE[0] + idle, POSE[1]), aF = armFK(-1, POSE[2] - idle, POSE[3]);
      const arm = (A2, far) => {
        const m = far ? mat(dark(MASCOT.head, 0.14), L) : W;
        limbSeg(ctx, A2.sh, A2.el, 13, 11, m, ld); circle(ctx, A2.el[0], A2.el[1], 9, far ? '#353b4c' : '#2a2f40');
        limbSeg(ctx, A2.el, A2.wr, 11, 10, m, ld);
        ctx.save(); ctx.translate(A2.wr[0], A2.wr[1]); ctx.rotate(-A2.fa);
        solid(ctx, () => { ctx.beginPath(); ctx.ellipse(0, 12, 15, 16, 0, 0, TAU); }, m, [-15, -4, 30, 32], ld, { rim: 1.5 });
        limbSeg(ctx, [10, 6], [19, 16], 5.5, 5, m, ld); rr(ctx, -12, 0, 24, 6, 3, '#2a2f40');
        ctx.restore();
      };
      arm(aF, true);
      // body: glossy egg with a dark chest panel
      const body = () => { ctx.beginPath(); ctx.moveTo(-58, -186); ctx.bezierCurveTo(-66, -120, -58, -86, -38, -74); ctx.quadraticCurveTo(0, -64, 38, -74); ctx.bezierCurveTo(58, -86, 66, -120, 58, -186); ctx.quadraticCurveTo(0, -206, -58, -186); ctx.closePath(); };
      ctx.save(); ctx.translate(0, -130); ctx.scale(1 - 0.12 * f + br.chest * 0.008, 1); ctx.translate(0, 130);
      solid(ctx, body, W, [-64, -206, 128, 136], ld, { rim: 4, ao: 0.25, top: 0.25 });
      rr(ctx, -32, -170, 64 - 8 * f, 54, 14, '#151926');
      const lv = st === 'working' ? 0.7 : clamp(o.talk || 0);
      for (let i = 0; i < 5; i++) { const h = 6 + 26 * lv * (0.35 + 0.65 * Math.abs(Math.sin(t * 9 + i * 1.3))); rr(ctx, -22 + i * 10, -143 - h / 2, 6, h, 3, EYE); }
      glowAt(ctx, 0, -143, 50, EYE, 0.12 + 0.25 * lv);
      ctx.restore();
      // neck
      rr(ctx, -16, -212, 32, 20, 8, '#2a2f40');
      // head (tilt + nod), antenna follows through
      const tilt = (st === 'thinking' ? -0.1 : 0) + M.hold(t, seed + 4, 0.025) + (o.tilt || 0);
      ctx.save(); ctx.translate(0, -208); ctx.rotate(tilt);
      const hx = 6 * f + (o.look || 0) * 4;
      // antenna (overlapping action: 2 lagged segments)
      const a0 = ant[0] * 1.4 - tilt * 0.5, a1 = a0 + ant[1] * 1.6;
      const p0 = [hx * 0.5, -118], p1 = [p0[0] + Math.sin(a0) * 22, p0[1] - Math.cos(a0) * 22], p2 = [p1[0] + Math.sin(a1) * 18, p1[1] - Math.cos(a1) * 18];
      ctx.strokeStyle = '#3a4052'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]); ctx.stroke();
      const pulse = 0.55 + 0.45 * Math.sin(t * (st === 'thinking' ? 6 : 3) + seed);
      glowAt(ctx, p2[0], p2[1], 34, EYE, 0.35 * pulse + 0.15);
      circle(ctx, p2[0], p2[1], 9, mixHex(dark(EYE, 0.25), EYE, pulse)); circle(ctx, p2[0] - 3, p2[1] - 3, 3, 'rgba(255,255,255,0.8)');
      // ear discs
      for (const k of [-1, 1]) { const ex = k * 78 * (k < 0 ? 1 - 0.25 * f : 1) + hx * 0.3; if (k > 0 && f > 0.8) continue; ell(ctx, ex, -56, 12, 20, 0, '#2a2f40'); ell(ctx, ex + k * 3, -56, 6, 12, 0, rgba(EYE, 0.6)); }
      const head = () => { roundRect(ctx, -76 + hx * 0.2, -118, 152 - 14 * f, 118, 46); };
      solid(ctx, head, W, [-76, -118, 152, 118], ld, { rim: 4, top: 0.35, ao: 0.15 });
      // visor
      const vx = -60 + hx, vw = 120 - 14 * f;
      const visor = () => roundRect(ctx, vx, -98, vw, 76, 32);
      visor(); const vg = ctx.createLinearGradient(0, -98, 0, -22); vg.addColorStop(0, '#22283c'); vg.addColorStop(0.6, MASCOT.visor); vg.addColorStop(1, '#0b0e18'); ctx.fillStyle = vg; ctx.fill();
      ctx.save(); visor(); ctx.clip();
      // eyes
      const ex0 = vx + vw / 2 + (o.look || 0) * 10 + (st === 'thinking' ? 8 : 0), ey = -60 + (st === 'thinking' ? -8 : 0);
      glowAt(ctx, ex0, ey, 70, EYE, 0.3 * (o.glow == null ? 1 : o.glow));
      ctx.fillStyle = EYE; ctx.strokeStyle = EYE; ctx.lineCap = 'round';
      for (const k of [-1, 1]) {
        const exx = ex0 + k * 25 * (k < 0 ? 1 - 0.25 * f : 1);
        if (st === 'happy') { ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(exx, ey + 6, 11, 1.15 * PI, 1.85 * PI); ctx.stroke(); }
        else if (st === 'surprised') { circle(ctx, exx, ey, 13, EYE); circle(ctx, exx, ey, 6, MASCOT.visor); }
        else { const h = Math.max(4, 30 * (1 - blinkK)); rr(ctx, exx - 8, ey - h / 2, 16, h, 8, EYE); circle(ctx, exx - 3, ey - h / 2 + 6, 2.5, 'rgba(255,255,255,0.75)'); }
      }
      if ((o.talk || 0) > 0.05 || st === 'talk') { const h = 3 + 12 * clamp(o.talk || 0.4) * (0.5 + 0.5 * Math.abs(Math.sin(t * 12))); rr(ctx, ex0 - 12, -36 - h / 2, 24, h, h / 2, rgba(EYE, 0.9)); }
      // visor reflection streak
      ctx.globalAlpha = 0.22; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(vx + 14, -96); ctx.lineTo(vx + 46, -96); ctx.lineTo(vx + 22, -24); ctx.lineTo(vx - 10, -24); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
      ctx.restore();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; visor(); ctx.stroke();
      ctx.restore();
      if (st === 'thinking') for (let i = 0; i < 3; i++) { const k = clamp(Math.sin(t * 3 - i * 0.7) * 0.5 + 0.5); circle(ctx, 90 + i * 22, -360 - i * 22, 6 + i * 3, rgba('#ffffff', 0.35 + 0.55 * k)); }
      arm(aN, false);
      ctx.restore();
      if (o.out) { o.out.hand = [x + aN.wr[0] * dirS * s, y + (aN.wr[1] - hover) * s]; o.out.head = [x, y - 270 * s - hover * s]; o.out.top = [x, y - 350 * s - hover * s]; }
    }

    // drawAssistant(ctx, x, y, s, opts): a generic "AI assistant" bot that is clearly NOT the mascot: a floating
    // pebble with a light-strip face, no visor, no antenna, no lime. ~230 px tall. opts: t, color, mood happy|neutral|
    // thinking|alert, talk 0..1, facing, squash, light, seed
    function drawAssistant(ctx, x, y, s, o = {}) {
      const t = o.t || 0, seed = o.seed || 9, L = Object.assign({}, DEFAULT_LIGHT, o.light || {}), ld = L.dir;
      const col = o.color || '#8f86e8', m = mat(col, L), face = o.faceColor || '#7ff3ff';
      const hov = 26 + Math.sin(t * 2.2 + seed) * 7, f = clamp(o.facing || 0, -1, 1);
      ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
      contactShadow(ctx, 0, 0, 120 - hov, 0.35);
      glowAt(ctx, 0, -8, 70, face, 0.12);
      ctx.translate(0, -hov);
      if (o.squash) { const q = M.squash(o.squash); ctx.scale(q.sx, q.sy); }
      // hover ring
      ctx.strokeStyle = rgba(face, 0.5); ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -6, 44, 9, 0, 0, TAU); ctx.stroke();
      const body = () => { ctx.beginPath(); ctx.moveTo(0, -210); ctx.bezierCurveTo(78, -210, 92, -120, 78, -60); ctx.quadraticCurveTo(66, -12, 0, -12); ctx.quadraticCurveTo(-66, -12, -78, -60); ctx.bezierCurveTo(-92, -120, -78, -210, 0, -210); ctx.closePath(); };
      solid(ctx, body, m, [-90, -210, 180, 198], ld, { rim: 4, top: 0.3, ao: 0.2 });
      // face strip
      const fy = -132, fx = f * 14;
      rr(ctx, -54 + fx, fy - 28, 108, 56, 28, '#1a1d36');
      glowAt(ctx, fx, fy, 70, face, 0.25);
      ctx.strokeStyle = face; ctx.fillStyle = face; ctx.lineCap = 'round'; ctx.lineWidth = 6;
      const bl = M.blink(t, seed);
      for (const k of [-1, 1]) { const h = Math.max(3, 14 * (1 - bl)); rr(ctx, fx + k * 20 - 5, fy - 6 - h / 2, 10, h, 5, face); }
      const mood = o.mood || 'happy', talk = clamp(o.talk || 0);
      ctx.beginPath();
      if (talk > 0.05) { const h = 3 + 10 * talk * Math.abs(Math.sin(t * 11)); ctx.ellipse(fx, fy + 12, 9, h / 2, 0, 0, TAU); ctx.fill(); }
      else if (mood === 'alert') { ctx.moveTo(fx - 9, fy + 13); ctx.lineTo(fx + 9, fy + 13); ctx.stroke(); }
      else { ctx.arc(fx, fy + 6, 9, 0.2 * PI, 0.8 * PI); ctx.stroke(); }
      // little floating hands (overlap: they lag the body bob)
      for (const k of [-1, 1]) { const hy = -70 + Math.sin(t * 2.2 + seed - 0.6) * 9; solid(ctx, () => { ctx.beginPath(); ctx.ellipse(k * 104, hy, 17, 20, k * 0.3, 0, TAU); }, m, [k * 104 - 17, hy - 20, 34, 40], ld, { rim: 2 }); }
      if (mood === 'thinking') for (let i = 0; i < 3; i++) circle(ctx, 70 + i * 18, -232 - i * 16, 5 + i * 2.5, rgba('#ffffff', 0.4 + 0.5 * clamp(Math.sin(t * 3 - i))));
      ctx.restore();
    }
    // ================================================================ PROPS (bottom-centre anchored, same shading)
    const LT = (o) => Object.assign({}, DEFAULT_LIGHT, (o && o.light) || {});
    // Phone ~70x140 standing (or lying: opts.lying). opts: t, screen chat|call|blank|alert, glow 0..1, buzz 0..1, bubbles
    function drawPhone(ctx, x, y, s, o = {}) {
      const t = o.t || 0, L = LT(o), lying = !!o.lying, buzz = clamp(o.buzz || 0), glowK = o.glow == null ? 1 : o.glow;
      ctx.save(); ctx.translate(x + (buzz ? Math.sin(t * 70) * 2.5 * buzz : 0), y); ctx.scale(s, s);
      if (o.shadow !== false) contactShadow(ctx, 0, 0, lying ? 120 : 80, 0.45);
      if (lying) { ctx.scale(1, 0.32); ctx.translate(0, -8); }
      const w = 70, h = 140;
      solid(ctx, () => roundRect(ctx, -w / 2, -h, w, h, 12), mat('#2b2f3c', L), [-w / 2, -h, w, h], L.dir, { rim: 2 });
      const sx = -w / 2 + 5, sy = -h + 6, sw2 = w - 10, sh = h - 12;
      const g = ctx.createLinearGradient(0, sy, 0, sy + sh);
      if (o.screen === 'blank' || glowK <= 0) { g.addColorStop(0, '#11131c'); g.addColorStop(1, '#0a0b12'); }
      else { g.addColorStop(0, mixHex('#1d2547', A.light, 0.25 * glowK)); g.addColorStop(1, mixHex('#121831', A.base, 0.15 * glowK)); }
      rr(ctx, sx, sy, sw2, sh, 9, g);
      if (glowK > 0 && o.screen !== 'blank') {
        ctx.save(); roundRect(ctx, sx, sy, sw2, sh, 9); ctx.clip();
        if (o.screen === 'alert' || o.screen === 'call') { circle(ctx, 0, sy + 40, 15, A.base); rr(ctx, -24, sy + 66, 48, 8, 4, 'rgba(255,255,255,0.75)'); rr(ctx, -16, sy + 80, 32, 6, 3, 'rgba(255,255,255,0.4)'); }
        else { const n = o.bubbles == null ? 3 : o.bubbles; for (let i = 0; i < n; i++) { const me = i % 2; rr(ctx, me ? -4 : sx + 6, sy + 16 + i * 26, 30 + 10 * hash2(i, 3), 18, 8, me ? A.base : 'rgba(255,255,255,0.55)'); } }
        ctx.restore();
        glowAt(ctx, 0, -h / 2, 110, A.light, 0.16 * glowK);
      }
      ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + sw2 * 0.45, sy); ctx.lineTo(sx, sy + sh * 0.5); ctx.closePath(); ctx.fill();
      ctx.restore();
      if (buzz > 0) { ctx.save(); ctx.strokeStyle = rgba(A.light, 0.7 * buzz); ctx.lineWidth = 3 * s; ctx.lineCap = 'round'; for (const k of [-1, 1]) for (let i = 0; i < 2; i++) { const r = (lying ? 46 : 56) * s + i * 12 * s; ctx.beginPath(); ctx.arc(x, y - (lying ? 20 : 70) * s, r, k > 0 ? -0.5 : PI - 0.5, k > 0 ? 0.5 : PI + 0.5); ctx.stroke(); } ctx.restore(); }
    }
    // Laptop 280x170 (screen toward the viewer). opts: t, screen code|chart|chat|blank, glow, typing
    function drawLaptop(ctx, x, y, s, o = {}) {
      const t = o.t || 0, L = LT(o), scr = o.screen || 'code';
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) contactShadow(ctx, 0, 0, 300, 0.45);
        solid(ctx, () => roundRect(ctx, -120, -168, 240, 150, 12), mat('#c9ced9', L), [-120, -168, 240, 150], L.dir, { rim: 2, top: 0.2 });
        rr(ctx, -110, -159, 220, 132, 6, '#0f1220');
        ctx.save(); roundRect(ctx, -110, -159, 220, 132, 6); ctx.clip();
        const g = ctx.createRadialGradient(0, -90, 10, 0, -90, 160); g.addColorStop(0, rgba(A.base, 0.16)); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(-110, -159, 220, 132);
        if (scr === 'code') for (let r = 0; r < 8; r++) { const vis = o.typing === false ? 1 : clamp(t * 3 - r); if (vis <= 0) break; rr(ctx, -96 + (hash2(r, 2) * 3 | 0) * 12, -148 + r * 14, (40 + 100 * hash2(r, 3)) * vis, 6, 3, r % 3 === 1 ? A.base : 'rgba(255,255,255,0.5)'); }
        else if (scr === 'chart') { ctx.strokeStyle = A.base; ctx.lineWidth = 4; ctx.beginPath(); [[-90, -50], [-50, -70], [-15, -60], [20, -100], [55, -92], [92, -138]].forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); }
        else if (scr === 'chat') for (let i = 0; i < 4; i++) rr(ctx, i % 2 ? 10 : -96, -148 + i * 28, 86, 20, 10, i % 2 ? A.base : 'rgba(255,255,255,0.35)');
        ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.moveTo(-110, -159); ctx.lineTo(-20, -159); ctx.lineTo(-110, -60); ctx.closePath(); ctx.fill();
        ctx.restore();
        if (o.glow !== false) glowAt(ctx, 0, -95, 170, A.light, 0.1);
        const base = () => { ctx.beginPath(); ctx.moveTo(-140, -18); ctx.lineTo(140, -18); ctx.lineTo(132, 0); ctx.lineTo(-132, 0); ctx.closePath(); };
        solid(ctx, base, mat('#d7dbe4', L), [-140, -18, 280, 18], L.dir, { rim: 1.5, top: 0.5 });
        rr(ctx, -28, -16, 56, 4, 2, '#9aa1b2');
      });
    }
    // Desk 340x150, wood top with grain, metal legs, a drawer unit. opts: color, light
    function drawDesk(ctx, x, y, s, o = {}) {
      const L = LT(o), wood = o.color || '#9b6b45';
      const art = cached('desk' + wood + L.dir + L.key, 400, 190, (g) => {
        g.translate(200, 175);
        solid(g, () => roundRect(g, -150, -132, 16, 132, 4), mat('#6c7180', L), [-150, -132, 16, 132], L.dir, { rim: 1.5 });
        solid(g, () => roundRect(g, 60, -128, 86, 128, 6), mat(dark(wood, 0.12), L), [60, -128, 86, 128], L.dir, { rim: 2, ao: 0.3 });
        for (let i = 0; i < 3; i++) { rr(g, 66, -120 + i * 42, 74, 36, 4, rgba('#000000', 0.12)); rr(g, 92, -104 + i * 42, 22, 5, 2.5, '#c9ccd4'); }
        const top = () => roundRect(g, -170, -150, 340, 24, 8);
        solid(g, top, mat(wood, L), [-170, -150, 340, 24], L.dir, { rim: 2, top: 0.5 });
        g.save(); top(); g.clip(); texture(g, 'wood', -170, -150, 340, 24, dark(wood, 0.5), 0.35, 3); g.restore();
        rr(g, -170, -128, 340, 4, 2, rgba('#000000', 0.25));
      });
      at(ctx, x, y, s, () => { if (o.shadow !== false) contactShadow(ctx, 0, 0, 380, 0.5); ctx.drawImage(art, -200, -175); });
    }
    // Chair ~150x220. opts: kind office|wood|stool, color, facing, light
    function drawChair(ctx, x, y, s, o = {}) {
      const L = LT(o), kind = o.kind || 'office', col = o.color || (kind === 'wood' ? '#8a5a3a' : '#3b4256'), m = mat(col, L);
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) contactShadow(ctx, 0, 0, 170, 0.45);
        if (kind === 'office') {
          for (const k of [-1, 0, 1]) limbSeg(ctx, [0, -22], [k * 58, -6], 5, 5, mat('#2a2e3a', L), L.dir);
          for (const k of [-1, 0, 1]) circle(ctx, k * 58, -6, 7, '#1d2029');
          limbSeg(ctx, [0, -96], [0, -22], 7, 7, mat('#8b91a0', L), L.dir);
          solid(ctx, () => roundRect(ctx, -70, -116, 140, 26, 13), m, [-70, -116, 140, 26], L.dir, { rim: 2, top: 0.4 });
          solid(ctx, () => roundRect(ctx, -56, -236, 112, 120, 30), m, [-56, -236, 112, 120], L.dir, { rim: 3, ao: 0.2, top: 0.2 });
          ctx.save(); roundRect(ctx, -56, -236, 112, 120, 30); ctx.clip(); texture(ctx, 'fabric', -56, -236, 112, 120, '#000000', 0.08); ctx.restore();
        } else if (kind === 'stool') {
          for (const k of [-1, 1]) limbSeg(ctx, [k * 26, -118], [k * 44, 0], 6, 5, mat('#2a2e3a', L), L.dir);
          solid(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -122, 58, 14, 0, 0, TAU); }, m, [-58, -136, 116, 28], L.dir, { rim: 2, top: 0.5 });
        } else {
          for (const k of [-1, 1]) { limbSeg(ctx, [k * 52, -110], [k * 52, 0], 6, 6, m, L.dir); limbSeg(ctx, [k * 50, -230], [k * 52, -110], 6, 6, m, L.dir); }
          solid(ctx, () => roundRect(ctx, -62, -122, 124, 18, 6), m, [-62, -122, 124, 18], L.dir, { rim: 2, top: 0.5 });
          for (let i = 0; i < 3; i++) solid(ctx, () => roundRect(ctx, -54, -226 + i * 34, 108, 14, 5), m, [-54, -226 + i * 34, 108, 14], L.dir, { rim: 1.5 });
        }
      });
    }
    // Sofa ~620x260 (seat top at y - 120*scale). opts: color, light. Returns { seatY, x0, x1 }
    function paintSofa(g, col, L) {
      const m = mat(col, L), md = mat(dark(col, 0.1), L);
      contactShadow(g, 0, 0, 700, 0.6, 0.12);
      g.fillStyle = '#2a2018'; for (const k of [-1, 1]) rr(g, k * 262 - 9, -22, 18, 22, 4, '#2a2018');
      solid(g, () => roundRect(g, -290, -262, 580, 170, 54), md, [-290, -262, 580, 170], L.dir, { rim: 4, ao: 0.4 });
      for (const k of [-1, 1]) { solid(g, () => roundRect(g, k * 140 - 128, -246, 256, 140, 40), m, [k * 140 - 128, -246, 256, 140], L.dir, { rim: 3, top: 0.25, ao: 0.35 }); }
      solid(g, () => roundRect(g, -276, -132, 552, 64, 26), m, [-276, -132, 552, 64], L.dir, { rim: 3, top: 0.45 });
      g.strokeStyle = rgba(m.deep, 0.5); g.lineWidth = 2; g.beginPath(); g.moveTo(0, -128); g.lineTo(0, -72); g.stroke();
      solid(g, () => roundRect(g, -282, -84, 564, 66, 18), md, [-282, -84, 564, 66], L.dir, { rim: 2, ao: 0.5 });
      for (const k of [-1, 1]) solid(g, () => roundRect(g, k * 300 - 50, -190, 100, 176, 38), k < 0 ? m : md, [k * 300 - 50, -190, 100, 176], L.dir, { rim: 3, top: 0.3, ao: 0.3 });
      g.save(); roundRect(g, -340, -262, 680, 250, 40); g.clip(); texture(g, 'fabric', -340, -262, 680, 250, '#000000', 0.07, 2); g.restore();
    }
    function drawSofa(ctx, x, y, s, o = {}) {
      const L = LT(o), col = o.color || '#3f7f86';
      const art = cached('sofa' + col + L.dir + L.key + L.rim, 760, 300, (g) => { g.translate(380, 286); paintSofa(g, col, L); });
      at(ctx, x, y, s, () => ctx.drawImage(art, -380, -286));
      return { seatY: y - 128 * s, x0: x - 250 * s, x1: x + 250 * s };
    }
    // Document 150x190 (opts: lines, title, sign 0..1, seal, stamp text) and folder 200x150 (opts: open 0..1, label)
    function drawDocument(ctx, x, y, s, o = {}) {
      const L = LT(o);
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) contactShadow(ctx, 0, 0, 170, 0.35);
        ctx.save(); ctx.rotate(o.tilt || 0);
        const p = () => { ctx.beginPath(); ctx.moveTo(-75, -190); ctx.lineTo(45, -190); ctx.lineTo(75, -160); ctx.lineTo(75, 0); ctx.lineTo(-75, 0); ctx.closePath(); };
        solid(ctx, p, mat('#f1efe8', L), [-75, -190, 150, 190], L.dir, { rim: 2, mid: 0.6 });
        ctx.beginPath(); ctx.moveTo(45, -190); ctx.lineTo(45, -160); ctx.lineTo(75, -160); ctx.closePath(); ctx.fillStyle = '#d6d2c6'; ctx.fill();
        if (o.title !== false) rr(ctx, -56, -170, 76, 10, 5, A.shade);
        const n = o.lines == null ? 7 : o.lines;
        for (let i = 0; i < n; i++) rr(ctx, -56, -146 + i * 15, i === n - 1 ? 60 : 110 - 14 * hash2(i, 4), 5, 2.5, 'rgba(60,64,80,0.28)');
        ctx.fillStyle = 'rgba(60,64,80,0.4)'; ctx.fillRect(-56, -28, 74, 2);
        if (o.sign > 0) { ctx.strokeStyle = '#2b3a78'; ctx.lineWidth = 3; ctx.lineCap = 'round'; const pts = []; for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push([-54 + u * 70, -36 - Math.sin(u * 14) * 8 * (1 - u * 0.5) - u * 4]); } ctx.beginPath(); pts.slice(0, Math.max(2, Math.round(31 * clamp(o.sign)))).forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.stroke(); }
        if (o.seal) { circle(ctx, 44, -34, 18, A.base); circle(ctx, 44, -34, 12, A.light); }
        ctx.restore();
      });
    }
    function drawFolder(ctx, x, y, s, o = {}) {
      const L = LT(o), col = o.color || '#e2b45f', op = clamp(o.open || 0);
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) contactShadow(ctx, 0, 0, 220, 0.4);
        solid(ctx, () => { ctx.beginPath(); ctx.moveTo(-100, -150); ctx.lineTo(-30, -150); ctx.lineTo(-18, -136); ctx.lineTo(100, -136); ctx.lineTo(100, 0); ctx.lineTo(-100, 0); ctx.closePath(); }, mat(dark(col, 0.12), L), [-100, -150, 200, 150], L.dir, { rim: 2 });
        for (let i = 0; i < 2; i++) rr(ctx, -84 + i * 8, -128 - op * 30 + i * 6, 160, 110, 3, i ? '#f4f2ea' : '#e6e2d6');
        ctx.save(); ctx.translate(0, 0); ctx.transform(1, 0, -0.25 * op, 1 - 0.35 * op, 0, 0);
        solid(ctx, () => roundRect(ctx, -100, -124, 200, 124, 6), mat(col, L), [-100, -124, 200, 124], L.dir, { rim: 2, top: 0.3 });
        if (o.label) { ctx.font = font.ui(20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; rr(ctx, -60, -96, 120, 32, 4, '#f6f2e6'); ctx.fillStyle = '#3a3220'; ctx.fillText(String(o.label).slice(0, 12), 0, -79); }
        ctx.restore();
      });
    }
    // Gavel 220x130 (+ sound block). opts: hit 0 (raised) .. 1 (struck), light
    function drawGavel(ctx, x, y, s, o = {}) {
      const L = LT(o), hit = clamp(o.hit || 0), wood = '#7a4a2c';
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) contactShadow(ctx, 0, 0, 200, 0.45);
        solid(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -14, 70, 16, 0, 0, TAU); }, mat(dark(wood, 0.1), L), [-70, -30, 140, 32], L.dir, { rim: 2, top: 0.5 });
        rr(ctx, -70, -16, 140, 14, 7, dark(wood, 0.3));
        ctx.save(); ctx.translate(80, -40); ctx.rotate(-0.9 * (1 - hit) - 0.05);
        limbSeg(ctx, [0, 0], [-120, -6], 7, 6, mat(wood, L), L.dir);
        ctx.translate(-120, -6);
        solid(ctx, () => roundRect(ctx, -26, -50, 52, 92, 16), mat(wood, L), [-26, -50, 52, 92], L.dir, { rim: 2, top: 0.3 });
        for (const k of [-1, 1]) rr(ctx, -27, k * 34 - 5 + (k > 0 ? -2 : 4), 54, 9, 4, '#c9a24a');
        ctx.restore();
        if (hit > 0.92) { ctx.strokeStyle = rgba(A.light, (1 - hit) * 10); ctx.lineWidth = 4; for (let i = 0; i < 7; i++) { const a = PI + (i / 6) * PI; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 80, -20 + Math.sin(a) * 30); ctx.lineTo(Math.cos(a) * 110, -20 + Math.sin(a) * 44); ctx.stroke(); } }
      });
    }
    // Coin 70x70 (opts: spin radians, symbol) / coin stack (opts.count) and bills stack 150x90 (opts.count)
    function drawCoin(ctx, x, y, s, o = {}) {
      const L = LT(o), sx = Math.max(0.1, Math.abs(Math.cos(o.spin || 0))), gold = o.color || '#e8b93a';
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) contactShadow(ctx, 0, 0, 60, 0.35);
        const n = o.count || 1;
        for (let i = 0; i < n - 1; i++) { const yy = -8 - i * 9; rr(ctx, -33, yy - 6, 66, 12, 6, dark(gold, 0.25 + (i % 2) * 0.08)); ctx.fillStyle = rgba('#fff3c0', 0.35); ctx.fillRect(-28, yy - 5, 56, 2); }
        ctx.translate(0, -35 - (n - 1) * 9); ctx.scale(sx, 1);
        circle(ctx, 3, 3, 33, dark(gold, 0.45));
        const g = ctx.createLinearGradient(-30, -30, 30, 30); g.addColorStop(0, tint(gold, 0.55)); g.addColorStop(0.45, gold); g.addColorStop(1, dark(gold, 0.3));
        circle(ctx, 0, 0, 32, g); ctx.strokeStyle = rgba(dark(gold, 0.35), 0.8); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 24, 0, TAU); ctx.stroke();
        ctx.font = font.display(26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = dark(gold, 0.45); ctx.fillText(o.symbol || '$', 0, 1);
        ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(-12, -14, 9, 4, -0.7, 0, TAU); ctx.fill();
      });
    }
    function drawBills(ctx, x, y, s, o = {}) {
      const L = LT(o), n = clamp(o.count == null ? 5 : o.count, 1, 12) | 0, base = o.color || '#7fb48a';
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) contactShadow(ctx, 0, 0, 170, 0.4);
        for (let i = 0; i < n; i++) { const yy = -10 - i * 6, dx = (hash2(i, 1) - 0.5) * 10; rr(ctx, -72 + dx, yy - 6, 144, 9, 2, i % 2 ? dark(base, 0.2) : dark(base, 0.1)); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-68 + dx, yy - 5, 136, 1.5); }
        const top = -10 - n * 6 - 60, dx = (hash2(n, 1) - 0.5) * 10;
        solid(ctx, () => roundRect(ctx, -72 + dx, top, 144, 66, 5), mat(base, L), [-72 + dx, top, 144, 66], L.dir, { rim: 1.5, top: 0.4 });
        ctx.strokeStyle = rgba(tint(base, 0.4), 0.9); ctx.lineWidth = 2; roundRect(ctx, -64 + dx, top + 7, 128, 52, 4); ctx.stroke();
        ell(ctx, dx, top + 33, 19, 19, 0, tint(base, 0.35));
        ctx.font = font.display(22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = dark(base, 0.4); ctx.fillText('$', dx, top + 34);
      });
    }
    // Chip (processor) 180x180 standing on its edge-less face: drawn front-on with pins; opts: glow 0..1, t, label
    function drawChip(ctx, x, y, s, o = {}) {
      const L = LT(o), t = o.t || 0, gl = o.glow == null ? 0.5 : o.glow;
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) contactShadow(ctx, 0, 0, 200, 0.4);
        ctx.translate(0, -90);
        for (let i = 0; i < 8; i++) for (const k of [-1, 1]) { rr(ctx, -70 + i * 19, k * 78 - 7, 8, 14, 2, '#c8ccd6'); rr(ctx, k * 78 - 7, -70 + i * 19, 14, 8, 2, '#c8ccd6'); }
        solid(ctx, () => roundRect(ctx, -76, -76, 152, 152, 14), mat('#2b3142', L), [-76, -76, 152, 152], L.dir, { rim: 2, top: 0.3 });
        const g = ctx.createLinearGradient(-44, -44, 44, 44); g.addColorStop(0, '#9aa4bd'); g.addColorStop(0.5, '#d9deea'); g.addColorStop(1, '#7c86a0');
        rr(ctx, -46, -46, 92, 92, 8, g);
        ctx.strokeStyle = 'rgba(40,46,66,0.35)'; ctx.lineWidth = 1; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-46 + i * 15.3, -46); ctx.lineTo(-46 + i * 15.3, 46); ctx.moveTo(-46, -46 + i * 15.3); ctx.lineTo(46, -46 + i * 15.3); ctx.stroke(); }
        glowAt(ctx, 0, 0, 120, A.base, gl * (0.25 + 0.1 * Math.sin(t * 3)));
        if (o.label) { ctx.font = font.ui(20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#1b2030'; ctx.fillText(String(o.label).slice(0, 8), 0, 2); }
      });
    }
    // Wafer 240 diameter (seen at an angle on a stand). opts: t, spin, lit 0..1 (share of dies lit, accent)
    function drawWafer(ctx, x, y, s, o = {}) {
      const L = LT(o), t = o.t || 0, lit = clamp(o.lit || 0);
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) contactShadow(ctx, 0, 0, 260, 0.4);
        ctx.translate(0, -60); ctx.scale(1, 0.42);
        circle(ctx, 0, 14, 122, '#5d6378');
        const g = ctx.createLinearGradient(-120, -120, 120, 120);
        const h = (o.spin || t * 0.3);
        g.addColorStop(0, '#6a7cc8'); g.addColorStop(0.3 + 0.1 * Math.sin(h), '#b48ad8'); g.addColorStop(0.55, '#7fd3d8'); g.addColorStop(0.8, '#d7c27a'); g.addColorStop(1, '#6a7cc8');
        circle(ctx, 0, 0, 120, g);
        ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 112, 0, TAU); ctx.clip();
        let k = 0; for (let i = -6; i < 6; i++) for (let j = -6; j < 6; j++) { const cx = i * 19 + 9.5, cy = j * 19 + 9.5; if (cx * cx + cy * cy > 108 * 108) continue; k++; const on = hash2(i * 13 + j, 7) < lit; rr(ctx, cx - 8, cy - 8, 16, 16, 2, on ? rgba(A.base, 0.85) : 'rgba(20,24,50,0.25)'); }
        ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(-40, -50, 60, 18, -0.5, 0, TAU); ctx.fill();
      });
    }
    // Building 260x460 glass/concrete tower. opts: t, color, floors, lit 0..1, label, dusk (bool: warm reflections)
    function drawBuilding(ctx, x, y, s, o = {}) {
      const L = LT(o), base = o.color || '#5e6d9e', fl = o.floors || 9, h = 70 + fl * 42, lit = o.lit == null ? 0.5 : o.lit, t = o.t || 0;
      const art = cached('bld' + base + fl + L.dir + L.key, 300, h + 80, (g) => {
        g.translate(150, h + 70);
        solid(g, () => roundRect(g, -120, -h, 240, h, 6), mat(base, L), [-120, -h, 240, h], L.dir, { rim: 3, mid: 0.3 });
        g.save(); roundRect(g, -120, -h, 240, h, 6); g.clip();
        for (let r = 0; r < fl; r++) for (let c = 0; c < 5; c++) {
          const wx = -104 + c * 43, wy = -h + 28 + r * 42;
          const wg = g.createLinearGradient(wx, wy, wx + 34, wy + 30); wg.addColorStop(0, mixHex('#1a2140', base, 0.25)); wg.addColorStop(1, mixHex('#2c3a66', base, 0.3));
          rr(g, wx, wy, 34, 30, 3, wg); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(wx + 2, wy + 2, 10, 26);
        }
        const sky = g.createLinearGradient(-120, -h, 120, 0); sky.addColorStop(0, 'rgba(255,255,255,0.12)'); sky.addColorStop(0.5, 'rgba(255,255,255,0)'); sky.addColorStop(1, 'rgba(255,255,255,0.06)');
        g.fillStyle = sky; g.fillRect(-120, -h, 240, h); g.restore();
        solid(g, () => roundRect(g, -132, -h - 16, 264, 22, 6), mat(tint(base, 0.15), L), [-132, -h - 16, 264, 22], L.dir, { rim: 2, top: 0.5 });
        solid(g, () => roundRect(g, -36, -66, 72, 66, 6), mat('#2a2f40', L), [-36, -66, 72, 66], L.dir, { rim: 2 });
        rr(g, -30, -60, 28, 60, 2, '#3c4766'); rr(g, 2, -60, 28, 60, 2, '#3c4766');
        rr(g, -56, -78, 112, 12, 5, tint(base, 0.2));
      });
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) contactShadow(ctx, 0, 0, 320, 0.5);
        ctx.drawImage(art, -150, -h - 70);
        for (let r = 0; r < fl; r++) for (let c = 0; c < 5; c++) if (hash2(r * 5 + c, Math.floor(t * 0.3 + r * 0.1)) < lit) { const wx = -104 + c * 43, wy = -h + 28 + r * 42; rr(ctx, wx, wy, 34, 30, 3, rgba('#ffd68a', 0.75)); }
        if (o.label) { ctx.font = font.ui(26); const w = ctx.measureText(o.label).width + 40; rr(ctx, -w / 2, -h - 74, w, 46, 23, 'rgba(10,12,22,0.86)'); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.label, 0, -h - 50); }
      });
    }
    // Music player: a turntable 300x110 with a spinning record. opts: t, playing (bool), light
    function drawMusicPlayer(ctx, x, y, s, o = {}) {
      const L = LT(o), t = o.t || 0, play = o.playing !== false;
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) contactShadow(ctx, 0, 0, 320, 0.45);
        solid(ctx, () => roundRect(ctx, -150, -64, 300, 64, 10), mat('#8a5a3a', L), [-150, -64, 300, 64], L.dir, { rim: 2, top: 0.3 });
        ctx.save(); roundRect(ctx, -150, -64, 300, 64, 10); ctx.clip(); texture(ctx, 'wood', -150, -64, 300, 64, '#3a2414', 0.3, 5); ctx.restore();
        solid(ctx, () => roundRect(ctx, -146, -92, 292, 32, 8), mat('#2a2d36', L), [-146, -92, 292, 32], L.dir, { rim: 2, top: 0.5 });
        ctx.save(); ctx.translate(-30, -86); ctx.scale(1, 0.3);
        circle(ctx, 0, 0, 104, '#121318');
        ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1.5; for (let r = 30; r < 100; r += 7) { ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.stroke(); }
        const a = play ? t * 3.5 : 0; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 70, a, a + 0.7); ctx.stroke();
        circle(ctx, 0, 0, 28, A.base); circle(ctx, 0, 0, 4, '#121318');
        ctx.restore();
        limbSeg(ctx, [110, -96], [40, -84], 4, 3, mat('#c9ced9', L), L.dir); circle(ctx, 110, -96, 10, '#9aa1b2');
        for (let i = 0; i < 3; i++) circle(ctx, 70 + i * 22, -32, 7, i === 0 && play ? A.base : '#d9d4c8');
      });
    }
    // Headphones 170x170 (resting) or worn: use opts.band (0..1 opening). opts: color, light
    function drawHeadphones(ctx, x, y, s, o = {}) {
      const L = LT(o), col = o.color || '#2d3142', m = mat(col, L);
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) contactShadow(ctx, 0, 0, 170, 0.4);
        ctx.strokeStyle = m.base; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, -80, 70, PI * 1.05, PI * 1.95); ctx.stroke();
        ctx.strokeStyle = rgba(m.spec, 0.5); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -82, 70, PI * 1.25, PI * 1.55); ctx.stroke();
        for (const k of [-1, 1]) { solid(ctx, () => roundRect(ctx, k * 70 - 24, -96, 48, 90, 20), m, [k * 70 - 24, -96, 48, 90], L.dir, { rim: 2, top: 0.3 }); rr(ctx, k * 70 - (k > 0 ? 24 : -14), -86, 10, 70, 5, A.base); }
      });
    }
    // Shield 140x165, metal sheen. opts: check 0..1, color
    function drawShield(ctx, x, y, s, o = {}) {
      const L = LT(o), col = o.color || A.base;
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) contactShadow(ctx, 0, 0, 140, 0.4);
        const path = (k) => { ctx.beginPath(); ctx.moveTo(0, -165 * k); ctx.quadraticCurveTo(36 * k, -144 * k, 70 * k, -144 * k); ctx.quadraticCurveTo(72 * k, -48 * k, 0, 0); ctx.quadraticCurveTo(-72 * k, -48 * k, -70 * k, -144 * k); ctx.quadraticCurveTo(-36 * k, -144 * k, 0, -165 * k); ctx.closePath(); };
        solid(ctx, () => path(1), mat('#c9ced9', L), [-70, -165, 140, 165], L.dir, { rim: 3, top: 0.3 });
        ctx.save(); ctx.translate(0, -14); solid(ctx, () => path(0.8), mat(col, L), [-56, -132, 112, 132], L.dir, { rim: 2, top: 0.4 }); ctx.restore();
        ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.beginPath(); ctx.moveTo(-40, -130); ctx.lineTo(-8, -138); ctx.lineTo(-30, -40); ctx.closePath(); ctx.fill();
        if (o.check > 0) { ctx.strokeStyle = dark(col, 0.6); ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; const pts = [[-28, -84], [-8, -62], [30, -108]], k = clamp(o.check) * 2; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(lerp(pts[0][0], pts[1][0], clamp(k)), lerp(pts[0][1], pts[1][1], clamp(k))); if (k > 1) ctx.lineTo(lerp(pts[1][0], pts[2][0], clamp(k - 1)), lerp(pts[1][1], pts[2][1], clamp(k - 1))); ctx.stroke(); }
      });
    }
    // Trophy 150x230, gold with sheen. opts: t (glint), color, label
    function drawTrophy(ctx, x, y, s, o = {}) {
      const L = LT(o), gold = o.color || '#e3b341', t = o.t || 0;
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) contactShadow(ctx, 0, 0, 170, 0.45);
        solid(ctx, () => roundRect(ctx, -66, -40, 132, 40, 6), mat('#3a2a22', L), [-66, -40, 132, 40], L.dir, { rim: 2, top: 0.4 });
        if (o.label) { rr(ctx, -44, -30, 88, 20, 3, tint(gold, 0.2)); ctx.font = font.ui(14); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3a2a10'; ctx.fillText(String(o.label).slice(0, 10), 0, -20); }
        const gm = mat(gold, L);
        solid(ctx, () => roundRect(ctx, -34, -62, 68, 22, 6), gm, [-34, -62, 68, 22], L.dir, { rim: 2 });
        limbSeg(ctx, [0, -62], [0, -100], 10, 14, gm, L.dir);
        for (const k of [-1, 1]) { ctx.strokeStyle = gm.shade; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(k * 58, -176, 26, k > 0 ? -1.4 : PI - 1.7 + 3.1, k > 0 ? 1.7 : PI + 1.4); ctx.stroke(); }
        const cup = () => { ctx.beginPath(); ctx.moveTo(-62, -220); ctx.lineTo(62, -220); ctx.bezierCurveTo(62, -140, 30, -104, 0, -104); ctx.bezierCurveTo(-30, -104, -62, -140, -62, -220); ctx.closePath(); };
        solid(ctx, cup, gm, [-62, -220, 124, 116], L.dir, { rim: 3, top: 0.3 });
        ell(ctx, 0, -220, 62, 10, 0, dark(gold, 0.35));
        const gx = -30 + ((t * 0.5) % 2) * 60; ctx.save(); cup(); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(gx, -222); ctx.lineTo(gx + 16, -222); ctx.lineTo(gx - 14, -100); ctx.lineTo(gx - 30, -100); ctx.closePath(); ctx.fill(); ctx.restore();
      });
    }
    // Table lamp ~110x200 (on a surface). opts: on 0..1, t, color
    function drawLamp(ctx, x, y, s, o = {}) {
      const L = LT(o), on = o.on == null ? 1 : o.on, col = o.color || '#e9dcc4';
      at(ctx, x, y, s, () => {
        if (on > 0) glowAt(ctx, 0, -150, 260, '#ffcf8a', 0.35 * on);
        solid(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -8, 40, 10, 0, 0, TAU); }, mat('#3a3f52', L), [-40, -18, 80, 20], L.dir, { rim: 1.5 });
        limbSeg(ctx, [0, -10], [0, -110], 5, 5, mat('#c9a96e', L), L.dir);
        solid(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -60, 34, 46, 0, 0, TAU); }, mat('#5a7ea8', L), [-34, -106, 68, 92], L.dir, { rim: 2, top: 0.3 });
        const shade = () => { ctx.beginPath(); ctx.moveTo(-58, -110); ctx.lineTo(58, -110); ctx.lineTo(38, -196); ctx.lineTo(-38, -196); ctx.closePath(); };
        shade(); const g = ctx.createLinearGradient(-58, 0, 58, 0); g.addColorStop(0, mixHex(col, '#fff2d0', 0.6 * on)); g.addColorStop(1, mixHex(dark(col, 0.25), '#ffd9a0', 0.4 * on)); ctx.fillStyle = g; ctx.fill();
        if (on > 0) { ctx.save(); shade(); ctx.clip(); glowAt(ctx, 0, -150, 80, '#fff2c8', 0.5 * on); ctx.restore(); ell(ctx, 0, -110, 58, 7, 0, rgba('#fff4d6', 0.85 * on)); }
      });
    }
    // ================================================================ CAMERA + PARALLAX + LIGHTING PASS
    // cam(t, keys, opts): eased (slow in / slow out) camera with a moving hold. keys [{t, x, y, zoom, ease}]:
    // x/y = pan (px) of the subject plane (depth 1), zoom >= 1. opts.drift (1) scales the moving-hold drift.
    function cam(t, keys, o = {}) {
      const ks = (keys && keys.length ? keys : [{ t: 0 }]).map((k) => ({ t: k.t || 0, ease: k.ease, v: { x: k.x || 0, y: k.y || 0, zoom: Math.max(1, k.zoom || 1) } }));
      const v = M.keyed(t, ks), d = o.drift == null ? 1 : o.drift;
      return { x: v.x + M.hold(t, 7, 2.5 * d), y: v.y + M.hold(t, 9, 1.6 * d), zoom: v.zoom };
    }
    // layer transform for depth d (0 = infinitely far, 1 = the characters' plane, > 1 = foreground)
    function depth(ctx, c, d) { if (!c) return; const z = 1 + (c.zoom - 1) * d; ctx.translate(PX, PY); ctx.scale(z, z); ctx.translate(-PX - c.x * d, -PY - c.y * d); }
    const MX = 220, MY = 140;
    function layerCanvas(key, paint, scale = 1) {
      return cached(key, (CW + MX * 2) * scale, (CH + MY * 2) * scale, (g) => { g.scale(scale, scale); g.translate(MX, MY); paint(g); });
    }
    function blitLayer(ctx, c, d, cv, scale = 1) { ctx.save(); depth(ctx, c, d); ctx.drawImage(cv, -MX, -MY, CW + MX * 2, CH + MY * 2); ctx.restore(); }
    // light(ctx, spec, camera): the lighting pass, drawn after the characters.
    // spec: { t, pools: [{x, y, r, color, a, d (depth, 1), flicker}], rays: {x, y, angle, spread, len, count, color, a, d},
    //         vignette (0..1), grade: {color, a, mode ('soft-light')}, grain (0..0.15), haze: {y, h, color, a} }
    function light(ctx, spec = {}, c = null) {
      const t = spec.t || 0;
      if (spec.rays) {
        const R = spec.rays, key = 'rays' + JSON.stringify(R);
        const cv = layerCanvas(key, (g) => {
          g.globalCompositeOperation = 'lighter';
          const n = R.count || 5;
          for (let i = 0; i < n; i++) {
            const a = (R.angle || 1.9) + ((i / Math.max(1, n - 1)) - 0.5) * (R.spread || 0.4), w = (R.width || 50) * (0.6 + hash2(i, 3) * 0.8), len = R.len || 900;
            const x0 = R.x + ((i / Math.max(1, n - 1)) - 0.5) * (R.w || 240), y0 = R.y;
            const ex = x0 + Math.cos(a) * len, ey = y0 + Math.sin(a) * len, nx = -Math.sin(a), ny = Math.cos(a);
            const gr = g.createLinearGradient(x0, y0, ex, ey); gr.addColorStop(0, rgba(R.color || '#cfe0ff', (R.a || 0.12) * (0.5 + hash2(i, 5)))); gr.addColorStop(1, rgba(R.color || '#cfe0ff', 0));
            g.fillStyle = gr; g.beginPath(); g.moveTo(x0 - nx * w * 0.3, y0 - ny * w * 0.3); g.lineTo(x0 + nx * w * 0.3, y0 + ny * w * 0.3); g.lineTo(ex + nx * w, ey + ny * w); g.lineTo(ex - nx * w, ey - ny * w); g.closePath(); g.fill();
          }
        }, 0.5);
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.85 + 0.15 * Math.sin(t * 0.7); blitLayer(ctx, c, R.d == null ? 0.6 : R.d, cv, 0.5); ctx.restore();
      }
      for (const p of spec.pools || []) {
        const fl = p.flicker ? 1 + p.flicker * (0.6 * Math.sin(t * 11 + p.x) * Math.sin(t * 7.3) + 0.4 * M.noise(t * 6, p.x)) : 1;
        ctx.save(); depth(ctx, c, p.d == null ? 1 : p.d);
        if (p.sy) { ctx.translate(p.x, p.y); ctx.scale(1, p.sy); ctx.translate(-p.x, -p.y); }
        glowAt(ctx, p.x, p.y, p.r, p.color || '#ffd39a', (p.a == null ? 0.2 : p.a) * fl);
        ctx.restore();
      }
      if (spec.haze) { const h = spec.haze, g = ctx.createLinearGradient(0, h.y - h.h, 0, h.y + h.h); g.addColorStop(0, rgba(h.color, 0)); g.addColorStop(0.5, rgba(h.color, h.a)); g.addColorStop(1, rgba(h.color, 0)); ctx.fillStyle = g; ctx.fillRect(0, h.y - h.h, CW, h.h * 2); }
      if (spec.grade) { ctx.save(); ctx.globalCompositeOperation = spec.grade.mode || 'soft-light'; ctx.globalAlpha = spec.grade.a == null ? 0.3 : spec.grade.a; ctx.fillStyle = spec.grade.color; ctx.fillRect(0, 0, CW, CH); ctx.restore(); }
      if (spec.vignette) {
        const v = spec.vignette, cv = cached('vig' + v + CW + CH, CW / 4, CH / 4, (g) => {
          const gr = g.createRadialGradient(CW / 8, CH * 0.36 / 4, CW * 0.12, CW / 8, CH * 0.4 / 4, CH * 0.36);
          gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.55, `rgba(4,4,14,${v * 0.35})`); gr.addColorStop(1, `rgba(4,4,14,${v})`);
          g.fillStyle = gr; g.fillRect(0, 0, CW / 4, CH / 4);
        });
        ctx.drawImage(cv, 0, 0, CW, CH);
      }
      if (spec.grain) grain(ctx, t, spec.grain);
    }

    // ================================================================ WORLD PAINTERS (cached artwork)
    function paintWall(g, x0, y0, x1, y1, top, bot, o = {}) {
      const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      if (o.stripes) { g.save(); g.globalAlpha = o.stripes; for (let x = x0; x < x1; x += 46) { g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(x, y0, 2, y1 - y0); g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x + 23, y0, 10, y1 - y0); } g.restore(); }
      if (o.panels) { for (let x = x0 + 20; x < x1; x += o.panels) { const w = o.panels - 30; rr(g, x, y0 + (o.panelTop || 40), w, y1 - y0 - (o.panelTop || 40) - 40, 6, 'rgba(0,0,0,0.12)'); g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 2; roundRect(g, x + 3, y0 + (o.panelTop || 40) + 3, w - 6, y1 - y0 - (o.panelTop || 40) - 46, 5); g.stroke(); } }
      texture(g, 'speckle', x0, y0, x1 - x0, y1 - y0, '#000000', 0.18, 4);
    }
    function paintBaseboard(g, y, col, h = 26) {
      const gr = g.createLinearGradient(0, y - h, 0, y); gr.addColorStop(0, tint(col, 0.15)); gr.addColorStop(0.2, col); gr.addColorStop(1, dark(col, 0.3));
      g.fillStyle = gr; g.fillRect(-MX, y - h, CW + MX * 2, h);
      const ao = g.createLinearGradient(0, y - h - 60, 0, y - h); ao.addColorStop(0, 'rgba(0,0,0,0)'); ao.addColorStop(1, 'rgba(0,0,0,0.25)'); g.fillStyle = ao; g.fillRect(-MX, y - h - 60, CW + MX * 2, 60);
    }
    function paintFloor(g, y0, base, o = {}) {
      const y1 = CH + MY, vx = o.vx || 540, vy = y0 - (o.vdist || 900);
      const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, dark(base, 0.15)); gr.addColorStop(0.25, base); gr.addColorStop(1, dark(base, 0.55));
      g.fillStyle = gr; g.fillRect(-MX, y0, CW + MX * 2, y1 - y0);
      const kind = o.kind || 'wood', sp = o.spacing || 70, k = (y1 - vy) / (y0 - vy);
      g.save(); g.beginPath(); g.rect(-MX, y0, CW + MX * 2, y1 - y0); g.clip();
      if (kind === 'wood' || kind === 'tile') {
        g.strokeStyle = rgba(dark(base, 0.6), kind === 'tile' ? 0.5 : 0.55); g.lineWidth = 2;
        for (let i = -40; i <= 40; i++) { const xa = vx + i * sp, xb = vx + i * sp * k; g.beginPath(); g.moveTo(xa, y0); g.lineTo(xb, y1); g.stroke(); }
        for (let j = 0; j < 40; j++) { const u = Math.pow(j / 40, 1.6), y = y0 + (y1 - y0) * u; if (kind === 'tile') { g.beginPath(); g.moveTo(-MX, y); g.lineTo(CW + MX, y); g.stroke(); } else for (let i = -40; i <= 40; i++) if (hash2(i, j) > 0.72) { const kk = (y - vy) / (y0 - vy); const xa = vx + i * sp * kk, xb = vx + (i + 1) * sp * kk; g.beginPath(); g.moveTo(xa, y); g.lineTo(xb, y); g.stroke(); } }
        if (kind === 'wood') for (let i = -40; i <= 40; i++) { const kk = 1.6; g.globalAlpha = 0.05 * hash2(i, 77); g.fillStyle = hash2(i, 78) > 0.5 ? '#ffffff' : '#000000'; g.beginPath(); g.moveTo(vx + i * sp, y0); g.lineTo(vx + (i + 1) * sp, y0); g.lineTo(vx + (i + 1) * sp * k, y1); g.lineTo(vx + i * sp * k, y1); g.closePath(); g.fill(); g.globalAlpha = 1; void kk; }
      } else if (kind === 'carpet') texture(g, 'speckle', -MX, y0, CW + MX * 2, y1 - y0, '#000000', 0.35, 8);
      else if (kind === 'stone') { g.strokeStyle = 'rgba(255,255,255,0.08)'; g.lineWidth = 1.5; for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(vx + i * sp * 2, y0); g.lineTo(vx + i * sp * 2 * k, y1); g.stroke(); } texture(g, 'speckle', -MX, y0, CW + MX * 2, y1 - y0, '#ffffff', 0.12, 9); }
      g.restore();
      // ambient occlusion where the floor meets the wall
      const ao = g.createLinearGradient(0, y0, 0, y0 + 50); ao.addColorStop(0, 'rgba(0,0,0,0.45)'); ao.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = ao; g.fillRect(-MX, y0, CW + MX * 2, 50);
    }
    function paintSky(g, x, y, w, h, time) {
      const S = { night: ['#060a22', '#17204a', '#2a2f66'], dusk: ['#2b2a62', '#b5607a', '#f3a26a'], day: ['#4d86d1', '#8fbbe8', '#d8e8f5'] }[time] || ['#060a22', '#17204a', '#2a2f66'];
      const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, S[0]); gr.addColorStop(0.65, S[1]); gr.addColorStop(1, S[2]); g.fillStyle = gr; g.fillRect(x, y, w, h);
      if (time === 'night') for (let i = 0; i < Math.max(8, (w * h) / 6000); i++) { g.globalAlpha = 0.3 + 0.6 * hash2(i, 41); circle(g, x + hash2(i, 42) * w, y + hash2(i, 43) * h * 0.6, 0.8 + hash2(i, 44) * 1.4, '#ffffff'); }
      g.globalAlpha = 1;
    }
    function paintSkyline(g, x, y0, w, rows, time, seed = 0) {
      // rows of buildings, far rows hazier (atmospheric perspective)
      const haze = { night: '#2a3266', dusk: '#c47a8a', day: '#bcd3ee' }[time] || '#2a3266';
      const bc = { night: '#0e1230', dusk: '#3a2f5a', day: '#6b86b5' }[time] || '#0e1230';
      for (let r = 0; r < rows; r++) {
        const far = 1 - r / Math.max(1, rows), col = mixHex(bc, haze, far * 0.65), n = Math.ceil(w / 60);
        for (let i = 0; i < n; i++) {
          const bw = 40 + 50 * hash2(i, seed + r * 7), bh = (60 + 160 * hash2(i, seed + r * 9 + 1)) * (0.6 + r * 0.25), bx = x + i * (w / n) + (hash2(i, r + seed) - 0.5) * 20;
          rr(g, bx, y0 - bh, bw, bh + 4, 2, col);
          if (time !== 'day') for (let k = 0; k < bh / 14; k++) for (let c2 = 0; c2 < bw / 12; c2++) if (hash2(i * 31 + k * 7 + c2, r + seed * 3) > 0.83) { g.fillStyle = rgba('#ffd98a', 0.35 + 0.4 * (1 - far)); g.fillRect(bx + 4 + c2 * 12, y0 - bh + 6 + k * 14, 5, 6); }
        }
      }
    }
    function paintWindow(g, x, y, w, h, time, o = {}) {
      g.save(); roundRect(g, x, y, w, h, 6); g.clip();
      paintSky(g, x, y, w, h, time);
      if (time === 'night') { glowAt(g, x + w * 0.72, y + h * 0.25, 120, '#dfe6ff', 0.4); circle(g, x + w * 0.72, y + h * 0.25, 22, '#f2f4ff'); circle(g, x + w * 0.72 + 8, y + h * 0.25 - 5, 19, '#17204a'); }
      else if (time === 'dusk') { glowAt(g, x + w * 0.3, y + h * 0.75, 220, '#ffb27a', 0.6); }
      paintSkyline(g, x - 20, y + h + 4, w + 40, 3, time, o.seed || 1);
      // glass reflection
      g.fillStyle = 'rgba(255,255,255,0.06)'; g.beginPath(); g.moveTo(x + w * 0.1, y); g.lineTo(x + w * 0.35, y); g.lineTo(x, y + h * 0.5); g.lineTo(x, y + h * 0.2); g.closePath(); g.fill();
      g.restore();
      const fc = o.frame || '#e8e4dc', fm = mat(fc, o.L);
      g.strokeStyle = fm.base; g.lineWidth = 14; roundRect(g, x, y, w, h, 6); g.stroke();
      g.strokeStyle = fm.shade; g.lineWidth = 3; roundRect(g, x + 7, y + 7, w - 14, h - 14, 3); g.stroke();
      g.strokeStyle = fm.base; g.lineWidth = 8; g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); if (o.cross !== false) { g.moveTo(x, y + h * 0.42); g.lineTo(x + w, y + h * 0.42); } g.stroke();
      solid(g, () => roundRect(g, x - 22, y + h - 2, w + 44, 18, 4), fm, [x - 22, y + h - 2, w + 44, 18], -1, { rim: 2, top: 0.5, ao: 0.3 });
    }
    function paintCurtain(g, x, y, w, h, col, side) {
      const gr = g.createLinearGradient(x, 0, x + w, 0), n = 5;
      for (let i = 0; i <= n * 2; i++) gr.addColorStop(i / (n * 2), i % 2 ? dark(col, 0.32) : tint(col, 0.06));
      g.fillStyle = gr; g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y);
      g.quadraticCurveTo(x + w * (side < 0 ? 0.7 : 1.05), y + h * 0.6, x + w * (side < 0 ? 0.55 : 1.0), y + h); g.lineTo(x + w * (side < 0 ? 0 : 0.45), y + h);
      g.quadraticCurveTo(x + w * (side < 0 ? -0.05 : 0.3), y + h * 0.6, x, y); g.closePath(); g.fill();
      g.save(); g.clip(); texture(g, 'fabric', x - 20, y, w + 40, h, '#000000', 0.08); const ao = g.createLinearGradient(0, y + h - 120, 0, y + h); ao.addColorStop(0, 'rgba(0,0,0,0)'); ao.addColorStop(1, 'rgba(0,0,0,0.3)'); g.fillStyle = ao; g.fillRect(x - 20, y + h - 120, w + 40, 120); g.restore();
    }
    function paintBookshelf(g, x, y, w, h, L) {
      const wood = '#6b4a33', m = mat(wood, L);
      solid(g, () => g.rect(x, y, w, h), m, [x, y, w, h], L.dir, { rim: 3 });
      rr(g, x + 10, y + 10, w - 20, h - 20, 3, dark(wood, 0.5));
      const shelves = 4, sh = (h - 20) / shelves, cols = ['#c0584a', '#3f7a8c', '#d9a43a', '#5d6aa8', '#7b5aa6', '#4f8f62', '#e2d6c0', '#a8463e'];
      for (let s2 = 0; s2 < shelves; s2++) {
        const sy = y + 10 + (s2 + 1) * sh;
        let bx = x + 14;
        while (bx < x + w - 26) {
          const bw = 10 + 12 * hash2(bx, s2), bh = sh * (0.55 + 0.35 * hash2(bx, s2 + 9)), c = cols[(hash2(bx, s2 + 3) * cols.length) | 0];
          if (hash2(bx, s2 + 5) > 0.88) { bx += 18; continue; }
          const lean = hash2(bx, s2 + 7) > 0.9 ? 0.18 : 0;
          g.save(); g.translate(bx, sy - 6); g.rotate(lean);
          const bg = g.createLinearGradient(0, 0, bw, 0); bg.addColorStop(0, tint(c, 0.12)); bg.addColorStop(0.6, c); bg.addColorStop(1, dark(c, 0.35)); g.fillStyle = bg; g.fillRect(0, -bh, bw, bh);
          g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(2, -bh + 8, bw - 4, 2); g.fillRect(2, -16, bw - 4, 2);
          g.restore(); bx += bw + 1.5 + lean * 20;
        }
        solid(g, () => g.rect(x + 8, sy - 6, w - 16, 12), m, [x + 8, sy - 6, w - 16, 12], L.dir, { rim: 1.5, top: 0.6 });
        const ao = g.createLinearGradient(0, sy - sh + 6, 0, sy - sh + 40); ao.addColorStop(0, 'rgba(0,0,0,0.35)'); ao.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = ao; g.fillRect(x + 10, sy - sh + 6, w - 20, 34);
      }
    }
    function paintDoorway(g, x, y, w, h, lightCol, L) {
      const gr = g.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, tint(lightCol, 0.2)); gr.addColorStop(1, dark(lightCol, 0.25)); g.fillStyle = gr; g.fillRect(x, y, w, h);
      g.fillStyle = rgba(dark(lightCol, 0.4), 0.8); g.fillRect(x, y + h * 0.78, w, h * 0.22);
      g.fillStyle = rgba(dark(lightCol, 0.5), 0.6); g.beginPath(); g.moveTo(x, y); g.lineTo(x + w * 0.22, y + h * 0.1); g.lineTo(x + w * 0.22, y + h * 0.84); g.lineTo(x, y + h); g.closePath(); g.fill();
      const tm = mat('#e6dfd2', L);
      for (const [a, b, c2, d] of [[x - 18, y - 18, 18, h + 18], [x + w, y - 18, 18, h + 18], [x - 18, y - 22, w + 36, 22]]) solid(g, () => g.rect(a, b, c2, d), tm, [a, b, c2, d], L.dir, { rim: 2 });
      // open door leaf
      const dm = mat('#8a5f40', L);
      solid(g, () => { g.beginPath(); g.moveTo(x + w, y); g.lineTo(x + w + 62, y + 30); g.lineTo(x + w + 62, y + h + 10); g.lineTo(x + w, y + h); g.closePath(); }, dm, [x + w, y, 62, h + 10], L.dir, { rim: 2 });
      circle(g, x + w + 48, y + h * 0.55, 5, '#d8c27a');
    }
    function paintPlant(g, x, y, s, L, dark2) {
      g.save(); g.translate(x, y); g.scale(s, s);
      contactShadow(g, 0, 0, 130, 0.5);
      const leaf = (a, l, c) => { g.save(); g.rotate(a); g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(l * 0.28, -l * 0.5, 0, -l); g.quadraticCurveTo(-l * 0.28, -l * 0.5, 0, 0); const gr = g.createLinearGradient(-l * 0.2, 0, l * 0.2, 0); gr.addColorStop(0, tint(c, 0.15)); gr.addColorStop(1, dark(c, 0.3)); g.fillStyle = gr; g.fill(); g.strokeStyle = rgba(dark(c, 0.4), 0.6); g.lineWidth = 1.5; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -l * 0.95); g.stroke(); g.restore(); };
      g.save(); g.translate(0, -84);
      for (let i = 0; i < 11; i++) leaf(-1.25 + i * 0.25 + (hash2(i, 61) - 0.5) * 0.2, 100 + 70 * hash2(i, 62), dark2 ? '#2c4a3a' : i % 2 ? '#3f8f6b' : '#55a77c');
      g.restore();
      const pm = mat('#c9714f', L || DEFAULT_LIGHT);
      solid(g, () => { g.beginPath(); g.moveTo(-46, -92); g.lineTo(46, -92); g.lineTo(34, 0); g.lineTo(-34, 0); g.closePath(); }, pm, [-46, -92, 92, 92], -1, { rim: 2, ao: 0.3 });
      rr(g, -50, -100, 100, 16, 6, tint('#c9714f', 0.1));
      g.restore();
    }
    function paintFloorLamp(g, x, fy, L) {
      limbSeg(g, [x, fy - 6], [x, fy - 400], 4, 4, mat('#3a3f52', L), -1);
      solid(g, () => { g.beginPath(); g.ellipse(x, fy - 6, 44, 10, 0, 0, TAU); }, mat('#3a3f52', L), [x - 44, fy - 16, 88, 20], -1, { rim: 2 });
      const sh = () => { g.beginPath(); g.moveTo(x - 64, fy - 380); g.lineTo(x + 64, fy - 380); g.lineTo(x + 44, fy - 470); g.lineTo(x - 44, fy - 470); g.closePath(); };
      sh(); const gr = g.createLinearGradient(x - 64, 0, x + 64, 0); gr.addColorStop(0, '#fff0cf'); gr.addColorStop(1, '#e6c48e'); g.fillStyle = gr; g.fill();
      ell(g, x, fy - 380, 64, 8, 0, 'rgba(255,246,220,0.95)');
    }
    function blur(g, px, fn) { g.save(); g.filter = `blur(${px}px)`; fn(); g.restore(); }
    // ================================================================ WORLD v2 (layered, parallax, lit)
    // Each world2.<name>(ctx, opts) paints the back/mid layers for opts.cam (from K2.cam) and returns W:
    //   W.light (pass it to characters/props as opts.light), anchors (floorY, feetY, ...), W.stage(ctx, fn, d = 1)
    //   (draw characters in the depth-d plane), W.front(ctx, extra) (foreground layers + lighting pass + grain).
    // opts: t, cam, time, behind(ctx, W) (drawn between the back wall and the mid layer, at depth 0.8).
    function buildWorld(ctx, name, o, def) {
      const c = o.cam || null, t = o.t || 0, key = name + JSON.stringify(def.key || {});
      const W = Object.assign({ name, cam: c, light: def.L, t }, def.anchors);
      W.stage = (g, fn, d = 1) => { g.save(); depth(g, c, d); fn(); g.restore(); };
      W.enter = (g, d = 1) => { g.save(); depth(g, c, d); };
      W.exit = (g) => g.restore();
      W.toScreen = (x, y, d = 1) => { if (!c) return [x, y]; const z = 1 + (c.zoom - 1) * d; return [PX + (x - PX - c.x * d) * z, PY + (y - PY - c.y * d) * z]; };
      def.layers.forEach((ly, i) => {
        blitLayer(ctx, c, ly.d, layerCanvas(key + ly.id, ly.paint, ly.scale || 1));
        if (ly.anim) { ctx.save(); depth(ctx, c, ly.d); ly.anim(ctx, t); ctx.restore(); }
        if (i === 0 && o.behind) { ctx.save(); depth(ctx, c, 0.8); o.behind(ctx, W); ctx.restore(); }
      });
      // light shafts sit behind the characters (drawn over them they read as a veil)
      if (def.pass && def.pass.rays && o.rays !== false) light(ctx, { t, rays: def.pass.rays }, c);
      W.front = (g, extra = {}) => {
        for (const ly of def.fg || []) { blitLayer(g, c, ly.d, layerCanvas(key + ly.id, ly.paint, ly.scale || 1)); if (ly.anim) { g.save(); depth(g, c, ly.d); ly.anim(g, t); g.restore(); } }
        light(g, Object.assign({ t }, def.pass, { rays: null }, extra), c);
      };
      return W;
    }
    const world2 = {
      // Cosy living room at night: bookshelf, window with moonlit city, open doorway with warm hall light, floor lamp,
      // big sofa on a rug. Light: warm lamp key from the left, cool moon rim from the window.
      // Anchors: floorY, feetY, sofa {x, seatY, feetY, seatH (for sitting at feetY), left, right}, door {x, y}, lamp {x, y}
      livingRoom(ctx, o = {}) {
        const sofaC = o.sofa || '#3f6f86', lamp = o.lamp == null ? 1 : o.lamp;
        const L = { dir: -1, key: '#ffc58a', keyA: 0.2 * lamp + 0.04, rim: '#a7c0ff', rimA: 0.5, amb: '#151a3c', ambA: 0.4, ao: 0.55 };
        const fy = 850;
        return buildWorld(ctx, 'livingRoom', o, {
          key: { sofaC, lamp }, L,
          anchors: { floorY: fy, feetY: 1030, sofa: { x: 420, seatY: 878, feetY: 1030, seatH: 1030 - 880, left: 220, right: 620 }, door: { x: 955, y: fy + 8 }, lamp: { x: 105, y: 430 }, phoneSpot: { x: 560, y: 880 } },
          layers: [
            { id: 'back', d: 0.55, paint: (g) => {
              paintWall(g, -MX, -MY, CW + MX, fy, '#2b2f5c', '#232749', { stripes: 0.05 });
              glowAt(g, 130, 520, 460, '#ffb870', 0.2 * lamp + 0.02);
              paintBookshelf(g, -60, 430, 250, 420, L);
              paintWindow(g, 360, 420, 300, 280, 'night', { L, seed: 3 });
              rr(g, 280, 386, 460, 12, 6, '#3a3f58');
              paintCurtain(g, 296, 392, 96, 430, '#6a4f8e', 1); paintCurtain(g, 628, 392, 96, 430, '#6a4f8e', -1);
              paintDoorway(g, 880, 480, 160, 370, '#ffcf94', L);
              glowAt(g, 960, 760, 260, '#ffcf94', 0.18);
              paintBaseboard(g, fy, '#3c3f5e');
            } },
            { id: 'mid', d: 1, paint: (g) => {
              paintFloor(g, fy, '#4a3428', { kind: 'wood', spacing: 64, vx: 480 });
              glowAt(g, 120, 980, 420, '#ffb870', 0.12 * lamp);
              g.save(); g.translate(960, 900); g.scale(1, 0.35); glowAt(g, 0, 0, 260, '#ffcf94', 0.22); g.restore();
              // rug with a border
              g.save(); g.translate(470, 1075); g.scale(1, 0.2);
              circle(g, 0, 0, 470, '#3a2a52'); circle(g, 0, 0, 440, '#5a3f72'); g.strokeStyle = 'rgba(230,200,140,0.35)'; g.lineWidth = 10; g.beginPath(); g.arc(0, 0, 400, 0, TAU); g.stroke();
              g.restore();
              g.save(); g.beginPath(); g.ellipse(470, 1075, 470, 94, 0, 0, TAU); g.clip(); texture(g, 'fabric', 0, 980, 960, 200, '#000000', 0.12, 6); g.restore();
              paintFloorLamp(g, 105, 905, L);
              g.save(); g.translate(420, 1012); paintSofa(g, sofaC, L); g.restore();
              paintPlant(g, 1010, 980, 1.0, L);
            } },
          ],
          fg: [
            { id: 'fg', d: 1.4, paint: (g) => blur(g, 7, () => { paintPlant(g, 1080, 1560, 2.6, L, true); g.fillStyle = '#0d0f1f'; g.beginPath(); g.ellipse(-60, 1560, 260, 160, 0, 0, TAU); g.fill(); }) },
          ],
          pass: { pools: [{ x: 105, y: 470, r: 520, color: '#ffc27a', a: 0.11 * lamp, flicker: 0.05 }], rays: { x: 510, y: 430, angle: 1.95, spread: 0.3, count: 6, len: 760, w: 260, width: 46, color: '#bcd0ff', a: 0.09, d: 0.55 }, vignette: 0.62, grain: 0.05 },
        });
      },
      // Open-plan office with tall windows. opts: time day|dusk|night. Anchors: floorY, feetY, desk {x, y}
      office(ctx, o = {}) {
        const time = o.time || 'day', fy = 860;
        const L = time === 'day' ? { dir: 1, key: '#fff4e0', keyA: 0.2, rim: '#dfeaff', rimA: 0.45, amb: '#1d2440', ambA: 0.3, ao: 0.45 } : { dir: 1, key: '#ffc89a', keyA: 0.2, rim: '#ffb27a', rimA: 0.5, amb: '#1c1838', ambA: 0.4, ao: 0.5 };
        return buildWorld(ctx, 'office', o, {
          key: { time }, L,
          anchors: { floorY: fy, feetY: 1030, desk: { x: 540, y: 1030 } },
          layers: [
            { id: 'back', d: 0.5, paint: (g) => {
              paintWall(g, -MX, -MY, CW + MX, fy, '#3c4668', '#2e3654', {});
              for (let i = 0; i < 4; i++) paintWindow(g, -40 + i * 290, 380, 240, 420, time, { L, cross: false, seed: i + 5, frame: '#cfd5e2' });
              for (let i = 0; i < 4; i++) { rr(g, -40 + i * 290, 300, 240, 24, 6, '#e8eef8'); glowAt(g, 80 + i * 290, 330, 160, '#ffffff', 0.12); }
              paintBaseboard(g, fy, '#2a3048');
            } },
            { id: 'mid', d: 1, paint: (g) => {
              paintFloor(g, fy, '#3a4258', { kind: 'carpet' });
              for (let i = 0; i < 4; i++) { const x = 110 + i * 290, y = 930; contactShadow(g, x, y, 240, 0.4); rr(g, x - 110, y - 70, 220, 14, 5, '#6b5440'); rr(g, x - 100, y - 56, 8, 56, 3, '#2a2e3a'); rr(g, x + 92, y - 56, 8, 56, 3, '#2a2e3a'); rr(g, x - 46, y - 150, 92, 64, 6, '#1d2130'); rr(g, x - 40, y - 144, 80, 52, 4, mixHex('#1a2140', A.base, 0.12)); rr(g, x - 5, y - 86, 10, 16, 2, '#2a2e3a'); glowAt(g, x, y - 118, 90, A.light, 0.08); }
              paintPlant(g, 1020, 980, 1.1, L); paintPlant(g, 40, 990, 0.9, L);
            } },
          ],
          fg: [{ id: 'fg', d: 1.4, paint: (g) => blur(g, 8, () => { rr(g, -120, 1180, 360, 260, 20, '#141826'); paintPlant(g, 1090, 1500, 2.2, L, true); }) }],
          pass: { rays: { x: 540, y: 380, angle: time === 'day' ? 1.9 : 2.2, spread: 0.2, count: 7, len: 900, w: 900, width: 50, color: time === 'day' ? '#fff6e0' : '#ffb98a', a: 0.08, d: 0.5 }, vignette: 0.45, grain: 0.04 },
        });
      },
      // Courtroom: panelled wood, tall windows with god rays, generic balance emblem (no real seals), raised bench.
      // Anchors: floorY, feetY, bench {x, y (top of the bench, a judge stands behind it via opts.behind)}, podium {x, y}
      courtroom(ctx, o = {}) {
        const fy = 900, L = { dir: -1, key: '#ffdcae', keyA: 0.2, rim: '#ffe6bd', rimA: 0.4, amb: '#1e1424', ambA: 0.38, ao: 0.55 };
        return buildWorld(ctx, 'courtroom', o, {
          key: {}, L,
          anchors: { floorY: fy, feetY: 1035, bench: { x: 540, y: 640 }, podium: { x: 540, y: 1035 } },
          layers: [
            { id: 'back', d: 0.55, paint: (g) => {
              paintWall(g, -MX, -MY, CW + MX, fy, '#5d3d2b', '#3e281d', { panels: 180, panelTop: 420 });
              texture(g, 'wood', -MX, 380, CW + MX * 2, fy - 380, '#000000', 0.12, 2);
              for (const wx of [-30, 900]) paintWindow(g, wx, 330, 180, 380, 'day', { L, frame: '#e8dcc6' });
              for (const cx of [230, 850]) { const cm = mat('#d9d0bf', L); solid(g, () => g.rect(cx - 34, 300, 68, 600), cm, [cx - 34, 300, 68, 600], -1, { rim: 3 }); rr(g, cx - 48, 288, 96, 22, 4, '#e8e0d0'); rr(g, cx - 48, 880, 96, 22, 4, '#e8e0d0'); }
              // generic emblem: balance scale in a ring
              const ex = 540, ey = 460; circle(g, ex, ey, 82, '#3e281d'); g.strokeStyle = '#d9b45a'; g.lineWidth = 7; g.beginPath(); g.arc(ex, ey, 70, 0, TAU); g.stroke();
              g.lineWidth = 5; g.beginPath(); g.moveTo(ex, ey - 40); g.lineTo(ex, ey + 38); g.moveTo(ex - 40, ey - 22); g.lineTo(ex + 40, ey - 22); g.moveTo(ex - 22, ey + 38); g.lineTo(ex + 22, ey + 38); g.stroke();
              for (const dx of [-38, 38]) { g.beginPath(); g.moveTo(ex + dx - 15, ey + 6); g.lineTo(ex + dx, ey - 22); g.lineTo(ex + dx + 15, ey + 6); g.stroke(); g.beginPath(); g.arc(ex + dx, ey + 6, 15, 0, PI); g.stroke(); }
              paintBaseboard(g, fy, '#2e1d15', 30);
            } },
            { id: 'mid', d: 1, paint: (g) => {
              paintFloor(g, fy, '#3b2b2a', { kind: 'stone', spacing: 60 });
              const bm = mat('#6e4a33', L);
              contactShadow(g, 540, 905, 820, 0.6, 0.1);
              solid(g, () => g.rect(150, 650, 780, 255), bm, [150, 650, 780, 255], -1, { rim: 3, ao: 0.35 });
              g.save(); g.beginPath(); g.rect(150, 650, 780, 255); g.clip(); texture(g, 'wood', 150, 650, 780, 255, '#2a160c', 0.3, 7); g.restore();
              for (let i = 0; i < 4; i++) { rr(g, 190 + i * 185, 690, 150, 180, 8, rgba('#000000', 0.16)); g.strokeStyle = 'rgba(255,230,190,0.12)'; g.lineWidth = 2; roundRect(g, 193 + i * 185, 693, 144, 174, 6); g.stroke(); }
              solid(g, () => roundRect(g, 130, 622, 820, 36, 10), mat('#83593e', L), [130, 622, 820, 36], -1, { rim: 2, top: 0.5 });
            } },
          ],
          fg: [{ id: 'fg', d: 1.4, paint: (g) => blur(g, 6, () => { for (let i = 0; i < 2; i++) { rr(g, -100, 1210 + i * 130, CW + 200, 40, 10, '#3a2418'); rr(g, -100, 1250 + i * 130, CW + 200, 70, 6, '#24160f'); } }) }],
          pass: { rays: { x: 60, y: 360, angle: 0.75, spread: 0.18, count: 6, len: 1000, w: 150, width: 60, color: '#fff0d0', a: 0.1, d: 0.55 }, vignette: 0.58, grain: 0.05 },
        });
      },
      // City street at dusk: hazy far skyline (atmospheric perspective), mid towers, near shopfronts with glowing
      // windows, street lamps. Anchors: groundY, feetY, shops [x...]
      cityStreet(ctx, o = {}) {
        const time = o.time || 'dusk', gy = 1035;
        const L = { dir: 1, key: '#ffbd8f', keyA: 0.24, rim: '#ff9f72', rimA: 0.55, amb: '#2a2550', ambA: 0.45, ao: 0.5 };
        return buildWorld(ctx, 'cityStreet', o, {
          key: { time }, L,
          anchors: { groundY: gy, feetY: gy, floorY: gy, shops: [200, 540, 880] },
          layers: [
            { id: 'sky', d: 0.08, scale: 0.5, paint: (g) => { paintSky(g, -MX, -MY, CW + MX * 2, 1000, time); glowAt(g, 760, 690, 420, '#ffb27a', 0.55); circle(g, 760, 690, 46, '#ffd7a8'); } },
            { id: 'far', d: 0.25, scale: 0.5, paint: (g) => blur(g, 2, () => paintSkyline(g, -MX, 820, CW + MX * 2, 2, time, 11)) },
            { id: 'midb', d: 0.55, paint: (g) => {
              for (let i = 0; i < 7; i++) { const x = -160 + i * 210, w = 170 + 40 * hash2(i, 1), h = 380 + 260 * hash2(i, 2), col = mixHex('#3a3260', '#c47a8a', 0.18);
                rr(g, x, 900 - h, w, h + 40, 4, col); for (let r = 0; r < h / 40; r++) for (let c2 = 0; c2 < w / 34; c2++) { const lit = hash2(i * 77 + r * 5 + c2, 3) > 0.7; g.fillStyle = lit ? 'rgba(255,214,140,0.55)' : 'rgba(20,18,40,0.35)'; g.fillRect(x + 12 + c2 * 34, 900 - h + 18 + r * 40, 16, 22); } }
              const hz = g.createLinearGradient(0, 600, 0, 940); hz.addColorStop(0, 'rgba(240,150,140,0)'); hz.addColorStop(1, 'rgba(240,150,140,0.25)'); g.fillStyle = hz; g.fillRect(-MX, 600, CW + MX * 2, 340);
            } },
            { id: 'near', d: 1, paint: (g) => {
              const cols = ['#7a4f5e', '#4f5f86', '#8a6a4a', '#5a4a7a', '#6a7a5a'];
              for (let i = 0; i < 5; i++) {
                const x = -150 + i * 340, w = 330, top = 560 + 40 * hash2(i, 4), col = cols[i % cols.length], m = mat(col, L);
                solid(g, () => g.rect(x, top, w, gy - top), m, [x, top, w, gy - top], 1, { rim: 3 });
                g.save(); g.beginPath(); g.rect(x, top, w, gy - top); g.clip(); texture(g, 'speckle', x, top, w, gy - top, '#000000', 0.25, i); for (let r = 0; r < 12; r++) { g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(x, top + r * 24, w, 2); } g.restore();
                rr(g, x + 30, gy - 230, w - 60, 170, 6, '#2a1f2a');
                const sg = g.createLinearGradient(0, gy - 230, 0, gy - 60); sg.addColorStop(0, '#ffd59a'); sg.addColorStop(1, '#e8945a'); rr(g, x + 38, gy - 222, w - 76, 154, 4, sg);
                for (let k = 0; k < 4; k++) rr(g, x + 56 + k * 60, gy - 150 + 30 * hash2(i, k), 36, 80, 4, rgba('#6a3a2a', 0.45));
                glowAt(g, x + w / 2, gy - 140, 220, '#ffc07a', 0.18);
                // awning
                g.save(); g.beginPath(); g.moveTo(x + 18, gy - 250); g.lineTo(x + w - 18, gy - 250); g.lineTo(x + w + 2, gy - 196); g.lineTo(x - 2, gy - 196); g.closePath(); g.clip();
                for (let k = 0; k < 12; k++) { g.fillStyle = k % 2 ? tint(cols[(i + 2) % 5], 0.3) : '#efe4d0'; g.fillRect(x - 10 + k * 30, gy - 260, 30, 70); }
                g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x - 10, gy - 215, w + 20, 20); g.restore();
                rr(g, x + w - 76, gy - 280, 56, 210, 4, '#2a2030');
              }
              // sidewalk + curb + road
              const sw = g.createLinearGradient(0, gy, 0, gy + 120); sw.addColorStop(0, '#6a6170'); sw.addColorStop(1, '#4a4356'); g.fillStyle = sw; g.fillRect(-MX, gy, CW + MX * 2, 120);
              g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; for (let i = -6; i < 12; i++) { g.beginPath(); g.moveTo(i * 120, gy); g.lineTo(i * 120 - 40, gy + 120); g.stroke(); }
              rr(g, -MX, gy + 120, CW + MX * 2, 16, 0, '#8a8290');
              const rd = g.createLinearGradient(0, gy + 136, 0, CH + MY); rd.addColorStop(0, '#2a2638'); rd.addColorStop(1, '#141220'); g.fillStyle = rd; g.fillRect(-MX, gy + 136, CW + MX * 2, CH + MY - gy - 136);
              const ao = g.createLinearGradient(0, gy, 0, gy + 30); ao.addColorStop(0, 'rgba(0,0,0,0.4)'); ao.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = ao; g.fillRect(-MX, gy, CW + MX * 2, 30);
              for (const lx of [60, 1010]) { limbSeg(g, [lx, gy + 10], [lx, gy - 420], 7, 6, mat('#2a2a3a', L), 1); rr(g, lx - 34, gy - 440, 68, 22, 10, '#2a2a3a'); circle(g, lx, gy - 414, 12, '#ffe2a8'); }
            } },
          ],
          fg: [{ id: 'fg', d: 1.45, paint: (g) => blur(g, 7, () => { limbSeg(g, [1050, 1700], [1050, 300], 22, 20, mat('#16141f', L), 1); rr(g, -80, 1240, 300, 120, 20, '#16141f'); }) }],
          pass: { pools: [{ x: 60, y: 600, r: 260, color: '#ffd9a0', a: 0.3, flicker: 0.04 }, { x: 1010, y: 600, r: 260, color: '#ffd9a0', a: 0.3, flicker: 0.04 }, { x: 540, y: 1050, r: 520, color: '#ffb070', a: 0.08, sy: 0.3 }], vignette: 0.5, grain: 0.05, haze: { y: 900, h: 160, color: '#f0a090', a: 0.06 } },
        });
      },
      // Chip factory clean room: bright panels, amber-lit lithography bay, a big tool, perforated floor tiles.
      // Anchors: floorY, feetY, tool {x, y}, window {x, y}
      factory(ctx, o = {}) {
        const fy = 880, L = { dir: -1, key: '#f2f6ff', keyA: 0.2, rim: '#ffd36a', rimA: 0.45, amb: '#1b2238', ambA: 0.3, ao: 0.45 };
        return buildWorld(ctx, 'factory', o, {
          key: {}, L,
          anchors: { floorY: fy, feetY: 1030, tool: { x: 230, y: 1000 }, window: { x: 760, y: 600 } },
          layers: [
            { id: 'back', d: 0.5, paint: (g) => {
              paintWall(g, -MX, -MY, CW + MX, fy, '#8f9bb8', '#6c7896', { panels: 150, panelTop: 330 });
              for (let i = 0; i < 9; i++) { rr(g, -100 + i * 150, 250, 120, 40, 4, '#f4f8ff'); glowAt(g, -40 + i * 150, 290, 150, '#ffffff', 0.14); }
              // amber lithography bay window
              g.save(); roundRect(g, 560, 420, 420, 330, 10); g.clip();
              const am = g.createLinearGradient(0, 420, 0, 750); am.addColorStop(0, '#ffcf5a'); am.addColorStop(1, '#d98a1e'); g.fillStyle = am; g.fillRect(560, 420, 420, 330);
              for (let i = 0; i < 5; i++) { const k = 1 - i * 0.16, x = 600 + i * 72, h = 160 * k; rr(g, x, 750 - h, 60 * k, h, 6, rgba('#8a5410', 0.55 - i * 0.06)); }
              g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.moveTo(560, 420); g.lineTo(700, 420); g.lineTo(560, 600); g.closePath(); g.fill();
              g.restore();
              g.strokeStyle = '#dfe5f0'; g.lineWidth = 14; roundRect(g, 560, 420, 420, 330, 10); g.stroke();
              glowAt(g, 770, 600, 380, '#ffc040', 0.18);
              paintBaseboard(g, fy, '#5a6680');
            } },
            { id: 'mid', d: 1, paint: (g) => {
              paintFloor(g, fy, '#9aa6be', { kind: 'tile', spacing: 90 });
              texture(g, 'speckle', -MX, fy, CW + MX * 2, 600, '#3a4560', 0.35, 3);
              // big tool
              const tm = mat('#e8edf6', L);
              contactShadow(g, 240, 1000, 420, 0.5, 0.12);
              solid(g, () => roundRect(g, 60, 640, 360, 360, 26), tm, [60, 640, 360, 360], -1, { rim: 4, ao: 0.3, top: 0.2 });
              rr(g, 100, 690, 150, 100, 10, '#1c2236'); rr(g, 110, 700, 130, 80, 6, mixHex('#1c2236', A.base, 0.2));
              for (let i = 0; i < 3; i++) rr(g, 120, 712 + i * 22, 60 + 40 * hash2(i, 3), 8, 4, i === 1 ? A.base : 'rgba(255,255,255,0.5)');
              rr(g, 280, 690, 110, 280, 10, '#d4dbe8'); for (let i = 0; i < 6; i++) rr(g, 292, 710 + i * 42, 86, 26, 4, '#c3cbdb');
              circle(g, 380, 668, 9, '#5be08a');
              rr(g, 60, 960, 360, 40, 8, '#c3cbdb');
            } },
          ],
          fg: [{ id: 'fg', d: 1.4, paint: (g) => blur(g, 7, () => { rr(g, -100, 160, CW + 200, 34, 10, '#3a4458'); for (const x of [120, 760]) rr(g, x, 100, 26, 120, 8, '#3a4458'); rr(g, 900, 1150, 320, 300, 24, '#cfd6e4'); }) }],
          pass: { pools: [{ x: 770, y: 980, r: 420, color: '#ffc040', a: 0.12, sy: 0.35 }], rays: { x: 770, y: 600, angle: 2.0, spread: 0.3, count: 5, len: 600, w: 300, width: 50, color: '#ffd070', a: 0.06, d: 0.5 }, vignette: 0.4, grain: 0.04 },
        });
      },
      // Record store / music studio: record bins with abstract sleeves, a neon strip in the accent colour, acoustic
      // panels, a counter with a turntable, pendant lamps. Anchors: floorY, feetY, counter {x, y (top)}
      studio(ctx, o = {}) {
        const fy = 880, L = { dir: 1, key: '#ffcf9a', keyA: 0.22, rim: '#8fd8ff', rimA: 0.45, amb: '#1c1530', ambA: 0.42, ao: 0.55 };
        return buildWorld(ctx, 'studio', o, {
          key: {}, L,
          anchors: { floorY: fy, feetY: 1030, counter: { x: 800, y: 820 } },
          layers: [
            { id: 'back', d: 0.55, paint: (g) => {
              paintWall(g, -MX, -MY, CW + MX, fy, '#2f2440', '#211a2c', { stripes: 0.04 });
              // neon strip
              rr(g, -MX, 360, CW + MX * 2, 10, 5, A.light); glowAt(g, 200, 365, 300, A.base, 0.25); glowAt(g, 700, 365, 300, A.base, 0.25);
              // record wall: sleeves face out, abstract graphic shapes only
              const cols = ['#e0705f', '#3f9c8f', '#d9a43a', '#4f6fc2', '#7b5aa6', '#efe6d6', '#c0584a', '#5fb0d8'];
              for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
                const x = 30 + c * 108, y = 410 + r * 130, col = cols[(r * 6 + c * 5) % cols.length];
                rr(g, x, y + 112, 100, 8, 2, '#5a3c2a');
                g.save(); g.translate(x + 50, y + 56); g.rotate((hash2(r, c) - 0.5) * 0.08);
                const sg = g.createLinearGradient(-46, -46, 46, 46); sg.addColorStop(0, tint(col, 0.15)); sg.addColorStop(1, dark(col, 0.25)); rr(g, -46, -46, 92, 92, 3, sg);
                const k = (hash2(c, r + 4) * 3) | 0; g.fillStyle = rgba('#ffffff', 0.35);
                if (k === 0) circle(g, 0, 0, 24, rgba('#1a1420', 0.5)); else if (k === 1) { g.fillRect(-30, -10, 60, 8); g.fillRect(-30, 6, 40, 8); } else { g.beginPath(); g.moveTo(-28, 28); g.lineTo(0, -26); g.lineTo(28, 28); g.closePath(); g.fill(); }
                g.restore();
              }
              // acoustic panels
              for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) { const x = 720 + c * 150, y = 420 + r * 105; solid(g, () => roundRect(g, x, y, 130, 92, 8), mat('#3a2f4f', L), [x, y, 130, 92], 1, { rim: 2 }); for (let k = 0; k < 4; k++) rr(g, x + 10, y + 12 + k * 20, 110, 8, 4, 'rgba(0,0,0,0.25)'); }
              paintBaseboard(g, fy, '#1a1422');
            } },
            { id: 'mid', d: 1, paint: (g) => {
              paintFloor(g, fy, '#4a3428', { kind: 'wood', spacing: 70 });
              // record bins (front) + counter
              const wm = mat('#7a5236', L);
              for (let i = 0; i < 2; i++) { const x = 60 + i * 260; contactShadow(g, x + 110, 1000, 260, 0.5); solid(g, () => roundRect(g, x, 880, 220, 120, 8), wm, [x, 880, 220, 120], 1, { rim: 2, ao: 0.3 }); for (let k = 0; k < 9; k++) { const c = ['#e0705f', '#3f9c8f', '#d9a43a', '#4f6fc2', '#7b5aa6'][(k + i * 2) % 5]; rr(g, x + 14 + k * 22, 846 + 6 * hash2(k, i), 18, 50, 2, dark(c, 0.1 + 0.2 * (k % 2))); } }
              contactShadow(g, 800, 1000, 380, 0.55);
              solid(g, () => roundRect(g, 620, 820, 360, 180, 10), wm, [620, 820, 360, 180], 1, { rim: 3, ao: 0.35 });
              g.save(); roundRect(g, 620, 820, 360, 180, 10); g.clip(); texture(g, 'wood', 620, 820, 360, 180, '#2a160c', 0.3, 4); g.restore();
              solid(g, () => roundRect(g, 600, 806, 400, 24, 8), mat('#2a2d36', L), [600, 806, 400, 24], 1, { rim: 2, top: 0.5 });
            } },
          ],
          fg: [{ id: 'fg', d: 1.4, paint: (g) => blur(g, 6, () => { for (const x of [140, 980]) { g.strokeStyle = '#120e18'; g.lineWidth = 6; g.beginPath(); g.moveTo(x, -MY); g.lineTo(x, 240); g.stroke(); g.fillStyle = '#120e18'; g.beginPath(); g.moveTo(x - 70, 300); g.lineTo(x + 70, 300); g.lineTo(x + 30, 230); g.lineTo(x - 30, 230); g.closePath(); g.fill(); } }) }],
          anim: null,
          pass: { pools: [{ x: 140, y: 330, r: 360, color: '#ffcf8a', a: 0.22, flicker: 0.03, d: 1.4 }, { x: 980, y: 330, r: 360, color: '#ffcf8a', a: 0.22, flicker: 0.03, d: 1.4 }, { x: 540, y: 365, r: 500, color: A.base, a: 0.06, d: 0.55 }], vignette: 0.6, grain: 0.05 },
        });
      },
    };
    world2.recordStore = world2.studio;
    world2.cleanroom = world2.factory;

    const SIZE = { human: [120, 380], kid: [90, 250], robot: [170, 330], assistant: [210, 260], phone: [70, 140], laptop: [280, 170], desk: [340, 150],
      chair: [150, 240], sofa: [680, 270], document: [150, 190], folder: [200, 150], gavel: [220, 130], coin: [70, 70], bills: [150, 90], chip: [180, 180],
      wafer: [250, 120], building: [260, 460], musicPlayer: [300, 110], headphones: [170, 170], shield: [140, 165], trophy: [150, 230], lamp: [120, 200] };
    return {
      motion: M, ACCENT: A, MASCOT, SKIN, HAIR, EYES, CLOTH, AGE, POSES, EXPR, SIZE, font, mat,
      drawHuman, drawRobot, drawAssistant,
      drawPhone, drawLaptop, drawDesk, drawChair, drawSofa, drawDocument, drawFolder, drawGavel, drawCoin, drawBills, drawChip, drawWafer,
      drawBuilding, drawMusicPlayer, drawHeadphones, drawShield, drawTrophy, drawLamp,
      world2, cam, depth, light, contactShadow, castShadow, grain, texture, glow: glowAt, solid, limb: limbSeg, cached,
    };
  }

  window.EXPLAINER_KIT2 = { create, SKIN, HAIR, EYES, CLOTH, AGE, BODY, DEFAULT_LIGHT };
})();
