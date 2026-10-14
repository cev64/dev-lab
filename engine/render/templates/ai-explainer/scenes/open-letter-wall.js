// Scene "open-letter-wall" (full frame; 1-2 beats). A night hall with a giant open letter on a stand. A pen scribbles
// the first signature; a date pill pops; the signature counter counts up while tiny signatures fill the sheet; a
// "countries" pill lands; two cartoon researchers react; then a "notable signers" panel slides over the sheet and the
// names appear as typed TEXT with an ink underline (real people are never drawn), plus a role pill.
// Fits: open letters, petitions, pledges, "N experts signed", "X and Y among the signers".
// params (all optional): title (default "OPEN LETTER"), sub (default "On AI safety"), date (default "THIS WEEK"),
//        count (default 400), countLabel (default "signatures"), countries (default "From many countries"),
//        names (up to 3 strings, plain text only; default ["A notable signer", "Another signer"]), namesTitle
//        (default "Among the signers"), role (default "Pioneers in the field"),
//        cues (narration words; else % of the scene): dateCue (25 %), countCue (32 %), countEndCue (60 %),
//        countriesCue (48 %), signedCue (55 %), panelCue (68 %), roleCue (78 %), nameCues [..] (84 %, 94 %)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth } = H;
  const D = info.duration, ACC = info.accent, N = K.NEUTRAL;
  const at = (w, d) => { const v = w != null ? info.timeOf(w) : null; return v == null ? d : v; };
  const tDate = at(P.dateCue, D * 0.25), tCount = at(P.countCue, D * 0.32), tCountEnd = at(P.countEndCue, D * 0.6);
  const tCountries = at(P.countriesCue, D * 0.48), tSigned = at(P.signedCue, D * 0.55);
  const tPanel = at(P.panelCue, D * 0.68), tRole = at(P.roleCue, D * 0.78);
  const names = (P.names || ['A notable signer', 'Another signer']).slice(0, 3);
  const nameCues = names.map((n, i) => at((P.nameCues || [])[i], D * (0.84 + i * 0.1)) - 0.15);
  const COUNT = P.count || 400;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: tCount, zoom: 1.04, x: 487, y: 740 },
    { t: tPanel, zoom: 1.08, x: 487, y: 760 }, { t: D, zoom: 1.1, x: 487, y: 770 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 940 });
  // spotlight on the letter
  K.glow(ctx, 487, 720, 520, ACC, 0.08);
  K.props.plant(ctx, 975, 1035, 1.1);
  K.props.floorLamp(ctx, 95, 1010, 1, t);

  // letter on a stand
  const lx0 = 252, lx1 = 722, ly0 = 520, ly1 = 975, cx = (lx0 + lx1) / 2;
  K.shadow(ctx, cx, 1036, 520);
  ctx.fillStyle = N.woodS;
  for (const dx of [-170, 170]) { H.roundRect(ctx, cx + dx - 9, ly1 - 20, 18, 1036 - ly1 + 20, 6); ctx.fill(); }
  H.roundRect(ctx, lx0 - 16, ly0 - 16, lx1 - lx0 + 32, ly1 - ly0 + 32, 18); ctx.fillStyle = N.wood; ctx.fill();
  H.roundRect(ctx, lx0, ly0, lx1 - lx0, ly1 - ly0, 8); ctx.fillStyle = N.paper; ctx.fill();
  // header
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = N.ink; ctx.font = K.font.display(46); ctx.fillText(P.title || 'OPEN LETTER', cx, ly0 + 72);
  ctx.fillStyle = '#4b5378'; ctx.font = K.font.ui(28); ctx.fillText(P.sub || 'On AI safety', cx, ly0 + 112);
  ctx.fillStyle = ACC; H.roundRect(ctx, cx - 60, ly0 + 128, 120, 6, 3); ctx.fill();
  // body lines
  ctx.fillStyle = N.paperS;
  for (let i = 0; i < 4; i++) { H.roundRect(ctx, lx0 + 40, ly0 + 160 + i * 22, (i === 3 ? 230 : 390) - 30 * H.hash(i, 3), 9, 4); ctx.fill(); }
  // signature field: many little scribbles appear as the count rises
  const cols = 6, rows = 6, gx0 = lx0 + 46, gy0 = ly0 + 270, cw = 66, rh = 27;
  const prog = t < tCount ? 0 : clamp((t - tCount) / Math.max(0.5, tCountEnd - tCount));
  const shown = Math.floor(smooth(prog) * cols * rows);
  ctx.strokeStyle = '#3a4675'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  // the first signature is drawn live by the pen during the hook
  const first = clamp((t - 0.6) / 1.6);
  for (let k = 0; k < cols * rows; k++) {
    const c = k % cols, r = Math.floor(k / cols);
    const x = gx0 + c * cw, y = gy0 + r * rh;
    const p = k === 0 ? first : (k < shown ? 1 : 0);
    if (p <= 0) continue;
    const pts = [];
    for (let j = 0; j <= 12; j++) { const u = j / 12; pts.push([x + u * 50, y - 6 + Math.sin(u * 9 + H.hash(k, 7) * 6) * (5 + 4 * H.hash(k, 8))]); }
    K.pathDraw(ctx, pts, p);
  }
  // pen
  const penOut = clamp((t - tCountEnd) / 0.4);
  if (penOut < 1) {
    let px, py;
    if (t < tCount) { const u = clamp((t - 0.6) / 1.6); px = gx0 + u * 50; py = gy0 - 6 + Math.sin(u * 9) * 6; }
    else { const k = Math.min(shown, cols * rows - 1); px = gx0 + (k % cols) * cw + 40; py = gy0 + Math.floor(k / cols) * rh - 6 + Math.sin(t * 30) * 3; }
    ctx.save(); ctx.globalAlpha = 1 - penOut; ctx.translate(px, py); ctx.rotate(0.6);
    H.roundRect(ctx, -6, -70, 12, 64, 5); ctx.fillStyle = '#e8786a'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, -6); ctx.lineTo(0, 6); ctx.closePath(); ctx.fillStyle = N.ink; ctx.fill();
    ctx.restore();
  }

  // counter badge (top-right of the letter)
  if (t >= tCount - 0.2) {
    const p = K.popIn(t, tCount - 0.2, 0.45);
    const n = Math.round(COUNT * smooth(prog));
    ctx.save(); ctx.translate(lx1 + 112, ly0 - 20); ctx.scale(p, p); ctx.rotate(0.06);
    H.roundRect(ctx, -170, -40, 190, 116, 20); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = K.ACCENT.deep; ctx.textAlign = 'center';
    ctx.font = K.font.display(58); ctx.fillText(String(n), -75, 30);
    ctx.font = K.font.ui(24); ctx.fillText(P.countLabel || 'signatures', -75, 62);
    ctx.restore();
  }

  // researchers (generic cartoons): left one points at the letter, right one cheers when it is signed
  const signedK = t >= tSigned;
  K.drawPerson(ctx, 140, 1036, 1.25, { t, pose: t > tCount ? 'point' : 'stand', mood: 'happy', shirt: 0, hair: 1, skin: 1, hairStyle: 'short', look: 1, seed: 2 });
  K.drawPerson(ctx, 850, 1036, 1.25, { t, pose: signedK && t < tPanel + 0.5 ? 'cheer' : 'stand', mood: signedK ? 'happy' : 'neutral', shirt: 3, hair: 0, skin: 3, hairStyle: 'long', look: -1, flip: true, seed: 5 });

  // date pill above the letter
  if (t >= tDate) K.drawLabel(ctx, cx, ly0 - 26, K.popIn(t, tDate, 0.4), { text: P.date || 'THIS WEEK', size: 28, dot: true });
  // countries pill
  if (t >= tCountries && t < tPanel + 0.4) {
    ctx.save(); ctx.globalAlpha = K.fadeOut(t, tPanel, 0.35);
    K.drawLabel(ctx, cx, ly1 - 14, K.popIn(t, tCountries, 0.4), { text: P.countries || 'From many countries', size: 30, accent: true });
    ctx.restore();
  }

  // notable signers panel
  if (t >= tPanel) {
    const k = H.easeOutCubic(clamp((t - tPanel) / 0.5));
    const py0 = lerp(ly1 + 200, ly0 + 250, k);
    ctx.save(); ctx.globalAlpha = clamp(k * 1.5);
    H.roundRect(ctx, lx0 + 14, py0, lx1 - lx0 - 28, 80 + names.length * 82, 18); ctx.fillStyle = 'rgba(14,17,33,0.95)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.fillStyle = '#c9d0e6'; ctx.font = K.font.ui(26); ctx.textAlign = 'left';
    ctx.fillText(P.namesTitle || 'Among the signers', lx0 + 44, py0 + 46);
    names.forEach((nm, i) => {
      const y = py0 + 112 + i * 82, s = nameCues[i];
      if (t < s) { ctx.fillStyle = 'rgba(255,255,255,0.12)'; H.roundRect(ctx, lx0 + 44, y - 32, 300, 34, 8); ctx.fill(); return; }
      const shownTxt = K.typewriter(nm, t, 26, s);
      let fs = 44; ctx.font = K.font.display(fs);
      while (fs > 26 && ctx.measureText(nm).width > lx1 - lx0 - 100) { fs -= 2; ctx.font = K.font.display(fs); }
      ctx.fillStyle = '#ffffff'; ctx.fillText(shownTxt, lx0 + 44, y);
      const w = ctx.measureText(nm).width, u = clamp((t - s - 0.3) / 0.5);
      ctx.fillStyle = ACC; H.roundRect(ctx, lx0 + 44, y + 10, w * smooth(u), 7, 3); ctx.fill();
    });
    ctx.restore();
  }
  if (t >= tRole) K.drawLabel(ctx, cx, ly0 + 236, K.popIn(t, tRole, 0.4), { text: P.role || 'Pioneers in the field', size: 30, accent: true });
  ctx.restore();
}
