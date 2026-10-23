// Scene "rollout-tower" (full frame, best as a 2-beat span). Phase A, dusk street: a company tower with a text name
// pill; its windows light up one by one and each shows a little robot helper face (lime eyes) = every employee gets
// an agent. Date pill, "announced by" pill, product pill, a counter counts up while tiny commuters walk in.
// Phase B (from pushCue): the camera pushes into one window and cuts to the desk inside: a worker, a robot helper
// pops in beside her, a 3-step task card ticks off step by step, and a finished document lands with a DONE stamp.
// params: company ("COMPANY"), date ("This week"), by ("AI maker says"), product ("AI assistant"),
//         count (10000), countSuffix ("+"), countLabel ("employees worldwide"), agent ("AI agent"),
//         steps (["Step 1", "Step 2", "Step 3"]), done ("Finished work"), stamp ("DONE"),
//         dateCue, byCue, productCue, countCue, pushCue, agentCue, stepsCue, doneCue
// Fits: company-wide rollouts of an AI tool, "every employee gets an assistant", an agent doing multi-step work.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tDate = at(P.dateCue, D * 0.2) - 0.1, tBy = at(P.byCue, D * 0.25) - 0.1, tProd = at(P.productCue, D * 0.37) - 0.1;
  const tCount = at(P.countCue, D * 0.5) - 0.1, tPush = at(P.pushCue, D * 0.62) - 1.0;
  const tAgent = Math.max(tPush + 1.2, at(P.agentCue, D * 0.7) - 0.15), tSteps = Math.max(tAgent + 0.6, at(P.stepsCue, D * 0.78) - 0.1);
  const tDone = Math.max(tSteps + 1.6, at(P.doneCue, D * 0.94) - 0.2);
  const cut = clamp((t - (tPush + 0.75)) / 0.35); // 0 = street, 1 = inside

  if (cut < 1) {
    ctx.save();
    // camera: gentle drift, then a fast push into one window
    const WX = 560, WY = 760; // the window we push into
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 760 }, { t: tPush, zoom: 1.05, x: 487, y: 740 }, { t: tPush + 1.1, zoom: 3.2, x: WX, y: WY }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: 1010 });
    // the tower
    const TX = 487, TB = 1012, TW = 430, TH = 480, top = TB - TH;
    K.shadow(ctx, TX, TB + 4, 520);
    roundRect(ctx, TX - TW / 2, top, TW, TH, 16); ctx.fillStyle = '#3b4680'; ctx.fill();
    ctx.save(); roundRect(ctx, TX - TW / 2, top, TW, TH, 16); ctx.clip(); ctx.fillStyle = '#323b6d'; ctx.fillRect(TX + TW * 0.2, top, TW, TH); ctx.restore();
    roundRect(ctx, TX - TW / 2 - 14, top - 16, TW + 28, 24, 8); ctx.fillStyle = '#5a67a8'; ctx.fill();
    // windows: 5 cols x 7 rows; each lights then gets a robot face, rippling from the bottom up
    const cols = 5, rows = 6, ww = 58, wh = 46, gx = 22, gy = 18;
    const x0 = TX - (cols * ww + (cols - 1) * gx) / 2, y0 = top + 40;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = x0 + c * (ww + gx), y = y0 + r * (wh + gy);
      const order = (rows - 1 - r) * 0.22 + H.hash(r * 7 + c, 11) * 0.5;
      const lit = clamp((t - 0.35 - order) / 0.3);
      roundRect(ctx, x, y, ww, wh, 6); ctx.fillStyle = H.mixHex('#24294a', '#ffe7a8', lit * 0.85); ctx.fill();
      const face = K.popIn(t, 0.55 + order, 0.4);
      if (face > 0) {
        ctx.save(); ctx.translate(x + ww / 2, y + wh / 2 + 4); ctx.scale(Math.min(1.1, face), Math.min(1.1, face));
        roundRect(ctx, -19, -16, 38, 30, 9); ctx.fillStyle = '#f2f4fa'; ctx.fill();
        roundRect(ctx, -14, -11, 28, 15, 6); ctx.fillStyle = '#1c2033'; ctx.fill();
        const bl = ((t * 0.6 + H.hash(r, c)) % 1) < 0.05 ? 1 : 5;
        ctx.fillStyle = ACC; ctx.fillRect(-9, -6, 5, bl); ctx.fillRect(4, -6, 5, bl);
        ctx.restore();
      }
    }
    // door
    roundRect(ctx, TX - 50, TB - 80, 100, 80, 8); ctx.fillStyle = '#1b2036'; ctx.fill();
    roundRect(ctx, TX - 44, TB - 74, 42, 74, 4); ctx.fillStyle = rgba(ACC, 0.25); ctx.fill();
    roundRect(ctx, TX + 2, TB - 74, 42, 74, 4); ctx.fillStyle = rgba(ACC, 0.25); ctx.fill();
    // commuters walking into the door after the count starts
    for (let i = 0; i < 6; i++) {
      const st = tCount - 0.6 + i * 0.55, u = (t - st) / 3.2;
      if (u <= 0 || u >= 1) continue;
      const fromLeft = i % 2 === 0, x = fromLeft ? lerp(40, TX - 30, u) : lerp(940, TX + 30, u);
      const a = Math.min(1, (1 - u) * 6);
      ctx.save(); ctx.globalAlpha = a;
      K.drawPerson(ctx, x, 1040, 0.55, { t, walk: t - st, flip: !fromLeft, shirt: i % 5, skin: (i * 2) % 5, hair: i % 4, hairStyle: ['short', 'long', 'bun', 'curly'][i % 4], seed: i + 3 });
      ctx.restore();
    }
    // company name pill on the roof
    const pn = K.popIn(t, 0.2, 0.45);
    if (pn > 0) K.drawLabel(ctx, TX, top - 24, pn, { text: P.company || 'COMPANY', size: 34, dot: true });
    ctx.restore();

    // overlay pills (not zoomed)
    ctx.save(); ctx.globalAlpha = 1 - clamp((t - tPush) / 0.5);
    const pd = K.popIn(t, tDate, 0.4);
    if (pd > 0) K.drawLabel(ctx, 160, 700, pd, { text: P.date || 'This week', size: 26 });
    const pb = K.popIn(t, tBy, 0.4);
    if (pb > 0) K.drawLabel(ctx, 812, 700, pb, { text: P.by || 'AI maker says', size: 26 });
    const pp = K.popIn(t, tProd, 0.5);
    if (pp > 0) K.drawLabel(ctx, 487, 640, pp, { text: P.product || 'AI assistant', size: 44, accent: true });
    const pc = K.popIn(t, tCount, 0.45);
    if (pc > 0) {
      const n = K.countUp(P.count || 10000, t, tCount, 1.3);
      ctx.save(); ctx.translate(487, 860); ctx.scale(Math.min(1.05, pc), Math.min(1.05, pc));
      roundRect(ctx, -300, -95, 600, 170, 26); ctx.fillStyle = 'rgba(8,10,24,0.9)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.8); ctx.stroke();
      ctx.font = H.font('display', 84); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(n.toLocaleString('en-US') + (n >= (P.count || 10000) ? (P.countSuffix ?? '+') : ''), 0, -28);
      ctx.font = H.font('ui', 30); ctx.fillStyle = '#ffffff'; ctx.fillText(P.countLabel || 'employees worldwide', 0, 42);
      ctx.restore();
    }
    ctx.restore();
  }

  if (cut > 0) {
    ctx.save(); ctx.globalAlpha = cut;
    const ti = t - tPush; // inside time
    K.camera(ctx, t, [{ t: tPush + 0.8, zoom: 1.12, x: 487, y: 800 }, { t: tPush + 2.2, zoom: 1.0, x: 487, y: 760 }, { t: D, zoom: 1.03, x: 487, y: 770 }]);
    K.world.office(ctx, { t, time: 'dusk' });
    K.drawDesk(ctx, 360, 1045, 1.25);
    K.drawPerson(ctx, 230, 1045, 1.3, { t, pose: 'sit-laptop', typing: t < tDone ? 0.8 : 0, mood: t > tDone ? 'happy' : 'neutral', skin: 1, hair: 1, shirt: 1, hairStyle: 'long', seed: 7, look: 0.6 });
    K.drawLaptop(ctx, 400, 1045 - 110 * 1.25, 0.8, { t: ti, screen: 'chart' });
    K.props.mug(ctx, 470, 1045 - 110 * 1.25, 0.8, t);
    // robot helper pops in on agentCue
    const pr = K.popIn(t, tAgent, 0.5);
    if (pr > 0) {
      ctx.save(); ctx.translate(730, 1045); ctx.scale(pr, pr); ctx.translate(-730, -1045);
      K.drawRobot(ctx, 730, 1045, 1.25, { t, state: t < tSteps ? 'idle' : t < tDone ? 'working' : 'happy', flip: true, talk: info.env * 0.5, seed: 5 });
      ctx.restore();
      if (t < tAgent + 0.6) K.glow(ctx, 730, 900, 200 * pr, ACC, 0.5 * (1 - clamp((t - tAgent) / 0.6)));
      const pl = K.popIn(t, tAgent + 0.25, 0.4);
      const plo = 1 - clamp((t - tDone) / 0.3);
      if (pl > 0 && plo > 0) { ctx.save(); ctx.globalAlpha *= plo; K.drawLabel(ctx, 730, 720, pl, { text: P.agent || 'AI agent', size: 28, accent: true }); ctx.restore(); }
    }
    // 3-step task card
    const steps = (P.steps || ['Step 1', 'Step 2', 'Step 3']).slice(0, 3);
    const pk = K.popIn(t, tSteps, 0.45);
    const away = H.easeInOutCubic(clamp((t - tDone) / 0.45));
    if (pk > 0 && away < 1) {
      ctx.save(); ctx.globalAlpha = cut * (1 - away); ctx.translate(lerp(487, 600, away), 560); ctx.scale(Math.min(1.04, pk), Math.min(1.04, pk));
      roundRect(ctx, -260, -120, 520, 240, 24); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      steps.forEach((s, i) => {
        const y = -70 + i * 70, tick = clamp((t - (tSteps + 0.35 + i * (tDone - tSteps - 0.6) / 3)) / 0.25);
        ctx.beginPath(); ctx.arc(-200, y, 22, 0, Math.PI * 2); ctx.fillStyle = tick > 0 ? '#3fbf7f' : '#d5dae8'; ctx.fill();
        if (tick > 0) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-211, y); ctx.lineTo(-203, y + 8 * tick); ctx.lineTo(-188, y - 9 * tick); ctx.stroke(); }
        ctx.font = H.font('ui', 32); ctx.fillStyle = tick > 0 ? '#7a8199' : '#161927'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(s, -160, y + 1);
      });
      ctx.restore();
    }
    // finished document lands
    const fd = K.popIn(t, tDone, 0.5);
    if (fd > 0) {
      const fl = H.easeOutCubic(clamp((t - tDone) / 0.6));
      K.drawDocument(ctx, lerp(700, 487, fl), lerp(830, 790, fl), 1.4 * Math.min(1.05, fd), { lines: 6, title: true, seal: true });
      K.drawStamp(ctx, 640, 830, 0.85, { kind: 'check', text: P.stamp || 'DONE', land: (t - tDone - 0.35) / 0.45 });
      const pf = K.popIn(t, tDone + 0.2, 0.4);
      if (pf > 0) K.drawLabel(ctx, 487, 480, pf, { text: P.done || 'Finished work', size: 32, dot: true });
    }
    ctx.restore();
  }
}
