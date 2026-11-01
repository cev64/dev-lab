// Scene "test-snapshot" (full frame; a caveat beat). Night room. A generic chat window on the left gets a camera
// flash on snapCue and turns into a tilted instant photo captioned `snap` (a test is a moment in time). On changeCue a
// live chat window on the right with `who` text chips rewrites its answer (lines wipe and redraw) and a pill says
// `changed`. On unknownCue a row of small cartoon people walks in, each with a "?" and the pill becomes `unknown`.
// Fits: caveats about tests run at a point in time, companies changing answers afterwards, unknown reach.
// params: snap, changed, who [names as text, max 3], unknown, cues: snapCue, changeCue, unknownCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tSnap = at(P.snapCue, D * 0.15) - 0.1;
  const tChange = at(P.changeCue, D * 0.42) - 0.3;
  const tUnknown = at(P.unknownCue, D * 0.78) - 0.5;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 740 }]);
  K.world.room(ctx, { t, time: 'night', lamp: true, window: true, picture: false, plant: true });
  ctx.restore();
  ctx.fillStyle = 'rgba(8,10,24,0.5)'; ctx.fillRect(0, 0, 1080, 1920);

  function chat(x, y, w, h, answer) {
    roundRect(ctx, x, y, w, h, 20); ctx.fillStyle = '#1c2033'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#3b4260'; ctx.stroke();
    ctx.save(); roundRect(ctx, x, y, w, h, 20); ctx.clip(); ctx.fillStyle = '#2a2f45'; ctx.fillRect(x, y, w, 50); ctx.restore();
    roundRect(ctx, x + 14, y + 10, 30, 30, 8); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = ACC; ctx.fillRect(x + 20, y + 21, 5, 5); ctx.fillRect(x + 32, y + 21, 5, 5);
    roundRect(ctx, x + w - 170, y + 66, 150, 40, 18); ctx.fillStyle = ACC; ctx.fill();
    roundRect(ctx, x + 16, y + 122, w - 32, h - 140, 14); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    answer(x + 16, y + 122, w - 32, h - 140);
  }
  const lines = (x, y, w, h, prog, col) => { for (let i = 0; i < 4; i++) { const p = clamp(prog * 4 - i); if (p <= 0) continue; roundRect(ctx, x + 18, y + 20 + i * 26, (w - 36) * (i === 3 ? 0.55 : 0.9) * p, 12, 6); ctx.fillStyle = col; ctx.fill(); } };

  // left: the tested answer -> instant photo
  const snapE = H.easeOutCubic(clamp((t - tSnap) / 0.5));
  const L = { x: 72, y: 470, w: 380, h: 260 };
  ctx.save();
  ctx.translate(L.x + L.w / 2, L.y + L.h / 2); ctx.rotate(-0.07 * snapE); ctx.scale(1 - 0.06 * snapE, 1 - 0.06 * snapE); ctx.translate(-(L.x + L.w / 2), -(L.y + L.h / 2));
  if (snapE > 0) { // photo border
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(ctx, L.x - 16 + 8, L.y - 16 + 12, L.w + 32, L.h + 96, 10); ctx.fill();
    ctx.globalAlpha = snapE; roundRect(ctx, L.x - 16, L.y - 16, L.w + 32, L.h + 96, 10); ctx.fillStyle = '#f5f2ea'; ctx.fill(); ctx.globalAlpha = 1;
  }
  chat(L.x, L.y, L.w, L.h, (x, y, w, h) => lines(x, y, w, h, 1, '#b9c1d6'));
  if (snapE > 0) {
    ctx.globalAlpha = snapE; ctx.font = H.font('bold', 28); ctx.fillStyle = '#161927'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.snap || 'A test, one moment', L.x + L.w / 2, L.y + L.h + 42); ctx.globalAlpha = 1;
    // pin
    ctx.beginPath(); ctx.arc(L.x + L.w / 2, L.y - 4, 13, 0, Math.PI * 2); ctx.fillStyle = '#ff6b5e'; ctx.fill();
  }
  ctx.restore();
  // flash
  const fl = t - tSnap;
  if (fl > 0 && fl < 0.45) { ctx.fillStyle = `rgba(255,255,255,${0.75 * (1 - fl / 0.45)})`; ctx.fillRect(0, 0, 1080, 1920); }

  // right: the live answer that changes
  const R = { x: 520, y: 470, w: 390, h: 260 };
  const rp = K.popIn(t, 0.2, 0.45);
  if (rp > 0) {
    ctx.save(); ctx.translate(R.x + R.w / 2, R.y + R.h); ctx.scale(rp, rp); ctx.translate(-(R.x + R.w / 2), -(R.y + R.h));
    const wipe = clamp((t - tChange) / 0.6), redraw = clamp((t - tChange - 0.7) / 1.0);
    chat(R.x, R.y, R.w, R.h, (x, y, w, h) => {
      if (t < tChange + 0.6) lines(x, y, w, h, 1 - wipe, '#b9c1d6');
      if (redraw > 0) lines(x, y, w, h, redraw, H.mixHex(ACC, '#000000', 0.12));
      if (t > tChange && t < tChange + 1.8) { // eraser/pencil glint
        const u = t < tChange + 0.6 ? 1 - wipe : redraw;
        const px = x + 18 + (w - 36) * ((u * 4) % 1), py = y + 28 + Math.min(3, Math.floor(u * 4)) * 26;
        K.glow(ctx, px, py, 26, ACC, 0.7);
      }
    });
    // who chips in the title bar
    const who = (P.who || []).slice(0, 3);
    let cx = R.x + 58;
    who.forEach((name, i) => {
      const p = K.popIn(t, tChange + 0.2 + i * 0.25, 0.35); if (p <= 0) return;
      ctx.font = H.font('ui', 24); const w = ctx.measureText(name).width + 28;
      ctx.save(); ctx.translate(cx + w / 2, R.y + 25); ctx.scale(p, p);
      roundRect(ctx, -w / 2, -18, w, 36, 18); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      ctx.fillStyle = '#161927'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(name, 0, 1);
      ctx.restore(); cx += w + 10;
    });
    // circular "changed" arrows
    const ca = clamp((t - tChange) / 0.4);
    if (ca > 0) {
      ctx.save(); ctx.translate(R.x + R.w - 44, R.y + R.h - 44); ctx.rotate(t * 2.5); ctx.globalAlpha = ca;
      ctx.strokeStyle = '#161927'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(0, 0, 20, 0.3, Math.PI - 0.2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, 20, Math.PI + 0.3, Math.PI * 2 - 0.2); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  // pill slot: changed -> unknown
  const p1 = K.popIn(t, tChange + 0.3, 0.4), sw = clamp((t - tUnknown) / 0.3);
  if (p1 > 0 && sw < 1) { ctx.save(); ctx.globalAlpha = 1 - sw; K.drawLabel(ctx, 492, 864, p1, { text: P.changed || 'Answers changed later', size: 26, dot: true }); ctx.restore(); }
  const p2 = K.popIn(t, tUnknown + 0.15, 0.4);
  if (p2 > 0) K.drawLabel(ctx, 492, 864, p2, { text: P.unknown || 'How many saw them? Unknown', size: 26, accent: true });

  // row of small people with "?"
  for (let i = 0; i < 6; i++) {
    const lt = t - tUnknown - i * 0.1; if (lt <= 0) continue;
    const x = 125 + i * 148, slide = (1 - H.easeOutCubic(clamp(lt / 0.5))) * (i < 3 ? -260 : 260);
    ctx.save(); ctx.globalAlpha = clamp(lt / 0.3);
    K.drawPerson(ctx, x + slide, 1036, 0.55, { pose: i % 2 ? 'phone' : 'stand', t, walk: lt < 0.5 ? lt : 0, mood: 'neutral', skin: i % 5, hair: (i + 2) % 5, shirt: (i + 1) % 5, hairStyle: ['short', 'long', 'bun', 'curly', 'none', 'short'][i], seed: 60 + i, look: 0 });
    ctx.restore();
    const q = K.popIn(lt, 0.45, 0.35);
    if (q > 0) { ctx.save(); ctx.translate(x, 1036 - 0.55 * 240 - 18 + K.bob(t, 4, 0.8, i * 0.3)); ctx.scale(q, q); ctx.font = H.font('display', 34); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText('?', 0, 0); ctx.restore(); }
  }
  void lerp;
}
