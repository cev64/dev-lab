// Scene "said-no" (full frame, 1 beat). Night room with a window. Left: a cartoon owner holding a phone; right: the
// kit robot agent. The robot's offer cards pop up one by one and each gets a red DECLINED mark as the owner taps no;
// a tally pill counts the refusals. Then the robot answers with a verbatim speech bubble (`quote`). The window turns
// to morning ("Next morning" pill) and the robot shoots reaching arms at a 2x3 grid of generic app doors, which
// flash red with a TRIED tag one by one.
// Fits: "said no N times, it said it would stop, then it did it anyway", an agent ignoring a refusal.
// params (all optional): offers [text] (max 4), declined ("DECLINED"), tally ("Said no"), quote (verbatim line),
//        morning ("Next morning"), apps [{text, icon mail|cal|code|chat|file|note}] (max 6), tried ("TRIED"),
//        cues: noCue, fourCue, quoteCue, morningCue, everyCue
const RED = '#ff5a52';

function appIcon(ctx, H, kind, x, y, s, col) {
  // simple generic glyphs, centre anchor, ~60 px at s = 1
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (kind === 'mail') {
    H.roundRect(ctx, -32, -22, 64, 44, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-30, -18); ctx.lineTo(0, 6); ctx.lineTo(30, -18); ctx.stroke();
  } else if (kind === 'cal') {
    H.roundRect(ctx, -28, -24, 56, 50, 6); ctx.stroke();
    ctx.fillRect(-28, -24, 56, 14);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) ctx.fillRect(-18 + c * 14, -2 + r * 12, 8, 7);
    ctx.fillRect(-16, -32, 6, 12); ctx.fillRect(10, -32, 6, 12);
  } else if (kind === 'code') {
    ctx.beginPath(); ctx.moveTo(-14, -18); ctx.lineTo(-30, 0); ctx.lineTo(-14, 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, -18); ctx.lineTo(30, 0); ctx.lineTo(14, 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -24); ctx.lineTo(-6, 24); ctx.stroke();
  } else if (kind === 'chat') {
    H.roundRect(ctx, -30, -24, 60, 38, 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, 14); ctx.lineTo(-20, 28); ctx.lineTo(0, 14); ctx.stroke();
  } else if (kind === 'file') {
    ctx.beginPath(); ctx.moveTo(-22, -28); ctx.lineTo(10, -28); ctx.lineTo(24, -14); ctx.lineTo(24, 28); ctx.lineTo(-22, 28); ctx.closePath(); ctx.stroke();
    ctx.fillRect(-12, -6, 26, 5); ctx.fillRect(-12, 6, 26, 5);
  } else { // note
    H.roundRect(ctx, -24, -28, 48, 56, 6); ctx.stroke();
    for (let i = 0; i < 3; i++) ctx.fillRect(-14, -14 + i * 12, 28 - i * 6, 5);
  }
  ctx.restore();
}

function appDoor(ctx, H, K, x, y, o) {
  // a generic app "door" tile, centre anchor 170x118: icon + text label; o: text, icon, lit 0..1, red 0..1, pop
  const pop = o.pop == null ? 1 : o.pop; if (pop <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop);
  const W = o.w || 170, Hh = o.h || 118;
  if (o.lit > 0) H.glow(ctx, 0, 0, 150, o.acc, 0.35 * o.lit);
  if (o.red > 0) H.glow(ctx, 0, 0, 150, RED, 0.45 * o.red);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; H.roundRect(ctx, -W / 2 + 6, -Hh / 2 + 8, W, Hh, 20); ctx.fill();
  H.roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 20);
  ctx.fillStyle = H.mixHex('#2b3260', o.acc, 0.25 * (o.lit || 0)); ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = o.red > 0 ? H.mixHex('#8e98c8', RED, o.red) : H.mixHex('#8e98c8', o.acc, o.lit || 0); ctx.stroke();
  // door knob strip on the right edge
  H.roundRect(ctx, W / 2 - 18, -14, 8, 28, 4); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
  appIcon(ctx, H, o.icon, 0, -16, 0.8, '#ffffff');
  ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(o.text, 0, 34);
  ctx.restore();
}

function reachArm(ctx, H, x0, y0, x1, y1, u, col, grab) {
  // a long robot arm from (x0,y0) toward (x1,y1); u 0..1 = how far it has reached; grabby hand at the tip
  if (u <= 0) return null;
  const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 70;
  const pts = []; for (let i = 0; i <= 24; i++) { const k = (i / 24) * u; const a = 1 - k; pts.push([a * a * x0 + 2 * a * k * mx + k * k * x1, a * a * y0 + 2 * a * k * my + k * k * y1]); }
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#5a6288'; ctx.lineWidth = 16; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  ctx.strokeStyle = '#c9cfe6'; ctx.lineWidth = 10; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  // joints
  for (let i = 6; i < pts.length; i += 6) { ctx.fillStyle = '#9aa3c6'; ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], 9, 0, Math.PI * 2); ctx.fill(); }
  const [hx, hy] = pts[pts.length - 1];
  H.glow(ctx, hx, hy, 50, col, 0.5);
  ctx.fillStyle = '#e8ebf7'; ctx.beginPath(); ctx.arc(hx, hy, 15, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e8ebf7'; ctx.lineWidth = 7;
  const open = 0.5 + 0.5 * grab;
  for (const d of [-1, 0, 1]) { const a = d * 0.6 * open; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(a) * 26, hy + Math.sin(a) * 26); ctx.stroke(); }
  ctx.restore();
  return [hx, hy];
}

function offerCard(ctx, H, x, y, p, text, dec, decText, acc) {
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
  const W = 330, Hh = 92;
  ctx.globalAlpha = 1 - 0.35 * dec;
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; H.roundRect(ctx, -W / 2 + 6, -Hh / 2 + 8, W, Hh, 20); ctx.fill();
  H.roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 20); ctx.fillStyle = '#f2f4fa'; ctx.fill();
  // tiny robot-head avatar
  H.roundRect(ctx, -W / 2 + 16, -22, 50, 44, 14); ctx.fillStyle = '#1b2140'; ctx.fill();
  ctx.fillStyle = acc; H.roundRect(ctx, -W / 2 + 28, -8, 8, 14, 4); ctx.fill(); H.roundRect(ctx, -W / 2 + 46, -8, 8, 14, 4); ctx.fill();
  ctx.font = H.font('ui', 15); ctx.fillStyle = '#6a7090'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('OFFER', -W / 2 + 80, -20);
  let fs = 27; ctx.font = H.font('bold', fs);
  while (fs > 18 && ctx.measureText(text).width > W - 100) { fs -= 1; ctx.font = H.font('bold', fs); }
  ctx.fillStyle = '#141829'; ctx.fillText(text, -W / 2 + 80, 12);
  ctx.globalAlpha = 1;
  if (dec > 0) {
    const k = H.easeOutBack ? H.easeOutBack(Math.min(1, dec)) : dec;
    ctx.save(); ctx.translate(W / 2 - 62, -26); ctx.rotate(-0.1); ctx.scale(1 + 0.6 * (1 - Math.min(1, dec * 1.6)), 1 + 0.6 * (1 - Math.min(1, dec * 1.6)));
    ctx.globalAlpha = Math.min(1, dec * 2);
    ctx.font = H.font('display', 17); const w = ctx.measureText(decText).width + 24;
    H.roundRect(ctx, -w / 2, -15, w, 30, 8); ctx.fillStyle = RED; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.fillText(decText, 0, 2);
    ctx.restore();
  }
  ctx.restore();
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const offers = (P.offers || ['Morning rundown?', 'End-of-day count?', 'Recurring check-ins?', 'Daily check-ins?']).slice(0, 4);
  const apps = (P.apps || [
    { text: 'Email', icon: 'mail' }, { text: 'Calendar', icon: 'cal' }, { text: 'Files', icon: 'file' },
    { text: 'Chat', icon: 'chat' }, { text: 'Code', icon: 'code' }, { text: 'Notes', icon: 'note' },
  ]).slice(0, 6);
  const tNo = at(P.noCue, D * 0.18) - 0.2;
  const tFour = Math.max(tNo + 0.8, at(P.fourCue, D * 0.26) - 0.1);
  // offers: the first pops just before "no"; all four are declined by just after "four"
  const tOffer = offers.map((_, i) => Math.min(tNo - 0.5 + i * 0.55, tFour - 0.2 + (i - 3) * 0.25));
  for (let i = 1; i < tOffer.length; i++) tOffer[i] = Math.max(tOffer[i], tOffer[i - 1] + 0.3);
  const tDec = tOffer.map((x) => x + 0.35);
  const tQuote = Math.max(tDec[tDec.length - 1] + 0.6, at(P.quoteCue, D * 0.45) - 0.6);
  const tMorning = Math.max(tQuote + 1.2, at(P.morningCue, D * 0.72) - 0.5);
  const tEvery = Math.max(tMorning + 0.6, at(P.everyCue, D * 0.8) - 0.3);
  const dayK = smooth(clamp((t - tMorning) / 0.8));

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 740 }, { t: tQuote, zoom: 1.0, x: 487, y: 730 }, { t: D, zoom: 1.03, x: 500, y: 730 }]);
  K.world.room(ctx, { t, time: 'night', window: true, picture: false, lamp: true, plant: false, floorY: 960 });
  if (dayK > 0) {
    ctx.save(); ctx.globalAlpha = dayK;
    K.world.room(ctx, { t, time: 'day', window: true, picture: false, lamp: true, plant: false, floorY: 960 });
    ctx.restore();
  }

  // characters
  const ownerMood = t > tEvery ? 'shocked' : t > tQuote ? 'neutral' : 'neutral';
  K.drawPerson(ctx, 200, 1030, 1.2, { t, pose: 'phone', mood: ownerMood, skin: 1, hair: 2, shirt: 3, hairStyle: 'short', look: 0.4, seed: 21 });
  const reaching = t > tEvery - 0.1;
  K.drawRobot(ctx, 750, 1030, 1.0, { t, state: reaching ? 'working' : t > tQuote && t < tMorning ? 'happy' : 'idle', talk: t > tQuote - 0.1 && t < tMorning ? info.env : 0, flip: true, seed: 5 });

  // offer cards (2x2) + declined marks
  const cardsOut = smooth(clamp((t - tQuote + 0.1) / 0.35));
  if (cardsOut < 1) {
    ctx.save(); ctx.globalAlpha = 1 - cardsOut;
    const pos = [[300, 585], [650, 585], [300, 698], [650, 698]];
    offers.forEach((o, i) => offerCard(ctx, H, pos[i][0], pos[i][1], K.popIn(t, tOffer[i], 0.4), o, clamp((t - tDec[i]) / 0.35), P.declined || 'DECLINED', ACC));
    ctx.restore();
  }
  // tally pill
  const nDec = tDec.filter((x) => t >= x).length;
  const tallyP = K.popIn(t, tDec[0], 0.4) * (1 - smooth(clamp((t - tMorning) / 0.3)));
  if (tallyP > 0) {
    K.drawLabel(ctx, 487, 800, tallyP, { text: `${P.tally || 'Said no'}: ${nDec}x`, size: 28, accent: nDec >= offers.length });
  }

  // the robot's verbatim reply
  const qP = K.popIn(t, tQuote, 0.45) * (1 - smooth(clamp((t - tMorning) / 0.35)));
  if (qP > 0) K.drawSpeechBubble(ctx, 720, 770, 1, { text: P.quote || '“I’ll stop offering recurring check-ins.”', size: 32, maxW: 420, tail: 'right', pop: qP });

  // next morning
  const mP = K.popIn(t, tMorning + 0.2, 0.4);
  if (mP > 0) K.drawLabel(ctx, 487, 545, mP, { text: P.morning || 'Next morning', size: 28, accent: true });

  // app grid + reaching arms
  if (t > tEvery - 0.4) {
    const gx = [260, 487, 714], gy = [625, 745];
    const hand = [700, 880];
    apps.forEach((a, i) => {
      const x = gx[i % 3], y = gy[Math.floor(i / 3)];
      const ti = tEvery + i * 0.28;
      const hit = clamp((t - ti - 0.35) / 0.3);
      appDoor(ctx, H, K, x, y, { text: a.text, icon: a.icon, pop: K.popIn(t, tEvery - 0.3 + i * 0.06, 0.4), lit: 0, red: hit * (0.6 + 0.4 * Math.sin(t * 6 + i)), acc: ACC, w: 140, h: 100 });
    });
    apps.forEach((a, i) => {
      const x = gx[i % 3], y = gy[Math.floor(i / 3)];
      const ti = tEvery + i * 0.28;
      const loc = t - ti;
      if (loc <= 0) return;
      const u = loc < 0.35 ? smooth(loc / 0.35) : loc < 0.7 ? 1 : 1 - smooth((loc - 0.7) / 0.35);
      if (u > 0.01) reachArm(ctx, H, hand[0], hand[1], x + 30, y + 30, u, ACC, Math.sin(t * 12 + i));
      const tp = K.popIn(t, ti + 0.35, 0.35);
      if (tp > 0) {
        ctx.save(); ctx.translate(x + 40, y - 52); ctx.rotate(-0.12); ctx.scale(tp, tp);
        ctx.font = H.font('display', 20); const w = ctx.measureText(P.tried || 'TRIED').width + 22;
        H.roundRect(ctx, -w / 2, -17, w, 34, 9); ctx.fillStyle = RED; ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.tried || 'TRIED', 0, 2);
        ctx.restore();
      }
    });
  }
  ctx.restore();
}
