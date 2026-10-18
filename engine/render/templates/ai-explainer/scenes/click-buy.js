// Scene "click-buy" (full frame, 1 beat, payoff). Living room at night: a person on the sofa with a phone, the AI agent
// robot beside them holding a shopping bag. A big phone-screen panel shows a generic checkout with a "<button>" button;
// a hand cursor slides in and taps it on tapCue (ripple + check). Then the room dims and a question card lands with two
// answer chips and a pulsing "?". Ends settled.
// Fits: payoff for "agents still need a human to finish", "would you trust a bot with X?".
// params: button ("BUY"), screen ("Checkout"), question ("Hand a bot your password?"), a ("Sure"), b ("No way"),
//         tapCue ("click"), qCue ("would"); without cues, fractions of the scene
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tTap = at(P.tapCue || 'click', D * 0.45) - 0.1;
  const tQ = at(P.qCue || 'Would', D * 0.68) - 0.25;

  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 740 }]);
  const room = K.world.livingRoomNight(ctx, { t, lampOn: true });
  const sofa = room.sofa || { x: 480, seatY: 880, feetY: 1030 };
  K.drawPerson(ctx, sofa.x - 200, sofa.feetY, 1.7, { t, pose: 'sit-phone', seat: false, typing: t < tTap ? 0.6 : 0, mood: t > tTap ? 'happy' : 'neutral', skin: 2, hair: 1, shirt: 3, hairStyle: 'curly', seed: 4 });
  K.drawRobot(ctx, sofa.x + 260, sofa.feetY, 1.2, { t, state: t > tTap + 0.2 ? 'happy' : 'idle', seed: 2, flip: true });
  ctx.save(); ctx.translate(sofa.x + 190, 930); ctx.rotate(0.05 * Math.sin(t * 3));
  roundRect(ctx, -28, -8, 56, 60, 8); ctx.fillStyle = ACC; ctx.fill();
  ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -8, 15, Math.PI, 0); ctx.stroke();
  ctx.restore();

  // phone screen panel
  const qd = smooth((t - tQ) / 0.4);
  const pk = K.popIn(t, 0.15, 0.45);
  if (pk > 0) {
    ctx.save(); ctx.globalAlpha = 1 - 0.75 * qd; ctx.translate(610, 575); ctx.scale(Math.min(1.04, pk), Math.min(1.04, pk));
    const W = 400, Hh = 300;
    roundRect(ctx, -W / 2 - 14, -Hh / 2 - 14, W + 28, Hh + 28, 40); ctx.fillStyle = '#1c2033'; ctx.fill();
    roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 28); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = '#283152'; ctx.font = H.font('ui', 28); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.screen || 'Checkout', -W / 2 + 30, -Hh / 2 + 40);
    // item row
    roundRect(ctx, -W / 2 + 30, -Hh / 2 + 76, 80, 80, 12); ctx.fillStyle = '#dfe4f1'; ctx.fill();
    ctx.fillStyle = '#b9c1d6'; ctx.fillRect(-W / 2 + 130, -Hh / 2 + 92, 200, 14); ctx.fillRect(-W / 2 + 130, -Hh / 2 + 122, 120, 14);
    // button
    const press = clamp(1 - Math.abs(t - tTap - 0.05) / 0.15);
    const done = t > tTap + 0.1;
    ctx.save(); ctx.translate(0, 95); ctx.scale(1 - 0.06 * press, 1 - 0.06 * press);
    roundRect(ctx, -150, -42, 300, 84, 42); ctx.fillStyle = done ? '#3fbf7f' : ACC; ctx.fill();
    ctx.font = H.font('display', 40); ctx.fillStyle = done ? '#ffffff' : K.ACCENT.deep; ctx.textAlign = 'center';
    ctx.fillText(done ? '✓' : (P.button || 'BUY'), 0, 3);
    ctx.restore();
    // ripple
    const rp = clamp((t - tTap) / 0.6);
    if (rp > 0 && rp < 1) { ctx.strokeStyle = rgba(ACC, 1 - rp); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(30, 100, 30 + 120 * rp, 0, Math.PI * 2); ctx.stroke(); }
    // hand cursor (a simple pointing hand) slides in and taps
    const hin = smooth((t - 0.6) / Math.max(0.5, tTap - 0.7));
    const hx = lerp(260, 40, hin), hy = lerp(260, 120, hin) + 10 * press;
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(-0.35);
    ctx.fillStyle = '#eab894'; ctx.strokeStyle = '#7a4a30'; ctx.lineWidth = 3;
    roundRect(ctx, -11, -10, 22, 50, 11); ctx.fill(); ctx.stroke();
    roundRect(ctx, -22, 26, 56, 60, 18); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.restore();
  }

  // question card
  const qk = K.popIn(t, tQ, 0.5);
  if (qk > 0) {
    ctx.fillStyle = `rgba(6,7,16,${0.4 * qd})`; ctx.fillRect(-100, -100, 1300, 2200);
    ctx.save(); ctx.translate(487, 650); ctx.scale(Math.min(1.05, qk), Math.min(1.05, qk));
    const W = 800, Hh = 340;
    roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 30); ctx.fillStyle = 'rgba(8,10,24,0.96)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
    const pulse = 1 + 0.06 * Math.sin((t - tQ) * 5);
    ctx.save(); ctx.translate(0, -88); ctx.scale(pulse, pulse);
    ctx.font = H.font('display', 84); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 4);
    ctx.restore();
    const f = H.fitText(ctx, P.question || 'Hand a bot your password?', 'display', 46, 28, W - 70);
    ctx.font = f.font; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 6);
    const opts = [P.a || 'Sure', P.b || 'No way'];
    opts.forEach((o, i) => {
      const k = K.popIn(t, tQ + 0.45 + i * 0.25, 0.4);
      if (k <= 0) return;
      ctx.save(); ctx.translate(i ? 150 : -150, 100); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
      roundRect(ctx, -120, -34, 240, 68, 34); ctx.fillStyle = i ? 'rgba(255,107,94,0.95)' : ACC; ctx.fill();
      ctx.font = H.font('ui', 32); ctx.fillStyle = i ? '#2a0f0c' : K.ACCENT.deep; ctx.fillText(o, 0, 2);
      ctx.restore();
    });
    ctx.restore();
  }
  void room;
}
