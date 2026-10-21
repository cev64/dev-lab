// Scene "share-paused" (full frame, 1 beat: company response + caveat). Night room. Top: a big glowing Share button;
// on pauseCue two tape strips slap across it in an X and a "PAUSED" tape banner lands (small shake). Middle: a verbatim
// quote panel types in with its attribution as text (the speaker is never drawn). Bottom row: left, three small page
// cards get a cross each with a pill ("No longer open"); right, the phone-book from the DNS scene stays lit with its
// rows and a pill ("Still in DNS history").
// Fits: a company pauses / disables a feature; "the fix stops new X but old Y remains".
// params (all optional): button ("Share"), paused ("PAUSED"), quote, by, closed ("Rechecked pages: closed"),
//   kept ("Old records: still out there"), rows [titles]
//   cues: byCue, pauseCue, quoteCue, closedCue, keptCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, roundRect, rgba } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tBy = at(P.byCue, D * 0.03) - 0.1, tPause = at(P.pauseCue, D * 0.22) - 0.25;
  const tQuote = at(P.quoteCue, D * 0.2) - 0.2;
  const tClosed = at(P.closedCue, D * 0.5) - 0.3, tKept = at(P.keptCue, D * 0.78) - 0.3;
  const RED = '#ff6b5e';

  ctx.save();
  K.cameraShake && K.cameraShake(ctx, t, tPause + 0.35, 0.3, 6);
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 690 }, { t: tClosed - 0.2, zoom: 1.0 }, { t: D, zoom: 1.02, x: 487, y: 740 }]);
  K.world.room(ctx, { t, time: 'night', floorY: 1010, window: true, lamp: true, picture: false, plant: false, wall: '#252a4a', wallS: '#1f2244' });
  ctx.fillStyle = 'rgba(8,10,24,0.35)'; ctx.fillRect(-200, -200, 1480, 2320);

  // ---- Share button (top)
  const bx = 487, by = 500, bw = 430, bh = 116;
  const pz = H.phase(t, tPause, tPause + 0.5);
  const bp = K.popIn(t, 0, 0.5);
  ctx.save(); ctx.translate(bx, by); ctx.scale(bp, bp);
  K.glow(ctx, 0, 0, 300, ACC, 0.4 * (1 - 0.8 * pz) * (0.85 + 0.15 * Math.sin(t * 4)));
  roundRect(ctx, -bw / 2, -bh / 2, bw, bh, bh / 2); ctx.fillStyle = H.mixHex(ACC, '#5a6080', 0.75 * pz); ctx.fill();
  ctx.font = H.font('display', 52); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = H.mixHex(K.ACCENT.deep, '#d0d4e4', pz); ctx.fillText(P.button || 'Share', 30, 3);
  ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 7;
  for (const dx of [-12, 12]) { roundRect(ctx, -110 + dx - 20, -12, 40, 24, 12); ctx.stroke(); }
  // tape X
  const tape = (ang, u) => {
    if (u <= 0) return;
    ctx.save(); ctx.rotate(ang);
    const L = 560 * easeOutCubic(u);
    ctx.fillStyle = 'rgba(232,218,170,0.95)'; ctx.fillRect(-280, -26, L, 52);
    ctx.fillStyle = 'rgba(0,0,0,0.08)'; for (let i = 0; i < 8; i++) ctx.fillRect(-280 + i * 70, -26, 3, 52);
    ctx.restore();
  };
  tape(0.22, H.phase(t, tPause, tPause + 0.25));
  tape(-0.22, H.phase(t, tPause + 0.18, tPause + 0.43));
  const sp = H.phase(t, tPause + 0.35, tPause + 0.7, easeOutCubic);
  if (sp > 0) {
    const sc = 1 + 0.6 * (1 - sp);
    ctx.save(); ctx.scale(sc, sc); ctx.rotate(-0.06); ctx.globalAlpha = sp;
    roundRect(ctx, -170, -40, 340, 80, 12); ctx.fillStyle = RED; ctx.fill();
    ctx.font = H.font('display', 54); ctx.fillStyle = '#ffffff'; ctx.fillText(P.paused || 'PAUSED', 0, 4);
    ctx.restore();
  }
  ctx.restore();

  // ---- quote panel (middle)
  const qp = K.popIn(t, tQuote, 0.45);
  if (qp > 0) {
    const qx = 487, qy = 705, qw = 800, qh = 170;
    const fade = 1 - 0.35 * smooth((t - tClosed) / 0.6);
    ctx.save(); ctx.globalAlpha = fade; ctx.translate(qx, qy); ctx.scale(qp, qp);
    roundRect(ctx, -qw / 2, -qh / 2, qw, qh, 22); ctx.fillStyle = 'rgba(14,16,30,0.92)'; ctx.fill();
    roundRect(ctx, -qw / 2, -qh / 2, 12, qh, 6); ctx.fillStyle = ACC; ctx.fill();
    const quote = P.quote || '"Quote here."';
    const shown = K.typewriter ? K.typewriter(quote, t, 34, tQuote + 0.2) : quote;
    const lines = H.wrap(ctx, quote, 'bold', 32, qw - 90);
    ctx.font = H.font('bold', 32); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    let left = shown.length;
    lines.slice(0, 3).forEach((ln, i) => {
      const part = ln.slice(0, Math.max(0, left)); left -= ln.length + 1;
      ctx.fillText(part, -qw / 2 + 40, -qh / 2 + 40 + i * 42 - (lines.length > 2 ? 4 : -10));
    });
    ctx.restore();
  }
  const byp = K.popIn(t, tBy, 0.4);
  if (byp > 0) K.drawLabel(ctx, 487, 825 + 0, byp, { text: P.by || 'Company statement', size: 26, dot: true });

  // ---- bottom left: rechecked pages closed
  const cp = K.popIn(t, tClosed, 0.45);
  if (cp > 0) {
    for (let i = 0; i < 3; i++) {
      const u = K.popIn(t, tClosed + i * 0.15, 0.4); if (u <= 0) continue;
      const x = 130 + i * 95, y = 900;
      ctx.save(); ctx.translate(x, y); ctx.scale(u, u); ctx.rotate((i - 1) * 0.06);
      roundRect(ctx, -40, -55, 80, 110, 10); ctx.fillStyle = '#e9ecf6'; ctx.fill();
      ctx.fillStyle = '#bfc5d8'; for (let k = 0; k < 4; k++) { roundRect(ctx, -28, -40 + k * 20, 56 - (k % 2) * 16, 8, 4); ctx.fill(); }
      const xk = clamp((t - tClosed - 0.4 - i * 0.15) / 0.3);
      if (xk > 0) {
        ctx.strokeStyle = RED; ctx.lineWidth = 10; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-26, -30); ctx.lineTo(-26 + 52 * xk, -30 + 60 * xk); ctx.moveTo(26, -30); ctx.lineTo(26 - 52 * xk, -30 + 60 * xk); ctx.stroke();
      }
      ctx.restore();
    }
    K.drawLabel(ctx, 225, 1020, cp, { text: P.closed || 'Rechecked: no longer open', size: 24 });
  }
  // ---- bottom right: the phone book stays lit
  const kp = K.popIn(t, tKept, 0.5);
  if (kp > 0) {
    const x0 = 560, y0 = 850, w = 360, h = 110;
    ctx.save(); ctx.translate(x0 + w / 2, y0 + h); ctx.scale(kp, kp); ctx.translate(-(x0 + w / 2), -(y0 + h));
    K.glow(ctx, x0 + w / 2, y0 + h / 2, 230, ACC, 0.3 + 0.08 * Math.sin(t * 3));
    roundRect(ctx, x0 - 10, y0 - 8, w + 20, h + 20, 14); ctx.fillStyle = '#7a3b3b'; ctx.fill();
    roundRect(ctx, x0, y0, w / 2 - 3, h, 8); ctx.fillStyle = '#f4efe2'; ctx.fill();
    roundRect(ctx, x0 + w / 2 + 3, y0, w / 2 - 3, h, 8); ctx.fillStyle = '#f7f2e6'; ctx.fill();
    const rows = P.rows || ['q3-revenue', 'loan-applic', 'staff-vacat', 'call-prep', 'home-sale', 'team-plan'];
    ctx.font = H.font('ui', 17); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    rows.slice(0, 6).forEach((r, i) => {
      const col = i < 3 ? 0 : 1, row = i % 3, xx = x0 + 12 + col * (w / 2 + 3), yy = y0 + 22 + row * 33;
      const hl = 0.6 + 0.4 * Math.sin(t * 3 + i);
      roundRect(ctx, xx - 4, yy - 12, ctx.measureText(r).width + 8, 24, 6); ctx.fillStyle = rgba(ACC, 0.55 * hl + 0.3); ctx.fill();
      ctx.fillStyle = K.ACCENT.deep; ctx.fillText(r, xx, yy + 1);
    });
    ctx.restore();
    K.drawLabel(ctx, 740, 1020, kp, { text: P.kept || 'Old records: still out there', size: 24, accent: true });
  }
  ctx.restore();
  void lerp;
}
