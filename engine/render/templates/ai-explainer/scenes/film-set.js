// Scene "film-set" (full frame; was odyssey-set, 2026-10-26). A night sound stage: a big studio screen where an AI-made
// sea and a cartoon sailing galley materialise pixel by pixel, a film camera on a tripod and the kit robot as director.
// Fits: AI-made films / videos / episodes, "an AI model made a movie" stories.
// modes: intro (2-beat span: date pill on the screen, name pills, a clapperboard (title / ep) snaps, a timecode runs to
//        `seconds`, length banner, collaborator pill) | payoff (a short lit film strip (fillFrac of it) vs a long empty
//        one, promised / arrived / reviewer pills, the screen dims and a question card lands)
// params: mode, date, who, what, made, title, ep, seconds (timecode end, s), length, short, full, review, fillFrac,
//         question; cues: dateCue, whoCue, epCue, whatCue, lenCue (+lenNth), madeCue, promisedCue, arrivedCue, qCue
// Defaults are generic placeholders; pass the story's names and published figures. Cue params are optional narration
// words ("word#n" = the (n+1)th time spoken); without them fixed fractions of the scene.
export default function draw(ctx, t, info) {
  const L = filmLib(ctx, info);
  const { H, K, ACC, rr, circ, at, pill, sea, ship, camera, clapper, bigText } = L;
  const P = info.params || {}, D = info.duration, mode = P.mode || 'intro';
  const payoff = mode === 'payoff';

  // ---- stage
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#0d1030'); g.addColorStop(0.5, '#171b44'); g.addColorStop(1, '#070815');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  // back wall panels (sound-stage padding)
  for (let i = 0; i < 9; i++) { rr(i * 124 - 20, 300, 110, 720, 8, i % 2 ? '#1a1f4a' : '#1d2350'); }
  // floor
  const fg = ctx.createLinearGradient(0, 1000, 0, 1920); fg.addColorStop(0, '#22264a'); fg.addColorStop(1, '#090a16');
  ctx.fillStyle = fg; ctx.fillRect(0, 1000, 1080, 920);
  rr(0, 996, 1080, 10, 0, '#2c3260');
  // studio lights with beams
  for (const [lx, dir] of [[60, 1], [1020, -1]]) {
    ctx.save(); ctx.globalAlpha = 0.10 + 0.03 * Math.sin(t * 1.5 + lx);
    ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.moveTo(lx, 380); ctx.lineTo(lx + dir * 520, 820); ctx.lineTo(lx + dir * 300, 900); ctx.closePath(); ctx.fill(); ctx.restore();
    rr(lx - 6, 380, 12, 640, 6, '#3b4260');
    ctx.save(); ctx.translate(lx, 380); ctx.rotate(dir * 0.6); rr(-34, -26, 68, 52, 10, '#3b4260'); circ(dir * 30, 0, 18, '#fff3c4'); ctx.restore();
  }
  ctx.save();
  const z = H.lerp(1, 1.04, K.phase(t, 0, D));
  ctx.translate(487, 760); ctx.scale(z, z); ctx.translate(-487, -760);

  // ---- the screen
  const SX = 120, SY = 440, SW = 735, SH = 370;
  rr(SX - 16, SY - 16, SW + 32, SH + 32, 18, '#2a2f45');
  const dim = payoff ? 0.55 * H.smooth((t - at(P.qCue, D * 0.85)) / 0.6) : 0;
  const hz = sea(SX, SY, SW, SH, t, { time: 'dusk' });
  // the galley sails across the screen
  const shipX = SX + 150 + (payoff ? 270 : 260 * K.phase(t, 0, D, H.easeInOutCubic));
  ctx.save(); H.roundRect(ctx, SX, SY, SW, SH, 0); ctx.clip();
  ship(shipX, hz + 70, 0.95, t, {});
  // pixel materialise (intro only): blocks cover the image and vanish in hashed order 0.2 .. 2.4 s
  if (!payoff) {
    const B = 46;
    for (let by = 0; by < Math.ceil(SH / B); by++) for (let bx = 0; bx < Math.ceil(SW / B); bx++) {
      const k = H.hash(bx, by), tv = 0.2 + k * 2.2;
      if (t < tv) {
        const a = H.clamp((tv - t) / 0.25);
        ctx.fillStyle = H.rgba(H.hash(bx + 9, by) > 0.7 ? ACC : '#1c2242', a);
        ctx.fillRect(SX + bx * B, SY + by * B, B - 2, B - 2);
      }
    }
  }
  if (dim > 0) { ctx.fillStyle = H.rgba('#05060f', dim); ctx.fillRect(SX, SY, SW, SH); }
  ctx.restore();
  // screen frame glow
  K.glow(ctx, SX + SW / 2, SY + SH / 2, 480, '#f2a46a', 0.06);

  // ---- floor: camera + robot director
  if (!payoff) camera(660, 1030, 0.72, t, { text: 'REC' });
  const robotState = payoff ? (t > at(P.qCue, D * 0.85) ? 'thinking' : 'idle') : (t > at(P.epCue, D * 0.47) ? 'happy' : 'working');
  K.drawRobot(ctx, payoff ? 840 : 850, 1035, payoff ? 0.85 : 0.95, { t, state: robotState, talk: info.env * 0.5, flip: true });
  // megaphone in the robot's hand
  ctx.save(); ctx.translate(payoff ? 772 : 772, payoff ? 880 : 860); ctx.rotate(-0.3 + Math.sin(t * 2) * 0.04);
  ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(-64, -34); ctx.lineTo(-64, 34); ctx.lineTo(0, 12); ctx.closePath(); ctx.fillStyle = ACC; ctx.fill();
  rr(-2, -14, 20, 28, 6, '#2a2f45'); ctx.restore();

  if (!payoff) {
    const tDate = at(P.dateCue, D * 0.19), tWho = at(P.whoCue, D * 0.39), tEp = at(P.epCue, D * 0.47);
    const tWhat = at(P.whatCue, D * 0.65), tLen = at(P.lenCue, D * 0.78, P.lenNth || 0), tMade = at(P.madeCue, D * 0.89);
    // date pill on the screen's top-left
    pill(SX + 20, SY + 70, K.popIn(t, tDate, 0.4), P.date || 'This week', { left: true, dot: true, size: 30 });
    // left column pills under the screen
    pill(80, 880, K.popIn(t, tWho, 0.4), P.who || 'AI video model', { left: true, size: 30 });
    pill(80, 940, K.popIn(t, tWhat, 0.4), P.what || 'A classic story', { left: true, size: 28 });
    // timecode bar on the screen bottom: counts to `seconds` on the length cue
    const tk = K.popIn(t, tLen - 0.2, 0.4);
    if (tk > 0) {
      const prog = K.phase(t, tLen, tLen + 1.4, H.easeOutCubic);
      ctx.save(); ctx.globalAlpha = Math.min(1, tk);
      rr(SX + 20, SY + SH - 64, SW - 40, 44, 22, 'rgba(8,10,24,0.85)');
      rr(SX + 150, SY + SH - 48, (SW - 190) * prog, 12, 6, ACC);
      rr(SX + 150 + (SW - 190) * prog - 2, SY + SH - 54, 4, 24, 2, '#ffffff');
      const sec = Math.round(prog * (P.seconds || 300)), mm = Math.floor(sec / 60), ss = sec % 60;
      ctx.font = K.font.ui(26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(`${mm}:${String(ss).padStart(2, '0')}`, SX + 46, SY + SH - 42);
      ctx.restore();
      bigText(SX + SW / 2, SY + SH - 90, K.popIn(t, tLen + 1.0, 0.45), P.length || 'A FEW MINUTES', 74, ACC, 600);
    }
    // collaborators pill (replaces nothing; sits above the camera row on the right of the column)
    const mk = K.popIn(t, tMade, 0.4);
    if (mk > 0) pill(80, 1000, mk, P.made || 'Studio + director', { left: true, size: 26, accent: true });
    // clapperboard: pops centre-screen on "Episode", snaps, then shrinks to the screen's top-right corner
    const ck = K.popIn(t, tEp - 0.35, 0.4);
    if (ck > 0) {
      const open = 1 - K.phase(t, tEp + 0.25, tEp + 0.4);
      const mv = K.phase(t, tEp + 2.0, tEp + 2.7, H.easeInOutCubic);
      const cx = H.lerp(487, SX + SW - 95, mv), cy = H.lerp(SY + 290, SY + 140, mv), cs = H.lerp(1.15, 0.5, mv) * Math.min(1, ck);
      if (t > tEp + 0.4 && t < tEp + 0.7) K.cameraShake(ctx, t, tEp + 0.4, 0.3, 6);
      clapper(cx, cy, cs, open, [P.title || 'THE FILM', P.ep || 'EPISODE 1']);
    }
  } else {
    // payoff: a film strip under the screen: a short lit part (fillFrac) of a long empty strip (full movie?)
    const tProm = at(P.promisedCue, D * 0.45), tArr = at(P.arrivedCue, D * 0.7), tQ = at(P.qCue, D * 0.85);
    const k1 = K.popIn(t, 0.3, 0.45), k2 = K.popIn(t, tArr - 0.2, 0.45);
    const LEN = 560, SY0 = 880;
    if (k1 > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, k1);
      rr(80, SY0, LEN, 64, 8, '#1c2033');
      for (let i = 0; i * 34 + 14 < LEN; i++) { rr(88 + i * 34, SY0 + 6, 18, 10, 3, '#3b4260'); rr(88 + i * 34, SY0 + 48, 18, 10, 3, '#3b4260'); }
      const fill = K.phase(t, tArr, tArr + 0.8);
      if (fill > 0) { rr(84, SY0 + 20, (LEN - 8) * (P.fillFrac == null ? 0.08 : P.fillFrac) * fill + 2, 24, 4, ACC); K.glow(ctx, 100, SY0 + 32, 60, ACC, 0.5 * fill); }
      ctx.font = K.font.display(48); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('?', LEN + 96, SY0 + 34);
      ctx.restore();
    }
    pill(80, SY0 - 14, K.popIn(t, Math.min(tProm, D * 0.5) - 0.1, 0.45), P.full || 'Promised: a full-length film', { left: true, size: 28 });
    pill(80, SY0 + 128, k2, P.short || 'Arrived: a few minutes', { left: true, size: 28, accent: true });
    pill(SX + 20, SY + 70, K.popIn(t, 0.3, 0.45) * (1 - H.smooth((t - tQ + 0.3) / 0.3)), P.review || 'Critics: a full film? Unclear', { left: true, size: 26, dot: true });
    // question card over the dimmed screen
    const q = K.popIn(t, tQ - 0.1, 0.5);
    if (q > 0) {
      ctx.save(); ctx.translate(487, SY + SH / 2); ctx.scale(q, q);
      rr(-330, -110, 660, 220, 30, 'rgba(8,10,24,0.92)'); ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(ACC, 0.8); H.roundRect(ctx, -330, -110, 660, 220, 30); ctx.stroke();
      ctx.restore();
      bigText(487, SY + SH / 2 + 26, q, P.question || 'Watch the rest?', 78, ACC, 580);
    }
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
