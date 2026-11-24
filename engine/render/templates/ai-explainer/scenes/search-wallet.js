// Scene "search-wallet" (full frame; added to the library 2026-11-24, from an AI search assistant that can connect to
// a person's own apps). A search assistant (the kit robot) that can be connected to a person's wallet and files: a
// generic cartoon wallet with plain bank cards (no brands), a filing cabinet labelled `cabinet` with doc / sheet / PDF
// cards, app tiles with text names only (no logos), a phone-style settings card with toggles. Generic cartoon people.
// modes:
//   hook     cold open, night home office: `query` typed in a big search window (`chip` in its corner), the robot
//            pulls a card out of the open wallet and it flies into the search window; `connected` pill (by ~2.2 s).
//   connect  three app tiles (walletName / driveName / chatName) under a `product` pill: a padlock on the wallet tile
//            springs open (letCue), `date` pill (dateCue), the wallet cable lights (walletCue) + `now` tag (nowCue);
//            the other two tiles appear dashed (nextCue) with `weeks` tags (weeksCue). Person with a phone, robot.
//   reads    robot between the wallet (left) and the cabinet (right): wallet opens (walletCue), two cards rise into an
//            `accounts` panel (accountsCue); drawer opens (driveCue), doc / sheet / PDF cards fly up (docsCue);
//            `already` strip with mail / calendar / photos tiles that tick on alreadyCues [3].
//   readonly search window (`query2`) with two pitch chips (spendCue, planCue) and doc cards stacking (taxCue); a glass
//            case of coins: the robot reads through it with a magnifier, `readOnly` plate (readCue); `actions` [3]
//            chips get crossed out (moveCue, manageCue, investCue).
//   switch   settings card `settings`: `connected` sub-header highlights (openCue), rows wallet / drive / chat app all
//            OFF, `opt` stamp (optCue); a hand flips the first two ON (pickCue), robot lights up; then both flip OFF
//            (offCue), `offAny` pill.
//   soon     search window with a tailored answer; under it a dashed `iconLabel` slot with "?" (iconCue), dotted ghost
//            links to three dim source tiles (stuffCue), hourglass (whenCue), `soonText` pill (soonCue).
// params: mode, cues above (narration words; "word#n" = n-th occurrence; alreadyCue = alreadyCues[0]), text overrides
//   (generic defaults): product ("AI assistant"), chip ("Ask AI"), query, query2, date ("DATE"), walletName ("Wallet"),
//   driveName ("Files"), cabinet (driveName upper-cased, else "FILES"), chatName ("Chat app"), now, weeks,
//   accounts, already, pitch1, pitch2, readOnly, actions [3], settings ("Personalization"), connected, opt, offAny,
//   iconLabel, soonText. Fits: an AI assistant gaining access to personal data / apps, opt-in permission toggles.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration;
  const { clamp, lerp, smooth, easeOutCubic, roundRect, rgba, mixHex } = H;
  const ACC = info.accent, INK = '#141829', CARD = '#f4f6fb', RED = '#ff5a4e', GREEN = '#3ddc84';
  const mode = P.mode || 'hook';
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const pop = (d, dur) => Math.min(1.04, K.popIn(t, d, dur || 0.45));
  const textFit = (txt, kind, size, maxW, min = 18) => { let fs = size; ctx.font = H.font(kind, fs); while (fs > min && ctx.measureText(txt).width > maxW) { fs -= 1; ctx.font = H.font(kind, fs); } return fs; };
  const scaleAt = (x, y, s, fn) => { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); fn(); ctx.restore(); };

  // ---------------------------------------------------------------- pieces
  // bank card (generic): centre anchored, ~170x108 at s 1
  const bankCard = (x, y, s, color, rot = 0, alpha = 1) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha *= alpha;
    roundRect(ctx, -82, -50, 170, 108, 14); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
    roundRect(ctx, -85, -54, 170, 108, 14); ctx.fillStyle = color; ctx.fill();
    ctx.fillStyle = mixHex(color, '#ffffff', 0.25); ctx.fillRect(-85, -30, 170, 14);
    roundRect(ctx, -66, -6, 34, 26, 5); ctx.fillStyle = '#f0c95a'; ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-14 + i * 12, 34, 4, 0, Math.PI * 2); ctx.fill(); }
    roundRect(ctx, 40, 28, 30, 12, 6); ctx.fill();
    ctx.restore();
  };
  // wallet ~280x190 at s 1, bottom-centre; open 0..1 raises the cards out of it
  const wallet = (x, y, s, open = 0, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 300);
    if (o.glow) K.glow(ctx, 0, -100, 220, ACC, 0.3 * o.glow);
    roundRect(ctx, -140, -190, 280, 190, 26); ctx.fillStyle = '#7a4b33'; ctx.fill();
    // cards peeking out (rise with open)
    const cols = ['#4f7cff', '#e0705a', '#2fb08a'];
    for (let i = 0; i < 3; i++) {
      const lift = (24 + i * 4) + open * (70 - i * 18);
      ctx.save(); ctx.translate(-70 + i * 66, -150 - lift + 60); ctx.rotate((i - 1) * 0.08 * (0.4 + open));
      roundRect(ctx, -58, -40, 116, 80, 10); ctx.fillStyle = cols[i]; ctx.fill();
      roundRect(ctx, -44, -22, 26, 20, 4); ctx.fillStyle = '#f0c95a'; ctx.fill();
      ctx.restore();
    }
    // front pocket
    roundRect(ctx, -146, -132, 292, 132, 24); ctx.fillStyle = '#93603f'; ctx.fill();
    ctx.setLineDash([10, 9]); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,230,200,0.55)';
    roundRect(ctx, -130, -118, 260, 104, 16); ctx.stroke(); ctx.setLineDash([]);
    // clasp
    roundRect(ctx, 96, -96, 56, 44, 14); ctx.fillStyle = '#5e3824'; ctx.fill();
    ctx.fillStyle = '#e8c27a'; ctx.beginPath(); ctx.arc(120, -74, 9, 0, Math.PI * 2); ctx.fill();
    if (o.label) {
      ctx.fillStyle = 'rgba(255,240,220,0.95)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      textFit(o.label, 'display', 34, 200); ctx.fillText(o.label, -10, -62);
    }
    ctx.restore();
  };
  // file card kinds: doc | sheet | pdf. centre anchored, ~130x165 at s 1
  const fileCard = (x, y, s, kind, rot = 0, alpha = 1) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); ctx.globalAlpha *= alpha;
    roundRect(ctx, -60, -76, 130, 165, 12); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-65, -82); ctx.lineTo(35, -82); ctx.lineTo(65, -52); ctx.lineTo(65, 82); ctx.lineTo(-65, 82); ctx.closePath();
    ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(35, -82); ctx.lineTo(35, -52); ctx.lineTo(65, -52); ctx.closePath(); ctx.fillStyle = '#d5dae8'; ctx.fill();
    const tag = { doc: '#4f7cff', sheet: '#2fb08a', pdf: RED }[kind] || '#4f7cff';
    if (kind === 'sheet') {
      ctx.strokeStyle = '#9fd8c3'; ctx.lineWidth = 3;
      for (let r = 0; r < 5; r++) { ctx.beginPath(); ctx.moveTo(-48, -34 + r * 20); ctx.lineTo(48, -34 + r * 20); ctx.stroke(); }
      for (let c = 0; c < 4; c++) { ctx.beginPath(); ctx.moveTo(-48 + c * 32, -34); ctx.lineTo(-48 + c * 32, 46); ctx.stroke(); }
      ctx.fillStyle = tag; ctx.fillRect(-48, -54, 96, 14);
    } else {
      for (let r = 0; r < 5; r++) { roundRect(ctx, -48, -50 + r * 20, r === 4 ? 56 : 96, 9, 4); ctx.fillStyle = '#c9cfe0'; ctx.fill(); }
    }
    roundRect(ctx, -48, 52, 70, 24, 8); ctx.fillStyle = tag; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('ui', 17); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(kind === 'pdf' ? 'PDF' : kind === 'sheet' ? 'SHEET' : 'DOC', -13, 64);
    ctx.restore();
  };
  // filing cabinet ~220x330 at s 1, bottom-centre (adapted from gemini-switch.js)
  const cabinet = (x, y, s, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 260);
    roundRect(ctx, -110, -330, 220, 330, 14); ctx.fillStyle = '#56607f'; ctx.fill();
    ctx.fillStyle = '#4a5372'; ctx.fillRect(40, -322, 62, 316);
    roundRect(ctx, -118, -342, 236, 22, 8); ctx.fillStyle = '#6b7596'; ctx.fill();
    roundRect(ctx, -94, -150, 188, 130, 10); ctx.fillStyle = '#65709a'; ctx.fill();
    roundRect(ctx, -34, -96, 68, 14, 7); ctx.fillStyle = '#c9cfe0'; ctx.fill();
    const op = o.open || 0, dy = 30 * op, ds = 1 + 0.06 * op;
    if (op > 0.01) {
      roundRect(ctx, -100, -314, 200, 150, 10); ctx.fillStyle = '#20253a'; ctx.fill();
      for (let i = 0; i < 3; i++) { roundRect(ctx, -84 + i * 10, -300 + dy * 0.4 + i * 3, 168 - i * 20, 70, 6); ctx.fillStyle = i % 2 ? '#e9ecf6' : '#ffffff'; ctx.fill(); }
    }
    ctx.save(); ctx.translate(0, -240 + dy); ctx.scale(ds, ds);
    roundRect(ctx, -94, -70, 188, 140, 10); ctx.fillStyle = '#7480a8'; ctx.fill();
    const hl = o.hl || 0;
    if (hl > 0) K.glow(ctx, 0, -24, 120, ACC, 0.45 * hl);
    roundRect(ctx, -80, -52, 160, 54, 8); ctx.fillStyle = hl > 0.5 ? ACC : '#f2f4fa'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = '#3b4260'; ctx.stroke();
    ctx.fillStyle = hl > 0.5 ? K.ACCENT.deep : INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    textFit(o.label || 'FILES', 'display', 32, 146); ctx.fillText(o.label || 'FILES', 0, -24);
    roundRect(ctx, -34, 28, 68, 14, 7); ctx.fillStyle = '#c9cfe0'; ctx.fill();
    ctx.restore();
    ctx.restore();
  };
  // search window: dark card with a white search pill, typed query, `chip` in the corner
  const searchWin = (x0, y0, w, h, query, shown, o = {}) => {
    roundRect(ctx, x0 + 8, y0 + 12, w, h, 30); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    roundRect(ctx, x0, y0, w, h, 30); ctx.fillStyle = '#1c2033'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = o.glow ? rgba(ACC, 0.4 + 0.6 * o.glow) : '#3b4260'; ctx.stroke();
    for (let i = 0; i < 3; i++) { ctx.fillStyle = ['#ff6b5e', '#ffc24a', '#3ddc84'][i]; ctx.beginPath(); ctx.arc(x0 + 34 + i * 26, y0 + 30, 8, 0, Math.PI * 2); ctx.fill(); }
    // assistant chip
    const chip = o.chip || P.chip || 'Ask AI';
    ctx.font = H.font('ui', 24); const cw = ctx.measureText(chip).width + 40;
    roundRect(ctx, x0 + w - cw - 22, y0 + 12, cw, 38, 19); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = K.ACCENT.deep; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(chip, x0 + w - cw / 2 - 22, y0 + 32);
    // search pill
    const py = y0 + 66, ph = 74;
    roundRect(ctx, x0 + 22, py, w - 44, ph, ph / 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.strokeStyle = '#59607a'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(x0 + 66, py + ph / 2 - 3, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0 + 75, py + ph / 2 + 6); ctx.lineTo(x0 + 86, py + ph / 2 + 17); ctx.stroke();
    const q = query.slice(0, Math.max(0, Math.floor(shown)));
    ctx.fillStyle = INK; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    textFit(query, 'ui', 32, w - 170); ctx.fillText(q, x0 + 104, py + ph / 2 + 1);
    if (shown < query.length && Math.floor(t * 3) % 2 === 0) { const qw = ctx.measureText(q).width; ctx.fillStyle = INK; ctx.fillRect(x0 + 106 + qw, py + 18, 3, ph - 36); }
    return { inX: x0 + w / 2, inY: py + ph + 30, bodyY: py + ph + 22 };
  };
  const answerBars = (x0, y, w, n, p) => {
    for (let i = 0; i < n; i++) {
      const k = clamp((p * n) - i); if (k <= 0) break;
      roundRect(ctx, x0, y + i * 30, (w * (i === n - 1 ? 0.6 : 0.92 - 0.08 * (i % 2))) * k, 14, 7);
      ctx.fillStyle = i === 0 ? rgba(ACC, 0.9) : 'rgba(255,255,255,0.5)'; ctx.fill();
    }
  };
  const toggle = (x, y, on, s = 1, glowOn = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (glowOn > 0) K.glow(ctx, 0, 0, 70, GREEN, 0.35 * glowOn);
    roundRect(ctx, -42, -25, 84, 50, 25); ctx.fillStyle = on > 0.5 ? GREEN : '#c3c9da'; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(lerp(-17, 17, on), 0, 20, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  };
  // app icon tile glyphs: wallet | drive (folder) | chat | mail | calendar | photos
  const glyph = (kind, x, y, s = 1, alpha = 1) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= alpha;
    const bg = { wallet: '#93603f', drive: '#4f7cff', chat: '#7b61ff', mail: '#e0705a', calendar: '#2fb08a', photos: '#ffb53d' }[kind] || '#59607a';
    roundRect(ctx, -34, -34, 68, 68, 18); ctx.fillStyle = bg; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (kind === 'wallet') { roundRect(ctx, -20, -12, 40, 28, 6); ctx.fill(); ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(10, 2, 4, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#ffffff'; roundRect(ctx, -16, -20, 30, 10, 3); ctx.fill(); }
    else if (kind === 'drive') { ctx.beginPath(); ctx.moveTo(-22, -16); ctx.lineTo(-4, -16); ctx.lineTo(2, -9); ctx.lineTo(22, -9); ctx.lineTo(22, 18); ctx.lineTo(-22, 18); ctx.closePath(); ctx.fill(); }
    else if (kind === 'chat') { ctx.beginPath(); roundRect(ctx, -22, -18, 44, 30, 10); ctx.fill(); ctx.beginPath(); ctx.moveTo(-10, 10); ctx.lineTo(-14, 22); ctx.lineTo(2, 12); ctx.fill(); }
    else if (kind === 'mail') { ctx.strokeRect(-20, -14, 40, 28); ctx.beginPath(); ctx.moveTo(-20, -14); ctx.lineTo(0, 4); ctx.lineTo(20, -14); ctx.stroke(); }
    else if (kind === 'calendar') { ctx.strokeRect(-18, -14, 36, 32); ctx.fillRect(-18, -14, 36, 9); for (let a = 0; a < 3; a++) for (let b = 0; b < 2; b++) ctx.fillRect(-12 + a * 10, 0 + b * 8, 5, 5); }
    else if (kind === 'photos') { ctx.strokeRect(-20, -16, 40, 32); ctx.beginPath(); ctx.moveTo(-16, 12); ctx.lineTo(-4, -2); ctx.lineTo(4, 6); ctx.lineTo(10, 0); ctx.lineTo(16, 12); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(8, -8, 4, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  };
  const appTile = (x, y, w, h, kind, name, o = {}) => {
    ctx.save(); ctx.globalAlpha *= o.alpha == null ? 1 : o.alpha;
    if (o.glow) K.glow(ctx, x, y, w * 0.8, ACC, 0.35 * o.glow);
    roundRect(ctx, x - w / 2 + 6, y - h / 2 + 10, w, h, 24); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    roundRect(ctx, x - w / 2, y - h / 2, w, h, 24); ctx.fillStyle = o.dashed ? 'rgba(244,246,251,0.14)' : CARD; ctx.fill();
    if (o.dashed) { ctx.setLineDash([12, 10]); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.7)'; roundRect(ctx, x - w / 2, y - h / 2, w, h, 24); ctx.stroke(); ctx.setLineDash([]); }
    glyph(kind, x, y - 22, 1, o.dashed ? 0.75 : 1);
    ctx.fillStyle = o.dashed ? '#ffffff' : INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    textFit(name, 'display', 30, w - 24); ctx.fillText(name, x, y + 44);
    ctx.restore();
  };
  const hand = (x, y, press, alpha = 1) => {
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(x, y + 8 * press); ctx.rotate(-0.35);
    ctx.fillStyle = '#eab894'; ctx.strokeStyle = '#7a4a30'; ctx.lineWidth = 3;
    roundRect(ctx, -11, -10, 22, 50, 11); ctx.fill(); ctx.stroke();
    roundRect(ctx, -22, 26, 56, 60, 18); ctx.fill(); ctx.stroke();
    ctx.restore();
  };
  const magnifier = (x, y, s) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = '#3b4260'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(36, 36); ctx.lineTo(80, 80); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 50, 0, Math.PI * 2); ctx.fillStyle = 'rgba(180,220,255,0.22)'; ctx.fill();
    ctx.lineWidth = 9; ctx.strokeStyle = '#3b4260'; ctx.stroke();
    ctx.beginPath(); ctx.arc(-14, -16, 14, Math.PI * 1.1, Math.PI * 1.6); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 5; ctx.stroke();
    ctx.restore();
  };
  const xMark = (x, y, r, k) => {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.08, k), Math.min(1.08, k));
    ctx.strokeStyle = RED; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-r, -r); ctx.lineTo(r, r); ctx.moveTo(r, -r); ctx.lineTo(-r, r); ctx.stroke();
    ctx.restore();
  };
  const pill = (x, y, k, text, o = {}) => { if (k > 0) K.drawLabel(ctx, x, y, k, Object.assign({ text, size: 30 }, o)); };
  const arcPos = (x0, y0, x1, y1, u, h) => [lerp(x0, x1, u), lerp(y0, y1, u) - Math.sin(u * Math.PI) * h];
  const cable = (x0, y0, x1, y1, on, o = {}) => {
    ctx.save();
    const mx = (x0 + x1) / 2, my = Math.max(y0, y1) + 40;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo(mx, my, x1, y1);
    ctx.lineWidth = 7; ctx.lineCap = 'round';
    if (o.dashed) { ctx.setLineDash([14, 14]); ctx.lineDashOffset = 0; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.stroke(); ctx.setLineDash([]); }
    else { ctx.strokeStyle = rgba(ACC, 0.25 + 0.6 * on); ctx.stroke(); }
    if (!o.dashed && on > 0.5) {
      for (let i = 0; i < 3; i++) {
        const u = ((t * 0.7 + i / 3) % 1);
        const qx = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1, qy = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(qx, qy, 7, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  };
  const room = (cam) => {
    K.camera(ctx, t, cam || [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 490, y: 730 }]);
    return K.world.room(ctx, { t, time: 'night', floorY: 1000, window: true, lamp: true, picture: false, plant: false, wall: '#232845', wallS: '#1d2140' });
  };

  ctx.save();
  // ================================================================ modes
  if (mode === 'hook') {
    // the action is already under way at frame 0: wallet open, card emerging
    const query = P.query || 'Help me trim my spending';
    room([{ t: 0, zoom: 1.04, x: 500, y: 740 }, { t: D, zoom: 1.08, x: 500, y: 740 }]);
    const tFly = 0.55, tLand = 1.35, tPill = 1.6;
    // desk + laptop + person (left)
    K.drawDesk(ctx, 290, 1035, 1.0);
    K.drawLaptop(ctx, 275, 925, 0.75, { t, screen: 'chat', typing: true });
    K.drawPerson(ctx, 165, 1035, 1.1, { t, pose: 'point', mood: t > tLand ? 'shocked' : 'neutral', skin: 3, hair: 1, shirt: 2, hairStyle: 'curly', seed: 11, look: 1 });
    // wallet on a small table (right) and the robot reaching into it
    roundRect(ctx, 640, 905, 280, 18, 8); ctx.fillStyle = '#3b4260'; ctx.fill();
    ctx.fillStyle = '#2c3150'; ctx.fillRect(660, 920, 14, 115); ctx.fillRect(886, 920, 14, 115);
    wallet(780, 905, 0.82, 0.55 + 0.45 * smooth(t / 0.5), { glow: smooth((t - tLand) / 0.4) });
    K.drawRobot(ctx, 520, 1035, 1.15, { t, state: t < tLand ? 'working' : 'happy', seed: 4 });
    // search window (top)
    const win = searchWin(130, 420, 720, 250, query, query.length, { glow: smooth((t - tLand) / 0.3) });
    answerBars(160, win.bodyY + 22, 560, 3, smooth((t - tLand) / 0.6));
    // the card flies from the wallet into the search window
    if (t < tLand + 0.25) {
      const u = H.phase(t, tFly, tLand, easeOutCubic);
      const [cx, cy] = arcPos(770, 800, 640, 610, u, 120);
      bankCard(cx, cy, lerp(0.9, 0.45, u), '#4f7cff', lerp(-0.2, 0.1, u), 1 - smooth((t - tLand) / 0.25));
    } else {
      bankCard(780, 618, 0.4, '#4f7cff', 0.05);
    }
    // read-only eye: robot's beam on the card while it rides
    pill(487, 720, pop(tPill), P.connected || 'Wallet connected', { accent: true, dot: true });
  } else if (mode === 'connect') {
    const tLet = at(P.letCue, 0.2), tDate = at(P.dateCue, 1.0) - 0.15, tWal = at(P.walletCue, 4.6) - 0.3, tNow = at(P.nowCue, 6.2) - 0.2;
    const tNext = at(P.nextCue, 7.3) - 0.35, tWeeks = at(P.weeksCue, 9.8) - 0.3;
    room();
    pill(487, 448, pop(0.05), P.product || 'AI assistant', { accent: true });
    pill(487, 520, pop(tDate), P.date || 'DATE', {});
    const tiles = [
      { x: 265, kind: 'wallet', name: P.walletName || 'Wallet', on: true },
      { x: 487, kind: 'drive', name: P.driveName || 'Files' },
      { x: 709, kind: 'chat', name: P.chatName || 'Chat app' },
    ];
    const TY = 700, TW = 205, TH = 165;
    // robot (right, under the tiles) + person with a phone (left)
    const RX = 640, RY = 1035;
    K.drawPerson(ctx, 250, 1035, 1.0, { t, pose: 'phone', mood: t > tNow ? 'happy' : 'neutral', skin: 3, hair: 1, shirt: 2, hairStyle: 'curly', seed: 11, look: 1 });
    // cables first (behind tiles)
    const won = smooth((t - tWal) / 0.4);
    cable(tiles[0].x, TY + TH / 2, RX - 20, RY - 250, won);
    const nk = smooth((t - tNext) / 0.4);
    if (nk > 0) { ctx.save(); ctx.globalAlpha = nk; cable(tiles[1].x, TY + TH / 2, RX, RY - 255, 0, { dashed: true }); cable(tiles[2].x, TY + TH / 2, RX + 20, RY - 250, 0, { dashed: true }); ctx.restore(); }
    K.drawRobot(ctx, RX, RY, 1.0, { t, state: t > tWal + 0.3 ? 'happy' : 'idle', seed: 4 });
    // tiles
    const k0 = pop(0.0, 0.4);
    if (k0 > 0) scaleAt(tiles[0].x, TY, k0, () => appTile(0, 0, TW, TH, 'wallet', tiles[0].name, { glow: won }));
    if (nk > 0) {
      for (let i = 1; i < 3; i++) { const k = pop(tNext + (i - 1) * 0.15, 0.4); if (k > 0) scaleAt(tiles[i].x, TY, k, () => appTile(0, 0, TW, TH, tiles[i].kind, tiles[i].name, { dashed: true })); }
    }
    // padlock over the wallet tile, springs open on "let"
    const lockOpen = smooth((t - tLet) / 0.35), lockGone = smooth((t - tLet - 0.9) / 0.4);
    if (lockGone < 1) { ctx.save(); ctx.globalAlpha = 1 - lockGone; K.drawLock(ctx, tiles[0].x + 92, TY - 30 - 30 * lockGone, 0.6, { open: lockOpen }); ctx.restore(); }
    // tags
    pill(tiles[0].x, TY - TH / 2 - 26, pop(tNow), P.now || 'Now', { accent: true, dot: true, size: 24 });
    const wk = pop(tWeeks);
    if (wk > 0) { pill(tiles[1].x, TY - TH / 2 - 26, wk, P.weeks || 'Next weeks', { size: 24 }); pill(tiles[2].x, TY - TH / 2 - 26, pop(tWeeks + 0.15), P.weeks || 'Next weeks', { size: 24 }); }
  } else if (mode === 'reads') {
    const tW = at(P.walletCue, 1.6) - 0.3, tA = at(P.accountsCue, 3.1) - 0.3, tDr = at(P.driveCue, 4.2) - 0.3, tDocs = at(P.docsCue, 4.8) - 0.2;
    const tAl = at(P.alreadyCue, 7.4) - 0.3;
    room();
    // wallet (left, on a stool) + cabinet (right) + robot (centre)
    roundRect(ctx, 100, 880, 260, 18, 8); ctx.fillStyle = '#3b4260'; ctx.fill();
    ctx.fillStyle = '#2c3150'; ctx.fillRect(122, 896, 14, 140); ctx.fillRect(324, 896, 14, 140);
    const wOpen = smooth((t - tW) / 0.5);
    wallet(230, 880, 0.78, wOpen, { glow: wOpen * (1 - smooth((t - tDr) / 0.5)) });
    const dOpen = smooth((t - tDr) / 0.5);
    cabinet(770, 1035, 0.78, { open: dOpen, label: P.cabinet || (P.driveName ? String(P.driveName).toUpperCase() : 'FILES'), hl: dOpen });
    const lookRight = t > tDr;
    K.drawRobot(ctx, 495, 1035, 0.98, { t, state: 'thinking', flip: !lookRight, seed: 4 });
    // linked-accounts panel (left, top)
    const pa = pop(tA - 0.1, 0.4);
    if (pa > 0) {
      scaleAt(300, 560, pa, () => { roundRect(ctx, -170, -120, 340, 240, 26); ctx.fillStyle = 'rgba(14,16,28,0.88)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = rgba(ACC, 0.6); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; textFit(P.accounts || 'Linked accounts', 'display', 32, 300); ctx.fillText(P.accounts || 'Linked accounts', 0, -80); });
    }
    for (let i = 0; i < 2; i++) {
      const u = H.phase(t, tA + i * 0.25, tA + i * 0.25 + 0.7, easeOutCubic);
      if (u <= 0) continue;
      const [cx, cy] = arcPos(200 + i * 60, 790, 235 + i * 130, 600, u, 80);
      bankCard(cx, cy, lerp(0.5, 0.72, u), i ? '#e0705a' : '#4f7cff', (i ? 0.08 : -0.08) * u);
    }
    // files panel (right, top)
    const pf = pop(tDocs - 0.1, 0.4);
    if (pf > 0) {
      scaleAt(680, 560, pf, () => { roundRect(ctx, -185, -120, 370, 240, 26); ctx.fillStyle = 'rgba(14,16,28,0.88)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = rgba(ACC, 0.6); ctx.stroke(); });
    }
    ['doc', 'sheet', 'pdf'].forEach((k, i) => {
      const tt = tDocs + [0, 1.0, 1.45][i];
      const u = H.phase(t, tt, tt + 0.6, easeOutCubic);
      if (u <= 0) return;
      const [cx, cy] = arcPos(770, 760, 572 + i * 108, 575, u, 90);
      fileCard(cx, cy, lerp(0.4, 0.78, u), k, (i - 1) * 0.06 * u);
    });
    // already-in strip
    const sa = pop(tAl - 0.15, 0.4);
    if (sa > 0) {
      scaleAt(487, 738, sa, () => {
        roundRect(ctx, -300, -52, 600, 104, 52); ctx.fillStyle = 'rgba(14,16,28,0.9)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; textFit(P.already || 'Already in:', 'ui', 28, 190); ctx.fillText(P.already || 'Already in:', -272, 1);
      });
      ['mail', 'calendar', 'photos'].forEach((k, i) => {
        const cue = (P.alreadyCues || [P.alreadyCue, 'Calendar', 'Photos'])[i];
        const kk = pop(at(cue, tAl + i * 0.6) - 0.2, 0.35);
        if (kk > 0) { glyph(k, 487 - 30 + i * 92, 738, 0.78 * Math.min(1, kk)); const tk = clamp((t - at(cue, tAl + i * 0.6) - 0.1) / 0.25); if (tk > 0) { ctx.save(); ctx.fillStyle = GREEN; ctx.beginPath(); ctx.arc(487 - 30 + i * 92 + 26, 738 - 26, 13 * tk, 0, Math.PI * 2); ctx.fill(); ctx.restore(); } }
      });
    }
  } else if (mode === 'readonly') {
    const tS = at(P.spendCue, 1.5) - 0.3, tTax = at(P.taxCue, 3.4) - 0.2, tPlan = at(P.planCue, 6.2) - 0.3, tR = at(P.readCue, 7.5) - 0.3;
    const tM = [at(P.moveCue, 9.3), at(P.manageCue, 9.7), at(P.investCue, 10.2)].map((v) => v - 0.15);
    room();
    // search window with two pitch chips
    const win = searchWin(110, 420, 760, 280, P.query2 || 'Ask the assistant', (P.query2 || 'Ask the assistant').length);
    const chips = [{ text: P.pitch1 || 'Trim everyday spending', at: tS }, { text: P.pitch2 || 'Tax-season plan', at: tPlan }];
    const fadeP = 1 - smooth((t - tR - 0.2) / 0.35);
    ctx.save(); ctx.globalAlpha = fadeP;
    chips.forEach((c, i) => {
      const k = pop(c.at, 0.4); if (k <= 0 || fadeP <= 0) return;
      const cy = win.bodyY + 38 + i * 70;
      scaleAt(140 + 20, cy, Math.min(1, k), () => {
        ctx.font = H.font('display', 30); const w = ctx.measureText(c.text).width + 80;
        roundRect(ctx, 0, -28, w, 56, 28); ctx.fillStyle = i ? 'rgba(255,255,255,0.14)' : rgba(ACC, 0.95); ctx.fill();
        ctx.fillStyle = i ? '#ffffff' : K.ACCENT.deep; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(c.text, 54, 1);
        ctx.fillStyle = i ? ACC : K.ACCENT.deep; ctx.beginPath(); ctx.arc(28, 0, 9, 0, Math.PI * 2); ctx.fill();
      });
    });
    // scattered files fly into a neat stack next to the plan chip
    [[-0.3, 140, 900], [0.25, 360, 980], [-0.15, 880, 940]].forEach(([r, sx, sy], i) => {
      const tt = tTax + i * 0.4;
      const u = H.phase(t, tt, tt + 0.8, easeOutCubic);
      if (t < tt - 0.1) { // lying scattered on the floor before
        if (t > tTax - 0.6) fileCard(sx, sy, 0.55, ['doc', 'sheet', 'pdf'][i], r, smooth((t - tTax + 0.6) / 0.4));
        return;
      }
      const [cx, cy] = arcPos(sx, sy, 760 + i * 8, win.bodyY + 92 - i * 6, u, 160);
      fileCard(cx, cy, lerp(0.55, 0.5, u), ['doc', 'sheet', 'pdf'][i], lerp(r, 0.04 * (i - 1), u));
    });
    ctx.restore();
    // glass case of coins (bottom right) + robot reading through it
    const CX = 680, CY = 1035;
    K.shadow(ctx, CX, CY, 300);
    roundRect(ctx, CX - 150, CY - 40, 300, 40, 10); ctx.fillStyle = '#3b4260'; ctx.fill();
    for (let i = 0; i < 9; i++) K.drawCoin(ctx, CX - 100 + (i % 5) * 50 + (i > 4 ? 25 : 0), CY - 40 - (i > 4 ? 46 : 0), 0.7, { spin: t * 1.5 + i });
    roundRect(ctx, CX - 140, CY - 230, 280, 190, 14); ctx.fillStyle = 'rgba(180,220,255,0.16)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(200,230,255,0.7)'; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(CX - 110, CY - 210); ctx.lineTo(CX - 60, CY - 160); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 5; ctx.stroke();
    const rk = pop(tR, 0.45);
    K.drawRobot(ctx, 330, 1035, 1.1, { t, state: t > tR ? 'thinking' : 'working', seed: 4 });
    const mx = lerp(420, CX - 30, smooth((t - tR + 0.5) / 0.6));
    magnifier(mx, CY - 150 + Math.sin(t * 2) * 6, 0.9);
    if (rk > 0) { K.drawLock(ctx, CX + 112, CY - 222, 0.5 * Math.min(1, rk), { open: 0 }); pill(CX, CY - 120, rk, P.readOnly || 'READ ONLY', { accent: true, size: 28 }); }
    // move / manage / invest chips, crossed out on cue
    const acts = P.actions || ['Move', 'Manage', 'Invest'];
    acts.forEach((a, i) => {
      const k = pop(tM[i] - 0.15, 0.35); if (k <= 0) return;
      const x = 165 + i * 0, y = 790 + i * 0;
      const cx = 490 + (i - 1) * 190, cy = win.bodyY + 62;
      scaleAt(cx, cy + 0, Math.min(1, k), () => {
        ctx.font = H.font('display', 34); const w = ctx.measureText(a).width + 56;
        roundRect(ctx, -w / 2, -32, w, 64, 32); ctx.fillStyle = CARD; ctx.fill();
        ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(a, 0, 1);
        const xk = clamp((t - tM[i] - 0.1) / 0.25);
        if (xk > 0) { ctx.strokeStyle = RED; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w / 2 + 10, 0); ctx.lineTo(-w / 2 + 10 + (w - 20) * xk, 0); ctx.stroke(); }
      });
    });
  } else if (mode === 'switch') {
    const tOpt = at(P.optCue, 1.8) - 0.15, tOpen = at(P.openCue, 6.6) - 0.3, tPick = at(P.pickCue, 7.6) - 0.3, tOff = at(P.offCue, 9.8) - 0.3;
    room();
    const X0 = 140, X1 = 835, Y0 = 430, W = X1 - X0, Hh = 376;
    // card frame
    roundRect(ctx, X0 + 8, Y0 + 12, W, Hh, 34); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    roundRect(ctx, X0 - 12, Y0 - 12, W + 24, Hh + 24, 40); ctx.fillStyle = '#1c2033'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#3b4260'; ctx.stroke();
    roundRect(ctx, X0, Y0, W, Hh, 30); ctx.fillStyle = CARD; ctx.fill();
    ctx.save(); roundRect(ctx, X0, Y0, W, Hh, 30); ctx.clip(); ctx.fillStyle = '#262b45'; ctx.fillRect(X0, Y0, W, 92); ctx.restore();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; textFit(P.settings || 'Personalization', 'display', 34, W - 190); ctx.fillText(P.settings || 'Personalization', X0 + 30, Y0 + 47);
    // "Connected Apps" sub-header highlights on openCue
    const oh = smooth((t - tOpen) / 0.3);
    if (oh > 0) { roundRect(ctx, X0 + 16, Y0 + 104, W - 32, 56, 18); ctx.fillStyle = rgba(ACC, 0.35 * oh); ctx.fill(); }
    ctx.fillStyle = '#3b4672'; ctx.font = H.font('ui', 28); ctx.fillText((P.connected || 'Connected Apps') + '  ›', X0 + 34, Y0 + 133);
    const rows = [{ k: 'wallet', n: P.walletName || 'Wallet' }, { k: 'drive', n: P.driveName || 'Files' }, { k: 'chat', n: P.chatName || 'Chat app' }];
    const onK = (i) => { if (i > 1) return 0; const a = smooth((t - tPick - i * 0.45) / 0.25); const b = smooth((t - tOff - i * 0.45) / 0.25); return a * (1 - b); };
    rows.forEach((r, i) => {
      const y = Y0 + 204 + i * 74;
      if (i) { ctx.fillStyle = '#dde1ec'; ctx.fillRect(X0 + 30, y - 40, W - 60, 2); }
      glyph(r.k, X0 + 66, y, 0.72);
      ctx.fillStyle = INK; ctx.font = H.font('ui', 32); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(r.n, X0 + 116, y + 1);
      const on = onK(i);
      toggle(X1 - 80, y, on, 1, on);
    });
    // hand: goes to the toggles to switch on, then back to switch off
    const handIn = smooth((t - tPick + 0.6) / 0.5) * (1 - smooth((t - tPick - 1.4) / 0.5)) + smooth((t - tOff + 0.6) / 0.5) * (1 - smooth((t - tOff - 1.4) / 0.5));
    if (handIn > 0.01) {
      const phaseOff = t > tOff - 0.6;
      const base = phaseOff ? tOff : tPick;
      const row = t > base + 0.45 ? 1 : 0;
      const tx = X1 - 80 + (phaseOff ? 18 : -18), ty = Y0 + 204 + row * 74 + 10;
      const press = Math.max(0, Math.sin(clamp((t - base - row * 0.45 + 0.05) / 0.25) * Math.PI));
      hand(lerp(1000, tx, handIn), lerp(1180, ty, handIn), press, Math.min(1, handIn * 1.5));
    }
    // OPT-IN stamp
    if (t > tOpt) K.drawStamp(ctx, X1 - 80, Y0 + 92, 0.5, { kind: 'check', text: P.opt || 'OPT-IN', land: clamp((t - tOpt) / 0.5) });
    // person + robot below
    const anyOn = onK(0);
    K.drawPerson(ctx, 230, 1035, 0.86, { t, pose: 'phone', mood: t > tOff ? 'happy' : 'neutral', skin: 3, hair: 1, shirt: 2, hairStyle: 'curly', seed: 11, look: 1 });
    K.drawRobot(ctx, 740, 1035, 0.8, { t, state: anyOn > 0.5 ? 'happy' : 'idle', seed: 4 });
    if (anyOn > 0.05) { ctx.save(); ctx.globalAlpha = anyOn; cable(X1 - 80, Y0 + Hh + 6, 740, 1035 - 180, 1); ctx.restore(); }
    pill(487, 880, pop(tOff + 0.35), P.offAny || 'Off any time', { accent: true, dot: true });
  } else if (mode === 'soon') {
    const tI = at(P.iconCue, 2.9) - 0.3, tSt = at(P.stuffCue, 6.0) - 0.3, tWh = at(P.whenCue, 7.4) - 0.2, tSo = at(P.soonCue, 9.2) - 0.25;
    room();
    const win = searchWin(110, 420, 760, 370, P.query || 'Help me trim my spending', 99);
    answerBars(150, win.bodyY + 20, 600, 4, smooth(t / 0.9));
    // dashed icon slot under the answer
    const SX = 175, SY = win.bodyY + 160;
    const ik = pop(tI, 0.45);
    if (ik > 0) {
      scaleAt(SX, SY - 18, Math.min(1, ik), () => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 4);
        ctx.setLineDash([9, 8]); ctx.lineWidth = 4; ctx.strokeStyle = rgba(ACC, 0.6 + 0.4 * pulse); roundRect(ctx, -32, -32, 64, 64, 16); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = ACC; ctx.font = H.font('display', 40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 2);
        ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; textFit(P.iconLabel || 'Personalization', 'ui', 28, 300); ctx.fillText(P.iconLabel || 'Personalization', 50, 1);
      });
    }
    // ghost links to three dim source tiles
    const sk = smooth((t - tSt) / 0.5);
    if (sk > 0) {
      ['wallet', 'drive', 'mail'].forEach((k, i) => {
        const gx = 560 + i * 100, gy = SY - 18;
        ctx.save(); ctx.globalAlpha = sk;
        ctx.setLineDash([6, 8]); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(SX + 260, SY - 18); ctx.lineTo(gx - 36, gy); ctx.stroke(); ctx.setLineDash([]);
        glyph(k, gx, gy, 0.7 * (0.85 + 0.15 * sk), 0.55);
        ctx.restore();
      });
    }
    // person at laptop (left) + robot thinking (right)
    K.drawDesk(ctx, 300, 1035, 1.0);
    K.drawLaptop(ctx, 300, 925, 0.75, { t, screen: 'chat', typing: true });
    K.drawPerson(ctx, 165, 1035, 1.05, { t, pose: 'shrug', mood: 'neutral', skin: 3, hair: 1, shirt: 2, hairStyle: 'curly', seed: 11, look: 1 });
    K.drawRobot(ctx, 760, 1035, 1.0, { t, state: 'thinking', seed: 4 });
    // hourglass + COMING SOON
    const hk = pop(tWh, 0.45);
    if (hk > 0) {
      const HX = 530, HY = 935;
      scaleAt(HX, HY, 0.85 * Math.min(1, hk), () => {
        const flow = clamp((t - tWh) / Math.max(1, D - tWh));
        ctx.save(); ctx.rotate(Math.sin(t * 2) * 0.04);
        ctx.fillStyle = '#8a76e0'; roundRect(ctx, -60, -110, 120, 18, 8); ctx.fill(); roundRect(ctx, -60, 92, 120, 18, 8); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-46, -92); ctx.lineTo(46, -92); ctx.lineTo(8, 0); ctx.lineTo(46, 92); ctx.lineTo(-46, 92); ctx.lineTo(-8, 0); ctx.closePath();
        ctx.fillStyle = 'rgba(200,230,255,0.25)'; ctx.fill(); ctx.strokeStyle = 'rgba(220,235,255,0.8)'; ctx.lineWidth = 4; ctx.stroke();
        // sand
        const top = 1 - 0.7 * flow;
        ctx.fillStyle = ACC;
        ctx.beginPath(); ctx.moveTo(-40 * top, -6 - 80 * top); ctx.lineTo(40 * top, -6 - 80 * top); ctx.lineTo(4, -4); ctx.lineTo(-4, -4); ctx.closePath(); ctx.fill();
        const bot = 0.3 + 0.7 * flow;
        ctx.beginPath(); ctx.moveTo(-42, 90); ctx.lineTo(42, 90); ctx.lineTo(42 * (1 - bot * 0.8), 90 - 60 * bot); ctx.lineTo(-42 * (1 - bot * 0.8), 90 - 60 * bot); ctx.closePath(); ctx.fill();
        ctx.fillRect(-2, -4, 4, 90);
        ctx.restore();
      });
    }
    pill(530, 845, pop(tSo), P.soonText || 'COMING SOON', { accent: true, dot: true });
  }
  ctx.restore();
}
