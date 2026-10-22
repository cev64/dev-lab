// Scene "survey-table" (full frame; best as a 2-beat span: hook + "who ran the survey"). Dusk office.
// Beat 1 (establishing, under the hook card): a manager with a clipboard faces a mixed team row of people and
// kit robots; the robots outnumber the people and blink. Beat 2: the row slides down and dims, a survey clipboard
// drops in (check boxes tick one by one), pills land on cues: who ran it (`by`), who paid (`client` + small
// `clientTag`), a counter of respondents counts up while a grid of mini head icons fills, and a mini globe with
// `regions` dots lights up with its pill.
// params: by ("Survey firm"), client ("for Company"), clientTag (optional small tag under the client pill),
//         count (1000), countLabel ("respondents"), regions (5), regionLabel ("<regions> countries"), sheet ("AI at work?"),
//         humans (2), bots (3), byCue, clientCue, tagCue, countCue, regionCue
// Fits: any survey / poll story: "a survey of N managers in M countries, run by X for Y".
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const b1 = info.beats.length > 1 ? info.beats[1].t0 : D * 0.3;
  const tBy = at(P.byCue, b1 + 0.3), tCl = Math.max(tBy + 0.5, at(P.clientCue, b1 + 1.4));
  const tTag = Math.max(tCl + 0.6, at(P.tagCue, b1 + 3.4));
  const tCount = Math.max(tTag + 0.5, at(P.countCue, b1 + 5.2)), tReg = Math.max(tCount + 1.2, at(P.regionCue, D - 1.6));
  const count = P.count || 1000, regions = clamp(P.regions || 5, 1, 9);
  const nH = clamp(P.humans == null ? 2 : P.humans, 0, 3), nB = clamp(P.bots == null ? 3 : P.bots, 0, 4);

  // the hook row: slides down + dims as the survey starts
  const go = K.phase(t, b1 - 0.2, b1 + 0.8, H.easeInOutCubic);
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 487, y: 860 }, { t: b1, zoom: 1.02, x: 487, y: 800 }, { t: D, zoom: 1.0, x: 487, y: 740 }]);
  K.world.office(ctx, { t, time: 'dusk' });
  ctx.restore();

  // team row (people + robots), seen from behind the manager
  ctx.save();
  ctx.globalAlpha = 1 - 0.55 * go;
  const rowY = lerp(1030, 1120, go), rowS = lerp(1.0, 0.8, go);
  const members = [];
  for (let i = 0; i < nH; i++) members.push('h');
  for (let i = 0; i < nB; i++) members.splice(1 + i * 2 > members.length ? members.length : 1 + i * 2, 0, 'b');
  const span = 560, x0 = 560 - span / 2, step = members.length > 1 ? span / (members.length - 1) : 0;
  const shirts = ['#e8786a', '#5fa8d8', '#a08be0'];
  let hi = 0;
  members.forEach((m, i) => {
    const x = members.length > 1 ? x0 + i * step : 560;
    if (m === 'b') K.drawRobot(ctx, x, rowY, 0.92 * rowS, { t, state: t < b1 ? 'idle' : 'working', seed: 11 + i, flip: true });
    else { K.drawPerson(ctx, x, rowY, 0.95 * rowS, { t, pose: 'stand', mood: 'neutral', shirt: shirts[hi % 3], skin: (hi * 2 + 1) % 5, hair: hi % 5, hairStyle: ['long', 'short', 'curly'][hi % 3], seed: 20 + hi, look: -0.6 }); hi++; }
  });
  // manager in front-left with a clipboard
  const mx = lerp(165, 120, go);
  K.drawPerson(ctx, mx, lerp(1045, 1130, go), 1.25 * rowS, { t, pose: 'point', mood: 'happy', shirt: '#4fb3a6', skin: 3, hair: 2, hairStyle: 'bun', seed: 2, look: 0.7, talk: t < b1 ? info.env * 0.5 : 0 });
  ctx.restore();

  if (t < b1 - 0.3) return; // the hook card owns the top of the frame

  // --- survey beat ---
  // pills: who ran it, who paid
  const pBy = K.popIn(t, tBy, 0.45), pCl = K.popIn(t, tCl, 0.45), pTag = K.popIn(t, tTag, 0.45);
  if (pBy > 0) K.drawLabel(ctx, 300, 500, pBy, { text: P.by || 'Survey firm', size: 30, dot: true });
  if (pCl > 0) K.drawLabel(ctx, 680, 500, pCl, { text: P.client || 'for Company', size: 30 });
  if (pTag > 0 && P.clientTag) K.drawLabel(ctx, 680, 556, pTag, { text: P.clientTag, size: 24 });

  // clipboard drops in (left)
  const cd = K.phase(t, b1, b1 + 0.7, H.easeOutBack);
  if (cd > 0) {
    const cx = 255, cy = lerp(400, 580, cd);
    ctx.save(); ctx.globalAlpha = clamp(cd * 2); ctx.translate(cx, cy); ctx.rotate(-0.05 + 0.03 * Math.sin(t * 1.3));
    H.roundRect(ctx, -150, 0, 300, 380, 18); ctx.fillStyle = '#8a5b3c'; ctx.fill();
    H.roundRect(ctx, -132, 22, 264, 342, 10); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    H.roundRect(ctx, -54, -16, 108, 40, 10); ctx.fillStyle = '#b9c1d6'; ctx.fill();
    ctx.fillStyle = '#161927'; ctx.font = H.font('bold', 28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.sheet || 'AI at work?', 0, 64);
    for (let r = 0; r < 4; r++) {
      const y = 116 + r * 62, tick = K.phase(t, b1 + 0.9 + r * 0.9, b1 + 1.2 + r * 0.9);
      H.roundRect(ctx, -110, y, 36, 36, 8); ctx.lineWidth = 4; ctx.strokeStyle = '#2a2f45'; ctx.stroke();
      H.roundRect(ctx, -56, y + 10, 150 - 24 * (r % 2), 14, 7); ctx.fillStyle = '#d5dae8'; ctx.fill();
      if (tick > 0) {
        ctx.strokeStyle = ACC; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(-102, y + 18); ctx.lineTo(-102 + 10 * clamp(tick * 2), y + 18 + 10 * clamp(tick * 2));
        if (tick > 0.5) ctx.lineTo(-92 + 22 * clamp(tick * 2 - 1), y + 28 - 30 * clamp(tick * 2 - 1));
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // respondents: grid of mini heads fills while the counter counts up (right)
  const pc = K.popIn(t, tCount - 0.2, 0.45);
  if (pc > 0) {
    const fill = K.phase(t, tCount, tCount + 1.6, H.easeInOutCubic);
    const cols = 8, rows = 4, gx = 520, gy = 630, sp = 46;
    ctx.save(); ctx.globalAlpha = clamp(pc);
    H.roundRect(ctx, gx - 30, gy - 40, cols * sp + 40, rows * sp + 160, 22); ctx.fillStyle = 'rgba(10,12,22,0.78)'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
    const n = Math.round(fill * cols * rows);
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c, on = i < n, x = gx + c * sp, y = gy + r * sp;
      const col = on ? ['#f2c9a0', '#d8a47c', '#a8754f', '#7a4f33', '#e8b48a'][(i * 7) % 5] : 'rgba(255,255,255,0.10)';
      ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y - 6, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = on ? ['#6f86e0', '#a08be0', '#e0a84f', '#4fb3a6', '#e8786a'][(i * 3) % 5] : 'rgba(255,255,255,0.08)';
      ctx.beginPath(); ctx.ellipse(x, y + 16, 16, 10, 0, Math.PI, 0); ctx.fill();
    }
    const v = Math.round(count * fill);
    ctx.fillStyle = ACC; ctx.font = H.font('display', 64); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    const mid = gx - 30 + (cols * sp + 40) / 2;
    ctx.fillText(v.toLocaleString('en-US'), mid, gy + rows * sp + 50);
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('ui', 26);
    ctx.fillText(P.countLabel || 'respondents', mid, gy + rows * sp + 92);
    ctx.restore();
  }

  // regions: mini globe + dots + pill (bottom left, above the captions)
  const pr = K.popIn(t, tReg - 0.1, 0.45);
  if (pr > 0) {
    const gx = 560, gy = 1045;
    K.drawGlobe(ctx, gx, gy, 0.55 * pr, { t, arcs: 0, shadow: false });
    const R = 80 * 0.55 * pr, cy = gy - 85 * 0.55 * pr;
    for (let i = 0; i < regions; i++) {
      const a = -2.4 + i * 0.75, rr = R * (0.35 + 0.45 * ((i * 37) % 10) / 10);
      const lit = K.popIn(t, tReg + i * 0.1, 0.3);
      if (lit > 0) { H.glow(ctx, gx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 16, ACC, 0.5); ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(gx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 6 * lit, 0, Math.PI * 2); ctx.fill(); }
    }
    K.drawLabel(ctx, gx + 190, gy - 30, pr, { text: P.regionLabel || `${regions} countries`, size: 30, accent: true });
  }
}
