// Scene "whose-work" (full frame). Daytime office: an employee hands in a shiny, polished document; it floats up big
// between them with sparkles. On lensCue the manager's magnifier sweeps down the page and each line gets a tag,
// alternately "You?" (left) and a robot-head "AI?" (right): you can't tell who wrote what. On moreCue the page
// drops onto the desk, a review stack piles up, the wall clock races and the manager slumps (more time reviewing).
// params: head ("Harder to judge"), sub ("what's the employee's own work"), more ("More time reviewing"),
//         you ("You?"), ai ("AI?"), headCue, lensCue, moreCue
// Fits: AI blurring authorship (work, school, art), "harder to grade / assess", reviewing AI output.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp } = H;
  const at = (w, d, n = 0) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w, n); return v == null ? d : v; };
  const tHead = at(P.headCue, D * 0.22), tLens = Math.max(tHead + 0.3, at(P.lensCue, D * 0.4)), tMore = Math.max(tLens + 2.5, at(P.moreCue, D * 0.78));

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 487, y: 800 }, { t: tMore, zoom: 1.0, x: 487, y: 760 }, { t: D, zoom: 1.03, x: 520, y: 780 }]);
  K.world.office(ctx, { t, time: 'day' });
  // wall clock (left), races after moreCue
  const race = K.phase(t, tMore, tMore + 0.6);
  K.drawClock(ctx, 150, 690, 0.8, { t, speed: lerp(0.05, 6, race) });
  // desk + manager (right)
  K.drawPerson(ctx, 810, 1045, 1.25, { t, pose: t > tMore + 0.6 ? 'shrug' : 'stand', mood: t > tLens + 1.5 ? 'worried' : 'neutral', shirt: '#4fb3a6', skin: 3, hair: 2, hairStyle: 'bun', seed: 2, look: -0.7 });
  K.drawDesk(ctx, 600, 1045, 1.05);
  const deskTop = 1045 - 110 * 1.05;
  // employee (left) hands the page in
  const handed = t > 0.9;
  K.drawPerson(ctx, 150, 1045, 0.98, { t, pose: handed ? 'stand' : 'point', mood: 'happy', shirt: '#e0a84f', skin: 1, hair: 4, hairStyle: 'curly', seed: 8, look: 0.6 });
  // review stack on the desk grows after moreCue
  const nStack = Math.floor(clamp((t - tMore - 0.3) / 0.12, 0, 16));
  for (let i = 0; i < nStack; i++) {
    ctx.save(); ctx.translate(560 + (i % 2 ? 4 : -3), deskTop - i * 9); ctx.rotate((i % 3 - 1) * 0.04);
    H.roundRect(ctx, -70, -10, 140, 10, 2); ctx.fillStyle = i % 2 ? '#f2f4fa' : '#d5dae8'; ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // the polished page: flies from the employee to centre stage, big
  const fly = K.phase(t, 0.3, 1.2, H.easeOutBack), drop = K.phase(t, tMore - 0.1, tMore + 0.5, H.easeInOutCubic);
  if (drop < 1) {
    const s = lerp(0.4, 1.45, clamp(fly)) * lerp(1, 0.3, drop);
    const x = lerp(lerp(200, 487, fly), 560, drop), y = lerp(lerp(900, 975, fly), deskTop - 10, drop);
    ctx.save(); ctx.globalAlpha = 1 - drop * 0.6;
    K.drawDocument(ctx, x, y, s, { lines: 7, shadow: false });
    ctx.restore();
    // sparkles: it looks polished
    if (fly > 0.6 && drop === 0) for (let i = 0; i < 5; i++) {
      const ph = (t * 0.8 + i * 0.37) % 1, sx = 487 + [-120, 115, -95, 125, 0][i], sy = 975 - [230, 250, 70, 120, 290][i];
      const r = 14 * Math.sin(ph * Math.PI);
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(ph); ctx.fillStyle = H.rgba('#ffffff', 0.9);
      ctx.beginPath(); for (let k = 0; k < 8; k++) { const rad = k % 2 ? r * 0.3 : r, a = (k / 8) * Math.PI * 2; ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); } ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    // magnifier sweep + per-line tags
    if (t > tLens && drop === 0) {
      const s1 = 1.45, top = 975 - 180 * s1;
      const lineY = (i) => top + (44 + i * 15) * s1;
      const sweep = K.phase(t, tLens, tMore - 0.4, H.easeInOutCubic);
      const nLines = 6, cur = sweep * (nLines - 1);
      for (let i = 0; i < nLines; i++) {
        const p = K.popIn(t, tLens + (i / (nLines - 1)) * (tMore - 0.4 - tLens) - 0.05, 0.35);
        if (p <= 0) continue;
        const left = i % 2 === 0, y = lineY(i) + 4;
        if (left) K.drawLabel(ctx, 487 - 175, y + 20, p * 0.9, { text: P.you || 'You?', size: 26 });
        else {
          K.drawLabel(ctx, 487 + 185, y + 20, p * 0.9, { text: P.ai || 'AI?', size: 26, accent: true });
          // tiny robot head beside the AI tag
          ctx.save(); ctx.globalAlpha = clamp(p); ctx.translate(487 + 260, y + 2); ctx.scale(p, p);
          H.roundRect(ctx, -18, -16, 36, 30, 9); ctx.fillStyle = '#f2f4fa'; ctx.fill();
          H.roundRect(ctx, -13, -10, 26, 14, 6); ctx.fillStyle = '#1c2033'; ctx.fill();
          ctx.fillStyle = ACC; ctx.fillRect(-8, -6, 5, 5); ctx.fillRect(3, -6, 5, 5);
          ctx.restore();
        }
        // highlight the line under the lens
        ctx.save(); ctx.globalAlpha = 0.35 * clamp(p);
        H.roundRect(ctx, 487 - 80, y - 6, 160, 16, 6); ctx.fillStyle = left ? '#ffffff' : ACC; ctx.fill();
        ctx.restore();
      }
      // the lens
      const ly = lerp(lineY(0), lineY(nLines - 1), sweep) + 4, lx = 487 + Math.sin(t * 2.2) * 30;
      ctx.save();
      ctx.beginPath(); ctx.arc(lx, ly, 62, 0, Math.PI * 2); ctx.fillStyle = 'rgba(180,220,255,0.18)'; ctx.fill();
      ctx.lineWidth = 12; ctx.strokeStyle = '#2a2f45'; ctx.stroke();
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.arc(lx, ly, 50, 3.6, 4.4); ctx.stroke();
      ctx.lineCap = 'round'; ctx.lineWidth = 18; ctx.strokeStyle = '#764d31';
      ctx.beginPath(); ctx.moveTo(lx + 48, ly + 48); ctx.lineTo(lx + 110, ly + 110); ctx.stroke();
      ctx.restore();
      void cur;
    }
  }

  // header pills
  const ph = K.popIn(t, tHead, 0.45);
  if (ph > 0) K.drawLabel(ctx, 487, 500, ph, { text: P.head || 'Harder to judge', size: 32, accent: true });
  const fadeSub = 1 - clamp((t - tMore) / 0.3);
  const ps = K.popIn(t, tHead + 0.5, 0.45);
  if (ps > 0 && fadeSub > 0) { ctx.save(); ctx.globalAlpha = fadeSub; K.drawLabel(ctx, 487, 566, ps, { text: P.sub || "what's the employee's own work", size: 28 }); ctx.restore(); }
  const pm = K.popIn(t, tMore + 0.2, 0.45);
  if (pm > 0) K.drawLabel(ctx, 487, 566, pm, { text: P.more || 'More time reviewing', size: 28, dot: true });
}
