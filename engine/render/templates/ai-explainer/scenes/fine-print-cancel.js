// Scene "fine-print-cancel" (full frame, 1 beat ~9-11 s). Night office: a long contract on an easel (title + the
// company as a text pill, no logo) with rows of fine print; a magnifying glass drifts over it. On clauseCue one line
// is highlighted and a zoom panel types the clause verbatim; a boarding pass slides in and a CANCELLED cross stamp
// lands on it. On noticeCue a "<notice>" tag lights up in the panel. On approvedCue a traveller at the right taps
// their phone, an "Approved" chip pops on the pass, the stamp shakes but stays, and a "<approved>" pill lands.
// Fits: "the fine print lets the company cancel / void X", "even if you approved it", contract / terms clauses.
// params: doc ("Contract"), airline ("Company"), clause (verbatim), clauseHead ("The new line"), notice ("Without
//         notice"), approved ("Even if you approved it"), stamp ("CANCELLED"), approvedChip ("Approved"),
//         cues: docCue, clauseCue, noticeCue, approvedCue (narration words; without them, fractions of the scene)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const danger = '#ff6b5e', ok = '#2bb673';
  const tDoc = at(P.docCue, D * 0.2) - 0.2;
  const tClause = at(P.clauseCue, D * 0.33) - 0.25;
  const tNotice = at(P.noticeCue, D * 0.62) - 0.2;
  const tAppr = at(P.approvedCue, D * 0.84) - 0.35;
  const tStamp = tClause + 1.1;

  K.world.room(ctx, { t, time: 'night', lamp: false, window: false, picture: false, plant: true });

  // ---- easel + contract (left) ----
  const DX0 = 145, DX1 = 445, DY0 = 480, DY1 = 990;
  ctx.strokeStyle = '#6b4a36'; ctx.lineWidth = 14; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(215, 960); ctx.lineTo(175, 1040); ctx.moveTo(375, 960); ctx.lineTo(415, 1040); ctx.moveTo(295, 960); ctx.lineTo(295, 1040); ctx.stroke();
  K.shadow(ctx, 295, 1040, 360);
  roundRect(ctx, DX0, DY0, DX1 - DX0, DY1 - DY0, 12); ctx.fillStyle = '#f4f1e8'; ctx.fill();
  ctx.fillStyle = '#e4dfd1'; ctx.fillRect(DX1 - 30, DY0 + 8, 18, DY1 - DY0 - 16);
  // title
  const docGlow = smooth((t - tDoc) / 0.4);
  ctx.fillStyle = '#1b2040'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const tf = H.fitText(ctx, String(P.doc || 'Contract').toUpperCase(), 'display', 30, 18, DX1 - DX0 - 50);
  ctx.font = tf.font; ctx.fillText(tf.text, (DX0 + DX1) / 2 - 8, DY0 + 44);
  if (docGlow > 0) { ctx.strokeStyle = rgba(ACC, docGlow); ctx.lineWidth = 6; roundRect(ctx, DX0 - 4, DY0 - 4, DX1 - DX0 + 8, DY1 - DY0 + 8, 14); ctx.stroke(); }
  // fine print rows
  const rows = 15, hiRow = 9;
  const rowW = DX1 - DX0 - 80;
  for (let r = 0; r < rows; r++) {
    const y = DY0 + 96 + r * 25.5;
    const w1 = 50 + 140 * H.hash(r, 3), w2 = Math.min(rowW - w1 - 12, 40 + 70 * H.hash(r, 7));
    if (r === hiRow) {
      const hk = smooth((t - tClause) / 0.45);
      if (hk > 0) { ctx.fillStyle = rgba(ACC, 0.85); ctx.fillRect(DX0 + 22, y - 9, (DX1 - DX0 - 70) * hk, 18); }
    }
    ctx.fillStyle = r === hiRow && t > tClause ? '#1b2040' : '#a7a9b8';
    ctx.fillRect(DX0 + 28, y - 4, w1, 8); ctx.fillRect(DX0 + 40 + w1, y - 4, w2, 8);
  }
  // airline pill at the top of the sheet (text only)
  K.drawLabel(ctx, (DX0 + DX1) / 2 - 8, DY0 - 12, Math.min(1.05, K.popIn(t, 0.1, 0.4)), { text: P.airline || 'Company', size: 24, dot: true });
  // magnifying glass drifting over the fine print, parks on the highlighted row
  const park = smooth((t - tClause + 0.6) / 0.6);
  const mgx = lerp(250 + Math.sin(t * 1.3) * 70, 330, park), mgy = lerp(640 + Math.sin(t * 0.9) * 60, DY0 + 96 + hiRow * 25.5, park);
  ctx.save(); ctx.translate(mgx, mgy);
  ctx.strokeStyle = '#5b3b25'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(40, 40); ctx.lineTo(86, 86); ctx.stroke();
  ctx.fillStyle = 'rgba(200,230,255,0.25)'; ctx.beginPath(); ctx.arc(0, 0, 54, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9cfe0'; ctx.lineWidth = 10; ctx.stroke();
  ctx.restore();

  // ---- traveller with a phone (right) ----
  const tapping = t > tAppr - 0.2 && t < tAppr + 0.6;
  K.drawPerson(ctx, 815, 1040, 0.85, { t, pose: 'phone', flip: true, mood: t > tStamp && t < tAppr ? 'worried' : t > tAppr + 0.6 ? 'shocked' : 'neutral', skin: 1, hair: 2, shirt: 3, hairStyle: 'long', seed: 2, typing: tapping ? 1 : 0, look: -0.6 });

  // ---- zoom panel (right): clause typed verbatim ----
  const pp = K.popIn(t, tClause + 0.1, 0.45);
  const PX0 = 470, PX1 = 850, PY0 = 470;
  let PY1 = PY0;
  if (pp > 0) {
    const clause = String(P.clause || '“reservations made by AI agents”');
    const size = 30, lines = H.wrap(ctx, clause, 'display', size, PX1 - PX0 - 48);
    const head = String(P.clauseHead || 'The new line');
    const hasNotice = !!P.notice;
    const hasAppr = !!P.approved;
    PY1 = PY0 + 24 + 30 + 14 + lines.length * size * 1.18 + (hasNotice ? 74 : 20) + (hasAppr ? 64 : 0) + 10;
    // connector from highlighted row to the panel
    ctx.save(); ctx.globalAlpha = clamp(pp);
    ctx.strokeStyle = rgba(ACC, 0.8); ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.moveTo(DX1 - 30, DY0 + 96 + hiRow * 25.5); ctx.quadraticCurveTo(PX0 - 20, 760, PX0 + 30, PY1 - 10); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    ctx.save(); ctx.translate((PX0 + PX1) / 2, (PY0 + PY1) / 2); const s = Math.min(1.04, 0.75 + 0.25 * pp); ctx.scale(s, s); ctx.translate(-(PX0 + PX1) / 2, -(PY0 + PY1) / 2);
    roundRect(ctx, PX0, PY0, PX1 - PX0, PY1 - PY0, 22); ctx.fillStyle = 'rgba(12,14,30,0.94)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.fillStyle = ACC; ctx.font = H.font('ui', 24); ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText(H.fitText(ctx, head, 'ui', 24, 18, PX1 - PX0 - 48).text, PX0 + 24, PY0 + 22);
    // typewriter
    const total = clause.length, shown = Math.floor(clamp((t - tClause - 0.25) / 1.4) * total);
    let left = shown;
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('display', size);
    lines.forEach((ln, i) => { const part = ln.slice(0, Math.max(0, left)); left -= ln.length + 1; ctx.fillText(part, PX0 + 24, PY0 + 66 + i * size * 1.18); });
    if (hasNotice) {
      const nk = K.popIn(t, tNotice, 0.4);
      const ny = PY1 - 62 - (hasAppr ? 64 : 0);
      ctx.font = H.font('ui', 26); const nw = ctx.measureText(P.notice).width + 80;
      ctx.save(); ctx.translate(PX0 + 24 + nw / 2, ny + 24); ctx.scale(nk > 0 ? Math.min(1.05, 0.85 + 0.15 * nk) : 0.85, nk > 0 ? Math.min(1.05, 0.85 + 0.15 * nk) : 0.85);
      roundRect(ctx, -nw / 2, -24, nw, 48, 24); ctx.fillStyle = nk > 0 ? danger : 'rgba(255,255,255,0.08)'; ctx.fill();
      // bell with a slash
      ctx.strokeStyle = nk > 0 ? '#ffffff' : 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(-nw / 2 + 30, -2, 10, Math.PI, 0); ctx.lineTo(-nw / 2 + 42, 8); ctx.lineTo(-nw / 2 + 18, 8); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-nw / 2 + 16, -12); ctx.lineTo(-nw / 2 + 44, 14); ctx.stroke();
      ctx.fillStyle = nk > 0 ? '#ffffff' : 'rgba(255,255,255,0.25)'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(P.notice, -nw / 2 + 56, 1);
      ctx.restore();
    }
    if (hasAppr) {
      const ek = K.popIn(t, tAppr + 0.35, 0.45);
      if (ek > 0) {
        ctx.save(); ctx.translate(PX0 + 24, PY1 - 40); const es = Math.min(1.05, ek); ctx.scale(es, es);
        const f = H.fitText(ctx, P.approved, 'display', 28, 18, PX1 - PX0 - 70);
        ctx.font = f.font; const w = ctx.measureText(f.text).width + 40;
        roundRect(ctx, 0, -26, w, 52, 26); ctx.fillStyle = ACC; ctx.fill();
        ctx.fillStyle = '#15182e'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 20, 2);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // ---- boarding pass + stamp ----
  const bp = smooth((t - tClause - 0.3) / 0.5);
  if (bp > 0) {
    const bx = lerp(760, 590, bp), by = 960;
    ctx.save(); ctx.globalAlpha = clamp(bp * 2);
    ctx.save(); ctx.translate(bx, by); ctx.rotate(-0.06); ctx.scale(0.85, 0.85);
    roundRect(ctx, -120, -70, 240, 140, 14); ctx.fillStyle = t > tStamp + 0.3 ? '#d9dce6' : '#f6f7fb'; ctx.fill();
    roundRect(ctx, -120, -70, 240, 36, 14); ctx.fillStyle = ACC; ctx.fill(); ctx.fillRect(-120, -50, 240, 16);
    ctx.fillStyle = '#1b2040'; ctx.font = H.font('bold', 20); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('BOARDING PASS', -104, -51);
    ctx.fillStyle = '#b9c1d6'; ctx.fillRect(-104, -16, 90, 12); ctx.fillRect(-104, 6, 140, 10); ctx.fillRect(-104, 26, 110, 10);
    ctx.fillStyle = '#1b2040'; for (let i = 0; i < 9; i++) ctx.fillRect(66 + i * 5.5, -18, (i % 3 === 0 ? 3.5 : 2), 70);
    ctx.restore();
    const st = (t - tStamp) / 0.5;
    if (st > 0) K.drawStamp(ctx, bx + 10 + K.shake(t, tAppr + 0.45, 0.4, 6), by + 70, 0.85, { kind: 'cross', text: P.stamp || 'CANCELLED', land: st });
    ctx.restore();
  }
}
