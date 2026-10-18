// Scene "bank-vault" (full frame, 1 beat). Generic bank hall (columns, marble floor): a round vault door stands open with
// coins inside; an AI agent robot with an empty cart rolls toward it. On aCue a name pill (text, no logo) pops over the
// vault; the vault door swings shut and its wheel spins, the robot stops. Crossed-out action chips land one by one
// (rows), then a second name pill (b) slides in with its own crossed chip (bRow), and a warning sign + quote pill
// (risk) pops on riskCue. A worried-looking cartoon guard stands by the vault.
// Fits: "banks block AI agents from moving money", "agents can't access accounts", any "locked vault for bots" beat.
// params: a ("Bank A"), b (second name pill; omitted or '' hides it and its chip), rows (["Send money", "Pay bills"]),
//         bRow ("Move money"), risk ("Too much risk"; quote marks if it is a quote), cues (narration words; without
//         them, fractions of the scene): aCue, rowCues [..], bCue, riskCue ("risk"), shutCue ("blocks")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tA = at(P.aCue, D * 0.12) - 0.25;
  const tShut = at(P.shutCue || 'blocks', tA + 0.5) - 0.2;
  const rows = P.rows || ['Send money', 'Pay bills'];
  const rowCues = P.rowCues || [];
  const tRow = rows.map((r, i) => at(rowCues[i], D * (0.45 + i * 0.1)) - 0.2);
  const tB = at(P.bCue, D * 0.7) - 0.25;
  const tRisk = at(P.riskCue || 'risk', D * 0.88) - 0.3;
  const danger = '#ff6b5e', feet = 1035;

  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 487, y: 750 }]);
  // hall: wall + marble floor + columns
  ctx.fillStyle = '#26304f'; ctx.fillRect(-100, -100, 1300, 1200);
  ctx.fillStyle = '#2e3a60'; for (let i = 0; i < 6; i++) ctx.fillRect(-40 + i * 220, 300, 140, 700);
  const fl = ctx.createLinearGradient(0, 1000, 0, 2000); fl.addColorStop(0, '#5f6b8e'); fl.addColorStop(1, '#2a3150');
  ctx.fillStyle = fl; ctx.fillRect(-100, 1000, 1300, 1000);
  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2;
  for (let i = -6; i < 12; i++) { ctx.beginPath(); ctx.moveTo(487 + i * 40, 1000); ctx.lineTo(487 + i * 160, 2000); ctx.stroke(); }
  // columns in front
  for (const cx of [95, 880]) {
    ctx.fillStyle = '#c9cfe0'; ctx.fillRect(cx - 40, 470, 80, 530);
    ctx.fillStyle = '#aeb6cc'; for (let k = 0; k < 4; k++) ctx.fillRect(cx - 30 + k * 18, 490, 6, 490);
    ctx.fillStyle = '#dfe4f1'; ctx.fillRect(cx - 55, 450, 110, 28); ctx.fillRect(cx - 55, 990, 110, 16);
  }

  // vault frame
  const vx = 520, vy = 780, R = 175;
  ctx.beginPath(); ctx.arc(vx, vy, R + 30, 0, Math.PI * 2); ctx.fillStyle = '#8a93a8'; ctx.fill();
  ctx.beginPath(); ctx.arc(vx, vy, R, 0, Math.PI * 2); ctx.fillStyle = '#141829'; ctx.fill();
  // coins inside (visible while open)
  for (let i = 0; i < 9; i++) {
    const cx = vx - 90 + (i % 4) * 60 + (i > 3 ? 30 : 0), cy = vy + 80 - Math.floor(i / 4) * 44;
    K.drawCoin(ctx, cx, cy + 32, 0.6, { spin: 0.6 + i });
  }
  // door: swings from open (edge-on to the right) to shut
  const sh = smooth((t - tShut) / 0.6);
  const sx = lerp(0.12, 1, sh);
  ctx.save(); ctx.translate(lerp(vx + R + 10, vx, sh), vy); ctx.scale(sx, 1);
  ctx.beginPath(); ctx.arc(0, 0, R + 4, 0, Math.PI * 2); ctx.fillStyle = '#b9c1d6'; ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, R - 20, 0, Math.PI * 2); ctx.fillStyle = '#9aa3bb'; ctx.fill();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.beginPath(); ctx.arc(Math.cos(a) * (R - 8), Math.sin(a) * (R - 8), 7, 0, Math.PI * 2); ctx.fillStyle = '#dfe4f1'; ctx.fill(); }
  // wheel spins after shutting
  const spin = smooth((t - tShut - 0.5) / 0.8) * Math.PI * 1.5;
  ctx.save(); ctx.rotate(spin); ctx.strokeStyle = '#3b4260'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI; ctx.beginPath(); ctx.moveTo(Math.cos(a) * -70, Math.sin(a) * -70); ctx.lineTo(Math.cos(a) * 70, Math.sin(a) * 70); ctx.stroke(); }
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fillStyle = '#3b4260'; ctx.fill();
  ctx.restore(); ctx.restore();
  if (sh >= 1) { const lk = K.popIn(t, tShut + 0.9, 0.4); if (lk > 0) K.drawLock(ctx, vx, vy + R + 10, 0.75 * Math.min(1.05, lk), { open: 0 }); }

  // guard by the vault (right)
  K.drawPerson(ctx, 760, feet, 1.2, { t, pose: t > tShut && t < tShut + 2 ? 'point' : 'stand', flip: true, mood: 'neutral', skin: 2, hair: 4, shirt: '#1c2034', hairStyle: 'short', seed: 9, look: -0.5 });

  // robot with an empty cart rolls in from the left, stops when the vault shuts
  const roll = smooth(clamp((t - 0.1) / Math.max(0.6, tShut + 0.2)));
  const rX = lerp(150, 290, roll) - K.shake(t, tShut + 0.3, 0.35, 5);
  // cart
  ctx.save(); ctx.translate(rX + 110, feet - 20);
  ctx.strokeStyle = '#dfe4f1'; ctx.lineWidth = 6; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-70, -110); ctx.lineTo(-55, -110); ctx.lineTo(-40, -30); ctx.lineTo(40, -30); ctx.lineTo(55, -90); ctx.lineTo(-48, -90); ctx.stroke();
  ctx.fillStyle = '#3b4260'; ctx.beginPath(); ctx.arc(-30, -8, 10, 0, Math.PI * 2); ctx.arc(30, -8, 10, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  K.drawRobot(ctx, rX, feet, 1.1, { t, state: t > tShut + 0.3 ? 'thinking' : 'working', seed: 3 });

  // name pills
  const ak = K.popIn(t, tA, 0.4);
  const bOn = P.b && t > tB;
  const swap = smooth((t - tB) / 0.4);
  if (ak > 0) K.drawLabel(ctx, P.b ? lerp(487, 300, swap * (bOn ? 1 : 0)) : 487, 470, Math.min(1.05, ak), { text: P.a || 'Bank A', size: 32, dot: true, accent: !bOn });
  if (P.b && t > tB) K.drawLabel(ctx, lerp(820, 690, swap), 470, Math.min(1.05, K.popIn(t, tB, 0.4)), { text: P.b, size: 32, dot: true, accent: true });

  // crossed action chips (left column above the robot, right column for b)
  const chip = (x, y, text, k) => {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
    ctx.font = H.font('bold', 30); const w = ctx.measureText(text).width + 92;
    roundRect(ctx, -w / 2, -32, w, 64, 32); ctx.fillStyle = 'rgba(10,12,22,0.9)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = rgba(danger, 0.8); ctx.stroke();
    ctx.beginPath(); ctx.arc(-w / 2 + 34, 0, 18, 0, Math.PI * 2); ctx.fillStyle = danger; ctx.fill();
    ctx.strokeStyle = '#2a0f0c'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-w / 2 + 27, -7); ctx.lineTo(-w / 2 + 41, 7); ctx.moveTo(-w / 2 + 41, -7); ctx.lineTo(-w / 2 + 27, 7); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, -w / 2 + 64, 2);
    // strike-through sweeps across the words
    const s = clamp((k - 0.6) / 0.4);
    if (s > 0) { ctx.strokeStyle = danger; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-w / 2 + 62, 2); ctx.lineTo(-w / 2 + 62 + (w - 80) * s, 2); ctx.stroke(); }
    ctx.restore();
  };
  rows.forEach((r, i) => chip(270, 560 + i * 80, r, clamp((t - tRow[i]) / 0.5) * 1.0));
  if (P.b) chip(690, 560, P.bRow || 'Move money', clamp((t - tB - 0.5) / 0.5));
  // risk warning + quote pill
  const rk = K.popIn(t, tRisk, 0.45);
  if (rk > 0) {
    K.drawWarning(ctx, 600, 708, 0.62 * Math.min(1.05, rk), { pulse: t });
    K.drawLabel(ctx, 760, 690, Math.min(1.05, rk), { text: P.risk || 'Too much risk', size: 28 });
  }
}
