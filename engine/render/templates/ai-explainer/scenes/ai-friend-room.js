// Scene "ai-friend-room" (full frame). Night bedroom: a stylised cartoon teen sits on the edge of a bed with a phone;
// a generic "AI friend" (a soft blob avatar with dot eyes, never a brand, never the Token robot) lives in the chat.
// modes:
//  hook    (cold open, 1 beat) at frame 0 the teen is typing, a big floating phone shows the AI-friend chat (reply bubble
//          popping, hearts floating up) while a "Group chat · 12 new" banner sits greyed and ignored at the top; a big
//          accent stat card ("1 IN 3" + sub) is already slamming in and settles by ~0.6 s.
//  lonely  (1 beat) split room: left teen with an AI-friend avatar beside them, right teen without; labels pop; on
//          cloudCue a dark rain cloud ("Lonely") grows over the left teen (a small faint one over the right), the
//          verdict pill lands; on adjustCue a tick card ("Friendship quality: accounted for") rises between them.
//  caveat  (1 beat) teen on the bed and the AI-friend avatar facing each other; a "SURVEY, NOT PROOF" stamp lands on
//          stampCue; a top arrow teen -> AI (a) and a bottom arrow AI -> teen (b) draw on their cues, each with a "?" pill;
//          on cCue both dim and a "Something else?" pill with a pulsing "?" pops between them. Ends settled.
// params: mode, big ("1 IN 3"), bigSub, bot ("AI friend"), group ("Group chat"), unread (12), ask, reply,
//   left, right, cloud, verdict, adjust, a, b, c, stamp; cues: splitCue, cloudCue, adjustCue, stampCue, aCue, bCue, cCue
// Fits: AI companions / chatbot friendship / loneliness / teen screen-life survey stories.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const mode = P.mode || 'hook';
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const BOT = '#b79bff', BOTS = '#8f6fe6';

  ctx.save();
  if (mode === 'hook') K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.02, x: 495, y: 735 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 490, y: 740 }]);
  K.world.room(ctx, { t, time: 'night', window: mode !== 'lonely', picture: false, lamp: false, plant: false, wall: '#232847', floor: '#181c36' });
  // fairy lights along the top of the wall (secondary life)
  for (let i = 0; i < 14; i++) {
    const x = 40 + i * 75, y = 395 + Math.sin(i * 0.9) * 10, on = 0.55 + 0.45 * Math.sin(t * 2.2 + i * 1.7);
    K.glow(ctx, x, y, 26, i % 2 ? '#ffd98a' : '#ff9ecb', 0.25 * on);
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fillStyle = rgba(i % 2 ? '#ffd98a' : '#ff9ecb', 0.5 + 0.5 * on); ctx.fill();
  }

  if (mode === 'hook') drawHook();
  else if (mode === 'lonely') drawLonely();
  else drawCaveat();
  ctx.restore();

  // ======================================================================== hook
  function drawHook() {
    bed(70, 470, 905);
    const TX = 255, TY = 1000;
    teen(TX, TY, 1.5, { typing: 1.4, mood: 'happy', look: 0.8 });
    K.glow(ctx, TX + 14, TY - 205, 80, BOT, 0.3 + 0.08 * Math.sin(t * 5));
    // the big phone
    const PX0 = 505, PX1 = 905, PY0 = 470, PY1 = 1035;
    ctx.save(); ctx.translate(0, K.bob(t, 4, 1.2));
    const S = phone(PX0, PY0, PX1, PY1, P.bot || 'AI friend', t);
    // group chat banner: there from frame 0, greyed and ignored, unread count ticking up
    const unread = Math.round((P.unread || 12) - 3 + clamp(t / 2.2) * 3);
    const by = S.y0 + 96;
    ctx.save(); ctx.globalAlpha = 0.72;
    roundRect(ctx, S.x0 + 12, by, S.w - 24, 70, 18); ctx.fillStyle = '#c9cede'; ctx.fill();
    ctx.beginPath(); ctx.arc(S.x0 + 46, by + 35, 18, 0, Math.PI * 2); ctx.fillStyle = '#8a93ad'; ctx.fill();
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.arc(S.x0 + 38 + k * 8, by + 35, 3.4, 0, Math.PI * 2); ctx.fillStyle = '#e8ebf3'; ctx.fill(); }
    const g = H.fitText(ctx, P.group || 'Group chat', 'ui', 24, 18, S.w - 160);
    ctx.font = g.font; ctx.fillStyle = '#4a5270'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(g.text, S.x0 + 74, by + 26);
    ctx.font = H.font('body', 19); ctx.fillStyle = '#6b738f'; ctx.fillText('unread', S.x0 + 74, by + 50);
    ctx.restore();
    const bp = 1 + 0.12 * Math.max(0, Math.sin(t * 6));
    ctx.save(); ctx.translate(S.x1 - 46, by + 35); ctx.scale(bp, bp);
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fillStyle = '#e5484d'; ctx.fill();
    ctx.font = H.font('ui', 22); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(unread), 0, 1);
    ctx.restore();
    // chat: user bubble then the AI friend's warm reply popping in, typing dots after
    let y = by + 96;
    y = bubble(S, y, P.ask || 'rough day tbh', true, 1);
    const rp = K.popIn(t, -0.3, 0.45);
    y = bubble(S, y + 14, P.reply || "I'm here. Want to talk?", false, rp);
    const dp = K.popIn(t, 1.2, 0.35);
    if (dp > 0) {
      ctx.save(); ctx.globalAlpha = clamp(dp);
      roundRect(ctx, S.x0 + 74, y + 18, 96, 48, 24); ctx.fillStyle = '#e6e1fb'; ctx.fill();
      for (let k = 0; k < 3; k++) { const j = Math.max(0, Math.sin(t * 9 - k * 0.8)) * 6; ctx.beginPath(); ctx.arc(S.x0 + 100 + k * 22, y + 42 - j, 6, 0, Math.PI * 2); ctx.fillStyle = BOTS; ctx.fill(); }
      ctx.restore();
    }
    ctx.restore();
    // hearts floating up from the phone
    for (let i = 0; i < 6; i++) {
      const life = ((t * 0.55 + i / 6) % 1), x = 330 + 130 * H.hash(i, 3) + Math.sin(t * 2 + i) * 14, yy = 860 - life * 170;
      heart(x, yy, 14 + 8 * H.hash(i, 5), rgba('#ff7eb6', 0.85 * Math.sin(life * Math.PI)));
    }
    // the big stat card: already slamming in at frame 0, settled by ~0.6 s
    const land = clamp((t + 0.25) / 0.7);
    const sc = 1 + 0.9 * Math.pow(1 - H.easeOutCubic(land), 2);
    const CX = 300, CY = 545;
    ctx.save(); ctx.translate(CX, CY); ctx.rotate(-0.04); ctx.scale(sc, sc); ctx.globalAlpha = clamp(land * 2.5);
    K.glow(ctx, 0, 0, 220, ACC, 0.25);
    roundRect(ctx, -165, -95, 330, 190, 28); ctx.fillStyle = ACC; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.stroke();
    const bf = H.fitText(ctx, P.big || '1 IN 3', 'display', 100, 60, 300);
    ctx.font = bf.font; ctx.fillStyle = '#10121f'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(bf.text, 0, 30);
    const sf = H.fitText(ctx, P.bigSub || 'use AI as a friend', 'bold', 30, 20, 300);
    ctx.font = sf.font; ctx.fillText(sf.text, 0, 74);
    ctx.restore();
    // impact burst
    const b = (land - 0.55) / 0.4;
    if (b > 0 && b < 1) {
      ctx.strokeStyle = rgba(ACC, 1 - b); ctx.lineWidth = 6; ctx.lineCap = 'round';
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r0 = 215 + 50 * b; ctx.beginPath(); ctx.moveTo(CX + Math.cos(a) * r0, CY + Math.sin(a) * r0 * 0.55); ctx.lineTo(CX + Math.cos(a) * (r0 + 24), CY + Math.sin(a) * (r0 + 24) * 0.55); ctx.stroke(); }
    }
  }

  // ======================================================================== lonely
  function drawLonely() {
    const tSplit = at(P.splitCue, 1.3) - 0.2, tCloud = at(P.cloudCue, D * 0.5) - 0.5, tAdj = at(P.adjustCue, D * 0.75) - 0.3;
    // two little beds, left and right
    const LX = 270, RX = 700, FY = 1005;
    // divider
    const dv = clamp((t - tSplit + 0.6) / 0.5);
    ctx.save(); ctx.strokeStyle = rgba('#ffffff', 0.18 * dv); ctx.lineWidth = 4; ctx.setLineDash([14, 14]);
    ctx.beginPath(); ctx.moveTo(487, 430); ctx.lineTo(487, 430 + 390 * dv); ctx.stroke(); ctx.restore();
    bed(95, 420, FY - 85, 0.9); bed(560, 885, FY - 85, 0.9);
    // left teen: with an AI friend avatar floating beside them
    const cloudK = clamp((t - tCloud) / 0.8);
    teen(LX, FY, 1.3, { typing: t < tCloud ? 1 : 0.3, mood: cloudK > 0.3 ? 'worried' : 'neutral', look: 0.8, skin: 2, hair: 1, hairStyle: 'curly', shirt: '#4f8cff', seed: 3 });
    botAvatar(LX + 150, 745 + K.bob(t, 6, 1.4), 0.75, t, 1);
    // right teen: no AI friend
    teen(RX, FY, 1.3, { typing: 0.6, mood: 'neutral', look: -0.6, skin: 0, hair: 3, hairStyle: 'long', shirt: '#e88a3c', seed: 9, flip: true });
    // labels
    const lp = K.popIn(t, Math.max(0.1, tSplit), 0.45), rpp = K.popIn(t, Math.max(0.25, tSplit + 0.25), 0.45);
    if (lp > 0) K.drawLabel(ctx, LX, 480, lp, { text: P.left || 'AI as a friend', size: 28, accent: true });
    if (rpp > 0) K.drawLabel(ctx, RX, 480, rpp, { text: P.right || 'No AI friend', size: 28 });
    // clouds: big + dark on the left, small + faint on the right
    if (cloudK > 0) {
      cloud(LX, 640, 0.5 + 0.32 * H.easeOutBack(cloudK), 0.95, true, P.cloud || 'Lonely');
      cloud(RX, 650, 0.45 * H.easeOutCubic(cloudK), 0.45, false, '');
    }
    const vp = K.popIn(t, tCloud + 0.7, 0.45);
    if (vp > 0) {
      ctx.save(); ctx.globalAlpha = clamp(vp * 1.5) * (1 - 0.15 * clamp((t - tAdj) / 0.4));
      const txt = P.verdict || 'More likely to report loneliness';
      const f = H.fitText(ctx, txt, 'bold', 30, 22, 620);
      ctx.font = f.font; const w = ctx.measureText(f.text).width + 60;
      ctx.translate(487, 538); ctx.scale(0.85 + 0.15 * vp, 0.85 + 0.15 * vp);
      roundRect(ctx, -w / 2, -34, w, 68, 34); ctx.fillStyle = 'rgba(10,12,22,0.92)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
      ctx.restore();
    }
    // adjusted-for card rises between the two
    const ap = clamp((t - tAdj) / 0.55);
    if (ap > 0) {
      const e = H.easeOutBack(ap), cx = 487, cy = 905 + (1 - e) * 80;
      ctx.save(); ctx.globalAlpha = clamp(ap * 2);
      const lines = H.wrap(ctx, P.adjust || 'Friendship quality: accounted for', 'bold', 27, 230);
      const h = 36 + lines.length * 33;
      roundRect(ctx, cx - 150, cy - h / 2, 300, h, 22); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx - 150, cy - h / 2, 26, 0, Math.PI * 2); ctx.fillStyle = '#2f9e5b'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      K.pathDraw(ctx, [[cx - 162, cy - h / 2], [cx - 153, cy - h / 2 + 9], [cx - 137, cy - h / 2 - 9]], clamp((t - tAdj - 0.3) / 0.3));
      ctx.font = H.font('bold', 27); ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      lines.forEach((ln, i) => ctx.fillText(ln, cx + 6, cy - h / 2 + 44 + i * 33));
      ctx.restore();
    }
  }

  // ======================================================================== caveat
  function drawCaveat() {
    const tStamp = at(P.stampCue, 1.0) - 0.35, tA = at(P.aCue, D * 0.35) - 0.3, tB = at(P.bCue, D * 0.6) - 0.3, tC = at(P.cCue, D * 0.78) - 0.3;
    bed(70, 470, 905);
    const TX = 255, TY = 1000;
    teen(TX, TY, 1.5, { typing: 0, mood: t > tA ? 'worried' : 'neutral', look: 0.9 });
    const BX = 745, BY = 760 + K.bob(t, 7, 1.3);
    K.glow(ctx, BX, BY, 150, BOT, 0.22);
    botAvatar(BX, BY, 1.25, t, 1);
    // arrows (dim when "something else" appears)
    const dim = 1 - 0.55 * clamp((t - tC) / 0.4);
    const top = K.bezier(370, 690, 450, 560, 590, 560, 660, 670, 30);
    const bot = K.bezier(650, 860, 580, 960, 440, 960, 360, 880, 30);
    arrow(top, clamp((t - tA) / 0.6), dim);
    arrow(bot, clamp((t - tB) / 0.6), dim);
    qPill(515, 600, K.popIn(t, tA + 0.3, 0.45), P.a || 'Lonely, so turn to AI?', dim, false);
    qPill(510, 925, K.popIn(t, tB + 0.3, 0.45), P.b || 'AI adds to loneliness?', dim, false);
    const cp = K.popIn(t, tC, 0.5);
    if (cp > 0) {
      const pulse = 1 + 0.06 * Math.sin((t - tC) * 6);
      ctx.save(); ctx.translate(510, 765); ctx.scale(pulse, pulse); ctx.translate(-510, -765);
      qPill(510, 765, cp, P.c || 'Something else?', 1, true);
      ctx.restore();
    }
    // the stamp
    const land = clamp((t - tStamp) / 0.5);
    if (land > 0) {
      const s = 1 + 1.2 * Math.pow(1 - H.easeOutCubic(land), 2);
      ctx.save(); ctx.translate(487, 478); ctx.rotate(-0.05); ctx.scale(s, s); ctx.globalAlpha = clamp(land * 3);
      const f = H.fitText(ctx, P.stamp || 'SURVEY, NOT PROOF', 'display', 50, 30, 640);
      ctx.font = f.font; const w = ctx.measureText(f.text).width + 64;
      roundRect(ctx, -w / 2, -46, w, 92, 14); ctx.fillStyle = 'rgba(16,18,31,0.9)'; ctx.fill();
      ctx.lineWidth = 7; ctx.strokeStyle = ACC; roundRect(ctx, -w / 2 + 8, -38, w - 16, 76, 10); ctx.stroke();
      ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 3);
      ctx.restore();
    }
  }

  // ======================================================================== helpers
  function teen(x, y, s, o) {
    K.drawPerson(ctx, x, y, s, Object.assign({ pose: 'sit-phone', seat: false, t, skin: 3, hair: 0, hairStyle: 'short', shirt: '#2fb39a', seed: 21 }, o));
  }
  function bed(x0, x1, top, sc = 1) {
    const h = 95 * sc, fy = top + h + 20;
    K.shadow(ctx, (x0 + x1) / 2, fy, (x1 - x0) * 1.05);
    // headboard
    roundRect(ctx, x0 - 10, top - 150 * sc, 34, 150 * sc + h + 20, 12); ctx.fillStyle = '#5a4a8a'; ctx.fill();
    // frame + mattress + blanket
    roundRect(ctx, x0, top + h - 10, x1 - x0, 30, 10); ctx.fillStyle = '#3d3366'; ctx.fill();
    roundRect(ctx, x0 + 10, top, x1 - x0 - 20, h, 20); ctx.fillStyle = '#e9ecf6'; ctx.fill();
    roundRect(ctx, x0 + 120 * sc, top - 6, x1 - x0 - 120 * sc - 4, h + 8, 22); ctx.fillStyle = '#6a7fd6'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let i = 0; i < 4; i++) ctx.fillRect(x0 + 140 * sc + i * 60 * sc, top - 6, 20 * sc, h + 8);
    // pillow
    roundRect(ctx, x0 + 26, top - 34 * sc, 100 * sc, 46 * sc, 20); ctx.fillStyle = '#f7f8fc'; ctx.fill();
    // legs
    roundRect(ctx, x0 + 10, top + h + 18, 16, 20, 4); ctx.fillStyle = '#2a2448'; ctx.fill();
    roundRect(ctx, x1 - 26, top + h + 18, 16, 20, 4); ctx.fill();
  }
  function phone(x0, y0, x1, y1, title, tt) {
    const w = x1 - x0;
    roundRect(ctx, x0 - 4, y0 + 10, w + 8, y1 - y0, 46); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    roundRect(ctx, x0, y0, w, y1 - y0, 44); ctx.fillStyle = '#0e1122'; ctx.fill();
    const sx0 = x0 + 12, sx1 = x1 - 12, sy0 = y0 + 12;
    roundRect(ctx, sx0, sy0, sx1 - sx0, y1 - y0 - 24, 34); ctx.fillStyle = '#f4f2fd'; ctx.fill();
    ctx.save(); roundRect(ctx, sx0, sy0, sx1 - sx0, 78, 34); ctx.clip(); ctx.fillStyle = '#e6e1fb'; ctx.fillRect(sx0, sy0, sx1 - sx0, 78); ctx.restore();
    botAvatar(sx0 + 44, sy0 + 40, 0.3, tt, 1);
    ctx.font = H.font('ui', 27); ctx.fillStyle = '#231b46'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(title, sx0 + 80, sy0 + 32);
    ctx.font = H.font('body', 19); ctx.fillStyle = '#2f9e5b'; ctx.fillText('online', sx0 + 80, sy0 + 58);
    return { x0: sx0, x1: sx1, y0: sy0, w: sx1 - sx0 };
  }
  function bubble(S, y, text, mine, p) {
    if (p <= 0) return y;
    const maxW = S.w - 120, lines = H.wrap(ctx, text, 'bold', 28, maxW - 44);
    ctx.font = H.font('bold', 28);
    const bw = Math.min(maxW, Math.max(...lines.map((l) => ctx.measureText(l).width)) + 44), bh = 26 + lines.length * 36;
    const x = mine ? S.x1 - 18 - bw : S.x0 + 74;
    ctx.save(); ctx.globalAlpha = clamp(p * 1.5);
    const ox = mine ? x + bw : x, oy = y + bh;
    ctx.translate(ox, oy); ctx.scale(0.7 + 0.3 * p, 0.7 + 0.3 * p); ctx.translate(-ox, -oy);
    if (!mine) botAvatar(S.x0 + 40, y + bh - 22, 0.24, t, 1);
    roundRect(ctx, x, y, bw, bh, 24); ctx.fillStyle = mine ? '#4f8cff' : '#ffffff'; ctx.fill();
    if (!mine) { ctx.lineWidth = 3; ctx.strokeStyle = BOT; ctx.stroke(); }
    ctx.fillStyle = mine ? '#ffffff' : '#231b46'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    lines.forEach((ln, i) => ctx.fillText(ln, x + 22, y + 44 + i * 36));
    ctx.restore();
    return y + bh;
  }
  // generic AI-friend avatar: a soft rounded blob with dot eyes, a smile and a sparkle (no brand, not Token)
  function botAvatar(x, y, s, tt, p) {
    if (p <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const sq = 1 + 0.04 * Math.sin(tt * 3);
    ctx.scale(sq, 2 - sq);
    ctx.beginPath();
    ctx.moveTo(-70, -10); ctx.bezierCurveTo(-70, -80, 70, -80, 70, -10); ctx.bezierCurveTo(70, 55, 30, 70, 0, 70); ctx.bezierCurveTo(-30, 70, -70, 55, -70, -10);
    ctx.fillStyle = BOT; ctx.fill();
    ctx.beginPath(); ctx.ellipse(-22, -40, 26, 14, -0.4, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
    const blink = ((tt * 0.8 + x * 0.001) % 3.2) < 0.12;
    ctx.fillStyle = '#231b46';
    for (const ex of [-22, 22]) { ctx.beginPath(); if (blink) ctx.rect(ex - 9, -4, 18, 4); else ctx.ellipse(ex, -4, 8, 11, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.strokeStyle = '#231b46'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 14, 16, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
    ctx.fillStyle = 'rgba(255,120,170,0.45)'; ctx.beginPath(); ctx.arc(-40, 16, 9, 0, Math.PI * 2); ctx.arc(40, 16, 9, 0, Math.PI * 2); ctx.fill();
    // sparkle
    const sp = 0.7 + 0.3 * Math.sin(tt * 4);
    ctx.save(); ctx.translate(58, -58); ctx.scale(sp, sp); ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(0, -16); ctx.quadraticCurveTo(3, -3, 16, 0); ctx.quadraticCurveTo(3, 3, 0, 16); ctx.quadraticCurveTo(-3, 3, -16, 0); ctx.quadraticCurveTo(-3, -3, 0, -16); ctx.fill();
    ctx.restore();
    ctx.restore();
  }
  function heart(x, y, r, col) {
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.beginPath();
    ctx.moveTo(0, r * 0.9); ctx.bezierCurveTo(-r * 1.4, -r * 0.1, -r * 0.7, -r * 1.2, 0, -r * 0.45); ctx.bezierCurveTo(r * 0.7, -r * 1.2, r * 1.4, -r * 0.1, 0, r * 0.9);
    ctx.fill(); ctx.restore();
  }
  function cloud(x, y, s, a, rain, text) {
    if (s <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = a;
    if (rain) {
      for (let i = 0; i < 7; i++) { const ph = (t * 1.6 + i * 0.37) % 1, dx = -90 + i * 30; ctx.fillStyle = rgba('#8caaff', 0.8 * (1 - ph)); roundRect(ctx, dx - 3, 50 + ph * 70, 6, 22, 3); ctx.fill(); }
    }
    ctx.fillStyle = rain ? '#4b5275' : '#6c7397';
    for (const [cx, cy, r] of [[-70, 10, 48], [-20, -20, 62], [45, -8, 55], [90, 18, 40], [10, 26, 52]]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); }
    if (text) {
      ctx.font = H.font('bold', 34); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 5, 8);
    }
    ctx.restore();
  }
  function arrow(pts, p, a) {
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = ACC; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.setLineDash([22, 16]); ctx.lineDashOffset = -t * 40;
    K.pathDraw(ctx, pts, p);
    ctx.setLineDash([]);
    if (p > 0.95) {
      const n = pts.length, [x1, y1] = pts[n - 1], [x0, y0] = pts[n - 3], ang = Math.atan2(y1 - y0, x1 - x0);
      ctx.translate(x1, y1); ctx.rotate(ang); ctx.fillStyle = ACC;
      ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-18, -18); ctx.lineTo(-18, 18); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  function qPill(x, y, p, text, a, strong) {
    if (p <= 0) return;
    ctx.save(); ctx.globalAlpha = clamp(p * 1.5) * a;
    const f = H.fitText(ctx, text, 'bold', strong ? 32 : 28, 20, 400);
    ctx.font = f.font; const w = ctx.measureText(f.text).width + 92, h = strong ? 72 : 62;
    ctx.translate(x, y); ctx.scale(0.8 + 0.2 * p, 0.8 + 0.2 * p);
    roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = strong ? ACC : 'rgba(10,12,22,0.92)'; ctx.fill();
    if (!strong) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke(); }
    ctx.beginPath(); ctx.arc(-w / 2 + 34, 0, 20, 0, Math.PI * 2); ctx.fillStyle = strong ? '#10121f' : ACC; ctx.fill();
    ctx.font = H.font('display', 26); ctx.fillStyle = strong ? ACC : '#10121f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', -w / 2 + 34, 2);
    ctx.font = f.font; ctx.fillStyle = strong ? '#10121f' : '#ffffff'; ctx.textAlign = 'left'; ctx.fillText(f.text, -w / 2 + 66, 2);
    ctx.restore();
  }
}
