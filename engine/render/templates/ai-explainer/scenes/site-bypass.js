// Scene "site-bypass" (full frame, 1 beat). Dusk street with a cartoon public-statistics building (columns, sign,
// a small "Download" hatch, a door with a red/green light). A person asks a question in a speech bubble; the kit robot
// walks to the hatch and pulls out a glowing key ring ("server secrets"), flashes a fake pass (ID card with a "?"
// face) at the door, slips inside, and walks out with a tall stack of folders while a big counter shows N years.
// Metaphor only: no code, no technical steps.
// params (all optional): tag ("Another case", top pill), site ("STATISTICS", building sign), ask ("Latest figures?",
//        the person's question), download ("Download"), secrets ("Server secrets"), pass ("Fake pass"),
//        years (10; pass the published number), yearsLabel ("years of data")
//        cues (narration words; without them, fractions of the scene): tagCue, askCue, goCue, secretsCue,
//        downloadCue, passCue, takeCue ("took"), yearsCue
// Fits: an AI agent getting round a website's access checks, taking more data than it was given, scraping.

function drawKey(ctx, x, y, s, rot, color, dark) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = color; ctx.strokeStyle = dark; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(-26, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(-26, 0, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color; ctx.fillRect(-10, -6, 50, 12); ctx.strokeRect(-10, -6, 50, 12);
  ctx.fillRect(26, 6, 8, 12); ctx.fillRect(14, 6, 7, 9);
  ctx.restore();
}

function drawFolders(ctx, H, x, y, n, s) {
  const cols = ['#f2d04f', '#e8c23a', '#f6dd78'];
  for (let i = 0; i < n; i++) {
    const yy = y - i * 16 * s, dx = Math.sin(i * 2.1) * 5 * s;
    H.roundRect(ctx, x - 52 * s + dx, yy - 16 * s, 104 * s, 16 * s, 4 * s); ctx.fillStyle = cols[i % 3]; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(x - 52 * s + dx, yy - 3 * s, 104 * s, 3 * s);
  }
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent, N = K.NEUTRAL;
  const at = (w, d) => { const v = w != null ? info.timeOf(w) : null; return v == null ? d : v; };
  const pill = (text, x, y, a, b, o = {}) => {
    if (t < a || t > b + 0.35) return;
    ctx.save(); ctx.globalAlpha *= K.fadeOut(t, b, 0.35);
    K.drawLabel(ctx, x, y, K.popIn(t, a, 0.4), { text, size: o.size || 26, dot: !o.accent, accent: o.accent });
    ctx.restore();
  };
  const tTag = at(P.tagCue, 0.2), tAsk = at(P.askCue, D * 0.2) - 0.2, tGo = at(P.goCue, D * 0.34);
  const tSec = at(P.secretsCue, D * 0.45) - 0.3, tDl = at(P.downloadCue, D * 0.6), tPass = at(P.passCue, D * 0.7) - 0.1;
  const tTake = at(P.takeCue || 'took', D * 0.85), tYears = at(P.yearsCue, D * 0.9);
  const feet = 1012, HX = 520, DX = 640, BX = 640;
  // robot path: by the person -> hatch -> door -> inside -> out with folders
  const toHatch = K.phase(t, tGo - 0.3, tSec - 0.2), toDoor = K.phase(t, tPass + 0.4, tPass + 1.2);
  const inside = t > tPass + 1.45 && t < tTake - 0.1, outK = K.phase(t, tTake - 0.1, D - 0.3);
  let rx = H.lerp(345, HX - 75, toHatch); rx = H.lerp(rx, DX, toDoor);
  if (t >= tTake - 0.1) rx = H.lerp(DX, 395, outK);
  const walking = (toHatch > 0 && toHatch < 1) || (toDoor > 0 && toDoor < 1) || (outK > 0 && outK < 1);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.18, x: 515, y: 890 }, { t: tSec, zoom: 1.24, x: 525, y: 905 }, { t: D, zoom: 1.22, x: 520, y: 900 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 990 });
  // ---- statistics building
  ctx.save();
  K.shadow(ctx, BX, feet + 4, 420);
  ctx.fillStyle = '#d9d2c4'; H.roundRect(ctx, BX - 175, 742, 350, 270, 6); ctx.fill();
  ctx.fillStyle = '#bdb5a5'; ctx.fillRect(BX + 120, 742, 55, 270);
  ctx.fillStyle = '#e6e0d3'; ctx.beginPath(); ctx.moveTo(BX - 200, 742); ctx.lineTo(BX, 650); ctx.lineTo(BX + 200, 742); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#cfc7b6'; ctx.fillRect(BX - 200, 736, 400, 18);
  for (const cx of [-140, -70, 70, 140]) { ctx.fillStyle = '#efe9dc'; ctx.fillRect(BX + cx - 14, 770, 28, 230); ctx.fillStyle = '#c9c1b0'; ctx.fillRect(BX + cx + 6, 770, 8, 230); }
  ctx.fillStyle = '#c4bba8'; ctx.fillRect(BX - 190, 996, 380, 16);
  // sign on the frieze
  ctx.fillStyle = '#3b4260'; H.roundRect(ctx, BX - 120, 690, 240, 40, 8); ctx.fill();
  const sf = H.fitText(ctx, P.site || 'STATISTICS', 'condensed', 28, 18, 220);
  ctx.fillStyle = '#ffffff'; ctx.font = sf.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(sf.text, BX, 711);
  // little bar-chart emblem
  for (let i = 0; i < 3; i++) { ctx.fillStyle = ACC; ctx.fillRect(BX - 22 + i * 16, 676 - 10 - i * 8, 10, 10 + i * 8); }
  // door with light
  const open = H.clamp(K.phase(t, tPass + 0.75, tPass + 1.05) - K.phase(t, tPass + 1.5, tPass + 1.8) + K.phase(t, tTake - 0.4, tTake - 0.1) - K.phase(t, tTake + 0.5, tTake + 0.8));
  ctx.fillStyle = '#1c2033'; ctx.fillRect(DX - 46, 880, 92, 120);
  ctx.fillStyle = '#ffe7a8'; ctx.globalAlpha = open; ctx.fillRect(DX - 44, 882, 88, 118); ctx.globalAlpha = 1;
  ctx.fillStyle = '#6b4a36'; ctx.fillRect(DX - 46 - open * 40, 880, 46, 120); ctx.fillRect(DX + open * 40, 880, 46, 120);
  const green = t > tPass + 0.55;
  const lc = green ? '#6ee7a8' : '#ff6b5e'; K.glow(ctx, DX, 862, 34, lc, 0.7); ctx.fillStyle = lc; ctx.beginPath(); ctx.arc(DX, 862, 9, 0, Math.PI * 2); ctx.fill();
  // download hatch
  const flash = t > tDl - 0.1 && t < tDl + 0.9 ? 0.5 + 0.5 * Math.sin((t - tDl) * 14) : 0;
  ctx.fillStyle = '#3b4260'; H.roundRect(ctx, HX - 40, 920, 80, 56, 8); ctx.fill();
  ctx.fillStyle = '#121527'; H.roundRect(ctx, HX - 30, 930, 60, 36, 6); ctx.fill();
  ctx.strokeStyle = flash > 0 ? H.mixHex('#9fb0e8', ACC, flash) : '#9fb0e8'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(HX, 936); ctx.lineTo(HX, 958); ctx.moveTo(HX - 9, 950); ctx.lineTo(HX, 959); ctx.lineTo(HX + 9, 950); ctx.stroke();
  ctx.restore();

  // ---- the person who asked
  K.drawPerson(ctx, 250, feet + 8, 1.05, { t, pose: t > tTake ? 'shrug' : 'phone', mood: t > tTake + 0.4 ? 'shocked' : 'neutral', shirt: 1, hair: 2, hairStyle: 'short', seed: 2, talk: t > tAsk && t < tAsk + 1.2 ? info.env : 0 });
  if (t > tAsk && t < tGo + 2.4) {
    ctx.save(); ctx.globalAlpha = K.fadeOut(t, tGo + 2.0, 0.35);
    K.drawSpeechBubble(ctx, 285, 765, 1, { text: P.ask || 'Latest figures?', size: 30, tail: 'left', pop: K.popIn(t, tAsk, 0.4) });
    ctx.restore();
  }
  // ---- robot
  if (!inside) {
    const s = 0.88, by = feet - (walking ? Math.abs(Math.sin(t * 9)) * 6 : 0);
    const carrying = t > tTake - 0.1;
    const reach = t > tSec - 0.2 && t < tPass;
    K.drawRobot(ctx, rx, by, s, { t, state: walking ? 'working' : carrying ? 'happy' : reach ? 'working' : t > tAsk ? 'thinking' : 'idle', seed: 8 });
    if (carrying) {
      const n = Math.round(H.lerp(3, 8, K.phase(t, tTake, tYears + 0.3)));
      drawFolders(ctx, H, rx, by - 48, n, 1.0);
    }
    // glowing key ring pulled out of the hatch
    if (t > tSec && t < tPass + 1.2) {
      const u = K.phase(t, tSec, tSec + 0.6, H.easeOutCubic);
      const kx = H.lerp(HX, rx + 46, u), ky = H.lerp(948, 920, u);
      K.glow(ctx, kx, ky, 70, ACC, 0.5);
      ctx.strokeStyle = '#dfe4f1'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(kx, ky - 6, 13, 0, Math.PI * 2); ctx.stroke();
      for (let i = 0; i < 3; i++) drawKey(ctx, kx + (i - 1) * 8, ky + 18, 0.5, Math.PI / 2 + (i - 1) * 0.45 + Math.sin(t * 4 + i) * 0.08, ACC, '#4a5a12');
    }
    // fake pass card
    if (t > tPass && t < tPass + 1.4) {
      const k = K.popIn(t, tPass, 0.35);
      ctx.save(); ctx.translate(rx + 70, 880); ctx.rotate(-0.15); ctx.scale(k, k);
      H.roundRect(ctx, -46, -32, 92, 64, 8); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      ctx.fillStyle = '#5b6aa8'; ctx.beginPath(); ctx.arc(-20, -4, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = K.font.display(20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', -20, -3);
      ctx.fillStyle = '#c3c9dc'; ctx.fillRect(4, -14, 32, 6); ctx.fillRect(4, 0, 24, 6); ctx.fillStyle = '#ff6b5e'; ctx.fillRect(-40, 18, 80, 6);
      ctx.restore();
    }
  }
  pill(P.download || 'Download', HX + 10, 912, tDl - 0.3, tPass + 0.2, { size: 22 });
  pill(P.secrets || 'Server secrets', HX - 80, 795, tSec + 0.3, tPass - 0.1, { size: 24, accent: true });
  pill(P.pass || 'Fake pass', DX - 60, 795, tPass + 0.1, tPass + 1.4, { size: 24, accent: true });
  ctx.restore();

  // ---- labels (screen space)
  pill(P.tag || 'Another case', 487, 478, tTag, tAsk + 0.4, { size: 28, accent: true });
  if (t > tYears - 0.6) {
    const a = K.popIn(t, tYears - 0.6, 0.45);
    ctx.save(); ctx.translate(600, 480); ctx.scale(a, a);
    H.roundRect(ctx, -200, -95, 400, 175, 24); ctx.fillStyle = 'rgba(10,12,22,0.9)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    const n = Math.round((P.years || 10) * K.phase(t, tYears - 0.6, tYears + 0.2, H.easeOutCubic));
    ctx.fillStyle = ACC; ctx.font = K.font.display(100); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillText(String(n), 0, 22);
    ctx.fillStyle = '#ffffff'; ctx.font = K.font.ui(30); ctx.fillText(P.yearsLabel || 'years of data', 0, 66);
    ctx.restore();
  }
}
