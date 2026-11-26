// Scene "orbit-datacenters" (full frame; 2026-11-26). A regulator clears a giant constellation of data-center satellites: a night sky
// over a cartoon Earth limb filling with small server-satellites on orbital shells. Generic shapes only (no logos,
// no real map, no real people; companies are text pills). Modes:
//   hook    cold open: an upper stage is already releasing server-satellites into a sky full of streaks; a big
//           "UP TO 1,000,000" count runs up and an APPROVED stamp lands (peak < 2 s)
//   plan    an order document gets an APPROVED stamp (bureau pill); a big server-satellite unfolds its wings, company +
//           name pills; "data center" pill; two neighbours slide in and light links connect them
//   clock   deadline strip: years light up on cues, the sky fills (1 -> many -> swarm) and the big count steps up;
//           "void if late" cross stamp
//   pitch   split: ground data center with a straining gauge + two chips vs a satellite in near-constant sun venting
//           heat into space; title pill
//   scope   night hill: a cartoon astronomer by a telescope; circular telescope view where satellite streaks cross and
//           an infrared haze rises; petition document + objector pills
//   ruling  three petition documents get DENIED stamps; scope pill; then the view cuts to an altitude ladder: a
//           dashed altitude `line` (e.g. "X km"), satellites below fly, those above wait behind a lock with "debris plan first"
// Fits: satellite constellations, space data centers, regulators clearing big projects, astronomers vs satellites.
// params: mode; hook: prefix, count, unit, stamp; plan: doc, bureau, stamp, company, name, dc, link; clock: title,
//   steps [{year, count, label, cue}] (3), unit, stamp; pitch: title, leftTitle, rightTitle, chipA, chipB, sunText, heatText;
//   scope: shared, view, doc, who [3], glow; ruling: who [3], doc, stamp, scope, line, below, above.
//   Cues (approveCue, nameCue, dcCue, linkCue, voidCue, pitchCue, powerCue, coolCue, sunCue, heatCue, sharedCue, blockCue,
//   glowCue, othersCue, denyCue, scopeCue, lineCue, planCue) are narration words (fractions of the duration without them).
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, mixHex } = H;
  const TAU = Math.PI * 2;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const fract = (x) => x - Math.floor(x);
  const mode = P.mode || 'hook';
  const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // ------------------------------------------------------------------ shared drawing
  const EC = { x: 487, y: 2380, r: 1400 };                       // Earth: limb top at y 980
  const limbY = (x) => EC.y - Math.sqrt(Math.max(0, EC.r * EC.r - (x - EC.x) * (x - EC.x)));

  function sky(dim = 0) {
    const g = ctx.createLinearGradient(0, 0, 0, 1920);
    g.addColorStop(0, '#050816'); g.addColorStop(0.45, '#0b1335'); g.addColorStop(0.55, '#14205a'); g.addColorStop(1, '#050816');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    for (let i = 0; i < 90; i++) {
      const sx = H.hash(i, 11) * 1080, sy = H.hash(i, 12) * 1150, big = H.hash(i, 13) > 0.85;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.8 + H.hash(i, 14) * 1.6) + i));
      ctx.globalAlpha = (big ? 0.9 : 0.55) * tw * (1 - dim); ctx.fillStyle = '#ffffff';
      if (big) { ctx.beginPath(); ctx.arc(sx, sy, 2.6, 0, TAU); ctx.fill(); ctx.fillRect(sx - 7, sy - 0.8, 14, 1.6); ctx.fillRect(sx - 0.8, sy - 7, 1.6, 14); }
      else ctx.fillRect(sx, sy, 2.4, 2.4);
    }
    ctx.globalAlpha = 1;
  }

  function earth() {
    const { x, y, r } = EC;
    K.glow(ctx, x, y - r + 40, 520, '#5fa8ff', 0.22);
    ctx.save();
    ctx.beginPath(); ctx.arc(x, y, r + 26, 0, TAU); ctx.fillStyle = 'rgba(110,170,255,0.18)'; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r + 10, 0, TAU); ctx.fillStyle = 'rgba(140,195,255,0.28)'; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.clip();
    const g = ctx.createLinearGradient(0, y - r, 0, y - r + 700);
    g.addColorStop(0, '#3a7fe0'); g.addColorStop(1, '#173a86');
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    const drift = (t * 6) % 1600;
    const blobs = [[-500, 60, 260, 70], [-120, 140, 200, 90], [260, 40, 300, 80], [700, 120, 240, 100], [1100, 50, 280, 75], [-900, 120, 220, 80]];
    for (const [bx, by, bw, bh] of blobs) {
      const px = ((bx + drift + 1600) % 3200) - 1100;
      ctx.beginPath(); ctx.ellipse(px, y - r + by + 30, bw, bh, 0.1, 0, TAU); ctx.fillStyle = '#3c9a6b'; ctx.fill();
      ctx.beginPath(); ctx.ellipse(px + bw * 0.25, y - r + by + 40, bw * 0.45, bh * 0.45, 0.1, 0, TAU); ctx.fillStyle = '#4fb07c'; ctx.fill();
    }
    for (let i = 0; i < 7; i++) {
      const cx = ((H.hash(i, 21) * 1400 + t * 14) % 1400) - 160, cy = y - r + 50 + H.hash(i, 22) * 260;
      ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.ellipse(cx, cy, 110 + H.hash(i, 23) * 80, 16, 0, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill();
    }
    ctx.globalAlpha = 1;
    const s = ctx.createLinearGradient(0, y - r, 0, y - r + 900); s.addColorStop(0, 'rgba(5,8,22,0)'); s.addColorStop(1, 'rgba(5,8,22,0.75)');
    ctx.fillStyle = s; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    ctx.restore();
  }

  // orbital shells: faint dashed arcs above the limb
  const SHELLS = [150, 300, 450];
  function shells(a = 1, hi = -1) {
    ctx.save(); ctx.setLineDash([10, 14]); ctx.lineDashOffset = -t * 20;
    SHELLS.forEach((d, k) => {
      ctx.strokeStyle = k === hi ? H.rgba(ACC, 0.55 * a) : `rgba(170,200,255,${0.18 * a})`; ctx.lineWidth = k === hi ? 4 : 2;
      ctx.beginPath(); ctx.arc(EC.x, EC.y, EC.r + d, -Math.PI / 2 - 0.42, -Math.PI / 2 + 0.42); ctx.stroke();
    });
    ctx.restore();
  }

  // a small server-satellite icon at (x, y)
  function mini(x, y, s, a = 1, col = '#dfe4f1', lit = true) {
    ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#2f5fd0'; ctx.fillRect(-46, -9, 30, 18); ctx.fillRect(16, -9, 30, 18);
    ctx.fillStyle = col; roundRect(ctx, -14, -14, 28, 28, 5); ctx.fill();
    if (lit) { ctx.fillStyle = ACC; ctx.fillRect(-8, -6, 16, 3); ctx.fillRect(-8, 2, 16, 3); }
    ctx.restore();
  }

  // a swarm of n satellites on the shells (streaks behind them); maxY limits how low they go
  function swarm(n, o = {}) {
    const a = o.alpha == null ? 1 : o.alpha;
    for (let i = 0; i < n; i++) {
      const k = i % 3, R = EC.r + SHELLS[k] + (H.hash(i, 5) - 0.5) * 70;
      const sp = [0.018, -0.014, 0.011][k] * (o.speed || 1);
      const u = fract(H.hash(i, 3) + t * sp);
      const ang = -Math.PI / 2 + (u - 0.5) * 0.95;
      const x = EC.x + R * Math.cos(ang), y = EC.y + R * Math.sin(ang);
      if (o.minY != null && y < o.minY) continue;
      if (o.maxY != null && y > o.maxY) continue;
      const fadeEdge = smooth(Math.min(u, 1 - u) / 0.06);
      const back = Math.sign(sp) * 0.012;
      const tx = EC.x + R * Math.cos(ang - back), ty = EC.y + R * Math.sin(ang - back);
      ctx.save(); ctx.globalAlpha = 0.35 * a * fadeEdge; ctx.strokeStyle = '#cfe0ff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke(); ctx.restore();
      mini(x, y, o.scale || (0.28 + 0.12 * H.hash(i, 6)), a * fadeEdge);
    }
  }

  // big data-center satellite centred at (x, y): wings 0..1, rack lights, sun 0..1, heat 0..1
  function bigSat(x, y, s, o = {}) {
    const wings = o.wings == null ? 1 : o.wings, sun = o.sun || 0;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.tilt || 0); ctx.scale(s, s);
    for (const side of [-1, 1]) {
      const w = 170 * wings;
      if (w < 2) continue;
      ctx.fillStyle = '#8a93a8'; ctx.fillRect(side > 0 ? 58 : -58 - 22, -5, 22, 10);
      const x0 = side > 0 ? 80 : -80 - w;
      roundRect(ctx, x0, -40, w, 80, 6); ctx.fillStyle = mixHex('#24408f', '#2f5fd0', sun * 0.6); ctx.fill();
      ctx.strokeStyle = 'rgba(200,220,255,0.55)'; ctx.lineWidth = 2; roundRect(ctx, x0, -40, w, 80, 6); ctx.stroke();
      const cols = Math.max(1, Math.round(5 * wings));
      for (let c = 1; c < cols; c++) { ctx.beginPath(); ctx.moveTo(x0 + (w * c) / cols, -40); ctx.lineTo(x0 + (w * c) / cols, 40); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0 + w, 0); ctx.stroke();
      const gx = x0 + fract(t * 0.35 + (side > 0 ? 0.5 : 0)) * (w + 60) - 30;
      ctx.save(); roundRect(ctx, x0, -40, w, 80, 6); ctx.clip();
      ctx.fillStyle = `rgba(255,255,255,${0.14 + 0.25 * sun})`; ctx.beginPath(); ctx.moveTo(gx, -40); ctx.lineTo(gx + 26, -40); ctx.lineTo(gx + 6, 40); ctx.lineTo(gx - 20, 40); ctx.fill();
      if (sun > 0) { ctx.fillStyle = H.rgba(ACC, 0.22 * sun); ctx.fillRect(x0, -40, w, 80); }
      ctx.restore();
    }
    // radiator fin below (vents heat)
    ctx.fillStyle = '#8a93a8'; ctx.fillRect(-4, 70, 8, 26);
    roundRect(ctx, -70, 94, 140, 26, 6); ctx.fillStyle = o.heat ? mixHex('#c9d3e6', '#ff9a3d', o.heat) : '#c9d3e6'; ctx.fill();
    // body: a server cabinet
    roundRect(ctx, -58, -76, 116, 150, 14); ctx.fillStyle = '#dfe4f1'; ctx.fill();
    roundRect(ctx, -44, -62, 88, 122, 8); ctx.fillStyle = '#121527'; ctx.fill();
    for (let r = 0; r < 5; r++) {
      const ry = -54 + r * 23;
      roundRect(ctx, -38, ry, 76, 16, 4); ctx.fillStyle = '#2a2f45'; ctx.fill();
      for (let l = 0; l < 3; l++) {
        const on = Math.sin(t * (3 + r) + l * 2 + r) > -0.2;
        ctx.fillStyle = on ? ACC : '#3b4260'; ctx.fillRect(-30 + l * 12, ry + 5, 7, 6);
      }
      ctx.fillStyle = '#4a5270'; ctx.fillRect(8, ry + 6, 24, 4);
    }
    ctx.fillStyle = '#8a93a8'; ctx.fillRect(-3, -102, 6, 28);
    ctx.beginPath(); ctx.ellipse(0, -104, 22, 9, 0, 0, Math.PI); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.restore();
  }

  function upperStage(x, y, s, ang, fire) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    if (fire > 0) {
      for (let i = 0; i < 3; i++) {
        const fl = 60 + 26 * Math.abs(Math.sin(t * 23 + i * 2));
        ctx.globalAlpha = fire * (0.9 - i * 0.25);
        ctx.beginPath(); ctx.moveTo(-24 + i * 6, 0); ctx.lineTo(0, fl * (1 + i * 0.5)); ctx.lineTo(24 - i * 6, 0); ctx.closePath();
        ctx.fillStyle = ['#fff1a8', '#ffb347', '#ff6b3d'][i]; ctx.fill();
      }
      ctx.globalAlpha = 1; K.glow(ctx, 0, 30, 110, '#ffb347', 0.5 * fire);
    }
    ctx.fillStyle = '#3b4260'; ctx.fillRect(-20, -14, 40, 14);
    roundRect(ctx, -34, -200, 68, 188, 20); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = '#d5dae8'; ctx.fillRect(10, -190, 22, 176);
    ctx.fillStyle = ACC; ctx.fillRect(-34, -70, 68, 12);
    // open nose: a bay with satellites
    roundRect(ctx, -30, -236, 60, 40, 8); ctx.fillStyle = '#121527'; ctx.fill();
    ctx.restore();
  }

  function bigText(text, x, y, size, color, kind = 'display', align = 'center') {
    ctx.save(); ctx.font = H.font(kind, size); ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = color;
    ctx.fillText(text, x, y); ctx.restore();
  }
  const pill = (x, y, p, text, accent = false, size = 30) => { if (p > 0) K.drawLabel(ctx, x, y, Math.min(1.06, p), { text, size, accent }); };

  function telescope(x, y, s, ang) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 110);
    ctx.strokeStyle = '#8a93a8'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, -120); ctx.lineTo(-50, 0); ctx.moveTo(0, -120); ctx.lineTo(50, 0); ctx.moveTo(0, -120); ctx.lineTo(0, 0); ctx.stroke();
    ctx.translate(0, -124); ctx.rotate(ang);
    roundRect(ctx, -40, -26, 190, 52, 14); ctx.fillStyle = '#e8ecf6'; ctx.fill();
    roundRect(ctx, 130, -32, 34, 64, 10); ctx.fillStyle = '#c9d3e6'; ctx.fill();
    ctx.fillStyle = ACC; ctx.fillRect(40, -26, 14, 52);
    roundRect(ctx, -62, -12, 26, 24, 6); ctx.fillStyle = '#3b4260'; ctx.fill();
    ctx.restore();
  }

  // ------------------------------------------------------------------ modes
  if (mode === 'hook') {
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.06, x: 487, y: 715 }]);
    sky(); earth(); shells(1);
    swarm(Math.round(70 + 60 * t), { speed: 2.2 });
    // upper stage drifting left, releasing satellites from its nose
    const rx = 790 - t * 18, ry = 690 + K.bob(t, 4, 0.5), ang = -1.35;
    const nose = { x: rx + Math.sin(ang) * -236 * 0.8 * -1, y: ry - Math.cos(ang) * 236 * 0.8 };
    for (let j = 0; j < 40; j++) {
      const born = j * 0.1 - 1.5; if (t < born) continue;
      const age = t - born, dir = Math.PI + (H.hash(j, 41) - 0.5) * 1.5;
      const dist = 60 + age * 150;
      const px = nose.x + Math.cos(dir) * dist, py = nose.y + Math.sin(dir) * dist * 0.55;
      const a = clamp(1 - (age - 2.2) / 0.8, 0, 1);
      if (a > 0 && px > 40) mini(px, py, 0.42, a);
    }
    upperStage(rx, ry, 0.8, ang, 1);
    // big count
    const cp = K.popIn(t, -0.45, 0.35);
    if (cp > 0) {
      ctx.save(); ctx.translate(487, 560); ctx.scale(Math.min(1.05, cp), Math.min(1.05, cp));
      roundRect(ctx, -330, -130, 660, 225, 30); ctx.fillStyle = 'rgba(6,10,28,0.82)'; ctx.fill();
      ctx.strokeStyle = H.rgba(ACC, 0.35); ctx.lineWidth = 3; ctx.stroke();
      bigText(P.prefix || 'UP TO', 0, -86, 32, '#dfe4f1', 'ui');
      K.glow(ctx, 0, -20, 220, ACC, 0.18);
      bigText(fmt(K.countUp(+(P.count || 1000000), t, -0.5, 1.5)), 0, 20, 118, ACC, 'display');
      bigText(P.unit || 'SATELLITES', 0, 72, 34, '#ffffff', 'bold');
      ctx.restore();
    }
    if (t > 0.55) K.drawStamp(ctx, 300, 880, 0.8, { kind: 'check', text: P.stamp || 'APPROVED', land: (t - 0.55) / 0.5 });
    ctx.restore();
    return;
  }

  if (mode === 'plan') {
    const tAp = at(P.approveCue, D * 0.3), tName = at(P.nameCue, D * 0.45), tDc = at(P.dcCue, D * 0.6), tLink = at(P.linkCue, D * 0.85);
    const move = K.phase(t, tAp + 0.9, tAp + 1.8, H.easeInOutCubic);  // the document slides aside, the satellite comes in
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 500, y: 700 }]);
    sky(); earth(); shells(0.8);
    swarm(18, { alpha: 0.6 });
    // the order document
    const dx = lerp(487, 255, move), dy = lerp(930, 940, move), ds = lerp(1.35, 0.85, move);
    K.drawDocument(ctx, dx, dy, ds, { lines: 6, title: P.doc || 'ORDER', seal: true });
    pill(Math.max(dx, 260), dy - 180 * ds - 34, K.popIn(t, 0.1, 0.4), P.bureau || 'Regulator', false, 26);
    if (t > tAp - 0.1) K.drawStamp(ctx, dx + 20 * ds, dy - 10 * ds, 0.62 * ds, { kind: 'check', text: P.stamp || 'APPROVED', land: (t - tAp + 0.1) / 0.5 });
    // the satellite
    if (move > 0) {
      const sx = lerp(1000, 590, move), sy = lerp(420, 690, move) + K.bob(t, 6, 0.35);
      // neighbours + light links
      const nb = K.phase(t, tLink - 0.6, tLink + 0.4, H.easeOutCubic);
      if (nb > 0) {
        const n1 = { x: lerp(1150, 830, nb), y: 560 }, n2 = { x: lerp(-100, 300, nb), y: 560 };
        for (const n of [n1, n2]) {
          bigSat(n.x, n.y + K.bob(t, 5, 0.4, n.x), 0.38, {});
          const lk = smooth((t - tLink) / 0.5);
          if (lk > 0) {
            ctx.save(); ctx.globalAlpha = lk; ctx.strokeStyle = H.rgba(ACC, 0.9); ctx.lineWidth = 6; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 80;
            ctx.beginPath(); ctx.moveTo(sx, sy - 40); ctx.lineTo(n.x, n.y); ctx.stroke(); ctx.restore();
            const u = fract(t * 0.9 + (n === n1 ? 0 : 0.5));
            K.glow(ctx, lerp(sx, n.x, u), lerp(sy - 40, n.y, u), 26, ACC, 0.8 * lk);
          }
        }
      }
      bigSat(sx, sy, 0.95, { wings: K.phase(t, tAp + 1.5, tAp + 2.4, H.easeOutBack) });
      pill(sx, sy - 150, K.popIn(t, tName - 0.15, 0.4), P.name || 'Project name', true, 36);
      pill(sx, sy - 210, K.popIn(t, tName + 0.25, 0.4), P.company || 'Company', false, 26);
      pill(sx, sy + 170, K.popIn(t, tDc - 0.1, 0.4) * K.fadeOut(t, tLink - 0.2, 0.3), P.dc || 'A data center', false, 30);
      pill(sx, sy + 170, K.popIn(t, tLink + 0.1, 0.4), P.link || 'Linked by light', true, 30);
    }
    ctx.restore();
    return;
  }

  if (mode === 'clock') {
    const steps = P.steps || [{ year: '2030', count: 1, label: 'first' }, { year: '2032', count: 1000, label: '1,000' }, { year: '2035', count: 10000, label: '10,000' }];
    const ts = steps.map((s, i) => at(s.cue, D * (0.15 + i * 0.22)));
    const tVoid = at(P.voidCue, D * 0.82);
    const lvl = ts.reduce((a, x) => a + (t >= x ? 1 : 0), 0);
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 715 }]);
    sky(); earth(); shells(1, lvl - 1);
    // sky fills step by step
    const fillN = lvl === 0 ? 0 : lvl === 1 ? 1 : lvl === 2 ? Math.round(lerp(1, 40, smooth((t - ts[1]) / 0.8))) : Math.round(lerp(40, 190, smooth((t - ts[2]) / 1.0)));
    if (fillN === 1) { const p = K.popIn(t, ts[0], 0.4); mini(700, 640 + K.bob(t, 4, 0.5), 0.8 * Math.min(1, p)); }
    else if (fillN > 1) swarm(fillN, { speed: 1.4, maxY: 1000 });
    pill(487, 470, K.popIn(t, 0.05, 0.4), P.title || 'Deadlines', false, 28);
    // big count
    const cur = lvl === 0 ? 0 : steps[lvl - 1].count, prev = lvl <= 1 ? 0 : steps[lvl - 2].count;
    const shown = lvl === 0 ? 0 : lerp(prev, cur, smooth((t - ts[lvl - 1]) / 0.7));
    ctx.save(); ctx.globalAlpha = smooth((t - ts[0] + 0.3) / 0.3);
    roundRect(ctx, 167, 515, 640, 155, 26); ctx.fillStyle = 'rgba(6,10,28,0.82)'; ctx.fill();
    K.glow(ctx, 487, 570, 200, ACC, 0.15);
    bigText(fmt(shown), 487, 610, 96, ACC, 'display');
    bigText(P.unit || 'IN ORBIT', 487, 652, 28, '#ffffff', 'bold');
    ctx.restore();
    // timeline strip
    const y0 = 800, xs = [200, 487, 775];
    ctx.save(); roundRect(ctx, 150, y0 - 70, 675, 180, 26); ctx.fillStyle = 'rgba(10,14,34,0.82)'; ctx.fill(); ctx.restore();
    ctx.strokeStyle = 'rgba(200,215,255,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(xs[0], y0); ctx.lineTo(xs[2], y0); ctx.stroke();
    const prog = lvl === 0 ? 0 : lvl === 1 ? 0 : lerp(xs[lvl - 2], xs[lvl - 1], smooth((t - ts[lvl - 1]) / 0.6)) - xs[0];
    ctx.strokeStyle = ACC; ctx.beginPath(); ctx.moveTo(xs[0], y0); ctx.lineTo(xs[0] + prog, y0); ctx.stroke();
    steps.forEach((s, i) => {
      const on = smooth((t - ts[i]) / 0.3), pop = K.popIn(t, ts[i] - 0.05, 0.4);
      ctx.beginPath(); ctx.arc(xs[i], y0, 16 + 6 * Math.min(1, pop), 0, TAU); ctx.fillStyle = on > 0 ? mixHex('#3b4260', ACC, on) : '#3b4260'; ctx.fill();
      bigText(s.year, xs[i], y0 - 30, 34, on > 0.5 ? '#ffffff' : '#9aa3bb', 'bold');
      ctx.save(); ctx.globalAlpha = 0.35 + 0.65 * on; bigText(s.label, xs[i], y0 + 64, 28, on > 0.5 ? ACC : '#9aa3bb', 'ui'); ctx.restore();
    });
    // clock ticking
    K.drawClock(ctx, 800, 520, 0.55, { t, speed: 6 });
    if (t > tVoid - 0.1) K.drawStamp(ctx, 487, 900, 0.7, { kind: 'cross', text: P.stamp || 'VOID IF LATE', land: (t - tVoid + 0.1) / 0.5 });
    ctx.restore();
    return;
  }

  if (mode === 'pitch') {
    const tPitch = at(P.pitchCue, 0.3), tPow = at(P.powerCue, D * 0.35), tCool = at(P.coolCue, D * 0.45), tSun = at(P.sunCue, D * 0.65), tHeat = at(P.heatCue, D * 0.82);
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 725 }]);
    const lg = ctx.createLinearGradient(0, 0, 0, 1920); lg.addColorStop(0, '#2a1f45'); lg.addColorStop(0.5, '#6b3d5e'); lg.addColorStop(0.56, '#2a2036'); lg.addColorStop(1, '#0d0a14');
    ctx.fillStyle = lg; ctx.fillRect(0, 0, 487, 1920);
    ctx.fillStyle = '#1e1a2c'; ctx.fillRect(0, 880, 487, 1040);
    ctx.save(); ctx.beginPath(); ctx.rect(487, 0, 593, 1920); ctx.clip(); sky(); ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(485, 520, 4, 520);
    pill(487, 470, K.popIn(t, tPitch - 0.1, 0.4), P.title || "The company's pitch", true, 30);
    bigText(P.leftTitle || 'ON THE GROUND', 300, 560, 28, '#dfe4f1', 'bold');
    bigText(P.rightTitle || 'IN ORBIT', 680, 560, 28, '#dfe4f1', 'bold');
    // ground: data center, pylon, straining gauge, heat haze
    const strain = smooth((t - tPow + 0.3) / 0.8);
    K.drawDataCenter(ctx, 300, 880, 0.82, { t, activity: 0.6 + 0.4 * strain });
    ctx.strokeStyle = '#8a93a8'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(130, 880); ctx.lineTo(148, 650); ctx.lineTo(166, 880); ctx.moveTo(134, 700); ctx.lineTo(162, 700); ctx.stroke();
    const gx = 300, gy = 690, needle = lerp(-2.4, -0.55, strain) + (strain > 0.9 ? Math.sin(t * 22) * 0.06 : 0);
    ctx.beginPath(); ctx.arc(gx, gy, 62, Math.PI, TAU); ctx.lineTo(gx + 62, gy + 8); ctx.lineTo(gx - 62, gy + 8); ctx.closePath(); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#4fb3a6'; ctx.beginPath(); ctx.arc(gx, gy, 46, Math.PI, Math.PI * 1.5); ctx.stroke();
    ctx.strokeStyle = '#ffcc33'; ctx.beginPath(); ctx.arc(gx, gy, 46, Math.PI * 1.5, Math.PI * 1.75); ctx.stroke();
    ctx.strokeStyle = '#ff6b5e'; ctx.beginPath(); ctx.arc(gx, gy, 46, Math.PI * 1.75, TAU); ctx.stroke();
    ctx.strokeStyle = '#161927'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + Math.cos(needle) * 42, gy + Math.sin(needle) * 42); ctx.stroke();
    if (strain > 0.9) { const wp = 0.6 + 0.4 * Math.abs(Math.sin(t * 5)); K.drawWarning(ctx, 400, 660, 0.36 * wp + 0.12, { pulse: wp }); }
    const cool = smooth((t - tCool + 0.2) / 0.6);
    if (cool > 0) for (let i = 0; i < 4; i++) {   // heat haze over the roof
      const ph = fract(t * 0.6 + i / 4);
      ctx.save(); ctx.globalAlpha = cool * (1 - ph) * 0.55; ctx.strokeStyle = '#ff9a3d'; ctx.lineWidth = 5;
      ctx.beginPath(); for (let k = 0; k <= 10; k++) { const xx = 210 + k * 18, yy = 790 - ph * 90 + Math.sin(k * 0.9 + t * 4) * 6; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); ctx.restore();
    }
    pill(215, 940, K.popIn(t, tPow - 0.1, 0.4), P.chipA || 'Power', false, 28);
    pill(385, 940, K.popIn(t, tCool - 0.1, 0.4), P.chipB || 'Cooling', false, 28);
    // orbit: sun, satellite, heat venting
    const sunK = smooth((t - tSun + 0.3) / 0.8);
    K.glow(ctx, 810, 640, 260, '#fff3b0', 0.25 + 0.45 * sunK);
    ctx.beginPath(); ctx.arc(810, 640, 40, 0, TAU); ctx.fillStyle = '#fff6c8'; ctx.fill();
    if (sunK > 0) {
      ctx.save(); ctx.globalAlpha = 0.5 * sunK; ctx.strokeStyle = '#fff3b0'; ctx.lineWidth = 5; ctx.setLineDash([16, 14]); ctx.lineDashOffset = -t * 60;
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(780 - i * 6, 670 + i * 16); ctx.lineTo(700 - i * 30, 730 + i * 22); ctx.stroke(); }
      ctx.restore();
    }
    const heat = smooth((t - tHeat + 0.2) / 0.6);
    const sx = 650, sy = 770 + K.bob(t, 6, 0.35);
    bigSat(sx, sy, 0.55, { sun: sunK, heat });
    if (heat > 0) for (let i = 0; i < 4; i++) {  // heat waves leaving the radiator downward/sideways into space
      const ph = fract(t * 0.7 + i / 4);
      ctx.save(); ctx.globalAlpha = heat * (1 - ph) * 0.7; ctx.strokeStyle = '#ff9a3d'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(sx, sy + 58, 30 + ph * 110, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); ctx.restore();
    }
    pill(680, 940, K.popIn(t, tSun - 0.1, 0.4) * K.fadeOut(t, tHeat - 0.2, 0.3), P.sunText || 'Near-constant sun', true, 28);
    pill(680, 940, K.popIn(t, tHeat + 0.05, 0.4), P.heatText || 'Heat vents to space', true, 28);
    ctx.restore();
    return;
  }

  if (mode === 'scope') {
    const tShared = at(P.sharedCue, 0.4), tBlock = at(P.blockCue, D * 0.35), tHeat = at(P.heatCue, D * 0.5), tGlow = at(P.glowCue, D * 0.62), tOthers = at(P.othersCue, D * 0.85);
    const who = P.who || ['Astronomers', 'Company A', 'Company B'];
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 487, y: 720 }]);
    const glowK = smooth((t - tHeat) / 1.6);
    sky(0.3 * glowK);
    // hill
    ctx.beginPath(); ctx.moveTo(0, 1000); ctx.quadraticCurveTo(300, 930, 620, 990); ctx.quadraticCurveTo(860, 1030, 1080, 990); ctx.lineTo(1080, 1920); ctx.lineTo(0, 1920); ctx.closePath();
    ctx.fillStyle = '#141a33'; ctx.fill();
    swarm(Math.round(lerp(20, 70, smooth((t - tBlock) / 2))), { alpha: 0.5, minY: 0, maxY: 900 });
    // astronomer + telescope
    telescope(330, 975, 0.95, -0.75);
    K.drawPerson(ctx, 190, 985, 1.15, { t, pose: t > tBlock && t < tBlock + 2.4 ? 'point' : 'stand', mood: t > tHeat ? 'worried' : 'neutral', look: 1, shirt: 3, hairStyle: 'bun', seed: 5, talk: t > tBlock && t < tGlow ? info.env * 0.6 : 0 });
    // telescope view
    const vp = K.popIn(t, 0.15, 0.5);
    if (vp > 0) {
      const ix = 640, iy = 700, ir = Math.max(12, 190 * Math.min(1.04, vp));
      ctx.save();
      ctx.strokeStyle = H.rgba(ACC, 0.5); ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
      ctx.beginPath(); ctx.moveTo(440, 760); ctx.lineTo(ix - ir * 0.9, iy + ir * 0.3); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(ix, iy, ir, 0, TAU); ctx.fillStyle = '#04060f'; ctx.fill();
      ctx.lineWidth = 10; ctx.strokeStyle = '#dfe4f1'; ctx.stroke();
      ctx.beginPath(); ctx.arc(ix, iy, ir - 5, 0, TAU); ctx.clip();
      // infrared haze rising
      if (glowK > 0) { const hg = ctx.createRadialGradient(ix, iy + 40, 10, ix, iy, ir); hg.addColorStop(0, `rgba(255,110,60,${0.55 * glowK})`); hg.addColorStop(1, `rgba(255,60,40,${0.22 * glowK})`); ctx.fillStyle = hg; ctx.fillRect(ix - ir, iy - ir, 2 * ir, 2 * ir); }
      for (let i = 0; i < 40; i++) {     // galaxies / stars, fading as the haze rises
        const px = ix + (H.hash(i, 31) - 0.5) * 2 * ir, py = iy + (H.hash(i, 32) - 0.5) * 2 * ir;
        ctx.globalAlpha = (0.5 + 0.5 * H.hash(i, 33)) * (1 - 0.75 * glowK); ctx.fillStyle = i % 7 ? '#ffffff' : '#bcd2ff';
        ctx.beginPath(); ctx.arc(px, py, i % 7 ? 2.4 : 5, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 1;
      const nStreak = Math.round(lerp(1, 7, smooth((t - tBlock + 0.5) / 2)));
      for (let i = 0; i < nStreak; i++) {   // satellite trails crossing the view
        const u = fract(t * (0.18 + 0.05 * (i % 3)) + H.hash(i, 34));
        const y = iy - ir * 0.8 + H.hash(i, 35) * ir * 1.6, x1 = ix - ir + u * 2.4 * ir;
        ctx.strokeStyle = 'rgba(230,240,255,0.85)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x1 - 150, y - 30); ctx.lineTo(x1, y); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x1, y, 4, 0, TAU); ctx.fill();
      }
      ctx.restore();
      pill(ix, iy + ir + 34, vp * K.fadeOut(t, tGlow - 0.2, 0.3), P.view || 'Telescope view', false, 26);
      pill(ix, iy + ir + 34, K.popIn(t, tGlow, 0.4), P.glow || 'Sky brighter?', true, 28);
    }
    // top row: shared-sky pill, then the petition and who filed it
    pill(487, 465, K.popIn(t, tShared - 0.1, 0.4) * K.fadeOut(t, tBlock - 0.3, 0.3), P.shared || 'The night sky is shared', true, 32);
    const dp = K.popIn(t, tBlock - 0.1, 0.45);
    if (dp > 0) {
      const fly = K.phase(t, tBlock - 0.1, tBlock + 0.6, H.easeOutCubic);
      K.drawDocument(ctx, lerp(190, 200, fly), lerp(720, 690, fly), 0.62 * Math.min(1, dp), { lines: 4, title: P.doc || 'PETITION' });
    }
    const xs = [220, 487, 755];
    who.forEach((w, i) => pill(xs[i], 465, K.popIn(t, (i === 0 ? tBlock : tOthers + (i - 1) * 0.3) - 0.05, 0.4), w, i === 0, 28));
    ctx.restore();
    return;
  }

  if (mode === 'ruling') {
    const who = P.who || ['Group A', 'Company A', 'Company B'];
    const tDeny = at(P.denyCue, 0.4), tScope = at(P.scopeCue, D * 0.4), tLine = at(P.lineCue, D * 0.7), tPlan = at(P.planCue, D * 0.85);
    const cut = K.phase(t, tLine - 0.9, tLine - 0.4);
    ctx.save();
    if (cut < 1) {    // part 1: the petitions get stamped
      ctx.save(); ctx.globalAlpha = 1;
      K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: tLine, zoom: 1.05, x: 487, y: 740 }]);
      K.world.office(ctx, { t, time: 'night' });
      ctx.fillStyle = 'rgba(5,8,22,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
      K.drawDesk(ctx, 487, 1010, 2.6);
      const xs = [230, 487, 744];
      who.forEach((w, i) => {
        const pop = K.popIn(t, 0.05 + i * 0.12, 0.4);
        if (pop <= 0) return;
        K.drawDocument(ctx, xs[i], 880, 0.95 * Math.min(1, pop), { lines: 5, title: P.doc || 'PETITION' });
        pill(xs[i], 920, pop, w, false, 26);
        const ts = tDeny + 0.15 + i * 0.35;
        if (t > ts - 0.1) K.drawStamp(ctx, xs[i], 800, 0.58, { kind: 'cross', text: P.stamp || 'DENIED', land: (t - ts + 0.1) / 0.5 });
      });
      pill(487, 480, K.popIn(t, tScope - 0.1, 0.4), P.scope || 'Outside the rules', true, 32);
      ctx.restore();
      if (cut > 0) { ctx.fillStyle = `rgba(5,8,22,${cut})`; ctx.fillRect(0, 0, 1080, 1920); }
    }
    if (cut > 0) {    // part 2: altitude ladder
      ctx.save(); ctx.globalAlpha = cut;
      K.camera(ctx, t, [{ t: tLine - 0.6, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 715 }]);
      sky(); earth();
      const lineY = 760;
      // satellites below the line fly freely
      for (let i = 0; i < 12; i++) {
        const u = fract(H.hash(i, 51) + t * 0.08 * (i % 2 ? 1 : -1));
        mini(80 + u * 920, 830 + (i % 3) * 38, 0.5);
      }
      // satellites above wait, greyed, bobbing
      for (let i = 0; i < 7; i++) {
        const x = 170 + i * 108, y = 600 + (i % 2) * 50 + K.bob(t, 4, 0.5, i);
        mini(x, y, 0.6, 0.95, '#9aa3bb', false);
      }
      const lp = K.phase(t, tLine - 0.3, tLine + 0.5, H.easeOutCubic);
      ctx.save(); ctx.strokeStyle = H.rgba(ACC, 0.95); ctx.lineWidth = 5; ctx.setLineDash([18, 12]); ctx.lineDashOffset = -t * 30;
      ctx.beginPath(); ctx.moveTo(90, lineY); ctx.lineTo(90 + 800 * lp, lineY); ctx.stroke(); ctx.restore();
      pill(160, lineY, K.popIn(t, tLine, 0.4), P.line || 'X km', true, 28);
      pill(487, 960, K.popIn(t, tLine + 0.3, 0.4), P.below || 'Cleared below', false, 26);
      const pk = K.popIn(t, tPlan - 0.1, 0.45);
      if (pk > 0) {
        K.drawLock(ctx, 840, lineY - 14, 0.55 * Math.min(1, pk), { open: 0 });
        pill(487, 480, pk, P.above || 'Plan first', true, 32);
      }
      ctx.restore();
    }
    ctx.restore();
    return;
  }
}
