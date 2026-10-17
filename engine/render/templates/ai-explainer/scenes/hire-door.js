// Scene "hire-door" (full frame). An office lobby with a glowing hiring door on the left; a stream of new hires
// walks in from the right. Juniors carry a backpack and an accent tag; experienced hires carry a briefcase.
// mode "stats": the share of juniors in the stream drops on cue; a top panel counts the junior share of hires down
//               (from -> to) with a meter; a second panel shows the staff share (staffFrom -> staffTo) + a note.
// mode "payoff": the door has narrowed; one junior waits in front of it while experienced hires pass; a pie with
//               the final slice lands on sliceCue, a question card on qCue.
// params: mode, door ("HIRES"), tag ("JUNIOR"), hireTitle, from (30), to (10), max (meter full scale, default
//         max(40, from * 1.25)), was ("was"), staffTitle, staffFrom (20), staffTo (15), staffNote, dropCue, nineCue,
//         staffCue, staffEndCue; payoff: slice, question, sliceCue, qCue, sliceValue (10)
// Defaults are generic placeholders: always pass your story's published numbers.
// Fits: entry-level / junior hiring shares, who gets through the door, first jobs.
export default function draw(ctx, t, info) {
  const P = info.params || {};
  const H = info.helpers, K = info.helpers.kit, D = info.duration, ACC = info.accent;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const payoff = P.mode === 'payoff';
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: payoff ? 1.0 : 1.03, x: 487, y: 760 }, { t: D, zoom: payoff ? 1.07 : 1.0, x: payoff ? 420 : 487, y: 760 }]);
  K.world.office(ctx, { t, time: 'dusk' });
  const narrow = payoff ? 0.55 + 0.1 * (1 - H.smooth(t / 2)) : 1;
  door(ctx, H, K, 165, 1035, narrow, t, ACC, P.door || 'HIRES');

  // ---- the stream of hires (walking left toward the door)
  const tDrop = at(P.dropCue, D * 0.25), tNine = Math.max(tDrop + 0.8, at(P.nineCue, D * 0.45));
  const gap = payoff ? 3.4 : 0.95, speed = 230, x0 = 1120, doorX = 165;
  const iMin = Math.floor((t - (x0 - doorX) / speed) / gap) - 1, iMax = Math.floor((t + 0.0) / gap) + 1;
  const shirts = ['#6f86e0', '#e8786a', '#a08be0', '#e0a84f', '#5fa8d8', '#4fb3a6'];
  const list = [];
  for (let i = iMax; i >= iMin; i--) {
    const spawn = i * gap - 2.5;           // start with people already on screen
    const x = x0 - (t - spawn) * speed;
    if (x > 1150 || x < doorX - 10) continue;
    let junior;
    if (payoff) junior = false;
    else junior = spawn + 2.5 < tDrop ? ((i % 4) + 4) % 4 === 1 : ((i % 11) + 11) % 11 === 5;
    list.push({ i, x, junior });
  }
  list.sort((a, b) => a.x - b.x);
  for (const w of list) {
    const fade = H.clamp((w.x - doorX) / 70);
    ctx.save(); ctx.globalAlpha = fade;
    hire(ctx, H, K, w.x, 1035, 1.0, { t, walk: t + w.i * 0.31, junior: w.junior, i: w.i, shirt: shirts[((w.i % 6) + 6) % 6], ACC, tag: P.tag || 'JUNIOR' });
    ctx.restore();
  }
  if (payoff) {
    hire(ctx, H, K, 420, 1040, 1.15, { t, junior: true, i: 3, shirt: '#4fb3a6', ACC, tag: P.tag || 'JUNIOR', mood: 'worried', look: -0.8, still: true });
  }
  ctx.restore(); // camera

  if (!payoff) stats(ctx, t, info, P, H, K, ACC, at, tDrop, tNine);
  else payoffOverlay(ctx, t, info, P, H, K, ACC, at);
}

function door(ctx, H, K, x, y, narrow, t, ACC, sign) {
  const w = 150 * narrow, h = 250;
  ctx.save();
  K.glow(ctx, x, y - h / 2, 180, ACC, 0.22 + 0.05 * Math.sin(t * 3));
  H.roundRect(ctx, x - w / 2 - 14, y - h - 14, w + 28, h + 14, 12); ctx.fillStyle = '#1a1f38'; ctx.fill();
  const g = ctx.createLinearGradient(0, y - h, 0, y);
  g.addColorStop(0, H.rgba(ACC, 0.95)); g.addColorStop(1, H.rgba(ACC, 0.45));
  H.roundRect(ctx, x - w / 2, y - h, w, h, 8); ctx.fillStyle = g; ctx.fill();
  ctx.restore();
  K.drawLabel(ctx, x + 10, y - h - 24, 1, { text: sign, size: 26, dot: true });
}

function hire(ctx, H, K, x, y, s, o) {
  const pose = o.still ? 'stand' : 'stand';
  // backpack behind (facing left, so the back is on the right)
  if (o.junior) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    H.roundRect(ctx, 6, -176, 40, 62, 12); ctx.fillStyle = '#c94f6d'; ctx.fill();
    H.roundRect(ctx, 12, -150, 28, 20, 6); ctx.fillStyle = '#a63f5a'; ctx.fill();
    ctx.restore();
  }
  K.drawPerson(ctx, x, y, s, { t: o.t, walk: o.still ? undefined : o.walk, pose, flip: true, mood: o.mood || 'happy', shirt: o.shirt, skin: ((o.i * 3) % 5 + 5) % 5, hair: ((o.i * 2) % 5 + 5) % 5, hairStyle: ['short', 'long', 'curly', 'bun', 'short', 'none'][((o.i % 6) + 6) % 6], seed: o.i, look: o.look });
  if (o.junior) {
    K.drawLabel(ctx, x, y - 262 * s, 1, { text: o.tag, size: 24, accent: true });
  } else {
    K.drawBriefcase(ctx, x - 34 * s, y - 52 * s, 0.32 * s);
  }
}

function panel(ctx, H, x, y, w, h, ACC) {
  H.roundRect(ctx, x - w / 2, y, w, h, 22); ctx.fillStyle = 'rgba(10,12,24,0.88)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
}

function stats(ctx, t, info, P, H, K, ACC, at, tDrop, tNine) {
  const from = P.from ?? 30, to = P.to ?? 10, max = P.max ?? Math.max(40, from * 1.25);
  // panel 1: junior share of hires
  const p1 = K.popIn(t, 0.25, 0.5);
  if (p1 > 0) {
    ctx.save(); ctx.translate(487, 445); ctx.scale(Math.min(1.04, p1), Math.min(1.04, p1)); ctx.translate(-487, -445);
    panel(ctx, H, 487, 445, 820, 170, ACC);
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const f = H.fitText(ctx, P.hireTitle || 'Junior share of hires', 'ui', 30, 22, 460); ctx.font = f.font;
    ctx.fillText(f.text, 110, 490);
    const k = K.phase(t, tDrop, tNine + 0.3, H.easeInOutCubic);
    const v = Math.round(from + (to - from) * k);
    ctx.font = H.font('display', 84); ctx.textAlign = 'right'; ctx.fillStyle = ACC;
    ctx.fillText(v + '%', 870, 528);
    if (k > 0) { ctx.font = H.font('ui', 26); ctx.fillStyle = '#9aa3bd'; ctx.fillText((P.was || 'was') + ' ' + from + '%', 870, 590); }
    // meter
    const mx = 110, mw = 480, my = 545;
    H.roundRect(ctx, mx, my, mw, 24, 12); ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fill();
    if (k > 0) { H.roundRect(ctx, mx, my, mw * from / max, 24, 12); ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.setLineDash([8, 6]); ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); }
    H.roundRect(ctx, mx, my, Math.max(24, mw * (from + (to - from) * k) / max), 24, 12); ctx.fillStyle = ACC; ctx.fill();
    ctx.restore();
  }
  // panel 2: junior share of staff
  if (P.staffTitle) {
    const tS = at(P.staffCue, info.duration * 0.62) - 0.2, tE = Math.max(tS + 0.8, at(P.staffEndCue, info.duration * 0.85));
    const p2 = K.popIn(t, tS, 0.45);
    if (p2 > 0) {
      ctx.save(); ctx.translate(487, 630); ctx.scale(Math.min(1.04, p2), Math.min(1.04, p2)); ctx.translate(-487, -630);
      panel(ctx, H, 487, 630, 820, 120, ACC);
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const f = H.fitText(ctx, P.staffTitle, 'ui', 28, 22, 470); ctx.font = f.font;
      ctx.fillText(f.text, 110, 668);
      if (P.staffNote) { ctx.font = H.font('ui', 24); ctx.fillStyle = '#9aa3bd'; ctx.fillText(P.staffNote, 110, 712); }
      const k = K.phase(t, tS + 0.3, tE + 0.2, H.easeInOutCubic);
      const a = P.staffFrom ?? 20, b = P.staffTo ?? 15;
      ctx.textAlign = 'right'; ctx.font = H.font('display', 58);
      ctx.fillStyle = '#ffffff'; ctx.globalAlpha = 0.55; ctx.fillText(a + '%', 690, 690); ctx.globalAlpha = 1;
      ctx.fillStyle = ACC; ctx.fillText(Math.round(a + (b - a) * k) + '%', 875, 690);
      ctx.strokeStyle = '#9aa3bd'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(700, 690); ctx.lineTo(732, 690); ctx.moveTo(723, 681); ctx.lineTo(732, 690); ctx.lineTo(723, 699); ctx.stroke();
      ctx.restore();
    }
  }
}

function payoffOverlay(ctx, t, info, P, H, K, ACC, at) {
  const D = info.duration;
  const tSl = at(P.sliceCue, D * 0.3) - 0.3, tQ = Math.max(tSl + 0.8, at(P.qCue, D * 0.55) - 0.2);
  const ps = K.popIn(t, tSl, 0.5);
  if (ps > 0) {
    const cx = 760, cy = 760, r = 95;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(ps, ps);
    ctx.fillStyle = 'rgba(10,12,24,0.88)'; ctx.beginPath(); ctx.arc(0, 0, r + 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6f86e0'; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
    const share = (P.sliceValue ?? 10) / 100;
    const grow = K.phase(t, tSl + 0.3, tSl + 1.0, H.easeOutCubic);
    const pop = 10 * Math.sin(Math.min(1, grow) * Math.PI);
    const a0 = -Math.PI / 2, a1 = a0 + share * Math.PI * 2 * grow;
    const mid = (a0 + a1) / 2;
    ctx.translate(Math.cos(mid) * (8 + pop), Math.sin(mid) * (8 + pop));
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, a0, a1); ctx.closePath(); ctx.fill();
    ctx.restore();
    K.drawLabel(ctx, cx, cy + r + 70, ps, { text: P.slice || 'Junior share', size: 28, accent: true });
  }
  const pq = K.popIn(t, tQ, 0.6);
  if (pq > 0) {
    ctx.save(); ctx.translate(487, 520); ctx.scale(Math.min(1.04, pq), Math.min(1.04, pq));
    H.roundRect(ctx, -400, -70, 800, 140, 28); ctx.fillStyle = 'rgba(10,12,24,0.92)'; ctx.fill();
    ctx.lineWidth = 3 + 2 * Math.sin(t * 4); ctx.strokeStyle = H.rgba(ACC, 0.85); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const f = H.fitText(ctx, P.question || 'What now?', 'display', 46, 28, 700); ctx.font = f.font;
    ctx.fillText(f.text, 0, 4);
    ctx.restore();
  }
}
