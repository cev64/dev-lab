// Scene "backlash-signs" (full frame). City street at dusk with two company towers. Phase 1: a check stamp lands on
// the right tower, then on the left one (with date chips). Phase 2: townspeople walk in from both sides holding
// protest signs. Phase 3: a big counter counts up with a caption. Ends settled with the crowd bobbing their signs.
// Fits: companies pledge / change policy under public pressure, local backlash, protests, "N towns considering bans".
// params (all optional): towers  [left, right] tower labels (default ["Company A", "Company B"])
//                        chips   [left, right] chips under the stamps (default ["Earlier", "Now"])
//                        stamp   stamp text (default "PLEDGE")
//                        signs   up to 5 sign texts (default generic protest signs)
//                        count   number to count to (default 100), suffix (default "+"),
//                        caption counter caption, "line1|line2" (default "protests|and counting"), sub (small source line)
//                        firstCue / crowdCue / countCue  narration words (else 15% / 40% / 70% of the scene)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth } = H;
  const D = info.duration, ACC = info.accent;
  const cueT = (w, d) => { const v = w ? info.timeOf(w) : null; return v != null ? v : d; };
  const firstAt = cueT(P.firstCue, D * 0.15), crowdAt = cueT(P.crowdCue, D * 0.4), countAt = cueT(P.countCue, D * 0.7);
  const towers = P.towers || ['Company A', 'Company B'];
  const chips = P.chips || ['Earlier', 'Now'];

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 487, y: 760 }, { t: crowdAt, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 740 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 960 });
  // towers
  const TW = [{ x: 260, color: '#4f7f9a' }, { x: 715, color: '#7a5ba8' }];
  TW.forEach((tw, i) => K.drawBuilding(ctx, tw.x, 965, 0.85, { t, color: tw.color, floors: 8, lit: 0.55, label: towers[i] }));
  // stamps: right tower first (now), then the left one (earlier) at firstCue
  const stampT = [firstAt, Math.min(0.5, firstAt - 0.8)];
  const fadeStamps = K.fadeOut(t, crowdAt + 0.3, 0.5);
  TW.forEach((tw, i) => {
    const st = stampT[i];
    if (t < st || fadeStamps <= 0.01) return;
    ctx.save(); ctx.globalAlpha = fadeStamps;
    if (i === 0) K.cameraShake(ctx, t, st + 0.25, 0.3, 6);
    K.drawStamp(ctx, tw.x, 905, 0.9 * fadeStamps, { kind: 'check', text: P.stamp || 'PLEDGE', land: (t - st) / 0.5 });
    const cp = K.popIn(t, st + 0.5, 0.35);
    if (cp > 0) K.drawLabel(ctx, tw.x, 975, cp, { text: chips[i], size: 28, accent: i === 0 });
    ctx.restore();
  });

  // crowd with signs (5 slots spaced so the signs stay inside x 60-915 even with the end zoom)
  const signs = (P.signs || ['TELL US!', 'WHO PAYS?', 'SLOW DOWN', 'NOT HERE', 'ASK US']).slice(0, 5);
  const crowd = [
    { x: 150, skin: 2, hair: 0, hs: 'curly', shirt: 2 }, { x: 319, skin: 0, hair: 2, hs: 'long', shirt: 3 },
    { x: 487, skin: 4, hair: 0, hs: 'short', shirt: 1 }, { x: 655, skin: 1, hair: 3, hs: 'bun', shirt: 0 },
    { x: 824, skin: 3, hair: 1, hs: 'short', shirt: 4 },
  ].slice(0, signs.length);
  crowd.forEach((c, i) => {
    const start = crowdAt - 0.2 + Math.abs(i - 2) * 0.18;
    const k = clamp((t - start) / 1.3);
    if (k <= 0) return;
    const dir = c.x < 487 ? -1 : c.x > 487 ? 1 : 1;
    const x = c.x + dir * 520 * Math.pow(1 - H.easeOutCubic(k), 1.2) * (i === 2 ? 1.6 : 1);
    const walking = k < 1;
    const s = 1.15, feet = 1040;
    K.drawPerson(ctx, x, feet, s, { t, pose: walking ? 'stand' : 'cheer', walk: walking ? t : null, mood: 'angry', skin: c.skin, hair: c.hair, hairStyle: c.hs, shirt: c.shirt, seed: i * 3, flip: dir > 0 && walking });
    // sign held overhead (raised once they stop)
    const raise = K.phase(t, start + 1.1, start + 1.5, K.easeOutBack);
    ctx.save(); ctx.translate(x, feet); ctx.scale(s, s);
    const by = lerp(-150, -250, raise) + Math.sin(t * 3 + i) * 4 * raise;
    ctx.lineCap = 'round'; ctx.strokeStyle = '#8a6a4a'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(0, by); ctx.lineTo(0, by + 70); ctx.stroke();
    H.roundRect(ctx, -68, by - 82, 136, 86, 10); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = i % 2 ? ACC : '#d64b3f'; ctx.stroke();
    let fs = 30; ctx.font = H.font('display', fs);
    while (fs > 18 && ctx.measureText(signs[i]).width > 118) { fs -= 2; ctx.font = H.font('display', fs); }
    ctx.fillStyle = '#161927'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(signs[i], 0, by - 38);
    ctx.restore();
  });
  ctx.restore();

  // counter panel (screen space, top of the stage)
  const cp = K.popIn(t, countAt - 0.2, 0.4);
  if (cp > 0) {
    ctx.save(); ctx.translate(487, 520); ctx.scale(cp, cp);
    H.roundRect(ctx, -330, -100, 660, 200, 28); ctx.fillStyle = 'rgba(10,12,22,0.92)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(ACC, 0.7); ctx.stroke();
    const target = P.count || 100, n = Math.round(target * H.easeOutCubic(clamp((t - countAt) / 1.0)));
    const done = t > countAt + 1.0;
    ctx.font = H.font('condensed', 120); ctx.textAlign = 'right'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = ACC;
    ctx.fillText(String(n) + (done ? (P.suffix ?? '+') : ''), -40, 50);
    ctx.font = H.font('bold', 34); ctx.textAlign = 'left'; ctx.fillStyle = '#ffffff';
    const cap = (P.caption || 'protests|and counting').split('|');
    let cs = 34; while (cs > 22 && Math.max(...cap.map((ln) => ctx.measureText(ln).width)) > 300) { cs -= 2; ctx.font = H.font('bold', cs); }
    cap.forEach((ln, j) => ctx.fillText(ln, -10, -6 + j * 42));
    if (P.sub) { ctx.font = H.font('ui', 24); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fillText(P.sub, -10, 74); }
    ctx.restore();
  }
}
