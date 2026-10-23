// Scene "pilot-grow" (full frame, 1 beat). Office floor at dusk seen as a big floor board of tiny cartoon staff.
// First only a small fenced "pilot" group is lit, each person with a tiny robot buddy, under a pilot pill. On growCue
// the fence pops, the light spreads across the whole floor and every desk gets a buddy. Then 3 team zones light on
// their cues with pills. Finally the engineers' corner switches to laptops with code and an "engineers keep X" pill.
// A kit worker and robot stand at the front, high-fiving when it goes company-wide. Ends settled.
// params: pilot ("Pilot: a small group"), teams [{text, cue}] (3), eng ("Engineers keep their own tool"), all ("Now: company-wide"),
//         pilotCue, growCue, engCue
// Fits: pilot programmes scaling company-wide, "from N testers to everyone", which teams get a new tool.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, roundRect, rgba } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tPilot = at(P.pilotCue, D * 0.1) - 0.1, tGrow = Math.max(tPilot + 1, at(P.growCue, D * 0.32) - 0.1);
  const teams = (P.teams || [{ text: 'Finance' }, { text: 'Operations' }, { text: 'Product' }]).slice(0, 3);
  const tT = teams.map((m, i) => Math.max(tGrow + 0.4, at(m.cue, D * (0.42 + i * 0.08)) - 0.1));
  const tEng = Math.max(tT[2] + 0.5, at(P.engCue, D * 0.72) - 0.1);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.2, x: 420, y: 680 }, { t: tGrow, zoom: 1.2, x: 420, y: 680 }, { t: tGrow + 1.0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.02 }]);
  K.world.office(ctx, { t, time: 'dusk' });
  // floor board
  const BX0 = 70, BX1 = 905, BY0 = 430, BY1 = 900;
  roundRect(ctx, BX0, BY0, BX1 - BX0, BY1 - BY0, 26); ctx.fillStyle = 'rgba(10,12,26,0.82)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.stroke();
  // grid of tiny staff: 10 cols x 6 rows; pilot = cols 0-2, rows 0-1; engineers = cols 7-9, rows 3-5
  const cols = 10, rows = 6, cw = (BX1 - BX0 - 40) / cols, rh = (BY1 - BY0 - 60) / rows;
  const grow = clamp((t - tGrow) / 1.2);
  const zoneOf = (c) => (c < 3 ? 0 : c < 7 ? 1 : 2);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = BX0 + 20 + cw * (c + 0.5), y = BY0 + 50 + rh * (r + 0.5);
    const pilot = c < 3 && r < 2, eng = c >= 7 && r >= 3;
    const d = Math.hypot(c - 1, r - 0.5) / 10;
    const on = pilot ? clamp((t - tPilot) / 0.4) : clamp((grow - d) / 0.15);
    const zone = zoneOf(c), zl = clamp((t - tT[zone]) / 0.3) * (1 - 0.6 * clamp((t - tT[zone] - 1.2) / 0.5));
    // desk
    roundRect(ctx, x - 30, y + 18, 60, 8, 3); ctx.fillStyle = on > 0 ? '#59628a' : '#2c3150'; ctx.fill();
    // person (head + body)
    const shirt = ['#6f86e0', '#4fb3a6', '#e8786a', '#a08be0', '#8a93a8'][(r * 3 + c) % 5];
    const bob = Math.sin(t * 3 + r + c * 0.7) * 1.5 * on;
    ctx.fillStyle = H.mixHex('#3a3f5c', shirt, 0.25 + 0.75 * on); roundRect(ctx, x - 26, y - 6 + bob, 26, 26, 10); ctx.fill();
    ctx.beginPath(); ctx.arc(x - 13, y - 18 + bob, 11, 0, Math.PI * 2); ctx.fillStyle = H.mixHex('#3a3f5c', ['#f7d7bd', '#eab894', '#cf9466', '#a06844', '#6e4429'][(r + c * 2) % 5], 0.25 + 0.75 * on); ctx.fill();
    if (zl > 0) { ctx.save(); ctx.globalAlpha = zl * 0.5; K.glow(ctx, x - 13, y - 4, 34, ACC, 1); ctx.restore(); }
    // buddy robot or engineer laptop
    if (eng && t > tEng) {
      const k = K.popIn(t, tEng + (c - 7) * 0.08 + (r - 3) * 0.06, 0.35);
      ctx.save(); ctx.translate(x + 14, y + 14); ctx.scale(Math.min(1, k), Math.min(1, k));
      roundRect(ctx, -2, -24, 28, 20, 3); ctx.fillStyle = '#1c2033'; ctx.fill();
      ctx.fillStyle = ACC; for (let i = 0; i < 3; i++) ctx.fillRect(2 + (i % 2) * 4, -20 + i * 5, 10 + ((i + Math.floor(t * 3)) % 3) * 3, 2);
      ctx.restore();
    } else {
      const k = pilot ? K.popIn(t, tPilot + 0.3 + c * 0.05, 0.35) : (on > 0.5 ? Math.min(1, (on - 0.5) * 2) : 0);
      if (k > 0) {
        ctx.save(); ctx.translate(x + 14, y + 8 + Math.sin(t * 2.4 + c) * 2); ctx.scale(k, k);
        roundRect(ctx, -10, -18, 20, 17, 5); ctx.fillStyle = '#f2f4fa'; ctx.fill();
        roundRect(ctx, -7, -15, 14, 8, 3); ctx.fillStyle = '#1c2033'; ctx.fill();
        ctx.fillStyle = ACC; ctx.fillRect(-5, -13, 3, 3); ctx.fillRect(2, -13, 3, 3);
        ctx.restore();
      }
    }
  }
  // pilot fence (dashed) around the pilot group, pops away on growCue
  const fenceA = clamp((t - tPilot) / 0.4) * (1 - clamp((t - tGrow) / 0.35));
  if (fenceA > 0) {
    const fx0 = BX0 + 20 - 6, fy0 = BY0 + 50 - 4, fw = cw * 3 + 12, fh = rh * 2 + 8;
    const sc = 1 + 0.25 * clamp((t - tGrow) / 0.35);
    ctx.save(); ctx.globalAlpha = fenceA; ctx.translate(fx0 + fw / 2, fy0 + fh / 2); ctx.scale(sc, sc);
    ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = ACC; ctx.lineWidth = 5;
    roundRect(ctx, -fw / 2, -fh / 2, fw, fh, 16); ctx.stroke(); ctx.restore();
  }
  // front: worker and robot
  const hi = t > tGrow + 0.3 && t < tGrow + 1.6;
  K.drawPerson(ctx, 140, 1045, 1.0, { t, pose: hi ? 'cheer' : 'stand', mood: 'happy', skin: 4, hair: 0, shirt: '#e0a84f', hairStyle: 'short', seed: 12, look: 0.6 });
  K.drawRobot(ctx, 840, 1045, 0.95, { t, state: hi ? 'happy' : 'idle', flip: true, seed: 8 });
  // team zone pills (bottom of the board)
  teams.forEach((m, i) => {
    const p = K.popIn(t, tT[i], 0.4); if (p <= 0) return;
    const cx = i === 0 ? BX0 + 20 + cw * 1.5 : i === 1 ? BX0 + 20 + cw * 5 : BX0 + 20 + cw * 8.5;
    K.drawLabel(ctx, cx, BY1 - 6, p, { text: m.text, size: 26, accent: t < tT[i] + 1.4 });
  });
  ctx.restore();

  // pills outside the camera
  const pp = K.popIn(t, tPilot, 0.45), ppOut = clamp((t - tGrow) / 0.3);
  if (pp > 0 && ppOut < 1) { ctx.save(); ctx.globalAlpha = 1 - ppOut; K.drawLabel(ctx, 487, 1000, pp, { text: P.pilot || 'Pilot: a small group', size: 34, accent: true }); ctx.restore(); }
  const pa = K.popIn(t, tGrow + 0.3, 0.45), paOut = clamp((t - tEng) / 0.3);
  if (pa > 0 && paOut < 1) { ctx.save(); ctx.globalAlpha = 1 - paOut; K.drawLabel(ctx, 487, 1000, pa, { text: P.all || 'Now: company-wide', size: 34, accent: true }); ctx.restore(); }
  const pe = K.popIn(t, tEng + 0.2, 0.45);
  if (pe > 0) K.drawLabel(ctx, 487, 1000, pe, { text: P.eng || 'Engineers keep their own tool', size: 32, dot: true });
}
