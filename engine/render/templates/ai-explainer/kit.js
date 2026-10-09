/* ai-explainer illustration kit for scene modules (info.helpers.kit).
 * Flat, friendly vector style: simple rounded shapes, 2-3 tones per object (base / shade / light), soft
 * ground shadows, the clip's accent colour for highlights. Canvas paths only: no images, emoji or logos.
 *
 * Every draw<Thing>(ctx, x, y, scale, opts) is anchored at its BOTTOM-CENTRE (x, y) = where it stands, and
 * is drawn at a nominal size (kit.SIZE.<thing> = [w, h] at scale 1). Animation is driven by opts (t, progress,
 * talk ...) so everything stays a pure function of time. Characters are generic cartoons, never real people.
 */
(function () {
  'use strict';
  const K = window.CLIPKIT;
  const { clamp, lerp, smooth, easeOutCubic, easeInOutCubic, spring, roundRect, rgba, mixHex, hash2, glow, drawGlow } = K;
  const TAU = Math.PI * 2;
  const fract = (x) => x - Math.floor(x);

  const SKIN = ['#f7d7bd', '#eab894', '#cf9466', '#a06844', '#6e4429'];
  const HAIR = ['#2a211e', '#5b3b25', '#b9782f', '#d9d4cc', '#1d2236'];
  const SHIRT = ['#6f86e0', '#4fb3a6', '#e8786a', '#a08be0', '#8a93a8'];
  const N = { // neutrals for objects
    paper: '#f2f4fa', paperS: '#d5dae8', light: '#dfe4f1', lightS: '#b9c1d6', lightL: '#f5f7fc',
    dark: '#2a2f45', darkS: '#1c2033', darkL: '#3b4260', screen: '#121527', ink: '#161927',
    wood: '#9a6a46', woodS: '#764d31', danger: '#ff6b5e', warn: '#ffcc33', blue: '#283152', blueL: '#3a4675',
  };
  const SIZE = {
    person: [120, 240], robot: [130, 225], phone: [130, 240], laptop: [260, 150], serverRack: [120, 230],
    dataCenter: [330, 190], document: [140, 180], coin: [64, 64], bills: [130, 80], priceTag: [130, 150],
    chart: [270, 175], lock: [90, 125], shield: [120, 140], globe: [170, 170], gavel: [190, 120], rulebook: [170, 210],
    briefcase: [170, 135], clock: [130, 130], lightbulb: [100, 160], warning: [140, 125], speechBubble: [0, 0],
    stamp: [190, 190], label: [0, 0], desk: [300, 110], building: [240, 420], lectern: [220, 232],
  };

  function create(cfg) {
    const ACC = (cfg && cfg.accent) || '#ffe14a';
    const CW = (cfg && cfg.width) || 1080, CH = (cfg && cfg.height) || 1920;
    const A = { base: ACC, shade: mixHex(ACC, '#000000', 0.28), light: mixHex(ACC, '#ffffff', 0.4), deep: mixHex(ACC, '#000000', 0.62) };
    const F = (w, fam, size) => `${w} ${Math.round(size * 10) / 10}px "${fam}"`;
    const font = { display: (s) => F(900, 'Montserrat', s), bold: (s) => F(800, 'Montserrat', s), ui: (s) => F(700, 'Inter', s), body: (s) => F(500, 'Inter', s), condensed: (s) => F(400, 'Anton', s) };

    // ------------------------------------------------------------ primitives
    const at = (ctx, x, y, s, fn) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); fn(); ctx.restore(); };
    function shadow(ctx, x, y, w, alpha = 0.32) {
      ctx.save();
      ctx.translate(x, y); ctx.scale(1, 0.22);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, w / 2);
      g.addColorStop(0, `rgba(0,0,0,${alpha})`); g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, w / 2, 0, TAU); ctx.fill();
      ctx.restore();
    }
    function rr(ctx, x, y, w, h, r, fill) { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); }
    function circle(ctx, x, y, r, fill) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); }
    function limb(ctx, pts, w, color) {
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color; ctx.stroke();
    }
    // two-tone fill: base everywhere, shade on the right part (light from the upper left)
    function twoTone(ctx, pathFn, base, shade, split, x0, y0, w, h) {
      ctx.save(); pathFn(); ctx.fillStyle = base; ctx.fill(); ctx.clip();
      ctx.fillStyle = shade; ctx.fillRect(x0 + w * split, y0 - 2, w, h + 4);
      ctx.restore();
    }
    function addGlow(ctx, x, y, r, color, a) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(ctx, glow(color, 0.3), x, y, r, a); ctx.restore(); }
    const pick = (arr, v, d) => (typeof v === 'string' ? v : arr[(v == null ? d : v | 0) % arr.length]);
    const blinkAt = (t, seed) => fract((t + seed * 1.37) / 3.3) < 0.045;

    // ------------------------------------------------------------ motion helpers
    const easeOutBack = (k) => { k = clamp(k); const c = 1.7; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
    const motion = {
      // scale 0 -> 1 with a little overshoot, starting at `delay`
      popIn: (t, delay = 0, dur = 0.38) => (t <= delay ? 0 : easeOutBack((t - delay) / dur)),
      fadeIn: (t, delay = 0, dur = 0.3) => smooth((t - delay) / dur),
      fadeOut: (t, start, dur = 0.25) => 1 - smooth((t - start) / dur),
      // offset that goes from `dist` to 0 (use for x or y)
      slideIn: (t, delay = 0, dur = 0.45, dist = 60) => dist * (1 - easeOutCubic((t - delay) / dur)),
      bob: (t, amp = 6, speed = 1, phase = 0) => Math.sin((t * speed + phase) * TAU) * amp,
      // decaying shake offset after `start`
      shake: (t, start = 0, dur = 0.5, amp = 10, freq = 38) => (t < start || t > start + dur ? 0 : Math.sin((t - start) * freq) * amp * (1 - (t - start) / dur)),
      typewriter: (text, t, cps = 18, delay = 0) => String(text).slice(0, Math.max(0, Math.floor((t - delay) * cps))),
      countUp: (value, t, delay = 0, dur = 0.9, decimals = 0) => +(value * easeOutCubic((t - delay) / dur)).toFixed(decimals),
      // local times of items revealed one after another: [t - delay, t - delay - step, ...]
      stagger: (items, t, step = 0.15, delay = 0) => items.map((_, i) => t - delay - i * step),
      ease: easeInOutCubic, easeOut: easeOutCubic, easeOutBack, spring, smooth,
      // progress 0..1 of window [a, b] with an ease
      phase: (t, a, b, ease = easeInOutCubic) => ease((t - a) / Math.max(1e-6, b - a)),
      // stroke a polyline up to `progress` (0..1) of its length; set strokeStyle/lineWidth first
      pathDraw(ctx, pts, progress) {
        if (pts.length < 2 || progress <= 0) return;
        let total = 0; const seg = [];
        for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); total += d; }
        let left = total * clamp(progress);
        ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i < pts.length && left > 0; i++) {
          const k = Math.min(1, left / seg[i - 1]);
          ctx.lineTo(lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k));
          left -= seg[i - 1];
        }
        ctx.stroke();
      },
      // point on a sampled path at progress u (0..1)
      pathPoint(pts, u) {
        const f = clamp(u) * (pts.length - 1), i = Math.min(pts.length - 2, Math.floor(f)), r = f - i;
        return [lerp(pts[i][0], pts[i + 1][0], r), lerp(pts[i][1], pts[i + 1][1], r)];
      },
      // sample a cubic bezier into n+1 points
      bezier(x0, y0, x1, y1, x2, y2, x3, y3, n = 40) {
        const pts = [];
        for (let i = 0; i <= n; i++) { const u = i / n, a = 1 - u; pts.push([a * a * a * x0 + 3 * a * a * u * x1 + 3 * a * u * u * x2 + u * u * u * x3, a * a * a * y0 + 3 * a * a * u * y1 + 3 * a * u * u * y2 + u * u * u * y3]); }
        return pts;
      },
      // camera: keys [{t, zoom, x, y}] (x, y = scene point brought to the anchor (ax, ay), default the centre),
      // eased between keys. Call first in draw(), inside ctx.save()/restore().
      camera(ctx, t, keys, w = 855, h = 480, ax = w / 2, ay = h / 2) {
        if (!keys || !keys.length) return { zoom: 1, x: ax, y: ay };
        let a = keys[0], b = keys[keys.length - 1];
        for (let i = 0; i < keys.length - 1; i++) if (t >= keys[i].t && t <= keys[i + 1].t) { a = keys[i]; b = keys[i + 1]; break; }
        const k = t <= keys[0].t ? 0 : t >= keys[keys.length - 1].t ? 1 : easeInOutCubic((t - a.t) / Math.max(1e-6, b.t - a.t));
        const A0 = t <= keys[0].t ? keys[0] : a, B0 = t >= keys[keys.length - 1].t ? keys[keys.length - 1] : b;
        const z = lerp(A0.zoom ?? 1, B0.zoom ?? 1, k), x = lerp(A0.x ?? ax, B0.x ?? ax, k), y = lerp(A0.y ?? ay, B0.y ?? ay, k);
        ctx.translate(ax, ay); ctx.scale(z, z); ctx.translate(-x, -y);
        return { zoom: z, x, y };
      },
    };

    // ------------------------------------------------------------ characters
    // Person: ~240 tall at scale 1. opts: pose 'stand'|'sit-laptop'|'phone'|'point'|'shrug'|'cheer', t, talk (0..1,
    // e.g. info.env), skin (0-4 or hex), hair (0-4 or hex), hairStyle 'short'|'long'|'bun'|'curly'|'none',
    // shirt (0-4 or hex), pants, walk (seconds of walking, or null), look (-1..1), mood 'happy'|'neutral'|'worried',
    // flip (face left), seed (varies blink timing).
    function drawPerson(ctx, x, y, s, o = {}) {
      const t = o.t || 0, pose = o.pose || 'stand', seed = o.seed || 0;
      const skin = pick(SKIN, o.skin, 1), skinS = mixHex(skin, '#5a3020', 0.22);
      const hair = pick(HAIR, o.hair, 0), shirt = pick(SHIRT, o.shirt, 0), shirtS = mixHex(shirt, '#101020', 0.25);
      const pants = o.pants || '#2d3350', shoe = '#171a26';
      const sit = pose.startsWith('sit');
      const walking = o.walk != null && !sit;
      const ph = walking ? o.walk * 1.8 * TAU : 0;
      const bob = walking ? -Math.abs(Math.sin(ph)) * 5 : Math.sin(t * 1.6 + seed) * 1.2;
      at(ctx, x, y, s, () => {
        if (o.flip) ctx.scale(-1, 1);
        shadow(ctx, 0, 0, sit ? 130 : 96);
        const hipY = (sit ? -78 : -104) + bob, shY = hipY - 64, headY = shY - 44;
        // seat
        if (sit && o.seat !== false) {
          rr(ctx, -46, hipY + 4, 92, 14, 7, N.dark);
          ctx.fillStyle = N.darkS; ctx.fillRect(-5, hipY + 18, 10, -hipY - 22);
          rr(ctx, -34, -8, 68, 8, 4, N.darkS);
        }
        // legs
        const leg = (side) => {
          const hx = side * 13;
          if (sit) { limb(ctx, [[hx, hipY], [hx + side * 6, hipY + 34], [hx + side * 4, -10]], 17, pants); return [hx + side * 4, -6]; }
          const a = walking ? Math.sin(ph + (side > 0 ? Math.PI : 0)) * 0.42 : 0;
          const bend = walking ? Math.max(0, -Math.cos(ph + (side > 0 ? Math.PI : 0))) * 0.5 : 0;
          const L = -hipY / 2 - 3;
          const kx = hx + Math.sin(a) * L, ky = hipY + Math.cos(a) * L;
          const fx = kx + Math.sin(a - bend) * L, fy = ky + Math.cos(a - bend) * L;
          limb(ctx, [[hx, hipY], [kx, ky], [fx, fy]], 17, pants);
          return [fx, fy + 3];
        };
        const feet = [leg(-1), leg(1)];
        feet.forEach(([fx, fy]) => { ctx.save(); ctx.translate(fx + 5, fy - 2); circle(ctx, 0, 0, 0.1, shoe); ctx.scale(1.6, 1); circle(ctx, 0, 0, 8.5, shoe); ctx.restore(); });
        // arm targets per pose: [elbow, hand] for left (-x) and right (+x)
        const sx = 27;
        let L = [[-36, shY + 36], [-38, shY + 70]], R = [[36, shY + 36], [38, shY + 70]];
        let tilt = 0, brows = 0, lookY = 0, prop = null;
        if (walking) {
          const sw = Math.sin(ph) * 16;
          L = [[-33 + sw * 0.4, shY + 36], [-34 + sw, shY + 68]]; R = [[33 - sw * 0.4, shY + 36], [34 - sw, shY + 68]];
        } else if (pose === 'point') {
          R = [[62, shY + 4], [98, shY - 8]]; prop = 'finger';
        } else if (pose === 'shrug') {
          const k = 0.5 + 0.5 * Math.sin(t * 2.2);
          L = [[-50, shY + 30], [-66, shY + 4 - 4 * k]]; R = [[50, shY + 30], [66, shY + 4 - 4 * k]]; tilt = 0.07; brows = 1;
        } else if (pose === 'cheer') {
          const k = Math.sin(t * 7) * 5;
          L = [[-48, shY - 26], [-58, shY - 66 + k]]; R = [[48, shY - 26], [58, shY - 66 - k]];
        } else if (pose === 'phone' || pose === 'sit-phone') {
          const ty = o.typing ? Math.sin(t * (o.typing > 1 ? 26 : 16)) * 3 * Math.min(2, o.typing) : 0;
          L = [[-28, shY + 44], [-6, shY + 24 + ty]]; R = [[28, shY + 44], [10, shY + 18 - ty]]; lookY = 3; tilt = -0.04; prop = 'phone';
        } else if (pose === 'sit') {
          L = [[-36, shY + 40], [-22, shY + 66]]; R = [[36, shY + 40], [22, shY + 66]];
        } else if (sit) {
          const k1 = Math.sin(t * 15) * 3, k2 = Math.sin(t * 15 + 2) * 3;
          L = [[-34, shY + 40], [-18, shY + 46 + k1]]; R = [[34, shY + 40], [18, shY + 46 + k2]];
        }
        // hair behind (long)
        const hs = o.hairStyle || 'short';
        if (hs === 'long') rr(ctx, -38, headY - 20, 76, 74, 26, hair);
        // torso
        const torso = () => roundRect(ctx, -sx - 3, shY - 4, (sx + 3) * 2, hipY - shY + 14, 20);
        twoTone(ctx, torso, shirt, shirtS, 0.68, -sx - 3, shY - 4, (sx + 3) * 2, hipY - shY + 14);
        if (!sit) { ctx.fillStyle = pants; roundRect(ctx, -sx + 1, hipY - 6, (sx - 1) * 2, 14, 6); ctx.fill(); }
        // neck + collar
        rr(ctx, -7, shY - 14, 14, 16, 5, skinS);
        ctx.beginPath(); ctx.moveTo(-10, shY - 3); ctx.lineTo(0, shY + 9); ctx.lineTo(10, shY - 3); ctx.closePath(); ctx.fillStyle = skinS; ctx.fill();
        // arms (sleeve = upper arm, skin = forearm)
        const arm = (side, el, hd) => {
          const sh = [side * sx, shY + 8];
          limb(ctx, [sh, el], 15, shirt);
          limb(ctx, [el, hd], 13, skin);
          circle(ctx, hd[0], hd[1], 8.5, skin);
        };
        arm(-1, L[0], L[1]);
        if (prop === 'phone') {
          ctx.save(); ctx.translate(R[1][0] - 4, R[1][1] - 6); ctx.rotate(-0.15);
          rr(ctx, -11, -20, 22, 38, 5, N.darkS); rr(ctx, -8, -16, 16, 28, 3, A.base);
          ctx.restore();
        }
        arm(1, R[0], R[1]);
        if (prop === 'finger') limb(ctx, [[R[1][0] + 4, R[1][1] - 1], [R[1][0] + 16, R[1][1] - 4]], 6, skin);
        // head
        ctx.save();
        ctx.translate(0, headY); ctx.rotate(tilt);
        circle(ctx, -32, 4, 7, skinS); circle(ctx, 32, 4, 7, skinS);
        ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 33, 0, TAU); ctx.fillStyle = skin; ctx.fill(); ctx.clip();
        ctx.fillStyle = skinS; ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.arc(14, 6, 30, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
        ctx.restore();
        // hair on top
        if (hs !== 'none') {
          ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 35, 0, TAU); ctx.clip();
          ctx.beginPath(); ctx.moveTo(-40, -2);
          ctx.quadraticCurveTo(-30, -16, -14, -12); ctx.quadraticCurveTo(4, -22, 20, -14); ctx.quadraticCurveTo(32, -10, 40, 0);
          ctx.lineTo(40, -40); ctx.lineTo(-40, -40); ctx.closePath(); ctx.fillStyle = hair; ctx.fill();
          ctx.restore();
          if (hs === 'bun') circle(ctx, 0, -38, 13, hair);
          if (hs === 'curly') for (let i = 0; i < 7; i++) circle(ctx, -30 + i * 10, -24 - Math.sin(i * 1.3) * 6 - (i > 0 && i < 6 ? 6 : 0), 10, hair);
          if (hs === 'long') { rr(ctx, -37, -8, 10, 40, 5, hair); rr(ctx, 27, -8, 10, 40, 5, hair); }
        } else { ctx.globalAlpha = 0.25; circle(ctx, -12, -18, 7, '#ffffff'); ctx.globalAlpha = 1; }
        // face
        const look = (o.look || 0) * 4, blink = blinkAt(t, seed);
        ctx.fillStyle = N.ink; ctx.strokeStyle = N.ink; ctx.lineCap = 'round';
        for (const ex of [-12, 12]) {
          if (blink) { ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ex - 4 + look, 4 + lookY); ctx.lineTo(ex + 4 + look, 4 + lookY); ctx.stroke(); }
          else { ctx.beginPath(); ctx.ellipse(ex + look, 3 + lookY, 4, 5, 0, 0, TAU); ctx.fill(); }
        }
        const mood = o.mood || (brows ? 'worried' : 'happy');
        ctx.lineWidth = 2.6;
        if (mood === 'angry') {
          ctx.lineWidth = 3.4; ctx.beginPath(); ctx.moveTo(-19 + look, -12); ctx.lineTo(-7 + look, -6); ctx.moveTo(7 + look, -6); ctx.lineTo(19 + look, -12); ctx.stroke(); ctx.lineWidth = 2.6;
        } else if (mood === 'shocked') {
          ctx.beginPath(); ctx.moveTo(-17 + look, -14); ctx.quadraticCurveTo(-12 + look, -19, -7 + look, -14); ctx.moveTo(7 + look, -14); ctx.quadraticCurveTo(12 + look, -19, 17 + look, -14); ctx.stroke();
        } else if (brows || mood === 'worried') {
          ctx.beginPath(); ctx.moveTo(-17 + look, -9); ctx.lineTo(-8 + look, -11 - 2 * brows); ctx.moveTo(8 + look, -11 - 2 * brows); ctx.lineTo(17 + look, -9); ctx.stroke();
        }
        circle(ctx, -20, 12, 6, 'rgba(255,110,110,0.22)'); circle(ctx, 20, 12, 6, 'rgba(255,110,110,0.22)');
        const talk = clamp(o.talk || 0);
        if (talk > 0.06) {
          const h = 3 + 9 * talk * (0.6 + 0.4 * Math.abs(Math.sin(t * 13 + seed)));
          ctx.beginPath(); ctx.ellipse(look, 17, 6.5, h / 2, 0, 0, TAU); ctx.fillStyle = '#5a1f2a'; ctx.fill();
        } else {
          ctx.lineWidth = 3; ctx.beginPath();
          if (mood === 'happy') ctx.arc(look, 12, 8, 0.2 * Math.PI, 0.8 * Math.PI);
          else if (mood === 'shocked') { ctx.stroke(); ctx.beginPath(); ctx.ellipse(look, 19, 5.5, 7, 0, 0, TAU); ctx.fillStyle = '#5a1f2a'; ctx.fill(); ctx.beginPath(); }
          else if (mood === 'worried' || mood === 'angry') ctx.arc(look, 23, 7, 1.2 * Math.PI, 1.8 * Math.PI);
          else { ctx.moveTo(-6 + look, 17); ctx.lineTo(6 + look, 17); }
          ctx.stroke();
        }
        ctx.restore();
      });
    }

    // Robot / AI character: ~225 tall. opts: state 'idle'|'thinking'|'working'|'happy', t, talk (0..1), flip, seed.
    function drawRobot(ctx, x, y, s, o = {}) {
      const t = o.t || 0, st = o.state || 'idle', seed = o.seed || 3;
      const B = N.light, BS = N.lightS, BL = N.lightL;
      const hover = Math.sin(t * 2.1 + seed) * 3;
      at(ctx, x, y, s, () => {
        if (o.flip) ctx.scale(-1, 1);
        shadow(ctx, 0, 0, 110);
        ctx.translate(0, hover * 0.4);
        // legs + feet
        limb(ctx, [[-18, -58], [-20, -18]], 14, BS); limb(ctx, [[18, -58], [20, -18]], 14, BS);
        rr(ctx, -40, -20, 38, 18, 9, N.dark); rr(ctx, 2, -20, 38, 18, 9, N.dark);
        // arms
        const shY = -128;
        let L = [[-62, shY + 34], [-66, shY + 66]], R = [[62, shY + 34], [66, shY + 66]];
        if (st === 'working') { const a = Math.sin(t * 14) * 4, b = Math.sin(t * 14 + 2) * 4; L = [[-60, shY + 38], [-34, shY + 52 + a]]; R = [[60, shY + 38], [34, shY + 52 + b]]; }
        else if (st === 'thinking') { R = [[60, shY + 30], [30, shY - 6]]; }
        else if (st === 'happy') { const k = Math.sin(t * 6) * 5; L = [[-64, shY - 4], [-72, shY - 40 + k]]; R = [[64, shY - 4], [72, shY - 40 - k]]; }
        else { const k = Math.sin(t * 2 + seed) * 3; L[1][1] += k; R[1][1] -= k; }
        const arm = (side, el, hd) => { limb(ctx, [[side * 44, shY + 12], el, hd], 13, BS); circle(ctx, hd[0], hd[1], 11, B); circle(ctx, hd[0] + 3, hd[1] + 3, 5, BS); };
        arm(-1, L[0], L[1]);
        // body
        const body = () => roundRect(ctx, -48, shY, 96, 76, 24);
        twoTone(ctx, body, B, BS, 0.7, -48, shY, 96, 76);
        rr(ctx, -28, shY + 16, 56, 30, 9, N.screen);
        // chest equaliser (talk / work)
        const lv = st === 'working' ? 0.7 : clamp(o.talk || 0);
        for (let i = 0; i < 5; i++) {
          const h = 4 + 18 * lv * (0.4 + 0.6 * Math.abs(Math.sin(t * 9 + i * 1.3)));
          rr(ctx, -20 + i * 9, shY + 31 - h / 2, 5, h, 2.5, A.base);
        }
        arm(1, R[0], R[1]);
        // neck + head
        rr(ctx, -10, shY - 14, 20, 16, 4, N.darkL);
        const hy = shY - 82;
        ctx.save();
        ctx.translate(0, hy); ctx.rotate(st === 'thinking' ? -0.06 : 0);
        // antenna
        ctx.strokeStyle = BS; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -22); ctx.stroke();
        const pulse = st === 'idle' ? 0.25 : 0.5 + 0.5 * Math.sin(t * (st === 'thinking' ? 5 : 9));
        addGlow(ctx, 0, -26, 26, A.base, 0.25 + 0.5 * pulse);
        circle(ctx, 0, -26, 8, mixHex(A.shade, A.light, pulse));
        circle(ctx, -54, 38, 9, BS); circle(ctx, 54, 38, 9, BS);
        const head = () => roundRect(ctx, -54, 0, 108, 72, 26);
        twoTone(ctx, head, B, BS, 0.74, -54, 0, 108, 72);
        ctx.globalAlpha = 0.6; rr(ctx, -40, 6, 44, 6, 3, BL); ctx.globalAlpha = 1;
        rr(ctx, -42, 14, 84, 48, 18, N.screen);
        // eyes
        const blink = blinkAt(t, seed);
        let ex = 0, ey = 0;
        if (st === 'thinking') { ex = 6; ey = -5; }
        ctx.fillStyle = A.base;
        for (const sx of [-17, 17]) {
          if (st === 'happy' || st === 'working') {
            ctx.strokeStyle = A.base; ctx.lineWidth = 5; ctx.lineCap = 'round';
            ctx.beginPath(); ctx.arc(sx, 42, 8, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke();
          } else {
            const h = blink ? 3 : 18;
            rr(ctx, sx - 6 + ex, 38 - h / 2 + ey, 12, h, 6, A.base);
          }
        }
        addGlow(ctx, 0, 38, 60, A.base, 0.18);
        if (st === 'talk' || (o.talk || 0) > 0.06) { const h = 2 + 8 * clamp(o.talk || 0); rr(ctx, -9, 52 - h / 2 + 2, 18, h, h / 2, A.light); }
        ctx.restore();
        // thought dots
        if (st === 'thinking') {
          for (let i = 0; i < 3; i++) {
            const k = clamp(Math.sin(t * 3 - i * 0.7) * 0.5 + 0.5);
            circle(ctx, 62 + i * 18, hy - 10 - i * 18, 5 + i * 3, rgba('#ffffff', 0.35 + 0.55 * k));
          }
        }
      });
    }

    // ------------------------------------------------------------ objects
    // Phone 130x240. opts: t, bubbles (count, default 4), every (s per bubble), typing (bool), screen 'chat'|'blank'
    function drawPhone(ctx, x, y, s, o = {}) {
      const t = o.t == null ? 99 : o.t, n = o.bubbles == null ? 4 : o.bubbles, every = o.every || 0.55;
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 120);
        rr(ctx, -65, -240, 130, 240, 24, N.dark);
        rr(ctx, -65, -240, 8, 240, 4, N.darkL);
        rr(ctx, -56, -228, 112, 216, 16, N.screen);
        rr(ctx, -18, -224, 36, 8, 4, N.darkS);
        if (o.screen === 'blank') return;
        ctx.save(); roundRect(ctx, -56, -228, 112, 216, 16); ctx.clip();
        let yy = -40;
        const items = [];
        for (let i = 0; i < n; i++) { const tt = t - i * every; if (tt > 0) items.push({ i, tt }); }
        if (o.typing && t > n * every) items.push({ i: n, tt: t - n * every, dots: true });
        for (let k = items.length - 1; k >= 0; k--) {
          const it = items[k], me = it.i % 2 === 1, w = it.dots ? 46 : 46 + 44 * hash2(it.i, 5), h = it.dots ? 22 : 20 + (hash2(it.i, 9) > 0.6 ? 14 : 0);
          const p = easeOutBack(it.tt / 0.35);
          const bx = me ? 46 - w : -46;
          ctx.save(); ctx.translate(me ? 46 : -46, yy); ctx.scale(p, p); ctx.translate(-(me ? 46 : -46), -yy);
          rr(ctx, bx, yy - h, w, h, 10, me ? A.base : N.darkL);
          if (it.dots) for (let d = 0; d < 3; d++) circle(ctx, bx + 12 + d * 11, yy - h / 2 - 2 * Math.sin(t * 9 - d), 3, '#ffffff');
          else { ctx.globalAlpha = 0.55; rr(ctx, bx + 8, yy - h + 7, w - 16, 5, 2.5, me ? A.deep : '#ffffff'); if (h > 25) rr(ctx, bx + 8, yy - h + 17, (w - 16) * 0.6, 5, 2.5, me ? A.deep : '#ffffff'); ctx.globalAlpha = 1; }
          ctx.restore();
          yy -= (h + 8) * clamp(it.tt / 0.25);
        }
        ctx.restore();
      });
    }

    // Laptop 260x150 (screen facing the viewer). opts: t, screen 'code'|'chart'|'chat'|'blank', typing (bool), glow
    function drawLaptop(ctx, x, y, s, o = {}) {
      const t = o.t || 0, scr = o.screen || 'code';
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 280);
        rr(ctx, -112, -150, 224, 138, 12, N.dark);
        rr(ctx, -102, -141, 204, 120, 6, N.screen);
        ctx.save(); roundRect(ctx, -102, -141, 204, 120, 6); ctx.clip();
        if (o.glow !== false) addGlow(ctx, 0, -80, 140, A.base, 0.12);
        if (scr === 'code') {
          const rows = 8, shown = o.typing === false ? rows : Math.min(rows, t * 3.2);
          for (let r = 0; r < rows; r++) {
            const vis = clamp(shown - r); if (vis <= 0) break;
            const ind = (hash2(r, 2) * 3 | 0) * 12, w = (40 + 100 * hash2(r, 3)) * vis;
            rr(ctx, -90 + ind, -130 + r * 13, w, 6, 3, r % 3 === 1 ? A.base : 'rgba(255,255,255,0.55)');
          }
          if (o.typing !== false && Math.floor(t * 2.5) % 2 === 0) { const r = Math.min(rows - 1, Math.floor(shown)); ctx.fillStyle = A.base; ctx.fillRect(-86 + (hash2(r, 2) * 3 | 0) * 12 + (40 + 100 * hash2(r, 3)) * clamp(shown - r), -131 + r * 13, 3, 8); }
        } else if (scr === 'chart') {
          const p = o.typing === false ? 1 : clamp(t / 1.2);
          ctx.strokeStyle = A.base; ctx.lineWidth = 4; ctx.lineJoin = 'round';
          motion.pathDraw(ctx, [[-84, -40], [-50, -58], [-20, -50], [14, -86], [44, -78], [84, -120]], p);
        } else if (scr === 'chat') {
          for (let i = 0; i < 4; i++) { const k = easeOutBack((t - i * 0.4) / 0.3); if (k <= 0) continue; const me = i % 2; ctx.globalAlpha = clamp(k); rr(ctx, me ? 10 : -90, -130 + i * 26, 80, 18, 9, me ? A.base : N.darkL); }
          ctx.globalAlpha = 1;
        }
        ctx.restore();
        // base
        ctx.beginPath(); ctx.moveTo(-130, -14); ctx.lineTo(130, -14); ctx.lineTo(122, 0); ctx.lineTo(-122, 0); ctx.closePath(); ctx.fillStyle = N.light; ctx.fill();
        rr(ctx, -130, -16, 260, 6, 3, N.lightL);
        rr(ctx, -24, -14, 48, 4, 2, N.lightS);
      });
    }

    // Server rack 120x230. opts: t, activity (0..1)
    function drawServerRack(ctx, x, y, s, o = {}) {
      const t = o.t || 0, act = o.activity == null ? 0.7 : o.activity;
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 150);
        addGlow(ctx, 0, -115, 150, A.base, 0.08 + 0.18 * act);
        rr(ctx, -60, -230, 120, 230, 14, N.dark);
        rr(ctx, 40, -230, 20, 230, 10, N.darkS);
        const units = 6, uh = 32;
        for (let u = 0; u < units; u++) {
          const yy = -218 + u * (uh + 4);
          rr(ctx, -50, yy, 92, uh, 6, N.darkL);
          ctx.fillStyle = 'rgba(255,255,255,0.12)';
          for (let v = 0; v < 4; v++) ctx.fillRect(-42 + v * 9, yy + 9, 4, 14);
          for (let l = 0; l < 3; l++) {
            const on = hash2(u * 3 + l, Math.floor(t * 6 + u * 0.4 + l * 0.7)) < 0.2 + 0.7 * act;
            const lx = 30 - l * 11, ly = yy + uh / 2;
            if (on) addGlow(ctx, lx, ly, 12, A.base, 0.6);
            circle(ctx, lx, ly, 3.4, on ? A.base : 'rgba(255,255,255,0.2)');
          }
        }
      });
    }

    // Data center building 330x190. opts: t, activity, label (text on a sign)
    function drawDataCenter(ctx, x, y, s, o = {}) {
      const t = o.t || 0, act = o.activity == null ? 0.7 : o.activity;
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 380);
        addGlow(ctx, 0, -90, 230, A.base, 0.06 + 0.12 * act);
        // roof units + fans
        for (let i = 0; i < 3; i++) {
          const fx = -100 + i * 100;
          rr(ctx, fx - 34, -186, 68, 30, 8, N.lightS);
          circle(ctx, fx, -171, 12, N.darkL);
          ctx.save(); ctx.translate(fx, -171); ctx.rotate(t * 7 + i);
          for (let b = 0; b < 3; b++) { ctx.rotate(TAU / 3); rr(ctx, -2.5, -11, 5, 11, 2.5, N.lightL); }
          ctx.restore();
        }
        const bld = () => roundRect(ctx, -165, -160, 330, 160, 14);
        twoTone(ctx, bld, N.light, N.lightS, 0.82, -165, -160, 330, 160);
        rr(ctx, -165, -160, 330, 14, 7, N.lightL);
        // server window strips
        for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
          const wx = -146 + c * 66, wy = -134 + r * 38;
          rr(ctx, wx, wy, 54, 26, 5, N.screen);
          for (let l = 0; l < 4; l++) {
            const on = hash2(r * 17 + c * 4 + l, Math.floor(t * 5 + c * 0.3 + r * 0.5)) < 0.25 + 0.65 * act;
            circle(ctx, wx + 9 + l * 12, wy + 13, 3, on ? A.base : 'rgba(255,255,255,0.18)');
          }
        }
        // door
        rr(ctx, 120, -46, 32, 46, 4, N.darkL);
        if (o.label) label(ctx, 0, -196, 1, { text: o.label, size: 22 });
      });
    }

    // Document / contract 140x180. opts: t, lines (count), title (bool), sign (0..1 signature progress), seal (bool)
    function drawDocument(ctx, x, y, s, o = {}) {
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 160);
        ctx.beginPath(); ctx.moveTo(-70, -180); ctx.lineTo(40, -180); ctx.lineTo(70, -150); ctx.lineTo(70, 0); ctx.lineTo(-70, 0); ctx.closePath();
        ctx.fillStyle = N.paper; ctx.fill();
        ctx.beginPath(); ctx.moveTo(40, -180); ctx.lineTo(40, -150); ctx.lineTo(70, -150); ctx.closePath(); ctx.fillStyle = N.paperS; ctx.fill();
        if (o.title !== false) rr(ctx, -52, -160, 70, 10, 5, A.shade);
        const lines = o.lines == null ? 6 : o.lines;
        for (let i = 0; i < lines; i++) rr(ctx, -52, -136 + i * 15, (i === lines - 1 ? 60 : 104 - 14 * hash2(i, 4)), 6, 3, N.paperS);
        // signature line + scribble
        ctx.fillStyle = N.lightS; ctx.fillRect(-52, -26, 70, 2);
        if (o.sign > 0) {
          ctx.strokeStyle = N.blueL; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          motion.pathDraw(ctx, motion.bezier(-50, -32, -38, -60, -30, -10, -18, -38, 14).concat(motion.bezier(-18, -38, -6, -60, 4, -16, 18, -36, 14)), o.sign);
        }
        if (o.seal) { circle(ctx, 42, -30, 17, A.base); circle(ctx, 42, -30, 11, A.light); }
      });
    }

    // Coin 64x64. opts: spin (radians, e.g. t * 6), symbol ('$')
    function drawCoin(ctx, x, y, s, o = {}) {
      const sx = Math.max(0.12, Math.abs(Math.cos(o.spin || 0)));
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 56, 0.25);
        ctx.save(); ctx.translate(0, -32); ctx.scale(sx, 1);
        circle(ctx, 3, 2, 30, A.deep);
        circle(ctx, 0, 0, 30, A.shade); circle(ctx, -2, -2, 26, A.base); circle(ctx, -2, -2, 19, A.light);
        circle(ctx, -2, -2, 17, A.base);
        ctx.font = font.display(24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = A.deep;
        ctx.fillText(o.symbol || '$', -2, -1);
        ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.ellipse(-12, -14, 6, 3, -0.7, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill();
        ctx.restore();
      });
    }
    // Stack of bills 130x80. opts: count (1-8)
    function drawBills(ctx, x, y, s, o = {}) {
      const n = clamp(o.count == null ? 4 : o.count, 1, 8) | 0;
      const base = mixHex(A.base, '#3d8f5c', 0.35), shade = mixHex(base, '#000000', 0.3), light = mixHex(base, '#ffffff', 0.35);
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 150);
        for (let i = 0; i < n; i++) {
          const yy = -14 - i * 9, dx = (hash2(i, 1) - 0.5) * 8;
          rr(ctx, -62 + dx, yy, 124, 14, 3, i === n - 1 ? base : shade);
          if (i < n - 1) { ctx.fillStyle = light; ctx.globalAlpha = 0.5; ctx.fillRect(-58 + dx, yy + 6, 116, 1.5); ctx.globalAlpha = 1; }
        }
        const top = -14 - (n - 1) * 9 - 46, dx = (hash2(n - 1, 1) - 0.5) * 8;
        rr(ctx, -62 + dx, top, 124, 56, 6, base);
        ctx.strokeStyle = light; ctx.lineWidth = 2.5; roundRect(ctx, -55 + dx, top + 6, 110, 44, 4); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(dx, top + 28, 17, 15, 0, 0, TAU); ctx.fillStyle = light; ctx.fill();
        ctx.font = font.display(20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = shade; ctx.fillText('$', dx, top + 29);
      });
    }
    // Price tag 130x150 (string on top). opts: text, t (swing), size
    function drawPriceTag(ctx, x, y, s, o = {}) {
      const sw = Math.sin((o.t || 0) * 2.4) * 0.07;
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 110, 0.22);
        ctx.translate(0, -150); ctx.rotate(sw);
        ctx.strokeStyle = N.lightS; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 36); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, 26); ctx.lineTo(56, 52); ctx.lineTo(56, 136); ctx.lineTo(-56, 136); ctx.lineTo(-56, 52); ctx.closePath();
        ctx.fillStyle = A.base; ctx.fill();
        ctx.save(); ctx.clip(); ctx.fillStyle = A.shade; ctx.fillRect(30, 20, 40, 130); ctx.restore();
        circle(ctx, 0, 46, 7, N.darkS);
        const txt = String(o.text || '$99');
        const fs = Math.min(o.size || 38, (100 / Math.max(1, txt.length)) * 1.6);
        ctx.font = font.display(fs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = A.deep;
        ctx.fillText(txt, 0, 98);
      });
    }
    // Chart card 270x175. opts: trend 'up'|'down', progress (0..1), points ([[0..1, 0..1]...]), t
    function drawChart(ctx, x, y, s, o = {}) {
      const up = o.trend !== 'down', p = o.progress == null ? 1 : o.progress;
      const col = up ? A.base : N.danger;
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 280);
        rr(ctx, -135, -175, 270, 175, 18, N.dark);
        rr(ctx, -135, -175, 270, 10, 5, N.darkL);
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        for (let i = 0; i < 4; i++) ctx.fillRect(-112, -140 + i * 32, 224, 2);
        const raw = o.points || (up ? [[0, 0.15], [0.2, 0.3], [0.38, 0.25], [0.55, 0.5], [0.72, 0.45], [1, 0.9]] : [[0, 0.85], [0.2, 0.7], [0.38, 0.75], [0.56, 0.45], [0.74, 0.5], [1, 0.12]]);
        const pts = raw.map(([u, v]) => [-108 + u * 210, -24 - v * 120]);
        // area under the drawn part
        const end = motion.pathPoint(pts, p);
        ctx.save();
        ctx.beginPath(); ctx.moveTo(pts[0][0], -24);
        for (const q of pts) { if (q[0] > end[0]) break; ctx.lineTo(q[0], q[1]); }
        ctx.lineTo(end[0], end[1]); ctx.lineTo(end[0], -24); ctx.closePath();
        const g = ctx.createLinearGradient(0, -150, 0, -24); g.addColorStop(0, rgba(col, 0.35)); g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g; ctx.fill(); ctx.restore();
        ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        motion.pathDraw(ctx, pts, p);
        if (p > 0.02) {
          // arrow head at the tip
          const prev = motion.pathPoint(pts, Math.max(0, p - 0.04)), a = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
          ctx.save(); ctx.translate(end[0], end[1]); ctx.rotate(a);
          ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-8, -10); ctx.lineTo(-8, 10); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
          ctx.restore();
          addGlow(ctx, end[0], end[1], 30, col, 0.5);
        }
      });
    }
    // Padlock 90x125. opts: open (0..1)
    function drawLock(ctx, x, y, s, o = {}) {
      const op = clamp(o.open || 0);
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 100);
        ctx.save(); ctx.translate(26, -70 - 18 * op); ctx.rotate(-0.5 * op); ctx.translate(-26, 0);
        ctx.strokeStyle = N.lightS; ctx.lineWidth = 13; ctx.lineCap = 'butt';
        ctx.beginPath(); ctx.moveTo(-26, 4); ctx.lineTo(-26, -20); ctx.arc(0, -20, 26, Math.PI, 0); ctx.lineTo(26, 4); ctx.stroke();
        ctx.restore();
        const body = () => roundRect(ctx, -45, -78, 90, 78, 16);
        twoTone(ctx, body, A.base, A.shade, 0.72, -45, -78, 90, 78);
        circle(ctx, 0, -46, 10, A.deep); rr(ctx, -4, -46, 8, 22, 4, A.deep);
      });
    }
    // Shield 120x140. opts: check (0..1 check-mark progress)
    function drawShield(ctx, x, y, s, o = {}) {
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 120);
        const path = (k) => { ctx.beginPath(); ctx.moveTo(0, -140 * k); ctx.quadraticCurveTo(30 * k, -122 * k, 60 * k, -122 * k); ctx.quadraticCurveTo(62 * k, -40 * k, 0, 0); ctx.quadraticCurveTo(-62 * k, -40 * k, -60 * k, -122 * k); ctx.quadraticCurveTo(-30 * k, -122 * k, 0, -140 * k); ctx.closePath(); };
        twoTone(ctx, () => path(1), A.base, A.shade, 0.5, -60, -140, 120, 140);
        ctx.save(); ctx.translate(0, -12); path(0.78); ctx.fillStyle = A.light; ctx.globalAlpha = 0.35; ctx.fill(); ctx.restore();
        if (o.check > 0) { ctx.strokeStyle = A.deep; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; motion.pathDraw(ctx, [[-24, -70], [-6, -50], [28, -92]], o.check); }
      });
    }
    // Globe 170x170. opts: t (rotation), arcs (count of connection arcs, default 4), progress (arc draw-in)
    function drawGlobe(ctx, x, y, s, o = {}) {
      const t = o.t || 0, R = 80, cy = -85, nA = o.arcs == null ? 4 : o.arcs;
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 160);
        addGlow(ctx, 0, cy, 150, A.base, 0.1);
        circle(ctx, 0, cy, R, N.blue);
        ctx.save(); ctx.beginPath(); ctx.arc(0, cy, R, 0, TAU); ctx.clip();
        ctx.fillStyle = N.blueL; ctx.beginPath(); ctx.arc(26, cy + 20, R, 0, TAU); ctx.globalAlpha = 0.0; ctx.fill(); ctx.globalAlpha = 1;
        // land blobs drifting with rotation
        for (let i = 0; i < 6; i++) {
          const lon = hash2(i, 11) * TAU + t * 0.5, lat = (hash2(i, 12) - 0.5) * 1.8;
          const z = Math.cos(lon); if (z < -0.1) continue;
          const px = Math.sin(lon) * Math.cos(lat) * R, py = cy + Math.sin(lat) * R * 0.95;
          ctx.save(); ctx.translate(px, py); ctx.scale(Math.max(0.2, z), 1);
          ctx.beginPath(); ctx.ellipse(0, 0, 22 + 14 * hash2(i, 13), 14 + 8 * hash2(i, 14), hash2(i, 15), 0, TAU);
          ctx.fillStyle = mixHex(N.blueL, '#5d6ba3', 0.5); ctx.fill(); ctx.restore();
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.lineWidth = 2;
        for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.ellipse(0, cy + i * 28, Math.sqrt(Math.max(0, R * R - (i * 28) ** 2)), 6, 0, 0, TAU); ctx.stroke(); }
        for (let i = 0; i < 4; i++) { const a = fract(i / 4 + t * 0.08) * Math.PI; ctx.beginPath(); ctx.ellipse(0, cy, Math.abs(Math.cos(a)) * R, R, 0, 0, TAU); ctx.stroke(); }
        // shading
        const g = ctx.createRadialGradient(-30, cy - 30, 10, 0, cy, R * 1.1); g.addColorStop(0, 'rgba(255,255,255,0.12)'); g.addColorStop(1, 'rgba(0,0,0,0.35)');
        ctx.fillStyle = g; ctx.fillRect(-R, cy - R, 2 * R, 2 * R);
        ctx.restore();
        // connection arcs with travelling dots
        const pr = o.progress == null ? 1 : o.progress;
        for (let i = 0; i < nA; i++) {
          const p0 = [-R * (0.25 + 0.45 * hash2(i, 21)), cy + (hash2(i, 24) - 0.5) * R * 1.1];
          const p1 = [R * (0.2 + 0.5 * hash2(i, 22)), cy + (hash2(i, 25) - 0.5) * R * 1.1];
          const h = 40 + 40 * hash2(i, 23);
          const pts = motion.bezier(p0[0], p0[1], p0[0], p0[1] - h, p1[0], p1[1] - h, p1[0], p1[1], 30);
          const k = clamp(pr * nA - i);
          ctx.strokeStyle = rgba(A.base, 0.75); ctx.lineWidth = 3; ctx.lineCap = 'round';
          motion.pathDraw(ctx, pts, k);
          if (k >= 1) { const q = motion.pathPoint(pts, fract(t * 0.6 + i * 0.27)); addGlow(ctx, q[0], q[1], 16, A.base, 0.9); circle(ctx, q[0], q[1], 3.5, '#ffffff'); }
          if (k > 0) { circle(ctx, p0[0], p0[1], 5, A.base); if (k >= 1) circle(ctx, p1[0], p1[1], 5, A.base); }
        }
      });
    }
    // Gavel + sound block 190x120. opts: hit (0..1: raised -> struck), t
    function drawGavel(ctx, x, y, s, o = {}) {
      const h = clamp(o.hit == null ? 1 : o.hit);
      const ang = -0.95 * (1 - Math.pow(h, 2.2));
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 200);
        // block
        rr(ctx, -54, -22, 108, 22, 8, N.woodS); rr(ctx, -46, -34, 92, 16, 6, N.wood);
        // gavel pivots at the hand end (right)
        ctx.save(); ctx.translate(90, -60); ctx.rotate(ang);
        rr(ctx, -100, -6, 100, 12, 6, N.wood);
        ctx.translate(-100, 0);
        rr(ctx, -20, -40, 40, 70, 12, N.wood); rr(ctx, 6, -40, 14, 70, 7, N.woodS);
        rr(ctx, -24, -34, 48, 10, 5, A.base); rr(ctx, -24, 14, 48, 10, 5, A.base);
        ctx.restore();
        if (h > 0.97) { ctx.strokeStyle = A.base; ctx.lineWidth = 5; ctx.lineCap = 'round'; for (const [a, b, c, d] of [[-70, -44, -86, -56], [-74, -24, -94, -24], [-30, -60, -36, -78]]) { ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(c, d); ctx.stroke(); } }
      });
    }
    // Rule book 170x210. opts: open (0..1, cover swings left), title ('RULES')
    function drawRulebook(ctx, x, y, s, o = {}) {
      const op = clamp(o.open || 0);
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, -40 * op, 0, 200 + 160 * op);
        const cover = '#3b4580', coverS = '#2b3463';
        // back cover + pages
        rr(ctx, -80, -210, 165, 210, 10, coverS);
        rr(ctx, -74, -204, 152, 198, 6, N.paperS);
        rr(ctx, -74, -206, 148, 198, 6, N.paper);
        for (let i = 0; i < 8; i++) rr(ctx, -58, -176 + i * 18, i % 4 === 0 ? 70 : 112 - 20 * hash2(i, 31), 7, 3.5, i % 4 === 0 ? A.shade : N.paperS);
        // front cover rotating around the spine (left edge)
        const c = Math.cos(op * Math.PI);
        ctx.save(); ctx.translate(-80, 0); ctx.scale(c, 1);
        if (c > 0) {
          rr(ctx, 0, -212, 160, 212, 10, cover);
          rr(ctx, 0, -212, 16, 212, 6, coverS);
          ctx.fillStyle = A.base; ctx.fillRect(34, -170, 100, 6); ctx.fillRect(34, -60, 100, 6);
          ctx.save(); ctx.translate(84, -115); ctx.scale(1 / Math.max(0.2, c), 1); ctx.scale(Math.max(0.2, c), 1);
          ctx.font = font.display(28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
          ctx.fillText(String(o.title || 'RULES').slice(0, 9), 0, 0);
          ctx.restore();
        } else {
          rr(ctx, 0, -212, 160, 212, 10, mixHex(cover, '#ffffff', 0.1));
          rr(ctx, 6, -206, 148, 200, 6, N.paperS);
        }
        ctx.restore();
      });
    }
    // Briefcase 170x135. opts: open (0..1 lid gap)
    function drawBriefcase(ctx, x, y, s, o = {}) {
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 180);
        ctx.strokeStyle = N.darkS; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-26, -112); ctx.lineTo(-26, -128); ctx.arcTo(-26, -136, -18, -136, 8); ctx.lineTo(18, -136); ctx.arcTo(26, -136, 26, -128, 8); ctx.lineTo(26, -112); ctx.stroke();
        const body = () => roundRect(ctx, -85, -114, 170, 114, 16);
        twoTone(ctx, body, '#6b4a3a', '#563a2d', 0.75, -85, -114, 170, 114);
        rr(ctx, -85, -74, 170, 8, 2, '#563a2d');
        rr(ctx, -14, -82, 28, 22, 5, A.base); rr(ctx, -6, -76, 12, 6, 3, A.deep);
      });
    }
    // Clock 130x130. opts: t, speed (hours per second, default 2), hour (start)
    function drawClock(ctx, x, y, s, o = {}) {
      const t = o.t || 0, hrs = (o.hour == null ? 10 : o.hour) + t * (o.speed == null ? 2 : o.speed);
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 120);
        circle(ctx, 0, -65, 64, N.dark); circle(ctx, 0, -65, 54, N.paper);
        for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; rr(ctx, Math.sin(a) * 44 - 2, -65 - Math.cos(a) * 44 - (i % 3 ? 3 : 6), 4, i % 3 ? 6 : 12, 2, N.lightS); }
        const hand = (a, len, w, c) => { ctx.save(); ctx.translate(0, -65); ctx.rotate(a); rr(ctx, -w / 2, -len, w, len + 6, w / 2, c); ctx.restore(); };
        hand((hrs / 12) * TAU, 28, 8, N.ink); hand(fract(hrs) * TAU, 42, 5, A.shade);
        circle(ctx, 0, -65, 6, A.base);
      });
    }
    // Light bulb 100x160. opts: on (0..1), t
    function drawLightbulb(ctx, x, y, s, o = {}) {
      const on = clamp(o.on == null ? 1 : o.on);
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 90);
        if (on > 0) {
          addGlow(ctx, 0, -104, 150, A.base, 0.5 * on);
          ctx.strokeStyle = rgba(A.base, on); ctx.lineWidth = 6; ctx.lineCap = 'round';
          for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.5, r0 = 62 + 4 * Math.sin((o.t || 0) * 5 + i), r1 = r0 + 16 * on; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, -104 + Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, -104 + Math.sin(a) * r1); ctx.stroke(); }
        }
        rr(ctx, -20, -40, 40, 34, 8, N.lightS);
        for (let i = 0; i < 3; i++) rr(ctx, -22, -38 + i * 10, 44, 5, 2.5, N.light);
        rr(ctx, -10, -8, 20, 8, 4, N.darkL);
        ctx.beginPath(); ctx.arc(0, -104, 46, 0.78 * Math.PI, 2.22 * Math.PI); ctx.lineTo(18, -44); ctx.lineTo(-18, -44); ctx.closePath();
        ctx.fillStyle = mixHex('#e6e9f3', A.base, on); ctx.fill();
        ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.ellipse(-18, -122, 9, 16, 0.5, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = mixHex(N.lightS, A.deep, on); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-10, -50); ctx.lineTo(-10, -88); ctx.lineTo(0, -98); ctx.lineTo(10, -88); ctx.lineTo(10, -50); ctx.stroke();
      });
    }
    // Warning sign 140x125. opts: pulse (0..1)
    function drawWarning(ctx, x, y, s, o = {}) {
      const k = 1 + 0.06 * clamp(o.pulse || 0);
      at(ctx, x, y, s * k, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 130);
        const tri = (r, dy) => { ctx.beginPath(); ctx.moveTo(0, -122 + dy); ctx.lineTo(70 - r, -4 - dy * 0.3); ctx.lineTo(-70 + r, -4 - dy * 0.3); ctx.closePath(); };
        ctx.lineJoin = 'round'; ctx.lineWidth = 18; ctx.strokeStyle = N.warn; ctx.fillStyle = N.warn; tri(0, 0); ctx.stroke(); ctx.fill();
        ctx.save(); tri(0, 0); ctx.clip(); ctx.fillStyle = mixHex(N.warn, '#000000', 0.18); ctx.fillRect(20, -140, 80, 160); ctx.restore();
        rr(ctx, -7, -88, 14, 48, 7, N.ink); circle(ctx, 0, -24, 8, N.ink);
      });
    }
    // Speech bubble anchored at its tail tip. opts: text, size (28), maxW (360), tail 'left'|'right'|'center',
    // dark (bool), pop (0..1 scale)
    function drawSpeechBubble(ctx, x, y, s, o = {}) {
      const size = o.size || 28, maxW = o.maxW || 360, dark = !!o.dark;
      ctx.save(); ctx.font = font.bold(size);
      const words = String(o.text || '').split(/\s+/).filter(Boolean), lines = []; let cur = '';
      for (const w of words) { const n = cur ? cur + ' ' + w : w; if (cur && ctx.measureText(n).width > maxW) { lines.push(cur); cur = w; } else cur = n; }
      if (cur) lines.push(cur);
      const tw = Math.max(40, ...lines.map((l) => ctx.measureText(l).width)), bw = tw + 44, bh = lines.length * size * 1.2 + 30;
      ctx.restore();
      const side = o.tail || 'left', p = o.pop == null ? 1 : o.pop;
      const tx = side === 'left' ? -bw / 2 + 34 : side === 'right' ? bw / 2 - 34 : 0;
      at(ctx, x, y, s * p, () => {
        const fill = dark ? N.dark : N.paper;
        ctx.translate(-tx, 0);
        ctx.beginPath(); ctx.moveTo(tx - 14, -22); ctx.lineTo(tx + (side === 'right' ? 10 : -10), 0); ctx.lineTo(tx + 14, -22); ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
        rr(ctx, -bw / 2, -22 - bh, bw, bh, 22, fill);
        ctx.font = font.bold(size); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = dark ? '#ffffff' : N.ink;
        lines.forEach((l, i) => ctx.fillText(l, 0, -22 - bh + 15 + size * 0.92 + i * size * 1.2));
      });
    }
    // Rubber stamp mark 190x190 (anchor = bottom of its circle). opts: kind 'check'|'cross', text, land (0..1)
    function drawStamp(ctx, x, y, s, o = {}) {
      const land = clamp(o.land == null ? 1 : o.land);
      if (land <= 0) return;
      const col = o.kind === 'cross' ? N.danger : A.base;
      const sc = 1 + 1.3 * Math.pow(1 - easeOutCubic(land / 0.6), 2);
      at(ctx, x, y - 95, s, () => {
        ctx.save(); ctx.scale(sc, sc); ctx.rotate(-0.2);
        ctx.globalAlpha = clamp(land / 0.3);
        ctx.strokeStyle = col; ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(0, 0, 88, 0, TAU); ctx.stroke();
        ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 74, 0, TAU); ctx.stroke();
        const txt = String(o.text || (o.kind === 'cross' ? 'REJECTED' : 'APPROVED')).toUpperCase();
        let fs = 34; ctx.font = font.display(fs);
        while (fs > 14 && ctx.measureText(txt).width > 170) { fs -= 2; ctx.font = font.display(fs); }
        const bw = Math.min(196, ctx.measureText(txt).width + 34);
        rr(ctx, -bw / 2, -fs * 0.8, bw, fs * 1.6, 8, col);
        ctx.fillStyle = mixHex(col, '#000000', 0.7); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 2);
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 9; ctx.strokeStyle = col;
        if (o.kind === 'cross') { ctx.beginPath(); ctx.moveTo(-18, -58); ctx.lineTo(18, -34); ctx.moveTo(18, -58); ctx.lineTo(-18, -34); ctx.stroke(); }
        else { ctx.beginPath(); ctx.moveTo(-18, -46); ctx.lineTo(-5, -34); ctx.lineTo(20, -60); ctx.stroke(); }
        ctx.restore();
        // impact burst right after landing
        const b = (land - 0.6) / 0.4;
        if (b > 0 && b < 1) {
          ctx.strokeStyle = rgba(col, 1 - b); ctx.lineWidth = 4; ctx.lineCap = 'round';
          for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU, r0 = 100 + 30 * b, r1 = r0 + 18; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke(); }
        }
      });
    }
    // Pill label (anchor bottom-centre). opts: text, size (24), accent (bool: accent fill), dot (bool)
    function label(ctx, x, y, s, o = {}) {
      const size = o.size || 24, txt = String(o.text || '');
      ctx.save(); ctx.font = font.ui(size); ctx.letterSpacing = '1px';
      const w = ctx.measureText(txt).width + size * 1.4 + (o.dot ? size * 0.8 : 0), h = size * 1.75;
      at(ctx, x, y, s, () => {
        rr(ctx, -w / 2, -h, w, h, h / 2, o.accent ? A.base : 'rgba(10,12,22,0.86)');
        if (!o.accent) { ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; roundRect(ctx, -w / 2, -h, w, h, h / 2); ctx.stroke(); }
        let tx = -w / 2 + size * 0.7;
        if (o.dot) { circle(ctx, tx + size * 0.2, -h / 2, size * 0.2, A.base); tx += size * 0.8; }
        ctx.font = font.ui(size); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = o.accent ? A.deep : '#ffffff';
        ctx.fillText(txt, tx, -h / 2 + 1);
      });
      ctx.restore();
    }
    // Office tower 220x420 (generic company / bank building). opts: t, color, floors (8), lit (0..1), label
    function drawBuilding(ctx, x, y, s, o = {}) {
      const base = o.color || '#5b6aa8', shade = mixHex(base, '#000000', 0.25), light = mixHex(base, '#ffffff', 0.18);
      const fl = o.floors || 8, h = 60 + fl * 44, lit = o.lit == null ? 0.5 : o.lit, t = o.t || 0;
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 300);
        const body = () => roundRect(ctx, -110, -h, 220, h, 12);
        twoTone(ctx, body, base, shade, 0.7, -110, -h, 220, h);
        rr(ctx, -120, -h - 14, 240, 22, 8, light);
        rr(ctx, -40, -h - 44, 80, 32, 6, shade); rr(ctx, -4, -h - 80, 8, 40, 4, N.lightS);
        for (let r = 0; r < fl; r++) for (let c = 0; c < 4; c++) {
          const on = hash2(r * 4 + c, Math.floor(t * 0.4 + r)) < lit;
          rr(ctx, -88 + c * 46, -h + 26 + r * 44, 32, 28, 4, on ? rgba('#ffe7a8', 0.85) : mixHex(N.screen, base, 0.25));
        }
        rr(ctx, -30, -58, 60, 58, 6, N.darkS); rr(ctx, -26, -54, 25, 54, 3, mixHex(N.screen, A.base, 0.15)); rr(ctx, 1, -54, 25, 54, 3, mixHex(N.screen, A.base, 0.15));
        rr(ctx, -50, -66, 100, 10, 5, light);
        if (o.label) label(ctx, 0, -h - 96, 1, { text: o.label, size: 26, dot: true });
      });
    }
    // Lectern / podium 220x230 with a slanted top (props sit at y - 230). opts: color
    function drawLectern(ctx, x, y, s, o = {}) {
      const c = o.color || N.wood, cs = mixHex(c, '#000000', 0.22);
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 260);
        rr(ctx, -90, -14, 180, 14, 6, cs);
        ctx.beginPath(); ctx.moveTo(-70, -14); ctx.lineTo(70, -14); ctx.lineTo(84, -200); ctx.lineTo(-84, -200); ctx.closePath(); ctx.fillStyle = c; ctx.fill();
        ctx.save(); ctx.clip(); ctx.fillStyle = cs; ctx.fillRect(30, -210, 80, 210); ctx.restore();
        rr(ctx, -40, -150, 80, 80, 10, cs);
        ctx.beginPath(); ctx.moveTo(-110, -200); ctx.lineTo(110, -200); ctx.lineTo(100, -232); ctx.lineTo(-100, -232); ctx.closePath(); ctx.fillStyle = mixHex(c, '#ffffff', 0.12); ctx.fill();
      });
    }
    // Desk 300x110 (a table top on legs, for characters to sit/stand at). opts: none
    function drawDesk(ctx, x, y, s, o = {}) {
      at(ctx, x, y, s, () => {
        if (o.shadow !== false) shadow(ctx, 0, 0, 320);
        rr(ctx, -130, -96, 14, 96, 5, N.darkS); rr(ctx, 116, -96, 14, 96, 5, N.darkS);
        rr(ctx, -150, -110, 300, 18, 8, N.darkL); rr(ctx, -150, -96, 300, 6, 3, N.dark);
      });
    }

    // ------------------------------------------------------------ world: full-frame environments (1080x1920)
    // Each paints the whole canvas and returns anchor points for placing characters/props. Keep characters'
    // feet around y 1000-1040 (above the captions); the floor continues under the caption scrim.
    const SKY = {
      day: ['#4f7fc4', '#9cc0ea'], dusk: ['#2e2f63', '#d9826a'], night: ['#0a0f2b', '#1d2654'],
    };
    function sky(ctx, x, y, w, h, time, t) {
      const [a, b] = SKY[time] || SKY.night;
      const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, a); g.addColorStop(1, b);
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      if (time === 'night') {
        for (let i = 0; i < 40; i++) {
          const sx = x + hash2(i, 41) * w, sy = y + hash2(i, 42) * h * 0.7, tw = 0.5 + 0.5 * Math.sin(t * 2 + i);
          ctx.globalAlpha = 0.35 + 0.5 * tw; circle(ctx, sx, sy, 1.6 + hash2(i, 43) * 1.4, '#ffffff');
        }
        ctx.globalAlpha = 1;
      } else {
        // drifting clouds
        for (let i = 0; i < 3; i++) {
          const cx = x + ((hash2(i, 44) * w + t * (8 + 6 * i)) % (w + 240)) - 120, cy = y + 40 + hash2(i, 45) * h * 0.4;
          ctx.globalAlpha = time === 'day' ? 0.75 : 0.35;
          for (const [dx, dy, r] of [[0, 0, 26], [28, -10, 32], [58, 0, 24], [30, 8, 26]]) circle(ctx, cx + dx, cy + dy, r, '#ffffff');
        }
        ctx.globalAlpha = 1;
      }
    }
    function moonOrSun(ctx, x, y, time) {
      if (time === 'night') { addGlow(ctx, x, y, 120, '#dfe6ff', 0.35); circle(ctx, x, y, 34, '#f1f3ff'); circle(ctx, x + 12, y - 8, 30, SKY.night[1]); }
      else { addGlow(ctx, x, y, 160, time === 'dusk' ? '#ff9d6b' : '#fff3c4', 0.5); circle(ctx, x, y, 40, time === 'dusk' ? '#ffb27a' : '#fff6d8'); }
    }
    function windowFrame(ctx, x, y, w, h, time, t, curtains = true) {
      ctx.save(); roundRect(ctx, x, y, w, h, 10); ctx.clip();
      sky(ctx, x, y, w, h, time, t);
      moonOrSun(ctx, x + w * 0.72, y + h * 0.28, time);
      // distant skyline inside the window
      for (let i = 0; i < 9; i++) {
        const bw = w / 7, bh = h * (0.18 + 0.3 * hash2(i, 51)), bx = x + i * bw * 0.85 - 10;
        rr(ctx, bx, y + h - bh, bw * 0.8, bh + 4, 3, time === 'night' ? '#151a3a' : time === 'dusk' ? '#3a3560' : '#6f8fbf');
        if (time === 'night') for (let k = 0; k < 4; k++) if (hash2(i * 7 + k, 52) > 0.55) rr(ctx, bx + 6 + (k % 2) * 14, y + h - bh + 10 + Math.floor(k / 2) * 16, 7, 8, 1, rgba(A.light, 0.8));
      }
      ctx.restore();
      ctx.strokeStyle = N.lightS; ctx.lineWidth = 12; roundRect(ctx, x, y, w, h, 10); ctx.stroke();
      ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.moveTo(x, y + h * 0.45); ctx.lineTo(x + w, y + h * 0.45); ctx.stroke();
      rr(ctx, x - 18, y + h - 4, w + 36, 16, 6, N.light);
      if (curtains) {
        const cc = '#7a5f9e', cs = '#634c84';
        for (const [cx, dir] of [[x - 34, 1], [x + w - 26, -1]]) {
          rr(ctx, cx, y - 30, 60, h + 70, 22, cc);
          ctx.fillStyle = cs; ctx.fillRect(cx + (dir > 0 ? 38 : 0), y - 20, 22, h + 50);
        }
        rr(ctx, x - 50, y - 44, w + 100, 14, 7, N.darkL);
      }
    }
    function wallAndFloor(ctx, wall, wallS, floor, floorS, floorY) {
      ctx.fillStyle = wall; ctx.fillRect(0, 0, CW, floorY);
      rr(ctx, 0, floorY - 150, CW, 150, 0, wallS);
      rr(ctx, 0, floorY - 156, CW, 8, 0, mixHex(wall, '#ffffff', 0.08));
      const g = ctx.createLinearGradient(0, floorY, 0, CH); g.addColorStop(0, floor); g.addColorStop(1, floorS);
      ctx.fillStyle = g; ctx.fillRect(0, floorY, CW, CH - floorY);
      rr(ctx, 0, floorY - 6, CW, 14, 0, mixHex(wallS, '#000000', 0.25));
      // soft light falloff from the top
      const v = ctx.createRadialGradient(CW / 2, floorY - 200, 100, CW / 2, floorY - 200, 1100);
      v.addColorStop(0, 'rgba(255,255,255,0.04)'); v.addColorStop(1, 'rgba(0,0,0,0.35)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, CW, CH);
    }
    function floorLamp(ctx, x, floorY, on, t) {
      if (on > 0) addGlow(ctx, x, floorY - 330, 360, A.light, 0.32 * on);
      rr(ctx, x - 4, floorY - 330, 8, 330, 4, N.darkL);
      rr(ctx, x - 40, floorY - 8, 80, 12, 6, N.darkL);
      ctx.beginPath(); ctx.moveTo(x - 46, floorY - 300); ctx.lineTo(x + 46, floorY - 300); ctx.lineTo(x + 30, floorY - 380); ctx.lineTo(x - 30, floorY - 380); ctx.closePath();
      ctx.fillStyle = on > 0 ? mixHex('#d8cfc0', A.light, 0.5 * on) : '#cfc8bc'; ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x + 10, floorY - 380, 36, 80);
    }
    function plant(ctx, x, y, s = 1) {
      at(ctx, x, y, s, () => {
        shadow(ctx, 0, 0, 120);
        const leaf = (a, l, c) => { ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(0, -l / 2, l * 0.2, l / 2, 0, 0, TAU); ctx.fillStyle = c; ctx.fill(); ctx.restore(); };
        ctx.save(); ctx.translate(0, -70);
        for (let i = 0; i < 7; i++) leaf(-1.1 + i * 0.37, 90 + 40 * hash2(i, 61), i % 2 ? '#3f8f6b' : '#4fa67d');
        ctx.restore();
        ctx.beginPath(); ctx.moveTo(-40, -80); ctx.lineTo(40, -80); ctx.lineTo(30, 0); ctx.lineTo(-30, 0); ctx.closePath(); ctx.fillStyle = '#c96f52'; ctx.fill();
        ctx.fillStyle = '#a95a42'; ctx.fillRect(12, -80, 26, 80);
        rr(ctx, -46, -90, 92, 16, 6, '#d98063');
      });
    }
    function mug(ctx, x, y, s, t) {
      at(ctx, x, y, s, () => {
        rr(ctx, -20, -44, 40, 44, 8, N.paper); ctx.fillStyle = N.paperS; ctx.fillRect(6, -44, 14, 44);
        ctx.strokeStyle = N.paper; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(22, -22, 10, -1.2, 1.2); ctx.stroke();
        rr(ctx, -20, -30, 40, 8, 0, A.base);
        // steam
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
          const ph = fract(t * 0.5 + i / 3), yy = -52 - ph * 60;
          ctx.globalAlpha = Math.sin(ph * Math.PI) * 0.9;
          ctx.beginPath(); ctx.moveTo(-8 + i * 8, yy); ctx.bezierCurveTo(-18 + i * 8, yy - 10, 2 + i * 8, yy - 20, -8 + i * 8, yy - 30); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });
    }
    const world = {
      // Generic room. opts: t, time 'day'|'night'|'dusk', wall, floor, floorY (880), window, lamp, picture, plant
      room(ctx, o = {}) {
        const t = o.t || 0, time = o.time || 'day', fy = o.floorY || 880, night = time === 'night';
        const wall = o.wall || (night ? '#252a4d' : '#36406e'), floor = o.floor || (night ? '#1a1e3a' : '#2a3058');
        wallAndFloor(ctx, wall, mixHex(wall, '#000000', 0.18), floor, mixHex(floor, '#000000', 0.45), fy);
        if (o.window !== false) windowFrame(ctx, 560, 430, 300, 300, time, t);
        if (o.picture !== false) { rr(ctx, 170, 470, 190, 140, 8, N.lightS); rr(ctx, 182, 482, 166, 116, 4, '#3d5a8a'); ctx.beginPath(); ctx.moveTo(182, 598); ctx.lineTo(240, 520); ctx.lineTo(280, 570); ctx.lineTo(310, 540); ctx.lineTo(348, 598); ctx.closePath(); ctx.fillStyle = '#5f86b8'; ctx.fill(); circle(ctx, 316, 512, 12, A.light); }
        if (o.lamp !== false) floorLamp(ctx, 110, fy + 60, night ? 1 : 0.3, t);
        if (o.plant !== false) plant(ctx, 975, fy + 90, 1.2);
        return { floorY: fy, feetY: 1020 };
      },
      // Cosy living room at night with a sofa, side table + steaming mug, lamp, window with the moon.
      // opts: t, sofa colour, lampOn (0..1). Returns { sofa: { x, seatY, feetY }, table: { x, y }, floorY }
      livingRoom(ctx, o = {}) {
        const t = o.t || 0, fy = 860, time = o.time || 'night';
        wallAndFloor(ctx, time === 'night' ? '#242948' : '#36406e', time === 'night' ? '#1d2140' : '#2c355e', '#1b1f3b', '#0c0e1d', fy);
        windowFrame(ctx, 600, 400, 300, 300, time, t);
        floorLamp(ctx, 120, fy + 70, o.lampOn == null ? 1 : o.lampOn, t);
        // rug
        ctx.save(); ctx.translate(480, 1080); ctx.scale(1, 0.18); circle(ctx, 0, 0, 430, '#3b3266'); circle(ctx, 0, 0, 380, '#463b78'); ctx.restore();
        // sofa
        const sc = o.sofa || '#3f7f86', ss = mixHex(sc, '#000000', 0.22), sl = mixHex(sc, '#ffffff', 0.14);
        shadow(ctx, 480, 1010, 720, 0.4);
        rr(ctx, 190, 690, 580, 210, 46, ss);
        rr(ctx, 214, 706, 260, 170, 36, sc); rr(ctx, 486, 706, 260, 170, 36, sc);
        rr(ctx, 200, 850, 560, 110, 30, sl); rr(ctx, 200, 900, 560, 70, 26, sc);
        rr(ctx, 150, 760, 90, 220, 40, sc); rr(ctx, 720, 760, 90, 220, 40, ss);
        rr(ctx, 230, 966, 22, 40, 8, N.darkS); rr(ctx, 710, 966, 22, 40, 8, N.darkS);
        // side table + mug
        shadow(ctx, 900, 1010, 160);
        rr(ctx, 840, 880, 120, 16, 8, N.woodS); rr(ctx, 892, 896, 16, 112, 6, N.woodS); rr(ctx, 860, 1000, 80, 10, 5, N.woodS);
        mug(ctx, 885, 880, 1.2, t);
        return { sofa: { x: 480, seatY: 880, feetY: 1030 }, table: { x: 900, y: 880 }, floorY: fy };
      },
      // Open-plan office. opts: t, time ('day'|'dusk'|'night'). Returns { floorY, desk: { x, y } }
      office(ctx, o = {}) {
        const t = o.t || 0, time = o.time || 'day', fy = 860;
        wallAndFloor(ctx, '#2f3758', '#272e4c', '#262c48', '#11142a', fy);
        // window wall
        for (let i = 0; i < 3; i++) windowFrame(ctx, 90 + i * 310, 380, 270, 330, time, t + i * 3, false);
        // background desks with glowing monitors
        for (let i = 0; i < 4; i++) {
          const x = 150 + i * 260, y = fy + 30;
          rr(ctx, x - 90, y - 60, 180, 12, 5, N.darkL);
          rr(ctx, x - 40, y - 120, 80, 54, 6, N.dark); rr(ctx, x - 34, y - 114, 68, 42, 4, mixHex(N.screen, A.base, 0.12 + 0.06 * Math.sin(t * 2 + i)));
          rr(ctx, x - 4, y - 66, 8, 8, 2, N.dark);
        }
        plant(ctx, 980, fy + 130, 1.1); plant(ctx, 70, fy + 120, 0.9);
        return { floorY: fy, desk: { x: 540, y: 1010 } };
      },
      // City street skyline. opts: t, time ('day'|'dusk'|'night'), groundY (980)
      city(ctx, o = {}) {
        const t = o.t || 0, time = o.time || 'dusk', gy = o.groundY || 980, night = time === 'night';
        sky(ctx, 0, 0, CW, gy, time, t);
        moonOrSun(ctx, 800, 470, time);
        const layers = night ? ['#1a2048', '#141938', '#0e1229'] : time === 'dusk' ? ['#4a4677', '#363461', '#272648'] : ['#8fb0dc', '#6f8fc0', '#4f6ea3'];
        layers.forEach((col, L) => {
          const n = 7 + L * 2, base = gy - 40 + L * 20;
          for (let i = 0; i < n; i++) {
            const w = 110 + 60 * hash2(i, 70 + L), h = 180 + 360 * hash2(i, 80 + L) * (1 - L * 0.25), x = -60 + (i / n) * (CW + 120) + (hash2(i, 90 + L) - 0.5) * 40;
            rr(ctx, x, base - h, w, h + 60, 6, col);
            if (L >= 1) for (let r = 0; r < Math.floor(h / 46); r++) for (let c = 0; c < Math.floor(w / 34); c++) {
              const lit = hash2(i * 97 + r * 13 + c, 100 + L + Math.floor(t * 0.3 + hash2(r, c) * 5)) > (night ? (L === 2 ? 0.72 : 0.85) : 0.86);
              if (lit) rr(ctx, x + 12 + c * 34, base - h + 18 + r * 46, 16, 20, 2, rgba(night || time === 'dusk' ? '#ffd98a' : '#ffffff', (L === 2 ? 0.75 : 0.4) * (night ? 1 : 0.6)));
            }
          }
        });
        // street
        rr(ctx, 0, gy, CW, 40, 0, '#3a3f5c'); rr(ctx, 0, gy, CW, 8, 0, '#4b5175');
        const g = ctx.createLinearGradient(0, gy + 40, 0, CH); g.addColorStop(0, '#22263d'); g.addColorStop(1, '#0d0f1c');
        ctx.fillStyle = g; ctx.fillRect(0, gy + 40, CW, CH - gy - 40);
        for (let i = 0; i < 6; i++) rr(ctx, ((i * 220 - t * 60) % (CW + 220) + CW + 220) % (CW + 220) - 110, gy + 150, 110, 12, 6, 'rgba(255,255,255,0.25)');
        for (const lx of [80, 1000]) { rr(ctx, lx - 5, gy - 300, 10, 300, 5, N.darkL); rr(ctx, lx - 30, gy - 310, 60, 14, 7, N.darkL); if (time !== 'day') addGlow(ctx, lx, gy - 296, 120, A.light, 0.35); circle(ctx, lx, gy - 296, 9, time !== 'day' ? A.light : N.light); }
        return { groundY: gy, feetY: gy + 30 };
      },
      // Server hall: rows of racks receding to a vanishing point, blinking LEDs. opts: t, activity (0..1)
      serverHall(ctx, o = {}) {
        const t = o.t || 0, act = o.activity == null ? 0.7 : o.activity, vx = CW / 2, vy = 640;
        const g = ctx.createLinearGradient(0, 0, 0, CH); g.addColorStop(0, '#0b0f24'); g.addColorStop(0.35, '#141a38'); g.addColorStop(1, '#06080f');
        ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
        const P = (x, y, k) => [vx + (x - vx) * k, vy + (y - vy) * k];
        // floor + ceiling grids
        ctx.strokeStyle = 'rgba(130,150,255,0.10)'; ctx.lineWidth = 2;
        for (let i = -6; i <= 6; i++) { const a = P(vx + i * 170, 1900, 1), b = P(vx + i * 170, 1900, 0.05); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
        for (let i = 0; i < 14; i++) { const k = 1 / (1 + i * 0.45), y = P(0, 1900, k)[1]; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CW, y); ctx.stroke(); }
        for (let i = 0; i < 9; i++) { const k = 1 / (1 + i * 0.6), a = P(vx - 70, -40, k), b = P(vx + 70, -40, k); ctx.globalAlpha = 0.25 + 0.5 * k; rr(ctx, a[0], a[1], b[0] - a[0], Math.max(2, 14 * k), 4 * k, '#c9d4ff'); }
        ctx.globalAlpha = 1;
        addGlow(ctx, vx, vy, 360, A.base, 0.06 + 0.08 * act);
        // two rows of racks: faces towards the aisle, receding to the vanishing point
        const N8 = 9, kk = (i) => 1 / (1 + i * 0.55);
        for (const side of [-1, 1]) {
          const xi = vx + side * 230, top = 180, bot = 1180, xo = vx + side * 760;
          // outer mass (rack tops / backs) in shadow
          const nT = P(xi, top, 1), nB = P(xi, bot, 1), fT = P(xi, top, kk(N8)), fB = P(xi, bot, kk(N8));
          ctx.beginPath(); ctx.moveTo(xo, nT[1] - 200); ctx.lineTo(nT[0], nT[1]); ctx.lineTo(fT[0], fT[1]); ctx.lineTo(fB[0], fB[1]); ctx.lineTo(nB[0], nB[1]); ctx.lineTo(xo, nB[1] + 200); ctx.closePath();
          ctx.fillStyle = '#0e1229'; ctx.fill();
          for (let i = N8 - 1; i >= 0; i--) {
            const k0 = kk(i), k1 = kk(i + 1);
            const a = P(xi, top, k0), b = P(xi, bot, k0), c = P(xi, bot, k1), d = P(xi, top, k1);
            ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath();
            ctx.fillStyle = mixHex('#1a2044', '#2b335e', k0); ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.45)'; ctx.lineWidth = Math.max(1, 6 * k0); ctx.stroke();
            for (let u = 0; u < 10; u++) for (let l = 0; l < 3; l++) {
              const fx = 0.22 + l * 0.2, fy = 0.08 + u * 0.09;
              const x = lerp(a[0], d[0], fx), yT = lerp(a[1], d[1], fx), yB = lerp(b[1], c[1], fx), y = lerp(yT, yB, fy);
              const on = hash2(i * 37 + u * 3 + l + (side > 0 ? 900 : 0), Math.floor(t * 5 + u * 0.3 + i * 0.7)) < 0.2 + 0.6 * act;
              const r = Math.max(1.4, 5 * lerp(k0, k1, fx));
              if (on && k0 > 0.4) addGlow(ctx, x, y, r * 4, A.base, 0.45);
              circle(ctx, x, y, r, on ? A.base : 'rgba(255,255,255,0.10)');
            }
          }
        }
        return { floorY: 1000, feetY: 1040 };
      },
      // Courtroom / government chamber: wood panels, raised bench with a generic balance emblem, columns.
      // opts: t. Returns { bench: { x, y (top) }, podium: { x, y (top) }, floorY }
      courtroom(ctx, o = {}) {
        const fy = 900;
        wallAndFloor(ctx, '#4a3328', '#3c291f', '#2a2036', '#120d18', fy);
        for (let i = 0; i < 6; i++) { rr(ctx, 20 + i * 180, 380, 150, 380, 10, '#553a2d'); rr(ctx, 34 + i * 180, 394, 122, 352, 6, '#4a3328'); }
        for (const cx of [70, 1010]) { rr(ctx, cx - 40, 300, 80, 620, 8, '#d9d2c4'); ctx.fillStyle = '#bdb5a5'; ctx.fillRect(cx + 10, 300, 30, 620); rr(ctx, cx - 54, 290, 108, 24, 6, '#e6e0d3'); rr(ctx, cx - 54, 900, 108, 24, 6, '#e6e0d3'); }
        // emblem: generic balance scale in a ring
        circle(ctx, 540, 470, 74, '#3c291f'); ctx.strokeStyle = A.base; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(540, 470, 64, 0, TAU); ctx.stroke();
        ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(540, 430); ctx.lineTo(540, 505); ctx.moveTo(505, 445); ctx.lineTo(575, 445); ctx.moveTo(520, 505); ctx.lineTo(560, 505); ctx.stroke();
        for (const dx of [-35, 35]) { ctx.beginPath(); ctx.moveTo(540 + dx - 14, 470); ctx.lineTo(540 + dx, 445); ctx.lineTo(540 + dx + 14, 470); ctx.stroke(); ctx.beginPath(); ctx.arc(540 + dx, 470, 14, 0, Math.PI); ctx.stroke(); }
        // bench
        shadow(ctx, 540, fy + 30, 760, 0.4);
        rr(ctx, 170, 640, 740, 270, 18, '#6b4a36'); ctx.fillStyle = '#5a3d2c'; ctx.fillRect(700, 650, 200, 250);
        rr(ctx, 150, 620, 780, 34, 12, '#7d5841');
        for (let i = 0; i < 4; i++) rr(ctx, 210 + i * 175, 690, 140, 180, 10, '#5f412f');
        return { bench: { x: 540, y: 620 }, podium: { x: 540, y: 980 }, floorY: fy };
      },
    };
    world.livingRoomNight = (ctx, o = {}) => world.livingRoom(ctx, Object.assign({ time: 'night' }, o));
    // small props usable anywhere
    const props = { plant, mug, floorLamp: (ctx, x, y, on, t) => floorLamp(ctx, x, y, on, t), window: windowFrame };

    return {
      // motion helpers at the top level first, so the frame-size-aware camera below wins over motion.camera
      ...motion,
      ACCENT: A, NEUTRAL: N, SKIN, HAIR, SHIRT, SIZE, font, motion, world, props,
      // full frame: the anchor is the stage centre (487, 725), so { zoom: 1 } with no x/y is the identity
      camera: (ctx, t, keys) => (CW === 1080 && CH === 1920 ? motion.camera(ctx, t, keys, CW, CH, 487, 725) : motion.camera(ctx, t, keys, CW, CH)),
      cameraShake: (ctx, t, start, dur = 0.4, amp = 12) => { ctx.translate(motion.shake(t, start, dur, amp), motion.shake(t, start + 0.03, dur, amp * 0.6, 31)); },
      shadow, glow: addGlow,
      drawPerson, drawRobot, drawPhone, drawLaptop, drawServerRack, drawDataCenter, drawDocument, drawCoin, drawBills,
      drawPriceTag, drawChart, drawLock, drawShield, drawGlobe, drawGavel, drawRulebook, drawBriefcase, drawClock,
      drawLightbulb, drawWarning, drawSpeechBubble, drawStamp, drawLabel: label, drawDesk, drawBuilding, drawLectern,
    };
  }

  window.EXPLAINER_KIT = { create };
})();
