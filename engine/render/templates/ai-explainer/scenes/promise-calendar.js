// Scene "promise-calendar" (full frame; was odyssey-promise, 2026-10-26). A night pin-board wall: a row of month chips
// with a marker that walks from the promise month to "Now" while a generic post card (text only, the author is never
// drawn) types out a verbatim quote; key words light up in the accent colour; an extra claim pill lands; the kit robot
// looks on, thinking. Fits: "X promised Y by a date", deadlines, pledges vs reality.
// params: months [6], promiseIdx (0), nowIdx (3), deadlineIdx (5), promiseLabel, nowLabel, deadlineLabel, by
//         (attribution line), quote, hot [words to light], extra (pill), cues: promiseCue, postCue, quoteCue,
//         quoteEndCue, extraCue ("word#n" = the (n+1)th time spoken; without them fixed fractions of the scene)
// Defaults are generic placeholders; pass the story's months, verbatim quote and attribution.
export default function draw(ctx, t, info) {
  const L = filmLib(ctx, info);
  const { H, K, ACC, rr, circ, at, pill, reel } = L;
  const P = info.params || {}, D = info.duration;
  const tProm = at(P.promiseCue, D * 0.25), tPost = at(P.postCue, D * 0.33);
  const tQ0 = at(P.quoteCue, D * 0.42), tQ1 = at(P.quoteEndCue, D * 0.8), tX = at(P.extraCue, D * 0.86);

  // ---- wall
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#141838'); g.addColorStop(0.55, '#1d2250'); g.addColorStop(1, '#080916');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  // cork-ish board
  rr(50, 420, 875, 600, 26, '#2a2552'); rr(62, 432, 851, 576, 20, '#332d63');
  for (let i = 0; i < 40; i++) circ(80 + H.hash(i, 3) * 820, 450 + H.hash(i, 4) * 540, 2 + H.hash(i, 5) * 2, 'rgba(255,255,255,0.06)');
  const fg = ctx.createLinearGradient(0, 1040, 0, 1920); fg.addColorStop(0, '#20244a'); fg.addColorStop(1, '#07080f');
  ctx.fillStyle = fg; ctx.fillRect(0, 1040, 1080, 880);
  K.glow(ctx, 487, 700, 520, ACC, 0.05);
  ctx.save();
  const z = H.lerp(1, 1.035, K.phase(t, 0, D)); ctx.translate(487, 740); ctx.scale(z, z); ctx.translate(-487, -740);

  // ---- month chips
  const months = P.months || ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'];
  const pi = P.promiseIdx || 0, ni = P.nowIdx == null ? 3 : P.nowIdx, di = P.deadlineIdx == null ? 5 : P.deadlineIdx;
  const CX = (i) => 146 + i * 136, CY = 470;
  const walk = K.phase(t, tPost + 0.3, tQ1, H.easeInOutCubic) * (ni - pi);
  months.forEach((m, i) => {
    const k = K.popIn(t, 0.15 + i * 0.12, 0.4);
    if (k <= 0) return;
    ctx.save(); ctx.translate(CX(i), CY + 32); ctx.scale(k, k);
    const lit = (i === pi && t > tProm) || (i <= pi + walk + 0.01 && i >= pi && t > tProm);
    const isDead = i === di;
    rr(-58, -32, 116, 64, 14, lit ? ACC : (isDead ? '#3a2f5c' : '#262c5a'));
    if (isDead) { ctx.lineWidth = 3; ctx.setLineDash([8, 6]); ctx.strokeStyle = '#ff6b5e'; H.roundRect(ctx, -58, -32, 116, 64, 14); ctx.stroke(); ctx.setLineDash([]); }
    ctx.font = K.font.display(30); ctx.fillStyle = lit ? '#10142a' : '#c9cff0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(m, 0, 2);
    ctx.restore();
  });
  // labels under chips
  const lab = (i, txt, k, col) => { if (k <= 0) return; ctx.save(); ctx.globalAlpha = Math.min(1, k); ctx.font = K.font.ui(24); ctx.fillStyle = col; ctx.textAlign = 'center'; ctx.fillText(txt, Math.min(860, Math.max(110, CX(i))), CY + 100); ctx.restore(); };
  lab(pi, P.promiseLabel || 'Promise', K.popIn(t, tProm, 0.4), ACC);
  lab(di, P.deadlineLabel || 'Year end', K.popIn(t, 0.9, 0.4), '#ff9d92');
  // the "now" marker walks from the promise month
  const mk = K.popIn(t, tPost + 0.2, 0.4);
  if (mk > 0) {
    const mx = CX(pi) + walk * 136, bob = K.bob(t, 4, 2.2);
    ctx.save(); ctx.translate(mx, CY - 6 + bob); ctx.scale(mk, mk);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-14, -20); ctx.lineTo(14, -20); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.restore();
    lab(ni, P.nowLabel || 'Now', K.phase(t, tQ1 - 0.2, tQ1 + 0.3), '#ffffff');
  }

  // ---- the post card (text only)
  const ck = K.popIn(t, tPost - 0.2, 0.45);
  if (ck > 0) {
    const x0 = 90, y0 = 610, w = 795, h = 290;
    ctx.save(); ctx.translate(487, y0 + h / 2); ctx.scale(Math.min(1, ck), Math.min(1, ck)); ctx.translate(-487, -(y0 + h / 2));
    K.shadow(ctx, 487, y0 + h + 10, 700, 0.4);
    rr(x0, y0, w, h, 26, '#f2f4fa');
    // pin
    circ(487, y0 + 4, 14, '#ff6b5e'); circ(483, y0, 5, '#ffb3ab');
    // header: generic speech icon + attribution text
    ctx.fillStyle = '#2a2f45'; H.roundRect(ctx, x0 + 28, y0 + 26, 44, 34, 10); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x0 + 40, y0 + 58); ctx.lineTo(x0 + 36, y0 + 70); ctx.lineTo(x0 + 52, y0 + 58); ctx.closePath(); ctx.fill();
    ctx.font = K.font.ui(26); ctx.fillStyle = '#4a5170'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.by || 'A company boss, in a post', x0 + 88, y0 + 44);
    // quote, typed word by word between the quote cues
    const quote = P.quote || 'Quote goes here, with the key promise words lit up';
    const words = ('“' + quote + '”').split(' ');
    const hot = (P.hot || ['key', 'promise']).map((s) => s.toLowerCase());
    const shown = Math.floor(words.length * K.phase(t, tQ0, tQ1 + 0.2)) + (t > tQ0 ? 1 : 0);
    const size = 42; ctx.font = K.font.bold(size);
    let lx = x0 + 36, ly = y0 + 120; const maxX = x0 + w - 36;
    for (let i = 0; i < words.length; i++) {
      const wd = words[i], ww = ctx.measureText(wd + ' ').width;
      if (lx + ctx.measureText(wd).width > maxX) { lx = x0 + 36; ly += size * 1.22; }
      if (i < shown) {
        const isHot = hot.includes(wd.replace(/[^\w-]/g, '').toLowerCase()) && t > tQ1;
        if (isHot) { ctx.fillStyle = H.rgba(ACC, 0.55); ctx.fillRect(lx - 4, ly - size * 0.5, ctx.measureText(wd).width + 8, size * 0.95); }
        ctx.fillStyle = '#161927'; ctx.textBaseline = 'middle'; ctx.fillText(wd, lx, ly);
      }
      lx += ww;
    }
    // caret
    if (t > tQ0 && shown < words.length && Math.floor(t * 3) % 2 === 0) rr(lx, ly - 20, 4, 40, 2, '#161927');
    ctx.restore();
  }
  // ---- extra claim pill + robot + empty film reel
  pill(210, 990, K.popIn(t, tX, 0.45), P.extra || 'Also promised: something more', { left: true, size: 28, accent: true });
  const rk = K.popIn(t, 0.5, 0.5);
  if (rk > 0) {
    ctx.save(); ctx.globalAlpha = Math.min(1, rk);
    reel(140, 960, 50, t * 0.6, '#8a93a8');
    ctx.restore();
  }
  K.drawRobot(ctx, 840, 1040, 0.85, { t, state: t > tQ1 ? 'thinking' : 'idle', flip: true });
  ctx.restore();
}

// ---- shared drawing helpers for the film-set / promise-calendar / minute-reels / screening-room scenes (inlined into
// each module; modules cannot import siblings)
function filmLib(ctx, info) {
  const H = info.helpers, K = H.kit, ACC = info.accent;
  const TAU = Math.PI * 2;
  const rr = (x, y, w, h, r, col) => { H.roundRect(ctx, x, y, w, h, r); ctx.fillStyle = col; ctx.fill(); };
  const circ = (x, y, r, col) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = col; ctx.fill(); };
  const at = (w, d, n = 0) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w, n); return v == null ? d : v; };
  // pill: anchor = bottom-centre (or left edge with o.left); clamped inside x 70-905
  function pill(x, y, k, text, o = {}) {
    if (k <= 0) return;
    const size = o.size || 30;
    ctx.save(); ctx.font = K.font.ui(size); const w = ctx.measureText(String(text)).width + size * 1.4 + (o.dot ? size * 0.8 : 0) + 4; ctx.restore();
    let cx = o.left ? x + w / 2 : x;
    cx = Math.max(72 + w / 2, Math.min(903 - w / 2, cx));
    K.drawLabel(ctx, cx, y, Math.min(1.08, k), Object.assign({ text, size }, o));
  }
  // animated sea inside a rect (clipped). calm 0..1 slows it
  function sea(x, y, w, h, t, o = {}) {
    const time = o.time || 'dusk', speed = o.speed == null ? 1 : o.speed;
    ctx.save(); H.roundRect(ctx, x, y, w, h, o.r || 0); ctx.clip();
    const sky = ctx.createLinearGradient(0, y, 0, y + h);
    if (time === 'dusk') { sky.addColorStop(0, '#2b2b63'); sky.addColorStop(0.45, '#c86b6b'); sky.addColorStop(0.62, '#f2a46a'); }
    else { sky.addColorStop(0, '#3a6fb0'); sky.addColorStop(0.62, '#a9d1ee'); }
    ctx.fillStyle = sky; ctx.fillRect(x, y, w, h);
    const hz = y + h * 0.62;
    circ(x + w * 0.72, hz - h * 0.06, h * 0.12, time === 'dusk' ? '#ffd27a' : '#fff4c8');
    // far islands
    ctx.fillStyle = time === 'dusk' ? '#5a3f62' : '#5d86a8';
    ctx.beginPath(); ctx.moveTo(x + w * 0.05, hz); ctx.quadraticCurveTo(x + w * 0.16, hz - h * 0.14, x + w * 0.3, hz); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + w * 0.78, hz); ctx.quadraticCurveTo(x + w * 0.88, hz - h * 0.08, x + w * 0.98, hz); ctx.closePath(); ctx.fill();
    const sg = ctx.createLinearGradient(0, hz, 0, y + h); sg.addColorStop(0, time === 'dusk' ? '#3b4f8f' : '#2f74b5'); sg.addColorStop(1, '#162050');
    ctx.fillStyle = sg; ctx.fillRect(x, hz, w, y + h - hz);
    // sun glitter + wave dashes
    ctx.strokeStyle = 'rgba(255,230,190,0.55)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 18; i++) {
      const u = H.hash(i, 7), v = H.hash(i, 8);
      const wx = x + ((u * w + t * 26 * speed * (0.5 + v)) % (w + 60)) - 30, wy = hz + 8 + v * (y + h - hz - 16);
      const L = 14 + 26 * v;
      ctx.globalAlpha = 0.35 + 0.4 * Math.sin(t * 2 * speed + i);
      ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + L, wy); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    return hz;
  }
  // cartoon Greek galley; anchor = waterline centre. o.stall 0..1 (oars stop, sail droops), o.glow
  function ship(x, y, s, t, o = {}) {
    const stall = o.stall || 0, rows = 7;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.rotate(Math.sin(t * 1.3) * 0.03 * (1 - stall * 0.7));
    if (o.glow) K.glow(ctx, 0, -60, 200, ACC, 0.3 * o.glow);
    // mast + sail
    rr(-5, -230, 10, 210, 4, '#6b4630');
    const billow = (1 - stall) * (10 + 6 * Math.sin(t * 2)) + stall * -4;
    ctx.beginPath(); ctx.moveTo(-80, -215); ctx.quadraticCurveTo(-2, -215 - 8, 80, -215);
    ctx.quadraticCurveTo(84 + billow, -150, 80, -90 + stall * 12); ctx.quadraticCurveTo(0, -84 + billow + stall * 14, -80, -90 + stall * 12);
    ctx.quadraticCurveTo(-84 + billow, -150, -80, -215); ctx.closePath(); ctx.fillStyle = '#f1e6cf'; ctx.fill();
    ctx.save(); ctx.clip(); for (let i = 0; i < 4; i++) rr(-80 + i * 48, -230, 22, 160, 0, i % 2 ? '#f1e6cf' : (o.plain ? '#d8c9aa' : ACC)); ctx.restore();
    rr(-90, -222, 180, 10, 5, '#6b4630');
    // oars
    ctx.strokeStyle = '#8a5c3c'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let i = 0; i < rows; i++) {
      const ox = -100 + i * 32, ph = t * 4.2 * (1 - stall) + i * 0.1;
      const a = 0.5 + 0.28 * Math.sin(ph) * (1 - stall);
      ctx.beginPath(); ctx.moveTo(ox, -6); ctx.lineTo(ox - Math.cos(a) * 30, 46 * Math.sin(a) + 8); ctx.stroke();
    }
    // hull: curved, prow scroll at right, stern curl at left
    ctx.beginPath();
    ctx.moveTo(-150, -50); ctx.quadraticCurveTo(-140, -18, -110, -12);
    ctx.lineTo(120, -12); ctx.quadraticCurveTo(160, -20, 170, -70);
    ctx.quadraticCurveTo(178, -96, 160, -100); ctx.quadraticCurveTo(150, -88, 160, -76);
    ctx.quadraticCurveTo(150, 16, 100, 18); ctx.lineTo(-100, 18); ctx.quadraticCurveTo(-150, 10, -168, -60);
    ctx.quadraticCurveTo(-176, -90, -158, -92); ctx.quadraticCurveTo(-146, -80, -150, -50); ctx.closePath();
    ctx.fillStyle = '#8b5636'; ctx.fill();
    rr(-120, -16, 240, 10, 4, '#6a3f27');
    ctx.fillStyle = '#5e3722'; ctx.beginPath(); ctx.moveTo(-104, 4); ctx.lineTo(110, 4); ctx.lineTo(100, 18); ctx.lineTo(-100, 18); ctx.closePath(); ctx.fill();
    // shields along the rail
    for (let i = 0; i < 6; i++) { const sx = -90 + i * 36; circ(sx, -22, 13, i % 2 ? '#d9a441' : '#b8473f'); circ(sx, -22, 5, '#f1e6cf'); }
    // painted eye on the prow (stylised, as on ancient galleys)
    circ(132, -38, 9, '#f1e6cf'); circ(134, -38, 4.5, '#1c2033');
    // tiny crew heads with crested helmets
    for (let i = 0; i < 3; i++) {
      const hx = -60 + i * 50, hy = -44 + Math.sin(t * 3 + i) * 1.5 * (1 - stall);
      circ(hx, hy, 11, '#eab894');
      ctx.beginPath(); ctx.arc(hx, hy - 2, 12, Math.PI, 0); ctx.fillStyle = '#c9a24a'; ctx.fill();
      rr(hx - 3, hy - 26, 6, 14, 3, '#b8473f');
    }
    ctx.restore();
    // wake
    ctx.fillStyle = 'rgba(220,235,255,0.22)'; ctx.beginPath(); ctx.ellipse(x - 30 * s, y + 20 * s, 190 * s, 9 * s, 0, 0, TAU); ctx.fill();
  }
  // film camera on a tripod, anchor = feet. faces left (lens on the left)
  function camera(x, y, s, t, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 200);
    ctx.strokeStyle = '#3b4260'; ctx.lineWidth = 9; ctx.lineCap = 'round';
    for (const dx of [-70, 0, 70]) { ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(dx, 0); ctx.stroke(); }
    rr(-12, -175, 24, 40, 6, '#2a2f45');
    // body
    rr(-90, -280, 170, 110, 16, '#2a2f45'); rr(-90, -280, 170, 30, 14, '#3b4260');
    // reels
    for (const [rx, rr2] of [[-40, 44], [42, 40]]) {
      ctx.save(); ctx.translate(rx, -300 - rr2 + 12); ctx.rotate(t * (o.spin == null ? 2.4 : o.spin));
      circ(0, 0, rr2, '#3b4260'); circ(0, 0, rr2 - 8, '#1c2033');
      for (let k = 0; k < 5; k++) { const a = k * TAU / 5; circ(Math.cos(a) * rr2 * 0.5, Math.sin(a) * rr2 * 0.5, rr2 * 0.17, '#3b4260'); }
      circ(0, 0, 7, '#8a93a8'); ctx.restore();
    }
    // lens
    rr(-140, -258, 56, 66, 10, '#3b4260'); rr(-156, -264, 20, 78, 8, '#1c2033');
    K.glow(ctx, -146, -225, 50, ACC, 0.25 + 0.15 * Math.sin(t * 3));
    // REC light
    const on = Math.floor(t * 1.6) % 2 === 0;
    circ(56, -262, 8, on ? '#ff6b5e' : '#5a2a2a');
    rr(-60, -232, 90, 34, 8, '#1c2033');
    ctx.font = K.font.ui(20); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.text || 'REC', -15, -214);
    ctx.restore();
  }
  // clapperboard; anchor = bottom centre. open 0..1 (top arm angle), lines = [title, sub]
  function clapper(x, y, s, open, lines) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 6, 260);
    rr(-150, -200, 300, 200, 14, '#1c2033'); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; H.roundRect(ctx, -150, -200, 300, 200, 14); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-136, -110); ctx.lineTo(136, -110); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const f1 = H.fitText(ctx, lines[0], 'display', 44, 24, 270); ctx.font = f1.font; ctx.fillStyle = '#ffffff'; ctx.fillText(lines[0], 0, -152);
    const f2 = H.fitText(ctx, lines[1], 'display', 52, 24, 270); ctx.font = f2.font; ctx.fillStyle = ACC; ctx.fillText(lines[1], 0, -58);
    // striped bars
    const bar = (rot) => {
      ctx.save(); ctx.translate(-150, -204); ctx.rotate(rot);
      rr(0, -40, 300, 40, 6, '#f2f4fa');
      ctx.save(); H.roundRect(ctx, 0, -40, 300, 40, 6); ctx.clip();
      ctx.fillStyle = '#1c2033';
      for (let i = -1; i < 7; i++) { ctx.beginPath(); ctx.moveTo(i * 50 + 10, 0); ctx.lineTo(i * 50 + 34, -40); ctx.lineTo(i * 50 + 58, -40); ctx.lineTo(i * 50 + 34, 0); ctx.closePath(); ctx.fill(); }
      ctx.restore(); ctx.restore();
    };
    rr(-150, -204, 300, 6, 2, '#1c2033');
    bar(-0.55 * H.clamp(open));
    ctx.restore();
  }
  // film reel; centre anchor
  function reel(x, y, r, rot, col) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    circ(0, 0, r, col || '#8a93a8'); circ(0, 0, r * 0.86, '#2a2f45');
    for (let k = 0; k < 6; k++) { const a = k * TAU / 6; circ(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5, r * 0.18, col || '#8a93a8'); }
    circ(0, 0, r * 0.12, '#f2f4fa');
    ctx.restore();
  }
  // big outlined text
  function bigText(x, y, k, txt, size, col, maxW) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    const ft = H.fitText(ctx, txt, 'display', size, size * 0.5, maxW || 760);
    ctx.font = ft.font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    ctx.lineWidth = 14; ctx.strokeStyle = 'rgba(6,7,14,0.85)'; ctx.strokeText(txt, 0, 0);
    ctx.fillStyle = col || ACC; ctx.fillText(txt, 0, 0);
    ctx.restore();
  }
  return { H, K, ACC, TAU, rr, circ, at, pill, sea, ship, camera, clapper, reel, bigText };
}
