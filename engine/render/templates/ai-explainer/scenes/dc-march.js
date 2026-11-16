// Scene "dc-march" (full frame). A peaceful street march against planned AI data centres, told in an old-town street
// of tall stone tenements at dusk (generic: crow-stepped gables, chimneys, a castle-on-a-rock silhouette far behind),
// ending at a generic modern parliament building. Marchers are kit cartoon people with plain placards (icons only:
// a lightning bolt, a crossed-out server box, blank colours) and one long banner (`banner`, a quoted neutral phrase).
// No real people, no logos, no flags. Modes:
//   hook      (cold open, ~3.4 s): the march already moving at frame 0 (street scrolls, banner raised, a data centre
//             glowing on the hill behind); a THOUSANDS-style count pill pops.
//   route     (~12 s): route strip (from -> to) draws as the crowd walks; date pill (dateCue); groups counter
//             (groupsCue); the hill data centre is ringed + labelled (targetCue).
//   pins      (~9 s): night hills; a big data-centre cutaway (racks inside) wired to a phone chat bubble (chatCue);
//             then planned-site stakes pop over the hills and a "20+" counter (countCue) + stages chip (stageCue).
//   strain    (~10 s): data centre (left) wired by pylons to a small town (right); chips pop (envCue / gridCue), the
//             cable surges, a gauge rises, town windows flicker; then a verbatim quote card (quoteCue).
//   demand    (~10 s): crowd at the parliament building, banner; a PLANS document gets a pause badge (pauseCue);
//             "national conversation" pill (convCue); "say" bubbles from the crowd (sayCue); Europe-wave chip (euroCue).
//   guidance  (span, ~19 s): a stone government building (text pill only); guidance book with a pen and a calendar
//             "before end of year" (guideCue / yearCue); public-benefit pill (benefitCue); a big data centre with a
//             "over 50 MW" badge and an assessment sheet stamped REQUIRED (mwCue / eiaCue); then the open question
//             (unknownCue): book shows "?" and two "not known yet" chips. Ends settled.
// Cues are narration words ("word#n" = nth+1 time in the scene) or seconds; fallbacks are fractions of the scene.
// Fits: protests / local opposition to data centres, power plants, any big facility; planning-rules responses.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, rgba, mixHex, easeOutCubic } = H;
  const TAU = Math.PI * 2;
  const cue = (v, frac) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v) { const [w, n] = v.split('#'); const s = info.timeOf(w, n ? parseInt(n, 10) : 0); if (s != null) return s; }
    return D * frac;
  };
  const mode = P.mode || 'hook';
  const GY = 1010;
  const banner = P.banner || 'NATIONAL CONVERSATION';
  const pill = (c, x, y, k, o) => { if (k > 0.2) K.drawLabel(c, x, y, k, o); };

  // ---------------------------------------------------------------- shared drawing
  const sky = (night) => {
    const g = ctx.createLinearGradient(0, 0, 0, GY);
    if (night) { g.addColorStop(0, '#070a1c'); g.addColorStop(1, '#1d2452'); }
    else { g.addColorStop(0, '#1b1d45'); g.addColorStop(0.55, '#4b3f78'); g.addColorStop(1, '#c9785f'); }
    ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, GY + 200);
    for (let i = 0; i < 46; i++) {
      const x = H.hash(i, 3) * 1080, y = 80 + H.hash(i, 4) * (night ? 760 : 420);
      ctx.fillStyle = `rgba(255,255,255,${(night ? 0.35 : 0.18) * (0.5 + 0.5 * Math.abs(Math.sin(t * 1.1 + i)))})`;
      ctx.fillRect(x, y, 3, 3);
    }
  };
  const ground = (col) => {
    const g = ctx.createLinearGradient(0, GY, 0, 1920);
    g.addColorStop(0, col || '#3a3550'); g.addColorStop(0.25, '#1d1b2c'); g.addColorStop(1, '#0c0b14');
    ctx.fillStyle = g; ctx.fillRect(-200, GY, 1480, 1100);
    ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(-200, GY, 1480, 6);
  };
  // castle-on-a-rock silhouette (generic)
  const castle = (x, y, s) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = '#2a2547';
    ctx.beginPath(); ctx.moveTo(-260, 0); ctx.quadraticCurveTo(-200, -120, -90, -150); ctx.lineTo(120, -160); ctx.quadraticCurveTo(220, -120, 260, 0); ctx.closePath(); ctx.fill();
    ctx.fillRect(-110, -250, 220, 100);
    for (let i = 0; i < 6; i++) ctx.fillRect(-110 + i * 40, -272, 22, 24);
    ctx.fillRect(-40, -320, 60, 80); for (let i = 0; i < 3; i++) ctx.fillRect(-40 + i * 22, -338, 14, 20);
    ctx.fillStyle = 'rgba(255,214,140,0.5)'; for (let i = 0; i < 4; i++) ctx.fillRect(-90 + i * 52, -215, 12, 18);
    ctx.restore();
  };
  // one tenement (bottom-left anchored at x, GY), width w, floors n, colour col
  const tenement = (x, w, n, col, seed, night) => {
    const fh = 62, h = n * fh + 30, top = GY - h;
    const shade = mixHex(col, '#000000', 0.3), light = mixHex(col, '#ffffff', 0.12);
    ctx.fillStyle = col; ctx.fillRect(x, top, w, h);
    ctx.fillStyle = shade; ctx.fillRect(x + w - 14, top, 14, h);
    // crow-stepped gable
    const steps = 4, sw = w / (steps * 2 + 1);
    ctx.fillStyle = col;
    for (let i = 0; i < steps; i++) ctx.fillRect(x + sw * (i + 1), top - (i + 1) * 26, w - 2 * sw * (i + 1), 27);
    ctx.fillStyle = light; ctx.fillRect(x, top, w, 6);
    // chimneys
    ctx.fillStyle = shade; ctx.fillRect(x + w * 0.22, top - 60, 26, 60); ctx.fillRect(x + w * 0.66, top - 50, 26, 50);
    // windows
    const cols = Math.max(2, Math.floor((w - 30) / 58));
    for (let r = 0; r < n; r++) for (let c = 0; c < cols; c++) {
      const wx = x + 22 + c * ((w - 44) / cols) + 6, wy = top + 30 + r * fh;
      const on = H.hash(seed * 31 + r * 7 + c, 9) > (night ? 0.35 : 0.55);
      roundRect(ctx, wx, wy, 30, 42, 4);
      ctx.fillStyle = on ? rgba('#ffd98a', night ? 0.9 : 0.75) : '#1c1a30'; ctx.fill();
    }
    // shop front on the ground floor
    ctx.fillStyle = shade; ctx.fillRect(x + 12, GY - 60, w - 24, 60);
  };
  const TEN_COLS = ['#5d5370', '#6a5a62', '#4f5470', '#6d6278', '#5a4d5e'];
  const street = (scroll, night) => {
    const span = 1500, wsum = [180, 200, 170, 210, 190, 180, 200, 170];
    let x0 = -((scroll % span) + span) % span;
    for (let rep = 0; rep < 3; rep++) {
      let x = x0 + rep * span;
      wsum.forEach((w, i) => {
        if (x < 1300 && x + w > -220) tenement(x, w, 3 + (i % 2), TEN_COLS[i % 5], i, night);
        x += w + 8;
      });
    }
  };
  // a data centre on a distant hill, at screen x, with glow
  const hillDC = (x, y, s, act) => {
    ctx.save(); ctx.fillStyle = '#26203f';
    ctx.beginPath(); ctx.ellipse(x, y + 30, 330 * s, 90 * s, 0, Math.PI, 0); ctx.fill(); ctx.restore();
    K.drawDataCenter(ctx, x, y + 6, s, { t, activity: act, shadow: false });
  };
  // marcher with a placard
  const SIGN_COLS = ['#f2f4fa', '#ffd2a8', '#c9e8ff', '#e8d6ff'];
  const placard = (x, feet, s, i, kind, raise) => {
    ctx.save(); ctx.translate(x, feet); ctx.scale(s, s);
    const by = lerp(-170, -268, raise) + Math.sin(t * 3 + i * 1.7) * 5;
    ctx.lineCap = 'round'; ctx.strokeStyle = '#8a6a4a'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(14, by); ctx.lineTo(14, by + 100); ctx.stroke();
    ctx.save(); ctx.translate(14, by - 40); ctx.rotate(Math.sin(t * 2 + i) * 0.04);
    roundRect(ctx, -62, -44, 124, 88, 10); ctx.fillStyle = SIGN_COLS[i % 4]; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(20,24,40,0.25)'; ctx.stroke();
    ctx.fillStyle = '#20243a'; ctx.strokeStyle = '#20243a';
    if (kind === 'bolt') {
      ctx.beginPath(); ctx.moveTo(8, -32); ctx.lineTo(-16, 4); ctx.lineTo(0, 4); ctx.lineTo(-8, 32); ctx.lineTo(18, -6); ctx.lineTo(2, -6); ctx.closePath(); ctx.fill();
    } else if (kind === 'nodc') {
      roundRect(ctx, -26, -26, 52, 52, 6); ctx.lineWidth = 5; ctx.stroke();
      for (let k = 0; k < 3; k++) ctx.fillRect(-16, -16 + k * 14, 32, 6);
      ctx.strokeStyle = '#d64b3f'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, 36, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-25, -25); ctx.lineTo(25, 25); ctx.stroke();
    } else if (kind === 'tree') {
      ctx.fillRect(-4, 6, 8, 26); ctx.beginPath(); ctx.arc(0, -6, 22, 0, TAU); ctx.fillStyle = '#2f8f5a'; ctx.fill();
    } else if (kind === 'q') {
      ctx.font = H.font('display', 56); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 4);
    }
    ctx.restore(); ctx.restore();
  };
  const PEOPLE = [
    { skin: 2, hair: 0, hs: 'curly', shirt: 2 }, { skin: 0, hair: 2, hs: 'long', shirt: 3 }, { skin: 4, hair: 0, hs: 'short', shirt: 1 },
    { skin: 1, hair: 3, hs: 'bun', shirt: 0 }, { skin: 3, hair: 1, hs: 'short', shirt: 4 }, { skin: 1, hair: 4, hs: 'long', shirt: 2 },
    { skin: 0, hair: 1, hs: 'none', shirt: 3 }, { skin: 2, hair: 2, hs: 'bun', shirt: 4 }, { skin: 4, hair: 3, hs: 'curly', shirt: 0 },
  ];
  const KINDS = ['bolt', null, 'nodc', 'tree', null, 'q', 'bolt', 'nodc', null];
  // crowd: back row (small, dark) + front row; banner across two front marchers. walking = true -> walk cycle
  const crowd = (cx, feet, s, opts = {}) => {
    const walking = opts.walking !== false, raise = opts.raise == null ? 1 : opts.raise;
    const bannerOn = opts.banner !== false;
    // back row silhouettes (density = "thousands" feel)
    for (let i = 0; i < 16; i++) {
      const x = cx - 470 + i * 62 + (H.hash(i, 21) - 0.5) * 20, b = walking ? Math.abs(Math.sin(t * 5.6 + i)) * 5 : Math.sin(t * 2 + i) * 2;
      ctx.fillStyle = mixHex('#2a2540', '#3b3456', H.hash(i, 22));
      ctx.beginPath(); ctx.arc(x, feet - 150 * s - b, 26 * s, 0, TAU); ctx.fill();
      roundRect(ctx, x - 30 * s, feet - 128 * s - b, 60 * s, 100 * s, 18 * s); ctx.fill();
      if (i % 3 === 1) { // small far placards
        const py = feet - 230 * s - b + Math.sin(t * 2.6 + i) * 3;
        ctx.fillStyle = '#8a6a4a'; ctx.fillRect(x - 2, py + 30, 4, 50 * s);
        roundRect(ctx, x - 34 * s, py - 10, 68 * s, 46 * s, 6); ctx.fillStyle = rgba(SIGN_COLS[i % 4], 0.55); ctx.fill();
      }
    }
    // front row
    const xs = [-380, -270, -150, -30, 90, 210, 330];
    xs.forEach((dx, i) => {
      const p = PEOPLE[i], x = cx + dx, f = feet + 28 + (i % 2) * 8;
      K.drawPerson(ctx, x, f, s, { t, pose: 'stand', walk: walking ? t + i * 0.13 : null, mood: opts.mood || 'neutral', skin: p.skin, hair: p.hair, hairStyle: p.hs, shirt: p.shirt, seed: i * 5 + 1 });
      const isBanner = bannerOn && (i === 2 || i === 4);
      if (!isBanner && KINDS[i] !== undefined) placard(x, f, s, i, KINDS[i], raise);
    });
    if (bannerOn) {
      const xa = cx - 150 + 14, xb = cx + 90 + 14, f = feet + 28;
      const top = f - lerp(200, 330, raise) * s, hgt = 92;
      ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = '#8a6a4a'; ctx.lineWidth = 8;
      [xa, xb].forEach((bx) => { ctx.beginPath(); ctx.moveTo(bx, top - 10); ctx.lineTo(bx, f - 120 * s); ctx.stroke(); });
      // cloth with a gentle wave
      const L = xa - 6, R = xb + 6, wv = (u) => Math.sin(t * 3 + u * 6) * 5;
      ctx.beginPath(); ctx.moveTo(L, top + wv(0));
      for (let u = 0; u <= 1.0001; u += 0.1) ctx.lineTo(lerp(L, R, u), top + wv(u));
      for (let u = 1; u >= -0.0001; u -= 0.1) ctx.lineTo(lerp(L, R, u), top + hgt + wv(u));
      ctx.closePath(); ctx.fillStyle = '#f4f1e8'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
      const words = banner.split(' '), half = Math.ceil(words.length / 2);
      const lines = words.length > 1 ? [words.slice(0, half).join(' '), words.slice(half).join(' ')] : [banner];
      let fs = 34; ctx.font = H.font('display', fs);
      while (fs > 18 && Math.max(...lines.map((l) => ctx.measureText(l).width)) > R - L - 24) { fs -= 2; ctx.font = H.font('display', fs); }
      ctx.fillStyle = '#1a1d30'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      lines.forEach((l, j) => ctx.fillText(l, (L + R) / 2, top + hgt / 2 + wv(0.5) + (j - (lines.length - 1) / 2) * fs * 1.05));
      ctx.restore();
    }
  };
  // generic modern parliament: low building with leaf-shaped roofs and slanted window frames
  const parliament = (x, y, s, lab) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 560);
    ctx.fillStyle = '#4b4f6e'; roundRect(ctx, -270, -170, 540, 170, 10); ctx.fill();
    ctx.fillStyle = '#3a3d58'; ctx.fillRect(130, -170, 140, 170);
    // leaf roofs
    for (let i = 0; i < 4; i++) {
      const rx = -210 + i * 140;
      ctx.beginPath(); ctx.ellipse(rx, -178, 86, 26, -0.25 + i * 0.12, 0, TAU); ctx.fillStyle = i % 2 ? '#8b93b8' : '#a3aacb'; ctx.fill();
    }
    // slanted window frames (the generic "pole" pattern)
    for (let i = 0; i < 9; i++) {
      const wx = -240 + i * 56;
      roundRect(ctx, wx, -130, 40, 70, 5); ctx.fillStyle = rgba('#ffd98a', 0.5 + 0.3 * H.hash(i, 5)); ctx.fill();
      ctx.strokeStyle = '#2a2d44'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(wx + 4, -132); ctx.lineTo(wx + 34, -58); ctx.moveTo(wx + 34, -132); ctx.lineTo(wx + 4, -58); ctx.stroke();
    }
    ctx.fillStyle = '#2a2d44'; roundRect(ctx, -50, -50, 100, 50, 6); ctx.fill();
    ctx.restore();
    if (lab) K.drawLabel(ctx, x, y - 230 * s, 1, { text: lab, size: 26 });
  };
  // dark rounded card in screen space
  const card = (x, y, w, h, a, border) => {
    ctx.save(); ctx.globalAlpha *= a;
    roundRect(ctx, x, y, w, h, 26); ctx.fillStyle = 'rgba(10,12,24,0.92)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(border || ACC, 0.75); ctx.stroke();
    ctx.restore();
  };
  const popAt = (x, y, k, fn) => { if (k <= 0) return; ctx.save(); ctx.translate(x, y); const s = Math.min(1.06, k); ctx.scale(s, s); ctx.translate(-x, -y); fn(); ctx.restore(); };
  const counter = (x, y, value, tStart, prefix, suffix, cap, sub) => {
    const k = K.popIn(t, tStart - 0.15, 0.4);
    popAt(x, y, k, () => {
      card(x - 300, y - 95, 600, 190, 1);
      const n = Math.round(value * easeOutCubic(clamp((t - tStart) / 0.9)));
      const done = t > tStart + 0.9;
      ctx.font = H.font('condensed', 118); ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = ACC;
      ctx.fillText((prefix || '') + n + (done ? suffix : ''), x - 20, y + 50);
      ctx.textAlign = 'left'; ctx.fillStyle = '#ffffff';
      const lines = cap.split('|'); let cs = 36; ctx.font = H.font('bold', cs);
      while (cs > 22 && Math.max(...lines.map((l) => ctx.measureText(l).width)) > 260) { cs -= 2; ctx.font = H.font('bold', cs); }
      lines.forEach((l, j) => ctx.fillText(l, x + 4, y - 4 + j * (cs + 6) - (lines.length - 1) * 8));
      if (sub) { ctx.font = H.font('ui', 24); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText(sub, x + 4, y + 66); }
    });
  };
  const pylon = (x, y, s) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = '#6b7396'; ctx.lineWidth = 6; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-8, -260); ctx.lineTo(8, -260); ctx.lineTo(40, 0);
    ctx.moveTo(-60, -200); ctx.lineTo(60, -200); ctx.moveTo(-46, -150); ctx.lineTo(46, -150);
    ctx.moveTo(-30, -60); ctx.lineTo(24, -140); ctx.moveTo(30, -60); ctx.lineTo(-24, -140); ctx.stroke();
    ctx.restore();
  };
  const house = (x, y, s, i, lit) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const col = ['#7a6a8c', '#6a7a9c', '#8c7a6a', '#6a8c86'][i % 4];
    ctx.fillStyle = col; ctx.fillRect(-60, -110, 120, 110);
    ctx.beginPath(); ctx.moveTo(-74, -108); ctx.lineTo(0, -170); ctx.lineTo(74, -108); ctx.closePath(); ctx.fillStyle = mixHex(col, '#000000', 0.35); ctx.fill();
    ctx.fillStyle = mixHex(col, '#000000', 0.4); ctx.fillRect(28, -160, 18, 34);
    for (const wx of [-40, 12]) { roundRect(ctx, wx, -86, 30, 34, 4); ctx.fillStyle = rgba('#ffd98a', lit); ctx.fill(); }
    ctx.fillStyle = '#2a2540'; roundRect(ctx, -12, -46, 24, 46, 4); ctx.fill();
    ctx.restore();
  };

  ctx.save();
  // ================================================================ HOOK
  if (mode === 'hook') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 470, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 735 }]);
    sky(false);
    castle(150, 720, 0.7);
    hillDC(740, 700, 0.95, 0.8 + 0.2 * Math.sin(t * 4));
    K.glow(ctx, 740, 620, 260, ACC, 0.18 + 0.06 * Math.sin(t * 3));
    street(-t * 70 + 600, false);
    ground();
    crowd(487, 1000, 1.05, { walking: true, raise: 0.85 + 0.15 * K.phase(t, 0.1, 0.7, H.easeOutBack), mood: 'neutral' });
    const k = K.popIn(t, 0.9, 0.4);
    if (k > 0) pill(ctx, 260, 560, k, { text: P.count || 'THOUSANDS', size: 30, accent: true });
    const k2 = K.popIn(t, 1.5, 0.4);
    if (k2 > 0) pill(ctx, 740, 515, k2, { text: P.dcLabel || 'AI data centres', size: 26, dot: true });
  }

  // ================================================================ ROUTE
  else if (mode === 'route') {
    const tDate = cue(P.dateCue || 'Saturday', 0.1), tFrom = cue(P.fromCue || 'top', 0.2), tTo = cue(P.toCue || 'Parliament', 0.4);
    const tGroups = cue(P.groupsCue || 'eighty', 0.55), tTarget = cue(P.targetCue || 'data', 0.85);
    // camera: wide street; settles; small push toward the hill data centre at the target
    const pushK = K.phase(t, tTarget - 1.2, tTarget + 0.3);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.0, x: 487, y: 735 }]);
    ctx.save(); ctx.translate(487, 725); ctx.scale(1 + 0.04 * pushK, 1 + 0.04 * pushK); ctx.translate(-487, -725);
    sky(false);
    castle(140, 730, 0.65);
    const dcAct = 0.5 + 0.5 * K.phase(t, tTarget - 0.8, tTarget + 0.4);
    hillDC(790, 660, 0.9, dcAct);
    if (t > tTarget - 0.8) K.glow(ctx, 790, 580, 300, ACC, 0.25 * K.phase(t, tTarget - 0.8, tTarget + 0.4));
    street(-t * 55, false);
    ground();
    crowd(470, 1000, 1.0, { walking: true, raise: 1 });
    ctx.restore();

    // route strip (top of the stage)
    const rk = K.popIn(t, tFrom - 0.4, 0.4) * K.fadeOut(t, tTarget - 0.5, 0.35);
    popAt(487, 500, rk, () => {
      card(80, 438, 815, 128, 1);
      const x0 = 130, x1 = 845, y = 485;
      const prog = K.phase(t, tFrom, tTo + 0.6);
      ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 6; ctx.setLineDash([4, 14]); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); ctx.setLineDash([]);
      ctx.strokeStyle = ACC; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, prog), y); ctx.stroke(); ctx.restore();
      ctx.beginPath(); ctx.arc(x0, y, 13, 0, TAU); ctx.fillStyle = ACC; ctx.fill();
      ctx.beginPath(); ctx.arc(x1, y, 13, 0, TAU); ctx.fillStyle = prog >= 1 ? ACC : 'rgba(255,255,255,0.35)'; ctx.fill();
      // walking dot
      ctx.beginPath(); ctx.arc(lerp(x0, x1, prog), y, 9, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.font = H.font('ui', 26); ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left'; ctx.fillText(P.from || 'Top of the Royal Mile', x0 - 14, y + 56);
      ctx.globalAlpha *= clamp((t - tTo + 0.6) / 0.4); ctx.textAlign = 'right'; ctx.fillText(P.to || 'Scottish Parliament', x1 + 14, y + 56);
    });
    // date pill
    const dk = K.popIn(t, tDate - 0.1, 0.35);
    if (dk > 0 && t < tGroups - 0.3) pill(ctx, 487, 640, dk * K.fadeOut(t, tGroups - 0.6, 0.3), { text: P.date || 'Saturday, 14 November', size: 28, accent: true });
    // groups counter replaces the date
    if (t > tGroups - 0.4 && t < tTarget - 0.3) {
      ctx.save(); ctx.globalAlpha = K.fadeOut(t, tTarget - 0.7, 0.4);
      counter(487, 690, P.groups || 80, tGroups, '', '+', P.groupsLabel || 'groups|backed it');
      ctx.restore();
    }
    // target ring around the data centre
    if (t > tTarget - 0.3) {
      const k = K.phase(t, tTarget - 0.3, tTarget + 0.4, easeOutCubic);
      ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 7; ctx.setLineDash([18, 12]); ctx.lineDashOffset = -t * 40;
      ctx.beginPath(); ctx.ellipse(790, 590, 200 * k, 110 * k, 0, 0, TAU); ctx.stroke(); ctx.restore();
      const lk = K.popIn(t, tTarget, 0.4);
      if (lk > 0) pill(ctx, 330, 560, lk, { text: P.target || 'Giant AI data centres', size: 30, accent: true });
    }
  }

  // ================================================================ PINS
  else if (mode === 'pins') {
    const tChat = cue(P.chatCue || 'answer', 0.35), tCount = cue(P.countCue || 'twenty', 0.65), tStage = cue(P.stageCue || 'stages', 0.85);
    const pull = K.phase(t, tCount - 1.4, tCount + 0.2);
    sky(true);
    // rolling hills (3 layers)
    const hills = (yb, amp, col, ph) => {
      ctx.beginPath(); ctx.moveTo(-200, GY + 40);
      for (let x = -200; x <= 1280; x += 20) ctx.lineTo(x, yb - amp * (0.5 + 0.5 * Math.sin(x / 170 + ph)) - amp * 0.4 * Math.sin(x / 61 + ph * 2));
      ctx.lineTo(1280, GY + 40); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    };
    ctx.save();
    const z = lerp(1.25, 1.0, pull); ctx.translate(487, 760); ctx.scale(z, z); ctx.translate(-lerp(470, 487, pull), -lerp(820, 740, pull));
    hills(760, 90, '#1c2148', 0.4); hills(860, 80, '#202a52', 2.1); hills(980, 60, '#253360', 4.0);
    ground('#253360');
    // planned-site stakes across the hills (pop on tCount)
    const SITES = [[150, 742], [300, 700], [445, 735], [600, 690], [760, 720], [880, 700], [210, 840], [380, 826], [540, 850],
      [700, 815], [850, 838], [120, 940], [280, 950], [470, 925], [640, 955], [800, 935], [930, 905], [90, 800], [970, 780], [345, 905], [560, 790]];
    SITES.forEach(([sx, sy], i) => {
      const k = K.popIn(t, tCount - 0.2 + i * 0.045, 0.35);
      if (k <= 0) return;
      ctx.save(); ctx.translate(sx, sy); ctx.scale(k * 0.9, k * 0.9);
      ctx.strokeStyle = rgba(ACC, 0.9); ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
      roundRect(ctx, -38, -36, 76, 36, 4); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#c9a36a'; ctx.fillRect(-3, -86, 6, 52);
      roundRect(ctx, -26, -110, 52, 30, 5); ctx.fillStyle = ACC; ctx.fill();
      ctx.fillStyle = '#1a1d30'; for (let k2 = 0; k2 < 3; k2++) ctx.fillRect(-16, -104 + k2 * 8, 32, 4);
      ctx.restore();
    });
    ctx.restore();
    // the big cutaway data centre (fades as we pull back)
    const big = 1 - K.phase(t, tCount - 1.2, tCount - 0.2);
    if (big > 0) {
      ctx.save(); ctx.globalAlpha = big;
      const bx = 360, by = 1000;
      K.shadow(ctx, bx, by, 520);
      roundRect(ctx, bx - 230, by - 300, 460, 300, 14); ctx.fillStyle = '#4a5390'; ctx.fill();
      roundRect(ctx, bx - 212, by - 270, 424, 250, 10); ctx.fillStyle = '#121633'; ctx.fill();
      for (let r = 0; r < 4; r++) K.drawServerRack(ctx, bx - 156 + r * 104, by - 24, 0.95, { t: t + r, activity: 0.9 });
      roundRect(ctx, bx - 242, by - 318, 484, 26, 8); ctx.fillStyle = '#4c5590'; ctx.fill();
      pill(ctx, bx, by - 340, K.popIn(t, 0.15, 0.4), { text: P.dc || 'Data centre', size: 28, dot: true });
      // phone + chat bubble wired in
      const pk = K.popIn(t, tChat - 0.3, 0.4);
      if (pk > 0) {
        const px = 770, py = 1000;
        const pts = K.bezier(bx + 200, by - 300, bx + 300, 560, px - 120, 560, px, py - 250, 40);
        ctx.save(); ctx.strokeStyle = rgba(ACC, 0.6); ctx.lineWidth = 5; ctx.setLineDash([3, 14]); ctx.lineCap = 'round';
        K.pathDraw(ctx, pts, K.phase(t, tChat - 0.3, tChat + 0.5)); ctx.restore();
        for (let j = 0; j < 4; j++) {
          const u = ((t - tChat) * 0.8 + j / 4) % 1;
          if (t > tChat) { const [qx, qy] = K.pathPoint(pts, 1 - u); K.glow(ctx, qx, qy, 26, ACC, 0.9); }
        }
        popAt(px, py, pk, () => { K.drawPhone(ctx, px, py, 1.05, { t, bubbles: 3, every: 0.9, screen: 'chat' }); });
        if (t > tChat + 0.2) K.drawSpeechBubble(ctx, px - 20, py - 270, 1, { text: P.bubble || 'Hi! How can I help?', size: 26, maxW: 260, tail: 'center', pop: K.popIn(t, tChat + 0.2, 0.35) });
      }
      ctx.restore();
    }
    if (t > tCount - 0.3) counter(487, 520, P.count || 20, tCount, '', '+', P.countLabel || 'proposals|in Scotland');
    const sk = K.popIn(t, tStage - 0.2, 0.35);
    if (sk > 0) pill(ctx, 487, 680, sk, { text: P.stage || 'At different stages of planning', size: 27 });
  }

  // ================================================================ STRAIN
  else if (mode === 'strain') {
    const tEnv = cue(P.envCue || 'environment', 0.25), tGrid = cue(P.gridCue || 'strain', 0.4), tQuote = cue(P.quoteCue || 'question', 0.65);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.04, x: 487, y: 745 }]);
    sky(false);
    ground('#2e2f4a');
    // data centre left, town right, pylons between
    const surge = K.phase(t, tGrid - 0.2, tGrid + 0.8);
    K.drawDataCenter(ctx, 260, 990, 0.85, { t, activity: 0.6 + 0.4 * surge });
    pylon(470, 990, 0.95); pylon(640, 990, 0.85);
    // cable
    const cable = [[330, 850], [470, 745], [640, 775], [860, 870]];
    ctx.save(); ctx.strokeStyle = '#9aa3c8'; ctx.lineWidth = 4; ctx.beginPath();
    for (let i = 0; i < cable.length - 1; i++) { const [a, b] = cable[i], [c, d] = cable[i + 1]; ctx.moveTo(a, b); ctx.quadraticCurveTo((a + c) / 2, Math.max(b, d) + 34, c, d); }
    ctx.stroke(); ctx.restore();
    // pulses flowing from the town side to the data centre
    if (surge > 0) for (let j = 0; j < 6; j++) {
      const u = ((t * (0.5 + surge * 0.7)) + j / 6) % 1, seg = Math.min(2, Math.floor((1 - u) * 3)), lu = ((1 - u) * 3) - seg;
      const [a, b] = cable[seg], [c, d] = cable[seg + 1], my = Math.max(b, d) + 34;
      const x = (1 - lu) * (1 - lu) * a + 2 * (1 - lu) * lu * ((a + c) / 2) + lu * lu * c, y = (1 - lu) * (1 - lu) * b + 2 * (1 - lu) * lu * my + lu * lu * d;
      K.glow(ctx, x, y, 22, ACC, 0.9 * surge);
    }
    // town
    const flick = (i) => surge > 0 ? 0.85 - 0.55 * surge * (0.5 + 0.5 * Math.sin(t * 11 + i * 2.3)) : 0.85;
    [[760, 1000, 0.8], [880, 990, 0.9], [820, 1030, 0.7]].forEach(([x, y, s], i) => house(x, y, s, i, flick(i)));
    // worried resident
    K.drawPerson(ctx, 660, 1040, 0.95, { t, pose: t > tQuote ? 'shrug' : 'stand', mood: t > tGrid ? 'worried' : 'neutral', skin: 3, hair: 1, hairStyle: 'short', shirt: 4, seed: 9, flip: true, look: -0.5 });
    // chips
    const ek = K.popIn(t, tEnv - 0.1, 0.35);
    if (ek > 0) pill(ctx, 300, 580, ek * K.fadeOut(t, tQuote - 0.4, 0.3), { text: P.env || 'Environment', size: 28, dot: true });
    const gk = K.popIn(t, tGrid - 0.1, 0.35);
    if (gk > 0) pill(ctx, 640, 580, gk * K.fadeOut(t, tQuote - 0.4, 0.3), { text: P.grid || 'Electricity supply', size: 28, accent: true });
    // grid gauge over the town
    if (t > tGrid - 0.2 && t < tQuote) {
      const a = K.fadeIn(t, tGrid - 0.2, 0.3) * K.fadeOut(t, tQuote - 0.4, 0.3), v = 0.25 + 0.65 * surge;
      ctx.save(); ctx.globalAlpha = a; const gx = 820, gy = 720;
      ctx.lineWidth = 18; ctx.lineCap = 'round';
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.beginPath(); ctx.arc(gx, gy, 70, Math.PI, TAU); ctx.stroke();
      ctx.strokeStyle = mixHex('#57e38a', '#ff5f57', v); ctx.beginPath(); ctx.arc(gx, gy, 70, Math.PI, Math.PI + Math.PI * v); ctx.stroke();
      const ang = Math.PI + Math.PI * v + Math.sin(t * 14) * 0.03 * surge;
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(ang) * 58, gy + Math.sin(ang) * 58); ctx.stroke();
      ctx.restore();
    }
    // quote card (verbatim, attributed by role)
    const qk = K.popIn(t, tQuote - 0.1, 0.45);
    popAt(487, 560, qk, () => {
      const q = P.quote || '“Who are going to be made to pay those costs?”';
      const lines = H.wrap(ctx, q, 'display', 44, 700);
      const h = 60 + lines.length * 54 + 70;
      card(110, 440, 755, h, 1);
      ctx.font = H.font('display', 44); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      lines.forEach((l, j) => ctx.fillText(l, 145, 440 + 70 + j * 54));
      ctx.font = H.font('ui', 25); ctx.fillStyle = ACC;
      ctx.fillText(P.by || 'Friends of the Earth Scotland campaigner', 145, 440 + 70 + lines.length * 54 + 14);
    });
  }

  // ================================================================ DEMAND
  else if (mode === 'demand') {
    const tPause = cue(P.pauseCue || 'pause', 0.1), tConv = cue(P.convCue || 'national', 0.22), tSay = cue(P.sayCue || 'say', 0.5);
    const tEuro = cue(P.euroCue || 'wave', 0.8);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.04, x: 487, y: 750 }]);
    sky(false);
    // hill behind the parliament (generic)
    ctx.fillStyle = '#2a2547'; ctx.beginPath(); ctx.moveTo(-200, 860); ctx.quadraticCurveTo(250, 540, 700, 640); ctx.quadraticCurveTo(900, 700, 1280, 820); ctx.lineTo(1280, GY); ctx.lineTo(-200, GY); ctx.closePath(); ctx.fill();
    ground();
    parliament(560, 880, 1.0, null);
    { const la = K.fadeOut(t, tPause - 0.3, 0.25); if (la > 0) pill(ctx, 560, 650, la, { text: P.place || 'Scottish Parliament', size: 26 }); }
    // crowd stands (not walking) in front
    crowd(487, 1000, 1.0, { walking: false, raise: 1, mood: 'happy' });
    // conversation pill at the top
    const ck = K.popIn(t, tConv - 0.1, 0.4);
    if (ck > 0) popAt(487, 495, ck, () => {
      card(130, 445, 715, 100, 1);
      ctx.font = H.font('display', 40); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(P.conv || '“National conversation”', 487, 497);
    });
    // pause badge + label (until the bubbles)
    const pk = K.popIn(t, tPause - 0.05, 0.4);
    if (pk > 0) popAt(487, 625, pk, () => {
      ctx.save(); ctx.globalAlpha *= K.fadeOut(t, tSay - 0.5, 0.3);
      card(287, 570, 400, 110, 1);
      ctx.beginPath(); ctx.arc(345, 625, 36, 0, TAU); ctx.fillStyle = ACC; ctx.fill();
      ctx.fillStyle = '#141829'; roundRect(ctx, 329, 607, 11, 36, 3); ctx.fill(); roundRect(ctx, 350, 607, 11, 36, 3); ctx.fill();
      ctx.font = H.font('display', 40); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(P.pause || 'A pause first', 400, 627);
      ctx.restore();
    });
    // speech bubbles from the crowd ("a say")
    const bubbles = P.bubbles || ['Our say?', 'Ask us first'];
    bubbles.slice(0, 2).forEach((b, i) => {
      const bk = K.popIn(t, tSay - 0.2 + i * 0.35, 0.35);
      if (bk > 0) K.drawSpeechBubble(ctx, i ? 760 : 250, 650, 1, { text: b, size: 28, maxW: 240, tail: i ? 'left' : 'right', pop: bk * K.fadeOut(t, tEuro - 0.5, 0.3) });
    });
    // europe wave chip with ripple dots
    const ek = K.popIn(t, tEuro - 0.1, 0.4);
    if (ek > 0) popAt(487, 625, ek, () => {
      card(170, 570, 635, 110, 1);
      for (let i = 0; i < 6; i++) {
        const ph = ((t - tEuro) * 1.4 + i * 0.35) % 2.1, r = 7 + 4 * Math.sin(ph * 3);
        ctx.beginPath(); ctx.arc(215 + i * 26, 625 + Math.sin(ph * 3) * 10, r, 0, TAU); ctx.fillStyle = rgba(ACC, 0.5 + 0.5 * Math.sin(ph * 3)); ctx.fill();
      }
      ctx.font = H.font('bold', 32); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(P.euro || 'Protests across Europe', 380, 627);
    });
  }

  // ================================================================ GUIDANCE (span)
  else if (mode === 'guidance') {
    const tGuide = cue(P.guideCue || 'guidance', 0.06), tYear = cue(P.yearCue || 'year', 0.22), tBen = cue(P.benefitCue || 'benefit', 0.38);
    const tMw = cue(P.mwCue || 'fifty', 0.55), tEia = cue(P.eiaCue || 'assessment', 0.68), tUnk = cue(P.unknownCue || 'What', 0.78);
    // two "rooms" on one street: govt building + book (left part), data-centre with badge (right part); camera pans
    const pan = K.phase(t, tMw - 1.0, tMw - 0.2) * (1 - K.phase(t, tUnk - 0.6, tUnk + 0.3));
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.03, x: 487, y: 740 }]);
    sky(false);
    ground();
    ctx.save(); ctx.translate(-pan * 560, 0);
    // stone government building (columns, pediment) left
    const gx = 330, gy = 990;
    K.shadow(ctx, gx, gy, 520);
    ctx.fillStyle = '#7d7590'; ctx.fillRect(gx - 240, gy - 330, 480, 330);
    ctx.beginPath(); ctx.moveTo(gx - 270, gy - 330); ctx.lineTo(gx, gy - 440); ctx.lineTo(gx + 270, gy - 330); ctx.closePath(); ctx.fillStyle = '#958ca8'; ctx.fill();
    ctx.fillStyle = '#6a6380'; ctx.fillRect(gx - 270, gy - 340, 540, 18);
    for (let i = 0; i < 6; i++) { roundRect(ctx, gx - 210 + i * 80, gy - 310, 36, 280, 8); ctx.fillStyle = '#b4abc6'; ctx.fill(); }
    ctx.fillStyle = '#5a536e'; ctx.fillRect(gx - 260, gy - 30, 520, 30);
    pill(ctx, gx, gy - 460, K.popIn(t, 0.05, 0.4) * K.fadeOut(t, tGuide - 0.4, 0.25), { text: P.gov || 'Scottish Government', size: 28 });
    // big data centre (right, off-screen until pan) + badge + assessment sheet
    const dcx = 1290, dcy = 990;
    K.drawDataCenter(ctx, dcx, dcy, 1.1, { t, activity: 0.8 });
    const mk = K.popIn(t, tMw - 0.1, 0.4);
    if (mk > 0) pill(ctx, dcx, dcy - 250, mk, { text: P.mw || 'Over 50 MW', size: 34, accent: true });
    ctx.restore();

    // guidance book + pen + calendar (screen space, top-left area, only before the pan)
    const bookA = 1 - K.phase(t, tMw - 1.0, tMw - 0.5) + K.phase(t, tUnk - 0.6, tUnk);
    const bk = K.popIn(t, tGuide - 0.15, 0.45);
    if (bk > 0 && bookA > 0.01) {
      ctx.save(); ctx.globalAlpha = clamp(bookA);
      popAt(330, 640, bk, () => {
        card(120, 420, 735, 280, 1);
        // book
        const unknown = t > tUnk;
        ctx.save(); ctx.translate(210, 680); ctx.scale(1.0, 1.0);
        roundRect(ctx, -70, -230, 160, 210, 10); ctx.fillStyle = '#3b4580'; ctx.fill();
        roundRect(ctx, -70, -230, 16, 210, 6); ctx.fillStyle = '#2b3463'; ctx.fill();
        ctx.fillStyle = ACC; ctx.fillRect(-40, -200, 104, 6); ctx.fillRect(-40, -60, 104, 6);
        ctx.font = H.font('display', unknown ? 80 : 24); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (unknown) ctx.fillText('?', 12, -130 + Math.sin(t * 3) * 4);
        else { ctx.fillText('PLANNING', 12, -146); ctx.fillText('GUIDANCE', 12, -116); }
        ctx.restore();
        // pen writing (before unknown)
        if (t < tUnk) {
          const wob = Math.sin(t * 9) * 8;
          ctx.save(); ctx.translate(268 + wob, 545 + Math.cos(t * 9) * 4); ctx.rotate(0.7);
          roundRect(ctx, -6, -70, 12, 70, 5); ctx.fillStyle = '#e8e8f0'; ctx.fill();
          ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.lineTo(0, 14); ctx.closePath(); ctx.fillStyle = '#20243a'; ctx.fill(); ctx.restore();
        }
        // calendar page
        const ck = K.popIn(t, tYear - 0.3, 0.4);
        if (ck > 0) popAt(420, 560, ck, () => {
          roundRect(ctx, 340, 470, 150, 170, 14); ctx.fillStyle = '#f4f6fb'; ctx.fill();
          roundRect(ctx, 340, 470, 150, 46, 14); ctx.fillStyle = '#d64b3f'; ctx.fill(); ctx.fillRect(340, 500, 150, 16);
          ctx.font = H.font('ui', 24); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.calTop || 'BY', 415, 494);
          ctx.font = H.font('condensed', 46); ctx.fillStyle = '#141829'; ctx.fillText(P.calA || 'YEAR', 415, 556); ctx.fillText(P.calB || 'END', 415, 606);
        });
        // text column
        ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        const lines = unknown ? [P.unk1 || 'What it says:', P.unk2 || 'not known yet'] : [P.g1 || 'New guidance', P.g2 || 'before the end', P.g3 || 'of the year'];
        const tk = unknown ? 1 : K.fadeIn(t, tYear - 0.2, 0.4);
        ctx.globalAlpha *= tk;
        ctx.font = H.font('display', 38); ctx.fillStyle = '#ffffff';
        lines.forEach((l, j) => { ctx.fillStyle = (unknown ? j === 1 : j > 0) ? ACC : '#ffffff'; ctx.fillText(l, 520, 520 + j * 50); });
      });
      ctx.restore();
    }
    // public benefit pill with houses getting a glow
    const bk2 = K.popIn(t, tBen - 0.2, 0.4);
    if (bk2 > 0 && t < tMw - 0.5) {
      ctx.save(); ctx.globalAlpha = K.fadeOut(t, tMw - 0.9, 0.4);
      pill(ctx, 640, 790, bk2, { text: P.benefit || 'More public benefit', size: 30, accent: true });
      for (let i = 0; i < 3; i++) { const hk = K.popIn(t, tBen + i * 0.15, 0.35); if (hk > 0) popAt(560 + i * 90, 990, hk, () => house(560 + i * 90, 990, 0.6, i, 0.9)); }
      ctx.restore();
    }
    // assessment sheet + REQUIRED stamp (after pan, screen space at the data centre's left)
    if (t > tEia - 1.2 && t < tUnk + 0.3) {
      const a = K.fadeOut(t, tUnk - 0.4, 0.4) * pan;
      ctx.save(); ctx.globalAlpha = clamp(a);
      const sk = K.popIn(t, tEia - 1.0, 0.45);
      popAt(300, 700, sk, () => {
        card(130, 440, 340, 440, 1);
        ctx.font = H.font('display', 32); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        (P.eia || 'Environmental|impact|assessment').split('|').forEach((l, j) => ctx.fillText(l, 158, 500 + j * 40));
        for (let j = 0; j < 5; j++) { roundRect(ctx, 158, 640 + j * 36, j % 2 ? 210 : 270, 12, 6); ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fill(); }
      });
      if (t > tEia) K.drawStamp(ctx, 330, 930, 0.8, { kind: 'check', text: P.stamp || 'REQUIRED', land: (t - tEia) / 0.5 });
      ctx.restore();
    }
    // unknowns: two chips
    if (t > tUnk) {
      const chips = P.unknowns || ['Pause? Not known yet'];
      chips.forEach((c, i) => { const k = K.popIn(t, cue(P.pauseQCue || 'paused', 0.9) - 0.2 + i * 0.3, 0.35); if (k > 0) pill(ctx, 487, 800 + i * 70, k, { text: c, size: 30, accent: true }); });
    }
  }
  ctx.restore();
}
