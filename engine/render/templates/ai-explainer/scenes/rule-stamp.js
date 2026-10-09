// Scene "rule-stamp" (full frame). A chamber/courtroom: a rule book on a lectern glows, swings open, a gavel
// winds up and strikes, and a big stamp slams onto the page with a label (camera shake on impact). An official
// at the bench gestures. Ends settled on the stamped book.
// params (optional): text   stamp text, default "NEW RULES"
//                    kind   "check" (default) | "cross"
//                    title  text on the book cover, default "AI RULES"
//                    note   small label under the book after the stamp, optional (e.g. "Takes effect 2027")
//                    cue    a narration word; the stamp lands when it is spoken
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, smooth, lerp } = H;
  const D = info.duration, ACC = info.accent;
  const cue = P.cue != null ? info.timeOf(P.cue) : null;
  const stampAt = cue != null && cue > 1.5 ? cue : Math.max(1.8, D * 0.6);
  const openAt = Math.max(0.6, stampAt * 0.35), gavelAt = stampAt - 0.9;

  // camera: wide, push into the book before the stamp, shake on impact
  const push = K.phase(t, openAt, stampAt - 0.15);
  const z = lerp(1, 1.32, push), cx = lerp(487, 487, push), cy = lerp(735, 790, push);
  ctx.save();
  K.cameraShake(ctx, t, stampAt, 0.45, 16);
  ctx.translate(487, 725); ctx.scale(z, z); ctx.translate(-cx, -cy);

  const room = K.world.courtroom(ctx, { t });
  // official at the bench (only the upper body shows above it)
  const gesture = t > stampAt + 0.3 ? 'point' : t > openAt ? 'stand' : 'stand';
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, info.width, room.bench.y + 4); ctx.clip();
  K.drawPerson(ctx, 330, room.bench.y + 180, 1.25, { t, pose: gesture, flip: false, skin: 1, hair: 3, shirt: '#3b4580', hairStyle: 'short', mood: t > stampAt ? 'happy' : 'neutral', talk: t > openAt && t < gavelAt ? 0.5 * info.env + 0.2 : 0, seed: 3 });
  ctx.restore();
  // lectern + book in the foreground
  const LX = 487, LY = 1060;
  K.drawLectern(ctx, LX, LY, 1.35);
  const top = LY - 232 * 1.35;
  const open = K.phase(t, openAt, openAt + 0.8, K.easeOutBack);
  const glowK = (1 - smooth((t - openAt) / 0.6)) * (0.5 + 0.5 * Math.sin(t * 4));
  K.glow(ctx, LX, top - 120, 220, ACC, 0.18 + 0.25 * glowK);
  const bob = t < openAt ? K.bob(t, 4, 0.6) : 0;
  K.drawRulebook(ctx, LX + 40 * open, top + 8 + bob, 1.05, { open: clamp(open), title: P.title || 'AI RULES' });
  // gavel on the lectern's right: wind up (anticipation) then strike
  let hit = 1;
  if (t < gavelAt - 0.5) hit = 1; // resting
  else if (t < gavelAt) hit = 1 - K.phase(t, gavelAt - 0.5, gavelAt, smooth); // raise
  else hit = K.phase(t, gavelAt, gavelAt + 0.14, (k) => k * k); // strike fast
  K.drawGavel(ctx, LX + 210, top + 6, 0.8, { hit });
  // stamp lands on the right page
  if (t >= stampAt - 0.05) {
    const land = clamp((t - stampAt + 0.05) / 0.5);
    K.drawStamp(ctx, LX + 88, top - 40, 0.78, { kind: P.kind === 'cross' ? 'cross' : 'check', text: P.text || 'NEW RULES', land });
  }
  if (P.note && t > stampAt + 0.6) K.drawLabel(ctx, LX, LY - 10, K.popIn(t, stampAt + 0.6, 0.4), { text: P.note, size: 26, dot: true });
  ctx.restore();
}
