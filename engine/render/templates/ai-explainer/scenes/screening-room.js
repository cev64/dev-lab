// Scene "screening-room" (full frame, best as a 2-beat span; was odyssey-screening, 2026-10-26). A small dark screening
// room: an AI-made sea and a cartoon galley play on the screen; a cartoon reviewer with a notepad and popcorn watches
// from the front row. Beat 1: the reviewer's name pill, the picture sparkles and a "looks real" pill lands (reviewer
// impressed). Beat 2: the picture stalls and greys, a notes card slides in and up to 4 crossed notes tick in on cue
// (reviewer unimpressed). Fits: reviews of AI films / music / art, "impressive but..." stories.
// params: who, real, notesTitle, notes [{text, cue}] (4), cues: whoCue, realCue, turnCue ("word#n" = the (n+1)th time
// spoken; without them fixed fractions of the scene / beat 2). Defaults are generic placeholders.
export default function draw(ctx, t, info) {
  const L = filmLib(ctx, info);
  const { H, K, ACC, rr, circ, at, pill, sea, ship } = L;
  const P = info.params || {}, D = info.duration;
  const b2 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.6;
  const tWho = at(P.whoCue, Math.min(2.5, b2 * 0.3)), tReal = at(P.realCue, b2 * 0.75), tTurn = at(P.turnCue, b2 + 2.4);
  const notes = P.notes || [
    { text: 'Feels flat' }, { text: 'Stiff dialogue' }, { text: 'No momentum' }, { text: 'Details wrong' }];

  // ---- room
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#0a0c22'); g.addColorStop(0.5, '#141838'); g.addColorStop(1, '#05060d');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  // curtains at the sides
  for (const [x0, dir] of [[0, 1], [1080, -1]]) for (let i = 0; i < 4; i++) rr(dir > 0 ? x0 + i * 22 : x0 - (i + 1) * 22, 340, 26, 700, 12, i % 2 ? '#5a1f35' : '#6e2842');
  ctx.save();
  const z = H.lerp(1, 1.05, K.phase(t, 0, D)); ctx.translate(487, 720); ctx.scale(z, z); ctx.translate(-487, -720);

  // ---- screen
  const SX = 120, SY = 430, SW = 735, SH = 350;
  const stall = H.smooth((t - b2 - 0.3) / 1.2);
  const hz = sea(SX, SY, SW, SH, t, { time: 'day', speed: 1 - 0.85 * stall });
  ctx.save(); H.roundRect(ctx, SX, SY, SW, SH, 0); ctx.clip();
  const sx = SX + 260 + 260 * K.phase(t, 0, b2 + 1.5, H.easeInOutCubic);
  ship(sx, hz + 70, 0.9, t, { stall, glow: H.smooth((t - tReal) / 0.5) * (1 - stall) });
  // sparkles on "real"
  const sp = H.smooth((t - tReal) / 0.4) * (1 - stall);
  if (sp > 0) for (let i = 0; i < 8; i++) {
    const a = H.clamp(Math.sin((t - tReal) * 3 + i * 1.3)) * sp, px = SX + 60 + H.hash(i, 11) * (SW - 120), py = SY + 40 + H.hash(i, 12) * (SH - 80);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(px, py); ctx.rotate(t);
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); for (let k = 0; k < 8; k++) { const r = k % 2 ? 6 : 18, an = k * Math.PI / 4; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  if (stall > 0) { ctx.fillStyle = H.rgba('#3a3f55', 0.55 * stall); ctx.fillRect(SX, SY, SW, SH); }
  ctx.restore();
  ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 14; H.roundRect(ctx, SX - 7, SY - 7, SW + 14, SH + 14, 10); ctx.stroke();
  // projector beam
  ctx.save(); ctx.globalAlpha = 0.07; ctx.fillStyle = '#e8f0ff';
  ctx.beginPath(); ctx.moveTo(487, 1300); ctx.lineTo(SX, SY + SH); ctx.lineTo(SX + SW, SY + SH); ctx.closePath(); ctx.fill(); ctx.restore();

  // ---- seats (back row silhouettes) + reviewer in the front
  for (let i = 0; i < 7; i++) rr(60 + i * 130, 905, 110, 140, 26, '#2a1830');
  for (let i = 0; i < 7; i++) rr(60 + i * 130, 905, 110, 26, 13, '#3c2242');
  const impressed = t > tReal && t < tTurn;
  const mood = t > tTurn ? 'neutral' : (impressed ? 'happy' : 'neutral');
  K.drawPerson(ctx, 225, 1040, 1.25, { t, pose: 'sit', mood, hair: 2, hairStyle: 'curly', shirt: 1, skin: 2, look: 0.4, seed: 4 });
  // notepad on the lap
  ctx.save(); ctx.translate(255, 930); ctx.rotate(-0.15);
  rr(-40, -50, 80, 100, 8, '#f2f4fa'); rr(-40, -50, 80, 16, 6, ACC);
  for (let i = 0; i < 4; i++) rr(-30, -24 + i * 16, 60 * (0.5 + 0.5 * H.hash(i, 3)), 5, 2, '#b9c1d6');
  ctx.restore();
  // popcorn bucket on the next seat
  ctx.save(); ctx.translate(400, 905);
  ctx.beginPath(); ctx.moveTo(-36, -80); ctx.lineTo(36, -80); ctx.lineTo(26, 0); ctx.lineTo(-26, 0); ctx.closePath(); ctx.fillStyle = '#f2f4fa'; ctx.fill();
  ctx.save(); ctx.clip(); for (let i = 0; i < 4; i++) rr(-36 + i * 20, -80, 10, 80, 0, '#ff6b5e'); ctx.restore();
  for (let i = 0; i < 7; i++) circ(-30 + i * 10, -84 - 6 * H.hash(i, 5) + K.bob(t, 1.5, 3, i), 10, '#ffe9a8');
  ctx.restore();

  // ---- beat 1 pills
  pill(SX + 20, SY + 70, K.popIn(t, tWho - 0.1, 0.4), P.who || 'A film critic', { left: true, dot: true, size: 28 });
  const rk = K.popIn(t, tReal, 0.45) * (1 - H.smooth((t - b2) / 0.4));
  pill(487, SY + SH - 24, rk, P.real || 'Some shots look real', { size: 30, accent: true });

  // ---- beat 2: notes card (right) with crossed notes
  const nk = K.popIn(t, b2 + 0.4, 0.45);
  if (nk > 0) {
    const x0 = 470, y0 = 800, w = 400, h = 245;
    ctx.save(); ctx.translate(x0 + w / 2, y0 + h); ctx.scale(Math.min(1, nk), Math.min(1, nk)); ctx.translate(-(x0 + w / 2), -(y0 + h));
    rr(x0, y0, w, h, 22, 'rgba(8,10,24,0.94)'); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; H.roundRect(ctx, x0, y0, w, h, 22); ctx.stroke();
    ctx.font = K.font.ui(24); ctx.fillStyle = '#c9cff0'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.notesTitle || 'The review also says', x0 + 24, y0 + 32);
    notes.slice(0, 4).forEach((n, i) => {
      const tn = at(n.cue, b2 + 2 + i * 1.5), k = K.popIn(t, tn - 0.1, 0.35);
      if (k <= 0) return;
      const y = y0 + 80 + i * 46;
      ctx.save(); ctx.globalAlpha = Math.min(1, k); ctx.translate((1 - Math.min(1, k)) * 30, 0);
      circ(x0 + 40, y, 15, '#ff6b5e');
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0 + 34, y - 6); ctx.lineTo(x0 + 46, y + 6); ctx.moveTo(x0 + 46, y - 6); ctx.lineTo(x0 + 34, y + 6); ctx.stroke();
      ctx.font = K.font.bold(30); ctx.fillStyle = '#ffffff'; ctx.fillText(n.text, x0 + 70, y + 1);
      ctx.restore();
    });
    ctx.restore();
  }
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
