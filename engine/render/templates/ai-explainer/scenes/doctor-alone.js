// Scene "doctor-alone" (full frame). Evening clinic office: a cartoon doctor works a case alone at a desk with a
// stack of textbooks and a laptop showing a search page. On aloneCue a spotlight isolates them ("Worked alone");
// on toolsCue books and laptop glow ("Textbooks + internet"); on quoteCue a quote panel (text only; the speaker is
// never drawn) slides in at the top and the doctor looks up at it.
// params: alone, tools, quote (lead-in with the verbatim words in curly quotes), by, aloneCue, toolsCue, quoteCue
// Fits: "what the humans had", test conditions, a leader's framing quote.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tA = at(P.aloneCue, D * 0.1), tT = Math.max(tA + 0.8, at(P.toolsCue, D * 0.3)), tQ = Math.max(tT + 1, at(P.quoteCue, D * 0.6));

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.12, x: 470, y: 860 }, { t: tQ, zoom: 1.06, x: 480, y: 820 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  K.world.room(ctx, { t, time: 'night', wall: '#26394b', floor: '#18222f', window: true, picture: false, lamp: false, plant: true, floorY: 880 });
  K.drawClock(ctx, 230, 700, 0.8, { t, speed: 3 });

  // desk, books, laptop, lamp
  K.drawDesk(ctx, 560, 1040, 1.3);
  const deskTop = 1040 - 110 * 1.3;
  const glowT = K.phase(t, tT, tT + 0.6);
  const books = [['#c95b4a', 120, 30], ['#4f86c6', 130, 26], ['#d9a94f', 112, 34], ['#5aa88a', 124, 28]];
  let by = deskTop;
  books.forEach(([c, w, h], i) => {
    const drop = K.phase(t, 0.1 + i * 0.15, 0.4 + i * 0.15, H.easeOutCubic);
    const yy = by - h - (1 - drop) * 60;
    ctx.save(); ctx.globalAlpha = drop; ctx.translate(420 + (i % 2 ? 6 : -4), yy); ctx.rotate(i % 2 ? 0.03 : -0.04);
    H.roundRect(ctx, -w / 2, 0, w, h, 5); ctx.fillStyle = c; ctx.fill();
    ctx.fillStyle = '#f2ead7'; ctx.fillRect(w / 2 - 10, 4, 6, h - 8);
    ctx.restore();
    by -= h;
  });
  if (glowT > 0) H.glow(ctx, 420, deskTop - 60, 120, ACC, 0.25 * glowT);
  K.drawLaptop(ctx, 660, deskTop, 0.95, { t, screen: 'blank' });
  // search page on the laptop screen
  ctx.save(); ctx.translate(660, deskTop); ctx.scale(0.95, 0.95);
  H.roundRect(ctx, -80, -126, 160, 22, 11); ctx.fillStyle = '#e8eef8'; ctx.fill();
  ctx.strokeStyle = '#4f86c6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(64, -115, 6, 0, Math.PI * 2); ctx.stroke();
  const rows = Math.min(4, Math.max(0, (t - tT) * 4));
  for (let r = 0; r < rows; r++) { ctx.fillStyle = r === 0 ? ACC : 'rgba(230,238,248,0.6)'; ctx.fillRect(-80, -92 + r * 16, 120 - r * 14, 7); }
  ctx.restore();
  if (glowT > 0) H.glow(ctx, 660, deskTop - 80, 130, ACC, 0.22 * glowT);
  K.props.mug(ctx, 770, deskTop, 0.9, t);

  // the doctor, standing at the desk, reading
  const up = t > tQ + 0.3;
  drawDoctor(ctx, K, 260, 1040, 1.35, { t, pose: up ? 'stand' : 'point', mood: up ? 'shocked' : 'neutral', look: up ? 0.3 : 0.9, skin: 2, hair: 0, hairStyle: 'curly', seed: 11 });
  ctx.restore(); // camera

  // spotlight: dim everything but the doctor + desk
  const sp = K.phase(t, tA, tA + 0.8, H.easeInOutCubic) * (1 - 0.5 * K.phase(t, tQ, tQ + 0.8));
  if (sp > 0) {
    ctx.save();
    const g = ctx.createRadialGradient(470, 900, 120, 470, 900, 560);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(4,6,14,${0.62 * sp})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    ctx.restore();
  }

  // pills (left/right of the stage, under the quote area)
  const pa = K.popIn(t, tA, 0.45) * (1 - K.phase(t, tQ - 0.2, tQ + 0.2));
  if (pa > 0) K.drawLabel(ctx, 487, 520, pa, { text: P.alone || 'Worked alone', size: 30, dot: true });
  const pt = K.popIn(t, tT, 0.45) * (1 - K.phase(t, tQ - 0.2, tQ + 0.2));
  if (pt > 0) K.drawLabel(ctx, 487, 590, pt, { text: P.tools || 'Textbooks + internet', size: 30, accent: true });

  // quote panel
  const pq = K.popIn(t, tQ, 0.5);
  if (pq > 0) {
    ctx.save(); ctx.translate(487, 560); ctx.scale(Math.min(1.03, pq), Math.min(1.03, pq)); ctx.translate(-487, -560);
    H.roundRect(ctx, 80, 430, 815, 250, 24); ctx.fillStyle = 'rgba(10,12,24,0.9)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
    ctx.fillStyle = ACC; ctx.font = H.font('display', 90); ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText('“', 104, 430);
    const q = String(P.quote || '“Quote goes here”');
    const i = q.indexOf('“');
    const lead = i > 0 ? q.slice(0, i).trim() : '', main = i >= 0 ? q.slice(i) : q;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.font = H.font('ui', 30); ctx.fillText(lead || '', 487, 480);
    const sz = H.fitText(ctx, main, 'display', 50, 28, 740);
    ctx.font = H.font('display', sz); ctx.fillStyle = '#ffffff';
    const words = main.split(' '), shown = Math.ceil(words.length * clamp((t - tQ - 0.2) / 1.0));
    ctx.fillText(words.slice(0, Math.max(1, shown)).join(' '), 487, 552);
    ctx.fillStyle = ACC; ctx.font = H.font('ui', 26); ctx.fillText('— ' + (P.by || 'Company executive'), 487, 628);
    ctx.restore();
  }
}

// ---- shared bits (duplicated in this story's scenes)
function clinic(ctx, t, K, H, ACC) {
  K.world.room(ctx, { t, time: 'day', wall: '#2c4a5c', floor: '#1d2c3c', window: false, picture: false, lamp: false, plant: true, floorY: 880 });
  // light box with a generic chest x-ray
  H.roundRect(ctx, 600, 600, 250, 190, 12); ctx.fillStyle = '#16212d'; ctx.fill();
  H.roundRect(ctx, 612, 612, 226, 166, 8); ctx.fillStyle = '#cfe6f2'; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
  ctx.fillStyle = '#7d9fb3';
  ctx.beginPath(); ctx.ellipse(690, 695, 38, 62, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(760, 695, 38, 62, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e9f4fa'; ctx.lineWidth = 4;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(660, 655 + i * 24); ctx.quadraticCurveTo(725, 640 + i * 24, 790, 655 + i * 24); ctx.stroke(); }
  // heart monitor on the wall
  H.roundRect(ctx, 150, 600, 230, 140, 14); ctx.fillStyle = '#121a26'; ctx.fill();
  H.roundRect(ctx, 162, 612, 206, 116, 8); ctx.fillStyle = '#0b1f22'; ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.rect(162, 612, 206, 116); ctx.clip();
  ctx.strokeStyle = ACC; ctx.lineWidth = 3; ctx.beginPath();
  for (let x = 0; x <= 206; x += 2) {
    const u = ((x / 206) * 2 - t * 0.8) % 1, v = ((u % 1) + 1) % 1;
    const y = v > 0.45 && v < 0.5 ? -40 * Math.sin((v - 0.45) / 0.05 * Math.PI) : v > 0.5 && v < 0.53 ? 14 : 0;
    if (x === 0) ctx.moveTo(162 + x, 670 + y); else ctx.lineTo(162 + x, 670 + y);
  }
  ctx.stroke(); ctx.restore();
}

function caseFile(ctx, x, y, s, t, K, H, ACC, title) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-0.04);
  H.roundRect(ctx, -95, -150, 70, 26, 8); ctx.fillStyle = '#d9a94f'; ctx.fill();
  H.roundRect(ctx, -95, -135, 190, 135, 10); ctx.fillStyle = '#e8bd62'; ctx.fill();
  ctx.fillStyle = '#f6f1e4'; H.roundRect(ctx, -80, -150, 160, 30, 4); ctx.fill();
  ctx.fillStyle = '#5a3d10'; ctx.font = H.font('bold', 22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(title, 0, -108);
  const q = 1 + 0.08 * Math.sin(t * 4);
  ctx.save(); ctx.translate(0, -52); ctx.scale(q, q);
  ctx.fillStyle = '#7a4f0c'; ctx.font = H.font('display', 58); ctx.fillText('?', 0, 4);
  ctx.restore();
  ctx.restore();
}

function drawDoctor(ctx, K, x, y, s, o) {
  K.drawPerson(ctx, x, y, s, Object.assign({}, o, { shirt: '#eef2f8' }));
  const sit = (o.pose || '').startsWith('sit');
  const shY = (sit ? -78 : -104) - 64;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.flip) ctx.scale(-1, 1);
  // inner shirt strip + lapels
  ctx.fillStyle = '#4f86c6'; ctx.beginPath(); ctx.moveTo(-9, shY + 2); ctx.lineTo(9, shY + 2); ctx.lineTo(4, shY + 46); ctx.lineTo(-4, shY + 46); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#c3cad8'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-9, shY + 2); ctx.lineTo(-2, shY + 60); ctx.moveTo(9, shY + 2); ctx.lineTo(2, shY + 60); ctx.stroke();
  // pocket + pen
  ctx.fillStyle = '#d6dce8'; ctx.fillRect(-26, shY + 34, 14, 12); ctx.fillStyle = '#4f86c6'; ctx.fillRect(-22, shY + 28, 3, 10);
  // stethoscope
  ctx.strokeStyle = '#2b3145'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-12, shY - 2); ctx.bezierCurveTo(-20, shY + 30, 18, shY + 34, 12, shY - 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, shY + 22); ctx.lineTo(16, shY + 40); ctx.stroke();
  ctx.fillStyle = '#b8c2d6'; ctx.beginPath(); ctx.arc(16, shY + 44, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
