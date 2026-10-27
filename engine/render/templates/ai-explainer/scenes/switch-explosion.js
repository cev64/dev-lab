// Scene "switch-explosion" (full frame, 1 beat). Brute force made visible: a wall panel of on-off switches fills
// in one by one; a worker flips them frantically while a counter doubles with every switch (2, 4, 8 ... 1,024) and
// a pile of "combo" cards grows beside him; then bigger counts fly by (20 switches, 30 switches). On ruleCue a
// door marked SHORTCUT rises at the right, its padlock snaps shut, a cross stamp lands and the rule pill appears.
// Fits: explaining exponential growth / brute-force search / "no shortcut" hardness assumptions.
// params: rule ("The rule: no shortcut"), door ("SHORTCUT"), addCue, ruleCue (counter reads "N switches")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tStart = 0.9;
  const tAdd = at(P.addCue, D * 0.45);
  const tRule = at(P.ruleCue, D * 0.85) - 0.4;
  const feet = 1035;

  // switches appear: 10 by about tAdd + 1.6
  const nSw = 10;
  const swEnd = Math.min(tRule - 1.6, tAdd + 1.8);
  const swT = (i) => tStart + (i * (swEnd - tStart)) / (nSw - 1);
  let shown = 0; for (let i = 0; i < nSw; i++) if (t >= swT(i)) shown = i + 1;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 470, y: 720 }, { t: swEnd, zoom: 1.0, x: 487, y: 725 }, { t: tRule, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
  K.world.room(ctx, { t, time: 'dusk', window: false, picture: false, lamp: false, plant: false, floorY: 900 });

  // switch panel
  const px = 90, py = 565, pw = 600, ph = 250;
  H.roundRect(ctx, px, py, pw, ph, 18); ctx.fillStyle = '#1c2033'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.stroke();
  for (let i = 0; i < nSw; i++) {
    const col = i % 5, row = Math.floor(i / 5);
    const cx = px + 70 + col * 115, cy = py + 66 + row * 118;
    const k = K.popIn(t, swT(i), 0.35);
    if (k <= 0.01) continue;
    // flips frantically after it appears
    const on = Math.floor(t * (3 + (i % 3)) + i * 1.3) % 2 === 0;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
    H.roundRect(ctx, -34, -52, 68, 104, 12); ctx.fillStyle = '#e9edf7'; ctx.fill();
    H.roundRect(ctx, -16, -36, 32, 72, 10); ctx.fillStyle = '#9aa3bb'; ctx.fill();
    H.roundRect(ctx, -14, on ? -34 : -2, 28, 36, 9); ctx.fillStyle = on ? ACC : '#4b5270'; ctx.fill();
    ctx.restore();
  }

  // combo-card pile behind the worker
  const pileN = Math.min(26, Math.floor(Math.pow(2, Math.min(shown, 10) / 2.2)));
  for (let j = 0; j < pileN; j++) {
    const x = 905 + (H.hash(j, 2) - 0.5) * 80, y = feet - 8 - j * 14;
    ctx.save(); ctx.translate(x, y); ctx.rotate((H.hash(j, 5) - 0.5) * 0.5);
    H.roundRect(ctx, -46, -14, 92, 28, 5); ctx.fillStyle = j % 3 ? '#f2f4fa' : '#d5dae8'; ctx.fill();
    ctx.fillStyle = '#9aa3bb'; for (let q = 0; q < 4; q++) { ctx.beginPath(); ctx.arc(-30 + q * 20, 0, 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(-30 + (j % 4) * 20, 0, 6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // worker flipping (fades out of focus when the door appears)
  const panic = shown >= 6;
  K.drawPerson(ctx, 800, feet, 1.3, { t, pose: panic ? 'shrug' : 'point', mood: panic ? 'shocked' : 'worried', flip: true, skin: 2, hair: 1, shirt: 0, hairStyle: 'curly', seed: 6, look: -0.7 });
  if (panic) {
    // sweat drops
    for (let d = 0; d < 2; d++) {
      const u = ((t * 1.4 + d * 0.5) % 1);
      ctx.save(); ctx.globalAlpha = 1 - u; ctx.fillStyle = '#8fd3ff';
      ctx.beginPath(); ctx.ellipse(760 + d * 70, feet - 300 + u * 40, 7, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }

  // shortcut door (rises at the rule)
  const dk = easeOutCubic(clamp((t - tRule) / 0.6));
  if (dk > 0) {
    ctx.save(); ctx.globalAlpha = dk;
    const dx = 560, dy = feet, dw = 150, dh = 200 * dk;
    H.roundRect(ctx, dx - dw / 2 - 14, dy - dh - 14, dw + 28, dh + 14, 12); ctx.fillStyle = '#5b6380'; ctx.fill();
    H.roundRect(ctx, dx - dw / 2, dy - dh, dw, dh, 8); ctx.fillStyle = '#8a5d3b'; ctx.fill();
    ctx.fillStyle = '#764d31'; ctx.fillRect(dx - dw / 2 + 18, dy - dh + 20, dw - 36, dh * 0.35); ctx.fillRect(dx - dw / 2 + 18, dy - dh * 0.55, dw - 36, dh * 0.45);
    if (dk > 0.6) {
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      H.roundRect(ctx, dx - 95, dy - dh + 14, 190, 46, 10); ctx.fillStyle = '#1c2033'; ctx.fill();
      const ff = H.fitText(ctx, P.door || 'SHORTCUT', 'display', 28, 18, 170); ctx.font = ff.font;
      ctx.fillStyle = ACC; ctx.fillText(ff.text, dx, dy - dh + 38);
    }
    ctx.restore();
    if (dk > 0.8) {
      const lk = smooth((t - tRule - 0.6) / 0.3);
      K.drawLock(ctx, 610, feet - 70, 0.55, { open: 1 - lk });
    }
    K.drawStamp(ctx, 560, feet + 10, 0.55, { kind: 'cross', text: 'NO', land: (t - tRule - 1.0) / 0.5 });
  }
  ctx.restore();

  // counter (screen space)
  const nShown = shown;
  if (nShown > 0) {
    let n = nShown, label = `${n} switch${n > 1 ? 'es' : ''}`;
    const extra = clamp((t - (swEnd + 0.8)) / 1.6);
    let value = Math.pow(2, n);
    if (extra > 0 && t < tRule) { n = extra < 0.5 ? 20 : 30; label = `${n} switches`; value = Math.pow(2, n); }
    else if (t >= tRule) { n = 30; label = '30 switches'; value = Math.pow(2, 30); }
    const k = K.popIn(t, swT(0), 0.4);
    ctx.save(); ctx.translate(487, 484); ctx.scale(Math.min(1, k), Math.min(1, k));
    H.roundRect(ctx, -380, -58, 760, 116, 26); ctx.fillStyle = 'rgba(10,12,24,0.92)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.textBaseline = 'middle';
    ctx.font = H.font('ui', 30); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.textAlign = 'left'; ctx.fillText(label, -350, 0);
    const big = value.toLocaleString('en-US');
    const f = H.fitText(ctx, big, 'display', 58, 30, 420); ctx.font = f.font; ctx.fillStyle = ACC; ctx.textAlign = 'right'; ctx.fillText(f.text, 350, 2);
    ctx.restore();
    // "x2" pops on each new switch
    for (let i = 1; i < nSw; i++) {
      const u = (t - swT(i)) / 0.7;
      if (u > 0 && u < 1) {
        ctx.save(); ctx.globalAlpha = 1 - u; ctx.font = H.font('display', 40); ctx.fillStyle = ACC; ctx.textAlign = 'center';
        ctx.fillText('x2', 770, 640 - u * 50); ctx.restore();
      }
    }
  }
  pill(H, ctx, 260, 860, K.popIn(t, tRule + 0.5, 0.45), P.rule || 'The rule: no shortcut', ACC, true);
}

function pill(H, ctx, x, y, k, text, ACC, solid) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y + 30); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  const f = H.fitText(ctx, text, 'ui', 34, 22, 760); ctx.font = f.font;
  const w = ctx.measureText(f.text).width + 60;
  H.roundRect(ctx, -w / 2, -31, w, 62, 31); ctx.fillStyle = solid ? ACC : 'rgba(10,12,24,0.92)'; ctx.fill();
  if (!solid) { ctx.lineWidth = 2.5; ctx.strokeStyle = ACC; ctx.stroke(); }
  ctx.fillStyle = solid ? '#14160a' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
  ctx.restore();
}
