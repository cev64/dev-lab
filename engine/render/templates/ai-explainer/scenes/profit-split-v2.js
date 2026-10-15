// Scene "profit-split-v2" (full frame, kit v2 + motion.js). The night office (world2.office time night): coins ride a
// conveyor into a sorting machine whose flipper (snappy, with overlap) tosses each coin on an arc into a glass PROFIT
// jar or a COSTS bin (share = margin); each landing squashes. At splitCue the jar's percentage counts up. At beatCue an
// "Analysts expected ..." panel pops at the top and a big rubber stamp winds up, slams down heavily (squash, panel
// shake) and leaves a BEAT mark; the worker fist-pumps. At hpcCue the panel turns into a share donut with its label.
// params: margin, marginText, jar, bin, forecastHead, forecast, stamp, share, shareText, shareLabel, shareSub,
//         cues splitCue, beatCue, hpcCue (as v1 profit-split).
export default function draw(ctx, t, info) {
  const H = info.helpers, K2 = H.kit2, M = H.motion, P = info.params || {};
  const { clamp, lerp, ease } = M;
  const D = info.duration, ACC = info.accent;
  const cue = (w, fb) => { const v = w != null ? info.timeOf(w) : null; return v != null ? v : fb; };
  const splitAt = cue(P.splitCue, D * 0.1), beatAt = cue(P.beatCue, D * 0.35), hpcAt = cue(P.hpcCue, D * 0.6);
  const aiAt = cue('AI', hpcAt + 4.5);
  const margin = P.margin != null ? +P.margin : 0.511;

  const ck = (tt, x, z) => ({ t: tt, x, y: 305 - 318 / z, zoom: z });
  const cam = K2.cam(t, [ck(0, 60, 1.16), ck(splitAt + 1.6, 40, 1.12), ck(beatAt - 0.2, 30, 1.1), ck(beatAt + 0.7, 30, 1.14), ck(hpcAt + 0.5, 20, 1.08), ck(D, 15, 1.1)]);
  const W = K2.world2.office(ctx, { t, cam, time: 'night' });
  const L = W.light;

  const BELT = { x0: -200, x1: 400, y: 790 }, SORT = { x: 452, y: 790 };
  const JAR = { x: 660, top: 800, bot: 1020, w: 220 }, BIN = { x: 235, top: 905, bot: 1025, w: 200 };
  const SP = 0.3, RIDE = 1.5, FLY = 0.62;
  const coins = [];
  const nNow = Math.floor((t + 3) / SP);
  let inJar = 0, inBin = 0, lastJar = -9, lastBin = -9, lastFlip = -9, lastDir = 1;
  for (let i = 0; i <= nNow; i++) {
    const st = -3 + i * SP, toJar = H.hash(i, 77) < margin, tFlip = st + RIDE, tLand = tFlip + FLY;
    if (t >= tLand) { if (toJar) { inJar++; lastJar = tLand; } else { inBin++; lastBin = tLand; } }
    if (t >= tFlip - 0.12 && tFlip > lastFlip) { lastFlip = tFlip; lastDir = toJar ? 1 : -1; }
    if (t >= st && t < tLand + 0.2) coins.push({ i, st, toJar, tFlip, tLand });
  }

  // ---------------------------------------------------------------- worker (right, next to the jar)
  const WX = 838, WS = 1.38;
  const pt = M.act(t, splitAt + 0.3, { timing: 'normal', wind: 0.3 });
  const fist = M.act(t, beatAt + 0.95, { timing: 'snappy', wind: 0.5, exag: 1.3 });
  const turn = M.act(t, hpcAt - 0.2, { timing: 'normal', wind: 0.3 });
  let pose = 'stand', pose2 = 'present', poseMix = 0, look = -0.5, expr = 'neutral', expr2 = 'happy', exprMix = 0, squash = 0, exag = 1, nod = 0, facing = -0.5;
  poseMix = clamp(pt.v) * (1 - ease.inOut((t - (splitAt + 2.2)) / 0.5)); exprMix = clamp(pt.v);
  if (t > beatAt - 0.2) { look = -0.3; expr = 'curious'; expr2 = null; nod = -0.1 * ease.inOut((t - beatAt + 0.2) / 0.4); }
  if (fist.phase !== 'before') {
    pose = 'stand'; pose2 = { sN: 2.25, eN: 0.95, sF: -0.1, eF: 0.3, handN: 'fist', handF: 'relax', lean: -0.04, nod: -0.15 }; poseMix = clamp(fist.v) * (1 - ease.inOut((t - (hpcAt - 0.6)) / 0.4)); exag = 1.3;
    expr = 'joy'; expr2 = 'happy'; exprMix = ease.inOut((t - beatAt - 2.0) / 0.6);
    squash = fist.phase === 'anticipate' ? -0.08 * fist.wind : M.squashImpact(t, fist.hit, 0.1, 0.45);
    nod = 0;
  }
  if (turn.phase !== 'before' && t > hpcAt - 0.2) {
    pose = 'stand'; pose2 = 'think'; poseMix = clamp(turn.v); expr = 'thinking'; expr2 = 'happy'; exprMix = 0.3 + 0.4 * Math.sin(clamp((t - aiAt) / 1) * Math.PI); look = -0.55; exag = 1;
    squash = turn.phase === 'anticipate' ? -0.04 * turn.wind : 0;
    if (t > aiAt - 0.2) { const n2 = M.act(t, aiAt - 0.2, { timing: 'normal', wind: 0.3 }); pose = 'think'; pose2 = 'present'; poseMix = clamp(n2.v); expr = 'happy'; expr2 = 'smirk'; exprMix = 0.5; }
  }

  // ---------------------------------------------------------------- draw the stage
  W.stage(ctx, () => {
    // COSTS bin
    const binSq = M.squashImpact(t, lastBin, 0.05, 0.3);
    ctx.save(); M.squashTransform(ctx, BIN.x, BIN.bot, binSq, 0);
    K2.contactShadow(ctx, BIN.x, BIN.bot, BIN.w + 40, 0.55, 0.12);
    const binFill = clamp(inBin / 46, 0.05, 0.8), bh = BIN.bot - BIN.top;
    K2.solid(ctx, () => { ctx.beginPath(); ctx.roundRect(BIN.x - BIN.w / 2, BIN.top, BIN.w, bh, 14); }, K2.mat('#4a4466', L), [BIN.x - BIN.w / 2, BIN.top, BIN.w, bh], L.dir, { rim: 3, ao: 0.3, top: 0.15 });
    ctx.fillStyle = 'rgba(160,150,200,0.35)'; ctx.beginPath(); ctx.roundRect(BIN.x - BIN.w / 2 + 10, BIN.top + 10 + (bh - 20) * (1 - binFill), BIN.w - 20, (bh - 20) * binFill, 8); ctx.fill();
    K2.solid(ctx, () => { ctx.beginPath(); ctx.roundRect(BIN.x - BIN.w / 2 - 10, BIN.top - 14, BIN.w + 20, 22, 8); }, K2.mat('#5d5680', L), [BIN.x - BIN.w / 2 - 10, BIN.top - 14, BIN.w + 20, 22], L.dir, { rim: 2, top: 0.5 });
    ctx.font = K2.font.display(30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e3ddf6'; ctx.fillText(P.bin || 'COSTS', BIN.x, BIN.top + 62);
    ctx.restore();
    // conveyor (legs, belt with moving treads, rollers)
    for (const lx of [-40, 140, 330]) { K2.limb(ctx, [lx, BELT.y + 20], [lx, 1022], 9, 9, K2.mat('#2c3146', L), L.dir); K2.contactShadow(ctx, lx, 1024, 50, 0.4); }
    K2.solid(ctx, () => { ctx.beginPath(); ctx.roundRect(BELT.x0, BELT.y, BELT.x1 - BELT.x0, 28, 14); }, K2.mat('#3b4166', L), [BELT.x0, BELT.y, BELT.x1 - BELT.x0, 28], L.dir, { rim: 2, top: 0.4 });
    for (let i = 0; i < 16; i++) { const x = BELT.x0 + 10 + ((i * 40 + t * (BELT.x1 - BELT.x0) / RIDE) % (BELT.x1 - BELT.x0 - 20)); ctx.fillStyle = 'rgba(140,150,200,0.45)'; ctx.fillRect(x, BELT.y + 7, 18, 12); }
    // PROFIT jar back + pile
    const jarSq = M.squashImpact(t, lastJar, 0.04, 0.3);
    ctx.save(); M.squashTransform(ctx, JAR.x, JAR.bot, jarSq, 0);
    K2.contactShadow(ctx, JAR.x, JAR.bot + 6, JAR.w + 50, 0.55, 0.12);
    ctx.fillStyle = 'rgba(170,210,255,0.12)'; ctx.beginPath(); ctx.roundRect(JAR.x - JAR.w / 2, JAR.top, JAR.w, JAR.bot - JAR.top, 30); ctx.fill();
    const jarFill = clamp(0.18 + inJar / 60, 0.04, 0.85), jy = JAR.bot - 8 - (JAR.bot - JAR.top - 16) * jarFill;
    ctx.save(); ctx.beginPath(); ctx.roundRect(JAR.x - JAR.w / 2 + 7, JAR.top + 7, JAR.w - 14, JAR.bot - JAR.top - 14, 24); ctx.clip();
    const g = ctx.createLinearGradient(0, jy, 0, JAR.bot); g.addColorStop(0, '#ffe08a'); g.addColorStop(0.3, '#e8b93a'); g.addColorStop(1, '#8a5a12');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(JAR.x - JAR.w / 2, JAR.bot);
    for (let i = 0; i <= 10; i++) ctx.lineTo(JAR.x - JAR.w / 2 + JAR.w * i / 10, jy - 5 * Math.abs(Math.sin(i * 1.9)) + M.settle(t, lastJar, 2, 3, 6) * Math.sin(i));
    ctx.lineTo(JAR.x + JAR.w / 2, JAR.bot); ctx.closePath(); ctx.fill();
    for (let yy = JAR.bot - 16; yy > jy + 8; yy -= 20) for (let xx = 0; xx < 6; xx++) { ctx.fillStyle = 'rgba(120,70,10,0.28)'; ctx.beginPath(); ctx.ellipse(JAR.x - 95 + xx * 38 + (Math.round(yy / 20) % 2) * 16, yy, 15, 5.5, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore(); ctx.restore();
    // coins
    for (const c of coins) {
      let x, y, sq = 0, ang = 0, spin = t * 6 + c.i;
      if (t < c.tFlip) { const u = (t - c.st) / RIDE; x = lerp(BELT.x0 + 30, SORT.x - 30, u); y = BELT.y + 2 - Math.abs(Math.sin(u * 14)) * 2; spin = 0.2; }
      else if (t < c.tLand) {
        const k = (t - c.tFlip) / FLY, to = c.toJar ? [JAR.x + (H.hash(c.i, 5) - 0.5) * 90, JAR.bot - 40 - (JAR.bot - JAR.top - 16) * clamp(0.18 + inJar / 60, 0, 0.85) * 0.9] : [BIN.x + (H.hash(c.i, 5) - 0.5) * 90, BIN.top + 30];
        const p = M.arc([SORT.x, SORT.y - 60], to, k, c.toJar ? 90 : -90, (x2) => ease.inOut(x2, 1.3)), q = M.arc([SORT.x, SORT.y - 60], to, Math.min(1, k + 0.03), c.toJar ? 90 : -90, (x2) => ease.inOut(x2, 1.3));
        x = p[0]; y = p[1]; const st = M.stretchFromVelocity((q[0] - p[0]) * 30, (q[1] - p[1]) * 30, 0.0005, 0.35); sq = st.s; ang = st.angle;
      } else { const k = c.toJar ? 1 : 1; x = c.toJar ? JAR.x + (H.hash(c.i, 5) - 0.5) * 90 : BIN.x + (H.hash(c.i, 5) - 0.5) * 90; y = c.toJar ? JAR.bot - 40 - (JAR.bot - JAR.top - 16) * clamp(0.18 + (inJar - 1) / 60, 0, 0.85) * 0.9 : BIN.top + 30; sq = M.squashImpact(t, c.tLand, 0.5, 0.2); spin = 0; if (c.toJar === false) continue; }
      ctx.save(); M.squashTransform(ctx, x, y, sq, ang); K2.drawCoin(ctx, x, y + 18, 0.5, { spin, shadow: false, light: L }); ctx.restore();
    }
    // jar glass front
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(210,235,255,0.6)'; ctx.beginPath(); ctx.roundRect(JAR.x - JAR.w / 2, JAR.top, JAR.w, JAR.bot - JAR.top, 30); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.13)'; ctx.beginPath(); ctx.roundRect(JAR.x - JAR.w / 2 + 16, JAR.top + 22, 14, JAR.bot - JAR.top - 44, 7); ctx.fill();
    K2.solid(ctx, () => { ctx.beginPath(); ctx.roundRect(JAR.x - 74, JAR.top - 24, 148, 28, 10); }, K2.mat('#8fa6c8', L), [JAR.x - 74, JAR.top - 24, 148, 28], L.dir, { rim: 2, top: 0.5 });
    // sorter machine + flipper (snappy flip toward the coin's target, overlapping settle)
    K2.limb(ctx, [SORT.x, SORT.y + 70], [SORT.x, 1022], 14, 14, K2.mat('#2c3146', L), L.dir); K2.contactShadow(ctx, SORT.x, 1024, 90, 0.45);
    K2.solid(ctx, () => { ctx.beginPath(); ctx.roundRect(SORT.x - 62, SORT.y - 92, 124, 160, 20); }, K2.mat('#5a68ad', L), [SORT.x - 62, SORT.y - 92, 124, 160], L.dir, { rim: 3, ao: 0.25, top: 0.2 });
    ctx.fillStyle = '#10142c'; ctx.beginPath(); ctx.roundRect(SORT.x - 42, SORT.y - 72, 84, 44, 10); ctx.fill();
    const blink = t - lastFlip < 0.25;
    ctx.fillStyle = blink ? (lastDir > 0 ? ACC : '#b9b2e0') : '#4a5280'; ctx.beginPath(); ctx.arc(SORT.x, SORT.y - 50, 11, 0, Math.PI * 2); ctx.fill();
    if (blink) K2.glow(ctx, SORT.x, SORT.y - 50, 50, lastDir > 0 ? ACC : '#b9b2e0', 0.5);
    const fa = M.act(t, lastFlip - 0.12, { timing: 'snappy', wind: 0.4 });
    const ang = lastDir * 0.6 * (fa.phase === 'done' ? 1 : fa.v) + M.settle(t, fa.hit, 0.12, 3, 5) * lastDir;
    ctx.save(); ctx.translate(SORT.x, SORT.y + 66); ctx.rotate(ang);
    K2.solid(ctx, () => { ctx.beginPath(); ctx.roundRect(-8, -4, 70, 14, 7); }, K2.mat('#c7cde6', L), [-8, -4, 70, 14], L.dir, { rim: 2 });
    ctx.restore();
    // worker
    K2.drawHuman(ctx, WX, 1030, WS, {
      t, seed: 12, age: 'adult', outfit: 'office', top: '#e9edf5', bottom: 'navy', tie: ACC, hairStyle: 'bun', hair: 1, skin: 1, eyes: 1,
      pose, pose2, poseMix, facing, look, expr, expr2, exprMix, squash, nod, exag, light: L,
      driveY: (tt) => { const f = M.act(tt, beatAt + 0.95, { timing: 'snappy', wind: 0.5, exag: 1.3 }); return f.phase === 'action' ? -20 * Math.sin(f.k * Math.PI) : 0; },
    });
  });
  W.front(ctx);

  // ---------------------------------------------------------------- overlays
  // jar percentage (counts up at splitCue), attached to the jar
  const js = W.toScreen(JAR.x, JAR.top + 70);
  const sp = M.act(t, splitAt - 0.12, { timing: 'snappy', wind: 0.3, overshoot: 0.16 });
  if (sp.phase === 'anticipate') K2.glow(ctx, js[0], js[1], 70, ACC, 0.5 * sp.wind);
  else if (sp.phase !== 'before') {
    const pct = margin * 100 * ease.out(clamp((t - splitAt) / 1.4), 3);
    ctx.save(); ctx.translate(js[0], js[1]); const v = Math.max(0, sp.v); ctx.scale(v, v);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
    ctx.fillStyle = 'rgba(8,10,24,0.9)'; ctx.beginPath(); ctx.roundRect(-108, -48, 216, 96, 22); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ACC; ctx.font = K2.font.display(46);
    ctx.fillText(t > splitAt + 1.4 ? (P.marginText || '51.1%') : pct.toFixed(1) + '%', 0, -8);
    ctx.font = K2.font.ui(22); ctx.fillStyle = '#ffffff'; ctx.fillText(P.jar || 'PROFIT', 0, 28);
    ctx.restore();
  }
  // forecast panel + stamp, then the donut
  const PX = 430, PY = 548;
  const fIn = M.act(t, beatAt - 0.14, { timing: 'snappy', wind: 0.3, overshoot: 0.12 }), toDonut = ease.inOut((t - (hpcAt - 0.35)) / 0.35);
  const stampA = M.act(t, beatAt + 0.35, { timing: 'heavy', wind: 0.6, overshoot: 0.0 });
  const shake = stampA.phase === 'settle' || stampA.phase === 'done' ? M.settle(t, stampA.hit, 7, 4, 7) : 0;
  if (fIn.phase !== 'before' && toDonut < 1) {
    ctx.save(); ctx.globalAlpha = 1 - toDonut;
    ctx.save(); ctx.translate(PX, PY + shake);
    const v = fIn.phase === 'anticipate' ? 0.08 : Math.max(0, fIn.v), q = M.squashImpact(t, stampA.hit, 0.06, 0.4);
    ctx.scale(v * (1 / (1 + q)), v * (1 + q));
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
    ctx.fillStyle = 'rgba(8,10,24,0.9)'; ctx.beginPath(); ctx.roundRect(-330, -62, 660, 124, 26); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.72)'; ctx.font = K2.font.ui(24); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.forecastHead || 'Analysts expected profit of', -300, -22);
    ctx.fillStyle = '#ffffff'; let fs = 40; ctx.font = K2.font.display(fs); const ft = P.forecast || 'NT$746.34 billion'; while (ctx.measureText(ft).width > 400 && fs > 26) { fs--; ctx.font = K2.font.display(fs); } ctx.fillText(ft, -300, 22);
    ctx.restore();
    stamp(ctx, K2, M, t, PX + 230, PY + 6 + shake, stampA, P.stamp || 'BEAT', ACC);
    ctx.restore();
  }
  const dIn = M.act(t, hpcAt - 0.14, { timing: 'snappy', wind: 0.3, overshoot: 0.12 });
  if (dIn.phase === 'anticipate') K2.glow(ctx, 430, 548, 120, ACC, 0.4 * dIn.wind);
  else if (dIn.phase !== 'before') {
    ctx.save(); ctx.translate(430, 548); const v = Math.max(0, dIn.v); ctx.scale(v, v);
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
    ctx.fillStyle = 'rgba(8,10,24,0.9)'; ctx.beginPath(); ctx.roundRect(-360, -108, 720, 216, 28); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,225,74,0.35)'; ctx.stroke();
    const share = P.share != null ? +P.share : 0.68, sw = ease.out(clamp((t - hpcAt - 0.15) / 1.3), 3);
    const dx = -250;
    ctx.lineWidth = 34; ctx.strokeStyle = '#2f3560'; ctx.beginPath(); ctx.arc(dx, 0, 66, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = ACC; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(dx, 0, 66, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * share * sw); ctx.stroke(); ctx.lineCap = 'butt';
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = K2.font.display(34);
    ctx.fillText(sw >= 1 ? (P.shareText || '68%') : Math.round(share * 100 * sw) + '%', dx, 2);
    ctx.textAlign = 'left';
    const l1 = P.shareLabel || 'of sales: high-performance computing'; const l2 = P.shareSub || 'the category that includes AI chips';
    const words = l1.split(' '); const lines = []; let cur = '';
    ctx.font = K2.font.bold(32);
    for (const w of words) { const n = cur ? cur + ' ' + w : w; if (ctx.measureText(n).width > 480 && cur) { lines.push(cur); cur = w; } else cur = n; }
    lines.push(cur);
    lines.forEach((ln, i) => ctx.fillText(ln, -150, -40 + i * 40));
    ctx.fillStyle = ACC; ctx.font = K2.font.ui(23); ctx.fillText(l2, -150, -40 + lines.length * 40 + 8);
    ctx.restore();
  }
}

// rubber stamp: winds up (rises, tilts back), slams down (heavy, stretched), squashes on impact, lifts off; the mark stays
function stamp(ctx, K2, M, t, x, y, a, text, ACC) {
  if (a.phase === 'before') return;
  const { clamp, ease } = M;
  // the mark (after the hit)
  if (t >= a.hit) {
    const k = clamp((t - a.hit) / 0.12);
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.16); ctx.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k); ctx.globalAlpha = k;
    ctx.strokeStyle = '#3ad17a'; ctx.lineWidth = 7; ctx.beginPath(); ctx.roundRect(-108, -44, 216, 88, 14); ctx.stroke();
    ctx.fillStyle = '#3ad17a'; ctx.font = K2.font.display(46); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 14, 2);
    ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(-76, 14); ctx.lineTo(-56, -14); ctx.stroke();
    ctx.restore();
  }
  // the stamp body
  let dy, rot, sq;
  let lift = 0;
  if (a.phase === 'anticipate') { dy = -130 - 45 * a.wind; rot = -0.25 * a.wind; sq = -0.08 * a.wind; }
  else if (a.phase === 'action') { dy = -175 * (1 - ease.in(a.k, 2.2)); rot = -0.25 * (1 - a.k); sq = 0.22 * a.k; }
  else { lift = clamp((t - a.hit - 0.35) / 0.5); dy = -120 * ease.inOut(lift); rot = 0.1 * lift; sq = M.squashImpact(t, a.hit, 0.25, 0.4); if (lift >= 1) return; }
  const al = a.phase === 'anticipate' ? clamp(a.wind * 2) : 1 - ease.in(lift);
  ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y + 40 + dy); ctx.rotate(rot); M.squashTransform(ctx, 0, 0, sq, 0);
  const m = K2.mat('#8a5a3a'), r = K2.mat('#d84a4a'), k = K2.mat('#3a2a22');
  K2.solid(ctx, () => { ctx.beginPath(); ctx.roundRect(-96, -26, 192, 26, 6); }, r, [-96, -26, 192, 26], -1, { rim: 2 });
  K2.solid(ctx, () => { ctx.beginPath(); ctx.roundRect(-84, -78, 168, 54, 10); }, m, [-84, -78, 168, 54], -1, { rim: 3, top: 0.3 });
  K2.limb(ctx, [0, -78], [0, -130], 16, 14, m, -1);
  K2.solid(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -150, 40, 30, 0, 0, Math.PI * 2); }, k, [-40, -180, 80, 60], -1, { rim: 3, top: 0.3 });
  ctx.restore();
}
