// Scene "lobby-hill" (full frame). Lobbying story set around a generic domed government building (a cartoon
// "Capitol-style" dome: columns, steps, no flag, no seal, no signage). Companies appear only as TEXT name pills
// (never logos); people are generic kit cartoons in suits; robots are the kit mascot as an "AI company" stand-in.
// Fits: lobbying / political spending / "companies court lawmakers" stories.
// modes (params.mode):
//   arrive  (best as 2-beat span) suited lobbyists walk to the dome; date pill, name pills on cue, "biggest quarter
//           ever" banner, filing sheet + "Federal filings" pill; then a LEGAL stamp and a lawmaker hears "our case"
//   tanks   three glass tanks fill with coins to published amounts (count up), RECORD tags, dashed $1M line + note
//   skyline five towers whose heights are each company's spend; Big Tech towers rise on cue; "up every quarter" pill
//   topics  a lobbying report on an easel: rows light and topic chips fly out; a person with a phone + power bill
//   caveat  close-up of the report: TOPIC column ticks, POSITION column stays "?", For? / Against? chips, stamp
//   payoff  dusk dome, three robots around a rulebook on a lectern; recap pill row -> question card + two chips
// All text and numbers come from params (defaults are generic placeholders: Company A-C / Firm A-E, round amounts); pass the
// story's names and published figures. Cue params are optional narration words ("w#n" = nth); without them the
// scene uses fixed fractions of its duration. arrive: name pills also cue on each name (lower-cased) or nameCues [3].
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, easeOutCubic, roundRect } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const STONE = '#e6e0d2', STONE_S = '#c4bba8', STONE_D = '#a69d8a', SUIT = '#2f3a5e', RED = '#ff6b5e';

  // ---------- shared drawing ----------
  function dome(cx, by, s, lit = 0.6) {
    ctx.save(); ctx.translate(cx, by); ctx.scale(s, s);
    K.glow(ctx, 0, -330, 420, '#ffd98a', 0.10 + 0.10 * lit);
    const R = (x, y, w, h, r, c) => { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); };
    // steps
    for (let i = 0; i < 4; i++) R(-200 + i * 18, -14 - i * 14, 400 - i * 36, 16, 3, i % 2 ? STONE_S : STONE);
    const base = -70;
    // wings
    R(-340, base - 140, 680, 140, 4, STONE); R(-340, base - 20, 680, 20, 2, STONE_S);
    R(-352, base - 152, 704, 18, 4, STONE_S);
    for (const side of [-1, 1]) for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) {
      const x = side * (150 + c * 46) - 12, y = base - 122 + r * 56;
      const on = H.hash(c + side * 7 + r * 13, 5) < lit;
      R(x, y, 24, 36, 10, on ? 'rgba(255,222,150,0.85)' : '#4a4f6a');
    }
    // central portico: columns + pediment
    R(-130, base - 180, 260, 180, 2, STONE_S);
    for (let i = 0; i < 6; i++) { const x = -112 + i * 44; R(x, base - 172, 20, 164, 6, STONE); R(x - 4, base - 178, 28, 10, 3, STONE); R(x - 4, base - 12, 28, 10, 3, STONE); }
    R(-142, base - 196, 284, 20, 3, STONE);
    ctx.beginPath(); ctx.moveTo(-150, base - 196); ctx.lineTo(0, base - 252); ctx.lineTo(150, base - 196); ctx.closePath(); ctx.fillStyle = STONE; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-112, base - 202); ctx.lineTo(0, base - 238); ctx.lineTo(112, base - 202); ctx.closePath(); ctx.fillStyle = STONE_S; ctx.fill();
    // drum
    const dy = base - 252;
    R(-150, dy - 18, 300, 22, 4, STONE_S);
    R(-118, dy - 108, 236, 92, 4, STONE);
    for (let i = 0; i < 9; i++) R(-108 + i * 26, dy - 100, 9, 78, 4, STONE_S);
    R(-128, dy - 122, 256, 18, 4, STONE_S);
    // dome
    const top = dy - 122;
    ctx.beginPath(); ctx.ellipse(0, top, 116, 132, 0, Math.PI, 0); ctx.closePath();
    const g = ctx.createLinearGradient(-116, 0, 116, 0); g.addColorStop(0, '#f4efe3'); g.addColorStop(0.6, STONE); g.addColorStop(1, STONE_D);
    ctx.fillStyle = g; ctx.fill();
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(120,110,95,0.45)'; ctx.lineWidth = 3;
    for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.ellipse(0, top, Math.abs(i) * 34 + 1, 132, 0, Math.PI, 0); ctx.stroke(); }
    ctx.restore();
    // lantern (no statue, no flag)
    R(-20, top - 168, 40, 40, 6, STONE); for (let i = 0; i < 3; i++) R(-14 + i * 12, top - 162, 5, 28, 2, STONE_S);
    ctx.beginPath(); ctx.arc(0, top - 168, 20, Math.PI, 0); ctx.fillStyle = STONE_S; ctx.fill();
    R(-3, top - 206, 6, 22, 3, STONE_D);
    ctx.restore();
  }
  function lawn(gy) {
    const g = ctx.createLinearGradient(0, gy - 30, 0, gy + 80); g.addColorStop(0, '#2b4a45'); g.addColorStop(1, '#1b2c33');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(487, gy + 40, 720, 90, 0, Math.PI, 0); ctx.fill();
  }
  // generic suited cartoon (tie + briefcase); never a real person
  function suit(x, y, s, o = {}) {
    const flip = !!o.flip;
    K.drawPerson(ctx, x, y, s, Object.assign({ t, shirt: SUIT, mood: 'neutral' }, o));
    const pose = o.pose || 'stand';
    if (pose === 'stand' || o.walk != null) {
      ctx.save(); ctx.translate(x, y); ctx.scale(flip ? -s : s, s);
      ctx.beginPath(); ctx.moveTo(-5, -164); ctx.lineTo(5, -164); ctx.lineTo(7, -126); ctx.lineTo(0, -116); ctx.lineTo(-7, -126); ctx.closePath();
      ctx.fillStyle = o.tie || '#c94f4f'; ctx.fill();
      ctx.restore();
      if (o.case !== false) {
        const sw = o.walk != null ? Math.sin(o.walk * 1.8 * Math.PI * 2) * 10 : 0;
        K.drawBriefcase(ctx, x + (flip ? -1 : 1) * (40 - sw * 0.3) * s, y - 46 * s, 0.36 * s, { shadow: false });
      }
    }
  }
  function bigText(txt, x, y, size, color, align = 'center') {
    ctx.save(); ctx.font = H.font('display', size); ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(8, size * 0.14); ctx.strokeStyle = 'rgba(6,7,14,0.85)'; ctx.strokeText(txt, x, y);
    ctx.fillStyle = color; ctx.fillText(txt, x, y); ctx.restore();
  }
  function count(txt, k) { // "$2.2M" counted up keeping the format
    const m = String(txt).match(/^([^0-9]*?)(\d+)(\.\d+)?(.*)$/);
    if (!m || k >= 1) return String(txt);
    const dec = m[3] ? m[3].length - 1 : 0, v = parseFloat(m[2] + (m[3] || '')) * clamp(k);
    return m[1] + v.toFixed(dec) + m[4];
  }
  function card(x, y, w, h, alpha = 0.92, edge = null) {
    roundRect(ctx, x - w / 2, y - h / 2, w, h, 24); ctx.fillStyle = `rgba(8,10,24,${alpha})`; ctx.fill();
    if (edge) { ctx.lineWidth = 4; ctx.strokeStyle = edge; roundRect(ctx, x - w / 2, y - h / 2, w, h, 24); ctx.stroke(); }
  }
  const pill = (x, y, k, text, o = {}) => { if (k > 0) K.drawLabel(ctx, x, y, Math.min(1.04, k), Object.assign({ text, size: 28 }, o)); };
  const fadeOut = (a, b) => 1 - clamp((t - a) / Math.max(0.01, b - a));

  const mode = P.mode || 'arrive';
  ctx.save();

  if (mode === 'arrive') {
    const tDate = at(P.dateCue, D * 0.2) - 0.1;
    const names = P.names || ['Company A', 'Company B', 'Company C'];
    const tN = names.map((n, i) => at((P.nameCues || [])[i] || n.toLowerCase(), D * (0.31 + 0.056 * i)));
    const tBig = at(P.bigCue, D * 0.51) - 0.2, tFile = at(P.fileCue, D * 0.65) - 0.2;
    const tLegal = at(P.legalCue, D * 0.8) - 0.1, tCase = at(P.caseCue, D * 0.92) - 0.3, tLaw = at(P.lawCue, D * 0.95);
    const tClear = tLegal - 0.7;
    K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 487, y: 700 }, { t: 3.4, zoom: 1.0 }, { t: tClear, zoom: 1.0 }, { t: D, zoom: 1.05, x: 560, y: 760 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: 990 });
    lawn(990);
    dome(487, 985, 0.95, 0.4 + 0.5 * K.phase(t, tBig, tBig + 1));
    // three lobbyists walk in from the left, staggered; the lawmaker walks in from the right later
    const xs = [150, 340, 530];
    names.forEach((n, i) => {
      const t0 = 0.2 + i * 0.5, t1 = 3.4 + i * 0.6, u = K.phase(t, t0, t1, H.easeInOutCubic);
      const x = lerp(-160 - i * 40, xs[i], u), walking = u > 0 && u < 1;
      const turn = i === 2 && t > tCase - 0.4;
      suit(x, 1036, 1.0, { walk: walking ? t : undefined, skin: [1, 3, 0][i], hair: [0, 4, 1][i], hairStyle: ['short', 'long', 'curly'][i], seed: 11 + i, talk: turn && t < tCase + 1.4 ? info.env : 0, look: turn ? 1 : 0.3, tie: [ACC, '#c94f4f', '#6f86e0'][i] });
      const k = K.popIn(t, tN[i] - 0.15, 0.4);
      const nOut = fadeOut(tClear, tClear + 0.4);
      if (nOut > 0) { ctx.save(); ctx.globalAlpha = nOut; pill(x, 770, k, n, { dot: true, accent: t >= tBig, size: 24 }); ctx.restore(); }
      if (t >= tBig && t < tClear + 0.4) { // little up arrow on each name: record
        const a = K.popIn(t, tBig + 0.15 + i * 0.12, 0.35);
        if (a > 0) { ctx.save(); ctx.translate(x, 712 + K.bob(t, 4, 1.2, i * 0.3)); ctx.scale(a, a); ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(0, -22); ctx.lineTo(16, 0); ctx.lineTo(6, 0); ctx.lineTo(6, 16); ctx.lineTo(-6, 16); ctx.lineTo(-6, 0); ctx.lineTo(-16, 0); ctx.closePath(); ctx.fill(); ctx.restore(); }
      }
    });
    // top info: date pill, banner, filing sheet (fade before the LEGAL part)
    const top = fadeOut(tClear, tClear + 0.4);
    if (top > 0) {
      ctx.save(); ctx.globalAlpha = top;
      pill(487, 488, K.popIn(t, tDate, 0.4), P.date || 'This quarter', { size: 30 });
      const bk = K.popIn(t, tBig, 0.45);
      if (bk > 0) {
        ctx.save(); ctx.translate(487, 580); ctx.scale(Math.min(1.04, bk), Math.min(1.04, bk));
        card(0, 0, 780, 104, 0.92, ACC);
        const ft = H.fitText(ctx, P.banner || 'RECORD LOBBYING QUARTER', 'display', 46, 26, 720);
        ctx.font = ft.font; ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.banner || 'RECORD LOBBYING QUARTER', 0, 3);
        ctx.restore();
      }
      const fk = K.phase(t, tFile, tFile + 0.7, easeOutCubic);
      if (fk > 0) {
        const fx = lerp(490, 790, fk), fy = lerp(980, 820, fk);
        K.drawDocument(ctx, fx, fy, lerp(0.3, 0.72, fk), { lines: 6, shadow: false });
        pill(790, 700, K.popIn(t, tFile + 0.5, 0.4), P.filings || 'Public filings', { size: 26 });
      }
      ctx.restore();
    }
    // LEGAL stamp, the lawmaker and "our case"
    const sk = clamp((t - tLegal) / 0.6);
    if (sk > 0) {
      ctx.save(); ctx.translate(487, 0);
      K.drawStamp(ctx, 0, 720, 0.85, { kind: 'check', text: P.legal || 'LEGAL', land: sk });
      ctx.restore();
      pill(487, 500, K.popIn(t, tLegal + 0.6, 0.4), P.define || 'Lobbying: making your case to lawmakers', { size: 28, accent: true });
    }
    const lu = K.phase(t, tCase - 1.2, tCase + 0.2, H.easeInOutCubic);
    if (lu > 0) {
      const lx = lerp(1180, 790, lu);
      K.drawPerson(ctx, lx, 1036, 1.0, { t, walk: lu < 1 ? t : undefined, flip: true, shirt: '#8a93a8', skin: 2, hair: 3, hairStyle: 'short', seed: 31, look: -1, mood: 'neutral' });
      pill(lx, 690, K.popIn(t, tLaw - 0.1, 0.4), P.lawmaker || 'Lawmaker', { size: 26 });
      const bp = K.popIn(t, tCase, 0.4);
      if (bp > 0) K.drawSpeechBubble(ctx, 560, 820, 1, { text: P.bubble || "Here's our case...", size: 28, tail: 'left', pop: bp });
    }
  }

  else if (mode === 'tanks') {
    const items = (P.items || [{ name: 'Company A', value: 3, text: '$3M' }, { name: 'Company B', value: 2, text: '$2M' }, { name: 'Company C', value: 1.5, text: '$1.5M' }]).slice(0, 3);
    const max = P.max || Math.max(...items.map((x) => x.value)), maxH = 340, base = 1000, W = 170, xs = [215, 487, 759];
    const tI = items.map((it, i) => at(it.cue, D * (0.02 + i * 0.22)) - 0.1);
    const tLine = at(P.lineCue, D * 0.7) - 0.1;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
    K.world.city(ctx, { t, time: 'night', groundY: 990 });
    lawn(990);
    dome(487, 985, 0.9, 0.5);
    ctx.fillStyle = 'rgba(6,8,20,0.55)'; ctx.fillRect(0, 0, 1080, 1920);
    // header pill: period, then the note
    const hk = K.popIn(t, 0.1, 0.4), swap = clamp((t - tLine) / 0.3);
    if (swap < 1) { ctx.save(); ctx.globalAlpha = 1 - swap; pill(487, 466, hk, P.head || 'Lobbying spend this quarter', { size: 28 }); ctx.restore(); }
    if (swap > 0) pill(487, 466, K.popIn(t, tLine, 0.45), P.note || 'A first $1M quarter', { size: 28, accent: true });
    items.forEach((it, i) => {
      const x = xs[i], h = maxH * it.value / max, fillK = K.phase(t, tI[i] + 0.2, tI[i] + 1.6, easeOutCubic);
      const tankTop = base - maxH - 30;
      // glass tank
      roundRect(ctx, x - W / 2, tankTop, W, maxH + 30, 18); ctx.fillStyle = 'rgba(160,190,255,0.10)'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(200,215,255,0.45)'; roundRect(ctx, x - W / 2, tankTop, W, maxH + 30, 18); ctx.stroke();
      // fill: stacked coins
      if (fillK > 0) {
        ctx.save(); roundRect(ctx, x - W / 2 + 6, tankTop, W - 12, maxH + 24, 14); ctx.clip();
        const fh = h * fillK, y0 = base - 6 - fh;
        const g = ctx.createLinearGradient(0, y0, 0, base); g.addColorStop(0, K.ACCENT.light); g.addColorStop(1, K.ACCENT.shade);
        ctx.fillStyle = g; ctx.fillRect(x - W / 2, y0, W, fh + 6);
        ctx.fillStyle = H.rgba(K.ACCENT.deep, 0.35);
        for (let r = 0; r * 22 < fh; r++) for (let c = 0; c < 5; c++) { ctx.beginPath(); ctx.ellipse(x - 72 + c * 36 + (r % 2) * 18, base - 14 - r * 22, 15, 6, 0, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
      // falling coins while filling
      if (t > tI[i] && t < tI[i] + 1.8) for (let k = 0; k < 6; k++) {
        const u = ((t - tI[i]) * 1.6 + k / 6) % 1, cy = lerp(tankTop - 120, base - h * fillK - 20, u);
        if (t - tI[i] > 1.6 && u > 0.9) continue;
        K.drawCoin(ctx, x - 50 + (k * 37) % 100, cy, 0.7, { spin: t * 8 + k, shadow: false });
      }
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(220,230,255,0.55)'; ctx.beginPath(); ctx.moveTo(x - W / 2 + 18, tankTop + 26); ctx.lineTo(x - W / 2 + 18, base - 30); ctx.stroke();
      roundRect(ctx, x - W / 2 - 10, base - 4, W + 20, 18, 8); ctx.fillStyle = '#3b4260'; ctx.fill();
      // name + amount
      const nk = K.popIn(t, tI[i], 0.4);
      pill(x, 540, nk, it.name, { dot: true, size: 26 });
      if (nk > 0) bigText(count(it.text, K.phase(t, tI[i] + 0.2, tI[i] + 1.4)), x, 604, 52, ACC);
      const rk = K.popIn(t, tI[i] + 1.6, 0.35);
      if (rk > 0) {
        const ty = base - h + 34;
        ctx.save(); ctx.translate(x, ty); ctx.scale(rk, rk); ctx.rotate(-0.08);
        roundRect(ctx, -64, -20, 128, 40, 8); ctx.fillStyle = '#ffffff'; ctx.fill();
        ctx.font = H.font('display', 24); ctx.fillStyle = '#161927'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.record || 'RECORD', 0, 2);
        ctx.restore();
      }
    });
    // dashed $1M line
    const lk = K.phase(t, tLine, tLine + 0.8, easeOutCubic);
    if (lk > 0) {
      const ly = base - maxH * (P.lineValue || 1) / max;
      ctx.save(); ctx.setLineDash([14, 12]); ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(80, ly); ctx.lineTo(lerp(80, 900, lk), ly); ctx.stroke(); ctx.restore();
      bigText(P.lineLabel || '$1M', 84, ly - 12, 30, '#ffffff', 'left');
      const gk = 0.5 + 0.5 * Math.sin(t * 5);
      K.glow(ctx, xs[2], ly, 120, ACC, 0.25 * gk * lk);
    }
  }

  else if (mode === 'skyline') {
    const items = P.items || [
      { name: 'Firm A', value: 6, text: '$6M', group: 0 },
      { name: 'Firm B', value: 3.5, text: '$3.5M', group: 0 },
      { name: 'Firm C', value: 2.5, text: '$2.5M', group: 1 },
      { name: 'Firm D', value: 2, text: '$2M', group: 1, up: true },
      { name: 'Firm E', value: 1.5, text: '$1.5M', group: 1, up: true }];
    const max = Math.max(...items.map((x) => x.value)), maxH = 430, base = 1000, W = 136, xs = [147, 317, 487, 657, 827];
    const tBig = at(P.bigCue, D * 0.08) - 0.2, tUp = at(P.upCue, D * 0.85) - 0.6;
    K.camera(ctx, t, [{ t: 0, zoom: 1.1, x: 650, y: 820 }, { t: tBig + 0.6, zoom: 1.0 }, { t: D, zoom: 1.02 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: 990 });
    ctx.fillStyle = 'rgba(8,10,24,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
    items.forEach((it, i) => {
      const x = xs[i], big = it.group === 0;
      const t0 = big ? at(it.cue, tBig + 1 + i * 3) - 0.3 : -1;
      const u = big ? K.phase(t, t0, t0 + 1.1, easeOutCubic) : 1;
      if (u <= 0) return;
      const h = maxH * it.value / max * u, top = base - h;
      const col = big ? '#5d6aa6' : H.mixHex('#3f7a86', ACC, 0.18);
      K.shadow(ctx, x, base + 6, W * 1.3);
      roundRect(ctx, x - W / 2, top, W, h, 10); ctx.fillStyle = col; ctx.fill();
      ctx.fillStyle = H.mixHex(col, '#000000', 0.25); ctx.fillRect(x + W / 2 - 34, top + 8, 26, h - 8);
      roundRect(ctx, x - W / 2 - 8, top - 10, W + 16, 16, 6); ctx.fillStyle = H.mixHex(col, '#ffffff', 0.2); ctx.fill();
      ctx.save(); roundRect(ctx, x - W / 2, top, W, h, 10); ctx.clip();
      for (let r = 0; r * 38 + 24 < h - 20; r++) for (let c = 0; c < 3; c++) {
        const on = H.hash(i * 31 + r * 3 + c, Math.floor(t * 0.5 + r)) < 0.55;
        roundRect(ctx, x - W / 2 + 14 + c * 36, top + 22 + r * 38, 24, 22, 3); ctx.fillStyle = on ? 'rgba(255,225,150,0.8)' : 'rgba(10,14,30,0.6)'; ctx.fill();
      }
      ctx.restore();
      if (u > 0.7) {
        const lk = big ? K.popIn(t, t0 + 0.8, 0.4) : K.popIn(t, 0.2 + (i - 2) * 0.2, 0.4);
        bigText(it.text, x, top - 26, 40, big ? '#ffffff' : ACC);
        pill(x, top - 72, lk, it.name, { size: 24, dot: !big });
      }
      if (it.up && t > tUp) {
        const a = K.popIn(t, tUp + (i - 3) * 0.2, 0.35);
        if (a > 0) { ctx.save(); ctx.translate(x, top - 150 + K.bob(t, 5, 1.3, i * 0.4)); ctx.scale(a, a); ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(20, 0); ctx.lineTo(8, 0); ctx.lineTo(8, 20); ctx.lineTo(-8, 20); ctx.lineTo(-8, 0); ctx.lineTo(-20, 0); ctx.closePath(); ctx.fill(); ctx.restore(); }
      }
    });
    // group labels on the pavement
    ctx.font = H.font('ui', 24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const gk = K.phase(t, tBig, tBig + 0.5);
    if (gk > 0) { ctx.globalAlpha = gk; ctx.fillStyle = '#c9d0ea'; ctx.fillText(P.groupA || 'BIG TECH', 232, 1028); ctx.globalAlpha = 1; }
    ctx.fillStyle = ACC; ctx.fillText(P.groupB || 'AI COMPANIES', 657, 1028);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(80, 1008, 300, 3); ctx.fillStyle = H.rgba(ACC, 0.5); ctx.fillRect(420, 1008, 474, 3);
    pill(742, 640, K.popIn(t, tUp + 0.4, 0.45), P.upText || 'Up every quarter', { size: 26, accent: true });
  }

  else if (mode === 'topics') {
    const topics = P.topics || [
      { text: "Kids' online safety", icon: 'kid' },
      { text: 'Chip exports', icon: 'chip' },
      { text: 'AI safety oversight', icon: 'shield' },
      { text: "Data centers' power", icon: 'bolt' }];
    const tT = topics.map((x, i) => at(x.cue, 1.8 + i * 2) - 0.25);
    const tRules = at(P.rulesCue, D * 0.78) - 0.2, tPhone = at(P.phoneCue, tRules + 1.2) - 0.2, tBill = at(P.billCue, tRules + 1.9) - 0.2;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 500, y: 740 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: 990 });
    lawn(990);
    dome(560, 985, 0.9, 0.6);
    ctx.fillStyle = 'rgba(6,8,20,0.5)'; ctx.fillRect(0, 0, 1080, 1920);
    // the report on an easel (left)
    const ek = K.popIn(t, 0.05, 0.5);
    const sx = 90, sy = 470, sw = 330, sh = 420;
    ctx.save(); ctx.translate(sx + sw / 2, sy + sh); ctx.scale(Math.min(1, ek), Math.min(1, ek)); ctx.translate(-(sx + sw / 2), -(sy + sh));
    ctx.strokeStyle = '#7b5a3e'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(sx + 60, sy + sh); ctx.lineTo(sx + 30, 1030); ctx.moveTo(sx + sw - 60, sy + sh); ctx.lineTo(sx + sw - 30, 1030); ctx.stroke();
    roundRect(ctx, sx, sy, sw, sh, 12); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = '#161927'; ctx.font = H.font('display', 26); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(P.sheet || 'LOBBYING REPORT', sx + 24, sy + 50);
    ctx.fillStyle = '#8a92b8'; ctx.font = H.font('ui', 20); ctx.fillText(P.sheetSub || 'Issues lobbied', sx + 24, sy + 80);
    topics.forEach((tp, i) => {
      const ry = sy + 112 + i * 72, lit = t >= tT[i];
      roundRect(ctx, sx + 16, ry, sw - 32, 56, 8); ctx.fillStyle = lit ? H.rgba(ACC, 0.35) : '#e3e7f2'; ctx.fill();
      roundRect(ctx, sx + 30, ry + 16, 160 - (i * 23) % 50, 9, 4); ctx.fillStyle = '#b9c1d6'; ctx.fill();
      roundRect(ctx, sx + 30, ry + 33, 220 - (i * 41) % 70, 9, 4); ctx.fillStyle = '#c8cfe0'; ctx.fill();
    });
    ctx.restore();
    // topic chips fly out to the right column
    const icon = (kind, x, y) => {
      ctx.save(); ctx.translate(x, y);
      ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
      ctx.fillStyle = K.ACCENT.deep; ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 4; ctx.lineCap = 'round';
      if (kind === 'kid') { ctx.beginPath(); ctx.arc(0, -8, 8, 0, Math.PI * 2); ctx.fill(); roundRect(ctx, -9, 2, 18, 16, 6); ctx.fill(); }
      else if (kind === 'chip') { roundRect(ctx, -11, -11, 22, 22, 4); ctx.fill(); for (let k = -1; k <= 1; k++) { ctx.beginPath(); ctx.moveTo(-17, k * 7); ctx.lineTo(17, k * 7); ctx.moveTo(k * 7, -17); ctx.lineTo(k * 7, 17); ctx.stroke(); } roundRect(ctx, -11, -11, 22, 22, 4); ctx.fill(); }
      else if (kind === 'shield') { ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(13, -10); ctx.lineTo(11, 6); ctx.lineTo(0, 16); ctx.lineTo(-11, 6); ctx.lineTo(-13, -10); ctx.closePath(); ctx.fill(); }
      else { ctx.beginPath(); ctx.moveTo(4, -17); ctx.lineTo(-10, 3); ctx.lineTo(0, 3); ctx.lineTo(-4, 17); ctx.lineTo(10, -3); ctx.lineTo(0, -3); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    };
    topics.forEach((tp, i) => {
      const u = K.phase(t, tT[i], tT[i] + 0.6, easeOutCubic);
      if (u <= 0) return;
      const fx = lerp(sx + sw / 2, 700, u), fy = lerp(sy + 140 + i * 72, 500 + i * 82, u);
      ctx.save(); ctx.translate(fx, fy); const s = lerp(0.6, 1, u) * (1 + 0.06 * Math.sin(clamp((t - tT[i] - 0.6) / 0.3) * Math.PI)); ctx.scale(s, s);
      ctx.font = H.font('ui', 28); const tw = ctx.measureText(tp.text).width, w = tw + 100;
      roundRect(ctx, -w / 2, -32, w, 64, 32); ctx.fillStyle = 'rgba(10,12,24,0.92)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = H.rgba(ACC, 0.6); roundRect(ctx, -w / 2, -32, w, 64, 32); ctx.stroke();
      icon(tp.icon, -w / 2 + 36, 0);
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(tp.text, -w / 2 + 74, 2);
      ctx.restore();
    });
    // a person: phone, then the power bill; hedged pill
    const pk = K.phase(t, tRules - 0.4, tRules + 0.6, easeOutCubic);
    if (pk > 0) {
      const px = lerp(1160, 640, pk);
      K.drawPerson(ctx, px, 1038, 0.95, { t, walk: pk < 1 ? t : undefined, pose: t > tPhone ? 'phone' : 'stand', flip: true, shirt: 1, skin: 2, hair: 1, hairStyle: 'bun', seed: 44, mood: t > tBill ? 'worried' : 'neutral' });
      const bk = K.popIn(t, tBill, 0.4);
      if (bk > 0) {
        K.drawDocument(ctx, 830, 1030, 0.62 * Math.min(1.05, bk), { lines: 4, title: false });
        ctx.save(); ctx.translate(830, 960); ctx.scale(bk, bk); icon('bolt', 0, 0); ctx.restore();
        pill(830, 905, bk, P.bill || 'Power bill', { size: 22 });
      }
      if (t > tPhone) K.glow(ctx, px - 10, 1038 - 180 * 0.95, 60, ACC, 0.35 + 0.15 * Math.sin(t * 6));
      pill(560, 860, K.popIn(t, tRules + 0.1, 0.4), P.could || 'Could touch you', { size: 26, accent: true });
    }
  }

  else if (mode === 'caveat') {
    const rows = P.rows || ["Kids' online safety", 'Chip exports', 'AI safety oversight', "Data centers' power"];
    const tTop = at(P.topicsCue, 1.8) - 0.2, tPos = at(P.posCue, 2.8) - 0.2;
    const tFor = at(P.forCue, D * 0.8) - 0.2, tStamp = at(P.stampCue, D * 0.88) + 0.1;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 730 }]);
    K.world.office(ctx, { t, time: 'night' });
    ctx.fillStyle = 'rgba(6,8,20,0.45)'; ctx.fillRect(0, 0, 1080, 1920);
    const sx = 100, sy = 500, sw = 774, sh = 470;
    const ek = K.popIn(t, 0, 0.45);
    ctx.save(); ctx.translate(487, sy + sh / 2); ctx.scale(Math.min(1, ek), Math.min(1, ek)); ctx.translate(-487, -(sy + sh / 2));
    roundRect(ctx, sx, sy, sw, sh, 18); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = '#161927'; ctx.font = H.font('display', 30); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(P.sheet || 'LOBBYING REPORT', sx + 30, sy + 56);
    const c1 = sx + 30, c2 = sx + 500;
    const posK = K.phase(t, tPos, tPos + 0.4);
    ctx.font = H.font('ui', 22); ctx.fillStyle = '#5b6380';
    ctx.fillText(P.colA || 'TOPIC', c1, sy + 104);
    ctx.fillStyle = posK > 0 ? H.mixHex('#5b6380', RED, posK) : '#5b6380'; ctx.fillText(P.colB || 'FOR / AGAINST', c2, sy + 104);
    ctx.fillStyle = '#d5dae8'; ctx.fillRect(sx + 20, sy + 120, sw - 40, 3); ctx.fillRect(c2 - 24, sy + 84, 3, sh - 110);
    rows.forEach((r, i) => {
      const ry = sy + 140 + i * 80;
      const tk = K.popIn(t, tTop + i * 0.18, 0.35);
      ctx.font = H.font('bold', 30); ctx.fillStyle = '#161927'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(r, c1 + 46, ry + 26);
      if (tk > 0) { ctx.save(); ctx.translate(c1 + 16, ry + 26); ctx.scale(tk, tk); ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fillStyle = '#3d9a6a'; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(-2, 6); ctx.lineTo(8, -6); ctx.stroke(); ctx.restore(); }
      roundRect(ctx, c2, ry + 8, 220, 36, 8); ctx.fillStyle = '#e3e7f2'; ctx.fill();
      const qk = K.popIn(t, tPos + 0.3 + i * 0.15, 0.35);
      if (qk > 0) { ctx.save(); ctx.translate(c2 + 110, ry + 28); ctx.scale(qk, qk); ctx.font = H.font('display', 34); ctx.fillStyle = RED; ctx.textAlign = 'center'; ctx.fillText('?', 0, 2); ctx.restore(); }
    });
    ctx.restore();
    // magnifier sweeping the position column
    const mk = K.phase(t, tPos, tPos + 0.5);
    if (mk > 0) {
      const ph = clamp((t - tPos - 0.3) / Math.max(1, tFor - tPos)), my = sy + 166 + 80 * 3 * (0.5 - 0.5 * Math.cos(ph * Math.PI * 2));
      const mx = c2 + 110 + Math.sin(t * 2) * 30;
      ctx.save(); ctx.globalAlpha = mk;
      ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(mx + 46, my + 46); ctx.lineTo(mx + 100, my + 100); ctx.stroke();
      ctx.beginPath(); ctx.arc(mx, my, 62, 0, Math.PI * 2); ctx.fillStyle = 'rgba(200,225,255,0.18)'; ctx.fill();
      ctx.lineWidth = 10; ctx.strokeStyle = '#3b4260'; ctx.stroke();
      ctx.restore();
    }
    pill(300, 1034, K.popIn(t, tFor, 0.4), P.a || 'For?', { size: 30 });
    pill(674, 1034, K.popIn(t, tFor + 0.35, 0.4), P.b || 'Against?', { size: 30 });
    const sk = clamp((t - tStamp) / 0.6);
    if (sk > 0) K.drawStamp(ctx, 714, 900, 0.9, { kind: 'cross', text: P.stamp || 'NOT LISTED', land: sk });
    pill(487, 470, K.popIn(t, 0.2, 0.4), P.head || 'Topics, not positions', { size: 28, accent: true });
  }

  else { // payoff
    const tA = at(P.aCue, 0.1) - 0.1, tB = at(P.bCue, 1.2) - 0.1, tC = at(P.cCue, 2.2) - 0.1;
    const tQ = at(P.qCue, D * 0.5) - 0.3;
    K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 760 }, { t: D, zoom: 1.0 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: 990 });
    lawn(990);
    dome(487, 985, 0.95, 0.75);
    ctx.fillStyle = 'rgba(6,8,20,0.25)'; ctx.fillRect(0, 0, 1080, 1920);
    // lectern + open rulebook; three robots around it
    K.drawLectern(ctx, 487, 1036, 0.85);
    K.drawRulebook(ctx, 487, 1036 - 232 * 0.85 + 8, 0.72, { open: K.phase(t, tQ - 0.5, tQ + 0.6), title: P.book || 'AI RULES' });
    K.glow(ctx, 487, 760, 160, ACC, t > tQ ? 0.25 + 0.1 * Math.sin(t * 4) : 0.1);
    [[205, 0], [330, 1], [770, 2]].forEach(([x, i]) => {
      const k = K.phase(t, tA + i * 0.25, tA + i * 0.25 + 0.6, easeOutCubic);
      if (k <= 0) return;
      K.drawRobot(ctx, x, 1036 + (1 - k) * 40, 1.0, { t, state: t > tQ ? 'thinking' : 'happy', flip: x > 487, seed: 7 + i });
    });
    const rowOut = clamp((t - tQ) / 0.3);
    if (rowOut < 1) {
      ctx.save(); ctx.globalAlpha = 1 - rowOut;
      pill(230, 520, K.popIn(t, tA, 0.4), P.p1 || 'Big names', { size: 30 });
      pill(487, 520, K.popIn(t, tB, 0.4), P.p2 || 'Record spend', { size: 30, accent: true });
      pill(744, 520, K.popIn(t, tC, 0.4), P.p3 || 'One quarter', { size: 30 });
      ctx.restore();
    }
    const ak = K.popIn(t, tQ, 0.45);
    if (ak > 0) {
      ctx.save(); ctx.translate(487, 500); const s = Math.min(1.05, ak); ctx.scale(s, s);
      const Wq = 820, Hq = 150;
      card(0, 0, Wq, Hq, 0.95, ACC);
      let size = 50, lines; for (; size >= 30; size -= 2) { lines = H.wrap(ctx, P.question || "Should AI companies help write AI's rules?", 'display', size, Wq - 60); if (lines.length <= 2) break; }
      ctx.font = H.font('display', size); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const lh = size * 1.15, y0q = 2 - ((lines.length - 1) * lh) / 2;
      lines.forEach((ln, j) => ctx.fillText(ln, 0, y0q + j * lh));
      ctx.restore();
      const c1 = K.popIn(t, tQ + 0.5, 0.4), c2 = K.popIn(t, tQ + 0.75, 0.4);
      if (c1 > 0) K.drawLabel(ctx, 270, 660 + K.bob(t, 3, 1.4, 0), Math.min(1.05, c1), { text: P.a || 'Yes, they know AI', size: 30, dot: true });
      if (c2 > 0) K.drawLabel(ctx, 704, 660 + K.bob(t, 3, 1.4, 1.5), Math.min(1.05, c2), { text: P.b || 'No, keep them out', size: 30, dot: true });
    }
  }
  ctx.restore();
}
