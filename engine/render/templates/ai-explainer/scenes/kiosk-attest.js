// Scene "kiosk-attest" (full frame, 1 beat ~12-15 s, two phases in an airport terminal; no logos).
// Phase A: a traveller hands a glowing key card ("<login>") to an AI agent robot; on leakCue little info chips (mail,
// card, house icons) leak out of the robot with a "<leak>" pill; on oopsCue receipts fly out of it into the
// traveller's arms with a "<oops>" pill and the traveller looks shocked.
// Phase B (from splitCue / the middle): a self-service check-in kiosk rises; a "<rule>" pill pops on ruleCue; on
// kioskCue the screen shows "<kiosk>" + the yes/no question; the traveller taps NO (tick); on botCue the robot
// reaches for the screen, the screen flashes "Person only" and a cross stamp lands by the robot. Ends settled.
// Fits: "why companies won't let agents act for you": account security, accidental purchases, legal attestations.
// params: login, leak, oops, kiosk, question, rule, personOnly ("Person only"), stamp ("NOT A PERSON"),
//         cues: loginCue, leakCue, oopsCue, splitCue ("and"/fraction), ruleCue, kioskCue, botCue
function terminal(ctx, t, H, K, ACC, o = {}) {
  const { roundRect, rgba } = H;
  // wall
  const g = ctx.createLinearGradient(0, 0, 0, 1000);
  g.addColorStop(0, '#141a36'); g.addColorStop(1, '#232c55');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  // window band with dusk sky
  const wy0 = 430, wy1 = 800;
  const sg = ctx.createLinearGradient(0, wy0, 0, wy1);
  sg.addColorStop(0, '#2b2f66'); sg.addColorStop(0.6, '#8a5a7a'); sg.addColorStop(1, '#e79a6a');
  ctx.fillStyle = sg; ctx.fillRect(0, wy0, 1080, wy1 - wy0);
  // runway lights
  for (let i = 0; i < 14; i++) {
    const x = ((i * 90 + t * 30) % 1260) - 90;
    ctx.fillStyle = rgba('#ffe9a8', 0.5 + 0.5 * Math.sin(t * 3 + i));
    ctx.beginPath(); ctx.arc(x, wy1 - 18, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#3a3555'; ctx.fillRect(0, wy1 - 12, 1080, 12);
  // plain plane tail (no livery) drifting slowly
  const px = (o.planeX ?? 830) - t * 6;
  ctx.fillStyle = '#d9dde8';
  ctx.beginPath(); ctx.moveTo(px - 60, wy1 - 12); ctx.lineTo(px + 10, wy1 - 210); ctx.lineTo(px + 70, wy1 - 210); ctx.lineTo(px + 60, wy1 - 12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b8bfd0'; ctx.fillRect(px - 260, wy1 - 70, 330, 58);
  ctx.beginPath(); ctx.arc(px - 260, wy1 - 41, 29, Math.PI / 2, Math.PI * 1.5); ctx.fill();
  ctx.fillStyle = '#7d86a0'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(px - 230 + i * 40, wy1 - 50, 6, 0, Math.PI * 2); ctx.fill(); }
  // mullions
  ctx.fillStyle = '#10142c';
  for (let x = 0; x <= 1080; x += 216) ctx.fillRect(x - 7, wy0, 14, wy1 - wy0);
  ctx.fillRect(0, wy0 - 10, 1080, 14); ctx.fillRect(0, wy1 - 2, 1080, 14);
  // floor
  const fg = ctx.createLinearGradient(0, 1000, 0, 1920);
  fg.addColorStop(0, '#2c3256'); fg.addColorStop(0.2, '#1b1f3a'); fg.addColorStop(1, '#0b0d1a');
  ctx.fillStyle = '#262c4e'; ctx.fillRect(0, wy1 + 12, 1080, 1000 - wy1 - 12);
  ctx.fillStyle = fg; ctx.fillRect(0, 1000, 1080, 920);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 2;
  for (let i = -6; i < 12; i++) { ctx.beginPath(); ctx.moveTo(540 + i * 140, 1000); ctx.lineTo(540 + i * 420, 1920); ctx.stroke(); }
}


export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const danger = '#ff6b5e', ok = '#2bb673';
  const tLogin = at(P.loginCue, D * 0.16) - 0.5;
  const tLeak = at(P.leakCue, D * 0.22) - 0.1;
  const tOops = at(P.oopsCue, D * 0.33) - 0.15;
  const tSplit = P.splitCue ? at(P.splitCue, D * 0.47) - 0.3 : D * 0.47;
  const tRule = at(P.ruleCue, D * 0.57) - 0.2;
  const tKiosk = at(P.kioskCue, D * 0.66) - 0.3;
  const tTap = Math.min(tKiosk + 1.6, at(P.botCue, D * 0.92) - 1.4);
  const tBot = at(P.botCue, D * 0.92) - 0.35;

  terminal(ctx, t, H, K, ACC, { planeX: 900 });
  const A = 1 - smooth((t - tSplit) / 0.45), B = smooth((t - tSplit - 0.2) / 0.5);

  // ================= phase A =================
  if (A > 0) {
    ctx.save(); ctx.globalAlpha = A;
    const px = 250, rx = 600;
    K.drawPerson(ctx, px, 1040, 1.25, { t, pose: t > tOops + 0.4 ? 'shrug' : t > tLogin && t < tLogin + 0.8 ? 'point' : 'stand', mood: t > tOops + 0.3 ? 'shocked' : t > tLeak ? 'worried' : 'happy', skin: 1, hair: 2, shirt: 3, hairStyle: 'long', seed: 2, look: 0.7 });
    K.drawRobot(ctx, rx, 1035, 1.3, { t, state: t > tLeak ? 'working' : 'idle', seed: 6 });
    // key card flying person -> robot, then held by robot
    const kc = smooth((t - tLogin) / 0.7);
    if (t > tLogin - 0.2) {
      const kx = lerp(px + 70, rx - 70, kc), ky = lerp(860, 860, kc) - Math.sin(kc * Math.PI) * 120;
      ctx.save(); ctx.translate(kx, ky); ctx.rotate(-0.15 + kc * 0.2);
      K.glow(ctx, 0, 0, 90, ACC, 0.5);
      roundRect(ctx, -55, -36, 110, 72, 10); ctx.fillStyle = ACC; ctx.fill();
      ctx.fillStyle = '#15182e'; ctx.beginPath(); ctx.arc(-25, -2, 14, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(-25, -4, 60, 8); ctx.fillRect(22, -4, 8, 18); ctx.fillRect(8, -4, 8, 14);
      ctx.restore();
    }
    const lp = K.popIn(t, tLogin + 0.1, 0.4);
    if (lp > 0) K.drawLabel(ctx, 420, 700, Math.min(1.05, lp) * (1 - smooth((t - tLeak) / 0.3)), { text: P.login || 'Your login', size: 28, accent: true });
    // info chips leaking upward from the robot
    if (t > tLeak) {
      for (let i = 0; i < 6; i++) {
        const u = ((t - tLeak) * 0.45 + i / 6) % 1, life = clamp((t - tLeak - i * 0.12) / 0.3);
        if (life <= 0) continue;
        const cx = rx + 40 + Math.sin(i * 2.1 + t) * 40 + u * 180, cy = 760 - u * 260;
        ctx.save(); ctx.globalAlpha = A * life * (1 - u * 0.8); ctx.translate(cx, cy);
        roundRect(ctx, -30, -22, 60, 44, 10); ctx.fillStyle = '#f4f6fb'; ctx.fill();
        ctx.strokeStyle = '#1b2040'; ctx.fillStyle = '#1b2040'; ctx.lineWidth = 3;
        if (i % 3 === 0) { ctx.strokeRect(-16, -10, 32, 20); ctx.beginPath(); ctx.moveTo(-16, -10); ctx.lineTo(0, 2); ctx.lineTo(16, -10); ctx.stroke(); }
        else if (i % 3 === 1) { ctx.strokeRect(-17, -11, 34, 22); ctx.fillRect(-17, -5, 34, 5); }
        else { ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(0, -13); ctx.lineTo(14, 0); ctx.lineTo(14, 12); ctx.lineTo(-14, 12); ctx.closePath(); ctx.stroke(); }
        ctx.restore();
      }
      const ip = K.popIn(t, tLeak + 0.15, 0.4);
      K.drawLabel(ctx, 680, 520, Math.min(1.05, ip), { text: P.leak || 'Info exposed', size: 28, dot: true });
    }
    // receipts flying out to the traveller
    if (t > tOops) {
      for (let i = 0; i < 4; i++) {
        const u = smooth((t - tOops - i * 0.22) / 0.7); if (u <= 0) continue;
        const x = lerp(rx - 40, px + 30 + i * 14, u), y = lerp(820, 905 - i * 16, u) - Math.sin(u * Math.PI) * 140;
        ctx.save(); ctx.translate(x, y); ctx.rotate((i - 1.5) * 0.12 * u);
        roundRect(ctx, -34, -44, 68, 88, 6); ctx.fillStyle = '#ffffff'; ctx.fill();
        ctx.fillStyle = '#b9c1d6'; ctx.fillRect(-22, -30, 44, 6); ctx.fillRect(-22, -16, 30, 6); ctx.fillRect(-22, -2, 38, 6);
        ctx.fillStyle = danger; ctx.font = H.font('display', 24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 26);
        ctx.restore();
      }
      const op = K.popIn(t, tOops + 0.35, 0.4);
      K.drawLabel(ctx, 330, 610, Math.min(1.05, op), { text: P.oops || "Didn't mean to buy", size: 28, dot: true });
    }
    ctx.restore();
  }

  // ================= phase B =================
  if (B > 0) {
    ctx.save(); ctx.globalAlpha = B;
    // kiosk
    const kx = 500, rise = (1 - B) * 60;
    ctx.save(); ctx.translate(0, rise);
    K.shadow(ctx, kx, 1040, 300);
    roundRect(ctx, kx - 120, 640, 240, 400, 26); ctx.fillStyle = '#dfe4f1'; ctx.fill();
    ctx.fillStyle = '#b9c1d6'; ctx.fillRect(kx + 70, 650, 40, 380);
    roundRect(ctx, kx - 140, 590, 280, 70, 20); ctx.fillStyle = '#c9cfe0'; ctx.fill();
    roundRect(ctx, kx - 60, 900, 120, 14, 7); ctx.fillStyle = '#15182e'; ctx.fill();
    // big screen panel above the kiosk (tilted towards us, enlarged for legibility)
    const SX0 = kx - 210, SX1 = kx + 210, SY0 = 470, SY1 = 790;
    roundRect(ctx, SX0 - 14, SY0 - 14, SX1 - SX0 + 28, SY1 - SY0 + 28, 30); ctx.fillStyle = '#2b3150'; ctx.fill();
    const lit = smooth((t - tKiosk) / 0.4);
    const flash = t > tBot ? 0.5 + 0.5 * Math.sin((t - tBot) * 10) * Math.max(0, 1 - (t - tBot) / 1.5) : 0;
    roundRect(ctx, SX0, SY0, SX1 - SX0, SY1 - SY0, 20); ctx.fillStyle = H.mixHex('#0d1024', '#f4f6fb', lit); ctx.fill();
    if (lit > 0) {
      ctx.save(); ctx.globalAlpha = B * lit;
      ctx.fillStyle = '#1b2040'; roundRect(ctx, SX0, SY0, SX1 - SX0, 56, 20); ctx.fill(); ctx.fillRect(SX0, SY0 + 30, SX1 - SX0, 26);
      ctx.fillStyle = '#ffffff'; ctx.font = H.font('bold', 26); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(P.kiosk || 'Check-in', SX0 + 24, SY0 + 29);
      const qLines = H.wrap(ctx, P.question || 'Any explosives in your bags?', 'display', 34, SX1 - SX0 - 48);
      ctx.fillStyle = '#1b2040'; ctx.font = H.font('display', 34); ctx.textAlign = 'center';
      qLines.forEach((ln, i) => ctx.fillText(ln, (SX0 + SX1) / 2, SY0 + 110 + i * 42));
      // YES / NO
      const tapped = smooth((t - tTap) / 0.25);
      const btn = (x, label, on) => {
        roundRect(ctx, x - 80, SY1 - 105, 160, 70, 18); ctx.fillStyle = on ? ok : '#e1e5f0'; ctx.fill();
        ctx.fillStyle = on ? '#ffffff' : '#1b2040'; ctx.font = H.font('display', 30); ctx.textAlign = 'center'; ctx.fillText(label, x, SY1 - 68);
      };
      btn(kx - 95, 'YES', false); btn(kx + 95, 'NO' + (tapped > 0.5 ? ' ✓' : ''), tapped > 0.5);
      if (flash > 0 || t > tBot) {
        const po = smooth((t - tBot) / 0.25);
        ctx.globalAlpha = B * lit * po;
        roundRect(ctx, SX0, SY0, SX1 - SX0, SY1 - SY0, 20); ctx.fillStyle = rgba(danger, 0.25 + 0.35 * flash); ctx.fill();
        roundRect(ctx, (SX0 + SX1) / 2 - 150, (SY0 + SY1) / 2 - 36, 300, 72, 36); ctx.fillStyle = danger; ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.font = H.font('display', 32); ctx.textAlign = 'center'; ctx.fillText(P.personOnly || 'Person only', (SX0 + SX1) / 2, (SY0 + SY1) / 2 + 2);
      }
      ctx.restore();
    }
    ctx.restore();
    // traveller (right) walks up and taps NO
    const pw = smooth((t - tKiosk + 0.4) / 1.0);
    const ppx = lerp(920, 765, pw);
    K.drawPerson(ctx, ppx, 1040, 1.2, { t, walk: pw > 0 && pw < 1 ? t : undefined, pose: t > tTap - 0.3 && t < tTap + 0.5 ? 'point' : 'stand', flip: true, mood: 'happy', skin: 1, hair: 2, shirt: 3, hairStyle: 'long', seed: 2, look: -0.7 });
    // robot (left) reaches, gets refused
    const rr0 = smooth((t - tBot + 0.8) / 0.6), back = smooth((t - tBot - 0.2) / 0.5);
    const rx = lerp(200, 290, rr0) - back * 50 + K.shake(t, tBot, 0.4, 6);
    K.drawRobot(ctx, rx, 1035, 1.2, { t, state: t > tBot ? 'thinking' : 'idle', seed: 6 });
    // rule pill
    const rp = K.popIn(t, tRule, 0.45);
    if (rp > 0) {
      ctx.save(); ctx.translate(500, 905); const s = Math.min(1.05, rp); ctx.scale(s, s);
      const f = H.fitText(ctx, P.rule || 'A person must confirm', 'display', 27, 20, 440);
      ctx.font = f.font; const w = ctx.measureText(f.text).width + 92;
      roundRect(ctx, -w / 2, -32, w, 64, 32); ctx.fillStyle = ACC; ctx.fill();
      // person glyph
      ctx.fillStyle = '#15182e'; ctx.beginPath(); ctx.arc(-w / 2 + 38, -9, 9, 0, Math.PI * 2); ctx.fill();
      roundRect(ctx, -w / 2 + 25, 2, 26, 18, 9); ctx.fill();
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, -w / 2 + 64, 2);
      ctx.restore();
    }
    const st = (t - tBot - 0.25) / 0.5;
    if (st > 0) K.drawStamp(ctx, 215, 655, 1.0, { kind: 'cross', text: P.stamp || 'NOT A PERSON', land: st });
    ctx.restore();
  }
}
