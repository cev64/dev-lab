// Scene "toy-shelf" (full frame; 2026-11-26, a state bans AI-chatbot toys). Generic cartoon toys with an "AI inside"
// look (glowing eyes, a chest light, wifi arcs): a teddy bear, a doll and a little toy robot. No brands, no real toys,
// no real people (officials are text pills only, never drawn).
// modes:
//  hook      (cold open) night toy-shop shelf; the three toys chat in bubbles (`lines` [3]) at frame 0, a cross stamp slams onto the
//            shelf (~0.5 s), bubbles pop away, the toys' lights go dark. Pill: `place`.
//  signed    a law sheet is signed (pen) with `by` / `date` / `ban` pills; then the sheet lifts away and the three toys
//            pop onto the floor on their `toys[].cue` words with label pills; wifi arcs + `online` pill on onlineCue.
//  fine      night street, a tower labelled `who`; a fine ticket (`ticket` head, `prefix`) counts up to `amount`, a `dayLabel` calendar flips (`per`),
//            ghost tickets fan out on eachCue with an `each` pill.
//  chat      kid's bedroom at night: verbatim quote card (`quote` / `quoteBy`); then `tester` + `tested` pills with five
//            toy icons; on loveCue the bear says `love`, hearts light on all five + `loveTally`; on secretCue the bear
//            says `secret`, most icons get a lock + `secretTally`; the kid looks unsure.
//  shoppers  toy-shop aisle with four cartoon parents holding boxes; big `big` + `sub` + `tag`, one parent's box is an
//            AI toy (ring); then a `statesHead` panel with `states[]` rows popping on their cues.
//  christmas living room, decorated tree + gifts; a calendar card `calHead`, `from` -> `to` with a day counter to `days` + `daysLabel`; one gift
//            lid lifts, glowing eyes + wifi peek out, `maybe` pill with "?".
// params: see each mode; cue params (signCue, banCue, onlineCue, toys[].cue, whoCue, amountCue, perCue, eachCue, quoteCue,
//   testCue, loveCue, secretCue, bigCue, tagCue, states[].cue, daysCue, toCue, maybeCue) are narration words; without
//   them the scene falls back to fractions of the beat.
const TAU = Math.PI * 2;
const ell = (ctx, x, y, rx, ry, col, rot = 0) => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); ctx.fillStyle = col; ctx.fill(); };
const circ = (ctx, x, y, r, col) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = col; ctx.fill(); };

function wifi(ctx, x, y, s, a, t, ACC, rgba) {
  if (a <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const ph = (Math.sin(t * 4 - i * 0.9) + 1) / 2;
    ctx.strokeStyle = rgba(ACC, a * (0.35 + 0.65 * ph)); ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(0, 0, 14 + i * 14, -Math.PI * 0.78, -Math.PI * 0.22); ctx.stroke();
  }
  circ(ctx, 0, -2, 6, rgba(ACC, a));
  ctx.restore();
}

function eyes(ctx, K, pts, r, ai, ACC, t, seed, H) {
  const blink = ((t + seed * 0.7) % 3.3) < 0.12;
  for (const [x, y] of pts) {
    if (ai > 0.05) K.glow(ctx, x, y, r * 3.2, ACC, 0.45 * ai);
    ctx.beginPath(); ctx.ellipse(x, y, r, blink ? r * 0.2 : r, 0, 0, TAU);
    ctx.fillStyle = H.mixHex('#2a1d18', ACC, ai); ctx.fill();
  }
}

function bear(ctx, x, y, s, o, K, H, ACC) {
  const ai = o.ai == null ? 1 : o.ai, talk = o.talk || 0, t = o.t || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.shadow(ctx, 0, 0, 160);
  const fur = '#b9783f', furS = '#97602f', furL = '#e6b886';
  ell(ctx, -54, -82, 17, 34, furS, 0.5 + (o.wave ? Math.sin(t * 7) * 0.35 : 0));
  ell(ctx, 54, -82, 17, 34, furS, -0.5);
  ell(ctx, 0, -66, 54, 56, fur);
  ell(ctx, 0, -60, 32, 34, furL);
  ell(ctx, -32, -16, 27, 18, furS); ell(ctx, 32, -16, 27, 18, furS);
  ell(ctx, -32, -14, 14, 10, furL); ell(ctx, 32, -14, 14, 10, furL);
  // chest light: the "AI inside"
  if (ai > 0.05) K.glow(ctx, 0, -62, 30, ACC, 0.5 * ai);
  circ(ctx, 0, -62, 10, H.mixHex('#6b4a2c', ACC, ai)); circ(ctx, 0, -62, 4, H.rgba('#ffffff', 0.5 * ai));
  const hy = -140 + (o.bob || 0);
  circ(ctx, -38, hy - 34, 18, fur); circ(ctx, 38, hy - 34, 18, fur);
  circ(ctx, -38, hy - 34, 10, furL); circ(ctx, 38, hy - 34, 10, furL);
  ell(ctx, 0, hy, 50, 46, fur);
  ell(ctx, 0, hy + 16, 23, 17, furL);
  ell(ctx, 0, hy + 8, 9, 6, '#3b2416');
  ell(ctx, 0, hy + 24, 8, 2 + 7 * talk, '#5a2a1f');
  eyes(ctx, K, [[-18, hy - 10], [18, hy - 10]], 7, ai, ACC, t, o.seed || 1, H);
  ctx.restore();
}

function doll(ctx, x, y, s, o, K, H, ACC) {
  const ai = o.ai == null ? 1 : o.ai, talk = o.talk || 0, t = o.t || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.shadow(ctx, 0, 0, 130);
  const skin = '#f3cfae', dress = '#e46f9a', dressS = '#c4527c', hair = '#7a3f22';
  H.roundRect(ctx, -22, -30, 14, 28, 6); ctx.fillStyle = skin; ctx.fill();
  H.roundRect(ctx, 8, -30, 14, 28, 6); ctx.fill();
  ell(ctx, -16, -4, 15, 8, '#3b2a4a'); ell(ctx, 16, -4, 15, 8, '#3b2a4a');
  ell(ctx, -40, -84, 10, 30, skin, 0.35); ell(ctx, 40, -84, 10, 30, skin, -0.35);
  ctx.beginPath(); ctx.moveTo(-54, -26); ctx.lineTo(54, -26); ctx.lineTo(28, -110); ctx.lineTo(-28, -110); ctx.closePath(); ctx.fillStyle = dress; ctx.fill();
  ctx.beginPath(); ctx.moveTo(-54, -26); ctx.lineTo(54, -26); ctx.lineTo(48, -44); ctx.lineTo(-48, -44); ctx.closePath(); ctx.fillStyle = dressS; ctx.fill();
  if (ai > 0.05) K.glow(ctx, 0, -84, 26, ACC, 0.5 * ai);
  circ(ctx, 0, -84, 9, H.mixHex('#8a3a5c', ACC, ai));
  const hy = -146;
  circ(ctx, -46, hy + 14, 17, hair); circ(ctx, 46, hy + 14, 17, hair);
  ell(ctx, 0, hy - 4, 44, 42, hair);
  circ(ctx, 0, hy + 4, 36, skin);
  ctx.beginPath(); ctx.arc(0, hy - 2, 38, Math.PI * 1.05, Math.PI * 1.95); ctx.lineTo(20, hy - 22); ctx.lineTo(-10, hy - 16); ctx.closePath(); ctx.fillStyle = hair; ctx.fill();
  ell(ctx, -30, hy - 34, 12, 8, '#ff8fb5', -0.4); ell(ctx, -14, hy - 38, 12, 8, '#ff8fb5', 0.4); circ(ctx, -22, hy - 36, 5, '#e46f9a');
  ell(ctx, -22, hy + 16, 7, 4, 'rgba(255,120,150,0.45)'); ell(ctx, 22, hy + 16, 7, 4, 'rgba(255,120,150,0.45)');
  ell(ctx, 0, hy + 22, 7, 2 + 5 * talk, '#8a2f3f');
  eyes(ctx, K, [[-13, hy + 2], [13, hy + 2]], 6, ai, ACC, t, o.seed || 2, H);
  ctx.restore();
}

function toyBot(ctx, x, y, s, o, K, H, ACC) {
  const ai = o.ai == null ? 1 : o.ai, talk = o.talk || 0, t = o.t || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.shadow(ctx, 0, 0, 140);
  H.roundRect(ctx, -40, -18, 32, 18, 6); ctx.fillStyle = '#2b3350'; ctx.fill();
  H.roundRect(ctx, 8, -18, 32, 18, 6); ctx.fill();
  H.roundRect(ctx, -66, -108, 18, 58, 9); ctx.fillStyle = '#2f74b8'; ctx.fill();
  H.roundRect(ctx, 48, -108, 18, 58, 9); ctx.fill();
  H.roundRect(ctx, -46, -116, 92, 100, 18); ctx.fillStyle = '#3e8ed8'; ctx.fill();
  H.roundRect(ctx, -28, -96, 56, 38, 8); ctx.fillStyle = '#1d2b4a'; ctx.fill();
  for (let i = 0; i < 3; i++) { const on = ai * (0.4 + 0.6 * ((Math.sin(t * 5 + i * 2) + 1) / 2)); circ(ctx, -14 + i * 14, -77, 5, H.mixHex('#33405f', ACC, on)); }
  ctx.strokeStyle = '#2b3350'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, -184); ctx.lineTo(0, -206); ctx.stroke();
  const ab = ai * (0.5 + 0.5 * Math.sin(t * 6));
  if (ai > 0.05) K.glow(ctx, 0, -210, 22, ACC, 0.5 * ab);
  circ(ctx, 0, -210, 9, H.mixHex('#e05a4a', ACC, ai));
  H.roundRect(ctx, -46, -186, 92, 70, 22); ctx.fillStyle = '#f08a3c'; ctx.fill();
  H.roundRect(ctx, -46, -130, 92, 14, 7); ctx.fillStyle = '#d06e28'; ctx.fill();
  circ(ctx, -19, -158, 14, '#ffffff'); circ(ctx, 19, -158, 14, '#ffffff');
  eyes(ctx, K, [[-19, -158], [19, -158]], 7, ai, ACC, t, o.seed || 3, H);
  H.roundRect(ctx, -14, -136, 28, 4 + 6 * talk, 3); ctx.fillStyle = '#7a3412'; ctx.fill();
  ctx.restore();
}

const TOYS = [bear, doll, toyBot];

function gift(ctx, x, y, w, h, col, rib, H, lid = 0) {
  H.roundRect(ctx, x - w / 2, y - h, w, h, 8); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = H.mixHex(col, '#000000', 0.18); ctx.fillRect(x + w * 0.15, y - h, w * 0.35, h);
  ctx.fillStyle = rib; ctx.fillRect(x - 7, y - h, 14, h);
  ctx.save(); ctx.translate(x, y - h - lid); ctx.rotate(-lid * 0.006);
  H.roundRect(ctx, -w / 2 - 8, -18, w + 16, 20, 6); ctx.fillStyle = H.mixHex(col, '#ffffff', 0.12); ctx.fill();
  ctx.fillStyle = rib; ctx.fillRect(-7, -18, 14, 20);
  ell(ctx, -14, -24, 14, 9, rib, 0.5); ell(ctx, 14, -24, 14, 9, rib, -0.5);
  ctx.restore();
}

function storeBg(ctx, t, H, K, ACC, o = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#161b3e'); g.addColorStop(0.55, '#232b58'); g.addColorStop(1, '#0c0f24');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  // ceiling spotlights
  for (let i = 0; i < 4; i++) K.glow(ctx, 160 + i * 260, 420, 260, '#ffe6b0', 0.10 + 0.02 * Math.sin(t * 1.3 + i));
  // shelving unit
  H.roundRect(ctx, 60, 440, 960, 620, 18); ctx.fillStyle = '#2a3264'; ctx.fill();
  H.roundRect(ctx, 80, 460, 920, 580, 12); ctx.fillStyle = '#1f2550'; ctx.fill();
  const planks = o.planks || [];
  for (const py of planks) {
    H.roundRect(ctx, 70, py, 940, 22, 6); ctx.fillStyle = '#4b5594'; ctx.fill();
    ctx.fillStyle = '#353e78'; ctx.fillRect(70, py + 18, 940, 10);
  }
  // floor
  const fg = ctx.createLinearGradient(0, 1040, 0, 1920); fg.addColorStop(0, '#1b2045'); fg.addColorStop(1, '#090b1c');
  ctx.fillStyle = fg; ctx.fillRect(0, 1040, 1080, 880);
  ctx.fillStyle = '#3a4380'; ctx.fillRect(0, 1036, 1080, 8);
  // small stock boxes on the upper plank(s)
  if (o.stock) for (const py of o.stock) for (let i = 0; i < 7; i++) {
    const bx = 130 + i * 128 + (H.hash(i, py) - 0.5) * 20, bh = 70 + 40 * H.hash(i, py + 1);
    const cols = ['#e46f9a', '#3e8ed8', '#f0b33c', '#5bbf8a', '#9a7be0'];
    gift(ctx, bx, py, 84, bh, cols[i % 5], '#f4f6fb', H);
  }
}

function pill(K, ctx, x, y, k, text, o = {}) { if (k > 0) K.drawLabel(ctx, x, y, Math.min(1.05, k), Object.assign({ text, size: o.size || 30 }, o)); }

function card(ctx, H, cx, cy, w, h, o = {}) {
  H.roundRect(ctx, cx - w / 2, cy - h / 2, w, h, o.r || 26); ctx.fillStyle = o.fill || 'rgba(10,12,26,0.92)'; ctx.fill();
  if (o.stroke) { ctx.lineWidth = 4; ctx.strokeStyle = o.stroke; H.roundRect(ctx, cx - w / 2, cy - h / 2, w, h, o.r || 26); ctx.stroke(); }
}
function text(ctx, H, s, x, y, kind, size, col, align = 'center', maxW = 0) {
  ctx.font = H.font(kind, size);
  if (maxW) { let sz = size; while (sz > 22 && ctx.measureText(s).width > maxW) { sz -= 2; ctx.font = H.font(kind, sz); } }
  ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y);
}

// ---------------------------------------------------------------- modes
function hook(ctx, t, info, H, K, P, D, ACC) {
  const tStamp = 0.45, land = H.clamp((t - tStamp) / 0.55), off = H.smooth((t - 1.0) / 0.6);
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
  if (K.cameraShake) K.cameraShake(ctx, t, tStamp + 0.32, 0.4, 14);
  storeBg(ctx, t, H, K, ACC, { planks: [950] });
  // shop sign: the place
  card(ctx, H, 487, 452, 440, 76, { fill: '#f4f6fb', r: 20 });
  text(ctx, H, P.place || 'STATE', 487, 454, 'display', 46, '#1a1f3d');
  const xs = [225, 487, 750], said = P.lines || ['Let\'s chat!', 'Tell me a secret!', 'I\'m listening!'];
  xs.forEach((x, i) => {
    const ai = 1 - off;
    const talk = ai * Math.max(0, Math.sin(t * 9 + i * 2)) * 0.8;
    TOYS[i](ctx, x, 950, 1.5, { t, ai, talk, seed: i + 1, wave: i === 0 && off < 1 }, K, H, ACC);
    wifi(ctx, x + 95, 720, 0.9, ai, t + i, ACC, H.rgba);
  });
  // bubbles: up at frame 0, pop away after the stamp
  const bub = 1 - H.smooth((t - 0.95) / 0.3);
  if (bub > 0) [[200, 650, 'left'], [487, 572, 'center'], [770, 650, 'right']].forEach(([x, y, tail], i) =>
    K.drawSpeechBubble(ctx, x, y, 1, { text: said[i], size: 30, maxW: i === 1 ? 340 : 250, tail, pop: bub }));
  // the stamp
  K.drawStamp(ctx, 487, 1000, 1.8, { kind: 'cross', text: P.stamp || 'BANNED', land });
}

function signed(ctx, t, info, H, K, P, D, ACC, at) {
  const toys = P.toys || [{ text: 'Teddy bears' }, { text: 'Dolls' }, { text: 'Robots' }];
  const tT = toys.map((o, i) => at(o.cue, D * (0.55 + i * 0.1)) - 0.25);
  const tSign = at(P.signCue, D * 0.25), tBan = at(P.banCue, D * 0.35) - 0.2;
  const tOn = at(P.onlineCue, D * 0.85) - 0.3;
  const tSwap = tT[0] - 0.55, sw = H.smooth((t - tSwap) / 0.5);
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
  storeBg(ctx, t, H, K, ACC, { planks: [600], stock: [600] });
  // phase A: the law sheet
  if (sw < 1) {
    ctx.save(); ctx.globalAlpha = 1 - sw; ctx.translate(0, -sw * 120);
    ctx.fillStyle = 'rgba(8,10,24,0.55)'; ctx.fillRect(0, 620, 1080, 440);
    const dk = K.popIn(t, 0.1, 0.5);
    const sign = H.clamp((t - (tSign - 0.5)) / 1.3);
    if (dk > 0) {
      K.drawDocument(ctx, 300, 1010, 2.1 * Math.min(1.04, dk), { lines: 6, sign, seal: t > tBan + 0.2 });
      // pen tracing the signature
      if (sign > 0 && sign < 1) {
        const px = 300 + 2.1 * (-50 + 68 * sign), py = 1010 + 2.1 * (-38 + 8 * Math.sin(sign * 18));
        ctx.save(); ctx.translate(px, py); ctx.rotate(-0.7);
        H.roundRect(ctx, -8, -120, 16, 110, 6); ctx.fillStyle = '#2c3566'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(-8, -10); ctx.lineTo(8, -10); ctx.lineTo(0, 6); ctx.closePath(); ctx.fillStyle = '#f0b33c'; ctx.fill();
        ctx.restore();
      }
    }
    pill(K, ctx, 700, 690, K.popIn(t, 0.4, 0.4), P.by || 'Governor', { dot: true });
    pill(K, ctx, 700, 790, K.popIn(t, tSign - 0.1, 0.4), P.date || 'Signed DATE', {});
    const bk = K.popIn(t, tBan, 0.45);
    if (bk > 0) K.drawLabel(ctx, 700, 910, Math.min(1.06, bk), { text: P.ban || 'X-YEAR BAN', size: 46, accent: true });
    ctx.restore();
  }
  // phase B: the toys it covers
  if (sw > 0) {
    const xs = [235, 487, 740];
    toys.forEach((o, i) => {
      const k = K.popIn(t, tT[i], 0.45);
      if (k <= 0) return;
      const on = H.smooth((t - tOn) / 0.4);
      TOYS[i](ctx, xs[i], 1010, 1.2 * Math.min(1.04, k), { t, ai: 0.35 + 0.65 * on, talk: on * Math.max(0, Math.sin(t * 9 + i)) * 0.7, seed: i + 1 }, K, H, ACC);
      wifi(ctx, xs[i] + 82, 790, 0.85, on, t + i, ACC, H.rgba);
      pill(K, ctx, xs[i], 730, k, o.text, { size: 30 });
    });
    const ok = K.popIn(t, tOn, 0.45);
    pill(K, ctx, 487, 520, ok, P.online || 'Chat with kids over the internet', { accent: true, size: 32 });
    pill(K, ctx, 487, 620, K.popIn(t, tSwap + 0.2, 0.4) * (1 - 0), P.ban || 'X-YEAR BAN', { size: 28, dot: true });
  }
}

function fine(ctx, t, info, H, K, P, D, ACC, at) {
  const tWho = at(P.whoCue, D * 0.12) - 0.2;
  const tAmt = at(P.amountCue, D * 0.5) - 0.3, tPer = at(P.perCue, D * 0.7) - 0.2, tEach = at(P.eachCue, D * 0.85) - 0.3;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.04, x: 520, y: 760 }]);
  K.world.city(ctx, { t, time: 'night', groundY: 1020 });
  // the office tower (text label only)
  K.drawBuilding(ctx, 300, 1030, 1.05, { t, color: '#3b4a86', floors: 8, lit: 0.8, label: '' });
  pill(K, ctx, 270, 560, K.popIn(t, tWho, 0.45), P.who || 'Regulator', { accent: true, size: 30 });
  // fine tickets (ghosts fan out on eachCue)
  const amount = P.amount || 10000;
  const ek = H.smooth((t - tEach) / 0.6);
  const tk = K.popIn(t, tAmt - 0.45, 0.5);
  if (tk > 0) {
    for (let g = 2; g >= 0; g--) {
      const off = g * ek;
      if (g > 0 && ek <= 0) continue;
      ctx.save(); ctx.translate(655 + off * 26, 650 + off * 22); ctx.rotate(off * 0.06);
      ctx.globalAlpha = g === 0 ? 1 : 0.55 * ek;
      const s = Math.min(1.04, tk); ctx.scale(s, s);
      card(ctx, H, 0, 0, 400, 230, { fill: '#f4f6fb', r: 22 });
      H.roundRect(ctx, -200, -115, 400, 56, 22); ctx.fillStyle = '#e05a4a'; ctx.fill(); ctx.fillRect(-200, -80, 400, 22);
      if (g === 0) {
        text(ctx, H, P.ticket || 'CIVIL PENALTY', 0, -86, 'ui', 28, '#ffffff');
        const v = Math.round(K.countUp(amount, t, tAmt, 1.2, 0));
        text(ctx, H, (P.prefix || 'Up to $') + v.toLocaleString('en-US'), 0, 6, 'display', 64, '#141829', 'center', 360);
        if (t > tPer) text(ctx, H, (P.per || 'per day').toUpperCase(), 0, 76, 'ui', 30, '#c0392b');
      }
      ctx.restore();
    }
  }
  // day calendar flipping
  const ck = K.popIn(t, tPer, 0.45);
  if (ck > 0) {
    const day = 1 + Math.max(0, Math.floor((t - tPer - 0.3) / 0.55));
    ctx.save(); ctx.translate(560, 900); ctx.scale(Math.min(1.04, ck), Math.min(1.04, ck));
    card(ctx, H, 0, 0, 170, 160, { fill: '#f4f6fb', r: 18 });
    H.roundRect(ctx, -85, -80, 170, 44, 18); ctx.fillStyle = ACC; ctx.fill(); ctx.fillRect(-85, -56, 170, 20);
    text(ctx, H, P.dayLabel || 'DAY', 0, -57, 'ui', 26, '#141829');
    const flip = ((t - tPer - 0.3) % 0.55) / 0.55;
    ctx.save(); ctx.scale(1, t > tPer + 0.3 ? Math.min(1, 0.4 + flip * 2) : 1);
    text(ctx, H, String(day), 0, 30, 'display', 64, '#141829');
    ctx.restore();
    ctx.restore();
    // coins stacking beside it
    const n = Math.min(6, day);
    for (let i = 0; i < n; i++) K.drawCoin(ctx, 720 + (i % 2) * 14, 980 - i * 16, 0.9, { spin: 0, symbol: '$' });
  }
  pill(K, ctx, 650, 790, K.popIn(t, tEach, 0.45), P.each || 'for each violation', { dot: true, size: 30 });
}

function chat(ctx, t, info, H, K, P, D, ACC, at) {
  const tQ = Math.max(0.1, at(P.quoteCue, 0.6) - 0.4);
  const tTest = at(P.testCue, D * 0.45) - 0.3, tLove = at(P.loveCue, D * 0.7) - 0.3, tSec = at(P.secretCue, D * 0.88) - 0.4;
  const swap = H.smooth((t - (tTest - 0.6)) / 0.45);
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.05, x: 460, y: 770 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, plant: false, lamp: false, wall: '#2a2550' });
  // night-light + stars on the wall
  for (let i = 0; i < 9; i++) { const sx = 120 + i * 100, sy = 470 + 40 * H.hash(i, 3); circ(ctx, sx, sy, 4, H.rgba('#ffe9a8', 0.25 + 0.25 * Math.sin(t * 2 + i))); }
  // bed
  H.roundRect(ctx, 90, 820, 520, 190, 30); ctx.fillStyle = '#4a3f86'; ctx.fill();
  H.roundRect(ctx, 70, 700, 40, 320, 16); ctx.fillStyle = '#6a4a35'; ctx.fill();
  H.roundRect(ctx, 590, 790, 36, 230, 14); ctx.fill();
  H.roundRect(ctx, 110, 800, 480, 70, 26); ctx.fillStyle = '#f2f4fa'; ctx.fill();
  H.roundRect(ctx, 110, 840, 480, 150, 26); ctx.fillStyle = '#5b8fd6'; ctx.fill();
  // kid sitting up in bed + the bear
  const worried = t > tSec + 0.4;
  K.drawPerson(ctx, 250, 900, 1.15, { pose: 'sit', seat: false, t, skin: 2, hair: 0, shirt: '#f0b33c', hairStyle: 'curly', mood: worried ? 'worried' : 'happy', seed: 5, look: 0.6 });
  const talk = info.env * 0.9;
  bear(ctx, 430, 880, 0.95, { t, ai: 1, talk: t > tLove - 0.2 ? talk : 0, seed: 3, bob: Math.sin(t * 2) * 2 }, K, H, ACC);
  // shelf with other toys on the right
  doll(ctx, 760, 1010, 0.75, { t, ai: 1, seed: 4 }, K, H, ACC);
  toyBot(ctx, 870, 1010, 0.7, { t, ai: 1, seed: 6 }, K, H, ACC);
  // bubbles from the bear
  if (t > tLove) {
    const lk = K.popIn(t, tLove, 0.4) * (1 - H.smooth((t - tSec + 0.15) / 0.25));
    if (lk > 0) K.drawSpeechBubble(ctx, 505, 825, 1, { text: P.love || 'I love you!', size: 32, tail: 'left', pop: lk });
    const sk = K.popIn(t, tSec, 0.4);
    if (sk > 0) K.drawSpeechBubble(ctx, 505, 825, 1, { text: P.secret || "It's our secret...", size: 32, tail: 'left', pop: sk, dark: true });
  }
  // phase 1: verbatim quote card
  if (swap < 1) {
    const qk = K.popIn(t, tQ, 0.45);
    if (qk > 0) {
      ctx.save(); ctx.globalAlpha = 1 - swap; ctx.translate(487, 560 - swap * 60); const s = Math.min(1.04, qk); ctx.scale(s, s);
      card(ctx, H, 0, 0, 800, 200, { stroke: ACC });
      const lines = H.wrap(ctx, P.quote || '"Quote goes here"', 'display', 46, 740);
      lines.forEach((ln, i) => text(ctx, H, ln, 0, -38 + i * 54 - (lines.length - 1) * 10, 'display', 46, '#ffffff'));
      text(ctx, H, '- ' + (P.quoteBy || 'Speaker'), 0, 66, 'ui', 28, ACC);
      ctx.restore();
    }
  }
  // phase 2: tester + five toy icons + tallies
  if (swap > 0) {
    ctx.save(); ctx.globalAlpha = swap;
    pill(K, ctx, 487, 480, K.popIn(t, tTest - 0.5, 0.4), P.tester || 'Test group', { dot: true, size: 30 });
    pill(K, ctx, 487, 545, K.popIn(t, tTest, 0.4), P.tested || 'Tested X AI toys', { accent: true, size: 30 });
    const icoY = 605;
    for (let i = 0; i < 5; i++) {
      const k = K.popIn(t, tTest + 0.15 + i * 0.12, 0.35);
      if (k <= 0) continue;
      const x = 247 + i * 120;
      ctx.save(); ctx.translate(x, icoY); ctx.scale(k, k);
      circ(ctx, 0, 0, 40, 'rgba(10,12,26,0.85)');
      ctx.lineWidth = 3; ctx.strokeStyle = H.rgba('#ffffff', 0.2); ctx.beginPath(); ctx.arc(0, 0, 40, 0, TAU); ctx.stroke();
      [bear, doll, toyBot, bear, toyBot][i](ctx, 0, 30, 0.3, { t, ai: 1, seed: i }, K, H, ACC);
      // heart on loveCue (all 5)
      const hk = K.popIn(t, tLove + 0.1 + i * 0.1, 0.3);
      if (hk > 0) { ctx.save(); ctx.translate(28, -30); ctx.scale(hk, hk); heart(ctx, '#ff5c8a'); ctx.restore(); }
      // lock on secretCue (most: 4 of 5 drawn as "most", illustrative)
      const lockK = i !== 2 ? K.popIn(t, tSec + 0.1 + i * 0.1, 0.3) : 0;
      if (lockK > 0) { ctx.save(); ctx.translate(-28, -30); ctx.scale(lockK, lockK); K.drawLock(ctx, 0, 14, 0.28, { open: 0 }); ctx.restore(); }
      ctx.restore();
    }
    const lv = K.popIn(t, tLove + 0.3, 0.4) * (1 - H.smooth((t - tSec) / 0.3));
    pill(K, ctx, 487, 712, lv, P.loveTally || 'X of Y: claimed to love users', { size: 28 });
    pill(K, ctx, 487, 712, K.popIn(t, tSec + 0.2, 0.4), P.secretTally || 'X of Y: promised to keep secrets', { size: 28 });
    ctx.restore();
  }
}
function heart(ctx, col) {
  ctx.beginPath(); ctx.moveTo(0, 12); ctx.bezierCurveTo(-22, -4, -12, -22, 0, -10); ctx.bezierCurveTo(12, -22, 22, -4, 0, 12); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}

function shoppers(ctx, t, info, H, K, P, D, ACC, at) {
  const tBig = at(P.bigCue, D * 0.2) - 0.3, tTag = at(P.tagCue, D * 0.45) - 0.3;
  const states = P.states || [{ text: 'State A' }, { text: 'State B' }];
  const tS = states.map((s, i) => at(s.cue, D * (0.7 + i * 0.1)) - 0.3);
  const tPanel = Math.min(...tS) - 0.35, pv = H.smooth((t - tPanel) / 0.4);
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
  storeBg(ctx, t, H, K, ACC, { planks: [640, 820], stock: [640, 820] });
  ctx.fillStyle = 'rgba(8,10,24,0.62)'; ctx.fillRect(0, 440, 1080, 620);
  // four parents walking in, holding boxes; one box is an AI toy
  const xs = [175, 375, 600, 800], cols = ['#4a7bd0', '#e0784f', '#5bbf8a', '#9a7be0'];
  xs.forEach((x, i) => {
    const wx = x + (1 - H.smooth(t / 1.2)) * (i % 2 ? 40 : -40);
    const chosen = i === 2, ring = chosen ? H.smooth((t - tBig - 0.4) / 0.4) : 0;
    if (ring > 0) K.glow(ctx, wx, 880, 170, ACC, 0.45 * ring);
    K.drawPerson(ctx, wx, 1030, 1.2, { pose: 'stand', t, walk: t < 1.2 ? t : 0, skin: (i * 2) % 5, hair: i, shirt: cols[i], hairStyle: ['short', 'long', 'bun', 'curly'][i], mood: 'neutral', seed: 11 + i, look: chosen ? 0.4 : 0 });
    const by = 925;
    gift(ctx, wx + 40, by, 80, 64, ['#e46f9a', '#3e8ed8', '#f0b33c', '#5bbf8a'][i], '#f4f6fb', H, 0);
    if (chosen && ring > 0) {
      bear(ctx, wx + 40, by - 70, 0.42 * ring, { t, ai: 1, seed: 7, talk: Math.max(0, Math.sin(t * 8)) * 0.6 }, K, H, ACC);
      wifi(ctx, wx + 88, by - 120, 0.6, ring, t, ACC, H.rgba);
    }
  });
  // big number
  if (pv < 1) {
    ctx.save(); ctx.globalAlpha = 1 - pv;
    const bk = K.popIn(t, tBig, 0.5);
    if (bk > 0) {
      ctx.save(); ctx.translate(487, 520); ctx.scale(Math.min(1.06, bk), Math.min(1.06, bk));
      K.glow(ctx, 0, 0, 160, ACC, 0.25);
      text(ctx, H, P.big || 'X in Y', 0, 0, 'display', 120, ACC);
      ctx.restore();
    }
    pill(K, ctx, 487, 650, K.popIn(t, tBig + 0.4, 0.4), P.sub || 'Parents of young kids', { size: 28 });
    pill(K, ctx, 487, 712, K.popIn(t, tTag, 0.4), P.tag || 'have one or are considering one', { size: 28, dot: true });
    ctx.restore();
  }
  // states panel
  if (pv > 0) {
    ctx.save(); ctx.globalAlpha = pv; ctx.translate(487, 590); const s = 0.9 + 0.1 * pv; ctx.scale(s, s);
    card(ctx, H, 0, 0, 640, 280, { stroke: H.rgba(ACC, 0.7) });
    text(ctx, H, (P.statesHead || 'States with a ban').toUpperCase(), 0, -95, 'ui', 28, H.rgba('#ffffff', 0.8));
    // rows ordered by rank: first state listed = row 1
    states.forEach((st, i) => {
      const k = K.popIn(t, tS[i], 0.4);
      if (k <= 0) return;
      const y = -30 + i * 85;
      ctx.save(); ctx.translate(0, y); ctx.scale(Math.min(1.04, k), Math.min(1.04, k));
      H.roundRect(ctx, -280, -34, 560, 68, 20); ctx.fillStyle = i === states.length - 1 ? ACC : 'rgba(255,255,255,0.1)'; ctx.fill();
      const ink = i === states.length - 1 ? '#141829' : '#ffffff';
      text(ctx, H, String(i + 1), -240, 2, 'display', 40, ink);
      text(ctx, H, st.text, -200, 2, 'display', 40, ink, 'left');
      ctx.strokeStyle = ink; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(214, 2); ctx.lineTo(230, 18); ctx.lineTo(256, -14); ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  }
}

function christmas(ctx, t, info, H, K, P, D, ACC, at) {
  const tDays = at(P.daysCue, D * 0.3) - 0.3, tTo = at(P.toCue, D * 0.5) - 0.3, tMaybe = at(P.maybeCue, D * 0.85) - 0.6;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.05, x: 440, y: 780 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, plant: false, lamp: false });
  K.glow(ctx, 280, 800, 380, '#ffcf7a', 0.16);
  // tree
  const tx = 280, ty = 990;
  ctx.fillStyle = '#6a4a35'; ctx.fillRect(tx - 16, ty - 60, 32, 60);
  [[0, 160, 120], [1, 130, 230], [2, 100, 330]].forEach(([i, w, top]) => {
    const yb = ty - 40 - i * 100;
    ctx.beginPath(); ctx.moveTo(tx - w, yb); ctx.lineTo(tx + w, yb); ctx.lineTo(tx, yb - 160); ctx.closePath(); ctx.fillStyle = ['#2f8a5a', '#35975f', '#3ca468'][i]; ctx.fill();
  });
  // lights
  for (let i = 0; i < 16; i++) {
    const row = i % 4, u = H.hash(i, 9), yb = ty - 70 - row * 75, w = 140 - row * 30;
    const lx = tx + (u - 0.5) * 2 * w * 0.8, on = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7);
    const c = ['#ff6b6b', '#ffd36b', ACC, '#6bc4ff'][i % 4];
    K.glow(ctx, lx, yb, 18, c, 0.5 * on); circ(ctx, lx, yb, 6, c);
  }
  // star
  ctx.save(); ctx.translate(tx, ty - 400); ctx.rotate(Math.sin(t) * 0.05);
  K.glow(ctx, 0, 0, 50, '#ffd36b', 0.5);
  ctx.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 12 : 28, a = -Math.PI / 2 + i * Math.PI / 5; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fillStyle = '#ffd36b'; ctx.fill();
  ctx.restore();
  // gifts; the right one hides an AI toy
  gift(ctx, 170, 1010, 110, 80, '#e05a4a', '#ffd36b', H);
  gift(ctx, 290, 1015, 90, 60, '#3e8ed8', '#f4f6fb', H);
  const mk = H.smooth((t - tMaybe) / 0.5), wig = t > tMaybe - 0.8 && t < tMaybe ? Math.sin(t * 30) * 3 : 0;
  ctx.save(); ctx.translate(wig, 0);
  if (mk > 0) { // eyes peeking under the lid
    ctx.save(); ctx.beginPath(); ctx.rect(370, 900, 160, 40 * mk + 2); ctx.clip();
    ctx.fillStyle = '#1a1030'; ctx.fillRect(370, 900, 160, 50);
    eyes(ctx, K, [[432, 920], [468, 920]], 7, 1, ACC, t, 2, H);
    ctx.restore();
  }
  gift(ctx, 450, 1015, 130, 110, '#5bbf8a', '#e05a4a', H, 34 * mk);
  ctx.restore();
  wifi(ctx, 540, 860, 0.7, mk, t, ACC, H.rgba);
  // calendar card
  const ck = K.popIn(t, 0.15, 0.45);
  if (ck > 0) {
    ctx.save(); ctx.translate(700, 620); ctx.scale(Math.min(1.04, ck), Math.min(1.04, ck));
    card(ctx, H, 0, 0, 380, 300, { stroke: H.rgba(ACC, 0.6) });
    text(ctx, H, P.calHead || 'BAN STARTS', 0, -112, 'ui', 28, H.rgba('#ffffff', 0.8));
    text(ctx, H, P.from || 'DATE', -100, -50, 'display', 36, '#ffffff');
    text(ctx, H, '>', 0, -50, 'display', 36, H.rgba('#ffffff', 0.6));
    const tk = K.popIn(t, tTo, 0.4);
    if (tk > 0) { ctx.save(); ctx.translate(100, -50); ctx.scale(tk, tk); text(ctx, H, P.to || 'MONTH', 0, 0, 'display', 36, ACC, 'center', 160); ctx.restore(); }
    const days = P.days || 60, d = Math.round(K.countUp(days, t, tDays, 1.6, 0));
    text(ctx, H, String(d), 0, 36, 'display', 76, '#ffffff');
    text(ctx, H, P.daysLabel || 'days to go', 0, 92, 'ui', 26, H.rgba('#ffffff', 0.7));
    H.roundRect(ctx, -150, 118, 300, 12, 6); ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill();
    H.roundRect(ctx, -150, 118, 300 * H.clamp(d / days), 12, 6); ctx.fillStyle = ACC; ctx.fill();
    ctx.restore();
  }
  const pk = K.popIn(t, tMaybe + 0.3, 0.45);
  pill(K, ctx, 700, 870, pk, (P.maybe || 'Could still be gifted') + ' ?', { accent: true, size: 30 });
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const modes = { hook, signed, fine, chat, shoppers, christmas };
  ctx.save();
  (modes[P.mode] || hook)(ctx, t, info, H, K, P, D, ACC, at);
  ctx.restore();
}
