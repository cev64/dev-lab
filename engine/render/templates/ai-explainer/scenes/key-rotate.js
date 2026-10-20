// Scene "key-rotate" (full frame, one beat; payoff). Night room: a cartoon person points at a key hook on the wall.
// "Revoke": the old key gets a red cross and drops into a bin; "Replace": a fresh glowing key pops onto the hook;
// "Spend limit": a dial's needle rises and stops at a red cap line with a padlock. Then the room dims under a
// question card with two answer chips and a pulsing "?".
// Fits: "revoke and replace your keys / passwords", account hygiene tips, any two-step fix + a closing question.
// Defaults are generic ("The advice", a placeholder question): pass the story's adviser and question ("|" = line break).
// params (all optional): head, revoke, replace, limit, question, a, b
//        cues: headCue, revokeCue, replaceCue, limitCue, qCue (narration words, "word#n" = the (n+1)th time; without
//        them fractions of the scene)
function drawKey(ctx, x, y, s, rot, color, dark) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = color; ctx.strokeStyle = dark; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(-26, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(-26, 0, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color; ctx.fillRect(-10, -6, 50, 12); ctx.strokeRect(-10, -6, 50, 12);
  ctx.fillRect(26, 6, 8, 12); ctx.fillRect(14, 6, 7, 9);
  ctx.restore();
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent, RED = '#ff6b5e';
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tHead = at(P.headCue, 0.6), tRev = at(P.revokeCue, D * 0.2), tRep = at(P.replaceCue, D * 0.28);
  const tLim = at(P.limitCue, D * 0.46), tQ = at(P.qCue, D * 0.67);
  const feet = 1020, kx = 500, ky = 650;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 480, y: 760 }, { t: tQ, zoom: 1.0 }, { t: D, zoom: 1.0 }]);
  K.world.room(ctx, { t, time: 'night', window: true, picture: false, lamp: true, plant: true, floorY: 920 });

  // person pointing at the key hook
  K.drawPerson(ctx, 215, feet, 1.45, { t, pose: t > tRev - 0.3 ? 'point' : 'stand', mood: t > tRep ? 'happy' : 'neutral', skin: 1, hair: 3, hairStyle: 'long', shirt: 3, seed: 7 });

  // key board on the wall
  H.roundRect(ctx, kx - 110, ky - 120, 220, 200, 16); ctx.fillStyle = '#6a5440'; ctx.fill();
  ctx.fillStyle = '#3a2c20'; ctx.beginPath(); ctx.arc(kx, ky - 70, 8, 0, Math.PI * 2); ctx.fill();
  // old key: hangs, crossed out on revoke, then drops into the bin
  const drop = K.phase(t, tRev + 0.35, tRev + 0.95, (u) => u * u);
  if (drop < 1) {
    const y = lerp(ky, 975, drop), rot = Math.PI / 2 + drop * 2.5;
    drawKey(ctx, kx, y, 1.5, rot, t > tRev ? '#8a8fa3' : '#c9b37a', '#4a4e60');
    if (t > tRev - 0.05 && drop < 0.2) {
      const k = K.popIn(t, tRev - 0.05, 0.3);
      ctx.save(); ctx.translate(kx, y); ctx.scale(k, k); ctx.strokeStyle = RED; ctx.lineWidth = 12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-50, -50); ctx.lineTo(50, 50); ctx.moveTo(50, -50); ctx.lineTo(-50, 50); ctx.stroke(); ctx.restore();
    }
  }
  // bin under the board
  H.roundRect(ctx, kx - 60, 930, 120, 90, 10); ctx.fillStyle = '#4a5270'; ctx.fill();
  H.roundRect(ctx, kx - 70, 918, 140, 20, 8); ctx.fillStyle = '#5b6488'; ctx.fill();
  // new key pops onto the hook
  if (t > tRep - 0.05) {
    const k = K.popIn(t, tRep - 0.05, 0.45);
    K.glow(ctx, kx, ky, 160, ACC, 0.4 * k);
    ctx.save(); ctx.translate(kx, ky); ctx.scale(k, k); drawKey(ctx, 0, 0, 1.5, Math.PI / 2 + Math.sin(t * 2) * 0.05, ACC, '#6b5a12'); ctx.restore();
    for (let i = 0; i < 6; i++) { const a = i * 1.05 + t * 0.8, r = 95 + 10 * Math.sin(t * 3 + i); ctx.fillStyle = H.rgba(ACC, 0.8 * k); ctx.beginPath(); ctx.arc(kx + Math.cos(a) * r, ky + Math.sin(a) * r, 4, 0, Math.PI * 2); ctx.fill(); }
  }
  const lbl = (text, x, y, a, o = {}) => { if (t > a) K.drawLabel(ctx, x, y, K.popIn(t, a, 0.4), { text, size: o.size || 28, accent: o.accent, dot: !o.accent }); };
  lbl(P.revoke || '1. Revoke', kx, ky + 135, tRev - 0.05);
  if (t > tRep - 0.05) K.drawLabel(ctx, kx, ky + 135, 1, { text: P.replace || '2. Replace', size: 28, accent: true });

  // spend-limit dial
  const gx = 760, gy = 900;
  if (t > tLim - 0.2) {
    const k = K.popIn(t, tLim - 0.2, 0.45);
    ctx.save(); ctx.translate(gx, gy); ctx.scale(k * 1.3, k * 1.3);
    H.roundRect(ctx, -115, -120, 230, 160, 18); ctx.fillStyle = '#1c2033'; ctx.fill();
    ctx.lineWidth = 18; ctx.lineCap = 'butt';
    ctx.strokeStyle = '#3b4260'; ctx.beginPath(); ctx.arc(0, 10, 85, Math.PI, Math.PI * 1.7); ctx.stroke();
    ctx.strokeStyle = H.rgba(RED, 0.8); ctx.beginPath(); ctx.arc(0, 10, 85, Math.PI * 1.7, Math.PI * 2); ctx.stroke();
    const needle = Math.PI + Math.PI * 0.7 * K.phase(t, tLim + 0.1, tLim + 1.0, K.easeOutBack);
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(Math.cos(needle) * 72, 10 + Math.sin(needle) * 72); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 10, 9, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    if (t > tLim + 0.9) K.drawLock(ctx, gx + 92, gy - 52, 0.55, { open: 0 });
    K.drawLabel(ctx, gx, gy - 165, k, { text: P.limit || 'Spend limit', size: 28, accent: true });
  }
  if (t > tHead - 0.1) { ctx.save(); ctx.globalAlpha = K.fadeOut(t, tQ - 0.4, 0.3); K.drawLabel(ctx, 487, 500, K.popIn(t, tHead - 0.1, 0.4), { text: P.head || 'The advice', size: 30 }); ctx.restore(); }

  // question card
  if (t > tQ - 0.2) {
    const dim = K.phase(t, tQ - 0.2, tQ + 0.3);
    ctx.fillStyle = H.rgba('#05060f', 0.55 * dim); ctx.fillRect(-100, -100, 1280, 2120);
    const k = K.popIn(t, tQ - 0.1, 0.5);
    ctx.save(); ctx.translate(487, 640); ctx.scale(k, k);
    H.roundRect(ctx, -400, -160, 800, 320, 28); ctx.fillStyle = 'rgba(14,16,30,0.96)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; H.roundRect(ctx, -400, -160, 800, 320, 28); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = K.font.display(50); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lines = (P.question || 'Would you change|your keys today?').split('|');
    lines.forEach((l, i) => ctx.fillText(l, 0, -82 + i * 62));
    const q = 0.85 + 0.15 * Math.sin(t * 5);
    ctx.save(); ctx.translate(330, -110); ctx.scale(q, q); ctx.fillStyle = ACC; ctx.font = K.font.display(70); ctx.fillText('?', 0, 0); ctx.restore();
    ctx.restore();
    K.drawLabel(ctx, 300, 770, K.popIn(t, tQ + 0.5, 0.4), { text: P.a || 'Yes, now', size: 30, accent: true });
    K.drawLabel(ctx, 674, 770, K.popIn(t, tQ + 0.75, 0.4), { text: P.b || 'Not yet', size: 30 });
  }
  ctx.restore();
}
