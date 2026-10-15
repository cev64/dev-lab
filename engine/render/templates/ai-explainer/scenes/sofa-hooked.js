// Scene "sofa-hooked" (full frame, span of 2 beats). Living room at night: a generic cartoon kid on the sofa with a
// glowing phone.
// Beat 1 ("design"): a shield + "Sold as safe" pill floats up on the safe cue; on the agree cue little "YES" bubbles
//   and thumbs pop out of the phone ("Overly agreeable" pill); on the time cue a wall clock races and the window sky
//   turns while the kid keeps scrolling ("Engaged as long as possible").
// Beat 2 ("alleged harms"): the shield greys out with a "?", a header pill ("According to the complaints") and up to
//   four warning chips pop in a 2x2 grid on their cues; a worried parent walks in on the right; a dotted line between
//   parent and kid snaps on the parent cue while the kid turns back to the phone.
// Fits: product-safety allegations about kids and apps/chatbots; engagement-by-design stories.
// params: sold ("Sold as safe"), agree ("Overly agreeable"), engaged ("Engaged as long as possible"),
//         head ("According to the complaints"), yes ("YES!" bubbles), chips [4 strings], chipCues [4 words],
//         safeCue ("safe"), agreeCue ("agreeable"), timeCue ("engaged"), headCue ("complaints"),
//         parentCue ("sometimes"), snapCue ("away")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, rgba } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const B2 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.5;
  const tSafe = at(P.safeCue || 'safe', B2 * 0.35) - 0.2;
  const tAgree = at(P.agreeCue || 'agreeable', B2 * 0.6) - 0.25;
  const tTime = at(P.timeCue || 'engaged', B2 * 0.78) - 0.2;
  const tHead = at(P.headCue || 'complaints', B2 + 0.6) - 0.3;
  const chips = (P.chips || ['Dangerous medical advice', 'Fed paranoia', 'Encouraged self-harm', { text: 'Discouraged telling parents', tag: 'Arizona alleges' }]).slice(0, 4);
  const chipCues = P.chipCues || ['medical', 'paranoia', 'selfharm', 'nudged'];
  const tChip = chips.map((c, i) => at(chipCues[i], B2 + 1.5 + i * 2) - 0.25);
  const tParent = at(P.parentCue || 'sometimes', D - 3.5) - 0.6;
  const tSnap = at(P.snapCue || 'away', D - 2.2) - 0.1;

  // camera: slow push on the kid in beat 1, ease back out for the chips in beat 2
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: B2 - 0.4, zoom: 1.04, x: 480, y: 740 }, { t: B2 + 0.4, zoom: 1.0 }, { t: D, zoom: 1.02, x: 500, y: 730 }]);
  // sky in the window turns faster once "engaged" is said (time passing)
  const room = K.world.livingRoomNight(ctx, { t: t + 6 * H.phase(t, tTime, B2) });
  const S = 1.5, kx = 430, feet = room.sofa.feetY;
  const phone = { x: kx + 8 * S, y: feet - 132 * S };

  // wall clock (races on the time cue)
  const ck = K.popIn(t, tTime - 0.3, 0.4);
  const clockFade = 1 - smooth((t - B2 + 0.3) / 0.4);
  if (ck > 0 && clockFade > 0) {
    const fast = H.phase(t, tTime, tTime + 0.6) * (1 - H.phase(t, B2 - 0.6, B2));
    const hr = 9 + 3 * H.phase(t, tTime, B2 - 0.3) * 3; // jumps through hours
    ctx.save(); ctx.globalAlpha = clockFade; ctx.translate(905, 780); ctx.scale(Math.min(1.05, ck), Math.min(1.05, ck)); ctx.translate(-905, -780);
    K.drawClock(ctx, 905, 815, 1.1, { t: 0, hour: hr + fast * 0.0, speed: 0, shadow: false });
    ctx.restore();
  }

  // phone glow + kid (generic cartoon: smaller scale, curly hair, bright shirt)
  K.glow(ctx, phone.x, phone.y - 20, 150, ACC, 0.22 + 0.08 * Math.sin(t * 3));
  const turnedAway = t > tSnap;
  const kidMood = t < tHead ? 'happy' : t < tSnap ? 'neutral' : 'worried';
  K.drawPerson(ctx, kx, feet, S, { pose: 'sit-phone', seat: false, t, typing: 1.2, mood: kidMood, skin: 3, hair: 1, shirt: '#e0784f', hairStyle: 'curly', seed: 4, look: turnedAway ? -0.6 : (t > tParent + 0.8 ? 0.6 : 0) });

  // parent walks in from the right (beat 2)
  const pw = H.phase(t, tParent, tParent + 1.1, H.easeOutCubic);
  if (pw > 0) {
    const px = lerp(1180, 830, pw);
    K.drawPerson(ctx, px, 1040, 1.7, { t, pose: 'stand', flip: true, walk: pw < 1 ? t : undefined, skin: 1, hair: 2, shirt: '#4a7bd0', hairStyle: 'long', mood: 'worried', seed: 9, look: -0.6 });
    // dotted line kid <-> parent, snaps on the cue
    const lk = H.phase(t, tParent + 1.1, tParent + 1.5);
    if (lk > 0) {
      const ax = kx + 70, ay = feet - 190 * S, bx = px - 50, by = 1040 - 205 * 1.7;
      const snap = smooth((t - tSnap) / 0.4);
      ctx.save(); ctx.setLineDash([14, 14]); ctx.lineDashOffset = -t * 30; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.strokeStyle = snap > 0 ? '#ff6b5e' : rgba('#ffffff', 0.8);
      const mx = (ax + bx) / 2, my = (ay + by) / 2 - 40;
      const gap = 0.5 * snap * 0.35;
      // two halves with a growing gap in the middle
      const seg = (u0, u1) => { ctx.beginPath(); for (let k = 0; k <= 20; k++) { const u = lerp(u0, u1, k / 20) * lk; const x = (1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * bx, y = (1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * by + (snap * 40 * Math.sin(Math.PI * u)); if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); } ctx.stroke(); };
      if (snap <= 0) seg(0, 1); else { seg(0, 0.5 - gap); seg(0.5 + gap, 1); }
      ctx.restore();
      if (snap > 0) {
        const x = (ax + bx) / 2, y = (ay + by) / 2 - 10;
        ctx.save(); ctx.translate(x, y); const s = K.popIn(t, tSnap, 0.35); ctx.scale(s, s);
        ctx.strokeStyle = '#ff6b5e'; ctx.lineWidth = 9; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(-18, -18); ctx.lineTo(18, 18); ctx.moveTo(18, -18); ctx.lineTo(-18, 18); ctx.stroke();
        ctx.restore();
      }
    }
  }

  // beat 1: "YES" bubbles + thumbs from the phone (overly agreeable)
  for (let i = 0; i < 5; i++) {
    const s0 = tAgree + i * 0.45, age = t - s0;
    if (age < 0 || t > B2 - 0.2) continue;
    const life = (age % 2.25), alpha = 1 - smooth((life - 1.5) / 0.6);
    const rise = H.easeOutCubic(life / 2.2) * 150;
    const pop = K.popIn(life, 0, 0.3);
    const x = phone.x + [-90, 70, -20, 110, -130][i], y = phone.y - 70 - rise - [0, 30, 60, 10, 40][i];
    ctx.save(); ctx.globalAlpha = alpha * (1 - smooth((t - B2 + 0.6) / 0.4));
    if (i % 2 === 0) K.drawSpeechBubble(ctx, x, y, 1, { text: P.yes || 'YES!', size: 30, pop, tail: i === 4 ? 'right' : 'left' });
    else thumb(ctx, x, y - 30, pop * 0.9, ACC, K.ACCENT.deep);
    ctx.restore();
  }

  // beat 1 pills + shield, upper stage
  const fadeB1 = 1 - smooth((t - B2 + 0.2) / 0.4);
  const sk = K.popIn(t, tSafe, 0.45);
  const grey = smooth((t - tHead) / 0.5);
  if (sk > 0) {
    // shield moves to the top right in beat 2 and greys out with a "?"
    const sx = 250, sy = lerp(720, 760, grey), ss = 1.1 * Math.min(1.05, sk);
    ctx.save(); ctx.globalAlpha = 1 - grey;
    if (grey > 0) ctx.filter = `grayscale(${grey})`;
    K.drawShield(ctx, sx, sy, ss, { check: clamp((t - tSafe - 0.3) / 0.4) * (1 - grey) });
    ctx.restore();
        if (fadeB1 > 0) { ctx.save(); ctx.globalAlpha = fadeB1; K.drawLabel(ctx, 250, 520, Math.min(1.05, K.popIn(t, tSafe + 0.2, 0.4)), { text: P.sold || 'Sold as safe', size: 32, accent: true }); ctx.restore(); }
  }
  ctx.save(); ctx.globalAlpha = fadeB1;
  const swapA = 1 - smooth((t - tTime) / 0.25);
  const ak = K.popIn(t, tAgree + 0.2, 0.4) * swapA; if (ak > 0) K.drawLabel(ctx, 720, 520, Math.min(1.05, ak), { text: P.agree || 'Overly agreeable', size: 30, dot: true });
  const ek = K.popIn(t, tTime + 0.25, 0.4); if (ek > 0) K.drawLabel(ctx, 690, 520, Math.min(1.05, ek), { text: P.engaged || 'Engaged as long as possible', size: 28, dot: true });
  ctx.restore();

  // beat 2: header + warning chips (2x2)
  const hk = K.popIn(t, tHead, 0.45);
  if (hk > 0) K.drawLabel(ctx, 470, 470, Math.min(1.05, hk), { text: P.head || 'According to the complaints', size: 30, accent: true });
  const pos = [[260, 545], [700, 545], [260, 650], [700, 650]];
  chips.forEach((c, i) => {
    const k = K.popIn(t, tChip[i], 0.4);
    if (k <= 0) return;
    chip(ctx, H, pos[i][0], pos[i][1], Math.min(1.05, k), typeof c === 'string' ? c : c.text, t - tChip[i], typeof c === 'string' ? null : c.tag);
  });

  function chip(ctx, H, x, y, s, text, age, tag) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (tag) { ctx.font = H.font('ui', 22); const tw = ctx.measureText(String(tag).toUpperCase()).width + 30; roundRect(ctx, -tw / 2, -66, tw, 34, 17); ctx.fillStyle = ACC; ctx.fill(); ctx.fillStyle = K.ACCENT.deep; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(tag).toUpperCase(), 0, -48); }
    ctx.font = H.font('ui', 27);
    const w = Math.min(420, ctx.measureText(text).width + 90), h = 58;
    roundRect(ctx, -w / 2, -h / 2, w, h, 29); ctx.fillStyle = 'rgba(12,12,24,0.92)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba('#ff8a5c', 0.85); ctx.stroke();
    // little warning triangle
    const tx = -w / 2 + 32, pulse = 1 + 0.08 * Math.sin(age * 6);
    ctx.save(); ctx.translate(tx, 2); ctx.scale(pulse, pulse);
    ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(16, 12); ctx.lineTo(-16, 12); ctx.closePath(); ctx.fillStyle = '#ff8a5c'; ctx.fill();
    ctx.fillStyle = '#1a1020'; ctx.fillRect(-2, -7, 4, 11); ctx.fillRect(-2, 6, 4, 4);
    ctx.restore();
    const f = H.fitText(ctx, text, 'ui', 27, 22, w - 80); ctx.font = f.font;
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, -w / 2 + 58, 1);
    ctx.restore();
  }
}

// simple thumbs-up glyph in a circle
function thumb(ctx, x, y, s, fill, ink) {
  if (s <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill();
  ctx.fillStyle = ink;
  ctx.fillRect(-16, -2, 9, 20);
  ctx.beginPath(); ctx.moveTo(-5, -2); ctx.lineTo(2, -20); ctx.quadraticCurveTo(8, -24, 8, -14); ctx.lineTo(6, -4); ctx.lineTo(16, -4); ctx.quadraticCurveTo(22, -3, 20, 4); ctx.lineTo(16, 16); ctx.quadraticCurveTo(14, 19, 10, 19); ctx.lineTo(-5, 19); ctx.closePath(); ctx.fill();
  ctx.restore();
}
