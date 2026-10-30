// Scene "price-house" (full frame). A suburban house at dusk with a home-security setup: a glowing keypad by the door,
// a wall camera with a blinking LED and a generic shield yard sign (no logos). A giant price tag drops onto the roof.
// modes:
//   hook   (cold open, ~3-4 s): the tag is already falling at frame 0, slams onto the roof at ~0.45 s (squash, dust,
//          house shake); the homeowner in the yard looks up shocked; a buyer pill (`buyer`) pops, then the company
//          name pill (`company`) by the door on companyCue.
//   price  (~10-12 s): wider; house on the left with the tag on the roof; a stack of figure pills on the right lands
//          on cue (rows [{value, label, cue}], <= 4); the value counts up keeping its format ("$7.6B", "45.6%").
// params: mode, tag ("$10.00"), tagSub ("per share"), buyer ("Buyer"), company ("Company"), companyCue,
//         rows [{value, label, cue, accent}], head (title pill over the stack, optional)
// Fits: acquisitions / buyouts of a consumer company ("X is buying Y"), price per share + deal-size beats.
// Cues are narration words ("word#n" = the (n+1)th time spoken in the scene) or seconds; else fractions of the scene.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const TAU = Math.PI * 2;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const mode = P.mode || 'hook';
  const hook = mode === 'hook';
  const GY = 1010;

  // ---------- setting: dusk street ----------
  ctx.save();
  if (hook) K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 735 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 480, y: 720 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  const g = ctx.createLinearGradient(0, 0, 0, 980);
  g.addColorStop(0, '#1d2050'); g.addColorStop(0.55, '#4b3f78'); g.addColorStop(1, '#c97a6a');
  ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, 1200);
  for (let i = 0; i < 26; i++) {
    const sx = H.hash(i, 3) * 1080, sy = 120 + H.hash(i, 4) * 420, tw = 0.5 + 0.5 * Math.sin(t * 2 + i);
    ctx.globalAlpha = 0.25 + 0.4 * tw; ctx.beginPath(); ctx.arc(sx, sy, 1.4 + H.hash(i, 5) * 1.4, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();
  }
  ctx.globalAlpha = 1;
  // neighbour roofs far away
  ctx.fillStyle = '#2b2a55';
  for (let i = 0; i < 9; i++) {
    const x = -60 + i * 140 + H.hash(i, 7) * 40, w = 110 + H.hash(i, 8) * 40, y = 880;
    ctx.fillRect(x, y - 50, w, 70); ctx.beginPath(); ctx.moveTo(x - 10, y - 50); ctx.lineTo(x + w / 2, y - 92); ctx.lineTo(x + w + 10, y - 50); ctx.fill();
    if (H.hash(i, 9) > 0.4) { ctx.fillStyle = '#ffd98a'; ctx.globalAlpha = 0.7; ctx.fillRect(x + 20, y - 30, 18, 16); ctx.globalAlpha = 1; ctx.fillStyle = '#2b2a55'; }
  }
  const lawn = ctx.createLinearGradient(0, 900, 0, GY); lawn.addColorStop(0, '#2f4f58'); lawn.addColorStop(1, '#3d6a5c');
  ctx.fillStyle = lawn; ctx.fillRect(-200, 900, 1480, GY - 900 + 4);
  ctx.fillStyle = '#4a4f72'; ctx.fillRect(-200, GY, 1480, 16);
  ctx.fillStyle = '#2c3150'; ctx.fillRect(-200, GY + 16, 1480, 60);
  const g2 = ctx.createLinearGradient(0, GY + 76, 0, 1920); g2.addColorStop(0, '#191c33'); g2.addColorStop(1, '#0b0d18');
  ctx.fillStyle = g2; ctx.fillRect(-200, GY + 76, 1480, 1000);

  // ---------- the house ----------
  const rr = (x, y, w, h, r, c) => { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); };
  const land = 0.35;                                    // hook: the tag lands
  const shakeK = hook ? Math.max(0, 1 - Math.abs(t - land - 0.12) / 0.3) : 0;
  const HX = hook ? 487 : 300, HS = hook ? 1.75 : 1.35;
  const house = (x, y, s) => {
    ctx.save(); ctx.translate(x + Math.sin(t * 70) * 5 * shakeK, y); ctx.scale(s, s * (1 - 0.03 * shakeK));
    K.shadow(ctx, 0, 0, 290, 0.35);
    rr(-125, -128, 250, 128, 6, '#d9c7a6');
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(65, -128, 60, 128);
    ctx.beginPath(); ctx.moveTo(-145, -124); ctx.lineTo(0, -196); ctx.lineTo(145, -124); ctx.closePath(); ctx.fillStyle = '#6b4a3f'; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-145, -130, 290, 8);
    // windows
    for (const wx of [-102, -44]) {
      rr(wx, -100, 48, 44, 4, '#ffe2a8');
      ctx.strokeStyle = '#4a3a33'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(wx + 24, -100); ctx.lineTo(wx + 24, -56); ctx.moveTo(wx, -78); ctx.lineTo(wx + 48, -78); ctx.stroke();
    }
    // door
    rr(30, -88, 46, 88, 4, '#8a5a3c');
    ctx.beginPath(); ctx.arc(68, -44, 3.5, 0, TAU); ctx.fillStyle = '#e8c86b'; ctx.fill();
    rr(22, -6, 62, 8, 3, '#9a9184');
    // security keypad by the door (glows in the accent)
    rr(86, -70, 22, 30, 4, '#22263a');
    rr(89, -66, 16, 8, 2, ACC);
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) rr(90 + a * 8, -55 + b * 7, 5, 4, 1, '#8a90a8');
    K.glow(ctx, 97, -60, 30, ACC, 0.35 + 0.2 * Math.sin(t * 3));
    // wall camera under the eave (right corner), blinking LED
    ctx.save(); ctx.translate(112, -118); ctx.rotate(0.35 + 0.12 * Math.sin(t * 0.8));
    rr(-4, -4, 8, 14, 2, '#cfd4e4'); rr(-6, 8, 30, 16, 6, '#eef0f8'); rr(18, 10, 8, 12, 3, '#22263a');
    ctx.beginPath(); ctx.arc(2, 16, 3, 0, TAU); ctx.fillStyle = Math.sin(t * 5) > 0 ? '#ff5a4e' : '#5a2a2a'; ctx.fill();
    ctx.restore();
    // shrubs
    for (const [bx, br] of [[-122, 22], [-100, 16], [116, 18]]) { ctx.beginPath(); ctx.arc(bx, -10, br, 0, TAU); ctx.fillStyle = '#3d7a55'; ctx.fill(); }
    ctx.restore();
  };
  house(HX, GY, HS);
  // generic yard sign: a shield on a post (no text, no logo)
  const SXp = HX - 150 * HS, SYp = GY + 4;
  ctx.save(); ctx.translate(SXp, SYp); ctx.scale(HS * 0.75, HS * 0.75);
  rr(-3, -70, 6, 70, 2, '#9aa1b8');
  ctx.beginPath(); ctx.moveTo(-26, -112); ctx.lineTo(26, -112); ctx.lineTo(26, -86); ctx.quadraticCurveTo(26, -64, 0, -54); ctx.quadraticCurveTo(-26, -64, -26, -86); ctx.closePath();
  ctx.fillStyle = '#3f5bd0'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#eef0f8'; ctx.stroke();
  ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, -86); ctx.lineTo(-2, -77); ctx.lineTo(12, -96); ctx.stroke();
  ctx.restore();

  // ---------- the giant price tag on the roof ----------
  const roofY = GY - 196 * HS;
  const TS = hook ? 2.0 : 1.6;
  let ty = roofY + 26, squash = 1;
  if (hook) {
    if (t < land) { const u = t / land; ty = lerp(roofY - 260, roofY + 26, u * u); }
    else { const k = t - land; ty = roofY + 26 - Math.abs(Math.sin(k * 9)) * 40 * Math.exp(-k * 5); squash = 1 - 0.12 * Math.exp(-k * 9); }
  }
  const tagTxt = String(P.tag || '$10.00');
  ctx.save(); ctx.translate(HX, ty); ctx.scale(1 / squash, squash); ctx.translate(-HX, -ty);
  K.drawPriceTag(ctx, HX, ty, TS, { t: hook ? Math.max(0, t - land) : t, text: tagTxt, size: 34, shadow: false });
  ctx.restore();
  // "per share" ribbon under the tag
  if (P.tagSub !== '') {
    const sp = hook ? K.popIn(t, land + 0.15, 0.35) : 1;
    if (sp > 0) K.drawLabel(ctx, HX + 20, ty - 4 * TS, sp, { text: P.tagSub || 'per share', size: 26 });
  }
  // dust puffs when it lands
  if (hook && t > land) {
    const k = clamp((t - land) / 0.8);
    for (let i = 0; i < 8; i++) {
      const dir = i < 4 ? -1 : 1, j = i % 4;
      const x = HX + dir * (60 + j * 34 + k * 140), y = roofY + 30 + j * 14 - k * 30 * (1 - j / 4);
      ctx.globalAlpha = 0.5 * (1 - k); ctx.beginPath(); ctx.arc(x, y, 14 + k * 26, 0, TAU); ctx.fillStyle = '#e8dccb'; ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if (hook) {
    // homeowner in the yard, startled then looking up
    const shocked = t > land;
    K.drawPerson(ctx, 120, GY + 40, 1.45, { t, pose: shocked ? 'shrug' : 'stand', mood: shocked ? 'shocked' : 'neutral', look: 0.6, skin: 2, hair: 1, hairStyle: 'curly', shirt: 2, seed: 4 });
    const bp = K.popIn(t, at(P.buyerCue, 1.0), 0.4);
    if (bp > 0) K.drawLabel(ctx, 300, 520, bp, { text: P.buyer || 'Buyer', size: 30, dot: true });
    const cp = K.popIn(t, at(P.companyCue, D * 0.7) - 0.15, 0.4);
    if (cp > 0) K.drawLabel(ctx, 760, 830, cp, { text: P.company || 'Company', size: 34, accent: true });
  } else {
    // a neighbour walks along the sidewalk for life (behind the figure stack)
    { const wx = lerp(-80, 1160, clamp(t / Math.max(8, D)));
      K.drawPerson(ctx, wx, GY + 40, 1.0, { t, walk: t, skin: 0, shirt: 3, hair: 2, hairStyle: 'long', seed: 9 }); }
    // ---------- figure stack (right) ----------
    const rows = (P.rows || [{ value: '$10.00', label: 'per share' }]).slice(0, 4);
    if (P.head) { const hp = K.popIn(t, 0.1, 0.4); if (hp > 0) K.drawLabel(ctx, 700, 470, hp, { text: P.head, size: 26, dot: true }); }
    const X0 = 520, X1 = 905, RH = 118, Y0 = 500;
    rows.forEach((r, i) => {
      const t0 = at(r.cue, D * (0.08 + i * 0.22)) - 0.15;
      const p = K.popIn(t, t0, 0.45);
      if (p <= 0) return;
      const y = Y0 + i * (RH + 14);
      ctx.save(); ctx.translate(X1 + 40 * (1 - Math.min(1, p)), 0); ctx.globalAlpha = clamp(p * 1.5); ctx.translate(-X1, 0);
      roundRect(ctx, X0, y, X1 - X0, RH, 22); ctx.fillStyle = r.accent ? ACC : 'rgba(12,14,26,0.9)'; ctx.fill();
      if (!r.accent) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke(); }
      // value counting up, keeping its format
      const txt = String(r.value);
      const m = txt.match(/^([^0-9]*?)(\d+)(\.\d+)?(.*)$/);
      const k = K.phase(t, t0, t0 + 0.9, H.easeOutCubic);
      let shown = txt;
      void m; void k; // figures appear whole (no count-up), so no wrong number is ever on screen
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      const ft = H.fitText(ctx, txt, 'display', 56, 34, X1 - X0 - 48);
      ctx.font = ft.font; ctx.fillStyle = r.accent ? '#1b1a10' : ACC; ctx.fillText(shown, X0 + 24, y + 62);
      const lt = H.fitText(ctx, String(r.label || ''), 'ui', 28, 20, X1 - X0 - 48);
      ctx.font = lt.font; ctx.fillStyle = r.accent ? '#1b1a10' : '#ffffff'; ctx.fillText(String(r.label || ''), X0 + 24, y + 100);
      ctx.restore();
    });
  }
  ctx.restore();
}
