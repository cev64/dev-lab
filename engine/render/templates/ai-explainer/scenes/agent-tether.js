// Scene "agent-tether" (full frame, 1 beat, ~4-8 s). Dusk street: a person sends an AI agent robot off on an errand;
// on the link cue a glowing dashed tether draws from the person's hand to the robot; an "AI agent" pill pops over the
// robot, a "Verified human" shield pops over the person, and a tag on the robot reads who it is backed by.
// Fits: agent identity / delegation / "this bot acts for a real person" stories.
// params: agent ("AI agent"), human ("Verified human"), tag ("Backed by a human"),
//         cues (optional; else fractions): linkCue, agentCue, humanCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, roundRect, rgba, lerp } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tLink = at(P.linkCue, D * 0.22) - 0.15;
  const tAgent = at(P.agentCue, D * 0.38) - 0.1;
  const tHuman = at(P.humanCue, D * 0.62) - 0.1;

  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 420, y: 800 }, { t: D, zoom: 1.0 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });
  const feet = 1035;
  // person (left)
  const px = 210;
  K.drawPerson(ctx, px, feet, 1.6, { t, pose: t > tLink - 0.2 ? 'point' : 'stand', mood: 'happy', skin: 1, hair: 2, hairStyle: 'bun', shirt: 2, seed: 9, look: 0.6 });
  // robot walks away to the right, then stops and looks back
  const go = H.easeInOutCubic(clamp(t / Math.max(1, D * 0.75)));
  const rx = lerp(420, 720, go);
  K.drawRobot(ctx, rx, feet - 10 + Math.sin(t * 9) * 3 * (go < 1 ? 1 : 0), 1.45, { t, state: t > tHuman + 0.3 ? 'happy' : 'working', seed: 6, flip: go >= 1 });
  K.drawBriefcase(ctx, rx + 70, feet - 6, 0.55);

  // tether from the person's pointing hand to the robot's chest
  const hand = [px + 98 * 1.6 * 0.95, feet - (104 + 64 + 8) * 1.6], chest = [rx - 20, feet - 150];
  const lk = clamp((t - tLink) / 0.6);
  if (lk > 0) {
    const mid = [(hand[0] + chest[0]) / 2, Math.min(hand[1], chest[1]) - 90];
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24, a = (1 - u) * (1 - u), b = 2 * u * (1 - u), c = u * u;
      pts.push([a * hand[0] + b * mid[0] + c * chest[0], a * hand[1] + b * mid[1] + c * chest[1] + Math.sin(u * 9 + t * 4) * 3]);
    }
    const n = Math.max(2, Math.round(pts.length * lk));
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = 14; ctx.strokeStyle = rgba(ACC, 0.18); ctx.lineCap = 'round';
    ctx.beginPath(); pts.slice(0, n).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.lineWidth = 6; ctx.strokeStyle = ACC; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 50; ctx.lineCap = 'round';
    ctx.beginPath(); pts.slice(0, n).forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    ctx.restore();
    // a spark travelling along
    if (lk >= 1) {
      const u = (t * 0.8) % 1, p = pts[Math.floor(u * 24)];
      H.glow(ctx, p[0], p[1], 40, ACC, 0.6);
    }
  }
  // pills
  const ka = K.popIn(t, tAgent, 0.4);
  if (ka > 0) K.drawLabel(ctx, rx, 700, Math.min(1.05, ka), { text: P.agent || 'AI agent', size: 30, dot: true });
  const kh = K.popIn(t, tHuman, 0.45);
  if (kh > 0) {
    K.drawShield(ctx, px, 620, 0.75 * Math.min(1.06, kh), { check: clamp((t - tHuman - 0.2) / 0.4) });
    K.drawLabel(ctx, px + 40, 700, Math.min(1.05, kh), { text: P.human || 'Verified human', size: 28, accent: true });
  }
  const kt = K.popIn(t, tHuman + 0.6, 0.4);
  if (kt > 0) K.drawLabel(ctx, Math.min(rx, 700), 630, Math.min(1.05, kt), { text: P.tag || 'Backed by a human', size: 26 });
}
