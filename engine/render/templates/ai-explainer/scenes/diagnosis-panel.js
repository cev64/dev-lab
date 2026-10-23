// Scene "diagnosis-panel" (full frame, best as a 2-beat span). Clinic consult room: a cartoon doctor (white coat,
// stethoscope) and the kit robot face a mystery CASE FILE on a desk. Beat 2: a journal pill + date pill land, the
// robot gets the system's name, then on panelCue it splits into three mini "virtual doctor" bots that each say one
// step (ask questions / order tests / debate) on their cue; the human doctor watches, surprised.
// params: file, journal, date, system, panel [3 strings], panelCues [3 words], journalCue, systemCue, panelCue
// Fits: AI diagnosis / medical AI stories, "a panel of AI agents debates", multi-agent orchestration.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tJ = at(P.journalCue, D * 0.25), tS = Math.max(tJ + 1.2, at(P.systemCue, D * 0.4));
  const tP = Math.max(tS + 0.8, at(P.panelCue, D * 0.6));
  const steps = P.panel || ['Ask questions', 'Order tests', 'Debate'];
  const cues = (P.panelCues || []).map((w, i) => Math.max(tP + 0.6 + i * 0.4, at(w, tP + 1 + i * 1.2)));

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.1, x: 420, y: 820 }, { t: tP, zoom: 1.03, x: 480, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  clinic(ctx, t, K, H, ACC);

  // desk + case file
  K.drawDesk(ctx, 330, 1040, 1.0);
  caseFile(ctx, 330, 930, 1.0, t, K, H, ACC, P.file || 'CASE FILE');

  // human doctor, left
  const surprised = t > tP + 0.4;
  drawDoctor(ctx, K, 140, 1040, 1.3, { t, pose: surprised ? 'shrug' : 'stand', mood: surprised ? 'shocked' : 'neutral', look: 0.9, skin: 3, hair: 1, hairStyle: 'short', seed: 4, talk: 0 });

  // robot: one big robot, then splits into 3 mini bots
  const split = K.phase(t, tP, tP + 0.9, H.easeInOutCubic);
  const slots = [{ x: 560, y: 1040 }, { x: 700, y: 1000 }, { x: 840, y: 1040 }];
  if (split < 1) {
    const s = lerp(1.35, 0.9, split);
    ctx.save(); ctx.globalAlpha = 1 - split * 0.9;
    K.drawRobot(ctx, 700, 1040, s, { t, state: t > tS ? 'thinking' : 'idle', seed: 2, flip: true });
    ctx.restore();
  }
  if (split > 0) {
    slots.forEach((sl, i) => {
      const x = lerp(700, sl.x, split), y = lerp(1040, sl.y, split);
      const busy = cues[i] != null && t > cues[i];
      ctx.save(); ctx.globalAlpha = clamp(split * 1.5);
      K.drawRobot(ctx, x, y, 0.82, { t, state: busy ? 'working' : 'thinking', seed: 5 + i, flip: true, talk: busy ? info.env * 0.7 : 0 });
      ctx.restore();
      // tiny white collar = "virtual doctor"
      ctx.save(); ctx.globalAlpha = clamp(split * 1.5);
      ctx.fillStyle = '#eef2f8'; H.roundRect(ctx, x - 26, y - 0.82 * 128, 52, 12, 6); ctx.fill();
      ctx.restore();
    });
    // speech bubbles, staggered heights so they never overlap
    const bub = [{ x: 560, y: 830, tail: 'center' }, { x: 700, y: 690, tail: 'center' }, { x: 830, y: 830, tail: 'right' }];
    steps.slice(0, 3).forEach((txt, i) => {
      const c = cues[i] != null ? cues[i] : tP + 1 + i * 1.2;
      const p = K.popIn(t, c, 0.4);
      if (p > 0) K.drawSpeechBubble(ctx, bub[i].x, bub[i].y, 1, { text: txt, size: 25, maxW: 170, tail: bub[i].tail, pop: Math.min(1.05, p) });
    });
  }
  ctx.restore(); // camera

  // top slot: journal pill + date, then the system name
  const pj = K.popIn(t, tJ, 0.45) * (1 - K.phase(t, tS - 0.25, tS));
  if (pj > 0) {
    K.drawLabel(ctx, 487, 490, pj, { text: P.journal || 'Published in a journal', size: 30, accent: true });
    if (P.date) K.drawLabel(ctx, 487, 556, K.popIn(t, tJ + 0.35, 0.4) * (1 - K.phase(t, tS - 0.25, tS)), { text: P.date, size: 24, dot: true });
  }
  const ps = K.popIn(t, tS, 0.45);
  if (ps > 0) K.drawLabel(ctx, 487, 490, ps, { text: P.system || 'AI system', size: 30, dot: true });
  const pv = K.popIn(t, tP + 0.5, 0.45);
  if (pv > 0) K.drawLabel(ctx, 487, 556, pv, { text: P.virtual || 'a panel of virtual doctors', size: 24, accent: true });
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
