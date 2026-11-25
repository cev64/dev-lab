// Scene "chat-checkout" (full frame, one module, several modes). An AI shopping agent (the kit robot) shops a store's deals
// for a person on a sofa: it pushes a cartoon shopping cart, deal boxes drop in, and it pays inside a generic chat
// panel. No logos, no brands: store / app / company names are plain text pills only. People are generic kit cartoons.
// Built for "an AI agent can now shop / check out at store X" stories (added 2026-11-25). Defaults are generic
// placeholders ("Store", "AI agent", "Company", "DATE", "Big sale"): pass the story's names and text.
// modes:
//   hook     (cold open, ~3.5 s): night living room; the robot is already rolling a cart in at frame 0, deal boxes drop
//            in, the chat panel answers, a PAID stamp lands by ~2 s. params: app, ask, reply, stamp, tag
//   chat     date / store / agent pills on cues; the person asks in a chat panel, the agent answers, boxes drop into
//            the cart (buildsCue), a Pay button is tapped and turns into "Paid" (paysCue), the panel glows (chatCue).
//            params: app, date, store, agentLabel, ask, reply, pay, paid, inside + cues dateCue, storeCue, agentCue,
//            askCue, dealCue, buildsCue, paysCue, chatCue
//   gateway  dusk street: the robot by a big phone sends a request card to a store front (text name pill); the store
//            sends product boxes back ("store picks" pill); then a sign-in card with a padlock opens and the robot
//            hops back to the chat. params: store, agentName, notPick, request, picks, signIn, back + cues pickCue, passCue, findsCue,
//            signCue, accountCue, backCue
//   controls night living room: a wallet floats between the person and the robot ("?"), then drifts to the person;
//            an account panel shows the agent's profile, a spending-limit meter capped with a padlock, an "ask before
//            buying" toggle + Approve tap, and an "orders by your agent" list. params: account, head, agentName, limit,
//            toggle, approve, orders + cues panelCue, walletCue, profileCue, limitCue, approvalCue, buysCue, ordersCue
//   caveat   night street: the store's "shopping history" cabinet behind a shield (NOT SHARED) with the robot held
//            back; chat bubbles drift to a plain company tower (text pill) under a big "?"; a "post doesn't say" pill.
//            params: head, store, company, history, notShared, unknown + cues catchCue, historyCue, companyCue,
//            chatCue, unknownCue
// Cue params are narration words ("word#n" = the (n+1)th time in this scene) or seconds; else fractions of the scene.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d) => {
    if (w == null || w === '') return d;
    if (typeof w === 'number') return w;
    const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? d : v;
  };
  const pop = (d, dur = 0.4) => Math.min(1.04, K.popIn(t, d, dur));
  const mode = P.mode || 'hook';
  const GREEN = '#3fbf7f', DANGER = '#ff6b5e', INK = '#141829';
  const BOXC = ['#ff9f5a', '#6fb3ff', '#c08cff', '#ffd166'];

  // ------------------------------------------------------------------ helpers
  // a cartoon deal box, anchored bottom-centre
  function box(x, y, w, h, col, tagOn) {
    ctx.save();
    roundRect(ctx, x - w / 2, y - h, w, h, 7); ctx.fillStyle = col; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(x - w / 2, y - h * 0.45, w, h * 0.45);
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(x - 5, y - h, 10, h);
    if (tagOn) {
      ctx.translate(x + w / 2 - 6, y - h + 6); ctx.rotate(0.25);
      roundRect(ctx, -22, -14, 44, 28, 8); ctx.fillStyle = ACC; ctx.fill();
      ctx.font = H.font('display', 20); ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('%', 0, 1);
    }
    ctx.restore();
  }
  // a cartoon shopping cart (wire basket, handle on the right), anchored bottom-centre; n boxes in it,
  // each box i lands at time drops[i] (falls in from above)
  function cart(x, y, s, drops, roll) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 230);
    // boxes (behind the front wires)
    const slots = [[-52, -62, 70, 66], [22, -62, 76, 80], [-14, -124, 62, 58], [56, -134, 52, 50]];
    drops.forEach((td, i) => {
      if (i >= slots.length) return;
      const u = clamp((t - td) / 0.45);
      if (t < td) return;
      const [bx, by, bw, bh] = slots[i];
      const fall = (1 - K.easeOutBack(u)) * -260;
      box(bx, by + fall + 0, bw, bh, BOXC[i % BOXC.length], i === 1);
    });
    // basket
    ctx.beginPath(); ctx.moveTo(-118, -190); ctx.lineTo(112, -190); ctx.lineTo(86, -58); ctx.lineTo(-92, -58); ctx.closePath();
    ctx.fillStyle = 'rgba(200,214,240,0.16)'; ctx.fill();
    ctx.strokeStyle = '#d4dbee'; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.stroke();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(212,219,238,0.75)';
    for (let i = 1; i < 6; i++) { const u = i / 6; ctx.beginPath(); ctx.moveTo(lerp(-118, 112, u), -190); ctx.lineTo(lerp(-92, 86, u), -58); ctx.stroke(); }
    for (let j = 1; j < 3; j++) { const v = j / 3; ctx.beginPath(); ctx.moveTo(lerp(-118, -92, v), lerp(-190, -58, v)); ctx.lineTo(lerp(112, 86, v), lerp(-190, -58, v)); ctx.stroke(); }
    // accent rim
    roundRect(ctx, -124, -198, 242, 12, 6); ctx.fillStyle = ACC; ctx.fill();
    // handle
    ctx.strokeStyle = '#b9c1d6'; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(112, -190); ctx.lineTo(150, -232); ctx.lineTo(176, -232); ctx.stroke();
    // chassis
    ctx.beginPath(); ctx.moveTo(-92, -58); ctx.lineTo(-80, -30); ctx.lineTo(96, -30); ctx.lineTo(112, -190); ctx.stroke();
    for (const wx of [-70, 76]) {
      ctx.beginPath(); ctx.arc(wx, -14, 14, 0, Math.PI * 2); ctx.fillStyle = '#1c2033'; ctx.fill();
      ctx.save(); ctx.translate(wx, -14); ctx.rotate((roll || 0) / 14); ctx.fillStyle = '#8a93b8'; ctx.fillRect(-2, -11, 4, 8); ctx.restore();
    }
    ctx.restore();
  }
  // the agent robot pushing a cart: cart centre cx, robot behind the handle
  function shopper(cx, y, s, drops, roll, state, moving) {
    cart(cx, y, s, drops, roll);
    const bob = moving ? Math.abs(Math.sin(t * 9)) * 5 : 0;
    K.drawRobot(ctx, cx + 215 * s, y - bob, 0.95 * s, { t, state: state || 'working', flip: true, seed: 4, talk: 0 });
  }
  // generic chat panel: header (mini robot + app name), bubbles [{text, me, t0, kind}], kind 'pay' = button
  function chatPanel(x0, y0, w, msgs, o = {}) {
    const k = o.pop == null ? 1 : o.pop;
    if (k <= 0) return;
    const rows = msgs.filter((m) => t >= m.t0);
    const hh = 64, rowH = 66;
    const h = hh + 18 + Math.max(1, msgs.length) * rowH + 10;
    ctx.save();
    ctx.translate(x0 + w / 2, y0 + h / 2); ctx.scale(k, k); ctx.translate(-(x0 + w / 2), -(y0 + h / 2));
    if (o.glow > 0) K.glow(ctx, x0 + w / 2, y0 + h / 2, w * 0.75, ACC, 0.35 * o.glow);
    roundRect(ctx, x0, y0, w, h, 26); ctx.fillStyle = 'rgba(14,16,30,0.94)'; ctx.fill();
    ctx.lineWidth = o.glow > 0 ? 3 + 2 * o.glow : 2; ctx.strokeStyle = o.glow > 0 ? rgba(ACC, 0.5 + 0.5 * o.glow) : 'rgba(255,255,255,0.18)'; ctx.stroke();
    // header
    const ax = x0 + 40, ay = y0 + hh / 2 + 2;
    roundRect(ctx, ax - 22, ay - 18, 44, 36, 12); ctx.fillStyle = '#e9edf6'; ctx.fill();
    roundRect(ctx, ax - 16, ay - 10, 32, 15, 6); ctx.fillStyle = '#1b1f33'; ctx.fill();
    ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(ax - 7, ay - 3, 3.5, 0, Math.PI * 2); ctx.arc(ax + 7, ay - 3, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = H.font('ui', 28); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(o.app || 'AI agent', ax + 36, ay + 1);
    if (o.tag) {
      ctx.font = H.font('ui', 22); const tw = ctx.measureText(o.tag).width + 28;
      roundRect(ctx, x0 + w - tw - 18, ay - 18, tw, 36, 18); ctx.fillStyle = rgba(ACC, 0.9); ctx.fill();
      ctx.fillStyle = INK; ctx.fillText(o.tag, x0 + w - tw - 4, ay + 1);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x0 + 18, y0 + hh, w - 36, 2);
    rows.forEach((m, i) => {
      const bk = pop(m.t0, 0.35);
      const by = y0 + hh + 18 + i * rowH;
      ctx.save();
      const font = H.fitText(ctx, m.text, 'ui', 26, 18, w - 110);
      ctx.font = font.font; const tw = ctx.measureText(font.text).width;
      const bw = tw + 40, bh = 50;
      const bx = m.me ? x0 + w - 22 - bw : x0 + 22;
      ctx.translate(bx + bw / 2, by + bh / 2); ctx.scale(bk, bk); ctx.translate(-(bx + bw / 2), -(by + bh / 2));
      let fill = m.me ? '#e9edf6' : rgba(ACC, 0.95), ink = INK;
      if (m.kind === 'pay') {
        const done = m.doneAt != null && t >= m.doneAt;
        const press = m.doneAt != null ? clamp(1 - Math.abs(t - m.doneAt) / 0.15) : 0;
        fill = done ? GREEN : ACC; ink = done ? '#ffffff' : INK;
        ctx.translate(bx + bw / 2, by + bh / 2); ctx.scale(1 - 0.08 * press, 1 - 0.08 * press); ctx.translate(-(bx + bw / 2), -(by + bh / 2));
        roundRect(ctx, bx, by, bw, bh, bh / 2); ctx.fillStyle = fill; ctx.fill();
        ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.fillText(done ? (m.doneText || 'Paid') : font.text, bx + bw / 2, by + bh / 2 + 1);
        const rp = m.doneAt != null ? clamp((t - m.doneAt) / 0.6) : 0;
        if (rp > 0 && rp < 1) { ctx.strokeStyle = rgba(ACC, 1 - rp); ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(bx + bw / 2, by + bh / 2, 26 + 80 * rp, 0, Math.PI * 2); ctx.stroke(); }
      } else {
        roundRect(ctx, bx, by, bw, bh, 18); ctx.fillStyle = fill; ctx.fill();
        ctx.fillStyle = ink; ctx.textAlign = 'left'; ctx.fillText(font.text, bx + 20, by + bh / 2 + 1);
      }
      ctx.restore();
    });
    ctx.restore();
  }
  function storeFront(x0, x1, top, name, sign, openAmt) {
    const body = '#2f4f7a', stripe = '#4f8fd6', mid = (x0 + x1) / 2, bottom = 1000;
    roundRect(ctx, x0, top, x1 - x0, bottom - top, 12); ctx.fillStyle = body; ctx.fill();
    for (let i = 0; i < 6; i++) {
      const a = lerp(x0 - 8, x1 + 8, i / 6), b = lerp(x0 - 8, x1 + 8, (i + 1) / 6);
      ctx.beginPath(); ctx.moveTo(a, top + 120); ctx.lineTo(b, top + 120); ctx.lineTo(b + 3, top + 162); ctx.arc((a + b) / 2 + 3, top + 162, (b - a) / 2, 0, Math.PI); ctx.closePath();
      ctx.fillStyle = i % 2 ? '#e8edf8' : stripe; ctx.fill();
    }
    roundRect(ctx, mid - 110, top + 30, 220, 62, 12); ctx.fillStyle = '#15182e'; ctx.fill();
    ctx.font = H.font('display', 34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#e8edf8'; ctx.fillText(sign || 'STORE', mid, top + 63);
    const dw = 150, dt = bottom - 190;
    K.glow(ctx, mid, bottom - 90, 180, ACC, 0.05 + 0.3 * openAmt);
    roundRect(ctx, mid - dw / 2 - 8, dt - 8, dw + 16, 198, 8); ctx.fillStyle = '#1a1d36'; ctx.fill();
    ctx.fillStyle = '#fff1c4'; ctx.fillRect(mid - dw / 2, dt, dw, 190);
    const half = (dw / 2) * (1 - 0.85 * openAmt);
    ctx.fillStyle = '#5d7fae'; ctx.fillRect(mid - dw / 2, dt, half, 190); ctx.fillRect(mid + dw / 2 - half, dt, half, 190);
    if (name) K.drawLabel(ctx, mid, top - 36, pop(0.15), { text: name, size: 30, dot: true, accent: true });
  }
  function wallet(x, y, s, open) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 70, 120);
    // a plain card peeking out
    roundRect(ctx, -50, -62 - 26 * open, 100, 64, 8); ctx.fillStyle = '#6fb3ff'; ctx.fill();
    ctx.fillStyle = '#d9c27a'; ctx.fillRect(-36, -50 - 26 * open, 22, 16);
    roundRect(ctx, -80, -40, 160, 100, 16); ctx.fillStyle = '#8a5a3c'; ctx.fill();
    roundRect(ctx, -80, -40, 160, 34, 14); ctx.fillStyle = '#a06c48'; ctx.fill();
    roundRect(ctx, 34, -6, 56, 36, 12); ctx.fillStyle = '#6e452c'; ctx.fill();
    ctx.beginPath(); ctx.arc(66, 12, 6, 0, Math.PI * 2); ctx.fillStyle = '#d9c27a'; ctx.fill();
    ctx.restore();
  }
  function hand(x, y, press) {
    ctx.save(); ctx.translate(x, y + 8 * press); ctx.rotate(-0.35);
    ctx.fillStyle = '#c98e6a'; ctx.strokeStyle = '#6a3e26'; ctx.lineWidth = 3;
    roundRect(ctx, -11, -10, 22, 50, 11); ctx.fill(); ctx.stroke();
    roundRect(ctx, -22, 26, 56, 60, 18); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------------ modes
  if (mode === 'hook') {
    // action already in motion at frame 0; peak (PAID) at ~2 s
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 725 }]);
    const room = K.world.livingRoomNight(ctx, { t, lampOn: true });
    const sofa = room.sofa || { x: 480, feetY: 1030 };
    K.drawPerson(ctx, sofa.x - 250, sofa.feetY, 1.5, { t, pose: 'sit-phone', seat: false, typing: t < 0.8 ? 1 : 0, mood: t > 2.0 ? 'happy' : 'neutral', skin: 1, hair: 2, shirt: 3, hairStyle: 'long', seed: 9, look: 0.6 });
    const roll = smooth(clamp(t / 1.3));
    const cx = lerp(720, 520, roll);
    shopper(cx, 1035, 0.95, [0.15, 0.55, 0.95, 1.35], (1 - roll) * -200, t > 2.0 ? 'happy' : 'working', t < 1.3);
    chatPanel(470, 490, 410, [
      { text: P.ask || 'Find me a good deal', me: true, t0: -1 },
      { text: P.reply || 'Added to your basket', me: false, t0: 0.7 },
      { text: 'Pay', kind: 'pay', t0: 1.25, doneAt: 1.75, doneText: 'Paid' },
    ], { app: P.app || 'AI agent', pop: 1 });
    K.drawLabel(ctx, 280, 520, pop(0.05), { text: P.tag || 'Big sale', size: 30, dot: true, accent: true });
    const st = (t - 1.85) / 0.5;
    if (st > 0) K.drawStamp(ctx, 520, 900, 0.75, { kind: 'check', text: P.stamp || 'PAID', land: st });
    return;
  }

  if (mode === 'chat') {
    const tDate = at(P.dateCue, D * 0.12) - 0.15;
    const tStore = at(P.storeCue, D * 0.2) - 0.15;
    const tAgent = at(P.agentCue, D * 0.36) - 0.15;
    const tAsk = at(P.askCue, D * 0.55) - 0.1;
    const tDeal = at(P.dealCue, D * 0.63);
    const tBuild = at(P.buildsCue, D * 0.7) - 0.1;
    const tPay = at(P.paysCue, D * 0.8);
    const tChat = at(P.chatCue, D * 0.92) - 0.3;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 725 }]);
    const room = K.world.livingRoomNight(ctx, { t, lampOn: true });
    const sofa = room.sofa || { x: 480, feetY: 1030 };
    const typing = (t > tAsk - 0.6 && t < tAsk + 0.4) || (t > tPay - 0.6 && t < tPay);
    K.drawPerson(ctx, sofa.x - 250, sofa.feetY, 1.45, { t, pose: 'sit-phone', seat: false, typing: typing ? 1 : 0, mood: t > tPay ? 'happy' : 'neutral', skin: 1, hair: 2, shirt: 3, hairStyle: 'long', seed: 9, look: 0.6 });
    const n = 4, drops = Array.from({ length: n }, (_, i) => tBuild + 0.1 + i * 0.32);
    shopper(540, 1035, 0.88, drops, 0, t > tPay ? 'happy' : (t > tDeal ? 'working' : 'idle'), false);
    // pills, right column
    K.drawLabel(ctx, 290, 500, pop(tDate), { text: P.date || 'DATE', size: 26, dot: true });
    if (t > tStore) K.drawLabel(ctx, 290, 560, pop(tStore), { text: P.store || 'Store deals', size: 26, dot: true, accent: true });
    if (t > tAgent) K.drawLabel(ctx, 290, 620, pop(tAgent), { text: P.agentLabel || "The company's AI agent", size: 26, dot: true });
    // link line from the store pill to the robot
    const lk = smooth((t - tAgent - 0.2) / 0.5);
    if (false) {
      ctx.save(); ctx.setLineDash([10, 10]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = rgba(ACC, 0.8); ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(815, 620); ctx.lineTo(lerp(815, 800, lk), lerp(620, 790, lk)); ctx.stroke(); ctx.restore();
    }
    // chat panel slides in when the person asks
    const ck = pop(tAsk - 0.35, 0.45);
    chatPanel(470, 490, 410, [
      { text: P.ask || 'Find me a good deal', me: true, t0: tAsk },
      { text: P.reply || 'Found one. Added to basket', me: false, t0: tDeal },
      { text: P.pay || 'Pay', kind: 'pay', t0: tBuild + 0.4, doneAt: tPay, doneText: P.paid || 'Paid' },
    ], { app: P.app || 'AI agent', pop: ck, glow: smooth((t - tChat) / 0.4) * (0.75 + 0.25 * Math.sin(t * 4)), tag: t > tChat ? (P.inside || 'In the chat') : '' });
    return;
  }

  if (mode === 'gateway') {
    const tPick = at(P.pickCue, D * 0.12) - 0.2;
    const tPass = at(P.passCue, D * 0.2) - 0.1;
    const tFind = at(P.findsCue, D * 0.43) - 0.1;
    const tSign = at(P.signCue, D * 0.64) - 0.2;
    const tAcct = at(P.accountCue, D * 0.75);
    const tBack = at(P.backCue, D * 0.88) - 0.2;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 725 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });
    storeFront(560, 905, 640, P.store || 'Store', 'STORE', smooth((t - tPass - 0.8) / 0.4));
    // big phone on the left with the chat
    K.drawPhone(ctx, 175, 1010, 1.15, { t, bubbles: t > tBack ? 5 : 3, screen: 'chat' });
    // robot (agent) next to it; hops back toward the phone at the end
    const hopU = smooth((t - tBack) / 0.6);
    const rx = lerp(360, 300, hopU), ry = 1030 - Math.sin(clamp((t - tBack) / 0.6) * Math.PI) * 60;
    const shrug = t > tPick && t < tPass + 0.3;
    K.drawRobot(ctx, rx, ry, 0.95, { t, state: t > tFind + 1.2 ? 'happy' : (shrug ? 'thinking' : 'idle'), seed: 4 });
    K.drawLabel(ctx, rx, 760, pop(0.2), { text: P.agentName || 'AI agent', size: 26, dot: true });
    // "doesn't pick" pill
    const pk = pop(tPick, 0.4) * (1 - smooth((t - tPass - 0.6) / 0.3));
    if (pk > 0.02) K.drawLabel(ctx, 330, 500, pk, { text: P.notPick || "Doesn't pick the products", size: 26 });
    // request card flies from the robot to the store door
    const fu = clamp((t - tPass) / 1.1);
    if (t > tPass && fu < 1) {
      const p = [lerp(rx + 60, 732, smooth(fu)), lerp(860, 900, fu) - Math.sin(fu * Math.PI) * 200];
      ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(Math.sin(fu * 6) * 0.15);
      K.drawDocument(ctx, 0, 40, 0.42, { lines: 3 }); ctx.restore();
    }
    if (t > tPass) {
      const rk = pop(tPass + 0.1) * (1 - smooth((t - tFind - 0.2) / 0.3));
      if (rk > 0.02) K.drawLabel(ctx, 600, 500, rk, { text: P.request || 'Your request', size: 26, dot: true });
    }
    // products come back out of the door and slide to the robot's feet
    for (let i = 0; i < 3; i++) {
      const s0 = tFind + 0.2 + i * 0.45, u = clamp((t - s0) / 0.9);
      if (t < s0) continue;
      const x = lerp(732, 470 + i * 0, smooth(u)), stackY = 1032 - i * 52;
      const y = lerp(990, stackY, smooth(u)) - Math.sin(u * Math.PI) * 90;
      box(x, y, 66, 50, BOXC[i], i === 0);
    }
    const fk2 = 1 - smooth((t - tSign) / 0.3);
    if (t > tFind && fk2 > 0.02) K.drawLabel(ctx, 600, 500, Math.min(fk2, pop(tFind + 0.1)), { text: P.picks || 'The store picks the products', size: 26, dot: true, accent: true });
    // sign-in card
    const sk = pop(tSign, 0.45) * (1 - smooth((t - tBack - 0.2) / 0.35));
    if (sk > 0.02) {
      ctx.save(); ctx.translate(487, 640); ctx.scale(sk, sk);
      roundRect(ctx, -230, -110, 460, 230, 26); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.font = H.font('display', 32); ctx.fillStyle = '#283152'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(P.signIn || 'Sign in to the store', -200, -66);
      for (let r = 0; r < 2; r++) { roundRect(ctx, -200, -22 + r * 56, 270, 40, 10); ctx.fillStyle = '#dfe4f1'; ctx.fill();
        const fillW = 230 * smooth((t - tSign - 0.4 - r * 0.4) / 0.5); if (fillW > 1) { ctx.fillStyle = '#9aa3bd'; for (let d = 0; d < fillW / 22; d++) { ctx.beginPath(); ctx.arc(-182 + d * 22, -2 + r * 56, 6, 0, Math.PI * 2); ctx.fill(); } } }
      K.drawLock(ctx, 150, 80, 0.85, { open: smooth((t - tAcct) / 0.4), shadow: false });
      ctx.restore();
    }
    if (t > tBack) K.drawLabel(ctx, 330, 500, pop(tBack + 0.1), { text: P.back || 'Back to the chat', size: 26, dot: true, accent: true });
    return;
  }

  if (mode === 'controls') {
    const tWal = at(P.walletCue, D * 0.08) - 0.3;
    const tProf = at(P.profileCue, D * 0.3) - 0.5;
    const tLim = at(P.limitCue, D * 0.44) - 0.2;
    const tAppr = at(P.approvalCue, D * 0.63) - 0.3;
    const tBuys = at(P.buysCue, D * 0.72);
    const tOrd = at(P.ordersCue, D * 0.8) - 0.2;
    const tPanel = at(P.panelCue, D * 0.16) - 0.2;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 725 }]);
    const room = K.world.livingRoomNight(ctx, { t, lampOn: true });
    const sofa = room.sofa || { x: 480, feetY: 1030 };
    const owns = smooth((t - tLim) / 0.8);
    K.drawPerson(ctx, sofa.x - 290, sofa.feetY, 1.4, { t, pose: 'sit-phone', seat: false, typing: (t > tLim && t < tLim + 1) || (t > tBuys - 0.5 && t < tBuys) ? 1 : 0, mood: t > tLim ? 'happy' : 'neutral', skin: 2, hair: 1, shirt: 1, hairStyle: 'short', seed: 3, look: 0.5 });
    K.drawRobot(ctx, 395, 1035, 0.85, { t, state: t > tBuys ? 'happy' : (t < tLim ? 'thinking' : 'idle'), seed: 4 });
    // the wallet floats between them, then drifts to the person
    const wk = pop(tWal, 0.45);
    if (wk > 0) {
      const wx = lerp(300, 175, owns), wy = lerp(610, 650, owns) + Math.sin(t * 2.2) * 8 * (1 - owns);
      wallet(wx, wy, 0.9 * wk, 0);
      const qk = pop(tWal + 0.25) * (1 - owns);
      if (qk > 0.02) { ctx.save(); ctx.font = H.font('display', 72); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.globalAlpha = clamp(qk); ctx.fillText('?', wx + 4 + Math.sin(t * 3) * 4, wy - 90); ctx.restore(); }
    }
    // account panel
    const PX0 = 470, PX1 = 860, PW = PX1 - PX0, PY0 = 485;
    const pk = pop(tPanel, 0.45);
    if (pk > 0) {
      ctx.save(); ctx.translate((PX0 + PX1) / 2, 720); ctx.scale(pk, pk); ctx.translate(-(PX0 + PX1) / 2, -720);
      roundRect(ctx, PX0, PY0, PW, 545, 28); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      ctx.font = H.font('ui', 26); ctx.fillStyle = '#5a6488'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(P.account || 'Your store account', PX0 + 26, PY0 + 36);
      ctx.fillStyle = '#d5dae8'; ctx.fillRect(PX0 + 26, PY0 + 62, PW - 52, 3);
      // profile row
      const fk = pop(tProf, 0.4);
      if (fk > 0) {
        ctx.save(); ctx.translate(PX0 + PW / 2, PY0 + 115); ctx.scale(fk, fk);
        roundRect(ctx, -PW / 2 + 20, -38, PW - 40, 76, 18); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
        const ax = -PW / 2 + 70;
        roundRect(ctx, ax - 28, -24, 56, 46, 14); ctx.fillStyle = '#e9edf6'; ctx.fill();
        roundRect(ctx, ax - 20, -14, 40, 20, 8); ctx.fillStyle = '#1b1f33'; ctx.fill();
        ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(ax - 8, -4, 4, 0, Math.PI * 2); ctx.arc(ax + 8, -4, 4, 0, Math.PI * 2); ctx.fill();
        ctx.font = H.font('display', 28); ctx.fillStyle = '#283152'; ctx.textAlign = 'left'; ctx.fillText(P.head || 'Agent Profile', ax + 44, -8);
        ctx.font = H.font('ui', 22); ctx.fillStyle = '#5a6488'; ctx.fillText(P.agentName || 'AI agent', ax + 44, 22);
        ctx.restore();
      }
      // spending limit meter
      const lk = pop(tLim, 0.4);
      if (lk > 0) {
        const y = PY0 + 195;
        ctx.save(); ctx.globalAlpha = clamp(lk);
        ctx.font = H.font('ui', 26); ctx.fillStyle = '#283152'; ctx.textAlign = 'left'; ctx.fillText(P.limit || 'Spending limit', PX0 + 30, y);
        roundRect(ctx, PX0 + 30, y + 26, PW - 120, 26, 13); ctx.fillStyle = '#dfe4f1'; ctx.fill();
        const f = K.phase(t, tLim + 0.3, tLim + 1.4, H.easeOutCubic) * 0.78;
        if (f > 0.01) { roundRect(ctx, PX0 + 30, y + 26, (PW - 120) * f, 26, 13); ctx.fillStyle = ACC; ctx.fill(); }
        ctx.fillStyle = DANGER; ctx.fillRect(PX0 + 30 + (PW - 120) * 0.78 - 3, y + 16, 6, 46);
        ctx.restore();
        if (t > tLim + 1.3) K.drawLock(ctx, PX1 - 50, y + 70, 0.42 * Math.min(1.04, K.popIn(t, tLim + 1.3, 0.4)), { open: 0, shadow: false });
      }
      // approval toggle + approve button
      const ak = pop(tAppr, 0.4);
      if (ak > 0) {
        const y = PY0 + 300;
        ctx.save(); ctx.globalAlpha = clamp(ak);
        ctx.font = H.font('ui', 26); ctx.fillStyle = '#283152'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(P.toggle || 'Ask before buying', PX0 + 30, y);
        const on = smooth((t - tAppr - 0.4) / 0.3), swX = PX1 - 70;
        roundRect(ctx, swX - 36, y - 22, 72, 44, 22); ctx.fillStyle = on > 0.5 ? GREEN : '#c3c9da'; ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(lerp(swX - 14, swX + 14, on), y, 17, 0, Math.PI * 2); ctx.fill();
        // approve button
        const done = t > tBuys + 0.05, press = clamp(1 - Math.abs(t - tBuys) / 0.15);
        ctx.save(); ctx.translate(PX0 + 130, y + 62); ctx.scale(1 - 0.07 * press, 1 - 0.07 * press);
        roundRect(ctx, -100, -28, 200, 56, 28); ctx.fillStyle = done ? GREEN : ACC; ctx.fill();
        ctx.font = H.font('display', 26); ctx.fillStyle = done ? '#ffffff' : INK; ctx.textAlign = 'center'; ctx.fillText(done ? 'Approved' : (P.approve || 'Approve'), 0, 2);
        ctx.restore();
        ctx.restore();
        if (t > tAppr + 0.6) {
          const hu = smooth((t - tAppr - 0.6) / Math.max(0.3, tBuys - tAppr - 0.6));
          const away = smooth((t - tBuys - 0.35) / 0.5);
          if (away < 1) { ctx.save(); ctx.globalAlpha = 1 - away; hand(lerp(PX0 + 330, PX0 + 150, hu) + away * 160, lerp(y + 160, y + 70, hu) + away * 120, press); ctx.restore(); }
        }
      }
      // orders by the agent
      const ok = pop(tOrd, 0.4);
      if (ok > 0) {
        const y = PY0 + 435;
        ctx.save(); ctx.globalAlpha = clamp(ok);
        ctx.font = H.font('ui', 26); ctx.fillStyle = '#283152'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText(P.orders || 'Orders by your agent', PX0 + 30, y);
        ctx.restore();
        for (let i = 0; i < 3; i++) {
          const k = pop(tOrd + 0.3 + i * 0.25, 0.35);
          if (k <= 0) continue;
          const bx = PX0 + 75 + i * 110, by = y + 58;
          ctx.save(); ctx.translate(bx, by); ctx.scale(k, k);
          roundRect(ctx, -46, -30, 92, 60, 12); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#d5dae8'; ctx.lineWidth = 2; ctx.stroke();
          box(-14, 18, 36, 30, BOXC[i], false);
          roundRect(ctx, 10, -18, 28, 24, 8); ctx.fillStyle = '#1b1f33'; ctx.fill();
          ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(18, -6, 3, 0, Math.PI * 2); ctx.arc(30, -6, 3, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      }
      ctx.restore();
    }
    return;
  }

  if (mode === 'caveat') {
    const tCatch = at(P.catchCue, D * 0.05) - 0.2;
    const tHist = at(P.historyCue, D * 0.4) - 0.6;
    const tComp = at(P.companyCue, D * 0.56) - 0.2;
    const tChat = at(P.chatCue, D * 0.64) - 0.2;
    const tUnk = at(P.unknownCue, D * 0.84) - 0.2;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 725 }]);
    K.world.city(ctx, { t, time: 'night', groundY: 1000 });
    // left: the store with a records cabinet out front behind a shield
    storeFront(110, 430, 700, '', 'STORE', 0);
    // cabinet
    const cx = 270, cy = 1000;
    roundRect(ctx, cx - 70, cy - 210, 140, 210, 10); ctx.fillStyle = '#7d879f'; ctx.fill();
    for (let d = 0; d < 3; d++) { roundRect(ctx, cx - 58, cy - 198 + d * 66, 116, 56, 8); ctx.fillStyle = '#9aa3bd'; ctx.fill(); roundRect(ctx, cx - 18, cy - 176 + d * 66, 36, 10, 5); ctx.fillStyle = '#4b5470'; ctx.fill(); }
    K.drawLock(ctx, cx, cy - 60, 0.5, { open: 0, shadow: false });
    // robot reaches toward it, held back by a shield on hist cue
    const reach = smooth(clamp(t / Math.max(0.6, tHist)));
    const back = smooth((t - tHist - 0.3) / 0.5);
    const rx = lerp(560, 460, reach) + back * 70 + K.shake(t, tHist + 0.25, 0.35, 5);
    K.drawRobot(ctx, rx, 1035, 0.9, { t, state: t > tHist + 0.3 ? 'thinking' : 'working', seed: 4 });
    if (t > tHist) {
      K.drawShield(ctx, 380, 960, 0.8 * Math.min(1.04, K.popIn(t, tHist, 0.4)), { check: smooth((t - tHist - 0.3) / 0.4) });
    }
    if (t > tHist + 0.1) K.drawLabel(ctx, 320, 580, pop(tHist + 0.1), { text: P.history || 'Store shopping history', size: 26, dot: true });
    if (t > tHist + 0.5) K.drawLabel(ctx, 320, 645, pop(tHist + 0.5), { text: P.notShared || 'Not shared with the agent', size: 26, accent: true });
    // right: plain company tower
    const tk = smooth((t - tComp) / 0.5);
    ctx.save(); ctx.globalAlpha = 0.35 + 0.65 * tk;
    K.drawBuilding(ctx, 780, 1000, 0.9, { t, color: '#4a5591', floors: 7, lit: 0.3 + 0.4 * tk });
    ctx.restore();
    if (t > tComp) K.drawLabel(ctx, 780, 672, pop(tComp), { text: P.company || 'Company', size: 30, dot: true });
    // chat bubbles drift from the robot up to the tower
    if (t > tChat) {
      for (let i = 0; i < 4; i++) {
        const per = 1.6, ph = ((t - tChat) - i * 0.4);
        if (ph < 0) continue;
        const u = (ph % per) / per;
        const x = lerp(rx + 30, 760, smooth(u)), y = lerp(820, 700, u) - Math.sin(u * Math.PI) * 90;
        ctx.save(); ctx.globalAlpha = Math.sin(u * Math.PI);
        roundRect(ctx, x - 34, y - 22, 68, 44, 14); ctx.fillStyle = '#e9edf6'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(x - 14, y + 20); ctx.lineTo(x - 24, y + 34); ctx.lineTo(x - 2, y + 20); ctx.fill();
        ctx.fillStyle = '#7d879f'; for (let d = -1; d <= 1; d++) { ctx.beginPath(); ctx.arc(x + d * 16, y, 5, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
      // big question mark over the tower
      const qk = pop(tChat + 0.2, 0.45);
      if (qk > 0) {
        ctx.save(); ctx.translate(790, 535 + Math.sin(t * 2) * 6); ctx.scale(qk, qk);
        ctx.beginPath(); ctx.arc(0, 0, 58, 0, Math.PI * 2); ctx.fillStyle = 'rgba(12,14,26,0.9)'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = ACC; ctx.stroke();
        ctx.font = H.font('display', 72); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 4);
        ctx.restore();
      }
    }
    // header pill, then the "doesn't say" pill replacing it
    const hk = pop(tCatch) * (1 - smooth((t - tUnk) / 0.3));
    if (hk > 0.02) K.drawLabel(ctx, 420, 505, hk, { text: P.head || 'One catch', size: 30, dot: true, accent: true });
    if (t > tUnk) K.drawLabel(ctx, 420, 505, pop(tUnk + 0.1), { text: P.unknown || "The post doesn't say", size: 28, dot: true });
    return;
  }
}
