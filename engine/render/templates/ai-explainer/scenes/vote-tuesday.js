// Scene "vote-tuesday" (full frame). Dusk street with a generic polling place ("VOTE" sign, no seals or flags).
// A voter walks toward it holding a printed guide; a desk calendar flips to `day` on dayCue; on ballotCue the guide
// floats up as a card with generic "Candidate A/B" rows that get a red "Not on your ballot" tag; on checkCue the guide
// slides away and a phone card with `official` / `officialSub` and a shield check pops in; the voter smiles.
// Fits: "why it matters before election day", check-the-official-source civic beats. No real candidates or seals.
// params: day ("TUESDAY"), dayHead ("ELECTION DAY"), notOn ("Not on your ballot"), official, officialSub,
//   cues: dayCue, ballotCue, checkCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, mixHex } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const RED = '#ff6b5e';
  const tDay = at(P.dayCue, D * 0.2) - 0.3;
  const tBallot = at(P.ballotCue, D * 0.45) - 0.4;
  const tCheck = at(P.checkCue, D * 0.7) - 0.3;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 500, y: 760 }]);
  const city = K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });
  const fy = city.feetY || 1036;
  // polling place
  const bx = 655, bw = 260, by = fy - 250;
  K.shadow(ctx, bx + bw / 2, fy + 4, bw * 1.1, 0.4);
  roundRect(ctx, bx, by, bw, 250, 10); ctx.fillStyle = '#c9b79a'; ctx.fill();
  ctx.fillStyle = '#b29f82'; ctx.fillRect(bx + bw * 0.7, by, bw * 0.3, 250);
  ctx.beginPath(); ctx.moveTo(bx - 20, by + 4); ctx.lineTo(bx + bw / 2, by - 70); ctx.lineTo(bx + bw + 20, by + 4); ctx.closePath(); ctx.fillStyle = '#7a5a48'; ctx.fill();
  roundRect(ctx, bx + bw / 2 - 45, fy - 130, 90, 130, 8); ctx.fillStyle = '#4a3328'; ctx.fill();
  ctx.fillStyle = 'rgba(255,214,120,0.85)'; roundRect(ctx, bx + bw / 2 - 37, fy - 122, 74, 60, 6); ctx.fill();
  for (const wx of [bx + 22, bx + bw - 72]) { roundRect(ctx, wx, by + 40, 50, 60, 6); ctx.fillStyle = `rgba(255,214,120,${0.7 + 0.15 * Math.sin(t * 2 + wx)})`; ctx.fill(); }
  // sign
  roundRect(ctx, bx + bw / 2 - 80, by - 6, 160, 50, 10); ctx.fillStyle = '#1c2033'; ctx.fill();
  ctx.font = H.font('display', 34); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('VOTE', bx + bw / 2, by + 20);

  // voter walks in, then stops
  const walkEnd = Math.min(3.6, tBallot);
  const vx = lerp(150, 450, H.easeInOutCubic(clamp(t / walkEnd)));
  const walking = t < walkEnd;
  const pose = t > tCheck ? 'phone' : 'stand';
  K.drawPerson(ctx, vx, fy, 1.3, { pose, t, walk: walking ? t : 0, mood: t > tCheck + 0.6 ? 'happy' : t > tBallot + 0.6 ? 'worried' : 'neutral', skin: 3, hair: 1, shirt: 4, hairStyle: 'long', seed: 55, look: t > tBallot ? 0.4 : 1 });
  // the printed guide in hand (until it floats up)
  if (t < tBallot + 0.1) { ctx.save(); ctx.translate(vx + 40, fy - 150 + K.bob(t, 3, 1.6)); ctx.rotate(0.15); roundRect(ctx, -22, -30, 44, 58, 5); ctx.fillStyle = '#f2f4fa'; ctx.fill(); ctx.fillStyle = '#b9c1d6'; for (let i = 0; i < 3; i++) ctx.fillRect(-14, -20 + i * 14, 28, 5); ctx.restore(); }
  ctx.restore();

  // calendar (top left)
  const cp = K.popIn(t, 0.1, 0.4);
  if (cp > 0) {
    const cx = 80, cy = 452, cw = 230, chh = 190;
    ctx.save(); ctx.translate(cx + cw / 2, cy); ctx.scale(cp, cp); ctx.translate(-(cx + cw / 2), -cy);
    roundRect(ctx, cx, cy, cw, chh, 16); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.save(); roundRect(ctx, cx, cy, cw, chh, 16); ctx.clip(); ctx.fillStyle = RED; ctx.fillRect(cx, cy, cw, 48); ctx.restore();
    ctx.font = H.font('ui', 22); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.dayHead || 'ELECTION DAY', cx + cw / 2, cy + 25);
    // pages flip: a blank page falls away at tDay revealing the day
    const f = clamp((t - tDay) / 0.45);
    ctx.font = H.font('display', 40); ctx.fillStyle = '#161927';
    if (f >= 0.5) ctx.fillText(P.day || 'TUESDAY', cx + cw / 2, cy + 118);
    if (f < 1) {
      ctx.save(); ctx.translate(cx + cw / 2, cy + 48); ctx.scale(1, Math.abs(Math.cos(f * Math.PI)));
      roundRect(ctx, -cw / 2 + 6, 0, cw - 12, chh - 54, 10); ctx.fillStyle = f < 0.5 ? '#f2f4fa' : '#dfe4f1'; ctx.fill();
      if (f < 0.5) { ctx.font = H.font('display', 40); ctx.fillStyle = '#9aa3c0'; ctx.fillText('· · ·', 0, 70); }
      ctx.restore();
    }
    for (const rx of [cx + 50, cx + cw - 50]) { ctx.beginPath(); ctx.arc(rx, cy + 4, 9, 0, Math.PI * 2); ctx.fillStyle = '#3b4260'; ctx.fill(); }
    ctx.restore();
  }

  // guide card (floats up from the hand)
  const gUp = clamp((t - tBallot) / 0.5), gOut = clamp((t - tCheck) / 0.45);
  const GX = 350, GY = 452, GW = 330, GH = 250;
  if (gUp > 0 && gOut < 1) {
    ctx.save(); ctx.globalAlpha = 1 - gOut;
    const e = H.easeOutCubic(gUp);
    ctx.translate(lerp(vx + 40, GX + GW / 2, e) - gOut * 220, lerp(fy - 150, GY + GH / 2, e) + gOut * 40);
    ctx.rotate((1 - e) * 0.15 - gOut * 0.3); ctx.scale(lerp(0.15, 1, e), lerp(0.15, 1, e));
    roundRect(ctx, -GW / 2, -GH / 2, GW, GH, 18); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.font = H.font('bold', 28); ctx.fillStyle = '#161927'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('Your guide', -GW / 2 + 22, -GH / 2 + 44);
    ['Candidate A', 'Candidate B'].forEach((c, i) => {
      const y = -GH / 2 + 70 + i * 52;
      roundRect(ctx, -GW / 2 + 22, y, 30, 30, 6); ctx.lineWidth = 3; ctx.strokeStyle = '#3b4672'; ctx.stroke();
      ctx.font = H.font('ui', 26); ctx.fillStyle = '#3b4672'; ctx.textBaseline = 'middle'; ctx.fillText(c, -GW / 2 + 66, y + 16);
      const strike = clamp((t - tBallot - 0.7 - i * 0.2) / 0.3);
      if (strike > 0) { ctx.strokeStyle = RED; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-GW / 2 + 60, y + 16); ctx.lineTo(-GW / 2 + 60 + 170 * strike, y + 16); ctx.stroke(); }
    });
    const tag = clamp((t - tBallot - 1.1) / 0.35);
    if (tag > 0) {
      const s = 1 + 0.6 * Math.pow(1 - H.easeOutCubic(tag), 2);
      ctx.save(); ctx.translate(0, GH / 2 - 42); ctx.rotate(-0.05); ctx.scale(s, s); ctx.globalAlpha *= clamp(tag * 3);
      ctx.font = H.font('display', 26); const tw = ctx.measureText(P.notOn || 'Not on your ballot').width + 36;
      roundRect(ctx, -tw / 2, -24, tw, 48, 10); ctx.fillStyle = RED; ctx.fill();
      ctx.fillStyle = '#2a0b08'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.notOn || 'Not on your ballot', 0, 2);
      ctx.restore();
    }
    ctx.restore();
  }

  // official site phone card
  const op = K.popIn(t, tCheck + 0.15, 0.5);
  if (op > 0) {
    const ox = 350, oy = 452, ow = 330, oh = 260;
    ctx.save(); ctx.translate(ox + ow / 2, oy + oh); ctx.scale(op, op); ctx.translate(-(ox + ow / 2), -(oy + oh));
    K.glow(ctx, ox + ow / 2, oy + oh / 2, 220, ACC, 0.25);
    roundRect(ctx, ox, oy, ow, oh, 24); ctx.fillStyle = '#1c2033'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
    roundRect(ctx, ox + 16, oy + 16, ow - 32, 34, 17); ctx.fillStyle = '#2a2f45'; ctx.fill();
    ctx.beginPath(); ctx.arc(ox + 38, oy + 33, 8, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    for (let i = 0; i < 1; i++) { roundRect(ctx, ox + 56, oy + 28, 150, 10, 5); ctx.fillStyle = '#4a5884'; ctx.fill(); }
    K.drawShield(ctx, ox + ow / 2, oy + 170, 0.75, { check: clamp((t - tCheck - 0.5) / 0.5) });
    ctx.font = H.font('bold', 27); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(P.official || 'Official election site', ox + ow / 2, oy + 208);
    ctx.font = H.font('ui', 24); ctx.fillStyle = mixHex(ACC, '#ffffff', 0.3); ctx.fillText(P.officialSub || 'state or county', ox + ow / 2, oy + 242);
    ctx.restore();
  }
}
