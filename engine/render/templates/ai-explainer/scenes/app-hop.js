// Scene "app-hop" (full frame). Night room: a phone on a stand shows a generic music player with an accent label
// pill; a wall TV shows a generic video app (thumbnail grid, a big player). At the hop cue the label arcs from the
// phone to the TV player and lands with a pulse ("too" pill). At the unknown cue the room dims, a cartoon musician
// with a guitar steps in and shrugs, an "unknown" pill pops, then two question pills (e.g. "Recommended less?",
// "Paid less?") pop on their cues. Ends settled. Generic shapes only, no brands or logos.
// Fits: a label/feature spreading to another app, then open questions about its consequences.
// params: label ("AI label"), tvTag ("Main app too"), unknown ("YouTube hasn't said"), q1 ("Recommended less?"),
//         q2 ("Paid less?"); cues: hopCue (main), hasntCue (hasn't), recCue (recommended), paidCue (paid)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic, easeInOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tHop = at(P.hopCue || 'main', D * 0.17), tUnk = at(P.hasntCue || "hasn't", D * 0.45);
  const tQ1 = at(P.recCue || 'recommended', D * 0.7), tQ2 = at(P.paidCue || 'paid', D * 0.87);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 487, y: 640 }, { t: tUnk - 0.2, zoom: 1.02, x: 487, y: 680 }, { t: tUnk + 0.8, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.02, x: 487, y: 725 }]);
  const room = K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true, plant: true });
  void room;

  // phone on a little stand (left)
  const px = 220, py = 450, pw = 200, ph = 360;
  H.roundRect(ctx, px - 50, py + ph - 10, 100, 40, 10); ctx.fillStyle = '#3b4260'; ctx.fill();
  H.roundRect(ctx, px - pw / 2, py, pw, ph, 30); ctx.fillStyle = '#2a2f45'; ctx.fill();
  H.roundRect(ctx, px - pw / 2 + 10, py + 10, pw - 20, ph - 20, 22); ctx.fillStyle = '#121527'; ctx.fill();
  const g = ctx.createLinearGradient(px - 70, py + 40, px + 70, py + 180); g.addColorStop(0, '#6f4fd0'); g.addColorStop(1, '#e8786a');
  H.roundRect(ctx, px - 70, py + 40, 140, 140, 14); ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ctx.arc(px + 20, py + 95, 32 + 3 * Math.sin(t * 2), 0, Math.PI * 2); ctx.fillStyle = '#ffcc66'; ctx.fill();
  for (let k = 0; k < 12; k++) { const h = 6 + 18 * Math.abs(Math.sin(k * 1.7 + t * 4)); H.roundRect(ctx, px - 70 + k * 12, py + 250 - h / 2, 6, h, 3); ctx.fillStyle = k < 5 ? ACC : 'rgba(255,255,255,0.35)'; ctx.fill(); }
  ctx.beginPath(); ctx.arc(px, py + 305, 22, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.fillStyle = '#121527'; ctx.fillRect(px - 8, py + 296, 6, 18); ctx.fillRect(px + 2, py + 296, 6, 18);
  // label stays on the phone (a ghost copy hops to the TV)
  K.drawLabel(ctx, px, py + 222, 0.85, { text: P.label || 'AI label', size: 22, accent: true });

  // wall TV (right) with a generic video app
  const tx = 640, ty = 430, tw = 470, th = 300;
  K.shadow(ctx, tx, ty + th + 60, 220, 0.2);
  H.roundRect(ctx, tx - 14, ty + th, 28, 40, 4); ctx.fillStyle = '#2a2f45'; ctx.fill();
  H.roundRect(ctx, tx - 90, ty + th + 36, 180, 14, 7); ctx.fill();
  H.roundRect(ctx, tx - tw / 2, ty, tw, th, 18); ctx.fillStyle = '#1c2033'; ctx.fill();
  H.roundRect(ctx, tx - tw / 2 + 12, ty + 12, tw - 24, th - 24, 10); ctx.fillStyle = '#0f1222'; ctx.fill();
  // big player area
  const vx = tx - tw / 2 + 28, vy = ty + 28, vw = 270, vh = 160;
  const vg = ctx.createLinearGradient(vx, vy, vx + vw, vy + vh); vg.addColorStop(0, '#2b6c8f'); vg.addColorStop(1, '#4fb3a6');
  H.roundRect(ctx, vx, vy, vw, vh, 10); ctx.fillStyle = vg; ctx.fill();
  ctx.beginPath(); ctx.arc(vx + vw / 2, vy + vh / 2, 30, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fill();
  ctx.fillStyle = '#0f1222'; ctx.beginPath(); ctx.moveTo(vx + vw / 2 - 9, vy + vh / 2 - 14); ctx.lineTo(vx + vw / 2 + 15, vy + vh / 2); ctx.lineTo(vx + vw / 2 - 9, vy + vh / 2 + 14); ctx.closePath(); ctx.fill();
  H.roundRect(ctx, vx, vy + vh + 14, 200, 14, 7); ctx.fillStyle = '#dfe4f1'; ctx.fill();
  H.roundRect(ctx, vx, vy + vh + 38, 130, 12, 6); ctx.fillStyle = 'rgba(223,228,241,0.4)'; ctx.fill();
  // thumbnail column
  for (let k = 0; k < 3; k++) {
    const yy = ty + 30 + k * 82;
    H.roundRect(ctx, tx + tw / 2 - 150, yy, 120, 66, 8); ctx.fillStyle = ['#a08be0', '#e8786a', '#6f86e0'][k]; ctx.fill();
  }
  // hop: label arcs phone -> TV player
  const hu = clamp((t - tHop) / 0.9);
  const lx0 = px, ly0 = py + 222, lx1 = vx + vw / 2, ly1 = vy + vh - 12;
  if (hu > 0) {
    const e = easeInOutCubic(hu);
    const lx = lerp(lx0, lx1, e), ly = lerp(ly0, ly1, e) - Math.sin(hu * Math.PI) * 170;
    if (hu >= 1) K.glow(ctx, lx1, ly1 - 18, 90, ACC, 0.3 + 0.1 * Math.sin(t * 5));
    const land = hu >= 1 ? 1 + 0.12 * Math.max(0, 1 - (t - tHop - 0.9) / 0.4) : 0.85 + 0.15 * e;
    K.drawLabel(ctx, lx, ly, land, { text: P.label || 'AI label', size: 22, accent: true });
    // trail
    if (hu < 1) { ctx.save(); ctx.strokeStyle = H.rgba(ACC, 0.6); ctx.setLineDash([10, 10]); ctx.lineWidth = 4; ctx.beginPath();
      for (let k = 0; k <= 20; k++) { const u = (k / 20) * hu, ee = easeInOutCubic(u); const x = lerp(lx0, lx1, ee), y = lerp(ly0, ly1, ee) - Math.sin(u * Math.PI) * 170 - 20; if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y); }
      ctx.stroke(); ctx.restore(); }
  }
  const tp = K.popIn(t, tHop + 0.9, 0.4);
  if (tp > 0) K.drawLabel(ctx, tx, ty - 12, Math.min(1, tp), { text: P.tvTag || 'Main app too', size: 26, dot: true });

  // dim for the caveat
  const dim = smooth((t - tUnk + 0.2) / 0.5);
  if (dim > 0) { ctx.fillStyle = 'rgba(5,7,16,' + (0.5 * dim) + ')'; ctx.fillRect(0, 0, 1080, 1920); }

  // musician steps in (walks from the right), then shrugs
  const wu = easeOutCubic(clamp((t - (tUnk - 0.6)) / 1.0));
  if (wu > 0) {
    const mx = lerp(1160, 487, wu), walking = wu < 1;
    const shrug = t > tQ1 - 0.2;
    K.drawPerson(ctx, mx, 1045, 1.05, { t, pose: shrug ? 'shrug' : 'stand', walk: walking ? t : undefined, mood: shrug ? 'worried' : 'neutral', skin: 4, hair: 0, hairStyle: 'curly', shirt: '#a08be0', flip: walking, seed: 11 });
    // guitar on the back (simple body + neck), behind the arms is fine
    ctx.save(); ctx.translate(mx + 36, 1045 - 126); ctx.rotate(0.5);
    ctx.fillStyle = '#9a6a46'; ctx.beginPath(); ctx.ellipse(0, 22, 24, 30, 0, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.ellipse(0, -8, 18, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#2a211e'; ctx.beginPath(); ctx.arc(0, 10, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#5b3b25'; ctx.fillRect(-4, -78, 8, 64); ctx.fillRect(-7, -90, 14, 16);
    ctx.restore();
  }
  // caveat pills
  const up = K.popIn(t, tUnk + 0.1, 0.45);
  if (up > 0) K.drawLabel(ctx, 487, 790, Math.min(1, up), { text: P.unknown || "YouTube hasn't said", size: 30, accent: true });
  const q = (tt, x, text) => { const p = K.popIn(t, tt - 0.1, 0.45); if (p > 0) K.drawSpeechBubble(ctx, x, 955, Math.min(1, p), { text, size: 30, maxW: 260, tail: x < 487 ? 'right' : 'left', dark: true, pop: Math.min(1, p) }); };
  q(tQ1, 395, P.q1 || 'Recommended less?');
  q(tQ2, 585, P.q2 || 'Paid less?');
  ctx.restore();
}
