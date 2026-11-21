// Scene "prize-case" (full frame, one beat). Night gallery: a gold medal sits in a locked glass case on a pedestal
// under a spotlight; its prize tag counts up on prizeCue. On rulesCue a RULES board slides in on an easel and its
// rows tick in on their cues (e.g. publish / wait / accepted); on the wait row a big hourglass by the board flips
// and starts to run, with a time pill. The kit robot presses up against the glass, then turns to read the rules.
// Fits: "prize / reward exists, but only after a waiting period or conditions" stories.
// params: amount ("$X"; digits count up, e.g. "$1,000,000"), prize (label under the amount), title ("RULES"),
//         rows [{text, cue}] (3), waitRow (index of the row that flips the hourglass, 1), prizeCue, rulesCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tPrize = at(P.prizeCue, D * 0.1) - 0.2;
  const tRules = at(P.rulesCue, D * 0.35) - 0.4;
  const rows = (P.rows || [{ text: 'Publish it' }, { text: 'Wait a while' }, { text: 'Experts accept it' }]).slice(0, 3);
  const rowT = rows.map((r, i) => at(r.cue, tRules + 0.8 + i * 1.2) - 0.15);
  const wr = P.waitRow == null ? 1 : P.waitRow;
  const tWait = rowT[wr] != null ? rowT[wr] : D * 0.6;
  const feet = 1035;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 400, y: 720 }, { t: tRules, zoom: 1.08, x: 420, y: 720 }, { t: tRules + 1.2, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 500, y: 735 }]);
  K.world.room(ctx, { t, time: 'night', wall: '#262a44', window: false, picture: false, lamp: false, plant: false, floorY: 905 });

  // spotlight cone
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const cone = ctx.createLinearGradient(0, 380, 0, 1035);
  cone.addColorStop(0, H.rgba('#fff3c0', 0.20)); cone.addColorStop(1, H.rgba('#fff3c0', 0.02));
  ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(345, 380); ctx.lineTo(425, 380); ctx.lineTo(565, 1035); ctx.lineTo(205, 1035); ctx.closePath(); ctx.fill();
  ctx.restore();

  // pedestal
  const cx = 385;
  K.shadow(ctx, cx, feet, 260);
  H.roundRect(ctx, cx - 110, 860, 220, 175, 10); ctx.fillStyle = '#d9dce8'; ctx.fill();
  ctx.fillStyle = '#b9bdcc'; ctx.fillRect(cx + 40, 860, 70, 175);
  H.roundRect(ctx, cx - 130, 842, 260, 26, 8); ctx.fillStyle = '#eef0f6'; ctx.fill();
  // prize inside: a gold medal on a ribbon, gently turning
  const spin = Math.cos(t * 1.4);
  ctx.save(); ctx.translate(cx, 690);
  ctx.fillStyle = H.mixHex(ACC, '#ff5a4e', 0.55); ctx.beginPath(); ctx.moveTo(-30, -110); ctx.lineTo(-8, -20); ctx.lineTo(8, -20); ctx.lineTo(30, -110); ctx.lineTo(12, -110); ctx.lineTo(0, -60); ctx.lineTo(-12, -110); ctx.closePath(); ctx.fill();
  ctx.scale(0.35 + 0.65 * Math.abs(spin), 1);
  ctx.beginPath(); ctx.arc(0, 30, 62, 0, Math.PI * 2); ctx.fillStyle = H.mixHex(ACC, '#b07a00', 0.45); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 30, 50, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
  ctx.fillStyle = H.mixHex(ACC, '#7a5200', 0.6); ctx.font = H.font('display', 50); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 33);
  ctx.restore();
  // sparkle
  for (let i = 0; i < 3; i++) {
    const u = (t * 0.7 + i / 3) % 1, a = Math.sin(u * Math.PI);
    ctx.fillStyle = H.rgba('#ffffff', 0.8 * a); const sx = cx - 60 + i * 55, sy = 640 + i * 30;
    ctx.beginPath(); ctx.moveTo(sx, sy - 12 * a); ctx.lineTo(sx + 4, sy); ctx.lineTo(sx, sy + 12 * a); ctx.lineTo(sx - 4, sy); ctx.closePath(); ctx.fill();
  }
  // glass case
  ctx.save();
  H.roundRect(ctx, cx - 120, 540, 240, 302, 8); ctx.fillStyle = 'rgba(170,210,255,0.10)'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(210,230,255,0.55)'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.beginPath(); ctx.moveTo(cx - 95, 560); ctx.lineTo(cx - 60, 560); ctx.lineTo(cx - 110, 700); ctx.lineTo(cx - 110, 640); ctx.closePath(); ctx.fill();
  H.roundRect(ctx, cx - 130, 522, 260, 22, 6); ctx.fillStyle = '#3b4058'; ctx.fill();
  ctx.restore();
  // padlock on the glass
  K.drawLock(ctx, cx + 92, 832, 0.55, { open: 0, shadow: false });

  // prize amount tag (counts up)
  const pk = K.popIn(t, tPrize, 0.45);
  if (pk > 0) {
    const amt = String(P.amount || '$X');
    const target = parseInt(amt.replace(/[^0-9]/g, ''), 10) || 0;
    const cur = Math.round(target * easeOutCubic(clamp((t - tPrize) / 1.0)) / 1000) * 1000;
    const shown = target ? '$' + cur.toLocaleString('en-US') : amt;
    ctx.save(); ctx.translate(cx, 478); ctx.scale(Math.min(1.05, pk), Math.min(1.05, pk));
    H.roundRect(ctx, -150, -44, 300, 88, 16); ctx.fillStyle = 'rgba(10,12,24,0.94)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.fillStyle = ACC; ctx.font = H.font('display', 48); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(shown, 0, -4);
    ctx.restore();
    const lk = K.popIn(t, tPrize + 0.5, 0.4);
    if (lk > 0 && P.prize) pill(H, ctx, cx + 22, 900, lk, String(P.prize), ACC, false, 24);
  }

  // rules board on an easel (slides in from the right)
  const rk = easeOutCubic(clamp((t - tRules) / 0.6));
  if (rk > 0) {
    ctx.save(); ctx.translate((1 - rk) * 520, 0);
    const bx = 618, by = 450, bw = 290, bh = 380;
    ctx.strokeStyle = '#764d31'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(bx + 60, by + bh); ctx.lineTo(bx + 20, feet - 4); ctx.moveTo(bx + bw - 60, by + bh); ctx.lineTo(bx + bw - 20, feet - 4); ctx.stroke();
    H.roundRect(ctx, bx, by, bw, bh, 14); ctx.fillStyle = '#f4f1e8'; ctx.fill();
    ctx.fillStyle = '#1c2033'; ctx.font = H.font('display', 34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(P.title || 'RULES'), bx + bw / 2, by + 44);
    ctx.fillStyle = ACC; ctx.fillRect(bx + bw / 2 - 50, by + 68, 100, 6);
    rows.forEach((r, i) => {
      const k = K.popIn(t, rowT[i], 0.4);
      const y = by + 125 + i * 92;
      ctx.save(); ctx.globalAlpha = 0.25 + 0.75 * clamp(k);
      ctx.beginPath(); ctx.arc(bx + 42, y, 22, 0, Math.PI * 2); ctx.fillStyle = k > 0.5 ? ACC : '#c9ccd8'; ctx.fill();
      ctx.fillStyle = '#14160a'; ctx.font = H.font('display', 24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(i + 1), bx + 42, y + 1);
      ctx.textAlign = 'left'; ctx.fillStyle = '#1c2033';
      const lines = H.wrap(ctx, String(r.text), 'ui', 27, bw - 95);
      ctx.font = H.font('ui', 27);
      lines.slice(0, 2).forEach((ln, j) => ctx.fillText(ln, bx + 76, y + (j - (Math.min(2, lines.length) - 1) / 2) * 32));
      ctx.restore();
    });
    ctx.restore();
  }

  // hourglass on the floor by the board: flips on the wait row, then runs
  const hk = K.popIn(t, tWait - 0.1, 0.4);
  if (hk > 0) {
    const flip = easeOutCubic(clamp((t - tWait) / 0.6));
    const run = clamp((t - tWait - 0.6) / 6);
    hourglass(H, ctx, 560, 1000, 0.8 * hk, Math.PI * (1 - flip), run, ACC, t);
  }

  // robot: up against the glass (left), then turns to the rules
  const turn = t > tRules + 0.4;
  K.drawRobot(ctx, 200, feet, 1.05, { t, state: turn ? 'thinking' : 'happy', flip: false, seed: 2 });
  ctx.restore();
}

function hourglass(H, ctx, x, y, s, rot, run, ACC, t) {
  ctx.save(); ctx.translate(x, y - 95 * s); ctx.scale(s, s); ctx.rotate(rot);
  ctx.fillStyle = '#764d31'; H.roundRect(ctx, -62, -100, 124, 16, 6); ctx.fill(); H.roundRect(ctx, -62, 84, 124, 16, 6); ctx.fill();
  ctx.fillStyle = 'rgba(200,225,255,0.18)'; ctx.strokeStyle = 'rgba(220,235,255,0.7)'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-48, -84); ctx.lineTo(48, -84); ctx.quadraticCurveTo(46, -20, 8, 0); ctx.quadraticCurveTo(46, 20, 48, 84); ctx.lineTo(-48, 84); ctx.quadraticCurveTo(-46, 20, -8, 0); ctx.quadraticCurveTo(-46, -20, -48, -84); ctx.closePath(); ctx.fill(); ctx.stroke();
  // sand: top empties, bottom fills (in the upright frame)
  const top = 1 - run * 0.85;
  ctx.fillStyle = ACC;
  const th = 64 * top; ctx.beginPath(); ctx.moveTo(-40 * top, -6 - th); ctx.lineTo(40 * top, -6 - th); ctx.lineTo(4, -6); ctx.lineTo(-4, -6); ctx.closePath(); ctx.fill();
  const bh = 64 * (1 - top) + 6; ctx.beginPath(); ctx.moveTo(-44, 82); ctx.lineTo(44, 82); ctx.lineTo(0, 82 - bh); ctx.closePath(); ctx.fill();
  if (run > 0 && run < 1) { ctx.fillRect(-2, -4, 4, 80 - bh); }
  ctx.restore();
}

function pill(H, ctx, x, y, k, text, ACC, solid, size = 32) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  const f = H.fitText(ctx, text, 'ui', size, 18, 420); ctx.font = f.font;
  const w = ctx.measureText(f.text).width + 52, h = size * 1.8;
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = solid ? ACC : 'rgba(10,12,24,0.92)'; ctx.fill();
  if (!solid) { ctx.lineWidth = 2.5; ctx.strokeStyle = ACC; ctx.stroke(); }
  ctx.fillStyle = solid ? '#14160a' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
  ctx.restore();
}
