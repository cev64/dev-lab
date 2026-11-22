// Scene "robot-treaty" (full frame, 1 beat per mode). Weapons-treaty talks that stall: a night conference hall with
// generic cartoon delegates behind a long table (text nameplates "Country A-D", no flags, seals or logos), a treaty
// sheet on a stand in the middle, a gavel that keeps swinging but never lands, and cartoon quadcopter drones (kit
// colours, lime eye) hovering overhead. Calm and non-graphic: no explosions, no injuries, targets are empty crates.
// modes:
//   "hook"   cold open (action at frame 0): drones sweep overhead, the gavel bounces off before it lands, a NOT YET
//            stamp slams on the treaty and a year pill pops (`year`).
//   "night"  place pill, a drone with a target bracket + "picks its own targets" pill, wall clock races through the
//            night, delegates droop, a day pill, then a NO TALKS stamp on the treaty.
//   "vote"   wall board: member counter fills a 16x8 dot grid, rule line ("everyone agrees"); three delegates raise
//            hands, the fourth's nameplate lamp goes red, one dot turns red, BLOCKED stamp on the board, blame pill.
//   "later"  the treaty sheet retitles to DRAFT, a wall calendar tears `years` (Y1 -> Y2 -> Y3), a "legally binding?"
//            switch flips back and forth and settles on "?" + "undecided", a struck-through `wanted` pill.
//   "skies"  dusk hills: an operator at a laptop steers drone A by a dashed tether ("human steers"); drone B arrives
//            with no tether, a bracket locks on an empty crate, the operator fades, "no human deciding" warning.
//   "reads"  same hall: two text-only quote panels (left/right, attribution as text), delegates react, a half-full
//            glass on the table and a "same deal, two reads" pill.
// Fits: treaty / UN / international talks that stall, consensus blocking, AI weapons, "rules pushed back".
// params (all optional; defaults are generic placeholders): mode; year ("20XX"), stamp ("NOT YET"), place, weapons,
//   day, clockHours (10), noTalks, members (100, <= 128 fills the 16x8 grid), membersLabel, rule, blocked, blame,
//   title ("TREATY"), draft, yearLabel, years [3], binding, undecided, wanted, human, noHuman, target, quoteA, byA,
//   quoteB, byB, reads, names [4]
//   cues (narration words): stampCue, yearCue, placeCue (alias genevaCue), weaponsCue, nightCue, endCue, countCue, consensusCue,
//   blockCue, blameCue, yearsCue, bindingCue, undecidedCue, chiefCue, dronesCue, humanCue, nextCue, pickCue,
//   noOneCue, aCue, bCue, sameCue
const RED = '#ff5a52';

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent, N = K.NEUTRAL;
  const { clamp, lerp, smooth, easeOutCubic, roundRect, rgba } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const mode = P.mode || 'hook';
  const env = info.env || 0;

  // ---------- shared drawing helpers ----------
  const fitFont = (txt, kind, max, min, maxW) => {
    let fs = max; ctx.font = K.font[kind](fs);
    while (fs > min && ctx.measureText(txt).width > maxW) { fs -= 2; ctx.font = K.font[kind](fs); }
    return fs;
  };
  const pill = (text, x, y, a, o = {}) => {
    if (t < a) return;
    const out = o.out != null ? o.out : Infinity;
    if (t > out + 0.35) return;
    ctx.save(); ctx.globalAlpha = out < Infinity ? K.fadeOut(t, out, 0.35) : 1;
    K.drawLabel(ctx, x, y, K.popIn(t, a, 0.4), { text, size: o.size || 28, dot: !o.accent && o.dot !== false, accent: o.accent });
    ctx.restore();
  };
  const drone = (x, y, s, o = {}) => {
    const spin = t * 38 + (o.seed || 0);
    ctx.save(); ctx.translate(x, y + Math.sin(t * 2.4 + (o.seed || 0)) * 6); ctx.scale(s, s); ctx.rotate(o.tilt || 0);
    // shadow glow
    K.glow(ctx, 0, 10, 90, ACC, 0.10);
    // arms
    ctx.strokeStyle = N.darkL; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-70, -10); ctx.lineTo(70, -10); ctx.stroke();
    // rotors (blurred discs + a spinning blade)
    for (const sx of [-70, 70]) {
      ctx.fillStyle = N.dark; roundRect(ctx, sx - 7, -26, 14, 18, 4); ctx.fill();
      ctx.save(); ctx.translate(sx, -28); ctx.scale(1, 0.22);
      ctx.fillStyle = 'rgba(220,228,245,0.22)'; ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI * 2); ctx.fill();
      ctx.rotate(spin * (sx < 0 ? 1 : -1));
      ctx.fillStyle = 'rgba(235,240,252,0.75)'; roundRect(ctx, -46, -5, 92, 10, 5); ctx.fill();
      ctx.restore();
    }
    // body
    ctx.fillStyle = N.light; roundRect(ctx, -46, -24, 92, 44, 18); ctx.fill();
    ctx.fillStyle = N.lightS; roundRect(ctx, -46, 2, 92, 18, 9); ctx.fill();
    // visor + eye
    ctx.fillStyle = N.screen; roundRect(ctx, -26, -16, 52, 26, 10); ctx.fill();
    const blink = (Math.floor(t * 2 + (o.seed || 0)) % 7 === 0) ? 0.3 : 1;
    ctx.fillStyle = o.eye || ACC; ctx.beginPath(); ctx.ellipse(0, -3, 8, 8 * blink, 0, 0, Math.PI * 2); ctx.fill();
    // skids
    ctx.strokeStyle = N.darkL; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-30, 20); ctx.lineTo(-38, 36); ctx.moveTo(30, 20); ctx.lineTo(38, 36);
    ctx.moveTo(-48, 36); ctx.lineTo(-20, 36); ctx.moveTo(20, 36); ctx.lineTo(48, 36); ctx.stroke();
    // blinking LED
    if (Math.floor(t * 3 + (o.seed || 0)) % 2 === 0) { ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(38, -16, 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  };
  const bracket = (x, y, w, h, color, a = 1, lock = 0) => {
    const g = 1 - 0.25 * lock; // brackets close in when locking
    const hw = w / 2 * g, hh = h / 2 * g, L = 26;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      ctx.beginPath(); ctx.moveTo(x + sx * hw, y + sy * hh + -sy * L); ctx.lineTo(x + sx * hw, y + sy * hh); ctx.lineTo(x + sx * hw + -sx * L, y + sy * hh); ctx.stroke();
    }
    ctx.restore();
  };
  const sheet = (x, yb, s, o = {}) => { // treaty sheet on a small stand; anchor bottom-centre
    ctx.save(); ctx.translate(x, yb); ctx.scale(s, s); ctx.rotate(o.tilt || 0);
    ctx.fillStyle = N.darkL; roundRect(ctx, -60, -14, 120, 14, 6); ctx.fill();
    ctx.fillStyle = N.dark; ctx.fillRect(-6, -40, 12, 30);
    const w = 190, h = 230, y0 = -40 - h;
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; roundRect(ctx, -w / 2 + 6, y0 + 8, w, h, 10); ctx.fill();
    ctx.fillStyle = N.paper; roundRect(ctx, -w / 2, y0, w, h, 10); ctx.fill();
    ctx.fillStyle = N.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const title = o.title || P.title || 'TREATY';
    fitFont(title, 'display', 34, 18, w - 30); ctx.fillText(title, 0, y0 + 48);
    ctx.fillStyle = N.paperS;
    for (let i = 0; i < 6; i++) roundRect(ctx, -w / 2 + 22, y0 + 72 + i * 22, (i % 3 === 2 ? 0.6 : 1) * (w - 44), 9, 4), ctx.fill();
    // empty signature line
    ctx.strokeStyle = N.lightS; ctx.lineWidth = 3; ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(-w / 2 + 24, y0 + h - 26); ctx.lineTo(w / 2 - 24, y0 + h - 26); ctx.stroke(); ctx.setLineDash([]);
    if (o.overlay) o.overlay(w, h, y0);
    ctx.restore();
  };
  const hall = () => {
    K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 880 });
    // soft spotlight + back-wall panels (generic, no emblem)
    for (let i = 0; i < 5; i++) { ctx.fillStyle = 'rgba(255,255,255,0.025)'; roundRect(ctx, 80 + i * 190, 410, 150, 400, 12); ctx.fill(); }
    K.glow(ctx, 487, 760, 420, ACC, 0.06);
  };
  const delegates = [{ x: 140, s: 0, h: 1, hs: 'short', sk: 1 }, { x: 290, s: 3, h: 2, hs: 'long', sk: 3 }, { x: 705, s: 1, h: 0, hs: 'curly', sk: 0 }, { x: 852, s: 2, h: 3, hs: 'bun', sk: 4 }];
  const names = P.names || ['Country A', 'Country B', 'Country C', 'Country D'];
  const drawDelegates = (fn) => {
    delegates.forEach((d, i) => {
      const o = Object.assign({ t, pose: 'stand', mood: 'neutral', talk: 0, shirt: d.s, hair: d.h, hairStyle: d.hs, skin: d.sk, look: d.x < 487 ? 0.6 : -0.6, seed: 20 + i }, fn ? fn(i) : {});
      K.drawPerson(ctx, d.x, 1000, 1.3, o);
    });
  };
  const table = (lamps) => { // lamps: i -> colour or null
    const tx = 487, ty = 905;
    K.shadow(ctx, tx, 1035, 860);
    ctx.fillStyle = N.woodS; roundRect(ctx, 110, ty, 24, 1030 - ty, 6); ctx.fill(); roundRect(ctx, 840, ty, 24, 1030 - ty, 6); ctx.fill();
    ctx.fillStyle = N.woodS; roundRect(ctx, 80, ty - 6, 814, 74, 18); ctx.fill();
    ctx.fillStyle = N.wood; roundRect(ctx, 70, ty - 22, 834, 34, 16); ctx.fill();
    // nameplates (text tents, no flags)
    delegates.forEach((d, i) => {
      const px = d.x, py = ty - 22;
      ctx.fillStyle = '#1c2140'; roundRect(ctx, px - 66, py - 40, 132, 40, 8); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      fitFont(names[i], 'ui', 22, 14, 96); ctx.fillText(names[i], px + 10, py - 19);
      const lc = lamps ? lamps(i) : null;
      ctx.fillStyle = lc || N.darkL; ctx.beginPath(); ctx.arc(px - 48, py - 20, 8, 0, Math.PI * 2); ctx.fill();
      if (lc) K.glow(ctx, px - 48, py - 20, 34, lc, 0.5);
    });
  };
  const gavelSwing = (strength = 1) => { // swings down, bounces back before landing (never lands)
    const c = (t * 1.25) % 1; // one swing per 0.8 s
    const down = c < 0.55 ? easeOutCubic(c / 0.55) : 1 - smooth((c - 0.55) / 0.45);
    return 0.15 + 0.62 * down * strength;
  };
  const gavel = (hit) => { // big two-tone gavel on a dark sound block; hit 0 = raised, ~0.77 = stops just short
    const bx = 560, by = 884;
    ctx.save();
    ctx.fillStyle = '#2a1a12'; roundRect(ctx, bx - 62, by - 20, 124, 22, 8); ctx.fill();
    ctx.fillStyle = '#4a3020'; roundRect(ctx, bx - 52, by - 32, 104, 16, 6); ctx.fill();
    const ang = 1.15 * (1 - hit); // pivot at the handle end (right)
    ctx.translate(bx + 120, by - 72); ctx.rotate(ang);
    ctx.fillStyle = '#7a4a2a'; roundRect(ctx, -120, -8, 125, 16, 8); ctx.fill();
    ctx.translate(-120, 0);
    ctx.fillStyle = '#c98b52'; roundRect(ctx, -26, -50, 52, 92, 14); ctx.fill();
    ctx.fillStyle = '#9a6a46'; roundRect(ctx, 10, -50, 16, 92, 8); ctx.fill();
    ctx.fillStyle = ACC; ctx.fillRect(-26, -28, 52, 8); ctx.fillRect(-26, 14, 52, 8);
    ctx.restore();
    // "bounce" ring where it stops short of the block
    if (hit > 0.68) { ctx.save(); ctx.strokeStyle = rgba(ACC, Math.min(1, (hit - 0.68) / 0.09) * 0.7); ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(bx, by - 34, 70, 14, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
  };

  const SH = mode === 'reads' ? 0.85 : 1.1;
  ctx.save();

  if (mode === 'hook') {
    const tStamp = Math.max(0.5, at(P.stampCue, 1.6) - 0.5), tYear = Math.max(0.9, at(P.yearCue, 2.2) - 0.3);
    hall();
    drawDelegates((i) => ({ mood: t > tStamp + 0.4 ? (i % 2 ? 'shocked' : 'worried') : 'neutral', look: i < 2 ? 0.8 : -0.8 }));
    table();
    sheet(430, 890, SH, { tilt: K.shake(t, tStamp + 0.5, 0.3, 0.02) });
    gavel(gavelSwing());
    // stamp on the treaty
    if (t >= tStamp) K.drawStamp(ctx, 430, 760, 0.82, { kind: 'cross', text: P.stamp || 'NOT YET', land: (t - tStamp) / 0.55 });
    // drones sweeping overhead (on screen at frame 0)
    const sweep = (i) => lerp(-60 + i * 330, 160 + i * 330, clamp(t / Math.max(D, 3.5)));
    drone(sweep(0), 500, 1.05, { seed: 1, tilt: 0.06 });
    drone(sweep(1), 450, 0.85, { seed: 4, tilt: 0.05 });
    drone(sweep(2), 540, 1.1, { seed: 7, tilt: 0.07 });
    // year pill
    if (t >= tYear) {
      const p = K.popIn(t, tYear, 0.45);
      ctx.save(); ctx.translate(430, 560); ctx.scale(p, p);
      ctx.fillStyle = ACC; roundRect(ctx, -120, -60, 240, 76, 20); ctx.fill();
      ctx.fillStyle = K.ACCENT.deep; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = K.font.display(56);
      ctx.fillText(P.year || '20XX', 0, -20);
      ctx.restore();
    }
  }

  else if (mode === 'night') {
    const tG = at(P.placeCue || P.genevaCue, D * 0.1) - 0.2, tW = at(P.weaponsCue, D * 0.3) - 0.2, tN = at(P.nightCue, D * 0.55) - 0.6;
    const tE = at(P.endCue, D * 0.7) - 0.2, tS = at(P.stampCue, D * 0.85) - 0.3;
    hall();
    const tired = smooth((t - tN) / 1.2);
    drawDelegates((i) => ({ mood: t > tS + 0.3 ? 'worried' : tired > 0.5 && i % 2 ? 'worried' : 'neutral', talk: (Math.floor(t / 1.3) % 4 === i && t < tS) ? env * 0.7 : 0 }));
    table();
    sheet(430, 890, SH);
    gavel(t < tS ? gavelSwing(0.6) : 0.15);
    // place pill
    pill(P.place || 'Treaty talks', 487, 465, tG, { size: 28 });
    // wall clock racing through the night
    const cp = K.popIn(t, tN - 0.2, 0.4);
    if (cp > 0) {
      ctx.save(); ctx.translate(140, 620); ctx.scale(cp, cp);
      const race = clamp((t - tN) / 2.2);
      K.drawClock(ctx, 0, 0, 0.9, { t: 0, hour: 20 + race * (P.clockHours != null ? P.clockHours : 10) + Math.max(0, t - tN - 2.2) * 0.1, speed: 0, shadow: false });
      ctx.restore();
    }
    pill(P.day || 'Early hours', 210, 670, tE, { size: 24, dot: false, out: tS + 0.2 });
    // a drone with a target bracket ("picks its own targets")
    if (t >= tW - 0.6) {
      const u = easeOutCubic(clamp((t - tW + 0.6) / 1.0));
      const dx = lerp(1120, 760, u);
      drone(dx, 600, 1.05, { seed: 3, tilt: (1 - u) * -0.12 });
      pill(P.weapons || 'Picks its own targets', 700, 540, tW + 0.4, { size: 26, out: tE - 0.2 });
    }
    if (t >= tS) K.drawStamp(ctx, 430, 760, 0.82, { kind: 'cross', text: P.noTalks || 'NO TALKS', land: (t - tS) / 0.55 });
  }

  else if (mode === 'vote') {
    const tC = at(P.countCue, D * 0.15) - 0.3, tR = at(P.consensusCue, D * 0.35) - 0.2;
    const tB = at(P.blockCue, D * 0.55) - 0.25, tBl = at(P.blameCue, D * 0.75) - 0.2;
    hall();
    const handsUp = (i) => i < 3 && t > tR + 0.5 + i * 0.25;
    drawDelegates((i) => ({ pose: handsUp(i) ? 'cheer' : 'stand', mood: i === 3 ? (t > tB ? 'angry' : 'neutral') : (t > tB + 0.4 ? 'shocked' : 'happy'), look: i === 3 ? -0.9 : 0.5 }));
    table((i) => (i === 3 && t > tB ? RED : handsUp(i) ? ACC : null));
    sheet(430, 890, SH);
    gavel(t < tB ? gavelSwing(0.8) : 0.15);
    // wall board
    const bp = K.popIn(t, Math.min(tC, 0.2), 0.45);
    if (bp > 0) {
      ctx.save(); ctx.translate(487, 560); ctx.scale(bp, bp); ctx.translate(-487, -560);
      ctx.fillStyle = '#141833'; roundRect(ctx, 170, 420, 634, 250, 20); ctx.fill();
      ctx.strokeStyle = rgba(ACC, 0.7); ctx.lineWidth = 3; roundRect(ctx, 170, 420, 634, 250, 20); ctx.stroke();
      const n = Math.round(clamp((t - tC) / 1.4) * (P.members || 100));
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.font = K.font.display(44); ctx.fillText(String(n), 200, 476);
      const nw = ctx.measureText(String(P.members || 100)).width;
      ctx.font = K.font.ui(26); ctx.fillStyle = N.lightS; ctx.fillText(P.membersLabel || 'MEMBERS', 212 + nw, 474);
      if (t > tR) {
        ctx.globalAlpha = K.fadeIn(t, tR, 0.35);
        ctx.textAlign = 'right'; ctx.fillStyle = ACC; ctx.font = K.font.ui(26);
        ctx.fillText(P.rule || 'Rule: everyone agrees', 776, 474);
        ctx.globalAlpha = 1;
      }
      // 16 x 8 dot grid
      const total = P.members || 100, cols = 16;
      for (let k = 0; k < total; k++) {
        const c = k % cols, r = Math.floor(k / cols);
        const x = 214 + c * 36.5, y = 512 + r * 19;
        const on = k < n;
        const yes = t > tR + 0.4 + (k / total) * 1.2;
        let col = on ? (yes ? ACC : N.lightS) : 'rgba(255,255,255,0.10)';
        if (k === total - 3 && t > tB) col = RED;
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
        if (k === total - 3 && t > tB) K.glow(ctx, x, y, 30, RED, 0.6 * (0.6 + 0.4 * Math.sin(t * 8)));
      }
      ctx.restore();
      if (t > tB + 0.2) K.drawStamp(ctx, 487, 640, 0.8, { kind: 'cross', text: P.blocked || 'BLOCKED', land: (t - tB - 0.2) / 0.55 });
    }
    // red lamp burst at the blocker's seat
    if (t > tB) { ctx.save(); const b = clamp((t - tB) / 0.6); ctx.strokeStyle = rgba(RED, 1 - b); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(804, 863, 20 + b * 50, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
    pill(P.blame || 'Critics blame: Country A, B', 487, 690, tBl, { size: 28 });
  }

  else if (mode === 'later') {
    const tY = at(P.yearsCue, D * 0.12) - 0.3, tBi = at(P.bindingCue, D * 0.38) - 0.3;
    const tU = at(P.undecidedCue, D * 0.52) - 0.2, tCh = at(P.chiefCue, D * 0.68) - 0.2;
    hall();
    drawDelegates((i) => ({ pose: i === 1 && t > tBi && t < tU + 0.8 ? 'shrug' : 'stand', mood: 'neutral', talk: (Math.floor(t / 1.4) % 4 === i) ? env * 0.6 : 0 }));
    table();
    const retitle = t > tY + 0.3;
    sheet(430, 890, SH, { title: retitle ? (P.draft || 'DRAFT?') : (P.title || 'TREATY'), tilt: retitle ? K.shake(t, tY + 0.3, 0.3, 0.02) : 0 });
    gavel(0.15);
    // wall calendar tearing pages
    const yrs = P.years || ['Y1', 'Y2', 'Y3'];
    const cx = 200, cy = 430;
    ctx.fillStyle = N.dark; roundRect(ctx, cx - 100, cy, 200, 190, 14); ctx.fill();
    ctx.fillStyle = RED; roundRect(ctx, cx - 100, cy, 200, 44, 14); ctx.fill(); ctx.fillRect(cx - 100, cy + 24, 200, 20);
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = K.font.ui(22); ctx.fillText(P.yearLabel || 'YEAR', cx, cy + 24);
    const flips = [tY + 0.2, tY + 0.9];
    let idx = 0; flips.forEach((f) => { if (t > f) idx++; });
    ctx.fillStyle = N.paper; roundRect(ctx, cx - 88, cy + 52, 176, 126, 8); ctx.fill();
    ctx.fillStyle = idx === yrs.length - 1 ? K.ACCENT.deep : N.ink; ctx.font = K.font.display(54); ctx.fillText(yrs[idx], cx, cy + 117);
    flips.forEach((f, k) => { // the torn page falling away
      const u = clamp((t - f) / 0.7);
      if (u <= 0 || u >= 1) return;
      ctx.save(); ctx.globalAlpha = 1 - u; ctx.translate(cx + u * 60, cy + 115 + u * u * 260); ctx.rotate(u * 0.9);
      ctx.fillStyle = N.paper; roundRect(ctx, -88, -63, 176, 126, 8); ctx.fill();
      ctx.fillStyle = N.ink; ctx.font = K.font.display(54); ctx.fillText(yrs[k], 0, 2);
      ctx.restore();
    });
    // "legally binding?" switch
    const sp = K.popIn(t, tBi, 0.45);
    if (sp > 0) {
      ctx.save(); ctx.translate(765, 530); ctx.scale(sp, sp);
      ctx.fillStyle = '#141833'; roundRect(ctx, -138, -100, 276, 200, 20); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 2; roundRect(ctx, -138, -100, 276, 200, 20); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      fitFont(P.binding || 'LEGALLY BINDING?', 'bold', 28, 18, 250); ctx.fillText(P.binding || 'LEGALLY BINDING?', 0, -62);
      // switch flips on/off, then settles in the middle
      const settle = smooth((t - tU) / 0.4);
      const flick = 0.5 + 0.5 * Math.sin((t - tBi) * 7);
      const pos = lerp(flick, 0.5, settle);
      ctx.fillStyle = N.darkL; roundRect(ctx, -80, -18, 160, 64, 32); ctx.fill();
      ctx.font = K.font.ui(20);
      ctx.fillStyle = N.lightS; ctx.fillText('NO', -114, 14); ctx.fillText('YES', 114, 14);
      const kx = lerp(-52, 52, pos);
      ctx.fillStyle = settle > 0.5 ? ACC : N.paper; ctx.beginPath(); ctx.arc(kx, 14, 26, 0, Math.PI * 2); ctx.fill();
      if (settle > 0.5) { ctx.fillStyle = K.ACCENT.deep; ctx.font = K.font.display(30); ctx.fillText('?', kx, 16); }
      if (t > tU) { ctx.globalAlpha = K.fadeIn(t, tU, 0.3); ctx.fillStyle = ACC; ctx.font = K.font.ui(26); ctx.fillText(P.undecided || 'Still undecided', 0, 76); }
      ctx.restore();
    }
    // the original target (struck through)
    if (t >= tCh) {
      const p = K.popIn(t, tCh, 0.4);
      ctx.save(); ctx.translate(462, 590); ctx.scale(p, p);
      const txt = P.wanted || 'Original goal: DATE';
      fitFont(txt, 'ui', 26, 20, 270); const w = ctx.measureText(txt).width + 50;
      ctx.fillStyle = 'rgba(10,12,22,0.88)'; roundRect(ctx, -w / 2, -50, w, 52, 26); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, -23);
      const s = clamp((t - tCh - 0.9) / 0.4);
      if (s > 0) { ctx.strokeStyle = RED; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w / 2 + 16, -22); ctx.lineTo(-w / 2 + 16 + (w - 32) * s, -26); ctx.stroke(); }
      ctx.restore();
    }
  }

  else if (mode === 'skies') {
    const tD = at(P.dronesCue, D * 0.1) - 0.5, tH = at(P.humanCue, D * 0.3) - 0.2, tX = at(P.nextCue, D * 0.55) - 0.3;
    const tP = at(P.pickCue, D * 0.7) - 0.2, tNo = at(P.noOneCue, D * 0.88) - 0.4;
    // dusk sky + hills (abstract, no real place)
    const g = ctx.createLinearGradient(0, 0, 0, 1000);
    g.addColorStop(0, '#141836'); g.addColorStop(0.55, '#2b2f5e'); g.addColorStop(1, '#5a4a7a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    for (let i = 0; i < 40; i++) { const sx = H.hash(i, 1) * 1080, sy = 380 + H.hash(i, 2) * 380; ctx.fillStyle = `rgba(255,255,255,${0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2 + i))})`; ctx.fillRect(sx, sy, 3, 3); }
    ctx.fillStyle = '#f2eedc'; ctx.beginPath(); ctx.arc(860, 470, 34, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2b2f5e'; ctx.beginPath(); ctx.arc(876, 462, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#272a52'; ctx.beginPath(); ctx.moveTo(0, 860); ctx.quadraticCurveTo(260, 760, 560, 850); ctx.quadraticCurveTo(820, 780, 1080, 840); ctx.lineTo(1080, 1920); ctx.lineTo(0, 1920); ctx.fill();
    // far blocky buildings
    for (let i = 0; i < 7; i++) { const bx = 300 + i * 90, bh = 40 + H.hash(i, 5) * 70; ctx.fillStyle = '#1f2246'; ctx.fillRect(bx, 860 - bh, 60, bh + 20); ctx.fillStyle = rgba('#ffd27a', 0.5); ctx.fillRect(bx + 14, 860 - bh + 16, 8, 8); }
    ctx.fillStyle = '#1b1d3d'; ctx.fillRect(0, 900, 1080, 1020);
    ctx.fillStyle = '#16183a'; ctx.fillRect(0, 1040, 1080, 880);
    // operator at a desk (left)
    const fade = 1 - 0.65 * smooth((t - tNo) / 0.6);
    ctx.save(); ctx.globalAlpha = fade;
    K.drawPerson(ctx, 190, 1035, 1.05, { t, pose: 'sit-laptop', typing: t < tNo ? 1 : 0, mood: t > tX ? 'worried' : 'neutral', shirt: 2, hair: 1, hairStyle: 'short', skin: 2, look: 1, seed: 31 });
    K.drawDesk(ctx, 260, 1040, 0.75);
    K.drawLaptop(ctx, 260, 958, 0.6, { t, screen: 'chart' });
    ctx.restore();
    // drone A on a tether from the laptop
    const ua = easeOutCubic(clamp((t - tD) / 1.2));
    const ax = lerp(-120, 470, ua), ay = 600;
    if (ua > 0) {
      const tf = 1 - smooth((t - tNo) / 0.6);
      if (t > tD + 0.6 && tf > 0) {
        ctx.save(); ctx.globalAlpha = tf; ctx.strokeStyle = ACC; ctx.lineWidth = 4; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 40;
        ctx.beginPath(); ctx.moveTo(280, 930); ctx.quadraticCurveTo(320, 700, ax, ay + 30); ctx.stroke(); ctx.restore();
      }
      drone(ax, ay, 0.8, { seed: 2 });
    }
    pill(P.human || 'Human steers', 330, 790, tH, { size: 26, out: tNo - 0.2 });
    // drone B: no tether, locks on an empty crate
    if (t > tX) {
      const ub = easeOutCubic(clamp((t - tX) / 1.0));
      const bx = lerp(1180, 740, ub), by = lerp(430, 520, ub);
      drone(bx, by, 0.95, { seed: 6, tilt: (1 - ub) * -0.15 });
      // dangling cut tether + "?"
      ctx.save(); ctx.globalAlpha = ub; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3; ctx.setLineDash([8, 10]);
      ctx.beginPath(); ctx.moveTo(bx, by + 40); ctx.lineTo(bx - 40, by + 120); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = K.font.display(40); ctx.textAlign = 'center'; ctx.fillText('?', bx - 52, by + 160); ctx.restore();
    }
    // empty crate target
    const cx = 760, cyb = 1000;
    K.shadow(ctx, cx, cyb, 150);
    ctx.fillStyle = N.wood; roundRect(ctx, cx - 60, cyb - 90, 120, 90, 8); ctx.fill();
    ctx.strokeStyle = N.woodS; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx - 60, cyb - 90); ctx.lineTo(cx + 60, cyb); ctx.moveTo(cx + 60, cyb - 90); ctx.lineTo(cx - 60, cyb); ctx.stroke();
    if (t > tP) {
      const lock = smooth((t - tP) / 0.6);
      const col = lock > 0.9 ? RED : ACC;
      bracket(cx, cyb - 45, 190 - 40 * lock, 160 - 30 * lock, col, Math.min(1, (t - tP) / 0.3), lock);
      // scan line from drone B
      ctx.save(); ctx.globalAlpha = 0.18 + 0.1 * Math.sin(t * 10); ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(740, 560); ctx.lineTo(cx - 70, cyb - 10); ctx.lineTo(cx + 70, cyb - 10); ctx.closePath(); ctx.fill(); ctx.restore();
      pill(P.target || 'Target picked', cx, 830, tP + 0.5, { size: 24, dot: false });
    }
    if (t > tNo) {
      const p = K.popIn(t, tNo, 0.45);
      ctx.save(); ctx.translate(487, 460); ctx.scale(p, p);
      K.drawWarning(ctx, -190, 34, 0.42, { pulse: t });
      K.drawLabel(ctx, 40, 40, 1, { text: P.noHuman || 'No human deciding', size: 30, accent: true });
      ctx.restore();
    }
  }

  else { // 'reads'
    const tA = at(P.aCue, D * 0.12) - 0.4, tB = at(P.bCue, D * 0.4) - 0.3, tS = at(P.sameCue, D * 0.7) - 0.2;
    hall();
    drawDelegates((i) => ({ pose: i < 2 && t > tA + 0.3 && t < tB ? 'cheer' : i >= 2 && t > tB + 0.3 && t < tS + 0.4 ? 'shrug' : 'stand', mood: i < 2 ? (t > tA ? 'happy' : 'neutral') : (t > tB ? 'worried' : 'neutral'), look: i < 2 ? 0.8 : -0.8 }));
    table((i) => (i < 2 && t > tA ? ACC : i >= 2 && t > tB ? RED : null));
    sheet(430, 890, SH, { title: P.draft || 'DRAFT?' });
    gavel(0.15);
    const panel = (x, a, quote, by, col) => {
      if (t < a) return;
      const p = K.popIn(t, a, 0.45);
      ctx.save(); ctx.translate(x, 530); ctx.scale(p, p);
      const w = 400, h = 220;
      ctx.fillStyle = '#141833'; roundRect(ctx, -w / 2, -h / 2, w, h, 20); ctx.fill();
      ctx.strokeStyle = col; ctx.lineWidth = 3; roundRect(ctx, -w / 2, -h / 2, w, h, 20); ctx.stroke();
      ctx.fillStyle = col; ctx.font = K.font.display(70); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText('“', -w / 2 + 18, -h / 2 + 66);
      // wrap quote into <= 3 lines
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
      let fs = 34, lines;
      for (;;) {
        ctx.font = K.font.bold(fs); lines = []; let cur = '';
        for (const wd of quote.split(' ')) { const n2 = cur ? cur + ' ' + wd : wd; if (cur && ctx.measureText(n2).width > w - 60) { lines.push(cur); cur = wd; } else cur = n2; }
        lines.push(cur);
        if (lines.length <= 3 || fs <= 24) break; fs -= 2;
      }
      const shown = Math.floor(clamp((t - a - 0.2) / 0.9) * quote.length);
      let left = shown;
      lines.forEach((ln, k) => { const s = ln.slice(0, Math.max(0, left)); left -= ln.length + 1; ctx.fillText(s, 0, -h / 2 + 64 + k * (fs + 8) + (3 - lines.length) * 10); });
      ctx.fillStyle = col; ctx.font = K.font.ui(22); ctx.fillText(by, 0, h / 2 - 22);
      ctx.restore();
    };
    panel(266, tA, P.quoteA || 'Quote goes here', P.byA || 'Name, Role', ACC);
    panel(708, tB, P.quoteB || 'Second quote goes here', P.byB || 'Name, Org', RED);
    // half-full glass on the table
    if (t > tS - 0.2) {
      const p = K.popIn(t, tS - 0.2, 0.4);
      ctx.save(); ctx.translate(520, 884); ctx.scale(p, p);
      ctx.fillStyle = 'rgba(120,190,255,0.55)'; ctx.beginPath(); ctx.moveTo(-24, -40); ctx.lineTo(24, -40); ctx.lineTo(20, 0); ctx.lineTo(-20, 0); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-28, -82); ctx.lineTo(-20, 0); ctx.lineTo(20, 0); ctx.lineTo(28, -82); ctx.stroke();
      ctx.restore();
    }
    pill(P.reads || 'Same deal. Two reads.', 487, 700, tS, { size: 30, accent: true });
  }

  ctx.restore();

}
