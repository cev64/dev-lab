// Scene "charged-caveat" (full frame, best as a 2-beat span). A generic courtroom (kit world, balance emblem).
// Beat 1 ("charged"): a cartoon defendant (generic, unnamed) stands with a lawyer; a prosecutor holds a COMPLAINT page.
//   A card over the bench reads the allegation ("Prosecutors allege" + text), then flips to the charge; an "Arrested"
//   date pill pops over the defendant and a "If convicted: up to N years" pill over the prosecutor. The gavel stays down
//   (no verdict).
// Beat 2 ("caveat"): pills clear, the emblem glows, a banner says "Charged, not convicted" / "Presumed innocent", then a
//   company-statement card shows a locked vault icon with a check ("No sign model weights were accessed or taken").
// Fits: arrests / charges / complaints where nobody is convicted yet; "presumed innocent" caveats; company statements.
// params: allegeHead ("Prosecutors allege"), allege ("An OpenAI engineer planted the device"), chargeHead ("The charge"),
//         charge ("Using, or trying to use, a device to intercept conversations"), arrested ("Arrested Oct. 9"),
//         max ("If convicted: up to 5 years"), banner1 ("Charged, not convicted"), banner2 ("Presumed innocent"),
//         says ("OpenAI says"), stmt ("No sign he accessed or took its model weights"), vault ("MODEL WEIGHTS")
//         cues: allegeCue ("prosecutors"), arrestCue ("arrested"), chargeCue ("charged"), maxCue ("convicted"),
//               innocentCue ("presumed"), saysCue ("openai"), vaultCue ("weights")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, rgba } = H;
  const TAU = Math.PI * 2;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const rr = (x, y, w, h, r, fill) => { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); };
  const circle = (x, y, r, fill) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); };
  const pill = (x, y, k, text, o = {}) => { if (k > 0) K.drawLabel(ctx, x, y, Math.min(1.08, k), Object.assign({ text, size: o.size || 30 }, o)); };
  const B2 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.6;
  const tAl = at(P.allegeCue || 'prosecutors', 0.1) - 0.1, tArr = at(P.arrestCue || 'arrested', B2 * 0.25) - 0.2;
  const tCh = at(P.chargeCue || 'charged', B2 * 0.4) - 0.2, tMax = at(P.maxCue || 'convicted', B2 * 0.8) - 0.2;
  const tInn = at(P.innocentCue || 'presumed', B2 + 0.3) - 0.2;
  // "openai" said after B2 (first occurrence in this scene)
  let tSays = B2 + (D - B2) * 0.35;
  for (const w of info.words || []) if (w.s > B2 && /openai/i.test(w.w)) { tSays = w.s - 0.2; break; }
  const tVault = at(P.vaultCue || 'weights', tSays + 2) - 0.3;

  // card text block helper
  function card(cx, cy, w, h, k, head, body, a = 1) {
    if (k <= 0 || a <= 0) return;
    ctx.save(); ctx.globalAlpha = clamp(a); ctx.translate(cx, cy); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
    rr(-w / 2, -h / 2, w, h, 26, 'rgba(8,10,24,0.94)');
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.8); roundRect(ctx, -w / 2, -h / 2, w, h, 26); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = H.font('ui', 26); ctx.fillStyle = ACC; ctx.fillText(String(head).toUpperCase(), 0, -h / 2 + 40);
    let size = 40, lines;
    for (; size >= 26; size -= 2) { lines = H.wrap(ctx, body, 'bold', size, w - 70); if (lines.length <= 3) break; }
    ctx.font = H.font('bold', size); ctx.fillStyle = '#ffffff';
    const lh = size * 1.22, y0 = 20 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => ctx.fillText(ln, 0, y0 + i * lh));
    ctx.restore();
  }

  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 760 }, { t: B2, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 680 }]);
  const room = K.world.courtroom(ctx, { t });
  const ek = smooth((t - tInn) / 0.6);
  if (ek > 0) K.glow(ctx, 540, 470, 240, ACC, 0.5 * ek * (0.85 + 0.15 * Math.sin(t * 3)));
  // judge behind the bench (clipped), gavel resting: no verdict
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, room.bench.y + 4); ctx.clip();
  K.drawPerson(ctx, 760, room.bench.y + 170, 1.3, { t, pose: 'stand', flip: true, skin: 3, hair: 4, shirt: '#1d1f2e', hairStyle: 'short', mood: 'neutral', seed: 2 });
  ctx.restore();
  K.drawGavel(ctx, 600, room.bench.y + 4, 0.95, { hit: 1, shadow: false });

  // defendant (generic) + lawyer on the left, prosecutor with the complaint on the right
  K.drawPerson(ctx, 330, 1035, 1.4, { t, pose: 'stand', skin: 1, hair: 3, shirt: '#5a6178', hairStyle: 'none', mood: 'neutral', seed: 5, look: 0.5 });
  K.drawPerson(ctx, 165, 1040, 1.32, { t, pose: 'stand', skin: 4, hair: 2, shirt: '#2f3a63', hairStyle: 'long', mood: 'neutral', seed: 8, look: 0.5 });
  K.drawBriefcase(ctx, 220, 1045, 0.5);
  K.drawPerson(ctx, 770, 1035, 1.4, { t, pose: t > tAl && t < tAl + 2.5 ? 'point' : 'stand', flip: true, skin: 0, hair: 1, shirt: '#3b4580', hairStyle: 'bun', mood: 'neutral', seed: 6, talk: t < B2 ? info.env * 0.0 : 0 });
  const docK = K.popIn(t, tAl + 0.2, 0.4);
  if (docK > 0) { ctx.save(); ctx.translate(880, 1030); ctx.rotate(0.06); ctx.scale(docK * 0.75, docK * 0.75); K.drawDocument(ctx, 0, 0, 1, { lines: 5, title: 'COMPLAINT' }); ctx.restore(); }

  // beat 1 cards over the bench
  const fadeB1 = 1 - smooth((t - tInn + 0.3) / 0.35);
  const flip = smooth((t - tCh) / 0.3);
  card(487, 540, 800, 220, K.popIn(t, tAl, 0.45) * (1 - flip), P.allegeHead || 'Prosecutors allege', P.allege || 'An OpenAI engineer planted the device', fadeB1);
  card(487, 540, 800, 220, K.popIn(t, tCh, 0.45), P.chargeHead || 'The charge', P.charge || 'Using, or trying to use, a device to intercept conversations', fadeB1);
  ctx.save(); ctx.globalAlpha = Math.max(0, fadeB1);
  pill(300, 720, K.popIn(t, tArr), P.arrested || 'Arrested Oct. 9', { size: 28, dot: true });
  pill(585, 880, K.popIn(t, tMax), P.max || 'If convicted: up to 5 years', { size: 27, accent: true });
  ctx.restore();

  // beat 2: banner + statement card
  const bk = K.popIn(t, tInn, 0.5);
  if (bk > 0) {
    ctx.save(); ctx.translate(487, 470); ctx.scale(Math.min(1.05, bk), Math.min(1.05, bk));
    rr(-400, -62, 800, 124, 28, 'rgba(8,10,24,0.94)');
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; roundRect(ctx, -400, -62, 800, 124, 28); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = H.font('ui', 28); ctx.fillStyle = '#c9d2f5'; ctx.fillText(P.banner1 || 'Charged, not convicted', 0, -24);
    const f = H.fitText(ctx, P.banner2 || 'Presumed innocent', 'display', 48, 30, 720);
    ctx.font = f.font; ctx.fillStyle = ACC; ctx.fillText(f.text, 0, 24);
    ctx.restore();
  }
  const sk = K.popIn(t, tSays, 0.5);
  if (sk > 0) {
    const cx = 487, cy = 720;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(Math.min(1.05, sk), Math.min(1.05, sk));
    rr(-400, -120, 800, 240, 26, 'rgba(8,10,24,0.94)');
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; roundRect(ctx, -400, -120, 800, 240, 26); ctx.stroke();
    // vault door icon
    ctx.save(); ctx.translate(-270, 0);
    rr(-90, -90, 180, 180, 22, '#3b4260'); circle(0, 0, 66, '#59618a'); circle(0, 0, 50, '#3b4260');
    const spin = t * 0.6;
    ctx.strokeStyle = '#c9d2f5'; ctx.lineWidth = 7; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) { const a = spin + i * TAU / 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 12, Math.sin(a) * 12); ctx.lineTo(Math.cos(a) * 42, Math.sin(a) * 42); ctx.stroke(); }
    circle(0, 0, 12, '#c9d2f5');
    ctx.restore();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = H.font('ui', 26); ctx.fillStyle = ACC; ctx.fillText(String(P.says || 'OpenAI says').toUpperCase(), -150, -72);
    const body = P.stmt || 'No sign he accessed or took its model weights';
    let size = 38, lines; for (; size >= 26; size -= 2) { lines = H.wrap(ctx, body, 'bold', size, 520); if (lines.length <= 3) break; }
    ctx.font = H.font('bold', size); ctx.fillStyle = '#ffffff';
    lines.forEach((ln, i) => ctx.fillText(ln, -150, -22 + i * size * 1.2));
    ctx.restore();
    // check badge lands on the vault on the "weights" cue
    if (t > tVault) {
      ctx.save(); ctx.translate(cx - 270 + 70, cy + 70); const ck = K.popIn(t, tVault, 0.4); ctx.scale(ck, ck);
      circle(0, 0, 34, ACC); ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-3, 12); ctx.lineTo(16, -12); ctx.stroke();
      ctx.restore();
      pill(cx - 270, cy + 175, K.popIn(t, tVault + 0.2), P.vault || 'Model weights', { size: 24 });
    }
  }
}
