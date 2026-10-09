// Scene "robot-does-job" (full frame). Office: a friendly robot at a desk thinks, then works on a laptop while
// finished documents pop out and stack up; a coworker watches with a coffee, reacts, and the task gets a "DONE"
// stamp. Phases: think (0-15%), work (15-80%), done (80%+), or the beat boundaries when the scene spans 3 beats.
// params (optional): task      label over the robot, default "Writing the weekly report"
//                    reaction  "impressed" (cheers, default) | "worried" (shrugs, worried face)
//                    done      stamp text, default "DONE"
//                    cue       a narration word; the coworker reacts when it is spoken
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, smooth, lerp, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  let w0 = D * 0.15, w1 = D * 0.8;
  if (info.beats.length >= 3) { w0 = info.beats[1].t0; w1 = info.beats[2].t0; }
  const worried = P.reaction === 'worried';
  const cue = P.cue != null ? info.timeOf(P.cue) : null;
  const reactAt = cue != null ? cue : lerp(w0, w1, 0.55);

  // camera: start a bit wide, ease in on the desk while working, small settle at the end
  const z = lerp(1, 1.08, K.phase(t, w0, w1)) * (1 + 0.04 * K.phase(t, w1, w1 + 0.8, K.easeOutBack) - 0.04 * K.phase(t, w1 + 0.8, D));
  ctx.save(); ctx.translate(487, 725); ctx.scale(z, z); ctx.translate(-500, -735);

  K.world.office(ctx, { t, time: P.time || 'day' });
  const feet = 1035;
  // robot behind the desk
  const working = t >= w0 && t < w1;
  const state = t < w0 ? 'thinking' : working ? 'working' : 'happy';
  const deskX = 600;
  K.drawRobot(ctx, deskX, feet - 20, 1.45, { t, state, seed: 5 });
  K.drawDesk(ctx, deskX, feet, 1.3);
  const deskTop = feet - 110 * 1.3;
  // laptop facing us
  K.drawLaptop(ctx, deskX + 10, deskTop + 2, 0.78, { t: t - w0, screen: 'code', typing: working, shadow: false });
  // documents popping out of the laptop and stacking on the desk (right)
  const nDocs = 6, every = (w1 - w0) / (nDocs + 0.5);
  let stacked = 0;
  for (let i = 0; i < nDocs; i++) {
    const born = w0 + (i + 0.6) * every, age = t - born;
    if (age < 0) continue;
    const fly = clamp(age / 0.7);
    const sx = deskX + 10, sy = deskTop - 80, ex = deskX + 165, ey = deskTop - 2 - stacked * 7;
    const e = easeOutCubic(fly);
    const x = lerp(sx, ex, e), y = lerp(sy, ey, e) - Math.sin(fly * Math.PI) * 130;
    ctx.save(); ctx.translate(x, y); ctx.rotate((1 - e) * -0.6 + (i % 2 ? 0.04 : -0.03));
    K.drawDocument(ctx, 0, 0, 0.42, { shadow: false, sign: 1, lines: 5 });
    ctx.restore();
    if (fly >= 1) stacked++;
  }
  // task label + progress bar
  const lab = P.task || 'Writing the weekly report';
  const lp = K.popIn(t, 0.2, 0.45);
  if (lp > 0) {
    K.drawLabel(ctx, deskX - 10, 470, lp, { text: lab, size: 28, dot: true });
    const prog = K.phase(t, w0, w1, smooth), bw = 300, bx = deskX - 10 - bw / 2, by = 486;
    ctx.save(); ctx.globalAlpha = lp;
    H.roundRect(ctx, bx, by, bw, 14, 7); ctx.fillStyle = 'rgba(10,12,22,0.75)'; ctx.fill();
    if (prog > 0) { H.roundRect(ctx, bx, by, Math.max(14, bw * prog), 14, 7); ctx.fillStyle = ACC; ctx.fill(); }
    ctx.restore();
  }
  // coworker on the left: watches with a mug, reacts
  const react = t >= reactAt;
  let pose = 'stand', mood = 'neutral', look = 0.6;
  if (react) { pose = worried ? 'shrug' : 'stand'; mood = worried ? 'worried' : 'happy'; }
  if (t >= w1 + 0.3) { pose = worried ? 'shrug' : 'cheer'; mood = worried ? 'worried' : 'happy'; }
  // anticipation: a small dip just before reacting
  const dip = react ? (1 - K.phase(t, reactAt, reactAt + 0.25)) * 0.02 : 0;
  ctx.save(); ctx.translate(205, feet); ctx.scale(1, 1 - dip); ctx.translate(-205, -feet);
  K.drawPerson(ctx, 205, feet, 1.55, { t, pose, mood, look, skin: 4, hair: 1, shirt: 2, hairStyle: 'curly', seed: 7, talk: react && t < reactAt + 1.2 ? 0.6 : 0 });
  ctx.restore();
  if (pose === 'stand') K.props.mug(ctx, 205 + 38 * 1.55, feet - 66 * 1.55, 0.9, t);
  // "!" pop when reacting
  if (react && t < reactAt + 1.4) {
    const p = K.popIn(t, reactAt, 0.3);
    ctx.save(); ctx.globalAlpha = 1 - smooth((t - reactAt - 1.0) / 0.4);
    K.drawSpeechBubble(ctx, 205 + 30, feet - 250 * 1.55 - 20, 1, { text: worried ? '?!' : '!', size: 44, pop: p, tail: 'left' });
    ctx.restore();
  }
  // done stamp over the stack
  if (t >= w1) K.drawStamp(ctx, deskX + 165, deskTop - 40, 0.72, { kind: 'check', text: P.done || 'DONE', land: clamp((t - w1) / 0.55) });
  ctx.restore();
}
