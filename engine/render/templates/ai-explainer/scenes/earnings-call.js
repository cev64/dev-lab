// Scene "earnings-call" (full frame, 1 beat ~10-14 s). Night conference room: a big wall screen shows a company's
// quarterly call ("LIVE" dot + audio waveform); a speakerphone puck on the table pulses with the narration. Nobody is
// drawn: speakers are text tiles only. On askCue an "Analyst" tile pops with a question bubble; on ceoCue a second tile
// with the executive's name + role as TEXT (a waveform icon, never a face); on quoteCue the screen flips to a verbatim
// quote panel that types in, and on hiCue the key words light up in the accent. The kit robot sits at the end of the
// table with a shopping bag, hopeful, then deflates.
// Fits: anything said on an earnings call / press call / hearing, "an exec admitted X when asked".
// params: company ("Company"), call ("Earnings call"), asker ("Analyst"), ask ("What about AI?"),
//         who ("Exec name"), role ("CEO"), quote (verbatim, curly quotes), hi (substring of quote to light up),
//         by (attribution line), cues ("word#n"): callCue, askCue, ceoCue, quoteCue, hiCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tCall = at(P.callCue, D * 0.12) - 0.2;
  const tAsk = at(P.askCue, D * 0.27) - 0.2;
  const tCeo = at(P.ceoCue, D * 0.55) - 0.2;
  const tQuote = Math.max(tCeo + 0.6, at(P.quoteCue, D * 0.63) - 0.2);
  const tHi = at(P.hiCue, D * 0.92) - 0.1;
  const feet = 1030;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tQuote, zoom: 1.03, x: 487, y: 700 }, { t: D, zoom: 1.05, x: 487, y: 690 }]);
  K.world.room(ctx, { t, time: 'night', wall: '#222a4e', floor: '#161b33', window: false, picture: false, lamp: false, plant: true, floorY: 900 });

  // ---- wall screen ----
  const sx0 = 110, sx1 = 865, sy0 = 440, sy1 = 745, scx = (sx0 + sx1) / 2;
  roundRect(ctx, sx0 - 14, sy0 - 14, sx1 - sx0 + 28, sy1 - sy0 + 28, 20); ctx.fillStyle = '#0b0e1c'; ctx.fill();
  roundRect(ctx, sx0, sy0, sx1 - sx0, sy1 - sy0, 12); ctx.fillStyle = '#141a36'; ctx.fill();
  K.glow(ctx, scx, (sy0 + sy1) / 2, 380, '#7fb3ff', 0.06);
  const qOn = smooth((t - tQuote) / 0.4);

  // call view (fades out when the quote takes over)
  if (qOn < 1) {
    ctx.save(); ctx.globalAlpha = 1 - qOn;
    // title bar
    const tp = K.popIn(t, tCall, 0.4);
    ctx.fillStyle = '#ff5e5e'; ctx.beginPath(); ctx.arc(sx0 + 40, sy0 + 40, 9 + 2 * Math.sin(t * 6), 0, Math.PI * 2); ctx.fill();
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#ff9a9a'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('LIVE', sx0 + 60, sy0 + 41);
    if (tp > 0) {
      ctx.save(); ctx.globalAlpha *= clamp(tp);
      ctx.font = H.font('display', 34); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
      const title = `${P.company || 'Company'}: ${P.call || 'Earnings call'}`;
      ctx.font = H.font('display', H.fitText(ctx, title, 'display', 34, 24, 520)); ctx.fillText(title, sx0 + 130, sy0 + 42);
      ctx.restore();
    }
    // waveform across the screen
    ctx.strokeStyle = rgba(ACC, 0.8); ctx.lineWidth = 4; ctx.lineCap = 'round';
    const mid = sy0 + 120;
    for (let i = 0; i < 46; i++) {
      const x = sx0 + 40 + i * 15.5;
      const a = (6 + 30 * info.env) * (0.35 + 0.65 * Math.abs(Math.sin(i * 0.9 + t * 7)));
      ctx.beginPath(); ctx.moveTo(x, mid - a / 2); ctx.lineTo(x, mid + a / 2); ctx.stroke();
    }
    // participant tiles
    const tile = (x, pop, name, role, speaking) => {
      if (pop <= 0) return;
      ctx.save(); ctx.translate(x, sy0 + 240); ctx.scale(Math.min(1.04, pop), Math.min(1.04, pop));
      roundRect(ctx, -170, -70, 340, 140, 16); ctx.fillStyle = '#20284d'; ctx.fill();
      ctx.lineWidth = speaking ? 4 : 2; ctx.strokeStyle = speaking ? ACC : 'rgba(255,255,255,0.18)'; ctx.stroke();
      // icon: microphone circle (no face)
      ctx.fillStyle = '#2f3970'; ctx.beginPath(); ctx.arc(-110, 0, 40, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = speaking ? ACC : '#c9cfdf'; roundRect(ctx, -120, -24, 20, 34, 10); ctx.fill();
      ctx.strokeStyle = speaking ? ACC : '#c9cfdf'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(-110, 0, 18, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-110, 18); ctx.lineTo(-110, 28); ctx.stroke();
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff'; ctx.font = H.font('bold', H.fitText(ctx, name, 'bold', 30, 22, 220)); ctx.fillText(name, -54, role ? -16 : 0);
      if (role) { ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = H.font('ui', 24); ctx.fillText(role, -54, 20); }
      ctx.restore();
    };
    const speakingCeo = t > tCeo + 0.3;
    tile(scx - 185, K.popIn(t, tAsk, 0.45), P.asker || 'Analyst', '', t > tAsk && !speakingCeo);
    tile(scx + 185, K.popIn(t, tCeo, 0.45), P.who || 'Exec name', P.role || 'CEO', speakingCeo);
    ctx.restore();
  }
  // question bubble from the analyst tile (outside the screen fade so it reads)
  const bp = K.popIn(t, tAsk + 0.35, 0.4) * (1 - smooth((t - tCeo) / 0.4));
  if (bp > 0) K.drawSpeechBubble(ctx, scx - 230, sy0 + 160, 1, { text: P.ask || 'What about AI?', size: 30, tail: 'left', pop: Math.min(1.04, bp) });

  // quote view
  if (qOn > 0) {
    ctx.save(); ctx.globalAlpha = qOn;
    ctx.fillStyle = ACC; ctx.font = H.font('display', 110); ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('“', sx0 + 24, sy0 + 4);
    const q = String(P.quote || '“Quote goes here”');
    const hi = String(P.hi || '');
    const words = q.split(' ');
    const shown = Math.ceil(words.length * clamp((t - tQuote - 0.15) / 1.6));
    const size = 46, maxW = sx1 - sx0 - 120;
    // greedy wrap with per-word colour
    ctx.font = H.font('display', size);
    const lines = []; let cur = [];
    for (const w of words) { const n = [...cur, w].join(' '); if (cur.length && ctx.measureText(n).width > maxW) { lines.push(cur); cur = [w]; } else cur.push(w); }
    if (cur.length) lines.push(cur);
    const hiWords = hi ? hi.toLowerCase().split(' ') : [];
    const hiStart = hi ? q.toLowerCase().indexOf(hi.toLowerCase()) : -1;
    let idx = 0, charPos = 0;
    const lh = size * 1.22, y0 = (sy0 + sy1) / 2 - (lines.length * lh) / 2 - 10;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    lines.forEach((ln, li) => {
      const full = ln.join(' ');
      let x = scx - ctx.measureText(full).width / 2;
      ln.forEach((w) => {
        const pos = q.indexOf(w, charPos); charPos = pos + w.length;
        const isHi = hiStart >= 0 && pos >= hiStart && pos < hiStart + hi.length && t > tHi;
        if (idx < shown) {
          if (isHi) { const ww = ctx.measureText(w).width; ctx.fillStyle = rgba(ACC, 0.25 * smooth((t - tHi) / 0.3)); roundRect(ctx, x - 6, y0 + li * lh + lh / 2 - size * 0.62, ww + 12, size * 1.2, 8); ctx.fill(); }
          ctx.fillStyle = isHi ? ACC : '#ffffff'; ctx.fillText(w, x, y0 + li * lh + lh / 2);
        }
        x += ctx.measureText(w + ' ').width; idx++;
      });
    });
    ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = H.font('ui', 26); ctx.textAlign = 'center';
    ctx.fillText('— ' + (P.by || 'Exec, on the call'), scx, sy1 - 40);
    ctx.restore();
  }

  // ---- table, speakerphone, robot ----
  ctx.fillStyle = '#3b2f4a'; roundRect(ctx, 70, 905, 940, 46, 18); ctx.fill();
  ctx.fillStyle = '#2a2236'; ctx.fillRect(110, 950, 40, 90); ctx.fillRect(930, 950, 40, 90);
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; roundRect(ctx, 90, 908, 900, 8, 4); ctx.fill();
  // speakerphone puck
  const px = 430, py = 905;
  for (let r = 0; r < 3; r++) {
    const u = ((t * 0.9 + r / 3) % 1);
    ctx.strokeStyle = rgba(ACC, (0.15 + 0.5 * info.env) * (1 - u)); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.ellipse(px, py - 22, 70 + u * 140, 22 + u * 40, 0, Math.PI, 0); ctx.stroke();
  }
  ctx.fillStyle = '#1b1f33'; ctx.beginPath(); ctx.moveTo(px - 90, py); ctx.lineTo(px - 60, py - 34); ctx.lineTo(px + 60, py - 34); ctx.lineTo(px + 90, py); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#2e3454'; ctx.beginPath(); ctx.ellipse(px, py - 34, 60, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = info.env > 0.1 ? ACC : '#5a6290'; ctx.beginPath(); ctx.arc(px, py - 16, 6, 0, Math.PI * 2); ctx.fill();
  // mugs and notepad
  K.props.mug(ctx, 220, 905, 0.9, t);
  ctx.save(); ctx.translate(600, 900); ctx.rotate(-0.06); ctx.fillStyle = '#e8edf8'; ctx.fillRect(-55, -14, 110, 14); ctx.fillStyle = ACC; ctx.fillRect(-55, -14, 110, 4); ctx.restore();
  // the agent robot at the table end, hopeful with a shopping bag, then deflates
  const sad = t > tHi + 0.2;
  const RX = 800;
  K.drawRobot(ctx, RX, feet, 0.85, { t, state: sad ? 'thinking' : 'idle', seed: 5, flip: true });
  const bob = sad ? 8 : 3 * Math.sin(t * 3);
  shoppingBag(ctx, RX - 70, feet - 80 + bob, 0.72, ACC, H);
  const ap = K.popIn(t, 0.1, 0.4);
  if (ap > 0) K.drawLabel(ctx, RX, 792, Math.min(1.05, ap), { text: 'AI agent', size: 26 });
  ctx.restore();
}

function shoppingBag(ctx, x, y, s, ACC, H) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#1b1f33'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -60, 18, Math.PI, 0); ctx.stroke();
  H.roundRect(ctx, -34, -62, 68, 70, 8); ctx.fillStyle = ACC; ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(18, -62, 16, 70);
  ctx.restore();
}
