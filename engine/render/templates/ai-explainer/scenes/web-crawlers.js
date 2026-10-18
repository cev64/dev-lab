// Scene "web-crawlers" (full frame, 1 beat). Dusk street: three small websites drawn as storefronts with browser-
// window facades; each gets a badge (e.g. "has a business account"). An expert pill pops, then small crawler robots
// hop out of a big company tower (text name pill, no logo) to the sites and page cards arc back into the tower; the
// tower lights up with an "AI training" pill and a "$0" price tag swings from it.
// params: sites (3 short signs, ["NEWS", "NEWS", "NEWS"]), badge ("Has an account"), company ("Company"),
//         experts ("Experts say"; pass who + where it was published), could ("Could allow: scraping for AI"),
//         ai ("AI training"), price ("$0"), cues (narration words; without them, fractions of the scene):
//         badgeCue, expertsCue ("experts"), couldCue, scrapeCue ("scrape"), trainCue ("train"), priceCue ("free")
// Fits: scraping / AI-training-data / crawler stories (publishers, creators, small sites).
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, rgba } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const tB = at(P.badgeCue, D * 0.17) - 0.2;
  const tE = at(P.expertsCue || 'experts', D * 0.31) - 0.3;
  const tC = at(P.couldCue, D * 0.49) - 0.2;
  const tS = at(P.scrapeCue || 'scrape', D * 0.6) - 0.3;
  const tT = at(P.trainCue || 'train', D * 0.73) - 0.15;
  const tP = at(P.priceCue || 'free', D * 0.93) - 0.3;
  const signs = (P.sites || ['NEWS', 'NEWS', 'NEWS']).slice(0, 3);

  K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 470, y: 780 }, { t: tS, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 740 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 990 });
  const GY = 1000;

  // company tower (right)
  const TX = 790, TS = 0.72, TH = (60 + 8 * 44) * TS;
  const tk = smooth((t - tT) / 0.5);
  if (tk > 0) K.glow(ctx, TX, GY - TH * 0.6, 320, ACC, 0.45 * tk);
  K.drawBuilding(ctx, TX, GY, TS, { t, color: '#4b5b9e', floors: 8, lit: 0.45 + 0.5 * tk });
  K.drawLabel(ctx, TX, GY - TH - 62, 1, { text: P.company || 'Company', size: 28, dot: true });

  // three site storefronts
  const SXS = [140, 320, 500], SW = 160, SHT = 300;
  const siteTop = GY - SHT;
  SXS.forEach((x, i) => {
    K.shadow(ctx, x, GY, 190);
    roundRect(ctx, x - SW / 2 - 6, siteTop - 6, SW + 12, SHT + 6, 14); ctx.fillStyle = '#2a2f52'; ctx.fill();
    roundRect(ctx, x - SW / 2, siteTop, SW, SHT - 70, 10); ctx.fillStyle = '#f4f1e8'; ctx.fill();
    // browser chrome
    roundRect(ctx, x - SW / 2, siteTop, SW, 26, 10); ctx.fillStyle = '#d7d2c4'; ctx.fill();
    for (let d = 0; d < 3; d++) { ctx.beginPath(); ctx.arc(x - SW / 2 + 16 + d * 15, siteTop + 13, 5, 0, Math.PI * 2); ctx.fillStyle = ['#ef6b6b', '#f2c86b', '#7bd389'][d]; ctx.fill(); }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = H.font('display', 30); ctx.fillStyle = '#20243f'; ctx.fillText(signs[i] || 'NEWS', x, siteTop + 56);
    roundRect(ctx, x - 62, siteTop + 80, 124, 56, 6); ctx.fillStyle = ['#8fb0dc', '#e0a77a', '#9fd3b5'][i]; ctx.fill();
    for (let r = 0; r < 4; r++) { roundRect(ctx, x - 62, siteTop + 148 + r * 18, r === 3 ? 70 : 124, 8, 4); ctx.fillStyle = '#c9c4b5'; ctx.fill(); }
    // door
    roundRect(ctx, x - 26, GY - 64, 52, 64, 6); ctx.fillStyle = '#3d4470'; ctx.fill();
    ctx.beginPath(); ctx.arc(x + 14, GY - 32, 4, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    // badge
    const bk = K.popIn(t, tB + i * 0.15, 0.4);
    if (bk > 0) {
      ctx.save(); ctx.translate(x + SW / 2 - 6, siteTop + 4); ctx.scale(Math.min(1.1, bk), Math.min(1.1, bk));
      ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
      ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-2, 8); ctx.lineTo(10, -8); ctx.stroke();
      ctx.restore();
    }
  });
  const blk = K.popIn(t, tB + 0.3, 0.45);
  if (blk > 0) {
    ctx.save(); ctx.globalAlpha = clamp(blk); ctx.strokeStyle = rgba(ACC, 0.6); ctx.lineWidth = 3; ctx.setLineDash([6, 8]);
    SXS.forEach((x) => { ctx.beginPath(); ctx.moveTo(320, 612); ctx.lineTo(x + SW / 2 - 6, siteTop - 18); ctx.stroke(); });
    ctx.restore();
    K.drawLabel(ctx, 320, 612, Math.min(1.05, blk), { text: P.badge || 'Has an account', size: 26, accent: true });
  }

  // experts pill + hedge pill
  const ek = K.popIn(t, tE, 0.45);
  if (ek > 0) K.drawLabel(ctx, 380, 490 + K.bob(t, 3, 1.3), Math.min(1.05, ek), { text: P.experts || 'Experts say', size: 28, dot: true });
  const ck = K.popIn(t, tC, 0.45);
  if (ck > 0) K.drawLabel(ctx, 380, 556 + K.bob(t, 3, 1.3, 1), Math.min(1.05, ck), { text: P.could || 'Could allow: scraping for AI', size: 28 });

  // crawlers hop from the tower to the sites, then page cards arc back
  SXS.forEach((x, i) => {
    const s0 = tS + i * 0.25, u = clamp((t - s0) / 0.9);
    if (t < s0) return;
    const bx = lerp(TX - 70, x + 50, smooth(u)), by = GY - 4 - Math.sin(u * Math.PI) * 120;
    K.drawRobot(ctx, bx, by, 0.56, { t, state: u >= 1 ? 'working' : 'idle', flip: true, seed: 5 + i });
    if (u >= 1) {
      // scanning beam on the site
      const sc = 0.5 + 0.5 * Math.sin((t - s0) * 5 + i);
      ctx.save(); ctx.globalAlpha = 0.35; ctx.fillStyle = ACC;
      ctx.beginPath(); ctx.moveTo(x + 50, GY - 80); ctx.lineTo(x - 70, siteTop + 40 + sc * 160); ctx.lineTo(x + 40, siteTop + 40 + sc * 160); ctx.closePath(); ctx.fill(); ctx.restore();
      // page cards flying to the tower
      const GAP = 0.55, TR = 1.3, t1 = s0 + 1.0;
      const k1 = Math.floor((t - t1) / GAP);
      for (let k = Math.max(0, k1 - 3); k <= k1; k++) {
        const v = (t - t1 - k * GAP) / TR;
        if (v < 0 || v > 1) continue;
        const pts = K.bezier(x, siteTop + 20, x + 60, siteTop - 150 - i * 30, TX - 120, GY - TH - 60, TX - 20, GY - TH * 0.55, 30);
        const [px, py] = K.pathPoint(pts, v);
        const a = smooth(v / 0.1) * (1 - smooth((v - 0.88) / 0.12));
        ctx.save(); ctx.globalAlpha = a; ctx.translate(px, py); ctx.rotate((v - 0.5) * 0.8);
        roundRect(ctx, -22, -28, 44, 56, 5); ctx.fillStyle = '#f4f1e8'; ctx.fill();
        for (let r = 0; r < 4; r++) { roundRect(ctx, -14, -18 + r * 11, r === 3 ? 16 : 28, 5, 2); ctx.fillStyle = '#b9b4a6'; ctx.fill(); }
        ctx.restore();
        K.glow(ctx, px, py, 40, ACC, 0.4 * a);
      }
    }
  });

  // AI training pill + $0 tag
  const ak = K.popIn(t, tT, 0.45);
  if (ak > 0) K.drawLabel(ctx, TX, GY - TH - 140 + K.bob(t, 3, 1.4, 2), Math.min(1.05, ak), { text: P.ai || 'AI training', size: 28, accent: true });
  const pk = K.popIn(t, tP, 0.45);
  if (pk > 0) K.drawPriceTag(ctx, TX + 70, GY - TH * 0.35, 0.9 * Math.min(1.05, pk), { text: P.price || '$0', t: t - tP });

  // a reader on the street with a phone
  K.drawPerson(ctx, 660, 1036, 0.95, { t, pose: 'phone', mood: t > tP ? 'worried' : 'neutral', skin: 4, hair: 2, shirt: 2, hairStyle: 'curly', seed: 9, look: 0.6 });
  void rgba;
}
