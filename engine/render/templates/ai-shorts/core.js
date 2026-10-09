/* ai-shorts template engine.
 * Draws one 1080x1920 frame for any time t (seconds) from window.__CLIP__, deterministically:
 * no Math.random, no clocks, no state carried between frames. Background styles live in styles/*.js
 * and register themselves with CLIPKIT.registerStyle().
 *
 * Page contract (used by render.mjs):
 *   window.__CLIP__            clip.json (normalised by render.mjs) injected before load
 *   window.__READY === true    fonts loaded + layouts built; window.__ERROR set on failure
 *   window.renderFrame(t)      paint frame at time t
 *   window.renderCover()       paint the cover (hook card, no captions)
 *   window.__INFO              { style, palette, groups, ... } for logs
 */
(function () {
  'use strict';
  const W = 1080, H = 1920;
  const SAFE = { x0: 60, x1: 915, y0: 150, y1: 1540 }; // stricter TikTok/Reels box (right column + bottom UI)
  const CX = (SAFE.x0 + SAFE.x1) / 2; // horizontal centre of the safe box (text is centred here, not on W/2)
  const BOXW = SAFE.x1 - SAFE.x0;
  const LAYOUT = {
    progressY: 1516, progressH: 7,
    dockY: 206,
    cardCenterY: 560,
    captionY: 1200,     // visual centre of the caption block (band 1050-1350)
    captionMaxW: 780,
    creditBottom: 1484,
    hookSec: 2.8, hookMorph: 0.55,
  };

  // ------------------------------------------------------------------ utils
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  // integer hash of (a, b) -> [0, 1)
  function hash2(a, b) {
    let h = Math.imul((a | 0) ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul((b | 0) + 0x632be5ab, 0xc2b2ae35);
    h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  }
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
  const easeOutCubic = (k) => 1 - Math.pow(1 - clamp(k), 3);
  const easeInOutCubic = (k) => { k = clamp(k); return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
  const spring = (a, k = 16, w = 19) => (a <= 0 ? 0 : 1 - Math.exp(-k * a) * Math.cos(w * a));
  const fract = (x) => x - Math.floor(x);

  function hexRgb(hex) {
    const h = hex.replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function rgba(hex, a) { const [r, g, b] = hexRgb(hex); return `rgba(${r},${g},${b},${a})`; }
  function mixHex(h1, h2, k) {
    const a = hexRgb(h1), b = hexRgb(h2);
    return '#' + a.map((v, i) => Math.round(lerp(v, b[i], k)).toString(16).padStart(2, '0')).join('');
  }

  // Pre-rendered radial glow sprites, drawn with 'lighter' compositing (much cheaper than shadowBlur).
  const glowCache = new Map();
  function glow(hex, core = 0.35) {
    const key = hex + core;
    if (glowCache.has(key)) return glowCache.get(key);
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d');
    const [r, gg, b] = hexRgb(hex);
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, `rgba(${Math.min(255, r + 120)},${Math.min(255, gg + 120)},${Math.min(255, b + 120)},1)`);
    grd.addColorStop(core * 0.4, `rgba(${r},${gg},${b},0.9)`);
    grd.addColorStop(core, `rgba(${r},${gg},${b},0.35)`);
    grd.addColorStop(1, `rgba(${r},${gg},${b},0)`);
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    glowCache.set(key, c);
    return c;
  }
  function drawGlow(ctx, spr, x, y, r, alpha) {
    if (alpha <= 0.003 || r <= 0.5) return;
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(spr, x - r, y - r, r * 2, r * 2);
  }
  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ------------------------------------------------------------------ audio
  // Envelope is per frame (0..1). We derive: env (attack/release smoothed), onset (speech attacks),
  // cum (integral of env, lets things speed up while someone talks without frame-to-frame state).
  function makeAudio(envelope, fps, duration) {
    const n = Math.max(4, Math.ceil(duration * fps) + 4);
    const raw = new Float32Array(n);
    const src = Array.isArray(envelope) ? envelope : [];
    for (let i = 0; i < n; i++) raw[i] = clamp(+src[Math.min(i, src.length - 1)] || 0);
    if (!src.length) raw.fill(0.35);
    const sorted = Array.from(raw).sort((a, b) => a - b);
    const lo = sorted[Math.floor(n * 0.08)], hi = Math.max(lo + 0.05, sorted[Math.floor(n * 0.97)]);
    const norm = new Float32Array(n), sm = new Float32Array(n), slow = new Float32Array(n), onset = new Float32Array(n);
    let v = 0, s = 0;
    for (let i = 0; i < n; i++) {
      const x = clamp((raw[i] - lo) / (hi - lo));
      norm[i] = x;
      v += (x > v ? 0.6 : 0.16) * (x - v); sm[i] = v;
      s += 0.05 * (x - s); slow[i] = s;
    }
    let o = 0;
    for (let i = 0; i < n; i++) { const d = clamp((norm[i] - slow[i]) * 2.2); o = Math.max(d, o * 0.82); onset[i] = o; }
    const cum = new Float32Array(n + 1);
    for (let i = 0; i < n; i++) cum[i + 1] = cum[i] + sm[i] / fps;
    const at = (arr, t) => {
      const f = clamp(t * fps, 0, arr.length - 1.001), i = Math.floor(f), k = f - i;
      return arr[i] * (1 - k) + arr[i + 1] * k;
    };
    return {
      env: (t) => at(sm, t), raw: (t) => at(norm, t), onset: (t) => at(onset, t), cum: (t) => at(cum, t),
    };
  }

  // ------------------------------------------------------------------ text helpers
  const font = (T, size) => `${T.weight} ${Math.round(size * 10) / 10}px "${T.family}"`;
  function capHeight(ctx, T, size) {
    ctx.font = font(T, size);
    const m = ctx.measureText('HXE');
    return m.actualBoundingBoxAscent || size * 0.72;
  }
  const cleanTok = (w) => w.toLowerCase().replace(/[‘’]/g, "'").replace(/[^a-z0-9'%$]+/g, '');
  function captionText(w, upper) {
    let s = w.replace(/[‘’]/g, "'").replace(/[“”"]/g, '').replace(/[,.;:]+$/, '').replace(/^[(\[]+|[)\]]+$/g, '');
    if (s.endsWith('...')) s = s.slice(0, -3);
    return upper ? s.toUpperCase() : s;
  }
  function fitText(ctx, text, T, size, minSize, maxW) {
    for (let s = size; s >= minSize; s -= 1) { ctx.font = font(T, s); if (ctx.measureText(text).width <= maxW) return { text, size: s }; }
    ctx.font = font(T, minSize);
    let t = text;
    while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
    return { text: t === text ? t : t.trimEnd() + '…', size: minSize };
  }
  // Balanced wrap into at most maxLines lines of width <= maxW. Returns null if impossible.
  function wrapBalanced(widths, space, maxW, maxLines) {
    const greedy = (lim) => {
      const lines = []; let cur = [], w = 0;
      for (let i = 0; i < widths.length; i++) {
        const add = cur.length ? space + widths[i] : widths[i];
        if (cur.length && w + add > lim) { lines.push(cur); cur = [i]; w = widths[i]; } else { cur.push(i); w += add; }
      }
      if (cur.length) lines.push(cur);
      return lines;
    };
    if (Math.max(...widths) > maxW) return null;
    const base = greedy(maxW);
    if (base.length > maxLines) return null;
    let lo = Math.max(...widths), hi = maxW;
    for (let k = 0; k < 18; k++) { const mid = (lo + hi) / 2; if (greedy(mid).length <= base.length) hi = mid; else lo = mid; }
    return greedy(hi);
  }

  // Word outline renderer shared by captions and big type: soft shadow, thick dark outline, fill.
  function drawOutlined(ctx, text, x, y, size, fill, o) {
    ctx.lineJoin = 'round'; ctx.miterLimit = 2;
    if (o.glow) {
      ctx.save();
      ctx.shadowColor = o.glow; ctx.shadowBlur = size * 0.55;
      ctx.fillStyle = o.glow; ctx.globalAlpha *= 0.55;
      ctx.fillText(text, x, y);
      ctx.restore();
    }
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = size * 0.28; ctx.shadowOffsetY = size * 0.07;
    ctx.strokeStyle = 'rgba(2,3,8,0.55)'; ctx.lineWidth = size * (o.stroke * 2.0);
    ctx.strokeText(text, x, y);
    ctx.restore();
    ctx.strokeStyle = '#04050a'; ctx.lineWidth = size * o.stroke;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = fill;
    ctx.fillText(text, x, y);
  }

  // ------------------------------------------------------------------ captions
  function markEmphasis(words, emphasis) {
    const toks = words.map((w) => cleanTok(w.w));
    const flags = new Array(words.length).fill(false);
    for (const phrase of emphasis || []) {
      const p = String(phrase).split(/\s+/).map(cleanTok).filter(Boolean);
      if (!p.length) continue;
      for (let i = 0; i + p.length <= toks.length; i++) {
        let ok = true;
        for (let j = 0; j < p.length; j++) if (toks[i + j] !== p[j]) { ok = false; break; }
        if (ok) for (let j = 0; j < p.length; j++) flags[i + j] = true;
      }
    }
    return flags;
  }
  const STOP = new Set(['a', 'an', 'the', 'of', 'to', 'and', 'or', 'in', 'on', 'at', 'for', 'with', 'by', 'from', 'that', 'my', 'your', 'our', 'their', 'his', 'her', 'its', 'is', 'are', 'was', 'be', 'i', 'you', 'we', 'they', 'it', 'but', 'so', 'if', 'as', 'than']);
  // Best line split (1 line, or 2 balanced lines) for word widths; returns { lines, m } (m = widest line).
  function splitLines(widths, space, maxW, chars, lineChars) {
    const n = widths.length;
    const total = widths.reduce((a, b) => a + b, 0) + space * (n - 1);
    if (n === 1 || (total <= maxW && chars <= lineChars)) return { lines: [widths.map((_, i) => i)], m: total };
    let best = null;
    for (let k = 1; k < n; k++) {
      const a = widths.slice(0, k).reduce((x, y) => x + y, 0) + space * (k - 1);
      const b = widths.slice(k).reduce((x, y) => x + y, 0) + space * (n - k - 1);
      const m = Math.max(a, b);
      if (!best || m < best.m) best = { k, m };
    }
    return { lines: [[...Array(best.k).keys()], [...Array(n - best.k).keys()].map((i) => i + best.k)], m: best.m };
  }
  function buildGroups(ctx, words, emph, T) {
    const groups = [];
    let cur = [];
    ctx.font = font(T, T.size);
    const space = ctx.measureText(' ').width + T.size * 0.12;
    const wcache = new Map();
    const mw = (t) => { if (!wcache.has(t)) wcache.set(t, ctx.measureText(t).width); return wcache.get(t); };
    // a group is acceptable if it fits in <= 2 lines at the full caption size
    const fitsLayout = (ws) => {
      const chars = ws.reduce((n, w) => n + w.text.length, 0) + ws.length - 1;
      return splitLines(ws.map((w) => mw(w.text)), space, T.maxW, chars, T.lineChars).m <= T.maxW;
    };
    for (let i = 0; i < words.length; i++) {
      const w = { text: captionText(words[i].w, T.upper), raw: words[i].w, s: +words[i].s, e: +words[i].e, emph: emph[i] };
      if (!w.text) continue;
      if (cur.length) {
        const prev = cur[cur.length - 1];
        const gap = w.s - prev.e;
        const punct = /[.!?,;:—–-]["'”)]*$/.test(prev.raw);
        if (punct || gap > 0.35) { groups.push(cur); cur = []; }
        else if (cur.length >= 4 || !fitsLayout([...cur, w])) {
          // don't strand a function word at the end of a group ("AND THE COST OF")
          const carry = cur.length > 1 && STOP.has(cleanTok(prev.raw)) ? [cur.pop()] : [];
          groups.push(cur); cur = carry;
        }
      }
      cur.push(w);
    }
    if (cur.length) groups.push(cur);
    // No orphan single-word groups (they flash by and read badly), unless the word is emphasised:
    // merge into the neighbour it is closest to, as long as the result is still 2-4 words.
    const endsSentence = (g) => /[.!?]["')\u201d]*$/.test(g[g.length - 1].raw);
    const fits = (a, b) => a.length + b.length <= 4 && fitsLayout([...a, ...b]);
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (g.length !== 1 || g[0].emph) continue;
      const prev = groups[i - 1], next = groups[i + 1];
      const gapPrev = prev ? g[0].s - prev[prev.length - 1].e : 99;
      const gapNext = next ? next[0].s - g[0].e : 99;
      const canPrev = prev && gapPrev < 1.2 && fits(prev, g) && !endsSentence(prev);
      const canNext = next && gapNext < 1.2 && fits(g, next) && !endsSentence(g);
      if (canPrev && (!canNext || gapPrev <= gapNext)) { prev.push(g[0]); groups.splice(i, 1); i -= 2; if (i < -1) i = -1; }
      else if (canNext) { next.unshift(g[0]); groups.splice(i, 1); i--; }
    }
    return groups.map((ws, gi) => ({ words: ws, start: ws[0].s, lastEnd: ws[ws.length - 1].e, idx: gi }));
  }
  function layoutGroups(ctx, groups, T) {
    for (let gi = 0; gi < groups.length; gi++) {
      const g = groups[gi];
      const next = groups[gi + 1];
      g.end = next ? (next.start - g.lastEnd < 0.7 ? next.start : g.lastEnd + 0.55) : Infinity; // last group stays lit to the final frame
      // shrink only when a single word is too long for the box (rare); below minSize is an emergency
      let size = T.size, lines = null, widths, space, squash = 1;
      const chars = g.words.reduce((n, w) => n + w.text.length, 0) + g.words.length - 1;
      for (; size >= 48; size -= 2) {
        ctx.font = font(T, size);
        widths = g.words.map((w) => ctx.measureText(w.text).width);
        space = ctx.measureText(' ').width + size * 0.12;
        const r = splitLines(widths, space, T.maxW, chars, T.lineChars);
        lines = r.lines;
        if (r.m <= T.maxW) break;
        if (size <= 48) squash = T.maxW / r.m;
      }
      size = Math.max(size, 48);
      const cap = capHeight(ctx, T, size);
      const lineH = size * T.lineH;
      const blockH = cap + lineH * (lines.length - 1);
      const top = LAYOUT.captionY - blockH / 2;
      g.size = size; g.cap = cap; g.lines = lines.length; g.blockH = blockH; g.lineIdx = lines; g.space = space;
      lines.forEach((li, L) => {
        const lw = li.reduce((a, i) => a + widths[i], 0) + space * (li.length - 1);
        let x = CX - lw / 2;
        const base = top + cap + L * lineH;
        for (const i of li) {
          const w = g.words[i];
          w.cx = x + widths[i] / 2; w.base = base; w.w = widths[i];
          w.squash = squash;
          x += widths[i] + space;
        }
      });
    }
  }
  function findGroup(groups, t) {
    let lo = 0, hi = groups.length - 1, ans = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (groups[m].start - 0.04 <= t) { ans = m; lo = m + 1; } else hi = m - 1; }
    if (ans < 0) return null;
    const g = groups[ans];
    return t < g.end ? g : null;
  }
  // Each word is rendered once per look (white / accent / active-with-glow) into a sprite and then
  // blitted with its per-frame scale; the shadow blur is the expensive part, so this keeps captions cheap.
  function makeCanvas(w, h) { const c = new OffscreenCanvas(Math.max(1, Math.ceil(w)), Math.max(1, Math.ceil(h))); return c; }
  function wordSprite(S, g, i, look) {
    const key = g.idx + ':' + i + ':' + look;
    if (S.wordCache.group !== g.idx) { S.wordCache.clear(); S.wordCache.group = g.idx; }
    let sp = S.wordCache.get(key);
    if (sp) return sp;
    const T = S.type.caption, w = g.words[i], size = g.size;
    const rs = look === 'g' ? 1.1 : 1; // the active word lives at ~1.1x, so render it at that scale
    const pad = Math.ceil(size * 0.7);
    const sw = Math.ceil(w.w * rs + 2 * pad), sh = Math.ceil(size * 1.25 * rs + 2 * pad);
    const c = makeCanvas(sw, sh), x = c.getContext('2d');
    x.font = font(T, size); x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    x.translate(sw / 2, sh / 2); x.scale(rs, rs);
    const fill = look === 'w' ? '#ffffff' : S.pal.accent;
    drawOutlined(x, w.text, 0, g.cap / 2, size, fill, { stroke: T.stroke, glow: look === 'g' ? rgba(S.pal.accent, 0.9) : null });
    sp = { c, w: sw / rs, h: sh / rs };
    S.wordCache.set(key, sp);
    return sp;
  }
  function drawCaptions(ctx, S, t) {
    const g = findGroup(S.groups, t);
    if (!g) return;
    const age = t - (g.start - 0.04);
    const sp = spring(age, 15, 18);
    const settled = age > 0.6 || g.idx === 0; // frame 1 is often the thumbnail: first group fully drawn
    const gs = settled ? 1 : 0.84 + 0.16 * sp;
    const alpha = 1; // never dim: the entrance is a scale spring only
    const cy = LAYOUT.captionY;
    ctx.save();
    if (!settled) {
      ctx.translate(CX, cy + (1 - sp) * 26);
      ctx.scale(gs, gs);
      ctx.translate(-CX, -cy);
    }
    ctx.globalAlpha = alpha;
    const scales = new Array(g.words.length);
    for (let i = 0; i < g.words.length; i++) {
      const w = g.words[i];
      const nextS = i + 1 < g.words.length ? g.words[i + 1].s : Math.max(w.e + 0.25, Math.min(g.end, w.e + 0.6));
      const activeEnd = Math.min(nextS, w.e + 0.6);
      const active = t >= w.s && t < activeEnd;
      // pop: up ~16% in 120 ms (ease-out), settle to ~10% while spoken, relax in 90 ms after
      const amt = Math.min(1, 90 / Math.max(1, w.w)); // long words pop less so lines never overflow
      let pop = 0;
      if (active) {
        const dt = t - w.s;
        pop = 0.16 * easeOutCubic(dt / 0.12) - 0.06 * easeOutCubic((dt - 0.12) / 0.2);
      } else if (t >= activeEnd && t < activeEnd + 0.09) {
        pop = 0.1 - 0.1 * easeOutCubic((t - activeEnd) / 0.09);
      }
      scales[i] = { s: 1 + pop * amt, active };
    }
    // re-flow each line so the popped word pushes its neighbours instead of overlapping them
    for (const li of g.lineIdx) {
      const tot = li.reduce((a, i) => a + g.words[i].w * g.words[i].squash * scales[i].s, 0) + g.space * (li.length - 1);
      let x = CX - tot / 2;
      for (const i of li) { const ww = g.words[i].w * g.words[i].squash * scales[i].s; g.words[i].dx = x + ww / 2; x += ww + g.space; }
    }
    // draw non-active words first so the active word's glow sits on top
    const order = g.words.map((_, i) => i).sort((a, b) => scales[a].active - scales[b].active);
    for (const i of order) {
      const w = g.words[i], sc = scales[i].s, active = scales[i].active;
      const look = active ? 'g' : w.emph ? 'a' : 'w';
      const spr = wordSprite(S, g, i, look);
      const dw = spr.w * sc * w.squash, dh = spr.h * sc;
      let x = w.dx - dw / 2, y = w.base - g.cap / 2 - dh / 2;
      if (settled && sc === 1 && w.squash === 1) { x = Math.round(x); y = Math.round(y); }
      ctx.drawImage(spr.c, x, y, dw, dh);
    }
    ctx.restore();
  }

  // ------------------------------------------------------------------ hook (card + dock)
  function pickHighlight(hookToks, clip) {
    const cands = [];
    for (const e of clip.emphasis || []) cands.push(String(e).split(/\s+/).map(cleanTok).filter(Boolean));
    if (clip.topic) cands.push(String(clip.topic).split(/\s+/).map(cleanTok).filter(Boolean));
    const clean = hookToks.map(cleanTok);
    for (const p of cands) {
      if (!p.length) continue;
      for (let i = 0; i + p.length <= clean.length; i++) {
        let ok = true;
        for (let j = 0; j < p.length; j++) if (clean[i + j] !== p[j]) { ok = false; break; }
        if (ok) return new Set(p.map((_, j) => i + j));
      }
    }
    const d = clean.findIndex((x) => /\d/.test(x));
    return d >= 0 ? new Set([d]) : new Set();
  }
  // Greedy wrap at a fixed size into maxLines; drops trailing words (adding an ellipsis) when the text
  // does not fit, and squashes any single word wider than maxW.
  function truncWrap(ctx, T, size, toks, maxW, maxLines) {
    ctx.font = font(T, size);
    const space = ctx.measureText(' ').width;
    for (let n = toks.length; n >= 1; n--) {
      const words = toks.slice(0, n);
      if (n < toks.length) words[n - 1] = words[n - 1].replace(/[.,;:!?\u2026]*$/, '') + '\u2026';
      const widths = words.map((t) => Math.min(maxW, ctx.measureText(t).width));
      const lines = []; let cur = [], w = 0;
      widths.forEach((ww, i) => { const add = cur.length ? space + ww : ww; if (cur.length && w + add > maxW) { lines.push(cur); cur = [i]; w = ww; } else { cur.push(i); w += add; } });
      if (cur.length) lines.push(cur);
      if (lines.length <= maxLines || n === 1) {
        const sq = words.map((t) => Math.min(1, maxW / ctx.measureText(t).width));
        return { size, widths, space, lines: lines.slice(0, maxLines), lineH: size * T.lineH, cap: capHeight(ctx, T, size), disp: words, sq };
      }
    }
  }
  function layoutHook(ctx, S) {
    const clip = S.clip;
    if (!clip.hook) return null;
    const HT = S.type.hook;
    const toks = String(clip.hook).trim().split(/\s+/);
    const hl = pickHighlight(toks, clip);
    const disp = toks.map((t) => (HT.upper ? t.toUpperCase() : t));
    // big card: up to 3 lines at a big size; very long hooks may use 4-5 lines at smaller sizes;
    // beyond that the hook is truncated with an ellipsis (and any single huge word squashed).
    const cardInner = BOXW - 2 * 44;
    let card = null;
    for (let size = HT.size; size >= 44; size -= 2) {
      ctx.font = font(HT, size);
      const widths = disp.map((t) => ctx.measureText(t).width);
      const space = ctx.measureText(' ').width;
      const lines = wrapBalanced(widths, space, cardInner, size >= 64 ? 3 : size >= 52 ? 4 : 5);
      if (!lines) continue;
      const lineH = size * HT.lineH;
      if (lines.length * lineH > 440) continue;
      card = { size, widths, space, lines, lineH, cap: capHeight(ctx, HT, size), disp };
      break;
    }
    if (!card) card = truncWrap(ctx, HT, 44, disp, cardInner, 5);
    // docked: mixed case, smaller. Chip beside the text when that still fits in 2 lines at a good size,
    // otherwise chip stacked above the text (long topics like "AI CONSCIOUSNESS").
    const DT = S.type.dock;
    const dispD = toks.map((t) => (DT.upper ? t.toUpperCase() : t));
    const fitDock = (inner, minSize) => {
      // (returns null when it does not fit in 2 lines)
      for (let size = DT.size; size >= minSize; size -= 1) {
        ctx.font = font(DT, size);
        const widths = dispD.map((t) => ctx.measureText(t).width);
        const space = ctx.measureText(' ').width;
        const lines = wrapBalanced(widths, space, inner, 2);
        if (lines) return { size, widths, space, lines, lineH: size * DT.lineH, cap: capHeight(ctx, DT, size), disp: dispD };
      }
      return null;
    };
    let stacked = false;
    let dock = S.chip ? fitDock(BOXW - 2 * 24 - S.chip.w - 22, 40) : fitDock(BOXW - 2 * 24, DT.minSize);
    if (!dock && S.chip) { stacked = true; dock = fitDock(BOXW - 2 * 24, DT.minSize); }
    if (!dock) { // too long even for 2 full-width lines: truncate with an ellipsis
      stacked = !!S.chip;
      dock = truncWrap(ctx, DT, DT.minSize, dispD, BOXW - 2 * 24, 2);
    }
    dock.stacked = stacked;
    const chipW = S.chip && !stacked ? S.chip.w + 22 : 0;
    const chipH = S.chip ? S.chip.h : 0;
    // card geometry
    const textH = card.cap + card.lineH * (card.lines.length - 1);
    const padT = 46, padB = 52, chipGap = S.chip ? 30 : 0;
    const cardH = padT + chipH + chipGap + textH + padB;
    const cardY = Math.max(LAYOUT.dockY, LAYOUT.cardCenterY - cardH / 2);
    card.box = { x: SAFE.x0, y: cardY, w: BOXW, h: cardH };
    card.textTop = cardY + padT + chipH + chipGap;
    // dock geometry
    const dTextH = dock.cap + dock.lineH * (dock.lines.length - 1);
    const pad = 22;
    if (dock.stacked) {
      const dH = pad + chipH + 18 + dTextH + pad + 4;
      dock.box = { x: SAFE.x0, y: LAYOUT.dockY, w: BOXW, h: dH };
      dock.chipX = SAFE.x0 + 24; dock.chipY = LAYOUT.dockY + pad;
      dock.textX = SAFE.x0 + 24;
      dock.textTop = dock.chipY + chipH + 18;
    } else {
      const dH = Math.max(chipH, dTextH) + 2 * pad;
      dock.box = { x: SAFE.x0, y: LAYOUT.dockY, w: BOXW, h: dH };
      dock.chipX = SAFE.x0 + 24; dock.chipY = LAYOUT.dockY + (dH - chipH) / 2;
      dock.textX = SAFE.x0 + 24 + chipW;
      dock.textTop = LAYOUT.dockY + (dH - dTextH) / 2;
    }
    return { toks, disp, dispD, hl, card, dock };
  }
  function glassPanel(ctx, b, r, pal, strength) {
    ctx.save();
    roundRect(ctx, b.x, b.y, b.w, b.h, r);
    const g = ctx.createLinearGradient(0, b.y, 0, b.y + b.h);
    g.addColorStop(0, `rgba(14,16,28,${0.78 * strength})`);
    g.addColorStop(1, `rgba(8,9,16,${0.62 * strength})`);
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = `rgba(255,255,255,${0.16 * strength})`; ctx.stroke();
    // accent hairline along the top edge
    ctx.clip();
    const hg = ctx.createLinearGradient(b.x, 0, b.x + b.w, 0);
    hg.addColorStop(0, rgba(pal.accent, 0)); hg.addColorStop(0.5, rgba(pal.accent, 0.85 * strength)); hg.addColorStop(1, rgba(pal.accent2, 0));
    ctx.fillStyle = hg; ctx.fillRect(b.x, b.y, b.w, 3);
    const rg = ctx.createRadialGradient(b.x + b.w / 2, b.y, 0, b.x + b.w / 2, b.y, b.w * 0.6);
    rg.addColorStop(0, rgba(pal.accent, 0.13 * strength)); rg.addColorStop(1, rgba(pal.accent, 0));
    ctx.fillStyle = rg; ctx.fillRect(b.x, b.y, b.w, b.h);
    ctx.restore();
  }
  function drawChip(ctx, S, x, y, alpha) {
    const c = S.chip; if (!c) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    roundRect(ctx, x, y, c.w, c.h, c.h / 2);
    ctx.fillStyle = S.pal.accent; ctx.fill();
    ctx.fillStyle = '#05060b';
    ctx.font = font(S.type.chip, c.size);
    ctx.letterSpacing = '2px';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(c.text, x + c.padX, y + c.h / 2 + c.cap / 2);
    ctx.restore();
  }
  function drawHookLines(ctx, S, L, x0, top, centered, alpha) {
    const HT = L === S.hook.card ? S.type.hook : S.type.dock;
    ctx.font = font(HT, L.size);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    L.lines.forEach((li, k) => {
      const lw = li.reduce((a, i) => a + L.widths[i], 0) + L.space * (li.length - 1);
      let x = centered ? CX - lw / 2 : x0;
      const base = top + L.cap + k * L.lineH;
      for (const i of li) {
        const on = S.hook.hl.has(i);
        const sq = L.sq ? L.sq[i] : 1;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = L.size * 0.25; ctx.shadowOffsetY = L.size * 0.05;
        ctx.fillStyle = on ? S.pal.accent : '#ffffff';
        ctx.translate(x, base); ctx.scale(sq, 1);
        ctx.fillText(L.disp[i], 0, 0);
        ctx.restore();
        x += L.widths[i] + L.space;
      }
    });
  }
  function drawCard(ctx, S, alpha, scale, dx, dy) {
    const L = S.hook.card, b = L.box;
    ctx.save();
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    ctx.translate(cx + dx, cy + dy); ctx.scale(scale, scale); ctx.translate(-cx, -cy);
    ctx.globalAlpha = alpha;
    glassPanel(ctx, b, 40, S.pal, 1);
    if (S.chip) drawChip(ctx, S, CX - S.chip.w / 2, b.y + 46, alpha);
    drawHookLines(ctx, S, L, 0, L.textTop, true, alpha);
    ctx.restore();
  }
  function drawDock(ctx, S, alpha, dy) {
    const L = S.hook ? S.hook.dock : null;
    ctx.save();
    ctx.translate(0, dy);
    if (L) {
      ctx.globalAlpha = alpha;
      glassPanel(ctx, L.box, 26, S.pal, 1);
      if (S.chip) drawChip(ctx, S, L.chipX, L.chipY, alpha);
      drawHookLines(ctx, S, L, L.textX, L.textTop, false, alpha);
    } else if (S.chip) {
      drawChip(ctx, S, 60, LAYOUT.dockY, alpha);
    }
    ctx.restore();
  }
  // Card and dock are static, so each is rendered once into a sprite and blitted (crisp at 1:1).
  function buildHookSprites(S) {
    const m = 60;
    const mk = (box, fn) => {
      const c = makeCanvas(box.w + 2 * m, box.h + 2 * m), x = c.getContext('2d');
      x.translate(m - box.x, m - box.y); fn(x);
      return { c, x: box.x - m, y: box.y - m, w: box.w + 2 * m, h: box.h + 2 * m };
    };
    if (S.hook) {
      S.cardSprite = mk(S.hook.card.box, (x) => drawCard(x, S, 1, 1, 0, 0));
      S.dockSprite = mk(S.hook.dock.box, (x) => drawDock(x, S, 1, 0));
    } else if (S.chip) {
      S.dockSprite = mk({ x: SAFE.x0, y: LAYOUT.dockY, w: S.chip.w, h: S.chip.h }, (x) => drawDock(x, S, 1, 0));
    }
  }
  function blit(ctx, sp, alpha, scale, dy) {
    if (!sp || alpha <= 0.002) return;
    ctx.save();
    ctx.globalAlpha = clamp(alpha);
    if (scale === 1 && dy === 0) ctx.drawImage(sp.c, sp.x, sp.y);
    else {
      const cx = sp.x + sp.w / 2, cy = sp.y + sp.h / 2 + dy;
      ctx.drawImage(sp.c, cx - (sp.w * scale) / 2, cy - (sp.h * scale) / 2, sp.w * scale, sp.h * scale);
    }
    ctx.restore();
  }
  function drawHook(ctx, S, t) {
    const T0 = LAYOUT.hookSec, M = LAYOUT.hookMorph;
    if (!S.hook) { blit(ctx, S.dockSprite, 1, 1, 0); return; }
    if (t < T0) { blit(ctx, S.cardSprite, 1, 1, 0); return; }
    const p = (t - T0) / M;
    if (p < 1) {
      const e = easeInOutCubic(p);
      const c = S.hook.card.box, d = S.hook.dock.box;
      const sc = lerp(1, (d.h / c.h) * 1.2, e);
      const dy = lerp(0, (d.y + d.h / 2) - (c.y + c.h / 2), e);
      blit(ctx, S.cardSprite, 1 - smooth(p / 0.5), sc, dy);
      const q = (p - 0.42) / 0.58;
      blit(ctx, S.dockSprite, smooth(q), 1, q >= 1 ? 0 : (1 - easeOutCubic(q)) * 16);
      return;
    }
    blit(ctx, S.dockSprite, 1, 1, 0);
  }

  // ------------------------------------------------------------------ credit
  function layoutCredit(ctx, S) {
    const c = S.clip.credit || {};
    const T1 = S.type.credit1, T2 = S.type.credit2;
    const x = 136, maxW = SAFE.x1 - x;
    const lines = [];
    if (c.show) lines.push({ T: T1, ...fitText(ctx, String(c.show), T1, 36, 30, maxW), color: 'rgba(255,255,255,0.96)' });
    const ep = c.episode ? String(c.episode) : '', sp = c.speakers ? String(c.speakers) : '';
    const both = [ep, sp].filter(Boolean).join('  ·  ');
    if (both) {
      ctx.font = font(T2, 31);
      if (ctx.measureText(both).width <= maxW) lines.push({ T: T2, text: both, size: 31, color: 'rgba(255,255,255,0.80)' });
      else {
        if (ep) lines.push({ T: T2, ...fitText(ctx, ep, T2, 31, 30, maxW), color: 'rgba(255,255,255,0.80)' });
        if (sp) lines.push({ T: T2, ...fitText(ctx, sp, T2, 31, 30, maxW), color: 'rgba(255,255,255,0.80)' });
      }
    }
    const gap = 12;
    let y = LAYOUT.creditBottom;
    for (let i = lines.length - 1; i >= 0; i--) {
      const l = lines[i];
      l.base = y;
      l.cap = capHeight(ctx, l.T, l.size);
      y -= l.cap + gap + (i > 0 ? (lines[i - 1].size - lines[i - 1].size * 0.72) : 0) + 8;
    }
    const top = lines.length ? lines[0].base - lines[0].cap : LAYOUT.creditBottom;
    return { x, lines, top, mid: (top + LAYOUT.creditBottom) / 2 };
  }
  function drawMic(ctx, x, y, s, color) {
    // simple studio mic: capsule, cradle, stem, base. (x, y) = centre.
    ctx.save();
    ctx.translate(x, y); ctx.scale(s / 40, s / 40);
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = 3.2; ctx.lineCap = 'round';
    roundRect(ctx, -7, -17, 14, 22, 7); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -3, 12, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 9); ctx.lineTo(0, 16); ctx.moveTo(-7, 17); ctx.lineTo(7, 17); ctx.stroke();
    ctx.restore();
  }
  function drawCredit(ctx, S, t) {
    const C = S.credit; if (!C.lines.length) return;
    const pal = S.pal;
    const cy = C.mid;
    ctx.save();
    // disc behind the mic, breathing very slightly with the voice
    const e = S.A.env(t);
    ctx.beginPath(); ctx.arc(92, cy, 32, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(10,12,20,0.6)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = rgba(pal.accent, 0.45 + 0.4 * e); ctx.stroke();
    if (S.layers && S.layers.creditGlyph) S.layers.creditGlyph(ctx, S, 92, cy + 1, 38, pal.accent, t);
    else drawMic(ctx, 92, cy + 1, 38, pal.accent);
    ctx.restore();
    if (!C.sprite) {
      const top = Math.floor(C.top - 30), c = makeCanvas(W - C.x + 20, LAYOUT.creditBottom + 30 - top), x = c.getContext('2d');
      x.translate(-(C.x - 20), -top);
      x.textAlign = 'left'; x.textBaseline = 'alphabetic';
      for (const l of C.lines) {
        x.font = font(l.T, l.size);
        x.shadowColor = 'rgba(0,0,0,0.85)'; x.shadowBlur = 10; x.shadowOffsetY = 2;
        x.fillStyle = l.color;
        x.fillText(l.text, C.x, l.base);
      }
      C.sprite = { c, x: C.x - 20, y: top };
    }
    ctx.drawImage(C.sprite.c, C.sprite.x, C.sprite.y);
  }

  // ------------------------------------------------------------------ progress + overlay
  function drawProgress(ctx, S, t) {
    const k = clamp(t / S.clip.duration);
    const x = SAFE.x0, w = SAFE.x1 - SAFE.x0, y = LAYOUT.progressY, h = LAYOUT.progressH;
    ctx.save();
    roundRect(ctx, x, y, w, h, h / 2); ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fill();
    if (k > 0) {
      const g = ctx.createLinearGradient(x, 0, x + w, 0);
      g.addColorStop(0, S.pal.accent2); g.addColorStop(1, S.pal.accent);
      roundRect(ctx, x, y, Math.max(h, w * k), h, h / 2); ctx.fillStyle = g; ctx.fill();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glow(S.pal.accent), x + w * k, y + h / 2, 22, 0.8);
    }
    ctx.restore();
  }
  function buildOverlay(S) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    const lin = (y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, a]) => gr.addColorStop(o, `rgba(0,0,0,${a})`)); g.fillStyle = gr; g.fillRect(0, y0, W, y1 - y0); };
    lin(0, 460, [[0, 0.62], [0.55, 0.22], [1, 0]]);
    lin(900, 1600, [[0, 0], [0.25, 0.36], [0.6, 0.44], [1, 0.5]]);
    lin(1600, H, [[0, 0.48], [1, 0.62]]);
    const v = g.createRadialGradient(W / 2, 860, 420, W / 2, 860, 1300);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.6)');
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    return c;
  }

  // ------------------------------------------------------------------ shared focal elements
  // Audio-reactive hero shapes styles can put in the empty middle band (y ~650-1000).
  // Oscilloscope-like signal line: displacement travels outward from the centre with a delay, so the
  // line reads as the voice "propagating". Draws additively (call inside a 'lighter' section).
  function drawSignalLine(ctx, S, t, o) {
    const A = S.A, cx = o.cx, y0 = o.y, half = o.half || 470, amp = o.amp || 120;
    const pts = [];
    for (let x = cx - half; x <= cx + half; x += 8) {
      const d = Math.abs(x - cx) / half;
      const bell = Math.pow(1 - d, 1.6);
      const v = A.raw(Math.max(0, t - d * 0.45));
      const y = y0 + amp * bell * (0.15 + v) * (Math.sin(x * 0.045 - t * 9) * 0.6 + Math.sin(x * 0.017 + t * 4.3) * 0.4);
      pts.push(x, y);
    }
    const stroke = (w, col) => { ctx.beginPath(); for (let i = 0; i < pts.length; i += 2) (i ? ctx.lineTo : ctx.moveTo).call(ctx, pts[i], pts[i + 1]); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke(); };
    const e = A.env(t);
    drawGlow(ctx, glow(o.color, 0.25), cx, y0, 260 + 140 * e, 0.35 + 0.45 * e);
    stroke(26, rgba(o.color, 0.10 + 0.12 * e));
    stroke(10, rgba(o.color, 0.22 + 0.25 * e));
    stroke(3.5, rgba(o.core || '#ffffff', 0.75 + 0.25 * e));
  }
  // Circular waveform ring with a breathing core.
  function drawWaveRing(ctx, S, t, o) {
    const A = S.A, cx = o.cx, cy = o.cy, R = o.R;
    const e = A.env(t);
    drawGlow(ctx, glow(o.color, 0.22), cx, cy, R * (2.2 + 0.6 * e), 0.35 + 0.4 * e);
    drawGlow(ctx, glow(o.color2 || o.color, 0.4), cx, cy, R * (0.55 + 0.35 * e), 0.5 + 0.5 * e);
    for (let layer = 0; layer < 3; layer++) {
      ctx.beginPath();
      const n = 150;
      for (let i = 0; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const m = Math.abs(((i + layer * 25) % n) - n / 2) / (n / 2);
        const v = A.raw(Math.max(0, t - m * 0.5));
        const wob = Math.sin(a * 5 + t * 2.6 + layer * 2.1) * 0.65 + Math.sin(a * 8 - t * 3.1 + layer) * 0.35;
        const rr = R * (1 + layer * 0.09) + (6 + 34 * v) * wob;
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.lineWidth = layer === 0 ? 4 : 2.2;
      ctx.strokeStyle = rgba(layer === 1 ? (o.color2 || o.color) : layer === 0 ? '#ffffff' : o.color, layer === 0 ? 0.55 + 0.4 * e : 0.35 + 0.35 * e);
      ctx.stroke();
    }
  }

  // ------------------------------------------------------------------ type presets
  const TYPE = {
    montserrat: { family: 'Montserrat', weight: 900, size: 92, minSize: 84, upper: true, stroke: 0.17, lineH: 1.12, lineChars: 15, groupChars: 26, maxW: LAYOUT.captionMaxW },
    anton: { family: 'Anton', weight: 400, size: 110, minSize: 96, upper: true, stroke: 0.15, lineH: 1.0, lineChars: 18, groupChars: 30, maxW: LAYOUT.captionMaxW },
    montserratMixed: { family: 'Montserrat', weight: 900, size: 96, minSize: 84, upper: false, stroke: 0.17, lineH: 1.12, lineChars: 17, groupChars: 28, maxW: LAYOUT.captionMaxW },
  };
  const HOOKTYPE = {
    montserrat: { family: 'Montserrat', weight: 900, size: 108, upper: true, lineH: 1.04 },
    anton: { family: 'Anton', weight: 400, size: 136, upper: true, lineH: 1.02 },
  };
  const DOCK = { family: 'Montserrat', weight: 800, size: 44, minSize: 34, upper: false, lineH: 1.16 };
  const CHIP = { family: 'Inter', weight: 700 };
  const CREDIT1 = { family: 'Inter', weight: 700 }, CREDIT2 = { family: 'Inter', weight: 500 };

  // ------------------------------------------------------------------ boot
  const STYLES = [];
  function registerStyle(s) { STYLES.push(s); }

  async function loadFonts() {
    const faces = ['800 40px "Montserrat"', '900 40px "Montserrat"', '400 40px "Anton"', '500 40px "Inter"', '700 40px "Inter"'];
    await Promise.all(faces.map((f) => document.fonts.load(f, 'AaZz09')));
    await document.fonts.ready;
    const missing = faces.filter((f) => !document.fonts.check(f, 'AaZz09'));
    if (missing.length) throw new Error('fonts failed to load: ' + missing.join(', '));
  }

  // Optional background video (clip.background.frames, set up by render.mjs): pre-extracted JPEG frames
  // served by the local server. Frame i is fetched + decoded before painting time t (grabFrame awaits it).
  function makeBgVideo(fr) {
    const V = { fps: fr.fps || 30, count: fr.count | 0, url: fr.url, idx: -1, bmp: null };
    V.index = (t) => clamp(Math.round(t * V.fps), 0, V.count - 1);
    V.load = async (t) => {
      const i = V.index(t);
      if (i === V.idx && V.bmp) return;
      const r = await fetch(V.url + String(i + 1).padStart(6, '0') + '.jpg');
      if (!r.ok) throw new Error('background frame ' + i + ' failed: ' + r.status);
      const bmp = await createImageBitmap(await r.blob());
      if (V.bmp) V.bmp.close();
      V.bmp = bmp; V.idx = i;
    };
    return V;
  }
  // Extra readability scrim over a (photographic) video background: header/card band and caption band.
  function buildVideoScrim() {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    const lin = (y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, a]) => gr.addColorStop(o, `rgba(0,0,0,${a})`)); g.fillStyle = gr; g.fillRect(0, y0, W, y1 - y0); };
    g.fillStyle = 'rgba(0,0,0,0.14)'; g.fillRect(0, 0, W, H);
    lin(0, 560, [[0, 0.42], [0.7, 0.16], [1, 0]]);
    lin(960, 1620, [[0, 0], [0.18, 0.34], [0.5, 0.46], [1, 0.4]]);
    return c;
  }

  // opts (all optional; ai-shorts passes none): { setup(S, ctx) -> called after the core layouts are built,
  // may set S.layers = { mid(ctx, S, t, cover), creditGlyph(ctx, S, x, y, size, color, t),
  // skipBackground(t, cover) -> true when mid paints the whole frame } and S.info;
  // sample: preview fixture path }
  async function boot(opts = {}) {
    try {
      let clip = window.__CLIP__;
      const preview = !clip;
      if (!clip) clip = await (await fetch(opts.sample || '../../sample/clip.json')).json(); // open index.html?preview in a browser
      clip.fps = clip.fps || 30;
      clip.words = Array.isArray(clip.words) ? clip.words : [];
      if (!clip.duration) clip.duration = clip.words.length ? clip.words[clip.words.length - 1].e + 0.5 : 60;
      await loadFonts();
      // Frames are drawn on an OffscreenCanvas (no page compositing per frame) and encoded straight
      // to JPEG/PNG by grabFrame(); the visible <canvas> only mirrors it for previews/screenshots.
      const screen = document.getElementById('c');
      const screenCtx = screen.getContext('2d', { alpha: false });
      const canvas = new OffscreenCanvas(W, H);
      const ctx = canvas.getContext('2d', { alpha: false });
      const theme = clip.theme || {};
      const seed = (theme.seed != null ? theme.seed : hashStr(String(clip.id || clip.hook || 'clip'))) >>> 0;
      const pick = mulberry32(seed ^ 0xa5a5a5a5);
      pick(); // decorrelate
      let style = STYLES.find((s) => s.name === theme.style);
      if (!style) style = STYLES[Math.floor(pick() * STYLES.length)];
      const palIdx = theme.palette != null ? Math.abs(theme.palette | 0) % style.palettes.length : Math.floor(pick() * style.palettes.length);
      const pal = Object.assign({}, style.palettes[palIdx]);
      if (theme.accent) pal.accent = theme.accent;
      const typeKey = style.caption || 'montserrat';
      const S = {
        W, H, SAFE, LAYOUT, clip, seed, pal, style: style.name,
        rng: mulberry32(seed ^ hashStr(style.name)),
        A: makeAudio(clip.envelope, clip.fps, clip.duration),
        type: {
          caption: TYPE[typeKey] || TYPE.montserrat,
          hook: HOOKTYPE[style.hook || 'montserrat'],
          dock: DOCK, chip: CHIP, credit1: CREDIT1, credit2: CREDIT2,
        },
      };
      if (clip.topic) {
        let text = String(clip.topic).toUpperCase().trim();
        if (text.length > 20) { const cut = text.slice(0, 20); text = (cut.lastIndexOf(' ') > 6 ? cut.slice(0, cut.lastIndexOf(' ')) : cut.slice(0, 19)) + '\u2026'; }
        ctx.font = font(CHIP, 30); ctx.letterSpacing = '2px';
        const w = ctx.measureText(text).width; ctx.letterSpacing = '0px';
        S.chip = { text, size: 30, w: w + 2 * 22, h: 52, padX: 22, cap: capHeight(ctx, CHIP, 30) };
      }
      const emph = markEmphasis(clip.words, clip.emphasis);
      S.groups = buildGroups(ctx, clip.words, emph, S.type.caption);
      layoutGroups(ctx, S.groups, S.type.caption);
      S.hook = layoutHook(ctx, S);
      S.credit = layoutCredit(ctx, S);
      S.overlay = buildOverlay(S);
      S.wordCache = new Map();
      buildHookSprites(S);
      S.layers = {};
      if (clip.background && clip.background.frames && clip.background.frames.count > 0) {
        S.bgVideo = makeBgVideo(clip.background.frames);
        S.videoScrim = buildVideoScrim();
      }
      if (opts.setup) await opts.setup(S, ctx); // may be async (e.g. loading scene modules)
      style.init && style.init(S);
      // Backgrounds are drawn at reduced resolution (style.scale, default 0.5) and upscaled: the
      // software rasteriser's cost is per pixel, and soft glows/thin lines lose nothing visible behind
      // full-resolution type. Styles always draw in 1080x1920 coordinates.
      const bgScale = style.scale || 0.5;
      const bg = new OffscreenCanvas(Math.round(W * bgScale), Math.round(H * bgScale));
      const bgCtx = bg.getContext('2d', { alpha: false });

      let prof = null;
      const mark = (name) => { if (!prof) return; ctx.getImageData(0, 0, 1, 1); bgCtx.getImageData(0, 0, 1, 1); const n = performance.now(); prof[name] = +(n - prof._t).toFixed(2); prof._t = n; };
      const paint = (t, cover) => {
        if (S.layers.skipBackground && S.layers.skipBackground(t, cover)) {
          // a template layer (e.g. a full-frame scene) covers the whole frame: skip the generative style
          ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
          ctx.fillStyle = '#05060b'; ctx.fillRect(0, 0, W, H);
          mark('background');
        } else if (S.bgVideo && S.bgVideo.bmp) {
          ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
          ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'medium';
          ctx.drawImage(S.bgVideo.bmp, 0, 0, W, H);
          mark('background');
        } else {
          bgCtx.setTransform(bgScale, 0, 0, bgScale, 0, 0);
          bgCtx.globalAlpha = 1; bgCtx.globalCompositeOperation = 'source-over';
          bgCtx.save();
          style.draw(bgCtx, S, t);
          bgCtx.restore();
          mark('background');
          ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
          ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'low';
          ctx.drawImage(bg, 0, 0, W, H);
          mark('upscale');
        }
        ctx.drawImage(S.overlay, 0, 0);
        if (S.videoScrim) ctx.drawImage(S.videoScrim, 0, 0);
        mark('overlay');
        if (S.layers.mid) { ctx.save(); S.layers.mid(ctx, S, t, cover); ctx.restore(); mark('mid'); }
        if (cover) {
          if (S.hook) blit(ctx, S.cardSprite, 1, 1.04, 40); else blit(ctx, S.dockSprite, 1, 1, 0);
        } else {
          drawProgress(ctx, S, t);
          mark('progress');
          drawHook(ctx, S, t);
          mark('hook');
          drawCaptions(ctx, S, t);
          mark('captions');
        }
        drawCredit(ctx, S, t);
        mark('credit');
      };
      // debug: per-layer cost in ms (forces a raster flush between layers)
      window.profileFrame = (t) => { prof = { _t: performance.now() }; const t0 = prof._t; paint(t, false); const r = prof; prof = null; delete r._t; r.total = +(performance.now() - t0).toFixed(2); return r; };
      const present = () => screenCtx.drawImage(canvas, 0, 0);
      const coverTime = () => {
        // background moment for the cover: the loudest point of the first 12 s, so the visual is lit up
        let best = 1.5, bv = -1;
        for (let t = 0.5; t < Math.min(12, clip.duration); t += 1 / clip.fps) { const v = S.A.env(t); if (v > bv) { bv = v; best = t; } }
        return best;
      };
      const encode = async (type, quality) => {
        const blob = await canvas.convertToBlob({ type: type === 'png' ? 'image/png' : 'image/jpeg', quality });
        const url = await new Promise((res, rej) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.onerror = rej; fr.readAsDataURL(blob); });
        return url.slice(url.indexOf(',') + 1);
      };
      window.renderFrame = (t) => { paint(Math.max(0, t), false); present(); };
      window.renderCover = () => { paint(coverTime(), true); present(); };
      // render.mjs path: paint + encode in-page, return base64 (t < 0 means "cover")
      // With postUrl the encoded bytes are POSTed (binary) to render.mjs's local server instead of
      // being returned as base64 over CDP, which is much cheaper for 1080x1920 frames.
      window.grabFrame = async (t, type = 'jpeg', quality = 0.92, postUrl = null) => {
        if (S.bgVideo) await S.bgVideo.load(t < 0 ? coverTime() : Math.max(0, t));
        if (t < 0) paint(coverTime(), true); else paint(t, false);
        if (!postUrl) return encode(type, quality);
        const blob = await canvas.convertToBlob({ type: type === 'png' ? 'image/png' : 'image/jpeg', quality });
        const r = await fetch(postUrl, { method: 'POST', body: blob });
        if (!r.ok) throw new Error('frame upload failed: ' + r.status);
        return blob.size;
      };
      window.__INFO = Object.assign({ style: style.name, palette: palIdx, seed, bgScale, groups: S.groups.length, styles: STYLES.map((s) => s.name) },
        S.bgVideo ? { background: 'video:' + S.bgVideo.count + 'f' } : {}, S.info || {});
      window.__S = S;
      window.__READY = true;
      if (preview) {
        const t0 = performance.now();
        const loop = () => { window.renderFrame(((performance.now() - t0) / 1000) % clip.duration); requestAnimationFrame(loop); };
        requestAnimationFrame(loop);
      }
    } catch (e) {
      window.__ERROR = String((e && e.stack) || e);
      console.error(window.__ERROR);
    }
  }

  window.CLIPKIT = {
    W, H, SAFE, LAYOUT, registerStyle, boot,
    mulberry32, hashStr, hash2, clamp, lerp, smooth, fract, easeOutCubic, easeInOutCubic, spring,
    rgba, mixHex, hexRgb, glow, drawGlow, roundRect, drawSignalLine, drawWaveRing,
    // shared text/panel helpers for other templates (e.g. ai-explainer)
    font, capHeight, fitText, wrapBalanced, drawOutlined, glassPanel, makeCanvas, cleanTok, TYPE, HOOKTYPE,
  };
})();
