// Scene "two-doors" (full frame, 1 beat). Dusk street, two store fronts side by side, each with a text name pill (no
// logos). Right: doors open, a glowing mat, little agent robots stroll in one after another. Left: on shutCue its doors
// slam shut, a doorman's hand goes up and a BLOCKED cross stamp lands; agent robots walking to it bounce off. On nameCue
// the bounced robot's pill renames (e.g. a named agent). A "vs" chip sits between the stores; an optional caption pill.
// Fits: "store A blocks AI agents while store B lets them in", any open-vs-closed comparison of two companies.
// params: left ("Store A"), right ("Store B"), leftSign ("SHOP"), rightSign ("SHOP"), stamp ("BLOCKED"),
//         agent ("Outside agents"), named ("" keeps agent), vs ("vs"), caption ("" hides)
//         cues (narration words, "word#n"; without them fractions): vsCue, leftCue, shutCue, nameCue, captionCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba, mixHex } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tVs = at(P.vsCue, D * 0.08) - 0.1;
  const tLeft = at(P.leftCue, D * 0.18) - 0.15;
  const tShut = at(P.shutCue, D * 0.42) - 0.3;
  const tName = at(P.nameCue, D * 0.8) - 0.2;
  const tCap = at(P.captionCue, D * 0.6) - 0.2;
  const danger = '#ff6b5e', feet = 1030;

  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tShut, zoom: 1.04, x: 400, y: 770 }, { t: D, zoom: 1.03, x: 480, y: 770 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });

  function store(x0, x1, body, stripe, sign, doorX, openAmt) {
    roundRect(ctx, x0, 600, x1 - x0, 400, 12); ctx.fillStyle = body; ctx.fill();
    ctx.fillStyle = mixHex(body, '#000000', 0.2); ctx.fillRect(x0, 700, x1 - x0, 10);
    // awning
    for (let i = 0; i < 6; i++) {
      const a = lerp(x0 - 8, x1 + 8, i / 6), b = lerp(x0 - 8, x1 + 8, (i + 1) / 6);
      ctx.beginPath(); ctx.moveTo(a, 730); ctx.lineTo(b, 730); ctx.lineTo(b + 3, 772); ctx.arc((a + b) / 2 + 3, 772, (b - a) / 2, 0, Math.PI); ctx.closePath();
      ctx.fillStyle = i % 2 ? '#e8edf8' : stripe; ctx.fill();
    }
    ctx.save(); ctx.translate((x0 + x1) / 2, 655);
    roundRect(ctx, -120, -34, 240, 68, 12); ctx.fillStyle = '#15182e'; ctx.fill();
    ctx.font = H.font('display', 36); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e8edf8'; ctx.fillText(sign, 0, 3);
    ctx.restore();
    const dw = 170, top = 810;
    K.glow(ctx, doorX, 900, 200, ACC, 0.05 + 0.3 * openAmt);
    roundRect(ctx, doorX - dw / 2 - 8, top - 8, dw + 16, 1000 - top + 8, 8); ctx.fillStyle = '#1a1d36'; ctx.fill();
    ctx.fillStyle = '#fff1c4'; ctx.fillRect(doorX - dw / 2, top, dw, 1000 - top);
    const half = (dw / 2) * (1 - 0.88 * openAmt);
    ctx.fillStyle = mixHex(body, '#ffffff', 0.25);
    ctx.fillRect(doorX - dw / 2, top, half, 1000 - top); ctx.fillRect(doorX + dw / 2 - half, top, half, 1000 - top);
    if (openAmt < 0.05) { ctx.fillStyle = '#2a2f45'; ctx.fillRect(doorX - 2, top, 4, 1000 - top); }
  }

  // left store: open at first, slams shut
  const shut = smooth((t - tShut) / 0.3);
  const lDoor = 260, rDoor = 730;
  store(50, 470, '#5a3f6e', '#b07ad6', P.leftSign || 'SHOP', lDoor, 1 - shut);
  store(520, 1010, '#2f4f7a', '#4f8fd6', P.rightSign || 'SHOP', rDoor, 1);
  // welcome mat on the right
  ctx.beginPath(); ctx.moveTo(rDoor - 100, 1040); ctx.lineTo(rDoor + 100, 1040); ctx.lineTo(rDoor + 80, 1004); ctx.lineTo(rDoor - 80, 1004); ctx.closePath();
  ctx.fillStyle = ACC; ctx.fill();

  // right: robots stroll in on a loop, staggered (each enters and fades into the door)
  for (let i = 0; i < 3; i++) {
    const per = 2.4, ph = ((t + i * 0.8) % per) / per;
    const x = lerp(560, rDoor, smooth(ph));
    const a = 1 - smooth((ph - 0.7) / 0.3);
    if (a <= 0.02) continue;
    ctx.save(); ctx.globalAlpha = a;
    K.drawRobot(ctx, x, feet - Math.abs(Math.sin(t * 6 + i)) * 5, 0.75 * (1 - 0.2 * ph), { t: t + i, state: 'happy', seed: 3 + i });
    ctx.restore();
  }

  // left: two agents walk up, bounce back after the doors shut
  const walk = smooth(clamp(t / Math.max(0.6, tShut)));
  for (let i = 1; i >= 0; i--) {
    const base = lerp(i ? -40 : -80, i ? 155 : 290, walk);
    const rec = smooth((t - tShut - 0.15 - i * 0.12) / 0.4) * (i ? 40 : 140);
    const sh = K.shake(t, tShut + 0.15, 0.4, 6);
    const x = base - rec + sh;
    K.drawRobot(ctx, x, feet - (t < tShut ? Math.abs(Math.sin(t * 6 + i)) * 5 : 0), i ? 0.8 : 0.95, { t: t + i * 2, state: t > tShut + 0.1 ? 'thinking' : 'idle', seed: 11 + i });
    if (i === 0) {
      const renamed = P.named && t > tName;
      const pk = K.popIn(t, 0.25, 0.4) * (renamed ? Math.min(1.08, 0.7 + 0.3 * K.popIn(t, tName, 0.4)) : 1);
      K.drawLabel(ctx, Math.max(130, x), 800, Math.min(1.08, pk), { text: renamed ? P.named : (P.agent || 'Outside agents'), size: 26, dot: true, accent: !!renamed });
    }
  }
  // stamp on the left doors
  const st = (t - tShut - 0.25) / 0.5;
  if (st > 0) K.drawStamp(ctx, lDoor + 50, 985, 0.7, { kind: 'cross', text: P.stamp || 'BLOCKED', land: st });

  // name pills
  const lf = clamp(1 - Math.abs(t - tLeft - 0.2) / 0.4);
  if (lf > 0) K.glow(ctx, 260, 560, 150, danger, 0.4 * lf);
  K.drawLabel(ctx, 260, 585, Math.min(1.05, K.popIn(t, Math.min(0.3, tLeft), 0.4)) * (1 + 0.08 * lf), { text: P.left || 'Store A', size: 30, dot: true });
  K.drawLabel(ctx, 730, 585, Math.min(1.05, K.popIn(t, 0.2, 0.4)), { text: P.right || 'Store B', size: 30, dot: true, accent: true });
  // vs chip
  const vk = K.popIn(t, tVs, 0.4);
  if (vk > 0) {
    ctx.save(); ctx.translate(495, 500); ctx.scale(vk * (1 + 0.04 * Math.sin(t * 4)), vk * (1 + 0.04 * Math.sin(t * 4)));
    ctx.fillStyle = '#0e101c'; ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.font = H.font('display', 36); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.vs || 'vs', 0, 2);
    ctx.restore();
  }
  if (P.caption) { const ck = K.popIn(t, tCap, 0.4); if (ck > 0) K.drawLabel(ctx, 487, 460, Math.min(1.05, ck), { text: P.caption, size: 28 }); }
}
