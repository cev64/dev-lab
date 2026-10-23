// Scene "inbox-agent" (full frame, 1 beat, two phases). Phase A, night office: a big desk monitor shows a generic
// inbox (rows of mail). A small chat window floats beside it with a "chatbot on the side" tag; on sideCue the tag
// strikes through. On insideCue the robot hops from the chat window INTO the inbox: rows get sorted and ticked, a
// reply flies out, "inside your inbox" pill. Phase B (from monthCue, alias julyCue): pan to a customer-service room: 10 agents with
// headsets in 2 rows; a month pill; on cutCue one desk in ten empties (the person walks off with a box) and a share
// pill lands; on firstCue a second hedged pill. Nobody is drawn sad-faced on purpose: neutral/worried only.
// params: side ("Chatbot on the side"), inside ("Agent inside your inbox"), month ("Earlier this year"), cut ("Support
//         staff cut"), first ("Company ties cuts to AI"), sideCue, insideCue, monthCue (alias julyCue), cutCue, firstCue
// Fits: an AI agent with access to email/calendar vs a chat window; AI-linked job cuts as context.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tSide = at(P.sideCue, D * 0.2) - 0.1, tIn = Math.max(tSide + 0.8, at(P.insideCue, D * 0.33) - 0.2);
  const tJuly = Math.max(tIn + 1.5, at(P.monthCue || P.julyCue, D * 0.52) - 0.35), tCut = Math.max(tJuly + 0.6, at(P.cutCue, D * 0.6) - 0.1);
  const tFirst = Math.max(tCut + 1, at(P.firstCue, D * 0.82) - 0.1);
  const sw = clamp((t - tJuly) / 0.45);

  if (sw < 1) {
    ctx.save(); ctx.globalAlpha = 1 - sw;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tJuly, zoom: 1.06, x: 470, y: 720 }]);
    K.world.room(ctx, { t, time: 'night', floorY: 1000, lamp: false, plant: true, picture: false });
    // monitor on a desk
    const MX = 375, MY0 = 440, MW = 520, MH = 390;
    K.drawDesk(ctx, MX, 1045, 1.6);
    roundRect(ctx, MX - 16, MY0 + MH, 32, 1045 - 110 * 1.6 - MY0 - MH, 4); ctx.fillStyle = '#1b2036'; ctx.fill();
    roundRect(ctx, MX - MW / 2 - 14, MY0 - 14, MW + 28, MH + 28, 22); ctx.fillStyle = '#1b2036'; ctx.fill();
    roundRect(ctx, MX - MW / 2, MY0, MW, MH, 12); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    // inbox header + rows
    ctx.fillStyle = '#283152'; roundRect(ctx, MX - MW / 2, MY0, MW, 60, 12); ctx.fill(); ctx.fillRect(MX - MW / 2, MY0 + 40, MW, 20);
    ctx.font = H.font('ui', 30); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Inbox', MX - MW / 2 + 24, MY0 + 31);
    const inside = clamp((t - tIn - 0.5) / 0.4);
    for (let i = 0; i < 5; i++) {
      const y = MY0 + 92 + i * 62;
      const done = clamp((t - (tIn + 0.8 + i * 0.35)) / 0.25);
      roundRect(ctx, MX - MW / 2 + 20, y - 24, MW - 40, 50, 10); ctx.fillStyle = done > 0 ? H.mixHex('#e6e9f3', ACC, 0.25 * done) : '#e6e9f3'; ctx.fill();
      ctx.save(); ctx.translate(MX - MW / 2 + 52, y + 1);
      roundRect(ctx, -18, -12, 36, 24, 4); ctx.fillStyle = '#e8786a'; ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-16, -10); ctx.lineTo(0, 2); ctx.lineTo(16, -10); ctx.stroke(); ctx.restore();
      ctx.fillStyle = '#9aa3bd'; ctx.fillRect(MX - MW / 2 + 90, y - 10, 180 + 60 * H.hash(i, 3), 8); ctx.fillRect(MX - MW / 2 + 90, y + 6, 120 + 40 * H.hash(i, 5), 6);
      if (done > 0) { ctx.beginPath(); ctx.arc(MX + MW / 2 - 50, y + 1, 16 * done, 0, Math.PI * 2); ctx.fillStyle = '#3fbf7f'; ctx.fill();
        ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(MX + MW / 2 - 57, y + 1); ctx.lineTo(MX + MW / 2 - 51, y + 7); ctx.lineTo(MX + MW / 2 - 42, y - 6); ctx.stroke(); }
    }
    // robot inside the monitor (bottom-right corner, peeking up), after hopping in
    const hop = clamp((t - tIn) / 0.6);
    const CWX = 790, CWY = 780; // chat window centre (side)
    if (hop < 1) {
      // side chat window with the robot in it
      const pc = K.popIn(t, 0.2, 0.45);
      ctx.save(); ctx.translate(CWX, CWY); ctx.scale(Math.min(1.04, pc), Math.min(1.04, pc));
      roundRect(ctx, -105, -130, 210, 250, 22); ctx.fillStyle = '#2a2f45'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke();
      ctx.fillStyle = '#a08be0'; roundRect(ctx, -85, -110, 120, 34, 14); ctx.fill(); ctx.fillStyle = '#5b6aa8'; roundRect(ctx, -30, -66, 110, 34, 14); ctx.fill();
      ctx.restore();
    }
    {
      const sx = CWX, sy = CWY + 115, ex = MX + MW / 2 - 90, ey = MY0 + MH - 8;
      const x = lerp(sx, ex, H.easeInOutCubic(hop)), y = lerp(sy, ey, H.easeInOutCubic(hop)) - Math.sin(hop * Math.PI) * 160;
      const s = lerp(0.42, 0.7, hop);
      if (hop > 0.95) { ctx.save(); roundRect(ctx, MX - MW / 2, MY0, MW, MH, 12); ctx.clip(); }
      K.drawRobot(ctx, x, y + (hop > 0.95 ? 40 : 0), s, { t, state: hop >= 1 ? 'working' : 'happy', seed: 4, flip: true });
      if (hop > 0.95) ctx.restore();
      if (hop > 0 && hop < 1) K.glow(ctx, x, y - 60, 90, ACC, 0.5);
    }
    // a person at the monitor (left)
    K.drawPerson(ctx, 140, 1045, 1.2, { t, pose: t > tIn + 1 ? 'point' : 'stand', mood: t > tIn + 1 ? 'shocked' : 'neutral', skin: 0, hair: 2, shirt: 0, hairStyle: 'short', seed: 21, look: 1 });
    ctx.restore();
    // labels
    ctx.save(); ctx.globalAlpha = 1 - sw;
    const ps = K.popIn(t, 0.4, 0.45), psOut = clamp((t - tIn) / 0.3);
    if (ps > 0 && psOut < 1) {
      ctx.save(); ctx.globalAlpha = (1 - sw) * (1 - psOut);
      const sideTxt = P.side || 'Chatbot on the side'; K.drawLabel(ctx, 770, 625, ps, { text: sideTxt, size: 26 });
      ctx.font = H.font('ui', 26); const lw = ctx.measureText(sideTxt).width;
      const st = clamp((t - tSide) / 0.3);
      if (st > 0) { ctx.strokeStyle = '#ff6b5e'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(770 - lw / 2, 602); ctx.lineTo(770 - lw / 2 + lw * st, 602); ctx.stroke(); }
      ctx.restore();
    }
    const pi = K.popIn(t, tIn + 0.5, 0.45);
    if (pi > 0) K.drawLabel(ctx, 487, 1000, pi, { text: P.inside || 'Agent inside your inbox', size: 34, accent: true });
    ctx.restore();
  }

  if (sw > 0) {
    ctx.save(); ctx.globalAlpha = sw;
    K.camera(ctx, t, [{ t: tJuly, zoom: 1.08, x: 487, y: 760 }, { t: tJuly + 1.5, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 760 }]);
    K.world.office(ctx, { t, time: 'day' });
    // two rows of 5 headset agents at a long desk
    const leaver = 7; // index of the desk that empties
    for (let row = 0; row < 2; row++) {
      const fy = row === 0 ? 870 : 1045, s = row === 0 ? 0.68 : 0.9, dx = row === 0 ? 150 : 175, x0 = row === 0 ? 187 : 137;
      // long desk
      roundRect(ctx, x0 - 90, fy - 70 * s, dx * 4 + 180, 16, 6); ctx.fillStyle = '#3d4570'; ctx.fill();
      for (let i = 0; i < 5; i++) {
        const idx = row * 5 + i, x = x0 + i * dx;
        // monitor
        roundRect(ctx, x + 18 * s, fy - 150 * s, 70 * s, 52 * s, 6); ctx.fillStyle = '#1c2033'; ctx.fill();
        roundRect(ctx, x + 22 * s, fy - 146 * s, 62 * s, 44 * s, 4); ctx.fillStyle = rgba(ACC, 0.18); ctx.fill();
        if (idx === leaver) {
          const lv = clamp((t - tCut - 0.3) / 2.2);
          const px = lerp(x - 20 * s, 1010, H.easeInOutCubic(lv));
          ctx.save(); ctx.globalAlpha = sw * (1 - clamp((lv - 0.85) / 0.15));
          K.drawPerson(ctx, px, fy, s, { t, pose: lv > 0 ? 'stand' : 'sit', walk: lv > 0 && lv < 1 ? t - tCut : undefined, mood: 'worried', skin: 2, hair: 3, shirt: 4, hairStyle: 'short', seed: idx });
          if (lv > 0) { // carrying a box
            roundRect(ctx, px - 34 * s, fy - 150 * s, 68 * s, 46 * s, 4); ctx.fillStyle = '#c9965c'; ctx.fill();
            ctx.fillStyle = '#a97b45'; ctx.fillRect(px - 34 * s, fy - 150 * s, 68 * s, 8 * s);
          } else headset(ctx, x - 20 * s, fy, s, false, ACC);
          ctx.restore();
          if (lv > 0.3) { // the empty chair
            roundRect(ctx, x - 44 * s, fy - 80 * s, 50 * s, 14 * s, 5); ctx.fillStyle = '#59628a'; ctx.fill();
          }
        } else {
          K.drawPerson(ctx, x - 20 * s, fy, s, { t, pose: 'sit', talk: (Math.sin(t * 2 + idx) * 0.5 + 0.5) * 0.6, mood: t > tCut + 0.8 ? 'worried' : 'neutral', skin: idx % 5, hair: (idx * 3) % 5, shirt: (idx + 1) % 5, hairStyle: ['short', 'long', 'bun', 'curly'][idx % 4], seed: idx, look: 0.3 });
          headset(ctx, x - 20 * s, fy, s, true, ACC);
        }
      }
    }
    ctx.restore();
    ctx.save(); ctx.globalAlpha = sw;
    const pm = K.popIn(t, tJuly + 0.3, 0.45);
    if (pm > 0) K.drawLabel(ctx, 487, 480, pm, { text: P.month || 'Earlier this year', size: 32 });
    const pc = K.popIn(t, tCut + 0.2, 0.5);
    if (pc > 0) K.drawLabel(ctx, 487, 570, pc, { text: P.cut || 'Support staff cut', size: 36, accent: true });
    const pf = K.popIn(t, tFirst, 0.45);
    if (pf > 0) K.drawLabel(ctx, 487, 650, pf, { text: P.first || 'Company ties cuts to AI', size: 30, dot: true });
    ctx.restore();
  }
}

// a headset over a kit person (seated, scale s, anchored at their feet)
function headset(ctx, x, fy, s, seated, ACC) {
  const hy = fy + (seated ? -78 - 64 - 44 : -104 - 64 - 44) * s; // head centre, matches kit proportions
  ctx.save(); ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 6 * s; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(x, hy - 4 * s, 36 * s, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
  ctx.fillStyle = '#2a2f45'; ctx.beginPath(); ctx.arc(x - 35 * s, hy + 4 * s, 9 * s, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(x + 35 * s, hy + 4 * s, 9 * s, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 4 * s; ctx.beginPath(); ctx.moveTo(x - 35 * s, hy + 8 * s); ctx.quadraticCurveTo(x - 30 * s, hy + 34 * s, x - 6 * s, hy + 30 * s); ctx.stroke();
  ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(x - 6 * s, hy + 30 * s, 5 * s, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
