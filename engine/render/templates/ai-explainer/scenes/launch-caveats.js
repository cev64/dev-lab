// Scene "launch-caveats" (was bank-caveat; full frame, 1 beat, ~10-15 s). The caveats of a launch, two columns on a dusk street.
// Left: a cartoon banker shrugs under a "customers" card whose only row is a dashed blank ("None named" + "?"),
// and a price tag swings with "$ ?". Right: a privacy order (document) drops in with a date/place pill, an ORDER
// stamp lands, a pill states what was ordered, and finally the company's response pill (e.g. "appealed") pops.
// A generic eye-scanning sphere (no logo) sits between them.
// Fits: "no customer named, no price, and a regulator pushed back" caveat beats.
// params: cardHead ("Bank customers"), none ("None named"), price ("$ ?"), place ("Regulator · year"),
//         docHead ("Privacy order"), stamp ("ORDER"), order ("Delete data on request"), reply ("Company appealed"),
//         cues (optional; else fractions): bankCue, customerCue, priceCue, placeCue, orderCue, deleteCue, replyCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, roundRect, rgba } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tBank = at(P.bankCue, D * 0.1) - 0.2;
  const tCust = at(P.customerCue, D * 0.18) - 0.1;
  const tPrice = at(P.priceCue, D * 0.32) - 0.2;
  const tPlace = at(P.placeCue, D * 0.42) - 0.1;
  const tOrder = at(P.orderCue, D * 0.66) - 0.1;
  const tDel = at(P.deleteCue, D * 0.74) - 0.1;
  const tReply = at(P.replyCue, D * 0.93) - 0.3;
  const danger = '#ff6b5e';

  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 330, y: 760 }, { t: tPlace - 0.3, zoom: 1.06, x: 330, y: 760 }, { t: tPlace + 0.9, zoom: 1.0 }, { t: D, zoom: 1.02, x: 520, y: 740 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });
  const feet = 1035;

  // ---- left: banker + customers card + price tag ----
  K.drawPerson(ctx, 170, feet, 1.35, { t, pose: t > tCust + 0.3 ? 'shrug' : 'stand', mood: t > tCust + 0.3 ? 'worried' : 'neutral', skin: 3, hair: 0, hairStyle: 'short', shirt: '#2b3a67', seed: 21, look: 0.5 });
  const kc = K.popIn(t, tBank, 0.45);
  if (kc > 0) {
    ctx.save(); ctx.translate(265, 540); ctx.scale(Math.min(1.04, kc), Math.min(1.04, kc));
    roundRect(ctx, -200, -96, 400, 192, 24); ctx.fillStyle = 'rgba(8,10,24,0.94)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke();
    ctx.font = H.font('ui', 26); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(P.cardHead || 'Bank customers').toUpperCase(), 0, -60);
    const kr = smooth((t - tCust) / 0.4);
    if (kr > 0) {
      ctx.globalAlpha = kr;
      ctx.setLineDash([10, 8]); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      roundRect(ctx, -176, -30, 352, 100, 16); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = H.font('display', 32); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
      ctx.fillText(P.none || 'None named', -150, 22);
      const qk = K.popIn(t, tCust + 0.4, 0.35);
      if (qk > 0) {
        ctx.save(); ctx.translate(134, 20); ctx.scale(Math.min(1.1, qk), Math.min(1.1, qk));
        ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
        ctx.font = H.font('display', 40); ctx.fillStyle = K.ACCENT.deep; ctx.textAlign = 'center'; ctx.fillText('?', 0, 3);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  const kp = K.popIn(t, tPrice, 0.45);
  if (kp > 0) K.drawPriceTag(ctx, 380, 800, 0.95 * Math.min(1.05, kp), { text: P.price || '$ ?', t: t * 1.6, size: 38 });

  // sphere on a stand, centre-left
  const sx = 330, sy = 950, r = 46;
  ctx.fillStyle = '#3b4260'; roundRect(ctx, sx - 34, 990, 68, 40, 8); ctx.fill();
  drawOrb(ctx, H, sx, sy + K.bob(t, 3, 1.4), r, t, ACC, 0.8);

  // ---- right: privacy order ----
  const kd = H.easeOutBack(clamp((t - tPlace) / 0.6));
  if (kd > 0) {
    const dy = (1 - kd) * -260;
    ctx.save(); ctx.translate(0, dy);
    // document card
    ctx.save(); ctx.translate(700, 560); ctx.rotate(0.03);
    roundRect(ctx, -150, -120, 300, 240, 18); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = '#d5dae8'; ctx.fillRect(-150, -120, 300, 54);
    ctx.font = H.font('ui', 26); ctx.fillStyle = '#161927'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(P.docHead || 'Privacy order').toUpperCase(), 0, -92);
    for (let i = 0; i < 5; i++) { roundRect(ctx, -120, -46 + i * 26, (i === 4 ? 120 : 240 - 30 * H.hash(i, 4)), 10, 5); ctx.fillStyle = '#b9c1d6'; ctx.fill(); }
    ctx.restore();
    ctx.restore();
    const kl = K.popIn(t, tPlace + 0.5, 0.4);
    if (kl > 0) K.drawLabel(ctx, 700, 760, Math.min(1.05, kl), { text: P.place || 'Regulator · year', size: 28, dot: true });
  }
  const ks = clamp((t - tOrder) / 0.5);
  if (ks > 0) K.drawStamp(ctx, 740, 720, 0.8, { kind: 'check', text: P.stamp || 'ORDER', land: ks });
  const ko = K.popIn(t, tDel, 0.4);
  if (ko > 0) K.drawLabel(ctx, 690, 840, Math.min(1.05, ko), { text: P.order || 'Delete data on request', size: 26 });
  const ka = K.popIn(t, tReply, 0.4);
  if (ka > 0) {
    ctx.save(); ctx.translate(690, 925); ctx.scale(Math.min(1.06, ka), Math.min(1.06, ka));
    ctx.font = H.font('display', 30);
    const txt = P.reply || 'Company appealed', w = ctx.measureText(txt).width + 90;
    roundRect(ctx, -w / 2, -32, w, 64, 32); ctx.fillStyle = ACC; ctx.fill();
    // up arrow (appeal)
    ctx.fillStyle = K.ACCENT.deep; ctx.beginPath();
    const ax = -w / 2 + 34; ctx.moveTo(ax, -16); ctx.lineTo(ax + 14, 0); ctx.lineTo(ax + 5, 0); ctx.lineTo(ax + 5, 16); ctx.lineTo(ax - 5, 16); ctx.lineTo(ax - 5, 0); ctx.lineTo(ax - 14, 0); ctx.closePath(); ctx.fill();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(txt, ax + 26, 2);
    ctx.restore();
  }
}

// Generic eye-scanning sphere (no logo).
function drawOrb(ctx, H, x, y, r, t, ACC, glowA) {
  H.glow(ctx, x, y, r * 2.4, ACC, 0.2 * glowA);
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.1, x, y, r);
  g.addColorStop(0, '#fbfcff'); g.addColorStop(0.55, '#bcc3d4'); g.addColorStop(1, '#5b6276');
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
  const lr = r * 0.4;
  ctx.beginPath(); ctx.arc(x, y, lr * 1.18, 0, Math.PI * 2); ctx.fillStyle = '#2a2f45'; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, lr, 0, Math.PI * 2); ctx.fillStyle = '#0d1020'; ctx.fill();
  ctx.lineWidth = Math.max(2, lr * 0.16); ctx.strokeStyle = H.rgba(ACC, 0.6 + 0.4 * Math.sin(t * 3));
  ctx.beginPath(); ctx.arc(x, y, lr * 0.62, 0, Math.PI * 2); ctx.stroke();
}
