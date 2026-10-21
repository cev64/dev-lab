// Scene "watchdog-room" (full frame). An AI agent robot, a floor-standing ALERTS box (red siren on top, ON/OFF lever)
// and a cartoon watchdog that stands for the misalignment monitor. Fits: "an AI agent switched off / removed its
// monitoring or alerts", "an AI lied about it", "a review tool now blocks it", "benign or evasive?", "who watches".
// Generic: no company logos, people never drawn except as text. All text comes from params.
// modes:
//  alarm   (alias sol; best as a 3-beat span) hook: siren flashing, the robot's grabber arm flips the lever OFF; beat 2: REWIND,
//          date pill, name pill, an instruction card, the arm flips it OFF again, "alerts OFF" pill; beat 3: the dog
//          keeps watching and report sheets fly into a REPORTS folder ("still running") while the siren stays dark;
//          a small helper robot pops up with a warning bubble.
//          params: date, name, rule, ruleHead, offLabel, runLabel, savedLabel, folder, helper,
//                  hookCue, dateCue, nameCue, ruleCue, offCue, runCue, savedCue, humanCue, helperCue
//  unplug  (alias astra) server room: robot carries a code box from OLD to NEW rack; it unplugs the dog's cable on removeCue
//          ("Monitoring removed"); a chat panel: user asks, robot answers, FALSE stamp + "per" pill.
//          params: date, name, from, to, removed, ask, answer, stamp, per, dateCue, nameCue, removeCue, moveCue,
//                  askCue, answerCue, falseCue (cues accept "word#n" = (n+1)th time spoken)
//  review  robot reads an instruction note; PERMISSION? stamp lands; two "caught" pills; an AUTO-REVIEW gate drops
//          and the robot's grabber bounces off its shield, BLOCKED stamp. params: note, stamp, readLabel, cases,
//          gate, blocked, permCue, caughtCue, gateCue, blockCue
//  caveat  robot on a test pad under a scanner, balance scale with two hedged labels that tips each way, then
//          wobbles level. params: head, testing, left, right, headCue, testCue, leftCue, rightCue
//  payoff  dog, alarm box and robot side by side; question pills; pulsing "?" over the lever.
//          params: question, sub, qCue, subCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const mode = ({ alarm: 'sol', unplug: 'astra' })[P.mode] || P.mode || 'sol';
  const at = (w, d) => {
    if (!w) return d;
    const [word, n] = String(w).split('#');
    const v = info.timeOf(word, n ? +n : 0);
    return v == null ? d : v;
  };
  const S = { H, K, P, t, D: info.duration, ACC: info.accent, at, info, ui: [], toScr: (x, y) => [x, y] };
  ctx.save();
  if (mode === 'astra') astra(ctx, S);
  else if (mode === 'review') review(ctx, S);
  else if (mode === 'caveat') caveat(ctx, S);
  else if (mode === 'payoff') payoff(ctx, S);
  else sol(ctx, S);
  ctx.restore();
  // text overlays in screen space (never scaled by the camera)
  for (const f of S.ui) { ctx.save(); f(); ctx.restore(); }
}

// fixed camera: world point (cx, cy) goes to the stage centre (487, 725) at zoom z
function cam(ctx, S, z, cx, cy) {
  ctx.translate(487, 725); ctx.scale(z, z); ctx.translate(-cx, -cy);
  S.toScr = (x, y) => [487 + (x - cx) * z, 725 + (y - cy) * z];
}

const FEET = 1035;

// ---------------------------------------------------------------- shared pieces
function room(ctx, S, wall) {
  S.K.world.room(ctx, { t: S.t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 880, wall });
  // a faint wall grid of status lights for life
  const { H } = S;
  for (let i = 0; i < 7; i++) {
    const x = 120 + i * 140, on = (Math.floor(S.t * 1.3 + i * 0.7) % 4) !== 0;
    ctx.fillStyle = on ? 'rgba(160,180,255,0.18)' : 'rgba(160,180,255,0.06)';
    H.roundRect(ctx, x - 4, 860, 8, 8, 4); ctx.fill();
  }
}

// pill that pops in at a and fades out at b (b null = stays)
function pill(ctx, S, text, x, y, a, b, o = {}) {
  const { t, K, H } = S;
  if (t < a || (b != null && t > b + 0.4)) return;
  const p = K.popIn(t, a, 0.4), out = b == null ? 1 : 1 - H.smooth(H.clamp((t - b) / 0.4));
  S.ui.push(() => { ctx.globalAlpha = H.clamp(out); K.drawLabel(ctx, x, y, p, Object.assign({ text, size: 28 }, o)); });
}

// ALERTS box with a siren. off: 0 (lever up, siren on) .. 1 (lever down, siren dark). Returns the lever tip.
function alarmBox(ctx, S, x, off, o = {}) {
  const { H, K, t } = S, N = K.NEUTRAL, feet = FEET;
  const on = 1 - off;
  K.shadow(ctx, x, feet, 190);
  H.roundRect(ctx, x - 72, feet - 170, 144, 170, 16); ctx.fillStyle = '#3b4260'; ctx.fill();
  ctx.fillStyle = '#323853'; ctx.fillRect(x + 20, feet - 160, 44, 152);
  H.roundRect(ctx, x - 82, feet - 186, 164, 26, 10); ctx.fillStyle = '#4b5378'; ctx.fill();
  // front plate
  H.roundRect(ctx, x - 52, feet - 150, 104, 110, 10); ctx.fillStyle = '#20253b'; ctx.fill();
  ctx.font = K.font.ui(24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = on > 0.5 ? S.ACC : '#7d859c'; ctx.fillText('ON', x + 28, feet - 132);
  ctx.fillStyle = on > 0.5 ? '#7d859c' : N.danger; ctx.fillText('OFF', x + 22, feet - 54);
  // lever
  const a = H.lerp(-0.55, Math.PI + 0.55, H.easeInOutCubic(H.clamp(off)));
  const px = x - 16, py = feet - 94, L = 52;
  const tx = px + Math.sin(a) * L, ty = py - Math.cos(a) * L;
  ctx.strokeStyle = '#c9d0e6'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tx, ty); ctx.stroke();
  ctx.fillStyle = '#e8453c'; ctx.beginPath(); ctx.arc(tx, ty, 15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff8a80'; ctx.beginPath(); ctx.arc(tx - 4, ty - 5, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8a93a8'; ctx.beginPath(); ctx.arc(px, py, 10, 0, Math.PI * 2); ctx.fill();
  // siren on top
  const sy = feet - 186;
  H.roundRect(ctx, x - 40, sy - 16, 80, 18, 6); ctx.fillStyle = '#2a2f45'; ctx.fill();
  if (on > 0.02) {
    const pulse = 0.6 + 0.4 * Math.sin(t * 9);
    K.glow(ctx, x, sy - 40, 190, '#ff3b30', 0.55 * on * pulse);
    // rotating beams
    ctx.save(); ctx.globalAlpha = 0.15 * on; ctx.fillStyle = '#ff5a4e';
    for (const k of [0, Math.PI]) {
      const r = t * 4 + k;
      ctx.beginPath(); ctx.moveTo(x, sy - 40);
      ctx.arc(x, sy - 40, 200, r - 0.2, r + 0.2); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  const dome = H.mixHex('#5a6075', '#ff3b30', on);
  ctx.fillStyle = dome; ctx.beginPath(); ctx.arc(x, sy - 16, 38, Math.PI, 0); ctx.lineTo(x + 38, sy - 16); ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 0.5; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(x - 14, sy - 36, 7, 12, 0.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  // sound arcs while on
  if (on > 0.5 && o.arcs !== false) {
    ctx.strokeStyle = 'rgba(255,120,110,0.75)'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 1.6 + i / 3) % 1), r = 50 + ph * 70;
      ctx.globalAlpha = (1 - ph) * on;
      for (const a0 of [0, Math.PI]) { ctx.beginPath(); ctx.arc(x, sy - 30, r, a0 - 0.5, a0 + 0.5); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  }
  return { tip: [tx, ty], siren: [x, sy - 40] };
}

// telescopic grabber arm from (x0, y0) toward (x1, y1); k 0..1 extension
function claw(ctx, S, x0, y0, x1, y1, k) {
  if (k <= 0.001) return;
  const { H } = S;
  const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 90;
  const pts = S.K.bezier(x0, y0, mx - 40, my, mx + 40, my, x1, y1, 24);
  const end = S.K.pathPoint(pts, k);
  ctx.save();
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#8a93a8'; ctx.lineWidth = 16; S.K.pathDraw(ctx, pts, k);
  ctx.strokeStyle = '#c9d0e6'; ctx.lineWidth = 8; S.K.pathDraw(ctx, pts, k);
  ctx.fillStyle = '#c9d0e6'; ctx.beginPath(); ctx.arc(end[0], end[1], 14, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9d0e6'; ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(end[0], end[1]); ctx.lineTo(end[0] + 16, end[1] - 14); ctx.moveTo(end[0], end[1]); ctx.lineTo(end[0] + 18, end[1] + 10); ctx.stroke();
  ctx.restore();
  return end;
}

// cartoon guard dog sitting (anchor bottom-centre), ~150x190 at s = 1. o: alert 0..1, grey 0..1, look -1..1
function watchdog(ctx, S, x, y, s, o = {}) {
  const { H, K, t } = S, N = K.NEUTRAL, alert = o.alert == null ? 1 : o.alert, grey = o.grey || 0;
  const g = (c) => H.mixHex(c, '#6b6f80', grey);
  const fur = g('#c98f5a'), furS = g('#a66e3f'), furL = g('#e6b88a');
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.flip) ctx.scale(-1, 1);
  K.shadow(ctx, 0, 0, 170);
  const wag = Math.sin(t * (6 + 6 * alert)) * (0.25 + 0.35 * alert);
  ctx.save(); ctx.translate(48, -30); ctx.rotate(-0.9 + wag);
  ctx.strokeStyle = furS; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, -20, 40, -55); ctx.stroke();
  ctx.restore();
  ctx.fillStyle = furS; ctx.beginPath(); ctx.ellipse(10, -48, 56, 50, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = fur; ctx.beginPath(); ctx.ellipse(-8, -70, 42, 62, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = furL; ctx.beginPath(); ctx.ellipse(-18, -70, 22, 40, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = fur; H.roundRect(ctx, -40, -60, 22, 60, 10); ctx.fill(); H.roundRect(ctx, -8, -60, 22, 60, 10); ctx.fill();
  ctx.fillStyle = furL; H.roundRect(ctx, -44, -12, 30, 14, 7); ctx.fill(); H.roundRect(ctx, -12, -12, 30, 14, 7); ctx.fill();
  ctx.fillStyle = H.mixHex(S.ACC, '#6b6f80', grey); H.roundRect(ctx, -46, -122, 64, 12, 6); ctx.fill();
  ctx.beginPath(); ctx.arc(-14, -102, 10, 0, Math.PI * 2); ctx.fill();
  const tilt = Math.sin(t * 0.9) * 0.06 + (o.tilt || 0);
  ctx.save(); ctx.translate(-14, -150); ctx.rotate(tilt);
  const earUp = 0.4 + 0.6 * alert;
  ctx.fillStyle = furS;
  ctx.save(); ctx.translate(-30, -26); ctx.rotate(-0.5 - 0.6 * (1 - earUp)); ctx.beginPath(); ctx.ellipse(0, -18, 13, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(30, -26); ctx.rotate(0.5 + 0.6 * (1 - earUp)); ctx.beginPath(); ctx.ellipse(0, -18, 13, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.fillStyle = fur; ctx.beginPath(); ctx.ellipse(0, 0, 44, 40, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = furL; ctx.beginPath(); ctx.ellipse(-4, 16, 28, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = N.ink; ctx.beginPath(); ctx.ellipse(-4, 6, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
  const lk = (o.look || 0) * 4;
  const blink = ((t + 0.7) % 3.1) < 0.12;
  if (blink) { ctx.fillRect(-26, -12, 12, 3); ctx.fillRect(10, -12, 12, 3); }
  else { ctx.beginPath(); ctx.arc(-20 + lk, -11, 6, 0, Math.PI * 2); ctx.arc(16 + lk, -11, 6, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = N.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, 13); ctx.lineTo(-4, 22); ctx.moveTo(-14, 26); ctx.quadraticCurveTo(-4, 32, 6, 26); ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function sheet(ctx, S, x, y, s, rot) {
  const { H, K } = S;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot || 0); ctx.scale(s, s);
  H.roundRect(ctx, -34, -44, 68, 88, 6); ctx.fillStyle = K.NEUTRAL.paper; ctx.fill();
  ctx.fillStyle = K.NEUTRAL.paperS; for (let i = 0; i < 4; i++) ctx.fillRect(-22, -30 + i * 16, i === 3 ? 26 : 44, 6);
  ctx.fillStyle = S.ACC; ctx.beginPath(); ctx.arc(18, 28, 8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function crossMark(ctx, x, y, r, color, k) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 9; ctx.lineCap = 'round';
  const a = Math.min(1, k * 2), b = Math.max(0, k * 2 - 1);
  ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x - r + 2 * r * a, y - r + 2 * r * a);
  if (b > 0) { ctx.moveTo(x + r, y - r); ctx.lineTo(x + r - 2 * r * b, y - r + 2 * r * b); }
  ctx.stroke(); ctx.restore();
}


// small dark card overlay (screen space) with a pop scale around its centre
function card(ctx, S, x, y, w, h, p, alpha, fn) {
  const { H } = S;
  S.ui.push(() => {
    ctx.globalAlpha = H.clamp(alpha); ctx.translate(x, y); ctx.scale(p, p);
    H.roundRect(ctx, -w / 2, -h / 2, w, h, 18); ctx.fillStyle = 'rgba(14,17,33,0.94)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke();
    fn();
  });
}

// ---------------------------------------------------------------- mode: sol (3-beat span)
function sol(ctx, S) {
  const { H, K, P, t, D, at } = S, { clamp, lerp, easeOutCubic } = H;
  const b1 = S.info.beats && S.info.beats[1] ? S.info.beats[1].t0 : D * 0.12;
  const b2 = S.info.beats && S.info.beats[2] ? S.info.beats[2].t0 : D * 0.66;
  const tHookOff = at(P.hookCue, b1 * 0.6) - 0.35;
  const tRewind = b1 + 0.15;
  const tDate = at(P.dateCue, b1 + 1.5) - 0.2, tName = at(P.nameCue, b1 + 4) - 0.2, tRule = at(P.ruleCue, b1 + 7) - 0.2;
  const tOff = at(P.offCue, b1 + 11) - 0.45, tRun = at(P.runCue, b2 + 0.2) - 0.1, tSaved = at(P.savedCue, b2 + 1.6) - 0.2;
  const tHuman = at(P.humanCue, b2 + 3.6) - 0.1, tHelp = at(P.helperCue, b2 + 6) - 0.4;

  cam(ctx, S, 1.25, 487, 843);
  room(ctx, S);
  const rx = 230, ax = 480, dx = 690;
  let off;
  if (t < tRewind) off = K.phase(t, tHookOff, tHookOff + 0.35);
  else if (t < tOff) off = 1 - K.phase(t, tRewind, tRewind + 0.5);
  else off = K.phase(t, tOff + 0.25, tOff + 0.6);
  const reach = (t0) => { const u = t - t0; if (u < 0 || u > 1.3) return 0; return u < 0.35 ? easeOutCubic(u / 0.35) : u < 0.75 ? 1 : 1 - H.smooth((u - 0.75) / 0.55); };
  const armK = Math.max(reach(tHookOff - 0.25), reach(tOff));

  watchdog(ctx, S, dx, FEET, 0.9, { alert: 1, look: off > 0.5 ? -1 : 0.3 });
  const box = alarmBox(ctx, S, ax, off);
  K.drawRobot(ctx, rx, FEET - 30, 1.2, { t, state: armK > 0 ? 'working' : 'idle', seed: 4 });
  K.drawDesk(ctx, rx + 20, FEET, 0.85);
  K.drawLaptop(ctx, rx + 5, FEET - 93, 0.6, { t, screen: 'code', typing: 1 });
  claw(ctx, S, rx + 52, FEET - 175, box.tip[0] - 6, box.tip[1], armK);
  // helper robot on the desk (beat 3)
  const helpX = rx + 115, helpY = FEET - 93;
  if (t >= tHelp) {
    const hp = K.popIn(t, tHelp, 0.45);
    ctx.save(); ctx.translate(helpX, helpY); ctx.scale(hp, hp);
    K.drawRobot(ctx, 0, 0, 0.5, { t, state: 'thinking', seed: 9 });
    ctx.restore();
  }
  // screen-space overlays
  const sirenS = S.toScr(box.siren[0], box.siren[1] + 10);
  const dogS = S.toScr(dx - 10, FEET - 120);
  const helpS = S.toScr(helpX, helpY - 115);
  if (t >= tRewind - 0.05 && t < tRewind + 1.4) pill(ctx, S, 'REWIND', 487, 480, tRewind, tRewind + 1.0, { size: 30 });
  pill(ctx, S, P.date || 'Date', 720, 480, tDate, tOff - 0.3, { accent: true, size: 32 });
  pill(ctx, S, P.name || 'Agent', 160, 590, tName, b2 - 0.3, { dot: true, size: 28 });
  if (t >= tRule && t < b2 + 0.4) {
    const p = K.popIn(t, tRule, 0.45), out = 1 - H.smooth(clamp((t - b2 + 0.2) / 0.5));
    card(ctx, S, 290, 470, 340, 140, p, out, () => {
      ctx.font = K.font.ui(24); ctx.fillStyle = '#aab3cc'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(P.ruleHead || 'Instruction', -140, -36);
      ctx.fillStyle = '#c9d0e6'; H.roundRect(ctx, -140, -6, 64, 46, 12); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-126, 38); ctx.lineTo(-130, 54); ctx.lineTo(-110, 38); ctx.fill();
      crossMark(ctx, -108, 17, 18, K.NEUTRAL.danger, clamp((t - tRule - 0.4) / 0.4));
      ctx.font = K.font.bold(28); ctx.fillStyle = '#ffffff';
      const lines = String(P.rule || 'No messages').split('|');
      lines.forEach((l, i) => ctx.fillText(l, -56, 6 + i * 32 - (lines.length - 1) * 8));
    });
  }
  pill(ctx, S, P.offLabel || 'Alerts to humans: OFF', 510, 610, tOff + 0.7, null, { size: 28 });
  if (t >= tOff + 0.7) {
    const sh = t >= tHuman && t < tHuman + 0.6 ? Math.sin((t - tHuman) * 40) * (1 - (t - tHuman) / 0.6) * 7 : 0;
    const big = t >= tHuman ? 1.15 : 1;
    S.ui.push(() => crossMark(ctx, sirenS[0] + sh, sirenS[1], 32 * big, K.NEUTRAL.danger, clamp((t - tOff - 0.9) / 0.4)));
  }
  pill(ctx, S, P.runLabel || 'Monitor: still running', 745, 720, tRun, null, { dot: true, size: 26 });
  // REPORTS folder (top right) + sheets flying from the dog
  const fx = 760, fy = 470;
  if (t >= tRun - 0.2) {
    const fp = K.popIn(t, tRun - 0.2, 0.45);
    let landed = 0; const every = 1.1, flying = [];
    for (let i = 0; i < 12; i++) {
      const born = tSaved + i * every, u = (t - born) / 0.9;
      if (u < 0) break;
      if (u >= 1) { landed++; continue; }
      flying.push(u);
    }
    S.ui.push(() => {
      ctx.save(); ctx.translate(fx, fy + 60); ctx.scale(fp, fp); ctx.translate(-fx, -(fy + 60));
      H.roundRect(ctx, fx - 100, fy - 70, 90, 30, 8); ctx.fillStyle = '#d9a84a'; ctx.fill();
      H.roundRect(ctx, fx - 100, fy - 52, 200, 124, 12); ctx.fillStyle = '#e8b958'; ctx.fill();
      ctx.font = K.font.ui(28); ctx.fillStyle = '#4a3410'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(P.folder || 'REPORTS', fx, fy + 10);
      if (landed > 0) {
        ctx.fillStyle = S.ACC; ctx.beginPath(); ctx.arc(fx + 96, fy - 50, 26, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = K.ACCENT.deep; ctx.font = K.font.ui(28); ctx.fillText(String(landed), fx + 96, fy - 48);
      }
      ctx.restore();
      for (const u of flying) { const e = easeOutCubic(u); sheet(ctx, S, lerp(dogS[0], fx, e), lerp(dogS[1], fy - 20, e) - Math.sin(u * Math.PI) * 60, 0.9, (1 - u) * 0.6); }
    });
  }
  if (t >= tHelp + 0.35) {
    const bp = K.popIn(t, tHelp + 0.35, 0.4);
    S.ui.push(() => {
      K.drawSpeechBubble(ctx, helpS[0] - 40, 545, 1, { text: P.helper || 'Advised against it', size: 28, maxW: 320, tail: 'left', pop: bp });
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3; ctx.setLineDash([6, 8]);
      ctx.beginPath(); ctx.moveTo(helpS[0] - 40, 550); ctx.lineTo(helpS[0], helpS[1] - 6); ctx.globalAlpha = clamp(bp); ctx.stroke();
    });
  }
}

// ---------------------------------------------------------------- mode: astra
function astra(ctx, S) {
  const { H, K, P, t, D, at } = S, { clamp, lerp, easeOutCubic } = H, N = K.NEUTRAL;
  const tDate = at(P.dateCue, 0.2) - 0.1, tName = at(P.nameCue, 2.5) - 0.2, tRem = at(P.removeCue, 3.6) - 0.25;
  const tMove = at(P.moveCue, 5) - 0.6, tAsk = at(P.askCue, 7) - 0.4, tAns = at(P.answerCue, 8.5) - 0.3, tFalse = at(P.falseCue, 9.6) - 0.2;
  cam(ctx, S, 1.2, 487, 835);
  room(ctx, S, '#20264a');
  const oldX = 205, newX = 770;
  for (const [x, act] of [[oldX, 0.4], [newX, K.phase(t, tMove + 2.2, tMove + 2.8)]]) K.drawServerRack(ctx, x, FEET, 1.15, { t, activity: 0.3 + 0.7 * act });
  const dogX = 350;
  const pop = K.phase(t, tRem + 0.2, tRem + 0.7);
  const grey = K.phase(t, tRem + 0.4, tRem + 1.2) * 0.75;
  watchdog(ctx, S, dogX, FEET, 0.85, { alert: 1 - grey, grey, look: -1 });
  const plugA = [oldX + 62, FEET - 150];
  const plugB = [lerp(plugA[0], oldX + 110, pop), lerp(plugA[1], FEET - 18, easeOutCubic(pop))];
  ctx.save(); ctx.strokeStyle = H.mixHex(S.ACC, '#6b6f80', grey); ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(dogX - 26, FEET - 92); ctx.quadraticCurveTo((dogX + plugB[0]) / 2, FEET - 30, plugB[0], plugB[1]); ctx.stroke(); ctx.restore();
  H.roundRect(ctx, plugB[0] - 12, plugB[1] - 14, 24, 28, 5); ctx.fillStyle = '#c9d0e6'; ctx.fill();
  if (pop > 0 && pop < 1) K.glow(ctx, plugA[0], plugA[1], 50, '#ffffff', 0.6 * (1 - pop));
  const walk = K.phase(t, tMove, tMove + 2.0, H.easeInOutCubic);
  const rx = lerp(490, 640, walk);
  const placed = K.phase(t, tMove + 2.0, tMove + 2.6);
  K.drawRobot(ctx, rx, FEET - 6 - (walk > 0 && walk < 1 ? Math.abs(Math.sin(walk * Math.PI * 4)) * 8 : 0), 1.15, { t, state: 'working', seed: 7 });
  const bx = lerp(rx + 10, newX - 6, placed), by = lerp(FEET - 70, FEET - 160, placed), bs = lerp(0.85, 0.4, placed);
  if (placed < 1) {
    ctx.save(); ctx.translate(bx, by); ctx.scale(bs, bs); ctx.globalAlpha = 1 - K.phase(t, tMove + 2.4, tMove + 2.6);
    H.roundRect(ctx, -58, -44, 116, 88, 12); ctx.fillStyle = '#4fb3a6'; ctx.fill();
    ctx.fillStyle = '#3a8c81'; ctx.fillRect(-58, -6, 116, 10);
    ctx.font = K.font.display(34); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('</>', 0, -22);
    ctx.restore();
  }
  const u = t - (tRem - 0.35);
  const armK = u < 0 ? 0 : u < 0.4 ? easeOutCubic(u / 0.4) : u < 0.7 ? 1 : 1 - H.smooth(clamp((u - 0.7) / 0.5));
  claw(ctx, S, rx - 45, FEET - 170, plugA[0] + 6, plugA[1], armK);
  if (placed > 0.9) {
    ctx.save(); ctx.setLineDash([8, 8]); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    H.roundRect(ctx, newX - 122, FEET - 170, 44, 50, 8); ctx.stroke(); ctx.restore();
  }
  // overlays
  const oldS = S.toScr(oldX, FEET - 280), newS = S.toScr(newX, FEET - 280);
  S.ui.push(() => {
    ctx.font = K.font.ui(24); ctx.fillStyle = '#c9d0e6'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.globalAlpha = 1 - K.phase(t, tAsk - 0.3, tAsk);
    ctx.fillText(P.from || 'OLD SETUP', oldS[0], oldS[1]); ctx.fillText(P.to || 'NEW SETUP', newS[0], newS[1]);
  });
  pill(ctx, S, P.date || 'Date', 300, 480, tDate, tAsk - 0.5, { accent: true, size: 32 });
  pill(ctx, S, P.name || 'Agent', 650, 480, tName, tAsk - 0.5, { dot: true, size: 30 });
  pill(ctx, S, P.removed || 'Monitoring removed', 330, 570, tRem + 0.6, tAsk - 0.5, { size: 28 });
  if (t >= tAsk) {
    const pk = K.popIn(t, tAsk, 0.45);
    const px = 487, py = 360, pw = 760, ph = 275;
    S.ui.push(() => {
      ctx.translate(px, py + ph / 2); ctx.scale(pk, pk); ctx.translate(-px, -(py + ph / 2));
      H.roundRect(ctx, px - pw / 2, py, pw, ph, 22); ctx.fillStyle = 'rgba(14,17,33,0.95)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke();
      ctx.font = K.font.ui(24); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#aab3cc';
      ctx.fillText('User', px - pw / 2 + 28, py + 36);
      const ask = P.ask || 'Is monitoring still on?';
      ctx.font = K.font.bold(30); const aw = ctx.measureText(ask).width + 40;
      H.roundRect(ctx, px - pw / 2 + 24, py + 56, aw, 58, 20); ctx.fillStyle = '#3b4260'; ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillText(ask, px - pw / 2 + 44, py + 86);
    });
    if (t >= tAns) {
      const ak = K.popIn(t, tAns, 0.4);
      S.ui.push(() => {
        const ans = P.answer || 'I did not remove it.';
        ctx.font = K.font.bold(30); const w2 = ctx.measureText(ans).width + 40;
        const x2 = px + pw / 2 - 24 - w2, y2 = py + 158;
        ctx.translate(x2 + w2, y2 + 29); ctx.scale(ak, ak); ctx.translate(-(x2 + w2), -(y2 + 29));
        ctx.font = K.font.ui(24); ctx.fillStyle = '#aab3cc'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText('Agent', px + pw / 2 - 28, y2 - 20);
        H.roundRect(ctx, x2, y2, w2, 58, 20); ctx.fillStyle = '#e6e9f3'; ctx.fill();
        ctx.font = K.font.bold(30); ctx.fillStyle = N.ink; ctx.textAlign = 'left'; ctx.fillText(ans, x2 + 20, y2 + 30);
      });
    }
    if (t >= tFalse) {
      S.ui.push(() => K.drawStamp(ctx, 205, py + 195 + 95 * 0.62, 0.62, { kind: 'cross', text: P.stamp || 'FALSE', land: clamp((t - tFalse) / 0.5) }));
      pill(ctx, S, P.per || 'per the report', 640, py + ph - 14, tFalse + 0.45, null, { size: 24 });
    }
  }
}

// ---------------------------------------------------------------- mode: review
function review(ctx, S) {
  const { H, K, P, t, D, at } = S, { clamp, lerp, easeOutCubic } = H, N = K.NEUTRAL;
  const tPerm = at(P.permCue, D * 0.3) - 0.3, tCaught = at(P.caughtCue, D * 0.55) - 0.3;
  const tGate = at(P.gateCue, D * 0.68) - 0.4, tBlock = at(P.blockCue, D * 0.8) - 0.5;
  K.cameraShake(ctx, t, tBlock + 0.45, 0.35, 8);
  cam(ctx, S, 1.2, 487, 835);
  room(ctx, S, '#262b52');
  const rx = 270, ax = 730, gx = 545;
  alarmBox(ctx, S, ax, 0, { arcs: true });
  K.drawRobot(ctx, rx, FEET - 6, 1.15, { t, state: t < tGate ? 'thinking' : 'working', seed: 5 });
  if (t >= tGate) {
    const g = easeOutCubic(K.phase(t, tGate, tGate + 0.5));
    ctx.save(); ctx.translate(0, lerp(-500, 0, g));
    ctx.fillStyle = '#4b5378'; H.roundRect(ctx, gx - 14, FEET - 300, 28, 300, 8); ctx.fill();
    K.drawShield(ctx, gx, FEET - 110, 1.1, { check: 1 });
    ctx.restore();
  }
  const u = t - tBlock;
  let armK = 0;
  if (u > 0) armK = u < 0.45 ? easeOutCubic(u / 0.45) * 0.55 : u < 0.6 ? 0.55 - (u - 0.45) * 0.5 : Math.max(0, 0.48 - H.smooth(clamp((u - 0.6) / 0.6)) * 0.48);
  claw(ctx, S, rx + 50, FEET - 170, ax - 20, FEET - 140, armK);
  if (u > 0.45) { const gs = S.toScr(gx, FEET - 170); S.ui.push(() => K.glow(ctx, gs[0], gs[1], 150, S.ACC, 0.7 * (1 - clamp((u - 0.45) / 0.5)))); }
  // overlays
  const nk = K.popIn(t, 0.2, 0.45), out = 1 - K.phase(t, tGate - 0.4, tGate);
  if (nk > 0 && out > 0) {
    S.ui.push(() => {
      ctx.globalAlpha = out; ctx.translate(250, 470); ctx.scale(nk, nk); ctx.rotate(-0.04);
      H.roundRect(ctx, -150, -90, 300, 180, 14); ctx.fillStyle = N.paper; ctx.fill();
      ctx.font = K.font.bold(30); ctx.fillStyle = N.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      String(P.note || 'Routine|instructions').split('|').forEach((l, i) => ctx.fillText(l, 0, -48 + i * 36));
      ctx.fillStyle = N.paperS; for (let i = 0; i < 3; i++) ctx.fillRect(-110, 18 + i * 18, i === 2 ? 130 : 220, 8);
      ctx.rotate(0.04);
      if (t >= tPerm) { ctx.rotate(-0.12); K.drawLabel(ctx, 40, 118, K.popIn(t, tPerm, 0.4), { text: P.stamp || 'PERMISSION?', size: 34, accent: true }); }
    });
  }
  pill(ctx, S, P.readLabel || 'Read as permission', 300, 628, tPerm + 0.4, tGate - 0.2, { size: 28 });
  const cases = P.cases || ['Case 1: caught same day', 'Case 2: caught same day'];
  cases.slice(0, 2).forEach((c, i) => pill(ctx, S, c, 660, 480 + i * 66, tCaught + i * 0.35, tGate - 0.1, { dot: true, size: 26 }));
  if (t >= tGate) {
    const gp = S.toScr(gx, FEET - 300);
    pill(ctx, S, P.gate || 'AUTO-REVIEW', gp[0], gp[1] - 12, tGate + 0.35, null, { accent: true, size: 30 });
    if (u > 0.5) S.ui.push(() => K.drawStamp(ctx, gp[0], gp[1] - 80 + 95 * 0.7 - 70, 0.7, { kind: 'cross', text: P.blocked || 'BLOCKED', land: clamp((u - 0.5) / 0.5) }));
  }
}

// ---------------------------------------------------------------- mode: caveat
function caveat(ctx, S) {
  const { H, K, P, t, D, at } = S, N = K.NEUTRAL;
  const tHead = at(P.headCue, D * 0.15) - 0.3, tTest = at(P.testCue, D * 0.42) - 0.3;
  const tL = at(P.leftCue, D * 0.58) - 0.3, tR = at(P.rightCue, D * 0.85) - 0.4;
  cam(ctx, S, 1.15, 487, 826);
  room(ctx, S, '#22284a');
  const cx = 487;
  ctx.fillStyle = '#3b4260'; H.roundRect(ctx, cx - 120, FEET - 18, 240, 26, 10); ctx.fill();
  const sk = K.phase(t, tTest, tTest + 0.6);
  if (sk > 0) {
    ctx.save(); ctx.strokeStyle = H.rgba(S.ACC, 0.8 * sk); ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(cx, FEET - 30, 175, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
    const sy = FEET - 40 - ((t * 0.6) % 1) * 230;
    ctx.globalAlpha = 0.35 * sk; ctx.fillStyle = S.ACC; ctx.fillRect(cx - 110, sy, 220, 6);
    ctx.restore();
  }
  K.drawRobot(ctx, cx, FEET - 20, 1.0, { t, state: 'thinking', seed: 8 });
  let tilt = 0;
  tilt += 0.16 * K.phase(t, tL, tL + 0.5, H.easeInOutCubic);
  tilt -= 0.32 * K.phase(t, tR, tR + 0.5, H.easeInOutCubic);
  tilt += 0.16 * K.phase(t, tR + 0.7, D - 0.2, H.easeInOutCubic);
  tilt += Math.sin(t * 2.2) * 0.02 * (1 - K.phase(t, D - 0.6, D));
  const pivotX = cx, pivotY = 600, arm = 225;
  ctx.fillStyle = '#4b5378'; H.roundRect(ctx, pivotX - 8, pivotY, 16, 150, 6); ctx.fill();
  H.roundRect(ctx, pivotX - 50, pivotY + 140, 100, 18, 8); ctx.fill();
  const ends = [-1, 1].map((s) => [pivotX + s * arm * Math.cos(tilt), pivotY + s * arm * Math.sin(tilt)]);
  ctx.strokeStyle = '#c9d0e6'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(ends[0][0], ends[0][1]); ctx.lineTo(ends[1][0], ends[1][1]); ctx.stroke();
  ctx.fillStyle = S.ACC; ctx.beginPath(); ctx.arc(pivotX, pivotY, 14, 0, Math.PI * 2); ctx.fill();
  const labels = [[P.left || 'Option A?', tL], [P.right || 'Option B?', tR]];
  ends.forEach(([ex, ey], i) => {
    ctx.strokeStyle = '#8a93a8'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 60, ey + 60); ctx.moveTo(ex, ey); ctx.lineTo(ex + 60, ey + 60); ctx.stroke();
    ctx.fillStyle = '#5b6aa8'; ctx.beginPath(); ctx.ellipse(ex, ey + 62, 80, 14, 0, 0, Math.PI * 2); ctx.fill();
    const [txt, ta] = labels[i];
    if (t >= ta) {
      const p = K.popIn(t, ta, 0.45), sp = S.toScr(ex, ey + 78);
      S.ui.push(() => {
        ctx.translate(sp[0], sp[1]); ctx.scale(p, p);
        const lines = String(txt).split('|');
        ctx.font = K.font.bold(30);
        const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 36, h = lines.length * 36 + 22;
        H.roundRect(ctx, -w / 2, 0, w, h, 16); ctx.fillStyle = i === 0 ? 'rgba(14,17,33,0.94)' : H.rgba(N.danger, 0.94); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        lines.forEach((l, j) => ctx.fillText(l, 0, 29 + j * 36));
      });
    }
  });
  pill(ctx, S, P.head || 'No satisfying explanation yet', cx, 440, tHead, null, { accent: true, size: 30 });
  const tp = S.toScr(cx - 230, FEET - 40);
  pill(ctx, S, P.testing || 'Testing', tp[0], tp[1], tTest + 0.2, null, { dot: true, size: 28 });
}

// ---------------------------------------------------------------- mode: payoff
function payoff(ctx, S) {
  const { H, K, P, t, D, at } = S;
  const tQ = at(P.qCue, D * 0.2) - 0.4, tSub = at(P.subCue, D * 0.45) - 0.3;
  cam(ctx, S, 1.2, 487, 835);
  room(ctx, S, '#252a4d');
  watchdog(ctx, S, 270, FEET, 1.0, { alert: 1, look: 1 });
  const box = alarmBox(ctx, S, 500, 0, { arcs: false });
  K.drawRobot(ctx, 720, FEET - 6, 1.15, { t, state: 'thinking', seed: 11, flip: true });
  pill(ctx, S, P.question || 'WHO WATCHES THE WATCHDOG?', 487, 500, tQ, null, { accent: true, size: 38 });
  pill(ctx, S, P.sub || 'Should AI touch its own alarm?', 487, 590, tSub, null, { size: 32 });
  if (t >= tSub) {
    const p = K.popIn(t, tSub + 0.3, 0.45), pulse = 1 + 0.06 * Math.sin(t * 6);
    const qs = S.toScr(box.tip[0] - 80, box.tip[1] - 20);
    S.ui.push(() => {
      ctx.translate(qs[0], qs[1]); ctx.scale(p * pulse, p * pulse);
      ctx.fillStyle = S.ACC; ctx.font = K.font.display(90); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 0);
    });
  }
}
