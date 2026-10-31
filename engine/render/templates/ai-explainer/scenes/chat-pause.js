// Scene "chat-pause" (full frame, 1 beat). Night room: a big generic chat-app phone on the left whose messages are
// grey bars only (no readable content, nothing graphic). On endCue a "Chat ended" banner drops and the input greys;
// a tally of ended chats ticks up (1 -> n) above the phone; on pauseCue a big pause badge + "Account paused" stamp
// lands over the phone; on parentCue a cartoon parent on the right gets a notification on their phone, with a hedge
// pill ("Planned"). A "For everyone" scope pill at the start (fades when the parent arrives).
// Fits: "the app can now end chats / pause accounts / tell parents" safety stories.
// params: app ("AI chat"), scope ("For everyone"), ended ("Chat ended"), paused ("Account paused"),
//   notif ("Your teen's account was paused"), hedge ("Planned"), tally (3), cues: endCue, pauseCue, parentCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const tEnd = at(P.endCue, D * 0.2) - 0.1;
  const tPause = at(P.pauseCue, D * 0.62) - 0.25;
  const tParent = at(P.parentCue, D * 0.9) - 1.4;
  const N = Math.max(1, Math.min(4, P.tally || 3));
  const tTally = (i) => i === 0 ? tEnd + 0.3 : lerp(tEnd + 1.6, tPause - 0.5, (i - 1) / Math.max(1, N - 2));

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 470, y: 720 }, { t: D, zoom: 1.0 }]);
  K.world.room(ctx, { t, time: 'night', lamp: true, window: true, picture: false, plant: false });
  // parent on the right
  const parentIn = H.phase(t, tParent - 0.9, tParent);
  const PX = lerp(1200, 770, parentIn);
  K.drawPerson(ctx, PX, 1030, 1.45, { t, pose: parentIn >= 1 ? 'phone' : 'stand', walk: parentIn > 0 && parentIn < 1 ? t : undefined,
    mood: t > tParent + 0.5 ? 'worried' : 'neutral', skin: 1, hair: 3, shirt: '#c96b4a', hairStyle: 'bun', seed: 44, flip: false, look: -0.4 });
  ctx.restore();

  // ---------- phone ----------
  const X0 = 80, X1 = 520, Y0 = 470, Y1 = 1015, W = X1 - X0;
  const SX0 = X0 + 12, SX1 = X1 - 12, SW = SX1 - SX0;
  const pz = K.bob(t, 3, 1.0);
  ctx.save(); ctx.translate(0, pz);
  roundRect(ctx, X0 - 4, Y0 + 10, W + 8, Y1 - Y0, 46); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
  roundRect(ctx, X0, Y0, W, Y1 - Y0, 44); ctx.fillStyle = '#0e1122'; ctx.fill();
  roundRect(ctx, SX0, Y0 + 12, SW, Y1 - Y0 - 24, 34); ctx.fillStyle = '#f2f4fa'; ctx.fill();
  ctx.save(); roundRect(ctx, SX0, Y0 + 12, SW, 74, 34); ctx.clip(); ctx.fillStyle = '#e1e5f0'; ctx.fillRect(SX0, Y0 + 12, SW, 74); ctx.restore();
  ctx.beginPath(); ctx.arc(SX0 + 40, Y0 + 49, 15, 0, Math.PI * 2); ctx.fillStyle = '#3b4672'; ctx.fill();
  ctx.font = H.font('ui', 27); ctx.fillStyle = '#141829'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(P.app || 'AI chat', SX0 + 66, Y0 + 50);
  // messages: grey bars that keep arriving until the chat ends (scrolling up)
  ctx.save(); roundRect(ctx, SX0, Y0 + 90, SW, Y1 - Y0 - 210, 0); ctx.clip();
  const rate = 1.3, nMsg = Math.floor(clamp(Math.min(t, tEnd) + 1.5, 0, 99) * rate) + 4;
  for (let i = 0; i < nMsg; i++) {
    const age = (Math.min(t, tEnd) + 1.5) + 4 / rate - i / rate;
    const k = clamp(age / 0.3);
    const fromRight = i % 2 === 0;
    const y = Y1 - 200 - (nMsg - 1 - i) * 92 - 40 * (1 - k);
    if (y < Y0 + 70) continue;
    const w = (fromRight ? 220 : 270) + 30 * Math.sin(i * 1.7);
    const x = fromRight ? SX1 - 22 - w : SX0 + 22;
    ctx.globalAlpha = k * (t > tEnd ? 0.45 : 1);
    roundRect(ctx, x, y, w, 70, 22); ctx.fillStyle = fromRight ? '#4f8cff' : '#ffffff'; ctx.fill();
    roundRect(ctx, x + 20, y + 26, w - 60, 18, 9); ctx.fillStyle = fromRight ? 'rgba(255,255,255,0.55)' : '#c3c9da'; ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.restore();
  // "Chat ended" banner
  const eb = K.popIn(t, tEnd, 0.45);
  if (eb > 0) {
    const y = Y0 + 300;
    ctx.save(); ctx.translate((SX0 + SX1) / 2, y); ctx.scale(eb, eb);
    roundRect(ctx, -SW / 2 + 22, -40, SW - 44, 80, 22); ctx.fillStyle = '#1b2140'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.font = H.font('bold', 30); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.ended || 'Chat ended', 0, 2);
    ctx.restore();
  }
  // input bar (greys out after the end)
  const grey = t > tEnd + 0.3;
  const iy = Y1 - 98;
  roundRect(ctx, SX0 + 22, iy, SW - 44, 62, 31); ctx.fillStyle = grey ? '#d0d4df' : '#e8ebf3'; ctx.fill();
  roundRect(ctx, SX0 + 48, iy + 22, 150, 18, 9); ctx.fillStyle = grey ? '#bfc4d2' : '#b8bfd3'; ctx.fill();
  ctx.beginPath(); ctx.arc(SX1 - 56, iy + 31, 20, 0, Math.PI * 2); ctx.fillStyle = grey ? '#b8bfd3' : '#3b4672'; ctx.fill();

  // pause badge over the phone
  const pb = clamp((t - tPause) / 0.6);
  if (pb > 0) {
    ctx.fillStyle = rgba('#0a0c18', 0.45 * clamp(pb * 2)); roundRect(ctx, SX0, Y0 + 12, SW, Y1 - Y0 - 24, 34); ctx.fill();
    const cx = (SX0 + SX1) / 2, cy = Y0 + 560;
    const s = 1 + 1.2 * Math.pow(1 - H.easeOutCubic(clamp(pb / 0.6)), 2);
    ctx.save(); ctx.translate(cx, cy - 120); ctx.scale(s, s); ctx.globalAlpha = clamp(pb / 0.25);
    ctx.beginPath(); ctx.arc(0, 0, 92, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = '#141829'; roundRect(ctx, -34, -42, 24, 84, 8); ctx.fill(); roundRect(ctx, 10, -42, 24, 84, 8); ctx.fill();
    ctx.restore();
    const lp = K.popIn(t, tPause + 0.35, 0.4);
    if (lp > 0) K.drawLabel(ctx, cx, cy + 50, lp, { text: P.paused || 'Account paused', size: 30, accent: true });
  }
  ctx.restore();

  // tally of ended chats (above the phone)
  const tallyOut = 1 - H.phase(t, tParent - 0.3, tParent + 0.1);
  if (tallyOut > 0) {
    ctx.save(); ctx.globalAlpha = tallyOut;
    ctx.font = H.font('ui', 24); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    if (t > tTally(0)) ctx.fillText(P.tallyLabel || 'Chats ended', 720, 700);
    ctx.restore();
  }
  for (let i = 0; i < N; i++) {
    const p = K.popIn(t, tTally(i), 0.4) * tallyOut;
    if (p <= 0) continue;
    const x = 720 + (i - (N - 1) / 2) * 96, y = 640;
    ctx.save(); ctx.globalAlpha = clamp(tallyOut); ctx.translate(x, y - 40); ctx.scale(p, p);
    roundRect(ctx, -34, -26, 68, 52, 14); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-14, 26); ctx.lineTo(-4, 40); ctx.lineTo(4, 26); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#e5484d'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(12, 12); ctx.moveTo(12, -12); ctx.lineTo(-12, 12); ctx.stroke();
    ctx.restore();
  }
  // scope pill
  const sp = K.popIn(t, 0.1, 0.4) * (1 - H.phase(t, tParent - 0.3, tParent + 0.1));
  if (sp > 0) K.drawLabel(ctx, 700, 520, sp, { text: P.scope || 'For everyone', size: 30, dot: true });

  // parent's notification
  const np = K.popIn(t, tParent + 0.15, 0.45);
  if (np > 0) {
    const bx0 = 570, bx1 = 905, by = 560;
    ctx.save(); ctx.globalAlpha = clamp(np * 1.5);
    const lines = H.wrap(ctx, P.notif || "Your teen's account was paused", 'bold', 28, bx1 - bx0 - 110);
    const bh = 40 + lines.length * 36;
    ctx.translate((bx0 + bx1) / 2, by + bh / 2); ctx.scale(0.85 + 0.15 * np, 0.85 + 0.15 * np); ctx.translate(-(bx0 + bx1) / 2, -(by + bh / 2));
    roundRect(ctx, bx0, by, bx1 - bx0, bh, 24); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    ctx.beginPath(); ctx.arc(bx0 + 46, by + bh / 2, 24, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = '#141829'; roundRect(ctx, bx0 + 36, by + bh / 2 - 12, 7, 24, 3); ctx.fill(); roundRect(ctx, bx0 + 49, by + bh / 2 - 12, 7, 24, 3); ctx.fill();
    ctx.font = H.font('bold', 28); ctx.fillStyle = '#141829'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    lines.forEach((ln, i) => ctx.fillText(ln, bx0 + 86, by + 46 + i * 36));
    ctx.restore();
    const hp = K.popIn(t, tParent + 0.7, 0.4);
    if (hp > 0) K.drawLabel(ctx, (bx0 + bx1) / 2, by - 14, hp, { text: P.hedge || 'Planned', size: 26 });
  }
}
