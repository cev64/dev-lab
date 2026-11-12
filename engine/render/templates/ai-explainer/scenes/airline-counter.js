// Scene "airline-counter" (full frame). Generic airport terminal at dusk (big windows, a plain grey plane tail with no
// livery, a departures board). An AI agent robot at an airline check-out counter; the airline is a text name pill only
// (no logo, no livery). modes:
//   hook  (cold open, ~3 s, action from frame 0): the robot already holds a big boarding pass up to the counter; a
//         "<stamp>" cross stamp slams onto the pass, a "<sign>" board drops over the counter, the robot recoils.
//   story (1 beat ~10-12 s): date pill + airline pill; the robot walks in with an "<agent>" pill; channel chips
//         (Website / App / Travel agencies) pop under the board, each gets a small padlock on its cue; then a big
//         flight-search panel: three flight rows light up with ticks on showCue ("<show>"), and the "<buy>" button
//         locks with a padlock + red cross on buyCue while the robot's tap bounces off.
// Fits: "airline / store blocks AI agents from buying", "agents can look but can't buy".
// params: mode, airline ("Airline"), agent ("AI agent"), stamp ("CANCELLED"), sign ("No AI agents"), date (""),
//         chips (["Website", "App", "Travel agencies"]), chipCues (["website", "app", "agencies"]), show ("Show flights"),
//         buy ("Buy"), cues: dateCue, agentCue, showCue, buyCue (narration words; without them, fractions)
export function terminal(ctx, t, H, K, ACC, o = {}) {
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

export function counter(ctx, H, K, x, y, w, ACC) {
  const { roundRect } = H;
  K.shadow(ctx, x, y + 6, w * 1.05);
  roundRect(ctx, x - w / 2, y - 130, w, 130, 14); ctx.fillStyle = '#dfe4f1'; ctx.fill();
  roundRect(ctx, x - w / 2 - 10, y - 142, w + 20, 22, 10); ctx.fillStyle = '#f4f6fb'; ctx.fill();
  ctx.fillStyle = '#b9c1d6'; ctx.fillRect(x - w / 2, y - 120, w, 12);
  ctx.fillStyle = ACC; ctx.fillRect(x - w / 2, y - 60, w, 8);
}

export function boardingPass(ctx, H, x, y, s, ACC, o = {}) {
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

function signBoard(ctx, H, x, y, s, text, danger) {
  const { roundRect } = H;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#8a93a8'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-120, -44); ctx.lineTo(-120, -140); ctx.moveTo(120, -44); ctx.lineTo(120, -140); ctx.stroke();
  const f = H.fitText(ctx, text.toUpperCase(), 'display', 40, 24, 380);
  ctx.font = f.font; const w = Math.min(440, ctx.measureText(f.text).width + 70);
  roundRect(ctx, -w / 2, -48, w, 92, 18); ctx.fillStyle = '#15182e'; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = danger; ctx.stroke();
  // no-entry glyph
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
  ctx.restore();
}

function lockIcon(ctx, H, x, y, s, color) {
  const { roundRect } = H;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, -16, 12, Math.PI, 0); ctx.lineTo(12, -6); ctx.moveTo(-12, -6); ctx.lineTo(-12, -16); ctx.stroke();
  roundRect(ctx, -18, -8, 36, 28, 6); ctx.fillStyle = color; ctx.fill();
  ctx.fillStyle = '#15182e'; ctx.beginPath(); ctx.arc(0, 4, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const mode = P.mode || 'hook';
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const danger = '#ff6b5e';
  const airline = String(P.airline || 'Airline');

  if (mode === 'hook') {
    // action already in motion at frame 0: pass held up, stamp lands ~0.45 s, sign drops ~1.0 s
    const tStamp = -0.2, tSign = 0.7;
    K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 500, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 740 }]);
    K.cameraShake(ctx, t, tStamp + 0.25, 0.35, 10);
    terminal(ctx, t, H, K, ACC, { planeX: 760 });
    // counter + attendant
    K.drawPerson(ctx, 720, 880, 1.1, { t, pose: t > tSign + 0.2 ? 'shrug' : 'stand', flip: true, mood: 'neutral', skin: 2, hair: 0, shirt: '#3b4a7a', hairStyle: 'bun', seed: 5, look: -0.7 });
    counter(ctx, H, K, 730, 1010, 360, ACC);
    K.drawLabel(ctx, 730, 966, 1, { text: airline, size: 26, dot: true });
    // robot with the pass
    const recoil = smooth((t - tStamp - 0.4) / 0.5);
    const rx = 330 - recoil * 40 + K.shake(t, tStamp + 0.2, 0.4, 6);
    K.drawRobot(ctx, rx, 1030, 1.35, { t, state: t > tStamp + 0.4 ? 'thinking' : 'working', seed: 6 });
    K.drawLabel(ctx, rx, 668, 1, { text: P.agent || 'AI agent', size: 26, accent: true });
    // big pass held out between robot and counter
    const passX = lerp(520, 500, recoil), passY = lerp(800, 815, recoil);
    boardingPass(ctx, H, passX, passY, 1.25, ACC, { rot: lerp(-0.08, 0.05, recoil) });
    // stamp on the pass
    const st = (t - tStamp) / 0.5;
    K.drawStamp(ctx, passX + 5, passY + 85, 1.15, { kind: 'cross', text: P.stamp || 'CANCELLED', land: Math.max(0.001, st) });
    // sign drops over the counter
    const sk = smooth((t - tSign) / 0.45);
    if (t > tSign - 0.05) {
      const y = lerp(380, 560, H.easeOutBack(clamp((t - tSign) / 0.5)));
      ctx.save(); ctx.globalAlpha = clamp(sk * 3);
      signBoard(ctx, H, 700, y, 0.95, P.sign || 'No AI agents', danger);
      ctx.restore();
    }
    return;
  }

  // ---------------- story ----------------
  const tDate = at(P.dateCue, D * 0.1) - 0.2;
  const tAgent = at(P.agentCue, D * 0.25) - 0.2;
  const chips = (P.chips || ['Website', 'App', 'Travel agencies']).slice(0, 3);
  const chipCues = P.chipCues || ['website', 'app', 'agencies'];
  const tChip = chips.map((c, i) => at(chipCues[i], D * (0.38 + i * 0.07)) - 0.1);
  const tShow = at(P.showCue, D * 0.72) - 0.2;
  const tBuy = at(P.buyCue, D * 0.88) - 0.25;
  const tPanel = tShow - 0.9;

  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
  terminal(ctx, t, H, K, ACC);
  // attendant + counter right
  K.drawPerson(ctx, 760, 880, 1.0, { t, pose: t > tBuy + 0.2 ? 'shrug' : 'stand', flip: true, mood: 'neutral', skin: 2, hair: 0, shirt: '#3b4a7a', hairStyle: 'bun', seed: 5, look: -0.7 });
  counter(ctx, H, K, 760, 1010, 300, ACC);
  K.drawLabel(ctx, 760, 966, Math.min(1.05, K.popIn(t, 0.1, 0.4)), { text: airline, size: 24, dot: true });
  // date pill (top left of the stage)
  if (P.date) { const dp = K.popIn(t, tDate, 0.4); if (dp > 0) { ctx.save(); ctx.globalAlpha = 1 - smooth((t - tPanel) / 0.3); K.drawLabel(ctx, 250, 478, Math.min(1.05, dp), { text: P.date, size: 26, accent: true }); ctx.restore(); } }
  // robot walks in from the left
  const walkU = smooth((t - 0.0) / 2.2);
  const rx = lerp(60, 330, walkU);
  const tapping = t > tBuy - 0.4 && t < tBuy + 0.4;
  K.drawRobot(ctx, rx, 1030, 1.2, { t, state: t > tBuy + 0.3 ? 'thinking' : t > tShow ? 'happy' : 'idle', seed: 6, talk: tapping ? 0.6 : 0 });
  const ap = K.popIn(t, tAgent, 0.4);
  if (ap > 0) K.drawLabel(ctx, rx, 715, Math.min(1.05, ap), { text: P.agent || 'AI agent', size: 26, accent: true });

  // channel chips: a row under the window band; each locks on its cue
  const panelIn = smooth((t - tPanel) / 0.5);
  const chipsY = lerp(560, 470, 0), chipX = [240, 445, 690];
  ctx.save(); ctx.globalAlpha = 1 - panelIn;
  chips.forEach((c, i) => {
    const p = K.popIn(t, tChip[i], 0.4); if (p <= 0) return;
    ctx.save(); ctx.translate(chipX[i], chipsY); ctx.scale(Math.min(1.05, p), Math.min(1.05, p));
    ctx.font = H.font('ui', 26); const w = ctx.measureText(c).width + 92;
    roundRect(ctx, -w / 2, -36, w, 72, 36); ctx.fillStyle = 'rgba(10,12,22,0.88)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(danger, 0.9); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(c, -w / 2 + 64, 2);
    const lk = K.popIn(t, tChip[i] + 0.25, 0.35);
    if (lk > 0) lockIcon(ctx, H, -w / 2 + 34, 2, Math.min(1.05, lk) * 0.85, danger);
    ctx.restore();
  });
  // "restricted" pill under the chips
  const rp = K.popIn(t, tChip[2] + 0.5, 0.4);
  if (rp > 0) K.drawLabel(ctx, 450, 660, Math.min(1.05, rp), { text: 'AI agents restricted', size: 26 });
  ctx.restore();

  // flight-search panel
  if (panelIn > 0) {
    const X0 = 150, X1 = 830, Y0 = 445, Hh = 330;
    ctx.save(); ctx.globalAlpha = panelIn; ctx.translate(0, (1 - panelIn) * 40);
    roundRect(ctx, X0, Y0, X1 - X0, Hh, 22); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    roundRect(ctx, X0, Y0, X1 - X0, 54, 22); ctx.fillStyle = '#1b2040'; ctx.fill(); ctx.fillRect(X0, Y0 + 30, X1 - X0, 24);
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('bold', 26); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText('Flights', X0 + 24, Y0 + 28);
    // show chip in header
    const sp = K.popIn(t, tShow, 0.4);
    if (sp > 0) { ctx.save(); ctx.translate(X1 - 130, Y0 + 27); ctx.scale(Math.min(1.05, sp), Math.min(1.05, sp));
      ctx.font = H.font('ui', 22); const w = ctx.measureText(P.show || 'Show flights').width + 64;
      roundRect(ctx, -w / 2, -19, w, 38, 19); ctx.fillStyle = ACC; ctx.fill();
      ctx.fillStyle = '#15182e'; ctx.textAlign = 'center'; ctx.fillText((P.show || 'Show flights') + '  ✓', 0, 1); ctx.restore(); }
    // rows
    for (let r = 0; r < 3; r++) {
      const ry = Y0 + 78 + r * 62, lit = smooth((t - tShow - r * 0.18) / 0.3);
      roundRect(ctx, X0 + 20, ry, 430, 50, 10); ctx.fillStyle = lit > 0 ? rgba('#dfe9ff', 0.5 + 0.5 * lit) : '#e6e9f2'; ctx.fill();
      ctx.fillStyle = '#8a93a8'; ctx.fillRect(X0 + 40, ry + 14, 70, 10); ctx.fillRect(X0 + 40, ry + 30, 120, 8);
      ctx.fillStyle = '#1b2040'; ctx.fillRect(X0 + 250, ry + 16, 80, 14);
      if (lit > 0) { ctx.save(); ctx.globalAlpha = lit; ctx.fillStyle = '#2bb673'; ctx.beginPath(); ctx.arc(X0 + 415, ry + 25, 15, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X0 + 407, ry + 25); ctx.lineTo(X0 + 413, ry + 31); ctx.lineTo(X0 + 424, ry + 18); ctx.stroke(); ctx.restore(); }
    }
    // BUY button on the right
    const bx = X1 - 120, by = Y0 + 170, locked = smooth((t - tBuy) / 0.3);
    const press = t > tBuy - 0.35 && t < tBuy ? 0.94 : 1;
    ctx.save(); ctx.translate(bx, by); ctx.scale(press, press); ctx.translate(K.shake(t, tBuy, 0.4, 7), 0);
    roundRect(ctx, -100, -50, 200, 100, 22); ctx.fillStyle = locked > 0.5 ? '#9aa1b5' : ACC; ctx.fill();
    ctx.fillStyle = locked > 0.5 ? '#ffffff' : '#15182e'; ctx.font = H.font('display', 40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(P.buy || 'Buy').toUpperCase(), 0, 3);
    ctx.restore();
    if (locked > 0) {
      lockIcon(ctx, H, bx + 92, by - 44, Math.min(1.1, K.popIn(t, tBuy, 0.35)) * 1.1, danger);
      const xs = smooth((t - tBuy - 0.15) / 0.3);
      ctx.strokeStyle = danger; ctx.lineWidth = 12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(bx - 70, by - 36); ctx.lineTo(lerp(bx - 70, bx + 70, xs), lerp(by - 36, by + 36, xs)); ctx.stroke();
      if (xs > 0.5) { const x2 = smooth((t - tBuy - 0.35) / 0.3); ctx.beginPath(); ctx.moveTo(bx + 70, by - 36); ctx.lineTo(lerp(bx + 70, bx - 70, x2), lerp(by - 36, by + 36, x2)); ctx.stroke(); }
    }
    // hand cursor from the robot tapping BUY
    const cu = smooth((t - tBuy + 1.0) / 0.6), back = smooth((t - tBuy - 0.1) / 0.4);
    if (cu > 0) {
      const cx = lerp(rx + 60, bx - 10, cu) - back * 60, cy = lerp(by + 200, by + 20, cu) + back * 40;
      ctx.save(); ctx.translate(cx, cy);
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#15182e'; ctx.lineWidth = 3;
      roundRect(ctx, -10, -34, 20, 46, 10); ctx.fill(); ctx.stroke();
      roundRect(ctx, -22, 0, 46, 40, 14); ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }
}
