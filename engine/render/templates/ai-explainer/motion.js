/* ai-explainer motion library (info.helpers.motion, also kit2.motion): the 12 Basic Principles of Animation
 * (Thomas & Johnston, "The Illusion of Life", 1981) as small, pure, deterministic functions of time.
 *
 * Every function is a pure function of its arguments (no state between frames, no Math.random / clocks), so a
 * scene stays a pure function of t. "Physics" that needs history (springs, follow-through) is re-integrated from
 * a fixed time grid on every call, which is cheap (a few dozen steps) and identical for identical t.
 *
 * Principle map (helper -> principle):
 *   1 Squash & stretch ......... squash, squashImpact, stretchFromVelocity, squashTransform
 *   2 Anticipation ............. act (wind-up phase), anticipate
 *   3 Staging .................. focusWeight, lookAt, stagger, spotlight (in kit2.light)
 *   4 Straight ahead / pose-to-pose  keyed (pose-to-pose), follow/chain (straight-ahead simulation)
 *   5 Follow-through & overlap . follow, chain, settle, act (overshoot + settle), lag
 *   6 Slow in & slow out ....... ease.*, slowInOut, keyed (eased in-betweens), timing presets
 *   7 Arcs ..................... arc, arcPath, along, swingArc
 *   8 Secondary action ......... breathe, blink, weightShift, fidget, sway
 *   9 Timing ................... TIMING presets, act(timing), beatsOf, hold
 *  10 Exaggeration ............. exaggerate, act(overshoot), squash(amount)
 *  11 Solid drawing ............ (kit2: volume shading, 3/4 view, overlap of near/far limbs)
 *  12 Appeal ................... (kit2: proportions, clear silhouettes, readable faces)
 */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, k) => a + (b - a) * k;
  const fract = (x) => x - Math.floor(x);
  // stable hash noise in [0, 1) (same family as CLIPKIT.hash2, kept local so motion.js has no dependencies)
  const hash = (a, b = 0) => fract(Math.sin(a * 127.1 + b * 311.7 + 74.7) * 43758.5453123);

  // ---------------------------------------------------------------- 6 slow in / slow out
  // ease.in/out/inOut(k, p = 2..4): polynomial slow-in/slow-out. All clamp k to [0, 1].
  const ease = {
    linear: (k) => clamp(k),
    in: (k, p = 2.2) => Math.pow(clamp(k), p),
    out: (k, p = 2.2) => 1 - Math.pow(1 - clamp(k), p),
    inOut: (k, p = 2.4) => { k = clamp(k); return k < 0.5 ? Math.pow(2 * k, p) / 2 : 1 - Math.pow(2 - 2 * k, p) / 2; },
    sine: (k) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(k)),
    back: (k, s = 1.7) => { k = clamp(k) - 1; return 1 + (s + 1) * k * k * k + s * k * k; },          // overshoots then settles at 1
    backIn: (k, s = 1.7) => { k = clamp(k); return k * k * ((s + 1) * k - s); },                         // pulls back first (anticipation)
    elastic: (k, damp = 6, freq = 3) => { k = clamp(k); return k >= 1 ? 1 : 1 - Math.exp(-damp * k) * Math.cos(freq * TAU * k); },
  };
  const slowInOut = (k, p = 2.4) => ease.inOut(k, p);

  // ---------------------------------------------------------------- 9 timing presets
  // seconds for each phase of an action; pick by weight/character. scale them with `speed`.
  const TIMING = {
    snappy: { anticipate: 0.12, action: 0.16, settle: 0.32, overshoot: 0.12 },  // light things, small robots, UI pops
    normal: { anticipate: 0.22, action: 0.28, settle: 0.45, overshoot: 0.08 },  // people, everyday gestures
    heavy: { anticipate: 0.38, action: 0.42, settle: 0.6, overshoot: 0.04 },    // big bodies, furniture, doors
    floaty: { anticipate: 0.3, action: 0.6, settle: 0.9, overshoot: 0.1 },      // hovering, drifting, magic
    take: { anticipate: 0.18, action: 0.1, settle: 0.55, overshoot: 0.22 },     // a cartoon "take" (surprise)
  };
  const timing = (name, speed = 1) => { const T = TIMING[name] || TIMING.normal; return { anticipate: T.anticipate / speed, action: T.action / speed, settle: T.settle / speed, overshoot: T.overshoot }; };

  // ---------------------------------------------------------------- 2 anticipation -> action -> 5 follow-through
  // act(t, start, opts): one big action as a value 0 -> 1. Phases: 'before' (0), 'anticipate' (dips to -wind),
  // 'action' (fast, slow-out, overshoots to 1 + overshoot), 'settle' (damped wobble to 1), 'done'.
  // opts: timing name or {anticipate, action, settle, overshoot}, wind (anticipation depth, 0.15), exag (1).
  // Returns { v, phase, k (raw action progress 0..1), wind (0..1 anticipation strength now), vel (dv/dt),
  //           impact (0..1 decaying right after the action lands; drive squashImpact with it), end (s) }.
  function act(t, start = 0, o = {}) {
    const T = typeof o.timing === 'object' ? o.timing : timing(o.timing || 'normal', o.speed || 1);
    const ex = o.exag == null ? 1 : o.exag;
    const wind = (o.wind == null ? 0.15 : o.wind) * ex, over = (o.overshoot == null ? T.overshoot : o.overshoot) * ex;
    const a0 = start, a1 = a0 + T.anticipate, b1 = a1 + T.action, c1 = b1 + T.settle;
    const val = (tt) => {
      if (tt <= a0) return 0;
      if (tt < a1) { const k = (tt - a0) / T.anticipate; return -wind * Math.sin(k * Math.PI * 0.5) * (1 - 0.25 * k * k); }
      if (tt < b1) { const k = (tt - a1) / T.action; const from = -wind * 0.75; return lerp(from, 1 + over, ease.out(k, 2.6)); }
      if (tt < c1) { const k = (tt - b1) / T.settle; return 1 + over * Math.exp(-4.2 * k) * Math.cos(k * Math.PI * 2.2) * (1 - k); }
      return 1;
    };
    const v = val(t), h = 1 / 240, vel = (val(t + h) - val(t - h)) / (2 * h);
    const phase = t <= a0 ? 'before' : t < a1 ? 'anticipate' : t < b1 ? 'action' : t < c1 ? 'settle' : 'done';
    const k = clamp((t - a1) / T.action);
    const w = t > a0 && t < a1 ? Math.sin(((t - a0) / T.anticipate) * Math.PI * 0.5) : t >= a1 && t < a1 + T.action * 0.4 ? 1 - (t - a1) / (T.action * 0.4) : 0;
    const impact = t >= b1 ? Math.exp(-(t - b1) / Math.max(0.05, T.settle * 0.35)) : 0;
    return { v, phase, k, wind: w, vel, impact, end: c1, hit: b1 };
  }
  // anticipate(t, start, dur, depth): just the wind-up dip (0 -> -depth -> 0 at start + dur); add it to a pose
  const anticipate = (t, start, dur = 0.25, depth = 1) => (t <= start || t >= start + dur ? 0 : -depth * Math.sin(((t - start) / dur) * Math.PI));

  // ---------------------------------------------------------------- 1 squash & stretch (volume preserving)
  // squash(s): s > 0 stretches along the axis (tall/thin), s < 0 squashes (short/wide). Area stays constant:
  // sy = 1 + s, sx = 1 / sy. Returns { sx, sy }.
  function squash(s, amount = 1) { const sy = Math.max(0.35, 1 + s * amount); return { sx: 1 / sy, sy }; }
  // squashImpact(t, tHit, amount, dur): after landing/hitting at tHit: squash, rebound stretch, settle (decaying).
  // Returns s for squash(s): -amount at the hit, then ~+0.5 amount, then 0.
  const squashImpact = (t, tHit, amount = 0.25, dur = 0.45) => {
    if (t < tHit || t > tHit + dur) return 0;
    const k = (t - tHit) / dur;
    return -amount * Math.exp(-3.2 * k) * Math.cos(k * Math.PI * 2.6);
  };
  // stretchFromVelocity(vx, vy, k, max): stretch along the motion direction. Returns { s, angle } -> rotate by
  // angle, scale(squash(s)) with the stretch on the local y axis, rotate back (see squashTransform).
  function stretchFromVelocity(vx, vy, k = 0.0006, max = 0.35) {
    const sp = Math.hypot(vx, vy);
    return { s: Math.min(max, sp * k), angle: sp < 1e-6 ? 0 : Math.atan2(vy, vx) - Math.PI / 2 };
  }
  // squashTransform(ctx, x, y, s, angle): apply a volume-preserving squash/stretch around (x, y) (e.g. the feet
  // for a landing, the centre for a flying object). angle 0 = vertical stretch.
  function squashTransform(ctx, x, y, s, angle = 0) {
    const q = squash(s);
    ctx.translate(x, y); ctx.rotate(angle); ctx.scale(q.sx, q.sy); ctx.rotate(-angle); ctx.translate(-x, -y);
  }

  // ---------------------------------------------------------------- 5 follow-through / overlapping action
  // spring(t, t0, from, to, freq, damp): closed-form damped spring step from `from` to `to` starting at t0.
  function spring(t, t0, from, to, freq = 2.2, damp = 0.35) {
    if (t <= t0) return from;
    const w = freq * TAU, dt = t - t0, z = clamp(damp, 0.01, 0.99), wd = w * Math.sqrt(1 - z * z);
    return to + (from - to) * Math.exp(-z * w * dt) * (Math.cos(wd * dt) + (z * w / wd) * Math.sin(wd * dt));
  }
  // settle(t, t0, amp, freq, decay): a decaying wobble after an event (follow-through on a stop), 0 at rest.
  const settle = (t, t0, amp = 1, freq = 2.4, decay = 5) => (t < t0 ? 0 : amp * Math.exp(-decay * (t - t0)) * Math.sin((t - t0) * freq * TAU));
  // follow(fn, t, opts): the response of a damped spring dragged by the parent signal fn(time) (a number),
  // integrated from a fixed grid over the last `window` seconds, so it is a pure function of t.
  // opts: freq (Hz, 2.2), damp (0..1, 0.28), window (s, auto), dt (1/90).
  // Returns { v (the lagged value), lag (v - fn(t)) }. Use lag to bend hair/ties/antennae against the motion.
  function follow(fn, t, o = {}) {
    const f = o.freq || 2.2, z = clamp(o.damp == null ? 0.28 : o.damp, 0.02, 1.5), w = f * TAU;
    const dt = o.dt || 1 / 90, win = o.window || Math.min(3, 5 / (z * w));
    let t0 = Math.floor((t - win) / dt) * dt;
    let x = fn(t0), v = (fn(t0 + dt) - x) / dt;
    const steps = Math.ceil((t - t0) / dt);
    for (let i = 0; i < steps; i++) {
      const h = Math.min(dt, t - t0); if (h <= 0) break;
      const target = fn(t0 + h);
      v += (w * w * (target - x) - 2 * z * w * v) * h; x += v * h; t0 += h;
    }
    const p = fn(t);
    return { v: x, lag: x - p };
  }
  // lag(fn, t, delay): plain delayed copy (cheapest overlap): fn(t - delay)
  const lag = (fn, t, delay = 0.08) => fn(t - delay);
  // chain(fn, t, n, opts): n segments of a dangling chain (ponytail, tie, tail, antenna, cloth hem). fn(time) is
  // the parent's driving signal (e.g. its x velocity or head angle). Each segment follows the previous one with
  // more lag and less stiffness. Returns an array of n angle offsets (radians) to add segment by segment.
  // opts: gain (radians per unit of parent lag, 0.004), freq (2.4), damp (0.3), falloff (0.8), max (1.1)
  function chain(fn, t, n = 3, o = {}) {
    const out = [], gain = o.gain == null ? 0.004 : o.gain, max = o.max || 1.1;
    let f = o.freq || 2.4;
    for (let i = 0; i < n; i++) {
      const r = follow(fn, t - i * 0.035, { freq: f, damp: o.damp == null ? 0.3 : o.damp, dt: 1 / 60 });
      out.push(clamp(-r.lag * gain * (1 + i * 0.35), -max, max));
      f *= o.falloff || 0.8;
    }
    return out;
  }

  // ---------------------------------------------------------------- 7 arcs
  // arc(p0, p1, k, height, ease): point on a quadratic arc from p0 to p1 bowing `height` px (positive = up /
  // left of travel). Returns [x, y, angle].
  function arc(p0, p1, k, height = 80, e = ease.inOut) {
    const u = e(k), mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, dx = p1[0] - p0[0], dy = p1[1] - p0[1];
    const L = Math.hypot(dx, dy) || 1, nx = dy / L, ny = -dx / L;          // normal (left of travel; up for left->right)
    const cx = mx + nx * height * 2, cy = my + ny * height * 2;         // control point (bow = height at the middle)
    const a = 1 - u, x = a * a * p0[0] + 2 * a * u * cx + u * u * p1[0], y = a * a * p0[1] + 2 * a * u * cy + u * u * p1[1];
    const tx = 2 * a * (cx - p0[0]) + 2 * u * (p1[0] - cx), ty = 2 * a * (cy - p0[1]) + 2 * u * (p1[1] - cy);
    return [x, y, Math.atan2(ty, tx)];
  }
  // arcPath(pts, k): smooth Catmull-Rom path through points, k 0..1 by length (eased by the caller). [x, y, angle]
  function arcPath(pts, k) {
    if (pts.length < 2) return [pts[0][0], pts[0][1], 0];
    const seg = (i) => [pts[Math.max(0, i - 1)], pts[i], pts[i + 1], pts[Math.min(pts.length - 1, i + 2)]];
    const cr = (p0, p1, p2, p3, u) => {
      const u2 = u * u, u3 = u2 * u;
      return [0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * u + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * u2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * u3));
    };
    const lens = []; let tot = 0;
    for (let i = 0; i < pts.length - 1; i++) { const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]); lens.push(l); tot += l; }
    let d = clamp(k) * tot, i = 0;
    while (i < lens.length - 1 && d > lens[i]) { d -= lens[i]; i++; }
    const u = clamp(d / (lens[i] || 1)), s = seg(i), p = cr(...s, u), q = cr(...s, Math.min(1, u + 0.01)), r = cr(...s, Math.max(0, u - 0.01));
    return [p[0], p[1], Math.atan2(q[1] - r[1], q[0] - r[0])];
  }
  // along(pts, t, t0, t1, e): arcPath with slow-in/slow-out timing between t0 and t1
  const along = (pts, t, t0, t1, e = ease.inOut) => arcPath(pts, e((t - t0) / Math.max(1e-6, t1 - t0)));
  // swingArc(cx, cy, r, a0, a1, k): point on a circular arc (limbs, pendulums, reaches). angles in radians.
  const swingArc = (cx, cy, r, a0, a1, k) => { const a = lerp(a0, a1, k); return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, a]; };

  // ---------------------------------------------------------------- 8 secondary action (seeded per character)
  // smooth value noise in [-1, 1]
  function noise(t, seed = 0) {
    const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f);
    return lerp(hash(i, seed) * 2 - 1, hash(i + 1, seed) * 2 - 1, u);
  }
  // breathe(t, seed, rate): { k (-1..1 inhale cycle), chest (px-ish scale 0..1), shoulders (lift px at scale 1) }
  function breathe(t, seed = 0, rate = 0.23) {
    const ph = t * rate * TAU + seed * 1.7 + 0.4 * Math.sin(t * 0.37 + seed);
    const k = Math.sin(ph);
    return { k, chest: 0.5 + 0.5 * k, shoulders: 1.4 * (0.5 + 0.5 * Math.sin(ph - 0.4)) };
  }
  // blink(t, seed): eyelid closure 0 (open) .. 1 (shut). Natural schedule: every 2.2-5 s, sometimes a double
  // blink; fast close (60 ms), slower open (110 ms).
  function blink(t, seed = 0) {
    const period = 3.4, cell = Math.floor((t + seed * 0.91) / period), local = (t + seed * 0.91) - cell * period;
    const at = 0.3 + hash(cell, seed + 7) * (period - 0.9);
    const one = (dt) => (dt < 0 ? 0 : dt < 0.06 ? dt / 0.06 : dt < 0.17 ? 1 - (dt - 0.06) / 0.11 : 0);
    let c = one(local - at);
    if (hash(cell, seed + 13) > 0.72) c = Math.max(c, one(local - at - 0.24));
    return clamp(c);
  }
  // weightShift(t, seed): slow hip sway (-1..1) for idle stances (feed into the rig's hip shift / lean)
  const weightShift = (t, seed = 0) => 0.65 * Math.sin(t * 0.42 + seed * 2.1) + 0.35 * noise(t * 0.3, seed + 3);
  // fidget(t, seed, amt): small irregular moves { head, hand, look } in radians/units for a living idle
  function fidget(t, seed = 0, amt = 1) {
    return { head: 0.05 * amt * noise(t * 0.55, seed + 11), hand: 0.12 * amt * noise(t * 0.8, seed + 17), look: 0.25 * amt * noise(t * 0.33, seed + 23) };
  }
  // sway(t, seed, amp, speed): gentle pendulum for hanging things (lamps, plants, signs)
  const sway = (t, seed = 0, amp = 0.04, speed = 0.6) => amp * Math.sin(t * speed * TAU + seed * 2.3) * (0.8 + 0.2 * noise(t * 0.2, seed));

  // ---------------------------------------------------------------- 9/3 holds and staging
  // hold(t, seed, amp): a MOVING hold. Never freeze a pose: add this tiny drift (px-ish, -amp..amp) while held.
  const hold = (t, seed = 0, amp = 1) => amp * (0.6 * Math.sin(t * 0.9 + seed) + 0.4 * noise(t * 0.7, seed + 5));
  // beatsOf(t, starts): index of the current beat and local time: starts = [t0, t1, ...] -> { i, local }
  function beatsOf(t, starts) { let i = -1; for (let k = 0; k < starts.length; k++) if (t >= starts[k]) i = k; return { i, local: i < 0 ? t - starts[0] : t - starts[i] }; }
  // stagger(n, t, step, delay): local times for n items revealed one after another (overlapping action in groups)
  const stagger = (n, t, step = 0.12, delay = 0) => Array.from({ length: n }, (_, i) => t - delay - i * step);
  // focusWeight(t, t0, t1, fade): 0..1 how much a subject should be "on stage" (use to dim others / steer camera)
  const focusWeight = (t, t0, t1, fade = 0.4) => clamp((t - t0) / fade) * clamp((t1 - t) / fade);

  // ---------------------------------------------------------------- 10 exaggeration
  // exaggerate(value, rest, amount): push a pose value away from its rest (amount 1 = as authored, 1.3 = bigger)
  const exaggerate = (value, rest = 0, amount = 1.2) => rest + (value - rest) * amount;

  // ---------------------------------------------------------------- 4 pose-to-pose
  // keyed(t, keys, opts): eased in-betweens between key poses. keys: [{t, v, ease?}] where v is a number, an
  // array of numbers or a flat object of numbers (e.g. a rig pose). The segment ease defaults to slow-in/slow-out;
  // a key's `ease` ('inOut'|'in'|'out'|'back'|'linear'|function) applies to the segment that ARRIVES at it.
  // opts.moving (amp): add a moving hold while sitting on a key (default 0 = off; for numbers only).
  function mixVal(a, b, k) {
    if (typeof a === 'number') return lerp(a, typeof b === 'number' ? b : a, k);
    if (Array.isArray(a)) return a.map((x, i) => mixVal(x, b[i] == null ? x : b[i], k));
    const o = {};
    for (const key of Object.keys(a)) o[key] = typeof a[key] === 'number' && typeof b[key] === 'number' ? lerp(a[key], b[key], k) : (k < 0.5 ? a[key] : (b[key] == null ? a[key] : b[key]));
    for (const key of Object.keys(b)) if (!(key in o)) o[key] = b[key];
    return o;
  }
  function keyed(t, keys, o = {}) {
    if (!keys.length) return 0;
    if (t <= keys[0].t) return keys[0].v;
    const last = keys[keys.length - 1];
    if (t >= last.t) { const v = last.v; return typeof v === 'number' && o.moving ? v + hold(t, o.seed || 0, o.moving) : v; }
    let i = 0; while (i < keys.length - 2 && t > keys[i + 1].t) i++;
    const a = keys[i], b = keys[i + 1], e = b.ease, raw = (t - a.t) / Math.max(1e-6, b.t - a.t);
    const k = typeof e === 'function' ? e(raw) : e && ease[e] ? ease[e](raw) : ease.inOut(raw);
    return mixVal(a.v, b.v, k);
  }
  const mix = mixVal;

  window.EXPLAINER_MOTION = {
    TAU, clamp, lerp, hash, noise, ease, slowInOut, TIMING, timing,
    act, anticipate, squash, squashImpact, stretchFromVelocity, squashTransform,
    spring, settle, follow, lag, chain, arc, arcPath, along, swingArc,
    breathe, blink, weightShift, fidget, sway, hold, beatsOf, stagger, focusWeight, exaggerate, keyed, mix,
  };
})();
