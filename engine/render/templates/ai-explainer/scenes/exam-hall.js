// Scene "exam-hall" (full frame). A national licence exam hall: a banner board with the exam's name, a wall clock,
// rows of generic cartoon examinees at small desks. Built for exam-cheating / exam-security stories; nobody in it is
// a real person (the cheater is a generic, unnamed figure; the AI is the kit robot in a cloud).
// modes:
//   "hook"    cold open: a top-score answer sheet is already on screen at frame 0, a big stamp (`stamp`, default
//             "CONFESSED") is falling and slams at ~0.5 s (camera kick), then a `pill` ("Police investigating") pops.
//   "scores"  a results board: round 1 value counts up on r1Cue beside a 160-cell answer grid with one wrong cell;
//             round 2 value counts up on r2Cue with a "#1" medal; examinees below look up, "?" bubbles + `sus` pill
//             on susCue.
//   "method"  one desk, close up (the one-line summary reports give, no detail): a camera icon flashes on camCue,
//             a dotted link to the kit robot in a cloud ("AI tool") on aiCue, a link down to a glowing phone on
//             phoneCue; "Round 1" / "Round 2" chips on roundsCue, an accent `extra` pill on cpaCue.
//   "proctor" wide hall, a proctor with a clipboard walks the front aisle; on okCue a check + "Nothing suspicious"
//             pill and a "?" over the hall; on taxCue a licence pill; on csatCue the banner switches to the next
//             exam (`next`, `nextSub`) with a pulsing warning and red alert glow.
// params: mode, exam ("TAX ACCOUNTANT EXAM"), round ("ROUND 2"), score ("663 / 800"), stamp, pill,
//   scores: r1 {value 397.5, max 400, label}, r2 {value 663, max 800}, cells (160), wrong (1), sus, cues r1Cue, r2Cue, susCue
//   method: own ("By their own account"), cam, ai, phone, rounds ["Round 1","Round 2"], extra, camCue, aiCue, phoneCue, roundsCue, cpaCue
//   proctor: ok, tax, next, nextSub, day, okCue, taxCue, csatCue
// Cues are narration words ("word#n" = the (n+1)th time) or seconds.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (typeof w === 'number') return w; if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const mode = P.mode || 'hook';
  const RED = '#ff5a6e';
  const exam = String(P.exam || 'TAX ACCOUNTANT EXAM');

  ctx.save();
  if (mode === 'hook') K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 740 }, { t: D, zoom: 1.0, x: 487, y: 730 }]);
  else if (mode === 'method') K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 487, y: 720 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 480, y: 730 }]);

  // ---------------- room
  const alert = mode === 'proctor' ? K.phase(t, at(P.csatCue, D * 0.75) - 0.2, at(P.csatCue, D * 0.75) + 0.4) : 0;
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#1f2444'); g.addColorStop(0.55, '#283055'); g.addColorStop(1, '#12152b');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  // wall panels + floor
  for (let i = 0; i < 7; i++) { roundRect(ctx, -20 + i * 160, 560, 140, 520, 8); ctx.fillStyle = 'rgba(140,150,200,0.06)'; ctx.fill(); }
  ctx.fillStyle = '#1a1d36'; ctx.fillRect(0, 1040, 1080, 880);
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 9; i++) ctx.fillRect(0, 1060 + i * 46, 1080, 2);
  // ceiling lights
  for (let i = 0; i < 4; i++) { const x = 160 + i * 250; roundRect(ctx, x - 60, 410, 120, 10, 5); ctx.fillStyle = '#dfe4f1'; ctx.fill(); K.glow(ctx, x, 420, 110, '#ffffff', 0.07); }
  if (alert > 0) { const a = alert * (0.10 + 0.07 * Math.sin(t * 6)); ctx.fillStyle = rgba(RED, a); ctx.fillRect(0, 0, 1080, 1920); }

  if (mode === 'hook') drawHook();
  else if (mode === 'scores') drawScores();
  else if (mode === 'method') drawMethod();
  else drawProctor();
  ctx.restore(); // camera

  // ================= helpers
  function banner(text, sub, y0, accentSub) {
    roundRect(ctx, 150, y0, 675, 96, 16); ctx.fillStyle = '#0e1124'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.stroke();
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const f = H.fitText(ctx, text, 'display', 40, 22, sub ? 430 : 620); ctx.font = f.font; ctx.fillStyle = '#ffffff';
    ctx.fillText(f.text, 178, y0 + 50);
    if (sub) { const f2 = H.fitText(ctx, sub, 'display', 36, 20, 190); ctx.font = f2.font; ctx.fillStyle = accentSub || ACC; ctx.textAlign = 'right'; ctx.fillText(f2.text, 798, y0 + 50); }
  }
  function examinee(x, y, s, seed, o = {}) {
    const style = { skin: (seed * 3) % 5, hair: (seed * 2 + 1) % 5, shirt: ['#6f86e0', '#4fb3a6', '#e8786a', '#a08be0', '#e0a84f', '#5fa8d8'][seed % 6], hairStyle: ['short', 'long', 'curly', 'bun', 'short', 'none'][seed % 6] };
    K.drawPerson(ctx, x, y, s, Object.assign({ t, pose: 'sit', seat: false, mood: 'neutral', seed, look: Math.sin(t * 0.7 + seed) * 0.3 }, style, o));
  }
  function smallDesk(x, y, s, paper = true) {
    const w = 150 * s, dy = y - 70 * s;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 10;
    roundRect(ctx, x - w / 2, dy, w, 74 * s, 6); ctx.fillStyle = '#5a3d2c'; ctx.fill(); ctx.restore();
    roundRect(ctx, x - w / 2 - 6, dy - 8, w + 12, 12, 5); ctx.fillStyle = '#7d5841'; ctx.fill();
    if (paper) { ctx.save(); ctx.translate(x, dy - 6); ctx.rotate(-0.05); roundRect(ctx, -34 * s, -6 * s, 68 * s, 10 * s, 2); ctx.fillStyle = '#eef2f8'; ctx.fill(); ctx.restore(); }
  }
  function rowsOfExaminees(rows, cols, x0, x1, skip) {
    rows.forEach((row, r) => {
      for (let c = 0; c < cols; c++) {
        const x = lerp(x0 + r * 8, x1 - r * 8, c / (cols - 1)), seed = r * 7 + c + 3;
        if (skip && skip(r, c)) continue;
        examinee(x, row.y, row.s, seed);
        smallDesk(x, row.y, row.s);
      }
    });
  }
  function qBubble(x, y, s, pop) {
    if (pop <= 0) return;
    ctx.save(); ctx.translate(x, y); const k = Math.min(1.08, 0.4 + 0.6 * pop); ctx.scale(s * k, s * k); ctx.globalAlpha = clamp(pop * 2);
    ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-10, 24); ctx.lineTo(-20, 44); ctx.lineTo(4, 28); ctx.closePath(); ctx.fill();
    ctx.font = H.font('display', 38); ctx.fillStyle = '#20264a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 3);
    ctx.restore();
  }
  function check(x, y, r, k, col) {
    if (k <= 0) return;
    ctx.save(); ctx.beginPath(); ctx.arc(x, y, r * Math.min(1.1, K.popIn(k, 0, 1)), 0, Math.PI * 2); ctx.fillStyle = col || '#43d18b'; ctx.fill();
    ctx.strokeStyle = '#0d2a1c'; ctx.lineWidth = r * 0.22; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    K.pathDraw(ctx, [[x - r * 0.45, y + 0.02 * r], [x - r * 0.1, y + r * 0.38], [x + r * 0.5, y - r * 0.35]], clamp(k * 1.6));
    ctx.restore();
  }
  function answerSheet(cx, cy, s, rot, score) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(s, s);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
    roundRect(ctx, -230, -290, 460, 580, 14); ctx.fillStyle = '#f4f1e8'; ctx.fill(); ctx.restore();
    ctx.fillStyle = '#1f2444'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.font = H.font('ui', 24); ctx.fillText('ANSWER SHEET', -196, -248);
    ctx.font = H.font('body', 22); ctx.fillStyle = '#5b6386'; ctx.fillText(exam, -196, -214);
    // name box: blank (not named)
    roundRect(ctx, 60, -266, 136, 40, 6); ctx.strokeStyle = '#9aa1bd'; ctx.lineWidth = 2; ctx.stroke();
    ctx.font = H.font('body', 18); ctx.fillStyle = '#9aa1bd'; ctx.fillText('NAME', 70, -279);
    // answer lines (handwriting squiggles)
    ctx.strokeStyle = '#5267b8'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const y = -150 + i * 34, w = 330 - 60 * H.hash(i, 3);
      ctx.fillStyle = '#d8d4c8'; ctx.fillRect(-196, y + 12, 392, 2);
      ctx.beginPath();
      for (let k = 0; k <= 24; k++) { const x = -196 + (w * k) / 24; const yy = y + Math.sin(k * 1.9 + i) * 5; k ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
      ctx.stroke();
    }
    // score box
    roundRect(ctx, -196, 140, 392, 118, 14); ctx.fillStyle = '#1f2444'; ctx.fill();
    ctx.font = H.font('ui', 22); ctx.fillStyle = '#aab2d4'; ctx.fillText('SCORE', -170, 168);
    const f = H.fitText(ctx, score, 'display', 64, 30, 300); ctx.font = f.font; ctx.fillStyle = ACC; ctx.fillText(f.text, -170, 220);
    // #1 ribbon
    ctx.save(); ctx.translate(176, 150); ctx.rotate(0.12);
    ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = H.mixHex(ACC, '#000000', 0.55); ctx.beginPath(); ctx.moveTo(-26, 34); ctx.lineTo(-34, 86); ctx.lineTo(-14, 72); ctx.lineTo(-4, 92); ctx.lineTo(6, 40); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    ctx.font = H.font('display', 36); ctx.fillStyle = H.mixHex(ACC, '#000000', 0.7); ctx.textAlign = 'center'; ctx.fillText('#1', 0, 2);
    ctx.restore();
    ctx.restore();
  }

  // ================= modes
  function drawHook() {
    banner(exam, String(P.round || 'ROUND 2'), 450);
    // dim hall behind
    rowsOfExaminees([{ y: 760, s: 0.6 }, { y: 900, s: 0.74 }], 5, 150, 830);
    ctx.fillStyle = 'rgba(10,12,28,0.55)'; ctx.fillRect(0, 560, 1080, 520);
    // sheet settles in (already mostly in place at frame 0)
    const k = H.easeOutCubic(clamp((t + 0.35) / 0.7));
    const slam = 0.5;
    const kick = t > slam ? Math.exp(-(t - slam) * 9) * Math.sin((t - slam) * 40) * 10 : 0;
    ctx.save(); ctx.translate(kick * 0.6, kick);
    answerSheet(487, lerp(880, 755, k), 0.85, lerp(-0.12, -0.04, k), String(P.score || '663 / 800'));
    // the stamp: in the air at frame 0, lands at `slam`
    const land = clamp((t + 0.2) / (slam + 0.2) * 0.6 + (t > slam ? (t - slam) / 0.5 * 0.4 : 0));
    K.drawStamp(ctx, 515, 790, 1.4, { kind: 'cross', text: String(P.stamp || 'CONFESSED'), land });
    ctx.restore();
    const pp = K.popIn(t, 1.4, 0.45);
    if (pp > 0) K.drawLabel(ctx, 487, 1052, pp, { text: String(P.pill || 'Police investigating'), size: 30, dot: true });
  }

  function drawScores() {
    const t1 = at(P.r1Cue, D * 0.15), t2 = at(P.r2Cue, D * 0.5), tS = at(P.susCue, D * 0.82);
    // results board
    roundRect(ctx, 130, 440, 715, 380, 22); ctx.fillStyle = '#0d1022'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.stroke();
    ctx.font = H.font('ui', 24); ctx.fillStyle = '#9aa3bd'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.letterSpacing = '2px'; ctx.fillText('RESULTS · ' + exam, 160, 478); ctx.letterSpacing = '0px';
    const r1 = P.r1 || { value: 397.5, max: 400 }, r2 = P.r2 || { value: 663, max: 800 };
    // round 1 row
    const p1 = K.popIn(t, t1 - 0.3, 0.45);
    if (p1 > 0) {
      ctx.save(); ctx.globalAlpha = clamp(p1 * 2);
      ctx.font = H.font('bold', 30); ctx.fillStyle = '#ffffff'; ctx.fillText('ROUND 1', 160, 530);
      const v = r1.value * K.phase(t, t1 - 0.1, t1 + 1.2, H.easeOutCubic);
      ctx.font = H.font('display', 60); ctx.fillStyle = ACC; ctx.fillText(v.toFixed(1), 160, 594);
      const w = ctx.measureText(v.toFixed(1)).width;
      ctx.font = H.font('bold', 30); ctx.fillStyle = '#c9d0e6'; ctx.fillText('/ ' + r1.max, 160 + w + 12, 600);
      // 160-cell grid, cells tick in; one wrong
      const cells = P.cells || 160, cols = 20, cs = 15, gap = 3, gx = 474, gy = 512;
      const shown = cells * K.phase(t, t1, t1 + 1.6);
      const wrongAt = 113;
      for (let i = 0; i < cells; i++) {
        if (i >= shown) break;
        const cx = gx + (i % cols) * (cs + gap), cy = gy + Math.floor(i / cols) * (cs + gap);
        const bad = i === wrongAt;
        roundRect(ctx, cx, cy, cs, cs, 3); ctx.fillStyle = bad ? RED : '#43d18b'; ctx.fill();
      }
      if (shown > wrongAt) {
        const cx = gx + (wrongAt % cols) * (cs + gap) + cs / 2, cy = gy + Math.floor(wrongAt / cols) * (cs + gap) + cs / 2;
        const pr = 0.5 + 0.5 * Math.sin(t * 5);
        ctx.beginPath(); ctx.arc(cx, cy, 16 + pr * 4, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = RED; ctx.stroke();
      }
      const pl = K.popIn(t, t1 + 1.4, 0.4);
      if (pl > 0) { ctx.globalAlpha = clamp(pl * 2); ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.fillText('1 wrong of 160', 474, 676); }
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(160, 704, 655, 2);
    // round 2 row
    const p2 = K.popIn(t, t2 - 0.3, 0.45);
    if (p2 > 0) {
      ctx.save(); ctx.globalAlpha = clamp(p2 * 2);
      ctx.font = H.font('bold', 30); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.fillText('ROUND 2', 160, 742);
      const v = Math.round(r2.value * K.phase(t, t2 - 0.1, t2 + 1.4, H.easeOutCubic));
      ctx.font = H.font('display', 60); ctx.fillStyle = ACC; ctx.fillText(String(v), 330, 770);
      const w = ctx.measureText(String(v)).width;
      ctx.font = H.font('bold', 30); ctx.fillStyle = '#c9d0e6'; ctx.fillText('/ ' + r2.max, 330 + w + 12, 776);
      const pm = K.popIn(t, t2 + 1.3, 0.45);
      if (pm > 0) {
        ctx.save(); ctx.translate(780, 762); ctx.scale(pm, pm); ctx.rotate(0.1);
        ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
        ctx.font = H.font('display', 32); ctx.fillStyle = H.mixHex(ACC, '#000000', 0.7); ctx.textAlign = 'center'; ctx.fillText('#1', 0, 2);
        ctx.restore();
      }
      ctx.restore();
    }
    // crowd looking up at the board
    const crowd = [[180, 0.92, 2], [330, 1.0, 5], [487, 0.95, 8], [645, 1.0, 11], [800, 0.92, 4]];
    crowd.forEach(([x, s, seed], i) => {
      const style = { skin: (seed * 3) % 5, hair: (seed * 2 + 1) % 5, shirt: ['#6f86e0', '#4fb3a6', '#e8786a', '#a08be0', '#e0a84f', '#5fa8d8'][seed % 6], hairStyle: ['short', 'long', 'curly', 'bun', 'short', 'none'][seed % 6] };
      const sus = t > tS + i * 0.12;
      K.drawPerson(ctx, x, 1045, s * 0.82, Object.assign({ t, pose: sus && i % 2 === 0 ? 'shrug' : 'stand', mood: sus ? 'worried' : 'neutral', seed, look: (487 - x) / 500 }, style));
      qBubble(x + 36, 1045 - 250 * s * 0.82, 0.9, K.popIn(t, tS + i * 0.12, 0.4));
    });
    const ps = K.popIn(t, tS + 0.5, 0.45);
    if (ps > 0) K.drawLabel(ctx, 487, 950, ps, { text: String(P.sus || 'Suspicious for months'), size: 30, accent: true });
  }

  function drawMethod() {
    const tC = at(P.camCue, D * 0.2), tA = at(P.aiCue, D * 0.4), tP = at(P.phoneCue, D * 0.55), tR = at(P.roundsCue, D * 0.75), tX = at(P.cpaCue, D * 0.9);
    // soft hall behind, dimmed
    rowsOfExaminees([{ y: 700, s: 0.5 }, { y: 800, s: 0.58 }], 6, 120, 860);
    ctx.fillStyle = 'rgba(10,12,28,0.6)'; ctx.fillRect(0, 540, 1080, 540);
    // top pill
    const po = K.popIn(t, 0.1, 0.45);
    if (po > 0) K.drawLabel(ctx, 487, 492, po, { text: String(P.own || 'By their own account'), size: 28, dot: true });
    // the examinee at the desk (generic, unnamed)
    const X = 487, Y = 1040, S = 1.3;
    const look = t > tP ? 0.6 : t > tA ? -0.2 : -0.5;
    K.drawPerson(ctx, X, Y - 20, S, { t, pose: 'sit', seat: false, mood: t > tR ? 'worried' : 'neutral', seed: 31, skin: 2, hair: 0, hairStyle: 'short', shirt: '#8a93a8', look });
    // desk in front
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 16;
    roundRect(ctx, 200, 905, 575, 140, 10); ctx.fillStyle = '#5a3d2c'; ctx.fill(); ctx.restore();
    roundRect(ctx, 186, 890, 603, 22, 8); ctx.fillStyle = '#7d5841'; ctx.fill();
    // exam paper on the desk
    ctx.save(); ctx.translate(430, 884); ctx.rotate(-0.04); roundRect(ctx, -90, -12, 180, 16, 3); ctx.fillStyle = '#eef2f8'; ctx.fill(); ctx.restore();
    // the three icons
    const IY = 650;
    const CAM = [250, IY + 10], AI = [487, IY - 20], PH = [725, IY + 10];
    // links
    const l1 = K.phase(t, tA - 0.4, tA + 0.2), l2 = K.phase(t, tP - 0.4, tP + 0.2);
    ctx.save(); ctx.setLineDash([10, 12]); ctx.lineDashOffset = -t * 40; ctx.lineWidth = 5; ctx.strokeStyle = rgba(ACC, 0.9); ctx.lineCap = 'round';
    if (l1 > 0) K.pathDraw(ctx, K.bezier(CAM[0] + 60, CAM[1] - 20, 290, IY - 120, 360, IY - 120, AI[0] - 100, AI[1] - 10, 16), l1);
    if (l2 > 0) K.pathDraw(ctx, K.bezier(AI[0] + 100, AI[1] - 10, 610, IY - 120, 680, IY - 120, PH[0] - 60, PH[1] - 20, 16), l2);
    ctx.restore();
    // packets travelling along the links
    if (l1 >= 1 && t < tP + 1.5) { const u = ((t - tA) * 0.8) % 1; const p = K.pathPoint(K.bezier(CAM[0] + 60, CAM[1] - 20, 290, IY - 120, 360, IY - 120, AI[0] - 100, AI[1] - 10, 16), u); ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill(); }
    if (l2 >= 1) { const u = ((t - tP) * 0.8) % 1; const p = K.pathPoint(K.bezier(AI[0] + 100, AI[1] - 10, 610, IY - 120, 680, IY - 120, PH[0] - 60, PH[1] - 20, 16), u); ctx.beginPath(); ctx.arc(p[0], p[1], 9, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill(); }
    // camera icon (abstract: a small dark box with a lens)
    const pc = K.popIn(t, tC - 0.3, 0.45);
    if (pc > 0) {
      ctx.save(); ctx.translate(CAM[0], CAM[1]); ctx.scale(pc, pc);
      roundRect(ctx, -58, -42, 116, 84, 18); ctx.fillStyle = '#2b3050'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fillStyle = '#11142a'; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fillStyle = '#5f7fd8'; ctx.fill();
      ctx.beginPath(); ctx.arc(-5, -5, 5, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.restore();
      // flash
      const fl = clamp(1 - Math.abs(t - tC - 0.15) / 0.25);
      if (fl > 0) H.glow(ctx, CAM[0], CAM[1], 160, '#ffffff', 0.7 * fl);
      ctx.globalAlpha = clamp(pc * 2); ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(P.cam || 'Tiny camera'), CAM[0], CAM[1] + 76); ctx.globalAlpha = 1;
    }
    // AI cloud with the kit robot
    const pa = K.popIn(t, tA - 0.2, 0.5);
    if (pa > 0) {
      ctx.save(); ctx.translate(AI[0], AI[1]); ctx.scale(pa, pa);
      ctx.fillStyle = '#e9edf8';
      for (const [dx, dy, r] of [[-62, 14, 46], [-18, -18, 58], [40, -6, 52], [74, 20, 40], [0, 26, 50]]) { ctx.beginPath(); ctx.arc(dx, dy, r, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      ctx.save(); ctx.translate(AI[0], AI[1] + 60); ctx.scale(pa, pa);
      K.drawRobot(ctx, 0, 0, 0.5, { t, state: t > tA && t < tP + 0.8 ? 'working' : 'thinking', seed: 4 });
      ctx.restore();
      ctx.globalAlpha = clamp(pa * 2); ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(P.ai || 'AI tool'), AI[0], AI[1] + 100); ctx.globalAlpha = 1;
    }
    // phone with answers
    const pp = K.popIn(t, tP - 0.2, 0.45);
    if (pp > 0) {
      ctx.save(); ctx.translate(PH[0], PH[1] + 60); ctx.scale(pp, pp);
      K.drawPhone(ctx, 0, 0, 0.5, { t: t - tP + 0.4, bubbles: 3, every: 0.35, screen: 'chat' });
      ctx.restore();
      H.glow(ctx, PH[0], PH[1], 90, ACC, 0.12 + 0.06 * Math.sin(t * 4));
      ctx.globalAlpha = clamp(pp * 2); ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(String(P.phone || 'On a phone'), PH[0], PH[1] + 96); ctx.globalAlpha = 1;
    }
    // rounds chips + extra
    const rounds = (P.rounds || ['Round 1', 'Round 2']).slice(0, 2);
    rounds.forEach((r, i) => {
      const p = K.popIn(t, tR + i * 0.25, 0.4);
      if (p > 0) K.drawLabel(ctx, i ? 715 : 260, 850, p, { text: String(r), size: 28, accent: true });
    });
    const px = K.popIn(t, tX, 0.45);
    if (px > 0) K.drawLabel(ctx, 487, 1010, px, { text: String(P.extra || '+ CPA exam, round 1'), size: 30, dot: true });
  }

  function drawProctor() {
    const tOk = at(P.okCue, D * 0.2), tT = at(P.taxCue, D * 0.5), tN = at(P.csatCue, D * 0.75);
    const sw = K.phase(t, tN - 0.2, tN + 0.3);
    if (sw < 0.5) banner(exam, String(P.round || 'ROUND 2'), 450);
    else banner(String(P.next || 'COLLEGE ENTRANCE EXAM'), String(P.nextSub || 'DAYS AWAY'), 450, RED);
    if (sw > 0 && sw < 1) { ctx.fillStyle = rgba('#ffffff', 0.5 * (1 - Math.abs(sw - 0.5) * 2)); roundRect(ctx, 150, 450, 675, 96, 16); ctx.fill(); }
    rowsOfExaminees([{ y: 730, s: 0.62 }, { y: 870, s: 0.74 }], 5, 150, 830);
    // proctor walking along the front, clipboard
    const walkEnd = Math.min(tOk, D * 0.4);
    const k = clamp(t / walkEnd);
    const px = lerp(170, 560, H.easeInOutCubic(k));
    const walking = k < 1;
    K.drawPerson(ctx, px, 1042, 1.05, { t, walk: walking ? t : undefined, pose: walking ? 'stand' : (t > tOk + 0.2 ? 'shrug' : 'stand'), mood: 'neutral', seed: 51, skin: 1, hair: 3, hairStyle: 'bun', shirt: '#4f5a85', look: walking ? 0.5 : -0.3 });
    // lanyard badge + clipboard
    ctx.save(); ctx.translate(px, 1042); ctx.scale(1.05, 1.05);
    roundRect(ctx, -12, -160, 24, 30, 4); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    ctx.fillStyle = ACC; ctx.fillRect(-12, -160, 24, 8);
    ctx.save(); ctx.translate(36, -120); ctx.rotate(0.15);
    roundRect(ctx, -26, -36, 52, 70, 6); ctx.fillStyle = '#8a6a4a'; ctx.fill();
    roundRect(ctx, -21, -28, 42, 58, 3); ctx.fillStyle = '#f4f1e8'; ctx.fill();
    ctx.restore(); ctx.restore();
    check(px + 70, 1042 - 300, 34, clamp((t - tOk) / 0.6));
    const po = K.popIn(t, tOk + 0.3, 0.45);
    if (po > 0) K.drawLabel(ctx, Math.min(px + 70, 700), 1042 - 345, po, { text: String(P.ok || 'Nothing suspicious'), size: 28, dot: true });
    // the "?" over the hall
    qBubble(250, 650, 1.3, K.popIn(t, tOk + 0.9, 0.5) * (1 - 0.6 * sw));
    // licence pill
    const pt = K.popIn(t, tT - 0.3, 0.45);
    if (pt > 0) K.drawLabel(ctx, 487, 610, pt * (1 - sw * 0), { text: String(P.tax || 'The licence for tax pros'), size: 30, accent: true });
    // alert: warning sign + calendar day
    if (sw > 0) {
      const pw = K.popIn(t, tN, 0.5);
      K.drawWarning(ctx, 800, 1030, 0.9 * pw, { pulse: 0.5 + 0.5 * Math.sin(t * 6) });
      const pc = K.popIn(t, tN + 0.4, 0.45);
      if (pc > 0) {
        ctx.save(); ctx.translate(800, 780); ctx.scale(pc, pc);
        roundRect(ctx, -60, -60, 120, 120, 14); ctx.fillStyle = '#f4f6fb'; ctx.fill();
        ctx.save(); roundRect(ctx, -60, -60, 120, 120, 14); ctx.clip(); ctx.fillStyle = RED; ctx.fillRect(-60, -60, 120, 34); ctx.restore();
        ctx.font = H.font('display', 40); ctx.fillStyle = '#1f2444'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(P.day || 'THU'), 0, 18);
        ctx.restore();
      }
    }
  }
}
