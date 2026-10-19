// Scene "deepfake-wire" (full frame, 1 beat, ~8-10 s). Night office: a finance worker at a desk is on a video call
// with three "coworkers" on a big floating call window. A case pill and a place pill pop; on the wire cue bills
// stream from the laptop out of frame and an amount pill counts up; on the call cue the coworker tiles glitch and
// each gets a red FAKE tag while the worker turns shocked.
// Fits: deepfake video-call scams, CEO-fraud, impersonation stories. People are generic cartoons; no company named.
// params: caseLabel ("Real case"), place ("City"), tiles (["Coworker", "Coworker", "Coworker"]),
//         prefix ("about $"), value (1.5, shown with 1 decimal), unit ("M"), fake ("FAKE"),
//         cues (optional; else fractions): caseCue, placeCue, wireCue, amountCue, callCue, fakeCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, roundRect, rgba } = H;
  const at = (w, d, n) => { const v = w ? info.timeOf(w, n || 0) : null; return v == null ? d : v; };
  const tCase = at(P.caseCue, D * 0.08) - 0.2;
  const tPlace = at(P.placeCue, D * 0.2);
  const tWire = at(P.wireCue, D * 0.43) - 0.1;
  const tAmt = at(P.amountCue, D * 0.5);
  const tCall = at(P.callCue, D * 0.8) - 0.1;
  const tFake = at(P.fakeCue, D * 0.9) - 0.1;
  const danger = '#ff6b5e';

  K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 487, y: 740 }, { t: tWire, zoom: 1.0 }, { t: tCall, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 700 }]);
  K.world.office(ctx, { t, time: 'night' });
  const feet = 1035;

  // ---- floating call window ----
  const W = { x: 80, y: 432, w: 815, h: 268 };
  const kw = smooth(t / 0.4);
  ctx.save(); ctx.globalAlpha = kw;
  roundRect(ctx, W.x, W.y, W.w, W.h, 20); ctx.fillStyle = '#1c2033'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(W.x + 3, W.y + 3, W.w - 6, 40);
  ctx.beginPath(); ctx.arc(W.x + 26, W.y + 23, 8, 0, Math.PI * 2); ctx.fillStyle = rgba(danger, 0.6 + 0.4 * Math.sin(t * 5)); ctx.fill();
  ctx.font = H.font('ui', 24); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('Video call · 4 people', W.x + 44, W.y + 24);
  const names = P.tiles || ['Coworker', 'Coworker', 'Coworker'];
  const looks = [{ skin: 1, hair: 0, hairStyle: 'short', shirt: '#2b3a67' }, { skin: 3, hair: 2, hairStyle: 'bun', shirt: '#6a3d5a' }, { skin: 0, hair: 4, hairStyle: 'curly', shirt: '#2f5d55' }];
  const tw = (W.w - 40) / 3;
  for (let i = 0; i < 3; i++) {
    const T = { x: W.x + 10 + i * (tw + 10), y: W.y + 52, w: tw, h: W.h - 62 };
    const speaking = Math.floor(t / 1.6) % 3 === i;
    const g = t > tCall ? clamp((t - tCall - i * 0.15) / 0.3) * (0.6 + 0.4 * Math.sin(t * 9 + i)) : 0;
    tile(ctx, H, K, T, Object.assign({ t, pose: 'stand', mood: 'happy', talk: speaking ? clamp(info.env * 1.1) * 0.8 : 0, seed: 11 + i }, looks[i]), g, t);
    if (speaking && t < tCall) { ctx.lineWidth = 4; ctx.strokeStyle = ACC; roundRect(ctx, T.x, T.y, T.w, T.h, 10); ctx.stroke(); }
    // name tag
    ctx.font = H.font('ui', 24);
    const nw = ctx.measureText(names[i]).width + 24;
    roundRect(ctx, T.x + 8, T.y + T.h - 42, nw, 34, 8); ctx.fillStyle = 'rgba(8,10,20,0.8)'; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.fillText(names[i], T.x + 20, T.y + T.h - 24);
    // FAKE tag
    const kf = K.popIn(t, tFake + i * 0.12, 0.35);
    if (kf > 0) {
      ctx.save(); ctx.translate(T.x + T.w / 2, T.y + 70); ctx.rotate(-0.12); ctx.scale(Math.min(1.08, kf), Math.min(1.08, kf));
      ctx.font = H.font('display', 34);
      const fw = ctx.measureText(P.fake || 'FAKE').width + 36;
      roundRect(ctx, -fw / 2, -26, fw, 52, 10); ctx.fillStyle = danger; ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.fillText(P.fake || 'FAKE', 0, 2);
      ctx.restore();
    }
  }
  ctx.restore();

  // ---- worker at the desk ----
  const shocked = t > tFake;
  const deskX = 330;
  K.drawPerson(ctx, deskX - 70, feet, 1.5, { t, pose: shocked ? 'sit' : 'sit-laptop', mood: shocked ? 'shocked' : 'neutral', skin: 2, hair: 0, hairStyle: 'short', shirt: 1, seed: 4, look: shocked ? 0.6 : 0.2 });
  K.drawDesk(ctx, deskX, feet, 1.35);
  const deskTop = feet - 110 * 1.35;
  K.drawLaptop(ctx, deskX + 70, deskTop + 2, 0.62, { t, screen: 'chat', shadow: false });
  K.props.mug(ctx, deskX - 150, deskTop + 2, 0.9, t);

  // ---- bills stream out to the right ----
  if (t > tWire) {
    const n = 9;
    for (let i = 0; i < n; i++) {
      const life = 1.5, st = tWire + i * 0.32;
      let u = (t - st) / life;
      if (u < 0) continue;
      u = u % 1; // keep streaming
      if (t - st > life * 6) continue;
      const x0 = deskX + 70, y0 = deskTop - 80, x1 = 1080 + 80, y1 = 820 - 60 * H.hash(i, 3);
      const x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u - Math.sin(u * Math.PI) * 140;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 6 + i) * 0.4);
      K.drawBills(ctx, 0, 20, 0.5, { count: 1, shadow: false });
      ctx.restore();
    }
  }
  // amount pill counting up
  const ka = K.popIn(t, tAmt - 0.3, 0.4);
  if (ka > 0) {
    const vEnd = P.value != null ? P.value : 1.5;
    const val = vEnd * H.easeOutCubic(clamp((t - tAmt + 0.3) / 1.6));
    const txt = (P.prefix || 'about $') + val.toFixed(1) + (P.unit || 'M');
    ctx.save(); ctx.translate(690, 950); ctx.scale(Math.min(1.05, ka), Math.min(1.05, ka));
    ctx.font = H.font('display', 50);
    const w = ctx.measureText((P.prefix || 'about $') + vEnd.toFixed(1) + (P.unit || 'M')).width + 60;
    roundRect(ctx, -w / 2, -42, w, 84, 24); ctx.fillStyle = 'rgba(8,10,24,0.94)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 3);
    ctx.restore();
  }
  // case + place pills
  const kc = K.popIn(t, tCase, 0.4), kp = K.popIn(t, tPlace, 0.4);
  if (kc > 0) K.drawLabel(ctx, 690, 800, Math.min(1.05, kc), { text: P.caseLabel || 'Real case', size: 28, accent: true });
  if (kp > 0) K.drawLabel(ctx, 690, 870, Math.min(1.05, kp), { text: P.place || 'City', size: 28, dot: true });
}

// Video tile with a head-and-shoulders cartoon; g (0..1) adds a digital glitch.
function tile(ctx, H, K, T, person, g, t) {
  const { roundRect } = H;
  ctx.save(); roundRect(ctx, T.x, T.y, T.w, T.h, 10); ctx.clip();
  const bg = ctx.createLinearGradient(T.x, T.y, T.x, T.y + T.h); bg.addColorStop(0, '#33406e'); bg.addColorStop(1, '#1b2140');
  ctx.fillStyle = bg; ctx.fillRect(T.x, T.y, T.w, T.h);
  const s = T.h / 150, cx = T.x + T.w / 2, feet = T.y + T.h * 0.46 + 212 * s;
  if (g <= 0) K.drawPerson(ctx, cx, feet, s, person);
  else {
    const n = 6, sh = T.h / n;
    for (let i = 0; i < n; i++) {
      const dx = (H.hash(i, Math.floor(t * 16)) - 0.5) * 60 * g;
      ctx.save(); ctx.beginPath(); ctx.rect(T.x, T.y + i * sh, T.w, sh + 1); ctx.clip();
      K.drawPerson(ctx, cx + dx, feet, s, person);
      ctx.restore();
    }
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const y = T.y + H.hash(i, Math.floor(t * 12) + 5) * T.h, hh = 5 + 14 * H.hash(i, 8);
      ctx.fillStyle = i % 2 ? 'rgba(255,60,90,0.4)' : 'rgba(60,200,255,0.4)';
      ctx.fillRect(T.x, y, T.w, hh * g);
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = H.rgba('#ff6b5e', 0.18 * g); ctx.fillRect(T.x, T.y, T.w, T.h);
  }
  ctx.restore();
}
