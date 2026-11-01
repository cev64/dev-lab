// Scene "voter-chat" (full frame). A voter on the sofa at night asks a generic chat app for a voter guide.
// modes:
//   open   (cold open, ~3.4 s): the chat window is already up; the guide card's map draws its district lines, the
//          card highlights "your district", the pin drops into a different district and a red sticky note
//          ("WRONG DISTRICT") slaps onto the map; the voter on the sofa goes from neutral to shocked.
//   source (~13 s): the room dims; the chat's answer shows a "Source" chip; a small text-only voter website window
//          pops up with an "AI-built" tag and a dotted link from the chip; a ZIP -> district lookup card points the
//          arrow into the wrong district, a red sticky note slaps on, a red dot runs back along the link and the
//          chat's guide gets a red mark; a panel counts up to `pct` with a meter and `pctLabel`.
// Fits: chatbots repeating errors from the pages they cite, AI answers built on bad sources, voter/civic info.
// Generic app UI, no logos, no real places (the map is abstract).
// Defaults are generic placeholders; pass the story's names and published figures.
// params: mode, ask, title, wrong, site, zip, pct ("50%"), pctLabel, cues: siteCue, zipCue, pctCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, mixHex, rgba } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const RED = '#ff6b5e', mode = P.mode || 'open';

  // ---------- helpers
  function chatWindow(x, y, w, h, title) {
    K.shadow(ctx, x + w / 2, y + h + 14, w * 0.9, 0.35);
    roundRect(ctx, x, y, w, h, 26); ctx.fillStyle = '#1c2033'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#3b4260'; ctx.stroke();
    ctx.save(); roundRect(ctx, x, y, w, h, 26); ctx.clip();
    ctx.fillStyle = '#2a2f45'; ctx.fillRect(x, y, w, 58); ctx.restore();
    // avatar: tiny robot head
    roundRect(ctx, x + 18, y + 12, 36, 34, 10); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    roundRect(ctx, x + 23, y + 20, 26, 14, 6); ctx.fillStyle = '#161927'; ctx.fill();
    ctx.fillStyle = ACC; ctx.fillRect(x + 28, y + 25, 5, 5); ctx.fillRect(x + 39, y + 25, 5, 5);
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#e8ecf8'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(title, x + 68, y + 30);
  }
  function userBubble(rightX, y, text, p) {
    if (p <= 0) return;
    ctx.save(); ctx.font = H.font('ui', 24);
    const w = ctx.measureText(text).width + 40, h = 52;
    ctx.translate(rightX - w / 2, y + h / 2); ctx.scale(p, p); ctx.translate(-(rightX - w / 2), -(y + h / 2));
    roundRect(ctx, rightX - w, y, w, h, 22); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = mixHex(ACC, '#000000', 0.7); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, rightX - w / 2, y + h / 2 + 1);
    ctx.restore();
  }
  // abstract map with 4 districts split by two wavy lines; returns region centres
  function districtMap(x, y, w, h, o) {
    const cxL = (u) => x + w * (0.5 + 0.08 * Math.sin(u * 5.2 + 0.4)); // vertical split x at height fraction u
    const cyL = (u) => y + h * (0.52 + 0.1 * Math.sin(u * 4.1 + 1.3)); // horizontal split y at width fraction u
    ctx.save(); roundRect(ctx, x, y, w, h, 18); ctx.clip();
    ctx.fillStyle = '#2d3a5c'; ctx.fillRect(x, y, w, h);
    // highlight region (index 0..3: TL, TR, BL, BR) as a polygon approximation
    const region = (k) => {
      ctx.beginPath();
      const left = k % 2 === 0, top = k < 2;
      // scanline fill on a 4 px grid (the region edges are wavy lines)
      for (let yy = y; yy < y + h; yy += 4) {
        for (let xx = x; xx < x + w; xx += 4) {
          const u = (xx - x) / w, v = (yy - y) / h;
          const isTop = yy < cyL(u), isLeft = xx < cxL(v);
          if (isTop === top && isLeft === left) ctx.rect(xx, yy, 4.5, 4.5);
        }
      }
    };
    const tints = ['#34446b', '#2f3d62', '#2b3859', '#37466e'];
    for (let k = 0; k < 4; k++) { region(k); ctx.fillStyle = tints[k]; ctx.fill(); }
    if (o.hi != null && o.hiA > 0) { region(o.hi); ctx.fillStyle = rgba(ACC, 0.55 * o.hiA); ctx.fill(); }
    // lines draw on
    const pv = [], ph = [];
    for (let i = 0; i <= 30; i++) { const u = i / 30; pv.push([cxL(u), y + h * u]); ph.push([x + w * u, cyL(u)]); }
    ctx.strokeStyle = '#f2f4fa'; ctx.lineWidth = 5; ctx.setLineDash([14, 9]); ctx.lineCap = 'round';
    K.pathDraw(ctx, ph, o.draw); K.pathDraw(ctx, pv, o.draw); ctx.setLineDash([]);
    ctx.restore();
    roundRect(ctx, x, y, w, h, 18); ctx.lineWidth = 3; ctx.strokeStyle = '#5a6690'; ctx.stroke();
    return [[x + w * 0.25, y + h * 0.27], [x + w * 0.76, y + h * 0.27], [x + w * 0.24, y + h * 0.8], [x + w * 0.77, y + h * 0.78]];
  }
  function pin(px, py, drop, label) {
    if (drop <= 0) return;
    const dy = (1 - clamp(drop)) * -160, sq = drop > 1 ? 1 : 1;
    const a = clamp(drop * 3);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(px, py + dy);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, -dy + 2, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-26, -34, -26, -66, 0, -66); ctx.bezierCurveTo(26, -66, 26, -34, 0, 0);
    ctx.fillStyle = '#f2f4fa'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#161927'; ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -44, 9, 0, Math.PI * 2); ctx.fillStyle = '#161927'; ctx.fill();
    if (label) { ctx.font = H.font('ui', 22); ctx.textAlign = 'center'; ctx.fillStyle = '#f2f4fa'; ctx.textBaseline = 'alphabetic'; ctx.fillText(label, 0, -76); }
    ctx.restore(); void sq;
  }
  function sticky(cx, cy, w, h, text, land, rot = -0.09) {
    if (land <= 0) return;
    const e = clamp(land / 0.35), sc = 1 + 0.9 * Math.pow(1 - H.easeOutCubic(e), 2);
    ctx.save(); ctx.globalAlpha = clamp(land / 0.15); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(sc, sc);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; roundRect(ctx, -w / 2 + 8, -h / 2 + 10, w, h, 8); ctx.fill();
    roundRect(ctx, -w / 2, -h / 2, w, h, 8); ctx.fillStyle = RED; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-w * 0.18, -h / 2 - 10, w * 0.36, 22); // tape
    const lines = String(text).split(' ');
    const two = lines.length > 1 ? [lines.slice(0, Math.ceil(lines.length / 2)).join(' '), lines.slice(Math.ceil(lines.length / 2)).join(' ')] : [text];
    let fs = 36; ctx.font = H.font('display', fs);
    while (fs > 22 && Math.max(...two.map((l) => ctx.measureText(l).width)) > w - 30) { fs -= 2; ctx.font = H.font('display', fs); }
    ctx.fillStyle = '#2a0b08'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    two.forEach((l, i) => ctx.fillText(l, 0, (i - (two.length - 1) / 2) * fs * 1.1 + 2));
    ctx.restore();
  }

  if (mode === 'open') {
    const tHi = 0.35, tPin = 0.75, tSlap = 1.2;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 600, y: 720 }]);
    K.cameraShake(ctx, t, tSlap + 0.1, 0.3, 9);
    const room = K.world.livingRoomNight(ctx, { t, lampOn: true });
    const fy = room.sofa.feetY;
    K.glow(ctx, 330, 800, 140, ACC, 0.25 + 0.08 * Math.sin(t * 6));
    K.drawPerson(ctx, 300, fy, 1.5, { pose: 'sit-phone', seat: false, t, typing: t < 0.5 ? 1 : 0,
      mood: t > tSlap + 0.15 ? 'shocked' : 'neutral', skin: 1, hair: 2, shirt: 3, hairStyle: 'curly', seed: 21, look: 0.8 });
    ctx.fillStyle = 'rgba(8,10,24,0.28)'; ctx.fillRect(0, 0, 1080, 1920);
    const X = 448, Y = 440, W = 462, Hh = 545;
    ctx.save(); ctx.translate(0, K.bob(t, 3, 0.4));
    chatWindow(X, Y, W, Hh, 'AI chat');
    userBubble(X + W - 20, Y + 76, P.ask || 'Make my voter guide', 1);
    // guide card
    const gx = X + 20, gy = Y + 148, gw = W - 40, gh = Hh - 168;
    roundRect(ctx, gx, gy, gw, gh, 18); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.font = H.font('bold', 30); ctx.fillStyle = '#161927'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(P.title || 'Your voter guide', gx + 22, gy + 44);
    // "your district" row
    const hiA = clamp((t - tHi) / 0.25);
    roundRect(ctx, gx + 22, gy + 62, 230, 38, 19); ctx.fillStyle = mixHex(ACC, '#f2f4fa', 1 - hiA); ctx.fill();
    ctx.font = H.font('ui', 22); ctx.fillStyle = '#161927'; ctx.textBaseline = 'middle';
    ctx.fillText('Your district', gx + 40, gy + 82);
    for (let i = 0; i < 2; i++) { roundRect(ctx, gx + 270, gy + 70 + i * 16, 140 - i * 40, 9, 4); ctx.fillStyle = '#c4cbe0'; ctx.fill(); }
    const mx = gx + 22, my = gy + 118, mw = gw - 44, mh = gh - 140;
    const C = districtMap(mx, my, mw, mh, { draw: clamp(0.45 + t / 0.5), hi: 1, hiA });
    pin(C[2][0], C[2][1] + 30, clamp((t - tPin) / 0.3), 'YOU');
    // dashed arrow from highlight to pin = mismatch
    if (t > tSlap - 0.2) {
      const a = clamp((t - tSlap + 0.2) / 0.3);
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = RED; ctx.lineWidth = 5; ctx.setLineDash([10, 8]);
      ctx.beginPath(); ctx.moveTo(C[1][0], C[1][1]); ctx.quadraticCurveTo((C[1][0] + C[2][0]) / 2, C[1][1] - 10, C[2][0] + 30, C[2][1] - 20); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
    sticky(C[1][0] - 10, C[1][1] + 70, 250, 120, P.wrong || 'WRONG DISTRICT', (t - tSlap) / 0.6);
    ctx.restore();
    return;
  }

  // ---------------------------------------------------------------- mode: source
  const tSite = at(P.siteCue, D * 0.2) - 0.2;
  const tZip = at(P.zipCue, D * 0.52) - 0.5;
  const tBack = tZip + 2.0;
  const tPct = at(P.pctCue, D * 0.8) - 0.4;
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 490, y: 740 }]);
  const room = K.world.livingRoomNight(ctx, { t, lampOn: true });
  K.drawPerson(ctx, 300, room.sofa.feetY, 1.5, { pose: 'sit-phone', seat: false, t, typing: 0,
    mood: t > tBack ? 'worried' : 'neutral', skin: 1, hair: 2, shirt: 3, hairStyle: 'curly', seed: 21, look: 0.6 });
  ctx.restore();
  ctx.fillStyle = 'rgba(8,10,24,0.6)'; ctx.fillRect(0, 0, 1080, 1920);

  // chat window (left)
  const cx0 = 70, cy0 = 450, cw = 400, ch = 390;
  const pIn = K.popIn(t, 0, 0.4);
  ctx.save(); ctx.translate(cx0 + cw / 2, cy0 + ch / 2); ctx.scale(pIn, pIn); ctx.translate(-(cx0 + cw / 2), -(cy0 + ch / 2));
  chatWindow(cx0, cy0, cw, ch, 'AI chat');
  userBubble(cx0 + cw - 18, cy0 + 72, P.ask || 'Make my voter guide', 1);
  const gx = cx0 + 18, gy = cy0 + 140, gw = cw - 36, gh = 170;
  roundRect(ctx, gx, gy, gw, gh, 16); ctx.fillStyle = '#f2f4fa'; ctx.fill();
  ctx.font = H.font('bold', 26); ctx.fillStyle = '#161927'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.fillText(P.title || 'Your voter guide', gx + 18, gy + 38);
  const bad = clamp((t - tBack - 0.4) / 0.3);
  roundRect(ctx, gx + 18, gy + 56, 200, 34, 17); ctx.fillStyle = bad > 0 ? mixHex('#f2f4fa', RED, bad) : mixHex(ACC, '#f2f4fa', 0.35); ctx.fill();
  ctx.font = H.font('ui', 21); ctx.fillStyle = '#161927'; ctx.textBaseline = 'middle'; ctx.fillText('Your district', gx + 34, gy + 74);
  if (bad > 0) { ctx.save(); ctx.globalAlpha = bad; ctx.strokeStyle = RED; ctx.lineWidth = 7; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(gx + 246, gy + 56); ctx.lineTo(gx + 280, gy + 90); ctx.moveTo(gx + 280, gy + 56); ctx.lineTo(gx + 246, gy + 90); ctx.stroke(); ctx.restore(); }
  for (let i = 0; i < 2; i++) { roundRect(ctx, gx + 18, gy + 108 + i * 22, 300 - i * 90, 10, 5); ctx.fillStyle = '#c4cbe0'; ctx.fill(); }
  // source chip
  const chipX = cx0 + 18, chipY = cy0 + ch - 64, chipW = 150;
  const chipA = clamp((t - tSite + 0.3) / 0.3);
  roundRect(ctx, chipX, chipY, chipW, 44, 22); ctx.fillStyle = '#2a2f45'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = mixHex('#3b4260', ACC, chipA); ctx.stroke();
  ctx.font = H.font('ui', 22); ctx.fillStyle = '#e8ecf8'; ctx.textAlign = 'center'; ctx.fillText('Source', chipX + chipW / 2, chipY + 23);
  ctx.restore();

  // website window (right)
  const sx0 = 520, sy0 = 486, sw = 390, sh = 280;
  const sp = K.popIn(t, tSite, 0.45);
  if (sp > 0) {
    ctx.save(); ctx.translate(sx0 + sw / 2, sy0 + sh); ctx.scale(sp, sp); ctx.translate(-(sx0 + sw / 2), -(sy0 + sh));
    K.shadow(ctx, sx0 + sw / 2, sy0 + sh + 12, sw * 0.9, 0.35);
    roundRect(ctx, sx0, sy0, sw, sh, 20); ctx.fillStyle = '#e9ecf6'; ctx.fill();
    ctx.save(); roundRect(ctx, sx0, sy0, sw, sh, 20); ctx.clip(); ctx.fillStyle = '#c9cfe2'; ctx.fillRect(sx0, sy0, sw, 50); ctx.restore();
    ['#ff6b5e', '#ffcc33', '#9aa3c0'].forEach((c, i) => { ctx.beginPath(); ctx.arc(sx0 + 24 + i * 22, sy0 + 25, 7, 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill(); });
    roundRect(ctx, sx0 + 96, sy0 + 12, sw - 112, 26, 13); ctx.fillStyle = '#f5f7fc'; ctx.fill();
    ctx.font = H.font('display', 30); ctx.fillStyle = '#161927'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('VOTER GUIDE', sx0 + 22, sy0 + 98);
    for (let i = 0; i < 4; i++) { roundRect(ctx, sx0 + 22, sy0 + 122 + i * 24, (sw - 60) * (i % 2 ? 0.7 : 0.92), 11, 5); ctx.fillStyle = '#b9c1d6'; ctx.fill(); }
    // AI-built tag with a spinning gear
    const tagY = sy0 + sh - 52;
    roundRect(ctx, sx0 + 22, tagY, 170, 38, 19); ctx.fillStyle = '#161927'; ctx.fill();
    ctx.save(); ctx.translate(sx0 + 46, tagY + 19); ctx.rotate(t * 2.2); ctx.fillStyle = ACC;
    for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.fillRect(-3, -14, 6, 8); }
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fillStyle = '#161927'; ctx.fill(); ctx.restore();
    ctx.font = H.font('ui', 21); ctx.fillStyle = '#f2f4fa'; ctx.textBaseline = 'middle'; ctx.fillText('AI-built', sx0 + 68, tagY + 20);
    ctx.restore();
    // site name pill above
    const lp = K.popIn(t, tSite + 0.35, 0.4);
    if (lp > 0) K.drawLabel(ctx, sx0 + sw / 2, sy0 - 4, lp, { text: P.site || 'One AI-built voter site', size: 24, dot: true });
  }
  // dotted link chip -> site
  const linkP = clamp((t - tSite - 0.4) / 0.6);
  const pts = K.bezier(chipX + chipW, chipY + 22, chipX + chipW + 160, chipY + 30, sx0 - 70, sy0 + sh - 20, sx0 + 6, sy0 + sh - 40, 40);
  if (linkP > 0) {
    ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.setLineDash([4, 12]); ctx.lineCap = 'round'; ctx.lineDashOffset = -t * 30;
    K.pathDraw(ctx, pts, linkP); ctx.restore();
  }

  // ZIP lookup card (under the site)
  const zp = K.popIn(t, tZip, 0.45);
  const zx = 520, zy = 792, zw = 390, zh = 228;
  if (zp > 0) {
    ctx.save(); ctx.translate(zx + zw / 2, zy); ctx.scale(zp, zp); ctx.translate(-(zx + zw / 2), -zy);
    roundRect(ctx, zx, zy, zw, zh, 18); ctx.fillStyle = '#1c2033'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#3b4260'; ctx.stroke();
    // ZIP box
    roundRect(ctx, zx + 18, zy + 22, 116, 56, 12); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.font = H.font('display', 28); ctx.fillStyle = '#161927'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.zip || 'ZIP', zx + 76, zy + 51);
    const C = districtMap(zx + 170, zy + 18, zw - 188, zh - 36, { draw: 1, hi: null, hiA: 0 });
    // arrow from ZIP box swinging into the wrong district
    const sw0 = clamp((t - tZip - 0.4) / 0.7);
    const target = [lerp(C[2][0], C[1][0], H.easeOutBack(sw0)), lerp(C[2][1], C[1][1], H.easeOutBack(sw0))];
    ctx.strokeStyle = sw0 >= 1 ? RED : '#f2f4fa'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(zx + 136, zy + 51); ctx.lineTo(target[0], target[1]); ctx.stroke();
    const ang = Math.atan2(target[1] - (zy + 51), target[0] - (zx + 136));
    ctx.beginPath(); ctx.moveTo(target[0], target[1]); ctx.lineTo(target[0] - 18 * Math.cos(ang - 0.5), target[1] - 18 * Math.sin(ang - 0.5));
    ctx.moveTo(target[0], target[1]); ctx.lineTo(target[0] - 18 * Math.cos(ang + 0.5), target[1] - 18 * Math.sin(ang + 0.5)); ctx.stroke();
    pin(C[2][0], C[2][1] + 22, clamp((t - tZip - 0.2) / 0.3), '');
    ctx.restore();
    sticky(zx + 96, zy + 170, 150, 84, 'WRONG', (t - tZip - 1.2) / 0.6, 0.08);
  }
  // red dot runs back along the link
  if (t > tZip + 1.4 && t < tBack + 0.5) {
    const u = clamp((t - tZip - 1.4) / (tBack + 0.4 - tZip - 1.4));
    const p = K.pathPoint(pts.slice().reverse(), H.easeInOutCubic(u));
    K.glow(ctx, p[0], p[1], 34, RED, 0.6); ctx.beginPath(); ctx.arc(p[0], p[1], 11, 0, Math.PI * 2); ctx.fillStyle = RED; ctx.fill();
  }

  // percentage panel (bottom left)
  const pp = K.popIn(t, tPct, 0.45);
  if (pp > 0) {
    const px = 70, py = 862, pw = 420, ph = 168;
    ctx.save(); ctx.translate(px + pw / 2, py + ph / 2); ctx.scale(pp, pp); ctx.translate(-(px + pw / 2), -(py + ph / 2));
    roundRect(ctx, px, py, pw, ph, 22); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    const target = parseFloat(String(P.pct || '50%')) || 50;
    const v = K.countUp(target, t, tPct + 0.15, 0.9, 0);
    ctx.font = H.font('display', 76); ctx.fillStyle = '#161927'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(`${v}%`, px + 24, py + 86);
    const mw = pw - 48, fill = clamp((t - tPct - 0.15) / 0.9) * target / 100;
    roundRect(ctx, px + 24, py + 104, mw, 16, 8); ctx.fillStyle = '#d5dae8'; ctx.fill();
    if (fill > 0) { roundRect(ctx, px + 24, py + 104, Math.max(16, mw * fill), 16, 8); ctx.fillStyle = mixHex(ACC, '#000000', 0.15); ctx.fill(); }
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#3b4672'; ctx.fillText(P.pctLabel || 'of answers cited it', px + 24, py + 150);
    ctx.restore();
  }
}
