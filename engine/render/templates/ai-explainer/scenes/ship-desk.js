// Scene "ship-desk" (full frame). A night software office with a waist-high conveyor belt of code-change cards
// (pull requests as paper sheets with </> and +/- lines). The kit robot runs the approval desk with a big hand stamp.
// Modes:
//  hook     cold open: a card is already under the stamp at frame 0, APPROVED lands, the card rides off through a
//           green-lit merge gate; the next card follows; a human reviewer beside the belt looks on, shocked.
//  launch   name pill + date pill; three robots behind the belt pop in on cues, each with a tool sign (REVIEW
//           magnifier / FIX wrench / APPROVE stamp) and works on the cards that pass.
//  pile     a human reviewer at a desk under a growing tower of change cards that robots at laptops keep sending;
//           verbatim quote panel + attribution; on hardCue the pile wobbles, the wall clock races, reviewer worried.
//  policy   a rule sheet on the wall (rows pop on cues); a docs card is stamped by the robot; a red "sensitive"
//           card with a padlock passes the robot and goes to the human; a small fixer robot gets a NO-APPROVE chip.
//  numbers  a wall board: header pill, two bar pairs (`months`: before vs after) that grow/shrink to published shares.
//  stakes   a big generic phone whose app tiles get update badges from the belt; a reviewer with a magnifier over
//           one red card while routine cards zip by; two hedged question pills.
//  caveat   a card carrying a little bug gets APPROVED and the bug rides through; warning quote panel; plan pill;
//           on watchCue an "observe only" eye sign replaces the stamping.
// Added to the library 2026-11-24 (from an AI code-review agent launch). params: mode, plus per mode (all text
// optional, generic placeholder defaults; pass the story's names, quotes and published figures):
//  hook: stamp ("APPROVED")
//  launch: name, date, roles [3], nameCue, dateCue, roleCues [3]
//  pile: quote, by, hard, quoteCue, hardCue
//  policy: title, rows [{text, kind ok|person}] (2), person, fixer, rowCues [2], docsCue, stampCue, riskCue, fixerCue
//  numbers: head, sub, a {label, from, to, tag}, b {label, from, to, tag}, months [2] ("BEFORE", "AFTER"), headCue,
//           aCue, bCue
//  stakes: q1, q2, phoneCue, q1Cue, q2Cue
//  caveat: quote, by, plans, watch, missCue, quoteCue, plansCue, watchCue
// Cues are narration words ("word#n" = the (n+1)th time spoken in the scene) or numbers (scene seconds).
// Fits: AI code review / approval agents, automation taking over a sign-off step, review bottlenecks.
const DANGER = '#ff6b5e', GOOD = '#5be38a', PAPER = '#f4f6fb', INK = '#141829', LINE = '#c9d0e6';

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => {
    if (typeof w === 'number') return w;
    const [word, n] = String(w || '').split('#');
    const v = word ? info.timeOf(word, n ? +n : 0) : null;
    return v == null ? d : v;
  };
  const mode = P.mode || 'hook';

  // ------------------------------------------------------------------ shared drawing helpers
  const BELT_Y = 905;
  function belt(x0 = 0, x1 = 1080, speed = 1) {
    roundRect(ctx, x0, BELT_Y, x1 - x0, 46, 14); ctx.fillStyle = '#1a1f38'; ctx.fill();
    roundRect(ctx, x0, BELT_Y, x1 - x0, 14, 7); ctx.fillStyle = '#3a4675'; ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.rect(x0, BELT_Y + 16, x1 - x0, 26); ctx.clip();
    const off = (t * 140 * speed) % 60;
    ctx.fillStyle = '#2a3156';
    for (let x = x0 - 60 + off; x < x1 + 60; x += 60) ctx.fillRect(x, BELT_Y + 18, 30, 22);
    ctx.restore();
    for (let x = x0 + 50; x < x1; x += 160) { roundRect(ctx, x - 8, BELT_Y + 46, 16, 70, 6); ctx.fillStyle = '#11142a'; ctx.fill(); }
  }
  // a change card standing with its bottom-centre at (x, y)
  function card(x, y, s, kind = 'code', o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
    ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, 2, 62, 8, 0, 0, Math.PI * 2); ctx.fill();
    roundRect(ctx, -60, -150, 120, 150, 10); ctx.fillStyle = PAPER; ctx.fill();
    const head = kind === 'risk' ? DANGER : kind === 'docs' ? '#6f86e0' : '#3b4672';
    ctx.save(); roundRect(ctx, -60, -150, 120, 150, 10); ctx.clip(); ctx.fillStyle = head; ctx.fillRect(-60, -150, 120, 30); ctx.restore();
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (kind === 'docs') {          // open book glyph
      ctx.strokeStyle = '#3b4672'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(0, -102); ctx.quadraticCurveTo(-18, -110, -34, -104); ctx.lineTo(-34, -74); ctx.quadraticCurveTo(-18, -80, 0, -72);
      ctx.quadraticCurveTo(18, -80, 34, -74); ctx.lineTo(34, -104); ctx.quadraticCurveTo(18, -110, 0, -102); ctx.lineTo(0, -72); ctx.stroke();
    } else if (kind === 'risk') {   // padlock glyph
      ctx.strokeStyle = DANGER; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -92, 13, Math.PI, 0); ctx.stroke();
      roundRect(ctx, -20, -92, 40, 30, 6); ctx.fillStyle = DANGER; ctx.fill();
    } else {                        // </>
      ctx.strokeStyle = '#3b4672'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(-18, -104); ctx.lineTo(-32, -90); ctx.lineTo(-18, -76); ctx.moveTo(18, -104); ctx.lineTo(32, -90); ctx.lineTo(18, -76);
      ctx.moveTo(6, -108); ctx.lineTo(-6, -72); ctx.stroke();
    }
    // +/- diff lines
    const rows = [[GOOD, 70], [DANGER, 52], [GOOD, 84]];
    rows.forEach(([c, w], i) => {
      ctx.fillStyle = c; ctx.fillRect(-46, -56 + i * 16, 8, 8);
      roundRect(ctx, -32, -57 + i * 16, w, 9, 4); ctx.fillStyle = LINE; ctx.fill();
    });
    ctx.restore();
    if (o.stamp > 0) K.drawStamp(ctx, x + 8 * s, y - 20 * s, 0.42 * s, { land: o.stamp, kind: o.cross ? 'cross' : 'check', text: o.stampText || 'APPROVED' });
    if (o.eye > 0) eyeMark(x + 34 * s, y - 128 * s, 26 * s * Math.min(1, o.eye));
  }
  function eyeMark(x, y, r) {
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath(); ctx.ellipse(0, 0, r, r * 0.6, 0, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, r * 0.32, 0, Math.PI * 2); ctx.fillStyle = INK; ctx.fill();
    ctx.restore();
  }
  // the hand stamp tool; h = how far it is lifted above the landing point (x, y)
  function stampTool(x, y, h, o = {}) {
    ctx.save(); ctx.translate(x, y - h); if (o.s) ctx.scale(o.s, o.s);
    roundRect(ctx, -12, -150, 24, 96, 10); ctx.fillStyle = '#8a6a4a'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -158, 26, 0, Math.PI * 2); ctx.fillStyle = '#b48a5e'; ctx.fill();
    roundRect(ctx, -54, -58, 108, 40, 10); ctx.fillStyle = o.color || ACC; ctx.fill();
    roundRect(ctx, -60, -20, 120, 16, 6); ctx.fillStyle = '#2a3156'; ctx.fill();
    ctx.restore();
  }
  function magnifier(x, y, r, ang = 0.8) {
    ctx.save(); ctx.translate(x, y);
    ctx.strokeStyle = '#5b4632'; ctx.lineWidth = r * 0.28; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(Math.cos(ang) * r * 1.05, Math.sin(ang) * r * 1.05); ctx.lineTo(Math.cos(ang) * r * 2.1, Math.sin(ang) * r * 2.1); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(180,220,255,0.28)'; ctx.fill();
    ctx.lineWidth = r * 0.18; ctx.strokeStyle = '#d7dbe8'; ctx.stroke();
    ctx.restore();
  }
  function wrench(x, y, s, rot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    roundRect(ctx, -8, -10, 16, 80, 7); ctx.fillStyle = '#c9d0e6'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -18, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#272e4c'; ctx.fillRect(-8, -46, 16, 28);
    ctx.restore();
  }
  function panel(x0, y0, w, h, o = {}) {
    roundRect(ctx, x0, y0, w, h, 24); ctx.fillStyle = o.fill || 'rgba(12,14,26,0.9)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = o.stroke || rgba(ACC, 0.6); ctx.stroke();
  }
  // wrapped text block, returns height used
  function textBlock(text, x, y, size, maxW, kind = 'display', color = '#ffffff', align = 'left') {
    const lines = H.wrap(ctx, String(text), kind, size, maxW);
    ctx.font = H.font(kind, size); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    lines.forEach((ln, i) => ctx.fillText(ln, x, y + size * 0.95 + i * size * 1.2));
    return lines.length * size * 1.2;
  }
  // quote panel that pops at tq; verbatim text in quotes + attribution pill
  function quotePanel(text, by, tq, y0 = 440) {
    const p = K.popIn(t, tq, 0.45);
    if (p <= 0) return;
    const X0 = 130, W = 720, size = 34;
    const lines = H.wrap(ctx, `“${text}”`, 'display', size, W - 70);
    const h = 40 + lines.length * size * 1.2 + 30;
    ctx.save(); ctx.globalAlpha = clamp(p * 2);
    ctx.translate(487, y0 + h / 2); const s = Math.min(1.03, 0.75 + 0.25 * p); ctx.scale(s, s); ctx.translate(-487, -(y0 + h / 2));
    panel(X0, y0, W, h);
    textBlock(`“${text}”`, X0 + 35, y0 + 30, size, W - 70);
    ctx.restore();
    if (by) { const pb = K.popIn(t, tq + 0.5, 0.4); if (pb > 0) K.drawLabel(ctx, 487 + 220, y0 + h + 52, pb, { text: by, size: 26, dot: true }); }
  }
  function wallClock(x, y, r, speed) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = PAPER; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#3b4672'; ctx.stroke();
    const a1 = t * speed, a2 = t * speed / 12;
    ctx.lineCap = 'round'; ctx.strokeStyle = INK;
    ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(a2) * r * 0.5, y - Math.cos(a2) * r * 0.5); ctx.stroke();
    ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.sin(a1) * r * 0.8, y - Math.cos(a1) * r * 0.8); ctx.stroke();
  }
  // a merge gate at x: an arch whose lamp goes green when lit > 0
  function gate(x, lit) {
    ctx.save();
    ctx.strokeStyle = '#3a4675'; ctx.lineWidth = 18; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - 80, BELT_Y); ctx.lineTo(x - 80, BELT_Y - 230); ctx.quadraticCurveTo(x, BELT_Y - 300, x + 80, BELT_Y - 230); ctx.lineTo(x + 80, BELT_Y); ctx.stroke();
    const c = lit > 0 ? GOOD : '#55607f';
    if (lit > 0) H.glow(ctx, x, BELT_Y - 272, 70, GOOD, 0.6 * lit);
    ctx.beginPath(); ctx.arc(x, BELT_Y - 268, 18, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill();
    ctx.restore();
  }

  ctx.save();
  K.world.office(ctx, { t, time: 'night' });
  // dim the windows a touch so the action reads
  ctx.fillStyle = 'rgba(10,12,28,0.28)'; ctx.fillRect(0, 0, 1080, 1920);

  if (mode === 'hook' || mode === 'caveat') {
    // ------------------------------------------------------------ the approval desk (hook / caveat)
    const RX = 487, period = mode === 'hook' ? 1.8 : 2.2;
    const tMiss = mode === 'caveat' ? at(P.missCue, D * 0.12) : 0;
    const tWatch = mode === 'caveat' ? at(P.watchCue, D * 0.78) - 0.2 : Infinity;
    const first = mode === 'hook' ? 0.3 : Math.max(0.6, tMiss - 0.1);
    const watching = t > tWatch;
    // human reviewer (right), then the robot behind the belt
    const shocked = mode === 'hook' ? t > first + 0.25 : false;
    K.drawPerson(ctx, 790, 1000, 1.3, { t, pose: mode === 'caveat' && !watching ? 'shrug' : 'stand', mood: shocked ? 'shocked' : (watching ? 'neutral' : 'worried'), look: -0.8, shirt: '#e0a35b', skin: 2, hair: 1, hairStyle: 'bun', seed: 4 });
    K.drawRobot(ctx, RX - 10, 1000, 1.3, { t, state: watching ? 'thinking' : 'working', seed: 6 });
    if (mode === 'hook') gate(1000, 0); // lamp drawn again below when lit
    belt(0, 1080, 1);
    // cards: index i arrives at the stamp at tc = first + i * period
    let gateLit = 0, stampH = 150;
    for (let i = -1; i < 6; i++) {
      const tc = first + i * period;
      let x;
      if (t < tc) x = RX - (tc - t) * 520;
      else if (t < tc + 0.55) x = RX;
      else x = RX + (t - tc - 0.55) * 700;
      if (x < -120 || x > 1200) continue;
      if (Math.abs(x - 1000) < 90 && t > tc) gateLit = Math.max(gateLit, 1 - Math.abs(x - 1000) / 90);
      const land = t > tc ? clamp((t - tc + 0.05) / 0.5) : 0;
      const bug = mode === 'caveat' && i === 0;
      const isWatch = tc > tWatch;
      card(x, BELT_Y + 2, 1.15, bug ? 'code' : (i % 3 === 1 ? 'docs' : 'code'), { stamp: isWatch ? 0 : land, eye: isWatch ? land * 2 : 0 });
      if (bug) {                                   // a little bug creature rides on top of the card
        const bx = x - 20, by = BELT_Y - 150 * 1.15 - 4 + Math.sin(t * 14) * 2;
        ctx.save(); ctx.translate(bx, by);
        ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.lineCap = 'round';
        for (let l = -1; l <= 1; l++) { const w = Math.sin(t * 18 + l) * 4; ctx.beginPath(); ctx.moveTo(l * 12, -10); ctx.lineTo(l * 16 - 6, 4 + w); ctx.moveTo(l * 12, -10); ctx.lineTo(l * 16 + 6, 4 - w); ctx.stroke(); }
        ctx.beginPath(); ctx.ellipse(0, -18, 26, 18, 0, 0, Math.PI * 2); ctx.fillStyle = DANGER; ctx.fill();
        ctx.beginPath(); ctx.arc(22, -24, 10, 0, Math.PI * 2); ctx.fillStyle = '#c44a40'; ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(25, -27, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      // stamp height near this card's landing
      if (!isWatch) {
        const d = t - tc;
        if (d > -0.35 && d < 0.5) stampH = Math.min(stampH, d < 0 ? 150 * clamp(-d / 0.35) : 150 * clamp((d - 0.12) / 0.38));
      }
    }
    if (mode === 'hook') gate(1000, gateLit);
    if (!watching) stampTool(RX + 9, BELT_Y - 150 * 1.15 + 8, stampH, { color: GOOD });

    if (mode === 'caveat') {
      quotePanel(P.quote || 'Quote goes here', P.by || 'The company', at(P.quoteCue, D * 0.2) - 0.2, 430);
      const pp = K.popIn(t, at(P.plansCue, D * 0.5) - 0.2, 0.45);
      if (pp > 0 && P.plans && t < tWatch + 0.3) { ctx.save(); ctx.globalAlpha = 1 - clamp((t - tWatch) / 0.3); K.drawLabel(ctx, 487, 722, pp, { text: P.plans, size: 28 }); ctx.restore(); }
      const pw = K.popIn(t, tWatch, 0.45);
      if (pw > 0) {
        K.drawLabel(ctx, 487, 722, pw, { text: P.watch || 'Watch-only mode first', size: 30, accent: true });
      }
    }
  } else if (mode === 'launch') {
    // ------------------------------------------------------------ three agents behind the belt
    const cues = P.roleCues || [];
    const roles = P.roles || ['REVIEW', 'FIX', 'APPROVE'];
    const xs = [220, 487, 754];
    const tIn = xs.map((_, i) => at(cues[i], D * (0.45 + i * 0.15)) - 0.25);
    xs.forEach((x, i) => {
      const p = K.popIn(t, tIn[i], 0.5);
      if (p <= 0) return;
      ctx.save(); ctx.translate(x, 1000); ctx.scale(1, Math.min(1.04, p)); ctx.translate(-x, -1000);
      K.drawRobot(ctx, x, 1000, 1.05, { t, state: 'working', seed: 3 + i });
      ctx.restore();
    });
    belt(0, 1080, 1);
    // cards keep riding left -> right; once an agent is in, the card it is over shows its work
    for (let i = 0; i < 9; i++) {
      const x = ((t * 150 + i * 260) % 1340) - 130;
      const work = (k) => t > tIn[k] + 0.3 && x > xs[k] - 60;
      const kind = i % 4 === 2 ? 'docs' : 'code';
      card(x, BELT_Y + 2, 0.95, kind, { stamp: work(2) ? clamp((x - xs[2] + 60) / 70) : 0 });
      if (work(1) && x < xs[1] + 60 && x > xs[1] - 60) {   // a spark where the fixer touches it
        ctx.save(); ctx.globalAlpha = 0.8; H.glow(ctx, x, BELT_Y - 90, 40, ACC, 0.7); ctx.restore();
      }
    }
    // tools above the belt
    xs.forEach((x, i) => {
      const p = K.popIn(t, tIn[i] + 0.15, 0.45);
      if (p <= 0) return;
      ctx.save(); ctx.globalAlpha = clamp(p * 2);
      if (i === 0) magnifier(x + 40 + Math.sin(t * 3) * 20, BELT_Y - 100, 34, 0.9);
      if (i === 1) wrench(x + 50, BELT_Y - 70, 0.9, -0.6 + Math.sin(t * 6) * 0.35);
      if (i === 2) { const ph = (t * 1.2) % 1, h = ph < 0.6 ? 0 : (ph - 0.6) * 120; stampTool(x, BELT_Y - 118, Math.abs(Math.sin(t * 4.6)) * 30, { color: GOOD, s: 0.6 }); }
      ctx.restore();
      K.drawLabel(ctx, x, 640, p, { text: roles[i], size: 30, accent: i === 2 });
    });
    const pn = K.popIn(t, at(P.nameCue, 0.4) - 0.2, 0.5);
    if (pn > 0) K.drawLabel(ctx, 487, 500, pn, { text: P.name || 'NEW PRODUCT', size: 44, accent: true });
    const pd = K.popIn(t, at(P.dateCue, D * 0.25) - 0.2, 0.45);
    if (pd > 0 && P.date) K.drawLabel(ctx, 487, 566, pd, { text: P.date, size: 26, dot: true });
  } else if (mode === 'pile') {
    // ------------------------------------------------------------ reviewer buried under a pile
    const tHard = at(P.hardCue, D * 0.7) - 0.2, hard = t > tHard;
    wallClock(780, 470, 52, hard ? 9 : 1.2);
    // robots at laptops on the right shoot cards to the reviewer's pile on the left
    [[700, 0.9], [860, 0.85]].forEach(([x, s], i) => {
      K.drawRobot(ctx, x, 1000, s, { t, state: 'working', seed: 8 + i });
    });
    K.drawDesk(ctx, 780, 1030, 1.0);
    K.drawLaptop(ctx, 700, 920, 0.5, { t, screen: 'code', shadow: false });
    K.drawLaptop(ctx, 860, 920, 0.5, { t: t + 1, screen: 'code', shadow: false });
    // reviewer
    const PX = 270;
    K.drawPerson(ctx, PX, 1030, 1.25, { t, pose: hard ? 'shrug' : 'stand', mood: hard ? 'worried' : 'neutral', look: 0.6, shirt: '#e0a35b', skin: 2, hair: 1, hairStyle: 'bun', seed: 4 });
    K.drawDesk(ctx, PX + 90, 1040, 0.9);
    // pile on the desk grows; wobbles after hardCue
    const n = Math.min(14, Math.floor(3 + t * 1.1 + (hard ? (t - tHard) * 2.5 : 0)));
    const wob = hard ? Math.sin(t * 7) * 0.03 * clamp((t - tHard) / 0.6) : 0;
    ctx.save(); ctx.translate(PX + 130, 1040 - 100); ctx.rotate(wob);
    for (let i = 0; i < n; i++) {
      roundRect(ctx, -62 + Math.sin(i * 2.3) * 8, -i * 22 - 22, 124, 20, 5); ctx.fillStyle = i % 4 === 1 ? '#6f86e0' : PAPER; ctx.fill();
      ctx.fillStyle = i % 2 ? GOOD : DANGER; ctx.fillRect(-50 + Math.sin(i * 2.3) * 8, -i * 22 - 15, 8, 6);
    }
    ctx.restore();
    // flying cards from the laptops to the pile
    const every = hard ? 0.35 : 0.8;
    for (let i = 0; i < 40; i++) {
      const t0 = i * every - 1, age = t - t0;
      if (age < 0 || age > 1.1) continue;
      const u = H.easeInOutCubic(clamp(age / 1.1));
      const sx = i % 2 ? 860 : 700, x = lerp(sx, PX + 130, u), y = lerp(880, 1040 - 100 - n * 22, u) - Math.sin(u * Math.PI) * 160;
      card(x, y + 60, 0.45, i % 4 === 1 ? 'docs' : 'code', { rot: u * 1.5, alpha: 1 - clamp((age - 0.95) / 0.15) });
    }
    quotePanel(P.quote || 'Quote goes here', P.by || 'The company', at(P.quoteCue, D * 0.25) - 0.25, 440);
    const ph = K.popIn(t, tHard + 0.1, 0.45);
    if (ph > 0 && P.hard) K.drawLabel(ctx, PX, 700, ph, { text: P.hard, size: 28, accent: true });
  } else if (mode === 'policy') {
    // ------------------------------------------------------------ the rule file decides who signs
    const rows = P.rows || [{ text: 'Routine -> AI', kind: 'ok' }, { text: 'Sensitive -> person', kind: 'person' }];
    const rc = P.rowCues || [];
    const tDocs = at(P.docsCue, D * 0.25), tStamp = at(P.stampCue, D * 0.38), tRisk = at(P.riskCue, D * 0.55), tFix = at(P.fixerCue, D * 0.8) - 0.2;
    // rule sheet pinned on the wall (left)
    const SX = 100, SY = 430, SW = 400;
    const ps = K.popIn(t, 0.1, 0.5);
    if (ps > 0) {
      ctx.save(); ctx.globalAlpha = clamp(ps * 2);
      roundRect(ctx, SX, SY, SW, 250, 16); ctx.fillStyle = PAPER; ctx.fill();
      ctx.fillStyle = DANGER; ctx.beginPath(); ctx.arc(SX + SW / 2, SY + 10, 9, 0, Math.PI * 2); ctx.fill();
      ctx.font = H.font('ui', 26); ctx.fillStyle = '#3b4672'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.letterSpacing = '2px'; ctx.fillText(String(P.title || 'APPROVAL RULES'), SX + 28, SY + 44); ctx.letterSpacing = '0px';
      rows.slice(0, 2).forEach((r, i) => {
        const pr = K.popIn(t, at(rc[i], D * (0.2 + i * 0.3)) - 0.2, 0.4);
        if (pr <= 0) return;
        const y = SY + 110 + i * 82;
        ctx.save(); ctx.globalAlpha = clamp(pr * 2);
        roundRect(ctx, SX + 20, y - 32, SW - 40, 64, 12); ctx.fillStyle = r.kind === 'ok' ? rgba(GOOD, 0.22) : rgba(DANGER, 0.18); ctx.fill();
        const f = H.fitText(ctx, String(r.text), 'ui', 30, 20, SW - 120); ctx.font = f.font; ctx.fillStyle = INK; ctx.fillText(f.text, SX + 40, y + 2);
        // icon at the end: tick (AI) or person head
        const ix = SX + SW - 58;
        if (r.kind === 'ok') { ctx.strokeStyle = '#1f9d55'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ix - 14, y); ctx.lineTo(ix - 3, y + 11); ctx.lineTo(ix + 16, y - 12); ctx.stroke(); }
        else { ctx.fillStyle = DANGER; ctx.beginPath(); ctx.arc(ix, y - 9, 10, 0, Math.PI * 2); ctx.fill(); roundRect(ctx, ix - 16, y + 3, 32, 18, 9); ctx.fill(); }
        ctx.restore();
      });
      ctx.restore();
    }
    const RX = 590;
    K.drawPerson(ctx, 840, 1000, 1.25, { t, pose: t > tRisk + 1.3 ? 'point' : 'stand', mood: 'neutral', look: -0.7, shirt: '#e0a35b', skin: 2, hair: 1, hairStyle: 'bun', seed: 4 });
    K.drawRobot(ctx, RX - 10, 1000, 1.2, { t, state: t > tRisk && t < tRisk + 1.4 ? 'thinking' : 'working', seed: 6 });
    // fixer robot pops up at the left
    const pf = K.popIn(t, tFix, 0.5);
    if (pf > 0) {
      ctx.save(); ctx.translate(170, 1000); ctx.scale(1, Math.min(1.04, pf)); ctx.translate(-170, -1000);
      K.drawRobot(ctx, 170, 1000, 0.9, { t, state: 'working', seed: 11 });
      ctx.restore();
    }
    belt(0, 1080, 0.6);
    // docs card: rides in, stops at the robot, gets stamped, rides on
    {
      const arr = tDocs - 0.3, x = t < arr ? RX - (arr - t) * 600 : (t < tStamp + 0.6 ? RX : RX + (t - tStamp - 0.6) * 650);
      card(x, BELT_Y + 2, 1.1, 'docs', { stamp: t > tStamp - 0.15 ? clamp((t - tStamp + 0.15) / 0.5) : 0 });
    }
    // risk card: rides past the robot (no stamp) to the human, who holds it under a magnifier
    {
      const arr = tRisk - 0.2, HX = 840;
      let x = t < arr ? RX - (arr - t) * 600 : Math.min(HX - 70, RX + (t - arr) * 380);
      if (t > arr - 3) card(x, BELT_Y + 2, 1.1, 'risk');
      if (t > arr && x > RX + 40) { const pm = clamp((t - arr - 0.6) / 0.5); if (pm > 0) { ctx.save(); ctx.globalAlpha = pm; magnifier(x + 10, BELT_Y - 100, 46, 2.2); ctx.restore(); } }
      const pp = K.popIn(t, tRisk + 0.6, 0.45);
      if (pp > 0) K.drawLabel(ctx, 760, 640, pp, { text: P.person || 'A PERSON SIGNS', size: 26 });
    }
    // stamp tool over the robot (only comes down for the docs card)
    { const d = t - tStamp; const h = d > -0.35 && d < 0.5 ? (d < 0 ? 150 * clamp(-d / 0.35) : 150 * clamp((d - 0.12) / 0.38)) : 150;
      stampTool(RX + 9, BELT_Y - 150 * 1.1 + 8, h, { color: GOOD }); }
    if (pf > 0) {
      wrench(225, 870, 0.8, -0.5 + Math.sin(t * 6) * 0.3);
      const pc = K.popIn(t, tFix + 0.35, 0.45);
      if (pc > 0) K.drawLabel(ctx, 290, 760, pc, { text: P.fixer || 'FIXER: CAN\'T APPROVE', size: 26, accent: true });
    }
  } else if (mode === 'numbers') {
    // ------------------------------------------------------------ the wall board
    const a = P.a || { label: 'Metric A', from: 1, to: 2, tag: 'x2' }, b = P.b || { label: 'Metric B', from: 1, to: 0.5, tag: '-50%' };
    const months = P.months || ['BEFORE', 'AFTER'];
    const tA = at(P.aCue, D * 0.3), tB = at(P.bCue, D * 0.7);
    panel(110, 520, 760, 440, { fill: 'rgba(14,17,34,0.94)' });
    const ph = K.popIn(t, at(P.headCue, 0.2) - 0.2, 0.45);
    if (ph > 0) K.drawLabel(ctx, 487, 470, ph, { text: P.head || 'The company\'s own numbers', size: 30, accent: true });
    if (P.sub) { ctx.font = H.font('ui', 26); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.sub, 487, 562); }
    const base = 900, maxH = 170;
    [[a, 300, tA], [b, 680, tB]].forEach(([m, cx, tc], gi) => {
      const top = Math.max(m.from, m.to);
      const grow = H.easeOutCubic(clamp((t - tc + 0.3) / 1.0));
      const hFrom = maxH * m.from / top * clamp((t - 0.3) / 0.6);
      const hTo = maxH * lerp(m.from, m.to, grow) / top * clamp((t - 0.3) / 0.6);
      [[hFrom, cx - 60, months[0], '#55607f'], [hTo, cx + 60, months[1], gi === 0 ? GOOD : ACC]].forEach(([h, x, lab, col]) => {
        roundRect(ctx, x - 44, base - h, 88, Math.max(h, 1), 10); ctx.fillStyle = col; ctx.fill();
        ctx.font = H.font('ui', 24); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(lab, x, base + 12);
      });
      ctx.font = H.font('ui', 28); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(String(m.label), cx, 615);
      const pt = K.popIn(t, tc + 0.6, 0.45);
      if (pt > 0) {
        ctx.save(); ctx.translate(cx, 668); ctx.scale(Math.min(1.06, pt), Math.min(1.06, pt));
        const f = H.fitText(ctx, String(m.tag), 'display', 46, 26, 320); ctx.font = f.font; ctx.fillStyle = gi === 0 ? GOOD : ACC;
        ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 0); ctx.restore();
      }
    });
    // a divider + the robot peeking bottom right
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(486, 590, 2, 330);
  } else if (mode === 'stakes') {
    // ------------------------------------------------------------ your phone + the reviewer's new job
    const tPhone = at(P.phoneCue, D * 0.1), tQ1 = at(P.q1Cue, D * 0.45) - 0.2, tQ2 = at(P.q2Cue, D * 0.75) - 0.2;
    // phone (left)
    const X0 = 140, Y0 = 470, W = 280, Hh = 520;
    roundRect(ctx, X0, Y0, W, Hh, 40); ctx.fillStyle = '#0d1020'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#3a4675'; ctx.stroke();
    roundRect(ctx, X0 + 16, Y0 + 40, W - 32, Hh - 80, 20); ctx.fillStyle = '#1d2654'; ctx.fill();
    const cols = ['#6f86e0', '#e0a35b', '#5be38a', '#e8786a', '#b08be0', '#5bc8e3', '#f0d35b', '#8a9bc4', '#e36fb0'];
    for (let i = 0; i < 9; i++) {
      const c = i % 3, r = Math.floor(i / 3);
      const x = X0 + 40 + c * 72, y = Y0 + 80 + r * 92;
      roundRect(ctx, x, y, 56, 56, 14); ctx.fillStyle = cols[i]; ctx.fill();
      const tb = tPhone + [0, 0.7, 1.4, 0.35, 1.05, 1.75, 0.5, 1.2, 1.9][i];
      const pb = K.popIn(t, tb, 0.35);
      if (pb > 0) {
        ctx.save(); ctx.translate(x + 52, y + 4); ctx.scale(pb, pb);
        ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
        ctx.strokeStyle = INK; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 7); ctx.lineTo(0, -6); ctx.moveTo(-6, 0); ctx.lineTo(0, -7); ctx.lineTo(6, 0); ctx.stroke();
        ctx.restore();
      }
    }
    // reviewer at a desk on the right, magnifier over one red card; belt behind with auto-stamped cards zipping by
    belt(470, 1080, 2.2);
    for (let i = 0; i < 6; i++) {
      const x = 470 + ((t * 380 + i * 200) % 720) - 60;
      if (x < 470 || x > 1080) continue;
      card(x, BELT_Y + 2, 0.6, i % 3 === 1 ? 'docs' : 'code', { stamp: x > 620 ? 1 : 0 });
    }
    // cards arc from the belt into the phone
    for (let i = 0; i < 10; i++) {
      const t0 = tPhone - 0.6 + i * 0.7, age = t - t0;
      if (age < 0 || age > 1) continue;
      const u = H.easeInOutCubic(age);
      card(lerp(560, X0 + W / 2, u), lerp(BELT_Y - 10, Y0 + 260, u) - Math.sin(u * Math.PI) * 120, 0.4, 'code', { alpha: 1 - clamp((age - 0.85) / 0.15), stamp: 1 });
    }
    const focus = t > tQ1;
    K.drawPerson(ctx, 720, 1040, 1.2, { t, pose: 'stand', mood: focus ? 'neutral' : 'happy', look: -0.3, shirt: '#e0a35b', skin: 2, hair: 1, hairStyle: 'bun', seed: 4 });
    K.drawDesk(ctx, 720, 1045, 0.85);
    card(690, 1045 - 94, 0.75, 'risk');
    if (focus) { const pm = clamp((t - tQ1) / 0.5); ctx.save(); ctx.globalAlpha = pm; magnifier(690 + Math.sin(t * 2) * 12, 1045 - 94 - 60, 44, 0.7); ctx.restore(); }
    const p1 = K.popIn(t, tQ1, 0.45);
    if (p1 > 0) K.drawLabel(ctx, 680, 560, p1, { text: P.q1 || 'Question one?', size: 28, accent: true });
    const p2 = K.popIn(t, tQ2, 0.45);
    if (p2 > 0) K.drawLabel(ctx, 680, 650, p2, { text: P.q2 || 'Question two?', size: 28 });
  }
  ctx.restore();
}
