// Scene "weak-login" (full frame, 1 beat). Night room: a cartoon person at a desk, a big login card floats above.
// The password field types a short, guessable password; a strength meter fills only a sliver and turns red ("WEAK");
// then a "2-step login" toggle row pops in, switched OFF; finally the card's padlock springs open and a red stamp
// lands. Metaphor only: no techniques, no real sites, no logos.
// Fits: "attacks used weak passwords / no two-factor", account hygiene, "it wasn't fancy".
// params (all optional): head ("Not fancy at all"), title ("Sign in"), typed ("123456"), weak ("WEAK"),
//        twoStep ("2-step login"), off ("OFF"), stamp ("EXPLOITED")
//        cues: headCue, passCue, twoCue, stampCue (narration words, "word#n" = (n+1)th time; else fractions)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent, RED = '#ff6b5e';
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tHead = at(P.headCue, D * 0.12), tPass = at(P.passCue, D * 0.35), tTwo = at(P.twoCue, D * 0.55), tStamp = at(P.stampCue, D * 0.82);
  const feet = 1060, cx = 560, cy = 650;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tStamp, zoom: 1.05, x: cx, y: 700 }, { t: D, zoom: 1.06, x: cx, y: 700 }]);
  K.world.room(ctx, { t, time: 'night', window: true, picture: false, lamp: true, plant: true, floorY: 960 });

  // desk + laptop + person
  H.roundRect(ctx, 520, 930, 340, 26, 8); ctx.fillStyle = '#6a5440'; ctx.fill();
  ctx.fillStyle = '#4e3d2e'; ctx.fillRect(545, 956, 18, 104); ctx.fillRect(817, 956, 18, 104);
  H.roundRect(ctx, 610, 860, 150, 72, 8); ctx.fillStyle = '#2a2f48'; ctx.fill();
  K.glow(ctx, 685, 896, 70, ACC, 0.25 + 0.1 * Math.sin(t * 3));
  const shocked = t > tStamp;
  K.drawPerson(ctx, 215, feet, 1.45, { t, pose: t > tPass && t < tTwo ? 'point' : 'stand', mood: shocked ? 'shocked' : (t > tPass ? 'neutral' : 'happy'), skin: 3, hair: 1, hairStyle: 'short', shirt: 5, seed: 11 });

  // login card
  const k = K.popIn(t, 0, 0.5);
  const shake = t > tStamp && t < tStamp + 0.4 ? Math.sin(t * 80) * 6 * (1 - (t - tStamp) / 0.4) : 0;
  ctx.save(); ctx.translate(cx + shake, cy); ctx.scale(k, k);
  const W = 560, Hh = 500;
  H.roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 30); ctx.fillStyle = '#f4f6fb'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = t > tStamp ? RED : '#c9cfe0'; H.roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 30); ctx.stroke();
  ctx.fillStyle = '#141826'; ctx.font = K.font.display(46); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(P.title || 'Sign in', -W / 2 + 40, -Hh / 2 + 62);
  // padlock top right: closed, then springs open on stamp
  K.drawLock(ctx, W / 2 - 70, -Hh / 2 + 62, 0.6, { open: K.phase(t, tStamp - 0.1, tStamp + 0.3) });

  // password field
  const fy = -Hh / 2 + 150;
  H.roundRect(ctx, -W / 2 + 40, fy, W - 80, 84, 16); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = t > tPass ? ACC : '#c9cfe0'; H.roundRect(ctx, -W / 2 + 40, fy, W - 80, 84, 16); ctx.stroke();
  ctx.fillStyle = '#7a8099'; ctx.font = K.font.body ? K.font.body(26) : K.font.display(26);
  ctx.fillText('Password', -W / 2 + 60, fy - 22);
  const typed = P.typed || '123456';
  const n = Math.floor(clamp((t - (tPass - 0.6)) / 0.12, 0, typed.length));
  ctx.fillStyle = '#141826'; ctx.font = K.font.display(48);
  ctx.fillText(typed.slice(0, n) + ((Math.floor(t * 2.5) % 2 && n < typed.length) ? '|' : ''), -W / 2 + 66, fy + 44);

  // strength meter
  const my = fy + 120, mw = W - 80;
  H.roundRect(ctx, -W / 2 + 40, my, mw, 26, 13); ctx.fillStyle = '#e2e6f0'; ctx.fill();
  const fill = 0.14 * K.phase(t, tPass + 0.2, tPass + 0.8);
  if (fill > 0) { H.roundRect(ctx, -W / 2 + 40, my, Math.max(26, mw * fill), 26, 13); ctx.fillStyle = RED; ctx.fill(); }
  if (t > tPass + 0.6) {
    const s = K.popIn(t, tPass + 0.6, 0.4);
    ctx.save(); ctx.translate(-W / 2 + 40 + mw * 0.14 + 90, my + 13); ctx.scale(s, s);
    ctx.fillStyle = RED; ctx.font = K.font.display(34); ctx.textAlign = 'left'; ctx.fillText(P.weak || 'WEAK', 0, 2); ctx.restore();
  }

  // 2-step row with a toggle that stays off
  if (t > tTwo - 0.1) {
    const s = K.popIn(t, tTwo - 0.1, 0.45);
    ctx.save(); ctx.translate(0, my + 110); ctx.scale(s, s);
    ctx.fillStyle = '#141826'; ctx.font = K.font.display(38); ctx.textAlign = 'left';
    ctx.fillText(P.twoStep || '2-step login', -W / 2 + 40, 0);
    const tx = W / 2 - 150;
    H.roundRect(ctx, tx, -30, 110, 60, 30); ctx.fillStyle = '#c3c8d6'; ctx.fill();
    const wob = t < tTwo + 1.2 ? Math.sin((t - tTwo) * 12) * 6 * (1 - (t - tTwo) / 1.2) : 0;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(tx + 30 + Math.max(0, wob), 0, 24, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = RED; ctx.font = K.font.display(30); ctx.textAlign = 'right'; ctx.fillText(P.off || 'OFF', tx - 18, 2);
    ctx.restore();
  }
  ctx.restore();

  // stamp
  if (t > tStamp - 0.05) {
    const s = K.popIn(t, tStamp - 0.05, 0.35);
    ctx.save(); ctx.translate(cx, cy - 40); ctx.rotate(-0.14); ctx.scale(1.6 - 0.6 * s, 1.6 - 0.6 * s); ctx.globalAlpha = clamp(s * 1.5, 0, 1);
    ctx.lineWidth = 9; ctx.strokeStyle = RED; H.roundRect(ctx, -250, -58, 500, 116, 18); ctx.stroke();
    ctx.fillStyle = RED; ctx.font = K.font.display(72); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.stamp || 'EXPLOITED', 0, 4); ctx.restore();
  }
  // header pill
  if (t > tHead - 0.1) K.drawLabel(ctx, 487, 300, K.popIn(t, tHead - 0.1, 0.4), { text: P.head || 'Not fancy at all', size: 32, accent: true });
  ctx.restore();
}
