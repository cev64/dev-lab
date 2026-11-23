// Scene "file-dig" (full frame). A night gaming room: a big wall monitor plays a generic neon crime-city driving game
// (sunset, palm trees, a car, music notes rising). A cartoon fan sits at a desk with a laptop. A music file card flies
// out of the monitor; a magnifier sweeps its metadata and the hidden line "comment: made with AI" types in and gets
// highlighted; an "AI" badge slams onto the card and the game's notes turn red.
// modes:
//   hook  (cold open: the card is already out and the magnifier on the line at frame 0; tag + badge land by ~1.6 s)
//   find  (beat-long: "A DAY LATER" pill on dayCue; on digCue the fan types and the file cards stream out of the game
//          into a row; on tagCue one card grows, the magnifier sweeps, the line types in; on explainCue an
//          explainer pill (`explain`) lands under the card; hook shows it only when `explain` is passed)
// params: mode, day ("A DAY LATER"), file ("MUSIC FILE · .ogg"), key ("comment:"), tag ("made with AI"),
//         explain ("Tool = an AI generator"), badge ("AI"), dayCue, digCue, tagCue, explainCue
// Library defaults are generic placeholders; pass the story's exact tag text and tool name.
// Fits: someone digs into a product's files and finds a hidden AI tag (metadata, watermark, model string).
// Generic game art only: no real game's characters, logo or music.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = info.helpers.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const RED = '#ff5e57';
  const hook = P.mode !== 'find';

  // ---- timeline
  const tDay = hook ? -1 : at(P.dayCue, 0.3) - 0.3;
  const tDig = hook ? -5 : at(P.digCue, D * 0.18) - 0.1;
  const tTag = hook ? -0.4 : at(P.tagCue, D * 0.55) - 0.9;      // card grows + magnifier sweep starts
  const tType = hook ? 0.15 : tTag + 0.7;                         // the hidden line types in
  const tHi = hook ? 0.9 : at(P.tagCue, D * 0.55) + 0.25;         // highlight box
  const tBadge = hook ? 1.35 : tHi + 0.35;                        // AI badge slams
  const tExplain = hook ? 2.0 : at(P.explainCue, D * 0.85) - 0.4;
  const alarm = clamp((t - tBadge) / 0.5);

  ctx.save();
  if (hook) K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 490, y: 690 }, { t: 1.6, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.02, x: 487, y: 720 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: tTag, zoom: 1.0, x: 487, y: 725 }, { t: tTag + 1.2, zoom: 1.04, x: 487, y: 700 }, { t: D, zoom: 1.05, x: 487, y: 700 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true, plant: true });

  // ---- wall monitor with the generic neon game
  const MX0 = 160, MX1 = 820, MY0 = 440, MY1 = 790;
  K.glow(ctx, (MX0 + MX1) / 2, (MY0 + MY1) / 2, 420, alarm > 0 ? RED : '#ff6fb1', 0.18 + 0.1 * alarm);
  roundRect(ctx, MX0 - 16, MY0 - 16, MX1 - MX0 + 32, MY1 - MY0 + 32, 20); ctx.fillStyle = '#0d0f1d'; ctx.fill();
  neonGame(ctx, H, MX0, MY0, MX1 - MX0, MY1 - MY0, t, { alarm, notes: 1 });
  ctx.fillStyle = '#0d0f1d'; ctx.fillRect((MX0 + MX1) / 2 - 18, MY1 + 16, 36, 40); roundRect(ctx, (MX0 + MX1) / 2 - 90, MY1 + 52, 180, 14, 7); ctx.fill();

  // ---- desk, fan, laptop (bottom left)
  const FX = 250, FY = 1040;
  K.drawDesk(ctx, 330, FY, 1.05);
  K.drawLaptop(ctx, 400, FY - 116, 0.62, { t, screen: 'code', typing: !hook && t > tDig && t < tTag + 0.5 });
  const shocked = t > tBadge;
  K.drawPerson(ctx, FX, FY, 1.12, { t, pose: shocked ? 'point' : 'sit-laptop', mood: shocked ? 'shocked' : 'neutral', look: 0.7, typing: !hook && t > tDig && t < tTag ? 2 : 0, skin: 1, hair: 4, hairStyle: 'curly', shirt: 1, seed: 3, seat: !shocked });

  // ---- "a day later" pill
  if (!hook) {
    const dp = K.popIn(t, tDay, 0.4), dOut = clamp((t - tTag) / 0.3);
    if (dp > 0 && dOut < 1) { ctx.save(); ctx.globalAlpha = 1 - dOut; K.drawLabel(ctx, 487, 500, dp, { text: String(P.day || 'A DAY LATER'), size: 30, accent: true }); ctx.restore(); }
  }

  // ---- stream of small file cards out of the monitor into a row (find mode)
  if (!hook && t > tDig) {
    const n = 7;
    for (let i = 0; i < n; i++) {
      const k = clamp((t - tDig - i * 0.22) / 0.6);
      if (k <= 0) continue;
      const e = H.easeOutCubic(k);
      const x1 = 560 + (i % 4) * 82, y1 = 860 + Math.floor(i / 4) * 92;
      const x = lerp(490, x1, e), y = lerp(640, y1, e) - Math.sin(e * Math.PI) * 120;
      const fade = i === 2 ? clamp(1 - (t - tTag) / 0.2) : 1; // card #3 becomes the big one
      if (fade <= 0) continue;
      ctx.save(); ctx.globalAlpha = fade; miniFile(ctx, H, x, y, 0.8 + 0.2 * e, ACC); ctx.restore();
    }
  }

  // ---- the big file card
  const grow = hook ? 1 : clamp((t - tTag) / 0.55);
  if (grow > 0) {
    const e = H.easeOutBack ? H.easeOutBack(grow) : H.easeOutCubic(grow);
    const CX = lerp(hook ? 487 : 724, 487, H.easeOutCubic(grow)), CY = lerp(hook ? 690 : 860, 690, H.easeOutCubic(grow));
    const W = 650, Hh = 300;
    const sc = lerp(0.2, 1, Math.min(1.04, e));
    const shake = t > tBadge && t < tBadge + 0.35 ? Math.sin(t * 90) * 6 * (1 - (t - tBadge) / 0.35) : 0;
    ctx.save(); ctx.translate(CX + shake, CY); ctx.scale(sc, sc);
    const X0 = -W / 2, Y0 = -Hh / 2;
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
    roundRect(ctx, X0, Y0, W, Hh, 24); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    ctx.shadowColor = 'transparent';
    // header: note icon + file label
    roundRect(ctx, X0, Y0, W, 64, 24); ctx.fillStyle = '#dfe4f1'; ctx.fill(); ctx.fillRect(X0, Y0 + 40, W, 24);
    note(ctx, X0 + 44, Y0 + 46, 0.75, '#3b4672');
    ctx.font = H.font('ui', 26); ctx.letterSpacing = '2px'; ctx.fillStyle = '#3b4672'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(String(P.file || 'MUSIC FILE · .ogg').toUpperCase(), X0 + 80, Y0 + 33); ctx.letterSpacing = '0px';
    // waveform
    for (let i = 0; i < 44; i++) {
      const a = 0.25 + 0.75 * Math.abs(Math.sin(i * 0.7 + t * 6) * H.hash(i, 3));
      const bx = X0 + 34 + i * 13.5, bh = 8 + 46 * a;
      roundRect(ctx, bx, Y0 + 112 - bh / 2, 7, bh, 3.5); ctx.fillStyle = alarm > 0 ? H.mixHex('#7d89b8', RED, alarm) : '#7d89b8'; ctx.fill();
    }
    // metadata rows: two greyed rows + the hidden line
    ctx.fillStyle = '#c3c9db';
    roundRect(ctx, X0 + 34, Y0 + 160, 120, 16, 8); ctx.fill(); roundRect(ctx, X0 + 170, Y0 + 160, 260, 16, 8); ctx.fill();
    const key = String(P.key || 'comment:'), tag = String(P.tag || 'made with AI');
    ctx.font = H.font('ui', 34); ctx.textBaseline = 'alphabetic';
    const ky = Y0 + 240, kx = X0 + 34;
    const keyShown = K.typewriter(key, t, 26, tType - 0.05);
    ctx.fillStyle = '#5b6488'; ctx.fillText(keyShown, kx, ky);
    const kw = ctx.measureText(key + ' ').width;
    ctx.font = H.font('display', 38);
    const tagShown = K.typewriter(tag, t, 22, tType + key.length / 26);
    const tw = ctx.measureText(tag).width;
    const hi = clamp((t - tHi) / 0.3);
    if (hi > 0) { roundRect(ctx, kx + kw - 12, ky - 42, (tw + 24) * hi, 58, 12); ctx.fillStyle = rgba(ACC, 0.9); ctx.fill(); }
    ctx.fillStyle = '#141829'; ctx.fillText(tagShown, kx + kw, ky);
    // caret while typing
    if (tagShown.length < tag.length && t > tType && Math.floor(t * 4) % 2 === 0) { ctx.fillRect(kx + kw + ctx.measureText(tagShown).width + 4, ky - 34, 4, 40); }
    ctx.restore();

    // magnifier sweeping the metadata line
    const sweepA = hook ? -0.2 : tTag + 0.4, sweepB = tHi + 0.2;
    const mu = clamp((t - sweepA) / Math.max(0.3, sweepB - sweepA));
    const mOut = clamp((t - tBadge - 0.1) / 0.3);
    if (mOut < 1 && grow > 0.6) {
      const mx = lerp(CX - 240, CX + 150, H.easeInOutCubic(mu)), my = CY + 70 + Math.sin(t * 5) * 4;
      ctx.save(); ctx.globalAlpha = 1 - mOut; magnifier(ctx, mx, my, 1); ctx.restore();
    }
    // AI badge slams on the corner
    const bk = clamp((t - tBadge) / 0.45);
    if (bk > 0) {
      const s = 1 + 1.4 * Math.pow(1 - H.easeOutCubic(Math.min(1, bk / 0.7)), 2);
      const bx = CX + 270, by = CY - 150;
      ctx.save(); ctx.translate(bx, by); ctx.scale(s, s); ctx.rotate(-0.18); ctx.globalAlpha = clamp(bk / 0.25);
      if (bk > 0.5) K.glow(ctx, 0, 0, 160, RED, 0.35);
      ctx.beginPath(); ctx.arc(0, 0, 66, 0, Math.PI * 2); ctx.fillStyle = RED; ctx.fill();
      ctx.lineWidth = 6; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 54, 0, Math.PI * 2); ctx.stroke();
      ctx.font = H.font('display', 54); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(P.badge || 'AI'), 0, 3);
      ctx.restore();
      // burst lines
      if (bk < 1) {
        ctx.save(); ctx.strokeStyle = rgba(RED, 1 - bk); ctx.lineWidth = 5;
        for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, r0 = 80 + 60 * bk, r1 = r0 + 30; ctx.beginPath(); ctx.moveTo(bx + Math.cos(a) * r0, by + Math.sin(a) * r0); ctx.lineTo(bx + Math.cos(a) * r1, by + Math.sin(a) * r1); ctx.stroke(); }
        ctx.restore();
      }
    }
  }

  // ---- explainer pill (what the tagged tool is)
  const sp = K.popIn(t, tExplain, 0.45);
  if (sp > 0 && (!hook || P.explain)) K.drawLabel(ctx, 487, 920, sp, { text: String(P.explain || 'Tool = an AI generator'), size: 30, dot: true });
  ctx.restore();
}

// ---------- helpers (shared look with review-crash.js; duplicated because scene modules are served standalone)
function note(ctx, x, y, s, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.strokeStyle = col;
  ctx.beginPath(); ctx.ellipse(0, 0, 13, 10, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(11, -3); ctx.lineTo(11, -44); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(11, -44); ctx.quadraticCurveTo(30, -36, 26, -18); ctx.quadraticCurveTo(24, -30, 11, -32); ctx.fill();
  ctx.restore();
}
function miniFile(ctx, H, x, y, s, acc) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  H.roundRect(ctx, -34, -42, 68, 84, 10); ctx.fillStyle = '#f4f6fb'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(14, -42); ctx.lineTo(34, -22); ctx.lineTo(14, -22); ctx.closePath(); ctx.fillStyle = '#c3c9db'; ctx.fill();
  note(ctx, -4, 22, 0.75, '#3b4672');
  ctx.restore();
}
function magnifier(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 18; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(46, 46); ctx.lineTo(96, 96); ctx.stroke();
  ctx.lineWidth = 12; ctx.strokeStyle = '#8a93a8'; ctx.beginPath(); ctx.arc(0, 0, 62, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(200,230,255,0.18)'; ctx.beginPath(); ctx.arc(0, 0, 56, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 42, -2.4, -1.6); ctx.stroke();
  ctx.restore();
}
// Generic neon "crime city" driving game in rect (x, y, w, h). o.alarm 0..1 tints it red; o.notes 0..1 music notes.
export function neonGame(ctx, H, x, y, w, h, t, o = {}) {
  const { roundRect, rgba, mixHex } = H, alarm = o.alarm || 0, fr = (v) => v - Math.floor(v);
  ctx.save(); roundRect(ctx, x, y, w, h, 10); ctx.clip();
  const hy = y + h * 0.58;
  const g = ctx.createLinearGradient(0, y, 0, hy);
  g.addColorStop(0, '#2a1858'); g.addColorStop(0.6, '#c2448f'); g.addColorStop(1, '#ffad66');
  ctx.fillStyle = g; ctx.fillRect(x, y, w, hy - y);
  // striped sun
  const sx = x + w * 0.5, sr = h * 0.25;
  const sg = ctx.createLinearGradient(0, hy - sr * 1.6, 0, hy);
  sg.addColorStop(0, '#ffe36b'); sg.addColorStop(1, '#ff5fa2');
  ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sx, hy - sr * 0.25, sr, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#c2448f'; for (let i = 0; i < 4; i++) ctx.fillRect(sx - sr, hy - sr * 0.25 - 8 - i * 16, sr * 2, 3 + i * 0.8);
  // skyline
  ctx.fillStyle = '#2a1650';
  for (let i = 0; i < 14; i++) { const bw = w / 14, bh = h * (0.08 + 0.22 * H.hash(i, 11)); ctx.fillRect(x + i * bw, hy - bh, bw - 4, bh); }
  ctx.fillStyle = 'rgba(255,220,140,0.7)';
  for (let i = 0; i < 14; i++) for (let r = 0; r < 3; r++) if (H.hash(i * 7 + r, 12) > 0.6) ctx.fillRect(x + i * (w / 14) + 8, hy - 14 - r * 16, 6, 7);
  // ground + neon grid
  ctx.fillStyle = '#1a0f33'; ctx.fillRect(x, hy, w, y + h - hy);
  ctx.strokeStyle = 'rgba(255,79,216,0.55)'; ctx.lineWidth = 2;
  for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(sx + i * 12, hy); ctx.lineTo(sx + i * w * 0.16, y + h); ctx.stroke(); }
  for (let i = 0; i < 6; i++) { const u = fr(i / 6 + t * 0.6), yy = hy + (y + h - hy) * u * u; ctx.globalAlpha = 0.3 + 0.7 * u; ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); }
  ctx.globalAlpha = 1;
  // road
  ctx.beginPath(); ctx.moveTo(sx - 14, hy); ctx.lineTo(sx + 14, hy); ctx.lineTo(sx + w * 0.3, y + h); ctx.lineTo(sx - w * 0.3, y + h); ctx.closePath(); ctx.fillStyle = '#2b2245'; ctx.fill();
  for (let i = 0; i < 5; i++) { const u = fr(i / 5 + t * 0.9), yy = hy + (y + h - hy) * u * u, ww = 2 + 9 * u * u; ctx.fillStyle = '#ffe36b'; ctx.fillRect(sx - ww / 2, yy, ww, 3 + 22 * u * u); }
  // palms (sway)
  const palm = (px, py, sc, side) => {
    const sw = Math.sin(t * 1.5 + px) * 0.06;
    ctx.save(); ctx.translate(px, py); ctx.scale(sc, sc); ctx.rotate(sw * side);
    ctx.strokeStyle = '#1a0f33'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(10 * side, -60, 4 * side, -120); ctx.stroke();
    ctx.fillStyle = '#1a0f33';
    for (let k = 0; k < 6; k++) { ctx.save(); ctx.translate(4 * side, -120); ctx.rotate(-Math.PI + k * (Math.PI / 5) + sw); ctx.beginPath(); ctx.ellipse(34, 0, 38, 8, 0.25, 0, Math.PI * 2); ctx.fill(); ctx.restore(); }
    ctx.restore();
  };
  palm(x + w * 0.1, y + h * 0.95, h / 300, 1); palm(x + w * 0.22, y + h * 0.78, h / 520, 1);
  palm(x + w * 0.9, y + h * 0.95, h / 300, -1); palm(x + w * 0.78, y + h * 0.78, h / 520, -1);
  // the car (from behind), bobbing
  const cy = y + h * 0.9 + Math.sin(t * 9) * 2, cw = w * 0.2;
  ctx.fillStyle = '#ff3d9a'; roundRect(ctx, sx - cw / 2, cy - cw * 0.34, cw, cw * 0.3, 10); ctx.fill();
  ctx.fillStyle = '#ff7ac0'; roundRect(ctx, sx - cw * 0.32, cy - cw * 0.5, cw * 0.64, cw * 0.2, 10); ctx.fill();
  ctx.fillStyle = '#ffe36b'; roundRect(ctx, sx - cw * 0.44, cy - cw * 0.26, cw * 0.14, cw * 0.07, 3); ctx.fill(); roundRect(ctx, sx + cw * 0.3, cy - cw * 0.26, cw * 0.14, cw * 0.07, 3); ctx.fill();
  ctx.fillStyle = '#120a24'; roundRect(ctx, sx - cw * 0.46, cy - cw * 0.06, cw * 0.18, cw * 0.1, 4); ctx.fill(); roundRect(ctx, sx + cw * 0.28, cy - cw * 0.06, cw * 0.18, cw * 0.1, 4); ctx.fill();
  // music notes rising
  if (o.notes) {
    for (let i = 0; i < 6; i++) {
      const u = fr(i / 6 + t * 0.35), nx = sx + (H.hash(i, 21) - 0.5) * w * 0.7 + Math.sin(u * 6 + i) * 14, ny = y + h * 0.82 - u * h * 0.7;
      ctx.save(); ctx.globalAlpha = o.notes * Math.sin(u * Math.PI);
      note(ctx, nx, ny, 0.7 + 0.3 * H.hash(i, 22), alarm > 0.5 ? '#ff5e57' : '#ffffff');
      ctx.restore();
    }
  }
  if (alarm > 0) { ctx.fillStyle = rgba('#ff2a3a', 0.28 * alarm); ctx.fillRect(x, y, w, h); }
  // scanlines
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let yy = y; yy < y + h; yy += 6) ctx.fillRect(x, yy, w, 2);
  ctx.restore();
}
