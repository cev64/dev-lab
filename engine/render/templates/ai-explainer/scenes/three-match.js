// Scene "three-match" (full frame, 1 beat, ~12-15 s). How a "verified human" check on a video call works, as a
// three-image match. Top: a call window with "Banker" and "You" tiles. A phone pops up mid-call and takes a selfie
// (flash) while the You tile holds up a phone; the phone drops into card 1 (Selfie); a frame of the live video drops
// into card 2 (Live video); card 3 shows the image from a one-time scan at a generic eye-scanning sphere (no logo).
// On the match cue, links join the three cards and each gets a tick; then a "Human" badge lands on the You tile.
// Fits: identity / liveness / anti-deepfake checks on calls, "how does it verify you?" beats.
// params: banker ("Banker"), you ("You"), where ("Inside a video call"), notif ("Take a selfie"),
//         labels (["Selfie", "Live video", "Scan image"]), scanLabel ("One-time eye scan"), badge ("Human"),
//         cues (optional; else fractions): whereCue, midCue, selfieCue, matchedCue, liveCue, imageCue, scanCue, allCue,
//         tileCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, roundRect, rgba, lerp } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tWhere = at(P.whereCue, D * 0.1) - 0.2;
  const tMid = at(P.midCue, D * 0.18) - 0.2;
  const tSelfie = at(P.selfieCue, D * 0.29);
  const tMatched = at(P.matchedCue, D * 0.38) - 0.1;
  const tLive = at(P.liveCue, D * 0.43) - 0.1;
  const tImage = at(P.imageCue, D * 0.5) - 0.1;
  const tScan = at(P.scanCue, D * 0.63);
  const tAll = at(P.allCue, D * 0.77) - 0.1;
  const tTile = at(P.tileCue, D * 0.88) - 0.2;

  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tAll, zoom: 1.02, x: 487, y: 800 }, { t: D, zoom: 1.04, x: 487, y: 700 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, plant: true, lamp: true });

  const you = { pose: 'stand', mood: 'happy', skin: 0, hair: 3, hairStyle: 'long', shirt: 3, seed: 2 };
  const banker = { pose: 'stand', mood: 'happy', skin: 2, hair: 1, hairStyle: 'short', shirt: '#2b3a67', seed: 7 };

  // ---- call window ----
  const W = { x: 90, y: 432, w: 795, h: 236 };
  roundRect(ctx, W.x, W.y, W.w, W.h, 20); ctx.fillStyle = '#1c2033'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke();
  const tw = (W.w - 30) / 2, th = W.h - 20;
  const TB = { x: W.x + 10, y: W.y + 10, w: tw, h: th }, TY = { x: W.x + 20 + tw, y: W.y + 10, w: tw, h: th };
  const selfiePose = t > tMid + 0.2 && t < tMatched + 0.4;
  tile(ctx, H, K, TB, Object.assign({ t, talk: t < tMid ? clamp(info.env) * 0.7 : 0 }, banker), '#33406e', '#1b2140');
  tile(ctx, H, K, TY, Object.assign({ t }, you, selfiePose ? { pose: 'phone', mood: 'neutral' } : {}), '#4a3d6a', '#2a2244');
  nameTag(ctx, H, TB, P.banker || 'Banker'); nameTag(ctx, H, TY, P.you || 'You');
  // "inside a call" pill
  const kz = K.popIn(t, tWhere, 0.4);
  const kzs = Math.min(1.05, kz) * (1 - smooth((t - tMid - 0.2) / 0.3));
  if (kzs > 0.02) K.drawLabel(ctx, 487, 740, kzs, { text: P.where || 'Inside a video call', size: 28, dot: true });

  // Human badge on the You tile
  const kh = K.popIn(t, tTile, 0.45);
  if (kh > 0) {
    H.glow(ctx, TY.x + TY.w / 2, TY.y + TY.h / 2, 260, ACC, 0.25 * clamp(kh));
    ctx.lineWidth = 6; ctx.strokeStyle = ACC; roundRect(ctx, TY.x, TY.y, TY.w, TY.h, 10); ctx.stroke();
    badge(ctx, H, K, TY.x + TY.w - 110, TY.y + 40, Math.min(1.08, kh), P.badge || 'Human', ACC);
  }

  // ---- cards row ----
  const labels = P.labels || ['Selfie', 'Live video', 'Scan image'];
  const CX = [200, 487, 774], CY = 880, CW = 236, CH = 230;
  const cardK = [tMatched, tLive, tImage].map((s) => clamp((t - s) / 0.55));
  const allK = clamp((t - tAll) / 0.8);
  // links + match hub
  if (allK > 0) {
    ctx.save(); ctx.lineWidth = 6; ctx.strokeStyle = ACC; ctx.lineCap = 'round'; ctx.setLineDash([2, 14]); ctx.lineDashOffset = -t * 40;
    const hub = [487, 742];
    for (let i = 0; i < 3; i++) {
      const p = clamp(allK * 1.6 - i * 0.2);
      if (p <= 0) continue;
      const sx = CX[i], sy = CY - CH / 2 - 6;
      ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(lerp(sx, hub[0], p), lerp(sy, hub[1], p)); ctx.stroke();
    }
    ctx.restore();
  }
  for (let i = 0; i < 3; i++) {
    const k = cardK[i];
    if (k <= 0) continue;
    const e = H.easeOutBack(k);
    // fly-in origin: phone centre for the selfie, the You tile for the live frame, below for the orb card
    const from = i === 0 ? [487, 880] : i === 1 ? [TY.x + TY.w / 2, TY.y + TY.h / 2] : [774, 1100];
    const x = lerp(from[0], CX[i], i === 0 ? 1 : e), y = lerp(from[1], CY, i === 0 ? 1 : e);
    const s = i === 0 ? lerp(1.35, 1, H.easeInOutCubic(k)) : 0.4 + 0.6 * Math.min(1.04, e);
    const sx = i === 0 ? lerp(487, CX[0], H.easeInOutCubic(k)) : x;
    ctx.save(); ctx.translate(sx, y); ctx.scale(s, s);
    card(ctx, H, K, i, CW, CH, Object.assign({ t }, you), t, ACC, i === 2 ? clamp((t - tScan) / 0.8) : 0);
    // tick when matched
    const tk = K.popIn(t, tAll + 0.5 + i * 0.25, 0.35);
    if (tk > 0) {
      ctx.save(); ctx.translate(CW / 2 - 18, -CH / 2 + 18); ctx.scale(Math.min(1.1, tk), Math.min(1.1, tk));
      ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = K.ACCENT.deep; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(-3, 9); ctx.lineTo(12, -9); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    // label
    const kl = smooth((t - (i === 0 ? tMatched : i === 1 ? tLive : tImage) - 0.3) / 0.3);
    if (kl > 0) {
      ctx.save(); ctx.globalAlpha = kl; ctx.font = H.font('ui', 28); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(labels[i], CX[i], CY + CH / 2 + 30); ctx.restore();
    }
  }
  // hub "=" bubble
  const kHub = K.popIn(t, tAll + 0.6, 0.4);
  if (kHub > 0) {
    ctx.save(); ctx.translate(487, 742); ctx.scale(Math.min(1.08, kHub), Math.min(1.08, kHub));
    ctx.font = H.font('display', 30);
    const txt = '3 / 3 MATCH', w = ctx.measureText(txt).width + 44;
    roundRect(ctx, -w / 2, -28, w, 56, 28); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = K.ACCENT.deep; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 2);
    ctx.restore();
  }
  // scan label over the orb card
  const ks = K.popIn(t, tScan - 0.2, 0.4) * (1 - smooth((t - tAll) / 0.3));
  if (ks > 0.01) K.drawLabel(ctx, 700, 745, Math.min(1.05, ks), { text: P.scanLabel || 'One-time eye scan', size: 26, accent: true });

  // ---- big phone (selfie) before it drops into card 1 ----
  const kp = K.popIn(t, tMid, 0.45);
  if (kp > 0 && t < tMatched + 0.05) {
    const s = Math.min(1.05, kp);
    ctx.save(); ctx.translate(487, 880); ctx.scale(s, s);
    roundRect(ctx, -105, -170, 210, 340, 30); ctx.fillStyle = '#1c2033'; ctx.fill();
    const scr = { x: -92, y: -156, w: 184, h: 312 };
    ctx.save(); roundRect(ctx, scr.x, scr.y, scr.w, scr.h, 20); ctx.clip();
    tile(ctx, H, K, scr, Object.assign({ t, look: 0 }, you), '#3a3060', '#221c3c');
    // face guide ring
    ctx.lineWidth = 4; ctx.strokeStyle = rgba(ACC, 0.9); ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.ellipse(0, scr.y + scr.h * 0.44, 64, 78, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    // flash
    const fl = clamp(1 - Math.abs(t - tSelfie - 0.1) / 0.25);
    if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${0.85 * fl})`; ctx.fillRect(scr.x, scr.y, scr.w, scr.h); }
    ctx.restore();
    // notification
    const kn = K.popIn(t, tMid + 0.3, 0.35) * (1 - smooth((t - tSelfie) / 0.3));
    if (kn > 0.01) {
      ctx.save(); ctx.translate(0, -120); ctx.scale(Math.min(1.05, kn), Math.min(1.05, kn));
      ctx.font = H.font('ui', 26);
      const txt = P.notif || 'Take a selfie', w = Math.max(250, ctx.measureText(txt).width + 40);
      roundRect(ctx, -w / 2, -30, w, 60, 16); ctx.fillStyle = 'rgba(245,247,252,0.97)'; ctx.fill();
      ctx.fillStyle = '#161927'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 2);
      ctx.restore();
    }
    // shutter button
    ctx.beginPath(); ctx.arc(0, 128, 20, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = '#1c2033'; ctx.beginPath(); ctx.arc(0, 128, 15, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }
}

function nameTag(ctx, H, T, name) {
  ctx.font = H.font('ui', 24);
  const nw = ctx.measureText(name).width + 24;
  H.roundRect(ctx, T.x + 10, T.y + T.h - 44, nw, 34, 8); ctx.fillStyle = 'rgba(8,10,20,0.8)'; ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(name, T.x + 22, T.y + T.h - 26);
}

function badge(ctx, H, K, x, y, s, txt, ACC) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = H.font('display', 30);
  const w = ctx.measureText(txt).width + 76;
  H.roundRect(ctx, -w / 2, -26, w, 52, 26); ctx.fillStyle = ACC; ctx.fill();
  ctx.beginPath(); ctx.arc(-w / 2 + 28, 0, 15, 0, Math.PI * 2); ctx.fillStyle = K.ACCENT.deep; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.lineCap = 'round'; ctx.beginPath();
  ctx.moveTo(-w / 2 + 21, 0); ctx.lineTo(-w / 2 + 27, 6); ctx.lineTo(-w / 2 + 36, -6); ctx.stroke();
  ctx.fillStyle = K.ACCENT.deep; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(txt, -w / 2 + 52, 2);
  ctx.restore();
}

// One of the three image cards, centred at 0,0: 0 selfie (phone frame), 1 live video (tile + REC), 2 orb image.
function card(ctx, H, K, kind, w, h, person, t, ACC, scan) {
  const { roundRect, rgba } = H;
  roundRect(ctx, -w / 2, -h / 2, w, h, 22); ctx.fillStyle = 'rgba(10,12,26,0.95)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke();
  if (kind === 0) {
    roundRect(ctx, -62, -96, 124, 192, 18); ctx.fillStyle = '#2a2f45'; ctx.fill();
    tile(ctx, H, K, { x: -54, y: -86, w: 108, h: 164 }, person, '#3a3060', '#221c3c');
    ctx.beginPath(); ctx.arc(0, 86, 5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill();
  } else if (kind === 1) {
    tile(ctx, H, K, { x: -100, y: -80, w: 200, h: 160 }, person, '#4a3d6a', '#2a2244');
    ctx.beginPath(); ctx.arc(-80, -62, 7, 0, Math.PI * 2); ctx.fillStyle = rgba('#ff6b5e', 0.6 + 0.4 * Math.sin(t * 5)); ctx.fill();
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('LIVE', -66, -61);
  } else {
    // face image with a small sphere beside it
    tile(ctx, H, K, { x: -100, y: -92, w: 200, h: 140 }, person, '#2b4a5c', '#1a2c3a');
    drawOrb(ctx, H, 0, 70, 30, t, ACC, 0.6);
    if (scan > 0 && scan < 1) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const y = -92 + 140 * scan;
      ctx.fillStyle = rgba(ACC, 0.55); ctx.fillRect(-100, y - 3, 200, 6);
      H.glow(ctx, 0, y, 90, ACC, 0.3);
      ctx.restore();
    }
  }
}

function tile(ctx, H, K, T, person, c1, c2) {
  const { roundRect } = H;
  ctx.save(); roundRect(ctx, T.x, T.y, T.w, T.h, 10); ctx.clip();
  const bg = ctx.createLinearGradient(T.x, T.y, T.x, T.y + T.h); bg.addColorStop(0, c1); bg.addColorStop(1, c2);
  ctx.fillStyle = bg; ctx.fillRect(T.x, T.y, T.w, T.h);
  const s = Math.min(T.h / 150, T.w / 110), cx = T.x + T.w / 2, feet = T.y + T.h * 0.46 + 212 * s;
  K.drawPerson(ctx, cx, feet, s, person);
  ctx.restore();
}

// Generic eye-scanning sphere (no logo).
function drawOrb(ctx, H, x, y, r, t, ACC, glowA) {
  H.glow(ctx, x, y, r * 2.4, ACC, 0.2 * glowA);
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.1, x, y, r);
  g.addColorStop(0, '#fbfcff'); g.addColorStop(0.55, '#bcc3d4'); g.addColorStop(1, '#5b6276');
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
  const lr = r * 0.4;
  ctx.beginPath(); ctx.arc(x, y, lr * 1.18, 0, Math.PI * 2); ctx.fillStyle = '#2a2f45'; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y, lr, 0, Math.PI * 2); ctx.fillStyle = '#0d1020'; ctx.fill();
  ctx.lineWidth = Math.max(2, lr * 0.16); ctx.strokeStyle = H.rgba(ACC, 0.6 + 0.4 * Math.sin(t * 3));
  ctx.beginPath(); ctx.arc(x, y, lr * 0.62, 0, Math.PI * 2); ctx.stroke();
}
