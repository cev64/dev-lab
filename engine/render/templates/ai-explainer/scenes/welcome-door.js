// Scene "welcome-door" (full frame, best as a 2-beat span). Dusk shopping street: a person on the left sends an AI agent
// robot (shopping bag, "AI agent" pill) to a big store front (text name pill, no logo) whose doors slide OPEN on openCue
// with a glowing welcome mat. A date pill pops; on gateCue a glowing gateway arch with a name plate rises around the
// door; the robot walks up, a scan beam ticks it, it zips inside (speed lines). An optional second store-name pill
// ("also") pops under the first. Then up to 3 named assistant robots walk in from the left and queue at the arch, each
// pill popping on its cue; one chip ("For AI agents") floats over the arch.
// Fits: "a store / site opens its door to AI agents", "X now lets bots shop", the reverse of agent-door.
// params: store ("Store"), sign ("SHOP"), also ("" hides; e.g. a sister store), agent ("AI agent"), date ("" hides),
//         gate ("Agent Gateway"), chip ("For AI agents"; '' hides), mat ("WELCOME"), queue (["Agent A","Agent B","Agent C"]),
//         cues (narration words, "word#n" = (n+1)th time; without them fractions of the scene):
//         openCue, dateCue, gateCue, zipCue, chipCue, alsoCue, queueCue, queueCues [3]
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba, mixHex } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tOpen = at(P.openCue, 0.8) - 0.1;
  const tDate = at(P.dateCue, D * 0.16) - 0.1;
  const tGate = at(P.gateCue, D * 0.32) - 0.25;
  const tZip = at(P.zipCue, tGate + 1.2) - 0.1;
  const tChip = at(P.chipCue, tZip + 1.4) - 0.2;
  const tAlso = at(P.alsoCue, D * 0.6) - 0.15;
  const tQueue = at(P.queueCue, D * 0.68) - 0.3;
  const queue = (P.queue || ['Agent A', 'Agent B', 'Agent C']).slice(0, 3);
  const qCues = P.queueCues || [];
  const tQ = queue.map((_, i) => at(qCues[i], tQueue + 1.2 + i * 1.1) - 0.15);

  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tGate, zoom: 1.04, x: 530, y: 770 }, { t: tQueue, zoom: 1.02, x: 520, y: 760 }, { t: D, zoom: 1.0 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });
  const feet = 1030;

  // ---- store front (right) ----
  const sx0 = 420, sx1 = 1000, sTop = 540, doorX = 700, doorW = 210, doorTop = 770;
  roundRect(ctx, sx0, sTop, sx1 - sx0, 1000 - sTop, 12); ctx.fillStyle = '#2f4f7a'; ctx.fill();
  ctx.fillStyle = '#24405f'; ctx.fillRect(sx0, sTop + 120, sx1 - sx0, 12);
  for (const [wx, ww] of [[sx0 + 22, doorX - doorW / 2 - 50 - sx0], [doorX + doorW / 2 + 28, sx1 - 22 - (doorX + doorW / 2 + 28)]]) {
    roundRect(ctx, wx, 800, ww, 150, 8); ctx.fillStyle = 'rgba(255,217,138,0.85)'; ctx.fill();
    for (let i = 0; i < 2; i++) { roundRect(ctx, wx + 8 + i * (ww / 2), 880, ww / 2 - 16, 60, 6); ctx.fillStyle = 'rgba(60,70,110,0.35)'; ctx.fill(); }
  }
  // awning
  const aw0 = sx0 - 10, aw1 = sx1 + 10, ay = 700;
  for (let i = 0; i < 10; i++) {
    const x0 = lerp(aw0, aw1, i / 10), x1 = lerp(aw0, aw1, (i + 1) / 10);
    ctx.beginPath(); ctx.moveTo(x0, ay); ctx.lineTo(x1, ay); ctx.lineTo(x1 + 4, ay + 46); ctx.arc((x0 + x1) / 2 + 4, ay + 46, (x1 - x0) / 2, 0, Math.PI); ctx.closePath();
    ctx.fillStyle = i % 2 ? '#e8edf8' : '#4f8fd6'; ctx.fill();
  }
  // facade sign
  ctx.save(); ctx.translate(670, 615);
  roundRect(ctx, -170, -40, 340, 80, 14); ctx.fillStyle = '#15182e'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = rgba(ACC, 0.9); ctx.stroke();
  ctx.font = H.font('display', 44); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ACC;
  ctx.fillText(P.sign || 'SHOP', 0, 3);
  ctx.restore();

  // doors slide OPEN
  const open = smooth((t - tOpen) / 0.6);
  K.glow(ctx, doorX, 890, 260, ACC, 0.12 + 0.3 * open + 0.05 * Math.sin(t * 3));
  roundRect(ctx, doorX - doorW / 2 - 10, doorTop - 10, doorW + 20, 1000 - doorTop + 10, 10); ctx.fillStyle = '#1a1d36'; ctx.fill();
  const g = ctx.createLinearGradient(0, doorTop, 0, 1000); g.addColorStop(0, '#fff1c4'); g.addColorStop(1, mixHex('#ffd98a', ACC, 0.3));
  ctx.fillStyle = g; ctx.fillRect(doorX - doorW / 2, doorTop, doorW, 1000 - doorTop);
  const half = (doorW / 2) * (1 - 0.88 * open);
  ctx.fillStyle = '#5a7ab0';
  ctx.fillRect(doorX - doorW / 2, doorTop, half, 1000 - doorTop);
  ctx.fillRect(doorX + doorW / 2 - half, doorTop, half, 1000 - doorTop);
  // welcome mat
  if (open > 0.05) {
    ctx.save(); ctx.globalAlpha = open;
    ctx.beginPath(); ctx.moveTo(doorX - 120, 1040); ctx.lineTo(doorX + 120, 1040); ctx.lineTo(doorX + 95, 1002); ctx.lineTo(doorX - 95, 1002); ctx.closePath();
    ctx.fillStyle = ACC; ctx.fill();
    ctx.font = H.font('display', 26); ctx.fillStyle = K.ACCENT.deep; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.mat || 'WELCOME', doorX, 1022);
    ctx.restore();
  }

  // ---- gateway arch rises around the door ----
  const gk = smooth((t - tGate) / 0.7);
  if (gk > 0) {
    const ax0 = doorX - 150, ax1 = doorX + 150, topY = lerp(1000, 735, gk);
    ctx.save();
    ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.strokeStyle = ACC;
    ctx.shadowColor = ACC; ctx.shadowBlur = 24;
    ctx.beginPath(); ctx.moveTo(ax0, 1005); ctx.lineTo(ax0, topY + 40); ctx.quadraticCurveTo(ax0, topY, ax0 + 40, topY);
    ctx.lineTo(ax1 - 40, topY); ctx.quadraticCurveTo(ax1, topY, ax1, topY + 40); ctx.lineTo(ax1, 1005); ctx.stroke();
    ctx.restore();
    // running lights on the arch
    for (let i = 0; i < 8; i++) {
      const u = ((i / 8) + t * 0.35) % 1;
      const x = lerp(ax0, ax1, u);
      ctx.fillStyle = rgba('#ffffff', 0.8 * gk); ctx.beginPath(); ctx.arc(x, topY, 4, 0, Math.PI * 2); ctx.fill();
    }
    K.drawLabel(ctx, doorX, topY - 12, Math.min(1.05, K.popIn(t, tGate + 0.35, 0.45)), { text: P.gate || 'Agent Gateway', size: 30, accent: true });
  }

  // ---- person sending the agent (left) ----
  const happy = t > tOpen + 0.3;
  K.drawPerson(ctx, 125, feet, 1.25, { t, pose: t < tZip + 0.6 ? 'phone' : 'cheer', mood: happy ? 'happy' : 'neutral', skin: 1, hair: 2, shirt: 1, hairStyle: 'long', seed: 2, look: 0.5 });

  // ---- robot shopper walks to the arch, gets scanned, zips inside ----
  const walkU = smooth(clamp((t - 0.5) / Math.max(1, tGate + 0.6 - 0.5)));
  const zipU = K.phase(t, tZip, tZip + 0.55, (u) => u * u);
  const rx = lerp(250, 560, walkU) + zipU * 150;
  const rBob = walkU < 1 ? -Math.abs(Math.sin(t * 6)) * 6 : 0;
  if (zipU < 1) {
    ctx.save(); ctx.globalAlpha = 1 - zipU;
    const link = 1 - smooth((t - 2.8) / 0.6);
    if (link > 0) {
      ctx.save(); ctx.setLineDash([10, 12]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = rgba(ACC, 0.8 * link); ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(140, 850); ctx.quadraticCurveTo((140 + rx) / 2, 760, rx - 40, 860); ctx.stroke(); ctx.restore();
    }
    if (zipU > 0) {
      ctx.strokeStyle = rgba('#ffffff', 0.7); ctx.lineWidth = 5; ctx.lineCap = 'round';
      for (let i = 0; i < 4; i++) { const y = 860 + i * 34; ctx.beginPath(); ctx.moveTo(rx - 90 - i * 10, y); ctx.lineTo(rx - 160 - i * 20, y); ctx.stroke(); }
    }
    K.drawRobot(ctx, rx, feet + rBob, 1.1 * (1 - 0.25 * zipU), { t, state: t > tGate + 0.9 ? 'happy' : 'idle', seed: 2 });
    ctx.save(); ctx.translate(rx + 66, 935 + rBob); ctx.rotate(0.06 * Math.sin(t * 5));
    roundRect(ctx, -28, -10, 56, 60, 8); ctx.fillStyle = ACC; ctx.fill();
    ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -10, 15, Math.PI, 0); ctx.stroke();
    ctx.restore();
    { const la = 1 - smooth((t - tGate - 0.1) / 0.3); if (la > 0.02) { ctx.save(); ctx.globalAlpha *= la; K.drawLabel(ctx, rx, 755, Math.min(1.05, K.popIn(t, 0.3, 0.4)), { text: P.agent || 'AI agent', size: 26, dot: true }); ctx.restore(); } }
    ctx.restore();
  }
  // scan beam over the robot as it reaches the arch, then a tick
  const scanU = clamp((t - (tGate + 0.7)) / 0.6);
  if (scanU > 0 && scanU < 1 && zipU < 0.2) {
    const y = lerp(780, 1020, scanU);
    ctx.fillStyle = rgba(ACC, 0.35); ctx.fillRect(rx - 85, y - 6, 170, 12);
  }
  const tick = K.popIn(t, tGate + 1.3, 0.35) * (1 - smooth((t - tZip - 0.3) / 0.3));
  if (tick > 0.02) {
    ctx.save(); ctx.translate(rx, 690); ctx.scale(tick, tick);
    ctx.fillStyle = '#3fbf7f'; ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-13, 1); ctx.lineTo(-3, 11); ctx.lineTo(14, -10); ctx.stroke(); ctx.restore();
  }

  // ---- store name pill(s), date pill, chip ----
  const nk = K.popIn(t, 0.2, 0.4);
  const flash = clamp(1 - Math.abs(t - tOpen - 0.2) / 0.4);
  K.drawLabel(ctx, 670, 555, Math.min(1.05, nk) * (1 + 0.06 * flash), { text: P.store || 'Store', size: 30, dot: true });
  if (P.also) {
    const ak = K.popIn(t, tAlso, 0.4);
    const af = clamp(1 - Math.abs(t - tAlso - 0.25) / 0.45);
    if (af > 0) K.glow(ctx, 670, 470, 150, ACC, 0.4 * af);
    if (ak > 0) K.drawLabel(ctx, 670, 495, Math.min(1.05, ak), { text: P.also, size: 28, accent: true });
  }
  if (P.date) {
    const dk = K.popIn(t, tDate, 0.4);
    if (dk > 0) K.drawLabel(ctx, 230, 520, Math.min(1.05, dk), { text: P.date, size: 30, accent: true });
  }
  if (P.chip !== '') {
    const ck = K.popIn(t, tChip, 0.4) * (1 - smooth((t - tQueue) / 0.4));
    if (ck > 0.02) K.drawLabel(ctx, 260, 640 + K.bob(t, 5, 1.4), Math.min(1.05, ck), { text: P.chip || 'For AI agents', size: 28 });
  }

  // ---- named assistants walk in from the left and queue at the arch ----
  const slots = [540, 400, 262];
  queue.forEach((name, i) => {
    const t0 = tQueue + i * 0.45;
    if (t < t0) return;
    const u = smooth(clamp((t - t0) / 1.6));
    const x = lerp(-120, slots[i], u);
    const bob = u < 1 ? -Math.abs(Math.sin(t * 6 + i)) * 6 : 0;
    K.drawRobot(ctx, x, feet + bob, 0.95, { t: t + i, state: t > tQ[i] ? 'happy' : 'idle', seed: 7 + i });
    const pk = K.popIn(t, tQ[i], 0.4);
    const pf = clamp(1 - Math.abs(t - tQ[i] - 0.2) / 0.4);
    if (pk > 0) K.drawLabel(ctx, x, 800 - (i % 2) * 70, Math.min(1.05, pk) * (1 + 0.06 * pf), { text: name, size: 28, accent: pf > 0.2 });
  });
}
