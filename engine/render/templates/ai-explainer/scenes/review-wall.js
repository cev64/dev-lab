// Scene "review-wall" (full frame, best as a 2-beat span). A night room whose wall is a generic store page of
// review cards, all thumbs-up at first. On pileCue red thumbs-down cards rain onto the wall (two layers) and on
// countCue a counter card (`count` + `countLabel`) pops over it. Two generic people stand below: on leftCue the
// left one gets a speech bubble (`left`), on rightCue the right one (`right`): the two sides of the argument.
// In the second beat (from beat 2's start or ratingCue) the bubbles clear, the red cards dim and a rating card
// (`ratingLabel` + `rating`, thumbs-up) lands; then up to two caveat pills (`steam` on steamCue, `names` on namesCue).
// params: storeLabel, count, countLabel, left, right, rating, ratingLabel, steam, names,
//         pileCue, countCue, leftCue, rightCue, ratingCue, steamCue, namesCue (narration words, "word#n", or seconds)
// Fits: review-bombing, a backlash wave against a product, two-sided reactions, "but overall it's still liked".
// Generic store UI only: no real store's logo or layout.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const RED = '#ff5e57';
  const b2 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.56;
  const tPile = at(P.pileCue, 0.4) - 0.2, tCount = at(P.countCue, D * 0.1) - 0.2;
  const tLeft = at(P.leftCue, D * 0.25) - 0.25, tRight = at(P.rightCue, D * 0.43) - 0.25;
  const tCalm = b2 - 0.2, tRating = Math.max(tCalm + 0.3, at(P.ratingCue, b2 + 0.8) - 0.4);
  const tSteam = at(P.steamCue, b2 + 2.5) - 0.3, tNames = at(P.namesCue, D - 1.5) - 0.3;
  const calm = clamp((t - tCalm) / 0.6);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 487, y: 650 }, { t: tLeft, zoom: 1.0, x: 487, y: 725 }, { t: tCalm, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 705 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: true });

  // ---- the store wall
  const WX0 = 130, WX1 = 850, WY0 = 450, WY1 = 870;
  roundRect(ctx, WX0 - 14, WY0 - 14, WX1 - WX0 + 28, WY1 - WY0 + 28, 22); ctx.fillStyle = '#11142a'; ctx.fill();
  roundRect(ctx, WX0, WY0, WX1 - WX0, WY1 - WY0, 14); ctx.fillStyle = '#171b33'; ctx.fill();
  roundRect(ctx, WX0, WY0, WX1 - WX0, 56, 14); ctx.fillStyle = '#232847'; ctx.fill(); ctx.fillRect(WX0, WY0 + 30, WX1 - WX0, 26);
  ctx.font = H.font('ui', 24); ctx.letterSpacing = '2px'; ctx.fillStyle = '#c9d0e6'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(String(P.storeLabel || 'REVIEWS'), WX0 + 24, WY0 + 29); ctx.letterSpacing = '0px';
  for (let i = 0; i < 5; i++) { ctx.fillStyle = i < 4 ? '#ffcc33' : 'rgba(255,204,51,0.35)'; star(ctx, WX1 - 150 + i * 28, WY0 + 29, 10); }

  const COLS = 4, ROWS = 3, CW = 160, CH = 100, GX = 16, GY = 14;
  const gx0 = (WX0 + WX1) / 2 - (COLS * CW + (COLS - 1) * GX) / 2, gy0 = WY0 + 76;
  const order = [5, 2, 9, 0, 7, 11, 3, 6, 10, 1, 8, 4];
  ctx.save(); roundRect(ctx, WX0, WY0 + 56, WX1 - WX0, WY1 - WY0 - 56, 14); ctx.clip();
  for (let i = 0; i < COLS * ROWS; i++) {
    const c = i % COLS, r = Math.floor(i / COLS), x = gx0 + c * (CW + GX), y = gy0 + r * (CH + GY);
    reviewCard(ctx, H, x, y, CW, CH, ACC, false, i, 0);
    for (let layer = 0; layer < 2; layer++) {
      const tl = tPile + order.indexOf(i) * 0.12 + layer * 1.7;
      const k = clamp((t - tl) / 0.45);
      if (k <= 0) continue;
      const yy = lerp(y - 520, y + layer * 8, H.easeOutCubic(k)) + (k >= 1 ? 0 : 0);
      const rot = (layer ? 0.06 : -0.03) * (1 - 0.5 * k) * (H.hash(i, layer) > 0.5 ? 1 : -1);
      ctx.save(); ctx.translate(x + CW / 2 + layer * 6, yy + CH / 2); ctx.rotate(rot); ctx.translate(-(x + CW / 2), -(yy + CH / 2));
      reviewCard(ctx, H, x, yy, CW, CH, RED, true, i + layer * 20, 0);
      ctx.restore();
    }
  }
  // calm: dim the red flood
  if (calm > 0) { ctx.fillStyle = `rgba(14,16,32,${0.55 * calm})`; ctx.fillRect(WX0, WY0 + 56, WX1 - WX0, WY1 - WY0); }
  ctx.restore();

  // ---- two people below: the two sides
  const lOn = t > tLeft && t < tCalm, rOn = t > tRight && t < tCalm;
  K.drawPerson(ctx, 175, 1040, 1.05, { t, pose: lOn ? 'point' : t > tCalm ? 'stand' : 'stand', mood: lOn ? 'angry' : t > tPile + 0.5 && t < tCalm ? 'worried' : 'neutral', look: 0.6, talk: lOn && t < tRight ? info.env * 0.7 : 0, skin: 2, hair: 0, hairStyle: 'curly', shirt: 2, seed: 5 });
  K.drawPerson(ctx, 800, 1040, 1.05, { t, pose: rOn ? 'shrug' : 'stand', mood: rOn ? 'neutral' : t > tPile + 0.5 && t < tCalm ? 'worried' : 'happy', look: -0.6, talk: rOn ? info.env * 0.7 : 0, skin: 0, hair: 2, hairStyle: 'long', shirt: 1, seed: 9, flip: false });
  ctx.restore();

  // ---- overlays
  // counter card over the flood
  const cp = K.popIn(t, tCount, 0.45), cOut = clamp((t - tLeft + 0.1) / 0.3);
  if (cp > 0 && cOut < 1) {
    const X0 = 200, Y0 = 560, W = 575, Hh = 190;
    ctx.save(); ctx.globalAlpha = 1 - cOut;
    ctx.translate(X0 + W / 2, Y0 + Hh / 2); const s = Math.min(1.04, 0.6 + 0.4 * cp); ctx.scale(s, s); ctx.translate(-(X0 + W / 2), -(Y0 + Hh / 2));
    roundRect(ctx, X0, Y0, W, Hh, 26); ctx.fillStyle = 'rgba(10,12,24,0.95)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(RED, 0.8); ctx.stroke();
    thumbBubble(ctx, H, X0 + 90, Y0 + Hh / 2, 54, RED, true);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const ft = H.fitText(ctx, String(P.count || 'HUNDREDS').toUpperCase(), 'display', 76, 40, W - 200); ctx.font = ft.font; ctx.fillStyle = RED;
    ctx.fillText(ft.text, X0 + 170, Y0 + 104);
    const fl = H.fitText(ctx, String(P.countLabel || 'negative reviews'), 'ui', 30, 18, W - 200); ctx.font = fl.font; ctx.fillStyle = '#ffffff';
    ctx.fillText(fl.text, X0 + 172, Y0 + 150);
    ctx.restore();
  }
  // speech bubbles (the two sides)
  const bubbleOut = clamp((t - tCalm) / 0.3);
  if (bubbleOut < 1) {
    ctx.save(); ctx.globalAlpha = 1 - bubbleOut;
    const lp = K.popIn(t, tLeft, 0.4);
    if (lp > 0 && P.left) K.drawSpeechBubble(ctx, 215, 790, Math.min(1, lp), { text: String(P.left), size: 30, maxW: 300, tail: 'left' });
    const rp = K.popIn(t, tRight, 0.4);
    if (rp > 0 && P.right) K.drawSpeechBubble(ctx, 760, 790, Math.min(1, rp), { text: String(P.right), size: 30, maxW: 300, tail: 'right', dark: true });
    ctx.restore();
  }
  // rating card
  const rk = K.popIn(t, tRating, 0.5);
  if (rk > 0) {
    const X0 = 200, Y0 = 540, W = 575, Hh = 180;
    ctx.save(); ctx.translate(X0 + W / 2, Y0 + Hh / 2); const s = Math.min(1.04, 0.6 + 0.4 * rk); ctx.scale(s, s); ctx.translate(-(X0 + W / 2), -(Y0 + Hh / 2));
    roundRect(ctx, X0, Y0, W, Hh, 26); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    thumbBubble(ctx, H, X0 + 88, Y0 + Hh / 2, 54, H.mixHex(ACC, '#000000', 0.15), false);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = H.font('ui', 26); ctx.letterSpacing = '2px'; ctx.fillStyle = '#3b4672';
    ctx.fillText(String(P.ratingLabel || 'Overall rating').toUpperCase(), X0 + 170, Y0 + 66); ctx.letterSpacing = '0px';
    const ft = H.fitText(ctx, String(P.rating || 'POSITIVE'), 'display', 58, 30, W - 200); ctx.font = ft.font; ctx.fillStyle = '#141829';
    ctx.fillText(ft.text, X0 + 168, Y0 + 132);
    ctx.restore();
  }
  const sp = K.popIn(t, tSteam, 0.45);
  if (sp > 0 && P.steam) K.drawLabel(ctx, 487, 800, sp, { text: String(P.steam), size: 27, dot: true });
  const np = K.popIn(t, tNames, 0.45);
  if (np > 0 && P.names) K.drawLabel(ctx, 487, 876, np, { text: String(P.names), size: 27, accent: true });
}

function reviewCard(ctx, H, x, y, w, h, col, down, seed, _) {
  H.roundRect(ctx, x, y, w, h, 12); ctx.fillStyle = down ? '#2b1820' : '#1f2a3a'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = H.rgba(col, down ? 0.9 : 0.5); ctx.stroke();
  thumbBubble(ctx, H, x + 34, y + h / 2, 22, col, down);
  ctx.fillStyle = down ? 'rgba(255,200,200,0.55)' : 'rgba(220,230,255,0.45)';
  for (let i = 0; i < 3; i++) { H.roundRect(ctx, x + 66, y + 26 + i * 18, (w - 84) * (0.55 + 0.45 * H.hash(seed, i)), 8, 4); ctx.fill(); }
}
function star(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
function thumbBubble(ctx, H, x, y, r, col, down) {
  if (r <= 0) return;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  const s = r / 30; ctx.scale(s, down ? -s : s);
  ctx.fillStyle = '#ffffff';
  H.roundRect(ctx, -16, -4, 9, 20, 3); ctx.fill();
  H.roundRect(ctx, -5, -6, 22, 22, 6); ctx.fill();
  H.roundRect(ctx, -3, -20, 10, 18, 5); ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-3, 3); ctx.lineTo(15, 3); ctx.moveTo(-3, 9); ctx.lineTo(15, 9); ctx.stroke();
  ctx.restore();
}
