// Scene "health-qa" (full frame). A generic health-question app on a big cartoon phone (no logos: the app icon is a
// heart with a pulse line). People ask it health questions, get a plain-language answer with source chips, opt in to
// share health data, and grade the answer. Names appear as text only; no real people are drawn. The answer is
// placeholder bars (never actual medical advice). All cues are narration words ("word#n" = n-th occurrence).
// modes:
//   hook   (cold open, 1 beat) night street, big phone mid-action: answer types in, chips pop, 5 stars fill, a check
//          stamp lands; two people on phones rate too (stars pop over their heads); counter pill counts up.
//          params: count (200000), countLabel ("people"), question, chips [3], stamp ("RATED")
//   ask    (2-beat span) night room, person with a phone + the big phone (zoomed view). Pills: study / partner / tag;
//          app splash with JOIN button -> chat; question types in; answer + "plain English" tag; beat 2: book icons fly
//          into source chips; content scrolls, a "share health data" toggle flips on, 4 data tiles pop.
//          params: question, pills [3], pillCues [3], chips [3], tag, tiles [4], toggle,
//          cues: downloadCue, typeCue, answerCue, tagCue, booksCue, linkCue, optCue, tilesCue, hiCues [words that
//          light up tiles 0..3]
//   grade  (1 beat) phone with a "Rate this answer" row (stars fill, thumbs up) + survey clipboard ticking; then a
//          crowd grid of mini people fills under a big counter, plus pills (age / place).
//          params: count, countLabel, rateHead, survey, pills [2], cues: gradeCue, rateCue, surveyCue, countCue, pillCues [2]
//   crowd  (1 beat) night city, question bubbles rise from windows; source pill, counter (value + unit + sub), then
//          the counter lifts and two question pills land.
//          params: source, value (230), unit ("M+"), sub, asks [2], cues: sourceCue, countCue, moreCue, askCues [2]
//   caveat (1 beat) worried person + phone whose answer goes incomplete / unclear; verbatim quote panel (text only);
//          then pills: not for diagnosis, padlock + data not used for training.
//          params: lead, quote, by, notes [2], cues: quoteCue, gapCue, blurCue, noteCues [2]
// Fits: health AI / medical chatbot / consumer AI app studies, "rate the AI's answer", opt-in personal data stories.
export default function draw(ctx, t, info) {
  const P = info.params || {};
  const mode = P.mode || 'hook';
  const fn = { hook, ask, grade, crowd, caveat }[mode] || hook;
  ctx.save();
  fn(ctx, t, info, P);
  ctx.restore();
}

// ---------------------------------------------------------------- helpers
function cueFn(info) {
  return (w, d) => {
    if (!w) return d;
    const m = String(w).match(/^(.*)#(\d+)$/);
    const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? d : v;
  };
}

const TILE_ICONS = ['moon', 'heart', 'steps', 'tube'];

function heartPath(ctx, x, y, r) {
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.9);
  ctx.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.7, y - r * 1.2, x, y - r * 0.45);
  ctx.bezierCurveTo(x + r * 0.7, y - r * 1.2, x + r * 1.5, y - r * 0.1, x, y + r * 0.9);
  ctx.closePath();
}

// generic app icon: rounded square, heart, pulse line (no brand)
function appIcon(ctx, H, x, y, s, acc) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  H.roundRect(ctx, -50, -50, 100, 100, 26); ctx.fillStyle = '#f4f6fb'; ctx.fill();
  heartPath(ctx, 0, 0, 30); ctx.fillStyle = '#ff5d6c'; ctx.fill();
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-12, 0); ctx.lineTo(-4, -14); ctx.lineTo(5, 12); ctx.lineTo(12, 0); ctx.lineTo(30, 0); ctx.stroke();
  ctx.restore();
}

function icon(ctx, H, kind, x, y, r, col) {
  ctx.save(); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round';
  if (kind === 'moon') {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(x + r * 0.5, y - r * 0.35, r * 0.85, 0, Math.PI * 2); ctx.fill();
  } else if (kind === 'heart') {
    heartPath(ctx, x, y + r * 0.1, r * 0.95); ctx.fill();
  } else if (kind === 'steps') {
    ctx.beginPath(); ctx.ellipse(x - r * 0.4, y + r * 0.2, r * 0.32, r * 0.55, -0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + r * 0.4, y - r * 0.3, r * 0.32, r * 0.55, 0.2, 0, Math.PI * 2); ctx.fill();
  } else if (kind === 'tube') {
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.5);
    ctx.strokeRect(-r * 0.3, -r * 0.95, r * 0.6, r * 1.6);
    ctx.fillRect(-r * 0.3, r * 0.05, r * 0.6, r * 0.6);
    ctx.restore();
  } else if (kind === 'q') {
    ctx.font = H.font('display', r * 1.8); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', x, y + r * 0.1);
  } else if (kind === 'plus') {
    ctx.fillRect(x - r * 0.25, y - r * 0.8, r * 0.5, r * 1.6); ctx.fillRect(x - r * 0.8, y - r * 0.25, r * 1.6, r * 0.5);
  }
  ctx.restore();
}

function star(ctx, x, y, r, fill, stroke) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
    const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
    if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
  }
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 3; ctx.stroke(); }
}

// big phone body; returns the screen rect (below the app header)
function bigPhone(ctx, H, K, cx, top, w, h, o) {
  const x = cx - w / 2;
  K.shadow(ctx, cx, top + h + 6, w * 1.1);
  H.roundRect(ctx, x, top, w, h, 46); ctx.fillStyle = '#1b1f33'; ctx.fill();
  H.roundRect(ctx, x + 4, top + 4, 10, h - 8, 5); ctx.fillStyle = '#2a304a'; ctx.fill();
  H.roundRect(ctx, x + 14, top + 14, w - 28, h - 28, 34); ctx.fillStyle = '#0f1426'; ctx.fill();
  H.roundRect(ctx, cx - 44, top + 24, 88, 20, 10); ctx.fillStyle = '#05070f'; ctx.fill();
  const scr = { x: x + 14, y: top + 14, w: w - 28, h: h - 28 };
  if (o.header !== false) {
    appIcon(ctx, H, scr.x + 46, scr.y + 74, 0.42, o.acc);
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#e8ecf6'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(o.title || 'Health study', scr.x + 78, scr.y + 75);
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(scr.x, scr.y + 106, scr.w, 2);
  }
  return { x: scr.x, y: scr.y + (o.header !== false ? 110 : 0), w: scr.w, h: scr.h - (o.header !== false ? 110 : 0), r: scr };
}

// right-aligned question bubble; returns height
function qBubble(ctx, H, right, y, maxW, text, shown, acc, pop) {
  const size = 26;
  ctx.font = H.font('ui', size);
  const lines = H.wrap(ctx, text, 'ui', size, maxW - 40);
  const w = Math.min(maxW, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 40);
  const h = lines.length * size * 1.25 + 30;
  if (pop <= 0) return h;
  ctx.save(); ctx.translate(right, y + h); ctx.scale(pop, pop); ctx.translate(-right, -(y + h));
  H.roundRect(ctx, right - w, y, w, h, 22); ctx.fillStyle = acc; ctx.fill();
  ctx.fillStyle = '#10131f'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let used = 0;
  lines.forEach((ln, i) => {
    const n = Math.max(0, Math.min(ln.length, shown - used)); used += ln.length + 1;
    if (n > 0) ctx.fillText(ln.slice(0, n), right - w + 20, y + 15 + size + i * size * 1.25 - 4);
  });
  ctx.restore();
  return h;
}

// answer bubble: placeholder bars + source chips row; returns height
function aBubble(ctx, H, K, x, y, w, o) {
  const rows = o.rows || 4, prog = o.prog == null ? 1 : o.prog, chips = o.chips || [], cp = o.chipPop || [];
  const barH = 12, gap = 14, chipH = chips.length ? 48 : 0;
  const h = 26 + rows * (barH + gap) + (chipH ? chipH + 10 : 0) + 12;
  if (o.pop <= 0) return h;
  const pop = o.pop == null ? 1 : o.pop;
  ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop); ctx.translate(-x, -y);
  H.roundRect(ctx, x, y, w, h, 22); ctx.fillStyle = '#262c46'; ctx.fill();
  for (let i = 0; i < rows; i++) {
    const k = H.clamp(prog * rows - i); if (k <= 0) break;
    const full = (i === rows - 1 ? 0.55 : 0.82 + 0.12 * H.hash(i, 3)) * (w - 40);
    const by = y + 22 + i * (barH + gap);
    const mode = o.broken ? o.broken(i) : null; // null | {alpha, dash, wob}
    ctx.save();
    if (mode && mode.wob) ctx.translate(Math.sin((o.t || 0) * 7 + i) * mode.wob, 0);
    ctx.globalAlpha = mode && mode.alpha != null ? mode.alpha : 1;
    if (mode && mode.dash) {
      ctx.setLineDash([10, 8]); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 2;
      H.roundRect(ctx, x + 20, by, full * k, barH, 6); ctx.stroke();
    } else {
      H.roundRect(ctx, x + 20, by, full * k, barH, 6); ctx.fillStyle = i === 0 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)'; ctx.fill();
    }
    ctx.restore();
  }
  if (chipH) {
    let cx = x + 18; const cy = y + 26 + rows * (barH + gap) + 2;
    ctx.font = H.font('ui', 19);
    chips.forEach((c, i) => {
      const p = cp[i] || 0; ctx.font = H.font('ui', 19); const cw = ctx.measureText(c).width + 48;
      if (p > 0) {
        ctx.save(); ctx.translate(cx + cw / 2, cy + chipH / 2); ctx.scale(p, p); ctx.translate(-(cx + cw / 2), -(cy + chipH / 2));
        H.roundRect(ctx, cx, cy, cw, chipH - 6, 14); ctx.fillStyle = '#eef1f8'; ctx.fill();
        // link glyph
        ctx.strokeStyle = o.linkGlow ? o.acc : '#5a6487'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(cx + 18, cy + 21, 7, 4.5, -0.6, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx + 26, cy + 15, 7, 4.5, -0.6, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#1b2140'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.font = H.font('ui', 19); ctx.fillText(c, cx + 38, cy + chipH / 2 - 2);
        if (o.linkGlow) { ctx.fillStyle = o.acc; ctx.fillRect(cx + 38, cy + chipH / 2 + 10, (cw - 48) * o.linkGlow, 3); }
        ctx.restore();
      }
      cx += cw + 8;
    });
  }
  ctx.restore();
  return h;
}

function stamp(ctx, H, x, y, text, land, acc) {
  if (land <= 0) return;
  const k = H.clamp(land), s = 1 + 1.2 * (1 - H.easeOutCubic(k));
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.12); ctx.scale(s, s); ctx.globalAlpha = H.clamp(k * 3);
  ctx.font = H.font('display', 44);
  const w = ctx.measureText(text).width + 90;
  H.roundRect(ctx, -w / 2, -40, w, 80, 16); ctx.fillStyle = 'rgba(12,14,26,0.9)'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = acc; ctx.stroke();
  ctx.strokeStyle = acc; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-w / 2 + 22, 0); ctx.lineTo(-w / 2 + 36, 14); ctx.lineTo(-w / 2 + 60, -14); ctx.stroke();
  ctx.fillStyle = acc; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, -w / 2 + 72, 3);
  ctx.restore();
}

function fmt(n) { return Math.round(n).toLocaleString('en-US'); }

// mini person bust with a glowing phone (crowd grid)
function miniPerson(ctx, H, x, y, s, i, acc, pop, starPop) {
  if (pop <= 0) return;
  const skins = ['#f1c7a0', '#d9a77c', '#b07a52', '#7d5236', '#f6d6b8'];
  const shirts = ['#4f86c6', '#c95b4a', '#5aa88a', '#d9a94f', '#8a6cc6', '#3f7f86'];
  ctx.save(); ctx.translate(x, y); ctx.scale(s * pop, s * pop);
  H.roundRect(ctx, -26, -18, 52, 40, 18); ctx.fillStyle = shirts[i % shirts.length]; ctx.fill();
  ctx.beginPath(); ctx.arc(0, -36, 18, 0, Math.PI * 2); ctx.fillStyle = skins[(i * 7) % skins.length]; ctx.fill();
  ctx.fillStyle = '#2b2233'; ctx.beginPath(); ctx.arc(0, -42, 18, Math.PI, 0); ctx.fill();
  H.roundRect(ctx, 6, -10, 16, 26, 4); ctx.fillStyle = '#1b1f33'; ctx.fill();
  H.roundRect(ctx, 8, -8, 12, 20, 3); ctx.fillStyle = H.rgba(acc, 0.85); ctx.fill();
  ctx.restore();
  if (starPop > 0) { ctx.save(); ctx.translate(x + 22 * s, y - 62 * s); ctx.scale(starPop, starPop); star(ctx, 0, 0, 11 * s, acc); ctx.restore(); }
}

// ---------------------------------------------------------------- hook
function hook(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent;
  K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 487, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  K.world.city(ctx, { t, time: 'night', groundY: 1040 });
  // people rating on their phones
  const ppl = [[160, 1.25, 1, 0.5], [820, 1.25, 3, 1.3]];
  ppl.forEach(([x, s, shirt, st], i) => {
    K.drawPerson(ctx, x, 1040, s, { t, pose: 'phone', mood: t > st + 0.3 ? 'happy' : 'neutral', shirt, skin: i * 2 + 1, hair: i + 1, hairStyle: i ? 'long' : 'short', flip: i === 1, seed: 20 + i });
    const sp = K.popIn(t, st, 0.4);
    if (sp > 0) { ctx.save(); ctx.translate(x + (i ? -6 : 6), 1040 - 248 * s - 20 - 10 * H.clamp(t - st)); ctx.scale(sp, sp); star(ctx, 0, 0, 26, ACC, '#10131f'); ctx.restore(); }
  });
  // the phone, mid-action at frame 0
  const scr = bigPhone(ctx, H, K, 487, 530, 360, 525, { acc: ACC });
  const pad = 16;
  const qh = qBubble(ctx, H, scr.x + scr.w - pad, scr.y + 18, scr.w - 70, P.question || 'How can I improve my heart health?', 999, ACC, 1);
  const chips = P.chips || ['NEJM', 'JAMA', 'Nature'];
  const ay = scr.y + 18 + qh + 16;
  const ah = aBubble(ctx, H, K, scr.x + pad, ay, scr.w - 2 * pad, { t, rows: 3, prog: 0.5 + H.clamp(t / 0.9) * 0.5, chips,
    chipPop: chips.map((_, i) => K.popIn(t, 0.7 + i * 0.15, 0.3)), acc: ACC, pop: 1 });
  // star row
  const sy = ay + ah + 30;
  for (let i = 0; i < 5; i++) {
    const p = K.popIn(t, 1.2 + i * 0.16, 0.3);
    const sx = scr.x + scr.w / 2 + (i - 2) * 52;
    star(ctx, sx, sy, 19, null, 'rgba(255,255,255,0.35)');
    if (p > 0) { ctx.save(); ctx.translate(sx, sy); ctx.scale(p, p); star(ctx, 0, 0, 19, ACC); ctx.restore(); }
  }
  stamp(ctx, H, 590, 855, P.stamp || 'RATED', (t - 2.1) / 0.35, ACC);
  // counter pill
  const cp = K.popIn(t, 0.0, 0.35);
  const n = K.countUp(P.count || 200000, t, 0.0, 2.2);
  if (cp > 0) K.drawLabel(ctx, 487, 522, cp, { text: `${fmt(n)} ${P.countLabel || 'people'}`, size: 34, accent: true });
}

// ---------------------------------------------------------------- ask (2-beat span)
function ask(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent, at = cueFn(info);
  const b1 = (info.beats && info.beats[1]) ? info.beats[1].t0 : D * 0.55;
  const tP = (P.pillCues || ['launched', 'openevidence', 'doctors']).map((w, i) => at(w, 1 + i * 2));
  const tDl = at(P.downloadCue || 'download', D * 0.3);
  const tType = Math.max(tDl + 0.8, at(P.typeCue || 'type', D * 0.33));
  const tAns = Math.max(tType + 1.2, at(P.answerCue || 'answer', D * 0.42));
  const tTag = Math.max(tAns + 0.4, at(P.tagCue || 'plain', D * 0.48));
  const tBooks = Math.max(b1, at(P.booksCue || 'journals', b1 + 1));
  const tLink = Math.max(tBooks + 0.8, at(P.linkCue || 'links', b1 + 4));
  const tOpt = Math.max(tLink + 0.6, at(P.optCue || 'opt', b1 + 5.5));
  const tTiles = Math.max(tOpt + 0.6, at(P.tilesCue || 'data', b1 + 7));
  const hi = (P.hiCues || ['sleep', 'heart']).map((w) => at(w, Infinity));

  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: b1, zoom: 1.03, x: 500, y: 735 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  K.world.room(ctx, { t, time: 'night', wall: '#262c4e', floor: '#1b2040', window: true, picture: false, lamp: true, plant: true });

  // person looking at their phone
  const reading = t > tAns;
  K.drawPerson(ctx, 190, 1040, 1.5, { t, pose: 'phone', mood: reading ? 'happy' : 'neutral', typing: t > tType && t < tAns ? 1 : 0, skin: 1, hair: 2, hairStyle: 'bun', shirt: 4, seed: 4 });
  // zoom guide from the small phone to the big phone
  const g = K.phase(t, 0.2, 0.9);
  if (g > 0) {
    ctx.save(); ctx.globalAlpha = 0.25 * g; ctx.fillStyle = ACC;
    ctx.beginPath(); ctx.moveTo(232, 860); ctx.lineTo(418, 560); ctx.lineTo(418, 1010); ctx.closePath(); ctx.fill(); ctx.restore();
  }

  // pills (beat 1), replaced by books (beat 2)
  const out1 = K.phase(t, b1 - 0.3, b1 + 0.2);
  const pills = P.pills || ['Apple study', '+ OpenEvidence', 'Used by doctors'];
  pills.forEach((txt, i) => {
    const p = K.popIn(t, tP[i] - 0.15, 0.4) * (1 - out1);
    if (p > 0) K.drawLabel(ctx, 258, 505 + i * 62, p, { text: txt, size: 24, accent: i === 1, dot: i !== 1 });
  });
  const chips = P.chips || ['NEJM', 'JAMA', 'Nature'];
  const bookCols = ['#c95b4a', '#4f86c6', '#5aa88a'];

  // the big phone
  const scr = bigPhone(ctx, H, K, 615, 440, 400, 600, { acc: ACC, title: P.app || 'Health study' });
  ctx.save(); H.roundRect(ctx, scr.x, scr.y, scr.w, scr.h, 0); ctx.clip();
  const pad = 18;
  // splash until download
  const sw = K.phase(t, tDl + 0.2, tDl + 0.7);
  if (sw < 1) {
    ctx.save(); ctx.globalAlpha = 1 - sw; ctx.translate(-sw * 80, 0);
    const cx = scr.x + scr.w / 2;
    appIcon(ctx, H, cx, scr.y + 130, 1.3 + 0.04 * Math.sin(t * 3), ACC);
    ctx.font = H.font('display', 34); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.splash || 'Health AI study', cx, scr.y + 250);
    ctx.font = H.font('body', 24); ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(P.splashSub || 'Research app', cx, scr.y + 292);
    const press = K.phase(t, tDl - 0.1, tDl + 0.15) * (1 - K.phase(t, tDl + 0.15, tDl + 0.35));
    ctx.save(); ctx.translate(cx, scr.y + 380); ctx.scale(1 - 0.08 * press, 1 - 0.08 * press);
    H.roundRect(ctx, -120, -34, 240, 68, 34); ctx.fillStyle = ACC; ctx.fill();
    ctx.font = H.font('ui', 28); ctx.fillStyle = '#10131f'; ctx.fillText(P.join || 'Join study', 0, 2);
    ctx.restore();
    ctx.restore();
  }
  if (sw > 0) {
    ctx.save(); ctx.globalAlpha = sw; ctx.translate((1 - sw) * 80, 0);
    // scroll up when the data card arrives
    const scroll = 245 * K.phase(t, tOpt - 0.1, tOpt + 0.6, H.easeInOutCubic);
    ctx.translate(0, -scroll);
    const q = P.question || 'How can I improve my heart health?';
    const qShown = Math.floor(H.clamp((t - tType) / 1.3) * q.length);
    let y = scr.y + 22;
    const qp = t > tType - 0.1 ? 1 : 0;
    const qh = qBubble(ctx, H, scr.x + scr.w - pad, y, scr.w - 80, q, qShown, ACC, qp);
    if (qp && qShown < q.length && Math.floor(t * 3) % 2 === 0) { /* caret blink via partial text */ }
    y += qh + 18;
    const ap = K.popIn(t, tAns - 0.1, 0.35);
    // typing dots before the answer
    if (t > tType + 1.3 && t < tAns - 0.1) {
      H.roundRect(ctx, scr.x + pad, y, 90, 44, 22); ctx.fillStyle = '#262c46'; ctx.fill();
      for (let d = 0; d < 3; d++) { ctx.beginPath(); ctx.arc(scr.x + pad + 26 + d * 19, y + 22 - 4 * Math.sin(t * 9 - d), 5, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill(); }
    }
    const aw = scr.w - 2 * pad;
    const ah = aBubble(ctx, H, K, scr.x + pad, y, aw, { t, rows: 5, prog: H.clamp((t - tAns) / 1.6), chips,
      chipPop: chips.map((_, i) => K.popIn(t, tBooks + 0.75 + i * 0.35, 0.3)), linkGlow: K.phase(t, tLink, tLink + 0.6), acc: ACC, pop: ap });
    const tg = K.popIn(t, tTag - 0.1, 0.4);
    if (tg > 0) K.drawLabel(ctx, scr.x + scr.w - 110, y + 4, tg, { text: P.tag || 'Plain English', size: 22, accent: true });
    y += ah + 22;
    // opt-in card
    const op = K.popIn(t, tOpt, 0.4);
    if (op > 0) {
      ctx.save(); ctx.translate(scr.x + scr.w / 2, y + 40); ctx.scale(op, op); ctx.translate(-(scr.x + scr.w / 2), -(y + 40));
      H.roundRect(ctx, scr.x + pad, y, scr.w - 2 * pad, 80, 20); ctx.fillStyle = '#1d2340'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.stroke();
      ctx.font = H.font('ui', 24); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(P.toggle || 'Share health data?', scr.x + pad + 20, y + 40);
      const on = K.phase(t, tOpt + 0.5, tOpt + 0.8);
      const tx = scr.x + scr.w - pad - 96;
      H.roundRect(ctx, tx, y + 22, 76, 38, 19); ctx.fillStyle = H.mixHex('#4a5170', ACC, on); ctx.fill();
      ctx.beginPath(); ctx.arc(tx + 19 + 38 * on, y + 41, 15, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.restore();
    }
    y += 98;
    // data tiles 2x2
    const tiles = P.tiles || ['Sleep', 'Heart rate', 'Activity', 'Lab results'];
    const tw = (scr.w - 2 * pad - 14) / 2;
    tiles.forEach((txt, i) => {
      const p = K.popIn(t, tTiles + i * 0.18, 0.35);
      if (p <= 0) return;
      const tx = scr.x + pad + (i % 2) * (tw + 14), ty = y + Math.floor(i / 2) * 82;
      const lit = i < hi.length ? K.phase(t, hi[i] - 0.1, hi[i] + 0.3) : 0;
      ctx.save(); ctx.translate(tx + tw / 2, ty + 36); ctx.scale(p, p); ctx.translate(-(tx + tw / 2), -(ty + 36));
      H.roundRect(ctx, tx, ty, tw, 72, 18); ctx.fillStyle = H.mixHex('#262c46', '#3a4266', lit); ctx.fill();
      if (lit > 0) { ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(ACC, lit); ctx.stroke(); }
      icon(ctx, H, TILE_ICONS[i % 4], tx + 28, ty + 36, 13, i === 1 ? '#ff5d6c' : ACC);
      ctx.font = H.font('ui', H.fitText(ctx, txt, 'ui', 23, 18, tw - 58)); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(txt, tx + 50, ty + 37);
      ctx.restore();
    });
    ctx.restore();
  }
  ctx.restore(); // clip

  // books fly from the left into the source chips (beat 2)
  chips.forEach((c, i) => {
    const appear = K.popIn(t, tBooks - 0.2 + i * 0.12, 0.4);
    if (appear <= 0) return;
    const fly = K.phase(t, tBooks + 0.4 + i * 0.35, tBooks + 0.85 + i * 0.35, H.easeInOutCubic);
    const bx0 = 165 + i * 88, by0 = 600;
    const bx1 = 520 + i * 90, by1 = 790;
    const bx = H.lerp(bx0, bx1, fly), by = H.lerp(by0, by1, fly) - Math.sin(fly * Math.PI) * 120;
    const s = appear * (1 - 0.7 * fly) * (fly >= 1 ? 0 : 1);
    if (s <= 0) return;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-0.08 + i * 0.08 + fly * 0.6); ctx.scale(s, s);
    H.roundRect(ctx, -38, -56, 76, 112, 8); ctx.fillStyle = bookCols[i]; ctx.fill();
    ctx.fillStyle = '#f2ead7'; ctx.fillRect(28, -50, 6, 100);
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.font = H.font('ui', H.fitText(ctx, c, 'ui', 20, 13, 60)); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(c, -2, -8);
    ctx.fillRect(-24, 14, 46, 4);
    ctx.restore();
  });
  const jl = K.popIn(t, tBooks - 0.2, 0.4) * (1 - K.phase(t, tOpt - 0.3, tOpt));
  if (jl > 0) K.drawLabel(ctx, 258, 505, jl, { text: P.booksLabel || 'Medical journals', size: 24, dot: true });
}

// ---------------------------------------------------------------- grade
function grade(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent, at = cueFn(info);
  const tG = at(P.gradeCue || 'grade', 0.4);
  const tR = Math.max(tG + 0.6, at(P.rateCue || 'rate', 1.4));
  const tS = Math.max(tR + 0.6, at(P.surveyCue || 'surveys', 2.6));
  const tC = Math.max(tS + 0.8, at(P.countCue || '200000', D * 0.55));
  const tPl = (P.pillCues || ['21', 'older']).map((w, i) => Math.max(tC + 0.6 + i * 0.4, at(w, tC + 1.4 + i * 0.5)));

  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.02, x: 487, y: 725 }]);
  K.world.room(ctx, { t, time: 'night', wall: '#262c4e', floor: '#1b2040', window: false, picture: false, lamp: false, plant: true });

  const lift = K.phase(t, tC - 0.35, tC + 0.25, H.easeInOutCubic);
  // phase A: phone with rating + survey clipboard
  if (lift < 1) {
    ctx.save(); ctx.globalAlpha = 1 - lift; ctx.translate(0, -lift * 160);
    const scr = bigPhone(ctx, H, K, 365, 450, 380, 590, { acc: ACC, title: P.app || 'Health study' });
    const pad = 18;
    const ah = aBubble(ctx, H, K, scr.x + pad, scr.y + 20, scr.w - 2 * pad - 20, { t, rows: 4, prog: 1, chips: P.chips || ['NEJM', 'JAMA', 'Nature'], chipPop: [1, 1, 1], acc: ACC, pop: 1 });
    let y = scr.y + 20 + ah + 24;
    const rp = K.popIn(t, tG - 0.2, 0.4);
    if (rp > 0) {
      ctx.save(); ctx.translate(scr.x + scr.w / 2, y + 80); ctx.scale(rp, rp); ctx.translate(-(scr.x + scr.w / 2), -(y + 80));
      H.roundRect(ctx, scr.x + pad, y, scr.w - 2 * pad, 170, 22); ctx.fillStyle = '#1d2340'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = H.rgba(ACC, 0.5); ctx.stroke();
      ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(P.rateHead || 'Rate this answer', scr.x + scr.w / 2, y + 36);
      for (let i = 0; i < 5; i++) {
        const sx = scr.x + scr.w / 2 + (i - 2) * 56, sy = y + 90;
        star(ctx, sx, sy, 22, null, 'rgba(255,255,255,0.35)');
        const p = K.popIn(t, tG + 0.15 + i * 0.14, 0.3) * (i < 4 ? 1 : K.popIn(t, tR + 0.3, 0.3));
        if (p > 0) { ctx.save(); ctx.translate(sx, sy); ctx.scale(p, p); star(ctx, 0, 0, 22, ACC); ctx.restore(); }
      }
      // thumbs up (rounded block + thumb), pulses on rate
      const tp = K.popIn(t, tR, 0.35);
      if (tp > 0) {
        ctx.save(); ctx.translate(scr.x + scr.w / 2, y + 142); ctx.scale(tp, tp);
        ctx.font = H.font('ui', 22); ctx.fillStyle = ACC; ctx.fillText(P.sent || 'Feedback sent', 0, 0);
        ctx.restore();
      }
      ctx.restore();
    }
    // survey clipboard
    const cs = K.slideIn(t, tS - 0.3, 0.5, 260), ca = K.fadeIn(t, tS - 0.3, 0.3);
    if (ca > 0) {
      ctx.save(); ctx.globalAlpha *= ca; ctx.translate(740 + cs, 760); ctx.rotate(0.05);
      H.roundRect(ctx, -120, -170, 240, 330, 18); ctx.fillStyle = '#a9773f'; ctx.fill();
      H.roundRect(ctx, -104, -150, 208, 296, 10); ctx.fillStyle = '#f4f1e8'; ctx.fill();
      H.roundRect(ctx, -44, -186, 88, 36, 10); ctx.fillStyle = '#7a8296'; ctx.fill();
      ctx.font = H.font('display', 30); ctx.fillStyle = '#1b2140'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(P.survey || 'Survey', 0, -112);
      for (let r = 0; r < 4; r++) {
        const ry = -58 + r * 54;
        ctx.lineWidth = 3; ctx.strokeStyle = '#5a6487'; ctx.strokeRect(-84, ry - 15, 30, 30);
        ctx.fillStyle = '#c9cede'; H.roundRect(ctx, -40, ry - 6, 120 - r * 12, 12, 6); ctx.fill();
        const tk = K.phase(t, tS + 0.2 + r * 0.25, tS + 0.4 + r * 0.25);
        if (tk > 0) {
          ctx.strokeStyle = '#2f9e6a'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          K.pathDraw(ctx, [[-80, ry], [-71, ry + 9], [-56, ry - 12]], tk);
        }
      }
      ctx.restore();
    }
    ctx.restore();
  }
  // phase B: crowd grid + counter
  if (lift > 0) {
    const cols = 7, rows = 4;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const x = 200 + c * 92 + (r % 2 ? 22 : -8), y = 805 + r * 78;
      const d = tC - 0.1 + (H.hash(i, 11) * 0.9);
      miniPerson(ctx, H, x, y, 1.05, i, ACC, K.popIn(t, d, 0.35), K.popIn(t, d + 0.6 + H.hash(i, 5) * 1.2, 0.3));
    }
    const cp = K.popIn(t, tC - 0.2, 0.4);
    if (cp > 0) {
      ctx.save(); ctx.translate(487, 560); ctx.scale(cp, cp);
      ctx.font = H.font('ui', 30); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(P.upTo || 'up to', 0, -82);
      ctx.font = H.font('display', 118); ctx.fillStyle = ACC;
      ctx.fillText(fmt(K.countUp(P.count || 200000, t, tC - 0.2, 1.3)), 0, 0);
      ctx.font = H.font('ui', 32); ctx.fillStyle = '#ffffff';
      ctx.fillText(P.countLabel || 'people', 0, 78);
      ctx.restore();
    }
    const pl = P.pills || ['Age 21+', 'United States'];
    pl.forEach((txt, i) => {
      const p = K.popIn(t, tPl[i] - 0.15, 0.4);
      if (p > 0) K.drawLabel(ctx, 330 + i * 320, 712, p, { text: txt, size: 28, accent: i === 0, dot: i !== 0 });
    });
  }
}

// ---------------------------------------------------------------- crowd
function crowd(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent, at = cueFn(info);
  const tSrc = at(P.sourceCue || 'openai', 0.8);
  const tCnt = Math.max(tSrc + 0.5, at(P.countCue || '230', 2.5));
  const tMore = at(P.moreCue || 'already', D * 0.45);
  const tA = (P.askCues || ['trust', 'act']).map((w, i) => Math.max(tMore + 0.8 + i * 0.6, at(w, D * (0.7 + i * 0.12))));

  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 700 }]);
  K.world.city(ctx, { t, time: 'night', groundY: 1040 });
  // rising question bubbles from the city
  const rate = 3 + 6 * K.phase(t, tCnt, tCnt + 1.5) + 6 * K.phase(t, tMore, tMore + 1);
  const N = 60;
  for (let i = 0; i < N; i++) {
    const period = 3.2 + 1.6 * H.hash(i, 1);
    const start = H.hash(i, 2) * period;
    if (i / N * 15 > rate) continue;
    const u = ((t + start) % period) / period;
    const x = 110 + H.hash(i, 3) * 760 + Math.sin(t * 1.3 + i) * 10;
    const y = 1000 - H.hash(i, 4) * 120 - u * 330;
    const a = Math.sin(u * Math.PI) * 0.9;
    const kind = ['q', 'heart', 'plus'][i % 3];
    ctx.save(); ctx.globalAlpha = a;
    const r = 22 + 6 * H.hash(i, 6);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(244,246,251,0.92)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 6, y + r - 3); ctx.lineTo(x - 12, y + r + 10); ctx.lineTo(x + 4, y + r - 2); ctx.fill();
    icon(ctx, H, kind, x, y, r * 0.5, kind === 'heart' ? '#ff5d6c' : kind === 'plus' ? '#2f9e6a' : '#1b2140');
    ctx.restore();
  }
  // people on phones in front
  K.drawPerson(ctx, 175, 1040, 1.25, { t, pose: 'phone', mood: 'neutral', skin: 3, hair: 1, hairStyle: 'curly', shirt: 2, seed: 31 });
  K.drawPerson(ctx, 800, 1040, 1.25, { t, pose: 'phone', mood: 'worried', skin: 0, hair: 3, hairStyle: 'short', shirt: 0, flip: true, seed: 32 });

  // counter panel; lifts and shrinks when the questions arrive
  const lift = K.phase(t, tA[0] - 0.4, tA[0] + 0.1, H.easeInOutCubic);
  const sp = K.popIn(t, tSrc - 0.15, 0.4) * (1 - lift);
  if (sp > 0) K.drawLabel(ctx, 487, 505, sp, { text: P.source || 'OpenAI, January 2026', size: 26, dot: true });
  const cp = K.popIn(t, tCnt - 0.2, 0.45) * (1 - lift);
  if (cp > 0) {
    ctx.save(); ctx.translate(487, 640); ctx.scale(cp, cp);
    H.roundRect(ctx, -330, -105, 660, 210, 30); ctx.fillStyle = 'rgba(10,12,24,0.88)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = H.rgba(ACC, 0.6); ctx.stroke();
    ctx.font = H.font('display', 104); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${Math.round(K.countUp(P.value || 230, t, tCnt - 0.2, 1.2))}${P.unit || 'M+'}`, 0, -28);
    ctx.font = H.font('ui', 28); ctx.fillStyle = '#ffffff';
    const sub = P.sub || 'people a week ask ChatGPT health questions';
    const sz = H.fitText(ctx, sub, 'ui', 28, 20, 600); ctx.font = H.font('ui', sz);
    ctx.fillText(sub, 0, 58);
    ctx.restore();
  }
  // the two questions the study asks
  const asks = P.asks || ['Do they trust it?', 'Do they act on it?'];
  asks.forEach((txt, i) => {
    const p = K.popIn(t, tA[i] - 0.15, 0.45);
    if (p <= 0) return;
    ctx.save(); ctx.translate(487, 545 + i * 120); ctx.scale(p, p);
    ctx.font = H.font('display', 50);
    const w = ctx.measureText(txt).width + 120;
    H.roundRect(ctx, -w / 2, -48, w, 96, 48); ctx.fillStyle = i ? ACC : 'rgba(10,12,24,0.9)'; ctx.fill();
    if (!i) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke(); }
    ctx.beginPath(); ctx.arc(-w / 2 + 48, 0, 20, 0, Math.PI * 2); ctx.fillStyle = i ? '#10131f' : ACC; ctx.fill();
    ctx.fillStyle = i ? '#10131f' : '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(txt, -w / 2 + 84, 3);
    ctx.restore();
  });
}

// ---------------------------------------------------------------- caveat
function caveat(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent, at = cueFn(info);
  const tQ = at(P.quoteCue || 'words', 0.8);
  const tGap = Math.max(tQ + 0.6, at(P.gapCue || 'incomplete', tQ + 2.5));
  const tBlur = Math.max(tGap + 0.4, at(P.blurCue || 'unclear', tQ + 3.2));
  const tN = (P.noteCues || ['diagnose', 'train']).map((w, i) => Math.max(tBlur + 1 + i * 0.8, at(w, D * (0.62 + i * 0.2))));

  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 740 }]);
  K.world.room(ctx, { t, time: 'night', wall: '#232846', floor: '#191d38', window: true, picture: false, lamp: true, plant: false });

  const worried = t > tGap && t < tN[0];
  K.drawPerson(ctx, 200, 1040, 1.25, { t, pose: worried ? 'shrug' : 'phone', mood: worried ? 'worried' : 'neutral', skin: 2, hair: 0, hairStyle: 'short', shirt: 1, seed: 41 });
  // phone with an answer that turns incomplete / unclear
  const scr = bigPhone(ctx, H, K, 640, 745, 330, 300, { acc: ACC, title: P.app || 'Health study' });
  const gp = K.phase(t, tGap, tGap + 0.5), bp = K.phase(t, tBlur, tBlur + 0.5);
  const fix = K.phase(t, tN[0] - 0.2, tN[0] + 0.4); // calm down once the notes arrive
  aBubble(ctx, H, K, scr.x + 16, scr.y + 12, scr.w - 32, { t, rows: 4, prog: 1, pop: 1, acc: ACC,
    broken: (i) => (i === 3) ? (gp > 0 ? { dash: true, alpha: 1 - 0.3 * gp } : null)
      : (i === 1 || i === 2) ? (bp > 0 ? { wob: 6 * bp * (1 - fix), alpha: 1 - 0.55 * bp } : null) : null });
  if (bp > 0) {
    for (let k = 0; k < 2; k++) {
      const p = K.popIn(t, tBlur + k * 0.2, 0.35);
      ctx.save(); ctx.translate(scr.x + scr.w - 40 - k * 46, scr.y + 40 + k * 36 + Math.sin(t * 3 + k) * 4); ctx.scale(p, p);
      ctx.font = H.font('display', 44); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 0);
      ctx.restore();
    }
  }

  // quote panel (text only)
  const qOut = K.phase(t, tN[0] - 0.35, tN[0]);
  const qp = K.popIn(t, tQ - 0.2, 0.45) * (1 - qOut);
  if (qp > 0) {
    ctx.save(); ctx.translate(487, 590); ctx.scale(Math.min(1.02, qp), Math.min(1.02, qp)); ctx.globalAlpha = H.clamp(qp * 2);
    H.roundRect(ctx, -400, -125, 800, 250, 26); ctx.fillStyle = 'rgba(10,12,24,0.92)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
    ctx.font = H.font('ui', 26); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.lead || 'Apple, on health AI tools:', 0, -88);
    const q = P.quote || '“may at times offer responses that are incomplete or unclear”';
    const lines = H.wrap(ctx, q, 'display', 38, 720);
    ctx.font = H.font('display', 38);
    const words = q.split(' '), shown = Math.ceil(words.length * H.clamp((t - tQ) / 2.2));
    let used = 0;
    lines.forEach((ln, i) => {
      const lw = ln.split(' '); const n = Math.max(0, Math.min(lw.length, shown - used)); used += lw.length;
      ctx.fillStyle = '#ffffff';
      // the two key words in the accent once spoken
      const txt = lw.slice(0, n).join(' ');
      ctx.textAlign = 'center';
      if (n > 0) ctx.fillText(txt, 0, -30 + i * 48);
    });
    ctx.font = H.font('ui', 24); ctx.fillStyle = ACC;
    ctx.fillText(P.by || '— Apple, study announcement', 0, 92);
    ctx.restore();
  }
  // notes
  const notes = P.notes || ['Not meant to diagnose', 'Study data won’t train AI'];
  notes.forEach((txt, i) => {
    const p = K.popIn(t, tN[i] - 0.15, 0.45);
    if (p <= 0) return;
    ctx.save(); ctx.translate(487, 540 + i * 110); ctx.scale(p, p);
    ctx.font = H.font('display', 42);
    const w = ctx.measureText(txt).width + 120;
    H.roundRect(ctx, -w / 2, -44, w, 88, 44); ctx.fillStyle = i ? ACC : 'rgba(10,12,24,0.92)'; ctx.fill();
    if (!i) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke(); }
    const ix = -w / 2 + 48;
    if (i === 0) {
      ctx.strokeStyle = '#ff5d6c'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ix - 13, -13); ctx.lineTo(ix + 13, 13); ctx.moveTo(ix + 13, -13); ctx.lineTo(ix - 13, 13); ctx.stroke();
    } else {
      K.drawLock(ctx, ix, 22, 0.36, { open: 0 });
    }
    ctx.fillStyle = i ? '#10131f' : '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(txt, -w / 2 + 84, 3);
    ctx.restore();
  });
}
