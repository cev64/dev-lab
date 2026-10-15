// Scene "wafer-lab-v2" (full frame, kit v2 + motion.js). The chip clean room (world2.factory): a big silicon wafer
// floats and slowly turns over a lit pedestal; a worker in a clean-room suit stands beside it. "Why care?": a curious
// head-tilt take. At aiCue three everyday AI devices (phone, laptop, a generic assistant bot, never the mascot) pop up
// on a bench one after another (anticipation, overshoot, squash) and curved beams of light run from the wafer to each.
// At quoteCue a verbatim quote card swings in on an arc (attributed by role, text only). At nmCue the camera pushes in,
// a share of the dies lights up as a sweeping sector with a pop per die, the worker points, and a "33%" panel lands.
// params: quote, by, nmShare, nmText, nmLabel, nmSub, devicesLabel, cues aiCue, quoteCue, nmCue (as v1 wafer-lab).
export default function draw(ctx, t, info) {
  const H = info.helpers, K2 = H.kit2, M = H.motion, P = info.params || {};
  const { clamp, lerp, ease } = M;
  const D = info.duration, ACC = info.accent;
  const cue = (w, fb) => { const v = w != null ? info.timeOf(w) : null; return v != null ? v : fb; };
  const aiAt = cue(P.aiCue, D * 0.1), qAt = cue(P.quoteCue, D * 0.35), nmAt = cue(P.nmCue, D * 0.72);
  const share = P.nmShare != null ? +P.nmShare : 0.33;

  const ck = (tt, x, z) => ({ t: tt, x, y: 305 - 318 / z, zoom: z });
  const cam = K2.cam(t, [ck(0, -150, 1.3), ck(aiAt - 0.3, -140, 1.3), ck(aiAt + 1.2, 30, 1.0), ck(qAt - 0.2, 30, 1.02), ck(qAt + 1.2, 10, 1.06),
    ck(nmAt - 0.4, 0, 1.06), ck(nmAt + 0.8, -40, 1.16), ck(D, -45, 1.19)]);
  const W = K2.world2.factory(ctx, { t, cam });
  const L = W.light;

  const WC = [470, 680], WR = 150;                         // wafer centre + radius (world)
  const bob = Math.sin(t * 1.3) * 7, rot = t * 0.1;
  const nmU = ease.inOut(clamp((t - nmAt - 0.1) / 1.3), 1.6);

  // ---------------------------------------------------------------- worker
  const WX = 205, WS = 1.4;
  const why = M.act(t, 0.05, { timing: 'normal', wind: 0.35, exag: 1.2 });
  const pres = M.act(t, aiAt - 0.25, { timing: 'normal', wind: 0.3 });
  const point = M.act(t, nmAt + 0.9, { timing: 'normal', wind: 0.45, exag: 1.15 });
  let pose = 'stand', pose2 = 'shrug', poseMix = clamp(why.v) * 0.55, facing = 0.5, look = 0.1, expr = 'neutral', expr2 = 'curious', exprMix = clamp(why.v), squash = 0, nod = 0, exag = 1.2;
  let tilt = why.phase === 'before' ? 0 : 0.12 * clamp(why.v) * (1 - ease.inOut((t - aiAt) / 0.5));
  squash = why.phase === 'anticipate' ? -0.06 * why.wind : M.squashImpact(t, why.hit, 0.06, 0.4);
  if (pres.phase !== 'before') { pose = 'shrug'; pose2 = 'present'; poseMix = clamp(pres.v); look = 0.6; expr = 'curious'; expr2 = 'happy'; exprMix = clamp(pres.v); exag = 1; }
  if (t > qAt - 0.3) { const ls = ease.inOut((t - qAt + 0.3) / 0.6); pose = 'present'; pose2 = 'hips'; poseMix = ls; look = lerp(0.6, 0.25, ls); expr = 'happy'; expr2 = 'smirk'; exprMix = ls * 0.6; nod = 0.08 * Math.sin(clamp((t - qAt) / 0.9) * Math.PI); }
  if (point.phase !== 'before') { pose = 'hips'; pose2 = 'point'; poseMix = clamp(point.v); look = 0.4; expr = 'smirk'; expr2 = 'joy'; exprMix = clamp(point.v) * 0.8; squash = point.phase === 'anticipate' ? -0.05 * point.wind : M.squashImpact(t, point.hit, 0.06, 0.4); }

  // ---------------------------------------------------------------- devices (bench on the right)
  const BENCH = { x0: 600, x1: 960, y: 930 };
  const devs = [{ x: 650, kind: 'phone' }, { x: 775, kind: 'laptop' }, { x: 890, kind: 'assistant' }];

  W.stage(ctx, () => {
    // pedestal: tapered column with a light ring, contact shadow
    K2.contactShadow(ctx, WC[0], 1030, 220, 0.55, 0.12);
    K2.solid(ctx, () => { ctx.beginPath(); ctx.moveTo(WC[0] - 70, 1030); ctx.lineTo(WC[0] + 70, 1030); ctx.lineTo(WC[0] + 40, 870); ctx.lineTo(WC[0] - 40, 870); ctx.closePath(); }, K2.mat('#e3e8f2', L), [WC[0] - 70, 870, 140, 160], L.dir, { rim: 3, ao: 0.3 });
    K2.solid(ctx, () => { ctx.beginPath(); ctx.ellipse(WC[0], 868, 70, 16, 0, 0, Math.PI * 2); }, K2.mat('#c3cbdb', L), [WC[0] - 70, 852, 140, 32], L.dir, { rim: 2, top: 0.5 });
    ctx.save(); ctx.translate(WC[0], 862); ctx.scale(1, 0.25); K2.glow(ctx, 0, 0, 120, ACC, 0.35 + 0.1 * Math.sin(t * 3)); ctx.restore();
    // light column from the pedestal to the wafer
    const lg = ctx.createLinearGradient(0, WC[1], 0, 866); lg.addColorStop(0, 'rgba(255,225,74,0)'); lg.addColorStop(1, 'rgba(255,225,74,0.22)');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.moveTo(WC[0] - 60, 866); ctx.lineTo(WC[0] + 60, 866); ctx.lineTo(WC[0] + 110, WC[1] + bob); ctx.lineTo(WC[0] - 110, WC[1] + bob); ctx.closePath(); ctx.fill();
    // bench
    K2.contactShadow(ctx, (BENCH.x0 + BENCH.x1) / 2, 1030, BENCH.x1 - BENCH.x0 + 40, 0.5, 0.1);
    K2.solid(ctx, () => { ctx.beginPath(); ctx.roundRect(BENCH.x0, BENCH.y, BENCH.x1 - BENCH.x0, 22, 8); }, K2.mat('#d8dee9', L), [BENCH.x0, BENCH.y, BENCH.x1 - BENCH.x0, 22], L.dir, { rim: 2, top: 0.5 });
    for (const lx of [BENCH.x0 + 30, BENCH.x1 - 30]) K2.limb(ctx, [lx, BENCH.y + 20], [lx, 1028], 8, 8, K2.mat('#9aa4ba', L), L.dir);
    // beams (curved, dashed, flowing) from the wafer to the devices
    devs.forEach((d, i) => {
      const bp = ease.inOut(clamp((t - (aiAt + 0.35 + i * 0.22)) / 0.6)), out = ease.in(clamp((t - (nmAt - 0.5)) / 0.5));
      if (bp <= 0 || out >= 1) return;
      const p0 = [WC[0] + 90, WC[1] + bob + 60], p1 = [d.x, BENCH.y - (d.kind === 'phone' ? 110 : d.kind === 'laptop' ? 120 : 150)];
      ctx.save(); ctx.globalAlpha = 1 - out; ctx.strokeStyle = 'rgba(255,225,74,0.75)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.setLineDash([4, 14]); ctx.lineDashOffset = -t * 70;
      ctx.beginPath(); for (let k = 0; k <= 24; k++) { const p = M.arc(p0, p1, (k / 24) * bp, 50 + i * 20, (x) => x); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke();
      const tip = M.arc(p0, p1, bp, 50 + i * 20, (x) => x); K2.glow(ctx, tip[0], tip[1], 34, ACC, 0.6 * (1 - out));
      ctx.restore();
    });
    // devices pop up one after another (anticipation squash, overshoot, settle)
    devs.forEach((d, i) => {
      const a = M.act(t, aiAt + i * 0.22, { timing: 'snappy', wind: 0.35, overshoot: 0.22 });
      if (a.phase === 'before') return;
      let sc = a.phase === 'anticipate' ? 0.06 : Math.max(0, a.v), sq = a.phase === 'anticipate' ? 0 : a.phase === 'action' ? 0.25 * (1 - a.k) : M.squashImpact(t, a.hit, 0.15, 0.4);
      if (a.phase === 'anticipate') { K2.glow(ctx, d.x, BENCH.y - 20, 60, ACC, 0.6 * a.wind); return; }
      ctx.save(); ctx.translate(d.x, BENCH.y); ctx.scale(sc, sc); M.squashTransform(ctx, 0, 0, sq, 0); ctx.translate(-d.x, -BENCH.y);
      if (d.kind === 'phone') K2.drawPhone(ctx, d.x, BENCH.y, 0.75, { t, light: L, screen: 'chat', bubbles: 3, glow: 0.9 });
      else if (d.kind === 'laptop') K2.drawLaptop(ctx, d.x, BENCH.y, 0.52, { t, light: L, screen: 'chat' });
      else K2.drawAssistant(ctx, d.x, BENCH.y, 0.46, { t, light: L, mood: t > qAt ? 'happy' : 'thinking', facing: -0.4 });
      ctx.restore();
    });
    // the wafer
    wafer(ctx, K2, M, t, WC[0], WC[1] + bob, WR, rot, share * nmU, nmAt, ACC);
    // worker
    K2.drawHuman(ctx, WX, 1030, WS, {
      t, seed: 21, age: 'adult', outfit: 'cleanroom', skin: 0, eyes: 2, body: 'slim', pose, pose2, poseMix, facing, look, expr, expr2, exprMix,
      squash, nod, exag, light: L, rig: { tilt },
    });
  });
  W.front(ctx);

  // ---------------------------------------------------------------- overlays
  const lpOut = ease.in((t - (qAt - 0.35)) / 0.3);
  pill(ctx, K2, M, t, 487, 455, P.devicesLabel || 'AI tools run on chips', aiAt + 0.6, lpOut, { size: 32, dot: true });
  // quote card: swings in on an arc from the left with a slight overshoot rotation, leaves up-left before nmCue
  const qa = M.act(t, qAt - 0.1, { timing: 'normal', wind: 0.25, overshoot: 0.06 });
  const qOut = ease.in(clamp((t - (nmAt - 0.55)) / 0.45));
  if (qa.phase !== 'before' && qOut < 1) {
    const k = clamp(qa.v, -0.3, 1.1);
    const p = k < 0 ? [-500 + k * 60, 520] : M.arc([-500, 560], [598, 500], Math.min(1, k), 60, (x) => x);
    const px = p[0] + (k > 1 ? (k - 1) * 60 : 0) + qOut * 700, py = p[1] - qOut * 120;
    const rotq = (1 - Math.min(1, Math.max(0, k))) * -0.12 + M.settle(t, qa.hit, 0.03, 1.4, 3) + qOut * 0.2;
    ctx.save(); ctx.translate(px, py); ctx.rotate(rotq);
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 10;
    ctx.fillStyle = 'rgba(244,245,252,0.98)'; ctx.beginPath(); ctx.roundRect(-310, -98, 620, 196, 26); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.fillStyle = ACC; ctx.fillRect(-310, -78, 10, 156);
    ctx.fillStyle = '#1a1d33'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    const q = P.quote || '\u201cstrong demand for our leading-edge process technologies\u201d';
    let fs = 32; ctx.font = K2.font.bold(fs); let lines = wrap(ctx, q, 550);
    while (lines.length > 3 && fs > 24) { fs--; ctx.font = K2.font.bold(fs); lines = wrap(ctx, q, 550); }
    lines.forEach((l, i) => ctx.fillText(l, -276, -48 + i * (fs + 9)));
    ctx.font = K2.font.ui(22); ctx.fillStyle = '#5a5f80'; ctx.fillText(P.by || '', -276, 78);
    ctx.restore();
  }
  // 3 nm panel
  const np = M.act(t, nmAt + 0.3, { timing: 'snappy', wind: 0.3, overshoot: 0.14 });
  if (np.phase === 'anticipate') K2.glow(ctx, 600, 470, 100, ACC, 0.5 * np.wind);
  else if (np.phase !== 'before') {
    const v = Math.max(0, np.v), sx = np.phase === 'action' ? 1 + 0.12 * (1 - np.k) : 1;
    ctx.save(); ctx.translate(600, 470); ctx.scale(v * sx, v / sx);
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
    ctx.fillStyle = 'rgba(8,10,24,0.9)'; ctx.beginPath(); ctx.roundRect(-300, -70, 600, 140, 26); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,225,74,0.4)'; ctx.stroke();
    ctx.fillStyle = ACC; ctx.font = K2.font.display(64); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.nmText || '33%', -270, 4);
    ctx.fillStyle = '#ffffff'; let fs = 34; ctx.font = K2.font.bold(fs); const l1 = P.nmLabel || '3-nanometer chips'; while (ctx.measureText(l1).width > 350 && fs > 24) { fs--; ctx.font = K2.font.bold(fs); }
    ctx.fillText(l1, -95, -22);
    ctx.font = K2.font.ui(26); ctx.fillStyle = 'rgba(255,255,255,0.78)'; ctx.fillText(P.nmSub || 'of wafer revenue', -95, 26);
    ctx.restore();
  }
}

// face-on wafer: iridescent disc, die grid (rotating), lit sector (share, measured clockwise from the top), rim, sheen
function wafer(ctx, K2, M, t, x, y, r, rot, lit, nmAt, ACC) {
  ctx.save(); ctx.translate(x, y);
  K2.glow(ctx, 0, 0, r * 1.8, ACC, 0.1 + 0.05 * Math.sin(t * 2) + 0.25 * Math.max(0, 1 - Math.abs(t - nmAt - 0.6)));
  // edge thickness (solid drawing): darker disc offset down
  ctx.fillStyle = '#4a5068'; ctx.beginPath(); ctx.arc(0, 6, r, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.clip();
  const g = ctx.createLinearGradient(-r, -r, r, r); const h = Math.sin(t * 0.4) * 0.08;
  g.addColorStop(0, '#d9e2f7'); g.addColorStop(0.35 + h, '#9fb0e0'); g.addColorStop(0.6, '#c6b8f2'); g.addColorStop(0.8 - h, '#9fd8e0'); g.addColorStop(1, '#b7a8e8');
  ctx.fillStyle = g; ctx.fillRect(-r, -r, 2 * r, 2 * r);
  const cell = 25;
  for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
    const cx = i * cell, cy = j * cell;
    if (cx * cx + cy * cy > (r - 16) * (r - 16)) continue;
    const rx = cx * Math.cos(rot) - cy * Math.sin(rot), ry = cx * Math.sin(rot) + cy * Math.cos(rot);
    const a = ((Math.atan2(rx, -ry) / (Math.PI * 2)) + 1) % 1;
    const on = a < lit;
    // each die pops as the sweep reaches it (overshoot)
    const reach = lit > 0 ? (lit - a) / 0.05 : -1, pop = on ? 1 + 0.25 * Math.max(0, 1 - reach) * Math.sin(Math.min(1, reach) * Math.PI) : 1;
    const s = (cell - 5) * pop;
    ctx.fillStyle = on ? ACC : 'rgba(55,52,120,0.5)';
    ctx.beginPath(); ctx.roundRect(rx - s / 2, ry - s / 2, s, s, 3); ctx.fill();
    if (on) { ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(rx - s / 2 + 2, ry - s / 2 + 2, s - 4, 3); }
  }
  // sheen sweep
  const sh = ((t * 0.22) % 1.6) - 0.3;
  ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.beginPath(); ctx.moveTo(-r + sh * 2 * r, -r); ctx.lineTo(-r + sh * 2 * r + 40, -r); ctx.lineTo(-r + sh * 2 * r - 160, r); ctx.lineTo(-r + sh * 2 * r - 200, r); ctx.closePath(); ctx.fill();
  // key light from the left, shade on the right
  const sg = ctx.createRadialGradient(-r * 0.4, -r * 0.4, r * 0.2, 0, 0, r * 1.1); sg.addColorStop(0, 'rgba(255,255,255,0.18)'); sg.addColorStop(1, 'rgba(20,20,60,0.25)');
  ctx.fillStyle = sg; ctx.fillRect(-r, -r, 2 * r, 2 * r);
  ctx.restore();
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(0, 0, r, Math.PI * 0.9, Math.PI * 1.8); ctx.stroke();
  ctx.strokeStyle = 'rgba(160,170,210,0.6)'; ctx.beginPath(); ctx.arc(0, 0, r, -0.2, Math.PI * 0.9); ctx.stroke();
  // notch
  ctx.fillStyle = '#4a5068'; ctx.beginPath(); ctx.arc(0, r - 2, 7, Math.PI, 0); ctx.fill();
  ctx.restore();
}

function wrap(ctx, text, maxW) {
  const words = String(text).split(' '), lines = []; let cur = '';
  for (const w of words) { const n = cur ? cur + ' ' + w : w; if (ctx.measureText(n).width > maxW && cur) { lines.push(cur); cur = w; } else cur = n; }
  if (cur) lines.push(cur); return lines;
}

// ---------------------------------------------------------------- pills (screen space) with anticipation + overshoot
function popState(M, t, at) { return M.act(t, at - 0.14, { timing: 'snappy', wind: 0.3, overshoot: 0.16 }); }
function pill(ctx, K2, M, t, x, y, text, at, outK, o = {}) {
  const a = popState(M, t, at);
  if (a.phase === 'before' || outK >= 1) return;
  const ACC = K2.ACCENT.base;
  if (a.phase === 'anticipate') { K2.glow(ctx, x, y, 60, ACC, 0.5 * a.wind); ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(x, y, 10 * (1 - 0.6 * a.wind), 0, Math.PI * 2); ctx.fill(); return; }
  const v = Math.max(0, a.v), sx = a.phase === 'action' ? 1 + 0.12 * (1 - a.k) : 1 + M.squashImpact(t, a.hit, -0.08, 0.35) * 0.5;
  ctx.save();
  ctx.globalAlpha = 1 - (outK > 0 ? outK : 0);
  ctx.translate(x, y - (outK > 0 ? 24 * outK : 0)); ctx.scale(v * sx, v / sx);
  let fs = o.size || 28; ctx.font = K2.font.bold(fs);
  const maxW = o.maxW || 860, dotW = o.dot ? 30 : 0;
  let w = ctx.measureText(text).width;
  while (w + 60 + dotW > maxW && fs > 16) { fs--; ctx.font = K2.font.bold(fs); w = ctx.measureText(text).width; }
  const pw = w + 60 + dotW, ph = Math.round(fs * 2.05);
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, ph / 2);
  if (o.accent) { const g = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2); g.addColorStop(0, K2.ACCENT.light); g.addColorStop(1, ACC); ctx.fillStyle = g; }
  else ctx.fillStyle = 'rgba(12,14,30,0.9)';
  ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.lineWidth = 2; ctx.strokeStyle = o.accent ? 'rgba(255,255,255,0.5)' : 'rgba(255,225,74,0.4)'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.roundRect(-pw / 2 + 10, -ph / 2 + 4, pw - 20, ph * 0.32, ph * 0.16); ctx.fill();
  if (o.dot) { ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(-pw / 2 + 30, 0, 7 + Math.sin(t * 6) * 1.5, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = o.accent ? '#1a1d33' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, dotW / 2, 1);
  ctx.restore();
}
