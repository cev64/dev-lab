// Scene "canary-line" (full frame, one beat per mode). The AI supply chain as a night sorting hall: prompts are
// envelopes riding a conveyor belt through middlemen booths (router, reseller, provider). Some envelopes carry a
// glowing "canary" tag (a trackable secret: a small yellow bird badge). Generic booths, names as text only, no logos.
// modes:
//   hook     cold open: belt running, a hooded figure copies an envelope at a provider booth, a bait key flies to an
//            empty vault door that swings open, the tag flares; big "2,000,000" counter on top.
//   route    a phone ("Your AI app") sends envelopes; the straight path to the AI is crossed out; router and reseller
//            booths rise on their cues; on everyCue each booth window lights with an eye and the envelope under it opens.
//   breach   three provider booths, BREACHED stamps, hooded figures siphon copies into sacks, keys fly to empty vault
//            doors, header flips to the key-use line, then booth staff with "?" bubbles ("None knew until he told them").
//   reseller a reseller booth with a low price tag, "No hack needed", a LOGGING switch flips ON and copies fly into a log
//            box; then a night room: someone at a laptop opens the secret link, the tag lights, "a day and a half later".
//   privacy  an envelope with a "Zero Data Retention" flag goes into a provider booth and a copy is filed anyway
//            ("appeared not to honor"); a crawler bot keeps visiting a secret-link door as a day counter passes 60;
//            then three booths with redacted signs ("not named") and magnifiers ("several investigating").
// params: mode + text (head, sub, labels...) + cues (narration words; "word#n" = (n+1)th time; else fractions)
//         numbers: count (hook counter target, 1000000), countFrom (start, count*0.82), days (privacy day counter, 30)
const CANARY = '#ffd23a', CANARY_S = '#e0a91c', RED = '#ff6b5e';

function bird(ctx, x, y, s, col, shade) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.ellipse(-2, 4, 15, 11, -0.2, 0, Math.PI * 2); ctx.fill();          // body
  ctx.beginPath(); ctx.arc(10, -7, 8, 0, Math.PI * 2); ctx.fill();                          // head
  ctx.beginPath(); ctx.moveTo(-14, 4); ctx.lineTo(-26, -2); ctx.lineTo(-24, 10); ctx.closePath(); ctx.fill(); // tail
  ctx.fillStyle = shade; ctx.beginPath(); ctx.ellipse(-4, 4, 8, 5, -0.4, 0, Math.PI * 2); ctx.fill(); // wing
  ctx.fillStyle = '#ff9a3c'; ctx.beginPath(); ctx.moveTo(17, -8); ctx.lineTo(24, -5); ctx.lineTo(17, -3); ctx.closePath(); ctx.fill(); // beak
  ctx.fillStyle = '#1b1d2c'; ctx.beginPath(); ctx.arc(12, -9, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
// round canary badge; lit 0..1 adds a glow and a ring
function tag(ctx, H, K, x, y, s, lit) {
  if (lit > 0) K.glow(ctx, x, y, 46 * s * (1 + lit * 0.6), CANARY, 0.35 + 0.5 * lit);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#20243c'; ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = H.mixHex(CANARY_S, '#ffffff', lit * 0.6); ctx.stroke();
  bird(ctx, -1, 2, 0.62, CANARY, CANARY_S);
  ctx.restore();
}
// envelope centred at (x, y), 100x66 at s = 1. o: tag (null = none, else lit 0..1), open 0..1, alpha
function envelope(ctx, H, K, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (o.rot) ctx.rotate(o.rot);
  const open = o.open || 0;
  if (open > 0) { // letter rises out
    H.roundRect(ctx, -40, -30 - 46 * open, 80, 60, 5); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.fillStyle = '#9aa3bd';
    for (let i = 0; i < 3; i++) ctx.fillRect(-30, -20 - 46 * open + i * 13, i === 2 ? 34 : 60, 5);
  }
  H.roundRect(ctx, -50, -33, 100, 66, 8); ctx.fillStyle = '#f4efe2'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#cdbf9e'; ctx.stroke();
  ctx.beginPath();
  if (open > 0) { ctx.moveTo(-48, -30); ctx.lineTo(0, -30 - 34 * open); ctx.lineTo(48, -30); }
  else { ctx.moveTo(-48, -30); ctx.lineTo(0, 6); ctx.lineTo(48, -30); }
  ctx.stroke();
  ctx.restore();
  if (o.tag != null) tag(ctx, H, K, x + 40 * s, y + 18 * s, 0.62 * s, o.tag);
}
function drawKey(ctx, x, y, s, rot, color, dark) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = color; ctx.strokeStyle = dark; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(-26, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(-26, 0, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color; ctx.fillRect(-10, -6, 50, 12); ctx.strokeRect(-10, -6, 50, 12);
  ctx.fillRect(26, 6, 8, 12); ctx.fillRect(14, 6, 7, 9);
  ctx.restore();
}
// a booth (kiosk) standing at feet; the belt passes in front of its base. o: label, w, h, color, read 0..1 (window
// lit + eye), staff ('robot' | 'person' | null), alarm 0..1, redact (sign shows bars), q (staff "?" 0..1), t
function booth(ctx, H, K, x, feet, o = {}) {
  const w = o.w || 200, h = o.h || 270, t = o.t || 0;
  const base = o.color || '#4b5694', shade = H.mixHex(base, '#000000', 0.3), light = H.mixHex(base, '#ffffff', 0.2);
  const top = feet - h;
  K.shadow(ctx, x, feet, w * 1.2);
  H.roundRect(ctx, x - w / 2, top, w, h, 12); ctx.fillStyle = base; ctx.fill();
  ctx.save(); H.roundRect(ctx, x - w / 2, top, w, h, 12); ctx.clip(); ctx.fillStyle = shade; ctx.fillRect(x + w * 0.22, top, w, h); ctx.restore();
  // awning stripes
  const aw = w + 26;
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? light : '#e9ecf7'; ctx.fillRect(x - aw / 2 + i * aw / 6, top - 6, aw / 6 + 0.5, 30); }
  H.roundRect(ctx, x - aw / 2, top + 20, aw, 10, 5); ctx.fillStyle = shade; ctx.fill();
  // window
  const wx = x - w * 0.36, wy = top + 48, ww = w * 0.72, wh = h * 0.36;
  const read = o.read || 0;
  H.roundRect(ctx, wx, wy, ww, wh, 10); ctx.fillStyle = H.mixHex('#121527', '#ffe7a8', 0.12 + 0.55 * read); ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = light; ctx.stroke();
  ctx.save(); H.roundRect(ctx, wx, wy, ww, wh, 10); ctx.clip();
  if (o.staff === 'robot') K.drawRobot(ctx, x, wy + wh + 70, 0.62, { t, state: o.staffState || 'working', seed: o.seed || 3 });
  else if (o.staff === 'person') K.drawPerson(ctx, x, wy + wh + 92, 0.62, { t, pose: o.q > 0 ? 'shrug' : 'stand', mood: o.q > 0 ? 'shocked' : 'neutral', skin: o.skin || 1, hair: o.hair || 0, shirt: o.shirt || 2, hairStyle: o.hairStyle || 'short', seed: o.seed || 3 });
  ctx.restore();
  if (read > 0) { // eye reading
    const ex = x, ey = wy + wh * 0.5, r = 34 * read;
    ctx.save(); ctx.globalAlpha = read;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(ex, ey, r * 1.35, r * 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1b2140'; ctx.beginPath(); ctx.arc(ex + Math.sin(t * 3) * 6, ey + 4, r * 0.48, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // sign above the awning
  const label = String(o.label || 'Booth');
  ctx.font = K.font.ui(26);
  const sw = Math.max(w * 0.8, ctx.measureText(label).width + 36);
  H.roundRect(ctx, x - sw / 2, top - 60, sw, 46, 10); ctx.fillStyle = '#151a33'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = o.alarm > 0 ? H.mixHex(light, RED, o.alarm) : light; ctx.stroke();
  if (o.redact > 0) {
    ctx.fillStyle = '#05060c';
    const bw = (sw - 40) * H.clamp(o.redact);
    ctx.fillRect(x - (sw - 40) / 2, top - 50, bw, 26);
    if (o.redact < 1) { ctx.save(); ctx.beginPath(); ctx.rect(x - (sw - 40) / 2 + bw, top - 60, sw, 46); ctx.clip(); }
  }
  if (!(o.redact >= 1)) {
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, x, top - 36);
    if (o.redact > 0) ctx.restore();
  }
  // alarm light on the roof
  if (o.alarm > 0) {
    const blink = 0.55 + 0.45 * Math.sin(t * 12);
    K.glow(ctx, x + sw / 2 - 4, top - 66, 40, RED, 0.7 * o.alarm * blink);
    ctx.fillStyle = H.mixHex('#7a2a2a', RED, blink); ctx.beginPath(); ctx.arc(x + sw / 2 - 4, top - 66, 12, Math.PI, 0); ctx.fill();
  }
  // counter slot over the belt
  H.roundRect(ctx, x - w * 0.42, feet - 112, w * 0.84, 40, 8); ctx.fillStyle = H.mixHex(shade, '#000000', 0.35); ctx.fill();
  return { window: [x, wy + wh / 2], top, signY: top - 36 };
}
function belt(ctx, H, x0, x1, y, t, speed) {
  H.roundRect(ctx, x0, y, x1 - x0, 30, 15); ctx.fillStyle = '#2b3150'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#59628f'; ctx.stroke();
  ctx.save(); H.roundRect(ctx, x0, y, x1 - x0, 30, 15); ctx.clip();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  const off = (t * speed) % 40;
  for (let x = x0 - 40 + off; x < x1; x += 40) ctx.fillRect(x, y + 4, 14, 6);
  ctx.restore();
  // legs
  ctx.fillStyle = '#1c2036';
  for (let x = x0 + 40; x < x1 - 20; x += 180) ctx.fillRect(x, y + 30, 12, 70);
}
// round vault door seen from the front; open 0..1 swings it (narrows to the left) and shows an empty interior
function vault(ctx, H, K, x, y, r, open, t, label) {
  ctx.save();
  ctx.fillStyle = '#0a0c16'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  if (open > 0.05) { // empty inside: bare shelves
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r - 6, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#171b2e'; ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
    ctx.fillStyle = '#2a3050'; ctx.fillRect(x - r, y - 8, 2 * r, 6); ctx.fillRect(x - r, y + r * 0.45, 2 * r, 6);
    ctx.restore();
  }
  const sx = 1 - 0.82 * open;
  ctx.translate(x - r * (1 - sx), y); ctx.scale(sx, 1);
  ctx.fillStyle = '#8f98b8'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#6d7699'; ctx.beginPath(); ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9d0e8'; ctx.lineWidth = Math.max(4, r * 0.08);
  const rot = open * 2.5 + t * 0;
  for (let i = 0; i < 3; i++) { const a = rot + i * Math.PI / 3; ctx.beginPath(); ctx.moveTo(Math.cos(a) * -r * 0.5, Math.sin(a) * -r * 0.5); ctx.lineTo(Math.cos(a) * r * 0.5, Math.sin(a) * r * 0.5); ctx.stroke(); }
  ctx.fillStyle = '#c9d0e8'; ctx.beginPath(); ctx.arc(0, 0, r * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  if (label && open > 0.3) {
    ctx.save(); ctx.globalAlpha = H.clamp((open - 0.3) / 0.4);
    ctx.font = K.font.ui(24); ctx.fillStyle = '#e8ecf8'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, x, y - r - 24); ctx.restore();
  }
}
function hooded(ctx, H, K, x, y, s, o = {}) {
  const t = o.t || 0;
  const bob = Math.sin(t * 1.5) * 1.5;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  K.shadow(ctx, 0, 0, 110);
  const cloak = '#343a5a', cloakS = '#252a44';
  for (const side of [-1, 1]) {
    ctx.save(); ctx.translate(side * 14, -70 + bob);
    H.roundRect(ctx, -9, 0, 18, 66, 8); ctx.fillStyle = '#14162a'; ctx.fill();
    H.roundRect(ctx, -12, 58, 30, 14, 7); ctx.fillStyle = '#0c0d18'; ctx.fill();
    ctx.restore();
  }
  ctx.translate(0, bob);
  ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -62); ctx.lineTo(54, -62); ctx.quadraticCurveTo(58, -110, 34, -178); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = cloakS; ctx.fillRect(18, -190, 60, 140); ctx.restore();
  const r = o.reach || 0;
  ctx.strokeStyle = cloak; ctx.lineWidth = 17; ctx.lineCap = 'round';
  const hx = 48 + r * 60, hy = -122 - r * 30;
  ctx.beginPath(); ctx.moveTo(26, -160); ctx.lineTo(40 + r * 30, -130 - r * 20); ctx.lineTo(hx, hy); ctx.stroke();
  ctx.fillStyle = '#14162a'; ctx.beginPath(); ctx.arc(hx, hy, 10, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -262); ctx.quadraticCurveTo(46, -250, 44, -200); ctx.quadraticCurveTo(42, -170, 0, -168); ctx.quadraticCurveTo(-42, -170, -44, -200); ctx.quadraticCurveTo(-46, -244, 0, -262); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(4, -204, 26, 25, 0, 0, Math.PI * 2); ctx.fillStyle = '#07080f'; ctx.fill();
  const blink = (t % 3.1) < 0.12 ? 0.2 : 1;
  ctx.fillStyle = o.eye || '#ff6b5e';
  for (const ex of [-6, 14]) { ctx.beginPath(); ctx.ellipse(ex, -206, 5, 4 * blink, 0, 0, Math.PI * 2); ctx.fill(); }
  ctx.restore();
  const f = o.flip ? -1 : 1;
  return { hand: [x + f * hx * s, y + (hy + bob) * s] };
}
function sack(ctx, H, x, y, s, fill) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K0shadow(ctx, H);
  ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(-44, -50, -16, -70); ctx.lineTo(16, -70); ctx.quadraticCurveTo(44, -50, 34, 0); ctx.closePath();
  ctx.fillStyle = '#8a6a48'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#5e4630'; ctx.stroke();
  ctx.fillStyle = '#5e4630'; ctx.fillRect(-18, -76, 36, 8);
  if (fill > 0) { ctx.fillStyle = '#f4efe2'; for (let i = 0; i < Math.min(4, Math.ceil(fill * 4)); i++) ctx.fillRect(-14 + i * 7, -92 - (i % 2) * 6, 16, 22); }
  ctx.restore();
}
function K0shadow(ctx) { ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, 2, 40, 8, 0, 0, Math.PI * 2); ctx.fill(); }

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, easeOutCubic, easeInOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const pill = (text, x, y, a, b, o = {}) => {
    if (t < a || (b != null && t > b + 0.3)) return;
    ctx.save(); if (b != null) ctx.globalAlpha = 1 - clamp((t - b) / 0.3);
    K.drawLabel(ctx, x, y, K.popIn(t, a, 0.4), { text, size: o.size || 28, dot: !o.accent, accent: o.accent });
    ctx.restore();
  };
  const hall = () => {
    K.world.room(ctx, { t, time: 'night', window: false, lamp: false, picture: false, plant: false, floorY: 1000 });
    // faint ceiling lights
    for (let i = 0; i < 4; i++) K.glow(ctx, 150 + i * 260, 420, 120, '#7f9cff', 0.12);
  };
  const FEET = 1040, BY = 948;
  const mode = P.mode || 'route';

  // ------------------------------------------------------------------ hook
  if (mode === 'hook') {
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 520, y: 760 }, { t: D, zoom: 1.0, x: 490, y: 740 }]);
    hall();
    const SP = 170;
    booth(ctx, H, K, 250, FEET, { t, label: P.booth || 'AI provider', staff: 'robot', w: 230, h: 300, alarm: clamp((t - 1.7) / 0.3) });
    belt(ctx, H, 40, 1040, BY, t, SP);
    // envelopes riding the belt (left to right), all tagged
    for (let i = 0; i < 6; i++) {
      const x = 40 + ((t * SP + i * 170 + 60) % 1000);
      if (x > 430 && x < 560) continue; // the grabbed slot
      envelope(ctx, H, K, x, BY - 24, 0.8, { tag: 0.15 });
    }
    // hooded figure copying the envelope at the booth's door
    const fx = 560;
    const reach = 0.6 + 0.4 * Math.sin(Math.min(t, 1.2) * 3);
    const hd = hooded(ctx, H, K, fx, FEET + 10, 1.05, { t, reach: t < 1.2 ? reach : 0.2, flip: true });
    // the envelope in his hand at t=0, a copy peels off
    if (t < 0.9) {
      const k = clamp(t / 0.9);
      envelope(ctx, H, K, lerp(470, hd.hand[0], k), lerp(BY - 24, hd.hand[1] - 10, k), 0.8, { tag: 0.3, rot: -0.2 * k });
    }
    // bait key flies from the hand to the vault
    const VX = 800, VY = 780, VR = 98;
    const tFly = 0.7, tTurn = 1.35, tOpen = 1.55;
    const open = easeOutCubic(clamp((t - tOpen) / 0.6));
    vault(ctx, H, K, VX, VY, VR, open, t, P.vault || null);
    if (t >= tFly) {
      const k = easeInOutCubic(clamp((t - tFly) / 0.6));
      const kx = lerp(hd.hand[0] + 20, VX - 20, k), ky = lerp(hd.hand[1] - 30, VY, k) - Math.sin(k * Math.PI) * 120;
      const rot = t < tTurn ? lerp(-0.6, 0, k) : -1.2 * clamp((t - tTurn) / 0.25);
      if (open < 0.5) { drawKey(ctx, kx, ky, 1.8, rot, CANARY, CANARY_S); }
    }
    // the canary tag flares when the key is used
    const fire = clamp((t - tTurn) / 0.3);
    if (fire > 0) {
      const tx = VX + 70, ty = VY - 112;
      for (let i = 0; i < 3; i++) {
        const k = ((t - tTurn + i * 0.35) % 1.05) / 1.05;
        ctx.save(); ctx.strokeStyle = H.rgba(CANARY, (1 - k) * fire); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(tx, ty, 30 + 70 * k, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
      tag(ctx, H, K, tx, ty, 1.5 * K.popIn(t, tTurn, 0.4), 1);
      pill(P.used || 'Bait key used!', 610, 720, tTurn + 0.15, null, { size: 30, accent: true });
    }
    ctx.restore();
    // big counter on top (in motion from frame 0)
    const cN = +P.count || 1000000, cF = P.countFrom != null ? +P.countFrom : cN * 0.82;
    const v = Math.round(lerp(cF, cN, easeOutCubic(clamp(t / 1.4))) / 1000) * 1000;
    ctx.save();
    ctx.font = K.font.display(96); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(5,6,14,0.85)'; ctx.strokeText(v.toLocaleString('en-US'), 487, 560);
    ctx.fillStyle = ACC; ctx.fillText(v.toLocaleString('en-US'), 487, 560);
    ctx.restore();
    pill(P.counter || 'trackable secrets in AI prompts', 487, 630, 0.0, null, { size: 30 });
    return;
  }

  // ------------------------------------------------------------------ route
  if (mode === 'route') {
    const tType = at(P.typeCue, 0.3), tNot = at(P.notCue, D * 0.2), tRouter = at(P.routerCue, D * 0.45), tRes = at(P.resCue, D * 0.52);
    const tEvery = at(P.everyCue, D * 0.75);
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 487, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 750 }]);
    hall();
    const BX = [330, 545, 775];
    const rise = (a) => easeOutCubic(clamp((t - a) / 0.5));
    // straight path: phone -> AI, crossed out on notCue
    const straight = clamp((t - tType) / 0.8);
    const cross = clamp((t - tNot) / 0.3), straightGone = clamp((t - tRouter + 0.3) / 0.4);
    // booths (router + reseller rise from the floor)
    const rr = rise(tRouter), rs = rise(tRes);
    const read = (i) => clamp((t - tEvery - i * 0.35) / 0.4);
    if (rr > 0) { ctx.save(); ctx.translate(BX[0], FEET); ctx.scale(1, rr); ctx.translate(-BX[0], -FEET); booth(ctx, H, K, BX[0], FEET, { t, label: P.router || 'AI router', color: '#3f6e8f', read: read(0), w: 190, h: 260 }); ctx.restore(); }
    if (rs > 0) { ctx.save(); ctx.translate(BX[1], FEET); ctx.scale(1, rs); ctx.translate(-BX[1], -FEET); booth(ctx, H, K, BX[1], FEET, { t, label: P.reseller || 'Reseller', color: '#6b4f8f', read: read(1), w: 190, h: 260 }); ctx.restore(); }
    booth(ctx, H, K, BX[2], FEET, { t, label: P.provider || 'AI provider', staff: 'robot', read: read(2) * 0.85, w: 200, h: 280 });
    belt(ctx, H, 190, 1000, BY, t, 150);
    // phone
    K.drawPhone(ctx, 135, FEET, 0.78, { t, bubbles: 2, typing: t < tRouter, screen: 'chat' });
    pill(P.app || 'Your AI app', 205, 790, 0.1, null, { size: 24 });
    if (straight > 0 && straightGone < 1) {
      ctx.save(); ctx.globalAlpha = 1 - straightGone;
      ctx.strokeStyle = ACC; ctx.lineWidth = 6; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 40;
      const x1 = lerp(190, 690, easeInOutCubic(straight));
      ctx.beginPath(); ctx.moveTo(190, 700); ctx.lineTo(x1, 700); ctx.stroke(); ctx.setLineDash([]);
      if (straight >= 1) { ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(700, 700); ctx.lineTo(680, 688); ctx.lineTo(680, 712); ctx.closePath(); ctx.fill(); }
      ctx.font = K.font.ui(28); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.fillText(P.straight || 'Straight to the AI?', 440, 670);
      if (cross > 0) {
        ctx.strokeStyle = RED; ctx.lineWidth = 12; ctx.lineCap = 'round';
        const c = easeOutCubic(cross);
        ctx.beginPath(); ctx.moveTo(400, 650); ctx.lineTo(lerp(400, 480, c), lerp(650, 750, c)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(480, 650); ctx.lineTo(lerp(480, 400, c), lerp(650, 750, c)); ctx.stroke();
      }
      ctx.restore();
    }
    // envelopes start once the booths are up
    if (t > tRouter) {
      const SP = 120, gap = 215;
      for (let i = 0; i < 5; i++) {
        const x = 190 + ((t - tRouter) * SP + i * gap) % 860 - 40;
        if (x < 170 || x > 1000) continue;
        // opens while under a lit booth window
        let open = 0;
        BX.forEach((bx, j) => { const d = Math.abs(x - bx); if (d < 70) open = Math.max(open, read(j) * (1 - d / 70)); });
        envelope(ctx, H, K, x, BY - 24, 0.75, { tag: 0.2, open });
      }
    }
    ctx.restore();
    pill(P.head || 'Where your prompt can go', 487, 480, 0.1, tEvery - 0.1, { size: 30 });
    pill(P.every || 'Every hop can see the whole prompt', 487, 480, tEvery, null, { size: 30, accent: true });
    if (rr > 0) pill(P.hops || 'Middlemen you may never see', 487, 556, tRes + 0.4, null, { size: 26 });
    return;
  }

  // ------------------------------------------------------------------ breach
  if (mode === 'breach') {
    const tThree = at(P.threeCue, D * 0.2), tBreach = at(P.breachCue, D * 0.33), tAtt = at(P.attCue, D * 0.4);
    const tKeys = at(P.keysCue, D * 0.6), tNone = at(P.noneCue, D * 0.83);
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 487, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 750 }]);
    hall();
    const BX = [200, 487, 775];
    const q = clamp((t - tNone) / 0.4);
    BX.forEach((bx, i) => {
      const pop = K.popIn(t, 0.1 + i * 0.2, 0.45);
      if (pop <= 0) return;
      ctx.save(); ctx.translate(bx, FEET); ctx.scale(Math.min(1, pop), Math.min(1, pop)); ctx.translate(-bx, -FEET);
      booth(ctx, H, K, bx, FEET, { t, label: (P.label || 'AI provider'), staff: 'person', q, skin: [1, 3, 0][i], hair: [0, 2, 1][i], shirt: [2, 0, 3][i], hairStyle: ['short', 'long', 'curly'][i], seed: 4 + i, alarm: clamp((t - tBreach - i * 0.2) / 0.3), w: 196, h: 240 });
      ctx.restore();
    });
    belt(ctx, H, 40, 1040, BY, t, 140);
    // envelopes on the belt
    for (let i = 0; i < 6; i++) {
      const x = 40 + ((t * 140 + i * 175) % 1000);
      envelope(ctx, H, K, x, BY - 24, 0.7, { tag: 0.15 });
    }
    // hooded figures siphon copies into sacks
    const att = clamp((t - tAtt) / 0.5);
    if (att > 0) BX.forEach((bx, i) => {
      const fx = bx + 70;
      ctx.save(); ctx.globalAlpha = att;
      const hd = hooded(ctx, H, K, fx, FEET + 40, 0.72, { t: t + i, reach: 0.4 + 0.3 * Math.sin(t * 4 + i), flip: false });
      sack(ctx, H, fx - 52, FEET + 42, 0.7, clamp((t - tAtt) / 3));
      // copies flying from the belt up into the sack
      for (let j = 0; j < 2; j++) {
        const ph = ((t - tAtt) * 0.9 + j * 0.5 + i * 0.21) % 1;
        if (t - tAtt < 0.3 || t > tKeys) continue;
        const px = lerp(bx + 10, fx - 52, ph), py = lerp(BY - 30, FEET - 40, ph) - Math.sin(ph * Math.PI) * 90;
        envelope(ctx, H, K, px, py, 0.4, { rot: ph * 1.4 });
      }
      ctx.restore();
    });
    // keys fly from the figures up to empty vault doors
    BX.forEach((bx, i) => {
      const VX = bx, VY = 610, VR = 50;
      const tk = tKeys + i * 0.3;
      const open = easeOutCubic(clamp((t - tk - 0.7) / 0.5));
      const vis = clamp((t - tKeys + 0.6) / 0.4) * (1 - clamp((t - tNone + 0.2) / 0.35));
      if (vis <= 0) return;
      ctx.save(); ctx.globalAlpha = vis;
      vault(ctx, H, K, VX, VY, VR, open, t, null);
      if (t >= tk && open < 0.6) {
        const k = easeInOutCubic(clamp((t - tk) / 0.7));
        drawKey(ctx, lerp(bx + 110, VX - 6, k), lerp(FEET - 160, VY, k), 0.9, lerp(-0.8, 0, k), CANARY, CANARY_S);
      }
      if (open > 0.3) {
        // repeated tries: tag pings
        const k = ((t - tk) % 0.6) / 0.6;
        ctx.strokeStyle = H.rgba(CANARY, 1 - k); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(VX + 60, VY - 50, 18 + 30 * k, 0, Math.PI * 2); ctx.stroke();
        tag(ctx, H, K, VX + 60, VY - 50, 0.8, 1);
      }
      ctx.restore();
    });
    // booth staff "?" bubbles on noneCue
    if (q > 0) BX.forEach((bx, i) => {
      const p = K.popIn(t, tNone + i * 0.15, 0.4);
      if (p > 0) K.drawSpeechBubble(ctx, bx - 30, 690, 1, { text: '?', size: 46, tail: 'center', pop: p });
    });
    ctx.restore();
    pill(P.head || 'Evidence: AI providers breached', 487, 480, tThree, tKeys - 0.1, { size: 28 });
    if (t >= tBreach && t < tKeys) pill(P.stamp || 'Attackers siphoned prompts', 487, 556, tAtt, tKeys - 0.1, { size: 26, accent: true });
    pill(P.keys || 'Bait keys: used', 487, 480, tKeys, tNone - 0.1, { size: 28, accent: true });
    pill(P.none || 'None knew until told', 487, 480, tNone, null, { size: 30, accent: true });
    return;
  }

  // ------------------------------------------------------------------ reseller
  if (mode === 'reseller') {
    const tHack = at(P.hackCue, D * 0.12), tPrice = at(P.priceCue, D * 0.25), tLog = at(P.logCue, D * 0.4);
    const tCase = at(P.caseCue, D * 0.58), tOpen = at(P.openCue, D * 0.73), tDay = at(P.dayCue, D * 0.86);
    const tSw = tCase - 0.4;
    const phaseA = () => {
      ctx.save();
      K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 430, y: 760 }, { t: tSw + 0.4, zoom: 1.0, x: 487, y: 750 }]);
      hall();
      const bx = 400;
      const logOn = clamp((t - tLog) / 0.3);
      booth(ctx, H, K, bx, FEET, { t, label: P.booth || 'Reseller', color: '#6b4f8f', staff: 'person', skin: 2, hair: 4, shirt: 1, hairStyle: 'bun', seed: 8, w: 250, h: 330, read: logOn * 0.5 });
      // price tag swinging from the awning
      const pp = K.popIn(t, tPrice - 0.2, 0.5);
      if (pp > 0) {
        ctx.save(); ctx.translate(bx - 165, FEET - 330); ctx.scale(pp, pp); ctx.translate(-(bx - 165), -(FEET - 330));
        ctx.strokeStyle = '#c9d0e8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx - 125, FEET - 336); ctx.lineTo(bx - 165, FEET - 300); ctx.stroke();
        K.drawPriceTag(ctx, bx - 165, FEET - 150, 1.1, { text: P.price || 'LOW $', t, shadow: false });
        ctx.restore();
      }
      // logging switch on the right
      const sx = 760, sy = 740;
      if (t > tLog - 0.5) {
        const sp = K.popIn(t, tLog - 0.5, 0.4);
        ctx.save(); ctx.translate(sx, sy); ctx.scale(sp, sp);
        H.roundRect(ctx, -70, -40, 140, 80, 40); ctx.fillStyle = H.mixHex('#2b3150', ACC, logOn * 0.85); ctx.fill();
        ctx.lineWidth = 4; ctx.strokeStyle = '#c9d0e8'; ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(lerp(-30, 30, easeOutCubic(logOn)), 0, 30, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.font = K.font.ui(28); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(logOn > 0.5 ? (P.logOn || 'LOGGING: ON') : (P.logOff || 'LOGGING: OFF'), sx, sy - 70);
      }
      // log box
      const BOXX = 760, BOXY = FEET;
      if (t > tLog) {
        const n = Math.min(8, Math.floor((t - tLog) * 1.6));
        ctx.save();
        H.roundRect(ctx, BOXX - 90, BOXY - 120, 180, 120, 12); ctx.fillStyle = '#7a5a3e'; ctx.fill();
        ctx.fillStyle = '#f4efe2'; for (let i = 0; i < n; i++) ctx.fillRect(BOXX - 74 + i * 18, BOXY - 140 - (i % 3) * 6, 14, 30);
        H.roundRect(ctx, BOXX - 90, BOXY - 120, 180, 120, 12); ctx.fillStyle = '#7a5a3e'; ctx.fill();
        ctx.font = K.font.display(30); ctx.fillStyle = '#f4efe2'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.log || 'LOGS', BOXX, BOXY - 60);
        ctx.restore();
      }
      belt(ctx, H, 40, 660, BY, t, 140);
      for (let i = 0; i < 4; i++) {
        const x = 40 + ((t * 140 + i * 160) % 600);
        envelope(ctx, H, K, x, BY - 24, 0.72, { tag: 0.15 });
      }
      // copies peel off at the booth into the log box
      if (t > tLog) for (let j = 0; j < 3; j++) {
        const ph = ((t - tLog) * 0.8 + j / 3) % 1;
        const px = lerp(bx + 40, BOXX, ph), py = lerp(BY - 40, FEET - 150, ph) - Math.sin(ph * Math.PI) * 60;
        envelope(ctx, H, K, px, py, 0.45, { rot: ph, tag: 0.6 });
      }
      ctx.restore();
      pill(P.hack || 'No hack needed', 487, 480, tHack - 0.1, null, { size: 30, accent: true });
      pill(P.wait || 'Then they waited', 487, 556, at(P.waitCue, tLog + 0.7), null, { size: 26 });
    };
    const phaseB = () => {
      ctx.save();
      K.camera(ctx, t, [{ t: tSw, zoom: 1.05, x: 487, y: 780 }, { t: D, zoom: 1.0, x: 487, y: 760 }]);
      K.world.room(ctx, { t, time: 'night', window: true, lamp: true, picture: false, plant: true, floorY: 920 });
      const feet = 1045;
      K.drawDesk(ctx, 520, feet, 1.3);
      const top = feet - 110 * 1.3;
      K.drawPerson(ctx, 300, feet, 1.4, { t, pose: 'sit-laptop', typing: t < tOpen ? 0.8 : 0, mood: 'neutral', skin: 4, hair: 1, shirt: 4, hairStyle: 'short', seed: 12, look: 0.6 });
      K.drawLaptop(ctx, 560, top, 1.0, { t, screen: 'blank' });
      // link card floating over the laptop
      const lp = K.popIn(t, tSw + 0.5, 0.4);
      if (lp > 0) {
        ctx.save(); ctx.translate(600, 640); ctx.scale(lp, lp);
        H.roundRect(ctx, -230, -55, 460, 110, 18); ctx.fillStyle = '#f2f4fa'; ctx.fill();
        ctx.fillStyle = '#2a3270'; ctx.font = K.font.ui(30); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(P.link || 'secret-link-7f3a…', -150, 0);
        ctx.fillStyle = '#9aa3bd'; ctx.fillRect(-150, 22, 200, 6);
        ctx.restore();
        const lit = clamp((t - tOpen) / 0.3);
        tag(ctx, H, K, 420, 640, 1.3 * lp, lit);
        if (lit > 0) for (let i = 0; i < 2; i++) {
          const k = ((t - tOpen + i * 0.5) % 1) / 1;
          ctx.strokeStyle = H.rgba(CANARY, 1 - k); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(420, 640, 36 + 60 * k, 0, Math.PI * 2); ctx.stroke();
        }
      }
      // clicking cursor
      if (t > tOpen - 0.5 && t < tOpen + 0.6) {
        const k = easeOutCubic(clamp((t - tOpen + 0.5) / 0.5));
        const cx = lerp(760, 640, k), cy = lerp(780, 650, k);
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#1b1d2c'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy + 46); ctx.lineTo(cx + 12, cy + 34); ctx.lineTo(cx + 24, cy + 56); ctx.lineTo(cx + 32, cy + 52); ctx.lineTo(cx + 20, cy + 30); ctx.lineTo(cx + 36, cy + 30); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      // clock
      if (t > tDay - 0.3) {
        const cp = K.popIn(t, tDay - 0.3, 0.4);
        ctx.save(); ctx.translate(800, 860); ctx.scale(cp, cp); ctx.translate(-800, -860);
        K.drawClock(ctx, 800, 860, 0.9, { t, speed: 8 });
        ctx.restore();
      }
      ctx.restore();
      pill(P.home || 'In one case: CONNECTION', 487, 480, tSw + 0.3, null, { size: 28 });
      pill(P.later || 'TIME later', 487, 556, tDay - 0.2, null, { size: 28, accent: true });
    };
    if (t < tSw) phaseA();
    else { const k = clamp((t - tSw) / 0.45); if (k < 1) phaseA(); ctx.save(); ctx.globalAlpha = k; phaseB(); ctx.restore(); }
    return;
  }

  // ------------------------------------------------------------------ privacy
  if (mode === 'privacy') {
    const tSet = at(P.setCue, D * 0.06), tNot = at(P.notCue, D * 0.23), tOne = at(P.oneCue, D * 0.36);
    const tMonths = at(P.monthsCue, D * 0.56), tNamed = at(P.namedCue, D * 0.68), tInv = at(P.invCue, D * 0.9);
    const tB = tOne - 0.3, tC = at(P.cCue, D * 0.67) - 0.3;
    const phaseA = () => {
      ctx.save();
      K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 487, y: 760 }, { t: tB, zoom: 1.0, x: 487, y: 750 }]);
      hall();
      const bx = 660;
      booth(ctx, H, K, bx, FEET, { t, label: P.booth || 'AI provider', staff: 'robot', w: 240, h: 300 });
      belt(ctx, H, 40, 1040, BY, t, 0);
      // a flagged envelope slides in
      const k = easeInOutCubic(clamp((t - 0.0) / 1.4));
      const ex = lerp(330, bx - 150, k);
      envelope(ctx, H, K, ex, BY - 34, 1.05, { tag: 0.2 });
      pill(P.flag || 'Flag: no data kept', 487, 640, Math.max(0, tSet - 0.3), null, { size: 26 });
      // a copy is filed anyway, out the back into a cabinet
      const cab = 205;
      ctx.save(); H.roundRect(ctx, cab - 90, FEET - 230, 180, 230, 10); ctx.fillStyle = '#56607f'; ctx.fill();
      for (let i = 0; i < 3; i++) { H.roundRect(ctx, cab - 76, FEET - 214 + i * 72, 152, 60, 8); ctx.fillStyle = '#6d789c'; ctx.fill(); ctx.fillStyle = '#c9d0e8'; ctx.fillRect(cab - 20, FEET - 190 + i * 72, 40, 8); }
      ctx.restore();
      if (t > tNot - 0.6) {
        const c = easeInOutCubic(clamp((t - tNot + 0.6) / 1.0));
        if (c < 1) envelope(ctx, H, K, lerp(bx, cab, c), lerp(820, FEET - 200, c) - Math.sin(c * Math.PI) * 140, 0.7, { tag: 0.5, rot: -c * 0.5 });
        else {
          // drawer pops open with the copy inside
          H.roundRect(ctx, cab - 84, FEET - 222, 168, 66, 8); ctx.fillStyle = '#8590b4'; ctx.fill();
          envelope(ctx, H, K, cab, FEET - 222, 0.62, { tag: 0.8 });
        }
      }
      ctx.restore();
      pill(P.head || 'Privacy settings', 487, 480, 0.05, null, { size: 30 });
      pill(P.not || 'Some appeared not to honor them', 487, 556, tNot, null, { size: 28, accent: true });
    };
    const phaseB = () => {
      ctx.save();
      K.camera(ctx, t, [{ t: tB, zoom: 1.04, x: 487, y: 760 }, { t: tC, zoom: 1.0, x: 487, y: 750 }]);
      hall();
      // a door labelled "secret link"
      const DX = 700;
      H.roundRect(ctx, DX - 95, FEET - 330, 190, 330, 12); ctx.fillStyle = '#3b4470'; ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = '#8f98c8'; ctx.stroke();
      ctx.fillStyle = '#c9d0e8'; ctx.beginPath(); ctx.arc(DX + 60, FEET - 160, 9, 0, Math.PI * 2); ctx.fill();
      ctx.font = K.font.ui(26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(P.door || 'Secret link', DX, FEET - 290);
      tag(ctx, H, K, DX, FEET - 220, 1.0, 0.3);
      // crawler bot walks up again and again
      const per = 1.7, loc = (t - tB) % per, ph = loc / per;
      const bxp = ph < 0.6 ? lerp(160, DX - 150, easeInOutCubic(ph / 0.6)) : DX - 150;
      const knock = ph >= 0.6 ? clamp((ph - 0.6) / 0.4) : 0;
      K.drawRobot(ctx, bxp, FEET, 1.0, { t, state: knock > 0 ? 'working' : 'idle', seed: 21, flip: false });
      if (knock > 0) {
        const k = knock;
        ctx.strokeStyle = H.rgba(CANARY, 1 - k); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(DX, FEET - 220, 30 + 60 * k, 0, Math.PI * 2); ctx.stroke();
        tag(ctx, H, K, DX, FEET - 220, 1.0, 1 - k * 0.5);
      }
      // day counter
      const dk = clamp((t - tB - 0.3) / Math.max(1, tMonths - tB + 0.1)); const dN = +P.days || 30; const days = dk >= 1 ? dN + '+' : String(Math.max(1, Math.round(lerp(1, dN, dk))));
      ctx.save(); ctx.translate(250, 760);
      H.roundRect(ctx, -110, -90, 220, 190, 18); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      ctx.save(); H.roundRect(ctx, -110, -90, 220, 190, 18); ctx.clip(); ctx.fillStyle = RED; ctx.fillRect(-110, -90, 220, 50); ctx.restore();
      ctx.fillStyle = '#ffffff'; ctx.font = K.font.ui(26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('DAY', 0, -65);
      ctx.fillStyle = '#1b1d2c'; ctx.font = K.font.display(80); ctx.fillText(days, 0, 30);
      ctx.restore();
      ctx.restore();
      pill(P.visit || 'One kept coming back', 487, 480, tB + 0.3, null, { size: 28 });
      pill(P.months || 'TIME later', 487, 556, tMonths - 0.1, null, { size: 28, accent: true });
    };
    const phaseC = () => {
      ctx.save();
      K.camera(ctx, t, [{ t: tC, zoom: 1.03, x: 487, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 750 }]);
      hall();
      const BX = [200, 487, 775];
      BX.forEach((bx, i) => {
        booth(ctx, H, K, bx, FEET, { t, label: P.label || 'AI provider', staff: 'robot', seed: 30 + i, redact: clamp((t - tNamed + 0.2 - i * 0.15) / 0.4), w: 196, h: 270 });
      });
      belt(ctx, H, 40, 1040, BY, t, 60);
      // magnifiers on invCue
      BX.forEach((bx, i) => {
        const p = K.popIn(t, tInv - 0.5 + i * 0.15, 0.4);
        if (p <= 0) return;
        const mx = bx + 30 + Math.sin(t * 2 + i) * 14, my = 680 + Math.cos(t * 2 + i) * 8;
        ctx.save(); ctx.translate(mx, my); ctx.scale(p, p);
        ctx.strokeStyle = '#e8ecf8'; ctx.lineWidth = 9; ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(160,200,255,0.25)'; ctx.fill();
        ctx.lineWidth = 13; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(24, 24); ctx.lineTo(56, 56); ctx.stroke();
        ctx.restore();
      });
      ctx.restore();
      pill(P.named || 'Breached providers: not named', 487, 480, tNamed - 0.3, null, { size: 28 });
      pill(P.inv || 'Investigating', 487, 556, tInv - 0.4, null, { size: 28, accent: true });
    };
    const blend = (a, b, tb) => { const k = clamp((t - tb) / 0.45); if (k < 1) a(); ctx.save(); ctx.globalAlpha = k; b(); ctx.restore(); };
    if (t < tB) phaseA();
    else if (t < tC) blend(phaseA, phaseB, tB);
    else blend(phaseB, phaseC, tC);
  }
}
