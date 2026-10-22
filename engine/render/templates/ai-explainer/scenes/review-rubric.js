// Scene "review-rubric" (full frame). Dusk office: a review board on an easel shows a scorecard (rows of bars + star
// ratings). A stat panel counts up to `value`. On changeCue an eraser wipes the rows and a marker rewrites them with
// new bars and "?" ratings. On rulerCue a giant ruler (the yardstick) slides in beside an employee like a height
// chart; on shiftCue its marks slide to new positions and a "your next review" pill lands; the employee looks worried.
// params: value ("50%"), label, label2, board ("REVIEW"), pill ("Your next review?"), valueCue, changeCue,
//         rulerCue, shiftCue
// Fits: changed criteria / grading / scoring rules, "how you're judged is changing", new standards.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp } = H;
  const at = (w, d, n = 0) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w, n); return v == null ? d : v; };
  const tVal = at(P.valueCue, 0.2), tCh = Math.max(tVal + 1, at(P.changeCue, D * 0.45));
  const tRul = Math.max(tCh + 1.2, at(P.rulerCue, D * 0.65)), tShift = Math.max(tRul + 0.8, at(P.shiftCue, D * 0.9));

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 470, y: 790 }, { t: D, zoom: 1.0, x: 487, y: 760 }]);
  K.world.office(ctx, { t, time: 'dusk' });
  // easel + board
  const bx = 95, by = 640, bw = 520, bh = 350;
  ctx.fillStyle = '#764d31';
  ctx.save(); ctx.translate(bx + 120, by + bh); ctx.rotate(0.12); ctx.fillRect(-8, -20, 16, 120); ctx.restore();
  ctx.save(); ctx.translate(bx + bw - 120, by + bh); ctx.rotate(-0.12); ctx.fillRect(-8, -20, 16, 120); ctx.restore();
  H.roundRect(ctx, bx - 12, by - 12, bw + 24, bh + 24, 16); ctx.fillStyle = '#9a6a46'; ctx.fill();
  H.roundRect(ctx, bx, by, bw, bh, 10); ctx.fillStyle = '#f2f4fa'; ctx.fill();
  ctx.fillStyle = '#161927'; ctx.font = H.font('display', 34); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(P.board || 'REVIEW', bx + 28, by + 52);
  ctx.fillStyle = ACC; ctx.fillRect(bx + 28, by + 64, 120, 6);
  // rows: old (until erased) then new
  const erase = K.phase(t, tCh, tCh + 0.9), write = K.phase(t, tCh + 0.9, tCh + 2.1);
  const rows = 4;
  for (let r = 0; r < rows; r++) {
    const y = by + 108 + r * 62;
    const ox = bx + 28, wOld = [230, 180, 260, 150][r], wNew = [170, 250, 140, 220][r];
    const erasedX = bx + 28 + erase * (bw - 56);
    // old row (clipped right of the eraser)
    if (erase < 1) {
      ctx.save(); ctx.beginPath(); ctx.rect(erasedX, y - 20, bw, 50); ctx.clip();
      H.roundRect(ctx, ox, y, wOld, 16, 8); ctx.fillStyle = '#b9c1d6'; ctx.fill();
      for (let s = 0; s < 5; s++) star(ctx, bx + 340 + s * 34, y + 8, 12, s < [4, 3, 5, 2][r] ? '#2a2f45' : '#d5dae8');
      ctx.restore();
    }
    // new row, written left to right
    const wk = clamp(write * rows - r * 0.6);
    if (wk > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(ox - 4, y - 20, (bw - 50) * wk + 4, 50); ctx.clip();
      H.roundRect(ctx, ox, y, wNew, 16, 8); ctx.fillStyle = H.mixHex('#b9c1d6', ACC, 0.55); ctx.fill();
      ctx.fillStyle = ACC; ctx.font = H.font('display', 30); ctx.textAlign = 'center';
      for (let s = 0; s < 3; s++) { ctx.fillStyle = H.mixHex('#2a2f45', ACC, 0.3); ctx.fillText('?', bx + 360 + s * 44, y + 20); }
      ctx.restore();
    }
  }
  // eraser + marker
  if (erase > 0 && erase < 1) {
    const ex = bx + 28 + erase * (bw - 56), ey = by + 200 + Math.sin(erase * Math.PI * 8) * 90;
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(-0.3);
    H.roundRect(ctx, -34, -22, 68, 44, 8); ctx.fillStyle = '#e8786a'; ctx.fill();
    H.roundRect(ctx, -34, 8, 68, 14, 6); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.restore();
  }
  if (write > 0 && write < 1) {
    const r = Math.min(rows - 1, Math.floor(write * rows)), wk = clamp(write * rows - r);
    const mx = bx + 28 + wk * (bw - 60), my = by + 108 + r * 62;
    ctx.save(); ctx.translate(mx, my); ctx.rotate(0.6);
    H.roundRect(ctx, -9, -90, 18, 90, 6); ctx.fillStyle = '#2a2f45'; ctx.fill();
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.lineTo(0, 16); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // employee + giant ruler (right)
  const worried = t > tShift - 0.2;
  const rk = K.phase(t, tRul, tRul + 0.8, H.easeOutBack);
  if (rk > 0) {
    const rx = lerp(1150, 860, rk), top = 600, bot = 1040;
    ctx.save();
    H.roundRect(ctx, rx - 32, top, 64, bot - top, 8); ctx.fillStyle = '#e0a84f'; ctx.fill();
    ctx.fillStyle = '#c48a35'; ctx.fillRect(rx + 16, top, 16, bot - top);
    const sh = K.phase(t, tShift, tShift + 1.0, H.easeInOutCubic);
    ctx.save(); ctx.beginPath(); ctx.rect(rx - 32, top, 64, bot - top); ctx.clip();
    for (let i = 0; i < 16; i++) {
      const gap = lerp(28, 38, sh), y = bot - 12 - i * gap - sh * 14;
      const long = i % 4 === 0;
      ctx.fillStyle = long ? '#2a2f45' : '#5a3d2c'; ctx.fillRect(rx - 32, y, long ? 38 : 20, 4);
    }
    ctx.restore();
    ctx.restore();
  }
  K.drawPerson(ctx, 730, 1045, 1.05, { t, pose: worried ? 'shrug' : 'stand', mood: worried ? 'worried' : 'neutral', shirt: '#e0a84f', skin: 1, hair: 4, hairStyle: 'curly', seed: 8, look: -0.6 });
  if (worried) {
    const p = K.popIn(t, tShift + 0.1, 0.35);
    if (p > 0) K.drawSpeechBubble(ctx, 760, 760, 1, { text: '?', size: 40, pop: p, tail: 'left' });
  }
  ctx.restore();

  // stat panel
  const pv = K.popIn(t, tVal, 0.5);
  if (pv > 0) {
    const cx = 487, top = 425, w = 800, h = 150;
    ctx.save(); ctx.translate(cx, top + h / 2); ctx.scale(pv, pv); ctx.translate(-cx, -(top + h / 2));
    H.roundRect(ctx, cx - w / 2, top, w, h, 24); ctx.fillStyle = 'rgba(10,12,22,0.84)'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
    const raw = String(P.value || '50%'), num = parseFloat(raw), k = K.phase(t, tVal + 0.1, tVal + 1.0, H.easeOutCubic);
    const shown = isNaN(num) ? raw : raw.replace(/[\d.]+/, String(Math.round(num * k)));
    ctx.fillStyle = ACC; ctx.font = H.font('display', 96); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(shown, cx - w / 2 + 32, top + 112);
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('bold', 28);
    ctx.fillText(P.label || 'say their criteria for', cx - w / 2 + 290, top + 66);
    ctx.fillText(P.label2 || 'judging performance changed', cx - w / 2 + 290, top + 106);
    ctx.restore();
  }
  const pp = K.popIn(t, tShift + 0.3, 0.45);
  if (pp > 0) K.drawLabel(ctx, 487, 1040, pp, { text: P.pill || 'Your next review?', size: 30, accent: true });
}

function star(ctx, x, y, r, col) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.beginPath();
  for (let k = 0; k < 10; k++) { const rad = k % 2 ? r * 0.45 : r, a = -Math.PI / 2 + (k / 10) * Math.PI * 2; ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}
