// Scene "login-handover" (full frame, 1 beat per mode). A person hands their bank login to an AI agent robot, and the
// consequences come back to them. No logos: bank names are plain text pills; the password is always masked dots.
// modes:
//   hook   (cold open, ~3 s, action from frame 0): living room at night; a glowing masked-password card is already in
//          the air from the person on the sofa to the robot; a generic "Your bank" app panel unlocks, activity slips
//          (Transfer / Pay / Buy) fly out of it into the person's lap, and a big "<onYou>" pill with an arrow lands
//          over the person, who goes from smiling to shocked. Ends settled.
//   email  (night room): a big email card: from-pill (bank name as text), subject, body lines type in; on loginCue a
//          masked login field appears; on agentCue a small agent robot reaches for it with an "<agent>" chip, and on
//          neverCue a "<stamp>" cross stamp lands on the field, the robot backs off. A reader with a phone at left.
//   quote  (same living room): the robot works a phone, activity slips keep landing in the person's lap; a verbatim
//          quote card (text + attribution as text) types in on quoteCue; a check pill "<confirm>" lands on confirmCue.
//   inside (night): a big generic "customer account" dashboard on a monitor; on agentsCue three small agent robots
//          pop inside it, each with a key badge; on passCue a "<pass>" pill; a dashed "<asked>" box around one robot,
//          which on beyondCue wanders out of it toward the Transfer row with a "?"; a "<source>" pill on sourceCue.
// Fits: "don't share your password with AI", "you're responsible", "agents found inside bank accounts".
// params: mode; hook: onYou ("ON YOU"), bank ("Your bank"), slips (["Transfer", "Pay", "Buy"]);
//         email: from ("Your bank"), subject, field ("Username + password"), agent ("AI tool or agent"),
//                stamp ("DON'T SHARE"), loginCue, agentCue, neverCue;
//         quote: quote, by, confirm ("Email confirmed real"; '' hides it), slips, quoteCue, confirmCue;
//         inside: title ("Customer account"), pass ("Using the customer's password"), asked ("Asked: check balance"),
//                 source ("Source, Date"), agentsCue, passCue, beyondCue, sourceCue
// Cues are narration words ("word#n" = the (n+1)th time); without them fractions of the scene are used.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d) => {
    if (!w) return d;
    const m = String(w).match(/^(.*)#(\d+)$/);
    const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? d : v;
  };
  const danger = '#ff6b5e';
  const mode = P.mode || 'hook';

  // ---- shared drawing helpers -------------------------------------------------------------------------------
  const pill = (x, y, k, text, o = {}) => { if (k > 0) K.drawLabel(ctx, x, y, Math.min(1.05, k), Object.assign({ text, size: 28 }, o)); };
  const dots = (x, y, n, r, col) => { ctx.fillStyle = col; for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.arc(x + i * r * 2.6, y, r, 0, Math.PI * 2); ctx.fill(); } };
  const keyIcon = (x, y, s, col) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(-14, 0, 11, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-3, 0); ctx.lineTo(24, 0); ctx.moveTo(16, 0); ctx.lineTo(16, 9); ctx.moveTo(24, 0); ctx.lineTo(24, 7); ctx.stroke();
    ctx.restore();
  };
  // the masked password card (key + dots), centred at x, y
  const passCard = (x, y, s, rot, glowA) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    if (glowA > 0) K.glow(ctx, 0, 0, 140, ACC, 0.45 * glowA);
    roundRect(ctx, -95, -48, 190, 96, 18); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = ACC; ctx.stroke();
    keyIcon(-50, -12, 0.9, '#283152');
    dots(-10, -12, 5, 7, '#283152');
    roundRect(ctx, -70, 14, 140, 12, 6); ctx.fillStyle = '#c9cfe0'; ctx.fill();
    ctx.restore();
  };
  // an activity slip (receipt) with a word on it
  const slip = (x, y, s, rot, text) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.font = H.font('ui', 28); const w = Math.max(150, ctx.measureText(text).width + 70);
    ctx.beginPath(); ctx.moveTo(-w / 2, -30); ctx.lineTo(w / 2, -30); ctx.lineTo(w / 2, 24);
    for (let i = 0; i <= 8; i++) ctx.lineTo(w / 2 - (w * i) / 8, 24 + (i % 2 ? 8 : 0));
    ctx.closePath(); ctx.fillStyle = '#fffdf4'; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.18)'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = danger; ctx.beginPath(); ctx.arc(-w / 2 + 24, -3, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1b1d2c'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, -w / 2 + 42, -2);
    ctx.restore();
  };
  // generic bank app panel (no logo): header text, lock, rows
  const bankPanel = (cx, cy, W, Hh, k, unlock, rows, title) => {
    if (k <= 0) return;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(Math.min(1.04, k), Math.min(1.04, k));
    roundRect(ctx, -W / 2 - 12, -Hh / 2 - 12, W + 24, Hh + 24, 34); ctx.fillStyle = '#1c2033'; ctx.fill();
    roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 24); ctx.fillStyle = '#eef1f8'; ctx.fill();
    roundRect(ctx, -W / 2, -Hh / 2, W, 74, 24); ctx.fillStyle = '#2a3a6e'; ctx.fill(); ctx.fillRect(-W / 2, -Hh / 2 + 50, W, 24);
    ctx.font = H.font('ui', 30); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(title, -W / 2 + 26, -Hh / 2 + 38);
    K.drawLock(ctx, W / 2 - 46, -Hh / 2 + 66, 0.42, { open: unlock });
    rows.forEach((r, i) => {
      const y = -Hh / 2 + 120 + i * 62;
      if (y > Hh / 2 - 30) return;
      roundRect(ctx, -W / 2 + 22, y - 24, W - 44, 48, 12); ctx.fillStyle = r.hot ? rgba(ACC, 0.35) : '#dde2ef'; ctx.fill();
      ctx.font = H.font('ui', 26); ctx.fillStyle = '#283152'; ctx.fillText(r.text, -W / 2 + 40, y + 1);
      if (r.right) { ctx.textAlign = 'right'; ctx.fillText(r.right, W / 2 - 40, y + 1); ctx.textAlign = 'left'; }
    });
    ctx.restore();
  };

  // ---- modes ----------------------------------------------------------------------------------------------------
  if (mode === 'hook' || mode === 'quote') {
    const isHook = mode === 'hook';
    const slips = P.slips || ['Transfer', 'Pay', 'Buy'];
    // timings
    const tCatch = isHook ? 0.55 : -1;                       // card reaches the robot
    const tUnlock = isHook ? 0.75 : -1;
    const tQuote = isHook ? Infinity : at(P.quoteCue, D * 0.2) - 0.25;
    const tConfirm = isHook || P.confirm === '' ? Infinity : at(P.confirmCue, D * 0.75) - 0.2;
    const tSlip = isHook ? [0.95, 1.25, 1.55] : [0.3, D * 0.35, D * 0.55].map((v, i) => v + i * 0.0);
    const tOn = isHook ? 1.85 : Infinity;

    ctx.save();
    K.camera(ctx, t, isHook ? [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: Math.max(D, 3), zoom: 1.05, x: 470, y: 760 }]
      : [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
    const room = K.world.livingRoomNight(ctx, { t, lampOn: true });
    const sofa = room.sofa || { x: 480, seatY: 880, feetY: 1030 };
    const px = sofa.x - 170, rx = 760;
    const landed = slips.map((s, i) => t > tSlip[i] + 0.7);
    const nLanded = landed.filter(Boolean).length;
    const shocked = isHook ? t > 1.2 : nLanded >= 2;
    K.drawPerson(ctx, px, sofa.feetY, 1.7, { t, pose: 'sit', seat: false,
      mood: shocked ? (isHook ? 'shocked' : 'worried') : 'happy', skin: 1, hair: 2, shirt: 2, hairStyle: 'short', seed: 12, look: 0.6 });
    // the robot, working once it has the login
    const hasCard = !isHook || t > tCatch;
    K.drawRobot(ctx, rx, sofa.feetY, 1.25, { t, state: hasCard ? 'working' : 'idle', seed: 5, flip: true });
    // the card: in the air at frame 0 (hook), then held by the robot with a glow
    if (isHook && t < tCatch) {
      const u = smooth(clamp(0.35 + (t / tCatch) * 0.65));
      const x = lerp(px + 60, rx - 80, u), y = lerp(760, 790, u) - Math.sin(u * Math.PI) * 120;
      passCard(x, y, 0.95, -0.25 + u * 0.3, 1);
    } else passCard(rx - 95, 830, 0.62, 0.12, 0.5 + 0.3 * Math.sin(t * 3));

    // receipts in the lap (settled pile) and the ones flying
    slips.forEach((s, i) => {
      const u = clamp((t - tSlip[i]) / 0.7);
      if (u <= 0) return;
      const e = H.easeInOutCubic(u);
      const sx = isHook ? 600 : rx - 40, sy = isHook ? 640 : 760;
      const ex = px + 70 + (i - 1) * 46, ey = 880 - i * 22;
      const x = lerp(sx, ex, e), y = lerp(sy, ey, e) - Math.sin(e * Math.PI) * 160;
      slip(x, y, lerp(0.75, 0.78, e), lerp(0.4, -0.12 + i * 0.12, e), s);
    });

    if (isHook) {
      // bank panel above the robot unlocks, rows light as slips leave
      const pk = 1;
      const un = smooth((t - tUnlock) / 0.3);
      const rows = slips.map((s, i) => ({ text: s, right: t > tSlip[i] ? '✓' : '', hot: t > tSlip[i] && t < tSlip[i] + 0.5 }));
      bankPanel(660, 610, 380, 300, pk, un, rows, P.bank || 'Your bank');
      // ON YOU: arrow + big pill over the person
      const ok = K.popIn(t, tOn, 0.45);
      if (ok > 0) {
        const bob = Math.sin((t - tOn) * 4) * 6 * clamp(1 - (t - tOn) / 1.5);
        ctx.save(); ctx.translate(px - 60, 540 + bob); ctx.scale(Math.min(1.06, ok), Math.min(1.06, ok));
        const txt = P.onYou || 'ON YOU';
        ctx.font = H.font('display', 58); const w = ctx.measureText(txt).width + 64;
        roundRect(ctx, -w / 2, -52, w, 104, 52); ctx.fillStyle = ACC; ctx.fill();
        ctx.fillStyle = K.ACCENT.deep; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 4);
        ctx.beginPath(); ctx.moveTo(30, 50); ctx.lineTo(82, 50); ctx.lineTo(66, 96); ctx.closePath(); ctx.fillStyle = ACC; ctx.fill();
        ctx.restore();
      }
    } else {
      // a phone in the robot's hand, glowing while it works
      K.drawPhone(ctx, rx - 40, 860, 0.55, { t, bubbles: 3, every: 0.5, shadow: false });
      // quote card types in
      const qk = K.popIn(t, tQuote, 0.45);
      if (qk > 0) {
        const X0 = 90, X1 = 885, W = X1 - X0, PAD = 30;
        const quote = String(P.quote || 'Quote here');
        const size = 40, lines = H.wrap(ctx, `“${quote}”`, 'display', size, W - 2 * PAD);
        const ch = PAD + lines.length * size * 1.2 + 16 + 30 + PAD;
        ctx.save(); ctx.translate((X0 + X1) / 2, 420 + ch / 2); ctx.scale(Math.min(1.03, 0.75 + 0.25 * qk), Math.min(1.03, 0.75 + 0.25 * qk)); ctx.globalAlpha = clamp(qk * 2);
        ctx.translate(-(X0 + X1) / 2, -(420 + ch / 2));
        roundRect(ctx, X0, 420, W, ch, 26); ctx.fillStyle = 'rgba(10,12,24,0.94)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.8); ctx.stroke();
        const shown = K.typewriter(lines.join(' '), t, 30, tQuote + 0.25).length;
        ctx.font = H.font('display', size); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
        let used = 0;
        lines.forEach((ln, i) => {
          const n = clamp(shown - used, 0, ln.length); used += ln.length + 1;
          let txt = ln.slice(0, n); const sp = txt.lastIndexOf(' ');
          if (n < ln.length) txt = sp > 0 ? txt.slice(0, sp) : '';
          if (txt) ctx.fillText(txt, X0 + PAD, 420 + PAD + size * 0.95 + i * size * 1.2);
        });
        ctx.font = H.font('ui', 26); ctx.fillStyle = rgba('#ffffff', 0.75);
        ctx.fillText(`— ${P.by || 'Source'}`, X0 + PAD, 420 + PAD + lines.length * size * 1.2 + 34);
        ctx.restore();
      }
      // confirmed pill with a check
      const ck = K.popIn(t, tConfirm, 0.45);
      if (ck > 0) {
        pill(640, 716, ck, P.confirm || 'Email confirmed real', { accent: true, size: 28 });
        K.drawShield(ctx, 400, 724, 0.45 * Math.min(1.05, ck), { check: clamp((t - tConfirm - 0.2) / 0.4) });
      }
    }
    ctx.restore();
    void ACC;
    return;
  }

  if (mode === 'email') {
    const tLogin = at(P.loginCue, D * 0.4) - 0.2;
    const tAgent = at(P.agentCue, D * 0.6) - 0.2;
    const tNever = at(P.neverCue, D * 0.8) - 0.15;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 520, y: 700 }, { t: D, zoom: 1.0 }]);
    K.world.room(ctx, { t, time: 'night', floorY: 990, lamp: false, plant: false, picture: false });
    // email card
    const X0 = 90, X1 = 885, Y0 = 410, Y1 = 830, W = X1 - X0;
    const ek = K.popIn(t, 0.05, 0.45);
    ctx.save(); ctx.translate((X0 + X1) / 2, (Y0 + Y1) / 2); const es = Math.min(1.03, 0.8 + 0.2 * ek); ctx.scale(es, es); ctx.globalAlpha = clamp(ek * 2); ctx.translate(-(X0 + X1) / 2, -(Y0 + Y1) / 2);
    roundRect(ctx, X0 + 8, Y0 + 10, W, Y1 - Y0, 22); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
    roundRect(ctx, X0, Y0, W, Y1 - Y0, 22); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    roundRect(ctx, X0, Y0, W, 70, 22); ctx.fillStyle = '#2a2f45'; ctx.fill(); ctx.fillRect(X0, Y0 + 46, W, 24);
    // envelope glyph + "Inbox"
    ctx.strokeStyle = ACC; ctx.lineWidth = 4; ctx.strokeRect(X0 + 26, Y0 + 22, 40, 28);
    ctx.beginPath(); ctx.moveTo(X0 + 26, Y0 + 22); ctx.lineTo(X0 + 46, Y0 + 40); ctx.lineTo(X0 + 66, Y0 + 22); ctx.stroke();
    ctx.font = H.font('ui', 28); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('Inbox', X0 + 84, Y0 + 37);
    // from + subject
    ctx.font = H.font('ui', 26); ctx.fillStyle = '#6b7391'; ctx.fillText('From', X0 + 28, Y0 + 112);
    ctx.font = H.font('ui', 28); const fw = ctx.measureText(P.from || 'Your bank').width + 36;
    roundRect(ctx, X0 + 100, Y0 + 92, fw, 42, 21); ctx.fillStyle = '#2a3a6e'; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.fillText(P.from || 'Your bank', X0 + 118, Y0 + 114);
    const subj = H.wrap(ctx, P.subject || 'Protecting your finances', 'display', 36, W - 56);
    ctx.font = H.font('display', 36); ctx.fillStyle = '#141829'; ctx.textBaseline = 'alphabetic';
    subj.slice(0, 2).forEach((ln, i) => ctx.fillText(ln, X0 + 28, Y0 + 182 + i * 44));
    const by = Y0 + 182 + Math.min(2, subj.length) * 44 - 6;
    // body lines grow
    for (let i = 0; i < 2; i++) {
      const g = smooth((t - 0.5 - i * 0.4) / 0.7);
      roundRect(ctx, X0 + 28, by + i * 34, (W - 56) * (i ? 0.7 : 0.95) * g, 14, 7); ctx.fillStyle = '#c9cfe0'; ctx.fill();
    }
    // login field
    const fy = by + 62;
    const lk = K.popIn(t, tLogin, 0.4);
    if (lk > 0) {
      ctx.save(); ctx.translate(X0 + W / 2, fy + 40); ctx.scale(Math.min(1.04, lk), Math.min(1.04, lk));
      roundRect(ctx, -W / 2 + 28, -40, W - 56, 80, 16); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#2a3a6e'; ctx.stroke();
      keyIcon(-W / 2 + 80, -2, 1.0, '#2a3a6e');
      ctx.font = H.font('ui', 26); ctx.fillStyle = '#283152'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(P.field || 'Username + password', -W / 2 + 128, -12);
      dots(-W / 2 + 134, 18, 8, 6, '#283152');
      ctx.restore();
    }
    ctx.restore();
    // reader with a phone (left, below/beside the card)
    K.drawPerson(ctx, 190, 1042, 0.85, { t, pose: 'phone', mood: t > tNever ? 'worried' : 'neutral', skin: 3, hair: 0, shirt: 4, hairStyle: 'long', seed: 21, look: 1 });
    // agent robot reaching for the field, then backing off
    const ak = smooth((t - tAgent) / 0.5);
    const back = smooth((t - tNever - 0.3) / 0.5);
    const rX = lerp(1010, 800, ak) + 50 * back;
    if (ak > 0) {
      K.drawRobot(ctx, rX, 1042, 0.8, { t, state: back > 0.5 ? 'thinking' : 'working', seed: 8, flip: true });
      // reaching arm toward the field
      if (back < 1) {
        ctx.save(); ctx.globalAlpha = 1 - back; ctx.strokeStyle = '#dfe4f1'; ctx.lineWidth = 12; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(rX - 40, 960); ctx.quadraticCurveTo(rX - 90, 920, rX - 120 + 20 * (1 - ak), fy + 70); ctx.stroke(); ctx.restore();
      }
      pill(520, 960, K.popIn(t, tAgent + 0.2, 0.4), P.agent || 'AI tool or agent', { size: 28, dot: true });
    }
    // DON'T SHARE stamp on the field
    if (t > tNever) K.drawStamp(ctx, 640, fy + 40 + 95 * 0.95, 0.95, { kind: 'cross', text: P.stamp || "DON'T SHARE", land: (t - tNever) / 0.5 });
    ctx.restore();
    return;
  }

  if (mode === 'inside') {
    const tAg = at(P.agentsCue, D * 0.2) - 0.2;
    const tPass = at(P.passCue, D * 0.5) - 0.2;
    const tBeyond = at(P.beyondCue, D * 0.75) - 0.25;
    const tSrc = at(P.sourceCue, D * 0.08) - 0.2;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 487, y: 720 }]);
    K.world.office(ctx, { t, time: 'night' });
    // big monitor
    const X0 = 95, X1 = 880, Y0 = 430, Y1 = 960, W = X1 - X0;
    roundRect(ctx, X0 - 18, Y0 - 18, W + 36, Y1 - Y0 + 36, 26); ctx.fillStyle = '#141829'; ctx.fill();
    ctx.fillStyle = '#141829'; ctx.fillRect(470, Y1 + 10, 34, 50); roundRect(ctx, 400, Y1 + 55, 175, 16, 8); ctx.fill();
    roundRect(ctx, X0, Y0, W, Y1 - Y0, 14); ctx.fillStyle = '#eef1f8'; ctx.fill();
    roundRect(ctx, X0, Y0, W, 70, 14); ctx.fillStyle = '#2a3a6e'; ctx.fill(); ctx.fillRect(X0, Y0 + 50, W, 20);
    ctx.font = H.font('ui', 30); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.title || 'Customer account', X0 + 26, Y0 + 36);
    // rows on the left
    const rows = ['Balance', 'Transfer', 'Pay bills'];
    const beyond = smooth((t - tBeyond) / 1.0);
    rows.forEach((r, i) => {
      const y = Y0 + 125 + i * 70;
      const hot = i === 1 && beyond > 0.6;
      roundRect(ctx, X0 + 24, y - 26, 300, 52, 12); ctx.fillStyle = hot ? rgba(danger, 0.3 + 0.15 * Math.sin(t * 6)) : '#dde2ef'; ctx.fill();
      ctx.font = H.font('ui', 28); ctx.fillStyle = '#283152'; ctx.fillText(r, X0 + 44, y + 1);
    });
    // asked zone on the right (dashed box)
    const zx = 600, zy = Y0 + 300, zw = 250, zh = 250;
    const zk = clamp((t - tAg - 0.3) / 0.4);
    if (zk > 0) {
      ctx.save(); ctx.globalAlpha = zk; ctx.setLineDash([14, 10]); ctx.strokeStyle = '#3fbf7f'; ctx.lineWidth = 4;
      roundRect(ctx, zx - zw / 2, zy - zh / 2 + 30, zw, zh, 16); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = H.font('ui', 26); ctx.fillStyle = '#1f6e47'; ctx.textAlign = 'center'; ctx.fillText(P.asked || 'Asked: check balance', zx, zy - zh / 2 + 6);
      ctx.restore();
    }
    // three small agents inside the account
    const spots = [[600, Y1 - 30], [230, Y1 - 14], [790, Y1 - 14]];
    spots.forEach(([sx, sy], i) => {
      const k = K.popIn(t, tAg + i * 0.25, 0.45);
      if (k <= 0) return;
      let x = sx, y = sy;
      if (i === 0) { x = lerp(sx, 400, beyond); y = lerp(sy, Y0 + 300, beyond) + Math.abs(Math.sin(beyond * Math.PI * 3)) * -14; }
      ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.05, k), Math.min(1.05, k)); ctx.translate(-x, -y);
      K.drawRobot(ctx, x, y, 0.78, { t: t + i, state: 'working', seed: 30 + i, flip: i === 0 && beyond > 0.05 });
      // key badge
      roundRect(ctx, x - 32, y - 222, 64, 36, 12); ctx.fillStyle = ACC; ctx.fill(); keyIcon(x + 3, y - 204, 0.7, K.ACCENT.deep);
      ctx.restore();
    });
    if (beyond > 0.5) {
      const qk = K.popIn(t, tBeyond + 0.5, 0.4);
      if (qk > 0) { ctx.save(); ctx.translate(480, Y0 + 110); ctx.scale(Math.min(1.05, qk), Math.min(1.05, qk)); ctx.font = H.font('display', 64); ctx.fillStyle = danger; ctx.textAlign = 'center'; ctx.fillText('?', 0, 0); ctx.restore(); }
    }
    // pills
    pill(X1 - 150, Y0 + 56, K.popIn(t, tSrc, 0.4), P.source || 'Source, Date', { size: 28, dot: true });
    pill(487, 1046, K.popIn(t, tPass, 0.4), P.pass || "Using the customer's password", { size: 28, accent: true });
    ctx.restore();
    return;
  }
}
