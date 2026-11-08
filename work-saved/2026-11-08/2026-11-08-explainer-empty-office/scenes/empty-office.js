// Scene "empty-office" (full frame). An unfinished, empty office unit: bare concrete walls, a door opening on the left,
// a window opening with a dusk skyline, and bare wires dangling from the ceiling where the lights should be (they sway).
// A licence sheet is taped to the wall. Generic cartoons only, no logos.
// Fits: "approved / registered / licensed company turns out to be an empty address", shell companies, ghost offices,
//       "who checks?" oversight stories.
// modes: "hook"   cold open: a courier pushes a hand truck with a chip crate through the door at frame 0, the APPROVED
//                 stamp slams onto the licence (~0.6 s), the courier stops and looks round, "?" bubble.
//        "visit"  two cartoon reporters walk in, a flashlight sweeps; pills on cues; then a building-directory card with
//                 a magnifier and a "not listed" pill.
//        "caveat" quieter room: the stamped licence stays; a dashed ghost crate with a "?" on the floor; two hedge pills.
// params: mode, crate ("H200"), license ("LICENSE"), stamp ("APPROVED"), who (licence name line, "New Matrix")
//         visit: shell ("Hollow gray shell"), wires ("Wires where lights should be"), dirTitle ("BUILDING DIRECTORY"),
//                missing ("New Matrix: not listed"), shellCue ("shell"), wiresCue ("wires"), dirCue ("directory")
//         caveat: proof ("Empty office ≠ proof of wrongdoing"), ghost ("Chips arrived? Not shown"),
//                 proofCue ("proof"), ghostCue ("chips")
//         hook: stampAt (0.6 s), bubble ("?")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const mode = P.mode || 'hook';
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const FLOOR = 1000;

  // ---------------- timings
  const tStamp = mode === 'hook' ? (P.stampAt ?? 0.6) : -10;
  const tShell = at(P.shellCue || 'shell', D * 0.3) - 0.25;
  const tWires = at(P.wiresCue || 'wires', D * 0.45) - 0.25;
  const tDir = at(P.dirCue || 'directory', D * 0.78) - 1.4;
  const tProof = at(P.proofCue || 'proof', D * 0.3) - 0.6;
  const tGhost = at(P.ghostCue || 'chips', D * 0.65) - 0.4;

  ctx.save();
  if (mode === 'hook') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.04, x: 500, y: 760 }]);
    K.cameraShake(ctx, t, tStamp + 0.12, 0.35, 7);
  } else if (mode === 'visit') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: tDir, zoom: 1.03, x: 480, y: 740 }, { t: D, zoom: 1.05, x: 500, y: 740 }]);
  } else {
    K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 500, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 740 }]);
  }

  // ---------------- the room
  room(ctx, t, H, mode === 'caveat' ? 0.75 : 1);
  wires(ctx, t, H, mode === 'visit' ? K.popIn(t, tWires, 0.5) : 0, ACC);

  // licence on the wall (right)
  const LX = 742, LY = 880, LS = 1.4;
  K.drawDocument(ctx, LX, LY, LS, { lines: 5, shadow: false });
  // tape
  ctx.save(); ctx.fillStyle = 'rgba(240,230,190,0.75)';
  ctx.translate(LX - 52 * LS, LY - 177 * LS); ctx.rotate(-0.4); ctx.fillRect(-22, -8, 44, 16); ctx.restore();
  ctx.save(); ctx.fillStyle = 'rgba(240,230,190,0.75)';
  ctx.translate(LX + 52 * LS, LY - 177 * LS); ctx.rotate(0.4); ctx.fillRect(-22, -8, 44, 16); ctx.restore();
  ctx.fillStyle = '#1b2033'; ctx.font = H.font('bold', 28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(P.license || 'LICENSE', LX - 8, LY - 160 * LS);
  ctx.font = H.font('bold', 24); ctx.fillStyle = '#3a4058'; ctx.fillStyle = '#f5f1e6'; ctx.fillRect(LX - 62 * LS, LY - 142 * LS, 124 * LS, 24 * LS); ctx.fillStyle = '#3a4058'; ctx.fillText(P.who || 'New Matrix', LX, LY - 130 * LS);
  const stampLand = mode === 'hook' ? (t - tStamp) / 0.5 : 1;
  K.drawStamp(ctx, LX, LY - 10, 0.9, { kind: 'check', text: P.stamp || 'APPROVED', land: stampLand });

  // ---------------- modes
  if (mode === 'hook') {
    // courier pushing a hand truck with a chip crate through the door, stops, looks round
    const u = smooth(clamp((t + 0.9) / 2.1));
    const cx = lerp(110, 300, u), walking = u < 1;
    const look = t > 1.3 ? Math.sin((t - 1.3) * 2.4) : 0;
    // a visitor with a flashlight (no crate: the reporting doesn't show any chips arriving)
    const sw = Math.sin(t * 1.1) * 0.35, ang = -0.5 + sw;
    if (P.crate) handTruck(ctx, cx + 120, FLOOR, 1.0, H, ACC, P.crate, t);
    else {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const hx = cx + 44, hy = FLOOR - 150;
      const g = ctx.createRadialGradient(hx, hy, 10, hx, hy, 520);
      g.addColorStop(0, 'rgba(255,245,200,0.32)'); g.addColorStop(1, 'rgba(255,245,200,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(hx, hy);
      ctx.arc(hx, hy, 520, ang - 0.22, ang + 0.22); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    K.drawPerson(ctx, cx, FLOOR + 4, 1.3, { t, pose: 'stand', walk: walking ? t : undefined, mood: t > 1.2 ? 'shocked' : 'neutral', look, skin: 2, hair: 1, shirt: '#2f6f8f', hairStyle: 'short', seed: 12 });
    // cap
    if (!P.crate) flashlight(ctx, cx + 38, FLOOR - 140, ang, H);
    const bp = K.popIn(t, 1.25, 0.4);
    if (bp > 0) K.drawSpeechBubble(ctx, cx + 30, FLOOR - 330, 1, { text: P.bubble || '?', size: 54, tail: 'left', pop: bp });
  }

  if (mode === 'visit') {
    // two reporters walk in from the door
    const u1 = smooth(clamp((t - 0.1) / 2.4)), u2 = smooth(clamp((t - 0.6) / 2.4));
    const x1 = lerp(60, 250, u1), x2 = lerp(-40, 430, u2);
    const sweep = Math.sin(t * 0.9) * 0.35;
    // flashlight cone from reporter 2
    if (u2 > 0.05) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const hx = x2 + 40, hy = FLOOR - 150, ang = -0.55 + sweep;
      const g = ctx.createRadialGradient(hx, hy, 10, hx, hy, 520);
      g.addColorStop(0, 'rgba(255,245,200,0.32)'); g.addColorStop(1, 'rgba(255,245,200,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(hx, hy);
      ctx.arc(hx, hy, 520, ang - 0.22, ang + 0.22); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    K.drawPerson(ctx, x1, FLOOR + 6, 1.25, { t, pose: 'phone', walk: u1 < 1 ? t : undefined, mood: t > tShell ? 'worried' : 'neutral', skin: 0, hair: 2, shirt: 3, hairStyle: 'long', seed: 21 });
    K.drawPerson(ctx, x2, FLOOR + 10, 1.3, { t, pose: t > tDir + 0.6 ? 'point' : 'stand', walk: u2 < 1 ? t + 0.3 : undefined, mood: t > tShell ? 'shocked' : 'neutral', look: 0.6, skin: 3, hair: 0, shirt: 1, hairStyle: 'short', seed: 22 });
    if (u2 > 0.05) flashlight(ctx, x2 + 34, FLOOR - 140, -0.55 + sweep, H);

    // pills
    const sp = K.popIn(t, tShell, 0.45), wp = K.popIn(t, tWires, 0.45);
    const lift = smooth((t - tDir) / 0.6);
    ctx.save(); ctx.globalAlpha = 1 - 0.65 * lift;
    if (sp > 0) pill(ctx, H, 330, 520, sp, P.shell || 'Hollow gray shell', { accent: false, size: 32 });
    if (wp > 0) pill(ctx, H, 487, 610, wp, P.wires || 'Wires where lights should be', { accent: true, size: 30 });
    ctx.restore();

    // directory card (inset, centre-right)
    const dp = K.popIn(t, tDir, 0.5);
    if (dp > 0) directory(ctx, t, H, K, dp, t - tDir, P, ACC);
  }

  if (mode === 'caveat') {
    // ghost crate on the floor where a delivery would be
    const gp = K.popIn(t, tGhost, 0.5);
    const gx = 400, gy = FLOOR - 4;
    ctx.save(); ctx.globalAlpha = 0.35 + 0.65 * clamp(gp);
    ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 20; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    roundRect(ctx, gx - 110, gy - 170, 220, 170, 12); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,' + (0.55 + 0.25 * Math.sin(t * 4)) + ')'; ctx.font = H.font('display', 96); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('?', gx, gy - 85);
    ctx.restore();
    K.shadow(ctx, gx, gy, 200, 0.18);
    // a lone reporter thinking at the left
    K.drawPerson(ctx, 175, FLOOR + 8, 1.25, { t, pose: 'shrug', mood: 'neutral', look: 0.7, skin: 0, hair: 2, shirt: 3, hairStyle: 'long', seed: 21 });
    const pp = K.popIn(t, tProof, 0.5);
    if (pp > 0) pill(ctx, H, 487, 540, pp, P.proof || 'Empty office ≠ proof of wrongdoing', { accent: true, size: 30 });
    if (gp > 0) pill(ctx, H, 440, 750, gp, P.ghost || 'Chips arrived? Not shown', { accent: false, size: 30 });
  }
  ctx.restore();
}

// ---------------------------------------------------------------- helpers
function pill(ctx, H, x, y, pop, text, o = {}) {
  const size = o.size || 30;
  ctx.save(); ctx.font = H.font('bold', size);
  const tw = ctx.measureText(text).width, w = tw + size * 1.4, h = size * 1.8;
  const cx = Math.max(130 + w / 2, Math.min(845 - w / 2, x));
  const k = Math.min(1.04, pop);
  ctx.translate(cx, y); ctx.scale(k, k);
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
  ctx.fillStyle = o.accent ? H.kit.ACCENT.base : 'rgba(10,12,22,0.9)'; ctx.fill();
  if (!o.accent) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.stroke(); }
  ctx.fillStyle = o.accent ? H.kit.ACCENT.deep : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 2);
  ctx.restore();
}

function room(ctx, t, H, light) {
  const { roundRect } = H;
  // whole frame base
  ctx.fillStyle = '#1d2130'; ctx.fillRect(0, 0, 1080, 1920);
  // ceiling slab with exposed beams
  ctx.fillStyle = '#3a3f4d'; ctx.fillRect(0, 0, 1080, 380);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = '#323745'; ctx.fillRect(i * 190 + 20, 330, 120, 50); }
  ctx.fillStyle = '#2b2f3b'; ctx.fillRect(0, 372, 1080, 12);
  // back wall: bare concrete with formwork seams
  const g = ctx.createLinearGradient(0, 384, 0, 1000);
  g.addColorStop(0, '#6c717d'); g.addColorStop(1, '#585d69');
  ctx.fillStyle = g; ctx.fillRect(0, 384, 1080, 616);
  ctx.strokeStyle = 'rgba(30,34,46,0.25)'; ctx.lineWidth = 2;
  for (let x = 0; x <= 1080; x += 180) { ctx.beginPath(); ctx.moveTo(x, 384); ctx.lineTo(x, 1000); ctx.stroke(); }
  for (let y = 590; y < 1000; y += 205) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }
  // tie holes + stains (deterministic)
  ctx.fillStyle = 'rgba(30,34,46,0.35)';
  for (let x = 90; x < 1080; x += 180) for (let y = 487; y < 1000; y += 205) { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = 'rgba(40,44,56,0.18)';
  ctx.beginPath(); ctx.ellipse(560, 960, 160, 40, 0, 0, Math.PI * 2); ctx.fill();
  // door opening (left), dusk light outside
  roundRect(ctx, 40, 640, 170, 360, 4); ctx.fillStyle = '#e9a77a'; ctx.fill();
  const dg = ctx.createLinearGradient(0, 640, 0, 1000); dg.addColorStop(0, '#f2b880'); dg.addColorStop(1, '#b8735a');
  ctx.fillStyle = dg; ctx.fillRect(50, 650, 150, 350);
  ctx.fillStyle = '#4a4f5c'; ctx.fillRect(30, 630, 190, 14); ctx.fillRect(30, 630, 14, 370); ctx.fillRect(206, 630, 14, 370);
  // window opening (centre), no glass, dusk skyline
  const WX = 380, WY = 470, WW = 240, WH = 200;
  const sg = ctx.createLinearGradient(0, WY, 0, WY + WH); sg.addColorStop(0, '#7a6aa8'); sg.addColorStop(1, '#f0a678');
  ctx.fillStyle = sg; ctx.fillRect(WX, WY, WW, WH);
  ctx.fillStyle = '#4b4566';
  [[0, 90], [40, 130], [85, 70], [120, 150], [170, 100], [205, 120]].forEach(([dx, h]) => ctx.fillRect(WX + dx, WY + WH - h * 0.6, 34, h * 0.6));
  ctx.lineWidth = 12; ctx.strokeStyle = '#4a4f5c'; ctx.strokeRect(WX, WY, WW, WH);
  // light beam from the window onto the floor
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.14 * light;
  ctx.fillStyle = '#ffd7a8'; ctx.beginPath(); ctx.moveTo(WX, WY + WH); ctx.lineTo(WX + WW, WY + WH); ctx.lineTo(WX + WW + 160, 1130); ctx.lineTo(WX - 40, 1130); ctx.closePath(); ctx.fill();
  ctx.restore();
  // dust motes in the beam
  for (let i = 0; i < 18; i++) {
    const hx = H.hash(i, 3), hy = H.hash(i, 7);
    const x = WX + 20 + hx * (WW + 60) + Math.sin(t * 0.6 + i) * 12;
    const y = WY + WH + 20 + ((hy * 400 + t * (8 + 6 * hx)) % 400);
    ctx.fillStyle = 'rgba(255,240,210,' + (0.25 + 0.3 * hx) * light + ')';
    ctx.beginPath(); ctx.arc(x, y, 2 + 2 * hy, 0, Math.PI * 2); ctx.fill();
  }
  // floor: bare screed
  const fg = ctx.createLinearGradient(0, 1000, 0, 1920); fg.addColorStop(0, '#4b505c'); fg.addColorStop(1, '#2a2e39');
  ctx.fillStyle = fg; ctx.fillRect(0, 1000, 1080, 920);
  ctx.fillStyle = '#3c414d'; ctx.fillRect(0, 996, 1080, 8);
  ctx.strokeStyle = 'rgba(20,24,32,0.25)'; ctx.lineWidth = 2;
  for (let i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(540 + i * 140, 1004); ctx.lineTo(540 + i * 420, 1920); ctx.stroke(); }
  if (light < 1) { ctx.fillStyle = 'rgba(12,16,40,' + (1 - light) * 0.8 + ')'; ctx.fillRect(0, 0, 1080, 1920); }
}

// bare wires hanging from empty ceiling-light boxes; glow = highlight (0..1)
function wires(ctx, t, H, glow, ACC) {
  const roots = [[270, 160], [400, 120], [560, 205], [690, 140], [840, 185]];
  roots.forEach(([x, len], i) => {
    // empty light-fixture recess
    ctx.fillStyle = '#23262f'; H.roundRect(ctx, x - 46, 378, 92, 16, 4); ctx.fill();
    const sway = Math.sin(t * 1.3 + i * 1.7) * 14, sway2 = Math.sin(t * 1.1 + i) * 8;
    const ex = x + sway, ey = 386 + len;
    for (let k = 0; k < 2; k++) {
      const off = (k - 0.5) * 10;
      ctx.strokeStyle = k ? '#c0392b' : '#20232c'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x + off, 386);
      ctx.quadraticCurveTo(x + off + sway2, 386 + len * 0.6, ex + off * 1.6, ey + k * 8); ctx.stroke();
      // bare copper tips
      ctx.strokeStyle = '#e8a35a'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(ex + off * 1.6, ey + k * 8); ctx.lineTo(ex + off * 2.2, ey + k * 8 + 12); ctx.stroke();
    }
    if (glow > 0) { H.glow(ctx, ex, ey + 6, 40, ACC, 0.35 * glow * (0.7 + 0.3 * Math.sin(t * 5 + i))); }
  });
}

function handTruck(ctx, x, y, s, H, ACC, label, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  H.kit.shadow(ctx, 0, 0, 170);
  // frame
  ctx.strokeStyle = '#2a2e3a'; ctx.lineWidth = 8; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-70, -250); ctx.lineTo(-62, -18); ctx.lineTo(70, -18); ctx.stroke();
  // wheel
  ctx.fillStyle = '#15171f'; ctx.beginPath(); ctx.arc(-58, -20, 20, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.translate(-58, -20); ctx.rotate(t * 4); ctx.fillStyle = '#596075'; ctx.fillRect(-3, -14, 6, 28); ctx.restore();
  // crate
  H.roundRect(ctx, -56, -190, 140, 168, 10); ctx.fillStyle = '#2b3048'; ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(56, -190, 28, 168);
  // chip icon on the crate
  ctx.fillStyle = ACC; H.roundRect(ctx, -22, -150, 56, 56, 6); ctx.fill();
  ctx.fillStyle = '#1b2033'; H.roundRect(ctx, -10, -138, 32, 32, 4); ctx.fill();
  ctx.strokeStyle = ACC; ctx.lineWidth = 3;
  for (let i = 0; i < 4; i++) { const o = -14 + i * 12; ctx.beginPath(); ctx.moveTo(-28, -136 + i * 12); ctx.lineTo(-22, -136 + i * 12); ctx.moveTo(34, -136 + i * 12); ctx.lineTo(40, -136 + i * 12); ctx.moveTo(-16 + i * 12 + 8, -156); ctx.lineTo(-16 + i * 12 + 8, -150); ctx.stroke(); void o; }
  ctx.fillStyle = '#ffffff'; ctx.font = H.font('display', 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(label, 6, -58);
  ctx.restore();
}

function flashlight(ctx, x, y, ang, H) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
  H.roundRect(ctx, -10, -11, 56, 22, 6); ctx.fillStyle = '#2c3142'; ctx.fill();
  ctx.fillStyle = '#fff4c8'; ctx.fillRect(42, -12, 8, 24);
  ctx.restore();
}

function directory(ctx, t, H, K, pop, lt, P, ACC) {
  const X0 = 495, Y0 = 470, W = 330, HH = 330;
  const k = Math.min(1.03, pop);
  ctx.save(); ctx.translate(X0 + W / 2, Y0 + HH / 2); ctx.scale(k, k); ctx.translate(-(X0 + W / 2), -(Y0 + HH / 2));
  H.roundRect(ctx, X0, Y0, W, HH, 18); ctx.fillStyle = '#20243a'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = '#8a8fa0'; ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.font = H.font('bold', 24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(P.dirTitle || 'BUILDING DIRECTORY', X0 + W / 2, Y0 + 38);
  for (let i = 0; i < 5; i++) {
    const y = Y0 + 86 + i * 44;
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.font = H.font('ui', 20); ctx.textAlign = 'left';
    ctx.fillText(String(101 + i * 2), X0 + 24, y);
    H.roundRect(ctx, X0 + 80, y - 8, 120 + 90 * H.hash(i, 11), 16, 8); ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fill();
  }
  ctx.restore();
  // magnifier sweeping down the list
  const m = H.smooth(H.clamp((lt - 0.3) / 1.2));
  if (pop >= 1 || lt > 0.5) {
    const mx = X0 + 200 + Math.sin(lt * 3) * 40 * (1 - m), my = Y0 + 90 + m * 180;
    ctx.save(); ctx.lineWidth = 10; ctx.strokeStyle = '#d9dce6';
    ctx.beginPath(); ctx.arc(mx, my, 38, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(200,230,255,0.15)'; ctx.fill();
    ctx.lineWidth = 14; ctx.strokeStyle = '#3a3f52'; ctx.beginPath(); ctx.moveTo(mx + 27, my + 27); ctx.lineTo(mx + 70, my + 70); ctx.stroke();
    ctx.restore();
  }
  const np = K.popIn(lt, 1.4, 0.45);
  if (np > 0) {
    // red cross badge + pill
    ctx.save(); const s = Math.min(1.05, np);
    ctx.translate(X0 + W - 10, Y0 + 10); ctx.scale(s, s);
    ctx.fillStyle = '#e5484d'; ctx.beginPath(); ctx.arc(0, 0, 32, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(12, 12); ctx.moveTo(12, -12); ctx.lineTo(-12, 12); ctx.stroke();
    ctx.restore();
    pill(ctx, H, X0 + W / 2 - 20, Y0 + HH + 50, np, P.missing || 'New Matrix: not listed', { accent: true, size: 28 });
  }
}
