// Scene "breach-caveat" (was keys-caveat; full frame, one beat). Night office split in two.
// Left: a laptop on a desk running the open-source app (pill); a check stamp "Not affected" lands on it.
// Top: a verbatim quote panel (text only, attribution as text; the speaker is never drawn).
// Right: a dark back door with a big glowing "?" and a "How they got in: not disclosed" pill; finally a red siren on
//   the door frame starts pulsing with an "Incident ongoing" pill.
// Fits: company says part X was not affected; unknown cause; ongoing incident; any "what we don't know" caveat.
// Defaults are placeholders ("Quote here"): always pass the verbatim quote + attribution and the story's app name.
// params (all optional): app, okStamp, quote, by, how, ongoing
//        cues: appCue, okCue, quoteCue, howCue, ongoingCue (narration words, "word#n" = the (n+1)th time; without
//        them fractions of the scene)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp } = H;
  const D = info.duration, ACC = info.accent, RED = '#ff6b5e';
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tApp = at(P.appCue, D * 0.12), tOk = at(P.okCue, D * 0.27);
  const tQuote = at(P.quoteCue, D * 0.38), tHow = at(P.howCue, D * 0.6), tOn = at(P.ongoingCue, D * 0.9);
  const feet = 1010;

  const pill = (text, x, y, a, b, o = {}) => {
    if (t < a || t > b + 0.35) return;
    ctx.save(); ctx.globalAlpha = K.fadeOut(t, b, 0.35);
    K.drawLabel(ctx, x, y, K.popIn(t, a, 0.4), { text, size: o.size || 28, dot: !o.accent, accent: o.accent });
    ctx.restore();
  };

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 468, y: 800 }, { t: tQuote - 0.4, zoom: 1.05, x: 470, y: 790 }, { t: tQuote + 0.4, zoom: 1.0 }, { t: tHow - 0.2, zoom: 1.0 },
    { t: tHow + 0.6, zoom: 1.02, x: 487, y: 740 }, { t: D, zoom: 1.03, x: 487, y: 740 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 920, wall: '#262a4a', wallS: '#1f2244' });

  // left: desk + laptop
  const lx = 290;
  K.drawDesk(ctx, lx, feet, 1.1);
  K.drawLaptop(ctx, lx, feet - 121, 1.05, { t, screen: 'chat', typing: 0.6 });
  K.props.mug(ctx, lx + 175, feet - 121, 1, t);
  pill(P.app || 'The app', lx, 690, tApp - 0.1, D, { size: 28 });
  if (t > tOk - 0.1) K.drawStamp(ctx, lx, feet - 50, 0.95, { kind: 'check', text: P.okStamp || 'Not affected', land: (t - tOk + 0.1) / 0.5 });

  // right: the dark back door with a "?"
  const dx = 700, dTop = feet - 330;
  H.roundRect(ctx, dx - 105, dTop - 12, 210, 342, 10); ctx.fillStyle = '#16182c'; ctx.fill();
  H.roundRect(ctx, dx - 92, dTop, 184, 330, 6); ctx.fillStyle = '#3a3150'; ctx.fill();
  ctx.fillStyle = '#2e2742'; H.roundRect(ctx, dx - 78, dTop + 18, 156, 130, 4); ctx.fill(); H.roundRect(ctx, dx - 78, dTop + 168, 156, 140, 4); ctx.fill();
  ctx.fillStyle = '#c9b37a'; ctx.beginPath(); ctx.arc(dx + 62, dTop + 170, 9, 0, Math.PI * 2); ctx.fill();
  const q = K.popIn(t, tHow - 0.05, 0.5);
  if (q > 0) {
    K.glow(ctx, dx, dTop + 150, 200, ACC, 0.3 * q);
    ctx.save(); ctx.translate(dx, dTop + 165 + K.bob(t, 5, 0.5)); ctx.scale(q, q);
    ctx.fillStyle = ACC; ctx.font = K.font.display(170); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 0);
    ctx.restore();
  }
  pill(P.how || 'How they got in: not disclosed', 660, dTop - 20, tHow + 0.1, D, { size: 28 });
  // siren on the door frame + ongoing pill
  const on = t > tOn - 0.1;
  const pulse = on ? 0.5 + 0.5 * Math.sin((t - tOn) * 10) : 0;
  ctx.beginPath(); ctx.arc(dx + 140, dTop + 30, 26, Math.PI, 0); ctx.fillStyle = on ? H.mixHex('#7a2a26', RED, pulse) : '#4a3a48'; ctx.fill();
  H.roundRect(ctx, dx + 108, dTop + 30, 64, 14, 4); ctx.fillStyle = '#3b4260'; ctx.fill();
  if (on) K.glow(ctx, dx + 140, dTop + 20, 200, RED, 0.45 * pulse);
  if (on) K.drawLabel(ctx, dx, feet + 34, K.popIn(t, tOn - 0.1, 0.4), { text: P.ongoing || 'Incident ongoing', size: 30, accent: false });

  // quote panel (top)
  if (t > tQuote - 0.15) {
    const k = K.popIn(t, tQuote - 0.15, 0.45);
    const a = 1 - 0.4 * K.phase(t, tHow - 0.1, tHow + 0.4);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(487, 512); ctx.scale(k, k);
    H.roundRect(ctx, -420, -85, 840, 170, 24); ctx.fillStyle = 'rgba(10,12,22,0.92)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(ACC, 0.7); H.roundRect(ctx, -420, -85, 840, 170, 24); ctx.stroke();
    ctx.fillStyle = ACC; ctx.font = K.font.display(90); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('“', -400, -40);
    const text = P.quote || 'Quote here.';
    const shown = K.typewriter ? K.typewriter(text, t, 28, tQuote) : text;
    ctx.fillStyle = '#ffffff'; ctx.font = K.font.bold(44); ctx.textAlign = 'center'; ctx.fillText(shown, 10, -18);
    ctx.fillStyle = '#b9c1d6'; ctx.font = K.font.ui(26); ctx.fillText(P.by || '— Speaker, where said', 10, 50);
    ctx.restore();
  }
  ctx.restore();
}
