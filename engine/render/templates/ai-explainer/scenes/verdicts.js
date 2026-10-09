// Scene "verdicts" (full frame). An open-plan office: a row of cartoon people, each doing something ordinary with their
// device. As the narrator names each case it gets a check stamp ("fine"); then the camera pans to the one case that is
// NOT fine, which gets a cross stamp. Good for "X, Y and Z are fine, but W is not".
// params: cases    [{text, cue, pose, mood}] up to 4 "fine" cases (pose: phone|sit-laptop|shrug|point|stand)
//         banned   {text, cue} the case that is not fine (cross stamp lands at its cue)
//         okText   stamp text for fine cases (default "FINE")   noText  (default "NOT OK")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent;
  const cases = (P.cases || [{ text: 'Case one' }, { text: 'Case two' }, { text: 'Case three' }]).slice(0, 4);
  const banned = P.banned || { text: 'The exception' };
  const at = (cue, fallback) => {
    const v = cue != null ? info.timeOf(cue) : null;
    return v != null ? v : fallback;
  };
  const caseAt = cases.map((c, i) => at(c.cue, D * (0.2 + i * 0.14)));
  const banAt = Math.max(at(banned.cue, D * 0.8), caseAt[caseAt.length - 1] + 1.0);
  const panAt = banAt - 0.9;

  // camera: medium wide on the row, then push right towards the banned case
  const pan = K.phase(t, panAt, banAt - 0.1);
  // pan limits keep the 1080-wide world filling the frame: at zoom z, cx must stay within [487/z, 1080 - 593/z]
  const z = lerp(1.0, 1.22, pan), cx = lerp(487, 590, pan), cy = lerp(725, 760, pan);
  ctx.save();
  K.cameraShake(ctx, t, banAt + 0.15, 0.35, 10);
  ctx.translate(487, 725); ctx.scale(z, z); ctx.translate(-cx, -cy);

  K.world.office(ctx, { t, time: 'dusk' });
  const n = cases.length, x0 = 160, step = n > 1 ? (600 - x0) / (n - 1) : 0, feet = 1040;
  const skins = [0, 3, 1, 4], hairs = [2, 0, 4, 1], shirts = ['#2f6f9f', '#7a4fa0', '#3d8b6a', '#b5563d'];
  cases.forEach((c, i) => {
    const x = x0 + i * step, done = t >= caseAt[i];
    const pose = c.pose || ['phone', 'shrug', 'sit-laptop', 'point'][i % 4];
    if (pose === 'sit-laptop') K.drawDesk(ctx, x, feet, 0.55);
    K.drawPerson(ctx, x, feet, 1.3, {
      t, pose, mood: done ? 'happy' : (c.mood || 'neutral'), skin: skins[i % 4], hair: hairs[i % 4], shirt: shirts[i % 4],
      typing: pose === 'sit-laptop' ? 1 : 0, talk: !done && t > caseAt[i] - 1.2 ? 0.4 : 0, seed: 11 + i,
    });
    const lp = K.popIn(t, caseAt[i] - 0.35, 0.4);
    if (lp > 0) K.drawLabel(ctx, x, 520 + (i % 2) * 78, lp, { text: c.text, size: 32 });
    if (done) K.drawStamp(ctx, x, 770, 0.55, { kind: 'check', text: P.okText || 'FINE', land: clamp((t - caseAt[i]) / 0.45) });
  });

  // the banned case: an angry person hammering a laptop, warning sign, cross stamp
  const bx = 805;
  K.drawDesk(ctx, bx, feet, 0.7);
  K.drawPerson(ctx, bx, feet, 1.35, {
    t, pose: 'sit-laptop', typing: 2, mood: 'angry', skin: 2, hair: 3, shirt: '#5a5f6e', flip: true, seed: 21,
    talk: t > panAt ? 0.3 + 0.5 * info.env : 0,
  });
  const wp = K.popIn(t, panAt + 0.2, 0.4);
  if (wp > 0) K.drawWarning(ctx, bx, 720, 0.6 * wp, { pulse: t });
  const bl = K.popIn(t, panAt + 0.1, 0.45);
  if (bl > 0) K.drawLabel(ctx, bx - 15, 520, bl, { text: banned.text, size: 34, accent: true });
  if (t >= banAt) K.drawStamp(ctx, bx, 860, 0.6, { kind: 'cross', text: P.noText || 'NOT OK', land: clamp((t - banAt) / 0.5) });
  ctx.restore();
}
