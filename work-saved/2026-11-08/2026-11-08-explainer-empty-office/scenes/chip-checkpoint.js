// Scene "chip-checkpoint" (full frame, 1 beat ~10-13 s). Dusk city. A big glowing AI chip rises on a pedestal with a
// name pill; on countCue it shrinks up and a row of N small company buildings pops in along the street, each getting a
// small "cleared" tick, with a count pill; on checkCue a clipboard card drops in with 2 rows of what each licence is
// supposed to check (boxes stay EMPTY: "supposed to", not "done"), and an inspector with a magnifier walks in.
// Nothing is shipped: no arcs from the chip to the buildings.
// Fits: "about N firms were cleared to buy X", export licences, permits that are meant to vet the buyer.
// params: chip ("H200"), chipTag ("One of Nvidia's most advanced"), n (10), count ("About 10 Chinese firms cleared"),
//         card ("Each license should check"), rows (["Who the buyer is", "What it's for"]),
//         cues: tagCue ("advanced"), countCue ("ten"), checkCue ("license"), rowCues (["buyer", "for"])
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const n = Math.max(1, Math.min(12, P.n || 10));
  const rows = P.rows || ['Who the buyer is', "What it's for"];
  const rowCues = P.rowCues || ['buyer', 'for'];
  const tTag = at(P.tagCue || 'advanced', D * 0.28) - 0.4;
  const tCount = at(P.countCue || 'ten', D * 0.47) - 0.5;
  const tCheck = at(P.checkCue || 'license', D * 0.72) - 0.5;
  const tRows = rowCues.map((c, i) => at(c, D * (0.85 + i * 0.07)) - 0.25);
  const GY = 1000;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 700 }, { t: tCount, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.02, x: 487, y: 735 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: GY });

  // ---- the chip: big and central, then shrinks up-left once the firms appear
  const shrink = smooth(clamp((t - tCount) / 0.8));
  const fade = smooth(clamp((t - tCheck) / 0.6));
  const cx = lerp(487, 250, shrink), cy = lerp(700, 560, shrink), cs = lerp(2.4, 1.1, shrink);
  if (fade < 1) {
    ctx.save(); ctx.globalAlpha = 1 - fade;
    // pedestal
    if (shrink < 1) { ctx.globalAlpha = (1 - fade) * (1 - shrink); roundRect(ctx, 487 - 120, 880, 240, 120, 10); ctx.fillStyle = '#3b3a5e'; ctx.fill(); roundRect(ctx, 487 - 140, 862, 280, 30, 10); ctx.fillStyle = '#4c4b75'; ctx.fill(); ctx.globalAlpha = 1 - fade; }
    const rise = smooth(clamp((t + 0.6) / 1.0));
    K.glow(ctx, cx, cy, 180 * cs / 2.4 + 40, ACC, 0.3 + 0.1 * Math.sin(t * 3));
    chip(ctx, H, cx, cy + (1 - rise) * 60 + Math.sin(t * 1.5) * 6, cs, ACC, P.chip || 'H200', t);
    const tp = K.popIn(t, tTag, 0.45);
    if (tp > 0 && shrink < 1) { ctx.globalAlpha = (1 - fade) * (1 - shrink); pill(ctx, H, 487, 500, tp, P.chipTag || "One of Nvidia's most advanced", { accent: true, size: 30 }); }
    ctx.restore();
  }

  // ---- row of company buildings
  if (t > tCount - 0.1) {
    const x0 = 150, x1 = 825;
    for (let i = 0; i < n; i++) {
      const lt = t - tCount - i * 0.12;
      const p = K.popIn(lt, 0, 0.4);
      if (p <= 0) continue;
      const x = n === 1 ? 487 : lerp(x0, x1, i / (n - 1));
      const fl = 3 + Math.floor(H.hash(i, 4) * 4);
      ctx.save(); ctx.translate(x, GY); ctx.scale(1, Math.min(1.05, p)); ctx.translate(-x, -GY);
      K.drawBuilding(ctx, x, GY, 0.3, { t, floors: fl, lit: 0.6, color: ['#5b6aa8', '#6a5aa0', '#4f7a9a'][i % 3] });
      ctx.restore();
      const tk = K.popIn(lt, 0.5, 0.35);
      if (tk > 0) tick(ctx, H, x, GY - (60 + fl * 44) * 0.3 - 30, Math.min(1.05, tk));
    }
    const np = K.popIn(t, tCount + 0.3, 0.45);
    if (np > 0) pill(ctx, H, 560, 790, np, P.count || 'About 10 Chinese firms cleared', { size: 30 });
  }

  // ---- licence checklist card + inspector
  const kp = K.popIn(t, tCheck, 0.5);
  if (kp > 0) {
    const X0 = 175, X1 = 800, Y0 = 450, HH = 250;
    const k = Math.min(1.03, kp);
    ctx.save(); ctx.translate(487, Y0 + HH / 2); ctx.scale(k, k); ctx.translate(-487, -(Y0 + HH / 2));
    roundRect(ctx, X0, Y0, X1 - X0, HH, 22); ctx.fillStyle = 'rgba(12,14,28,0.93)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke();
    // clip
    roundRect(ctx, 437, Y0 - 18, 100, 34, 10); ctx.fillStyle = '#9aa0b4'; ctx.fill();
    const hf = H.fitText(ctx, P.card || 'Each license should check', 'display', 34, 22, X1 - X0 - 60);
    ctx.fillStyle = ACC; ctx.font = hf.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(hf.text, 487, Y0 + 50);
    rows.slice(0, 2).forEach((r, i) => {
      const y = Y0 + 120 + i * 78, lit = K.popIn(t, tRows[i] ?? tCheck, 0.35);
      roundRect(ctx, X0 + 34, y - 24, 48, 48, 10); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = lit > 0 ? ACC : 'rgba(255,255,255,0.35)'; ctx.stroke();
      ctx.globalAlpha = 0.45 + 0.55 * clamp(lit);
      const rf = H.fitText(ctx, r, 'bold', 34, 22, X1 - X0 - 140);
      ctx.fillStyle = '#ffffff'; ctx.font = rf.font; ctx.textAlign = 'left'; ctx.fillText(rf.text, X0 + 106, y + 2);
      ctx.globalAlpha = 1;
      if (lit > 0) { ctx.save(); ctx.globalAlpha = 0.15 * clamp(lit); roundRect(ctx, X0 + 16, y - 34, X1 - X0 - 32, 68, 14); ctx.fillStyle = ACC; ctx.fill(); ctx.restore(); }
    });
    ctx.restore();
    // inspector walks in from the left with a magnifier
    const u = smooth(clamp((t - tCheck - 0.2) / 1.4));
    const ix = lerp(-60, 165, u);
    K.drawPerson(ctx, ix, GY + 30, 1.15, { t, pose: 'point', walk: u < 1 ? t : undefined, mood: 'neutral', look: 0.6, skin: 2, hair: 3, shirt: '#3d4f7a', hairStyle: 'bun', seed: 44 });
    magnifier(ctx, ix + 75, GY - 190 + Math.sin(t * 2) * 6, 0.9);
  }
  ctx.restore();
}

function chip(ctx, H, x, y, s, ACC, label, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#d9b450'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = 0; i < 5; i++) { const o = -36 + i * 18; ctx.beginPath(); ctx.moveTo(o, -62); ctx.lineTo(o, -50); ctx.moveTo(o, 50); ctx.lineTo(o, 62); ctx.moveTo(-62, o); ctx.lineTo(-50, o); ctx.moveTo(50, o); ctx.lineTo(62, o); ctx.stroke(); }
  H.roundRect(ctx, -52, -52, 104, 104, 12); ctx.fillStyle = '#1b2033'; ctx.fill();
  H.roundRect(ctx, -36, -36, 72, 72, 8); ctx.fillStyle = ACC; ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,' + (0.25 + 0.2 * Math.sin(t * 3)) + ')'; ctx.fillRect(-36, -36, 72, 10);
  ctx.fillStyle = '#1b2033'; ctx.font = H.font('display', 20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, 2);
  ctx.restore();
}

function tick(ctx, H, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#3fbf7f'; ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#0d2a1c'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-2, 7); ctx.lineTo(10, -7); ctx.stroke();
  ctx.restore();
}

function magnifier(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.lineWidth = 9; ctx.strokeStyle = '#d9dce6'; ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(200,230,255,0.18)'; ctx.fill();
  ctx.lineWidth = 12; ctx.strokeStyle = '#3a3f52'; ctx.beginPath(); ctx.moveTo(-24, 24); ctx.lineTo(-58, 58); ctx.stroke();
  ctx.restore();
}

function pill(ctx, H, x, y, pop, text, o = {}) {
  const size = o.size || 30;
  ctx.save(); ctx.font = H.font('bold', size);
  const tw = ctx.measureText(text).width, w = tw + size * 1.4, h = size * 1.8;
  const cx = Math.max(130 + w / 2, Math.min(845 - w / 2, x));
  const k = Math.min(1.04, pop);
  ctx.translate(cx, y); ctx.scale(k, k);
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
  ctx.fillStyle = o.accent ? H.kit.ACCENT.base : 'rgba(10,12,22,0.9)'; ctx.fill();
  if (!o.accent) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.stroke(); }
  ctx.fillStyle = o.accent ? H.kit.ACCENT.deep : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 2);
  ctx.restore();
}
