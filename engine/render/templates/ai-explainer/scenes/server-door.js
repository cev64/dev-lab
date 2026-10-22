// Scene "server-door" (full frame, 1 beat). Night street: a small "website server" house (rack glowing through its
// window, a door with a password keypad). A big severity score counts up on a meter at the top. A shadowy hooded
// figure (generic, no face) walks up; the keypad asks for a password but the door swings open anyway; a code chip
// flies in and the server flashes red; then a magnifier peeks into the window and memory cards float out to the
// figure. Metaphor only (no real exploit steps).
// params: score ("9.0"), of ("/ 10"), scoreLabel ("Severity score"), server ("Website server"), ask ("PASSWORD?"),
//         nopass ("No password needed"), run ("Runs its own code"), peek ("Reads memory"),
//         cues (narration words, "word#n" = (n+1)th time): scoreCue, strangerCue, passCue, runCue, peekCue
// Fits: unauthenticated remote access / server takeover / data-leak stories.
const RED = '#ff5a52';
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, roundRect, rgba } = H;
  const at = (w, d) => { if (!w) return d; const [wd, n] = String(w).split('#'); const v = info.timeOf(wd, n ? parseInt(n, 10) : 0); return v == null ? d : v; };
  const tS = at(P.scoreCue, 0.8) - 0.2, tH = at(P.strangerCue, D * 0.3) - 0.6, tP = at(P.passCue, D * 0.42) - 0.2;
  const tR = at(P.runCue, D * 0.57) - 0.2, tK = at(P.peekCue, D * 0.84) - 0.3;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tR, zoom: 1.03, x: 520, y: 820 }, { t: D, zoom: 1.06, x: 560, y: 820 }]);
  const G = K.world.city(ctx, { t, time: 'night', groundY: 1000 });
  const fy = G.feetY; // 1030

  // ---- server house
  const hx = 690, hw = 380, hh = 340, top = fy - hh;
  K.shadow(ctx, hx, fy, hw + 40);
  roundRect(ctx, hx - hw / 2, top, hw, hh, 16); ctx.fillStyle = '#3a4170'; ctx.fill();
  ctx.save(); roundRect(ctx, hx - hw / 2, top, hw, hh, 16); ctx.clip(); ctx.fillStyle = '#30365f'; ctx.fillRect(hx + hw / 2 - 70, top, 70, hh); ctx.restore();
  roundRect(ctx, hx - hw / 2 - 14, top - 18, hw + 28, 26, 10); ctx.fillStyle = '#525a90'; ctx.fill();
  // window with a rack inside
  const wx = hx + 80, wy = top + 60, ww = 150, wh = 170;
  const alarm = smooth((t - tR - 0.5) / 0.3);
  roundRect(ctx, wx - ww / 2 - 8, wy - 8, ww + 16, wh + 16, 12); ctx.fillStyle = '#222748'; ctx.fill();
  roundRect(ctx, wx - ww / 2, wy, ww, wh, 8); ctx.fillStyle = H.mixHex('#101530', '#3a1018', alarm * (0.6 + 0.4 * Math.sin(t * 10))); ctx.fill();
  ctx.save(); roundRect(ctx, wx - ww / 2, wy, ww, wh, 8); ctx.clip();
  K.drawServerRack(ctx, wx, wy + wh + 20, 0.78, { t, activity: 0.6 + 0.4 * alarm });
  if (alarm > 0) { ctx.globalAlpha = 0.35 * alarm; ctx.fillStyle = RED; ctx.fillRect(wx - ww / 2, wy, ww, wh); ctx.globalAlpha = 1; }
  ctx.restore();
  if (alarm > 0) K.glow(ctx, wx, wy + wh / 2, 180, RED, 0.35 * alarm);
  // door (swings open on passCue + 0.9)
  const dx = hx - 90, dw = 120, dh = 200, dtop = fy - dh;
  const open = easeOutCubic(clamp((t - tP - 0.9) / 0.7));
  roundRect(ctx, dx - dw / 2 - 8, dtop - 8, dw + 16, dh + 8, 10); ctx.fillStyle = '#1e2240'; ctx.fill();
  // dark interior with a glow
  roundRect(ctx, dx - dw / 2, dtop, dw, dh, 6); ctx.fillStyle = '#07080f'; ctx.fill();
  if (open > 0) { ctx.save(); roundRect(ctx, dx - dw / 2, dtop, dw, dh, 6); ctx.clip(); K.glow(ctx, dx, dtop + dh * 0.6, 120, alarm > 0 ? RED : '#8fb0ff', 0.4 * open); ctx.restore(); }
  // door leaf hinged on the left: width shrinks with a perspective skew
  const lw = dw * (1 - 0.82 * open);
  ctx.beginPath(); ctx.moveTo(dx - dw / 2, dtop); ctx.lineTo(dx - dw / 2 + lw, dtop + 10 * open); ctx.lineTo(dx - dw / 2 + lw, fy - 4 * open); ctx.lineTo(dx - dw / 2, fy); ctx.closePath();
  ctx.fillStyle = '#5c66a6'; ctx.fill();
  ctx.beginPath(); ctx.arc(dx - dw / 2 + lw - 16 * (1 - open) - 4, dtop + dh * 0.55, 6, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
  // keypad
  const kx = dx + dw / 2 + 50, ky = dtop + 50;
  roundRect(ctx, kx - 34, ky, 68, 96, 10); ctx.fillStyle = '#20243f'; ctx.fill();
  const asking = t > tP - 0.2;
  roundRect(ctx, kx - 26, ky + 8, 52, 24, 4); ctx.fillStyle = asking ? (open > 0 ? '#2a3a20' : '#3a2a10') : '#101326'; ctx.fill();
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { roundRect(ctx, kx - 24 + c * 18, ky + 40 + r * 16, 12, 10, 3); ctx.fillStyle = '#4b5175'; ctx.fill(); }
  // keypad speech bubble: "PASSWORD?" -> crossed out
  const ak = K.popIn(t, tP, 0.4);
  if (ak > 0) {
    K.drawSpeechBubble(ctx, kx + 10, ky - 6, Math.min(1, ak), { text: P.ask || 'PASSWORD?', size: 24, maxW: 240, tail: 'center' });
    const xk = smooth((t - tP - 0.7) / 0.3);
    if (xk > 0) { ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(kx - 90, ky - 42); ctx.lineTo(kx - 90 + 200 * xk, ky - 42 - 22 * xk); ctx.stroke(); ctx.restore(); }
  }
  // server label
  K.drawLabel(ctx, hx - 95, top + 56, 1, { text: P.server || 'Website server', size: 24, dot: true });

  // ---- hooded figure walks up to the door
  const wk = clamp((t - tH) / 1.6);
  const hxF = lerp(-120, dx - 100, easeOutCubic(wk));
  // code chip from the tablet into the door
  if (t > tR) {
    const u = clamp((t - tR) / 0.7), e = easeOutCubic(u);
    if (u < 1) chip(ctx, H, lerp(hxF + 90, dx, e), lerp(fy - 180, fy - 120, e) - Math.sin(u * Math.PI) * 90, 0.9, ACC, 1 - smooth((u - 0.85) / 0.15));
  }
  // memory cards float out of the window to the figure
  if (t > tK + 0.4) {
    for (let i = 0; i < 3; i++) {
      const u = clamp((t - tK - 0.4 - i * 0.35) / 1.1), e = easeOutCubic(u);
      if (u <= 0) continue;
      const pts = K.bezier(wx, wy + 60, wx - 120, wy - 200 - i * 30, hxF + 200, fy - 420, hxF + 40 + i * 26, fy - 300 - i * 34, 24);
      const [mx, my] = K.pathPoint(pts, e);
      memCard(ctx, H, mx, my + (u >= 1 ? K.bob(t, 4, 1.2, i) : 0), 0.85, ACC, i);
    }
  }
  hooded(ctx, H, K, hxF, fy, 1.15, { t, walk: wk > 0 && wk < 1, acc: ACC });
  // magnifier peeking into the window
  const mk = K.popIn(t, tK, 0.45);
  if (mk > 0) {
    const mx = wx - 30 + Math.sin((t - tK) * 2) * 18, my = wy + 80;
    ctx.save(); ctx.translate(mx, my); ctx.scale(Math.min(1.05, mk), Math.min(1.05, mk));
    ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 18; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(40, 40); ctx.lineTo(95, 95); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 58, 0, Math.PI * 2); ctx.fillStyle = 'rgba(190,220,255,0.22)'; ctx.fill(); ctx.lineWidth = 12; ctx.strokeStyle = '#c9cfdf'; ctx.stroke();
    ctx.restore();
  }

  ctx.restore(); ctx.save(); // overlays below are drawn without the camera move
  // ---- severity score + meter (top)
  const sk = K.popIn(t, tS, 0.45);
  if (sk > 0) {
    const sc = parseFloat(P.score || '9.0'), shown = Math.min(sc, sc * smooth((t - tS) / 0.9));
    ctx.save(); ctx.translate(487, 535); ctx.scale(0.92 * Math.min(1.04, sk), 0.92 * Math.min(1.04, sk));
    roundRect(ctx, -330, -120, 660, 210, 26); ctx.fillStyle = 'rgba(10,12,24,0.88)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = rgba(RED, 0.7); ctx.stroke();
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'right';
    ctx.font = H.font('display', 120); ctx.fillStyle = RED; ctx.fillText(shown.toFixed(1), 60, 20);
    ctx.textAlign = 'left'; ctx.font = H.font('display', 58); ctx.fillStyle = '#ffffff'; ctx.fillText(P.of || '/ 10', 80, 18);
    ctx.font = H.font('ui', 26); ctx.fillStyle = rgba('#ffffff', 0.75); ctx.textAlign = 'center'; ctx.fillText((P.scoreLabel || 'Severity score').toUpperCase(), 0, -78);
    roundRect(ctx, -280, 42, 560, 22, 11); ctx.fillStyle = '#2a2f52'; ctx.fill();
    const g = ctx.createLinearGradient(-280, 0, 280, 0); g.addColorStop(0, '#f2c86b'); g.addColorStop(1, RED);
    roundRect(ctx, -280, 42, Math.max(22, 560 * shown / 10), 22, 11); ctx.fillStyle = g; ctx.fill();
    ctx.restore();
  }
  // ---- status pills (left column)
  const pills = [
    { t: tP + 0.9, text: P.nopass || 'No password needed', accent: false },
    { t: tR + 0.4, text: P.run || 'Runs its own code', accent: false },
    { t: tK + 0.2, text: P.peek || 'Reads memory', accent: false },
  ];
  pills.forEach((p, i) => { const k = K.popIn(t, p.t, 0.45); if (k > 0) K.drawLabel(ctx, 258, 726 + i * 66, Math.min(1.05, k), { text: p.text, size: 30, dot: true }); });
  ctx.restore();
}

function chip(ctx, H, x, y, s, acc, a) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
  H.glow(ctx, 0, 0, 60, acc, 0.35);
  H.roundRect(ctx, -37, -25, 74, 50, 12); ctx.fillStyle = '#161927'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = acc; ctx.stroke();
  ctx.font = H.font('bold', 26); ctx.fillStyle = acc; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('</>', 0, 1);
  ctx.restore();
}
function memCard(ctx, H, x, y, s, acc, i) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate((i - 1) * 0.12);
  H.roundRect(ctx, -46, -30, 92, 60, 8); ctx.fillStyle = '#f4f1e8'; ctx.fill();
  for (let r = 0; r < 3; r++) { H.roundRect(ctx, -34, -18 + r * 14, r === 2 ? 40 : 68, 7, 3); ctx.fillStyle = '#9aa0bd'; ctx.fill(); }
  ctx.beginPath(); ctx.arc(30, 14, 8, 0, Math.PI * 2); ctx.fillStyle = RED; ctx.fill();
  ctx.restore();
}
// shadowy hooded cartoon figure (generic; no face, two glowing eyes), bottom-centre anchored (from two-sides.js)
function hooded(ctx, H, K, x, y, s, o = {}) {
  const t = o.t || 0, walk = !!o.walk;
  const ph = t * 1.8 * Math.PI * 2, bob = walk ? -Math.abs(Math.sin(ph)) * 5 : Math.sin(t * 1.5) * 1.5;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  K.shadow(ctx, 0, 0, 110);
  const cloak = '#343a5a', cloakS = '#252a44';
  for (const side of [-1, 1]) {
    const a = walk ? Math.sin(ph + (side > 0 ? Math.PI : 0)) * 0.35 : 0;
    ctx.save(); ctx.translate(side * 14, -70 + bob); ctx.rotate(a);
    H.roundRect(ctx, -9, 0, 18, 66, 8); ctx.fillStyle = '#14162a'; ctx.fill();
    H.roundRect(ctx, -12, 58, 30, 14, 7); ctx.fillStyle = '#0c0d18'; ctx.fill();
    ctx.restore();
  }
  ctx.translate(0, bob);
  ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -62); ctx.lineTo(54, -62); ctx.quadraticCurveTo(58, -110, 34, -178); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = cloakS; ctx.fillRect(18, -190, 60, 140); ctx.restore();
  ctx.strokeStyle = cloak; ctx.lineWidth = 17; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(26, -160); ctx.lineTo(48, -122); ctx.lineTo(62, -132); ctx.stroke();
  ctx.save(); ctx.translate(70, -138); ctx.rotate(-0.25);
  H.roundRect(ctx, -16, -22, 32, 44, 5); ctx.fillStyle = '#0c0d18'; ctx.fill();
  H.roundRect(ctx, -12, -18, 24, 36, 3); ctx.fillStyle = o.acc || '#ffe14a'; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
  ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -62); ctx.stroke(); ctx.restore();
  ctx.beginPath(); ctx.moveTo(0, -262); ctx.quadraticCurveTo(46, -250, 44, -200); ctx.quadraticCurveTo(42, -170, 0, -168); ctx.quadraticCurveTo(-42, -170, -44, -200); ctx.quadraticCurveTo(-46, -244, 0, -262); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(4, -204, 26, 25, 0, 0, Math.PI * 2); ctx.fillStyle = '#07080f'; ctx.fill();
  const blink = ((t + 0.7) % 3.1) < 0.12;
  for (const ex of [-6, 14]) { ctx.beginPath(); ctx.ellipse(ex, -206, 5, blink ? 1 : 4, 0, 0, Math.PI * 2); ctx.fillStyle = '#9fe6ff'; ctx.fill(); }
  ctx.restore();
}
