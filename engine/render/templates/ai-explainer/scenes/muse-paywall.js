// Scene "muse-paywall" (full frame). An AI app's best model goes behind a paywall. Generic cartoon phone UI, no logos.
// mode "price"  : living room at night, a person on the sofa with a phone; a big phone screen floats in showing a chat
//                 app with a glowing model button; a padlock slams on the button (lockCue), plan cards slide up
//                 (tierCue), an extra wide pill pops (coderCue).
// mode "free"   : two phones side by side: free tier (small robot) vs paid tier (big glowing robot behind a lock);
//                 an arrow arcs from paid to free with a "next" label (nextCue), then a calendar "?" + date chip (dateCue).
// mode "payoff" : the sofa shot again; the locked button gets a swinging price tag (tagCue) and a big question (qCue).
// Fits: "the best model is paid", "free users get the small model", "would you pay?".
// params: mode; app (screen title, default "Muse"); model (button text, default "Wonder")
//   price : tiers [2 strings], coder (pill text, '' hides), lockCue, tierCue, coderCue
//   free  : freeLabel, paidLabel, next, date, freeCue, nextCue, dateCue
//   payoff: tagText, question, tagCue, qCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic, roundRect, mixHex } = H;
  const D = info.duration, ACC = info.accent, mode = P.mode || 'price';
  const tw = (w, f) => { const v = w ? info.timeOf(w) : null; return v != null ? v : D * f; };
  const app = P.app || 'Muse', model = P.model || 'Wonder';

  // ---------------------------------------------------------------- big phone with a chat app screen
  function bigPhone(cx, top, w, h, o) {
    const r = 40;
    K.shadow(ctx, cx, top + h + 6, w * 1.1);
    roundRect(ctx, cx - w / 2 - 12, top - 12, w + 24, h + 24, r + 10); ctx.fillStyle = '#1c2033'; ctx.fill();
    roundRect(ctx, cx - w / 2 - 12, top - 12, w + 24, h + 24, r + 10); ctx.lineWidth = 3; ctx.strokeStyle = '#3b4260'; ctx.stroke();
    roundRect(ctx, cx - w / 2, top, w, h, r); ctx.fillStyle = '#121527'; ctx.fill();
    ctx.save(); roundRect(ctx, cx - w / 2, top, w, h, r); ctx.clip();
    if (o.glow) K.glow(ctx, cx, top + h * 0.55, w * 0.9, ACC, 0.18 * o.glow);
    // header
    ctx.fillStyle = '#1d2240'; ctx.fillRect(cx - w / 2, top, w, 84);
    ctx.font = H.font('display', 32); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
    ctx.fillText(o.title || app, cx, top + 46);
    if (o.draw) o.draw(cx, top, w, h);
    ctx.restore();
    roundRect(ctx, cx - 40, top + 10, 80, 14, 7); ctx.fillStyle = '#0b0d18'; ctx.fill();
  }
  // chat bubbles that keep arriving (pure function of t)
  function bubbles(cx, top, w, yBottom, n, every, t0) {
    let yy = yBottom;
    for (let i = n - 1; i >= 0; i--) {
      const tt = t - t0 - i * every; if (tt <= 0) continue;
      const me = i % 2 === 1, bw = w * (0.42 + 0.22 * H.hash(i, 3)), bh = 46;
      const p = K.popIn(tt, 0, 0.35);
      const bx = me ? cx + w / 2 - 22 - bw : cx - w / 2 + 22;
      ctx.save(); ctx.translate(bx + bw / 2, yy - bh / 2); ctx.scale(p, p); ctx.translate(-(bx + bw / 2), -(yy - bh / 2));
      roundRect(ctx, bx, yy - bh, bw, bh, 18); ctx.fillStyle = me ? mixHex(ACC, '#000000', 0.15) : '#2e3557'; ctx.fill();
      ctx.globalAlpha = 0.55; roundRect(ctx, bx + 16, yy - bh + 14, bw - 32, 7, 3.5); ctx.fillStyle = me ? K.ACCENT.deep : '#ffffff'; ctx.fill();
      roundRect(ctx, bx + 16, yy - bh + 27, (bw - 32) * 0.6, 7, 3.5); ctx.fill(); ctx.globalAlpha = 1;
      ctx.restore();
      yy -= (bh + 14) * clamp(tt / 0.25);
    }
  }
  // model button with optional lock
  function modelButton(cx, y, w, lock, t0) {
    const glowA = 1 - 0.75 * lock;
    K.glow(ctx, cx, y, w * 0.8, ACC, 0.35 * glowA * (0.8 + 0.2 * Math.sin(t * 4)));
    roundRect(ctx, cx - w / 2, y - 38, w, 76, 38); ctx.fillStyle = mixHex(ACC, '#4a5070', lock * 0.85); ctx.fill();
    ctx.font = H.font('display', 34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = mixHex(K.ACCENT.deep, '#c9cfe0', lock); ctx.fillText(model, cx - (lock > 0 ? 18 : 0) * smooth(lock), y + 2);
    if (lock > 0) {
      const drop = 1 - easeOutCubic(clamp(lock * 1.4));
      const sh = K.shake(t, t0 + 0.32, 0.4, 6);
      K.drawLock(ctx, cx + w / 2 - 34 + sh, y + 40 - drop * 160, 0.72, { open: 0 });
    }
  }

  if (mode === 'price' || mode === 'payoff') {
    const room = K.world.livingRoomNight(ctx, { t, lampOn: true });
    const sx = room.sofa.x, fy = room.sofa.feetY;
    K.drawPerson(ctx, sx - 170, fy, 1.7, { pose: 'sit-phone', seat: false, t, typing: 1, mood: mode === 'payoff' ? 'worried' : 'neutral', skin: 1, hair: 2, shirt: 3, hairStyle: 'long', seed: 8, look: 0.6 });
    // scrim so the floating UI reads
    ctx.fillStyle = 'rgba(8,10,24,0.42)'; ctx.fillRect(0, 0, 1080, 1920);
    const tLock = mode === 'payoff' ? -1 : tw(P.lockCue, 0.15);
    const tIn = mode === 'payoff' ? 0 : 0.1;
    const ph = K.popIn(t, tIn, 0.55);
    const lock = mode === 'payoff' ? 1 : H.phase(t, tLock, tLock + 0.45);
    const cx = 660, top = 430, w = 330, h = 560;
    ctx.save(); ctx.translate(cx, top + h); ctx.scale(ph, ph); ctx.translate(-cx, -(top + h));
    ctx.translate(0, K.bob(t, 5, 0.35));
    bigPhone(cx, top, w, h, {
      glow: 1 - lock * 0.7,
      draw: (x, y0, ww) => {
        bubbles(x, y0, ww, y0 + 400, 5, 0.7, tIn + 0.2);
        modelButton(x, y0 + 470, ww - 70, lock, tLock);
      },
    });
    ctx.restore();

    if (mode === 'price') {
      const tTier = tw(P.tierCue, 0.45), tCoder = tw(P.coderCue, 0.75);
      const tiers = (P.tiers || ['$20/mo', '$100/mo']).slice(0, 3);
      tiers.forEach((txt, i) => {
        const p = K.popIn(t, tTier + i * 0.45, 0.5);
        if (p <= 0) return;
        const x = 250, y = 425 + i * 130, ww = 290, hh = 110;
        ctx.save(); ctx.translate(x, y + hh / 2); ctx.scale(p, p); ctx.translate(-x, -(y + hh / 2));
        K.glow(ctx, x, y + hh / 2, 180, ACC, 0.22);
        roundRect(ctx, x - ww / 2, y, ww, hh, 22); ctx.fillStyle = '#f2f4fa'; ctx.fill();
        roundRect(ctx, x - ww / 2, y, 16, hh, 8); ctx.fillStyle = ACC; ctx.fill();
        ctx.font = H.font('display', 52); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#161927';
        ctx.fillText(txt, x + 8, y + hh / 2 + 3);
        ctx.restore();
      });
      if (P.coder !== '') {
        const cp = K.popIn(t, tCoder, 0.5);
        if (cp > 0) {
          K.drawLaptop(ctx, 255, 1000, 0.8 * cp, { t, screen: 'code', typing: true });
          K.drawLabel(ctx, 487, 1040, cp, { text: P.coder || 'Pro: more', size: 30, accent: true });
        }
      }
    } else {
      const tTag = tw(P.tagCue, 0.35), tQ = tw(P.qCue, 0.65);
      const tp = H.phase(t, tTag, tTag + 0.6, easeOutCubic);
      if (tp > 0) {
        const swing = Math.sin((t - tTag) * 5) * 0.35 * Math.exp(-(t - tTag) * 1.4);
        ctx.save(); ctx.translate(cx + 120, 900 - (1 - tp) * 300); ctx.rotate(swing);
        K.drawPriceTag(ctx, 0, 190, 1.35, { text: P.tagText || '$20', t: 0, shadow: false });
        ctx.restore();
      }
      const qp = K.popIn(t, tQ, 0.5);
      if (qp > 0) {
        ctx.save(); ctx.translate(487, 470); ctx.scale(qp, qp);
        const txt = P.question || 'Would you pay?';
        const fs = H.fitText(ctx, txt, 'display', 58, 30, 800).size;
        ctx.font = H.font('display', fs);
        const bw = ctx.measureText(txt).width + 70;
        K.glow(ctx, 0, 0, bw * 0.6, ACC, 0.35);
        roundRect(ctx, -bw / 2, -fs * 0.95, bw, fs * 1.9, 26); ctx.fillStyle = ACC; ctx.fill();
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = K.ACCENT.deep; ctx.fillText(txt, 0, 3);
        ctx.restore();
      }
    }
    return;
  }

  // ---------------------------------------------------------------- mode "free": two phones compared
  K.world.room(ctx, { t, time: 'night', window: true, lamp: true, plant: true });
  ctx.fillStyle = 'rgba(8,10,24,0.38)'; ctx.fillRect(0, 0, 1080, 1920);
  const tFree = tw(P.freeCue, 0.05), tNext = tw(P.nextCue, 0.45), tDate = tw(P.dateCue, 0.8);
  const L = { x: 280, top: 600, w: 290, h: 420 }, R = { x: 700, top: 600, w: 290, h: 420 };
  const lp = K.popIn(t, Math.min(0.1, tFree), 0.5), rp = K.popIn(t, Math.min(0.1, tFree) + 0.35, 0.5);
  const upg = H.phase(t, tNext + 0.6, tNext + 1.4, easeOutCubic); // free phone gets a glow hint after "next"
  if (lp > 0) {
    ctx.save(); ctx.translate(L.x, L.top + L.h); ctx.scale(lp, lp); ctx.translate(-L.x, -(L.top + L.h));
    bigPhone(L.x, L.top, L.w, L.h, { title: P.freeLabel || 'Free', glow: 0.3 + 0.7 * upg, draw: (x, y0) => {
      K.drawRobot(ctx, x, y0 + 360, 0.85, { t, state: 'idle', seed: 2 });
    } });
    ctx.restore();
  }
  if (rp > 0) {
    ctx.save(); ctx.translate(R.x, R.top + R.h); ctx.scale(rp, rp); ctx.translate(-R.x, -(R.top + R.h));
    bigPhone(R.x, R.top, R.w, R.h, { title: P.paidLabel || 'Paid', glow: 1, draw: (x, y0) => {
      K.glow(ctx, x, y0 + 240, 180, ACC, 0.45);
      K.drawRobot(ctx, x, y0 + 395, 1.3, { t, state: 'happy', seed: 6 });
    } });
    K.drawLock(ctx, R.x + R.w / 2 - 20, R.top + 200, 0.75, { open: 0 });
    ctx.restore();
  }
  // arrow from paid to free
  const ap = H.phase(t, tNext, tNext + 0.8, easeOutCubic);
  if (ap > 0) {
    const pts = K.motion.bezier(R.x - 40, R.top - 30, R.x - 120, R.top - 150, L.x + 120, L.top - 150, L.x + 40, L.top - 30, 40);
    ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.setLineDash([22, 16]); ctx.lineDashOffset = -t * 40;
    K.motion.pathDraw(ctx, pts, ap); ctx.restore();
    if (ap > 0.95) {
      const [hx, hy] = [L.x + 40, L.top - 30];
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(Math.atan2(30, -80) + Math.PI);
      ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(-14, -18); ctx.lineTo(-14, 18); ctx.closePath(); ctx.fillStyle = ACC; ctx.fill(); ctx.restore();
    }
    const nl = K.popIn(t, tNext + 0.3, 0.45);
    if (nl > 0) K.drawLabel(ctx, 490, 460, nl, { text: P.next || 'Coming next', size: 30, accent: true });
  }
  // calendar + date chip
  const cp = K.popIn(t, tDate, 0.5);
  if (cp > 0) {
    const cx = 490, cy = 800;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(cp, cp); ctx.rotate(-0.05 + 0.03 * Math.sin(t * 2));
    K.glow(ctx, 0, 0, 130, ACC, 0.3);
    roundRect(ctx, -62, -62, 124, 124, 14); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    roundRect(ctx, -62, -62, 124, 34, 14); ctx.fillStyle = K.NEUTRAL.danger; ctx.fill(); ctx.fillRect(-62, -42, 124, 14);
    ctx.font = H.font('display', 66); ctx.fillStyle = '#2a2f45'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 20);
    ctx.restore();
    K.drawLabel(ctx, 490, 1045, cp, { text: P.date || 'Date: ?', size: 30 });
  }
}
