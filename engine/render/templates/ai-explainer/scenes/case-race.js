// Scene "case-race" (full frame). Clinic wall with two glass score tubes: the AI system's tube (robot beside it) and
// the doctors' tube (cartoon doctor beside it). A case-count pill (+ optional source pill) lands while case files
// rain onto a pile; each tube fills to its published % on its cue with a counting number; then the robot cheers
// and the doctor shrugs. mode "er": emergency-room wall sign, otherwise the same.
// params: mode (""|"er"), count, source, ai, docs (numbers 0-100), aiLabel, docLabel, countCue, aiCue, docCue
// Fits: "AI vs professionals" accuracy results, head-to-head benchmark scores.

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tC = at(P.countCue, D * 0.1), tA = Math.max(tC + 0.8, at(P.aiCue, D * 0.45)), tD = Math.max(tA + 1, at(P.docCue, D * 0.75));
  const er = P.mode === 'er';

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 487, y: 780 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  K.world.room(ctx, { t, time: 'day', wall: er ? '#3a3a5e' : '#2c4a5c', floor: '#1d2c3c', window: false, picture: false, lamp: false, plant: false, floorY: 880 });
  if (er) {
    H.roundRect(ctx, 380, 760, 220, 46, 10); ctx.fillStyle = '#c94a4a'; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('bold', 26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('EMERGENCY', 490, 784);
  }

  // case files raining onto a pile between the tubes
  const N = 9;
  for (let i = 0; i < N; i++) {
    const ti = tC + i * 0.12, f = K.phase(t, ti, ti + 0.6, H.easeOutCubic);
    if (f <= 0) continue;
    const px = 490 + (H.hash(i, 3) - 0.5) * 90, py = 1030 - Math.floor(i / 3) * 18 - (i % 3) * 6;
    const x = lerp(px + (H.hash(i, 7) - 0.5) * 300, px, f), y = lerp(560, py, f);
    ctx.save(); ctx.translate(x, y); ctx.rotate((H.hash(i, 9) - 0.5) * 0.5 * (1 - f * 0.6));
    H.roundRect(ctx, -46, -26, 92, 30, 6); ctx.fillStyle = i % 2 ? '#e8bd62' : '#d9a94f'; ctx.fill();
    ctx.fillStyle = '#f6f1e4'; ctx.fillRect(-34, -22, 50, 5);
    ctx.restore();
  }

  // tubes
  const tube = (cx, val, tStart, label, hot) => {
    const top = 670, bot = 920, w = 120;
    const f = K.phase(t, tStart, tStart + 1.3, H.easeOutCubic), v = val * f;
    H.roundRect(ctx, cx - w / 2 - 8, top - 8, w + 16, bot - top + 16, 30); ctx.fillStyle = 'rgba(10,14,24,0.7)'; ctx.fill();
    H.roundRect(ctx, cx - w / 2, top, w, bot - top, 24); ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.stroke();
    const h = (bot - top) * v / 100;
    if (h > 1) {
      ctx.save(); H.roundRect(ctx, cx - w / 2, top, w, bot - top, 24); ctx.clip();
      ctx.fillStyle = hot ? ACC : '#9fb3d1';
      const wob = Math.sin(t * 5) * 4 * (1 - clamp((t - tStart - 1.3) / 1));
      ctx.beginPath(); ctx.moveTo(cx - w / 2, bot); ctx.lineTo(cx - w / 2, bot - h + wob); ctx.quadraticCurveTo(cx, bot - h - wob, cx + w / 2, bot - h + wob); ctx.lineTo(cx + w / 2, bot); ctx.closePath(); ctx.fill();
      // bubbles
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 5; i++) { const ph = ((t * 0.6 + H.hash(i, cx)) % 1); const by = bot - ph * h; if (by > bot - h + 8) { ctx.beginPath(); ctx.arc(cx - 35 + i * 17, by, 4, 0, Math.PI * 2); ctx.fill(); } }
      ctx.restore();
    }
    // dashed 50% tick
    ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx - w / 2 - 14, (top + bot) / 2); ctx.lineTo(cx + w / 2 + 14, (top + bot) / 2); ctx.stroke(); ctx.setLineDash([]);
    // number
    const pop = K.popIn(t, tStart, 0.4);
    if (pop > 0) {
      ctx.save(); ctx.translate(cx, 630); ctx.scale(Math.min(1.08, pop), Math.min(1.08, pop));
      ctx.font = H.font('display', 76); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = hot ? ACC : '#ffffff';
      ctx.fillText(Math.round(v) + '%', 0, 0);
      ctx.restore();
    }
    // label plate
    H.roundRect(ctx, cx - 95, 940, 190, 44, 22); ctx.fillStyle = 'rgba(10,12,22,0.86)'; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('ui', 26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, cx, 963);
  };
  tube(300, P.ai ?? 70, tA, P.aiLabel || 'AI system', true);
  tube(680, P.docs ?? 40, tD, P.docLabel || 'Doctors', false);

  // characters
  const done = t > tD + 1.2;
  K.drawRobot(ctx, 140, 1040, 0.85, { t, state: t > tA + 1.3 ? 'happy' : 'thinking', seed: 3 });
  drawDoctor(ctx, K, 850, 1040, 1.0, { t, pose: done ? 'shrug' : 'stand', mood: done ? 'worried' : 'neutral', look: -0.8, skin: 1, hair: 3, hairStyle: 'bun', seed: 8, flip: true });
  ctx.restore(); // camera

  // pills
  const pc = K.popIn(t, tC, 0.45);
  if (pc > 0) K.drawLabel(ctx, 487, 480, pc, { text: P.count || 'Hard cases', size: 30, accent: true });
  if (P.source) { const ps = K.popIn(t, tC + 0.6, 0.45); if (ps > 0) K.drawLabel(ctx, 487, 540, ps, { text: P.source, size: 22, dot: true }); }
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
