// Scene "spend-meters" (full frame, one beat). Night street: up to three plain company buildings (names as text pills
// only, no logos) each wear a roof meter. A worried developer in front holds a phone that pings red "Spend alert"
// bubbles; on each company's cue coins stream from the phone to that building and its meter spins up. Then a big
// amount panel counts up ("Hundreds of dollars"), a second line lands ("A few: over $1,000"), and a source pill.
// Fits: "users got surprise charges", stolen keys / cards used to run up bills, any money-drain story.
// Defaults are generic placeholders ("Company A/B/C", "$100s"): pass the story's companies, published amounts, source.
// params (all optional): companies [{name, cue}] (<= 3), alert, amount, amountSub, big, source
//        cues: alertCue, amountCue, bigCue, sourceCue (narration words, "word#n" = (n+1)th time; else fractions)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent, RED = '#ff6b5e';
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const cos = (P.companies && P.companies.length ? P.companies : [{ name: 'Company A' }, { name: 'Company B' }, { name: 'Company C' }]).slice(0, 3);
  const tAlert = at(P.alertCue, 0.6);
  const tc = cos.map((c, i) => at(c.cue, D * (0.3 + i * 0.1)));
  const tAmt = at(P.amountCue, D * 0.65), tBig = at(P.bigCue, D * 0.82), tSrc = at(P.sourceCue, D * 0.9);
  const feet = 1045, bFeet = 815;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 487, y: 800 }, { t: tc[0], zoom: 1.0, x: 487, y: 740 }, { t: tAmt, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 715 }]);
  K.world.city(ctx, { t, time: 'night' });
  // a darker street band so the buildings read
  ctx.fillStyle = 'rgba(8,10,24,0.35)'; ctx.fillRect(0, 560, 1080, 360);

  const xs = [215, 487, 759], bS = 0.74, bTop = bFeet - (60 + 6 * 44) * bS;
  cos.forEach((c, i) => {
    const x = xs[i], hit = t >= tc[i], k = K.phase(t, tc[i], tc[i] + 0.6);
    K.drawBuilding(ctx, x, bFeet, bS, { t, color: ['#4b5a9a', '#6a4f8a', '#3f7a86'][i], floors: 6, lit: 0.25 + 0.6 * k });
    // meter on the facade: a round dial with a spinning needle
    const mx = x, my = bTop + 75;
    ctx.beginPath(); ctx.arc(mx, my, 56, 0, Math.PI * 2); ctx.fillStyle = '#1c2033'; ctx.fill();
    if (hit) K.glow(ctx, mx, my, 130, RED, 0.35 * (0.6 + 0.4 * Math.sin(t * 7 + i)));
    ctx.lineWidth = 6; ctx.strokeStyle = hit ? RED : '#3b4260'; ctx.beginPath(); ctx.arc(mx, my, 56, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(mx, my, 46, 0, Math.PI * 2); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    for (let j = 0; j < 8; j++) { const a = (j / 8) * Math.PI * 2; ctx.fillStyle = '#8a92b8'; ctx.fillRect(mx + Math.cos(a) * 37 - 2, my + Math.sin(a) * 37 - 2, 4, 4); }
    ctx.fillStyle = '#161927'; ctx.font = K.font.display(22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', mx, my + 22);
    const spin = hit ? (t - tc[i]) * (3 + 4 * k) : 0;
    ctx.save(); ctx.translate(mx, my); ctx.rotate(-Math.PI * 0.75 + spin);
    ctx.strokeStyle = RED; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -36); ctx.stroke(); ctx.restore();
    ctx.fillStyle = '#161927'; ctx.beginPath(); ctx.arc(mx, my, 6, 0, Math.PI * 2); ctx.fill();
    // name pill (text only) on the roof
    K.drawLabel(ctx, x, bTop - 18, K.popIn(t, tc[i] - 0.05, 0.4), { text: c.name, size: 28, accent: hit });
  });

  // developer with a phone, worried -> shocked
  const px = 487;
  const mood = t < tAlert ? 'neutral' : t < tAmt ? 'worried' : 'shocked';
  K.shadow(ctx, px, feet, 160);
  K.drawPerson(ctx, px, feet, 1.3, { t, pose: 'phone', mood, shirt: 2, hair: 1, hairStyle: 'short', skin: 2, seed: 4 });
  const phX = px + 34, phY = feet - 200;
  // alert bubbles: one at the alert cue, one per company cue
  const alerts = [tAlert, ...tc];
  alerts.forEach((a, i) => {
    if (t < a) return;
    const lt = t - a, k = K.popIn(t, a, 0.35);
    const side = i % 2 ? 1 : -1;
    const x = px + side * 207, y = [960, 930, 880, 850][i] - Math.min(lt, 1.2) * 10;
    ctx.save(); ctx.globalAlpha = K.fadeOut(t, tAmt - 0.3, 0.4);
    ctx.translate(x, y); ctx.scale(k, k);
    H.roundRect(ctx, -120, -26, 240, 52, 26); ctx.fillStyle = RED; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = K.font.ui(24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.alert || 'Spend alert!', 0, 1);
    ctx.restore();
  });
  // coins from the phone to each building after its cue
  cos.forEach((c, i) => {
    for (let j = 0; j < 7; j++) {
      const s0 = tc[i] + 0.1 + j * 0.28;
      const lt = (t - s0);
      if (lt < 0 || lt > 0.8 || t > D - 0.4) continue;
      const u = easeOutCubic(lt / 0.8);
      const tx = xs[i], ty = bTop + 75;
      const x = lerp(phX, tx, u), y = lerp(phY, ty, u) - Math.sin(u * Math.PI) * 120;
      K.drawCoin(ctx, x, y, 0.55, { spin: lt * 10 + j, symbol: '$' });
    }
  });
  // amount panel: big figure, sub line, the "a few" pill and the source
  if (t > tAmt - 0.1) {
    const k = K.popIn(t, tAmt - 0.1, 0.45);
    ctx.save(); ctx.translate(487, 610); ctx.scale(k, k);
    H.roundRect(ctx, -340, -120, 680, 240, 26); ctx.fillStyle = 'rgba(10,12,22,0.93)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(ACC, 0.7); H.roundRect(ctx, -340, -120, 680, 240, 26); ctx.stroke();
    ctx.fillStyle = ACC; ctx.font = K.font.display(68); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.amount || '$100s', 0, -60);
    ctx.fillStyle = '#ffffff'; ctx.font = K.font.ui(30); ctx.fillText(P.amountSub || 'Hundreds of dollars in charges', 0, -4);
    if (t > tBig - 0.1) K.drawLabel(ctx, 0, 70, K.popIn(t, tBig - 0.1, 0.4), { text: P.big || 'A few: much more', size: 32, accent: true });
    if (t > tSrc - 0.1) { ctx.globalAlpha = K.fadeIn(t, tSrc - 0.1, 0.3); ctx.fillStyle = '#b9c1d6'; ctx.font = K.font.ui(24); ctx.fillText(P.source || 'Per news reports', 0, 98); }
    ctx.restore();
  }
  ctx.restore();
}
