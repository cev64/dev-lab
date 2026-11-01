// Scene "jet-pivot" (full frame). A jet-engine startup that also sells ground power plants for AI data centers.
// A sleek generic supersonic jet (white, no livery, no logo), an engine core, a ground gas-turbine power plant, a data
// center, at a dusk airfield with a low sun on the horizon. Modes:
//   hook    (cold open, ~4 s): a gantry crane is already carrying an engine core from the jet to the power plant at
//           frame 0; it lands (clunk), the plant spins up, power pulses run to the data center, a pill pops.
//   factory (~14 s): the jet in the spotlight (+ name pill at jetCue); at dateCue it rolls back and a date pill pops; at
//           factoryCue a turbine factory rises with a sign; at turbCue turbine units roll out; at dcCue a data center
//           lights up as cables connect. A cartoon worker points.
//   power   (~10 s): close on the power plant (core spinning in the window), a gauge counts to `mw` at mwCue; at sameCue
//           the jet appears with its engine lit and a dashed "same tech" link; at moneyCue coins arc from the plant to
//           the jet with an attributed pill.
//   deal    (~14 s): an ORDER contract (parties as text) fills with `count` turbine icons at countCue, the amount stamps
//           in at moneyCue, a date pill at dateCue, the contract tears in two at tearCue, then a verbatim quote panel
//           at quoteCue.
//   jet     (~13 s): night hangar, the jet on stands; a wall calendar flips year by year; order pill + `orderN` mini
//           jets at orderCue; a text-only quote card (no person drawn) whose words appear as they are spoken from
//           quoteCue; at flipCue the calendar tears past the last year to "20??".
//   caveat  (~9 s): a balance scale with the jet on one pan and a power plant on the other, wobbling to level;
//           three pills (mileCue / replyCue / officialCue).
// Defaults are generic placeholders ("A NEW JET", "SELLER: JET MAKER", "Quote goes here.", "Source, Date"); pass the
// story's names, verbatim quotes and published figures.
// Fits: companies pivoting to sell power / hardware to AI data centers; delayed products; lost launch customers.
// params: mode, cues per mode (narration words; "word#n" = (n+1)th time; or seconds), texts:
//   hook: pill; factory: jetName, date, sign, turbLabel; power: name, mw, unit, same, money;
//   deal: title, partyA, partyB, count, amount, date, torn, quote, by; jet: orderText, orderN, years [..], quote, by;
//   caveat: pills [3], left, right.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const TAU = Math.PI * 2;
  const at = (w, d) => {
    if (typeof w === 'number') return w;
    const [word, n] = String(w || '').split('#');
    const v = word ? info.timeOf(word, n ? +n : 0) : null;
    return v == null ? d : v;
  };
  const ph = (a, b) => K.phase(t, a, b);
  const ease = H.easeInOutCubic;
  const mode = P.mode || 'hook';
  const GY = 1010;

  // ---------------------------------------------------------------- helpers
  function rr(x, y, w, h, r, c) { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); }
  function circ(x, y, r, c) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = c; ctx.fill(); }

  function skyAndField(hy, night) {
    const g = ctx.createLinearGradient(0, 0, 0, hy);
    if (night) { g.addColorStop(0, '#0a0e26'); g.addColorStop(1, '#2a2f5e'); }
    else { g.addColorStop(0, '#1d2050'); g.addColorStop(0.55, '#55427a'); g.addColorStop(1, '#e8876a'); }
    ctx.fillStyle = g; ctx.fillRect(-300, -300, 1680, hy + 300);
    for (let i = 0; i < 30; i++) {
      const sx = H.hash(i, 11) * 1080, sy = 120 + H.hash(i, 12) * (hy - 380);
      ctx.globalAlpha = (night ? 0.6 : 0.35) * (0.5 + 0.5 * Math.sin(t * 1.7 + i * 1.3));
      circ(sx, sy, 1.4 + H.hash(i, 13) * 1.4, '#ffffff');
    }
    ctx.globalAlpha = 1;
    if (!night) { K.glow(ctx, 760, hy - 10, 260, '#ff9a66', 0.5); circ(760, hy - 6, 46, '#ffb27a'); }
    // distant mountains (generic)
    ctx.fillStyle = night ? '#141a3c' : '#3a3466';
    ctx.beginPath(); ctx.moveTo(-300, hy);
    for (let i = 0; i <= 14; i++) { const x = -300 + i * 120, y = hy - 40 - 90 * H.hash(i, 21); ctx.lineTo(x, y); }
    ctx.lineTo(1380, hy); ctx.closePath(); ctx.fill();
    ctx.fillStyle = night ? '#10152f' : '#2c2a52';
    ctx.beginPath(); ctx.moveTo(-300, hy);
    for (let i = 0; i <= 18; i++) { const x = -300 + i * 95, y = hy - 15 - 45 * H.hash(i, 22); ctx.lineTo(x, y); }
    ctx.lineTo(1380, hy); ctx.closePath(); ctx.fill();
    // tarmac
    const g2 = ctx.createLinearGradient(0, hy, 0, 1920);
    g2.addColorStop(0, night ? '#1c2142' : '#3b3c63'); g2.addColorStop(0.35, '#23264a'); g2.addColorStop(1, '#0b0d1c');
    ctx.fillStyle = g2; ctx.fillRect(-300, hy, 1680, 1920 - hy + 300);
    // runway centre dashes in perspective
    for (let i = 0; i < 9; i++) {
      const k = i / 8, y = lerp(hy + 8, GY + 90, k * k), w = lerp(10, 90, k * k), h = lerp(2, 12, k * k);
      ctx.globalAlpha = 0.25 + 0.35 * k; rr(487 - w / 2 + (1 - k) * 0, y, w, h, h / 2, '#e8ecf7');
    }
    ctx.globalAlpha = 1;
    // edge lights
    for (let i = 0; i < 12; i++) {
      const k = i / 11, y = lerp(hy + 6, GY + 120, k * k), dx = lerp(60, 620, k * k);
      for (const s of [-1, 1]) { const x = 487 + s * dx; K.glow(ctx, x, y, 8 + 14 * k, ACC, 0.35); circ(x, y, 1.5 + 3 * k, ACC); }
    }
  }

  // supersonic jet, side view, nose right; anchor bottom-centre. o: dim, missing (nacelle idx), glow (nacelle idx)
  function jet(x, y, s, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    K.shadow(ctx, 0, 0, 520, 0.35);
    const body = '#eef1f8', under = '#c9d0e2', wing = '#aeb7cf', nac = '#8f98b4';
    // far wing (behind)
    ctx.beginPath(); ctx.moveTo(30, -160); ctx.lineTo(-120, -205); ctx.lineTo(-170, -205); ctx.lineTo(-150, -162); ctx.closePath(); ctx.fillStyle = '#9aa3bf'; ctx.fill();
    // tail fin
    ctx.beginPath(); ctx.moveTo(-190, -168); ctx.lineTo(-262, -262); ctx.lineTo(-296, -262); ctx.lineTo(-284, -168); ctx.closePath(); ctx.fillStyle = '#dfe4f0'; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; ctx.beginPath(); ctx.moveTo(-262, -262); ctx.lineTo(-296, -262); ctx.lineTo(-284, -168); ctx.lineTo(-262, -168); ctx.closePath(); ctx.fill();
    // gear
    ctx.strokeStyle = '#596180'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (const gx of [205, -95, -40]) { ctx.beginPath(); ctx.moveTo(gx, -128); ctx.lineTo(gx, -18); ctx.stroke(); }
    for (const gx of [205, -105, -85, -50, -30]) { circ(gx, -13, 13, '#1a1d2c'); circ(gx, -13, 5, '#5d6584'); }
    // fuselage
    ctx.beginPath(); ctx.moveTo(-292, -168); ctx.lineTo(150, -172); ctx.quadraticCurveTo(255, -168, 312, -146);
    ctx.quadraticCurveTo(255, -128, 150, -126); ctx.lineTo(-292, -132); ctx.closePath();
    ctx.fillStyle = body; ctx.fill();
    ctx.save(); ctx.clip(); ctx.fillStyle = under; ctx.fillRect(-300, -146, 620, 30); ctx.restore();
    // windows + cockpit
    for (let i = 0; i < 15; i++) circ(-205 + i * 22, -156, 4.2, '#3b4468');
    ctx.beginPath(); ctx.moveTo(228, -165); ctx.lineTo(262, -160); ctx.lineTo(250, -152); ctx.lineTo(226, -154); ctx.closePath(); ctx.fillStyle = '#2b3355'; ctx.fill();
    // near wing (swept delta)
    ctx.beginPath(); ctx.moveTo(70, -140); ctx.lineTo(-190, -86); ctx.lineTo(-250, -88); ctx.lineTo(-200, -140); ctx.closePath(); ctx.fillStyle = wing; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.beginPath(); ctx.moveTo(70, -140); ctx.lineTo(-190, -86); ctx.lineTo(-170, -86); ctx.lineTo(50, -140); ctx.closePath(); ctx.fill();
    // nacelles under the wing
    const nacs = [[-200, -96], [-120, -106]];
    nacs.forEach(([nx, ny], i) => {
      if (o.missing === i) {   // empty pylon
        ctx.strokeStyle = '#6b7392'; ctx.lineWidth = 5; ctx.setLineDash([8, 7]);
        roundRect(ctx, nx - 52, ny - 4, 104, 30, 13); ctx.stroke(); ctx.setLineDash([]);
        return;
      }
      if (o.glow === i) K.glow(ctx, nx, ny + 11, 90, ACC, 0.55 * (o.glowA == null ? 1 : o.glowA));
      rr(nx - 52, ny - 4, 104, 30, 13, nac);
      rr(nx - 52, ny + 12, 104, 14, 7, '#7a83a0');
      ctx.beginPath(); ctx.ellipse(nx + 50, ny + 11, 6, 13, 0, 0, TAU); ctx.fillStyle = o.glow === i ? ACC : '#2a3050'; ctx.fill();
    });
    if (o.dim) { ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = rgba('#0b0f26', o.dim); ctx.fillRect(-320, -280, 650, 290); }
    ctx.restore();
  }

  // engine core, centre-anchored, ~150x76 at s = 1
  function core(x, y, s, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (o.on) K.glow(ctx, 0, 0, 120, ACC, 0.5 * o.on);
    ctx.beginPath(); ctx.moveTo(-75, -26); ctx.lineTo(-55, -38); ctx.lineTo(62, -38); ctx.lineTo(74, -30); ctx.lineTo(74, 30); ctx.lineTo(62, 38); ctx.lineTo(-55, 38); ctx.lineTo(-75, 26); ctx.closePath();
    ctx.fillStyle = '#b4bccf'; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.14)'; ctx.fillRect(-75, 8, 150, 30);
    ctx.strokeStyle = '#7c859f'; ctx.lineWidth = 4;
    for (const rx of [-40, -8, 26]) { ctx.beginPath(); ctx.moveTo(rx, -38); ctx.lineTo(rx, 38); ctx.stroke(); }
    // fan face with spinning blades
    ctx.beginPath(); ctx.ellipse(74, 0, 13, 32, 0, 0, TAU); ctx.fillStyle = '#2a3050'; ctx.fill();
    const spin = o.spin || 0;
    ctx.strokeStyle = o.on ? rgba(ACC, 0.6 + 0.4 * o.on) : '#8f98b4'; ctx.lineWidth = 3;
    for (let i = 0; i < 6; i++) { const a = spin + i * TAU / 6; ctx.beginPath(); ctx.moveTo(74, 0); ctx.lineTo(74 + Math.cos(a) * 11, Math.sin(a) * 28); ctx.stroke(); }
    circ(74, 0, 4, o.on ? ACC : '#c9d0e2');
    ctx.restore();
  }

  // ground power plant (gas turbine package), anchor bottom-centre, ~280x300 at s = 1. o: core (0..1 shown), on, spin
  function plant(x, y, s, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 320, 0.35);
    rr(-150, -18, 300, 18, 5, '#3a3f5c');
    rr(-140, -180, 230, 164, 16, '#d3d8e6');
    rr(-140, -70, 230, 54, 0, '#bcc3d6');
    // louvers
    for (let i = 0; i < 6; i++) rr(-124 + i * 18, -168, 10, 26, 3, '#a8b0c6');
    // window bay with the core
    rr(-118, -138, 180, 92, 12, '#1b2038');
    if (o.core) { ctx.save(); roundRect(ctx, -118, -138, 180, 92, 12); ctx.clip(); core(-28, -92 + (1 - o.core) * -140, 0.95, { on: o.on, spin: o.spin }); ctx.restore(); }
    ctx.strokeStyle = '#8f98b4'; ctx.lineWidth = 4; roundRect(ctx, -118, -138, 180, 92, 12); ctx.stroke();
    // exhaust stack
    rr(96, -300, 46, 284, 6, '#9aa1b8');
    rr(90, -308, 58, 14, 4, '#7d8399');
    // status light
    const blink = o.on ? (0.5 + 0.5 * Math.sin(t * 6)) : 0;
    circ(70, -164, 8, o.on ? ACC : '#555c78'); if (o.on) K.glow(ctx, 70, -164, 26, ACC, 0.5 * blink);
    // exhaust puffs + shimmer
    if (o.on) {
      for (let i = 0; i < 5; i++) {
        const u = (t * 0.55 + i / 5) % 1;
        ctx.globalAlpha = 0.32 * (1 - u) * o.on;
        circ(119 + Math.sin(u * 6 + i) * 12, -318 - u * 150, 14 + u * 30, '#dfe3f0');
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // power line with travelling pulses along points
  function cable(pts, on, k = 0) {
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#2b3152'; ctx.lineWidth = 9; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
    if (on > 0) {
      ctx.strokeStyle = rgba(ACC, 0.35 * on); ctx.lineWidth = 4; ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const u = (t * 0.7 + i / 5 + k) % 1, p = K.pathPoint(pts, u);
        K.glow(ctx, p[0], p[1], 22, ACC, 0.6 * on); circ(p[0], p[1], 6, ACC);
      }
    }
    ctx.restore();
  }

  function pill(x, yBottom, pop, text, o = {}) {
    if (pop <= 0) return;
    K.drawLabel(ctx, x, yBottom, pop, Object.assign({ text, size: o.size || 30 }, o));
  }

  // white quote card (text only). words shown = n (whole words), attribution under
  function quoteCard(x0, y0, w, text, n, by, pop, size = 42) {
    if (pop <= 0) return;
    const lines = H.wrap(ctx, text, 'display', size, w - 90);
    const lh = size * 1.2, hgt = 70 + lines.length * lh + 64;
    ctx.save();
    ctx.translate(x0 + w / 2, y0 + hgt / 2); const sc = 0.85 + 0.15 * Math.min(1, pop); ctx.scale(sc, sc); ctx.translate(-(x0 + w / 2), -(y0 + hgt / 2));
    ctx.globalAlpha = clamp(pop * 1.5);
    rr(x0, y0, w, hgt, 26, '#f4f6fb');
    rr(x0, y0, 12, hgt, 6, ACC);
    ctx.font = H.font('display', 90); ctx.fillStyle = ACC; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('“', x0 + 30, y0 + 86);
    ctx.font = H.font('display', size); ctx.fillStyle = '#141829';
    let used = 0;
    lines.forEach((ln, i) => {
      const ws = ln.split(' '), show = ws.slice(0, clamp(n - used, 0, ws.length)); used += ws.length;
      if (show.length) ctx.fillText(show.join(' '), x0 + 46, y0 + 62 + (i + 1) * lh - size * 0.2);
    });
    ctx.font = H.font('ui', 26); ctx.fillStyle = '#4a5478';
    ctx.fillText('— ' + by, x0 + 46, y0 + hgt - 30);
    ctx.restore();
    return hgt;
  }

  // wall calendar, anchor top-centre, 190x200. year text; flip 0..1 = page lifting away to reveal next
  function calendar(x, y, s, cur, next, flip, hot) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const page = (txt, hl) => {
      rr(-95, 0, 190, 200, 14, '#f4f6fb');
      rr(-95, 0, 190, 50, 14, hl ? ACC : '#e0675a'); rr(-95, 30, 190, 20, 0, hl ? ACC : '#e0675a');
      ctx.font = H.font('display', 60); ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(txt, 0, 128);
      ctx.font = H.font('ui', 20); ctx.fillStyle = hl ? '#141829' : '#ffffff'; ctx.fillText('YEAR', 0, 26);
    };
    if (flip > 0 && next != null) page(next, hot);
    if (flip < 1) {
      ctx.save();
      const k = ease(clamp(flip));
      ctx.translate(0, -k * 40); ctx.scale(1, 1 - k); ctx.rotate(-0.25 * k);
      ctx.globalAlpha = 1 - k * 0.6;
      page(cur, false);
      ctx.restore();
    }
    for (const rx of [-50, 50]) { rr(rx - 6, -14, 12, 28, 6, '#9aa3bf'); }
    ctx.restore();
  }

  // ======================================================================= modes
  ctx.save();
  if (mode === 'hook') {
    // core already in flight at frame 0; lands ~0.9 s, plant on ~1.3 s, DC lit ~2 s
    const land = 1.0, on = clamp((t - 1.25) / 0.5), dcOn = clamp((t - 1.7) / 0.6);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 730 }, { t: D, zoom: 1.05, x: 540, y: 760 }]);
    K.cameraShake(ctx, t, land, 0.35, 9);
    skyAndField(780, false);
    K.drawDataCenter(ctx, 800, 790, 0.72, { t, activity: 0.15 + 0.85 * dcOn, label: '' });
    if (dcOn > 0) K.glow(ctx, 800, 720, 200, ACC, 0.25 * dcOn);
    // gantry
    const BY = 500;
    rr(150, BY, 14, GY - BY, 4, '#4b5378'); rr(842, BY, 14, GY - BY, 4, '#4b5378');
    rr(130, BY - 22, 750, 26, 8, '#5d6690');
    for (let i = 0; i < 14; i++) rr(150 + i * 52, BY - 16, 30, 12, 3, '#4b5378');
    jet(300, GY, 0.78, { missing: 1, dim: 0.05 });
    plant(690, GY, 0.95, { core: t >= land ? 1 : 0, on, spin: t * 18 * on });
    cable([[800, 720], [760, 760], [736, GY - 260]], dcOn, 0.1);
    // trolley + hook + core path: from above the jet (x 210) to above the plant (x 663)
    const u = ease(clamp((t + 0.55) / (land + 0.55)));
    const tx = lerp(250, 663, u);
    const hangY = t < land ? lerp(640, 820, clamp((t - 0.5) / 0.5)) - Math.sin(u * Math.PI) * 25 : 820;
    const swing = t < land ? Math.sin(t * 5) * 0.05 * (1 - u) : Math.sin((t - land) * 9) * 0.04 * Math.exp(-(t - land) * 3);
    rr(tx - 40, BY - 8, 80, 30, 8, '#7d86ad');
    ctx.strokeStyle = '#c9d0ea'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(tx, BY + 20);
    const hx = tx + Math.sin(swing) * (hangY - BY), hy = hangY;
    ctx.lineTo(hx, hy - 40); ctx.stroke();
    if (t < land) core(hx, hy, 0.9, { on: 0, spin: 0 });
    else { ctx.strokeStyle = '#c9d0ea'; ctx.beginPath(); ctx.moveTo(hx, hy - 40); ctx.lineTo(hx, Math.min(hy - 40, GY - 230)); ctx.stroke(); }
    if (t >= land && t < land + 0.5) { const k = (t - land) / 0.5; ctx.globalAlpha = 1 - k; ctx.strokeStyle = ACC; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(663, GY - 130, 60 + k * 120, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1; }
    pill(487, 650, K.popIn(t, 1.9, 0.45), P.pill || 'JET MAKER → POWER PLANTS', { accent: true, size: 32 });
  }

  else if (mode === 'factory') {
    const jetAt = at(P.jetCue, D * 0.25), dateAt = at(P.dateCue, D * 0.45), facAt = at(P.factoryCue, D * 0.6),
      turbAt = at(P.turbCue, D * 0.78), dcAt = at(P.dcCue, D * 0.88);
    const move = ease(clamp((t - (dateAt - 0.4)) / 1.2));
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.04, x: 500, y: 760 }]);
    skyAndField(800, false);
    // data center far right
    const dcOn = clamp((t - dcAt) / 0.6);
    const dcPop = K.popIn(t, turbAt + 0.2, 0.5);
    if (dcPop > 0) { ctx.save(); ctx.translate(820, 800); ctx.scale(dcPop, dcPop); K.drawDataCenter(ctx, 0, 0, 0.55, { t, activity: 0.1 + 0.9 * dcOn, label: '' }); ctx.restore(); if (dcOn > 0) K.glow(ctx, 820, 750, 150, ACC, 0.25 * dcOn); }
    // factory rises
    const rise = H.easeOutBack ? H.easeOutBack(clamp((t - (facAt - 0.6)) / 0.9)) : ease(clamp((t - (facAt - 0.6)) / 0.9));
    if (t > facAt - 0.6) {
      ctx.save(); ctx.translate(560, GY + (1 - clamp(rise, 0, 1.2)) * 320);
      ctx.beginPath(); ctx.rect(-300, -400, 600, 400); ctx.clip();
      K.shadow(ctx, 0, 0, 460, 0.35);
      rr(-210, -240, 420, 240, 8, '#56608f'); rr(-210, -60, 420, 60, 0, '#4a5380');
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-210 + i * 105, -240); ctx.lineTo(-210 + i * 105, -300); ctx.lineTo(-105 + i * 105, -240); ctx.closePath(); ctx.fillStyle = '#6a74a6'; ctx.fill(); rr(-206 + i * 105, -292, 8, 50, 2, rgba('#ffd98a', 0.75)); }
      // door
      const open = ease(clamp((t - (turbAt - 0.5)) / 0.8));
      rr(-90, -170, 180, 170, 6, '#1a1e36');
      ctx.fillStyle = 'rgba(255,217,138,0.45)'; ctx.fillRect(-90, -170, 180, 170);
      rr(-90, -170, 180, 170 * (1 - open) + 4, 6, '#7f89b8');
      for (let i = 0; i < 8; i++) if ((i + 1) * 21 < 170 * (1 - open)) rr(-90, -170 + i * 21 + 16, 180, 3, 0, '#6a74a6');
      ctx.restore();
    }
    // turbines rolling out to the right towards the data center
    for (let i = 0; i < 3; i++) {
      const k = ease(clamp((t - turbAt - i * 0.7) / 1.6));
      if (k <= 0) continue;
      const x = lerp(560, 690 + i * 85, k);
      ctx.save(); ctx.globalAlpha = clamp(k * 3); plant(x, GY + 6 + i * 4, 0.38, { core: 1, on: dcOn, spin: t * 14 }); ctx.restore();
    }
    if (dcOn > 0) cable([[700, GY - 110], [760, 860], [800, 790]], dcOn, 0.3);
    // the jet: centre stage, then rolls back to the left and shrinks
    const jx = lerp(487, 175, move), jy = lerp(GY, 900, move), js = lerp(1.18, 0.5, move);
    const glint = clamp(1 - Math.abs(t - jetAt - 0.6) / 0.6);
    jet(jx, jy, js, { dim: 0.35 * move });
    if (glint > 0) { const gx = jx + (lerp(-250, 280, clamp((t - jetAt) / 1.2))) * js; K.glow(ctx, gx, jy - 160 * js, 70 * js, '#ffffff', 0.5 * glint); }
    // worker pointing at the factory
    const wk = K.popIn(t, facAt + 0.3, 0.5);
    if (wk > 0) K.drawPerson(ctx, lerp(300, 330, wk), GY + 30, 1.05, { t, pose: 'point', mood: 'happy', shirt: 2, hairStyle: 'short', seed: 4 });
    // pills
    const jetOut = clamp((t - (dateAt - 0.3)) / 0.3);
    if (jetOut < 1) { ctx.save(); ctx.globalAlpha = 1 - jetOut; pill(487, 600, K.popIn(t, jetAt, 0.45), P.jetName || 'A NEW JET', { dot: true }); ctx.restore(); }
    pill(487, 570, K.popIn(t, dateAt, 0.45), P.date || 'THIS MONTH', { accent: true, size: 32 });
    pill(540, 645, K.popIn(t, facAt, 0.45), P.sign || 'NEW FACTORY', { size: 28, dot: true });
    pill(540, 720, K.popIn(t, turbAt, 0.45), P.turbLabel || 'GAS TURBINES FOR AI DATA CENTERS', { size: 28, accent: true });
  }

  else if (mode === 'power') {
    const mwAt = at(P.mwCue, D * 0.25), sameAt = at(P.sameCue, D * 0.5), moneyAt = at(P.moneyCue, D * 0.78);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.04, x: 470, y: 760 }]);
    skyAndField(790, false);
    K.drawDataCenter(ctx, 860, 790, 0.55, { t, activity: 0.95, label: '' });
    cable([[880, 730], [830, 760], [760, 640]], 1, 0.2);
    plant(620, GY, 1.45, { core: 1, on: 1, spin: t * 16 });
    // gauge top right
    const gp = K.popIn(t, Math.max(0.2, mwAt - 1.4), 0.5), gOut = clamp((t - (moneyAt - 0.4)) / 0.35);
    if (gp > 0 && gOut < 1) {
      ctx.save(); ctx.globalAlpha = 1 - gOut; ctx.translate(680, 610); ctx.scale(gp, gp);
      rr(-170, -90, 340, 170, 24, 'rgba(10,12,24,0.88)');
      ctx.strokeStyle = rgba(ACC, 0.6); ctx.lineWidth = 3; roundRect(ctx, -170, -90, 340, 170, 24); ctx.stroke();
      const k = ease(clamp((t - (mwAt - 0.6)) / 1.0));
      const mw = Number(P.mw || 50);
      ctx.font = H.font('display', 84); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(String(Math.round(mw * k)), -40, 30);
      ctx.font = H.font('display', 44); ctx.fillStyle = '#ffffff'; ctx.fillText(P.unit || 'MW', 85, 30);
      ctx.font = H.font('ui', 24); ctx.fillStyle = '#c9d0ea'; ctx.fillText(P.name || 'EACH UNIT', 0, -52);
      rr(-140, 50, 280, 10, 5, '#2b3152'); rr(-140, 50, 280 * k, 10, 5, ACC);
      ctx.restore();
    }
    // the jet appears on the left with its engine lit, dashed link to the plant core
    const jp = ease(clamp((t - (sameAt - 0.5)) / 0.8));
    if (jp > 0) {
      jet(lerp(-140, 230, jp), 800, 0.52, { glow: 1, glowA: clamp((t - sameAt) / 0.4) });
      const lk = clamp((t - sameAt - 0.2) / 0.7);
      if (lk > 0) {
        const pts = K.bezier(230 - 120 * 0.52 + 26, 800 - 106 * 0.52 + 6, 330, 700, 450, 760, 545, 1010 - 0.85 * 92 * 1.45 + 6, 30);
        ctx.save(); ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = ACC; ctx.lineWidth = 5; K.pathDraw(ctx, pts, lk); ctx.restore();
        pill(360, 680, K.popIn(t, sameAt + 0.3, 0.45), P.same || 'SAME TECH, COMPANY SAYS', { accent: true, size: 28 });
      }
    }
    // coins arc from the plant to the jet
    if (t > moneyAt - 0.2) {
      for (let i = 0; i < 7; i++) {
        const u = clamp((t - moneyAt - i * 0.22) / 1.1);
        if (u <= 0 || u >= 1) continue;
        const x = lerp(560, 260, u), y = lerp(760, 720, u) - Math.sin(u * Math.PI) * 170;
        K.drawCoin(ctx, x, y + 32, 0.75, { spin: t * 6 + i });
      }
      const pile = clamp((t - moneyAt - 1.0) / 1.5);
      for (let i = 0; i < Math.floor(pile * 5); i++) K.drawCoin(ctx, 170 + i * 30, 900 - (i % 2) * 14, 0.55, { spin: 0.4 * i });
      pill(487, 600, K.popIn(t, moneyAt + 0.1, 0.45), P.money || 'POWER MONEY FUNDS THE JET', { size: 27, dot: true });
    }
  }

  else if (mode === 'deal') {
    const countAt = at(P.countCue, D * 0.2), moneyAt = at(P.moneyCue, D * 0.35), dateAt = at(P.dateCue, D * 0.5),
      tearAt = at(P.tearCue, D * 0.6), quoteAt = at(P.quoteCue, D * 0.75);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 730 }, { t: tearAt - 0.1, zoom: 1.05, x: 487, y: 720 }, { t: D, zoom: 1.0, x: 487, y: 740 }]);
    K.cameraShake(ctx, t, tearAt, 0.45, 10);
    skyAndField(800, false);
    K.drawDataCenter(ctx, 200, 800, 0.5, { t, activity: 0.7, label: '' });
    K.drawDataCenter(ctx, 830, 800, 0.5, { t: t + 2, activity: 0.7, label: '' });
    // contract
    const X0 = 237, Y0 = 500, W = 500, HH = 510;
    const tear = clamp((t - tearAt) / 0.9), tk = ease(tear);
    const drawDoc = () => {
      rr(X0, Y0, W, HH, 18, '#f4f6fb');
      ctx.font = H.font('display', 38); ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(P.title || 'TURBINE ORDER', X0 + W / 2, Y0 + 62);
      rr(X0 + 40, Y0 + 80, W - 80, 4, 2, ACC);
      ctx.font = H.font('ui', 26); ctx.fillStyle = '#3b4672'; ctx.textAlign = 'left';
      ctx.fillText(P.partyA || 'SELLER: JET MAKER', X0 + 40, Y0 + 124);
      ctx.fillText(P.partyB || 'BUYER: DATA CENTER CO.', X0 + 40, Y0 + 160);
      // turbine icons grid
      const N = Number(P.count || 10), shown = Math.floor(clamp((t - countAt + 0.1) / 1.4) * N);
      for (let i = 0; i < N; i++) {
        const cx = X0 + 58 + (i % 10) * 42, cy = Y0 + 200 + Math.floor(i / 10) * 46;
        if (i < shown) {
          rr(cx - 15, cy, 30, 22, 6, '#8f98b4'); rr(cx + 6, cy - 12, 8, 14, 2, '#7d8399');
        } else { ctx.strokeStyle = '#d6dbe8'; ctx.lineWidth = 2; roundRect(ctx, cx - 15, cy, 30, 22, 6); ctx.stroke(); }
      }
      ctx.font = H.font('display', 34); ctx.fillStyle = '#141829'; ctx.textAlign = 'right';
      if (shown > 0) ctx.fillText(`× ${shown}`, X0 + W - 40, Y0 + 344);
      // amount
      const mp = K.popIn(t, moneyAt, 0.4);
      if (mp > 0) {
        ctx.save(); ctx.translate(X0 + W / 2, Y0 + 410); ctx.scale(mp, mp);
        ctx.font = H.font('display', 60); ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.fillText(P.amount || '$1 BILLION', 0, 18);
        ctx.restore();
      }
      // signatures
      ctx.strokeStyle = '#3b4672'; ctx.lineWidth = 3;
      for (const sx of [X0 + 60, X0 + W / 2 + 30]) {
        ctx.beginPath(); ctx.moveTo(sx, Y0 + 480); for (let k = 0; k < 8; k++) ctx.lineTo(sx + k * 22, Y0 + 470 - 12 * Math.sin(k * 1.7)); ctx.stroke();
        rr(sx, Y0 + 490, 180, 3, 1, '#b8bfd2');
      }
    };
    // jagged tear line down the middle
    const tearPts = []; for (let i = 0; i <= 12; i++) tearPts.push([X0 + W / 2 + (i % 2 ? 16 : -16) * (i % 3 ? 1 : 0.4), Y0 - 10 + i * (HH + 20) / 12]);
    const half = (side) => {
      ctx.save();
      const px = X0 + W / 2, py = Y0 + HH;
      ctx.translate(px + side * tk * 70, py + tk * 40); ctx.rotate(side * 0.12 * tk); ctx.translate(-px, -py);
      ctx.beginPath();
      if (side < 0) { ctx.moveTo(X0 - 20, Y0 - 20); tearPts.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(X0 - 20, Y0 + HH + 20); }
      else { ctx.moveTo(X0 + W + 20, Y0 - 20); tearPts.forEach(p => ctx.lineTo(p[0], p[1])); ctx.lineTo(X0 + W + 20, Y0 + HH + 20); }
      ctx.closePath(); ctx.clip();
      ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 18;
      drawDoc();
      ctx.restore();
    };
    if (t < tearAt) { const shake = t > tearAt - 0.5 ? Math.sin(t * 60) * 3 * (1 - (tearAt - t) / 0.5) : 0; ctx.save(); ctx.translate(shake, 0); drawDoc(); ctx.restore(); }
    else { half(-1); half(1); }
    if (t >= tearAt && t < tearAt + 0.6) { const k = (t - tearAt) / 0.6; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; ctx.globalAlpha = 1 - k; circ(487 + Math.cos(a) * 140 * k, 760 + Math.sin(a) * 140 * k, 7, ACC); } ctx.globalAlpha = 1; }
    pill(487, 565, K.popIn(t, dateAt, 0.45), P.date || 'BUYER BACKS OUT', { accent: true, size: 30 });
    // quote panel
    const qp = K.popIn(t, quoteAt - 0.2, 0.5);
    if (qp > 0) {
      const q = P.quote || 'Quote goes here.';
      quoteCard(160, 790, 660, q, 99, P.by || 'Source, Date', qp, 50);
    }
    if (t >= tearAt + 0.4 && qp <= 0) pill(487, 1000, K.popIn(t, tearAt + 0.4, 0.4), P.torn || 'DEAL OFF', { size: 30, dot: true });
  }

  else if (mode === 'jet') {
    const orderAt = at(P.orderCue, D * 0.18), quoteAt = at(P.quoteCue, D * 0.6), flipAt = at(P.flipCue, D * 0.92);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.05, x: 487, y: 760 }]);
    // hangar interior at night
    const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#151a36'); g.addColorStop(0.5, '#1f2548'); g.addColorStop(1, '#0a0c18');
    ctx.fillStyle = g; ctx.fillRect(-300, -300, 1680, 2520);
    // corrugated wall + roof trusses
    for (let i = 0; i < 30; i++) rr(-60 + i * 40, 380, 16, 520, 4, 'rgba(255,255,255,0.035)');
    ctx.strokeStyle = 'rgba(160,175,230,0.16)'; ctx.lineWidth = 6;
    for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-40 + i * 220, 380); ctx.lineTo(70 + i * 220, 300); ctx.lineTo(180 + i * 220, 380); ctx.stroke(); }
    rr(-300, 372, 1680, 14, 0, '#2e355e');
    // floor
    const fg = ctx.createLinearGradient(0, 900, 0, 1200); fg.addColorStop(0, '#2a3054'); fg.addColorStop(1, '#0e1124');
    ctx.fillStyle = fg; ctx.fillRect(-300, 900, 1680, 1100);
    for (let i = 0; i < 8; i++) { ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(487 + (i - 3.5) * 60, 900); ctx.lineTo(487 + (i - 3.5) * 260, 1300); ctx.stroke(); }
    // hanging lamps
    for (const lx of [250, 720]) { ctx.strokeStyle = '#3b4370'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx, 386); ctx.lineTo(lx, 430); ctx.stroke(); ctx.beginPath(); ctx.moveTo(lx - 34, 452); ctx.lineTo(lx + 34, 452); ctx.lineTo(lx + 14, 430); ctx.lineTo(lx - 14, 430); ctx.closePath(); ctx.fillStyle = '#4b5378'; ctx.fill(); K.glow(ctx, lx, 470, 230, '#ffe6b0', 0.16); }
    // jet on stands
    const quoteUp = clamp((t - (quoteAt - 0.3)) / 0.5);
    for (const sx of [330, 590]) { rr(sx - 30, 880, 60, 132, 6, '#c9a64a'); rr(sx - 50, 1000, 100, 14, 5, '#9a7d33'); for (let k = 0; k < 3; k++) rr(sx - 30, 900 + k * 38, 60, 6, 2, '#1a1d2c'); }
    jet(470, 1010, 1.12, { missing: 0, dim: 0.25 * quoteUp });
    // calendar: flips year by year until "'29" lands, then tears to "20??" at flipAt
    const years = P.years || ['2026', '2027', '2028', '2029'];
    const flipTimes = years.slice(1).map((_, i) => lerp(1.2, Math.max(2.5, quoteAt + 2.2), (i + 1) / (years.length - 1)));
    let idx = 0; flipTimes.forEach(ft => { if (t >= ft + 0.5) idx++; });
    const cur = years[Math.min(idx, years.length - 1)];
    let next = null, fl = 0;
    if (idx < years.length - 1) { const ft = flipTimes[idx]; fl = clamp((t - ft) / 0.5); next = years[idx + 1]; }
    else { fl = clamp((t - (flipAt - 0.15)) / 0.55); next = '20??'; }
    calendar(780, 505, 0.72, cur, next, fl, next === '20??');
    if (t > flipAt + 0.3) K.glow(ctx, 780, 580, 130, ACC, 0.25);
    // order pill + 15 mini jets
    const op = K.popIn(t, orderAt - 0.15, 0.45);
    if (op > 0) {
      pill(395, 600, op, P.orderText || 'AIRLINE ORDER, IF CONDITIONS MET', { size: 26, dot: true });
      const n = Number(P.orderN || 10);
      for (let i = 0; i < n; i++) {
        const k = K.popIn(t, orderAt + i * 0.06, 0.3); if (k <= 0) continue;
        ctx.save(); ctx.translate(150 + (i % 8) * 56, 640 + Math.floor(i / 8) * 40); ctx.scale(k * 1.25, k * 1.25);
        ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, -2); ctx.lineTo(20, 0); ctx.lineTo(16, 2); ctx.closePath(); ctx.fillStyle = '#eef1f8'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(4, 0); ctx.lineTo(-10, 9); ctx.lineTo(-13, 9); ctx.lineTo(-8, 0); ctx.closePath(); ctx.fillStyle = '#aeb7cf'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(-10, -1); ctx.lineTo(-15, -9); ctx.lineTo(-17, -9); ctx.lineTo(-16, -1); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    }
    // quote card: words appear as they are spoken
    const quote = P.quote || 'Quote goes here, word by word.';
    const qStart = info.words.findIndex(w => w.s >= quoteAt + 0.3 && /it/i.test(w.w));
    let nShown = 0;
    if (qStart >= 0) for (let i = qStart; i < info.words.length; i++) if (info.words[i].s <= t + 0.05) nShown = i - qStart + 1;
    if (quoteUp > 0) {
      // podcast mic glyph on the card's top right
      quoteCard(120, 690, 740, quote, nShown, P.by || 'Source, Date', quoteUp, 44);
      ctx.save(); ctx.globalAlpha = quoteUp; ctx.translate(810, 740);
      rr(-14, -34, 28, 48, 14, '#3b4672'); ctx.strokeStyle = '#3b4672'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, 22, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 22); ctx.lineTo(0, 34); ctx.stroke();
      ctx.restore();
    }
  }

  else if (mode === 'caveat') {
    const mAt = at(P.mileCue, D * 0.2), rAt = at(P.replyCue, D * 0.48), oAt = at(P.officialCue, D * 0.68);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.04, x: 487, y: 750 }]);
    skyAndField(820, true);
    const CX = 487, CY = 745, L = 270;
    const ang = 0.12 * Math.cos(t * 1.6) * Math.exp(-t * 0.35) + 0.01 * Math.sin(t * 2.3);
    rr(CX - 12, CY, 24, GY - CY, 8, '#4b5378'); rr(CX - 120, GY - 16, 240, 26, 12, '#5d6690');
    const lx = CX - Math.cos(ang) * L, ly = CY + Math.sin(ang) * L, rx = CX + Math.cos(ang) * L, ry = CY - Math.sin(ang) * L;
    ctx.strokeStyle = '#c9d0ea'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke();
    circ(CX, CY, 20, ACC);
    const pan = (x, y) => {
      ctx.strokeStyle = 'rgba(201,208,234,0.8)'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 120, y + 170); ctx.moveTo(x, y); ctx.lineTo(x + 120, y + 170); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(x, y + 176, 140, 22, 0, 0, TAU); ctx.fillStyle = '#8d97c2'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(x, y + 170, 140, 18, 0, 0, TAU); ctx.fillStyle = '#b6bfe0'; ctx.fill();
    };
    pan(lx, ly); jet(lx + 10, ly + 172, 0.4, {});
    pan(rx, ry); plant(rx - 10, ry + 172, 0.42, { core: 1, on: 1, spin: t * 12 });
    ctx.font = H.font('ui', 26);
    pill(lx, ly + 250, 1, P.left || 'THE JET', { size: 26 });
    pill(rx, ry + 250, 1, P.right || 'POWER PLANTS', { size: 26 });
    const pills = P.pills || ['DETAILS: NOT SAID', 'COMPANY: NO REPLY', 'OFFICIAL TARGET: UNCHANGED'];
    pill(487, 545, K.popIn(t, mAt - 0.1, 0.45), pills[0], { size: 28, dot: true });
    pill(487, 615, K.popIn(t, rAt - 0.1, 0.45), pills[1], { size: 28, dot: true });
    pill(487, 688, K.popIn(t, oAt - 0.1, 0.45), pills[2], { size: 30, accent: true });
  }
  ctx.restore();
}
