// Scene "robot-orders" (full frame, one module, several modes). A generic factory floor at dusk (tall windows, steel
// trusses, hanging lamps, safety lines). Industrial robot arms arrive in wooden crates and unfold. No logos, no brands;
// people are generic kit cartoons. Built for "companies ordered N robots" / robot-adoption / factory-automation stories.
// modes:
//   hook    (cold open, best as a 2-beat span): a box truck at the loading dock; crates already sliding down the ramp at
//           frame 0, landing in rows, lids pop and robot arms unfold and start working; a counter panel ticks to
//           `count` ("ROBOTS ORDERED"). Later on cues: a period pill (dateCue), a value pill (valueCue), source pill
//           (srcCue).
//   number  two crate stacks on pedestals ("before" vs "now"); crates drop onto the "now" stack until it is taller;
//           a growth badge (`pct`, pctCue), a second smaller pill (`sub`, subCue) and a ribbon (`ribbon`, ribbonCue).
//   sectors three work stations with sign cards (label + growth %), each lights on its cue: new arms drop in or a
//           sleeping arm wakes up (`wake: true`), product shapes ride a short conveyor (part|chip|car).
//   cobot   close-up bench: a cartoon worker and a small cobot arm passing parts; a stat card (cobot count + %), a
//           "built to work next to people" ring (nextCue), then a HELP WANTED board with empty stations and an
//           attributed pill (`why`, whyCue).
//   caveat  sealed crates on the floor with a tag (`tag`, tagCue); a "things to watch" header + 3 risk pills with
//           icons (coin / globe / clock) on cues; a worker shrugs and a jobs card (`jobs`, jobsCue) pops.
// params (all optional, generic defaults): mode, count (10989), countLabel, date, value, src, before, now, pct,
//   pctLabel, sub, ribbon, stations [{label, pct, kind, add, wake, cue}], cobots, cobotsLabel, cobotPct, next,
//   help, why, tag, watchHead, risks [{text, icon, cue}], jobs; cues: dateCue, valueCue, srcCue, pctCue, subCue,
//   ribbonCue, nextCue, statCue, helpCue, whyCue, tagCue, jobsCue. Cue = narration word ("word#n" = (n+1)th time)
//   or a number of seconds; without them fixed fractions of the scene are used.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent;
  const mode = P.mode || 'hook';
  const cue = (w, d) => {
    if (typeof w === 'number') return w;
    if (!w) return d;
    const m = String(w).match(/^(.*)#(\d+)$/);
    const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? d : v;
  };
  const ARM = '#ff9a3c', ARM_S = '#d9731f', ARM_D = '#9c4f12', STEEL = '#3a4170', STEEL_D = '#262b4f';

  // ------------------------------------------------------------------ helpers
  function rr(x, y, w, h, r, fill) { H.roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); }
  function text(str, x, y, kind, size, color, align = 'center', base = 'middle') {
    ctx.font = H.font(kind, size); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(str, x, y);
  }
  function fitted(str, x, y, kind, max, min, maxW, color, align = 'center') {
    const ft = H.fitText(ctx, str, kind, max, min, maxW); ctx.font = ft.font; ctx.fillStyle = color;
    ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
  }
  function card(cx, cy, w, h, pop, fn, opts = {}) {
    if (pop <= 0) return;
    ctx.save(); ctx.translate(cx, cy); const s = Math.min(1.04, pop); ctx.scale(s, s);
    ctx.globalAlpha *= clamp(pop * 2);
    rr(-w / 2, -h / 2, w, h, opts.r || 24, opts.fill || 'rgba(8,10,24,0.88)');
    ctx.lineWidth = 2; ctx.strokeStyle = opts.stroke || H.rgba(ACC, 0.4); H.roundRect(ctx, -w / 2, -h / 2, w, h, opts.r || 24); ctx.stroke();
    fn(w, h);
    ctx.restore();
  }

  // factory interior (paints the whole frame)
  function factory(dim = 0) {
    const g = ctx.createLinearGradient(0, 0, 0, 1920);
    g.addColorStop(0, '#151a3a'); g.addColorStop(0.45, '#232a57'); g.addColorStop(0.53, '#1b2147'); g.addColorStop(1, '#0b0d1d');
    ctx.fillStyle = g; ctx.fillRect(-300, -300, 1680, 2520);
    // tall windows with a dusk glow
    for (let i = 0; i < 5; i++) {
      const x = 40 + i * 215;
      const wg = ctx.createLinearGradient(0, 300, 0, 760);
      wg.addColorStop(0, '#ff9f6b'); wg.addColorStop(0.55, '#7b4f8f'); wg.addColorStop(1, '#30305f');
      ctx.globalAlpha = 0.55; rr(x, 300, 150, 460, 10, wg); ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(20,24,52,0.9)';
      ctx.fillRect(x + 72, 300, 6, 460); for (let r = 1; r < 4; r++) ctx.fillRect(x, 300 + r * 115, 150, 5);
    }
    // trusses
    ctx.fillStyle = STEEL_D; ctx.fillRect(-300, 250, 1680, 34);
    ctx.strokeStyle = STEEL; ctx.lineWidth = 6;
    for (let i = -2; i < 14; i++) { ctx.beginPath(); ctx.moveTo(i * 90, 284); ctx.lineTo(i * 90 + 45, 250); ctx.lineTo(i * 90 + 90, 284); ctx.stroke(); }
    // hanging lamps
    for (let i = 0; i < 4; i++) {
      const x = 150 + i * 260;
      ctx.fillStyle = '#4a5288'; ctx.fillRect(x - 2, 284, 4, 90);
      ctx.beginPath(); ctx.moveTo(x - 34, 396); ctx.lineTo(x + 34, 396); ctx.lineTo(x + 16, 372); ctx.lineTo(x - 16, 372); ctx.closePath(); ctx.fillStyle = '#5a63a0'; ctx.fill();
      K.glow(ctx, x, 410, 150, '#ffe2a8', 0.16);
    }
    // back wall base + floor
    ctx.fillStyle = '#20264f'; ctx.fillRect(-300, 780, 1680, 70);
    const fg = ctx.createLinearGradient(0, 850, 0, 1300);
    fg.addColorStop(0, '#2b3266'); fg.addColorStop(1, '#141836');
    ctx.fillStyle = fg; ctx.fillRect(-300, 850, 1680, 1200);
    // safety lines (perspective-ish)
    ctx.fillStyle = 'rgba(255,214,70,0.55)';
    ctx.fillRect(-300, 1040, 1680, 8);
    for (let i = 0; i < 16; i++) { ctx.save(); ctx.translate(-300 + i * 110, 1048); ctx.fillStyle = i % 2 ? '#1c1f38' : 'rgba(255,214,70,0.55)'; ctx.fillRect(0, 0, 110, 12); ctx.restore(); }
    if (dim > 0) { ctx.fillStyle = `rgba(6,8,20,${dim})`; ctx.fillRect(-300, -300, 1680, 2520); }
  }

  // industrial robot arm, anchored bottom-centre. o.unfold 0..1, o.work 0..1 (motion), o.sleep (grey, dark LED)
  function robotArm(x, y, s, o = {}) {
    const u = clamp(o.unfold == null ? 1 : o.unfold), wk = (o.work || 0) * u, tt = o.t || t, ph = o.phase || 0;
    const sleep = clamp(o.sleep || 0);
    const body = H.mixHex(ARM, '#7d8296', sleep), bodyS = H.mixHex(ARM_S, '#5d6276', sleep), bodyD = H.mixHex(ARM_D, '#3d4156', sleep);
    ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
    if (o.shadow !== false) K.shadow(ctx, 0, 0, 120, 0.35);
    rr(-55, -26, 110, 26, 8, STEEL_D); rr(-42, -46, 84, 24, 10, bodyD);
    const sw = Math.sin((tt + ph) * 2.2) * wk, sw2 = Math.sin((tt + ph) * 2.2 + 1.3) * wk;
    const a1 = lerp(-0.12, -1.18, H.easeOutBack(u)) + 0.18 * sw;
    const L1 = 120, L2 = 104;
    const sx = 0, sy = -50;
    const ex = sx + Math.cos(a1) * L1, ey = sy + Math.sin(a1) * L1;
    const a2 = a1 + lerp(2.75, 1.45, H.easeOutCubic(u)) + 0.25 * sw2;
    const hx = ex + Math.cos(a2) * L2, hy = ey + Math.sin(a2) * L2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = bodyS; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.strokeStyle = body; ctx.lineWidth = 24; ctx.beginPath(); ctx.moveTo(sx - 3, sy - 3); ctx.lineTo(ex - 3, ey - 3); ctx.stroke();
    ctx.strokeStyle = bodyS; ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.strokeStyle = body; ctx.lineWidth = 17; ctx.beginPath(); ctx.moveTo(ex - 2, ey - 2); ctx.lineTo(hx - 2, hy - 2); ctx.stroke();
    // joints
    for (const [jx, jy, r] of [[sx, sy, 24], [ex, ey, 19]]) {
      ctx.beginPath(); ctx.arc(jx, jy, r, 0, Math.PI * 2); ctx.fillStyle = bodyD; ctx.fill();
      ctx.beginPath(); ctx.arc(jx, jy, r * 0.45, 0, Math.PI * 2); ctx.fillStyle = sleep > 0.5 ? '#2c3150' : ACC; ctx.fill();
    }
    if (sleep < 0.5) K.glow(ctx, ex, ey, 30, ACC, 0.25 * u);
    // gripper
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(a2);
    rr(-4, -14, 26, 28, 6, bodyD);
    const g = 6 + 6 * (0.5 + 0.5 * Math.sin((tt + ph) * 4.4)) * wk;
    ctx.fillStyle = '#c9cede'; ctx.fillRect(20, -g - 8, 22, 7); ctx.fillRect(20, g + 1, 22, 7);
    ctx.restore();
    ctx.restore();
  }

  // wooden crate 160x120 anchored bottom-centre; o.open 0..1 (panels fall away), o.label
  function crate(x, y, s, o = {}) {
    const op = clamp(o.open || 0);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (o.shadow !== false) K.shadow(ctx, 0, 0, 170, 0.35);
    const fall = H.easeInOutCubic(op);
    // side panels fall outward
    ctx.globalAlpha *= 1 - fall;
    ctx.save(); ctx.translate(-80, 0); ctx.rotate(-fall * 1.2); rr(0, -120, 160, 120, 6, '#b07a45');
    ctx.fillStyle = '#8c5d33'; for (let i = 0; i < 3; i++) ctx.fillRect(0, -116 + i * 40, 160, 6);
    ctx.strokeStyle = '#6e4626'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(8, -112); ctx.lineTo(152, -8); ctx.stroke();
    ctx.fillStyle = 'rgba(20,22,40,0.7)'; ctx.font = H.font('display', 22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(o.label || 'ROBOT', 80, -62);
    ctx.restore();
    // lid flips up and away
    ctx.save(); ctx.translate(-84 + fall * 40, -124 - fall * 120); ctx.rotate(-fall * 0.9); rr(0, -14, 168, 16, 5, '#c58d55'); ctx.restore();
    ctx.restore();
  }

  // box truck, rear door on the left at x, floor of the cargo bay at y (no livery)
  function truck(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 210, 150, 520, 0.35);
    rr(0, -230, 420, 240, 14, '#dfe3ef'); rr(0, -230, 420, 26, 12, '#f2f4fa');
    rr(0, -214, 18, 220, 6, '#a9afc4');
    rr(18, -200, 90, 196, 6, '#232849'); // open rear: dark bay
    rr(420, -150, 150, 160, 18, '#c9cfe2'); rr(450, -134, 90, 60, 10, '#6c86c9');
    for (const wx of [90, 330, 500]) { ctx.beginPath(); ctx.arc(wx, 14, 40, 0, Math.PI * 2); ctx.fillStyle = '#151827'; ctx.fill(); ctx.beginPath(); ctx.arc(wx, 14, 16, 0, Math.PI * 2); ctx.fillStyle = '#8d93a8'; ctx.fill(); }
    ctx.restore();
  }

  function counterPanel(cx, cy, value, label, pop) {
    card(cx, cy, 640, 168, pop, (w, h) => {
      fitted(label, 0, -h / 2 + 34, 'ui', 26, 18, w - 60, H.rgba('#ffffff', 0.78));
      const ft = H.fitText(ctx, value, 'display', 96, 50, w - 60); ctx.font = ft.font; ctx.fillStyle = ACC;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(value, 0, 22);
    });
  }
  const fmt = (n) => Math.round(n).toLocaleString('en-US');

  ctx.save();

  // =================================================================== HOOK
  if (mode === 'hook') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.06, x: 470, y: 760 }]);
    factory();
    truck(720, 905, 0.95);
    // ramp from the truck bay down to the floor
    ctx.beginPath(); ctx.moveTo(700, 905); ctx.lineTo(735, 905); ctx.lineTo(640, 1020); ctx.lineTo(590, 1020); ctx.closePath();
    ctx.fillStyle = '#5a6290'; ctx.fill();
    // slots: back row (smaller), front row
    const slots = [
      { x: 230, y: 905, s: 0.62 }, { x: 395, y: 905, s: 0.62 }, { x: 560, y: 905, s: 0.62 },
      { x: 160, y: 1015, s: 0.82 }, { x: 330, y: 1015, s: 0.82 }, { x: 500, y: 1015, s: 0.82 },
    ];
    const order = [5, 2, 4, 1, 3, 0];               // which slot each arriving crate goes to
    const ARR = 0.62, T0 = -0.75;                   // crate k leaves the truck at T0 + k*ARR (first one is mid-way at t=0)
    const items = order.map((slot, k) => {
      const st = T0 + k * ARR, u = t - st, S = slots[slot];
      let x, y, s, open = 0, unfold = 0;
      if (u < 0) return null;
      if (u < 0.42) { const v = H.easeInOutCubic(u / 0.42); x = lerp(735, 640, v); y = lerp(905, 1018, v); s = lerp(0.55, 0.78, v); }
      else if (u < 0.95) { const v = H.easeOutCubic((u - 0.42) / 0.53); x = lerp(640, S.x, v); y = lerp(1018, S.y, v); s = lerp(0.78, S.s, v); }
      else { x = S.x; y = S.y; s = S.s; open = clamp((u - 1.0) / 0.45); unfold = clamp((u - 1.15) / 0.75); }
      return { x, y, s, open, unfold, k, settled: u >= 0.95 };
    }).filter(Boolean);
    items.sort((a, b) => a.y - b.y);
    for (const it of items) {
      if (it.unfold > 0) robotArm(it.x, it.y - 4 * it.s, it.s * 1.05, { unfold: it.unfold, work: clamp((it.unfold - 0.8) * 5), phase: it.k * 0.9 });
      if (it.open < 1) crate(it.x, it.y, it.s, { open: it.open });
    }
    // dock worker with a clipboard, watching
    K.drawPerson(ctx, 70, 1030, 1.0, { t, pose: 'point', mood: 'happy', shirt: 2, hairStyle: 'short', seed: 3 });

    ctx.restore(); ctx.save();
    // counter panel (not under the camera, so it stays put)
    const count = P.count != null ? +P.count : 10989;
    const cv = count * H.easeOutCubic(clamp((t + 0.25) / 2.6));
    counterPanel(487, 520, fmt(cv), P.countLabel || 'ROBOTS ORDERED · NORTH AMERICA', K.popIn(t, 0, 0.3) || 1);
    const dT = cue(P.dateCue, D * 0.25), vT = cue(P.valueCue, D * 0.6), sT = cue(P.srcCue, D * 0.8);
    const dp = K.popIn(t, dT, 0.4), vp = K.popIn(t, vT, 0.45), sp = K.popIn(t, sT, 0.4);
    if (dp > 0) K.drawLabel(ctx, 300, 680, dp, { text: P.date || 'July – Sept. 2026', size: 28, dot: true });
    if (vp > 0) K.drawLabel(ctx, 660, 680, vp, { text: P.value || '$723.5 million', size: 34, accent: true });
    if (sp > 0) K.drawLabel(ctx, 487, 760, sp, { text: P.src || 'Source: A3, robotics industry group', size: 24 });
  }

  // =================================================================== NUMBER
  else if (mode === 'number') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.05, x: 500, y: 740 }]);
    factory(0.35);
    const pT = cue(P.pctCue, D * 0.35), sbT = cue(P.subCue, D * 0.5), rT = cue(P.ribbonCue, D * 0.62);
    const CH = 46, CW = 150;
    const stacks = [
      { x: 220, n: 8, label: P.before || 'July–Sept. 2025', hot: false },
      { x: 440, n: 10, label: P.now || 'July–Sept. 2026', hot: true },
    ];
    for (const S of stacks) {
      // pedestal
      rr(S.x - 110, 960, 220, 56, 12, S.hot ? H.mixHex(ACC, '#1a1d36', 0.55) : '#2c3263');
      fitted(S.label, S.x, 988, 'bold', 26, 16, 200, '#ffffff');
      for (let i = 0; i < S.n; i++) {
        let y = 960 - i * CH, a = 1;
        if (S.hot) {
          const land = 0.15 + i * 0.16 + (i >= 8 ? Math.max(0, pT - 1.6 - 0.15) : 0);
          const v = clamp((t - land) / 0.35); if (v <= 0) continue;
          y -= (1 - H.easeOutCubic(v)) * 380; a = clamp(v * 3);
        } else {
          const v = K.popIn(t, i * 0.03, 0.3); if (v <= 0) continue; a = clamp(v);
        }
        ctx.save(); ctx.globalAlpha = a;
        rr(S.x - CW / 2, y - CH + 3, CW, CH - 4, 6, S.hot && i >= 8 ? H.mixHex('#b07a45', ACC, 0.35) : '#b07a45');
        ctx.fillStyle = '#8c5d33'; ctx.fillRect(S.x - CW / 2, y - CH + 3 + 18, CW, 5);
        ctx.fillStyle = 'rgba(30,20,10,0.45)'; ctx.font = H.font('display', 18); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('ROBOT', S.x, y - CH / 2 + 2);
        ctx.restore();
      }
    }
    // an arm next to the taller stack, cheering motion
    robotArm(700, 1015, 0.8, { unfold: 1, work: 1, phase: 0.4 });
    ctx.restore(); ctx.save();
    // growth badge
    const bp = K.popIn(t, pT, 0.45);
    card(700, 600, 300, 150, bp, (w, h) => {
      const pct = P.pct || '+24.8%';
      const num = parseFloat(pct.replace(/[^\d.]/g, '')) || 0;
      const shown = t > pT + 1.1 ? pct : '+' + (num * H.easeOutCubic(clamp((t - pT) / 1.1))).toFixed(1) + '%';
      text(shown, 0, -14, 'display', 64, ACC);
      fitted(P.pctLabel || 'robots ordered vs. 2025', 0, 42, 'ui', 22, 16, w - 30, '#ffffff');
    });
    const sbp = K.popIn(t, sbT, 0.4);
    if (sbp > 0) K.drawLabel(ctx, 700, 740, sbp, { text: P.sub || 'Value: +26.1%', size: 28, dot: true });
    // ribbon across the top
    const rp = K.popIn(t, rT, 0.5);
    if (rp > 0) {
      ctx.save(); ctx.translate(487, 470); ctx.scale(Math.min(1.03, rp), Math.min(1.03, rp)); ctx.globalAlpha = clamp(rp * 2);
      const w = 700, h = 76;
      ctx.beginPath(); ctx.moveTo(-w / 2 - 30, -h / 2 + 10); ctx.lineTo(-w / 2, -h / 2 + 10); ctx.lineTo(-w / 2, h / 2 + 10); ctx.lineTo(-w / 2 - 30, h / 2 + 10); ctx.lineTo(-w / 2 - 14, 10); ctx.closePath();
      ctx.fillStyle = H.mixHex(ACC, '#000000', 0.35); ctx.fill();
      ctx.save(); ctx.scale(-1, 1); ctx.fill(); ctx.restore();
      rr(-w / 2, -h / 2, w, h, 12, ACC);
      fitted(P.ribbon || 'Strongest quarter of 2026 so far', 0, 1, 'display', 36, 22, w - 40, '#141829');
      ctx.restore();
    }
  }

  // =================================================================== SECTORS
  else if (mode === 'sectors') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.04, x: 487, y: 745 }]);
    factory(0.15);
    const st = P.stations || [
      { label: 'Car parts makers', pct: '+90.4%', kind: 'part', add: 1, cue: D * 0.18 },
      { label: 'Chips & electronics', pct: '+97.6%', kind: 'chip', add: 1, cue: D * 0.4 },
      { label: 'Carmakers', pct: '+7.5%', kind: 'car', wake: true, cue: D * 0.68 },
    ];
    const XS = [237, 487, 737];
    const times = st.map((s, i) => cue(s.cue, D * (0.18 + 0.25 * i)));
    st.forEach((S, i) => {
      const x = XS[i], on = clamp((t - times[i]) / 0.5);
      // conveyor table
      rr(x - 112, 960, 224, 22, 10, '#3b4170'); ctx.fillStyle = '#2a2f55'; ctx.fillRect(x - 100, 982, 14, 34); ctx.fillRect(x + 86, 982, 14, 34);
      const speed = 30 + 60 * on;
      ctx.save(); H.roundRect(ctx, x - 112, 900, 224, 62, 0); ctx.clip();
      for (let k = 0; k < 4; k++) {
        const px = x - 150 + ((k * 80 + t * speed) % 320), py = 960;
        if (S.kind === 'chip') { rr(px - 20, py - 30, 40, 30, 4, '#3d8a6d'); rr(px - 10, py - 22, 20, 14, 2, '#1c2a24'); }
        else if (S.kind === 'car') { rr(px - 30, py - 22, 60, 20, 8, '#6c86c9'); rr(px - 16, py - 36, 32, 16, 6, '#8aa0d8'); }
        else { ctx.beginPath(); ctx.arc(px, py - 18, 16, 0, Math.PI * 2); ctx.fillStyle = '#9aa3c7'; ctx.fill(); ctx.beginPath(); ctx.arc(px, py - 18, 6, 0, Math.PI * 2); ctx.fillStyle = '#3b4170'; ctx.fill(); }
      }
      ctx.restore();
      // arms: one existing; new ones drop in on cue
      robotArm(x - 60, 958, 0.62, { unfold: 1, work: S.wake ? on : 0.5 + 0.5 * on, sleep: S.wake ? 1 - on : 0, phase: i * 1.7 });
      const add = S.add != null ? S.add : (S.wake ? 0 : 1);
      for (let a = 0; a < add; a++) {
        const v = clamp((t - times[i] - 0.15 - a * 0.25) / 0.45); if (v <= 0) continue;
        robotArm(x + 55, 958 - (1 - H.easeOutCubic(v)) * 300, 0.62, { unfold: clamp((v - 0.6) * 2.5), work: clamp((t - times[i] - 1) * 2), phase: i + 0.7, flip: true, shadow: v > 0.8 });
      }
      if (S.wake && on > 0 && on < 1) K.glow(ctx, x - 60, 860, 90, ACC, 0.4 * (1 - on));
    });
    ctx.restore(); ctx.save();
    // sign cards
    st.forEach((S, i) => {
      const x = XS[i], pop = K.popIn(t, Math.max(0.05, times[i] - 0.25), 0.45);
      card(x, 560, 226, 196, pop, (w, h) => {
        fitted(S.label, 0, -h / 2 + 40, 'bold', 26, 17, w - 26, '#ffffff');
        const num = parseFloat(String(S.pct).replace(/[^\d.]/g, '')) || 0;
        const v = H.easeOutCubic(clamp((t - times[i]) / 1.0));
        const shown = v >= 1 ? S.pct : '+' + (num * v).toFixed(1) + '%';
        text(shown, 0, 10, 'display', 50, ACC);
        // mini bar: last year (grey) vs this year (accent)
        const base = 70, now = base * (1 + num / 100) * v + base * (1 - v);
        rr(-60, h / 2 - 34, base * 0.75, 14, 7, 'rgba(255,255,255,0.25)');
        rr(-60, h / 2 - 16, Math.min(w - 50, now * 0.75), 14, 7, ACC);
      }, { stroke: H.rgba(ACC, 0.25 + 0.5 * clamp((t - times[i]) / 0.4)) });
    });
    const lp = K.popIn(t, 0.1, 0.4);
    if (lp > 0) K.drawLabel(ctx, 487, 730, lp, { text: P.head || 'Robot orders, July–Sept. vs. a year earlier', size: 24 });
    const wk = st.findIndex((s) => s.wake);
    if (wk >= 0) { const wp = K.popIn(t, times[wk] + 0.6, 0.4); if (wp > 0) K.drawLabel(ctx, XS[wk], 810, wp, { text: P.wakeLabel || 'Back to growth', size: 24, accent: true }); }
  }

  // =================================================================== COBOT
  else if (mode === 'cobot') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 487, y: 760 }, { t: D, zoom: 1.08, x: 470, y: 770 }]);
    factory(0.1);
    const sT = cue(P.statCue, 0.2), nT = cue(P.nextCue, D * 0.35), hT = cue(P.helpCue, D * 0.62), wT = cue(P.whyCue, D * 0.72);
    // help-wanted board on the wall (right), empty station outlines
    const hp = K.popIn(t, hT, 0.5);
    // bench
    rr(340, 880, 460, 26, 10, '#4a5288'); ctx.fillStyle = '#323866'; ctx.fillRect(360, 906, 18, 110); ctx.fillRect(762, 906, 18, 110);
    // worker on the left of the bench
    const handT = (t % 3.2) / 3.2;                       // part hand-off cycle
    K.drawPerson(ctx, 300, 1020, 1.3, { t, pose: 'stand', mood: t > nT ? 'happy' : 'neutral', shirt: 3, hairStyle: 'bun', skin: 2, look: 0.6, seed: 11, talk: 0 });
    // cobot on the bench (flipped to face the worker)
    robotArm(640, 880, 0.78, { unfold: 1, work: 1, phase: 0.2, flip: true });
    // a part travelling from the cobot's gripper zone to the worker's hand
    const v = H.easeInOutCubic(clamp((handT - 0.2) / 0.4));
    const px = lerp(560, 400, v), py = lerp(800, 870, v) - Math.sin(v * Math.PI) * 40;
    ctx.beginPath(); ctx.arc(px, py, 18, 0, Math.PI * 2); ctx.fillStyle = '#c9cede'; ctx.fill();
    ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fillStyle = '#3b4170'; ctx.fill();
    // shared-space ring on nextCue
    const rp = clamp((t - nT) / 0.6);
    if (rp > 0) {
      ctx.save(); ctx.setLineDash([14, 12]); ctx.lineDashOffset = -t * 30; ctx.lineWidth = 5; ctx.strokeStyle = H.rgba(ACC, 0.85 * rp);
      ctx.beginPath(); ctx.ellipse(470, 1010, 280 * H.easeOutBack(rp), 60 * H.easeOutBack(rp), 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    ctx.restore(); ctx.save();
    // stat card (top left)
    const cp = K.popIn(t, sT, 0.45);
    card(305, 530, 360, 190, cp, (w, h) => {
      fitted(P.cobotsLabel || 'COBOTS ORDERED', 0, -h / 2 + 34, 'ui', 24, 16, w - 40, H.rgba('#ffffff', 0.8));
      text(fmt((P.cobots != null ? +P.cobots : 1831) * H.easeOutCubic(clamp((t - sT) / 1.2))), 0, 6, 'display', 66, '#ffffff');
      const pc = K.popIn(t, cue(P.pctCue, sT + 1.0), 0.4);
      if (pc > 0) { ctx.save(); ctx.translate(0, h / 2 - 32); ctx.scale(pc, pc); rr(-110, -20, 220, 40, 20, ACC); text(P.cobotPct || 'up about 56%', 0, 1, 'ui', 24, '#141829'); ctx.restore(); }
    });
    const np = K.popIn(t, nT + 0.2, 0.4);
    if (np > 0) K.drawLabel(ctx, 487, 760, np, { text: P.next || 'Built to work next to people', size: 28, dot: true });
    // help wanted board (top right)
    card(690, 520, 300, 170, hp, (w, h) => {
      rr(-w / 2 + 16, -h / 2 + 16, w - 32, 50, 10, '#ffd64a');
      fitted(P.help || 'HELP WANTED', 0, -h / 2 + 42, 'display', 32, 20, w - 60, '#141829');
      for (let i = 0; i < 3; i++) {
        ctx.save(); ctx.setLineDash([8, 7]); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        H.roundRect(ctx, -w / 2 + 26 + i * 86, -h / 2 + 84, 70, 60, 10); ctx.stroke(); ctx.restore();
        ctx.beginPath(); ctx.arc(-w / 2 + 61 + i * 86, -h / 2 + 106, 9, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
        rr(-w / 2 + 47 + i * 86, -h / 2 + 118, 28, 18, 8, 'rgba(255,255,255,0.35)');
      }
    }, { stroke: 'rgba(255,214,74,0.6)' });
    const wp = K.popIn(t, wT, 0.45);
    if (wp > 0) K.drawLabel(ctx, 660, 680, wp, { text: P.why || 'FT: to ease labor shortages', size: 28, accent: true });
  }

  // =================================================================== CAVEAT
  else if (mode === 'caveat') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.05, x: 480, y: 745 }]);
    factory(0.25);
    const tgT = cue(P.tagCue, 0.3), jT = cue(P.jobsCue, D * 0.8);
    const risks = P.risks || [
      { text: 'Input costs', icon: 'coin', cue: D * 0.35 },
      { text: 'Trade uncertainty', icon: 'globe', cue: D * 0.45 },
      { text: 'Timing of big projects', icon: 'clock', cue: D * 0.55 },
    ];
    // sealed crates on the floor
    [[180, 905, 0.6], [330, 905, 0.6], [240, 1015, 0.8], [420, 1015, 0.8]].forEach(([x, y, s], i) => crate(x, y, s, { open: 0 }));
    // waiting hourglass on the crates
    const hgA = (t * 0.6) % 1;
    ctx.save(); ctx.translate(330, 820); ctx.rotate(hgA > 0.85 ? (hgA - 0.85) / 0.15 * Math.PI : 0);
    ctx.beginPath(); ctx.moveTo(-26, -40); ctx.lineTo(26, -40); ctx.lineTo(0, 0); ctx.lineTo(26, 40); ctx.lineTo(-26, 40); ctx.lineTo(0, 0); ctx.closePath();
    ctx.fillStyle = 'rgba(220,230,255,0.25)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#c9cede'; ctx.stroke();
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(-14 * (1 - hgA), -40 + 34 * hgA); ctx.lineTo(14 * (1 - hgA), -40 + 34 * hgA); ctx.lineTo(0, -4); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-18 * hgA, 38); ctx.lineTo(18 * hgA, 38); ctx.lineTo(0, 38 - 26 * hgA); ctx.closePath(); ctx.fill();
    ctx.restore();
    // worker: neutral, shrugs on jobsCue
    K.drawPerson(ctx, 720, 1025, 1.15, { t, pose: t > jT ? 'shrug' : 'stand', mood: t > jT ? 'worried' : 'neutral', shirt: 1, hairStyle: 'short', skin: 3, look: -0.5, seed: 5 });
    ctx.restore(); ctx.save();
    const tp = K.popIn(t, tgT, 0.4);
    if (tp > 0) K.drawLabel(ctx, 300, 760, tp, { text: P.tag || 'Ordered, not at work yet', size: 28, dot: true });
    const hp = K.popIn(t, Math.max(0.1, cue(risks[0].cue, D * 0.35) - 0.5), 0.4);
    if (hp > 0) K.drawLabel(ctx, 690, 470, hp, { text: P.watchHead || 'A3: things to watch', size: 26, accent: true });
    risks.forEach((R, i) => {
      const p = K.popIn(t, cue(R.cue, D * (0.35 + 0.1 * i)), 0.4); if (p <= 0) return;
      const y = 530 + i * 82;
      ctx.save(); ctx.translate(690, y); ctx.scale(Math.min(1.04, p), Math.min(1.04, p)); ctx.globalAlpha = clamp(p * 2);
      rr(-170, -34, 340, 68, 34, 'rgba(8,10,24,0.88)');
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; H.roundRect(ctx, -170, -34, 340, 68, 34); ctx.stroke();
      if (R.icon === 'coin') K.drawCoin(ctx, -132, 24, 0.7, { spin: t * 3, shadow: false });
      else if (R.icon === 'globe') K.drawGlobe(ctx, -132, 30, 0.34, { t, shadow: false });
      else K.drawClock(ctx, -132, 30, 0.45, { t, speed: 2, shadow: false });
      fitted(R.text, -92, 1, 'bold', 28, 18, 245, '#ffffff', 'left');
      ctx.restore();
    });
    // jobs card (left, above the crates)
    const jp = K.popIn(t, jT, 0.45);
    card(487, 830, 640, 140, jp, (w, h) => {
      text('?', -w / 2 + 60, 4, 'display', 90, ACC);
      const lines = String(P.jobs || 'Effect on jobs: not in these numbers').split(': ');
      fitted(lines[0] + (lines[1] ? ':' : ''), 40, -24, 'bold', 38, 24, w - 150, '#ffffff');
      if (lines[1]) fitted(lines[1], 40, 26, 'bold', 34, 22, w - 150, ACC);
    });
  }

  ctx.restore();
}
