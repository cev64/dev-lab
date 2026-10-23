// Scene "exam-room" (full frame, payoff). Clinic exam room: a cartoon patient sits on an exam bed, a cartoon doctor
// on one side and the kit robot on the other. On nextCue a "next" pill + sub pill land (the real-world test to
// come); on qCue they give way to a question card with a pulsing "?", the robot and the doctor both turn to the
// viewer. Settles at the end.
// params: next, sub, question, nextCue, qCue
// Fits: payoff for medical-AI stories: "AI in the exam room?", "would you trust it?".
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tN = at(P.nextCue, D * 0.15), tQ = Math.max(tN + 1.2, at(P.qCue, D * 0.6));

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 487, y: 800 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  clinic(ctx, t, K, H, ACC);

  // exam bed
  const bx = 500;
  K.shadow(ctx, bx, 1040, 380);
  ctx.fillStyle = '#8b96bb'; ctx.fillRect(bx - 160, 920, 12, 120); ctx.fillRect(bx + 148, 920, 12, 120);
  H.roundRect(ctx, bx - 180, 890, 360, 40, 14); ctx.fillStyle = '#5f7fa8'; ctx.fill();
  H.roundRect(ctx, bx - 180, 884, 360, 14, 7); ctx.fillStyle = '#eef2f8'; ctx.fill(); // paper sheet
  H.roundRect(ctx, bx + 110, 860, 80, 30, 12); ctx.fillStyle = '#eef2f8'; ctx.fill();   // pillow

  // patient sitting on the bed
  K.drawPerson(ctx, bx - 20, 1000, 1.25, { t, pose: 'sit', seat: false, mood: t > tQ ? 'happy' : 'neutral', skin: 0, hair: 2, hairStyle: 'long', shirt: 3, seed: 21, look: t > tQ ? 0 : -0.5 });
  // doctor left, robot right
  drawDoctor(ctx, K, 200, 1040, 1.3, { t, pose: t > tN && t < tQ ? 'point' : 'stand', mood: 'happy', skin: 4, hair: 1, hairStyle: 'short', seed: 17, look: t > tQ ? 0 : 0.7 });
  const arrive = K.phase(t, tN - 0.2, tN + 1.0, H.easeInOutCubic);
  K.drawRobot(ctx, lerp(1000, 820, arrive), 1040, 1.1, { t, state: t > tQ ? 'happy' : arrive < 1 ? 'working' : 'thinking', seed: 9, flip: true });
  ctx.restore(); // camera

  const fade = 1 - K.phase(t, tQ - 0.25, tQ + 0.1);
  const pn = K.popIn(t, tN, 0.45) * fade;
  if (pn > 0) K.drawLabel(ctx, 487, 500, pn, { text: P.next || 'Next: real patients', size: 32, accent: true });
  const ps = K.popIn(t, tN + 0.5, 0.45) * fade;
  if (ps > 0) K.drawLabel(ctx, 487, 566, ps, { text: P.sub || 'Planned study', size: 26, dot: true });

  const pq = K.popIn(t, tQ, 0.5);
  if (pq > 0) {
    ctx.save(); ctx.translate(487, 520); ctx.scale(Math.min(1.04, pq), Math.min(1.04, pq)); ctx.translate(-487, -520);
    H.roundRect(ctx, 100, 430, 775, 170, 26); ctx.fillStyle = 'rgba(10,12,24,0.9)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(ACC, 0.7); ctx.stroke();
    const q = P.question || 'Would you trust it?';
    const sz = H.fitText(ctx, q, 'display', 52, 30, 560);
    ctx.font = H.font('display', sz); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(q, 140, 515);
    const k = 1 + 0.1 * Math.sin((t - tQ) * 5);
    ctx.save(); ctx.translate(790, 515); ctx.scale(k, k);
    ctx.beginPath(); ctx.arc(0, 0, 52, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = '#12160a'; ctx.font = H.font('display', 70); ctx.textAlign = 'center'; ctx.fillText('?', 0, 4);
    ctx.restore();
    ctx.restore();
  }
}

// ---- shared bits (duplicated in this story's scenes)
function clinic(ctx, t, K, H, ACC) {
  K.world.room(ctx, { t, time: 'day', wall: '#2c4a5c', floor: '#1d2c3c', window: false, picture: false, lamp: false, plant: true, floorY: 880 });
  // light box with a generic chest x-ray
  H.roundRect(ctx, 600, 600, 250, 190, 12); ctx.fillStyle = '#16212d'; ctx.fill();
  H.roundRect(ctx, 612, 612, 226, 166, 8); ctx.fillStyle = '#cfe6f2'; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
  ctx.fillStyle = '#7d9fb3';
  ctx.beginPath(); ctx.ellipse(690, 695, 38, 62, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(760, 695, 38, 62, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e9f4fa'; ctx.lineWidth = 4;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(660, 655 + i * 24); ctx.quadraticCurveTo(725, 640 + i * 24, 790, 655 + i * 24); ctx.stroke(); }
  // heart monitor on the wall
  H.roundRect(ctx, 150, 600, 230, 140, 14); ctx.fillStyle = '#121a26'; ctx.fill();
  H.roundRect(ctx, 162, 612, 206, 116, 8); ctx.fillStyle = '#0b1f22'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.rect(162, 612, 206, 116); ctx.clip();
  ctx.strokeStyle = ACC; ctx.lineWidth = 3; ctx.beginPath();
  for (let x = 0; x <= 206; x += 2) {
    const u = ((x / 206) * 2 - t * 0.8) % 1, v = ((u % 1) + 1) % 1;
    const y = v > 0.45 && v < 0.5 ? -40 * Math.sin((v - 0.45) / 0.05 * Math.PI) : v > 0.5 && v < 0.53 ? 14 : 0;
    if (x === 0) ctx.moveTo(162 + x, 670 + y); else ctx.lineTo(162 + x, 670 + y);
  }
  ctx.stroke(); ctx.restore();
}

function caseFile(ctx, x, y, s, t, K, H, ACC, title) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.04);
  H.roundRect(ctx, -95, -150, 70, 26, 8); ctx.fillStyle = '#d9a94f'; ctx.fill();
  H.roundRect(ctx, -95, -135, 190, 135, 10); ctx.fillStyle = '#e8bd62'; ctx.fill();
  ctx.fillStyle = '#f6f1e4'; H.roundRect(ctx, -80, -150, 160, 30, 4); ctx.fill();
  ctx.fillStyle = '#5a3d10'; ctx.font = H.font('bold', 22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(title, 0, -108);
  const q = 1 + 0.08 * Math.sin(t * 4);
  ctx.save(); ctx.translate(0, -52); ctx.scale(q, q);
  ctx.fillStyle = '#7a4f0c'; ctx.font = H.font('display', 58); ctx.fillText('?', 0, 4);
  ctx.restore();
  ctx.restore();
}

function drawDoctor(ctx, K, x, y, s, o) {
  K.drawPerson(ctx, x, y, s, Object.assign({}, o, { shirt: '#eef2f8' }));
  const sit = (o.pose || '').startsWith('sit');
  const shY = (sit ? -78 : -104) - 64;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.flip) ctx.scale(-1, 1);
  // inner shirt strip + lapels
  ctx.fillStyle = '#4f86c6'; ctx.beginPath(); ctx.moveTo(-9, shY + 2); ctx.lineTo(9, shY + 2); ctx.lineTo(4, shY + 46); ctx.lineTo(-4, shY + 46); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#c3cad8'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-9, shY + 2); ctx.lineTo(-2, shY + 60); ctx.moveTo(9, shY + 2); ctx.lineTo(2, shY + 60); ctx.stroke();
  // pocket + pen
  ctx.fillStyle = '#d6dce8'; ctx.fillRect(-26, shY + 34, 14, 12); ctx.fillStyle = '#4f86c6'; ctx.fillRect(-22, shY + 28, 3, 10);
  // stethoscope
  ctx.strokeStyle = '#2b3145'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-12, shY - 2); ctx.bezierCurveTo(-20, shY + 30, 18, shY + 34, 12, shY - 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, shY + 22); ctx.lineTo(16, shY + 40); ctx.stroke();
  ctx.fillStyle = '#b8c2d6'; ctx.beginPath(); ctx.arc(16, shY + 44, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
