// Scene "doorstep-check" (full frame, 1 beat ~10-12 s). Dusk street. First a parade of little shopping robots (bags in
// hand) under a hyped pill ("AI that shops for you"). Then a two-row checklist card drops: row 1 (the order) ticks as
// the "easy part", row 2 (it actually arrives right) lights up as the "hard part". A cartoon courier with an insulated
// backpack walks the bag to a front door, the door opens, a customer takes it, and row 2 gets its tick.
// Fits: "the hard part isn't the tech, it's the real-world delivery", "last mile", "AI can click buy, can it deliver?".
// params: hype ("AI that shops for you"), row1 ("Place the order"), tag1 ("Easy part"), row2 ("It shows up right"),
//         tag2 ("Hard part"), cues ("word#n"): hypeCue, easyCue, hardCue, walkCue, doneCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tHype = at(P.hypeCue, D * 0.18) - 0.2;
  const tEasy = at(P.easyCue, D * 0.48) - 0.2;
  const tHard = at(P.hardCue, D * 0.57) - 0.15;
  const tWalk = at(P.walkCue, D * 0.66) - 0.6;
  const tDone = Math.max(tWalk + 1.6, at(P.doneCue, D * 0.9) - 0.1);
  const tCard = tEasy - 0.7;
  const feet = 1030, danger = '#ff8a5e';

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tCard, zoom: 1.02, x: 487, y: 735 }, { t: D, zoom: 1.03, x: 505, y: 750 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });

  // ---- house front (right) ----
  const hx0 = 640, hx1 = 960, hTop = 700, doorX = 780;
  ctx.fillStyle = '#5a4a72'; ctx.beginPath(); ctx.moveTo(hx0 - 30, hTop); ctx.lineTo((hx0 + hx1) / 2, hTop - 110); ctx.lineTo(hx1 + 30, hTop); ctx.closePath(); ctx.fill();
  roundRect(ctx, hx0, hTop, hx1 - hx0, 1000 - hTop, 8); ctx.fillStyle = '#7a6a96'; ctx.fill();
  // window
  roundRect(ctx, 880, 770, 60, 70, 6); ctx.fillStyle = '#fff1c4'; ctx.fill(); K.glow(ctx, 910, 805, 70, '#fff1c4', 0.25);
  // door frame + door
  const open = smooth((t - (tDone - 1.0)) / 0.5);
  roundRect(ctx, doorX - 70, 790, 140, 210, 6); ctx.fillStyle = '#fff1c4'; ctx.fill();
  K.glow(ctx, doorX, 900, 160, '#fff1c4', 0.25 * open);
  ctx.save(); ctx.translate(doorX - 64, 796); ctx.scale(1 - 0.85 * open, 1);
  roundRect(ctx, 0, 0, 128, 204, 4); ctx.fillStyle = '#3b2f4a'; ctx.fill();
  ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(108, 110, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // customer in the doorway
  if (open > 0.3) K.drawPerson(ctx, doorX + 10, feet - 30, 1.15, { t, pose: t > tDone + 0.2 ? 'cheer' : 'stand', mood: 'happy', skin: 1, hair: 3, shirt: 2, hairStyle: 'bun', seed: 31, flip: true });
  // steps
  ctx.fillStyle = '#4b3f60'; ctx.fillRect(doorX - 90, 995, 180, 14);

  // ---- parade of shopping robots (left), they step back when the card arrives ----
  const back = smooth((t - tCard) / 0.8);
  for (let i = 0; i < 3; i++) {
    const u = smooth(clamp((t + 1.3 - i * 0.35) / 2.2));
    const x = lerp(-120 - i * 120, 120 + i * 150, u) - back * 40;
    const s = 0.9 - 0.25 * back;
    ctx.save(); ctx.globalAlpha = 1 - 0.55 * back;
    K.drawRobot(ctx, x, feet - 20 * back, s, { t: t + i * 0.7, state: u < 1 ? 'working' : 'happy', seed: 40 + i });
    shoppingBag(ctx, x + 60 * s, feet - 92 * s - 20 * back, 0.7 * s, i === 1 ? '#7fb3ff' : ACC, H);
    ctx.restore();
  }
  const hp = K.popIn(t, tHype, 0.45);
  if (hp > 0 && back < 1) { ctx.save(); ctx.globalAlpha = 1 - back; K.drawLabel(ctx, 300, 760 - 40 * back, Math.min(1.05, hp), { text: P.hype || 'AI that shops for you', size: 30, accent: true, dot: true }); ctx.restore(); }

  // ---- courier walking the bag to the door ----
  if (t > tWalk) {
    const u = smooth(clamp((t - tWalk) / (tDone - 0.9 - tWalk)));
    const cx = lerp(-80, doorX - 150, u);
    const walking = u < 1;
    // insulated backpack behind
    roundRect(ctx, cx - 62, feet - 220, 56, 70, 10); ctx.fillStyle = '#d65a4a'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(cx - 58, feet - 200, 48, 6);
    K.drawPerson(ctx, cx, feet, 1.15, { t, pose: 'stand', walk: walking ? t : undefined, mood: 'happy', skin: 4, hair: 0, shirt: '#2f6f8f', hairStyle: 'short', seed: 33 });
    // bag held out (handed over at the end)
    const hand = smooth((t - (tDone - 0.4)) / 0.4);
    bag(ctx, lerp(cx + 50, doorX - 30, hand), feet - 95 - 10 * hand, 0.55, 0, H, ACC);
  }

  // ---- checklist card (top) ----
  const cp = K.popIn(t, tCard, 0.5);
  if (cp > 0) {
    const X0 = 110, X1 = 865, Y0 = 430;
    ctx.save(); ctx.translate(487, Y0 + 100); ctx.scale(Math.min(1.03, cp), Math.min(1.03, cp)); ctx.translate(-487, -(Y0 + 100));
    roundRect(ctx, X0, Y0, X1 - X0, 210, 24); ctx.fillStyle = 'rgba(12,14,28,0.92)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
    const row = (y, text, tag, tagCol, ticked, lit) => {
      // checkbox
      roundRect(ctx, X0 + 30, y - 26, 52, 52, 12); ctx.fillStyle = ticked > 0 ? '#3fbf7f' : 'rgba(255,255,255,0.1)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = lit ? tagCol : 'rgba(255,255,255,0.35)'; ctx.stroke();
      if (ticked > 0) {
        ctx.strokeStyle = '#0d2a1c'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); const k = clamp(ticked);
        ctx.moveTo(X0 + 42, y); ctx.lineTo(X0 + 52, y + 12 * Math.min(1, k * 2)); if (k > 0.5) ctx.lineTo(X0 + 52 + 20 * (k - 0.5) * 2, y + 12 - 26 * (k - 0.5) * 2); ctx.stroke();
      }
      ctx.fillStyle = '#ffffff'; ctx.font = H.font('display', 36); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(text, X0 + 106, y + 2);
      if (lit) {
        ctx.font = H.font('bold', 26); const tw = ctx.measureText(tag).width;
        const pk = Math.min(1.05, lit);
        ctx.save(); ctx.translate(X1 - 30 - (tw + 36) / 2, y); ctx.scale(pk, pk);
        roundRect(ctx, -(tw + 36) / 2, -24, tw + 36, 48, 24); ctx.fillStyle = tagCol; ctx.fill();
        ctx.fillStyle = '#10142a'; ctx.textAlign = 'center'; ctx.fillText(tag, 0, 2);
        ctx.restore();
      }
    };
    row(Y0 + 62, P.row1 || 'Place the order', P.tag1 || 'Easy part', '#3fbf7f', clamp((t - tEasy) / 0.35), K.popIn(t, tEasy, 0.35));
    const hardLit = K.popIn(t, tHard, 0.35);
    if (hardLit > 0) { ctx.save(); ctx.globalAlpha = 0.18 * (0.6 + 0.4 * Math.sin(t * 6)); roundRect(ctx, X0 + 14, Y0 + 112, X1 - X0 - 28, 84, 16); ctx.fillStyle = danger; ctx.fill(); ctx.restore(); }
    row(Y0 + 152, P.row2 || 'It shows up right', P.tag2 || 'Hard part', danger, clamp((t - tDone) / 0.35), hardLit);
    ctx.restore();
  }
  // tick burst at the door
  if (t > tDone) K.drawStamp(ctx, 500, 890, 0.7, { kind: 'check', text: 'DELIVERED', land: (t - tDone) / 0.5 });
  ctx.restore();
}

function shoppingBag(ctx, x, y, s, col, H) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#1b1f33'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, -60, 18, Math.PI, 0); ctx.stroke();
  H.roundRect(ctx, -34, -62, 68, 70, 8); ctx.fillStyle = col; ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.15)'; ctx.fillRect(18, -62, 16, 70);
  ctx.restore();
}

function bag(ctx, x, y, s, rot, H, ACC) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  const w = 90, h = 104;
  ctx.fillStyle = '#d9b07a';
  ctx.beginPath(); ctx.moveTo(-w / 2, 0); ctx.lineTo(-w / 2 + 6, -h); ctx.lineTo(w / 2 - 6, -h); ctx.lineTo(w / 2, 0); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(w / 2 - 22, -h, 16, h);
  ctx.fillStyle = '#e8c58f'; ctx.fillRect(-w / 2 + 6, -h - 16, w - 12, 18);
  ctx.fillStyle = ACC; H.roundRect(ctx, -18, -h * 0.62, 36, 26, 6); ctx.fill();
  ctx.restore();
}
