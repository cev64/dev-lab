// Scene "podcast-studio" (full frame, 1 beat). A cosy night podcast studio: foam-panelled wall, a glowing ON AIR
// sign, a table with two microphones on boom arms, headphones and mugs, two empty chairs. The speakers are NEVER
// drawn: host and guest appear only as text name cards over their mics. The show name lights up as a neon sign on
// its cue, then the name cards lift away and a verbatim quote card types in with attribution while sound rings
// pulse from the guest's mic. Ends settled (quote fully typed, rings soft).
// params: show, host, hostRole ("Host"), guest, guestRole ("Guest"), guestSub, quote, by,
//         cues guestCue, hostCue, showCue, quoteCue (narration words, "word#n", or seconds)
// Fits: "X said on Y's podcast / interview", any quote from a show, keeping real people off-screen.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => {
    if (w == null || w === '') return d;
    if (typeof w === 'number') return w;
    const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? d : v;
  };
  const tGuest = at(P.guestCue, D * 0.05) - 0.15;
  const tHost = at(P.hostCue, D * 0.35) - 0.15;
  const tShow = at(P.showCue, D * 0.5) - 0.2;
  const tQuote = at(P.quoteCue, D * 0.62) - 0.25;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: tQuote, zoom: 1.02, x: 487, y: 720 }, { t: D, zoom: 1.04, x: 487, y: 715 }]);

  // ---- room ----
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#1b1838'); g.addColorStop(0.55, '#262148'); g.addColorStop(1, '#120f24');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  // foam panels
  for (let r = 0; r < 9; r++) for (let c = 0; c < 8; c++) {
    const x = 40 + c * 128, y = 300 + r * 82;
    roundRect(ctx, x, y, 112, 68, 10); ctx.fillStyle = (r + c) % 2 ? '#2c2754' : '#302a5c'; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x + 8, y + 30, 96, 6);
  }
  // floor
  ctx.fillStyle = '#16122a'; ctx.fillRect(0, 1030, 1080, 890);
  ctx.fillStyle = 'rgba(255,255,255,0.04)'; for (let i = 0; i < 6; i++) ctx.fillRect(0, 1060 + i * 60, 1080, 3);
  // warm lamp glow
  K.glow(ctx, 900, 640, 360, '#ffb86b', 0.10);

  // ON AIR sign (top-left), red glow pulses
  const onA = 0.75 + 0.25 * Math.sin(t * 4);
  K.glow(ctx, 210, 470, 170, '#ff4d4d', 0.35 * onA);
  roundRect(ctx, 110, 440, 200, 64, 14); ctx.fillStyle = '#3a0f16'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = rgba('#ff6b6b', 0.6 + 0.4 * onA); ctx.stroke();
  ctx.fillStyle = '#ff6b6b'; ctx.font = K.font.display(32); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('ON AIR', 210, 474);

  // show neon sign (top-right), lights on its cue
  const sk = clamp((t - tShow) / 0.5), flick = sk > 0 && sk < 1 ? (Math.floor(t * 20) % 2 ? 0.4 : 1) : 1;
  {
    const sx = 640;
    roundRect(ctx, sx - 250, 430, 500, 86, 18); ctx.fillStyle = '#100d22'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = sk > 0 ? rgba(ACC, 0.7 * sk) : 'rgba(255,255,255,0.12)'; ctx.stroke();
    const f = H.fitText(ctx, P.show || 'THE SHOW', 'display', 46, 28, 460);
    ctx.font = f.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (sk > 0) { K.glow(ctx, sx, 473, 260, ACC, 0.25 * sk * flick); ctx.shadowColor = ACC; ctx.shadowBlur = 20 * sk; }
    ctx.fillStyle = sk > 0 ? rgba(ACC, 0.25 + 0.75 * sk * flick) : 'rgba(255,255,255,0.10)';
    ctx.fillText(f.text, sx, 476); ctx.shadowBlur = 0;
  }

  // ---- chairs (empty), table, mics ----
  const chair = (x) => {
    roundRect(ctx, x - 85, 760, 170, 170, 40); ctx.fillStyle = '#3d3570'; ctx.fill();
    roundRect(ctx, x - 70, 775, 140, 140, 32); ctx.fillStyle = '#4a4185'; ctx.fill();
  };
  chair(300); chair(680);
  // table
  K.shadow(ctx, 487, 1040, 760);
  roundRect(ctx, 90, 900, 795, 40, 12); ctx.fillStyle = '#7a5640'; ctx.fill();
  ctx.fillStyle = '#5c4030'; ctx.fillRect(110, 940, 755, 16);
  ctx.fillStyle = '#4a3326'; ctx.fillRect(140, 956, 26, 84); ctx.fillRect(809, 956, 26, 84);
  // headphones + mugs
  const phones = (x) => {
    ctx.save(); ctx.lineWidth = 9; ctx.strokeStyle = '#1c1a2e'; ctx.beginPath(); ctx.arc(x, 896, 34, Math.PI, 0); ctx.stroke();
    roundRect(ctx, x - 44, 880, 20, 22, 6); ctx.fillStyle = '#1c1a2e'; ctx.fill(); roundRect(ctx, x + 24, 880, 20, 22, 6); ctx.fill(); ctx.restore();
  };
  phones(180); phones(800);
  K.props.mug(ctx, 410, 900, 0.8, t); K.props.mug(ctx, 565, 900, 0.8, t + 1);
  const mic = (x, dir, live) => {
    // base on the table, boom arm up to the mic head
    ctx.save(); ctx.lineCap = 'round';
    ctx.fillStyle = '#1c1a2e'; roundRect(ctx, x - 40, 888, 80, 14, 7); ctx.fill();
    ctx.strokeStyle = '#2b2944'; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.moveTo(x, 890); ctx.lineTo(x + dir * 40, 820); ctx.lineTo(x, 760); ctx.stroke();
    // mic head
    roundRect(ctx, x - 26, 690, 52, 84, 26); ctx.fillStyle = '#3a3a52'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; for (let i = 0; i < 4; i++) ctx.fillRect(x - 18, 704 + i * 14, 36, 4);
    roundRect(ctx, x - 30, 742, 60, 14, 6); ctx.fillStyle = live ? ACC : '#55556e'; ctx.fill();
    ctx.restore();
  };
  const guestLive = t > tQuote;
  // sound rings from the guest mic while the quote plays
  if (guestLive) {
    const e = 0.35 + 0.65 * (info.env || 0);
    for (let k = 0; k < 3; k++) {
      const u = ((t * 0.9 + k / 3) % 1);
      ctx.save(); ctx.globalAlpha = (1 - u) * 0.6 * e; ctx.strokeStyle = ACC; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(680, 730, 50 + u * 120, -Math.PI * 0.35, Math.PI * 0.35); ctx.stroke();
      ctx.beginPath(); ctx.arc(680, 730, 50 + u * 120, Math.PI * 0.65, Math.PI * 1.35); ctx.stroke();
      ctx.restore();
    }
  }
  mic(300, -1, false); mic(680, 1, guestLive);

  // ---- name cards (text only) ----
  const card = (x, y, role, name, sub, p, fade) => {
    if (p <= 0 || fade <= 0) return;
    ctx.save(); ctx.globalAlpha = fade; ctx.translate(x, y); ctx.scale(p, p);
    const w = 380, h = sub ? 150 : 112;
    roundRect(ctx, -w / 2, -h / 2, w, h, 20); ctx.fillStyle = 'rgba(8,10,22,0.93)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.75); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = ACC; ctx.font = K.font.ui(24); ctx.fillText(role.toUpperCase(), 0, -h / 2 + 28);
    const nf = H.fitText(ctx, name, 'display', 40, 26, w - 30); ctx.font = nf.font; ctx.fillStyle = '#ffffff'; ctx.fillText(nf.text, 0, -h / 2 + 70);
    if (sub) { const sf = H.fitText(ctx, sub, 'ui', 26, 20, w - 30); ctx.font = sf.font; ctx.fillStyle = '#c9cfe6'; ctx.fillText(sf.text, 0, -h / 2 + 112); }
    ctx.restore();
  };
  const fadeCards = 1 - clamp((t - tQuote) / 0.4);
  card(680, 600, P.guestRole || 'Guest', P.guest || 'Guest name', P.guestSub || '', K.popIn(t, tGuest, 0.45), fadeCards);
  card(290, 610, P.hostRole || 'Host', P.host || 'Host name', P.hostSub || '', K.popIn(t, tHost, 0.45), fadeCards);
  // pointer tails from cards to mics
  if (fadeCards > 0) {
    [[680, tGuest, P.guestSub ? 675 : 656], [290, tHost, 666]].forEach(([x, t0, y0]) => {
      const p = clamp((t - t0 - 0.2) / 0.3); if (p <= 0) return;
      ctx.save(); ctx.globalAlpha = fadeCards * p; ctx.fillStyle = 'rgba(8,10,22,0.93)';
      ctx.beginPath(); ctx.moveTo(x - 16, y0); ctx.lineTo(x + 16, y0); ctx.lineTo(x + (x > 487 ? 0 : 10), y0 + 24); ctx.fill(); ctx.restore();
    });
  }

  // ---- quote card ----
  if (t > tQuote) {
    const p = K.popIn(t, tQuote, 0.5);
    const QX = 487, QY = 705, QW = 820;
    const q = String(P.quote || '“Quote goes here.”');
    const lines = H.wrap(ctx, q, 'display', 46, QW - 80);
    const lh = 58, QH = 70 + lines.length * lh + 56;
    // type-on by characters across the spoken quote
    const total = q.length, shown = Math.floor(clamp((t - tQuote - 0.3) / Math.max(1.2, Math.min(3.2, D - tQuote - 1.2))) * total);
    ctx.save(); ctx.translate(QX, QY); ctx.scale(p, p);
    roundRect(ctx, -QW / 2, -QH / 2, QW, QH, 26); ctx.fillStyle = 'rgba(8,10,22,0.95)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.font = H.font('display', 46); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    let c = 0;
    lines.forEach((ln, i) => {
      const y = -QH / 2 + 56 + i * lh;
      const lw = ctx.measureText(ln).width;
      const vis = ln.slice(0, clamp(shown - c, 0, ln.length)); c += ln.length + 1;
      ctx.fillText(vis, -lw / 2, y);
    });
    const ba = clamp((shown - total + 4) / 4);
    if (ba > 0) { ctx.globalAlpha = ba; ctx.fillStyle = '#b9c1d6'; ctx.font = H.font('ui', 26); ctx.textAlign = 'center'; ctx.fillText('— ' + (P.by || 'Speaker'), 0, QH / 2 - 34); }
    ctx.restore();
  }
  ctx.restore();
}
