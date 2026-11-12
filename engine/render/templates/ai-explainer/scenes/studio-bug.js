// Scene "studio-bug" (full frame). A small game studio at dusk: two developers at desks, a big playtest monitor on
// the wall showing an abstract landscape (hills, a path, a sky) with a frame-rate meter. A studio name pill and a
// "making <game>" pill land first; on bugCue a cartoon bug crawls onto the monitor; on sunCue the monitor's sun
// rises, the meter drops into the red and a "slower" tag shows; on engCue a phone-call card from an outside
// engineer slides in and its status flips to a red cross ("not possible"); on botCue the card gives way to a chat
// window on the right developer's side and the kit robot (the chatbot) pops out of it with a lit bulb.
// params: studio, game, slow ("50% SLOWER"), engLabel ("Engine engineer"), engSays ("Not possible"),
//         studioCue, gameCue, bugCue, sunCue, engCue, botCue (narration words, "word#n", or seconds)
// Fits: a team stuck on a technical problem, an outside expert can't help, they turn to an AI chatbot.
// Abstract shapes only: no real game's characters, art or look.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const RED = '#ff5e57';
  const tStudio = at(P.studioCue, 0.6) - 0.2, tGame = at(P.gameCue, D * 0.35) - 0.2;
  const tBug = at(P.bugCue, D * 0.48) - 0.3, tSun = at(P.sunCue, D * 0.56) - 0.2;
  const tEng = at(P.engCue, D * 0.68) - 0.3, tBot = at(P.botCue, D * 0.9) - 0.5;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: tBug, zoom: 1.04, x: 420, y: 720 }, { t: tEng, zoom: 1.04, x: 470, y: 720 }, { t: D, zoom: 1.06, x: 560, y: 740 }]);
  K.world.office(ctx, { t, time: 'dusk' });

  // ---- playtest monitor (left)
  const MX0 = 140, MX1 = 560, MY0 = 540, MY1 = 800;
  ctx.fillStyle = '#1c2033'; ctx.fillRect((MX0 + MX1) / 2 - 10, MY1, 20, 40);
  roundRect(ctx, MX0 - 14, MY0 - 14, MX1 - MX0 + 28, MY1 - MY0 + 28, 18); ctx.fillStyle = '#1c2033'; ctx.fill();
  ctx.save(); roundRect(ctx, MX0, MY0, MX1 - MX0, MY1 - MY0, 10); ctx.clip();
  const sunK = H.easeInOutCubic(clamp((t - tSun) / 1.4));
  const g = ctx.createLinearGradient(0, MY0, 0, MY1);
  g.addColorStop(0, H.mixHex('#24305e', '#e88d6a', sunK * 0.8)); g.addColorStop(1, H.mixHex('#3c4a86', '#f6c27a', sunK * 0.8));
  ctx.fillStyle = g; ctx.fillRect(MX0, MY0, MX1 - MX0, MY1 - MY0);
  // sun rising behind hills
  const sx = MX0 + 290, sy = lerp(MY1 - 30, MY0 + 80, sunK);
  ctx.fillStyle = '#ffd36b'; ctx.beginPath(); ctx.arc(sx, sy, 34, 0, Math.PI * 2); ctx.fill();
  K.glow(ctx, sx, sy, 90, '#ffd36b', 0.2 * sunK);
  // hills + a winding path (abstract)
  ctx.fillStyle = '#2f6b5e'; ctx.beginPath(); ctx.moveTo(MX0, MY1); ctx.quadraticCurveTo(MX0 + 120, MY0 + 120, MX0 + 260, MY0 + 190); ctx.quadraticCurveTo(MX0 + 360, MY0 + 150, MX1, MY0 + 170); ctx.lineTo(MX1, MY1); ctx.fill();
  ctx.fillStyle = '#3f8a6f'; ctx.beginPath(); ctx.moveTo(MX0, MY1); ctx.quadraticCurveTo(MX0 + 200, MY0 + 170, MX1, MY0 + 215); ctx.lineTo(MX1, MY1); ctx.fill();
  ctx.strokeStyle = '#e8d9b0'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(MX0 + 150, MY1); ctx.quadraticCurveTo(MX0 + 250, MY0 + 230, MX0 + 330, MY0 + 205); ctx.stroke();
  // long shadows streaking off once the sun is up (the "bug")
  if (sunK > 0.4) {
    ctx.save(); ctx.globalAlpha = clamp((sunK - 0.4) * 2) * 0.55; ctx.fillStyle = '#10142a';
    for (let i = 0; i < 4; i++) { const x = MX0 + 40 + i * 110; ctx.beginPath(); ctx.moveTo(x, MY1 - 20); ctx.lineTo(x + 18, MY1 - 20); ctx.lineTo(x - 260, MY0); ctx.lineTo(x - 300, MY0); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  // frame meter (top right of the screen): bars sag into red as the sun comes up
  const slow = clamp((t - tSun - 0.3) / 0.8);
  roundRect(ctx, MX1 - 150, MY0 + 14, 136, 70, 10); ctx.fillStyle = 'rgba(8,10,22,0.85)'; ctx.fill();
  for (let i = 0; i < 6; i++) {
    const hgt = lerp(40, 12 + 6 * H.hash(i, 4), slow) + Math.sin(t * 9 + i) * 2;
    roundRect(ctx, MX1 - 138 + i * 20, MY0 + 74 - hgt, 13, hgt, 3); ctx.fillStyle = slow > 0.5 ? RED : ACC; ctx.fill();
  }
  ctx.restore();
  // the bug crawling over the screen
  if (t > tBug) {
    const u = clamp((t - tBug) / 2.2), bx = lerp(MX0 + 20, MX0 + 230, H.easeOutCubic(u)) + Math.sin(t * 3) * 6, by = lerp(MY0 + 40, MY0 + 120, u) + Math.sin(t * 5) * 3;
    drawBug(ctx, bx, by, 1.15, t, K.popIn(t, tBug, 0.4));
  }

  // ---- desks + developers
  const DY = 1045;
  K.drawDesk(ctx, 330, DY, 1.05);
  K.drawPerson(ctx, 175, DY, 1.2, { t, pose: t > tSun + 0.3 && t < tBot ? 'sit' : 'sit-laptop', typing: 0.8, mood: t > tSun + 0.5 ? (t > tEng + 0.6 ? 'worried' : 'shocked') : 'happy', look: t > tBug ? -0.6 : 0.6, skin: 1, hair: 2, hairStyle: 'long', shirt: 2, seed: 3 });
  K.drawLaptop(ctx, 350, DY - 116, 0.72, { t, screen: 'code', shadow: false });
  K.drawDesk(ctx, 760, DY, 1.05);
  K.drawPerson(ctx, 605, DY, 1.2, { t, pose: 'sit-laptop', typing: t < tEng ? 1 : 0.4, mood: t > tBot + 0.6 ? 'happy' : t > tEng + 0.6 ? 'worried' : 'neutral', look: t > tBot ? 0.7 : -0.5, skin: 3, hair: 0, hairStyle: 'short', shirt: 0, seed: 7 });
  K.drawLaptop(ctx, 780, DY - 116, 0.72, { t: t - tBot, screen: t > tBot ? 'chat' : 'code', shadow: false });
  K.props.mug(ctx, 870, DY - 110, 0.8, t);
  ctx.restore();

  // ---- overlays
  const sp = K.popIn(t, tStudio, 0.45);
  if (sp > 0) K.drawLabel(ctx, 330, 512, sp, { text: String(P.studio || 'The studio').toUpperCase(), size: 30, accent: true });
  const gp = K.popIn(t, tGame, 0.45);
  const gOut = clamp((t - tBot) / 0.3);
  if (gp > 0 && gOut < 1) { ctx.save(); ctx.globalAlpha = 1 - gOut; K.drawLabel(ctx, 680, 512, gp, { text: 'New game: ' + String(P.game || 'the game'), size: 26, dot: true }); ctx.restore(); }
  const wp = K.popIn(t, tSun + 0.9, 0.4);
  if (wp > 0) K.drawLabel(ctx, 350, 890, wp * (t < tBot ? 1 : 1), { text: String(P.slow || '50% SLOWER'), size: 26 });

  // phone-call card from the outside engineer (right), replaced by the chat window
  const cardIn = H.easeOutCubic(clamp((t - tEng) / 0.5)), cardOut = clamp((t - tBot + 0.1) / 0.35);
  if (cardIn > 0 && cardOut < 1) {
    const X0 = 600 + (1 - cardIn) * 320, Y0 = 560, W = 250, Hh = 210;
    ctx.save(); ctx.globalAlpha = 1 - cardOut;
    roundRect(ctx, X0, Y0, W, Hh, 22); ctx.fillStyle = 'rgba(10,12,24,0.94)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke();
    drawPhoneGlyph(ctx, X0 + 44, Y0 + 48, t);
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#c9d0e6'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const ft = H.fitText(ctx, String(P.engLabel || 'Engine engineer'), 'ui', 24, 16, W - 92); ctx.font = ft.font; ctx.fillText(ft.text, X0 + 80, Y0 + 48);
    const no = clamp((t - tEng - 1.2) / 0.3);
    ctx.font = H.font('display', 30); ctx.fillStyle = no > 0 ? RED : '#ffffff';
    const msg = no > 0 ? String(P.engSays || 'Not possible') : 'Checking...';
    const fm = H.fitText(ctx, msg, 'display', 30, 18, W - 40); ctx.font = fm.font; ctx.fillText(fm.text, X0 + 22, Y0 + 120);
    if (no > 0) { // red cross badge
      ctx.save(); ctx.translate(X0 + W - 46, Y0 + Hh - 46); const s = K.popIn(t, tEng + 1.2, 0.35); ctx.scale(s, s);
      ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(10, 10); ctx.moveTo(10, -10); ctx.lineTo(-10, 10); ctx.stroke();
      ctx.restore();
    } else { // dots while ringing
      for (let i = 0; i < 3; i++) { ctx.fillStyle = rgba('#ffffff', 0.3 + 0.7 * ((Math.floor(t * 4) + i) % 3 === 0)); ctx.beginPath(); ctx.arc(X0 + 34 + i * 22, Y0 + 170, 6, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  }
  // chat window + chatbot robot popping out
  const cw = K.popIn(t, tBot, 0.45);
  if (cw > 0) {
    const X0 = 600, Y0 = 560, W = 260, Hh = 240;
    ctx.save(); ctx.translate(X0 + W / 2, Y0 + Hh); const s = Math.min(1.03, cw); ctx.scale(s, s); ctx.translate(-(X0 + W / 2), -(Y0 + Hh));
    roundRect(ctx, X0, Y0, W, Hh, 20); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    roundRect(ctx, X0, Y0, W, 44, 20); ctx.fillStyle = '#dfe4f1'; ctx.fill(); ctx.fillRect(X0, Y0 + 24, W, 20);
    ['#ff6b5e', '#ffcc33', '#5ad18a'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(X0 + 24 + i * 22, Y0 + 22, 7, 0, Math.PI * 2); ctx.fill(); });
    ctx.font = H.font('ui', 22); ctx.fillStyle = '#3b4672'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('Chatbot', X0 + 100, Y0 + 23);
    // user question bubble, then a reply with a code chip
    const q = K.popIn(t, tBot + 0.3, 0.35);
    if (q > 0) { roundRect(ctx, X0 + 90, Y0 + 62, 150 * Math.min(1, q), 40, 14); ctx.fillStyle = ACC; ctx.fill(); ctx.fillStyle = '#141829'; ctx.font = H.font('display', 28); if (q > 0.8) ctx.fillText('?', X0 + 155, Y0 + 83); }
    const a = K.popIn(t, tBot + 0.75, 0.35);
    if (a > 0) {
      roundRect(ctx, X0 + 18, Y0 + 116, 170 * Math.min(1, a), 92, 14); ctx.fillStyle = '#2a2f45'; ctx.fill();
      ctx.strokeStyle = ACC; ctx.lineWidth = 4; ctx.lineCap = 'round';
      if (a > 0.8) { ctx.beginPath(); ctx.moveTo(X0 + 46, Y0 + 146); ctx.lineTo(X0 + 34, Y0 + 162); ctx.lineTo(X0 + 46, Y0 + 178); ctx.moveTo(X0 + 72, Y0 + 146); ctx.lineTo(X0 + 84, Y0 + 162); ctx.lineTo(X0 + 72, Y0 + 178); ctx.stroke();
        for (let i = 0; i < 3; i++) { roundRect(ctx, X0 + 100, Y0 + 136 + i * 18, 70 - i * 14, 8, 4); ctx.fillStyle = i === 1 ? ACC : '#c9d0e6'; ctx.fill(); } }
    }
    ctx.restore();
    // robot peeks out from behind the window's right edge
    const rp = H.easeOutCubic(clamp((t - tBot - 0.2) / 0.6));
    if (rp > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, Y0 + Hh + 1); ctx.clip();
      K.drawRobot(ctx, X0 + W - 6, Y0 + Hh + 140 - rp * 150, 0.7, { t, state: 'happy', flip: true, seed: 11 });
      ctx.restore();
      const bp = K.popIn(t, tBot + 0.7, 0.4);
      if (bp > 0) K.drawLightbulb(ctx, X0 + W - 6, Y0 - 2, 0.55 * bp, { on: clamp((t - tBot - 0.8) / 0.3), t });
    }
  }
}

function drawBug(ctx, x, y, s, t, pop) {
  if (pop <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * Math.min(1.05, pop), s * Math.min(1.05, pop)); ctx.rotate(0.35);
  ctx.strokeStyle = '#141829'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i++) for (const d of [-1, 1]) { const w = Math.sin(t * 14 + i * 2 + d) * 5; ctx.beginPath(); ctx.moveTo(0, i * 12); ctx.lineTo(d * 30, i * 14 + w); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-6, -24); ctx.lineTo(-14, -40); ctx.moveTo(6, -24); ctx.lineTo(14, -40); ctx.stroke();
  ctx.fillStyle = '#ff5e57'; ctx.beginPath(); ctx.ellipse(0, 4, 18, 24, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#141829'; ctx.beginPath(); ctx.arc(0, -22, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillRect(-1.5, -18, 3, 44);
  ctx.fillStyle = '#141829'; ctx.beginPath(); ctx.arc(-8, 2, 4, 0, Math.PI * 2); ctx.arc(8, 12, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-4, -24, 3, 0, Math.PI * 2); ctx.arc(4, -24, 3, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawPhoneGlyph(ctx, x, y, t) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 18) * 0.08);
  ctx.fillStyle = '#5ad18a'; ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath();
  ctx.ellipse(-7, -7, 6, 9, -0.8, 0, Math.PI * 2); ctx.ellipse(7, 7, 6, 9, -0.8, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-8, -6); ctx.quadraticCurveTo(-6, 6, 6, 8); ctx.stroke();
  ctx.restore();
}
