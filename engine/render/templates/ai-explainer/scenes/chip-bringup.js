// Scene "chip-bringup" (full frame). An AI robot brings a new kind of chip online: the "port software to new hardware"
// story told with generic props (a GPU card, a server cabinet, a chip die, two islands), no logos, chip makers as text.
// modes:
//   hook    (cold open, ~3-4 s; action from frame 0): night server hall; the robot is already sliding a GPU card into an
//           empty slot of a big cabinet; it clicks in, the LEDs turn accent and a RUNNING pill pops; a wall calendar
//           ("before", e.g. "6-12 MONTHS") rips away to reveal "after" (e.g. "~3 DAYS") in the accent.
//   old     (~9-11 s): split office. Left: a crowd of cartoon engineers at desks while a month counter runs to `months`;
//           right (on newCue): the robot alone at a laptop, a day counter runs to `days`; bottom totals + source pill.
//   kernels (~10-12 s): a big chip die with a grid of empty slots; the robot fires code tiles that click into the slots
//           while a bar fills to `pct`; a title + gloss pill explain the word.
//   moat    (~11-14 s): two islands. Left island holds a fortress chip (`left`), ringed by a moat of code; small model
//           bots live there. On bridgeCue the robot lays code planks across; the bots walk to the right island
//           (`right`); a "switching cost" tag shrinks on cheapCue.
//   caveat  (~10-13 s): a slide on an easel shows the big claim with an asterisk; a magnifier slides to the footnote
//           and enlarges it; then "own claim" + "not verified" pills with a warning sign.
// params (all optional, generic defaults):
//   hook:    chip ("New GPUs"), before ("6-12 MONTHS"), after ("~3 DAYS"), running ("RUNNING")
//   old:     leftLabel ("Dozens of engineers"), rightLabel ("One AI model"), months (12), days (3),
//            leftTotal ("6-12 months"), rightTotal ("~3 days"), source (""), oldCue, newCue, sourceCue
//   kernels: title ("KERNELS"), gloss ("each chip's own low-level code"), pct (0.97), pctText ("almost 100%"),
//            barLabel ("written or ported by AI"), titleCue, fillCue, doneCue
//   moat:    left ("Chip A"), right ("Chip B"), moatLabel ("Software moat"), cost ("Switching cost"),
//            moatCue, bridgeCue, cheapCue
//   caveat:  claim ("~3 DAYS*"), fine ("*prompt processing, one model"), own ("Company's own claim"),
//            unverified ("Not independently verified"), fineCue, ownCue, verCue
// Cues are narration words ("word#n" = the (n+1)th time spoken in the scene) or seconds; else fractions of D.
// Fits: porting software to new chips, "used to take months, now days", hardware lock-in / switching costs,
// fine-print caveats on a company's own claim.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration;
  const at = (w, d) => {
    if (w == null || w === '') return d;
    if (typeof w === 'number') return w;
    const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? d : v;
  };
  const mode = P.mode || 'hook';
  const G = props(K, H, info.accent);
  ctx.save();
  if (mode === 'hook') hook(ctx, t, info, H, K, P, D, G);
  else if (mode === 'old') old(ctx, t, info, H, K, P, D, G, at);
  else if (mode === 'kernels') kernels(ctx, t, info, H, K, P, D, G, at);
  else if (mode === 'moat') moat(ctx, t, info, H, K, P, D, G, at);
  else caveat(ctx, t, info, H, K, P, D, G, at);
  ctx.restore();
}

// ---------------------------------------------------------------- hook
function hook(ctx, t, info, H, K, P, D, G) {
  const { clamp, smooth, lerp } = H, ACC = info.accent;
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 520, y: 740 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  K.world.serverHall(ctx, { t, activity: 0.35 });
  ctx.fillStyle = 'rgba(6,8,20,0.45)'; ctx.fillRect(0, 0, 1080, 1920);
  const clickAt = 0.95, ripAt = 1.25, FLOOR = 1035;
  // cabinet (right)
  const CX = 730, CY0 = 455, CW = 250, CH = FLOOR - CY0, slotY = 735;
  K.shadow(ctx, CX, FLOOR, 300);
  G.rr(ctx, CX - CW / 2, CY0, CW, CH, 14, '#1f2547');
  G.rr(ctx, CX - CW / 2 + 12, CY0 + 12, CW - 24, CH - 24, 10, '#141932');
  const on = smooth(clamp((t - clickAt) / 0.5));
  for (let i = 0; i < 9; i++) {
    const y = CY0 + 30 + i * 62;
    if (Math.abs(y + 22 - slotY) < 30) continue; // the empty slot
    G.rr(ctx, CX - CW / 2 + 24, y, CW - 48, 44, 6, '#262d55');
    for (let l = 0; l < 4; l++) {
      const blink = H.hash(i * 7 + l, Math.floor(t * 6 + i)) > 0.45;
      const col = on > 0.5 ? (blink ? ACC : H.mixHex(ACC, '#203020', 0.5)) : (blink ? '#ff6b5e' : '#5a2b33');
      G.circle(ctx, CX + 50 + l * 18, y + 22, 5, col);
      if (on > 0.5 && blink) K.glow(ctx, CX + 50 + l * 18, y + 22, 16, ACC, 0.35);
    }
    G.rr(ctx, CX - CW / 2 + 36, y + 14, 70, 16, 4, '#1a1f3d');
  }
  // empty slot glow
  G.rr(ctx, CX - CW / 2 + 22, slotY - 26, CW - 44, 52, 6, '#05070f');
  if (t < clickAt) K.glow(ctx, CX, slotY, 120, ACC, 0.25 + 0.1 * Math.sin(t * 9));
  // the robot, pushing
  const push = smooth(clamp(t / clickAt));
  const rx = lerp(395, 455, push);
  K.drawRobot(ctx, rx, FLOOR, 1.42, { t, state: t > ripAt + 0.5 ? 'happy' : 'working', seed: 3 });
  // GPU card: from the robot's hands into the slot
  const cardX = lerp(500, CX - 30, push), cardY = lerp(845, slotY, push);
  const inset = smooth(clamp((t - clickAt + 0.25) / 0.3));
  if (t < clickAt + 0.05) G.gpu(ctx, cardX, cardY, 1.0 - 0.05 * push, t, 1 - inset * 0.7);
  else G.rr(ctx, CX - CW / 2 + 26, slotY - 22, CW - 52, 44, 6, '#2e3a2a');
  // click flash + burst
  const fl = clamp(1 - (t - clickAt) / 0.5);
  if (t > clickAt && fl > 0) {
    K.glow(ctx, CX, slotY, 220, ACC, 0.7 * fl);
    ctx.strokeStyle = H.rgba(ACC, fl); ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r0 = 70 + (1 - fl) * 40, r1 = r0 + 40; ctx.beginPath(); ctx.moveTo(CX + Math.cos(a) * r0, slotY + Math.sin(a) * r0); ctx.lineTo(CX + Math.cos(a) * r1, slotY + Math.sin(a) * r1); ctx.stroke(); }
  }
  if (t > clickAt) G.rr(ctx, CX - CW / 2 + 26, slotY - 22, CW - 52, 44, 6, H.mixHex('#2e3a2a', ACC, 0.25 * on));
  const cp = K.popIn(t, 0.0, 0.35);
  K.drawLabel(ctx, CX, 430, cp, { text: P.chip || 'New GPUs', size: 28, dot: true });
  const rp = K.popIn(t, clickAt + 0.1, 0.4);
  if (rp > 0) K.drawLabel(ctx, CX, slotY + 75, rp, { text: P.running || 'RUNNING', size: 28, accent: true });
  // calendar (left, on the wall)
  G.calendar(ctx, 285, 590, 0.95, { t, before: P.before || '6-12 MONTHS', after: P.after || '~3 DAYS', rip: (t - ripAt) / 0.55, ACC });
}

// ---------------------------------------------------------------- old (split: crowd vs robot)
function old(ctx, t, info, H, K, P, D, G, at) {
  const { clamp, smooth, lerp } = H, ACC = info.accent;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 735 }]);
  K.world.office(ctx, { t, time: 'night' });
  ctx.fillStyle = 'rgba(8,10,28,0.55)'; ctx.fillRect(0, 0, 1080, 1920);
  const tOld = Math.max(0.1, at(P.oldCue, D * 0.12) - 0.3), tNew = at(P.newCue, D * 0.62) - 0.3, tSrc = at(P.sourceCue, D * 0.45) - 0.2;
  // divider
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 3; ctx.setLineDash([12, 12]);
  ctx.beginPath(); ctx.moveTo(500, 420); ctx.lineTo(500, 1040); ctx.stroke(); ctx.setLineDash([]);
  // left: crowd of engineers, 3 rows x 4
  const lp = K.popIn(t, tOld - 0.2, 0.4);
  K.drawLabel(ctx, 280, 455, lp, { text: P.leftLabel || 'Dozens of engineers', size: 28 });
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    const i = r * 4 + c, x = 125 + c * 105 - (r % 2) * 10, y = 745 + r * 108;
    const pop = K.popIn(t, tOld + i * 0.06, 0.35);
    if (pop <= 0) continue;
    ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop); ctx.translate(-x, -y);
    K.drawPerson(ctx, x, y, 0.44, { t, pose: 'sit-laptop', typing: 1 + (i % 2), mood: t > tNew + 1 ? 'worried' : 'neutral', shirt: i % 5, hair: (i * 3) % 5, skin: (i * 2) % 5, hairStyle: ['short', 'long', 'bun', 'curly', 'none'][i % 5], seed: 20 + i });
    ctx.restore();
  }
  // left month counter
  const months = +P.months || 12;
  const mu = smooth(clamp((t - tOld) / Math.max(1.5, tNew - tOld)));
  const m = Math.max(1, Math.ceil(mu * months));
  if (lp > 0) G.counter(ctx, 280, 540, `MONTH ${m}`, lp, '#ffffff', '#e8786a');
  // right: robot alone
  const rpop = K.popIn(t, tNew - 0.1, 0.45);
  const rl = K.popIn(t, tNew, 0.4);
  K.drawLabel(ctx, 705, 455, rl, { text: P.rightLabel || 'One AI model', size: 28, accent: true });
  if (rpop > 0) {
    ctx.save(); ctx.globalAlpha = clamp(rpop);
    K.drawRobot(ctx, 640, 960, 1.2 * Math.min(1, rpop), { t, state: t > tNew + 2.2 ? 'happy' : 'working', seed: 3 });
    K.drawDesk(ctx, 700, 1000, 0.95);
    K.drawLaptop(ctx, 780, 1000 - 104, 0.55, { t, screen: 'code', typing: t < tNew + 2.2 ? 2 : 0 });
    ctx.restore();
    const days = +P.days || 3;
    const d = Math.max(1, Math.ceil(smooth(clamp((t - tNew) / 1.8)) * days));
    G.counter(ctx, 705, 540, `DAY ${d}`, rl, ACC, '#2e5a2a');
  } else {
    // empty desk waiting, dim
    ctx.globalAlpha = 0.35; K.drawDesk(ctx, 700, 1000, 0.95); ctx.globalAlpha = 1;
  }
  // totals
  const tl = K.popIn(t, tSrc, 0.4);
  if (tl > 0) {
    G.bigText(ctx, 280, 1015, P.leftTotal || '6-12 months', 40, '#ffffff', tl);
  }
  const tr = K.popIn(t, tNew + 1.9, 0.45);
  if (tr > 0) G.bigText(ctx, 705, 1015, P.rightTotal || '~3 days', 46, ACC, tr);
  if (P.source && tl > 0) K.drawLabel(ctx, 280, 614, tl, { text: P.source, size: 24 });
}

// ---------------------------------------------------------------- kernels (chip die filling with code tiles)
function kernels(ctx, t, info, H, K, P, D, G, at) {
  const { clamp, smooth, lerp } = H, ACC = info.accent;
  K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 487, y: 730 }, { t: D, zoom: 1.06, x: 470, y: 735 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false });
  ctx.fillStyle = 'rgba(6,8,22,0.5)'; ctx.fillRect(0, 0, 1080, 1920);
  const tTitle = Math.max(0.1, at(P.titleCue, D * 0.2) - 0.3), tFill = at(P.fillCue, D * 0.55) - 0.2, tDone = Math.min(D - 0.8, at(P.doneCue, D * 0.9));
  // chip package
  const CX = 400, CY = 735, S = 330;
  const cp = K.popIn(t, 0.05, 0.5);
  ctx.save(); ctx.translate(CX, CY); ctx.scale(cp, cp);
  ctx.strokeStyle = '#c9a54a'; ctx.lineWidth = 6;
  for (let i = 0; i < 9; i++) {
    const o = -S / 2 + 30 + i * (S - 60) / 8;
    for (const [x0, y0, x1, y1] of [[o, -S / 2, o, -S / 2 - 22], [o, S / 2, o, S / 2 + 22], [-S / 2, o, -S / 2 - 22, o], [S / 2, o, S / 2 + 22, o]]) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
  }
  G.rr(ctx, -S / 2, -S / 2, S, S, 22, '#2a3150');
  G.rr(ctx, -S / 2 + 18, -S / 2 + 18, S - 36, S - 36, 14, '#171c36');
  // die grid 5x5
  const N = 5, cell = (S - 70) / N, g0 = -S / 2 + 35;
  const pct = P.pct == null ? 0.97 : +P.pct, total = N * N;
  const fillU = smooth(clamp((t - tFill) / Math.max(1.2, tDone - tFill)));
  const filled = Math.floor(fillU * total * pct + 1e-6);
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const k = order(r, c, N), x = g0 + c * cell, y = g0 + r * cell;
    const isOn = k < filled;
    G.rr(ctx, x + 4, y + 4, cell - 8, cell - 8, 6, isOn ? H.mixHex('#1d3a22', ACC, 0.55) : '#232a4a');
    if (isOn) { ctx.fillStyle = H.rgba('#0b1020', 0.7); ctx.font = H.font('ui', 16); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('</>', x + cell / 2, y + cell / 2 + 1); }
  }
  ctx.restore();
  // robot (right) firing tiles
  const RX = 815, FLOOR = 1030;
  K.drawRobot(ctx, RX, FLOOR, 1.15, { t, state: t > tDone ? 'happy' : (t > tFill ? 'working' : 'thinking'), seed: 3, flip: true });
  if (t > tFill && t < tDone) {
    for (let i = 0; i < 3; i++) {
      const u = (t * 1.4 + i / 3) % 1;
      const x = lerp(RX - 70, CX + 60, u), y = lerp(760, CY - 30, u) - Math.sin(u * Math.PI) * 120;
      ctx.save(); ctx.globalAlpha = Math.sin(u * Math.PI); ctx.translate(x, y); ctx.rotate(u * 3);
      G.rr(ctx, -22, -22, 44, 44, 8, ACC); ctx.fillStyle = '#10200f'; ctx.font = H.font('ui', 16); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('</>', 0, 1);
      ctx.restore();
    }
  }
  // title + gloss
  const tp = K.popIn(t, tTitle, 0.45);
  if (tp > 0) G.bigText(ctx, 487, 452, P.title || 'KERNELS', 58, '#ffffff', tp);
  const gp = K.popIn(t, tTitle + 0.5, 0.4);
  if (gp > 0) K.drawLabel(ctx, 487, 525, gp, { text: P.gloss || "each chip's own low-level code", size: 26 });
  // bar
  const bp = K.popIn(t, tFill - 0.2, 0.4);
  if (bp > 0) {
    const X0 = 150, X1 = 740, Y = 975;
    ctx.save(); ctx.globalAlpha = clamp(bp);
    G.rr(ctx, X0, Y, X1 - X0, 34, 17, '#232a4a');
    G.rr(ctx, X0, Y, Math.max(34, (X1 - X0) * fillU * pct), 34, 17, ACC);
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#dfe5ff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.barLabel || 'written or ported by AI', X0, Y - 26);
    ctx.restore();
    const dp = K.popIn(t, tDone - 0.3, 0.45);
    if (dp > 0) G.bigText(ctx, 632, Y - 28, P.pctText || 'almost 100%', 34, ACC, dp);
  }
}
function order(r, c, N) { // fill order: spiral-ish deterministic shuffle
  const idx = r * N + c; return (idx * 7 + 3) % (N * N);
}

// ---------------------------------------------------------------- moat (two islands, a bridge of code)
function moat(ctx, t, info, H, K, P, D, G, at) {
  const { clamp, smooth, lerp } = H, ACC = info.accent;
  K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 487, y: 730 }, { t: D, zoom: 1.06, x: 500, y: 740 }]);
  const tMoat = Math.max(0.15, at(P.moatCue, D * 0.2) - 0.3), tBridge = at(P.bridgeCue, D * 0.5) - 0.3, tCheap = at(P.cheapCue, D * 0.75) - 0.3;
  // night sky + water
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#0d1230'); g.addColorStop(0.42, '#1b2350'); g.addColorStop(0.43, '#0f2a44'); g.addColorStop(1, '#06121f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 40; i++) { const x = H.hash(i, 1) * 1080, y = 120 + H.hash(i, 2) * 650; ctx.globalAlpha = 0.3 + 0.4 * (0.5 + 0.5 * Math.sin(t * 2 + i)); G.circle(ctx, x, y, 1.5 + H.hash(i, 3) * 1.5, '#dfe6ff'); }
  ctx.globalAlpha = 1;
  // code-glyph waves (the moat)
  const glyphs = ['{ }', '</>', '0101', 'fn()', ';;', '[ ]'];
  ctx.font = H.font('ui', 24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let row = 0; row < 7; row++) for (let i = 0; i < 9; i++) {
    const y = 840 + row * 70, x = ((i * 150 + t * (30 + row * 6) * (row % 2 ? -1 : 1)) % 1350 + 1350) % 1350 - 135;
    ctx.fillStyle = H.rgba('#6fb6ff', 0.18 + 0.05 * row * (tMoat < t ? 1 : 0.5)); ctx.fillText(glyphs[(i + row) % glyphs.length], x, y + Math.sin(t * 2 + i) * 6);
  }
  // islands
  const LI = { x: 300, y: 900 }, RI = { x: 790, y: 900 };
  G.island(ctx, LI.x, LI.y, 0.95); G.island(ctx, RI.x, RI.y, 0.8);
  // fortress chip on the left island
  G.fortress(ctx, LI.x, LI.y - 10, 0.85, t, ACC);
  K.drawLabel(ctx, LI.x, 500, K.popIn(t, 0.1, 0.4), { text: P.left || 'Chip A', size: 30, dot: true });
  // plain chip on the right island
  G.chipTile(ctx, RI.x, RI.y - 95, 0.95, t, t > tBridge + 2 ? ACC : '#7d89b8');
  K.drawLabel(ctx, RI.x, 500, K.popIn(t, 0.3, 0.4), { text: P.right || 'Chip B', size: 30, dot: true });
  // moat ring label
  const mp = K.popIn(t, tMoat, 0.45);
  if (mp > 0) {
    ctx.save(); ctx.globalAlpha = clamp(mp); ctx.strokeStyle = H.rgba('#6fb6ff', 0.75); ctx.lineWidth = 6; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 30;
    ctx.beginPath(); ctx.ellipse(LI.x, LI.y - 10, 190 * mp, 66 * mp, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    K.drawLabel(ctx, LI.x, 1035, mp, { text: P.moatLabel || 'Software moat', size: 26 });
  }
  // bridge of code planks, laid right -> left by the robot
  const bu = smooth(clamp((t - tBridge) / 1.6));
  const BX0 = RI.x - 120, BX1 = LI.x + 150, BY = 880;
  const planks = 9;
  for (let i = 0; i < planks; i++) {
    const u = i / (planks - 1);
    if (u > bu + 1e-6) break;
    const x = lerp(BX0, BX1, u), y = BY - Math.sin(u * Math.PI) * 40;
    G.rr(ctx, x - 22, y - 9, 40, 18, 5, H.mixHex('#8a6a3a', ACC, 0.35));
  }
  // robot builder on the right island, walks onto the bridge end
  const rX = lerp(RI.x + 60, RI.x + 40, bu);
  K.drawRobot(ctx, rX, RI.y - 12, 0.85, { t, state: t > tBridge && bu < 1 ? 'working' : (bu >= 1 ? 'happy' : 'idle'), seed: 3, flip: true });
  // little model bots: live on the left, cross after the bridge is done
  for (let i = 0; i < 3; i++) {
    const st = tBridge + 1.7 + i * 0.5, u = smooth(clamp((t - st) / 2.0));
    let x, y;
    if (u <= 0) { x = LI.x - 90 + i * 30; y = LI.y - 20 + (i % 2) * 8; }
    else { x = lerp(BX1, BX0 + 30, u); y = BY - 10 - Math.sin(u * Math.PI) * 40; if (u >= 1) x = RI.x - 120 + i * 45; }
    if (u >= 1) y = RI.y - 18;
    G.miniBot(ctx, x, y + Math.abs(Math.sin(t * 6 + i)) * -5 * (u > 0 && u < 1 ? 1 : 0.3), 0.8, ACC);
  }
  // switching-cost tag shrinking
  const cpop = K.popIn(t, tMoat + 0.8, 0.45);
  if (cpop > 0) {
    const shrink = smooth(clamp((t - tCheap) / 0.9));
    const s = lerp(1.0, 0.8, shrink);
    G.tag(ctx, 800, 640, s * cpop, P.cost || 'Switching cost', t, shrink, ACC);
  }
}

// ---------------------------------------------------------------- caveat (fine print under a magnifier)
function caveat(ctx, t, info, H, K, P, D, G, at) {
  const { clamp, smooth, lerp } = H, ACC = info.accent;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 487, y: 735 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true, plant: true });
  ctx.fillStyle = 'rgba(6,8,22,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
  const tFine = at(P.fineCue, D * 0.2) - 0.3, tOwn = at(P.ownCue, D * 0.6) - 0.3, tVer = at(P.verCue, D * 0.8) - 0.3;
  // easel + slide
  const SX0 = 140, SX1 = 840, SY0 = 470, SY1 = 820;
  ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(300, SY1); ctx.lineTo(240, 1035); ctx.moveTo(680, SY1); ctx.lineTo(740, 1035); ctx.moveTo(490, SY1); ctx.lineTo(490, 1000); ctx.stroke();
  const sp = K.popIn(t, 0.0, 0.4);
  ctx.save(); ctx.translate(490, (SY0 + SY1) / 2); ctx.scale(Math.max(0.01, sp), Math.max(0.01, sp)); ctx.translate(-490, -(SY0 + SY1) / 2);
  G.rr(ctx, SX0, SY0, SX1 - SX0, SY1 - SY0, 18, '#f2f4fa');
  G.rr(ctx, SX0, SY0, SX1 - SX0, 18, 9, ACC);
  const claim = P.claim || '~3 DAYS*';
  ctx.font = H.font('display', 104); ctx.fillStyle = '#141a33'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(claim, 490, 615);
  ctx.fillStyle = '#c3cadd'; for (let i = 0; i < 3; i++) G.rr(ctx, 230 + i * 30, 700 + i * 0, 0, 0, 0, '#000');
  G.rr(ctx, 240, 700, 500, 14, 7, '#d5dae8');
  // tiny footnote line
  const fine = P.fine || '*prompt processing, one model';
  ctx.font = H.font('body', 15); ctx.fillStyle = '#8a92a8'; ctx.fillText(fine, 490, 785);
  ctx.restore();
  // magnifier slides to the footnote, enlarged inside
  const mu = smooth(clamp((t - tFine) / 0.8));
  if (t > tFine - 0.2) {
    const mx = lerp(900, 490, mu), my = lerp(980, 830, mu), R = 160;
    ctx.save();
    ctx.beginPath(); ctx.arc(mx, my, R, 0, Math.PI * 2); ctx.closePath();
    ctx.fillStyle = '#f7f8fc'; ctx.fill(); ctx.clip();
    ctx.font = H.font('bold', 28); ctx.fillStyle = '#141a33'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const words = fine.split(/,\s*|\s+(?=processing)/);
    const zoomIn = smooth(clamp((t - tFine - 0.5) / 0.4));
    ctx.globalAlpha = zoomIn;
    words.forEach((w, i) => ctx.fillText(w, mx, my + (i - (words.length - 1) / 2) * 40));
    ctx.restore();
    ctx.strokeStyle = '#3a4270'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(mx, my, R, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = ACC; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(mx, my, R - 9, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = '#5a3d26'; ctx.lineWidth = 26; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(mx + R * 0.72, my + R * 0.72); ctx.lineTo(Math.min(mx + R * 0.72 + 70, 905), Math.min(my + R * 0.72 + 70, 1040)); ctx.stroke();
  }
  // own claim + not verified
  const op = K.popIn(t, tOwn, 0.4);
  if (op > 0) K.drawLabel(ctx, 490, 430, op, { text: P.own || "Company's own claim", size: 28 });
  const vp = K.popIn(t, tVer, 0.45);
  if (vp > 0) {
    K.drawWarning(ctx, 185, 1030, 0.75 * vp, { pulse: Math.sin(t * 5) * 0.5 + 0.5 });
    K.drawLabel(ctx, 520, 1010, vp, { text: P.unverified || 'Not independently verified', size: 28, accent: true });
  }
}

// ---------------------------------------------------------------- props (generic, no logos)
function props(K, H, ACC) {
  const { clamp, lerp, roundRect, rgba, mixHex, smooth } = H, TAU = Math.PI * 2;
  const rr = (ctx, x, y, w, h, r, fill) => { if (w <= 0 || h <= 0) return; roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); };
  const circle = (ctx, x, y, r, fill) => { ctx.beginPath(); ctx.arc(x, y, Math.max(0.1, r), 0, TAU); ctx.fillStyle = fill; ctx.fill(); };
  function bigText(ctx, x, y, text, size, color, pop) {
    ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(0.01, pop), Math.max(0.01, pop));
    ctx.font = H.font('display', size); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 8; ctx.strokeStyle = 'rgba(5,7,18,0.85)'; ctx.lineJoin = 'round'; ctx.strokeText(text, 0, 0);
    ctx.fillStyle = color; ctx.fillText(text, 0, 0); ctx.restore();
  }
  function counter(ctx, x, y, text, pop, color, bg) {
    ctx.save(); ctx.translate(x, y); ctx.scale(Math.max(0.01, pop), Math.max(0.01, pop));
    rr(ctx, -130, -40, 260, 80, 16, '#0d1230'); ctx.strokeStyle = color; ctx.lineWidth = 3; roundRect(ctx, -130, -40, 260, 80, 16); ctx.stroke();
    ctx.font = H.font('display', 40); ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 2);
    ctx.restore();
  }
  // GPU card, centre anchor (~230x120 at s=1); in 0..1 dims it as it enters
  function gpu(ctx, x, y, s, t, vis = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = clamp(vis);
    K.glow(ctx, 0, 0, 170, ACC, 0.35);
    rr(ctx, -115, -55, 230, 110, 12, '#3a3f58');
    rr(ctx, -105, -45, 150, 90, 10, '#24283c');
    for (const fx of [-62, 0]) { circle(ctx, fx, 0, 34, '#171a29'); ctx.save(); ctx.translate(fx, 0); ctx.rotate(t * 14); ctx.fillStyle = '#5b6488'; for (let i = 0; i < 6; i++) { ctx.rotate(TAU / 6); ctx.beginPath(); ctx.ellipse(14, 0, 14, 6, 0.4, 0, TAU); ctx.fill(); } ctx.restore(); circle(ctx, fx, 0, 8, '#9aa3c0'); }
    rr(ctx, 55, -40, 50, 80, 8, mixHex('#3a3f58', ACC, 0.35));
    ctx.fillStyle = '#d9b44a'; for (let i = 0; i < 10; i++) ctx.fillRect(-100 + i * 20, 55, 12, 12);
    ctx.font = H.font('ui', 22); ctx.fillStyle = '#0d1020'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('GPU', 80, 2);
    ctx.restore();
  }
  // wall calendar, centre anchor; rip < 0 = not yet, 0..1 = top page tears off and falls
  function calendar(ctx, x, y, s, o) {
    const rip = o.rip, ACC = o.ACC, t = o.t;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    rr(ctx, -125, -135, 250, 270, 18, '#f2f4fa');
    rr(ctx, -125, -135, 250, 66, 18, '#e8786a'); ctx.fillStyle = '#e8786a'; ctx.fillRect(-125, -95, 250, 26);
    for (const rx of [-70, 0, 70]) rr(ctx, rx - 7, -150, 14, 34, 7, '#5b6687');
    // under-page: AFTER
    const reveal = clamp(rip);
    ctx.font = H.font('display', 50); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const after = o.after.split(' ');
    ctx.fillStyle = mixHex('#141a33', ACC, 0.0);
    rr(ctx, -110, -60, 220, 180, 12, mixHex('#f2f4fa', ACC, 0.25 * reveal));
    ctx.fillStyle = '#1d2a12'; ctx.font = H.font('display', 64); ctx.fillText(after[0], 0, -2);
    if (after[1]) { ctx.font = H.font('display', 40); ctx.fillText(after.slice(1).join(' '), 0, 62); }
    // top page: BEFORE (falls away)
    if (rip < 1) {
      const u = clamp(rip);
      ctx.save(); ctx.translate(-110, -60); ctx.rotate(u * 1.1); ctx.translate(u * 60, u * u * 520); ctx.globalAlpha = 1 - u * 0.8;
      rr(ctx, 0, 0, 220, 180, 12, '#ffffff');
      const b = o.before.split(' ');
      ctx.fillStyle = '#141a33'; ctx.font = H.font('display', b[0].length > 4 ? 52 : 64); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(b[0], 110, 58);
      if (b[1]) { ctx.font = H.font('display', 38); ctx.fillText(b.slice(1).join(' '), 110, 122); }
      // shake before the rip
      ctx.restore();
    }
    ctx.restore();
    if (rip > 0.5) K.glow(ctx, x, y + 30, 170, ACC, 0.25 * clamp((rip - 0.5) * 2) * (0.8 + 0.2 * Math.sin(t * 6)));
  }
  function island(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#0b1d30'; ctx.beginPath(); ctx.ellipse(0, 30, 200, 52, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#3b4a3a'; ctx.beginPath(); ctx.ellipse(0, 0, 175, 50, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#56704e'; ctx.beginPath(); ctx.ellipse(0, -10, 165, 40, 0, 0, TAU); ctx.fill();
    ctx.restore();
  }
  function chipTile(ctx, x, y, s, t, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = '#c9a54a'; ctx.lineWidth = 5;
    for (let i = 0; i < 5; i++) { const o = -60 + i * 30; ctx.beginPath(); ctx.moveTo(o, -80); ctx.lineTo(o, -96); ctx.moveTo(o, 80); ctx.lineTo(o, 96); ctx.moveTo(-80, o); ctx.lineTo(-96, o); ctx.moveTo(80, o); ctx.lineTo(96, o); ctx.stroke(); }
    rr(ctx, -80, -80, 160, 160, 16, '#2a3150'); rr(ctx, -55, -55, 110, 110, 10, col);
    ctx.restore();
  }
  function fortress(ctx, x, y, s, t, ACC) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    rr(ctx, -120, -170, 240, 170, 8, '#4a5276');
    for (let i = 0; i < 6; i++) rr(ctx, -120 + i * 44, -192, 28, 26, 3, '#4a5276');
    for (const tx of [-140, 140]) { rr(ctx, tx - 30, -250, 60, 250, 6, '#3d4466'); for (let i = 0; i < 2; i++) rr(ctx, tx - 30 + i * 36, -270, 24, 24, 3, '#3d4466'); }
    // chip as the gate
    rr(ctx, -55, -140, 110, 110, 12, '#2a3150'); rr(ctx, -38, -123, 76, 76, 8, '#7d89b8');
    rr(ctx, -40, -30, 80, 30, 6, '#232845');
    ctx.restore();
  }
  function miniBot(ctx, x, y, s, ACC) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    rr(ctx, -18, -44, 36, 30, 8, '#eef1f8'); rr(ctx, -13, -38, 26, 14, 5, '#1a2040');
    circle(ctx, -6, -31, 3, ACC); circle(ctx, 6, -31, 3, ACC);
    rr(ctx, -14, -14, 28, 14, 5, '#cfd5e6');
    ctx.restore();
  }
  function tag(ctx, x, y, s, text, t, shrink, ACC) {
    ctx.save(); ctx.translate(x, y + Math.sin(t * 2) * 4); ctx.rotate(0.08 * Math.sin(t * 1.5)); ctx.scale(Math.max(0.01, s), Math.max(0.01, s));
    ctx.strokeStyle = '#c3cadd'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -110); ctx.lineTo(0, -70); ctx.stroke();
    rr(ctx, -130, -70, 260, 130, 18, '#f2f4fa'); circle(ctx, 0, -50, 8, '#1a2040');
    ctx.font = H.font('ui', 28); ctx.fillStyle = '#141a33'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, -8);
    // big down arrow once shrinking
    const a = clamp(shrink * 1.5);
    ctx.fillStyle = a > 0 ? mixHex('#e8786a', ACC, a) : '#e8786a';
    ctx.font = H.font('display', 34);
    if (a > 0.3) { ctx.beginPath(); ctx.moveTo(-100, 22); ctx.lineTo(-72, 22); ctx.lineTo(-86, 46); ctx.closePath(); ctx.fill(); ctx.fillText('cheaper', 16, 34); }
    else ctx.fillText('$$$', 0, 34);
    ctx.restore();
  }
  return { rr, circle, bigText, counter, gpu, calendar, island, chipTile, fortress, miniBot, tag };
}
