// Scene "robot-standoff" (full frame). A generic cartoon sidewalk delivery robot (cooler-on-wheels cart with a safety
// flag and accent eyes; no brand) meets a person standing in its path outside a generic "MARKET" building.
// Fits: "person blocks / protests a delivery robot", "robots vs delivery jobs", "police called over a robot".
// Defaults are generic placeholders; pass the story's place, charge, quotes, dates, maker and price. Cue params are
// narration words ("word#n" = the (n+1)th time the word is spoken in this scene); without them fixed fractions.
// Characters are generic kit cartoons; nothing resembles a real person or a real robot design; names only as text.
// modes:
//   standoff (best as a 2-beat span): robot rolls in and stops in front of a person; it tries again and again, she
//     steps in each time; an officer walks in with "Move, please" (+ x2 x3); on arrestCue an ARRESTED stamp, both walk
//     off left and the robot rolls on; place pill then charge pill.
//     params: place, orders, charge, stamp, blockCue, policeCue, orderCue, arrestCue, chargeCue
//   protest: close-up of the standoff; verbatim quote panel + attribution pill, a "right" pill, then her own short
//     line as a speech bubble.  params: quote, by, right, again, byCue, quoteCue, rightCue, againCue
//   fleet: a wall calendar flips pages while she blocks a robot ("months" pill); then a day street where 3 robots roll
//     in and park; since / maker / price pills, coins pop.  params: months, since, maker, price, monthsCue, sinceCue,
//     makerCue, priceCue, switchCue
//   company: dusk street, a company tower with a text name pill, "..." bubble + "declined" pill; a courier with a
//     delivery backpack and a robot walk side by side; verbatim quote panel.  params: company, noComment, quote, by,
//     noCue, quoteCue
//   caveat: courtroom; "Charged / not convicted" banner, a "fight" pill, then a balance scale (robot vs courier) that
//     wobbles and settles level under a "Still debated" pill.  params: banner1, banner2, fight, left, right, debate,
//     bannerCue, fightCue, debateCue
//   payoff: dusk sidewalk face-off; chips over the robot and the person, then a question card with a pulsing "?".
//     params: question, a, b, aCue, bCue, qCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  // cue words may carry an occurrence index: "arrested#1" = the second time the word is spoken in this scene
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const mode = P.mode || 'standoff';
  const FEET = 1030;

  // ---------------------------------------------------------------- helpers
  function cart(x, y, s, o = {}) {
    const tt = o.t == null ? t : o.t, roll = o.roll || 0, mood = o.mood || 'normal';
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.flip) ctx.scale(-1, 1);
    K.shadow(ctx, 0, 0, 200);
    const bump = o.moving ? Math.sin(tt * 22) * 1.6 : 0;
    // wheels (rotate with distance rolled)
    for (const wx of [-60, 0, 60]) {
      ctx.beginPath(); ctx.arc(wx, -17, 17, 0, Math.PI * 2); ctx.fillStyle = '#1c2033'; ctx.fill();
      ctx.beginPath(); ctx.arc(wx, -17, 7, 0, Math.PI * 2); ctx.fillStyle = '#5a6496'; ctx.fill();
      ctx.save(); ctx.translate(wx, -17); ctx.rotate(roll / 17); ctx.fillStyle = '#8a93b8'; ctx.fillRect(-1.5, -14, 3, 9); ctx.restore();
    }
    ctx.translate(0, bump);
    // safety flag on a whip pole (back of the cart)
    const wave = Math.sin(tt * 5) * 6 + (o.moving ? 6 : 0);
    ctx.strokeStyle = '#b9c1d6'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-66, -146); ctx.quadraticCurveTo(-68 - wave * 0.3, -200, -70 - wave * 0.6, -258); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-70 - wave * 0.6, -258); ctx.lineTo(-70 - wave * 0.6 - 46 - wave, -248 + wave * 0.4); ctx.lineTo(-70 - wave * 0.6, -232); ctx.closePath();
    ctx.fillStyle = '#ff8a3d'; ctx.fill();
    // body
    roundRect(ctx, -92, -142, 184, 114, 24); ctx.fillStyle = '#e9edf7'; ctx.fill();
    ctx.save(); roundRect(ctx, -92, -142, 184, 114, 24); ctx.clip(); ctx.fillStyle = '#c3cadd'; ctx.fillRect(-92, -64, 184, 40); ctx.fillRect(56, -142, 40, 120); ctx.restore();
    // lid
    roundRect(ctx, -96, -156, 192, 26, 12); ctx.fillStyle = '#f6f8fd'; ctx.fill();
    ctx.fillStyle = '#b9c1d6'; ctx.fillRect(-80, -132, 120, 4);
    // accent bumper stripe
    roundRect(ctx, -92, -66, 184, 10, 5); ctx.fillStyle = ACC; ctx.fill();
    // face screen (front = +x)
    roundRect(ctx, 26, -126, 60, 50, 14); ctx.fillStyle = '#121527'; ctx.fill();
    K.glow(ctx, 56, -101, 50, ACC, 0.16);
    ctx.fillStyle = ACC; ctx.strokeStyle = ACC; ctx.lineCap = 'round';
    const blink = ((tt * 0.7 + (o.seed || 0) * 0.37) % 3.1) < 0.12;
    for (const ex of [44, 68]) {
      if (mood === 'happy') { ctx.lineWidth = 4.5; ctx.beginPath(); ctx.arc(ex, -96, 6, 1.15 * Math.PI, 1.85 * Math.PI); ctx.stroke(); }
      else if (mood === 'confused') {
        const h = ex === 44 ? 16 : 9;
        roundRect(ctx, ex - 4.5, -101 - h / 2, 9, blink ? 3 : h, 4.5); ctx.fill();
      } else { const h = blink ? 3 : 16; roundRect(ctx, ex - 4.5, -101 - h / 2, 9, h, 4.5); ctx.fill(); }
    }
    ctx.restore();
  }
  // generic officer: kit person in a navy uniform + peaked cap + badge (drawn in the person's own frame)
  function officer(x, s, o = {}) {
    K.drawPerson(ctx, x, FEET, s, Object.assign({ t, shirt: '#2f437e', pants: '#1d2540', hairStyle: 'short', hair: 0, skin: 3, seed: 9, mood: 'neutral' }, o));
    const walking = o.walk != null, ph = walking ? o.walk * 1.8 * Math.PI * 2 : 0;
    const bob = walking ? -Math.abs(Math.sin(ph)) * 5 : Math.sin(t * 1.6 + 9) * 1.2;
    const hipY = -104 + bob, shY = hipY - 64, headY = shY - 44;
    ctx.save(); ctx.translate(x, FEET); ctx.scale(s, s); if (o.flip) ctx.scale(-1, 1);
    roundRect(ctx, -36, headY - 50, 72, 28, 10); ctx.fillStyle = '#1d2540'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(10, headY - 22, 30, 7, 0, 0, Math.PI * 2); ctx.fillStyle = '#11162a'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, headY - 37, 6, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    ctx.beginPath(); ctx.arc(-14, shY + 24, 6.5, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    ctx.restore();
  }
  // the person who blocks the robot: a generic kit character
  function woman(x, s, o = {}) {
    K.drawPerson(ctx, x, FEET, s, Object.assign({ t, skin: 2, hair: 1, hairStyle: 'long', shirt: 2, pants: '#3b3266', seed: 7, mood: 'neutral' }, o));
  }
  function courier(x, s, o = {}) {
    // insulated delivery backpack behind the body (drawn first)
    const walking = o.walk != null, ph = walking ? o.walk * 1.8 * Math.PI * 2 : 0;
    const bob = walking ? -Math.abs(Math.sin(ph)) * 5 : 0;
    ctx.save(); ctx.translate(x, FEET); ctx.scale(s, s); if (o.flip) ctx.scale(-1, 1);
    roundRect(ctx, -70, -250 + bob, 62, 84, 10); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-70, -200 + bob, 62, 8);
    ctx.restore();
    K.drawPerson(ctx, x, FEET, s, Object.assign({ t, skin: 4, hair: 0, hairStyle: 'short', shirt: 1, seed: 4, mood: 'happy' }, o));
  }
  function market(time) {
    const x0 = 30, x1 = 540, top = 610, gy = 1000;
    roundRect(ctx, x0, top, x1 - x0, gy - top + 10, 8); ctx.fillStyle = time === 'day' ? '#7a4348' : '#5a3239'; ctx.fill();
    ctx.fillStyle = time === 'day' ? '#8c5157' : '#683a42'; ctx.fillRect(x0 - 10, top - 18, x1 - x0 + 20, 26);
    for (let i = 0; i < 3; i++) {
      const wx = x0 + 50 + i * 155, wy = 790;
      ctx.beginPath(); ctx.moveTo(wx, gy - 30); ctx.lineTo(wx, wy); ctx.arc(wx + 55, wy, 55, Math.PI, 0); ctx.lineTo(wx + 110, gy - 30); ctx.closePath();
      ctx.fillStyle = time === 'day' ? 'rgba(255,230,170,0.55)' : 'rgba(255,217,138,0.85)'; ctx.fill();
      ctx.fillStyle = 'rgba(60,30,30,0.35)'; ctx.fillRect(wx + 53, wy - 55, 4, gy - 30 - wy + 55);
    }
    roundRect(ctx, x0 + 120, top + 30, 270, 70, 12); ctx.fillStyle = '#15182e'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.85); ctx.stroke();
    ctx.font = H.font('display', 40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ACC;
    ctx.fillText('MARKET', x0 + 255, top + 67);
  }
  function street(time) {
    K.world.city(ctx, { t, time, groundY: 1000 });
  }
  function pill(x, y, k, text, o = {}) { if (k > 0.01) K.drawLabel(ctx, x, y, Math.min(1.06, k), Object.assign({ text, size: 30 }, o)); }
  function panel(cx, top, w, text, by, k, o = {}) {
    if (k <= 0.01) return;
    const size = o.size || 38, lines = H.wrap(ctx, text, 'bold', size, w - 70);
    const hh = 40 + lines.length * size * 1.22 + (by ? 50 : 0);
    ctx.save(); ctx.globalAlpha = clamp(k * 1.4) * (o.alpha == null ? 1 : o.alpha);
    ctx.translate(cx, top + hh / 2); ctx.scale(Math.min(1.04, 0.85 + 0.15 * k), Math.min(1.04, 0.85 + 0.15 * k));
    roundRect(ctx, -w / 2, -hh / 2, w, hh, 26); ctx.fillStyle = 'rgba(12,14,26,0.93)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.9); ctx.stroke();
    roundRect(ctx, -w / 2 + 18, -hh / 2 + 22, 8, hh - 44, 4); ctx.fillStyle = ACC; ctx.fill();
    ctx.font = H.font('bold', size); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#ffffff';
    lines.forEach((l, i) => ctx.fillText(l, -w / 2 + 46, -hh / 2 + 22 + size * 0.95 + i * size * 1.22));
    if (by) { ctx.font = H.font('ui', 26); ctx.fillStyle = ACC; ctx.fillText(by, -w / 2 + 46, hh / 2 - 26); }
    ctx.restore();
  }
  const pop = (t0, d = 0.4) => K.popIn(t, t0, d);

  // ---------------------------------------------------------------- modes
  if (mode === 'standoff') {
    const tStep = at(P.blockCue, D * 0.33) - 0.2;
    const tPolice = at(P.policeCue, D * 0.58) - 0.6;
    const tOrders = at(P.orderCue, tPolice + 1.6) - 0.25;
    const tArrest = at(P.arrestCue, D * 0.8) - 0.1;
    const tCharge = at(P.chargeCue, tArrest + 1.6) - 0.3;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tPolice, zoom: 1.06, x: 560, y: 780 }, { t: tArrest, zoom: 1.06, x: 520, y: 780 }, { t: D, zoom: 1.0 }]);
    street('dusk'); market('dusk');
    // robot: rolls in, stops, nudges forward at tStep and tStep + 1.7 (she steps in each time), rolls on after the arrest
    const inU = smooth(clamp(t / 1.5));
    let rx = lerp(1180, 690, inU), moving = t < 1.5;
    const nudges = [tStep, tStep + 1.7];
    let stepIn = 0;
    nudges.forEach((n) => {
      const back = smooth((t - n + 0.9) / 0.5) - smooth((t - n - 0.05) / 0.3);  // back up, then forward
      rx += 40 * back * (t < n + 0.6 ? 1 : 0);
      const fw = Math.sin(clamp((t - n) / 0.5) * Math.PI) * 26;
      rx -= fw;
      if (t > n - 0.9 && t < n + 0.6) moving = true;
      stepIn += smooth((t - n + 0.1) / 0.35) * 22;
    });
    const leave = smooth((t - tArrest - 0.6) / 2.2);
    const rollOn = smooth((t - tArrest - 1.6) / 1.6);
    rx = lerp(rx, 470, rollOn); if (rollOn > 0 && rollOn < 1) moving = true;
    const jolt = nudges.reduce((a, n) => a + K.shake(t, n + 0.2, 0.3, 5), 0);
    const rMood = rollOn > 0.6 ? 'happy' : t > 1.4 ? 'confused' : 'normal';
    // woman steps toward the robot each nudge; leaves left with the officer after the arrest
    const wx = lerp(400 + Math.min(44, stepIn), 150, leave);
    const walkingOff = leave > 0.01 && leave < 0.99;
    woman(wx, 1.5, { pose: !walkingOff && t > tStep && t < tArrest ? 'point' : 'stand', walk: walkingOff ? t : undefined,
      flip: walkingOff, look: walkingOff ? 0 : 0.6, mood: t > tOrders && t < tArrest ? 'neutral' : 'neutral' });
    // officer walks in from the left
    if (t > tPolice - 0.1) {
      const inO = smooth((t - tPolice) / 1.2);
      const ox = lerp(-90, 205, inO) + lerp(0, -150, leave);
      const ow = (inO > 0.02 && inO < 0.98) || walkingOff;
      officer(ox, 1.5, { walk: ow ? t : undefined, pose: !ow && t > tOrders - 0.1 && t < tArrest ? 'point' : 'stand', look: 0.6, flip: walkingOff });
      // "Move, please" x3
      const ok = pop(tOrders) * (1 - smooth((t - tArrest) / 0.3));
      if (ok > 0.01) {
        K.drawSpeechBubble(ctx, ox + 30, 735, 1, { text: P.orders || 'Move, please', size: 30, tail: 'left', pop: Math.min(1.05, ok) });
        ['x2', 'x3'].forEach((c, i) => {
          const k = pop(tOrders + 0.55 + i * 0.45, 0.3) * (1 - smooth((t - tArrest) / 0.3));
          if (k > 0.01) K.drawLabel(ctx, ox + 250 + i * 76, 690 - i * 26, Math.min(1.06, k), { text: c, size: 28, accent: true });
        });
      }
    }
    cart(rx + jolt, FEET, 1.4, { flip: true, moving, roll: -rx, mood: rMood, seed: 1 });
    // "?" over the robot after the first stop
    const qk = pop(1.5, 0.35) * (1 - smooth((t - tPolice) / 0.4));
    if (qk > 0.01) { ctx.save(); ctx.globalAlpha = clamp(qk); ctx.font = H.font('display', 64); ctx.textAlign = 'center'; ctx.fillStyle = ACC; ctx.fillText('?', rx + 10, 800 + K.bob(t, 6, 2)); ctx.restore(); }
    ctx.restore();
    // overlays (outside the camera)
    const placeK = pop(2.9) * (1 - smooth((t - tCharge) / 0.3));
    pill(487, 470, placeK, P.place || 'Downtown', { dot: true });
    pill(487, 470, pop(tCharge), P.charge || 'Charged', { accent: true });
    const st = (t - tArrest) / 0.55;
    if (st > 0) K.drawStamp(ctx, 487, 690, 0.8, { kind: 'cross', text: P.stamp || 'ARRESTED', land: st });
    return;
  }

  if (mode === 'protest') {
    const tBy = at(P.byCue, 1.2) - 0.2;
    const tQuote = at(P.quoteCue, D * 0.25) - 0.6;
    const tRight = at(P.rightCue, D * 0.6) - 0.3;
    const tAgain = at(P.againCue, D * 0.85) - 0.3;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.12, x: 520, y: 820 }, { t: D, zoom: 1.2, x: 500, y: 830 }]);
    street('dusk'); market('dusk');
    // the robot inches forward once mid-beat; she holds up a hand
    const nudge = Math.sin(clamp((t - D * 0.45) / 0.7) * Math.PI);
    woman(390, 1.5, { pose: nudge > 0.2 || (t > tAgain && t < tAgain + 1.6) ? 'point' : 'stand', look: 0.6,
      talk: t > tAgain && t < tAgain + 1.2 ? info.env : 0, mood: 'neutral' });
    cart(710 - nudge * 30, FEET, 1.4, { flip: true, moving: nudge > 0.05, roll: nudge * 30, mood: 'confused', seed: 1 });
    ctx.restore();
    const qOut = smooth((t - tRight + 0.1) / 0.4);
    panel(487, 440, 820, P.quote || '"Quote"', P.by || '', pop(tQuote, 0.45), { size: 40, alpha: 1 - qOut });
    pill(487, 470, pop(tBy) * (1 - smooth((t - tQuote + 0.3) / 0.25)), P.by || 'she told a reporter', { dot: true });
    pill(487, 480, pop(tRight), P.right || 'Free speech', { accent: true, size: 32 });
    const ak = pop(tAgain, 0.35);
    if (ak > 0.01) K.drawSpeechBubble(ctx, 520, 620, 1, { text: P.again || 'Why not?', size: 36, tail: 'left', pop: Math.min(1.05, ak) });
    // once the bubble is up, hide the right pill to keep things clear
    return;
  }

  if (mode === 'fleet') {
    const tMonths = at(P.monthsCue, 2.0) - 0.4;
    const tSwitch = at(P.switchCue, D * 0.27) - 0.4;
    const tSince = at(P.sinceCue, tSwitch + 1.8) - 0.4;
    const tMaker = at(P.makerCue, D * 0.7) - 0.6;
    const tPrice = at(P.priceCue, D * 0.85) - 0.3;
    const sw = smooth((t - tSwitch) / 0.5);
    // part 1: calendar flips while she blocks a robot
    if (sw < 1) {
      ctx.save();
      K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tSwitch + 0.5, zoom: 1.05, x: 500, y: 760 }]);
      street('night'); market('night');
      const nud = Math.sin(clamp((t % 1.6) / 0.6) * Math.PI);
      woman(370, 1.45, { pose: 'point', look: 0.6 });
      cart(690 - nud * 18, FEET, 1.35, { flip: true, moving: nud > 0.05, roll: nud * 18, mood: 'confused', seed: 2 });
      // wall calendar (no month names): pages tear off one by one
      const cx = 760, cy = 560, flips = Math.floor(clamp(t / Math.max(0.5, tSwitch)) * 5);
      roundRect(ctx, cx - 95, cy - 90, 190, 200, 14); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      roundRect(ctx, cx - 95, cy - 90, 190, 50, 14); ctx.fillStyle = ACC; ctx.fill();
      ctx.fillStyle = '#b9c1d6';
      for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) ctx.fillRect(cx - 78 + c * 32, cy - 20 + r * 30, 20, 16);
      const fp = clamp(((t / Math.max(0.5, tSwitch)) * 5) % 1);
      if (flips < 5) { // page flying off
        ctx.save(); ctx.translate(cx + fp * 160, cy - 40 - Math.sin(fp * Math.PI) * 120); ctx.rotate(fp * 1.6); ctx.globalAlpha = 1 - fp;
        roundRect(ctx, -80, -60, 160, 150, 12); ctx.fillStyle = '#dfe4f1'; ctx.fill(); ctx.restore();
      }
      ctx.restore();
    }
    // part 2: day street, 3 robots roll in and park
    if (sw > 0) {
      ctx.save(); ctx.globalAlpha = sw;
      K.camera(ctx, t, [{ t: tSwitch, zoom: 1.04, x: 487, y: 800 }, { t: D, zoom: 1.0 }]);
      street('day');
      [[220, 0.0], [487, 0.35], [760, 0.7]].forEach(([px, dl], i) => {
        const u = smooth(clamp((t - tSwitch - dl) / 2.4));
        const x = lerp(1250 + i * 140, px, u);
        const hop = t > tPrice && i === 1 ? Math.abs(Math.sin((t - tPrice) * 6)) * 10 * (1 - smooth((t - tPrice) / 1.4)) : 0;
        cart(x, FEET - hop, 1.0, { flip: true, moving: u > 0.01 && u < 0.99, roll: -x, mood: u >= 0.99 ? 'happy' : 'normal', seed: i, t: t + i });
      });
      // coins pop out of the middle robot's lid at the price
      if (t > tPrice) for (let i = 0; i < 3; i++) {
        const k = clamp((t - tPrice - i * 0.15) / 0.8);
        if (k > 0) K.drawCoin(ctx, 487 + (i - 1) * 70 * k, 860 - Math.sin(k * Math.PI * 0.85) * 120 - k * 20, 0.9, { spin: t * 4 + i });
      }
      ctx.restore();
    }
    pill(487, 470, pop(tMonths) * (1 - sw), P.months || 'For months', { dot: true });
    pill(487, 470, pop(tSince), P.since || 'Since this year', { dot: true });
    pill(487, 550, pop(tMaker), P.maker || 'Made by a robot company', {});
    pill(487, 630, pop(tPrice), P.price || 'Price per robot', { accent: true });
    return;
  }

  if (mode === 'company') {
    const tNo = at(P.noCue, 0.4) - 0.2;
    const tQuote = at(P.quoteCue, D * 0.65) - 1.4;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 500, y: 790 }]);
    street('dusk');
    const qk = pop(tQuote, 0.45);
    K.drawBuilding(ctx, 720, 1000, 0.9, { t, color: '#4d5a96', lit: 0.6 });
    // courier + robot walk in side by side, then stop
    const u = smooth(clamp((t - 0.3) / Math.max(1, D * 0.7)));
    const walking = u > 0.01 && u < 0.99;
    courier(lerp(60, 230, u), 1.35, { walk: walking ? t : undefined, look: 0.4 });
    cart(lerp(260, 460, u), FEET, 1.2, { moving: walking, roll: lerp(260, 460, u), mood: 'happy', seed: 3 });
    ctx.restore();
    // tower name + "..." + declined pill (dim when the quote lands)
    const dim = 1 - smooth((t - tQuote) / 0.4);
    ctx.save(); ctx.globalAlpha = dim;
    pill(720, 560, pop(0.1), P.company || 'Company', { dot: true });
    const dk = pop(tNo - 0.3, 0.35);
    if (dk > 0.01) K.drawSpeechBubble(ctx, 650, 700, 1, { text: '...', size: 36, tail: 'right', pop: Math.min(1.05, dk) });
    pill(487, 470, pop(tNo + 0.2), P.noComment || 'No comment', {});
    ctx.restore();
    panel(487, 440, 820, P.quote || '"Quote"', P.by || '', qk, { size: 40 });
    return;
  }

  if (mode === 'caveat') {
    const tBan = at(P.bannerCue, 0.8) - 0.3;
    const tFight = at(P.fightCue, D * 0.38) - 0.4;
    const tDeb = at(P.debateCue, D * 0.58) - 0.3;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 780 }]);
    K.world.courtroom(ctx, { t });
    // balance scale in front of the bench
    const sk = smooth((t - tDeb) / 0.5);
    if (sk > 0) {
      ctx.save(); ctx.globalAlpha = sk;
      const cx = 487, beamY = 800, half = 230;
      const a = (t > tDeb ? Math.sin((t - tDeb) * 3.2) * 0.12 * Math.exp(-(t - tDeb) * 0.55) : 0);
      K.shadow(ctx, cx, 1030, 220);
      roundRect(ctx, cx - 70, 1005, 140, 26, 10); ctx.fillStyle = '#c9a76a'; ctx.fill();
      roundRect(ctx, cx - 9, beamY, 18, 210, 8); ctx.fillStyle = '#d8b878'; ctx.fill();
      ctx.save(); ctx.translate(cx, beamY); ctx.rotate(a);
      roundRect(ctx, -half - 10, -8, half * 2 + 20, 16, 8); ctx.fillStyle = '#e6c88a'; ctx.fill();
      ctx.restore();
      ctx.beginPath(); ctx.arc(cx, beamY, 16, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
      [-1, 1].forEach((side) => {
        const px = cx + Math.cos(a) * half * side, py = beamY + Math.sin(a) * half * side;
        const panY = py + 150;
        ctx.strokeStyle = '#e6c88a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 70, panY); ctx.moveTo(px, py); ctx.lineTo(px + 70, panY); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(px, panY, 86, 16, 0, 0, Math.PI * 2); ctx.fillStyle = '#d8b878'; ctx.fill();
        // items standing on the pans (drawn in a sub-frame so their feet sit on the pan)
        if (side < 0) cart(px, panY - 4, 0.55, { mood: 'normal', seed: 5 });
        else { ctx.save(); ctx.translate(px, panY - 4); ctx.scale(0.42, 0.42); ctx.translate(-px, -FEET); courier(px, 1.0, {}); ctx.restore(); }
      });
      ctx.restore();
    }
    ctx.restore();
    // banner
    const bk = pop(tBan, 0.45);
    if (bk > 0.01) {
      ctx.save(); ctx.translate(487, 505); ctx.scale(Math.min(1.04, bk), Math.min(1.04, bk));
      roundRect(ctx, -390, -62, 780, 124, 26); ctx.fillStyle = 'rgba(12,14,26,0.93)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.9); ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = H.font('display', 50); ctx.fillStyle = '#ffffff';
      const t1 = (P.banner1 || 'Charged') + ' ', t2 = P.banner2 || 'not convicted';
      const w1 = ctx.measureText(t1).width; ctx.font = H.font('display', 50); const w2 = ctx.measureText(t2).width;
      const x0 = -(w1 + w2) / 2;
      ctx.textAlign = 'left'; ctx.fillStyle = '#ffffff'; ctx.fillText(t1, x0, 3);
      ctx.fillStyle = ACC; ctx.fillText(t2, x0 + w1, 3);
      ctx.restore();
    }
    pill(487, 640, pop(tFight), P.fight || 'Will fight it', { dot: true });
    const lk = pop(tDeb + 0.4);
    if (lk > 0.01) {
      // labels over each pan (placed above the beam ends)
      K.drawLabel(ctx, 257, 765, Math.min(1.06, lk), { text: P.left || 'Robots', size: 26 });
      K.drawLabel(ctx, 717, 765, Math.min(1.06, lk), { text: P.right || 'Jobs', size: 26 });
    }
    const dkk = pop(tDeb + 1.2);
    if (dkk > 0.01) K.drawLabel(ctx, 487, 712, Math.min(1.06, dkk), { text: (P.debate || 'Still debated') + '  ?', size: 30, accent: true });
    return;
  }

  // payoff
  const tA = at(P.aCue, 0.2) - 0.1;
  const tB = at(P.bCue, D * 0.4) - 0.2;
  const tQ = at(P.qCue, D * 0.68) - 0.3;
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.02, x: 500, y: 760 }]);
  street('night'); market('night');
  woman(340, 1.5, { pose: 'stand', look: 0.6 });
  cart(690, FEET, 1.4, { flip: true, mood: 'normal', seed: 1 });
  ctx.restore();
  const qd = smooth((t - tQ) / 0.4);
  ctx.save(); ctx.globalAlpha = 1 - 0.3 * qd;
  pill(650, 768, pop(tA), P.a || 'The robot', { dot: true });
  pill(170, 760, pop(tB), P.b || 'The person', { dot: true });
  ctx.restore();
  const qk = pop(tQ, 0.45);
  if (qk > 0.01) {
    ctx.save(); ctx.translate(487, 497); ctx.scale(Math.min(1.04, qk), Math.min(1.04, qk));
    roundRect(ctx, -400, -62, 800, 124, 30); ctx.fillStyle = 'rgba(12,14,26,0.94)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
    const f = H.fitText(ctx, P.question || 'Whose side are you on?', 'display', 52, 30, 720);
    ctx.font = f.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff'; ctx.fillText(f.text, 0, 3);
    ctx.restore();
    const pq = 1 + 0.08 * Math.sin(t * 5);
    ctx.save(); ctx.globalAlpha = clamp(qk); ctx.translate(530, 690); ctx.scale(pq, pq);
    ctx.font = H.font('display', 90); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ACC; ctx.fillText('?', 0, 0);
    ctx.restore();
  }
}
