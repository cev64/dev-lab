// Scene "self-build" (full frame; one mode per beat). A night robot workshop where AI helps build the next AI.
// modes:
//   cold   - cold open: a builder robot is already "printing" a bigger robot (scan beam, sparks) while a wall speed
//            gauge swings up to a dashed red LINE tick and a warning light flashes; the new robot's eyes light up.
//   filing - a thick filing booklet on a lectern: RISK FACTORS header, a verbatim line types in, highlighter sweeps
//            it; a date pill; a company stand-in robot with a text name pill; "its own line" pill + dashed line.
//   double - two lanes: "normal pace" robot covers 1 year of progress while the "double speed" robot covers 2 in the
//            same year (calendar bar fills); a "2 years in 1" pill lands; an "AI does much of the research" pill.
//   loop   - a researcher works at a desk with the robot assistant; a speed streak zips past behind her; she turns
//            around too late (dust trail, gauge already high) and a "noticed only afterwards" pill lands.
//   human  - the builder robot keeps building alone; a verbatim risk quote card + warning; an "alone" chip gets a
//            cross; an engineer walks in to a control desk, the build pauses, "humans in control" pill + draft rules.
//   caveat - three steps on one floor: a thought cloud "own forecast / future models"; current robots wait behind a
//            dashed floor line (none over it); two skeptics walk in by the booklet with an "also marketing?" pill.
// params: mode, plus per-mode text (company, doc, head, line, by, date, ownLine, ...) and cues (see each mode).
// Cues are narration words; without them each mode uses fixed fractions of its duration.
// Defaults are generic placeholders ("COMPANY", "FILING", "Date", placeholder filing line and quote, no highlight
// words, no cue words): pass the story's verbatim line, quote, `hot` words and cues.
// Fits: AI-builds-AI / self-improvement / capability-threshold stories; "a lab warns about its own progress".
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration;
  const mode = P.mode || 'cold';
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const env = { H, K, P, D, info, at, ACC: info.accent };
  ctx.save();
  ({ cold, filing, double: dbl, loop, human, caveat }[mode] || cold)(ctx, t, env);
  ctx.restore();
}

// ---------------------------------------------------------------- shared pieces
function workshop(ctx, t, E, o = {}) {
  const { H, K } = E;
  K.world.room(ctx, { t, time: 'night', lamp: o.lamp !== false, window: false, picture: false, plant: false });
  // pegboard of tools + a parts shelf on the back wall
  ctx.save();
  H.roundRect(ctx, 70, 455, 300, 190, 14); ctx.fillStyle = 'rgba(20,24,44,0.55)'; ctx.fill();
  for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.arc(95 + i * 42, 480 + j * 44, 3, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill(); }
  ctx.fillStyle = '#8a93a8'; ctx.fillRect(120, 500, 10, 70); ctx.fillRect(108, 495, 34, 12);
  ctx.fillStyle = '#e8786a'; ctx.fillRect(200, 505, 60, 14); ctx.fillStyle = '#6f86e0'; ctx.fillRect(290, 498, 12, 80);
  ctx.restore();
}

function gauge(ctx, E, x, y, r, v, line, o = {}) {
  const { H, ACC } = E, A0 = Math.PI * 0.85, A1 = Math.PI * 2.15;
  const ang = (u) => A0 + (A1 - A0) * u;
  ctx.save();
  ctx.beginPath(); ctx.arc(x, y, r + 18, 0, Math.PI * 2); ctx.fillStyle = '#1b2036'; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = '#3b4260'; ctx.stroke();
  ctx.lineCap = 'round';
  ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.arc(x, y, r - 10, A0, A1); ctx.stroke();
  ctx.strokeStyle = H.rgba(ACC, 0.9); ctx.beginPath(); ctx.arc(x, y, r - 10, A0, ang(Math.min(v, line))); ctx.stroke();
  if (v > line) { ctx.strokeStyle = '#ff6b5e'; ctx.beginPath(); ctx.arc(x, y, r - 10, ang(line), ang(v)); ctx.stroke(); }
  for (let i = 0; i <= 10; i++) { const a = ang(i / 10); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * (r - 30), y + Math.sin(a) * (r - 30)); ctx.lineTo(x + Math.cos(a) * (r - 40), y + Math.sin(a) * (r - 40)); ctx.stroke(); }
  // the dashed red line tick
  const la = ang(line); ctx.setLineDash([8, 7]); ctx.lineWidth = 5; ctx.strokeStyle = '#ff6b5e';
  ctx.beginPath(); ctx.moveTo(x + Math.cos(la) * (r - 52), y + Math.sin(la) * (r - 52)); ctx.lineTo(x + Math.cos(la) * (r + 14), y + Math.sin(la) * (r + 14)); ctx.stroke(); ctx.setLineDash([]);
  if (o.lineLabel) { ctx.font = H.font('ui', 24); ctx.fillStyle = '#ff8a7e'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.lineLabel, x + Math.cos(la) * (r + 44), y + Math.sin(la) * (r + 44) - 6); }
  // needle
  const na = ang(v); ctx.lineWidth = 9; ctx.strokeStyle = '#ffffff';
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(na) * (r - 34), y + Math.sin(na) * (r - 34)); ctx.stroke();
  ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
  if (o.label) { ctx.font = H.font('ui', 24); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.textAlign = 'center'; ctx.fillText(o.label, x, y + r * 0.5); }
  ctx.restore();
}

// a robot being built: the finished part is solid up to `prog`, the rest is a faint wireframe; a scan beam + sparks
function printRobot(ctx, E, t, x, y, s, prog, o = {}) {
  const { H, K, ACC } = E, top = y - 236 * s, cut = y - (y - top) * prog;
  // stand
  H.roundRect(ctx, x - 120 * s, y - 6, 240 * s, 22, 10); ctx.fillStyle = '#3b4260'; ctx.fill();
  ctx.save(); ctx.globalAlpha = 0.18; K.drawRobot(ctx, x, y, s, { t, state: 'idle', seed: 11 }); ctx.restore();
  ctx.save(); ctx.beginPath(); ctx.rect(x - 200 * s, cut, 400 * s, y - cut + 40); ctx.clip();
  K.drawRobot(ctx, x, y, s, { t, state: o.state || 'idle', seed: 11 }); ctx.restore();
  if (prog < 1) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, cut - 20, 0, cut + 20); g.addColorStop(0, H.rgba(ACC, 0)); g.addColorStop(0.5, H.rgba(ACC, 0.9)); g.addColorStop(1, H.rgba(ACC, 0));
    ctx.fillStyle = g; ctx.fillRect(x - 150 * s, cut - 20, 300 * s, 40);
    // sparks from a frame-stepped hash (deterministic)
    const f = Math.floor(t * 18);
    for (let i = 0; i < 9; i++) {
      const u = H.hash(f, i), w = H.hash(i, f + 7), sx = x + (u - 0.5) * 220 * s, sy = cut + (w - 0.5) * 14;
      ctx.strokeStyle = H.rgba('#ffe9a8', 0.8); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + (w - 0.5) * 40, sy - 10 - u * 26); ctx.stroke();
    }
    ctx.restore();
  }
}

function card(ctx, E, x0, y0, w, h, o = {}) {
  const { H, ACC } = E;
  H.roundRect(ctx, x0, y0, w, h, 24); ctx.fillStyle = o.light ? '#f4f6fb' : 'rgba(10,12,22,0.92)'; ctx.fill();
  if (!o.light) { ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(o.edge || ACC, 0.6); ctx.stroke(); }
}

function popScale(ctx, k, cx, cy) { const s = Math.min(1.03, 0.6 + 0.4 * k); ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); }

function warnLight(ctx, E, x, y, t, on) {
  const { H } = E;
  H.roundRect(ctx, x - 26, y, 52, 18, 6); ctx.fillStyle = '#3b4260'; ctx.fill();
  const blink = on ? 0.5 + 0.5 * Math.sin(t * 14) : 0;
  ctx.beginPath(); ctx.arc(x, y, 24, Math.PI, 0); ctx.fillStyle = H.mixHex('#7a2a24', '#ff4a3a', blink); ctx.fill();
  if (blink > 0.05) H.glow(ctx, x, y - 6, 120, '#ff4a3a', 0.35 * blink);
}

// ---------------------------------------------------------------- cold open
function cold(ctx, t, E) {
  const { H, K, P, D } = E;
  K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 487, y: 735 }, { t: D, zoom: 1.07, x: 500, y: 735 }]);
  workshop(ctx, t, E);
  const prog = 0.45 + 0.55 * K.phase(t, 0, 2.3, H.easeInOutCubic);
  // needle: rises fast, overshoots toward the line, wobbles just under it
  const rise = K.phase(t, 0, 2.0, H.easeOutCubic);
  const v = 0.4 + 0.42 * rise + (t > 1.6 ? 0.025 * Math.sin((t - 1.6) * 16) * Math.exp(-(t - 1.6) * 1.2) : 0);
  gauge(ctx, E, 680, 600, 118, v, 0.86, { lineLabel: P.lineText || 'THE LINE', label: P.gauge || 'AI speed-up' });
  warnLight(ctx, E, 880, 470, t, t > 1.5);
  printRobot(ctx, E, t, 560, 1032, 1.35, prog, { state: t > 2.4 ? 'happy' : 'idle' });
  K.drawRobot(ctx, 215, 1035, 1.0, { t, state: 'working', seed: 3 });
  // a cable from the builder's hands to the new robot
  ctx.save(); ctx.strokeStyle = H.rgba(E.ACC, 0.7); ctx.lineWidth = 5; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 60;
  ctx.beginPath(); ctx.moveTo(260, 920); ctx.quadraticCurveTo(360, 860, 450, 900); ctx.stroke(); ctx.restore();
  const pk = K.popIn(t, 0.05, 0.4);
  if (pk > 0) K.drawLabel(ctx, 230, 770, Math.min(1.05, pk), { text: P.tag || 'AI building AI', size: 28, dot: true });
}

// ---------------------------------------------------------------- the filing
function filing(ctx, t, E) {
  const { H, K, P, D, at, ACC } = E, { clamp, roundRect, rgba } = H;
  const tDoc = at(P.docCue, D * 0.2) - 0.5;
  const tDate = at(P.dateCue, D * 0.3) - 0.1;
  const tCo = at(P.coCue, D * 0.4) - 0.1;
  const tHl = at(P.hlCue, D * 0.5) - 0.1;
  const tLine = at(P.lineCue, D * 0.58) - 0.1;
  const tFast = at(P.fastCue, D * 0.75) - 0.1;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: tHl, zoom: 1.05, x: 450, y: 700 }, { t: D, zoom: 1.07, x: 450, y: 700 }]);
  workshop(ctx, t, E);
  K.drawLectern(ctx, 360, 1035, 0.9, {});
  const BX = 360, BY = 1035 - 232 * 0.9 + 8, BW = 560, BH = 380;
  const ok = K.popIn(t, tDoc, 0.5);
  if (ok > 0) {
    ctx.save(); popScale(ctx, ok, BX, BY);
    roundRect(ctx, BX - BW / 2 - 12, BY - BH - 8, BW + 24, BH + 16, 16); ctx.fillStyle = '#3b4672'; ctx.fill();
    roundRect(ctx, BX - BW / 2, BY - BH, BW / 2 - 4, BH, 10); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    roundRect(ctx, BX + 4, BY - BH, BW / 2 - 4, BH, 10); ctx.fillStyle = '#f6f7fb'; ctx.fill();
    ctx.fillStyle = '#d5dae8'; ctx.fillRect(BX - 3, BY - BH, 6, BH);
    ctx.font = H.font('display', 50); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3b4672';
    ctx.fillText(P.doc || 'FILING', BX - BW / 4, BY - BH + 64);
    ctx.font = H.font('ui', 22); ctx.fillStyle = '#7a84a8'; ctx.fillText(P.docSub || 'Company filing', BX - BW / 4, BY - BH + 108);
    for (let i = 0; i < 8; i++) { roundRect(ctx, BX - BW / 2 + 30, BY - BH + 150 + i * 26, (BW / 2 - 70) * (0.6 + 0.4 * H.hash(i, 3)), 9, 4); ctx.fillStyle = '#d5dae8'; ctx.fill(); }
    const hk = clamp((t - tDoc - 0.5) / 0.4);
    ctx.globalAlpha = hk; ctx.font = H.font('ui', 22); ctx.fillStyle = '#c0392b'; ctx.textAlign = 'left';
    ctx.fillText(P.head || 'RISK FACTORS', BX + 26, BY - BH + 38); ctx.globalAlpha = 1;
    const line = String(P.line || 'A verbatim line from the filing goes here, word for word, exactly as published.');
    ctx.font = H.font('bold', 23);
    const lines = []; let cur = '';
    for (const w of line.split(' ')) { const n = cur ? cur + ' ' + w : w; if (cur && ctx.measureText(n).width > BW / 2 - 50) { lines.push(cur); cur = w; } else cur = n; }
    if (cur) lines.push(cur);
    const shown = K.typewriter(line, t, 30, tDoc + 0.8).length;
    let used = 0;
    const hot = (P.hot || []).map((s) => s.toLowerCase());
    lines.forEach((ln, i) => {
      const y = BY - BH + 78 + i * 31;
      const take = clamp(shown - used, 0, ln.length); used += ln.length + 1;
      // highlight: the whole line block sweeps on hlCue, row by row
      const hl = clamp((t - tHl - i * 0.25) / 0.45);
      if (hl > 0 && take > 0) { ctx.fillStyle = rgba(ACC, 0.7); ctx.fillRect(BX + 22, y - 16, (ctx.measureText(ln).width + 8) * hl, 32); }
      ctx.fillStyle = '#161927'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      let txt = ln.slice(0, take); const sp = txt.lastIndexOf(' ');
      if (take < ln.length) txt = sp > 0 ? txt.slice(0, sp) : '';
      ctx.fillText(txt, BX + 26, y);
      void hot;
    });
    ctx.font = H.font('ui', 19); ctx.fillStyle = rgba('#161927', 0.6); ctx.textAlign = 'left';
    if (shown >= line.length) ctx.fillText(P.by || 'Company, filing', BX + 26, BY - 18);
    ctx.restore();
  }
  // company stand-in robot on the right, with a text name pill (no logo)
  K.drawRobot(ctx, 790, 1035, 0.95, { t, state: t > tFast ? 'thinking' : 'idle', seed: 4, flip: true });
  const ck = K.popIn(t, tCo, 0.4);
  if (ck > 0) K.drawLabel(ctx, 790, 795, Math.min(1.05, ck), { text: P.company || 'COMPANY', size: 24, accent: true });
  const dk = K.popIn(t, tDate, 0.4);
  if (dk > 0) K.drawLabel(ctx, 790, 540, Math.min(1.05, dk), { text: P.date || 'Date', size: 24, dot: true });
  // "its own line": a pill in the right column with a dashed red bar drawing under it
  const lk = K.phase(t, tLine, tLine + 0.6, H.easeOutCubic);
  if (lk > 0) {
    const pk = K.popIn(t, tLine, 0.4);
    K.drawLabel(ctx, 790, 650, Math.min(1.05, pk), { text: P.ownLine || 'Its own line', size: 26 });
    ctx.save(); ctx.setLineDash([14, 10]); ctx.lineWidth = 7; ctx.strokeStyle = '#ff6b5e';
    ctx.beginPath(); ctx.moveTo(690, 680); ctx.lineTo(690 + 200 * lk, 680); ctx.stroke(); ctx.restore();
  }
}

// ---------------------------------------------------------------- double speed
function dbl(ctx, t, E) {
  const { H, K, P, D, at, ACC } = E, { clamp, roundRect, rgba } = H;
  const tPol = at(P.policyCue, D * 0.3) - 0.2;
  const tGo = at(P.goCue, D * 0.4) - 0.1;
  const tEnd = at(P.endCue, D * 0.7);
  const tAI = at(P.aiCue, D * 0.9) - 0.6;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 487, y: 740 }]);
  // a night track field
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#121733'); g.addColorStop(0.5, '#1f2650'); g.addColorStop(1, '#0b0e1f');
  ctx.fillStyle = g; ctx.fillRect(-80, -80, 1240, 2080);
  for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(H.hash(i, 1) * 1080, 200 + H.hash(i, 2) * 500, 1.5 + H.hash(i, 3) * 2, 0, Math.PI * 2); ctx.fillStyle = rgba('#ffffff', 0.2 + 0.3 * (0.5 + 0.5 * Math.sin(t * 2 + i))); ctx.fill(); }
  const X0 = 130, X1 = 860, lanes = [{ y: 800, label: P.slow || 'Normal pace', dist: 0.5, end: P.slowEnd || '1 year of progress' },
    { y: 1010, label: P.fast || 'Double speed', dist: 1.0, end: P.fastEnd || '2 years of progress' }];
  const run = K.phase(t, tGo, tEnd, (u) => u);
  lanes.forEach((L, i) => {
    roundRect(ctx, X0 - 40, L.y - 14, X1 - X0 + 80, 28, 14); ctx.fillStyle = '#2a3160'; ctx.fill();
    for (let k = 0; k <= 4; k++) { const x = X0 + (X1 - X0) * k / 4; ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(x - 2, L.y - 22, 4, 44); }
    const u = L.dist * run;
    roundRect(ctx, X0 - 40, L.y - 14, 40 + (X1 - X0) * u + 1, 28, 14); ctx.fillStyle = i ? ACC : rgba('#ffffff', 0.55); ctx.fill();
    const rx = X0 + (X1 - X0) * u, moving = run > 0 && run < 1, hop = moving ? Math.abs(Math.sin(t * (i ? 14 : 8))) * (i ? 14 : 8) : 0;
    if (i && moving) { ctx.strokeStyle = rgba(ACC, 0.6); ctx.lineWidth = 5; ctx.lineCap = 'round'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(rx - 60, L.y - 50 - k * 26); ctx.lineTo(rx - 120 - k * 10, L.y - 50 - k * 26); ctx.stroke(); } }
    K.drawRobot(ctx, rx, L.y - 14 - hop, 0.6, { t, state: moving ? 'working' : (run >= 1 && i ? 'happy' : 'idle'), seed: 5 + i });
    // lane label on the right until the robot arrives, then the "how far" pill over where it stopped
    const ek = K.popIn(t, tEnd - 0.1 + i * 0.15, 0.4);
    if (ek <= 0) K.drawLabel(ctx, X1 - 90, L.y - 40, 1, { text: L.label, size: 24, accent: !!i });
    else K.drawLabel(ctx, i ? X1 - 150 : 700, i ? L.y - 160 : L.y - 40, Math.min(1.05, ek), { text: L.end, size: 24, accent: !!i, dot: !i });
  });
  // the "one year" calendar card at the top
  const ck = K.popIn(t, 0.1, 0.4);
  if (ck > 0) {
    ctx.save(); popScale(ctx, ck, 487, 505);
    const done = t > tEnd;
    roundRect(ctx, 130, 460, 714, 92, 22); ctx.fillStyle = done ? ACC : 'rgba(10,12,22,0.9)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.5); ctx.stroke();
    ctx.font = H.font('display', 34); ctx.fillStyle = done ? '#141829' : '#ffffff'; ctx.textAlign = done ? 'center' : 'left'; ctx.textBaseline = 'middle';
    if (done) ctx.fillText(P.stamp || '2 years of progress in 1', 487, 507);
    else {
      ctx.fillText(t < tGo ? (P.ask || 'How fast is "dramatic"?') : (P.year || 'One year:'), 162, 507);
      if (t >= tGo) { for (let m = 0; m < 12; m++) { const on = run * 12 > m; roundRect(ctx, 420 + m * 33, 489, 26, 36, 6); ctx.fillStyle = on ? ACC : 'rgba(255,255,255,0.15)'; ctx.fill(); } }
    }
    ctx.restore();
  }
  const pk = K.popIn(t, tPol, 0.4), pOut = clamp((t - tAI) / 0.3);
  if (pk > 0 && pOut < 1) { ctx.save(); ctx.globalAlpha = 1 - pOut; K.drawLabel(ctx, 487, 625, Math.min(1.05, pk), { text: P.policy || "Per the company's safety policy", size: 24 }); ctx.restore(); }
  const ak = K.popIn(t, tAI, 0.4);
  if (ak > 0) K.drawLabel(ctx, 487, 625, Math.min(1.05, ak), { text: P.ai || 'AI doing much of the research', size: 26, dot: true });
}

// ---------------------------------------------------------------- research helper + the missed speed-up
function loop(ctx, t, E) {
  const { H, K, P, D, at, ACC } = E, { clamp, rgba } = H;
  const tHelp = at(P.helpCue, D * 0.15) - 0.2;
  const tZip = at(P.zipCue, D * 0.5) - 0.2;
  const tTurn = at(P.turnCue, D * 0.78) - 0.1;
  const tAfter = at(P.afterCue, D * 0.85);
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.06, x: 470, y: 740 }]);
  workshop(ctx, t, E);
  // wall gauge: needle jumps while nobody watches
  const jump = K.phase(t, tZip + 0.2, tZip + 0.9, H.easeOutCubic);
  gauge(ctx, E, 800, 600, 88, 0.3 + 0.5 * jump, 0.86, { label: P.gauge || 'Speed-up' });
  // desk with a laptop, the researcher (back to the gauge) and the robot assistant
  K.drawDesk(ctx, 330, 1035, 1.25);
  K.drawLaptop(ctx, 300, 1035 - 110 * 1.25 + 6, 0.9, { t, screen: 'code', typing: 1 });
  const turned = t > tTurn;
  K.drawPerson(ctx, 140, 1035, 1.35, { t, pose: turned ? 'shrug' : 'point', mood: turned ? 'shocked' : 'happy', hair: 2, hairStyle: 'bun', shirt: 1, skin: 1, flip: turned, look: turned ? -1 : 1, seed: 2 });
  const hk = K.popIn(t, tHelp, 0.5);
  K.drawRobot(ctx, 520, 1035, 0.95, { t, state: t > tHelp ? 'working' : 'idle', seed: 9, flip: true });
  if (hk > 0) K.drawLabel(ctx, 470, 760, Math.min(1.05, hk), { text: P.help || 'AI helps with research', size: 26, dot: true });
  // the speed streak zips across behind them
  const z = clamp((t - tZip) / 0.8);
  if (z > 0 && z < 1) {
    const x = -150 + 1350 * H.easeInOutCubic(z), y = 600;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 6; k++) { ctx.strokeStyle = rgba(ACC, 0.5 - k * 0.07); ctx.lineWidth = 10 - k; ctx.beginPath(); ctx.moveTo(x - 40, y - 30 + k * 12); ctx.lineTo(x - 320, y - 30 + k * 12); ctx.stroke(); }
    ctx.restore();
    K.drawRobot(ctx, x, y + 70, 0.55, { t, state: 'happy', seed: 13 });
  }
  // the dust trail it leaves
  if (t > tZip + 0.6) {
    const a = clamp(1 - (t - tZip - 0.6) / 4) * 0.6 + 0.15;
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(120 + i * 95, 650 + Math.sin(i * 1.7) * 12, 18 + 8 * H.hash(i, 4), 0, Math.PI * 2); ctx.fillStyle = rgba('#c7cde0', a * (0.5 + 0.5 * H.hash(i, 5))); ctx.fill(); }
  }
  if (turned) K.drawSpeechBubble(ctx, 230, 760, 1, { text: '!', size: 44, tail: 'left', pop: K.popIn(t, tTurn, 0.3) });
  const ak = K.popIn(t, tAfter - 0.3, 0.45);
  if (ak > 0) K.drawLabel(ctx, 380, 540, Math.min(1.05, ak), { text: P.after || 'Spotted only afterwards', size: 28, accent: true });
  if (hk > 0 && ak <= 0) { /* keep */ }
}

// ---------------------------------------------------------------- safety risk + humans in control
function human(ctx, t, E) {
  const { H, K, P, D, at, ACC } = E, { clamp, roundRect, rgba } = H;
  const tRisk = at(P.riskCue, D * 0.3) - 0.3;
  const tAlone = at(P.aloneCue, D * 0.65) - 0.2;
  const tWalk = at(P.walkCue, D * 0.75) - 0.6;
  const tCtl = at(P.ctlCue, D * 0.88) - 0.2;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 500, y: 735 }]);
  workshop(ctx, t, E);
  const paused = t > tCtl;
  const prog = clamp(0.2 + 0.7 * Math.min(t, tCtl) / Math.max(1, tCtl));
  printRobot(ctx, E, paused ? tCtl : t, 600, 1032, 1.2, prog, {});
  K.drawRobot(ctx, 330, 1035, 0.95, { t, state: paused ? 'idle' : 'working', seed: 3 });
  // warning light + the verbatim quote card
  warnLight(ctx, E, 880, 470, t, t > tRisk && !paused);
  const qk = K.popIn(t, tRisk, 0.45), qOut = clamp((t - tAlone + 0.3) / 0.35);
  if (qk > 0 && qOut < 1) {
    ctx.save(); ctx.globalAlpha = 1 - qOut; popScale(ctx, qk, 487, 560);
    card(ctx, E, 110, 470, 754, 190, { edge: '#ff6b5e' });
    K.drawWarning(ctx, 190, 600, 0.55, { pulse: 0.5 + 0.5 * Math.sin(t * 6) });
    ctx.font = H.font('display', 44); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(P.quote || '“Quote goes here.”', 260, 548);
    ctx.font = H.font('ui', 22); ctx.fillStyle = 'rgba(255,255,255,0.65)';
    ctx.fillText(P.by || 'Source, Date', 262, 610);
    ctx.restore();
  }
  // "alone?" chip with a cross over the builder
  const ak = K.popIn(t, tAlone, 0.4), aOut = clamp((t - tWalk - 0.2) / 0.35);
  if (ak > 0 && aOut < 1) {
    ctx.save(); ctx.globalAlpha = 1 - aOut;
    K.drawLabel(ctx, 487, 560, Math.min(1.05, ak), { text: P.alone || 'Building future models alone?', size: 28 });
    K.drawStamp(ctx, 470, 770, 0.8, { kind: 'cross', text: P.no || 'NOT SAFELY', land: clamp((t - tAlone - 0.3) / 0.5) });
    ctx.restore();
  }
  // the engineer walks in from the right to the control desk
  const wk = K.phase(t, tWalk, tWalk + 1.4, H.easeInOutCubic);
  if (wk > 0) {
    K.drawDesk(ctx, 830, 1035, 0.6);
    // a big switch on the desk
    roundRect(ctx, 800, 952, 60, 22, 6); ctx.fillStyle = '#3b4260'; ctx.fill();
    const lever = paused ? K.phase(t, tCtl, tCtl + 0.4, H.easeOutBack) : 0;
    ctx.save(); ctx.translate(830, 960); ctx.rotate(-0.6 + 1.2 * lever); ctx.fillStyle = '#c8cee0'; ctx.fillRect(-5, -60, 10, 60);
    ctx.beginPath(); ctx.arc(0, -62, 14, 0, Math.PI * 2); ctx.fillStyle = paused ? ACC : '#ff6b5e'; ctx.fill(); ctx.restore();
    const px = 1160 - 360 * wk;
    K.drawPerson(ctx, px, 1035, 1.3, { t, pose: paused ? 'point' : 'stand', walk: wk < 1 ? t : 0, mood: 'neutral', flip: true, hair: 0, hairStyle: 'short', shirt: 0, skin: 3, seed: 4 });
  }
  const ck = K.popIn(t, tCtl, 0.45);
  if (ck > 0) {
    K.drawLabel(ctx, 487, 560, Math.min(1.05, ck), { text: P.control || 'Keep humans in control', size: 30, accent: true });
    K.drawLabel(ctx, 487, 640, Math.min(1.05, K.popIn(t, tCtl + 0.45, 0.4)), { text: P.rules || 'New safety rules: being considered', size: 24, dot: true });
  }
}

// ---------------------------------------------------------------- the caveat
function caveat(ctx, t, E) {
  const { H, K, P, D, at, ACC } = E, { clamp, roundRect, rgba } = H;
  const tFc = at(P.forecastCue, D * 0.2) - 0.3;
  const tFut = at(P.futureCue, D * 0.3) - 0.1;
  const tCur = at(P.currentCue, D * 0.5) - 0.3;
  const tSk = at(P.skepticCue, D * 0.72) - 0.3;
  const tMk = at(P.marketCue, D * 0.9) - 0.4;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 735 }]);
  workshop(ctx, t, E, { lamp: true });
  // the dashed line on the floor (in perspective) and the current robots behind it
  const LY = 1000;
  const lg = clamp((t - tCur) / 0.5);
  ctx.save(); ctx.setLineDash([22, 14]); ctx.lineWidth = 7; ctx.strokeStyle = rgba('#ff6b5e', 0.35 + 0.65 * lg);
  ctx.beginPath(); ctx.moveTo(70, LY + 30); ctx.lineTo(910, LY + 30); ctx.stroke(); ctx.restore();
  if (lg > 0) { ctx.font = H.font('ui', 22); ctx.fillStyle = '#ff8a7e'; ctx.textAlign = 'right'; ctx.textBaseline = 'top'; ctx.globalAlpha = lg; ctx.fillText(P.lineText || 'THE LINE', 905, LY + 42); ctx.globalAlpha = 1; }
  const skIn = K.phase(t, tSk, tSk + 1.0, H.easeInOutCubic);
  const shiftX = -100 * skIn; // robots slide left to make room for the skeptics
  [0, 1, 2].forEach((i) => {
    const x = 230 + i * 160 + shiftX, k = K.popIn(t, 0.1 + i * 0.12, 0.4);
    if (k > 0) K.drawRobot(ctx, x, LY - 4, 0.72 * Math.min(1, k), { t, state: t > tCur && t < tSk ? 'thinking' : 'idle', seed: 20 + i });
  });
  if (t > tCur) {
    const ck = K.popIn(t, tCur + 0.2, 0.4), cOut = clamp((t - tSk) / 0.35);
    if (cOut < 1) { ctx.save(); ctx.globalAlpha = 1 - cOut; K.drawLabel(ctx, 487, 560, Math.min(1.05, ck), { text: P.none || 'No current model over the line', size: 30, accent: true }); ctx.restore(); }
  }
  // phase 1: the thought cloud with a dashed "future model" silhouette
  const fk = K.popIn(t, tFc, 0.5), fOut = clamp((t - tCur) / 0.4);
  if (fk > 0 && fOut < 1) {
    ctx.save(); ctx.globalAlpha = 1 - fOut; popScale(ctx, fk, 487, 600);
    ctx.fillStyle = 'rgba(244,246,251,0.95)';
    [[330, 610, 90], [430, 560, 110], [560, 560, 105], [660, 610, 85], [495, 650, 120]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = (1 - fOut) * 0.9;
    [[300, 760, 16], [270, 800, 10]].forEach(([x, y, r]) => { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1 - fOut;
    ctx.font = H.font('display', 36); ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.forecast || 'Its own forecast', 495, 540);
    if (t > tFut) {
      const u = clamp((t - tFut) / 0.4);
      ctx.globalAlpha = (1 - fOut) * u; ctx.font = H.font('ui', 28); ctx.fillStyle = '#3b4672';
      ctx.fillText(P.future || 'about FUTURE models', 495, 600);
      ctx.save(); ctx.setLineDash([8, 7]); ctx.lineWidth = 4; ctx.strokeStyle = '#6f7aa8';
      roundRect(ctx, 450, 630, 90, 60, 22); ctx.stroke(); roundRect(ctx, 458, 695, 74, 40, 14); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
  }
  // phase 3: skeptics with arms out by the filing booklet, "also marketing?"
  if (skIn > 0) {
    const bx = 760 + (1 - skIn) * 400;
    // booklet standing up, with a small megaphone on its cover
    ctx.save(); ctx.translate(bx, 860);
    roundRect(ctx, -80, -110, 160, 220, 12); ctx.fillStyle = '#3b4672'; ctx.fill();
    roundRect(ctx, -66, -96, 132, 192, 8); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.font = H.font('display', 30); ctx.fillStyle = '#3b4672'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.doc || 'FILING', 0, -62);
    const mk = K.popIn(t, tMk, 0.4);
    if (mk > 0) {
      ctx.save(); ctx.scale(mk, mk); ctx.fillStyle = ACC;
      ctx.beginPath(); ctx.moveTo(-36, 6); ctx.lineTo(24, -26); ctx.lineTo(24, 62); ctx.lineTo(-36, 30); ctx.closePath(); ctx.fill();
      roundRect(ctx, -52, 4, 20, 28, 5); ctx.fill();
      ctx.strokeStyle = ACC; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (let k = 0; k < 3; k++) { const a = -0.5 + k * 0.5; ctx.beginPath(); ctx.moveTo(34 + Math.cos(a) * 10, 18 + Math.sin(a) * 30); ctx.lineTo(34 + Math.cos(a) * 26, 18 + Math.sin(a) * 42); ctx.stroke(); }
      ctx.restore();
    }
    ctx.restore();
    const px = 610 + (1 - skIn) * 500;
    K.drawPerson(ctx, px, LY + 30, 1.05, { t, pose: t > tMk ? 'shrug' : 'stand', walk: skIn < 1 ? t : 0, mood: 'neutral', flip: true, hair: 1, hairStyle: 'curly', shirt: 3, skin: 2, seed: 6 });
    const sk = K.popIn(t, tSk + 0.5, 0.4);
    if (sk > 0) K.drawLabel(ctx, 487, 560, Math.min(1.05, sk), { text: P.skeptics || 'Skeptics: a filing is also marketing', size: 28 });
  }
}
