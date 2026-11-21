// Scene "rival-door" (full frame, one beat). Review hall at dusk: proof A (a folder on an easel, with a robot badge and
// a text tag) waits under a REVIEW sign while three generic cartoon reviewers with magnifying glasses stand below.
// On twistCue proof B whooshes in onto a second easel (text tag + who pill); on quoteCue a verbatim quote ribbon
// lands on it; on laterCue a time pill pops and the reviewers swing their magnifiers over B; on flagCue red "!" flags
// pop out of B; on aiCue tiny robot chips light on the magnifiers ("found with AI's help" pill); on neitherCue the
// sign becomes a banner (e.g. "Neither accepted yet") and both folders get hourglasses.
// Fits: "two rival claims / a counter-claim arrives / both under review" stories.
// params: sign, aTag, bTag, who, quote, later, ai, neither, cues: twistCue, whoCue, quoteCue, laterCue, flagCue,
//         aiCue, neitherCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, easeInOutCubic } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tTwist = at(P.twistCue, D * 0.1) - 0.3;
  const tWho = at(P.whoCue, D * 0.18) - 0.2;
  const tQuote = at(P.quoteCue, D * 0.4) - 0.2;
  const tLater = at(P.laterCue, D * 0.57) - 0.2;
  const tFlag = at(P.flagCue, D * 0.68) - 0.2;
  const tAI = at(P.aiCue, D * 0.78) - 0.2;
  const tNo = at(P.neitherCue, D * 0.9) - 0.25;
  const feet = 1035;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 520, y: 700 }, { t: tTwist + 0.8, zoom: 1.0, x: 487, y: 725 }, { t: tLater, zoom: 1.0, x: 487, y: 725 }, { t: tFlag + 0.8, zoom: 1.05, x: 600, y: 700 }, { t: tNo, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.02, x: 487, y: 720 }]);
  K.world.office(ctx, { t, time: 'dusk' });
  ctx.fillStyle = 'rgba(10,12,30,0.35)'; ctx.fillRect(0, 0, 1080, 1920);

  // easel + folder helper
  const folder = (x, y, s, tag, robot, k) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = '#764d31'; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-60, 120); ctx.lineTo(-95, 330); ctx.moveTo(60, 120); ctx.lineTo(95, 330); ctx.stroke();
    H.roundRect(ctx, -125, -150, 250, 290, 14); ctx.fillStyle = '#e7c46a'; ctx.fill();
    H.roundRect(ctx, -125, -170, 110, 34, 10); ctx.fill();
    H.roundRect(ctx, -108, -132, 216, 255, 8); ctx.fillStyle = '#f4f1e8'; ctx.fill();
    ctx.fillStyle = '#1c2033'; ctx.font = H.font('display', 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('PROOF', 0, -98);
    ctx.fillStyle = '#c9ccd8'; for (let l = 0; l < 6; l++) ctx.fillRect(-84, -64 + l * 26, 168 - (l % 3) * 34, 9);
    if (robot) { // small robot badge
      ctx.save(); ctx.translate(72, 92);
      ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fillStyle = '#1c2033'; ctx.fill();
      H.roundRect(ctx, -19, -13, 38, 26, 9); ctx.fillStyle = '#e8ebf3'; ctx.fill();
      H.roundRect(ctx, -14, -8, 28, 16, 6); ctx.fillStyle = '#1c2033'; ctx.fill();
      ctx.fillStyle = ACC; ctx.fillRect(-9, -4, 5, 8); ctx.fillRect(4, -4, 5, 8);
      ctx.restore();
    }
    ctx.restore();
    if (tag) pill(H, ctx, x, y + 170 * s, k, tag, ACC, false, 24);
  };

  const ax = 270, bx = 712, fy = 615, FS = 0.86;
  folder(ax, fy, FS, String(P.aTag || 'Proof A'), true, 1);
  // proof B whooshes in from the right
  const bIn = easeOutCubic(clamp((t - tTwist) / 0.7));
  if (bIn > 0) {
    const xx = lerp(1300, bx, bIn);
    if (bIn < 1) { ctx.save(); ctx.strokeStyle = H.rgba('#ffffff', 0.5 * (1 - bIn)); ctx.lineWidth = 5; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(xx + 140, fy - 80 + i * 50); ctx.lineTo(xx + 260, fy - 80 + i * 50); ctx.stroke(); } ctx.restore(); }
    ctx.save(); ctx.translate(xx, fy); ctx.rotate((1 - bIn) * 0.25 + Math.sin((t - tTwist) * 10) * 0.04 * Math.exp(-(t - tTwist - 0.7) * 3) * (bIn >= 1 ? 1 : 0)); ctx.translate(-xx, -fy);
    folder(xx, fy, FS, String(P.bTag || 'Proof B'), false, K.popIn(t, tTwist + 0.5, 0.4));
    ctx.restore();
  }
  // who pill on B
  const wk = K.popIn(t, tWho, 0.4);
  if (wk > 0) pill(H, ctx, bx, 466, wk * (1 - smooth((t - tLater + 0.1) / 0.3)), String(P.who || 'a rival'), ACC, true, 24);
  // quote ribbon across B
  const qk = K.popIn(t, tQuote, 0.45);
  if (qk > 0) {
    ctx.save(); ctx.translate(bx, fy + 45); ctx.rotate(-0.08); ctx.scale(Math.min(1.05, qk), Math.min(1.05, qk));
    const q = '“' + String(P.quote || 'quote') + '”';
    const f = H.fitText(ctx, q, 'bold', 28, 18, 300); ctx.font = f.font;
    const w = ctx.measureText(f.text).width + 44;
    H.roundRect(ctx, -w / 2, -30, w, 60, 10); ctx.fillStyle = 'rgba(10,12,24,0.95)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
    ctx.restore();
  }
  // reviewers with magnifiers
  const rv = [{ x: 330, sk: 0, hr: 3, sh: 4, hs: 'none' }, { x: 520, sk: 4, hr: 0, sh: 3, hs: 'curly' }, { x: 848, sk: 1, hr: 2, sh: 1, hs: 'long' }];
  const swing = easeInOutCubic(clamp((t - tLater - 0.2) / 0.9));
  rv.forEach((r, i) => {
    const s = 0.86;
    K.drawPerson(ctx, r.x, feet, s, { t, pose: 'point', flip: r.x > bx, mood: t > tFlag ? 'worried' : 'neutral', skin: r.sk, hair: r.hr, shirt: r.sh, hairStyle: r.hs, seed: 11 + i, look: r.x > bx ? -0.5 : 0.5 });
    const hand = [r.x + (r.x > bx ? -62 : 62) * s, feet - 158 * s];
    const rest = [hand[0] + (r.x > bx ? -34 : 34), hand[1] - 30];
    const tgt = [bx + [-50, 30, 55][i] + Math.sin(t * 1.7 + i * 2) * 22, fy + [-60, -95, -20][i] + Math.cos(t * 1.3 + i) * 14];
    const restA = i === 0 ? [ax + 30 + Math.sin(t * 1.5) * 22, fy - 40] : rest;
    const lens = [lerp(restA[0], tgt[0], swing), lerp(restA[1], tgt[1], swing)];
    magnifier(H, ctx, hand, lens, 40, ACC, K.popIn(t, tAI + i * 0.15, 0.4));
  });
  // red flags on B
  const flags = [[-108, -30], [92, 0], [100, -100]];
  flags.forEach((p, i) => {
    const k = K.popIn(t, tFlag + i * 0.22, 0.35);
    if (k <= 0) return;
    ctx.save(); ctx.translate(bx + p[0], fy - 20 + p[1]); ctx.scale(k * 1.35, k * 1.35); ctx.rotate(Math.sin(t * 5 + i) * 0.08);
    ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 30); ctx.lineTo(0, -40); ctx.stroke();
    ctx.fillStyle = '#ff5a4e'; ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(50, -28); ctx.lineTo(0, -14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('display', 20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', 16, -27);
    ctx.restore();
  });

  const aik = K.popIn(t, tAI + 0.3, 0.4);
  if (aik > 0) pill(H, ctx, bx, 466, aik * (1 - smooth((t - tNo + 0.2) / 0.3)), String(P.ai || "found with AI's help"), ACC, true, 24);
  ctx.restore();

  // later pill + top sign / banner (screen space)
  const lk = K.popIn(t, tLater, 0.4) * (1 - smooth((t - tFlag - 0.6) / 0.3));
  if (lk > 0.01) clockPill(H, ctx, bx, 466, lk, String(P.later || 'Hours later'), ACC, t);
  const sgn = K.popIn(t, 0.05, 0.4) * (1 - smooth((t - tNo) / 0.25));
  if (sgn > 0.01) pill(H, ctx, ax, 466, sgn, String(P.sign || 'UNDER REVIEW'), ACC, false, 26);
  const nk = K.popIn(t, tNo + 0.15, 0.45);
  if (nk > 0) {
    ctx.save(); ctx.translate(487, 468); ctx.scale(Math.min(1.05, nk), Math.min(1.05, nk));
    const txt = String(P.neither || 'Neither accepted yet');
    ctx.font = H.font('display', 40); const w = ctx.measureText(txt).width + 140;
    H.roundRect(ctx, -w / 2, -40, w, 80, 40); ctx.fillStyle = ACC; ctx.fill();
    hourglassIcon(ctx, -w / 2 + 48, 0, 0.9, '#14160a', t);
    ctx.fillStyle = '#14160a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 30, 3);
    ctx.restore();
    // small hourglasses on both folders
    for (const x of [ax, bx]) {
      const k = K.popIn(t, tNo + 0.4, 0.4);
      if (k <= 0) continue;
      ctx.save(); ctx.translate(x + 92, 530); ctx.scale(k, k);
      ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fillStyle = 'rgba(10,12,24,0.94)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
      hourglassIcon(ctx, 0, 0, 0.9, ACC, t);
      ctx.restore();
    }
  }
}

function magnifier(H, ctx, hand, lens, r, ACC, ai) {
  ctx.save();
  const dx = lens[0] - hand[0], dy = lens[1] - hand[1], d = Math.hypot(dx, dy) || 1;
  const ex = lens[0] - (dx / d) * r, ey = lens[1] - (dy / d) * r;
  ctx.strokeStyle = '#5a3d2c'; ctx.lineWidth = 11; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(hand[0], hand[1]); ctx.lineTo(ex, ey); ctx.stroke();
  ctx.beginPath(); ctx.arc(lens[0], lens[1], r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(190,225,255,0.22)'; ctx.fill();
  ctx.lineWidth = 8; ctx.strokeStyle = '#2b3042'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(lens[0] - r * 0.35, lens[1] - r * 0.35, r * 0.22, 0, Math.PI * 2); ctx.fill();
  if (ai > 0) { // tiny robot chip on the rim
    ctx.save(); ctx.translate(lens[0] + r * 0.72, lens[1] - r * 0.72); ctx.scale(ai, ai);
    H.roundRect(ctx, -17, -12, 34, 24, 8); ctx.fillStyle = '#e8ebf3'; ctx.fill();
    H.roundRect(ctx, -12, -7, 24, 14, 5); ctx.fillStyle = '#1c2033'; ctx.fill();
    ctx.fillStyle = ACC; ctx.fillRect(-8, -4, 4, 7); ctx.fillRect(4, -4, 4, 7);
    ctx.restore();
  }
  ctx.restore();
}

function hourglassIcon(ctx, x, y, s, col, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 1.5) * 0.08);
  ctx.fillStyle = col; ctx.fillRect(-14, -20, 28, 4); ctx.fillRect(-14, 16, 28, 4);
  ctx.beginPath(); ctx.moveTo(-11, -16); ctx.lineTo(11, -16); ctx.lineTo(2, 0); ctx.lineTo(11, 16); ctx.lineTo(-11, 16); ctx.lineTo(-2, 0); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function clockPill(H, ctx, x, y, k, text, ACC, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  ctx.font = H.font('ui', 26); const w = ctx.measureText(text).width + 100, h = 50;
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(10,12,24,0.94)'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = ACC; ctx.stroke();
  const cx = -w / 2 + 32; ctx.beginPath(); ctx.arc(cx, 0, 15, 0, Math.PI * 2); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx + Math.cos(t * 8) * 10, Math.sin(t * 8) * 10); ctx.moveTo(cx, 0); ctx.lineTo(cx, -8); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 22, 2);
  ctx.restore();
}

function pill(H, ctx, x, y, k, text, ACC, solid, size = 32) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  const f = H.fitText(ctx, text, 'ui', size, 18, 400); ctx.font = f.font;
  const w = ctx.measureText(f.text).width + 52, h = size * 1.8;
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = solid ? ACC : 'rgba(10,12,24,0.92)'; ctx.fill();
  if (!solid) { ctx.lineWidth = 2.5; ctx.strokeStyle = ACC; ctx.stroke(); }
  ctx.fillStyle = solid ? '#14160a' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
  ctx.restore();
}
