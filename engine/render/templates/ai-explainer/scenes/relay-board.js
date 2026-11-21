// Scene "relay-board" (full frame, one beat). Who did what, as a chalk race map: a generic cartoon mathematician
// points at a chalkboard where a chalk route runs from START to a FINISH flag. On steerCue his token walks the route
// to a fork and picks the right branch (the wrong one gets a chalk cross; "steer" tag); on raceCue the robot's token
// zips ahead to the flag with a glowing trail while his lags ("race" tag); on quoteCue a verbatim quote panel with
// attribution lands at the bottom of the board; on timeCue a calendar pill pops (e.g. "~6 weeks"). The big kit
// robot cheers when its token finishes.
// Fits: "human + AI collaboration, who did which part" stories.
// params: ask, steer, race, quote, by, time, cues: steerCue, raceCue, quoteCue, timeCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, easeInOutCubic } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tSteer = at(P.steerCue, D * 0.25) - 0.4;
  const tRace = at(P.raceCue, D * 0.55) - 0.3;
  const tQuote = at(P.quoteCue, D * 0.5) - 0.1;
  const tTime = at(P.timeCue, D * 0.9) - 0.3;
  const feet = 1035;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 470, y: 700 }, { t: tRace, zoom: 1.04, x: 520, y: 690 }, { t: tRace + 1.6, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 490, y: 730 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 905 });

  const bx = 92, by = 430, bw = 800, bh = 450;
  H.roundRect(ctx, bx - 16, by - 16, bw + 32, bh + 32, 14); ctx.fillStyle = '#7a5235'; ctx.fill();
  H.roundRect(ctx, bx, by, bw, bh, 8); ctx.fillStyle = '#1d3a34'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.035)';
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(bx + 140 + i * 140, by + 110 + (i % 2) * 200, 90, 38, 0.3, 0, Math.PI * 2); ctx.fill(); }

  // route
  const start = [290, 690], fork = [455, 585];
  const pre = [start, [360, 640], [400, 600], fork];
  const wrong = [fork, [520, 650], [610, 690]];
  const right = [fork, [540, 520], [640, 560], [730, 505], [815, 530]];
  const chalk = (pts, a, w = 5, dash = [14, 12]) => { ctx.save(); ctx.strokeStyle = H.rgba('#eef2f8', a); ctx.lineWidth = w; ctx.setLineDash(dash); ctx.lineCap = 'round'; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.restore(); };
  chalk(pre, 0.5); chalk(wrong, 0.5); chalk(right, 0.5);
  // START / FINISH
  ctx.fillStyle = 'rgba(238,242,248,0.85)'; ctx.font = H.font('display', 24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('START', start[0], start[1] + 38);
  // finish flag
  const fl = right[right.length - 1];
  ctx.save(); ctx.translate(fl[0] + 8, fl[1]);
  ctx.strokeStyle = '#eef2f8'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, -82); ctx.stroke();
  const wv = Math.sin(t * 6) * 4;
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
    ctx.fillStyle = (r + c) % 2 ? '#eef2f8' : '#1c2033';
    ctx.beginPath(); const x0 = c * 15, y0 = -82 + r * 13 + Math.sin(c * 0.9 + t * 6) * 2;
    ctx.rect(x0, y0 + (c ? wv * c / 4 : 0), 15, 13); ctx.fill();
  }
  ctx.restore();

  // human steering: chalk arrow along pre + the right branch's first leg; cross on the wrong branch
  const steerU = smooth((t - tSteer) / 1.4);
  if (steerU > 0) {
    ctx.save(); ctx.strokeStyle = H.rgba('#ffffff', 0.95); ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.setLineDash([]);
    K.pathDraw(ctx, pre.concat([right[1]]), steerU); ctx.restore();
    const ck = K.popIn(t, tSteer + 0.9, 0.35);
    if (ck > 0) { ctx.save(); ctx.translate(560, 672); ctx.scale(ck, ck); ctx.strokeStyle = '#ff6b5e'; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-20, -20); ctx.lineTo(20, 20); ctx.moveTo(20, -20); ctx.lineTo(-20, 20); ctx.stroke(); ctx.restore(); }
  }
  // tokens
  const humanPath = pre.concat([right[1], right[2]]);
  const hu = steerU * 0.8 + 0.2 * smooth((t - tRace) / 4);
  const hp = K.pathPoint(humanPath, clamp(hu));
  const raceU = easeInOutCubic(clamp((t - tRace) / 1.1));
  const robotPath = right.slice(1);
  const rp = raceU > 0 ? K.pathPoint(robotPath, raceU) : (steerU >= 1 ? right[1] : null);
  if (raceU > 0) {
    ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.shadowColor = ACC; ctx.shadowBlur = 16;
    K.pathDraw(ctx, robotPath, raceU); ctx.restore();
  }
  // human token: a small head
  ctx.save(); ctx.translate(hp[0], hp[1] - 6);
  ctx.beginPath(); ctx.arc(0, 0, 21, 0, Math.PI * 2); ctx.fillStyle = '#e9b48c'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff'; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -6, 19, Math.PI * 1.05, Math.PI * 1.95); ctx.fillStyle = '#3b2a20'; ctx.fill();
  ctx.fillStyle = '#1c2033'; ctx.beginPath(); ctx.arc(-6, 2, 2.6, 0, 7); ctx.arc(6, 2, 2.6, 0, 7); ctx.fill();
  ctx.restore();
  // robot token: a small robot head with lime eyes
  if (rp) {
    ctx.save(); ctx.translate(rp[0], rp[1] - 34 + (raceU > 0 && raceU < 1 ? Math.sin(t * 30) * 2 : 0));
    H.roundRect(ctx, -26, -18, 52, 36, 12); ctx.fillStyle = '#e8ebf3'; ctx.fill();
    H.roundRect(ctx, -19, -11, 38, 22, 8); ctx.fillStyle = '#1c2033'; ctx.fill();
    ctx.fillStyle = ACC; H.roundRect(ctx, -12, -6, 7, 12, 3); ctx.fill(); H.roundRect(ctx, 5, -6, 7, 12, 3); ctx.fill();
    ctx.restore();
  }
  // tags
  const sk = K.popIn(t, tSteer + 1.0, 0.4);
  if (sk > 0) pill(H, ctx, 330, 528, sk, String(P.steer || 'Human steered'), ACC, false, 28);
  const rk = K.popIn(t, tRace + 0.9, 0.4);
  if (rk > 0) pill(H, ctx, 700, 610, rk, String(P.race || 'AI raced ahead'), ACC, true, 28);
  const ak = K.popIn(t, 0.1, 0.4) * (1 - smooth((t - tSteer - 0.6) / 0.35));
  if (ak > 0.01) pill(H, ctx, 540, 470, ak, String(P.ask || 'Who did what?'), ACC, false, 30);
  // finish burst
  if (raceU >= 1) {
    const u = clamp((t - tRace - 1.1) / 0.6);
    if (u < 1) { ctx.save(); ctx.strokeStyle = H.rgba(ACC, 1 - u); ctx.lineWidth = 5; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; ctx.beginPath(); ctx.moveTo(fl[0] + Math.cos(a) * (30 + 40 * u), fl[1] - 40 + Math.sin(a) * (30 + 40 * u)); ctx.lineTo(fl[0] + Math.cos(a) * (50 + 50 * u), fl[1] - 40 + Math.sin(a) * (50 + 50 * u)); ctx.stroke(); } ctx.restore(); }
  }

  // quote panel at the bottom of the board
  const qk = K.popIn(t, tQuote, 0.45);
  if (qk > 0) {
    ctx.save(); ctx.translate(522, 792); ctx.scale(Math.min(1.04, qk), Math.min(1.04, qk));
    const w = 480, h = 150;
    H.roundRect(ctx, -w / 2, -h / 2, w, h, 18); ctx.fillStyle = 'rgba(10,12,24,0.95)'; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = H.rgba(ACC, 0.8); ctx.stroke();
    ctx.fillStyle = ACC; ctx.font = H.font('display', 64); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('“', -w / 2 + 16, -h / 2 + 34);
    const q = String(P.quote || 'Quote goes here');
    const lines = H.wrap(ctx, q, 'bold', 29, w - 90);
    ctx.font = H.font('bold', 29); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
    lines.slice(0, 2).forEach((ln, i) => ctx.fillText(ln, 14, -30 + i * 38 - (lines.length > 1 ? 0 : -18)));
    ctx.font = H.font('ui', 22); ctx.fillStyle = ACC; ctx.fillText('— ' + String(P.by || 'the author'), 14, 50);
    ctx.restore();
  }

  // characters
  const pointing = t < tRace + 0.6;
  K.drawPerson(ctx, 165, feet, 1.38, { t, pose: pointing ? 'point' : 'shrug', mood: t > tRace + 0.6 ? 'shocked' : 'neutral', skin: 2, hair: 1, shirt: 2, hairStyle: 'short', talk: 0, seed: 5 });
  const done = t > tRace + 1.1;
  K.drawRobot(ctx, 838, feet, 1.15, { t, state: done ? 'happy' : 'idle', flip: true, seed: 4 });
  ctx.restore();

  // calendar pill (screen space)
  const ck2 = K.popIn(t, tTime, 0.45);
  if (ck2 > 0) calendar(H, ctx, 487, 975, ck2, String(P.time || 'TIME'), ACC, t - tTime);
}

function calendar(H, ctx, x, y, k, text, ACC, age) {
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  ctx.font = H.font('display', 34); const tw = ctx.measureText(text).width;
  const w = tw + 120, h = 74;
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = ACC; ctx.fill();
  // tiny calendar icon with flipping page
  const ix = -w / 2 + 48;
  H.roundRect(ctx, ix - 22, -22, 44, 44, 7); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.fillStyle = '#ff6b5e'; ctx.fillRect(ix - 22, -22, 44, 12);
  const fp = (age * 3) % 1; if (age < 1.5) { ctx.save(); ctx.translate(ix, -10); ctx.scale(1, Math.cos(fp * Math.PI)); ctx.fillStyle = '#e6e8ef'; ctx.fillRect(-22, 0, 44, 32); ctx.restore(); }
  ctx.fillStyle = '#14160a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 30, 2);
  ctx.restore();
}

function pill(H, ctx, x, y, k, text, ACC, solid, size = 32) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  const f = H.fitText(ctx, text, 'ui', size, 18, 420); ctx.font = f.font;
  const w = ctx.measureText(f.text).width + 52, h = size * 1.8;
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = solid ? ACC : 'rgba(10,12,24,0.92)'; ctx.fill();
  if (!solid) { ctx.lineWidth = 2.5; ctx.strokeStyle = ACC; ctx.stroke(); }
  ctx.fillStyle = solid ? '#14160a' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
  ctx.restore();
}
