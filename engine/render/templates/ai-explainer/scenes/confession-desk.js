// Scene "confession-desk" (full frame). A police station front desk at night (generic: a plain "POLICE" sign with a
// simple star, no real emblem). Built for self-reports / confessions / investigations where the person is not named.
// modes:
//   "confess" a generic figure in a face mask is already walking in at frame 0 and stops at the counter; a "who" tag
//             (e.g. "Top scorer · tax exam") on whoCue, a day pill on dayCue; on slideCue a CONFESSION sheet slides
//             across the counter to the officer; a place pill on policeCue; on investCue a case folder opens, a
//             siren blinks and an accent "Investigation opened" pill lands.
//   "caveat"  the officer reads the confession under a sweeping magnifier ("Still investigating" pill); on
//             detailsCue a "Details: their own account" pill; on the right an easel holds a PASS certificate; on
//             ministryCue a "Finance ministry" pill, on suspendCue a pause badge lands on it with a review pill.
// params: mode, who, day, place, invest, notNamed; caveat: still, details, cert, certSub, ministry, review;
//         cues whoCue, dayCue, slideCue, policeCue, investCue, detailsCue, ministryCue, suspendCue
// Cues are narration words ("word#n" = the (n+1)th time) or seconds.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (typeof w === 'number') return w; if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const mode = P.mode || 'confess';
  const RED = '#ff5a6e', BLUE = '#5f8cff';

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 500, y: 730 }]);

  // ---------------- room
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#161b38'); g.addColorStop(0.5, '#1f2750'); g.addColorStop(1, '#0f1228');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  // tiled wall stripe + floor
  ctx.fillStyle = 'rgba(120,140,210,0.07)'; ctx.fillRect(0, 760, 1080, 120);
  for (let i = 0; i < 14; i++) { ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(i * 80, 760, 2, 120); }
  ctx.fillStyle = '#151831'; ctx.fillRect(0, 1040, 1080, 880);
  // night window (left)
  roundRect(ctx, 80, 560, 170, 170, 10); ctx.fillStyle = '#0a0e26'; ctx.fill();
  ctx.save(); roundRect(ctx, 86, 566, 158, 158, 8); ctx.clip();
  const sg = ctx.createLinearGradient(0, 566, 0, 724); sg.addColorStop(0, '#0b1030'); sg.addColorStop(1, '#1e2a5c'); ctx.fillStyle = sg; ctx.fillRect(86, 566, 158, 158);
  ctx.beginPath(); ctx.arc(200, 610, 18, 0, Math.PI * 2); ctx.fillStyle = '#e8ecf8'; ctx.fill();
  for (let i = 0; i < 5; i++) { ctx.fillStyle = '#2a356a'; ctx.fillRect(90 + i * 32, 680 - (i % 3) * 18, 26, 60); }
  ctx.restore();
  ctx.fillStyle = '#0a0e26'; ctx.fillRect(163, 560, 5, 170); ctx.fillRect(80, 643, 170, 5);

  // sign: POLICE + simple star
  roundRect(ctx, 400, 450, 420, 96, 16); ctx.fillStyle = '#0c1026'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = rgba(BLUE, 0.5); ctx.stroke();
  star(456, 498, 26, BLUE);
  ctx.font = H.font('display', 48); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('POLICE', 500, 500);
  H.glow(ctx, 610, 498, 220, BLUE, 0.06);

  if (mode === 'caveat') drawCaveat(); else drawConfess();
  ctx.restore();

  // ================= helpers
  function star(x, y, r, col) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  }
  function counter(x0, x1) {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18;
    roundRect(ctx, x0, 880, x1 - x0, 165, 10); ctx.fillStyle = '#3c4672'; ctx.fill(); ctx.restore();
    ctx.fillStyle = '#323b63'; for (let i = 0; i < 3; i++) roundRect(ctx, x0 + 24 + i * ((x1 - x0 - 48) / 3), 905, (x1 - x0 - 48) / 3 - 16, 116, 8), ctx.fill();
    roundRect(ctx, x0 - 14, 862, x1 - x0 + 28, 24, 8); ctx.fillStyle = '#8b96bb'; ctx.fill();
  }
  function officer(x, y, s, o = {}) {
    K.drawPerson(ctx, x, y, s, Object.assign({ t, pose: 'stand', mood: 'neutral', seed: 61, skin: 3, hair: 0, hairStyle: 'short', shirt: '#2f4a8a' }, o));
    // cap + badge
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const hy = -212;
    ctx.beginPath(); ctx.ellipse(0, hy - 22, 36, 16, 0, Math.PI, 0); ctx.fillStyle = '#1c2a55'; ctx.fill();
    roundRect(ctx, -36, hy - 26, 72, 10, 4); ctx.fillStyle = '#121c3d'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(10, hy - 16, 32, 7, 0, 0, Math.PI); ctx.fillStyle = '#121c3d'; ctx.fill();
    ctx.restore();
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath();
    const bx = -14, by = -150;
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? 4 : 9; ctx.lineTo(bx + Math.cos(a) * rr, by + Math.sin(a) * rr); }
    ctx.closePath(); ctx.fillStyle = ACC; ctx.fill(); ctx.restore();
  }
  function masked(x, y, s, o) {
    K.drawPerson(ctx, x, y, s, Object.assign({ t, mood: 'neutral', seed: 31, skin: 2, hair: 0, hairStyle: 'short', shirt: '#8a93a8' }, o));
    // face mask over nose and mouth (generic, keeps the figure anonymous)
    const bob = o.walk != null ? -Math.abs(Math.sin(o.walk * 1.8 * Math.PI * 2)) * 5 : Math.sin(t * 1.6 + 31) * 1.2;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const hy = -212 + bob, lk = (o.look || 0) * 4;
    roundRect(ctx, -22 + lk, hy + 6, 44, 24, 9); ctx.fillStyle = '#dfe7f3'; ctx.fill();
    ctx.strokeStyle = '#b7c3d8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-16 + lk, hy + 15); ctx.lineTo(16 + lk, hy + 15); ctx.moveTo(-16 + lk, hy + 22); ctx.lineTo(16 + lk, hy + 22); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-22 + lk, hy + 10); ctx.lineTo(-32, hy + 2); ctx.moveTo(22 + lk, hy + 10); ctx.lineTo(32, hy + 2); ctx.stroke();
    ctx.restore();
  }
  function sheet(cx, cy, s, rot, title) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(s, s);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
    roundRect(ctx, -140, -86, 280, 172, 10); ctx.fillStyle = '#f4f1e8'; ctx.fill(); ctx.restore();
    ctx.font = H.font('display', 34); ctx.fillStyle = '#1f2444'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(title, 0, -50);
    ctx.strokeStyle = '#5267b8'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) { const y = -10 + i * 22, w = 180 - (i === 3 ? 80 : 30 * H.hash(i, 7)); ctx.beginPath(); for (let k = 0; k <= 16; k++) { const x = -96 + (w * k) / 16, yy = y + Math.sin(k * 2 + i) * 3; k ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke(); }
    ctx.restore();
  }

  // ================= modes
  function drawConfess() {
    const tWho = at(P.whoCue, D * 0.25), tDay = at(P.dayCue, D * 0.15), tSl = at(P.slideCue, D * 0.45), tPol = at(P.policeCue, D * 0.55), tInv = at(P.investCue, D * 0.85);
    // officer behind the counter (right)
    officer(680, 1000, 1.2, { look: t > tSl ? -0.6 : -0.3, mood: t > tInv ? 'neutral' : 'neutral', talk: 0 });
    counter(430, 900);
    // siren on the counter
    const sOn = t > tInv - 0.1;
    roundRect(ctx, 834, 828, 44, 36, 8); ctx.fillStyle = '#2a2f4f'; ctx.fill();
    ctx.beginPath(); ctx.arc(856, 826, 20, Math.PI, 0); ctx.fillStyle = sOn ? (Math.sin(t * 10) > 0 ? RED : BLUE) : '#55607f'; ctx.fill();
    if (sOn) H.glow(ctx, 856, 820, 140, Math.sin(t * 10) > 0 ? RED : BLUE, 0.35);
    // confessor walks in (already moving at frame 0)
    const arrive = 1.8;
    const k = clamp((t + 0.6) / (arrive + 0.6));
    const cx = lerp(60, 300, H.easeInOutCubic(k));
    const walking = k < 1;
    const handing = t > tSl - 0.4 && t < tSl + 1.0;
    masked(cx, 1040, 1.25, { walk: walking ? t : undefined, pose: handing ? 'point' : 'stand', look: 0.6, mood: t > tSl ? 'worried' : 'neutral' });
    // the confession sheet: held, then slides across the counter
    const sl = K.phase(t, tSl - 0.2, tSl + 0.9, H.easeInOutCubic);
    if (t > arrive - 0.4) {
      const sx = lerp(430, 640, sl), sy = lerp(836, 820, sl);
      sheet(sx, sy, lerp(0.85, 0.95, sl), lerp(-0.12, 0.05, sl), 'CONFESSION');
    }
    // case folder opens over the sheet
    const pf = K.popIn(t, tInv - 0.1, 0.5);
    if (pf > 0) {
      ctx.save(); ctx.translate(640, 700); ctx.scale(pf, pf);
      roundRect(ctx, -110, -70, 220, 140, 10); ctx.fillStyle = '#d9b26a'; ctx.fill();
      roundRect(ctx, -110, -88, 90, 26, 8); ctx.fillStyle = '#d9b26a'; ctx.fill();
      ctx.font = H.font('display', 34); ctx.fillStyle = '#4a3410'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CASE', 0, 4);
      ctx.restore();
    }
    // pills
    const pw = K.popIn(t, tWho - 0.2, 0.45);
    if (pw > 0) K.drawLabel(ctx, Math.max(230, cx), 660, pw, { text: String(P.who || 'Top scorer · tax exam'), size: 28, accent: true });
    const pn = K.popIn(t, tWho + 0.5, 0.45);
    if (pn > 0) K.drawLabel(ctx, Math.max(230, cx), 720, pn, { text: String(P.notNamed || 'Not named'), size: 24, dot: true });
    const pd = K.popIn(t, tDay - 0.2, 0.45);
    if (pd > 0) K.drawLabel(ctx, 210, 520, pd, { text: String(P.day || 'Sunday'), size: 28, dot: true });
    const pp = K.popIn(t, tPol - 0.2, 0.45);
    if (pp > 0) K.drawLabel(ctx, 610, 610, pp * (1 - K.phase(t, tInv - 0.3, tInv)), { text: String(P.place || 'Seoul police'), size: 28, dot: true });
    const pi = K.popIn(t, tInv + 0.2, 0.45);
    if (pi > 0) K.drawLabel(ctx, 640, 610, pi, { text: String(P.invest || 'Investigation opened'), size: 30, accent: true });
  }

  function drawCaveat() {
    const tDt = at(P.detailsCue, D * 0.3), tMin = at(P.ministryCue, D * 0.55), tSus = at(P.suspendCue, D * 0.8);
    // officer behind a short counter on the left, reading
    officer(170, 1000, 1.15, { look: 0.8 });
    counter(90, 470);
    sheet(330, 850, 0.9, -0.04, 'CONFESSION');
    // magnifier sweeping over the sheet
    const mx = 320 + Math.sin(t * 1.4) * 60, my = 880 + Math.cos(t * 1.1) * 10;
    ctx.save(); ctx.lineWidth = 12; ctx.strokeStyle = '#6b4a36'; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(mx + 40, my + 40); ctx.lineTo(mx + 90, my + 95); ctx.stroke();
    ctx.beginPath(); ctx.arc(mx, my, 48, 0, Math.PI * 2); ctx.fillStyle = 'rgba(200,225,255,0.22)'; ctx.fill(); ctx.lineWidth = 9; ctx.strokeStyle = '#c9d0e6'; ctx.stroke();
    ctx.restore();
    const ps = K.popIn(t, 0.1, 0.45);
    if (ps > 0) K.drawLabel(ctx, 270, 595, ps, { text: String(P.still || 'Still investigating'), size: 28, dot: true });
    const pd = K.popIn(t, tDt - 0.2, 0.45);
    if (pd > 0) K.drawLabel(ctx, 300, 652, pd, { text: String(P.details || 'Details: their own account'), size: 26, accent: true });
    // easel with the PASS certificate (right)
    const EX = 700;
    ctx.strokeStyle = '#7d5841'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(EX - 90, 1040); ctx.lineTo(EX - 30, 640); ctx.moveTo(EX + 90, 1040); ctx.lineTo(EX + 30, 640); ctx.moveTo(EX, 1040); ctx.lineTo(EX, 660); ctx.stroke();
    K.shadow(ctx, EX, 1042, 260);
    const cy = 760 + Math.sin(t * 1.2) * 2;
    ctx.save(); ctx.translate(EX, cy);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 20;
    roundRect(ctx, -150, -110, 300, 210, 12); ctx.fillStyle = '#f4f1e8'; ctx.fill(); ctx.restore();
    ctx.lineWidth = 4; ctx.strokeStyle = H.mixHex(ACC, '#000000', 0.25); roundRect(ctx, -136, -96, 272, 182, 8); ctx.stroke();
    ctx.font = H.font('display', 54); ctx.fillStyle = '#1f2444'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(P.cert || 'PASS'), 0, -34);
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#5b6386'; ctx.fillText(String(P.certSub || 'TAX ACCOUNTANT'), 0, 22);
    ctx.beginPath(); ctx.arc(96, 62, 24, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    // pause badge on suspendCue (a review, not a decision)
    const pz = K.popIn(t, tSus, 0.5);
    if (pz > 0) {
      ctx.globalAlpha = clamp(pz * 2);
      ctx.fillStyle = 'rgba(20,22,40,0.45)'; roundRect(ctx, -150, -110, 300, 210, 12); ctx.fill();
      ctx.save(); ctx.scale(Math.min(1.1, pz), Math.min(1.1, pz));
      ctx.beginPath(); ctx.arc(0, -4, 62, 0, Math.PI * 2); ctx.fillStyle = '#ffb347'; ctx.fill();
      ctx.fillStyle = '#2a1a05'; roundRect(ctx, -24, -36, 16, 64, 5); ctx.fill(); roundRect(ctx, 8, -36, 16, 64, 5); ctx.fill();
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    const pm = K.popIn(t, tMin - 0.2, 0.45);
    if (pm > 0) K.drawLabel(ctx, EX, 600, pm, { text: String(P.ministry || 'Finance ministry'), size: 28, dot: true });
    const pr = K.popIn(t, tSus + 0.3, 0.45);
    if (pr > 0) K.drawLabel(ctx, EX - 20, 1010, pr, { text: String(P.review || 'Review: suspend the pass?'), size: 28, accent: true });
  }
}
