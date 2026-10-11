// Scene "audit-log" (full frame). Night control room: a control console slides in on the left (controls OUTSIDE
// the model), a harness frame draws itself around an AI agent robot and a cable connects it to the console; then the
// robot works and every action pops a receipt that flies into a locked logbook on the right, where a person reads
// it and nods. Fits: "audit trail", "logs / evidence", "guardrails outside the model", "human oversight".
// params (all optional): controlsCue / harnessCue / actionCue / logCue  narration words (else 10/30/55/85 %)
//                        entries        log lines, up to 4 (default ["Opened file", "Sent email", "Ran code", "Booked trip"])
//                        title          logbook title (default "ACTION LOG")
//                        controlsLabel  pill 1 (default "Controls outside the model")
//                        harnessLabel   pill 2 (default "Every action logged")
//                        logLabel       final accent pill (default "Tamper-proof, human-readable")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent, N = K.NEUTRAL;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tCtl = at(P.controlsCue, D * 0.1) - 0.3;
  const tHar = at(P.harnessCue, D * 0.3) - 0.3;
  const tAct = at(P.actionCue, D * 0.55) - 0.4;
  const tLog = at(P.logCue, D * 0.85) - 0.3;
  const entries = (P.entries || ['Opened file', 'Sent email', 'Ran code', 'Booked trip']).slice(0, 4);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 470, y: 780 }, { t: tHar + 1, zoom: 1.02, x: 487, y: 770 }, { t: D, zoom: 1.04, x: 520, y: 760 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 900 });
  const feet = 1035;

  // control console (left), slides in
  const cIn = easeOutCubic(K.phase(t, tCtl, tCtl + 0.6));
  const cx = lerp(-200, 178, cIn);
  consoleBox(ctx, H, K, cx, feet, t, ACC);

  // robot in the middle
  const rx = 420;
  const working = t >= tAct;
  K.drawRobot(ctx, rx, feet - 10, 1.15, { t, state: working ? 'working' : 'idle', seed: 6 });
  // harness frame drawn around the robot
  const hp = K.phase(t, tHar, tHar + 0.9);
  if (hp > 0) {
    const x0 = rx - 112, x1 = rx + 112, y0 = 720, y1 = feet + 5;
    const pts = [[x0, y1], [x0, y0], [x1, y0], [x1, y1]];
    ctx.save(); ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = ACC;
    K.pathDraw(ctx, pts, hp);
    ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    if (hp > 0.6) { const k = (hp - 0.6) / 0.4; for (const yy of [820, 920]) { ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(lerp(x0, x1, k), yy); ctx.stroke(); } }
    ctx.restore();
    // cable from the console to the harness
    const ck = K.phase(t, tHar + 0.6, tHar + 1.3);
    if (ck > 0 && cIn > 0.9) {
      ctx.save(); ctx.strokeStyle = '#8a93a8'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      const pts2 = K.bezier(cx + 100, 900, cx + 120, 1030, x0 - 40, 1030, x0, 900, 24);
      K.pathDraw(ctx, pts2, ck);
      // pulses along the cable
      if (ck >= 1) for (let i = 0; i < 3; i++) { const u = ((t * 0.7 + i / 3) % 1); const p = K.pathPoint(pts2, u); K.glow(ctx, p[0], p[1], 26, ACC, 0.6); ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(p[0], p[1], 7, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }
  }

  // logbook (right)
  const lbx = 790, lby = 560, lbw = 230, lbh = 330;
  const lbIn = K.popIn(t, tAct - 0.4, 0.5);
  if (lbIn > 0) {
    ctx.save(); ctx.translate(lbx, lby + lbh); ctx.scale(lbIn, lbIn); ctx.translate(-lbx, -(lby + lbh));
    H.roundRect(ctx, lbx - lbw / 2, lby, lbw, lbh, 18); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    H.roundRect(ctx, lbx - lbw / 2, lby, lbw, 58, 18); ctx.fillStyle = '#2a2f45'; ctx.fill(); ctx.fillRect(lbx - lbw / 2, lby + 30, lbw, 28);
    ctx.font = K.font.ui(26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.title || 'ACTION LOG', lbx - 14, lby + 30);
    // padlock seal when tamper-proof
    const lk = K.popIn(t, tLog - 1.6, 0.45);
    if (lk > 0) K.drawLock(ctx, lbx + lbw / 2 - 10, lby + 40, 0.45 * lk, { open: 0 });
    ctx.restore();
  }
  // receipts fly from the robot into the log
  const n = entries.length, every = Math.max(0.6, (tLog - 1.6 - tAct) / n);
  for (let i = 0; i < n; i++) {
    const born = tAct + 0.3 + i * every, age = t - born;
    if (age < 0) continue;
    const f = clamp(age / 0.7), e = easeOutCubic(f);
    const ex = lbx - lbw / 2 + 16, ey = lby + 84 + i * 58;
    if (f < 1) {
      const x = lerp(rx + 40, ex + 90, e), y = lerp(780, ey, e) - Math.sin(f * Math.PI) * 120;
      H.roundRect(ctx, x - 50, y - 30, 100, 60, 8); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.fillStyle = '#b9c1d6'; ctx.fillRect(x - 36, y - 14, 72, 6); ctx.fillRect(x - 36, y + 2, 50, 6);
    } else if (lbIn >= 1) {
      ctx.save(); ctx.globalAlpha = K.phase(t, born + 0.7, born + 0.9);
      ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(ex + 12, ey, 11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#161927'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(ex + 6, ey); ctx.lineTo(ex + 11, ey + 5); ctx.lineTo(ex + 18, ey - 5); ctx.stroke();
      ctx.font = K.font.ui(25); ctx.fillStyle = '#161927'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(entries[i], ex + 32, ey + 1);
      ctx.restore();
    }
  }
  // reader under the log
  const rd = t >= tLog;
  K.drawPerson(ctx, 605, feet, 1.15, { t, pose: rd ? 'point' : 'stand', mood: rd ? 'happy' : 'neutral', look: 1, skin: 0, hair: 2, shirt: 0, hairStyle: 'long', seed: 2 });

  // labels
  const lab = (text, a, b, accent) => {
    if (t < a || t > b + 0.4) return;
    const p = K.popIn(t, a, 0.4), out = 1 - smooth((t - b) / 0.4);
    ctx.save(); ctx.globalAlpha = clamp(out); K.drawLabel(ctx, 390, 605, p, { text, size: 28, dot: !accent, accent }); ctx.restore();
  };
  lab(P.controlsLabel || 'Controls outside the model', tCtl + 0.2, tHar + 1.2);
  lab(P.harnessLabel || 'Every action logged', tAct, tLog - 1.7);
  lab(P.logLabel || 'Tamper-proof, human-readable', tLog - 1.6, D + 1, true);
  ctx.restore();
}

function consoleBox(ctx, H, K, x, feet, t, acc) {
  K.shadow(ctx, x, feet, 220);
  H.roundRect(ctx, x - 100, feet - 210, 200, 210, 16); ctx.fillStyle = '#3b4260'; ctx.fill();
  H.roundRect(ctx, x - 110, feet - 230, 220, 50, 14); ctx.fillStyle = '#4b5378'; ctx.fill();
  // screen
  H.roundRect(ctx, x - 80, feet - 380, 160, 130, 12); ctx.fillStyle = '#161927'; ctx.fill();
  H.roundRect(ctx, x - 10, feet - 250, 20, 30, 4); ctx.fillStyle = '#2a2f45'; ctx.fill();
  ctx.strokeStyle = acc; ctx.lineWidth = 4; ctx.beginPath();
  for (let i = 0; i <= 20; i++) { const xx = x - 66 + i * 6.6, yy = feet - 315 + Math.sin(t * 3 + i * 0.6) * 22; if (i) ctx.lineTo(xx, yy); else ctx.moveTo(xx, yy); }
  ctx.stroke();
  // switches + knobs
  for (let i = 0; i < 3; i++) {
    const sx = x - 60 + i * 60, on = (Math.floor(t * 0.8 + i) % 3) !== 0;
    H.roundRect(ctx, sx - 14, feet - 165, 28, 50, 10); ctx.fillStyle = '#161927'; ctx.fill();
    ctx.fillStyle = on ? acc : '#8a93a8'; ctx.beginPath(); ctx.arc(sx, on ? feet - 150 : feet - 130, 11, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#e8453c'; ctx.beginPath(); ctx.arc(x, feet - 60, 24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff8a80'; ctx.beginPath(); ctx.arc(x - 7, feet - 67, 7, 0, Math.PI * 2); ctx.fill();
}
