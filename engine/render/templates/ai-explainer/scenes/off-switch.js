// Scene "off-switch" (full frame, 1 beat). Night office. First a support-reply card (headset icon) states what support
// called the behaviour plus a small tag; then a date chip pops and an admin settings panel slides up with one new row
// (`setting`) whose toggle sits ON; on switchCue the row glows with a NEW tag, on defaultCue an "On by default" pill
// lands by the toggle and a cursor hovers over it without flipping it. A cartoon admin and the kit robot look on.
// Fits: "the company called it a feature", "an off switch arrived, but it's on by default", opt-out settings.
// params (all optional): head ("Support reply"), says ("Built-in background check-ins"), tag ("By design"),
//        date ("Nov 12"), panel ("Admin settings"), setting ("Proactive messages"), sub ("Bots check in on their own"),
//        isNew ("NEW"), deflt ("On by default"), cues: supportCue, dateCue, switchCue, defaultCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tSup = Math.max(0.05, at(P.supportCue, 0.6) - 0.4);
  const tDate = Math.max(tSup + 1.5, at(P.dateCue, D * 0.48) - 0.4);
  const tSw = Math.max(tDate + 0.8, at(P.switchCue, D * 0.7) - 0.4);
  const tDef = Math.max(tSw + 0.6, Math.min(D - 0.7, at(P.defaultCue, D * 0.88) - 0.5));

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 487, y: 720 }, { t: tDate, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 540, y: 700 }]);
  K.world.office(ctx, { t, time: 'night' });

  // characters (bottom)
  const pointing = t > tSw;
  K.drawPerson(ctx, 175, 1035, 1.15, { t, pose: pointing ? 'point' : 'stand', mood: t > tDef ? 'worried' : 'neutral', skin: 3, hair: 1, shirt: 1, hairStyle: 'bun', look: 0.5, seed: 31 });
  K.drawRobot(ctx, 800, 1035, 0.85, { t, state: t > tSup && t < tDate ? 'happy' : 'idle', flip: true, seed: 4 });

  // ---- support card (phase 1)
  const sIn = K.popIn(t, tSup, 0.45), sOut = smooth(clamp((t - tDate + 0.2) / 0.4));
  if (sIn > 0 && sOut < 1) {
    ctx.save(); ctx.globalAlpha = 1 - sOut;
    ctx.translate(487, 640 - 80 * sOut); ctx.scale(sIn * (1 - 0.2 * sOut), sIn * (1 - 0.2 * sOut));
    const W = 640, Hh = 250;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; H.roundRect(ctx, -W / 2 + 8, -Hh / 2 + 10, W, Hh, 26); ctx.fill();
    H.roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 26); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    H.roundRect(ctx, -W / 2, -Hh / 2, W, 70, 26); ctx.fillStyle = '#1b2140'; ctx.fill(); ctx.fillRect(-W / 2, -Hh / 2 + 40, W, 30);
    // headset icon
    ctx.save(); ctx.translate(-W / 2 + 46, -Hh / 2 + 36); ctx.strokeStyle = ACC; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 2, 18, Math.PI, 0); ctx.stroke(); ctx.fillStyle = ACC;
    H.roundRect(ctx, -24, 0, 10, 18, 4); ctx.fill(); H.roundRect(ctx, 14, 0, 10, 18, 4); ctx.fill(); ctx.restore();
    ctx.font = H.font('ui', 28); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.head || 'Support reply', -W / 2 + 84, -Hh / 2 + 36);
    const says = P.says || 'Built-in background check-ins';
    const lines = H.wrap(ctx, says, 'display', 44, W - 70);
    ctx.font = H.font('display', 44); ctx.fillStyle = '#141829'; ctx.textAlign = 'center';
    lines.forEach((ln, i) => ctx.fillText(ln, 0, -10 + i * 52 - (lines.length - 1) * 20));
    const tagP = K.popIn(t, tSup + 0.6, 0.35);
    if (tagP > 0) K.drawLabel(ctx, 0, Hh / 2 - 16, tagP, { text: P.tag || 'By design', size: 24, accent: true });
    ctx.restore();
  }

  // ---- date chip + admin panel (phase 2)
  const dP = K.popIn(t, tDate, 0.4);
  if (dP > 0) K.drawLabel(ctx, 487, 505, dP, { text: P.date || 'Nov 12', size: 30, accent: true, dot: false });
  const pIn = smooth(clamp((t - tDate - 0.15) / 0.5));
  if (pIn > 0) {
    const X0 = 170, X1 = 805, Y0 = 545 + (1 - pIn) * 120, PH = 270;
    ctx.save(); ctx.globalAlpha = pIn;
    ctx.fillStyle = 'rgba(0,0,0,0.4)'; H.roundRect(ctx, X0 + 8, Y0 + 10, X1 - X0, PH, 26); ctx.fill();
    H.roundRect(ctx, X0, Y0, X1 - X0, PH, 26); ctx.fillStyle = '#151a33'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.stroke();
    // gear + title
    ctx.save(); ctx.translate(X0 + 44, Y0 + 44); ctx.fillStyle = '#8e98c8';
    for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * Math.PI / 4 + t * 0.4); ctx.fillRect(-5, -20, 10, 10); ctx.restore(); }
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#151a33'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    ctx.font = H.font('ui', 28); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.panel || 'Admin settings', X0 + 80, Y0 + 44);
    // faint other rows
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    H.roundRect(ctx, X0 + 30, Y0 + 210, 300, 14, 7); ctx.fill(); H.roundRect(ctx, X1 - 120, Y0 + 205, 72, 24, 12); ctx.fill();
    // the setting row
    const glowK = clamp((t - tSw) / 0.4);
    const RY = Y0 + 125;
    H.roundRect(ctx, X0 + 20, RY - 50, X1 - X0 - 40, 100, 20);
    ctx.fillStyle = H.mixHex('#1f2547', ACC, 0.18 * glowK); ctx.fill();
    if (glowK > 0) { ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(ACC, glowK); ctx.stroke(); }
    ctx.font = H.font('bold', 32); ctx.fillStyle = '#ffffff'; ctx.fillText(P.setting || 'Proactive messages', X0 + 44, RY - 12);
    ctx.font = H.font('body', 22); ctx.fillStyle = 'rgba(255,255,255,0.65)'; ctx.fillText(P.sub || 'Bots check in on their own', X0 + 44, RY + 24);
    // toggle: ON
    const TX = X1 - 110, TW = 92, THh = 50;
    H.roundRect(ctx, TX - TW / 2, RY - THh / 2, TW, THh, THh / 2); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(TX + TW / 2 - 25, RY, 20, 0, Math.PI * 2); ctx.fill();
    ctx.font = H.font('ui', 18); ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.fillText('ON', TX - 14, RY + 1);
    // NEW tag
    const nP = K.popIn(t, tSw, 0.35);
    if (nP > 0) {
      ctx.save(); ctx.translate(X0 + 380, RY - 50); ctx.rotate(-0.08); ctx.scale(nP, nP);
      H.roundRect(ctx, -36, -18, 72, 36, 10); ctx.fillStyle = ACC; ctx.fill();
      ctx.font = H.font('display', 20); ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.fillText(P.isNew || 'NEW', 0, 2);
      ctx.restore();
    }
    ctx.restore();
    // default pill + hovering cursor
    const fP = K.popIn(t, tDef, 0.4);
    if (fP > 0) {
      K.drawLabel(ctx, TX - 60, RY + 130, fP, { text: P.deflt || 'On by default', size: 30, accent: true });
      const cx = TX + 10 + Math.sin(t * 3) * 6, cy = RY + 40 + Math.cos(t * 2.4) * 5;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(fP, fP); ctx.rotate(-0.4);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 44); ctx.lineTo(11, 33); ctx.lineTo(20, 52); ctx.lineTo(28, 48); ctx.lineTo(19, 30); ctx.lineTo(34, 30); ctx.closePath();
      ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#141829'; ctx.lineWidth = 3; ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}
