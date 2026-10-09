// Scene "chat-ends" (full frame). A cartoon person on a sofa at night types angrily on their phone; the camera
// pushes into the phone; the chat escalates until "This conversation has been ended" appears and the input greys
// out; the camera pulls back to the person staring at the screen.
// Phases follow the beat boundaries when the scene spans >= 3 beats, else 28% / 52% / 20% of the duration.
// params (optional, generic placeholders by default):
//   messages  user messages (escalating)       replies  assistant replies between them
//   title     chat header name ("Assistant")   ended    system line   burst  little emotes in the wide shot
//   endWord   a narration word; the chat ends when it is spoken
export default function draw(ctx, t, info) {
  const H = info.helpers, K = info.helpers.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic, roundRect, mixHex } = H;
  const D = info.duration, ACC = info.accent;
  const msgs = (P.messages || ['Can you help me with something?', 'Why are you refusing?', 'Just do it. Right now.', 'I SAID DO IT.']).slice(0, 5);
  const replies = P.replies || ['Sure, what do you need?', "I can't help with that one.", "Let's keep this respectful."];

  // ---- phases
  let a1 = D * 0.28, a2 = D * 0.8;
  if (info.beats.length >= 3) { a1 = info.beats[1].t0; a2 = info.beats[2].t0; }
  const cue = P.endWord != null ? info.timeOf(P.endWord) : null;
  const endAt = cue != null && cue > a1 + 1.5 && cue < a2 ? cue : Math.max(a1 + 1.6, a2 - 1.5);
  const greyAt = endAt + 0.4;

  // ---- camera (stage-centred): slow push -> into the phone -> back out to a medium shot
  const R = K.world; // world painters
  const sofa = { x: 480, feetY: 1030 }, S = 1.9;
  const phone = { x: sofa.x + 8 * S, y: sofa.feetY - 132 * S };
  const zIn = H.phase(t, a1 - 0.25, a1 + 0.65), zOut = H.phase(t, a2, a2 + 0.9);
  let z = lerp(1, 1.07, H.phase(t, 0, a1)), cx = 487, cy = 725;
  z = lerp(z, 3.4, zIn); cx = lerp(cx, phone.x, zIn); cy = lerp(cy, phone.y, zIn);
  z = lerp(z, 1.55, zOut); cx = lerp(cx, 492, zOut); cy = lerp(cy, 735, zOut);
  z *= 1 + 0.01 * H.phase(t, a2 + 0.9, D); // keep drifting a touch so the end never freezes dead
  ctx.save();
  ctx.translate(487, 725); ctx.scale(z, z); ctx.translate(-cx, -cy);

  const room = R.livingRoomNight(ctx, { t });
  // ---- the person
  const angry = t > a1 * 0.35 && t < a2;
  const typing = t < a2 ? 1 + H.phase(t, 0, a1) : 0;
  let mood = angry ? 'angry' : 'neutral';
  if (t >= a2) mood = t < a2 + 1.6 ? 'shocked' : 'neutral';
  // phone glow on the face
  K.glow(ctx, phone.x, phone.y - 20, 150, ACC, t >= a2 ? 0.35 : 0.2);
  K.drawPerson(ctx, room.sofa.x, room.sofa.feetY, S, { pose: 'sit-phone', seat: false, t, typing, mood, skin: 2, hair: 0, shirt: 0, hairStyle: 'short', seed: 2 });
  // anger puffs near the head (wide shot)
  if (angry && t < a1 + 0.2) {
    const hx = room.sofa.x + 52 * S, hy = room.sofa.feetY - 250 * S;
    ctx.save(); ctx.strokeStyle = '#ff6b5e'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const f = 0.5 + 0.5 * Math.sin(t * 10 + i * 2);
      ctx.globalAlpha = 0.5 + 0.5 * f;
      const a = -0.9 + i * 0.45, r0 = 24 + 6 * f;
      ctx.beginPath(); ctx.moveTo(hx + Math.cos(a) * r0, hy + Math.sin(a) * r0); ctx.lineTo(hx + Math.cos(a) * (r0 + 22), hy + Math.sin(a) * (r0 + 22)); ctx.stroke();
    }
    ctx.restore();
  }
  // emotes rising from the phone in the wide shot
  const burst = P.burst || ['?', '??!', '!!!'];
  burst.forEach((txt, i) => {
    const at0 = a1 * (0.3 + 0.22 * i), age = t - at0;
    if (age < 0 || age > 1.6 || t > a1 + 0.3) return;
    const pop = K.popIn(t, at0, 0.3), rise = easeOutCubic(age / 1.6) * 120;
    ctx.save(); ctx.globalAlpha = 1 - smooth((age - 1.1) / 0.5);
    K.drawSpeechBubble(ctx, phone.x + (i - 1) * 70, phone.y - 90 - rise, 1, { text: txt, size: 34, pop, tail: i === 0 ? 'right' : i === 2 ? 'left' : 'center', dark: i < 2 });
    ctx.restore();
  });
  // the "..." stare bubble after the chat ended
  if (t > a2 + 1.1) {
    const pop = K.popIn(t, a2 + 1.1, 0.35);
    K.drawSpeechBubble(ctx, room.sofa.x + 62 * S, room.sofa.feetY - 222 * S, 1, { text: '...', size: 40, pop, tail: 'left' });
  }
  ctx.restore();

  // ---- close-up of the phone (crossfades in once the camera is in)
  const close = clamp(H.phase(t, a1 + 0.2, a1 + 0.65, smooth) - H.phase(t, a2 - 0.05, a2 + 0.35, smooth));
  if (close <= 0.002) return;
  ctx.save();
  ctx.globalAlpha = close;
  ctx.fillStyle = 'rgba(6,7,14,0.55)'; ctx.fillRect(0, 0, info.width, info.height);
  const sc = 0.92 + 0.08 * close;
  ctx.translate(487, 720); ctx.scale(sc, sc); ctx.translate(-487, -720);
  const PX = 487 - 270, PY = 360, PW = 540, PH = 700;
  K.glow(ctx, 487, 700, 520, ACC, 0.12);
  roundRect(ctx, PX, PY, PW, PH, 64); ctx.fillStyle = '#22273b'; ctx.fill();
  roundRect(ctx, PX + 16, PY + 16, PW - 32, PH - 32, 50); ctx.fillStyle = '#0d0f1c'; ctx.fill();
  const X0 = PX + 16, X1 = PX + PW - 16, Y0 = PY + 16, Y1 = PY + PH - 16;
  // header
  const ended = clamp((t - endAt) / 0.4);
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; roundRect(ctx, X0, Y0, X1 - X0, 104, 50); ctx.fill();
  ctx.beginPath(); ctx.arc(X0 + 62, Y0 + 56, 26, 0, Math.PI * 2); ctx.fillStyle = H.rgba(ACC, 0.18); ctx.fill();
  star(ctx, X0 + 62, Y0 + 56, 14, ACC);
  ctx.font = H.font('ui', 30); ctx.fillStyle = '#fff'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(P.title || 'Assistant', X0 + 102, Y0 + 52);
  ctx.font = H.font('body', 22); ctx.fillStyle = mixHex(ACC, '#7a7d88', ended);
  ctx.beginPath(); ctx.arc(X0 + 109, Y0 + 72, 6, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText(ended > 0.5 ? 'ended' : 'online', X0 + 122, Y0 + 80);

  // chat log
  const chat0 = a1 + 0.6, n = msgs.length, slot = Math.max(0.6, (endAt - 0.25 - chat0) / n);
  const items = [], typingRows = [];
  msgs.forEach((m, i) => {
    const s0 = chat0 + i * slot, send = s0 + slot * 0.55;
    typingRows.push({ text: m, from: s0, to: s0 + slot * 0.45, send });
    items.push({ kind: 'user', text: m, at: send, heat: n > 1 ? i / (n - 1) : 1 });
    if (i < n - 1 && replies[i]) items.push({ kind: 'bot', text: replies[i], at: send + slot * 0.32, dots: send + 0.12 });
  });
  items.push({ kind: 'system', text: P.ended || 'This conversation has been ended', at: endAt });
  const top = Y0 + 112, bottom = Y1 - 100, maxBW = 380;
  const laid = [];
  for (const it of items) {
    if (it.kind === 'bot' && t >= it.dots && t < it.at) laid.push({ kind: 'dots', at: it.dots, w: 104, h: 56 });
    if (t < it.at) continue;
    if (it.kind === 'system') { laid.push({ ...it, h: 120 }); continue; }
    const size = it.kind === 'user' ? Math.round(29 + 5 * it.heat) : 29, kind = it.kind === 'user' && it.heat > 0.6 ? 'ui' : 'body';
    const lines = H.wrap(ctx, it.text, kind, size, maxBW - 44);
    ctx.font = H.font(kind, size);
    laid.push({ ...it, size, f: kind, lines, w: Math.max(...lines.map((l) => ctx.measureText(l).width)) + 44, h: lines.length * size * 1.25 + 28 });
  }
  let y = bottom; const ys = [];
  for (let i = laid.length - 1; i >= 0; i--) { y -= (laid[i].h + 14) * easeOutCubic((t - laid[i].at) / 0.3); ys[i] = y; }
  ctx.save(); ctx.beginPath(); ctx.rect(X0, top, X1 - X0, bottom - top + 6); ctx.clip();
  laid.forEach((it, i) => {
    const yy = ys[i], age = t - it.at;
    if (yy + it.h < top - 20) return;
    ctx.save();
    if (it.kind === 'system') {
      const k = K.popIn(t, it.at, 0.4);
      ctx.font = H.font('ui', 26);
      const tw = ctx.measureText(it.text).width, pw = Math.min(X1 - X0 - 30, tw + 84), mx = (X0 + X1) / 2;
      ctx.translate(mx, yy + 60); ctx.scale(k, k); ctx.translate(-mx, -(yy + 60));
      roundRect(ctx, mx - pw / 2, yy + 30, pw, 60, 30); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke();
      const sx = mx - pw / 2 + 36, sy = yy + 60;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(sx, sy, 12, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx - 8, sy + 8); ctx.lineTo(sx + 8, sy - 8); ctx.stroke();
      const ft = H.fitText(ctx, it.text, 'ui', 26, 18, pw - 84); ctx.font = ft.font;
      ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.fillText(ft.text, sx + 26, sy + 1);
    } else if (it.kind === 'dots') {
      roundRect(ctx, X0 + 24, yy, it.w, it.h, 26); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill();
      for (let d = 0; d < 3; d++) { const b = 0.5 + 0.5 * Math.sin(t * 9 - d * 0.9); ctx.beginPath(); ctx.arc(X0 + 54 + d * 22, yy + 28 - 4 * b, 6, 0, Math.PI * 2); ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.5 * b})`; ctx.fill(); }
    } else {
      const user = it.kind === 'user';
      const shake = user && it.heat > 0.5 ? K.shake(t, it.at, 0.45, 10 * it.heat) : 0;
      const x = user ? X1 - 24 - it.w + shake : X0 + 24;
      const fill = user ? (it.heat >= 1 ? ACC : mixHex('#2c3044', '#4b4f63', it.heat)) : 'rgba(255,255,255,0.1)';
      const sc2 = K.popIn(t, it.at, 0.32), ax = user ? x + it.w : x;
      ctx.translate(ax, yy + it.h); ctx.scale(sc2, sc2); ctx.translate(-ax, -(yy + it.h));
      roundRect(ctx, x, yy, it.w, it.h, 26); ctx.fillStyle = fill; ctx.fill();
      ctx.font = H.font(it.f, it.size); ctx.textBaseline = 'alphabetic'; ctx.fillStyle = user && it.heat >= 1 ? '#06070c' : '#fff';
      it.lines.forEach((l, k) => ctx.fillText(l, x + 22, yy + 14 + it.size * (0.98 + k * 1.25)));
      void age;
    }
    ctx.restore();
  });
  ctx.restore();
  // input bar
  const grey = clamp((t - greyAt) / 0.4);
  let cur = '', caret = false;
  for (const r of typingRows) if (t >= r.from && t < r.send) { cur = r.text.slice(0, Math.round(r.text.length * clamp((t - r.from) / (r.to - r.from)))); caret = true; }
  const iy = Y1 - 86, ih = 62, ix = X0 + 20, iw = X1 - X0 - 40;
  ctx.save(); ctx.globalAlpha *= 1 - 0.55 * grey;
  roundRect(ctx, ix, iy, iw, ih, 31); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke();
  ctx.font = H.font('body', 27); ctx.textBaseline = 'middle';
  let shown = cur; while (shown && ctx.measureText(shown).width > iw - 120) shown = shown.slice(1);
  if (grey > 0.5) { const ft = H.fitText(ctx, "You can't reply to this conversation", 'body', 25, 18, iw - 100); ctx.font = ft.font; ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillText(ft.text, ix + 26, iy + ih / 2 + 1); }
  else if (shown) { ctx.fillStyle = '#fff'; ctx.fillText(shown, ix + 26, iy + ih / 2 + 1); }
  else { ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillText('Message', ix + 26, iy + ih / 2 + 1); }
  if (caret && Math.floor(t * 2.2) % 2 === 0) { ctx.fillStyle = ACC; ctx.fillRect(ix + 28 + ctx.measureText(shown).width, iy + 16, 3, ih - 32); }
  const bx = ix + iw - 34, by = iy + ih / 2;
  ctx.beginPath(); ctx.arc(bx, by, 24, 0, Math.PI * 2); ctx.fillStyle = mixHex(ACC, '#555866', grey); ctx.fill();
  ctx.strokeStyle = '#06070c'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(bx, by + 10); ctx.lineTo(bx, by - 9); ctx.moveTo(bx - 8, by - 1); ctx.lineTo(bx, by - 9); ctx.lineTo(bx + 8, by - 1); ctx.stroke();
  ctx.restore();
  ctx.restore();
}

function star(ctx, x, y, r, color) {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.38 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fillStyle = color; ctx.fill();
}
