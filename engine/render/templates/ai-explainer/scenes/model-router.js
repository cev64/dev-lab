// Scene "model-router" (full frame). Night server hall: task cards slide in; the agent robot routes each card to one of
// two labelled generic "model" chips (text labels only, no logos), the chip named in the narration lighting up; then
// the chips fade and the agent's reach is shown: device/app tiles pop up around it, linked by glowing dashed lines.
// Fits: "one assistant picks between several AI models", "available on phone / desktop / email / chat", integrations.
// params (all optional): models     2 chip labels (default ["Model A", "Model B"])
//                        modelCues  narration words that light each chip (else 25% / 45% of the scene)
//                        title      pill over the chips (default "Best model per job"; '' hides)
//                        reachCue   word that switches to the "reach" half (else 62%)
//                        places     up to 4 tile labels (default ["Phone", "Desktop", "Email", "Chat"])
//                        placeCues  words that pop each tile (else staggered after reachCue)
//                        kinds      tile drawing per place: phone | laptop | mail | chat (default in that order)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, smooth, lerp, easeOutCubic, easeInOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const tw = (w, f) => { const v = w ? info.timeOf(w) : null; return v != null ? v : D * f; };
  const models = (P.models || ['Model A', 'Model B']).slice(0, 2);
  const mc = P.modelCues || [];
  const tM = [tw(mc[0], 0.25), tw(mc[1], 0.45)];
  const tReach = tw(P.reachCue, 0.62);
  const places = (P.places || ['Phone', 'Desktop', 'Email', 'Chat']).slice(0, 4);
  const pc = P.placeCues || [];
  const tP = places.map((_, i) => tw(pc[i], (tReach / D) + 0.07 * (i + 1)));
  const kinds = P.kinds || ['phone', 'laptop', 'mail', 'chat'];

  const z = lerp(1.0, 1.05, H.phase(t, 0, D));
  ctx.save(); ctx.translate(487, 725); ctx.scale(z, z); ctx.translate(-487, -740);
  K.world.serverHall(ctx, { t, activity: 0.5 + 0.4 * K.phase(t, tM[0], tReach) });
  const feet = 1040, rx = 487, rS = 1.25;
  const robotTop = feet - 225 * rS;

  // ---- model chips (first half)
  const chipA = 1 - K.phase(t, tReach - 0.2, tReach + 0.4);
  const chips = [{ x: 255, y: 560 }, { x: 720, y: 560 }];
  const lit = (i) => K.phase(t, tM[i], tM[i] + 0.3) * (i === 0 ? 1 - 0.6 * K.phase(t, tM[1], tM[1] + 0.3) : 1);
  if (chipA > 0) {
    chips.forEach((c, i) => {
      const p = K.popIn(t, 0.4 + i * 0.15, 0.45);
      if (p <= 0) return;
      const L = lit(i), pulse = 1 + 0.05 * L * Math.sin(t * 8);
      ctx.save(); ctx.globalAlpha = chipA; ctx.translate(c.x, c.y); ctx.scale(p * pulse, p * pulse);
      if (L > 0) K.glow(ctx, 0, 0, 200, ACC, 0.55 * L);
      ctx.fillStyle = H.mixHex('#8a93b8', ACC, L); // pins
      for (let k = 0; k < 4; k++) { const o = -54 + k * 36; ctx.fillRect(o - 5, -100, 10, 22); ctx.fillRect(o - 5, 78, 10, 22); ctx.fillRect(-100, o - 5, 22, 10); ctx.fillRect(78, o - 5, 22, 10); }
      H.roundRect(ctx, -82, -82, 164, 164, 24); ctx.fillStyle = '#20264a'; ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = H.mixHex('#59628c', ACC, L); ctx.stroke();
      H.roundRect(ctx, -60, -60, 120, 120, 16); ctx.fillStyle = H.mixHex('#2c3462', K.ACCENT.deep, L * 0.6); ctx.fill();
      ctx.font = H.font('bold', 30); ctx.fillStyle = L > 0.5 ? ACC : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      let fs = 30; while (fs > 18 && ctx.measureText(models[i]).width > 112) { fs -= 2; ctx.font = H.font('bold', fs); }
      ctx.fillText(models[i], 0, 2);
      ctx.restore();
    });
    // "model" label over the chips
    const lp = K.popIn(t, 0.6, 0.4) * chipA;
    if (lp > 0 && P.title !== '') K.drawLabel(ctx, 487, 470, lp, { text: P.title || 'Best model per job', size: 28, dot: true });
  }

  // ---- task cards: slide in from the left, the robot flicks each to a chip
  const nCards = Math.floor(Math.max(0, tReach - 1.2) / 0.55);
  for (let i = 0; i < nCards; i++) {
    const t0 = 0.6 + i * 0.55, a = t - t0;
    if (a < 0) break;
    const handT = t0 + 0.7;
    let target;
    if (handT < tM[0]) target = i % 2; else if (handT < tM[1]) target = 0; else target = i % 2 ? 0 : 1;
    if (handT >= tM[1] && handT < tM[1] + 1.2) target = 1;
    let x, y, s = 0.9, alpha = 1;
    if (a < 0.7) { const e = easeOutCubic(a / 0.7); x = lerp(40, rx - 120, e); y = feet - 140; }
    else {
      const u = clamp((a - 0.7) / 0.6), e = easeInOutCubic(u), c = chips[target];
      x = lerp(rx - 120, c.x, e); y = lerp(feet - 140, c.y, e) - Math.sin(u * Math.PI) * 120; s = lerp(0.9, 0.4, e);
      if (u >= 1) continue;
      alpha = 1 - smooth((u - 0.8) / 0.2);
    }
    ctx.save(); ctx.globalAlpha = alpha * chipA; ctx.translate(x, y); ctx.rotate(Math.sin(a * 3 + i) * 0.08); ctx.scale(s, s);
    H.roundRect(ctx, -60, -40, 120, 80, 12); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    H.roundRect(ctx, -46, -24, 50, 10, 5); ctx.fillStyle = ACC; ctx.fill();
    H.roundRect(ctx, -46, -4, 92, 8, 4); ctx.fillStyle = '#b9c1d6'; ctx.fill();
    H.roundRect(ctx, -46, 12, 70, 8, 4); ctx.fill();
    ctx.restore();
  }

  // ---- reach: device/app tiles around the robot
  const slots = [{ x: 175, y: 640 }, { x: 800, y: 640 }, { x: 175, y: 900 }, { x: 800, y: 900 }];
  places.forEach((name, i) => {
    const p = K.popIn(t, tP[i], 0.45);
    if (p <= 0) return;
    const sl = slots[i];
    // link line
    ctx.save(); ctx.strokeStyle = H.rgba(ACC, 0.7 * clamp(p)); ctx.lineWidth = 5; ctx.setLineDash([4, 12]); ctx.lineDashOffset = -t * 50; ctx.lineCap = 'round';
    const pts = K.bezier(rx, robotTop + 120, (rx + sl.x) / 2, robotTop + 40, (rx + sl.x) / 2, sl.y - 40, sl.x + (sl.x < rx ? 90 : -90), sl.y - 60, 24);
    K.pathDraw(ctx, pts, K.phase(t, tP[i], tP[i] + 0.5)); ctx.restore();
    ctx.save(); ctx.translate(sl.x, sl.y); ctx.scale(p, p);
    K.glow(ctx, 0, -70, 130, ACC, 0.25);
    const kind = kinds[i] || 'chat';
    if (kind === 'phone') K.drawPhone(ctx, 0, 0, 0.62, { t: t - tP[i], bubbles: 3, screen: 'chat' });
    else if (kind === 'laptop') K.drawLaptop(ctx, 0, 0, 0.62, { t: t - tP[i], screen: 'chart', typing: false });
    else {
      H.roundRect(ctx, -82, -150, 164, 130, 18); ctx.fillStyle = '#eef1f8'; ctx.fill();
      H.roundRect(ctx, -82, -150, 164, 30, 18); ctx.fillStyle = '#2a2f45'; ctx.fill(); ctx.fillRect(-82, -134, 164, 14);
      ctx.strokeStyle = '#4b5577'; ctx.fillStyle = ACC; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      if (kind === 'mail') { ctx.strokeRect(-40, -104, 80, 54); ctx.beginPath(); ctx.moveTo(-40, -104); ctx.lineTo(0, -74); ctx.lineTo(40, -104); ctx.stroke(); }
      else { H.roundRect(ctx, -50, -108, 70, 34, 12); ctx.fill(); H.roundRect(ctx, -16, -66, 70, 30, 12); ctx.fillStyle = '#b9c1d6'; ctx.fill(); }
    }
    ctx.restore();
    K.drawLabel(ctx, sl.x, sl.y + 50, p, { text: name, size: 28, accent: true });
  });

  // ---- the agent in the middle
  const state = t < tM[0] - 0.5 ? 'thinking' : t < tReach ? 'working' : 'happy';
  K.drawRobot(ctx, rx, feet, rS, { t, state, seed: 2 });
  ctx.restore();
}
