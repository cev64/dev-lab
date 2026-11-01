// Scene "guide-test" (full frame). How a newsroom test worked: a row of N generic chat windows each gets the same
// request (typing bubbles, then an answer card); a "N popular chatbots" pill lands on chatCue; an abstract map
// (no real borders) fills with dots that light up one by one on countyCue ("an address in every county"); a counter
// panel counts up to `count`+ on countCue while voter-guide sheets stack up beside a cartoon checker with a magnifier.
// Fits: outlet/lab tests that ask many chatbots the same thing, audits, "we checked N answers".
// params: by (top pill), n (6), botsLabel ("popular chatbots"), mapLabel, count (1000), countLabel, cues: chatCue, countyCue, countCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, roundRect, mixHex } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const n = Math.max(2, Math.min(6, P.n || 6));
  const tChat = at(P.chatCue, D * 0.25) - 0.2;
  const tMap = Math.min(at(P.countyCue, D * 0.7) - 2.6, D * 0.5);
  const tCounty = at(P.countyCue, D * 0.7) - 0.7;
  const tCount = at(P.countCue, D * 0.85);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 480, y: 760 }]);
  K.world.office(ctx, { t, time: 'night' });
  ctx.restore();
  ctx.fillStyle = 'rgba(8,10,24,0.55)'; ctx.fillRect(0, 0, 1080, 1920);

  const tp = K.popIn(t, 0.05, 0.4);
  if (tp > 0) K.drawLabel(ctx, 492, 474, tp, { text: P.by || 'The test', size: 26, dot: true });

  // row of chat windows
  const W = 125, G = 14, x0 = (985 - (n * W + (n - 1) * G)) / 2, y0 = 498, Hh = 128;
  for (let i = 0; i < n; i++) {
    const lt = t - 0.15 - i * 0.12, p = K.popIn(lt, 0, 0.4);
    if (p <= 0) continue;
    const x = x0 + i * (W + G), bounce = t > tChat ? -Math.max(0, Math.sin(clamp((t - tChat - i * 0.06) / 0.35) * Math.PI)) * 16 : 0;
    ctx.save(); ctx.translate(x + W / 2, y0 + Hh); ctx.scale(p, p); ctx.translate(-(x + W / 2), -(y0 + Hh)); ctx.translate(0, bounce);
    roundRect(ctx, x, y0, W, Hh, 16); ctx.fillStyle = '#1c2033'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = t > tChat ? ACC : '#3b4260'; ctx.stroke();
    ctx.save(); roundRect(ctx, x, y0, W, Hh, 16); ctx.clip(); ctx.fillStyle = '#2a2f45'; ctx.fillRect(x, y0, W, 28); ctx.restore();
    // tiny robot avatar
    roundRect(ctx, x + 8, y0 + 5, 20, 18, 5); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = ACC; ctx.fillRect(x + 12, y0 + 11, 4, 4); ctx.fillRect(x + 20, y0 + 11, 4, 4);
    // user bubble (accent) then answer lines appear
    roundRect(ctx, x + W - 74, y0 + 38, 64, 22, 11); ctx.fillStyle = ACC; ctx.fill();
    const ans = clamp((lt - 0.8 - (i % 3) * 0.25) / 0.8);
    if (ans <= 0) {
      for (let k = 0; k < 3; k++) { const a = 0.4 + 0.6 * Math.max(0, Math.sin(t * 8 - k * 0.9)); ctx.fillStyle = `rgba(232,236,248,${a})`; ctx.beginPath(); ctx.arc(x + 22 + k * 14, y0 + 84, 4.5, 0, Math.PI * 2); ctx.fill(); }
    } else {
      roundRect(ctx, x + 10, y0 + 68, (W - 20) * ans, 48, 8); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      if (ans > 0.6) for (let k = 0; k < 3; k++) { roundRect(ctx, x + 18, y0 + 76 + k * 13, (W - 40) * (k === 2 ? 0.5 : 0.9), 6, 3); ctx.fillStyle = '#b9c1d6'; ctx.fill(); }
    }
    ctx.restore();
  }
  const cp = K.popIn(t, tChat, 0.4), cOut = clamp((t - tCounty + 0.2) / 0.3);
  if (cp > 0 && cOut < 1) { ctx.save(); ctx.globalAlpha = 1 - cOut; K.drawLabel(ctx, 492, 690, cp, { text: `${n} ${P.botsLabel || 'popular chatbots'}`, size: 28, accent: true }); ctx.restore(); }

  // abstract map with county dots
  const mp = K.popIn(t, tMap, 0.5);
  const MX = 330, MY = 860, R = 230;
  if (mp > 0) {
    ctx.save(); ctx.translate(MX, MY); ctx.scale(mp, mp);
    const blob = (rr) => { ctx.beginPath(); for (let i = 0; i <= 60; i++) { const a = (i / 60) * Math.PI * 2; const r = rr * (1 + 0.07 * Math.sin(a * 3 + 1) + 0.05 * Math.sin(a * 5 + 2)); const x = Math.cos(a) * r * 1.12, y = Math.sin(a) * r * 0.6; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); };
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.save(); ctx.translate(8, 12); blob(R); ctx.fill(); ctx.restore();
    blob(R); ctx.fillStyle = '#2f3d62'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#5a6690'; ctx.stroke();
    // dots on a jittered grid inside the blob, lit west -> east
    const dots = [];
    for (let gy = -4; gy <= 4; gy++) for (let gx = -8; gx <= 8; gx++) {
      const jx = (H.hash(gx * 7 + 3, gy * 11 + 5) - 0.5) * 18, jy = (H.hash(gx * 13 + 1, gy * 5 + 9) - 0.5) * 14;
      const x = gx * 28 + jx, y = gy * 28 + jy, a = Math.atan2(y / 0.6, x / 1.12), rr = Math.hypot(x / 1.12, y / 0.6);
      if (rr < R * 0.86 * (1 + 0.07 * Math.sin(a * 3 + 1) + 0.05 * Math.sin(a * 5 + 2))) dots.push([x, y]);
    }
    const span = Math.max(1, tCount - tCounty);
    for (const [x, y] of dots) {
      const u = (x + R * 1.12) / (2.24 * R), lt = t - (tCounty + u * span * 0.85 + H.hash(x, y) * 0.25);
      if (lt > 0) {
        const p = K.popIn(lt, 0, 0.3);
        ctx.beginPath(); ctx.arc(x, y, 7 * p, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
        if (lt < 0.5) { ctx.beginPath(); ctx.arc(x, y, 7 + lt * 30, 0, Math.PI * 2); ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - lt / 0.5)})`; ctx.lineWidth = 2; ctx.stroke(); }
      } else { ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fillStyle = '#4a5884'; ctx.fill(); }
    }
    ctx.restore();
    const lp = K.popIn(t, tCounty + 0.1, 0.4);
    if (lp > 0) K.drawLabel(ctx, 492, 690, lp, { text: P.mapLabel || 'An address in every county', size: 24 });
  }

  // checker + stack of guides (right)
  const stackN = Math.floor(clamp((t - tCounty) / Math.max(0.5, tCount - tCounty + 0.6)) * 7);
  for (let i = 0; i < stackN + (t > tCounty ? 1 : 0) && i < 8; i++) {
    const land = clamp((t - tCounty - i * 0.32) / 0.3);
    if (land <= 0) continue;
    K.drawDocument(ctx, 690 + (i % 2) * 6, 1036 - i * 16 - (1 - land) * 60, 0.62, { lines: 4, title: true });
  }
  K.drawPerson(ctx, 845, 1036, 1.25, { pose: 'point', flip: true, t, mood: t > tCount ? 'shocked' : 'neutral', skin: 4, hair: 0, shirt: 1, hairStyle: 'bun', seed: 33, look: -0.8, talk: 0 });

  // counter panel
  const pp = K.popIn(t, tCount - 0.5, 0.45);
  if (pp > 0) {
    const px = 120, py = 896, pw = 330, ph = 132;
    ctx.save(); ctx.translate(px + pw / 2, py + ph / 2); ctx.scale(pp, pp); ctx.translate(-(px + pw / 2), -(py + ph / 2));
    roundRect(ctx, px, py, pw, ph, 20); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    const target = P.count || 1000, v = K.countUp(target, t, tCount - 0.4, 1.0, 0);
    ctx.font = H.font('display', 60); ctx.fillStyle = '#161927'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(`${v.toLocaleString('en-US')}${v >= target ? '+' : ''}`, px + pw / 2, py + 70);
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#3b4672'; ctx.fillText(P.countLabel || 'voter guides checked', px + pw / 2, py + 108);
    ctx.restore();
  }
  void mixHex;
}
