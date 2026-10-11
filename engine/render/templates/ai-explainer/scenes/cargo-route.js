// Scene "cargo-route" (full frame). A stylised sea map (abstract land blobs with name pills, no real borders): a cargo
// ship carries glowing servers from an origin to a middle stop; a big figure counts up; then a second leg carries the
// cargo on to a final destination while a second figure and a 3-week calendar appear, and the cargo turns into plain
// unmarked cardboard boxes. Ends with the ship docked at the destination.
// Fits: smuggling / transshipment / supply-chain routes, "bought via X, sent to Y", goods rerouted through a third place.
// params: a, b, c          place pills: origin, stopover, destination (default "Origin", "Stopover", "Destination")
//         amount1, cap1     first figure + caption (default "Millions", "in goods bought"); a leading number counts up
//         amount2, cap2     second figure + caption (default "Then more", "sent onward")
//         weeks             calendar label (default "In weeks")
//         boxes             pill when the cargo turns plain (default "Unmarked boxes")
//         by                attribution pill (default "Investigators allege")
//         cues: buyCue (first figure, 25 %), weeksCue (calendar + second figure, 48 %), arriveCue (arrival, 80 %),
//               boxCue (plain boxes, 88 %)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  // pills are nudged sideways so they stay inside x 60-915 whatever the text length
  const pill = (x, y, k, text, o = {}) => {
    if (k <= 0) return;
    const size = o.size || 30; ctx.save(); ctx.font = K.font.ui(size); const w = ctx.measureText(String(text)).width + size * 1.6 + (o.dot ? size * 0.8 : 0); ctx.restore();
    x = Math.max(80 + w / 2, Math.min(895 - w / 2, x)); // margin for the slow 5 % push-in
    K.drawLabel(ctx, x, y, Math.min(1.08, k), Object.assign({ text, size }, o));
  };
  const tBuy = at(P.buyCue, D * 0.25), tWeeks = at(P.weeksCue, D * 0.48), tDest = at(P.arriveCue || P.chinaCue, D * 0.8), tBox = at(P.boxCue, D * 0.88);

  // ---- sea
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#0b1636'); g.addColorStop(0.5, '#123064'); g.addColorStop(1, '#07102a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  ctx.strokeStyle = 'rgba(160,190,255,0.07)'; ctx.lineWidth = 2;
  for (let x = 0; x <= 1080; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1920); ctx.stroke(); }
  for (let y = 0; y <= 1920; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }
  // wave dashes drifting
  ctx.strokeStyle = 'rgba(190,215,255,0.16)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (let i = 0; i < 26; i++) {
    const wx = ((H.hash(i, 1) * 1180 + t * 22) % 1180) - 50, wy = 420 + H.hash(i, 2) * 700;
    ctx.beginPath(); ctx.moveTo(wx, wy); ctx.quadraticCurveTo(wx + 14, wy - 8, wx + 28, wy); ctx.quadraticCurveTo(wx + 42, wy + 8, wx + 56, wy); ctx.stroke();
  }
  const blob = (cx, cy, rx, ry, seed, col) => {
    ctx.beginPath();
    for (let i = 0; i <= 28; i++) {
      const a = (i / 28) * Math.PI * 2, r = 1 + 0.16 * Math.sin(a * 3 + seed) + 0.08 * Math.sin(a * 5 + seed * 2);
      const x = cx + Math.cos(a) * rx * r, y = cy + Math.sin(a) * ry * r;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.stroke();
  };
  const z = lerp(1.0, 1.05, K.phase(t, 0, D));
  ctx.save(); ctx.translate(487, 760); ctx.scale(z, z); ctx.translate(-487, -760);
  // land: origin (left), middle stop (bottom right), destination (top right)
  blob(40, 780, 230, 240, 1.3, '#2e4a5e');
  blob(760, 1000, 230, 120, 2.1, '#355a4e');
  blob(840, 640, 250, 150, 0.4, '#5a3f52');
  // origin: factory with a server rack sign
  K.drawBuilding(ctx, 130, 820, 0.45, { t, color: '#5b6aa8', floors: 4, lit: 0.6 });
  // middle: warehouse
  const wx0 = 700, wy0 = 1010;
  H.roundRect(ctx, wx0 - 90, wy0 - 90, 180, 90, 8); ctx.fillStyle = '#7d8bb0'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(wx0 - 100, wy0 - 88); ctx.lineTo(wx0, wy0 - 140); ctx.lineTo(wx0 + 100, wy0 - 88); ctx.closePath(); ctx.fillStyle = '#5d6a90'; ctx.fill();
  H.roundRect(ctx, wx0 - 30, wy0 - 56, 60, 56, 4); ctx.fillStyle = '#2a3150'; ctx.fill();
  K.glow(ctx, wx0, wy0 - 60, 160, ACC, 0.25 * smooth((t - tBuy) / 0.5) * (1 - smooth((t - tWeeks) / 0.8)) + 0.04);
  // destination: city dots
  for (let i = 0; i < 6; i++) { const bx = 770 + i * 30, bh = 40 + 50 * H.hash(i, 9); H.roundRect(ctx, bx, 690 - bh, 24, bh, 4); ctx.fillStyle = '#7a5c74'; ctx.fill(); }
  K.glow(ctx, 850, 650, 180, ACC, 0.35 * smooth((t - tDest) / 0.6));

  pill(130, 625, K.popIn(t, 0.2), P.a || 'Origin', { size: 30 });
  pill(840, 1048, K.popIn(t, 0.6), P.b || 'Stopover', { size: 30 });
  pill(900, 780, K.popIn(t, tWeeks - 0.6), P.c || 'Destination', { size: 32, accent: t > tDest });

  // routes
  const leg1 = K.bezier(250, 840, 380, 1010, 500, 1030, 590, 960, 40);
  const leg2 = K.bezier(700, 900, 620, 830, 640, 740, 760, 700, 40);
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 6; ctx.setLineDash([4, 18]); ctx.lineCap = 'round'; ctx.lineDashOffset = -t * 40;
  K.pathDraw(ctx, leg1, K.phase(t, 0.6, 2.0));
  ctx.strokeStyle = H.rgba(ACC, 0.8);
  K.pathDraw(ctx, leg2, K.phase(t, tWeeks + 0.3, tWeeks + 1.5));
  ctx.restore();

  // the ship: leg 1 from 1.2 s to the buy cue, waits, leg 2 from the weeks cue to the arrival cue
  const u1 = K.phase(t, 1.0, Math.max(2.2, tBuy + 0.4)), u2 = K.phase(t, tWeeks + 0.8, Math.max(tWeeks + 2, tDest));
  const [sx, sy] = t < tWeeks + 0.8 ? K.pathPoint(leg1, u1) : K.pathPoint(leg2, u2);
  const plain = smooth((t - tBox) / 0.5);
  ship(sx, sy + K.bob(t, 4, 0.7), t < tWeeks + 0.8 ? 0.9 : 0.85, plain);
  ctx.restore();

  // figures in the top band
  const f1 = K.popIn(t, tBuy - 0.1, 0.45) * (1 - smooth((t - tWeeks + 0.2) / 0.3));
  if (f1 > 0) figure(487, 500, f1, P.amount1 || 'Millions', P.cap1 || 'in goods bought', 1);
  const f2 = K.popIn(t, tWeeks + 0.1, 0.45);
  if (f2 > 0) figure(487, 500, f2, P.amount2 || 'Then more', P.cap2 || 'sent onward', 1);
  // calendar of 3 weeks (bottom left)
  const ck = K.popIn(t, tWeeks, 0.45);
  if (ck > 0) calendar(250, 1000, ck, K.phase(t, tWeeks + 0.2, tWeeks + 2.4, (k) => H.clamp(k)));
  pill(400, 680, K.popIn(t, 0.3) * (1 - smooth((t - tBuy) / 0.3)), P.by || 'Investigators allege', { dot: true, size: 28 });
  pill(470, 650, K.popIn(t, tBox), P.boxes || 'Unmarked boxes', { size: 28, accent: true });

  function figure(x, y, k, txt, cap, prog) {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    const m = String(txt).match(/^([^0-9]*?)(\d+)(\.\d+)?(.*)$/);
    let shown = txt;
    if (m && prog < 1) { const dec = m[3] ? m[3].length - 1 : 0; shown = m[1] + (parseFloat(m[2] + (m[3] || '')) * prog).toFixed(dec) + m[4]; }
    const ft = H.fitText(ctx, txt, 'display', 104, 56, 800);
    ctx.font = ft.font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(6,7,14,0.85)'; ctx.strokeText(shown, 0, 0);
    ctx.fillStyle = ACC; ctx.fillText(shown, 0, 0);
    ctx.font = H.font('ui', 34); ctx.lineWidth = 9; ctx.strokeText(cap, 0, 56); ctx.fillStyle = '#ffffff'; ctx.fillText(cap, 0, 56);
    ctx.restore();
  }
  function calendar(x, y, k, prog) {
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    H.roundRect(ctx, -150, -150, 300, 150, 18); ctx.fillStyle = 'rgba(8,10,24,0.92)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke();
    for (let w = 0; w < 3; w++) {
      const on = prog * 3 > w;
      H.roundRect(ctx, -130 + w * 88, -132, 76, 70, 10); ctx.fillStyle = on ? ACC : '#2a3157'; ctx.fill();
      ctx.font = H.font('display', 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = on ? '#10142a' : '#8e96c0';
      ctx.fillText('W' + (w + 1), -92 + w * 88, -96);
    }
    ctx.font = H.font('ui', 28); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.fillText(P.weeks || 'In weeks', 0, -30);
    ctx.restore();
  }
  function ship(x, y, s, plain) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.glow(ctx, 0, -20, 120, ACC, 0.2 * (1 - plain));
    // wake
    ctx.fillStyle = 'rgba(220,235,255,0.25)'; ctx.beginPath(); ctx.ellipse(-20, 14, 120, 12, 0, 0, Math.PI * 2); ctx.fill();
    // hull
    ctx.beginPath(); ctx.moveTo(-110, -20); ctx.lineTo(110, -20); ctx.lineTo(84, 18); ctx.lineTo(-90, 18); ctx.closePath(); ctx.fillStyle = '#b8473f'; ctx.fill();
    ctx.fillStyle = '#26304f'; ctx.fillRect(-104, -26, 210, 10);
    // cabin
    H.roundRect(ctx, 60, -84, 40, 60, 6); ctx.fillStyle = '#e8e4da'; ctx.fill();
    ctx.fillStyle = '#26304f'; ctx.fillRect(66, -76, 28, 10);
    H.roundRect(ctx, 72, -106, 14, 24, 4); ctx.fillStyle = '#26304f'; ctx.fill();
    // cargo: 3 crates; servers that turn into plain cardboard
    for (let i = 0; i < 3; i++) {
      const cx = -90 + i * 50, cy = -26;
      H.roundRect(ctx, cx, cy - 48, 46, 48, 5); ctx.fillStyle = H.mixHex('#1c2242', '#c49a64', plain); ctx.fill();
      if (plain < 0.5) {
        for (let r = 0; r < 2; r++) { const on = H.hash(i * 3 + r, Math.floor(t * 6)) < 0.7; ctx.beginPath(); ctx.arc(cx + 34, cy - 34 + r * 20, 3.5, 0, Math.PI * 2); ctx.fillStyle = on ? ACC : 'rgba(255,255,255,0.2)'; ctx.fill(); }
      } else {
        ctx.fillStyle = '#a77d4b'; ctx.fillRect(cx + 19, cy - 48, 8, 48);
      }
    }
    ctx.restore();
  }
}
