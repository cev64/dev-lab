// Scene "key-wall-heist" (was console-heist; full frame; best as a 2-beat span). Night street outside an old, slightly
// shabby shop-front building whose big window shows a wall of glowing keys on hooks (a metaphor for stored API keys).
// Hook (beat 1): a hooded cartoon figure (no face, generic) reaches through a cracked pane, pulls out a key ring and
//   coins burst up from it ("ran up the bills"), then the figure slips away left.
// Beat 2: the sign lights with the service name, a "what it is" pill, the window cracks on the breach cue, the sign
//   flickers and an "Older system" tag swings down, the keys glow ("stored"), finally a share pill lands and a couple
//   of hooks show as emptied (red rings).
// Fits: "attackers broke into X where users stored keys/passwords", credential leaks, account takeovers.
// Defaults are generic placeholders ("KEY STORE", "1 in 100"): pass the service's name and the published share.
// params (all optional): sign, what, older, keysLabel, share, shareSub
//        cues: stoleCue, billsCue, nameCue, whatCue, breachCue, olderCue, signCue, storedCue, shareCue (narration
//        words, "word#n" = the (n+1)th time it is spoken; without them fixed times / fractions of the scene)
function drawKey(ctx, x, y, s, rot, color, dark) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = color; ctx.strokeStyle = dark; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(-26, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(-26, 0, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color; ctx.fillRect(-10, -6, 50, 12); ctx.strokeRect(-10, -6, 50, 12);
  ctx.fillRect(26, 6, 8, 12); ctx.fillRect(14, 6, 7, 9);
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
  ctx.translate(0, bob);
  ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -62); ctx.lineTo(54, -62); ctx.quadraticCurveTo(58, -110, 34, -178); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = cloakS; ctx.fillRect(18, -190, 60, 140); ctx.restore();
  // reaching arm: o.reach 0..1 extends it forward/up
  const r = o.reach || 0;
  ctx.strokeStyle = cloak; ctx.lineWidth = 17; ctx.lineCap = 'round';
  const hx = 48 + r * 40, hy = -122 - r * 60;
  ctx.beginPath(); ctx.moveTo(26, -160); ctx.lineTo(40 + r * 20, -130 - r * 30); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.fillStyle = '#14162a'; ctx.beginPath(); ctx.arc(hx, hy, 10, 0, Math.PI * 2); ctx.fill();
  ctx.save(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -62); ctx.stroke(); ctx.restore();
  ctx.beginPath(); ctx.moveTo(0, -262); ctx.quadraticCurveTo(46, -250, 44, -200); ctx.quadraticCurveTo(42, -170, 0, -168); ctx.quadraticCurveTo(-42, -170, -44, -200); ctx.quadraticCurveTo(-46, -244, 0, -262); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(4, -204, 26, 25, 0, 0, Math.PI * 2); ctx.fillStyle = '#07080f'; ctx.fill();
  const blink = (t % 3.1) < 0.12 ? 0.2 : 1;
  ctx.fillStyle = o.eye || '#ffe14a';
  for (const ex of [-6, 14]) { ctx.beginPath(); ctx.ellipse(ex, -206, 5, 4 * blink, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  return { hand: [x + (o.flip ? -1 : 1) * hx * s, y + (hy + bob) * s] };
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent, RED = '#ff6b5e';
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const b2 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.22;
  const tStole = at(P.stoleCue, 0.6), tBills = at(P.billsCue, 2.6);
  const tName = at(P.nameCue, b2 + 0.4), tWhat = at(P.whatCue, b2 + 1.2);
  const tBreach = at(P.breachCue, b2 + 4.2), tOlder = at(P.olderCue, b2 + 5);
  const tSign = at(P.signCue, b2 + 6), tStored = at(P.storedCue, b2 + 7.8);
  const tShare = at(P.shareCue, D - 1.4);
  const feet = 1035;

  const pill = (text, x, y, a, b, o = {}) => {
    if (t < a || t > b + 0.35) return;
    ctx.save(); ctx.globalAlpha = K.fadeOut(t, b, 0.35);
    K.drawLabel(ctx, x, y, K.popIn(t, a, 0.4), { text, size: o.size || 26, dot: !o.accent, accent: o.accent });
    ctx.restore();
  };

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.17, x: 420, y: 715 }, { t: b2 - 0.2, zoom: 1.17, x: 425, y: 715 }, { t: b2 + 1.2, zoom: 1.0, x: 487, y: 735 },
    { t: tStored, zoom: 1.0, x: 487, y: 735 }, { t: tStored + 1.2, zoom: 1.07, x: 500, y: 720 }, { t: D, zoom: 1.09, x: 500, y: 720 }]);
  if (t > tBreach && t < tBreach + 0.5) K.cameraShake(ctx, t, tBreach, 0.4, 8);

  K.world.city(ctx, { t, time: 'night' });
  // the old building: brick facade
  const bx0 = 110, bx1 = 870, top = 470;
  H.roundRect(ctx, bx0, top, bx1 - bx0, feet - top, 10); ctx.fillStyle = '#4a3a4c'; ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let r = 0; r < 20; r++) for (let c = 0; c < 13; c++) {
    if (H.hash(r, c) < 0.55) continue;
    ctx.fillRect(bx0 + 8 + c * 58 + (r % 2) * 29, top + 12 + r * 28, 50, 20);
  }
  ctx.fillStyle = '#3a2d3c'; ctx.fillRect(bx0 - 10, top - 10, bx1 - bx0 + 20, 26);
  // crack in the wall (it's old)
  ctx.strokeStyle = 'rgba(20,14,22,0.7)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(840, top + 40); ctx.lineTo(820, top + 90); ctx.lineTo(836, top + 130); ctx.lineTo(812, top + 190); ctx.stroke();
  // sign board (flickers once "older" is said, lit on the name cue)
  const signLit = K.fadeIn(t, tName - 0.1, 0.4);
  const flick = t > tOlder && t < tOlder + 1.6 ? (Math.sin((t - tOlder) * 31) > 0.2 ? 1 : 0.35) : 1;
  const sx = 487, sy = 520;
  H.roundRect(ctx, sx - 250, sy - 38, 500, 76, 12); ctx.fillStyle = '#20182a'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = H.rgba(ACC, 0.25 + 0.75 * signLit * flick); H.roundRect(ctx, sx - 250, sy - 38, 500, 76, 12); ctx.stroke();
  if (signLit > 0) K.glow(ctx, sx, sy, 260, ACC, 0.18 * signLit * flick);
  ctx.font = K.font.display(40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = H.mixHex('#5a5068', ACC, signLit * flick);
  ctx.fillText((P.sign || 'KEY STORE').toUpperCase(), sx, sy + 2);
  // big window with the key wall inside
  const wx0 = 190, wx1 = 790, wy0 = 600, wy1 = 880;
  H.roundRect(ctx, wx0 - 14, wy0 - 14, wx1 - wx0 + 28, wy1 - wy0 + 28, 10); ctx.fillStyle = '#2a2030'; ctx.fill();
  H.roundRect(ctx, wx0, wy0, wx1 - wx0, wy1 - wy0, 6); ctx.fillStyle = '#2d2a3e'; ctx.fill();
  // interior warm light
  const inner = ctx.createLinearGradient(0, wy0, 0, wy1); inner.addColorStop(0, '#3e3a5a'); inner.addColorStop(1, '#2a2840');
  ctx.fillStyle = inner; ctx.fillRect(wx0, wy0, wx1 - wx0, wy1 - wy0);
  // pegboard
  H.roundRect(ctx, wx0 + 30, wy0 + 24, wx1 - wx0 - 60, wy1 - wy0 - 48, 8); ctx.fillStyle = '#6a5440'; ctx.fill();
  const glowK = K.fadeIn(t, tStored, 0.5);
  const rows = 3, cols = 8, gone = [[1, 2], [2, 6]];
  const goneK = K.phase(t, tShare + 0.1, tShare + 0.6);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const kx = wx0 + 82 + c * 66, ky = wy0 + 62 + r * 74;
    ctx.fillStyle = '#3a2c20'; ctx.beginPath(); ctx.arc(kx, ky - 22, 5, 0, Math.PI * 2); ctx.fill();
    const isGone = gone.some(([gr, gc]) => gr === r && gc === c);
    if (isGone && goneK > 0) {
      ctx.save(); ctx.globalAlpha = goneK; ctx.strokeStyle = RED; ctx.lineWidth = 5; ctx.setLineDash([8, 6]);
      ctx.beginPath(); ctx.arc(kx, ky + 4, 28, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      continue;
    }
    if (glowK > 0) K.glow(ctx, kx, ky + 4, 40, ACC, 0.3 * glowK * (0.7 + 0.3 * Math.sin(t * 4 + r + c * 1.7)));
    const sway = Math.sin(t * 2 + r * 0.7 + c) * 0.06;
    drawKey(ctx, kx, ky + 4, 0.62, Math.PI / 2 + sway, glowK > 0 ? H.mixHex('#c9b37a', ACC, glowK) : '#c9b37a', '#5a4a20');
  }
  // window glass sheen + a crack + a broken hole on the left pane on the breach cue
  ctx.save(); ctx.globalAlpha = 0.12; ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.moveTo(wx0 + 300, wy0); ctx.lineTo(wx0 + 380, wy0); ctx.lineTo(wx0 + 240, wy1); ctx.lineTo(wx0 + 160, wy1); ctx.closePath(); ctx.fill(); ctx.restore();
  ctx.fillStyle = '#2a2030'; ctx.fillRect((wx0 + wx1) / 2 - 7, wy0, 14, wy1 - wy0);
  const hole = [wx0 + 110, wy0 + 230];
  const crack = 1;
  if (t > tBreach - 0.1 && t < tBreach + 2.2) K.glow(ctx, hole[0], hole[1], 150, RED, 0.55 * Math.abs(Math.sin((t - tBreach) * 6)) * K.fadeOut(t, tBreach + 1.6, 0.6));
  if (crack > 0) {
    ctx.save(); ctx.strokeStyle = 'rgba(230,240,255,0.85)'; ctx.lineWidth = 3;
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, len = (60 + 50 * H.hash(i, 3)) * crack;
      ctx.beginPath(); ctx.moveTo(hole[0], hole[1]); ctx.lineTo(hole[0] + Math.cos(a) * len * 0.5, hole[1] + Math.sin(a) * len * 0.5 + 6); ctx.lineTo(hole[0] + Math.cos(a) * len, hole[1] + Math.sin(a) * len); ctx.stroke();
    }
    ctx.fillStyle = '#141224'; ctx.beginPath(); ctx.arc(hole[0], hole[1], 26 * crack, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // "Older system" tag swinging on a string from the sign
  if (t > tOlder - 0.1) {
    const k = K.popIn(t, tOlder - 0.1, 0.5), sw = Math.sin((t - tOlder) * 4) * 0.25 * Math.exp(-(t - tOlder) * 0.8);
    ctx.save(); ctx.translate(735, sy + 36); ctx.rotate(sw); ctx.scale(k, k);
    ctx.strokeStyle = '#c3c9dc'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 22); ctx.stroke();
    H.roundRect(ctx, -92, 22, 184, 46, 8); ctx.fillStyle = '#e8dcc0'; ctx.fill();
    ctx.fillStyle = '#4a3a2a'; ctx.font = K.font.ui(26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.older || 'Older system', 0, 46);
    ctx.restore();
  }
  // door on the right side of the facade (dark)
  // hooded figure: hook = reaches through the hole, pulls a key ring, coins burst; then slips away left
  const leave = K.phase(t, tBills + 0.6, b2 + 1.6);
  if (leave < 1) {
    const reach = t < tStole + 0.5 ? K.phase(t, 0, tStole) : 1 - K.phase(t, tStole + 0.3, tStole + 0.9);
    const fx = lerp(205, -160, leave);
    const hd = hooded(ctx, H, K, fx, feet, 1.25, { t, walk: leave > 0, reach, flip: leave > 0.02, eye: ACC });
    // the key ring: in the hole until grabbed, then in the hand
    const grab = K.phase(t, tStole, tStole + 0.5);
    const ringX = lerp(hole[0], hd.hand[0], grab), ringY = lerp(hole[1], hd.hand[1], grab) + 26;
    if (t > tStole - 0.3) {
      K.glow(ctx, ringX, ringY, 70, ACC, 0.4);
      ctx.strokeStyle = '#c3c9dc'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(ringX, ringY - 18, 16, 0, Math.PI * 2); ctx.stroke();
      for (let j = 0; j < 4; j++) drawKey(ctx, ringX + (j - 1.5) * 9, ringY + 12, 0.6, Math.PI / 2 + (j - 1.5) * 0.35 + Math.sin(t * 6 + j) * 0.1, ACC, '#6b5a12');
    }
    // coins burst up on "bills"
    if (t > tBills - 0.1 && t < tBills + 2.2) {
      for (let i = 0; i < 9; i++) {
        const lt = t - (tBills - 0.1) - i * 0.07;
        if (lt <= 0) continue;
        const ang = -Math.PI / 2 + (i - 4) * 0.28, v = 330 + 90 * H.hash(i, 9);
        const x = ringX + Math.cos(ang) * v * lt, y = Math.min(feet - 20, ringY + Math.sin(ang) * v * lt + 650 * lt * lt);
        ctx.save(); ctx.globalAlpha = clamp(1.6 - lt); K.drawCoin(ctx, x, y, 0.7, { spin: lt * 9 + i, symbol: '$' }); ctx.restore();
      }
    }
  }
  // pills
  pill(P.what || 'Online service', 487, 592, tWhat, tOlder - 0.3, { size: 28 });
  pill(P.keysLabel || "Users' keys", 487, 595, tStored + 0.1, D, { size: 26, accent: true });
  if (t > tShare - 0.1) {
    const k = K.popIn(t, tShare - 0.1, 0.45);
    ctx.save(); ctx.translate(487, 960); ctx.scale(k, k);
    H.roundRect(ctx, -250, -62, 500, 124, 22); ctx.fillStyle = 'rgba(10,12,22,0.9)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = RED; H.roundRect(ctx, -250, -62, 500, 124, 22); ctx.stroke();
    ctx.fillStyle = ACC; ctx.font = K.font.display(58); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.share || '1 in 100', 0, -14);
    ctx.fillStyle = '#ffffff'; ctx.font = K.font.ui(26); ctx.fillText(P.shareSub || 'of users hit', 0, 38);
    ctx.restore();
  }
  ctx.restore();
}
