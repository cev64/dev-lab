// Scene "slice-off" (full frame, best as a 2-beat span). Dusk city: a company tower with a big "pie" of its shares
// floating above it. A wedge (sharePct of the pie) lifts out and glows; a date pill pops; a small vault building
// (the fund) rises from the ground; three cartoon stockholders pop up with "?" bubbles under a
// "Needs stockholder approval" pill; the wedge flies along a dashed arc into the vault; then structure pills
// (e.g. "Owned by the company", "Not a nonprofit") pop. Ends settled (vault door turning slowly, wedge glow).
// Fits: a company setting aside / pledging / carving off a share of itself (equity pledges, spin-offs, foundations).
// params: company ("Company"), fund ("New fund"), share ("10%"), sharePct (10), date ("Date"), llc, notNp, vote,
//         cues: sliceCue (first, else 1.0 s; lift waits for the hook card to clear), dateCue, fundCue, voteCue,
//         flyCue (2nd occurrence of sliceCue by default), landCue, llcCue, npCue (all optional; else fractions)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, rgba, roundRect, mixHex } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const tLift = Math.max(3.0, at(P.sliceCue, 1.0));
  const tDate = at(P.dateCue, D * 0.22);
  const tFund = at(P.fundCue, D * 0.38);
  const tVote = at(P.voteCue, D * 0.5);
  const tFly = at(P.flyCue, at(P.sliceCue, D * 0.62, 1)) - 0.15;
  const tLand = Math.max(tFly + 1.0, at(P.landCue, tFly + 1.4) + 0.1);
  const tLlc = at(P.llcCue, D * 0.84) - 0.2;
  const tNp = at(P.npCue, D * 0.93) - 0.2;
  const pct = P.sharePct || 10;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 520, y: 760 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 990 });

  // --- company tower (name as a text pill on its face, no logo)
  const TX = 280, FEET = 1015;
  K.drawBuilding(ctx, TX, FEET, 1.0, { t, color: '#55609a', floors: 5, lit: 0.55 });
  K.drawLabel(ctx, TX, 858, 1, { text: P.company || 'Company', size: 28, dot: true });

  // --- the share pie above the tower
  const PX = TX, PY = 478, PR = 96;
  const bobY = Math.sin(t * 1.3) * 4;
  const wedgeA = (pct / 100) * Math.PI * 2, a0 = -Math.PI / 2 - wedgeA / 2, a1 = a0 + wedgeA;
  K.glow(ctx, PX, PY + bobY, 170, '#8fa2ff', 0.18);
  const N = 20;
  for (let i = 0; i < N; i++) {
    const s0 = a1 + (i / N) * (Math.PI * 2 - wedgeA), s1 = a1 + ((i + 1) / N) * (Math.PI * 2 - wedgeA);
    ctx.beginPath(); ctx.moveTo(PX, PY + bobY); ctx.arc(PX, PY + bobY, PR, s0, s1); ctx.closePath();
    ctx.fillStyle = i % 2 ? '#c9d2f2' : '#b3bee6'; ctx.fill();
  }
  ctx.beginPath(); ctx.arc(PX, PY + bobY, PR, 0, Math.PI * 2); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.stroke();
  ctx.beginPath(); ctx.arc(PX, PY + bobY, PR * 0.36, 0, Math.PI * 2); ctx.fillStyle = '#9aa7d8'; ctx.fill();
  ctx.font = H.font('ui', 24); ctx.fillStyle = '#2a2f45'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('100%', PX, PY + bobY + 1);

  // --- wedge: sits in place, lifts out at tLift, flies at tFly, lands in the vault at tLand
  const lift = K.phase(t, tLift, tLift + 0.6, H.easeOutBack || H.easeOutCubic);
  const VX = 762, VDOOR = 903;
  const mid = -Math.PI / 2;
  const homeX = PX + Math.cos(mid) * 34 * lift, homeY = PY + bobY + Math.sin(mid) * 34 * lift;
  const arc = K.bezier(homeX, homeY - PR * 0.5, homeX + 170, 330, VX, 480, VX, VDOOR - 10, 40);
  const fu = K.phase(t, tFly, tLand, H.easeInOutCubic);
  // dashed flight path (draws before the flight, fades after landing)
  const pathA = clamp((t - (tFly - 0.8)) / 0.5) * (1 - clamp((t - tLand - 0.4) / 0.6));
  if (pathA > 0) {
    ctx.save(); ctx.globalAlpha = pathA; ctx.strokeStyle = rgba('#ffffff', 0.5); ctx.lineWidth = 4; ctx.setLineDash([4, 16]); ctx.lineCap = 'round';
    K.pathDraw(ctx, arc, 1); ctx.restore();
  }
  let wx = homeX, wy = homeY, ws = 1 + 0.25 * lift, wa = 0;
  if (t >= tFly) { const p = K.pathPoint(arc, fu); wx = p[0]; wy = p[1] + PR * 0.5 * lerp(1, 0.4, fu); ws = lerp(1.25, 0.6, fu); wa = Math.sin(fu * Math.PI) * 0.6; }
  const landed = t >= tLand;
  if (!landed) {
    if (lift > 0) K.glow(ctx, wx, wy - PR * 0.55, 90, ACC, 0.5 * clamp(lift));
    ctx.save(); ctx.translate(wx, wy); ctx.rotate(wa); ctx.scale(ws, ws);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, PR, a0, a1); ctx.closePath();
    ctx.fillStyle = ACC; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = mixHex(ACC, '#ffffff', 0.5); ctx.stroke();
    ctx.restore();
    // share label rides with the wedge
    if (lift > 0) K.drawLabel(ctx, wx + 80, wy - PR * 0.3, Math.min(1.05, clamp(lift * 1.2)), { text: P.share || '10%', size: 34, accent: true });
  }

  // --- vault building rises from the ground at tFund
  const rise = K.phase(t, tFund - 0.1, tFund + 0.9, H.easeOutCubic);
  if (rise > 0) {
    ctx.save();
    ctx.beginPath(); ctx.rect(560, 300, 420, FEET - 300 + 2); ctx.clip();
    ctx.translate(0, (1 - rise) * 280);
    const W = 250, HH = 238, x0 = VX - W / 2, y0 = FEET - HH;
    K.shadow(ctx, VX, FEET, 300);
    roundRect(ctx, x0, y0, W, HH, 14); ctx.fillStyle = '#5d6b86'; ctx.fill();
    ctx.fillStyle = '#4c5870'; ctx.fillRect(x0 + W * 0.68, y0 + 10, W * 0.32 - 4, HH - 10);
    roundRect(ctx, x0 - 12, y0 - 16, W + 24, 26, 8); ctx.fillStyle = '#7b89a6'; ctx.fill();
    for (const cx of [x0 + 26, x0 + W - 26]) { ctx.fillStyle = '#6d7b98'; ctx.fillRect(cx - 9, y0 + 14, 18, HH - 14); }
    // round vault door
    const dy = FEET - 112, glowIn = landed ? clamp((t - tLand) / 0.6) : 0;
    ctx.beginPath(); ctx.arc(VX, dy, 74, 0, Math.PI * 2); ctx.fillStyle = '#3a4459'; ctx.fill();
    ctx.beginPath(); ctx.arc(VX, dy, 64, 0, Math.PI * 2); ctx.fillStyle = mixHex('#8d9ab4', ACC, 0.35 * glowIn); ctx.fill();
    ctx.save(); ctx.translate(VX, dy); ctx.rotate(t * 0.35 + glowIn * 1.2);
    ctx.strokeStyle = '#4a5570'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fillStyle = '#4a5570'; ctx.fill();
    ctx.restore();
    if (glowIn > 0) K.glow(ctx, VX, y0 + 20, 150, ACC, 0.35 * glowIn + 0.05 * Math.sin(t * 3));
    ctx.restore();
    // fund name pill above the vault
    const nk = K.popIn(t, tFund + 0.5, 0.4);
    if (nk > 0) K.drawLabel(ctx, VX - 4, (1 - rise) * 280 + FEET - 238 - 28, Math.min(1.05, nk), { text: P.fund || 'New fund', size: 24, accent: true });
    if (landed) {
      const lk = K.popIn(t, tLand + 0.1, 0.4);
      if (lk > 0) K.drawLabel(ctx, VX, FEET - 112 + 30, Math.min(1.05, lk), { text: (P.share || '10%') + ' inside', size: 30, accent: true });
    }
  }

  // --- date pill
  const dk = K.popIn(t, tDate - 0.1, 0.4);
  if (dk > 0) K.drawLabel(ctx, 700, 425, Math.min(1.05, dk), { text: P.date || 'Date', size: 28, dot: true });

  // --- stockholders pop up in the foreground with "?" bubbles
  const people = [{ x: 450, sk: 1, hr: 0, sh: '#6f86e0', hs: 'short' }, { x: 535, sk: 3, hr: 1, sh: '#e8786a', hs: 'long' }, { x: 618, sk: 2, hr: 4, sh: '#4fb3a6', hs: 'bun' }];
  people.forEach((p, i) => {
    const pk = K.phase(t, tVote + i * 0.15, tVote + i * 0.15 + 0.5, H.easeOutCubic);
    if (pk <= 0) return;
    const yy = 1040 + (1 - pk) * 260;
    const thinking = t < tLand + 0.4;
    K.drawPerson(ctx, p.x, yy, 0.9, { t, pose: thinking ? 'shrug' : (i === 1 ? 'point' : 'stand'), mood: 'neutral', skin: p.sk, hair: p.hr, shirt: p.sh, hairStyle: p.hs, seed: i * 3 + 1, look: 0.6 });
    const bk = K.popIn(t, tVote + 0.6 + i * 0.2, 0.35) * (1 - clamp((t - tLand - 0.3) / 0.4));
    if (bk > 0.02 && i === 1) K.drawSpeechBubble(ctx, p.x + 18, yy - 226, 1, { text: '?', size: 30, tail: 'left', pop: Math.min(1.05, bk) });
  });
  const vk = K.popIn(t, tVote + 0.3, 0.4);
  if (vk > 0) K.drawLabel(ctx, 520, 690, Math.min(1.05, vk), { text: P.vote || 'Needs stockholder approval', size: 26, dot: true });

  // --- structure pills
  const lk2 = K.popIn(t, tLlc, 0.4), nk2 = K.popIn(t, tNp, 0.4);
  if (lk2 > 0) K.drawLabel(ctx, 640, 528, Math.min(1.05, lk2), { text: P.llc || 'Owned by the company', size: 26 });
  if (nk2 > 0) {
    K.drawLabel(ctx, 640, 600, Math.min(1.05, nk2), { text: P.notNp || 'Not a nonprofit', size: 26 });
    // small red cross badge on the pill's left
    ctx.save(); ctx.translate(640 - 150, 600 - 23); ctx.scale(Math.min(1.05, nk2), Math.min(1.05, nk2));
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fillStyle = '#ff6b5e'; ctx.fill();
    ctx.strokeStyle = '#2a0e0c'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-7, -7); ctx.lineTo(7, 7); ctx.moveTo(7, -7); ctx.lineTo(-7, 7); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
