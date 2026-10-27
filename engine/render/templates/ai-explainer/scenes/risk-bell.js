// Scene "risk-bell" (full frame, best as a 2-beat span). Beat 1: night study, a giant filing booklet stands open on
// a lectern; the kit robot points at it; a "RISK FACTORS" header pops on the page, a line of text types in verbatim
// and a highlighter sweeps it on hlCue; a warning label stamps onto the booklet's cover on warnCue. Beat 2 (from
// the 2nd beat, or bellCue): the room dims and slides to an exchange balcony: a big opening bell on a stand, unrung,
// with a price tag "$ ?" swinging under it and a "size ?" pill; then a question card drops (qCue) with two chips.
// Ends settled (bell still, tag swinging gently, "?" pulsing).
// Fits: a company's own filing listing a risk, then "not priced / not listed yet" + a payoff question.
// params: doc ("S-1"), head ("RISK FACTORS"), line (verbatim text), by (attribution), warn ("WARNING"),
//         price ("$ ?"), priceLabel ("Share price"), size ("Raise size: ?"), question, a, b,
//         cues: docCue, hlCue, warnCue, bellCue, priceCue, sizeCue, qCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, rgba, roundRect, mixHex } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const b2 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.55;
  const tDoc = at(P.docCue, D * 0.1) - 0.2;
  const tHl = at(P.hlCue, D * 0.35) - 0.1;
  const tWarn = at(P.warnCue, D * 0.45);
  const tBell = at(P.bellCue, b2) - 0.4;
  const tPrice = at(P.priceCue, tBell + 0.8) - 0.1;
  const tSize = at(P.sizeCue, tBell + 2) - 0.1;
  const tQ = at(P.qCue, D * 0.82) - 0.4;
  const sw = K.phase(t, tBell, tBell + 0.9, H.easeInOutCubic); // 0 = study, 1 = balcony

  ctx.save();
  // ===== part 1: the filing
  if (sw < 1) {
    ctx.save();
    ctx.translate(-sw * 1080, 0);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: tHl, zoom: 1.06, x: 470, y: 690 }, { t: tBell, zoom: 1.08, x: 470, y: 690 }]);
    K.world.room(ctx, { t, time: 'night', lamp: true, window: true, plant: true });
    // lectern + giant booklet
    K.drawLectern(ctx, 420, 1035, 1.25, {});
    const BX = 420, BY = 1035 - 232 * 1.25 + 8; // booklet bottom sits on the lectern top
    const ok = K.popIn(t, tDoc, 0.5);
    const BW = 560, BH = 340;
    ctx.save(); ctx.translate(BX, BY); ctx.scale(Math.min(1.03, 0.6 + 0.4 * ok), Math.min(1.03, 0.6 + 0.4 * ok));
    // pages (open book)
    roundRect(ctx, -BW / 2 - 12, -BH - 8, BW + 24, BH + 16, 16); ctx.fillStyle = '#3b4672'; ctx.fill();
    roundRect(ctx, -BW / 2, -BH, BW / 2 - 4, BH, 10); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    roundRect(ctx, 4, -BH, BW / 2 - 4, BH, 10); ctx.fillStyle = '#f6f7fb'; ctx.fill();
    ctx.fillStyle = '#d5dae8'; ctx.fillRect(-3, -BH, 6, BH);
    // left page: doc title + filler lines
    ctx.font = H.font('display', 48); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3b4672';
    ctx.fillText(P.doc || 'S-1', -BW / 4, -BH + 70);
    for (let i = 0; i < 9; i++) { roundRect(ctx, -BW / 2 + 30, -BH + 130 + i * 26, (BW / 2 - 70) * (0.6 + 0.4 * H.hash(i, 3)), 9, 4); ctx.fillStyle = '#d5dae8'; ctx.fill(); }
    // right page: header + typed verbatim line + highlighter
    const hk = clamp((t - tDoc - 0.6) / 0.4);
    ctx.save(); ctx.globalAlpha = hk;
    ctx.font = H.font('ui', 22); ctx.fillStyle = '#c0392b'; ctx.textAlign = 'left';
    ctx.fillText(P.head || 'RISK FACTORS', 26, -BH + 42);
    ctx.restore();
    const line = String(P.line || 'Verbatim line');
    const words = line.split(' ');
    // wrap to the right page width
    ctx.font = H.font('bold', 24);
    const lines = []; let cur = '';
    for (const w of words) { const n = cur ? cur + ' ' + w : w; if (cur && ctx.measureText(n).width > BW / 2 - 56) { lines.push(cur); cur = w; } else cur = n; }
    if (cur) lines.push(cur);
    const shown = K.typewriter(line, t, 34, tDoc + 0.9).length;
    let used = 0;
    lines.forEach((ln, i) => {
      const y = -BH + 84 + i * 34;
      const take = clamp(shown - used, 0, ln.length); used += ln.length + 1;
      const hl = clamp((t - tHl - i * 0.35) / 0.5);
      if (hl > 0) { ctx.fillStyle = rgba(ACC, 0.75); ctx.fillRect(22, y - 16, (ctx.measureText(ln).width + 10) * hl, 32); }
      ctx.fillStyle = '#161927'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(ln.slice(0, take), 26, y);
    });
    const ly = -BH + 84 + lines.length * 34 + 6;
    for (let i = 0; i < 4; i++) { roundRect(ctx, 26, ly + i * 24, (BW / 2 - 70) * (0.5 + 0.5 * H.hash(i, 9)), 8, 4); ctx.fillStyle = '#d5dae8'; ctx.fill(); }
    ctx.font = H.font('ui', 18); ctx.fillStyle = rgba('#161927', 0.6); ctx.textAlign = 'left';
    if (shown >= line.length) ctx.fillText(P.by || '', 26, -22);
    ctx.restore();
    // warning stamp lands on the left page
    if (t > tWarn) {
      const land = clamp((t - tWarn) / 0.5);
      K.drawStamp(ctx, BX - 155, BY - 40, 0.75, { kind: 'cross', text: P.warn || 'WARNING', land });
    }
    // robot points from the right
    K.drawRobot(ctx, 820, 1035, 0.95, { t, state: t > tWarn ? 'thinking' : 'idle', seed: 4, flip: true });
    K.drawWarning(ctx, 820, 760, 0.6 * K.popIn(t, tWarn + 0.3, 0.4), { pulse: 0.5 + 0.5 * Math.sin(t * 6) });
    ctx.restore();
  }

  // ===== part 2: the exchange balcony with the (unrung) bell
  if (sw > 0) {
    ctx.save();
    ctx.translate((1 - sw) * 1080, 0);
    const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#141a3a'); g.addColorStop(0.55, '#232a55'); g.addColorStop(1, '#0b0e1f');
    ctx.fillStyle = g; ctx.fillRect(-60, -60, 1200, 2040);
    // trading-floor glow and screens in the back
    for (let i = 0; i < 6; i++) {
      const x = 40 + i * 175, y = 760 + (i % 2) * 24;
      roundRect(ctx, x, y, 150, 80, 8); ctx.fillStyle = '#0e1229'; ctx.fill();
      ctx.strokeStyle = rgba(ACC, 0.35); ctx.lineWidth = 3; ctx.beginPath();
      for (let k = 0; k <= 10; k++) { const xx = x + 10 + k * 13, yy = y + 50 - 26 * H.hash(i, k + Math.floor(t * 2)); k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
      ctx.stroke();
    }
    // balcony rail
    roundRect(ctx, -20, 960, 1120, 24, 8); ctx.fillStyle = '#3b4260'; ctx.fill();
    for (let i = 0; i < 16; i++) { ctx.fillStyle = '#2a2f45'; ctx.fillRect(10 + i * 70, 984, 14, 60); }
    ctx.fillStyle = '#1c2033'; ctx.fillRect(-20, 1040, 1120, 900);
    // bell stand
    const SX = 330;
    ctx.fillStyle = '#9a6a46'; ctx.fillRect(SX - 120, 520, 18, 440); ctx.fillRect(SX + 102, 520, 18, 440);
    roundRect(ctx, SX - 140, 505, 280, 26, 10); ctx.fillStyle = '#b37d54'; ctx.fill();
    // bell (still, small idle sway) + price tag hanging from it
    const sway = Math.sin(t * 1.4) * 0.03;
    ctx.save(); ctx.translate(SX, 531); ctx.rotate(sway);
    ctx.beginPath(); ctx.moveTo(-34, 20); ctx.quadraticCurveTo(-40, 120, -96, 170); ctx.lineTo(96, 170); ctx.quadraticCurveTo(40, 120, 34, 20); ctx.quadraticCurveTo(0, -6, -34, 20); ctx.closePath();
    const bg = ctx.createLinearGradient(-96, 0, 96, 0); bg.addColorStop(0, '#d8a640'); bg.addColorStop(0.45, '#ffd76a'); bg.addColorStop(1, '#b8862c');
    ctx.fillStyle = bg; ctx.fill();
    roundRect(ctx, -104, 164, 208, 18, 8); ctx.fillStyle = '#b8862c'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 192, 14, 0, Math.PI * 2); ctx.fillStyle = '#8a6420'; ctx.fill();
    ctx.restore();
    // price tag
    const pk = K.popIn(t, tPrice, 0.45);
    if (pk > 0) {
      K.drawPriceTag(ctx, SX, 900, 1.2 * Math.min(1.05, pk), { text: P.price || '$ ?', t });
      K.drawLabel(ctx, SX, 735, Math.min(1.05, pk), { text: P.priceLabel || 'Share price', size: 24 });
    }
    const zk = K.popIn(t, tSize, 0.45);
    if (zk > 0) K.drawLabel(ctx, 690, 790, Math.min(1.05, zk), { text: P.size || 'Raise size: ?', size: 28, dot: true });
    // robot by the bell, waiting
    K.drawRobot(ctx, 730, 1040, 0.85, { t, state: t > tQ ? 'thinking' : 'idle', seed: 6, flip: true });
    // question card
    const qk = K.popIn(t, tQ, 0.5);
    if (qk > 0) {
      const QX = 487, QY = 440, QW = 820, QH = 220;
      ctx.save(); ctx.translate(QX, QY + QH / 2); ctx.scale(Math.min(1.03, qk), Math.min(1.03, qk)); ctx.translate(-QX, -(QY + QH / 2));
      roundRect(ctx, QX - QW / 2, QY, QW, QH, 24); ctx.fillStyle = 'rgba(10,12,22,0.92)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.6); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const q = String(P.question || 'Question?');
      const ft = H.fitText(ctx, q, 'display', 40, 26, QW - 60); ctx.font = ft.font;
      const wl = H.wrap(ctx, q, 'display', 40, QW - 70);
      const lines = Array.isArray(wl) ? wl : (wl && wl.lines) || [q];
      ctx.font = H.font('display', 40);
      lines.slice(0, 2).forEach((ln, i) => ctx.fillText(typeof ln === 'string' ? ln : ln.text, QX, QY + 58 + i * 50));
      ctx.restore();
      const ak = K.popIn(t, tQ + 0.5, 0.4), bk = K.popIn(t, tQ + 0.7, 0.4);
      if (ak > 0) K.drawLabel(ctx, QX - 190, QY + QH - 14, Math.min(1.05, ak), { text: P.a || 'Yes', size: 26, accent: true });
      if (bk > 0) K.drawLabel(ctx, QX + 190, QY + QH - 14, Math.min(1.05, bk), { text: P.b || 'No', size: 26 });
    }
    ctx.restore();
  }
  ctx.restore();
}
