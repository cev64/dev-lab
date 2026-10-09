// Scene "nda-signing" (full frame, made for a 2-beat span). A town office at dusk: through a big window a giant
// building hides under a tarp. A company rep slides a paper across the desk, the local official signs it, a padlock
// snaps onto it and the official whispers "keep it quiet". Then the paper shakes and tears in two, the lock drops,
// the official cheers and a label lands. Ends settled.
// Fits: secret deals / NDAs / hidden contracts that end or get exposed (data centers, local deals, licensing).
// params (all optional): docTitle  text on the paper (default "NDA")
//                        whisper   bubble text (default "Keep it quiet")
//                        note      label after the tear (default "Secrecy ends")
//                        official / company  role labels (default "Local official" / "Tech company")
//                        signCue / lockCue / quietCue / tearCue  narration words (else 40% / +2 s / +1.5 s / 85%)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth } = H;
  const D = info.duration, ACC = info.accent;
  const cueT = (w, d) => { const v = w ? info.timeOf(w) : null; return v != null ? v : d; };
  const t0 = info.beats && info.beats[1] ? info.beats[1].t0 : Math.min(3.2, D * 0.15); // end of the hook
  const signAt = cueT(P.signCue, D * 0.4);
  const lockAt = cueT(P.lockCue, signAt + 2);
  const quietAt = cueT(P.quietCue, lockAt + 1.5) - 0.4;
  const tearAt = cueT(P.tearCue, D * 0.85);
  const slideAt = t0 + 1.0;

  ctx.save();
  // camera: wide establishing shot -> push towards the desk -> shake on the tear -> ease back
  K.camera(ctx, t, [
    { t: 0, zoom: 1, x: 487, y: 725 },
    { t: t0, zoom: 1, x: 487, y: 725 },
    { t: lockAt, zoom: 1.12, x: 520, y: 790 },
    { t: tearAt - 0.2, zoom: 1.16, x: 530, y: 800 },
    { t: Math.min(D, tearAt + 1.6), zoom: 1.04, x: 500, y: 760 },
  ]);
  K.cameraShake(ctx, t, tearAt, 0.45, 10);

  K.world.room(ctx, { t, time: 'dusk', window: false, picture: false, lamp: true, plant: true });
  // big window with the shrouded giant building outside
  const WX = 190, WY = 410, WW = 700, WH = 350;
  ctx.save();
  H.roundRect(ctx, WX, WY, WW, WH, 14); ctx.clip();
  const sky = ctx.createLinearGradient(0, WY, 0, WY + WH);
  sky.addColorStop(0, '#2b2c5e'); sky.addColorStop(1, '#d4836c');
  ctx.fillStyle = sky; ctx.fillRect(WX, WY, WW, WH);
  ctx.fillStyle = '#3b3a68'; ctx.beginPath(); ctx.moveTo(WX, WY + WH - 70);
  for (let i = 0; i <= 10; i++) ctx.lineTo(WX + (i / 10) * WW, WY + WH - 70 - 26 * Math.sin(i * 1.3) - 14);
  ctx.lineTo(WX + WW, WY + WH); ctx.lineTo(WX, WY + WH); ctx.closePath(); ctx.fill();
  drawCrane(ctx, H, 330, WY + WH - 30, t, ACC);
  drawShroud(ctx, H, K, 650, WY + WH - 30, 330, 200, t, ACC);
  ctx.fillStyle = '#272747'; ctx.fillRect(WX, WY + WH - 34, WW, 34);
  ctx.restore();
  // frame + mullion
  ctx.lineWidth = 16; ctx.strokeStyle = '#c9cfe4'; H.roundRect(ctx, WX, WY, WW, WH, 14); ctx.stroke();
  ctx.fillStyle = '#c9cfe4'; ctx.fillRect(WX + WW / 2 - 6, WY, 12, WH);
  ctx.fillStyle = '#aab1cc'; H.roundRect(ctx, WX - 20, WY + WH - 4, WW + 40, 18, 6); ctx.fill();

  // characters
  const tore = t >= tearAt;
  const OX = 330, OY = 1000, OS = 1.55;
  let opose = 'stand';
  if (t > signAt - 0.3 && t < signAt + 1.4) opose = 'point';
  if (t > tearAt + 0.35) opose = 'cheer';
  const omood = tore ? 'happy' : t > lockAt ? 'worried' : 'neutral';
  K.drawPerson(ctx, OX, OY, OS, { t, pose: opose, mood: omood, skin: 2, hair: 1, hairStyle: 'bun', shirt: '#4fb3a6', seed: 2,
    talk: t > quietAt && t < quietAt + 1.2 ? 0.6 : 0 });
  const DX = 830, DY = 1040, DS = 1.55;
  K.drawPerson(ctx, DX, DY, DS, { t, pose: t > slideAt - 0.2 && t < slideAt + 1.6 ? 'point' : tore ? 'shrug' : 'stand', flip: true,
    mood: tore ? 'shocked' : 'happy', skin: 0, hair: 4, hairStyle: 'short', shirt: '#5b6aa8', seed: 5,
    talk: t > slideAt && t < slideAt + 1.6 ? 0.5 : 0 });
  K.drawBriefcase(ctx, 935, 1046, 0.62);

  // desk + paper
  K.drawDesk(ctx, 540, 1040, 1.6);
  const deskTop = 1040 - 110 * 1.6 + 4;
  const slide = K.phase(t, slideAt, slideAt + 1.0);
  const docX = lerp(700, 540, slide), docS = 1.15;
  const docVis = K.fadeIn(t, t0 + 0.4, 0.4);
  if (docVis > 0) {
    const sign = K.phase(t, signAt, signAt + 1.2, smooth);
    const jitter = t > tearAt - 0.8 && t < tearAt ? Math.sin(t * 60) * 4 * K.phase(t, tearAt - 0.8, tearAt) : 0;
    if (!tore) {
      ctx.save(); ctx.globalAlpha = docVis;
      ctx.translate(docX + jitter, deskTop); ctx.rotate(jitter * 0.004);
      drawNda(ctx, K, 0, 0, docS, sign, P.docTitle || 'NDA');
      ctx.restore();
    } else {
      // tear: two halves fly apart, spin and fall, fading out
      const k = clamp((t - tearAt) / 1.3);
      [-1, 1].forEach((side) => {
        ctx.save();
        ctx.globalAlpha = 1 - smooth((k - 0.55) / 0.45);
        ctx.translate(docX + side * (30 + 170 * H.easeOutCubic(k)), deskTop - 40 * Math.sin(k * Math.PI) + 140 * k * k);
        ctx.rotate(side * 0.9 * H.easeOutCubic(k));
        ctx.beginPath();
        // zigzag tear line down the middle of the paper (local coords at scale docS)
        const s = docS, zz = [];
        for (let i = 0; i <= 8; i++) zz.push([(i % 2 ? 9 : -9) * s, -190 * s + i * (190 * s / 8)]);
        ctx.moveTo(side * 120 * s, -200 * s);
        zz.forEach(([x, y]) => ctx.lineTo(x, y));
        ctx.lineTo(side * 120 * s, 10 * s); ctx.closePath(); ctx.clip();
        drawNda(ctx, K, 0, 0, docS, 1, P.docTitle || 'NDA');
        ctx.restore();
      });
      // lock drops
      const lk = clamp((t - tearAt) / 0.9);
      if (lk < 1) { ctx.save(); ctx.globalAlpha = 1 - lk; K.drawLock(ctx, docX + 70, deskTop - 30 + 260 * lk * lk, 0.75, { open: 1 }); ctx.restore(); }
    }
    // padlock snaps on
    if (!tore && t > lockAt) {
      const pop = K.popIn(t, lockAt, 0.35);
      K.drawLock(ctx, docX + 70, deskTop - 30 - 30 * (1 - clamp(pop)), 0.75 * pop, { open: 1 - K.phase(t, lockAt + 0.2, lockAt + 0.5) });
    }
  }
  // role labels (after the hook, gone before the whisper)
  const roleA = K.popIn(t, t0 + 0.3, 0.4) * K.fadeOut(t, lockAt - 0.6, 0.3);
  const roleB = K.popIn(t, t0 + 0.6, 0.4) * K.fadeOut(t, lockAt - 0.6, 0.3);
  if (roleA > 0.01) K.drawLabel(ctx, OX, 600, roleA, { text: P.official || 'Local official', size: 28, dot: true });
  if (roleB > 0.01) K.drawLabel(ctx, DX - 60, 640, roleB, { text: P.company || 'Tech company', size: 28 });
  // whisper
  const wh = K.popIn(t, quietAt, 0.35) * K.fadeOut(t, tearAt - 0.5, 0.3);
  if (wh > 0.01) K.drawSpeechBubble(ctx, OX + 40, 600, 1, { text: P.whisper || 'Keep it quiet', size: 30, tail: 'left', pop: wh });
  ctx.restore();

  // label after the tear (screen space, above the heads)
  const lab = K.popIn(t, tearAt + 0.5, 0.45);
  if (lab > 0) K.drawLabel(ctx, 487, 520, lab, { text: P.note || 'Secrecy ends', size: 32, accent: true });
}

// Construction crane silhouette (anchor = base), hook swaying
function drawCrane(ctx, H, x, by, t, ACC) {
  ctx.save(); ctx.strokeStyle = '#ffcc55'; ctx.lineWidth = 6; ctx.globalAlpha = 0.85;
  const top = by - 260;
  ctx.beginPath(); ctx.moveTo(x - 14, by); ctx.lineTo(x - 14, top); ctx.moveTo(x + 14, by); ctx.lineTo(x + 14, top); ctx.stroke();
  ctx.lineWidth = 3;
  for (let y = by; y > top; y -= 28) { ctx.beginPath(); ctx.moveTo(x - 14, y); ctx.lineTo(x + 14, y - 28); ctx.stroke(); }
  ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x - 80, top); ctx.lineTo(x + 200, top); ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, top - 40); ctx.lineTo(x + 200, top); ctx.moveTo(x, top - 40); ctx.lineTo(x - 80, top); ctx.stroke();
  const hx = x + 150 + Math.sin(t * 0.9) * 6;
  ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 150, top); ctx.lineTo(hx, top + 90); ctx.stroke();
  ctx.fillStyle = '#ffcc55'; ctx.fillRect(hx - 8, top + 88, 16, 12);
  ctx.restore();
}

// A paper with a big title (anchor bottom-centre)
function drawNda(ctx, K, x, y, s, sign, title) {
  K.drawDocument(ctx, x, y, s, { lines: 6, title: false, sign });
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.font = K.font.display(40); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#d64b3f'; ctx.fillText(title, -8, -138);
  ctx.restore();
}

// Giant building hidden under a tarp (anchor bottom-centre). Humming glow + vents bumping the cloth.
function drawShroud(ctx, H, K, cx, by, w, h, t, ACC) {
  const top = by - h, l = cx - w / 2, r = cx + w / 2;
  K.glow(ctx, cx, top + h * 0.4, w * 0.7, ACC, 0.10 + 0.06 * Math.sin(t * 3));
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(l - 18, by);
  ctx.lineTo(l + 6, top + 40);
  ctx.quadraticCurveTo(l + 10, top, l + 50, top);
  // bumps of roof vents under the cloth
  for (let i = 0; i < 3; i++) {
    const bx = cx - w * 0.28 + i * w * 0.28;
    ctx.lineTo(bx - 46, top); ctx.quadraticCurveTo(bx, top - 46, bx + 46, top);
  }
  ctx.lineTo(r - 50, top); ctx.quadraticCurveTo(r - 10, top, r - 6, top + 40);
  ctx.lineTo(r + 18, by);
  // wavy hem
  for (let i = 0; i <= 12; i++) ctx.lineTo(r + 18 - (i / 12) * (w + 36), by - 8 + 8 * Math.sin(i * 1.7 + t * 1.2));
  ctx.closePath();
  ctx.fillStyle = '#6d7699'; ctx.fill();
  ctx.clip();
  // folds
  for (let i = 0; i < 9; i++) {
    const fx = l + (i + 0.5) * (w / 9) + Math.sin(t * 0.8 + i) * 3;
    const g = ctx.createLinearGradient(fx - 22, 0, fx + 22, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(20,24,48,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(fx - 22, top - 50, 44, h + 60);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(l - 20, top - 50, w * 0.22, h + 60);
  ctx.restore();
  // ropes
  ctx.strokeStyle = '#d9c9a0'; ctx.lineWidth = 4;
  for (const [a, b] of [[l + 30, l - 50], [r - 30, r + 50]]) { ctx.beginPath(); ctx.moveTo(a, top + 30); ctx.quadraticCurveTo((a + b) / 2, top + h * 0.6, b, by); ctx.stroke(); }
  // question-mark tag pinned to the cloth
  const sw = Math.sin(t * 1.6) * 0.06;
  ctx.save(); ctx.translate(cx, top + h * 0.38); ctx.rotate(sw);
  H.roundRect(ctx, -46, 0, 92, 92, 14); ctx.fillStyle = '#1c2033'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
  ctx.font = K.font.display(66); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ACC; ctx.fillText('?', 0, 50);
  ctx.restore();
  // hum arcs
  ctx.strokeStyle = H.rgba(ACC, 0.5); ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const ph = ((t * 0.9 + i / 3) % 1), rr = 30 + ph * 60;
    ctx.globalAlpha = 1 - ph;
    for (const sd of [-1, 1]) { ctx.beginPath(); ctx.arc(sd < 0 ? l - 10 : r + 10, top + h * 0.45, rr, sd < 0 ? Math.PI * 0.8 : -Math.PI * 0.2, sd < 0 ? Math.PI * 1.2 : Math.PI * 0.2); ctx.stroke(); }
  }
  ctx.globalAlpha = 1;
}
