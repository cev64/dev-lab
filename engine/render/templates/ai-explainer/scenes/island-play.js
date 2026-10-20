// Scene "island-play" (full frame). An AI agent (the kit robot) alone on a cartoon virtual island, learning by play.
// Fits: "AI agents left to play / explore", open-ended learning, agent memory, research results with caveats.
// Defaults are generic placeholders ("RESEARCHERS", "AI MODEL", 24 hours, "Quote here", scores 8.0 vs 3.0): pass the
// story's names, verbatim quotes and published numbers. Cue params are narration words ("word#n" = the (n+1)th time
// it is spoken in the scene); without them every mode uses fixed fractions of its duration.
// Generic: no logos, no real people (names appear as text only).
// One module, several modes (one beat each, "arrive" spans 2 beats):
//   arrive   establishing island, robot beams down; pills: who / model name (flips to an optional nickname) / world;
//            memory notebook floats in; "no task" card; sun races across the sky with an hours counter
//            params: who, name, nick, world, memory [3 lines], memLabel, task, noTask, hours, hoursLabel, hoursSub;
//            cues whoCue, nameCue, nickCue, worldCue, memoryCue, taskCue, hoursCue
//   stars    stone cubes fly into a heart, night falls, cubes re-form a W constellation mirrored by sky stars; quote
//            params: heart, shape, quote, by; cues blocksCue, heartCue, shapeCue, quoteCue
//   games    "floor is lava" sand + robot on a cube, block thrown through a ring hoop on a mesa; then a juggling counter
//            to `record`, magnifier "too fast?", VOID stamp on the record card, slow restart with "stricter rules"
//            params: game1, game2, counterLabel, record, recordLabel, stamp, fast, restart;
//            cues gamesCue, ballCue, juggleCue, recordCue, decideCue, fastCue, voidCue
//   test     two copies of the island's highest point: each robot piles `n` objects (<= 10), average counters count up
//            params: a {value, n, label}, b {value, n, label}, head, paid; cues paidCue, headCue, aLabelCue, aCue,
//            bLabelCue, bCue
//   notes    memory notebook: a technique page is torn out, row of towers collapses (4 of 6); then dusk street,
//            robot meets a surprise, "?" -> lightbulb, hedged pill
//            params: notesLeft [3], notesRight [{text, hi}] (3), erased, worse, helps;
//            cues eraseCue, trickCue, worseCue, robotsCue, learnCue, surpriseCue
//   caveats  dusk island, robot raises a theatre mask (role-play), prompt-file note on a post, outside quote, stamp
//            params: head, role, roleBy, noteTitle, noteText, noteSub, quote, by, stamp;
//            cues cavCue, roleCue, noteCue, expertCue, peerCue
//   payoff   sunset beach, robot by its block heart, verbatim closing line, question card + two chips
//            params: quote, by, question, yes, no; cues lineCue, qCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, mixHex, rgba, hash } = H;
  const TAU = Math.PI * 2;
  const cue = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const ease = H.easeInOutCubic, eo = H.easeOutCubic;
  const mode = P.mode || 'arrive';

  // ------------------------------------------------------------ drawing helpers
  const circ = (x, y, r, c) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = c; ctx.fill(); };
  const rr = (x, y, w, h, r, c) => { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); };
  const SKYC = {
    day: ['#5fa3e0', '#bfe3f4'], dusk: ['#3a3a7c', '#f3a06e'], night: ['#070b26', '#1c2456'],
  };
  // world: island in the sea. o: night 0..1, dusk 0..1, sun {x, y}, spire x (or null), mesa (bool), palm (bool), grid 0..1
  function island(o = {}) {
    const night = clamp(o.night || 0), dusk = clamp(o.dusk || 0);
    const top = mixHex(mixHex(SKYC.day[0], SKYC.dusk[0], dusk), SKYC.night[0], night);
    const bot = mixHex(mixHex(SKYC.day[1], SKYC.dusk[1], dusk), SKYC.night[1], night);
    const HY = 880; // horizon
    const g = ctx.createLinearGradient(0, 0, 0, HY); g.addColorStop(0, top); g.addColorStop(1, bot);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, HY);
    // stars
    if (night > 0.02) for (let i = 0; i < 80; i++) {
      const sx = hash(i, 11) * 1080, sy = 120 + hash(i, 12) * 700, tw = 0.6 + 0.4 * Math.sin(t * 2.2 + i * 1.7);
      circ(sx, sy, 1.4 + 1.6 * hash(i, 13), rgba('#ffffff', night * tw * 0.8));
    }
    // sun / moon
    const sun = o.sun || { x: 820, y: 330 };
    if (night < 0.98) {
      const sc = mixHex('#fff3c4', '#ffb070', dusk);
      K.glow(ctx, sun.x, sun.y, 170, sc, 0.55 * (1 - night));
      circ(sun.x, sun.y, 46, rgba(sc, 1 - night));
    }
    if (night > 0.02) { const mx = o.moon ? o.moon.x : 200, my = o.moon ? o.moon.y : 300; K.glow(ctx, mx, my, 120, '#dfe6ff', 0.35 * night); circ(mx, my, 34, rgba('#f1f3ff', night)); circ(mx + 13, my - 9, 30, rgba(top, night)); }
    // clouds
    for (let i = 0; i < 3; i++) {
      const cx = ((hash(i, 21) * 1300 + t * (10 + 5 * i)) % 1400) - 160, cy = 200 + hash(i, 22) * 260;
      const a = (1 - night) * (0.7 - 0.35 * dusk);
      for (const [dx, dy, r] of [[0, 0, 30], [34, -12, 38], [70, 0, 28], [36, 10, 30]]) circ(cx + dx, cy + dy, r, rgba('#ffffff', a));
    }
    // distant islands
    for (const [x, w, h] of [[120, 220, 40], [930, 260, 55]]) {
      ctx.beginPath(); ctx.ellipse(x, HY, w / 2, h, 0, Math.PI, TAU); ctx.fillStyle = mixHex(mixHex('#5f86a8', '#5a4a78', dusk), '#141a3a', night); ctx.fill();
    }
    // sea
    const sg = ctx.createLinearGradient(0, HY, 0, 1920);
    sg.addColorStop(0, mixHex(mixHex('#2f8fc4', '#5b5aa0', dusk), '#101a44', night)); sg.addColorStop(1, mixHex('#0f3f6e', '#070a1c', night * 0.8));
    ctx.fillStyle = sg; ctx.fillRect(0, HY, 1080, 1040);
    ctx.strokeStyle = rgba('#ffffff', 0.18 - 0.08 * night); ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 14; i++) {
      const y = HY + 20 + hash(i, 31) * 160, x = ((hash(i, 32) * 1200 + t * 25 * (0.5 + hash(i, 33))) % 1240) - 80;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 50 + 40 * hash(i, 34), y); ctx.stroke();
    }
    // virtual-world grid shimmer
    if (o.grid > 0) {
      ctx.save(); ctx.globalAlpha = o.grid; ctx.strokeStyle = rgba(ACC, 0.35); ctx.lineWidth = 2;
      for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(540 + i * 40, HY); ctx.lineTo(540 + i * 260, 1920); ctx.stroke(); }
      for (let j = 0; j < 9; j++) { const y = HY + Math.pow(j / 8, 1.8) * 1040; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }
      for (let j = 0; j < 7; j++) { const y = 140 + j * 110; ctx.globalAlpha = o.grid * 0.5; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }
      ctx.restore();
    }
    // island body (sand), surf ring
    const sand = mixHex(mixHex('#f0d59a', '#d9a477', dusk), '#59506e', night * 0.75), sandS = mixHex(sand, '#000000', 0.18);
    ctx.save(); ctx.translate(510, 1075); ctx.scale(1, 0.26);
    circ(0, 0, 620, rgba('#ffffff', 0.25 + 0.06 * Math.sin(t * 2))); circ(0, 0, 590, sandS); ctx.restore();
    ctx.save(); ctx.translate(510, 1060); ctx.scale(1, 0.24); circ(0, 0, 580, sand); ctx.restore();
    // grass tufts
    for (let i = 0; i < 9; i++) {
      const gx = 120 + i * 100 + hash(i, 41) * 40, gy = 1000 + hash(i, 42) * 60;
      ctx.strokeStyle = mixHex('#4fa67d', '#1c2c3a', night * 0.7); ctx.lineWidth = 5;
      for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(gx, gy); ctx.quadraticCurveTo(gx + k * 6, gy - 14, gx + k * 14 + Math.sin(t * 2 + i) * 2, gy - 24); ctx.stroke(); }
    }
    if (o.palm !== false) palm(o.palmX || 110, 1010, night);
    if (o.mesa) mesa(o.mesa.x, o.mesa.y, o.mesa.w, night, dusk);
    if (o.spire != null) spire(o.spire, 1010, o.spireTop || 640, night, dusk);
    return { ground: 1010, HY };
  }
  function palm(x, y, night) {
    const tr = mixHex('#9a6a46', '#3a2a30', night * 0.6), lf = mixHex('#3f9a6b', '#1a3a3a', night * 0.6);
    K.shadow(ctx, x, y, 120);
    ctx.strokeStyle = tr; ctx.lineWidth = 26; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 10, y - 170, x + 50, y - 320); ctx.stroke();
    const sway = Math.sin(t * 1.4) * 0.06;
    for (let i = 0; i < 6; i++) {
      const a = -Math.PI / 2 + (i - 2.5) * 0.55 + sway;
      ctx.save(); ctx.translate(x + 50, y - 320); ctx.rotate(a);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(70, -40, 150, 20); ctx.quadraticCurveTo(70, -10, 0, 0); ctx.fillStyle = lf; ctx.fill();
      ctx.restore();
    }
    circ(x + 40, y - 312, 12, '#6b4a2c'); circ(x + 60, y - 306, 12, '#5b3b25');
  }
  function rockFill(night, dusk) { return [mixHex(mixHex('#a7836a', '#8d6a68', dusk), '#3a3550', night * 0.7), mixHex(mixHex('#86664f', '#6d4e55', dusk), '#2a263c', night * 0.7)]; }
  function mesa(x, topY, w, night, dusk) {
    const [c, s] = rockFill(night, dusk);
    K.shadow(ctx, x, 1012, w + 40);
    ctx.beginPath(); ctx.moveTo(x - w / 2 - 20, 1012); ctx.lineTo(x - w / 2, topY); ctx.lineTo(x + w / 2, topY); ctx.lineTo(x + w / 2 + 20, 1012); ctx.closePath(); ctx.fillStyle = c; ctx.fill();
    ctx.fillStyle = s; ctx.fillRect(x + w / 6, topY, w / 3, 1012 - topY);
    rr(x - w / 2 - 8, topY - 12, w + 16, 20, 8, mixHex(c, '#ffffff', 0.12));
  }
  function spire(x, y, topY, night, dusk) {
    const [c, s] = rockFill(night, dusk);
    K.shadow(ctx, x, y + 2, 220);
    ctx.beginPath(); ctx.moveTo(x - 95, y); ctx.lineTo(x - 62, topY); ctx.lineTo(x + 62, topY); ctx.lineTo(x + 95, y); ctx.closePath(); ctx.fillStyle = c; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 20, y); ctx.lineTo(x + 20, topY); ctx.lineTo(x + 62, topY); ctx.lineTo(x + 95, y); ctx.closePath(); ctx.fillStyle = s; ctx.fill();
    for (let i = 0; i < 4; i++) { ctx.strokeStyle = rgba('#000000', 0.15); ctx.lineWidth = 4; const yy = topY + 60 + i * (y - topY - 80) / 4; ctx.beginPath(); ctx.moveTo(x - 60 - i * 6, yy); ctx.lineTo(x - 10, yy + 8); ctx.stroke(); }
    rr(x - 72, topY - 12, 144, 20, 8, mixHex(c, '#ffffff', 0.15));
  }
  // stone cube, anchored bottom-centre, side length sz
  function cube(x, y, sz, o = {}) {
    const a = o.alpha == null ? 1 : o.alpha; if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
    const front = o.color || '#c9c2b6', topc = mixHex(front, '#ffffff', 0.35), side = mixHex(front, '#000000', 0.25), d = sz * 0.28;
    if (o.glow) K.glow(ctx, 0, -sz / 2, sz * 1.6, ACC, o.glow);
    ctx.beginPath(); ctx.moveTo(-sz / 2, -sz); ctx.lineTo(-sz / 2 + d, -sz - d); ctx.lineTo(sz / 2 + d, -sz - d); ctx.lineTo(sz / 2, -sz); ctx.closePath(); ctx.fillStyle = topc; ctx.fill();
    ctx.beginPath(); ctx.moveTo(sz / 2, 0); ctx.lineTo(sz / 2, -sz); ctx.lineTo(sz / 2 + d, -sz - d); ctx.lineTo(sz / 2 + d, -d); ctx.closePath(); ctx.fillStyle = side; ctx.fill();
    roundRect(ctx, -sz / 2, -sz, sz, sz, 3); ctx.fillStyle = front; ctx.fill();
    if (o.glow) { ctx.strokeStyle = rgba(ACC, Math.min(1, o.glow * 1.5)); ctx.lineWidth = 3; roundRect(ctx, -sz / 2, -sz, sz, sz, 3); ctx.stroke(); }
    ctx.restore();
  }
  function ring(x, y, r, o = {}) { // hoop ring seen at an angle, centre (x, y)
    ctx.save(); ctx.lineWidth = o.w || 12; ctx.strokeStyle = o.color || ACC;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.32, 0, 0, TAU); ctx.stroke(); ctx.restore();
  }
  function panel(cx, cy, w, h, k, fill) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(cx, cy); const s = Math.min(1.04, k); ctx.scale(s, s);
    roundRect(ctx, -w / 2, -h / 2, w, h, 26); ctx.fillStyle = fill || 'rgba(8,10,24,0.92)'; ctx.fill();
  }
  function quotePanel(cx, cy, w, k, text, by, alpha = 1) {
    if (k <= 0 || alpha <= 0) return;
    ctx.save(); ctx.globalAlpha = alpha;
    let size = 46, lines; for (; size >= 30; size -= 2) { lines = H.wrap(ctx, '“' + text + '”', 'display', size, w - 70); if (lines.length <= 2) break; }
    const h = lines.length * size * 1.15 + (by ? 92 : 44);
    panel(cx, cy, w, h, k);
    ctx.fillStyle = ACC; roundRect(ctx, -w / 2, -h / 2, 10, h, 5); ctx.fill();
    ctx.font = H.font('display', size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
    const y0 = -h / 2 + 22 + size * 0.6;
    lines.forEach((ln, i) => ctx.fillText(ln, 0, y0 + i * size * 1.15));
    if (by) { ctx.font = H.font('ui', 26); ctx.fillStyle = ACC; ctx.fillText(by, 0, h / 2 - 30); }
    ctx.restore();
  }
  function bigText(text, x, y, size, color, k = 1, kind = 'display') {
    if (k <= 0) return; ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(x, y); const s = Math.min(1.06, k); ctx.scale(s, s);
    ctx.font = H.font(kind, size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = size * 0.16; ctx.strokeStyle = 'rgba(6,8,20,0.85)'; ctx.lineJoin = 'round'; ctx.strokeText(text, 0, 0);
    ctx.fillStyle = color; ctx.fillText(text, 0, 0); ctx.restore();
  }
  function notebook(cx, cy, s, o = {}) { // open memory notebook; o.lines [{text, hi}], o.tear 0..1 (right page torn away), o.write 0..1
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    const W = 520, Hh = 330;
    K.shadow(ctx, 0, Hh / 2 + 12, W * 0.9);
    rr(-W / 2 - 12, -Hh / 2 - 8, W + 24, Hh + 22, 18, '#3b4a8a');
    rr(-W / 2, -Hh / 2, W / 2 - 4, Hh, 10, '#f2f4fa');
    const tear = o.tear || 0;
    // right page (may fly away)
    const drawRight = (k) => {
      ctx.save();
      if (k > 0) { ctx.translate(W / 4 + k * 520, -k * 260 + Math.sin(k * 7) * 20); ctx.rotate(k * 1.4); ctx.translate(-W / 4, 0); ctx.globalAlpha = 1 - clamp((k - 0.6) / 0.4); }
      rr(4, -Hh / 2, W / 2 - 4, Hh, 10, '#f2f4fa');
      if (k > 0) { ctx.strokeStyle = '#c8cde0'; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 10; i++) ctx.lineTo(6 + (i % 2) * 8, -Hh / 2 + i * Hh / 10); ctx.stroke(); }
      (o.right || []).forEach((ln, i) => {
        const y = -Hh / 2 + 70 + i * 62;
        if (ln.hi) { rr(20, y - 26, W / 2 - 44, 44, 8, rgba(ACC, 0.55)); }
        ctx.font = H.font('ui', 24); ctx.fillStyle = '#2a2f45'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        let txt = ln.text; while (ctx.measureText(txt).width > W / 2 - 60 && txt.length > 4) txt = txt.slice(0, -1);
        ctx.fillText(txt, 30, y - 3);
      });
      ctx.restore();
    };
    if (tear <= 0) drawRight(0);
    // left page lines
    ctx.font = H.font('display', 26); ctx.fillStyle = '#3b4a8a'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(o.title || 'MEMORY', -W / 2 + 26, -Hh / 2 + 36);
    (o.left || []).forEach((ln, i) => {
      const y = -Hh / 2 + 90 + i * 56, wk = o.write == null ? 1 : clamp(o.write * (o.left.length) - i);
      if (wk <= 0) return;
      ctx.font = H.font('ui', 23); ctx.fillStyle = '#2a2f45';
      const full = ln; let txt = full.slice(0, Math.ceil(full.length * wk)); while (ctx.measureText(txt).width > W / 2 - 50 && txt.length > 4) txt = txt.slice(0, -1);
      ctx.fillText(txt, -W / 2 + 26, y);
    });
    rr(-3, -Hh / 2, 6, Hh, 3, '#2c386e');
    if (tear > 0) drawRight(tear);
    ctx.restore();
  }
  function mask(x, y, s, a) { // theatre mask held up (generic)
    if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.12);
    ctx.beginPath(); ctx.moveTo(-60, -50); ctx.quadraticCurveTo(0, -80, 60, -50); ctx.quadraticCurveTo(70, 30, 0, 70); ctx.quadraticCurveTo(-70, 30, -60, -50); ctx.closePath();
    ctx.fillStyle = '#f2f4fa'; ctx.fill(); ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.stroke();
    ctx.fillStyle = '#1c2033';
    for (const sx of [-26, 26]) { ctx.beginPath(); ctx.ellipse(sx, -14, 15, 9, sx < 0 ? 0.2 : -0.2, 0, TAU); ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, 18, 26, 0.15 * Math.PI, 0.85 * Math.PI); ctx.lineWidth = 7; ctx.strokeStyle = '#1c2033'; ctx.stroke();
    ctx.strokeStyle = '#9a6a46'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(40, 50); ctx.lineTo(70, 130); ctx.stroke();
    ctx.restore();
  }
  function tossArc(x0, y0, x1, y1, apex, u) { // point on a parabola-like arc
    const x = lerp(x0, x1, u), yl = lerp(y0, y1, u), lift = 4 * u * (1 - u) * (Math.min(y0, y1) - apex);
    return [x, yl - lift];
  }
  const label = (x, y, k, o) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); K.drawLabel(ctx, x, y, k, o); ctx.restore(); };
  const stampUI = (x, y, s, o) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); K.drawStamp(ctx, x, y, s, o); ctx.restore(); };
  const robot = (x, y, s, o) => K.drawRobot(ctx, x, y, s, Object.assign({ t }, o));

  ctx.save();

  // ============================================================ ARRIVE (2 beats: hook + setup)
  if (mode === 'arrive') {
    const tWho = cue(P.whoCue, D * 0.25) - 0.15, tName = cue(P.nameCue, D * 0.38) - 0.1, tNick = cue(P.nickCue, D * 0.46) - 0.1;
    const tVirt = cue(P.worldCue, D * 0.55) - 0.1, tMem = cue(P.memoryCue, D * 0.7) - 0.35, tTask = cue(P.taskCue, D * 0.77) - 0.25;
    const tHours = cue(P.hoursCue, D * 0.89) - 0.3;
    const HRS = Math.max(1, +(P.hours || 24)), NICK = P.nick || '';
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: 3, zoom: 1.1, x: 470, y: 820 }, { t: tHours, zoom: 1.1, x: 470, y: 820 }, { t: tHours + 1, zoom: 1.0 }]);
    const hk = clamp((t - tHours) / Math.max(0.5, D - tHours - 0.2)); // 0..1 over the 30-hour montage
    const dayAng = hk * 1.5 * TAU; // sun circles
    const sunUp = Math.sin(dayAng * 0.5 + 0.0);
    const night = tHours < t ? clamp(0.5 - 0.5 * Math.cos(hk * 3 * Math.PI)) * 0.85 : 0;
    island({ sun: { x: 540 + 360 * Math.cos(Math.PI + dayAng * 0.5), y: 560 - 260 * Math.abs(Math.sin(Math.PI + dayAng * 0.5)) - 0 * sunUp }, night, grid: clamp((t - tVirt) / 0.4) * (1 - clamp((t - tVirt - 2.2) / 0.6)) * 0.9, spire: 840, spireTop: 700, mesa: null });
    // beam + robot materialises
    const tBeam = 0.5, mat = clamp((t - tBeam - 0.35) / 0.5);
    const beamA = clamp((t - tBeam) / 0.3) * (1 - clamp((t - tBeam - 1.1) / 0.5));
    if (beamA > 0) { ctx.save(); const bg = ctx.createLinearGradient(0, 0, 0, 1010); bg.addColorStop(0, rgba(ACC, 0)); bg.addColorStop(1, rgba(ACC, 0.5 * beamA)); ctx.fillStyle = bg; ctx.fillRect(390, 0, 160, 1010); ctx.restore(); K.glow(ctx, 470, 990, 160, ACC, 0.6 * beamA); }
    const happy = t > tNick && t < tNick + 1.6;
    if (mat > 0) { ctx.save(); ctx.globalAlpha = mat; robot(470, 1012, 1.35 * (0.6 + 0.4 * H.easeOutBack(mat)), { state: happy ? 'happy' : (t > tTask && t < tHours ? 'thinking' : 'idle'), talk: 0, seed: 5 }); ctx.restore(); }
    // "?" look-around in the hook
    const qk = K.popIn(t, 1.6, 0.4) * (1 - clamp((t - tWho) / 0.3));
    if (qk > 0) bigText('?', 580, 640, 90, ACC, qk);
    // pills: who, name
    const p1 = K.popIn(t, tWho, 0.4);
    if (p1 > 0) label(487, 478, Math.min(1, p1), { text: P.who || 'RESEARCHERS', size: 28, dot: true });
    const n1 = K.popIn(t, tName, 0.4), flip = clamp((t - tNick) / 0.3);
    if (n1 > 0 && t < tHours + 0.3) {
      const nm = flip < 0.5 || !NICK ? (P.name || 'AI MODEL') : NICK;
      ctx.save(); ctx.globalAlpha = 1 - clamp((t - tHours) / 0.3); ctx.setTransform(1, 0, 0, Math.max(0.02, Math.abs(1 - 2 * flip)), 0, 700 * (1 - Math.max(0.02, Math.abs(1 - 2 * flip))));
      label(470, 700, Math.min(1, n1), { text: nm, size: 32, accent: flip >= 0.5 && !!NICK });
      ctx.restore();
    }
    // virtual island pill
    const v1 = K.popIn(t, tVirt, 0.4) * (1 - clamp((t - tMem) / 0.3));
    if (v1 > 0) label(487, 560, Math.min(1, v1), { text: P.world || 'VIRTUAL ISLAND', size: 26 });
    // memory notebook floats beside the robot, writes
    const m1 = K.popIn(t, tMem, 0.45);
    if (m1 > 0) {
      const fade = 1 - clamp((t - tHours) / 0.4);
      ctx.save(); ctx.globalAlpha = fade;
      notebook(250, 760 + K.bob(t, 6, 0.5), 0.42 * Math.min(1, m1), { title: 'MEMORY', left: P.memory || ['Hour 1: look', 'around', 'Found: a rock'], write: clamp((t - tMem) / 1.5), right: [{ text: '' }] });
      ctx.font = H.font('ui', 24); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(6,8,20,0.8)';
      const ML = P.memLabel || 'text-file memory'; ctx.strokeText(ML, 250, 860); ctx.fillText(ML, 250, 860);
      ctx.restore();
    }
    // task card: blank, crossed
    const tk = K.popIn(t, tTask, 0.45);
    if (tk > 0) {
      const fade = 1 - clamp((t - tHours) / 0.4);
      ctx.save(); ctx.globalAlpha = fade; ctx.translate(720, 760 + K.bob(t, 5, 0.6, 1)); const s = Math.min(1, tk); ctx.scale(s, s);
      rr(-120, -80, 240, 150, 16, '#f2f4fa');
      ctx.font = H.font('display', 28); ctx.fillStyle = '#2a2f45'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.task || 'TASK:', 0, -42);
      ctx.strokeStyle = '#b9c1d6'; ctx.lineWidth = 4; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.moveTo(-80, 20); ctx.lineTo(80, 20); ctx.stroke(); ctx.setLineDash([]);
      const x1 = clamp((t - tTask - 0.3) / 0.3);
      if (x1 > 0) { ctx.strokeStyle = '#ff6b5e'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-90, -60); ctx.lineTo(-90 + 180 * x1, -60 + 120 * x1); ctx.stroke(); }
      ctx.restore();
      if (fade > 0) label(720, 892, Math.min(1, K.popIn(t, tTask + 0.4, 0.4)) * fade, { text: P.noTask || 'NO TASK', size: 26, accent: true });
    }
    // 30 hours montage: counter
    const ck = K.popIn(t, tHours, 0.45);
    if (ck > 0) {
      const hrs = Math.min(HRS, Math.floor(HRS * eo(clamp((t - tHours) / Math.max(0.6, D - tHours - 0.35)))));
      ctx.save(); panel(487, 590, 420, 150, ck);
      ctx.font = H.font('display', 84); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(hrs), -70, 0);
      ctx.font = H.font('bold', 34); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.fillText(P.hoursLabel || 'HOURS', 0, -14);
      ctx.font = H.font('ui', 24); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillText(P.hoursSub || 'alone, each', 2, 26);
      ctx.restore();
    }
  }

  // ============================================================ STARS (heart -> constellation, log quote)
  else if (mode === 'stars') {
    const tBlocks = cue(P.blocksCue, D * 0.1) - 0.3, tHeart = cue(P.heartCue, D * 0.2) - 0.2, tConst = cue(P.shapeCue, D * 0.32) - 0.3, tWrote = cue(P.quoteCue, D * 0.53) - 0.2;
    const night = clamp((t - tConst) / 1.2);
    K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 520, y: 760 }, { t: D, zoom: 1.0 }]);
    island({ night, dusk: clamp((t - tConst + 0.6) / 0.8) * (1 - night), sun: { x: 860, y: 520 + 260 * clamp((t - tConst + 0.4) / 1.4) }, moon: { x: 170, y: 470 } });
    // heart points
    const N = 14, cx = 640, cy = 800, HK = 15;
    const heart = [], W = [];
    for (let i = 0; i < N; i++) { const a = (i / N) * TAU; heart.push([cx + HK * 16 * Math.pow(Math.sin(a), 3) / 1.6, cy - HK * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 1.6]); }
    const Wp = [[430, 800], [540, 960], [650, 850], [760, 980], [880, 790]]; // Cassiopeia-like W (stars)
    for (let i = 0; i < N; i++) { const f = i / (N - 1) * 4, seg = Math.min(3, Math.floor(f)), u = f - seg; W.push([lerp(Wp[seg][0], Wp[seg + 1][0], u), lerp(Wp[seg][1], Wp[seg + 1][1], u) + 30]); }
    const W5 = [0, 13];
    const pile = (i) => [330 + (i % 5) * 40, 1010 - Math.floor(i / 5) * 38];
    const flyU = (i) => clamp((t - tBlocks - i * 0.06) / 0.55);
    const toW = (i) => ease(clamp((t - tConst - 0.2 - i * 0.04) / 0.8));
    // sky constellation mirror (lines + stars)
    if (night > 0) {
      const sk = Wp.map(([x, y]) => [x - 40, 600 + (y - 800) * 0.6]);
      ctx.save(); ctx.strokeStyle = rgba(ACC, 0.7 * night); ctx.lineWidth = 3; K.pathDraw(ctx, sk, clamp((t - tConst - 0.8) / 1.0)); ctx.restore();
      sk.forEach(([x, y], i) => { const k = clamp((t - tConst - 0.6 - i * 0.15) / 0.3) * night; if (k > 0) { K.glow(ctx, x, y, 50, ACC, 0.6 * k); circ(x, y, 7, rgba('#ffffff', k)); } });
    }
    // robot "places" stones
    const placing = t > tBlocks && t < tConst + 1.2;
    robot(250, 1015, 1.25, { state: placing ? 'working' : (night > 0.6 ? 'happy' : 'idle'), seed: 7 });
    // cubes
    for (let i = 0; i < N; i++) {
      const p0 = pile(i), u = eo(flyU(i));
      let [x, y] = u <= 0 ? p0 : (u < 1 ? tossArc(p0[0], p0[1], heart[i][0], heart[i][1] + 22, 600, u) : [heart[i][0], heart[i][1] + 22]);
      const w = toW(i);
      if (w > 0) { x = lerp(x, W[i][0], w); y = lerp(y, W[i][1], w); }
      const star = w > 0.95 && [0, 4, 7, 10, 13].includes(i);
      cube(x, y + K.bob(t, w > 0 ? 3 : 0, 0.4, i * 0.3), 34, { glow: star ? 0.55 + 0.15 * Math.sin(t * 3 + i) : (u >= 1 && t > tHeart && w <= 0 ? 0.18 : 0) });
    }
    // lines between W stars on the ground drawing
    if (t > tConst + 1.0) { ctx.save(); ctx.strokeStyle = rgba(ACC, 0.55); ctx.lineWidth = 4; ctx.setLineDash([10, 10]); K.pathDraw(ctx, Wp.map(([x, y]) => [x, y + 10]), clamp((t - tConst - 1.0) / 0.8)); ctx.setLineDash([]); ctx.restore(); }
    // labels
    const hk = K.popIn(t, tHeart, 0.4) * (1 - clamp((t - tConst) / 0.3));
    if (hk > 0) label(640, 680, Math.min(1, hk), { text: P.heart || 'A HEART', size: 28, dot: true });
    const ck = K.popIn(t, tConst + 0.9, 0.4) * (1 - clamp((t - tWrote) / 0.3));
    if (ck > 0) label(660, 720, Math.min(1, ck), { text: P.shape || 'CONSTELLATIONS', size: 24, dot: true });
    quotePanel(487, 520, 840, K.popIn(t, tWrote, 0.45), P.quote || 'Quote here.', P.by || 'Speaker, where said');
  }

  // ============================================================ GAMES (lava + basketball, then juggling)
  else if (mode === 'games') {
    const tGames = cue(P.gamesCue, D * 0.08) - 0.3, tBall = cue(P.ballCue, D * 0.21), tJ = cue(P.juggleCue, D * 0.39) - 0.4, tFifty = cue(P.recordCue, D * 0.44) - 0.2;
    const tDec = cue(P.decideCue, D * 0.58) - 0.2, tFast = cue(P.fastCue, D * 0.69), tCan = cue(P.voidCue, D * 0.84) - 0.1;
    const REC = Math.max(1, +(P.record || 50));
    const sw = ease(clamp((t - tJ) / 0.6)); // 0 = games, 1 = juggling
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tJ, zoom: 1.0 }, { t: tJ + 0.6, zoom: 1.0 }, { t: D, zoom: 1.0 }]);
    island({ mesa: sw < 1 ? { x: 790, y: 840, w: 170 } : null, palm: true });
    // floor is lava glow on the sand (games part)
    const lava = clamp((t - tGames) / 0.4) * (1 - clamp((t - tBall + 0.4) / 0.6)) * (1 - sw);
    if (lava > 0) {
      ctx.save(); ctx.translate(510, 1060); ctx.scale(1, 0.24); ctx.globalAlpha = lava;
      const lg = ctx.createRadialGradient(0, 0, 50, 0, 0, 560); lg.addColorStop(0, '#ffb347'); lg.addColorStop(0.6, '#ff6b3d'); lg.addColorStop(1, '#c43b2a');
      circ(0, 0, 560, lg); ctx.restore();
      for (let i = 0; i < 6; i++) { const bx = 200 + i * 120, ph = (t * 0.9 + hash(i, 5)) % 1; circ(bx, 1050 - ph * 40, 8 * (1 - ph), rgba('#ffd27a', lava * (1 - ph))); }
    }
    if (sw < 1) {
      ctx.save(); ctx.globalAlpha = 1 - sw;
      // hoop on the mesa
      const hx = 790, hy = 680;
      ctx.strokeStyle = '#7d8aa8'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(hx + 60, 840); ctx.lineTo(hx + 60, hy); ctx.lineTo(hx + 50, hy); ctx.stroke();
      ring(hx, hy, 50, { w: 10 });
      // robot on a cube (lava) then throws
      const onCube = lava > 0.05 || t < tBall - 0.8;
      cube(300, 1012, 70, {});
      const ry = 1012 - 70 * (1 - clamp((t - tBall + 0.9) / 0.3));
      const throwT = tBall - 0.7;
      robot(300, ry, 1.15, { state: t > tBall + 0.2 ? 'happy' : (t > throwT - 0.5 ? 'working' : 'idle'), seed: 9 });
      // ball cube arc
      const u = clamp((t - throwT) / 0.75);
      if (u > 0) {
        let p; if (u < 1) p = tossArc(330, 820, hx, hy, 470, u); else { const d = clamp((t - throwT - 0.75) / 0.35); p = [hx, lerp(hy, 838, eo(d))]; }
        cube(p[0], p[1] + 16, 32, { rot: u < 1 ? u * 5 : 0, color: '#d9cfc0' });
        ring(hx, hy, 50, { w: 10 }); // front of ring over the ball
        if (u >= 1) { const sp = clamp((t - throwT - 0.75) / 0.5); if (sp < 1) { ctx.strokeStyle = rgba(ACC, 1 - sp); ctx.lineWidth = 4; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r0 = 60 + 40 * sp; ctx.beginPath(); ctx.moveTo(hx + Math.cos(a) * r0, hy + Math.sin(a) * r0 * 0.5); ctx.lineTo(hx + Math.cos(a) * (r0 + 16), hy + Math.sin(a) * (r0 + 16) * 0.5); ctx.stroke(); } } }
      } else cube(330, 860, 32, { color: '#d9cfc0', alpha: t > throwT - 1.2 ? 1 : 0 });
      void onCube;
      const g1 = K.popIn(t, tGames, 0.4), g2 = K.popIn(t, tBall - 0.4, 0.4);
      if (g1 > 0) label(300, 520, Math.min(1, g1), { text: P.game1 || 'FLOOR IS LAVA', size: 28, dot: true });
      if (g2 > 0) label(700, 520, Math.min(1, g2), { text: P.game2 || 'ITS OWN BASKETBALL', size: 28, dot: true });
      ctx.restore();
    }
    if (sw > 0) {
      ctx.save(); ctx.globalAlpha = sw;
      const rx = 487, handY = 1012 - 1.4 * 150;
      const reset = t > tCan + 0.3;
      const thinking = t > tDec && t < tCan + 0.3;
      robot(rx, 1012, 1.4, { state: thinking ? 'thinking' : 'working', seed: 2 });
      // two cubes cycling
      const per = reset ? 1.3 : 0.32, amp = reset ? 220 : 120;
      for (let i = 0; i < 2; i++) {
        if (thinking) { cube(rx + (i ? 60 : -60), handY + 30, 34, {}); continue; }
        const ph = ((t - tJ) / per + i * 0.5) % 1, side = Math.floor((t - tJ) / per + i * 0.5) % 2 ? 1 : -1;
        const x = rx + side * lerp(60, -60, ph), y = handY + 20 - amp * 4 * ph * (1 - ph);
        cube(x, y, 34, { color: i ? '#d9cfc0' : '#c9c2b6' });
      }
      // counter panel
      const cnt = t < tCan + 0.25 ? Math.min(REC, Math.floor(REC * clamp((t - tJ - 0.3) / Math.max(0.8, tFifty + 0.7 - tJ - 0.3)))) : Math.min(3, Math.floor((t - tCan - 0.3) / 1.3));
      const pk = K.popIn(t, tJ + 0.2, 0.4);
      if (pk > 0) {
        ctx.save(); panel(380, 520, 360, 160, pk);
        ctx.font = H.font('ui', 24); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.counterLabel || 'CATCHES IN A ROW', 0, -46);
        ctx.font = H.font('display', 86); ctx.fillStyle = reset ? '#ffffff' : ACC; ctx.fillText(String(cnt), 0, 16);
        ctx.restore();
      }
      // record card
      const rk = K.popIn(t, tFifty + 0.6, 0.4);
      if (rk > 0) {
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(720, 520); const s = Math.min(1, rk); ctx.scale(s, s); ctx.rotate(0.05);
        rr(-120, -70, 240, 140, 16, '#f2f4fa');
        ctx.font = H.font('display', 26); ctx.fillStyle = '#2a2f45'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.recordLabel || 'NEW RECORD', 0, -30);
        ctx.font = H.font('display', 52); ctx.fillStyle = t > tCan ? '#9aa0b5' : '#2a2f45'; ctx.fillText(String(REC), 0, 22);
        ctx.restore();
        if (t > tCan) stampUI(720, 605, 0.9, { kind: 'cross', text: P.stamp || 'VOID', land: (t - tCan) / 0.5 });
      }
      // magnifier: too fast?
      const mk = clamp((t - tDec) / 0.5) * (1 - clamp((t - tCan - 0.2) / 0.4));
      if (mk > 0) {
        const mx = lerp(260, 380, ease(clamp((t - tDec) / 1.2))), my = 536;
        ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha *= mk; ctx.lineWidth = 12; ctx.strokeStyle = '#dfe4f1'; ctx.beginPath(); ctx.arc(mx, my, 70, 0, TAU); ctx.stroke();
        ctx.fillStyle = rgba('#bfe3f4', 0.18); ctx.fill(); ctx.lineCap = 'round'; ctx.lineWidth = 18; ctx.strokeStyle = '#9a6a46'; ctx.beginPath(); ctx.moveTo(mx + 50, my + 50); ctx.lineTo(mx + 110, my + 110); ctx.stroke(); ctx.restore();
        const fk = K.popIn(t, tFast - 0.3, 0.4) * (1 - clamp((t - tCan - 0.2) / 0.4));
        if (fk > 0) label(380, 660, Math.min(1, fk), { text: P.fast || 'TOO FAST TO COUNT?', size: 26, accent: true });
      }
      const sk = K.popIn(t, tCan + 0.6, 0.4);
      if (sk > 0) label(380, 660, Math.min(1, sk), { text: P.restart || 'RESTART: STRICTER RULES', size: 26, dot: true });
      ctx.restore();
    }
  }

  // ============================================================ TEST (highest point: 10.3 vs 3.5)
  else if (mode === 'test') {
    const tPaid = cue(P.paidCue, D * 0.04) - 0.2, tGet = cue(P.headCue, D * 0.16) - 0.2, tPlayed = cue(P.aLabelCue, D * 0.44) - 0.3, tA = cue(P.aCue, D * 0.53) - 0.2, tFresh = cue(P.bLabelCue, D * 0.76) - 0.3, tB = cue(P.bCue, D * 0.87) - 0.2;
    const PA = P.a || {}, PB = P.b || {};
    K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 487, y: 780 }, { t: D, zoom: 1.0 }]);
    island({ dusk: 0.15, palm: false });
    const sides = [{ x: 290, rx: 120, n: Math.min(10, PA.n || 8), t0: tGet + 0.3, t1: tA + 0.2, v: +(PA.value == null ? 8 : PA.value), lab: PA.label || 'PLAYED FIRST', tv: tA, state: 'happy' },
      { x: 690, rx: 870, n: Math.min(10, PB.n || 3), t0: tFresh + 0.2, t1: tB + 0.1, v: +(PB.value == null ? 3 : PB.value), lab: PB.label || 'FRESH COPY', tv: tB, state: 'thinking' }];
    const top = 790;
    sides.forEach((S, si) => {
      spire(S.x, 1010, top, 0, 0.15);
      // pile on top
      const pos = (i) => { const row = i < 4 ? 0 : i < 7 ? 1 : i < 9 ? 2 : 3, inRow = i < 4 ? i : i < 7 ? i - 4 : i < 9 ? i - 7 : 0, cnt = [4, 3, 2, 1][row]; return [S.x + (inRow - (cnt - 1) / 2) * 34, top - 6 - row * 33]; };
      for (let i = 0; i < S.n; i++) {
        const st = S.t0 + i * ((S.t1 - S.t0) / S.n), u = clamp((t - st) / 0.5);
        if (u <= 0) continue;
        const [px, py] = pos(i);
        const [x, y] = u < 1 ? tossArc(S.rx + (si ? -40 : 40), 830, px, py, top - 220, eo(u)) : [px, py];
        if (i === 9 && si === 0) { // the ring on top
          ctx.save(); ctx.lineWidth = 7; ctx.strokeStyle = ACC; ctx.beginPath(); ctx.ellipse(x, y - 14, 22, 8, 0, 0, TAU); ctx.stroke(); ctx.restore();
        } else if (i === 5 && si === 0) { circ(x, y - 15, 16, '#8f8a84'); } // the rock
        else cube(x, y, 30, { rot: u < 1 ? u * 4 : 0 });
      }
      const busy = t > S.t0 - 0.3 && t < S.t1 + 0.3;
      robot(S.rx, 1015, 0.95, { state: busy ? 'working' : (t > S.tv ? S.state : 'idle'), seed: 3 + si, flip: si === 1 });
      // labels + values
      const lk = K.popIn(t, si ? tFresh : tPlayed, 0.4);
      if (lk > 0) label(S.x, 640, Math.min(1, lk), { text: S.lab, size: 24, accent: si === 0 });
      const vk = K.popIn(t, S.tv, 0.45);
      if (vk > 0) { const num = (S.v * eo(clamp((t - S.tv) / (si ? 0.7 : 0.8)))).toFixed(1); bigText(num, S.x, 555, 92, si ? '#ffffff' : ACC, vk); }
    });
    const hk = K.popIn(t, tGet, 0.45);
    if (hk > 0) label(487, 470, Math.min(1, hk), { text: P.head || 'SCORE (AVERAGE)', size: 24, dot: true });
    const pk = K.popIn(t, tPaid, 0.4) * (1 - clamp((t - tGet) / 0.3));
    if (pk > 0) bigText(P.paid || 'PLAY PAID OFF', 487, 560, 64, ACC, pk);
  }

  // ============================================================ NOTES (torn memory -> worse; robots + surprises)
  else if (mode === 'notes') {
    const tErase = cue(P.eraseCue, D * 0.01) - 0.1, tTrick = cue(P.trickCue, D * 0.09), tWorse = cue(P.worseCue, D * 0.35) - 0.2, tRob = cue(P.robotsCue, D * 0.59) - 0.4, tSur = cue(P.surpriseCue, D * 0.87) - 0.2, tLearn = cue(P.learnCue, D * 0.71) - 0.2;
    const sw = ease(clamp((t - tRob) / 0.5));
    if (sw < 1) {
      ctx.save();
      K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 760 }, { t: tRob, zoom: 1.0 }]);
      island({ dusk: 0.35, palm: true });
      // row of 6 towers (5 cubes each) on the sand; four collapse
      for (let k = 0; k < 6; k++) {
        const x = 180 + k * 125, falls = k >= 2, f = falls ? clamp((t - tWorse - (k - 2) * 0.12) / 0.6) : 0;
        for (let j = 0; j < 5; j++) {
          const y0 = 1030 - j * 34;
          const x2 = x + (falls ? f * (j * 22 * (k % 2 ? 1 : -1) + (j - 2) * 6) : 0), y2 = lerp(y0, 1030 - (j % 2) * 12, eo(f) * (j > 0 ? 1 : 0));
          cube(x2, y2, 32, { rot: falls ? f * (j - 2) * 0.5 : 0, alpha: falls ? 1 - 0.5 * f : 1 });
        }
      }
      const nb = K.popIn(t, 0.0, 0.4);
      notebook(487, 660, 0.95 * Math.min(1, nb), { title: 'MEMORY', left: P.notesLeft || ['Jump to climb', 'Ring = a hoop', 'Built a spiral'],
        right: P.notesRight || [{ text: 'Best trick', hi: true }, { text: '= more blocks', hi: true }, { text: '(for towers)' }], tear: eo(clamp((t - tTrick) / 1.0)) });
      // tearing hand-free gesture: label
      const ek = K.popIn(t, tErase + 0.2, 0.4) * (1 - clamp((t - tWorse) / 0.3));
      if (ek > 0) label(487, 470, Math.min(1, ek), { text: P.erased || 'ERASED FROM ITS NOTES', size: 26, accent: true });
      const wk = K.popIn(t, tWorse + 0.4, 0.4);
      if (wk > 0) label(487, 470, Math.min(1, wk), { text: P.worse || 'RESULTS GOT WORSE', size: 28, dot: true });
      ctx.restore();
    }
    if (sw > 0) {
      ctx.save(); ctx.globalAlpha = sw;
      K.camera(ctx, t, [{ t: tRob, zoom: 1.0 }, { t: D, zoom: 1.08, x: 487, y: 820 }]);
      K.world.city(ctx, { t, time: 'dusk', groundY: 990 });
      const walk = clamp((t - tRob) / 2.2);
      const rx = lerp(180, 400, eo(walk));
      robot(rx, 1022, 1.3, { state: t > tSur + 0.2 ? 'happy' : (t > tLearn ? 'thinking' : 'idle'), seed: 4 });
      // surprise: a box tumbles into the path
      const bu = clamp((t - tLearn + 0.4) / 0.7);
      const bx = 640, by = lerp(560, 1022, eo(bu));
      if (bu > 0) { ctx.save(); ctx.translate(bx, by); ctx.rotate((1 - eo(bu)) * 1.2); rr(-70, -120, 140, 120, 8, '#c9965f'); ctx.fillStyle = '#a77a48'; ctx.fillRect(-70, -70, 140, 14); rr(-14, -120, 28, 120, 2, '#e3c08a'); ctx.restore(); }
      const qk = K.popIn(t, tLearn + 0.3, 0.4) * (1 - clamp((t - tSur - 0.1) / 0.3));
      if (qk > 0) bigText('?', rx + 70, 690, 90, '#ffffff', qk);
      const lb = clamp((t - tSur) / 0.5);
      if (lb > 0) K.drawLightbulb(ctx, rx + 80, 760, 0.9 * Math.min(1, K.popIn(t, tSur, 0.4)), { on: lb, t });
      const pk = K.popIn(t, tLearn, 0.45);
      if (pk > 0) label(487, 480, Math.min(1, pk), { text: P.helps || 'COULD HELP ROBOTS WITH SURPRISES', size: 26, dot: true });
      ctx.restore();
    }
  }

  // ============================================================ CAVEATS
  else if (mode === 'caveats') {
    const tCav = cue(P.cavCue, D * 0.02) - 0.2, tRole = cue(P.roleCue, D * 0.14) - 0.3, tNote = cue(P.noteCue, D * 0.32) - 0.3, tExp = cue(P.expertCue, D * 0.58) - 0.4, tPeer = cue(P.peerCue, D * 0.9) - 0.3;
    const STAMP = P.stamp || 'NOT PEER-REVIEWED';
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.06, x: 487, y: 800 }]);
    island({ dusk: 0.85, night: 0.15, sun: { x: 860, y: 760 }, palm: true });
    // dim overlay
    ctx.fillStyle = 'rgba(6,8,24,0.25)'; ctx.fillRect(0, 0, 1080, 1920);
    const mk = clamp((t - tRole) / 0.5);
    robot(560, 1015, 1.4, { state: t > tExp ? 'thinking' : 'idle', seed: 6 });
    mask(560, 1015 - 1.4 * 190 + 20 + (1 - eo(mk)) * 140, 1.1, mk * (1 - clamp((t - tExp) / 0.4) * 0.6));
    // signpost with the soul note
    const nk = K.popIn(t, tNote, 0.45);
    ctx.strokeStyle = '#7a5a3e'; ctx.lineWidth = 14; ctx.beginPath(); ctx.moveTo(250, 1015); ctx.lineTo(250, 870); ctx.stroke();
    if (nk > 0) {
      ctx.save(); ctx.translate(250, 860); const s = Math.min(1, nk); ctx.scale(s, s); ctx.rotate(-0.06 + Math.sin(t * 1.5) * 0.02);
      rr(-140, -130, 280, 150, 12, '#fff3c4');
      circ(0, -122, 10, '#ff6b5e');
      ctx.font = H.font('display', 26); ctx.fillStyle = '#2a2f45'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.noteTitle || 'PROMPT FILE', 0, -90);
      ctx.font = H.font('ui', 24); ctx.fillText(P.noteText || '“be curious”', 0, -50);
      ctx.font = H.font('body', 20); ctx.fillStyle = '#5b6074'; ctx.fillText(P.noteSub || 'its starting prompt', 0, -16);
      ctx.restore();
    }
    // top: header -> role-play card -> expert quote (+ stamp)
    const ck = K.popIn(t, tCav, 0.4) * (1 - clamp((t - tRole) / 0.3));
    if (ck > 0) bigText(P.head || 'THE CAVEATS', 487, 540, 72, ACC, ck);
    const rk = K.popIn(t, tRole, 0.45) * (1 - clamp((t - tExp) / 0.3));
    if (rk > 0) {
      ctx.save(); panel(487, 520, 640, 150, rk);
      ctx.font = H.font('display', 44); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.role || 'Could be role-play', 0, -18);
      ctx.font = H.font('ui', 26); ctx.fillStyle = ACC; ctx.fillText(P.roleBy || 'the authors say', 0, 36);
      ctx.restore();
    }
    quotePanel(487, 530, 840, K.popIn(t, tExp, 0.45), P.quote || 'Quote here.', P.by || 'Outside expert, where said');
    if (t > tPeer) { // rubber-stamp box
      const land = clamp((t - tPeer) / 0.4), sc = 1 + 1.2 * Math.pow(1 - eo(land), 2);
      ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.translate(640, 760); ctx.rotate(-0.12); ctx.scale(sc, sc); ctx.globalAlpha = clamp(land / 0.3);
      ctx.font = H.font('display', 40); const tw = ctx.measureText(STAMP).width;
      roundRect(ctx, -tw / 2 - 26, -44, tw + 52, 88, 12); ctx.fillStyle = 'rgba(20,6,10,0.75)'; ctx.fill();
      ctx.lineWidth = 7; ctx.strokeStyle = '#ff6b5e'; ctx.stroke();
      ctx.fillStyle = '#ff6b5e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(STAMP, 0, 3);
      ctx.restore();
    }
  }

  // ============================================================ PAYOFF
  else {
    const tLine = cue(P.lineCue, D * 0.13) - 0.4, tQ = cue(P.qCue, D * 0.74) - 0.3;
    K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 487, y: 820 }, { t: D, zoom: 1.0 }]);
    island({ dusk: 1, sun: { x: 800, y: 820 }, palm: true });
    // small heart of cubes on the sand, robot beside it looking at the sunset
    const N = 14;
    for (let i = 0; i < N; i++) { const a = (i / N) * TAU; const x = 700 + 8.5 * 16 * Math.pow(Math.sin(a), 3) / 1.6, y = 900 - 8.5 * (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 1.6; cube(x, y + 40, 26, { glow: 0.12 }); }
    robot(380, 1015, 1.4, { state: t > tQ ? 'happy' : 'idle', seed: 8 });
    const qOut = clamp((t - tQ) / 0.3);
    quotePanel(487, 540, 840, K.popIn(t, tLine, 0.45), P.quote || 'Quote here.', P.by || 'Speaker, where said', 1 - qOut);
    const ak = K.popIn(t, tQ, 0.45);
    if (ak > 0) {
      ctx.save(); panel(487, 500, 760, 140, ak); ctx.lineWidth = 4; ctx.strokeStyle = ACC; roundRect(ctx, -380, -70, 760, 140, 26); ctx.stroke();
      ctx.font = H.font('display', 54); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.question || 'Should AI get to play?', 0, 2);
      ctx.restore();
      const c1 = K.popIn(t, tQ + 0.4, 0.4), c2 = K.popIn(t, tQ + 0.65, 0.4);
      if (c1 > 0) label(290, 660 + K.bob(t, 3, 0.7), Math.min(1, c1), { text: P.yes || 'YES, LET IT PLAY', size: 28, dot: true });
      if (c2 > 0) label(690, 660 + K.bob(t, 3, 0.7, 0.5), Math.min(1, c2), { text: P.no || 'NO, JUST WORK', size: 28, dot: true });
    }
  }
  ctx.restore();
}
