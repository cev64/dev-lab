// Scene "chip-alert" (full frame). An AI gun-detection camera at a generic high school mistakes a teen's snack bag
// for a gun; the alert is cancelled but still reaches police; a lawsuit follows. Non-graphic by design: no weapon is
// ever drawn, officers stay small and far away, teens are generic kit cartoons, the bag has no brand or logo.
// Fits: AI surveillance false alarms, school safety tech, "human in the loop failed" stories.
// modes:
//  hook    cold open: dusk school front, camera on a pole, red box already closing on the bag, "GUN?" tag, siren
//  story   date / place pills, four teens walk in, one eats chips, the camera sweeps and flags him; alert phone card
//  cancel  safety office: staffer + monitor, timer, CANCELED stamp, "It's chips"; then a phone shows ALERT +
//          CANCELED (the cancel bubble is missed) and a screenshot flies to a "school resource officer" pill
//  police  night school front washed red/blue, cruisers roll in far back, counter pill, "lawsuit says" pill,
//          teens raise hands, small cuff icons, a spotlight on the bag + NOTHING FOUND stamp
//  lawsuit courtroom: a LAWSUIT doc lands, three defendant tiles, two "asks" chips
//  number  wall of 100 alert tiles flip to grey "false", one stays lit; >99% count-up; attribution pill
//  caveat  NOT PROVEN banner over a raised gavel; verbatim quote panel with attribution
// params: mode, date, place, flag, phoneHead, phoneSub, cancelStamp, chips, missed, officer, lawsuitPill, cars,
//   found, docHead, docSub, defendants [3], asks [2], pct, pctLabel, pctBy, notProven, quote, by + cues (see each mode)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = info.helpers.kit, P = info.params || {}, D = info.duration;
  const { clamp, roundRect, rgba, lerp } = H;
  const ACC = info.accent || '#c4ff3a';
  const RED = '#ff4d5e', BLUE = '#4d7dff', GREEN = '#46e08a';
  const at = (w, d) => {
    if (typeof w === 'number') return w;
    if (!w) return d;
    const m = String(w).split('#'); const v = info.timeOf(m[0], m[1] ? +m[1] : 0);
    return v == null ? d : v;
  };
  const pop = (t0, dur = 0.45) => K.popIn(t, t0, dur);
  const fade = (t0, dur = 0.35) => clamp((t - t0) / dur);
  const mode = P.mode || 'story';

  // ------------------------------------------------------------- helpers
  function pill(x, y, p, text, o = {}) { if (p > 0) K.drawLabel(ctx, x, y, p, Object.assign({ text, size: o.size || 28 }, o)); }
  function panel(x, y, w, h, a = 0.92, edge = null) {
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
    roundRect(ctx, x, y, w, h, 22); ctx.fillStyle = rgba('#0e1224', a); ctx.fill(); ctx.restore();
    ctx.lineWidth = 3; ctx.strokeStyle = edge || 'rgba(255,255,255,0.16)'; roundRect(ctx, x, y, w, h, 22); ctx.stroke();
  }
  function text(str, x, y, kind, size, color, align = 'center', maxW = 0) {
    ctx.font = H.font(kind, size);
    if (maxW) { let s = size; while (s > 18 && ctx.measureText(str).width > maxW) { s -= 2; ctx.font = H.font(kind, s); } }
    ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
  }
  // snack bag: generic orange foil pouch with a chip triangle, no brand
  function bag(x, y, s, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-26, -34); ctx.lineTo(26, -34); ctx.lineTo(30, 30); ctx.lineTo(-30, 30); ctx.closePath();
    ctx.fillStyle = '#ff8a2a'; ctx.fill();
    ctx.fillStyle = '#e06a12'; ctx.fillRect(-30, 18, 60, 12); ctx.fillRect(-26, -34, 52, 8);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = '#c75a0c'; ctx.fillRect(-26 + i * 10, -36, 5, 4); ctx.fillRect(-30 + i * 11, 28, 5, 4); }
    ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(15, 12); ctx.lineTo(-15, 12); ctx.closePath(); ctx.fillStyle = '#ffd34d'; ctx.fill();
    ctx.restore();
  }
  // generic teen: kit person + backpack straps; i = 0..3 varies looks
  const TEEN = [
    { skin: 4, hair: 0, hairStyle: 'short', shirt: '#3f6fd8', seed: 3 },
    { skin: 3, hair: 0, hairStyle: 'curly', shirt: '#d8543f', seed: 11 },
    { skin: 4, hair: 1, hairStyle: 'short', shirt: '#2f9b74', seed: 19 },
    { skin: 2, hair: 0, hairStyle: 'none', shirt: '#7b55c9', seed: 27 },
  ];
  function teen(i, x, y, s, o = {}) {
    const base = TEEN[i % 4];
    // backpack behind
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.flip) ctx.scale(-1, 1);
    roundRect(ctx, -44, -176, 30, 70, 10); ctx.fillStyle = '#262b45'; ctx.fill();
    ctx.restore();
    K.drawPerson(ctx, x, y, s, Object.assign({ t, pose: 'stand', mood: 'neutral', pants: '#2b3150' }, base, o));
  }
  function handOf(x, y, s, flip) { return [x + (flip ? -38 : 38) * s, y - 98 * s]; }
  // security camera on a pole; lens points left-down toward (aimX, aimY)
  function camPole(x, top, ground, alert, aim) {
    roundRect(ctx, x - 9, top, 18, ground - top, 6); ctx.fillStyle = '#3b4266'; ctx.fill();
    roundRect(ctx, x - 26, ground - 12, 52, 14, 5); ctx.fillStyle = '#2b3150'; ctx.fill();
    const ang = Math.atan2(aim[1] - top, aim[0] - x);
    ctx.save(); ctx.translate(x, top + 10); ctx.rotate(ang);
    roundRect(ctx, -30, -26, 120, 52, 14); ctx.fillStyle = '#e8ecf6'; ctx.fill();
    roundRect(ctx, -30, 10, 120, 16, 8); ctx.fillStyle = '#c3c9db'; ctx.fill();
    ctx.beginPath(); ctx.arc(96, 0, 22, 0, Math.PI * 2); ctx.fillStyle = '#1a1f36'; ctx.fill();
    ctx.beginPath(); ctx.arc(96, 0, 12, 0, Math.PI * 2); ctx.fillStyle = alert ? RED : ACC; ctx.fill();
    ctx.restore();
    H.glow(ctx, x + Math.cos(ang) * 96, top + 10 + Math.sin(ang) * 96, alert ? 70 : 40, alert ? RED : ACC, alert ? 0.6 : 0.35);
    // "AI" tag on the housing
    roundRect(ctx, x - 22, top - 40, 44, 28, 8); ctx.fillStyle = ACC; ctx.fill();
    text('AI', x, top - 26, 'display', 20, '#16202a');
    return [x + Math.cos(ang) * 96, top + 10 + Math.sin(ang) * 96];
  }
  function cone(from, to, a, col) {
    if (a <= 0) return;
    const dx = to[0] - from[0], dy = to[1] - from[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L, w = 120;
    const g = ctx.createLinearGradient(from[0], from[1], to[0], to[1]);
    g.addColorStop(0, rgba(col, 0.42 * a)); g.addColorStop(1, rgba(col, 0.04 * a));
    ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(to[0] + nx * w, to[1] + ny * w); ctx.lineTo(to[0] - nx * w, to[1] - ny * w); ctx.closePath();
    ctx.fillStyle = g; ctx.fill();
  }
  // red detection box around (cx, cy); k 0 -> 1 closes from big to tight
  function detBox(cx, cy, k, label, a = 1) {
    if (a <= 0) return;
    const e = H.easeOutCubic(clamp(k)), w = lerp(300, 110, e), h = lerp(320, 120, e);
    ctx.save(); ctx.globalAlpha = a;
    ctx.strokeStyle = RED; ctx.lineWidth = 6; ctx.lineCap = 'round';
    const x0 = cx - w / 2, y0 = cy - h / 2, c = 26;
    ctx.beginPath();
    ctx.moveTo(x0, y0 + c); ctx.lineTo(x0, y0); ctx.lineTo(x0 + c, y0);
    ctx.moveTo(x0 + w - c, y0); ctx.lineTo(x0 + w, y0); ctx.lineTo(x0 + w, y0 + c);
    ctx.moveTo(x0 + w, y0 + h - c); ctx.lineTo(x0 + w, y0 + h); ctx.lineTo(x0 + w - c, y0 + h);
    ctx.moveTo(x0 + c, y0 + h); ctx.lineTo(x0, y0 + h); ctx.lineTo(x0, y0 + h - c);
    ctx.stroke();
    ctx.lineWidth = 2; ctx.strokeStyle = rgba(RED, 0.5); ctx.strokeRect(x0, y0, w, h);
    if (label && e > 0.6) {
      const la = clamp((e - 0.6) / 0.3);
      ctx.globalAlpha = a * la;
      ctx.font = H.font('display', 30); const tw = ctx.measureText(label).width + 30;
      roundRect(ctx, x0, y0 - 52, tw, 44, 10); ctx.fillStyle = RED; ctx.fill();
      text(label, x0 + tw / 2, y0 - 29, 'display', 30, '#ffffff');
    }
    ctx.restore();
  }
  function siren(x, y, on, s = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    roundRect(ctx, -22, -10, 44, 14, 5); ctx.fillStyle = '#3a3f5c'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -10, 18, Math.PI, 0); ctx.fillStyle = on ? RED : '#5a2a35'; ctx.fill();
    ctx.restore();
    if (on) H.glow(ctx, x, y - 14 * s, 90 * s, RED, 0.45 + 0.3 * Math.sin(t * 12));
  }
  function school(time, wash = 0) {
    const night = time === 'night';
    const g = ctx.createLinearGradient(0, 0, 0, 1000);
    if (night) { g.addColorStop(0, '#0b0f26'); g.addColorStop(1, '#1d2350'); } else { g.addColorStop(0, '#2a2a5e'); g.addColorStop(0.7, '#7a5a8e'); g.addColorStop(1, '#e58e6c'); }
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    // stars / far trees
    for (let i = 0; i < 26; i++) { const sx = H.hash(i, 3) * 1080, sy = 120 + H.hash(i, 5) * 360; ctx.fillStyle = rgba('#ffffff', (night ? 0.5 : 0.2) * (0.5 + 0.5 * Math.sin(t * 2 + i))); ctx.fillRect(sx, sy, 3, 3); }
    ctx.fillStyle = night ? '#121733' : '#3e3560';
    for (let i = 0; i < 12; i++) { const x = i * 100 - 20, r = 70 + 30 * H.hash(i, 9); ctx.beginPath(); ctx.arc(x, 640, r, Math.PI, 0); ctx.fill(); }
    // building
    const by = 600, gy = 1000;
    ctx.fillStyle = night ? '#5a3434' : '#8a4b46'; ctx.fillRect(0, by, 1080, gy - by);
    ctx.fillStyle = night ? '#4a2a2c' : '#733c39';
    for (let r = 0; r < 14; r++) for (let c = 0; c < 18; c++) if ((r + c) % 3 === 0) ctx.fillRect(c * 62 + (r % 2) * 30, by + 10 + r * 28, 40, 4);
    ctx.fillStyle = night ? '#3a2326' : '#5e2f2d'; ctx.fillRect(0, by - 24, 1080, 30);
    // windows
    for (let c = 0; c < 6; c++) {
      if (c === 2) continue;
      const wx = 40 + c * 175, lit = H.hash(c, 41) > (night ? 0.4 : 0.2);
      roundRect(ctx, wx, by + 50, 120, 110, 8); ctx.fillStyle = lit ? (night ? '#ffd98a' : '#ffe7b3') : '#2a2c4a'; ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(wx + 58, by + 50, 4, 110); ctx.fillRect(wx, by + 102, 120, 4);
    }
    // entrance with sign
    roundRect(ctx, 370, by + 10, 230, 60, 10); ctx.fillStyle = '#e9e4d6'; ctx.fill();
    text('HIGH SCHOOL', 485, by + 41, 'display', 30, '#4a2a2c');
    roundRect(ctx, 400, by + 200, 170, gy - by - 200, 6); ctx.fillStyle = '#2b2f4c'; ctx.fill();
    ctx.fillStyle = rgba('#bcd8ff', night ? 0.35 : 0.25); ctx.fillRect(412, by + 214, 70, gy - by - 220); ctx.fillRect(488, by + 214, 70, gy - by - 220);
    // sidewalk + curb
    ctx.fillStyle = night ? '#3a3f5c' : '#6f6a86'; ctx.fillRect(0, gy, 1080, 120);
    ctx.fillStyle = night ? '#2c3049' : '#59546f'; for (let i = 0; i < 9; i++) ctx.fillRect(i * 130, gy, 4, 120);
    ctx.fillStyle = night ? '#1b1f33' : '#3b3850'; ctx.fillRect(0, gy + 120, 1080, 800);
    if (wash > 0) {
      const red = Math.sin(t * 9) > 0;
      ctx.fillStyle = rgba(red ? RED : BLUE, 0.16 * wash); ctx.fillRect(0, 0, 1080, 1920);
    }
    return { gy, feet: 1030 };
  }
  function policeCar(x, y, s, lights, flip = false) {
    ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, 0, 130, 14, 0, 0, Math.PI * 2); ctx.fill();
    roundRect(ctx, -120, -70, 240, 56, 18); ctx.fillStyle = '#f0f2f8'; ctx.fill();
    roundRect(ctx, -70, -112, 130, 50, 16); ctx.fillStyle = '#f0f2f8'; ctx.fill();
    roundRect(ctx, -60, -104, 52, 36, 8); ctx.fillStyle = '#2b3150'; ctx.fill();
    roundRect(ctx, 0, -104, 50, 36, 8); ctx.fillStyle = '#2b3150'; ctx.fill();
    ctx.fillStyle = '#1d2540'; ctx.fillRect(-120, -48, 240, 14);
    for (const wx of [-72, 72]) { ctx.beginPath(); ctx.arc(wx, -12, 24, 0, Math.PI * 2); ctx.fillStyle = '#151827'; ctx.fill(); ctx.beginPath(); ctx.arc(wx, -12, 10, 0, Math.PI * 2); ctx.fillStyle = '#8a91ab'; ctx.fill(); }
    const on = Math.sin(t * 10 + x) > 0;
    roundRect(ctx, -30, -126, 30, 14, 5); ctx.fillStyle = lights ? (on ? RED : '#6a2a35') : '#6a2a35'; ctx.fill();
    roundRect(ctx, 0, -126, 30, 14, 5); ctx.fillStyle = lights ? (on ? '#2a3a7a' : BLUE) : '#2a3a7a'; ctx.fill();
    ctx.restore();
    if (lights) H.glow(ctx, x + (Math.sin(t * 10 + x) > 0 ? -15 : 15) * s, y - 120 * s, 110 * s, Math.sin(t * 10 + x) > 0 ? RED : BLUE, 0.55);
  }
  function officer(x, y, s, o = {}) {
    K.drawPerson(ctx, x, y, s, Object.assign({ t, pose: 'stand', shirt: '#2f437e', pants: '#1d2540', hairStyle: 'short', hair: 0, skin: 1, seed: 9, mood: 'neutral' }, o));
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    roundRect(ctx, -36, -308, 72, 28, 10); ctx.fillStyle = '#1d2540'; ctx.fill();
    ctx.beginPath(); ctx.ellipse(8, -280, 30, 7, 0, 0, Math.PI * 2); ctx.fillStyle = '#11162a'; ctx.fill();
    ctx.restore();
  }
  function cuffs(x, y, a) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#cfd6e6'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(x - 16, y, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + 16, y, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x - 4, y); ctx.lineTo(x + 4, y); ctx.stroke();
    ctx.restore();
  }
  function phoneCard(x, y, w, h, a, rows) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = clamp(a);
    ctx.translate(x, y); const sc = 0.8 + 0.2 * Math.min(1, a); ctx.scale(sc, sc);
    roundRect(ctx, -w / 2, -h / 2, w, h, 34); ctx.fillStyle = '#151a2e'; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = '#2d3454'; roundRect(ctx, -w / 2, -h / 2, w, h, 34); ctx.stroke();
    roundRect(ctx, -30, -h / 2 + 14, 60, 10, 5); ctx.fillStyle = '#2d3454'; ctx.fill();
    rows(-w / 2 + 22, -h / 2 + 44, w - 44);
    ctx.restore();
  }
  // mini still of the camera frame: a teen silhouette with a bag and a red box
  function snapshot(x, y, w, h, boxA = 1, chipsA = 0) {
    roundRect(ctx, x, y, w, h, 12); ctx.fillStyle = '#3b3550'; ctx.fill();
    ctx.save(); roundRect(ctx, x, y, w, h, 12); ctx.clip();
    ctx.fillStyle = '#6e3f3d'; ctx.fillRect(x, y, w, h * 0.62);
    ctx.fillStyle = '#545070'; ctx.fillRect(x, y + h * 0.62, w, h);
    const px = x + w * 0.45, py = y + h * 0.92, s = h / 330;
    K.drawPerson(ctx, px, py, s, Object.assign({ t: 0, pose: 'stand', mood: 'neutral', pants: '#2b3150' }, TEEN[0]));
    const [hx, hy] = handOf(px, py, s, false);
    bag(hx + 4 * s, hy, s * 0.9, 0.2);
    if (boxA > 0) {
      ctx.globalAlpha = boxA; ctx.strokeStyle = RED; ctx.lineWidth = 4; ctx.strokeRect(hx - 40 * s, hy - 45 * s, 90 * s, 90 * s); ctx.globalAlpha = 1;
    }
    if (chipsA > 0) {
      ctx.globalAlpha = chipsA; ctx.strokeStyle = GREEN; ctx.lineWidth = 5; ctx.strokeRect(hx - 40 * s, hy - 45 * s, 90 * s, 90 * s); ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  // ------------------------------------------------------------- modes
  ctx.save();
  if (mode === 'hook' || mode === 'story') {
    const hook = mode === 'hook';
    const T = hook
      ? { teens: -9, chips: -5, flag: -0.4, phone: 1.1 }
      : { date: at(P.dateCue, 0.2), place: at(P.placeCue, 1.8), teens: at(P.teensCue, 4.9), chips: at(P.chipsCue, 8.6), flag: at(P.flagCue, 11.5) };
    K.camera(ctx, t, hook ? [{ t: 0, zoom: 1.02, x: 487, y: 760 }, { t: D, zoom: 1.06, x: 487, y: 770 }]
                          : [{ t: 0, zoom: 1.0 }, { t: T.flag - 1.2, zoom: 1.02 }, { t: T.flag + 0.8, zoom: 1.06, x: 480, y: 760 }, { t: D, zoom: 1.07, x: 480, y: 760 }]);
    const alertOn = t > T.flag + 0.4;
    const S = school('dusk', 0);
    const FEET = S.feet, sc = 1.3;
    // four teens: walk in from the left (story), already standing (hook)
    const xs = [200, 330, 500, 630];
    for (let i = 0; i < 4; i++) {
      const arrive = T.teens + i * 0.25, walkT = t - arrive;
      const tx = walkT < 0 ? -200 : walkT < 1.6 ? lerp(-150 - i * 60, xs[i], H.easeInOutCubic(walkT / 1.6)) : xs[i];
      if (tx < -120) continue;
      const walking = walkT >= 0 && walkT < 1.6;
      const isChip = i === 1;
      const worried = alertOn && !hook ? 'neutral' : 'happy';
      teen(i, tx, FEET, sc, { walk: walking ? walkT : null, mood: worried, look: i < 2 ? 0.5 : -0.5, talk: !walking && !isChip ? 0.3 * (0.5 + 0.5 * Math.sin(t * 6 + i)) : 0 });
      if (isChip && t > T.chips - 3) {
        const [hx, hy] = handOf(tx, FEET, sc, false);
        const lift = H.easeOutBack(clamp((t - T.chips) / 0.5));
        bag(hx + 6, hy - 6 - 40 * lift * (hook ? 0 : 1) * (1 - fade(T.chips + 1.6, 0.6)), sc * 0.95, 0.2);
      }
    }
    // camera pole at right
    const chipTeenX = xs[1], [bhx, bhy] = handOf(chipTeenX, FEET, sc, false);
    const sweep = clamp((t - (T.flag - 1.0)) / 1.0);
    const aimX = hook ? bhx : lerp(900, bhx, H.easeInOutCubic(sweep)), aimY = hook ? bhy : lerp(1000, bhy, H.easeInOutCubic(sweep));
    const lens = camPole(820, 560, FEET, alertOn, [aimX, aimY]);
    cone(lens, [aimX, aimY], hook ? 1 : 0.4 + 0.6 * sweep, alertOn ? RED : ACC);
    // detection box
    const boxK = clamp((t - T.flag + 0.2) / 0.7);
    if (t > T.flag - 0.2) detBox(bhx + 6, bhy - 6, boxK, P.flag || 'GUN?');
    siren(820, 516, alertOn, 1.0);
    if (alertOn) { ctx.fillStyle = rgba(RED, 0.08 + 0.06 * Math.sin(t * 12)); ctx.fillRect(0, 0, 1080, 1920); }
    if (hook) {
      pill(487, 520, pop(0.35), 'AI GUN ALERT', { size: 34, dot: false });
    } else {
      const pOut = 1 - fade(T.flag - 0.6, 0.4);
      ctx.save(); ctx.globalAlpha = pOut;
      pill(487, 480, pop(T.date), P.date || 'DATE', { size: 30, dot: true });
      pill(487, 555, pop(T.place), P.place || 'A high school', { size: 28 });
      ctx.restore();
      // alert phone card (right) after the flag
      const pa = pop(T.flag + 0.5, 0.5);
      if (pa > 0) phoneCard(720, 720, 230, 280, pa, (x0, y0, w) => {
        roundRect(ctx, x0, y0, w, 52, 12); ctx.fillStyle = RED; ctx.fill();
        text(P.phoneHead || 'AI ALERT', x0 + w / 2, y0 + 27, 'display', 28, '#ffffff');
        snapshot(x0, y0 + 66, w, 150, 0.6 + 0.4 * Math.sin(t * 8), 0);
      });
    }
  } else if (mode === 'cancel') {
    const tTimer = at(P.timerCue, 0.1), tCancel = at(P.cancelCue, 2.9), tChips = at(P.chipsCue, 4.6), tMiss = at(P.missCue, 6.9), tSend = at(P.sendCue, 8.3);
    const shift = H.easeInOutCubic(clamp((t - (tMiss - 1.4)) / 1.0));
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04 }]);
    const W = K.world.office(ctx, { t, time: 'night' });
    // left: safety staffer at a monitor
    const dim = 1 - 0.45 * shift;
    ctx.save(); ctx.globalAlpha = dim;
    K.drawDesk(ctx, 300, 1035, 1.25);
    // monitor
    roundRect(ctx, 160, 640, 300, 210, 16); ctx.fillStyle = '#1a1f36'; ctx.fill();
    roundRect(ctx, 290, 850, 40, 50, 6); ctx.fillStyle = '#2b3150'; ctx.fill();
    snapshot(176, 656, 268, 178, t < tCancel ? 0.6 + 0.4 * Math.sin(t * 8) : 1 - fade(tCancel), fade(tChips - 0.2));
    K.drawPerson(ctx, 190, 1035, 1.35, { t, pose: 'sit', mood: t > tChips ? 'happy' : 'neutral', skin: 0, hair: 2, hairStyle: 'bun', shirt: '#4d6ab0', seed: 5, flip: false, look: 0.6 });
    ctx.restore();
    // timer pill
    const secs = Math.min(118, Math.max(0, (t - tTimer) / Math.max(0.5, tCancel - tTimer) * 118));
    const mm = Math.floor(secs / 60), ss = String(Math.floor(secs % 60)).padStart(2, '0');
    ctx.save(); ctx.globalAlpha = 1 - fade(tMiss - 1.4, 0.4); pill(310, 600, pop(tTimer), `${mm}:${ss}  ·  under 2 min`, { size: 28, dot: true }); ctx.restore();
    if (t > tCancel) K.drawStamp(ctx, 310, 900, 0.85 * (1 - 0.3 * shift), { kind: 'check', text: P.cancelStamp || 'CANCELED', land: (t - tCancel) / 0.5 });
    if (t > tChips) { ctx.save(); ctx.globalAlpha = dim; pill(310, 975, pop(tChips), P.chips || "It's chips", { size: 30, accent: true }); ctx.restore(); }
    // right: principal with a phone; phone card shows ALERT + CANCELED; cancel is missed
    const px = lerp(1250, 760, shift);
    if (shift > 0) {
      K.drawPerson(ctx, px, 1035, 1.4, { t, pose: 'phone', mood: 'neutral', skin: 1, hair: 3, hairStyle: 'long', shirt: '#8a5ab0', seed: 13, typing: t > tSend - 0.6 && t < tSend + 0.4 ? 1 : 0 });
      pill(487, 470, pop(tMiss - 1.0), P.lawsuitPill || 'The lawsuit says', { size: 28, accent: true });
      phoneCard(lerp(1200, 690, shift), 700, 300, 330, shift, (x0, y0, w) => {
        roundRect(ctx, x0, y0, w, 52, 12); ctx.fillStyle = RED; ctx.fill();
        text('AI ALERT', x0 + w / 2, y0 + 27, 'display', 26, '#ffffff');
        snapshot(x0, y0 + 62, w, 110, 1, 0);
        const ca = 1 - 0.65 * fade(tMiss);
        ctx.globalAlpha = ca;
        roundRect(ctx, x0, y0 + 186, w, 52, 12); ctx.fillStyle = GREEN; ctx.fill();
        text('CANCELED', x0 + w / 2, y0 + 213, 'display', 26, '#0d2a1a');
        ctx.globalAlpha = 1;
        if (t > tMiss) {
          // "missed" marker: eye with a slash
          const ea = fade(tMiss, 0.3), ex = x0 + w - 10, ey = y0 + 186;
          ctx.globalAlpha = ea; ctx.beginPath(); ctx.arc(ex, ey, 26, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
          ctx.beginPath(); ctx.ellipse(ex, ey, 16, 9, 0, 0, Math.PI * 2); ctx.strokeStyle = '#151a2e'; ctx.lineWidth = 4; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ex - 16, ey + 12); ctx.lineTo(ex + 16, ey - 12); ctx.strokeStyle = RED; ctx.stroke();
          ctx.globalAlpha = 1;
        }
      });
      if (t > tMiss) pill(690, 900, pop(tMiss + 0.1) * shift, P.missed || 'Cancel missed', { size: 26 });
      // screenshot flies from the phone to the officer pill (top right)
      const fk = clamp((t - tSend) / 0.9);
      const oa = pop(tSend + 0.5);
      if (oa > 0) {
        pill(270, 600, oa, P.officer || 'School resource officer', { size: 28, dot: true });
      }
      if (t > tSend) {
        const e = H.easeInOutCubic(fk), fx = lerp(690, 270, e), fy = lerp(640, 660, e) - Math.sin(e * Math.PI) * 120;
        ctx.save(); ctx.translate(fx, fy); ctx.rotate(-0.15 * Math.sin(e * Math.PI)); const s = lerp(1, 0.55, e);
        ctx.scale(s, s); roundRect(ctx, -90, -60, 180, 120, 12); ctx.fillStyle = '#f4f1e8'; ctx.fill();
        snapshot(-80, -50, 160, 100, 1, 0); ctx.restore();
      }
    }
  } else if (mode === 'police') {
    const tPass = at(P.passCue, 0.1), tCars = at(P.carsCue, 2.1), tSuit = at(P.suitCue, 3.9), tKneel = at(P.kneelCue, 7.2), tFound = at(P.foundCue, 9.6);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.06, x: 480, y: 760 }]);
    const wash = fade(tCars - 0.8, 0.8);
    const S = school('night', wash);
    // radio wave from the top (dispatch)
    if (t < tCars + 0.5) {
      const ra = pop(tPass) * (1 - fade(tCars + 0.2));
      for (let k = 0; k < 3; k++) { const r = 30 + ((t * 80 + k * 40) % 120); ctx.beginPath(); ctx.arc(860, 690, r, Math.PI * 0.75, Math.PI * 1.25); ctx.strokeStyle = rgba(ACC, ra * (1 - r / 150)); ctx.lineWidth = 6; ctx.stroke(); }
      pill(740, 600, ra, 'County police', { size: 28 });
    }
    // count pill
    pill(487, 470, pop(tCars - 0.1), P.cars || 'Police cars arrive', { size: 30, dot: true });
    pill(487, 545, pop(tSuit), P.lawsuitPill || 'The lawsuit says', { size: 26, accent: true });
    // tiny officers at the cars (distant, arms down)
    for (let i = 0; i < 4; i++) { const oa = fade(tSuit + 0.3 + i * 0.15, 0.4); if (oa <= 0) continue; ctx.save(); ctx.globalAlpha = oa; officer(190 + i * 220, 1004, 0.55, { look: -0.3 }); ctx.restore(); }
    // cruisers roll in far back (on the road, small) - six, staggered
    const carSlots = [[110, 0.5], [270, 0.56], [430, 0.5], [600, 0.55], [760, 0.5], [900, 0.54]];
    for (let i = 0; i < 6; i++) {
      const arr = tCars - 0.9 + i * 0.22, k = H.easeOutCubic(clamp((t - arr) / 0.8));
      if (k <= 0) continue;
      const [cx, s] = carSlots[i];
      policeCar(lerp(cx + 700, cx, k), 1000 - (i % 2) * 8, s, true, true);
    }
    // teens in front: hands up after "lawsuit", cuffs after "knees"
    const xs = [170, 320, 660, 810], FEET = S.feet + 10;
    for (let i = 0; i < 4; i++) {
      const up = t > tSuit + 0.6;
      teen(i, xs[i], FEET, 1.18, { pose: up && t < tKneel + 0.3 ? 'cheer' : 'stand', mood: 'worried', look: 0, t: up ? 0 : t });
    }
    pill(487, 620, pop(tKneel), 'Handcuffed and searched', { size: 28 });
    // bag on the ground (spotlit at the end)
    const sp = fade(tFound - 0.4, 0.6);
    if (sp > 0) {
      ctx.save(); ctx.globalAlpha = sp; const g = ctx.createRadialGradient(487, 1000, 10, 487, 1000, 260);
      g.addColorStop(0, 'rgba(255,240,200,0.45)'); g.addColorStop(1, 'rgba(255,240,200,0)'); ctx.fillStyle = g; ctx.fillRect(220, 740, 540, 520); ctx.restore();
    }
    bag(490, 1020, 1.3, -0.4);
    if (t > tFound) K.drawStamp(ctx, 490, 930, 0.85, { kind: 'cross', text: P.found || 'NO GUN', land: (t - tFound) / 0.5 });
  } else if (mode === 'lawsuit') {
    const tSch = at(P.schoolCue, 1.2), tPol = at(P.policeCue, 2.3), tMak = at(P.makerCue, 3.1), tDam = at(P.damagesCue, 5.7), tOrd = at(P.orderCue, 6.9);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 487, y: 740 }]);
    K.world.courtroom(ctx, { t });
    // the complaint lands on the bench (already in the air at t=0)
    const land = H.easeOutBack(clamp((t + 0.2) / 0.7));
    ctx.save(); ctx.translate(487, lerp(300, 610, land)); ctx.rotate(lerp(-0.3, -0.04, land));
    roundRect(ctx, -170, -130, 340, 230, 14); ctx.fillStyle = '#f4f1e8'; ctx.fill();
    text(P.docHead || 'LAWSUIT', 0, -84, 'display', 46, '#1f2444');
    text(P.docSub || 'Filed: date', 0, -38, 'ui', 26, '#5267b8');
    ctx.strokeStyle = '#9aa3c4'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-130, 6 + i * 22); ctx.lineTo(130 - (i === 3 ? 90 : 20 * H.hash(i, 2)), 6 + i * 22); ctx.stroke(); }
    ctx.restore();
    // defendants: three tiles
    const defs = P.defendants || ['School system', 'Police', 'AI maker'];
    const dc = [tSch, tPol, tMak];
    text('SUING', 487, 770, 'display', 28, rgba('#ffffff', fade(tSch - 0.3)));
    for (let i = 0; i < 3; i++) {
      const p = pop(dc[i] - 0.05, 0.5); if (p <= 0) continue;
      const x = 205 + i * 282, y = 850;
      ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
      panel(-128, -52, 256, 104, 0.95, i === 2 ? ACC : null);
      ctx.restore();
      ctx.save(); ctx.globalAlpha = clamp(p);
      const words = defs[i].split(' · ');
      if (words.length > 1) { text(words[0], x, y - 16, 'display', 28, '#ffffff', 'center', 230); text(words[1], x, y + 22, 'ui', 22, ACC, 'center', 230); }
      else text(defs[i], x, y, 'display', 28, '#ffffff', 'center', 230);
      ctx.restore();
    }
    // asks
    const asks = P.asks || ['Damages', 'Court order'];
    const pa = pop(tDam), pb = pop(tOrd);
    if (pa > 0) { pill(240, 1000, pa, asks[0], { size: 28, accent: true }); for (let k = 0; k < 3; k++) K.drawCoin(ctx, 95 + k * 20, 990 - k * 6, 0.55 * pa, { spin: t * 3 + k }); }
    if (pb > 0) {
      ctx.save(); ctx.translate(640, 965); ctx.scale(pb, pb);
      panel(-250, -45, 500, 90, 0.95, ACC);
      K.drawLock(ctx, -205, 30, 0.42, { open: 0 });
      ctx.restore();
      ctx.save(); ctx.globalAlpha = clamp(pb);
      text('Court order:', 675, 945, 'ui', 22, ACC, 'center', 380);
      text('system off until proper training', 675, 980, 'display', 26, '#ffffff', 'center', 400);
      ctx.restore();
    }
  } else if (mode === 'number') {
    const tWatch = at(P.watchCue, 1.2), tCount = at(P.countCue, 2.6), tFalse = at(P.falseCue, 5.8);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05 }]);
    K.world.room(ctx, { t, time: 'night', lamp: false, window: false, picture: false, plant: false });
    // wall of 100 alert tiles
    const N = 10, cell = 40, gx = 487 - (N * cell) / 2, gyy = 520;
    const flipStart = tCount - 0.2, flipDur = Math.max(1.2, tFalse - tCount + 0.6);
    for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
      const idx = r * N + c, keep = idx === 67;
      const appear = pop(0.05 + (r + c) * 0.025, 0.35); if (appear <= 0) continue;
      const order = H.hash(idx, 77), fl = keep ? 0 : clamp((t - flipStart - order * flipDur) / 0.25);
      const x = gx + c * cell, y = gyy + r * cell;
      ctx.save(); ctx.translate(x + cell / 2, y + cell / 2); ctx.scale(appear * (1 - 0.5 * Math.sin(fl * Math.PI)), appear);
      roundRect(ctx, -16, -16, 32, 32, 7);
      ctx.fillStyle = keep ? ACC : fl > 0.5 ? '#3b4160' : RED; ctx.fill();
      if (keep) { ctx.restore(); H.glow(ctx, x + cell / 2, y + cell / 2, 50, ACC, 0.4 + 0.2 * Math.sin(t * 4)); continue; }
      ctx.strokeStyle = fl > 0.5 ? '#6b7395' : '#ffffff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      if (fl > 0.5) { ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, 6); ctx.moveTo(6, -6); ctx.lineTo(-6, 6); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(0, -8); ctx.lineTo(0, 2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 8, 2.5, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill(); }
      ctx.restore();
    }
    // count-up
    const v = K.countUp(99, t, tCount - 0.1, 0.7, 0);
    if (t > tCount - 0.1) {
      const p = pop(tCount - 0.1);
      ctx.save(); ctx.translate(487, 1000); ctx.scale(p, p);
      panel(-370, -80, 740, 160, 0.94, ACC);
      text(`>${Math.round(v)}%`, -185, 0, 'display', 96, ACC);
      ctx.restore();
      ctx.save(); ctx.globalAlpha = clamp(p);
      text('of alerts were', 650, 955, 'ui', 28, '#ffffff', 'center', 300);
      text('false positives', 650, 998, 'display', 36, fade(tFalse) > 0 ? ACC : '#ffffff', 'center', 300);
      text('no police needed', 650, 1040, 'ui', 26, rgba('#ffffff', 0.8), 'center', 300);
      ctx.restore();
    }
    pill(487, 470, pop(tWatch - 0.6), P.pctBy || 'Per source', { size: 26, accent: true });
    pill(487, 520, pop(tWatch - 0.4), P.pctBy2 || 'report name', { size: 26, accent: true });
  } else if (mode === 'caveat') {
    const tCourt = at(P.courtCue, 0.6), tQuote = at(P.quoteCue, 2.4);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05 }]);
    K.world.courtroom(ctx, { t });
    // gavel hovering, never struck
    const hov = 0.15 + 0.08 * Math.sin(t * 2.5);
    K.drawGavel(ctx, 487, 640, 1.1, { hit: hov });
    pill(487, 470, pop(tCourt), P.notProven || 'Allegations: not proven in court', { size: 30, dot: true });
    // camera pole at the side, head slightly bowed
    const lens = camPole(860, 700, 1040, false, [700, 900]);
    // quote panel
    const qp = pop(tQuote - 0.2, 0.5);
    if (qp > 0) {
      ctx.save(); ctx.translate(487, 860); ctx.scale(qp, qp);
      panel(-400, -125, 800, 250, 0.96, ACC);
      ctx.restore();
      ctx.save(); ctx.globalAlpha = clamp(qp);
      const q = P.quote || '“Quote goes here.”';
      const lines = H.wrap(ctx, q, 'display', 38, 700);
      lines.forEach((ln, i) => text(ln, 487, 790 + i * 46 - (lines.length - 3) * 23, 'display', 38, '#ffffff'));
      text(P.by || 'Company, to outlet', 487, 950, 'ui', 26, ACC);
      ctx.restore();
    }
  }
  ctx.restore();
}
