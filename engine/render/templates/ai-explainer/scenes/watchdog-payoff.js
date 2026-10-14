// Scene "watchdog-payoff" (full frame; span 2 beats). Dusk plaza: an open letter on a notice board.
// Beat 1 (caveat): a stamp lands on the letter (e.g. REQUEST) with a "not a law" pill; a strip slides over the sheet
//   listing a name as TEXT next to an empty signature line and a cross (someone who did not sign; never drawn).
// Beat 2 (payoff): a cartoon watchdog trots in and sits by the board; then the board fades and the question splits
//   the frame: left a robot holding its own clipboard ("police themselves"), right the watchdog; a big question pill.
// Fits: "it's only a proposal", "X did not sign", "self-regulation vs an independent watchdog" endings.
// params (all optional): title (default "OPEN LETTER"), stamp (default "REQUEST"), notLaw (default "Not a law"),
//        missingTitle (default "Did not sign"), missing (plain-text name, default "A notable name"),
//        count (default "400+"), countLabel (default "scientists"), left (default "Police themselves"),
//        right (default "Answer to a watchdog"), question (default "WHO WATCHES AI?")
//        cues (narration words; else fractions): stampCue, lawCue, missingCue, dogCue, splitCue, qCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent, N = K.NEUTRAL;
  const at = (w, d) => { const v = w != null ? info.timeOf(w) : null; return v == null ? d : v; };
  const tB = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.42;
  const tStamp = at(P.stampCue, 0.5) - 0.15, tLaw = at(P.lawCue, 1.5), tMiss = at(P.missingCue, 3.2) - 0.2;
  const tDog = at(P.dogCue, tB + 1.4) - 1.0, tSplit = at(P.splitCue, tB + (D - tB) * 0.5) - 0.3, tQ = at(P.qCue, D - 1.2) - 0.3;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 430, y: 780 }, { t: tMiss + 0.4, zoom: 1.1, x: 430, y: 800 },
    { t: tB + 0.5, zoom: 1.04, x: 487, y: 770 }, { t: tSplit + 0.6, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.02, x: 487, y: 745 }]);
  K.cameraShake(ctx, t, tStamp + 0.3, 0.35, 9);
  const W = K.world.city(ctx, { t, time: 'dusk', groundY: 960 });
  const feet = 1036;

  // notice board with the letter (fades/slides away at the split)
  const away = K.phase(t, tSplit - 0.2, tSplit + 0.5);
  const bx = 420, by0 = 545, by1 = 940, bw = 380;
  if (away < 1) {
    ctx.save(); ctx.globalAlpha = 1 - away; ctx.translate(0, away * 60);
    ctx.fillStyle = N.woodS; for (const dx of [-140, 140]) { H.roundRect(ctx, bx + dx - 8, by1 - 10, 16, feet - by1 + 10, 5); ctx.fill(); }
    K.shadow(ctx, bx, feet, 420);
    H.roundRect(ctx, bx - bw / 2 - 14, by0 - 14, bw + 28, by1 - by0 + 28, 16); ctx.fillStyle = N.wood; ctx.fill();
    H.roundRect(ctx, bx - bw / 2, by0, bw, by1 - by0, 8); ctx.fillStyle = N.paper; ctx.fill();
    ctx.fillStyle = N.ink; ctx.textAlign = 'center'; ctx.font = K.font.display(42); ctx.fillText(P.title || 'OPEN LETTER', bx, by0 + 62);
    ctx.fillStyle = ACC; H.roundRect(ctx, bx - 50, by0 + 80, 100, 6, 3); ctx.fill();
    ctx.fillStyle = N.paperS; for (let i = 0; i < 9; i++) { H.roundRect(ctx, bx - 150, by0 + 110 + i * 24, i % 4 === 3 ? 170 : 300 - 40 * H.hash(i, 5), 9, 4); ctx.fill(); }
    // stamp
    if (t >= tStamp) K.drawStamp(ctx, bx + 60, by0 + 250, 0.85, { kind: 'check', text: P.stamp || 'REQUEST', land: clamp((t - tStamp) / 0.5) });
    // missing-signature strip
    if (t >= tMiss) {
      const k = easeOutCubic(clamp((t - tMiss) / 0.45));
      const sy = lerp(by1 + 120, by1 - 150, k);
      ctx.save(); ctx.globalAlpha = clamp(k * 1.4);
      H.roundRect(ctx, bx - bw / 2 - 30, sy, bw + 60, 138, 16); ctx.fillStyle = 'rgba(14,17,33,0.95)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = N.danger; ctx.stroke();
      ctx.textAlign = 'left'; ctx.fillStyle = '#c9d0e6'; ctx.font = K.font.ui(26); ctx.fillText(P.missingTitle || 'Did not sign', bx - bw / 2, sy + 42);
      let fs = 40; ctx.font = K.font.display(fs); const nm = P.missing || 'A notable name';
      while (fs > 26 && ctx.measureText(nm).width > bw - 80) { fs -= 2; ctx.font = K.font.display(fs); }
      ctx.fillStyle = '#ffffff'; ctx.fillText(K.typewriter(nm, t, 24, tMiss + 0.3), bx - bw / 2, sy + 92);
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(bx - bw / 2, sy + 116); ctx.lineTo(bx + bw / 2 - 70, sy + 116); ctx.stroke(); ctx.setLineDash([]);
      const xk = clamp((t - tMiss - 0.9) / 0.3);
      if (xk > 0) { ctx.strokeStyle = N.danger; ctx.lineWidth = 9; ctx.lineCap = 'round'; const cx = bx + bw / 2 - 18, cy = sy + 74, r = 22 * xk;
        ctx.beginPath(); ctx.moveTo(cx - r, cy - r); ctx.lineTo(cx + r, cy + r); ctx.moveTo(cx + r, cy - r); ctx.lineTo(cx - r, cy + r); ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();
  }
  // "not a law" pill
  if (t >= tLaw && t < tB + 0.3) { ctx.save(); ctx.globalAlpha = K.fadeOut(t, tB - 0.1, 0.35); K.drawLabel(ctx, bx, by0 - 24, K.popIn(t, tLaw, 0.4), { text: P.notLaw || 'Not a law', size: 32, accent: true }); ctx.restore(); }
  // count pill in beat 2
  if (t >= tB + 0.1 && t < tSplit + 0.2) { ctx.save(); ctx.globalAlpha = K.fadeOut(t, tSplit - 0.2, 0.3); K.drawLabel(ctx, bx, by0 - 24, K.popIn(t, tB + 0.1, 0.4), { text: (P.count || '400+') + ' ' + (P.countLabel || 'scientists'), size: 32, dot: true }); ctx.restore(); }

  // watchdog trots in from the right and sits
  if (t >= tDog) {
    const u = clamp((t - tDog) / 1.1);
    const dx0 = 1150, dx1 = 760;
    const split = K.phase(t, tSplit, tSplit + 0.6);
    const x = lerp(lerp(dx0, dx1, easeOutCubic(u)), 740, split);
    const hop = u < 1 ? -Math.abs(Math.sin(u * Math.PI * 5)) * 16 : 0;
    watchdog(ctx, H, K, x, feet + hop, 1.05 + 0.1 * split, t, ACC, 1);
  }
  // robot with its own clipboard (left) at the split
  if (t >= tSplit) {
    const k = easeOutCubic(clamp((t - tSplit) / 0.6));
    const rx = lerp(-120, 250, k);
    K.drawRobot(ctx, rx, feet - 4, 1.2, { t, state: 'thinking', seed: 12 });
    // clipboard in front of the robot
    ctx.save(); ctx.translate(rx + 40, feet - 150); ctx.rotate(-0.12);
    H.roundRect(ctx, -46, -60, 92, 120, 10); ctx.fillStyle = N.woodS; ctx.fill();
    H.roundRect(ctx, -38, -48, 76, 100, 6); ctx.fillStyle = N.paper; ctx.fill();
    ctx.fillStyle = '#4fb3a6'; for (let i = 0; i < 4; i++) { ctx.fillRect(-28, -34 + i * 22, 12, 12); } ctx.fillStyle = N.paperS; for (let i = 0; i < 4; i++) ctx.fillRect(-10, -31 + i * 22, 38, 6);
    ctx.restore();
    // VS chip between them
    const vp = K.popIn(t, tSplit + 0.5, 0.4);
    if (vp > 0) { ctx.save(); ctx.translate(495, 860); ctx.scale(vp, vp); ctx.fillStyle = '#1c2140'; ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.fillStyle = ACC; ctx.font = K.font.display(40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('OR', 0, 2); ctx.restore(); }
    K.drawLabel(ctx, 250, 700, K.popIn(t, tSplit + 0.2, 0.4), { text: P.left || 'Police themselves', size: 28, dot: true });
    K.drawLabel(ctx, 730, 700, K.popIn(t, tSplit + 0.6, 0.4), { text: P.right || 'Answer to a watchdog', size: 28, dot: true });
  }
  if (t >= tQ) K.drawLabel(ctx, 487, 560, K.popIn(t, tQ, 0.45), { text: P.question || 'WHO WATCHES AI?', size: 44, accent: true });
  ctx.restore();
}

// A friendly cartoon guard dog sitting (anchor bottom-centre), ~150x190 at s = 1. alert 0..1 (ears up, tail wag).
function watchdog(ctx, H, K, x, y, s, t, acc, alert = 1) {
  const N = K.NEUTRAL, fur = '#c98f5a', furS = '#a66e3f', furL = '#e6b88a';
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.shadow(ctx, 0, 0, 170);
  // tail
  const wag = Math.sin(t * (6 + 6 * alert)) * (0.25 + 0.35 * alert);
  ctx.save(); ctx.translate(48, -30); ctx.rotate(-0.9 + wag);
  ctx.strokeStyle = furS; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, -20, 40, -55); ctx.stroke();
  ctx.restore();
  // body (sitting)
  ctx.fillStyle = furS; ctx.beginPath(); ctx.ellipse(10, -48, 56, 50, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = fur; ctx.beginPath(); ctx.ellipse(-8, -70, 42, 62, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = furL; ctx.beginPath(); ctx.ellipse(-18, -70, 22, 40, -0.15, 0, Math.PI * 2); ctx.fill();
  // front legs + paws
  ctx.fillStyle = fur; H.roundRect(ctx, -40, -60, 22, 60, 10); ctx.fill(); H.roundRect(ctx, -8, -60, 22, 60, 10); ctx.fill();
  ctx.fillStyle = furL; H.roundRect(ctx, -44, -12, 30, 14, 7); ctx.fill(); H.roundRect(ctx, -12, -12, 30, 14, 7); ctx.fill();
  // collar + tag (accent)
  ctx.fillStyle = acc; H.roundRect(ctx, -46, -122, 64, 12, 6); ctx.fill();
  ctx.beginPath(); ctx.arc(-14, -102, 10, 0, Math.PI * 2); ctx.fill();
  // head
  const tilt = Math.sin(t * 0.9) * 0.06;
  ctx.save(); ctx.translate(-14, -150); ctx.rotate(tilt);
  const earUp = 0.4 + 0.6 * alert;
  ctx.fillStyle = furS;
  ctx.save(); ctx.translate(-30, -26); ctx.rotate(-0.5 - 0.6 * (1 - earUp)); ctx.beginPath(); ctx.ellipse(0, -18, 13, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(30, -26); ctx.rotate(0.5 + 0.6 * (1 - earUp)); ctx.beginPath(); ctx.ellipse(0, -18, 13, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.fillStyle = fur; ctx.beginPath(); ctx.ellipse(0, 0, 44, 40, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = furL; ctx.beginPath(); ctx.ellipse(-4, 16, 28, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = N.ink; ctx.beginPath(); ctx.ellipse(-4, 6, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
  const blink = ((t + 0.7) % 3.1) < 0.12;
  if (blink) { ctx.fillRect(-26, -12, 12, 3); ctx.fillRect(10, -12, 12, 3); }
  else { ctx.beginPath(); ctx.arc(-20, -11, 6, 0, Math.PI * 2); ctx.arc(16, -11, 6, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = N.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, 13); ctx.lineTo(-4, 22); ctx.moveTo(-14, 26); ctx.quadraticCurveTo(-4, 32, 6, 26); ctx.stroke();
  ctx.restore();
  ctx.restore();
}
