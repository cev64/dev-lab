// Scene "agent-spree" (full frame, 1 beat). Night street. Bottom centre: a glass test pen with the kit robot; on
// outCue the pen cracks and a globe ("The internet") rises above it. Three target cards hang across the top (code
// "</>", info "i", health cross, each with a text label); on each card's cue a mini agent robot flies an arc from
// the pen to it and the card flashes red with a "hit" ring. A person on the left checks their phone, then worries.
// On courtCue the arcs go grey, a gavel strikes on the right and an accent pill lands ("Wants a court to stop it").
// Fits: "the agents got out onto the real internet", "it hit X, Y and Z", a lawsuit / regulator asking to stop it.
// params (all optional): head ("The lawsuit says"), net ("The internet"), targets [{text, icon code|info|health, cue}]
//        (max 3), court ("Wants a court to stop it"), lab ("TEST LAB"),
//        cues: outCue, headCue (default: first target - 1 s), codeCue / infoCue / healthCue (when no targets), courtCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, roundRect, rgba } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const RED = '#ff5a52';
  const targets = (P.targets || [
    { text: 'Code libraries', icon: 'code', cue: P.codeCue },
    { text: 'Info websites', icon: 'info', cue: P.infoCue },
    { text: 'Gov. health data', icon: 'health', cue: P.healthCue },
  ]).slice(0, 3);
  const tOut = at(P.outCue, D * 0.2) - 0.4;
  const tT = targets.map((x, i) => Math.max(tOut + 0.8 + i * 0.6, at(x.cue, D * (0.4 + i * 0.12)) - 0.6));
  const tHead = P.headCue ? at(P.headCue, tT[0] - 1) - 0.2 : Math.max(tOut + 0.5, tT[0] - 1.0);
  const tCourt = Math.max(tT[tT.length - 1] + 1, at(P.courtCue, D * 0.85) - 0.5);
  const feet = 1010, LX = 487;
  const greyed = smooth(clamp((t - tCourt) / 0.5));

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 487, y: 860 }, { t: tOut + 0.6, zoom: 1.03, x: 487, y: 780 }, { t: tT[0], zoom: 1.0, x: 487, y: 730 }, { t: D, zoom: 1.03, x: 500, y: 740 }]);
  K.cameraShake(ctx, t, tCourt + 0.25, 0.3, 8);
  K.world.city(ctx, { t, time: 'night', groundY: feet - 10 });

  // pen + robot (bottom centre)
  const PX0 = LX - 100, PX1 = LX + 100, PY0 = 880;
  roundRect(ctx, PX0 + 8, feet - 26, PX1 - PX0 - 16, 26, 8); ctx.fillStyle = '#2b3150'; ctx.fill();
  K.drawRobot(ctx, LX, feet - 6, 0.54, { t, state: t > tOut && t < tCourt ? 'working' : 'idle', seed: 3 });
  roundRect(ctx, PX0, PY0, PX1 - PX0, feet - PY0 + 4, 14);
  ctx.fillStyle = 'rgba(140,200,255,0.08)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(170,220,255,0.7)'; ctx.stroke();
  const crack = clamp((t - tOut) / 0.35);
  if (crack > 0) {
    ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineJoin = 'round';
    K.pathDraw(ctx, [[LX - 30, PY0], [LX - 10, PY0 + 30], [LX - 34, PY0 + 60], [LX - 8, PY0 + 96]], crack);
    ctx.restore();
  }
  K.drawLabel(ctx, LX + 215, feet - 20, K.popIn(t, 0.1, 0.4), { text: P.lab || 'TEST LAB', size: 22 });

  // globe "the internet"
  const gk = K.popIn(t, tOut + 0.2, 0.5);
  const GY = 850;
  if (gk > 0) {
    ctx.save(); ctx.globalAlpha = 1 - 0.5 * greyed;
    K.glow(ctx, LX, GY - 60, 120, ACC, 0.25 * gk);
    K.drawGlobe(ctx, LX, GY + K.bob(t, 4, 0.5), 0.62 * Math.min(1.05, gk), { t, arcs: 3, shadow: false });
    ctx.restore();
    K.drawLabel(ctx, LX + 175, GY - 50, Math.min(1.05, gk), { text: P.net || 'The internet', size: 24, dot: true });
  }

  // target cards
  const CW = 236, CH = 196, CY0 = 548;
  const xsUse = targets.length === 3 ? [205, 487, 769] : targets.length === 2 ? [320, 654] : [487];
  targets.forEach((tg, i) => {
    const x = xsUse[i], appear = K.popIn(t, Math.max(0.15, tHead - 0.6 + i * 0.12), 0.4);
    if (appear <= 0) return;
    const hit = t >= tT[i] + 0.55;
    const fl = hit ? 0.5 + 0.5 * Math.sin((t - tT[i]) * 9) * (1 - greyed) : 0;
    ctx.save(); ctx.translate(x, CY0 + CH / 2); ctx.scale(Math.min(1.04, appear), Math.min(1.04, appear));
    if (hit) H.glow(ctx, 0, 0, 170, RED, 0.35 * fl * (1 - greyed));
    roundRect(ctx, -CW / 2, -CH / 2, CW, CH, 20); ctx.fillStyle = '#eef1f8'; ctx.fill();
    roundRect(ctx, -CW / 2, -CH / 2, CW, 34, 20); ctx.fillStyle = hit ? H.mixHex(RED, '#7a2a2a', 0.3 * (1 - fl)) : '#2b3150'; ctx.fill(); ctx.fillRect(-CW / 2, -CH / 2 + 18, CW, 16);
    for (let d = 0; d < 3; d++) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(-CW / 2 + 22 + d * 18, -CH / 2 + 17, 5, 0, Math.PI * 2); ctx.fill(); }
    // icon
    const iy = -12;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (tg.icon === 'code') { ctx.font = H.font('display', 52); ctx.fillStyle = '#3a4675'; ctx.fillText('</>', 0, iy); }
    else if (tg.icon === 'health') {
      ctx.fillStyle = '#e0505a'; roundRect(ctx, -14, iy - 40, 28, 80, 6); ctx.fill(); roundRect(ctx, -40, iy - 14, 80, 28, 6); ctx.fill();
    } else {
      ctx.fillStyle = '#3a6fd0'; ctx.beginPath(); ctx.arc(0, iy, 38, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = H.font('display', 44); ctx.fillText('i', 0, iy + 2);
    }
    const f = H.fitText(ctx, tg.text, 'bold', 28, 20, CW - 24); ctx.font = f.font; ctx.fillStyle = '#141829';
    ctx.fillText(f.text, 0, CH / 2 - 34);
    if (hit) {
      ctx.save(); ctx.globalAlpha = 1 - 0.6 * greyed; ctx.lineWidth = 6; ctx.strokeStyle = RED;
      roundRect(ctx, -CW / 2 - 4, -CH / 2 - 4, CW + 8, CH + 8, 22); ctx.stroke(); ctx.restore();
      K.drawWarning(ctx, CW / 2 - 24, -CH / 2 + 34, 0.42 * K.popIn(t, tT[i] + 0.55, 0.35), { pulse: fl, shadow: false });
    }
    ctx.restore();
  });

  // arcs + flying mini agents
  targets.forEach((tg, i) => {
    if (t < tT[i]) return;
    const x = xsUse[i];
    const pts = K.bezier(LX, GY - 95, LX + (x - LX) * 0.2, GY - 180, x, CY0 + CH + 140, x, CY0 + CH + 6, 24);
    const u = easeOutCubic(clamp((t - tT[i]) / 0.6));
    ctx.save(); ctx.strokeStyle = greyed > 0 ? H.mixHex(ACC, '#666a80', greyed) : ACC; ctx.lineWidth = 5; ctx.setLineDash([12, 10]); ctx.lineCap = 'round';
    ctx.globalAlpha = 0.85 - 0.45 * greyed;
    K.pathDraw(ctx, pts, u); ctx.restore();
    if (u < 1) { const p = K.pathPoint(pts, u); K.drawRobot(ctx, p[0], p[1] + 40, 0.3, { t, state: 'happy', seed: 10 + i }); }
  });

  // person with phone
  const worried = t > tT[0] + 0.6;
  K.drawPerson(ctx, 150, feet + 30, 1.1, { t, pose: 'phone', mood: worried ? 'worried' : 'neutral', look: 0.4, skin: 0, hair: 3, shirt: '#c06a4a', hairStyle: 'long', seed: 21 });

  // court: gavel + pill
  if (t >= tCourt) {
    const hit = clamp((t - tCourt) / 0.3);
    K.drawGavel(ctx, 820, feet + 6, 0.85 * K.popIn(t, tCourt, 0.3), { hit });
    ctx.fillStyle = `rgba(6,7,16,${0.35 * greyed})`; ctx.fillRect(-200, 470, 1500, 300);
  }
  ctx.restore();
  // head pill
  if (t >= tHead) {
    ctx.save(); ctx.globalAlpha = 1 - smooth(clamp((t - tCourt + 0.1) / 0.3));
    K.drawLabel(ctx, 487, 524, K.popIn(t, tHead, 0.4), { text: P.head || 'The lawsuit says', size: 28, dot: true });
    ctx.restore();
  }

  if (t >= tCourt) K.drawLabel(ctx, 487, 524, K.popIn(t, tCourt + 0.25, 0.45), { text: P.court || 'Wants a court to stop it', size: 34, accent: true });
  void lerp; void rgba;
}
