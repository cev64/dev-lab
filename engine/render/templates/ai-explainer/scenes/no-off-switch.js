// Scene "no-off-switch" (full frame, 3 phases in one beat). Night room.
// 1) A big robot in a ring of 4 small device nodes; a copy runs node to node around the ring until the loop closes and
//    a check stamp lands ("full cycle", with a "simplified tests" pill).
// 2) A staircase trend: a small robot climbs step by step toward a dashed "level" line; a date pill + "estimate" pill.
// 3) A cartoon person shrugs among scattered gadgets that all blink the AI's eyes; an empty dashed switch plate with
//    "?" and a "No central off switch" pill.
// Fits: self-replicating / spreading AI, capability catch-up forecasts, "hard to shut down".
// params: simple, strong, cycle, level, small, when, whenNote, switchText;
//         cues: strongCue, cycleCue, climbCue (phase 2 starts), whenCue, noteCue, switchCue (phase 3 starts)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const TAU = Math.PI * 2;
  const tc = (w, d) => { const v = w ? info.timeOf(w) : null; return v != null ? v : d; };
  const rr = (x, y, w, h, r, fill) => { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); };
  const circle = (x, y, r, fill) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); };
  const strongAt = tc(P.strongCue, D * 0.14), cycleAt = tc(P.cycleCue, D * 0.32), climbAt = tc(P.climbCue, D * 0.4);
  const whenAt = tc(P.whenCue, D * 0.64), noteAt = tc(P.noteCue, D * 0.76), swAt = tc(P.switchCue, D * 0.86) - 0.5;
  const a1 = 1 - clamp((t - climbAt + 0.4) / 0.4), a2 = clamp((t - climbAt + 0.2) / 0.4) * (1 - clamp((t - swAt) / 0.4)), a3 = clamp((t - swAt - 0.1) / 0.4);
  function big(text, x, y, size, color, a) {
    if (a <= 0) return;
    const r = H.fitText(ctx, text, 'display', size, 26, 800);
    ctx.save(); ctx.globalAlpha *= clamp(a); ctx.font = r.font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round'; ctx.lineWidth = r.size * 0.16; ctx.strokeStyle = 'rgba(8,10,22,0.92)'; ctx.strokeText(r.text, x, y);
    ctx.fillStyle = color; ctx.fillText(r.text, x, y); ctx.restore();
  }
  // a generic little device with optional AI eyes
  function gadget(x, y, s, kind, eyes, seed) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 120);
    if (kind === 0) { rr(-55, -44, 110, 44, 10, '#1d2033'); rr(-55, -44, 110, 12, 6, '#2b2f48'); }        // tv box
    else if (kind === 1) { rr(-60, -90, 120, 90, 14, '#c9cede'); rr(-50, -80, 70, 64, 8, '#2a2f45'); } // oven
    else if (kind === 2) { rr(-28, -96, 56, 96, 22, '#d6d9e6'); }                                         // speaker
    else { ctx.save(); ctx.scale(1, 0.45); circle(0, -40, 70, '#4b5075'); ctx.restore(); }               // vacuum
    if (eyes > 0) {
      const cx = kind === 1 ? -15 : 0, cy = kind === 0 ? -24 : kind === 1 ? -48 : kind === 2 ? -52 : -20;
      K.glow(ctx, cx, cy, 60, ACC, 0.45 * eyes);
      const blink = ((t * 1.1 + seed * 0.29) % 3) < 0.15;
      rr(cx - 26, cy - 14, 52, 28, 9, '#0b1020');
      for (const sx of [-1, 1]) rr(cx + sx * 9 - 3.5, cy - (blink ? 1.5 : 8), 7, blink ? 3 : 16, 3.5, ACC);
    }
    ctx.restore();
  }

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.04, x: 487, y: 735 }]);
  K.world.room(ctx, { t, time: 'night', floorY: 880, window: false, picture: false, lamp: false, plant: false, wall: '#232a4a' });

  // ---------- phase 1: the copy cycle
  if (a1 > 0) {
    ctx.save(); ctx.globalAlpha = a1;
    const cx = 487, cy = 790, R = 215, nodes = [0, 1, 2, 3].map((i) => ({ x: cx + Math.cos(-Math.PI / 2 + i * TAU / 4) * R * 1.25, y: cy + Math.sin(-Math.PI / 2 + i * TAU / 4) * R * 0.78 + 40 }));
    const loop = clamp((t - strongAt - 0.3) / Math.max(0.5, cycleAt - strongAt - 0.3));
    ctx.strokeStyle = 'rgba(170,180,220,0.3)'; ctx.lineWidth = 6; ctx.setLineDash([12, 12]);
    ctx.beginPath(); ctx.ellipse(cx, cy + 40, R * 1.25, R * 0.78, 0, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    if (loop > 0) { ctx.strokeStyle = ACC; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.ellipse(cx, cy + 40, R * 1.25, R * 0.78, 0, -Math.PI / 2, -Math.PI / 2 + TAU * loop); ctx.stroke(); }
    nodes.forEach((n, i) => gadget(n.x, n.y + 30, 0.8, [0, 1, 2, 3][i], clamp((loop - i / 4) * 6) * (i === 0 ? 1 : 1) * (t > strongAt ? 1 : 0), i));
    if (loop > 0 && loop < 1) { const a = -Math.PI / 2 + TAU * loop, x = cx + Math.cos(a) * R * 1.25, y = cy + 40 + Math.sin(a) * R * 0.78; K.glow(ctx, x, y, 60, ACC, 0.7); K.drawRobot(ctx, x, y + 30, 0.28, { t, state: 'happy', seed: 4 }); }
    K.drawRobot(ctx, cx, cy + 110, 0.85, { t, state: loop >= 1 ? 'happy' : 'working', seed: 1 });
    const sp = K.popIn(t, 0.1, 0.4); if (sp > 0) K.drawLabel(ctx, 487, 470, sp, { text: P.simple || 'Simplified tests', size: 28 });
    const gp = K.popIn(t, strongAt - 0.1, 0.45); if (gp > 0) K.drawLabel(ctx, 487, 540, gp, { text: P.strong || 'Stronger models', size: 34, accent: true });
    if (t > cycleAt - 0.1) K.drawStamp(ctx, 770, 690, 0.8, { kind: 'check', text: P.cycle || 'FULL CYCLE', land: (t - cycleAt + 0.1) / 0.5 });
    ctx.restore();
  }

  // ---------- phase 2: the climb
  if (a2 > 0) {
    ctx.save(); ctx.globalAlpha = a2;
    const lineY = 650, n = 5, x0 = 150, w = 130, rise = 66, base = 1010;
    ctx.strokeStyle = rgba(ACC, 0.85); ctx.lineWidth = 5; ctx.setLineDash([16, 12]); ctx.beginPath(); ctx.moveTo(110, lineY); ctx.lineTo(880, lineY); ctx.stroke(); ctx.setLineDash([]);
    K.drawLabel(ctx, 250, lineY - 12, 1, { text: P.level || 'Top level', size: 24 });
    for (let i = 0; i < n; i++) {
      const top = base - rise * (i + 1) - 30;
      rr(x0 + i * w, top, w - 6, base - top, 10, i % 2 ? '#3a4470' : '#34406a');
      rr(x0 + i * w, top, w - 6, 12, 6, '#4b5790');
    }
    const prog = clamp((t - climbAt) / Math.max(0.5, whenAt - climbAt + 0.6));
    const fs = prog * (n - 1), si = Math.floor(fs), f = fs - si;
    const stepX = (i) => x0 + i * w + w / 2 - 3, stepY = (i) => base - rise * (i + 1) - 30;
    const hopE = H.easeInOutCubic(f);
    const rx = lerp(stepX(si), stepX(Math.min(n - 1, si + 1)), hopE), ry = lerp(stepY(si), stepY(Math.min(n - 1, si + 1)), hopE) - Math.sin(Math.PI * f) * 50;
    K.drawRobot(ctx, rx, ry, 0.5, { t, state: prog >= 1 ? 'happy' : 'working', seed: 5 });
    K.drawLabel(ctx, rx, ry + 62, 1, { text: P.small || 'Small models', size: 24, dot: true });
    const wp = K.popIn(t, whenAt - 0.1, 0.45); if (wp > 0) K.drawLabel(ctx, 650, 548, wp, { text: P.when || 'Soon?', size: 40, accent: true });
    const np = K.popIn(t, noteAt - 0.1, 0.4); if (np > 0) K.drawLabel(ctx, 650, 600, np, { text: P.whenNote || 'An estimate', size: 24 });
    ctx.restore();
  }

  // ---------- phase 3: no off switch
  if (a3 > 0) {
    ctx.save(); ctx.globalAlpha = a3;
    const spots = [[150, 1000, 0], [300, 920, 2], [700, 920, 1], [840, 1000, 3], [210, 770, 0], [780, 770, 2], [120, 880, 1], [870, 870, 0]];
    spots.forEach(([x, y, k], i) => gadget(x, y, 0.7, k, clamp((t - swAt - 0.2 - i * 0.08) / 0.3), i));
    // empty switch plate
    const pp = K.popIn(t, swAt + 0.1, 0.45);
    if (pp > 0) {
      ctx.save(); ctx.translate(487, 680); ctx.scale(pp, pp);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 5; ctx.setLineDash([12, 10]); roundRect(ctx, -70, -100, 140, 200, 18); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
      ctx.save(); ctx.translate(487, 715); ctx.scale(pp, pp); big('?', 0, 0, 120, ACC, 1); ctx.restore();
    }
    K.drawPerson(ctx, 487, 1030, 1.2, { t, pose: 'shrug', mood: 'worried', skin: 2, hair: 1, shirt: 1, hairStyle: 'short', look: 0, seed: 3 });
    const lp = K.popIn(t, swAt + 0.25, 0.45); if (lp > 0) K.drawLabel(ctx, 487, 520, lp, { text: P.switchText || 'No off switch', size: 38, accent: true });
    ctx.restore();
  }
  ctx.restore();
}
