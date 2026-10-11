// Scene "robot-decodes" (full frame). Night workroom: a spinning old disc streams raw machine-code tokens (hex)
// into a robot at a desk; the robot turns them into readable code lines that type into a panel, then a done pill.
// Then the time comparison: a wall calendar ("MONTHS") flips pages and gets crossed out, and "OVERNIGHT" lands
// with a moon. Fits: decompiling / reverse engineering / AI translating or rewriting code / "used to take months".
// params: lines     readable code lines, up to 5 (default generic calls like "load(data)")
//         input     pill over the disc (default "Machine code"); panel: panel title (default "Readable code")
//         done      pill under the panel (default "Rebuilt")
//         before    big word over the calendar (default "MONTHS"); after: accent word (default "OVERNIGHT")
//         source    small attribution pill under the calendar (optional)
//         readCue (code starts typing, default 38 %), monthsCue (calendar, 68 %), nightCue (OVERNIGHT, 90 %)
// Carries the gameProps() helper at the bottom (modules are served standalone, no imports).
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const G = gameProps(K, H), D = info.duration, ACC = info.accent;
  const tc = (w, d) => { const v = w ? info.timeOf(w) : null; return v != null ? v : d; };
  const readAt = tc(P.readCue, D * 0.38) - 0.4, monthsAt = tc(P.monthsCue, D * 0.68) - 0.4, nightAt = tc(P.nightCue, D * 0.9) - 0.3;
  const lines = (P.lines || ['load(data)', 'read(input)', 'check(rules)', 'save(result)', 'draw(screen)']).slice(0, 5);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 470, y: 740 }, { t: monthsAt, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 715 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false });
  const night = smooth((t - nightAt) / 0.8);
  if (night > 0) { ctx.fillStyle = `rgba(5,8,25,${0.25 * night})`; ctx.fillRect(0, 0, info.width, info.height); }

  // robot at the desk
  const state = t < 0.6 ? 'thinking' : t > nightAt + 0.5 ? 'happy' : 'working';
  K.drawRobot(ctx, 470, 995, 1.45, { t, state, seed: 2 });
  K.drawDesk(ctx, 450, 1040, 1.3);
  const deskTop = 1040 - 110 * 1.3;
  K.drawLaptop(ctx, 360, deskTop + 2, 0.6, { t, screen: 'code', typing: t > 0.6 && t < nightAt });
  const head = [500, 700];

  // left: disc + machine-code stream (fades when the calendar arrives)
  const leftA = 1 - smooth((t - monthsAt + 0.3) / 0.5);
  if (leftA > 0.01) {
    ctx.save(); ctx.globalAlpha = leftA;
    const dx = 240, dy = 610, dp = K.popIn(t, 0.1, 0.4);
    G.disc(ctx, dx, dy, 72 * dp, { spin: t * 4, glow: 0.5 });
    const lp = K.popIn(t, 0.4, 0.4);
    if (lp > 0) K.drawLabel(ctx, dx, 510, lp, { text: P.input || 'Machine code', size: 28, dot: true });
    const toks = ['8B', '4F', '1E', 'C3', '0x7A', '9D', 'E8', '01', 'FF', '2C'];
    const pts = K.bezier(dx + 60, dy, dx + 160, dy - 120, head[0] - 160, head[1] - 140, head[0], head[1], 30);
    ctx.font = K.font.ui(30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (let i = 0; i < 14; i++) {
      const u = (t * 0.45 + i / 14) % 1, born = 0.7 + i * 0.08;
      if (t < born) continue;
      const [x, y] = K.pathPoint(pts, u);
      const a = Math.sin(u * Math.PI);
      ctx.globalAlpha = leftA * a;
      G.rr(ctx, x - 36, y - 22, 72, 44, 10, 'rgba(10,12,22,0.85)');
      ctx.fillStyle = '#9fb3ff'; ctx.fillText(toks[i % toks.length], x, y + 1);
    }
    ctx.restore();
  }

  // right: readable-code panel
  const pp = K.popIn(t, readAt - 0.3, 0.45);
  if (pp > 0) {
    const px = 585, py = 500, pw = 300, ph = 290;
    ctx.save(); ctx.translate(px + pw / 2, py + ph / 2); ctx.scale(pp, pp); ctx.translate(-(px + pw / 2), -(py + ph / 2));
    G.rr(ctx, px, py, pw, ph, 18, 'rgba(10,12,22,0.92)');
    ctx.strokeStyle = H.rgba(ACC, 0.6); ctx.lineWidth = 2; H.roundRect(ctx, px, py, pw, ph, 18); ctx.stroke();
    ctx.font = K.font.ui(24); ctx.fillStyle = ACC; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.panel || 'Readable code', px + 22, py + 32);
    ctx.font = K.font.ui(25);
    lines.forEach((ln, i) => {
      const lt = t - readAt - i * 0.55;
      if (lt <= 0) return;
      const txt = K.typewriter(ln, lt, 26);
      ctx.fillStyle = '#e8ecf7'; ctx.fillText(txt, px + 22, py + 82 + i * 42);
      if (txt.length < ln.length && Math.floor(t * 4) % 2 === 0) { ctx.fillStyle = ACC; ctx.fillRect(px + 24 + ctx.measureText(txt).width, py + 68 + i * 42, 12, 26); }
    });
    ctx.restore();
    // green packets from the robot to the panel
    if (t > readAt && t < readAt + lines.length * 0.55 + 0.6) {
      for (let i = 0; i < 4; i++) {
        const u = (t * 1.2 + i / 4) % 1, x = lerp(head[0] + 40, px, u), y = lerp(head[1] - 20, py + 140, u) - Math.sin(u * Math.PI) * 60;
        ctx.globalAlpha = Math.sin(u * Math.PI); G.circle(ctx, x, y, 8, ACC); ctx.globalAlpha = 1;
      }
    }
    const doneAt = readAt + lines.length * 0.55 + 0.8;
    if (t > doneAt) K.drawLabel(ctx, px + pw / 2, py + ph + 62, K.popIn(t, doneAt, 0.4), { text: P.done || 'Rebuilt', size: 28, dot: true, accent: true });
  }

  // calendar: months of work, pages flipping, then crossed out
  const cp = K.popIn(t, monthsAt, 0.45);
  if (cp > 0) {
    const cx = 245, cy = 650;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(cp, cp);
    G.rr(ctx, -110, -120, 220, 250, 16, '#f2f4fa');
    G.rr(ctx, -110, -120, 220, 64, 16, '#e8786a'); ctx.fillStyle = '#e8786a'; ctx.fillRect(-110, -80, 220, 24);
    for (const rx of [-60, 0, 60]) { G.rr(ctx, rx - 6, -134, 12, 30, 6, '#5b6687'); }
    ctx.fillStyle = '#c3cadd';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) G.rr(ctx, -92 + c * 38, -40 + r * 36, 26, 24, 4, '#d5dae8');
    // flipping page
    const fl = ((t - monthsAt) * 1.6) % 1;
    if (t < nightAt) { ctx.save(); ctx.globalAlpha = 1 - fl; ctx.translate(0, -120); ctx.rotate(-fl * 1.2); G.rr(ctx, -110 + fl * 40, -fl * 40, 220, 160 * (1 - fl * 0.5), 12, '#ffffff'); ctx.restore(); }
    ctx.restore();
    G.bigText(ctx, cx, cy - 210, P.before || 'MONTHS', 52, '#ffffff', cp);
    if (t > nightAt) {
      const x1 = K.phase(t, nightAt, nightAt + 0.35);
      ctx.strokeStyle = '#ff6b5e'; ctx.lineWidth = 14; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - 120, cy - 250); ctx.lineTo(lerp(cx - 120, cx + 120, x1), lerp(cy - 250, cy + 130, x1)); ctx.stroke();
      const x2 = K.phase(t, nightAt + 0.2, nightAt + 0.55);
      if (x2 > 0) { ctx.beginPath(); ctx.moveTo(cx + 120, cy - 250); ctx.lineTo(lerp(cx + 120, cx - 120, x2), lerp(cy - 250, cy + 130, x2)); ctx.stroke(); }
    }
    if (P.source) K.drawLabel(ctx, cx, cy + 200, K.popIn(t, monthsAt + 0.4, 0.4), { text: P.source, size: 24 });
  }
  // OVERNIGHT with a moon
  const np = K.popIn(t, nightAt + 0.3, 0.5);
  if (np > 0) {
    ctx.save(); ctx.translate(630, 455); ctx.scale(np, np);
    K.glow(ctx, -210, 0, 90, '#dfe6ff', 0.4);
    G.circle(ctx, -210, 0, 28, '#f1f3ff'); G.circle(ctx, -199, -8, 25, '#20264a');
    ctx.restore();
    G.bigText(ctx, 650, 458, P.after || 'OVERNIGHT', 52, ACC, np);
  }
  ctx.restore();
}

// ---- game props (generic, no logos, no real game characters): console, disc, controller, browser window with a
// mini game made of simple shapes ('shooter' | 'driving' | 'platform' | 'skate'), calendar. Pure functions of t.
function gameProps(K, H) {
  const { clamp, lerp, roundRect, rgba, mixHex } = H;
  const N = K.NEUTRAL, A = K.ACCENT, TAU = Math.PI * 2;
  const rr = (ctx, x, y, w, h, r, fill) => { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); };
  const circle = (ctx, x, y, r, fill) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); };
  const fr = (v) => v - Math.floor(v);

  // Old console: a chunky generic box (bottom-centre anchor, ~300x110 at s=1). dust 0..1 = dusty look.
  function console_(ctx, x, y, s, o = {}) {
    const t = o.t || 0, dust = o.dust || 0, on = o.on || 0;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 340);
    rr(ctx, -150, -112, 300, 108, 18, '#2c3150');
    rr(ctx, -150, -112, 300, 30, 16, '#3a4166');
    ctx.fillStyle = '#232741'; ctx.fillRect(40, -82, 110, 78);
    rr(ctx, -120, -70, 150, 14, 7, '#151827');               // disc tray slot
    rr(ctx, -128, -40, 34, 22, 6, '#3a4166'); rr(ctx, -84, -40, 34, 22, 6, '#3a4166'); // controller ports
    circle(ctx, 104, -42, 16, '#3a4166');
    const led = on > 0 ? A.base : (Math.sin(t * 3) > 0.6 ? '#ff6b5e' : '#5a2b33');
    if (on > 0) K.glow(ctx, 104, -42, 50, A.base, 0.5 * on);
    circle(ctx, 104, -42, 8, led);
    rr(ctx, -140, -6, 40, 8, 4, '#1c2033'); rr(ctx, 100, -6, 40, 8, 4, '#1c2033');
    if (dust > 0) {
      ctx.globalAlpha = 0.55 * dust; rr(ctx, -146, -114, 292, 16, 10, '#b9b2a4'); ctx.globalAlpha = 1;
      // cobweb in the corner
      ctx.strokeStyle = rgba('#e8e4da', 0.5 * dust); ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(150, -112); ctx.lineTo(150 - 46 * Math.cos(i * 0.5), -112 + 46 * Math.sin(i * 0.5)); ctx.stroke(); }
      for (let r = 14; r < 46; r += 12) { ctx.beginPath(); ctx.arc(150, -112, r, Math.PI * 0.5, Math.PI); ctx.stroke(); }
    }
    ctx.restore();
  }
  // Disc (centre anchor, radius r): silver with a sheen that turns with `spin`.
  function disc(ctx, x, y, r, o = {}) {
    const spin = o.spin || 0;
    ctx.save(); ctx.translate(x, y); ctx.rotate(spin);
    if (o.glow) K.glow(ctx, 0, 0, r * 2.2, A.base, 0.45 * o.glow);
    circle(ctx, 0, 0, r, '#cfd6e6');
    const g = ctx.createConicGradient ? ctx.createConicGradient(0, 0, 0) : null;
    if (g) { g.addColorStop(0, '#e9f0ff'); g.addColorStop(0.2, '#b8c4ff'); g.addColorStop(0.35, '#ffe1f3'); g.addColorStop(0.5, '#c9f7ff'); g.addColorStop(0.7, '#f4f1c8'); g.addColorStop(1, '#e9f0ff'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r * 0.96, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 0.5; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r * 0.96, -0.5, 0.1); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    circle(ctx, 0, 0, r * 0.32, '#9aa3ba'); circle(ctx, 0, 0, r * 0.14, o.hole || '#1a1e33');
    ctx.restore();
  }
  // Gamepad (centre anchor, ~150x80 at s=1).
  function controller(ctx, x, y, s, o = {}) {
    const t = o.t || 0, press = o.press || 0;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
    ctx.beginPath();
    ctx.moveTo(-60, -26); ctx.quadraticCurveTo(0, -36, 60, -26);
    ctx.quadraticCurveTo(84, -20, 80, 20); ctx.quadraticCurveTo(76, 44, 56, 36); ctx.quadraticCurveTo(40, 14, 0, 14);
    ctx.quadraticCurveTo(-40, 14, -56, 36); ctx.quadraticCurveTo(-76, 44, -80, 20); ctx.quadraticCurveTo(-84, -20, -60, -26); ctx.closePath();
    ctx.fillStyle = '#3a4166'; ctx.fill();
    ctx.fillStyle = '#2c3150'; ctx.fillRect(-10, -30, 20, 44);
    // d-pad
    rr(ctx, -54, -12, 30, 10, 3, '#151827'); rr(ctx, -44, -22, 10, 30, 3, '#151827');
    // buttons
    const cols = [A.base, '#ff6b5e', '#6f86e0', '#4fb3a6'];
    [[44, -18], [56, -6], [44, 6], [32, -6]].forEach(([bx, by], i) => {
      const p = press > 0 && Math.floor(t * 6) % 4 === i ? 2 : 0;
      circle(ctx, bx, by + p, 6.5, cols[i]);
    });
    ctx.restore();
  }
  // A mini game inside rect (x, y, w, h): kind 'shooter' | 'driving' | 'platform' | 'skate'. play 0..1 = running.
  function game(ctx, kind, x, y, w, h, t, play = 1) {
    ctx.save(); roundRect(ctx, x, y, w, h, 6); ctx.clip();
    const tt = t * play;
    if (kind === 'driving') {
      const g = ctx.createLinearGradient(0, y, 0, y + h * 0.55); g.addColorStop(0, '#3b2a6b'); g.addColorStop(1, '#ff8a6b');
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      const sx = x + w / 2, hy = y + h * 0.52;
      circle(ctx, sx, hy - h * 0.06, h * 0.16, '#ffd36b');
      ctx.fillStyle = '#3b2a6b'; for (let i = 0; i < 4; i++) ctx.fillRect(sx - h * 0.2, hy - h * 0.1 + i * h * 0.03, h * 0.4, h * 0.012);
      ctx.fillStyle = '#2a1f4a'; ctx.fillRect(x, hy, w, h);
      ctx.beginPath(); ctx.moveTo(sx - w * 0.04, hy); ctx.lineTo(sx + w * 0.04, hy); ctx.lineTo(x + w * 0.95, y + h); ctx.lineTo(x + w * 0.05, y + h); ctx.closePath(); ctx.fillStyle = '#3d3d5c'; ctx.fill();
      for (let i = 0; i < 5; i++) { const u = fr(i / 5 + tt * 0.9), yy = hy + (y + h - hy) * u * u, ww = 2 + 10 * u * u; ctx.fillStyle = '#f2f4fa'; ctx.fillRect(sx - ww / 2, yy, ww, 4 + 26 * u * u); }
      // palm trees on both sides drifting past
      for (let i = 0; i < 4; i++) {
        const u = fr(i / 4 + tt * 0.5), side = i % 2 ? 1 : -1, px = sx + side * (w * 0.08 + w * 0.5 * u * u), py = hy + (y + h - hy) * u * u, sc = 0.2 + 1.4 * u * u;
        ctx.strokeStyle = '#1a1233'; ctx.lineWidth = 5 * sc; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 6 * sc * side, py - 70 * sc); ctx.stroke();
        ctx.fillStyle = '#1a1233'; for (let k = 0; k < 5; k++) { ctx.save(); ctx.translate(px + 6 * sc * side, py - 70 * sc); ctx.rotate(-1.4 + k * 0.7); ctx.beginPath(); ctx.ellipse(18 * sc, 0, 20 * sc, 5 * sc, 0, 0, TAU); ctx.fill(); ctx.restore(); }
      }
      // car from behind
      const cx = sx + Math.sin(tt * 1.3) * w * 0.08, cy = y + h * 0.9, cw = w * 0.26;
      rr(ctx, cx - cw / 2, cy - cw * 0.42, cw, cw * 0.36, cw * 0.08, '#e8786a');
      rr(ctx, cx - cw * 0.34, cy - cw * 0.62, cw * 0.68, cw * 0.24, cw * 0.08, '#c95f53');
      rr(ctx, cx - cw * 0.28, cy - cw * 0.58, cw * 0.56, cw * 0.16, cw * 0.05, '#8fd0ff');
      rr(ctx, cx - cw * 0.46, cy - cw * 0.3, cw * 0.16, cw * 0.07, 3, '#ff3b3b'); rr(ctx, cx + cw * 0.3, cy - cw * 0.3, cw * 0.16, cw * 0.07, 3, '#ff3b3b');
      rr(ctx, cx - cw * 0.45, cy - cw * 0.08, cw * 0.16, cw * 0.12, 4, '#151827'); rr(ctx, cx + cw * 0.29, cy - cw * 0.08, cw * 0.16, cw * 0.12, 4, '#151827');
    } else if (kind === 'platform') {
      ctx.fillStyle = '#5fa8e8'; ctx.fillRect(x, y, w, h);
      for (let i = 0; i < 3; i++) { const cx = x + fr(i * 0.37 - tt * 0.05) * (w + 80) - 40, cy = y + h * (0.18 + 0.1 * i); circle(ctx, cx, cy, h * 0.06, '#ffffff'); circle(ctx, cx + h * 0.06, cy - h * 0.02, h * 0.07, '#ffffff'); circle(ctx, cx + h * 0.12, cy, h * 0.05, '#ffffff'); }
      const gy = y + h * 0.8, tile = h * 0.12, off = (tt * 90) % tile;
      ctx.fillStyle = '#4fa67d'; ctx.fillRect(x, gy, w, h * 0.05);
      ctx.fillStyle = '#9a6a46'; ctx.fillRect(x, gy + h * 0.05, w, h);
      ctx.fillStyle = '#764d31'; for (let i = -1; i < w / tile + 1; i++) ctx.fillRect(x + i * tile - off, gy + h * 0.1, tile * 0.45, tile * 0.3);
      // floating blocks
      for (let i = 0; i < 3; i++) { const bx = x + fr(i / 3 - tt * 0.12) * (w + 120) - 60, by = y + h * 0.48; rr(ctx, bx, by, tile, tile, 4, A.base); ctx.fillStyle = A.deep; ctx.font = `900 ${Math.round(tile * 0.7)}px Montserrat`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', bx + tile / 2, by + tile / 2 + 1); }
      // jumping square hero
      const j = Math.abs(Math.sin(tt * 3.2)), hx = x + w * 0.3, hy = gy - tile * 0.9 - j * h * 0.22;
      rr(ctx, hx, hy, tile * 0.9, tile * 0.9, 6, '#e8786a'); circle(ctx, hx + tile * 0.6, hy + tile * 0.32, tile * 0.1, '#161927');
    } else if (kind === 'skate') {
      const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#4fb3a6'); g.addColorStop(1, '#2b6f86'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      const by = y + h * 0.85;
      ctx.fillStyle = '#cfd6e6'; ctx.beginPath(); ctx.moveTo(x, y + h * 0.35); ctx.quadraticCurveTo(x, by, x + w * 0.3, by); ctx.lineTo(x + w * 0.7, by); ctx.quadraticCurveTo(x + w, by, x + w, y + h * 0.35); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
      const u = 0.5 + 0.5 * Math.sin(tt * 1.8), bx = x + w * (0.12 + 0.76 * u), edge = Math.abs(u - 0.5) * 2, byy = by - h * 0.5 * Math.pow(edge, 2.2) - 8;
      ctx.save(); ctx.translate(bx, byy); ctx.rotate((u - 0.5) * 1.6 * edge + Math.cos(tt * 1.8) * 0.2);
      rr(ctx, -w * 0.09, -6, w * 0.18, 8, 4, '#e8786a'); circle(ctx, -w * 0.06, 4, 4, '#161927'); circle(ctx, w * 0.06, 4, 4, '#161927');
      rr(ctx, -9, -50, 18, 42, 8, A.base); circle(ctx, 0, -60, 11, '#f7d7bd');
      ctx.restore();
    } else { // shooter: generic sci-fi corridor, hovering target drones, crosshair, blaster
      const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#2a3a5c'); g.addColorStop(1, '#141a30'); ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      const vx = x + w / 2, vy = y + h * 0.45;
      ctx.fillStyle = '#334466'; ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(vx - w * 0.12, vy + h * 0.05); ctx.lineTo(vx + w * 0.12, vy + h * 0.05); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(160,200,255,0.25)'; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) { const u = fr(i / 6 + tt * 0.25), yy = vy + h * 0.05 + (y + h - vy - h * 0.05) * u * u; ctx.beginPath(); ctx.moveTo(lerp(vx - w * 0.12, x, u * u), yy); ctx.lineTo(lerp(vx + w * 0.12, x + w, u * u), yy); ctx.stroke(); }
      rr(ctx, vx - w * 0.12, vy - h * 0.25, w * 0.24, h * 0.3, 4, '#0f1426');
      // drones: rounded hexagon-ish bodies with one glowing eye, bobbing; one pops periodically
      for (let i = 0; i < 3; i++) {
        const k = fr(tt * 0.33 + i / 3), dx = vx + (i - 1) * w * 0.26 + Math.sin(tt * 1.4 + i) * w * 0.04, dy = vy - h * 0.02 + Math.cos(tt * 1.9 + i * 2) * h * 0.04, ds = h * (0.07 + 0.02 * i);
        if (k > 0.86) { const b = (k - 0.86) / 0.14; ctx.globalAlpha = 1 - b; for (let q = 0; q < 6; q++) { const a = q * 1.05; circle(ctx, dx + Math.cos(a) * ds * (1 + 2 * b), dy + Math.sin(a) * ds * (1 + 2 * b), ds * 0.25, A.base); } ctx.globalAlpha = 1; continue; }
        rr(ctx, dx - ds, dy - ds * 0.7, ds * 2, ds * 1.4, ds * 0.5, '#a08be0'); rr(ctx, dx - ds * 1.4, dy - ds * 0.15, ds * 2.8, ds * 0.3, ds * 0.15, '#6c5aa8');
        circle(ctx, dx, dy, ds * 0.38, '#ff6b5e'); circle(ctx, dx, dy, ds * 0.16, '#ffffff');
      }
      // crosshair
      const ch = h * 0.07; ctx.strokeStyle = A.base; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(vx, vy, ch, 0, TAU); ctx.moveTo(vx - ch * 1.6, vy); ctx.lineTo(vx - ch * 0.5, vy); ctx.moveTo(vx + ch * 0.5, vy); ctx.lineTo(vx + ch * 1.6, vy); ctx.moveTo(vx, vy - ch * 1.6); ctx.lineTo(vx, vy - ch * 0.5); ctx.moveTo(vx, vy + ch * 0.5); ctx.lineTo(vx, vy + ch * 1.6); ctx.stroke();
      // blaster bottom-right with recoil + flash
      const fire = fr(tt * 1.6) < 0.12 && play > 0.5, rec = fire ? 10 : 0;
      ctx.save(); ctx.translate(x + w * 0.72 + rec, y + h * 0.86 + rec); ctx.rotate(-0.35);
      rr(ctx, -w * 0.05, -h * 0.06, w * 0.24, h * 0.13, 10, '#5b6687'); rr(ctx, -w * 0.09, -h * 0.035, w * 0.08, h * 0.07, 6, '#3a4166'); rr(ctx, w * 0.05, -h * 0.08, w * 0.08, h * 0.04, 4, A.base);
      ctx.restore();
      if (fire) { K.glow(ctx, x + w * 0.66, y + h * 0.8, h * 0.18, A.base, 0.8); ctx.strokeStyle = rgba(A.light, 0.9); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + w * 0.66, y + h * 0.78); ctx.lineTo(vx, vy); ctx.stroke(); }
      // HUD
      rr(ctx, x + 12, y + h - 26, w * 0.22, 10, 5, 'rgba(0,0,0,0.4)'); rr(ctx, x + 12, y + h - 26, w * 0.22 * (0.6 + 0.3 * Math.sin(tt)), 10, 5, '#4fb3a6');
    }
    ctx.restore();
  }
  // Browser window (top-left x, y, size w x h). opts: t, tab (text), game (kind or null), play, loading (0..1),
  // pop (0..1 scale-in about the centre), dim (0..1 grey-out), url (fake address text, generic).
  function browser(ctx, x, y, w, h, o = {}) {
    const pop = o.pop == null ? 1 : o.pop; if (pop <= 0) return null;
    const t = o.t || 0, bar = 54;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2); ctx.scale(pop, pop); ctx.translate(-(x + w / 2), -(y + h / 2));
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(ctx, x + 8, y + 14, w, h, 20); ctx.fill();
    rr(ctx, x, y, w, h, 20, '#dfe4f1');
    rr(ctx, x, y, w, bar, 20, '#c3cadd'); ctx.fillStyle = '#c3cadd'; ctx.fillRect(x, y + bar - 20, w, 20);
    [['#ff6b5e', 0], ['#ffcc33', 1], ['#4fb37a', 2]].forEach(([c, i]) => circle(ctx, x + 26 + i * 24, y + bar / 2, 8, c));
    // tab
    ctx.font = K.font.ui(o.tabSize || 24);
    const tabTxt = o.tab || 'New tab', tw = Math.min(w - 150, ctx.measureText(tabTxt).width + 40);
    rr(ctx, x + 102, y + 8, tw, bar - 8, 12, '#dfe4f1'); ctx.fillStyle = '#dfe4f1'; ctx.fillRect(x + 102, y + bar - 14, tw, 14);
    ctx.fillStyle = '#161927'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.save(); ctx.beginPath(); ctx.rect(x + 102, y, tw - 12, bar); ctx.clip(); ctx.fillText(tabTxt, x + 122, y + bar / 2 + 4); ctx.restore();
    // screen area
    const sx = x + 10, sy = y + bar + 8, sw = w - 20, sh = h - bar - 18;
    rr(ctx, sx, sy, sw, sh, 10, '#121527');
    if (o.game) game(ctx, o.game, sx, sy, sw, sh, t, o.play == null ? 1 : o.play);
    if (o.loading != null && o.loading < 1) {
      ctx.fillStyle = 'rgba(18,21,39,0.92)'; roundRect(ctx, sx, sy, sw, sh, 10); ctx.fill();
      const lw = sw * 0.6; rr(ctx, sx + (sw - lw) / 2, sy + sh / 2 - 8, lw, 16, 8, '#2a2f45'); rr(ctx, sx + (sw - lw) / 2, sy + sh / 2 - 8, Math.max(16, lw * clamp(o.loading)), 16, 8, A.base);
    }
    if (o.dim) { ctx.fillStyle = rgba('#0a0c16', 0.7 * o.dim); roundRect(ctx, sx, sy, sw, sh, 10); ctx.fill(); }
    ctx.restore();
    return { sx, sy, sw, sh, cx: sx + sw / 2, cy: sy + sh / 2 };
  }
  // Text pill with large type (Anton-free; uses Montserrat 900). Anchor = centre.
  function bigText(ctx, x, y, text, size, color, s = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.font = K.font.display(size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round'; ctx.lineWidth = size * 0.16; ctx.strokeStyle = 'rgba(8,10,20,0.9)'; ctx.strokeText(text, 0, 0);
    ctx.fillStyle = color; ctx.fillText(text, 0, 0); ctx.restore();
  }
  // Simple armchair (bottom-centre anchor), colour c.
  function armchair(ctx, x, y, s, c = '#3f7f86') {
    const sh = mixHex(c, '#000000', 0.22), li = mixHex(c, '#ffffff', 0.14);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 300, 0.4);
    rr(ctx, -120, -260, 240, 200, 40, sh); rr(ctx, -100, -248, 200, 150, 32, c);
    rr(ctx, -112, -110, 224, 70, 26, li); rr(ctx, -112, -76, 224, 50, 22, c);
    rr(ctx, -150, -170, 50, 150, 24, c); rr(ctx, 100, -170, 50, 150, 24, sh);
    rr(ctx, -100, -26, 16, 26, 6, N.darkS); rr(ctx, 84, -26, 16, 26, 6, N.darkS);
    ctx.restore();
  }
  return { console: console_, disc, controller, game, browser, bigText, armchair, rr, circle };
}
