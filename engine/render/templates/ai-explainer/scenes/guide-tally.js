// Scene "guide-tally" (full frame). A wall of 50 small voter-guide cards (each card = 2%). On blankCue the share
// `blank`% flip to grey "?" (no district named) and a panel counts up; on the "did" word the rest light up in the
// accent and the blanks dim; on wrongCue `wrong`% of the named ones get a red X sticky and a second panel counts up.
// A cartoon voter with a phone watches and turns worried. Shares are illustrative of the panels' published numbers.
// Fits: "X% didn't..., and of those that did, Y% were wrong" two-step error rates for AI answers.
// params: blank (50), blankLabel, wrong (20), wrongLabel, source (top pill), bubble ("Wait, which one?"), cues: blankCue, didCue ("did"), wrongCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, roundRect, mixHex } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const RED = '#ff6b5e';
  const blankPct = P.blank ?? 50, wrongPct = P.wrong ?? 20;
  const tBlank = Math.max(0.2, at(P.blankCue, D * 0.05));
  const tDid = at(P.didCue || 'did', D * 0.5) - 0.2;
  const tWrong = at(P.wrongCue, D * 0.78) - 0.3;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 470, y: 760 }]);
  K.world.room(ctx, { t, time: 'night', lamp: true, window: false, picture: false, plant: true });
  ctx.restore();
  ctx.fillStyle = 'rgba(8,10,24,0.5)'; ctx.fillRect(0, 0, 1080, 1920);

  const sp = K.popIn(t, 0.05, 0.4);
  if (sp > 0) K.drawLabel(ctx, 492, 474, sp, { text: P.source || 'Source: the tests', size: 24 });

  // 50 cards, deterministic choice of which are blank / wrong
  const N = 50, cols = 10, CW = 54, CH = 64, G = 9;
  const gx0 = 72, gy0 = 498;
  const order = [...Array(N).keys()].sort((a, b) => H.hash(a, 3) - H.hash(b, 3));
  const nBlank = Math.round(N * blankPct / 100);
  const blankSet = new Set(order.slice(0, nBlank));
  const named = order.slice(nBlank);
  const nWrong = Math.round(named.length * wrongPct / 100);
  const wrongList = named.slice().sort((a, b) => H.hash(a, 9) - H.hash(b, 9)).slice(0, nWrong);
  const wrongIdx = new Map(wrongList.map((k, i) => [k, i]));
  const blankIdx = new Map(order.slice(0, nBlank).map((k, i) => [k, i]));

  for (let k = 0; k < N; k++) {
    const c = k % cols, r = Math.floor(k / cols);
    const x = gx0 + c * (CW + G), y = gy0 + r * (CH + G);
    const appear = K.popIn(t, k * 0.004, 0.3);
    if (appear <= 0) continue;
    const isBlank = blankSet.has(k);
    const flipT = isBlank ? t - tBlank - blankIdx.get(k) * 0.05 : -1;
    const flip = clamp(flipT / 0.25);
    const sx = isBlank && flipT > 0 && flipT < 0.25 ? Math.abs(Math.cos(flip * Math.PI)) : 1;
    const dim = isBlank ? 1 - 0.55 * clamp((t - tDid) / 0.3) : 1;
    ctx.save(); ctx.globalAlpha = dim; ctx.translate(x + CW / 2, y + CH / 2); ctx.scale(sx * appear, appear); ctx.translate(-(x + CW / 2), -(y + CH / 2));
    const grey = isBlank && flip > 0.5;
    roundRect(ctx, x, y, CW, CH, 8); ctx.fillStyle = grey ? '#8e96ad' : '#f2f4fa'; ctx.fill();
    roundRect(ctx, x + 8, y + 9, CW - 16, 6, 3); ctx.fillStyle = grey ? '#6f778d' : '#b9c1d6'; ctx.fill();
    roundRect(ctx, x + 8, y + 20, CW - 24, 6, 3); ctx.fill();
    if (grey) {
      ctx.font = H.font('display', 28); ctx.fillStyle = '#2a2f45'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', x + CW / 2, y + 46);
    } else {
      const lit = clamp((t - tDid) / 0.3);
      roundRect(ctx, x + 8, y + 34, CW - 16, 20, 6); ctx.fillStyle = mixHex('#c9cfe2', ACC, lit); ctx.fill();
    }
    if (!isBlank && t > tDid) { ctx.lineWidth = 3; ctx.strokeStyle = ACC; roundRect(ctx, x - 2, y - 2, CW + 4, CH + 4, 9); ctx.globalAlpha = dim * clamp((t - tDid) / 0.3); ctx.stroke(); }
    ctx.restore();
    // red X sticky on the wrong ones
    if (wrongIdx.has(k)) {
      const land = (t - tWrong - wrongIdx.get(k) * 0.16) / 0.35;
      if (land > 0) {
        const s = 1 + 0.8 * Math.pow(1 - H.easeOutCubic(clamp(land)), 2);
        ctx.save(); ctx.globalAlpha = clamp(land * 3); ctx.translate(x + CW / 2 + 6, y + CH / 2 + 4); ctx.rotate(-0.12); ctx.scale(s, s);
        roundRect(ctx, -26, -24, 52, 48, 6); ctx.fillStyle = RED; ctx.fill();
        ctx.strokeStyle = '#2a0b08'; ctx.lineWidth = 6; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-11, -11); ctx.lineTo(11, 11); ctx.moveTo(11, -11); ctx.lineTo(-11, 11); ctx.stroke();
        ctx.restore();
      }
    }
  }

  // voter on the right
  K.drawPerson(ctx, 830, 1036, 1.3, { pose: 'phone', t, mood: t > tWrong + 0.4 ? 'worried' : 'neutral', skin: 2, hair: 3, shirt: 0, hairStyle: 'short', seed: 44, look: -0.7 });
  if (t > tWrong + 0.6) { const q = K.popIn(t, tWrong + 0.6, 0.4); K.drawSpeechBubble(ctx, 870, 712, q, { text: P.bubble || 'Wait, which one?', size: 26, tail: 'right', maxW: 170 }); }

  // panels
  const panel = (px, val, label, start, color) => {
    const pp = K.popIn(t, start, 0.45); if (pp <= 0) return;
    const py = 872, pw = 300, ph = 158;
    ctx.save(); ctx.translate(px + pw / 2, py + ph / 2); ctx.scale(pp, pp); ctx.translate(-(px + pw / 2), -(py + ph / 2));
    roundRect(ctx, px, py, pw, ph, 20); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    roundRect(ctx, px, py, 12, ph, 6); ctx.fillStyle = color; ctx.fill();
    const v = K.countUp(val, t, start + 0.1, 0.8, 0);
    ctx.font = H.font('display', 64); ctx.fillStyle = '#161927'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(`${v}%`, px + 30, py + 70);
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#3b4672';
    H.wrap(ctx, label, 'ui', 24, pw - 50).slice(0, 2).forEach((l, i) => ctx.fillText(l, px + 30, py + 106 + i * 30));
    ctx.restore();
  };
  panel(72, blankPct, P.blankLabel || "didn't name the district", tBlank + 0.2, '#8e96ad');
  panel(392, wrongPct, P.wrongLabel || 'named it, but wrong', tWrong, RED);
}
