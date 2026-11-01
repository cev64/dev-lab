// Scene "orbit-sat" (full frame). Space over a cartoon Earth: a small AI satellite with solar wings and a glowing
// chip window, a ground-station dish with an engineer, light beams carrying a prompt up and a poem scroll down.
// Generic shapes only (no logos, no real map). Modes:
//   hook   cold open: the beam is already on at frame 0, the poem scroll slides down it and unrolls (peak < 2.5 s)
//   launch rocket on a pad -> name pill -> lift-off + date pill -> satellite drifts in, wings unfold -> chip lights,
//          news pill + check
//   uplink engineer points, dish beams packets up to a passing satellite; magnifier inset of the chip with model +
//          chip pills; then a prompt card types in and flies up the beam into the satellite
//   haiku  place pin; beam down; scroll lands and unrolls; lines appear on their cues; byline; stamp lands
//   power  split: a ground data center with a straining power meter vs the satellite basking in sunlight; big
//          "up to Nx" count + sub + source
//   heat   big satellite, "1 test satellite" pill; the chip glows hot, heat shimmer, thermometer climbs + pill;
//          then camera pulls back, a twin satellite slides in, a light link connects them, "next" pill
// Fits: space / satellites / orbital compute / any "AI hardware somewhere unusual" story.
// Defaults are generic placeholders ("Project name", "Launch date", "AI model", "Ground station", placeholder poem lines);
// pass the story's names, verbatim lines and published figures. Cues are narration words; without them fractions.
// params: mode; hook: lines [3], tag; launch: date, name, news, nameCue, launchCue, chipCue, newsCue; uplink: upCue, model, chip, modelCue,
//   chipCue, prompt, promptTitle, askCue; haiku: place, lines [3], lineCues [3], by, stamp, downCue, stampCue; power: earth, value,
//   unit, prefix, sub, src, leftTitle, rightTitle, earthCue, countCue; heat: one, hot, next, oneCue, heatCue, hotCue, nextCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, mixHex } = H;
  const TAU = Math.PI * 2;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const fract = (x) => x - Math.floor(x);
  const mode = P.mode || 'hook';

  // ------------------------------------------------------------------ shared drawing
  const EC = { x: 487, y: 2380, r: 1400 };                     // Earth: big circle, top of the limb at y 980
  const limbY = (x) => EC.y - Math.sqrt(Math.max(0, EC.r * EC.r - (x - EC.x) * (x - EC.x)));

  function sky() {
    const g = ctx.createLinearGradient(0, 0, 0, 1920);
    g.addColorStop(0, '#050816'); g.addColorStop(0.45, '#0b1335'); g.addColorStop(0.55, '#14205a'); g.addColorStop(1, '#050816');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    for (let i = 0; i < 90; i++) {
      const sx = H.hash(i, 11) * 1080, sy = H.hash(i, 12) * 1150, big = H.hash(i, 13) > 0.85;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.8 + H.hash(i, 14) * 1.6) + i));
      ctx.globalAlpha = (big ? 0.9 : 0.55) * tw; ctx.fillStyle = '#ffffff';
      if (big) { ctx.beginPath(); ctx.arc(sx, sy, 2.6, 0, TAU); ctx.fill(); ctx.fillRect(sx - 7, sy - 0.8, 14, 1.6); ctx.fillRect(sx - 0.8, sy - 7, 1.6, 14); }
      else ctx.fillRect(sx, sy, 2.4, 2.4);
    }
    ctx.globalAlpha = 1;
  }

  function earth(o = {}) {
    const { x, y, r } = EC;
    K.glow(ctx, x, y - r + 40, 520, '#5fa8ff', 0.22);
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r + 26, 0, TAU); ctx.fillStyle = 'rgba(110,170,255,0.18)'; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r + 10, 0, TAU); ctx.fillStyle = 'rgba(140,195,255,0.28)'; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
    const g = ctx.createLinearGradient(0, y - r, 0, y - r + 700);
    g.addColorStop(0, '#3a7fe0'); g.addColorStop(1, '#173a86');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    // generic land blobs (not a real map), drifting slowly
    const drift = (t * 6) % 1600;
    const blobs = [[-500, 60, 260, 70], [-120, 140, 200, 90], [260, 40, 300, 80], [700, 120, 240, 100], [1100, 50, 280, 75], [-900, 120, 220, 80]];
    for (const [bx, by, bw, bh] of blobs) {
      const px = ((bx + drift + 1600) % 3200) - 1100;
      ctx.beginPath(); ctx.ellipse(px, y - r + by + 30, bw, bh, 0.1, 0, TAU); ctx.fillStyle = '#3c9a6b'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(px + bw * 0.25, y - r + by + 40, bw * 0.45, bh * 0.45, 0.1, 0, TAU); ctx.fillStyle = '#4fb07c'; ctx.fill();
    }
    if (o.snow) { // a snowy patch where the ground station sits
      ctx.beginPath(); ctx.ellipse(o.snow, limbY(o.snow) + 20, 170, 46, 0, 0, TAU); ctx.fillStyle = '#e9f0fb'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(o.snow + 40, limbY(o.snow) + 34, 90, 22, 0, 0, TAU); ctx.fillStyle = '#c9d6ea'; ctx.fill();
    }
    // clouds
    for (let i = 0; i < 7; i++) {
      const cx = ((H.hash(i, 21) * 1400 + t * 14) % 1400) - 160, cy = y - r + 50 + H.hash(i, 22) * 260;
      ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.ellipse(cx, cy, 110 + H.hash(i, 23) * 80, 16, 0, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill();
    }
    ctx.globalAlpha = 1;
    // shade toward the bottom
    const s = ctx.createLinearGradient(0, y - r, 0, y - r + 900); s.addColorStop(0, 'rgba(5,8,22,0)'); s.addColorStop(1, 'rgba(5,8,22,0.75)');
    ctx.fillStyle = s; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    ctx.restore();
  }

  // satellite centred at (x, y). o: wings 0..1, chip 0..1 (glow), hot 0..1, sun 0..1, tilt
  function sat(x, y, s, o = {}) {
    const wings = o.wings == null ? 1 : o.wings, chip = o.chip || 0, hot = o.hot || 0, sun = o.sun || 0;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.tilt || 0); ctx.scale(s, s);
    // wings
    for (const side of [-1, 1]) {
      const w = 150 * wings;
      if (w < 2) continue;
      ctx.fillStyle = '#8a93a8'; ctx.fillRect(side > 0 ? 48 : -48 - 26, -5, 26, 10);
      const x0 = side > 0 ? 74 : -74 - w;
      roundRect(ctx, x0, -36, w, 72, 6); ctx.fillStyle = mixHex('#24408f', '#2f5fd0', sun * 0.6); ctx.fill();
      ctx.strokeStyle = 'rgba(200,220,255,0.55)'; ctx.lineWidth = 2;
      roundRect(ctx, x0, -36, w, 72, 6); ctx.stroke();
      const cols = Math.max(1, Math.round(4 * wings));
      for (let c = 1; c < cols; c++) { ctx.beginPath(); ctx.moveTo(x0 + (w * c) / cols, -36); ctx.lineTo(x0 + (w * c) / cols, 36); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + w, 0); ctx.stroke();
      // glint sweeping across
      const gx = x0 + fract(t * 0.35 + (side > 0 ? 0.5 : 0)) * (w + 60) - 30;
      ctx.save(); roundRect(ctx, x0, -36, w, 72, 6); ctx.clip();
      ctx.fillStyle = `rgba(255,255,255,${0.16 + 0.25 * sun})`; ctx.beginPath(); ctx.moveTo(gx, -36); ctx.lineTo(gx + 26, -36); ctx.lineTo(gx + 6, 36); ctx.lineTo(gx - 20, 36); ctx.fill();
      if (sun > 0) { ctx.fillStyle = H.rgba(ACC, 0.22 * sun); ctx.fillRect(x0, -36, w, 72); }
      ctx.restore();
    }
    // body
    roundRect(ctx, -48, -58, 96, 116, 12); ctx.fillStyle = '#dfe4f1'; ctx.fill();
    ctx.save(); roundRect(ctx, -48, -58, 96, 116, 12); ctx.clip(); ctx.fillStyle = '#d9a441'; ctx.fillRect(-48, 18, 96, 40); ctx.restore();
    ctx.fillStyle = '#b9c1d6'; ctx.fillRect(18, -58, 30, 76);
    // chip window
    roundRect(ctx, -32, -42, 64, 52, 8); ctx.fillStyle = '#121527'; ctx.fill();
    const cc = hot > 0 ? mixHex(ACC, hot > 0.5 ? '#ff4d3d' : '#ff9a3d', Math.min(1, hot * 1.4)) : ACC;
    if (chip > 0 || hot > 0) K.glow(ctx, 0, -16, 60 + 40 * hot, cc, 0.55 * Math.max(chip, hot));
    roundRect(ctx, -14, -30, 28, 28, 4); ctx.fillStyle = chip > 0 || hot > 0 ? mixHex('#3b4260', cc, Math.max(chip, hot)) : '#3b4260'; ctx.fill();
    ctx.strokeStyle = '#b9c1d6'; ctx.lineWidth = 2;
    for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(k * 8, -30); ctx.lineTo(k * 8, -36); ctx.moveTo(k * 8, -2); ctx.lineTo(k * 8, 4); ctx.moveTo(-14, -16 + k * 8); ctx.lineTo(-20, -16 + k * 8); ctx.moveTo(14, -16 + k * 8); ctx.lineTo(20, -16 + k * 8); ctx.stroke(); }
    // mast + small dish on top
    ctx.fillStyle = '#8a93a8'; ctx.fillRect(-3, -84, 6, 28);
    ctx.beginPath(); ctx.ellipse(0, -86, 22, 9, 0, 0, Math.PI); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    const led = Math.sin(t * 5) > 0.2;
    ctx.beginPath(); ctx.arc(30, 40, 5, 0, TAU); ctx.fillStyle = led ? ACC : '#3b4260'; ctx.fill();
    ctx.restore();
  }

  // ground-station dish standing at (x, y), pointing at angle a (radians, 0 = straight up, + = right)
  function dish(x, y, s, a, glowK = 0) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 120);
    roundRect(ctx, -40, -26, 80, 26, 6); ctx.fillStyle = '#b9c1d6'; ctx.fill();
    ctx.fillStyle = '#8a93a8'; ctx.fillRect(-10, -70, 20, 46);
    ctx.translate(0, -76); ctx.rotate(a);
    if (glowK > 0) K.glow(ctx, 0, -40, 90, ACC, 0.5 * glowK);
    ctx.beginPath(); ctx.ellipse(0, 0, 66, 26, 0, Math.PI, TAU); ctx.closePath(); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, 0, 66, 10, 0, 0, TAU); ctx.fillStyle = '#d5dae8'; ctx.fill();
    ctx.strokeStyle = '#8a93a8'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-40, -4); ctx.lineTo(0, -52); ctx.lineTo(40, -4); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -54, 7, 0, TAU); ctx.fillStyle = glowK > 0 ? ACC : '#8a93a8'; ctx.fill();
    ctx.restore();
    return { x: x + Math.sin(a) * 130 * s, y: y - 76 * s - Math.cos(a) * 54 * s };
  }

  // light beam from a to b; k = intensity 0..1; packets move a -> b
  function beam(ax, ay, bx, by, k, o = {}) {
    if (k <= 0) return;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = H.rgba(ACC, 0.16 * k); ctx.lineWidth = 46; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.strokeStyle = H.rgba(ACC, 0.35 * k); ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.strokeStyle = `rgba(255,255,255,${0.75 * k})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    const n = o.packets == null ? 4 : o.packets;
    for (let i = 0; i < n; i++) {
      const u = fract(t * (o.speed || 0.8) + i / n);
      const px = lerp(ax, bx, u), py = lerp(ay, by, u);
      K.glow(ctx, px, py, 30, ACC, 0.8 * k);
      ctx.beginPath(); ctx.arc(px, py, 8, 0, TAU); ctx.fillStyle = `rgba(255,255,255,${k})`; ctx.fill();
    }
    ctx.restore();
  }

  // paper scroll centred at (cx, cy): open 0..1, lines with alphas
  function scroll(cx, cy, w, h, open, lines, alphas, o = {}) {
    const hh = Math.max(24, h * open);
    ctx.save();
    K.shadow(ctx, cx, cy + hh / 2 + 34, w * 0.8);
    K.glow(ctx, cx, cy, w * 0.6, ACC, 0.12);
    roundRect(ctx, cx - w / 2 + 16, cy - hh / 2, w - 32, hh, 6); ctx.fillStyle = '#f6efd9'; ctx.fill();
    ctx.fillStyle = '#e6dbbb'; ctx.fillRect(cx - w / 2 + 16, cy + hh / 2 - 14, w - 32, 14);
    for (const sy of [-1, 1]) {
      const ry = cy + sy * hh / 2;
      roundRect(ctx, cx - w / 2, ry - 15, w, 30, 15); ctx.fillStyle = '#d9c99a'; ctx.fill();
      roundRect(ctx, cx - w / 2, ry - 15, w, 12, 8); ctx.fillStyle = '#efe3bd'; ctx.fill();
      for (const ex of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + ex * (w / 2 + 4), ry, 12, 0, TAU); ctx.fillStyle = '#9a6a46'; ctx.fill(); }
    }
    if (open > 0.6) {
      ctx.save(); ctx.beginPath(); ctx.rect(cx - w / 2, cy - hh / 2 + 16, w, hh - 32); ctx.clip();
      const n = lines.length, lh = o.lh || 74, top = cy - ((n - 1) * lh) / 2 + (o.dy || 0);
      lines.forEach((ln, i) => {
        const a = alphas[i] || 0; if (a <= 0) return;
        const ft = H.fitText(ctx, ln, 'bold', o.size || 44, 20, w - 100);
        ctx.globalAlpha = a; ctx.font = ft.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#2a2236'; ctx.fillText(ft.text, cx, top + i * lh + (1 - a) * 14);
      });
      ctx.restore();
    }
    ctx.restore();
  }

  function rocket(x, y, s, fire) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (fire > 0) {
      for (let i = 0; i < 3; i++) {
        const fl = 70 + 30 * Math.abs(Math.sin(t * 23 + i * 2)) ;
        ctx.globalAlpha = fire * (0.9 - i * 0.25);
        ctx.beginPath(); ctx.moveTo(-26 + i * 6, 0); ctx.lineTo(0, fl * (1 + i * 0.5)); ctx.lineTo(26 - i * 6, 0); ctx.closePath();
        ctx.fillStyle = ['#fff1a8', '#ffb347', '#ff6b3d'][i]; ctx.fill();
      }
      ctx.globalAlpha = 1; K.glow(ctx, 0, 30, 120, '#ffb347', 0.6 * fire);
    }
    // fins
    ctx.fillStyle = '#3b4260';
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.moveTo(sd * 34, -70); ctx.lineTo(sd * 66, 0); ctx.lineTo(sd * 30, 0); ctx.closePath(); ctx.fill(); }
    roundRect(ctx, -34, -230, 68, 230, 30); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = '#d5dae8'; ctx.fillRect(10, -200, 24, 196);
    ctx.beginPath(); ctx.moveTo(-34, -200); ctx.quadraticCurveTo(0, -310, 34, -200); ctx.closePath(); ctx.fillStyle = '#e8786a'; ctx.fill();
    ctx.fillStyle = ACC; ctx.fillRect(-34, -90, 68, 14);
    ctx.beginPath(); ctx.arc(0, -150, 16, 0, TAU); ctx.fillStyle = '#2a2f45'; ctx.fill();
    ctx.beginPath(); ctx.arc(-4, -154, 6, 0, TAU); ctx.fillStyle = '#7fa6ff'; ctx.fill();
    ctx.restore();
  }

  function bigText(text, x, y, size, color, kind = 'display', align = 'center') {
    ctx.save(); ctx.font = H.font(kind, size); ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = color;
    ctx.fillText(text, x, y); ctx.restore();
  }
  const pill = (x, y, p, text, accent = false, size = 32) => { if (p > 0) K.drawLabel(ctx, x, y, Math.min(1.06, p), { text, size, accent }); };

  // ------------------------------------------------------------------ modes
  if (mode === 'hook') {
    // the scroll is already sliding down the beam at frame 0 and unrolls by ~1.8 s
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.06, x: 487, y: 700 }]);
    sky(); earth({ snow: 300 });
    const sx = 700, sy = 470 + K.bob(t, 6, 0.4);
    const dp = dish(300, limbY(300), 1.05, 0.42, 1);
    beam(sx - 10, sy + 40, dp.x, dp.y, 1, { packets: 3, speed: -0.9 });
    sat(sx, sy, 1.15, { chip: 1, sun: 0.4 });
    K.drawPerson(ctx, 165, limbY(165) + 6, 0.85, { t, pose: t > 1.6 ? 'cheer' : 'point', mood: 'happy', look: 1, shirt: 1, hairStyle: 'curly', seed: 3 });
    // scroll slides from the satellite toward the middle, then unrolls
    const slide = K.phase(t, -0.35, 0.9, H.easeOutCubic);
    const cx = lerp(640, 487, slide), cy = lerp(560, 700, slide), w = lerp(160, 640, slide);
    const open = K.phase(t, 0.55, 1.3, H.easeOutCubic);
    const lines = P.lines || ['Hello from orbit', 'A reply rides the beam', 'Sent back down to Earth'];
    scroll(cx, cy, w, 290, open, lines, lines.map((_, i) => smooth((t - 1.1 - i * 0.25) / 0.4)), { size: 40, lh: 66 });
    pill(250, 470, K.popIn(t, 0.05, 0.4), P.tag || 'Sent from orbit', true, 32);
    ctx.restore();
    return;
  }

  if (mode === 'launch') {
    const tName = at(P.nameCue, 1.6), tLaunch = at(P.launchCue, D * 0.35);
    const tChip = at(P.chipCue, D * 0.7), tNews = at(P.newsCue, D * 0.8);
    const tSat = tLaunch + 1.6;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 760 }, { t: tLaunch, zoom: 1.04, x: 487, y: 760 }, { t: tSat + 0.6, zoom: 1.0, x: 487, y: 700 }, { t: D, zoom: 1.04, x: 487, y: 690 }]);
    if (t >= tLaunch && t < tLaunch + 0.5) K.cameraShake(ctx, t, tLaunch, 0.5, 8);
    sky(); earth();
    // launch pad + rocket
    const padY = limbY(487);
    ctx.fillStyle = '#3b4260'; ctx.fillRect(400, padY - 14, 174, 16); ctx.fillStyle = '#8a93a8'; ctx.fillRect(560, padY - 260, 14, 250);
    const lift = Math.max(0, t - tLaunch), ry = padY - 16 - 120 * lift * lift - 40 * lift;
    const wob = t < tLaunch ? 0 : Math.sin(t * 30) * 1.5;
    if (ry > -300) rocket(487 + wob, ry, 0.95, t < tLaunch ? (t > tLaunch - 0.6 ? 0.4 : 0) : 1);
    // smoke puffs at the pad
    if (t > tLaunch) for (let i = 0; i < 8; i++) {
      const age = t - tLaunch - i * 0.08; if (age <= 0) continue;
      const a = Math.max(0, 1 - age / 2.6), dx = (i % 2 ? 1 : -1) * (40 + age * 90 + i * 8);
      ctx.globalAlpha = 0.7 * a; ctx.beginPath(); ctx.arc(487 + dx, padY - 20 - age * 12, 34 + age * 26, 0, TAU); ctx.fillStyle = '#d5dae8'; ctx.fill();
    }
    ctx.globalAlpha = 1;
    pill(487, 520, K.popIn(t, tName - 0.15, 0.4) * K.fadeOut(t, tLaunch + 1.2, 0.3), P.name || 'Project name', false, 36);
    pill(487, 520, K.popIn(t, tLaunch + 1.3, 0.4), P.date || 'Launch date', true, 34);
    // satellite drifts in from the top right and unfolds its wings
    if (t > tSat - 0.2) {
      const k = K.phase(t, tSat - 0.2, tSat + 1.0, H.easeOutCubic);
      const sx = lerp(980, 560, k), sy = lerp(380, 720, k) + K.bob(t, 6, 0.35);
      sat(sx, sy, 1.3, { wings: K.phase(t, tSat + 0.7, tSat + 1.6, H.easeOutBack), chip: smooth((t - tChip) / 0.5), tilt: lerp(-0.3, 0, k) });
      if (t > tNews - 0.2) {
        const p = K.popIn(t, tNews - 0.2, 0.45);
        pill(487, 940, p, P.news || 'First test passed', true, 34);
      }
    }
    ctx.restore();
    return;
  }

  if (mode === 'uplink') {
    const tUp = at(P.upCue, 0.4), tModel = at(P.modelCue, D * 0.35), tChip = at(P.chipCue, D * 0.6), tAsk = at(P.askCue, D * 0.72);
    const tFly = tAsk + 2.0;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 487, y: 700 }]);
    sky(); earth();
    const u = K.phase(t, 0, D, (x) => x);
    const sx = lerp(650, 780, u), sy = 520 + K.bob(t, 5, 0.4);
    const dx = 270, dy = limbY(dx);
    const ang = Math.atan2(sx - dx, dy - 76 - sy);
    const dp = dish(dx, dy, 1.1, ang, t > tUp ? 1 : 0);
    beam(dp.x, dp.y, sx, sy + 50, smooth((t - tUp) / 0.4), { packets: 4, speed: 0.9 });
    const flash = t > tFly + 0.6 ? Math.max(0, 1 - (t - tFly - 0.6) / 0.8) : 0;
    sat(sx, sy, 0.85, { chip: Math.max(smooth((t - tModel) / 0.4), flash) });
    if (flash > 0) K.glow(ctx, sx, sy, 200, ACC, 0.6 * flash);
    K.drawPerson(ctx, 135, limbY(135) + 6, 0.85, { t, pose: 'point', mood: 'happy', look: 1, shirt: 1, hairStyle: 'curly', seed: 3, talk: t < tUp + 1 ? 0.4 : 0 });
    // magnifier inset of the chip
    const ins = K.popIn(t, tModel - 0.2, 0.45) * K.fadeOut(t, tAsk - 0.3, 0.3);
    if (ins > 0) {
      const ix = 285, iy = 610, ir = 140 * Math.min(1.05, ins);
      ctx.save();
      ctx.strokeStyle = H.rgba(ACC, 0.6); ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(ix + ir * 0.8, iy - ir * 0.5); ctx.lineTo(sx - 20, sy - 20); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(ix, iy, ir, 0, TAU); ctx.fillStyle = '#0d1126'; ctx.fill();
      ctx.lineWidth = 8; ctx.strokeStyle = '#dfe4f1'; ctx.stroke();
      ctx.beginPath(); ctx.arc(ix, iy, ir, 0, TAU); ctx.clip();
      // a big chip with pins and a pulsing core
      const cs = ir / 150 * 0.95, pulse = 0.5 + 0.5 * Math.sin(t * 6);
      K.glow(ctx, ix, iy, 130 * cs, ACC, 0.35 + 0.25 * pulse);
      roundRect(ctx, ix - 70 * cs, iy - 70 * cs, 140 * cs, 140 * cs, 14 * cs); ctx.fillStyle = '#2a2f45'; ctx.fill();
      roundRect(ctx, ix - 42 * cs, iy - 42 * cs, 84 * cs, 84 * cs, 8 * cs); ctx.fillStyle = mixHex('#3b4260', ACC, 0.7 + 0.3 * pulse); ctx.fill();
      ctx.strokeStyle = '#b9c1d6'; ctx.lineWidth = 6 * cs;
      for (let k = -2; k <= 2; k++) for (const s of [-1, 1]) {
        ctx.beginPath(); ctx.moveTo(ix + k * 24 * cs, iy + s * 70 * cs); ctx.lineTo(ix + k * 24 * cs, iy + s * 92 * cs); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(ix + s * 70 * cs, iy + k * 24 * cs); ctx.lineTo(ix + s * 92 * cs, iy + k * 24 * cs); ctx.stroke();
      }
      ctx.restore();
      pill(ix, iy - ir - 14, K.popIn(t, tModel, 0.4) * ins, P.model || 'AI model', true, 34);
      pill(ix, iy + ir + 64, K.popIn(t, tChip - 0.1, 0.4) * ins, P.chip || 'Data-center chip', false, 30);
    }
    // the prompt card types in, then flies up the beam into the satellite
    if (t > tAsk - 0.2) {
      const fly = K.phase(t, tFly, tFly + 0.7, H.easeInOutCubic);
      const cx = lerp(420, sx, fly), cy = lerp(640, sy, fly), sc = lerp(1, 0.08, fly) * Math.min(1.05, K.popIn(t, tAsk - 0.2, 0.4));
      if (fly < 1) {
        const txt = K.typewriter(P.prompt || 'Say hello from space', t, 26, tAsk);
        ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc);
        roundRect(ctx, -280, -90, 560, 180, 26); ctx.fillStyle = '#f2f4fa'; ctx.fill();
        ctx.save(); roundRect(ctx, -280, -90, 560, 180, 26); ctx.clip(); ctx.fillStyle = ACC; ctx.fillRect(-280, -90, 560, 50); ctx.restore();
        ctx.font = H.font('ui', 26); ctx.fillStyle = mixHex(ACC, '#000000', 0.62); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(P.promptTitle || 'PROMPT', -250, -64);
        const lines = H.wrap(ctx, txt, 'bold', 34, 500);
        ctx.font = H.font('bold', 34); ctx.fillStyle = '#161927';
        lines.forEach((ln, i) => ctx.fillText(ln, -250, -2 + i * 44));
        ctx.restore();
      }
    }
    ctx.restore();
    return;
  }

  if (mode === 'haiku') {
    const tDown = at(P.downCue, 1.0), cues = P.lineCues || [], tStamp = at(P.stampCue, D * 0.82);
    const lines = P.lines || ['Hello from orbit', 'A reply rides the beam', 'Sent back down to Earth'];
    const lt = lines.map((_, i) => at(cues[i], tDown + 1.2 + i * 1.8));
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 487, y: 690 }]);
    sky(); earth({ snow: 640 });
    const sx = 760, sy = 448 + K.bob(t, 5, 0.4);
    const dx = 690, dy = limbY(dx);
    const dp = dish(dx, dy, 1.0, 0.1, t > tDown ? 1 : 0);
    beam(sx - 10, sy + 50, dp.x, dp.y, smooth((t - tDown + 0.3) / 0.4), { packets: 3, speed: -0.8 });
    sat(sx, sy, 0.9, { chip: 1 });
    // place pin on the snowy patch
    const pp = K.popIn(t, 0.1, 0.45);
    if (pp > 0) {
      const px = 560, py = limbY(560) + 8;
      ctx.save(); ctx.translate(px, py); ctx.scale(pp, pp);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-30, -40, -30, -76, 0, -76); ctx.bezierCurveTo(30, -76, 30, -40, 0, 0); ctx.fillStyle = ACC; ctx.fill();
      ctx.beginPath(); ctx.arc(0, -52, 10, 0, TAU); ctx.fillStyle = '#161927'; ctx.fill();
      ctx.restore();
      pill(440, py - 88, pp, P.place || 'Ground station', false, 28);
    }
    // engineer cheers when the stamp lands
    K.drawPerson(ctx, 140, limbY(140) + 6, 0.85, { t, pose: t > tStamp ? 'cheer' : (t > tDown ? 'point' : 'stand'), mood: 'happy', look: 1, shirt: 1, hairStyle: 'curly', seed: 3 });
    // the scroll comes down the beam and unrolls
    const k = K.phase(t, tDown, tDown + 0.9, H.easeOutCubic);
    if (k > 0) {
      const cx = lerp(740, 487, k), cy = lerp(500, 668, k), w = lerp(120, 700, k);
      const open = K.phase(t, tDown + 0.6, tDown + 1.3, H.easeOutCubic);
      scroll(cx, cy, w, 290, open, lines, lt.map((x) => smooth((t - x + 0.15) / 0.45)), { size: 44, lh: 70, dy: -10 });
      const bp = smooth((t - lt[lt.length - 1] - 0.8) / 0.5);
      if (bp > 0 && open > 0.9) { ctx.save(); ctx.globalAlpha = bp; ctx.font = H.font('ui', 26); ctx.fillStyle = '#6b5a3a'; ctx.textAlign = 'center'; ctx.fillText('- ' + (P.by || 'The AI model'), 487, 668 + 125); ctx.restore(); }
    }
    if (t > tStamp - 0.1) K.drawStamp(ctx, 790, 930, 0.95, { kind: 'check', text: P.stamp || 'HELLO WORLD', land: (t - tStamp + 0.1) / 0.5 });
    ctx.restore();
    return;
  }

  if (mode === 'power') {
    const tEarth = at(P.earthCue, D * 0.25), tCount = at(P.countCue, D * 0.6), tSun = Math.max(tEarth + 1.2, tCount - 2.4);
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 725 }]);
    // left: dusk ground
    const lg = ctx.createLinearGradient(0, 0, 0, 1920); lg.addColorStop(0, '#2a1f45'); lg.addColorStop(0.5, '#6b3d5e'); lg.addColorStop(0.56, '#2a2036'); lg.addColorStop(1, '#0d0a14');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, 487, 1920);
    ctx.fillStyle = '#1e1a2c'; ctx.fillRect(0, 1000, 487, 920);
    // right: space
    ctx.save(); ctx.beginPath(); ctx.rect(487, 0, 593, 1920); ctx.clip(); sky(); ctx.restore();
    // divider
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(485, 400, 4, 650);
    bigText(P.leftTitle || 'ON EARTH', 270, 450, 34, '#dfe4f1', 'bold');
    bigText(P.rightTitle || 'IN ORBIT', 705, 450, 34, '#dfe4f1', 'bold');
    // data center + power cables + meter
    const strain = smooth((t - tEarth + 0.4) / 0.6);
    K.drawDataCenter(ctx, 270, 1000, 1.05, { t, activity: 0.6 + 0.4 * strain });
    // pylon + cable
    ctx.strokeStyle = '#8a93a8'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(90, 1000); ctx.lineTo(110, 700); ctx.lineTo(130, 1000); ctx.moveTo(95, 760); ctx.lineTo(125, 760); ctx.stroke();
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(110, 710); ctx.quadraticCurveTo(200, 790, 300, 805); ctx.stroke();
    // gauge
    const gx = 270, gy = 640, needle = lerp(-2.4, -0.55, strain) + (strain > 0.9 ? Math.sin(t * 22) * 0.06 : 0);
    ctx.beginPath(); ctx.arc(gx, gy, 92, Math.PI, TAU); ctx.lineTo(gx + 92, gy + 10); ctx.lineTo(gx - 92, gy + 10); ctx.closePath(); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#4fb3a6'; ctx.beginPath(); ctx.arc(gx, gy, 70, Math.PI, Math.PI * 1.5); ctx.stroke();
    ctx.strokeStyle = '#ffcc33'; ctx.beginPath(); ctx.arc(gx, gy, 70, Math.PI * 1.5, Math.PI * 1.75); ctx.stroke();
    ctx.strokeStyle = '#ff6b5e'; ctx.beginPath(); ctx.arc(gx, gy, 70, Math.PI * 1.75, TAU); ctx.stroke();
    ctx.strokeStyle = '#161927'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(needle) * 64, gy + Math.sin(needle) * 64); ctx.stroke();
    ctx.beginPath(); ctx.arc(gx, gy, 10, 0, TAU); ctx.fillStyle = '#161927'; ctx.fill();
    // lightning bolt
    ctx.save(); ctx.translate(gx, gy - 52); ctx.scale(0.6, 0.6); ctx.beginPath(); ctx.moveTo(6, -30); ctx.lineTo(-14, 4); ctx.lineTo(2, 4); ctx.lineTo(-6, 30); ctx.lineTo(16, -6); ctx.lineTo(0, -6); ctx.closePath(); ctx.fillStyle = '#ffcc33'; ctx.fill(); ctx.restore();
    if (strain > 0.9) { const wp = 0.6 + 0.4 * Math.abs(Math.sin(t * 5)); K.drawWarning(ctx, 410, 600, 0.45 * wp + 0.15, { pulse: wp }); }
    pill(270, 1005, K.popIn(t, tEarth - 0.1, 0.4), P.earth || 'Power hungry', false, 28);
    // sun + satellite
    const sunK = smooth((t - tSun) / 0.8);
    K.glow(ctx, 890, 520, 300, '#fff3b0', 0.25 + 0.45 * sunK);
    ctx.beginPath(); ctx.arc(890, 520, 46, 0, TAU); ctx.fillStyle = '#fff6c8'; ctx.fill();
    if (sunK > 0) {
      ctx.save(); ctx.globalAlpha = 0.5 * sunK; ctx.strokeStyle = '#fff3b0'; ctx.lineWidth = 6; ctx.setLineDash([18, 16]); ctx.lineDashOffset = -t * 60;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(860 - i * 10, 560 + i * 20); ctx.lineTo(760 - i * 50, 640 + i * 30); ctx.stroke(); }
      ctx.restore();
    }
    sat(690, 680 + K.bob(t, 6, 0.35), 0.95, { sun: sunK, chip: 0.6 });
    // count
    const val = +(P.value || 5), cnt = t < tCount ? 0 : Math.max(1, Math.round(K.countUp(val, t, tCount, 1.0)));
    const cp = K.popIn(t, tCount - 0.15, 0.4);
    if (cp > 0) {
      ctx.save(); ctx.translate(705, 900); ctx.scale(Math.min(1.06, cp), Math.min(1.06, cp));
      bigText(P.prefix || 'UP TO', 0, -92, 30, '#dfe4f1', 'ui');
      K.glow(ctx, 0, -30, 120, ACC, 0.25);
      bigText(cnt + (P.unit || 'x'), 0, 30, 130, ACC, 'display');
      ctx.restore();
      const sp = smooth((t - tCount - 0.4) / 0.4);
      if (sp > 0) {
        ctx.save(); ctx.globalAlpha = sp;
        const sub = P.sub || 'more solar power';
        const lines = H.wrap(ctx, sub, 'ui', 26, 360);
        ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
        lines.forEach((ln, i) => ctx.fillText(ln, 705, 970 + i * 32));
        ctx.font = H.font('body', 22); ctx.fillStyle = '#b9c1d6'; ctx.fillText('Source: ' + (P.src || 'The company'), 705, 970 + lines.length * 32 + 6);
        ctx.restore();
      }
    }
    ctx.restore();
    return;
  }

  if (mode === 'heat') {
    const tOne = at(P.oneCue, 0.3), tHeat = at(P.heatCue, D * 0.2), tHot = at(P.hotCue, D * 0.4), tNext = at(P.nextCue, D * 0.6);
    const pull = K.phase(t, tNext, tNext + 1.2);
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: tNext, zoom: 1.06, x: 487, y: 690 }, { t: tNext + 1.2, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 725 }]);
    sky(); earth();
    const heat = smooth((t - tHeat) / 1.6) * (1 - smooth((t - tNext - 0.4) / 1.2));
    const s1x = lerp(487, 300, pull), s1y = lerp(660, 690, pull) + K.bob(t, 5, 0.4), s1s = lerp(1.55, 1.0, pull);
    // heat shimmer rings
    if (heat > 0) for (let i = 0; i < 4; i++) {
      const ph = fract(t * 0.7 + i / 4);
      ctx.save(); ctx.globalAlpha = heat * (1 - ph) * 0.6; ctx.strokeStyle = i % 2 ? '#ff9a3d' : '#ff4d3d'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(s1x, s1y - 20 * s1s, (40 + ph * 120) * s1s, 0, TAU); ctx.stroke(); ctx.restore();
    }
    sat(s1x, s1y, s1s, { chip: 0.5, hot: heat });
    pill(487, 470, K.popIn(t, tOne - 0.1, 0.4) * K.fadeOut(t, tNext - 0.2, 0.3), P.one || '1 test satellite', false, 32);
    // thermometer on the right
    const th = K.popIn(t, tHeat - 0.2, 0.4) * K.fadeOut(t, tNext + 0.8, 0.4);
    if (th > 0) {
      const tx = 880, ty = 900;
      ctx.save(); ctx.translate(tx, ty); ctx.scale(th, th);
      roundRect(ctx, -22, -300, 44, 300, 22); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 10, 40, 0, TAU); ctx.fill();
      const lvl = 40 + 230 * heat, col = mixHex('#4fb3a6', '#ff4d3d', heat);
      roundRect(ctx, -11, -lvl, 22, lvl + 10, 11); ctx.fillStyle = col; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 10, 28, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#8a93a8'; ctx.lineWidth = 3; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(22, -i * 48); ctx.lineTo(36, -i * 48); ctx.stroke(); }
      ctx.restore();
    }
    pill(487, 960, K.popIn(t, tHot - 0.1, 0.4) * K.fadeOut(t, tNext - 0.2, 0.3), P.hot || 'No air to cool it', true, 32);
    // the twin satellite and the light link
    if (pull > 0) {
      const s2x = lerp(1180, 680, pull), s2y = 600 + K.bob(t, 5, 0.4, 0.3);
      sat(s2x, s2y, 1.0, { chip: 0.6 });
      const lk = smooth((t - tNext - 1.0) / 0.5);
      if (lk > 0) {
        ctx.save(); ctx.globalAlpha = lk; ctx.strokeStyle = H.rgba(ACC, 0.9); ctx.lineWidth = 6; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 80;
        ctx.beginPath(); ctx.moveTo(s1x + 40, s1y - 30); ctx.quadraticCurveTo((s1x + s2x) / 2, 560, s2x - 40, s2y - 30); ctx.stroke(); ctx.restore();
        K.glow(ctx, (s1x + s2x) / 2, 600, 80, ACC, 0.4 * lk);
      }
      pill(487, 480, K.popIn(t, tNext + 0.5, 0.45), P.next || 'Next: more satellites', true, 32);
    }
    ctx.restore();
    return;
  }
}
