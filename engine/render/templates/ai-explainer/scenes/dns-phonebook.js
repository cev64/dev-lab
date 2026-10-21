// Scene "dns-phonebook" (full frame; best as a span of 2 beats). Dusk street with a giant open "phone book" on a stand.
// Beat 1 (how it leaks): a web-address strip assembles from a highlighted TITLE part and a grey random-ID part (labels
//   under each); a passer-by opens the link on a phone, a dotted signal runs to the book, the book glows with a "DNS"
//   pill and a pen writes the address into it, then the title part in the book lights up ("title and all").
// Beat 2 (scale): camera eases out, a researcher with a magnifying glass walks in and sweeps the pages, the book fills
//   with rows, a big counter counts up ("6,800+") with a caption, a pill qualifies it ("shares, not people"), then the
//   title words on several rows light up ("titles gave it away").
// Fits: DNS / public logs / directories exposing link addresses; any "the address itself gave it away" story.
// Titles and IDs are illustrative placeholders. No real domains.
// params (all optional): slug, id, host, titleTag ("the title"), idTag ("random ID"), dns ("DNS: the internet's phone book"),
//   rows [titles], count (1000), prefix (""), suffix ("+"), countLabel ("share addresses"), note ("Shares, not people"),
//   reveal ("Titles gave it away"), who ("Researchers search")
//   (slug / id / host / rows default to illustrative placeholders; pass the story's own, never real private titles)
//   cues: buildCue, titleCue, openCue, dnsCue, logCue, allCue, whoCue, countCue, countEndCue, noteCue, revealCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, roundRect, rgba, mixHex } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tB = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.5;
  const tBuild = at(P.buildCue, D * 0.08) - 0.2, tTitle = at(P.titleCue, D * 0.15) - 0.2;
  const tOpen = at(P.openCue, D * 0.22) - 0.2, tDns = at(P.dnsCue, D * 0.33) - 0.3;
  const tLog = at(P.logCue, D * 0.38) - 0.2, tAll = at(P.allCue, D * 0.43) - 0.15;
  const tWho = at(P.whoCue, tB + 0.1) - 0.2, tCount = at(P.countCue, tB + 1.2) - 0.2;
  const tCountEnd = at(P.countEndCue, tB + 3.5), tNote = at(P.noteCue, tB + 5.4) - 0.3;
  const tRev = at(P.revealCue, tB + 7.4) - 0.2;
  const slug = P.slug || 'q3-revenue-review', id = P.id || '7b1e42', host = P.host || '.share-site';
  const rowsT = P.rows || ['loan-application', 'staff-vacation-plan', 'call-prep-notes', 'home-sale-budget', 'team-offsite', 'pitch-feedback'];
  const ids = ['c4a9e2', '91f0d3', 'e27b5a', '5d18c0', 'a03f77', '6be241'];

  const z = smooth((t - tB + 0.3) / 1.2);
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 500, y: 760 }, { t: tB - 0.3, zoom: 1.04, x: 500, y: 760 }, { t: tB + 0.9, zoom: 1.0 }, { t: D, zoom: 1.02, x: 487, y: 735 }]);
  K.world.city(ctx, { t, time: 'night', groundY: 1000 });
  ctx.fillStyle = 'rgba(8,10,24,0.35)'; ctx.fillRect(-200, -200, 1480, 2320);

  // ---- the book on a stand
  const BX0 = 210, BX1 = 870, BY0 = 610, BY1 = 900, MID = (BX0 + BX1) / 2;
  const glowA = Math.max(H.phase(t, tDns, tDns + 0.5) * (1 - 0.6 * smooth((t - tLog - 1.5) / 1)), 0);
  ctx.strokeStyle = '#5b4a3a'; ctx.lineWidth = 18; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(MID, BY1); ctx.lineTo(MID, 995); ctx.moveTo(MID - 110, 998); ctx.lineTo(MID + 110, 998); ctx.stroke();
  K.shadow(ctx, MID, 1002, 300);
  if (glowA > 0) K.glow(ctx, MID, (BY0 + BY1) / 2, 420, ACC, 0.32 * glowA);
  // cover + pages
  roundRect(ctx, BX0 - 16, BY0 - 10, BX1 - BX0 + 32, BY1 - BY0 + 30, 20); ctx.fillStyle = '#7a3b3b'; ctx.fill();
  roundRect(ctx, BX0, BY0, MID - BX0 - 4, BY1 - BY0, 12); ctx.fillStyle = '#f4efe2'; ctx.fill();
  roundRect(ctx, MID + 4, BY0, BX1 - MID - 4, BY1 - BY0, 12); ctx.fillStyle = '#f7f2e6'; ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(MID - 8, BY0, 16, BY1 - BY0);
  // page flip during the search sweep
  const flipU = H.phase(t, tCount, tCount + 0.7);
  if (flipU > 0 && flipU < 1) {
    const fx = lerp(BX1 - 10, BX0 + 10, flipU);
    ctx.beginPath(); ctx.moveTo(MID, BY0); ctx.quadraticCurveTo((MID + fx) / 2, BY0 - 50 * Math.sin(flipU * Math.PI), fx, BY0 + 10);
    ctx.lineTo(fx, BY1 - 10); ctx.quadraticCurveTo((MID + fx) / 2, BY1 - 40 * Math.sin(flipU * Math.PI), MID, BY1); ctx.closePath();
    ctx.fillStyle = '#fffaf0'; ctx.fill(); ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 2; ctx.stroke();
  }
  // rows: left page has filler rows (grey lines) and later readable titles; right page receives the logged address
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  const rowH = 40;
  const fillN = Math.round(lerp(3, 6, smooth((t - tCount) / 2)));
  for (let i = 0; i < 6; i++) {
    const y = BY0 + 34 + i * rowH;
    if (i < fillN) {
      const readable = t > tCount + 0.6 && i < rowsT.length;
      if (readable) {
        const hl = H.phase(t, tRev + i * 0.18, tRev + i * 0.18 + 0.35);
        ctx.font = H.font('ui', 22);
        const a = rowsT[i], wa = ctx.measureText(a).width;
        if (hl > 0) { roundRect(ctx, BX0 + 18, y - 15, (wa + 12) * hl, 30, 8); ctx.fillStyle = rgba(ACC, 0.9); ctx.fill(); }
        ctx.fillStyle = hl > 0.5 ? K.ACCENT.deep : '#3d4360'; ctx.fillText(a, BX0 + 24, y + 1);
        ctx.fillStyle = '#9aa0b5'; ctx.fillText('-' + ids[i].slice(0, 4), BX0 + 28 + wa, y + 1);
      } else {
        ctx.fillStyle = '#cfcab9'; roundRect(ctx, BX0 + 22, y - 5, 220 + 50 * H.hash(i, 9), 10, 5); ctx.fill();
      }
    }
  }
  // right page: the logged address (typewriter) + more rows later
  const typed = clamp((t - tLog) / 1.1);
  const fullA = slug, fullB = '-' + id.slice(0, 4);
  if (t > tLog) {
    const y = BY0 + 34;
    ctx.font = H.font('ui', 22);
    const n = Math.floor(typed * (fullA.length + fullB.length));
    const sa = fullA.slice(0, n), sb = fullB.slice(0, Math.max(0, n - fullA.length));
    const wa = ctx.measureText(sa).width;
    const hl = H.phase(t, tAll, tAll + 0.4);
    if (hl > 0) { roundRect(ctx, MID + 20, y - 15, (ctx.measureText(fullA).width + 12) * hl, 30, 8); ctx.fillStyle = ACC; ctx.fill(); }
    ctx.fillStyle = hl > 0.5 ? K.ACCENT.deep : '#2a2f45'; ctx.fillText(sa, MID + 26, y + 1);
    ctx.fillStyle = '#9aa0b5'; ctx.fillText(sb, MID + 26 + wa, y + 1);
    // pen
    if (typed < 1 || t < tLog + 1.4) {
      const px = MID + 26 + ctx.measureText(sa + sb).width + 6, py = y + 4 + Math.sin(t * 30) * 2;
      ctx.save(); ctx.globalAlpha = 1 - smooth((t - tLog - 1.1) / 0.3); ctx.translate(px, py); ctx.rotate(0.6);
      roundRect(ctx, -6, -80, 12, 72, 5); ctx.fillStyle = '#2a2f45'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-6, -8); ctx.lineTo(0, 6); ctx.lineTo(6, -8); ctx.closePath(); ctx.fillStyle = ACC; ctx.fill();
      ctx.restore();
    }
    for (let i = 1; i < fillN; i++) {
      const yy = BY0 + 34 + i * rowH;
      ctx.fillStyle = '#cfcab9'; roundRect(ctx, MID + 22, yy - 5, 190 + 60 * H.hash(i, 4), 10, 5); ctx.fill();
    }
  }

  // ---- beat 1: address strip at the top + passer-by with phone
  const sOut = smooth((t - tB + 0.4) / 0.5);
  if (sOut < 1) {
    ctx.save(); ctx.globalAlpha = 1 - sOut;
    const y = 470;
    ctx.font = H.font('ui', 34);
    const pa = slug, pb = '-' + id, pc = host;
    const wa = ctx.measureText(pa).width, wb = ctx.measureText(pb).width, wc = ctx.measureText(pc).width;
    const tot = wa + wb + wc + 40, x0 = 487 - tot / 2;
    const pA = K.popIn(t, tTitle, 0.45), pB = K.popIn(t, tBuild, 0.45);
    // backing bar
    const barP = K.popIn(t, tBuild - 0.1, 0.4);
    if (barP > 0) { ctx.save(); ctx.globalAlpha *= barP; roundRect(ctx, x0 - 24, y - 40, tot + 48, 80, 22); ctx.fillStyle = '#f2f4fa'; ctx.fill(); ctx.restore(); }
    if (pA > 0) {
      ctx.save(); ctx.translate(x0 + wa / 2, y); ctx.scale(pA, pA);
      roundRect(ctx, -wa / 2 - 10, -27, wa + 20, 54, 12); ctx.fillStyle = ACC; ctx.fill();
      ctx.textAlign = 'center'; ctx.fillStyle = K.ACCENT.deep; ctx.fillText(pa, 0, 2);
      ctx.restore();
      const tagA = 1 - smooth((t - tDns + 0.2) / 0.3);
      if (tagA > 0) { ctx.save(); ctx.globalAlpha *= tagA; K.drawLabel(ctx, x0 + wa / 2, y + 100, pA, { text: P.titleTag || 'the title', size: 26, accent: true }); ctx.restore(); }
    }
    if (pB > 0) {
      ctx.textAlign = 'left'; ctx.fillStyle = '#59607a';
      ctx.save(); ctx.globalAlpha *= pB; ctx.fillText(pb, x0 + wa + 16, y + 2); ctx.fillStyle = '#8a90a8'; ctx.fillText(pc, x0 + wa + wb + 24, y + 2); ctx.restore();
      const tagB = 1 - smooth((t - tDns + 0.2) / 0.3);
      if (tagB > 0) { ctx.save(); ctx.globalAlpha *= tagB; K.drawLabel(ctx, x0 + wa + 16 + wb / 2 + 20, y + 100, pB, { text: P.idTag || 'random ID', size: 26 }); ctx.restore(); }
    }
    ctx.restore();

    // passer-by opens the link
    const wp = H.phase(t, 0, tOpen, easeOutCubic);
    const px = lerp(-60, 120, wp);
    K.drawPerson(ctx, px, 1030, 1.15, { t, pose: t > tOpen - 0.1 ? 'phone' : 'stand', walk: wp < 1 ? t : null, mood: 'happy', skin: 1, hair: 3, shirt: 4, hairStyle: 'bun', seed: 22 });
    const sig = H.phase(t, tOpen + 0.1, tDns, H.easeInOutCubic);
    if (sig > 0 && t < tLog + 0.8) {
      const pts = K.motion.bezier(px + 12, 790, px + 60, 640, BX0 - 40, 600, MID - 120, BY0 + 40, 30);
      ctx.save(); ctx.globalAlpha = 1 - smooth((t - tLog) / 0.8); ctx.strokeStyle = ACC; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.setLineDash([14, 14]); ctx.lineDashOffset = -t * 50;
      K.motion.pathDraw(ctx, pts, sig); ctx.restore();
    }
  }
  // DNS pill under the book's top edge (beat 1), stays as a sign
  const dp = K.popIn(t, tDns, 0.45);
  const dOut = smooth((t - tCount + 0.3) / 0.3);
  if (dp > 0 && dOut < 1) { ctx.save(); ctx.globalAlpha = 1 - dOut; K.drawLabel(ctx, MID, BY0 - 24, dp, { text: P.dns || "DNS: the internet's phone book", size: 28, dot: true }); ctx.restore(); }

  // ---- beat 2: researcher with a magnifying glass + counter
  if (t > tB - 0.5) {
    const wk = H.phase(t, tWho, tWho + 1.0, easeOutCubic);
    const rx = lerp(-80, 115, wk);
    K.drawPerson(ctx, rx, 1030, 1.15, { t, pose: wk >= 1 ? 'point' : 'stand', walk: wk < 1 ? t : null, mood: t > tRev ? 'shocked' : 'neutral', skin: 0, hair: 2, shirt: '#6f8cff', hairStyle: 'short', seed: 31, look: 1 });
    if (wk >= 1) {
      // glass sweeps over the book
      const sw = Math.sin((t - tWho) * 1.6);
      const gx = lerp(rx + 98 * 1.15 + 50, 560 + 150 * sw, smooth((t - tWho - 1) / 0.8)), gy = lerp(1030 - 176 * 1.15 - 20, 760 + 50 * Math.cos((t - tWho) * 1.1), smooth((t - tWho - 1) / 0.8));
      const hx = rx + 98 * 1.15 + 14, hy = 1030 - 176 * 1.15;
      ctx.strokeStyle = '#3b4260'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(gx - 40, gy + 40); ctx.stroke();
      ctx.beginPath(); ctx.arc(gx, gy, 62, 0, Math.PI * 2); ctx.fillStyle = 'rgba(180,220,255,0.2)'; ctx.fill();
      ctx.lineWidth = 10; ctx.strokeStyle = '#3b4260'; ctx.stroke();
      ctx.beginPath(); ctx.arc(gx - 18, gy - 20, 18, Math.PI * 1.1, Math.PI * 1.6); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 5; ctx.stroke();
      const rp = K.popIn(t, tWho + 0.3, 0.4);
      if (rp > 0 && t < tCount + 0.2) K.drawLabel(ctx, 210, 560, rp, { text: P.who || 'Researchers search', size: 26, dot: true });
    }
    // counter
    const cp = K.popIn(t, tCount, 0.5);
    if (cp > 0) {
      const v = Math.round((P.count || 1000) * easeOutCubic(clamp((t - tCount) / Math.max(0.5, tCountEnd - tCount))));
      const txt = (P.prefix || '') + v.toLocaleString('en-US') + (v >= (P.count || 1000) ? (P.suffix == null ? '+' : P.suffix) : '');
      ctx.save(); ctx.translate(487, 480); ctx.scale(cp, cp);
      ctx.font = H.font('display', 104); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      K.glow(ctx, 0, 0, 260, ACC, 0.3);
      ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(8,10,24,0.8)'; ctx.strokeText(txt, 0, 0);
      ctx.fillStyle = ACC; ctx.fillText(txt, 0, 0);
      ctx.restore();
      const lp = K.popIn(t, tCount + 0.4, 0.4);
      if (lp > 0) K.drawLabel(ctx, 487, 578, lp, { text: P.countLabel || 'share addresses', size: 30 });
    }
    const np = K.popIn(t, tNote, 0.45);
    if (np > 0) {
      ctx.save(); ctx.translate(705, 968); ctx.rotate(-0.04);
      K.drawLabel(ctx, 0, 0, np, { text: P.note || 'Shares, not people', size: 28, accent: true });
      ctx.restore();
    }
    const vp = K.popIn(t, tRev, 0.45);
    if (vp > 0) K.drawLabel(ctx, 340, 968, vp, { text: P.reveal || 'Titles gave it away', size: 26, dot: true });
  }
  ctx.restore();
  void z; void mixHex;
}
