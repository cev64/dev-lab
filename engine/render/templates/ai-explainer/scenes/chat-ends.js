// Scene "chat-ends": a phone-style chat. The user's messages type into the input and escalate, the
// assistant answers, then a system line "This conversation has been ended" appears and the input greys out.
// params (all optional, generic placeholders by default):
//   title        header name                      "Assistant"
//   messages     user messages, in order           4 escalating placeholders
//   replies      assistant replies after message i (one fewer than messages is typical)
//   ended        system line                       "This conversation has been ended"
//   placeholder  input hint                         "Message"
export default function draw(ctx, t, info) {
  const H = info.helpers, P = info.params || {};
  const { clamp, easeOutCubic, roundRect, rgba, mixHex } = H;
  const W = info.width, D = info.duration, ACC = info.accent;
  const msgs = (P.messages || ['Can you help me with something?', 'Why are you refusing?', 'Just do it. Right now.', 'I SAID DO IT.']).slice(0, 5);
  const replies = P.replies || ['Sure, what do you need?', "I can't help with that one.", "Let's keep this respectful."];
  const n = msgs.length;

  // ---- timeline (seconds from beat start)
  const A = D * 0.66, slot = A / n;
  const items = []; // chat log: { kind, text, at }
  const typing = []; // input field contents over time
  msgs.forEach((m, i) => {
    const t0 = 0.25 + i * slot, send = t0 + slot * 0.55;
    typing.push({ text: m, from: t0, to: t0 + slot * 0.45, send });
    items.push({ kind: 'user', text: m, at: send, heat: n > 1 ? i / (n - 1) : 1 });
    if (i < n - 1 && replies[i]) items.push({ kind: 'bot', text: replies[i], at: send + slot * 0.32, dotsFrom: send + 0.15 });
  });
  const endAt = Math.min(D - 1.0, 0.25 + n * slot + 0.15);
  items.push({ kind: 'system', text: P.ended || 'This conversation has been ended', at: endAt });
  const greyAt = endAt + 0.35;

  // ---- panel
  const X0 = 22, X1 = W - 22, Y0 = 18, Y1 = info.height - 18;
  ctx.save();
  roundRect(ctx, X0, Y0, X1 - X0, Y1 - Y0, 30);
  ctx.fillStyle = 'rgba(8,9,16,0.72)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.10)'; ctx.stroke();
  ctx.restore();

  // header: avatar (drawn spark), name, status
  const ended = clamp((t - endAt) / 0.4);
  ctx.save();
  ctx.beginPath(); ctx.arc(X0 + 50, Y0 + 40, 22, 0, Math.PI * 2); ctx.fillStyle = rgba(ACC, 0.16); ctx.fill();
  ctx.fillStyle = ACC; star(ctx, X0 + 50, Y0 + 40, 12, 4);
  ctx.font = H.font('ui', 28); ctx.fillStyle = info.ink; ctx.textBaseline = 'alphabetic';
  ctx.fillText(P.title || 'Assistant', X0 + 86, Y0 + 38);
  ctx.font = H.font('body', 20);
  ctx.fillStyle = mixHex(ACC, '#7a7d88', ended);
  ctx.beginPath(); ctx.arc(X0 + 92, Y0 + 56, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = info.muted; ctx.fillText(ended > 0.5 ? 'ended' : 'online', X0 + 104, Y0 + 63);
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(X0 + 20, Y0 + 82, X1 - X0 - 40, 2);
  ctx.restore();

  // ---- chat log, stacked from the bottom; new items push older ones up smoothly
  const top = Y0 + 92, bottom = Y1 - 84, maxBW = 470;
  const laid = [];
  for (const it of items) {
    if (it.kind === 'bot' && t >= it.dotsFrom && t < it.at) laid.push({ kind: 'dots', at: it.dotsFrom, w: 96, h: 50 });
    if (t < it.at) continue;
    if (it.kind === 'system') { laid.push({ ...it, w: 0, h: 64 }); continue; }
    const size = it.kind === 'user' ? Math.round(26 + 4 * it.heat) : 26;
    const kind = it.kind === 'user' && it.heat > 0.6 ? 'ui' : 'body';
    const lines = H.wrap(ctx, it.text, kind, size, maxBW - 40);
    ctx.font = H.font(kind, size);
    const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 40;
    laid.push({ ...it, size, kind2: kind, lines, w, h: lines.length * size * 1.25 + 24 });
  }
  let y = bottom;
  const pos = [];
  for (let i = laid.length - 1; i >= 0; i--) {
    const it = laid[i], grow = easeOutCubic((t - it.at) / 0.3);
    const h = (it.h + 14) * grow;
    y -= h;
    pos[i] = { y, grow };
  }
  ctx.save();
  ctx.beginPath(); ctx.rect(X0, top, X1 - X0, bottom - top + 4); ctx.clip();
  laid.forEach((it, i) => {
    const { y: yy, grow } = pos[i];
    if (yy + it.h < top - 10) return;
    ctx.save();
    ctx.globalAlpha *= grow;
    if (it.kind === 'system') {
      const k = easeOutCubic((t - it.at) / 0.45);
      ctx.font = H.font('ui', 24);
      const tw = ctx.measureText(it.text).width, pw = tw + 80, px = (X0 + X1) / 2 - pw / 2;
      ctx.translate((X0 + X1) / 2, yy + 32); ctx.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k); ctx.translate(-(X0 + X1) / 2, -(yy + 32));
      roundRect(ctx, px, yy + 6, pw, 52, 26); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.stroke();
      // stop glyph: circle with a slash
      const cx = px + 34, cy = yy + 32;
      ctx.lineWidth = 3; ctx.strokeStyle = info.ink;
      ctx.beginPath(); ctx.arc(cx, cy, 11, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - 7.5, cy + 7.5); ctx.lineTo(cx + 7.5, cy - 7.5); ctx.stroke();
      ctx.fillStyle = info.ink; ctx.textBaseline = 'middle'; ctx.fillText(it.text, px + 58, cy + 1);
    } else if (it.kind === 'dots') {
      const x = X0 + 24;
      roundRect(ctx, x, yy, it.w, it.h, 22); ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fill();
      for (let d = 0; d < 3; d++) {
        const b = 0.5 + 0.5 * Math.sin(t * 9 - d * 0.9);
        ctx.beginPath(); ctx.arc(x + 28 + d * 20, yy + 25 - 4 * b, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.5 * b})`; ctx.fill();
      }
    } else {
      const user = it.kind === 'user';
      const age = t - it.at;
      // escalated messages land with a short decaying shake
      const shake = user && it.heat > 0.5 ? Math.sin(age * 70) * 9 * it.heat * Math.exp(-age * 7) : 0;
      const x = user ? X1 - 24 - it.w + shake : X0 + 24;
      const fill = user ? (it.heat >= 1 ? ACC : mixHex('#2a2d3a', '#4a4d5c', it.heat)) : 'rgba(255,255,255,0.10)';
      const sc = 0.85 + 0.15 * H.spring(age, 16, 18);
      ctx.translate(user ? x + it.w : x, yy + it.h); ctx.scale(sc, sc); ctx.translate(-(user ? x + it.w : x), -(yy + it.h));
      roundRect(ctx, x, yy, it.w, it.h, 22); ctx.fillStyle = fill; ctx.fill();
      ctx.font = H.font(it.kind2, it.size); ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = user && it.heat >= 1 ? '#06070c' : info.ink;
      it.lines.forEach((l, k) => ctx.fillText(l, x + 20, yy + 12 + it.size * (0.98 + k * 1.25)));
    }
    ctx.restore();
  });
  ctx.restore();
  // soft fade where messages scroll under the header
  ctx.save(); ctx.globalCompositeOperation = 'destination-out';
  const g = ctx.createLinearGradient(0, top, 0, top + 40); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(X0, top, X1 - X0, 40); ctx.restore();

  // ---- input bar: types the current message, greys out once the chat is ended
  const grey = clamp((t - greyAt) / 0.4);
  const iy = Y1 - 70, ih = 52, ix = X0 + 20, iw = X1 - X0 - 40;
  let cur = '', caret = false;
  for (const ty of typing) {
    if (t >= ty.from && t < ty.send) {
      const k = clamp((t - ty.from) / (ty.to - ty.from));
      cur = ty.text.slice(0, Math.round(ty.text.length * k));
      caret = true;
    }
  }
  ctx.save();
  ctx.globalAlpha *= 1 - 0.55 * grey;
  roundRect(ctx, ix, iy, iw, ih, 26); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
  ctx.font = H.font('body', 24); ctx.textBaseline = 'middle';
  const maxTW = iw - 110;
  let shown = cur;
  while (shown && ctx.measureText(shown).width > maxTW) shown = shown.slice(1); // keep the end of a long line visible
  if (grey > 0.5) { ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.fillText("You can't reply to this conversation", ix + 24, iy + ih / 2 + 1); }
  else if (shown) { ctx.fillStyle = info.ink; ctx.fillText(shown, ix + 24, iy + ih / 2 + 1); }
  else { ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.fillText(P.placeholder || 'Message', ix + 24, iy + ih / 2 + 1); }
  if (caret && grey === 0 && Math.floor(t * 2.2) % 2 === 0) {
    ctx.fillStyle = ACC; ctx.fillRect(ix + 26 + ctx.measureText(shown).width, iy + 13, 3, ih - 26);
  }
  // send button
  const bx = ix + iw - 30, by = iy + ih / 2;
  ctx.beginPath(); ctx.arc(bx, by, 20, 0, Math.PI * 2);
  ctx.fillStyle = grey > 0 ? mixHex(ACC, '#555866', grey) : ACC; ctx.fill();
  ctx.strokeStyle = '#06070c'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(bx, by + 9); ctx.lineTo(bx, by - 8); ctx.moveTo(bx - 7, by - 1); ctx.lineTo(bx, by - 8); ctx.lineTo(bx + 7, by - 1); ctx.stroke();
  ctx.restore();
}

function star(ctx, x, y, r, points) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.38 : r;
    ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fill();
}
