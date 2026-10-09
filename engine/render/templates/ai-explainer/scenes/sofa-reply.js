// Scene "sofa-reply" (full frame). Night living room: a cartoon person on the sofa looks at their phone (the chat is
// over), a status label shows on the phone side, then they soften and say a short line in a speech bubble when the
// narrator reaches the cue word. Good for a payoff/question ending; settles on a calm wide shot (loops well).
// params: status  label near the phone (default "Chat ended")   line  what the person says (default "please?")
//         cue     narration word that triggers the line           statusCue  word that pops the status label
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration;
  const tc = (w) => (w != null ? info.timeOf(w) : null);
  const statusAt = tc(P.statusCue) ?? Math.min(0.8, D * 0.1);
  const lineAt = tc(P.cue) ?? D * 0.7;

  const z = lerp(1.2, 1.05, K.phase(t, 0, D * 0.6));
  ctx.save();
  ctx.translate(487, 725); ctx.scale(z, z); ctx.translate(-480, -760);
  const room = K.world.livingRoomNight(ctx, { t });
  const sofa = room.sofa || { x: 480, feetY: 1030 };
  const softened = t > lineAt - 0.6;
  K.drawPerson(ctx, sofa.x, sofa.feetY, 1.9, {
    t, pose: 'sit-phone', seat: false, mood: softened ? 'happy' : (t < lineAt - 2.5 ? 'shocked' : 'neutral'),
    skin: 1, hair: 2, shirt: '#6b4fa0', hairStyle: 'curly', look: softened ? 0.4 : 0, talk: softened ? 0.5 * info.env : 0, seed: 4,
  });
  const sp = K.popIn(t, statusAt, 0.4);
  if (sp > 0) K.drawLabel(ctx, sofa.x + 210, 560, sp, { text: P.status || 'Chat ended', size: 28, dot: true });
  const lp = K.popIn(t, lineAt, 0.5);
  if (lp > 0) K.drawSpeechBubble(ctx, sofa.x - 40, 600, lp, { text: P.line || 'please?', size: 56, tail: 'center', pop: lp });
  ctx.restore();
}
