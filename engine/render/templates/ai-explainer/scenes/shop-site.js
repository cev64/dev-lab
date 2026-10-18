// Scene "shop-site" (full frame, best as a 2-beat span). Day street with a small shop (bakery by default). Beat 1: a
// "Not just newsrooms" pill, the shopkeeper's phone card shows a business page, the shop's website floats above the
// shop, a dotted link draws phone -> site with a "tied to" pill; a crawler robot drifts in and scans the site.
// Beat 2: the phone card fades, the site window settles lower, two claim pills land (e.g. experts' view vs the
// company's reply); a "robots.txt" gate swings down between the robot and the site, the robot stops with a "?".
// params: shop ("BAKERY"), site ("bakery site"), page ("Business page"), notJust ("Not just big sites"),
//         tied ("Linked to the account"), a ("Critics: could allow scraping"), b ("Company: sites can opt out"),
//         gate ("robots.txt"), cues (narration words; without them, fractions of beat 1 / beat 2): notCue,
//         siteCue ("websites"), tiedCue, botCue, aCue, bCue, gateCue ("block")
// Fits: "this affects small businesses too" beats; opt-out / blocking caveats (robots.txt, settings, gates).
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, rgba } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const b2 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.55;
  const tN = at(P.notCue, b2 * 0.18) - 0.3;
  const tW = at(P.siteCue || 'websites', b2 * 0.42) - 0.3;
  const tL = at(P.tiedCue, b2 * 0.5) - 0.2;
  const tR = at(P.botCue, b2 * 0.78) - 0.6;
  const tA = at(P.aCue, b2 + 0.1) - 0.2;
  const tB = at(P.bCue, b2 + (D - b2) * 0.66) - 0.25;
  const tG = at(P.gateCue || 'block', b2 + (D - b2) * 0.82) - 0.35;

  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 470, y: 760 }, { t: b2, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 720 }]);
  K.world.city(ctx, { t, time: 'day', groundY: 1000 });
  const GY = 1000;

  // ---- bakery storefront ----
  const BX = 600, BW = 380, BT = 770;
  K.shadow(ctx, BX, GY, 420);
  roundRect(ctx, BX - BW / 2, BT, BW, GY - BT, 10); ctx.fillStyle = '#f0d9b5'; ctx.fill();
  roundRect(ctx, BX - BW / 2 + 24, BT + 70, 200, 130, 8); ctx.fillStyle = '#9cc7e6'; ctx.fill();
  // cakes in the window
  for (let i = 0; i < 3; i++) {
    const cx = BX - BW / 2 + 64 + i * 62, cy = BT + 190;
    roundRect(ctx, cx - 24, cy - 40, 48, 40, 8); ctx.fillStyle = ['#e58fa6', '#f6e3c1', '#b07850'][i]; ctx.fill();
    roundRect(ctx, cx - 26, cy - 46, 52, 12, 6); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy - 52, 6, 0, Math.PI * 2); ctx.fillStyle = '#e04f5f'; ctx.fill();
  }
  roundRect(ctx, BX + 70, BT + 70, 80, GY - BT - 70, 6); ctx.fillStyle = '#8a5a3c'; ctx.fill();
  ctx.beginPath(); ctx.arc(BX + 135, BT + 150, 5, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
  // awning with sign
  for (let i = 0; i < 8; i++) {
    const x = BX - BW / 2 - 10 + i * ((BW + 20) / 8);
    ctx.fillStyle = i % 2 ? '#ffffff' : '#e56b6f';
    ctx.beginPath(); ctx.moveTo(x, BT - 10); ctx.lineTo(x + (BW + 20) / 8, BT - 10); ctx.lineTo(x + (BW + 20) / 8, BT + 40);
    ctx.quadraticCurveTo(x + (BW + 20) / 16, BT + 58, x, BT + 40); ctx.closePath(); ctx.fill();
  }
  roundRect(ctx, BX - 110, BT - 62, 220, 50, 10); ctx.fillStyle = '#5a3b2a'; ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = H.font('display', 30); ctx.fillStyle = '#ffe9c4';
  ctx.fillText(P.shop || 'BAKERY', BX, BT - 36);

  // ---- baker with phone ----
  K.drawPerson(ctx, 300, 1036, 1.12, { t, pose: 'phone', mood: t > tG ? 'neutral' : t > tR + 0.6 ? 'worried' : 'happy', skin: 1, hair: 3, shirt: '#ffffff', hairStyle: 'bun', seed: 12, look: t > tR ? 0.7 : 0 });

  // ---- website window (floats above the shop, settles lower in beat 2) ----
  const settle = smooth((t - b2 + 0.2) / 0.8);
  const wk = K.popIn(t, tW, 0.5);
  const WX = BX, WY = lerp(610, 690, settle) + K.bob(t, 4, 1.2), WS = lerp(1, 0.86, settle);
  if (wk > 0) {
    ctx.save(); ctx.translate(WX, WY); ctx.scale(WS * Math.min(1.04, wk), WS * Math.min(1.04, wk));
    roundRect(ctx, -150, -100, 300, 200, 14); ctx.fillStyle = '#f4f1e8'; ctx.fill();
    roundRect(ctx, -150, -100, 300, 30, 14); ctx.fillStyle = '#d7d2c4'; ctx.fill(); ctx.fillRect(-150, -84, 300, 14);
    for (let d = 0; d < 3; d++) { ctx.beginPath(); ctx.arc(-130 + d * 16, -85, 5, 0, Math.PI * 2); ctx.fillStyle = ['#ef6b6b', '#f2c86b', '#7bd389'][d]; ctx.fill(); }
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#20243f'; ctx.fillText(P.site || 'bakery site', 20, -85);
    // loaves
    for (let i = 0; i < 3; i++) {
      ctx.save(); ctx.translate(-80 + i * 80, -10); ctx.beginPath(); ctx.ellipse(0, 0, 32, 20, 0, 0, Math.PI * 2); ctx.fillStyle = '#c98a4b'; ctx.fill();
      ctx.strokeStyle = '#a06a35'; ctx.lineWidth = 3; for (const dx of [-12, 0, 12]) { ctx.beginPath(); ctx.moveTo(dx - 5, -10); ctx.lineTo(dx + 5, 4); ctx.stroke(); }
      ctx.restore();
    }
    for (let r = 0; r < 3; r++) { roundRect(ctx, -120, 34 + r * 18, r === 2 ? 130 : 240, 8, 4); ctx.fillStyle = '#c9c4b5'; ctx.fill(); }
    ctx.restore();
  }

  // ---- phone card (business page), fades in beat 2 ----
  const pk = K.popIn(t, tW + 0.25, 0.5), pfade = 1 - smooth((t - b2 + 0.3) / 0.6);
  const PX = 250, PY = 640;
  if (pk > 0 && pfade > 0) {
    ctx.save(); ctx.globalAlpha = pfade; ctx.translate(PX, PY); ctx.scale(Math.min(1.04, pk), Math.min(1.04, pk));
    roundRect(ctx, -95, -120, 190, 240, 26); ctx.fillStyle = '#1b1f36'; ctx.fill();
    roundRect(ctx, -82, -104, 164, 208, 16); ctx.fillStyle = '#f4f1e8'; ctx.fill();
    roundRect(ctx, -82, -104, 164, 44, 16); ctx.fillStyle = '#5b6aa8'; ctx.fill(); ctx.fillRect(-82, -76, 164, 16);
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#ffffff'; ctx.fillText('Page', 0, -82);
    ctx.beginPath(); ctx.arc(0, -20, 26, 0, Math.PI * 2); ctx.fillStyle = '#e56b6f'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, -20, 15, 9, 0, 0, Math.PI * 2); ctx.fillStyle = '#c98a4b'; ctx.fill();
    for (let r = 0; r < 3; r++) { roundRect(ctx, -60, 22 + r * 20, r === 2 ? 70 : 120, 9, 4); ctx.fillStyle = '#c9c4b5'; ctx.fill(); }
    ctx.restore();
    if (pk > 0.5) { ctx.save(); ctx.globalAlpha = pfade; K.drawLabel(ctx, PX, PY - 132, Math.min(1.05, pk), { text: P.page || 'Business page', size: 26 }); ctx.restore(); }
  }
  // dotted link + tied pill
  const lk = clamp((t - tL) / 0.6);
  if (lk > 0 && pfade > 0) {
    ctx.save(); ctx.globalAlpha = pfade; ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.setLineDash([4, 12]); ctx.lineCap = 'round';
    K.pathDraw(ctx, K.bezier(PX + 95, PY - 20, PX + 180, PY - 120, WX - 260, WY - 60, WX - 150 * WS, WY, 24), lk);
    ctx.restore();
    const tk = K.popIn(t, tL + 0.3, 0.45);
    if (tk > 0) { ctx.save(); ctx.globalAlpha = pfade; K.drawLabel(ctx, 487, 470, Math.min(1.05, tk), { text: P.tied || 'Linked to the account', size: 28, accent: true }); ctx.restore(); }
  }
  // not-just-newsrooms pill (until the tied pill takes over)
  const nk = K.popIn(t, tN, 0.4), nfade = 1 - smooth((t - tL - 0.1) / 0.3);
  if (nk > 0 && nfade > 0) { ctx.save(); ctx.globalAlpha = nfade; K.drawLabel(ctx, 487, 470, Math.min(1.05, nk), { text: P.notJust || 'Not just big sites', size: 30, dot: true }); ctx.restore(); }

  // ---- crawler robot ----
  if (t > tR) {
    const u = smooth((t - tR) / 1.2);
    const bounce = t > tG ? Math.exp(-(t - tG) * 3) * Math.sin((t - tG) * 14) * 18 : 0;
    const rx = lerp(1080, 872, u) + (t > tG ? 20 * smooth((t - tG) / 0.4) : 0) + bounce, ry = 820 + K.bob(t, 8, 1.6);
    K.drawRobot(ctx, rx, ry, 0.56, { t, state: t > tG ? 'thinking' : 'working', flip: true, seed: 8 });
    // scan beam until the gate drops
    const beam = clamp((t - tR - 0.9) / 0.4) * (1 - smooth((t - tG) / 0.25));
    if (beam > 0) {
      const sc = Math.sin((t - tR) * 3);
      ctx.save(); ctx.globalAlpha = 0.33 * beam; ctx.fillStyle = ACC;
      ctx.beginPath(); ctx.moveTo(rx - 30, ry - 110); ctx.lineTo(WX + 40 * WS, WY - 70 * WS + sc * 60); ctx.lineTo(WX + 40 * WS, WY + 30 * WS + sc * 60); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    if (t > tG + 0.5) { const q = K.popIn(t, tG + 0.5, 0.4); K.drawSpeechBubble(ctx, rx - 10, ry - 150, 0.9 * Math.min(1.05, q), { text: '?', size: 40, tail: 'center', dark: true }); }
  }

  // ---- robots.txt gate ----
  const gk = smooth((t - tG) / 0.35);
  if (gk > 0) {
    const gx = 822, gy = 900;
    ctx.fillStyle = '#3a3f5c'; roundRect(ctx, gx - 8, gy - 20, 16, 120, 6); ctx.fill();
    ctx.save(); ctx.translate(gx, gy - 10); ctx.rotate(lerp(-Math.PI / 2, 0, gk) + Math.exp(-(t - tG) * 5) * Math.sin((t - tG) * 20) * 0.08 * (gk >= 1 ? 1 : 0));
    // bar goes up from the post: drawn vertical when rotated to 0 (bar pointing up)
    roundRect(ctx, -10, -300, 20, 300, 8); ctx.fillStyle = '#ffffff'; ctx.fill();
    for (let i = 0; i < 5; i++) { ctx.fillStyle = '#e04f5f'; ctx.fillRect(-10, -290 + i * 60, 20, 28); }
    ctx.restore();
    const sk = K.popIn(t, tG + 0.25, 0.4);
    if (sk > 0) K.drawLabel(ctx, gx - 20, gy - 330, Math.min(1.05, sk), { text: P.gate || 'robots.txt', size: 26, accent: true });
  }

  // ---- beat 2 claim pills ----
  const ak = K.popIn(t, tA, 0.45);
  if (ak > 0) K.drawLabel(ctx, 487, 470 + K.bob(t, 3, 1.3), Math.min(1.05, ak), { text: P.a || 'Critics: could allow scraping', size: 27, dot: true });
  const bk = K.popIn(t, tB, 0.45);
  if (bk > 0) K.drawLabel(ctx, 487, 536 + K.bob(t, 3, 1.3, 1), Math.min(1.05, bk), { text: P.b || 'Company: sites can opt out', size: 27 });
  void rgba;
}
