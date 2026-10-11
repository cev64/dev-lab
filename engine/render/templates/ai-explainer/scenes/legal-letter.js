// Scene "legal-letter" (full frame). Office: a browser window plays a fan-made mini game with a tag pill; a generic
// cartoon lawyer with a briefcase walks in, holds up a big letter, and the window flickers and dims under a hedged
// label + "?". Ends settled with the dimmed window.
// Fits: possible legal action / takedown risk / cease-and-desist, copyright trouble; word it as a possibility.
// params: letter   text on the letter, split over 2 lines (default "LEGAL NOTICE")
//         label    tag under the window before (default "Unofficial"); maybe: hedged tag after (default "Could be taken down")
//         game     mini game kind shooter|driving|platform|skate (default "driving"); tab: tab text (default "Fan project")
//         letterCue (letter goes up, default 58 %), downCue (window dims, default 85 %)
// Carries the gameProps() helper at the bottom (modules are served standalone, no imports).
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const G = gameProps(K, H), D = info.duration, ACC = info.accent;
  const tc = (w, d) => { const v = w ? info.timeOf(w) : null; return v != null ? v : d; };
  const letterAt = tc(P.letterCue, D * 0.58) - 0.3, downAt = tc(P.downCue, D * 0.85) - 0.3;
  const walk0 = 0.6, walk1 = Math.min(letterAt - 0.6, 3.4);

  ctx.save();
  K.cameraShake(ctx, t, downAt, 0.35, 8);
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 470, y: 720 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  K.world.office(ctx, { t, time: 'dusk' });

  // browser window with the game
  const bx = 70, by = 440, bw = 470, bh = 330;
  const dim = smooth((t - downAt) / 0.5);
  const flick = t > downAt && t < downAt + 0.6 ? (Math.floor((t - downAt) * 20) % 2) * 0.5 : 0;
  const scr = G.browser(ctx, bx, by, bw, bh, { t, tab: P.tab || 'Fan project', game: P.game || 'driving', play: 1 - dim, dim: Math.min(1, dim * 0.85 + flick) });
  if (scr && dim > 0) G.bigText(ctx, scr.cx, scr.cy, '?', 120, '#ffffff', K.popIn(t, downAt + 0.2, 0.4));
  // tag under the window: "Unofficial" -> hedged takedown label
  const tagP = K.popIn(t, 0.4, 0.4);
  if (t < downAt) K.drawLabel(ctx, bx + bw / 2, by + bh + 70, tagP, { text: P.label || 'Unofficial', size: 30, dot: true });
  else K.drawLabel(ctx, bx + bw / 2, by + bh + 70, K.popIn(t, downAt, 0.4), { text: P.maybe || 'Could be taken down', size: 30, dot: true, accent: true });

  // lawyer walks in from the right, briefcase in hand
  const wk = K.phase(t, walk0, walk1, (k) => clamp(k));
  const lx = lerp(1060, 760, wk);
  const walking = t > walk0 && t < walk1;
  const raised = t >= letterAt;
  K.drawBriefcase(ctx, lx + 70, 1040, 0.55);
  K.drawPerson(ctx, lx, 1035, 1.6, { t, walk: walking ? t - walk0 : null, pose: raised ? 'point' : 'stand', flip: true, mood: raised ? 'neutral' : 'neutral', skin: 1, hair: 3, hairStyle: 'short', shirt: '#2b3048', talk: raised && t < downAt ? 0.5 * info.env : 0, seed: 9 });
  // the letter
  const lp = K.popIn(t, letterAt, 0.45);
  if (lp > 0) {
    const x = lerp(lx - 40, 600, easeOutCubic(clamp((t - letterAt) / 0.5))), y = 548 + K.bob(t, 4, 0.5);
    ctx.save(); ctx.translate(x, y); ctx.rotate(-0.06); ctx.scale(lp, lp);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; H.roundRect(ctx, -112, -132, 236, 280, 12); ctx.fill();
    G.rr(ctx, -120, -140, 236, 280, 12, '#f2f4fa');
    const words = String(P.letter || 'LEGAL NOTICE').split(' ');
    const mid = Math.ceil(words.length / 2), l1 = words.slice(0, mid).join(' '), l2 = words.slice(mid).join(' ');
    ctx.font = K.font.display(34); ctx.fillStyle = '#161927'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(l1, -2, -92); if (l2) ctx.fillText(l2, -2, -52);
    for (let i = 0; i < 5; i++) G.rr(ctx, -92, -14 + i * 22, 180 - (i === 4 ? 70 : 14 * H.hash(i, 9)), 8, 4, '#c3cadd');
    G.circle(ctx, 70, 100, 22, '#ff6b5e'); G.circle(ctx, 70, 100, 14, '#ff9a90');
    ctx.restore();
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
