// Scene "two-sides" (full frame). Dusk plaza: the open toolbox of code chips in the middle. A defender (cartoon
// person) catches a chip and raises a shield that gets a check mark; on the cue a shadowy hooded figure on the other
// side catches one too (same tool, both sides); then a big question pops and the lids hesitate, settling half-open.
// Fits: dual-use debates ("helps defenders and attackers alike"), "should it stay open?" endings.
// params (all optional): left (default "Defenders"), right (default "Attackers"), question (default "OPEN OR CLOSED?"),
//                        title (name on the box, default none),
//                        leftCue / fixCue / cue / qCue  narration words: left label / shield check / right figure /
//                               question (else 1 s / 25% / 55% / 70% of the scene)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = info.helpers.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tL = at(P.leftCue, 1.0), tFix = at(P.fixCue, D * 0.25), tR = at(P.cue, D * 0.55) - 0.4;
  const tQ = at(P.qCue, D * 0.7);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tQ, zoom: 1.03, x: 487, y: 740 }, { t: D, zoom: 1.06, x: 487, y: 740 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 960 });

  const bx = 487, by = 1030, bs = 1.2;
  // lids: open; after the question they hesitate (close, open, close...) and settle half-open
  let open = 1;
  if (t > tQ) { const u = t - tQ; open = 0.5 + 0.5 * Math.cos(u * 3.2) * Math.exp(-u * 0.55); }
  toolbox(ctx, H, K, bx, by, bs, { open, t, title: P.title || '', acc: ACC, chips: 3 });

  // defender (left) + shield
  const lx = 170, rx = 815, fy = 1045;
  const dIn = clamp((t + 0.6) / 1.2);
  const fixed = t > tFix;
  K.drawPerson(ctx, lerp(-100, lx, easeOutCubic(dIn)), fy, 1.3, { t, walk: dIn < 1 ? t + 0.6 : null, pose: fixed && t < tR ? 'cheer' : 'stand', mood: 'happy', skin: 1, hair: 4, shirt: 1, hairStyle: 'bun', seed: 3, look: 0.6 });
  if (fixed) K.drawShield(ctx, lx + 95, fy - 30, 0.85 * K.popIn(t, tFix, 0.4), { check: K.phase(t, tFix + 0.3, tFix + 0.8), shadow: false });
  // hooded figure (right)
  const rIn = clamp((t - tR + 1.2) / 1.2);
  if (rIn > 0) hooded(ctx, H, K, lerp(1180, rx, easeOutCubic(rIn)), fy, 1.3, { t, walk: rIn < 1, acc: ACC, flip: true });

  // chips flying to each side
  const fly = (t0, tx, ty, i) => {
    if (t < t0) return;
    const u = clamp((t - t0) / 0.7), e = easeOutCubic(u);
    const x = lerp(bx, tx, e), y = lerp(by - 230, ty, e) - Math.sin(u * Math.PI) * 170;
    chip(ctx, H, x, y + (u >= 1 ? K.bob(t, 5, 0.8, i) : 0), 0.95, ACC);
  };
  fly(tL, lx, fy - 360, 0);
  fly(tR + 0.4, rx, fy - 380, 1);

  // pills
  const lp = K.popIn(t, tL, 0.4); if (lp > 0) K.drawLabel(ctx, 230, 620, lp, { text: P.left || 'Defenders', size: 30, dot: true });
  const rp = K.popIn(t, tR + 0.4, 0.4); if (rp > 0) K.drawLabel(ctx, 745, 620, rp, { text: P.right || 'Attackers', size: 30, dot: true });
  // question
  const qp = K.popIn(t, tQ, 0.5);
  if (qp > 0) {
    const q = String(P.question || 'OPEN OR CLOSED?');
    ctx.save(); ctx.translate(487, 535); ctx.scale(qp, qp); ctx.rotate(Math.sin(t * 2) * 0.012);
    const ft = H.fitText(ctx, q, 'display', 84, 44, 780);
    ctx.font = ft.font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(6,7,14,0.9)'; ctx.strokeText(q, 0, 0); ctx.fillStyle = ACC; ctx.fillText(q, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

// --- toolbox (bottom-centre anchored, ~300x150 at scale 1, cantilever lids open to both sides) ---------------
function toolbox(ctx, H, K, x, y, s, o) {
  const open = o.open || 0, t = o.t || 0, acc = o.acc;
  const base = '#d65a4a', shade = H.mixHex(base, '#000000', 0.25), light = H.mixHex(base, '#ffffff', 0.18);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.shadow(ctx, 0, 0, 380, 0.45);
  // interior + glow + chips
  if (open > 0.02) {
    K.glow(ctx, 0, -170, 200, acc, 0.45 * Math.min(1, open));
    H.roundRect(ctx, -140, -164, 280, 26, 10); ctx.fillStyle = '#141626'; ctx.fill();
    const n = o.chips == null ? 3 : o.chips;
    for (let i = 0; i < n; i++) {
      const cx = (i - (n - 1) / 2) * 82, rise = Math.min(1, open) * (34 + 10 * Math.sin(t * 1.6 + i * 1.9));
      chip(ctx, H, cx, -150 - rise, 0.8, acc);
    }
  }
  if (o.inner) { ctx.save(); ctx.beginPath(); ctx.rect(-400, -900, 800, 750); ctx.clip(); o.inner(); ctx.restore(); }
  // body
  H.roundRect(ctx, -150, -150, 300, 150, 16); ctx.fillStyle = base; ctx.fill();
  ctx.save(); H.roundRect(ctx, -150, -150, 300, 150, 16); ctx.clip(); ctx.fillStyle = shade; ctx.fillRect(70, -152, 90, 160); ctx.restore();
  H.roundRect(ctx, -150, -150, 300, 14, 7); ctx.fillStyle = light; ctx.fill();
  H.roundRect(ctx, -150, -20, 300, 20, 10); ctx.fillStyle = shade; ctx.fill();
  // name plate
  H.roundRect(ctx, -112, -118, 224, 64, 12); ctx.fillStyle = 'rgba(12,14,26,0.78)'; ctx.fill();
  const title = String(o.title || '');
  const ft = H.fitText(ctx, title, 'display', 40, 18, 196); ctx.font = ft.font;
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(title, 0, -85);
  // latches
  for (const lx of [-128, 128]) { H.roundRect(ctx, lx - 10, -156, 20, 28, 5); ctx.fillStyle = '#c9cfdf'; ctx.fill(); }
  // lids (two halves, hinged at the outer top corners)
  const ang = Math.min(1.15, open) * 1.85;
  for (const side of [-1, 1]) {
    ctx.save(); ctx.translate(side * 150, -150); ctx.rotate(side * ang);
    // lid half lies from the hinge towards the centre: local x from 0 to -side*154
    const x0 = side < 0 ? 0 : -154;
    H.roundRect(ctx, x0 - 2, -28, 156, 30, 10); ctx.fillStyle = side < 0 ? light : base; ctx.fill();
    H.roundRect(ctx, x0 - 2, -6, 156, 8, 4); ctx.fillStyle = shade; ctx.fill();
    ctx.restore();
  }
  // handle (only when closed)
  const hA = 1 - Math.min(1, open * 4);
  if (hA > 0) {
    ctx.save(); ctx.globalAlpha = hA; ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-60, -178); ctx.quadraticCurveTo(-60, -218, 0, -218); ctx.quadraticCurveTo(60, -218, 60, -178); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
// glowing code chip ("</>"), centre anchored, ~74x50 at scale 1
function chip(ctx, H, x, y, s, acc) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  H.glow(ctx, 0, 0, 60, acc, 0.35);
  H.roundRect(ctx, -37, -25, 74, 50, 12); ctx.fillStyle = '#161927'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = acc; ctx.stroke();
  ctx.font = H.font('bold', 26); ctx.fillStyle = acc; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('</>', 0, 1);
  ctx.restore();
}
// shadowy hooded cartoon figure (generic; no face, two glowing eyes), bottom-centre anchored, ~120x250 at scale 1
function hooded(ctx, H, K, x, y, s, o = {}) {
  const t = o.t || 0, walk = !!o.walk;
  const ph = t * 1.8 * Math.PI * 2, bob = walk ? -Math.abs(Math.sin(ph)) * 5 : Math.sin(t * 1.5) * 1.5;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  K.shadow(ctx, 0, 0, 110);
  const cloak = '#343a5a', cloakS = '#252a44';
  for (const side of [-1, 1]) {
    const a = walk ? Math.sin(ph + (side > 0 ? Math.PI : 0)) * 0.35 : 0;
    ctx.save(); ctx.translate(side * 14, -70 + bob); ctx.rotate(a);
    H.roundRect(ctx, -9, 0, 18, 66, 8); ctx.fillStyle = '#14162a'; ctx.fill();
    H.roundRect(ctx, -12, 58, 30, 14, 7); ctx.fillStyle = '#0c0d18'; ctx.fill();
    ctx.restore();
  }
  ctx.translate(0, bob);
  // cloak body
  ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -62); ctx.lineTo(54, -62); ctx.quadraticCurveTo(58, -110, 34, -178); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = cloakS; ctx.fillRect(18, -190, 60, 140); ctx.restore();
  // arm holding a glowing tablet
  ctx.strokeStyle = cloak; ctx.lineWidth = 17; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(26, -160); ctx.lineTo(48, -122); ctx.lineTo(62, -132); ctx.stroke();
  ctx.save(); ctx.translate(70, -138); ctx.rotate(-0.25);
  H.roundRect(ctx, -16, -22, 32, 44, 5); ctx.fillStyle = '#0c0d18'; ctx.fill();
  H.roundRect(ctx, -12, -18, 24, 36, 3); ctx.fillStyle = o.acc || '#ffe14a'; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
  ctx.restore();
  // rim light on the cloak edge
  ctx.save(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -62); ctx.stroke(); ctx.restore();
  // hood
  ctx.beginPath(); ctx.moveTo(0, -262); ctx.quadraticCurveTo(46, -250, 44, -200); ctx.quadraticCurveTo(42, -170, 0, -168); ctx.quadraticCurveTo(-42, -170, -44, -200); ctx.quadraticCurveTo(-46, -244, 0, -262); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(4, -204, 26, 25, 0, 0, Math.PI * 2); ctx.fillStyle = '#07080f'; ctx.fill();
  const blink = ((t + 0.7) % 3.1) < 0.12;
  for (const ex of [-6, 14]) { ctx.beginPath(); ctx.ellipse(ex, -206, 5, blink ? 1 : 4, 0, 0, Math.PI * 2); ctx.fillStyle = '#9fe6ff'; ctx.fill(); }
  ctx.restore();
}
