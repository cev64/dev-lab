// Scene "track-sorter-v2" (full frame, kit v2, best as a 2-beat span). Record-store studio. A music partner (generic
// adult, ponytail) winds up and tosses song cards on arcs into three wooden crates (FULLY / PARTLY / NO + "GEN AI");
// each crate squashes on impact and its plate lights up. A generic AI helper (drawAssistant, NOT the mascot) floats in
// for "detection tools", scans an untagged "?" card while the partner shrugs, tags it ("Labeled by YouTube") and the
// card drops into the FULLY crate. Beat 2: a pitch-correction panel (jagged line straightens) and an "AI mastering"
// slider panel pop up and fly on arcs into the NO crate; a heavy stamp winds up and slams "NO GEN AI".
// params: bins, partner, head1, head2, head3, panelA, panelB, stamp, selfBin; cues: partnerCue, fullyCue, partlyCue,
//         noCue, scanCue, nothingCue, selfCue, autoCue, masterCue, bothCue. Text defaults are the v1 texts.
export default function draw(ctx, t, info) {
  const H = info.helpers, K2 = H.kit2, M = H.motion, P = info.params || {};
  const { clamp, lerp, ease } = M;
  const D = info.duration, ACC = info.accent;
  const at = (w, d, n = 0) => { const v = w ? info.timeOf(w, n) : null; return v == null ? d : v; };
  const b2 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.6;
  const T = {
    partner: at(P.partnerCue || 'partners', 0.4), fully: at(P.fullyCue || 'fully', 2.4), partly: at(P.partlyCue || 'partly', 4),
    no: at(P.noCue || 'no', 5.4), scan: at(P.scanCue || 'detection', 9.3), nothing: at(P.nothingCue || 'nothing', 11.7),
    self: at(P.selfCue || 'itself', 13.6), auto: at(P.autoCue || 'Auto-Tune', b2 + 1.1), master: at(P.masterCue || 'mastering', b2 + 4.9),
    both: at(P.bothCue || 'Both', b2 + 6.1),
  };
  const bins = P.bins || [['FULLY', 'GEN AI'], ['PARTLY', 'GEN AI'], ['NO', 'GEN AI']];
  const selfBin = P.selfBin == null ? 0 : P.selfBin;
  const FEET = 1035, PXW = 175, PS = 1.38;              // partner (world)
  const BX = [410, 590, 770], BTOP = 885, BW = 170;      // crates (world)
  const throws = [[T.fully, 0, 'ai'], [T.partly, 1, 'part'], [T.no, 2, 'human']];
  const REL = 0.12, FLY = 0.62;                          // release before the cue, flight time
  const binHit = throws.map(([c]) => c - REL + FLY);
  const tSelfDrop = T.self + 0.75, tSelfLand = tSelfDrop + 0.7;
  const tPanelA = T.master - 0.7, tPanelB = T.both - 0.05, PFLY = 0.75;
  const tStamp = T.both + 0.75;

  // ---------------------------------------------------------------- camera
  const PX = 487, PY = 725;
  const frame = (wx, wy, z, sx, sy) => ({ x: wx - PX - (sx - PX) / z, y: wy - PY - (sy - PY) / z, zoom: z });
  const closeP = frame(PXW, FEET, 1.5, 300, 1046), med = frame(PXW, FEET, 1.12, 140, 1044);
  const det = frame(700, FEET, 1.32, 560, 1046), noBin = frame(BX[2], FEET, 1.3, 700, 1046);
  const cam = K2.cam(t, [
    { t: 0, ...frame(PXW, FEET, 1.58, 320, 1046) }, { t: T.fully - 0.9, ...closeP }, { t: T.fully + 0.2, ...med },
    { t: T.scan - 0.8, ...med }, { t: T.scan + 0.6, ...det }, { t: T.self + 1.6, ...det },
    { t: b2 + 0.2, ...med }, { t: T.both + 0.2, ...med }, { t: tStamp + 0.3, ...noBin }, { t: D, ...frame(BX[2], FEET, 1.34, 700, 1046) },
  ]);
  const W = K2.world2.studio(ctx, { t, cam });
  const L = W.light;

  // ---------------------------------------------------------------- partner acting (pose-to-pose throws)
  const STAND = K2.POSES.stand;
  const WIND = { sN: -0.75, eN: 1.1, sF: 0.35, eF: 0.4, lean: -0.1, tilt: -0.06, handN: 'fist' };
  const THROW = { sN: 2.05, eN: 0.05, sF: -0.3, eF: 0.3, lean: 0.12, tilt: 0.04, handN: 'open' };
  const pkeys = [{ t: 0, v: rest() }];
  for (const [c] of throws) {
    pkeys.push({ t: c - 0.62, v: rest() }, { t: c - 0.3, v: WIND }, { t: c - REL, v: THROW, ease: 'in' }, { t: c + 0.12, v: Object.assign({}, THROW, { sN: 1.75, lean: 0.15 }), ease: 'out' }, { t: c + 0.7, v: rest() });
  }
  const shrug = M.act(t, T.nothing - 0.1, { timing: 'normal', wind: 0.4, exag: 1.3 });
  const cheer = M.act(t, tStamp + 0.15, { timing: 'normal', wind: 0.45, exag: 1.25 });
  let pose = M.keyed(t, pkeys);
  let pose2 = null, poseMix = 0, pExpr = 'happy', pExpr2 = null, pMix = 0, pLook = 0.4;
  if (t > T.nothing - 0.2 && t < tSelfLand + 0.3) { pose2 = 'shrug'; poseMix = clamp(shrug.v) * (1 - ease.inOut((t - tSelfLand + 0.2) / 0.5)); pExpr = 'worried'; pLook = 0.8; }
  if (t > tSelfLand && t < b2) { pExpr = 'happy'; pExpr2 = 'curious'; pMix = 0.5; }
  if (t > T.auto - 0.3 && t < tStamp) { pose2 = 'think'; poseMix = ease.inOut((t - T.auto + 0.3) / 0.5); pExpr = 'thinking'; pLook = 0.55; }
  if (t > tStamp) { pose2 = 'cheer'; poseMix = clamp(cheer.v); pExpr = cheer.phase === 'anticipate' ? 'focused' : 'joy'; pLook = 0.7; }
  let pSquash = 0;
  if (cheer.phase === 'anticipate') pSquash = -0.1 * cheer.wind; else if (cheer.phase === 'action') pSquash = 0.12 * (1 - cheer.k);
  pSquash += M.squashImpact(t, cheer.hit, 0.08, 0.5);
  const jumpY = (tt) => { const a = M.act(tt, tStamp + 0.15, { timing: 'normal', wind: 0.45, exag: 1.25 }); return a.phase === 'action' || a.phase === 'settle' ? -22 * Math.max(0, Math.sin(clamp((tt - a.hit + 0.28) / 0.5) * Math.PI)) : 0; };
  const swing = (tt) => { const p = M.keyed(tt, pkeys); return (p.lean || 0) * 900 + (p.sN || 0) * 40; };

  // ---------------------------------------------------------------- assistant (floaty entrance with anticipation)
  const enter = M.act(t, T.scan - 0.75, { timing: 'floaty', wind: 0.12, overshoot: 0.1 });
  const leave = M.act(t, b2 + 0.3, { timing: 'floaty', wind: 0.2, overshoot: 0 });
  const ax = lerp(1240, 840, enter.v) + 420 * Math.max(0, leave.v) - 30 * leave.wind, ay = 860 + Math.sin(enter.k * Math.PI) * -60 - 120 * Math.sin(clamp(leave.k) * Math.PI * 0.5);
  const scanning = t > T.nothing + 0.25 && t < T.self + 0.15;
  const aHappy = M.act(t, T.self - 0.1, { timing: 'snappy', wind: 0.4, overshoot: 0.25 });
  let aSquash = 0;
  if (t > T.self - 0.1) { if (aHappy.phase === 'anticipate') aSquash = -0.18 * aHappy.wind; else if (aHappy.phase === 'action') aSquash = 0.2; aSquash += M.squashImpact(t, aHappy.hit, 0.18, 0.5); }
  if (enter.phase === 'settle') aSquash += M.squashImpact(t, enter.hit, 0.1, 0.6);

  // mystery card path (world): pops at "nothing", hovers, is tagged, then drops into the self bin on an arc
  const mPop = pop(t, T.nothing - 0.15, { overshoot: 0.25 });
  const mHome = [600, 740];
  const mPos = (tt) => {
    if (tt < tSelfDrop) return [mHome[0] + M.hold(tt, 3, 6), mHome[1] + Math.sin(tt * 2.2) * 8];
    const k = clamp((tt - tSelfDrop) / (tSelfLand - tSelfDrop));
    return M.arc(mHome, [BX[selfBin], BTOP + 10], k, 70, (x) => ease.in(x, 1.7));
  };

  // ================================================================ draw world plane
  W.stage(ctx, () => {
    // crates (behind thrown cards)
    bins.forEach((b, i) => crate(i, b));
    const out = {};
    K2.drawHuman(ctx, PXW, FEET, PS, {
      t, seed: 2, age: 'adult', body: 'average', skin: 3, hair: 1, hairStyle: 'ponytail', eyes: 3, outfit: 'tee', top: '#e0705f', bottom: 'charcoal',
      pose, pose2, poseMix, facing: 0.5, light: L, look: pLook, expr: pExpr, expr2: pExpr2, exprMix: pMix, squash: pSquash, driveY: jumpY, drive: swing,
      talk: 0, out, exag: 1.15,
    });
    // card in hand before each release (a small stack is held in the far hand in between)
    for (const [c, , kind] of throws) {
      if (t > c - 0.9 && t < c - REL && out.hand) { ctx.save(); ctx.translate(out.hand[0], out.hand[1] + 10); ctx.rotate(-0.3 + M.keyed(t, pkeys).sN * 0.4); songCard(0, 0, 0.62, kind); ctx.restore(); }
    }
    if (t < T.no - REL && out.farHand) { ctx.save(); ctx.translate(out.farHand[0] + 6, out.farHand[1] - 4); ctx.rotate(0.15); for (let k = 2; k >= 0; k--) { ctx.save(); ctx.translate(k * 3, -k * 4); songCard(0, 0, 0.55, ['human', 'part', 'ai'][k]); ctx.restore(); } ctx.restore(); }
    // thrown cards: arc from the release point to the crate, spin, stretch along velocity
    throws.forEach(([c, i, kind]) => {
      const k = (t - (c - REL)) / FLY;
      if (k <= 0 || k >= 1) return;
      const p0 = [PXW + 150, 610], p1 = [BX[i], BTOP + 8];
      const f = (kk) => M.arc(p0, p1, kk, 120 + i * 40, (x) => ease.inOut(x, 1.5));
      const p = f(k), q = f(Math.min(1, k + 0.03));
      const st = M.stretchFromVelocity((q[0] - p[0]) / 0.03 / FLY, (q[1] - p[1]) / 0.03 / FLY, 0.00022, 0.3);
      ctx.save(); M.squashTransform(ctx, p[0], p[1], st.s, st.angle); ctx.translate(p[0], p[1]); ctx.rotate(ease.out(k) * Math.PI * 1.5); songCard(0, 0, 0.75, kind); ctx.restore();
    });
    // assistant + scan beam + mystery card
    if (enter.phase !== 'before') {
      if (scanning) {
        const sw = Math.sin((t - T.nothing) * 5) * 26, mp = mPos(t);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(ax - 60, ay - 140, mp[0], mp[1]); g.addColorStop(0, 'rgba(127,243,255,0.45)'); g.addColorStop(1, 'rgba(127,243,255,0.08)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ax - 40, ay - 150); ctx.lineTo(mp[0] + 70, mp[1] - 60 + sw); ctx.lineTo(mp[0] + 70, mp[1] + 60 + sw); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(127,243,255,0.7)'; ctx.fillRect(mp[0] - 62, mp[1] + sw * 1.4 - 2, 124, 4);
        ctx.restore();
      }
      K2.drawAssistant(ctx, ax, ay, 0.8, { t, seed: 9, light: L, facing: -0.7, squash: aSquash, mood: scanning ? 'thinking' : t > T.self ? 'happy' : 'neutral' });
    }
    if (mPop && t < tSelfLand) {
      const mp = mPos(t), k = clamp((t - tSelfDrop) / (tSelfLand - tSelfDrop));
      ctx.save(); ctx.translate(mp[0], mp[1]); ctx.scale(mPop.s * mPop.sx, mPop.s * mPop.sy); ctx.rotate(k * 2.4 + M.hold(t, 7, 0.05));
      K2.glow(ctx, 0, 0, 110, t > T.self ? ACC : '#7ff3ff', 0.18);
      songCard(0, 0, 1.0, t > T.self ? 'ai' : 'blank');
      ctx.restore();
    }
  });
  W.front(ctx);

  // ================================================================ screen-space text
  // "Partner" tag above the partner
  const pl = pop(t, T.partner - 0.12);
  if (pl && t < T.scan) {
    const hp = W.toScreen(PXW, FEET - PS * 400);
    ctx.save(); ctx.globalAlpha = 1 - ease.in((t - T.scan + 0.6) / 0.4); pill(Math.max(130, hp[0]), Math.max(452, hp[1] - 40), pl, P.partner || 'Partner', { size: 28, dot: true }); ctx.restore();
  }
  // header pill (swaps with a squash at the scan cue)
  if (t < b2) {
    const hp = pop(t, 0.15);
    const txt = t < T.scan ? (P.head1 || 'Partners declare AI use') : (P.head2 || 'YouTube checks too');
    const sw = pop(t, T.scan - 0.1, { overshoot: 0.2 });
    const p = t < T.scan || !sw ? hp : sw;
    if (p) pill(t < T.scan ? 620 : 400, 452, p, txt, { size: 32 });
  } else {
    const hp2 = pop(t, b2 + 0.05, { overshoot: 0.2 });
    if (hp2) pill(487, 452, hp2, P.head3 || "Doesn't count as AI", { size: 34, accent: true });
  }
  // detection + mystery labels
  if (enter.phase !== 'before' && t < b2 + 0.2) {
    const dl = pop(t, T.scan + 0.15);
    const asn = W.toScreen(ax, ay - 235);
    if (dl) { ctx.save(); ctx.globalAlpha = 1 - ease.in((t - b2 + 0.1) / 0.3); pill(Math.min(790, asn[0]), Math.max(500, asn[1]), dl, 'Detection tools', { size: 28, accent: true }); ctx.restore(); }
  }
  if (mPop && t < tSelfDrop + 0.5) {
    const mp = W.toScreen(mHome[0], mHome[1] - 105);
    const tagged = t > T.self;
    const tp = tagged ? pop(t, T.self - 0.1, { overshoot: 0.3 }) : mPop;
    ctx.save(); ctx.globalAlpha = 1 - ease.in((t - tSelfDrop) / 0.4);
    if (tp) pill(mp[0], mp[1], tp, tagged ? 'Labeled by YouTube' : 'No label  ?', { size: 26, accent: tagged });
    ctx.restore();
  }
  // beat 2 panels fly into the NO crate
  panel(T.auto - 0.12, tPanelA, 'pitch', P.panelA || 'Pitch correction');
  panel(T.master - 0.12, tPanelB, 'master', P.panelB || 'AI mastering');
  // stamp: rises (anticipation), slams (heavy), squashes, settles
  if (t > tStamp - 0.45) {
    const nb = W.toScreen(BX[2], BTOP - 30);
    const k = t - (tStamp - 0.45);
    let y = nb[1], sc = 1, q = 0, a = clamp(k / 0.15);
    if (t < tStamp) { const u = k / 0.45; y = nb[1] - 120 - 60 * Math.sin(u * Math.PI * 0.5) * (u < 0.7 ? 1 : 1 - (u - 0.7) / 0.3 * 1.6); sc = 1.35 - 0.1 * u; q = u < 0.7 ? -0.08 * u : 0.25; }
    else { q = M.squashImpact(t, tStamp, 0.3, 0.5); }
    if (t > tStamp && t < tStamp + 0.5) { const r = ease.out((t - tStamp) / 0.5); ctx.strokeStyle = H.rgba(ACC, 0.7 * (1 - r)); ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(nb[0], nb[1] + 40, 90 + 120 * r, 26 + 30 * r, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.save(); ctx.globalAlpha = a; ctx.translate(nb[0], y); ctx.rotate(-0.12); const z = M.squash(q); ctx.scale(sc * z.sx, sc * z.sy);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
    H.roundRect(ctx, -132, -42, 264, 84, 18); ctx.fillStyle = 'rgba(14,16,30,0.92)'; ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = ACC; ctx.lineWidth = 6; ctx.stroke();
    ctx.strokeStyle = ACC; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-108, 0); ctx.lineTo(-94, 14); ctx.lineTo(-70, -14); ctx.stroke();
    ctx.font = K2.font.display(34); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.stamp || 'NO GEN AI', 22, 2);
    ctx.restore();
  }

  // ================================================================ helpers
  function rest() { return { sN: 0.15, eN: 0.5, sF: -0.12, eF: 0.35, lean: 0, tilt: 0, handN: 'hold' }; }
  function cardsIn(i) {
    let n = t > binHit[i] ? 1 : 0;
    if (i === selfBin && t > tSelfLand) n++;
    if (i === 2) { if (t > tPanelA + PFLY) n++; if (t > tPanelB + PFLY) n++; }
    return Math.min(3, n);
  }
  function hitsOf(i) {
    const h = [binHit[i]];
    if (i === selfBin) h.push(tSelfLand);
    if (i === 2) h.push(tPanelA + PFLY, tPanelB + PFLY, tStamp);
    return h;
  }
  function crate(i, b) {
    const x = BX[i];
    let sq = 0; for (const h of hitsOf(i)) sq += M.squashImpact(t, h, 0.16, 0.5);
    const lit = clamp((t - binHit[i]) / 0.25);
    const col = i === 0 ? ACC : i === 1 ? '#8fd0ff' : '#eef1f6';
    ctx.save();
    K2.contactShadow(ctx, x, FEET, BW * 1.15, 0.55);
    M.squashTransform(ctx, x, FEET, sq, 0);
    // cards peeking out (behind the front board)
    const n = cardsIn(i);
    for (let k = 0; k < n; k++) { ctx.save(); ctx.translate(x - 44 + k * 40, BTOP + 12 - (k % 2) * 12); ctx.rotate(-0.22 + k * 0.2); songCard(0, 0, 0.62, k === 0 ? kindOf(i) : i === 2 ? 'human' : kindOf(i)); ctx.restore(); }
    if (lit > 0) K2.glow(ctx, x, BTOP + 40, 170, col, 0.22 * lit + 0.18 * Math.max(0, 1 - (t - binHit[i]) / 0.8));
    // wooden crate front (shaded volume, wood texture)
    const m = K2.mat('#8a5a3a', L), path = () => { ctx.beginPath(); ctx.moveTo(x - BW / 2, BTOP); ctx.lineTo(x + BW / 2, BTOP); ctx.lineTo(x + BW / 2 - 12, FEET); ctx.lineTo(x - BW / 2 + 12, FEET); ctx.closePath(); };
    K2.solid(ctx, path, m, [x - BW / 2, BTOP, BW, FEET - BTOP], 1, { rim: 3, ao: 0.3, top: 0.3 });
    ctx.save(); path(); ctx.clip(); K2.texture(ctx, 'wood', x - BW / 2, BTOP, BW, FEET - BTOP, '#2a160c', 0.28, 3 + i); ctx.restore();
    H.roundRect(ctx, x - BW / 2 - 6, BTOP - 8, BW + 12, 16, 7); ctx.fillStyle = '#a8764e'; ctx.fill();
    // label plate lights up
    const pw = BW - 40, py = BTOP + 26, ph = 104;
    H.roundRect(ctx, x - pw / 2, py, pw, ph, 14); ctx.fillStyle = H.mixHex('#1c1f2e', col, 0.9 * lit); ctx.fill();
    ctx.strokeStyle = H.rgba('#ffffff', 0.15 + 0.3 * lit); ctx.lineWidth = 2; ctx.stroke();
    const ink = lit > 0.5 ? '#161927' : '#ffffff';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = K2.font.display(b[0].length > 5 ? 32 : 38); ctx.fillStyle = ink; ctx.fillText(b[0], x, py + 38);
    ctx.font = K2.font.ui(22); ctx.fillStyle = lit > 0.5 ? 'rgba(22,25,39,0.8)' : 'rgba(255,255,255,0.7)'; ctx.fillText(b[1], x, py + 78);
    ctx.restore();
  }
  function kindOf(i) { return i === 0 ? 'ai' : i === 1 ? 'part' : 'human'; }
  function panel(t0, tFly, kind, title) {
    const p = pop(t, t0, { timing: 'normal', wind: 0.3, overshoot: 0.12 });
    if (!p) return;
    const fu = clamp((t - tFly) / PFLY);
    if (fu >= 1) return;
    const home = [487, 660 + M.hold(t, kind === 'pitch' ? 2 : 6, 4)], nb = W.toScreen(BX[2], BTOP + 10);
    // anticipation before the throw: the panel lifts and leans back, then flies on an arc, shrinking
    const pre = t > tFly - 0.25 && t < tFly ? Math.sin(((t - tFly + 0.25) / 0.25) * Math.PI * 0.5) : 0;
    const pos = fu > 0 ? M.arc(home, nb, fu, 110, (x) => ease.in(x, 1.6)) : [home[0], home[1] - 18 * pre];
    const s = p.s * lerp(1, 0.22, ease.in(fu, 1.4));
    const w = 400, h = 210;
    ctx.save(); ctx.translate(pos[0], pos[1]); ctx.rotate(-0.06 * pre + fu * 0.8); ctx.scale(s * p.sx, s * p.sy);
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    H.roundRect(ctx, -w / 2, -h / 2, w, h, 26); ctx.fillStyle = 'rgba(22,25,40,0.96)'; ctx.fill(); ctx.shadowColor = 'transparent';
    const gg = ctx.createLinearGradient(0, -h / 2, 0, 0); gg.addColorStop(0, 'rgba(255,255,255,0.08)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = gg; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.font = K2.font.ui(28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff'; ctx.fillText(title, 0, -h / 2 + 36);
    const lt = t - t0;
    if (kind === 'pitch') {
      const fix = ease.inOut((lt - 0.6) / 1.4);
      ctx.strokeStyle = H.mixHex('#ff6b5e', ACC, fix); ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let k = 0; k <= 40; k++) { const x = -160 + k * 8, jag = (M.hash(k, 11) - 0.5) * 44 * (1 - fix), y = 30 + Math.sin(k * 0.35 + lt * 2) * 22 + jag; if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
      ctx.beginPath(); ctx.arc(150, -h / 2 + 36, 18, 0, Math.PI * 2); ctx.fillStyle = '#3b4260'; ctx.fill();
      const a = -2.2 + 2.6 * fix + M.settle(t, t0 + 2, 0.2, 2, 4); ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(150, -h / 2 + 36); ctx.lineTo(150 + Math.cos(a) * 14, -h / 2 + 36 + Math.sin(a) * 14); ctx.stroke();
    } else {
      for (let k = 0; k < 6; k++) {
        const x = -150 + k * 60;
        H.roundRect(ctx, x - 4, -30, 8, 110, 4); ctx.fillStyle = '#3b4260'; ctx.fill();
        const settleK = ease.inOut((lt - 1.0) / 0.6);
        const v = 0.5 + 0.35 * Math.sin(lt * 2.4 + k * 1.3) * (1 - settleK) + (k % 2 ? 0.05 : -0.05) + M.settle(t, t0 + 1.6 + k * 0.05, 0.05, 2.2, 5);
        const yy = 80 - v * 110;
        H.roundRect(ctx, x - 20, yy - 10, 40, 20, 6); ctx.fillStyle = k === 2 ? ACC : '#dfe4f1'; ctx.fill();
      }
    }
    ctx.restore();
  }
  function songCard(x, y, s, kind) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const base = kind === 'ai' ? ACC : kind === 'part' ? '#8fd0ff' : kind === 'blank' ? '#5b6380' : '#f2f4fa';
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 5;
    const g = ctx.createLinearGradient(-50, -50, 50, 50); g.addColorStop(0, H.mixHex(base, '#ffffff', 0.2)); g.addColorStop(1, H.mixHex(base, '#000000', 0.15));
    H.roundRect(ctx, -50, -50, 100, 100, 16); ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent';
    if (kind === 'part') { ctx.save(); H.roundRect(ctx, -50, -50, 100, 100, 16); ctx.clip(); ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(-50, -50); ctx.lineTo(50, -50); ctx.lineTo(-50, 50); ctx.closePath(); ctx.fill(); ctx.restore(); }
    ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 3; H.roundRect(ctx, -50, -50, 100, 100, 16); ctx.stroke();
    const ink = kind === 'blank' ? '#dfe4f1' : '#161927';
    if (kind === 'blank') { ctx.font = K2.font.display(58); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ink; ctx.fillText('?', 0, 4); }
    else if (kind === 'ai') {
      H.roundRect(ctx, -30, -30, 60, 46, 12); ctx.fillStyle = '#ffffff'; ctx.fill();
      H.roundRect(ctx, -22, -20, 44, 22, 8); ctx.fillStyle = '#161927'; ctx.fill();
      ctx.fillStyle = '#7ff3ff'; ctx.fillRect(-14, -13, 8, 8); ctx.fillRect(6, -13, 8, 8);
      ctx.fillStyle = '#161927'; ctx.font = K2.font.ui(20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('AI', 0, 33);
    } else {
      ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-4, 22); ctx.lineTo(-4, -26); ctx.lineTo(22, -32); ctx.lineTo(22, 14); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-14, 24, 12, 9, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(12, 16, 12, 9, -0.4, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(-46, -46); ctx.lineTo(0, -46); ctx.lineTo(-46, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function pop(tt, t0, o = {}) {
    const a = M.act(tt, t0, Object.assign({ timing: 'snappy', wind: 0.35, overshoot: 0.16 }, o));
    if (a.phase === 'before') return null;
    let sc, q;
    if (a.phase === 'anticipate') { sc = 0.25 * a.wind + 0.02; q = -0.3 * a.wind; }
    else { const w0 = -(o.wind == null ? 0.35 : o.wind) * 0.75; sc = 0.27 + 0.73 * (a.v - w0) / (1 - w0); q = a.phase === 'action' ? 0.2 * (1 - a.k) : M.squashImpact(tt, a.hit, 0.12, 0.42); }
    const z = M.squash(q);
    return { s: Math.max(0.02, sc), sx: z.sx, sy: z.sy, hit: a.hit };
  }
  function pill(x, y, p, text, o = {}) {
    const size = o.size || 26;
    ctx.save(); ctx.translate(x, y); ctx.scale(p.s * (p.sx || 1), p.s * (p.sy || 1));
    ctx.font = K2.font.ui(size);
    const tw = ctx.measureText(text).width, padL = o.dot ? size * 1.35 : size * 0.75, w = tw + padL + size * 0.75, h = size * 1.75;
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
    H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
    if (o.accent) { const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, H.mixHex(ACC, '#ffffff', 0.25)); g.addColorStop(1, H.mixHex(ACC, '#000000', 0.12)); ctx.fillStyle = g; }
    else ctx.fillStyle = 'rgba(14,16,30,0.9)';
    ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = o.accent ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.16)'; ctx.lineWidth = 2; ctx.stroke();
    if (o.dot) { ctx.beginPath(); ctx.arc(-w / 2 + size * 0.78, 0, size * 0.22, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill(); }
    ctx.fillStyle = o.accent ? H.mixHex(ACC, '#000000', 0.68) : '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(text, -w / 2 + padL, 1);
    ctx.restore();
  }
}
