// Scene "ai-wonders" (full frame). A quiet room at night: a cartoon robot sits by the window under a lamp, thinking.
// A thought bubble with a question mark grows as the narrator raises the question, the lamp flickers once, and a
// label with the open question pops in. Good for "nobody knows yet" / caveat beats.
// params: question  label text (default "Open question")    cue  word that pops the label
//         thought   text inside the bubble (default "?")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration;
  const cueT = P.cue != null ? info.timeOf(P.cue) : null;
  const labelAt = cueT != null ? cueT : D * 0.55;

  const z = lerp(1.0, 1.12, K.phase(t, 0, D)); // slow, contemplative push-in
  ctx.save();
  ctx.translate(487, 725); ctx.scale(z, z); ctx.translate(-480, -735);
  const room = K.world.room(ctx, { t, time: 'night', window: true, lamp: true, plant: true });
  const feet = room.feetY || 1035;
  K.props.floorLamp(ctx, 250, feet, t < labelAt - 0.3 || t > labelAt + 0.15 ? 1 : 0.35, t);
  K.drawRobot(ctx, 520, feet, 1.6, { t, state: 'thinking', seed: 5 });
  const bp = K.popIn(t, Math.min(1.2, D * 0.15), 0.6);
  if (bp > 0) {
    // thought dots rising from the robot's head, then the bubble
    for (let i = 0; i < 3; i++) {
      const d = K.popIn(t, 0.5 + i * 0.18, 0.3);
      if (d > 0) { ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.arc(600 + i * 26, 720 - i * 26, (6 + i * 3) * d, 0, Math.PI * 2); ctx.fill(); }
    }
    K.drawSpeechBubble(ctx, 700, 650, bp * (1 + 0.02 * Math.sin(t * 2)), { text: P.thought || '?', size: 96, tail: 'left', pop: bp });
  }
  const lp = K.popIn(t, labelAt, 0.5);
  if (lp > 0) K.drawLabel(ctx, 487, 480, lp, { text: P.question || 'Open question', size: 38, accent: true, dot: true });
  ctx.restore();
}
