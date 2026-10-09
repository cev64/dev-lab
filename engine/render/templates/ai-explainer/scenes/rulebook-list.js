// Scene "rulebook-list" (full frame). A chamber with a rule book on a lectern. The book opens,
// rule topics pop up one by one as the narrator names them, then the AI itself (a cartoon robot) steps in beside the
// book and the final, highlighted topic lands with a stamp. Good for "a new policy adds X, Y, Z ... and this".
// Opens on an establishing shot (the hook card covers the first ~3 s).
// params: items    [{text, cue}] topics in order; cue = narration word that pops it (optional)
//         final    {text, cue} the highlighted last topic (accent), stamp lands at its cue
//         title    book cover text (default "RULES")   stamp  stamp text (default "NEW RULE")
//         robot    true to bring in the robot with the final topic (default true)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent;
  const items = (P.items || [{ text: 'Topic one' }, { text: 'Topic two' }, { text: 'Topic three' }]).slice(0, 4);
  const fin = P.final || { text: 'The new rule' };
  const at = (cue, fallback) => {
    const v = cue != null ? info.timeOf(cue) : null;
    return v != null ? v : fallback;
  };
  const openAt = Math.min(3.4, D * 0.2);
  const itemAt = items.map((it, i) => at(it.cue, openAt + 1 + i * 1.6));
  const finalAt = Math.max(at(fin.cue, D * 0.8), (itemAt[itemAt.length - 1] || openAt) + 0.8);
  const stampAt = finalAt + 0.6;

  // camera: wide establishing shot under the hook, push towards the book as topics appear, settle wider at the end
  const push = K.phase(t, openAt - 0.5, openAt + 1.2);
  const settle = K.phase(t, finalAt - 0.4, finalAt + 0.8);
  const z = lerp(lerp(1, 1.22, push), 1.12, settle);
  const cy = lerp(lerp(725, 690, push), 700, settle);
  ctx.save();
  K.cameraShake(ctx, t, stampAt, 0.4, 12);
  ctx.translate(487, 725); ctx.scale(z, z); ctx.translate(-487, -cy);

  const room = K.world.courtroom(ctx, { t });

  // lectern + book, left of centre so the topic list fits on the right
  const LX = 330, LY = 1060;
  K.drawLectern(ctx, LX, LY, 1.25);
  const top = LY - 232 * 1.25;
  const open = K.phase(t, openAt, openAt + 0.8, K.easeOutBack);
  K.glow(ctx, LX, top - 110, 200, ACC, 0.12 + 0.12 * Math.sin(t * 3));
  K.drawRulebook(ctx, LX + 30 * open, top + 8 + (t < openAt ? K.bob(t, 4, 0.6) : 0), 0.95,
    { open: clamp(open), title: P.title || 'RULES' });

  // topic list on the right: plain items, then the highlighted final one
  const x0 = 690, y0 = 560, gap = 92;
  items.forEach((it, i) => {
    const p = K.popIn(t, itemAt[i], 0.45);
    if (p > 0) K.drawLabel(ctx, x0, y0 + i * gap, p, { text: it.text, size: 36, dot: true });
  });
  const fp = K.popIn(t, finalAt, 0.5);
  if (fp > 0) {
    K.glow(ctx, x0, y0 + items.length * gap + 10, 140, ACC, 0.25 * fp);
    K.drawLabel(ctx, x0 - 30, y0 + items.length * gap + 14, fp, { text: fin.text, size: 38, dot: true, accent: true });
  }
  // the AI itself walks in next to the book when it is mentioned
  if (P.robot !== false) {
    const enter = K.phase(t, finalAt - 0.2, finalAt + 0.9, K.easeOutCubic);
    if (enter > 0) {
      const rx = lerp(-120, 180, enter); // enters from the left, beside the lectern, clear of the topic list
      K.drawRobot(ctx, rx, 1040, 1.2, { t, state: t > stampAt + 0.4 ? 'happy' : 'idle', seed: 2 });
    }
  }
  if (t >= stampAt - 0.05) {
    K.drawStamp(ctx, LX + 50, top - 30, 0.85, { kind: 'check', text: P.stamp || 'NEW RULE', land: clamp((t - stampAt + 0.05) / 0.5) });
  }
  ctx.restore();
}
