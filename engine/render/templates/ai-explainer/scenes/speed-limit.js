// Scene "speed-limit" (full frame, 1 beat per mode). An industry "speed limit" for AI told as a night highway:
// cartoon robot drivers in go-karts (generic kit robots, kart colours only, no logos) race along a side-view road;
// a speed-limit sign whose number is "?" (no number set) slams down and they brake. Other modes reuse the road or
// move indoors (whiteboard, a big gauge). Fits: "labs propose a shared cap / threshold / pause on AI progress".
// modes:
//   hook    cold open: karts already racing at frame 0 (parallax + speed lines), the sign drops and lands at ~0.8 s
//           (dust + camera shake), karts brake to a stop by ~2 s, `tag` pill on the post ("PROPOSED").
//   lab     night room: a generic cartoon scientist at a whiteboard draws a falling line; `who` pill (whoCue), a
//           blog-post page + `date` pill (postCue), a yellow "ONE SHARED YARDSTICK" ruler (rulerCue), a red dashed
//           LIMIT line across the chart (lineCue) and a `agree` pill (agreeCue).
//   gauge   wall gauge labelled `metric`: right = lower score; a sentence card shows next-chunk prediction
//           (predictCue), needle swings right with a "LOWER = BETTER" pill (lowerCue), card flips to `shares` (sharesCue).
//   road    one kart drives past three roadside posts; cards pop over each on cue: falling scores (c1Cue), `v2` +
//           `v2Label` + skill chip (v2Cue, skill2Cue), `v3` + "transformative" + two chips (v3Cue, tfCue, chipACue, chipBCue).
//   limit   three karts roll up and stop at a dashed limit line + closed barrier (limitCue); a booth panel
//           "UNDERSTAND + MONITOR AI" fills toward a MILESTONE flag (monitorCue); a person with a phone walks in with a
//           pocket pill (pocketCue).
//   caveat  settled road: the "?" sign, ONLY A PROPOSAL stamp (stampCue), three unknown pills (noNumCue, checkCue,
//           rivalCue); the karts get "?" bubbles on rivalCue.
// Cues: narration words ("word#n" = the (n+1)th time) or seconds; without them fixed fractions of the scene.
// Library defaults are generic placeholders ("Lab chief scientist", "DATE", "Model A/B", "~X", "< X", "Skill one/two",
// gauge ticks 5..1); pass the story's names and published figures. Extra params: signTop, signBottom (sign text),
// metric, ticks [5] (gauge labels, left to right), sentence, guess, skill2a/b, tfLabel/2, limitLabel, mon1/2,
// milestone, brakeLabel, pocketLabel, no1-no3, stamp, tag, landAt, tagAt.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, easeOutCubic, easeInOutCubic, roundRect, rgba, mixHex } = H;
  const TAU = Math.PI * 2;
  const cue = (v, frac) => {
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && v) {
      const [w, n] = v.split('#'); const s = info.timeOf(w, n ? parseInt(n, 10) : 0);
      if (s != null) return s;
    }
    return D * frac;
  };
  const ph = (a, b, e) => (e || easeInOutCubic)(clamp((t - a) / Math.max(1e-6, b - a)));
  const pop = (a, dur) => K.popIn(t, a, dur || 0.38);
  const mode = P.mode || 'hook';
  const GY = 990;            // road top (kart wheels sit on GY + 30)
  const RED = '#ff5e57', WHITE = '#f4f6fb', INK = '#141829';
  const KART = ['#ff8a3d', '#4cc9ff', '#b48cff'];

  // ------------------------------------------------------------------ shared drawing
  function sky(off, moon = true) {
    const g = ctx.createLinearGradient(0, 0, 0, GY);
    g.addColorStop(0, '#070a1f'); g.addColorStop(0.7, '#1a2150'); g.addColorStop(1, '#3a3570');
    ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, GY + 200);
    for (let i = 0; i < 46; i++) {
      const x = ((H.hash(i, 31) * 1300 - off * 0.05) % 1300 + 1300) % 1300 - 110, y = 140 + H.hash(i, 32) * 560;
      ctx.fillStyle = `rgba(255,255,255,${0.14 + 0.3 * Math.abs(Math.sin(t * 1.3 + i))})`; ctx.fillRect(x, y, 3, 3);
    }
    if (moon) { K.glow(ctx, 200, 520, 70, '#fff6d8', 0.35); ctx.beginPath(); ctx.arc(200, 520, 34, 0, TAU); ctx.fillStyle = '#f4ecd0'; ctx.fill(); }
    // two parallax skyline layers
    const layers = [{ col: '#1b2250', sp: 0.25, base: GY - 10, hMax: 300, n: 11 }, { col: '#121838', sp: 0.6, base: GY, hMax: 210, n: 9 }];
    layers.forEach((L, li) => {
      const span = 1500, w0 = span / L.n;
      for (let i = 0; i < L.n; i++) {
        let x = ((i * w0 - off * L.sp) % span + span) % span - 200;
        const w = w0 * (0.65 + 0.3 * H.hash(i, 40 + li)), h = 90 + L.hMax * H.hash(i, 50 + li);
        roundRect(ctx, x, L.base - h, w, h + 10, 6); ctx.fillStyle = L.col; ctx.fill();
        for (let r = 0; r < Math.floor(h / 40); r++) for (let c = 0; c < Math.floor(w / 30); c++) {
          if (H.hash(i * 31 + r * 7 + c, 60 + li) > 0.7) { ctx.fillStyle = rgba('#ffd98a', li ? 0.55 : 0.3); ctx.fillRect(x + 10 + c * 30, L.base - h + 14 + r * 40, 12, 16); }
        }
      }
    });
  }
  function road(off) {
    ctx.fillStyle = '#2b3150'; ctx.fillRect(-200, GY, 1480, 110);
    ctx.fillStyle = '#4b5175'; ctx.fillRect(-200, GY, 1480, 8);
    const g = ctx.createLinearGradient(0, GY + 110, 0, 1920); g.addColorStop(0, '#1d2138'); g.addColorStop(1, '#0a0c18');
    ctx.fillStyle = g; ctx.fillRect(-200, GY + 110, 1480, 1000);
    ctx.fillStyle = 'rgba(255,224,140,0.55)';
    for (let i = 0; i < 9; i++) { const x = ((i * 180 - off) % 1620 + 1620) % 1620 - 270; roundRect(ctx, x, GY + 60, 100, 10, 5); ctx.fill(); }
  }
  // go-kart with a kit robot driver, facing right; v = speed 0..1 (speed lines), brake 0..1 (nose dip)
  function kart(x, s, o = {}) {
    const y = o.y || GY + 52, col = o.color || KART[0], v = o.v || 0, dip = (o.brake || 0) * 0.08;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (v > 0.02) {
      ctx.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const yy = -150 + i * 30, len = (90 + 80 * H.hash(i, 7)) * v, sh = ((t * 900 + i * 57) % 60);
        ctx.strokeStyle = `rgba(255,255,255,${0.35 * v})`; ctx.lineWidth = 5;
        ctx.beginPath(); ctx.moveTo(-130 - sh, yy); ctx.lineTo(-130 - sh - len, yy); ctx.stroke();
      }
    }
    K.shadow(ctx, 0, 6, 260);
    ctx.rotate(dip);
    K.drawRobot(ctx, -18, -44, 0.6, { t, state: o.state || 'working', seed: o.seed || 3, talk: 0 });
    // body
    const bob = Math.sin(t * 30 + (o.seed || 0)) * 2 * v;
    ctx.translate(0, bob);
    ctx.beginPath(); ctx.moveTo(-120, -86); ctx.lineTo(40, -86); ctx.quadraticCurveTo(130, -78, 138, -40); ctx.lineTo(138, -22); ctx.lineTo(-120, -22); ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
    ctx.fillStyle = mixHex(col, '#000000', 0.25); ctx.fillRect(-120, -40, 258, 18);
    roundRect(ctx, -140, -112, 26, 70, 6); ctx.fillStyle = mixHex(col, '#000000', 0.35); ctx.fill(); // spoiler
    ctx.beginPath(); ctx.arc(50, -60, 14, 0, TAU); ctx.fillStyle = WHITE; ctx.fill();               // number disc
    ctx.font = H.font('ui', 18); ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(o.n || 1), 50, -59);
    // headlight
    ctx.beginPath(); ctx.arc(130, -50, 7, 0, TAU); ctx.fillStyle = '#fff3b0'; ctx.fill();
    // wheels
    for (const wx of [-78, 84]) {
      ctx.beginPath(); ctx.arc(wx, -8, 30, 0, TAU); ctx.fillStyle = '#151827'; ctx.fill();
      ctx.beginPath(); ctx.arc(wx, -8, 13, 0, TAU); ctx.fillStyle = '#8a90a8'; ctx.fill();
      ctx.save(); ctx.translate(wx, -8); ctx.rotate((o.spin || 0)); ctx.fillStyle = '#151827'; ctx.fillRect(-2, -13, 4, 26); ctx.restore();
    }
    ctx.restore();
  }
  // speed-limit sign: board top-left at (x - 135, top); post down to GY
  function sign(x, top, o = {}) {
    const w = 270, h = 320, num = String(o.num == null ? '?' : o.num);
    ctx.save();
    ctx.fillStyle = '#9aa0b8'; roundRect(ctx, x - 9, top + h - 10, 18, GY + 8 - (top + h - 10), 6); ctx.fill();
    K.glow(ctx, x, top + h / 2, 230, '#ffffff', 0.08);
    roundRect(ctx, x - w / 2, top, w, h, 22); ctx.fillStyle = WHITE; ctx.fill();
    ctx.lineWidth = 8; ctx.strokeStyle = INK; roundRect(ctx, x - w / 2 + 14, top + 14, w - 28, h - 28, 14); ctx.stroke();
    ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.font = H.font('display', 40); ctx.fillText(String(P.signTop || 'AI SPEED'), x, top + 74);
    ctx.fillText(String(P.signBottom || 'LIMIT'), x, top + 120);
    const pulse = 1 + (o.pulse || 0) * 0.12 * Math.max(0, Math.sin(t * 7));
    ctx.save(); ctx.translate(x, top + 236); ctx.scale(pulse, pulse);
    ctx.font = H.font('display', 150); ctx.fillStyle = o.numColor || INK; ctx.textBaseline = 'middle'; ctx.fillText(num, 0, 8);
    ctx.restore();
    ctx.restore();
  }
  function card(cx, top, w, h, o = {}) {
    roundRect(ctx, cx - w / 2, top, w, h, 22); ctx.fillStyle = o.fill || 'rgba(10,12,24,0.9)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = o.stroke || 'rgba(255,255,255,0.16)'; ctx.stroke();
  }
  function scaleAt(x, y, s, fn) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y); fn(); ctx.restore(); }
  function text(str, x, y, kind, size, col, align) {
    ctx.font = H.font(kind, size); ctx.fillStyle = col; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(str, x, y);
  }
  function qBubble(x, y, a) {
    if (a <= 0) return;
    scaleAt(x, y, Math.min(1.05, a), () => {
      ctx.beginPath(); ctx.arc(x, y - 34, 32, 0, TAU); ctx.fillStyle = WHITE; ctx.fill();
      ctx.beginPath(); ctx.moveTo(x - 10, y - 8); ctx.lineTo(x, y + 8); ctx.lineTo(x + 8, y - 8); ctx.fill();
      text('?', x, y - 32, 'display', 40, INK);
    });
  }

  ctx.save();
  // ================================================================== HOOK
  if (mode === 'hook') {
    const tLand = P.landAt || 0.6, tStop = 2.0;
    const V = 1100;
    const off = t < tLand ? V * t : V * tLand + V * (Math.min(t - tLand, tStop - tLand) - Math.pow(Math.min(t - tLand, tStop - tLand), 2) / (2 * (tStop - tLand)));
    const v = t < tLand ? 1 : clamp(1 - (t - tLand) / (tStop - tLand));
    const brake = t < tLand ? 0 : Math.sin(clamp((t - tLand) / (tStop - tLand + 0.4)) * Math.PI);
    K.cameraShake(ctx, t, tLand, 0.35, 14);
    sky(off); road(off);
    // sign drops from above
    // the sign springs up out of the roadside (already rising at frame 0), overshoots and settles
    const rise = ph(-0.12, tLand, (u) => 1 + 2.2 * Math.pow(u - 1, 3) + 1.2 * Math.pow(u - 1, 2));
    const top = lerp(900, 440, rise);
    ctx.save(); ctx.beginPath(); ctx.rect(-200, -200, 1480, GY + 208); ctx.clip();
    sign(755, top, { pulse: t > 2.2 ? 1 : 0 });
    ctx.restore();
    if (t > tLand) {
      const k = clamp((t - tLand) / 0.6);
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI, r = 30 + 140 * easeOutCubic(k);
        ctx.beginPath(); ctx.arc(755 + Math.cos(a) * r * (i % 2 ? 1 : -1), GY + 4 - Math.sin(a) * r * 0.35, 18 * (1 - k) + 4, 0, TAU);
        ctx.fillStyle = `rgba(200,205,230,${0.5 * (1 - k)})`; ctx.fill();
      }
    }
    // karts brake: lurch forward then settle
    const lurch = t < tLand ? 0 : Math.sin(clamp((t - tLand) / 1.4) * Math.PI) * 26;
    const lanes = [[215, 0.72, GY + 30], [500, 0.72, GY + 30], [340, 0.92, GY + 78]];
    lanes.forEach(([x, sc, y], i) => {
      // skid marks
      const sk = 160 * sc * clamp((t - tLand) / 0.8);
      if (t > tLand) { ctx.fillStyle = 'rgba(10,10,16,0.5)'; ctx.fillRect(x - 70 * sc - sk + lurch * 0.4, y - 6, sk, 7); }
      kart(x + lurch * (0.6 + 0.2 * i) + Math.sin(t * 3 + i) * 6 * v, sc, { y, color: KART[i], v, brake, n: i + 1, seed: i + 2, spin: off / 30, state: t > tStop ? 'thinking' : 'working' });
    });
    const tp = pop(P.tagAt || 1.75, 0.4);
    if (tp > 0) K.drawLabel(ctx, 755, 840, tp, { text: P.tag || 'PROPOSED', size: 30, accent: true });
  }

  // ================================================================== LAB
  else if (mode === 'lab') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 520, y: 720 }]);
    K.world.room(ctx, { t, time: 'night', lamp: false, window: false, picture: false, plant: true });
    const tWho = cue(P.whoCue, 0.2), tPost = cue(P.postCue, 0.37), tRuler = cue(P.rulerCue, 0.62);
    const tLine = cue(P.lineCue, 0.82), tAgree = cue(P.agreeCue, 0.85);
    // whiteboard
    const BX = 300, BY = 440, BW = 560, BH = 330;
    roundRect(ctx, BX - 14, BY - 14, BW + 28, BH + 28, 18); ctx.fillStyle = '#8a90a8'; ctx.fill();
    roundRect(ctx, BX, BY, BW, BH, 10); ctx.fillStyle = '#eef1f8'; ctx.fill();
    ctx.fillStyle = '#9aa0b8'; ctx.fillRect(BX + 40, BY + BH + 14, BW - 80, 12);
    // axes
    const ax = BX + 50, ay = BY + BH - 40, aw = BW - 100, ah = BH - 120;
    ctx.strokeStyle = '#3b4672'; ctx.lineWidth = 4; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ax, ay - ah); ctx.lineTo(ax, ay); ctx.lineTo(ax + aw, ay); ctx.stroke();
    // falling curve (drawn while the scientist works); stops just above the limit line once it exists
    const prog = ph(0.2, 3.2, easeOutCubic);
    const limY = ay - ah * 0.2;
    ctx.strokeStyle = '#2f6bd8'; ctx.lineWidth = 7;
    ctx.beginPath();
    const N = 40, endU = 0.9 * prog;
    for (let i = 0; i <= N; i++) {
      const u = (i / N) * endU;
      const y = ay - ah * (0.92 - 0.66 * (1 - Math.exp(-2.6 * u)) / (1 - Math.exp(-2.6)));
      const x = ax + 20 + u * (aw - 40);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // marker tip
    if (prog < 1) {
      const u = endU, y = ay - ah * (0.92 - 0.66 * (1 - Math.exp(-2.6 * u)) / (1 - Math.exp(-2.6)));
      K.glow(ctx, ax + 20 + u * (aw - 40), y, 26, '#2f6bd8', 0.4);
    }
    // ruler
    const rp = ph(tRuler - 0.2, tRuler + 0.35, easeOutCubic);
    if (rp > 0) {
      const rx = lerp(BX + BW + 300, BX + 30, rp), ry = BY + 22, rw = BW - 60, rh = 56;
      ctx.save(); ctx.rotate(0);
      roundRect(ctx, rx, ry, rw, rh, 8); ctx.fillStyle = '#ffd34d'; ctx.fill();
      ctx.strokeStyle = '#a07a12'; ctx.lineWidth = 3;
      for (let i = 0; i <= 24; i++) { const x = rx + 10 + i * (rw - 20) / 24; ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(x, ry + (i % 4 === 0 ? 18 : 10)); ctx.stroke(); }
      text('ONE SHARED YARDSTICK', rx + rw / 2, ry + 36, 'ui', 26, '#3a2a00');
      ctx.restore();
    }
    // limit line
    const lp = ph(tLine - 0.1, tLine + 0.6, easeOutCubic);
    if (lp > 0) {
      ctx.save(); ctx.setLineDash([22, 14]); ctx.strokeStyle = RED; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(ax, limY); ctx.lineTo(ax + aw * lp, limY); ctx.stroke(); ctx.restore();
      const tg = pop(tLine + 0.35);
      if (tg > 0) scaleAt(ax + aw - 50, limY - 34, Math.min(1.05, tg), () => {
        roundRect(ctx, ax + aw - 120, limY - 60, 140, 44, 22); ctx.fillStyle = RED; ctx.fill();
        text('LIMIT', ax + aw - 50, limY - 37, 'ui', 26, '#ffffff');
      });
    }
    // scientist (generic cartoon) pointing at the board
    const pointing = t > 0.3;
    K.drawPerson(ctx, 190, 1032, 1.6, { t, pose: pointing ? 'point' : 'stand', mood: t > tLine ? 'happy' : 'neutral', hair: 2, hairStyle: 'short', shirt: 1, skin: 2 });
    // who pill
    const wp = pop(tWho);
    const ap = pop(tAgree + 0.3);
    if (wp > 0 && ap <= 0) K.drawLabel(ctx, 560, 870, wp, { text: P.who || 'Lab chief scientist', size: 28, dot: true });
    if (ap > 0) K.drawLabel(ctx, 560, 870, ap, { text: P.agree || "Labs agree: don't cross", size: 28, accent: true });
    // blog post page + date pill
    const pp = pop(tPost, 0.45);
    if (pp > 0) {
      const y = 1040 + (1 - Math.min(1, pp)) * 60;
      K.drawDocument(ctx, 800, y, 0.85 * Math.min(1.05, pp), { title: 'BLOG POST', lines: 5 });
      const dp = pop(tPost + 0.35);
      if (dp > 0) K.drawLabel(ctx, 800, 1060, dp, { text: P.date || 'DATE', size: 26 });
    }
  }

  // ================================================================== GAUGE
  else if (mode === 'gauge') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.05, x: 487, y: 760 }]);
    K.world.room(ctx, { t, time: 'night', lamp: true, window: false, picture: false, plant: false });
    const tPred = cue(P.predictCue, 0.3), tLow = cue(P.lowerCue, 0.6), tShare = cue(P.sharesCue, 0.8);
    const CX = 520, CY = 900, R = 250;
    // housing
    ctx.beginPath(); ctx.arc(CX, CY, R + 34, Math.PI, TAU); ctx.lineTo(CX + R + 34, CY + 40); ctx.lineTo(CX - R - 34, CY + 40); ctx.closePath();
    ctx.fillStyle = '#20253f'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#3b4672'; ctx.stroke();
    // scale 1.1 (left) .. 0.7 (right): right = lower = smarter
    const vals = [1.1, 1.0, 0.9, 0.8, 0.7];
    const ang = (v) => Math.PI + (1.1 - v) / 0.4 * Math.PI;
    // red zone at the far right ("limit ?")
    ctx.lineWidth = 26; ctx.lineCap = 'butt';
    ctx.strokeStyle = '#3a4270'; ctx.beginPath(); ctx.arc(CX, CY, R - 14, Math.PI, TAU); ctx.stroke();
    const zp = ph(0.3, 1.2);
    ctx.strokeStyle = rgba(RED, 0.9); ctx.beginPath(); ctx.arc(CX, CY, R - 14, TAU - 0.38 * zp, TAU); ctx.stroke();
    const ticks = Array.isArray(P.ticks) && P.ticks.length === 5 ? P.ticks : ['5', '4', '3', '2', '1'];
    vals.forEach((v, vi) => {
      const a = ang(v), c = Math.cos(a), s = Math.sin(a);
      ctx.strokeStyle = '#c9cfe0'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(CX + c * (R - 40), CY + s * (R - 40)); ctx.lineTo(CX + c * (R - 70), CY + s * (R - 70)); ctx.stroke();
      text(String(ticks[vi]), CX + c * (R - 106), CY + s * (R - 106) + 4, 'ui', 28, '#c9cfe0');
    });
    for (let i = 0; i <= 16; i++) { const a = Math.PI + i / 16 * Math.PI; ctx.strokeStyle = 'rgba(201,207,224,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(CX + Math.cos(a) * (R - 40), CY + Math.sin(a) * (R - 40)); ctx.lineTo(CX + Math.cos(a) * (R - 54), CY + Math.sin(a) * (R - 54)); ctx.stroke(); }
    text(P.metric || 'SCORE', CX, CY + 82, 'display', 40, '#ffffff');
    // needle: idles near 1.05 then swings right on "lower"
    const sw = ph(tLow - 0.1, tLow + 0.8, (u) => 1 - Math.pow(1 - u, 3) * Math.cos(u * 6) * 1);
    const v = lerp(1.04 + 0.02 * Math.sin(t * 3), 0.86 + 0.006 * Math.sin(t * 5), clamp(sw, 0, 1.15));
    const a = ang(v);
    ctx.strokeStyle = ACC; ctx.lineWidth = 10; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(CX - Math.cos(a) * 30, CY - Math.sin(a) * 30); ctx.lineTo(CX + Math.cos(a) * (R - 50), CY + Math.sin(a) * (R - 50)); ctx.stroke();
    ctx.beginPath(); ctx.arc(CX, CY, 24, 0, TAU); ctx.fillStyle = '#e6e9f5'; ctx.fill();
    K.glow(ctx, CX + Math.cos(a) * (R - 50), CY + Math.sin(a) * (R - 50), 50, ACC, 0.35);
    // "limit ?" tag at the red zone
    const zt = pop(1.0);
    if (zt > 0) K.drawLabel(ctx, CX + R - 10, CY - R + 10, zt, { text: 'LIMIT ?', size: 26 });
    // lower = better pill under the gauge
    const lp = pop(tLow + 0.1);
    if (lp > 0) {
      K.drawLabel(ctx, CX, CY + 160, lp, { text: P.lower || 'LOWER = BETTER  →', size: 30, accent: true });
    }
    // sentence card (prediction), flips to "shares its scores"
    const cp = pop(0.15, 0.45), flip = ph(tShare - 0.15, tShare + 0.2);
    if (cp > 0) scaleAt(CX, 520, Math.min(1.04, 0.8 + 0.2 * cp), () => {
      card(CX, 440, 640, 160);
      if (flip < 0.5) {
        ctx.globalAlpha = 1 - flip * 2;
        text('PREDICT THE NEXT CHUNK', CX, 482, 'ui', 26, '#9aa3c7');
        ctx.font = H.font('display', 44); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        const s1 = P.sentence || 'The sky is', w1 = ctx.measureText(s1 + ' ').width;
        const guess = P.guess || 'blue', gw = ctx.measureText(guess).width, x0 = CX - (w1 + gw) / 2;
        ctx.fillStyle = '#ffffff'; ctx.fillText(s1 + ' ', x0, 548);
        const gp = ph(tPred, tPred + 0.6, easeOutCubic);
        ctx.fillStyle = '#5a6290'; ctx.fillRect(x0 + w1, 574, gw, 5);
        if (gp > 0) { ctx.globalAlpha *= gp; ctx.fillStyle = ACC; ctx.fillText(guess, x0 + w1, 548 - (1 - gp) * 20); }
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = (flip - 0.5) * 2;
        text(P.shares || 'The lab shares its own scores', CX, 520, 'display', 38, '#ffffff');
        ctx.globalAlpha = 1;
      }
    });
    // robot watching at the left
    K.drawRobot(ctx, 150, 1040, 0.95, { t, state: t > tLow ? 'happy' : 'thinking', seed: 5 });
  }

  // ================================================================== ROAD
  else if (mode === 'road') {
    const c1 = cue(P.c1Cue, 0.03), c2 = cue(P.v2Cue, 0.29), s2 = cue(P.skill2Cue, 0.46);
    const c3 = cue(P.v3Cue, 0.64), tf = cue(P.tfCue, 0.75), ca = cue(P.chipACue, 0.85), cb = cue(P.chipBCue, 0.93);
    const posts = [235, 487, 740];
    // kart x: reaches each post on its cue
    const keys = [[0, 40], [c1 + 0.4, posts[0] - 40], [c2, posts[1] - 60], [c3, posts[2] - 60], [D, 830]];
    let kx = keys[keys.length - 1][1], kv = 0;
    for (let i = 0; i < keys.length - 1; i++) {
      const [ta, xa] = keys[i], [tb, xb] = keys[i + 1];
      if (t >= ta && t < tb) { const u = (t - ta) / (tb - ta); kx = lerp(xa, xb, easeInOutCubic(u)); kv = clamp(Math.sin(u * Math.PI) * 0.9); break; }
    }
    const off = kx * 1.6 + t * 40;
    sky(off); road(off * 0.4 + kx);
    // posts with small boards
    const labels = [P.p1 || 'Model A', P.p2 || 'Model B', P.p3 || '< X'];
    const lit = [c1, c2, c3];
    posts.forEach((x, i) => {
      const on = t > lit[i];
      ctx.fillStyle = '#9aa0b8'; roundRect(ctx, x - 6, 860, 12, GY + 6 - 860, 4); ctx.fill();
      roundRect(ctx, x - 80, 812, 160, 58, 12); ctx.fillStyle = on ? WHITE : '#5a6290'; ctx.fill();
      text(labels[i], x, 842, 'ui', 28, on ? INK : '#c9cfe0');
      if (on) K.glow(ctx, x, 840, 110, ACC, 0.12);
    });
    // cards
    const W = 236;
    // card 1: scores keep falling (down arrow, mini falling line)
    const p1 = pop(c1);
    if (p1 > 0) scaleAt(posts[0], 600, Math.min(1.04, 0.75 + 0.25 * p1), () => {
      card(posts[0], 470, W, 250);
      text('SCORES', posts[0], 512, 'ui', 26, '#9aa3c7');
      text('FALLING', posts[0], 548, 'ui', 26, '#9aa3c7');
      const dp = ph(c1 + 0.2, c1 + 1.6, easeOutCubic);
      ctx.strokeStyle = ACC; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i <= 20; i++) { const u = i / 20 * dp; const x = posts[0] - 80 + u * 160, y = 600 + 90 * (1 - Math.exp(-2.4 * u)) / (1 - Math.exp(-2.4)) + Math.sin(u * 14) * 4; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
    });
    // card 2: value + model label + skill chip
    const p2 = pop(c2);
    if (p2 > 0) scaleAt(posts[1], 600, Math.min(1.04, 0.75 + 0.25 * p2), () => {
      card(posts[1], 470, W, 250);
      text(P.v2 || '~X', posts[1], 535, 'display', 64, ACC);
      text(P.v2Label || 'Model B', posts[1], 592, 'ui', 28, '#ffffff');
      const sp = pop(s2);
      if (sp > 0) {
        ctx.globalAlpha = clamp(sp);
        roundRect(ctx, posts[1] - 104, 626, 208, 76, 16); ctx.fillStyle = 'rgba(255,255,255,0.1)'; ctx.fill();
        text(P.skill2a || 'Step-by-step', posts[1], 650, 'ui', 26, '#ffffff');
        text(P.skill2b || 'reasoning', posts[1], 682, 'ui', 26, '#ffffff');
        ctx.globalAlpha = 1;
      }
    });
    // card 3: threshold + transformative + chips
    const p3 = pop(c3);
    if (p3 > 0) scaleAt(posts[2], 600, Math.min(1.04, 0.75 + 0.25 * p3), () => {
      card(posts[2], 470, W, 300, { stroke: rgba(ACC, 0.6) });
      text(P.v3 || '< X', posts[2], 528, 'display', 60, ACC);
      const tp = pop(tf);
      if (tp > 0) { ctx.globalAlpha = clamp(tp); text(P.tfLabel || 'TRANSFORMATIVE', posts[2], 580, 'ui', 24, '#ffffff'); text(P.tfLabel2 || 'SKILLS', posts[2], 608, 'ui', 24, '#ffffff'); ctx.globalAlpha = 1; }
      [[ca, P.chipA || 'Skill one'], [cb, P.chipB || 'Skill two']].forEach(([tc, lab], i) => {
        const q = pop(tc);
        if (q <= 0) return;
        scaleAt(posts[2], 662 + i * 58, Math.min(1.05, q), () => {
          roundRect(ctx, posts[2] - 100, 640 + i * 58, 200, 48, 24); ctx.fillStyle = ACC; ctx.fill();
          text(lab, posts[2], 665 + i * 58, 'ui', 26, INK);
        });
      });
    });
    kart(kx, 0.8, { color: KART[0], v: kv, n: 1, seed: 2, spin: off / 30, state: t > c3 ? 'happy' : 'working' });
  }

  // ================================================================== LIMIT
  else if (mode === 'limit') {
    const tLabs = cue(P.labsCue, 0.15), tLim = cue(P.limitCue, 0.22), tMon = cue(P.monitorCue, 0.42);
    const tBrake = cue(P.brakeCue, 0.72), tPocket = cue(P.pocketCue, 0.86);
    sky(0, false); road(0);
    const LX = 600;
    // limit line on the road (dashed red stripe) + barrier
    const lp = ph(tLim - 0.3, tLim + 0.3);
    ctx.fillStyle = rgba(RED, 0.9 * lp);
    for (let i = 0; i < 5; i++) ctx.fillRect(LX - 6, GY + 8 + i * 21, 12, 13);
    // barrier arm (closed)
    ctx.fillStyle = '#9aa0b8'; roundRect(ctx, LX + 4, GY - 120, 26, 128, 6); ctx.fill();
    const armA = -Math.PI / 2 * (1 - ph(tLim - 0.2, tLim + 0.5, (u) => 1 - Math.pow(1 - u, 2) * Math.cos(u * 9)));
    ctx.save(); ctx.translate(LX + 17, GY - 108); ctx.rotate(armA + Math.PI);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? RED : WHITE; ctx.fillRect(i * 40, -10, 40, 20); }
    ctx.restore();
    // booth
    const BXc = 770;
    roundRect(ctx, BXc - 80, GY - 170, 160, 178, 12); ctx.fillStyle = '#3a4270'; ctx.fill();
    roundRect(ctx, BXc - 96, GY - 190, 192, 30, 10); ctx.fillStyle = '#4c5590'; ctx.fill();
    roundRect(ctx, BXc - 52, GY - 140, 104, 70, 8); ctx.fillStyle = '#151a33'; ctx.fill();
    // inside the booth window: a magnifier sweeping
    ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 5;
    const mx = BXc + Math.sin(t * 2) * 20; ctx.beginPath(); ctx.arc(mx, GY - 108, 14, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(mx + 10, GY - 98); ctx.lineTo(mx + 22, GY - 86); ctx.stroke(); ctx.restore();
    // limit pill
    const lpp = pop(tLim + 0.15);
    if (lpp > 0) K.drawLabel(ctx, LX + 10, GY - 140, lpp, { text: P.limitLabel || 'AGREED LIMIT', size: 26 });
    // monitor panel above the booth
    const mp = pop(tMon - 0.2, 0.45);
    if (mp > 0) scaleAt(665, 560, Math.min(1.04, 0.8 + 0.2 * mp), () => {
      card(665, 450, 380, 230);
      text(P.mon1 || 'UNDERSTAND +', 665, 498, 'display', 34, '#ffffff');
      text(P.mon2 || 'MONITOR AI', 665, 540, 'display', 34, '#ffffff');
      const fill = 0.12 + 0.48 * ph(tMon, D - 0.3, (u) => u);
      roundRect(ctx, 505, 584, 270, 34, 17); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
      roundRect(ctx, 505, 584, 270 * fill, 34, 17); ctx.fillStyle = ACC; ctx.fill();
      // milestone flag at the end of the bar
      ctx.fillStyle = '#c9cfe0'; ctx.fillRect(790, 570, 5, 62);
      ctx.beginPath(); ctx.moveTo(795, 570); ctx.lineTo(830, 582 + Math.sin(t * 4) * 3); ctx.lineTo(795, 596); ctx.closePath(); ctx.fillStyle = RED; ctx.fill();
      text(P.milestone || 'MILESTONE', 665, 650, 'ui', 24, '#9aa3c7');
    });
    // karts roll in and stop behind the line
    const stops = [185, 340, 490];
    stops.forEach((sx, i) => {
      const a = tLabs - 0.9 + i * 0.12, b = tLim + 0.2 + i * 0.1;
      const u = clamp((t - a) / (b - a));
      const x = lerp(-250 - i * 40, sx, easeOutCubic(u));
      const v = u > 0 && u < 1 ? (1 - u) : 0;
      kart(x, 0.7, { color: KART[i], v, brake: u > 0.6 && u < 1 ? 1 - u : 0, n: i + 1, seed: i + 2, spin: x / 30, state: t > tMon ? 'thinking' : 'idle' });
    });
    // brake pill
    const bp = pop(tBrake);
    if (bp > 0) K.drawLabel(ctx, 290, 560, bp, { text: P.brakeLabel || 'A BRAKE ON AI', size: 30, accent: true });
    // person walks in with a phone
    const wp = clamp((t - (tPocket - 1.2)) / 1.2);
    if (wp > 0) {
      const x = lerp(-80, 150, easeOutCubic(wp));
      K.drawPerson(ctx, x, 1060, 1.3, { t, pose: wp < 1 ? 'stand' : 'phone', walk: wp < 1 ? t : undefined, mood: 'neutral', hair: 1, hairStyle: 'long', shirt: 3, skin: 1 });
      const pp = pop(tPocket + 0.1);
      if (pp > 0) K.drawLabel(ctx, 330, 715, pp, { text: P.pocketLabel || 'THE AI IN YOUR POCKET', size: 26 });
    }
  }

  // ================================================================== CAVEAT
  else if (mode === 'caveat') {
    const tStamp = cue(P.stampCue, 0.08), tNum = cue(P.noNumCue, 0.3), tChk = cue(P.checkCue, 0.5), tRiv = cue(P.rivalCue, 0.76);
    sky(0, false); road(0);
    sign(745, 440, { pulse: t > tNum && t < tNum + 2.2 ? 1 : 0, numColor: t > tNum ? RED : INK });
    // karts parked
    [190, 400].forEach((x, i) => kart(x, 0.68, { color: KART[i + 1], n: i + 2, seed: i + 4, state: t > tRiv ? 'thinking' : 'idle' }));
    [190, 400].forEach((x, i) => qBubble(x - 10, 858, pop(tRiv + 0.3 + i * 0.15)));
    // pills
    const rows = [[tNum, P.no1 || 'No number set'], [tChk, P.no2 || 'Who checks? Not said'], [tRiv, P.no3 || 'Rival labs? No word yet']];
    rows.forEach(([tc, lab], i) => {
      const q = pop(tc);
      if (q > 0) K.drawLabel(ctx, 330, 490 + i * 76, q, { text: lab, size: 28, dot: true });
    });
    const sp = clamp((t - tStamp + 0.05) / 0.5);
    if (sp > 0) {
      // rectangular rubber stamp (no tick or cross: it is neither approved nor rejected)
      const sc = 1 + 1.2 * Math.pow(1 - easeOutCubic(clamp(sp / 0.6)), 2);
      ctx.save(); ctx.translate(380, 712); ctx.rotate(-0.08); ctx.scale(sc, sc); ctx.globalAlpha = clamp(sp / 0.3);
      ctx.strokeStyle = ACC; ctx.lineWidth = 7; roundRect(ctx, -210, -46, 420, 92, 14); ctx.stroke();
      ctx.lineWidth = 2.5; roundRect(ctx, -198, -34, 396, 68, 10); ctx.stroke();
      text(P.stamp || 'ONLY A PROPOSAL', 0, 3, 'display', 34, ACC);
      ctx.restore();
    }
  }
  ctx.restore();
}
