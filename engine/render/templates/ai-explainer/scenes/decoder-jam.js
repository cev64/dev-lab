// Scene "decoder-jam" (full frame, 1 beat). A night workshop: a big friendly machine labelled as a decoder (text sign)
// sits between two conveyor belts. Text cards (scrambled-looking letters) ride in on the left; tidy data blocks
// (picture / document / key icons) come out on the right. On jamCue one misshapen red card slips in: the machine
// shakes, its lamp turns red, a crack opens on its front, the output belt stops, and a small operator looks shocked.
// Pills: name (accent, big), date, by, and a red "critical" badge, each on its cue. Metaphor only, no exploit steps.
// params: machine ("DECODER"), name, date, by, crit, cards [3 strings], bad (the odd card's text),
//         cues (narration words, "word#n", or numbers): nameCue, dateCue, byCue, jamCue, critCue
// Fits: a flaw in a parser / decoder / file reader, "bad input breaks the machine", malformed-data bugs.
const RED = '#ff5a52';
const BELT_Y = 900, MX0 = 330, MX1 = 650, MY0 = 600;

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, roundRect, rgba } = H;
  const at = (w, d) => {
    if (typeof w === 'number') return w;
    if (!w) return d;
    const [wd, n] = String(w).split('#');
    const v = info.timeOf(wd, n ? parseInt(n, 10) : 0);
    return v == null ? d : v;
  };
  const tName = at(P.nameCue, D * 0.3) - 0.2, tDate = at(P.dateCue, D * 0.1) - 0.2, tBy = at(P.byCue, D * 0.2) - 0.2;
  const tCrit = at(P.critCue, D * 0.4) - 0.2, tJam = at(P.jamCue, D * 0.65) - 0.6;
  const jam = smooth((t - tJam - 1.0) / 0.3); // the bad card reaches the machine ~1 s after it appears

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 487, y: 760 }, { t: tJam + 0.8, zoom: 1.0, x: 487, y: 740 }, { t: tJam + 1.6, zoom: 1.07, x: 490, y: 760 }, { t: D, zoom: 1.08, x: 490, y: 760 }]);
  if (jam > 0) K.cameraShake(ctx, t, tJam + 1.0, 0.6, 8);
  K.world.room(ctx, { t, time: 'night', window: true, picture: false, lamp: false, plant: false });

  // ---- belts
  const beltRun = (x0, x1, moving) => {
    roundRect(ctx, x0, BELT_Y, x1 - x0, 26, 13); ctx.fillStyle = '#2a2f52'; ctx.fill();
    ctx.save(); roundRect(ctx, x0, BELT_Y, x1 - x0, 26, 13); ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 3;
    const off = (moving * 60) % 30;
    for (let x = x0 - 30 + off; x < x1 + 30; x += 30) { ctx.beginPath(); ctx.moveTo(x, BELT_Y + 4); ctx.lineTo(x - 8, BELT_Y + 22); ctx.stroke(); }
    ctx.restore();
    for (let x = x0 + 30; x < x1; x += 90) { ctx.fillStyle = '#3a4167'; ctx.fillRect(x, BELT_Y + 26, 10, 1036 - BELT_Y - 26); }
  };
  const stopAt = tJam + 1.0;
  const moveT = t < stopAt ? t : stopAt + (1 - Math.exp(-(t - stopAt) * 4)) * 0.15;
  beltRun(70, MX0 + 10, moveT);
  beltRun(MX1 - 10, 910, moveT);

  // ---- input cards (left belt -> machine mouth)
  const cards = (P.cards || ['SGVsbG8=', 'aGk=', 'ZGF0YQ==']).slice(0, 3);
  const period = 1.5;
  for (let k = -1; k < 12; k++) {
    const t0 = k * period;              // card k enters at the left edge at t0 - 1.2 (so belt is full at frame 0)
    const u = (moveT - t0 + 1.2) / 2.0; // 0 at left edge, 1 at the mouth
    if (u < 0 || u > 1) continue;
    if (t0 > tJam - 0.6) continue;      // no normal cards after the bad one
    card(ctx, H, lerp(80, MX0 - 20, u), BELT_Y - 4, cards[((k % 3) + 3) % 3], false, t);
  }
  // the bad card
  if (t > tJam) {
    const u = clamp((t - tJam) / 1.0);
    const wob = Math.sin(t * 14) * 3 * (1 - jam);
    card(ctx, H, lerp(70, MX0 - 50, easeOutCubic(u)) + wob, BELT_Y - 4, String(P.bad || 'QUJD=?='), true, t);
  }
  // ---- output blocks (machine -> right belt), stop after the jam
  for (let k = -1; k < 12; k++) {
    const t0 = k * period + 0.7;
    const u = (moveT - t0) / 2.0;
    if (u < 0 || u > 1.05) continue;
    if (t0 > tJam + 0.4) continue;
    block(ctx, H, K, lerp(MX1 + 20, 900, Math.min(1, u)), BELT_Y - 2, k, ACC, t);
  }

  // ---- the machine
  const shake = jam > 0 ? Math.sin(t * 40) * 4 * Math.max(0, 1 - (t - tJam - 1.0) / 0.8) : 0;
  ctx.save(); ctx.translate(shake, 0);
  K.shadow(ctx, (MX0 + MX1) / 2, 1036, MX1 - MX0 + 40);
  roundRect(ctx, MX0, MY0, MX1 - MX0, 1036 - MY0, 26); ctx.fillStyle = '#4a5488'; ctx.fill();
  roundRect(ctx, MX0, MY0, MX1 - MX0, 40, 20); ctx.fillStyle = '#5c67a3'; ctx.fill();
  // sign
  const sign = String(P.machine || 'DECODER');
  roundRect(ctx, MX0 + 22, MY0 + 56, MX1 - MX0 - 44, 64, 14); ctx.fillStyle = '#141829'; ctx.fill();
  const fs = H.fitText(ctx, sign, 'display', 36, 20, MX1 - MX0 - 70);
  ctx.font = fs.font; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(sign, (MX0 + MX1) / 2, MY0 + 89);
  // gears window
  const gx = (MX0 + MX1) / 2, gy = MY0 + 210;
  ctx.beginPath(); ctx.arc(gx, gy, 66, 0, Math.PI * 2); ctx.fillStyle = '#20264a'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = '#2f3766'; ctx.stroke();
  const spin = t < stopAt ? t * 2.2 : stopAt * 2.2 + Math.sin((t - stopAt) * 30) * 0.06 * Math.max(0, 1 - (t - stopAt));
  gear(ctx, gx - 22, gy + 8, 30, spin, jam > 0 ? H.mixHex('#c9cfdf', RED, jam * 0.6) : '#c9cfdf');
  gear(ctx, gx + 28, gy - 18, 22, -spin * 1.36 + 0.3, '#9aa3c4');
  // mouth + output slot
  roundRect(ctx, MX0 - 6, BELT_Y - 92, 26, 96, 8); ctx.fillStyle = '#141829'; ctx.fill();
  roundRect(ctx, MX1 - 20, BELT_Y - 92, 26, 96, 8); ctx.fillStyle = '#141829'; ctx.fill();
  // lamp
  const lampRed = jam > 0, blink = 0.5 + 0.5 * Math.sin(t * (lampRed ? 9 : 3));
  const lampCol = lampRed ? RED : ACC;
  K.glow(ctx, MX1 - 50, MY0 - 10, 60 + 20 * blink, lampCol, 0.25 + 0.25 * blink);
  ctx.beginPath(); ctx.arc(MX1 - 50, MY0 - 10, 20, Math.PI, 0); ctx.fillStyle = lampCol; ctx.fill();
  roundRect(ctx, MX1 - 74, MY0 - 12, 48, 12, 4); ctx.fillStyle = '#2a2f52'; ctx.fill();
  // crack on the front
  if (jam > 0) {
    const pts = [[gx - 90, MY0 + 300], [gx - 50, MY0 + 330], [gx - 66, MY0 + 360], [gx - 20, MY0 + 385], [gx - 30, MY0 + 410]];
    K.glow(ctx, gx - 55, MY0 + 355, 90, RED, 0.35 * jam);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.strokeStyle = '#141626'; ctx.lineWidth = 12; K.pathDraw(ctx, pts, jam);
    ctx.strokeStyle = RED; ctx.lineWidth = 5; K.pathDraw(ctx, pts, jam);
  }
  ctx.restore();
  // smoke puffs after the jam
  if (jam > 0) {
    for (let i = 0; i < 5; i++) {
      const ph = ((t - tJam - 1.0) * 0.5 + i * 0.2) % 1;
      if (t - tJam - 1.0 < i * 0.25) continue;
      ctx.save(); ctx.globalAlpha = 0.35 * (1 - ph); ctx.fillStyle = '#c9cfdf';
      ctx.beginPath(); ctx.arc(MX0 + 60 + i * 50 + Math.sin(ph * 6 + i) * 10, MY0 - 20 - ph * 120, 16 + ph * 26, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }

  // ---- operator (right)
  const shocked = t > tJam + 1.1;
  K.drawPerson(ctx, 800, 1036, 0.92, { t, pose: shocked ? 'shrug' : 'stand', mood: shocked ? 'shocked' : 'happy', look: -0.7, flip: true, skin: 4, hair: 3, hairStyle: 'curly', shirt: 1, seed: 21 });

  // ---- pills
  const pill = (tt, x, y, text, o) => { const k = K.popIn(t, tt, 0.45); if (k > 0) K.drawLabel(ctx, x, y + K.bob(t, 3, 1.2, y), Math.min(1.05, k), { text, ...o }); };
  pill(tDate, 250, 470, String(P.date || 'This week'), { size: 28, dot: true });
  pill(tBy, 640, 470, String(P.by || 'Revealed by a security firm'), { size: 28, dot: true });
  pill(tName, 487, 540, String(P.name || 'The flaw'), { size: 46, accent: true });
  // critical badge
  const ck = K.popIn(t, tCrit, 0.45);
  if (ck > 0) {
    const s = Math.min(1.05, ck), x = 800, y = 640;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(0.06);
    ctx.font = H.font('display', 30); const w = ctx.measureText(String(P.crit || 'Critical').toUpperCase()).width + 48;
    roundRect(ctx, -w / 2, -28, w, 56, 14); ctx.fillStyle = RED; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(P.crit || 'Critical').toUpperCase(), 0, 2);
    ctx.restore();
  }
  ctx.restore();
}

function card(ctx, H, x, y, text, bad, t) {
  ctx.save(); ctx.translate(x, y); if (bad) ctx.rotate(-0.12 + Math.sin(t * 9) * 0.05);
  const W = 150, Hh = 74;
  H.roundRect(ctx, -W / 2, -Hh, W, Hh, 10); ctx.fillStyle = bad ? '#ffd9d6' : '#f4f1e8'; ctx.fill();
  ctx.lineWidth = bad ? 4 : 2; ctx.strokeStyle = bad ? RED : '#c9c4b5'; ctx.stroke();
  if (bad) { // ragged corner
    ctx.beginPath(); ctx.moveTo(W / 2 - 26, -Hh); ctx.lineTo(W / 2, -Hh + 22); ctx.lineTo(W / 2, -Hh); ctx.closePath(); ctx.fillStyle = '#20243f'; ctx.fill();
  }
  ctx.font = H.font('bold', 26); ctx.fillStyle = bad ? '#a01e1a' : '#20243f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const ft = H.fitText(ctx, text, 'bold', 26, 16, W - 20); ctx.font = ft.font;
  ctx.fillText(text, 0, -Hh / 2);
  ctx.restore();
}
function block(ctx, H, K, x, y, k, acc, t) {
  const kind = ((k % 3) + 3) % 3;
  ctx.save(); ctx.translate(x, y);
  H.roundRect(ctx, -46, -84, 92, 84, 14); ctx.fillStyle = '#e9eefc'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = acc; ctx.stroke();
  if (kind === 0) { // picture
    H.roundRect(ctx, -30, -70, 60, 50, 6); ctx.fillStyle = '#8fb0dc'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-30, -22); ctx.lineTo(-8, -48); ctx.lineTo(8, -32); ctx.lineTo(18, -42); ctx.lineTo(30, -22); ctx.closePath(); ctx.fillStyle = '#4f7a5a'; ctx.fill();
    ctx.beginPath(); ctx.arc(16, -58, 6, 0, Math.PI * 2); ctx.fillStyle = '#f2c86b'; ctx.fill();
  } else if (kind === 1) { // document
    for (let r = 0; r < 4; r++) { H.roundRect(ctx, -28, -68 + r * 14, r === 3 ? 30 : 56, 7, 3); ctx.fillStyle = '#7a86c2'; ctx.fill(); }
  } else { // key
    ctx.beginPath(); ctx.arc(-12, -44, 14, 0, Math.PI * 2); ctx.lineWidth = 8; ctx.strokeStyle = '#d9a43a'; ctx.stroke();
    ctx.fillStyle = '#d9a43a'; ctx.fillRect(0, -48, 30, 8); ctx.fillRect(20, -48, 6, 16); ctx.fillRect(10, -48, 6, 12);
  }
  ctx.restore();
}
function gear(ctx, x, y, r, a, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = col;
  for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * Math.PI / 4); ctx.fillRect(-r * 0.18, -r - 8, r * 0.36, 16); ctx.restore(); }
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2); ctx.fillStyle = '#20264a'; ctx.fill();
  ctx.restore();
}
