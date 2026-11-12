// Scene "code-wall" (full frame). A night studio whose back wall is one giant screen of code (hundreds of tiny
// code lines). The kit robot (a chatbot helper) stands on a scissor lift and presses one tiny glowing lime patch
// into a single line; a percent tag points at the patch.
// modes:
//   hook   (cold open: the patch is already going in at frame 0; tag + lines pill pop, then on `eruptCue` (default
//           55%) red thumbs-down bubbles burst out of the wall and two small developers at the bottom look shocked)
//   number (starts close on the patch, pulls back to show how small it is in the whole wall; a stat card with
//           `pctLabel` + `pct` lands on pctCue, a `lines` pill (+ `linesSub`) by the patch on linesCue, then on
//           elseCue a white check wave sweeps the rest of the wall and an `else` pill lands)
// params: mode, pct ("0.1%"), pctLabel ("well under"), lines ("10 LINES"), linesSub, else, eruptCue, pctCue,
//         linesCue, elseCue (narration words, "word#n", or seconds)
// Fits: "AI wrote only a tiny part of X", a patch / fix in a huge codebase, small AI use that set off a backlash.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const mode = P.mode === 'number' ? 'number' : 'hook';
  const RED = '#ff5e57';

  // wall geometry (pre-camera scene coords)
  const WX0 = 130, WX1 = 850, WY0 = 450, WY1 = 900, ROWS = 32, PITCH = (WY1 - WY0 - 40) / ROWS;
  const SROW = 21, SX0 = 548, SX1 = 596;                       // the patched line segment
  const SY = WY0 + 26 + SROW * PITCH;

  // cues
  const tErupt = mode === 'hook' ? at(P.eruptCue, D * 0.55) : Infinity;
  const tPct = mode === 'number' ? at(P.pctCue, D * 0.3) - 0.15 : Infinity;
  const tLines = mode === 'number' ? at(P.linesCue, D * 0.55) - 0.15 : Infinity;
  const tElse = mode === 'number' ? at(P.elseCue, D * 0.85) - 0.2 : Infinity;

  ctx.save();
  if (mode === 'number') {
    const p0 = Math.min(0.5, tPct - 1.8), p1 = Math.max(p0 + 0.8, tPct - 0.1);
    K.camera(ctx, t, [{ t: 0, zoom: 2.3, x: 600, y: SY + 10 }, { t: p0, zoom: 2.3, x: 600, y: SY + 10 }, { t: p1, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 715 }]);
  } else {
    K.camera(ctx, t, [{ t: 0, zoom: 1.12, x: 560, y: 720 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
    if (t > tErupt) K.cameraShake(ctx, t, tErupt, 0.45, 9);
  }
  const room = K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: true });

  // ---- the code wall
  ctx.save();
  roundRect(ctx, WX0 - 16, WY0 - 16, WX1 - WX0 + 32, WY1 - WY0 + 32, 22); ctx.fillStyle = '#11142a'; ctx.fill();
  roundRect(ctx, WX0, WY0, WX1 - WX0, WY1 - WY0, 14); ctx.fillStyle = '#0b0e20'; ctx.fill();
  roundRect(ctx, WX0, WY0, WX1 - WX0, WY1 - WY0, 14); ctx.clip();
  K.glow(ctx, 487, 680, 420, '#5866c9', 0.08);
  const elseK = clamp((t - tElse) / 1.1);                     // check wave sweep 0..1 (left -> right)
  const pal = ['#5b6699', '#7a86c2', '#4f8fb8', '#8c7dc9', '#6b7491'];
  for (let r = 0; r < ROWS; r++) {
    const y = WY0 + 22 + r * PITCH;
    let x = WX0 + 22 + (Math.floor(H.hash(r, 1) * 4)) * 22;
    let seg = 0;
    while (x < WX1 - 40 && seg < 7) {
      const w = 22 + H.hash(r, seg + 7) * 90;
      if (x + w > WX1 - 26) break;
      const isPatch = r === SROW && seg === 3;
      if (!isPatch) {
        const lit = elseK > 0 ? clamp((elseK * 1.3 - (x - WX0) / (WX1 - WX0)) * 3) : 0;
        ctx.globalAlpha = 0.55 + 0.25 * H.hash(r, seg + 30);
        roundRect(ctx, x, y, w, PITCH * 0.5, PITCH * 0.25);
        ctx.fillStyle = lit > 0 ? H.mixHex(pal[(r + seg) % 5], '#e9eefc', lit * 0.75) : pal[(r + seg) % 5]; ctx.fill();
      }
      x += w + 10 + H.hash(seg, r + 3) * 14; seg++;
    }
  }
  ctx.globalAlpha = 1;
  // slow scanline for life
  const scan = WY0 + ((t * 70) % (WY1 - WY0));
  ctx.fillStyle = 'rgba(160,180,255,0.05)'; ctx.fillRect(WX0, scan, WX1 - WX0, 26);
  ctx.restore();

  // ---- the patch: a lime segment pressed in by the robot
  const tPress = mode === 'hook' ? 0.0 : 0.15;
  const press = clamp((t - tPress + 0.35) / 0.7);              // already moving at frame 0
  const seated = clamp((t - tPress - 0.35) / 0.3);
  const pulse = 0.5 + 0.5 * Math.sin(t * 5);
  const PX = lerp(650, (SX0 + SX1) / 2, H.easeOutCubic(press)), PY = lerp(SY - 46, SY + PITCH * 0.25, H.easeOutCubic(press));
  K.glow(ctx, (SX0 + SX1) / 2, SY + 4, 70 + 16 * pulse, ACC, 0.25 + 0.25 * seated);
  ctx.save();
  roundRect(ctx, PX - (SX1 - SX0) / 2, PY - PITCH * 0.25, SX1 - SX0, PITCH * 0.5, PITCH * 0.25); ctx.fillStyle = ACC; ctx.fill();
  ctx.restore();
  if (seated > 0) { // ring around the patch
    ctx.save(); ctx.strokeStyle = rgba(ACC, 0.9 - 0.4 * pulse); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse((SX0 + SX1) / 2, SY + 4, 44 + 8 * pulse, 22 + 5 * pulse, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    // little sparks as it seats
    const sp = clamp((t - tPress - 0.35) / 0.5);
    if (sp > 0 && sp < 1) {
      ctx.save(); ctx.strokeStyle = rgba(ACC, 1 - sp); ctx.lineWidth = 3; ctx.lineCap = 'round';
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, r0 = 30 + 40 * sp; ctx.beginPath(); ctx.moveTo((SX0 + SX1) / 2 + Math.cos(a) * r0, SY + 4 + Math.sin(a) * r0 * 0.6); ctx.lineTo((SX0 + SX1) / 2 + Math.cos(a) * (r0 + 14), SY + 4 + Math.sin(a) * (r0 + 14) * 0.6); ctx.stroke(); }
      ctx.restore();
    }
  }

  // ---- robot on a scissor lift (right of the patch)
  const LX = 700, LY = SY + 70, FLOOR = 1030;
  ctx.save();
  ctx.strokeStyle = '#5c6488'; ctx.lineWidth = 9; ctx.lineCap = 'round';
  const n = 4, seg = (FLOOR - 24 - LY) / n;
  for (let i = 0; i < n; i++) {
    ctx.beginPath(); ctx.moveTo(LX - 70, LY + 16 + i * seg); ctx.lineTo(LX + 70, LY + 16 + (i + 1) * seg);
    ctx.moveTo(LX + 70, LY + 16 + i * seg); ctx.lineTo(LX - 70, LY + 16 + (i + 1) * seg); ctx.stroke();
  }
  K.shadow(ctx, LX, FLOOR, 220);
  roundRect(ctx, LX - 100, FLOOR - 26, 200, 26, 10); ctx.fillStyle = '#3a4167'; ctx.fill();
  roundRect(ctx, LX - 96, LY, 192, 18, 8); ctx.fillStyle = '#ffcc33'; ctx.fill();
  ctx.fillStyle = '#141829'; for (let i = 0; i < 6; i++) ctx.fillRect(LX - 88 + i * 32, LY + 3, 14, 12);
  ctx.restore();
  K.drawRobot(ctx, LX + 10, LY, 0.95, { t, state: seated > 0.5 ? (mode === 'hook' && t > tErupt + 0.3 ? 'thinking' : 'happy') : 'working', flip: true, seed: 3 });
  // arm reaching to the patch while pressing
  ctx.save(); ctx.strokeStyle = '#dfe4f1'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  const hx = lerp(PX + 26, SX1 + 16, seated), hy = PY;
  ctx.beginPath(); ctx.moveTo(LX - 40, LY - 120); ctx.quadraticCurveTo(LX - 70, hy - 20, hx, hy); ctx.stroke();
  ctx.fillStyle = '#dfe4f1'; ctx.beginPath(); ctx.arc(hx, hy, 11, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // ---- hook: developers react; thumbs-down bubbles burst out of the wall
  if (mode === 'hook') {
    const shocked = t > tErupt;
    K.drawPerson(ctx, 230, 1040, 1.15, { t, pose: shocked ? 'shrug' : 'stand', mood: shocked ? 'shocked' : 'happy', look: 0.6, skin: 1, hair: 1, hairStyle: 'short', shirt: 1, seed: 4 });
    K.drawPerson(ctx, 400, 1040, 1.05, { t, pose: shocked ? 'stand' : 'point', mood: shocked ? 'worried' : 'happy', look: 0.5, skin: 3, hair: 0, hairStyle: 'bun', shirt: 3, seed: 8 });
    const spots = [[190, 520], [330, 470], [800, 500], [180, 680], [820, 660], [300, 830], [470, 520], [640, 470], [860, 820]];
    spots.forEach(([x, y], i) => {
      const lt = t - tErupt - i * 0.07;
      if (lt <= 0) return;
      const u = H.easeOutCubic(clamp(lt / 0.55));
      const bx = lerp((SX0 + SX1) / 2, x, u), by = lerp(SY, y, u) + Math.sin(t * 2.2 + i) * 4 * u;
      thumbBubble(ctx, H, bx, by, 34 * Math.min(1.08, K.popIn(lt, 0, 0.4)), RED, true);
    });
  }
  ctx.restore();

  // ---- overlays (not zoomed by the scene camera; the template still zooms the frame)
  if (mode === 'hook') {
    const tp = K.popIn(t, 0.25, 0.4);
    if (tp > 0) {
      leader(ctx, (SX0 + SX1) / 2 - 20, SY - 4, 420, 612, ACC, clamp((t - 0.2) / 0.3));
      K.drawLabel(ctx, 380, 612, tp, { text: String(P.pct || '0.1%'), size: 44, accent: true });
    }
    const lp = K.popIn(t, Math.max(0.6, at('ten', 0.9) - 0.1), 0.4);
    if (lp > 0) K.drawLabel(ctx, 380, 530, lp, { text: String(P.lines || '10 LINES'), size: 28, dot: true });
  } else {
    // stat card (top left of the wall)
    const sp = K.popIn(t, tPct, 0.45);
    if (sp > 0) {
      const X0 = 150, Y0 = 470, W = 330, Hh = 170;
      ctx.save(); ctx.translate(X0 + W / 2, Y0 + Hh / 2); const s = Math.min(1.04, 0.6 + 0.4 * sp); ctx.scale(s, s); ctx.translate(-(X0 + W / 2), -(Y0 + Hh / 2));
      roundRect(ctx, X0, Y0, W, Hh, 24); ctx.fillStyle = 'rgba(10,12,24,0.94)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = rgba(ACC, 0.6); ctx.stroke();
      ctx.font = H.font('ui', 26); ctx.letterSpacing = '2px'; ctx.fillStyle = '#c9d0e6'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(String(P.pctLabel || 'well under').toUpperCase(), X0 + 28, Y0 + 50); ctx.letterSpacing = '0px';
      ctx.font = H.font('display', 88); ctx.fillStyle = ACC;
      ctx.fillText(String(P.pct || '0.1%'), X0 + 26, Y0 + 145);
      ctx.restore();
    }
    const lp = K.popIn(t, tLines, 0.45);
    if (lp > 0) {
      leader(ctx, (SX0 + SX1) / 2, SY - 8, 650, 560 + 10, ACC, clamp((t - tLines) / 0.3));
      K.drawLabel(ctx, 680, 560, lp, { text: String(P.lines || '~10 LINES'), size: 30, accent: true });
      if (P.linesSub) { const lq = K.popIn(t, tLines + 0.5, 0.4); if (lq > 0) K.drawLabel(ctx, 680, 500, lq, { text: String(P.linesSub), size: 24 }); }
    }
    const ep = K.popIn(t, tElse + 0.3, 0.45);
    if (ep > 0 && P.else) {
      K.drawLabel(ctx, 487, 990, ep, { text: String(P.else), size: 30, dot: true });
    }
  }
}

function leader(ctx, x0, y0, x1, y1, col, k) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.setLineDash([8, 8]);
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k); ctx.stroke(); ctx.restore();
}

// A round review bubble with a thumb (down = red, up = accent). r = radius.
export function thumbBubble(ctx, H, x, y, r, col, down) {
  if (r <= 0) return;
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, r * 0.95, r * 0.8, r * 0.2, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = col; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.stroke();
  thumb(ctx, H, 0, 0, r / 30, down);
  ctx.restore();
}
export function thumb(ctx, H, x, y, s, down) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, down ? -s : s);
  ctx.fillStyle = '#ffffff';
  H.roundRect(ctx, -16, -4, 9, 20, 3); ctx.fill();               // cuff
  H.roundRect(ctx, -5, -6, 22, 22, 6); ctx.fill();               // fist
  H.roundRect(ctx, -3, -20, 10, 18, 5); ctx.fill();              // thumb
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-3, 3); ctx.lineTo(15, 3); ctx.moveTo(-3, 9); ctx.lineTo(15, 9); ctx.stroke();
  ctx.restore();
}
