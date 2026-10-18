// Scene "terms-rewrite" (full frame). A company's terms of service as a giant paper sheet on an easel in a night
// office. Generic: the company is a text name in the sheet header (no logo). Defaults are placeholders: pass the
// company, the verbatim clause, dates and the statement from your story.
// modes:
//  write  (best as 2-beat span) a giant pencil writes a new glowing line into the terms; the pencil flips to its eraser
//         end (tease); then a reader's phone pings "Terms updated", a date pill + an audience pill pop, and a zoom
//         panel types the new clause verbatim; the key word lights up on its cue.
//  erase  the clause panel is up; angry "!" bubbles from two readers on backlashCue; the giant eraser rubs out the key
//         word (crumbs) on eraseCue; a "only: ..." tag lands on limitCue; a statement quote panel types on quoteCue.
//  payoff calendar page "starts <date>" drops by the sheet, then a two-answer question card.
// params: company ("Company"), sheet ("Terms of service"), panelHead ("The new line in the terms"), clause (verbatim
//         text; wrap the key word in \u00a0 if it touches punctuation), key (word to light/erase, "train"),
//         date ("This month"), audience ("Some accounts"), notif ("Terms updated"), limit ("Only: some products"),
//         quote ("Nothing has changed for you."), quoteBy ("Company statement"), startsLabel ("New terms start"),
//         startsDate ("SOON"), question ("Would you read the new terms?"), a ("Fine by me"), b ("No way")
//         cues (narration words; without them, fractions of the scene): writeCue, flipCue, notifCue ("updated"),
//         dateCue, audCue, clauseCue, keyCue (key), backlashCue ("backlash"), eraseCue (key), limitCue,
//         quoteCue ("statement"), startsCue, qCue ("should")
// Fits: any "company quietly changed its terms / policy, then walked it back" story.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, rgba } = H;
  const mode = P.mode || 'write';
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const KEY = P.key || 'train';
  const clause = P.clause || '“We may use content from your pages to …\u00a0train\u00a0… our AI.”';

  // ---------- cue times ----------
  const C = {};
  if (mode === 'write') {
    C.write = at(P.writeCue, D * 0.09) - 0.2;
    C.flip = at(P.flipCue, D * 0.2) - 0.25;
    C.notif = at(P.notifCue || 'updated', D * 0.36) - 0.2;
    C.date = at(P.dateCue, D * 0.3) - 0.2;
    C.aud = at(P.audCue, D * 0.47) - 0.2;
    C.clause = at(P.clauseCue, D * 0.6) - 0.3;
    C.key = at(P.keyCue || KEY, D * 0.9) - 0.1;
  } else if (mode === 'erase') {
    C.backlash = at(P.backlashCue || 'backlash', D * 0.07) - 0.15;
    C.erase = at(P.eraseCue || KEY, D * 0.27) - 0.35;
    C.limit = at(P.limitCue, D * 0.41) - 0.2;
    C.quote = at(P.quoteCue || 'statement', D * 0.63) - 0.1;
  } else {
    C.starts = at(P.startsCue, D * 0.2) - 0.35;
    C.q = at(P.qCue || 'should', D * 0.48) - 0.2;
  }

  // ---------- camera + world ----------
  if (mode === 'write') K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 487, y: 860 }, { t: 3.4, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 735 }]);
  else if (mode === 'erase') K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 700 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 730 }]);
  K.world.office(ctx, { t, time: 'night' });
  ctx.fillStyle = 'rgba(6,8,20,0.35)'; ctx.fillRect(-200, -200, 1500, 2400);

  // ---------- the sheet ----------
  const SX = 222, SW = 530, ST = 560, SB = 1010, LINE_Y = 905;
  // easel legs
  ctx.strokeStyle = K.NEUTRAL.woodS || '#6b4a35'; ctx.lineWidth = 16; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(SX + 60, SB - 40); ctx.lineTo(SX + 20, 1040); ctx.moveTo(SX + SW - 60, SB - 40); ctx.lineTo(SX + SW - 20, 1040); ctx.stroke();
  K.shadow(ctx, 487, 1040, 620);
  ctx.save();
  roundRect(ctx, SX, ST, SW, SB - ST, 18); ctx.fillStyle = '#f4f1e8'; ctx.fill();
  roundRect(ctx, SX, ST, SW, 70, 18); ctx.fillStyle = '#2b3157'; ctx.fill(); ctx.fillRect(SX, ST + 40, SW, 30);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const hf = H.fitText(ctx, (P.company || 'Company') + ' · ' + (P.sheet || 'Terms of service'), 'bold', 30, 20, SW - 40);
  ctx.font = hf.font; ctx.fillStyle = '#ffffff'; ctx.fillText(hf.text, 487, ST + 36);
  // grey text lines (skip the gap where the new line goes)
  for (let i = 0; i < 9; i++) {
    const y = ST + 100 + i * 34;
    if (Math.abs(y - LINE_Y) < 20) continue;
    const w = (i % 4 === 3 ? 0.55 : 0.82 + 0.12 * H.hash(i, 3)) * (SW - 80);
    roundRect(ctx, SX + 40, y - 6, w, 12, 6); ctx.fillStyle = '#c9c4b5'; ctx.fill();
  }
  ctx.restore();

  // the new line: written (write), present (erase), present (payoff)
  const lineX0 = SX + 40, lineX1 = SX + SW - 50;
  let written = mode === 'write' ? clamp((t - C.write) / 1.3) : 1;
  const erasedK = mode === 'erase' ? clamp((t - C.erase) / 1.1) : 0;
  if (written > 0) {
    const pts = [];
    for (let i = 0; i <= 40; i++) { const u = i / 40; pts.push([lerp(lineX0, lineX1, u), LINE_Y + Math.sin(u * 38) * 5 * (1 - Math.abs(u - 0.5))]); }
    K.glow(ctx, 487, LINE_Y, 240, ACC, 0.25 * written);
    ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 9; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    K.pathDraw(ctx, pts, written); ctx.restore();
    // erased chunk (the key word) in erase/payoff modes: a paper-coloured patch + smudge
    const ek = mode === 'payoff' ? 1 : erasedK;
    if (ek > 0) {
      const ex0 = lineX0 + (lineX1 - lineX0) * 0.55, ew = (lineX1 - lineX0) * 0.25 * ek;
      ctx.fillStyle = '#f4f1e8'; ctx.fillRect(ex0, LINE_Y - 14, ew, 28);
      ctx.fillStyle = 'rgba(150,140,120,0.25)'; roundRect(ctx, ex0, LINE_Y - 10, ew, 20, 10); ctx.fill();
    }
  }

  // ---------- giant pencil ----------
  const pencil = (x, y, ang, eraserDown) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang); if (eraserDown) ctx.rotate(Math.PI);
    // drawn with the writing tip at (0,0), body going up-right along -y
    ctx.fillStyle = '#f2c86b'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-18, -44); ctx.lineTo(18, -44); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3a3a4a'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-6, -14); ctx.lineTo(6, -14); ctx.closePath(); ctx.fill();
    ctx.fillStyle = ACC; ctx.fillRect(-20, -300, 40, 256);
    ctx.fillStyle = rgba('#000000', 0.15); ctx.fillRect(6, -300, 14, 256);
    ctx.fillStyle = '#b9bfd0'; ctx.fillRect(-21, -334, 42, 36);
    ctx.fillStyle = '#ef8fa8'; roundRect(ctx, -20, -384, 40, 54, 12); ctx.fill();
    ctx.restore();
  };
  const eraserTip = (x, y, ang) => { // draw with the ERASER at (x, y)
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang + Math.PI); ctx.translate(0, 384); pencil(0, 0, 0, false); ctx.restore();
  };

  if (mode === 'write') {
    // pencil flies in, writes along the line, then flips eraser-down and hovers
    const inK = smooth(t / 0.8);
    const wu = clamp((t - C.write) / 1.3);
    let px = lerp(980, lineX0, inK), py = lerp(700, LINE_Y, inK);
    if (t > C.write) { px = lerp(lineX0, lineX1, wu); py = LINE_Y + Math.sin(wu * 38) * 5 * (1 - Math.abs(wu - 0.5)) + (t < C.write + 1.3 ? -4 * Math.abs(Math.sin(t * 22)) : 0); }
    const leave = smooth((t - (C.date - 0.1)) / 0.7);
    const fk = smooth((t - C.flip) / 0.45);
    if (leave < 1) {
      ctx.save(); ctx.globalAlpha = 1 - leave; ctx.translate(lerp(0, 500, leave), lerp(0, -300, leave));
      if (fk < 0.5) pencil(px, py, 0.55 - fk * 2, false);
      else {
        const hov = K.bob(t, 6, 3);
        eraserTip(lineX1 - 70 + 20 * Math.sin((t - C.flip) * 9) * (1 - smooth((t - C.flip - 0.4) / 0.6)), LINE_Y - 30 + hov - 40 * (1 - fk), -0.5 + (1 - fk) * 2);
      }
      ctx.restore();
    }
    // reader with a phone (right), notification bubble
    K.drawPerson(ctx, 865, 1040, 1.05, { t, pose: 'phone', mood: t > C.key ? 'shocked' : 'neutral', skin: 2, hair: 1, shirt: 3, hairStyle: 'long', flip: true, seed: 6, look: -0.6 });
    const nk = K.popIn(t, C.notif, 0.4);
    const nf = 1 - smooth((t - C.clause) / 0.3);
    if (nk > 0 && nf > 0) { ctx.save(); ctx.globalAlpha = nf; K.drawSpeechBubble(ctx, 840, 760, Math.min(1.05, nk), { text: P.notif || 'Terms updated', size: 26, tail: 'right', maxW: 220 }); ctx.restore(); }
    // pills
    const dk = K.popIn(t, C.date, 0.4);
    if (dk > 0) K.drawLabel(ctx, 300, 472 + K.bob(t, 3, 1.4), Math.min(1.05, dk), { text: P.date || 'This month', size: 26, dot: true });
    const ak = K.popIn(t, C.aud, 0.4);
    if (ak > 0) K.drawLabel(ctx, 660, 472 + K.bob(t, 3, 1.4, 1), Math.min(1.05, ak), { text: P.audience || 'Some accounts', size: 26, accent: true });
    // zoom panel with the verbatim clause
    const ck = K.popIn(t, C.clause, 0.5);
    if (ck > 0) drawClause(ck, C.clause + 0.4, t > C.key ? 1 : 0, 0, false, C.key);
  } else if (mode === 'erase') {
    // two readers react with "!" bubbles on backlash
    const bk = smooth((t - C.backlash) / 0.4);
    K.drawPerson(ctx, 120, 1040, 1.0, { t, pose: bk > 0 ? 'point' : 'stand', mood: bk > 0 ? 'angry' : 'neutral', skin: 3, hair: 0, shirt: 1, hairStyle: 'short', seed: 2, look: 0.5, talk: bk > 0 && t < C.erase ? info.env * 0.6 : 0 });
    K.drawPerson(ctx, 865, 1040, 1.0, { t, pose: bk > 0 ? 'shrug' : 'phone', mood: bk > 0 ? 'angry' : 'neutral', skin: 2, hair: 1, shirt: 3, hairStyle: 'long', flip: true, seed: 6, look: -0.5 });
    for (let i = 0; i < 4; i++) {
      const k = K.popIn(t, C.backlash + i * 0.18, 0.35), fade = 1 - smooth((t - C.erase - 0.5) / 0.6);
      if (k <= 0 || fade <= 0) continue;
      const bx = [150, 830, 250, 740][i], by = [800, 800, 740, 730][i] + K.bob(t, 5, 2.4, i);
      ctx.save(); ctx.globalAlpha = fade; K.drawSpeechBubble(ctx, bx, by, 0.9 * Math.min(1.05, k), { text: '!', size: 44, tail: i % 2 ? 'right' : 'left', dark: true }); ctx.restore();
    }
    // the clause panel, key word erased by the eraser
    drawClause(1, -10, 1, erasedK, true, 0);
    // eraser rubbing the key word in the panel
    const er = smooth((t - (C.erase - 0.5)) / 0.5) * (1 - smooth((t - C.erase - 1.3) / 0.5));
    if (er > 0 && KP) {
      const rub = Math.sin((t - C.erase) * 26) * 26 * clamp((t - C.erase) / 0.1) * (1 - clamp((t - C.erase - 1.1) / 0.2));
      ctx.save(); ctx.globalAlpha = er;
      eraserTip(KP.x + rub, KP.y + 6 - 60 * (1 - er), -0.35);
      ctx.restore();
      // crumbs
      for (let i = 0; i < 9; i++) {
        const s0 = C.erase + i * 0.11, u = t - s0;
        if (u < 0 || u > 0.9) continue;
        const cx = KP.x + (H.hash(i, 5) - 0.5) * 80 + u * (H.hash(i, 6) - 0.5) * 120, cy = KP.y + 20 + u * 150 + 200 * u * u;
        ctx.globalAlpha = 1 - u / 0.9; ctx.fillStyle = '#ef8fa8'; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
      }
    }
    // limit tag
    const lk = K.popIn(t, C.limit, 0.45);
    if (lk > 0) K.drawLabel(ctx, 487, 778 + K.bob(t, 3, 1.3), Math.min(1.05, lk), { text: P.limit || 'Only: some products', size: 28, accent: true });
    // statement quote panel
    const qk = K.popIn(t, C.quote, 0.45);
    if (qk > 0) {
      ctx.save(); ctx.translate(487, 905); ctx.scale(Math.min(1.04, qk), Math.min(1.04, qk));
      const W = 800, Hh = 170;
      roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 24); ctx.fillStyle = 'rgba(8,10,24,0.95)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.8); roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 24); ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = H.font('ui', 24); ctx.fillStyle = ACC; ctx.fillText(String(P.quoteBy || 'Company statement').toUpperCase(), 0, -Hh / 2 + 32);
      const full = '“' + (P.quote || 'Nothing has changed for you.') + '”';
      const shown = K.typewriter(full, t, 32, C.quote + 0.4);
      let size = 38, lines; for (; size >= 26; size -= 2) { lines = H.wrap(ctx, full, 'bold', size, W - 70); if (lines.length <= 2) break; }
      ctx.font = H.font('bold', size); ctx.fillStyle = '#ffffff';
      let left = shown.length; const lh = size * 1.2, y0 = 20 - ((lines.length - 1) * lh) / 2;
      lines.forEach((ln, j) => { const part = ln.slice(0, Math.max(0, left)); left -= ln.length + 1; ctx.fillText(part, -(ctx.measureText(ln).width - ctx.measureText(part).width) / 2, y0 + j * lh); });
      ctx.restore();
    }
  } else {
    // payoff: calendar page drops, then the question card
    const ck = K.popIn(t, C.starts, 0.5);
    if (ck > 0) {
      const drop = (1 - smooth((t - C.starts) / 0.45)) * -260;
      ctx.save(); ctx.translate(487, 560 + drop); ctx.rotate(-0.05 + 0.04 * Math.sin((t - C.starts) * 5) * Math.exp(-(t - C.starts) * 2));
      roundRect(ctx, -170, 0, 340, 300, 26); ctx.fillStyle = '#ffffff'; ctx.fill();
      roundRect(ctx, -170, 0, 340, 90, 26); ctx.fillStyle = ACC; ctx.fill(); ctx.fillRect(-170, 50, 340, 40);
      ctx.fillStyle = '#2b3157'; for (const dx of [-90, 90]) { roundRect(ctx, dx - 9, -22, 18, 46, 9); ctx.fill(); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const sf = H.fitText(ctx, (P.startsLabel || 'New terms start').toUpperCase(), 'ui', 26, 18, 300);
      ctx.font = sf.font; ctx.fillStyle = K.ACCENT.deep; ctx.fillText(sf.text, 0, 48);
      ctx.font = H.font('display', 92); ctx.fillStyle = '#20243f'; ctx.fillText(P.startsDate || 'SOON', 0, 200);
      ctx.restore();
    }
    const qk = K.popIn(t, C.q, 0.5);
    if (qk > 0) {
      ctx.fillStyle = `rgba(6,7,16,${0.45 * smooth((t - C.q) / 0.4)})`; ctx.fillRect(-200, -200, 1500, 2400);
      ctx.save(); ctx.translate(487, 800); ctx.scale(Math.min(1.04, qk), Math.min(1.04, qk));
      const W = 800, Hh = 330;
      roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 30); ctx.fillStyle = 'rgba(8,10,24,0.96)'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = ACC; roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 30); ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const q = P.question || 'Would you read the new terms?';
      let size = 50, lines; for (; size >= 32; size -= 2) { lines = H.wrap(ctx, q, 'display', size, W - 80); if (lines.length <= 3) break; }
      ctx.font = H.font('display', size); ctx.fillStyle = '#ffffff';
      const lh = size * 1.15, y0 = -60 - ((lines.length - 1) * lh) / 2;
      lines.forEach((ln, j) => ctx.fillText(ln, 0, y0 + j * lh));
      const opts = [P.a || 'Fine by me', P.b || 'No way'];
      opts.forEach((o, i) => {
        const k = K.popIn(t, C.q + 0.6 + i * 0.25, 0.4);
        if (k <= 0) return;
        ctx.save(); ctx.translate(i ? 180 : -180, 100); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
        roundRect(ctx, -150, -36, 300, 72, 36); ctx.fillStyle = i ? 'rgba(255,255,255,0.12)' : ACC; ctx.fill();
        ctx.font = H.font('ui', 30); ctx.fillStyle = i ? '#ffffff' : K.ACCENT.deep; ctx.fillText(o, 0, 2);
        ctx.restore();
      });
      ctx.restore();
    }
  }

  // ---------- clause panel (shared by write + erase) ----------
  var KP;
  function drawClause(k, typeFrom, keyOn, eraseK, struck, keyT) {
    const W = 850, Hh = 236, cx = 487, cy = 610;
    // connector lines from the sheet's new line up to the panel
    ctx.save(); ctx.globalAlpha = clamp(k); ctx.strokeStyle = rgba(ACC, 0.5); ctx.lineWidth = 3; ctx.setLineDash([8, 10]);
    ctx.beginPath(); ctx.moveTo(lineX0, LINE_Y - 12); ctx.lineTo(cx - W / 2 + 30, cy + Hh / 2); ctx.moveTo(lineX1, LINE_Y - 12); ctx.lineTo(cx + W / 2 - 30, cy + Hh / 2); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.translate(cx, cy); ctx.scale(Math.min(1.04, k), Math.min(1.04, k));
    roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 24); ctx.fillStyle = 'rgba(8,10,24,0.985)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.85); roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 24); ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = H.font('ui', 24); ctx.fillStyle = ACC; ctx.fillText(String(P.panelHead || 'The new line in the terms').toUpperCase(), 0, -Hh / 2 + 32);
    // word layout
    const size = 34; ctx.font = H.font('bold', size);
    const words = clause.split(/ +/).map((w) => w.replace(/\u00a0/g, ' ')), sp = ctx.measureText(' ').width, maxW = W - 70, rows = [[]];
    let rw = 0;
    for (const w of words) { const ww = ctx.measureText(w).width; if (rw && rw + sp + ww > maxW) { rows.push([]); rw = 0; } rows[rows.length - 1].push({ w, ww }); rw += (rw ? sp : 0) + ww; }
    const lh = size * 1.25, y0 = 22 - ((rows.length - 1) * lh) / 2;
    const totalChars = clause.length, shown = typeFrom < 0 ? totalChars : K.typewriter(clause, t, 34, typeFrom).length;
    let ci = 0;
    rows.forEach((r, j) => {
      const width = r.reduce((s, o) => s + o.ww, 0) + sp * (r.length - 1);
      let x = -width / 2;
      r.forEach((o) => {
        const vis = Math.max(0, Math.min(o.w.length, shown - ci));
        ci += o.w.length + 1;
        const y = y0 + j * lh;
        const ki = o.w.toLowerCase().indexOf(KEY.toLowerCase());
        const segs = ki < 0 ? [{ s: o.w, key: false }] : [{ s: o.w.slice(0, ki), key: false }, { s: o.w.slice(ki, ki + KEY.length), key: true }, { s: o.w.slice(ki + KEY.length), key: false }];
        let sx = x, used = 0;
        ctx.textAlign = 'left';
        for (const g of segs) {
          if (!g.s) continue;
          const gw = ctx.measureText(g.s).width, gv = Math.max(0, Math.min(g.s.length, vis - used));
          used += g.s.length;
          if (g.key) {
            KP = { x: cx + (sx + gw / 2) * k, y: cy + y * k };
            if (keyOn && eraseK < 1) {
              const pulse = 0.5 + 0.5 * Math.sin((t - keyT) * 6);
              roundRect(ctx, sx - 8, y - size * 0.62, gw + 16, size * 1.24, 10); ctx.fillStyle = rgba(ACC, (struck ? 0.9 : 0.75 + 0.2 * pulse) * (1 - eraseK)); ctx.fill();
            }
          }
          if (gv > 0) {
            ctx.fillStyle = g.key && keyOn ? (struck ? rgba(K.ACCENT.deep, 1 - eraseK) : K.ACCENT.deep) : '#ffffff';
            if (g.key && !keyOn) ctx.fillStyle = '#ffffff';
            ctx.fillText(g.s.slice(0, gv), sx, y);
            if (g.key && struck && eraseK > 0) {
              ctx.fillStyle = rgba('#ffffff', 0.12 * eraseK); roundRect(ctx, sx - 8, y - size * 0.4, gw + 16, size * 0.8, 10); ctx.fill();
              ctx.strokeStyle = rgba('#ff6b6b', eraseK); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(sx - 6, y); ctx.lineTo(sx - 6 + (gw + 12) * eraseK, y); ctx.stroke();
            }
          }
          sx += gw;
        }
        x += o.ww + sp;
      });
    });
    ctx.textAlign = 'center';
    ctx.restore();
  }
  void lerp;
}
