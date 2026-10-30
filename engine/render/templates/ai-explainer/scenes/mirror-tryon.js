// Scene "mirror-tryon" (full frame, 1 beat). Dusk bedroom: a cartoon person in plain clothes looks into a tall
// standing "smart" mirror. On modelCue a scan line sweeps the glass and a matched stand-in model appears inside it
// (same skin tone, same build); outfits then snap on one after another (garment flies in, sparkle, colours swap),
// tag pills ("Body shape", "Skin tone") pop on their cues with dotted leaders to the model. A small hedge pill
// ("Per the app listing") sits on top. The person cheers at the end. Ends settled.
// Fits: virtual try-on / "see it on you" features, avatar or body-scan stories.
// params: hedge, tags [2], modelCue, tagCues [2], outfits [[shirt, pants], ...] (hex), skin (0-4), hair (0-4)
const OUTFITS = [['#e8786a', '#2d3350'], ['#a08be0', '#e8e2d0'], ['#4fb3a6', '#4f6fb8'], ['#f2b84b', '#2d3350']];

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, easeInOutCubic, roundRect } = H;
  const at = (w, d) => { if (!w) return d; const v = info.timeOf(w); return v == null ? d : v; };
  const tModel = at(P.modelCue, D * 0.35) - 0.5;
  const tagCues = P.tagCues || [];
  const tTag = [at(tagCues[0], D * 0.62) - 0.2, at(tagCues[1], D * 0.78) - 0.2];
  const outfits = P.outfits || OUTFITS;
  const skin = P.skin == null ? 2 : P.skin, hair = P.hair == null ? 1 : P.hair;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 740 }]);
  K.world.room(ctx, { t, time: 'dusk', window: false, picture: false, lamp: true, plant: true, wall: '#3a3566', floor: '#2a2650' });
  // fairy lights (match the closet scene)
  for (let i = 0; i < 12; i++) {
    const x = 80 + i * 80, y = 412 + Math.sin(i * 0.8) * 10, on = 0.55 + 0.45 * Math.sin(t * 2.2 + i * 1.7);
    K.glow(ctx, x, y, 26, i % 3 ? '#ffd98a' : ACC, 0.25 * on);
    ctx.beginPath(); ctx.arc(x, y, 5, 0, 7); ctx.fillStyle = i % 3 ? '#ffe7b0' : ACC; ctx.fill();
  }
  ctx.save(); ctx.translate(487, 1035); ctx.scale(1, 0.16); ctx.beginPath(); ctx.arc(0, 0, 420, 0, 7); ctx.fillStyle = '#463b78'; ctx.fill(); ctx.restore();

  // ---------------- mirror
  const MX = 640, MY0 = 450, MW = 330, MH = 560, MY1 = MY0 + MH;
  K.shadow(ctx, MX, MY1 + 18, 380, 0.4);
  ctx.fillStyle = '#c48b60'; roundRect(ctx, MX - MW / 2 - 18, MY0 - 18, MW + 36, MH + 36, MW / 2 + 18); ctx.fill();
  ctx.fillStyle = '#9b6a45'; roundRect(ctx, MX - 70, MY1 + 10, 20, 20, 6); ctx.fill(); roundRect(ctx, MX + 50, MY1 + 10, 20, 20, 6); ctx.fill();
  // glass
  ctx.save(); roundRect(ctx, MX - MW / 2, MY0, MW, MH, MW / 2); ctx.clip();
  const g = ctx.createLinearGradient(MX - MW / 2, MY0, MX + MW / 2, MY1); g.addColorStop(0, '#5b6aa8'); g.addColorStop(1, '#2b3266');
  ctx.fillStyle = g; ctx.fillRect(MX - MW / 2, MY0, MW, MH);
  // reflection streaks
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.beginPath(); ctx.moveTo(MX - 120, MY0); ctx.lineTo(MX - 60, MY0); ctx.lineTo(MX - 180, MY1); ctx.lineTo(MX - 240, MY1); ctx.closePath(); ctx.fill();
  // the stand-in model
  const mp = smooth((t - tModel - 0.3) / 0.5);
  const n = outfits.length, tOut0 = tModel + 0.9, span = Math.max(0.6, (D - 0.8 - tOut0) / n);
  const oi = t < tOut0 ? -1 : Math.min(n - 1, Math.floor((t - tOut0) / span));
  if (mp > 0) {
    const shirt = oi < 0 ? '#8a93a8' : outfits[oi][0], pants = oi < 0 ? '#2d3350' : outfits[oi][1];
    ctx.globalAlpha = mp;
    K.drawPerson(ctx, MX, MY1 - 30, 1.85, { t, pose: oi >= n - 1 && t > tOut0 + (n - 1) * span + 0.3 ? 'cheer' : 'stand', mood: 'happy', skin, hair, hairStyle: 'bun', shirt, pants, seed: 3, flip: true });
    ctx.globalAlpha = 1;
    // snap sparkle on every change
    for (let k = 0; k < n; k++) {
      const u = (t - (tOut0 + k * span)) / 0.4; if (u <= 0 || u >= 1) continue;
      ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.globalAlpha = 1 - u;
      for (let r = 0; r < 8; r++) { const a = r * Math.PI / 4; const cx = MX, cy = MY1 - 230; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * (90 + 60 * u), cy + Math.sin(a) * (110 + 60 * u)); ctx.lineTo(cx + Math.cos(a) * (115 + 80 * u), cy + Math.sin(a) * (135 + 80 * u)); ctx.stroke(); }
      ctx.restore();
    }
  }
  // scan line
  const sk = (t - tModel) / 0.9;
  if (sk > 0 && sk < 1) {
    const y = lerp(MY0 + 20, MY1 - 20, easeInOutCubic(sk));
    K.glow(ctx, MX, y, 160, ACC, 0.5);
    ctx.fillStyle = ACC; ctx.fillRect(MX - MW / 2, y - 3, MW, 6);
  }
  ctx.restore(); // glass clip

  // garments flying into the mirror for each change
  for (let k = 0; k < n; k++) {
    const t0 = tOut0 + k * span - 0.35, u = (t - t0) / 0.35;
    if (u <= 0 || u >= 1) continue;
    const e = easeInOutCubic(u);
    const x = lerp(300, MX, e), y = lerp(560, MY1 - 260, e) - Math.sin(Math.PI * e) * 90;
    ctx.save(); ctx.translate(x, y); ctx.rotate((1 - e) * -0.6); ctx.globalAlpha = 1 - 0.6 * e;
    ctx.fillStyle = outfits[k][0];
    ctx.beginPath(); ctx.moveTo(-22, -40); ctx.lineTo(-50, -30); ctx.lineTo(-60, 0); ctx.lineTo(-40, 6); ctx.lineTo(-34, -10); ctx.lineTo(-34, 50); ctx.lineTo(34, 50); ctx.lineTo(34, -10); ctx.lineTo(40, 6); ctx.lineTo(60, 0); ctx.lineTo(50, -30); ctx.lineTo(22, -40); ctx.quadraticCurveTo(0, -28, -22, -40); ctx.fill();
    ctx.restore();
  }
  // outfit counter chip on the mirror frame
  if (oi >= 0) {
    const cp = K.popIn(t, tOut0, 0.35);
    ctx.save(); ctx.translate(MX, MY1 + 4); ctx.scale(cp, cp);
    ctx.fillStyle = 'rgba(10,12,22,0.9)'; roundRect(ctx, -90, -24, 180, 48, 24); ctx.fill();
    ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`Look ${oi + 1} of ${n}`, 0, 2);
    ctx.restore();
  }

  // ---------------- the person (left), facing the mirror
  const cheer = t > D - 1.4;
  K.drawPerson(ctx, 260, 1030, 1.7, { t, pose: cheer ? 'cheer' : (t > tModel + 0.5 ? 'point' : 'stand'), mood: t > tModel + 0.4 ? 'happy' : 'neutral', skin, hair, hairStyle: 'bun', shirt: '#8a93a8', pants: '#2d3350', seed: 3, look: 1, talk: 0 });

  // ---------------- tags with dotted leaders
  (P.tags || ['Body shape', 'Skin tone']).slice(0, 2).forEach((txt, i) => {
    const k = K.popIn(t, tTag[i], 0.45); if (k <= 0) return;
    const lx = 285, ly = 525 + i * 72;
    const tx = MX - 40, ty = i === 0 ? MY1 - 200 : MY1 - 380;
    ctx.save(); ctx.globalAlpha = smooth(k);
    ctx.strokeStyle = ACC; ctx.setLineDash([8, 8]); ctx.lineWidth = 4; ctx.lineDashOffset = -t * 30;
    ctx.beginPath(); ctx.moveTo(lx + 120, ly - 26); ctx.lineTo(lerp(lx + 120, tx, smooth(k)), lerp(ly - 26, ty, smooth(k))); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(tx, ty, 9 * smooth(k), 0, 7); ctx.fillStyle = ACC; ctx.fill();
    ctx.restore();
    K.drawLabel(ctx, lx, ly, k, { text: txt, size: 30, accent: true });
  });
  // hedge pill (top)
  const hp = K.popIn(t, 0.2, 0.4);
  if (hp > 0) K.drawLabel(ctx, 285, 455, hp, { text: P.hedge || 'Per the app listing', size: 26, dot: true });
  ctx.restore();
}
