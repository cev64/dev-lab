// Scene "guard-refuses" (full frame, one beat). Server hall at night: three AI guard robots with shields watch the
// systems around the clock (racing clock + "24/7" pill). A red crate marked only with a warning sign ("Bad code";
// no real code is ever shown) rolls in. On the refuse cue the robots cross their arms and turn away ("Can't look at
// that"), then a glowing safety rail drops between them and the crate. On the program cue a badge card flies in,
// lands on the middle robot, the rail fades for it, and it walks over and scans the crate (shield + check).
// Fits: "AI safety filters blocked defenders", AI refusals, trusted-access programs for security teams.
// Defaults are generic ("Program: vetted defenders"): pass the story's program / company name as text.
// params (all optional): agents, clock, crate, bubble, rail, program, badge
//        cues: agentsCue, clockCue, crateCue, refuseCue, railCue, programCue, badgeCue, doneCue (narration words,
//        "word#n" = the (n+1)th time; without them fractions of the scene)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent, RED = '#ff6b5e', N = K.NEUTRAL;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tAgents = at(P.agentsCue, D * 0.2), tClock = at(P.clockCue, D * 0.28);
  const tCrate = at(P.crateCue, tClock + 0.9), tRefuse = at(P.refuseCue, D * 0.45);
  const tRail = at(P.railCue, D * 0.6), tProg = at(P.programCue, D * 0.73);
  const tBadge = at(P.badgeCue, D * 0.84), tDone = at(P.doneCue, D * 0.93);
  const feet = 1010, crX = 790, railX = 655;

  const pill = (text, x, y, a, b, o = {}) => {
    if (t < a || t > b + 0.35) return;
    ctx.save(); ctx.globalAlpha = K.fadeOut(t, b, 0.35);
    K.drawLabel(ctx, x, y, K.popIn(t, a, 0.4), { text, size: o.size || 28, dot: !o.accent, accent: o.accent });
    ctx.restore();
  };

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tRefuse - 0.3, zoom: 1.0 }, { t: tRefuse + 0.6, zoom: 1.06, x: 470, y: 790 }, { t: tProg, zoom: 1.06, x: 470, y: 790 }, { t: tProg + 0.8, zoom: 1.0 }, { t: D, zoom: 1.03 }]);
  K.world.serverHall(ctx, { t, activity: t > tCrate ? 0.9 : 0.5 });
  ctx.fillStyle = 'rgba(8,10,24,0.35)'; ctx.fillRect(0, 0, 1080, 1920);

  // racing clock + 24/7
  const clockK = K.popIn(t, tClock - 0.2, 0.45);
  if (clockK > 0 && t < tRail + 0.4) {
    ctx.save(); ctx.globalAlpha = K.fadeOut(t, tRail, 0.4);
    ctx.save(); ctx.translate(800, 640); ctx.scale(clockK, clockK); ctx.translate(-800, -640);
    K.drawClock(ctx, 800, 690, 1.0, { t, speed: 6 });
    ctx.restore();
    K.drawLabel(ctx, 800, 548, clockK, { text: P.clock || '24/7', size: 30, accent: true });
    ctx.restore();
  }

  // the crate on a dolly (rolls in from the right)
  const roll = K.phase(t, tCrate - 0.6, tCrate + 0.6, easeOutCubic);
  const cx = lerp(1250, crX, roll);
  if (roll > 0) {
    K.shadow(ctx, cx, feet + 25, 220);
    H.roundRect(ctx, cx - 105, feet + 2, 210, 14, 6); ctx.fillStyle = '#3b4260'; ctx.fill();
    for (const wx of [-80, 80]) { ctx.beginPath(); ctx.arc(cx + wx, feet + 22, 12, 0, Math.PI * 2); ctx.fillStyle = '#161927'; ctx.fill(); }
    const pulse = 0.5 + 0.5 * Math.sin(t * 6);
    K.glow(ctx, cx, feet - 80, 160, RED, 0.25 + 0.15 * pulse);
    H.roundRect(ctx, cx - 95, feet - 160, 190, 162, 10); ctx.fillStyle = '#7a2e2e'; ctx.fill();
    ctx.strokeStyle = '#5a1f22'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(cx - 95, feet - 160); ctx.lineTo(cx + 95, feet); ctx.moveTo(cx + 95, feet - 160); ctx.lineTo(cx - 95, feet); ctx.stroke();
    K.drawWarning(ctx, cx, feet - 30, 0.85, { pulse });
    pill(P.crate || 'Bad code', cx, feet - 178, tCrate + 0.2, D, { size: 26 });
  }

  // safety rail (drops in, fades for the badged robot)
  const railK = K.phase(t, tRail - 0.3, tRail + 0.3, K.easeOutBack);
  const railFade = 1 - 0.7 * K.phase(t, tBadge + 0.3, tBadge + 0.9);
  if (railK > 0) {
    ctx.save(); ctx.globalAlpha = railFade;
    const top = lerp(560, 790, railK);
    K.glow(ctx, railX, top + 110, 160, ACC, 0.25);
    H.roundRect(ctx, railX - 14, top, 28, feet - top, 10); ctx.fillStyle = H.rgba(ACC, 0.35); ctx.fill();
    ctx.strokeStyle = ACC; ctx.lineWidth = 4; H.roundRect(ctx, railX - 14, top, 28, feet - top, 10); ctx.stroke();
    for (let i = 0; i < 3; i++) { ctx.fillStyle = ACC; ctx.fillRect(railX - 60, top + 30 + i * 70, 120, 10); }
    ctx.restore();
    pill(P.rail || 'Safety guardrails', railX + 50, top - 70, tRail, tBadge + 0.2, { size: 28, accent: true });
  }

  // robots
  const xs = [165, 345, 525], RS = 1.22;
  const refusing = t > tRefuse && t < tBadge + 0.4;
  const walk = K.phase(t, tBadge + 0.4, tDone - 0.2);
  xs.forEach((x0, i) => {
    const mid = i === 2;
    const x = mid ? lerp(x0, crX - 170, walk) : x0;
    const turned = t > tRefuse + 0.2 && !(mid && t > tBadge + 0.3);
    const crossed = t > tRefuse && !(mid && t > tBadge + 0.3);
    K.drawShield(ctx, x - 80, feet - 6, 0.62, { check: mid && t > tDone ? clamp((t - tDone) / 0.4) : 0 });
    K.drawRobot(ctx, x, feet + (mid && walk > 0 && walk < 1 ? -Math.abs(Math.sin(t * 9)) * 6 : 0), RS,
      { t, state: mid && t > tBadge + 0.3 ? 'working' : crossed ? 'idle' : t > tCrate ? 'thinking' : 'idle', flip: turned, seed: 3 + i });
    if (crossed) {
      // crossed arms over the chest
      const k = K.phase(t, tRefuse, tRefuse + 0.3);
      ctx.save(); ctx.translate(x, feet - 135); ctx.scale(k, k);
      for (const r of [0.45, -0.45]) { ctx.save(); ctx.rotate(r); H.roundRect(ctx, -56, -12, 112, 24, 12); ctx.fillStyle = '#c3c9dc'; ctx.fill(); ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore(); }
      ctx.restore();
      // red "no" sign over the head
      const nk = K.popIn(t, tRefuse + 0.05 + i * 0.12, 0.35);
      ctx.save(); ctx.translate(x, feet - 312); ctx.scale(nk, nk);
      ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.strokeStyle = RED; ctx.lineWidth = 7; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-15, 15); ctx.lineTo(15, -15); ctx.stroke();
      ctx.restore();
    }
    if (mid && t > tBadge + 0.2) {
      // badge on the chest
      ctx.save(); ctx.translate(x - 4, feet - 140);
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
      ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-2, 7); ctx.lineTo(9, -7); ctx.stroke();
      ctx.restore();
    }
    if (mid && t > tDone - 0.3) {
      // scanning beam onto the crate
      ctx.save(); ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 8); ctx.fillStyle = ACC;
      ctx.beginPath(); ctx.moveTo(x + 50, feet - 200); ctx.lineTo(crX - 95, feet - 150); ctx.lineTo(crX - 95, feet - 10); ctx.closePath(); ctx.fill(); ctx.restore();
    }
  });
  // speech bubble from the middle robot
  if (t > tRefuse + 0.15 && t < tRail - 0.1) {
    ctx.save(); ctx.globalAlpha = K.fadeOut(t, tRail - 0.4, 0.3);
    K.drawSpeechBubble(ctx, 525, feet - 345, 1, { text: P.bubble || "Can't look at that", size: 30, tail: 'center', pop: K.popIn(t, tRefuse + 0.15, 0.35) });
    ctx.restore();
  }
  // badge card flies in from the top and lands on the middle robot
  if (t > tProg - 0.1 && t < tBadge + 0.3) {
    const u = K.phase(t, tBadge - 0.5, tBadge + 0.2, easeOutCubic);
    const k = K.popIn(t, tProg - 0.1, 0.4) * (1 - 0.7 * u);
    const x = lerp(487, xs[2] - 4, u), y = lerp(640, feet - 140, u);
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    H.roundRect(ctx, -90, -60, 180, 120, 16); ctx.fillStyle = ACC; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -8, 30, 0, Math.PI * 2); ctx.fillStyle = '#2a2f45'; ctx.fill();
    ctx.strokeStyle = ACC; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(-13, -8); ctx.lineTo(-3, 4); ctx.lineTo(15, -18); ctx.stroke();
    ctx.fillStyle = '#2a2f45'; ctx.font = K.font.ui(20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.badge || 'VETTED', 0, 40);
    ctx.restore();
  }
  pill(P.agents || 'AI defense agents', 400, 500, tAgents - 0.1, tRefuse - 0.2, { size: 30 });
  pill(P.program || 'Program: vetted defenders', 487, 500, tProg + 0.4, D, { size: 30, accent: true });
  ctx.restore();
}
