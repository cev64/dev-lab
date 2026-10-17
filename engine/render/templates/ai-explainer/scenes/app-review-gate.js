// Scene "app-review-gate" (full frame). A generic app store as a cartoon shop on a dusk street, with an "App Review"
// desk in front: app icons (rounded squares with little eyes) ride a belt across the desk, an inspector checks each
// one, and they hop into the shop. No logos, no real people, nothing graphic: any "photo" is an abstract blurred frame
// with a generic silhouette.
// Modes:
//  intro   (best as a 2-beat span) icons ride the belt; date pill; rule panel types in next to a rule book; an
//          "including AI" pill; a blurred photo tile flies at the door and bounces off a shield (cross).
//  switch  bait-and-switch: a masked icon passes review (APPROVED), hops to the shop, drops its mask, a "hidden
//          feature" box pops out; the inspector's beam catches it, REMOVED stamp, it sinks; developer badge crossed.
//  counts  boom barrier at the door: dark apps bounce off it; two counters count up (apps stopped, accounts
//          terminated) while ID badges drop into a shredder.
//  report  living room at night: a person on the sofa, a big phone inset shows a blurred photo that gets a "fake"
//          glitch + consent pill; a wall of profile frames pops ("anyone"); the Report button is tapped, flag flies.
//  search  app-store search screen: results rows, one masked app flagged; "Rules: written" vs "Enforced?" pills;
//          inspector with a magnifier.
// params (all optional; cues are narration words, a missing cue falls back to a fraction of the scene; defaults are
//   generic, no store or company names: pass yours):
//  all: mode, store ("App shop"), desk ("App Review")
//  intro: date (no pill if empty), book, ruleTag ("NEW RULE"), rule, ai; dateCue, bookCue, tileCue, ruleCue, shieldCue, aiCue
//  switch: rule (pill), hidden, removed ("REMOVED" stamp), dev; approvedCue, switchCue (2nd occurrence), caughtCue, appCue, devCue
//  counts: says, a / b {value, suffix, label, cue}; aStartCue, bStartCue
//  report: consent, anyone, report; photoCue, fakeCue, consentCue, anyoneCue, spotCue, reportCue
//  search: rules, enforced, found; rulesCue, enforcedCue, foundCue (alias aprilCue), flagCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, rgba } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const mode = P.mode || 'intro';
  const TAU = Math.PI * 2;
  const DANGER = '#ff6b5e';
  const ICON_COLS = ['#6f86e0', '#4fb3a6', '#e8786a', '#a08be0', '#f0a64a'];

  // ---------------------------------------------------------------- small drawing helpers
  function text(str, x, y, kind, size, color, align = 'center') {
    ctx.font = H.font(kind, size); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
  }
  function panel(x, y, w, h, k, stroke) {
    roundRect(ctx, x, y, w, h, 26); ctx.fillStyle = 'rgba(8,10,24,0.93)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = stroke || rgba(ACC, 0.75); roundRect(ctx, x, y, w, h, 26); ctx.stroke();
    void k;
  }
  function popAround(cx, cy, k, fn) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(cx, cy); const s = Math.min(1.05, k); ctx.scale(s, s); fn(); ctx.restore();
  }
  // app icon centred at (x, y), side 100*s. o: color, glyph cam|star|chat|music|play, look, blink, sneaky, mask (0..1 on)
  function appIcon(x, y, s, o = {}) {
    const col = o.sneaky ? '#3a2a5e' : (o.color || ICON_COLS[0]);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 58, 90, 0.3);
    roundRect(ctx, -50, -50, 100, 100, 26); ctx.fillStyle = col; ctx.fill();
    ctx.save(); roundRect(ctx, -50, -50, 100, 100, 26); ctx.clip();
    ctx.fillStyle = H.mixHex(col, '#000000', 0.2); ctx.fillRect(10, -60, 60, 120);
    ctx.fillStyle = rgba('#ffffff', 0.12); ctx.fillRect(-60, -60, 130, 30);
    ctx.restore();
    // glyph (upper half)
    ctx.strokeStyle = '#ffffff'; ctx.fillStyle = '#ffffff'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const g = o.glyph || 'cam';
    ctx.save(); ctx.translate(0, -16);
    if (o.sneaky) { ctx.fillStyle = DANGER; ctx.font = H.font('display', 36); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 2); }
    else if (g === 'cam') { roundRect(ctx, -22, -12, 44, 28, 7); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 2, 8, 0, TAU); ctx.stroke(); }
    else if (g === 'star') { ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 9 : 20, a = -Math.PI / 2 + (i * Math.PI) / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); }
    else if (g === 'chat') { roundRect(ctx, -20, -14, 40, 26, 9); ctx.fill(); ctx.beginPath(); ctx.moveTo(-8, 10); ctx.lineTo(-14, 20); ctx.lineTo(2, 11); ctx.fill(); }
    else if (g === 'music') { ctx.beginPath(); ctx.moveTo(-6, 12); ctx.lineTo(-6, -14); ctx.lineTo(14, -18); ctx.lineTo(14, 8); ctx.stroke(); ctx.beginPath(); ctx.arc(-11, 13, 6, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(9, 9, 6, 0, TAU); ctx.fill(); }
    else { ctx.beginPath(); ctx.moveTo(-10, -14); ctx.lineTo(16, 0); ctx.lineTo(-10, 14); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    // eyes (lower half): friendly, or narrowed for the sneaky one
    const lk = (o.look || 0) * 5, blink = o.blink ? 0.15 : 1;
    if (o.sneaky) {
      ctx.fillStyle = '#ff8a7e';
      for (const ex of [-16, 16]) { ctx.beginPath(); ctx.ellipse(ex + lk, 26, 9, 4, ex < 0 ? 0.25 : -0.25, 0, TAU); ctx.fill(); }
    } else {
      for (const ex of [-16, 16]) { ctx.beginPath(); ctx.ellipse(ex + lk, 26, 8, 9 * blink, 0, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.beginPath(); ctx.arc(ex + lk * 1.3, 27, 4 * blink, 0, TAU); ctx.fillStyle = '#161927'; ctx.fill(); }
    }
    // mask: a cheerful face plate held in front (tilts and falls when o.mask < 1)
    if (o.mask > 0) {
      const m = 1 - o.mask;
      ctx.save(); ctx.translate(-30 * m, 140 * m * m); ctx.rotate(-1.4 * m); ctx.globalAlpha = clamp(o.mask * 1.4);
      roundRect(ctx, -46, -44, 92, 88, 30); ctx.fillStyle = '#ffe9a8'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = '#d9b75a'; roundRect(ctx, -46, -44, 92, 88, 30); ctx.stroke();
      ctx.fillStyle = '#161927'; ctx.beginPath(); ctx.arc(-16, -8, 6, 0, TAU); ctx.arc(16, -8, 6, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#161927'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 6, 18, 0.2, Math.PI - 0.2); ctx.stroke();
      ctx.fillStyle = rgba('#ff9a8a', 0.6); ctx.beginPath(); ctx.arc(-28, 10, 7, 0, TAU); ctx.arc(28, 10, 7, 0, TAU); ctx.fill();
      // strap
      ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-46, -6); ctx.lineTo(-54, -10); ctx.moveTo(46, -6); ctx.lineTo(54, -10); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
  // abstract photo frame (blurred generic silhouette) centred at (x, y), w x h. o.fake (0..1) glitch, o.cross (0..1)
  function photo(x, y, w, h, o = {}) {
    ctx.save(); ctx.translate(x, y);
    roundRect(ctx, -w / 2 - 8, -h / 2 - 8, w + 16, h + 16, 16); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.save(); roundRect(ctx, -w / 2, -h / 2, w, h, 10); ctx.clip();
    const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#7fa6d9'); g.addColorStop(1, '#a9c6a0');
    ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.filter = `blur(${Math.max(3, w * 0.035)}px)`;
    ctx.fillStyle = '#4a5578';
    ctx.beginPath(); ctx.arc(0, -h * 0.08, w * 0.17, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, h * 0.42, w * 0.34, h * 0.3, 0, 0, TAU); ctx.fill();
    ctx.filter = 'none';
    if (o.fake > 0) {
      const f = clamp(o.fake);
      for (let i = 0; i < 6; i++) {
        const yy = -h / 2 + (H.hash(i, 3) * h), hh = 6 + 14 * H.hash(i, 4), dx = (H.hash(i, Math.floor(t * 8)) - 0.5) * 30 * f;
        ctx.fillStyle = rgba(i % 2 ? DANGER : '#a08be0', 0.55 * f); ctx.fillRect(-w / 2 + dx, yy, w, hh);
      }
      ctx.fillStyle = rgba('#1a0e2a', 0.35 * f); ctx.fillRect(-w / 2, -h / 2, w, h);
    }
    ctx.restore();
    if (o.cross > 0) {
      ctx.strokeStyle = DANGER; ctx.lineWidth = 12; ctx.lineCap = 'round';
      K.motion.pathDraw(ctx, [[-w * 0.3, -h * 0.3], [w * 0.3, h * 0.3]], clamp(o.cross * 2));
      K.motion.pathDraw(ctx, [[w * 0.3, -h * 0.3], [-w * 0.3, h * 0.3]], clamp(o.cross * 2 - 1));
    }
    ctx.restore();
  }
  // generic shop: facade with a striped awning, a sign board, a door; a shopping-bag emblem with an app grid on top
  function shop(x, gy, label) {
    const W = 380, top = gy - 300;
    K.shadow(ctx, x, gy, W + 60, 0.35);
    roundRect(ctx, x - W / 2, top, W, 300, 10); ctx.fillStyle = '#3a4675'; ctx.fill();
    ctx.fillStyle = '#2e3860'; ctx.fillRect(x + W * 0.2, top, W * 0.3, 300);
    // awning stripes
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? '#f2f4fa' : ACC;
      ctx.beginPath(); const x0 = x - W / 2 - 14 + i * (W + 28) / 8, x1 = x0 + (W + 28) / 8;
      ctx.moveTo(x0, top + 70); ctx.lineTo(x1, top + 70); ctx.lineTo(x1, top + 118); ctx.arc((x0 + x1) / 2, top + 118, (x1 - x0) / 2, 0, Math.PI); ctx.closePath(); ctx.fill();
    }
    // sign board
    roundRect(ctx, x - W / 2 + 20, top + 6, W - 40, 58, 10); ctx.fillStyle = '#161a30'; ctx.fill();
    const f = H.fitText(ctx, label, 'display', 36, 24, W - 80); ctx.font = f.font; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, x, top + 36);
    // windows with tiny app tiles
    for (const sx of [-1, 1]) {
      const wx = x + sx * 120;
      roundRect(ctx, wx - 60, top + 150, 120, 90, 8); ctx.fillStyle = '#1c2340'; ctx.fill();
      for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { roundRect(ctx, wx - 48 + c * 34, top + 162 + r * 38, 26, 26, 7); ctx.fillStyle = rgba(ICON_COLS[(r * 3 + c + (sx > 0 ? 2 : 0)) % 5], 0.85); ctx.fill(); }
    }
    // door
    roundRect(ctx, x - 48, gy - 150, 96, 150, 10); ctx.fillStyle = '#1a1f38'; ctx.fill();
    K.glow(ctx, x, gy - 70, 90, '#ffd98a', 0.18);
    roundRect(ctx, x - 40, gy - 142, 80, 142, 8); ctx.fillStyle = rgba('#ffd98a', 0.22); ctx.fill();
    // bag emblem on the roof
    const by = top - 8;
    ctx.save(); ctx.translate(x, by);
    ctx.strokeStyle = '#f2f4fa'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, -70, 24, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-50, -72); ctx.lineTo(50, -72); ctx.lineTo(58, 0); ctx.lineTo(-58, 0); ctx.closePath(); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { roundRect(ctx, -26 + c * 28, -60 + r * 28, 22, 22, 6); ctx.fillStyle = r + c === 1 ? ACC : '#6f86e0'; ctx.fill(); }
    ctx.restore();
  }
  function inspector(x, gy, s, o = {}) {
    K.drawPerson(ctx, x, gy, s, Object.assign({ t, pose: 'stand', skin: 2, hair: 1, shirt: '#4fb3a6', hairStyle: 'bun', mood: 'neutral', seed: 7 }, o));
  }
  // clipboard drawn near a hand
  function clipboard(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.12);
    roundRect(ctx, -26, -34, 52, 68, 6); ctx.fillStyle = '#9a6a46'; ctx.fill();
    roundRect(ctx, -20, -26, 40, 56, 3); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    roundRect(ctx, -10, -40, 20, 12, 4); ctx.fillStyle = '#5a5f78'; ctx.fill();
    ctx.strokeStyle = '#8a93a8'; ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-14, -14 + i * 11); ctx.lineTo(14, -14 + i * 11); ctx.stroke(); }
    ctx.restore();
  }
  function belt(x0, x1, y, speed) {
    roundRect(ctx, x0, y - 10, x1 - x0, 26, 13); ctx.fillStyle = '#1c2033'; ctx.fill();
    roundRect(ctx, x0 + 4, y - 7, x1 - x0 - 8, 12, 6); ctx.fillStyle = '#3b4260'; ctx.fill();
    ctx.save(); roundRect(ctx, x0 + 4, y - 7, x1 - x0 - 8, 12, 6); ctx.clip();
    ctx.fillStyle = '#5a6288'; const off = (t * speed) % 40;
    for (let xx = x0 - 40 + off; xx < x1; xx += 40) ctx.fillRect(xx, y - 7, 8, 12);
    ctx.restore();
    for (const lx of [x0 + 30, x1 - 30]) { roundRect(ctx, lx - 8, y + 14, 16, 1040 - y - 14, 5); ctx.fillStyle = '#1c2033'; ctx.fill(); }
    K.shadow(ctx, (x0 + x1) / 2, 1040, x1 - x0 + 40, 0.3);
  }
  function badge(x, y, s, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    roundRect(ctx, -46, -32, 92, 64, 10); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.save(); roundRect(ctx, -46, -32, 92, 64, 10); ctx.clip(); ctx.fillStyle = '#6f86e0'; ctx.fillRect(-46, -32, 92, 16); ctx.restore();
    ctx.fillStyle = '#8a93a8'; ctx.beginPath(); ctx.arc(-22, 4, 10, 0, TAU); ctx.fill(); roundRect(ctx, -34, 14, 24, 10, 5); ctx.fill();
    ctx.fillStyle = '#b9c1d6'; roundRect(ctx, -2, -4, 38, 7, 3); ctx.fill(); roundRect(ctx, -2, 9, 28, 7, 3); ctx.fill();
    ctx.restore();
  }

  // ================================================================ modes
  if (mode === 'intro') {
    // cues (scene-relative s)
    const tDate = at(P.dateCue, D * 0.202) - 0.2;
    const tBook = at(P.bookCue || 'updated', D * 0.315) - 0.2;
    const tTile = at(P.tileCue || 'create', D * 0.523) - 0.2;
    const tRule = at(P.ruleCue || 'prevent', D * 0.648) - 0.3;
    const tSh = at(P.shieldCue || 'remove', D * 0.696) - 0.2;
    const tAI = at(P.aiCue || 'including', D * 0.874) - 0.2;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: 3, zoom: 1.0 }, { t: 6, zoom: 1.04, x: 500, y: 760 }, { t: D, zoom: 1.06, x: 500, y: 760 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });
    shop(720, 1000, P.store || 'App shop');
    // shield by the door (rises on cue)
    const shk = K.popIn(t, tSh, 0.5);
    if (shk > 0) { K.glow(ctx, 590, 900, 120, ACC, 0.3 + 0.08 * Math.sin(t * 3)); K.drawShield(ctx, 590, 1000 + (1 - clamp(shk)) * 60, 0.95 * Math.min(1.05, shk), { check: clamp((t - tSh - 0.4) / 0.4) }); }
    // inspector behind the belt desk
    const iy = 1030;
    inspector(300, iy, 1.25, { pose: 'stand', mood: t > tSh && t < tSh + 1.8 ? 'happy' : 'neutral', look: 0.3 * Math.sin(t * 0.9) });
    clipboard(355, 860, 1.0);
    belt(60, 520, 930, 70);
    K.drawLabel(ctx, 290, 1000, 1, { text: P.desk || 'App Review', size: 26, dot: true });
    // icons ride the belt, get a check, hop to the door
    const per = 1.7, beltSpeed = 150, x0 = 30, xEnd = 500;
    const life = (xEnd - x0) / beltSpeed + 0.9;
    for (let i = -3; i < Math.ceil(D / per) + 1; i++) {
      const s0 = i * per, a = t - s0;
      if (a < 0 || a > life) continue;
      const beltT = (xEnd - x0) / beltSpeed;
      let x, y, sc = 0.82, alpha = 1;
      if (a < beltT) { x = x0 + a * beltSpeed; y = 870 - Math.abs(Math.sin(a * 6)) * 6; }
      else { const u = clamp((a - beltT) / 0.9); x = lerp(xEnd, 720, u); y = lerp(870, 940, u) - Math.sin(u * Math.PI) * 120; sc = 0.82 * (1 - 0.35 * u); alpha = 1 - smooth((u - 0.7) / 0.3); }
      const idx = ((i % 5) + 5) % 5;
      ctx.save(); ctx.globalAlpha = alpha;
      appIcon(x, y, sc, { color: ICON_COLS[idx], glyph: ['cam', 'star', 'chat', 'music', 'play'][idx], look: 0.6, blink: H.hash(i, Math.floor(t * 2)) > 0.93 });
      // check mark pops once past the inspector
      if (x > 330 && a < beltT + 0.9) { const ck = K.popIn(a, (330 - x0) / beltSpeed, 0.3); if (ck > 0) { ctx.save(); ctx.translate(x + 34, y - 52); ctx.scale(Math.min(1, ck), Math.min(1, ck)); ctx.beginPath(); ctx.arc(0, 0, 18, 0, TAU); ctx.fillStyle = ACC; ctx.fill(); ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-2, 6); ctx.lineTo(9, -6); ctx.stroke(); ctx.restore(); } }
      ctx.restore();
    }
    // blurred photo tile flies at the door, bounces off the shield
    if (t > tTile) {
      const a = t - tTile, hitAt = Math.max(0.6, tSh + 0.35 - tTile);
      let px, py, rot = 0, cross = 0, alpha = 1;
      if (a < hitAt) { const u = smooth(a / hitAt); px = lerp(470, 560, u); py = lerp(790, 860, u) - Math.sin(u * Math.PI) * 90; rot = 0.1 * Math.sin(a * 5); }
      else { const b = a - hitAt; px = 560 - b * 160; py = 860 + b * b * 260 - b * 120; rot = -b * 2.2; cross = clamp(b / 0.5); alpha = 1 - smooth((b - 1.0) / 0.5); }
      if (alpha > 0) { ctx.save(); ctx.globalAlpha = alpha; ctx.translate(px, py); ctx.rotate(rot); photo(0, 0, 92, 110, { cross }); ctx.restore(); }
    }
    // date pill
    const dk = K.popIn(t, tDate, 0.4);
    if (dk > 0 && P.date) K.drawLabel(ctx, 290, 470, Math.min(1.05, dk), { text: P.date, size: 30, accent: true });
    // rule panel with book (book opens on "updated", rule types in on "prevent")
    const bk = K.popIn(t, tBook, 0.45);
    popAround(487, 600, bk, () => {
      panel(-410, -95, 820, 190);
      K.drawRulebook(ctx, -300, 82, 0.72, { open: clamp((t - tBook - 0.2) / 0.6), title: P.book || 'Guidelines' });
      text(P.ruleTag || 'NEW RULE', -200, -50, 'ui', 26, ACC, 'left');
      const full = P.rule || 'New rule for apps';
      const shown = t < tRule ? '' : K.typewriter(full, t, 34, tRule);
      let size = 38, lines; for (; size >= 28; size -= 2) { lines = H.wrap(ctx, full, 'bold', size, 580); if (lines.length <= 2) break; }
      ctx.font = H.font('bold', size); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      let left = shown.length; const lh = size * 1.18;
      lines.forEach((ln, j) => { const part = ln.slice(0, Math.max(0, left)); left -= ln.length + 1; ctx.fillText(part, -200, 8 + j * lh); });
      if (t < tRule) { ctx.fillStyle = rgba('#ffffff', 0.25); for (let j = 0; j < 2; j++) { roundRect(ctx, -200, -4 + j * 44, 520 - j * 160, 18, 9); ctx.fill(); } }
    });
    const ak = K.popIn(t, tAI, 0.4);
    if (ak > 0) K.drawLabel(ctx, 700, 470 + K.bob(t, 3, 1.4), Math.min(1.05, ak), { text: P.ai || 'Including AI-made', size: 30, dot: true });
    return;
  }

  if (mode === 'switch') {
    const tPass = at(P.approvedCue || 'pass', D * 0.345) - 0.2;
    const tSw = at(P.switchCue || 'switch', D * 0.46, 1) - 0.1;
    const tCaught = at(P.caughtCue || 'caught', D * 0.711) - 0.2;
    const tApp = at(P.appCue || 'app', D * 0.784) - 0.15;
    const tDev = at(P.devCue || 'developer', D * 0.825) - 0.1;
    K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 420, y: 800 }, { t: tPass + 0.5, zoom: 1.08, x: 470, y: 800 }, { t: tSw + 0.6, zoom: 1.12, x: 560, y: 800 }, { t: D, zoom: 1.1, x: 540, y: 790 }]);
    K.cameraShake(ctx, t, tApp + 0.25, 0.35, 8);
    K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });
    shop(720, 1000, P.store || 'App shop');
    inspector(300, 1030, 1.25, { pose: t > tCaught ? 'point' : 'stand', mood: t > tCaught ? 'angry' : (t > tPass ? 'happy' : 'neutral'), look: t > tPass ? 0.8 : 0.4 });
    if (t < tCaught) clipboard(355, 860, 1.0);
    belt(60, 520, 930, t < tPass + 0.4 ? 70 : 0);
    K.drawLabel(ctx, 290, 1000, 1, { text: P.desk || 'App Review', size: 26, dot: true });
    // masked icon: rides in, waits at the inspector, gets approved, hops to the shop front
    let x, y, sc = 0.95;
    const arrive = Math.min(2.4, tPass - 0.2);
    if (t < arrive) { const u = smooth(t / arrive); x = lerp(40, 360, u); y = 860 - Math.abs(Math.sin(t * 6)) * 6; }
    else if (t < tPass + 0.5) { x = 360; y = 860; }
    else { const u = smooth((t - tPass - 0.5) / 0.9); x = lerp(360, 600, u); y = lerp(860, 940, u) - Math.sin(u * Math.PI) * 130; }
    // after "app": sinks through the ground
    const sink = smooth((t - tApp - 0.3) / 0.8);
    const mask = 1 - smooth((t - tSw) / 0.7);
    const sneaky = t > tSw + 0.25;
    if (sink < 1) {
      ctx.save();
      ctx.beginPath(); ctx.rect(-200, 0, 1500, 1000); ctx.clip();
      appIcon(x, y + sink * 160, sc, { color: '#4fb3a6', glyph: 'cam', sneaky, mask, look: sneaky ? -0.5 : 0.5 });
      ctx.restore();
    }
    // hole in the ground (trapdoor) after the stamp
    const hk = clamp((t - tApp - 0.15) / 0.3) * (1 - smooth((t - tApp - 1.4) / 0.4));
    if (hk > 0) { ctx.save(); ctx.translate(600, 1000); ctx.scale(1, 0.2); ctx.beginPath(); ctx.arc(0, 0, 80 * hk, 0, TAU); ctx.fillStyle = '#05060d'; ctx.fill(); ctx.restore(); }
    // hidden-feature box pops out of the icon
    const fk = K.popIn(t, tSw + 0.45, 0.45) * (1 - smooth((t - tApp - 0.2) / 0.4));
    if (fk > 0) {
      ctx.save(); ctx.translate(600, 760 + K.bob(t, 4, 2)); ctx.scale(Math.min(1.05, fk), Math.min(1.05, fk));
      K.glow(ctx, 0, 0, 110, DANGER, 0.35);
      roundRect(ctx, -70, -60, 140, 110, 18); ctx.fillStyle = '#2a1840'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = DANGER; roundRect(ctx, -70, -60, 140, 110, 18); ctx.stroke();
      text('?', 0, -6, 'display', 64, DANGER);
      ctx.restore();
      ctx.save(); ctx.globalAlpha = clamp(fk);
      K.drawLabel(ctx, 600, 680, Math.min(1.05, fk), { text: P.hidden || 'Hidden feature', size: 28, dot: true });
      ctx.restore();
    }
    // inspector's beam catches it
    const bmk = clamp((t - tCaught) / 0.3) * (1 - smooth((t - tApp - 0.6) / 0.5));
    if (bmk > 0) {
      ctx.save(); ctx.globalAlpha = 0.35 * bmk;
      const g = ctx.createLinearGradient(360, 780, 600, 900); g.addColorStop(0, rgba(ACC, 0.9)); g.addColorStop(1, rgba(ACC, 0.2));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(370, 790); ctx.lineTo(680, 820); ctx.lineTo(620, 1000); ctx.closePath(); ctx.fill();
      ctx.restore();
      K.drawWarning(ctx, 470, 760, 0.6 * Math.min(1, bmk), { pulse: t });
    }
    // REMOVED stamp on the app, then the developer badge gets crossed
    if (t > tApp) K.drawStamp(ctx, 640, 1000, 0.72, { kind: 'cross', text: P.removed || 'REMOVED', land: (t - tApp) / 0.5 });
    const dvk = K.popIn(t, tDev, 0.45);
    popAround(400, 600, dvk, () => {
      panel(-170, -90, 340, 180, rgba(DANGER, 0.8));
      badge(-80, 10, 1.2);
      ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const lines = H.wrap(ctx, P.dev || 'Developer account', 'ui', 26, 150);
      lines.forEach((ln, j) => ctx.fillText(ln, -10, -16 + j * 32 - (lines.length - 1) * 4));
      const xk = clamp((t - tDev - 0.4) / 0.5);
      if (xk > 0) { ctx.strokeStyle = DANGER; ctx.lineWidth = 12; ctx.lineCap = 'round'; K.motion.pathDraw(ctx, [[-140, -60], [140, 60]], clamp(xk * 2)); K.motion.pathDraw(ctx, [[140, -60], [-140, 60]], clamp(xk * 2 - 1)); }
    });
    // rule pill
    const rk = K.popIn(t, 0.2, 0.4);
    if (rk > 0) K.drawLabel(ctx, 600, 560, Math.min(1.05, rk), { text: P.rule || 'New rule', size: 30, accent: true });
    return;
  }

  if (mode === 'counts') {
    const A = P.a || { value: 100, suffix: 'K+', label: 'apps stopped' };
    const B = P.b || { value: 50, suffix: 'K+', label: 'developer accounts closed' };
    const tA0 = at(P.aStartCue || 'blocked', D * 0.16) - 0.3, tA1 = at(A.cue, D * 0.283);
    const tB0 = at(P.bStartCue || 'terminated', D * 0.547) - 0.3, tB1 = at(B.cue, D * 0.669);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 487, y: 780 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });
    shop(720, 1000, P.store || 'App shop');
    // boom barrier in front of the door
    ctx.save(); ctx.translate(560, 1000);
    roundRect(ctx, -16, -120, 32, 120, 6); ctx.fillStyle = '#2a2f45'; ctx.fill();
    ctx.translate(0, -100); ctx.rotate(-0.04 * Math.sin(t * 9) * (t > tA0 && t < tB0 ? 1 : 0.2));
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#f2f4fa' : DANGER; ctx.fillRect(-300 + i * 50, -10, 50, 20); }
    ctx.restore();
    // dark apps run at the barrier and bounce back into a pile (start on the first count)
    const per = 0.55;
    for (let i = 0; i < 40; i++) {
      const s0 = Math.max(0, tA0 - 0.6) + i * per, a = t - s0;
      if (a < 0) continue;
      const pileX = 90 + (i % 5) * 52, pileY = 1000 - 40 - Math.floor(i / 5) * 18;
      let x, y, rot = 0;
      if (a < 0.7) { const u = a / 0.7; x = lerp(-40, 240, u); y = 960 - Math.abs(Math.sin(a * 9)) * 18; }
      else if (a < 1.5) { const u = (a - 0.7) / 0.8; x = lerp(240, pileX, u); y = lerp(960, pileY, u) - Math.sin(u * Math.PI) * 90; rot = -u * 3; }
      else { x = pileX; y = pileY; rot = -3 + H.hash(i, 9) * 0.6; }
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); appIcon(0, 0, 0.42, { sneaky: true }); ctx.restore();
    }
    // badges fall into a shredder bin (after the second count starts)
    ctx.save(); ctx.translate(880, 1000);
    roundRect(ctx, -56, -110, 112, 110, 10); ctx.fillStyle = '#2a2f45'; ctx.fill();
    roundRect(ctx, -64, -124, 128, 22, 8); ctx.fillStyle = '#3b4260'; ctx.fill();
    roundRect(ctx, -40, -116, 80, 6, 3); ctx.fillStyle = '#05060d'; ctx.fill();
    const busy = t > tB0 ? 1 : 0;
    ctx.fillStyle = busy && Math.floor(t * 6) % 2 ? DANGER : '#5a6288'; ctx.beginPath(); ctx.arc(36, -80, 7, 0, TAU); ctx.fill();
    ctx.restore();
    for (let i = 0; i < 14; i++) {
      const s0 = tB0 + i * 0.45, a = t - s0;
      if (a < 0 || a > 1.1) continue;
      const u = a / 1.1;
      const bx = 880 + (H.hash(i, 2) - 0.5) * 60 * (1 - u), by = lerp(700, 880, u * u);
      ctx.save(); ctx.beginPath(); ctx.rect(700, 400, 360, 478); ctx.clip();
      badge(bx, by, 0.8, (H.hash(i, 3) - 0.5) * 0.8 * (1 - u)); ctx.restore();
    }
    // says pill + counters
    const sk = K.popIn(t, 0.15, 0.4);
    if (sk > 0) K.drawLabel(ctx, 487, 485, Math.min(1.05, sk), { text: P.says || 'The store says', size: 28, dot: true });
    const counter = (cx, t0, t1, C) => {
      const k = K.popIn(t, t0, 0.45);
      popAround(cx, 615, k, () => {
        panel(-200, -95, 400, 190);
        const v = Math.round(C.value * smooth(clamp((t - t0) / Math.max(0.4, t1 - t0))));
        const done = t >= t1;
        text(String(v) + C.suffix, 0, -30, 'display', 74, done ? ACC : '#ffffff');
        ctx.font = H.font('ui', 26); ctx.fillStyle = '#dfe4f1'; ctx.textAlign = 'center';
        const lines = H.wrap(ctx, C.label, 'ui', 26, 350); lines.slice(0, 2).forEach((ln, j) => ctx.fillText(ln, 0, 32 + j * 32));
      });
    };
    counter(277, tA0, tA1, A);
    counter(697, tB0, tB1, B);
    return;
  }

  if (mode === 'report') {
    const tPh = at(P.photoCue || 'photo', D * 0.168) - 0.4;
    const tFake = at(P.fakeCue || 'fake', D * 0.257) - 0.2;
    const tCon = at(P.consentCue || 'consent', D * 0.434) - 0.3;
    const tAny = at(P.anyoneCue || 'anyone', D * 0.549) - 0.2;
    const tSpot = at(P.spotCue || 'spot', D * 0.85) - 0.2;
    const tRep = at(P.reportCue || 'report', D * 0.929) - 0.15;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 500, y: 760 }]);
    const room = K.world.livingRoomNight(ctx, { t, lampOn: 1 });
    const feet = room.sofa.feetY;
    K.drawPerson(ctx, 300, feet, 1.55, { pose: 'sit-phone', seat: false, t, typing: t < tSpot ? 0.5 : 0, skin: 1, hair: 4, shirt: '#a08be0', hairStyle: 'long', mood: t > tFake && t < tSpot ? 'worried' : 'neutral', seed: 3 });
    // wall of profile frames ("anyone with a photo online")
    for (let i = 0; i < 8; i++) {
      const k = K.popIn(t, tAny + i * 0.09, 0.35);
      if (k <= 0) continue;
      const cx = 115 + (i % 4) * 105, cy = 470 + Math.floor(i / 4) * 120 + K.bob(t, 3, 1.3, i);
      ctx.save(); ctx.translate(cx, cy); const s = Math.min(1.05, k); ctx.scale(s, s);
      ctx.beginPath(); ctx.arc(0, 0, 42, 0, TAU); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(0, 0, 36, 0, TAU); ctx.clip(); ctx.fillStyle = ICON_COLS[i % 5]; ctx.fillRect(-40, -40, 80, 80);
      ctx.fillStyle = rgba('#161927', 0.55); ctx.beginPath(); ctx.arc(0, -6, 13, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, 30, 24, 18, 0, 0, TAU); ctx.fill(); ctx.restore();
      if (i === 7 || i === 2) { K.drawShield(ctx, 30, 44, 0.3, { check: 1, shadow: false }); }
      ctx.restore();
    }
    const yk = K.popIn(t, tAny + 0.6, 0.4);
    if (yk > 0) K.drawLabel(ctx, 270, 720, Math.min(1.05, yk), { text: P.anyone || 'Anyone with a photo online', size: 26, dot: true });
    // big phone inset (zoom of the person's phone)
    const pk = K.popIn(t, Math.max(0, tPh - 0.4), 0.5);
    popAround(720, 720, pk, () => {
      const W = 330, Hh = 600;
      roundRect(ctx, -W / 2 - 14, -Hh / 2 - 14, W + 28, Hh + 28, 46); ctx.fillStyle = '#1c2033'; ctx.fill();
      roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 34); ctx.fillStyle = '#121527'; ctx.fill();
      roundRect(ctx, -40, -Hh / 2 + 10, 80, 14, 7); ctx.fillStyle = '#05060d'; ctx.fill();
      // post header
      ctx.fillStyle = '#6f86e0'; ctx.beginPath(); ctx.arc(-W / 2 + 40, -Hh / 2 + 62, 18, 0, TAU); ctx.fill();
      ctx.fillStyle = '#b9c1d6'; roundRect(ctx, -W / 2 + 68, -Hh / 2 + 52, 140, 10, 5); ctx.fill(); roundRect(ctx, -W / 2 + 68, -Hh / 2 + 68, 90, 8, 4); ctx.fill();
      photo(0, -40, 270, 300, { fake: clamp((t - tFake) / 0.5) });
      // fake / consent tags
      const fk = K.popIn(t, tFake + 0.2, 0.35);
      if (fk > 0) { ctx.save(); ctx.translate(-70, -170); ctx.scale(Math.min(1.05, fk), Math.min(1.05, fk)); roundRect(ctx, -56, -22, 112, 44, 22); ctx.fillStyle = DANGER; ctx.fill(); text('FAKE', 0, 1, 'display', 26, '#2a0d0a'); ctx.restore(); }
      const ck = K.popIn(t, tCon, 0.4);
      if (ck > 0) K.drawLabel(ctx, 0, 172, Math.min(1.05, ck), { text: P.consent || 'Without consent', size: 28, accent: true });
      // report button
      const glowR = t > tSpot ? 0.5 + 0.3 * Math.sin(t * 8) : 0;
      const pressed = t > tRep && t < tRep + 0.25;
      ctx.save(); ctx.translate(0, Hh / 2 - 70 + (pressed ? 3 : 0));
      if (glowR > 0) K.glow(ctx, 0, 0, 110, ACC, glowR * 0.6);
      roundRect(ctx, -110, -32, 220, 64, 32); ctx.fillStyle = t > tSpot ? ACC : '#3b4260'; ctx.fill();
      // flag glyph
      ctx.strokeStyle = t > tSpot ? K.ACCENT.deep : '#ffffff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-70, 18); ctx.lineTo(-70, -18); ctx.stroke();
      ctx.fillStyle = t > tSpot ? K.ACCENT.deep : '#ffffff'; ctx.beginPath(); ctx.moveTo(-68, -18); ctx.lineTo(-44, -12); ctx.lineTo(-68, -4); ctx.fill();
      text(P.report || 'Report', 12, 1, 'display', 30, t > tSpot ? K.ACCENT.deep : '#ffffff');
      ctx.restore();
      // tapping finger (a simple round cursor) comes in on "spot", taps on "report"
      const fin = smooth((t - tSpot) / 0.6);
      if (fin > 0) {
        const fx = lerp(220, 60, fin), fy = lerp(Hh / 2 + 60, Hh / 2 - 50, fin) + (pressed ? 8 : 0);
        ctx.fillStyle = '#eab894'; ctx.beginPath(); ctx.ellipse(fx, fy + 40, 22, 52, -0.3, 0, TAU); ctx.fill();
        ctx.fillStyle = '#cf9466'; ctx.beginPath(); ctx.ellipse(fx + 4, fy + 6, 10, 8, -0.3, 0, TAU); ctx.fill();
      }
      // sent check
      const ok = K.popIn(t, tRep + 0.25, 0.35);
      if (ok > 0) { ctx.save(); ctx.translate(110, Hh / 2 - 130); ctx.scale(Math.min(1, ok), Math.min(1, ok)); ctx.beginPath(); ctx.arc(0, 0, 26, 0, TAU); ctx.fillStyle = ACC; ctx.fill(); ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(-3, 8); ctx.lineTo(12, -8); ctx.stroke(); ctx.restore(); }
    });
    // flag flies up from the phone after the tap
    if (t > tRep + 0.2) {
      const u = smooth((t - tRep - 0.2) / 0.6);
      if (u < 1) { ctx.save(); ctx.globalAlpha = 1 - u; ctx.translate(720, lerp(950, 560, u)); ctx.strokeStyle = ACC; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(0, -30); ctx.stroke(); ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(2, -30); ctx.lineTo(40, -20); ctx.lineTo(2, -8); ctx.fill(); ctx.restore(); }
    }
    return;
  }

  if (mode === 'search') {
    const tRules = at(P.rulesCue || 'rules', D * 0.13) - 0.2;
    const tEnf = at(P.enforcedCue || 'enforced', D * 0.311) - 0.2;
    const tApr = at(P.foundCue || P.aprilCue, D * 0.492) - 0.2;
    const tFlag = at(P.flagCue, D * 0.609) - 0.2;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 540, y: 760 }]);
    K.world.room(ctx, { t, time: 'night', window: false, picture: false });
    // inspector with a magnifier at the left
    inspector(150, 1030, 1.3, { pose: 'point', mood: t > tFlag ? 'worried' : 'neutral', look: 0.6 });
    // search screen panel
    const sk = K.popIn(t, 0.1, 0.5);
    popAround(590, 760, sk, () => {
      const W = 560, Hh = 430;
      roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 30); ctx.fillStyle = '#121527'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 30); ctx.stroke();
      // search bar with a blurred query
      roundRect(ctx, -W / 2 + 26, -Hh / 2 + 24, W - 52, 60, 30); ctx.fillStyle = '#2a2f45'; ctx.fill();
      ctx.strokeStyle = '#dfe4f1'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(-W / 2 + 64, -Hh / 2 + 52, 12, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-W / 2 + 73, -Hh / 2 + 61); ctx.lineTo(-W / 2 + 84, -Hh / 2 + 72); ctx.stroke();
      const qw = 200 * clamp(t / 1.0);
      ctx.save(); ctx.filter = 'blur(4px)'; ctx.fillStyle = '#b9c1d6'; roundRect(ctx, -W / 2 + 100, -Hh / 2 + 44, Math.max(1, qw), 18, 9); ctx.fill(); ctx.restore();
      // result rows
      const rows = [{ c: '#6f86e0', g: 'star' }, { sneaky: true }, { c: '#4fb3a6', g: 'music' }];
      rows.forEach((r, j) => {
        const rk = K.popIn(t, 0.5 + j * 0.25, 0.35);
        if (rk <= 0) return;
        const ry = -Hh / 2 + 150 + j * 100;
        ctx.save(); ctx.globalAlpha = clamp(rk);
        const hl = r.sneaky && t > tFlag;
        if (hl) { roundRect(ctx, -W / 2 + 14, ry - 46, W - 28, 92, 18); ctx.fillStyle = rgba(DANGER, 0.18 + 0.08 * Math.sin(t * 6)); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = DANGER; ctx.stroke(); }
        appIcon(-W / 2 + 80, ry, 0.72, r.sneaky ? { sneaky: true } : { color: r.c, glyph: r.g, look: 0.4 });
        ctx.fillStyle = '#dfe4f1'; roundRect(ctx, -W / 2 + 150, ry - 22, 200, 16, 8); ctx.fill();
        ctx.fillStyle = '#5a6288'; roundRect(ctx, -W / 2 + 150, ry + 6, 130, 12, 6); ctx.fill();
        roundRect(ctx, W / 2 - 120, ry - 20, 90, 40, 20); ctx.fillStyle = '#3b4260'; ctx.fill();
        text('GET', W / 2 - 75, ry + 1, 'ui', 24, '#ffffff');
        if (hl) K.drawWarning(ctx, W / 2 - 170, ry + 30, 0.42, { pulse: t });
        ctx.restore();
      });
    });
    // top pills: rules written / enforced?
    const rk = K.popIn(t, tRules, 0.4);
    if (rk > 0) K.drawLabel(ctx, 300, 500, Math.min(1.05, rk), { text: P.rules || 'Rules: written', size: 30, dot: true });
    const ek = K.popIn(t, tEnf, 0.4);
    if (ek > 0) K.drawLabel(ctx, 700, 500 + K.bob(t, 4, 2), Math.min(1.05, ek), { text: P.enforced || 'Enforced?', size: 30, accent: true });
    const ak = K.popIn(t, tApr, 0.4);
    if (ak > 0) K.drawLabel(ctx, 590, 1052 - 20, Math.min(1.05, ak), { text: P.found || 'Report: still in search', size: 26, dot: true });
    void info.stage;
    return;
  }
}
