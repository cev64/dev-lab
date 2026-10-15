// Scene "wafer-lab" (full frame). A clean room in soft violet light: a big silicon wafer (grid of dies) floats and
// slowly turns over a pedestal, a cartoon worker in a clean-room suit checks it. At aiCue three everyday AI devices
// (phone, laptop, robot) pop up and light beams run from the wafer to each. At quoteCue a verbatim quote panel slides in
// at the top (attributed by role, text only). At nmCue the quote leaves, a share of the dies lights up in the accent
// colour as a pie sector and a "33% of wafer revenue" panel appears.
// params: quote (verbatim), by (attribution text), nmShare (0..1), nmText ("33%"), nmLabel, devicesLabel,
//         cues: aiCue (10 %), quoteCue (35 %), nmCue (72 %)
// Fits: "what the chips are for / the newest process node" beats. No logos, no real people drawn.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent;
  const cue = (w, fb) => { const v = w != null ? info.timeOf(w) : null; return v != null ? v : fb; };
  const aiAt = cue(P.aiCue, D * 0.1), qAt = cue(P.quoteCue, D * 0.35), nmAt = cue(P.nmCue, D * 0.72);
  const share = P.nmShare != null ? +P.nmShare : 0.33;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.1, x: 560, y: 760 }, { t: aiAt + 1.5, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.03, x: 487, y: 730 }]);
  // clean room: pale-violet walls, ceiling filter grid, glossy floor
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#231d48'); g.addColorStop(0.5, '#3a2f6e'); g.addColorStop(1, '#100c22');
  ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, 2320);
  for (let c = 0; c < 9; c++) { ctx.fillStyle = 'rgba(255,240,200,0.06)'; ctx.fillRect(-40 + c * 130, 300, 110, 40); }
  for (let c = 0; c < 6; c++) { H.roundRect(ctx, -20 + c * 200, 380, 150, 560, 14); ctx.fillStyle = 'rgba(255,255,255,0.035)'; ctx.fill(); }
  ctx.fillStyle = '#3a3170'; ctx.fillRect(-200, 1010, 1480, 12);
  ctx.fillStyle = '#17122f'; ctx.fillRect(-200, 1022, 1480, 1000);

  // pedestal + wafer
  const wx = 560, wy = 735, wr = 150;
  H.roundRect(ctx, wx - 60, wy + 150, 120, 1010 - (wy + 150), 10); ctx.fillStyle = '#4b4386'; ctx.fill();
  H.roundRect(ctx, wx - 100, 990, 200, 22, 10); ctx.fillStyle = '#5a519a'; ctx.fill();
  K.glow(ctx, wx, wy, 260, ACC, 0.12 + 0.05 * Math.sin(t * 2));
  const bob = Math.sin(t * 1.4) * 6, rot = t * 0.12;
  const nmU = K.phase(t, nmAt + 0.1, nmAt + 1.3, H.easeOutCubic);
  ctx.save(); ctx.translate(wx, wy + bob);
  ctx.beginPath(); ctx.arc(0, 0, wr, 0, Math.PI * 2); ctx.fillStyle = '#b9c3dd'; ctx.fill();
  ctx.save(); ctx.clip();
  const grad = ctx.createLinearGradient(-wr, -wr, wr, wr); grad.addColorStop(0, '#d9e2f7'); grad.addColorStop(0.5, '#8f9fd0'); grad.addColorStop(1, '#c6b8f2');
  ctx.fillStyle = grad; ctx.fillRect(-wr, -wr, 2 * wr, 2 * wr);
  ctx.rotate(rot);
  const cell = 26;
  for (let i = -6; i <= 5; i++) for (let j = -6; j <= 5; j++) {
    const cx = i * cell + cell / 2, cyy = j * cell + cell / 2;
    if (cx * cx + cyy * cyy > (wr - 14) * (wr - 14)) continue;
    // angle from the top, clockwise, in [0, 1)
    const a = ((Math.atan2(cxRot(cx, cyy, rot), -cyRot(cx, cyy, rot)) / (Math.PI * 2)) + 1) % 1;
    const lit = a < share * nmU;
    ctx.fillStyle = lit ? ACC : H.rgba('#3d3a78', 0.55);
    ctx.fillRect(cx - cell / 2 + 2, cyy - cell / 2 + 2, cell - 4, cell - 4);
  }
  ctx.restore();
  // sheen
  const sh = ((t * 0.25) % 1.6) - 0.3;
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, wr, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(-wr + sh * 2 * wr, -wr); ctx.lineTo(-wr + sh * 2 * wr + 40, -wr); ctx.lineTo(-wr + sh * 2 * wr - 160, wr); ctx.lineTo(-wr + sh * 2 * wr - 200, wr); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(0, 0, wr, 0, Math.PI * 2); ctx.stroke();
  ctx.restore();

  // worker checking the wafer
  K.drawPerson(ctx, 215, 1035, 1.3, { t, pose: t > nmAt + 1.2 ? 'point' : 'stand', mood: 'happy', shirt: '#e8ecf7', hairStyle: 'none', skin: 3, seed: 11, look: 0.6 });

  // AI devices + beams
  const devs = [{ x: 405, kind: 'phone' }, { x: 640, kind: 'laptop' }, { x: 840, kind: 'robot' }];
  const devY = 1030, devOut = K.phase(t, nmAt - 0.3, nmAt + 0.3);
  devs.forEach((d, i) => {
    const p = K.popIn(t, aiAt + i * 0.25, 0.45) * (1 - devOut);
    if (p <= 0) return;
    // beam from wafer to the device
    const bp = K.phase(t, aiAt + 0.3 + i * 0.25, aiAt + 0.9 + i * 0.25);
    const ex = d.x, ey = devY - 120;
    ctx.save(); ctx.globalAlpha = (1 - devOut);
    ctx.strokeStyle = H.rgba(ACC, 0.5); ctx.lineWidth = 5; ctx.setLineDash([6, 12]); ctx.lineDashOffset = -t * 60;
    ctx.beginPath(); ctx.moveTo(wx, wy + wr * 0.6); ctx.lineTo(lerp(wx, ex, bp), lerp(wy + wr * 0.6, ey, bp)); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.translate(d.x, devY); ctx.scale(p, p); ctx.translate(-d.x, -devY);
    if (d.kind === 'phone') K.drawPhone(ctx, d.x, devY, 0.62, { t, bubbles: 3, screen: 'chat' });
    else if (d.kind === 'laptop') K.drawLaptop(ctx, d.x, devY, 0.62, { t, screen: 'chat' });
    else K.drawRobot(ctx, d.x, devY, 0.62, { t, state: 'thinking', seed: 2 });
    ctx.restore();
  });

  ctx.restore(); // camera

  // pill: AI tools run on chips
  const lp = K.popIn(t, aiAt + 0.6, 0.4), lOut = K.phase(t, qAt - 0.3, qAt);
  if (lp > 0 && lOut < 1) { ctx.save(); ctx.globalAlpha = 1 - lOut; K.drawLabel(ctx, 487, 520, lp, { text: P.devicesLabel || 'AI tools run on chips', size: 32, dot: true }); ctx.restore(); }

  // quote panel
  const qp = K.phase(t, qAt, qAt + 0.5, H.easeOutCubic), qOut = K.phase(t, nmAt - 0.4, nmAt);
  if (qp > 0 && qOut < 1) {
    ctx.save(); ctx.globalAlpha = qp * (1 - qOut); ctx.translate(lerp(-300, 0, qp), 0);
    H.roundRect(ctx, 70, 420, 835, 175, 26); ctx.fillStyle = 'rgba(240,242,252,0.97)'; ctx.fill();
    ctx.fillStyle = ACC; ctx.fillRect(70, 440, 10, 135);
    ctx.fillStyle = '#1a1d33'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const q = P.quote || '"strong demand for our leading-edge process technologies"';
    const lines = H.wrap(ctx, q, 'bold', 34, 760);
    ctx.font = K.font.bold(34); lines.slice(0, 2).forEach((l, i) => ctx.fillText(l, 108, 478 + i * 44));
    ctx.font = K.font.ui(24); ctx.fillStyle = '#5a5f80'; ctx.fillText(P.by || '- the chipmaker\'s CFO, Oct 15 results', 108, 570);
    ctx.restore();
  }
  // 3 nm panel
  const np = K.popIn(t, nmAt + 0.3, 0.45);
  if (np > 0) {
    ctx.save(); ctx.translate(487, 505); ctx.scale(np, np);
    H.roundRect(ctx, -330, -75, 660, 150, 26); ctx.fillStyle = 'rgba(8,10,24,0.88)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = H.rgba(ACC, 0.4); ctx.stroke();
    ctx.fillStyle = ACC; ctx.font = K.font.display(64); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.nmText || '33%', -295, 4);
    ctx.fillStyle = '#ffffff'; const l1 = P.nmLabel || '3-nanometer chips'; const ft = H.fitText(ctx, l1, 'bold', 34, 24, 380); ctx.font = ft.font; ctx.fillText(l1, -90, -22);
    ctx.font = K.font.ui(26); ctx.fillStyle = H.rgba('#ffffff', 0.75); ctx.fillText(P.nmSub || 'of wafer revenue', -90, 26);
    ctx.restore();
  }
}
function cxRot(x, y, r) { return x * Math.cos(r) - y * Math.sin(r); }
function cyRot(x, y, r) { return x * Math.sin(r) + y * Math.cos(r); }
