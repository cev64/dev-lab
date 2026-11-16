// Scene "data-filter" (full frame). A night training room: a conveyor carries "lesson" cards into an AI model (the kit
// robot with a text name plate). Cards pass a sorting gate: shield cards (defensive skills: "Find bugs", "Fix holes")
// roll on and are absorbed by the model; red lock-pick cards (attack skills: "Break in", "Attack") are flagged at the
// gate and dropped through a trapdoor into a REMOVED bin. Generic cartoons only, no logos.
// Fits: "a lab filtered X out of the training data", "the model was never taught to...", data curation, unlearning.
// modes:
//   hook  (cold open, ~3 s): the belt is already running at frame 0; a big "Hacking" lock-pick card is flagged at the
//         gate, drops into the bin at ~0.9 s and a stamp lands at ~1.3 s.
//         params: name (plate), feed (pill, "Training data"), stamp ("REMOVED"), big ("Hacking")
//   sort  (one beat, ~10-14 s): cards stream; name plate glows (nameCue); a pill over the gate (purposeCue); keep
//         pill + green ticks on absorbed cards (keepCue); drop pill + stamp by the bin (dropCue).
//         params: name, feed, purpose, keep, drop, stamp, defs [labels], atks [labels], cues nameCue purposeCue keepCue dropCue
//   check (one beat): the belt is gone; the model stands on a test bench; a tester with a clipboard and team pill
//         (teamCue) ticks rows; a found pill with a tick (foundCue); a cost pill (costCue); on outsideCue a dashed
//         empty outline of a second tester appears with an "Outside check?" pill, an hourglass and a "Not yet" tag.
//         params: name, team, found, cost ('' hides), outside, wait, cues teamCue foundCue costCue outsideCue
// Cues are narration words ("word#n" = (n+1)th time spoken) or numbers (scene seconds); else fixed fractions.
export default function draw(ctx, t, info) {
  const P = info.params || {};
  const mode = P.mode || 'sort';
  if (mode === 'check') return check(ctx, t, info, P);
  return line(ctx, t, info, P, mode);
}

const RED = '#ff6b5e', RED_D = '#8a2f2a', TEAL = '#4fb3a6', TEAL_D = '#2c7a70';

function cueAt(info) {
  return (w, d) => {
    if (w == null || w === '') return d;
    if (typeof w === 'number') return w;
    const m = String(w).match(/^(.*)#(\d+)$/);
    const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? d : v;
  };
}

function room(ctx, H, K, t) {
  K.world.room(ctx, { t, time: 'night', floorY: 1000, window: false, lamp: false, picture: false, plant: false });
  ctx.fillStyle = 'rgba(5,7,16,0.30)'; ctx.fillRect(0, 0, 1080, 1920);
  // soft "data" grid on the back wall
  ctx.save(); ctx.strokeStyle = 'rgba(143,160,255,0.07)'; ctx.lineWidth = 2;
  for (let x = 0; x <= 1080; x += 60) { ctx.beginPath(); ctx.moveTo(x, 380); ctx.lineTo(x, 1000); ctx.stroke(); }
  for (let y = 380; y <= 1000; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }
  ctx.restore();
}

function plate(ctx, H, K, x, y, text, glow, ACC) {
  ctx.save();
  ctx.font = H.font('display', 30);
  const w = Math.min(330, ctx.measureText(text).width + 50), h = 54;
  if (glow > 0) K.glow(ctx, x, y - h / 2, 170, ACC, 0.35 * glow);
  H.roundRect(ctx, x - w / 2, y - h, w, h, 14); ctx.fillStyle = H.mixHex('#20263f', ACC, 0.18 * glow); ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(ACC, 0.35 + 0.5 * glow); ctx.stroke();
  const fs = H.fitText(ctx, text, 'display', 30, 22, w - 30).size;
  ctx.font = H.font('display', fs); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y - h / 2 + 1);
  ctx.restore();
}

// a lesson card, anchored at its bottom centre; kind 'def' (shield) | 'atk' (lock pick)
function card(ctx, H, K, x, y, s, kind, text, rot = 0, flag = 0, ACC = '#c4ff3a') {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const W = 136, Hh = 158;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; H.roundRect(ctx, -W / 2 + 6, -Hh + 8, W, Hh, 18); ctx.fill();
  H.roundRect(ctx, -W / 2, -Hh, W, Hh, 18); ctx.fillStyle = '#f4f6fb'; ctx.fill();
  H.roundRect(ctx, -W / 2, -Hh, W, 30, { tl: 18, tr: 18, bl: 0, br: 0 }); ctx.fillStyle = kind === 'atk' ? RED : TEAL; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.8)'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-W / 2 + 18 + i * 14, -Hh + 15, 4, 0, Math.PI * 2); ctx.fill(); }
  // icon
  ctx.save(); ctx.translate(0, -82);
  if (kind === 'atk') pick(ctx); else shield(ctx);
  ctx.restore();
  // label
  const fs = H.fitText(ctx, text, 'bold', 24, 18, W - 14).size;
  ctx.font = H.font('bold', fs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = kind === 'atk' ? RED_D : TEAL_D; ctx.fillText(text, 0, -24);
  if (flag > 0) {
    ctx.globalAlpha = Math.min(1, flag);
    ctx.lineWidth = 7; ctx.strokeStyle = kind === 'atk' ? RED : ACC;
    H.roundRect(ctx, -W / 2 - 8, -Hh - 8, W + 16, Hh + 16, 22); ctx.stroke();
    ctx.beginPath(); ctx.arc(W / 2 - 4, -Hh + 2, 20, 0, Math.PI * 2); ctx.fillStyle = kind === 'atk' ? RED : ACC; ctx.fill();
    ctx.fillStyle = '#161927';
    if (kind === 'atk') { ctx.font = H.font('display', 28); ctx.fillText('!', W / 2 - 4, -Hh + 4); }
    else { ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.strokeStyle = '#161927'; ctx.beginPath(); ctx.moveTo(W / 2 - 13, -Hh + 3); ctx.lineTo(W / 2 - 6, -Hh + 10); ctx.lineTo(W / 2 + 6, -Hh - 6); ctx.stroke(); }
  }
  ctx.restore();

  function shield(c) {
    c.beginPath(); c.moveTo(0, -36); c.quadraticCurveTo(16, -28, 30, -28); c.quadraticCurveTo(30, 12, 0, 30);
    c.quadraticCurveTo(-30, 12, -30, -28); c.quadraticCurveTo(-16, -28, 0, -36); c.closePath();
    c.fillStyle = TEAL; c.fill();
    c.strokeStyle = '#ffffff'; c.lineWidth = 6; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-12, -2); c.lineTo(-3, 8); c.lineTo(14, -12); c.stroke();
  }
  function pick(c) {
    // a lock-pick: round handle + long shaft with a hooked tip, crossed over a small padlock
    c.save(); c.translate(8, 6);
    c.fillStyle = '#c7ccd9'; H.roundRect(c, -22, -6, 30, 30, 6); c.fill();
    c.strokeStyle = '#c7ccd9'; c.lineWidth = 6; c.beginPath(); c.arc(-7, -8, 10, Math.PI, 0); c.stroke();
    c.fillStyle = '#5b6380'; c.beginPath(); c.arc(-7, 9, 4, 0, Math.PI * 2); c.fill();
    c.restore();
    c.save(); c.rotate(-0.7);
    c.fillStyle = RED; H.roundRect(c, -38, -8, 26, 16, 7); c.fill();
    c.strokeStyle = '#3b4260'; c.lineWidth = 5; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-12, 0); c.lineTo(28, 0); c.lineTo(32, -8); c.stroke();
    c.restore();
  }
}

function line(ctx, t, info, P, mode) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent, at = cueAt(info);
  const { clamp, smooth, lerp } = H;
  const hook = mode === 'hook';
  const tName = hook ? 0.05 : at(P.nameCue, D * 0.12) - 0.15;
  const tPurpose = hook ? Infinity : at(P.purposeCue, D * 0.35) - 0.2;
  const tKeep = hook ? Infinity : at(P.keepCue, D * 0.6) - 0.2;
  const tDrop = hook ? 1.25 : at(P.dropCue, D * 0.85) - 0.25;
  const BELT = 930, GX = 300, DX = 520, END = 680, RX = 720, RY = 1000, SPEED = 150, X0 = -60;
  const SC = 1.2, M = (x, y) => [487 + (x - 487) * SC, 1000 + (y - 1000) * SC]; // content scale about the floor
  const defs = P.defs || ['Find bugs', 'Fix holes', 'Spot attacks', 'Patch it'];
  const atks = P.atks || ['Break in', 'Attack'];

  ctx.save();
  K.camera(ctx, t, hook ? [{ t: 0, zoom: 1.04, x: 470, y: 760 }, { t: D, zoom: 1.0 }] : [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 760 }]);
  if (hook && t > tDrop && t < tDrop + 0.4) K.cameraShake(ctx, t, tDrop, 0.3, 8);
  room(ctx, H, K, t);
  ctx.save(); ctx.translate(487, 1000); ctx.scale(SC, SC); ctx.translate(-487, -1000);

  // ---- the model (robot) on the right, absorbing cards
  const absorbGlow = 0.5 + 0.5 * Math.sin(t * 3);
  K.glow(ctx, RX, RY - 150, 190, ACC, 0.16 + 0.06 * absorbGlow);
  K.drawRobot(ctx, RX, RY, 1.2, { t, state: 'thinking', seed: 5 });
  // hopper ring the cards fly into
  ctx.save(); ctx.lineWidth = 5; ctx.strokeStyle = H.rgba(ACC, 0.5 + 0.2 * absorbGlow); ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 40;
  ctx.beginPath(); ctx.ellipse(RX, RY - 150, 105, 30, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();

  const binY = BELT + 22;

  // ---- gate frame (behind the cards so labels stay readable)
  ctx.fillStyle = '#5b6aa8';
  H.roundRect(ctx, GX - 120, 700, 34, BELT - 690, 12); ctx.fill(); H.roundRect(ctx, GX + 86, 700, 34, BELT - 690, 12); ctx.fill();
  H.roundRect(ctx, GX - 140, 676, 280, 64, 22); ctx.fillStyle = '#6f7fbf'; ctx.fill();
  H.roundRect(ctx, GX - 70, 688, 140, 40, 12); ctx.fillStyle = '#161927'; ctx.fill();
  const blink = (t % 2.9) < 0.12 ? 0.2 : 1;
  ctx.fillStyle = ACC; H.roundRect(ctx, GX - 38, 698, 18, 20 * blink, 5); ctx.fill(); H.roundRect(ctx, GX + 20, 698, 18, 20 * blink, 5); ctx.fill();
  // ---- belt
  H.roundRect(ctx, 20, BELT, END - 10, 24, 12); ctx.fillStyle = '#2a2f45'; ctx.fill();
  for (let x = 20; x < END; x += 30) { const xx = x + ((t * SPEED) % 30); if (xx < END && Math.abs(xx - DX) > 70) { ctx.fillStyle = 'rgba(255,255,255,0.16)'; ctx.fillRect(xx, BELT + 4, 3, 16); } }
  const trap = hook ? 1 : 1; // trapdoor gap always open
  ctx.fillStyle = '#05060d'; ctx.fillRect(DX - 70 * trap, BELT, 140 * trap, 24);

  // ---- cards (deterministic pattern), plus the hook's big card
  const pattern = ['def', 'atk', 'def', 'def', 'atk', 'def', 'atk', 'def'];
  const items = [];
  for (let k = 0; k < 40; k++) {
    const kind = pattern[k % pattern.length];
    const lbl = kind === 'atk' ? atks[Math.floor(k / 2) % atks.length] : defs[k % defs.length];
    items.push({ e: k * 1.05 - 6.0, kind, lbl, s: 0.8 });
  }
  if (hook) items.push({ e: -((GX - X0) / SPEED) + 0.15, kind: 'atk', lbl: P.big || 'Hacking', s: 1.2, big: true });
  let lastDrop = -9, lastAbsorb = -9;
  const drawn = [];
  for (const it of items) {
    if (hook && !it.big && Math.abs(it.e - items[items.length - 1].e) < 0.95) continue; // room around the big card
    const lt = t - it.e;
    if (lt < 0) continue;
    let x = X0 + lt * SPEED, y = BELT, rot = 0, s = it.s, alpha = 1;
    const flag = clamp((x - GX + 20) / 40);
    if (it.kind === 'atk' && x > DX) {
      const ft = (x - DX) / SPEED;
      if (ft > 0.45) continue;
      lastDrop = Math.max(lastDrop, t - ft);
      x = DX + ft * 25; y = BELT + 700 * ft * ft; rot = ft * 2.6; alpha = clamp(1 - (ft - 0.3) / 0.15);
    } else if (it.kind === 'def' && x > END - 40) {
      const ft = (x - (END - 40)) / SPEED; // fly up into the hopper
      const u = clamp(ft / 0.8);
      if (u >= 1) { lastAbsorb = Math.max(lastAbsorb, t - (ft - 0.8)); continue; }
      const e = H.easeInOutCubic(u);
      x = lerp(END - 40, RX, e); y = lerp(BELT, RY - 120, e) - Math.sin(u * Math.PI) * 120; s = it.s * (1 - 0.65 * e); alpha = 1 - 0.6 * e;
    }
    drawn.push({ x, y, s, rot, alpha, it, flag: x > GX - 20 ? flag : 0 });
  }
  // dropping cards behind the bin front: draw falling ones clipped to above the bin bottom
  for (const d of drawn) {
    ctx.save(); ctx.globalAlpha = d.alpha;
    const keepTick = d.it.kind === 'def' ? (t > tKeep ? 1 : 0) : 1;
    card(ctx, H, K, d.x, d.y, d.s, d.it.kind, d.it.lbl, d.rot, d.flag * keepTick, ACC);
    ctx.restore();
  }
  // bin box drawn over the falling cards (they drop inside it)
  H.roundRect(ctx, DX - 95, binY, 190, 1045 - binY, 14); ctx.fillStyle = '#2a1a22'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(RED, 0.55); ctx.stroke();
  ctx.font = H.font('ui', 24); ctx.fillStyle = RED; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(String(P.binLabel || 'OUT'), DX, binY + 52);
  const dp = Math.exp(-Math.max(0, t - lastDrop - 0.35) * 5) * (t - lastDrop > 0.3 ? 1 : 0);
  if (dp > 0.02) K.glow(ctx, DX, binY + 20, 120, RED, 0.5 * dp);
  const ap = Math.exp(-Math.max(0, t - lastAbsorb) * 4);
  if (ap > 0.02) K.glow(ctx, RX, RY - 160, 140, ACC, 0.45 * ap);

  // ---- sorting gate (arch) over the belt
  const g = ctx.createLinearGradient(0, 720, 0, BELT);
  g.addColorStop(0, H.rgba(ACC, 0.04)); g.addColorStop(1, H.rgba(ACC, 0.14));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(GX - 85, 720, 170, BELT - 720);
  const sweepY = 730 + ((t * 1.4) % 1) * (BELT - 750); ctx.fillStyle = H.rgba(ACC, 0.3); ctx.fillRect(GX - 85, sweepY, 170, 5); ctx.restore();

  ctx.restore(); // end of scaled content
  const [PX_, PY_] = M(RX, RY - 300);
  plate(ctx, H, K, PX_, PY_, String(P.name || 'New model'), clamp(K.popIn(t, tName, 0.4)) * (hook ? 0.6 : 1), ACC);

  // ---- pills
  const feed = String(P.feed || 'Training data');
  const pp = hook ? 0 : smooth(clamp((t - tPurpose) / 0.3));
  const fp0 = clamp(K.popIn(t, hook ? 0 : 0.15, 0.4) || (hook ? 1 : 0));
  if (pp < 1) K.drawLabel(ctx, 220, 560, fp0 * (1 - pp), { text: feed, size: 28, dot: true });
  if (!hook) {
    const pq = K.popIn(t, tPurpose + 0.15, 0.4);
    if (pq > 0) K.drawLabel(ctx, 250, 560, Math.min(1.05, pq), { text: String(P.purpose || 'Sorted by purpose'), size: 28, dot: true });
    const kp = K.popIn(t, tKeep, 0.4);
    if (kp > 0) K.drawLabel(ctx, 665, 475, Math.min(1.05, kp), { text: String(P.keep || 'Kept: defence'), size: 28, accent: true });
    const rp = K.popIn(t, tDrop, 0.4);
    if (rp > 0) K.drawLabel(ctx, 290, 475, Math.min(1.05, rp), { text: String(P.drop || 'Removed: attack'), size: 28 });
  }
  // stamp by the bin
  const [SX_, SY_] = M(hook ? 560 : 600, hook ? 860 : 870);
  if (t > tDrop) K.drawStamp(ctx, SX_, SY_, hook ? 0.95 : 0.8, { kind: 'cross', text: String(P.stamp || 'REMOVED'), land: (t - tDrop) / 0.5 });
  ctx.restore();
}

function check(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent, at = cueAt(info);
  const { clamp, smooth } = H;
  const tTeam = at(P.teamCue, D * 0.1) - 0.2, tFound = at(P.foundCue, D * 0.3) - 0.2;
  const tCost = at(P.costCue, D * 0.55) - 0.2, tOut = at(P.outsideCue, D * 0.8) - 0.3;
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tOut, zoom: 1.02, x: 470, y: 760 }, { t: D, zoom: 1.04, x: 540, y: 760 }]);
  room(ctx, H, K, t);

  // test bench + model
  const BX = 500, BY = 1000;
  H.roundRect(ctx, BX - 130, BY - 60, 260, 60, 12); ctx.fillStyle = '#3a4675'; ctx.fill();
  ctx.fillStyle = '#283152'; ctx.fillRect(BX - 130, BY - 14, 260, 14);
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(BX - 90 + i * 60, BY - 34, 8, 0, Math.PI * 2); ctx.fillStyle = (Math.floor(t * 2) + i) % 3 === 0 ? ACC : '#5b6380'; ctx.fill(); }
  K.glow(ctx, BX, BY - 200, 170, ACC, 0.15);
  K.drawRobot(ctx, BX, BY - 60, 1.05, { t, state: t > tFound ? 'happy' : 'thinking', seed: 5 });
  plate(ctx, H, K, BX, BY - 60 - 245, String(P.name || 'New model'), 0.5, ACC);

  // in-house tester with a clipboard, on the left
  const PX = 250, PY = 1040;
  K.drawPerson(ctx, PX, PY, 1.25, { t, pose: 'stand', mood: 'happy', skin: 2, hair: 1, shirt: 2, hairStyle: 'short', look: 0.6, seed: 8 });
  // badge
  H.roundRect(ctx, PX - 2, PY - 205, 26, 32, 5); ctx.fillStyle = ACC; ctx.fill();
  // clipboard held at chest, rows tick one by one after foundCue
  ctx.save(); ctx.translate(PX + 62, PY - 170); ctx.rotate(0.08);
  H.roundRect(ctx, -48, -64, 96, 128, 10); ctx.fillStyle = '#9a6a46'; ctx.fill();
  H.roundRect(ctx, -40, -54, 80, 112, 6); ctx.fillStyle = '#f4f6fb'; ctx.fill();
  ctx.fillStyle = '#5b6380'; ctx.fillRect(-14, -70, 28, 12);
  for (let i = 0; i < 4; i++) {
    const y = -34 + i * 26;
    ctx.fillStyle = '#c7ccd9'; ctx.fillRect(-4, y - 3, 36, 6);
    const tk = H.phase(t, tFound + i * 0.35, tFound + i * 0.35 + 0.3);
    if (tk > 0) { ctx.strokeStyle = TEAL_D; ctx.lineWidth = 5; ctx.lineCap = 'round'; K.pathDraw(ctx, [[-30, y], [-23, y + 7], [-12, y - 8]], tk); }
  }
  ctx.restore();
  const tp = K.popIn(t, tTeam, 0.4);
  if (tp > 0) K.drawLabel(ctx, PX + 50, 735, Math.min(1.05, tp), { text: String(P.team || 'Own team'), size: 26, dot: true });

  // found + cost pills (top centre)
  const fp = K.popIn(t, tFound, 0.4);
  if (fp > 0) K.drawLabel(ctx, 470, 480, Math.min(1.05, fp), { text: String(P.found || 'No high-risk skills found'), size: 28, accent: true });
  if (P.cost !== '') {
    const cp = K.popIn(t, tCost, 0.4);
    if (cp > 0) K.drawLabel(ctx, 470, 565, Math.min(1.05, cp), { text: String(P.cost || 'Cost down'), size: 28 });
  }

  // outside checker: an empty dashed outline + hourglass + "Not yet"
  const op = smooth(clamp((t - tOut) / 0.5));
  if (op > 0) {
    const OX = 790, OY = 1040;
    ctx.save(); ctx.globalAlpha = op;
    // dashed silhouette
    ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 20; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath(); ctx.arc(OX, OY - 255, 40, 0, Math.PI * 2); ctx.stroke();
    H.roundRect(ctx, OX - 58, OY - 205, 116, 140, 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(OX - 30, OY - 65); ctx.lineTo(OX - 30, OY); ctx.moveTo(OX + 30, OY - 65); ctx.lineTo(OX + 30, OY); ctx.stroke();
    ctx.setLineDash([]);
    // "?" in the head
    ctx.font = H.font('display', 44); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('?', OX, OY - 253 + Math.sin(t * 3) * 3);
    ctx.restore();
    // hourglass
    const hx = OX + 2, hy = OY - 138, rot = Math.PI * smooth(((t - tOut) % 2.4) / 0.5 - 3.2);
    ctx.save(); ctx.globalAlpha = op; ctx.translate(hx, hy); ctx.rotate(rot);
    ctx.fillStyle = '#c9a646'; ctx.fillRect(-26, -40, 52, 7); ctx.fillRect(-26, 33, 52, 7);
    ctx.beginPath(); ctx.moveTo(-20, -33); ctx.lineTo(20, -33); ctx.lineTo(3, 0); ctx.lineTo(20, 33); ctx.lineTo(-20, 33); ctx.lineTo(-3, 0); ctx.closePath();
    ctx.fillStyle = 'rgba(220,235,255,0.85)'; ctx.fill();
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(-12, 33); ctx.lineTo(12, 33); ctx.lineTo(0, 15); ctx.closePath(); ctx.fill();
    ctx.restore();
    const lp = K.popIn(t, tOut, 0.4);
    if (lp > 0) K.drawLabel(ctx, OX - 20, 735, Math.min(1.05, lp), { text: String(P.outside || 'Outside check?'), size: 26 });
    const wp = K.popIn(t, tOut + 0.6, 0.4);
    if (wp > 0) K.drawLabel(ctx, OX - 10, 650, Math.min(1.05, wp), { text: String(P.wait || 'Not yet'), size: 26, accent: true });
  }
  ctx.restore();
}
