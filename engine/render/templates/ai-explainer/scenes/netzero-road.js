// Scene "netzero-road" (full frame). A company's climate goal as a finish line: a night road runs to the horizon with
// a `goal` + `year` finish banner ("NET ZERO 20XX") on two poles; on the left a data-center campus stacks up block by block under a
// crane and puffs grey CO2 clouds; on the right a tall CO2 meter. Generic shapes, no logos; companies only as text
// pills. Modes:
//   hook    cold open (~4 s): blocks already dropping at frame 0, the meter races up, the banner slides away down the
//           road, `pct` badge slams on pctCue.
//   report  (~11 s): calm; date pill (dateCue), a report booklet pops (reportCue), "RE-EVALUATING" pill + the
//           banner wobbles with a "?" tag (evalCue), a pencil circles the year on the banner (yearCue), goal pill
//           (goalCue).
//   number  (~12 s): CO2 cloud swells, counter panel counts to `total` (totalCue), `pct` chip (pctCue), electricity
//           bolt badge `elec` (elecCue), top blocks light up "new data centers online" (onlineCue).
//   build   (~13 s): construction site: crane swings, a mixer truck rolls in, a flatbed with server racks follows;
//           "what it buys" pill (buysCue), tags for purchased goods (goodsCue) and capital goods (capCue), a bar
//           panel barA vs barB with `capPct` (capPctCue), "tied to data center expansion" pill (expCue).
//   you     (~12 s): a person on a sofa scrolls a phone wired to the data center on the horizon; power pulses
//           (powerCue); demand panel (demandCue); a peers panel with up to 3 rows {name, pct} (peersCue + row cues).
//   caveat  (~8 s): the banner still stands; STILL THE GOAL stamp (dropCue), verbatim quote panel (quoteCue), a
//           calendar page with the year and "?" + pencil, "new timeline: not given" pill (timeCue).
// Cues: narration words ("word#n" = the (n+1)th time) or seconds; without them fixed fractions of the scene.
// Text params (defaults are generic placeholders; pass the story's names and published figures): goal, year, who,
//   pct, pctSub; date, reportTag, reportLabel, evalText, goalText; total (counter end value, 1 decimal), totalSuffix,
//   totalUnit, totalUnit2, totalSub, elecLabel, elecPct (count-up end), onlineText; buysText, goodsText, capText,
//   barHead, barA, barB, capRatio (bar B / bar A height), capPct, perText, expText; demandBy, demandA, demandB,
//   peersHead, peers [{name, pct, cue}] x<=3, dblText; dropText, quote, quote2, by, calTop, calBig, timeText
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, easeInOutCubic, roundRect, rgba, mixHex } = H;
  const TAU = Math.PI * 2;
  const cue = (v, frac) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v) {
      const [w, n] = v.split('#'); const s = info.timeOf(w, n ? parseInt(n, 10) : 0);
      if (s != null) return s;
    }
    return D * frac;
  };
  const ph = (a, b, e) => H.phase(t, a, b, e || easeInOutCubic);
  const pop = (a, dur) => K.popIn(t, a, dur || 0.38);
  const mode = P.mode || 'hook';
  const GY = 1000, HY = 740, VPX = 590;
  const RED = '#ff6b5e', GREY = '#8a90a8';
  const year = String(P.year || '20XX');
  const goal = String(P.goal || 'NET ZERO');

  // ---------------------------------------------------------------- shared drawing
  function sky(heat) {
    const g = ctx.createLinearGradient(0, -100, 0, HY);
    g.addColorStop(0, '#070a1f'); g.addColorStop(0.65, mixHex('#1c2352', '#3a1f3e', heat)); g.addColorStop(1, mixHex('#4a3a6e', '#8a3f4a', heat));
    ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, HY + 210);
    for (let i = 0; i < 50; i++) {
      const x = H.hash(i, 21) * 1080, y = 120 + H.hash(i, 22) * (HY - 200), a = 0.12 + 0.28 * Math.abs(Math.sin(t * 1.2 + i));
      ctx.fillStyle = `rgba(255,255,255,${a * (1 - 0.5 * heat)})`; ctx.fillRect(x, y, 3, 3);
    }
    K.glow(ctx, VPX, HY, 330, mixHex('#ff9a6b', '#ff5a3a', heat), 0.22 + 0.2 * heat);
    // far hills
    ctx.fillStyle = '#1e2246';
    ctx.beginPath(); ctx.moveTo(-200, HY);
    for (let x = -200; x <= 1280; x += 40) ctx.lineTo(x, HY - 26 - 22 * Math.sin(x * 0.011) - 12 * Math.sin(x * 0.031 + 1));
    ctx.lineTo(1280, HY); ctx.closePath(); ctx.fill();
  }
  function ground() {
    const g = ctx.createLinearGradient(0, HY, 0, 1920);
    g.addColorStop(0, '#1f2a44'); g.addColorStop(1, '#0a0e1c');
    ctx.fillStyle = g; ctx.fillRect(-200, HY, 1480, 1300);
    // road: trapezoid to the vanishing point
    ctx.beginPath(); ctx.moveTo(VPX - 10, HY); ctx.lineTo(VPX + 10, HY); ctx.lineTo(VPX + 330, 1300); ctx.lineTo(VPX - 330, 1300); ctx.closePath();
    ctx.fillStyle = '#2b3150'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(VPX - 10, HY); ctx.lineTo(VPX - 330, 1300); ctx.moveTo(VPX + 10, HY); ctx.lineTo(VPX + 330, 1300); ctx.stroke();
    // moving centre dashes (perspective)
    for (let i = 0; i < 9; i++) {
      const u = ((i / 9) + t * 0.12) % 1, k = u * u;                 // 0 = horizon, 1 = near
      const y0 = HY + (1300 - HY) * k, y1 = HY + (1300 - HY) * Math.min(1, k + 0.035 + 0.05 * k);
      const w0 = 2 + 10 * k;
      ctx.fillStyle = `rgba(255,224,140,${0.25 + 0.5 * k})`;
      ctx.beginPath(); ctx.moveTo(VPX - w0 / 2, y0); ctx.lineTo(VPX + w0 / 2, y0); ctx.lineTo(VPX + w0, y1); ctx.lineTo(VPX - w0, y1); ctx.closePath(); ctx.fill();
    }
  }
  // finish banner at road distance d (0 near .. 1 horizon); wob = sway amount; returns where the year text is
  function banner(d, o = {}) {
    const s = 1 / (1 + 4.2 * d), baseY = HY + (GY - HY) * s, cx = VPX;
    const half = 200 * s, poleH = 330 * s, clothH = 84 * s;
    const sway = (o.wob || 0) * Math.sin(t * 5.5) * 0.06;
    K.shadow(ctx, cx, baseY, 460 * s, 0.25);
    ctx.strokeStyle = '#c9cfe0'; ctx.lineWidth = Math.max(2, 9 * s); ctx.lineCap = 'round';
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(cx + sx * half, baseY); ctx.lineTo(cx + sx * half, baseY - poleH); ctx.stroke(); }
    ctx.save(); ctx.translate(cx, baseY - poleH); ctx.rotate(sway);
    const cw = half * 2 + 30 * s;
    roundRect(ctx, -cw / 2, 0, cw, clothH, 10 * s); ctx.fillStyle = '#f4f1e8'; ctx.fill();
    // checker edge
    const n = 14, cs = cw / n;
    for (let i = 0; i < n; i++) { ctx.fillStyle = i % 2 ? '#1b1f33' : '#f4f1e8'; ctx.fillRect(-cw / 2 + i * cs, clothH - 14 * s, cs, 14 * s); ctx.fillStyle = i % 2 ? '#f4f1e8' : '#1b1f33'; ctx.fillRect(-cw / 2 + i * cs, clothH - 28 * s, cs, 14 * s); }
    const fs = Math.max(8, 40 * s);
    ctx.font = H.font('display', fs); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const a = goal + ' ', wa = ctx.measureText(a).width, wy = ctx.measureText(year).width, x0 = -(wa + wy) / 2, ty = (clothH - 28 * s) / 2 + 2 * s;
    ctx.fillStyle = '#1b1f33'; ctx.fillText(a, x0, ty);
    ctx.fillStyle = mixHex(K.ACCENT.deep, '#1b1f33', 0.2); ctx.fillText(year, x0 + wa, ty);
    ctx.restore();
    return { cx, s, baseY, yx: cx + x0 + wa + wy / 2, yy: baseY - poleH + ty, yw: wy, fs, top: baseY - poleH, cw };
  }
  // data-center campus: blocks stacked from the ground; n can be fractional (the top block is still dropping)
  const SX0 = 150, SW = 240, BH = 70;
  function block(x, y, w, h, act, seed) {
    roundRect(ctx, x, y - h, w, h, 8); ctx.fillStyle = '#3a4270'; ctx.fill();
    ctx.fillStyle = '#2d3460'; ctx.fillRect(x + w * 0.78, y - h + 4, w * 0.22 - 4, h - 8);
    ctx.fillStyle = '#4c5590'; ctx.fillRect(x, y - h, w, 6);
    for (let c = 0; c < 5; c++) {
      const wx = x + 14 + c * (w * 0.15), wy = y - h + 18;
      roundRect(ctx, wx, wy, w * 0.12, h - 34, 4); ctx.fillStyle = '#151a33'; ctx.fill();
      for (let l = 0; l < 3; l++) {
        const on = act > 0 && H.hash(seed * 7 + c, Math.floor(t * 4 + l)) < 0.3 + 0.6 * act;
        ctx.fillStyle = on ? mixHex('#2a3050', '#4cc9ff', act) : '#252b48';
        ctx.fillRect(wx + 6 + l * 9, wy + (h - 34) / 2 - 3, 6, 6);
      }
    }
  }
  function stack(n, o = {}) {
    const full = Math.floor(n), frac = n - full, act = o.act == null ? 0.8 : o.act;
    K.shadow(ctx, SX0 + SW / 2, GY, SW + 80);
    K.glow(ctx, SX0 + SW / 2, GY - full * BH / 2, 200 + full * 20, '#4cc9ff', 0.06 + 0.1 * act);
    for (let i = 0; i < full; i++) {
      const w = SW - i * 10, x = SX0 + (SW - w) / 2;
      const bright = o.lightTop && i >= full - 2 ? Math.max(act, o.lightTop) : act;
      block(x, GY - i * BH, w, BH, bright, i + 1);
      if (o.lightTop && i >= full - 2 && o.lightTop > 0.05) K.glow(ctx, SX0 + SW / 2, GY - i * BH - BH / 2, 180, ACC, 0.25 * o.lightTop);
    }
    // roof fans on the top block
    const topY = GY - full * BH;
    for (let i = 0; i < 2; i++) {
      const fx = SX0 + SW / 2 - 50 + i * 100;
      roundRect(ctx, fx - 30, topY - 20, 60, 20, 5); ctx.fillStyle = '#2a2f55'; ctx.fill();
      ctx.save(); ctx.translate(fx, topY - 10); ctx.rotate(t * 7 + i);
      ctx.fillStyle = '#8a93c8'; for (let b = 0; b < 3; b++) { ctx.rotate(TAU / 3); ctx.fillRect(-2.5, -9, 5, 9); } ctx.restore();
    }
    // dropping block
    if (frac > 0.001) {
      const w = SW - full * 10, x = SX0 + (SW - w) / 2, land = topY - 20;
      const y = lerp(470, land, easeInOutCubic(frac));
      block(x, y, w, BH, 0.2, full + 1);
      return { hookX: SX0 + SW / 2, hookY: y - BH, topY };
    }
    return { hookX: SX0 + SW / 2, hookY: topY - 160, topY };
  }
  function crane(hookX, hookY, color) {
    const mx = 122;
    ctx.strokeStyle = color || '#f0b43c'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(mx, GY); ctx.lineTo(mx, 450); ctx.stroke();
    ctx.lineWidth = 3;
    for (let k = 0; k < 11; k++) { ctx.beginPath(); ctx.moveTo(mx - 12, GY - k * 50); ctx.lineTo(mx + 12, GY - k * 50 - 50); ctx.stroke(); }
    ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(mx - 40, 450); ctx.lineTo(Math.max(hookX + 60, 370), 450); ctx.stroke();
    ctx.fillStyle = '#c98f2a'; ctx.fillRect(mx - 52, 440, 36, 30);
    ctx.strokeStyle = '#9aa3c0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(hookX, 452); ctx.lineTo(hookX, hookY); ctx.stroke();
    ctx.fillStyle = '#6b7396'; ctx.fillRect(hookX - 16, hookY - 6, 32, 10);
  }
  // grey CO2 puffs rising from the campus roof; amt 0..1
  function smoke(topY, amt, big) {
    if (amt <= 0.01) return;
    const n = 7;
    for (let i = 0; i < n; i++) {
      const u = ((t * 0.18) + i / n) % 1;
      const x = SX0 + SW / 2 - 40 + H.hash(i, 5) * 80 + u * 140 + Math.sin(u * 5 + i) * 18;
      const y = topY - 30 - u * (big ? 330 : 240);
      const r = (26 + u * (big ? 70 : 46)) * (0.6 + 0.4 * amt);
      ctx.fillStyle = `rgba(150,156,180,${0.5 * (1 - u) * amt})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.arc(x + r * 0.7, y + r * 0.2, r * 0.7, 0, TAU); ctx.arc(x - r * 0.6, y + r * 0.25, r * 0.6, 0, TAU); ctx.fill();
    }
  }
  // tall CO2 meter on the right; level 0..1
  function meter(level, o = {}) {
    const x = 868, y0 = 470, y1 = 960, w = 62, sh = o.shake ? Math.sin(t * 50) * 3 * o.shake : 0;
    ctx.save(); ctx.translate(sh, 0);
    roundRect(ctx, x - w / 2 - 10, y0 - 10, w + 20, y1 - y0 + 20, (w + 20) / 2); ctx.fillStyle = 'rgba(10,12,26,0.85)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.stroke();
    const fy = lerp(y1, y0 + 30, clamp(level));
    const g = ctx.createLinearGradient(0, y1, 0, y0);
    g.addColorStop(0, '#ffb04d'); g.addColorStop(1, RED);
    ctx.save(); roundRect(ctx, x - w / 2, y0, w, y1 - y0, w / 2); ctx.clip();
    ctx.fillStyle = g; ctx.fillRect(x - w / 2, fy, w, y1 - fy + 2);
    // bubbles in the liquid
    for (let i = 0; i < 6; i++) { const u = (t * 0.6 + i / 6) % 1, by = lerp(y1 - 10, fy + 10, u); if (by > fy + 6) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(x - 12 + H.hash(i, 9) * 24, by, 4, 0, TAU); ctx.fill(); } }
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2;
    for (let k = 1; k < 8; k++) { const yy = lerp(y1, y0, k / 8); ctx.beginPath(); ctx.moveTo(x - w / 2, yy); ctx.lineTo(x - w / 2 + 14, yy); ctx.stroke(); }
    K.glow(ctx, x, fy, 70, RED, 0.25 + 0.3 * level);
    ctx.font = H.font('ui', 26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
    ctx.fillText('CO2', x, y1 + 40);
    ctx.restore();
    return { x, fy };
  }
  function badge(x, y, p, text, o = {}) { // big accent pill that slams in
    if (p <= 0) return;
    const size = o.size || 56;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p); ctx.rotate(o.rot || -0.06);
    ctx.font = H.font('display', size); const w = ctx.measureText(text).width + size * 0.9, h = size * 1.35;
    K.glow(ctx, 0, 0, w * 0.7, o.color || ACC, 0.35);
    roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.color || ACC; ctx.fill();
    ctx.fillStyle = o.ink || K.ACCENT.deep; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 3);
    ctx.restore();
  }
  function pill(text, x, y, p, o = {}) { if (p > 0) K.drawLabel(ctx, x, y, Math.min(p, 1.08), { text, size: o.size || 26, dot: o.dot, accent: o.accent }); }
  function panel(x0, y0, w, h, a = 0.9) {
    roundRect(ctx, x0, y0, w, h, 24); ctx.fillStyle = `rgba(12,14,28,${a})`; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = rgba(ACC, 0.55); ctx.stroke();
  }
  function text(txt, x, y, kind, size, color, maxW, align) {
    const fs = maxW ? H.fitText(ctx, txt, kind, size, Math.round(size * 0.55), maxW).size : size;
    ctx.font = H.font(kind, fs); ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(txt, x, y);
  }
  function scaleAt(x, y, s, fn) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y); fn(); ctx.restore(); }
  function pencil(x, y, ang, s = 1) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
    ctx.fillStyle = '#f2c14e'; ctx.fillRect(0, -9, 120, 18);
    ctx.fillStyle = '#e7a7a0'; ctx.fillRect(120, -9, 18, 18);
    ctx.fillStyle = '#f3dcb4'; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(-26, 0); ctx.lineTo(0, 9); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#2b2b3a'; ctx.beginPath(); ctx.moveTo(-17, -3); ctx.lineTo(-26, 0); ctx.lineTo(-17, 3); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function calendar(x, y, s, top, big, p) { // page anchored bottom-centre
    if (p <= 0) return;
    scaleAt(x, y, s * p, () => {
      K.shadow(ctx, x, y, 200);
      roundRect(ctx, x - 100, y - 220, 200, 220, 16); ctx.fillStyle = '#f4f1e8'; ctx.fill();
      ctx.save(); roundRect(ctx, x - 100, y - 220, 200, 220, 16); ctx.clip(); ctx.fillStyle = RED; ctx.fillRect(x - 100, y - 220, 200, 56); ctx.restore();
      for (const dx of [-50, 50]) { ctx.fillStyle = '#5a5f78'; roundRect(ctx, x + dx - 6, y - 236, 12, 30, 6); ctx.fill(); }
      text(top, x, y - 192, 'ui', 26, '#ffffff', 170);
      text(big, x, y - 92, 'display', 64, '#1b1f33', 176);
    });
  }
  function truck(x, kind, s = 1, cargoP = 1) { // drives on the ground line, facing left
    scaleAt(x, GY, s, () => {
      K.shadow(ctx, x, GY, 300);
      // cab (front = left)
      roundRect(ctx, x - 150, GY - 120, 90, 90, 14); ctx.fillStyle = kind === 'mixer' ? '#e2574c' : '#4f7fd9'; ctx.fill();
      roundRect(ctx, x - 140, GY - 108, 50, 36, 6); ctx.fillStyle = '#bfe3ff'; ctx.fill();
      ctx.fillStyle = '#2b2f45'; ctx.fillRect(x - 70, GY - 50, 230, 22);
      if (kind === 'mixer') {
        ctx.save(); ctx.translate(x + 50, GY - 100); ctx.rotate(-0.12);
        ctx.beginPath(); ctx.ellipse(0, 0, 105, 58, 0, 0, TAU); ctx.fillStyle = '#d9dde8'; ctx.fill();
        ctx.strokeStyle = '#9aa1b8'; ctx.lineWidth = 6;
        for (let k = 0; k < 4; k++) { const o = ((t * 60 + k * 50) % 200) - 100; ctx.beginPath(); ctx.moveTo(o, -50); ctx.lineTo(o + 30, 50); ctx.stroke(); }
        ctx.restore();
      } else {
        ctx.fillStyle = '#6b7396'; ctx.fillRect(x - 60, GY - 56, 220, 10);
        for (let i = 0; i < 2; i++) if (cargoP > 0) K.drawServerRack(ctx, x + 5 + i * 95, GY - 56, 0.5, { t, activity: 0.3 });
      }
      for (const wx of [-110, 20, 120]) { ctx.beginPath(); ctx.arc(x + wx, GY - 22, 24, 0, TAU); ctx.fillStyle = '#151827'; ctx.fill(); ctx.beginPath(); ctx.arc(x + wx, GY - 22, 10, 0, TAU); ctx.fillStyle = '#8a90a8'; ctx.fill(); }
    });
  }
  function stamp(x, y, land, txt) { K.drawStamp(ctx, x, y, 0.95, { kind: 'check', text: txt, land }); }

  // ---------------------------------------------------------------- modes
  ctx.save();
  if (mode === 'hook') {
    const tPct = cue(P.pctCue, 0.62);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 500, y: 735 }]);
    sky(0.25 + 0.5 * ph(0, tPct));
    ground();
    const d = lerp(0.12, 0.85, ph(0, tPct + 0.4, easeOutCubic));
    // speed streaks behind the receding banner
    const B = banner(d, { wob: 0.6 });
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3;
    if (t < tPct + 0.4) for (let i = 0; i < 4; i++) { const yy = B.top + 20 + i * 18 * B.s * 3; ctx.beginPath(); ctx.moveTo(B.cx - B.cw / 2 - 20, yy); ctx.lineTo(B.cx - B.cw / 2 - 20 - 60 * (1 - d), yy); ctx.moveTo(B.cx + B.cw / 2 + 20, yy); ctx.lineTo(B.cx + B.cw / 2 + 20 + 60 * (1 - d), yy); ctx.stroke(); }
    const n = 4 + ph(-0.2, 0.7) + ph(0.9, 1.9) ;           // 4 stacked, one dropping at frame 0, a 6th after
    const S = stack(n, { act: 0.85 });
    crane(S.hookX, S.hookY);
    smoke(S.topY, 0.6 + 0.4 * ph(0, tPct), true);
    const land1 = 0.7, land2 = 1.9;
    for (const L of [land1, land2]) if (t > L && t < L + 0.35) K.glow(ctx, SX0 + SW / 2, S.topY, 160, '#ffffff', 0.4 * (1 - (t - L) / 0.35));
    const lvl = lerp(0.35, 0.93, ph(0, tPct, easeInOutCubic));
    meter(lvl, { shake: t > tPct - 0.1 ? 1 - ph(tPct, tPct + 0.8) : 0 });
    pill(String(P.who || 'Company'), SX0 + SW / 2, S.topY - 30, pop(0.15), { dot: true });
    badge(700, 560, pop(tPct - 0.12, 0.45), String(P.pct || '+X%'), { size: 66, color: RED, ink: '#ffffff' });
    if (t > tPct - 0.12) pill(String(P.pctSub || 'emissions, this year'), 700, 650, pop(tPct + 0.1));
  } else if (mode === 'report') {
    const tDate = cue(P.dateCue, 0.1), tRep = cue(P.reportCue, 0.3), tEval = cue(P.evalCue, 0.42);
    const tYear = cue(P.yearCue, 0.62), tGoal = cue(P.goalCue, 0.85);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tYear, zoom: 1.03, x: 560, y: 720 }, { t: D, zoom: 1.05, x: 540, y: 735 }]);
    sky(0.2); ground();
    const S = stack(6, { act: 0.75 });
    crane(S.hookX, S.hookY);
    smoke(S.topY, 0.5, false);
    meter(0.9);
    const B = banner(0.02, { wob: ph(tEval, tEval + 0.4) * (1 - 0.6 * ph(tEval + 2, tEval + 4)) });
    // pencil circles the year
    if (t > tYear - 0.2) {
      const k = ph(tYear - 0.1, tYear + 0.9);
      ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 7; ctx.lineCap = 'round';
      const rx = B.yw * 0.7, ry = B.fs * 0.85;
      ctx.beginPath(); ctx.ellipse(B.yx, B.yy, rx, ry, -0.08, -Math.PI / 2, -Math.PI / 2 + TAU * 1.05 * k); ctx.stroke(); ctx.restore();
      const a = -Math.PI / 2 + TAU * 1.05 * k, px = B.yx + Math.cos(a) * rx, py = B.yy + Math.sin(a) * ry;
      const away = ph(tYear + 1.2, tYear + 1.8);
      pencil(px + away * 140, py + 4 + away * 60, -0.9, 1.0);
      const q = pop(tYear + 0.8);
      if (q > 0) badge(B.cx + B.cw / 2 + 10, B.top - 6, q, '?', { size: 54, rot: 0.15 });
    }
    // date pill + report booklet
    pill(String(P.date || 'DATE'), 590, 520, pop(tDate), { dot: true });
    const rp = pop(tRep, 0.45);
    if (rp > 0) {
      scaleAt(270, 1010, rp, () => {
        K.drawDocument(ctx, 270, 1010, 1.25, { lines: 5 });
        roundRect(ctx, 200, 830, 140, 54, 10); ctx.fillStyle = '#2b8a5a'; ctx.fill();
        text(String(P.reportTag || 'NEW'), 270, 857, 'display', 32, '#ffffff', 120);
      });
      pill(String(P.reportLabel || 'Sustainability report'), 270, 772, pop(tRep + 0.15), { size: 24 });
    }
    // re-evaluating pill
    const ep = pop(tEval, 0.45);
    if (ep > 0) badge(590, 585, ep, String(P.evalText || 'RE-EVALUATING'), { size: 40, rot: -0.04 });
    pill(String(P.goalText || 'Goal: net zero, whole value chain'), 680, 980, pop(tGoal), { size: 26 });
  } else if (mode === 'number') {
    const tTot = cue(P.totalCue, 0.2), tPct = cue(P.pctCue, 0.42), tEl = cue(P.elecCue, 0.6);
    const tElP = cue(P.elecPctCue, 0.72), tOn = cue(P.onlineCue, 0.9);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 480, y: 740 }]);
    sky(0.45); ground();
    banner(0.8);
    const S = stack(6, { act: 0.8, lightTop: ph(tOn - 0.2, tOn + 0.4) });
    crane(S.hookX, S.hookY);
    smoke(S.topY, 0.7 + 0.3 * ph(tTot, tTot + 2), true);
    meter(lerp(0.6, 0.97, ph(tTot, tPct + 0.4)), { shake: t > tPct && t < tPct + 0.8 ? 1 - ph(tPct, tPct + 0.8) : 0 });
    // counter panel
    const cp = pop(Math.max(0.1, tTot - 0.6), 0.45);
    if (cp > 0) scaleAt(560, 540, cp, () => {
      panel(300, 445, 520, 190);
      const v = (P.total != null ? P.total : 10) * easeOutCubic(clamp((t - tTot + 0.2) / 1.2));
      text(`${v.toFixed(1)}${P.totalSuffix != null ? P.totalSuffix : 'M'}`, 470, 525, 'display', 84, '#ffffff', 300);
      text(String(P.totalUnit || 'tonnes'), 700, 512, 'bold', 34, ACC, 180);
      text(String(P.totalUnit2 || 'CO2e'), 700, 548, 'ui', 28, 'rgba(255,255,255,0.8)', 180);
      text(String(P.totalSub || 'net emissions this year'), 560, 605, 'ui', 26, 'rgba(255,255,255,0.75)', 470);
    });
    badge(640, 700, pop(tPct - 0.1, 0.45), String(P.pct || '+X% in a year'), { size: 44, color: RED, ink: '#ffffff' });
    // electricity bolt badge
    const ep = pop(tEl - 0.1, 0.45);
    if (ep > 0) scaleAt(640, 820, ep, () => {
      panel(470, 772, 340, 96);
      ctx.save(); ctx.translate(520, 820); ctx.fillStyle = ACC;
      ctx.beginPath(); ctx.moveTo(8, -36); ctx.lineTo(-18, 6); ctx.lineTo(0, 6); ctx.lineTo(-8, 36); ctx.lineTo(20, -8); ctx.lineTo(2, -8); ctx.closePath(); ctx.fill(); ctx.restore();
      text(String(P.elecLabel || 'Electricity'), 650, 800, 'ui', 26, 'rgba(255,255,255,0.8)', 220);
      const pv = Math.round((P.elecPct != null ? P.elecPct : 20) * easeOutCubic(clamp((t - tElP + 0.1) / 0.8)));
      text(t > tElP - 0.1 ? `+${pv}%` : '...', 650, 840, 'display', 40, '#ffffff', 220);
    });
    pill(String(P.onlineText || 'new data centers online'), SX0 + SW / 2 + 20, S.topY + 190, pop(tOn - 0.1), { size: 24, accent: true });
  } else if (mode === 'build') {
    const tBuy = cue(P.buysCue, 0.15), tGoods = cue(P.goodsCue, 0.3), tCap = cue(P.capCue, 0.38);
    const tHw = cue(P.hwCue, 0.48), tCapP = cue(P.capPctCue, 0.72), tExp = cue(P.expCue, 0.9);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 500, y: 740 }]);
    sky(0.3); ground();
    banner(0.85);
    const n = 5 + ph(tGoods, tGoods + 1.6) + ph(tCapP - 1.2, tCapP + 0.2);
    const S = stack(n, { act: 0.7 });
    crane(S.hookX, S.hookY);
    smoke(S.topY, 0.6, false);
    // trucks roll in from the right and park
    const mxr = lerp(1250, 520, ph(0, 2.2, easeOutCubic));
    truck(mxr, 'mixer', 0.85);
    const fx = lerp(1300, 760, ph(tGoods - 0.6, tGoods + 1.4, easeOutCubic));
    truck(fx, 'flatbed', 0.8);
    // boxes of "stuff it buys" with price tags
    const bp = pop(tBuy - 0.2, 0.45);
    pill(String(P.buysText || 'Mostly what it buys'), 610, 500, bp, { dot: true });
    // tags
    const gp = pop(tGoods - 0.1, 0.4), cp = pop(tCap - 0.1, 0.4);
    if (gp > 0) { pill(String(P.goodsText || 'Purchased goods & services'), 610, 562, gp, { size: 26 }); }
    if (cp > 0) { pill(String(P.capText || 'Capital goods: e.g. servers'), 610, 624, cp, { size: 26 }); }
    // bars: before (barA) vs after (barB), height ratio capRatio
    const bpn = pop(tCapP - 0.9, 0.45);
    if (bpn > 0) scaleAt(690, 860, bpn, () => {
      panel(520, 650, 350, 262);
      text(String(P.barHead || 'Capital goods emissions'), 695, 688, 'ui', 24, 'rgba(255,255,255,0.85)', 300);
      const g = ph(tCapP - 0.6, tCapP + 0.3, easeOutCubic);
      const h0 = 70, h1 = h0 * (P.capRatio || 1.5) * g + h0 * (1 - g);
      roundRect(ctx, 580, 875 - h0, 80, h0, 10); ctx.fillStyle = GREY; ctx.fill();
      roundRect(ctx, 720, 875 - h1, 80, h1, 10); ctx.fillStyle = RED; ctx.fill();
      text(String(P.barA || 'Before'), 620, 893, 'ui', 22, 'rgba(255,255,255,0.75)');
      text(String(P.barB || 'After'), 760, 893, 'ui', 22, 'rgba(255,255,255,0.75)');
      if (g > 0.6) text(String(P.capPct || '+50%'), 760, 875 - h1 - 24, 'display', 36, '#ffffff');
    });
    pill(String(P.perText || 'per report'), 695, 950, pop(tCapP + 0.2), { size: 22 });
    if (t > tExp - 0.3) stamp(SX0 + SW / 2, S.topY + 200, ph(tExp - 0.3, tExp + 0.3, (k) => k), String(P.expText || 'DATA CENTERS'));
  } else if (mode === 'you') {
    const tPow = cue(P.powerCue, 0.22), tDem = cue(P.demandCue, 0.36), tPeer = cue(P.peersCue, 0.6);
    const peers = P.peers || [{ name: 'Company A', pct: '+X%' }, { name: 'Company B', pct: '+Y%' }, { name: 'Company C', pct: '+Z%' }];
    const tDbl = cue(P.dblCue, 0.85);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 500, y: 760 }]);
    sky(0.25); ground();
    // the data center on the horizon (left)
    const dcx = 300, dcy = 860;
    K.drawDataCenter(ctx, dcx, dcy, 0.9, { t, activity: 0.6 + 0.4 * ph(tPow - 0.3, tPow + 0.5) });
    pill(String(P.who || 'Company'), dcx, dcy - 190, pop(0.2), { dot: true });
    // cable from the data center to the phone
    const px = 700, py = 870;
    const cable = K.bezier(dcx + 140, dcy - 70, 420, 640, 600, 640, px - 20, py - 40, 40);
    ctx.save(); ctx.strokeStyle = 'rgba(120,140,200,0.6)'; ctx.lineWidth = 5; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 40;
    K.pathDraw(ctx, cable, ph(0, 0.8)); ctx.restore();
    const lev = ph(tPow - 0.3, tPow + 0.4);
    if (lev > 0) for (let i = 0; i < 5; i++) {
      const u = (t * 0.45 + i / 5) % 1, [x, y] = K.pathPoint(cable, u);
      K.glow(ctx, x, y, 34, ACC, 0.6 * lev); ctx.beginPath(); ctx.arc(x, y, 6, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill();
    }
    // the viewer: a person on a little sofa scrolling a phone
    roundRect(ctx, 560, 900, 300, 110, 30); ctx.fillStyle = '#6a4c8a'; ctx.fill();
    roundRect(ctx, 540, 860, 60, 150, 26); ctx.fillStyle = '#5a3f78'; ctx.fill();
    roundRect(ctx, 820, 860, 60, 150, 26); ctx.fill();
    K.shadow(ctx, 710, 1012, 340);
    K.drawPerson(ctx, 710, 1010, 1.45, { t, pose: 'sit-phone', seat: false, mood: t > tPeer ? 'worried' : 'neutral', shirt: 2, hairStyle: 'curly', skin: 3, seed: 4, look: -0.4 });
    K.glow(ctx, px - 20, py - 40, 60, '#9fd8ff', 0.25 + 0.25 * lev);
    // demand panel (top-left)
    const dp = pop(tDem - 0.15, 0.45);
    if (dp > 0) scaleAt(320, 510, dp, () => {
      panel(135, 440, 370, 150);
      text(String(P.demandBy || 'Company report:'), 320, 474, 'ui', 24, 'rgba(255,255,255,0.75)', 330);
      text(String(P.demandA || 'Electricity demand'), 320, 514, 'bold', 30, '#ffffff', 330);
      text(String(P.demandB || 'rising as AI scales'), 320, 556, 'ui', 28, ACC, 330);
    });
    // peers panel (top-right)
    const pp = pop(tPeer - 0.25, 0.45);
    if (pp > 0) scaleAt(720, 560, pp, () => {
      panel(525, 440, 360, 64 + peers.length * 70);
      text(String(P.peersHead || 'Also up, latest reports'), 705, 474, 'ui', 24, 'rgba(255,255,255,0.8)', 340);
      peers.forEach((r, i) => {
        const tr = cue(r.cue, 0.6 + i * 0.08), k = pop(tr - 0.1, 0.35);
        if (k <= 0) return;
        const yy = 540 + i * 70;
        scaleAt(705, yy, Math.min(1, k), () => {
          roundRect(ctx, 545, yy - 26, 52, 52, 10); ctx.fillStyle = '#3a4270'; ctx.fill();
          for (let l = 0; l < 3; l++) { ctx.fillStyle = H.hash(i * 3 + l, Math.floor(t * 4)) < 0.6 ? '#4cc9ff' : '#252b48'; ctx.fillRect(555 + l * 13, yy - 4, 8, 8); }
          text(String(r.name), 612, yy, 'bold', 30, '#ffffff', 165, 'left');
          text(String(r.pct), 865, yy, 'display', 34, RED, 110, 'right');
        });
      });
    });
    if (t > tDbl - 0.2) pill(String(P.dblText || 'double-digit jumps'), 705, 440 + 64 + peers.length * 70 + 50, pop(tDbl - 0.2), { size: 24, accent: true });
  } else if (mode === 'caveat') {
    const tDrop = cue(P.dropCue, 0.12), tQ = cue(P.quoteCue, 0.32), tTime = cue(P.timeCue, 0.8);
    const tJust = cue(P.justCue, 0.68);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 520, y: 740 }]);
    sky(0.15); ground();
    const S = stack(6, { act: 0.7 });
    smoke(S.topY, 0.45, false);
    const B = banner(0.3, { wob: 0.15 });
    if (t > tDrop - 0.2) stamp(B.cx - 20, B.top + 300, ph(tDrop - 0.2, tDrop + 0.35, (k) => k), String(P.dropText || 'NOT DROPPED'));
    // quote panel
    const qp = pop(tQ - 0.35, 0.45);
    if (qp > 0) scaleAt(505, 520, qp, () => {
      panel(135, 440, 740, 170, 0.92);
      text(String(P.quote || '“Quote goes here,'), 505, 486, 'bold', 36, '#ffffff', 690);
      text(String(P.quote2 || 'second line”'), 505, 530, 'bold', 36, '#ffffff', 690);
      text(String(P.by || 'Name, Source'), 505, 578, 'ui', 24, ACC, 690);
    });
    // calendar page: year + "?" with a tapping pencil
    const cp = pop(tJust - 0.2, 0.45);
    calendar(800, 1000, 0.95, String(P.calTop || 'NEW DATE'), String(P.calBig || year + '?'), cp);
    if (cp > 0) { const tap = Math.abs(Math.sin(t * 6)) * 14 * (1 - ph(D - 0.8, D)); pencil(830, 860 - tap, -0.6, 0.9); }
    pill(String(P.timeText || 'New timeline: not given yet'), 520, 690, pop(tTime - 0.1), { size: 26, accent: true });
  }
  ctx.restore();
}
