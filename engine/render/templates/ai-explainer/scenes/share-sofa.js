// Scene "share-sofa" (full frame; best as a span of 2 beats: hook + what happened). Living room at night: a person
// on the sofa chats with an AI on their phone. Beat 1 = establishing shot (the hook card sits over the top half).
// Beat 2: a big generic chat-app phone floats in (title bar shows the chat's title), a news pill pops, a finger taps
// the Share button, a link chip (address made of the chat title + random ID) pops out, a "PUBLIC RECORDS" board with
// many address rows appears and the chip flies into it, then an open padlock + "No login needed" pill.
// Fits: shared AI chats / share links that ended up public, "anyone with the link", privacy leaks of shared content.
// Generic app UI, no logos. Titles are illustrative placeholders.
// params (all optional): app ("AI chat"), title ("Q3 revenue review"), slug ("q3-revenue-review"), id ("7b1e42"),
//   news ("Chat sharing: paused"), finder ("Found by: security firm"), board ("PUBLIC RECORDS"),
//   rows (filler address rows), open ("No login needed"), share ("Share")
//   cues (narration words; else fractions of the scene): newsCue, tapCue, finderCue, boardCue, flyCue, openCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, roundRect, mixHex } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tB = info.beats && info.beats[1] ? info.beats[1].t0 : Math.min(3, D * 0.2);
  const tNews = at(P.newsCue, tB + D * 0.05) - 0.15;
  const tTap = at(P.tapCue, tB + D * 0.3) - 0.3;
  const tFind = at(P.finderCue, tB + D * 0.35) - 0.2;
  const tBoard = at(P.boardCue, tB + D * 0.55) - 0.4;
  const tFly = at(P.flyCue, tB + D * 0.62) - 0.2;
  const tOpen = at(P.openCue, tB + D * 0.85) - 0.5;
  const slug = P.slug || 'q3-revenue-review', id = P.id || '7b1e42';

  ctx.save();
  // camera: start a little wide on the sofa (hook), then settle so the phone has room
  K.camera(ctx, t, [{ t: 0, zoom: 1.12, x: 430, y: 860 }, { t: tB - 0.2, zoom: 1.12, x: 430, y: 860 }, { t: tB + 0.8, zoom: 1.0 }, { t: D, zoom: 1.02, x: 487, y: 730 }]);
  const room = K.world.livingRoomNight(ctx, { t, lampOn: true });
  const sx = room.sofa.x, fy = room.sofa.feetY;
  const tapped = t > tTap;
  K.drawPerson(ctx, sx - 190, fy, 1.5, { pose: 'sit-phone', seat: false, t, typing: t < tTap ? 1 : 0, mood: t > tOpen ? 'worried' : 'happy', skin: 3, hair: 1, shirt: 2, hairStyle: 'short', seed: 12, look: t > tBoard ? -0.6 : 0.5 });
  ctx.restore();

  const tPub = at('public', 1.9);
  if (t < tB - 0.2) {
    // establishing: soft glow from the phone + chat bubbles rising from it (below the hook card)
    const pxp = 300, pyp = 815;
    K.glow(ctx, pxp, pyp, 120, ACC, 0.35 + 0.1 * Math.sin(t * 5));
    for (let i = 0; i < 3; i++) {
      const lt = t - 0.2 - i * 0.55; if (lt <= 0) continue;
      const p = K.popIn(lt, 0, 0.35);
      ctx.save(); ctx.globalAlpha = clamp(1 - (lt - 1.8) / 0.6);
      const by = 905 - Math.min(lt, 1.6) * 30 - i * 2;
      roundRect(ctx, 400 + i * 150 - 60 * p, by - 30 * p, 120 * p, 60 * p, 22); ctx.fillStyle = i % 2 ? mixHex(ACC, '#000000', 0.1) : '#e9ecf6'; ctx.fill();
      ctx.restore();
    }
    const lp = K.popIn(t, Math.max(0.3, tPub - 0.2), 0.4);
    if (lp > 0) K.drawLock(ctx, 800, 1000, 0.95 * lp, { open: clamp((t - tPub) / 0.35) });
    return;
  }

  // ------------------------------------------------------------- beat 2: the share
  ctx.fillStyle = 'rgba(8,10,24,0.45)'; ctx.fillRect(0, 0, 1080, 1920);
  const pIn = K.popIn(t, tB, 0.55);
  const cx = 690, top = 470, w = 330, h = 520;
  ctx.save(); ctx.translate(cx, top + h); ctx.scale(pIn, pIn); ctx.translate(-cx, -(top + h));
  ctx.translate(0, K.bob(t, 4, 0.35));
  K.shadow(ctx, cx, top + h + 8, w * 1.1);
  roundRect(ctx, cx - w / 2 - 12, top - 12, w + 24, h + 24, 48); ctx.fillStyle = '#1c2033'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#3b4260'; ctx.stroke();
  roundRect(ctx, cx - w / 2, top, w, h, 38); ctx.fillStyle = '#121527'; ctx.fill();
  ctx.save(); roundRect(ctx, cx - w / 2, top, w, h, 38); ctx.clip();
  ctx.fillStyle = '#1d2240'; ctx.fillRect(cx - w / 2, top, w, 110);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = H.font('ui', 24); ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillText(P.app || 'AI chat', cx, top + 36);
  ctx.font = H.font('display', 30); ctx.fillStyle = '#ffffff';
  const ttl = P.title || 'Q3 revenue review';
  ctx.font = H.font('display', H.fitText(ctx, ttl, 'display', 30, 22, w - 40).size); ctx.fillText(ttl, cx, top + 76);
  // bubbles
  for (let i = 0; i < 4; i++) {
    const me = i % 2 === 1, bw = w * (0.5 + 0.2 * H.hash(i, 5)), bh = 48, by = top + 140 + i * 66;
    const p = K.popIn(t, tB + 0.3 + i * 0.25, 0.35); if (p <= 0) continue;
    const bx = me ? cx + w / 2 - 22 - bw : cx - w / 2 + 22;
    ctx.save(); ctx.globalAlpha = p;
    roundRect(ctx, bx, by, bw, bh, 18); ctx.fillStyle = me ? mixHex(ACC, '#000000', 0.15) : '#2e3557'; ctx.fill();
    ctx.globalAlpha = 0.5 * p; ctx.fillStyle = me ? K.ACCENT.deep : '#ffffff';
    roundRect(ctx, bx + 16, by + 14, bw - 32, 7, 3.5); ctx.fill(); roundRect(ctx, bx + 16, by + 27, (bw - 32) * 0.6, 7, 3.5); ctx.fill();
    ctx.restore();
  }
  // share button
  const press = tapped ? 1 - smooth((t - tTap) / 0.25) * (t < tTap + 0.25 ? 1 : 0) : 0;
  const lit = tapped ? 1 : 0.35 + 0.25 * Math.sin(t * 5);
  const bw2 = w - 80, byy = top + h - 70;
  K.glow(ctx, cx, byy, bw2 * 0.7, ACC, 0.35 * lit);
  ctx.save(); ctx.translate(cx, byy); ctx.scale(1 - 0.08 * press, 1 - 0.08 * press);
  roundRect(ctx, -bw2 / 2, -36, bw2, 72, 36); ctx.fillStyle = tapped ? ACC : '#3a4270'; ctx.fill();
  ctx.font = H.font('display', 32); ctx.fillStyle = tapped ? K.ACCENT.deep : '#ffffff'; ctx.fillText(P.share || 'Share', 14, 2);
  // link icon
  ctx.strokeStyle = tapped ? K.ACCENT.deep : '#ffffff'; ctx.lineWidth = 5;
  for (const dx of [-8, 8]) { roundRect(ctx, -92 + dx - 13, -8, 26, 16, 8); ctx.stroke(); }
  ctx.restore();
  ctx.restore();
  roundRect(ctx, cx - 40, top + 10, 80, 14, 7); ctx.fillStyle = '#0b0d18'; ctx.fill();
  ctx.restore();
  // finger tap
  const fp = H.phase(t, tTap - 0.5, tTap, easeOutCubic), fo = 1 - smooth((t - tTap - 0.5) / 0.4);
  if (fp > 0 && fo > 0) {
    ctx.save(); ctx.globalAlpha = fo; ctx.translate(lerp(cx + 260, cx + 30, fp), lerp(byy + 260, byy + 20, fp));
    ctx.fillStyle = '#e8b48a'; roundRect(ctx, -16, 0, 32, 120, 16); ctx.fill();
    ctx.fillStyle = '#f4d5bd'; roundRect(ctx, -10, 4, 20, 22, 8); ctx.fill();
    ctx.restore();
    if (t > tTap) { const r = (t - tTap) / 0.5; if (r < 1) { ctx.strokeStyle = H.rgba(ACC, 1 - r); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx + 30, byy + 10, 30 + 70 * r, 0, Math.PI * 2); ctx.stroke(); } }
  }

  // news pill at the top
  const np = K.popIn(t, tNews, 0.45), nOut = smooth((t - tFind + 0.3) / 0.3);
  if (np > 0 && nOut < 1) { ctx.save(); ctx.globalAlpha = 1 - nOut; K.drawLabel(ctx, 487, 455, np, { text: P.news || 'Chat sharing: paused', size: 30, accent: true }); ctx.restore(); }

  // link chip: pops above the phone, then flies into the board
  const chipW = 420, chipH = 60;
  const linkChip = (x, y, s, hl) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.glow(ctx, 0, 0, chipW * 0.45, ACC, 0.25 * hl);
    roundRect(ctx, -chipW / 2, -chipH / 2, chipW, chipH, 18); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.font = H.font('ui', 26); ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const a = slug, b = '-' + id;
    const wa = ctx.measureText(a).width, wb = ctx.measureText(b).width, x0 = -(wa + wb) / 2;
    roundRect(ctx, x0 - 8, -22, wa + 16, 44, 10); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = K.ACCENT.deep; ctx.fillText(a, x0, 2);
    ctx.fillStyle = '#59607a'; ctx.fillText(b, x0 + wa + 4, 2);
    ctx.restore();
  };
  const tChip = tTap + 0.25;
  const cp = K.popIn(t, tChip, 0.45);
  // board: static rows, the last slot waits for the chip
  const bp = K.popIn(t, tBoard, 0.5);
  const BX = 62, BY = 478, BW = 440, RH = 46, BH = 60 + 3 * RH + 14;
  const slotY = BY + 60 + 2 * RH + RH / 2;
  if (bp > 0) {
    ctx.save(); ctx.translate(BX + BW / 2, BY + BH); ctx.scale(bp, bp); ctx.translate(-(BX + BW / 2), -(BY + BH));
    roundRect(ctx, BX + 6, BY + 8, BW, BH, 18); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    roundRect(ctx, BX, BY, BW, BH, 18); ctx.fillStyle = '#e9ecf6'; ctx.fill();
    roundRect(ctx, BX, BY, BW, 56, 18); ctx.fillStyle = '#2a2f45'; ctx.fill(); ctx.fillRect(BX, BY + 36, BW, 20);
    ctx.font = H.font('display', 28); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.board || 'PUBLIC RECORDS', BX + BW / 2, BY + 30);
    const rows = P.rows || ['team-offsite-plan-4c2a', 'home-budget-1f7e'];
    ctx.font = H.font('ui', 24); ctx.textAlign = 'left';
    for (let i = 0; i < 3; i++) {
      const y = BY + 60 + i * RH + RH / 2;
      ctx.fillStyle = '#c9cfe0'; roundRect(ctx, BX + 20, y - 7, 14, 14, 4); ctx.fill();
      if (i < 2) { ctx.fillStyle = '#4a5070'; ctx.fillText(rows[i] || '', BX + 46, y + 1); }
      else { ctx.setLineDash([8, 8]); ctx.strokeStyle = '#aab0c4'; ctx.lineWidth = 3; roundRect(ctx, BX + 44, y - 18, BW - 64, 36, 10); ctx.stroke(); ctx.setLineDash([]); }
    }
    ctx.restore();
  }
  if (cp > 0) {
    const fly = H.phase(t, tFly, tFly + 0.8, H.easeInOutCubic);
    const x0 = 290, y0 = 600, x1 = BX + BW / 2 + 12, y1 = slotY;
    const x = lerp(x0, x1, fly), y = lerp(y0, y1, fly) - Math.sin(fly * Math.PI) * 60;
    linkChip(x, y, cp * lerp(1, 0.92, fly), fly >= 1 ? 1 : 0.4);
  }
  // finder pill (who found it)
  const fpill = K.popIn(t, tFind, 0.45);
  if (fpill > 0) {
    K.drawLabel(ctx, 487, 455, fpill, { text: P.finder || 'Found by: security firm', size: 26, dot: true });
  }
  // open padlock + no login
  const op = K.popIn(t, tOpen, 0.5);
  if (op > 0) {
    const ox = 300, oy = 1000;
    K.glow(ctx, ox - 140, oy - 70, 90, ACC, 0.35 * op);
    K.drawLock(ctx, ox - 150, oy - 10, 0.7 * op, { open: clamp((t - tOpen - 0.2) / 0.4) });
    K.drawLabel(ctx, ox + 40, oy - 50, op, { text: P.open || 'No login needed', size: 28, accent: true });
  }
}
