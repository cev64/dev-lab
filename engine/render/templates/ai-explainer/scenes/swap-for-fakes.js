// Scene "swap-for-fakes" (full frame). A warehouse at night with a roller door. Real servers (dark, glowing LEDs and
// a chip badge) are wheeled out on a hand truck by a cartoon courier while look-alike dummy servers (flat grey, dead
// LEDs) take their place; an auditor with a clipboard counts the dummies. Generic cartoons only, no logos.
// Fits: smuggling / diversion / audit-fooling stories, "swapped for fakes", inventory fraud, export-control cases.
// params: mode     "hook" (courier wheels real servers out, dummies drop in; action kept low for the hook card)
//                  "audit" (default; auditor ticks a wall of dummies; DUMMY tags, false paperwork, real ones sneak out)
//                  "payoff" (real servers leave through the door, the fakes stay with the auditor; a closing question)
//         by       attribution pill (audit), default "Investigators say"
//         dummy    tag on fake servers, default "DUMMY"; many: pill for the pile, default "Dummy servers"
//         paper    stamp text on the paperwork, default "FALSE"; gone: pill for the real servers, default "Real ones: gone"
//         dest     pill on the door in payoff, default "Real ones: shipped out"; stay: pill on the fakes, default "Fakes: stayed"
//         question closing pill, default "Can the rules be enforced?"
//         cues:    dummyCue (hook: dummies drop, default 62 %; audit: the pile is tagged, default 25 %),
//                  paperCue / realCue (audit, 68 / 86 %), realCue / fakeCue / qCue (payoff, 25 / 45 / 68 %)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent, RED = '#ff6b5e';
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const mode = P.mode || 'audit';

  // ---------------------------------------------------------------- props
  // server box 180x120, anchored bottom-centre. fake 0..1 = how "dummy" it looks, reveal 0..1 = DUMMY tag
  function server(x, y, s, o = {}) {
    const fake = o.fake || 0;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (o.shadow !== false) K.shadow(ctx, 0, 0, 190, 0.3);
    const body = H.mixHex('#1c2242', '#7a8096', fake), face = H.mixHex('#2b3360', '#8d93a8', fake), edge = H.mixHex('#11152c', '#5d6276', fake);
    H.roundRect(ctx, -90, -120, 180, 120, 12); ctx.fillStyle = body; ctx.fill();
    H.roundRect(ctx, -90, -120, 180, 14, 7); ctx.fillStyle = H.mixHex(face, '#ffffff', 0.1); ctx.fill();
    ctx.fillStyle = edge; ctx.fillRect(60, -112, 24, 108);
    for (let r = 0; r < 3; r++) {
      const yy = -98 + r * 32;
      H.roundRect(ctx, -78, yy, 132, 24, 5); ctx.fillStyle = face; ctx.fill();
      ctx.fillStyle = H.rgba('#ffffff', 0.12 * (1 - fake));
      for (let v = 0; v < 6; v++) ctx.fillRect(-70 + v * 9, yy + 6, 4, 12);
      for (let l = 0; l < 3; l++) {
        const lx = 40 - l * 12, ly = yy + 12;
        const on = fake < 0.5 && H.hash(r * 7 + l + (o.seed || 0) * 31, Math.floor(t * 6 + r * 0.4 + l * 0.7)) < 0.75;
        if (on) K.glow(ctx, lx, ly, 12, ACC, 0.6);
        ctx.beginPath(); ctx.arc(lx, ly, 3.6, 0, Math.PI * 2); ctx.fillStyle = on ? ACC : (fake > 0.5 ? '#4a4f62' : 'rgba(255,255,255,0.2)'); ctx.fill();
      }
    }
    // chip badge (real servers only)
    if (fake < 0.5) {
      const a = 1 - fake * 2;
      ctx.globalAlpha = a;
      H.roundRect(ctx, -26, -152, 52, 40, 6); ctx.fillStyle = '#0d1022'; ctx.fill();
      H.roundRect(ctx, -16, -144, 32, 24, 4); ctx.fillStyle = ACC; ctx.fill();
      ctx.fillStyle = ACC; for (let i = 0; i < 4; i++) { ctx.fillRect(-20 + i * 12, -158, 4, 6); ctx.fillRect(-20 + i * 12, -112, 4, 4); }
      K.glow(ctx, 0, -132, 50, ACC, 0.35 + 0.15 * Math.sin(t * 4 + (o.seed || 0)));
      ctx.globalAlpha = 1;
    }
    if (o.reveal > 0) {
      const p = K.easeOutBack(clamp(o.reveal));
      ctx.save(); ctx.translate(-10, -62); ctx.scale(p, p); ctx.rotate(-0.12);
      H.roundRect(ctx, -70, -22, 140, 44, 8); ctx.fillStyle = RED; ctx.fill();
      ctx.font = H.font('display', 28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#2a0c0a';
      ctx.fillText(P.dummy || 'DUMMY', 0, 2);
      ctx.restore();
    }
    ctx.restore();
  }
  // hand truck carrying `n` real servers, pushed by a courier on its left. x = truck nose.
  function courierTruck(x, y, s, n, walkT, o = {}) {
    K.drawPerson(ctx, x - 150 * s, y, 1.45 * s, { t, walk: walkT, skin: 2, hair: 1, shirt: '#3c4a7a', hairStyle: 'short', mood: 'neutral', seed: 4, look: 0.4 });
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = '#9aa3c0'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-110, -300); ctx.lineTo(-60, -10); ctx.lineTo(70, -10); ctx.stroke();
    ctx.beginPath(); ctx.arc(-58, -14, 22, 0, Math.PI * 2); ctx.fillStyle = '#20253f'; ctx.fill(); ctx.lineWidth = 5; ctx.stroke();
    ctx.restore();
    for (let i = 0; i < n; i++) server(x + 4 * s, y - 16 * s - i * 128 * s * 0.8, 0.8 * s, { seed: 50 + i, shadow: false });
  }
  function auditor(x, y, s, o = {}) {
    K.drawPerson(ctx, x, y, s, { t, pose: o.pose || 'phone', flip: o.flip !== false, skin: 0, hair: 3, shirt: '#b8742f', hairStyle: 'bun', mood: o.mood || 'happy', walk: o.walk, seed: 7, talk: o.talk || 0 });
    if ((o.pose || 'phone') === 'phone' && o.walk == null) {
      // clipboard held in front of the chest (covers the phone prop)
      const cx = x + (o.flip !== false ? -6 : 6) * s, cy = y - 150 * s;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.flip !== false ? 0.12 : -0.12);
      H.roundRect(ctx, -30 * s, -40 * s, 60 * s, 78 * s, 6 * s); ctx.fillStyle = '#7a5434'; ctx.fill();
      H.roundRect(ctx, -24 * s, -32 * s, 48 * s, 64 * s, 3 * s); ctx.fillStyle = '#f4f1ea'; ctx.fill();
      H.roundRect(ctx, -12 * s, -46 * s, 24 * s, 12 * s, 3 * s); ctx.fillStyle = '#c9ced8'; ctx.fill();
      ctx.fillStyle = '#c9ced8'; for (let i = 0; i < 4; i++) ctx.fillRect(-16 * s, (-20 + i * 13) * s, (i === 3 ? 18 : 30) * s, 4 * s);
      ctx.restore();
    }
  }
  function tick(x, y, k) {
    if (k <= 0) return;
    const p = K.easeOutBack(clamp(k));
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
    ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    ctx.strokeStyle = '#10142a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-3, 8); ctx.lineTo(11, -8); ctx.stroke();
    ctx.restore();
  }
  function dust(x, y, k) {
    if (k <= 0 || k >= 1) return;
    for (let i = 0; i < 7; i++) {
      const a = Math.PI + (i / 6) * Math.PI, r = 30 + 90 * easeOutCubic(k);
      ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 1.4, y + Math.sin(a) * r * 0.35 - 6, 12 * (1 - k) + 4, 0, Math.PI * 2);
      ctx.fillStyle = H.rgba('#c9cfe6', 0.35 * (1 - k)); ctx.fill();
    }
  }

  // ---------------------------------------------------------------- warehouse set
  function warehouse(doorOpen) {
    const g = ctx.createLinearGradient(0, 0, 0, 1000); g.addColorStop(0, '#12162f'); g.addColorStop(1, '#232a52');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1000);
    ctx.fillStyle = 'rgba(255,255,255,0.035)'; for (let x = 0; x < 1080; x += 36) ctx.fillRect(x, 0, 14, 1000);
    // high windows
    for (let i = 0; i < 5; i++) {
      H.roundRect(ctx, 40 + i * 205, 250, 170, 90, 6); ctx.fillStyle = '#0b1030'; ctx.fill();
      ctx.fillStyle = 'rgba(140,170,255,0.12)'; ctx.fillRect(48 + i * 205, 258, 74, 74); ctx.fillRect(130 + i * 205, 258, 74, 74);
    }
    // back shelving with plain boxes
    for (let b = 0; b < 2; b++) {
      const sx = 30 + b * 330;
      ctx.fillStyle = '#323a68'; ctx.fillRect(sx, 520, 10, 480); ctx.fillRect(sx + 290, 520, 10, 480);
      for (let r = 0; r < 3; r++) {
        const sy = 600 + r * 140; ctx.fillStyle = '#3d467a'; ctx.fillRect(sx, sy, 300, 10);
        for (let c = 0; c < 3; c++) { const w = 70 + 16 * H.hash(b * 9 + r * 3 + c, 3); H.roundRect(ctx, sx + 16 + c * 92, sy - 64, w, 64, 4); ctx.fillStyle = H.mixHex('#6d5638', '#2a2f55', 0.55); ctx.fill(); }
      }
    }
    // hanging lamps with light cones
    for (const lx of [260, 600]) {
      ctx.fillStyle = '#3a4270'; ctx.fillRect(lx - 2, 0, 4, 420);
      ctx.beginPath(); ctx.moveTo(lx - 46, 446); ctx.lineTo(lx + 46, 446); ctx.lineTo(lx + 20, 414); ctx.lineTo(lx - 20, 414); ctx.closePath(); ctx.fillStyle = '#4a5390'; ctx.fill();
      const cg = ctx.createLinearGradient(0, 446, 0, 1010); cg.addColorStop(0, 'rgba(255,236,190,0.16)'); cg.addColorStop(1, 'rgba(255,236,190,0)');
      ctx.beginPath(); ctx.moveTo(lx - 40, 446); ctx.lineTo(lx + 40, 446); ctx.lineTo(lx + 230, 1010); ctx.lineTo(lx - 230, 1010); ctx.closePath(); ctx.fillStyle = cg; ctx.fill();
    }
    // roller door (right): night outside
    const dx0 = 740, dx1 = 1020, dy0 = 560, dy1 = 1000;
    ctx.fillStyle = '#05071a'; ctx.fillRect(dx0, dy0, dx1 - dx0, dy1 - dy0);
    const og = ctx.createLinearGradient(0, dy0, 0, dy1); og.addColorStop(0, '#0d1440'); og.addColorStop(1, '#1d2660');
    ctx.fillStyle = og; ctx.fillRect(dx0 + 10, dy0 + 10, dx1 - dx0 - 20, dy1 - dy0 - 10);
    for (let i = 0; i < 9; i++) { const sx = dx0 + 30 + H.hash(i, 41) * 230, sy = dy0 + 30 + H.hash(i, 42) * 200; ctx.fillStyle = H.rgba('#ffffff', 0.4 + 0.4 * Math.sin(t * 2 + i)); ctx.fillRect(sx, sy, 3, 3); }
    ctx.fillStyle = '#141a3c'; ctx.fillRect(dx0 + 10, dy1 - 60, dx1 - dx0 - 20, 60);
    const shut = (1 - doorOpen) * (dy1 - dy0);
    for (let y = dy0; y < dy0 + shut; y += 22) { ctx.fillStyle = (Math.floor((y - dy0) / 22) % 2) ? '#5a6390' : '#4d5583'; ctx.fillRect(dx0, y, dx1 - dx0, Math.min(22, dy0 + shut - y)); }
    ctx.fillStyle = '#2b3263'; ctx.fillRect(dx0 - 16, dy0 - 30, dx1 - dx0 + 32, 34); ctx.fillRect(dx0 - 16, dy0, 16, dy1 - dy0); ctx.fillRect(dx1, dy0, 16, dy1 - dy0);
    // floor
    const fg = ctx.createLinearGradient(0, 1000, 0, 1920); fg.addColorStop(0, '#1b2042'); fg.addColorStop(1, '#090b18');
    ctx.fillStyle = fg; ctx.fillRect(0, 1000, 1080, 920);
    ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fillRect(0, 1000, 1080, 5);
    ctx.fillStyle = H.rgba(ACC, 0.35); for (let x = 20; x < 1080; x += 90) ctx.fillRect(x, 1080, 50, 8);
    return { door: { x0: dx0, x1: dx1, y0: dy0, y1: dy1 } };
  }
  const pill = (x, y, k, text, o = {}) => { if (k > 0) K.drawLabel(ctx, x, y, Math.min(1.08, k), Object.assign({ text, size: o.size || 30 }, o)); };

  ctx.save();
  if (mode === 'hook') {
    const tDummy = at(P.dummyCue, D * 0.62);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.07, x: 520, y: 820 }]);
    warehouse(1);
    // pallet where the real servers stood
    H.roundRect(ctx, 220, 1000, 250, 22, 4); ctx.fillStyle = '#7a5a3a'; ctx.fill();
    // dummies drop in (anticipation: shadow grows first), two of them
    for (let i = 0; i < 2; i++) {
      const t0 = tDummy - 0.15 + i * 0.32, k = clamp((t - t0) / 0.38);
      if (t < t0 - 0.3) continue;
      const land = 1000 - i * 112, y = k < 1 ? lerp(land - 520, land, k * k) : land - Math.abs(Math.sin((t - t0 - 0.38) * 14)) * 18 * Math.max(0, 1 - (t - t0 - 0.38) * 3);
      if (i === 0) K.shadow(ctx, 345, 1000, 190 * clamp((t - t0 + 0.3) / 0.6), 0.3);
      server(345, y, 0.95, { fake: 1, shadow: false, reveal: (t - t0 - 0.35) / 0.35 });
      if (i === 0) dust(345, 1000, (t - t0 - 0.38) / 0.7);
    }
    // courier wheels the real servers out of the door
    const u = K.phase(t, 0.15, Math.max(1.5, tDummy + 0.4), (k) => H.clamp(k));
    const x = lerp(470, 1250, u);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1020, 1920); ctx.clip(); // leaves through the door
    courierTruck(x, 1010, 1.0, 2, t, {});
    ctx.restore();
  } else if (mode === 'audit') {
    const tMany = at(P.dummyCue, D * 0.25), tPaper = at(P.paperCue, D * 0.68), tReal = at(P.realCue, D * 0.86);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tMany, zoom: 1.05, x: 440, y: 760 }, { t: tPaper, zoom: 1.04, x: 520, y: 760 }, { t: D, zoom: 1.0 }]);
    warehouse(1);
    // stacks of dummies (3 stacks x 3 high) on the left
    const stacks = [[150, 3], [330, 3], [510, 2]];
    let n = 0;
    stacks.forEach(([sx, h], si) => {
      for (let j = 0; j < h; j++) {
        const reveal = (t - tMany - 0.25 - n * 0.12) / 0.35;
        server(sx, 1005 - j * 118, 0.92, { fake: clamp(0.55 + 0.45 * smooth((t - tMany) / 0.6)), shadow: j === 0, reveal, seed: n });
        n++;
      }
    });
    // auditor walks in, then ticks each stack
    const walkEnd = Math.min(tMany - 0.3, 2.6);
    const ax = lerp(1160, 770, K.phase(t, 0.2, walkEnd, (k) => 1 - (1 - H.clamp(k)) ** 2));
    const walking = t < walkEnd;
    auditor(ax, 1030, 1.45, { walk: walking ? t : undefined, pose: 'phone', mood: t > tPaper ? 'happy' : 'neutral' });
    stacks.forEach(([sx, h], si) => tick(sx, 1005 - h * 118 - 40, (t - walkEnd - 0.2 - si * 0.5) / 0.35));
    pill(487, 470, K.popIn(t, 0.3), P.by || 'Investigators say', { dot: true });
    pill(320, 560, K.popIn(t, tMany + 0.1), P.many || 'Dummy servers', { accent: true, size: 27 });
    // false paperwork above the auditor
    const pp = K.popIn(t, tPaper - 0.1, 0.45);
    if (pp > 0) {
      const py = 715 + K.bob(t, 6, 0.5);
      K.drawDocument(ctx, 640, py, 0.85 * pp, { lines: 6, shadow: false });
      if (t > tPaper + 0.35) K.drawStamp(ctx, 655, py - 10, 0.55, { kind: 'cross', text: P.paper || 'FALSE', land: (t - tPaper - 0.35) / 0.5 });
    }
    // the real servers sneak out of the door (small, outside)
    if (t > tReal - 1.6) {
      const u = K.phase(t, tReal - 1.6, D, (k) => H.clamp(k));
      ctx.save(); ctx.beginPath(); ctx.rect(750, 560, 260, 440); ctx.clip();
      courierTruck(lerp(790, 1010, u), 990, 0.6, 2, t);
      ctx.restore();
      pill(800, 545, K.popIn(t, tReal), P.gone || 'Real ones: gone', { size: 24, accent: true });
    }
  } else {
    // payoff
    const tReal = at(P.realCue, D * 0.25), tFake = at(P.fakeCue, D * 0.45), tQ = at(P.qCue, D * 0.68);
    K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 600, y: 760 }, { t: tFake, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
    warehouse(1);
    const stacks = [[140, 2], [320, 3]];
    let n = 0;
    stacks.forEach(([sx, h]) => { for (let j = 0; j < h; j++) { server(sx, 1005 - j * 118, 0.92, { fake: 1, shadow: j === 0, reveal: 1, seed: n }); n++; } });
    auditor(520, 1030, 1.45, { pose: t > tQ ? 'shrug' : 'phone', mood: t > tQ ? 'worried' : 'happy' });
    const u = K.phase(t, 0, tReal + 1.6, (k) => H.clamp(k));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1020, 1920); ctx.clip();
    courierTruck(lerp(760, 1180, u), 1010, 0.9, 2, t);
    ctx.restore();
    K.glow(ctx, 880, 780, 220, ACC, 0.18 * smooth((t - tReal) / 0.5));
    pill(690, 625, K.popIn(t, tReal - 0.1), P.dest || 'Real ones: shipped out', { accent: true, size: 28 });
    pill(240, 640, K.popIn(t, tFake), P.stay || 'Fakes: stayed', { size: 30, dot: true });
    const qk = K.popIn(t, tQ, 0.5);
    if (qk > 0) {
      ctx.save(); ctx.translate(487, 500); ctx.scale(qk, qk);
      const txt = P.question || 'Can the rules be enforced?';
      const ft = H.fitText(ctx, txt, 'display', 50, 28, 720);
      ctx.font = ft.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const w = ctx.measureText(txt).width + 70;
      H.roundRect(ctx, -w / 2, -52, w, 104, 26); ctx.fillStyle = 'rgba(8,10,24,0.9)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.fillText(txt, 0, 3);
      ctx.restore();
    }
  }
  ctx.restore();
}
