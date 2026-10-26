// Scene "clubhouse" (full frame; from 2026-10-26). An online community told as a cartoon clubhouse on a dusk street (text
// sign only, no logos or copied UI). A moderator (generic cartoon, "Moderator" pill) runs the door; robots stand in for AI
// projects. Fits: a forum / community / platform bans AI (or anything), new membership rules, backlash, a rival
// community opens next door.
// Modes:
//  rules  (3-beat span) robots queue, a NO AI sign drops on the door; the moderator posts a rule board; three robots
//         (tags[3]) are turned away one by one, NOT WELCOME stamp; a verbatim quote panel; then the board grows into a
//         big panel and moreRules tick in, a member with a translate phone is turned away (on moreRules[2] / [3]).
//         params: firstRule, boardTitle, tags [3], stamp, moreRules [{text, ok, cue}] (4), translated, quote, quoteBy,
//         banCue, modCue, postCue, tagCues [3], welcomeCue, quoteCue, moreCue
//  tokens a robot pours token coins on the doorstep, "cheap" tag, coins grey out, "doesn't matter" pill.
//         params: spent, cheap, care, coin, tokCue, careCue
//  revolt members march in with signs [4]; a top-comment card (verbatim), a solo developer's project card with 3 rows
//         (the last one fails, header flips), the 4th member raises a last sign + pill.
//         params: signs [4], commentHead, comment, commentBy, projectHead, failHead, projectRows [{text, ok, cue}] (3),
//         last, revoltCue, commentCue, devCue, qualCue, lastCue
//  rival  pan out: a second clubhouse is built next door (sign drops), people and robots walk in; back at the first door
//         the moderator weighs who gets in (IN? / OUT? sign) + "selective enforcement" pill.
//         params: rivalLabel, sel, inText, outText, buildCue, signCue, modCue, rulesCue, selCue
//  payoff both clubhouses settled, question card with two chips. params: question, a, b, aCue, bCue, qCue
// Shared params: mode, sign, rivalSign, doorSign, modLabel. Defaults are generic placeholders ("The Clubhouse",
// "Quote goes here"); pass the story's names and verbatim quotes. Cue params are optional narration words ("word#n" =
// the (n+1)th time spoken); without them fixed fractions of the scene.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, mixHex, rgba } = H;
  const at = (w, d, off = 0) => { let v = null; if (w) { const m = String(w).match(/^(.*)#(\d+)$/); v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); } return (v == null ? d : v) + off; };
  const mode = P.mode || 'rules';
  const DANGER = '#ff6b5e', FEET = 1032, BASE = 1000;
  const SIGN = P.sign || 'The Clubhouse', RSIGN = P.rivalSign || 'The Other Club', NOAI = P.doorSign || 'NO AI';

  // ---------- helpers ----------
  function fitFont(text, kind, size, maxW, min = 18) {
    let s = size; ctx.font = H.font(kind, s);
    while (s > min && ctx.measureText(text).width > maxW) { s -= 1; ctx.font = H.font(kind, s); }
    return s;
  }
  function tick(x, y, r, ok, k = 1) {
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); const s = Math.min(1.1, k); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = ok ? ACC : DANGER; ctx.fill();
    ctx.strokeStyle = '#10121f'; ctx.lineWidth = r * 0.26; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    if (ok) { ctx.moveTo(-r * 0.45, 0); ctx.lineTo(-r * 0.1, r * 0.38); ctx.lineTo(r * 0.5, -r * 0.4); }
    else { ctx.moveTo(-r * 0.4, -r * 0.4); ctx.lineTo(r * 0.4, r * 0.4); ctx.moveTo(r * 0.4, -r * 0.4); ctx.lineTo(-r * 0.4, r * 0.4); }
    ctx.stroke(); ctx.restore();
  }
  function panel(cx, cy, w, h, k, border) {
    ctx.translate(cx, cy); const s = Math.min(1.04, k); ctx.scale(s, s);
    roundRect(ctx, -w / 2, -h / 2, w, h, 26); ctx.fillStyle = 'rgba(8,10,24,0.93)'; ctx.fill();
    if (border) { ctx.lineWidth = 4; ctx.strokeStyle = border; roundRect(ctx, -w / 2, -h / 2, w, h, 26); ctx.stroke(); }
  }
  // clubhouse anchored bottom-centre. o: sign, wall, roof, open 0..1, doorSign, doorSignK, build 0..1, glow, t
  function club(x, base, s, o) {
    const W = 400 * s, WH = 290 * s, RH = 150 * s, top = base - WH, build = o.build == null ? 1 : o.build;
    if (build <= 0) return;
    ctx.save();
    if (build < 1) { ctx.beginPath(); ctx.rect(x - W, base - build * (WH + RH + 40 * s), W * 2, build * (WH + RH + 40 * s) + 10); ctx.clip(); }
    K.shadow(ctx, x, base, W * 1.1);
    if (o.glow) K.glow(ctx, x, base - WH * 0.6, W * 0.9, ACC, o.glow);
    // walls with planks
    roundRect(ctx, x - W / 2, top, W, WH, 6 * s); ctx.fillStyle = o.wall || '#7b5a44'; ctx.fill();
    ctx.strokeStyle = rgba('#000000', 0.12); ctx.lineWidth = 3 * s;
    for (let i = 1; i < 6; i++) { const yy = top + (WH * i) / 6; ctx.beginPath(); ctx.moveTo(x - W / 2 + 6, yy); ctx.lineTo(x + W / 2 - 6, yy); ctx.stroke(); }
    // roof
    ctx.beginPath(); ctx.moveTo(x - W / 2 - 30 * s, top + 6 * s); ctx.lineTo(x, top - RH); ctx.lineTo(x + W / 2 + 30 * s, top + 6 * s); ctx.closePath();
    ctx.fillStyle = o.roof || '#3b2d52'; ctx.fill();
    ctx.fillStyle = mixHex(o.roof || '#3b2d52', '#000000', 0.25); ctx.fillRect(x - W / 2 - 30 * s, top, W + 60 * s, 10 * s);
    // sign board on the roof
    const sw = W * 0.86, sh = 62 * s, sy = top - 52 * s;
    roundRect(ctx, x - sw / 2, sy - sh / 2, sw, sh, 10 * s); ctx.fillStyle = '#15182e'; ctx.fill();
    ctx.lineWidth = 3 * s; ctx.strokeStyle = rgba(ACC, 0.8); ctx.stroke();
    const fs = fitFont(o.sign, 'display', 34 * s, sw - 24 * s, 14);
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = H.font('display', fs); ctx.fillText(o.sign, x, sy + 2 * s);
    // windows with members inside
    for (const side of [-1, 1]) {
      const wx = x + side * W * 0.32, wy = top + 50 * s, ww = 92 * s, wh = 84 * s;
      roundRect(ctx, wx - ww / 2, wy, ww, wh, 8 * s); ctx.fillStyle = '#ffd98a'; ctx.fill();
      ctx.save(); roundRect(ctx, wx - ww / 2, wy, ww, wh, 8 * s); ctx.clip();
      for (let j = 0; j < 2; j++) {
        const hx = wx + (j ? 18 : -18) * s, hy = wy + wh - 26 * s + Math.sin((o.t || 0) * 2.2 + j * 1.7 + side) * 3 * s;
        ctx.fillStyle = 'rgba(60,40,70,0.75)';
        ctx.beginPath(); ctx.arc(hx, hy, 15 * s, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(hx, hy + 34 * s, 24 * s, 20 * s, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      ctx.strokeStyle = '#4a3428'; ctx.lineWidth = 5 * s; roundRect(ctx, wx - ww / 2, wy, ww, wh, 8 * s); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx, wy + wh); ctx.stroke();
    }
    // door
    const dw = 124 * s, dh = 196 * s, dtop = base - dh, open = clamp(o.open || 0);
    roundRect(ctx, x - dw / 2 - 8 * s, dtop - 8 * s, dw + 16 * s, dh + 8 * s, 8 * s); ctx.fillStyle = '#3a2a22'; ctx.fill();
    ctx.fillStyle = '#ffe6a8'; ctx.fillRect(x - dw / 2, dtop, dw, dh);
    const dwN = dw * (1 - 0.82 * open);
    ctx.fillStyle = o.doorCol || '#a0744f'; ctx.fillRect(x - dw / 2, dtop, dwN, dh);
    ctx.fillStyle = '#f2c14e'; ctx.beginPath(); ctx.arc(x - dw / 2 + dwN - 14 * s, dtop + dh * 0.55, 6 * s, 0, Math.PI * 2); ctx.fill();
    // hanging door sign
    const dk = o.doorSignK == null ? 1 : o.doorSignK;
    if (o.doorSign && dk > 0) {
      ctx.save(); ctx.translate(x, dtop + 18 * s); ctx.rotate(Math.sin((o.t || 0) * 3) * 0.05 * (1 + 3 * Math.max(0, 1 - dk)));
      const bw = Math.max(112 * s, 0) , bh = 54 * s, drop = (1 - Math.min(1, dk)) * -60 * s;
      ctx.strokeStyle = '#d8d8e0'; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(-30 * s, drop); ctx.lineTo(-30 * s, drop + 22 * s); ctx.moveTo(30 * s, drop); ctx.lineTo(30 * s, drop + 22 * s); ctx.stroke();
      roundRect(ctx, -bw / 2, drop + 22 * s, bw, bh, 8 * s); ctx.fillStyle = o.doorSignCol || DANGER; ctx.fill();
      const f2 = fitFont(o.doorSign, 'display', 30 * s, bw - 14 * s, 12);
      ctx.font = H.font('display', f2); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.doorSign, 0, drop + 22 * s + bh / 2 + 2);
      ctx.restore();
    }
    // scaffold while building
    if (build < 1) {
      ctx.strokeStyle = '#c99a5b'; ctx.lineWidth = 6 * s;
      for (const sx of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + sx * (W / 2 + 18 * s), base); ctx.lineTo(x + sx * (W / 2 + 18 * s), top - 20 * s); ctx.stroke(); }
    }
    ctx.restore();
  }
  function mod(x, s, o = {}) {
    K.drawPerson(ctx, x, FEET, s, { t, pose: o.pose || 'stand', mood: o.mood || 'neutral', skin: 1, hair: 1, hairStyle: 'short', shirt: '#2f8f6f', flip: o.flip, look: o.look, seed: 7, walk: o.walk });
    if (o.label !== false) K.drawLabel(ctx, x, FEET - 250 * s, Math.min(1.05, o.labelK == null ? 1 : o.labelK), { text: P.modLabel || 'Moderator', size: 24, dot: true });
  }
  function robot(x, s, o = {}) { K.drawRobot(ctx, x, FEET - 4 - (o.hop || 0), s, { t: t + (o.seed || 0), state: o.state || 'idle', seed: o.seed || 3, flip: o.flip }); }
  function quotePanel(k, out, text, by, cy = 500) {
    if (k <= 0 || out >= 1) return;
    ctx.save(); ctx.globalAlpha = 1 - out; panel(487, cy, 820, 220, k, null);
    ctx.fillStyle = ACC; roundRect(ctx, -410, -110, 10, 220, 5); ctx.fill();
    let fs = 44, lines; for (; fs >= 30; fs -= 2) { lines = H.wrap(ctx, '“' + text + '”', 'display', fs, 740); if (lines.length <= 2) break; }
    ctx.font = H.font('display', fs); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lh = fs * 1.18, y0 = -28 - ((lines.length - 1) * lh) / 2;
    lines.forEach((ln, j) => ctx.fillText(ln, 0, y0 + j * lh));
    ctx.font = H.font('ui', 26); ctx.fillStyle = ACC; ctx.fillText('— ' + by, 0, 72);
    ctx.restore();
  }
  function questionCard(tAsk, question, a, b, ax, bx) {
    const ak = K.popIn(t, tAsk, 0.45);
    if (ak <= 0) return;
    ctx.save(); panel(487, 480, 820, 170, ak, ACC);
    let size = 48, lines; for (; size >= 30; size -= 2) { lines = H.wrap(ctx, question, 'display', size, 760); if (lines.length <= 2) break; }
    ctx.font = H.font('display', size); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lh = size * 1.15, y0 = 2 - ((lines.length - 1) * lh) / 2; lines.forEach((ln, j) => ctx.fillText(ln, 0, y0 + j * lh));
    ctx.restore();
    const c1 = K.popIn(t, tAsk + 0.4, 0.4), c2 = K.popIn(t, tAsk + 0.65, 0.4), mk = K.popIn(t, tAsk + 0.9, 0.45);
    if (c1 > 0) K.drawLabel(ctx, ax, 628 + K.bob(t, 3, 1.4, 0), Math.min(1.05, c1), { text: a, size: 32, dot: true });
    if (c2 > 0) K.drawLabel(ctx, bx, 628 + K.bob(t, 3, 1.4, 1.5), Math.min(1.05, c2), { text: b, size: 32, dot: true, accent: true });
    if (mk > 0) { ctx.save(); ctx.translate(487, 618); ctx.scale(Math.min(1.08, mk), Math.min(1.08, mk)); K.glow(ctx, 0, 0, 60, ACC, 0.45 + 0.1 * Math.sin(t * 4)); ctx.font = H.font('display', 56); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 2); ctx.restore(); }
  }
  // rule board: small (on a post, world) or big (panel); rows [{text, t, ok}]
  function ruleBoard(cx, cy, w, k, rows, title) {
    if (k <= 0) return;
    const rh = 58, hh = 70, h = hh + rows.length * rh + 22;
    ctx.save(); ctx.translate(cx, cy); const s = Math.min(1.04, k) * (w / 640); ctx.scale(s, s);
    roundRect(ctx, -320, -h / 2, 640, h, 22); ctx.fillStyle = '#f3efe4'; ctx.fill();
    ctx.lineWidth = 8; ctx.strokeStyle = '#6b4a34'; ctx.stroke();
    for (const px of [-290, 290]) { ctx.fillStyle = '#9aa0b5'; ctx.beginPath(); ctx.arc(px, -h / 2 + 22, 7, 0, Math.PI * 2); ctx.fill(); }
    ctx.font = H.font('display', 40); ctx.fillStyle = '#1b1e30'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(title, 0, -h / 2 + hh / 2 + 6);
    ctx.fillStyle = DANGER; ctx.fillRect(-120, -h / 2 + hh - 4, 240, 5);
    rows.forEach((r, i) => {
      const rk = K.popIn(t, r.t, 0.35); if (rk <= 0) return;
      const y = -h / 2 + hh + 14 + i * rh + rh / 2;
      ctx.save(); ctx.globalAlpha = clamp(rk); ctx.translate((1 - Math.min(1, rk)) * -40, 0);
      tick(-262, y, 20, !!r.ok, rk);
      const f = fitFont(r.text, 'bold', 38, 500, 22); ctx.font = H.font('bold', f); ctx.fillStyle = '#1b1e30'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(r.text, -222, y + 2);
      if (r.hi) { const hk = clamp((t - r.hi) / 0.4); if (hk > 0) { ctx.globalAlpha = 0.35 * hk; roundRect(ctx, -296, y - rh / 2 + 4, 592 * hk, rh - 8, 10); ctx.fillStyle = ACC; ctx.fill(); } }
      ctx.restore();
    });
    ctx.restore();
  }

  if (mode === 'rules' || mode === 'rival') K.world.city(ctx, { t, time: 'dusk', groundY: BASE });

  // =====================================================================================================
  if (mode === 'rules') {
    const tBan = at(P.banCue, D * 0.07, -0.2);
    const tMod = at(P.modCue, D * 0.18, -0.3), tPost = at(P.postCue, D * 0.22, -0.1);
    const TC = P.tagCues || [], cues = [at(TC[0], D * 0.28), at(TC[1], D * 0.33), at(TC[2], D * 0.39)];
    const tWel = at(P.welcomeCue, D * 0.46, -0.2), tReason = at(P.quoteCue, D * 0.5, -0.3), tQOut = at(P.moreCue, D * 0.7, -0.5);
    const MORE = (P.moreRules || [{ text: 'Older projects only', ok: true }, { text: 'More than one maintainer', ok: true },
      { text: 'One language only', ok: true }, { text: 'No translated posts' }]).slice(0, 4);
    const MF = [0.78, 0.82, 0.9, 0.94], MO = [-0.3, -0.4, -0.4, -0.3];
    const tRow = MF.map((f, i) => at((MORE[i] || {}).cue, D * f, MO[i]));
    const tMore = at(P.moreCue, D * 0.7, -0.2);
    const tEng = tRow[2], tTr = tRow[3];
    const CX = 640;
    const doorOpen = smooth((t - tMod) / 0.4) * (1 - smooth((t - tWel) / 0.3));
    club(CX, BASE, 1, { t, sign: SIGN, open: doorOpen, doorSign: NOAI, doorSignK: K.popIn(t, tBan, 0.5), glow: 0.12 });
    // moderator steps out to the right of the door
    const mk = smooth((t - tMod) / 0.8);
    if (mk > 0) {
      const mx = lerp(CX, 790, mk);
      const pointing = (t > tPost - 0.2 && t < tPost + 1.0) || cues.some((c) => t > c - 0.2 && t < c + 0.9) || (t > tEng && t < tTr + 1.2);
      ctx.save(); ctx.globalAlpha = clamp(mk * 2);
      mod(mx, 0.95, { pose: pointing ? 'point' : 'stand', flip: true, look: -0.6, walk: mk < 1 ? t : undefined, labelK: K.popIn(t, tMod + 0.6, 0.4) * (1 - smooth((t - tMore) / 0.3)), label: t < tMore + 0.3 });
      ctx.restore();
    }
    // three robots: queue -> walk up -> turned away -> leave
    const tags = P.tags || ['Uses AI', 'Made by AI', 'For AI'];
    for (let i = 2; i >= 0; i--) {
      const c = cues[i], q = 150 + i * 100, door = 520;
      const go = smooth((t - (c - 1.1)) / 0.9), back = smooth((t - (c + 0.45)) / 1.3);
      const x = lerp(lerp(q, door, go), -120, back) + K.shake(t, c + 0.15, 0.35, 5);
      const shocked = t > tBan && t < tBan + 0.6;
      robot(x, 0.78, { seed: 4 + i, state: t > c + 0.2 ? 'thinking' : 'idle', hop: shocked ? Math.sin(clamp((t - tBan) / 0.6) * Math.PI) * 26 : 0, flip: back > 0.05 });
      const lk = K.popIn(t, c - 0.6, 0.35) * (1 - smooth((t - (c + 0.6)) / 0.3));
      if (lk > 0.01 && x > 40) {
        const lx = Math.max(130, x);
        K.drawLabel(ctx, lx, 800, Math.min(1.05, lk), { text: tags[i], size: 28, dot: true });
        ctx.font = H.font('bold', 28); const tw = ctx.measureText(tags[i]).width;
        if (t > c + 0.15) tick(lx + tw / 2 + 44, 780, 20, false, K.popIn(t, c + 0.15, 0.3) * lk);
      }
    }
    const st = (t - tWel) / 0.5;
    if (st > 0 && t < tMore) { ctx.save(); ctx.globalAlpha = 1 - smooth((t - tReason) / 0.4); K.drawStamp(ctx, CX - 150, 1010, 0.85, { kind: 'cross', text: P.stamp || 'NOT WELCOME', land: st }); ctx.restore(); }
    // a member with a translate phone (rules 4-5)
    const pk = smooth((t - (tEng - 1.2)) / 1.2), pb = smooth((t - (tTr + 0.6)) / 1.4);
    if (pk > 0 && pb < 1) {
      const px = lerp(lerp(-100, 470, pk), -120, pb);
      K.drawPerson(ctx, px, FEET, 0.88, { t, pose: pk < 1 && pb === 0 ? 'stand' : (t > tTr + 0.1 && pb < 0.05 ? 'shrug' : 'phone'), walk: (pk < 1 || pb > 0) ? t : undefined, mood: 'neutral', skin: 3, hair: 2, hairStyle: 'long', shirt: '#e8786a', seed: 21, flip: pb > 0 });
      const tk = K.popIn(t, tTr - 0.2, 0.35) * (1 - pb);
      if (tk > 0.01) { K.drawLabel(ctx, px, 790, Math.min(1.05, tk), { text: P.translated || 'Translated post', size: 26, dot: true }); tick(px + 128, 766, 18, false, K.popIn(t, tTr + 0.2, 0.3) * (1 - pb)); }
    }
    // rule board: small on the left wall, then grows into a big panel
    const grow = smooth((t - tMore) / 0.8);
    const rows = [{ text: P.firstRule || 'No AI projects', t: cues[0] + 0.3 }];
    if (grow > 0) MORE.forEach((r, i) => rows.push({ text: r.text, t: tRow[i], ok: !!r.ok }));
    const bk = K.popIn(t, tPost, 0.45);
    // keep the small board clear of the quote panel (slides down while the quote is up)
    ruleBoard(lerp(285, 487, grow), lerp(690, 600, grow), lerp(450, 700, grow), bk, rows, P.boardTitle || 'NEW RULES');
    // quote panel
    quotePanel(K.popIn(t, tReason, 0.45), clamp((t - tQOut) / 0.3), P.quote || 'Quote goes here', P.quoteBy || 'The moderators', 490);
    return;
  }

  // =====================================================================================================
  if (mode === 'tokens') {
    const tTok = at(P.tokCue, D * 0.51, -0.2), tCare = at(P.careCue, D * 0.77, -0.3), tStart = 0.2;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 520, y: 800 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: BASE });
    const CX = 700;
    club(CX, BASE, 1, { t, sign: SIGN, open: 0, doorSign: NOAI, glow: 0.1 });
    mod(840, 0.95, { pose: t > tCare ? 'shrug' : 'stand', flip: true, look: -0.7 });
    // robot pours coins from a sack
    const rx = 300;
    robot(rx, 0.85, { seed: 9, state: t > tTok + 0.6 ? 'thinking' : 'working' });
    ctx.save(); ctx.translate(rx + 70, 860 + Math.sin(t * 6) * 4); ctx.rotate(-0.5);
    roundRect(ctx, -40, -50, 80, 100, 26); ctx.fillStyle = '#c9a26b'; ctx.fill(); ctx.fillStyle = '#9b7848'; ctx.fillRect(-28, -58, 56, 14);
    ctx.font = H.font('display', 30); ctx.fillStyle = '#4a3418'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.coin || 'T', 0, 6); ctx.restore();
    const grey = smooth((t - tTok - 0.3) / 0.8);
    const n = Math.floor(clamp((t - tStart) / 3.0) * 16);
    for (let i = 0; i < 16; i++) {
      // landed pile
      const lx = 470 + (i % 5) * 34 + (Math.floor(i / 5) % 2) * 17, ly = BASE + 24 - Math.floor(i / 5) * 18;
      const tf = tStart + (i / 16) * 3.0, fk = clamp((t - tf) / 0.55);
      if (fk <= 0) continue;
      const sx = rx + 90, sy = 840;
      const x = lerp(sx, lx, fk), y = lerp(sy, ly, fk) - Math.sin(fk * Math.PI) * 90;
      ctx.save(); if (grey > 0) ctx.filter = `grayscale(${grey})`; ctx.globalAlpha = 1 - grey * 0.35;
      K.drawCoin(ctx, x, y, 0.55, { spin: fk < 1 ? t * 8 + i : 0.3 * i, symbol: P.coin || 'T', shadow: fk >= 1 });
      ctx.restore();
    }
    void n;
    ctx.restore();
    // screen-space pills
    const pk1 = K.popIn(t, 0.3, 0.4);
    if (pk1 > 0) K.drawLabel(ctx, 300, 790, Math.min(1.05, pk1), { text: P.spent || 'AI tokens spent', size: 30, dot: true });
    const tagK = K.popIn(t, tTok, 0.45);
    if (tagK > 0) {
      ctx.save(); panel(487, 450, 640, 100, tagK, ACC);
      const cheap = P.cheap || 'CHEAP TO MAKE'; fitFont(cheap, 'display', 52, 600, 28); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(cheap, 0, 4);
      ctx.restore();
    }
    const ck = K.popIn(t, tCare, 0.4);
    if (ck > 0) K.drawLabel(ctx, 487, 545, Math.min(1.05, ck), { text: P.care || 'Effort doesn’t count', size: 32, dot: true, accent: true });
    return;
  }

  // =====================================================================================================
  if (mode === 'revolt') {
    const tRev = at(P.revoltCue, D * 0.03, -0.6), tCom = at(P.commentCue, D * 0.12, -0.4), tDev = at(P.devCue, D * 0.38, -0.6);
    const PR = P.projectRows || [{ text: 'Long-running project', ok: true }, { text: 'No AI used', ok: true }, { text: 'Only one maintainer', ok: false }];
    const tAge = at((PR[0] || {}).cue, D * 0.43, -0.1), tZero = at((PR[1] || {}).cue, D * 0.55, -0.1), tOnly = at((PR[2] || {}).cue, D * 0.75, -0.2);
    const tEng = at(P.lastCue, D * 0.86, -0.4);
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 500, y: 760 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: BASE });
    const CX = 660;
    club(CX, BASE, 0.88, { t, sign: SIGN, open: 0, doorSign: NOAI });
    mod(820, 0.95, { pose: t > tEng ? 'shrug' : 'stand', flip: true, look: -0.6, mood: 'worried' });
    // crowd
    const signs = P.signs || ['?!', 'Why?', 'Really?', 'Fair?'];
    const crowd = [{ x: 120, sk: 0, hr: 1, sh: '#6f86e0', hs: 'short' }, { x: 262, sk: 2, hr: 3, sh: '#4fb3a6', hs: 'bun' }, { x: 404, sk: 4, hr: 0, sh: '#a08be0', hs: 'curly' }, { x: 546, sk: 3, hr: 2, sh: '#e8a05a', hs: 'long' }];
    crowd.forEach((c, i) => {
      const k = clamp((t - tRev - i * 0.15) / 1.3); if (k <= 0) return;
      const x = c.x - (1 - H.easeOutCubic(k)) * 600;
      const dev = i === 2 && t > tDev;
      const step = dev ? smooth((t - tDev) / 0.6) : 0;
      K.drawPerson(ctx, x + step * 40, FEET, 0.9, { t, walk: k < 1 ? t : undefined, pose: dev ? (t > tOnly + 0.3 ? 'shrug' : 'stand') : (k < 1 ? 'stand' : 'cheer'), mood: dev ? 'worried' : 'angry', skin: c.sk, hair: c.hr, hairStyle: c.hs, shirt: c.sh, seed: 31 + i });
      // signs (the developer lowers theirs)
      const isEng = i === 3;
      const up = isEng ? K.phase(t, tEng, tEng + 0.4, H.easeOutBack) : K.phase(t, tRev + 1.2 + i * 0.1, tRev + 1.6 + i * 0.1, H.easeOutBack) * (1 - (i === 2 ? step : 0));
      if (up > 0.01) {
        ctx.save(); ctx.translate(x + (isEng ? -20 : 28), FEET - 205 - (isEng ? 22 : 60) * up + Math.sin(t * 3 + i) * 4); ctx.rotate(Math.sin(t * 2 + i * 1.7) * 0.06); ctx.globalAlpha = clamp(up * 1.5);
        ctx.fillStyle = '#8a6a4a'; ctx.fillRect(-4, 0, 8, 96);
        const sw2 = isEng ? 210 : 128; roundRect(ctx, -sw2 / 2, -76, sw2, 80, 8); ctx.fillStyle = '#f2f4fa'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = isEng ? ACC : DANGER; ctx.stroke();
        const f = fitFont(signs[i], 'display', 32, sw2 - 14, 20); ctx.font = H.font('display', f); ctx.fillStyle = '#161927'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(signs[i], 0, -34);
        ctx.restore();
      }
    });
    ctx.restore();
    // top-comment card (verbatim)
    const cmK = K.popIn(t, tCom, 0.45), cmOut = clamp((t - (tDev - 0.2)) / 0.3);
    if (cmK > 0 && cmOut < 1) {
      ctx.save(); ctx.globalAlpha = 1 - cmOut; panel(487, 500, 820, 200, cmK, null);
      // generic up arrow + count-free "Top comment" header
      ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(-360, -50); ctx.lineTo(-336, -78); ctx.lineTo(-312, -50); ctx.closePath(); ctx.fill(); ctx.fillRect(-344, -52, 16, 22);
      ctx.font = H.font('ui', 28); ctx.fillStyle = ACC; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(P.commentHead || 'Top comment', -290, -60);
      const txt = '“' + (P.comment || 'Comment goes here') + '”';
      let fs = 46, lines; for (; fs >= 30; fs -= 2) { lines = H.wrap(ctx, txt, 'display', fs, 740); if (lines.length <= 2) break; }
      ctx.font = H.font('display', fs); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
      lines.forEach((ln, j) => ctx.fillText(ln, 0, 6 + j * fs * 1.18 - ((lines.length - 1) * fs * 1.18) / 2 + 10));
      ctx.font = H.font('ui', 24); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = H.font('ui', 26); ctx.fillText(P.commentBy || 'a member, in the thread', 0, 76);
      ctx.restore();
    }
    // solo developer's project card
    const pk = K.popIn(t, tDev + 0.2, 0.45), pOut = clamp((t - (tEng - 0.3)) / 0.35);
    if (pk > 0 && pOut < 1) {
      ctx.save(); ctx.globalAlpha = 1 - pOut; panel(487, 510, 700, 240, pk, null);
      ctx.font = H.font('display', 36); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const nq = t > at(P.qualCue, D * 0.66, -0.1); ctx.fillStyle = nq ? DANGER : '#ffffff'; ctx.fillText(nq ? (P.failHead || 'NO LONGER QUALIFIES') : (P.projectHead || 'ONE DEVELOPER’S PROJECT'), 0, -84);
      const rows = PR.slice(0, 3).map((r, i) => ({ text: r.text, t: [tAge, tZero, tOnly][i], ok: !!r.ok }));
      rows.forEach((r, i) => {
        const rk = K.popIn(t, r.t, 0.35); if (rk <= 0) return;
        const y = -28 + i * 54; tick(-250, y, 20, r.ok, rk);
        ctx.save(); ctx.globalAlpha *= clamp(rk); ctx.font = H.font('bold', 36); ctx.fillStyle = r.ok ? '#ffffff' : DANGER; ctx.textAlign = 'left'; ctx.fillText(r.text, -212, y + 2); ctx.restore();
      });
      ctx.restore();
    }
    const ek = K.popIn(t, tEng + 0.1, 0.45);
    if (ek > 0) K.drawLabel(ctx, 487, 480, Math.min(1.05, ek), { text: P.last || 'The rule hits critics too', size: 34, dot: true, accent: true });
    return;
  }

  // =====================================================================================================
  if (mode === 'rival') {
    const tPan = 0.0, tBuild = at(P.buildCue, D * 0.08, -0.4), tSign = at(P.signCue, D * 0.27, -0.1);
    const tMod = at(P.modCue, D * 0.58, -0.4), tObj = at(P.rulesCue, D * 0.7, -0.3), tSel = at(P.selCue, D * 0.82, -0.3);
    const pan = smooth((t - tPan) / 1.4);
    const AX = lerp(640, 290, pan), AS = lerp(1, 0.82, pan), BX = 735, BS = 0.82;
    const build = smooth((t - tBuild) / 1.8);
    club(AX, BASE, AS, { t, sign: SIGN, open: 0, doorSign: NOAI, glow: t > tMod ? 0.18 + 0.08 * Math.sin(t * 4) : 0 });
    club(BX, BASE, BS, { t, sign: RSIGN, wall: '#4f6f9a', roof: '#2c3e63', doorCol: '#7fa3d0', open: smooth((t - tSign - 0.4) / 0.5), build: build, glow: t > tSign ? 0.15 : 0 });
    // sign drop flash
    if (t > tSign && t < tSign + 0.6) K.glow(ctx, BX, BASE - 0.82 * 340, 240, ACC, 0.5 * (1 - (t - tSign) / 0.6));
    // builders with planks during the build
    if (build < 1 || t < tSign + 0.5) {
      for (let i = 0; i < 2; i++) {
        const bx = BX + (i ? 175 : -175);
        K.drawPerson(ctx, bx, FEET, 0.75, { t: t + i, pose: 'cheer', mood: 'happy', skin: i ? 4 : 2, hair: i, hairStyle: i ? 'curly' : 'short', shirt: i ? '#e8786a' : '#4fb3a6', seed: 41 + i });
      }
    }
    // people and robots stroll into the new club
    const walkers = [{ r: true }, { r: false }, { r: true }, { r: false }];
    walkers.forEach((w, i) => {
      const per = 3.2, t0 = tSign + 0.8 + i * 0.8; if (t < t0) return;
      const ph = ((t - t0) % per) / per;
      const x = lerp(940, BX + 10, smooth(ph)), a = 1 - smooth((ph - 0.75) / 0.25);
      if (a <= 0.02) return;
      ctx.save(); ctx.globalAlpha = a;
      if (w.r) robot(x, 0.62 * (1 - 0.15 * ph), { seed: 12 + i, state: 'happy', flip: true });
      else K.drawPerson(ctx, x, FEET, 0.7 * (1 - 0.15 * ph), { t, walk: t, pose: 'stand', mood: 'happy', skin: i, hair: i + 1, hairStyle: 'long', shirt: '#a08be0', seed: 61 + i, flip: true });
      ctx.restore();
    });
    // moderator at the first door with a magnifier, a robot waiting
    const mk = smooth((t - tMod) / 0.6);
    if (mk > 0) {
      ctx.save(); ctx.globalAlpha = mk;
      mod(AX + 125, 0.82, { pose: t > tSel ? 'shrug' : 'point', flip: true, look: -0.8, label: false });
      robot(AX - 120, 0.66, { seed: 17, state: 'thinking' });
      // magnifier
      const mx = AX + 40 + Math.sin(t * 1.6) * 30, my = 830 + Math.cos(t * 1.3) * 12;
      ctx.lineWidth = 9; ctx.strokeStyle = '#d8dbe6'; ctx.beginPath(); ctx.arc(mx, my, 34, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = rgba('#bfe3ff', 0.25); ctx.fill();
      ctx.lineWidth = 12; ctx.strokeStyle = '#6b4a34'; ctx.beginPath(); ctx.moveTo(mx + 24, my + 24); ctx.lineTo(mx + 56, my + 58); ctx.stroke();
      ctx.restore();
    }
    // pills
    const rk = K.popIn(t, tSign, 0.45) * (1 - smooth((t - tMod) / 0.4));
    if (rk > 0.01) K.drawLabel(ctx, BX, 560, Math.min(1.05, rk), { text: P.rivalLabel || 'Rival forum', size: 36, dot: true, accent: true });
    const sk = K.popIn(t, tSel, 0.45);
    if (sk > 0) {
      K.drawLabel(ctx, 487, 500, Math.min(1.05, sk), { text: P.sel || 'Room for selective enforcement', size: 36, dot: true, accent: true });
    }
    // IN / OUT judgment sign over the first door, flipping while the mod decides
    const jk = K.popIn(t, tObj + 0.4, 0.4);
    if (jk > 0) {
      const flip = Math.cos((t - tObj) * 2.6), w = 120 * Math.abs(flip) * Math.min(1, jk);
      ctx.save(); ctx.translate(AX - 120, 845);
      roundRect(ctx, -w / 2, -30, w, 60, 10); ctx.fillStyle = flip > 0 ? ACC : DANGER; ctx.fill();
      if (w > 30) { ctx.font = H.font('display', 30); ctx.fillStyle = '#10121f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.save(); ctx.scale(Math.abs(flip), 1); ctx.fillText(flip > 0 ? (P.inText || 'IN?') : (P.outText || 'OUT?'), 0, 2); ctx.restore(); }
      ctx.restore();
    }
    return;
  }

  // =====================================================================================================
  // payoff
  const tA = at(P.aCue, D * 0.11, -0.2), tB = at(P.bCue, D * 0.37, -0.2), tQ = at(P.qCue, D * 0.65, -0.35);
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 487, y: 800 }, { t: D, zoom: 1.0 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: BASE });
  const AX = 290, BX = 735;
  club(AX, BASE, 0.82, { t, sign: SIGN, open: 0, doorSign: NOAI, glow: t > tA && t < tB + 0.3 ? 0.3 : 0.08 });
  club(BX, BASE, 0.82, { t, sign: RSIGN, wall: '#4f6f9a', roof: '#2c3e63', doorCol: '#7fa3d0', open: 1, glow: t > tB ? 0.3 + 0.06 * Math.sin(t * 3) : 0.1 });
  robot(AX - 150, 0.6, { seed: 23, state: 'thinking', flip: true });
  K.drawPerson(ctx, BX - 150, FEET, 0.72, { t, pose: 'stand', mood: 'happy', skin: 2, hair: 3, hairStyle: 'bun', shirt: '#4fb3a6', seed: 71 });
  robot(BX + 150, 0.6, { seed: 24, state: 'happy', flip: true });
  mod(AX + 140, 0.74, { pose: 'stand', flip: true, look: -0.4, label: false });
  ctx.restore();
  questionCard(tQ, P.question || 'Which clubhouse would you join?', P.a || 'No-AI club', P.b || 'Next door', 255, 720);
}
