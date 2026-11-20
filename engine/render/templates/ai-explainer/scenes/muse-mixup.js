// Scene "muse-mixup" (full frame). An AI agent's chat surfaces things that aren't the user's: bank balances, requests
// they never made; reported mix-ups between accounts. Generic cartoon phone UI, no logos, no real people.
// modes:
//  hook   : dusk pier, a person checks the tides on a phone; the agent's reply drops in two bank balances and a
//           NOT MINE stamp slams (peaks inside ~2.5 s; also the loop target)
//  posts  : night office; testers at laptops fling feedback cards onto a wall, counter "more than 2 dozen";
//           "employees testing" pill; on mixCue the wall gives way to two account phones whose bubbles cross
//  pile   : the pier again; tides chat -> balances (balCue) -> verbatim "never shared" note (neverCue); then the chat
//           fills with three wrong cards (a1/a2/a3 cues), each stamped
//  huge   : night city; a grid of phones lights up, launch pill (septCue), counter 10M+ (countCue), record ribbon
//  swap   : two flats split by a wall (YOU / A STRANGER); an agent robot with app tiles in the middle; a private bubble
//           arcs to the stranger's phone (landCue) and theirs back (backCue); "could" pill
//  caveat : the agent robot beside a wobbling scale REAL? / MADE UP?; "couldn't establish" pill; hallucination swirl
//           (hallCue); quote card "isolated incidents" (metaCue)
// params: mode, app ('AI app'), cues per mode (see the code), texts overridable (see defaults below)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic, roundRect, mixHex, rgba } = H;
  const D = info.duration, ACC = info.accent, mode = P.mode || 'hook', N = K.NEUTRAL;
  const at = (w, f) => { const v = w ? info.timeOf(w) : null; return v != null ? v : D * f; };
  const app = P.app || 'AI app';

  // ------------------------------------------------------------------ helpers
  function scaleAt(x, y, s, fn) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y); fn(); ctx.restore(); }
  function text(str, x, y, kind, size, col, align) {
    ctx.font = H.font(kind, size); ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(str, x, y);
  }
  // phone frame with an app header; o.draw(cx, top, w, h) paints the inside (clipped)
  function phone(cx, top, w, h, o = {}) {
    const r = 38;
    K.shadow(ctx, cx, top + h + 8, w * 1.05);
    roundRect(ctx, cx - w / 2 - 12, top - 12, w + 24, h + 24, r + 10); ctx.fillStyle = '#1c2033'; ctx.fill();
    roundRect(ctx, cx - w / 2 - 12, top - 12, w + 24, h + 24, r + 10); ctx.lineWidth = 3; ctx.strokeStyle = o.alert ? mixHex('#3b4260', N.danger, o.alert) : '#3b4260'; ctx.stroke();
    roundRect(ctx, cx - w / 2, top, w, h, r); ctx.fillStyle = '#121527'; ctx.fill();
    ctx.save(); roundRect(ctx, cx - w / 2, top, w, h, r); ctx.clip();
    ctx.fillStyle = '#1d2240'; ctx.fillRect(cx - w / 2, top, w, 76);
    // generic agent avatar: a small robot face circle (no logo)
    ctx.beginPath(); ctx.arc(cx - w / 2 + 50, top + 42, 20, 0, Math.PI * 2); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    roundRect(ctx, cx - w / 2 + 36, top + 34, 28, 14, 7); ctx.fillStyle = '#161927'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx - w / 2 + 44, top + 41, 3.5, 0, Math.PI * 2); ctx.arc(cx - w / 2 + 56, top + 41, 3.5, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    text(o.title || app, cx - w / 2 + 84, top + 42, 'display', 30, '#ffffff', 'left');
    if (o.draw) o.draw(cx, top, w, h);
    ctx.restore();
    roundRect(ctx, cx - 36, top + 8, 72, 12, 6); ctx.fillStyle = '#0b0d18'; ctx.fill();
  }
  // chat bubble with real text; side 'me' (right, accent) or 'ai' (left, dark); returns its height
  function bubble(px, y, maxW, str, side, pop, o = {}) {
    const size = o.size || 28;
    const lines = H.wrap(ctx, str, o.kind || 'ui', size, maxW - 44);
    ctx.font = H.font(o.kind || 'ui', size);
    const tw = Math.max(...lines.map((l) => ctx.measureText(l).width));
    const bw = tw + 44, bh = lines.length * size * 1.25 + 30;
    if (pop <= 0) return bh;
    const me = side === 'me';
    const bx = me ? px - bw : px;
    scaleAt(me ? bx + bw : bx, y + bh, pop, () => {
      roundRect(ctx, bx, y, bw, bh, 22); ctx.fillStyle = o.fill || (me ? ACC : '#2e3557'); ctx.fill();
      if (o.stroke) { ctx.lineWidth = 4; ctx.strokeStyle = o.stroke; roundRect(ctx, bx, y, bw, bh, 22); ctx.stroke(); }
      lines.forEach((l, i) => text(l, bx + 22, y + 15 + size * 0.62 + i * size * 1.25, o.kind || 'ui', size, o.ink || (me ? K.ACCENT.deep : '#ffffff'), 'left'));
    });
    return bh;
  }
  function balanceRow(x, y, w, amount, pop, hi) {
    if (pop <= 0) return;
    scaleAt(x + w / 2, y + 34, pop, () => {
      roundRect(ctx, x, y, w, 68, 16); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      roundRect(ctx, x + 14, y + 16, 48, 36, 8); ctx.fillStyle = '#5b6aa8'; ctx.fill(); // generic bank-card icon
      ctx.fillStyle = '#ffd98a'; ctx.fillRect(x + 22, y + 26, 14, 10);
      text('Balance', x + 76, y + 35, 'ui', 26, '#5a6280', 'left');
      text(amount, x + w - 16, y + 35, 'display', 34, hi ? '#c0392b' : '#161927', 'right');
    });
  }
  // dusk seaside with a wooden pier
  function seaside() {
    const g = ctx.createLinearGradient(0, 0, 0, 900);
    g.addColorStop(0, '#1b1f45'); g.addColorStop(0.55, '#5a3f78'); g.addColorStop(1, '#e0806a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 900);
    K.glow(ctx, 760, 860, 260, '#ffb070', 0.5);
    ctx.beginPath(); ctx.arc(760, 880, 90, Math.PI, 0); ctx.fillStyle = '#ffc48a'; ctx.fill();
    for (let i = 0; i < 18; i++) { const sx = (H.hash(i, 1) * 1080), sy = 60 + H.hash(i, 2) * 380; ctx.globalAlpha = 0.3 + 0.5 * (0.5 + 0.5 * Math.sin(t * 2 + i)); ctx.fillStyle = '#fff'; ctx.fillRect(sx, sy, 3, 3); }
    ctx.globalAlpha = 1;
    const s = ctx.createLinearGradient(0, 880, 0, 1920); s.addColorStop(0, '#3a4f8a'); s.addColorStop(1, '#0c1430');
    ctx.fillStyle = s; ctx.fillRect(0, 880, 1080, 1040);
    ctx.strokeStyle = 'rgba(255,210,170,0.35)'; ctx.lineWidth = 4;
    for (let r = 0; r < 7; r++) {
      const y = 905 + r * 26 + r * r * 4, off = (t * (30 + r * 6)) % 140;
      for (let x = -140 + off; x < 1080; x += 140) { ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 25, y - 8, x + 50, y); ctx.stroke(); }
    }
    // pier deck + posts
    ctx.fillStyle = '#6b4a33'; ctx.fillRect(0, 1030, 1080, 26);
    ctx.fillStyle = '#8a6243'; for (let x = 0; x < 1080; x += 60) ctx.fillRect(x + 2, 1030, 54, 12);
    ctx.fillStyle = '#4a3324'; for (let x = 40; x < 1080; x += 240) ctx.fillRect(x, 1056, 26, 300);
    ctx.fillStyle = '#4a3324'; ctx.fillRect(0, 960, 1080, 10); for (let x = 20; x < 1080; x += 150) ctx.fillRect(x, 960, 10, 72);
  }
  function stroller(x, y, s) { // childcare icon
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-30, -6); ctx.arc(-6, -6, 26, Math.PI, Math.PI * 1.5); ctx.lineTo(-6, -6); ctx.closePath(); ctx.fillStyle = ACC; ctx.fill();
    roundRect(ctx, -34, -6, 56, 20, 8); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.strokeStyle = '#f2f4fa'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(20, -4); ctx.lineTo(32, -26); ctx.stroke();
    for (const wx of [-24, 12]) { ctx.beginPath(); ctx.arc(wx, 22, 8, 0, Math.PI * 2); ctx.fillStyle = '#9aa3c4'; ctx.fill(); }
    ctx.restore();
  }
  function box(x, y, s) { // order icon
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    roundRect(ctx, -30, -24, 60, 48, 6); ctx.fillStyle = '#c9925e'; ctx.fill();
    ctx.fillStyle = '#a5713f'; ctx.fillRect(-30, -24, 60, 12); ctx.fillStyle = '#f2f4fa'; ctx.fillRect(-6, -24, 12, 48);
    ctx.restore();
  }
  function crossMark(x, y, s, land) { // small red "not me" X
    if (land <= 0) return;
    const sc = 1 + 1.2 * Math.pow(1 - easeOutCubic(clamp(land / 0.6)), 2);
    ctx.save(); ctx.translate(x, y); ctx.scale(s * sc, s * sc); ctx.rotate(-0.12); ctx.globalAlpha = clamp(land * 3);
    ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fillStyle = N.danger; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-9, -9); ctx.lineTo(9, 9); ctx.moveTo(9, -9); ctx.lineTo(-9, 9); ctx.stroke();
    ctx.restore();
  }
  function questionPill(x, y, str, pop, accent) { if (pop > 0) K.drawLabel(ctx, x, y, pop, { text: str, size: 30, accent }); }

  // ------------------------------------------------------------------ hook / pile: the pier and the tides chat
  if (mode === 'hook' || mode === 'pile') {
    const hook = mode === 'hook';
    const tTide = hook ? -1 : Math.max(0.2, at(P.tidesCue, 0.07) - 0.4);
    const tBal = hook ? -1.0 : at(P.balCue, 0.2) - 0.5;
    const tNever = hook ? 1e9 : at(P.neverCue, 0.35) - 0.2;
    const tA = hook ? [1e9, 1e9, 1e9] : [at(P.a1Cue, 0.52) - 0.25, at(P.a2Cue, 0.66) - 0.25, at(P.a3Cue, 0.8) - 0.25];
    const tStamp = hook ? 1.3 : tBal + 1.0;
    const tClear = tA[0] - 0.55;            // the chat scrolls away for the wrong-cards list
    ctx.save();
    K.camera(ctx, t, hook ? [{ t: 0, zoom: 1.04, x: 520, y: 740 }, { t: D, zoom: 1.08, x: 540, y: 740 }]
      : [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 520, y: 740 }]);
    seaside();
    const shocked = t > tStamp - 0.1;
    const lastA = tA[2];
    K.drawPerson(ctx, 215, 1036, 1.75, { t, pose: t > lastA + 0.6 ? 'shrug' : 'phone', mood: shocked ? (t > tA[0] ? 'worried' : 'shocked') : 'neutral', skin: 2, hair: 1, shirt: 2, hairStyle: 'short', seed: 4, look: 0.5 });
    // dim so the UI reads
    ctx.fillStyle = 'rgba(8,10,24,0.28)'; ctx.fillRect(0, 0, 1080, 1920);
    const cx = 640, top = 450, w = 440, h = 590;
    const pop = hook ? 1 : K.popIn(t, 0.05, 0.5);
    const shake = K.shake(t, tStamp, 0.45, 8);
    scaleAt(cx, top + h, pop, () => {
      ctx.translate(shake, K.bob(t, 4, 0.4));
      phone(cx, top, w, h, { alert: clamp((t - tStamp) / 0.3) * (t < tClear ? 1 : 0.4), draw: (x, y0, ww) => {
        const L = x - ww / 2 + 22, R = x + ww / 2 - 22;
        const scroll = hook ? 0 : smooth(clamp((t - tClear) / 0.6)) * 640;
        ctx.save(); ctx.translate(0, -scroll);
        // user asks about the tides
        const askPop = hook ? 1 : K.popIn(t, tTide, 0.35);
        bubble(R, y0 + 100, ww - 90, 'Tides tomorrow?', 'me', askPop);
        // AI reply drops in bank balances (the reported message: "BTW, two bank updates")
        const rp = K.popIn(t, tBal, 0.4);
        bubble(L, y0 + 200, ww - 60, 'BTW, two bank updates:', 'ai', rp);
        balanceRow(L, y0 + 290, ww - 44, '$2722.58', K.popIn(t, tBal + 0.35, 0.4), shocked);
        balanceRow(L, y0 + 375, ww - 44, '$5899.57', K.popIn(t, tBal + 0.6, 0.4), shocked);
        ctx.restore();
        // wrong cards list (pile mode)
        if (!hook && t > tClear) {
          const items = [
            { txt: P.a1 || 'Childcare request', icon: 'stroller' },
            { txt: P.a2 || 'Career advice', icon: 'case' },
            { txt: P.a3 || 'Your order', icon: 'box' },
          ];
          items.forEach((it, i) => {
            const p = K.popIn(t, tA[i], 0.45);
            if (p <= 0) return;
            const yy = y0 + 110 + i * 150, bx = L, bw = ww - 44;
            scaleAt(bx, yy + 60, p, () => {
              roundRect(ctx, bx, yy, bw, 120, 22); ctx.fillStyle = '#2e3557'; ctx.fill();
              if (it.icon === 'stroller') stroller(bx + 48, yy + 60, 0.9);
              else if (it.icon === 'box') box(bx + 48, yy + 62, 0.95);
              else K.drawBriefcase(ctx, bx + 48, yy + 88, 0.32);
              const fs = H.fitText(ctx, it.txt, 'ui', 30, 20, bw - 156).size;
              text(it.txt, bx + 92, yy + 60, 'ui', fs, '#ffffff', 'left');
            });
            crossMark(bx + bw - 32, yy + 60, 0.9, (t - tA[i] - 0.45) / 0.5);
          });
        }
      } });
    });
    // big NOT MINE stamp across the balances
    if (t < tClear) {
      const land = (t - tStamp) / 0.5;
      if (land > 0) K.drawStamp(ctx, cx + 70, top + 625, 1.15, { kind: 'cross', text: P.stamp || 'NOT MINE', land });
    }
    // "never shared" note (verbatim from an employee's internal post, per Reuters)
    if (!hook) {
      const np = K.popIn(t, tNever, 0.45) * (1 - clamp((t - tClear) / 0.4));
      if (np > 0) {
        scaleAt(260, 600, np, () => {
          const str = P.never || '\u201CQuote goes here\u201D';
          const lines = H.wrap(ctx, str, 'bold', 32, 310);
          const X = 125, Y = 485, W = 360, Hh = lines.length * 40 + 74;
          roundRect(ctx, X, Y, W, Hh, 20); ctx.fillStyle = '#f2f4fa'; ctx.fill();
          roundRect(ctx, X, Y, 12, Hh, 6); ctx.fillStyle = ACC; ctx.fill();
          lines.forEach((l, i) => text(l, X + 32, Y + 34 + i * 40, 'bold', 32, '#161927', 'left'));
          text(P.neverBy || 'Source', X + 32, Y + Hh - 26, 'ui', 24, '#5a6280', 'left');
        });
      }
      const lp = K.popIn(t, tA[0] + 0.1, 0.45);
      if (lp > 0) K.drawLabel(ctx, 487, 1040, lp, { text: P.never2 || 'Never asked for any of it', size: 30, accent: true });
    }
    ctx.restore();
    return;
  }

  // ------------------------------------------------------------------ posts: feedback wall in a night office
  if (mode === 'posts') {
    const tPosts = Math.max(0.3, at(P.postsCue, 0.13) - 0.3), tCount = at(P.countCue, 0.22) - 0.2;
    const tTest = at(P.testCue, 0.4) - 0.2, tMix = at(P.mixCue, 0.78) - 0.6;
    const sw = smooth(clamp((t - tMix) / 0.6));
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 487, y: 720 }]);
    K.world.office(ctx, { t, time: 'night' });
    ctx.fillStyle = 'rgba(8,10,24,0.25)'; ctx.fillRect(0, 0, 1080, 1920);
    // testers at desks along the bottom
    const desks = [180, 487, 790];
    desks.forEach((x, i) => {
      K.drawDesk(ctx, x, 1040, 0.85);
      K.drawPerson(ctx, x - 20, 1040, 1.05, { t: t + i, pose: 'sit-laptop', typing: 1 + (i % 2), mood: t > tMix ? 'worried' : 'neutral', skin: [0, 3, 1][i], hair: [2, 0, 3][i], shirt: [1, 4, 0][i], hairStyle: ['long', 'short', 'curly'][i], seed: 10 + i, look: 0.2 });
    });
    // feedback wall
    const WX = 487, WY = 460, WW = 760, WH = 330;
    ctx.globalAlpha = 1 - sw;
    roundRect(ctx, WX - WW / 2, WY, WW, WH, 18); ctx.fillStyle = '#e9e1cf'; ctx.fill();
    roundRect(ctx, WX - WW / 2, WY, WW, WH, 18); ctx.lineWidth = 10; ctx.strokeStyle = '#8a6243'; ctx.stroke();
    text(P.wall || 'INTERNAL FEEDBACK', WX, WY + 34, 'display', 30, '#3b2a1d');
    const NCARDS = 24;
    for (let i = 0; i < NCARDS; i++) {
      const tt = t - (tPosts + i * 0.16);
      if (tt <= 0) continue;
      const col = i % 8, row = Math.floor(i / 8);
      const ex = WX - WW / 2 + 60 + col * 92, ey = WY + 90 + row * 84;
      const sx = desks[i % 3], sy = 900;
      const u = easeOutCubic(clamp(tt / 0.5));
      const x = lerp(sx, ex, u), y = lerp(sy, ey, u) - Math.sin(u * Math.PI) * 120;
      ctx.save(); ctx.translate(x, y); ctx.rotate((H.hash(i, 5) - 0.5) * 0.25 * u);
      roundRect(ctx, -36, -32, 72, 70, 6); ctx.fillStyle = ['#fff3a8', '#ffd1dc', '#c9f0ff'][i % 3]; ctx.fill();
      ctx.fillStyle = 'rgba(40,40,60,0.45)'; ctx.fillRect(-24, -10, 48, 6); ctx.fillRect(-24, 4, 34, 6); ctx.fillRect(-24, 18, 42, 6);
      ctx.beginPath(); ctx.arc(0, -32, 6, 0, Math.PI * 2); ctx.fillStyle = N.danger; ctx.fill();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    // counter pill
    const cp = K.popIn(t, tCount, 0.45) * (1 - sw);
    if (cp > 0) {
      scaleAt(487, 790, cp, () => {
        roundRect(ctx, 487 - 330, 752, 660, 84, 42); ctx.fillStyle = ACC; ctx.fill();
        text(P.count || 'Many posts', 487, 796, 'display', 38, K.ACCENT.deep);
      });
    }
    const tp = K.popIn(t, tTest, 0.45) * (1 - sw);
    if (tp > 0) K.drawLabel(ctx, 487, 1010, tp, { text: P.testLabel || `Employees testing ${app}`, size: 30, dot: true });
    // phase 2: two accounts, bubbles cross
    if (sw > 0) {
      ctx.globalAlpha = sw;
      const A = { x: 250, top: 470, w: 290, h: 400 }, B = { x: 725, top: 470, w: 290, h: 400 };
      [A, B].forEach((p, k) => phone(p.x, p.top, p.w, p.h, { title: k ? 'Account B' : 'Account A', draw: (x, y0, ww) => {
        bubble(x + ww / 2 - 18, y0 + 100, ww - 60, k ? 'My order?' : 'Tides?', 'me', 1, { size: 26 });
      } }));
      // crossing bubbles
      const u = clamp((t - tMix - 0.5) / 1.4);
      if (u > 0) {
        const e = easeOutCubic(u);
        const pa = K.motion.bezier(A.x + 60, A.top + 300, A.x + 200, A.top + 120, B.x - 200, A.top + 120, B.x - 60, B.top + 300, 30);
        const pb = K.motion.bezier(B.x - 60, B.top + 230, B.x - 200, B.top + 420, A.x + 200, B.top + 420, A.x + 60, A.top + 230, 30);
        ctx.save(); ctx.setLineDash([16, 12]); ctx.lineDashOffset = -t * 40; ctx.lineWidth = 6; ctx.strokeStyle = ACC; ctx.lineCap = 'round';
        K.motion.pathDraw(ctx, pa, e); K.motion.pathDraw(ctx, pb, e); ctx.restore();
        const [ax, ay] = K.motion.pathPoint(pa, e), [bx, by] = K.motion.pathPoint(pb, e);
        for (const [qx, qy, c] of [[ax, ay, ACC], [bx, by, '#ffffff']]) { roundRect(ctx, qx - 40, qy - 24, 80, 48, 18); ctx.fillStyle = c; ctx.fill(); ctx.fillStyle = 'rgba(30,30,50,0.5)'; ctx.fillRect(qx - 26, qy - 6, 52, 6); ctx.fillRect(qx - 26, qy + 6, 34, 6); }
      }
      questionPill(487, 1000, P.mixLabel || 'Mixing up accounts?', K.popIn(t, tMix + 0.6, 0.45), true);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    return;
  }

  // ------------------------------------------------------------------ huge: 10M+ downloads
  if (mode === 'huge') {
    const tSept = at(P.septCue, 0.3) - 0.25, tCount = at(P.countCue, 0.45) - 0.3, tRec = at(P.recordCue, 0.72) - 0.3;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.06, x: 487, y: 740 }]);
    K.world.city(ctx, { t, time: 'night' });
    ctx.fillStyle = 'rgba(8,10,24,0.3)'; ctx.fillRect(0, 0, 1080, 1920);
    // grid of phones lighting up
    const cols = 7, rows = 3;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const i = r * cols + c, x = 120 + c * 123, y = 700 + r * 100;
      const tt = t - (0.1 + (tCount - 0.2) * H.hash(i, 9));
      roundRect(ctx, x - 34, y - 52, 68, 104, 14); ctx.fillStyle = '#1c2033'; ctx.fill();
      const on = clamp(tt / 0.3);
      roundRect(ctx, x - 28, y - 46, 56, 92, 10); ctx.fillStyle = mixHex('#121527', '#2e3a7a', on); ctx.fill();
      if (on > 0) {
        ctx.globalAlpha = on;
        ctx.beginPath(); ctx.arc(x, y - 4, 16, 0, Math.PI * 2); ctx.fillStyle = '#f2f4fa'; ctx.fill();
        ctx.beginPath(); ctx.arc(x - 6, y - 6, 3, 0, Math.PI * 2); ctx.arc(x + 6, y - 6, 3, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
        if (tt < 0.8) K.glow(ctx, x, y, 70, ACC, 0.4 * (1 - tt / 0.8));
        ctx.globalAlpha = 1;
      }
    }
    // launch pill
    const sp = K.popIn(t, tSept, 0.45);
    const rpre = clamp((t - tRec) / 0.3);
    if (sp > 0 && rpre < 1) { ctx.globalAlpha = 1 - rpre; K.drawLabel(ctx, 487, 1030, sp, { text: P.launch || 'Launched: date', size: 32, dot: true }); ctx.globalAlpha = 1; }
    // big counter
    const cp = K.popIn(t, tCount, 0.5);
    if (cp > 0) {
      const v = K.motion.countUp(10, t, tCount, 1.2, 0);
      scaleAt(487, 520, cp, () => {
        K.glow(ctx, 487, 520, 240, ACC, 0.35);
        text(`${v}M+`, 487, 525, 'display', 104, ACC);
      });
      text(P.unit || 'downloads', 487, 618, 'display', 40, '#ffffff');
    }
    const rp = K.popIn(t, tRec, 0.5);
    if (rp > 0) {
      scaleAt(487, 995, rp, () => {
        const str = P.record || 'Record growth';
        const fs = H.fitText(ctx, str, 'bold', 32, 22, 640).size;
        roundRect(ctx, 487 - 350, 960, 700, 70, 35); ctx.fillStyle = ACC; ctx.fill();
        text(str, 487, 996, 'bold', fs, K.ACCENT.deep);
      });
    }
    ctx.restore();
    return;
  }

  // ------------------------------------------------------------------ swap: you and a stranger
  if (mode === 'swap') {
    const tApps = at(P.appsCue, 0.25) - 0.3, tMsg = at(P.msgCue, 0.38) - 0.3, tLand = at(P.landCue, 0.65) - 1.0, tBack = at(P.backCue, 0.85) - 0.5;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 740 }]);
    K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 900 });
    // dividing wall
    ctx.fillStyle = '#1a1e3a'; ctx.fillRect(470, 380, 34, 700);
    K.props.window(ctx, 120, 470, 200, 170, 'night', t); K.props.window(ctx, 660, 470, 200, 170, 'night', t + 2);
    K.drawPerson(ctx, 265, 1040, 1.55, { t, pose: 'phone', mood: t > tBack + 0.6 ? 'shocked' : 'neutral', skin: 1, hair: 0, shirt: 3, hairStyle: 'bun', seed: 21, look: 0.4 });
    K.drawPerson(ctx, 715, 1040, 1.55, { t: t + 1, pose: 'phone', mood: t > tLand + 1.2 ? 'shocked' : 'neutral', skin: 3, hair: 2, shirt: 0, hairStyle: 'short', seed: 22, look: -0.4, flip: true });
    K.drawLabel(ctx, 265, 1090, 1, { text: P.you || 'YOU', size: 30, accent: true });
    K.drawLabel(ctx, 715, 1090, 1, { text: P.other || 'A STRANGER', size: 30 });
    // agent robot up top with app tiles
    const rp = K.popIn(t, 0.1, 0.5);
    scaleAt(487, 760, rp, () => {
      K.glow(ctx, 487, 680, 150, ACC, 0.3);
      K.drawRobot(ctx, 487, 770, 0.85, { t, state: t > tMsg ? 'working' : 'idle', seed: 5 });
    });
    const tiles = ['Chats', 'Orders', 'Calendar'];
    tiles.forEach((s, i) => {
      const p = K.popIn(t, tApps + i * 0.18, 0.4);
      if (p <= 0) return;
      const x = 487 + (i - 1) * 165, y = 500;
      scaleAt(x, y + 30, p, () => {
        roundRect(ctx, x - 76, y, 152, 60, 16); ctx.fillStyle = i === 0 && t > tMsg ? ACC : '#2e3557'; ctx.fill();
        text(s, x, y + 31, 'ui', 26, i === 0 && t > tMsg ? K.ACCENT.deep : '#ffffff');
      });
    });
    // private bubble from you -> robot -> stranger
    const flyer = (from, to, t0, label, col) => {
      const u = clamp((t - t0) / 1.3);
      if (u <= 0) return;
      const e = H.easeInOutCubic(u);
      const pts = K.motion.bezier(from[0], from[1], from[0] + (to[0] - from[0]) * 0.2, 620, from[0] + (to[0] - from[0]) * 0.8, 620, to[0], to[1], 30);
      const [x, y] = K.motion.pathPoint(pts, e);
      ctx.save(); ctx.setLineDash([12, 12]); ctx.lineWidth = 4; ctx.strokeStyle = rgba(col, 0.6); K.motion.pathDraw(ctx, pts, e); ctx.restore();
      ctx.font = H.font('ui', 26); const bw = ctx.measureText(label).width + 80;
      roundRect(ctx, x - bw / 2, y - 30, bw, 60, 22); ctx.fillStyle = col; ctx.fill();
      K.drawLock(ctx, x - bw / 2 + 28, y + 17, 0.28, { open: u > 0.95 ? 1 : 0 });
      text(label, x + 16, y + 1, 'ui', 26, '#161927');
    };
    // your message goes into the agent
    const ip = clamp((t - tMsg) / 0.8);
    if (ip > 0 && t < tLand) {
      const e = easeOutCubic(ip), x = lerp(290, 487, e), y = lerp(820, 690, e);
      ctx.font = H.font('ui', 26); const lab = P.mine || 'Your private chat', bw = ctx.measureText(lab).width + 80;
      roundRect(ctx, x - bw / 2, y - 30, bw, 60, 22); ctx.fillStyle = ACC; ctx.fill();
      K.drawLock(ctx, x - bw / 2 + 28, y + 17, 0.28, { open: 0 });
      text(lab, x + 16, y + 1, 'ui', 26, K.ACCENT.deep);
    }
    flyer([487, 690], [700, 820], tLand, P.mine || 'Your private chat', ACC);
    flyer([487, 690], [280, 820], tBack, P.theirs || 'Their private chat', '#f2f4fa');
    const cpill = K.popIn(t, tLand + 0.2, 0.45);
    if (cpill > 0) K.drawLabel(ctx, 487, 960, cpill, { text: P.could || 'If accounts mix up...', size: 30 });
    ctx.restore();
    return;
  }

  // ------------------------------------------------------------------ caveat: real or made up?
  const tReal = at(P.realCue, 0.33) - 0.4, tMade = at(P.madeCue, 0.42) - 0.3, tHall = at(P.hallCue, 0.65) - 0.4, tMeta = at(P.metaCue, 0.85) - 0.6;
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 740 }]);
  K.world.room(ctx, { t, time: 'night', window: true, picture: false, lamp: true, plant: true });
  ctx.fillStyle = 'rgba(8,10,24,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
  const metaUp = smooth(clamp((t - tMeta) / 0.5));
  // balance card floating at the top
  const bc = K.popIn(t, 0.1, 0.5) * (1 - clamp((t - tHall) / 0.3));
  if (bc > 0) scaleAt(487, 530, bc, () => balanceRow(487 - 200, 495, 400, '$2722.58', 1, false));
  // scale (beam balance) with two pans
  const sc = K.popIn(t, Math.max(0.2, tReal - 0.2), 0.5);
  const SX = 410, SY = 660;
  if (sc > 0) {
    scaleAt(SX, 1020, sc, () => {
      const tilt = 0.16 * Math.sin(t * 1.6) * (t > tMade ? 1 : 0.4);
      ctx.fillStyle = '#8a93b8'; roundRect(ctx, SX - 12, SY, 24, 380, 8); ctx.fill();
      roundRect(ctx, SX - 90, 1000, 180, 26, 10); ctx.fill();
      ctx.save(); ctx.translate(SX, SY); ctx.rotate(tilt);
      roundRect(ctx, -210, -10, 420, 20, 10); ctx.fillStyle = '#c3cae4'; ctx.fill();
      ctx.restore();
      const pans = [[-1, P.left || 'REAL?', tReal], [1, P.right || 'MADE UP?', tMade]];
      for (const [s, lab, tt] of pans) {
        const px = SX + s * 200 * Math.cos(tilt), py = SY + s * 200 * Math.sin(tilt);
        ctx.strokeStyle = '#c3cae4'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 80, py + 140); ctx.moveTo(px, py); ctx.lineTo(px + 80, py + 140); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(px, py + 145, 100, 22, 0, 0, Math.PI * 2); ctx.fillStyle = '#c3cae4'; ctx.fill();
        const lp = K.popIn(t, tt, 0.4);
        if (lp > 0) scaleAt(px, py + 120, lp, () => {
          ctx.font = H.font('display', 34); const bw = ctx.measureText(lab).width + 40;
          roundRect(ctx, px - bw / 2, py + 70, bw, 60, 14); ctx.fillStyle = s < 0 ? '#f2f4fa' : ACC; ctx.fill();
          text(lab, px, py + 101, 'display', 34, s < 0 ? '#161927' : K.ACCENT.deep);
        });
      }
    });
  }
  // the agent robot on the right, confused, with a hallucination swirl
  K.drawRobot(ctx, 800, 1035, 1.15, { t, state: t > tHall ? 'thinking' : 'idle', seed: 9 });
  const hp = K.popIn(t, tHall, 0.5) * (1 - metaUp);
  if (hp > 0) {
    scaleAt(800, 660, hp, () => {
      ctx.beginPath(); ctx.ellipse(800, 620, 110, 70, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(242,244,250,0.95)'; ctx.fill();
      ctx.beginPath(); ctx.arc(760, 712, 14, 0, Math.PI * 2); ctx.arc(740, 742, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#7b5cd6'; ctx.lineWidth = 5;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 5; a += 0.15) { const r = 6 + a * 4.5, x = 800 + Math.cos(a + t * 3) * r, y = 620 + Math.sin(a + t * 3) * r * 0.6; if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke();
    });
    const lp = K.popIn(t, tHall + 0.2, 0.45) * (1 - metaUp);
    if (lp > 0) K.drawLabel(ctx, 487, 570, lp, { text: P.hall || 'Staff told: "quote here"', size: 28 });
  }
  const ep = K.popIn(t, tReal + 0.2, 0.45) * (1 - metaUp);
  if (ep > 0) K.drawLabel(ctx, 430, 1060, ep, { text: P.couldnt || "Couldn't confirm which", size: 28, accent: true });
  // Meta's response card
  if (metaUp > 0) {
    const mp = K.popIn(t, tMeta, 0.55);
    scaleAt(487, 580, mp, () => {
      const W = 740, X = 487 - W / 2, Y = 480;
      K.glow(ctx, 487, 520, 300, ACC, 0.25);
      roundRect(ctx, X, Y, W, 200, 26); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      roundRect(ctx, X, Y, 14, 200, 7); ctx.fillStyle = ACC; ctx.fill();
      text(P.quote || '“Quote goes here”', 487 + 6, Y + 85, 'display', 56, '#161927');
      text(P.by || 'Company spokesperson', 487 + 6, Y + 155, 'ui', 28, '#5a6280');
    });
  }
  ctx.restore();
}
