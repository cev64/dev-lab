// Scene "preview-rope" (full frame). City street at dusk: a building entrance with a lit sign and a velvet rope; the
// agent robot waves from the glowing doorway. A small queue waits: a business person with a briefcase (first label),
// then a casual person on a phone who ends up shrugging (second label); a calendar page pops with a "?".
// Fits: "limited / private preview", "waitlist", "business first, consumers later", "no release date yet".
// params (all optional): sign        sign text (default "PRIVATE PREVIEW")
//                        bizLabel    first person's label (default "Business: soon")
//                        laterLabel  second person's label (default "Consumers: later")
//                        dateText    label by the calendar (default "Date: ?"; '' hides the label)
//                        signCue / bizCue / laterCue / dateCue  narration words (else 15% / 45% / 65% / 85%)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, smooth, lerp, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const tw = (w, f) => { const v = w ? info.timeOf(w) : null; return v != null ? v : D * f; };
  const tSign = tw(P.signCue, 0.15);
  const tBiz = tw(P.bizCue, 0.45), tLater = tw(P.laterCue, 0.65), tDate = tw(P.dateCue, 0.85);

  const z = lerp(1.0, 1.05, H.phase(t, 0, D));
  ctx.save(); ctx.translate(487, 725); ctx.scale(z, z); ctx.translate(-487, -740);
  K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });
  const feet = 1035;

  // building front on the right
  const bx0 = 540, bx1 = 960, by0 = 400;
  ctx.fillStyle = '#2b2f55'; H.roundRect(ctx, bx0, by0, bx1 - bx0, 1000 - by0, 10); ctx.fill();
  ctx.fillStyle = '#24284a'; ctx.fillRect(bx0 + 300, by0 + 10, 110, 590);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { H.roundRect(ctx, bx0 + 28 + c * 130, by0 + 30 + r * 60, 96, 40, 6); ctx.fillStyle = H.hash(r, c) > 0.4 ? '#ffd98a' : '#3a4070'; ctx.fill(); }
  // door, glowing interior
  const dx = 700, dw = 210, dTop = 650;
  const lit = K.phase(t, tSign, tSign + 0.4);
  K.glow(ctx, dx, 860, 260, ACC, 0.25 + 0.25 * lit);
  H.roundRect(ctx, dx - dw / 2 - 12, dTop - 12, dw + 24, 1000 - dTop + 12, 14); ctx.fillStyle = '#1a1d36'; ctx.fill();
  const g = ctx.createLinearGradient(0, dTop, 0, 1000); g.addColorStop(0, H.mixHex('#3a3f6c', K.ACCENT.light, 0.25 + 0.35 * lit)); g.addColorStop(1, H.mixHex('#3a3f6c', ACC, 0.2 + 0.3 * lit));
  H.roundRect(ctx, dx - dw / 2, dTop, dw, 1000 - dTop, 10); ctx.fillStyle = g; ctx.fill();
  // robot in the doorway, waves
  K.drawRobot(ctx, dx, 1000, 0.95, { t, state: t > tSign + 0.3 ? 'happy' : 'idle', seed: 2 });
  // sign over the door
  const sp = K.popIn(t, tSign - 0.1, 0.5);
  const sign = P.sign || 'PRIVATE PREVIEW';
  ctx.save(); ctx.font = H.font('display', 34); const sw = ctx.measureText(sign).width + 50; ctx.restore();
  ctx.save(); ctx.translate(dx, 575);
  H.roundRect(ctx, -sw / 2, -36, sw, 72, 14); ctx.fillStyle = '#15182e'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = H.mixHex('#4a5080', ACC, lit); ctx.stroke();
  if (lit > 0) K.glow(ctx, 0, 0, sw * 0.7, ACC, 0.35 * lit);
  ctx.font = H.font('display', 34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = H.mixHex('#5a6090', ACC, sp > 0 ? clamp(sp) : 0);
  ctx.fillText(sign, 0, 2);
  ctx.restore();

  // velvet rope in front of the door (swings in on the sign cue)
  const rp = K.popIn(t, tSign + 0.1, 0.5);
  const p1 = 585, p2 = 815;
  for (const px of [p1, p2]) {
    ctx.save(); ctx.translate(px, feet); ctx.scale(1, clamp(rp));
    K.shadow(ctx, 0, 0, 60);
    H.roundRect(ctx, -26, -10, 52, 12, 6); ctx.fillStyle = '#c9a646'; ctx.fill();
    H.roundRect(ctx, -6, -150, 12, 142, 6); ctx.fill();
    ctx.beginPath(); ctx.arc(0, -156, 14, 0, Math.PI * 2); ctx.fillStyle = '#e2c25a'; ctx.fill();
    ctx.restore();
  }
  if (rp > 0.3) {
    const sag = 50 + 8 * Math.sin(t * 2.4) * (1 - K.phase(t, tSign, tSign + 2));
    ctx.save(); ctx.globalAlpha = clamp((rp - 0.3) / 0.5); ctx.strokeStyle = '#b8323c'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(p1 + 10, feet - 150); ctx.quadraticCurveTo((p1 + p2) / 2, feet - 150 + sag * 2, p2 - 10, feet - 150); ctx.stroke(); ctx.restore();
  }

  // the queue
  const qp = (d) => K.popIn(t, d, 0.4);
  // business person (front), waits, checks watch / leans
  const bpX = 445;
  if (qp(0.2) > 0) {
    const happy = t > tBiz;
    K.drawPerson(ctx, bpX, feet, 1.45, { t, pose: 'stand', mood: happy ? 'happy' : 'neutral', look: 0.8, skin: 1, hair: 4, shirt: 3, hairStyle: 'bun', seed: 21 });
    K.drawBriefcase(ctx, bpX + 72, feet, 0.5);
  }
  const cpX = 225;
  if (qp(0.35) > 0) {
    const mood = t > tLater + 0.2 ? 'worried' : 'neutral';
    K.drawPerson(ctx, cpX, feet, 1.45, { t, pose: t > tLater + 0.2 ? 'shrug' : 'phone', mood, look: 0.6, skin: 3, hair: 1, shirt: 0, hairStyle: 'curly', seed: 9 });
  }
  ctx.restore();

  // labels (screen space)
  const bl = K.popIn(t, tBiz, 0.45);
  if (bl > 0) K.drawLabel(ctx, bpX, 640, bl, { text: P.bizLabel || 'Business: soon', size: 28, dot: true });
  const ll = K.popIn(t, tLater, 0.45);
  if (ll > 0) K.drawLabel(ctx, Math.max(210, cpX), 560, ll, { text: P.laterLabel || 'Consumers: later', size: 28, dot: true });
  // calendar with a question mark
  const cp = K.popIn(t, tDate, 0.5);
  if (cp > 0) {
    const cx = 450, cy = 455;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(cp, cp); ctx.rotate(-0.05 + 0.03 * Math.sin(t * 2));
    K.glow(ctx, 0, 0, 140, ACC, 0.3);
    H.roundRect(ctx, -70, -70, 140, 140, 16); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    H.roundRect(ctx, -70, -70, 140, 38, 16); ctx.fillStyle = K.NEUTRAL.danger; ctx.fill(); ctx.fillRect(-70, -48, 140, 16);
    for (const rx of [-36, 36]) { H.roundRect(ctx, rx - 6, -84, 12, 28, 6); ctx.fillStyle = '#5b6380'; ctx.fill(); }
    ctx.font = H.font('display', 72); ctx.fillStyle = '#2a2f45'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 22);
    ctx.restore();
    if (P.dateText !== '') K.drawLabel(ctx, cx + 175, cy + 20, cp, { text: P.dateText || 'Date: ?', size: 28, accent: true });
  }
}
