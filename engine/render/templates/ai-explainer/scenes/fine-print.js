// Scene "fine-print" (full frame, 1 beat, caveat). Night office: a big details sheet on an easel with a title and
// up to 3 rows whose values start as grey blanks. A magnifying glass moves row to row; on each row's cue its value
// fills in with an icon (hourglass = pending, black bar + padlock = not public, calendar = later). A cartoon reader
// points at the sheet, mood worried -> neutral. Ends settled (glass hovering, hourglass sand running).
// Fits: caveats / open questions: "still needs approval", "number not disclosed", "details due later".
// params: title ("Details"), rows [{k, v, cue, icon: 'wait'|'hidden'|'later'}] (<= 3; icons default in that order)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const rows = (P.rows || [{ k: 'Approval', v: 'Pending' }, { k: 'Key number', v: 'Not public' }, { k: 'Who decides', v: 'Later' }]).slice(0, 3);
  const icons = ['wait', 'hidden', 'later'];
  const tR = rows.map((r, i) => at(r.cue, D * (0.15 + i * 0.28)) - 0.2);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 560, y: 690 }, { t: D, zoom: 1.0 }]);
  const room = K.world.room(ctx, { t, time: 'night', floorY: 990, lamp: false, plant: false, picture: false });
  void room;

  // easel + sheet
  const SX0 = 300, SX1 = 900, SY0 = 420, SY1 = 950;
  ctx.fillStyle = '#5a4030'; ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = '#6b4a36'; ctx.lineWidth = 16;
  ctx.beginPath(); ctx.moveTo(420, 940); ctx.lineTo(380, 1030); ctx.moveTo(780, 940); ctx.lineTo(820, 1030); ctx.moveTo(600, 940); ctx.lineTo(600, 1020); ctx.stroke(); ctx.restore();
  K.shadow(ctx, 600, 1032, 520);
  roundRect(ctx, SX0 + 8, SY0 + 10, SX1 - SX0, SY1 - SY0, 18); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
  roundRect(ctx, SX0, SY0, SX1 - SX0, SY1 - SY0, 18); ctx.fillStyle = '#f2f4fa'; ctx.fill();
  roundRect(ctx, SX0, SY0, SX1 - SX0, 90, 18); ctx.fillStyle = '#2a2f45'; ctx.fill(); ctx.fillRect(SX0, SY0 + 60, SX1 - SX0, 30);
  ctx.font = H.font('display', 38); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(P.title || 'Details', SX0 + 32, SY0 + 46);
  const RY = [SY0 + 170, SY0 + 310, SY0 + 450];
  rows.forEach((r, i) => {
    const y = RY[i];
    if (i > 0) { ctx.fillStyle = '#d5dae8'; ctx.fillRect(SX0 + 28, y - 70, SX1 - SX0 - 56, 2); }
    ctx.font = H.font('ui', 30); ctx.fillStyle = '#161927'; ctx.textAlign = 'left'; ctx.fillText(r.k, SX0 + 32, y);
    const k = clamp((t - tR[i]) / 0.35);
    const vx = SX0 + 290, vw = SX1 - 24 - vx;
    if (k < 1) { ctx.globalAlpha = 1 - k; roundRect(ctx, vx, y - 22, vw, 44, 10); ctx.fillStyle = '#d5dae8'; ctx.fill(); ctx.globalAlpha = 1; }
    if (k > 0) {
      const pk = Math.min(1.05, K.popIn(t, tR[i], 0.4));
      ctx.save(); ctx.translate(vx + vw / 2, y); ctx.scale(pk, pk);
      const icon = r.icon || icons[i];
      roundRect(ctx, -vw / 2, -30, vw, 60, 30); ctx.fillStyle = icon === 'hidden' ? '#161927' : ACC; ctx.fill();
      let fs = 28; ctx.font = H.font('ui', fs);
      while (fs > 22 && ctx.measureText(r.v).width > vw - 80) { fs -= 1; ctx.font = H.font('ui', fs); }
      ctx.fillStyle = icon === 'hidden' ? '#ffffff' : '#1b1a10'; ctx.textAlign = 'center';
      ctx.fillText(r.v, 22, 2);
      // icon at the left of the pill
      const ix = -vw / 2 + 32;
      ctx.save(); ctx.translate(ix, 0);
      if (icon === 'wait') {
        ctx.fillStyle = '#1b1a10'; ctx.beginPath(); ctx.moveTo(-11, -16); ctx.lineTo(11, -16); ctx.lineTo(0, 0); ctx.lineTo(11, 16); ctx.lineTo(-11, 16); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
        const sand = (t * 0.5) % 1; ctx.fillStyle = '#fff6cc'; ctx.beginPath(); ctx.moveTo(-6 * (1 - sand), -12 + 10 * sand); ctx.lineTo(6 * (1 - sand), -12 + 10 * sand); ctx.lineTo(0, -2); ctx.closePath(); ctx.fill();
        ctx.fillRect(-1, -2, 2, 14 * sand + 1);
      } else if (icon === 'hidden') {
        roundRect(ctx, -10, -4, 20, 18, 4); ctx.fillStyle = ACC; ctx.fill();
        ctx.strokeStyle = ACC; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, -4, 7, Math.PI, 0); ctx.stroke();
      } else {
        roundRect(ctx, -14, -13, 28, 28, 4); ctx.fillStyle = '#ffffff'; ctx.fill();
        ctx.fillStyle = '#ff6b5e'; ctx.fillRect(-14, -13, 28, 8);
        ctx.fillStyle = '#1b1a10'; for (let a = 0; a < 3; a++) for (let b = 0; b < 2; b++) ctx.fillRect(-9 + a * 7, -1 + b * 7, 4, 4);
      }
      ctx.restore();
      ctx.restore();
    }
  });

  // magnifying glass travels row to row
  let gi = 0; for (let i = 0; i < rows.length; i++) if (t >= tR[i] - 0.6) gi = i;
  const prev = Math.max(0, gi - 1), mv = clamp((t - (tR[gi] - 0.6)) / 0.5);
  const gy = lerp(RY[prev], RY[gi], gi === 0 ? 1 : H.easeInOutCubic(mv)) + Math.sin(t * 2) * 4;
  const gx = SX0 + 440 + Math.sin(t * 1.3) * 40;
  const gOut = clamp((t - tR[rows.length - 1] - 0.4) / 0.4);
  ctx.save(); ctx.globalAlpha = 1 - gOut; ctx.translate(gx + 80 * gOut, gy + 60);
  ctx.strokeStyle = '#3b4260'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(36, 36); ctx.lineTo(80, 80); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fillStyle = 'rgba(180,220,255,0.18)'; ctx.fill();
  ctx.lineWidth = 9; ctx.strokeStyle = '#3b4260'; ctx.stroke();
  ctx.beginPath(); ctx.arc(-14, -16, 14, Math.PI * 1.1, Math.PI * 1.6); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();

  // reader
  const done = t > tR[rows.length - 1] + 0.6;
  K.drawPerson(ctx, 175, 1032, 1.15, { t, pose: done ? 'shrug' : 'point', mood: done ? 'neutral' : 'worried', skin: 2, hair: 1, shirt: '#a08be0', hairStyle: 'curly', seed: 41, look: 1 });
  ctx.restore();
}
