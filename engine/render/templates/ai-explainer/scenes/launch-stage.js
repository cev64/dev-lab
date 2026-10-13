// Scene "launch-stage" (full frame, made for a span of 2 beats). A dark launch stage with curtains and sweeping
// spotlights; a generic cartoon presenter stands by two cloth-covered display cases. The cloth whips off case 1 (a
// glowing robot + name plate), then case 2 (a bigger robot + plate); a date chip and a claim pill pop; finally the
// presenter walks off and two rival robots rise on the left with plain-text labels and a pulsing "VS" chip.
// Fits: any product / model launch ("X released A and B", "it claims to rival Y and Z").
// params (all optional): a, b           plate texts (default "Model A", "Model B"; b '' = one case only)
//                        rivals         2 plain-text rival labels (default ["Rival 1", "Rival 2"]; [] hides them)
//                        date           date chip text ('' hides)     tag  claim pill text ('' hides)
//                        unveilCue, fullCue, tagCue, rivalCue  narration words (else 25% / 40% / 60% / 78%)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic, roundRect, mixHex } = H;
  const D = info.duration, ACC = info.accent;
  const tw = (w, f) => { const v = w ? info.timeOf(w) : null; return v != null ? v : D * f; };
  const tA = tw(P.unveilCue, 0.25), tB = tw(P.fullCue, 0.4), tTag = tw(P.tagCue, 0.6), tRiv = tw(P.rivalCue, 0.78);
  const rivals = P.rivals || ['Rival 1', 'Rival 2'];
  const hasB = P.b !== '';
  const floorY = 1010;

  // ---- set: back wall, curtains, stage floor
  ctx.save();
  const z = lerp(1.0, 1.06, H.phase(t, 0, D));
  ctx.translate(487, 760); ctx.scale(z, z); ctx.translate(-487, -760);
  const bg = ctx.createLinearGradient(0, 0, 0, 1920);
  bg.addColorStop(0, '#0b0d1e'); bg.addColorStop(0.5, '#151a36'); bg.addColorStop(1, '#090a16');
  ctx.fillStyle = bg; ctx.fillRect(-100, -100, 1280, 2120);
  // big back screen with soft accent wash
  const scr = H.phase(t, tA - 0.2, tA + 0.8);
  roundRect(ctx, 120, 300, 840, 470, 24); ctx.fillStyle = mixHex('#1a1f40', '#24305e', scr); ctx.fill();
  ctx.save(); roundRect(ctx, 120, 300, 840, 470, 24); ctx.clip();
  for (let i = 0; i < 9; i++) {
    const yy = 330 + i * 52 + ((t * 30) % 52);
    ctx.fillStyle = `rgba(255,255,255,${0.025 + 0.02 * scr})`; ctx.fillRect(120, yy, 840, 3);
  }
  if (scr > 0) K.glow(ctx, 540, 540, 420, ACC, 0.18 * scr);
  ctx.restore();
  // curtains
  for (const side of [-1, 1]) {
    const cx0 = side < 0 ? -40 : 1120;
    for (let f = 0; f < 5; f++) {
      const x = cx0 + side * -1 * f * 34 + Math.sin(t * 0.8 + f) * 3;
      ctx.fillStyle = f % 2 ? '#5a1830' : '#6d1e3a';
      ctx.beginPath(); ctx.moveTo(x - 30, 120); ctx.lineTo(x + 30, 120); ctx.lineTo(x + 40 * side * -1 * 0.2 + 26, floorY); ctx.lineTo(x - 34, floorY); ctx.closePath(); ctx.fill();
    }
  }
  ctx.fillStyle = '#3a1222'; ctx.fillRect(-100, 100, 1280, 60);
  // stage floor
  const fl = ctx.createLinearGradient(0, floorY, 0, 1400);
  fl.addColorStop(0, '#2b2f55'); fl.addColorStop(1, '#14172e');
  ctx.fillStyle = fl; ctx.fillRect(-100, floorY - 10, 1280, 600);
  ctx.fillStyle = '#3c4274'; ctx.fillRect(-100, floorY - 12, 1280, 8);

  // sweeping spotlights
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 2; i++) {
    const ang = Math.sin(t * 0.9 + i * 2.2) * 0.32;
    const ox = i ? 860 : 220, tx = ox + Math.tan(ang) * 800 + (i ? -260 : 260);
    const g = ctx.createLinearGradient(ox, 150, tx, floorY);
    g.addColorStop(0, 'rgba(255,255,255,0.10)'); g.addColorStop(1, 'rgba(255,255,255,0.0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ox - 10, 150); ctx.lineTo(ox + 10, 150); ctx.lineTo(tx + 110, floorY); ctx.lineTo(tx - 110, floorY); ctx.closePath(); ctx.fill();
  }
  ctx.restore();

  // ---- display cases
  const cases = [{ x: 500, s: 1.0, at: tA, text: P.a || 'Model A', seed: 4 }];
  if (hasB) cases.push({ x: 770, s: 1.22, at: tB, text: P.b || 'Model B', seed: 7 });
  for (const c of cases) {
    const rev = H.phase(t, c.at, c.at + 0.6, easeOutCubic);
    const w = 190 * c.s, h = 300 * c.s, x0 = c.x - w / 2, y1 = floorY - 40, y0 = y1 - h;
    // pedestal
    K.shadow(ctx, c.x, floorY, w + 60);
    roundRect(ctx, x0 - 16, y1, w + 32, 40, 8); ctx.fillStyle = '#3a4070'; ctx.fill();
    ctx.fillStyle = '#2a2f55'; ctx.fillRect(x0 - 16, y1 + 28, w + 32, 12);
    // glow + robot inside (revealed)
    if (rev > 0) {
      K.glow(ctx, c.x, y1 - h * 0.45, 220 * c.s, ACC, 0.45 * rev);
      K.drawRobot(ctx, c.x, y1 - 8, 1.05 * c.s, { t, state: t > c.at + 0.5 ? 'happy' : 'idle', seed: c.seed });
    }
    // glass
    roundRect(ctx, x0, y0, w, h, 14);
    ctx.fillStyle = `rgba(160,200,255,${0.06 + 0.06 * rev})`; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = mixHex('#6a74a8', ACC, rev); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x0 + 14, y0 + 14, 8, h - 28);
    // cloth: covers until reveal, then whips up and off to the right
    if (rev < 1) {
      const lift = rev;
      ctx.save();
      ctx.translate(c.x + lift * 260, y0 - lift * 260); ctx.rotate(lift * 0.9);
      ctx.globalAlpha = 1 - smooth((rev - 0.6) / 0.4);
      ctx.beginPath(); ctx.moveTo(-w / 2 - 14, 0 + 10);
      ctx.quadraticCurveTo(0, -40, w / 2 + 14, 10);
      for (let k = 0; k <= 6; k++) { const xx = w / 2 + 14 - k * (w + 28) / 6; ctx.lineTo(xx, h + 8 + (k % 2 ? 14 : 0) + Math.sin(t * 3 + k) * 3); }
      ctx.closePath(); ctx.fillStyle = '#8b2a46'; ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(w * 0.15, 0, w * 0.4, h);
      ctx.restore();
    }
    // name plate
    const pl = K.popIn(t, c.at + 0.25, 0.45);
    if (pl > 0) K.drawLabel(ctx, c.x, y1 + 2, pl, { text: c.text, size: 26, accent: true });
  }

  // ---- presenter: points at case 1, cheers at the reveal, walks off on the rival cue
  const off = H.phase(t, tRiv - 0.1, tRiv + 1.1);
  const px = lerp(250, -120, easeOutCubic(off));
  if (off < 1) {
    const pose = off > 0 ? 'stand' : t > tA && t < tA + 1.4 ? 'cheer' : t > tA ? 'point' : 'stand';
    K.drawPerson(ctx, px, floorY, 1.5, { t, pose, mood: 'happy', talk: info.env * 0.7, walk: off > 0 ? t : 0, flip: off > 0, look: off > 0 ? -1 : 1, skin: 2, hair: 1, shirt: 1, hairStyle: 'short', seed: 5 });
  }
  // rivals rise from trap doors on the left
  if (rivals.length) {
    rivals.slice(0, 2).forEach((name, i) => {
      const rp = H.phase(t, tRiv + 0.3 + i * 0.35, tRiv + 0.9 + i * 0.35, easeOutCubic);
      if (rp <= 0) return;
      const rx = 130 + i * 140;
      ctx.save(); ctx.beginPath(); ctx.rect(rx - 120, 0, 240, floorY); ctx.clip();
      K.drawRobot(ctx, rx, floorY + (1 - rp) * 240, 0.95, { t, state: 'thinking', seed: 11 + i, flip: false });
      ctx.restore();
      roundRect(ctx, rx - 70, floorY - 6, 140, 12, 6); ctx.fillStyle = '#1b1f3a'; ctx.fill();
      const lp = K.popIn(t, tRiv + 0.7 + i * 0.35, 0.4);
      if (lp > 0) K.drawLabel(ctx, rx, 760 - (i % 2) * 70, lp, { text: name, size: 26 });
    });
    const vp = K.popIn(t, tRiv + 1.3, 0.45);
    if (vp > 0) {
      const pulse = 1 + 0.06 * Math.sin((t - tRiv) * 6);
      ctx.save(); ctx.translate(372, 880); ctx.scale(vp * pulse, vp * pulse);
      K.glow(ctx, 0, 0, 90, ACC, 0.5);
      ctx.beginPath(); ctx.arc(0, 0, 44, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
      ctx.font = H.font('display', 34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = K.ACCENT.deep;
      ctx.fillText('VS', 0, 2); ctx.restore();
    }
  }
  ctx.restore();

  // ---- screen-space chips (stay inside the stage box)
  const dp = P.date === '' ? 0 : K.popIn(t, tA + 0.5, 0.4);
  if (dp > 0) K.drawLabel(ctx, 487, 585, dp, { text: P.date || 'Today', size: 28, dot: true });
  // big title on the back screen: product name(s) appear with the reveals
  const ttl = K.popIn(t, tA + 0.15, 0.5);
  if (ttl > 0) {
    const fullP = hasB ? H.phase(t, tB, tB + 0.4) : 0;
    const txt = hasB && fullP > 0 ? (P.b || 'Model B') : (P.a || 'Model A');
    ctx.save(); ctx.translate(487, 495); ctx.scale(ttl, ttl);
    const fs = H.fitText(ctx, txt.toUpperCase(), 'display', 72, 36, 760).size;
    ctx.font = H.font('display', fs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    K.glow(ctx, 0, 0, 300, ACC, 0.25);
    ctx.fillStyle = '#ffffff'; ctx.fillText(txt.toUpperCase(), 0, 0);
    ctx.restore();
  }
  const tp = P.tag === '' ? 0 : K.popIn(t, tTag, 0.45);
  if (tp > 0) {
    const fade = 1 - H.phase(t, tRiv + 0.2, tRiv + 0.7);
    if (fade > 0) { ctx.save(); ctx.globalAlpha = fade; K.drawLabel(ctx, 487, 660, tp, { text: P.tag || 'Best yet', size: 28 }); ctx.restore(); }
  }
}
