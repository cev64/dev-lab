// Scene "incident-logbook" (full frame, 1 beat). A night meeting room: a wall banner names a proposed body; generic
// cartoon delegates sit at a round table with a globe centrepiece; a standards book pops onto the table. On the right
// an orange flight-recorder-style box ("incident log") with a cartoon watchdog beside it: incident cards fly into its
// slot and a counter ticks; a small plane icon + analogy pill appear; finally the lid opens and pages fly up to a
// "made public" pill. Fits: "an international body / regulator", "incident reporting / registry", "black box for AI",
// "reports made public", "watchdog".
// params (all optional): banner (default "INTERNATIONAL BODY"), bannerSub (default "proposed"), book (default
//        "STANDARDS"), bookLabel (default "Sets the standards"), card (incident card text, default "Incident"),
//        log (box title, default "INCIDENT LOG"), analogy (default "Like a flight recorder"),
//        publicLabel (default "Made public"), cards (number of cards, default 3)
//        cues (narration words; else fractions): bodyCue (8 %), bookCue (28 %), recordCue (38 %), analogyCue (58 %),
//        publicCue (85 %)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent, N = K.NEUTRAL;
  const at = (w, d) => { const v = w != null ? info.timeOf(w) : null; return v == null ? d : v; };
  const tBody = at(P.bodyCue, D * 0.08) - 0.2, tBook = at(P.bookCue, D * 0.28) - 0.1, tRec = at(P.recordCue, D * 0.38) - 0.1;
  const tAn = at(P.analogyCue, D * 0.58) - 0.2, tPub = at(P.publicCue, D * 0.85) - 0.5;
  const nCards = P.cards || 3;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 470, y: 770 }, { t: tBook + 0.5, zoom: 1.05, x: 480, y: 780 },
    { t: tRec + 0.3, zoom: 1.05, x: 510, y: 790 }, { t: tPub, zoom: 1.03, x: 500, y: 770 }, { t: D, zoom: 1.0, x: 487, y: 750 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 900 });
  const feet = 1030;

  // wall banner
  const bp = K.popIn(t, tBody, 0.5);
  if (bp > 0) {
    ctx.save(); ctx.translate(330, 500); ctx.scale(bp, bp);
    H.roundRect(ctx, -250, -54, 500, 120, 16); ctx.fillStyle = '#1c2140'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    let fs = 40; ctx.font = K.font.display(fs);
    const txt = P.banner || 'INTERNATIONAL BODY';
    while (fs > 26 && ctx.measureText(txt).width > 460) { fs -= 2; ctx.font = K.font.display(fs); }
    ctx.fillText(txt, 0, 2);
    ctx.fillStyle = ACC; ctx.font = K.font.ui(26); ctx.fillText(P.bannerSub || 'proposed', 0, 44);
    ctx.restore();
  }

  // delegates behind the round table (generic cartoons)
  const tx = 320, ty = 905;
  const dl = [{ x: 175, s: 0, h: 1, hs: 'short', sk: 0 }, { x: 320, s: 3, h: 2, hs: 'long', sk: 4 }, { x: 465, s: 1, h: 0, hs: 'curly', sk: 2 }];
  dl.forEach((d, i) => K.drawPerson(ctx, d.x, ty + 30, 1.05, { t, pose: t > tBook && i === 1 ? 'point' : 'stand', talk: i === (Math.floor(t / 1.6) % 3) ? info.env * 0.6 : 0, mood: 'neutral', shirt: d.s, hair: d.h, hairStyle: d.hs, skin: d.sk, look: i === 0 ? 1 : i === 2 ? -1 : 0, seed: 10 + i }));
  // table
  K.shadow(ctx, tx, feet, 460);
  ctx.fillStyle = N.woodS; H.roundRect(ctx, tx - 14, ty, 28, feet - ty, 6); ctx.fill();
  ctx.fillStyle = N.wood; ctx.beginPath(); ctx.ellipse(tx, ty, 240, 46, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = N.woodS; ctx.beginPath(); ctx.ellipse(tx, ty + 10, 240, 40, 0, 0, Math.PI); ctx.fill();
  ctx.fillStyle = N.wood; ctx.beginPath(); ctx.ellipse(tx, ty, 240, 40, 0, 0, Math.PI * 2); ctx.fill();
  K.drawGlobe(ctx, tx - 110, ty + 4, 0.55, { t, arcs: 3, shadow: false });
  if (t >= tBook) {
    const p = K.popIn(t, tBook, 0.45);
    ctx.save(); ctx.translate(tx + 90, ty + 6); ctx.scale(p, p);
    K.drawRulebook(ctx, 0, 0, 0.62, { open: K.phase(t, tBook + 0.4, tBook + 1.0), title: P.book || 'STANDARDS' });
    ctx.restore();
  }

  // incident log box (flight-recorder style) on a pedestal
  const lx = 710, ly = 900; // bottom of the box
  ctx.fillStyle = N.darkL; H.roundRect(ctx, lx - 70, ly, 140, feet - ly, 8); ctx.fill();
  K.shadow(ctx, lx, feet, 220);
  const lid = K.phase(t, tPub, tPub + 0.5);
  // box body
  H.roundRect(ctx, lx - 120, ly - 170, 240, 170, 18); ctx.fillStyle = '#ff8a3d'; ctx.fill();
  H.roundRect(ctx, lx - 120, ly - 60, 240, 60, 18); ctx.fillStyle = '#e06b22'; ctx.fill();
  ctx.fillStyle = '#ffffff'; for (let i = 0; i < 6; i++) { H.roundRect(ctx, lx - 104 + i * 36, ly - 160, 20, 10, 3); ctx.fill(); } // reflective stripes
  ctx.fillStyle = N.ink; ctx.textAlign = 'center'; ctx.font = K.font.display(28); ctx.fillText(P.log || 'INCIDENT LOG', lx, ly - 104);
  // slot
  H.roundRect(ctx, lx - 70, ly - 90, 140, 12, 6); ctx.fillStyle = '#5a2a0c'; ctx.fill();
  // counter
  const landed = [];
  for (let i = 0; i < nCards; i++) landed.push(tRec + i * 0.55 + 0.9);
  const count = landed.filter((s) => t >= s).length;
  ctx.fillStyle = '#1c0e04'; ctx.font = K.font.ui(26); ctx.fillText('LOGGED: ' + count, lx, ly - 22);
  // lid (opens upwards at the end)
  ctx.save(); ctx.translate(lx - 120, ly - 170); ctx.rotate(-1.1 * lid);
  H.roundRect(ctx, 0, -22, 240, 26, 10); ctx.fillStyle = '#c95a17'; ctx.fill();
  ctx.restore();

  // incident cards fly in from the left edge into the slot
  for (let i = 0; i < nCards; i++) {
    const s = tRec + i * 0.55, e = s + 0.9;
    if (t < s || t >= e) continue;
    const u = easeOutCubic(clamp((t - s) / 0.9));
    const x = lerp(140, lx, u), y = lerp(640 + i * 30, ly - 96, u) - Math.sin(u * Math.PI) * 120;
    ctx.save(); ctx.translate(x, y); ctx.rotate((1 - u) * -0.5); ctx.scale(1 - 0.35 * u, 1 - 0.35 * u);
    ctx.font = K.font.ui(26); const cw = ctx.measureText((P.card || 'Incident') + ' #9').width + 80;
    H.roundRect(ctx, -cw / 2, -34, cw, 68, 12); ctx.fillStyle = N.paper; ctx.fill();
    ctx.fillStyle = N.danger; ctx.beginPath(); ctx.arc(-cw / 2 + 28, 0, 13, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = N.ink; ctx.textAlign = 'left'; ctx.fillText((P.card || 'Incident') + ' #' + (i + 1), -cw / 2 + 52, 9);
    ctx.restore();
  }
  // pages fly up out of the opened box
  if (t >= tPub + 0.3) {
    for (let i = 0; i < 5; i++) {
      const u = clamp((t - tPub - 0.3 - i * 0.12) / 1.2);
      if (u <= 0) continue;
      const x = lx + (i - 2) * 46 * u + Math.sin(u * 6 + i) * 14, y = ly - 180 - u * (220 + i * 18);
      ctx.save(); ctx.globalAlpha = 1 - smooth((u - 0.75) / 0.25); ctx.translate(x, y); ctx.rotate(Math.sin(u * 5 + i) * 0.4);
      H.roundRect(ctx, -24, -30, 48, 60, 5); ctx.fillStyle = N.paper; ctx.fill();
      ctx.fillStyle = N.paperS; for (let j = 0; j < 4; j++) ctx.fillRect(-16, -18 + j * 11, 32, 4);
      ctx.restore();
    }
  }
  // watchdog beside the box
  watchdog(ctx, H, K, 868, feet + 4, 0.86, t, ACC, t >= tRec ? 1 : 0.3);

  // analogy: plane icon + pill
  if (t >= tAn) {
    const p = K.popIn(t, tAn, 0.45);
    ctx.save(); ctx.translate(lx, 640); ctx.scale(p, p); plane(ctx, 0, 0, ACC); ctx.restore();
  }
  const lab = (text, a, b, o = {}) => {
    if (t < a || t > b + 0.35) return;
    ctx.save(); ctx.globalAlpha = K.fadeOut(t, b, 0.35);
    K.drawLabel(ctx, o.x || 487, o.y || 600, K.popIn(t, a, 0.4), { text, size: o.size || 28, dot: !o.accent, accent: o.accent });
    ctx.restore();
  };
  lab(P.bookLabel || 'Sets the standards', tBook + 0.2, tRec, { x: 330, y: 690 });
  lab(P.analogy || 'Like a flight recorder', tAn + 0.2, tPub - 0.1, { x: 640, y: 720, accent: true });
  lab(P.publicLabel || 'Made public', tPub + 0.4, D + 1, { x: 640, y: 690, accent: true, size: 30 });
  ctx.restore();
}

function plane(ctx, x, y, acc) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.ellipse(0, 0, 70, 13, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-10, -4); ctx.lineTo(18, -4); ctx.lineTo(-20, -52); ctx.lineTo(-34, -52); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-10, 4); ctx.lineTo(18, 4); ctx.lineTo(-20, 52); ctx.lineTo(-34, 52); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-54, -4); ctx.lineTo(-62, -30); ctx.lineTo(-72, -30); ctx.lineTo(-68, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(52, -2, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// A friendly cartoon guard dog sitting (anchor bottom-centre), ~150x190 at s = 1. alert 0..1 (ears up, tail wag).
function watchdog(ctx, H, K, x, y, s, t, acc, alert = 1) {
  const N = K.NEUTRAL, fur = '#c98f5a', furS = '#a66e3f', furL = '#e6b88a';
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.shadow(ctx, 0, 0, 170);
  // tail
  const wag = Math.sin(t * (6 + 6 * alert)) * (0.25 + 0.35 * alert);
  ctx.save(); ctx.translate(48, -30); ctx.rotate(-0.9 + wag);
  ctx.strokeStyle = furS; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, -20, 40, -55); ctx.stroke();
  ctx.restore();
  // body (sitting)
  ctx.fillStyle = furS; ctx.beginPath(); ctx.ellipse(10, -48, 56, 50, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = fur; ctx.beginPath(); ctx.ellipse(-8, -70, 42, 62, -0.15, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = furL; ctx.beginPath(); ctx.ellipse(-18, -70, 22, 40, -0.15, 0, Math.PI * 2); ctx.fill();
  // front legs + paws
  ctx.fillStyle = fur; H.roundRect(ctx, -40, -60, 22, 60, 10); ctx.fill(); H.roundRect(ctx, -8, -60, 22, 60, 10); ctx.fill();
  ctx.fillStyle = furL; H.roundRect(ctx, -44, -12, 30, 14, 7); ctx.fill(); H.roundRect(ctx, -12, -12, 30, 14, 7); ctx.fill();
  // collar + tag (accent)
  ctx.fillStyle = acc; H.roundRect(ctx, -46, -122, 64, 12, 6); ctx.fill();
  ctx.beginPath(); ctx.arc(-14, -102, 10, 0, Math.PI * 2); ctx.fill();
  // head
  const tilt = Math.sin(t * 0.9) * 0.06;
  ctx.save(); ctx.translate(-14, -150); ctx.rotate(tilt);
  const earUp = 0.4 + 0.6 * alert;
  ctx.fillStyle = furS;
  ctx.save(); ctx.translate(-30, -26); ctx.rotate(-0.5 - 0.6 * (1 - earUp)); ctx.beginPath(); ctx.ellipse(0, -18, 13, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.save(); ctx.translate(30, -26); ctx.rotate(0.5 + 0.6 * (1 - earUp)); ctx.beginPath(); ctx.ellipse(0, -18, 13, 26, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  ctx.fillStyle = fur; ctx.beginPath(); ctx.ellipse(0, 0, 44, 40, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = furL; ctx.beginPath(); ctx.ellipse(-4, 16, 28, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = N.ink; ctx.beginPath(); ctx.ellipse(-4, 6, 10, 7, 0, 0, Math.PI * 2); ctx.fill();
  const blink = ((t + 0.7) % 3.1) < 0.12;
  if (blink) { ctx.fillRect(-26, -12, 12, 3); ctx.fillRect(10, -12, 12, 3); }
  else { ctx.beginPath(); ctx.arc(-20, -11, 6, 0, Math.PI * 2); ctx.arc(16, -11, 6, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = N.ink; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, 13); ctx.lineTo(-4, 22); ctx.moveTo(-14, 26); ctx.quadraticCurveTo(-4, 32, 6, 26); ctx.stroke();
  ctx.restore();
  ctx.restore();
}
