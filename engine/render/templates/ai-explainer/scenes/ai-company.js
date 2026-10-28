// Scene "ai-company" (full frame; one mode per beat). A proposed new business form whose manager is an AI agent.
// Cartoon stand-ins only: the kit robot is "the AI agent", generic buildings carry text pills, no seals/logos/people
// likenesses (politicians are never drawn: their words appear as text in a quote panel).
// Fits: new legal forms for AI, "AI runs a company", liability / who-answers-for-AI stories, bills and their critics.
// Defaults are generic placeholders ("State office", "Big companies", "Quote goes here", "Lawmaker, letter, Date");
// pass the story's names, verbatim quote and published figures as params.
// Cue params are narration words ("word#n" = the (n+1)th time spoken) or a number of seconds into the scene; without
// them each mode uses fixed fractions of its duration (boss is a fixed ~2.5 s cold open).
// modes:
//  boss   (cold open) night office: the big boss chair swings round to reveal the robot; "MANAGER: AI AGENT" nameplate
//         pops, it stamps a contract APPROVED, "No human boss" pill. Action from frame 0.
//  draft  dusk street: a state office (text pill) issues a giant DRAFT bill "AI COMPANY"; then the robot walks in
//         beside a human supervisor who fades to a dashed ghost: "No routine human supervision" pill.
//  powers office: three power tiles pop on cue (contracts / property / sue or be sued), a bank tile gets a NO stamp,
//         then a sandbox frame rises round the robot with a "30-month test" sign and a filling bar.
//  scale  a grid of 15 towers ("Fortune 500"), 10 light up (two-thirds) and an "Incorporated in Delaware" pill; then the
//         robot stands by a target board and two labelled darts hit it (responsibility, damages).
//  shield office: an owner tosses coins into a CAPITAL jar for the robot's company, "Adequately capitalized" tick;
//         a glass shield drops in front of the owner, a harm claim bounces off it, "generally not liable"; a crack
//         and "Exception: fraud" pill.
//  letter dusk: a generic domed building sends a letter to a state office; a text-only quote panel types the verbatim
//         words with attribution, key words light up; DRAFT stamp + "Not law yet" pill.
// params: mode;
//  boss: stamp ("APPROVED"), plate ("MANAGER: AI AGENT"), pill ("No human boss")
//  draft: office, kicker, title1, title2, stamp ("DRAFT"), pill ("Proposal"), agentPill, supPill; propCue, coCue, agentCue, supCue
//  powers: powers [3] (tile labels: contracts / property / gavel), lawful, bank, bankStamp, testTop, testSub;
//          powerCues [3], lawfulCue, bankCue, testCue
//  scale: board, lit (towers lit of 15), share, place, company, hit1, hit2, view; shareCue, placeCue, viewCue, hit1Cue, hit2Cue
//  shield: owner, capital, capPill, claim, notLiable, exception; ownerCue, fundCue, capCue, shieldCue, claimCue, exceptCue
//  letter: from, to, sent, quote, hot [word prefixes to highlight], by, stamp ("DRAFT"), notLaw;
//          whoCue, wroteCue, quoteCue, hotCue, draftCue
export default function draw(ctx, t, info) {
  const P = info.params || {};
  const mode = P.mode || 'boss';
  const fn = { boss, draft, powers, scale, shield, letter }[mode] || boss;
  ctx.save();
  fn(ctx, t, info, P);
  ctx.restore();
}

// ------------------------------------------------------------------ helpers
function cue(info, w, d) {
  if (w == null || w === '') return d;
  if (typeof w === 'number') return w;
  const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
  return v == null ? d : v;
}

function panel(ctx, H, x0, y0, w, h, fill = 'rgba(10,12,22,0.86)', r = 22) {
  H.roundRect(ctx, x0, y0, w, h, r); ctx.fillStyle = fill; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
}

function text(ctx, H, s, x, y, kind, size, color, align = 'center', base = 'middle') {
  ctx.font = H.font(kind, size); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(s, x, y);
}

function popScale(ctx, x, y, k) { const s = Math.min(1.05, Math.max(0, k)); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y); }

// classical state office (generic: columns + pediment, no seal); anchor bottom-centre
function govBuilding(ctx, H, x, y, s, dome = false) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const W = 340, Hh = 250;
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 0, 200, 16, 0, 0, Math.PI * 2); ctx.fill();
  H.roundRect(ctx, -W / 2, -Hh, W, Hh, 8); ctx.fillStyle = '#9095ae'; ctx.fill();
  ctx.fillStyle = '#7b8098'; ctx.fillRect(W / 2 - 70, -Hh + 6, 64, Hh - 6);
  for (let i = 0; i < 5; i++) { const cx = -W / 2 + 40 + i * ((W - 80) / 4); ctx.fillStyle = '#b4b8cc'; ctx.fillRect(cx - 13, -Hh + 30, 26, Hh - 50); }
  H.roundRect(ctx, -W / 2 - 14, -24, W + 28, 24, 4); ctx.fillStyle = '#a7abc2'; ctx.fill();
  if (dome) {
    H.roundRect(ctx, -110, -Hh - 46, 220, 50, 6); ctx.fillStyle = '#a7abc2'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -Hh - 46, 100, Math.PI, 0); ctx.fillStyle = '#c3c7d9'; ctx.fill();
    ctx.fillStyle = '#aeb2c7'; ctx.beginPath(); ctx.arc(0, -Hh - 46, 100, Math.PI * 1.5, 0); ctx.lineTo(0, -Hh - 46); ctx.fill();
    ctx.fillStyle = '#c3c7d9'; ctx.fillRect(-8, -Hh - 176, 16, 34);
  } else {
    ctx.beginPath(); ctx.moveTo(-W / 2 - 24, -Hh + 4); ctx.lineTo(0, -Hh - 80); ctx.lineTo(W / 2 + 24, -Hh + 4); ctx.closePath();
    ctx.fillStyle = '#b4b8cc'; ctx.fill();
  }
  H.roundRect(ctx, -32, -110, 64, 110, 6); ctx.fillStyle = '#4b4f66'; ctx.fill();
  ctx.restore();
}

// the big bill sheet; anchor = centre; s scales 300x380
function billSheet(ctx, H, x, y, s, o) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; H.roundRect(ctx, -146, -182, 300, 380, 14); ctx.fill();
  H.roundRect(ctx, -150, -190, 300, 380, 14); ctx.fillStyle = '#f4f6fb'; ctx.fill();
  text(ctx, H, o.kicker || 'NEW BUSINESS FORM', 0, -150, 'ui', 20, '#5b6488');
  text(ctx, H, o.title1 || 'AI', 0, -92, 'display', 64, '#141829');
  text(ctx, H, o.title2 || 'COMPANY', 0, -36, 'display', 46, '#141829');
  for (let i = 0; i < 6; i++) { H.roundRect(ctx, -110, 4 + i * 24, i === 5 ? 120 : 220 - (i % 2) * 30, 9, 4); ctx.fillStyle = '#d5d9e6'; ctx.fill(); }
  ctx.restore();
}

// boss chair: back view (k = cos of the turn, <0 shows the back) ; anchor bottom-centre of the seat base
function bossChair(ctx, H, x, y, s, k, accent) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // base + stem
  ctx.fillStyle = '#1b1f33';
  H.roundRect(ctx, -90, -14, 180, 14, 7); ctx.fill();
  ctx.fillRect(-8, -90, 16, 80);
  ctx.save(); ctx.scale(Math.max(0.08, Math.abs(k)), 1);
  // seat back (tall, tufted)
  H.roundRect(ctx, -120, -430, 240, 330, 60); ctx.fillStyle = k < 0 ? '#3a2a2e' : '#4a3236'; ctx.fill();
  if (k < 0) { // back panel seams
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 6;
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-80 + i * 80, -400); ctx.lineTo(-80 + i * 80, -130); ctx.stroke(); }
  }
  ctx.restore();
  ctx.restore();
}

function robotAt(K, ctx, x, y, s, t, state, extra = {}) { K.drawRobot(ctx, x, y, s, Object.assign({ t, state, seed: 3 }, extra)); }

// ------------------------------------------------------------------ boss (cold open)
function boss(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, ACC = info.accent, { clamp, lerp } = H;
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 487, y: 760 }, { t: info.duration, zoom: 1.0, x: 487, y: 725 }]);
  K.world.office(ctx, { t, time: 'night' });
  const turn = K.phase(t, 0, 0.75, H.easeOutCubic);          // chair spins from back view to front
  const ang = lerp(Math.PI * 0.82, Math.PI * 2, turn);      // starts mid-spin at frame 0
  const k = Math.cos(ang);
  const CX = 487, SEAT = 930;
  // spotlight
  K.glow(ctx, CX, 640, 420, '#ffe7a8', 0.16);
  // the chair (behind the robot)
  bossChair(ctx, H, CX, SEAT + 80, 1.0, k, ACC);
  // robot revealed when the chair faces us
  if (k > 0.15) {
    const a = clamp((k - 0.15) / 0.5);
    ctx.save(); ctx.globalAlpha = a;
    robotAt(K, ctx, CX, SEAT + 20, 1.45, t, t > 1.7 ? 'happy' : 'working', { talk: 0 });
    ctx.restore();
  }
  // motion lines while spinning
  if (turn < 1) {
    ctx.save(); ctx.strokeStyle = H.rgba('#ffffff', 0.85 * (1 - turn * turn)); ctx.lineWidth = 9; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(CX, 700, 170 + i * 26, -0.4 - i * 0.12, 0.5 - i * 0.12); ctx.stroke(); }
    ctx.restore();
  }
  // papers blown off the desk by the spin (in flight at frame 0, settled by ~1.4 s)
  for (let i = 0; i < 3; i++) {
    const u = clamp((t + 0.35 - i * 0.12) / 1.1);
    if (u < 1) {
      const x = lerp(560 + i * 30, 300 + i * 180, u), y = lerp(880, 1030, u) - Math.sin(u * Math.PI) * (160 + 40 * i);
      ctx.save(); ctx.globalAlpha = 1 - u * u; ctx.translate(x, y); ctx.rotate(u * (3 + i));
      H.roundRect(ctx, -34, -24, 68, 48, 5); ctx.fillStyle = '#f4f6fb'; ctx.fill(); ctx.restore();
    }
  }
  // executive desk in front
  ctx.save();
  H.roundRect(ctx, 130, 900, 715, 34, 12); ctx.fillStyle = '#5a3f33'; ctx.fill();
  H.roundRect(ctx, 150, 930, 675, 110, 10); ctx.fillStyle = '#47322a'; ctx.fill();
  H.roundRect(ctx, 150, 930, 675, 12, 6); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
  ctx.restore();
  // contract on the desk + stamp
  const tStamp = 1.55;
  ctx.save(); ctx.translate(690, 905); ctx.rotate(-0.06);
  H.roundRect(ctx, -70, -50, 140, 46, 6); ctx.fillStyle = '#f4f6fb'; ctx.fill();
  for (let i = 0; i < 3; i++) { H.roundRect(ctx, -56, -42 + i * 12, 100 - i * 20, 6, 3); ctx.fillStyle = '#c9cede'; ctx.fill(); }
  ctx.restore();
  if (t > tStamp) K.drawStamp(ctx, 690, 900, 0.62, { kind: 'check', text: P.stamp || 'APPROVED', land: (t - tStamp) / 0.5 });
  // nameplate
  const np = K.popIn(t, 0.75, 0.4);
  if (np > 0) {
    ctx.save(); popScale(ctx, 330, 900, np);
    H.roundRect(ctx, 190, 848, 280, 54, 10); ctx.fillStyle = '#c9a24a'; ctx.fill();
    H.roundRect(ctx, 198, 855, 264, 40, 7); ctx.fillStyle = '#1b1f33'; ctx.fill();
    text(ctx, H, P.plate || 'MANAGER: AI AGENT', 330, 876, 'ui', 22, ACC);
    ctx.restore();
  }
  // pill
  const pp = K.popIn(t, 2.0, 0.4);
  if (pp > 0) K.drawLabel(ctx, 487, 500, Math.min(1.05, pp), { text: P.pill || 'No human boss', size: 30, accent: true });
}

// ------------------------------------------------------------------ draft
function draft(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, ACC = info.accent, D = info.duration, { clamp, lerp } = H;
  const tProp = cue(info, P.propCue, D * 0.24) - 0.2;
  const tCo = cue(info, P.coCue, D * 0.47);
  const tAgent = cue(info, P.agentCue, D * 0.62) - 0.6;
  const tSup = cue(info, P.supCue, D * 0.91) - 0.3;
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 470, y: 760 }, { t: tAgent, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 500, y: 760 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 990 });
  const FEET = 1020;
  // phase A: state office + bill. fades/slides out as phase B starts
  const B = K.phase(t, tAgent, tAgent + 0.8);
  ctx.save(); ctx.globalAlpha = 1 - B;
  // state office on the left
  const gx = 290, gs = 0.95;
  govBuilding(ctx, H, gx, FEET, gs, false);
  K.drawLabel(ctx, gx, FEET - 345 * gs - 20, 1, { text: P.office || 'State office', size: 26, dot: true });
  ctx.restore();
  // the bill flies from the door and grows; in phase B it parks top-right small
  const fly = K.phase(t, tProp, tProp + 0.9, H.easeOutCubic);
  if (fly > 0) {
    const x = lerp(lerp(gx, 660, fly), 750, B), y = lerp(lerp(FEET - 60, 720, fly), 560, B);
    const s = lerp(lerp(0.2, 1.0, fly), 0.5, B);
    billSheet(ctx, H, x, y, s, { rot: lerp(-0.3, 0.04, fly), kicker: P.kicker, title1: P.title1, title2: P.title2 });
    if (t > tCo - 0.1) K.drawStamp(ctx, x + 70 * s, y + 140 * s, 0.75 * s, { kind: 'check', text: P.stamp || 'DRAFT', land: (t - tCo + 0.1) / 0.5 });
    const pk = K.popIn(t, tProp + 0.6, 0.4);
    if (pk > 0 && B < 1) { ctx.save(); ctx.globalAlpha = 1 - B; K.drawLabel(ctx, 660, 500, Math.min(1.05, pk), { text: P.pill || 'Proposal', size: 28, accent: true }); ctx.restore(); }
  }
  // phase B: robot walks in, human supervisor beside it fades to a dashed ghost
  if (B > 0) {
    const walk = K.phase(t, tAgent, tAgent + 1.4);
    const rx = lerp(1000, 560, walk);
    const sup = K.phase(t, tSup, tSup + 0.9);
    // supervisor (cartoon), fades out to a ghost outline
    const px = 360;
    if (sup < 1) { ctx.save(); ctx.globalAlpha = B * (1 - sup); K.drawPerson(ctx, px, FEET, 1.35, { t, pose: 'point', mood: 'neutral', skin: 1, hair: 2, shirt: 3, hairStyle: 'short', seed: 4, look: 0.6 }); ctx.restore(); }
    if (sup > 0) {
      ctx.save(); ctx.globalAlpha = sup; ctx.setLineDash([14, 12]); ctx.lineWidth = 5; ctx.strokeStyle = H.rgba('#ffffff', 0.7);
      ctx.beginPath(); ctx.arc(px, FEET - 270, 42, 0, Math.PI * 2); ctx.stroke();
      H.roundRect(ctx, px - 55, FEET - 220, 110, 190, 30); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
      const ck = K.popIn(t, tSup + 0.4, 0.4);
      if (ck > 0) {
        ctx.save(); ctx.globalAlpha = Math.min(1, ck); ctx.strokeStyle = '#ff5a5a'; ctx.lineWidth = 12; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(px - 60, FEET - 300); ctx.lineTo(px + 60, FEET - 60); ctx.moveTo(px + 60, FEET - 300); ctx.lineTo(px - 60, FEET - 60); ctx.stroke(); ctx.restore();
      }
    }
    const rb = walk > 0 && walk < 1 ? -Math.abs(Math.sin(t * 9)) * 8 : 0;
    robotAt(K, ctx, rx, FEET + rb, 1.35, t, walk >= 1 ? 'working' : 'idle', { flip: true });
    // briefcase in the robot's hand
    K.drawBriefcase(ctx, rx - 95, FEET - 95 + rb, 0.55);
    const ak = K.popIn(t, tAgent + 1.0, 0.4);
    if (ak > 0) K.drawLabel(ctx, rx, FEET - 330, Math.min(1.05, ak), { text: P.agentPill || 'AI agent runs it', size: 26, dot: true });
    const sk = K.popIn(t, tSup + 0.5, 0.45);
    if (sk > 0) K.drawLabel(ctx, 440, 520, Math.min(1.05, sk), { text: P.supPill || 'No routine human supervision', size: 28, accent: true });
  }
}

// ------------------------------------------------------------------ powers
function tile(ctx, H, K, x, y, k, label, icon, ACC, t) {
  if (k <= 0) return;
  ctx.save(); popScale(ctx, x, y + 90, k);
  panel(ctx, H, x - 112, y, 224, 190, 'rgba(14,17,32,0.9)', 22);
  ctx.save(); ctx.beginPath(); H.roundRect(ctx, x - 112, y, 224, 190, 22); ctx.clip();
  if (icon === 'doc') K.drawDocument(ctx, x, y + 135, 0.62, { sign: H.clamp(k), lines: 4, shadow: false });
  if (icon === 'house') {
    ctx.fillStyle = '#7f88b8'; ctx.fillRect(x - 46, y + 70, 92, 66);
    ctx.beginPath(); ctx.moveTo(x - 60, y + 74); ctx.lineTo(x, y + 26); ctx.lineTo(x + 60, y + 74); ctx.closePath(); ctx.fillStyle = '#c66a5a'; ctx.fill();
    ctx.fillStyle = '#2b2f47'; ctx.fillRect(x - 12, y + 100, 24, 36);
    // key
    ctx.save(); ctx.translate(x + 56, y + 110); ctx.rotate(-0.5 + Math.sin(t * 3) * 0.08);
    ctx.strokeStyle = ACC; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = ACC; ctx.fillRect(10, -4, 36, 8); ctx.fillRect(36, 2, 6, 12); ctx.restore();
  }
  if (icon === 'gavel') K.drawGavel(ctx, x, y + 118, 0.55, { hit: (Math.sin(t * 4) + 1) / 2 });
  ctx.restore();
  text(ctx, H, label, x, y + 166, 'ui', 24, '#ffffff');
  ctx.restore();
}

function powers(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, ACC = info.accent, D = info.duration, { clamp, lerp } = H;
  const PC = P.powerCues || [], PW = P.powers || ['Sign contracts', 'Own property', 'Sue or be sued'];
  const c1 = cue(info, PC[0], D * 0.07) - 0.3, c2 = cue(info, PC[1], D * 0.19) - 0.3, c3 = cue(info, PC[2], D * 0.3) - 0.3;
  const tLaw = cue(info, P.lawfulCue, D * 0.55) - 0.3, tBank = cue(info, P.bankCue, D * 0.64) - 0.1, tTest = cue(info, P.testCue, D * 0.84) - 0.4;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
  K.world.office(ctx, { t, time: 'dusk' });
  const FEET = 1025;
  // tiles row (top)
  tile(ctx, H, K, 237, 430, K.popIn(t, c1, 0.4), PW[0], 'doc', ACC, t);
  tile(ctx, H, K, 487, 430, K.popIn(t, c2, 0.4), PW[1], 'house', ACC, t);
  tile(ctx, H, K, 737, 430, K.popIn(t, c3, 0.4), PW[2], 'gavel', ACC, t);
  // lawful pill + bank (right)
  const fadeOut = 1 - K.phase(t, tTest, tTest + 0.5);
  ctx.save(); ctx.globalAlpha = fadeOut;
  const lk = K.popIn(t, tLaw, 0.4);
  if (lk > 0) K.drawLabel(ctx, 300, 700, Math.min(1.05, lk), { text: P.lawful || 'Any lawful business', size: 28, dot: true });
  const bk = K.popIn(t, tBank - 0.5, 0.45);
  if (bk > 0) {
    ctx.save(); popScale(ctx, 770, 900, bk);
    govBuilding(ctx, H, 770, 900, 0.48, false);
    K.drawLabel(ctx, 770, 735, 1, { text: P.bank || 'BANK', size: 24 });
    ctx.restore();
    if (t > tBank && t < tTest + 0.25) {
      K.drawStamp(ctx, 770, 930, 0.62, { kind: 'cross', text: P.bankStamp || 'NOT ALLOWED', land: (t - tBank) / 0.5 });
    }
  }
  ctx.restore();
  // sandbox rises round the robot
  const sb = K.phase(t, tTest, tTest + 0.7, H.easeOutCubic);
  const RX = 330;
  if (sb > 0) {
    ctx.save();
    const top = lerp(FEET + 10, FEET - 50, sb);
    ctx.fillStyle = '#d9b46a'; H.roundRect(ctx, RX - 230, top + 14, 650, FEET + 30 - top - 14, 10); ctx.fill();
    ctx.fillStyle = '#8a5a34'; H.roundRect(ctx, RX - 245, top, 680, 26, 8); ctx.fill();
    H.roundRect(ctx, RX - 245, FEET + 14, 680, 26, 8); ctx.fill();
    ctx.restore();
  }
  robotAt(K, ctx, RX, FEET - (sb > 0 ? 30 * sb : 0), 1.3, t, t > c1 ? 'working' : 'idle');
  if (sb > 0) {
    // sign stuck in the sand
    const sx = RX + 330, sy = FEET - 30;
    ctx.save(); ctx.globalAlpha = clamp(sb * 1.4);
    ctx.fillStyle = '#8a5a34'; ctx.fillRect(sx - 6, sy - 200, 12, 200);
    H.roundRect(ctx, sx - 110, sy - 300, 220, 110, 14); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    text(ctx, H, P.testTop || 'TRIAL', sx, sy - 268, 'display', 34, '#141829');
    text(ctx, H, P.testSub || 'TEST', sx, sy - 232, 'display', 28, '#5b6488');
    // progress bar fills
    const u = clamp((t - tTest - 0.6) / 1.6);
    H.roundRect(ctx, sx - 90, sy - 214, 180, 14, 7); ctx.fillStyle = '#d5d9e6'; ctx.fill();
    H.roundRect(ctx, sx - 90, sy - 214, 180 * u, 14, 7); ctx.fillStyle = ACC; ctx.fill();
    ctx.restore();
  }
}

// ------------------------------------------------------------------ scale
function tower(ctx, H, x, y, w, h, on, ACC) {
  H.roundRect(ctx, x - w / 2, y - h, w, h, 6); ctx.fillStyle = on > 0 ? H.mixHex('#4a5285', ACC, on) : '#4a5285'; ctx.fill();
  for (let r = 0; r < Math.floor((h - 16) / 22); r++) for (let c = 0; c < 2; c++) {
    H.roundRect(ctx, x - w / 2 + 10 + c * (w / 2 - 4), y - h + 10 + r * 22, w / 2 - 16, 12, 3);
    ctx.fillStyle = on > 0 ? H.rgba('#10142a', 0.45) : H.rgba('#ffe7a8', 0.5); ctx.fill();
  }
}

function dart(ctx, H, x, y, ang, label, ACC, k) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  ctx.strokeStyle = '#e8ebf5'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-150, 0); ctx.lineTo(-6, 0); ctx.stroke();
  ctx.fillStyle = '#e8ebf5'; ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(-30, -18); ctx.lineTo(-30, 18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(-140, 0); ctx.lineTo(-190, -30); ctx.lineTo(-168, 0); ctx.lineTo(-190, 30); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function scale(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, ACC = info.accent, D = info.duration, { clamp, lerp } = H;
  const tThirds = cue(info, P.shareCue, D * 0.13) - 0.2, tDel = cue(info, P.placeCue, D * 0.44) - 0.6;
  const tBack = cue(info, P.viewCue, D * 0.54) - 0.4;
  const tR = cue(info, P.hit1Cue, D * 0.84) - 0.35, tDmg = cue(info, P.hit2Cue, D * 0.92) - 0.35;
  const nLit = P.lit == null ? 10 : P.lit;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 740 }]);
  K.world.city(ctx, { t, time: 'night', groundY: 990 });
  const B = K.phase(t, tBack, tBack + 0.7);
  // phase A: the Fortune 500 board
  if (B < 1) {
    ctx.save(); ctx.globalAlpha = 1 - B; ctx.translate(0, -B * 60);
    panel(ctx, H, 100, 430, 775, 590, 'rgba(10,12,26,0.88)', 28);
    const lk = K.popIn(t, 0.05, 0.4);
    if (lk > 0) K.drawLabel(ctx, 487, 500, Math.min(1.05, lk), { text: P.board || 'BIG COMPANIES', size: 30, dot: true });
    for (let i = 0; i < 15; i++) {
      const r = Math.floor(i / 5), c = i % 5;
      const x = 196 + c * 146, y = 660 + r * 130, h = 120 + 16 * H.hash(i, 3);
      const lit = i < nLit ? clamp((t - tThirds - i * 0.12) / 0.25) : 0;
      const bob = lit > 0 && lit < 1 ? -Math.sin(lit * Math.PI) * 10 : 0;
      tower(ctx, H, x, y + bob, 60, h * 0.82, lit, ACC);
    }
    const ck = K.popIn(t, tThirds + 1.3, 0.4);
    if (ck > 0) K.drawLabel(ctx, 270, 1000, Math.min(1.05, ck), { text: P.share || 'Most of them', size: 28, accent: true });
    const dk = K.popIn(t, tDel, 0.4);
    if (dk > 0) K.drawLabel(ctx, 610, 1000, Math.min(1.05, dk), { text: P.place || 'Incorporated here', size: 24, dot: true });
    ctx.restore();
  }
  // phase B: legal identity = a target that responsibility and damages can hit
  if (B > 0) {
    ctx.save(); ctx.globalAlpha = B;
    const FEET = 1020, RX = 260;
    robotAt(K, ctx, RX, FEET, 1.3, t, t > tDmg + 0.3 ? 'thinking' : 'idle');
    K.drawLabel(ctx, RX, FEET - 320, 1, { text: P.company || 'AI COMPANY', size: 26, dot: true });
    // target board on a stand
    const TX = 640, TY = 730, R = 170;
    ctx.fillStyle = '#5a4030'; ctx.fillRect(TX - 8, TY, 16, FEET - TY); ctx.fillRect(TX - 80, FEET - 12, 160, 12);
    const rings = ['#f4f6fb', '#ff6b5a', '#f4f6fb', '#ff6b5a', ACC];
    rings.forEach((col, i) => { ctx.beginPath(); ctx.arc(TX, TY, R * (1 - i * 0.19), 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); });
    const hit1 = K.phase(t, tR, tR + 0.45, (u) => u), hit2 = K.phase(t, tDmg, tDmg + 0.45, (u) => u);
    const shake = (tt) => (t > tt + 0.45 && t < tt + 0.75 ? Math.sin((t - tt) * 60) * 4 : 0);
    if (hit1 > 0) {
      const x = lerp(1100, TX - 18, hit1), y = lerp(560, TY - 30, hit1) + shake(tR);
      dart(ctx, H, x, y, 0.12, '', ACC, hit1);
      if (hit1 >= 1) { const k = K.popIn(t, tR + 0.45, 0.35); K.drawLabel(ctx, 640, 520, Math.min(1.05, k), { text: P.hit1 || 'Responsibility', size: 28, accent: true }); }
    }
    if (hit2 > 0) {
      const x = lerp(1100, TX + 20, hit2), y = lerp(980, TY + 40, hit2) + shake(tDmg);
      dart(ctx, H, x, y, -0.15, '', ACC, hit2);
      if (hit2 >= 1) { const k = K.popIn(t, tDmg + 0.45, 0.35); K.drawLabel(ctx, 640, 960, Math.min(1.05, k), { text: P.hit2 || 'Damages', size: 28, accent: true }); }
    }
    const bk = K.popIn(t, tBack + 0.6, 0.4);
    if (bk > 0) K.drawLabel(ctx, 300, 520, Math.min(1.05, bk), { text: P.view || "Backers' view", size: 26 });
    ctx.restore();
  }
}

// ------------------------------------------------------------------ shield
function shield(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, ACC = info.accent, D = info.duration, { clamp, lerp } = H;
  const tOwner = cue(info, P.ownerCue, D * 0.15) - 0.3, tFund = cue(info, P.fundCue, D * 0.19) - 0.1;
  const tCap = cue(info, P.capCue, D * 0.37) - 0.2, tGen = cue(info, P.shieldCue, D * 0.52) - 0.5;
  const tAI = cue(info, P.claimCue, D * 0.73) - 0.9, tFraud = cue(info, P.exceptCue, D * 0.86) - 0.2;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 487, y: 760 }]);
  K.world.office(ctx, { t, time: 'dusk' });
  const FEET = 1025, OX = 210, JX = 530, RX = 760;
  // owner
  const ow = K.popIn(t, Math.max(0, tOwner - 0.2), 0.4);
  K.drawPerson(ctx, OX, FEET, 1.3, { t, pose: t > tFund && t < tFund + 1.6 ? 'point' : 'stand', mood: t > tAI + 0.5 && t < tFraud ? 'happy' : 'neutral', skin: 3, hair: 1, shirt: 2, hairStyle: 'long', seed: 9, look: 0.6 });
  if (ow > 0) K.drawLabel(ctx, OX, FEET - 300, Math.min(1.05, ow), { text: P.owner || 'OWNER', size: 26, dot: true });
  // capital jar
  const fill = clamp((t - tFund) / Math.max(0.6, tCap - tFund + 0.2));
  ctx.save();
  const JW = 170, JH = 210, jy = FEET - JH;
  H.roundRect(ctx, JX - JW / 2, jy, JW, JH, 26); ctx.fillStyle = H.rgba('#cfe3ff', 0.16); ctx.fill();
  ctx.save(); H.roundRect(ctx, JX - JW / 2, jy, JW, JH, 26); ctx.clip();
  const lvl = JH * 0.85 * fill;
  ctx.fillStyle = '#e8b93c'; ctx.fillRect(JX - JW / 2, FEET - lvl, JW, lvl);
  for (let i = 0; i < 7; i++) { ctx.fillStyle = '#c9952a'; ctx.beginPath(); ctx.ellipse(JX - 60 + i * 20, FEET - lvl + 6, 14, 6, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  ctx.lineWidth = 4; ctx.strokeStyle = H.rgba('#ffffff', 0.55); H.roundRect(ctx, JX - JW / 2, jy, JW, JH, 26); ctx.stroke();
  H.roundRect(ctx, JX - JW / 2 - 8, jy - 16, JW + 16, 22, 8); ctx.fillStyle = '#6b7396'; ctx.fill();
  ctx.restore();
  K.drawLabel(ctx, JX, jy - 30, 1, { text: P.capital || 'CAPITAL', size: 24 });
  // coins arcing owner -> jar
  for (let i = 0; i < 6; i++) {
    const u = (t - tFund - i * 0.22) / 0.6;
    if (u > 0 && u < 1) {
      const x = lerp(OX + 60, JX, u), y = lerp(FEET - 160, jy + 10, u) - Math.sin(u * Math.PI) * 140;
      K.drawCoin(ctx, x, y, 0.55, { spin: t * 8 + i });
    }
  }
  const ck = K.popIn(t, tCap + 0.2, 0.4), cOut = clamp((t - tAI - 0.6) / 0.3);
  if (ck > 0 && cOut < 1) { ctx.save(); ctx.globalAlpha = 1 - cOut; K.drawLabel(ctx, 487, 520, Math.min(1.05, ck), { text: P.capPill || 'Enough capital', size: 28, accent: true }); ctx.restore(); }
  // robot (the AI company)
  robotAt(K, ctx, RX, FEET, 1.25, t, t > tAI && t < tAI + 1.2 ? 'thinking' : 'working', { flip: true });
  // glass shield drops in front of the owner
  const sd = K.phase(t, tGen, tGen + 0.5, H.easeOutCubic);
  const GX = 330;
  if (sd > 0) {
    const gTop = lerp(300, 640, sd);
    ctx.save();
    H.roundRect(ctx, GX - 16, gTop, 32, FEET - 640 + 5, 10);
    ctx.fillStyle = H.rgba('#9fd8ff', 0.28); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = H.rgba('#cfeeff', 0.8); ctx.stroke();
    ctx.fillStyle = H.rgba('#ffffff', 0.5); ctx.fillRect(GX - 8, gTop + 20, 5, 160);
    // crack at fraud
    const cr = K.phase(t, tFraud, tFraud + 0.4, (u) => u);
    if (cr > 0) {
      ctx.strokeStyle = '#ff5a5a'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      K.pathDraw(ctx, [[GX, gTop + 60], [GX - 10, gTop + 130], [GX + 8, gTop + 190], [GX - 6, gTop + 260], [GX + 6, gTop + 330]], cr);
    }
    ctx.restore();
  }
  // a harm claim flies from the robot toward the owner and bounces off the glass
  if (t > tAI) {
    const u = clamp((t - tAI) / 0.55), back = clamp((t - tAI - 0.55) / 0.6);
    let x = lerp(RX - 60, GX + 40, u), y = lerp(FEET - 230, 760, u) - Math.sin(u * Math.PI) * 120;
    if (back > 0) { x = lerp(GX + 40, 470, back); y = lerp(760, FEET - 20, back) - Math.sin(back * Math.PI) * 90; }
    ctx.save(); ctx.translate(x, y); ctx.rotate(back * 3.6);
    H.roundRect(ctx, -70, -40, 140, 80, 10); ctx.fillStyle = '#ff6b5a'; ctx.fill();
    text(ctx, H, P.claim || 'CLAIM', 0, 2, 'display', 28, '#2a0d0a');
    ctx.restore();
    if (back > 0.2) {
      const k = K.popIn(t, tAI + 0.75, 0.4);
      K.drawLabel(ctx, 487, 520, Math.min(1.05, k), { text: P.notLiable || 'Owner not liable', size: 28, accent: true });
    }
  }
  const fk = K.popIn(t, tFraud + 0.2, 0.4);
  if (fk > 0) {
    ctx.save(); popScale(ctx, 487, 610, fk);
    H.roundRect(ctx, 487 - 140, 572, 280, 58, 29); ctx.fillStyle = '#ff5a5a'; ctx.fill();
    text(ctx, H, P.exception || 'Exception', 487, 602, 'ui', 26, '#2a0d0a');
    ctx.restore();
  }
}

// ------------------------------------------------------------------ letter
function letter(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, ACC = info.accent, D = info.duration, { clamp, lerp } = H;
  const tWho = cue(info, P.whoCue, D * 0.16) - 0.6, tWrote = cue(info, P.wroteCue, D * 0.2) - 0.1;
  const tQ = cue(info, P.quoteCue, D * 0.27) - 0.4, tHot = cue(info, P.hotCue, D * 0.68) - 0.15;
  const tDraft = cue(info, P.draftCue, D * 0.92) - 0.3;
  const hot = (P.hot || []).map((h) => String(h).toLowerCase());
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 740 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 990 });
  const FEET = 1020;
  // left: generic domed building (no flag, no seal); right: state office
  govBuilding(ctx, H, 210, FEET, 0.62, true);
  govBuilding(ctx, H, 770, FEET, 0.62, false);
  K.drawLabel(ctx, 210, 778, 1, { text: P.from || 'Lawmakers', size: 22, dot: true });
  K.drawLabel(ctx, 770, 820, 1, { text: P.to || 'State office', size: 22, dot: true });
  // envelope flies left -> right
  const u = K.phase(t, tWrote, tWrote + 1.2);
  if (u > 0) {
    const x = lerp(260, 740, u), y = lerp(880, 900, u) - Math.sin(u * Math.PI) * 160;
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(u * Math.PI) * 0.25);
    H.roundRect(ctx, -52, -34, 104, 68, 6); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    ctx.strokeStyle = '#b7bdd2'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-52, -34); ctx.lineTo(0, 6); ctx.lineTo(52, -34); ctx.stroke();
    ctx.restore();
  }
  // quote panel (text only; the speaker is never drawn)
  const pk = K.popIn(t, tQ, 0.45);
  if (pk > 0) {
    const X0 = 125, W = 725, Y0 = 430;
    const quote = String(P.quote || '“Quote goes here.”');
    const size = 36, lines = H.wrap(ctx, quote, 'display', size, W - 70);
    const PH = 40 + lines.length * size * 1.2 + 70;
    const dim = 1 - 0.55 * K.phase(t, tDraft, tDraft + 0.4);
    ctx.save(); ctx.globalAlpha = dim; popScale(ctx, X0 + W / 2, Y0 + PH / 2, pk);
    H.roundRect(ctx, X0, Y0, W, PH, 26); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    H.roundRect(ctx, X0, Y0, 12, PH, 6); ctx.fillStyle = ACC; ctx.fill();
    const shown = K.typewriter(quote, t, 42, tQ + 0.25).length;
    let used = 0;
    const hotOn = t > tHot;
    lines.forEach((ln, i) => {
      const n = clamp(shown - used, 0, ln.length); used += ln.length + 1;
      let s = ln.slice(0, n); const sp = s.lastIndexOf(' ');
      if (n < ln.length) s = sp > 0 ? s.slice(0, sp) : '';
      if (!s) return;
      const y = Y0 + 40 + size * 0.85 + i * size * 1.2;
      ctx.font = H.font('display', size); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      // highlight the key words
      if (hotOn && hot.length) {
        const hk = clamp((t - tHot) / 0.4);
        let off = 0;
        for (const wd of s.split(' ')) {
          const ww = ctx.measureText(wd).width;
          const lw = wd.toLowerCase().replace(/^[“"‘'…]+/, '');
          if (hot.some((h) => lw.startsWith(h))) { H.roundRect(ctx, X0 + 40 + off - 5, y - size * 0.82, (ww + 10) * hk, size * 1.05, 8); ctx.fillStyle = H.rgba(ACC, 0.85); ctx.fill(); }
          off += ww + ctx.measureText(' ').width;
        }
      }
      ctx.fillStyle = '#141829'; ctx.fillText(s, X0 + 40, y);
    });
    const ak = clamp((t - tQ - 0.5) / 0.4);
    ctx.globalAlpha = ak;
    text(ctx, H, '— ' + (P.by || 'Lawmaker, letter, Date'), X0 + 40, Y0 + PH - 34, 'ui', 24, '#4a5378', 'left');
    ctx.restore();
  }
  const wk = K.popIn(t, tWho, 0.4);
  if (wk > 0 && pk <= 0) K.drawLabel(ctx, 487, 560, Math.min(1.05, wk), { text: P.sent || 'Letter sent', size: 28, dot: true });
  // DRAFT stamp + pill
  if (t > tDraft) K.drawStamp(ctx, 487, 860, 1.0, { kind: 'check', text: P.stamp || 'DRAFT', land: (t - tDraft) / 0.5 });
  const nk = K.popIn(t, tDraft + 0.35, 0.4);
  if (nk > 0) K.drawLabel(ctx, 487, 1010, Math.min(1.05, nk), { text: P.notLaw || 'Not law yet', size: 30, accent: true });
}
