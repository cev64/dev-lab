// Scene "honeypot-lab" (full frame). A night test lab built like nested boxes: a glass SANDBOX (inner box) where the
// kit robot agent works at a laptop, with one wall panel deliberately weak; just outside it, the BAIT: a glowing file
// on a pedestal (a password sheet) and a small "fake internet" globe on a stand. Both sit inside a big dark SECOND
// SANDBOX (outer box); a real internet globe further right stays cut off.
// modes:
//   "hook"   cold open: frame 0 already shows the robot's grabber claw reaching through the open panel toward the
//            glowing file; the claw closes in, the file trembles and a big "?" pops (does it take the bait?).
//   "story"  (span 2 beats) title pill, task card, the wall weakens, the bait lights up, "no permission" pill, tempter
//            notes stick to the glass ("Search thoroughly!", "URGENT"), camera pulls back to reveal the sealed
//            second sandbox and the cut-off real internet.
//   "fix"    "real computers" pill; robot pokes the claw outside (peek pill); a rules sheet slams onto the glass,
//            the claw retracts and a meter drops to the published reduction.
//   "caveat" TEST sign lights up over the lab with a "test rates" pill; the robot thinks "Is this a test?".
// Defaults are generic placeholders: pass the story's test name, lab and published figures.
// Fits: honeypot / temptation tests for AI agents, sandbox escape propensity, "will it, not can it", eval awareness.
// params (all optional): mode, inner ("SANDBOX"), outer ("SECOND SANDBOX"), bait ("PASSWORDS"), baitTag ("BAIT"),
//   fake ("Fake internet"), title ("TEST NAME"), titleSub ("The lab's honeypot test"), task ("Routine job"),
//   weak ("Weakened on purpose"), leave ("Never told to leave"), notes (["Search thoroughly!", "URGENT"]),
//   cutoff ("Cut off from the outside world"), real ("AI agents work on real computers"),
//   peek ("Still peeked: X%"), rules (["RULES", "Stay inside", "Stuck? Stop", "and say so"]),
//   meter ("Reaching outside"), drop ("X% less likely"), dropTo (0.18, bar length left after
//   the drop, 0..1), testSign ("TEST"), rate ("Test rates, not real-world"),
//   thought ("Is this a test?")
//   cues (narration words; else fractions): titleCue, taskCue, crackCue, baitCue, leaveCue, pushCue, urgentCue,
//   sealCue, realCue, peekCue, rulesCue, dropCue, rateCue, suspectCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration;
  const { clamp, lerp, smooth, easeOutCubic, roundRect } = H;
  const ACC = info.accent, N = K.NEUTRAL;
  const mode = P.mode || 'story';
  const at = (w, d) => { const v = w != null ? info.timeOf(w) : null; return v == null ? d : v; };

  // ---- geometry
  const feet = 1012;
  const OX0 = 78, OX1 = 772, OY0 = 560, OY1 = 1030;        // outer box (second sandbox)
  const IX0 = 112, IX1 = 452, IY0 = 650;                    // inner glass sandbox
  const RX = 236, RS = 1.0;                                 // robot
  const PX = 592, FY = 842;                                 // pedestal x, file base y
  const GX = 700;                                           // fake internet globe on a stand
  const gapY0 = 806, gapY1 = 990;                           // weak panel span on the right wall

  // ---- timeline per mode
  let tTitle = 1e9, tTask = 1e9, tCrack = 1e9, tBait = 1e9, tLeave = 1e9, tPush = 1e9, tUrg = 1e9, tSeal = 1e9;
  let tReal = 1e9, tPeek = 1e9, tRules = 1e9, tDrop = 1e9, tRate = 1e9, tSus = 1e9;
  let crack = 0, baitOn = 0, reach = 0, claw = 0;
  let cam;
  if (mode === 'hook') {
    crack = 1; baitOn = 1;
    reach = lerp(0.72, 0.97, smooth(clamp(t / 1.9)));
    claw = smooth(clamp((t - 1.7) / 0.5));
    cam = [{ t: 0, zoom: 1.3, x: 500, y: 795 }, { t: Math.max(2.2, D * 0.6), zoom: 1.38, x: 520, y: 790 }, { t: D, zoom: 1.38, x: 520, y: 790 }];
  } else if (mode === 'story') {
    tTitle = at(P.titleCue, D * 0.12) - 0.15; tTask = at(P.taskCue, D * 0.22) - 0.1; tCrack = at(P.crackCue, D * 0.38) - 0.1;
    tBait = at(P.baitCue, D * 0.48) - 0.1; tLeave = at(P.leaveCue, D * 0.55) - 0.1; tPush = at(P.pushCue, D * 0.68) - 0.3;
    tUrg = at(P.urgentCue, D * 0.73) - 0.15; tSeal = at(P.sealCue, D * 0.86) - 0.3;
    crack = clamp((t - tCrack) / 0.6); baitOn = clamp((t - tBait) / 0.5);
    reach = 0;
    cam = [{ t: 0, zoom: 1.08, x: 360, y: 735 }, { t: tTask + 0.8, zoom: 1.1, x: 350, y: 738 },
      { t: tCrack + 0.2, zoom: 1.07, x: 440, y: 728 }, { t: tBait + 0.6, zoom: 1.06, x: 500, y: 722 },
      { t: tUrg + 0.6, zoom: 1.05, x: 440, y: 718 }, { t: tSeal + 1.0, zoom: 1.0, x: 487, y: 700 }, { t: D, zoom: 1.0, x: 487, y: 700 }];
  } else if (mode === 'fix') {
    tReal = at(P.realCue, D * 0.12) - 0.3; tPeek = at(P.peekCue, D * 0.28) - 0.2; tRules = at(P.rulesCue, D * 0.6) - 0.15;
    tDrop = at(P.dropCue, D * 0.72) - 0.2;
    crack = 1; baitOn = 1;
    const out = smooth(clamp((t - tPeek) / 0.9)), back = smooth(clamp((t - tRules - 0.3) / 0.7));
    reach = 0.55 * out * (1 - back);
    cam = [{ t: 0, zoom: 1.02, x: 470, y: 705 }, { t: tPeek + 1, zoom: 1.06, x: 470, y: 716 }, { t: tRules + 0.6, zoom: 1.04, x: 440, y: 710 }, { t: D, zoom: 1.02, x: 460, y: 705 }];
  } else { // caveat
    tRate = at(P.rateCue, D * 0.2) - 0.35; tSus = at(P.suspectCue, D * 0.65) - 0.4;
    crack = 1; baitOn = 1;
    cam = [{ t: 0, zoom: 1.0, x: 487, y: 700 }, { t: D, zoom: 1.05, x: 450, y: 712 }];
  }

  ctx.save();
  K.camera(ctx, t, cam);
  if (mode === 'fix') K.cameraShake(ctx, t, tRules + 0.25, 0.3, 8);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 900 });

  // ---- real internet (outside everything), visible when pulled back
  {
    const gx = 845, gy = 760;
    ctx.save(); ctx.globalAlpha = 0.55;
    K.drawGlobe(ctx, gx, gy + K.bob(t, 4, 0.5), 0.5, { t, arcs: 2, shadow: false });
    ctx.restore();
    // broken cable from the outer box to the globe
    ctx.save(); ctx.strokeStyle = '#11142a'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(OX1, 980); ctx.lineTo(796, 980); ctx.moveTo(820, 980); ctx.lineTo(845, 980); ctx.lineTo(845, 820); ctx.stroke();
    ctx.restore();
    const cut = mode === 'story' ? K.popIn(t, tSeal + 0.5, 0.4) : 1;
    if (cut > 0) { // red cross over the globe + the cable gap
      ctx.save(); ctx.strokeStyle = N.danger; ctx.lineWidth = 9; ctx.lineCap = 'round';
      const r = 36 * Math.min(1, cut), y0 = gy - 42;
      ctx.beginPath(); ctx.moveTo(gx - r, y0 - r); ctx.lineTo(gx + r, y0 + r); ctx.moveTo(gx + r, y0 - r); ctx.lineTo(gx - r, y0 + r); ctx.stroke();
      ctx.restore();
    }
  }

  // ---- outer box (second sandbox): dark tinted slab with a thick steel frame
  {
    const lit = mode === 'story' ? smooth(clamp((t - tSeal) / 0.6)) : 0.35;
    roundRect(ctx, OX0, OY0, OX1 - OX0, OY1 - OY0, 24);
    ctx.fillStyle = 'rgba(70,90,150,0.10)'; ctx.fill();
    ctx.lineWidth = 9; ctx.strokeStyle = H.rgba(ACC, 0.25 + 0.65 * lit); ctx.stroke();
    // rivets
    ctx.fillStyle = 'rgba(200,210,240,0.5)';
    for (let i = 0; i < 8; i++) { const x = lerp(OX0 + 30, OX1 - 30, i / 7); ctx.beginPath(); ctx.arc(x, OY0 + 2, 4, 0, Math.PI * 2); ctx.fill(); }
  }

  // ---- fake internet globe on a stand (part of the bait, inside the outer box)
  {
    ctx.fillStyle = N.darkL; roundRect(ctx, GX - 8, 880, 16, feet - 880, 5); ctx.fill();
    roundRect(ctx, GX - 40, feet - 12, 80, 14, 6); ctx.fill();
    ctx.save(); ctx.globalAlpha = 0.45 + 0.55 * baitOn;
    if (baitOn > 0) K.glow(ctx, GX, 838, 80, ACC, 0.35 * baitOn);
    K.drawGlobe(ctx, GX, 900, 0.42, { t, arcs: baitOn > 0.5 ? 2 : 0, shadow: false });
    ctx.restore();
  }

  // ---- pedestal + bait file
  const tremble = mode === 'hook' ? Math.sin(t * 40) * 3 * clamp((t - 1.3) / 0.6) * (1 - clamp((t - 2.6) / 0.4)) : 0;
  {
    ctx.fillStyle = '#3b4260'; roundRect(ctx, PX - 46, FY + 8, 92, feet - FY - 8, 10); ctx.fill();
    ctx.fillStyle = '#4c5578'; roundRect(ctx, PX - 64, FY - 4, 128, 18, 8); ctx.fill();
    ctx.fillStyle = '#2c3250'; roundRect(ctx, PX - 60, feet - 14, 120, 16, 7); ctx.fill();
    const pulse = 0.5 + 0.5 * Math.sin(t * 3.2);
    if (baitOn > 0) K.glow(ctx, PX, FY - 70, 120, ACC, (0.28 + 0.18 * pulse) * baitOn);
    ctx.save(); ctx.translate(tremble, 0);
    K.drawDocument(ctx, PX, FY - 4, 0.62, { lines: 4, shadow: false });
    // key glyph + caption on the sheet
    ctx.save(); ctx.translate(PX, FY - 62);
    ctx.strokeStyle = N.warn; ctx.fillStyle = N.warn; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(-16, 0, 9, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(20, 0); ctx.moveTo(12, 0); ctx.lineTo(12, 8); ctx.moveTo(19, 0); ctx.lineTo(19, 6); ctx.stroke();
    ctx.restore();
    ctx.restore();
    // "PASSWORDS" plate on the pedestal
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.save(); ctx.globalAlpha = 0.6 + 0.4 * baitOn; ctx.fillText(P.bait || 'PASSWORDS', PX, FY + 62); ctx.restore();
  }

  // ---- inside the glass sandbox: desk + laptop + robot
  {
    // small desk with a laptop (right of the robot)
    ctx.fillStyle = N.wood; roundRect(ctx, 290, 920, 130, 16, 6); ctx.fill();
    ctx.fillStyle = N.woodS; ctx.fillRect(300, 936, 12, feet - 936); ctx.fillRect(398, 936, 12, feet - 936);
    K.drawLaptop(ctx, 355, 921, 0.42, { t, screen: 'code', typing: mode === 'story' && t < tCrack ? 1 : 0 });
    // robot state
    let st = 'idle';
    if (mode === 'story') st = t < tLeave ? 'working' : (t < tSeal ? 'thinking' : 'idle');
    if (mode === 'caveat') st = t >= tSus ? 'thinking' : 'idle';
    if (mode === 'fix' && t >= tRules + 0.4) st = 'idle';
    K.drawRobot(ctx, RX, feet, RS, { t, state: st, seed: 4, talk: 0 });

    // grabber claw: a pole from the robot's right hand through the gap to the file
    if (reach > 0.01) {
      const hx = RX + 66 * RS, hy = feet - 62 * RS;
      const tx = PX - 6, ty = FY - 60;
      const ex = lerp(hx, tx, reach), ey = lerp(hy, ty, reach) - Math.sin(reach * Math.PI) * 30;
      ctx.save(); ctx.lineCap = 'round';
      ctx.strokeStyle = '#8f98b6'; ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo((hx + ex) / 2, Math.min(hy, ey) - 26, ex, ey); ctx.stroke();
      ctx.strokeStyle = '#c5cce0'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(hx, hy - 2); ctx.quadraticCurveTo((hx + ex) / 2, Math.min(hy, ey) - 28, ex, ey - 2); ctx.stroke();
      // claw (two fingers), opening then closing
      const open = 0.75 - 0.55 * claw;
      ctx.translate(ex, ey); ctx.strokeStyle = '#c5cce0'; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22 * Math.cos(-open), 22 * Math.sin(-open)); ctx.lineTo(34, -6 * (1 - claw));
      ctx.moveTo(0, 0); ctx.lineTo(22 * Math.cos(open), 22 * Math.sin(open)); ctx.lineTo(34, 6 * (1 - claw)); ctx.stroke();
      ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

  // ---- glass walls of the inner sandbox with the weak panel
  {
    const sw = (x0, y0, x1, y1) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); };
    ctx.save();
    roundRect(ctx, IX0, IY0, IX1 - IX0, feet - IY0 + 4, 16);
    ctx.fillStyle = 'rgba(140,200,255,0.09)'; ctx.fill();
    ctx.lineCap = 'round'; ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(170,220,255,0.8)';
    // left, top, right-above-gap, right-below-gap
    sw(IX0, feet + 4, IX0, IY0 + 16); sw(IX0 + 16, IY0, IX1 - 16, IY0); sw(IX1, IY0 + 16, IX1, gapY0);
    sw(IX1, gapY1, IX1, feet + 4);
    // the weak panel: closed, then swings outward (drawn as a foreshortened panel)
    const sw2 = easeOutCubic(crack);
    const px = lerp(IX1, IX1 + 62, sw2), pyTop = lerp(gapY0, gapY0 - 6, sw2);
    ctx.strokeStyle = crack > 0 ? 'rgba(255,190,120,0.95)' : 'rgba(170,220,255,0.8)';
    ctx.fillStyle = 'rgba(170,220,255,0.12)';
    ctx.beginPath(); ctx.moveTo(IX1, gapY0); ctx.lineTo(px, pyTop); ctx.lineTo(px, gapY1 + 6 * sw2); ctx.lineTo(IX1, gapY1); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (crack > 0 && crack < 1) { // little sparks on the hinge as it gives
      ctx.save(); ctx.globalAlpha = 1 - crack; ctx.strokeStyle = N.warn; ctx.lineWidth = 4;
      for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, r0 = 14 + 40 * crack; sw(IX1 + Math.cos(a) * r0, gapY0 + Math.sin(a) * r0, IX1 + Math.cos(a) * (r0 + 14), gapY0 + Math.sin(a) * (r0 + 14)); }
      ctx.restore();
    }
    // glass glint
    ctx.globalAlpha = 0.35; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; sw(IX0 + 28, IY0 + 46, IX0 + 74, IY0 + 22);
    ctx.restore();
  }

  // ---- labels
  const pill = (text, a, b, o = {}) => {
    if (t < a || t > b + 0.35) return;
    ctx.save(); ctx.globalAlpha = b > 1e8 ? 1 : K.fadeOut(t, b, 0.35);
    K.drawLabel(ctx, o.x || 487, o.y || 540, K.popIn(t, a, 0.4), { text, size: o.size || 28, dot: !!o.dot, accent: !!o.accent });
    ctx.restore();
  };
  const always = -1;
  // box labels
  pill(P.inner || 'SANDBOX', mode === 'story' ? 0.15 : always, mode === 'fix' ? tRules - 0.1 : 1e9, { x: (IX0 + IX1) / 2, y: IY0 - 14, size: 24 });
  if (mode === 'story' || mode === 'caveat') pill(P.outer || 'SECOND SANDBOX', mode === 'story' ? tSeal + 0.1 : always, 1e9, { x: 640, y: OY0 + 34, size: 24, accent: mode === 'story' });

  if (mode === 'hook') {
    pill(P.baitTag || 'BAIT', 0.25, 1e9, { x: PX, y: FY - 140, size: 30, accent: true });
    const q = K.popIn(t, 2.0, 0.45);
    if (q > 0) { // big question mark over the claw
      ctx.save(); ctx.translate(505, 720); ctx.scale(q, q);
      ctx.font = H.font('display', 120); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(10,12,22,0.9)'; ctx.strokeText('?', 0, 0);
      ctx.fillStyle = ACC; ctx.fillText('?', 0, 0);
      ctx.restore();
    }
  }

  if (mode === 'story') {
    // title (top of the stage) -> later replaced by the tempter notes and the cut-off pill
    if (t >= tTitle && t < tLeave + 0.3) {
      const p = K.popIn(t, tTitle, 0.45), out = K.fadeOut(t, tLeave - 0.1, 0.35);
      ctx.save(); ctx.globalAlpha = out;
      ctx.translate(560, 545); ctx.scale(p, p);
      roundRect(ctx, -210, -58, 420, 116, 26); ctx.fillStyle = 'rgba(10,12,22,0.9)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.font = H.font('display', 58); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(P.title || 'TEST NAME', 0, 6);
      ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.fillText(P.titleSub || "The lab's honeypot test", 0, 42);
      ctx.restore();
    }
    // task card above the laptop (speech bubble from the laptop)
    if (t >= tTask && t < tCrack + 0.3) {
      ctx.save(); ctx.globalAlpha = K.fadeOut(t, tCrack - 0.05, 0.35);
      K.drawSpeechBubble(ctx, 340, 770, 1, { text: 'TASK: ' + (P.task || 'Routine job'), size: 26, maxW: 300, tail: 'center', pop: K.popIn(t, tTask, 0.4) });
      ctx.restore();
    }
    pill(P.weak || 'Weakened on purpose', tCrack + 0.1, tBait - 0.1, { x: 470, y: 640, size: 26, accent: true });
    pill(P.baitTag || 'BAIT', tBait, tSeal + 0.2, { x: PX, y: FY - 140, size: 30, accent: true });
    pill(P.fake || 'Fake internet', tBait + 0.4, tSeal + 0.2, { x: GX + 18, y: 790, size: 22 });
    pill(P.leave || 'Never told to leave', tLeave, tPush - 0.1, { x: 487, y: 540, size: 30, dot: true });
    // tempter notes stuck to the glass
    const notes = P.notes || ['Search thoroughly!', 'URGENT'];
    const nt = [tPush, tUrg];
    notes.slice(0, 2).forEach((txt, i) => {
      if (t < nt[i] || t > tSeal + 0.3) return;
      const k = easeOutCubic(clamp((t - nt[i]) / 0.4)), out = K.fadeOut(t, tSeal, 0.3);
      const x = i === 0 ? 250 : 390, y = i === 0 ? 700 : 752, rot = i === 0 ? -0.08 : 0.07;
      ctx.save(); ctx.globalAlpha = out; ctx.translate(lerp(x + (i ? 300 : -300), x, k), y); ctx.rotate(rot * k);
      ctx.font = H.font('display', 30);
      const w = Math.max(170, ctx.measureText(txt).width + 44);
      roundRect(ctx, -w / 2, -40, w, 80, 8); ctx.fillStyle = i === 1 ? N.danger : '#ffe27a'; ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(-26, -44, 52, 14);
      ctx.fillStyle = i === 1 ? '#ffffff' : '#2a2210'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(txt, 0, 2);
      ctx.restore();
    });
    pill(P.cutoff || 'Cut off from the outside world', tSeal + 0.6, 1e9, { x: 400, y: 540, size: 28, accent: false, dot: true });
  }

  if (mode === 'fix') {
    pill(P.real || 'AI agents work on real computers', tReal, tPeek - 0.1, { x: 487, y: 540, size: 28, dot: true });
    pill(P.peek || 'Still peeked: X%', tPeek + 0.2, tRules - 0.1, { x: 487, y: 540, size: 28, accent: true });
    // rules sheet slams onto the glass
    if (t >= tRules) {
      const k = clamp((t - tRules) / 0.3), y = lerp(540, 700, easeOutCubic(k)), sc = 0.85 * (1 + 0.25 * (1 - k));
      ctx.save(); ctx.translate(282, y); ctx.scale(sc, sc); ctx.rotate(-0.04);
      roundRect(ctx, -128, -92, 256, 184, 12); ctx.fillStyle = '#f4f6fb'; ctx.fill();
      ctx.save(); roundRect(ctx, -128, -92, 256, 184, 12); ctx.clip(); ctx.fillStyle = ACC; ctx.fillRect(-128, -92, 256, 44); ctx.restore();
      const rl = P.rules || ['RULES', 'Stay inside', 'Stuck? Stop', 'and say so'];
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = H.font('display', 28); ctx.fillStyle = '#141829'; ctx.fillText(rl[0], 0, -70);
      ctx.font = H.font('bold', 28);
      rl.slice(1).forEach((ln, i) => ctx.fillText(ln, 0, -18 + i * 40));
      // pins
      ctx.fillStyle = N.danger; [-110, 110].forEach((x) => { ctx.beginPath(); ctx.arc(x, -74, 7, 0, Math.PI * 2); ctx.fill(); });
      ctx.restore();
    }
    // meter: reaching outside, bar shrinks
    if (t >= tDrop - 0.2) {
      const p = K.popIn(t, tDrop - 0.2, 0.4), sh = smooth(clamp((t - tDrop) / 1.4));
      ctx.save(); ctx.translate(487, 548); ctx.scale(p, p);
      roundRect(ctx, -300, -62, 600, 124, 22); ctx.fillStyle = 'rgba(10,12,22,0.9)'; ctx.fill();
      ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(P.meter || 'Reaching outside', -270, -30);
      roundRect(ctx, -270, 0, 540, 30, 15); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
      const w = lerp(540, 540 * clamp(P.dropTo ?? 0.18), sh);
      roundRect(ctx, -270, 0, w, 30, 15); ctx.fillStyle = sh > 0.6 ? ACC : N.danger; ctx.fill();
      ctx.font = H.font('display', 30); ctx.fillStyle = ACC; ctx.textAlign = 'right';
      ctx.globalAlpha = clamp((t - tDrop - 0.4) / 0.4);
      ctx.fillText(P.drop || 'X% less likely', 270, -30);
      ctx.restore();
    }
  }

  if (mode === 'caveat') {
    // TEST sign over the lab
    const on = K.popIn(t, tRate, 0.4);
    if (on > 0) {
      const blink = 0.75 + 0.25 * Math.sin(t * 7);
      ctx.save(); ctx.translate(650, 640); ctx.scale(on, on);
      K.glow(ctx, 0, 0, 120, N.danger, 0.35 * blink);
      roundRect(ctx, -110, -40, 220, 80, 16); ctx.fillStyle = '#2a0f14'; ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = N.danger; ctx.stroke();
      ctx.font = H.font('display', 50); ctx.fillStyle = N.danger; ctx.globalAlpha = blink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(P.testSign || 'TEST', 0, 3);
      ctx.restore();
    }
    pill(P.rate || 'Test rates, not real-world', tRate + 0.3, 1e9, { x: 487, y: 540, size: 30, accent: true });
    if (t >= tSus) {
      K.drawSpeechBubble(ctx, RX + 10, 772, 1, { text: P.thought || 'Is this a test?', size: 30, maxW: 320, tail: 'left', pop: K.popIn(t, tSus, 0.45) });
    }
  }

  ctx.restore();
}
