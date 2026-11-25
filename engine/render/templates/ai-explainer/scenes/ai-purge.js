// Scene "ai-purge" (full frame). A streaming app removes fully AI-made songs. Songs are square tiles: robot-face
// "AI" tiles (accent) and music-note "human" tiles (white). Generic app, no logos, no real people.
// modes:
//  purge  (best as a 2-beat span: cold open + what happened) a generic music-app library window on the wall; AI
//         tiles pop out of the grid and arc into a big DELETE bin while a counter races to `value`, DELETED stamp;
//         beat 2: calendar `date` pops, a scan line sweeps the grid tagging the rest `tag`, they fly into the bin too,
//         only note tiles remain, `gone` pill, the worker cheers.
//  gate   June panel: an AI tile gets an "AI" sticker, its royalty coin is crossed out (`noPay`), more tiles pile in
//         anyway (`fail`); then a box truck (`truck` text on the side) backs up to the app's loading gate, the barrier
//         drops, REJECTED stamp, boxes bounce back, a per-day counter card (`count`, `countLabel`).
//  listen a listener with a phone; AI tiles each show "0 plays"; `pct` stat card; AI tiles rain onto a big note tile
//         until it is buried (`buried`); then a desk panel: a person making music with a little robot helper,
//         `helped` tile, ALLOWED check stamp.
//  caveat conveyor through a detector arch with a scanning robot; chips "Detection tool" / "Metadata"; title pill;
//         a disguised AI tile slips through (`slip`), then a note tile gets wrongly flagged (`flag`), artist shocked.
// params: mode, plus per mode (all text): purge: app, value, unit, stamp, date, tag, gone + cues dateCue, tagCue,
//         goneCue; gate: june, tagText, noPay, fail, truck, stamp, count, countLabel + cues juneCue, payCue, failCue,
//         truckCue, countCue; listen: pct, pctLabel, buried, helped, ok + cues pctCue, buryCue, helpCue, okCue;
//         caveat: title, tool, meta, slip, flag + cues titleCue, toolCue, metaCue, slipCue, flagCue.
// Defaults are generic placeholders ("MUSIC APP", 1,000,000, "DATE", "MONTH", "X,XXX", "X%"): pass the story's
// names and published figures. Cues are narration words ("word#n" = the (n+1)th time); without them, fractions.
// Fits: content purges / bans on a platform, upload floods, detection and false positives, "AI-assisted is allowed".
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic, roundRect, rgba, mixHex } = H;
  const D = info.duration, ACC = info.accent, DANGER = K.NEUTRAL.danger || '#ff6b5e';
  const at = (w, d) => {
    if (!w) return d;
    const [word, n] = String(w).split('#');
    const v = info.timeOf(word, n ? +n : 0);
    return v == null ? d : v;
  };
  const mode = P.mode || 'purge';

  // ---------- shared drawing helpers ----------
  function tile(x, y, s, kind, rot = 0, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; roundRect(ctx, -46, -42, 100, 100, 18); ctx.fill();
    roundRect(ctx, -50, -50, 100, 100, 18); ctx.fillStyle = kind === 'ai' ? ACC : '#f2f4fa'; ctx.fill();
    ctx.strokeStyle = o.flag ? DANGER : 'rgba(0,0,0,0.25)'; ctx.lineWidth = o.flag ? 8 : 4; ctx.stroke();
    if (kind === 'ai') {
      roundRect(ctx, -30, -24, 60, 46, 12); ctx.fillStyle = '#ffffff'; ctx.fill();
      roundRect(ctx, -22, -14, 44, 22, 8); ctx.fillStyle = '#161927'; ctx.fill();
      ctx.fillStyle = ACC; ctx.fillRect(-14, -7, 8, 8); ctx.fillRect(6, -7, 8, 8);
      ctx.fillStyle = '#161927'; ctx.fillRect(-2, -34, 4, 10); ctx.beginPath(); ctx.arc(0, -36, 5, 0, Math.PI * 2); ctx.fill();
    } else {
      note(0, 0, 1, '#161927');
    }
    if (o.disguise) { // a paper note stuck over the robot face
      ctx.save(); ctx.rotate(-0.12); roundRect(ctx, -38, -30, 76, 60, 8); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      note(0, 2, 0.7, '#161927'); ctx.restore();
    }
    if (o.plays != null) {
      roundRect(ctx, -46, 54, 92, 30, 15); ctx.fillStyle = 'rgba(10,12,22,0.9)'; ctx.fill();
      ctx.font = K.font.ui(18); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
      ctx.fillText(o.plays, 0, 70);
    }
    if (o.helper) { // little robot badge in the corner (AI help)
      ctx.beginPath(); ctx.arc(36, -36, 22, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
      ctx.strokeStyle = '#161927'; ctx.lineWidth = 3; ctx.stroke();
      roundRect(ctx, 24, -44, 24, 14, 5); ctx.fillStyle = '#161927'; ctx.fill();
      ctx.fillStyle = ACC; ctx.fillRect(29, -40, 4, 4); ctx.fillRect(39, -40, 4, 4);
    }
    if (o.cross > 0) {
      ctx.strokeStyle = DANGER; ctx.lineWidth = 12; ctx.lineCap = 'round'; const c = o.cross;
      ctx.beginPath(); ctx.moveTo(-34, -34); ctx.lineTo(lerp(-34, 34, clamp(c * 2)), lerp(-34, 34, clamp(c * 2))); ctx.stroke();
      if (c > 0.5) { ctx.beginPath(); ctx.moveTo(34, -34); ctx.lineTo(lerp(34, -34, clamp(c * 2 - 1)), lerp(-34, 34, clamp(c * 2 - 1))); ctx.stroke(); }
    }
    ctx.restore();
  }
  function note(x, y, s, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-4, 22); ctx.lineTo(-4, -26); ctx.lineTo(22, -32); ctx.lineTo(22, 14); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-14, 24, 13, 10, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(12, 16, 13, 10, -0.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function card(x, y, w, h, pop) { // dark glass card centred at x, y
    const s = Math.min(1.04, pop);
    ctx.translate(x, y); ctx.scale(s, s);
    roundRect(ctx, -w / 2, -h / 2, w, h, 28); ctx.fillStyle = 'rgba(10,12,22,0.88)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.stroke();
  }
  function bin(x, y, s, wob, label) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(wob * 30) * 0.05 * Math.max(0, 1 - wob * 3)); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 200);
    ctx.beginPath(); ctx.moveTo(-95, -190); ctx.lineTo(95, -190); ctx.lineTo(78, 0); ctx.lineTo(-78, 0); ctx.closePath();
    ctx.fillStyle = '#3b4260'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 6;
    for (const u of [-45, 0, 45]) { ctx.beginPath(); ctx.moveTo(u * 1.1, -170); ctx.lineTo(u * 0.9, -20); ctx.stroke(); }
    roundRect(ctx, -110, -212, 220, 30, 12); ctx.fillStyle = '#545d86'; ctx.fill();
    roundRect(ctx, -80, -120, 160, 46, 12); ctx.fillStyle = DANGER; ctx.fill();
    ctx.font = K.font.display(26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#2a0c08';
    ctx.fillText(label || 'DELETE', 0, -96);
    ctx.restore();
  }
  function calendar(x, y, s, text) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    roundRect(ctx, -80, -90, 160, 180, 18); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    roundRect(ctx, -80, -90, 160, 52, 18); ctx.fillStyle = DANGER; ctx.fill();
    ctx.fillStyle = '#161927'; for (const u of [-40, 40]) { roundRect(ctx, u - 6, -104, 12, 30, 6); ctx.fill(); }
    const [m, d] = String(text || 'DATE').split(' ');
    ctx.font = K.font.display(28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff'; ctx.fillText(m, 0, -63);
    ctx.font = K.font.display(78); ctx.fillStyle = '#161927'; ctx.fillText(d || '', 0, 22);
    ctx.restore();
  }
  function counterCard(x, y, pop, big, small, top) {
    if (pop <= 0) return;
    ctx.save(); card(x, y, 640, top ? 196 : 170, pop);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    let dy = 0;
    if (top) { ctx.font = K.font.ui(26); ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillText(top, 0, -66); dy = 10; }
    let fs = 92; ctx.font = K.font.display(fs);
    while (fs > 40 && ctx.measureText(big).width > 590) { fs -= 4; ctx.font = K.font.display(fs); }
    ctx.fillStyle = ACC; ctx.fillText(big, 0, -14 + dy);
    ctx.font = K.font.ui(28); ctx.fillStyle = '#ffffff'; ctx.fillText(small, 0, 56 + dy);
    ctx.restore();
  }
  const arc = (x0, y0, x1, y1, u, lift) => [lerp(x0, x1, u), lerp(y0, y1, u) - Math.sin(u * Math.PI) * lift];

  ctx.save();
  if (mode === 'purge') purge();
  else if (mode === 'gate') gate();
  else if (mode === 'listen') listen();
  else caveat();
  ctx.restore();

  // ======================================================================================== purge
  function purge() {
    const b2 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.22;
    const T = { date: at(P.dateCue, Math.min(b2 + 4, lerp(b2, D, 0.35))), tag: at(P.tagCue, Math.min(b2 + 7, lerp(b2, D, 0.6))),
      gone: at(P.goneCue, Math.min(b2 + 10.4, lerp(b2, D, 0.88))) };
    K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 740 }, { t: b2, zoom: 1.0, x: 487, y: 730 }, { t: D, zoom: 1.04, x: 487, y: 740 }]);
    K.world.room(ctx, { t, time: 'night', floorY: 900, window: false, lamp: false, picture: false, plant: false });

    // app window on the wall
    const WX = 110, WY = 580, WW = 600, WH = 330;
    roundRect(ctx, WX - 6, WY - 6, WW + 12, WH + 12, 26); ctx.fillStyle = '#0b0d18'; ctx.fill();
    roundRect(ctx, WX, WY, WW, WH, 22); ctx.fillStyle = '#161a2e'; ctx.fill();
    roundRect(ctx, WX, WY, WW, 52, 22); ctx.fillStyle = '#232846'; ctx.fill();
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(WX + 28 + i * 24, WY + 26, 7, 0, Math.PI * 2); ctx.fillStyle = ['#ff6b5e', '#ffcc33', '#3ddc84'][i]; ctx.fill(); }
    ctx.font = K.font.ui(24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
    ctx.fillText(P.app || 'MUSIC APP', WX + WW / 2, WY + 27);

    // grid 6 x 2 tiles
    const COLS = 6, ROWS = 2, GX0 = WX + 60, GY0 = WY + 115, DX = 96, DY = 120;
    const kinds = ['ai', 'human', 'ai', 'ai', 'human', 'ai', 'ai', 'ai', 'human', 'ai', 'ai', 'human'];
    const aiIdx = kinds.map((k, i) => (k === 'ai' ? i : -1)).filter((i) => i >= 0); // 8 AI tiles
    // removal schedule: first 4 in the cold open, the rest after the tag cue
    const first = [0, 6, 3, 9], rest = aiIdx.filter((i) => !first.includes(i));
    const leaveAt = {};
    first.forEach((i, k) => (leaveAt[i] = 0.05 + k * 0.42 - 0.3));
    const restStart = T.tag + 0.7, restGap = Math.max(0.3, Math.min(0.55, (T.gone - 0.6 - restStart) / rest.length));
    rest.forEach((i, k) => (leaveAt[i] = restStart + k * restGap));
    const FLY = 0.75, BX = 765, BY = 1040, MOUTH = [BX, BY - 200];
    // scan line (beat 2)
    const scanU = clamp((t - T.tag + 0.2) / 0.9);
    let lastLand = -10;
    for (let i = 0; i < COLS * ROWS; i++) {
      const c = i % COLS, r = Math.floor(i / COLS), gx = GX0 + c * DX, gy = GY0 + r * DY;
      const k = kinds[i];
      if (k === 'human') { tile(gx, gy, 0.8, 'human'); continue; }
      const L = leaveAt[i], u = (t - L) / FLY;
      if (u >= 1) { lastLand = Math.max(lastLand, L + FLY); continue; }
      if (u <= 0) {
        const tagged = t > T.tag && scanU * (WW + 40) > gx - WX;
        const wig = L - t < 0.35 ? Math.sin(t * 40) * 0.08 : 0;
        tile(gx, gy, 0.8, 'ai', wig);
        if (tagged) {
          roundRect(ctx, gx - 40, gy + 38, 80, 26, 13); ctx.fillStyle = DANGER; ctx.fill();
          ctx.font = K.font.ui(16); ctx.fillStyle = '#2a0c08'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.tag || '100% AI', gx, gy + 52);
        }
      }
    }
    if (scanU > 0 && scanU < 1) {
      const sx = WX + scanU * WW;
      ctx.fillStyle = rgba(ACC, 0.25); ctx.fillRect(sx - 30, WY + 56, 30, WH - 62);
      ctx.fillStyle = ACC; ctx.fillRect(sx - 3, WY + 56, 6, WH - 62);
      K.glow(ctx, sx, WY + WH / 2, 120, ACC, 0.25);
    }
    // bin + flying tiles (flying ones drawn after the bin back so they drop in)
    const wob = clamp((t - lastLand) / 0.6);
    bin(BX, BY, 1.0, lastLand > -5 ? wob : 1, 'DELETE');
    for (let i = 0; i < COLS * ROWS; i++) {
      if (kinds[i] !== 'ai') continue;
      const L = leaveAt[i], u = (t - L) / FLY;
      if (u <= 0 || u >= 1) continue;
      const c = i % COLS, r = Math.floor(i / COLS), gx = GX0 + c * DX, gy = GY0 + r * DY;
      const e = easeOutCubic(u) * 0.4 + u * 0.6;
      const [x, y] = arc(gx, gy, MOUTH[0], MOUTH[1] + 30, e, 150);
      ctx.save();
      if (u > 0.85) { ctx.beginPath(); ctx.rect(0, 0, 1080, MOUTH[1] + 2); ctx.clip(); }
      tile(x, y, lerp(0.8, 0.55, u), 'ai', u * 5);
      ctx.restore();
    }
    // bin front lip so tiles disappear inside
    ctx.save(); ctx.translate(BX, BY); roundRect(ctx, -110, -212, 220, 30, 12); ctx.fillStyle = '#545d86'; ctx.fill(); ctx.restore();

    // worker at the left, pointing, then cheering when it's all gone
    const cheer = t > T.gone + 0.2;
    K.drawPerson(ctx, 180, 1036, 1.2, { t, pose: cheer ? 'cheer' : 'point', mood: cheer ? 'happy' : 'neutral', skin: 3, hair: 2, hairStyle: 'bun', shirt: '#6f86e0', look: 0.5, seed: 4 });

    // counter card (cold open) then calendar + gone pill (beat 2)
    const cOut = 1 - smooth((t - (b2 + 0.2)) / 0.4);
    if (cOut > 0) {
      ctx.save(); ctx.globalAlpha = cOut;
      const v = Math.round((P.value || 1000000) * easeOutCubic(clamp((t + 0.6) / 2.6)) / 10000) * 10000;
      counterCard(487, 470, t < 0.01 ? 1 : Math.max(1, K.popIn(t, 0, 0.3)), v.toLocaleString('en-US'), P.unit || 'AI songs to delete');
      ctx.restore();
      const sl = (t - 1.9) / 0.6;
      if (sl > 0) { ctx.save(); ctx.globalAlpha = cOut; K.drawStamp(ctx, 430, 930, 1.0, { kind: 'cross', text: P.stamp || 'DELETED', land: sl }); ctx.restore(); }
    }
    const dp = K.popIn(t, T.date - 0.15, 0.45);
    if (dp > 0) calendar(830, 520, Math.min(1.05, dp) * 0.95, P.date || 'DATE');
    const gp = K.popIn(t, T.gone - 0.1, 0.45);
    if (gp > 0) K.drawLabel(ctx, 410, 520, Math.min(1, gp), { text: P.gone || 'Gone by DATE', size: 30, accent: true });
  }

  // ======================================================================================== gate
  function gate() {
    const T = { june: at(P.juneCue, 0.3), pay: at(P.payCue, D * 0.22), fail: at(P.failCue, D * 0.35),
      truck: at(P.truckCue, D * 0.45), count: at(P.countCue, D * 0.73) };
    const split = T.truck - 0.3; // phase A -> B
    K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 487, y: 735 }, { t: split, zoom: 1.0, x: 487, y: 730 }, { t: D, zoom: 1.04, x: 520, y: 740 }]);
    K.world.room(ctx, { t, time: 'night', floorY: 900, window: false, lamp: false, picture: false, plant: false });
    const aOut = 1 - smooth((t - split) / 0.45), bIn = smooth((t - split - 0.1) / 0.45);

    // ---- phase A: June label + no royalties + pile keeps growing
    if (aOut > 0) {
      ctx.save(); ctx.globalAlpha = aOut;
      // pedestal
      roundRect(ctx, 300, 900, 200, 136, 12); ctx.fillStyle = '#3b4260'; ctx.fill();
      roundRect(ctx, 286, 888, 228, 24, 10); ctx.fillStyle = '#545d86'; ctx.fill();
      K.shadow(ctx, 400, 1036, 220);
      const tp = K.popIn(t, T.june + 0.2, 0.4);
      tile(400, 790, 1.6, 'ai', 0);
      if (tp > 0) { // sticker slaps on
        ctx.save(); ctx.translate(462, 728); ctx.rotate(0.25); ctx.scale(Math.min(1.1, tp), Math.min(1.1, tp));
        ctx.beginPath(); ctx.arc(0, 0, 42, 0, Math.PI * 2); ctx.fillStyle = DANGER; ctx.fill(); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.stroke();
        ctx.font = K.font.display(30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff'; ctx.fillText(P.tagText || 'AI', 0, 2);
        ctx.restore();
      }
      const jp = K.popIn(t, T.june - 0.15, 0.4);
      if (jp > 0) calendar(200, 560, Math.min(1, jp) * 0.8, P.june || 'MONTH');
      // more tiles keep raining onto a pile (it didn't work)
      const rain = t - (T.fail - 1.0);
      if (rain > 0) {
        for (let i = 0; i < 22; i++) {
          const s0 = i * 0.11, u = clamp((rain - s0) / 0.6);
          if (u <= 0) continue;
          const x = 560 + H.hash(i, 1) * 320, y = 1020 - Math.floor(i / 6) * 34 - H.hash(i, 2) * 12;
          tile(x, lerp(420, y, u * u), 0.5, H.hash(i, 3) < 0.85 ? 'ai' : 'human', (H.hash(i, 4) - 0.5) * (u < 1 ? 3 : 0.8));
        }
      }
      // royalty coin crossed out
      const cp = K.popIn(t, T.pay - 0.3, 0.4);
      if (cp > 0) {
        const cx = 640, cy = 640;
        K.drawCoin(ctx, cx, cy + 40, Math.min(1, cp) * 1.7, { spin: t * 3, shadow: false });
        const cr = clamp((t - T.pay) / 0.35);
        if (cr > 0) {
          ctx.strokeStyle = DANGER; ctx.lineWidth = 14; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.arc(cx, cy - 15, 70, 0, Math.PI * 2 * cr); ctx.stroke();
          if (cr > 0.6) { ctx.beginPath(); ctx.moveTo(cx - 48, cy - 64); ctx.lineTo(cx + 48, cy + 34); ctx.stroke(); }
        }
        const lp = K.popIn(t, T.pay + 0.2, 0.4);
        if (lp > 0) K.drawLabel(ctx, cx, 760, Math.min(1, lp), { text: P.noPay || 'No royalties', size: 26 });
      }
      const fp = K.popIn(t, T.fail - 0.05, 0.4);
      if (fp > 0) { K.drawWarning(ctx, 660, 870, Math.min(1, fp) * 0.6, { pulse: t }); K.drawLabel(ctx, 760, 520, Math.min(1, fp), { text: P.fail || "Didn't work", size: 30, accent: true }); }
      // a worker scratching their head
      K.drawPerson(ctx, 160, 1036, 1.15, { t, pose: t > T.fail ? 'shrug' : 'stand', mood: t > T.fail ? 'worried' : 'neutral', skin: 1, hair: 0, hairStyle: 'short', shirt: '#e07a5f', look: 0.6, seed: 2 });
      ctx.restore();
    }

    // ---- phase B: distributor truck rejected at the gate
    if (bIn > 0) {
      ctx.save(); ctx.globalAlpha = bIn;
      // gate building on the right: wall opening + sign
      const GX = 760;
      roundRect(ctx, GX - 20, 600, 200, 436, 10); ctx.fillStyle = '#1b1f38'; ctx.fill();
      roundRect(ctx, GX, 700, 160, 336, 6); ctx.fillStyle = '#0a0c18'; ctx.fill();
      for (let i = 0; i < 7; i++) { ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fillRect(GX, 712 + i * 46, 160, 4); }
      roundRect(ctx, GX - 10, 616, 180, 60, 12); ctx.fillStyle = '#232846'; ctx.fill();
      ctx.font = K.font.ui(22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff'; ctx.fillText('MUSIC APP', GX + 80, 646);
      // barrier arm drops
      const drop = smooth((t - (T.truck + 1.2)) / 0.35);
      ctx.save(); ctx.translate(GX - 30, 860); ctx.rotate(lerp(-1.35, 0, drop));
      roundRect(ctx, -8, -10, 230, 20, 10); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      ctx.fillStyle = DANGER; for (let k = 0; k < 4; k++) ctx.fillRect(20 + k * 52, -10, 26, 20);
      ctx.restore();
      roundRect(ctx, GX - 44, 840, 28, 196, 8); ctx.fillStyle = '#545d86'; ctx.fill();
      ctx.beginPath(); ctx.arc(GX - 30, 846, 10, 0, Math.PI * 2); ctx.fillStyle = drop > 0.9 ? DANGER : '#ffcc33'; ctx.fill();
      if (drop > 0.9) K.glow(ctx, GX - 30, 846, 40, DANGER, 0.5 + 0.3 * Math.sin(t * 10));

      // truck drives in from the left, stops, then shakes
      const arrive = easeOutCubic(clamp((t - T.truck + 0.2) / 1.2));
      const tx = lerp(-420, 330, arrive) + K.shake(t, T.truck + 1.55, 0.4, 6);
      truck(tx, 1030, P.truck || 'DISTRIBUTOR');
      // boxes try to go in and bounce back
      for (let i = 0; i < 3; i++) {
        const s0 = T.truck + 1.0 + i * 0.25, u = clamp((t - s0) / 0.9);
        if (u <= 0) continue;
        const fwd = u < 0.45 ? u / 0.45 : 1 - (u - 0.45) / 0.55 * 0.8;
        const x = lerp(tx + 200, GX - 70, fwd * 0.85), y = 960 - Math.sin(fwd * Math.PI) * 60 - i * 70 + (u > 0.45 ? (u - 0.45) * 80 : 0);
        box(x, Math.min(y, 1000 - i * 0), 0.9, (u > 0.45 ? -1 : 1) * u * 0.6);
      }
      const sl = (t - (T.truck + 1.6)) / 0.55;
      if (sl > 0) K.drawStamp(ctx, 330, 900, 0.9, { kind: 'cross', text: P.stamp || 'REJECTED', land: sl });
      // gatekeeper
      K.drawPerson(ctx, 880, 1036, 1.05, { t, pose: drop > 0.5 ? 'point' : 'stand', mood: 'neutral', skin: 2, hair: 1, hairStyle: 'short', shirt: '#3ddc84', flip: true, look: -0.8, seed: 6 });
      // per-day counter
      const cp = K.popIn(t, T.count - 0.15, 0.45);
      if (cp > 0) counterCard(487, 500, cp, P.count || 'X,XXX', P.countLabel || 'songs rejected a day');
      ctx.restore();
    }

    function truck(x, y, label) {
      ctx.save(); ctx.translate(x, y);
      K.shadow(ctx, 40, 0, 460);
      roundRect(ctx, -200, -250, 320, 210, 14); ctx.fillStyle = '#e8ebf5'; ctx.fill();
      ctx.fillStyle = '#c9cee0'; ctx.fillRect(-200, -70, 320, 30);
      ctx.font = K.font.display(30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#232846'; ctx.fillText(label, -40, -170);
      // tiny stacked AI tiles printed on the side
      for (let k = 0; k < 3; k++) tile(-120 + k * 80, -110, 0.34, 'ai', 0);
      roundRect(ctx, 120, -190, 110, 150, 14); ctx.fillStyle = '#6f86e0'; ctx.fill();
      roundRect(ctx, 140, -176, 70, 56, 10); ctx.fillStyle = '#bfe3ff'; ctx.fill();
      ctx.fillStyle = '#1b1f38'; ctx.fillRect(-200, -44, 430, 16);
      for (const wx of [-130, 60, 180]) { ctx.beginPath(); ctx.arc(wx, -18, 34, 0, Math.PI * 2); ctx.fillStyle = '#161927'; ctx.fill(); ctx.beginPath(); ctx.arc(wx, -18, 14, 0, Math.PI * 2); ctx.fillStyle = '#8a91b4'; ctx.fill(); }
      ctx.restore();
    }
    function box(x, y, s, rot) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot * 0.3); ctx.scale(s, s);
      roundRect(ctx, -50, -44, 100, 88, 8); ctx.fillStyle = '#c99a63'; ctx.fill();
      ctx.fillStyle = '#a77a47'; ctx.fillRect(-50, -8, 100, 14);
      tile(0, -2, 0.42, 'ai', 0);
      ctx.restore();
    }
  }

  // ======================================================================================== listen
  function listen() {
    const T = { pct: at(P.pctCue, D * 0.2), bury: at(P.buryCue, D * 0.48), help: at(P.helpCue, D * 0.82), ok: at(P.okCue, D * 0.92) };
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 730 }, { t: T.help - 0.5, zoom: 1.03, x: 487, y: 750 }, { t: D, zoom: 1.0, x: 487, y: 730 }]);
    K.world.room(ctx, { t, time: 'night', floorY: 900, window: true, lamp: true, picture: false, plant: false });
    // listener with a phone, looking bored
    K.drawPerson(ctx, 215, 1036, 1.3, { t, pose: 'phone', mood: t > T.bury ? 'worried' : 'neutral', skin: 4, hair: 3, hairStyle: 'curly', shirt: '#9b7be0', look: 0.6, seed: 11 });
    // headphones
    ctx.save(); ctx.strokeStyle = '#161927'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(215, 1036 - 240 * 1.3 + 46, 52, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.restore();

    // AI tiles with "0 plays" on a shelf at the right
    const sp = K.popIn(t, 0.1, 0.5);
    const big = [700, 900]; // the real artist's tile
    const buryU = clamp((t - T.bury) / 1.6);
    tile(big[0], big[1], 1.6, 'human');
    for (let i = 0; i < 6; i++) {
      const c = i % 3, r = Math.floor(i / 3), x = 520 + c * 150, y = 560 + r * 0; void r;
      if (i >= 3) continue;
      const p = clamp(sp * 1.0 - c * 0.15);
      if (p <= 0) continue;
      tile(x, y + 140, 0.9 * Math.min(1, p), 'ai', 0, { plays: '0 plays' });
    }
    // more AI tiles rain onto the artist's tile
    if (buryU > 0) {
      for (let i = 0; i < 26; i++) {
        const s0 = i * 0.06, u = clamp((t - T.bury - s0) / 0.55);
        if (u <= 0) continue;
        const ring = Math.floor(i / 9), ang = (i % 9) / 9 * Math.PI - Math.PI;
        const x = big[0] + Math.cos(ang) * (60 + ring * 40) * 1.3 + (H.hash(i, 1) - 0.5) * 40;
        const y = big[1] + 40 + Math.sin(ang) * (40 + ring * 34) - ring * 10;
        tile(x, lerp(380, y, u * u), 0.55, 'ai', (H.hash(i, 2) - 0.5) * (u < 1 ? 3 : 1));
      }
      const bp = K.popIn(t, T.bury + 0.8, 0.4);
      if (bp > 0) K.drawLabel(ctx, big[0], 1046 + 0, Math.min(1, bp), { text: P.buried || 'Real artists buried', size: 26 });
    }
    // stat card
    const pp = K.popIn(t, T.pct - 0.15, 0.45);
    if (pp > 0) {
      const out = 1 - smooth((t - (T.help - 0.4)) / 0.4);
      if (out > 0) { ctx.save(); ctx.globalAlpha = out; counterCard(487, 480, pp, P.pct || 'X%', P.pctLabel || 'of AI songs: zero plays'); ctx.restore(); }
    }
    // AI-assisted panel
    const hp = K.popIn(t, T.help - 0.35, 0.5);
    if (hp > 0) {
      ctx.save(); ctx.globalAlpha = clamp(hp);
      ctx.fillStyle = 'rgba(5,7,16,0.55)'; ctx.fillRect(0, 0, 1080, 1920); ctx.restore();
      ctx.save(); card(487, 770, 640, 470, hp);
      roundRect(ctx, -320, -235, 640, 470, 28); ctx.fillStyle = '#0d1020'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = rgba(ACC, 0.5); ctx.stroke();
      ctx.font = K.font.ui(32); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
      ctx.fillText(P.helped || 'Made with AI help', 0, -190);
      // little studio: desk, person with laptop, robot helper (scaled to fit the card)
      ctx.save(); ctx.scale(0.82, 0.82); ctx.translate(-480, -800);
      K.drawDesk(ctx, 400, 970, 1.0);
      K.drawLaptop(ctx, 400, 862, 0.75, { t, screen: 'chart', typing: 1 });
      K.drawPerson(ctx, 230, 990, 1.0, { t, pose: 'point', mood: 'happy', skin: 0, hair: 4, hairStyle: 'long', shirt: '#e0b84f', look: 0.5, seed: 21 });
      K.drawRobot(ctx, 580, 990, 0.7, { t, state: 'working', seed: 3 });
      tile(735, 720, 1.05, 'human', 0, { helper: true });
      ctx.restore();
      ctx.restore();
      const sl = (t - T.ok + 0.1) / 0.5;
      if (sl > 0) K.drawStamp(ctx, 690, 1000, 0.7, { kind: 'check', text: P.ok || 'ALLOWED', land: sl });
    }
  }

  // ======================================================================================== caveat
  function caveat() {
    const T = { title: at(P.titleCue, D * 0.38), tool: at(P.toolCue, D * 0.16), meta: at(P.metaCue, D * 0.28),
      slip: at(P.slipCue, D * 0.66), flag: at(P.flagCue, D * 0.85) };
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.05, x: 487, y: 760 }]);
    K.world.room(ctx, { t, time: 'night', floorY: 900, window: false, lamp: false, picture: false, plant: false });
    const BY = 930, AX = 470;
    // belt
    roundRect(ctx, 40, BY, 1000, 34, 17); ctx.fillStyle = '#3b4260'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 4;
    for (let k = 0; k < 22; k++) { const x = 40 + ((k * 50 + t * 120) % 1000); ctx.beginPath(); ctx.moveTo(x, BY + 6); ctx.lineTo(x - 10, BY + 28); ctx.stroke(); }
    for (const lx of [120, 470, 820]) { ctx.fillStyle = '#2a3050'; ctx.fillRect(lx - 10, BY + 34, 20, 70); }
    // reject bin (left of the arch? no: at right end, below belt) + pass zone
    // items: [kind, start time, opts]: AI tiles are caught; a disguised one slips; a human one is wrongly flagged
    const SPEED = 150, ENTER = -60;
    const items = [];
    for (let k = 0; k < 4; k++) items.push({ kind: k % 2 ? 'human' : 'ai', s: -1.4 + k * 1.0 });
    items.push({ kind: 'ai', s: T.slip - (AX - ENTER) / SPEED - 0.1, disguise: true, slip: true });
    items.push({ kind: 'human', s: T.flag - (AX - ENTER) / SPEED - 0.1, wrong: true });
    for (const it of items) {
      const tt = t - it.s; if (tt < 0) continue;
      let x = ENTER + tt * SPEED, y = BY - 52, rot = 0, cross = 0, flag = false;
      const pass = (x - AX);
      const caught = (it.kind === 'ai' && !it.slip) || it.wrong;
      if (caught && pass > 40) { // knocked off the belt into the reject chute
        const u = clamp((pass - 40) / 160);
        cross = clamp((pass - 0) / 60);
        x = AX + 40 + u * 120; y = BY - 52 + u * u * 140; rot = u * 1.2; flag = true;
        if (u >= 1) { y = BY + 88; x = AX + 160; }
      } else if (caught && pass > 0) { cross = clamp(pass / 40); flag = true; }
      if (x > 1120) continue;
      tile(x, y, 0.75, it.kind, rot, { disguise: it.disguise && pass < 260, cross: cross * (it.slip ? 0 : 1), flag: flag && !it.slip });
      // slipped tile: its disguise falls off after passing, "?" above
      if (it.slip && pass > 260 && x < 1000) {
        const qp = K.popIn(t, it.s + (AX + 260 - ENTER) / SPEED, 0.4);
        ctx.font = K.font.display(60); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ACC; ctx.globalAlpha = clamp(qp); ctx.fillText('?', x, y - 80); ctx.globalAlpha = 1;
      }
    }
    // reject chute
    roundRect(ctx, AX + 110, BY + 50, 110, 80, 10); ctx.fillStyle = DANGER; ctx.fill();
    ctx.font = K.font.ui(18); ctx.fillStyle = '#2a0c08'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('OUT', AX + 165, BY + 92);
    // arch
    roundRect(ctx, AX - 110, 640, 40, BY - 640 + 10, 12); ctx.fillStyle = '#545d86'; ctx.fill();
    roundRect(ctx, AX + 70, 640, 40, BY - 640 + 10, 12); ctx.fill();
    roundRect(ctx, AX - 120, 620, 240, 50, 16); ctx.fillStyle = '#6b7396'; ctx.fill();
    const beam = 0.35 + 0.25 * Math.sin(t * 8);
    ctx.fillStyle = rgba(ACC, 0.12 + beam * 0.1); ctx.fillRect(AX - 70, 670, 140, BY - 670);
    ctx.fillStyle = ACC; ctx.fillRect(AX - 70, 670 + ((t * 260) % (BY - 680)), 140, 5);
    // detector robot on top of the arch
    K.drawRobot(ctx, AX, 622, 0.8, { t, state: 'thinking', seed: 5 });
    // chips: detection tool + metadata
    const c1 = K.popIn(t, T.tool - 0.1, 0.4), c2 = K.popIn(t, T.meta - 0.1, 0.4);
    if (c1 > 0) K.drawLabel(ctx, 220, 640, Math.min(1, c1), { text: P.tool || 'Detection tool', size: 26, dot: true });
    if (c2 > 0) K.drawLabel(ctx, 220, 716, Math.min(1, c2), { text: P.meta || 'Metadata check', size: 26, dot: true });
    // title pill
    const tp = K.popIn(t, T.title - 0.1, 0.45);
    if (tp > 0) K.drawLabel(ctx, 487, 470, Math.min(1, tp), { text: P.title || "Detectors aren't perfect", size: 32, accent: true });
    const sp = K.popIn(t, T.slip + 0.6, 0.4);
    if (sp > 0) K.drawLabel(ctx, 760, 640, Math.min(1, sp), { text: P.slip || 'Slipped through?', size: 26 });
    const fp = K.popIn(t, T.flag + 0.5, 0.4);
    if (fp > 0) K.drawLabel(ctx, 760, 716, Math.min(1, fp), { text: P.flag || 'Flagged by mistake?', size: 26 });
    // the artist whose song got flagged
    K.drawPerson(ctx, 860, 1036, 1.05, { t, pose: t > T.flag + 0.5 ? 'shrug' : 'stand', mood: t > T.flag + 0.5 ? 'shocked' : 'neutral', skin: 1, hair: 2, hairStyle: 'long', shirt: '#e07a5f', flip: true, look: -0.7, seed: 14 });
  }
}
