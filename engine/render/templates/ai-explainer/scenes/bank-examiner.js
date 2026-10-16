// Scene "bank-examiner" (full frame, 1 beat). Day street, two towers side by side: a bank (columns + coin sign) on
// the left and an AI lab (server-glow windows) on the right, names as text pills. Round cut-away insets pop above
// each: a resident examiner with a magnifier at a desk inside the bank, then an outside evaluator with a laptop inside
// the lab. An "=" appears between them ("Same idea"), then wobbles into "≈" with a "Not an exact match" pill.
// Fits: analogies between AI oversight and bank supervision / any "they already do this in X" comparison.
// params: left ("BANK"), leftTag ("Resident examiner"), right ("AI LAB"), rightTag ("Embedded evaluator"),
//         same ("Same idea"), notExact ("Not an exact match"), cues: bankCue, examCue, labCue, exactCue
// Defaults are generic (no company names). Library copy of the 2026-10-16 AI-inspectors story scene.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tBank = at(P.bankCue, 1.2) - 0.3;
  const tExam = at(P.examCue, 3.4) - 0.3;
  const tLab = at(P.labCue, D * 0.55) - 0.4;
  const tSame = tLab + 1.0;
  const tExact = at(P.exactCue, D * 0.88) - 0.5;
  const feet = 1000, LX = 255, RX = 720;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.1, x: 440, y: 760 }, { t: tExam + 0.3, zoom: 1.08, x: 445, y: 740 }, { t: tLab + 0.2, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.02, x: 487, y: 730 }]);
  K.world.city(ctx, { t, time: 'day', groundY: 990 });
  // bank: building + portico with columns
  const bk = K.popIn(t, tBank, 0.5);
  ctx.save(); ctx.translate(LX, feet); ctx.scale(1, 0.4 + 0.6 * Math.min(1.05, Math.max(bk, t > 0.01 ? 0.0001 : 0))); ctx.translate(-LX, -feet);
  if (bk > 0) {
    K.drawBuilding(ctx, LX, feet, 0.8, { t, color: '#7a6f9e', floors: 6, lit: 0.5 });
    ctx.fillStyle = '#e8e2d2';
    H.roundRect(ctx, LX - 110, feet - 120, 220, 18, 4); ctx.fill();
    for (let i = 0; i < 5; i++) { H.roundRect(ctx, LX - 95 + i * 44, feet - 102, 14, 92, 4); ctx.fill(); }
    H.roundRect(ctx, LX - 115, feet - 12, 230, 14, 4); ctx.fill();
    ctx.beginPath(); ctx.moveTo(LX - 110, feet - 120); ctx.lineTo(LX, feet - 165); ctx.lineTo(LX + 110, feet - 120); ctx.closePath(); ctx.fill();
    K.drawCoin(ctx, LX, feet - 124, 0.5, { spin: t * 2 });
  }
  ctx.restore();
  if (bk > 0) K.drawLabel(ctx, LX, 1052, Math.min(1, bk), { text: P.left || 'BANK', size: 28, dot: true });
  // AI lab
  const lk = K.popIn(t, tLab - 0.4, 0.5);
  K.drawBuilding(ctx, RX, feet, 0.8, { t, color: '#4d5d9a', floors: 6, lit: 0.3 + 0.5 * smooth((t - tLab) / 0.6) });
  if (lk > 0) {
    K.glow(ctx, RX, feet - 140, 160, ACC, 0.25 * clamp(lk));
    K.drawLabel(ctx, RX, 1052, Math.min(1, lk), { text: P.right || 'AI LAB', size: 28, dot: true });
  }
  // passers-by
  K.drawPerson(ctx, 470, 1035, 1.05, { t, pose: 'stand', look: t < tLab ? -0.8 : 0.8, mood: 'neutral', skin: 4, hair: 0, shirt: 1, hairStyle: 'curly', seed: 5 });
  ctx.restore();

  // insets
  inset(ctx, t, info, LX, 560, tExam, 'bank', P.leftTag || 'Resident examiner');
  inset(ctx, t, info, RX, 560, tLab, 'lab', P.rightTag || 'Embedded evaluator');

  // = / ≈ between the insets
  const ek = K.popIn(t, tSame, 0.4);
  if (ek > 0) {
    const wob = t > tExact ? smooth((t - tExact) / 0.5) : 0;
    ctx.save(); ctx.translate(487, 560); ctx.scale(Math.min(1.05, ek), Math.min(1.05, ek));
    ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.fillStyle = 'rgba(8,10,24,0.92)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.strokeStyle = ACC; ctx.lineWidth = 9; ctx.lineCap = 'round';
    for (const dy of [-11, 11]) {
      ctx.beginPath();
      for (let i = 0; i <= 16; i++) { const x = -24 + i * 3; const y = dy + Math.sin((i / 16) * Math.PI * 2) * 7 * wob; if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.stroke();
    }
    ctx.restore();
    // caption pill under the sign
    const txt = wob > 0.5 ? (P.notExact || 'Not an exact match') : (P.same || 'Same idea');
    const pk = wob > 0.5 ? K.popIn(t, tExact + 0.25, 0.4) : 1;
    ctx.save(); ctx.translate(487, 445); ctx.scale(Math.min(1.05, pk), Math.min(1.05, pk));
    ctx.font = H.font('ui', 28); const w = ctx.measureText(txt).width + 50;
    H.roundRect(ctx, -w / 2, -26, w, 52, 26); ctx.fillStyle = wob > 0.5 ? 'rgba(10,12,24,0.92)' : ACC; ctx.fill();
    if (wob > 0.5) { ctx.lineWidth = 2.5; ctx.strokeStyle = ACC; ctx.stroke(); }
    ctx.fillStyle = wob > 0.5 ? '#ffffff' : '#14160a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 2);
    ctx.restore();
  }
}

function inset(ctx, t, info, cx, cy, t0, kind, tag) {
  const H = info.helpers, K = H.kit, ACC = info.accent;
  const k = K.popIn(t, t0, 0.45);
  if (k <= 0) return;
  const R = 118;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  // tail to the building
  ctx.beginPath(); ctx.moveTo(-22, R - 8); ctx.lineTo(0, R + 40); ctx.lineTo(22, R - 8); ctx.fillStyle = ACC; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fillStyle = kind === 'bank' ? '#3b3557' : '#262d4d'; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.fillStyle = kind === 'bank' ? '#2c2843' : '#1d2340'; ctx.fillRect(-R, 50, 2 * R, R);
  if (kind === 'bank') {
    // vault door behind
    ctx.beginPath(); ctx.arc(62, -10, 46, 0, Math.PI * 2); ctx.fillStyle = '#8a93a8'; ctx.fill();
    ctx.beginPath(); ctx.arc(62, -10, 32, 0, Math.PI * 2); ctx.fillStyle = '#b9c1d6'; ctx.fill();
    ctx.save(); ctx.translate(62, -10); ctx.rotate(t * 0.6); ctx.strokeStyle = '#5b6380'; ctx.lineWidth = 5;
    for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(22, 0); ctx.stroke(); } ctx.restore();
    K.drawPerson(ctx, -30, 112, 0.72, { t, pose: 'stand', shirt: '#a08be0', skin: 0, hair: 3, hairStyle: 'short', mood: 'neutral', seed: 4, look: 0.8 });
    // magnifier in front of the face
    const mx = 8 + Math.sin(t * 1.4) * 6, my = -36;
    ctx.strokeStyle = '#764d31'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(mx - 10, my + 14); ctx.lineTo(mx - 24, my + 34); ctx.stroke();
    ctx.beginPath(); ctx.arc(mx, my, 16, 0, Math.PI * 2); ctx.fillStyle = 'rgba(180,230,255,0.45)'; ctx.fill(); ctx.strokeStyle = '#d5dae8'; ctx.lineWidth = 4; ctx.stroke();
  } else {
    // server racks behind
    K.drawServerRack(ctx, 70, 60, 0.5, { t, activity: 0.8 });
    K.drawPerson(ctx, -30, 104, 0.7, { t, pose: 'sit-laptop', typing: 1, shirt: '#4fb3a6', skin: 2, hair: 0, hairStyle: 'bun', mood: 'happy', seed: 2 });
    K.drawDesk(ctx, -30, 112, 0.5);
    K.drawLaptop(ctx, -30, 112 - 55, 0.36, { t, screen: 'code', typing: true });
    // badge on chest
    ctx.fillStyle = '#ffffff'; H.roundRect(ctx, -36, 104 - 0.6 * 140, 12, 15, 2); ctx.fill(); ctx.fillStyle = ACC; ctx.fillRect(-36, 104 - 0.6 * 140, 12, 5);
  }
  ctx.restore();
  ctx.lineWidth = 6; ctx.strokeStyle = ACC; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
  // tag pill
  const tk = K.popIn(t, t0 + 0.35, 0.35);
  if (tk > 0) {
    ctx.save(); ctx.translate(0, R + 6); ctx.scale(Math.min(1.05, tk), Math.min(1.05, tk));
    const f = H.fitText(ctx, tag, 'ui', 26, 18, 290); ctx.font = f.font;
    const w = ctx.measureText(f.text).width + 40;
    H.roundRect(ctx, -w / 2, -22, w, 44, 22); ctx.fillStyle = 'rgba(10,12,24,0.92)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = H.rgba(ACC, 0.8); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
    ctx.restore();
  }
  ctx.restore();
}
