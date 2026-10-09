// Scene "toolbox-locked" (full frame). Same dusk plaza as "open-toolbox": the open toolbox of glowing code chips;
// pills say what the owner announced; on the cue the lids slam shut (anticipation + camera shake), chains wrap the box,
// a padlock drops and bounces, a stamp lands; then a small web-page card poofs away and a passer-by shrugs.
// Fits: "project goes closed-source", "access revoked / pulled", "no more updates", "page taken down".
// params (all optional): title  name on the box (default "OPEN TOOL")
//                        who    first pill (default "The developer says")
//                        sign   second pill (default "No more updates")
//                        stamp  stamp text (default "CLOSED")
//                        page   web card title (default "Project page"); gone  pill after it vanishes (default "Taken down")
//                        signCue / cue / pageCue  narration words: second pill / lid slam / page vanishes
//                               (else 30% / 55% / 78% of the scene)
//                        time   city time of day (default "dusk")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = info.helpers.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tWho = at(null, 0.5), tSign = at(P.signCue, D * 0.3) - 0.6, tShut = at(P.cue, D * 0.55);
  const tPage = at(P.pageCue, D * 0.78) - 0.5, tGone = Math.min(D - 0.9, tPage + 1.3);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 770 }, { t: tShut - 0.3, zoom: 1.1, x: 487, y: 800 }, { t: tShut + 0.8, zoom: 1.02, x: 487, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 750 }]);
  K.cameraShake(ctx, t, tShut + 0.12, 0.45, 12);
  K.world.city(ctx, { t, time: P.time || 'dusk', groundY: 960 });

  const bx = 487, by = 1030, bs = 1.4;
  // lids: open, a little wider just before (anticipation), then slam shut
  let open = 1;
  if (t > tShut - 0.45) open = t < tShut ? lerp(1, 1.12, smooth((t - tShut + 0.45) / 0.3)) : Math.max(0, 1.12 * (1 - easeOutCubic((t - tShut) / 0.22)));
  toolbox(ctx, H, K, bx, by, bs, { open, t, title: P.title || 'OPEN TOOL', acc: ACC, chips: 3 });
  // impact dust puffs when the lid lands
  if (t > tShut + 0.15 && t < tShut + 0.9) {
    const k = (t - tShut - 0.15) / 0.75;
    ctx.save(); ctx.globalAlpha = 0.5 * (1 - k); ctx.fillStyle = '#c9cfdf';
    for (let i = 0; i < 6; i++) { const sx = i < 3 ? -1 : 1, d = 40 + 120 * k + i % 3 * 30; ctx.beginPath(); ctx.arc(bx + sx * (220 + d), by - 250 - (i % 3) * 30 - 20 * k, 16 + 14 * k, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }
  // chains + padlock
  chains(ctx, H, bx, by, bs, K.phase(t, tShut + 0.3, tShut + 1.0));
  const lockT = tShut + 0.8;
  if (t > lockT) {
    const u = clamp((t - lockT) / 0.55), drop = u < 0.6 ? Math.pow(u / 0.6, 2) : 1 - Math.sin((u - 0.6) / 0.4 * Math.PI) * 0.08;
    const ly = lerp(560, by - 30, drop);
    K.drawLock(ctx, bx, ly, 1.25, { open: 0, shadow: false });
  }
  // stamp
  if (t > tShut + 1.3) K.drawStamp(ctx, bx, 745, 1.2, { kind: 'cross', text: P.stamp || 'CLOSED', land: clamp((t - tShut - 1.3) / 0.55) });

  // pills
  const fadeP = 1 - smooth((t - tShut + 0.2) / 0.35);
  const wp = K.popIn(t, tWho - 0.1, 0.4);
  if (wp > 0 && fadeP > 0) { ctx.save(); ctx.globalAlpha = fadeP; K.drawLabel(ctx, 487, 500, wp, { text: P.who || 'The developer says', size: 30, dot: true }); ctx.restore(); }
  const sp = K.popIn(t, tSign, 0.4);
  if (sp > 0 && fadeP > 0) { ctx.save(); ctx.globalAlpha = fadeP; K.drawLabel(ctx, 487, 580, sp, { text: P.sign || 'No more updates', size: 34, accent: true }); ctx.restore(); }

  // web page card that poofs away
  if (t > tPage) {
    const pop = K.popIn(t, tPage, 0.4), gone = K.phase(t, tGone, tGone + 0.35);
    const cx = 780, cy = 520;
    if (gone < 1) {
      ctx.save(); ctx.translate(cx, cy); ctx.scale(pop * (1 - gone), pop * (1 - gone));
      H.roundRect(ctx, -110, -75, 220, 150, 14); ctx.fillStyle = '#eef1f8'; ctx.fill();
      H.roundRect(ctx, -110, -75, 220, 34, 14); ctx.fillStyle = '#b9c1d6'; ctx.fill(); ctx.fillRect(-110, -55, 220, 14);
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-88 + i * 18, -58, 5, 0, Math.PI * 2); ctx.fillStyle = ['#ff6b5e', '#ffcc33', '#4fb3a6'][i]; ctx.fill(); }
      ctx.font = H.font('ui', 26); ctx.fillStyle = '#161927'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(P.page || 'Project page'), 0, -6);
      ctx.fillStyle = '#c9cfdf'; ctx.fillRect(-80, 26, 160, 9); ctx.fillRect(-80, 46, 110, 9);
      ctx.restore();
    }
    if (gone > 0) {
      const k = clamp((t - tGone) / 0.7);
      if (k < 1) { ctx.save(); ctx.globalAlpha = 0.7 * (1 - k); ctx.fillStyle = '#dfe4f1'; for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 90 * k, cy + Math.sin(a) * 60 * k, 22 * (1 - k * 0.5), 0, Math.PI * 2); ctx.fill(); } ctx.restore(); }
      K.drawLabel(ctx, 487, 520, K.popIn(t, tGone + 0.15, 0.4), { text: P.gone || 'Taken down', size: 32, accent: true });
    }
  }
  // a passer-by walks up and shrugs at the locked box
  const pT = tShut + 1.0;
  if (t > pT) {
    const k = clamp((t - pT) / 1.6), x = lerp(-120, 150, easeOutCubic(k));
    K.drawPerson(ctx, x, 1045, 1.3, { t, walk: k < 1 ? t - pT : null, pose: k < 1 ? 'stand' : 'shrug', mood: k < 1 ? 'neutral' : 'worried', skin: 0, hair: 2, shirt: 3, hairStyle: 'long', seed: 2, look: 0.6 });
  }
  ctx.restore();
}

// --- toolbox (bottom-centre anchored, ~300x150 at scale 1, cantilever lids open to both sides) ---------------
function toolbox(ctx, H, K, x, y, s, o) {
  const open = o.open || 0, t = o.t || 0, acc = o.acc;
  const base = '#d65a4a', shade = H.mixHex(base, '#000000', 0.25), light = H.mixHex(base, '#ffffff', 0.18);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.shadow(ctx, 0, 0, 380, 0.45);
  // interior + glow + chips
  if (open > 0.02) {
    K.glow(ctx, 0, -170, 200, acc, 0.45 * Math.min(1, open));
    H.roundRect(ctx, -140, -164, 280, 26, 10); ctx.fillStyle = '#141626'; ctx.fill();
    const n = o.chips == null ? 3 : o.chips;
    for (let i = 0; i < n; i++) {
      const cx = (i - (n - 1) / 2) * 82, rise = Math.min(1, open) * (34 + 10 * Math.sin(t * 1.6 + i * 1.9));
      chip(ctx, H, cx, -150 - rise, 0.8, acc);
    }
  }
  if (o.inner) { ctx.save(); ctx.beginPath(); ctx.rect(-400, -900, 800, 750); ctx.clip(); o.inner(); ctx.restore(); }
  // body
  H.roundRect(ctx, -150, -150, 300, 150, 16); ctx.fillStyle = base; ctx.fill();
  ctx.save(); H.roundRect(ctx, -150, -150, 300, 150, 16); ctx.clip(); ctx.fillStyle = shade; ctx.fillRect(70, -152, 90, 160); ctx.restore();
  H.roundRect(ctx, -150, -150, 300, 14, 7); ctx.fillStyle = light; ctx.fill();
  H.roundRect(ctx, -150, -20, 300, 20, 10); ctx.fillStyle = shade; ctx.fill();
  // name plate
  H.roundRect(ctx, -112, -118, 224, 64, 12); ctx.fillStyle = 'rgba(12,14,26,0.78)'; ctx.fill();
  const title = String(o.title || '');
  const ft = H.fitText(ctx, title, 'display', 40, 18, 196); ctx.font = ft.font;
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(title, 0, -85);
  // latches
  for (const lx of [-128, 128]) { H.roundRect(ctx, lx - 10, -156, 20, 28, 5); ctx.fillStyle = '#c9cfdf'; ctx.fill(); }
  // lids (two halves, hinged at the outer top corners)
  const ang = Math.min(1.15, open) * 1.85;
  for (const side of [-1, 1]) {
    ctx.save(); ctx.translate(side * 150, -150); ctx.rotate(side * ang);
    // lid half lies from the hinge towards the centre: local x from 0 to -side*154
    const x0 = side < 0 ? 0 : -154;
    H.roundRect(ctx, x0 - 2, -28, 156, 30, 10); ctx.fillStyle = side < 0 ? light : base; ctx.fill();
    H.roundRect(ctx, x0 - 2, -6, 156, 8, 4); ctx.fillStyle = shade; ctx.fill();
    ctx.restore();
  }
  // handle (only when closed)
  const hA = 1 - Math.min(1, open * 4);
  if (hA > 0) {
    ctx.save(); ctx.globalAlpha = hA; ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-60, -178); ctx.quadraticCurveTo(-60, -218, 0, -218); ctx.quadraticCurveTo(60, -218, 60, -178); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
// glowing code chip ("</>"), centre anchored, ~74x50 at scale 1
function chip(ctx, H, x, y, s, acc) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  H.glow(ctx, 0, 0, 60, acc, 0.35);
  H.roundRect(ctx, -37, -25, 74, 50, 12); ctx.fillStyle = '#161927'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = acc; ctx.stroke();
  ctx.font = H.font('bold', 26); ctx.fillStyle = acc; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('</>', 0, 1);
  ctx.restore();
}
// chains across the toolbox front (progress 0..1) in the toolbox's frame (x, y, s = toolbox anchor and scale)
function chains(ctx, H, x, y, s, progress) {
  if (progress <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const paths = [[[-168, -170], [168, -14]], [[168, -170], [-168, -14]]];
  paths.forEach(([a, b], j) => {
    const p = Math.max(0, Math.min(1, progress * 1.25 - j * 0.25));
    const n = 16, m = Math.floor(n * p);
    for (let i = 0; i <= m; i++) {
      const u = i / n, cx = a[0] + (b[0] - a[0]) * u, cy = a[1] + (b[1] - a[1]) * u, ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(ang);
      ctx.lineWidth = 7; ctx.strokeStyle = i % 2 ? '#8a93a8' : '#c9cfdf';
      ctx.beginPath(); if (i % 2) ctx.ellipse(0, 0, 13, 4, 0, 0, Math.PI * 2); else ctx.ellipse(0, 0, 13, 9, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  });
  ctx.restore();
}
