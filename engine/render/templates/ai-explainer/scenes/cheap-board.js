// Scene "cheap-board" (full frame). A hobbyist workbench at night. First a flashy "spy movie" gadget (open silver
// case with a dish and dials) pops up and gets crossed out; then a source pill and a filing page; then a generic tiny
// dev board (no brand) slides in big, LED blinking, with a label; a price tag swings in and counts up.
// Fits: "the gadget was cheap / off the shelf", hobby hardware, DIY devices, "it cost less than lunch".
// params: nope ("Not spy-movie gear"), by ("According to Bloomberg"), doc ("FILING"), board ("Hobby circuit board"),
//         price (14), prefix ("$"), sold ("Sold online")
//         cues: byCue ("bloomberg"), docCue ("filing"), boardCue ("hobby"), priceCue ("fourteen")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, rgba } = H;
  const TAU = Math.PI * 2;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const rr = (x, y, w, h, r, fill) => { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); };
  const circle = (x, y, r, fill) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); };
  const pill = (x, y, k, text, o = {}) => { if (k > 0) K.drawLabel(ctx, x, y, Math.min(1.08, k), Object.assign({ text, size: o.size || 30 }, o)); };
  const tBy = at(P.byCue || 'bloomberg', D * 0.3) - 0.3, tDoc = at(P.docCue || 'filing', D * 0.4) - 0.2;
  const tBoard = at(P.boardCue || 'hobby', D * 0.55) - 0.3, tPrice = at(P.priceCue || 'fourteen', D * 0.85) - 0.2;
  const tCross = Math.min(1.3, tBy - 0.8), tGone = tBy - 0.1;

  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 740 }, { t: tBoard, zoom: 1.0 }, { t: D, zoom: 1.06, x: 487, y: 720 }]);
  K.world.room(ctx, { t, time: 'night', floorY: 900, window: false, picture: false, lamp: false, plant: false, wall: '#222a4b' });
  // pegboard with tools
  rr(110, 420, 760, 250, 16, '#2c355c');
  for (let r = 0; r < 6; r++) for (let c = 0; c < 20; c++) circle(140 + c * 37, 442 + r * 40, 3, '#222a4b');
  // bench
  K.shadow(ctx, 487, 1012, 760, 0.35);
  rr(90, 880, 800, 30, 10, '#8a6a52'); rr(110, 910, 22, 100, 6, '#5d4636'); rr(848, 910, 22, 100, 6, '#5d4636');
  rr(170, 860, 640, 22, 6, '#2f6b5c');
  for (let i = 0; i < 20; i++) { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(180 + i * 32, 862, 2, 18); }

  // 1) the spy-movie gadget, crossed out, then shrinks away
  const gk = K.popIn(t, 0.05, 0.45) * (1 - smooth((t - tGone) / 0.4));
  if (gk > 0) {
    ctx.save(); ctx.translate(487, 860); ctx.scale(gk, gk);
    // open silver case
    rr(-210, -60, 420, 60, 12, '#9aa3b8'); rr(-210, -60, 420, 14, 8, '#c3c9d8');
    ctx.save(); ctx.translate(0, -60); ctx.transform(1, 0, -0.25, 1, 0, 0);
    rr(-190, -200, 400, 200, 14, '#b9c0d0'); rr(-170, -182, 360, 164, 10, '#151a30');
    // screen: radar sweep
    const a = t * 3;
    ctx.strokeStyle = rgba(ACC, 0.5); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-70, -100, 60, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(-70, -100, 30, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-70, -100); ctx.lineTo(-70 + Math.cos(a) * 60, -100 + Math.sin(a) * 60); ctx.stroke();
    for (let i = 0; i < 3; i++) rr(30, -150 + i * 34, 120, 14, 6, rgba(ACC, 0.35));
    ctx.restore();
    // dish antenna
    ctx.save(); ctx.translate(170, -270); ctx.rotate(-0.5 + Math.sin(t * 2) * 0.1);
    ctx.beginPath(); ctx.arc(0, 0, 50, 0.2, Math.PI - 0.2); ctx.fillStyle = '#d5dae8'; ctx.fill();
    ctx.strokeStyle = '#8a93a8'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 46); ctx.stroke();
    ctx.restore();
    // dials
    for (let i = 0; i < 3; i++) { circle(-150 + i * 60, -30, 14, '#3b4260'); circle(-150 + i * 60, -30, 5, ACC); }
    ctx.restore();
    // sparkles
    for (let i = 0; i < 5; i++) { const ph = (t * 0.8 + i * 0.2) % 1; K.glow(ctx, 300 + i * 110, 560 + 60 * Math.sin(i * 2), 26, '#ffffff', 0.5 * Math.sin(ph * Math.PI) * gk); }
    // red cross over it
    const ck = K.phase(t, tCross, tCross + 0.35);
    if (ck > 0) {
      ctx.save(); ctx.globalAlpha = gk; ctx.strokeStyle = '#ff5a52'; ctx.lineWidth = 22; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(250, 560); ctx.lineTo(lerp(250, 730, ck), lerp(560, 900, ck)); ctx.stroke();
      if (ck > 0.5) { const c2 = (ck - 0.5) * 2; ctx.beginPath(); ctx.moveTo(730, 560); ctx.lineTo(lerp(730, 250, c2), lerp(560, 900, c2)); ctx.stroke(); }
      ctx.restore();
    }
    pill(487, 1010, K.popIn(t, tCross + 0.1) * gk, P.nope || 'Not spy-movie gear', { size: 30 });
  }

  // 2) source pill + filing page
  pill(487, 490, K.popIn(t, tBy), P.by || 'According to Bloomberg', { accent: true, size: 32 });
  const dk = K.popIn(t, tDoc, 0.4);
  if (dk > 0) {
    ctx.save(); ctx.translate(190, 860); ctx.rotate(-0.08); ctx.scale(dk, dk);
    K.drawDocument(ctx, 0, 0, 1.0, { lines: 6, title: P.doc || 'FILING' });
    ctx.restore();
  }

  // 3) the dev board
  const bk = clamp((t - tBoard) / 0.55);
  if (bk > 0) {
    const e = H.easeOutBack ? H.easeOutBack(bk) : H.easeOutCubic(bk);
    const bx = lerp(1200, 520, e), by = 760 + Math.sin(t * 1.6) * 6;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-0.06 + Math.sin(t * 1.3) * 0.02);
    K.shadow(ctx, 0, 110, 340, 0.3);
    // PCB
    rr(-170, -110, 340, 210, 22, '#1d6b5e'); rr(-170, -110, 340, 210, 22, 'rgba(0,0,0,0)');
    ctx.strokeStyle = '#27806f'; ctx.lineWidth = 3; roundRect(ctx, -160, -100, 320, 190, 18); ctx.stroke();
    // castellated pads
    for (let i = 0; i < 7; i++) { circle(-120 + i * 40, -110, 9, '#e0b54a'); circle(-120 + i * 40, 100, 9, '#e0b54a'); }
    // USB-C port (left edge)
    rr(-205, -34, 60, 58, 14, '#c8ccd6'); rr(-196, -20, 40, 30, 10, '#2a2f45');
    // shield can (chip)
    rr(-60, -70, 140, 120, 10, '#c9ced8'); rr(-50, -60, 120, 100, 8, '#b5bccb');
    // mic hole + small parts
    circle(118, 40, 16, '#0d1022'); circle(118, 40, 7, '#2a2f45');
    for (let i = 0; i < 4; i++) rr(100 + (i % 2) * 26, -70 + Math.floor(i / 2) * 26, 16, 10, 2, '#2a2f45');
    // traces
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-145, -60); ctx.lineTo(-90, -60); ctx.lineTo(-70, -40); ctx.moveTo(-145, 60); ctx.lineTo(-90, 60); ctx.lineTo(-70, 40); ctx.stroke();
    // LED
    const blink = (Math.floor(t * 2.5) % 2 === 0) ? 1 : 0.3;
    circle(140, -80, 9, rgba(ACC, blink)); if (blink > 0.5) K.glow(ctx, 140, -80, 50, ACC, 0.7);
    ctx.restore();
    pill(520, 660 - 30, K.popIn(t, tBoard + 0.4), P.board || 'Hobby circuit board', { size: 30, dot: true });
  }

  // 4) price tag
  const pk = K.popIn(t, tPrice, 0.45);
  if (pk > 0) {
    const sw = Math.sin((t - tPrice) * 5) * 0.25 * Math.exp(-(t - tPrice) * 1.4);
    ctx.save(); ctx.translate(720, 830); ctx.rotate(sw); ctx.scale(pk, pk);
    ctx.strokeStyle = '#d9d4cc'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-60, -50); ctx.lineTo(0, 0); ctx.stroke();
    rr(-10, -10, 190, 110, 20, ACC); circle(10, 45, 9, '#222a4b');
    const v = K.countUp(Number(P.price || 14), t, tPrice, 0.7);
    ctx.fillStyle = K.ACCENT.deep; ctx.font = H.font('display', 64); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText((P.prefix || '$') + Math.round(v), 98, 46);
    ctx.restore();
    pill(700, 1010, K.popIn(t, tPrice + 0.4), P.sold || 'Sold online', { size: 28 });
  }
}
