// Scene "java-hunt" (full frame, 1 beat per mode). A night studio whose back wall is one giant screen of code (a big
// shared codebase, named by a text pill only: no logos). The kit robot (an AI coding tool) holds a big magnifying
// glass over the wall; the lens shows the code enlarged, and a hidden crack (the security hole) flares red under it.
// A stopwatch panel counts the minutes; a price tag can swing in. Metaphor only, no exploit details.
// modes:
//   hook  cold open: the lens is already sliding onto the crack at frame 0; the crack flares, rings pulse, the timer
//         panel reads `timer` and a `found` stamp lands by ~1.4 s. Ends settled.
//   find  a generic cartoon researcher at a desk with a laptop (left) directs the robot (dotted link); the lens
//         sweeps the wall row by row while the stopwatch counts minutes; on foundCue the lens snaps to the crack, it
//         flares, `found` stamp; hourCue the timer turns into `timer`; priceCue a price tag swings in.
// params: mode, wall ("CODE"), timer ("1 HOUR"), found ("HOLE FOUND"), tool ("AI tool"), person ("Researcher"),
//         price ("< $200"), cues (narration words, "word#n" = (n+1)th time, or numbers = scene seconds):
//         toolCue, scanCue, foundCue, hourCue, priceCue
// Fits: an AI finding a bug / security hole in a big codebase, AI code audits, "found it in N hours" stories.
const RED = '#ff5a52';
const WX0 = 110, WX1 = 870, WY0 = 460, WY1 = 880, ROWS = 24;
const PITCH = (WY1 - WY0 - 40) / ROWS;
const CR = { x: 500, y: 700 }; // the hidden hole

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, roundRect, rgba } = H;
  const at = (w, d) => {
    if (typeof w === 'number') return w;
    if (!w) return d;
    const [wd, n] = String(w).split('#');
    const v = info.timeOf(wd, n ? parseInt(n, 10) : 0);
    return v == null ? d : v;
  };
  const hook = P.mode !== 'find';
  const tTool = hook ? Infinity : at(P.toolCue, D * 0.25) - 0.2;
  const tScan = hook ? 0 : Math.max(0.6, at(P.scanCue, D * 0.35) - 0.3);
  const tFound = hook ? 0.15 : at(P.foundCue, D * 0.62) - 0.4;
  const tHour = hook ? -1 : at(P.hourCue, D * 0.78) - 0.2;
  const tPrice = hook ? Infinity : at(P.priceCue, D * 0.86) - 0.2;

  ctx.save();
  if (hook) K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 500, y: 725 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: tFound, zoom: 1.02, x: 487, y: 725 }, { t: tFound + 1.2, zoom: 1.04, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 725 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: true });

  // ---- the code wall
  const hot = smooth((t - tFound) / 0.5);
  roundRect(ctx, WX0 - 16, WY0 - 16, WX1 - WX0 + 32, WY1 - WY0 + 32, 22); ctx.fillStyle = '#11142a'; ctx.fill();
  ctx.save();
  roundRect(ctx, WX0, WY0, WX1 - WX0, WY1 - WY0, 14); ctx.clip();
  codeWall(ctx, H, t, 0);
  crack(ctx, H, K, t, hot, 1);
  ctx.restore();
  // wall name tab (text only)
  ctx.save();
  ctx.font = H.font('display', 30); const nm = String(P.wall || 'CODE'); const nw = ctx.measureText(nm).width + 44;
  roundRect(ctx, WX0 + 8, WY0 - 34, nw, 46, 14); ctx.fillStyle = '#262b4f'; ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(nm, WX0 + 8 + nw / 2, WY0 - 10);
  ctx.restore();

  // ---- lens path
  let lx, ly;
  if (hook) {
    const u = easeOutCubic(clamp((t + 0.5) / 1.1)); // already moving at frame 0
    lx = lerp(330, CR.x, u); ly = lerp(610, CR.y, u);
  } else {
    // sweep: zig-zag across rows between tScan and tFound, then snap to the crack
    const s = clamp((t - tScan) / Math.max(0.5, tFound - tScan));
    const rows = 4, ph = s * rows, row = Math.min(rows - 1, Math.floor(ph)), f = ph - row;
    const dir = row % 2 ? -1 : 1, fx = dir > 0 ? f : 1 - f;
    const sx = lerp(230, 760, H.easeInOutCubic(fx)), sy = 560 + row * 75 + 30 * smooth((f - 0.85) / 0.15);
    const idle = { x: 690, y: 640 };
    const enter = smooth((t - tScan + 0.4) / 0.4);
    const snap = easeOutCubic(clamp((t - tFound) / 0.45));
    lx = lerp(lerp(idle.x, sx, enter), CR.x, snap); ly = lerp(lerp(idle.y, sy, enter), CR.y, snap);
  }
  const LR = 104;

  // ---- researcher (find mode): desk + laptop, link to the robot
  if (!hook) {
    const px = 250, fy = 1036;
    K.drawDesk(ctx, 335, fy, 0.82);
    K.drawLaptop(ctx, 365, fy - 90, 0.72, { t, screen: 'code', typing: t > tTool - 0.5 && t < tFound ? 1 : 0, shadow: false });
    K.drawPerson(ctx, px, fy, 1.0, { t, pose: t > tFound + 0.3 ? 'cheer' : 'point', mood: t > tFound + 0.3 ? 'shocked' : 'happy', look: 0.8, skin: 2, hair: 2, hairStyle: 'short', shirt: 2, seed: 11 });
    const lk = smooth((t - tTool) / 0.5);
    if (lk > 0) {
      ctx.save(); ctx.globalAlpha = lk * 0.8; ctx.strokeStyle = ACC; ctx.lineWidth = 4; ctx.setLineDash([8, 10]); ctx.lineDashOffset = -t * 40;
      ctx.beginPath(); ctx.moveTo(410, fy - 200); ctx.quadraticCurveTo(560, fy - 330, 700, fy - 250); ctx.stroke(); ctx.restore();
    }
  }

  // ---- the robot with the magnifier (right)
  const RX = hook ? 770 : 790, RY = 1036, RS = hook ? 1.12 : 1.0;
  K.drawRobot(ctx, RX, RY, RS, { t, state: t > tFound + 0.4 ? 'happy' : 'working', flip: true, seed: 3 });
  // arm + handle to the lens
  const shX = RX - 34 * RS, shY = RY - 128 * RS;
  const ang = Math.atan2(ly - shY, lx - shX);
  const hx = lx - Math.cos(ang) * (LR + 70), hy = ly - Math.sin(ang) * (LR + 70);
  ctx.save(); ctx.lineCap = 'round';
  ctx.strokeStyle = '#dfe4f1'; ctx.lineWidth = 13;
  ctx.beginPath(); ctx.moveTo(shX, shY); ctx.quadraticCurveTo((shX + hx) / 2, Math.max(shY, hy) + 30, hx, hy); ctx.stroke();
  ctx.strokeStyle = '#3a2f2a'; ctx.lineWidth = 18;
  ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(lx - Math.cos(ang) * (LR + 4), ly - Math.sin(ang) * (LR + 4)); ctx.stroke();
  ctx.fillStyle = '#dfe4f1'; ctx.beginPath(); ctx.arc(hx, hy, 12, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // lens: the wall enlarged inside
  ctx.save();
  ctx.beginPath(); ctx.arc(lx, ly, LR, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = '#0b0e20'; ctx.fillRect(lx - LR, ly - LR, LR * 2, LR * 2);
  ctx.translate(lx, ly); ctx.scale(1.9, 1.9); ctx.translate(-lx, -ly);
  codeWall(ctx, H, t, 1);
  crack(ctx, H, K, t, hot, 1.9);
  ctx.restore();
  ctx.save();
  ctx.fillStyle = 'rgba(200,225,255,0.08)'; ctx.beginPath(); ctx.arc(lx, ly, LR, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(lx - 28, ly - 30, LR * 0.5, Math.PI * 1.05, Math.PI * 1.45); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 6; ctx.stroke();
  ctx.beginPath(); ctx.arc(lx, ly, LR, 0, Math.PI * 2); ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 16; ctx.stroke();
  ctx.strokeStyle = '#8a92b5'; ctx.lineWidth = 5; ctx.stroke();
  ctx.restore();
  // rings round the found hole
  if (hot > 0) {
    for (let k = 0; k < 2; k++) {
      const ph = ((t - tFound) * 0.9 + k * 0.5) % 1;
      ctx.save(); ctx.globalAlpha = hot * (1 - ph) * 0.8; ctx.strokeStyle = RED; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(lx, ly, LR + 10 + ph * 60, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
  }

  // ---- stopwatch panel (top left)
  timerPanel(ctx, H, K, t, P, hook, tScan, tFound, tHour, ACC);
  // price tag (find)
  if (t > tPrice) {
    const k = K.popIn(t, tPrice, 0.5);
    K.drawPriceTag(ctx, 450, 668 + (1 - Math.min(1, k)) * -60, 0.95 * Math.min(1.05, k), { t: t - tPrice, text: String(P.price || '< $200'), size: 34, shadow: false });
  }
  // found stamp
  const st = (t - tFound - 0.35) / 0.5;
  if (st > 0) K.drawStamp(ctx, hook ? 330 : 640, hook ? 930 : 610, 0.8, { kind: 'cross', text: String(P.found || 'HOLE FOUND'), land: st });
  // name pills (find)
  if (!hook) {
    const pk = K.popIn(t, 0.25, 0.45);
    if (pk > 0) K.drawLabel(ctx, 270, 800, Math.min(1.05, pk), { text: String(P.person || 'Researcher'), size: 26, dot: true });
    const tk = K.popIn(t, tTool, 0.45);
    if (tk > 0) K.drawLabel(ctx, 760, 742, Math.min(1.05, tk), { text: String(P.tool || 'AI tool'), size: 28, accent: true });
  }
  ctx.restore();
}

// code lines (wall coords). dim: 0 normal, 1 inside the lens (brighter)
function codeWall(ctx, H, t, lens) {
  const pal = ['#5b6699', '#7a86c2', '#4f8fb8', '#8c7dc9', '#6b7491'];
  ctx.fillStyle = '#0b0e20'; ctx.fillRect(WX0, WY0, WX1 - WX0, WY1 - WY0);
  H.glow(ctx, 487, 680, 420, '#5866c9', 0.08);
  for (let r = 0; r < ROWS; r++) {
    const y = WY0 + 22 + r * PITCH;
    let x = WX0 + 22 + Math.floor(H.hash(r, 1) * 4) * 22, seg = 0;
    while (x < WX1 - 40 && seg < 8) {
      const w = 20 + H.hash(r, seg + 7) * 80;
      if (x + w > WX1 - 26) break;
      ctx.globalAlpha = (lens ? 0.85 : 0.5) + 0.2 * H.hash(r, seg + 30);
      H.roundRect(ctx, x, y, w, PITCH * 0.48, PITCH * 0.24); ctx.fillStyle = pal[(r + seg) % 5]; ctx.fill();
      x += w + 10 + H.hash(seg, r + 3) * 14; seg++;
    }
  }
  ctx.globalAlpha = 1;
  const scan = WY0 + ((t * 70) % (WY1 - WY0));
  ctx.fillStyle = 'rgba(160,180,255,0.05)'; ctx.fillRect(WX0, scan, WX1 - WX0, 24);
}
// the hole: a small dark crack in the code, glowing red when found. s = line scale (lens magnification)
function crack(ctx, H, K, t, hot, s) {
  const pts = [[-62, -44], [-30, -16], [-44, 4], [-8, 22], [-18, 42], [24, 52]].map(([x, y]) => [CR.x + x, CR.y + y]);
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (hot > 0) H.glow(ctx, CR.x, CR.y, 120, RED, 0.55 * hot * (0.85 + 0.15 * Math.sin(t * 7)));
  ctx.strokeStyle = '#05060f'; ctx.lineWidth = 14 / Math.sqrt(s); K.pathDraw(ctx, pts, 1);
  ctx.strokeStyle = H.mixHex('#2a2c44', RED, hot); ctx.lineWidth = 7 / Math.sqrt(s); K.pathDraw(ctx, pts, 1);
  ctx.restore();
}
function timerPanel(ctx, H, K, t, P, hook, tScan, tFound, tHour, ACC) {
  const k = hook ? 1 : K.popIn(t, Math.max(0.1, tScan - 0.3), 0.45);
  if (k <= 0) return;
  const X = 140, Y = 498, W = 250, Hh = 92;
  ctx.save(); ctx.translate(X + W / 2, Y + Hh / 2); ctx.scale(Math.min(1.04, k), Math.min(1.04, k)); ctx.translate(-(X + W / 2), -(Y + Hh / 2));
  H.roundRect(ctx, X, Y, W, Hh, 20); ctx.fillStyle = 'rgba(10,12,24,0.94)'; ctx.fill();
  const done = t > tHour;
  ctx.lineWidth = 3; ctx.strokeStyle = done ? ACC : 'rgba(255,255,255,0.25)'; ctx.stroke();
  // stopwatch icon
  const cx = X + 48, cy = Y + Hh / 2 + 4;
  ctx.beginPath(); ctx.arc(cx, cy, 28, 0, Math.PI * 2); ctx.fillStyle = '#f4f1e8'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = '#2a2f45'; ctx.stroke();
  H.roundRect(ctx, cx - 8, cy - 42, 16, 10, 3); ctx.fillStyle = '#2a2f45'; ctx.fill();
  const prog = hook ? 1 : H.clamp((t - tScan) / Math.max(0.5, tFound - tScan));
  const a = -Math.PI / 2 + (done ? 1 : prog) * Math.PI * 2 + (done ? 0 : t * 0);
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, 22, -Math.PI / 2, a); ctx.closePath(); ctx.fillStyle = H.rgba(ACC, 0.55); ctx.fill();
  ctx.strokeStyle = '#1b1f36'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * 20, cy + Math.sin(a) * 20); ctx.stroke();
  // readout
  const mins = Math.round(prog * 60);
  const txt = done ? String(P.timer || '1 HOUR') : (mins >= 60 ? '~60 MIN' : mins + ' MIN');
  ctx.font = H.font('display', 40); ctx.fillStyle = done ? ACC : '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const ft = H.fitText(ctx, txt, 'display', 40, 24, W - 110); ctx.font = ft.font;
  ctx.fillText(txt, X + 94, Y + Hh / 2 + 2);
  ctx.restore();
}
