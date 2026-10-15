// Scene "court-asks" (full frame, 1 beat). Generic courtroom (kit world). A cartoon lawyer (left) presents; a header
// pill ("The states ask for") pops, then up to three request tiles land in a row over the bench on their cue words
// (spinning coins / a stack of bills / a chat window being re-wired with a wrench). Later a short timeline draws
// across the bench front: an earlier filing dot ("June: Florida sues alone") then the new one ("Oct.: 8 more states");
// the robot (right, stand-in for the chatbot, text label) looks on.
// Fits: what plaintiffs / regulators ask a court for, plus "this isn't the first case" context.
// params: head ("The states ask for"), tiles [{text, icon coins|bills|wrench, cue}] (max 3),
//         early ({when: "June", text: "Florida sues alone"}), late ({when: "Oct.", text: "8 more states"}),
//         botLabel ("ChatGPT"), headCue ("want"), earlyCue ("florida"), lateCue (null: 1.4 s after early)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, rgba } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const tiles = (P.tiles || [
    { text: 'Financial penalties', icon: 'coins', cue: 'penalties' },
    { text: 'Compensation for consumers', icon: 'bills', cue: 'compensation' },
    { text: 'Changes to how ChatGPT works', icon: 'wrench', cue: 'changes' },
  ]).slice(0, 3);
  const tHead = at(P.headCue || 'want', 0.4) - 0.3;
  const tT = tiles.map((x, i) => at(x.cue, 1.4 + i * 1.8) - 0.25);
  const tEarly = at(P.earlyCue || 'florida', D * 0.7) - 0.2;
  const tLate = P.lateCue ? at(P.lateCue, tEarly + 1.4) - 0.2 : tEarly + 1.4;
  const early = P.early || { when: 'June', text: 'Florida sues alone' };
  const late = P.late || { when: 'Oct.', text: '8 more states' };

  K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 487, y: 700 }, { t: tEarly - 0.4, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 760 }]);
  const room = K.world.courtroom(ctx, { t });
  K.drawGavel(ctx, 820, room.bench.y + 4, 0.8, { hit: 1, shadow: false });

  // characters at the sides (clear of the timeline)
  const presenting = t > tHead && t < tT[tT.length - 1] + 1.4;
  K.drawPerson(ctx, 140, 1040, 1.3, { t, pose: presenting ? 'point' : 'stand', skin: 0, hair: 1, shirt: '#3b4580', hairStyle: 'bun', mood: 'neutral', seed: 6, look: 0.6, talk: 0 });
  const dk = K.popIn(t, 0.2, 0.4);
  if (dk > 0) { ctx.save(); ctx.translate(205, 905); ctx.rotate(-0.12); ctx.scale(0.42 * dk, 0.42 * dk); K.drawDocument(ctx, 0, 0, 1, { lines: 5, title: 'COMPLAINT' }); ctx.restore(); }
  drawBot(ctx, 905, 1040, 1.0, { t, state: 'thinking', flip: true });
  const bl = K.popIn(t, 0.5, 0.4);
  if (bl > 0) K.drawLabel(ctx, 880, 770, Math.min(1.05, bl), { text: P.botLabel || 'ChatGPT', size: 26, dot: true });

  // header + tiles
  const hk = K.popIn(t, tHead, 0.45);
  if (hk > 0) K.drawLabel(ctx, 487, 470, Math.min(1.05, hk), { text: P.head || 'The states ask for', size: 32, accent: true });
  const TW = 262, TH = 236, xs = [205, 487, 769], ty = 598;
  tiles.forEach((tile, i) => {
    const k = K.popIn(t, tT[i], 0.45);
    if (k <= 0) return;
    const drop = (1 - smooth((t - tT[i]) / 0.4)) * -120;
    ctx.save(); ctx.translate(xs[i], ty + drop); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
    roundRect(ctx, -TW / 2, -TH / 2, TW, TH, 26); ctx.fillStyle = 'rgba(10,12,26,0.94)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.75); roundRect(ctx, -TW / 2, -TH / 2, TW, TH, 26); ctx.stroke();
    const age = t - tT[i];
    // icon area (centre y ~ -40)
    if (tile.icon === 'coins') {
      for (let c = 0; c < 3; c++) K.drawCoin(ctx, -52 + c * 52, -6 - (c === 1 ? 14 : 0), 0.95, { spin: age * 3 + c * 0.9, shadow: false });
    } else if (tile.icon === 'bills') {
      K.drawBills(ctx, 0, -6, 1.0, { count: 1 + Math.min(3, Math.floor(age * 4)), shadow: false });
    } else {
      // chat window with a wrench turning a bolt
      roundRect(ctx, -70, -100, 140, 92, 14); ctx.fillStyle = '#2a2f48'; ctx.fill();
      roundRect(ctx, -58, -86, 70, 16, 8); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fill();
      roundRect(ctx, -12, -62, 70, 16, 8); ctx.fillStyle = rgba(ACC, 0.9); ctx.fill();
      roundRect(ctx, -58, -38, 54, 16, 8); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fill();
      ctx.save(); ctx.translate(74, -92); ctx.rotate(0.5 + 0.3 * Math.sin(age * 5)); ctx.scale(0.8, 0.8); wrench(ctx, ACC); ctx.restore();
    }
    // text (2 lines max)
    let size = 30, lines;
    for (; size >= 24; size -= 2) { lines = H.wrap(ctx, tile.text, 'bold', size, TW - 36); if (lines.length <= 2) break; }
    ctx.font = H.font('bold', size); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lh = size * 1.18, y0 = 58 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, j) => ctx.fillText(ln, 0, y0 + j * lh));
    ctx.restore();
  });

  // timeline across the bench front
  const lk = H.phase(t, tEarly - 0.3, tEarly + 0.3);
  if (lk > 0) {
    const x0 = 330, x1 = 680, y = 905;
    ctx.save();
    roundRect(ctx, x0 - 70, y - 120, x1 - x0 + 140, 190, 24); ctx.fillStyle = `rgba(8,9,20,${0.85 * lk})`; ctx.fill();
    ctx.strokeStyle = rgba('#ffffff', 0.5); ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(lerp(x0, x1, lk), y); ctx.stroke();
    const dot = (x, k, when, text, hot) => {
      if (k <= 0) return;
      ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.1, k), Math.min(1.1, k));
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fillStyle = hot ? ACC : '#c9d2f5'; ctx.fill();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = H.font('display', 34); ctx.fillStyle = hot ? ACC : '#ffffff'; ctx.fillText(String(when).toUpperCase(), 0, -62);
      const f = H.fitText(ctx, text, 'ui', 28, 22, 250); ctx.font = f.font; ctx.fillStyle = '#ffffff'; ctx.fillText(f.text, 0, 46);
      ctx.restore();
    };
    dot(x0, K.popIn(t, tEarly, 0.4), early.when, early.text, false);
    dot(x1, K.popIn(t, tLate, 0.4), late.when, late.text, true);
    ctx.restore();
  }
}

function wrench(ctx, color) {
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-7, 0, 14, 62, 7) : ctx.rect(-7, 0, 14, 62); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#0a0c1a'; ctx.fillRect(-7, -22, 14, 18);
}

// Generic "chatbot" stand-in (NOT the channel mascot): boxy teal-grey body, square head, round white eyes with dark
// pupils, cyan antenna bulb, speaker-grille mouth. Anchored bottom-centre, ~130x230 at scale 1. opts: t, state idle|thinking, flip
function drawBot(ctx, x, y, s, o = {}) {
  const t = o.t || 0, think = o.state === 'thinking';
  const body = '#4f7f86', bodyS = '#3c6369', head = '#8fa9ad', headS = '#728e93', dark = '#1d2433', cyan = '#5fd6f0';
  const rr = (x0, y0, w, h, r, f) => { ctx.beginPath(); ctx.roundRect(x0, y0, w, h, r); ctx.fillStyle = f; ctx.fill(); };
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  const hover = Math.sin(t * 2) * 1.5;
  ctx.save(); ctx.scale(1, 0.22); ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill(); ctx.restore();
  // legs + feet
  rr(-34, -52, 20, 44, 6, bodyS); rr(14, -52, 20, 44, 6, bodyS);
  rr(-44, -14, 38, 14, 5, dark); rr(6, -14, 38, 14, 5, dark);
  ctx.translate(0, hover);
  // arms
  rr(-74, -140, 20, 70, 8, bodyS);
  if (think) { ctx.save(); ctx.translate(64, -136); ctx.rotate(-2.4); rr(-10, 0, 20, 64, 8, bodyS); ctx.restore(); }
  else rr(54, -140, 20, 70, 8, bodyS);
  // body box with a panel
  rr(-56, -150, 112, 102, 12, body);
  rr(-36, -128, 72, 40, 6, bodyS);
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-18 + i * 18, -108, 6, 0, Math.PI * 2); ctx.fillStyle = (Math.floor(t * 3) + i) % 3 === 0 ? cyan : '#2a3a44'; ctx.fill(); }
  // neck + square head
  rr(-14, -164, 28, 18, 4, dark);
  rr(-62, -236, 124, 76, 10, head); rr(-62, -186, 124, 26, 10, headS);
  // round eyes (blink)
  const blink = (t % 3.7) > 3.55 ? 0.15 : 1;
  for (const ex of [-28, 28]) {
    ctx.save(); ctx.translate(ex, -206); ctx.scale(1, blink);
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = cyan; ctx.stroke();
    ctx.beginPath(); ctx.arc(think ? 4 : 0, think ? -4 : 2, 6, 0, Math.PI * 2); ctx.fillStyle = dark; ctx.fill();
    ctx.restore();
  }
  // grille mouth
  rr(-22, -178, 44, 10, 4, dark);
  // antenna
  rr(-3, -262, 6, 28, 3, dark);
  ctx.beginPath(); ctx.arc(0, -266, 9, 0, Math.PI * 2); ctx.fillStyle = cyan; ctx.fill();
  ctx.restore();
}
