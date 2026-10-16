// Scene "no-veto" (full frame, 1 beat). Office: an outside inspector (badge + clipboard) by a big report sheet;
// rows tick in (risks / incidents / practices). A company manager raises a red VETO stamp, it is blocked (bounces off
// a glass barrier, red cross, "Can't veto" pill), then a PUBLISHED stamp lands and copies fly out. Finally a marker
// blacks out a few lines of the report, each bar labelled with an allowed redaction category.
// Fits: independent reviewers / auditors / watchdogs who can publish without the company's approval, with narrow
//   redaction carve-outs.
// params: report ("REPORT"), rows (3 strings), veto ("VETO"), noVeto ("Can't veto"), published ("PUBLISHED"),
//         redactTitle ("Can still black out"), redacts (<= 3 strings),
//         cues: reportCue, rowCues (3), vetoCue, cutCue, dataCue
// Defaults are generic (no company names). Library copy of the 2026-10-16 AI-inspectors story scene.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const rows = (P.rows || ['Risks', 'Incidents', 'Practices']).slice(0, 3);
  const rowCues = P.rowCues || ['risks', 'incidents', 'practices'];
  const tRep = at(P.reportCue, 1.2) - 0.3;
  const tRow = rows.map((_, i) => at(rowCues[i], tRep + 1 + i * 0.8) - 0.1);
  const tVeto = at(P.vetoCue, D * 0.6);
  const tRaise = tVeto - 1.3, tHit = tVeto - 0.15, tPub = tVeto + 0.7;
  const tCut = at(P.cutCue, D * 0.78) - 0.2;
  const tData = at(P.dataCue, tCut + 1.2);
  const reds = (P.redacts || ['Customer data', 'Legal privilege', 'Model architecture']).slice(0, 3);
  const tRed = reds.map((_, i) => i === 0 ? Math.min(tCut + 0.2, tData - 0.6) : tCut + 0.6 + i * 0.55);
  const feet = 1035;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 470, y: 760 }, { t: tRaise, zoom: 1.03, x: 520, y: 740 }, { t: tPub + 0.5, zoom: 1.0, x: 487, y: 725 },
    { t: tCut, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.06, x: 487, y: 760 }]);
  K.cameraShake(ctx, t, tHit, 0.35, 8);
  K.world.office(ctx, { t, time: 'day' });

  // ---- inspector (left)
  const insp = { t, pose: t > tPub && t < tCut ? 'cheer' : 'point', shirt: '#4fb3a6', skin: 1, hair: 0, hairStyle: 'bun', mood: 'happy', seed: 2, talk: t < tRep + 2 ? 0 : 0 };
  K.drawPerson(ctx, 150, feet, 1.25, insp);
  badge(H, ctx, 150, feet, 1.25, ACC);

  // ---- manager (right, generic suit)
  const blocked = t > tHit;
  K.drawPerson(ctx, 850, feet, 1.25, { t, pose: t > tRaise && t < tHit + 1.6 ? 'point' : 'stand', flip: true, shirt: '#3b4466', skin: 3, hair: 4, hairStyle: 'short', mood: blocked ? (t < tHit + 1.6 ? 'shocked' : 'worried') : 'neutral', seed: 9 });
  ctx.fillStyle = '#e9edf7'; ctx.beginPath(); ctx.moveTo(850 - 10, feet - 214); ctx.lineTo(850, feet - 196); ctx.lineTo(850 + 10, feet - 214); ctx.fill(); // shirt collar
  ctx.fillStyle = '#c84a4a'; ctx.fillRect(850 - 4, feet - 206, 8, 34); // tie

  // ---- report sheet (centre)
  const rk = K.popIn(t, tRep, 0.5);
  const px = 487, py0 = 470, pw = 360, ph = 440;
  if (rk > 0) {
    ctx.save(); ctx.translate(px, py0 + ph); ctx.scale(Math.min(1.04, rk), Math.min(1.04, rk)); ctx.translate(-px, -(py0 + ph));
    // flying copies after PUBLISHED
    for (let i = 0; i < 4; i++) {
      const u = (t - tPub - 0.35 - i * 0.18) / 1.0;
      if (u <= 0 || u >= 1) continue;
      const ex = [-80, 1160, -60, 1140][i], ey = [430, 470, 760, 820][i];
      const x = lerp(px, ex, easeOutCubic(u)), y = lerp(py0 + 200, ey, easeOutCubic(u)) - Math.sin(u * Math.PI) * 120;
      ctx.save(); ctx.globalAlpha = 1 - u * 0.6; ctx.translate(x, y); ctx.rotate((i % 2 ? 1 : -1) * u * 1.2);
      H.roundRect(ctx, -40, -52, 80, 104, 6); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      ctx.fillStyle = ACC; ctx.fillRect(-28, -40, 40, 8);
      ctx.fillStyle = '#c3c9da'; for (let j = 0; j < 5; j++) ctx.fillRect(-28, -22 + j * 14, 56 - (j === 4 ? 24 : 0), 5);
      ctx.restore();
    }
    K.shadow(ctx, px, py0 + ph + 4, 400);
    H.roundRect(ctx, px - pw / 2, py0, pw, ph, 14); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = '#d5dae8'; ctx.fillRect(px - pw / 2, py0 + 78, pw, 3);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const ft = H.fitText(ctx, P.report || 'REPORT', 'display', 38, 24, pw - 50); ctx.font = ft.font; ctx.fillStyle = '#161927';
    ctx.fillText(ft.text, px - pw / 2 + 26, py0 + 42);
    rows.forEach((r, i) => {
      const k = K.popIn(t, tRow[i], 0.35); if (k <= 0) return;
      const y = py0 + 120 + i * 58;
      ctx.save(); ctx.translate(px - pw / 2 + 44, y); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
      ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
      ctx.strokeStyle = '#161927'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-1, 5); ctx.lineTo(7, -5); ctx.stroke();
      ctx.font = H.font('bold', 32); ctx.fillStyle = '#161927'; ctx.fillText(r, 30, 2);
      ctx.restore();
    });
    // redaction area
    const tk = K.fadeIn(t, tCut, 0.3);
    if (tk > 0) {
      ctx.globalAlpha = tk; ctx.font = H.font('ui', 24); ctx.fillStyle = '#5b6380';
      ctx.fillText(P.redactTitle || 'Can still black out', px - pw / 2 + 26, py0 + 302);
      ctx.globalAlpha = 1;
    }
    reds.forEach((r, i) => {
      const y = py0 + 335 + i * 34;
      const u = clamp((t - tRed[i]) / 0.45);
      ctx.fillStyle = '#c3c9da'; ctx.fillRect(px - pw / 2 + 26, y - 4, pw - 52 - (i === 2 ? 60 : 0), 8);
      if (u <= 0) return;
      const w = (pw - 40) * easeOutCubic(u);
      H.roundRect(ctx, px - pw / 2 + 20, y - 15, w, 30, 4); ctx.fillStyle = '#0d0f1a'; ctx.fill();
      // marker tip
      if (u < 1) { ctx.save(); ctx.translate(px - pw / 2 + 20 + w, y - 6); ctx.rotate(-0.6); H.roundRect(ctx, -8, -60, 16, 60, 5); ctx.fillStyle = '#2a2f45'; ctx.fill(); ctx.fillStyle = '#0d0f1a'; ctx.fillRect(-6, -2, 12, 10); ctx.restore(); }
      const lk = clamp((t - tRed[i] - 0.3) / 0.3);
      if (lk > 0) {
        ctx.globalAlpha = lk; ctx.font = H.font('ui', 22);
        const hi = i === 0 && t > tData - 0.1;
        ctx.fillStyle = hi ? ACC : '#ffffff'; ctx.fillText(r, px - pw / 2 + 34, y + 1); ctx.globalAlpha = 1;
      }
    });
    // PUBLISHED stamp
    if (t > tPub) K.drawStamp(ctx, px + 118, py0 + 372, 0.72, { kind: 'check', text: P.published || 'PUBLISHED', land: clamp((t - tPub) / 0.5) });
    ctx.restore();
  }

  // ---- VETO stamp in the manager's hand, swinging toward the report, blocked by a glass barrier
  if (t > tRaise) {
    const up = smooth((t - tRaise) / 0.5);
    const swing = t < tHit ? smooth((t - tRaise - 0.5) / Math.max(0.2, tHit - tRaise - 0.5)) : 1;
    const bounce = blocked ? Math.exp(-(t - tHit) * 4) * Math.sin((t - tHit) * 18) * 18 : 0;
    const drop = blocked ? smooth((t - tHit - 1.2) / 0.6) : 0;
    const sx = lerp(830, 790, swing) + bounce, sy = lerp(lerp(780, 660, up), 640, swing) + drop * 420;
    // glass barrier flashes when hit
    const gk = blocked ? clamp(1 - (t - tHit) / 1.4) : 0;
    if (gk > 0) {
      ctx.save(); ctx.globalAlpha = gk;
      H.roundRect(ctx, 688, 470, 14, 440, 7); ctx.fillStyle = H.rgba('#9fe6ff', 0.55); ctx.fill();
      ctx.strokeStyle = H.rgba('#ffffff', 0.8); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(692, 590); ctx.lineTo(684, 620); ctx.lineTo(700, 640); ctx.stroke();
      ctx.restore();
    }
    if (drop < 1) {
      ctx.save(); ctx.globalAlpha = 1 - drop; ctx.translate(sx, sy); ctx.scale(1.25, 1.25); ctx.rotate(-0.25 + swing * 0.25 + drop * 1.2);
      H.roundRect(ctx, -14, -110, 28, 70, 10); ctx.fillStyle = '#764d31'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, -118, 22, 0, Math.PI * 2); ctx.fillStyle = '#9a6a46'; ctx.fill();
      H.roundRect(ctx, -70, -44, 140, 44, 8); ctx.fillStyle = '#ff6b5e'; ctx.fill();
      H.roundRect(ctx, -76, -8, 152, 14, 4); ctx.fillStyle = '#c94a40'; ctx.fill();
      ctx.font = H.font('display', 32); ctx.fillStyle = '#3a0d0a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.veto || 'VETO', 0, -22);
      if (blocked) { // red cross over the stamp
        const xk = clamp((t - tHit) / 0.25);
        ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 12; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-70 * xk, -100 * xk); ctx.lineTo(70 * xk, 30 * xk); ctx.moveTo(70 * xk, -100 * xk); ctx.lineTo(-70 * xk, 30 * xk); ctx.stroke();
      }
      ctx.restore();
    }
  }
  ctx.restore();

  // "Can't veto" pill (screen space, above the manager)
  const nk = blocked ? K.popIn(t, tHit + 0.1, 0.4) : 0;
  if (nk > 0) {
    ctx.save(); ctx.translate(800, 470); ctx.scale(Math.min(1.05, nk), Math.min(1.05, nk));
    ctx.font = H.font('display', 34); const txt = P.noVeto || "Can't veto";
    const w = ctx.measureText(txt).width + 60;
    H.roundRect(ctx, -w / 2, -32, w, 64, 32); ctx.fillStyle = '#ff6b5e'; ctx.fill();
    ctx.fillStyle = '#2a0806'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 2);
    ctx.restore();
  }
}

function badge(H, ctx, x, y, s, ACC) {
  const shY = -168;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = ACC; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-9, shY - 2); ctx.lineTo(0, shY + 30); ctx.lineTo(9, shY - 2); ctx.stroke();
  H.roundRect(ctx, -12, shY + 28, 24, 30, 4); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.fillStyle = ACC; ctx.fillRect(-12, shY + 28, 24, 9);
  ctx.restore();
}
