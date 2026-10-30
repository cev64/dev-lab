// Scene "holding-tower" (full frame, 1 beat, ~10-13 s). Night: a holding company's tower (text name pill) stands
// under a big wall board of tiny business tiles (shops, offices, vans) that pop in as a counter counts up to `count`;
// a "formed by" pill lands on formedCue. Then the kit robot (an AI lab stand-in, text name pill only) rises in a light
// beam beside the tower with a "stake" pill, and on sendCue little helper bots fly from it into the tiles, which light
// up in the accent one after another. Ends settled (tiles lit, bots bobbing).
// Fits: holding companies / roll-ups / portfolios ("owns more than N businesses"), an AI lab embedding its staff or
// models in a portfolio, any "one owner, many companies" beat.
// params: name ("Holding co."), formed ("" hides), count (75), countPrefix (""), countSuffix ("+"), countLabel
//         ("businesses"), lab ("AI lab"), stake ("Holds a stake"), send ("Sends teams in"),
//         cues: formedCue (20%), countCue (35%), labCue (60%), sendCue (78%)
// Cues are narration words ("word#n" = the (n+1)th time spoken in the scene) or seconds; else the fractions above.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const TAU = Math.PI * 2;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const tFormed = at(P.formedCue, D * 0.2), tCount = at(P.countCue, D * 0.35), tLab = at(P.labCue, D * 0.6), tSend = at(P.sendCue, D * 0.78);
  const N = Math.max(1, Math.min(90, Number(P.count) || 75));

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 470, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  K.world.city(ctx, { t, time: 'night', groundY: 960 });
  const feet = 1010;

  // ---- tile board (wall of small businesses) ----
  const COLS = 15, ROWS = Math.ceil(N / COLS);
  const BX0 = 80, BX1 = 900, BY0 = 430, CW = (BX1 - BX0 - 32) / COLS, CH = 36;
  const BY1 = BY0 + 70 + ROWS * CH + 16;
  const boardPop = K.popIn(t, tCount - 0.6, 0.45);
  const fill = K.phase(t, tCount - 0.2, tCount + 1.6, H.easeOutCubic);
  const shown = Math.floor(fill * N);
  // which tiles have a bot (lit), in a stable shuffled order
  const order = Array.from({ length: N }, (_, i) => i).sort((a, b) => H.hash(a, 31) - H.hash(b, 31));
  const SEND_DUR = Math.max(1.2, Math.min(3.0, D - (tSend - 0) - 0.8));
  const litN = Math.floor(clamp((t - tSend - 0.6) / SEND_DUR) * N);
  const litSet = new Set(order.slice(0, litN));
  if (boardPop > 0) {
    ctx.save(); ctx.translate((BX0 + BX1) / 2, BY0); ctx.scale(1, boardPop); ctx.translate(-(BX0 + BX1) / 2, -BY0);
    roundRect(ctx, BX0, BY0, BX1 - BX0, BY1 - BY0, 20); ctx.fillStyle = 'rgba(12,14,30,0.92)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.stroke();
    // counter
    const cnt = Math.round(fill * N);
    const pre = P.countPrefix || '', suf = fill >= 1 ? (P.countSuffix ?? '+') : '';
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = H.font('display', 50); ctx.fillStyle = ACC; ctx.fillText(pre + cnt + suf, BX0 + 24, BY0 + 56);
    const w = ctx.measureText(pre + N + (P.countSuffix ?? '+')).width;
    ctx.font = H.font('ui', 30); ctx.fillStyle = '#fff'; ctx.fillText(P.countLabel || 'businesses', BX0 + 40 + w, BY0 + 52);
    for (let i = 0; i < shown; i++) {
      const c = i % COLS, r = Math.floor(i / COLS);
      const x = BX0 + 16 + c * CW + CW / 2, y = BY0 + 70 + r * CH + CH - 6;
      const lit = litSet.has(i);
      const kind = Math.floor(H.hash(i, 17) * 3);
      ctx.fillStyle = lit ? ACC : ['#6b78b8', '#5f9a8c', '#b88a6b'][kind];
      if (kind === 0) {           // little shop with an awning
        ctx.fillRect(x - 15, y - 22, 30, 22); ctx.fillStyle = lit ? H.mixHex(ACC, '#000000', 0.3) : '#d9dcea'; ctx.fillRect(x - 17, y - 28, 34, 7);
      } else if (kind === 1) {    // office block
        ctx.fillRect(x - 11, y - 34, 22, 34); ctx.fillStyle = 'rgba(0,0,0,0.35)'; for (let k = 0; k < 3; k++) ctx.fillRect(x - 6, y - 29 + k * 10, 12, 4);
      } else {                    // house
        ctx.fillRect(x - 13, y - 18, 26, 18); ctx.beginPath(); ctx.moveTo(x - 16, y - 17); ctx.lineTo(x, y - 31); ctx.lineTo(x + 16, y - 17); ctx.fill();
      }
      if (lit) { // tiny bot eyes on the tile
        ctx.fillStyle = '#0d1020'; ctx.fillRect(x - 6, y - 12, 4, 4); ctx.fillRect(x + 2, y - 12, 4, 4);
      }
    }
    ctx.restore();
  }

  // ---- holding tower (left) ----
  const TX = 250, TS = 0.9;
  K.drawBuilding(ctx, TX, feet - 30, TS, { t, color: '#4f5c9a', floors: 5, lit: 0.6, label: '' });
  const tTop = feet - 30 - (60 + 5 * 44) * TS;
  K.drawLabel(ctx, TX, tTop + 60, K.popIn(t, 0.1, 0.4), { text: P.name || 'Holding co.', size: 28, accent: true });
  if (P.formed) {
    const fp = K.popIn(t, tFormed - 0.15, 0.4);
    if (fp > 0) K.drawLabel(ctx, TX + 40, tTop + 112, fp, { text: P.formed, size: 24 });
  }

  // ---- AI lab robot rises in a beam (right) ----
  const RX = 790, RS = 1.1;
  const rise = K.phase(t, tLab - 0.4, tLab + 0.5, H.easeOutCubic);
  if (rise > 0) {
    const beamA = 0.35 * (1 - K.phase(t, tLab + 0.8, tLab + 1.6));
    if (beamA > 0.01) {
      const g = ctx.createLinearGradient(RX, 380, RX, feet); g.addColorStop(0, rgba(ACC, 0)); g.addColorStop(1, rgba(ACC, beamA));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(RX - 40, 380); ctx.lineTo(RX + 40, 380); ctx.lineTo(RX + 130, feet); ctx.lineTo(RX - 130, feet); ctx.closePath(); ctx.fill();
    }
    ctx.save(); ctx.globalAlpha = clamp(rise * 1.5);
    K.drawRobot(ctx, RX, feet + lerp(160, 0, rise), RS, { t, state: t > tSend ? 'working' : 'happy', talk: 0, seed: 3 });
    ctx.restore();
    const lp = K.popIn(t, tLab + 0.1, 0.4);
    if (lp > 0) K.drawLabel(ctx, RX, feet - 225 * RS - 22, lp, { text: P.lab || 'AI lab', size: 28, accent: true });
    const sp = K.popIn(t, tLab + 0.6, 0.4);
    if (sp > 0) K.drawLabel(ctx, 590, 790, sp, { text: P.stake || 'Holds a stake', size: 26, dot: true });
  }
  // ---- helper bots fly into the tiles ----
  if (t > tSend - 0.2 && boardPop > 0) {
    for (let j = 0; j < 6; j++) {
      const s0 = tSend - 0.1 + j * (SEND_DUR / 6), u = (t - s0) / 0.8;
      if (u < 0 || u > 1) continue;
      const idx = order[Math.min(N - 1, Math.floor((j / 6) * N))];
      const c = idx % COLS, r = Math.floor(idx / COLS);
      const tx = BX0 + 16 + c * CW + CW / 2, ty = BY0 + 70 + r * CH + CH - 6;
      const e = H.easeInOutCubic(u);
      const x = lerp(RX, tx, e), y = lerp(feet - 200, ty, e) - Math.sin(e * Math.PI) * 120;
      K.drawRobot(ctx, x, y + 20, 0.22 * (1 - 0.4 * e), { t, state: 'happy', seed: 10 + j });
    }
    const np = K.popIn(t, tSend + 0.2, 0.4);
    if (np > 0) K.drawLabel(ctx, 590, 945, np, { text: P.send || 'Sends teams in', size: 26 });
  }
  ctx.restore();
}
