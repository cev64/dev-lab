// Scene "song-flood" (full frame). Night street: song cards (mostly little robot-face "AI" cards, a few music-note
// cards) rain down faster and faster and pile up, burying a shocked cartoon worker to the knees. A source pill, then a
// big number counts up with a line under it; at the half cue a split bar fills past the middle with a share label.
// Fits: "X AI-made songs/apps/posts a day", floods of AI content, upload volume stats.
// params: source ("Deezer, Oct 13, 2026"), prefix ("Nearly"), value (90000), unit ("fully AI tracks a day"),
//         share (">50%"), shareFill (0.55), shareLabel ("of new music on peak days"), aiShare (0.75 of cards)
//         cues: srcCue (Deezer), countCue (ninety), halfCue (half)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tSrc = at(P.srcCue || 'Deezer', D * 0.28), tCount = at(P.countCue || 'ninety', D * 0.42), tHalf = at(P.halfCue || 'half', D * 0.78);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.1, x: 487, y: 800 }, { t: tCount, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.02, x: 487, y: 735 }]);
  K.world.city(ctx, { t, time: 'night', groundY: 1000 });
  ctx.fillStyle = 'rgba(5,7,16,0.4)'; ctx.fillRect(0, 0, 1080, 1920);

  // card schedule: slow trickle, then a flood after the count cue
  const N = 124, slow = 22;
  const startOf = (i) => (i < slow ? 0.2 + i * (Math.max(1, tCount - 0.4) / slow) : tCount - 0.2 + (i - slow) * 0.045);
  const FL = 0.95;
  const slot = (i) => {
    const r = Math.floor(i / 30), c = i % 30;
    void c; return [80 + H.hash(i, 11) * 920, 1032 - r * 30 - H.hash(i, 2) * 14, (H.hash(i, 3) - 0.5) * 0.8];
  };
  // worker (drawn before the pile so the pile buries the legs)
  const flooded = t > tCount + 1;
  K.drawPerson(ctx, 125, 1036, 1.15, { t, pose: flooded ? 'shrug' : 'stand', mood: t > 1.2 ? 'shocked' : 'neutral', skin: 1, hair: 1, hairStyle: 'short', shirt: '#6f86e0', look: -0.4, seed: 9 });
  // landed cards (pile)
  for (let i = 0; i < N; i++) {
    const s = startOf(i);
    if (t < s + FL) continue;
    const [x, y, rot] = slot(i);
    card(x, y - 16, 0.42, rot, H.hash(i, 5) < (P.aiShare || 0.75) ? 'ai' : 'human');
  }
  // falling cards
  for (let i = 0; i < N; i++) {
    const s = startOf(i), u = (t - s) / FL;
    if (u <= 0 || u >= 1) continue;
    const [x, y, rot] = slot(i);
    const x0 = x + (H.hash(i, 7) - 0.5) * 120;
    ctx.globalAlpha = clamp(u * 6); card(lerp(x0, x, u), lerp(430, y - 16, u * u), 0.5, rot + (1 - u) * 3 * (H.hash(i, 8) - 0.5), H.hash(i, 5) < (P.aiShare || 0.75) ? 'ai' : 'human');
    ctx.globalAlpha = 1;
  }
  ctx.restore();

  // ---- stats (screen space)
  const sp = K.popIn(t, tSrc, 0.4);
  if (sp > 0) K.drawLabel(ctx, 487, 470, Math.min(1, sp), { text: P.source || 'Deezer, Oct 13, 2026', size: 26, dot: true });
  const cp = K.popIn(t, tCount - 0.1, 0.5);
  if (cp > 0) {
    const s = Math.min(1.05, cp);
    ctx.save(); ctx.translate(487, 592); ctx.scale(s, s);
    H.roundRect(ctx, -330, -100, 660, 200, 30); ctx.fillStyle = 'rgba(10,12,22,0.86)'; ctx.fill();
    ctx.font = K.font.ui(28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillText(P.prefix || 'Nearly', 0, -66);
    const v = Math.round((P.value || 90000) * easeOutCubic(clamp((t - tCount) / 1.3)) / 100) * 100;
    ctx.font = K.font.display(104); ctx.fillStyle = ACC;
    ctx.fillText(v.toLocaleString('en-US'), 0, 6);
    ctx.font = K.font.ui(28); ctx.fillStyle = '#ffffff'; ctx.fillText(P.unit || 'fully AI tracks a day', 0, 74);
    ctx.restore();
  }
  // share bar
  const hp = K.popIn(t, tHalf - 0.2, 0.45);
  if (hp > 0) {
    const s = Math.min(1, hp), w = 540, y = 768;
    ctx.save(); ctx.translate(487, y); ctx.scale(s, s);
    H.roundRect(ctx, -w / 2 - 20, -54, w + 40, 150, 26); ctx.fillStyle = 'rgba(10,12,22,0.86)'; ctx.fill();
    H.roundRect(ctx, -w / 2, -30, w, 52, 26); ctx.fillStyle = '#3b4260'; ctx.fill();
    const f = (P.shareFill || 0.55) * easeOutCubic(clamp((t - tHalf) / 0.9));
    if (f > 0.02) { H.roundRect(ctx, -w / 2, -30, w * f, 52, 26); ctx.fillStyle = ACC; ctx.fill(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -42); ctx.lineTo(0, 34); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = K.font.display(32); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = H.mixHex(ACC, '#000000', 0.62);
    if (f > 0.15) ctx.fillText(P.share || '>50%', -w / 2 + 22, -3);
    ctx.font = K.font.ui(26); ctx.textAlign = 'center'; ctx.fillStyle = '#ffffff'; ctx.fillText(P.shareLabel || 'of new music on peak days', 0, 62);
    ctx.restore();
  }

  function card(x, y, s, rot, kind) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    H.roundRect(ctx, -50, -50, 100, 100, 18); ctx.fillStyle = kind === 'ai' ? ACC : '#f2f4fa'; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 4; ctx.stroke();
    if (kind === 'ai') {
      H.roundRect(ctx, -30, -24, 60, 46, 12); ctx.fillStyle = '#ffffff'; ctx.fill();
      H.roundRect(ctx, -22, -14, 44, 22, 8); ctx.fillStyle = '#161927'; ctx.fill();
      ctx.fillStyle = ACC; ctx.fillRect(-14, -7, 8, 8); ctx.fillRect(6, -7, 8, 8);
    } else {
      ctx.fillStyle = '#161927'; ctx.strokeStyle = '#161927'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-4, 22); ctx.lineTo(-4, -26); ctx.lineTo(22, -32); ctx.lineTo(22, 14); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-14, 24, 13, 10, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(12, 16, 13, 10, -0.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}
