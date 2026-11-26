// Scene "app-pulled" (full frame, 1 beat per mode; 2026-11-26: an app store pulls an AI companion app).
// A generic app store is a cartoon shop on a dusk street; the companion app is a rounded app icon with a chat glyph
// and little eyes (no logos, no real people, nothing graphic: any chat content is grey bars under a "BLURRED" bar).
// modes:
//  hook    cold open: at frame 0 the app icon is already lifting off its pedestal in front of the shop, shaking; a
//          REMOVED stamp slams onto it (~0.5 s), it greys out; a WORLDWIDE pill with a globe pops (~1.3 s).
//  story   icon on its pedestal; name pill (nameCue) + maker pill (makerCue); on globeCue the icon is lifted away and
//          the globe's country dots go grey one by one; on reasonCue a reason card (head + blurred bars + lock + text).
//  reports newsroom: two cartoon reporters at a desk; outlet pills a (aCue) and b (bCue); a big phone with blurred
//          chat bubbles gets scanned by a magnifier; `tag` stamp on tagCue, red `kids` pill on kidsCue.
//  numbers counter counts up to `prefix value suffix` (countCue) while a crowd of tiny users fills in; a donut sweeps
//          to `pct` with `pctText`, `pctLabel`, `pctSub` (pctCue); coins drop into it.
//  age     door with an `sign` plate and an age kiosk ("box"); a cartoon kid walks up; `rated` pill (ratedCue);
//          `self` tag + open padlock on the kiosk (weakCue); on typeCue the kid types `typed`, the door swings open.
//  caveat  the shop's pedestal is empty; `q` + `qSub` pill (qCue); a generic tower labelled `maker` with a "..."
//          bubble turning into `noComment` (commentCue); a calendar card `before` with a ghost icon + mini stamp (beforeCue).
// Fits: an app store removes an app; reports about a chatbot app; age-rating / self-reported-age stories.
// params: mode, store, app, stamp, world, maker, globeText, reasonHead, reason, blurred, a, b, tag, kids, value, prefix,
//   suffix, label, pct, pctText, pctLabel, pctSub, sign, box, typed, rated, self, q, qSub, noComment, beforeHead, before
//   + cues (nameCue, makerCue, globeCue, reasonHeadCue, reasonCue, aCue, bCue, tagCue, kidsCue, countCue, pctCue,
//   ratedCue, weakCue, typeCue, qCue, commentCue, beforeCue); without cues the scene uses fractions of its duration.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const TAU = Math.PI * 2, RED = '#ff5a52', GREY = '#7d849c';
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const mode = P.mode || 'hook';
  const APP = '#e8786a';

  function text(str, x, y, kind, size, color, align = 'center') {
    ctx.font = H.font(kind, size); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
  }
  function fitted(str, x, y, kind, size, min, maxW, color, align = 'center') {
    const f = H.fitText(ctx, str, kind, size, min, maxW); ctx.font = f.font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(f.text, x, y);
  }
  function scaleAround(x, y, s, fn) { if (s <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y); fn(); ctx.restore(); }
  function panel(x, y, w, h, stroke) {
    roundRect(ctx, x, y, w, h, 24); ctx.fillStyle = 'rgba(8,10,24,0.92)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = stroke || rgba(ACC, 0.75); roundRect(ctx, x, y, w, h, 24); ctx.stroke();
  }
  // the companion app icon centred at (x, y), side 100*s; o.grey 0..1, o.look, o.blink
  function appIcon(x, y, s, o = {}) {
    const g = clamp(o.grey || 0), col = H.mixHex(APP, '#5b6077', g);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    roundRect(ctx, -50, -50, 100, 100, 26); ctx.fillStyle = col; ctx.fill();
    ctx.save(); roundRect(ctx, -50, -50, 100, 100, 26); ctx.clip();
    ctx.fillStyle = H.mixHex(col, '#000000', 0.18); ctx.fillRect(12, -60, 60, 120);
    ctx.fillStyle = rgba('#ffffff', 0.13); ctx.fillRect(-60, -60, 130, 28);
    ctx.restore();
    // chat glyph: two overlapping bubbles
    ctx.fillStyle = '#ffffff';
    roundRect(ctx, -26, -34, 36, 24, 9); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-16, -12); ctx.lineTo(-22, -2); ctx.lineTo(-6, -11); ctx.fill();
    ctx.fillStyle = rgba('#ffffff', 0.75); roundRect(ctx, -2, -24, 30, 20, 8); ctx.fill();
    // eyes
    const lk = (o.look || 0) * 5, bl = o.blink ? 0.15 : 1;
    for (const ex of [-16, 16]) {
      ctx.beginPath(); ctx.ellipse(ex + lk, 24, 8, 9 * bl, 0, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.beginPath(); ctx.arc(ex + lk * 1.3, 25, 4 * bl, 0, TAU); ctx.fillStyle = '#161927'; ctx.fill();
    }
    ctx.restore();
  }
  const blink = (seed) => ((t + seed) % 3.1) < 0.12;
  // generic shop facade (from app-review-gate): awning, sign board, windows with tiny tiles, lit door, bag emblem
  function shop(x, gy, label, s = 1) {
    ctx.save(); ctx.translate(x, gy); ctx.scale(s, s); ctx.translate(-x, -gy);
    const W = 380, top = gy - 300, COLS = ['#6f86e0', '#4fb3a6', '#a08be0', '#f0a64a', '#6f86e0'];
    K.shadow(ctx, x, gy, W + 60, 0.35);
    roundRect(ctx, x - W / 2, top, W, 300, 10); ctx.fillStyle = '#3a4675'; ctx.fill();
    ctx.fillStyle = '#2e3860'; ctx.fillRect(x + W * 0.2, top, W * 0.3, 300);
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = i % 2 ? '#f2f4fa' : ACC;
      ctx.beginPath(); const x0 = x - W / 2 - 14 + i * (W + 28) / 8, x1 = x0 + (W + 28) / 8;
      ctx.moveTo(x0, top + 70); ctx.lineTo(x1, top + 70); ctx.lineTo(x1, top + 118); ctx.arc((x0 + x1) / 2, top + 118, (x1 - x0) / 2, 0, Math.PI); ctx.closePath(); ctx.fill();
    }
    roundRect(ctx, x - W / 2 + 20, top + 6, W - 40, 58, 10); ctx.fillStyle = '#161a30'; ctx.fill();
    fitted(label, x, top + 36, 'display', 36, 24, W - 80, '#ffffff');
    for (const sx of [-1, 1]) {
      const wx = x + sx * 120;
      roundRect(ctx, wx - 60, top + 150, 120, 90, 8); ctx.fillStyle = '#1c2340'; ctx.fill();
      for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { roundRect(ctx, wx - 48 + c * 34, top + 162 + r * 38, 26, 26, 7); ctx.fillStyle = rgba(COLS[(r * 3 + c + (sx > 0 ? 2 : 0)) % 5], 0.85); ctx.fill(); }
    }
    roundRect(ctx, x - 48, gy - 150, 96, 150, 10); ctx.fillStyle = '#1a1f38'; ctx.fill();
    K.glow(ctx, x, gy - 70, 90, '#ffd98a', 0.18);
    roundRect(ctx, x - 40, gy - 142, 80, 142, 8); ctx.fillStyle = rgba('#ffd98a', 0.22); ctx.fill();
    ctx.restore();
  }
  function pedestal(x, gy, w = 150) {
    K.shadow(ctx, x, gy, w + 30, 0.35);
    roundRect(ctx, x - w / 2, gy - 90, w, 90, 10); ctx.fillStyle = '#2a3156'; ctx.fill();
    roundRect(ctx, x - w / 2 - 12, gy - 104, w + 24, 22, 8); ctx.fillStyle = '#4a5585'; ctx.fill();
  }
  // a small globe badge with n country dots; dead(i) 0..1 greys dot i
  function globeDots(x, y, R, n, dead) {
    K.glow(ctx, x, y, R * 1.6, ACC, 0.12);
    ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.fillStyle = '#2b5fa8'; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, R, 0, TAU); ctx.clip();
    ctx.fillStyle = '#3f7fcf';
    for (let i = 0; i < 5; i++) { const a = H.hash(i, 5) * TAU + t * 0.25, rr = R * (0.2 + 0.6 * H.hash(i, 6)); ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.8, R * 0.35, R * 0.22, a, 0, TAU); ctx.fill(); }
    ctx.restore();
    ctx.strokeStyle = rgba('#ffffff', 0.25); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.ellipse(x, y, R, R * 0.35, 0, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(x, y, R * 0.4, R, 0, 0, TAU); ctx.stroke();
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (i / n) * TAU + 0.3, rr = R * (0.45 + 0.4 * H.hash(i, 9));
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr, d = clamp(dead(i));
      ctx.beginPath(); ctx.arc(px, py, 9, 0, TAU); ctx.fillStyle = H.mixHex(ACC, '#4a5070', d); ctx.fill();
      if (d < 1) { ctx.beginPath(); ctx.arc(px, py, 9 + 8 * (1 - d) * (0.5 + 0.5 * Math.sin(t * 5 + i)), 0, TAU); ctx.strokeStyle = rgba(ACC, 0.5 * (1 - d)); ctx.lineWidth = 2; ctx.stroke(); }
      if (d > 0.5) { ctx.strokeStyle = RED; ctx.lineWidth = 3; ctx.lineCap = 'round'; const k = 5; ctx.beginPath(); ctx.moveTo(px - k, py - k); ctx.lineTo(px + k, py + k); ctx.moveTo(px + k, py - k); ctx.lineTo(px - k, py + k); ctx.stroke(); }
    }
  }
  // blurred message bars (never readable): rows of grey bars with a mosaic shimmer
  function blurBars(x, y, w, rows, alpha = 1) {
    for (let i = 0; i < rows; i++) {
      const bw = w * (i % 3 === 2 ? 0.55 : 0.9);
      ctx.save(); ctx.filter = 'blur(3px)';
      roundRect(ctx, x, y + i * 30, bw, 18, 9); ctx.fillStyle = rgba('#9aa3bf', 0.85 * alpha); ctx.fill();
      ctx.restore();
    }
  }
  function blurredTag(x, y, w) {
    roundRect(ctx, x - w / 2, y - 20, w, 40, 8); ctx.fillStyle = '#0b0d18'; ctx.fill();
    text(P.blurred || 'BLURRED', x, y + 1, 'ui', 22, '#ffffff');
  }
  function crossBadge(x, y, p, r = 24) {
    if (p <= 0) return; const k = H.easeOutBack(clamp(p));
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fillStyle = RED; ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; const q = r * 0.38;
    ctx.beginPath(); ctx.moveTo(-q, -q); ctx.lineTo(q, q); ctx.moveTo(q, -q); ctx.lineTo(-q, q); ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  if (mode === 'hook') drawHook();
  else if (mode === 'story') drawStory();
  else if (mode === 'reports') drawReports();
  else if (mode === 'numbers') drawNumbers();
  else if (mode === 'age') drawAge();
  else drawCaveat();
  ctx.restore();

  // ================================================================ hook
  function drawHook() {
    K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 500, y: 740 }, { t: D, zoom: 1.0 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });
    shop(720, 1000, P.store || 'Store');
    pedestal(400, 1030);
    // inspector points at the icon
    K.drawPerson(ctx, 215, 1035, 1.35, { t, pose: 'point', mood: 'neutral', skin: 2, hair: 1, shirt: '#4fb3a6', hairStyle: 'bun', seed: 7, look: 0.6 });
    // icon is lifting off, shaking, from frame 0; settles hovering
    const lift = H.easeOutCubic(clamp((t + 0.6) / 1.6));
    const sh = t < 1.2 ? Math.sin(t * 46) * 7 * (1 - t / 1.2) : 0;
    const ix = 400 + sh, iy = lerp(860, 690, lift) + K.bob(t, 5, 1.2);
    const tStamp = 0.45, grey = clamp((t - tStamp - 0.1) / 0.5);
    K.glow(ctx, ix, iy, 190, RED, 0.35 * (1 - grey * 0.6) * (0.8 + 0.2 * Math.sin(t * 9)));
    appIcon(ix, iy, 1.9, { grey, look: -0.4, blink: blink(0.3) });
    const nm = K.popIn(t, -0.3, 0.3);
    if (nm > 0) K.drawLabel(ctx, ix, iy - 120, nm, { text: P.app || 'Chat app', size: 30 });
    K.drawStamp(ctx, ix + 40, iy + 140, 1.0, { kind: 'cross', text: P.stamp || 'REMOVED', land: (t - (tStamp - 0.6)) / 0.6 });
    // WORLDWIDE pill with a mini globe
    const wp = K.popIn(t, 1.25, 0.45);
    if (wp > 0) {
      const WX = 690, WY = 600;
      scaleAround(WX, WY, Math.min(1.05, wp), () => {
        ctx.font = H.font('display', 40); const w = ctx.measureText(P.world || 'WORLDWIDE').width + 140;
        roundRect(ctx, WX - w / 2, WY - 42, w, 84, 42); ctx.fillStyle = ACC; ctx.fill();
        globeDots(WX - w / 2 + 50, WY, 28, 5, (i) => (t - 1.5 - i * 0.12) / 0.25);
        text(P.world || 'WORLDWIDE', WX + 30, WY + 2, 'display', 40, '#141829');
      });
    }
  }

  // ================================================================ story
  function drawStory() {
    const tName = at(P.nameCue, 0.4) - 0.1, tMaker = at(P.makerCue, 3.0) - 0.2;
    const tGlobe = at(P.globeCue, D * 0.6) - 0.6, tReason = at(P.reasonCue, D * 0.88);
    const tReasonHead = Math.min(tReason - 1.8, at(P.reasonHeadCue, tReason - 1.8) - 0.2);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 500, y: 760 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });
    shop(690, 1000, P.store || 'Store');
    pedestal(330, 1030);
    // the icon: on its pedestal, then (on the removal line) a hook lifts it up and away to the top-right
    const away = H.easeInOutCubic(clamp((t - (tGlobe - 2.3)) / 1.4));
    const ix = lerp(330, 900, away * away), iy = lerp(870, 420, away) + K.bob(t, 4, 1.1);
    if (away < 1) {
      ctx.save(); ctx.globalAlpha = 1 - clamp((away - 0.7) / 0.3);
      if (away > 0) { ctx.strokeStyle = '#c9cfe0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ix, iy - 95); ctx.lineTo(ix, 300); ctx.stroke();
        ctx.strokeStyle = '#c9cfe0'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(ix, iy - 82, 14, Math.PI * 0.1, Math.PI * 1.2); ctx.stroke(); }
      appIcon(ix, iy, 1.55, { grey: away, look: away > 0 ? -0.6 : 0.4 * Math.sin(t), blink: blink(0.7) });
      ctx.restore();
    } else {
      // empty spot outline on the pedestal
      ctx.save(); ctx.setLineDash([12, 10]); ctx.strokeStyle = rgba('#ffffff', 0.45); ctx.lineWidth = 4;
      roundRect(ctx, 330 - 70, 870 - 70, 140, 140, 32); ctx.stroke(); ctx.restore();
    }
    // name + maker pills above the pedestal
    const np = K.popIn(t, tName, 0.4), mp = K.popIn(t, tMaker, 0.4);
    const pillFade = 1 - clamp((t - (tGlobe - 2.3)) / 0.5);
    if (pillFade > 0) {
      ctx.save(); ctx.globalAlpha = pillFade;
      if (np > 0) K.drawLabel(ctx, 330, 720, np, { text: P.app || 'Chat app', size: 34, accent: true });
      if (mp > 0) K.drawLabel(ctx, 330, 650, mp, { text: P.maker || 'by Company', size: 28 });
      ctx.restore();
    }
    // globe (top-left): its dots grey out one by one on "every country"
    const gp = K.popIn(t, tGlobe - 0.9, 0.45);
    if (gp > 0) {
      scaleAround(300, 560, Math.min(1.05, gp), () => {
        globeDots(300, 560, 105, 9, (i) => (t - tGlobe - i * 0.13) / 0.3);
        const lp = clamp((t - tGlobe - 1.2) / 0.3);
        if (lp > 0) K.drawLabel(ctx, 300, 720, K.popIn(t, tGlobe + 1.2, 0.35), { text: P.globeText || 'Removed in every country', size: 26 });
      });
    }
    // reason card (right)
    const rp = K.popIn(t, tReasonHead, 0.45);
    if (rp > 0) {
      const x0 = 520, x1 = 858, y0 = 430, h = 330;
      scaleAround((x0 + x1) / 2, y0 + h / 2, Math.min(1.04, 0.75 + 0.25 * rp), () => {
        ctx.globalAlpha = clamp(rp * 1.5);
        panel(x0, y0, x1 - x0, h);
        fitted((P.reasonHead || 'Their reason').toUpperCase(), (x0 + x1) / 2, y0 + 40, 'ui', 26, 18, x1 - x0 - 40, rgba('#ffffff', 0.75));
        // a blurred card with a lock
        const cx0 = x0 + 30, cw = x1 - x0 - 60, cy0 = y0 + 70;
        roundRect(ctx, cx0, cy0, cw, 140, 16); ctx.fillStyle = '#e9ecf5'; ctx.fill();
        blurBars(cx0 + 24, cy0 + 22, cw - 48, 4);
        blurredTag(cx0 + cw / 2, cy0 + 70, 150);
        const rv = K.popIn(t, tReason - 0.25, 0.45);
        if (rv > 0) scaleAround((x0 + x1) / 2, y0 + 268, Math.min(1.06, rv), () => {
          roundRect(ctx, x0 + 24, y0 + 238, x1 - x0 - 48, 62, 31); ctx.fillStyle = ACC; ctx.fill();
          fitted(P.reason || 'Reason', (x0 + x1) / 2, y0 + 270, 'display', 34, 22, x1 - x0 - 90, '#141829');
        });
        ctx.globalAlpha = 1;
      });
    }
  }

  // ================================================================ reports
  function drawReports() {
    const tA = at(P.aCue, 1.4) - 0.2, tB = at(P.bCue, 3.2) - 0.2, tTag = at(P.tagCue, D * 0.5) - 0.15;
    const tKids = at(P.kidsCue, D * 0.92) - 0.3;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 480, y: 760 }]);
    K.world.office(ctx, { t, time: 'night' });
    // two reporters at a desk
    K.drawDesk(ctx, 270, 1035, 1.1);
    K.drawPerson(ctx, 175, 1000, 1.2, { t, pose: 'sit-laptop', typing: t < tTag ? 1.2 : 0, mood: t > tKids ? 'worried' : 'neutral', skin: 1, hair: 3, shirt: '#a08be0', hairStyle: 'long', seed: 21, look: 0.5 });
    K.drawPerson(ctx, 370, 1000, 1.2, { t, pose: 'sit-laptop', typing: t < tTag ? 1.6 : 0, mood: t > tKids ? 'worried' : 'neutral', skin: 3, hair: 0, shirt: '#4fb3a6', hairStyle: 'short', seed: 22, look: 0.5, flip: false });
    K.drawLaptop(ctx, 190, 935, 0.55, { t, screen: 'chat', typing: 1 });
    K.drawLaptop(ctx, 355, 935, 0.55, { t, screen: 'code', typing: 1 });
    // outlet pills (top, stacked)
    const ap = K.popIn(t, tA, 0.4), bp = K.popIn(t, tB, 0.4);
    if (ap > 0) K.drawLabel(ctx, 300, 500, ap, { text: P.a || 'Outlet A', size: 30, dot: true });
    if (bp > 0) K.drawLabel(ctx, 487, 572, bp, { text: P.b || 'Outlet B', size: 27, dot: true });
    // the phone with blurred chat bubbles
    const PX0 = 545, PX1 = 860, PY0 = 600, PY1 = 1030, cx = (PX0 + PX1) / 2;
    ctx.save(); ctx.translate(0, K.bob(t, 3, 1.0));
    roundRect(ctx, PX0 - 4, PY0 + 10, PX1 - PX0 + 8, PY1 - PY0, 40); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    roundRect(ctx, PX0, PY0, PX1 - PX0, PY1 - PY0, 38); ctx.fillStyle = '#0e1122'; ctx.fill();
    roundRect(ctx, PX0 + 12, PY0 + 12, PX1 - PX0 - 24, PY1 - PY0 - 24, 28); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    appIcon(PX0 + 52, PY0 + 52, 0.42, { blink: blink(1.1) });
    text(P.app || 'AI character', PX0 + 84, PY0 + 54, 'ui', 24, '#141829', 'left');
    const rows = [[0, 2], [1, 1], [0, 2], [1, 1]];
    let y = PY0 + 100;
    rows.forEach(([me, n], i) => {
      const p = K.popIn(t, 0.2 + i * 0.5, 0.35); if (p <= 0) { y += n * 30 + 34; return; }
      const bw = 200, bh = n * 30 + 14, bx = me ? PX1 - 28 - bw : PX0 + 28;
      ctx.save(); ctx.globalAlpha = clamp(p * 1.5);
      roundRect(ctx, bx, y, bw, bh, 16); ctx.fillStyle = me ? '#4f8cff' : '#ffffff'; ctx.fill();
      if (!me) { ctx.lineWidth = 2; ctx.strokeStyle = '#d5dae8'; ctx.stroke(); blurBars(bx + 16, y + 12, bw - 32, n); }
      else { roundRect(ctx, bx + 16, y + 12, bw * 0.6, 16, 8); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fill(); }
      ctx.restore();
      y += bh + 20;
    });
    blurredTag(cx, PY0 + 250, 170);
    ctx.restore();
    // magnifier sweeps the phone from the first outlet cue
    const mt = clamp((t - tA) / Math.max(1, tTag - tA));
    if (t > tA) {
      const mx = cx + Math.sin(mt * Math.PI * 2.2) * 80, my = lerp(PY0 + 140, PY0 + 330, mt);
      ctx.save(); ctx.globalAlpha = clamp((t - tA) / 0.4);
      ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 16; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(mx + 44, my + 44); ctx.lineTo(mx + 92, my + 92); ctx.stroke();
      ctx.beginPath(); ctx.arc(mx, my, 58, 0, TAU); ctx.fillStyle = rgba('#bfe0ff', 0.25); ctx.fill();
      ctx.lineWidth = 10; ctx.strokeStyle = '#c9cfe0'; ctx.stroke();
      ctx.restore();
    }
    // REPORTED stamp on the phone, then the kids pill
    K.drawStamp(ctx, cx + 10, PY0 + 430, 0.95, { kind: 'cross', text: P.tag || 'REPORTED', land: (t - tTag) / 0.6 });
    const kp = K.popIn(t, tKids, 0.45);
    if (kp > 0) scaleAround(cx, 650, Math.min(1.06, kp), () => {
      ctx.font = H.font('display', 32); const w = ctx.measureText(P.kids || 'Sent to kids').width + 100;
      roundRect(ctx, cx - w / 2, 618, w, 66, 33); ctx.fillStyle = RED; ctx.fill();
      K.drawWarning(ctx, cx - w / 2 + 40, 668, 0.3, { pulse: t });
      text(P.kids || 'Sent to kids', cx + 20, 652, 'display', 32, '#ffffff');
    });
  }

  // ================================================================ numbers
  function drawNumbers() {
    const tCount = at(P.countCue, 2.6) - 0.5, tPct = at(P.pctCue, D * 0.7) - 0.6;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 740 }]);
    K.world.room(ctx, { t, time: 'night', lamp: false, window: true, picture: false, plant: true });
    // counter panel (left)
    const L0 = 120, L1 = 470;
    const cp = K.popIn(t, tCount - 0.35, 0.45);
    if (cp > 0) scaleAround((L0 + L1) / 2, 520, Math.min(1.04, cp), () => {
      panel(L0, 440, L1 - L0, 170);
      const v = P.value || 10, k = H.easeOutCubic(clamp((t - tCount) / 1.4));
      const shown = (P.prefix || '') + Math.round(v * k) + (P.suffix || '');
      fitted(shown, (L0 + L1) / 2, 510, 'display', 84, 40, L1 - L0 - 40, ACC);
      fitted(P.label || 'users', (L0 + L1) / 2, 578, 'ui', 26, 18, L1 - L0 - 40, '#ffffff');
    });
    // crowd of tiny users (fills as the counter runs)
    const cols = 7, rows = 6, fill = clamp((t - tCount) / 1.6);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c, on = clamp(fill * cols * rows - i);
      const x = L0 + 25 + c * ((L1 - L0 - 50) / (cols - 1)), y = 690 + r * 58 + K.bob(t, 2, 1.5, i * 0.7);
      ctx.save(); ctx.globalAlpha = 0.25 + 0.75 * on;
      const col = on > 0.5 ? ['#6f86e0', '#4fb3a6', '#a08be0', '#f0a64a', '#e8786a'][i % 5] : '#3a4160';
      ctx.beginPath(); ctx.arc(x, y, 11, 0, TAU); ctx.fillStyle = on > 0.5 ? '#f1c7a0' : '#3a4160'; ctx.fill();
      roundRect(ctx, x - 15, y + 13, 30, 26, 12); ctx.fillStyle = col; ctx.fill();
      ctx.restore();
    }
    // a phone in front of the crowd with the app
    appIcon(295, 1045 - 60 + K.bob(t, 4, 1.0), 0.7, { blink: blink(0.2) });
    // donut (right)
    const dp = K.popIn(t, tPct - 0.4, 0.45);
    const R0 = 690, RY = 640, RR = 130;
    if (dp > 0) scaleAround(R0, RY, Math.min(1.05, dp), () => {
      ctx.lineWidth = 46; ctx.lineCap = 'butt';
      ctx.beginPath(); ctx.arc(R0, RY, RR, 0, TAU); ctx.strokeStyle = '#2a3050'; ctx.stroke();
      const sw = H.easeInOutCubic(clamp((t - tPct) / 1.2)) * (P.pct || 50) / 100;
      if (sw > 0) { ctx.beginPath(); ctx.arc(R0, RY, RR, -Math.PI / 2, -Math.PI / 2 + sw * TAU); ctx.strokeStyle = ACC; ctx.stroke(); }
      fitted(sw > 0 ? (P.pctText || '50%') : '', R0, RY + 4, 'display', 64, 36, RR * 1.5, '#ffffff');
      // coins drop into the ring
      for (let i = 0; i < 4; i++) {
        const ct = (t - tPct - 0.2 - i * 0.35);
        if (ct > 0 && ct < 0.9) { const k = ct / 0.9; K.drawCoin(ctx, R0 - 60 + i * 40, lerp(430, RY - 40, k * k) + 32, 0.6, { spin: t * 6 + i }); }
      }
    });
    const lp = K.popIn(t, tPct + 0.5, 0.45);
    if (lp > 0) {
      ctx.save(); ctx.globalAlpha = clamp(lp * 1.5);
      const lines = H.wrap(ctx, P.pctLabel || 'of revenue', 'bold', 32, 340);
      lines.forEach((ln, i) => text(ln, R0, 830 + i * 40, 'bold', 32, '#ffffff'));
      const sy = 830 + lines.length * 40 + 30;
      if (P.pctSub) K.drawLabel(ctx, R0, sy + 24, lp, { text: P.pctSub, size: 22 });
      ctx.restore();
    }
  }

  // ================================================================ age
  function drawAge() {
    const tRated = at(P.ratedCue, 1.6) - 0.2, tWeak = at(P.weakCue, D * 0.6) - 0.4, tType = at(P.typeCue, D * 0.84) - 0.2;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 520, y: 760 }]);
    const room = K.world.room(ctx, { t, time: 'night', lamp: true, window: false, picture: false, plant: false });
    const FY = 1035;
    // the door (right) with the plate
    const DX = 720, DW = 210, DH = 390, dTop = FY - DH;
    roundRect(ctx, DX - DW / 2 - 18, dTop - 18, DW + 36, DH + 18, 12); ctx.fillStyle = '#2a2f4a'; ctx.fill();
    const open = H.easeInOutCubic(clamp((t - tType - 0.5) / 0.5));
    // light behind the door
    ctx.save(); ctx.globalAlpha = open; roundRect(ctx, DX - DW / 2, dTop, DW, DH, 6); ctx.fillStyle = '#ffe3a1'; ctx.fill(); ctx.restore();
    if (open > 0) K.glow(ctx, DX, FY - DH / 2, 230, '#ffd98a', 0.25 * open);
    const dw = DW * (1 - 0.82 * open);
    roundRect(ctx, DX - DW / 2, dTop, dw, DH, 6); ctx.fillStyle = '#6a4a3a'; ctx.fill();
    roundRect(ctx, DX - DW / 2 + dw * 0.12, dTop + 30, dw * 0.76, DH * 0.38, 6); ctx.fillStyle = '#5a3d30'; ctx.fill();
    roundRect(ctx, DX - DW / 2 + dw * 0.12, dTop + DH * 0.5, dw * 0.76, DH * 0.4, 6); ctx.fillStyle = '#5a3d30'; ctx.fill();
    ctx.beginPath(); ctx.arc(DX - DW / 2 + dw * 0.86, FY - DH * 0.48, 9, 0, TAU); ctx.fillStyle = '#e8c06a'; ctx.fill();
    // plate above the door
    roundRect(ctx, DX - 85, dTop - 108, 170, 76, 14); ctx.fillStyle = RED; ctx.fill();
    text(P.sign || '18+', DX, dTop - 68, 'display', 50, '#ffffff');
    // kiosk (middle) with an age box
    const KX = 450, kTop = 690;
    roundRect(ctx, KX - 14, kTop + 170, 28, FY - kTop - 170, 6); ctx.fillStyle = '#3a4160'; ctx.fill();
    roundRect(ctx, KX - 60, FY - 16, 120, 16, 6); ctx.fill();
    roundRect(ctx, KX - 120, kTop, 240, 180, 18); ctx.fillStyle = '#1b2140'; ctx.fill();
    roundRect(ctx, KX - 108, kTop + 12, 216, 156, 12); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    fitted(P.box || 'Enter your age', KX, kTop + 46, 'bold', 26, 18, 196, '#141829');
    roundRect(ctx, KX - 70, kTop + 74, 140, 62, 10); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#4f8cff'; ctx.stroke();
    const typed = String(P.typed || '18'), nShown = Math.min(typed.length, Math.max(0, Math.floor((t - tType) / 0.22) + 1));
    const shownTxt = t >= tType ? typed.slice(0, nShown) : '';
    text(shownTxt + ((t * 2) % 1 < 0.5 && nShown < typed.length ? '|' : ''), KX, kTop + 106, 'display', 40, '#141829');
    if (t > tType + 0.6) { const k = clamp((t - tType - 0.6) / 0.3); ctx.save(); ctx.strokeStyle = '#2f9e5b'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; K.pathDraw(ctx, [[KX + 80, kTop + 100], [KX + 92, kTop + 114], [KX + 116, kTop + 86]], k); ctx.restore(); }
    // self-reported tag + an open padlock on the kiosk
    const wp = K.popIn(t, tWeak, 0.45);
    if (wp > 0) {
      K.drawLock(ctx, KX - 150, kTop + 150, 0.62 * Math.min(1.05, wp), { open: 1 });
      K.drawLabel(ctx, KX, kTop - 24, wp, { text: P.self || 'Self-reported', size: 28, accent: true });
    }
    // rated pill (top)
    const rp = K.popIn(t, tRated, 0.45);
    if (rp > 0) K.drawLabel(ctx, 487, 520, rp, { text: P.rated || 'Rated 18+', size: 30, dot: true });
    // the kid walks in, stops at the kiosk, then walks through the door
    const walkIn = H.easeOutCubic(clamp(t / 2.0));
    const walkOut = H.easeInOutCubic(clamp((t - tType - 0.75) / 0.8));
    const kx = lerp(lerp(120, 330, walkIn), DX - 10, walkOut);
    const walking = (t < 2.0) || (walkOut > 0 && walkOut < 1);
    ctx.save(); ctx.globalAlpha = 1 - 0.35 * walkOut;
    K.drawPerson(ctx, kx, FY, 1.05, { t, pose: t > tType - 0.2 && walkOut === 0 ? 'point' : 'stand', walk: walking ? t : 0,
      mood: 'happy', skin: 1, hair: 2, shirt: '#f0a64a', hairStyle: 'curly', seed: 41, look: 0.6 });
    ctx.restore();
    void room;
  }

  // ================================================================ caveat
  function drawCaveat() {
    const tQ = at(P.qCue, 2.0) - 0.9, tC = at(P.commentCue, 3.9) - 0.6, tB = at(P.beforeCue, D * 0.75) - 1.0;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 760 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });
    const dimAll = 0.45 * clamp((t - tB) / 0.4);
    shop(290, 1000, P.store || 'Store', 0.78);
    // empty pedestal spot in front of the shop
    pedestal(290, 1040, 120);
    ctx.save(); ctx.setLineDash([10, 9]); ctx.strokeStyle = rgba('#ffffff', 0.5); ctx.lineWidth = 4;
    roundRect(ctx, 290 - 52, 880, 104, 104, 26); ctx.stroke(); ctx.restore();
    // company tower (right)
    K.drawBuilding(ctx, 700, 1010, 0.95, { t, color: '#46507e', floors: 8, lit: 0.6 + 0.2 * Math.sin(t * 0.7) });
    K.drawLabel(ctx, 700, 560, 1, { text: P.maker || 'Company', size: 28 });
    // question pill above the shop
    const qp = K.popIn(t, tQ, 0.45);
    if (qp > 0) scaleAround(290, 520, Math.min(1.05, qp), () => {
      panel(125, 440, 400, 150, rgba('#ffffff', 0.4));
      text('?', 180, 515, 'display', 76, ACC);
      fitted(P.q || 'Question?', 355, 492, 'display', 36, 22, 290, '#ffffff');
      fitted(P.qSub || '', 355, 548, 'bold', 28, 18, 290, rgba('#ffffff', 0.8));
    });
    // "..." bubble from the tower, turning into "No comment"
    const bp = K.popIn(t, tC - 1.0, 0.4);
    if (bp > 0) {
      const done = t > tC + 0.3;
      const dots = '.'.repeat(1 + Math.floor((t * 3) % 3));
      K.drawSpeechBubble(ctx, 640, 660, 1, { text: done ? (P.noComment || 'No comment') : dots, size: 32, tail: 'right', pop: Math.min(1.05, bp) });
      if (done) crossBadge(760, 600, (t - tC - 0.3) / 0.3, 22);
    }
    // dim + calendar card "pulled once before"
    if (dimAll > 0) { ctx.fillStyle = rgba('#05060d', dimAll); ctx.fillRect(0, 0, 1080, 1920); }
    const cp = K.popIn(t, tB, 0.5);
    if (cp > 0) scaleAround(487, 760, Math.min(1.04, 0.7 + 0.3 * cp), () => {
      ctx.globalAlpha = clamp(cp * 1.5);
      const x0 = 190, x1 = 785, y0 = 640, h = 250;
      roundRect(ctx, x0, y0, x1 - x0, h, 24); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      ctx.save(); roundRect(ctx, x0, y0, x1 - x0, h, 24); ctx.clip(); ctx.fillStyle = RED; ctx.fillRect(x0, y0, x1 - x0, 62); ctx.restore();
      for (const rx of [x0 + 90, x1 - 90]) { roundRect(ctx, rx - 8, y0 - 16, 16, 40, 8); ctx.fillStyle = '#3a4160'; ctx.fill(); }
      text(P.beforeHead || 'HAPPENED BEFORE', (x0 + x1) / 2, y0 + 32, 'ui', 26, '#ffffff');
      appIcon(x0 + 95, y0 + 160, 0.95, { grey: 0.7, blink: blink(0.5) });
      const sp = clamp((t - tB - 0.5) / 0.5);
      if (sp > 0) crossBadge(x0 + 140, y0 + 120, sp, 26);
      const lines = H.wrap(ctx, P.before || 'Pulled once before', 'display', 38, 360);
      lines.forEach((ln, i) => text(ln, x0 + 175, y0 + 130 + i * 46 - (lines.length - 1) * 23 + 10, 'display', 38, '#141829', 'left'));
      ctx.globalAlpha = 1;
    });
  }
}
