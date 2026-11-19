// Scene "score-split" (full frame, 1 beat; a caveat beat). A night room with two big scorecards on stands: two
// parties rate the same thing differently (text names only, no logos). Each card has a gauge that sweeps to its
// score and a big number. The kit robot stands to the left, looking from card to card, then shrugs ("thinking").
// Then caveat pills land under the right card ("hard to pull off", an extra pill), and a shield with a tick +
// "no confirmed ..." pill lands last. Ends settled.
// params: left, leftScore, right, rightScore, of ("out of 10"), max (10), hard, chips, none,
//         cues (narration words, "word#n", or numbers = scene seconds): rightCue, leftCue, hardCue, noneCue
// Fits: disputed severity ratings, two estimates of one number, "the company says X, the researchers say Y" caveats.
const RED = '#ff5a52', ORANGE = '#ffa64d';

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, roundRect, rgba } = H;
  const at = (w, d) => {
    if (typeof w === 'number') return w;
    if (!w) return d;
    const [wd, n] = String(w).split('#');
    const v = info.timeOf(wd, n ? parseInt(n, 10) : 0);
    return v == null ? d : v;
  };
  const tR = at(P.rightCue, D * 0.15) - 0.2, tL = at(P.leftCue, D * 0.3) - 0.2;
  const tHard = at(P.hardCue, D * 0.5) - 0.2, tNone = at(P.noneCue, D * 0.8) - 0.4;
  const max = +P.max || 10;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.02, x: 487, y: 725 }]);
  K.world.room(ctx, { t, time: 'night', window: true, picture: false, lamp: true, plant: true });

  // left card is up from frame 0 (it was the score shown in the previous beat); the right one pops on its cue
  scoreCard(ctx, H, K, t, 300, 470, String(P.left || 'Side A'), String(P.leftScore || '9.2'), P.of, max, RED, -1, tL, ACC);
  const rk = K.popIn(t, tR, 0.5);
  if (rk > 0) {
    ctx.save(); ctx.translate(680, 640); ctx.scale(Math.min(1.04, rk), Math.min(1.04, rk)); ctx.translate(-680, -640);
    scoreCard(ctx, H, K, t, 680, 470, String(P.right || 'Side B'), String(P.rightScore || '8.1'), P.of, max, ORANGE, tR, -1, ACC);
    ctx.restore();
  }
  // "vs" chip between the cards
  const vk = K.popIn(t, tR + 0.4, 0.4);
  if (vk > 0) {
    ctx.save(); ctx.translate(490, 640); ctx.scale(Math.min(1.05, vk), Math.min(1.05, vk));
    ctx.beginPath(); ctx.arc(0, 0, 38, 0, Math.PI * 2); ctx.fillStyle = '#141829'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.stroke();
    ctx.font = H.font('display', 30); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('VS', 0, 2);
    ctx.restore();
  }

  // robot on the left, looking between the cards; thinking after the second card
  const look = t < tR ? 0 : Math.sin((t - tR) * 1.6);
  K.drawRobot(ctx, 205, 1036, 0.9, { t, state: t > tHard ? 'thinking' : 'idle', flip: look < 0, seed: 5, talk: 0 });

  // caveat pills (right column)
  const pill = (tt, x, y, text, o) => { const k = K.popIn(t, tt, 0.45); if (k > 0) K.drawLabel(ctx, x, y + K.bob(t, 3, 1.2, y), Math.min(1.05, k), { text, ...o }); };
  pill(tHard, 620, 862, String(P.hard || 'Hard to pull off'), { size: 30, dot: true });
  if (P.chips) pill(tHard + 0.8, 620, 924, String(P.chips), { size: 26 });
  // shield + "no confirmed attacks"
  const nk = K.popIn(t, tNone, 0.5);
  if (nk > 0) {
    K.drawShield(ctx, 345, 1040, 0.52 * Math.min(1.05, nk), { check: K.phase(t, tNone + 0.3, tNone + 0.8), shadow: false });
    K.drawLabel(ctx, 630, 990 + K.bob(t, 3, 1.2, 3), Math.min(1.05, nk), { text: String(P.none || 'No confirmed attacks'), size: 30, accent: true });
  }
  ctx.restore();
}

// card centred at x, top at y. tIn: when the gauge sweeps (-1 = already full); tHi: when it pulses (-1 = never)
function scoreCard(ctx, H, K, t, x, y, name, score, of, max, col, tIn, tHi, acc) {
  const { roundRect, clamp, smooth } = H;
  const W = 300, Hh = 330, x0 = x - W / 2;
  // stand
  ctx.fillStyle = '#2a2f52'; ctx.fillRect(x - 10, y + Hh, 20, 1036 - y - Hh - 14);
  roundRect(ctx, x - 70, 1022, 140, 16, 8); ctx.fill();
  K.shadow(ctx, x, 1038, 160);
  roundRect(ctx, x0, y, W, Hh, 26); ctx.fillStyle = 'rgba(12,14,28,0.95)'; ctx.fill();
  const hi = tHi >= 0 ? smooth((t - tHi) / 0.3) : 0;
  ctx.lineWidth = 4 + 2 * hi; ctx.strokeStyle = hi > 0 ? H.mixHex('#3a4167', col, hi) : '#3a4167'; ctx.stroke();
  if (hi > 0) K.glow(ctx, x, y + Hh / 2, 220, col, 0.18 * hi * (0.8 + 0.2 * Math.sin(t * 5)));
  // name
  ctx.font = H.font('display', 36); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const ft = H.fitText(ctx, name.toUpperCase(), 'display', 36, 22, W - 50); ctx.font = ft.font;
  ctx.fillText(name.toUpperCase(), x, y + 44);
  // gauge
  const v = parseFloat(score) || 0, frac = clamp(v / max);
  const p = tIn < 0 ? 1 : H.easeOutCubic(clamp((t - tIn - 0.2) / 0.9));
  const gy = y + 220, r = 110;
  ctx.lineCap = 'round';
  ctx.lineWidth = 22; ctx.strokeStyle = '#262b4f'; ctx.beginPath(); ctx.arc(x, gy, r, Math.PI, 2 * Math.PI); ctx.stroke();
  if (p > 0) { ctx.strokeStyle = col; ctx.beginPath(); ctx.arc(x, gy, r, Math.PI, Math.PI + Math.PI * frac * p); ctx.stroke(); }
  // number counts up with the sweep
  const shown = (v * p).toFixed((score.split('.')[1] || '').length);
  ctx.font = H.font('display', 84); ctx.fillStyle = col; ctx.textBaseline = 'alphabetic';
  ctx.fillText(shown, x, gy + 6);
  ctx.font = H.font('ui', 26); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.textBaseline = 'middle';
  ctx.fillText(String(of == null ? 'out of 10' : of), x, gy + 52);
}
