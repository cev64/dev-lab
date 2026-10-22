// Scene "agent-profiles" (full frame, 1 long beat, ~12-18 s). Night living room: a person on the sofa with a phone; a big
// generic account panel floats to the right. Phases: (1) header pill + "next month" calendar chip; (2) profile rows pop,
// one per agent (mini robot avatar + name), and order boxes drop into each row's own tray ("kept separate");
// (3) a toggle "Approve every order" flips ON with a "Default" tag, a pending order card arrives and a hand taps Approve;
// (4) the panel flips into an allowance-style card: "Spending limit" with up to 3 amount chips lighting on their cues and
// a meter filling to a cap line with a padlock. The robot on the sofa arm reacts. Ends settled.
// Fits: "each agent gets its own profile / permissions", "approve every purchase", "set a spending limit", parental-
// control style settings for AI.
// params: head ("Agent Profiles"), when ("Next month"; '' hides), account ("Your account"), profiles (["Agent A","Agent B"]),
//         sepLabel ("Orders kept separate"), toggle ("Approve every order"), defTag ("Default"), order ("New order"),
//         approve ("Approve"), limitTitle ("Spending limit"), amounts (["$50","$100","$200"]), cap index lit last,
//         cues ("word#n"; without them fractions): whenCue, headCue, eachCue, ordersCue, defaultCue, approveCue,
//         limitCue, amountCues [3]
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tWhen = at(P.whenCue, 0.3) - 0.1;
  const tHead = at(P.headCue, D * 0.08) - 0.2;
  const tEach = at(P.eachCue, D * 0.19) - 0.2;
  const tOrd = at(P.ordersCue, D * 0.4) - 0.2;
  const tDef = at(P.defaultCue, D * 0.53) - 0.3;
  const tApp = at(P.approveCue, D * 0.63) - 0.1;
  const tLim = at(P.limitCue, D * 0.74) - 0.4;
  const amounts = (P.amounts || ['$50', '$100', '$200']).slice(0, 3);
  const aCues = P.amountCues || [];
  const tAm = amounts.map((_, i) => at(aCues[i], tLim + 1.0 + i * 0.9) - 0.1);
  const profiles = (P.profiles || ['Agent A', 'Agent B']).slice(0, 3);
  const GREEN = '#3fbf7f';

  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tEach, zoom: 1.02, x: 500, y: 740 }, { t: D, zoom: 1.03, x: 510, y: 740 }]);
  const room = K.world.livingRoomNight(ctx, { t, lampOn: true });
  const sofa = room.sofa || { x: 480, seatY: 880, feetY: 1030 };
  const looking = t > tEach;
  K.drawPerson(ctx, sofa.x - 250, sofa.feetY, 1.6, { t, pose: 'sit-phone', seat: false, typing: (t > tApp - 0.6 && t < tApp) || (t > tLim && t < tAm[amounts.length - 1]) ? 0.8 : 0, mood: t > tApp ? 'happy' : 'neutral', skin: 3, hair: 0, shirt: 2, hairStyle: 'short', seed: 6, look: looking ? 0.5 : 0 });

  // ---- panel ----
  const px = 670, py = 720, PW = 440, PH = 520;
  const pk = K.popIn(t, 0.15, 0.5);
  const flipU = clamp((t - tLim) / 0.5);             // flip into the allowance card
  const sx = Math.abs(Math.cos(flipU * Math.PI));
  const showCard = flipU >= 0.5;
  ctx.save(); ctx.translate(px, py); ctx.scale(Math.min(1.03, pk) * Math.max(0.02, sx), Math.min(1.03, pk));
  if (!showCard) {
    roundRect(ctx, -PW / 2 - 14, -PH / 2 - 14, PW + 28, PH + 28, 40); ctx.fillStyle = '#1c2033'; ctx.fill();
    roundRect(ctx, -PW / 2, -PH / 2, PW, PH, 28); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = '#283152'; ctx.font = H.font('ui', 28); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.account || 'Your account', -PW / 2 + 28, -PH / 2 + 40);
    ctx.fillStyle = '#d5dae8'; ctx.fillRect(-PW / 2 + 28, -PH / 2 + 66, PW - 56, 3);
    // phase 2: profile rows (fade out when the approval toggle arrives)
    const rowsA = 1 - smooth((t - tDef) / 0.4);
    if (rowsA > 0.01) {
      ctx.save(); ctx.globalAlpha = rowsA;
      profiles.forEach((name, i) => {
        const k = K.popIn(t, tEach + i * 0.35, 0.4);
        if (k <= 0) return;
        const y = -PH / 2 + 140 + i * 150;
        ctx.save(); ctx.translate(0, y); ctx.scale(Math.min(1.03, k), Math.min(1.03, k));
        roundRect(ctx, -PW / 2 + 22, -60, PW - 44, 124, 18); ctx.fillStyle = '#ffffff'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = i === 0 ? ACC : '#d5dae8'; ctx.stroke();
        // mini robot avatar
        const axX = -PW / 2 + 78;
        roundRect(ctx, axX - 34, -34, 68, 58, 18); ctx.fillStyle = '#e9edf6'; ctx.fill(); ctx.strokeStyle = '#9aa3bd'; ctx.lineWidth = 2; ctx.stroke();
        roundRect(ctx, axX - 25, -22, 50, 26, 10); ctx.fillStyle = '#1b1f33'; ctx.fill();
        const blink = (Math.sin(t * 2.3 + i * 2) > 0.97) ? 0.3 : 1;
        ctx.fillStyle = ACC; ctx.beginPath(); ctx.ellipse(axX - 10, -9, 5, 5 * blink, 0, 0, Math.PI * 2); ctx.ellipse(axX + 10, -9, 5, 5 * blink, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#283152'; ctx.font = H.font('ui', 28); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(name, axX + 52, -20);
        // its own order tray
        roundRect(ctx, axX + 50, 6, 230, 44, 10); ctx.fillStyle = '#eef1f8'; ctx.fill();
        for (let j = 0; j < 3; j++) {
          const dk = K.phase(t, tOrd + i * 0.3 + j * 0.25, tOrd + i * 0.3 + j * 0.25 + 0.4, K.easeOutBack);
          if (dk <= 0) continue;
          const bx = axX + 74 + j * 52, by = lerp(-80, 28, dk);
          roundRect(ctx, bx - 18, by - 16, 36, 32, 6); ctx.fillStyle = i === 0 ? ACC : '#9fb6e0'; ctx.fill();
          ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(bx - 2, by - 16, 4, 32);
        }
        ctx.restore();
      });
      ctx.restore();
    }
    // phase 3: approval toggle + pending order
    const tg = K.popIn(t, tDef, 0.45);
    if (tg > 0) {
      ctx.save(); ctx.globalAlpha = clamp(tg);
      const y = -PH / 2 + 130;
      roundRect(ctx, -PW / 2 + 22, y - 50, PW - 44, 100, 18); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
      const f = H.fitText(ctx, P.toggle || 'Approve every order', 'ui', 28, 20, PW - 190);
      ctx.font = f.font; ctx.fillStyle = '#283152'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, -PW / 2 + 44, y);
      const on = smooth((t - tDef - 0.5) / 0.35);
      const swX = PW / 2 - 90;
      roundRect(ctx, swX - 40, y - 24, 80, 48, 24); ctx.fillStyle = on > 0.5 ? GREEN : '#c3c9da'; ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(lerp(swX - 16, swX + 16, on), y, 19, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      if (on > 0) K.drawLabel(ctx, swX, y - 56, Math.min(1.05, K.popIn(t, tDef + 0.6, 0.4)), { text: P.defTag || 'Default', size: 24, accent: true });
      // pending order card
      const ok = K.popIn(t, tDef + 1.0, 0.45);
      if (ok > 0) {
        ctx.save(); ctx.translate(0, 70); ctx.scale(Math.min(1.03, ok), Math.min(1.03, ok));
        roundRect(ctx, -PW / 2 + 22, -110, PW - 44, 250, 20); ctx.fillStyle = '#ffffff'; ctx.fill();
        ctx.strokeStyle = '#d5dae8'; ctx.lineWidth = 3; ctx.stroke();
        ctx.fillStyle = '#283152'; ctx.font = H.font('ui', 28); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(P.order || 'New order', -PW / 2 + 48, -70);
        roundRect(ctx, -PW / 2 + 48, -40, 70, 64, 10); ctx.fillStyle = '#dfe4f1'; ctx.fill();
        ctx.fillStyle = '#b9c1d6'; ctx.fillRect(-PW / 2 + 136, -30, 180, 14); ctx.fillRect(-PW / 2 + 136, -2, 110, 14);
        const done = t > tApp + 0.1, press = clamp(1 - Math.abs(t - tApp - 0.05) / 0.15);
        ctx.save(); ctx.translate(0, 80); ctx.scale(1 - 0.06 * press, 1 - 0.06 * press);
        roundRect(ctx, -140, -36, 280, 72, 36); ctx.fillStyle = done ? GREEN : ACC; ctx.fill();
        ctx.font = H.font('display', 32); ctx.fillStyle = done ? '#ffffff' : K.ACCENT.deep; ctx.textAlign = 'center';
        ctx.fillText(done ? '✓' : (P.approve || 'Approve'), 0, 3);
        ctx.restore();
        const rp = clamp((t - tApp) / 0.6);
        if (rp > 0 && rp < 1) { ctx.strokeStyle = rgba(ACC, 1 - rp); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(20, 85, 30 + 110 * rp, 0, Math.PI * 2); ctx.stroke(); }
        // hand slides in and taps
        const hin = smooth((t - (tDef + 1.3)) / Math.max(0.4, tApp - tDef - 1.4));
        if (t > tDef + 1.3) {
          const hx = lerp(260, 40, hin), hy = lerp(260, 110, hin) + 10 * press;
          ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.35);
          ctx.fillStyle = '#c98e6a'; ctx.strokeStyle = '#6a3e26'; ctx.lineWidth = 3;
          roundRect(ctx, -11, -10, 22, 50, 11); ctx.fill(); ctx.stroke();
          roundRect(ctx, -22, 26, 56, 60, 18); ctx.fill(); ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
      }
    }
  } else {
    // phase 4: allowance-style card
    const CW = 460, CH = 300;
    const g = ctx.createLinearGradient(-CW / 2, -CH / 2, CW / 2, CH / 2); g.addColorStop(0, '#2f4f7a'); g.addColorStop(1, '#1b2c4a');
    roundRect(ctx, -CW / 2, -CH / 2 - 60, CW, CH, 28); ctx.fillStyle = g; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
    // chip + robot mark
    roundRect(ctx, -CW / 2 + 32, -CH / 2 - 26, 64, 48, 10); ctx.fillStyle = '#d9c27a'; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.strokeRect(-CW / 2 + 48, -CH / 2 - 26, 32, 48);
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('display', 34); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.limitTitle || 'Spending limit', -CW / 2 + 32, -CH / 2 + 60);
    // meter
    const lit = amounts.reduce((n, _, i) => n + (t > tAm[i] ? 1 : 0), 0);
    const fill = K.phase(t, tAm[0], tAm[amounts.length - 1] + 0.6, (u) => u) * 0.9;
    roundRect(ctx, -CW / 2 + 32, -CH / 2 + 110, CW - 64, 30, 15); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill();
    if (fill > 0.01) { roundRect(ctx, -CW / 2 + 32, -CH / 2 + 110, (CW - 64) * fill, 30, 15); ctx.fillStyle = ACC; ctx.fill(); }
    ctx.fillStyle = '#ff6b5e'; ctx.fillRect(-CW / 2 + 32 + (CW - 64) * 0.9 - 3, -CH / 2 + 100, 6, 50);
    if (lit === amounts.length && t > tAm[amounts.length - 1] + 0.6) K.drawLock(ctx, -CW / 2 + 32 + (CW - 64) * 0.9 + 34, -CH / 2 + 150, 0.45, { open: 0 });
    // amount chips
    amounts.forEach((a, i) => {
      const k = K.popIn(t, tAm[i] - 0.05, 0.4);
      const x = -CW / 2 + 90 + i * 140, y = CH / 2 + 30;
      const on = t > tAm[i];
      const cur = on && (i === amounts.length - 1 || t < tAm[i + 1]);
      ctx.save(); ctx.translate(x, y); const s = Math.max(0.85, Math.min(1.08, k)) * (cur ? 1.08 : 1); ctx.scale(s, s);
      roundRect(ctx, -60, -36, 120, 72, 36); ctx.fillStyle = on ? ACC : 'rgba(10,12,22,0.86)'; ctx.fill();
      if (!on) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.stroke(); }
      ctx.font = H.font('display', 32); ctx.fillStyle = on ? K.ACCENT.deep : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(a, 0, 3);
      ctx.restore();
    });
  }
  ctx.restore();

  // robot on the sofa arm, reacting
  K.drawRobot(ctx, sofa.x - 60, sofa.feetY, 1.0, { t, state: t > tApp + 0.2 ? 'happy' : (t > tDef ? 'thinking' : 'idle'), seed: 2, flip: true });

  // header pill + "next month" chip
  K.drawLabel(ctx, px, 440, Math.min(1.05, K.popIn(t, Math.max(0.2, tHead), 0.45)), { text: P.head || 'Agent Profiles', size: 32, dot: true });
  if (P.when !== '') {
    const wk = K.popIn(t, tWhen, 0.4);
    if (wk > 0) {
      ctx.save(); ctx.translate(200, 560); ctx.scale(Math.min(1.05, wk), Math.min(1.05, wk));
      roundRect(ctx, -80, -70, 160, 140, 16); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      roundRect(ctx, -80, -70, 160, 40, 16); ctx.fillStyle = '#ff6b5e'; ctx.fill(); ctx.fillRect(-80, -50, 160, 20);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) { const hi = r === 1 && c === 2 && Math.sin(t * 4) > -0.2; ctx.fillStyle = hi ? ACC : '#c3c9da'; roundRect(ctx, -62 + c * 32, -14 + r * 26, 22, 18, 4); ctx.fill(); }
      ctx.restore();
      K.drawLabel(ctx, 200, 690, Math.min(1.05, wk), { text: P.when || 'Next month', size: 26, accent: true });
    }
  }
  if (P.sepLabel !== '' && t > tOrd + 0.6 && t < tDef + 0.2) {
    const sk = K.popIn(t, tOrd + 0.6, 0.4) * (1 - smooth((t - tDef + 0.2) / 0.3));
    if (sk > 0.02) K.drawLabel(ctx, px, 1035, Math.min(1.05, sk), { text: P.sepLabel || 'Orders kept separate', size: 26 });
  }
}
