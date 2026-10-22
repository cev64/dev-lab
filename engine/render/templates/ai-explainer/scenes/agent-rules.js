// Scene "agent-rules" (full frame, 1 beat, ~8-12 s). Night store interior seen as three lit display windows, each
// acting out one house rule for AI shopping agents on its cue:
// (1) "card": a payment card sits in a locked glass case with masked digits; a robot reaches, its hand bonks off the glass;
// (2) "returns": a wrong parcel lands by a robot, it shrugs, the parcel rides a curved arrow back into a returns box;
// (3) "blocked": a rule-breaking robot (red visor) sneaks past a rule sign and a barrier drops with a BLOCKED stamp.
// Each window gets a pill. Ends settled (everything still).
// Fits: "the rules/safeguards for AI agents", "agents can't see your card", "returns still apply", "bad bots get banned".
// params: card ("No card number"), returns ("Returns apply"), blocked ("Rule-breakers out"), stamp ("BLOCKED"),
//         (the card shows masked dots only, never digits), cues ("word#n"; without them fractions):
//         cardCue, wrongCue, returnsCue, breakCue, blockCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tCard = at(P.cardCue, D * 0.12) - 0.4;
  const tWrong = at(P.wrongCue, D * 0.36) - 0.3;
  const tRet = at(P.returnsCue, D * 0.52) - 0.2;
  const tBreak = at(P.breakCue, D * 0.72) - 0.5;
  const tBlock = at(P.blockCue, D * 0.9) - 0.25;
  const RED = '#ff6b5e', GREEN = '#3fbf7f';

  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 740 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 1000 });

  const cols = [{ x: 205, t: tCard }, { x: 487, t: tWrong }, { x: 769, t: tBreak }];
  const top = 470, bot = 1000, W = 262;
  cols.forEach((c, i) => {
    const k = smooth((t - c.t + 0.4) / 0.5);
    roundRect(ctx, c.x - W / 2, top, W, bot - top, 20); ctx.fillStyle = rgba('#141830', 0.92); ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(i === 2 ? RED : ACC, 0.25 + 0.6 * k); ctx.stroke();
    if (k > 0) K.glow(ctx, c.x, 760, 180, i === 2 ? RED : ACC, 0.12 * k);
  });
  const feet = 985;

  // ---- 1: card in a glass case ----
  {
    const x = 205, k = K.popIn(t, tCard - 0.2, 0.5);
    if (k > 0) {
      ctx.save(); ctx.translate(x + 30, 640); ctx.scale(Math.min(1.03, k), Math.min(1.03, k));
      // case
      roundRect(ctx, -80, -70, 160, 140, 14); ctx.fillStyle = 'rgba(160,200,255,0.12)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(200,225,255,0.7)'; ctx.stroke();
      // card
      roundRect(ctx, -60, -38, 120, 76, 10); ctx.fillStyle = '#4f8fd6'; ctx.fill();
      roundRect(ctx, -46, -24, 26, 20, 4); ctx.fillStyle = '#d9c27a'; ctx.fill();
      ctx.fillStyle = '#ffffff'; for (let g = 0; g < 3; g++) for (let d = 0; d < 3; d++) { ctx.beginPath(); ctx.arc(-44 + g * 34 + d * 8, 18, 3, 0, Math.PI * 2); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-70, -60, 14, 120);
      ctx.restore();
      K.drawLock(ctx, x + 30 + 70, 640 + 60, 0.45, { open: 0 });
    }
    // robot reaching, bonk
    const reach = K.phase(t, tCard, tCard + 0.4, K.easeOutCubic) - K.phase(t, tCard + 0.5, tCard + 0.9);
    const bonk = K.shake(t, tCard + 0.4, 0.35, 5);
    K.drawRobot(ctx, x - 50 + reach * 12 + bonk, feet, 0.9, { t, state: t > tCard + 0.5 ? 'thinking' : 'idle', seed: 4 });
    if (reach > 0.05) {
      ctx.strokeStyle = '#e9edf6'; ctx.lineWidth = 12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x - 10, 880); ctx.lineTo(x - 10 + 50 * reach, 880 - 140 * reach); ctx.stroke();
    }
    const bk = clamp(1 - Math.abs(t - tCard - 0.45) / 0.25);
    if (bk > 0) { ctx.strokeStyle = rgba('#ffffff', bk); ctx.lineWidth = 4; for (let j = 0; j < 5; j++) { const a = -2.2 + j * 0.5; ctx.beginPath(); ctx.moveTo(x - 50 + Math.cos(a) * 30, 715 + Math.sin(a) * 30); ctx.lineTo(x - 50 + Math.cos(a) * 52, 715 + Math.sin(a) * 52); ctx.stroke(); } }
    if (t > tCard + 0.3) K.drawLabel(ctx, x, 540, Math.min(1.05, K.popIn(t, tCard + 0.3, 0.4)), { text: P.card || 'No card number', size: 26, accent: true });
  }

  // ---- 2: wrong parcel goes back ----
  {
    const x = 487;
    const drop = K.phase(t, tWrong, tWrong + 0.45, (u) => u * u);
    const back = K.phase(t, tRet, tRet + 0.9, H.easeInOutCubic);
    K.drawRobot(ctx, x - 55, feet, 0.9, { t, state: t > tRet + 0.8 ? 'happy' : 'idle', seed: 5 });
    // returns box (right)
    const bx = x + 75;
    roundRect(ctx, bx - 52, 900, 104, 85, 8); ctx.fillStyle = '#7a5a3a'; ctx.fill();
    ctx.fillStyle = '#5e432a'; ctx.fillRect(bx - 58, 892, 116, 16);
    ctx.fillStyle = '#f2e3c6'; ctx.font = H.font('ui', 20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('RETURNS', bx, 945);
    // return arrow
    if (t > tRet - 0.1) {
      const ak = smooth((t - tRet + 0.1) / 0.4);
      ctx.save(); ctx.globalAlpha = ak; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 30;
      ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 20, 780); ctx.quadraticCurveTo(x + 30, 660, bx, 860); ctx.stroke(); ctx.restore();
    }
    if (t > tWrong - 0.05) {
      // parcel: falls next to the robot, then arcs into the box
      const sx0 = x - 10, sy0 = lerp(560, 800, drop);
      let px = sx0, py = sy0, rot = 0.3 * (1 - drop);
      if (back > 0) { px = lerp(sx0, bx, back); py = lerp(800, 880, back) - Math.sin(back * Math.PI) * 170; rot = back * 3; }
      const vis = 1 - smooth((back - 0.85) / 0.15);
      if (vis > 0.02) {
        ctx.save(); ctx.globalAlpha = vis; ctx.translate(px, py); ctx.rotate(rot);
        roundRect(ctx, -36, -30, 72, 60, 6); ctx.fillStyle = '#c99a5b'; ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,0.2)'; ctx.fillRect(-4, -30, 8, 60);
        ctx.fillStyle = RED; ctx.font = H.font('display', 36); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        if (back <= 0) ctx.fillText('?', 0, 2);
        ctx.restore();
      }
      if (drop >= 1 && back <= 0) { const q = K.popIn(t, tWrong + 0.5, 0.35); if (q > 0) K.drawSpeechBubble(ctx, x - 55, 770, Math.min(1, q), { text: 'Oops', size: 26, tail: 'center', pop: Math.min(1, q) }); }
    }
    if (t > tRet + 0.3) K.drawLabel(ctx, x, 540, Math.min(1.05, K.popIn(t, tRet + 0.3, 0.4)), { text: P.returns || 'Returns apply', size: 26, accent: true });
  }

  // ---- 3: rule-breaker gets blocked ----
  {
    const x = 769;
    // rule sign
    ctx.fillStyle = '#5a6496'; ctx.fillRect(x + 88, 760, 8, 225);
    roundRect(ctx, x + 40, 690, 104, 80, 10); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = '#283152'; ctx.font = H.font('ui', 20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('RULES', x + 92, 712);
    ctx.fillStyle = '#b9c1d6'; ctx.fillRect(x + 56, 734, 72, 8); ctx.fillRect(x + 56, 750, 50, 8);
    // sneaking robot
    const sneak = smooth(clamp((t - tBreak) / Math.max(0.6, tBlock - tBreak)));
    const pushBack = smooth((t - tBlock - 0.1) / 0.4) * 40;
    const rx = lerp(x - 160, x - 30, sneak) - pushBack + K.shake(t, tBlock + 0.1, 0.35, 5);
    if (t > tBreak - 0.3) {
      const a = smooth((t - tBreak + 0.3) / 0.4);
      ctx.save(); ctx.globalAlpha = a;
      ctx.beginPath(); ctx.rect(x - W / 2 + 4, top, W - 8, bot - top); ctx.clip();
      K.drawRobot(ctx, rx, feet - (sneak < 1 ? Math.abs(Math.sin(t * 7)) * 4 : 0), 0.9, { t, state: t > tBlock + 0.2 ? 'thinking' : 'working', seed: 9 });
      // red visor tint = rule-breaker
      ctx.fillStyle = rgba(RED, 0.45); roundRect(ctx, rx - 40, feet - 178, 80, 34, 12); ctx.fill();
      ctx.restore();
    }
    // barrier drops
    const bar = K.phase(t, tBlock - 0.1, tBlock + 0.25, K.easeOutBack);
    if (bar > 0) {
      ctx.save(); ctx.translate(x + 30, 800); ctx.rotate(lerp(-Math.PI / 2, 0, bar));
      for (let s = 0; s < 4; s++) { ctx.fillStyle = s % 2 ? '#ffffff' : RED; ctx.fillRect(-100 + s * 25 - 0, -10, 25, 20); }
      ctx.restore();
      ctx.fillStyle = '#3a3f5a'; ctx.fillRect(x + 22, 800, 16, 185);
    }
    const st = (t - tBlock - 0.15) / 0.5;
    if (st > 0) K.drawStamp(ctx, x, 1000, 0.6, { kind: 'cross', text: P.stamp || 'BLOCKED', land: st });
    if (t > tBlock + 0.2) K.drawLabel(ctx, x, 540, Math.min(1.05, K.popIn(t, tBlock + 0.2, 0.4)), { text: P.blocked || 'Rule-breakers out', size: 26 });
  }
}
