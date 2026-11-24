// Scene "two-courts" (full frame, 1 beat, ~10-12 s; added to the library 2026-11-24). Dusk street with two generic courthouses (columns + blank
// pediment, no seals), state name pills over each. Two cartoon state lawyers walk up with case folders; on fileCue
// the folders fly in through the doors and a FILED stamp lands on each building. A generic company tower rises in
// the middle (name as a text pill, no logo); dashed lines run from both courthouses to it; on ownsCue "owns" chips
// pop above it with links; on firstCue an accent sash lands across the tower.
// Fits: "two states / two plaintiffs file separate suits against one company (which owns X and Y)", "first to sue".
// params (generic placeholder defaults; pass the story's names): left ("State A"), leftSub, right ("State B"), rightSub,
//         company ("Company"), owns (["Product one", "Product two"], max 2), ownsLabel ("owns"),
//         first ("First states to sue"), stamp ("FILED"),
//         cues: leftCue, rightCue, fileCue, companyCue, ownsCue, firstCue (narration words; else fractions of the scene)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, easeOutCubic, roundRect, rgba } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tL = at(P.leftCue, D * 0.15) - 0.3, tR = Math.max(tL + 0.45, at(P.rightCue, D * 0.2) - 0.3);
  const tFile = Math.max(tR + 0.5, at(P.fileCue, D * 0.25) + 0.2);
  const tCo = at(P.companyCue, D * 0.4) - 0.4, tOwn = at(P.ownsCue, D * 0.55) - 0.2, tFirst = at(P.firstCue, D * 0.85) - 0.3;
  const GY = 1000, FEET = 1034;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 760 }, { t: tCo, zoom: 1.0, x: 487, y: 730 }, { t: D, zoom: 1.03, x: 487, y: 720 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: GY });
  ctx.fillStyle = 'rgba(8,10,24,0.28)'; ctx.fillRect(0, 0, 1080, 1920);

  // company tower rises from behind the street
  const rise = easeOutCubic(clamp((t - tCo) / 0.7));
  if (rise > 0) {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, 1080, GY + 2); ctx.clip();
    ctx.translate(0, (1 - rise) * 380);
    K.drawBuilding(ctx, 487, GY, 0.78, { t, color: '#4f5a8f', floors: 8, lit: 0.65, shadow: false });
    ctx.restore();
    K.drawLabel(ctx, 487, GY - 412 * 0.78 - 56, K.popIn(t, tCo + 0.4, 0.4), { text: P.company || 'Company', size: 30, accent: true });
  }

  // courthouses
  const houses = [
    { x: 205, name: P.left || 'State A', sub: P.leftSub || '', tn: tL },
    { x: 770, name: P.right || 'State B', sub: P.rightSub || '', tn: tR },
  ];
  for (const h of houses) {
    courthouse(h.x, GY, 0.84, t > tFile + 0.3);
    const p = K.popIn(t, h.tn, 0.4);
    if (p > 0) K.drawLabel(ctx, h.x, 690, p, { text: h.name.toUpperCase(), size: 30, dot: true });
    if (h.sub) {
      const q = K.popIn(t, h.tn + 0.35, 0.4);
      if (q > 0) {
        ctx.save(); ctx.globalAlpha = clamp(q); ctx.font = H.font('ui', 22); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = 'rgba(255,255,255,0.82)'; ctx.fillText(h.sub, h.x, 618); ctx.restore();
      }
    }
  }

  // dashed suit lines from each courthouse to the tower, with a small folder riding each
  const tLine = Math.max(tFile + 0.6, tCo + 0.6);
  const lp = clamp((t - tLine) / 0.8);
  if (lp > 0) {
    for (const [x0, x1] of [[300, 400], [675, 574]]) {
      const pts = K.bezier(x0, 860, (x0 + x1) / 2, 780, (x0 + x1) / 2, 800, x1, 840, 24);
      ctx.save(); ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = rgba('#ff5a52', 0.9); ctx.lineWidth = 5; ctx.lineCap = 'round';
      K.pathDraw(ctx, pts, lp); ctx.restore();
      if (lp >= 1) {
        const u = ((t - tLine - 0.8) * 0.5) % 1; const [fx, fy] = K.pathPoint(pts, u);
        miniFolder(fx, fy - 6, 0.5);
      }
    }
  }

  // "owns" chips above the tower
  const owns = (P.owns || ['Product one', 'Product two']).slice(0, 2);
  const topY = GY - 412 * 0.78 - 56 - 54;
  owns.forEach((txt, i) => {
    const p = K.popIn(t, tOwn + i * 0.55, 0.4);
    if (p <= 0) return;
    const cx = i === 0 ? 340 : 630, cy = 505;
    ctx.save(); ctx.globalAlpha = clamp(p);
    ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 3; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(487, topY + 6); ctx.lineTo(cx, cy + 4); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    K.drawLabel(ctx, cx, cy, Math.min(1, p), { text: txt, size: 30 });
    if (i === 0) {
      const q = K.popIn(t, tOwn, 0.4);
      ctx.save(); ctx.globalAlpha = clamp(q); ctx.font = H.font('bold', 28); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
      ctx.fillText(P.ownsLabel || 'owns', 487, 462); ctx.restore();
    }
  });

  // lawyers walk to the doors with folders; folders fly in on tFile
  const law = [
    { x0: -60, x1: 108, tS: tL, skin: 1, hair: 0, hs: 'bun', shirt: '#2f3b6e', seed: 12, flip: false },
    { x0: 1140, x1: 868, tS: tR, skin: 3, hair: 2, hs: 'short', shirt: '#6b3a5e', seed: 4, flip: true },
  ];
  law.forEach((L, i) => {
    const w0 = L.tS - 1.4, w1 = L.tS + 0.2;
    const u = clamp((t - w0) / (w1 - w0));
    const x = lerp(L.x0, L.x1, easeOutCubic(u));
    const walking = u > 0 && u < 1;
    const pose = t > tFile - 0.4 && t < tFile + 0.6 ? 'point' : t > tFirst ? 'cheer' : 'stand';
    K.drawPerson(ctx, x, FEET, 0.95, { t, pose, walk: walking ? t : null, mood: t > tFirst ? 'happy' : 'neutral', look: L.flip ? -0.6 : 0.6, flip: L.flip, skin: L.skin, hair: L.hair, hairStyle: L.hs, shirt: L.shirt, seed: L.seed });
    const fly = clamp((t - tFile - 0.2 * i) / 0.45);
    if (fly < 1) {
      const hx = x + (L.flip ? -48 : 48), hy = FEET - 125;
      const e = easeOutCubic(fly);
      miniFolder(lerp(hx, i === 0 ? 205 : 770, e), lerp(hy, 920, e) - Math.sin(e * Math.PI) * 70, lerp(0.85, 0.3, e));
    }
    const sl = (t - tFile - 0.45 - 0.2 * i) / 0.5;
    K.drawStamp(ctx, i === 0 ? 205 : 770, 860, 0.62, { kind: 'check', text: P.stamp || 'FILED', land: sl });
  });

  // sash across the tower
  const fp = K.popIn(t, tFirst, 0.5);
  if (fp > 0) {
    const txt = (P.first || 'First states to sue').toUpperCase();
    ctx.save(); ctx.translate(487, 940); ctx.rotate(-0.04); ctx.scale(Math.min(1.04, fp), Math.min(1.04, fp));
    ctx.font = H.font('display', 34);
    const w = Math.min(820, ctx.measureText(txt).width + 80);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(ctx, -w / 2 + 8, -32, w, 72, 14); ctx.fill();
    ctx.fillStyle = ACC; roundRect(ctx, -w / 2, -40, w, 72, 14); ctx.fill();
    const f = H.fitText(ctx, txt, 'display', 34, 20, w - 50); ctx.font = f.font;
    ctx.fillStyle = H.mixHex(ACC, '#000000', 0.66); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, -3);
    ctx.restore();
  }
  ctx.restore();

  function courthouse(x, y, s, lit) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 340);
    // steps
    for (let i = 0; i < 3; i++) { roundRect(ctx, -160 + i * 12, -18 - i * 18, 320 - i * 24, 20, 4); ctx.fillStyle = i % 2 ? '#c9c1b2' : '#d9d2c4'; ctx.fill(); }
    const base = -54;
    // body + columns
    ctx.fillStyle = '#b9b1a2'; ctx.fillRect(-130, base - 190, 260, 190);
    for (let c = 0; c < 5; c++) {
      const cx = -112 + c * 56;
      ctx.fillStyle = '#e6e0d3'; ctx.fillRect(cx - 14, base - 186, 28, 186);
      ctx.fillStyle = '#cfc8b9'; ctx.fillRect(cx + 4, base - 186, 10, 186);
      roundRect(ctx, cx - 20, base - 196, 40, 12, 3); ctx.fillStyle = '#efe9dc'; ctx.fill();
    }
    // door between the middle columns
    roundRect(ctx, -22, base - 110, 44, 110, 6); ctx.fillStyle = lit ? rgba('#ffe7a8', 0.9) : '#3a3348'; ctx.fill();
    if (lit) K.glow(ctx, 0, base - 50, 90, '#ffe7a8', 0.35);
    // entablature + blank pediment
    roundRect(ctx, -150, base - 222, 300, 28, 4); ctx.fillStyle = '#efe9dc'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-160, base - 222); ctx.lineTo(0, base - 300); ctx.lineTo(160, base - 222); ctx.closePath();
    ctx.fillStyle = '#e6e0d3'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-120, base - 230); ctx.lineTo(0, base - 286); ctx.lineTo(120, base - 230); ctx.closePath();
    ctx.fillStyle = '#d2cbbb'; ctx.fill();
    ctx.restore();
  }
  function miniFolder(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#d9a648'; roundRect(ctx, -60, -52, 50, 18, 6); ctx.fill();
    ctx.fillStyle = '#f0c063'; roundRect(ctx, -60, -42, 120, 84, 8); ctx.fill();
    ctx.fillStyle = '#1b2140'; for (let k = 0; k < 3; k++) ctx.fillRect(-40, -20 + k * 16, k === 2 ? 50 : 80, 6);
    ctx.restore();
  }
}
