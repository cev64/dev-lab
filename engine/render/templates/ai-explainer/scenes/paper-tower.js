// Scene "paper-tower" (full frame, 1 beat). Night library: three tall stacks of research papers stand on one
// stone foundation block labelled with an assumption's short name (`base`). Papers drop onto the stacks while a
// count pill lands on countCue; field tags pop on the stacks. On crackCue a crack runs through the block, the
// stacks wobble and a few loose pages flutter off; a researcher looks up worried; the closing pill lands.
// Fits: "lots of work rests on one assumption" / "if X falls, what built on it?" stories.
// params: base ("BASE"), count ("Hundreds of papers"), fields [3], change ("Could change the field"), countCue, crackCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tCount = at(P.countCue, 1.2);
  const tCrack = at(P.crackCue, D * 0.6);
  const tChange = Math.min(D - 1.6, tCrack + 2.4);
  const feet = 1035;
  const fields = (P.fields && P.fields.length ? P.fields : ['Field A', 'Field B', 'Field C']).slice(0, 3);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 487, y: 800 }, { t: tCount + 1.5, zoom: 1.0, x: 487, y: 725 }, { t: tCrack, zoom: 1.0, x: 487, y: 725 }, { t: tCrack + 0.8, zoom: 1.06, x: 487, y: 820 }, { t: D, zoom: 1.04, x: 487, y: 780 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true, plant: false, floorY: 900, wall: '#232845' });
  // bookshelves on the wall
  for (let s = 0; s < 2; s++) {
    const x0 = s ? 760 : 60, w = 260;
    H.roundRect(ctx, x0, 430, w, 420, 8); ctx.fillStyle = '#3a2c2a'; ctx.fill();
    for (let r = 0; r < 4; r++) {
      ctx.fillStyle = '#5a4038'; ctx.fillRect(x0, 530 + r * 100, w, 10);
      let bx = x0 + 14;
      for (let b = 0; b < 9 && bx < x0 + w - 20; b++) { const bw = 16 + H.hash(r + s * 7, b) * 14; const bh = 60 + H.hash(b, r) * 28; ctx.fillStyle = ['#6f86e0', '#4fb3a6', '#e8786a', '#a08be0', '#c9b26a'][(b + r) % 5]; ctx.fillRect(bx, 530 + r * 100 - bh, bw, bh); bx += bw + 4; }
    }
  }

  // foundation block
  const crack = smooth((t - tCrack) / 0.7);
  const shake = crack > 0 && crack < 1 ? Math.sin(t * 50) * 4 * (1 - crack) : 0;
  const bx0 = 230, bx1 = 750, by0 = 950, by1 = feet;
  K.shadow(ctx, 490, feet + 4, 560);
  H.roundRect(ctx, bx0 + shake, by0, bx1 - bx0, by1 - by0, 10); ctx.fillStyle = '#8a8fa6'; ctx.fill();
  ctx.fillStyle = '#6c7189'; ctx.fillRect(bx0 + shake, by1 - 22, bx1 - bx0, 22);
  ctx.font = H.font('display', 44); ctx.fillStyle = '#1c2033'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(P.base || 'BASE', 490 + shake, by0 + 38);
  if (crack > 0) {
    const pts = [[470, by0], [500, by0 + 22], [478, by0 + 44], [510, by0 + 62], [492, by1]];
    ctx.save(); ctx.strokeStyle = '#ff6b5e'; ctx.lineWidth = 6; ctx.lineJoin = 'round';
    ctx.beginPath(); const n = Math.max(1, Math.ceil(crack * (pts.length - 1)));
    for (let i = 0; i <= n; i++) { const p = pts[Math.min(i, pts.length - 1)]; if (i) ctx.lineTo(p[0] + shake, p[1]); else ctx.moveTo(p[0] + shake, p[1]); }
    ctx.stroke(); ctx.restore();
    K.glow(ctx, 490, by0 + 40, 140, '#ff6b5e', 0.25 * crack);
  }

  // three stacks of papers
  const per = 22;
  for (let s = 0; s < 3; s++) {
    const cx = 330 + s * 160;
    const lean = crack > 0 ? Math.sin(t * 3.2 + s * 1.7) * 0.05 * crack : 0;
    ctx.save(); ctx.translate(cx, by0); ctx.rotate(lean);
    for (let j = 0; j < per; j++) {
      const td = 0.15 + (j + s * 0.33) * ((tCount + 1.2) / per);
      const u = easeOutCubic(clamp((t - td) / 0.35));
      if (u <= 0) continue;
      const y = -j * 17 - (1 - u) * 260, rot = (H.hash(j, s) - 0.5) * 0.08 + (1 - u) * 0.3;
      ctx.save(); ctx.translate((H.hash(s, j) - 0.5) * 10, y); ctx.rotate(rot);
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-62, -12, 128, 16);
      ctx.fillStyle = j % 2 ? '#f2f4fa' : '#e3e7f2'; ctx.fillRect(-66, -16, 128, 16);
      ctx.fillStyle = j % 5 === 0 ? ACC : '#c3c9da'; ctx.fillRect(-56, -11, 50, 4);
      ctx.restore();
    }
    ctx.restore();
  }
  // loose pages flutter off after the crack
  if (crack > 0) {
    for (let q = 0; q < 4; q++) {
      const u = clamp((t - tCrack - 0.2 - q * 0.25) / 2.2);
      if (u <= 0 || u >= 1) continue;
      const x = 330 + q * 110 + Math.sin(u * 6 + q) * 60 + (q % 2 ? 1 : -1) * u * 160, y = 620 + u * 380;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(u * 8 + q) * 0.8); ctx.globalAlpha = 1 - u * 0.6;
      ctx.fillStyle = '#f2f4fa'; ctx.fillRect(-36, -46, 72, 92); ctx.fillStyle = '#c3c9da'; for (let l = 0; l < 4; l++) ctx.fillRect(-26, -32 + l * 16, 52, 5);
      ctx.restore();
    }
  }

  // researcher looks up
  K.drawPerson(ctx, 860, feet, 1.15, { t, pose: crack > 0.2 ? 'shrug' : 'stand', mood: crack > 0.2 ? 'shocked' : 'neutral', look: -0.8, flip: true, skin: 3, hair: 0, shirt: 4, hairStyle: 'bun', seed: 11 });
  ctx.restore();

  // field tags (screen space, just above stacks) and pills
  fields.forEach((f, i) => tag(H, ctx, 330 + i * 160, 545 + (i % 2) * 52, K.popIn(t, tCount + 0.9 + i * 0.35, 0.35), f, ACC));
  pill(H, ctx, 487, 438, K.popIn(t, tCount, 0.45), P.count || 'Many papers', ACC, true);
  const ck = K.popIn(t, tChange, 0.45);
  if (ck > 0.01) pill(H, ctx, 487, 690, ck, P.change || 'Could change the field', ACC, false);
}

function tag(H, ctx, x, y, k, text, ACC) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1, k), Math.min(1, k));
  const f = H.fitText(ctx, text, 'ui', 26, 18, 150); ctx.font = f.font;
  const w = ctx.measureText(f.text).width + 30;
  H.roundRect(ctx, -w / 2, -22, w, 44, 12); ctx.fillStyle = 'rgba(10,12,24,0.9)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = ACC; ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
  ctx.restore();
}

function pill(H, ctx, x, y, k, text, ACC, solid) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y + 30); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  const f = H.fitText(ctx, text, 'ui', 34, 22, 760); ctx.font = f.font;
  const w = ctx.measureText(f.text).width + 60;
  H.roundRect(ctx, -w / 2, -31, w, 62, 31); ctx.fillStyle = solid ? ACC : 'rgba(10,12,24,0.92)'; ctx.fill();
  if (!solid) { ctx.lineWidth = 2.5; ctx.strokeStyle = ACC; ctx.stroke(); }
  ctx.fillStyle = solid ? '#14160a' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
  ctx.restore();
}
