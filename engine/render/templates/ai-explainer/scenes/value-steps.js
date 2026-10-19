// Scene "value-steps" (full frame, 1 beat). Vault room: a glass fund jar holds a golden stack (the pledged share).
// A big panel counts an outlet's published dollar estimate up ("about $10 billion") with the outlet as a source line.
// Then the "company value" bars: a baseline bar, and on stepCue a second bar grows by +50%; two cartoon board members
// at a table ("Board's choice" pill), one points, and a "+5%" coin arcs from the new bar into the jar, whose level
// rises and whose tag changes ("10%" -> "10% + 5%"). Ends settled (coins glint, jar glow breathes).
// Fits: "worth about X (per outlet)" + "more is added when value grows" (milestone top-ups, vesting, matching).
// params: amount ("$10 billion": prefix, number and suffix are parsed), about ("about"), by (source line),
//         base ("Baseline"), step ("+50% value"; the bar is drawn 1.5x), add ("+5%"), board ("Board's choice"),
//         jarTag ("10%"), jarTag2 ("10% + 5%"), baseUnits (5), addUnits (2) (jar fill, of 14),
//         cues: amountCue, byCue, boardCue, stepCue (optional; else fractions)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, rgba, roundRect, mixHex } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const tAmt = at(P.amountCue, D * 0.2) - 0.3;
  const tBy = at(P.byCue, D * 0.4) - 0.3;
  const tBoard = at(P.boardCue, D * 0.6) - 0.2;
  const tStep = at(P.stepCue, D * 0.8) - 0.3;
  const tCoin = tStep + 0.4, tIn = tCoin + 0.8;
  const baseU = P.baseUnits || 5, addU = P.addUnits || 2;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 487, y: 700 }, { t: D, zoom: 1.0 }]);
  // vault room
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#101a2c'); g.addColorStop(0.5, '#1a3048'); g.addColorStop(1, '#070c14');
  ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, 2320);
  for (let r = 0; r < 9; r++) for (let c = 0; c < 10; c++) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.beginPath(); ctx.arc(-10 + c * 120, 360 + r * 80, 4, 0, Math.PI * 2); ctx.fill(); }
  ctx.save(); ctx.globalAlpha = 0.25; ctx.translate(880, 640); ctx.rotate(t * 0.12);
  ctx.beginPath(); ctx.arc(0, 0, 230, 0, Math.PI * 2); ctx.lineWidth = 16; ctx.strokeStyle = '#2b4a66'; ctx.stroke();
  for (let i = 0; i < 6; i++) { ctx.rotate(Math.PI / 3); ctx.fillStyle = '#2b4a66'; ctx.fillRect(-6, 40, 12, 170); }
  ctx.restore();
  ctx.fillStyle = '#1b2a3c'; ctx.fillRect(-200, 1010, 1480, 14);
  ctx.fillStyle = '#0c131e'; ctx.fillRect(-200, 1024, 1480, 1000);

  // --- amount panel
  const pk = K.popIn(t, tAmt, 0.45);
  if (pk > 0) {
    ctx.save(); ctx.translate(487, 470); const s = Math.min(1.04, pk); ctx.scale(s, s);
    const W = 760, Hh = 200;
    roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 28); ctx.fillStyle = 'rgba(8,10,24,0.92)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 28); ctx.stroke();
    const m = String(P.amount || '$10 billion').match(/^([^\d]*)([\d.,]+)(.*)$/) || ['', '', '0', ''];
    const num = parseFloat(m[2].replace(/,/g, '')), dec = (m[2].split('.')[1] || '').length;
    const shown = K.countUp(num, t, tAmt + 0.1, 1.3, dec).toFixed(dec);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = H.font('ui', 26); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText(String(P.about || 'about').toUpperCase(), 0, -62);
    ctx.font = H.font('display', 84); ctx.fillStyle = ACC; ctx.fillText(m[1] + shown + m[3], 0, 4);
    const bk = clamp((t - tBy) / 0.4);
    if (bk > 0) { ctx.globalAlpha = bk; ctx.font = H.font('body', 26); ctx.fillStyle = '#ffffff'; ctx.fillText(P.by || 'Source, at its latest valuation', 0, 70); }
    ctx.restore();
  }

  // --- glass jar with the fund's stack
  const JX = 730, JB = 1010, JW = 210, JH = 330, JT = JB - JH;
  const units = 14;
  const lvl = baseU + addU * K.phase(t, tIn, tIn + 0.6, H.easeOutCubic);
  K.shadow(ctx, JX, JB, 260);
  roundRect(ctx, JX - JW / 2, JT, JW, JH, 26); ctx.fillStyle = 'rgba(160,200,255,0.10)'; ctx.fill();
  ctx.save(); roundRect(ctx, JX - JW / 2 + 8, JT + 8, JW - 16, JH - 16, 20); ctx.clip();
  const lvY = JB - 8 - (lvl / units) * (JH - 16);
  const lg = ctx.createLinearGradient(0, lvY, 0, JB); lg.addColorStop(0, mixHex(ACC, '#ffffff', 0.2)); lg.addColorStop(1, mixHex(ACC, '#000000', 0.4));
  ctx.fillStyle = lg; ctx.fillRect(JX - JW / 2, lvY, JW, JB - lvY);
  for (let yy = JB - 22; yy > lvY + 8; yy -= 24) for (let xx = 0; xx < 5; xx++) {
    const cx = JX - JW / 2 + 28 + xx * 40 + (Math.round(yy / 24) % 2) * 14;
    ctx.beginPath(); ctx.ellipse(cx, yy, 17, 6, 0, 0, Math.PI * 2); ctx.fillStyle = rgba(mixHex(ACC, '#000000', 0.5), 0.35); ctx.fill();
  }
  ctx.restore();
  ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(200,225,255,0.55)'; roundRect(ctx, JX - JW / 2, JT, JW, JH, 26); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; roundRect(ctx, JX - JW / 2 + 18, JT + 24, 14, JH - 60, 7); ctx.fill();
  roundRect(ctx, JX - JW / 2 - 10, JT - 18, JW + 20, 24, 10); ctx.fillStyle = '#4b6a88'; ctx.fill();
  K.glow(ctx, JX, lvY + 20, 120, ACC, 0.18 + 0.06 * Math.sin(t * 2.4));
  // glints
  for (let i = 0; i < 3; i++) { const gl = Math.max(0, Math.sin(t * 2 + i * 2.1)); if (gl > 0.85) K.glow(ctx, JX - 60 + i * 60, lvY + 40 + i * 30, 26, '#ffffff', (gl - 0.85) * 4); }
  const tag = t >= tIn + 0.2 ? (P.jarTag2 || '10% + 5%') : (P.jarTag || '10%');
  const tk = t >= tIn + 0.2 ? K.popIn(t, tIn + 0.2, 0.35) : 1;
  K.drawLabel(ctx, JX, JT - 30, Math.min(1.05, tk), { text: tag, size: 32, accent: true });

  // --- company value bars
  const BX0 = 165, BX1 = 300, BW = 100, BB = 1010, BH = 190;
  const bIn = K.phase(t, 0.2, 1.0, H.easeOutCubic), sIn = K.phase(t, tStep, tStep + 0.8, H.easeOutBack || H.easeOutCubic);
  const bar = (x, h, col) => { roundRect(ctx, x - BW / 2, BB - h, BW, h, 12); ctx.fillStyle = col; ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x + BW * 0.2, BB - h + 10, BW * 0.3, h - 10); };
  bar(BX0, BH * bIn, '#6f86e0');
  ctx.font = H.font('ui', 24); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha = bIn; ctx.fillText(P.base || 'Baseline', BX0, BB - BH * bIn - 24); ctx.globalAlpha = 1;
  if (sIn > 0) {
    // dashed baseline level carried across
    ctx.save(); ctx.setLineDash([8, 10]); ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(BX0 + BW / 2, BB - BH); ctx.lineTo(BX1 + BW / 2, BB - BH); ctx.stroke(); ctx.restore();
    bar(BX1, BH * 1.5 * sIn, '#8b78e0');
    K.drawLabel(ctx, BX1 + 10, BB - BH * 1.5 * Math.min(1, sIn) - 14, Math.min(1.05, clamp(sIn)), { text: P.step || '+50% value', size: 24 });
  }
  ctx.font = H.font('ui', 24); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.textAlign = 'center';
  ctx.fillText('Company value', (BX0 + BX1) / 2, BB + 0 - 0 + 28 - 0);

  // --- board members at a small table
  const bdk = K.phase(t, tBoard - 0.2, tBoard + 0.4, H.easeOutCubic);
  if (bdk > 0) {
    const yy = 1012 + (1 - bdk) * 240;
    const pointing = t > tCoin - 0.3;
    K.drawPerson(ctx, 440, yy, 0.82, { t, pose: 'stand', mood: 'neutral', skin: 0, hair: 3, shirt: '#4a5570', hairStyle: 'short', seed: 5, look: 1 });
    K.drawPerson(ctx, 528, yy, 0.82, { t, pose: pointing ? 'point' : 'stand', mood: pointing ? 'happy' : 'neutral', skin: 4, hair: 0, shirt: '#3d6b74', hairStyle: 'bun', seed: 8, look: 1 });
    roundRect(ctx, 395, yy - 92, 180, 16, 6); ctx.fillStyle = '#3b4260'; ctx.fill();
    ctx.fillStyle = '#2a2f45'; ctx.fillRect(405, yy - 76, 12, 76); ctx.fillRect(553, yy - 76, 12, 76);
    const lk = K.popIn(t, tBoard + 0.2, 0.4);
    if (lk > 0) K.drawLabel(ctx, 484, yy - 250, Math.min(1.05, lk), { text: P.board || "Board's choice", size: 26, dot: true });
  }

  // --- +2% coin arcs from the new bar into the jar
  if (t >= tCoin) {
    const u = K.phase(t, tCoin, tIn, H.easeInOutCubic);
    const pts = K.bezier(BX1, BB - BH * 1.5 - 60, BX1 + 120, 560, JX - 80, 560, JX, JT + 30, 30);
    if (t < tIn) {
      const p = K.pathPoint(pts, u);
      K.glow(ctx, p[0], p[1] - 32, 60, ACC, 0.5);
      K.drawCoin(ctx, p[0], p[1], 1.2, { spin: t * 7, symbol: '%', shadow: false });
      K.drawLabel(ctx, p[0], p[1] - 76, 1, { text: P.add || '+5%', size: 30, accent: true });
    } else {
      const fk = clamp((t - tIn) / 0.5);
      if (fk < 1) { ctx.save(); ctx.globalAlpha = 1 - fk; K.glow(ctx, JX, JT + 40, 140, ACC, 0.8); ctx.restore(); }
    }
  }
  ctx.restore();
  void lerp;
}
