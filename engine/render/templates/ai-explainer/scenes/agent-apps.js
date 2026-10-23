// Scene "agent-apps" (full frame, 1 beat). Office at dusk: a worker at her desk, the robot helper beside the desk.
// Up to 4 app tiles (generic icons: mail | folder | calendar | chat, text names only, no logos) pop in a row on their
// cues and a dashed cable with moving packets links each to the robot. Then up to 4 output cards (icons: search |
// brief | slides | chart) pop out of the robot one per cue and settle in a 2x2 tray. Ends settled.
// params: apps [{text, icon, cue}] (<= 4), outputs [{text, icon, cue}] (<= 4), head ('' hides; pill over the tiles)
// Fits: an AI agent connected to workplace apps, "what staff can do with it", tool integrations.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const apps = (P.apps || [{ text: 'Mail', icon: 'mail' }, { text: 'Files', icon: 'folder' }, { text: 'Calendar', icon: 'calendar' }, { text: 'Chat', icon: 'chat' }]).slice(0, 4);
  const outs = (P.outputs || [{ text: 'Research', icon: 'search' }, { text: 'Briefs', icon: 'brief' }, { text: 'Slides', icon: 'slides' }, { text: 'Data', icon: 'chart' }]).slice(0, 4);
  const tA = apps.map((a, i) => at(a.cue, D * (0.05 + i * 0.1)) - 0.15);
  const tO = outs.map((o, i) => Math.max(tA[tA.length - 1] + 0.5, at(o.cue, D * (0.5 + i * 0.11)) - 0.2));
  const RX = 740, RY = 1045, RS = 1.2; // robot
  const robotHead = [RX, RY - 190 * RS];

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 760 }, { t: D, zoom: 1.0 }]);
  K.world.office(ctx, { t, time: 'dusk' });
  K.drawDesk(ctx, 360, 1045, 1.25);
  const top = 1045 - 110 * 1.25;
  K.drawPerson(ctx, 220, 1045, 1.28, { t, pose: 'sit-laptop', typing: 0.6, mood: t > tO[0] ? 'happy' : 'neutral', skin: 3, hair: 0, shirt: 2, hairStyle: 'bun', seed: 9, look: 0.7 });
  K.drawLaptop(ctx, 390, top, 0.8, { t, screen: 'chat' });
  const working = t > tA[0] && t < tO[outs.length - 1] + 0.6;
  K.drawRobot(ctx, RX, RY, RS, { t, state: working ? 'working' : 'happy', flip: true, seed: 5 });
  ctx.restore();

  // app tiles row
  const TW = 170, TH = 150, gap = 22, n = apps.length, x0 = 487 - ((n * TW + (n - 1) * gap) / 2) + TW / 2, TY = 505;
  apps.forEach((a, i) => {
    const p = K.popIn(t, tA[i], 0.45);
    if (p <= 0) return;
    const x = x0 + i * (TW + gap);
    // cable to the robot
    const lk = clamp((t - tA[i] - 0.2) / 0.5);
    if (lk > 0) {
      const pts = K.bezier(x, TY + TH / 2 + 30, x, TY + 300, robotHead[0], robotHead[1] - 260, robotHead[0], robotHead[1] - 40, 24);
      ctx.save(); ctx.setLineDash([10, 10]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = rgba(ACC, 0.7); ctx.lineWidth = 4;
      K.pathDraw(ctx, pts, lk); ctx.restore();
      if (lk >= 1) for (let k = 0; k < 2; k++) { const u = ((t * 0.7 + k * 0.5 + i * 0.13) % 1); const q = K.pathPoint(pts, u); ctx.beginPath(); ctx.arc(q[0], q[1], 7, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill(); }
    }
    ctx.save(); ctx.translate(x, TY); ctx.scale(Math.min(1.05, p), Math.min(1.05, p));
    roundRect(ctx, -TW / 2, -TH / 2, TW, TH, 26); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = lk >= 1 ? ACC : 'rgba(255,255,255,0)'; ctx.stroke();
    drawIcon(ctx, H, a.icon, 0, -14, 1, ACC, t);
    ctx.font = H.font('ui', 26); ctx.fillStyle = '#161927'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const f = H.fitText(ctx, a.text, 'ui', 26, 20, TW - 16); ctx.font = f.font; ctx.fillText(f.text, 0, 48);
    ctx.restore();
  });
  if (P.head) { const ph = K.popIn(t, tA[0] - 0.3, 0.4); if (ph > 0) K.drawLabel(ctx, 487, 432, ph, { text: P.head, size: 28 }); }

  // output cards fly from the robot into a 2x2 tray
  const slots = [[300, 645], [630, 645], [300, 735], [630, 735]];
  outs.forEach((o, i) => {
    const s = t - tO[i]; if (s <= 0) return;
    const fl = H.easeOutBack(clamp(s / 0.6));
    const x = lerp(robotHead[0] - 60, slots[i][0], fl), y = lerp(robotHead[1], slots[i][1], fl);
    const sc = lerp(0.3, 1, clamp(s / 0.4));
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    roundRect(ctx, -155, -38, 310, 76, 18); ctx.fillStyle = 'rgba(8,10,24,0.92)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.85); ctx.stroke();
    drawIcon(ctx, H, o.icon, -118, 0, 0.42, ACC, t);
    const f = H.fitText(ctx, o.text, 'ui', 30, 22, 230); ctx.font = f.font; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(f.text, -88, 2);
    ctx.restore();
  });
}

// simple flat icons centred at (x, y), ~90 px at s = 1
function drawIcon(ctx, H, kind, x, y, s, ACC, t) {
  const { roundRect } = H;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 'mail') {
    roundRect(ctx, -44, -30, 88, 60, 8); ctx.fillStyle = '#e8786a'; ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-40, -24); ctx.lineTo(0, 6); ctx.lineTo(40, -24); ctx.stroke();
  } else if (kind === 'folder') {
    roundRect(ctx, -44, -34, 40, 20, 6); ctx.fillStyle = '#d9a23a'; ctx.fill();
    roundRect(ctx, -44, -24, 88, 56, 8); ctx.fillStyle = '#f2bf4a'; ctx.fill();
  } else if (kind === 'calendar') {
    roundRect(ctx, -40, -34, 80, 70, 8); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#c6cbe0'; ctx.lineWidth = 3; ctx.stroke();
    roundRect(ctx, -40, -34, 80, 20, 8); ctx.fillStyle = '#4c7be0'; ctx.fill(); ctx.fillRect(-40, -22, 80, 8);
    ctx.fillStyle = '#283152'; for (let a = 0; a < 4; a++) for (let b = 0; b < 3; b++) ctx.fillRect(-30 + a * 17, -6 + b * 13, 9, 8);
    ctx.fillStyle = '#e8786a'; ctx.fillRect(-30 + 2 * 17, -6 + 13, 9, 8);
  } else if (kind === 'chat') {
    roundRect(ctx, -44, -32, 88, 56, 16); ctx.fillStyle = '#a08be0'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-24, 20); ctx.lineTo(-30, 38); ctx.lineTo(-6, 22); ctx.fill();
    ctx.fillStyle = '#ffffff'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-20 + i * 20, -4 + Math.sin(t * 6 + i) * 2, 6, 0, Math.PI * 2); ctx.fill(); }
  } else if (kind === 'search') {
    ctx.strokeStyle = ACC; ctx.lineWidth = 12; ctx.beginPath(); ctx.arc(-8, -8, 26, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(14, 14); ctx.lineTo(38, 38); ctx.stroke();
  } else if (kind === 'brief') {
    roundRect(ctx, -32, -42, 64, 84, 8); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = ACC; ctx.fillRect(-20, -30, 30, 8); ctx.fillStyle = '#9aa3bd'; for (let i = 0; i < 4; i++) ctx.fillRect(-20, -12 + i * 14, 40 - (i === 3 ? 16 : 0), 6);
  } else if (kind === 'slides') {
    roundRect(ctx, -44, -34, 88, 60, 6); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = ACC; ctx.fillRect(-30, 4, 14, 14); ctx.fillRect(-10, -8, 14, 26); ctx.fillRect(10, -20, 14, 38);
    ctx.fillStyle = '#9aa3bd'; ctx.fillRect(-4, 26, 8, 14); ctx.fillRect(-20, 38, 40, 6);
  } else { // chart
    ctx.strokeStyle = ACC; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-40, 26); ctx.lineTo(-14, 0); ctx.lineTo(6, 14); ctx.lineTo(40, -28); ctx.stroke();
    ctx.strokeStyle = '#9aa3bd'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-44, -36); ctx.lineTo(-44, 38); ctx.lineTo(44, 38); ctx.stroke();
  }
  ctx.restore();
}
