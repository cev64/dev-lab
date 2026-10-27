// Scene "ipo-filing" (full frame, best as a 2-beat span). Dusk street: a company tower with a text name pill; the
// kit robot (the company stand-in) carries a thick filing binder to a regulator's counter window, where a cartoon
// clerk takes it in; a FILED stamp lands and a date pill pops. Then a stock-exchange ticker board drops in above the
// street: the exchange name pill pops, the ticker letters flip in one by one, and (optional) a tiny cartoon ant
// strolls along the board's top edge (`ant: true`, e.g. for a ticker that spells ANT). Ends settled (board lights chase, robot happy).
// Fits: a company filing to go public (IPO / listing), any "paperwork lands at a regulator, then a listing" story.
// params: company ("Company"), doc ("S-1"), office ("Regulator"), stamp ("FILED"), date ("Date"), exchange
//         ("EXCHANGE"), ticker ("ABC"), sub ("ticker"), ant (false; true = a tiny ant on the board), cues: fileCue (filed, 2nd), stampCue,
//         dateCue, boardCue, exchangeCue, tickerCue, antCue (all optional; else fractions of the scene)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, rgba, roundRect, mixHex } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const tFile = Math.max(3.2, at(P.fileCue, D * 0.33));
  const tStamp = Math.max(tFile + 0.7, at(P.stampCue, tFile + 0.8));
  const tDate = at(P.dateCue, tStamp + 0.6);
  const tBoard = at(P.boardCue, D * 0.6) - 0.3;
  const tEx = at(P.exchangeCue, D * 0.72) - 0.1;
  const tTick = at(P.tickerCue, D * 0.84) - 0.15;
  const tAnt = at(P.antCue, D * 0.92) - 0.4;
  const FEET = 1020;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 487, y: 860 }, { t: tFile, zoom: 1.04, x: 520, y: 820 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 990 });

  // --- company tower (left) with a text name pill, no logo
  const TX = 200;
  K.drawBuilding(ctx, TX, FEET, 0.95, { t, color: '#55609a', floors: 6, lit: 0.6 });
  K.drawLabel(ctx, TX, 640, 1, { text: P.company || 'Company', size: 28, dot: true });

  // --- regulator's office (right): low stone building, counter window, clerk behind
  const OX = 790, OW = 330, OH = 300, oy = FEET - OH;
  K.shadow(ctx, OX, FEET, 380);
  roundRect(ctx, OX - OW / 2, oy, OW, OH, 10); ctx.fillStyle = '#8a8fa8'; ctx.fill();
  ctx.fillStyle = '#767b94'; ctx.fillRect(OX + OW / 2 - 60, oy + 6, 54, OH - 6);
  // pediment
  ctx.beginPath(); ctx.moveTo(OX - OW / 2 - 20, oy + 4); ctx.lineTo(OX, oy - 70); ctx.lineTo(OX + OW / 2 + 20, oy + 4); ctx.closePath();
  ctx.fillStyle = '#a3a8c0'; ctx.fill();
  for (const c of [-120, 120]) { ctx.fillStyle = '#9da2ba'; ctx.fillRect(OX + c - 14, oy + 20, 28, OH - 20); }
  K.drawLabel(ctx, OX, oy - 78, 1, { text: P.office || 'Regulator', size: 26, dot: true });
  // window opening
  const WX = OX - 10, WY = oy + 70, WW = 170, WH = 130;
  roundRect(ctx, WX - WW / 2, WY, WW, WH, 10); ctx.fillStyle = '#2b2f47'; ctx.fill();
  ctx.save(); roundRect(ctx, WX - WW / 2, WY, WW, WH, 10); ctx.clip();
  K.glow(ctx, WX, WY + 40, 120, '#ffe7a8', 0.25);
  const took = K.phase(t, tFile + 0.5, tFile + 1.0);
  K.drawPerson(ctx, WX, WY + WH + 120, 0.82, { t, pose: took > 0.5 && t < tStamp + 0.8 ? 'point' : 'stand', mood: 'neutral', skin: 2, hair: 3, shirt: '#8a93a8', hairStyle: 'short', seed: 7, look: -0.6 });
  ctx.restore();
  // counter ledge
  roundRect(ctx, WX - WW / 2 - 16, WY + WH - 6, WW + 32, 18, 6); ctx.fillStyle = '#c2c6d8'; ctx.fill();
  // door
  roundRect(ctx, OX + 90, FEET - 120, 60, 120, 6); ctx.fillStyle = '#4b4f66'; ctx.fill();

  // --- robot walks from the tower to the counter carrying the binder
  const walkU = K.phase(t, 0.2, tFile - 0.2, H.easeInOutCubic);
  const RX = lerp(330, 525, walkU);
  const walking = walkU > 0 && walkU < 1;
  const rBob = walking ? Math.abs(Math.sin(t * 9)) * -8 : 0;
  K.drawRobot(ctx, RX, FEET + rBob, 1.0, { t, state: t > tStamp ? 'happy' : 'working', seed: 2 });

  // --- the binder: rides with the robot, slides into the window at tFile, sits on the counter
  const slide = K.phase(t, tFile, tFile + 0.7, H.easeInOutCubic);
  const bx0 = RX + 62, by0 = FEET - 70 + rBob, bx1 = WX + 20, by1 = WY + WH - 4;
  const bx = lerp(bx0, bx1, slide), by = lerp(by0, by1, slide) - Math.sin(slide * Math.PI) * 60;
  drawBinder(ctx, bx, by, 0.9, P.doc || 'S-1', ACC, H);
  // stamp on the binder
  if (t > tStamp) K.drawStamp(ctx, bx + 4, by - 10, 0.55, { kind: 'check', text: P.stamp || 'FILED', land: (t - tStamp) / 0.5 });
  const dk = K.popIn(t, tDate, 0.4);
  if (dk > 0) K.drawLabel(ctx, 640, 700, Math.min(1.05, dk), { text: P.date || 'Date', size: 28, accent: true });

  // --- ticker board drops in over the street
  const drop = K.phase(t, tBoard, tBoard + 0.8, H.easeOutBack || H.easeOutCubic);
  if (drop > 0) {
    const BW = 760, BH = 190, bxC = 487, byT = lerp(200, 450, drop);
    ctx.save();
    // cables
    ctx.strokeStyle = rgba('#ffffff', 0.35); ctx.lineWidth = 4;
    for (const c of [-300, 300]) { ctx.beginPath(); ctx.moveTo(bxC + c, 380); ctx.lineTo(bxC + c, byT); ctx.stroke(); }
    roundRect(ctx, bxC - BW / 2, byT, BW, BH, 18); ctx.fillStyle = '#10142a'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#3a4268'; ctx.stroke();
    // chasing bulbs along the bottom edge
    for (let i = 0; i < 24; i++) {
      const x = bxC - BW / 2 + 24 + i * ((BW - 48) / 23), on = ((i + Math.floor(t * 6)) % 4) === 0;
      ctx.beginPath(); ctx.arc(x, byT + BH - 16, 5, 0, Math.PI * 2); ctx.fillStyle = on ? ACC : rgba('#ffffff', 0.18); ctx.fill();
    }
    // exchange name pill (top-left inside the board)
    const ek = K.popIn(t, tEx, 0.4);
    if (ek > 0) K.drawLabel(ctx, bxC - 190, byT + 68, Math.min(1.05, ek), { text: P.exchange || 'EXCHANGE', size: 30, dot: true });
    // ticker letters flip in
    const tick = String(P.ticker || 'ABC');
    const LW = 92, lx0 = bxC + 70 - ((tick.length - 1) * LW) / 2;
    for (let i = 0; i < tick.length; i++) {
      const f = K.phase(t, tTick + i * 0.14, tTick + i * 0.14 + 0.35);
      const x = lx0 + i * LW, y = byT + 22;
      roundRect(ctx, x - 40, y, 80, 112, 10); ctx.fillStyle = '#1d2340'; ctx.fill();
      ctx.fillStyle = rgba('#000000', 0.4); ctx.fillRect(x - 40, y + 55, 80, 3);
      if (f > 0) {
        ctx.save(); ctx.translate(x, y + 56); ctx.scale(1, Math.max(0.05, f));
        ctx.font = H.font('display', 84); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ACC;
        ctx.fillText(tick[i], 0, 4); ctx.restore();
      }
    }
    if (t > tTick + 0.6) K.glow(ctx, lx0 + LW, byT + 80, 200, ACC, 0.12 + 0.04 * Math.sin(t * 3));
    const sk = K.popIn(t, tTick + 0.5, 0.4);
    if (sk > 0) {
      ctx.save(); ctx.globalAlpha = clamp(sk); ctx.font = H.font('ui', 24); ctx.textAlign = 'center'; ctx.fillStyle = rgba('#ffffff', 0.75);
      ctx.fillText(P.sub || 'ticker', bxC - 190, byT + 128); ctx.restore();
    }
    // a tiny cartoon ant strolls along the top edge
    if (P.ant === true && t > tAnt) {
      const u = clamp((t - tAnt) / 1.5);
      const ax = lerp(bxC - BW / 2 + 30, bxC + BW / 2 - 60, H.easeInOutCubic(u)), ay = byT - 2;
      drawAnt(ctx, ax, ay, 1.4, t, u < 1, ACC);
    }
    ctx.restore();
  }
  ctx.restore();
}

// Thick binder (bottom-centre anchor), ~150x120 at s=1, with a label on the spine/cover
function drawBinder(ctx, x, y, s, text, ACC, H) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // paper block
  for (let i = 0; i < 6; i++) { H.roundRect(ctx, -70, -26 - i * 14, 140, 16, 3); ctx.fillStyle = i % 2 ? '#e6e9f3' : '#f6f7fb'; ctx.fill(); }
  // cover
  H.roundRect(ctx, -76, -120, 152, 26, 6); ctx.fillStyle = '#3b4672'; ctx.fill();
  H.roundRect(ctx, -76, -12, 152, 14, 5); ctx.fillStyle = '#2d365c'; ctx.fill();
  // label
  H.roundRect(ctx, -46, -150, 92, 40, 10); ctx.fillStyle = ACC; ctx.fill();
  ctx.font = H.font('display', 26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#10142a';
  ctx.fillText(text, 0, -129);
  ctx.restore();
}

// Tiny friendly cartoon ant walking right (anchor = feet)
function drawAnt(ctx, x, y, s, t, walking, ACC) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const step = walking ? Math.sin(t * 18) : 0;
  ctx.strokeStyle = '#1a1a22'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const lx = -14 + i * 12, sw = (i % 2 ? 1 : -1) * step * 4;
    ctx.beginPath(); ctx.moveTo(lx, -10); ctx.lineTo(lx + sw - 4, 0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(lx, -10); ctx.lineTo(lx - sw + 4, 0); ctx.stroke();
  }
  ctx.fillStyle = '#2a2633';
  ctx.beginPath(); ctx.ellipse(-20, -13, 10, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-3, -13, 6, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(12, -15, 7, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(14, -16, 2.2, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
  ctx.strokeStyle = '#2a2633'; ctx.lineWidth = 1.8;
  ctx.beginPath(); ctx.moveTo(14, -21); ctx.quadraticCurveTo(18, -32, 24, -30); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -21); ctx.quadraticCurveTo(10, -33, 16, -34); ctx.stroke();
  ctx.restore();
}
