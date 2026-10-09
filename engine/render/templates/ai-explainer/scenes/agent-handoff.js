// Scene "agent-handoff" (full frame). Office at dusk: a worker at a desk with a pile of to-dos; an event pill pops in,
// a friendly robot "agent" materialises in a light beam, task icons orbit it, the worker holds up a long step-by-step
// scroll that gets crossed out, and one GOAL card flies to the robot, which catches it and gets to work.
// Fits: "company launches an AI agent", "you give it a goal, not instructions", delegating work to an assistant.
// params (all optional): agent   label over the robot (default "AI agent")
//                        event   pill shown early (default "Launch event"; '' hides)
//                        goal    the card handed over (default "GOAL")
//                        banner  accent pill at the handoff (default "Goals, not steps"; '' hides)
//                        arrive / orbit / cue  narration words for robot arrival / icon orbit / handoff
//                                (no default words: else 35% / 55% / 80% of the scene)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, smooth, lerp, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const tw = (w, f) => { const v = w ? info.timeOf(w) : null; return v != null ? v : D * f; };
  const tEvent = 0.3;
  const tArrive = tw(P.arrive, 0.35);
  const tOrbit = tw(P.orbit, 0.55);
  const tHand = tw(P.cue, 0.8);
  const tScroll = Math.max(tOrbit + 1.2, tHand - 2.2);

  // camera: slow push towards the middle, a small nudge at the handoff
  const z = lerp(1.0, 1.07, H.phase(t, 0, D)) + 0.015 * K.phase(t, tHand, tHand + 0.4, H.easeOutBack) * (1 - K.phase(t, tHand + 0.6, tHand + 1.6));
  ctx.save(); ctx.translate(487, 725); ctx.scale(z, z); ctx.translate(-500, -760);

  K.world.office(ctx, { t, time: 'dusk' });
  const feet = 1035;

  // ---- worker behind a desk on the left, with a laptop and a wobbly pile of to-dos
  const wx = 225, deskX = 290, deskS = 1.05, deskTop = feet - 110 * deskS;
  const holding = t >= tScroll && t < tHand + 0.2;
  const handed = t >= tHand;
  let pose = 'stand', mood = 'neutral';
  if (t < tArrive) mood = 'worried';
  if (t >= tArrive + 0.4) mood = 'happy';
  if (holding) pose = 'point';
  if (handed && t > tHand + 0.9) pose = 'cheer';
  K.drawPerson(ctx, wx, feet, 1.5, { t, pose, mood, look: 0.7, skin: 2, hair: 0, shirt: 1, hairStyle: 'short', seed: 11,
    talk: t >= tScroll && t < tHand + 0.6 ? 0.5 : 0 });
  K.drawDesk(ctx, deskX, feet, deskS);
  K.drawLaptop(ctx, deskX - 50, deskTop + 2, 0.5, { t, screen: 'chart', typing: false, shadow: false });
  // pile of to-dos: sways a little until the handoff, then the pile shrinks as pages fly to the agent
  const nPile = 9;
  for (let i = 0; i < nPile; i++) {
    const leave = tHand + 0.15 + i * 0.09, age = t - leave;
    const y0 = deskTop - 4 - i * 9, x0 = deskX + 95 + Math.sin(t * 2.2 + i * 0.7) * (i * 0.6) * (handed ? 0 : 1);
    if (age > 0) {
      const u = clamp(age / 0.7); if (u >= 1) continue;
      const e = easeOutCubic(u);
      const x = lerp(x0, 760, e), y = lerp(y0, 760, e) - Math.sin(u * Math.PI) * 160;
      ctx.save(); ctx.globalAlpha = 1 - smooth((u - 0.75) / 0.25); ctx.translate(x, y); ctx.rotate(u * 1.2 - 0.3);
      K.drawDocument(ctx, 0, 0, 0.32, { shadow: false, lines: 4 }); ctx.restore();
      continue;
    }
    ctx.save(); ctx.translate(x0, y0); ctx.rotate((H.hash(i, 3) - 0.5) * 0.12);
    K.drawDocument(ctx, 0, 0, 0.36, { shadow: false, lines: 4 }); ctx.restore();
  }
  if (t < tHand + 0.4) {
    const a = 1 - smooth((t - tHand) / 0.4);
    ctx.save(); ctx.globalAlpha = a * K.popIn(t, 0.8, 0.4);
    K.drawLabel(ctx, deskX + 95, deskTop - 160, 1, { text: 'To-do', size: 26 });
    ctx.restore();
  }

  // ---- the agent: beam + sparkle burst on arrival, then stands on the right
  const rx = 760, rFeet = 1030, rS = 1.45;
  const ap = K.popIn(t, tArrive, 0.55);
  if (t >= tArrive - 0.4) {
    const beam = clamp((t - tArrive + 0.4) / 0.4) * (1 - smooth((t - tArrive - 0.5) / 0.7));
    if (beam > 0) {
      const g = ctx.createLinearGradient(rx, 380, rx, rFeet);
      g.addColorStop(0, H.rgba(ACC, 0)); g.addColorStop(0.5, H.rgba(ACC, 0.35 * beam)); g.addColorStop(1, H.rgba(ACC, 0.6 * beam));
      ctx.fillStyle = g; ctx.fillRect(rx - 110, 380, 220, rFeet - 380);
      K.glow(ctx, rx, rFeet - 10, 180, ACC, 0.6 * beam);
    }
    // sparkles flying out
    const sb = (t - tArrive) / 0.9;
    if (sb > 0 && sb < 1) {
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2 + 0.3, r = 60 + 170 * easeOutCubic(sb);
        const x = rx + Math.cos(a) * r, y = rFeet - 170 + Math.sin(a) * r * 0.9;
        ctx.save(); ctx.globalAlpha = 1 - sb; ctx.translate(x, y); ctx.rotate(a + sb * 2);
        ctx.fillStyle = i % 2 ? '#ffffff' : ACC; ctx.beginPath();
        for (let k = 0; k < 8; k++) { const rr = k % 2 ? 4 : 13; ctx.lineTo(Math.cos(k * Math.PI / 4) * rr, Math.sin(k * Math.PI / 4) * rr); }
        ctx.closePath(); ctx.fill(); ctx.restore();
      }
    }
    if (ap > 0) {
      let state = 'idle';
      if (t >= tHand + 0.5) state = 'working';
      if (t >= tHand + 1.6) state = 'happy';
      if (t < tArrive + 0.8) state = 'happy';
      ctx.save(); ctx.translate(rx, rFeet); ctx.scale(ap, ap); ctx.translate(-rx, -rFeet);
      K.drawRobot(ctx, rx, rFeet, rS, { t, state, seed: 2, talk: 0 });
      ctx.restore();
    }
  }
  // agent label
  const lp = K.popIn(t, tArrive + 0.5, 0.4);
  if (lp > 0) K.drawLabel(ctx, rx, rFeet - 225 * rS - 34, lp, { text: P.agent || 'AI agent', size: 30, dot: true });

  // ---- orbiting task icons ("universal"): doc, chart, code, mail
  const op = K.phase(t, tOrbit, tOrbit + 0.6);
  if (op > 0) {
    const fadeOrb = 1 - 0.6 * K.phase(t, tHand, tHand + 0.6);
    const cx = rx, cy = rFeet - 190, R = 175;
    for (let i = 0; i < 4; i++) {
      const a = t * 0.9 + (i / 4) * Math.PI * 2;
      const x = cx + Math.cos(a) * R * op, y = cy + Math.sin(a) * R * 0.45 * op;
      if (Math.sin(a) < 0 && false) continue;
      ctx.save(); ctx.globalAlpha = op * fadeOrb; ctx.translate(x, y);
      H.roundRect(ctx, -34, -34, 68, 68, 16); ctx.fillStyle = 'rgba(14,17,34,0.92)'; ctx.fill();
      ctx.strokeStyle = H.rgba(ACC, 0.9); ctx.lineWidth = 3; ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.fillStyle = ACC; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      if (i === 0) { ctx.rect(-14, -18, 28, 36); ctx.moveTo(-7, -6); ctx.lineTo(7, -6); ctx.moveTo(-7, 4); ctx.lineTo(7, 4); }
      else if (i === 1) { ctx.moveTo(-16, 14); ctx.lineTo(-5, 0); ctx.lineTo(4, 7); ctx.lineTo(16, -14); }
      else if (i === 2) { ctx.moveTo(-6, -12); ctx.lineTo(-16, 0); ctx.lineTo(-6, 12); ctx.moveTo(6, -12); ctx.lineTo(16, 0); ctx.lineTo(6, 12); }
      else { ctx.rect(-17, -12, 34, 24); ctx.moveTo(-17, -12); ctx.lineTo(0, 3); ctx.lineTo(17, -12); }
      ctx.stroke(); ctx.restore();
    }
  }

  // ---- the long instruction scroll held up by the worker, then crossed out
  if (t >= tScroll) {
    const unroll = easeOutCubic(clamp((t - tScroll) / 0.8));
    const fade = 1 - smooth((t - tHand - 0.9) / 0.5);
    if (fade > 0) {
      const sx = 395, sy = 560, sw = 150, sh = 40 + 330 * unroll;
      ctx.save(); ctx.globalAlpha = fade;
      ctx.translate(sx, sy); ctx.rotate(0.05);
      H.roundRect(ctx, -sw / 2, 0, sw, sh, 8); ctx.fillStyle = K.NEUTRAL.paper; ctx.fill();
      H.roundRect(ctx, -sw / 2 - 6, -10, sw + 12, 22, 11); ctx.fillStyle = K.NEUTRAL.paperS; ctx.fill();
      ctx.font = H.font('ui', 15); ctx.fillStyle = '#5b6380'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const rows = Math.floor((sh - 24) / 26);
      for (let r = 0; r < rows; r++) {
        ctx.fillText(`${r + 1}.`, -sw / 2 + 12, 26 + r * 26);
        H.roundRect(ctx, -sw / 2 + 40, 22 + r * 26, (60 + 40 * H.hash(r, 9)), 7, 3.5); ctx.fillStyle = '#b6bdd2'; ctx.fill(); ctx.fillStyle = '#5b6380';
      }
      // red cross at the handoff
      const xc = clamp((t - tHand) / 0.35);
      if (xc > 0) {
        ctx.strokeStyle = K.NEUTRAL.danger; ctx.lineWidth = 12; ctx.lineCap = 'round';
        const a1 = clamp(xc * 2), a2 = clamp(xc * 2 - 1);
        ctx.beginPath(); ctx.moveTo(-sw / 2 + 6, 20); ctx.lineTo(-sw / 2 + 6 + (sw - 12) * a1, 20 + (sh - 40) * a1); ctx.stroke();
        if (a2 > 0) { ctx.beginPath(); ctx.moveTo(sw / 2 - 6, 20); ctx.lineTo(sw / 2 - 6 - (sw - 12) * a2, 20 + (sh - 40) * a2); ctx.stroke(); }
      }
      ctx.restore();
    }
  }

  // ---- GOAL card flies from the worker to the agent and stays with it
  if (t >= tHand) {
    const u = clamp((t - tHand) / 0.8), e = H.easeInOutCubic(u);
    const x0 = 330, y0 = 560, x1 = rx - 200, y1 = rFeet - 30;
    const x = lerp(x0, x1, e), y = lerp(y0, y1, e) - Math.sin(u * Math.PI) * 140;
    const sc = 0.9 + 0.25 * Math.sin(u * Math.PI) + 0.1 * K.phase(t, tHand + 0.8, tHand + 1.1, H.easeOutBack);
    K.glow(ctx, x, y - 26, 150, ACC, 0.45);
    ctx.save(); ctx.translate(x, y); ctx.rotate((1 - u) * -0.25);
    K.drawLabel(ctx, 0, 0, sc, { text: P.goal || 'GOAL', size: 32, accent: true });
    ctx.restore();
  }
  ctx.restore();

  // ---- pills in screen space (outside the camera so they stay in the stage band)
  if (P.event !== '' && t < tHand - 0.3) {
    const ep = K.popIn(t, Math.max(tEvent, 3.2), 0.45) * (1 - smooth((t - tHand + 0.9) / 0.6));
    if (ep > 0) K.drawLabel(ctx, 487, 520, ep, { text: P.event || 'Launch event', size: 30, dot: true });
  }
  if (P.banner !== '' && t >= tHand) {
    const bp = K.popIn(t, tHand + 0.15, 0.45);
    K.drawLabel(ctx, 487, 470, bp, { text: P.banner || 'Goals, not steps', size: 34, accent: true });
  }
}
