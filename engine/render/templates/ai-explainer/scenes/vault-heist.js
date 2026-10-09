// Scene "vault-heist" (full frame; best over 2 beats with span 2). A bank-style vault room at night. A shadowy hooded
// cartoon figure (no face, two glowing eyes: generic, never a real person) slips in with a helper robot (the AI
// agent); the robot works a pick-arm on the vault wheel while sparks fly; the vault swings open, an alarm light pulses
// and glowing records float out while a figure counts up. Non-technical metaphor only.
// Beat 1 = the break-in, beat 2 = the damage (or 0-55% / 55-100% of the scene).
// Fits: "hackers used AI to breach X", data breaches, AI-assisted cyberattacks.
// params (all optional): source     pill naming who says so (default "According to a security firm")
//                        agent      pill under the robot (default "AI AGENT")
//                        helper     pill when the robot starts working (default "+ AI models")
//                        target     pill naming the target (default "The target")
//                        when       date pill (none by default)
//                        inst       pill at the start of beat 2, e.g. "7+ institutions breached" (none by default)
//                        count      figure counted up in beat 2, e.g. "68,000+" (none by default); countLabel line under it
//                        agentCue / helperCue / cue / whenCue / instCue / countCue  narration words for those moments
//                               (else fixed fractions of beat 1 / beat 2)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = info.helpers.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent, RED = '#ff6b5e';
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const b2 = info.beats.length >= 2 ? info.beats[1].t0 : D * 0.55;
  const tSrc = at(null, 1.0), tFig = at(null, 2.4), tBot = at(P.agentCue, 3.6);
  const tHelp = at(P.helperCue, b2 * 0.45), tBank = at(P.cue, b2 * 0.6), tWhen = at(P.whenCue, b2 * 0.8);
  const tOpen = b2 - 1.2;
  const tInst = at(P.instCue, b2 + 1), tCount = at(P.countCue, b2 + (D - b2) * 0.5);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: tHelp, zoom: 1.05, x: 470, y: 760 }, { t: tOpen, zoom: 1.08, x: 520, y: 760 }, { t: b2 + 1, zoom: 1.02, x: 487, y: 725 }, { t: D, zoom: 1.0 }]);
  if (t > tOpen && t < tOpen + 0.6) K.cameraShake(ctx, t, tOpen + 0.1, 0.45, 9);

  // room: steel-blue wall with panels, darker floor
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#151a33'); g.addColorStop(0.5, '#1f2647'); g.addColorStop(1, '#0b0d1a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 7; i++) { H.roundRect(ctx, 10 + i * 160, 330, 140, 640, 10); ctx.fillStyle = 'rgba(255,255,255,0.03)'; ctx.fill(); }
  ctx.fillStyle = '#12152a'; ctx.fillRect(0, 1000, 1080, 920);
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.fillRect(0, 1000, 1080, 6);
  // alarm light (pulses red once the vault is open)
  const alarm = t > tOpen ? 0.5 + 0.5 * Math.sin((t - tOpen) * 9) : 0;
  H.roundRect(ctx, 910, 470, 60, 30, 10); ctx.fillStyle = '#3a4060'; ctx.fill();
  ctx.beginPath(); ctx.arc(940, 470, 24, Math.PI, 0); ctx.fillStyle = t > tOpen ? H.mixHex('#7a2a26', RED, alarm) : '#5a3a40'; ctx.fill();
  if (t > tOpen) { K.glow(ctx, 940, 460, 220, RED, 0.35 * alarm); ctx.save(); ctx.globalAlpha = 0.08 * alarm; ctx.fillStyle = RED; ctx.fillRect(0, 0, 1080, 1920); ctx.restore(); }

  // vault
  const vx = 600, vy = 790, R = 200;
  const openK = K.phase(t, tOpen, tOpen + 1.1, K.easeOutBack);
  ctx.beginPath(); ctx.arc(vx, vy, R + 28, 0, Math.PI * 2); ctx.fillStyle = '#3b4260'; ctx.fill();
  ctx.beginPath(); ctx.arc(vx, vy, R + 12, 0, Math.PI * 2); ctx.fillStyle = '#272c46'; ctx.fill();
  // interior (seen when open): shelves of glowing records
  if (openK > 0.01) {
    ctx.save(); ctx.beginPath(); ctx.arc(vx, vy, R + 4, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#0d0f1d'; ctx.fillRect(vx - R, vy - R, 2 * R, 2 * R);
    K.glow(ctx, vx, vy, 260, ACC, 0.3 * clamp(openK));
    for (let r = 0; r < 4; r++) {
      const sy = vy - 120 + r * 80;
      ctx.fillStyle = '#2a2f45'; ctx.fillRect(vx - R, sy + 26, 2 * R, 8);
      for (let c = 0; c < 6; c++) { const fx = vx - 150 + c * 60; record(ctx, H, fx, sy, 0.8, ACC, (r + c) % 3 === 0 && t > tCount); }
    }
    ctx.restore();
  }
  // door: swings on its right hinge (squashes towards the hinge)
  const ang = clamp(openK, 0, 1.08) * 1.35;
  ctx.save(); ctx.translate(vx + R, vy); ctx.scale(Math.max(0.04, Math.cos(ang)), 1); ctx.translate(-(vx + R), -vy);
  ctx.beginPath(); ctx.arc(vx, vy, R, 0, Math.PI * 2); ctx.fillStyle = '#9aa3b8'; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = '#7d869c'; ctx.fillRect(vx + R * 0.35, vy - R, R, 2 * R); ctx.restore();
  ctx.beginPath(); ctx.arc(vx, vy, R - 26, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = '#6b738a'; ctx.stroke();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; ctx.beginPath(); ctx.arc(vx + Math.cos(a) * (R - 12), vy + Math.sin(a) * (R - 12), 7, 0, Math.PI * 2); ctx.fillStyle = '#c9cfdf'; ctx.fill(); }
  // wheel handle (spins while the robot works)
  const working = t > tHelp && t < tOpen;
  const spin = (t > tHelp ? Math.min(t, tOpen) - tHelp : 0) * 2.4 + (working ? Math.sin(t * 23) * 0.06 : 0) + openK * 0.6;
  ctx.save(); ctx.translate(vx, vy); ctx.rotate(spin);
  ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.strokeStyle = '#4a5270';
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI; ctx.beginPath(); ctx.moveTo(Math.cos(a) * -80, Math.sin(a) * -80); ctx.lineTo(Math.cos(a) * 80, Math.sin(a) * 80); ctx.stroke(); }
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; ctx.beginPath(); ctx.arc(Math.cos(a) * 82, Math.sin(a) * 82, 13, 0, Math.PI * 2); ctx.fillStyle = '#e1e5ef'; ctx.fill(); }
  ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fillStyle = '#c9cfdf'; ctx.fill();
  ctx.restore();
  ctx.restore();
  // hooded figure (left) + robot with a pick arm
  const fx = lerp(-120, 175, easeOutCubic(clamp((t - tFig + 0.6) / 1.4)));
  hooded(ctx, H, K, fx, 1035, 1.35, { t, walk: t < tFig + 0.8, acc: ACC });
  if (t > tFig + 0.3 && t < tBot + 1.2) {
    const q = K.popIn(t, tFig + 0.3, 0.35) * (1 - smooth((t - tBot - 0.8) / 0.4));
    if (q > 0.01) K.drawSpeechBubble(ctx, fx + 30, 1035 - 340, q, { text: '?', size: 46, tail: 'left' });
  }
  const rx = lerp(-60, 355, easeOutCubic(clamp((t - tBot) / 1.2)));
  if (t > tBot - 0.1) {
    const st = t < tHelp ? 'idle' : working ? 'working' : 'idle';
    K.drawRobot(ctx, rx, 1035, 1.12, { t, state: st, seed: 7 });
    // pick arm from the robot to the wheel
    const reach = K.phase(t, tHelp - 0.6, tHelp + 0.1) * (1 - K.phase(t, tOpen + 0.2, tOpen + 0.9));
    if (reach > 0) {
      const hx = rx + 46, hy = 1035 - 150, tx = lerp(hx, vx - 92, reach), ty = lerp(hy, vy + 8 + Math.sin(t * 20) * (working ? 4 : 0), reach);
      ctx.lineCap = 'round'; ctx.strokeStyle = '#b9c1d6'; ctx.lineWidth = 14;
      const mx = (hx + tx) / 2, my = Math.max(hy, ty) + 40;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.quadraticCurveTo(mx, my, tx, ty); ctx.stroke();
      ctx.beginPath(); ctx.arc(tx, ty, 11, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
      if (working) for (let i = 0; i < 6; i++) {
        const ph = ((t * 3 + i / 6) % 1), a = -2.2 + H.hash(i, Math.floor(t * 3 + i / 6)) * 1.8;
        ctx.globalAlpha = 1 - ph; ctx.strokeStyle = ACC; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(tx + Math.cos(a) * 14 * (1 + ph), ty + Math.sin(a) * 14 * (1 + ph)); ctx.lineTo(tx + Math.cos(a) * 30 * (1 + ph * 2), ty + Math.sin(a) * 30 * (1 + ph * 2)); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
    const ap = K.popIn(t, tBot + 0.6, 0.4);
    if (ap > 0) K.drawLabel(ctx, rx, 1035 - 225 * 1.12 - 18, ap, { text: P.agent || 'AI AGENT', size: 26, accent: true });
  }

  // records floating out of the open vault (data exposed)
  if (t > tCount - 1.2) {
    for (let i = 0; i < 14; i++) {
      const born = tCount - 1.2 + i * 0.22, age = t - born;
      if (age <= 0) continue;
      const u = clamp(age / 2.6), e = easeOutCubic(u);
      const ang2 = -1.0 + H.hash(i, 3) * 1.9, dist = 120 + 120 * H.hash(i, 5);
      const x = Math.min(880, vx + 60 + Math.cos(ang2) * dist * e * 0.9), y = Math.max(660, vy + Math.sin(ang2) * dist * e * 1.3) + K.bob(t, 6, 0.5, i * 0.17);
      ctx.save(); ctx.globalAlpha = Math.min(1, age * 3); record(ctx, H, x, y, 0.9, ACC, true); ctx.restore();
    }
  }

  // top pills / numbers (below the docked header)
  const beat1 = 1 - smooth((t - b2 + 0.4) / 0.4);
  const sp = K.popIn(t, tSrc - 0.1, 0.4), sw = P.when ? smooth((t - tWhen + 0.1) / 0.3) : 0;
  if (sp > 0 && beat1 > 0 && sw < 1) { ctx.save(); ctx.globalAlpha = beat1 * (1 - sw); K.drawLabel(ctx, 487, 500, sp, { text: P.source || 'According to a security firm', size: 30, dot: true }); ctx.restore(); }
  if (sw > 0 && beat1 > 0) { ctx.save(); ctx.globalAlpha = beat1; K.drawLabel(ctx, 487, 500, K.popIn(t, tWhen, 0.4), { text: P.when, size: 30, dot: true }); ctx.restore(); }
  const hp = K.popIn(t, tHelp - 0.1, 0.4), hA = 1 - smooth((t - tBank + 0.15) / 0.3);
  if (hp > 0 && hA > 0 && beat1 > 0) { ctx.save(); ctx.globalAlpha = hA * beat1; K.drawLabel(ctx, 487, 578, hp, { text: P.helper || '+ AI models', size: 30 }); ctx.restore(); }
  const tp = K.popIn(t, tBank, 0.4);
  if (tp > 0 && beat1 > 0) { ctx.save(); ctx.globalAlpha = beat1; K.drawLabel(ctx, 487, 578, tp, { text: P.target || 'The target', size: 30, accent: true }); ctx.restore(); }
  const cA = smooth((t - tCount + 0.2) / 0.4);
  if (P.inst) {
    const ip = K.popIn(t, tInst - 0.1, 0.4);
    if (ip > 0) { ctx.save(); ctx.globalAlpha = 1 - cA; K.drawLabel(ctx, 487, 540, ip, { text: P.inst, size: 34, accent: true }); ctx.restore(); }
  }
  if (P.count && cA > 0) {
    const txt = String(P.count), m = txt.match(/^([^0-9]*?)(\d{1,3}(?:,\d{3})+|\d+)(.*)$/);
    const k = K.phase(t, tCount, tCount + 2.4, easeOutCubic);
    let shown = txt;
    if (m && k < 1) { let n = Math.round(parseFloat(m[2].replace(/,/g, '')) * k).toFixed(0); if (m[2].includes(',')) n = n.replace(/\B(?=(\d{3})+(?!\d))/g, ','); shown = m[1] + n + m[3]; }
    const pop = K.popIn(t, tCount - 0.2, 0.45);
    ctx.save(); ctx.translate(487, 545); ctx.scale(pop, pop);
    const ft = H.fitText(ctx, txt, 'display', 120, 60, 640);
    ctx.font = ft.font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
    ctx.lineWidth = 18; ctx.strokeStyle = 'rgba(6,7,14,0.9)'; ctx.strokeText(shown, 0, 0); ctx.fillStyle = ACC; ctx.fillText(shown, 0, 0);
    if (P.countLabel) { ctx.font = H.font('bold', 36); ctx.lineWidth = 10; ctx.strokeText(String(P.countLabel), 0, 56); ctx.fillStyle = '#ffffff'; ctx.fillText(String(P.countLabel), 0, 56); }
    ctx.restore();
  }
  ctx.restore();
}

// a personal-data record card (person icon + lines), centre anchored ~56x70 at scale 1
function record(ctx, H, x, y, s, acc, hot) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (hot) H.glow(ctx, 0, 0, 50, acc, 0.3);
  H.roundRect(ctx, -28, -35, 56, 70, 8); ctx.fillStyle = '#eef1f8'; ctx.fill();
  ctx.fillStyle = hot ? acc : '#9aa3b8';
  ctx.beginPath(); ctx.arc(0, -15, 9, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 4, 15, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#b9c1d6'; ctx.fillRect(-18, 13, 36, 5); ctx.fillRect(-18, 23, 26, 5);
  ctx.restore();
}
// shadowy hooded cartoon figure (generic; no face, two glowing eyes), bottom-centre anchored, ~120x250 at scale 1
function hooded(ctx, H, K, x, y, s, o = {}) {
  const t = o.t || 0, walk = !!o.walk;
  const ph = t * 1.8 * Math.PI * 2, bob = walk ? -Math.abs(Math.sin(ph)) * 5 : Math.sin(t * 1.5) * 1.5;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * (o.flip ? -1 : 1), s);
  K.shadow(ctx, 0, 0, 110);
  const cloak = '#343a5a', cloakS = '#252a44';
  for (const side of [-1, 1]) {
    const a = walk ? Math.sin(ph + (side > 0 ? Math.PI : 0)) * 0.35 : 0;
    ctx.save(); ctx.translate(side * 14, -70 + bob); ctx.rotate(a);
    H.roundRect(ctx, -9, 0, 18, 66, 8); ctx.fillStyle = '#14162a'; ctx.fill();
    H.roundRect(ctx, -12, 58, 30, 14, 7); ctx.fillStyle = '#0c0d18'; ctx.fill();
    ctx.restore();
  }
  ctx.translate(0, bob);
  // cloak body
  ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -62); ctx.lineTo(54, -62); ctx.quadraticCurveTo(58, -110, 34, -178); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = cloakS; ctx.fillRect(18, -190, 60, 140); ctx.restore();
  // arm holding a glowing tablet
  ctx.strokeStyle = cloak; ctx.lineWidth = 17; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(26, -160); ctx.lineTo(48, -122); ctx.lineTo(62, -132); ctx.stroke();
  ctx.save(); ctx.translate(70, -138); ctx.rotate(-0.25);
  H.roundRect(ctx, -16, -22, 32, 44, 5); ctx.fillStyle = '#0c0d18'; ctx.fill();
  H.roundRect(ctx, -12, -18, 24, 36, 3); ctx.fillStyle = o.acc || '#ffe14a'; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
  ctx.restore();
  // rim light on the cloak edge
  ctx.save(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -62); ctx.stroke(); ctx.restore();
  // hood
  ctx.beginPath(); ctx.moveTo(0, -262); ctx.quadraticCurveTo(46, -250, 44, -200); ctx.quadraticCurveTo(42, -170, 0, -168); ctx.quadraticCurveTo(-42, -170, -44, -200); ctx.quadraticCurveTo(-46, -244, 0, -262); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(4, -204, 26, 25, 0, 0, Math.PI * 2); ctx.fillStyle = '#07080f'; ctx.fill();
  const blink = ((t + 0.7) % 3.1) < 0.12;
  for (const ex of [-6, 14]) { ctx.beginPath(); ctx.ellipse(ex, -206, 5, blink ? 1 : 4, 0, 0, Math.PI * 2); ctx.fillStyle = '#9fe6ff'; ctx.fill(); }
  ctx.restore();
}
