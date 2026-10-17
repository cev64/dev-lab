// Scene "manager-hands" (full frame). A meeting room with 1-2 panels of managers behind tables, each table with a
// text name plate. A header pill states the survey question; on each group's cue `raise` of its `n` managers raise
// a hand with a "Yes" bubble and the group's share pill lands. On maybeCue a junior with a backpack walks in and a
// hedged pill lands above them.
// params: head, groups [{label, n (<= 5), raise, share, cue}] (<= 2), maybe (hedged pill text), maybeCue, yes ("Yes")
// Fits: survey results ("1 in 3 managers said..."), shares of a group answering yes, hiring decisions.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const groups = (P.groups || [{ label: 'Managers', n: 3, raise: 1, share: '1 in 3' }]).slice(0, 2);
  const tg = groups.map((g, i) => at(g.cue, D * (0.2 + i * 0.25)) - 0.1);
  const tMaybe = Math.max(tg[tg.length - 1] + 1.2, at(P.maybeCue, D * 0.72) - 0.2);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 487, y: 800 }, { t: D, zoom: 1.0, x: 487, y: 760 }]);
  K.world.office(ctx, { t, time: 'dusk' });
  const shirts = ['#6f86e0', '#a08be0', '#e0a84f', '#4fb3a6', '#e8786a'];
  const layouts = groups.length === 1 ? [{ x0: 487, w: 600 }] : [{ x0: 225, w: 330 }, { x0: 660, w: 470 }];
  groups.forEach((g, gi) => {
    const L = layouts[gi], n = clamp(g.n || 3, 1, 5), sp = Math.min(100, (L.w - 40) / n);
    const raiseAt = tg[gi];
    for (let j = 0; j < n; j++) {
      const x = L.x0 - ((n - 1) * sp) / 2 + j * sp;
      const raised = j < (g.raise || 0) && t > raiseAt;
      K.drawPerson(ctx, x, 955, 0.85, { t, pose: raised ? 'point' : 'stand', mood: raised ? 'neutral' : 'happy', shirt: shirts[(j + gi * 2) % 5], skin: (j * 2 + gi) % 5, hair: (j + gi * 3) % 5, hairStyle: ['short', 'bun', 'curly', 'long', 'none'][(j + gi) % 5], seed: j + gi * 5, look: gi === 0 ? 0.3 : -0.3 });
      if (raised) {
        const p = K.popIn(t, raiseAt + 0.15, 0.4);
        const fadeB = 1 - H.clamp((t - tMaybe) / 0.4);
        if (p > 0 && fadeB > 0) { ctx.save(); ctx.globalAlpha = fadeB; K.drawSpeechBubble(ctx, x + 20, 735, 1, { text: P.yes || 'Yes', size: 28, tail: 'left', pop: p }); ctx.restore(); }
      }
    }
    // table + name plate
    H.roundRect(ctx, L.x0 - L.w / 2, 880, L.w, 80, 12); ctx.fillStyle = '#4a3a2f'; ctx.fill();
    ctx.fillStyle = '#5c4838'; ctx.fillRect(L.x0 - L.w / 2, 880, L.w, 14);
    K.drawLabel(ctx, L.x0, 950, 1, { text: g.label, size: 26 });
  });
  // junior walks in
  if (P.maybe && t > tMaybe - 0.6) {
    const k = K.phase(t, tMaybe - 0.6, tMaybe + 1.2, H.easeOutCubic);
    const x = lerp(-60, 470, k);
    ctx.save(); ctx.translate(x, 1045); ctx.scale(1.0, 1.0);
    H.roundRect(ctx, -46, -176, 40, 62, 12); ctx.fillStyle = '#c94f6d'; ctx.fill();
    ctx.restore();
    K.drawPerson(ctx, x, 1045, 1.0, { t, walk: k < 1 ? t : undefined, mood: 'worried', shirt: '#4fb3a6', skin: 2, hair: 1, hairStyle: 'curly', seed: 9, look: 0.5 });
  }
  ctx.restore(); // camera

  // header
  const ph = K.popIn(t, 0.2, 0.5);
  if (ph > 0) K.drawLabel(ctx, 487, 500, ph, { text: P.head || 'Hiring less?', size: 34, dot: true });
  // share pills
  groups.forEach((g, gi) => {
    const p = K.popIn(t, tg[gi] + 0.25, 0.45);
    if (p > 0 && g.share) K.drawLabel(ctx, layouts[gi].x0 * 0.94 + 30, 600, p, { text: g.share, size: 30, accent: true });
  });
  const pm = K.popIn(t, tMaybe + 0.4, 0.5);
  if (pm > 0 && P.maybe) K.drawLabel(ctx, 487, 720, pm, { text: P.maybe, size: 28, dot: true });
}
