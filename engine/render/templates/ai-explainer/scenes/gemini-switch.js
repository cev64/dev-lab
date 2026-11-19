// Scene "gemini-switch" (full frame; story scene for "chat history vs AI training" settings stories, written
// 2026-11-19 for the Gemini history/training split). Generic phone-style settings card (plain-text app name, no logo),
// chat cards as grey bubble bars (no readable content), a filing cabinet whose drawer label says how long chats are kept,
// the kit robot as the records clerk, a generic "AI training" hopper machine. Modes:
//   hook   night living room: a hand flips the History toggle OFF; a chat card pops off the phone card, the robot
//          files it into a drawer labelled `drawer` ("~2 MONTHS"); a "kept" pill. Peak inside ~2.5 s (cold open).
//   split  one big "Keep Activity" row cracks into two rows (History / AI training) on splitCue; rows light on
//          historyCue / trainingCue; "Was off? Both start off" pill on wasCue; globe pill on rollCue.
//   keep   phone card (History + chat list + AI training) beside a training hopper; chat cards feed the hopper;
//          on oldCue both toggles go off and the list empties (the old way); on nowCue both return; on optCue the
//          training toggle flips off and a shutter closes the hopper; "Keep history + skip training" pill.
//   catch  records room: two timeline bars (before / now) and a big cabinet; the drawer plate reads `before` on oldCue
//          then flips to `after` on nowCue as the long bar grows; calendar pages tear off; a dashed "Temporary"
//          card is filed on tempCue.
//   why    the robot sweeps a magnifier over chat cards above an open drawer; one turns red on abuseCue and a shield
//          ticks; "not for training" stamp on noCue; "Unless you send feedback" pill on feedbackCue.
//   caveat a cartoon reviewer takes a card from the drawer into a padlocked "Reviewed" box (reviewCue), "Up to 3 years"
//          tag (boxCue), the drawer's cards puff away but the box stays (deleteCue), then a History-ON calendar card
//          "Auto-deletes: 18 months" (keepCue / monthsCue).
// params: mode, app ("Gemini"), drawer ("~2 MONTHS"), before ("72 HOURS"), after ("~2 MONTHS"), plus the cues above and
//   text overrides: kept, oldRow, rowA, rowB, roll, was, keepPill, beforeLabel, afterLabel, temp, why, no, feedback,
//   reviewed, years, deleted, months.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, rgba, mixHex, easeInOutCubic } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const mode = P.mode || 'hook';
  const APP = P.app || 'Gemini';
  const GREEN = '#3fbf7f', RED = '#ff6b5e', INK = '#1b1f33', CARD = '#f2f4fa';
  const pop = (d, dur) => Math.min(1.04, K.popIn(t, d, dur || 0.45));

  // ---------------------------------------------------------------- shared pieces
  const toggle = (x, y, on, s = 1, glowOn = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (glowOn > 0) K.glow(ctx, 0, 0, 70, GREEN, 0.35 * glowOn);
    roundRect(ctx, -42, -25, 84, 50, 25); ctx.fillStyle = on > 0.5 ? GREEN : '#c3c9da'; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(lerp(-17, 17, on), 0, 20, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
  const textFit = (txt, kind, size, maxW) => { let fs = size; ctx.font = H.font(kind, fs); while (fs > 18 && ctx.measureText(txt).width > maxW) { fs -= 1; ctx.font = H.font(kind, fs); } return fs; };
  // phone-style settings card: frame + header with the app name
  const cardFrame = (x0, y0, w, h, title, sub) => {
    roundRect(ctx, x0 + 8, y0 + 12, w, h, 34); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    roundRect(ctx, x0 - 12, y0 - 12, w + 24, h + 24, 40); ctx.fillStyle = '#1c2033'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#3b4260'; ctx.stroke();
    roundRect(ctx, x0, y0, w, h, 30); ctx.fillStyle = CARD; ctx.fill();
    ctx.save(); roundRect(ctx, x0, y0, w, h, 30); ctx.clip();
    ctx.fillStyle = '#262b45'; ctx.fillRect(x0, y0, w, 96);
    ctx.restore();
    // sparkle-free generic app mark: a rounded square with two dots
    roundRect(ctx, x0 + 24, y0 + 24, 48, 48, 14); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = K.ACCENT.deep; ctx.beginPath(); ctx.arc(x0 + 40, y0 + 48, 5, 0, Math.PI * 2); ctx.arc(x0 + 56, y0 + 48, 5, 0, Math.PI * 2); ctx.fill();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = H.font('display', 32); ctx.fillStyle = '#ffffff'; ctx.fillText(title, x0 + 88, y0 + (sub ? 38 : 48));
    if (sub) { ctx.font = H.font('ui', 22); ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText(sub, x0 + 88, y0 + 70); }
  };
  const settingRow = (x0, w, y, label, on, o = {}) => {
    ctx.save(); ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    if (o.hl > 0) { roundRect(ctx, x0 + 12, y - 44, w - 24, 88, 22); ctx.fillStyle = rgba(ACC, 0.28 * o.hl); ctx.fill(); }
    let tx = x0 + 32;
    if (o.icon) { icon(o.icon, x0 + 56, y); tx = x0 + 96; }
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = INK;
    textFit(label, 'ui', o.size || 32, w - (tx - x0) - 130); ctx.fillText(label, tx, y + 1);
    toggle(x0 + w - 70, y, on, o.ts || 1, o.glow || 0);
    ctx.restore();
  };
  const icon = (kind, x, y) => {
    ctx.save(); ctx.translate(x, y);
    roundRect(ctx, -26, -26, 52, 52, 14); ctx.fillStyle = kind === 'train' ? '#e7e0ff' : '#dff3ea'; ctx.fill();
    ctx.strokeStyle = kind === 'train' ? '#6b55c9' : '#2f8f62'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    if (kind === 'history') { // clock
      ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 0); ctx.lineTo(7, 5); ctx.stroke();
    } else { // gear-ish brain: circle with spokes
      ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + t * 0.6; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12); ctx.lineTo(Math.cos(a) * 18, Math.sin(a) * 18); ctx.stroke(); }
    }
    ctx.restore();
  };
  // a chat card: two grey bubble bars, no readable content
  const chatCard = (x, y, s, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    if (o.glowA) K.glow(ctx, 0, 0, 110, o.flag ? RED : ACC, 0.35 * o.glowA);
    roundRect(ctx, -75, -48, 150, 96, 16); ctx.fillStyle = o.flag ? '#ffe1dc' : '#ffffff'; ctx.fill();
    if (o.temp) { ctx.setLineDash([10, 8]); ctx.lineWidth = 4; ctx.strokeStyle = '#6b55c9'; roundRect(ctx, -75, -48, 150, 96, 16); ctx.stroke(); ctx.setLineDash([]); }
    else { ctx.lineWidth = 2; ctx.strokeStyle = o.flag ? RED : '#c9cfe0'; roundRect(ctx, -75, -48, 150, 96, 16); ctx.stroke(); }
    roundRect(ctx, -60, -32, 82, 24, 12); ctx.fillStyle = '#d5dae8'; ctx.fill();
    roundRect(ctx, -12, 6, 72, 24, 12); ctx.fillStyle = o.flag ? RED : mixHex(ACC, '#ffffff', 0.15); ctx.fill();
    if (o.flag) { ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(52, -26, 14, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = H.font('display', 20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 52, -25); }
    ctx.restore();
  };
  // filing cabinet ~220x330 at scale 1, anchored bottom-centre. o: open (0..1), label, hl (0..1), contents (n cards)
  const cabinet = (x, y, s, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 260);
    roundRect(ctx, -110, -330, 220, 330, 14); ctx.fillStyle = '#56607f'; ctx.fill();
    ctx.fillStyle = '#4a5372'; ctx.fillRect(40, -322, 62, 316);
    roundRect(ctx, -118, -342, 236, 22, 8); ctx.fillStyle = '#6b7596'; ctx.fill();
    // lower drawer
    roundRect(ctx, -94, -150, 188, 130, 10); ctx.fillStyle = '#65709a'; ctx.fill();
    roundRect(ctx, -34, -96, 68, 14, 7); ctx.fillStyle = '#c9cfe0'; ctx.fill();
    // top drawer: opens towards the viewer (slides down + grows, dark gap above with the files)
    const op = o.open || 0;
    const dy = 30 * op, ds = 1 + 0.06 * op;
    if (op > 0.01) {
      roundRect(ctx, -100, -314, 200, 150, 10); ctx.fillStyle = '#20253a'; ctx.fill();
      const n = o.contents == null ? 3 : o.contents;
      for (let i = 0; i < n; i++) { roundRect(ctx, -84 + i * 10, -300 + dy * 0.4 + i * 3, 168 - i * 20, 70, 6); ctx.fillStyle = i % 2 ? '#e9ecf6' : '#ffffff'; ctx.fill(); }
    }
    ctx.save(); ctx.translate(0, -240 + dy); ctx.scale(ds, ds);
    roundRect(ctx, -94, -70, 188, 140, 10); ctx.fillStyle = '#7480a8'; ctx.fill();
    // label plate
    const hl = o.hl || 0;
    if (hl > 0) K.glow(ctx, 0, -24, 120, ACC, 0.45 * hl);
    roundRect(ctx, -80, -52, 160, 54, 8); ctx.fillStyle = hl > 0.5 ? ACC : '#f2f4fa'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#3b4260'; ctx.stroke();
    const lab = o.label || '';
    ctx.fillStyle = hl > 0.5 ? K.ACCENT.deep : INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    textFit(lab, 'display', 30, 146); ctx.fillText(lab, 0, -24);
    roundRect(ctx, -34, 28, 68, 14, 7); ctx.fillStyle = '#c9cfe0'; ctx.fill();
    ctx.restore();
    ctx.restore();
    return { mouthX: x, mouthY: y - (300 - 0) * s };
  };
  const hand = (x, y, press, alpha = 1) => {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y + 8 * press); ctx.rotate(-0.35);
    ctx.fillStyle = '#eab894'; ctx.strokeStyle = '#7a4a30'; ctx.lineWidth = 3;
    roundRect(ctx, -11, -10, 22, 50, 11); ctx.fill(); ctx.stroke();
    roundRect(ctx, -22, 26, 56, 60, 18); ctx.fill(); ctx.stroke();
    ctx.restore();
  };
  const ring = (x, y, t0, color) => { const r = (t - t0) / 0.5; if (r > 0 && r < 1) { ctx.strokeStyle = rgba(color || ACC, 1 - r); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y, 26 + 60 * r, 0, Math.PI * 2); ctx.stroke(); } };
  const calendar = (x, y, s, head, big, sub) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    roundRect(ctx, -92, -100, 184, 200, 16); ctx.fillStyle = '#ffffff'; ctx.fill();
    roundRect(ctx, -92, -100, 184, 50, 16); ctx.fillStyle = RED; ctx.fill(); ctx.fillRect(-92, -70, 184, 20);
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('ui', 22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(head, 0, -74);
    ctx.fillStyle = INK; textFit(big, 'display', 64, 160); ctx.fillText(big, 0, 8);
    if (sub) { ctx.fillStyle = '#59607a'; textFit(sub, 'ui', 24, 160); ctx.fillText(sub, 0, 66); }
    ctx.restore();
  };
  // generic "AI training" hopper machine, anchored bottom-centre; shut 0..1 closes a shutter over the mouth
  const hopper = (x, y, s, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 300);
    const act = o.active == null ? 1 : o.active;
    roundRect(ctx, -130, -250, 260, 250, 24); ctx.fillStyle = '#3a3f6b'; ctx.fill();
    ctx.fillStyle = '#323660'; ctx.fillRect(40, -240, 80, 230);
    // funnel
    ctx.beginPath(); ctx.moveTo(-150, -420); ctx.lineTo(150, -420); ctx.lineTo(60, -250); ctx.lineTo(-60, -250); ctx.closePath(); ctx.fillStyle = '#6b55c9'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-150, -420); ctx.lineTo(150, -420); ctx.lineTo(140, -400); ctx.lineTo(-140, -400); ctx.closePath(); ctx.fillStyle = '#8a76e0'; ctx.fill();
    // gears
    for (const [gx, gy, r, dir] of [[-50, -140, 46, 1], [50, -95, 34, -1]]) {
      ctx.save(); ctx.translate(gx, gy); ctx.rotate(t * 2.2 * dir * act);
      ctx.fillStyle = '#b9b0f0'; for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * Math.PI / 4); ctx.fillRect(-7, -r - 10, 14, 16); ctx.restore(); }
      ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#3a3f6b'; ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // status lamp
    const lampOn = act > 0.5 && Math.sin(t * 7) > 0;
    ctx.fillStyle = lampOn ? GREEN : '#555b7a'; ctx.beginPath(); ctx.arc(-90, -215, 12, 0, Math.PI * 2); ctx.fill();
    // shutter
    const sh = o.shut || 0;
    if (sh > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(-160, -440, 320, 50 * sh + 4); ctx.clip();
      roundRect(ctx, -158, -440, 316, 54, 10); ctx.fillStyle = '#d5dae8'; ctx.fill();
      ctx.strokeStyle = '#9aa3bd'; ctx.lineWidth = 3; for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-150, -440 + i * 13); ctx.lineTo(150, -440 + i * 13); ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();
  };
  const xMark = (x, y, r, k) => {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.08, k), Math.min(1.08, k));
    ctx.strokeStyle = RED; ctx.lineWidth = 16; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-r, -r); ctx.lineTo(r, r); ctx.moveTo(r, -r); ctx.lineTo(-r, r); ctx.stroke();
    ctx.restore();
  };
  const magnifier = (x, y, s) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = '#3b4260'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(36, 36); ctx.lineTo(80, 80); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fillStyle = 'rgba(180,220,255,0.22)'; ctx.fill();
    ctx.lineWidth = 9; ctx.strokeStyle = '#3b4260'; ctx.stroke();
    ctx.beginPath(); ctx.arc(-14, -16, 14, Math.PI * 1.1, Math.PI * 1.6); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 5; ctx.stroke();
    ctx.restore();
  };
  const arcPos = (x0, y0, x1, y1, u, h) => [lerp(x0, x1, u), lerp(y0, y1, u) - Math.sin(u * Math.PI) * h];

  // ================================================================ modes
  if (mode === 'hook') {
    const tOff = 0.4, tPop = 0.7, tHand = 1.25, tIn = 1.75, tShut = 2.15, tKept = 2.35;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 500, y: 760 }, { t: D, zoom: 1.06, x: 520, y: 760 }]);
    const room = K.world.livingRoomNight(ctx, { t, lampOn: true });
    const fy = room.sofa.feetY;
    K.drawPerson(ctx, 290, fy, 1.45, { pose: 'sit-phone', seat: false, t, mood: t > tKept ? 'worried' : 'neutral', skin: 1, hair: 2, shirt: 3, hairStyle: 'long', seed: 31, look: t > tPop ? 0.9 : 0.4 });
    // cabinet + robot clerk (right)
    const op = smooth((t - (tPop + 0.2)) / 0.4) * (1 - smooth((t - tShut) / 0.3));
    const hl = smooth((t - tShut) / 0.3);
    cabinet(805, 1035, 0.88, { open: op, label: P.drawer || '~2 MONTHS', hl, contents: 3 });
    K.drawRobot(ctx, 625, 1040, 1.0, { t, state: t < tShut ? 'working' : 'happy', seed: 4 });
    ctx.restore();
    // settings card
    const x0 = 375, y0 = 430, w = 440, h = 220;
    cardFrame(x0, y0, w, h, APP, 'Settings');
    const off = smooth((t - tOff) / 0.3);
    settingRow(x0, w, y0 + 158, P.rowA || 'History', 1 - off, { icon: 'history', size: 32 });
    ring(x0 + w - 70, y0 + 158, tOff, '#ffffff');
    // hand presses the toggle at tOff, then leaves
    const press = clamp(1 - Math.abs(t - tOff) / 0.15), hout = smooth((t - tOff - 0.35) / 0.5);
    if (hout < 1) hand(x0 + w - 60 + hout * 120, y0 + 180 + hout * 140, press, 1 - hout);
    // chat card: lifts off the card, arcs to the robot, then into the drawer
    if (t > tPop) {
      const a = H.phase(t, tPop, tHand, easeInOutCubic), b = H.phase(t, tHand + 0.1, tIn, easeInOutCubic);
      let [cx, cy] = arcPos(x0 + 160, y0 + 120, 690, 850, a, 120);
      let s = lerp(0.9, 0.8, a);
      if (b > 0) { [cx, cy] = arcPos(690, 850, 805, 780, b, 70); s = lerp(0.8, 0.45, b); }
      const vis = 1 - smooth((t - tIn) / 0.15);
      if (vis > 0) chatCard(cx, cy, s * Math.min(1, K.popIn(t, tPop, 0.3)), { rot: 0.15 * Math.sin(a * Math.PI), alpha: vis, glowA: 1 - b });
    }
    const kp = pop(tKept, 0.45);
    if (kp > 0) K.drawLabel(ctx, 780, 690, kp, { text: P.kept || 'Still kept', size: 30, accent: true });
    return;
  }

  if (mode === 'split') {
    const tSplit = at(P.splitCue, D * 0.3) - 0.15, tHist = at(P.historyCue, D * 0.42) - 0.1, tTrain = at(P.trainingCue, D * 0.5) - 0.1;
    const tWas = at(P.wasCue, D * 0.6) - 0.1, tRoll = at(P.rollCue, D * 0.8) - 0.2;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 480, y: 730 }]);
    K.world.room(ctx, { t, time: 'night', lamp: true, window: true, picture: false, plant: false });
    // person on the right pointing at the card
    K.drawPerson(ctx, 815, 1040, 1.2, { t, pose: t > tHist && t < tWas + 1 ? 'point' : 'stand', mood: t > tWas ? 'happy' : 'neutral', skin: 1, hair: 2, shirt: 3, hairStyle: 'long', seed: 31, look: -1, flip: true, talk: 0 });
    ctx.restore();
    const x0 = 130, w = 500, y0 = 560, h = 430;
    const cp = pop(0, 0.45);
    ctx.save(); ctx.translate(x0 + w / 2, y0 + h); ctx.scale(cp, cp); ctx.translate(-(x0 + w / 2), -(y0 + h));
    cardFrame(x0, y0, w, h, APP, 'Activity settings');
    const sp = H.phase(t, tSplit, tSplit + 0.6, easeInOutCubic);
    const oldA = 1 - smooth((t - tSplit) / 0.3);
    if (oldA > 0) {
      // the old single row, two jobs hanging off it
      const shake = t > tSplit - 0.3 && t < tSplit ? Math.sin(t * 60) * 4 : 0;
      ctx.save(); ctx.translate(shake, 0); ctx.globalAlpha = oldA;
      settingRow(x0, w, y0 + 220, P.oldRow || 'Keep Activity', 1, { size: 36, ts: 1.25 });
      ctx.font = H.font('ui', 24); ctx.fillStyle = '#59607a'; ctx.textAlign = 'left';
      ctx.fillText('History + AI training', x0 + 32, y0 + 290);
      ctx.restore();
      // crack line
      if (t > tSplit - 0.3) { ctx.strokeStyle = rgba('#ffffff', oldA); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x0 + 10, y0 + 222); for (let i = 1; i <= 8; i++) ctx.lineTo(x0 + i * w / 8, y0 + 222 + (i % 2 ? -10 : 10)); ctx.stroke(); }
    }
    if (sp > 0) {
      const yA = lerp(y0 + 220, y0 + 170, sp), yB = lerp(y0 + 220, y0 + 330, sp);
      const hA = smooth((t - tHist) / 0.3) * (1 - smooth((t - tTrain) / 0.3)), hB = smooth((t - tTrain) / 0.3) * (1 - smooth((t - tWas) / 0.3));
      const offK = smooth((t - tWas - 0.4) / 0.3) * (1 - smooth((t - tWas - 2.0) / 0.3));
      settingRow(x0, w, yA, P.rowA || 'History', 1 - offK, { alpha: sp, icon: 'history', hl: hA });
      settingRow(x0, w, yB, P.rowB || 'AI training', 1 - offK, { alpha: sp, icon: 'train', hl: hB });
      ctx.strokeStyle = '#d5dae8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + 28, (yA + yB) / 2); ctx.lineTo(x0 + w - 28, (yA + yB) / 2); ctx.stroke();
      ring(x0 + w / 2, y0 + 220, tSplit, ACC);
    }
    ctx.restore();
    // "two controls" chip
    const tp = pop(tSplit + 0.4);
    if (tp > 0 && t < tWas) K.drawLabel(ctx, 487, 535, tp, { text: P.two || 'Now two switches', size: 30, accent: true });
    const wp = pop(tWas);
    if (wp > 0 && t < tRoll) K.drawLabel(ctx, 487, 535, wp, { text: P.was || 'Was off? Both start off', size: 30 });
    const rp = pop(tRoll);
    if (rp > 0) {
      K.drawLabel(ctx, 487, 535, rp, { text: P.roll || 'Worldwide, over the coming weeks', size: 30, accent: true, dot: true });
      K.drawGlobe(ctx, 800, 700, 0.6 * rp, { t, arcs: 3, progress: clamp((t - tRoll) / 1.5) });
    }
    return;
  }

  if (mode === 'keep') {
    const tOld = at(P.oldCue, D * 0.45) - 0.2, tNow = at(P.nowCue, D * 0.68) - 0.3, tOpt = at(P.optCue, D * 0.88) - 0.25;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 720 }]);
    K.world.room(ctx, { t, time: 'night', lamp: false, window: true, picture: false, plant: true });
    const shut = smooth((t - tOpt) / 0.35);
    const trainOn = t < tOld || (t > tNow && t < tOpt);
    hopper(720, 1035, 0.95, { shut, active: trainOn ? 1 : 0 });
    ctx.restore();
    K.drawLabel(ctx, 720, 600, pop(0.2), { text: P.machine || 'AI training', size: 28 });
    xMark(720, 650, 46, K.popIn(t, tOpt + 0.25, 0.4));
    // phone card (left)
    const x0 = 110, w = 390, y0 = 560, h = 470;
    cardFrame(x0, y0, w, h, APP, 'Settings');
    const histOn = 1 - smooth((t - tOld) / 0.3) + smooth((t - tNow) / 0.3);
    const trainOnK = 1 - smooth((t - tOld) / 0.3) + smooth((t - tNow) / 0.3) - smooth((t - tOpt) / 0.3);
    settingRow(x0, w, y0 + 140, P.rowA || 'History', clamp(histOn), { icon: 'history', size: 28, ts: 0.9, glow: t > tOpt ? 1 : 0 });
    // chat list (the history): rows fade out when history goes off, come back on now
    const listA = clamp(histOn);
    for (let i = 0; i < 3; i++) {
      const y = y0 + 210 + i * 56;
      ctx.save(); ctx.globalAlpha = 0.25 + 0.75 * listA;
      roundRect(ctx, x0 + 30, y - 22, w - 60, 44, 12); ctx.fillStyle = listA > 0.5 ? '#e4e8f3' : '#eef0f6'; ctx.fill();
      if (listA > 0.2) { ctx.globalAlpha = listA; roundRect(ctx, x0 + 50, y - 6, (w - 140) * (0.5 + 0.3 * H.hash(i, 3)), 12, 6); ctx.fillStyle = '#9aa3bd'; ctx.fill(); }
      ctx.restore();
    }
    ctx.strokeStyle = '#d5dae8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0 + 28, y0 + 370); ctx.lineTo(x0 + w - 28, y0 + 370); ctx.stroke();
    settingRow(x0, w, y0 + 415, P.rowB || 'AI training', clamp(trainOnK), { icon: 'train', size: 28, ts: 0.9 });
    ring(x0 + w - 70, y0 + 415, tOpt, '#ffffff');
    // the old way: a chain links the two toggles while they go off together
    const chainA = smooth((t - tOld + 0.4) / 0.3) * (1 - smooth((t - tNow) / 0.3));
    if (chainA > 0) {
      ctx.save(); ctx.globalAlpha = chainA; ctx.strokeStyle = RED; ctx.lineWidth = 6;
      const cx = x0 + w - 64; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(cx, y0 + 175 + i * 40, 10, 18, 0, 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
      K.drawLabel(ctx, 487, 535, Math.min(1.04, chainA), { text: P.oldWay || 'The old way: all or nothing', size: 28 });
    }
    // cards feed the training machine while training is on
    for (let k = 0; k < 14; k++) {
      const s0 = 0.3 + k * 0.8, u = (t - s0) / 1.1;
      if (u <= 0 || u >= 1) continue;
      const on = s0 < tOld - 0.2 || (s0 > tNow + 0.1 && s0 < tOpt - 0.3);
      if (!on) continue;
      const [cx, cy] = arcPos(x0 + w - 40, y0 + 250, 720, 640, easeInOutCubic(u), 160);
      chatCard(cx, cy, lerp(0.55, 0.35, u), { rot: u * 0.6, alpha: 1 - smooth((u - 0.85) / 0.15) });
    }
    const kp = pop(tOpt + 0.4);
    if (kp > 0) K.drawLabel(ctx, 487, 535, kp, { text: P.keepPill || 'Keep history + skip training', size: 30, accent: true });
    return;
  }

  if (mode === 'catch') {
    const tOld = at(P.oldCue, D * 0.4) - 0.5, tNow = at(P.nowCue, D * 0.6) - 0.15, tTemp = at(P.tempCue, D * 0.82) - 0.2;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 500, y: 760 }]);
    K.world.room(ctx, { t, time: 'night', lamp: true, window: false, picture: false, plant: false, floorY: 990 });
    const flipK = smooth((t - tNow) / 0.25);
    const op = 0.35 + 0.65 * Math.max(smooth((t - tTemp + 0.5) / 0.3) * (1 - smooth((t - tTemp - 1.1) / 0.3)), 0);
    cabinet(560, 1035, 1.0, { open: op, label: flipK > 0.5 ? (P.after || '~2 MONTHS') : (t > tOld ? (P.before || '72 HOURS') : 'CHATS'), hl: flipK, contents: t > tNow ? 4 : 2 });
    K.drawRobot(ctx, 250, 1040, 1.3, { t, state: t > tNow ? 'thinking' : 'working', seed: 4 });
    // calendar: pages tear off after the flip
    const cx = 820, cy = 880;
    if (t > tNow) {
      for (let i = 0; i < 6; i++) {
        const s0 = tNow + 0.2 + i * 0.28, u = (t - s0) / 0.9; if (u <= 0 || u >= 1) continue;
        ctx.save(); ctx.globalAlpha = 1 - u; ctx.translate(cx + u * 120, cy - u * 160 + u * u * 80); ctx.rotate(u * 1.4);
        roundRect(ctx, -60, -66, 120, 132, 10); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.restore();
      }
    }
    ctx.restore();
    const calP = pop(tOld);
    if (calP > 0) calendar(cx, cy, 0.78 * calP, 'KEPT', flipK > 0.5 ? '~2' : '72', flipK > 0.5 ? 'months' : 'hours');
    // the robot files a card now and then
    for (let k = 0; k < 4; k++) {
      const s0 = 0.2 + k * 1.6, u = (t - s0) / 0.9; if (u <= 0 || u >= 1 || s0 > tTemp - 1) continue;
      const [x, y] = arcPos(320, 820, 560, 745, easeInOutCubic(u), 90);
      chatCard(x, y, lerp(0.6, 0.4, u), { alpha: 1 - smooth((u - 0.85) / 0.15) });
    }
    // timeline bars (top)
    const BX = 150, BW = 680;
    const b1 = pop(tOld, 0.4);
    if (b1 > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, b1);
      roundRect(ctx, BX - 20, 520, BW + 40, 180, 22); ctx.fillStyle = 'rgba(10,12,22,0.82)'; ctx.fill();
      ctx.font = H.font('ui', 26); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(P.beforeLabel || 'Before', BX, 570);
      roundRect(ctx, BX + 130, 554, 34, 32, 10); ctx.fillStyle = '#9aa3bd'; ctx.fill();
      ctx.font = H.font('display', 30); ctx.fillStyle = '#ffffff'; ctx.fillText(P.before72 || 'Up to 72 hours', BX + 180, 571);
      ctx.restore();
      const g = H.phase(t, tNow, tNow + 1.2, easeInOutCubic);
      if (g > 0) {
        ctx.font = H.font('ui', 26); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(P.afterLabel || 'Now', BX, 650);
        const bw = lerp(34, BW - 130, g);
        K.glow(ctx, BX + 130 + bw / 2, 650, bw * 0.5, ACC, 0.25 * g);
        roundRect(ctx, BX + 130, 628, bw, 44, 14); ctx.fillStyle = ACC; ctx.fill();
        if (g > 0.6) { ctx.globalAlpha = smooth((g - 0.6) / 0.4); ctx.font = H.font('display', 30); ctx.textBaseline = 'middle'; ctx.fillStyle = K.ACCENT.deep; ctx.fillText(P.after2 || 'Around 2 months', BX + 150, 651); ctx.globalAlpha = 1; }
      }
    }
    // temporary chat card is filed too
    if (t > tTemp) {
      const u = H.phase(t, tTemp, tTemp + 0.9, easeInOutCubic);
      const [x, y] = arcPos(320, 820, 560, 745, u, 110);
      const vis = 1 - smooth((t - tTemp - 0.85) / 0.15);
      if (vis > 0) chatCard(x, y, lerp(0.75, 0.45, u) * Math.min(1, K.popIn(t, tTemp, 0.3)), { temp: true, alpha: vis, glowA: 1 });
      K.drawLabel(ctx, 730, 792, pop(tTemp + 0.2), { text: P.temp || 'Temporary too', size: 28, dot: true });
    }
    return;
  }

  if (mode === 'why') {
    const tAbuse = at(P.abuseCue, D * 0.35) - 0.3, tNo = at(P.noCue, D * 0.7) - 0.3, tFb = at(P.feedbackCue, D * 0.88) - 0.2;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 470, y: 760 }]);
    K.world.room(ctx, { t, time: 'night', lamp: true, window: false, picture: false, plant: false, floorY: 990 });
    cabinet(280, 1035, 1.0, { open: 1, label: P.drawer || '~2 MONTHS', hl: 1, contents: 4 });
    K.drawRobot(ctx, 560, 1040, 1.3, { t, state: t > tAbuse + 0.6 ? 'happy' : 'thinking', seed: 4, flip: true });
    ctx.restore();
    // three cards float above the drawer; the magnifier sweeps them
    const cards = [[190, 665], [350, 635], [510, 675]];
    cards.forEach(([x, y], i) => {
      const flag = i === 1 && t > tAbuse;
      chatCard(x, y + Math.sin(t * 1.6 + i) * 6, 0.72 * Math.min(1, K.popIn(t, 0.1 + i * 0.15, 0.4)), { flag, glowA: flag ? 1 : 0, rot: (i - 1) * 0.06 });
    });
    const sweep = t < tAbuse ? (Math.sin(t * 1.4) * 0.5 + 0.5) : 0.5;
    const mx = lerp(190, 510, sweep), my = 660 + (t > tAbuse ? 0 : Math.sin(t * 2) * 8);
    const toMid = H.phase(t, tAbuse - 0.4, tAbuse, easeInOutCubic);
    magnifier(lerp(mx, 350, toMid), lerp(my, 635, toMid), 1.0);
    const sp = K.popIn(t, tAbuse + 0.4, 0.45);
    if (sp > 0) { K.drawShield(ctx, 470, 610, 0.5 * sp, { check: clamp((t - tAbuse - 0.6) / 0.4) }); }
    K.drawLabel(ctx, 487, 535, pop(Math.max(0.2, tAbuse - 1.6)), { text: P.why || 'Google: to detect abuse', size: 30, accent: true });
    // not for training (right)
    const np = pop(tNo - 0.2);
    if (np > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, np);
      hopper(790, 1030, 0.62, { active: 0, shut: 1 });
      ctx.restore();
      K.drawStamp(ctx, 790, 880, 0.95, { kind: 'cross', text: P.no || 'NO TRAINING', land: clamp((t - tNo) / 0.5) });
    }
    const fp = pop(tFb);
    if (fp > 0) K.drawLabel(ctx, 640, 1048, fp, { text: P.feedback || 'Unless you send feedback', size: 26 });
    return;
  }

  if (mode === 'caveat') {
    const tRev = at(P.reviewCue, D * 0.1) - 0.3, tBox = at(P.boxCue, D * 0.35) - 0.3, tDel = at(P.deleteCue, D * 0.5) - 0.2;
    const tKeep = at(P.keepCue, D * 0.62) - 0.2, tMon = at(P.monthsCue, D * 0.82) - 0.3;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 760 }]);
    K.world.room(ctx, { t, time: 'night', lamp: true, window: true, picture: false, plant: false, floorY: 990 });
    const purge = smooth((t - tDel) / 0.4);
    cabinet(220, 1035, 0.95, { open: 1, label: P.drawer || '~2 MONTHS', hl: 0, contents: purge > 0.5 ? 0 : 3 });
    // reviewer (generic cartoon) in the middle
    const walk = H.phase(t, tRev - 0.2, tRev + 0.9, easeInOutCubic);
    K.drawPerson(ctx, lerp(560, 470, walk), 1040, 1.4, { t, pose: t > tRev + 0.9 && t < tBox + 0.5 ? 'point' : 'stand', walk: walk > 0 && walk < 1 ? t : undefined, mood: 'neutral', skin: 3, hair: 0, shirt: '#5aa9a0', hairStyle: 'short', seed: 52, look: t < tBox ? -1 : 1, flip: t < tBox });
    // Reviewed box (right)
    const bp = pop(tRev + 0.4);
    const BXc = 760, BYb = 1030;
    if (bp > 0) {
      ctx.save(); ctx.translate(BXc, BYb); ctx.scale(bp, bp);
      K.shadow(ctx, 0, 0, 260);
      roundRect(ctx, -120, -190, 240, 190, 18); ctx.fillStyle = '#3a3f6b'; ctx.fill();
      roundRect(ctx, -132, -212, 264, 36, 12); ctx.fillStyle = '#4b5185'; ctx.fill();
      ctx.font = H.font('display', 28); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.reviewed || 'REVIEWED', 0, -120);
      ctx.restore();
      K.drawLock(ctx, BXc, BYb - 30, 0.5 * Math.min(1, bp), { open: 0 });
    }
    // the reviewed card travels from the drawer to the box
    if (t > tRev + 0.6) {
      const u = H.phase(t, tRev + 0.6, tBox - 0.1, easeInOutCubic);
      const [x, y] = arcPos(220, 700, BXc, 820, u, 180);
      const vis = 1 - smooth((u - 0.92) / 0.08);
      if (vis > 0) chatCard(x, y, lerp(0.7, 0.5, u), { alpha: vis, glowA: 0.6 });
      magnifier(x + 70, y - 40, 0.6 * vis);
    }
    const yp = pop(tBox);
    if (yp > 0) K.drawLabel(ctx, BXc, 785, yp, { text: P.years || 'Up to 3 years', size: 30, accent: true });
    // delete: puffs out of the drawer, the box stays
    if (t > tDel && t < tDel + 1.2) {
      for (let i = 0; i < 7; i++) {
        const u = (t - tDel - i * 0.05) / 0.9; if (u <= 0 || u >= 1) continue;
        const a = i / 7 * Math.PI * 2;
        ctx.fillStyle = rgba('#e9ecf6', 0.7 * (1 - u)); ctx.beginPath(); ctx.arc(220 + Math.cos(a) * 90 * u, 720 + Math.sin(a) * 50 * u - 40 * u, 22 + 20 * u, 0, Math.PI * 2); ctx.fill();
      }
    }
    const dp = pop(tDel + 0.3);
    if (dp > 0 && t < tKeep) K.drawLabel(ctx, 487, 535, dp, { text: P.deleted || 'Deleted? Reviewed ones stay', size: 28 });
    // keep history on -> 18 months
    const kp = pop(tKeep);
    if (kp > 0) K.drawLabel(ctx, 487, 535, kp, { text: P.keepPill || 'History on: auto-deletes', size: 30, accent: true });
    if (kp > 0) {
      const x0 = 120, w = 400, y0 = 560;
      ctx.save(); ctx.translate(x0 + w / 2, y0 + 70); ctx.scale(kp, kp); ctx.translate(-(x0 + w / 2), -(y0 + 70));
      roundRect(ctx, x0, y0, w, 140, 26); ctx.fillStyle = CARD; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#1c2033'; ctx.stroke();
      settingRow(x0, w, y0 + 70, P.rowA || 'History', 1, { icon: 'history', size: 30, glow: 1 });
      ctx.restore();
      const mp = pop(tMon);
      if (mp > 0) {
        calendar(700, 650, 0.85 * mp, 'DEFAULT', '18', P.months || 'months');
      }
    }
    return;
  }
}
