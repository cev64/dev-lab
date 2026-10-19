// Scene "scanner-launch" (was orb-launch; full frame, 1 beat, ~10-15 s). A conference stage at night with sweeping spotlights
// and an audience. The backdrop screen names the event; a date pill drops; a generic eye-scanning sphere (no logo)
// rises on a pedestal with name / description pills; on the launch cue the pills clear, the screen retitles and
// three product cards fly out of the sphere; finally a crossed-out "threat" pill lands.
// Fits: a product launch at a conference by an identity / security / hardware project.
// Card icons (fixed order): phone wallet, video tile with a check, robot head.
// params: event ("TECH EXPO"), date ("Date"), name ("Project"), desc ("Eye-scanning ID project"),
//         who ("Who is behind it"), title ("New ID tools for banks"),
//         cards (["ID app", "ID for video calls", "ID for AI agents"]), threat ("Deepfakes")
//         cues (optional; else fractions): dateCue, nameCue, descCue, whoCue, launchCue, titleCue, threatCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, roundRect, rgba } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tDate = at(P.dateCue, D * 0.03);
  const tName = at(P.nameCue, D * 0.3) - 0.2;
  const tDesc = at(P.descCue, D * 0.36);
  const tWho = at(P.whoCue, D * 0.55);
  const tLaunch = at(P.launchCue, D * 0.66) - 0.1;
  const tTitle = at(P.titleCue, D * 0.76);
  const tThreat = at(P.threatCue, D * 0.92) - 0.1;
  const danger = '#ff6b5e';

  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tLaunch, zoom: 1.04, x: 487, y: 760 }, { t: D, zoom: 1.02, x: 487, y: 740 }]);
  // hall
  const bg = ctx.createLinearGradient(0, 0, 0, 1920); bg.addColorStop(0, '#0b0e22'); bg.addColorStop(0.5, '#171b3a'); bg.addColorStop(1, '#0a0c1a');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, 1080, 1920);
  // truss
  ctx.fillStyle = '#23284a'; ctx.fillRect(0, 380, 1080, 18);
  for (let i = 0; i < 14; i++) { ctx.fillStyle = '#2d3358'; ctx.fillRect(i * 80, 384, 40, 10); }
  // spotlights (sweeping cones)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) {
    const x0 = 140 + i * 270, sw = Math.sin(t * 0.7 + i * 1.7) * 160;
    const gx = ctx.createLinearGradient(x0, 400, x0 + sw, 1040);
    gx.addColorStop(0, 'rgba(180,200,255,0.16)'); gx.addColorStop(1, 'rgba(180,200,255,0)');
    ctx.fillStyle = gx; ctx.beginPath(); ctx.moveTo(x0 - 14, 398); ctx.lineTo(x0 + 14, 398); ctx.lineTo(x0 + sw + 120, 1040); ctx.lineTo(x0 + sw - 120, 1040); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  for (let i = 0; i < 4; i++) { roundRect(ctx, 140 + i * 270 - 18, 392, 36, 26, 6); ctx.fillStyle = '#3b4260'; ctx.fill(); }

  // backdrop screen
  const SX = 110, SY = 440, SW = 754, SH = 140;
  roundRect(ctx, SX - 8, SY - 8, SW + 16, SH + 16, 18); ctx.fillStyle = '#1c2033'; ctx.fill();
  const sg = ctx.createLinearGradient(SX, SY, SX + SW, SY + SH); sg.addColorStop(0, '#1f2a5a'); sg.addColorStop(1, '#2b1f52');
  roundRect(ctx, SX, SY, SW, SH, 12); ctx.fillStyle = sg; ctx.fill();
  ctx.save(); roundRect(ctx, SX, SY, SW, SH, 12); ctx.clip();
  for (let i = 0; i < 6; i++) { // slow light bars
    const x = SX + ((t * 60 + i * 160) % (SW + 200)) - 100;
    ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(x, SY, 50, SH);
  }
  const swap = smooth((t - tTitle + 0.2) / 0.5);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (swap < 1) {
    ctx.globalAlpha = 1 - swap;
    ctx.font = H.font('condensed', 84); ctx.fillStyle = '#ffffff';
    ctx.fillText(P.event || 'TECH EXPO', 487, SY + 56 - 30 * swap);
    const kd = smooth((t - tDate) / 0.4);
    if (kd > 0) { ctx.globalAlpha = (1 - swap) * kd; ctx.font = H.font('ui', 30); ctx.fillStyle = ACC; ctx.fillText(P.date || 'Date', 487, SY + 112); }
  }
  if (swap > 0) {
    ctx.globalAlpha = swap;
    const ft = H.fitText(ctx, P.title || 'New ID tools for banks', 'display', 54, 30, SW - 60);
    ctx.font = ft.font; ctx.fillStyle = '#ffffff'; ctx.fillText(ft.text, 487, SY + SH / 2 + 30 * (1 - swap));
  }
  ctx.restore(); ctx.globalAlpha = 1;

  // stage platform
  ctx.fillStyle = '#262b4d'; ctx.fillRect(0, 975, 1080, 70);
  ctx.fillStyle = '#343a66'; ctx.fillRect(0, 968, 1080, 12);
  ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = ACC;
  for (let i = 0; i < 12; i++) { ctx.globalAlpha = 0.25 + 0.25 * Math.sin(t * 3 + i); ctx.fillRect(40 + i * 88, 1000, 40, 5); }
  ctx.restore();

  // sphere on a pedestal, rising
  const rise = H.easeOutBack(clamp((t - tName) / 0.9));
  const ox = 487, r = 85;
  const oy = 975 - 30 - r + (1 - rise) * 260 + K.bob(t, 4, 1.3) * rise;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, 975); ctx.clip();
  if (rise > 0) {
    const ph = 975 - (oy + r - 6) + 4; if (ph > 22) { roundRect(ctx, ox - 60, oy + r - 6, 120, ph, 10); ctx.fillStyle = '#3b4260'; ctx.fill(); }
    roundRect(ctx, ox - 60, oy + r - 6, 120, 16, 8); ctx.fillStyle = '#4b5378'; ctx.fill();
    drawOrb(ctx, H, ox, oy, r, t, ACC, rise);
  }
  ctx.restore();

  // name / description / co-founder pills (clear at launch)
  const clear = 1 - smooth((t - tLaunch) / 0.35);
  if (clear > 0) {
    ctx.save(); ctx.globalAlpha = clear;
    const kn = K.popIn(t, tName + 0.2, 0.4), kd = K.popIn(t, tDesc, 0.4), kw = K.popIn(t, tWho, 0.4);
    if (kn > 0) K.drawLabel(ctx, 487, 650, Math.min(1.05, kn), { text: P.name || 'Project', size: 34, accent: true });
    if (kd > 0) K.drawLabel(ctx, 487, 712, Math.min(1.05, kd), { text: P.desc || 'Eye-scanning ID project', size: 28 });
    if (kw > 0) K.drawLabel(ctx, 487, 770, Math.min(1.05, kw), { text: P.who || 'Who is behind it', size: 26 });
    ctx.restore();
  }

  // three product cards fly out of the sphere
  const cards = P.cards || ['ID app', 'ID for video calls', 'ID for AI agents'];
  const cx = [200, 487, 774], cy = 700;
  cards.slice(0, 3).forEach((txt, i) => {
    const k = clamp((t - tLaunch - 0.15 - i * 0.28) / 0.6);
    if (k <= 0) return;
    const e = H.easeOutBack(k);
    const x = ox + (cx[i] - ox) * e, y = oy + (cy - oy) * e, s = 0.3 + 0.7 * Math.min(1.04, e);
    ctx.save(); ctx.translate(x, y + K.bob(t, 3, 1.6, i) * k); ctx.scale(s, s);
    roundRect(ctx, -128, -86, 256, 172, 22); ctx.fillStyle = 'rgba(10,12,26,0.94)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.85); ctx.stroke();
    icon(ctx, H, K, i, 0, -36, t, ACC);
    const lines = H.wrap(ctx, txt, 'ui', 26, 220);
    ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.slice(0, 2).forEach((ln, j) => ctx.fillText(ln, 0, 26 + j * 30 - (lines.length > 1 ? 0 : -14)));
    ctx.restore();
  });

  // audience heads in front of the stage
  for (let i = 0; i < 9; i++) {
    const x = 40 + i * 125 + (i % 2) * 20, y = 1045 + (i % 2) * 8, bob = Math.sin(t * 1.3 + i) * 2;
    ctx.fillStyle = '#0c0f22';
    roundRect(ctx, x - 52, y - 10 + bob, 104, 80, 30); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y - 34 + bob, 32, 0, Math.PI * 2); ctx.fill();
  }

  // threat pill crossed out
  const kt = K.popIn(t, tThreat, 0.4);
  if (kt > 0) {
    const s = Math.min(1.06, kt), x = 760, y = 905;
    ctx.save(); ctx.translate(x, y); ctx.rotate(0.06); ctx.scale(s, s);
    ctx.font = H.font('display', 34);
    const w = ctx.measureText(P.threat || 'Deepfakes').width + 56;
    roundRect(ctx, -w / 2, -32, w, 64, 32); ctx.fillStyle = 'rgba(40,10,16,0.92)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = danger; ctx.stroke();
    ctx.fillStyle = danger; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.threat || 'Deepfakes', 0, 2);
    const ks = clamp((t - tThreat - 0.3) / 0.3);
    ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.strokeStyle = '#ffffff';
    ctx.beginPath(); ctx.moveTo(-w / 2 + 14, 16); ctx.lineTo(-w / 2 + 14 + (w - 28) * ks, -16); ctx.stroke();
    ctx.restore();
  }
}

// little icons for the product cards: 0 phone wallet, 1 video tile with a check, 2 robot head
function icon(ctx, H, K, kind, x, y, t, ACC) {
  const { roundRect } = H;
  ctx.save(); ctx.translate(x, y);
  if (kind === 0) {
    roundRect(ctx, -24, -40, 48, 80, 10); ctx.fillStyle = '#2a2f45'; ctx.fill();
    roundRect(ctx, -19, -33, 38, 62, 6); ctx.fillStyle = '#121527'; ctx.fill();
    roundRect(ctx, -13, -22, 26, 18, 4); ctx.fillStyle = ACC; ctx.fill();
    roundRect(ctx, -13, 0, 26, 8, 3); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fill();
    roundRect(ctx, -13, 12, 18, 8, 3); ctx.fill();
  } else if (kind === 1) {
    roundRect(ctx, -46, -32, 92, 64, 10); ctx.fillStyle = '#33406e'; ctx.fill();
    ctx.beginPath(); ctx.arc(-6, -6, 13, 0, Math.PI * 2); ctx.fillStyle = '#e9b48a'; ctx.fill();
    roundRect(ctx, -26, 10, 40, 22, 10); ctx.fillStyle = '#5b6aa8'; ctx.fill();
    ctx.beginPath(); ctx.arc(30, -18, 13, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    ctx.lineWidth = 3.5; ctx.strokeStyle = K.ACCENT.deep; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(24, -18); ctx.lineTo(29, -13); ctx.lineTo(36, -23); ctx.stroke();
  } else {
    ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    roundRect(ctx, -24, -12, 48, 24, 12); ctx.fillStyle = '#1c2033'; ctx.fill();
    const bl = Math.sin(t * 2.3) > 0.97 ? 0.2 : 1;
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.ellipse(-10, 0, 5, 6 * bl, 0, 0, Math.PI * 2); ctx.ellipse(10, 0, 5, 6 * bl, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#b9c1d6'; ctx.fillRect(-2, -46, 4, 14); ctx.beginPath(); ctx.arc(0, -48, 6, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
  }
  ctx.restore();
}

// Generic eye-scanning sphere (no logo): silver ball, dark lens with an accent ring, soft glow.
function drawOrb(ctx, H, x, y, r, t, ACC, glowA) {
  H.glow(ctx, x, y, r * 2.4, ACC, 0.2 * glowA);
  const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.45, r * 0.1, x, y, r);
  g.addColorStop(0, '#fbfcff'); g.addColorStop(0.55, '#bcc3d4'); g.addColorStop(1, '#5b6276');
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
  ctx.lineWidth = Math.max(1.5, r * 0.03); ctx.strokeStyle = 'rgba(40,46,66,0.35)';
  ctx.beginPath(); ctx.ellipse(x, y, r * 0.98, r * 0.22, 0, 0, Math.PI); ctx.stroke();
  const lr = r * 0.4, lx = x, ly = y - r * 0.02;
  ctx.beginPath(); ctx.arc(lx, ly, lr * 1.18, 0, Math.PI * 2); ctx.fillStyle = '#2a2f45'; ctx.fill();
  ctx.beginPath(); ctx.arc(lx, ly, lr, 0, Math.PI * 2); ctx.fillStyle = '#0d1020'; ctx.fill();
  const pulse = 0.55 + 0.45 * Math.sin(t * 3);
  ctx.lineWidth = Math.max(2, lr * 0.14); ctx.strokeStyle = H.rgba(ACC, 0.5 + 0.5 * pulse);
  ctx.beginPath(); ctx.arc(lx, ly, lr * 0.62, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(lx - lr * 0.3, ly - lr * 0.32, lr * 0.16, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.fill();
}
