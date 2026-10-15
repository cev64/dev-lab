// Scene "eight-filings-v2" (kit v2, full frame, span of 2 beats). Courtroom (K2.world2.courtroom).
// Beat 1 (hook, under the hook card): tight on the bench. The judge's gavel winds up (heavy anticipation), strikes
//   on the cue word (squash of the sound block, camera shake), and a stack of papers drops on an arc and thumps
//   down (squash, top sheets slide and settle).
// Beat 2: the camera eases out to the room. A generic lawyer (left) tosses one case folder per filer on an arc into
//   a 2x4 grid as each name is spoken (wind-up, throw, follow-through; the folder stretches in flight, squashes on
//   landing and wobbles to rest), each gets a FILED check; a counter pill ticks up. On the pile cue every folder
//   arcs onto the bench (staggered overlap), the gavel strikes again and the camera pans to the chatbot stand-in
//   (K2.drawAssistant, never the mascot), which does a nervous take; "defendant" pill + count pill.
// params: names (8), cues, head ("State of"), counter ("lawsuits"), defendant ("OpenAI, maker of ChatGPT"),
//         botLabel ("ChatGPT"), hitCue ("sued"), pileCue ("lawsuit")
let ACC_ = '#ffe14a', INK_ = '#15140a';
export default function draw(ctx, t, info) {
  const H = info.helpers, K2 = H.kit2, M = H.motion, P = info.params || {}, D = info.duration, ACC = info.accent;
  ACC_ = ACC; INK_ = K2.ACCENT.deep;
  const { clamp, lerp, ease } = M;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const names = (P.names || ['Arizona', 'Arkansas', 'Idaho', 'Iowa', 'Kansas', 'Montana', 'Nebraska', 'West Virginia']).slice(0, 8);
  const B2 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.22;
  const tHit = at(P.hitCue || 'sued', 1.0) + 0.02;             // gavel contact on the word
  const tPile = at(P.pileCue || 'lawsuit', D - 2.6) - 0.1;
  const cue = names.map((n, i) => at((P.cues && P.cues[i]) || n.split(/\s+/)[0].toLowerCase(), B2 + 0.6 + i * 0.9));
  const land = cue.map((c) => c + 0.12);                        // each folder lands on its name
  const tHit2 = tPile + 0.95;                                    // second strike once the pile has landed
  const tTake = tHit2 + 0.05;

  // ---------------------------------------------------------------- camera (pose-to-pose, slow in/out, shake)
  const shake = M.settle(t, tHit, 7, 7, 9) + M.settle(t, tHit2, 5, 7, 9);
  const cam = K2.cam(t, [
    { t: 0, x: 150, y: -200, zoom: 1.46 }, { t: 2.7, x: 160, y: -206, zoom: 1.54 },
    { t: 4.0, x: 20, y: 45, zoom: 1.08 }, { t: tPile - 0.1, x: 10, y: 40, zoom: 1.1 },
    { t: tPile + 0.6, x: -10, y: 48, zoom: 1.2 }, { t: tPile + 1.2, x: -6, y: 50, zoom: 1.22 },
    { t: tPile + 1.95, x: 300, y: 104, zoom: 1.52 }, { t: D, x: 306, y: 107, zoom: 1.56 },
  ]);
  cam.x += shake; cam.y += shake * 0.6;

  // gavel: 1 = resting/struck, 0 = raised. heavy wind-up (raise + extra lift), accelerating strike, small rebound
  const gavelHit = (tt) => {
    const strike = (th) => {
      if (tt < th - 0.75) return 1;
      if (tt < th - 0.22) return 1 - ease.inOut((tt - th + 0.75) / 0.53) * 1.08;           // raise past the top
      if (tt < th) return -0.08 + 1.08 * ease.in((tt - th + 0.22) / 0.22, 2.6);              // heavy fall, speeds up
      return 1 - 0.14 * Math.exp(-(tt - th) * 9) * Math.abs(Math.sin((tt - th) * 14));       // rebound
    };
    return Math.min(strike(tHit), strike(tHit2));
  };

  const W = K2.world2.courtroom(ctx, { t, cam });
  const L = W.light, benchY = 622;
  const gx = 600, gs = 0.95, pivot = [gx + 80 * gs, benchY + 2 - 40 * gs];

  // ---------------------------------------------------------------- lawyer throw rig (per name)
  const throwStart = land.map((l) => l - 0.55);
  const curThrow = (tt) => { let k = -1; for (let i = 0; i < throwStart.length; i++) if (tt >= throwStart[i] - 0.05) k = i; return k; };
  const armV = (tt) => {
    const i = curThrow(tt); if (i < 0) return 0;
    const a = M.act(tt, throwStart[i], { timing: 'snappy', wind: 0.6, overshoot: 0.18 });
    const back = ease.inOut((tt - a.hit - 0.12) / 0.4);
    return tt < a.hit + 0.12 ? a.v : a.v * (1 - back);
  };
  const lawX = 190, lawS = 1.45;
  const handOrigin = W.toScreen(lawX + 120, 1035 - 345);

  // ---------------------------------------------------------------- folders: grid slots (screen), flight, pile
  const cols = [470, 765], rows = [470, 578, 686, 794], CW = 285, CH = 92;
  const pileAt = (i) => [330 + ((i * 37) % 13) - 6, benchY - 2 - i * 4];
  const pileLand = names.map((_, i) => tPile + 0.42 + i * 0.06);
  const pileK = (i) => clamp((t - tPile - i * 0.06) / 0.42);

  // ================================================================ stage (depth 1)
  W.stage(ctx, () => {
    // judge behind the bench (clipped at the bench top), near hand on the gavel handle
    const jx = 770, js = 1.18, jy = 866;
    ctx.save(); ctx.beginPath(); ctx.rect(-400, -400, 1900, benchY + 400 + 4); ctx.clip();
    const lift = (1 - clamp(gavelHit(t))) * 26;
    K2.drawHuman(ctx, jx, jy, js, {
      t, seed: 21, age: 'older', outfit: 'robe', hairStyle: 'short', hair: 4, skin: 4, glasses: true, facing: -0.45, light: L,
      pose: 'stand', reach: [(pivot[0] - jx) / js, (pivot[1] - lift - jy) / js], look: -0.35,
      expr: t > tHit - 0.8 && t < tHit + 0.3 ? 'focused' : t > tHit2 - 0.8 && t < tHit2 + 0.3 ? 'focused' : 'neutral',
      nod: 0.12 * (1 - clamp(gavelHit(t))), shadow: false,
    });
    ctx.restore();
    // gavel with a squash on the sound block at each strike
    const sq = M.squashImpact(t, tHit, 0.2, 0.45) + M.squashImpact(t, tHit2, 0.2, 0.45);
    ctx.save(); M.squashTransform(ctx, gx, benchY + 2, sq, 0);
    gavel(ctx, K2, H, gx, benchY + 2, gs, gavelHit(t), L);  // own gavel: kit2 drawGavel's raised pose swings the head down (see report)
    ctx.restore();
    // dust puffs on the strikes
    for (const th of [tHit, tHit2]) {
      const k = (t - th) / 0.6; if (k <= 0 || k >= 1) continue;
      for (let i = 0; i < 6; i++) { const a = Math.PI + (i / 5) * Math.PI, r = 30 + 70 * ease.out(k); ctx.fillStyle = `rgba(255,236,200,${0.35 * (1 - k)})`; ctx.beginPath(); ctx.arc(gx - 30 + Math.cos(a) * r, benchY - 6 + Math.sin(a) * r * 0.35, 6 + 8 * k, 0, Math.PI * 2); ctx.fill(); }
    }

    // stack of papers: drops on an arc after the first strike, squashes, top sheets slide and settle
    const pDrop = tHit + 0.1, pLand = pDrop + 0.34;
    if (t > pDrop) {
      const k = clamp((t - pDrop) / (pLand - pDrop));
      const p = M.arc([410, benchY - 330], [470, benchY], ease.in(k, 1.8), 30, (x) => x);
      const sq2 = t < pLand ? 0.18 * k : M.squashImpact(t, pLand, 0.26, 0.5);
      ctx.save(); M.squashTransform(ctx, p[0], p[1], sq2, 0);
      ctx.translate(p[0], p[1]); ctx.rotate(t < pLand ? -0.25 * (1 - k) : M.settle(t, pLand, 0.03, 2.5, 6));
      K2.contactShadow(ctx, 0, 0, 170, 0.45 * k);
      for (let i = 0; i < 7; i++) {
        const slide = t > pLand ? M.settle(t, pLand + i * 0.02, 5 + i * 2.2, 2.2, 4.5) : 0;
        ctx.fillStyle = i % 2 ? '#e7e1d2' : '#f5f1e6'; ctx.fillRect(-72 + slide + ((i * 7) % 5), -8 - i * 8, 144, 7);
        ctx.fillStyle = 'rgba(80,60,40,0.18)'; ctx.fillRect(-72 + slide + ((i * 7) % 5), -2 - i * 8, 144, 1.5);
      }
      ctx.restore();
    }

    // folder pile on the bench (folders arrive from the grid, then stay as world props)
    for (let i = 0; i < names.length; i++) {
      if (t < pileLand[i]) continue;
      const [px, py] = pileAt(i);
      const sq = M.squashImpact(t, pileLand[names.length - 1], 0.12, 0.45) + M.squashImpact(t, pileLand[i], 0.2, 0.35);
      ctx.save(); M.squashTransform(ctx, 330, benchY, sq, 0);
      ctx.translate(px, py); ctx.rotate((((i * 53) % 9) - 4) * 0.012 + M.settle(t, pileLand[i], 0.05, 2.4, 6));
      K2.drawFolder(ctx, 0, 0, 0.62, { light: L, shadow: i === 0 });
      ctx.restore();
    }

    // chatbot stand-in (generic assistant, not the mascot): worried after the first strike, a take at the second
    const take = M.act(t, tTake, { timing: 'take', wind: 0.6, exag: 1.25 });
    let asq = M.squashImpact(t, take.hit, 0.22, 0.6);
    if (take.phase === 'anticipate') asq -= 0.16 * take.wind; else if (take.phase === 'action') asq += 0.22 * (1 - take.k);
    const shiver = t > tTake && t < tTake + 1.2 ? Math.sin(t * 40) * 2.5 * (1 - (t - tTake) / 1.2) : 0;
    // enters during the pull-back on a floaty arc (kept out of the hook shot), squashes as it arrives
    const inK = clamp((t - 2.75) / 1.25), arr = M.arc([1300, 900], [840, 1035], ease.inOut(inK, 2), 70, (x) => x);
    asq += M.squashImpact(t, 4.0, 0.2, 0.55) + (inK > 0 && inK < 1 ? 0.12 * Math.sin(Math.PI * inK) : 0);
    if (t > 2.75) K2.drawAssistant(ctx, arr[0] + shiver, arr[1], 1.18, { t, seed: 5, light: L, facing: -0.4, mood: t > tHit2 - 0.2 ? 'alert' : 'thinking', squash: asq });

    // focus: dim the room behind the folder grid, keep the thrower bright
    const anyIn = clamp((t - throwStart[0]) / 0.4) * (1 - clamp((t - tPile) / 0.5));
    if (anyIn > 0) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = `rgba(8,6,14,${0.42 * anyIn})`; ctx.fillRect(0, 0, 1080, 1920); ctx.restore(); }

    // lawyer: wind-up -> throw (arc) -> follow-through; tie and hair lag the arm
    const av = armV(t), ci = curThrow(t);
    const sN = 0.25 + 1.45 * av, eN = av < 0 ? 0.3 + 1.7 * -av : 0.3 - 0.2 * av;
    K2.drawHuman(ctx, lawX, 1035, lawS, {
      t, seed: 6, age: 'adult', outfit: 'suit', top: '#3b4580', bottom: '#2a3050', hairStyle: 'bun', hair: 1, skin: 0, light: L,
      facing: 0.55, pose: 'stand', rig: { sN, eN, handN: av > 0.4 ? 'open' : 'fist', sF: 0.5, eF: 1.7, handF: 'hold' }, hold: ci >= 0 && t < land[names.length - 1] - 0.3 ? 'paper' : null,
      lean: 0.07 * av, look: 0.55, expr: ci >= 0 && t < tPile ? 'focused' : t > tPile ? 'smirk' : 'neutral',
      drive: (tt) => armV(tt) * 40, exag: 1.15,
    });
  });
  W.front(ctx);

  // ================================================================ screen-space UI (folders, pills)
  const ink = K2.ACCENT.deep;
  names.forEach((nm, i) => {
    const l0 = land[i] - 0.36; if (t < l0) return;
    if (t >= pileLand[i]) return;
    const slot = [cols[i % 2], rows[Math.floor(i / 2)]];
    // flight in from the lawyer's hand
    const fk = clamp((t - l0) / 0.36);
    const pos = (k) => M.arc(handOrigin, slot, k, 70, (x) => ease.out(x, 1.6));
    let p = pos(fk), sc = lerp(0.35, 1, ease.out(fk, 1.6)), rot = lerp(-0.6, 0, ease.out(fk, 2)) + M.settle(t, land[i], 0.07, 2.2, 5);
    let sq = 0, ang = 0;
    if (fk < 1) { const p2 = pos(Math.min(1, fk + 0.04)); const sv = M.stretchFromVelocity((p2[0] - p[0]) * 25, (p2[1] - p[1]) * 25, 0.00012, 0.3); sq = sv.s; ang = sv.angle; }
    else sq = M.squashImpact(t, land[i], 0.2, 0.45);
    // flight to the pile
    const pk = pileK(i);
    if (pk > 0) {
      const dst = W.toScreen(...pileAt(i)), e = ease.inOut(pk);
      const q = M.arc(slot, [dst[0], dst[1] - 30 * cam.zoom], e, -90, (x) => x);
      p = q; sc = lerp(1, 0.42 * cam.zoom, e); rot = lerp(0, (i % 2 ? 0.2 : -0.2), e);
      const q2 = M.arc(slot, [dst[0], dst[1] - 30 * cam.zoom], Math.min(1, e + 0.04), -90, (x) => x);
      const sv = M.stretchFromVelocity((q2[0] - q[0]) * 25, (q2[1] - q[1]) * 25, 0.0001, 0.25); sq = sv.s * Math.sin(Math.PI * pk); ang = sv.angle;
    }
    ctx.save();
    M.squashTransform(ctx, p[0], p[1], sq, ang);
    ctx.translate(p[0], p[1] + (pk > 0 ? 0 : M.hold(t, i * 3, 1.5))); ctx.rotate(rot); ctx.scale(sc, sc);
    folderCard(ctx, H, nm, String(P.head || 'State of').toUpperCase(), CW, CH, ACC, ink, M, t, land[i] + 0.22);
    ctx.restore();
  });

  // counter pill (bumps on every landing)
  let n = 0; for (const l of land) if (t >= l) n++;
  if (n > 0 && t < tPile + 0.2) {
    let bump = 0; for (const l of land) bump += M.squashImpact(t, l + 0.05, 0.16, 0.35);
    pill(ctx, H, M, t, 615, 905, land[0] + 0.1, `${n} ${n === 1 ? 'lawsuit' : (P.counter || 'lawsuits')}`, { accent: true, size: 34, out: tPile, bump, seed: 3, ink });
  }
  // after the pile: count over the pile + defendant pill over the bot
  const pileScr = W.toScreen(330, benchY - 120);
  pill(ctx, H, M, t, Math.max(170, pileScr[0]), Math.max(470, pileScr[1]), tHit2 + 0.25, `${names.length} ${P.counter || 'lawsuits'}`, { accent: true, size: 32, seed: 5, ink, out: tPile + 1.45 });
  const botScr = W.toScreen(840, 1035 - 350);
  pill(ctx, H, M, t, Math.min(700, botScr[0]), Math.max(470, botScr[1] - 70), tPile + 1.75, P.defendant || 'OpenAI, maker of ChatGPT', { dot: true, size: 32, seed: 7, ACC });
  pill(ctx, H, M, t, Math.min(780, botScr[0] + 40), Math.max(560, botScr[1] + 10), tPile + 1.95, P.botLabel || 'ChatGPT', { dot: true, size: 26, seed: 8, ACC });
}

// folder card (screen space, local origin = centre)
function folderCard(ctx, H, name, head, W, Hh, ACC, ink, M, t, tCheck) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
  H.roundRect(ctx, -W / 2 + 16, -Hh / 2 - 14, 104, 26, 9); ctx.fillStyle = '#c99a4c'; ctx.fill();
  const g = ctx.createLinearGradient(0, -Hh / 2, 0, Hh / 2); g.addColorStop(0, '#f6dc9c'); g.addColorStop(1, '#e2b665');
  H.roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 16); ctx.fillStyle = g; ctx.fill();
  ctx.restore();
  H.roundRect(ctx, -W / 2 + 7, -Hh / 2 + 7, W - 14, Hh - 14, 12); ctx.fillStyle = '#faf0d6'; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(-W / 2 + 14, -Hh / 2 + 9, W - 28, 3);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = H.font('ui', 20); ctx.fillStyle = '#8a6624'; ctx.fillText(head, -W / 2 + 22, -18);
  const f = H.fitText(ctx, name, 'display', 36, 22, W - 22 - 70); ctx.font = f.font; ctx.fillStyle = '#1b1d2e'; ctx.fillText(f.text, -W / 2 + 22, 16);
  // FILED check: anticipation squash, pop with overshoot, settle
  const a = M.act(t, tCheck, { timing: 'snappy', wind: 0.4, overshoot: 0.25 });
  if (a.phase !== 'before') {
    const s = a.phase === 'anticipate' ? 0.3 * a.wind : Math.max(0, a.v), q = M.squashImpact(t, a.hit, 0.2, 0.35);
    ctx.save(); ctx.translate(W / 2 - 38, 0); ctx.scale(s / (1 + q), s * (1 + q));
    ctx.beginPath(); ctx.arc(0, 0, 25, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    ctx.strokeStyle = ink; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-11, 0); ctx.lineTo(-2, 9); ctx.lineTo(12, -9); ctx.stroke();
    ctx.restore();
  }
}

// pill (screen space): seed dot gathers (anticipation), pops with stretch + overshoot, squashes, moving hold
function pill(ctx, H, M, t, x, y, t0, text, o = {}) {
  const a = M.act(t, t0 - 0.12, { timing: 'snappy', wind: 0.35, overshoot: 0.16 });
  if (a.phase === 'before') return;
  let s, q = 0;
  if (a.phase === 'anticipate') { s = 0.2 * a.wind; q = -0.25 * a.wind; } else { s = Math.max(0, a.v); q = a.phase === 'action' ? 0.2 * (1 - a.k) : 0; }
  q += M.squashImpact(t, a.hit, 0.12, 0.4) + (o.bump || 0);
  if (o.out != null && t > o.out) { const e = M.ease.backIn(M.clamp((t - o.out) / 0.3), 1.4); s *= 1 - e; if (s <= 0.01) return; }
  const size = o.size || 30;
  ctx.save();
  ctx.translate(x, y + M.hold(t, o.seed || 0, 2.2));
  const sy = Math.max(0.5, 1 + q); ctx.scale(s / sy, s * sy);
  ctx.font = H.font('ui', size);
  const tw = Math.min(o.maxW || 760, ctx.measureText(text).width), dotW = o.dot ? size * 0.9 : 0;
  const w = tw + dotW + size * 1.4, h = size * 1.9;
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.accent ? (o.ACC || ACC_) : 'rgba(12,12,24,0.92)';
  if (o.accent) ctx.fillStyle = o.fill || ctx.fillStyle;
  ctx.fill();
  ctx.shadowColor = 'transparent';
  if (!o.accent) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke(); }
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  let tx = -w / 2 + size * 0.7;
  if (o.dot) { ctx.beginPath(); ctx.arc(tx + size * 0.25, 1, size * 0.22, 0, Math.PI * 2); ctx.fillStyle = o.ACC || ACC_; ctx.fill(); tx += dotW; }
  ctx.fillStyle = o.accent ? (o.ink || INK_) : '#ffffff';
  const f = H.fitText(ctx, text, 'ui', size, size * 0.7, tw + 1); ctx.font = f.font;
  ctx.fillText(f.text, tx, 2);
  ctx.restore();
}

// gavel 220x130 drawn with the kit2 shading helpers; hit 0 = raised (head up and back), 1 = struck. pivot = handle end
function gavel(ctx, K2, H, x, y, s, hit, L) {
  const wood = '#7a4a2c', ld = L.dir;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K2.contactShadow(ctx, 0, 0, 200, 0.45);
  K2.solid(ctx, () => { ctx.beginPath(); ctx.ellipse(0, -14, 70, 16, 0, 0, Math.PI * 2); }, K2.mat('#6a3f25', L), [-70, -30, 140, 32], ld, { rim: 2, top: 0.5 });
  H.roundRect(ctx, -70, -16, 140, 14, 7); ctx.fillStyle = '#4b2c19'; ctx.fill();
  ctx.save(); ctx.translate(80, -40); ctx.rotate(1.0 * (1 - hit) - 0.05);
  K2.limb(ctx, [0, 0], [-120, -6], 7, 6, K2.mat(wood, L), ld);
  ctx.translate(-120, -6);
  K2.solid(ctx, () => H.roundRect(ctx, -26, -50, 52, 92, 16), K2.mat(wood, L), [-26, -50, 52, 92], ld, { rim: 2, top: 0.3 });
  ctx.fillStyle = '#c9a24a'; for (const k of [-1, 1]) { H.roundRect(ctx, -27, k * 34 - 5 + (k > 0 ? -2 : 4), 54, 9, 4); ctx.fill(); }
  ctx.restore();
  ctx.restore();
}
