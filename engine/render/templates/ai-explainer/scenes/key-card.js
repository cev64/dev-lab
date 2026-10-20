// Scene "key-card" (full frame, one beat). Metaphor: an API key is like a credit card for AI.
// Phase A: a big glowing key in the middle flips into a generic credit card ("= a credit card for AI").
// Phase B: the card flies to a hooded cartoon figure, who swipes it at a shop terminal; a receipt grows and coins
//   drain from a glass jar labelled "Your account".
// Phase C: up to three provider tiles (plain buildings, names as text) appear; the "block" ones fire a BLOCKED stamp
//   onto the card (it greys out, the figure slumps), then the "refund" one sends coins back into the jar.
// Fits: stolen API keys / passwords / cards used by someone else, refunds and blocks after a breach.
// Defaults are generic ("Provider A/B/C"): pass the story's provider names and source.
// params (all optional): keyLabel, cardLabel, spend, jar, tiles [{name, role: 'block'|'refund'}], blocked, refund, source
//        cues: keyCue, cardCue, swipeCue, blockCue, refundTileCue, refundCue, sourceCue (narration words, "word#n" =
//        the (n+1)th time; without them fractions of the scene)
function drawKey(ctx, x, y, s, rot, color, dark) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = color; ctx.strokeStyle = dark; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(-26, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(-26, 0, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color; ctx.fillRect(-10, -6, 50, 12); ctx.strokeRect(-10, -6, 50, 12);
  ctx.fillRect(26, 6, 8, 12); ctx.fillRect(14, 6, 7, 9);
  ctx.restore();
}
function drawCard(ctx, H, K, x, y, s, rot, acc, grey) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const g = ctx.createLinearGradient(-120, -75, 120, 75);
  g.addColorStop(0, grey ? '#6c7088' : acc); g.addColorStop(1, grey ? '#4a4e66' : H.mixHex(acc, '#2a2f45', 0.45));
  H.roundRect(ctx, -120, -75, 240, 150, 16); ctx.fillStyle = g; ctx.fill();
  H.roundRect(ctx, -92, -30, 44, 34, 6); ctx.fillStyle = grey ? '#9aa0b4' : '#e8d08a'; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-92, -13); ctx.lineTo(-48, -13); ctx.moveTo(-70, -30); ctx.lineTo(-70, 4); ctx.stroke();
  ctx.fillStyle = 'rgba(10,12,22,0.75)'; ctx.font = K.font.display(40); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  ctx.fillText('AI', 100, -38);
  ctx.fillStyle = 'rgba(10,12,22,0.55)';
  for (let gI = 0; gI < 4; gI++) for (let d = 0; d < 4; d++) { ctx.beginPath(); ctx.arc(-92 + gI * 50 + d * 9, 40, 3.5, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
}
function hooded(ctx, H, K, x, y, s, o = {}) {
  const t = o.t || 0, walk = !!o.walk;
  const ph = t * 1.8 * Math.PI * 2, bob = walk ? -Math.abs(Math.sin(ph)) * 5 : Math.sin(t * 1.5) * 1.5;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  K.shadow(ctx, 0, 0, 110);
  const cloak = '#343a5a', cloakS = '#252a44';
  for (const side of [-1, 1]) {
    const a = walk ? Math.sin(ph + (side > 0 ? Math.PI : 0)) * 0.35 : 0;
    ctx.save(); ctx.translate(side * 14, -70 + bob); ctx.rotate(a);
    H.roundRect(ctx, -9, 0, 18, 66, 8); ctx.fillStyle = '#14162a'; ctx.fill();
    H.roundRect(ctx, -12, 58, 30, 14, 7); ctx.fillStyle = '#0c0d18'; ctx.fill();
    ctx.restore();
  }
  ctx.translate(0, bob + (o.slump || 0) * 8);
  ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -62); ctx.lineTo(54, -62); ctx.quadraticCurveTo(58, -110, 34, -178); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = cloakS; ctx.fillRect(18, -190, 60, 140); ctx.restore();
  const r = o.reach || 0;
  ctx.strokeStyle = cloak; ctx.lineWidth = 17; ctx.lineCap = 'round';
  const hx = 48 + r * 60, hy = -122 - r * 30 + (o.slump || 0) * 40;
  ctx.beginPath(); ctx.moveTo(26, -160); ctx.lineTo(40 + r * 30, -130 - r * 20); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.fillStyle = '#14162a'; ctx.beginPath(); ctx.arc(hx, hy, 10, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -62); ctx.stroke(); ctx.restore();
  ctx.beginPath(); ctx.moveTo(0, -262); ctx.quadraticCurveTo(46, -250, 44, -200); ctx.quadraticCurveTo(42, -170, 0, -168); ctx.quadraticCurveTo(-42, -170, -44, -200); ctx.quadraticCurveTo(-46, -244, 0, -262); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(4, -204, 26, 25, 0, 0, Math.PI * 2); ctx.fillStyle = '#07080f'; ctx.fill();
  const blink = (t % 3.1) < 0.12 ? 0.2 : 1;
  ctx.fillStyle = o.eye || '#ffe14a';
  for (const ex of [-6, 14]) { ctx.beginPath(); ctx.ellipse(ex, -206 + (o.slump || 0) * 4, 5, 4 * blink * (1 - 0.5 * (o.slump || 0)), 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  return { hand: [x + (o.flip ? -1 : 1) * hx * s, y + (hy + bob) * s] };
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent, RED = '#ff6b5e';
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tKey = at(P.keyCue, 0.9), tCard = at(P.cardCue, D * 0.19);
  const tSwipe = at(P.swipeCue, D * 0.38), tBlock = at(P.blockCue, D * 0.58);
  const tRefTile = at(P.refundTileCue, D * 0.76), tRefund = at(P.refundCue, D * 0.83);
  const tSrc = at(P.sourceCue, D * 0.93);
  const tFly = tCard + 1.3, tTiles = tBlock - 1.0;
  const tiles = (P.tiles && P.tiles.length ? P.tiles : [{ name: 'Provider A', role: 'block' }, { name: 'Provider B', role: 'block' }, { name: 'Provider C', role: 'refund' }]).slice(0, 3);
  const feet = 1035, counterY = 880;

  const pill = (text, x, y, a, b, o = {}) => {
    if (t < a || t > b + 0.35) return;
    ctx.save(); ctx.globalAlpha = K.fadeOut(t, b, 0.35);
    K.drawLabel(ctx, x, y, K.popIn(t, a, 0.4), { text, size: o.size || 28, dot: !o.accent, accent: o.accent });
    ctx.restore();
  };

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tFly, zoom: 1.0 }, { t: tFly + 0.8, zoom: 1.05, x: 510, y: 770 }, { t: tTiles, zoom: 1.05, x: 510, y: 770 }, { t: tTiles + 0.8, zoom: 1.0 }, { t: D, zoom: 1.02 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 900, wall: '#2b2f52', wallS: '#23264a' });
  // shop counter
  H.roundRect(ctx, 390, counterY, 560, feet - counterY + 10, 10); ctx.fillStyle = '#5a4636'; ctx.fill();
  ctx.fillStyle = '#7a5e48'; ctx.fillRect(380, counterY - 14, 580, 18);
  // payment terminal on the counter (props fade in once the card leaves the spotlight)
  ctx.save(); ctx.globalAlpha = K.fadeIn(t, tFly - 0.4, 0.5);
  const tx = 560, tTop = counterY - 150;
  H.roundRect(ctx, tx - 60, tTop, 120, 150, 14); ctx.fillStyle = '#2a2f45'; ctx.fill();
  H.roundRect(ctx, tx - 46, tTop + 14, 92, 56, 6);
  const swiped = t > tSwipe, blockedNow = t > tBlock;
  ctx.fillStyle = blockedNow ? '#3a1a1e' : swiped ? '#16301f' : '#121527'; ctx.fill();
  ctx.font = K.font.ui(22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (swiped) { ctx.fillStyle = blockedNow ? RED : '#6ee7a8'; ctx.fillText(blockedNow ? 'DECLINED' : 'PAID', tx, tTop + 42); }
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { H.roundRect(ctx, tx - 40 + c * 28, tTop + 82 + r * 20, 22, 14, 4); ctx.fillStyle = '#4a5270'; ctx.fill(); }
  // receipt grows from the top of the terminal while charges run
  const rec = clamp((Math.min(t, tBlock) - tSwipe) / 2.5);
  if (rec > 0 && t < tBlock + 1.2) {
    ctx.save(); ctx.globalAlpha = K.fadeOut(t, tBlock + 0.8, 0.4);
    const rh = 20 + rec * 170;
    ctx.save(); ctx.translate(tx, tTop - 4); ctx.rotate(-0.05);
    H.roundRect(ctx, -42, -rh, 84, rh, 4); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    for (let i = 0; i < Math.floor(rh / 24); i++) { ctx.fillStyle = i % 3 === 2 ? RED : '#8a92b8'; ctx.fillRect(-30, -rh + 14 + i * 24, 40 - (i % 2) * 14, 6); ctx.fillRect(18, -rh + 14 + i * 24, 14, 6); }
    ctx.restore(); ctx.restore();
  }
  // jar "Your account": level drains while charges run, refills on refund
  const jx = 810, jTop = counterY - 190;
  const drain = clamp((Math.min(t, tBlock) - tSwipe) / 2.6), refill = K.phase(t, tRefund, tRefund + 1.6);
  const level = 0.85 - 0.6 * drain + 0.5 * refill;
  H.roundRect(ctx, jx - 70, jTop, 140, 190, 18); ctx.fillStyle = 'rgba(200,220,255,0.14)'; ctx.fill();
  ctx.save(); H.roundRect(ctx, jx - 70, jTop, 140, 190, 18); ctx.clip();
  const ly = jTop + 190 * (1 - level);
  ctx.fillStyle = '#d9a92a'; ctx.fillRect(jx - 70, ly, 140, 200);
  for (let i = 0; i < 18; i++) { const cx = jx - 55 + (i % 6) * 22, cy = ly + 12 + Math.floor(i / 6) * 22; ctx.fillStyle = '#f2c94c'; ctx.beginPath(); ctx.ellipse(cx, cy, 10, 6, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  ctx.strokeStyle = 'rgba(220,235,255,0.6)'; ctx.lineWidth = 4; H.roundRect(ctx, jx - 70, jTop, 140, 190, 18); ctx.stroke();
  H.roundRect(ctx, jx - 78, jTop - 14, 156, 22, 8); ctx.fillStyle = '#8a92b8'; ctx.fill();
  K.drawLabel(ctx, jx, jTop - 24, K.popIn(t, tFly - 0.2, 0.4), { text: t > tRefund ? (P.refund || 'Credits refunding') : (P.jar || 'Your account'), size: 26, accent: true });
  // coins: jar -> terminal while charging
  if (swiped && t < tBlock) for (let j = 0; j < 12; j++) {
    const lt = t - tSwipe - j * 0.22; if (lt < 0 || lt > 0.6) continue;
    const u = easeOutCubic(lt / 0.6);
    K.drawCoin(ctx, lerp(jx, tx, u), lerp(jTop + 20, tTop + 10, u) - Math.sin(u * Math.PI) * 90, 0.5, { spin: lt * 10, symbol: '$' });
  }
  ctx.restore();
  // hooded figure: walks in from the left with the card, swipes, slumps when blocked
  const walkIn = K.phase(t, tFly - 0.3, tSwipe - 0.4);
  const fx = lerp(-120, 360, walkIn);
  const reach = K.phase(t, tSwipe - 0.5, tSwipe - 0.1) * (1 - K.phase(t, tBlock + 0.3, tBlock + 0.8));
  const slump = K.phase(t, tBlock + 0.3, tBlock + 0.9);
  const hd = hooded(ctx, H, K, fx, feet, 1.25, { t, walk: walkIn > 0 && walkIn < 1, reach, slump, eye: ACC });

  // the key / card
  const flip = K.phase(t, tCard - 0.2, tCard + 0.3);
  const fly = K.phase(t, tFly, tFly + 0.7);
  if (t < tFly + 0.01 || fly < 1 || true) {
    let cx = 487, cy = 650, cs = 1.6;
    if (fly > 0) {
      // in the hand, then into the terminal slot on the swipe
      const toSlot = K.phase(t, tSwipe - 0.4, tSwipe);
      const hx = hd.hand[0] + 30, hy = hd.hand[1] - 20;
      cx = lerp(lerp(487, hx, fly), tx, toSlot); cy = lerp(lerp(650, hy, fly), tTop - 30, toSlot) + (toSlot > 0 ? Math.sin(t * 20) * 3 * (t < tSwipe + 0.4 ? 1 : 0) : 0);
      cs = lerp(1.6, 0.5, fly);
    }
    const sx = Math.abs(Math.cos(flip * Math.PI));
    if (flip < 0.5) {
      if (t > tKey - 0.2 && fly === 0) K.glow(ctx, cx, cy, 230, ACC, 0.35);
      ctx.save(); ctx.translate(cx, cy); ctx.scale(Math.max(0.02, sx), 1); drawKey(ctx, 0, 0, 3.4 * cs / 1.6 * K.popIn(t, 0, 0.5), -0.15, ACC, '#6b5a12'); ctx.restore();
    } else {
      ctx.save(); ctx.translate(cx, cy); ctx.scale(Math.max(0.02, sx), 1); drawCard(ctx, H, K, 0, 0, cs, -0.06, ACC, blockedNow); ctx.restore();
    }
  }
  pill(P.keyLabel || 'API key', 487, 500, tKey - 0.1, tCard - 0.1, { size: 34, accent: true });
  pill(P.cardLabel || '= a credit card for AI', 487, 500, tCard + 0.15, tFly + 1.4, { size: 34, accent: true });
  pill(P.spend || 'Whoever holds it can spend', 487, 500, tFly + 1.5, tTiles - 0.2, { size: 30 });

  // provider tiles appear, the block ones stamp the card
  const tilesX = [230, 487, 744];
  tiles.forEach((tl, i) => {
    const appear = tl.role === 'refund' ? tRefTile - 0.2 : tTiles + i * 0.25;
    if (t < appear) return;
    const k = K.popIn(t, appear, 0.45);
    const x = tilesX[i], y = 600;
    const lit = (tl.role === 'block' && t > tBlock) || (tl.role === 'refund' && t > tRefund);
    ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
    H.roundRect(ctx, -105, -160, 210, 160, 18); ctx.fillStyle = 'rgba(10,12,22,0.88)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = lit ? (tl.role === 'block' ? RED : ACC) : 'rgba(255,255,255,0.18)'; H.roundRect(ctx, -105, -160, 210, 160, 18); ctx.stroke();
    K.drawBuilding(ctx, 0, -52, 0.22, { t, color: ['#6a4f8a', '#3f7a86', '#4b5a9a'][i], floors: 5, lit: 0.6, shadow: false });
    ctx.fillStyle = lit ? (tl.role === 'block' ? RED : ACC) : '#ffffff'; ctx.font = K.font.ui(28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(tl.name, 0, -26);
    ctx.restore();
    if (tl.role === 'block' && t > tBlock) {
      // a red bolt from the tile to the card
      const u = clamp((t - tBlock) / 0.3);
      if (u < 1 || t < tBlock + 0.8) { ctx.save(); ctx.globalAlpha = 1 - clamp((t - tBlock - 0.4) / 0.4); ctx.strokeStyle = RED; ctx.lineWidth = 6; ctx.setLineDash([16, 10]);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(x, tx, u), lerp(y, tTop - 30, u)); ctx.stroke(); ctx.restore(); }
    }
    if (tl.role === 'refund' && t > tRefund) for (let j = 0; j < 10; j++) {
      const lt = t - tRefund - j * 0.16; if (lt < 0 || lt > 0.8) continue;
      const u = easeOutCubic(lt / 0.8);
      K.drawCoin(ctx, lerp(x, jx, u), lerp(y - 20, jTop + 10, u) - Math.sin(u * Math.PI) * 80, 0.55, { spin: lt * 10 + j, symbol: '$' });
    }
  });
  if (t > tBlock + 0.25) K.drawStamp(ctx, tx, tTop + 90, 0.85, { kind: 'cross', text: P.blocked || 'Blocked', land: (t - tBlock - 0.25) / 0.5 });
  pill(P.source || 'Per news reports', 670, 1030, tSrc - 0.1, D, { size: 24 });
  ctx.restore();
}
