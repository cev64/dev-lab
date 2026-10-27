// Scene "founder-keys" (full frame). Dusk boardroom: who controls a company. Top: a big shareholder-vote donut; at
// keysCue N small keys pop on a ring (no people drawn), at shareCue the donut's founder slice sweeps in (accent) with
// its share and the rest stays grey with its label; at llcCue the keys fly into a small strongbox labelled as the
// founder company. Bottom: a board table with chairs; at trustCue a trust building with a shield lights up and beams
// pick a majority of the chairs (they light up), with a pill. Ends settled (keys in the box, chairs glowing).
// Fits: dual-class / founder control, a trust or foundation that names the board, any "who's in charge" beat.
// params: head ("SHAREHOLDER VOTE"), keys (5), keysLabel ("Founders"), share (sharePct + "%"), sharePct (51),
//         rest ("Everyone else"), box ("Founder company"), trust ("Trust"), seats (5), picks (3),
//         picksLabel ("Picks most of the board"), cues: keysCue, shareCue, llcCue, trustCue, boardCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, rgba, roundRect, mixHex } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const tKeys = at(P.keysCue, D * 0.15) - 0.1;
  const tShare = at(P.shareCue, D * 0.28) - 0.1;
  const tLlc = at(P.llcCue, D * 0.58);
  const tTrust = at(P.trustCue, D * 0.8) - 0.3;
  const tBoard = Math.max(tTrust + 0.6, at(P.boardCue, D * 0.92) - 0.3);
  const nKeys = P.keys || 5, pct = P.sharePct == null ? 51 : P.sharePct;
  const seats = P.seats || 5, picks = P.picks || 3;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 487, y: 700 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  K.world.office(ctx, { t, time: 'dusk' });

  // --- vote donut (top-left)
  const CX = 290, CY = 610, R = 128;
  ctx.save();
  ctx.beginPath(); ctx.arc(CX, CY, R + 14, 0, Math.PI * 2); ctx.fillStyle = 'rgba(10,12,22,0.75)'; ctx.fill();
  ctx.lineWidth = 46; ctx.strokeStyle = rgba('#ffffff', 0.22);
  ctx.beginPath(); ctx.arc(CX, CY, R - 24, 0, Math.PI * 2); ctx.stroke();
  const sweep = H.easeInOutCubic(clamp((t - tShare) / 1.0));
  if (sweep > 0) {
    ctx.strokeStyle = ACC; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.arc(CX, CY, R - 24, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (pct / 100) * sweep); ctx.stroke();
    K.glow(ctx, CX, CY, R + 40, ACC, 0.12 * sweep);
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = H.font('display', 50); ctx.fillStyle = sweep > 0 ? ACC : rgba('#ffffff', 0.5);
  ctx.fillText(sweep > 0 ? (P.share || pct + '%') : '?', CX, CY + 2);
  ctx.restore();
  K.drawLabel(ctx, CX, CY - R - 22, 1, { text: P.head || 'SHAREHOLDER VOTE', size: 22 });
  const rk = K.popIn(t, tShare + 1.0, 0.4);
  if (rk > 0) K.drawLabel(ctx, CX, CY + R + 46, Math.min(1.05, rk), { text: P.rest || 'Everyone else', size: 22 });

  // --- keys on a ring (top-right), then into the strongbox
  const BX = 720, BY = 700;
  const fly = K.phase(t, tLlc, tLlc + 1.0, H.easeInOutCubic);
  const kk = K.popIn(t, tKeys, 0.4);
  if (kk > 0) {
    for (let i = 0; i < nKeys; i++) {
      const a = -Math.PI * 0.85 + (i / (nKeys - 1)) * Math.PI * 0.7;
      const k = K.popIn(t, tKeys + i * 0.09, 0.35);
      if (k <= 0) continue;
      const sx = 720 + Math.cos(a) * 120, sy = 610 + Math.sin(a) * 120 + 90;
      const fu = clamp(fly * 1.2 - i * 0.03);
      const x = lerp(sx, BX + (i - (nKeys - 1) / 2) * 18, fu), y = lerp(sy, BY - 70, fu) - Math.sin(fu * Math.PI) * 70;
      if (fu < 1) drawKey(ctx, x, y, Math.min(1.05, k) * lerp(1, 0.5, fu), a + Math.PI / 2 + fu * 0.5 + Math.sin(t * 2 + i) * 0.06, ACC, H);
    }
    if (fly < 1) {
      ctx.save(); ctx.globalAlpha = 1 - fly;
      ctx.beginPath(); ctx.arc(720, 610, 26, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = '#c7ccdc'; ctx.stroke();
      ctx.restore();
      const lk = K.popIn(t, tKeys + 0.6, 0.4) * (1 - fly);
      if (lk > 0.02) K.drawLabel(ctx, 720, 560, Math.min(1.05, lk), { text: P.keysLabel || 'Founders', size: 24, dot: true });
    }
  }
  // strongbox
  const bk = K.popIn(t, tLlc - 0.5, 0.45);
  if (bk > 0) {
    ctx.save(); ctx.translate(BX, BY); ctx.scale(Math.min(1.05, bk), Math.min(1.05, bk));
    roundRect(ctx, -110, -90, 220, 110, 14); ctx.fillStyle = '#5d6b86'; ctx.fill();
    roundRect(ctx, -110, -90, 220, 24, 10); ctx.fillStyle = '#7b89a6'; ctx.fill();
    const land = clamp((t - tLlc - 0.9) / 0.5);
    ctx.beginPath(); ctx.arc(0, -30, 22, 0, Math.PI * 2); ctx.fillStyle = mixHex('#3a4459', ACC, land); ctx.fill();
    ctx.restore();
    if (land0(t, tLlc)) K.glow(ctx, BX, BY - 40, 140, ACC, 0.25 + 0.05 * Math.sin(t * 3));
    K.drawLabel(ctx, BX, BY + 74, Math.min(1.05, bk), { text: P.box || 'Founder company', size: 24, accent: t > tLlc + 0.9 });
  }

  // --- board table with chairs (bottom)
  const TY = 1000, TXc = 560;
  const chairX = (i) => TXc - 250 + i * (500 / (seats - 1));
  for (let i = 0; i < seats; i++) {
    const lit = t > tBoard + i * 0.18 && i < picks;
    const x = chairX(i);
    roundRect(ctx, x - 34, TY - 150, 68, 90, 14); ctx.fillStyle = lit ? ACC : '#4a5275'; ctx.fill();
    if (lit) K.glow(ctx, x, TY - 110, 70, ACC, 0.3);
  }
  K.shadow(ctx, TXc, 1035, 640);
  roundRect(ctx, TXc - 300, TY - 70, 600, 30, 12); ctx.fillStyle = '#9a6a46'; ctx.fill();
  roundRect(ctx, TXc - 300, TY - 46, 600, 10, 5); ctx.fillStyle = '#764d31'; ctx.fill();
  ctx.fillStyle = '#764d31'; ctx.fillRect(TXc - 270, TY - 40, 18, 75); ctx.fillRect(TXc + 252, TY - 40, 18, 75);

  // --- trust building (bottom-left) with a shield, beams to the picked chairs
  const tk = K.popIn(t, tTrust, 0.45);
  if (tk > 0) {
    const SX = 130, SY = 1035;
    K.drawBuilding(ctx, SX, SY, 0.62 * Math.min(1.05, tk), { t, color: '#4f7a8a', floors: 4, lit: 0.7 });
    K.drawShield(ctx, SX, SY - 60 * Math.min(1, tk), 0.7 * Math.min(1.05, tk), { check: clamp((t - tTrust - 0.4) / 0.6) });
    K.drawLabel(ctx, SX + 100, 830, Math.min(1.05, tk), { text: P.trust || 'Trust', size: 22, dot: true });
    for (let i = 0; i < picks; i++) {
      const u = clamp((t - tBoard - i * 0.18) / 0.4);
      if (u <= 0) continue;
      const x1 = chairX(i), y1 = TY - 150;
      ctx.save(); ctx.strokeStyle = rgba(ACC, 0.7 * (1 - 0.5 * clamp((t - tBoard - 1.2) / 1))); ctx.lineWidth = 4; ctx.setLineDash([6, 10]);
      ctx.beginPath(); ctx.moveTo(SX + 30, SY - 110); ctx.lineTo(lerp(SX + 30, x1, u), lerp(SY - 110, y1, u)); ctx.stroke(); ctx.restore();
    }
    const pk = K.popIn(t, tBoard + 0.6, 0.4);
    if (pk > 0) K.drawLabel(ctx, TXc + 140, 830, Math.min(1.05, pk), { text: P.picksLabel || 'Picks most of the board', size: 26, accent: true });
  }
  ctx.restore();
}

function land0(t, tLlc) { return t > tLlc + 0.9; }

// Small key (anchor = ring centre), pointing down at rot 0
function drawKey(ctx, x, y, s, rot, ACC, H) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = ACC; ctx.strokeStyle = H.mixHex(ACC, '#000000', 0.45); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fillStyle = '#1c2033'; ctx.fill();
  ctx.fillStyle = ACC; H.roundRect(ctx, -5, 14, 10, 52, 4); ctx.fill(); ctx.stroke();
  ctx.fillRect(4, 44, 12, 7); ctx.fillRect(4, 56, 9, 7);
  ctx.restore();
}
