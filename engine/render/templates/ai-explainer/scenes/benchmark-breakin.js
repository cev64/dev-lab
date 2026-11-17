// Scene "benchmark-breakin" (full frame, 1 beat). Night street. Left: a glass TEST LAB pen where the kit robot sits
// at a monitor showing a test sheet ("?" answers). Right: an outside platform's building (its name as a text pill, no
// logo). The robot skips the test: a crack opens in the pen, it walks across the street, the building's door bursts,
// the roof siren and windows flash red, and the robot walks back out holding a glowing ANSWERS sheet over its head.
// modes:
//   "hook"   cold open: frame 0 already shows the alarm flashing and the robot at the door with the ANSWERS sheet;
//            a LAWSUIT paper drops in and a stamp slams on `stampCue` (default "sued"), with a camera kick.
//   "story"  the whole break-in, synced to cues; a top pill changes: date -> source -> breach -> answers.
// Fits: "an AI agent broke into a website / company during a test", "cheated a benchmark by taking the answers",
//       "a lawsuit lands over an AI break-in".
// params (all optional): mode, lab ("OPENAI TEST LAB"), site ("HUGGING FACE"), test ("HACKING TEST"),
//        answers ("ANSWERS"), suitHead ("LAWSUIT"), suitTitle ("California v. OpenAI"), stamp ("SUED"),
//        date ("July 2026"), says ("OpenAI's own account"), breach ("Broke into Hugging Face"),
//        took ("Pulled out the answers"), cues: stampCue, testCue, slipCue, breakCue, answersCue, saysCue
const RED = '#ff5a52';

function drawSheet(ctx, H, x, y, s, rot, o) {
  // a glowing answer sheet held up (anchor = bottom centre)
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  H.glow(ctx, 0, -60, 120, o.acc, 0.45 * (o.glow == null ? 1 : o.glow));
  H.roundRect(ctx, -60, -130, 120, 130, 10); ctx.fillStyle = '#f2f4fa'; ctx.fill();
  ctx.fillStyle = o.acc; H.roundRect(ctx, -60, -130, 120, 30, 10); ctx.fill(); ctx.fillRect(-60, -110, 120, 10);
  ctx.font = H.font('ui', 17); ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(o.text, 0, -114);
  ctx.strokeStyle = '#2a8c4a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (let i = 0; i < 3; i++) {
    const yy = -78 + i * 30;
    ctx.beginPath(); ctx.moveTo(-44, yy); ctx.lineTo(-36, yy + 8); ctx.lineTo(-22, yy - 8); ctx.stroke();
    ctx.fillStyle = '#c8cee0'; H.roundRect(ctx, -10, yy - 4, 56 - i * 8, 8, 4); ctx.fill();
  }
  ctx.restore();
}

export function drawSuit(ctx, H, K, x, y, s, o) {
  // a lawsuit paper (centre anchor): header bar, case title, ruled lines
  const W = 470, Hh = 300;
  ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; H.roundRect(ctx, -W / 2 + 10, -Hh / 2 + 14, W, Hh, 18); ctx.fill();
  H.roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 18); ctx.fillStyle = '#f4f6fb'; ctx.fill();
  H.roundRect(ctx, -W / 2, -Hh / 2, W, 74, 18); ctx.fillStyle = '#1b2140'; ctx.fill(); ctx.fillRect(-W / 2, -Hh / 2 + 50, W, 24);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = H.font('display', 40); ctx.fillStyle = '#ffffff'; ctx.fillText(o.head, 0, -Hh / 2 + 39);
  const f = H.fitText(ctx, o.title, 'display', 38, 24, W - 60); ctx.font = f.font; ctx.fillStyle = '#141829';
  ctx.fillText(f.text, 0, -Hh / 2 + 122);
  ctx.fillStyle = '#c8cee0';
  for (let i = 0; i < 4; i++) { H.roundRect(ctx, -W / 2 + 40, -Hh / 2 + 168 + i * 28, (i === 3 ? 220 : W - 80), 10, 5); ctx.fill(); }
  ctx.restore();
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent, N = K.NEUTRAL;
  const { clamp, lerp, smooth, easeOutCubic, roundRect } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const hook = (P.mode || 'story') === 'hook';
  const feet = 1000, PX0 = 96, PX1 = 392, PY0 = 735, BX = 735, DOORX = BX;

  // timeline
  let tTest, tSlip, tBreak, tAns, tSays, tSuit, tStamp;
  if (hook) {
    tTest = -9; tSlip = -8; tBreak = -6; tAns = -2;
    tStamp = Math.max(0.7, at(P.stampCue || 'sued', 0.9));
    tSuit = Math.max(0.15, tStamp - 0.75);
  } else {
    tTest = at(P.testCue, D * 0.3) - 0.3; tSlip = Math.max(tTest + 0.8, at(P.slipCue, D * 0.42) - 0.1);
    tBreak = Math.max(tSlip + 1.6, at(P.breakCue, D * 0.62) - 0.2); tAns = Math.max(tBreak + 1.4, at(P.answersCue, D * 0.88) - 0.6);
    tSays = at(P.saysCue, D * 0.55) - 0.2;
  }
  const alarm = t >= tBreak;
  const flash = alarm ? 0.5 + 0.5 * Math.sin((t - tBreak) * 10) : 0;

  ctx.save();
  if (hook) K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 600, y: 820 }, { t: tStamp, zoom: 1.04, x: 520, y: 760 }, { t: D, zoom: 1.03, x: 500, y: 760 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 487, y: 780 }, { t: tTest + 0.5, zoom: 1.1, x: 300, y: 840 }, { t: tSlip + 0.4, zoom: 1.06, x: 420, y: 830 },
    { t: tBreak + 0.4, zoom: 1.06, x: 620, y: 800 }, { t: D, zoom: 1.04, x: 560, y: 800 }]);
  if (hook) K.cameraShake(ctx, t, tStamp, 0.4, 12); else K.cameraShake(ctx, t, tBreak, 0.4, 9);
  K.world.city(ctx, { t, time: 'night', groundY: feet - 10 });

  // ---- the platform building (right) with a roof siren
  K.drawBuilding(ctx, BX, feet, 0.66, { t, color: '#46608c', floors: 7, lit: 0.55 });
  const bh = (60 + 7 * 44) * 0.66, btop = feet - bh;
  if (alarm) {
    ctx.save(); ctx.globalAlpha = 0.18 + 0.32 * flash; ctx.fillStyle = RED;
    roundRect(ctx, BX - 73, btop, 146, bh - 4, 8); ctx.fill(); ctx.restore();
  }
  // siren on the roof
  const sy = btop - 34;
  roundRect(ctx, BX - 26, sy + 6, 52, 14, 5); ctx.fillStyle = '#2b3150'; ctx.fill();
  ctx.beginPath(); ctx.arc(BX, sy + 6, 22, Math.PI, 0); ctx.fillStyle = alarm ? (flash > 0.5 ? RED : '#b03a33') : '#59607e'; ctx.fill();
  if (alarm) {
    H.glow(ctx, BX, sy - 4, 120, RED, 0.55 * flash);
    ctx.save(); ctx.strokeStyle = H.rgba(RED, 0.8 * flash); ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (const a of [-2.5, -1.9, -1.25, -0.65]) { ctx.beginPath(); ctx.moveTo(BX + Math.cos(a) * 32, sy + Math.sin(a) * 32); ctx.lineTo(BX + Math.cos(a) * 50, sy + Math.sin(a) * 50); ctx.stroke(); }
    ctx.restore();
  }
  // name pill above
  K.drawLabel(ctx, BX, sy - 52, K.popIn(t, hook ? -1 : 0.1, 0.4), { text: P.site || 'HUGGING FACE', size: 26, dot: true });
  // door burst: the door panels swing (flash) once
  if (alarm && t < tBreak + 0.5) {
    const k = (t - tBreak) / 0.5;
    ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = ACC; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) { const a = -Math.PI + (i / 7) * Math.PI, r0 = 40 + 50 * k; ctx.beginPath(); ctx.moveTo(DOORX + Math.cos(a) * r0, feet - 30 + Math.sin(a) * r0); ctx.lineTo(DOORX + Math.cos(a) * (r0 + 22), feet - 30 + Math.sin(a) * (r0 + 22)); ctx.stroke(); }
    ctx.restore();
  }
  if (alarm) K.drawWarning(ctx, BX + 100, btop - 6, 0.5 * K.popIn(t, tBreak + 0.15, 0.4), { pulse: flash });

  // ---- the test lab pen (left)
  ctx.save();
  roundRect(ctx, PX0 + 8, feet - 30, PX1 - PX0 - 16, 30, 8); ctx.fillStyle = '#2b3150'; ctx.fill();
  // monitor with the test sheet
  const mx = 308, my = 820;
  roundRect(ctx, mx - 6, my + 70, 12, 60, 4); ctx.fillStyle = '#20253f'; ctx.fill();
  roundRect(ctx, mx - 62, feet - 34, 124, 10, 5); ctx.fill();
  roundRect(ctx, mx - 72, my - 54, 144, 124, 12); ctx.fillStyle = '#20253f'; ctx.fill();
  roundRect(ctx, mx - 62, my - 44, 124, 104, 8); ctx.fillStyle = '#eef1f8'; ctx.fill();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  { const f = H.fitText(ctx, P.test || 'HACKING TEST', 'ui', 16, 11, 112); ctx.font = f.font; ctx.fillStyle = '#141829'; ctx.fillText(f.text, mx, my - 28); }
  for (let i = 0; i < 3; i++) {
    const yy = my + i * 24;
    ctx.fillStyle = '#c8cee0'; roundRect(ctx, mx - 56, yy - 5, 66, 10, 5); ctx.fill();
    const q = hook || t > tSlip ? 0.35 : 1;
    ctx.globalAlpha = q; ctx.font = H.font('display', 20); ctx.fillStyle = RED; ctx.fillText('?', mx + 38, yy + 1); ctx.globalAlpha = 1;
  }
  if (!hook && t >= tTest && t < tSlip + 0.5) H.glow(ctx, mx, my, 120, ACC, 0.35 * K.popIn(t, tTest, 0.4));
  ctx.restore();
  // robot position
  let rx, ry = feet, rstate = 'working', rflip = false, ralpha = 1, carrying = 0;
  if (hook) {
    rx = lerp(DOORX - 150, DOORX - 215, smooth(clamp(t / 3))); rstate = 'happy'; rflip = true; carrying = 1;
  } else if (t < tSlip) { rx = 168; rstate = t >= tTest ? 'thinking' : 'working'; }
  else if (t < tBreak) {
    const u = smooth(clamp((t - tSlip) / (tBreak - tSlip - 0.1)));
    rx = lerp(168, DOORX, u); ry = feet - Math.abs(Math.sin(u * Math.PI * 5)) * 10; rstate = 'idle';
    ralpha = 1 - clamp((t - tBreak + 0.25) / 0.25);
  } else if (t < tAns) { rx = DOORX; ralpha = 0; }
  else {
    const u = smooth(clamp((t - tAns) / 1.6));
    rx = lerp(DOORX, DOORX - 225, u); rstate = 'happy'; rflip = true; carrying = K.popIn(t, tAns + 0.1, 0.5); ralpha = clamp((t - tAns) / 0.25);
  }
  if (ralpha > 0) {
    ctx.save(); ctx.globalAlpha = ralpha;
    K.drawRobot(ctx, rx, ry, 1.05, { t, state: rstate, flip: rflip, seed: 5 });
    if (carrying > 0) drawSheet(ctx, H, rx + 10, ry - 250 + K.bob(t, 6, 1.6), Math.min(1.05, carrying), -0.12 + 0.05 * Math.sin(t * 3), { acc: ACC, text: P.answers || 'ANSWERS' });
    ctx.restore();
  }
  // glass walls + crack (drawn over the robot while it is inside)
  roundRect(ctx, PX0, PY0, PX1 - PX0, feet - PY0 + 4, 16);
  ctx.fillStyle = 'rgba(140,200,255,0.08)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(170,220,255,0.7)'; ctx.stroke();
  const crack = hook ? 1 : (t >= tSlip - 0.3 ? clamp((t - tSlip + 0.3) / 0.35) : 0);
  if (crack > 0) {
    ctx.save(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.lineJoin = 'round';
    K.pathDraw(ctx, [[PX1, 790], [PX1 - 20, 830], [PX1 + 8, 870], [PX1 - 16, 920], [PX1 + 6, 990]], crack);
    ctx.restore();
  }
  K.drawLabel(ctx, (PX0 + PX1) / 2, PY0 - 12, K.popIn(t, hook ? -1 : 0.25, 0.4), { text: P.lab || 'OPENAI TEST LAB', size: 24 });

  // ---- the lawsuit lands (hook)
  if (hook) {
    const k = easeOutCubic(clamp((t - tSuit) / 0.55));
    if (t >= tSuit) {
      const y = lerp(300, 640, k), rot = lerp(-0.25, -0.05, k);
      ctx.save(); ctx.globalAlpha = clamp((t - tSuit) / 0.2);
      drawSuit(ctx, H, K, 300, y, 0.8, { rot, head: P.suitHead || 'LAWSUIT', title: P.suitTitle || 'California v. OpenAI' });
      ctx.restore();
    }
    if (t >= tStamp - 0.25) K.drawStamp(ctx, 410, 830, 0.62, { kind: 'cross', text: P.stamp || 'SUED', land: (t - tStamp + 0.25) / 0.5 });
  }
  ctx.restore();
  // ---- top pills (story)
  if (!hook) {
    const pill = (text, a, b, o = {}) => {
      if (t < a || t > b + 0.3) return;
      ctx.save(); ctx.globalAlpha *= K.fadeOut(t, b, 0.3);
      K.drawLabel(ctx, 487, 520, K.popIn(t, a, 0.4), { text, size: 32, dot: !o.accent, accent: o.accent });
      ctx.restore();
    };
    pill(P.date || 'July 2026', 0.2, Math.min(tSays, tBreak) - 0.1);
    if (tSays < tBreak) pill(P.says || "OpenAI's own account", tSays, tBreak - 0.1);
    pill(P.breach || 'Broke into Hugging Face', tBreak, tAns - 0.1, { accent: true });
    pill(P.took || 'Pulled out the answers', tAns, D + 1, { accent: true });
  }

  void N;
}
