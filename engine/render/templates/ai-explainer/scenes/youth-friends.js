// Scene "youth-friends" (full frame, dusk city plaza). Survey / friendship stories about young people, acted out by
// stylised cartoon teens (generic, no real people, no logos; organisations are text pills only).
// modes:
//  survey  (1 beat) a big clipboard ("Friendship survey") ticks its rows; text pills for who ran it (by + with) land on
//          cues; a counter counts up to `count` while a grid of mini heads fills; an ages pill; a mini globe whose
//          `regions` dots light with a "<n> countries" pill; on reportCue a report sheet slides over the clipboard
//          with a NEW stamp.
//  uses    (1 beat) a row of 6 teens with phones: on lookCue magnifier bubbles pop over 5 of them (+ lookLabel pill,
//          optional adviceLabel pill); on friendCue they fade and 2 of 6 get glowing AI-friend bubbles, big
//          `friendLabel` + friendSub; on dailyCue a "Daily AI users" ribbon relabels the row and a 3rd teen lights:
//          3 of 6, big `dailyLabel` + dailySub. Small `note` (e.g. "Median, 16 countries") under the number.
//  offline (1 beat) three friends hang out in person (laughing, waving); big `pct` + pctSub count up on pctCue; on
//          gaugeCue a "Life rating" gauge card rises (bar fills, up arrow); on onlineCue an "Online-only friend" phone
//          card slides in below with a flat bar and a dashed `onlineTag` ("No such link").
// params: mode; survey: by, with, count, countLabel, ages, regions, regionLabel, sheet, rows[3], report, byCue,
//   withCue, countCue, agesCue, regionCue, reportCue | uses: lookLabel, adviceLabel, friendLabel, friendSub,
//   dailyLabel, dailySub, dailyTag, note, lookCue, adviceCue, friendCue, dailyCue | offline: pct, pctSub, gauge,
//   online, onlineTag, pctCue, gaugeCue, onlineCue. Cue "word#n" = the (n+1)th time the word is spoken.
// Fits: youth / Gen Z surveys, friendship, loneliness, AI companions, screen-life reports.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const mode = P.mode || 'survey';
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const BOT = '#b79bff';
  const LOOKS = [
    { skin: 0, hair: 3, hairStyle: 'long', shirt: '#e88a3c' }, { skin: 2, hair: 1, hairStyle: 'curly', shirt: '#4f8cff' },
    { skin: 3, hair: 0, hairStyle: 'short', shirt: '#2fb39a' }, { skin: 1, hair: 2, hairStyle: 'bun', shirt: '#d65a8a' },
    { skin: 4, hair: 0, hairStyle: 'short', shirt: '#8a6fe0' }, { skin: 1, hair: 4, hairStyle: 'long', shirt: '#e0b23c' },
  ];

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.035, x: 490, y: 740 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 1010 });
  if (mode === 'survey') drawSurvey();
  else if (mode === 'uses') drawUses();
  else drawOffline();
  ctx.restore();

  // ======================================================================== survey
  function drawSurvey() {
    const tBy = at(P.byCue, 1.4) - 0.2, tWith = Math.max(tBy + 0.4, at(P.withCue, 1.8) - 0.2);
    const tCount = at(P.countCue, D * 0.3) - 0.3, tAges = at(P.agesCue, D * 0.55) - 0.3, tReg = at(P.regionCue, D * 0.7) - 0.5;
    const tRep = at(P.reportCue, D * 0.8) - 0.3;
    // who ran it
    const bp = K.popIn(t, tBy, 0.45), wp = K.popIn(t, tWith, 0.45);
    if (bp > 0) K.drawLabel(ctx, 487, 500, bp, { text: P.by || 'Survey firm', size: 32, accent: true });
    if (wp > 0) {
      const f = H.fitText(ctx, '+ ' + (P.with || 'Partner'), 'ui', 26, 18, 620);
      K.drawLabel(ctx, 487, 566, wp, { text: f.text, size: f.size });
    }
    // clipboard (left)
    const CX0 = 150, CX1 = 445, CY0 = 610, CY1 = 960, cw = CX1 - CX0;
    const cl = K.popIn(t, 0.0, 0.5);
    ctx.save(); ctx.globalAlpha = clamp(cl * 2);
    ctx.translate((CX0 + CX1) / 2, CY1); ctx.rotate(-0.03 + 0.01 * Math.sin(t * 1.3)); ctx.translate(-(CX0 + CX1) / 2, -CY1);
    roundRect(ctx, CX0, CY0, cw, CY1 - CY0, 20); ctx.fillStyle = '#8a5a3c'; ctx.fill();
    roundRect(ctx, CX0 + 14, CY0 + 30, cw - 28, CY1 - CY0 - 44, 10); ctx.fillStyle = '#f6f4ee'; ctx.fill();
    roundRect(ctx, CX0 + cw / 2 - 50, CY0 - 14, 100, 40, 10); ctx.fillStyle = '#c9ccd6'; ctx.fill();
    const sh = H.fitText(ctx, P.sheet || 'Friendship survey', 'bold', 28, 18, cw - 50);
    ctx.font = sh.font; ctx.fillStyle = '#1b2140'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(sh.text, CX0 + cw / 2, CY0 + 72);
    const rows = (P.rows || ['Close friends?', 'Use AI?', 'Feel lonely?']).slice(0, 3);
    rows.forEach((r, i) => {
      const y = CY0 + 130 + i * 72, tick = clamp((t - (0.6 + i * 0.9)) / 0.3);
      roundRect(ctx, CX0 + 34, y, 40, 40, 8); ctx.lineWidth = 3; ctx.strokeStyle = '#3b4672'; ctx.stroke();
      if (tick > 0) { ctx.strokeStyle = '#2f9e5b'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; K.pathDraw(ctx, [[CX0 + 42, y + 20], [CX0 + 52, y + 31], [CX0 + 70, y + 8]], tick); }
      const f = H.fitText(ctx, r, 'bold', 25, 16, cw - 120);
      ctx.font = f.font; ctx.fillStyle = '#2a3050'; ctx.textAlign = 'left'; ctx.fillText(f.text, CX0 + 88, y + 21);
    });
    ctx.restore();
    // report sheet slides over the clipboard
    const rp = clamp((t - tRep) / 0.5);
    if (rp > 0) {
      const e = H.easeOutBack(rp), x = lerp(-200, CX0 + 22, e);
      ctx.save(); ctx.translate(x + 130, 800); ctx.rotate(0.05 * (1 - e) + 0.03);
      K.drawDocument(ctx, 0, 150, 1.45, { lines: 5, title: 'REPORT', seal: true });
      ctx.restore();
      const sp = clamp((t - tRep - 0.45) / 0.45);
      if (sp > 0) K.drawStamp(ctx, CX0 + 230, 960, 0.6, { kind: 'check', text: 'NEW', land: sp });
    }
    // counter + head grid (right)
    const cp = clamp((t - tCount) / 2.0);
    if (t > tCount - 0.2) {
      const n = Math.round((P.count || 1000) * H.easeOutCubic(cp));
      const pop = K.popIn(t, tCount - 0.2, 0.4);
      ctx.save(); ctx.globalAlpha = clamp(pop * 2);
      ctx.font = H.font('display', 66); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(n.toLocaleString('en-US'), 680, 680);
      ctx.font = H.font('bold', 27); ctx.fillStyle = '#ffffff'; ctx.fillText(P.countLabel || 'respondents', 680, 716);
      ctx.restore();
      for (let r = 0; r < 2; r++) for (let c = 0; c < 8; c++) {
        const i = r * 8 + c, k = clamp(cp * 18 - i);
        if (k <= 0) continue;
        const x = 530 + c * 43, y = 755 + r * 48;
        ctx.save(); ctx.globalAlpha = k;
        const col = ['#f1c7a3', '#d9a27a', '#b5764f', '#8a5636', '#5e3a24'][(i * 7) % 5];
        ctx.beginPath(); ctx.arc(x, y, 14 * (0.6 + 0.4 * k), 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y + 30, 18 * (0.6 + 0.4 * k), Math.PI, 0); ctx.fillStyle = ['#4f8cff', '#e88a3c', '#2fb39a', '#d65a8a', '#8a6fe0'][(i * 3) % 5]; ctx.fill();
        ctx.restore();
      }
    }
    const ap = K.popIn(t, tAges, 0.45);
    if (ap > 0) K.drawLabel(ctx, 570, 945, ap, { text: P.ages || 'Ages 15-22', size: 28, accent: true });
    // globe with country dots
    const gp = K.popIn(t, tReg - 0.3, 0.5);
    if (gp > 0) {
      ctx.save(); ctx.globalAlpha = clamp(gp * 2);
      K.drawGlobe(ctx, 760, 990, 0.62 * (0.8 + 0.2 * gp), { t, arcs: 2, progress: clamp((t - tReg) / 1.2) });
      const n = clamp(P.regions || 16, 1, 24);
      for (let i = 0; i < n; i++) {
        const k = clamp((t - tReg - i * 0.06) / 0.25);
        if (k <= 0) continue;
        const a = i * 2.39996, rr = 40 * Math.sqrt((i + 0.5) / n), x = 760 + Math.cos(a) * rr, y = 937 + Math.sin(a) * rr * 0.85;
        K.glow(ctx, x, y, 14, ACC, 0.5 * k);
        ctx.beginPath(); ctx.arc(x, y, 5 * k, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
      }
      ctx.restore();
      const lp = K.popIn(t, tReg + 0.1, 0.45);
      if (lp > 0) K.drawLabel(ctx, 760, 878, lp, { text: P.regionLabel || `${P.regions || 16} countries`, size: 26 });
    }
  }

  // ======================================================================== uses
  function drawUses() {
    const tLook = at(P.lookCue, 0.8) - 0.3, tAdv = at(P.adviceCue, tLook + 1.6) - 0.3;
    const tFriend = at(P.friendCue, D * 0.4) - 0.3, tDaily = at(P.dailyCue, D * 0.72) - 0.3;
    const xs = [150, 290, 430, 570, 710, 845], FY = 1035;
    const friendSet = [1, 4], dailyExtra = 2;
    const fK = clamp((t - tFriend) / 0.5), dK = clamp((t - tDaily) / 0.5);
    xs.forEach((x, i) => {
      const isF = friendSet.includes(i) && fK > 0 || (i === dailyExtra && dK > 0.3);
      const dim = fK > 0 && !isF ? 0.5 * fK : 0;
      if (isF) K.glow(ctx, x, FY - 150, 120, BOT, 0.3);
      ctx.save(); ctx.globalAlpha = 1 - dim;
      K.drawPerson(ctx, x, FY, 1.02, Object.assign({ pose: 'phone', t, typing: isF ? 0.4 : 1, mood: isF ? 'happy' : 'neutral', seed: 11 + i, look: i < 3 ? 0.4 : -0.4, flip: i >= 3 }, LOOKS[i]));
      ctx.restore();
    });
    // bubbles over heads
    xs.forEach((x, i) => {
      const y = 705 + K.bob(t, 4, 1.3, i);
      const lookP = (i === 5 ? 0 : K.popIn(t, tLook + i * 0.12, 0.4)) * (1 - fK);
      if (lookP > 0) bubbleIcon(x, y, lookP, 'search');
      const isF = friendSet.includes(i);
      const fp = isF ? K.popIn(t, tFriend + 0.15 + friendSet.indexOf(i) * 0.15, 0.45) : (i === dailyExtra ? K.popIn(t, tDaily + 0.3, 0.5) : 0);
      if (fp > 0) bubbleIcon(x, y, fp, 'bot');
    });
    // top: pills (look / advice), then the big number
    const out = 1 - clamp((t - tFriend) / 0.35);
    if (out > 0) {
      const lp = K.popIn(t, tLook, 0.45), ap = K.popIn(t, tAdv, 0.45);
      ctx.save(); ctx.globalAlpha = out;
      if (lp > 0) K.drawLabel(ctx, 487, 500, lp, { text: P.lookLabel || '82% look things up', size: 30, accent: true });
      if (ap > 0 && P.adviceLabel) K.drawLabel(ctx, 487, 572, ap, { text: P.adviceLabel, size: 28 });
      ctx.restore();
    }
    if (fK > 0) {
      const swap = clamp((t - tDaily) / 0.4);
      const big = swap < 0.5 ? (P.friendLabel || '33%') : (P.dailyLabel || '50%');
      const sub = swap < 0.5 ? (P.friendSub || 'use AI as a friend') : (P.dailySub || 'of daily AI users');
      const k = swap < 0.5 ? K.popIn(t, tFriend, 0.5) * (1 - swap * 2) : (swap - 0.5) * 2;
      const s = 0.75 + 0.25 * H.easeOutBack(clamp(k));
      ctx.save(); ctx.globalAlpha = clamp(k * 1.5); ctx.translate(487, 520); ctx.scale(s, s);
      ctx.font = H.font('display', 120); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      K.glow(ctx, 0, -40, 180, ACC, 0.18);
      ctx.fillText(big, 0, 30);
      const f = H.fitText(ctx, sub, 'bold', 34, 22, 640);
      ctx.font = f.font; ctx.fillStyle = '#ffffff'; ctx.fillText(f.text, 0, 82);
      ctx.restore();
      if (P.note) {
        ctx.save(); ctx.globalAlpha = clamp(K.popIn(t, tFriend + 0.6, 0.4)) * 0.85 * (1 - dK);
        ctx.font = H.font('body', 24); ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.textAlign = 'center'; ctx.fillText(P.note, 487, 640);
        ctx.restore();
      }
    }
    // the "daily AI users" ribbon
    const rp = K.popIn(t, tDaily, 0.45);
    if (rp > 0) {
      ctx.save(); ctx.globalAlpha = clamp(rp * 2);
      const txt = (P.dailyTag || 'Daily AI users').toUpperCase(), y = 648;
      ctx.font = H.font('ui', 26); const w = ctx.measureText(txt).width + 70;
      ctx.translate(487, y); ctx.scale(0.8 + 0.2 * rp, 0.8 + 0.2 * rp);
      roundRect(ctx, -w / 2, -26, w, 52, 10); ctx.fillStyle = BOT; ctx.fill();
      ctx.fillStyle = '#231b46'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 2);
      ctx.restore();
    }
  }

  // ======================================================================== offline
  function drawOffline() {
    const tPct = at(P.pctCue, 2.0) - 0.3, tGauge = at(P.gaugeCue, D * 0.62) - 0.4, tOn = at(P.onlineCue, D * 0.78) - 0.3;
    // three friends hanging out in person: a joke lands, everyone laughs
    const FY = 1035, laugh = (i) => 0.5 + 0.5 * Math.sin(t * 2.4 + i * 1.7);
    const fr = [{ x: 175, i: 0 }, { x: 315, i: 2 }, { x: 455, i: 3 }];
    K.glow(ctx, 315, 850, 260, '#ffd98a', 0.12);
    fr.forEach(({ x, i }, k) => {
      const cheer = k === 1 && ((t % 4.5) > 2.6);
      K.drawPerson(ctx, x, FY, 1.22, Object.assign({ pose: cheer ? 'cheer' : (k === 0 ? 'point' : 'stand'), t, mood: 'happy', talk: laugh(k) * (k === 0 ? 0.5 : 0.35), look: k === 2 ? -0.7 : 0.6, flip: k === 2, seed: 30 + k }, LOOKS[i]));
    });
    // little laugh marks
    for (let k = 0; k < 3; k++) {
      const p = ((t * 0.7 + k * 0.33) % 1), x = 220 + k * 130, y = 700 - p * 60;
      ctx.save(); ctx.globalAlpha = Math.sin(p * Math.PI) * 0.8; ctx.font = H.font('display', 30); ctx.fillStyle = '#ffd98a'; ctx.textAlign = 'center'; ctx.fillText('ha', x, y); ctx.restore();
    }
    // the big number
    const pp = K.popIn(t, tPct, 0.5);
    if (pp > 0) {
      const v = parseFloat(P.pct || '93') || 93, n = Math.round(v * H.easeOutCubic(clamp((t - tPct) / 1.0)));
      ctx.save(); ctx.globalAlpha = clamp(pp * 2); ctx.translate(487, 530); ctx.scale(0.8 + 0.2 * pp, 0.8 + 0.2 * pp);
      ctx.font = H.font('display', 110); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(n + '%', 0, 20);
      const f = H.fitText(ctx, P.pctSub || 'have a close in-person friend', 'bold', 32, 22, 640);
      ctx.font = f.font; ctx.fillStyle = '#ffffff'; ctx.fillText(f.text, 0, 70);
      ctx.restore();
    }
    // gauge card: life rating goes up
    const gp = clamp((t - tGauge) / 0.5);
    if (gp > 0) {
      const e = H.easeOutBack(gp), x0 = 575, y0 = 640 + (1 - e) * 60, w = 275, h = 150;
      ctx.save(); ctx.globalAlpha = clamp(gp * 2);
      card(x0, y0, w, h);
      ctx.font = H.font('ui', 25); ctx.fillStyle = '#1b2140'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(P.gauge || 'Life rating', x0 + 22, y0 + 34);
      const fill = 0.35 + 0.45 * H.easeInOutCubic(clamp((t - tGauge - 0.3) / 1.0));
      bar(x0 + 22, y0 + 62, w - 100, 34, fill, ACC);
      upArrow(x0 + w - 42, y0 + 79, clamp((t - tGauge - 0.9) / 0.4));
      ctx.font = H.font('bold', 22); ctx.fillStyle = '#2f9e5b'; ctx.fillText(P.gaugeSub || 'In-person friend', x0 + 22, y0 + 126);
      ctx.restore();
    }
    // online-only friend: phone card with a flat bar and a dashed "no such link"
    const op = clamp((t - tOn) / 0.5);
    if (op > 0) {
      const e = H.easeOutBack(op), x0 = 575 + (1 - e) * 200, y0 = 805, w = 275, h = 140;
      ctx.save(); ctx.globalAlpha = clamp(op * 2);
      card(x0, y0, w, h);
      roundRect(ctx, x0 + 20, y0 + 18, 34, 56, 7); ctx.fillStyle = '#0e1122'; ctx.fill();
      roundRect(ctx, x0 + 24, y0 + 24, 26, 44, 4); ctx.fillStyle = '#4f8cff'; ctx.fill();
      ctx.beginPath(); ctx.arc(x0 + 37, y0 + 40, 7, 0, Math.PI * 2); ctx.fillStyle = '#f1c7a3'; ctx.fill();
      const f = H.fitText(ctx, P.online || 'Online-only friend', 'ui', 24, 16, w - 90);
      ctx.font = f.font; ctx.fillStyle = '#1b2140'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(f.text, x0 + 66, y0 + 46);
      bar(x0 + 22, y0 + 90, w - 100, 30, 0.35, '#9aa3bf');
      ctx.font = H.font('display', 34); ctx.fillStyle = '#9aa3bf'; ctx.textAlign = 'center'; ctx.fillText('=', x0 + w - 42, y0 + 106);
      ctx.restore();
      const tp = K.popIn(t, tOn + 0.9, 0.45);
      if (tp > 0) {
        ctx.save(); ctx.globalAlpha = clamp(tp * 2);
        const txt = P.onlineTag || 'No such link';
        ctx.font = H.font('ui', 26); const tw = ctx.measureText(txt).width + 44, cx = 712, cy = y0 + h + 2;
        ctx.translate(cx, cy); ctx.rotate(-0.04); ctx.scale(0.8 + 0.2 * tp, 0.8 + 0.2 * tp);
        roundRect(ctx, -tw / 2, -24, tw, 48, 24); ctx.fillStyle = 'rgba(10,12,22,0.92)'; ctx.fill();
        ctx.setLineDash([10, 8]); ctx.lineWidth = 3; ctx.strokeStyle = '#ffffff'; ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 2);
        ctx.restore();
      }
    }
  }

  // ======================================================================== helpers
  function card(x, y, w, h) {
    roundRect(ctx, x + 4, y + 8, w, h, 22); ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.fill();
    roundRect(ctx, x, y, w, h, 22); ctx.fillStyle = '#f2f4fa'; ctx.fill();
  }
  function bar(x, y, w, h, p, col) {
    roundRect(ctx, x, y, w, h, h / 2); ctx.fillStyle = '#d5dae8'; ctx.fill();
    roundRect(ctx, x, y, Math.max(h, w * p), h, h / 2); ctx.fillStyle = col; ctx.fill();
  }
  function upArrow(x, y, p) {
    if (p <= 0) return;
    const e = H.easeOutBack(p);
    ctx.save(); ctx.translate(x, y + (1 - e) * 20); ctx.scale(e, e);
    ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fillStyle = '#2f9e5b'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(0, -16); ctx.lineTo(13, 0); ctx.lineTo(5, 0); ctx.lineTo(5, 14); ctx.lineTo(-5, 14); ctx.lineTo(-5, 0); ctx.lineTo(-13, 0); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function bubbleIcon(x, y, p, kind) {
    const e = H.easeOutBack(clamp(p));
    ctx.save(); ctx.translate(x, y); ctx.scale(e, e); ctx.globalAlpha = clamp(p * 2);
    const bot = kind === 'bot';
    if (bot) K.glow(ctx, 0, 0, 70, BOT, 0.4);
    ctx.beginPath(); ctx.arc(0, 0, 40, 0, Math.PI * 2); ctx.fillStyle = bot ? BOT : '#ffffff'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-10, 34); ctx.lineTo(0, 54); ctx.lineTo(10, 34); ctx.closePath(); ctx.fill();
    if (bot) {
      ctx.fillStyle = '#231b46';
      ctx.beginPath(); ctx.ellipse(-12, -4, 5, 7, 0, 0, Math.PI * 2); ctx.ellipse(12, -4, 5, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#231b46'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 6, 10, 0.2 * Math.PI, 0.8 * Math.PI); ctx.stroke();
      // tiny heart
      ctx.fillStyle = '#ff7eb6'; ctx.save(); ctx.translate(28, -28); const r = 9;
      ctx.beginPath(); ctx.moveTo(0, r * 0.9); ctx.bezierCurveTo(-r * 1.4, -r * 0.1, -r * 0.7, -r * 1.2, 0, -r * 0.45); ctx.bezierCurveTo(r * 0.7, -r * 1.2, r * 1.4, -r * 0.1, 0, r * 0.9); ctx.fill(); ctx.restore();
    } else {
      ctx.strokeStyle = '#3b4672'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(-5, -5, 14, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(5, 5); ctx.lineTo(17, 17); ctx.stroke();
    }
    ctx.restore();
  }
}
