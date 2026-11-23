// Scene "review-crash" (full frame). A night room whose wall is a generic game store page: a neon game banner, info
// rows with an empty "AI DISCLOSURE" row, and a grid of thumbs-up review cards. A rule book opens on a lectern
// (ruleCue) with a `rule` pill; on noneCue the disclosure row gets a red NONE + cross; on pileCue red thumbs-down
// review cards rain over the grid while two cartoon players hold up thumbs-down signs; on countCue a counter card
// (`count`, `countLabel`) slams over the page with a red `rating` bar.
// params: storeLabel, rule, disclosure, none, count, countLabel, rating, ruleCue, noneCue, pileCue, countCue
// Fits: a product page missing a required label + a review-bomb / ratings crash.
// Library defaults are generic placeholders (count "X%"); pass the story's store rule and published figures.
// Generic store UI only: no real store's logo or layout; no real game art.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const RED = '#ff5e57';
  const tRule = at(P.ruleCue, 0.4) - 0.3, tNone = at(P.noneCue, D * 0.35) - 0.3;
  const tPile = at(P.pileCue, D * 0.55) - 0.3, tCount = at(P.countCue, D * 0.75) - 0.4;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: tNone - 0.2, zoom: 1.0, x: 487, y: 725 }, { t: tNone + 0.6, zoom: 1.06, x: 560, y: 680 }, { t: tPile, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 715 }]);
  const shake = t > tCount + 0.2 && t < tCount + 0.6 ? Math.sin(t * 80) * 5 * (1 - (t - tCount - 0.2) / 0.4) : 0;
  ctx.translate(shake, 0);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: true });

  // ---- store page
  const WX0 = 130, WX1 = 850, WY0 = 430, WY1 = 880;
  roundRect(ctx, WX0 - 14, WY0 - 14, WX1 - WX0 + 28, WY1 - WY0 + 28, 22); ctx.fillStyle = '#11142a'; ctx.fill();
  roundRect(ctx, WX0, WY0, WX1 - WX0, WY1 - WY0, 14); ctx.fillStyle = '#171b33'; ctx.fill();
  roundRect(ctx, WX0, WY0, WX1 - WX0, 52, 14); ctx.fillStyle = '#232847'; ctx.fill(); ctx.fillRect(WX0, WY0 + 28, WX1 - WX0, 24);
  ctx.font = H.font('ui', 24); ctx.letterSpacing = '2px'; ctx.fillStyle = '#c9d0e6'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(String(P.storeLabel || 'GAME STORE PAGE'), WX0 + 24, WY0 + 27); ctx.letterSpacing = '0px';
  // banner
  const BX = WX0 + 20, BY = WY0 + 70, BW = 330, BH = 190;
  neonGame(ctx, H, BX, BY, BW, BH, t);
  // info rows
  const RX = BX + BW + 24, RW = WX1 - 20 - RX;
  ctx.fillStyle = '#2b3150';
  for (let i = 0; i < 2; i++) { roundRect(ctx, RX, BY + 6 + i * 34, RW * (0.9 - i * 0.25), 16, 8); ctx.fill(); }
  // the disclosure row
  const DY = BY + 92, DH = 96;
  const nk = clamp((t - tNone) / 0.4);
  roundRect(ctx, RX, DY, RW, DH, 14); ctx.fillStyle = nk > 0 ? H.mixHex('#20253f', '#3a1820', nk) : '#20253f'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = nk > 0 ? rgba(RED, 0.4 + 0.6 * nk) : 'rgba(200,210,240,0.25)'; ctx.stroke();
  ctx.font = H.font('ui', 22); ctx.letterSpacing = '2px'; ctx.fillStyle = '#c9d0e6'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(String(P.disclosure || 'AI DISCLOSURE').toUpperCase(), RX + 18, DY + 26); ctx.letterSpacing = '0px';
  if (nk <= 0) {
    ctx.save(); ctx.setLineDash([8, 8]); ctx.strokeStyle = 'rgba(200,210,240,0.35)'; ctx.lineWidth = 2;
    roundRect(ctx, RX + 18, DY + 46, RW - 36, 36, 10); ctx.stroke(); ctx.restore();
  } else {
    const s = 1 + 0.8 * Math.pow(1 - H.easeOutCubic(nk), 2);
    ctx.save(); ctx.translate(RX + 18, DY + 66); ctx.scale(s, s);
    ctx.font = H.font('display', 40); ctx.fillStyle = RED; ctx.textBaseline = 'middle'; ctx.fillText(String(P.none || 'NONE'), 0, 2);
    const nw = ctx.measureText(String(P.none || 'NONE')).width;
    ctx.strokeStyle = RED; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(nw + 22, -14); ctx.lineTo(nw + 50, 14); ctx.moveTo(nw + 50, -14); ctx.lineTo(nw + 22, 14); ctx.stroke();
    ctx.restore();
  }
  // review grid
  const COLS = 4, ROWS = 2, GX0 = WX0 + 20, GY0 = BY + BH + 22, CW = (WX1 - WX0 - 40 - (COLS - 1) * 14) / COLS, CH = 80;
  const order = [5, 2, 0, 7, 3, 6, 1, 4];
  ctx.save(); roundRect(ctx, WX0, GY0 - 4, WX1 - WX0, WY1 - GY0 + 4, 14); ctx.clip();
  for (let i = 0; i < COLS * ROWS; i++) {
    const c = i % COLS, r = Math.floor(i / COLS), x = GX0 + c * (CW + 14), y = GY0 + r * (CH + 12);
    reviewCard(ctx, H, x, y, CW, CH, '#6f86e0', false, i);
    for (let layer = 0; layer < 3; layer++) {
      const tl = tPile + order.indexOf(i) * 0.1 + layer * 0.9;
      const k = clamp((t - tl) / 0.4);
      if (k <= 0) continue;
      const yy = lerp(y - 420, y + layer * 5, H.easeOutCubic(k));
      const rot = (layer % 2 ? 0.05 : -0.04) * (1 - 0.5 * k) * (H.hash(i, layer) > 0.5 ? 1 : -1);
      ctx.save(); ctx.translate(x + CW / 2 + layer * 4, yy + CH / 2); ctx.rotate(rot); ctx.translate(-(x + CW / 2), -(yy + CH / 2));
      reviewCard(ctx, H, x, yy, CW, CH, RED, true, i + layer * 20);
      ctx.restore();
    }
  }
  ctx.restore();

  // ---- rule book on a lectern (left) + rule pill
  const rp = K.popIn(t, tRule, 0.45);
  K.drawLectern(ctx, 215, 1040, 0.7);
  K.drawRulebook(ctx, 215, 1040 - 158, 0.62, { open: clamp((t - tRule) / 0.6), title: 'RULES' });

  // ---- two players with thumbs-down signs (right)
  const angry = t > tPile;
  [[640, 1.0, 0, 2, 'curly', 3, 7], [800, 1.05, 4, 1, 'long', 0, 11]].forEach(([px, s, skin, hair, hs, shirt, seed], j) => {
    K.drawPerson(ctx, px, 1040, s, { t, pose: angry ? 'cheer' : 'stand', mood: angry ? 'angry' : 'neutral', look: -0.5, skin, hair, hairStyle: hs, shirt, seed });
    const sp = K.popIn(t, tPile + 0.15 + j * 0.2, 0.4);
    if (sp > 0) {
      const bob = Math.sin(t * 7 + j) * 6;
      ctx.save(); ctx.translate(px, 1040 - 250 * s - 40 + bob); ctx.scale(sp, sp);
      ctx.fillStyle = '#9a6a46'; ctx.fillRect(-4, 0, 8, 60);
      roundRect(ctx, -46, -70, 92, 76, 14); ctx.fillStyle = '#f4f6fb'; ctx.fill();
      thumbBubble(ctx, H, 0, -32, 28, RED, true);
      ctx.restore();
    }
  });
  if (rp > 0) {
    const out = clamp((t - tPile) / 0.3);
    if (out < 1) { ctx.save(); ctx.globalAlpha = 1 - out; K.drawLabel(ctx, 487, 1000, rp, { text: String(P.rule || 'Store rule: disclose AI content'), size: 30, dot: true }); ctx.restore(); }
  }
  ctx.restore();

  // ---- counter card (outside the shake so it reads steady)
  const cp = K.popIn(t, tCount, 0.5);
  if (cp > 0) {
    const X0 = 175, Y0 = 520, W = 625, Hh = 300;
    ctx.save();
    ctx.translate(X0 + W / 2, Y0 + Hh / 2); const s = Math.min(1.04, 0.5 + 0.5 * cp); ctx.scale(s, s); ctx.translate(-(X0 + W / 2), -(Y0 + Hh / 2));
    ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 36; ctx.shadowOffsetY = 12;
    roundRect(ctx, X0, Y0, W, Hh, 28); ctx.fillStyle = 'rgba(10,12,24,0.97)'; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(RED, 0.85); ctx.stroke();
    thumbBubble(ctx, H, X0 + 100, Y0 + 110, 62, RED, true);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const val = String(P.count || 'X%');
    const shown = val; // slams in as published (no count-up from an invented start value)
    ctx.font = H.font('display', 112); ctx.fillStyle = RED; ctx.fillText(shown, X0 + 200, Y0 + 150);
    const fl = H.fitText(ctx, String(P.countLabel || 'positive'), 'ui', 30, 18, W - 230); ctx.font = fl.font; ctx.fillStyle = '#ffffff';
    ctx.fillText(fl.text, X0 + 204, Y0 + 196);
    const bk = clamp((t - tCount - 0.7) / 0.4);
    if (bk > 0) {
      roundRect(ctx, X0 + 30, Y0 + 222, (W - 60) * H.easeOutCubic(bk), 54, 14); ctx.fillStyle = RED; ctx.fill();
      ctx.save(); ctx.globalAlpha = clamp((bk - 0.5) * 2);
      const fr = H.fitText(ctx, String(P.rating || 'Negative').toUpperCase(), 'display', 32, 18, W - 100); ctx.font = fr.font; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(fr.text, X0 + W / 2, Y0 + 250); ctx.restore();
    }
    ctx.restore();
  }
}

function reviewCard(ctx, H, x, y, w, h, col, down, seed) {
  H.roundRect(ctx, x, y, w, h, 12); ctx.fillStyle = down ? '#2b1820' : '#1f2a3a'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = H.rgba(col, down ? 0.9 : 0.5); ctx.stroke();
  thumbBubble(ctx, H, x + 32, y + h / 2, 20, col, down);
  ctx.fillStyle = down ? 'rgba(255,200,200,0.55)' : 'rgba(220,230,255,0.45)';
  for (let i = 0; i < 3; i++) { H.roundRect(ctx, x + 62, y + 20 + i * 16, (w - 78) * (0.55 + 0.45 * H.hash(seed, i)), 7, 3.5); ctx.fill(); }
}
function thumbBubble(ctx, H, x, y, r, col, down) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  const s = r / 30; ctx.scale(s, down ? -s : s);
  ctx.fillStyle = '#ffffff';
  H.roundRect(ctx, -16, -4, 9, 20, 3); ctx.fill();
  H.roundRect(ctx, -5, -6, 22, 22, 6); ctx.fill();
  H.roundRect(ctx, -3, -20, 10, 18, 5); ctx.fill();
  ctx.restore();
}
function note(ctx, x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.strokeStyle = col;
  ctx.beginPath(); ctx.ellipse(0, 0, 13, 10, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(11, -3); ctx.lineTo(11, -44); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(11, -44); ctx.quadraticCurveTo(30, -36, 26, -18); ctx.quadraticCurveTo(24, -30, 11, -32); ctx.fill();
  ctx.restore();
}
// Compact neon game banner (same look as file-dig.js; duplicated because scene modules are served standalone).
function neonGame(ctx, H, x, y, w, h, t) {
  const { roundRect } = H, fr = (v) => v - Math.floor(v);
  ctx.save(); roundRect(ctx, x, y, w, h, 10); ctx.clip();
  const hy = y + h * 0.6;
  const g = ctx.createLinearGradient(0, y, 0, hy); g.addColorStop(0, '#2a1858'); g.addColorStop(0.6, '#c2448f'); g.addColorStop(1, '#ffad66');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, hy - y);
  const sx = x + w * 0.5, sr = h * 0.26;
  const sg = ctx.createLinearGradient(0, hy - sr * 1.6, 0, hy); sg.addColorStop(0, '#ffe36b'); sg.addColorStop(1, '#ff5fa2');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, hy - sr * 0.2, sr, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#2a1650'; for (let i = 0; i < 10; i++) { const bw = w / 10, bh = h * (0.08 + 0.2 * H.hash(i, 11)); ctx.fillRect(x + i * bw, hy - bh, bw - 3, bh); }
  ctx.fillStyle = '#1a0f33'; ctx.fillRect(x, hy, w, y + h - hy);
  ctx.strokeStyle = 'rgba(255,79,216,0.55)'; ctx.lineWidth = 2;
  for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(sx + i * 8, hy); ctx.lineTo(sx + i * w * 0.18, y + h); ctx.stroke(); }
  for (let i = 0; i < 4; i++) { const u = fr(i / 4 + t * 0.6), yy = hy + (y + h - hy) * u * u; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); }
  for (let i = 0; i < 4; i++) {
    const u = fr(i / 4 + t * 0.35), nx = sx + (H.hash(i, 21) - 0.5) * w * 0.7, ny = y + h * 0.85 - u * h * 0.7;
    ctx.save(); ctx.globalAlpha = Math.sin(u * Math.PI); note(ctx, nx, ny, 0.5, '#ffffff'); ctx.restore();
  }
  ctx.restore();
}
