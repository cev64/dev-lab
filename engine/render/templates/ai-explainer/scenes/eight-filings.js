// Scene "eight-filings" (full frame, span of 2 beats). A generic courtroom (kit world, balance emblem).
// Beat 1 (hook): a cartoon robot (stand-in for the chatbot, labelled as text) waits on the floor; the gavel strikes
//   on the cue word and a stack of papers thumps onto the bench.
// Beat 2: one case folder per filer slides in (2 columns x up to 4 rows) as its name is spoken, each with a small
//   "FILED" check; a counter pill ticks up. On the collapse cue the folders fly into one pile on the bench, the gavel
//   strikes again and a "defendant" pill appears over the robot.
// Fits: several states / agencies / plaintiffs suing (or acting against) one company on the same day.
// params: names (8 strings), cues (narration word per name, default lowercased first word of each name),
//         head ("State of"), filed ("FILED"), counter ("lawsuits"), defendant ("OpenAI, maker of ChatGPT"),
//         botLabel ("ChatGPT"), hitCue ("sued"), pileCue ("lawsuit")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, rgba } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const names = (P.names || ['Arizona', 'Arkansas', 'Idaho', 'Iowa', 'Kansas', 'Montana', 'Nebraska', 'West Virginia']).slice(0, 8);
  const B2 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.22;
  const tHit = at(P.hitCue || 'sued', 1.0) - 0.15;
  const tPile = at(P.pileCue || 'lawsuit', D - 2.6) - 0.1;
  const cueT = names.map((n, i) => at((P.cues && P.cues[i]) || n.split(/\s+/)[0].toLowerCase(), B2 + 0.6 + i * 0.9) - 0.15);

  // camera: wide establishing, gentle push, settle for the folders, push to the bench on the pile
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: B2, zoom: 1.05, x: 520, y: 760 }, { t: tPile, zoom: 1.0 }, { t: D, zoom: 1.08, x: 560, y: 760 }]);
  K.cameraShake(ctx, t, tHit + 0.18, 0.35, 10);
  K.cameraShake(ctx, t, tPile + 0.95, 0.3, 7);
  const room = K.world.courtroom(ctx, { t });

  // judge behind the bench (generic, clipped at the bench top)
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, room.bench.y + 4); ctx.clip();
  K.drawPerson(ctx, 760, room.bench.y + 170, 1.3, { t, pose: 'stand', flip: true, skin: 3, hair: 4, shirt: '#1d1f2e', hairStyle: 'short', mood: 'neutral', seed: 2 });
  ctx.restore();
  // gavel: wind-up then strike on the hook cue, again when the pile lands
  const g1 = H.phase(t, tHit - 0.5, tHit - 0.05) * (1 - H.phase(t, tHit, tHit + 0.18));
  const g2 = H.phase(t, tPile + 0.3, tPile + 0.8) * (1 - H.phase(t, tPile + 0.8, tPile + 0.98));
  K.drawGavel(ctx, 620, room.bench.y + 4, 0.95, { hit: 1 - Math.max(g1, g2), shadow: false });
  if (t > tHit + 0.15 && t < tHit + 0.8) K.glow(ctx, 660, room.bench.y - 10, 120, ACC, 0.6 * (1 - (t - tHit - 0.15) / 0.65));

  // stack of papers thumps onto the bench after the hook strike
  const stackK = smooth((t - tHit - 0.1) / 0.35);
  if (stackK > 0) {
    const y = room.bench.y + 2 - (1 - stackK) * 260;
    for (let i = 0; i < 5; i++) { roundRect(ctx, 330 - 70 + (i % 2) * 6, y - 14 - i * 10, 150, 12, 3); ctx.fillStyle = i % 2 ? '#e9e4d8' : '#f6f2e8'; ctx.fill(); }
  }

  // robot on the floor (cartoon stand-in for the chatbot) + its text label
  const worried = t > tHit;
  drawBot(ctx, 815, 1035, 1.2, { t, state: worried ? 'thinking' : 'idle', flip: true });
  const bl = K.popIn(t, B2 + 0.1, 0.4);
  if (bl > 0 && t < tPile + 0.6) K.drawLabel(ctx, 815, 690, bl * (1 - smooth((t - tPile - 0.2) / 0.3)), { text: P.botLabel || 'ChatGPT', size: 28, dot: true });
  // a generic lawyer at the podium (left), facing the bench
  K.drawPerson(ctx, 250, 1035, 1.4, { t, pose: t > tHit && t < tHit + 1.6 ? 'point' : 'stand', skin: 0, hair: 1, shirt: '#3b4580', hairStyle: 'bun', mood: 'neutral', seed: 6, look: 0.6 });

  // beat 2: case folders
  const anyIn = clamp((t - cueT[0] + 0.1) / 0.4);
  const pileK = H.phase(t, tPile, tPile + 0.8, H.easeInOutCubic);
  const scrim = anyIn * (1 - pileK) * 0.5;
  if (scrim > 0) { ctx.fillStyle = `rgba(6,7,16,${scrim})`; ctx.fillRect(-200, -200, 1480, 2400); }
  const W = 410, Hh = 118, cols = [272, 702], rows = [480, 610, 740, 870];
  names.forEach((nm, i) => {
    const k = K.popIn(t, cueT[i], 0.45);
    if (k <= 0) return;
    const cx0 = cols[i % 2], cy0 = rows[Math.floor(i / 2)];
    const slide = (1 - smooth((t - cueT[i]) / 0.45)) * (i % 2 ? 260 : -260);
    // fly to the pile on the bench
    const tx = 380 + (i % 3) * 4, ty = room.bench.y - 30 - i * 5;
    const cx = lerp(cx0 + slide, tx, pileK), cy = lerp(cy0, ty, pileK), sc = Math.min(1.05, k) * lerp(1, 0.32, pileK);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(lerp(0, (i % 2 ? 0.05 : -0.05), pileK)); ctx.scale(sc, sc);
    ctx.globalAlpha = 1 - 0.0 * pileK;
    // folder tab + body
    roundRect(ctx, -W / 2 + 18, -Hh / 2 - 16, 120, 30, 10); ctx.fillStyle = '#d9b46a'; ctx.fill();
    roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 18); ctx.fillStyle = '#f1d38b'; ctx.fill();
    roundRect(ctx, -W / 2 + 8, -Hh / 2 + 8, W - 16, Hh - 16, 14); ctx.fillStyle = '#f8ecd0'; ctx.fill();
    // mini page icon
    roundRect(ctx, -W / 2 + 26, -38, 58, 76, 6); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.fillStyle = '#c5c9d6'; for (let l = 0; l < 4; l++) ctx.fillRect(-W / 2 + 36, -24 + l * 15, 38 - (l === 3 ? 14 : 0), 6);
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#7a5a20'; ctx.fillText(String(P.head || 'State of').toUpperCase(), -W / 2 + 104, -22);
    const f = H.fitText(ctx, nm, 'display', 40, 26, W - 130 - 70); ctx.font = f.font; ctx.fillStyle = '#1b1d2e'; ctx.fillText(f.text, -W / 2 + 104, 20);
    // FILED check
    const ck = K.popIn(t, cueT[i] + 0.35, 0.35);
    if (ck > 0) {
      ctx.save(); ctx.translate(W / 2 - 42, 0); ctx.scale(ck, ck);
      ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
      ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(-2, 9); ctx.lineTo(12, -9); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  });
  // counter pill under the folders
  let n = 0; for (const c of cueT) if (t >= c + 0.2) n++;
  if (n > 0) {
    const pk = K.popIn(t, cueT[0] + 0.2, 0.4) * (1 - pileK);
    if (pk > 0) K.drawLabel(ctx, 487, 1010, Math.min(1.05, pk), { text: `${n} ${n === 1 ? 'lawsuit' : (P.counter || 'lawsuits')}`, size: 34, accent: true });
  }
  // after the pile: defendant pill over the robot
  const dk = K.popIn(t, tPile + 0.9, 0.45);
  if (dk > 0) K.drawLabel(ctx, 700, 690, Math.min(1.05, dk), { text: P.defendant || 'OpenAI, maker of ChatGPT', size: 30, dot: true });
  const ek = K.popIn(t, tPile + 1.2, 0.45);
  if (ek > 0) K.drawLabel(ctx, 380, room.bench.y - 90, Math.min(1.05, ek), { text: `${names.length} ${P.counter || 'lawsuits'}`, size: 30, accent: true });
}

// Generic "chatbot" stand-in (NOT the channel mascot): boxy teal-grey body, square head, round white eyes with dark
// pupils, cyan antenna bulb, speaker-grille mouth. Anchored bottom-centre, ~130x230 at scale 1. opts: t, state idle|thinking, flip
function drawBot(ctx, x, y, s, o = {}) {
  const t = o.t || 0, think = o.state === 'thinking';
  const body = '#4f7f86', bodyS = '#3c6369', head = '#8fa9ad', headS = '#728e93', dark = '#1d2433', cyan = '#5fd6f0';
  const rr = (x0, y0, w, h, r, f) => { ctx.beginPath(); ctx.roundRect(x0, y0, w, h, r); ctx.fillStyle = f; ctx.fill(); };
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  const hover = Math.sin(t * 2) * 1.5;
  ctx.save(); ctx.scale(1, 0.22); ctx.beginPath(); ctx.arc(0, 0, 70, 0, Math.PI * 2); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill(); ctx.restore();
  // legs + feet
  rr(-34, -52, 20, 44, 6, bodyS); rr(14, -52, 20, 44, 6, bodyS);
  rr(-44, -14, 38, 14, 5, dark); rr(6, -14, 38, 14, 5, dark);
  ctx.translate(0, hover);
  // arms
  rr(-74, -140, 20, 70, 8, bodyS);
  if (think) { ctx.save(); ctx.translate(64, -136); ctx.rotate(-2.4); rr(-10, 0, 20, 64, 8, bodyS); ctx.restore(); }
  else rr(54, -140, 20, 70, 8, bodyS);
  // body box with a panel
  rr(-56, -150, 112, 102, 12, body);
  rr(-36, -128, 72, 40, 6, bodyS);
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-18 + i * 18, -108, 6, 0, Math.PI * 2); ctx.fillStyle = (Math.floor(t * 3) + i) % 3 === 0 ? cyan : '#2a3a44'; ctx.fill(); }
  // neck + square head
  rr(-14, -164, 28, 18, 4, dark);
  rr(-62, -236, 124, 76, 10, head); rr(-62, -186, 124, 26, 10, headS);
  // round eyes (blink)
  const blink = (t % 3.7) > 3.55 ? 0.15 : 1;
  for (const ex of [-28, 28]) {
    ctx.save(); ctx.translate(ex, -206); ctx.scale(1, blink);
    ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = cyan; ctx.stroke();
    ctx.beginPath(); ctx.arc(think ? 4 : 0, think ? -4 : 2, 6, 0, Math.PI * 2); ctx.fillStyle = dark; ctx.fill();
    ctx.restore();
  }
  // grille mouth
  rr(-22, -178, 44, 10, 4, dark);
  // antenna
  rr(-3, -262, 6, 28, 3, dark);
  ctx.beginPath(); ctx.arc(0, -266, 9, 0, Math.PI * 2); ctx.fillStyle = cyan; ctx.fill();
  ctx.restore();
}
