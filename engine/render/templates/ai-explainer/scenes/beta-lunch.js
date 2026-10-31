// Scene "beta-lunch" (full frame, 1 beat ~8-11 s; caveat "it's early"). Daytime office: a seedling sprouts in a pot
// ("It's early"); a wall connector box with a text name plugs a glowing cable into the kit robot (date pill), a red
// "BETA" tag swings on the cable with a "Limited beta" pill; then the robot hands takeout bags to three office workers
// at a lunch table, who cheer, under a closing pill ("Mostly office lunches").
// Fits: "a new connector / API for AI agents just launched in beta", "early days, small pilot", workplace rollouts.
// params: early ("It's early"), box ("Connector"), date ("Just launched"), beta ("BETA"), limited ("Limited beta"),
//         lunch ("Small pilot"), cues ("word#n"): earlyCue, plugCue, dateCue, betaCue, lunchCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tEarly = at(P.earlyCue, D * 0.1) - 0.4;
  const tPlug = at(P.plugCue, D * 0.36) - 0.4;
  const tDate = at(P.dateCue, D * 0.55) - 0.2;
  const tBeta = at(P.betaCue, D * 0.7) - 0.25;
  const tLunch = at(P.lunchCue, D * 0.86) - 0.5;
  const feet = 1030;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 500, y: 740 }]);
  K.world.office(ctx, { t, time: 'day' });

  // ---- seedling (left) ----
  const sx = 150, grow = smooth(clamp((t - tEarly) / 1.2));
  ctx.fillStyle = '#b8643f'; ctx.beginPath(); ctx.moveTo(sx - 42, 940); ctx.lineTo(sx + 42, 940); ctx.lineTo(sx + 32, 1010); ctx.lineTo(sx - 32, 1010); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#9a4f30'; ctx.fillRect(sx - 46, 930, 92, 16);
  ctx.strokeStyle = '#5aa84a'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  const stemTop = 930 - 70 * grow;
  ctx.beginPath(); ctx.moveTo(sx, 930); ctx.quadraticCurveTo(sx + 6 * Math.sin(t * 2), (930 + stemTop) / 2, sx, stemTop); ctx.stroke();
  if (grow > 0.3) {
    const lf = smooth((grow - 0.3) / 0.7);
    ctx.fillStyle = '#7ccf5a';
    ctx.save(); ctx.translate(sx, stemTop + 8); ctx.rotate(-0.6 + 0.05 * Math.sin(t * 2)); ctx.beginPath(); ctx.ellipse(-22 * lf, 0, 24 * lf, 11 * lf, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.translate(sx, stemTop + 8); ctx.rotate(0.6 - 0.05 * Math.sin(t * 2)); ctx.beginPath(); ctx.ellipse(22 * lf, 0, 24 * lf, 11 * lf, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
  const ep = K.popIn(t, tEarly + 0.2, 0.4);
  if (ep > 0) K.drawLabel(ctx, sx + 30, 820, Math.min(1.05, ep), { text: P.early || "It's early", size: 28, dot: true });

  // ---- connector box on the wall ----
  const bx = 545, by = 520, bw = 250, bh = 110;
  roundRect(ctx, bx - bw / 2 - 8, by - bh / 2 - 8, bw + 16, bh + 16, 20); ctx.fillStyle = '#1b2036'; ctx.fill();
  roundRect(ctx, bx - bw / 2, by - bh / 2, bw, bh, 14); ctx.fillStyle = '#e8edf8'; ctx.fill();
  ctx.fillStyle = '#1b2036'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const boxText = P.box || 'Connector';
  ctx.font = H.font('display', H.fitText(ctx, boxText, 'display', 30, 22, bw - 40)); ctx.fillText(boxText, bx, by - 14);
  ctx.font = H.font('ui', 22); ctx.fillStyle = '#5a6290'; ctx.fillText('for AI agents', bx, by + 24);
  // socket under the box
  roundRect(ctx, bx - 30, by + bh / 2 + 4, 60, 30, 8); ctx.fillStyle = '#2b3058'; ctx.fill();
  const plugged = smooth((t - tPlug) / 0.6);
  K.glow(ctx, bx, by + bh / 2 + 20, 60, ACC, 0.3 * plugged);

  // ---- lunch table with three office workers (right) ----
  const tx = 790;
  ctx.fillStyle = '#6b4a36'; roundRect(ctx, tx - 150, 905, 300, 22, 8); ctx.fill();
  ctx.fillStyle = '#553a2d'; ctx.fillRect(tx - 130, 925, 18, 80); ctx.fillRect(tx + 112, 925, 18, 80);
  const cheer = t > tLunch + 1.0;
  const ws = [[tx - 95, 0, 2, 4, 'curly'], [tx, 2, 1, 0, 'short'], [tx + 95, 4, 3, 2, 'long']];
  ws.forEach(([x, skin, hair, shirt, style], i) => {
    K.drawPerson(ctx, x, feet - 60, 0.85, { t: t + i, pose: cheer ? 'cheer' : 'stand', mood: cheer ? 'happy' : 'neutral', skin, hair, shirt, hairStyle: style, seed: 50 + i, look: -0.6 });
  });
  // the table edge in front of the workers
  ctx.fillStyle = '#7d5841'; roundRect(ctx, tx - 160, 960, 320, 20, 8); ctx.fill();
  // ---- robot by the desk ----
  const RX = 470;
  K.drawDesk(ctx, 330, feet, 1.0);
  K.drawLaptop(ctx, 300, feet - 110, 0.7, { t, screen: 'chat' });
  const handing = t > tLunch;
  const walkU = smooth(clamp((t - tLunch) / 1.0));
  const rx = lerp(RX, 560, walkU);
  K.drawRobot(ctx, rx, feet, 1.0, { t, state: plugged > 0.5 ? (handing ? 'happy' : 'working') : 'idle', seed: 6 });
  // cable from socket to robot's head
  if (plugged > 0) {
    const x0 = bx, y0 = by + bh / 2 + 34, x1 = rx + 30, y1 = feet - 205;
    const pts = K.bezier(x0, y0, x0, y0 + 120, x1 + 80, y1 - 60, x1, y1, 30);
    ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.shadowColor = ACC; ctx.shadowBlur = 14;
    K.pathDraw(ctx, pts, plugged); ctx.restore();
    // energy pulses
    if (plugged >= 1) for (let i = 0; i < 3; i++) { const p = K.pathPoint(pts, ((t * 0.8 + i / 3) % 1)); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(p[0], p[1], 6, 0, Math.PI * 2); ctx.fill(); }
    // BETA tag hanging from the cable midpoint
    const bk = K.popIn(t, tBeta, 0.45);
    if (bk > 0) {
      const m = K.pathPoint(pts, 0.42);
      const sw = 0.4 * Math.exp(-2.2 * Math.max(0, t - tBeta)) * Math.sin((t - tBeta) * 8);
      ctx.save(); ctx.translate(m[0], m[1]); ctx.rotate(sw); ctx.scale(Math.min(1.05, bk), Math.min(1.05, bk));
      ctx.strokeStyle = '#e8edf8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 16); ctx.stroke();
      roundRect(ctx, -64, 16, 128, 56, 10); ctx.fillStyle = '#ff6b5e'; ctx.fill();
      ctx.font = H.font('display', 32); ctx.fillStyle = '#2a0f0c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.beta || 'BETA', 0, 46);
      ctx.restore();
    }
  }
  // date pill under the box
  const dp = K.popIn(t, tDate, 0.4) * (1 - smooth((t - tLunch) / 0.4));
  if (dp > 0) K.drawLabel(ctx, 735, 652, Math.min(1.05, dp), { text: P.date || 'Just launched', size: 28, accent: true });
  const lp = K.popIn(t, tBeta + 0.35, 0.4) * (1 - smooth((t - tLunch) / 0.4));
  if (lp > 0) K.drawLabel(ctx, 735, 712, Math.min(1.05, lp), { text: P.limited || 'Limited beta', size: 28 });

  // bags landing on the table
  for (let i = 0; i < 3; i++) {
    const u = clamp((t - tLunch - 0.6 - i * 0.25) / 0.5);
    if (u <= 0) continue;
    const x = lerp(rx + 40, tx - 95 + i * 95, u), y = lerp(feet - 120, 960, u) - 80 * Math.sin(u * Math.PI);
    bag(ctx, x, y, 0.45, 0, H, ACC);
  }
  const fp = K.popIn(t, tLunch + 0.6, 0.45);
  if (fp > 0) K.drawLabel(ctx, tx - 20, 690, Math.min(1.05, fp), { text: P.lunch || 'Small pilot', size: 30, accent: true });
  ctx.restore();
}

function bag(ctx, x, y, s, rot, H, ACC) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const w = 90, h = 104;
  ctx.fillStyle = '#d9b07a';
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2 + 6, -h); ctx.lineTo(w / 2 - 6, -h); ctx.lineTo(w / 2, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(w / 2 - 22, -h, 16, h);
  ctx.fillStyle = '#e8c58f'; ctx.fillRect(-w / 2 + 6, -h - 16, w - 12, 18);
  ctx.fillStyle = ACC; H.roundRect(ctx, -18, -h * 0.62, 36, 26, 6); ctx.fill();
  ctx.restore();
}
