// Scene "teen-guard" (full frame). Night living room: a stylised teen on the sofa with a phone; a big generic chat-app
// phone floats on the right. Nothing graphic: questions and replies are shown as short generic text or grey bars.
// modes:
//  hook   (cold open, 1 beat) the teen's question bubble is up and a shield is already slamming onto the blurred reply
//         at frame 0; a "TEEN LIMITS" pill pops (~0.6 s) and a padlock drops and clicks shut beside the shield (~1.4 s).
//  rules  (best as a 2-beat span) beat 1: the phone shows a "Teen experience" list: row 1 (already limited, red cross
//         + tag), row 2 (practical info) gets a padlock + accent "RESTRICTED" tag on lockCue; a sticker with an arrow
//         ("Even with no sign of violent intent") pops left of the phone on intentCue. Beat 2: the rows fold into one
//         summary pill, a "Still allowed" header and up to 3 tick chips light on allowCues; the teen relaxes.
// params: app ("AI chat"), ask ("Quick question..."), shieldLabel ("TEEN LIMITS"), head ("Teen experience"),
//   row1 ("Harmful requests"), row1Tag ("Already limited"), row2 ("Risky how-to info"),
//   row2Tag ("RESTRICTED"), intent ("Even if the ask seems harmless"), summary ("Risky info: restricted"),
//   allowHead ("Still allowed"), allow (["Calming a situation down", "Finding support", "Reaching a trusted adult"]),
//   cues: alreadyCue, row2Cue, lockCue, intentCue, allowCues [3] (no cue: row 1 at 1.6 s, row 2 at 4.5 s, lock at 45 %)
// Fits: any "an app adds stricter limits for teens / minors, but keeps the help routes open" story.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const mode = P.mode || 'hook';
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const b2 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.6;

  // ---------- world + teen ----------
  ctx.save();
  if (mode === 'hook') K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 500, y: 760 }, { t: D, zoom: 1.0 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 500, y: 730 }]);
  const room = K.world.livingRoomNight(ctx, { t, lampOn: true });
  const TX = 225, TY = room.sofa.feetY;
  let worriedFrom = 0.35, relaxAt = Infinity;
  if (mode === 'rules') { worriedFrom = at(P.lockCue, D * 0.45) - 0.2; relaxAt = b2 + 0.6; }
  const mood = t > relaxAt ? 'happy' : t > worriedFrom ? 'worried' : 'neutral';
  K.drawPerson(ctx, TX, TY, 1.5, { pose: 'sit-phone', seat: false, t, typing: t < worriedFrom ? 1 : 0, mood,
    skin: 2, hair: 2, shirt: '#4f8cff', hairStyle: 'curly', seed: 31, look: 0.7 });
  K.glow(ctx, TX + 14, TY - 205, 70, ACC, 0.25 + 0.08 * Math.sin(t * 4));
  ctx.restore();

  // ---------- the big phone ----------
  const PX0 = 430, PX1 = 905, PY0 = 418, PY1 = 1040, PW = PX1 - PX0;
  const SX0 = PX0 + 12, SX1 = PX1 - 12, SW = SX1 - SX0, cx = (SX0 + SX1) / 2;
  const rx = SX0 + 22, rw = SW - 44;
  ctx.save();
  ctx.translate(0, K.bob(t, 4, 1.1));
  roundRect(ctx, PX0 - 4, PY0 + 10, PW + 8, PY1 - PY0, 46); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
  roundRect(ctx, PX0, PY0, PW, PY1 - PY0, 44); ctx.fillStyle = '#0e1122'; ctx.fill();
  roundRect(ctx, SX0, PY0 + 12, SW, PY1 - PY0 - 24, 34); ctx.fillStyle = '#f2f4fa'; ctx.fill();
  ctx.save(); roundRect(ctx, SX0, PY0 + 12, SW, 74, 34); ctx.clip();
  ctx.fillStyle = '#e1e5f0'; ctx.fillRect(SX0, PY0 + 12, SW, 74); ctx.restore();
  ctx.beginPath(); ctx.arc(SX0 + 40, PY0 + 49, 15, 0, Math.PI * 2); ctx.fillStyle = '#3b4672'; ctx.fill();
  ctx.font = H.font('ui', 27); ctx.fillStyle = '#141829'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(P.app || 'AI chat', SX0 + 66, PY0 + 50);
  if (mode === 'hook') drawHook(); else drawRules();
  ctx.restore();
  if (mode === 'rules') drawSticker();

  // ---------- hook ----------
  function drawHook() {
    const tShield = -0.2, tLock = 1.3;
    // question bubble, already there at frame 0
    const ask = P.ask || 'Quick question...';
    ctx.font = H.font('bold', 28);
    const bw = Math.min(rw, ctx.measureText(ask).width + 48), qy = PY0 + 112;
    roundRect(ctx, SX1 - 22 - bw, qy, bw, 100, 24); ctx.fillStyle = '#4f8cff'; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(ask, SX1 - 22 - bw + 24, qy + 42);
    roundRect(ctx, SX1 - 22 - bw + 24, qy + 60, bw * 0.55, 18, 9); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
    // reply card: grey bars that fade as the shield lands
    const ry = PY0 + 236, rh = 360;
    roundRect(ctx, rx, ry, rw, rh, 24); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#d5dae8'; ctx.stroke();
    const dim = clamp((t - tShield) / 0.6);
    for (let i = 0; i < 7; i++) {
      roundRect(ctx, rx + 28, ry + 34 + i * 44, (rw - 56) * (i % 3 === 2 ? 0.55 : 0.92), 18, 9);
      ctx.fillStyle = rgba('#9aa3bf', 0.8 - 0.6 * dim); ctx.fill();
    }
    // shield slams in
    const land = clamp((t - tShield) / 0.6);
    const scx = cx - 30, scy = ry + rh / 2 + 95;
    if (land > 0) {
      const s = 1 + 1.6 * Math.pow(1 - H.easeOutCubic(clamp(land / 0.7)), 2);
      ctx.save(); ctx.globalAlpha = clamp(land / 0.2);
      K.glow(ctx, scx, scy - 95, 150, ACC, 0.35 * clamp(land));
      K.drawShield(ctx, scx, scy, 1.35 * s, { check: 0, shadow: false });
      ctx.restore();
      const b = (land - 0.7) / 0.3;
      if (b > 0 && b < 1) {
        ctx.strokeStyle = rgba(ACC, 1 - b); ctx.lineWidth = 5; ctx.lineCap = 'round';
        for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, r0 = 125 + 40 * b; ctx.beginPath(); ctx.moveTo(scx + Math.cos(a) * r0, scy - 95 + Math.sin(a) * r0); ctx.lineTo(scx + Math.cos(a) * (r0 + 20), scy - 95 + Math.sin(a) * (r0 + 20)); ctx.stroke(); }
      }
    }
    // padlock drops beside the shield on a dark disc and clicks shut
    if (t > tLock - 0.6) {
      const k = clamp((t - (tLock - 0.6)) / 0.5), drop = 1 - H.easeOutBack(k);
      const lx = scx + 112, ly = scy - 10 - drop * 90;
      ctx.save(); ctx.globalAlpha = clamp(k * 3);
      ctx.beginPath(); ctx.arc(lx, ly - 52, 62, 0, Math.PI * 2); ctx.fillStyle = '#1b2140'; ctx.fill();
      K.drawLock(ctx, lx, ly - 4, 0.8, { open: 1 - clamp((t - tLock) / 0.3), shadow: false });
      ctx.restore();
    }
    const pill = K.popIn(t, 0.55, 0.4);
    if (pill > 0) K.drawLabel(ctx, cx, ry + rh + 70, pill, { text: P.shieldLabel || 'TEEN LIMITS', size: 32, accent: true });
  }

  // ---------- rules ----------
  function drawRules() {
    const tAlready = at(P.alreadyCue, 1.6) - 0.15;
    const tRow2 = at(P.row2Cue, 4.5) - 0.3;
    const tLock = at(P.lockCue, D * 0.45) - 0.15;
    const cues = P.allowCues || [];
    const tAllow = [0, 1, 2].map((i) => at(cues[i], b2 + 1 + i * 1.6) - 0.25);
    const fold = H.phase(t, b2 - 0.15, b2 + 0.55);
    // header
    const hy = PY0 + 100;
    roundRect(ctx, rx, hy, rw, 64, 18); ctx.fillStyle = '#1b2140'; ctx.fill();
    K.drawShield(ctx, rx + 36, hy + 54, 0.32, { shadow: false });
    ctx.font = H.font('ui', 29); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.head || 'Teen experience', rx + 70, hy + 33);

    const top = hy + 84;
    // beat 1 rows (fade out on fold)
    if (fold < 1) {
      ctx.save(); ctx.globalAlpha *= 1 - fold; ctx.translate(0, -30 * fold);
      const r1 = K.popIn(t, 0.15, 0.45);
      let y = top;
      if (r1 > 0) {
        const tg = K.popIn(t, tAlready, 0.4);
        const h = rowCard(y, r1, P.row1 || 'Harmful requests', tg, P.row1Tag || 'Already limited', false);
        badgeX(rx + 42, y + 44, clamp((t - tAlready) / 0.3));
        y += h + 16;
      } else y += 150;
      const r2 = K.popIn(t, tRow2, 0.45);
      if (r2 > 0) {
        const tg = K.popIn(t, tLock + 0.1, 0.4);
        rowCard(y, r2, P.row2 || 'Risky how-to info', tg, P.row2Tag || 'RESTRICTED', true);
        if (t > tLock - 0.5) {
          const drop = 1 - H.easeOutBack(clamp((t - (tLock - 0.5)) / 0.45));
          ctx.save(); ctx.globalAlpha *= clamp((t - (tLock - 0.5)) * 4);
          K.drawLock(ctx, rx + 42, y + 82 - drop * 60, 0.5, { open: 1 - clamp((t - tLock) / 0.3), shadow: false });
          ctx.restore();
        }
      }
      ctx.restore();
    }
    // beat 2: summary pill + still allowed chips
    if (fold > 0) {
      ctx.save(); ctx.globalAlpha *= fold;
      roundRect(ctx, rx, top, rw, 66, 33); ctx.fillStyle = rgba(ACC, 0.25); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
      K.drawLock(ctx, rx + 40, top + 54, 0.38, { open: 0, shadow: false });
      const sz = H.fitText(ctx, P.summary || 'Risky info: restricted', 'bold', 28, 20, rw - 100);
      ctx.font = sz.font; ctx.fillStyle = '#141829'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(sz.text, rx + 78, top + 34);
      ctx.font = H.font('ui', 28); ctx.fillStyle = '#2f9e5b';
      ctx.fillText((P.allowHead || 'Still allowed').toUpperCase(), rx + 6, top + 110);
      ctx.restore();
      const allow = (P.allow || ['Calming a situation down', 'Finding support', 'Reaching a trusted adult']).slice(0, 3);
      allow.forEach((txt, i) => {
        const p = K.popIn(t, tAllow[i], 0.45);
        if (p <= 0) return;
        const y = top + 146 + i * 92;
        ctx.save(); ctx.globalAlpha *= clamp(p * 1.5);
        ctx.translate(cx, y + 38); ctx.scale(0.85 + 0.15 * p, 0.85 + 0.15 * p); ctx.translate(-cx, -(y + 38));
        roundRect(ctx, rx, y, rw, 76, 38); ctx.fillStyle = '#e3f6ea'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = '#2f9e5b'; ctx.stroke();
        ctx.beginPath(); ctx.arc(rx + 40, y + 38, 22, 0, Math.PI * 2); ctx.fillStyle = '#2f9e5b'; ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        K.pathDraw(ctx, [[rx + 29, y + 39], [rx + 37, y + 47], [rx + 51, y + 29]], clamp((t - tAllow[i] - 0.15) / 0.3));
        const fs = H.fitText(ctx, txt, 'bold', 28, 20, rw - 92);
        ctx.font = fs.font; ctx.fillStyle = '#123322'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(fs.text, rx + 76, y + 39);
        ctx.restore();
      });
    }
  }

  // sticker left of the phone (rules, beat 1): "even with no sign of violent intent"
  function drawSticker() {
    const tIntent = at(P.intentCue, D * 0.6) - 0.7;
    const fold = H.phase(t, b2 - 0.15, b2 + 0.55);
    const p = K.popIn(t, tIntent, 0.45);
    if (p <= 0 || fold >= 1) return;
    const x0 = 70, x1 = 402, y0 = 520;
    const lines = H.wrap(ctx, P.intent || 'Even if the ask seems harmless', 'bold', 30, x1 - x0 - 44);
    const h = 36 + lines.length * 38;
    ctx.save(); ctx.globalAlpha = clamp(p * 1.5) * (1 - fold);
    ctx.translate((x0 + x1) / 2, y0 + h / 2); ctx.rotate(-0.03); ctx.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p); ctx.translate(-(x0 + x1) / 2, -(y0 + h / 2));
    roundRect(ctx, x0, y0, x1 - x0, h, 22); ctx.fillStyle = ACC; ctx.fill();
    ctx.beginPath(); ctx.moveTo(x1 - 8, y0 + h * 0.4); ctx.lineTo(x1 + 34, y0 + h * 0.62); ctx.lineTo(x1 - 8, y0 + h * 0.8); ctx.closePath(); ctx.fill();
    ctx.font = H.font('bold', 30); ctx.fillStyle = '#141829'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    lines.forEach((ln, i) => ctx.fillText(ln, x0 + 22, y0 + 46 + i * 38));
    ctx.restore();
  }

  // ---------- helpers ----------
  function rowCard(y, p, text, tagP, tagText, accent) {
    const size = 28, lines = H.wrap(ctx, text, 'bold', size, rw - 104).slice(0, 3);
    const h = 26 + lines.length * 34 + 58;
    ctx.save(); ctx.globalAlpha *= clamp(p * 1.5);
    roundRect(ctx, rx, y, rw, h, 20); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#d5dae8'; ctx.stroke();
    ctx.font = H.font('bold', size); ctx.fillStyle = '#141829'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    lines.forEach((ln, i) => ctx.fillText(ln, rx + 84, y + 50 + i * 34));
    if (tagP > 0) {
      ctx.font = H.font('ui', 24);
      const w = ctx.measureText(tagText).width + 36, th = 40, tx = rx + 84 + w / 2, ty = y + h - 34;
      ctx.save(); ctx.translate(tx, ty); ctx.scale(tagP, tagP);
      roundRect(ctx, -w / 2, -th / 2, w, th, th / 2); ctx.fillStyle = accent ? ACC : '#3b4672'; ctx.fill();
      ctx.fillStyle = accent ? '#141829' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(tagText, 0, 1);
      ctx.restore();
    }
    ctx.restore();
    return h;
  }
  function badgeX(x, y, p) {
    if (p <= 0) return;
    const k = H.easeOutBack(p);
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fillStyle = '#e5484d'; ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-9, -9); ctx.lineTo(9, 9); ctx.moveTo(9, -9); ctx.lineTo(-9, 9); ctx.stroke();
    ctx.restore();
  }
}
