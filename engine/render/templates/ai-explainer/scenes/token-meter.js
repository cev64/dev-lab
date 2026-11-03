// Scene "token-meter" (full frame, 1 beat). A night home office: three AI-agent robots work at laptops along one
// long desk; glowing token chips stream up three tubes into a big wall-mounted taxi-style meter labelled "TOKEN
// BILL" whose digits race. Nobody else is drawn (the speaker stays off-screen).
// modes:
//  hook (cold open): digits already racing at frame 0, slam onto `amount` ("$100,000") on `hitCue` (default 1.6 s)
//        with a burst, coins spray, a "per year" tag swings under the display.
//  day:  the display shows the year figure, then on dayCue rolls down to `day` ("$300") with "a day" tag; a
//        verbatim quote pill (`quote`, `by`) lands on quoteCue; on predCue the desk dims, a calendar card (`when`)
//        and a prediction pill (`pred`) drop in and a row of five everyday cartoon people get a mini robot each.
// params: mode, label, amount, per, day, dayPer, quote, by, when, pred; cues hitCue, dayCue, quoteCue, predCue
//         (narration words, "word#n" = (n+1)th time, or seconds)
// Defaults are generic placeholders ($100,000 / $300, "Speaker", placeholder quote); the racing digits follow
// whatever numbers `amount` and `day` hold.
// Fits: AI bills / token spend / compute cost stories, "how much running agents costs".
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba, easeOutCubic } = H;
  const at = (w, d) => {
    if (w == null || w === '') return d;
    if (typeof w === 'number') return w;
    const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? d : v;
  };
  const mode = P.mode || 'hook';
  const amount = P.amount || '$100,000', per = P.per || 'PER YEAR', dayTxt = P.day || '$300';
  // the racing digits are derived from the numbers in `amount` / `day` (prefix = whatever precedes the first digit)
  const num = (s) => { const v = parseFloat(String(s).replace(/[^0-9.]/g, '')); return isFinite(v) ? v : 0; };
  const amtN = num(amount), dayN = num(dayTxt), pre = (String(amount).match(/^[^0-9]*/) || [''])[0] || '$';
  const tHit = mode === 'hook' ? at(P.hitCue, 1.6) : -1;
  const tDay = mode === 'day' ? at(P.dayCue, D * 0.25) - 0.1 : Infinity;
  const tQuote = mode === 'day' ? at(P.quoteCue, D * 0.5) - 0.2 : Infinity;
  const tPred = mode === 'day' ? at(P.predCue, D * 0.68) - 0.2 : Infinity;

  ctx.save();
  if (mode === 'hook') K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 487, y: 690 }, { t: Math.max(0.5, tHit), zoom: 1.0, x: 487, y: 720 }, { t: D, zoom: 1.02, x: 487, y: 715 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 735 }]);
  if (mode === 'hook' && t > tHit && t < tHit + 0.5) K.cameraShake(ctx, t, tHit, 0.4, 7);
  K.world.room(ctx, { t, time: 'night', floorY: 1000, lamp: true, window: false, picture: false, plant: false });

  // ---- three robots at one long desk ----
  const xs = [220, 487, 754], feet = 1040, deskTop = feet - 110 * 0.92;
  const dim = clamp((t - tPred) / 0.6);
  xs.forEach((x, i) => {
    K.drawRobot(ctx, x, feet - 70, 0.92, { t: t + i * 0.37, state: 'working', seed: 3 + i });
  });
  xs.forEach((x) => K.drawDesk(ctx, x, feet, 0.92));
  xs.forEach((x, i) => K.drawLaptop(ctx, x, deskTop, 0.62, { t: t + i * 0.5, screen: ['code', 'chat', 'chart'][i], typing: 1 }));

  // ---- tubes from each laptop up to the meter, with chips flowing ----
  const MX = 487, MY0 = 445, MW = 600, MH = 200, MY1 = MY0 + MH;
  const tubes = xs.map((x, i) => {
    const sx = x, sy = deskTop - 95, ex = MX + (i - 1) * 150, ey = MY1 - 4;
    return K.bezier(sx, sy, sx, sy - 90, ex, ey + 110, ex, ey, 22);
  });
  const flow = mode === 'hook' ? 1 : (t < tPred ? 0.7 : 0.7 * (1 - dim));
  tubes.forEach((pts, i) => {
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(160,175,220,0.22)'; ctx.lineWidth = 22; K.pathDraw(ctx, pts, 1);
    ctx.strokeStyle = rgba(ACC, 0.25 + 0.2 * flow); ctx.lineWidth = 6; K.pathDraw(ctx, pts, 1);
    ctx.restore();
    const speed = mode === 'hook' ? 1.4 : 0.8;
    for (let k = 0; k < 5; k++) {
      const u = ((t * speed + k / 5 + i * 0.13) % 1);
      const q = K.pathPoint(pts, u);
      ctx.save(); ctx.globalAlpha = flow; ctx.translate(q[0], q[1]); ctx.rotate(Math.sin(t * 3 + k) * 0.3);
      roundRect(ctx, -15, -11, 30, 22, 6); ctx.fillStyle = ACC; ctx.fill();
      ctx.fillStyle = 'rgba(20,24,40,0.85)'; ctx.fillRect(-8, -3, 16, 6);
      ctx.restore();
    }
  });

  // ---- the meter ----
  const hitK = mode === 'hook' ? clamp((t - tHit) / 0.25) : 1;
  ctx.save();
  const sq = mode === 'hook' && t > tHit ? 1 + 0.06 * Math.exp(-(t - tHit) * 6) * Math.cos((t - tHit) * 30) : 1;
  ctx.translate(MX, MY0 + MH / 2); ctx.scale(sq, sq); ctx.translate(-MX, -(MY0 + MH / 2));
  if (mode === 'hook' && t > tHit) K.glow(ctx, MX, MY0 + MH / 2, 420, ACC, 0.35 * Math.exp(-(t - tHit) * 1.5) + 0.12);
  else K.glow(ctx, MX, MY0 + MH / 2, 380, ACC, 0.12);
  roundRect(ctx, MX - MW / 2 + 8, MY0 + 10, MW, MH, 26); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
  roundRect(ctx, MX - MW / 2, MY0, MW, MH, 26); ctx.fillStyle = '#23283f'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = '#3b4266'; ctx.stroke();
  // label strip
  roundRect(ctx, MX - 150, MY0 - 22, 300, 44, 22); ctx.fillStyle = ACC; ctx.fill();
  ctx.fillStyle = '#10131f'; ctx.font = K.font.display(26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(P.label || 'TOKEN BILL', MX, MY0 + 1);
  // display window
  const DX0 = MX - MW / 2 + 30, DY0 = MY0 + 38, DW = MW - 60, DH = 118;
  roundRect(ctx, DX0, DY0, DW, DH, 14); ctx.fillStyle = '#0a0c14'; ctx.fill();
  // digits
  let txt;
  if (mode === 'hook') {
    if (t < tHit) { const x = lerp(amtN * 0.06, amtN * 0.995, clamp(t / Math.max(0.3, tHit)) ** 0.6); const n = amtN >= 700 ? Math.floor(x / 7) * 7 : Math.floor(x); txt = pre + n.toLocaleString('en-US'); }
    else txt = amount;
  } else {
    if (t < tDay) txt = amount;
    else if (t < tDay + 0.7) { const u = easeOutCubic((t - tDay) / 0.7); const n = Math.round(lerp(amtN, dayN, u)); txt = pre + n.toLocaleString('en-US'); }
    else txt = dayTxt;
  }
  const f = H.fitText(ctx, txt, 'display', 92, 50, DW - 40);
  ctx.font = f.font; ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.shadowColor = ACC; ctx.shadowBlur = 18; ctx.fillText(f.text, MX, DY0 + DH / 2 + 4); ctx.shadowBlur = 0;
  // little blinking LEDs
  for (let j = 0; j < 3; j++) {
    const on = (Math.floor(t * 3 + j) % 3) === 0;
    ctx.beginPath(); ctx.arc(MX - MW / 2 + 44 + j * 26, MY1 - 22, 7, 0, Math.PI * 2); ctx.fillStyle = on ? ACC : '#3b4266'; ctx.fill();
  }
  ctx.restore();

  // per-year / per-day tag swinging under the meter
  const showTag = mode === 'hook' ? t > tHit : true;
  if (showTag) {
    const t0 = mode === 'hook' ? tHit + 0.1 : 0.1;
    const dayNow = t >= tDay + 0.5;
    const tg = dayNow ? (P.dayPer || 'PER DAY') : per;
    const p = K.popIn(t, dayNow ? tDay + 0.5 : t0, 0.4);
    const sw = Math.sin((t - t0) * 4) * 0.06 * Math.exp(-(t - t0) * 1.2);
    ctx.save(); ctx.translate(MX, MY1 + 18); ctx.rotate(sw);
    K.drawLabel(ctx, 0, 62, p, { text: tg, size: 30, accent: true });
    ctx.restore();
  }

  // coins spray out of the meter on the hit
  if (mode === 'hook' && t > tHit) {
    for (let j = 0; j < 10; j++) {
      const lt = t - tHit - j * 0.06; if (lt < 0 || lt > 1.6) continue;
      const side = j % 2 ? 1 : -1, vx = side * (180 + (j * 37) % 140), vy = -380 - (j * 53) % 160;
      const x = MX + side * (MW / 2 - 30) + vx * lt, y = MY0 + 60 + vy * lt + 700 * lt * lt;
      if (y > 1000) continue;
      K.drawCoin(ctx, x, y, 0.6, { spin: lt * 12 + j, symbol: '$' });
    }
  }

  // ---- day mode: quote pill, then the prediction ----
  if (mode === 'day') {
    if (t > tQuote && t < tPred + 0.4) {
      const p = K.popIn(t, tQuote, 0.45), fo = 1 - clamp((t - tPred) / 0.4);
      ctx.save(); ctx.globalAlpha = fo;
      const qw = 640, qy = 835;
      ctx.translate(MX, qy); ctx.scale(p, p);
      roundRect(ctx, -qw / 2, -60, qw, 120, 22); ctx.fillStyle = 'rgba(8,10,22,0.94)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.8); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = K.font.display(44); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(P.quote || '“Quote here”', 0, -14);
      ctx.fillStyle = '#b9c1d6'; ctx.font = K.font.ui(24); ctx.fillText('— ' + (P.by || 'Speaker'), 0, 34);
      ctx.restore();
    }
    if (dim > 0) {
      // scrim over the desk + meter, then a calendar card + the prediction pill, a row of everyday people
      ctx.fillStyle = `rgba(6,8,18,${0.9 * dim})`; ctx.fillRect(0, 0, 1080, 1920);
      const cp = K.popIn(t, tPred + 0.1, 0.5);
      if (cp > 0) {
        ctx.save(); ctx.translate(MX, 560); ctx.scale(cp, cp);
        // calendar
        const cw = 200, ch = 170;
        roundRect(ctx, -cw / 2 - 210, -ch / 2, cw, ch, 16); ctx.fillStyle = '#f2f4fa'; ctx.fill();
        roundRect(ctx, -cw / 2 - 210, -ch / 2, cw, 46, 16); ctx.fillStyle = ACC; ctx.fill(); ctx.fillRect(-cw / 2 - 210, -ch / 2 + 30, cw, 16);
        ctx.fillStyle = '#283152'; for (let a = 0; a < 5; a++) for (let b = 0; b < 3; b++) ctx.fillRect(-cw / 2 - 210 + 22 + a * 33, -ch / 2 + 64 + b * 30, 20, 18);
        // flipping pages
        const flip = (t - tPred) % 1.2;
        if (t < D - 0.6 && flip < 0.35) { ctx.save(); ctx.globalAlpha = 1 - flip / 0.35; ctx.fillStyle = '#ffffff'; roundRect(ctx, -cw / 2 - 210, -ch / 2 + 46 - flip * 120, cw, 30, 6); ctx.fill(); ctx.restore(); }
        // when text
        ctx.fillStyle = '#ffffff'; ctx.font = K.font.display(54); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        const wf = H.fitText(ctx, P.when || 'In a few years?', 'display', 54, 34, 420); ctx.font = wf.font;
        ctx.fillText(wf.text, -90, 0);
        ctx.restore();
      }
      const pp = K.popIn(t, tPred + 0.5, 0.45);
      if (pp > 0) {
        ctx.save(); ctx.font = K.font.ui(28);
        const pf = H.fitText(ctx, P.pred || 'The prediction', 'ui', 28, 20, 780);
        ctx.restore();
        K.drawLabel(ctx, MX, 720, pp, { text: pf.text, size: Math.round(pf.size || 28) });
      }
      // everyday people, each gets a mini robot helper
      const px = [150, 320, 487, 654, 824];
      px.forEach((x, i) => {
        const tin = tPred + 0.3 + i * 0.12, k = clamp((t - tin) / 0.5);
        if (k <= 0) return;
        ctx.save(); ctx.globalAlpha = k;
        K.shadow(ctx, x, 1040, 110);
        K.drawPerson(ctx, x, 1040 + (1 - easeOutCubic(k)) * 40, 0.92, { t: t + i, pose: i % 2 ? 'phone' : 'stand', mood: 'happy', skin: i % 5, hair: (i + 2) % 5, shirt: (i + 1) % 5, hairStyle: ['short', 'long', 'curly', 'bun', 'short'][i], seed: 20 + i, look: (2 - i) * 0.3 });
        ctx.restore();
        const rp = K.popIn(t, tin + 0.9 + i * 0.15, 0.4);
        if (rp > 0) {
          const bob = Math.sin(t * 3 + i) * 5;
          ctx.save(); ctx.translate(x + 62, 860 + bob); ctx.scale(rp, rp);
          K.drawRobot(ctx, 0, 0, 0.36, { t: t + i, state: 'happy', seed: 30 + i });
          ctx.restore();
        }
      });
    }
  }
  ctx.restore();
}
