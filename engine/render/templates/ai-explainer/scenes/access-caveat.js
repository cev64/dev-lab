// Scene "access-caveat" (full frame, one beat; adapted from the library's breach-caveat). Night office split in two.
// Right: a dark door with a big glowing "?" and a "How they got in: not explained" pill (first: the unknown).
// Top: a verbatim quote panel that wraps to 2-3 lines (text only, attribution as text; the speaker is never drawn).
// Left: a laptop on a desk labelled with the company's own channels; a check stamp ("Not affected") lands on it.
// Unlike breach-caveat: cues may come in any order (gentle zoom only), the quote wraps, the how-pill sits under the
// door (bottom), no siren unless `ongoing`.
// Fits: "what we still don't know" caveats with a company's denial or "not affected" statement.
// params (all optional): app, okStamp, quote, by, how, ongoing ('' = none)
//        cues: appCue, okCue, quoteCue, howCue, ongoingCue (narration words, "word#n" = the (n+1)th time; without
//        them fractions of the scene)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp } = H;
  const D = info.duration, ACC = info.accent, RED = '#ff6b5e';
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tApp = at(P.appCue, D * 0.05), tOk = at(P.okCue, D * 0.8);
  const tQuote = at(P.quoteCue, D * 0.55), tHow = at(P.howCue, D * 0.05), tOn = P.ongoing ? at(P.ongoingCue, D * 0.9) : Infinity;
  const feet = 1010;

  const pill = (text, x, y, a, o = {}) => {
    if (t < a) return;
    K.drawLabel(ctx, x, y, K.popIn(t, a, 0.4), { text, size: o.size || 28, dot: !o.accent, accent: o.accent });
  };

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 920, wall: '#262a4a', wallS: '#1f2244' });

  // left: desk + laptop
  const lx = 320;
  K.drawDesk(ctx, lx, feet, 1.1);
  K.drawLaptop(ctx, lx, feet - 121, 1.05, { t, screen: 'code', typing: 0.6 });
  K.props.mug(ctx, lx + 175, feet - 121, 1, t);
  pill(P.app || 'The app', lx, 735, tApp - 0.1, { size: 26 });
  if (t > tOk - 0.1) K.drawStamp(ctx, lx, feet - 50, 0.95, { kind: 'check', text: P.okStamp || 'Not affected', land: (t - tOk + 0.1) / 0.5 });

  // right: the dark door with a "?"
  const dx = 700, dTop = feet - 330;
  H.roundRect(ctx, dx - 105, dTop - 12, 210, 342, 10); ctx.fillStyle = '#16182c'; ctx.fill();
  H.roundRect(ctx, dx - 92, dTop, 184, 330, 6); ctx.fillStyle = '#3a3150'; ctx.fill();
  ctx.fillStyle = '#2e2742'; H.roundRect(ctx, dx - 78, dTop + 18, 156, 130, 4); ctx.fill(); H.roundRect(ctx, dx - 78, dTop + 168, 156, 140, 4); ctx.fill();
  // the door is ajar a crack, light leaks out
  const leak = 0.5 + 0.5 * Math.sin(t * 2.2);
  ctx.fillStyle = H.rgba(RED, 0.25 + 0.2 * leak); ctx.fillRect(dx + 88, dTop + 6, 6, 318);
  ctx.fillStyle = '#c9b37a'; ctx.beginPath(); ctx.arc(dx + 62, dTop + 170, 9, 0, Math.PI * 2); ctx.fill();
  const q = K.popIn(t, tHow - 0.05, 0.5);
  if (q > 0) {
    K.glow(ctx, dx, dTop + 150, 200, ACC, 0.3 * q);
    ctx.save(); ctx.translate(dx, dTop + 165 + K.bob(t, 5, 0.5)); ctx.scale(q, q);
    ctx.fillStyle = ACC; ctx.font = K.font.display(170); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 0);
    ctx.restore();
  }
  pill(P.how || 'How they got in: not disclosed', 600, 1042, tHow + 0.1, { size: 26 });
  // optional siren
  if (t > tOn - 0.1) {
    const pulse = 0.5 + 0.5 * Math.sin((t - tOn) * 10);
    ctx.beginPath(); ctx.arc(dx + 140, dTop + 30, 26, Math.PI, 0); ctx.fillStyle = H.mixHex('#7a2a26', RED, pulse); ctx.fill();
    K.glow(ctx, dx + 140, dTop + 20, 200, RED, 0.45 * pulse);
    K.drawLabel(ctx, dx, feet + 34, K.popIn(t, tOn - 0.1, 0.4), { text: P.ongoing, size: 30, accent: false });
  }

  // quote panel (top), wraps
  if (t > tQuote - 0.15) {
    const k = K.popIn(t, tQuote - 0.15, 0.45);
    const text = '“' + (P.quote || 'Quote here.') + '”';
    const lines = H.wrap(ctx, text, 'bold', 34, 690);
    const lh = 44, ph = 56 + lines.length * lh + 34;
    ctx.save(); ctx.translate(487, 565); ctx.scale(k, k);
    H.roundRect(ctx, -380, -ph / 2, 760, ph, 24); ctx.fillStyle = 'rgba(10,12,22,0.94)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(ACC, 0.7); H.roundRect(ctx, -380, -ph / 2, 760, ph, 24); ctx.stroke();
    const shown = Math.floor(clamp((t - tQuote) / 1.4) * 999);
    let used = 0;
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('bold', 34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const y0 = -ph / 2 + 44;
    lines.forEach((ln, i) => { const n = clamp(shown - used, 0, ln.length); used += ln.length; ctx.fillText(ln.slice(0, n), 0, y0 + i * lh); });
    ctx.fillStyle = '#b9c1d6'; ctx.font = K.font.ui(26); ctx.fillText('— ' + (P.by || 'Speaker, where said'), 0, ph / 2 - 30);
    ctx.restore();
  }
  ctx.restore();
}
