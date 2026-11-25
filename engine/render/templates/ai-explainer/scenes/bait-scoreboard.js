// Scene "bait-scoreboard" (full frame, 1 beat). Night test hall with a scoreboard of how often each model took the
// bait. Left: older models, each a kit robot holding a glowing file it grabbed; a red bar rises over each robot as its
// published rate counts up. Right: a group of newer robots standing calmly with empty hands; their bars stay tiny and
// one bracket shows the published range for the group (no invented per-model values). The group's names are listed
// as text in a panel.
// Fits: "older models fell for the test more often than newer ones", any per-model rate comparison with a group range.
// params (all optional; defaults are generic placeholders, pass the published names and figures): title
//   ("Took the bait: % of tests"), old [{name, value (number, %), cue}] (max 3; default Model A 20 / Model B 10),
//   newNames (text list, max 4; default Model C-F), newLabel ("The newer models"), range ("X-Y%"), rangeLo, rangeHi
//   (numbers, %, default 0.5 / 1.5),
//   cues: oldCue (first old bar), secondCue (second old bar), newCue (newer group)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration;
  const { clamp, lerp, smooth, roundRect } = H;
  const ACC = info.accent, N = K.NEUTRAL;
  const at = (w, d) => { const v = w != null ? info.timeOf(w) : null; return v == null ? d : v; };

  const old = (P.old || [{ name: 'Model A', value: 20 }, { name: 'Model B', value: 10 }]).slice(0, 3);
  const tOld = [at(P.oldCue, D * 0.1) - 0.1, at(P.secondCue, D * 0.42) - 0.4, at(old[2] && old[2].cue, D * 0.5)];
  const tNew = at(P.newCue, D * 0.62) - 0.3;
  const lo = P.rangeLo ?? 0.5, hi = P.rangeHi ?? 1.5;
  const newNames = (P.newNames || ['Model C', 'Model D', 'Model E', 'Model F']).slice(0, 4);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 360, y: 722 }, { t: tNew - 0.2, zoom: 1.05, x: 400, y: 720 }, { t: tNew + 1.0, zoom: 1.0, x: 487, y: 700 }, { t: D, zoom: 1.01, x: 487, y: 702 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true, plant: false, floorY: 900 });
  const feet = 1012, base = 790, pxPerPct = 9;

  // title pill
  K.drawLabel(ctx, 590, 520, K.popIn(t, 0.05, 0.4), { text: P.title || 'Took the bait: % of tests', size: 28, accent: true });

  // baseline
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(90, base); ctx.lineTo(900, base); ctx.stroke();

  // ---- older models (left)
  const ox = [215, 400, 300];
  old.forEach((m, i) => {
    const a = tOld[i], x = ox[i];
    const grow = smooth(clamp((t - a) / 0.9));
    const h = m.value * pxPerPct * grow;
    // bar
    if (grow > 0) {
      roundRect(ctx, x - 48, base - h, 96, h, 10); ctx.fillStyle = N.danger; ctx.fill();
      ctx.font = H.font('display', 40); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText((m.value * grow).toFixed(1) + '%', x, base - h - 14);
    }
    // robot holding the bait file
    const pop = K.popIn(t, a - 0.3, 0.4);
    if (pop > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, pop);
      K.drawRobot(ctx, x, feet, 0.8, { t, state: t > a + 0.3 ? 'happy' : 'idle', seed: 2 + i });
      const fy = feet - 225 * 0.8 - 40 + K.bob(t, 4, 1.2, i);
      K.glow(ctx, x, fy - 40, 70, ACC, 0.35);
      K.drawDocument(ctx, x, fy, 0.38, { lines: 3, shadow: false });
      ctx.restore();
      // name pill under the baseline
      K.drawLabel(ctx, x, base + 46, pop, { text: m.name, size: 20 });
    }
  });

  // ---- newer models (right): calm robots, tiny bars, one range bracket
  const nx = [545, 625, 705, 785].slice(0, newNames.length);
  const np = K.popIn(t, tNew, 0.45);
  if (np > 0) {
    nx.forEach((x, i) => {
      const p = K.popIn(t, tNew + i * 0.12, 0.4);
      ctx.save(); ctx.globalAlpha = Math.min(1, p);
      K.drawRobot(ctx, x, feet, 0.62, { t, state: 'idle', seed: 9 + i });
      ctx.restore();
      // tiny range band per robot: drawn as the same band (lo..hi), not per-model values
      const g = smooth(clamp((t - tNew - 0.3) / 0.7));
      const h0 = lo * pxPerPct * g, h1 = hi * pxPerPct * g;
      roundRect(ctx, x - 34, base - h1, 68, h1, 4); ctx.fillStyle = H.rgba(ACC, 0.45); ctx.fill();
      roundRect(ctx, x - 34, base - h0, 68, h0, 3); ctx.fillStyle = ACC; ctx.fill();
    });
    // bracket + range number
    const rp = K.popIn(t, tNew + 0.6, 0.45);
    if (rp > 0) {
      ctx.save(); ctx.globalAlpha = Math.min(1, rp);
      ctx.strokeStyle = ACC; ctx.lineWidth = 4; ctx.lineCap = 'round';
      const bx0 = nx[0] - 40, bx1 = nx[nx.length - 1] + 40, by = base - 40;
      ctx.beginPath(); ctx.moveTo(bx0, by + 14); ctx.lineTo(bx0, by); ctx.lineTo(bx1, by); ctx.lineTo(bx1, by + 14); ctx.stroke();
      ctx.font = H.font('display', 52); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(P.range || 'X-Y%', (bx0 + bx1) / 2, by - 18);
      ctx.restore();
      // names panel
      ctx.save(); ctx.globalAlpha = Math.min(1, rp);
      const px0 = 478, px1 = 852, py0 = 548, py1 = 664;
      roundRect(ctx, px0, py0, px1 - px0, py1 - py0, 18); ctx.fillStyle = 'rgba(10,12,22,0.86)'; ctx.fill();
      ctx.font = H.font('ui', 24); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(P.newLabel || 'The newer models', (px0 + px1) / 2, py0 + 26);
      ctx.font = H.font('body', 22); ctx.fillStyle = 'rgba(255,255,255,0.8)';
      const half = Math.ceil(newNames.length / 2);
      ctx.fillText(newNames.slice(0, half).join(' · '), (px0 + px1) / 2, py0 + 60);
      ctx.fillText(newNames.slice(half).join(' · '), (px0 + px1) / 2, py0 + 90);
      ctx.restore();
    }
  }
  ctx.restore();
}
