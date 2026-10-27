// Scene "proof-chalkboard" (full frame, best as a 2-beat span: hook + what happened). Night classroom: a big
// chalkboard with a famous conjecture's name as its title; the kit robot fills the board with chalk working. On
// claimCue the robot steps back, a chalk line strikes through the title and a claim pill lands ("X says:
// disproved"); on foundCue a lightbulb lights and a dated note pins to the board; on checkedCue a laptop on the
// desk shows a proof checker's tick, a CHECKED stamp lands and a second dated note pins up.
// Fits: "an AI claims to have proved / disproved a famous open problem" stories.
// params: board (title on the board), claim, found, checked, stamp ("CHECKED"), claimCue, foundCue, checkedCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tClaim = at(P.claimCue, D * 0.35);
  const tFound = at(P.foundCue, D * 0.65);
  const tCheck = at(P.checkedCue, D * 0.82);
  const feet = 1030;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: tClaim, zoom: 1.04, x: 487, y: 700 }, { t: tFound, zoom: 1.02, x: 520, y: 730 }, { t: D, zoom: 1.06, x: 500, y: 740 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, floorY: 900 });

  // chalkboard
  const bx = 80, by = 440, bw = 900, bh = 380;
  H.roundRect(ctx, bx - 18, by - 18, bw + 36, bh + 36, 14); ctx.fillStyle = '#8a5d3b'; ctx.fill();
  H.roundRect(ctx, bx, by, bw, bh, 8); ctx.fillStyle = '#1f3d36'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.03)';
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.ellipse(bx + 120 + i * 140, by + 80 + (i % 2) * 180, 90, 40, 0.3, 0, Math.PI * 2); ctx.fill(); }
  H.roundRect(ctx, bx + 40, by + bh + 4, 240, 16, 6); ctx.fillStyle = '#6e4a2f'; ctx.fill();
  ctx.fillStyle = '#f2f4fa'; ctx.fillRect(bx + 70, by + bh - 4, 34, 9); ctx.fillStyle = ACC; ctx.fillRect(bx + 120, by + bh - 4, 28, 9);

  // board title in chalk
  const title = P.board || 'A famous conjecture';
  ctx.save();
  const f = H.fitText(ctx, title, 'display', 50, 28, bw - 80); ctx.font = f.font;
  ctx.fillStyle = 'rgba(240,244,250,0.92)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(f.text, bx + bw / 2, by + 62);
  const tw = ctx.measureText(f.text).width;
  ctx.restore();
  // chalk working: rows of strokes written over time (deterministic)
  const writeU = clamp(t / Math.max(1, tClaim - 0.4));
  ctx.save(); ctx.strokeStyle = 'rgba(235,240,248,0.75)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  const rows = 5, perRow = 7; let n = 0; const total = rows * perRow;
  for (let r = 0; r < rows; r++) {
    let x = bx + 60;
    for (let j = 0; j < perRow; j++, n++) {
      const u = clamp(writeU * total - n);
      const w = 50 + H.hash(r, j) * 55;
      if (u > 0) {
        const y = by + 130 + r * 46;
        ctx.beginPath();
        const steps = 8;
        for (let s = 0; s <= steps * u; s++) {
          const xx = x + (w * s) / steps, yy = y + Math.sin(s * 1.7 + r + j) * 7;
          if (s === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
        }
        ctx.stroke();
        if (H.hash(j, r) > 0.6 && u >= 1) { ctx.font = H.font('ui', 28); ctx.fillStyle = 'rgba(235,240,248,0.8)'; ctx.fillText(H.hash(r + 3, j) > 0.5 ? '=' : '+', x + w + 8, y + 10); }
      }
      x += w + 40;
      if (x > bx + bw - 520) break;
    }
  }
  ctx.restore();

  // strike-through on the title
  const strike = smooth((t - tClaim) / 0.6);
  if (strike > 0) {
    ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(bx + bw / 2 - tw / 2 - 16, by + 66); ctx.lineTo(bx + bw / 2 - tw / 2 - 16 + (tw + 32) * strike, by + 58); ctx.stroke();
    ctx.restore();
  }

  // pinned notes (dates) on the right of the board
  note(H, ctx, 600, 590, K.popIn(t, tFound, 0.45), P.found || 'Day 1: proof found', ACC, -0.05);
  note(H, ctx, 600, 720, K.popIn(t, tCheck + 0.2, 0.45), P.checked || 'Day 2: checked', ACC, 0.04);

  // desk with laptop (proof checker)
  K.drawDesk(ctx, 300, feet, 1.15);
  const scr = t > tCheck ? 'blank' : 'code';
  K.drawLaptop(ctx, 300, feet - 122, 0.95, { t, screen: scr, typing: t < tCheck ? 1 : 0 });
  if (t > tCheck) {
    const k = K.popIn(t, tCheck, 0.4);
    ctx.save(); ctx.translate(300, feet - 205); ctx.scale(k, k);
    ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    ctx.strokeStyle = '#14160a'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-14, 2); ctx.lineTo(-3, 13); ctx.lineTo(16, -11); ctx.stroke();
    ctx.restore();
  }
  K.props.mug(ctx, 430, feet - 110, 0.8, t);

  // robot: writes at the board, steps back on the claim
  const back = H.easeInOutCubic(clamp((t - tClaim + 0.3) / 1.4));
  const rx = lerp(560, 850, back);
  const writing = t < tClaim - 0.2;
  K.drawRobot(ctx, rx, feet, 1.45, { t, state: writing ? 'working' : (t > tCheck + 0.4 ? 'happy' : 'thinking'), flip: writing, talk: 0, seed: 3 });
  // chalk in hand while writing
  if (writing) { ctx.save(); ctx.fillStyle = '#f2f4fa'; ctx.translate(rx - 95, feet - 230 + Math.sin(t * 9) * 6); ctx.rotate(-0.5); ctx.fillRect(-14, -4, 28, 9); ctx.restore(); }
  // lightbulb on found
  const bulb = smooth((t - tFound + 0.2) / 0.4);
  if (bulb > 0) K.drawLightbulb(ctx, rx + 10, feet - 360 + K.bob(t, 5, 1.1, 0), 0.75 * Math.min(1, K.popIn(t, tFound - 0.2, 0.4)), { on: bulb, t, shadow: false });
  if (t > tCheck + 0.3) K.drawStamp(ctx, 470, 1000, 0.5, { kind: 'check', text: P.stamp || 'CHECKED', land: (t - tCheck - 0.3) / 0.5 });
  ctx.restore();

  // claim pill (screen space, top of stage)
  pill(H, ctx, 430, 745, K.popIn(t, tClaim + 0.2, 0.45), P.claim || 'Claimed: disproved', ACC, true);
}

function note(H, ctx, x, y, k, text, ACC, rot) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k);
  ctx.font = H.font('ui', 28);
  const lines = H.wrap(ctx, text, 'ui', 28, 230);
  const h = 30 + lines.length * 36;
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; H.roundRect(ctx, -136, -h / 2 + 6, 280, h, 8); ctx.fill();
  ctx.fillStyle = '#fff6c8'; H.roundRect(ctx, -140, -h / 2, 280, h, 8); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -h / 2 + 10, 9, 0, Math.PI * 2); ctx.fillStyle = '#ff6b5e'; ctx.fill();
  ctx.fillStyle = '#1c2033'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((ln, i) => ctx.fillText(ln, 0, -h / 2 + 33 + i * 36));
  ctx.restore();
}

function pill(H, ctx, x, y, k, text, ACC, solid) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y + 30); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  const f = H.fitText(ctx, text, 'ui', 34, 22, 760); ctx.font = f.font;
  const w = ctx.measureText(f.text).width + 60;
  H.roundRect(ctx, -w / 2, -31, w, 62, 31); ctx.fillStyle = solid ? ACC : 'rgba(10,12,24,0.92)'; ctx.fill();
  if (!solid) { ctx.lineWidth = 2.5; ctx.strokeStyle = ACC; ctx.stroke(); }
  ctx.fillStyle = solid ? '#14160a' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
  ctx.restore();
}
