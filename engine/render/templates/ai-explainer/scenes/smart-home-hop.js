// Scene "smart-home-hop" (full frame). A home at night with everyday connected gadgets: a countertop smart oven, a TV
// with a cheap streaming box under it, a robot vacuum, a smart speaker and a wall camera. A tiny AI robot copies itself
// device to device: each copy flies on an arc while the original stays, and every infected gadget shows the AI's lime
// eyes on its screen. Fits: AI worms / self-replicating AI, malware spreading through smart-home or IoT devices,
// "your gadgets could run AI", device security.
// modes:
//   "story"  (1-3 beats) robot on the counter jumps into the oven (ovenCue); estimate pill (estimate/estimateBy at
//            estCue); copy hops oven -> TV box (boxCue); "no data center" inset with a cross (dcCue); numbered step
//            pills (steps[] at stepCues[]) while copies hop on to the vacuum, which starts running, then the speaker
//            and camera; "No human help" pill (helpCue, helpText).
//   "payoff" devices clean; fix pills (fixes[] at fixCues[]): shields pop on every gadget (a copy bounces off),
//            lock badges, traffic lines + a magnifier that flags a big packet; then the question (question at qCue).
// params: mode story|payoff; story: estimate, estimateBy, dcText, steps [], helpText, cues ovenCue, estCue, boxCue, dcCue,
//         stepCues [], helpCue; payoff: fixes [], fixCues [], question, qCue
// Without cues, events fall at fixed fractions of the duration.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba, mixHex } = H;
  const TAU = Math.PI * 2;
  const tc = (w, d) => { const v = w ? info.timeOf(w) : null; return v != null ? v : d; };
  const ph = (a, b) => H.easeInOutCubic(clamp((t - a) / Math.max(1e-6, b - a)));
  const rr = (x, y, w, h, r, fill) => { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); };
  const circle = (x, y, r, fill) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); };
  const mode = P.mode || 'story';

  // ---- device anchors (screen centre where the AI's eyes show)
  const DEV = {
    oven: { x: 270, y: 750 }, box: { x: 705, y: 872 }, tv: { x: 720, y: 565 },
    vac: { x: 470, y: 1000 }, spk: { x: 845, y: 850 }, cam: { x: 470, y: 520 },
  };

  // eyes on a screen: dark rounded rect with two lime pills (blink), glow
  function eyes(cx, cy, w, h, k, seed, busy) {
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha *= clamp(k);
    K.glow(ctx, cx, cy, Math.max(w, h) * 1.3, ACC, 0.35 * k);
    rr(cx - w / 2, cy - h / 2, w, h, Math.min(w, h) * 0.3, '#0b1020');
    const blink = (Math.floor(t * 1.3 + seed * 0.37) % 5 === 0) && ((t * 1.3 + seed * 0.37) % 1 < 0.18);
    const eh = blink ? h * 0.08 : h * 0.42, ew = Math.max(4, w * 0.12);
    for (const sx of [-1, 1]) rr(cx + sx * w * 0.18 - ew / 2, cy - eh / 2, ew, eh, ew / 2, ACC);
    if (busy) for (let i = 0; i < 4; i++) { const bh = h * 0.12 * (0.4 + 0.6 * Math.abs(Math.sin(t * 9 + i))); rr(cx - w * 0.2 + i * w * 0.12, cy + h * 0.38 - bh, w * 0.06, bh, 2, rgba(ACC, 0.8)); }
    ctx.restore();
  }

  // ---- gadgets (flat vector, generic, no brands)
  function oven(k) {
    const x = 150, y = 640, w = 250, h = 200;
    K.shadow(ctx, x + w / 2, y + h, w * 1.05);
    rr(x, y, w, h, 18, '#c9cede'); rr(x, y + h * 0.72, w, h * 0.28, 16, '#aeb4c8');
    rr(x + 16, y + 22, 160, 130, 12, '#2a2f45');                        // door window
    ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(x + 26, y + 30, 40, 110);
    rr(x + 16, y + 160, 160, 12, 6, '#8f96ad');                          // handle
    rr(x + 190, y + 24, 46, 34, 8, '#1a1e33');                           // display
    const dc = k > 0 ? ACC : '#ff9b5e';
    ctx.fillStyle = dc; ctx.font = H.font('ui', 18); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(k > 0 ? (Math.floor(t * 2) % 2 ? 'AI' : '··') : '180', x + 213, y + 42);
    for (let i = 0; i < 3; i++) { circle(x + 213, y + 86 + i * 34, 11, '#8f96ad'); circle(x + 213, y + 86 + i * 34, 5, '#6c7389'); }
    eyes(x + 96, y + 87, 130, 100, k, 1, false);
    if (k <= 0) { K.glow(ctx, x + 96, y + 100, 90, '#ff9b5e', 0.18); }
  }
  function tvAndBox(kBox, kTv, busy) {
    // TV on the wall
    rr(560, 455, 320, 210, 14, '#151a2c'); rr(572, 467, 296, 186, 8, kTv > 0 ? '#0b1020' : '#232b4a');
    if (kTv <= 0) { const g = ctx.createLinearGradient(572, 467, 868, 653); g.addColorStop(0, '#2c3a6a'); g.addColorStop(1, '#1b2242'); ctx.fillStyle = g; ctx.fillRect(572, 467, 296, 186); }
    eyes(720, 560, 250, 150, kTv, 2, busy);
    // cable
    ctx.strokeStyle = '#0d1020'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(705, 665); ctx.bezierCurveTo(700, 760, 690, 800, 700, 852); ctx.stroke();
    // cabinet
    K.shadow(ctx, 720, 1010, 360);
    rr(560, 900, 320, 108, 12, '#5a4a6e'); rr(560, 900, 320, 16, 8, '#6d5c85');
    rr(580, 932, 130, 60, 8, '#4c3e5e'); rr(730, 932, 130, 60, 8, '#4c3e5e');
    // the box
    rr(640, 852, 130, 48, 10, '#1d2033'); rr(640, 852, 130, 12, 6, '#2b2f48');
    const led = kBox > 0 ? ACC : (Math.sin(t * 3) > 0 ? '#ff6b5e' : '#6a2f38');
    if (kBox > 0) K.glow(ctx, 752, 882, 60, ACC, 0.6 * kBox);
    circle(752, 882, 6, led);
    if (kBox > 0) { ctx.fillStyle = rgba(ACC, 0.9); for (let i = 0; i < 4; i++) { const on = Math.floor(t * 8 + i) % 4 !== 0; if (on) rr(656 + i * 14, 876, 8, 10, 2, ACC); } }
  }
  function vacuum(k, run) {
    const off = run > 0 ? Math.sin(run * 1.3) * 90 * clamp(run) : 0;
    const x = DEV.vac.x + off, y = DEV.vac.y;
    K.shadow(ctx, x, y + 4, 190);
    ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.42);
    circle(0, -40, 92, '#3b3f5c'); circle(0, -48, 84, '#4b5075'); circle(0, -52, 36, '#2c3048');
    ctx.restore();
    if (k > 0) { K.glow(ctx, x, y - 24, 70, ACC, 0.4 * k); eyes(x, y - 22, 56, 26, k, 3, false); }
    else circle(x, y - 22, 6, '#ff6b5e');
  }
  function speaker(k) {
    const x = DEV.spk.x, y = 900;
    rr(x - 34, y - 120, 68, 120, 26, '#d6d9e6'); rr(x - 34, y - 120, 68, 24, 12, '#eceef5');
    ctx.fillStyle = '#b5b9ca'; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { circle(x - 18 + c * 12, y - 80 + r * 14, 3, '#b5b9ca'); }
    const ring = k > 0 ? ACC : '#7f86a6';
    ctx.strokeStyle = ring; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(x, y - 108, 26, 6, 0, 0, TAU); ctx.stroke();
    if (k > 0) { K.glow(ctx, x, y - 108, 60, ACC, 0.5 * k); eyes(x, y - 62, 50, 30, k, 4, false); }
  }
  function camera(k) {
    const x = DEV.cam.x, y = DEV.cam.y;
    rr(x - 8, y - 70, 16, 40, 6, '#9aa0b8'); rr(x - 30, y - 74, 60, 14, 6, '#9aa0b8');
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.18 + Math.sin(t * 0.7) * 0.12);
    rr(-48, -34, 96, 60, 20, '#e2e5ef'); rr(-48, -34, 96, 16, 8, '#f3f4f8');
    circle(30, -4, 20, '#1a1e33'); circle(30, -4, 10, k > 0 ? ACC : '#3b4a8a');
    if (k > 0) K.glow(ctx, 30, -4, 40, ACC, 0.6 * k);
    circle(-26, -16, 4, k > 0 ? ACC : (Math.sin(t * 4) > 0 ? '#ff6b5e' : '#6a2f38'));
    ctx.restore();
  }
  function counter() {
    K.shadow(ctx, 280, 1010, 420);
    rr(90, 840, 380, 170, 10, '#3a4470'); rr(80, 828, 400, 22, 8, '#c4c9d8');
    rr(108, 870, 160, 120, 8, '#323b63'); rr(292, 870, 160, 120, 8, '#323b63');
    rr(170, 920, 36, 8, 4, '#8f96ad'); rr(354, 920, 36, 8, 4, '#8f96ad');
  }
  // tiny robot copy flying on an arc from a to b during [t0, t1]
  function hop(a, b, t0, t1, bounce) {
    if (t < t0 || t > t1 + (bounce ? 1.2 : 0)) return;
    let u = clamp((t - t0) / (t1 - t0));
    if (bounce && t > t1) u = 1 - H.easeOutCubic(clamp((t - t1) / 0.7)) * 0.35;
    const e = H.easeInOutCubic(u);
    const x = lerp(a.x, b.x, e), y = lerp(a.y, b.y, e) - Math.sin(Math.PI * e) * 190;
    const fade = bounce && t > t1 ? 1 - clamp((t - t1 - 0.5) / 0.6) : 1;
    ctx.save(); ctx.globalAlpha *= fade;
    for (let i = 1; i <= 7; i++) {
      const ue = H.easeInOutCubic(clamp(u - i * 0.035));
      const tx = lerp(a.x, b.x, ue), ty = lerp(a.y, b.y, ue) - Math.sin(Math.PI * ue) * 190;
      circle(tx, ty - 30, 9 - i, rgba(ACC, 0.55 - i * 0.06));
    }
    K.glow(ctx, x, y - 30, 70, ACC, 0.5);
    const s = 0.38 * (u < 0.15 ? u / 0.15 : u > 0.85 && !bounce ? (1 - u) / 0.15 + 0.0 : 1);
    if (s > 0.02) K.drawRobot(ctx, x, y + 20, s, { t, state: 'happy', seed: 7 });
    ctx.restore();
  }
  function big(text, x, y, size, color, a) {
    if (a <= 0) return;
    const r = H.fitText(ctx, text, 'display', size, 26, 740);
    ctx.save(); ctx.globalAlpha *= clamp(a); ctx.font = r.font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round'; ctx.lineWidth = r.size * 0.16; ctx.strokeStyle = 'rgba(8,10,22,0.92)'; ctx.strokeText(r.text, x, y);
    ctx.fillStyle = color; ctx.fillText(r.text, x, y); ctx.restore();
  }
  function crossBadge(x, y, s, a) {
    if (a <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s * a, s * a);
    circle(0, 0, 26, '#ff5e6b'); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(10, 10); ctx.moveTo(10, -10); ctx.lineTo(-10, 10); ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  if (mode === 'story') {
    const ovenAt = tc(P.ovenCue, D * 0.08), estAt = tc(P.estCue, D * 0.26), boxAt = tc(P.boxCue, D * 0.5), dcAt = tc(P.dcCue, D * 0.58);
    const sc = P.stepCues || [], stepAt = [0, 1, 2].map((i) => tc(sc[i], D * (0.7 + i * 0.09)));
    const helpAt = tc(P.helpCue, D * 0.95);
    const b1 = (info.beats[1] || { t0: D * 0.12 }).t0, b2 = (info.beats[2] || { t0: D * 0.65 }).t0;
    K.camera(ctx, t, [{ t: 0, zoom: 1.15, x: 380, y: 640 }, { t: b1 + 0.2, zoom: 1.15, x: 380, y: 640 }, { t: b1 + 2.2, zoom: 1, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 735 }]);
    K.world.room(ctx, { t, time: 'night', floorY: 880, window: false, picture: false, lamp: false, plant: false });
    K.props.window(ctx, 90, 430, 250, 170, 'night', t);

    // infection times
    const ovenIn = ovenAt + 0.15, boxIn = boxAt + 0.15, tvIn = boxIn + 0.35;
    const vacIn = stepAt[0] + 0.55, spkIn = stepAt[2] + 0.75, camIn = stepAt[2] + 1.05;
    const k = (at) => clamp((t - at) / 0.35);
    camera(k(camIn));
    tvAndBox(k(boxIn), k(tvIn), t > stepAt[1]);
    speaker(k(spkIn));
    counter();
    oven(k(ovenIn));
    vacuum(k(vacIn), t > stepAt[1] ? (t - stepAt[1]) : 0);

    // robot on the counter jumps into the oven window
    const jump = clamp((t - (ovenAt - 0.55)) / 0.7);
    if (jump < 1) {
      const e = H.easeInOutCubic(jump);
      const x = lerp(430, DEV.oven.x - 25, e), y = lerp(828, DEV.oven.y + 30, e) - Math.sin(Math.PI * e) * 120;
      if (jump > 0) K.glow(ctx, x, y - 40, 80, ACC, 0.5 * jump);
      K.drawRobot(ctx, x, y, 0.5 * (1 - 0.8 * e), { t, state: jump > 0 ? 'happy' : 'idle', seed: 7 });
    }
    // copies hopping
    hop(DEV.oven, DEV.box, boxAt - 0.75, boxAt + 0.15);
    hop(DEV.box, DEV.vac, stepAt[0] - 0.25, stepAt[0] + 0.55);
    hop(DEV.vac, DEV.spk, stepAt[2] - 0.05, stepAt[2] + 0.75);
    hop(DEV.box, DEV.cam, stepAt[2] + 0.25, stepAt[2] + 1.05);

    // estimate pill
    const ep = K.popIn(t, estAt - 0.1, 0.45), eOut = 1 - clamp((t - (dcAt - 0.5)) / 0.35);
    if (ep > 0 && eOut > 0) {
      ctx.save(); ctx.globalAlpha = eOut;
      K.drawLabel(ctx, 487, 520, ep, { text: P.estimate || 'Months away?', size: 44, accent: true });
      const bp = K.popIn(t, estAt + 0.5, 0.4); if (bp > 0) K.drawLabel(ctx, 487, 585, bp, { text: P.estimateBy || 'An estimate', size: 26 });
      ctx.restore();
    }
    // no data center inset
    const dp = K.popIn(t, dcAt - 0.15, 0.45), dOut = 1 - clamp((t - (b2 + 0.3)) / 0.4);
    if (dp > 0 && dOut > 0) {
      ctx.save(); ctx.globalAlpha = dOut;
      ctx.save(); ctx.translate(487, 600); ctx.scale(dp, dp);
      rr(-230, -175, 460, 270, 28, 'rgba(10,12,26,0.92)'); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; roundRect(ctx, -230, -175, 460, 270, 28); ctx.stroke();
      K.drawDataCenter(ctx, 0, 40, 0.8, { t, activity: 0.3, shadow: false });
      ctx.restore();
      const cp = clamp((t - dcAt - 0.25) / 0.35);
      if (cp > 0) {
        ctx.save(); ctx.strokeStyle = '#ff5e6b'; ctx.lineWidth = 16; ctx.lineCap = 'round';
        const L = 150;
        ctx.beginPath(); ctx.moveTo(487 - L, 590 - L * 0.6); ctx.lineTo(487 - L + 2 * L * Math.min(1, cp * 2), 590 - L * 0.6 + 1.2 * L * Math.min(1, cp * 2)); ctx.stroke();
        if (cp > 0.5) { const c2 = (cp - 0.5) * 2; ctx.beginPath(); ctx.moveTo(487 + L, 590 - L * 0.6); ctx.lineTo(487 + L - 2 * L * c2, 590 - L * 0.6 + 1.2 * L * c2); ctx.stroke(); }
        ctx.restore();
      }
      const lp = K.popIn(t, dcAt + 0.5, 0.4); if (lp > 0) K.drawLabel(ctx, 487, 485, lp, { text: P.dcText || 'No data center needed', size: 32, accent: true });
      ctx.restore();
    }
    // steps
    const steps = P.steps || ['Copy itself', 'Run there', 'Do it again'];
    steps.forEach((s, i) => {
      const p = K.popIn(t, stepAt[i] - 0.15, 0.4);
      if (p <= 0) return;
      const active = t >= stepAt[i] && (i === steps.length - 1 || t < stepAt[i + 1]);
      ctx.save(); ctx.globalAlpha = active ? 1 : 0.8;
      K.drawLabel(ctx, 255, 478 + i * 62, p, { text: `${i + 1}  ${s}`, size: 28, dot: true, accent: active });
      ctx.restore();
    });
    const hp = K.popIn(t, helpAt - 0.1, 0.45);
    if (hp > 0) { K.drawLabel(ctx, 735, 790, hp, { text: P.helpText || 'No human help', size: 30, accent: true }); crossBadge(578, 770, 0.8, hp); }
  } else {
    // ---------------- payoff
    const fc = P.fixCues || [], fixAt = [0, 1, 2].map((i) => tc(fc[i], D * (0.1 + i * 0.2))), qAt = tc(P.qCue, D * 0.72);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.04, x: 487, y: 745 }]);
    K.world.room(ctx, { t, time: 'night', floorY: 880, window: false, picture: false, lamp: false, plant: false });
    K.props.window(ctx, 90, 430, 250, 170, 'night', t);
    camera(0); tvAndBox(0, 0, false); speaker(0); counter(); oven(0); vacuum(0, 0);

    const devs = [[DEV.oven.x, 650], [705, 845], [DEV.vac.x, 960], [DEV.spk.x, 765], [DEV.cam.x, 460]];
    // traffic lines (watch) from a router on the counter
    const router = { x: 420, y: 828 };
    const wA = fixAt[2];
    if (t > fixAt[1] - 0.1) {
      // router
      rr(router.x - 40, router.y - 34, 80, 34, 8, '#e2e5ef');
      for (const dx of [-26, 26]) rr(router.x + dx - 3, router.y - 70, 6, 40, 3, '#c4c9d8');
      for (let i = 0; i < 4; i++) circle(router.x - 24 + i * 16, router.y - 16, 4, Math.floor(t * 6 + i) % 3 ? ACC : '#4a5a7a');
    }
    const lineK = clamp((t - wA + 0.2) / 0.5);
    if (lineK > 0) {
      devs.forEach(([dx, dy], i) => {
        ctx.save(); ctx.globalAlpha = 0.55 * lineK; ctx.strokeStyle = rgba(ACC, 0.7); ctx.lineWidth = 3; ctx.setLineDash([8, 10]); ctx.lineDashOffset = -t * 40;
        ctx.beginPath(); ctx.moveTo(router.x, router.y - 40); ctx.quadraticCurveTo((router.x + dx) / 2, Math.min(router.y, dy) - 120, dx, dy); ctx.stroke(); ctx.restore();
        for (let j = 0; j < 2; j++) {
          const u = ((t * 0.5 + i * 0.23 + j * 0.5) % 1);
          const x = (1 - u) * (1 - u) * router.x + 2 * (1 - u) * u * (router.x + dx) / 2 + u * u * dx;
          const y = (1 - u) * (1 - u) * (router.y - 40) + 2 * (1 - u) * u * (Math.min(router.y, dy) - 120) + u * u * dy;
          circle(x, y, 7, rgba('#ffffff', 0.85 * lineK));
        }
      });
      // a big packet flagged by the magnifier
      const fu = clamp((t - wA - 0.6) / 1.2);
      const bx = lerp(router.x, 705, H.easeInOutCubic(fu)), by = lerp(router.y - 40, 845, H.easeInOutCubic(fu)) - Math.sin(Math.PI * fu) * 160;
      if (fu > 0) { rr(bx - 26, by - 18, 52, 36, 8, '#ff9b5e'); ctx.fillStyle = '#1a1e33'; ctx.font = H.font('ui', 18); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('GB', bx, by + 1); }
      const mx = lerp(250, bx + 40, clamp((t - wA) / 1.4)), my = lerp(640, by - 40, clamp((t - wA) / 1.4));
      ctx.save(); ctx.globalAlpha = lineK;
      ctx.strokeStyle = '#e2e5ef'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(mx + 40, my + 40); ctx.lineTo(mx + 85, my + 85); ctx.stroke();
      ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(mx, my, 50, 0, TAU); ctx.stroke(); ctx.fillStyle = 'rgba(200,230,255,0.15)'; ctx.fill();
      ctx.restore();
      if (fu >= 1) { const wp = K.popIn(t, wA + 1.85, 0.4); if (wp > 0) K.drawWarning(ctx, bx + 70, by - 30, 0.5 * wp, { pulse: t }); }
    }
    // shields (harden) + a copy that bounces off the TV box
    devs.forEach(([dx, dy], i) => {
      const sp = K.popIn(t, fixAt[0] - 0.1 + i * 0.12, 0.4);
      if (sp > 0) { ctx.save(); ctx.globalAlpha = 0.95; K.drawShield(ctx, dx + (i === 4 ? 70 : 0), dy + (i === 4 ? 40 : 0), 0.42 * sp, { check: clamp((t - fixAt[0] - 0.4 - i * 0.12) / 0.4) }); ctx.restore(); }
      const lp = K.popIn(t, fixAt[1] + i * 0.12, 0.4);
      if (lp > 0) K.drawLock(ctx, dx + 44 + (i === 4 ? 70 : 0), dy + 6 + (i === 4 ? 40 : 0), 0.32 * lp, { open: 0 });
    });
    hop({ x: 487, y: 600 }, { x: 705, y: 820 }, fixAt[0] + 0.3, fixAt[0] + 1.0, true);

    // fix pills (left column), fade before the question
    const fixes = P.fixes || ['Harden devices', 'Safer defaults', 'Watch traffic'];
    const out = 1 - clamp((t - (qAt - 0.4)) / 0.4);
    if (out > 0) fixes.forEach((s, i) => {
      const p = K.popIn(t, fixAt[i] - 0.15, 0.4);
      if (p > 0) { ctx.save(); ctx.globalAlpha = out; K.drawLabel(ctx, 487, 470 + i * 62, p, { text: s, size: 30, dot: true, accent: i === fixes.length - 1 ? t < qAt : false }); ctx.restore(); }
    });
    // the question + online pings on every gadget
    const qp = K.popIn(t, qAt - 0.1, 0.5);
    if (qp > 0) {
      devs.forEach(([dx, dy], i) => {
        for (let r = 0; r < 3; r++) {
          const u = ((t - qAt) * 0.8 + r / 3 + i * 0.1) % 1;
          ctx.save(); ctx.globalAlpha = (1 - u) * 0.8 * clamp(t - qAt); ctx.strokeStyle = ACC; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(dx, dy - 20, 20 + u * 50, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke(); ctx.restore();
        }
      });
      ctx.save(); ctx.globalAlpha = clamp(qp); ctx.translate(487, 540); ctx.scale(qp, qp); rr(-410, -100, 820, 190, 30, 'rgba(10,12,26,0.9)'); ctx.lineWidth = 2; ctx.strokeStyle = rgba(ACC, 0.5); roundRect(ctx, -410, -100, 820, 190, 30); ctx.stroke(); ctx.restore();
      ctx.save(); ctx.translate(487, 520); ctx.scale(qp, qp);
      big(P.question || 'How many are online?', 0, 0, 56, '#ffffff', 1);
      ctx.restore();
      const mp = K.popIn(t, qAt + 0.4, 0.5);
      if (mp > 0) { ctx.save(); ctx.translate(487, 612); ctx.scale(mp, mp); big('?', 0, 0, 90, ACC, 1); ctx.restore(); }
    }
  }
  ctx.restore();
}
