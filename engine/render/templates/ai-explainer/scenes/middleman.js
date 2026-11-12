// Scene "middleman" (full frame, 1 beat ~9-11 s). Airport terminal: a traveller (left) and an airline counter (right,
// text name pill, no logo) joined by a glowing direct line. A speech card from the counter names who said it as TEXT
// (people are never drawn) with the source line on sourceCue and the paraphrase on tagCue; an agent robot walks onto
// the line, the line kinks through it, a "<tag>" pill and a cross land on it and it steps back off. On laterCue an
// hourglass pill "<later>" pops, the robot looks up hopefully and small up-arrows float over it. Ends settled.
// Fits: "a company doesn't want AI agents between it and its customers", "middleman / gatekeeper" angles, hedged
//       "may reconsider later" caveats.
// params: traveler ("You"), airline ("Company"), who ("The CEO"), source ("Per a report"), said (paraphrase),
//         tag ("Middleman?"), later ("May revisit later"), cues: saidCue, sourceCue, tagCue, laterCue
function terminal(ctx, t, H, K, ACC, o = {}) {
  const { roundRect, rgba } = H;
  // wall
  const g = ctx.createLinearGradient(0, 0, 0, 1000);
  g.addColorStop(0, '#141a36'); g.addColorStop(1, '#232c55');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  // window band with dusk sky
  const wy0 = 430, wy1 = 800;
  const sg = ctx.createLinearGradient(0, wy0, 0, wy1);
  sg.addColorStop(0, '#2b2f66'); sg.addColorStop(0.6, '#8a5a7a'); sg.addColorStop(1, '#e79a6a');
  ctx.fillStyle = sg; ctx.fillRect(0, wy0, 1080, wy1 - wy0);
  // runway lights
  for (let i = 0; i < 14; i++) {
    const x = ((i * 90 + t * 30) % 1260) - 90;
    ctx.fillStyle = rgba('#ffe9a8', 0.5 + 0.5 * Math.sin(t * 3 + i));
    ctx.beginPath(); ctx.arc(x, wy1 - 18, 4, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = '#3a3555'; ctx.fillRect(0, wy1 - 12, 1080, 12);
  // plain plane tail (no livery) drifting slowly
  const px = (o.planeX ?? 830) - t * 6;
  ctx.fillStyle = '#d9dde8';
  ctx.beginPath(); ctx.moveTo(px - 60, wy1 - 12); ctx.lineTo(px + 10, wy1 - 210); ctx.lineTo(px + 70, wy1 - 210); ctx.lineTo(px + 60, wy1 - 12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b8bfd0'; ctx.fillRect(px - 260, wy1 - 70, 330, 58);
  ctx.beginPath(); ctx.arc(px - 260, wy1 - 41, 29, Math.PI / 2, Math.PI * 1.5); ctx.fill();
  ctx.fillStyle = '#7d86a0'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(px - 230 + i * 40, wy1 - 50, 6, 0, Math.PI * 2); ctx.fill(); }
  // mullions
  ctx.fillStyle = '#10142c';
  for (let x = 0; x <= 1080; x += 216) ctx.fillRect(x - 7, wy0, 14, wy1 - wy0);
  ctx.fillRect(0, wy0 - 10, 1080, 14); ctx.fillRect(0, wy1 - 2, 1080, 14);
  // floor
  const fg = ctx.createLinearGradient(0, 1000, 0, 1920);
  fg.addColorStop(0, '#2c3256'); fg.addColorStop(0.2, '#1b1f3a'); fg.addColorStop(1, '#0b0d1a');
  ctx.fillStyle = '#262c4e'; ctx.fillRect(0, wy1 + 12, 1080, 1000 - wy1 - 12);
  ctx.fillStyle = fg; ctx.fillRect(0, 1000, 1080, 920);
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'; ctx.lineWidth = 2;
  for (let i = -6; i < 12; i++) { ctx.beginPath(); ctx.moveTo(540 + i * 140, 1000); ctx.lineTo(540 + i * 420, 1920); ctx.stroke(); }
}

function counter(ctx, H, K, x, y, w, ACC) {
  const { roundRect } = H;
  K.shadow(ctx, x, y + 6, w * 1.05);
  roundRect(ctx, x - w / 2, y - 130, w, 130, 14); ctx.fillStyle = '#dfe4f1'; ctx.fill();
  roundRect(ctx, x - w / 2 - 10, y - 142, w + 20, 22, 10); ctx.fillStyle = '#f4f6fb'; ctx.fill();
  ctx.fillStyle = '#b9c1d6'; ctx.fillRect(x - w / 2, y - 120, w, 12);
  ctx.fillStyle = ACC; ctx.fillRect(x - w / 2, y - 60, w, 8);
}

function boardingPass(ctx, H, x, y, s, ACC, o = {}) {
  const { roundRect } = H;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  roundRect(ctx, -120, -70, 240, 140, 14); ctx.fillStyle = '#f6f7fb'; ctx.fill();
  roundRect(ctx, -120, -70, 240, 36, 14); ctx.fillStyle = ACC; ctx.fill(); ctx.fillRect(-120, -50, 240, 16);
  ctx.fillStyle = '#1b2040'; ctx.font = H.font('bold', 20); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(o.title || 'BOARDING PASS', -104, -51);
  ctx.fillStyle = '#b9c1d6';
  ctx.fillRect(-104, -16, 90, 12); ctx.fillRect(-104, 6, 140, 10); ctx.fillRect(-104, 26, 110, 10);
  // dashed tear line + barcode
  ctx.strokeStyle = '#c9cfe0'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(52, -30); ctx.lineTo(52, 66); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle = '#1b2040'; for (let i = 0; i < 9; i++) ctx.fillRect(66 + i * 5.5, -18, (i % 3 === 0 ? 3.5 : 2), 70);
  ctx.restore();
}


export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const danger = '#ff6b5e';
  const tSrc = at(P.sourceCue, D * 0.33) - 0.2;
  const tTag = at(P.tagCue, D * 0.56) - 0.3;
  const tSaid = at(P.saidCue, D * 0.2) - 0.1;
  const tLater = at(P.laterCue, D * 0.75) - 0.3;
  const tWalk = tTag - 1.6;

  terminal(ctx, t, H, K, ACC, { planeX: 700 });
  // counter right
  K.drawPerson(ctx, 760, 880, 1.0, { t, pose: 'stand', flip: true, mood: 'neutral', skin: 2, hair: 0, shirt: '#3b4a7a', hairStyle: 'bun', seed: 5, look: -0.7 });
  counter(ctx, H, K, 760, 1010, 280, ACC);
  K.drawLabel(ctx, 760, 966, Math.min(1.05, K.popIn(t, 0.1, 0.4)), { text: P.airline || 'Company', size: 22, dot: true });
  // traveller left
  K.drawPerson(ctx, 200, 1040, 1.15, { t, pose: 'phone', mood: t > tTag + 0.6 && t < tLater ? 'neutral' : 'happy', skin: 3, hair: 1, shirt: 1, hairStyle: 'short', seed: 9, look: 0.5 });
  K.drawLabel(ctx, 200, 735, Math.min(1.05, K.popIn(t, 0.2, 0.4)), { text: P.traveler || 'You', size: 24, accent: true });

  // direct line traveller -> counter; kinks through the robot while it stands on it
  const walk = smooth((t - tWalk) / 1.4), off = smooth((t - tTag - 0.9) / 0.6);
  const rx = 470, ry = lerp(1150, 1035, walk) + off * 0 , rX = lerp(470, 470, 1);
  const robotOn = walk * (1 - off);
  const midY = lerp(880, 800, robotOn);
  ctx.save(); ctx.strokeStyle = rgba(ACC, 0.85); ctx.lineWidth = 6; ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 40;
  ctx.beginPath(); ctx.moveTo(270, 880); ctx.quadraticCurveTo(rx, midY - (midY < 870 ? 40 : 0), 640, 880); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
  // robot: rises onto the line from below-left, then steps back to the left
  const robX = lerp(lerp(330, rx, walk), 360, off), robY = 1035;
  if (walk > 0) K.drawRobot(ctx, robX, robY, 0.95, { t, state: t > tLater ? 'happy' : off > 0.1 ? 'thinking' : 'idle', seed: 6 });
  // tag pill + cross on the robot
  const tp = K.popIn(t, tTag, 0.4);
  if (tp > 0) {
    K.drawLabel(ctx, robX + 10, 770, Math.min(1.05, tp) * (1 - smooth((t - tLater + 0.2) / 0.3)), { text: P.tag || 'Middleman?', size: 24, dot: true });
    const xs = smooth((t - tTag - 0.35) / 0.3) * (1 - smooth((t - tLater) / 0.4));
    if (xs > 0) { ctx.save(); ctx.strokeStyle = danger; ctx.lineWidth = 11; ctx.lineCap = 'round'; ctx.globalAlpha = xs;
      ctx.beginPath(); ctx.moveTo(robX - 55, 860); ctx.lineTo(robX + 55, 960); ctx.moveTo(robX + 55, 860); ctx.lineTo(robX - 55, 960); ctx.stroke(); ctx.restore(); }
  }
  // up arrows after laterCue
  if (t > tLater) {
    for (let i = 0; i < 3; i++) {
      const u = ((t - tLater) * 0.7 + i / 3) % 1;
      ctx.save(); ctx.globalAlpha = clamp((t - tLater) / 0.4) * Math.sin(u * Math.PI); ctx.fillStyle = ACC;
      const ax = robX - 70 + i * 70, ay = 900 - u * 90;
      ctx.beginPath(); ctx.moveTo(ax, ay - 16); ctx.lineTo(ax + 14, ay); ctx.lineTo(ax + 5, ay); ctx.lineTo(ax + 5, ay + 14); ctx.lineTo(ax - 5, ay + 14); ctx.lineTo(ax - 5, ay); ctx.lineTo(ax - 14, ay); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }

  // speech card from the counter (who said it, as text)
  const cp = K.popIn(t, 0.25, 0.45);
  if (cp > 0) {
    const X0 = 150, X1 = 830, Y0 = 452;
    const said = String(P.said || 'Doesn’t want “another middleman”');
    const lines = H.wrap(ctx, said, 'display', 38, X1 - X0 - 56);
    const Y1 = Y0 + 30 + 30 + 34 + 16 + lines.length * 46 + 22;
    ctx.save(); ctx.translate((X0 + X1) / 2, Y0); const s = Math.min(1.03, 0.8 + 0.2 * cp); ctx.scale(s, s); ctx.translate(-(X0 + X1) / 2, -Y0);
    roundRect(ctx, X0, Y0, X1 - X0, Y1 - Y0, 24); ctx.fillStyle = 'rgba(12,14,30,0.94)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba('#ffffff', 0.2); ctx.stroke();
    // tail towards the counter
    ctx.fillStyle = 'rgba(12,14,30,0.94)'; ctx.beginPath(); ctx.moveTo(700, Y1 - 2); ctx.lineTo(760, Y1 + 40); ctx.lineTo(740, Y1 - 2); ctx.closePath(); ctx.fill();
    ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillStyle = ACC; ctx.font = H.font('ui', 26); ctx.fillText(H.fitText(ctx, P.who || 'The CEO', 'ui', 26, 18, X1 - X0 - 56).text, X0 + 28, Y0 + 26);
    const sk = smooth((t - tSrc) / 0.4);
    ctx.globalAlpha = sk; ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.font = H.font('body', 24);
    ctx.fillText(H.fitText(ctx, P.source || 'Per a report', 'body', 24, 18, X1 - X0 - 56).text, X0 + 28, Y0 + 62);
    const qk = smooth((t - tSaid) / 0.4);
    ctx.globalAlpha = qk; ctx.fillStyle = '#ffffff'; ctx.font = H.font('display', 38);
    lines.forEach((ln, i) => ctx.fillText(ln, X0 + 28, Y0 + 110 + i * 46 + (1 - qk) * 12));
    ctx.restore();
  }
  // "may revisit" pill with an hourglass
  const lp = K.popIn(t, tLater, 0.45);
  if (lp > 0) {
    ctx.save(); ctx.translate(560, 715); const s = Math.min(1.05, lp); ctx.scale(s, s);
    const f = H.fitText(ctx, P.later || 'May revisit later', 'display', 28, 18, 470);
    ctx.font = f.font; const w = ctx.measureText(f.text).width + 84;
    roundRect(ctx, -w / 2, -30, w, 60, 30); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = '#15182e'; const hx = -w / 2 + 34;
    ctx.beginPath(); ctx.moveTo(hx - 11, -16); ctx.lineTo(hx + 11, -16); ctx.lineTo(hx, 0); ctx.lineTo(hx + 11, 16); ctx.lineTo(hx - 11, 16); ctx.lineTo(hx, 0); ctx.closePath(); ctx.fill();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, -w / 2 + 60, 2);
    ctx.restore();
  }
}
