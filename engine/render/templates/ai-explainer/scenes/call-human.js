// Scene "call-human" (full frame, 1 beat). A video call on a big desk monitor at night: a cartoon "banker" fills the
// main tile, the viewer is a small picture-in-picture. Is the person on the call real?
// modes:
//   hook   (short, under the hook card): the banker talks, the tile glitches twice (slice offsets + colour fringe),
//          a "HUMAN?" pill lands on the tile at the cue word. The face sits low so it reads below the hook card.
//   payoff (header docked): question card at the top with two answer chips; the banker tile below gets a
//          "Human" badge on a check, and a generic eye-scanning sphere (no logos) glows on the desk.
// Fits: deepfake video calls, identity checks, "is the person on screen real?" stories.
// params: mode ("hook"), name ("Banker"), you ("You"), ask ("HUMAN?"), askCue (else 70%), badge ("Human"),
//         question ("Would you prove you're human?"), a ("Yes"), b ("No way"), qCue (else 0.3 s)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, roundRect, rgba } = H;
  const mode = P.mode || 'hook';
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const danger = '#ff6b5e';

  // ---- room ----
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: mode === 'hook' ? 1.05 : 1.03, x: 487, y: mode === 'hook' ? 760 : 725 }]);
  K.world.room(ctx, { t, time: 'night', lamp: true, plant: true });
  // desk top
  ctx.fillStyle = '#5a3e2c'; ctx.fillRect(0, 1030, 1080, 40);
  ctx.fillStyle = '#7a5640'; ctx.fillRect(0, 1022, 1080, 12);

  // ---- monitor ----
  const M = mode === 'hook' ? { x: 70, y: 556, w: 835, h: 440 } : { x: 90, y: 690, w: 620, h: 306 };
  // stand
  roundRect(ctx, M.x + M.w / 2 - 30, M.y + M.h - 4, 60, Math.max(14, 1026 - (M.y + M.h)), 6); ctx.fillStyle = '#2a2f45'; ctx.fill();
  roundRect(ctx, M.x + M.w / 2 - 90, 1012, 180, 14, 7); ctx.fillStyle = '#1c2033'; ctx.fill();
  roundRect(ctx, M.x, M.y, M.w, M.h, 22); ctx.fillStyle = '#1c2033'; ctx.fill();
  const S = { x: M.x + 16, y: M.y + 16, w: M.w - 32, h: M.h - 32 };
  roundRect(ctx, S.x, S.y, S.w, S.h, 12); ctx.fillStyle = '#0d1020'; ctx.fill();
  // call bar
  const barH = mode === 'hook' ? 44 : 38;
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(S.x, S.y, S.w, barH);
  const rec = 0.5 + 0.5 * Math.sin(t * 5);
  ctx.beginPath(); ctx.arc(S.x + 26, S.y + barH / 2, 8, 0, Math.PI * 2); ctx.fillStyle = rgba(danger, 0.5 + 0.5 * rec); ctx.fill();
  ctx.font = H.font('ui', 26); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Video call', S.x + 46, S.y + barH / 2 + 1);
  const mm = Math.floor(t) + (mode === 'hook' ? 132 : 412);
  ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(`${String(Math.floor(mm / 60)).padStart(2, '0')}:${String(mm % 60).padStart(2, '0')}`, S.x + S.w - 18, S.y + barH / 2 + 1);

  // main tile (banker)
  const T = { x: S.x + 10, y: S.y + barH + 8, w: S.w - 20, h: S.h - barH - 18 };
  const talk = clamp(info.env * 1.2);
  const tAsk = at(P.askCue, D * 0.7) - 0.15;
  // glitch windows (hook only)
  const gl = mode === 'hook' ? Math.max(win(t, 0.75, 1.05), win(t, tAsk - 0.55, tAsk + 0.05)) : 0;
  const person = { t, pose: 'stand', mood: mode === 'hook' ? 'happy' : 'happy', talk: mode === 'hook' ? talk : 0.15 * talk,
    skin: 2, hair: 1, hairStyle: 'short', shirt: '#2b3a67', seed: 7 };
  tile(ctx, H, K, T, person, gl, t, '#33406e', '#1b2140', mode === 'hook' ? 0.6 : 0.44, mode === 'hook' ? 0.6 : 0.5);
  // tie on the banker (simple accent of a suit)
  // name tag
  ctx.font = H.font('ui', 26);
  const nm = P.name || 'Banker';
  const nw = ctx.measureText(nm).width + 32;
  roundRect(ctx, T.x + 14, T.y + T.h - 52, nw, 40, 10); ctx.fillStyle = 'rgba(8,10,20,0.78)'; ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.fillText(nm, T.x + 30, T.y + T.h - 31);

  // picture-in-picture "You"
  const pw = mode === 'hook' ? 190 : 150, phh = mode === 'hook' ? 130 : 100;
  const Pp = { x: T.x + T.w - pw - 14, y: T.y + T.h - phh - 14, w: pw, h: phh };
  ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 16;
  roundRect(ctx, Pp.x, Pp.y, Pp.w, Pp.h, 10); ctx.fillStyle = '#222842'; ctx.fill(); ctx.restore();
  tile(ctx, H, K, Pp, { t, pose: 'stand', mood: mode === 'hook' ? 'worried' : 'neutral', skin: 0, hair: 3, hairStyle: 'long', shirt: 3, seed: 2, look: -0.4 }, 0, t, '#4a3d6a', '#2a2244');
  ctx.font = H.font('ui', 24); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
  ctx.fillText(P.you || 'You', Pp.x + 10, Pp.y + 22);

  if (mode === 'hook') {
    // "HUMAN?" pill on the tile at the cue
    const k = K.popIn(t, tAsk, 0.4);
    if (k > 0) {
      const s = Math.min(1.06, k), cx = T.x + 190, cy = T.y + T.h - 130;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.05); ctx.scale(s, s);
      ctx.font = H.font('display', 64);
      const txt = P.ask || 'HUMAN?', w = ctx.measureText(txt).width + 60;
      roundRect(ctx, -w / 2, -48, w, 96, 48); ctx.fillStyle = ACC; ctx.fill();
      ctx.fillStyle = K.ACCENT.deep; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 4);
      ctx.restore();
    }
    // scanline sheen over the whole screen
    ctx.save(); roundRect(ctx, S.x, S.y, S.w, S.h, 12); ctx.clip();
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    for (let y = S.y + ((t * 60) % 8); y < S.y + S.h; y += 8) ctx.fillRect(S.x, y, S.w, 2);
    ctx.restore();
  } else {
    // Human badge on the banker tile
    const tq = at(P.qCue, 0.3) - 0.2;
    const kb = K.popIn(t, Math.max(0.15, tq + 0.6), 0.45);
    if (kb > 0) {
      const s = Math.min(1.06, kb), bx = T.x + T.w - 120, by = T.y + 48;
      ctx.save(); ctx.translate(bx, by); ctx.scale(s, s);
      ctx.font = H.font('display', 30);
      const txt = P.badge || 'Human', w = ctx.measureText(txt).width + 76;
      roundRect(ctx, -w / 2, -26, w, 52, 26); ctx.fillStyle = ACC; ctx.fill();
      ctx.beginPath(); ctx.arc(-w / 2 + 28, 0, 15, 0, Math.PI * 2); ctx.fillStyle = K.ACCENT.deep; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.lineCap = 'round'; ctx.beginPath();
      ctx.moveTo(-w / 2 + 21, 0); ctx.lineTo(-w / 2 + 27, 6); ctx.lineTo(-w / 2 + 36, -6); ctx.stroke();
      ctx.fillStyle = K.ACCENT.deep; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(txt, -w / 2 + 52, 2);
      ctx.restore();
    }
    // the eye-scanning sphere on the desk, right
    const ko = K.popIn(t, 0.25, 0.5);
    if (ko > 0) {
      const ox = 830, oy = 905 + K.bob(t, 4, 1.4), r = 78 * Math.min(1.04, ko);
      drawOrb(ctx, H, K, ox, oy, r, t, ACC, 1);
      ctx.fillStyle = '#2a2f45'; roundRect(ctx, ox - 46, 1000, 92, 26, 8); ctx.fill();
      ctx.fillRect(ox - 12, oy + r - 6, 24, 1004 - (oy + r - 6));
    }
    // question card
    const kq = K.popIn(t, Math.max(0.05, tq), 0.45);
    if (kq > 0) {
      const s = Math.min(1.04, kq), cx = 487, cy = 548;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
      roundRect(ctx, -410, -118, 820, 236, 30); ctx.fillStyle = 'rgba(8,10,24,0.94)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
      const q = P.question || "Would you prove you're human?";
      const lines = H.wrap(ctx, q, 'display', 44, 740);
      ctx.font = H.font('display', 44); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lh = 54, y0 = -56 - (lines.length - 2) * lh / 2;
      lines.slice(0, 3).forEach((ln, i) => ctx.fillText(ln, 0, y0 + i * lh));
      // chips
      const chips = [P.a || 'Yes', P.b || 'No way'];
      chips.forEach((c, i) => {
        const kc = K.popIn(t, Math.max(0.05, tq) + 0.5 + i * 0.18, 0.35);
        if (kc <= 0) return;
        ctx.save(); ctx.translate(i ? 190 : -190, 72); ctx.scale(Math.min(1.05, kc), Math.min(1.05, kc));
        ctx.font = H.font('ui', 30);
        const w = ctx.measureText(c).width + 56;
        roundRect(ctx, -w / 2, -28, w, 56, 28); ctx.fillStyle = i ? 'rgba(255,255,255,0.12)' : ACC; ctx.fill();
        if (i) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.stroke(); }
        ctx.fillStyle = i ? '#ffffff' : K.ACCENT.deep; ctx.textAlign = 'center'; ctx.fillText(c, 0, 2);
        ctx.restore();
      });
      ctx.restore();
    }
  }
}

// 0..1..0 window between a and b (for glitches)
function win(t, a, b) { if (t < a || t > b) return 0; const m = (a + b) / 2, h = (b - a) / 2; return 1 - Math.abs(t - m) / h * 0.4; }

// A video tile with a head-and-shoulders cartoon; g (0..1) adds a digital glitch (slices shift, colour fringe).
function tile(ctx, H, K, T, person, g, t, c1, c2, hf, xf) {
  const { roundRect } = H;
  ctx.save(); roundRect(ctx, T.x, T.y, T.w, T.h, 10); ctx.clip();
  const bg = ctx.createLinearGradient(T.x, T.y, T.x, T.y + T.h); bg.addColorStop(0, c1); bg.addColorStop(1, c2);
  ctx.fillStyle = bg; ctx.fillRect(T.x, T.y, T.w, T.h);
  // soft shelf behind
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(T.x, T.y + T.h * 0.62, T.w, 6);
  const s = T.h / 150, cx = T.x + T.w * (xf || 0.5), feet = T.y + T.h * (hf || 0.44) + 212 * s;
  if (g <= 0) K.drawPerson(ctx, cx, feet, s, person);
  else {
    const n = 7, sh = T.h / n;
    for (let i = 0; i < n; i++) {
      const dx = (H.hash(i, Math.floor(t * 18)) - 0.5) * 70 * g * s;
      ctx.save(); ctx.beginPath(); ctx.rect(T.x, T.y + i * sh, T.w, sh + 1); ctx.clip();
      K.drawPerson(ctx, cx + dx, feet, s, person);
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const y = T.y + H.hash(i, Math.floor(t * 14) + 3) * T.h, hh = 6 + 18 * H.hash(i, 9);
      ctx.fillStyle = i % 2 ? 'rgba(255,60,90,0.35)' : 'rgba(60,200,255,0.35)';
      ctx.fillRect(T.x, y, T.w, hh * g);
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  ctx.restore();
}

// Generic eye-scanning sphere (no logo): silver ball, dark lens with an accent ring, soft glow.
export function drawOrb(ctx, H, K, x, y, r, t, ACC, glowA) {
  H.glow(ctx, x, y, r * 2.4, ACC, 0.18 * glowA);
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.1, x, y, r);
  g.addColorStop(0, '#fbfcff'); g.addColorStop(0.55, '#bcc3d4'); g.addColorStop(1, '#5b6276');
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
  // seam
  ctx.lineWidth = Math.max(1.5, r * 0.03); ctx.strokeStyle = 'rgba(40,46,66,0.35)';
  ctx.beginPath(); ctx.ellipse(x, y, r * 0.98, r * 0.22, 0, 0, Math.PI); ctx.stroke();
  // lens
  const lr = r * 0.4, lx = x, ly = y - r * 0.02;
  ctx.beginPath(); ctx.arc(lx, ly, lr * 1.18, 0, Math.PI * 2); ctx.fillStyle = '#2a2f45'; ctx.fill();
  ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2); ctx.fillStyle = '#0d1020'; ctx.fill();
  const pulse = 0.55 + 0.45 * Math.sin(t * 3);
  ctx.lineWidth = Math.max(2, lr * 0.14); ctx.strokeStyle = H.rgba(ACC, 0.5 + 0.5 * pulse);
  ctx.beginPath(); ctx.arc(lx, ly, lr * 0.62, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(lx - lr * 0.3, ly - lr * 0.32, lr * 0.16, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill();
}
