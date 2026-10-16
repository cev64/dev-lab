// Scene "tab-peek" (full frame). A generic browser window full of tabs (no logos, text labels only) and the kit robot
// as the AI assistant that can see and act in them. Modes:
//   peek    (best as 2-beat span) room at night: robot peeks over the top of the window and scans the tabs; date pill +
//           extension piece; the person asks with a bubble (tagCue); scan beam lights every tab (lookCue); answer bubble.
//   work    robot takes control of the tabs: message typed + sent, form fills, file downloads, tabs fall into coloured
//           groups; a task chip row ticks on each cue (msgCue, formCue, dlCue, groupCue).
//   shop    product tabs with price tags; robot compares, cheapest gets a ring (compareCue); then a sign-up form fills and
//           the cursor halts before Submit with a STOP sign (formCue, stopCue).
//   switch  (alias "atlas") night city: a separate stand-alone AI browser window shuts down (TV-off + stamp, shutCue),
//           date pill (dateCue); the robot hops into the user's own browser window (moveCue).
//   trust   tabs labelled Email / Banking / Work pop in with big icon tiles (cues[]); "Signed in" badges + guide pill (guideCue);
//           a worried person looks on.
//   permit  site-permission dialog: buttons light as they are named (tapCue + the next words), robot waits at a gate
//           barrier that lifts on "Allow" and drops on "Decline"; then "Always asks first" rows for history/downloads (alwaysCue).
//   payoff  room: tab strip with a Banking tab, the robot peeks, cursor hovers the tab's close button; question card (qCue, closeCue).
// Fits: any "AI assistant in your browser / reads your tabs / agent clicks for you / permission prompt" story.
// Defaults are generic (no product names): pass the story's names and dates as params.
// params (defaults in brackets):
//   peek:   date ("This week"), ext ("Extension updated"), ask ("What's in my tabs?"), answer ("Answer from your open tabs"),
//           tabs (4 strings), dateCue, updCue, tagCue, lookCue, answerCue
//   work:   label ("WORK MODE"), tabs (6), groupOf, g1 ("Trip"), g2 ("Work"), t1/t2/t3 (task chips), msg, ctlCue, msgCue,
//           formCue, dlCue, groupCue
//   shop:   prices (5), store ("Store"), l1 ("Compare prices across tabs"), best ("Lowest price"), l2 ("The maker's own
//           example"), formTitle ("Event sign-up"), stopText ("Stops before submitting"), compareCue, formCue, stopCue
//   switch: atlas ("Old app"), atlasSub ("browser"), stamp ("SHUT DOWN"), dateText ("Shutting down"), mine ("The browser you
//           already use"), nowIn ("Now in your own browser"), shutCue, dateCue, moveCue
//   trust:  tabNames (["Email", "Banking", "Work"]), cues, badge ("Signed in"), head, guide ("The guide: it can act where
//           you're signed in"), thinkCue, guideCue
//   permit: dialog ("Let the assistant use this site?"), buttons (4), head1, head2, r1, r2, asks, askCue, tapCue, alwaysCue
//   payoff: tabs, target ("Banking"), page ("Your bank"), head ("Your tabs, your call"), a, b, qCue, closeCue
// Library copy of the 2026-10-16 browser-assistant story scene (that clip passes its product names explicitly).
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration;
  const tc = (w, d, n = 0) => { const v = w ? info.timeOf(w, n) : null; return v != null ? v : d; };
  const U = utils(K, H, info);
  const mode = P.mode || 'peek';
  ctx.save();
  if (mode === 'peek') peek(ctx, t, info, K, H, P, D, tc, U);
  else if (mode === 'work') work(ctx, t, info, K, H, P, D, tc, U);
  else if (mode === 'shop') shop(ctx, t, info, K, H, P, D, tc, U);
  else if (mode === 'switch' || mode === 'atlas') atlas(ctx, t, info, K, H, P, D, tc, U);
  else if (mode === 'trust') trust(ctx, t, info, K, H, P, D, tc, U);
  else if (mode === 'permit') permit(ctx, t, info, K, H, P, D, tc, U);
  else payoff(ctx, t, info, K, H, P, D, tc, U);
  ctx.restore();
}

// ------------------------------------------------------------------ modes
function peek(ctx, t, info, K, H, P, D, tc, U) {
  const { clamp, smooth } = H;
  const dateAt = tc(P.dateCue || 'october', 3.6) - 0.1, updAt = tc(P.updCue || 'updated', 5.9) - 0.2;
  const tagAt = tc(P.tagCue || 'tag', D * 0.68) - 0.2, lookAt = tc(P.lookCue || 'look', D * 0.82) - 0.1, ansAt = tc(P.answerCue || 'answer', D * 0.94) - 0.2;
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 600, y: 700 }, { t: D, zoom: 1.0 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false });
  const B = { x: 315, y: 600, w: 595, h: 350 };
  const tabs = (P.tabs || ['Shoes', 'Flights', 'Recipe', 'News']).map((s) => ({ text: s }));
  // scan: during the hook a quick back-and-forth; from lookAt every tab lights in turn and stays lit
  const n = tabs.length;
  let beamTo = -1;
  if (t > 0.5 && t < tagAt) { const u = t < 3.3 ? (t - 0.5) * 1.6 : 4.48 + (t - 3.3) * 0.7; beamTo = Math.floor(u) % n; tabs[beamTo].hi = 1; }
  if (t >= lookAt) {
    const k = clamp((t - lookAt) / 1.4); const upto = Math.min(n - 1, Math.floor(k * n));
    for (let i = 0; i <= upto; i++) tabs[i].hi = 1;
    beamTo = k < 1 ? upto : -1;
  }
  // robot behind the window, peeking over the top edge
  const pk = smooth(clamp((t - 0.2) / 0.6)), rx = 780;
  K.drawRobot(ctx, rx, B.y + 260 - 140 * pk, 1.05, { t, state: t >= ansAt ? 'happy' : beamTo >= 0 ? 'working' : 'thinking', talk: t >= ansAt ? info.env * 0.6 : 0, seed: 4 });
  const C = U.browser(ctx, B, { t, tabs, ext: smooth(clamp((t - updAt) / 0.4)) });
  U.pageLines(ctx, C, t, 0);
  if (beamTo >= 0) U.beam(ctx, rx, B.y - 92, U.tabCenter(B, n, beamTo), B.y + 26, 0.8);
  // person at left
  const asking = t >= tagAt;
  K.drawPerson(ctx, 165, 1035, 1.5, { t, pose: asking ? 'point' : 'stand', mood: 'happy', talk: asking && t < lookAt ? info.env * 0.7 : 0, skin: 2, hair: 1, hairStyle: 'curly', shirt: 1, seed: 3 });
  // date pill + extension label
  K.drawLabel(ctx, 600, 505, K.popIn(t, dateAt, 0.4), { text: P.date || 'This week', size: 30, dot: true });
  const ep = K.popIn(t, updAt, 0.4);
  if (ep > 0 && t < tagAt) K.drawLabel(ctx, 760, 1030, ep, { text: P.ext || 'Extension updated', size: 26, accent: true });
  // ask bubble from the person, then the robot's answer
  if (t >= tagAt) K.drawSpeechBubble(ctx, 215, 590, 1, { text: P.ask || 'What\'s in my tabs?', size: 28, maxW: 270, tail: 'left', pop: K.popIn(t, tagAt, 0.4) });
  if (t >= ansAt) U.card(ctx, 600, 1042, 540, 84, K.popIn(t, ansAt, 0.4), P.answer || 'Answer from your open tabs', true);
}

function work(ctx, t, info, K, H, P, D, tc, U) {
  const { clamp, smooth, lerp } = H;
  const msgAt = tc(P.msgCue || 'messages', D * 0.45) - 0.3, formAt = tc(P.formCue || 'forms', D * 0.6) - 0.3;
  const dlAt = tc(P.dlCue || 'download', D * 0.72) - 0.3, grpAt = tc(P.groupCue || 'group', D * 0.85) - 0.3;
  const ctlAt = tc(P.ctlCue || 'control', D * 0.25) - 0.2;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 500, y: 720 }]);
  K.world.office(ctx, { t, time: 'night' });
  const B = { x: 90, y: 505, w: 815, h: 380 };
  const names = P.tabs || ['Hotel', 'Train', 'Map', 'Inbox', 'Docs', 'Chat'];
  const n = names.length, g = smooth(clamp((t - grpAt) / 0.9));
  const groupOf = P.groupOf || names.map((_, i) => (i < n / 2 ? 0 : 1));
  const cols = [K.ACCENT.base, '#8fa3ff'];
  // control phase: a highlight hops tab to tab
  const hop = t >= ctlAt && t < msgAt ? Math.floor((t - ctlAt) * 4) % n : -1;
  const tabs = names.map((s, i) => ({ text: s, hi: i === hop ? 1 : 0, group: g > 0 ? H.mixHex('#262b44', cols[groupOf[i]], g) : null }));
  const C = U.browser(ctx, B, { t, tabs, active: hop >= 0 ? hop : 0, groups: [{ from: 0, to: 2, text: P.g1 || 'Trip', col: cols[0] }, { from: 3, to: 5, text: P.g2 || 'Work', col: cols[1] }], groupA: smooth(clamp((t - grpAt - 0.5) / 0.4)) });
  if (t < msgAt - 0.2) U.pageLines(ctx, C, t, 1);
  else {
    U.page(ctx, C);
    const cw = (C.w - 64) / 3, ch = C.h - 36;
    const cards = [[msgAt, P.t1 || 'Message'], [formAt, P.t2 || 'Form'], [dlAt, P.t3 || 'Download']];
    cards.forEach(([at, title], i) => {
      const x = C.x + 16 + i * (cw + 16), y = C.y + 18, pop = K.popIn(t, msgAt - 0.2 + i * 0.12, 0.35);
      if (pop <= 0) return;
      const on = t >= at;
      ctx.save(); ctx.translate(x + cw / 2, y + ch / 2); ctx.scale(pop, pop); ctx.translate(-(x + cw / 2), -(y + ch / 2));
      U.rr(ctx, x, y, cw, ch, 16, '#ffffff');
      ctx.strokeStyle = on ? K.ACCENT.shade : '#c3cadd'; ctx.lineWidth = on ? 5 : 2; H.roundRect(ctx, x, y, cw, ch, 16); ctx.stroke();
      U.text(ctx, title, x + cw / 2, y + 30, K.font.bold(28), '#161927', 'center');
      const k = clamp((t - at) / 1.0);
      if (i === 0) {
        U.rr(ctx, x + 18, y + 64, cw - 36, 52, 14, '#dfe4f1');
        const s = on ? K.typewriter(P.msg || 'On my way!', t, 20, at) : '';
        U.text(ctx, s, x + 34, y + 91, K.font.ui(26), '#161927', 'left');
        if (k >= 0.7) { const sp = K.popIn(t, at + 0.7, 0.35); ctx.save(); ctx.translate(x + cw / 2, y + 170); ctx.scale(sp, sp); U.rr(ctx, -70, -26, 140, 52, 26, K.ACCENT.base); U.text(ctx, 'Sent', 12, 1, K.font.bold(26), K.ACCENT.deep, 'center'); U.tick(ctx, -44, 0, K.ACCENT.deep); ctx.restore(); }
      } else if (i === 1) {
        [['Name', 'Sam Lee'], ['Email', 'sam@mail.com']].forEach(([lb, v], r) => {
          const fy = y + 62 + r * 74;
          U.text(ctx, lb, x + 20, fy + 8, K.font.ui(20), '#4a5170', 'left');
          U.rr(ctx, x + 18, fy + 22, cw - 36, 40, 10, '#eef1f8');
          if (on) U.text(ctx, K.typewriter(v, t, 26, at + r * 0.5), x + 30, fy + 43, K.font.ui(23), '#161927', 'left');
        });
      } else {
        U.fileIcon(ctx, x + cw / 2 - 40, y + 120, 0.62, 'PDF');
        U.arrowDown(ctx, x + cw / 2 + 50, y + 70 + 30 * smooth(k), 0.7);
        U.rr(ctx, x + 22, y + ch - 46, cw - 44, 18, 9, '#dfe4f1');
        if (on) U.rr(ctx, x + 22, y + ch - 46, (cw - 44) * smooth(k), 18, 9, K.ACCENT.shade);
      }
      ctx.restore();
    });
  }
  K.drawRobot(ctx, 845, 1040, 0.85, { t, state: t > grpAt + 1 ? 'happy' : t >= ctlAt ? 'working' : 'thinking', seed: 6 });
  // cursor: follows the active job
  const cw = (C.w - 64) / 3;
  const cur = t < ctlAt ? [C.x + 300, C.y + 140] : t < msgAt ? [U.tabCenter(B, n, Math.max(0, hop)), B.y + 34] : t < formAt ? [C.x + 16 + cw * 0.7, C.y + 110] : t < dlAt ? [C.x + 32 + cw * 1.7, C.y + 190] : t < grpAt ? [C.x + 48 + cw * 2.6, C.y + 120] : [U.tabCenter(B, n, 2.5), B.y + 34];
  U.cursor(ctx, cur[0] + 4 * Math.sin(t * 3), cur[1] + 3 * Math.cos(t * 2.3), 1);
  K.drawLabel(ctx, 487, 492, K.popIn(t, 0.15, 0.4), { text: P.label || 'WORK MODE', size: 30, accent: true });
}

function shop(ctx, t, info, K, H, P, D, tc, U) {
  const { clamp, smooth, lerp } = H;
  const cmpAt = tc(P.compareCue || 'compare', D * 0.25) - 0.1, formAt = tc(P.formCue || 'example', D * 0.48) - 0.4, stopAt = tc(P.stopCue || 'stop', D * 0.84) - 0.15;
  K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 490, y: 740 }, { t: D, zoom: 1.0 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true });
  const B = { x: 90, y: 490, w: 815, h: 400 };
  const prices = P.prices || ['$64', '$58', '$71', '$49', '$66'];
  const best = prices.reduce((bi, p, i, a) => (parseFloat(p.replace(/[^0-9.]/g, '')) < parseFloat(a[bi].replace(/[^0-9.]/g, '')) ? i : bi), 0);
  const formMode = t >= formAt;
  const tabs = formMode ? ['Event', 'Sign-up', 'Mail'].map((s) => ({ text: s })) : prices.map((_, i) => ({ text: (P.store || 'Store') + ' ' + (i + 1) }));
  const k = clamp((t - cmpAt) / 1.6), scanI = Math.min(prices.length - 1, Math.floor(k * prices.length));
  if (!formMode && t >= cmpAt) for (let i = 0; i <= scanI; i++) tabs[i].hi = 1;
  const C = U.browser(ctx, B, { t, tabs, active: formMode ? 1 : (t >= cmpAt + 1.7 ? best : 0) });
  U.page(ctx, C);
  if (!formMode) {
    const cw = (C.w - 60) / prices.length;
    prices.forEach((p, i) => {
      const x = C.x + 30 + i * cw + cw / 2, y = C.y + C.h / 2 + 10, pop = K.popIn(t, 0.15 + i * 0.12, 0.35);
      if (pop <= 0) return;
      ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop);
      U.sneaker(ctx, 0, -20, 0.85, i);
      const win = t >= cmpAt + 1.7 && i === best;
      H.roundRect(ctx, -52, 50, 104, 46, 12); ctx.fillStyle = win ? K.ACCENT.base : '#2a2f45'; ctx.fill();
      U.text(ctx, p, 0, 74, K.font.display(28), win ? K.ACCENT.deep : '#ffffff', 'center');
      if (win) { ctx.strokeStyle = K.ACCENT.base; ctx.lineWidth = 6; H.roundRect(ctx, -cw / 2 + 6, -120, cw - 12, 230, 18); ctx.stroke(); }
      ctx.restore();
    });
    if (t >= cmpAt && k < 1) U.beam(ctx, 835, 1040 - 160, C.x + 30 + scanI * cw + cw / 2, C.y + C.h / 2, 0.55);
    K.drawLabel(ctx, 487, 492, K.popIn(t, 0.2, 0.4), { text: P.l1 || 'Compare prices across tabs', size: 28, dot: true });
    if (t >= cmpAt + 1.7) K.drawLabel(ctx, 330, 1000, K.popIn(t, cmpAt + 1.7, 0.4), { text: P.best || 'Lowest price', size: 30, accent: true });
  } else {
    const f = U.form(ctx, C.x + 60, C.y + 14, C.w - 120, [{ k: 'Name', v: 'Sam Lee' }, { k: 'Email', v: 'sam@example.com' }, { k: 'Event', v: 'Saturday workshop' }], t, formAt + 0.4, 0.5, { title: P.formTitle || 'Event sign-up', submit: true, small: true });
    // cursor glides toward Submit, stops short
    const reach = smooth(clamp((t - (formAt + 2.4)) / Math.max(0.3, stopAt - formAt - 2.4)));
    const halt = t >= stopAt;
    const cx0 = C.x + 120, cy0 = C.y + 120, sx = f.submit.x - 250, sy = f.submit.y + 4;
    U.cursor(ctx, lerp(cx0, sx, reach), lerp(cy0, sy, reach), 1.1);
    if (halt) {
      U.stopSign(ctx, f.submit.x - 165, f.submit.y, K.popIn(t, stopAt, 0.4));
      K.drawLabel(ctx, 330, 1000, K.popIn(t, stopAt + 0.15, 0.4), { text: P.stopText || 'Stops before submitting', size: 28, accent: true });
    }
    K.drawLabel(ctx, 487, 492, K.popIn(t, formAt, 0.4), { text: P.l2 || "The maker's own example", size: 28, dot: true });
  }
  K.drawRobot(ctx, 835, 1040, 0.8, { t, state: (t > cmpAt + 1.7 && t < formAt) || t > stopAt + 0.5 ? 'happy' : 'working', seed: 8 });
}

function atlas(ctx, t, info, K, H, P, D, tc, U) {
  const { clamp, smooth, lerp } = H;
  const shutAt = tc(P.shutCue || 'shut', D * 0.2) - 0.1, dateAt = tc(P.dateCue || 'august', D * 0.5) - 0.1, moveAt = tc(P.moveCue || 'tricks', D * 0.68) - 0.2;
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 420, y: 720 }, { t: D, zoom: 1.0 }]);
  K.world.city(ctx, { t, time: 'night', groundY: 1000 });
  // left: the closed-down browser; right: the user's own browser
  const L = { x: 80, y: 560, w: 380, h: 300 }, R = { x: 500, y: 530, w: 410, h: 330 };
  const off = smooth(clamp((t - shutAt) / 0.5));
  const CL = U.browser(ctx, L, { t, tabs: [{ text: P.atlas || 'Old app' }], dim: off * 0.85 });
  if (off < 1) { ctx.save(); const sq = 1 - off; ctx.translate(CL.x + CL.w / 2, CL.y + CL.h / 2); ctx.scale(1, Math.max(0.02, sq)); ctx.translate(-(CL.x + CL.w / 2), -(CL.y + CL.h / 2)); U.page(ctx, CL); U.text(ctx, P.atlas || 'Old app', CL.x + CL.w / 2, CL.y + CL.h / 2 - 10, K.font.display(52), '#161927', 'center'); U.text(ctx, P.atlasSub || 'browser', CL.x + CL.w / 2, CL.y + CL.h / 2 + 40, K.font.ui(28), '#4a5170', 'center'); ctx.restore(); }
  else { ctx.fillStyle = '#0b0d18'; ctx.fillRect(CL.x, CL.y, CL.w, CL.h); }
  if (t >= shutAt) K.drawStamp(ctx, L.x + L.w / 2, L.y + L.h / 2 + 110, 0.95, { kind: 'cross', text: P.stamp || 'SHUT DOWN', land: clamp((t - shutAt - 0.3) / 0.5) });
  const live = smooth(clamp((t - moveAt - 0.8) / 0.5));
  const CR = U.browser(ctx, R, { t, tabs: ['Mail', 'Shop', 'News'].map((s, i) => ({ text: s, hi: live > 0.5 && i === 0 ? 1 : 0 })), ext: live });
  U.pageLines(ctx, CR, t, 3);
  if (live <= 0) K.drawLabel(ctx, R.x + R.w / 2, R.y + R.h + 70, K.popIn(t, 0.4, 0.4), { text: P.mine || 'The browser you already use', size: 26 });
  K.drawLabel(ctx, L.x + L.w / 2, L.y - 22, K.popIn(t, dateAt, 0.4), { text: P.dateText || 'Shutting down', size: 30, accent: true });
  // robot: inside the left window, pops out when it shuts, hops to the right at moveAt
  let rx, ry, rs = 0.9, st = 'idle';
  if (t < shutAt) { rx = L.x + L.w - 60; ry = L.y + L.h - 8; rs = 0.5; st = 'working'; }
  else if (t < moveAt) { const j = smooth(clamp((t - shutAt) / 0.6)); rx = lerp(L.x + L.w - 70, 300, j); ry = lerp(L.y + L.h - 10, 1035, j) - Math.sin(j * Math.PI) * 120; rs = lerp(0.55, 0.85, j); st = 'thinking'; }
  else { const j = smooth(clamp((t - moveAt) / 0.9)); rx = lerp(300, 850, j); ry = lerp(1035, 1035, j) - Math.sin(j * Math.PI) * 300; rs = 0.85; st = j >= 1 ? 'happy' : 'working'; if (j > 0 && j < 1) for (let i = 0; i < 6; i++) K.glow(ctx, lerp(300, 850, Math.max(0, j - i * 0.05)), 1035 - 120 - Math.sin(Math.max(0, j - i * 0.05) * Math.PI) * 300, 30, K.ACCENT.base, 0.4 * (1 - i / 6)); }
  K.drawRobot(ctx, rx, ry, rs, { t, state: st, seed: 5 });
  if (live > 0) K.drawLabel(ctx, 560, 985, K.popIn(t, moveAt + 1.0, 0.4), { text: P.nowIn || 'Now in your own browser', size: 26, accent: true });
}

function trust(ctx, t, info, K, H, P, D, tc, U) {
  const { clamp, smooth } = H;
  const names = P.tabNames || ['Email', 'Banking', 'Work'];
  const cues = (P.cues || names).map((c, i) => tc(c, D * (0.2 + i * 0.1)) - 0.15);
  const thinkAt = tc(P.thinkCue || 'think', 0.2) - 0.1, guideAt = tc(P.guideCue || 'guide', D * 0.62) - 0.2;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 560, y: 720 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false });
  const B = { x: 300, y: 560, w: 605, h: 360 };
  const tabs = names.map((s, i) => ({ text: s, hi: t >= cues[i] ? 1 : 0 }));
  const pk = smooth(clamp((t - guideAt) / 0.6));
  K.drawRobot(ctx, 790, B.y + 260 - 150 * pk, 1.0, { t, state: 'thinking', seed: 4 });
  const C = U.browser(ctx, B, { t, tabs, active: Math.max(0, cues.filter((c) => t >= c).length - 1) });
  U.page(ctx, C);
  const tw = (C.w - 40) / 3;
  names.forEach((nm, i) => {
    const pop = K.popIn(t, cues[i], 0.4); if (pop <= 0) return;
    const x = C.x + 20 + i * tw + tw / 2, y = C.y + C.h / 2 - 10;
    ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop);
    H.roundRect(ctx, -tw / 2 + 10, -90, tw - 20, 180, 18); ctx.fillStyle = '#dfe4f1'; ctx.fill();
    if (i === 0) U.envelope(ctx, 0, -20, 1); else if (i === 1) U.bank(ctx, 0, -20, 1); else K.drawBriefcase(ctx, 0, 30, 0.5);
    U.text(ctx, nm, 0, 62, K.font.bold(26), '#161927', 'center');
    if (pk > 0) { const b = K.popIn(t, guideAt + 0.2 + i * 0.15, 0.35); if (b > 0) { ctx.save(); ctx.translate(0, -100); ctx.scale(b, b); H.roundRect(ctx, -70, -20, 140, 40, 20); ctx.fillStyle = K.ACCENT.base; ctx.fill(); U.text(ctx, P.badge || 'Signed in', 0, 1, K.font.ui(22), K.ACCENT.deep, 'center'); ctx.restore(); } }
    ctx.restore();
  });
  if (pk > 0) U.beam(ctx, 790, B.y - 90, C.x + C.w / 2, C.y + C.h / 2, 0.35 * pk);
  K.drawPerson(ctx, 170, 1035, 1.45, { t, pose: t > cues[1] && t < guideAt ? 'shrug' : 'stand', mood: t > thinkAt + 0.5 ? 'worried' : 'neutral', look: 0.6, skin: 0, hair: 2, hairStyle: 'long', shirt: 3, seed: 7 });
  K.drawLabel(ctx, 487, 492, K.popIn(t, 0.25, 0.4), { text: P.head || "What's in your tabs?", size: 30, dot: true });
  if (t >= guideAt) U.card(ctx, 600, 1030, 590, 84, K.popIn(t, guideAt + 0.6, 0.4), P.guide || "The guide: it can act where you're signed in", false);
}

function permit(ctx, t, info, K, H, P, D, tc, U) {
  const { clamp, smooth, lerp } = H;
  const askAt = tc(P.askCue || 'asks', 1.0) - 0.2;
  const o1 = tc(P.tapCue || 'once', D * 0.32) - 0.25;
  const allowT = [o1, tc('allow', D * 0.4, 1) - 0.1, tc('allow', D * 0.5, 2) - 0.1, tc('decline', D * 0.6) - 0.1];
  const alwaysAt = tc(P.alwaysCue || 'always', D * 0.72) - 0.2;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 700 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false });
  const B = { x: 90, y: 505, w: 815, h: 345 };
  const C = U.browser(ctx, B, { t, tabs: ['New site', 'Mail', 'Shop'].map((s) => ({ text: s })), active: 0 });
  U.pageLines(ctx, C, t, 4);
  ctx.fillStyle = 'rgba(14,16,28,0.45)'; ctx.fillRect(C.x, C.y, C.w, C.h);
  const btns = P.buttons || ['Allow once', 'Allow for this site', 'Allow for all sites', 'Decline'];
  let lit = -1; allowT.forEach((a, i) => { if (t >= a) lit = i; });
  const phase2 = t >= alwaysAt;
  // dialog
  const dp = K.popIn(t, askAt, 0.45);
  if (dp > 0 && !phase2) {
    ctx.save(); ctx.translate(C.x + C.w / 2, C.y + C.h / 2); ctx.scale(dp, dp);
    const w = 600, h = 220;
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; H.roundRect(ctx, -w / 2 + 6, -h / 2 + 8, w, h, 20); ctx.fill();
    H.roundRect(ctx, -w / 2, -h / 2, w, h, 20); ctx.fillStyle = '#f5f7fc'; ctx.fill();
    U.text(ctx, P.dialog || 'Let the assistant use this site?', 0, -h / 2 + 38, K.font.bold(28), '#161927', 'center');
    btns.forEach((b, i) => {
      const bx = -w / 2 + 20 + (i % 2) * ((w - 50) / 2 + 10), by = -h / 2 + 72 + Math.floor(i / 2) * 68, bw = (w - 50) / 2;
      const on = i === lit;
      H.roundRect(ctx, bx, by, bw, 54, 27); ctx.fillStyle = on ? (i === 3 ? '#ff6b5e' : K.ACCENT.base) : '#dfe4f1'; ctx.fill();
      U.text(ctx, b, bx + bw / 2, by + 28, K.font.ui(23), on ? (i === 3 ? '#ffffff' : K.ACCENT.deep) : '#2a2f45', 'center');
    });
    ctx.restore();
    if (lit >= 0) { const i = lit, bx = C.x + C.w / 2 - 300 + 20 + (i % 2) * 285 + 200, by = C.y + C.h / 2 - 110 + 72 + Math.floor(i / 2) * 68 + 40; U.cursor(ctx, bx, by + 2 * Math.sin(t * 6), 1); }
  }
  if (phase2) {
    const rows = [[P.r1 || 'Browsing history', 'clock'], [P.r2 || 'Downloads', 'down']];
    rows.forEach(([txt, ic], i) => {
      const p = K.popIn(t, alwaysAt + 0.2 + i * 0.6, 0.4); if (p <= 0) return;
      const y = C.y + 60 + i * 115;
      ctx.save(); ctx.translate(C.x + C.w / 2, y + 45); ctx.scale(p, p);
      H.roundRect(ctx, -330, -45, 660, 90, 22); ctx.fillStyle = '#f5f7fc'; ctx.fill();
      if (ic === 'clock') K.drawClock(ctx, -280, 30, 0.45, { t, speed: 0 }); else U.arrowDown(ctx, -280, -24, 0.7);
      U.text(ctx, txt, -225, 2, K.font.bold(30), '#161927', 'left');
      K.drawLock(ctx, 140, 30, 0.45, { open: 0 });
      H.roundRect(ctx, 175, -24, 140, 48, 24); ctx.fillStyle = K.ACCENT.base; ctx.fill();
      U.text(ctx, P.asks || 'Asks first', 245, 1, K.font.ui(22), K.ACCENT.deep, 'center');
      ctx.restore();
    });
  }
  // gate barrier below: lifts while an "allow" button is lit, drops on decline
  const open = lit >= 0 && lit < 3 && !phase2 ? smooth(clamp((t - allowT[lit]) / 0.4)) : 0;
  const closeAgain = lit === 3 || phase2 ? 1 : 0;
  const ang = -1.2 * open * (1 - closeAgain);
  const gx = 560, gy = 985;
  H.roundRect(ctx, gx - 16, gy - 90, 32, 100, 8); ctx.fillStyle = '#3b4260'; ctx.fill();
  ctx.save(); ctx.translate(gx, gy - 70); ctx.rotate(ang);
  for (let i = 0; i < 6; i++) { ctx.fillStyle = i % 2 ? '#f2f4fa' : '#ff6b5e'; ctx.fillRect(i * 50 - 300, -10, 50, 20); }
  ctx.restore();
  K.drawRobot(ctx, lerp(820, 760, open * (1 - closeAgain)), 1040, 0.85, { t, state: open > 0.5 && !closeAgain ? 'happy' : 'idle', seed: 2 });
  K.drawLabel(ctx, 487, 492, K.popIn(t, 0.2, 0.4), { text: phase2 ? (P.head2 || 'Always asks first') : (P.head1 || 'By default: it asks'), size: 30, accent: phase2, dot: !phase2 });
}

function payoff(ctx, t, info, K, H, P, D, tc, U) {
  const { clamp, smooth, lerp } = H;
  const qAt = tc(P.qCue || 'would', D * 0.45) - 0.2, closeAt = tc(P.closeCue || 'close', D * 0.65) - 0.2;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 520, y: 700 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false });
  const B = { x: 290, y: 560, w: 620, h: 330 };
  const names = P.tabs || ['Mail', 'Banking', 'Shop'];
  const bankI = Math.max(0, names.indexOf(P.target || 'Banking'));
  const tabs = names.map((s, i) => ({ text: s, hi: i === bankI ? 1 : 0, close: i === bankI ? 1 : 0 }));
  K.drawRobot(ctx, 780, B.y + 120, 1.0, { t, state: 'idle', seed: 4 });
  const C = U.browser(ctx, B, { t, tabs, active: bankI });
  U.page(ctx, C); U.bank(ctx, C.x + C.w / 2, C.y + C.h / 2 - 20, 1.2);
  U.text(ctx, P.page || 'Your bank', C.x + C.w / 2, C.y + C.h / 2 + 80, K.font.bold(30), '#161927', 'center');
  // cursor drifts toward the Banking tab's close button
  const tx = U.tabCenter(B, names.length, bankI) + U.tabW(B, names.length) / 2 - 22, ty = B.y + 28;
  const r = smooth(clamp((t - closeAt) / 0.7));
  U.cursor(ctx, lerp(C.x + 200, tx + 4, r), lerp(C.y + 220, ty + 8, r), 1.1);
  if (r >= 1) K.glow(ctx, tx, ty, 50, K.ACCENT.base, 0.4 + 0.25 * Math.sin(t * 6));
  K.drawPerson(ctx, 170, 1035, 1.45, { t, pose: 'stand', mood: 'neutral', look: 0.6, skin: 3, hair: 0, hairStyle: 'short', shirt: 0, seed: 11 });
  K.drawLabel(ctx, 487, 492, K.popIn(t, 0.2, 0.4), { text: P.head || 'Your tabs, your call', size: 30, dot: true });
  const qp = K.popIn(t, qAt, 0.45);
  if (qp > 0) {
    ctx.save(); ctx.translate(600, 975); ctx.scale(qp, qp);
    H.roundRect(ctx, -290, -60, 580, 120, 24); ctx.fillStyle = 'rgba(10,12,22,0.9)'; ctx.fill();
    ctx.strokeStyle = K.ACCENT.base; ctx.lineWidth = 3; ctx.stroke();
    const a = P.a || 'Let it in', b = P.b || 'Close the tab';
    H.roundRect(ctx, -270, -36, 250, 72, 36); ctx.fillStyle = K.ACCENT.base; ctx.fill();
    U.text(ctx, a, -145, 1, K.font.bold(28), K.ACCENT.deep, 'center');
    U.text(ctx, 'or', 0, 1, K.font.ui(26), '#ffffff', 'center');
    H.roundRect(ctx, 20, -36, 250, 72, 36); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    U.text(ctx, b, 145, 1, K.font.bold(28), '#161927', 'center');
    ctx.restore();
  }
}

// ------------------------------------------------------------------ shared drawing helpers (no logos, generic shapes)
function utils(K, H, info) {
  const TAU = Math.PI * 2, A = K.ACCENT;
  const rr = (ctx, x, y, w, h, r, fill) => { H.roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); };
  const circle = (ctx, x, y, r, fill) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); };
  function text(ctx, s, x, y, font, color, align = 'left') { ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); }
  function fit(ctx, s, maxW) { if (ctx.measureText(s).width <= maxW) return s; let r = s; while (r.length > 1 && ctx.measureText(r + '…').width > maxW) r = r.slice(0, -1); return r + '…'; }
  const tabW = (B, n) => Math.min(190, (B.w - 30) / n);
  const tabCenter = (B, n, i) => B.x + 14 + tabW(B, n) * (i + 0.5);
  // Browser window: dark frame, tab strip, toolbar, light page. o: tabs [{text, hi, group, close}], pos (slot per tab),
  // active, ext (extension piece glow 0..1), dim, groups [{from, to, text, col}], groupA. Returns the page rect.
  function browser(ctx, B, o = {}) {
    const t = o.t || 0, tabs = o.tabs || [], n = Math.max(1, tabs.length), tw = tabW(B, n);
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; H.roundRect(ctx, B.x + 8, B.y + 12, B.w, B.h, 22); ctx.fill();
    rr(ctx, B.x, B.y, B.w, B.h, 22, '#1c2033');
    // groups (coloured bracket labels above tabs)
    tabs.forEach((tb, i) => {
      const slot = o.pos ? o.pos[i] : i, x = B.x + 14 + tw * slot, y = B.y + 8, act = i === (o.active || 0);
      const fill = tb.group || (act ? '#323a5c' : '#262b44');
      rr(ctx, x + 2, y, tw - 4, 46, 12, fill);
      if (tb.hi) { ctx.strokeStyle = A.base; ctx.lineWidth = 3; H.roundRect(ctx, x + 3, y + 1, tw - 6, 44, 11); ctx.stroke(); K.glow(ctx, x + tw / 2, y + 23, tw * 0.6, A.base, 0.18 * tb.hi); }
      circle(ctx, x + 22, y + 23, 8, tb.hi ? A.base : '#8a93a8');
      ctx.font = K.font.ui(23); const s = fit(ctx, String(tb.text), tw - (tb.close ? 64 : 44));
      text(ctx, s, x + 36, y + 24, K.font.ui(23), tb.group ? '#10131f' : '#e7eaf3', 'left');
      if (tb.close) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; const cx = x + tw - 22, cy = y + 23; ctx.beginPath(); ctx.moveTo(cx - 7, cy - 7); ctx.lineTo(cx + 7, cy + 7); ctx.moveTo(cx + 7, cy - 7); ctx.lineTo(cx - 7, cy + 7); ctx.stroke(); }
    });
    if (o.groups && o.groupA > 0) o.groups.forEach((g) => {
      const x0 = B.x + 14 + tw * g.from, x1 = B.x + 14 + tw * (g.to + 1);
      ctx.globalAlpha = o.groupA; rr(ctx, x0 + 4, B.y + B.h + 14, x1 - x0 - 8, 8, 4, g.col);
      text(ctx, g.text, (x0 + x1) / 2, B.y + B.h + 44, K.font.bold(28), g.col, 'center'); ctx.globalAlpha = 1;
    });
    // toolbar
    const ty = B.y + 58;
    rr(ctx, B.x + 8, ty, B.w - 16, 44, 10, '#2a3048');
    circle(ctx, B.x + 34, ty + 22, 9, '#5a6384'); circle(ctx, B.x + 62, ty + 22, 9, '#5a6384');
    rr(ctx, B.x + 86, ty + 8, B.w - 170, 28, 14, '#161a2c');
    rr(ctx, B.x + 104, ty + 16, 10, 12, 2, '#8a93a8');
    rr(ctx, B.x + 124, ty + 19, Math.min(240, B.w * 0.3), 7, 3, '#4a5170');
    // extension piece (generic puzzle shape)
    const ex = B.x + B.w - 44, ey = ty + 22, e = o.ext || 0;
    if (e > 0) K.glow(ctx, ex, ey, 46, A.base, 0.5 * e);
    ctx.fillStyle = e > 0.5 ? A.base : '#8a93a8'; rr(ctx, ex - 11, ey - 9, 22, 20, 4, ctx.fillStyle); circle(ctx, ex, ey - 11, 5, ctx.fillStyle); circle(ctx, ex + 12, ey + 1, 5, ctx.fillStyle);
    const C = { x: B.x + 8, y: B.y + 110, w: B.w - 16, h: B.h - 118 };
    if (o.dim) { ctx.globalAlpha = o.dim; rr(ctx, B.x, B.y, B.w, B.h, 22, '#0b0d18'); ctx.globalAlpha = 1; }
    ctx.restore();
    return C;
  }
  function page(ctx, C) { rr(ctx, C.x, C.y, C.w, C.h, 12, '#eef1f8'); }
  function pageLines(ctx, C, t, seed) {
    page(ctx, C);
    rr(ctx, C.x + 30, C.y + 26, C.w * 0.45, 24, 8, '#2a2f45');
    const rows = Math.floor((C.h - 80) / 34);
    for (let i = 0; i < rows; i++) rr(ctx, C.x + 30, C.y + 74 + i * 34, (C.w - 60) * (0.55 + 0.4 * H.hash(i, seed + 3)), 12, 6, '#c3cadd');
    rr(ctx, C.x + C.w - 30 - C.w * 0.28, C.y + 70, C.w * 0.28, Math.min(150, C.h - 100), 12, '#d5dae8');
  }
  function beam(ctx, x0, y0, x1, y1, a) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, H.rgba(A.base, 0.55 * a)); g.addColorStop(1, H.rgba(A.base, 0.12 * a));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0 - 12, y0); ctx.lineTo(x1 - 60, y1); ctx.lineTo(x1 + 60, y1); ctx.lineTo(x0 + 12, y0); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function cursor(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s * 1.4, s * 1.4);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 30); ctx.lineTo(8, 23); ctx.lineTo(14, 36); ctx.lineTo(19, 34); ctx.lineTo(13, 21); ctx.lineTo(23, 21); ctx.closePath();
    ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#161927'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.restore();
  }
  function card(ctx, x, y, w, h, p, s, accent) {
    if (p <= 0) return;
    ctx.save(); ctx.translate(x, y - h / 2); ctx.scale(p, p);
    rr(ctx, -w / 2, -h / 2, w, h, h / 2, accent ? A.base : 'rgba(10,12,22,0.9)');
    if (!accent) { ctx.strokeStyle = A.base; ctx.lineWidth = 3; H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.stroke(); }
    let fs = 30; ctx.font = K.font.bold(fs); while (fs > 20 && ctx.measureText(s).width > w - 50) { fs -= 1; ctx.font = K.font.bold(fs); }
    text(ctx, s, 0, 1, K.font.bold(fs), accent ? A.deep : '#ffffff', 'center');
    ctx.restore();
  }
  function chip(ctx, x, y, w, s, p, done) {
    if (p <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
    rr(ctx, -w / 2, -26, w, 52, 26, done > 0 ? H.mixHex('#2a2f45', A.base, done) : 'rgba(10,12,22,0.86)');
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 1.5; H.roundRect(ctx, -w / 2, -26, w, 52, 26); ctx.stroke();
    text(ctx, s, done > 0 ? 12 : 0, 1, K.font.ui(22), done > 0.5 ? A.deep : '#ffffff', 'center');
    if (done > 0) { ctx.strokeStyle = A.deep; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-w / 2 + 16, 0); ctx.lineTo(-w / 2 + 23, 8); ctx.lineTo(-w / 2 + 36, -8); ctx.stroke(); }
    ctx.restore();
  }
  function tick(ctx, x, y, col) { ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x - 2, y + 9); ctx.lineTo(x + 13, y - 9); ctx.stroke(); }
  function bubbleR(ctx, x, y, s, size) {
    ctx.font = K.font.ui(size); const w = Math.min(420, ctx.measureText(s).width + 40);
    rr(ctx, x - w, y - 28, w, 56, 24, A.base); text(ctx, s, x - w / 2, y + 1, K.font.ui(size), A.deep, 'center');
  }
  // form rows [{k, v}] filling from t0, `each` s per row. Returns {submit: {x, y}}.
  function form(ctx, x, y, w, rows, t, t0, each, o = {}) {
    const rh = o.small ? 52 : 74;
    text(ctx, o.title || 'Form', x, y + 20, K.font.bold(30), '#161927', 'left');
    rows.forEach((r, i) => {
      const ry = y + 50 + i * rh;
      text(ctx, r.k, x, ry + 24, K.font.ui(22), '#4a5170', 'left');
      rr(ctx, x + 110, ry + 4, w - 110, 42, 10, '#ffffff'); ctx.strokeStyle = '#c3cadd'; ctx.lineWidth = 2; H.roundRect(ctx, x + 110, ry + 4, w - 110, 42, 10); ctx.stroke();
      const s = K.typewriter(r.v, t, 24, t0 + i * each);
      if (s) text(ctx, s, x + 126, ry + 26, K.font.ui(24), '#161927', 'left');
    });
    const sy = y + 50 + rows.length * rh + 6, sx = x + w - 90;
    if (o.submit) { rr(ctx, sx - 90, sy, 180, 48, 24, '#2a2f45'); text(ctx, 'Submit', sx, sy + 25, K.font.bold(24), '#ffffff', 'center'); }
    return { submit: { x: sx, y: sy + 24 } };
  }
  function stopSign(ctx, x, y, p) {
    if (p <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
    ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; ctx.lineTo(Math.cos(a) * 52, Math.sin(a) * 52); } ctx.closePath();
    ctx.fillStyle = '#ff6b5e'; ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.stroke();
    text(ctx, 'STOP', 0, 2, K.font.display(26), '#ffffff', 'center');
    ctx.restore();
  }
  function sneaker(ctx, x, y, s, i) {
    const cols = ['#6f86e0', '#e8786a', '#4fb3a6', '#a08be0', '#ffcc33'];
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-60, 20); ctx.lineTo(-60, -10); ctx.quadraticCurveTo(-40, -40, -14, -36); ctx.lineTo(10, -8); ctx.quadraticCurveTo(50, -4, 62, 14); ctx.lineTo(62, 20); ctx.closePath();
    ctx.fillStyle = cols[i % 5]; ctx.fill();
    rr(ctx, -64, 16, 130, 14, 7, '#f2f4fa');
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(-26 + k * 10, -28 + k * 6); ctx.lineTo(-14 + k * 10, -24 + k * 6); ctx.stroke(); }
    ctx.restore();
  }
  function fileIcon(ctx, x, y, s, label) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-50, -70); ctx.lineTo(25, -70); ctx.lineTo(50, -45); ctx.lineTo(50, 70); ctx.lineTo(-50, 70); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = '#c3cadd'; ctx.lineWidth = 3; ctx.stroke();
    rr(ctx, -40, 10, 80, 34, 8, '#ff6b5e'); text(ctx, label, 0, 28, K.font.bold(22), '#ffffff', 'center');
    for (let i = 0; i < 3; i++) rr(ctx, -34, -46 + i * 16, 60, 7, 3, '#c3cadd');
    ctx.restore();
  }
  function arrowDown(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = A.shade; ctx.fillRect(-12, 0, 24, 50); ctx.beginPath(); ctx.moveTo(-30, 46); ctx.lineTo(30, 46); ctx.lineTo(0, 80); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function envelope(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    rr(ctx, -55, -36, 110, 72, 8, '#6f86e0'); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-50, -30); ctx.lineTo(0, 8); ctx.lineTo(50, -30); ctx.stroke(); ctx.restore();
  }
  function bank(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(-60, -20); ctx.lineTo(0, -52); ctx.lineTo(60, -20); ctx.closePath(); ctx.fillStyle = '#4fb3a6'; ctx.fill();
    for (let i = 0; i < 4; i++) rr(ctx, -48 + i * 28, -14, 14, 46, 3, '#4fb3a6');
    rr(ctx, -64, 34, 128, 12, 4, '#3a8f84'); circle(ctx, 0, -32, 6, '#ffffff');
    ctx.restore();
  }
  return { rr, circle, text, fit, tabW, tabCenter, browser, page, pageLines, beam, cursor, card, chip, tick, bubbleR, form, stopSign, sneaker, fileIcon, arrowDown, envelope, bank };
}
