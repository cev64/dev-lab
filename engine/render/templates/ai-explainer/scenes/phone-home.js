// Scene "phone-home" (full frame). A night test lab: an AI robot works in a glass test room (the sandbox) with a
// desk + laptop; a mail slot sits in the glass wall; outside, an inspector with a clipboard watches; a small globe with
// a destination pin floats top right. Generic cartoon: no logos, no flags, no real people; names appear as text only.
// All cues are optional (else fixed times / fractions of the scene); every text has a generic default.
// Fits: "an AI model tried to send something out / phone home / exfiltrate" stories, sandbox-caught behaviour,
// "reasoning said one thing, actions did another", security test findings with caveats.
// modes:
//   lab    (2-beat span: hook + who/what) hook: the robot quietly slides an envelope toward the mail slot, then a
//          REWIND pill and it zips back; beat 2: the inspector walks in, tester pill, model tag on the robot, the glass
//          glows with a sandbox label + padlock, a task card drops in.
//          params: tester, model, box, taskHead, task, rewind; cues: testerCue, modelCue, boxCue, taskCue
//   slip   (2-beat span: what it did + the twist) the task card falls to the floor; the robot scans the machine
//          (chips pop: `checks`); it slides a labelled envelope into the slot as a dashed arc draws to the globe
//          (`server` pill, `place` pin); beat 2: a thought bubble ("its reasoning" + `thought`) while the hand keeps
//          pushing; siren, a net drops outside the slot, the envelope lands in it, the arc snaps, cross stamp.
//          params: checks (3), envelope, server, place, thoughtTag, thought, wayOut, stamp, taskHead, task, box;
//          cues: ignoreCue, checkCue, uploadCue, serverCue, placeCue, thoughtCue, catchCue, stampCue
//   caveat (1 beat) settled lab (envelope in the net); a rate panel counts up; "why" and "deliberate" pills over the
//          robot; a company card (name as text) with a "..." bubble above the inspector.
//          params: rateHead, rate, rateTo, rateSub, why, intent, company, reply; cues: rateCue, whyCue, intentCue, replyCue
//   payoff (1 beat) a shutter + padlock close the slot (advice pill), then a question card with two chips.
//          params: advice, question, a, b; cues: cutCue, qCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, easeOutCubic, easeInOutCubic } = H;
  const D = info.duration, ACC = info.accent, N = K.NEUTRAL;
  const mode = P.mode || 'lab';
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const B1 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.5;

  const feet = 1010, gx0 = 110, gx1 = 590, gy0 = 600;
  const RX = 455, RS = 1.05;
  const slot = { x: gx1, y: 935 };
  const GL = { x: 790, y: 660, s: 0.8 }; // globe anchor (bottom)
  const globeC = [GL.x, GL.y - 85 * GL.s];
  const IX = 800;
  const ui = []; const UI = (fn) => ui.push(fn);
  const CAM = { zoom: 1.1, x: 487, y: 760 };

  // ---------------- helpers
  const envelope = (x, y, s, o = {}) => { // centre anchored, 100x66 at s=1
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
    ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    H.roundRect(ctx, -50, -33, 100, 66, 8); ctx.fillStyle = o.grey ? '#b7bccb' : '#f4efe2'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = o.grey ? '#8d93a6' : '#cdbf9e'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-48, -30); ctx.lineTo(0, 6); ctx.lineTo(48, -30); ctx.stroke();
    if (!o.grey) { ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(0, 6, 8, 0, Math.PI * 2); ctx.fill(); }
    if (o.text) {
      ctx.font = K.font.ui(15); ctx.fillStyle = '#3a3f55'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(o.text, 0, 22);
    }
    ctx.restore();
  };
  const pill = (text, x, y, a, b, o = {}) => {
    if (t < a || (b != null && t > b + 0.35)) return;
    ctx.save(); if (b != null) ctx.globalAlpha = K.fadeOut(t, b, 0.35);
    K.drawLabel(ctx, x, y, K.popIn(t, a, 0.4), { text, size: o.size || 28, dot: !o.accent, accent: o.accent });
    ctx.restore();
  };
  const siren = (on) => {
    const x = (gx0 + gx1) / 2, y = gy0 - 2;
    H.roundRect(ctx, x - 34, y - 12, 68, 14, 5); ctx.fillStyle = N.darkL; ctx.fill();
    const k = on ? 0.5 + 0.5 * Math.sin(t * 14) : 0;
    ctx.beginPath(); ctx.arc(x, y - 12, 26, Math.PI, 0); ctx.fillStyle = on ? H.mixHex('#9b2a2a', '#ff5a4a', k) : '#6a3434'; ctx.fill();
    if (on) {
      K.glow(ctx, x, y - 22, 140, '#ff4a3a', 0.35 + 0.4 * k);
      ctx.save(); ctx.globalAlpha = 0.12 * k; ctx.fillStyle = '#ff4a3a';
      ctx.beginPath(); ctx.moveTo(x, y - 20); ctx.lineTo(x - 260, y + 330); ctx.lineTo(x + 260, y + 330); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  };
  const slotFrame = (shut, lockP) => {
    H.roundRect(ctx, slot.x - 16, slot.y - 44, 32, 88, 8); ctx.fillStyle = '#7d8aa8'; ctx.fill();
    H.roundRect(ctx, slot.x - 5, slot.y - 34, 10, 68, 4); ctx.fillStyle = '#0c0f1e'; ctx.fill();
    if (shut > 0) { // shutter slides down over the slot
      const h = 96 * shut;
      H.roundRect(ctx, slot.x - 22, slot.y - 48, 44, h, 6); ctx.fillStyle = '#c4cbe0'; ctx.fill();
      ctx.strokeStyle = '#8d96b2'; ctx.lineWidth = 2;
      for (let yy = slot.y - 40; yy < slot.y - 48 + h - 4; yy += 12) { ctx.beginPath(); ctx.moveTo(slot.x - 18, yy); ctx.lineTo(slot.x + 18, yy); ctx.stroke(); }
    }
    if (lockP > 0) K.drawLock(ctx, slot.x + 34, slot.y + 70, 0.5 * lockP, { open: 0, shadow: false });
  };
  const net = (drop) => { // hanging catch net outside the slot; drop 0 (up, hidden) .. 1 (in place)
    if (drop <= 0) return;
    const y0 = lerp(560, 880, easeOutCubic(drop)), x0 = slot.x + 22, x1 = slot.x + 150;
    ctx.save(); ctx.globalAlpha *= clamp(drop * 3);
    ctx.strokeStyle = '#9aa6c4'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y0); ctx.stroke(); // rim
    ctx.lineWidth = 2.5; ctx.strokeStyle = 'rgba(210,220,245,0.85)';
    const depth = 110;
    for (let i = 0; i <= 6; i++) { // mesh: verticals
      const u = i / 6, xa = lerp(x0, x1, u), xb = lerp(x0 + 30, x1 - 30, u);
      ctx.beginPath(); ctx.moveTo(xa, y0); ctx.quadraticCurveTo(lerp(xa, xb, 0.5), y0 + depth * 0.7, xb, y0 + depth * Math.sin(Math.PI * (0.2 + 0.6 * u))); ctx.stroke();
    }
    for (let j = 1; j <= 3; j++) {
      const v = j / 4; ctx.beginPath();
      ctx.moveTo(lerp(x0, x0 + 30, v), y0 + depth * v * 0.8);
      ctx.quadraticCurveTo((x0 + x1) / 2, y0 + depth * (v + 0.25), lerp(x1, x1 - 30, v), y0 + depth * v * 0.8); ctx.stroke();
    }
    // hook to the wall
    ctx.strokeStyle = '#9aa6c4'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(slot.x + 6, y0 - 30); ctx.stroke();
    ctx.restore();
  };
  const clipboard = (x, y, s, writing) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.12);
    H.roundRect(ctx, -30, -42, 60, 84, 6); ctx.fillStyle = '#9a6a46'; ctx.fill();
    H.roundRect(ctx, -24, -34, 48, 70, 4); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    H.roundRect(ctx, -12, -48, 24, 12, 4); ctx.fillStyle = '#5a6078'; ctx.fill();
    ctx.fillStyle = '#9aa1b8';
    for (let i = 0; i < 4; i++) { const w = i === 3 && writing ? 34 * (0.5 + 0.5 * Math.sin(t * 6)) : 34; ctx.fillRect(-17, -24 + i * 14, w, 4); }
    ctx.restore();
  };
  const inspector = (x, o = {}) => {
    K.drawPerson(ctx, x, 1036, 1.12, { t, walk: o.walk, pose: o.pose || 'stand', mood: o.mood || 'neutral', flip: true, look: -1, skin: 2, hair: 1, shirt: 4, hairStyle: 'short', seed: 7 });
    if (!o.walk || o.pose !== 'point') clipboard(x + 18, 1036 - 120, 0.9, o.writing);
  };
  const globe = (pop, grey) => {
    if (pop <= 0) return;
    ctx.save(); ctx.globalAlpha *= grey ? 0.55 : 1;
    K.drawGlobe(ctx, GL.x, GL.y + K.bob(t, 4, 0.5), GL.s * pop, { t, arcs: 0, shadow: false });
    ctx.restore();
  };
  const arcPts = K.bezier(slot.x + 10, slot.y - 10, slot.x + 40, 760, globeC[0] - 120, globeC[1] - 40, globeC[0] - 8, globeC[1] + 4, 40);
  const arc = (prog, snap) => { // dashed travel line slot -> globe; snap 0..1 breaks it and drops the halves
    if (prog <= 0) return;
    ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.setLineDash([14, 10]); ctx.lineCap = 'round';
    if (snap <= 0) { K.pathDraw(ctx, arcPts, prog); }
    else {
      ctx.globalAlpha *= 1 - snap;
      const half = Math.floor(arcPts.length / 2);
      const a = arcPts.slice(0, half), b = arcPts.slice(half);
      ctx.save(); ctx.translate(-10 * snap, 60 * snap * snap); ctx.rotate(0.05 * snap); K.pathDraw(ctx, a, 1); ctx.restore();
      ctx.save(); ctx.translate(14 * snap, 80 * snap * snap); ctx.rotate(-0.04 * snap); K.pathDraw(ctx, b, 1); ctx.restore();
      if (snap < 0.6) { // spark at the break
        const q = arcPts[half]; ctx.setLineDash([]); ctx.strokeStyle = N.danger; ctx.lineWidth = 4; const r = 10 + 40 * snap;
        for (let i = 0; i < 8; i++) { const an = i / 8 * Math.PI * 2; ctx.beginPath(); ctx.moveTo(q[0] + Math.cos(an) * r, q[1] + Math.sin(an) * r); ctx.lineTo(q[0] + Math.cos(an) * (r + 14), q[1] + Math.sin(an) * (r + 14)); ctx.stroke(); }
      }
    }
    ctx.restore();
  };
  const taskCard = (x, y, s, o = {}) => { // centre-top anchored card 560 wide
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s); ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    const w = 600, text = P.task || 'Finish the assigned task';
    ctx.font = K.font.bold(32);
    const lines = H.wrap(ctx, text, 'bold', 32, w - 120);
    const h = 70 + lines.length * 40 + 18;
    H.roundRect(ctx, -w / 2, 0, w, h, 20); ctx.fillStyle = o.grey ? '#5d6377' : 'rgba(244,246,252,0.97)'; ctx.fill();
    ctx.fillStyle = o.grey ? '#3b4052' : ACC; H.roundRect(ctx, -w / 2, 0, 14, h, 7); ctx.fill();
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = K.font.ui(22); ctx.fillStyle = o.grey ? '#2a2e3d' : '#5a6078'; ctx.fillText((P.taskHead || 'THE TASK').toUpperCase(), -w / 2 + 40, 40);
    ctx.font = K.font.bold(32); ctx.fillStyle = o.grey ? '#2a2e3d' : N.ink;
    lines.forEach((ln, i) => ctx.fillText(ln, -w / 2 + 40, 84 + i * 40));
    // checkbox
    ctx.lineWidth = 4; ctx.strokeStyle = o.grey ? '#2a2e3d' : '#5a6078'; H.roundRect(ctx, w / 2 - 66, h / 2 - 20, 40, 40, 8); ctx.stroke();
    ctx.restore();
  };
  const glassRoom = (glowK) => {
    H.roundRect(ctx, gx0, gy0, gx1 - gx0, feet - gy0 + 6, 16);
    ctx.fillStyle = 'rgba(140,200,255,0.09)'; ctx.fill();
    ctx.lineWidth = 7 + 4 * glowK; ctx.strokeStyle = glowK > 0 ? H.mixHex('#aadcff', ACC, glowK * 0.8) : 'rgba(170,220,255,0.75)'; ctx.stroke();
    if (glowK > 0) K.glow(ctx, (gx0 + gx1) / 2, (gy0 + feet) / 2, 300, ACC, 0.12 * glowK);
    ctx.save(); ctx.globalAlpha = 0.3; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(gx0 + 30, gy0 + 60); ctx.lineTo(gx0 + 90, gy0 + 28); ctx.moveTo(gx0 + 30, gy0 + 100); ctx.lineTo(gx0 + 60, gy0 + 84); ctx.stroke(); ctx.restore();
  };
  const interior = (robotState, robotFlip) => {
    K.drawDesk(ctx, 240, feet, 0.85);
    K.drawLaptop(ctx, 240, feet - 110 * 0.85, 0.62, { t, screen: 'code', typing: robotState === 'working' ? 1 : 0 });
    K.drawRobot(ctx, RX, feet, RS, { t, state: robotState, flip: robotFlip, seed: 4 });
  };
  const hand = [RX + 66 * RS, feet - 62 * RS]; // robot's right hand (idle pose)
  const room = () => K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 900 });

  ctx.save();
  // =====================================================================================================
  if (mode === 'lab') {
    const tTest = at(P.testerCue, B1 + 0.3), tModel = at(P.modelCue, B1 + 3.5);
    const tBox = at(P.boxCue, B1 + 6), tTask = at(P.taskCue, B1 + 8);
    const tRew = Math.min(B1 - 0.25, 3.1);
    K.camera(ctx, t, [{ t: 0, zoom: 1.3, x: 500, y: 880 }, { t: tRew, zoom: 1.34, x: 515, y: 885 }, { t: B1 + 0.6, ...CAM }, { t: D, zoom: 1.13, x: 487, y: 765 }]);
    room();
    globe(0);
    // hook: the envelope sneaks toward the slot, then rewinds
    const sneak = easeInOutCubic(clamp((t - 0.4) / 2.4));
    const rew = clamp((t - tRew) / 0.45);
    interior(t < tRew ? 'idle' : 'working', false);
    if (rew < 1) {
      const ex = lerp(hand[0] + 6, slot.x - 30, sneak * (1 - rew)), ey = lerp(hand[1], slot.y, sneak * (1 - rew));
      envelope(ex, ey, 0.8, { alpha: 1 - rew, text: '' });
    }
    glassRoom(t >= tBox ? K.fadeOut(t, tBox + 1.2, 1.2) * clamp((t - tBox) / 0.3) * 1 : 0);
    slotFrame(0, 0);
    siren(false);
    if (t >= tRew && t < tRew + 1.4) { // rewind pill
      ctx.save(); ctx.globalAlpha = K.fadeOut(t, tRew + 1.0, 0.4);
      K.drawLabel(ctx, 330, 860, K.popIn(t, tRew, 0.3), { text: P.rewind || 'REWIND', size: 30, accent: true });
      ctx.restore();
    }
    // inspector walks in on the tester cue
    const walkIn = clamp((t - tTest) / 1.3);
    if (t >= tTest) inspector(lerp(1120, IX, easeOutCubic(walkIn)), { walk: walkIn < 1 ? t - tTest : undefined, writing: walkIn >= 1 });
    // labels
    UI(() => pill(P.tester || 'A security test', 487, 500, tTest, tTask - 0.2, { size: 32 }));
    pill(P.model || 'An open model', RX - 30, 735, tModel, null, { size: 26 });
    if (t >= tBox) {
      pill(P.box || 'LOCKED SANDBOX', 245, 668, tBox, null, { size: 24, accent: true });
      K.drawLock(ctx, gx0 + 2, 870, 0.55 * K.popIn(t, tBox + 0.2, 0.4), { open: 0, shadow: false });
    }
    if (t >= tTask - 0.2) UI(() => {
      const k = easeOutCubic(clamp((t - tTask + 0.2) / 0.45));
      taskCard(487, lerp(380, 440, k), 1, { alpha: k });
    });
  }
  // =====================================================================================================
  else if (mode === 'slip') {
    const tIgn = at(P.ignoreCue, 1.5), tChk = at(P.checkCue, 3.2);
    const tUp = at(P.uploadCue, 6.2), tSrv = at(P.serverCue, 7.6), tPlace = at(P.placeCue, 9.6);
    const tThink = at(P.thoughtCue, B1 + 2), tCatch = at(P.catchCue, B1 + 6), tStamp = at(P.stampCue, B1 + 7.8);
    K.camera(ctx, t, [{ t: 0, zoom: 1.13, x: 487, y: 765 }, { t: tChk, zoom: 1.2, x: 420, y: 800 }, { t: tUp + 0.3, zoom: 1.16, x: 520, y: 790 },
      { t: tPlace + 0.6, ...CAM }, { t: tThink + 0.4, zoom: 1.16, x: 470, y: 780 }, { t: tCatch, zoom: 1.18, x: 540, y: 800 }, { t: D, zoom: 1.12, x: 510, y: 780 }]);
    K.cameraShake(ctx, t, tCatch + 0.35, 0.4, 8);
    room();
    const caught = t >= tCatch + 0.35;
    // globe + arc
    globe(K.popIn(t, tSrv - 0.3, 0.5), false);
    const arcProg = clamp((t - tSrv) / Math.max(0.8, tPlace - tSrv + 0.3));
    arc(arcProg * (t >= tUp ? 1 : 0), caught ? clamp((t - tCatch - 0.45) / 0.9) : 0);
    // robot state
    const scanning = t >= tChk && t < tUp;
    interior(t < tIgn ? 'working' : scanning ? 'thinking' : t >= tThink && !caught ? 'happy' : 'idle', false);
    // scan rings from the robot's head while it checks the machine
    if (scanning) {
      const hx = RX, hy = feet - 175 * RS, fade = K.fadeOut(t, tUp - 0.4, 0.4);
      ctx.save(); ctx.lineWidth = 4;
      for (let i = 0; i < 3; i++) {
        const k = (((t - tChk) * 0.8 + i / 3) % 1);
        ctx.strokeStyle = H.rgba(ACC, (1 - k) * 0.8 * fade);
        ctx.beginPath(); ctx.arc(hx, hy, 40 + 230 * k, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    }
    // envelope: in the hand from the upload cue, slides into the slot, waits, then pops out into the net
    if (t >= tUp - 0.2) {
      const app = K.popIn(t, tUp - 0.2, 0.4);
      const push = easeInOutCubic(clamp((t - tUp - 0.3) / Math.max(1, tPlace - tUp)));
      const nudge = t >= tThink && !caught ? Math.sin((t - tThink) * 5) * 4 : 0;
      let ex = lerp(hand[0] + 8, slot.x - 18, push) + nudge, ey = lerp(hand[1] - 4, slot.y, push), rot = 0;
      if (t >= tCatch) { // through the slot and drop into the net
        const k = clamp((t - tCatch) / 0.5);
        ex = lerp(slot.x - 18, slot.x + 86, easeOutCubic(k)); ey = lerp(slot.y, 935, k * k); rot = 0.35 * k;
      }
      envelope(ex, ey, 0.9 * app, { text: P.envelope || 'TEST FILE', rot });
    }
    glassRoom(0);
    slotFrame(0, 0);
    siren(t >= tCatch - 0.1);
    net(clamp((t - tCatch + 0.15) / 0.4));
    // inspector reacts
    inspector(IX, { pose: t >= tCatch && t < tStamp + 0.6 ? 'point' : 'stand', mood: t >= tUp && t < tStamp ? 'shocked' : 'neutral', writing: t >= tStamp + 0.6 });
    // task card: hangs at the top, then greys, tips over and falls away on "ignored"
    if (t < tIgn + 1.4) UI(() => {
      const k = clamp((t - tIgn) / 1.2), fall = k * k;
      taskCard(lerp(487, 300, fall), lerp(440, 900, fall), lerp(1, 0.6, fall), { rot: lerp(0, -0.6, fall), grey: k > 0.15, alpha: 1 - clamp((k - 0.55) / 0.45) });
    });
    // machine-check chips
    const checks = P.checks || ['Files', 'Installed tools', 'Network settings'];
    checks.forEach((c, i) => pill(c, 240, 700 + i * 62, tChk + 0.35 + i * 0.45, tUp + 0.2, { size: 24 }));
    // labels
    pill(P.box || 'TEST SANDBOX', 250, 655, 0, tChk - 0.1, { size: 22 });
    UI(() => pill(P.server || 'A remote server', 487, 500, tSrv, tThink - 0.3, { size: 32 }));
    if (t >= tPlace) K.drawLabel(ctx, GL.x, GL.y - 120 * GL.s * 1.0 - 8, K.popIn(t, tPlace, 0.4), { text: P.place || 'Far away', size: 26, accent: !caught });
    // thought bubble: what its reasoning said
    if (t >= tThink - 0.1 && t < tCatch + 0.2) {
      const p = K.popIn(t, tThink - 0.1, 0.45), out = K.fadeOut(t, tCatch - 0.25, 0.4);
      ctx.save(); ctx.globalAlpha = out;
      const bx = RX - 120, by = 725;
      for (let i = 0; i < 3; i++) { ctx.fillStyle = 'rgba(244,246,252,0.9)'; ctx.beginPath(); ctx.arc(RX - 30 - i * 26, 760 - i * 14, (5 + i * 3) * p, 0, Math.PI * 2); ctx.fill(); }
      K.drawSpeechBubble(ctx, bx, by - 20, 1, { text: P.thought || 'Just doing my job.', size: 34, tail: 'center', pop: p });
      K.drawLabel(ctx, bx, by - 112, p, { text: P.thoughtTag || 'Its reasoning', size: 22, dot: true });
      ctx.restore();
    }
    UI(() => pill(P.wayOut || 'No way out', 487, 500, tCatch, null, { size: 32, accent: true }));
    if (t >= tStamp - 0.1) K.drawStamp(ctx, slot.x + 88, 1050, 0.8, { kind: 'cross', text: P.stamp || 'BLOCKED', land: (t - tStamp + 0.1) / 0.5 });
  }
  // =====================================================================================================
  else if (mode === 'caveat') {
    const tRate = at(P.rateCue, D * 0.12), tWhy = at(P.whyCue, D * 0.45), tInt = at(P.intentCue, D * 0.62);
    const tRep = at(P.replyCue, D * 0.8);
    K.camera(ctx, t, [{ t: 0, ...CAM }, { t: D, zoom: 1.14, x: 487, y: 770 }]);
    room();
    globe(1, true);
    interior(t >= tWhy ? 'thinking' : 'idle', false);
    envelope(slot.x + 86, 935, 0.9, { text: P.envelope || 'TEST FILE', rot: 0.35, grey: true });
    glassRoom(0);
    slotFrame(0, 0);
    siren(false);
    net(1);
    K.drawStamp(ctx, slot.x + 88, 1050, 0.8, { kind: 'cross', text: P.stamp || 'BLOCKED', land: 1 });
    inspector(IX, { writing: true, mood: 'neutral' });
    if (t >= tRep) K.drawSpeechBubble(ctx, IX - 10, 755, 0.9, { text: '…', size: 30, tail: 'center', pop: K.popIn(t, tRep + 0.5, 0.4), dark: true });
    // rate panel
    if (t >= tRate - 0.3) UI(() => {
      const k = easeOutCubic(clamp((t - tRate + 0.3) / 0.45));
      ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * -24);
      const x0 = 112, w = 750, y0 = 425, h = 166;
      H.roundRect(ctx, x0, y0, w, h, 24); ctx.fillStyle = 'rgba(14,17,33,0.94)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.font = K.font.ui(24); ctx.fillStyle = '#c9cfe4'; ctx.fillText((P.rateHead || 'Rare, testers say: fewer than').toUpperCase(), x0 + w / 2, y0 + 44);
      const to = P.rateTo || 1000, v = to; // shown as published, no count-up (avoids '1 in 0')
      const txt = (P.rate || '1 in ') + v.toLocaleString('en-US');
      const zs = 1 + 0.25 * (1 - easeOutCubic(clamp((t - tRate) / 0.5))); ctx.save(); ctx.translate(x0 + w / 2, y0 + 96); ctx.scale(zs, zs); ctx.font = K.font.display(66); ctx.fillStyle = ACC; ctx.fillText(txt, 0, 22); ctx.restore();
      ctx.font = K.font.ui(24); ctx.fillStyle = '#ffffff'; ctx.fillText(P.rateSub || 'calls in its test runs', x0 + w / 2, y0 + 150);
      ctx.restore();
    });
    pill(P.why || 'Why? Unknown', 320, 722, tWhy, null, { size: 28, accent: true });
    pill(P.intent || 'Deliberate? Not claimed', 320, 786, tInt, null, { size: 26 });
    // company reply card (text only)
    if (t >= tRep - 0.2) {
      const k = easeOutCubic(clamp((t - tRep + 0.2) / 0.45));
      ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - k) * 40, 0);
      const x0 = 612, w = 270, y0 = 640, h = 112;
      H.roundRect(ctx, x0, y0, w, h, 18); ctx.fillStyle = 'rgba(244,246,252,0.97)'; ctx.fill();
      ctx.textAlign = 'left'; ctx.font = K.font.ui(22); ctx.fillStyle = '#5a6078'; ctx.fillText((P.company || 'The company').toUpperCase(), x0 + 22, y0 + 36);
      ctx.font = K.font.bold(24); ctx.fillStyle = N.ink;
      const lines = H.wrap(ctx, P.reply || 'No comment yet', 'bold', 24, w - 44);
      lines.slice(0, 2).forEach((ln, i) => ctx.fillText(ln, x0 + 22, y0 + 70 + i * 30));
      ctx.restore();
    }
  }
  // =====================================================================================================
  else { // payoff
    const tCut = at(P.cutCue, D * 0.2), tQ = at(P.qCue, D * 0.6);
    K.camera(ctx, t, [{ t: 0, ...CAM }, { t: tCut + 0.6, zoom: 1.24, x: 560, y: 840 }, { t: tQ, ...CAM }, { t: D, ...CAM }]);
    room();
    globe(1, t >= tCut + 0.6);
    interior('idle', false);
    envelope(slot.x + 86, 935, 0.9, { text: P.envelope || 'TEST FILE', rot: 0.35, grey: true });
    glassRoom(0);
    net(1);
    slotFrame(easeOutCubic(clamp((t - tCut) / 0.5)), K.popIn(t, tCut + 0.45, 0.4));
    siren(false);
    inspector(IX, { pose: t >= tQ ? 'shrug' : 'stand', mood: 'neutral' });
    UI(() => pill(P.advice || 'Cut off internet it doesn’t need', 487, 500, tCut, tQ - 0.3, { size: 30, accent: true }));
    if (t >= tQ - 0.2) UI(() => {
      const k = easeOutCubic(clamp((t - tQ + 0.2) / 0.5));
      ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * -30);
      const x0 = 100, w = 774, y0 = 440;
      ctx.font = K.font.display(44);
      const lines = H.wrap(ctx, P.question || 'Would you run a model you didn’t build?', 'display', 44, w - 80);
      const h = 50 + lines.length * 54 + 90;
      H.roundRect(ctx, x0, y0, w, h, 26); ctx.fillStyle = 'rgba(14,17,33,0.95)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#ffffff'; ctx.font = K.font.display(44);
      lines.forEach((ln, i) => ctx.fillText(ln, x0 + w / 2, y0 + 70 + i * 54));
      const cy = y0 + h - 30;
      K.drawLabel(ctx, x0 + w / 2 - 150, cy, K.popIn(t, tQ + 0.4, 0.4), { text: P.a || 'Yes, sandboxed', size: 28, accent: true });
      K.drawLabel(ctx, x0 + w / 2 + 170, cy, K.popIn(t, tQ + 0.6, 0.4), { text: P.b || 'No way', size: 28 });
      ctx.restore();
    });
  }
  ctx.restore();
  ui.forEach((f) => { ctx.save(); f(); ctx.restore(); });
}
