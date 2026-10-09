/* ai-explainer: beat visuals for original narrated explainers.
 * Runs on top of the ai-shorts engine (core.js): same hook card -> dock, captions, credit and progress bar.
 * Adds, through CLIPKIT.boot({ setup }):
 *   - a dimmer over the background so the beat visuals read clearly,
 *   - the beat band (glass card, x 60-915, y 520-1000) showing clip.beats[i].visual between t0 and t1
 *     (spring in ~300 ms at t0, out ~200 ms before t1), types: title, stat, compare, list, quote, timeline, keyword,
 *   - an optional per-beat disclosure chip (beats[i].label, e.g. "AI-generated illustration") at y 1008-1046,
 *   - an "AI narrator" glyph (voice bars) in place of the podcast mic in the credit,
 *   - "scene" visuals: per-story ES modules (README "Authoring a scene"), full-frame (default; replaces the
 *     background, may span several beats, crossfades 350 ms) or in the band; kit.js is their illustration kit.
 * Everything is a pure function of t (no state between frames). All text is shrink-to-fit inside the card.
 */
(function () {
  'use strict';
  const K = window.CLIPKIT;
  const { clamp, lerp, smooth, easeOutCubic, spring, rgba, roundRect, font, capHeight, glow, drawGlow, cleanTok } = K;

  const BAND = { x0: 60, x1: 915, y0: 520, y1: 1000 };
  const BW = BAND.x1 - BAND.x0, BCX = (BAND.x0 + BAND.x1) / 2, BCY = (BAND.y0 + BAND.y1) / 2;
  const PADX = 48, PADY = 40;
  const IW = BW - 2 * PADX;                       // inner width of the card
  const IH = BAND.y1 - BAND.y0 - 2 * PADY;        // max inner height of the card
  const LABEL_Y = 1008;                           // disclosure chip (captions start at ~1050 at the earliest)
  const T_IN = 0.3, T_OUT = 0.2;
  const F = {
    heavy: { family: 'Montserrat', weight: 900 },
    bold: { family: 'Montserrat', weight: 800 },
    anton: { family: 'Anton', weight: 400 },
    ui: { family: 'Inter', weight: 700 },
    uiR: { family: 'Inter', weight: 500 },
  };
  const WHITE = '#ffffff';

  // ------------------------------------------------------------------ text layout
  // Shrink-to-fit text block: largest size (step 2) whose balanced wrap fits maxW x maxH in maxLines.
  // Emergency fallback: min size, greedy wrap, then a uniform scale so it can never overflow.
  function block(ctx, text, T, o) {
    const raw = String(text == null ? '' : text).trim().split(/\s+/).filter(Boolean);
    const toks = o.upper ? raw.map((s) => s.toUpperCase()) : raw;
    const desc = o.upper ? 0 : 0.22; // room for descenders in mixed case
    const make = (size, lines, widths, space) => {
      const lineH = size * o.lineH, cap = capHeight(ctx, T, size);
      const lw = lines.map((li) => li.reduce((a, i) => a + widths[i], 0) + space * (li.length - 1));
      const h = cap + lineH * (lines.length - 1) + size * desc;
      return { T, toks, raw, size, lines, widths, space, lineH, cap, lw, w: Math.max(0, ...lw), h, scale: 1 };
    };
    if (!toks.length) return make(o.min, [], [], 0);
    for (let size = o.max; size >= o.min; size -= 2) {
      ctx.font = font(T, size);
      const widths = toks.map((s) => ctx.measureText(s).width), space = ctx.measureText(' ').width;
      const lines = K.wrapBalanced(widths, space, o.maxW, o.maxLines);
      if (!lines) continue;
      const B = make(size, lines, widths, space);
      if (B.h <= o.maxH) return B;
    }
    ctx.font = font(T, o.min);
    const widths = toks.map((s) => ctx.measureText(s).width), space = ctx.measureText(' ').width;
    const lines = []; let cur = [], w = 0;
    widths.forEach((ww, i) => { const add = cur.length ? space + ww : ww; if (cur.length && w + add > o.maxW) { lines.push(cur); cur = [i]; w = ww; } else { cur.push(i); w += add; } });
    if (cur.length) lines.push(cur);
    const B = make(o.min, lines, widths, space);
    B.scale = Math.min(1, o.maxW / B.w, o.maxH / B.h);
    B.w *= B.scale; B.h *= B.scale;
    return B;
  }
  // Draw a block with its top-left/centre at (x, top). style(i, L) -> { color, alpha, dy } per word.
  function drawBlock(ctx, B, x, top, align, style) {
    if (!B.lines.length) return;
    ctx.save();
    ctx.translate(x, top); ctx.scale(B.scale, B.scale);
    ctx.font = font(B.T, B.size);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const a0 = ctx.globalAlpha;
    B.lines.forEach((li, L) => {
      let xx = align === 'center' ? -B.lw[L] / 2 : 0;
      const base = B.cap + L * B.lineH;
      for (const i of li) {
        const st = style ? style(i, L) : null;
        const al = st && st.alpha != null ? st.alpha : 1;
        if (al > 0.003) {
          ctx.globalAlpha = a0 * al;
          ctx.fillStyle = (st && st.color) || WHITE;
          ctx.fillText(B.toks[i], xx, base + ((st && st.dy) || 0));
        }
        xx += B.widths[i] + B.space;
      }
    });
    ctx.restore();
  }
  function fitLine(ctx, text, T, max, min, maxW) {
    const r = K.fitText(ctx, String(text), T, max, min, maxW);
    ctx.font = font(T, r.size);
    return { T, text: r.text, size: r.size, w: ctx.measureText(r.text).width, cap: capHeight(ctx, T, r.size) };
  }
  function drawLine(ctx, L, x, base, align, color) {
    ctx.font = font(L.T, L.size); ctx.textAlign = align || 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = color || WHITE; ctx.fillText(L.text, x, base);
  }
  // Accent words: visual.accent (word/phrase) if given, else the first clip.emphasis phrase found in the text.
  function accentSet(rawToks, visual, clip) {
    const clean = rawToks.map(cleanTok);
    const cands = [];
    if (visual.accent) cands.push(visual.accent);
    else for (const e of clip.emphasis || []) cands.push(e);
    for (const c of cands) {
      const p = String(c).split(/\s+/).map(cleanTok).filter(Boolean);
      if (!p.length) continue;
      for (let i = 0; i + p.length <= clean.length; i++) {
        let ok = true;
        for (let j = 0; j < p.length; j++) if (clean[i + j] !== p[j]) { ok = false; break; }
        if (ok) return new Set(p.map((_, j) => i + j));
      }
    }
    return new Set();
  }

  // ------------------------------------------------------------------ numbers
  // "40%", "$100B", "2,000,000", "3x", "1.5 million", "~$2.5T" -> prefix + number + suffix, counted up
  // keeping the original formatting (comma grouping, decimals). Anything else ("GPT-5", "2-3x") is static.
  function parseStat(s) {
    s = String(s == null ? '' : s).trim();
    const m = s.match(/^([^0-9]*?)(\d{1,3}(?:,\d{3})+|\d+)(\.\d+)?(.*)$/);
    if (!m) return { text: s, animate: false };
    const pre = m[1], int = m[2], dec = m[3] || '', suf = m[4];
    return {
      text: s, pre, suf, value: parseFloat(int.replace(/,/g, '') + dec), decimals: dec ? dec.length - 1 : 0,
      commas: int.includes(','), animate: /^[^A-Za-z0-9]{0,3}$/.test(pre) && !/\d/.test(suf),
    };
  }
  function groupInt(str) { return str.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function fmtStat(P, k) {
    if (!P.animate || k >= 1) return P.text;
    let n = (P.value * clamp(k)).toFixed(P.decimals);
    if (P.commas) { const [i, d] = n.split('.'); n = groupInt(i) + (d ? '.' + d : ''); }
    return P.pre + n + P.suf;
  }
  // compact value for bars: 8,000 / 250K / 2M / 1.5B / 0.4 ($0.40)
  // dec (optional) forces the decimals of the plain branches, so a count-up keeps the final value's format.
  function fmtVal(v, pre, dec) {
    const a = Math.abs(v);
    const tr = (x) => String(parseFloat(x.toFixed(Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2)));
    if (dec != null && a < 1e5) return (pre || '') + groupInt(v.toFixed(dec).split('.')[0]) + (dec ? '.' + v.toFixed(dec).split('.')[1] : '');
    let s;
    if (a >= 1e12) s = tr(v / 1e12) + 'T';
    else if (a >= 1e9) s = tr(v / 1e9) + 'B';
    else if (a >= 1e6) s = tr(v / 1e6) + 'M';
    else if (a >= 1e5) s = tr(v / 1e3) + 'K';
    else if (a >= 100 || Number.isInteger(v)) s = groupInt(String(Math.round(v)));
    else s = /\$|€|£/.test(pre || '') ? v.toFixed(2) : tr(v);
    return (pre || '') + s;
  }
  // Digits in fixed-width slots so a count-up does not jitter sideways.
  function numChars(ctx, T, size, str, dw) {
    ctx.font = font(T, size);
    return [...str].map((c) => ({ c, w: /\d/.test(c) ? dw : ctx.measureText(c).width }));
  }
  function digitW(ctx, T, size) { ctx.font = font(T, size); return Math.max(...'0123456789'.split('').map((c) => ctx.measureText(c).width)); }

  // ------------------------------------------------------------------ icons
  function drawCheck(ctx, cx, cy, r, k, color, ring) {
    // ring + check mark drawn progressively (k 0..1)
    ctx.save();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = rgba(ring, 0.14); ctx.fill();
    ctx.lineWidth = 3.5; ctx.strokeStyle = rgba(ring, 0.9);
    ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * clamp(k * 1.6)); ctx.stroke();
    const p = clamp((k - 0.35) / 0.65);
    if (p > 0) {
      const a = [cx - r * 0.42, cy + r * 0.02], b = [cx - r * 0.1, cy + r * 0.34], c = [cx + r * 0.46, cy - r * 0.32];
      const l1 = Math.hypot(b[0] - a[0], b[1] - a[1]), l2 = Math.hypot(c[0] - b[0], c[1] - b[1]);
      const d = p * (l1 + l2);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]);
      if (d <= l1) ctx.lineTo(lerp(a[0], b[0], d / l1), lerp(a[1], b[1], d / l1));
      else { ctx.lineTo(b[0], b[1]); const q = (d - l1) / l2; ctx.lineTo(lerp(b[0], c[0], q), lerp(b[1], c[1], q)); }
      ctx.lineWidth = r * 0.2; ctx.strokeStyle = color; ctx.stroke();
    }
    ctx.restore();
  }
  // AI-narrator glyph for the credit: five voice bars moving with the narration.
  function narratorGlyph(ctx, S, x, y, size, color, t) {
    const base = [0.38, 0.72, 1, 0.66, 0.34];
    ctx.save();
    ctx.fillStyle = color;
    const bw = size * 0.12, gap = size * 0.075, tot = 5 * bw + 4 * gap;
    for (let i = 0; i < 5; i++) {
      const v = S.A.raw(Math.max(0, t - i * 0.04));
      const h = Math.max(bw, size * 0.62 * base[i] * (0.45 + 0.55 * v));
      roundRect(ctx, x - tot / 2 + i * (bw + gap), y - h / 2, bw, h, bw / 2); ctx.fill();
    }
    ctx.restore();
  }

  // ------------------------------------------------------------------ beat types: layout (once) + draw (per frame)
  // layout(ctx, v, S) -> L with L.h (content height); draw(ctx, S, L, x0, top, age, dur, t) paints the content.
  const TYPES = {};

  TYPES.title = {
    layout(ctx, v, S) {
      const B = block(ctx, v.text, F.heavy, { max: 118, min: 54, maxW: IW, maxLines: 3, maxH: IH - 44, lineH: 1.04, upper: true });
      return { B, hl: accentSet(B.raw, v, S.clip), h: 44 + B.h };
    },
    draw(ctx, S, L, x0, top, age) {
      const k0 = easeOutCubic(age / 0.35);
      ctx.save();
      ctx.fillStyle = S.pal.accent;
      const bw = 84 * k0;
      roundRect(ctx, BCX - bw / 2, top, Math.max(1, bw), 10, 5); ctx.fill();
      ctx.restore();
      drawBlock(ctx, L.B, BCX, top + 44, 'center', (i, li) => {
        const k = easeOutCubic((age - 0.04 - li * 0.07) / 0.38);
        return { color: L.hl.has(i) ? S.pal.accent : WHITE, alpha: k, dy: (1 - k) * 34 };
      });
    },
  };

  TYPES.keyword = {
    layout(ctx, v, S) {
      const B = block(ctx, v.text, F.anton, { max: 240, min: 84, maxW: IW, maxLines: 2, maxH: IH - 40, lineH: 1.0, upper: true });
      // per-letter x offsets for the reveal
      ctx.font = font(F.anton, B.size);
      const letters = [];
      B.lines.forEach((li, L) => {
        const text = li.map((i) => B.toks[i]).join(' ');
        let x = -B.lw[L] / 2;
        // spread the measured width over the letters (kerning-safe: offsets from prefix widths)
        for (let j = 0; j < text.length; j++) {
          const pw = ctx.measureText(text.slice(0, j)).width;
          letters.push({ c: text[j], x: -B.lw[L] / 2 + pw, L });
        }
        x += B.lw[L];
      });
      return { B, letters, h: B.h + 40 };
    },
    draw(ctx, S, L, x0, top, age, dur, t) {
      const B = L.B, s = B.scale;
      const e = S.A.env(t);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glow(S.pal.accent, 0.2), BCX, top + B.h / 2, Math.max(B.w, 300) * 0.75, (0.16 + 0.1 * e) * smooth(age / 0.5));
      ctx.restore();
      ctx.save();
      ctx.translate(BCX, top); ctx.scale(s, s);
      ctx.font = font(B.T, B.size); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = WHITE;
      const n = L.letters.length, stag = Math.min(0.035, 0.45 / Math.max(1, n));
      for (let L2 = 0; L2 < B.lines.length; L2++) {
        const base = B.cap + L2 * B.lineH;
        ctx.save();
        ctx.beginPath(); ctx.rect(-BW, base - B.cap - B.size * 0.15, BW * 2, B.cap + B.size * 0.3); ctx.clip();
        L.letters.forEach((l, j) => {
          if (l.L !== L2) return;
          const k = easeOutCubic((age - j * stag) / 0.42);
          if (k <= 0) return;
          ctx.fillText(l.c, l.x, base + (1 - k) * B.cap * 1.15);
        });
        ctx.restore();
      }
      ctx.restore();
      // accent underline sweep
      const u = easeOutCubic((age - 0.3) / 0.45);
      if (u > 0) {
        const w = Math.min(IW, B.w) * u;
        ctx.save(); ctx.fillStyle = S.pal.accent;
        roundRect(ctx, BCX - Math.min(IW, B.w) / 2, top + B.h + 22, w, 12, 6); ctx.fill(); ctx.restore();
      }
    },
  };

  TYPES.stat = {
    layout(ctx, v, S) {
      const P = parseStat(v.value);
      let size = 250;
      for (; size > 90; size -= 4) {
        const dw = digitW(ctx, F.heavy, size);
        const w = numChars(ctx, F.heavy, size, P.text, dw).reduce((a, c) => a + c.w, 0);
        if (w <= IW - 20) break;
      }
      const dw = digitW(ctx, F.heavy, size);
      const cap = capHeight(ctx, F.heavy, size);
      const pct = P.animate && /^\s*%/.test(P.suf || '') && P.value > 0 && P.value <= 100;
      const src = v.source ? (/^source/i.test(String(v.source)) ? String(v.source) : 'Source: ' + v.source) : '';
      const S1 = src ? fitLine(ctx, src, F.uiR, 28, 22, IW) : null;
      const rest = cap + (pct ? 30 + 14 : 0) + 34 + (S1 ? 22 + S1.cap : 0);
      const B = block(ctx, v.label || '', F.bold, { max: 54, min: 32, maxW: IW, maxLines: 2, maxH: Math.max(60, IH - rest), lineH: 1.16, upper: false });
      return { P, size, dw, cap, pct, S1, B, h: rest + B.h };
    },
    draw(ctx, S, L, x0, top, age, dur, t) {
      const k = easeOutCubic((age - 0.05) / 0.8);
      const str = fmtStat(L.P, k);
      const chars = numChars(ctx, F.heavy, L.size, str, L.dw);
      const tw = chars.reduce((a, c) => a + c.w, 0);
      const base = top + L.cap;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      drawGlow(ctx, glow(S.pal.accent, 0.2), BCX, top + L.cap / 2, Math.max(260, tw * 0.7), 0.18 + 0.1 * S.A.env(t));
      ctx.restore();
      ctx.save();
      ctx.font = font(F.heavy, L.size); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = S.pal.accent;
      let x = BCX - tw / 2;
      for (const c of chars) { ctx.fillText(c.c, x + c.w / 2, base); x += c.w; }
      ctx.restore();
      let y = base;
      if (L.pct) {
        y += 30;
        const w = IW * 0.78, x0b = BCX - w / 2;
        ctx.save();
        roundRect(ctx, x0b, y, w, 14, 7); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
        const f = (L.P.value / 100) * clamp(k);
        if (f > 0) { roundRect(ctx, x0b, y, Math.max(14, w * f), 14, 7); ctx.fillStyle = S.pal.accent; ctx.fill(); }
        ctx.restore();
        y += 14;
      }
      const la = smooth((age - 0.25) / 0.35);
      ctx.save(); ctx.globalAlpha *= la;
      drawBlock(ctx, L.B, BCX, y + 34 + (1 - la) * 14, 'center', () => ({ color: WHITE }));
      y += 34 + L.B.h;
      if (L.S1) drawLine(ctx, L.S1, BCX, y + 22 + L.S1.cap, 'center', 'rgba(255,255,255,0.58)');
      ctx.restore();
    },
  };

  TYPES.compare = {
    layout(ctx, v, S) {
      const items = (v.items || []).filter((it) => it && isFinite(+it.value)).slice(0, 4).map((it) => ({ label: String(it.label || ''), value: +it.value, display: it.display }));
      const n = Math.max(1, items.length);
      const vals = items.map((it) => it.value).filter((x) => x > 0);
      const max = Math.max(1e-9, ...items.map((it) => it.value)), min = vals.length ? Math.min(...vals) : max;
      const log = vals.length === items.length && max / min > 50;
      const frac = (x) => {
        if (x <= 0) return 0;
        if (!log) return x / max;
        return 0.1 + 0.9 * (Math.log10(x) - Math.log10(min)) / Math.max(1e-9, Math.log10(max) - Math.log10(min));
      };
      const hi = v.highlight != null ? clamp(v.highlight | 0, 0, n - 1) : items.reduce((b, it, i) => (it.value > items[b].value ? i : b), 0);
      const pre = v.prefix || '';
      // header: title (left, caps) and the unit (right), shown once instead of after every value
      const unitL = v.unit ? fitLine(ctx, String(v.unit), F.uiR, 28, 22, IW * 0.45) : null;
      const header = v.title ? fitLine(ctx, String(v.title).toUpperCase(), F.ui, 26, 20, IW - (unitL ? unitL.w + 24 : 0)) : null;
      const headH = header || unitL ? Math.max(header ? header.cap : 0, unitL ? unitL.cap : 0) + 28 : 0;
      const foot = log ? 30 : 0;
      const gapRow = n <= 2 ? 36 : n === 3 ? 26 : 20;
      const budget = (IH - headH - foot - gapRow * (n - 1)) / n; // height per row
      // text size and bar thickness from the budget (big for 2 rows, compact for 4)
      let ts = Math.max(28, Math.min(n <= 2 ? 52 : 46, Math.floor((budget - 14 - 18) / 0.74)));
      let rows, textCap;
      for (; ts >= 28; ts -= 2) {
        textCap = capHeight(ctx, F.heavy, ts);
        rows = items.map((it, i) => {
          const vtxt = it.display != null ? String(it.display) : fmtVal(it.value, pre);
          ctx.font = font(F.heavy, ts);
          const vw = ctx.measureText(vtxt).width;
          const lab = fitLine(ctx, it.label, F.bold, ts - 4, Math.max(24, ts - 16), Math.max(160, IW - vw - 28));
          const dec = /^[^0-9]*[\d,]+\.(\d+)$/.test(vtxt) ? vtxt.split('.').pop().length : /^[^0-9]*[\d,]+$/.test(vtxt) ? 0 : null;
          return { ...it, vtxt, vw, lab, dec, frac: frac(it.value), hi: i === hi };
        });
        if (budget - textCap - 14 >= 16) break;
      }
      const barH = clamp(Math.floor(budget - textCap - 14), 14, n <= 2 ? 44 : 36);
      const rowH = textCap + 14 + barH;
      const h = headH + n * rowH + (n - 1) * gapRow + foot;
      return { items: rows, header, unitL, headH, barH, gapRow, valSize: ts, textCap, rowH, log, pre, h };
    },
    draw(ctx, S, L, x0, top, age) {
      let y = top;
      if (L.headH) {
        const hb = y + L.headH - 28;
        if (L.header) { ctx.save(); ctx.letterSpacing = '2px'; drawLine(ctx, L.header, x0, hb, 'left', 'rgba(255,255,255,0.62)'); ctx.restore(); }
        if (L.unitL) drawLine(ctx, L.unitL, x0 + IW, hb, 'right', 'rgba(255,255,255,0.62)');
        y += L.headH;
      }
      L.items.forEach((r, i) => {
        const k = easeOutCubic((age - 0.1 - i * 0.14) / 0.75);
        const a = smooth((age - i * 0.14) / 0.25);
        ctx.save();
        ctx.globalAlpha *= a;
        const base = y + L.textCap;
        drawLine(ctx, r.lab, x0, base, 'left', r.hi ? WHITE : 'rgba(255,255,255,0.82)');
        // value counts up with the bar, right aligned
        const vt = r.display != null || k >= 1 ? r.vtxt : fmtVal(r.value * k, L.pre, r.dec);
        ctx.font = font(F.heavy, L.valSize); ctx.textAlign = 'right'; ctx.fillStyle = r.hi ? S.pal.accent : WHITE;
        ctx.fillText(vt, x0 + IW, base);
        const by = base + 14;
        roundRect(ctx, x0, by, IW, L.barH, L.barH / 2); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
        const bw = Math.max(L.barH, IW * r.frac * k);
        if (k > 0) {
          roundRect(ctx, x0, by, bw, L.barH, L.barH / 2);
          if (r.hi) {
            const g = ctx.createLinearGradient(x0, 0, x0 + bw, 0);
            g.addColorStop(0, K.mixHex(S.pal.accent, '#000000', 0.3)); g.addColorStop(1, S.pal.accent);
            ctx.fillStyle = g;
          } else ctx.fillStyle = 'rgba(255,255,255,0.42)';
          ctx.fill();
          if (r.hi) { ctx.globalCompositeOperation = 'lighter'; drawGlow(ctx, glow(S.pal.accent, 0.3), x0 + bw - L.barH / 2, by + L.barH / 2, L.barH * 1.6, 0.5 * ctx.globalAlpha); }
        }
        ctx.restore();
        y += L.rowH + L.gapRow;
      });
      if (L.log) {
        ctx.save(); ctx.globalAlpha *= smooth((age - 0.5) / 0.3);
        ctx.font = font(F.uiR, 22); ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('log scale', x0 + IW, y - L.gapRow + 28);
        ctx.restore();
      }
    },
  };

  TYPES.list = {
    layout(ctx, v, S) {
      const items = (v.items || []).slice(0, 4).map((it) => (typeof it === 'string' ? { text: it } : { text: String(it.text || ''), t: isFinite(+it.t) ? +it.t : null }));
      const n = Math.max(1, items.length);
      const gap = n <= 2 ? 44 : n === 3 ? 34 : 26;
      const tw = IW - 92;
      const opt = (max) => ({ max, min: 32, maxW: tw, maxLines: 2, maxH: (IH - gap * (n - 1)) / n, lineH: 1.12, upper: false });
      let Bs = items.map((it) => block(ctx, it.text, F.bold, opt(n <= 3 ? 64 : 56)));
      const common = Math.min(...Bs.map((B) => B.size));
      Bs = items.map((it) => block(ctx, it.text, F.bold, opt(common))); // one size for every row
      const rows = items.map((it, i) => ({ ...it, B: Bs[i], h: Math.max(64, Bs[i].h) }));
      const h = rows.reduce((a, r) => a + r.h, 0) + gap * (n - 1);
      return { rows, gap, h };
    },
    draw(ctx, S, L, x0, top, age, dur, t, b) {
      const n = L.rows.length;
      const step = n > 1 ? (dur * 0.7) / (n - 1) : 0;
      let y = top;
      // index of the newest visible item
      let newest = -1;
      L.rows.forEach((r, i) => { const at = r.t != null ? r.t - b.ts : i * step; if (age >= at) newest = i; });
      L.rows.forEach((r, i) => {
        const at = r.t != null ? Math.max(0, r.t - b.ts) : i * step;
        const a = age - at;
        if (a >= 0) {
          const k = easeOutCubic(a / 0.4);
          const firstMid = y + r.B.cap / 2 + (r.B.h > r.B.cap * 1.6 ? 0 : (r.h - r.B.h) / 2);
          ctx.save();
          ctx.globalAlpha *= k * (i === newest ? 1 : 0.78);
          const sc = 0.4 + 0.6 * spring(a, 14, 16);
          ctx.save(); ctx.translate(x0 + 30, firstMid); ctx.scale(sc, sc);
          drawCheck(ctx, 0, 0, 28, clamp(a / 0.45), i === newest ? S.pal.accent : WHITE, S.pal.accent);
          ctx.restore();
          drawBlock(ctx, r.B, x0 + 92 - (1 - k) * 28, y + (r.h - r.B.h) / 2, 'left', () => ({ color: WHITE }));
          ctx.restore();
        } else {
          // placeholder bullet so the list shape reads before the item lands
          ctx.save();
          ctx.globalAlpha *= 0.28;
          ctx.beginPath(); ctx.arc(x0 + 30, y + r.h / 2, 6, 0, Math.PI * 2); ctx.fillStyle = WHITE; ctx.fill();
          ctx.restore();
        }
        y += r.h + L.gap;
      });
    },
  };

  TYPES.quote = {
    layout(ctx, v, S) {
      const by = v.by ? fitLine(ctx, '— ' + String(v.by).replace(/^[—–-]\s*/, ''), F.ui, 30, 22, IW - 30) : null;
      const markH = 78;
      const B = block(ctx, String(v.text || '').trim().replace(/^["“]+|["”]+$/g, ''), F.bold, {
        max: 64, min: 32, maxW: IW - 30, maxLines: 6, maxH: IH - markH - (by ? 30 + by.cap : 0), lineH: 1.2, upper: false });
      return { B, by, markH, h: markH + B.h + (by ? 30 + by.cap : 0) };
    },
    draw(ctx, S, L, x0, top, age) {
      // big quotation mark in the accent colour + accent rule on the left
      ctx.save();
      const k = easeOutCubic(age / 0.35);
      ctx.font = font(F.heavy, 190); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = S.pal.accent; ctx.globalAlpha *= k;
      ctx.fillText('“', x0 - 8, top + 136 - (1 - k) * 20);
      ctx.restore();
      const tx = x0 + 30;
      ctx.save();
      ctx.fillStyle = S.pal.accent;
      const rh = (L.h - L.markH) * easeOutCubic((age - 0.1) / 0.5);
      roundRect(ctx, x0, top + L.markH, 6, Math.max(1, rh), 3); ctx.fill();
      ctx.restore();
      const n = L.B.toks.length, stag = Math.min(0.06, 0.8 / Math.max(1, n));
      drawBlock(ctx, L.B, tx, top + L.markH, 'left', (i) => {
        const a = smooth((age - 0.12 - i * stag) / 0.22);
        return { color: WHITE, alpha: a, dy: (1 - a) * 10 };
      });
      if (L.by) {
        ctx.save(); ctx.globalAlpha *= smooth((age - 0.3 - n * stag) / 0.3);
        drawLine(ctx, L.by, tx, top + L.markH + L.B.h + 30 + L.by.cap, 'left', 'rgba(255,255,255,0.7)');
        ctx.restore();
      }
    },
  };

  TYPES.timeline = {
    layout(ctx, v, S) {
      const items = (v.items || []).slice(0, 5).map((it) => (typeof it === 'string' ? { t: '', label: it } : { t: String(it.t != null ? it.t : ''), label: String(it.label || ''), at: isFinite(+it.at) ? +it.at : null }));
      const n = Math.max(1, items.length);
      const colW = IW / n;
      // shared sizes so the row reads as one system
      let ys = n <= 3 ? 64 : n === 4 ? 54 : 46;
      ctx.font = font(F.heavy, ys);
      for (; ys > 26; ys -= 2) { ctx.font = font(F.heavy, ys); if (items.every((it) => ctx.measureText(it.t).width <= colW - 14)) break; }
      const opt = (max) => ({ max, min: 22, maxW: colW - 14, maxLines: 3, maxH: 150, lineH: 1.16, upper: false });
      let Bs = items.map((it) => block(ctx, it.label, F.ui, opt(n <= 3 ? 38 : n === 4 ? 34 : 30)));
      const common = Math.min(...Bs.map((B) => B.size));
      Bs = items.map((it) => block(ctx, it.label, F.ui, opt(common)));
      const yCap = capHeight(ctx, F.heavy, ys);
      const labH = Math.max(...Bs.map((B) => B.h));
      const lineY = yCap + 44;            // relative to top
      const h = lineY + 44 + labH;
      return { items, n, colW, ys, yCap, Bs, lineY, h };
    },
    draw(ctx, S, L, x0, top, age, dur, t, b) {
      const n = L.n, xs = L.items.map((_, i) => x0 + L.colW * (i + 0.5));
      const ly = top + L.lineY;
      const step = n > 1 ? (dur * 0.72 - 0.35) / (n - 1) : 0;
      const acts = L.items.map((it, i) => (it.at != null ? Math.max(0, it.at - b.ts) : 0.35 + i * step));
      let active = -1;
      acts.forEach((a, i) => { if (age >= a) active = i; });
      // base line draws in, then the accent progress line travels to the active point
      const draw = easeOutCubic(age / 0.5);
      const xa = x0 + 6, xb = x0 + IW - 6;
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(xa, ly); ctx.lineTo(lerp(xa, xb, draw), ly); ctx.stroke();
      if (active >= 0) {
        const prevX = active > 0 ? xs[active - 1] : xa;
        const px = lerp(prevX, xs[active], easeOutCubic((age - acts[active]) / 0.4));
        const g = ctx.createLinearGradient(xa, 0, px, 0);
        g.addColorStop(0, rgba(S.pal.accent, 0.35)); g.addColorStop(1, S.pal.accent);
        ctx.strokeStyle = g; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(xa, ly); ctx.lineTo(px, ly); ctx.stroke();
      }
      ctx.restore();
      L.items.forEach((it, i) => {
        const appear = smooth((age - 0.08 * i) / 0.3);
        const state = i < active ? 'past' : i === active ? 'on' : 'future';
        const x = xs[i];
        ctx.save();
        ctx.globalAlpha *= appear;
        if (state === 'on') {
          const a = age - acts[i];
          const pulse = 0.5 + 0.5 * Math.sin(t * 4.2);
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          drawGlow(ctx, glow(S.pal.accent, 0.3), x, ly, 44 + 8 * pulse, 0.55 * ctx.globalAlpha);
          ctx.restore();
          const r = 15 * (0.6 + 0.4 * spring(a, 14, 16));
          ctx.beginPath(); ctx.arc(x, ly, r, 0, Math.PI * 2); ctx.fillStyle = S.pal.accent; ctx.fill();
          ctx.beginPath(); ctx.arc(x, ly, r + 9, 0, Math.PI * 2); ctx.strokeStyle = rgba(S.pal.accent, 0.5); ctx.lineWidth = 3; ctx.stroke();
        } else if (state === 'past') {
          ctx.beginPath(); ctx.arc(x, ly, 10, 0, Math.PI * 2); ctx.fillStyle = WHITE; ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(x, ly, 10, 0, Math.PI * 2); ctx.fillStyle = '#0b0d16'; ctx.fill();
          ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3; ctx.stroke();
        }
        const yearCol = state === 'on' ? S.pal.accent : state === 'past' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)';
        ctx.font = font(F.heavy, L.ys); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = yearCol;
        ctx.fillText(it.t, x, top + L.yCap);
        ctx.globalAlpha *= state === 'on' ? 1 : state === 'past' ? 0.72 : 0.38;
        drawBlock(ctx, L.Bs[i], x, ly + 44, 'center', () => ({ color: WHITE }));
        ctx.restore();
      });
    },
  };

  // ------------------------------------------------------------------ scenes: per-story ES modules
  // visual { type: "scene", module, params, layout: "full" (default) | "band", span? (beats), card? (band only) }
  // or top-level clip.scenes [{ module, t0, t1, params }]. The module's default draw(ctx, t, info) paints an
  // isolated transparent canvas: full = 1080x1920 (the whole frame, replacing the background), band = 855x480
  // (the beat card band). See README "Authoring a scene".
  const STAGE = { x0: 60, x1: 915, y0: 400, y1: 1050 };   // full-frame action area: below the dock, above captions
  const SAFE_BOX = { x0: 60, x1: 915, y0: 150, y1: 1540 };
  const TX = 0.35;                                         // crossfade between scenes / to and from cards
  const SCENE_FONTS = {
    display: { family: 'Montserrat', weight: 900 }, bold: { family: 'Montserrat', weight: 800 },
    condensed: { family: 'Anton', weight: 400 }, ui: { family: 'Inter', weight: 700 }, body: { family: 'Inter', weight: 500 },
  };
  const sceneFont = (kind, size) => font(SCENE_FONTS[kind] || SCENE_FONTS.body, size);
  const SCENE_HELPERS = Object.freeze({
    clamp, lerp, smooth, easeOutCubic, easeInOutCubic: K.easeInOutCubic, spring,
    easeOutBack: (k) => { k = clamp(k); const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); },
    phase: (t, a, b, ease) => (ease || K.easeInOutCubic)((t - a) / Math.max(1e-6, b - a)),
    roundRect, rgba, mixHex: K.mixHex, hash: K.hash2,
    font: sceneFont,
    fitText: (ctx, text, kind, max, min, maxW) => { const r = K.fitText(ctx, String(text), SCENE_FONTS[kind] || SCENE_FONTS.body, max, min, maxW); return { text: r.text, size: r.size, font: sceneFont(kind, r.size) }; },
    wrap: (ctx, text, kind, size, maxW) => {
      ctx.font = sceneFont(kind, size);
      const words = String(text).split(/\s+/).filter(Boolean), lines = [];
      let cur = '';
      for (const w of words) { const n = cur ? cur + ' ' + w : w; if (cur && ctx.measureText(n).width > maxW) { lines.push(cur); cur = w; } else cur = n; }
      if (cur) lines.push(cur);
      return lines;
    },
    glow: (ctx, x, y, r, color, alpha) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; drawGlow(ctx, glow(color, 0.3), x, y, r, alpha); ctx.restore(); },
  });
  // Determinism guard: scenes must be pure functions of (t, info).
  function guarded(fn) {
    const R = Math.random, D = Date.now;
    const no = (what) => () => { throw new Error(what + ' is not allowed in scenes (use t and info.helpers.rng / info.helpers.hash)'); };
    Math.random = no('Math.random'); Date.now = no('Date.now'); performance.now = no('performance.now');
    try { return fn(); } finally { Math.random = R; Date.now = D; delete performance.now; }
  }
  // Scene instance (one per scene segment / band beat).
  function makeScene(S, v, t0, t1, beatTimes) {
    const mod = S.sceneMods && S.sceneMods.get(v.__url);
    if (!mod) throw new Error('scene module not loaded: ' + (v.__src || v.module) + ' (render with render.mjs)');
    const full = (v.layout || 'full') !== 'band';
    const w = full ? S.W : BW, h = full ? S.H : BAND.y1 - BAND.y0;
    const cv = new OffscreenCanvas(w, h);
    const words = (S.clip.words || []).filter((x) => x.s >= t0 - 0.05 && x.s < t1).map((x) => Object.freeze({ w: String(x.w), s: x.s - t0, e: x.e - t0 }));
    const toks = words.map((x) => cleanTok(x.w));
    const beats = (beatTimes && beatTimes.length ? beatTimes : [[t0, t1]]).map(([a, b]) => Object.freeze({ t0: a - t0, t1: b - t0 }));
    const kit = window.EXPLAINER_KIT ? window.EXPLAINER_KIT.create({ accent: S.pal.accent, width: w, height: h }) : null;
    return {
      full, w, h, cv, ctx: cv.getContext('2d'), draw: mod.default, src: v.__src || v.module, t0, t1, dur: t1 - t0,
      params: Object.freeze(Object.assign({}, v.params || {})), seed: K.hashStr(String(v.__src || v.module) + JSON.stringify(v.params || {}) + t0),
      words: Object.freeze(words), beats: Object.freeze(beats), kit,
      wordAt: (tt) => { for (const x of words) if (tt >= x.s && tt < x.e + 0.08) return x; return null; },
      timeOf: (word, nth = 0) => { const k = cleanTok(String(word)); let c = 0; for (let i = 0; i < toks.length; i++) if (toks[i] === k && c++ === nth) return words[i].s; return null; },
    };
  }
  function runScene(S, L, age, t) {
    const c = L.ctx;
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    c.clearRect(0, 0, L.w, L.h);
    c.save();
    let bi = 0;
    for (let i = 0; i < L.beats.length; i++) if (age >= L.beats[i].t0) bi = i;
    const B = L.beats[bi];
    const info = {
      duration: L.dur, width: L.w, height: L.h, layout: L.full ? 'full' : 'band',
      stage: L.full ? STAGE : { x0: 0, x1: L.w, y0: 0, y1: L.h }, safe: L.full ? SAFE_BOX : { x0: 0, x1: L.w, y0: 0, y1: L.h },
      env: S.A.env(t), onset: S.A.onset(t), params: L.params,
      beat: bi, beatT: age - B.t0, beatDur: B.t1 - B.t0, beats: L.beats, words: L.words, wordAt: L.wordAt, timeOf: L.timeOf,
      accent: S.pal.accent, ink: '#ffffff', muted: 'rgba(255,255,255,0.6)', panel: '#0e101c',
      fonts: { display: 'Montserrat 900', bold: 'Montserrat 800', condensed: 'Anton', ui: 'Inter 700', body: 'Inter 500' },
      helpers: Object.assign({ rng: K.mulberry32(L.seed), kit: L.kit, world: L.kit && L.kit.world, camera: L.kit && L.kit.camera }, SCENE_HELPERS),
    };
    try { guarded(() => L.draw(c, Math.max(0, age), info)); }
    catch (e) { throw new Error(`scene ${L.src} threw at t=${age.toFixed(2)}: ${(e && e.message) || e}`); }
    finally { c.restore(); }
  }
  // band scenes behave like a beat card
  TYPES.scene = {
    layout(ctx, v, S, b) { return { h: IH, scene: makeScene(S, v, b.ts, b.t1) }; }, // h = card content height
    draw(ctx, S, L, x0, top, age, dur, t, b) {
      const sc = L.scene;
      runScene(S, sc, age, t);
      ctx.save();
      roundRect(ctx, b.box.x, b.box.y, b.box.w, b.box.h, 38); ctx.clip();
      ctx.drawImage(sc.cv, b.box.x, b.box.y + (b.box.h - sc.h) / 2);
      ctx.restore();
    },
  };
  async function loadScenes(S) {
    const urls = new Map();
    const refs = [...(Array.isArray(S.clip.beats) ? S.clip.beats.map((b) => b && b.visual) : []), ...(Array.isArray(S.clip.scenes) ? S.clip.scenes : [])];
    for (const v of refs) {
      if (v && (v.type === 'scene' || (!v.type && v.module))) {
        if (!v.__url) throw new Error('scene ' + (v.module || '(no "module")') + ': module not resolved (render with render.mjs; "module" missing?)');
        urls.set(v.__url, v.__src || v.module);
      }
    }
    S.sceneMods = new Map();
    for (const [url, src] of urls) {
      let mod;
      try { mod = await import(url); } catch (e) { throw new Error(`scene module ${src} failed to load: ${(e && e.message) || e}`); }
      if (typeof mod.default !== 'function') throw new Error(`scene module ${src} must export default function draw(ctx, t, info)`);
      S.sceneMods.set(url, mod);
    }
  }
  // Dry run before frame 0: start, quarter, end must not throw; the middle must render identically twice.
  function checkScene(S, L) {
    const sum = () => { const d = L.ctx.getImageData(0, 0, L.w, L.h).data; let h = 0; for (let i = 0; i < d.length; i += 11) h = (h * 31 + d[i]) >>> 0; return h; };
    for (const a of [0, L.dur * 0.25, Math.max(0, L.dur - 0.01)]) runScene(S, L, a, L.t0 + a);
    const m = L.dur * 0.5;
    runScene(S, L, m, L.t0 + m); const h1 = sum();
    runScene(S, L, m, L.t0 + m); const h2 = sum();
    if (h1 !== h2) throw new Error(`scene ${L.src} is not deterministic (two renders of t=${m.toFixed(2)} differ)`);
  }
  // readability scrim over full-frame scenes: behind the dock and the caption/credit band
  function buildSceneScrim(S) {
    const c = document.createElement('canvas'); c.width = S.W; c.height = S.H;
    const g = c.getContext('2d');
    const lin = (y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, a]) => gr.addColorStop(o, `rgba(3,4,10,${a})`)); g.fillStyle = gr; g.fillRect(0, y0, S.W, y1 - y0); };
    lin(0, 520, [[0, 0.62], [0.45, 0.3], [1, 0]]);
    lin(980, S.H, [[0, 0], [0.18, 0.42], [0.5, 0.55], [1, 0.72]]);
    return c;
  }

  // ------------------------------------------------------------------ timeline: full scenes + card beats
  function setupTimeline(S, ctx) {
    const clip = S.clip, LAY = S.LAYOUT, D = clip.duration;
    const hookEnd = S.hook ? LAY.hookSec + LAY.hookMorph * 0.7 : 0;
    const isFull = (v) => v && v.type === 'scene' && (v.layout || 'full') !== 'band';
    const src = (Array.isArray(clip.beats) ? clip.beats : [])
      .filter((b) => b && b.visual && isFinite(+b.t0) && isFinite(+b.t1) && +b.t1 > +b.t0)
      .map((b) => ({ t0: +b.t0, t1: +b.t1, visual: b.visual, label: b.label ? String(b.label) : '' }))
      .sort((a, b) => a.t0 - b.t0);
    src.forEach((b, i) => { b.t1 = Math.min(b.t1, src[i + 1] ? src[i + 1].t0 : Infinity, D); });
    const top = (Array.isArray(clip.scenes) ? clip.scenes : []).filter((sc) => sc && sc.__url && isFinite(+sc.t0) && isFinite(+sc.t1) && +sc.t1 > +sc.t0)
      .map((sc) => ({ t0: +sc.t0, t1: Math.min(+sc.t1, D), visual: Object.assign({ type: 'scene' }, sc) }));
    const fulls = [], beats = [];
    // top-level scenes win over overlapping beats
    const covered = (a, b) => top.some((sc) => a < sc.t1 - 0.05 && b > sc.t0 + 0.05);
    for (const sc of top) {
      const inside = src.filter((b) => b.t0 >= sc.t0 - 0.05 && b.t0 < sc.t1 - 0.05).map((b) => [Math.max(b.t0, sc.t0), Math.min(b.t1, sc.t1)]);
      fulls.push({ t0: sc.t0, t1: sc.t1, L: makeScene(S, sc.visual, sc.t0, sc.t1, inside) });
    }
    for (let i = 0; i < src.length; i++) {
      const b = src[i];
      if (covered(b.t0, b.t1)) continue;
      if (isFull(b.visual)) {
        const n = Math.max(1, (b.visual.span | 0) || 1), last = src[Math.min(src.length - 1, i + n - 1)];
        const parts = src.slice(i, i + n).map((x) => [x.t0, x.t1]);
        fulls.push({ t0: b.t0, t1: last.t1, L: makeScene(S, b.visual, b.t0, last.t1, parts), label: b.label });
        i += n - 1;
        continue;
      }
      const ts = Math.max(b.t0, hookEnd); // the hook card owns the first ~3 s
      const type = TYPES[b.visual.type];
      if (!type) { console.warn('ai-explainer: unknown beat visual type ' + b.visual.type); continue; }
      if (b.t1 - ts < 0.5) continue;
      const bb = { ...b, ts, type, last: b.t1 >= D - 0.05 };
      bb.L = type.layout(ctx, b.visual, S, bb);
      const h = Math.min(IH, bb.L.h) + 2 * PADY;
      bb.box = { x: BAND.x0, y: Math.round(BCY - h / 2), w: BW, h };
      beats.push(bb);
    }
    fulls.sort((a, b) => a.t0 - b.t0);
    if (fulls.length) fulls[fulls.length - 1].lastEnd = fulls[fulls.length - 1].t1 >= D - 0.05;
    // disclosure chips
    for (const b of [...beats, ...fulls]) {
      if (!b.label) continue;
      ctx.save(); ctx.letterSpacing = '1.5px';
      const L = fitLine(ctx, b.label.toUpperCase(), F.ui, 24, 18, BW - 60);
      ctx.restore();
      b.chip = { L, w: L.w + 2 * 18 + 22, h: 40 };
    }
    for (const f of fulls) checkScene(S, f.L);
    for (const b of beats) if (b.type === TYPES.scene) checkScene(S, b.L.scene);
    return { fulls, beats };
  }

  // ------------------------------------------------------------------ per-frame
  function findBeat(beats, t) {
    for (let i = beats.length - 1; i >= 0; i--) if (t >= beats[i].ts) return t < beats[i].t1 ? beats[i] : null;
    return null;
  }
  function beatAnim(b, t) {
    const age = t - b.ts;
    const sp = spring(age, 15, 17);
    let alpha = clamp(age / 0.14), scale = 0.9 + 0.1 * sp, dy = (1 - Math.min(1, sp)) * 40;
    if (!b.last) {
      const k = clamp((b.t1 - t) / T_OUT);
      if (k < 1) { const e = easeOutCubic(k); alpha *= e; scale *= 0.96 + 0.04 * e; dy -= (1 - e) * 18; }
    }
    return { age, alpha, scale, dy };
  }
  function card(ctx, S, box, video) {
    const r = 38;
    ctx.save();
    roundRect(ctx, box.x, box.y, box.w, box.h, r);
    const g = ctx.createLinearGradient(0, box.y, 0, box.y + box.h);
    const a0 = video ? 0.86 : 0.84, a1 = video ? 0.78 : 0.72;
    g.addColorStop(0, `rgba(14,16,28,${a0})`); g.addColorStop(1, `rgba(7,8,15,${a1})`);
    ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.13)'; ctx.stroke();
    ctx.clip();
    const hg = ctx.createLinearGradient(box.x, 0, box.x + box.w, 0);
    hg.addColorStop(0, rgba(S.pal.accent, 0)); hg.addColorStop(0.5, rgba(S.pal.accent, 0.8)); hg.addColorStop(1, rgba(S.pal.accent, 0));
    ctx.fillStyle = hg; ctx.fillRect(box.x, box.y, box.w, 3);
    const rg = ctx.createRadialGradient(box.x + box.w / 2, box.y, 0, box.x + box.w / 2, box.y, box.w * 0.6);
    rg.addColorStop(0, rgba(S.pal.accent, 0.08)); rg.addColorStop(1, rgba(S.pal.accent, 0));
    ctx.fillStyle = rg; ctx.fillRect(box.x, box.y, box.w, box.h);
    ctx.restore();
  }
  function drawLabel(ctx, S, b) {
    const c = b.chip; if (!c) return;
    ctx.save();
    roundRect(ctx, BAND.x0, LABEL_Y, c.w, c.h, c.h / 2);
    ctx.fillStyle = 'rgba(6,7,12,0.72)'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.stroke();
    // small "sparkle" diamond as a generated-media marker (drawn, not an emoji)
    const cx = BAND.x0 + 18 + 7, cy = LABEL_Y + c.h / 2;
    ctx.beginPath(); ctx.moveTo(cx, cy - 8); ctx.lineTo(cx + 6, cy); ctx.lineTo(cx, cy + 8); ctx.lineTo(cx - 6, cy); ctx.closePath();
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.fill();
    ctx.letterSpacing = '1.5px';
    drawLine(ctx, c.L, BAND.x0 + 18 + 22, LABEL_Y + c.h / 2 + c.L.cap / 2, 'left', 'rgba(255,255,255,0.88)');
    ctx.restore();
  }
  function buildDimmer(S) {
    const W = S.W, H = S.H;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = 'rgba(0,0,0,0.26)'; g.fillRect(0, 0, W, H);
    g.save(); g.translate(BCX, BCY); g.scale(1, 0.75);
    const r = g.createRadialGradient(0, 0, 80, 0, 0, 720);
    r.addColorStop(0, 'rgba(0,0,0,0.5)'); r.addColorStop(0.6, 'rgba(0,0,0,0.3)'); r.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = r; g.fillRect(-W, -H, 2 * W, 2 * H);
    g.restore();
    return c;
  }

  // full scene active at t (each runs [t0, t1); the last one holds to the end)
  function fullAt(fulls, t) {
    for (let i = fulls.length - 1; i >= 0; i--) { const f = fulls[i]; if (t >= f.t0) return t < f.t1 || f.lastEnd ? f : null; }
    return null;
  }

  async function setup(S, ctx) {
    await loadScenes(S);
    const video = !!S.bgVideo;
    const { fulls, beats } = setupTimeline(S, ctx);
    const dimmer = buildDimmer(S);
    const scrim = fulls.length ? buildSceneScrim(S) : null;
    S.beats = beats; S.fullScenes = fulls;
    S.info = { beats: beats.length, scenes: fulls.length, template: 'ai-explainer' };
    S.layers.creditGlyph = narratorGlyph;
    const sceneMix = (t) => {
      const cur = fullAt(fulls, t);
      if (cur) {
        const prev = fulls[fulls.indexOf(cur) - 1];
        const k = cur.t0 <= 0.01 ? 1 : smooth((t - cur.t0) / TX);
        return { cur, k, prev: prev && prev.t1 >= cur.t0 - 0.05 ? prev : null };
      }
      // card mode; a scene that just ended fades out over it
      for (const f of fulls) if (t >= f.t1 && t < f.t1 + TX) return { cur: null, out: f, k: 1 - smooth((t - f.t1) / TX) };
      return { cur: null, k: 0 };
    };
    const blitScene = (ctx2, f, t, a) => {
      if (a <= 0.003) return;
      runScene(S, f.L, t - f.t0, t);
      ctx2.globalAlpha = a; ctx2.drawImage(f.L.cv, 0, 0); ctx2.globalAlpha = 1;
    };
    S.layers.skipBackground = (t) => { const m = sceneMix(t); return !!m.cur && (m.k >= 1 || !!m.prev); };
    S.layers.mid = (ctx2, S2, t, cover) => {
      const m = sceneMix(t);
      if (m.cur) {
        if (m.k < 1 && m.prev) blitScene(ctx2, m.prev, t, 1);
        else if (m.k < 1) ctx2.drawImage(dimmer, 0, 0); // fading in over the card-mode background
        blitScene(ctx2, m.cur, t, m.k);
        ctx2.globalAlpha = m.prev ? 1 : m.k; ctx2.drawImage(scrim, 0, 0); ctx2.globalAlpha = 1;
        if (m.cur.chip && !cover) { ctx2.save(); ctx2.globalAlpha = m.k; drawLabel(ctx2, S2, m.cur); ctx2.restore(); }
        return;
      }
      const b = cover ? null : findBeat(beats, t);
      const an = b ? beatAnim(b, t) : null;
      // background dimmer: always on (generative styles are busy), deeper while a beat is up
      const presence = an ? an.alpha : 0;
      ctx2.globalAlpha = video ? 0.35 + 0.4 * presence : 0.75 + 0.25 * presence;
      ctx2.drawImage(dimmer, 0, 0);
      ctx2.globalAlpha = 1;
      if (b && an.alpha > 0.003) {
        ctx2.save();
        ctx2.globalAlpha = an.alpha;
        const cy = b.box.y + b.box.h / 2;
        ctx2.translate(BCX, cy + an.dy); ctx2.scale(an.scale, an.scale); ctx2.translate(-BCX, -cy);
        if (b.visual.card !== false) card(ctx2, S2, b.box, video);
        const top = b.box.y + PADY + Math.max(0, (b.box.h - 2 * PADY - b.L.h) / 2);
        b.type.draw(ctx2, S2, b.L, BAND.x0 + PADX, top, an.age, b.t1 - b.ts, t, b);
        ctx2.restore();
        if (b.chip) { ctx2.save(); ctx2.globalAlpha = an.alpha; drawLabel(ctx2, S2, b); ctx2.restore(); }
      }
      if (m.out) { blitScene(ctx2, m.out, t, m.k); ctx2.globalAlpha = m.k; ctx2.drawImage(scrim, 0, 0); ctx2.globalAlpha = 1; }
    };
  }

  window.EXPLAINER = { setup, parseStat, fmtStat, fmtVal, TYPES, BAND, STAGE };
})();
