// Scene "index-basket" (full frame). Living room at night. On the wall side, a big glass jar labelled with an index
// name holds a pile of plain coins (the index's companies, no names). A gold coin with the new stock's ticker waits
// beside a calendar chip ("next month"); at joinCue it hops into the jar. At fundCue an "INDEX FUND" box lights up and
// coins stream from the jar into it, with a "HAS TO BUY" tag (buyCue). At retireCue a dotted line carries tokens from
// the fund down to a person on the sofa, whose phone gets a "Retirement account" pill and wobbles up and down.
// params: index ("INDEX"), ticker ("ABC"), when ("NEXT MONTH"), fund ("INDEX FUND"), buy ("HAS TO BUY"),
//         account ("Retirement account"), cues: whenCue, joinCue, fundCue, buyCue, retireCue
// Fits: "why should you care: index funds / your savings end up holding it" beats.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp } = H;
  const at = (w, d) => {
    if (w == null || w === '') return d;
    if (typeof w === 'number') return w;
    const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? d : v;
  };
  const whenAt = at(P.whenCue || 'next', D * 0.3);
  const joinAt = at(P.joinCue || 'join', D * 0.2);
  const fundAt = at(P.fundCue || 'index', D * 0.45);
  const buyAt = at(P.buyCue || 'buy', D * 0.6);
  const retAt = at(P.retireCue || 'retirement', D * 0.85);
  const GOLD = '#ffd34d';

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 740 }]);
  const room = K.world.livingRoomNight(ctx, { t, lampOn: true });

  // ---- the index jar (left)
  const jx = 280, jb = 850, jw = 290, jh = 300;
  const jarPop = K.popIn(t, 0.0, 0.5);
  ctx.save(); ctx.translate(jx, jb); ctx.scale(jarPop, jarPop); ctx.translate(-jx, -jb);
  K.shadow(ctx, jx, jb, jw + 30);
  // shelf
  ctx.fillStyle = '#3b2f4f'; H.roundRect(ctx, jx - jw / 2 - 30, jb, jw + 60, 22, 6); ctx.fill();
  // coins inside
  ctx.save(); H.roundRect(ctx, jx - jw / 2, jb - jh, jw, jh, 34); ctx.clip();
  for (let i = 0; i < 22; i++) {
    const row = Math.floor(i / 5), col = i % 5;
    const x = jx - jw / 2 + 36 + col * 55 + (row % 2) * 24 + (H.hash(i, 4) - 0.5) * 8;
    const y = jb - 30 - row * 44 + Math.sin(t * 1.5 + i) * 1.5;
    if (y < jb - jh + 70) continue;
    ctx.beginPath(); ctx.ellipse(x, y, 26, 20, 0, 0, Math.PI * 2);
    ctx.fillStyle = ['#b9c3ff', '#9fb0ff', '#c8d0ff', '#8fa0f0'][i % 4]; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3; ctx.stroke();
  }
  ctx.restore();
  // glass
  H.roundRect(ctx, jx - jw / 2, jb - jh, jw, jh, 34);
  ctx.fillStyle = 'rgba(180,210,255,0.10)'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(200,225,255,0.55)'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.18)'; H.roundRect(ctx, jx - jw / 2 + 18, jb - jh + 30, 16, jh - 70, 8); ctx.fill();
  // rim
  ctx.fillStyle = '#c9d6ff'; H.roundRect(ctx, jx - jw / 2 - 10, jb - jh - 18, jw + 20, 26, 10); ctx.fill();
  ctx.restore();
  if (jarPop > 0.3) K.drawLabel(ctx, jx, jb - jh - 30, Math.min(1, jarPop), { text: String(P.index || 'INDEX'), size: 30 });

  // ---- the new gold coin: waits on the right with a calendar chip, hops into the jar at joinAt
  const hop = K.phase(t, joinAt, joinAt + 0.9, H.easeInOutCubic);
  const sx = 600, sy = 620, ex = jx + 30, ey = jb - jh + 120;
  const cx = lerp(sx, ex, hop), cy = lerp(sy, ey, hop) - Math.sin(hop * Math.PI) * 170;
  const cPop = K.popIn(t, 0.15, 0.5);
  if (cPop > 0) {
    ctx.save(); ctx.translate(cx, cy); ctx.scale(cPop * (1 - 0.25 * hop), cPop * (1 - 0.25 * hop));
    ctx.rotate(hop * Math.PI * 2);
    K.glow(ctx, 0, 0, 90, GOLD, 0.35);
    ctx.beginPath(); ctx.arc(0, 0, 58, 0, Math.PI * 2); ctx.fillStyle = '#d9a52c'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -3, 52, 0, Math.PI * 2); ctx.fillStyle = GOLD; ctx.fill();
    ctx.fillStyle = '#6b4a08'; ctx.font = K.font.display(32); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(P.ticker || 'ABC'), 0, -1);
    ctx.restore();
  }
  // calendar chip
  const wp = K.popIn(t, Math.min(whenAt, joinAt + 0.6) - 0.2, 0.45);
  if (wp > 0) {
    ctx.save(); ctx.translate(760, 540); ctx.scale(wp, wp);
    H.roundRect(ctx, -120, -50, 240, 100, 16); ctx.fillStyle = '#f4f1ea'; ctx.fill();
    ctx.save(); H.roundRect(ctx, -120, -50, 240, 100, 16); ctx.clip(); ctx.fillStyle = '#ff5d5d'; ctx.fillRect(-120, -50, 240, 30); ctx.restore();
    ctx.fillStyle = '#1a1d2e'; ctx.font = K.font.display(30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(P.when || 'NEXT MONTH'), 0, 16);
    ctx.restore();
  }

  // ---- the index fund box (right)
  const fx = 730, fb = 850, fw = 250, fh = 170;
  const fp = K.popIn(t, fundAt - 0.3, 0.5);
  if (fp > 0) {
    ctx.save(); ctx.translate(fx, fb); ctx.scale(fp, fp); ctx.translate(-fx, -fb);
    K.shadow(ctx, fx, fb, fw);
    const lit = K.phase(t, fundAt, fundAt + 0.6);
    H.roundRect(ctx, fx - fw / 2, fb - fh, fw, fh, 20); ctx.fillStyle = H.mixHex('#3a4380', '#4d5bb0', lit); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; H.roundRect(ctx, fx - fw / 2, fb - fh, fw, 40, 20); ctx.fill();
    ctx.fillStyle = '#20264d'; H.roundRect(ctx, fx - 60, fb - fh - 6, 120, 16, 8); ctx.fill(); // coin slot
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const ff = H.fitText(ctx, String(P.fund || 'INDEX FUND'), 'display', 34, 22, fw - 30); ctx.font = ff.font;
    ctx.fillText(String(P.fund || 'INDEX FUND'), fx, fb - fh / 2 + 4);
    ctx.restore();
    // stream of coins from the jar into the fund
    if (t > fundAt) {
      const pts = K.bezier(jx + 100, jb - jh - 10, jx + 220, jb - jh - 160, fx - 120, fb - fh - 180, fx, fb - fh - 6, 24);
      for (let k = 0; k < 6; k++) {
        const u = ((t - fundAt) * 0.55 + k / 6) % 1;
        const p = K.pathPoint(pts, u);
        const g = k === 0 && t > buyAt ? GOLD : '#b9c3ff';
        ctx.beginPath(); ctx.arc(p[0], p[1], 16, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.stroke();
      }
    }
  }
  const bp = K.popIn(t, buyAt - 0.2, 0.45);
  if (bp > 0) K.drawLabel(ctx, fx, fb + 66, bp, { text: String(P.buy || 'HAS TO BUY'), size: 28, accent: true });

  // ---- person on the sofa with a phone; retirement account pill + wobbling mini chart
  const sofa = room && room.sofa ? room.sofa : { x: 540, feetY: 1040 };
  const px = sofa.x, py = sofa.feetY;
  const rp = K.phase(t, retAt - 0.4, retAt + 0.2);
  K.drawPerson(ctx, px, py, 1.25, { t, pose: 'sit-phone', mood: rp > 0.5 ? 'worried' : 'neutral', seat: false, skin: 3, hair: 2, shirt: 2, hairStyle: 'long', seed: 11 });
  if (rp > 0 && fp > 0) {
    // dotted line from fund to the person
    const pts = K.bezier(fx, fb + 10, fx, fb + 90, px + 160, py - 330, px + 40, py - 250, 20);
    ctx.save(); ctx.setLineDash([6, 12]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = H.rgba(ACC, 0.8); ctx.lineWidth = 5;
    K.pathDraw(ctx, pts, rp); ctx.restore();
    for (let k = 0; k < 3; k++) {
      const u = ((t - retAt) * 0.6 + k / 3) % 1; if (t < retAt) break;
      const p = K.pathPoint(pts, u);
      ctx.beginPath(); ctx.arc(p[0], p[1], 10, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    }
  }
  const ap = K.popIn(t, retAt - 0.1, 0.45);
  if (ap > 0) {
    // pill + small chart card above the person, left of the line
    const cx2 = 300, cy2 = 975;
    ctx.save(); ctx.translate(cx2, cy2); ctx.scale(ap, ap);
    H.roundRect(ctx, -150, -95, 300, 120, 18); ctx.fillStyle = 'rgba(10,12,22,0.9)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke();
    ctx.beginPath();
    for (let i = 0; i <= 30; i++) {
      const x = -130 + i * 260 / 30, y = -30 + Math.sin(i * 0.7 + t * 2) * 14 + Math.sin(i * 1.9) * 8 + (i > 15 ? (i - 15) * 1.6 : 0);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#ff5d5d'; ctx.lineWidth = 5; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.restore();
    K.drawLabel(ctx, cx2, cy2 - 105, ap, { text: String(P.account || 'Retirement account'), size: 26, dot: true });
  }
  ctx.restore();
}
