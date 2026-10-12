// Scene "lectern-warning" (full frame). A conference hall: a big screen, an empty spot-lit lectern with a microphone
// (no speaker is drawn: real people are named in text only), audience heads in the foreground.
// The screen fills in event / place and a date pill at their cues, then shows the speaker's role + name as text;
// at `warnCue` the mic sends sound arcs and a warning chip lands; with `grads` mortarboards pop onto some audience
// heads at `gradCue`.
// params (all optional): event (default "ANNUAL SUMMIT"), place (default "THE CAPITAL"), date (default "THIS WEEK"),
//         role (default "Keynote speaker"), name (default "A senior official"; a real person's name as plain text
//         only), warning (default "A warning about jobs"; a real quote only verbatim and attributed),
//         grads (default false: mortarboards on the audience, for graduate/student stories)
//         cues (narration words; else % of the scene): dateCue (0.3 s), eventCue (12 %), placeCue (30 %),
//         nameCue (45 %), warnCue (65 %), gradCue (88 %)
// Fits: any "X said at a conference / summit / hearing" beat where the speaker must not be drawn.
// (Promoted from 2026-10-12 first-jobs; that story used dateCue "monday", eventCue "imf", placeCue "bangkok",
//  nameCue "singapore's", warnCue "warned", gradCue "graduates", grads true.)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent;
  const cue = (w, fb) => { const v = w != null ? info.timeOf(w) : null; return v != null ? v : fb; };
  const dateAt = cue(P.dateCue, 0.3);
  const eventAt = cue(P.eventCue, D * 0.12);
  const placeAt = cue(P.placeCue, D * 0.3);
  const nameAt = cue(P.nameCue, D * 0.45);
  const warnAt = cue(P.warnCue, D * 0.65);
  const gradAt = cue(P.gradCue, D * 0.88);
  const EVENT = P.event || 'ANNUAL SUMMIT', NAME = P.name || 'A senior official';

  // camera: wide, then a slow push towards the lectern once the warning comes
  ctx.save();
  const push = K.phase(t, warnAt - 0.6, warnAt + 1.2);
  K.camera(ctx, t, [{ t: 0, zoom: lerp(1.0, 1.04, clamp(t / D)) + 0.06 * push, x: 487, y: lerp(740, 780, push) }]);

  // hall backdrop
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#11163a'); g.addColorStop(0.5, '#1b2150'); g.addColorStop(1, '#090b1a');
  ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, 2320);
  // wall panels
  for (let i = 0; i < 7; i++) { H.roundRect(ctx, -40 + i * 170, 300, 140, 560, 10); ctx.fillStyle = i % 2 ? '#1e2558' : '#222a62'; ctx.fill(); }
  // stage floor
  ctx.fillStyle = '#2a2350'; ctx.fillRect(-200, 860, 1480, 60); ctx.fillStyle = '#3a3170'; ctx.fillRect(-200, 860, 1480, 8);
  ctx.fillStyle = '#120f26'; ctx.fillRect(-200, 920, 1480, 1200);

  // big screen
  const sx = 140, sy = 425, sw = 694, sh = 235;
  H.roundRect(ctx, sx - 12, sy - 12, sw + 24, sh + 24, 18); ctx.fillStyle = '#0a0c1c'; ctx.fill();
  const sg = ctx.createLinearGradient(0, sy, 0, sy + sh); sg.addColorStop(0, '#24306e'); sg.addColorStop(1, '#151b44');
  H.roundRect(ctx, sx, sy, sw, sh, 10); ctx.fillStyle = sg; ctx.fill();
  // soft moving light on the screen
  ctx.save(); H.roundRect(ctx, sx, sy, sw, sh, 10); ctx.clip();
  K.glow(ctx, sx + sw * (0.3 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.5))), sy + sh * 0.4, 260, ACC, 0.08);
  ctx.restore();
  const showName = t >= nameAt;
  const cx0 = sx + sw / 2;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  if (!showName) {
    const ep = clamp((t - eventAt) / 0.4);
    if (ep > 0) {
      ctx.globalAlpha = ep; ctx.fillStyle = '#ffffff';
      fit(ctx, K, EVENT, 'display', 46, sw - 70); ctx.fillText(EVENT, cx0, sy + 112 - 14 * (1 - ep));
      ctx.globalAlpha = 1;
    }
    const pp = clamp((t - placeAt) / 0.4);
    if (pp > 0) {
      ctx.globalAlpha = pp; ctx.fillStyle = ACC; ctx.font = K.font.display(56);
      ctx.fillText(P.place || 'THE CAPITAL', cx0, sy + 180 - 14 * (1 - pp)); ctx.globalAlpha = 1;
    }
  } else {
    const np = clamp((t - nameAt) / 0.45);
    ctx.globalAlpha = np;
    ctx.font = K.font.ui(34); ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText(P.role || 'Keynote speaker', cx0, sy + 92);
    ctx.fillStyle = '#ffffff'; fit(ctx, K, NAME, 'display', 50, sw - 60);
    ctx.fillText(NAME, cx0, sy + 160);
    ctx.fillStyle = ACC; ctx.fillRect(cx0 - 120 * np, sy + 178, 240 * np, 6);
    ctx.globalAlpha = 1;
  }

  // spotlight cone onto the lectern
  const LX = 487, LY = 1030, LS = 1.05;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const cg = ctx.createLinearGradient(0, 200, 0, LY); cg.addColorStop(0, 'rgba(255,240,200,0.0)'); cg.addColorStop(1, 'rgba(255,240,200,0.10)');
  ctx.beginPath(); ctx.moveTo(LX - 40, 200); ctx.lineTo(LX + 40, 200); ctx.lineTo(LX + 230, LY); ctx.lineTo(LX - 230, LY); ctx.closePath(); ctx.fillStyle = cg; ctx.fill();
  ctx.restore();
  ctx.save(); ctx.translate(LX, LY); ctx.scale(1, 0.16); K.glow(ctx, 0, 0, 260, '#fff0c8', 0.25); ctx.restore();

  K.drawLectern(ctx, LX, LY, LS, {});
  const top = LY - 232 * LS;
  // microphone on a gooseneck
  ctx.strokeStyle = '#2b2f44'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(LX + 40, top + 6); ctx.quadraticCurveTo(LX + 50, top - 50, LX + 18, top - 72); ctx.stroke();
  ctx.save(); ctx.translate(LX + 14, top - 78); ctx.rotate(-0.7);
  H.roundRect(ctx, -14, -24, 28, 40, 13); ctx.fillStyle = '#3c4260'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; for (let i = 0; i < 3; i++) ctx.fillRect(-9, -16 + i * 9, 18, 3);
  ctx.restore();
  // sound arcs after the warning (driven by narration loudness)
  if (t > warnAt) {
    const k = clamp((t - warnAt) / 0.4);
    ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 1.3 + i / 3) % 1);
      ctx.strokeStyle = H.rgba(ACC, k * (1 - ph) * (0.5 + 0.5 * info.env)); ctx.lineWidth = 5;
      for (const side of [-1, 1]) { ctx.beginPath(); ctx.arc(LX + 6, top - 80, 24 + ph * 52, side < 0 ? Math.PI * 1.05 : -0.55, side < 0 ? Math.PI * 1.55 : -0.05); ctx.stroke(); }
    }
    ctx.restore();
  }

  // audience heads in the foreground (backs of heads, generic)
  const heads = [[110, 1030, 1.0], [260, 1050, 1.1], [420, 1040, 0.95], [600, 1055, 1.12], [760, 1035, 1.0], [930, 1050, 1.08]];
  const grads = !!P.grads;
  heads.forEach(([hx, hy, hs], i) => {
    const bob = Math.sin(t * 1.2 + i * 1.7) * 2;
    ctx.save(); ctx.translate(hx, hy + bob); ctx.scale(hs, hs);
    H.roundRect(ctx, -70, -20, 140, 120, 50); ctx.fillStyle = '#0b0d1d'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -52, 42, 0, Math.PI * 2); ctx.fillStyle = ['#2a211e', '#5b3b25', '#1d2236', '#3a2a22'][i % 4]; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -52, 42, 0, Math.PI * 2); ctx.fillStyle = 'rgba(8,10,24,0.45)'; ctx.fill();
    if (grads && i % 2 === 1) {
      const cp = K.popIn(t, gradAt + i * 0.08, 0.45);
      if (cp > 0) {
        ctx.save(); ctx.translate(0, -88 - 30 * (1 - Math.min(1, cp))); ctx.scale(cp, cp);
        ctx.fillStyle = '#1a1d33'; ctx.fillRect(-26, 0, 52, 14);
        ctx.beginPath(); ctx.moveTo(-52, 0); ctx.lineTo(0, -16); ctx.lineTo(52, 0); ctx.lineTo(0, 12); ctx.closePath(); ctx.fillStyle = '#2b3060'; ctx.fill();
        ctx.strokeStyle = ACC; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(36, 2); ctx.lineTo(38, 28); ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
  });
  ctx.restore(); // camera

  // overlays (screen space)
  const dp = K.popIn(t, dateAt, 0.45);
  if (dp > 0 && t < nameAt + 0.2) K.drawLabel(ctx, 487, 760, dp * (1 - K.phase(t, nameAt - 0.2, nameAt + 0.2)), { text: P.date || 'THIS WEEK', size: 26, dot: true });
  const wp = K.popIn(t, warnAt + 0.15, 0.5);
  if (wp > 0) {
    K.drawWarning(ctx, 120, 795, 0.62 * wp, { pulse: 0.5 + 0.5 * Math.sin(t * 5) });
    K.drawLabel(ctx, 530, 795, wp, { text: P.warning || 'A warning about jobs', size: 34, accent: true });
  }
}

function fit(ctx, K, text, kind, size, maxW) {
  let fs = size; ctx.font = K.font[kind](fs);
  while (fs > 22 && ctx.measureText(text).width > maxW) { fs -= 2; ctx.font = K.font[kind](fs); }
}
