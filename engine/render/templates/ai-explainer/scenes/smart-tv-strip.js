// Scene "smart-tv-strip" (was dumb-tv; full frame). People use an AI coding agent (the kit robot with a toolbox) to
// strip a smart TV back to basics. Generic TVs only, no logos; brand / project names only as plain text pills.
// Fits: "people hack / jailbreak / de-bloat their devices with AI agents", smart-TV tracking (ACR) and ads, any
// "take back your gadget" story. Defaults are generic ("Project name", "TV 1", a placeholder quote): pass the
// story's project names, maker names, verbatim quote and source. Cue params are narration words ("word#n" = the
// (n+1)th time it is spoken in the scene); without them fixed fractions of the scene.
// modes:
//   living  (2-beat span) wall TV covered in ad tiles, a frustrated viewer with a remote; complaint pills (ads /
//           tracking / slow menus) on cue, an eye opens on the TV, a spinner; the robot walks in with a toolbox,
//           "AI coding agent" pill, a dashed Wi-Fi link; ad tiles pop off one by one, a plain home screen appears.
//           params: complaints [3], agent, like; cues adsCue, trackCue, slowCue, agentsCue, likeCue, linkCue,
//           stripCue, homeCue
//   count   close-up: the TV shows a 5x5 grid of package tiles, project + "Parents' TV" pills, two cartoon parents;
//           tiles fly off one by one while a counter counts to `count`; a new launcher slides in.
//           params: count (<= 25), project, tag, owners, counter [3 lines], launcher; cues projectCue, ownersCue,
//           removedCue, newCue
//   eye     night living room: a viewer in an armchair, the TV shows a show; an eye opens on the TV, an ACR pill,
//           channels flip, screenshot / audio / fingerprint chips fly into a "viewing data" box, ads target the viewer.
//           params: acr, every, box, chips [3], target; cues acrCue, everyCue, shotCue, audioCue, printCue, targetCue
//   switch  the robot switches the eye off (slash, "Tracking off"), the home screen keeps only apps + HDMI tiles,
//           verbatim quote panel; then a dusk street: houses' TV glows turn plain, an "ad business" tower wobbles
//           under a hedged "could" pill.
//           params: project (keep short: the pill is left-anchored at x 190), off, quote [3 parts, lit on appsCue /
//           hdmiCue / elseCue], quoteBy, tower, spread, could;
//           cues projectCue, appsCue, hdmiCue, elseCue, cutCue (switch to the street), spreadCue, couldCue
//   brick   two TVs on a cabinet: one goes black with a sad face + stamp, the other's progress bar stalls halfway;
//           robot thinks, viewer worries; "It's early" / "Agents make mistakes" / source pills.
//           params: tv1, tv2, stamp, stuck, early, mistakes, source; cues earlyCue, mistakesCue, sourceCue, brickCue,
//           stuckCue, halfCue
//   payoff  the living room settled: plain home screen, relaxed viewer, robot packs up; question card + two chips.
//           params: tag, question1, question2, a, b; cues tagCue, qCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic, easeInOutCubic, roundRect, rgba, mixHex, hash } = H;
  const D = info.duration, ACC = info.accent, TAU = Math.PI * 2;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const rr = (x, y, w, h, r, fill) => { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); };
  const circ = (x, y, r, fill) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); };
  const pop = (tt, dur = 0.4) => Math.min(1, K.popIn(t, tt, dur));
  const pill = (tt, x, y, text, o = {}) => { const p = pop(tt); if (p > 0) K.drawLabel(ctx, x, y, p, Object.assign({ text, size: 28 }, o)); };
  const text = (s, x, y, size, color, kind = 'bold', align = 'center') => { ctx.font = H.font(kind, size); ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = color; ctx.fillText(s, x, y); };
  const AD_COLS = ['#e8786a', '#f2a541', '#6f86e0', '#a08be0', '#4fb3a6', '#e05a8a', '#f2d14a', '#5ec8e5'];

  // ---------------------------------------------------------------- TV pieces
  // TV frame; returns the screen rect. (x, y) = top-left of the outer frame.
  function tvFrame(x, y, w, h, o = {}) {
    if (o.stand) {
      K.shadow(ctx, x + w / 2, y + h + 70, w * 0.6, 0.3);
      rr(x + w / 2 - 14, y + h, 28, 54, 4, '#23283d');
      rr(x + w / 2 - w * 0.18, y + h + 48, w * 0.36, 16, 8, '#23283d');
    } else {
      K.shadow(ctx, x + w / 2, y + h + 30, w * 0.9, 0.18);
    }
    rr(x - 4, y - 4, w + 8, h + 8, 20, '#0b0d18');
    rr(x, y, w, h, 16, '#1c2033');
    const s = { x: x + 14, y: y + 14, w: w - 28, h: h - 28 };
    rr(s.x, s.y, s.w, s.h, 8, '#0d1020');
    // tiny power LED
    circ(x + w - 26, y + h - 6, 3.5, o.off ? '#ff6b5e' : ACC);
    return s;
  }
  function clipScreen(s, fn) { ctx.save(); roundRect(ctx, s.x, s.y, s.w, s.h, 8); ctx.clip(); fn(); ctx.restore(); }
  // ad clutter: big hero banner + rows of sponsored tiles. `gone(i)` = 0..1 flight progress of tile i (0 = in place)
  function adScreen(s, gone, flash) {
    const g = ctx.createLinearGradient(s.x, s.y, s.x + s.w, s.y + s.h); g.addColorStop(0, '#2a1f4a'); g.addColorStop(1, '#4a2140');
    ctx.fillStyle = g; ctx.fillRect(s.x, s.y, s.w, s.h);
    const tiles = [];
    // hero banner
    tiles.push({ x: s.x + 14, y: s.y + 14, w: s.w * 0.62, h: s.h * 0.42, c: '#e8786a', hero: true });
    tiles.push({ x: s.x + 26 + s.w * 0.62, y: s.y + 14, w: s.w * 0.38 - 40, h: s.h * 0.42, c: '#f2a541' });
    const rows = 2, cols = 4, tw = (s.w - 28 - (cols - 1) * 10) / cols, th = (s.h * 0.58 - 38) / rows;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) tiles.push({ x: s.x + 14 + c * (tw + 10), y: s.y + 24 + s.h * 0.42 + r * (th + 10), w: tw, h: th, c: AD_COLS[(r * cols + c + 2) % AD_COLS.length] });
    return tiles.map((T, i) => ({ ...T, draw: () => {
      const k = gone ? gone(i) : 0;
      if (k >= 1) return;
      ctx.save();
      const cx = T.x + T.w / 2, cy = T.y + T.h / 2, dir = hash(i, 7) > 0.5 ? 1 : -1;
      ctx.translate(cx + dir * k * 260, cy - Math.sin(k * Math.PI) * 120 + k * k * 380); ctx.rotate(dir * k * 1.6); ctx.scale(1 + 0.15 * Math.sin(k * Math.PI), 1 + 0.15 * Math.sin(k * Math.PI));
      ctx.globalAlpha = 1 - smooth((k - 0.6) / 0.4);
      rr(-T.w / 2, -T.h / 2, T.w, T.h, 8, T.c);
      rr(-T.w / 2, T.h / 2 - T.h * 0.3, T.w, T.h * 0.3, 0, rgba('#000000', 0.18));
      // AD badge
      ctx.font = H.font('ui', T.hero ? 26 : 18); const bw = ctx.measureText('AD').width + 16;
      rr(-T.w / 2 + 8, -T.h / 2 + 8, bw, T.hero ? 34 : 26, 6, '#ffe14a');
      ctx.fillStyle = '#1a1420'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('AD', -T.w / 2 + 16, -T.h / 2 + (T.hero ? 26 : 22));
      if (T.hero) { text('SPONSORED', -T.w / 2 + 18, T.h / 2 - 16, 26, '#ffffff', 'display', 'left'); circ(T.w / 2 - 50, -6, 30 + 4 * Math.sin(t * 6), rgba('#ffffff', 0.85)); }
      else { circ(0, -6, Math.min(T.w, T.h) * 0.16, rgba('#ffffff', 0.55)); }
      if (flash) { ctx.globalAlpha = flash * (0.5 + 0.5 * Math.sin(t * 18 + i)); rr(-T.w / 2, -T.h / 2, T.w, T.h, 8, '#ffffff'); }
      ctx.restore();
    } }));
  }
  // plain home screen: an apps row and HDMI tiles. lit: {apps, hdmi} 0..1 highlight
  function homeScreen(s, a = 1, lit = {}) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = '#10142a'; ctx.fillRect(s.x, s.y, s.w, s.h);
    const sz = Math.min(s.w, s.h * 1.7) / 520;
    text('Home', s.x + 24 * sz, s.y + 44 * sz, 26 * sz, rgba('#ffffff', 0.85), 'bold', 'left');
    // apps row: 4 rounded tiles with simple glyphs
    const n = 4, gap = 14 * sz, tw = (s.w - 48 * sz - gap * (n - 1)) / n, th = Math.min(tw * 0.62, s.h * 0.3), y0 = s.y + 64 * sz;
    const glyph = ['#6f86e0', '#4fb3a6', '#e8786a', '#a08be0'];
    for (let i = 0; i < n; i++) {
      const x = s.x + 24 * sz + i * (tw + gap);
      rr(x, y0, tw, th, 10 * sz, glyph[i]);
      if (lit.apps) { ctx.save(); ctx.globalAlpha = a * lit.apps; ctx.lineWidth = 4 * sz; ctx.strokeStyle = ACC; roundRect(ctx, x - 3, y0 - 3, tw + 6, th + 6, 12 * sz); ctx.stroke(); ctx.restore(); }
      const cx = x + tw / 2, cy = y0 + th / 2, r = th * 0.24;
      ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath();
      if (i === 0) { ctx.moveTo(cx - r * 0.7, cy - r); ctx.lineTo(cx + r, cy); ctx.lineTo(cx - r * 0.7, cy + r); ctx.closePath(); ctx.fill(); }
      else if (i === 1) { ctx.arc(cx - r * 0.4, cy + r * 0.5, r * 0.45, 0, TAU); ctx.fill(); ctx.fillRect(cx - r * 0.05, cy - r, r * 0.22, r * 1.5); ctx.fillRect(cx - r * 0.05, cy - r, r * 0.8, r * 0.25); }
      else if (i === 2) { ctx.arc(cx, cy, r, 0, TAU); ctx.fill(); }
      else { ctx.fillRect(cx - r, cy - r * 0.7, r * 2, r * 1.4); }
    }
    text('Your apps', s.x + 24 * sz, y0 + th + 34 * sz, 22 * sz, rgba('#ffffff', 0.7), 'ui', 'left');
    // HDMI tiles
    const hy = y0 + th + 52 * sz, hw = (s.w - 48 * sz - gap) / 2, hh = Math.max(20, s.y + s.h - hy - 18 * sz);
    for (let i = 0; i < 2; i++) {
      const x = s.x + 24 * sz + i * (hw + gap);
      rr(x, hy, hw, hh, 10 * sz, '#232a4a');
      if (lit.hdmi) { ctx.save(); ctx.globalAlpha = a * lit.hdmi; ctx.lineWidth = 4 * sz; ctx.strokeStyle = ACC; roundRect(ctx, x - 3, hy - 3, hw + 6, hh + 6, 12 * sz); ctx.stroke(); ctx.restore(); }
      // port glyph
      const px = x + 22 * sz, py = hy + hh / 2;
      rr(px, py - 9 * sz, 40 * sz, 18 * sz, 4 * sz, '#8a93a8');
      text('HDMI ' + (i + 1), px + 52 * sz, py + 9 * sz, 26 * sz, '#ffffff', 'bold', 'left');
    }
    ctx.restore();
  }
  // a generic "show": hills + sun, or a ball game, by channel index
  function showScreen(s, ch, tt) {
    const k = ((ch % 3) + 3) % 3;
    const skies = [['#5aa7e0', '#a8d8f0'], ['#2f6e45', '#3f8f5a'], ['#2a2050', '#e0785a']];
    const g = ctx.createLinearGradient(0, s.y, 0, s.y + s.h); g.addColorStop(0, skies[k][0]); g.addColorStop(1, skies[k][1]);
    ctx.fillStyle = g; ctx.fillRect(s.x, s.y, s.w, s.h);
    if (k === 0) {
      circ(s.x + s.w * 0.75, s.y + s.h * 0.3, s.h * 0.12, '#ffe58a');
      ctx.fillStyle = '#4f9a5f'; ctx.beginPath(); ctx.moveTo(s.x, s.y + s.h); ctx.quadraticCurveTo(s.x + s.w * 0.3, s.y + s.h * 0.45, s.x + s.w * 0.6, s.y + s.h); ctx.fill();
      ctx.fillStyle = '#3c7f4c'; ctx.beginPath(); ctx.moveTo(s.x + s.w * 0.35, s.y + s.h); ctx.quadraticCurveTo(s.x + s.w * 0.7, s.y + s.h * 0.5, s.x + s.w, s.y + s.h * 0.85); ctx.lineTo(s.x + s.w, s.y + s.h); ctx.fill();
    } else if (k === 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3; ctx.strokeRect(s.x + 20, s.y + 20, s.w - 40, s.h - 40);
      ctx.beginPath(); ctx.moveTo(s.x + s.w / 2, s.y + 20); ctx.lineTo(s.x + s.w / 2, s.y + s.h - 20); ctx.stroke();
      ctx.beginPath(); ctx.arc(s.x + s.w / 2, s.y + s.h / 2, s.h * 0.15, 0, TAU); ctx.stroke();
      circ(s.x + s.w * (0.5 + 0.3 * Math.sin(tt * 1.7)), s.y + s.h * (0.5 + 0.25 * Math.sin(tt * 2.3)), 10, '#ffffff');
    } else {
      circ(s.x + s.w * 0.3, s.y + s.h * 0.75, s.h * 0.2, '#ffb36b');
      for (let i = 0; i < 4; i++) rr(s.x + s.w * (0.45 + i * 0.13), s.y + s.h * (0.45 - 0.05 * i), s.w * 0.1, s.h, 4, '#1a1636');
    }
  }
  // the tracking eye on the TV's top-right corner. open 0..1, off 0..1 (slash)
  function trackEye(x, y, r, open, off, look) {
    if (open <= 0 && off <= 0) return;
    ctx.save();
    if (open > 0 && off < 1) K.glow(ctx, x, y, r * 3, '#ff6b5e', 0.25 * open * (1 - off) * (0.7 + 0.3 * Math.sin(t * 4)));
    circ(x, y, r * 1.25, 'rgba(10,12,22,0.92)');
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.arc(x, y, r * 1.25, 0, TAU); ctx.stroke();
    const o = clamp(open) * (1 - 0.92 * clamp(off));
    const blink = ((t * 0.31) % 1) < 0.04 ? 0.15 : 1;
    const oh = r * 0.62 * o * blink;
    ctx.beginPath(); ctx.moveTo(x - r, y); ctx.quadraticCurveTo(x, y - oh * 2, x + r, y); ctx.quadraticCurveTo(x, y + oh * 2, x - r, y); ctx.closePath();
    ctx.fillStyle = '#f2f4fa'; ctx.fill();
    if (oh > 2) { ctx.save(); ctx.clip(); circ(x + (look || 0) * r * 0.35, y, r * 0.42, '#ff6b5e'); circ(x + (look || 0) * r * 0.35, y, r * 0.2, '#1a1420'); ctx.restore(); }
    ctx.lineWidth = 3; ctx.strokeStyle = '#1a1420'; ctx.stroke();
    if (off > 0) { ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = '#ff6b5e'; const k = easeOutCubic(off); ctx.beginPath(); ctx.moveTo(x - r * 0.95, y - r * 0.95); ctx.lineTo(x - r * 0.95 + 1.9 * r * k, y - r * 0.95 + 1.9 * r * k); ctx.stroke(); }
    ctx.restore();
  }
  function spinner(x, y, r, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    circ(x, y, r + 18, 'rgba(10,12,22,0.8)');
    for (let i = 0; i < 10; i++) { const ang = (i / 10) * TAU + Math.floor(t * 4) * (TAU / 10) * 0.25; ctx.globalAlpha = a * (0.2 + 0.8 * (i / 10)); circ(x + Math.cos(ang) * r, y + Math.sin(ang) * r, 6, '#ffffff'); }
    ctx.restore();
  }
  function toolbox(x, y, s, open) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 120, 0.3);
    rr(-60, -58, 120, 58, 8, '#d94f45'); rr(-60, -58, 120, 14, 6, '#b8403a');
    rr(-8, -40, 16, 12, 3, '#ffcc33');
    if (open > 0) { ctx.save(); ctx.translate(-60, -58); ctx.rotate(-open * 0.9); rr(0, -12, 120, 12, 5, '#e8645a'); ctx.restore();
      ctx.save(); ctx.translate(20, -58); ctx.rotate(-0.4); rr(-4, -46 * open, 8, 46 * open, 3, '#b9c1d6'); circ(0, -46 * open, 9 * open, '#b9c1d6'); ctx.restore();
      rr(-36, -58 - 22 * open, 10, 22 * open, 3, '#ffcc33'); }
    ctx.lineWidth = 6; ctx.strokeStyle = '#3b4260'; ctx.beginPath(); ctx.moveTo(-26, -58); ctx.lineTo(-26, -74); ctx.lineTo(26, -74); ctx.lineTo(26, -58); ctx.stroke();
    ctx.restore();
  }
  // dashed wifi link with an icon in the middle
  function wifiLink(x0, y0, x1, y1, p) {
    if (p <= 0) return;
    ctx.save(); ctx.strokeStyle = rgba(ACC, 0.85); ctx.lineWidth = 5; ctx.setLineDash([14, 12]); ctx.lineDashOffset = -t * 40;
    const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 90;
    const pts = K.bezier(x0, y0, mx, my, mx, my, x1, y1, 30);
    K.pathDraw(ctx, pts, p);
    ctx.setLineDash([]);
    if (p >= 1) {
      const [cx, cy] = K.pathPoint(pts, 0.5);
      circ(cx, cy, 30, 'rgba(10,12,22,0.9)');
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i++) { ctx.lineWidth = 4; ctx.strokeStyle = rgba(ACC, 0.35 + 0.65 * (((t * 2 - i * 0.3) % 1 + 1) % 1 > 0.3 ? 1 : 0.4)); ctx.beginPath(); ctx.arc(cx, cy + 12, 6 + i * 7, -Math.PI * 0.78, -Math.PI * 0.22); ctx.stroke(); }
      circ(cx, cy + 12, 3.5, ACC);
    }
    ctx.restore();
  }
  function remote(x, y, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); rr(-9, -34, 18, 56, 6, '#2a2f45'); circ(0, -24, 4, '#ff6b5e'); for (let i = 0; i < 3; i++) circ(0, -10 + i * 9, 3, '#8a93a8'); ctx.restore(); }

  // ---------------------------------------------------------------- shared living room
  // st: { tiles: (i)=>k, home 0..1, eye 0..1, eyeOff, spin 0..1, flash, robot {x, show, state, open}, person {pose, mood}, link }
  function livingRoom(st) {
    K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true, plant: false, wall: '#262b4f' });
    // media console
    K.shadow(ctx, 610, 905, 620, 0.35);
    rr(330, 830, 560, 70, 12, '#3a2f4a'); rr(330, 830, 560, 14, 8, '#4a3d5e');
    rr(350, 856, 250, 30, 6, '#2e2540'); rr(620, 856, 250, 30, 6, '#2e2540');
    const s = tvFrame(330, 450, 560, 340);
    clipScreen(s, () => {
      if (st.home < 1) adScreen(s, st.tiles, st.flash).forEach((T) => T.draw());
      homeScreen(s, st.home, st.lit || {});
      spinner(s.x + s.w / 2, s.y + s.h / 2, 30, st.spin || 0);
    });
    trackEye(s.x + s.w - 40, s.y + 40, 26, st.eye || 0, st.eyeOff || 0, Math.sin(t * 1.3));
    // viewer
    const pp = st.person || {};
    K.drawPerson(ctx, 190, 1030, 1.3, { t, pose: pp.pose || 'stand', mood: pp.mood || 'neutral', skin: 2, hair: 1, hairStyle: 'short', shirt: 1, look: 0.6, seed: 4 });
    if ((pp.pose || 'stand') === 'stand') remote(248, 880, 0.3);
    // robot + toolbox
    const R = st.robot;
    if (R && R.show > 0) {
      const rx = R.x;
      toolbox(rx - 100, 1032, 0.8, R.open || 0);
      K.drawRobot(ctx, rx, 1030, 1.15, { t, state: R.state || 'idle', walk: R.walking ? t : undefined, flip: true, seed: 5 });
    }
    if (st.link > 0 && R) wifiLink(R.x - 60, 800, s.x + s.w * 0.45, s.y + s.h - 40, st.link);
    return s;
  }

  ctx.save();
  const mode = P.mode || 'living';

  if (mode === 'living') {
    const tAds = at(P.adsCue, D * 0.25), tTrack = at(P.trackCue, D * 0.3), tSlow = at(P.slowCue, D * 0.33);
    const tAgents = at(P.agentsCue, D * 0.5), tLike = at(P.likeCue, D * 0.56), tTvs = at(P.linkCue, D * 0.65), tStrip = at(P.stripCue, D * 0.83), tHome = at(P.homeCue, D * 0.945);
    const CP = P.complaints || ['Ads', 'Tracking', 'Slow menus'];
    K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 540, y: 690 }, { t: tAgents - 0.5, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.02, x: 500, y: 725 }]);
    const nTiles = 10, stripDur = Math.max(1.2, tHome - tStrip - 0.3);
    const tileK = (i) => clamp((t - (tStrip + (i / nTiles) * stripDur * 0.85)) / 0.7);
    const walkIn = easeInOutCubic(clamp((t - (tAgents - 0.2)) / 1.4));
    const happy = t > tHome + 0.2;
    livingRoom({
      tiles: tileK, home: smooth((t - tHome + 0.1) / 0.5), eye: smooth((t - tTrack) / 0.4) * (1 - smooth((t - tHome) / 0.4)),
      spin: smooth((t - tSlow) / 0.3) * (1 - smooth((t - tAgents) / 0.4)), flash: t > tAds && t < tAds + 1.0 ? 1 - (t - tAds) : 0,
      lit: happy ? { apps: smooth((t - tHome - 0.3) / 0.4) } : {},
      robot: { x: lerp(1180, 820, walkIn), show: walkIn, walking: walkIn > 0 && walkIn < 1, state: t > tStrip - 0.3 && !happy ? 'working' : happy ? 'happy' : 'idle', open: smooth((t - tTvs) / 0.5) },
      person: { pose: happy ? 'cheer' : t > tAgents + 1 ? 'point' : 'stand', mood: happy ? 'happy' : t > tAds ? 'angry' : 'worried' },
      link: clamp((t - tTvs) / 0.9),
    });
    // complaint pills (left column)
    pill(tAds, 190, 520, CP[0], { accent: true, size: 30 });
    pill(tTrack, 190, 590, CP[1], { size: 30, dot: true });
    pill(tSlow, 190, 660, CP[2], { size: 30, dot: true });
    // agent pills (lower right, under the TV)
    pill(tAgents + 0.4, 500, 965, P.agent || 'AI coding agent', { accent: true, size: 28 });
    if (P.like !== '') pill(tLike, 500, 1022, P.like || 'on a laptop', { size: 26 });
  } else if (mode === 'count') {
    const N = Math.max(1, Math.min(25, +(P.count || 25)));
    const tProj = at(P.projectCue, D * 0.18), tPar = at(P.ownersCue, D * 0.38), tRem = at(P.removedCue, D * 0.62), tNew = at(P.newCue, D * 0.9);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 470, y: 720 }]);
    K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: true, wall: '#2a2f55' });
    const s = tvFrame(70, 520, 600, 360);
    const remDur = Math.max(1.5, tNew - tRem - 0.4);
    const kOf = (i) => clamp((t - (tRem + (i / N) * remDur)) / 0.6);
    clipScreen(s, () => {
      ctx.fillStyle = '#18183a'; ctx.fillRect(s.x, s.y, s.w, s.h);
      const cols = 5, rows = 5, gx = 10, tw = (s.w - 24 - gx * (cols - 1)) / cols, th = (s.h - 24 - gx * (rows - 1)) / rows;
      for (let i = 0; i < rows * cols; i++) {
        const c = i % cols, r = (i / cols) | 0, k = i < N ? kOf(i) : 0;
        if (k >= 1) continue;
        const x = s.x + 12 + c * (tw + gx), y = s.y + 12 + r * (th + gx), dir = hash(i, 3) > 0.5 ? 1 : -1;
        ctx.save(); ctx.translate(x + tw / 2 + dir * k * 200, y + th / 2 - Math.sin(k * Math.PI) * 90 + k * k * 300); ctx.rotate(dir * k * 2); ctx.globalAlpha = 1 - smooth((k - 0.5) / 0.5);
        rr(-tw / 2, -th / 2, tw, th, 6, AD_COLS[i % AD_COLS.length]);
        rr(-tw / 2 + 8, -th / 2 + 8, tw * 0.3, th - 16, 4, rgba('#000000', 0.22));
        rr(-tw / 2 + tw * 0.42, -th / 2 + th * 0.3, tw * 0.45, 7, 3, rgba('#ffffff', 0.7));
        rr(-tw / 2 + tw * 0.42, -th / 2 + th * 0.58, tw * 0.3, 7, 3, rgba('#ffffff', 0.45));
        ctx.restore();
      }
      homeScreen(s, smooth((t - tNew) / 0.5), {});
    });
    // little parents in front of the cabinet
    const par = smooth((t - tPar + 0.2) / 0.6);
    if (par > 0) {
      ctx.save(); ctx.globalAlpha = par;
      K.drawPerson(ctx, 200 - (1 - par) * 40, 1036, 0.66, { t, pose: t > tNew ? 'cheer' : 'stand', mood: 'happy', skin: 1, hair: 3, hairStyle: 'bun', shirt: 3, seed: 2 });
      K.drawPerson(ctx, 300 - (1 - par) * 40, 1036, 0.7, { t, pose: t > tNew ? 'cheer' : 'point', mood: 'happy', skin: 1, hair: 3, hairStyle: 'short', shirt: 4, seed: 6 });
      ctx.restore();
    }
    // robot working on the right
    toolbox(470, 1036, 0.6, smooth((t - tRem + 0.6) / 0.4));
    K.drawRobot(ctx, 560, 1034, 0.75, { t, state: t > tNew + 0.3 ? 'happy' : t > tRem - 0.3 ? 'working' : 'idle', seed: 9 });
    // pills
    pill(tProj, 230, 490, P.project || 'Project name', { accent: true, size: 30 });
    pill(tProj + 0.5, 470, 490, P.tag || 'Open source', { size: 26 });
    pill(tPar, 370, 965, P.owners || 'Family TV', { size: 26, dot: true });
    // counter (right column)
    const removed = Math.min(N, Array.from({ length: N }, (_, i) => kOf(i) > 0.15).filter(Boolean).length);
    const cp = pop(tRem - 0.3, 0.45);
    if (cp > 0) {
      ctx.save(); ctx.translate(800, 640); ctx.scale(cp, cp);
      rr(-115, -120, 230, 290, 26, 'rgba(10,12,22,0.86)');
      const bump = removed > 0 ? 1 + 0.08 * Math.max(0, 1 - ((t - tRem) * N / remDur % 1) * 3) : 1;
      ctx.save(); ctx.scale(bump, bump); text(String(removed), 0, 30, 120, removed >= N ? ACC : '#ffffff', 'display'); ctx.restore();
      const CL = P.counter || ['Junk', 'packages', 'removed'];
      text(CL[0], 0, 82, 30, '#ffffff', 'bold'); text(CL[1], 0, 116, 28, rgba('#ffffff', 0.85), 'bold'); text(CL[2], 0, 150, 28, rgba('#ffffff', 0.85), 'bold');
      ctx.restore();
    }
    pill(tNew, 800, 870, P.launcher || 'New launcher', { accent: true, size: 28 });
  } else if (mode === 'eye') {
    const tAcr = at(P.acrCue, D * 0.19), tEvery = at(P.everyCue, D * 0.46), tShot = at(P.shotCue, D * 0.6), tAudio = at(P.audioCue, D * 0.69), tFp = at(P.printCue, D * 0.74), tTarget = at(P.targetCue, D * 0.92);
    const CH = P.chips || ['Screens', 'Audio', 'Prints'];
    K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 430, y: 700 }, { t: tShot - 0.3, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.02, x: 487, y: 730 }]);
    K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, wall: '#20244a' });
    // TV left on a stand
    const s = tvFrame(80, 520, 470, 290, { stand: true });
    const flips = t > tEvery && t < tEvery + 1.8 ? Math.floor((t - tEvery) * 5) : (t >= tEvery + 1.8 ? 9 : 0);
    clipScreen(s, () => {
      showScreen(s, flips, t);
      if (t > tEvery && t < tEvery + 1.8) { ctx.fillStyle = rgba('#ffffff', 0.15 * (1 - ((t - tEvery) * 5 % 1))); ctx.fillRect(s.x, s.y, s.w, s.h); }
      // scan beam
      const eyeOpen = smooth((t - tAcr) / 0.5);
      if (eyeOpen > 0) { const sy = s.y + ((t * 0.6) % 1) * s.h; ctx.fillStyle = rgba('#ff6b5e', 0.35 * eyeOpen); ctx.fillRect(s.x, sy - 3, s.w, 6); K.glow(ctx, s.x + s.w / 2, sy, 120, '#ff6b5e', 0.15 * eyeOpen); }
    });
    trackEye(s.x + s.w - 34, s.y + 36, 24, smooth((t - tAcr) / 0.5), 0, 0.8);
    // viewer in an armchair (right), facing the TV
    K.shadow(ctx, 760, 1030, 300, 0.35);
    rr(640, 870, 240, 150, 40, '#5a4a86'); rr(620, 820, 60, 200, 30, '#4a3d72'); rr(850, 820, 60, 200, 30, '#4a3d72');
    const tgt = smooth((t - tTarget) / 0.4);
    K.drawPerson(ctx, 765, 1024, 1.15, { t, pose: 'sit', seat: false, mood: tgt > 0.5 ? 'shocked' : 'neutral', skin: 3, hair: 0, hairStyle: 'long', shirt: 2, flip: true, look: -0.8, seed: 8 });
    rr(645, 935, 230, 70, 26, '#6a5a98');
    // viewing-data box (top right)
    const bx = 760, by = 560, bp = pop(tShot - 0.6, 0.45);
    if (bp > 0) {
      ctx.save(); ctx.translate(bx, by); ctx.scale(bp, bp);
      rr(-120, -70, 240, 140, 22, 'rgba(10,12,22,0.9)');
      ctx.lineWidth = 3; ctx.strokeStyle = rgba('#ff6b5e', 0.6); roundRect(ctx, -120, -70, 240, 140, 22); ctx.stroke();
      // stacked records
      for (let i = 0; i < 3; i++) rr(-90, -40 + i * 22, 180, 12, 6, rgba('#ffffff', 0.25 + 0.15 * i));
      text(P.box || 'Viewing data', 0, 58, 26, '#ffffff', 'bold');
      ctx.restore();
    }
    // chips flying out of the TV into the box
    const chip = (tt, label, kind, i) => {
      const u = clamp((t - tt) / 1.0);
      if (u <= 0) return;
      const x0 = s.x + s.w * 0.7, y0 = s.y + s.h * 0.4, x1 = bx - 60 + i * 60, y1 = by + 10;
      const e = easeInOutCubic(u), x = lerp(x0, x1, e), y = lerp(y0, y1, e) - Math.sin(u * Math.PI) * 120;
      // landed chips sit in a row below the box
      const lx = 640 + i * 120, ly = 720;
      const fx = u >= 1 ? lx : x, fy = u >= 1 ? ly : y;
      ctx.save(); ctx.translate(fx, fy); const sc = u >= 1 ? 1 : 0.6 + 0.4 * e; ctx.scale(sc, sc);
      rr(-52, -36, 104, 72, 14, '#f2f4fa');
      ctx.strokeStyle = '#1a1420'; ctx.fillStyle = '#1a1420'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      if (kind === 'shot') { ctx.strokeRect(-26, -20, 52, 34); circ(14, -10, 5, '#ff6b5e'); ctx.beginPath(); ctx.moveTo(-26, 14); ctx.lineTo(-8, -4); ctx.lineTo(6, 8); ctx.lineTo(26, -6); ctx.stroke(); }
      else if (kind === 'audio') { for (let k = 0; k < 7; k++) { const h = 8 + 26 * Math.abs(Math.sin(k * 1.3 + t * 5)); rr(-32 + k * 10, -h / 2, 6, h, 3, '#1a1420'); } }
      else { for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(0, 4, 8 + k * 6, 10 + k * 7, 0, Math.PI * 1.05, Math.PI * 1.95 + (k % 2) * 0.6); ctx.stroke(); } }
      ctx.restore();
      if (u >= 1) { const lp = pop(tt + 1.0, 0.3); if (lp > 0) K.drawLabel(ctx, lx, ly + 72, lp, { text: label, size: 24 }); }
    };
    chip(tShot, CH[0], 'shot', 0);
    chip(tAudio, CH[1], 'audio', 1);
    chip(tFp, CH[2], 'fp', 2);
    // ACR pill
    pill(tAcr, 487, 480, P.acr || 'Automatic content recognition', { accent: true, size: 30 });
    pill(tEvery, 300, 900 + 18, P.every || 'Every show', { size: 28, dot: true });
    // target ads at the viewer
    if (tgt > 0) {
      const cx = 765, cy = 850, r = 70 + 30 * (1 - tgt);
      ctx.save(); ctx.globalAlpha = tgt; ctx.strokeStyle = '#ff6b5e'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(cx, cy, r * 0.5, 0, TAU); ctx.stroke();
      for (const a of [0, 1, 2, 3]) { const ang = a * Math.PI / 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(ang) * r * 0.75, cy + Math.sin(ang) * r * 0.75); ctx.lineTo(cx + Math.cos(ang) * r * 1.25, cy + Math.sin(ang) * r * 1.25); ctx.stroke(); }
      ctx.restore();
      for (let i = 0; i < 3; i++) {
        const u = clamp((t - tTarget - 0.2 - i * 0.18) / 0.6), e = easeOutCubic(u);
        if (u <= 0) continue;
        const x = lerp(bx, [585, 585, 480][i], e), y = lerp(by + 60, [800, 900, 850][i], e);
        ctx.save(); ctx.translate(x, y); ctx.rotate((i - 1) * 0.15); rr(-44, -28, 88, 56, 8, AD_COLS[i + 1]); rr(-36, -20, 34, 20, 4, '#ffe14a'); text('AD', -19, -4, 16, '#1a1420', 'ui'); ctx.restore();
      }
      pill(tTarget + 0.4, 487, 1010, P.target || 'Used to target ads', { accent: true, size: 28 });
    }
  } else if (mode === 'switch') {
    const tProj = at(P.projectCue, D * 0.1), tApps = at(P.appsCue, D * 0.27), tHdmi = at(P.hdmiCue, D * 0.34), tElse = at(P.elseCue, D * 0.47), tTc = at(P.cutCue, D * 0.59), tSpread = at(P.spreadCue, D * 0.73), tCould = at(P.couldCue, D * 0.8);
    const cut = tTc - 0.3, cf = smooth((t - cut) / 0.6);
    // part A: living room, eye switched off, plain home
    if (cf < 1) {
      ctx.save();
      K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: cut, zoom: 1.03, x: 500, y: 725 }]);
      const off = smooth((t - tProj - 0.3) / 0.6);
      const s = livingRoom({ tiles: () => 1, home: 1, eye: 1, eyeOff: off, lit: { apps: smooth((t - tApps) / 0.3), hdmi: smooth((t - tHdmi) / 0.3) },
        robot: { x: 820, show: 1, state: t < tProj + 1 ? 'working' : 'happy', open: 1 }, person: { pose: 'stand', mood: 'happy' } });
      // robot zap to the eye
      if (t > tProj - 0.4 && t < tProj + 0.6) { ctx.save(); ctx.strokeStyle = rgba(ACC, 0.9); ctx.lineWidth = 5; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 60; ctx.beginPath(); ctx.moveTo(800, 830); ctx.quadraticCurveTo(900, 560, s.x + s.w - 40, s.y + 40); ctx.stroke(); ctx.restore(); }
      pill(tProj, 190, 520, P.project || 'Project name', { accent: true, size: 30 });
      pill(tProj + 0.6, 190, 590, P.off || 'Tracking off', { size: 28, dot: true });
      // verbatim quote panel
      const qp = pop(tApps - 0.2, 0.45);
      if (qp > 0) {
        ctx.save(); ctx.translate(487, 970); ctx.scale(qp, qp);
        rr(-420, -80, 840, 120, 22, 'rgba(10,12,22,0.9)');
        rr(-420, -80, 10, 120, 5, ACC);
        const QP = P.quote || ['“Quote', ' goes', ' here.”'];
        const parts = [[QP[0], tApps], [QP[1], tHdmi], [QP[2], tElse]];
        ctx.font = H.font('bold', 32); let w = 0; parts.forEach(([p]) => { w += ctx.measureText(p).width; });
        let x = -w / 2;
        for (const [p, tt] of parts) { ctx.globalAlpha = 0.25 + 0.75 * smooth((t - tt + 0.1) / 0.3); text(p, x, -22, 32, '#ffffff', 'bold', 'left'); x += ctx.measureText(p).width; }
        ctx.globalAlpha = 1; text(P.quoteBy || 'Project, where said', 0, 22, 24, rgba('#ffffff', 0.7), 'ui');
        ctx.restore();
      }
      ctx.restore();
    }
    // part B: dusk street, houses' TVs go plain, ad tower wobbles
    if (cf > 0) {
      ctx.save(); ctx.globalAlpha = cf;
      K.camera(ctx, t, [{ t: cut, zoom: 1.06, x: 487, y: 740 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
      const city = K.world.city(ctx, { t, time: 'night', groundY: 980 });
      // ad business tower on the right
      const wob = t > tCould ? Math.sin((t - tCould) * 9) * 0.04 * Math.max(0, 1 - (t - tCould) / 1.6) : 0;
      ctx.save(); ctx.translate(770, 1000); ctx.rotate(wob); ctx.translate(-770, -1000);
      K.drawBuilding(ctx, 770, 1000, 1.05, { t, color: '#5a3d6e', floors: 8, lit: 1 - 0.5 * smooth((t - tCould) / 0.8) });
      ctx.restore();
      // falling chart on the tower
      const cp = pop(tCould, 0.4);
      if (cp > 0) K.drawChart(ctx, 770, 640, 0.75 * cp, { trend: 'down', progress: smooth((t - tCould) / 1.2) });
      pill(tTc, 770, 980, P.tower || 'TV ad business', { size: 26 });
      // three little houses with TV glow in the window
      for (let i = 0; i < 3; i++) {
        const hx = 140 + i * 175, hy = 1000, plain = smooth((t - tSpread - i * 0.35) / 0.4);
        K.shadow(ctx, hx, hy, 170, 0.3);
        rr(hx - 70, hy - 130, 140, 130, 6, '#3a4675');
        ctx.fillStyle = '#2a3058'; ctx.beginPath(); ctx.moveTo(hx - 86, hy - 126); ctx.lineTo(hx, hy - 200); ctx.lineTo(hx + 86, hy - 126); ctx.closePath(); ctx.fill();
        rr(hx - 46, hy - 104, 92, 62, 6, '#141830');
        const col = plain > 0.5 ? '#6f86e0' : AD_COLS[(i * 3 + Math.floor(t * 3)) % AD_COLS.length];
        rr(hx - 38, hy - 96, 76, 46, 4, col);
        K.glow(ctx, hx, hy - 73, 70, col, 0.3);
        if (plain > 0.5) { rr(hx - 30, hy - 88, 18, 12, 2, '#4fb3a6'); rr(hx - 8, hy - 88, 18, 12, 2, '#e8786a'); rr(hx + 14, hy - 88, 18, 12, 2, '#a08be0'); }
        rr(hx - 14, hy - 34, 28, 34, 4, '#2a2f45');
      }
      pill(tSpread, 315, 700, P.spread || 'If hacks spread...', { size: 28, dot: true });
      pill(tCould, 560, 500, P.could || 'Could disrupt TV ads', { accent: true, size: 30 });
      void city;
      ctx.restore();
    }
  } else if (mode === 'brick') {
    const tEarly = at(P.earlyCue, D * 0.03), tMist = at(P.mistakesCue, D * 0.19), tTc = at(P.sourceCue, D * 0.34), tBrick = at(P.brickCue, D * 0.51), tStuck = at(P.stuckCue, D * 0.74), tHalf = at(P.halfCue, D * 0.78);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 740 }]);
    K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true, plant: false, wall: '#232746' });
    // cabinet
    K.shadow(ctx, 487, 905, 820, 0.35);
    rr(80, 800, 820, 90, 14, '#3a2f4a'); rr(80, 800, 820, 14, 8, '#4a3d5e');
    // TV 1: bricks
    const s1 = tvFrame(95, 540, 380, 240, { off: t > tBrick + 0.3 });
    const glitch = t > tBrick - 0.2 && t < tBrick + 0.35;
    clipScreen(s1, () => {
      if (t < tBrick - 0.2) homeScreen(s1, 1, {});
      else if (glitch) { for (let i = 0; i < 8; i++) rr(s1.x, s1.y + i * s1.h / 8, s1.w, s1.h / 8, 0, AD_COLS[(i + Math.floor(t * 30)) % AD_COLS.length]); }
      else {
        ctx.fillStyle = '#05060c'; ctx.fillRect(s1.x, s1.y, s1.w, s1.h);
        const cx = s1.x + s1.w / 2, cy = s1.y + s1.h / 2, a = smooth((t - tBrick - 0.35) / 0.5);
        ctx.globalAlpha = a; ctx.strokeStyle = '#5a6080'; ctx.lineWidth = 7; ctx.lineCap = 'round';
        circ(cx - 44, cy - 20, 9, '#5a6080'); circ(cx + 44, cy - 20, 9, '#5a6080');
        ctx.beginPath(); ctx.arc(cx, cy + 52, 38, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });
    // TV 2: stuck halfway
    const s2 = tvFrame(505, 540, 380, 240);
    clipScreen(s2, () => {
      ctx.fillStyle = '#121633'; ctx.fillRect(s2.x, s2.y, s2.w, s2.h);
      const bp = Math.min(0.5, 0.5 * smooth((t - tTc) / 3.0)) + (t > tStuck ? 0 : 0);
      const bx = s2.x + 40, by = s2.y + s2.h / 2 + 10, bw = s2.w - 80;
      text('Updating...', s2.x + s2.w / 2, by - 34, 28, '#ffffff', 'bold');
      rr(bx, by, bw, 26, 13, '#2a3058'); rr(bx, by, Math.max(26, bw * bp), 26, 13, t > tStuck ? '#ffcc33' : ACC);
      text(Math.round(bp * 100) + '%', s2.x + s2.w / 2, by + 70, 28, t > tStuck && ((t * 2) % 1) < 0.5 ? '#ffcc33' : rgba('#ffffff', 0.8), 'ui');
    });
    // labels on the cabinet
    pill(0.1, 285, 870, P.tv1 || 'TV 1', { size: 26 });
    if (t < tHalf) pill(0.25, 695, 870, P.tv2 || 'TV 2', { size: 26 });
    // stamp + stuck pill
    if (t > tBrick + 0.3) K.drawStamp(ctx, 400, 800, 0.62, { kind: 'cross', text: P.stamp || 'BRICKED', land: (t - tBrick - 0.3) / 0.5 });
    pill(tHalf, 640, 870, P.stuck || 'TV 2: stuck halfway', { accent: true, size: 26 });
    // top pills
    pill(tEarly, 270, 470, P.early || "It's early", { size: 28, dot: true });
    pill(tMist, 660, 470, P.mistakes || 'Agents make mistakes', { size: 28, dot: true });
    pill(tTc, 487, 1018, P.source || 'Per news reports', { size: 24 });
    // characters in front
    K.drawPerson(ctx, 105, 1034, 0.9, { t, pose: t > tBrick + 0.3 ? 'shrug' : 'stand', mood: t > tBrick ? 'shocked' : 'worried', skin: 2, hair: 1, hairStyle: 'short', shirt: 1, look: 0.4, seed: 4 });
    K.drawRobot(ctx, 862, 1034, 0.8, { t, state: 'thinking', flip: true, seed: 5 });
    const qp = pop(tMist + 0.2, 0.4);
    if (qp > 0) K.drawSpeechBubble(ctx, 800, 820, qp, { text: '?', size: 40, tail: 'right', dark: true });
  } else if (mode === 'payoff') {
    const tDumb = at(P.tagCue, D * 0.46), tQ = at(P.qCue, D * 0.61);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.02, x: 520, y: 725 }]);
    livingRoom({ tiles: () => 1, home: 1, eye: 1, eyeOff: 1, lit: {}, robot: { x: 820, show: 1, state: 'happy', open: 1 - smooth((t - 1) / 0.6) }, person: { pose: t > tDumb ? 'cheer' : 'stand', mood: 'happy' } });
    pill(tDumb, 610, 490, P.tag || 'Dumb TV, on purpose', { accent: true, size: 30 });
    // question card
    const qp = pop(tQ - 0.1, 0.45);
    if (qp > 0) {
      ctx.save(); ctx.fillStyle = 'rgba(5,7,16,' + 0.45 * smooth((t - tQ) / 0.4) + ')'; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
      ctx.save(); ctx.translate(487, 700); ctx.scale(qp, qp);
      rr(-400, -150, 800, 300, 30, 'rgba(14,16,30,0.95)');
      ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.7); roundRect(ctx, -400, -150, 800, 300, 30); ctx.stroke();
      text(P.question1 || 'Would you let AI', 0, -62, 48, '#ffffff', 'display');
      text(P.question2 || 'hack your TV?', 0, -6, 48, ACC, 'display');
      ctx.restore();
      const a = pop(tQ + 0.5, 0.35), b = pop(tQ + 0.7, 0.35);
      if (a > 0) K.drawLabel(ctx, 330, 820, a, { text: P.a || 'Yes, strip it', size: 30, accent: true });
      if (b > 0) K.drawLabel(ctx, 650, 820, b, { text: P.b || 'Too risky', size: 30 });
    }
  }
  ctx.restore();
}
