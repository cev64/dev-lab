// Scene "jury-pledge" (full frame). A festival jury room at night: a banner with the festival name (text only),
// five generic cartoon jurors behind a long table with ballots. On toldCue a submission envelope with an
// "AI disclosure" tag slides onto the table; on countCue a signature counter card counts up to `count` while a
// pledge sheet on the wall fills with squiggled signatures; on pledgeCue the sheet's line types in with a
// "no AI" badge (robot head in a circle-slash) and the ballots get small crosses; on stampCue a stamp lands on
// the sheet (e.g. "CODE TOO") with a code chip.
// params: festival, count (19), countLabel ("jurors signed"), pledge, stamp ("CODE TOO"), envelope ("Submission"),
//         envTag ("AI disclosure"), toldCue, countCue, pledgeCue, stampCue (narration words, "word#n", or seconds)
// Fits: award juries / panels taking a stance, a pledge or boycott that grows by signatures, voting rules.
// Jurors are generic cartoons and fewer than the real count (symbolic); never depict or name real jurors.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const RED = '#ff5e57';
  const tTold = at(P.toldCue, 0.3) - 0.2, tCount = at(P.countCue, D * 0.3) - 0.2;
  const tPledge = at(P.pledgeCue, D * 0.42) - 0.1, tStamp = at(P.stampCue, D * 0.88) - 0.25;
  const N = Math.max(1, Math.round(+P.count || 19));

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 470, y: 820 }, { t: tCount, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 500, y: 715 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true, plant: true });
  // spotlights on the wall
  K.glow(ctx, 300, 600, 300, '#7f8bff', 0.06); K.glow(ctx, 690, 640, 300, ACC, 0.05);

  // ---- banner
  roundRect(ctx, 150, 452, 690, 62, 14); ctx.fillStyle = '#3b2f6b'; ctx.fill();
  ctx.fillStyle = ACC; ctx.fillRect(150, 506, 690, 8);
  const fb = H.fitText(ctx, String(P.festival || 'GAMES FESTIVAL').toUpperCase(), 'ui', 30, 18, 640);
  ctx.font = fb.font; ctx.letterSpacing = '2px'; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(fb.text, 495, 484); ctx.letterSpacing = '0px';

  // ---- pledge sheet on the wall (right)
  const SX0 = 505, SX1 = 845, SY0 = 535, SY1 = 800;
  ctx.save(); ctx.translate(680, 540); ctx.rotate(0.015); ctx.translate(-680, -540);
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; roundRect(ctx, SX0 + 8, SY0 + 10, SX1 - SX0, SY1 - SY0, 10); ctx.fill();
  roundRect(ctx, SX0, SY0, SX1 - SX0, SY1 - SY0, 10); ctx.fillStyle = '#f4f1e6'; ctx.fill();
  ctx.fillStyle = '#e8786a'; ctx.beginPath(); ctx.arc((SX0 + SX1) / 2, SY0 + 10, 9, 0, Math.PI * 2); ctx.fill();
  ctx.font = H.font('ui', 22); ctx.fillStyle = '#3b4672'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.letterSpacing = '2px';
  ctx.fillText('JURORS\' PLEDGE', SX0 + 22, SY0 + 46); ctx.letterSpacing = '0px';
  // pledge line types in
  const pledge = String(P.pledge || 'No votes for games made with generative AI');
  const pk = clamp((t - tPledge) / 1.6);
  if (pk > 0) {
    const lines = H.wrap(ctx, pledge, 'bold', 23, SX1 - SX0 - 104).slice(0, 3);
    const shown = Math.floor(pledge.length * pk); let used = 0;
    ctx.font = H.font('bold', 23); ctx.fillStyle = '#141829';
    lines.forEach((ln, i) => { const n = clamp(shown - used, 0, ln.length); used += ln.length + 1; if (n > 0) ctx.fillText(ln.slice(0, n), SX0 + 22, SY0 + 82 + i * 28); });
    // no-AI badge
    const nb = K.popIn(t, tPledge + 0.4, 0.4);
    if (nb > 0) noAiBadge(ctx, SX1 - 46, SY0 + 92, 34 * Math.min(1.05, nb), RED);
  } else {
    ctx.fillStyle = '#d5dae8'; for (let i = 0; i < 3; i++) { roundRect(ctx, SX0 + 22, SY0 + 70 + i * 26, 220 - i * 40, 9, 4); ctx.fill(); }
  }
  // signatures fill the lower half as the counter runs
  const ck = clamp((t - tCount) / 2.2);
  const nSig = Math.floor(N * ck);
  for (let i = 0; i < nSig; i++) {
    const c = i % 5, r = Math.floor(i / 5);
    const x = SX0 + 30 + c * 60, y = SY0 + 178 + r * 20;
    ctx.save(); ctx.strokeStyle = '#2a3a8a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath();
    for (let k = 0; k <= 10; k++) { const u = k / 10; const yy = y + Math.sin(u * 9 + i) * 5 * (0.6 + H.hash(i, 2) * 0.6); if (k === 0) ctx.moveTo(x + u * 44, yy); else ctx.lineTo(x + u * 44, yy); }
    ctx.stroke(); ctx.restore();
  }
  ctx.restore();

  // ---- jurors behind the table
  const TY = 905, jur = [
    { x: 210, skin: 0, hair: 3, hs: 'bun', shirt: 3 }, { x: 350, skin: 4, hair: 0, hs: 'short', shirt: 1 },
    { x: 490, skin: 2, hair: 1, hs: 'curly', shirt: 4 }, { x: 630, skin: 1, hair: 4, hs: 'long', shirt: 2 },
    { x: 770, skin: 3, hair: 0, hs: 'none', shirt: 0 }];
  jur.forEach((j, i) => {
    const react = t > tStamp + 0.2 ? 'neutral' : t > tPledge ? 'neutral' : 'happy';
    K.drawPerson(ctx, j.x, 1010, 1.0, { t, pose: 'sit', seat: true, mood: react, look: (487 - j.x) / 500, skin: j.skin, hair: j.hair, hairStyle: j.hs, shirt: j.shirt, seed: i * 3 + 1, talk: i === 2 && t > tCount && t < tPledge ? info.env * 0.5 : 0 });
  });
  // table
  K.shadow(ctx, 487, 1030, 820);
  roundRect(ctx, 120, TY, 735, 26, 10); ctx.fillStyle = '#7d5841'; ctx.fill();
  roundRect(ctx, 136, TY + 24, 703, 100, 8); ctx.fillStyle = '#5a3d2c'; ctx.fill();
  ctx.fillStyle = '#4a3224'; ctx.fillRect(136, TY + 60, 703, 4);
  // ballots on the table
  jur.forEach((j, i) => {
    const bx = j.x - 26, by = TY - 8;
    ctx.save(); ctx.translate(bx + 26, by); ctx.rotate((i - 2) * 0.04);
    roundRect(ctx, -26, -6, 52, 30, 4); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.strokeStyle = '#8a93a8'; ctx.lineWidth = 2; ctx.strokeRect(-18, 2, 12, 12);
    ctx.fillStyle = '#c9d0e6'; ctx.fillRect(0, 4, 18, 4); ctx.fillRect(0, 12, 14, 4);
    const xk = clamp((t - tPledge - 0.6 - i * 0.12) / 0.25);
    if (xk > 0) { ctx.strokeStyle = RED; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-17, 3); ctx.lineTo(-17 + 10 * xk, 13 * xk + 3 * (1 - xk)); ctx.moveTo(-7, 3); ctx.lineTo(-7 - 10 * xk, 3 + 10 * xk); ctx.stroke(); }
    ctx.restore();
  });
  // submission envelope slides onto the table
  const ek = H.easeOutCubic(clamp((t - tTold) / 0.7));
  if (ek > 0) {
    const ex = lerp(-150, 330, ek), ey = TY + 4;
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(-0.08 * (1 - ek) - 0.05);
    roundRect(ctx, -70, -46, 140, 46, 6); ctx.fillStyle = '#e9dcb8'; ctx.fill();
    ctx.strokeStyle = '#b9a67a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-70, -46); ctx.lineTo(0, -16); ctx.lineTo(70, -46); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // ---- overlays
  // envelope tags
  const tg = K.popIn(t, tTold + 0.5, 0.4);
  const tgOut = clamp((t - tCount) / 0.25);
  if (tg > 0 && tgOut < 1) {
    ctx.save(); ctx.globalAlpha = 1 - tgOut;
    K.drawLabel(ctx, 300, 600, tg, { text: String(P.envelope || 'Studio\'s entry'), size: 26 });
    const t2 = K.popIn(t, tTold + 0.9, 0.4); if (t2 > 0) K.drawLabel(ctx, 300, 664, t2, { text: String(P.envTag || 'AI disclosure'), size: 26, accent: true });
    ctx.restore();
  }
  // counter card replaces the tags
  const cp = K.popIn(t, tCount, 0.45);
  if (cp > 0) {
    const X0 = 140, Y0 = 560, W = 330, Hh = 190;
    ctx.save(); ctx.translate(X0 + W / 2, Y0 + Hh / 2); const s = Math.min(1.04, 0.6 + 0.4 * cp); ctx.scale(s, s); ctx.translate(-(X0 + W / 2), -(Y0 + Hh / 2));
    roundRect(ctx, X0, Y0, W, Hh, 24); ctx.fillStyle = 'rgba(10,12,24,0.95)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = rgba(ACC, 0.6); ctx.stroke();
    ctx.font = H.font('display', 104); ctx.fillStyle = ACC; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(String(Math.round(N * H.easeOutCubic(ck))), X0 + 28, Y0 + 116);
    ctx.font = H.font('ui', 28); ctx.fillStyle = '#ffffff';
    ctx.fillText(String(P.countLabel || 'jurors signed'), X0 + 30, Y0 + 162);
    ctx.restore();
  }
  // stamp on the sheet + code chip
  const sk = clamp((t - tStamp) / 0.55);
  if (sk > 0) {
    K.drawStamp(ctx, 700, 800, 0.8, { kind: 'cross', text: String(P.stamp || 'CODE TOO'), land: sk });
    const ch = K.popIn(t, tStamp + 0.5, 0.4);
    if (ch > 0) {
      ctx.save(); ctx.translate(820, 790); ctx.scale(ch, ch);
      roundRect(ctx, -44, -28, 88, 56, 12); ctx.fillStyle = '#2a2f45'; ctx.fill();
      ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(-14, -12); ctx.lineTo(-28, 0); ctx.lineTo(-14, 12); ctx.moveTo(14, -12); ctx.lineTo(28, 0); ctx.lineTo(14, 12); ctx.moveTo(5, -16); ctx.lineTo(-5, 16); ctx.stroke();
      ctx.restore();
    }
  }
}

function noAiBadge(ctx, x, y, r, col) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  // tiny robot head
  ctx.fillStyle = '#dfe4f1'; ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = r * 0.07;
  H_round(ctx, -r * 0.5, -r * 0.38, r, r * 0.76, r * 0.22); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1c2033'; H_round(ctx, -r * 0.36, -r * 0.22, r * 0.72, r * 0.36, r * 0.14); ctx.fill();
  ctx.fillStyle = '#c4ff3a'; ctx.beginPath(); ctx.arc(-r * 0.16, -r * 0.04, r * 0.07, 0, Math.PI * 2); ctx.arc(r * 0.16, -r * 0.04, r * 0.07, 0, Math.PI * 2); ctx.fill();
  // circle-slash
  ctx.strokeStyle = col; ctx.lineWidth = r * 0.16; ctx.beginPath(); ctx.arc(0, 0, r * 0.88, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-r * 0.62, -r * 0.62); ctx.lineTo(r * 0.62, r * 0.62); ctx.stroke();
  ctx.restore();
}
function H_round(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
