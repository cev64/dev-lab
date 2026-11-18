// Scene "grok-reach" (full frame). Night room. Bottom left: a desk with the owner's laptop (lid shuts, "Z z").
// Upper left: a cartoon cloud with the kit robot agent working on a cloud computer. Right: a column of generic app
// doors (Email / Calendar / Code: icon + text, no logos). The agent shoots long reaching arms (a limb with a grabby
// hand) at the doors while a big counter ("31 requests, unasked") runs; a gateway barrier drops in front of the doors
// and every reach bounces off with a HELD tag.
// modes:
//   "hook"  cold open: at frame 0 the agent is already reaching, the counter is running, the laptop is shut; a STOP
//           sign pops up and is ignored (the reaching goes on), then the agent says a short line (`said`).
//   "story" (best as a 2-beat span) laptop open -> agent pops into the cloud (name pill) -> "own cloud computer" pill
//           -> laptop lid shuts (Z z) -> a second agent + firm pill + "5 days" chip -> counter counts to `count` while
//           arms reach -> doors light on their cues -> barrier drops, HELD stamps -> barrier label + "sells it" pill.
// Fits: "an AI agent reached into apps nobody asked it to", "N unapproved access attempts", "a gateway held them".
// params (all optional): mode, count (31), countLabel ("requests, unasked"), agent ("Grok Bot"),
//        cloud ("Its own cloud computer"), firm ("Security firm: NewCore"), days ("5 days"), bots (2 in story),
//        doors [{text, icon mail|cal|code|chat|file|note, cue}] (max 3), gate ("NewCore's gateway"),
//        sells ("A product it sells"), held ("HELD"), stop ("STOP"), said ("...I was idle."),
//        cues: agentCue, cloudCue, shutCue, firmCue, daysCue, countCue, appsCue, noneCue, gateCue, sellsCue
const RED = '#ff5a52';

export function appIcon(ctx, H, kind, x, y, s, col) {
  // simple generic glyphs, centre anchor, ~60 px at s = 1
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (kind === 'mail') {
    H.roundRect(ctx, -32, -22, 64, 44, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-30, -18); ctx.lineTo(0, 6); ctx.lineTo(30, -18); ctx.stroke();
  } else if (kind === 'cal') {
    H.roundRect(ctx, -28, -24, 56, 50, 6); ctx.stroke();
    ctx.fillRect(-28, -24, 56, 14);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) ctx.fillRect(-18 + c * 14, -2 + r * 12, 8, 7);
    ctx.fillRect(-16, -32, 6, 12); ctx.fillRect(10, -32, 6, 12);
  } else if (kind === 'code') {
    ctx.beginPath(); ctx.moveTo(-14, -18); ctx.lineTo(-30, 0); ctx.lineTo(-14, 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, -18); ctx.lineTo(30, 0); ctx.lineTo(14, 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -24); ctx.lineTo(-6, 24); ctx.stroke();
  } else if (kind === 'chat') {
    H.roundRect(ctx, -30, -24, 60, 38, 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, 14); ctx.lineTo(-20, 28); ctx.lineTo(0, 14); ctx.stroke();
  } else if (kind === 'file') {
    ctx.beginPath(); ctx.moveTo(-22, -28); ctx.lineTo(10, -28); ctx.lineTo(24, -14); ctx.lineTo(24, 28); ctx.lineTo(-22, 28); ctx.closePath(); ctx.stroke();
    ctx.fillRect(-12, -6, 26, 5); ctx.fillRect(-12, 6, 26, 5);
  } else { // note
    H.roundRect(ctx, -24, -28, 48, 56, 6); ctx.stroke();
    for (let i = 0; i < 3; i++) ctx.fillRect(-14, -14 + i * 12, 28 - i * 6, 5);
  }
  ctx.restore();
}

export function appDoor(ctx, H, K, x, y, o) {
  // a generic app "door" tile, centre anchor 170x118: icon + text label; o: text, icon, lit 0..1, red 0..1, pop
  const pop = o.pop == null ? 1 : o.pop; if (pop <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop);
  const W = o.w || 170, Hh = o.h || 118;
  if (o.lit > 0) H.glow(ctx, 0, 0, 150, o.acc, 0.35 * o.lit);
  if (o.red > 0) H.glow(ctx, 0, 0, 150, RED, 0.45 * o.red);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; H.roundRect(ctx, -W / 2 + 6, -Hh / 2 + 8, W, Hh, 20); ctx.fill();
  H.roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 20);
  ctx.fillStyle = H.mixHex('#2b3260', o.acc, 0.25 * (o.lit || 0)); ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = o.red > 0 ? H.mixHex('#8e98c8', RED, o.red) : H.mixHex('#8e98c8', o.acc, o.lit || 0); ctx.stroke();
  // door knob strip on the right edge
  H.roundRect(ctx, W / 2 - 18, -14, 8, 28, 4); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
  appIcon(ctx, H, o.icon, 0, -16, 0.8, '#ffffff');
  ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(o.text, 0, 34);
  ctx.restore();
}

function drawCloud(ctx, H, x, y, w, glowA, acc) {
  // cartoon cloud, centre anchor
  if (glowA > 0) H.glow(ctx, x, y, w * 0.8, acc, 0.22 * glowA);
  const blobs = [[-0.36, 0.12, 0.2], [-0.16, -0.08, 0.26], [0.12, -0.12, 0.28], [0.34, 0.06, 0.22], [0, 0.14, 0.26]];
  ctx.fillStyle = '#3c4680';
  for (const [dx, dy, r] of blobs) { ctx.beginPath(); ctx.arc(x + dx * w, y + dy * w + 8, r * w, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#d8def5';
  for (const [dx, dy, r] of blobs) { ctx.beginPath(); ctx.arc(x + dx * w, y + dy * w, r * w, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = '#b9c1e6'; H.roundRect(ctx, x - w * 0.5, y + w * 0.12, w, w * 0.16, w * 0.08); ctx.fill();
}

function reachArm(ctx, H, x0, y0, x1, y1, u, col, grab) {
  // a long robot arm from (x0,y0) toward (x1,y1); u 0..1 = how far it has reached; grabby hand at the tip
  if (u <= 0) return null;
  const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 70;
  const pts = []; for (let i = 0; i <= 24; i++) { const k = (i / 24) * u; const a = 1 - k; pts.push([a * a * x0 + 2 * a * k * mx + k * k * x1, a * a * y0 + 2 * a * k * my + k * k * y1]); }
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#5a6288'; ctx.lineWidth = 16; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  ctx.strokeStyle = '#c9cfe6'; ctx.lineWidth = 10; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  // joints
  for (let i = 6; i < pts.length; i += 6) { ctx.fillStyle = '#9aa3c6'; ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], 9, 0, Math.PI * 2); ctx.fill(); }
  const [hx, hy] = pts[pts.length - 1];
  H.glow(ctx, hx, hy, 50, col, 0.5);
  ctx.fillStyle = '#e8ebf7'; ctx.beginPath(); ctx.arc(hx, hy, 15, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e8ebf7'; ctx.lineWidth = 7;
  const open = 0.5 + 0.5 * grab;
  for (const d of [-1, 0, 1]) { const a = d * 0.6 * open; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(a) * 26, hy + Math.sin(a) * 26); ctx.stroke(); }
  ctx.restore();
  return [hx, hy];
}

function drawLaptopShut(ctx, H, K, x, y, s, lid, t) {
  // laptop seen from the front; lid 1 = open (kit laptop), 0 = shut (flat slab with a sleep light)
  if (lid > 0.98) { K.drawLaptop(ctx, x, y, s, { t, screen: 'chat', typing: false }); return; }
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const h = 138 * lid;
  if (h > 4) {
    H.roundRect(ctx, -112, -12 - h, 224, h, 10); ctx.fillStyle = '#20253f'; ctx.fill();
  }
  ctx.beginPath(); ctx.moveTo(-130, -16); ctx.lineTo(130, -16); ctx.lineTo(122, 0); ctx.lineTo(-122, 0); ctx.closePath(); ctx.fillStyle = '#cfd5ea'; ctx.fill();
  H.roundRect(ctx, -126, -26, 252, 12, 5); ctx.fillStyle = '#9aa2c4'; ctx.fill();
  const blink = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2.4));
  ctx.fillStyle = H.rgba('#ffffff', blink * (1 - lid)); ctx.beginPath(); ctx.arc(100, -8, 4, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function zzz(ctx, H, x, y, t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i < 3; i++) {
    const ph = ((t * 0.6 + i / 3) % 1);
    ctx.globalAlpha = a * Math.sin(ph * Math.PI);
    ctx.font = H.font('display', 26 + i * 6); ctx.fillStyle = '#c9d2ff';
    ctx.fillText('Z', x + ph * 40 + i * 6, y - ph * 70);
  }
  ctx.restore();
}

function stopSign(ctx, H, x, y, p, text) {
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
  ctx.fillStyle = '#5a6288'; ctx.fillRect(-5, 40, 10, 110);
  ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; ctx.lineTo(Math.cos(a) * 62, Math.sin(a) * 62); } ctx.closePath();
  ctx.fillStyle = RED; ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.stroke();
  // raised hand glyph
  ctx.fillStyle = '#ffffff';
  H.roundRect(ctx, -16, -8, 32, 30, 10); ctx.fill();
  for (let i = 0; i < 4; i++) { H.roundRect(ctx, -16 + i * 8.5, -34 + (i === 0 || i === 3 ? 6 : 0), 7, 32, 3.5); ctx.fill(); }
  H.roundRect(ctx, 12, -4, 16, 8, 4); ctx.fill();
  ctx.font = H.font('display', 20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 38);
  ctx.restore();
}

function gateBar(ctx, H, x, y0, y1, drop, acc, flash) {
  // vertical gateway barrier: two posts + a striped bar that drops in from above
  if (drop <= 0) return;
  const off = (1 - drop) * -(y1 - y0 + 120);
  ctx.save(); ctx.translate(0, off);
  ctx.globalAlpha = Math.min(1, drop * 1.5);
  if (flash > 0) H.glow(ctx, x, (y0 + y1) / 2, 260, acc, 0.4 * flash);
  H.roundRect(ctx, x - 22, y0, 44, y1 - y0, 14); ctx.fillStyle = '#1b2140'; ctx.fill();
  ctx.save(); H.roundRect(ctx, x - 18, y0 + 4, 36, y1 - y0 - 8, 12); ctx.clip();
  for (let yy = y0 - 40; yy < y1; yy += 44) { ctx.fillStyle = acc; ctx.beginPath(); ctx.moveTo(x - 20, yy); ctx.lineTo(x + 20, yy - 24); ctx.lineTo(x + 20, yy - 2); ctx.lineTo(x - 20, yy + 22); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  // padlock on the bar
  ctx.fillStyle = '#e8ebf7'; H.roundRect(ctx, x - 26, (y0 + y1) / 2 - 10, 52, 42, 8); ctx.fill();
  ctx.strokeStyle = '#e8ebf7'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(x, (y0 + y1) / 2 - 10, 15, Math.PI, 0); ctx.stroke();
  ctx.fillStyle = '#1b2140'; ctx.beginPath(); ctx.arc(x, (y0 + y1) / 2 + 8, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function heldTag(ctx, H, x, y, p, text) {
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.12); ctx.scale(p, p);
  ctx.font = H.font('display', 24);
  const w = ctx.measureText(text).width + 28;
  H.roundRect(ctx, -w / 2, -20, w, 40, 10); ctx.fillStyle = RED; ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 0, 2);
  ctx.restore();
}

function counter(ctx, H, K, x, y, n, label, p, acc) {
  if (p <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
  ctx.font = H.font('display', 84); const nw = ctx.measureText(String(n)).width;
  ctx.font = H.font('ui', 28); const lw = ctx.measureText(label).width;
  const W = Math.max(nw + lw + 70, 300), Hh = 104;
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; H.roundRect(ctx, -W / 2 + 6, -Hh / 2 + 8, W, Hh, 26); ctx.fill();
  H.roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 26); ctx.fillStyle = '#0d1022'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = acc; ctx.stroke();
  ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  ctx.font = H.font('display', 84); ctx.fillStyle = acc; ctx.fillText(String(n), -W / 2 + 26, 6);
  ctx.font = H.font('ui', 28); ctx.fillStyle = '#ffffff'; ctx.fillText(label, -W / 2 + 26 + nw + 18, 4);
  ctx.restore();
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const hook = P.mode === 'hook';
  const count = Math.max(1, Math.round(+P.count || 31));
  const doors = (P.doors || [
    { text: 'Email', icon: 'mail', cue: 'email' },
    { text: 'Calendar', icon: 'cal', cue: 'calendars' },
    { text: 'Code', icon: 'code', cue: 'code' },
  ]).slice(0, 3);
  const DX = 742, DY = [628, 772, 916];
  const GX = 610;
  const CX = 300, CY = 640;

  // ---- timeline
  let tAgent, tCloud, tShut, tBot2, tFirm, tDays, tCount, tCountEnd, tDoor, tGate, tGateLbl, tSells, tStop, tSaid;
  if (hook) {
    tAgent = -5; tCloud = -5; tShut = -5; tBot2 = Infinity; tFirm = Infinity; tDays = Infinity;
    tCount = -1.2; tCountEnd = 2.0; tDoor = [-1, -1, -1]; tGate = Infinity; tGateLbl = Infinity; tSells = Infinity;
    tStop = 0.55; tSaid = Math.min(D - 1.0, 2.35);
  } else {
    tAgent = at(P.agentCue, D * 0.1) - 0.35;
    tCloud = Math.max(tAgent + 0.6, at(P.cloudCue, D * 0.18) - 0.3);
    tShut = Math.max(tCloud + 0.6, at(P.shutCue, D * 0.28) - 0.4);
    tFirm = Math.max(tShut + 0.6, at(P.firmCue, D * 0.36) - 0.3);
    tBot2 = tFirm + 0.5;
    tDays = Math.max(tFirm + 0.8, at(P.daysCue, D * 0.48) - 0.3);
    tCount = Math.max(tDays + 0.8, at(P.countCue, D * 0.58) - 0.3);
    const firstDoor = at(P.appsCue, tCount + 1.6);
    tDoor = doors.map((d, i) => Math.max(tCount + 0.3 + i * 0.4, at(d.cue, firstDoor + i * 0.6) - 0.25));
    tGate = Math.max(tDoor[doors.length - 1] + 0.5, at(P.noneCue, D * 0.78) - 0.35);
    tCountEnd = tGate;
    tGateLbl = Math.max(tGate + 0.6, at(P.gateCue, tGate + 1.2) - 0.3);
    tSells = Math.max(tGateLbl + 0.6, at(P.sellsCue, tGateLbl + 1.4) - 0.3);
    tStop = Infinity; tSaid = Infinity;
  }
  const gateDrop = smooth(clamp((t - tGate) / 0.45));

  ctx.save();
  if (hook) K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 520, y: 740 }, { t: D, zoom: 1.0, x: 487, y: 730 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 330, y: 820 }, { t: tFirm, zoom: 1.02, x: 450, y: 740 }, { t: tCount, zoom: 1.0, x: 487, y: 730 }, { t: D, zoom: 1.03, x: 500, y: 735 }]);
  K.cameraShake(ctx, t, tGate + 0.3, 0.3, 7);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true, plant: false, floorY: 960 });

  // ---- desk + laptop (bottom left)
  K.drawDesk(ctx, 250, 1030, 1.0);
  const lid = 1 - smooth(clamp((t - tShut) / 0.5));
  drawLaptopShut(ctx, H, K, 250, 926, 1.05, lid, t);
  zzz(ctx, H, 330, 830, t, clamp((t - tShut - 0.4) / 0.4));
  K.props.mug(ctx, 130, 926, 0.9, t);

  // ---- the cloud with the agent(s)
  const cPop = hook ? 1 : K.popIn(t, tAgent - 0.15, 0.5);
  if (cPop > 0) {
    ctx.save(); ctx.translate(CX, CY); ctx.scale(cPop, cPop); ctx.translate(-CX, -CY);
    drawCloud(ctx, H, CX, CY + 40, 290, clamp((t - tCloud) / 0.4), ACC);
    // cloud computer screen behind the bots
    const scr = hook ? 1 : smooth(clamp((t - tCloud) / 0.4));
    if (scr > 0) {
      ctx.globalAlpha = scr;
      H.roundRect(ctx, CX - 80, CY - 120, 160, 100, 12); ctx.fillStyle = '#121633'; ctx.fill();
      H.roundRect(ctx, CX - 70, CY - 110, 140, 80, 8); ctx.fillStyle = H.mixHex('#1c2350', ACC, 0.18 + 0.08 * Math.sin(t * 3)); ctx.fill();
      for (let r = 0; r < 4; r++) { ctx.fillStyle = r % 2 ? ACC : 'rgba(255,255,255,0.6)'; H.roundRect(ctx, CX - 58, CY - 100 + r * 17, 50 + 60 * H.hash(r, 3), 7, 3); ctx.fill(); }
      ctx.fillStyle = '#121633'; ctx.fillRect(CX - 6, CY - 20, 12, 18);
      ctx.globalAlpha = 1;
    }
    const two = !hook && t > tBot2;
    const p2 = two ? K.popIn(t, tBot2, 0.45) : 0;
    const reaching = t > tCount - 0.2 && t < tGate + 0.8;
    const rx1 = two ? CX - 60 * smooth(clamp((t - tBot2) / 0.4)) : CX;
    K.drawRobot(ctx, rx1, CY + 70, 0.6, { t, state: reaching || (t > tShut && t < tFirm) ? 'working' : 'idle', talk: hook && t > tSaid ? info.env : 0, seed: 3 });
    if (p2 > 0) K.drawRobot(ctx, CX + 70, CY + 70, 0.6 * p2, { t, state: reaching ? 'working' : 'idle', seed: 9 });
    ctx.restore();
  }
  // name pill + cloud pill (above the cloud)
  const nameP = hook ? 1 : K.popIn(t, tAgent, 0.4);
  if (nameP > 0) K.drawLabel(ctx, CX, 505, nameP, { text: P.agent || 'Grok Bot', size: 28, accent: true });
  const cloudP = hook ? 0 : K.popIn(t, tCloud, 0.4) * (1 - smooth(clamp((t - tFirm) / 0.3)));
  if (cloudP > 0) K.drawLabel(ctx, CX, 790, cloudP, { text: P.cloud || 'Its own cloud computer', size: 24, dot: true });

  // ---- app doors (right)
  const doorAppear = hook ? -5 : tFirm;
  const heldP = [];
  doors.forEach((d, i) => {
    const pop = K.popIn(t, doorAppear + i * 0.15, 0.45);
    const lit = hook ? 0.5 + 0.5 * Math.sin(t * 6 + i * 2) : clamp((t - tDoor[i]) / 0.3) * (1 - 0.7 * gateDrop);
    const red = hook ? clamp(Math.sin(t * 5 + i * 1.7) * 0.6 + 0.2) : 0;
    appDoor(ctx, H, K, DX, DY[i], { text: d.text, icon: d.icon, pop, lit, red, acc: ACC });
  });

  // ---- reaching arms (from the robot toward each door), repeating; with the gate down they bounce back
  const hand0 = [CX + 40, CY - 10];
  if (t > tCount - 0.2 && t < (hook ? D + 1 : tGate + 1.6)) {
    for (let i = 0; i < doors.length; i++) {
      const per = 1.1, off = i * 0.37;
      const local = ((t - tCount + off) % per + per) % per;
      let u = local < 0.45 ? smooth(local / 0.45) : local < 0.75 ? 1 : 1 - smooth((local - 0.75) / 0.35);
      if (!hook && t < tDoor[i] - 0.2 && t > tCount) u *= 0.75;           // before its cue: shorter reaches
      const target = gateDrop > 0.5 ? GX - 34 : DX - 90;
      const fade = hook ? 1 : 1 - clamp((t - tGate - 0.9) / 0.6);
      if (fade <= 0) continue;
      ctx.save(); ctx.globalAlpha = fade;
      const tip = reachArm(ctx, H, hand0[0], hand0[1], target, DY[i], u, ACC, Math.sin(t * 12 + i));
      ctx.restore();
      if (tip && gateDrop > 0.5 && u > 0.95) { H.glow(ctx, GX - 30, DY[i], 70, RED, 0.6 * fade); }
    }
  }

  // ---- gateway barrier + HELD
  gateBar(ctx, H, GX, 560, 980, gateDrop, ACC, clamp(1 - (t - tGate - 0.45) / 0.6));
  doors.forEach((d, i) => { const hp = K.popIn(t, tGate + 0.45 + i * 0.15, 0.4); heldTag(ctx, H, DX + 30, DY[i] - 52, hp, P.held || 'HELD'); });
  const glP = K.popIn(t, tGateLbl, 0.4);
  if (glP > 0) K.drawLabel(ctx, 600, 1010, glP, { text: P.gate || "NewCore's gateway", size: 26, dot: true });
  const sP = K.popIn(t, tSells, 0.4);
  if (sP > 0) K.drawLabel(ctx, 300, 790, sP, { text: P.sells || 'A product it sells', size: 24 });

  // ---- firm + days pills (story)
  const fP = K.popIn(t, tFirm, 0.4) * (1 - smooth(clamp((t - tCount + 0.2) / 0.3)));
  if (fP > 0) K.drawLabel(ctx, 640, 505, fP, { text: P.firm || 'Security firm: NewCore', size: 28, dot: true });
  const dP = K.popIn(t, tDays, 0.4) * (1 - smooth(clamp((t - tCount + 0.2) / 0.3)));
  if (dP > 0) K.drawLabel(ctx, 520, 1010, dP, { text: P.days || '2 bots, 5 days', size: 26, accent: true });

  // ---- counter (top centre once counting)
  const cntP = hook ? 1 : K.popIn(t, tCount, 0.45);
  if (cntP > 0) {
    const k = clamp((t - tCount) / Math.max(0.5, tCountEnd - tCount));
    const n = hook ? Math.max(1, Math.round(count * (0.55 + 0.45 * smooth(clamp((t + 0.2) / 2.2))))) : Math.max(1, Math.round(count * smooth(k)));
    // name pill sits at 512 (cloud). The counter goes right of it in story, centred in hook.
    counter(ctx, H, K, 640, 495, n, P.countLabel || 'requests, unasked', cntP, ACC);
  }

  // ---- hook: STOP sign (ignored) + the agent's line
  if (hook) {
    const sp = K.popIn(t, tStop, 0.4);
    stopSign(ctx, H, 505, 800, sp * 0.95, P.stop || 'STOP');
    const said = K.popIn(t, tSaid, 0.4);
    if (said > 0) K.drawSpeechBubble(ctx, CX + 80, CY + 2, 1, { text: P.said || '"...I was idle."', size: 30, maxW: 300, tail: 'left', pop: said });
  }
  ctx.restore();
}
