// Scene "hq-report" (full frame; best as a 2-beat span: hook + what happened). A company looks at itself:
// dusk street, a tower with a text name pill (no logo); a small robot on the roof sweeps a magnifier over the
// building's own windows. Beat 2: the camera eases right, a report sheet flies out of a window and lands as a big
// page (title as text, a falling bar chart draws in), a date pill lands, then up to 2 topic chips (person icon /
// robot icon) pop on cue while a worker and a robot step out of the door.
// params: company ("AI LAB"), report ("Report"), date (""), chips (<= 2 strings: first gets a person icon, second a
//         robot icon), reportCue, dateCue, chipCues (2 words)
// Fits: a company publishing a study / audit / report about itself; "the lab checked its own numbers".
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tB = info.beats && info.beats[1] ? info.beats[1].t0 : Math.min(3.2, D * 0.25);
  const tRep = Math.max(tB + 0.2, at(P.reportCue, tB + (D - tB) * 0.35) - 0.5);
  const tDate = Math.max(tB + 0.3, at(P.dateCue, tB + 0.4));
  const chips = (P.chips || ['Who it hires', 'How it uses AI']).slice(0, 2);
  const cc = P.chipCues || [];
  const tChip = chips.map((_, i) => Math.max(tRep + 0.8 + i * 0.6, at(cc[i], tB + (D - tB) * (0.65 + i * 0.15)) - 0.15));

  // ---- camera: wide on the tower, then ease to make room for the report
  const shift = smooth((t - tB) / 1.2);
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: lerp(1.0, 1.05, clamp(t / Math.max(0.5, tB))), x: lerp(500, 487, shift), y: 760 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });

  const BX = lerp(487, 300, shift), BY = 1000, BS = 1.0;
  const bh = (60 + 8 * 44) * BS;
  K.glow(ctx, BX, BY - bh * 0.5, 300, ACC, 0.08 + 0.04 * Math.sin(t * 2));
  K.drawBuilding(ctx, BX, BY, BS, { t, color: '#4d5d9a', floors: 8, lit: 0.6 });

  // ---- roof robot with a magnifier sweeping over the facade
  const roofY = BY - bh - 14;
  const sweep = Math.sin(t * 1.3);
  K.drawRobot(ctx, BX + 70, roofY, 0.55, { t, state: 'thinking', seed: 5 });
  const mx = BX + sweep * 70, my = BY - bh * 0.62 + Math.cos(t * 0.9) * 40;
  ctx.save();
  ctx.strokeStyle = '#d7dcef'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(BX + 70, roofY - 70); ctx.lineTo(mx + 38, my - 38); ctx.stroke();
  ctx.fillStyle = H.rgba(ACC, 0.18); ctx.beginPath(); ctx.arc(mx, my, 54, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 9; ctx.strokeStyle = ACC; ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(mx - 6, my - 6, 36, 3.6, 4.6); ctx.stroke();
  ctx.restore();

  // ---- the door: a worker and a robot step out in beat 2
  if (t > tChip[0] - 0.4) {
    const k = K.phase(t, tChip[0] - 0.4, tChip[0] + 1.2, H.easeOutCubic);
    const walking = k < 1;
    K.drawPerson(ctx, lerp(BX, BX - 150, k), 1040, 1.05, { t, walk: walking ? t : undefined, pose: walking ? 'stand' : 'point', mood: 'happy', shirt: '#4fb3a6', skin: 3, hair: 1, hairStyle: 'curly', flip: false, seed: 2, look: 0.6 });
  }
  if (chips[1] && t > tChip[1] - 0.4) {
    const k = K.phase(t, tChip[1] - 0.4, tChip[1] + 1.2, H.easeOutCubic);
    K.drawRobot(ctx, lerp(BX, BX + 150, k), 1040, 0.85, { t, state: k < 1 ? 'working' : 'happy', seed: 7 });
  }
  ctx.restore(); // camera

  // name pill (screen space, follows the tower)
  const pillX = 487 + (lerp(487, 300, shift) - 487) * 1.02;
  K.drawLabel(ctx, pillX, 1010, 1, { text: P.company || 'AI LAB', size: 28, dot: true });

  // ---- report page flies out of a window and lands on the right
  if (t > tRep) {
    const k = K.phase(t, tRep, tRep + 0.9, H.easeOutBack);
    const sx = lerp(330, 715, k), sy = lerp(640, 690, k), sc = lerp(0.15, 1, clamp(k));
    const rot = lerp(-0.6, -0.04, clamp(k)) + 0.015 * Math.sin(t * 1.5);
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(rot); ctx.scale(sc, sc);
    page(ctx, H, K, t - tRep, P.report || 'Report', ACC);
    ctx.restore();
  }
  // date pill
  if (P.date) {
    const p = K.popIn(t, Math.max(tDate, tRep + 0.7), 0.45);
    if (p > 0) K.drawLabel(ctx, 715, 488, p, { text: P.date, size: 28, accent: true });
  }
  // topic chips
  chips.forEach((c, i) => {
    const p = K.popIn(t, tChip[i], 0.45);
    if (p <= 0) return;
    chip(ctx, H, K, 715, 905 + i * 64, p, c, i === 0 ? 'person' : 'robot', ACC);
  });
}

function page(ctx, H, K, lt, title, ACC) {
  const W = 330, Hh = 380;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  H.roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 14); ctx.fillStyle = '#f4f6fc'; ctx.fill();
  ctx.restore();
  ctx.fillStyle = ACC; ctx.fillRect(-W / 2, -Hh / 2 + 18, 10, 64);
  ctx.fillStyle = '#1b1f36'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  const lines = H.wrap(ctx, title, 'display', 30, W - 70);
  ctx.font = H.font('display', 30);
  lines.slice(0, 3).forEach((ln, i) => ctx.fillText(ln, -W / 2 + 30, -Hh / 2 + 22 + i * 36));
  // text lines
  const ty = -Hh / 2 + 30 + Math.min(3, lines.length) * 36;
  ctx.fillStyle = '#c3c9db';
  for (let i = 0; i < 3; i++) ctx.fillRect(-W / 2 + 30, ty + i * 18, i === 2 ? 150 : W - 60, 7);
  // bar chart: falling bars draw in
  const bx = -W / 2 + 40, by = Hh / 2 - 30, bw = 46, gap = 20;
  const hs = [130, 108, 84, 62, 40];
  ctx.strokeStyle = '#9aa3bd'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx - 10, by); ctx.lineTo(W / 2 - 24, by); ctx.stroke();
  hs.forEach((h, i) => {
    const g = K.phase(lt, 0.7 + i * 0.18, 1.1 + i * 0.18, H.easeOutCubic);
    if (g <= 0) return;
    H.roundRect(ctx, bx + i * (bw + gap), by - h * g, bw, h * g, 6);
    ctx.fillStyle = i === hs.length - 1 ? ACC : '#6f86e0'; ctx.fill();
  });
}

function chip(ctx, H, K, x, y, p, text, icon, ACC) {
  const size = 28;
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.05, p), Math.min(1.05, p));
  const f = H.fitText(ctx, text, 'ui', size, 24, 370);
  ctx.font = f.font;
  const w = Math.min(450, ctx.measureText(f.text).width + 100), h = 54;
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = 'rgba(10,12,24,0.9)'; ctx.fill();
  ctx.lineWidth = 2.5; ctx.strokeStyle = H.rgba(ACC, 0.8); ctx.stroke();
  const ix = -w / 2 + 32;
  ctx.fillStyle = ACC;
  if (icon === 'person') {
    ctx.beginPath(); ctx.arc(ix, -7, 8, 0, Math.PI * 2); ctx.fill();
    H.roundRect(ctx, ix - 12, 3, 24, 13, 6); ctx.fill();
  } else {
    H.roundRect(ctx, ix - 13, -12, 26, 22, 6); ctx.fill();
    ctx.fillStyle = '#10131f'; ctx.fillRect(ix - 8, -5, 5, 5); ctx.fillRect(ix + 3, -5, 5, 5);
    ctx.fillStyle = ACC; ctx.fillRect(ix - 2, -19, 4, 7); ctx.fillRect(ix - 9, 11, 18, 5);
  }
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(f.text, ix + 26, 2);
  ctx.restore();
}
