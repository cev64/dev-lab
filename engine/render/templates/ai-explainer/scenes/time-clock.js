// Scene "time-clock" (full frame). Office floor at dusk with a punch clock on the wall: two human workers stand by
// it while agent robots clock in one after another (each pops in as a card flies into the clock). A top panel
// races two hour bars: HUMAN stays put, AGENT grows past it on passCue (pill) and on to `ratio`x on sixCue.
// params: human ("HUMAN HOURS"), agent ("AGENT HOURS"), ratio (6), pass (pill text), six (bar-end label "6x"),
//         commits (pill after commitCue, optional), clockCue, passCue, sixCue, commitCue
// Fits: AI agents' work hours vs people, "agents outnumber staff", automation share growing over time.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const ratio = P.ratio || 6;
  const tClock = at(P.clockCue, D * 0.1), tPass = Math.max(tClock + 1, at(P.passCue, D * 0.4));
  const tSix = Math.max(tPass + 1, at(P.sixCue, D * 0.7)), tCom = P.commits ? Math.max(tPass + 1, at(P.commitCue, D * 0.85)) : 1e9;
  const r1 = K.phase(t, tClock, tPass, H.easeInOutCubic), r2 = K.phase(t, tPass + 0.2, tSix + 0.6, H.easeInOutCubic);
  const r = r2 > 0 ? lerp(1.12, ratio, r2) : lerp(0.3, 1.12, r1);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 487, y: 800 }, { t: D, zoom: 1.0, x: 487, y: 760 }]);
  K.world.office(ctx, { t, time: 'dusk' });
  // punch clock on the wall
  const cx = 150, cy = 830;
  H.roundRect(ctx, cx - 62, cy - 80, 124, 170, 14); ctx.fillStyle = '#3d4673'; ctx.fill();
  H.roundRect(ctx, cx - 50, cy + 40, 100, 34, 8); ctx.fillStyle = '#1b2040'; ctx.fill();
  ctx.fillStyle = ACC; ctx.fillRect(cx - 30, cy + 54, 60, 6);
  K.drawClock(ctx, cx, cy + 25, 0.72, { t, speed: lerp(0.5, 12, clamp(r / ratio)) });

  // humans by the clock
  const shocked = t > tSix;
  K.drawPerson(ctx, 290, 1040, 0.95, { t, pose: shocked ? 'shrug' : 'stand', mood: shocked ? 'shocked' : 'neutral', shirt: '#e8786a', skin: 1, hair: 2, hairStyle: 'long', seed: 3, look: 0.8 });
  K.drawPerson(ctx, 375, 1040, 0.95, { t, pose: 'stand', mood: shocked ? 'worried' : 'happy', shirt: '#5fa8d8', skin: 4, hair: 0, hairStyle: 'short', seed: 6, look: 0.8 });
  K.props.mug(ctx, 335, 912, 0.9, t);

  // robots clocking in
  const slots = [];
  for (let i = 0; i < 7; i++) slots.push({ x: 470 + i * 70, y: 965, s: 0.6 });
  for (let i = 0; i < 5; i++) slots.push({ x: 500 + i * 95, y: 1045, s: 0.78 });
  const order = [7, 8, 2, 9, 4, 10, 0, 11, 6, 1, 3, 5];
  const n = clamp(Math.round(r * 2), 1, 12);
  // the time each robot appeared: invert r(t) numerically is costly; use the index threshold on a fixed timeline
  const appear = (k) => {
    const need = (k + 0.5) / 2; // r value at which robot k appears
    if (need <= 0.3) return 0;
    if (need <= 1.12) return tClock + (tPass - tClock) * invEase((need - 0.3) / 0.82);
    return tPass + 0.2 + (tSix + 0.6 - (tPass + 0.2)) * invEase((need - 1.12) / (ratio - 1.12));
  };
  const drawn = order.slice(0, n).map((si, k) => ({ si, k })).sort((a, b) => slots[a.si].y - slots[b.si].y);
  for (const { si, k } of drawn) {
    const s = slots[si], ta = appear(k), p = K.popIn(t, ta, 0.4);
    if (p <= 0) continue;
    ctx.save(); ctx.translate(s.x, s.y); ctx.scale(Math.min(1.05, p), Math.min(1.05, p)); ctx.translate(-s.x, -s.y);
    K.drawRobot(ctx, s.x, s.y, s.s, { t, state: 'working', seed: si + 2 });
    ctx.restore();
    // time card flies to the clock
    const f = K.phase(t, ta, ta + 0.6, H.easeInOutCubic);
    if (f > 0 && f < 1) {
      const fx = lerp(s.x, cx, f), fy = lerp(s.y - 200 * s.s, cy + 57, f) - Math.sin(f * Math.PI) * 80;
      ctx.save(); ctx.translate(fx, fy); ctx.rotate(f * 3);
      H.roundRect(ctx, -16, -22, 32, 44, 4); ctx.fillStyle = '#f2f4fa'; ctx.fill(); ctx.fillStyle = ACC; ctx.fillRect(-16, -22, 32, 9);
      ctx.restore();
    }
  }
  ctx.restore(); // camera

  // ---- hour bars panel
  const pp = K.popIn(t, 0.2, 0.5);
  if (pp > 0) {
    ctx.save(); ctx.translate(487, 445); ctx.scale(Math.min(1.04, pp), Math.min(1.04, pp)); ctx.translate(-487, -445);
    H.roundRect(ctx, 70, 445, 835, 250, 22); ctx.fillStyle = 'rgba(10,12,24,0.88)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
    const bx = 110, unit = 112;
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.font = H.font('ui', 26);
    ctx.fillStyle = '#ffffff'; ctx.fillText(P.human || 'HUMAN HOURS', bx, 485);
    H.roundRect(ctx, bx, 508, unit, 40, 10); ctx.fillStyle = '#d7dcef'; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.fillText(P.agent || 'AGENT HOURS', bx, 595);
    const aw = Math.max(20, unit * r);
    H.roundRect(ctx, bx, 618, aw, 40, 10); ctx.fillStyle = ACC; ctx.fill();
    // human mark line
    ctx.setLineDash([6, 6]); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(bx + unit, 505); ctx.lineTo(bx + unit, 665); ctx.stroke(); ctx.setLineDash([]);
    if (r2 > 0) {
      ctx.font = H.font('display', 44); ctx.fillStyle = ACC; ctx.textAlign = 'left';
      const lbl = r2 >= 1 ? (P.six || ratio + 'x') : (lerp(1.12, ratio, r2)).toFixed(1) + 'x';
      const lx = Math.min(bx + aw + 14, 905 - 30 - ctx.measureText(lbl).width);
      if (bx + aw + 14 + ctx.measureText(lbl).width < 880) ctx.fillText(lbl, lx, 640);
      else { ctx.fillStyle = '#14160a'; ctx.textAlign = 'right'; ctx.fillText(lbl, bx + aw - 14, 640); }
    }
    ctx.restore();
  }
  // pass pill, then commits pill (same slot)
  const pPass = K.popIn(t, tPass, 0.45) * (t < tCom - 0.1 ? 1 : 0);
  if (pPass > 0 && P.pass) K.drawLabel(ctx, 487, 770, pPass, { text: P.pass, size: 27, accent: true });
  const pCom = K.popIn(t, tCom, 0.45);
  if (pCom > 0 && P.commits) K.drawLabel(ctx, 487, 770, pCom, { text: P.commits, size: 27, dot: true });
}

// inverse of easeInOutCubic on [0, 1]
function invEase(y) {
  y = Math.max(0, Math.min(1, y));
  return y < 0.5 ? Math.cbrt(y / 4) : 1 - Math.cbrt((1 - y) / 4);
}
