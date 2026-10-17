// Scene "lab-to-live" (full frame; span 2 beats). Night street: an AI LAB building with a glass TEST RUN pen in
// front of it, a small guard booth and a LIVE SYSTEMS office tower.
// Beat 1: three small test robots hop out of the pen, walk down the street and slip into the tower; their lime eyes
//   then glow in its windows; the guard booth's lamp stays dark and a "No alarm" pill pops.
// Beat 2: a notice board drops in (header + sub + typed title), a stamp lands on it, envelopes ("disclosures") fly
//   from the lab to the board, then a dashed route draws from the pen to the tower between two chips.
// Fits: "AI agents under test reached real systems", "an agency warns", "companies disclosed it themselves".
// params (all optional; defaults are generic, pass the agency's real name and the advisory's exact title): lab, test,
//        live, alarm, board, boardSub, title, stamp, letters, chipA, chipB
//        cues: walkCue, noticeCue, boardCue, stampCue, lettersCue, testCue, liveCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent, N = K.NEUTRAL;
  const at = (w, d) => { const v = w != null ? info.timeOf(w) : null; return v == null ? d : v; };
  const tB = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.2;
  const tWalk = at(P.walkCue, 0.9), tNotice = at(P.noticeCue, 2.0);
  const tBoard = at(P.boardCue, tB + 2) - 0.3, tStamp = at(P.stampCue, tB + 4);
  const tLet = at(P.lettersCue, tB + 6.5) - 0.2, tTest = at(P.testCue, tB + 9), tLive = at(P.liveCue, tB + 10.3);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 820 }, { t: tB, zoom: 1.0, x: 487, y: 820 },
    { t: tB + 1.5, zoom: 1.0, x: 487, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 775 }]);
  K.world.city(ctx, { t, time: 'night', groundY: 990 });
  const feet = 1012;

  // ---- AI lab (left)
  K.drawBuilding(ctx, 162, feet - 6, 0.72, { t, color: '#6a4fa0', floors: 6, lit: 0.55 });
  // ---- live systems tower (right)
  const towerX = 812, tS = 0.84, tFl = 7, tH = (60 + tFl * 44) * tS;
  K.drawBuilding(ctx, towerX, feet - 6, tS, { t, color: '#3f6f8f', floors: tFl, lit: 0.45 });
  // robots' eyes glowing in the tower windows after they enter
  const inside = [[0, 1], [2, 3], [3, 5]];
  inside.forEach(([c, r], i) => {
    const a = K.fadeIn(t, tWalk + 1.9 + i * 0.3, 0.4);
    if (a <= 0) return;
    const wx = towerX + (-88 + c * 46 + 16) * tS, wy = feet - 6 - tH + (26 + r * 44 + 14) * tS;
    ctx.save(); ctx.globalAlpha = a;
    H.roundRect(ctx, wx - 10, wy - 9, 20, 18, 3); ctx.fillStyle = '#10142a'; ctx.fill();
    const blink = ((t + i * 1.3) % 3.1) < 0.12 ? 0.2 : 1;
    ctx.fillStyle = ACC; K.glow(ctx, wx, wy, 22, ACC, 0.5 * a);
    ctx.fillRect(wx - 6, wy - 2, 4, 4 * blink); ctx.fillRect(wx + 2, wy - 2, 4, 4 * blink);
    ctx.restore();
  });

  // ---- guard booth with an alarm lamp that never lights
  const bx = 615;
  ctx.save(); ctx.translate(bx, feet); ctx.scale(1.35, 1.35); ctx.translate(-bx, -feet);
  H.roundRect(ctx, bx - 42, feet - 128, 84, 122, 8); ctx.fillStyle = '#2d3352'; ctx.fill();
  H.roundRect(ctx, bx - 30, feet - 112, 60, 44, 5); ctx.fillStyle = '#121527'; ctx.fill();
  // small screen in the booth window: calm green line
  ctx.strokeStyle = '#6ee7a8'; ctx.lineWidth = 3; ctx.beginPath();
  for (let i = 0; i <= 20; i++) { const x = bx - 24 + i * 2.4, y = feet - 90 + Math.sin(i * 0.9 + t * 3) * 2; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  H.roundRect(ctx, bx - 50, feet - 136, 100, 12, 5); ctx.fillStyle = '#3b4260'; ctx.fill();
  ctx.fillStyle = '#4a5070'; ctx.beginPath(); ctx.arc(bx, feet - 136, 16, Math.PI, 0); ctx.fill(); // dark lamp
  K.shadow(ctx, bx, feet - 4, 110);
  ctx.restore();

  // ---- glass TEST RUN pen (in front of the lab)
  const p0 = 272, p1 = 505, py = 850;
  H.roundRect(ctx, p0 + 8, feet - 30, p1 - p0 - 16, 26, 8); ctx.fillStyle = '#2f3a63'; ctx.fill();
  // robots: inside the pen until walkCue, then walk to the tower door and fade in
  for (let i = 0; i < 3; i++) {
    const start = tWalk + i * 0.28, dur = 1.6;
    const u = clamp((t - start) / dur);
    const homeX = 322 + i * 72;
    let x = homeX, y = feet - 26, a = 1, walk = null;
    if (t >= start) {
      const e = smooth(u);
      x = lerp(homeX, towerX - 10 + (i - 1) * 8, e);
      y = lerp(feet - 26, feet - 4, clamp(u * 4)) - Math.abs(Math.sin(u * Math.PI * 6)) * 10 * (1 - u);
      a = 1 - clamp((u - 0.85) / 0.15);
      walk = t - start;
    }
    if (a <= 0) continue;
    ctx.save(); ctx.globalAlpha = a;
    K.drawRobot(ctx, x, y, 0.62, { t, state: t >= start ? 'happy' : 'working', seed: 3 + i, talk: 0 });
    ctx.restore();
  }
  // glass walls with an open gate on the right once they leave
  const gate = K.phase(t, tWalk - 0.3, tWalk + 0.2);
  ctx.save(); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(170,220,255,0.75)'; ctx.fillStyle = 'rgba(140,200,255,0.09)';
  ctx.beginPath(); ctx.moveTo(p1, feet - 4 - 110 * gate); ctx.lineTo(p1, py); ctx.lineTo(p0, py); ctx.lineTo(p0, feet - 4); ctx.stroke();
  ctx.fillRect(p0, py, p1 - p0, feet - 4 - py);
  ctx.globalAlpha = 0.35; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(p0 + 20, py + 30); ctx.lineTo(p0 + 56, py + 14); ctx.stroke();
  ctx.restore();

  // ---- labels
  const pill = (text, a, b, x, y, o = {}) => {
    if (t < a || t > b + 0.35) return;
    ctx.save(); ctx.globalAlpha = K.fadeOut(t, b, 0.35);
    K.drawLabel(ctx, x, y, K.popIn(t, a, 0.4), { text, size: o.size || 26, dot: !o.accent, accent: o.accent });
    ctx.restore();
  };
  pill(P.test || 'TEST RUN', 0.2, tTest - 0.1, (p0 + p1) / 2, py + 50, { size: 24 });
  pill(P.alarm || 'No alarm', tNotice, tBoard - 0.1, bx, feet - 205, { size: 28 });
  pill(P.lab || 'AI LAB', tB + 0.3, D + 1, 162, feet + 36, { size: 24 });
  pill(P.live || 'LIVE SYSTEMS', tB + 0.5, D + 1, towerX - 10, feet + 36, { size: 22 });

  // ---- dashed route pen -> tower (beat 2)
  const route = K.bezier(p1 - 20, py + 20, 540, 720, 660, 720, towerX - 20, feet - 50, 40);
  const rk = K.phase(t, tTest + 0.2, tLive + 0.2);
  if (rk > 0) {
    ctx.save(); ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = ACC; ctx.lineWidth = 6; ctx.lineCap = 'round';
    K.pathDraw(ctx, route, rk); ctx.restore();
    const [hx, hy] = K.pathPoint(route, rk);
    K.glow(ctx, hx, hy, 40, ACC, 0.6);
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(hx, hy, 9, 0, Math.PI * 2); ctx.fill();
  }
  pill(P.chipA || 'Agents under test', tTest, D + 1, 388, 820, { size: 26 });
  pill(P.chipB || 'Reached live systems', tLive, D + 1, 640, 700, { size: 28, accent: true });

  // ---- notice board (beat 2): drops in from the top
  if (t >= tBoard) {
    const k = easeOutCubic(clamp((t - tBoard) / 0.55));
    const sw = Math.sin((t - tBoard) * 5) * 0.025 * Math.max(0, 1 - (t - tBoard) / 1.6);
    const bw = 700, bh = 220, x0 = 487 - bw / 2, y0 = lerp(140, 430, k);
    ctx.save(); ctx.translate(487, y0); ctx.rotate(sw); ctx.translate(-487, -y0);
    // hanging wires
    ctx.strokeStyle = '#8a92b8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + 80, y0); ctx.lineTo(x0 + 80, y0 - 200); ctx.moveTo(x0 + bw - 80, y0); ctx.lineTo(x0 + bw - 80, y0 - 200); ctx.stroke();
    H.roundRect(ctx, x0, y0, bw, bh, 22); ctx.fillStyle = 'rgba(14,17,33,0.96)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    // shield icon
    K.drawShield(ctx, x0 + 80, y0 + 140, 0.62, { check: 0 });
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = ACC; ctx.font = K.font.display(52); ctx.fillText(P.board || 'AGENCY', x0 + 150, y0 + 72);
    ctx.fillStyle = '#c9cfe6'; ctx.font = K.font.ui(26); ctx.fillText(P.boardSub || 'Security agency', x0 + 150, y0 + 110);
    const title = K.typewriter(P.title || 'Security advisory', t, 28, tBoard + 0.7);
    const tf = H.fitText(ctx, P.title || 'Security advisory', 'bold', 38, 24, bw - 190);
    ctx.font = tf.font; ctx.fillStyle = '#ffffff'; ctx.fillText(title, x0 + 150, y0 + 172);
    ctx.restore();
    // stamp on the board's right corner
    if (t >= tStamp) K.drawStamp(ctx, x0 + bw - 70, y0 + 205, 0.62, { kind: 'cross', text: P.stamp || 'CRITICAL', land: (t - tStamp) / 0.5 });
    // envelopes from the lab to the board
    for (let i = 0; i < 3; i++) {
      const s0 = tLet + i * 0.45, u = clamp((t - s0) / 0.9);
      if (t < s0) continue;
      const pts = K.bezier(162, 800, 180, 600, 380, 560, 420 + i * 70, y0 + bh + 30, 24);
      const [ex, ey] = K.pathPoint(pts, easeOutCubic(u));
      const a = u >= 1 ? 1 - clamp((t - s0 - 0.9) / 0.3) : 1;
      if (a <= 0) continue;
      ctx.save(); ctx.globalAlpha = a; ctx.translate(ex, ey); ctx.rotate(Math.sin(u * 6 + i) * 0.2);
      H.roundRect(ctx, -34, -22, 68, 44, 6); ctx.fillStyle = N.paper; ctx.fill();
      ctx.strokeStyle = N.lightS; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-34, -20); ctx.lineTo(0, 4); ctx.lineTo(34, -20); ctx.stroke();
      ctx.restore();
    }
    // counter of disclosures received (dots under the title)
    const got = [0, 1, 2].filter((i) => t >= tLet + i * 0.45 + 0.9).length;
    for (let i = 0; i < got; i++) { ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(x0 + 160 + i * 26, y0 + 198, 7 * K.popIn(t, tLet + i * 0.45 + 0.9, 0.3), 0, Math.PI * 2); ctx.fill(); }
    pill(P.letters || "Voluntary disclosures", tLet, tTest - 0.15, 388, 760, { size: 26 });
  }
  ctx.restore();
}
