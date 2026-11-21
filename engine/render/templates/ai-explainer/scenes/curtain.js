// Scene "curtain" (full frame). A private chat app shuts a metal shutter over its own screen so the phone's built-in
// AI assistant (the kit robot, a nosy generic "AI assistant") can't read it. Generic cartoon phones; the app is named
// only as plain header text, no logos, no real app icons, no real people (the quoted president is text only).
// modes:
//  hook    : night room; the robot leans out from behind a big phone, its scan beam on the chat; the shutter slams down
//            (lands ~0.75 s), padlock + "AI BLOCKED" plate, beam sparks, robot recoils with a "?" (loop target)
//  update  : two phones; date pill (dateCue), both update; left "iPhone · iOS 27" settings row "Block Siri AI" ON +
//            "ON BY DEFAULT" tag (iosCue/defaultCue); right "Android": a robot peeks (androidCue), shutter drops and
//            "Screen security" switches ON (kickCue/readCue)
//  scan    : the robot's beam sweeps the chat (scanCue); message cards copy off and fly to a cloud "AI server"
//            (captureCue/serverCue); "Out of Signal's hands" pill (handsCue)
//  catch   : a person screenshots: flash + toast "Screenshot prevented..." (shotCue); settings toggle flips OFF (offCue);
//            shutter lifts, robot peeks back in (warnCue); "Could expose you + your contacts" warning (contactsCue)
//  recall  : night office desk monitor "Windows · 2025"; a "Recall" camera snaps the chat into a photo stack; at blockCue
//            the screen goes dark and new snaps come out black; then a verbatim quote card with a caged canary (quoteCue)
//  caveat  : shuttered phone; three gap pills with red crosses (c1Cue..c3Cue; a robot slips a file out at c3); then
//            three company towers (text pills) each get an envelope (askCue) and an "easy way to opt out" pill (optCue)
// params: mode, app ('Chat app'), blocked ('AI BLOCKED'), date, setting (the block toggle, 'Block AI'), phoneA, phoneB,
//         hands, toast, warn, os, recall (the snapshot feature's name), quoteLines [], by, by2, gaps [3], companies [3],
//         askHead, ask; cues above. Story texts in the header comments are examples (2026-11-21 story), not defaults.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic, easeInOutCubic, roundRect, mixHex, rgba } = H;
  const D = info.duration, ACC = info.accent, N = K.NEUTRAL, mode = P.mode || 'hook';
  const at = (w, f) => { const v = w ? info.timeOf(w) : null; return v != null ? v : D * f; };
  const app = P.app || 'Chat app', setting = P.setting || 'Block AI';
  const ME = '#3f5bd8', THEM = '#2e3557';

  // ------------------------------------------------------------------ helpers
  function text(str, x, y, kind, size, col, align) {
    ctx.font = H.font(kind, size); ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = col; ctx.fillText(str, x, y);
  }
  function scaleAt(x, y, s, fn) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.translate(-x, -y); fn(); ctx.restore(); }
  function pill(x, y, str, pop, o = {}) { if (pop > 0) K.drawLabel(ctx, x, y, Math.min(1.15, pop), { text: str, size: o.size || 28, accent: !!o.accent, dot: !!o.dot }); }
  // chat bubbles as placeholder bars (no readable private text); scroll shifts them up
  function chat(x, y, w, h, o = {}) {
    const rows = [[0, 2, 0.8], [1, 1, 0.55], [0, 1, 0.7], [1, 2, 0.75], [0, 1, 0.5], [1, 1, 0.62], [0, 2, 0.72]];
    let yy = y + 22;
    rows.forEach((r, i) => {
      const [me, lines, wf] = r, bw = (w - 40) * wf, bh = 26 + lines * 24;
      if (yy + bh > y + h - 10) return;
      const bx = me ? x + w - 18 - bw : x + 18;
      const pop = o.pop ? o.pop(i) : 1;
      if (pop > 0) {
        scaleAt(me ? bx + bw : bx, yy + bh, Math.min(1, pop), () => {
          roundRect(ctx, bx, yy, bw, bh, 18); ctx.fillStyle = o.hi === i ? mixHex(me ? ME : THEM, ACC, 0.35) : (me ? ME : THEM); ctx.fill();
          for (let l = 0; l < lines; l++) {
            roundRect(ctx, bx + 16, yy + 16 + l * 24, (bw - 32) * (l === lines - 1 && lines > 1 ? 0.6 : 1), 12, 6);
            ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
          }
        });
      }
      o.rects && o.rects.push([bx, yy, bw, bh, me]);
      yy += bh + 16;
    });
  }
  // phone frame + header; o.draw(sx, sy, sw, sh) paints the screen below the header (clipped)
  function phone(cx, top, w, h, o = {}) {
    const r = 36;
    K.shadow(ctx, cx, top + h + 10, w * 1.05);
    roundRect(ctx, cx - w / 2 - 12, top - 12, w + 24, h + 24, r + 10); ctx.fillStyle = '#1c2033'; ctx.fill();
    roundRect(ctx, cx - w / 2 - 12, top - 12, w + 24, h + 24, r + 10); ctx.lineWidth = 3; ctx.strokeStyle = '#3b4260'; ctx.stroke();
    // side buttons (squeezed for a screenshot)
    const sq = o.squeeze || 0;
    roundRect(ctx, cx + w / 2 + 10 - sq * 6, top + 110, 8, 70, 4); ctx.fillStyle = sq > 0 ? ACC : '#3b4260'; ctx.fill();
    roundRect(ctx, cx - w / 2 - 18 + sq * 6, top + 90, 8, 50, 4); ctx.fillStyle = sq > 0 ? ACC : '#3b4260'; ctx.fill();
    roundRect(ctx, cx - w / 2, top, w, h, r); ctx.fillStyle = '#121527'; ctx.fill();
    ctx.save(); roundRect(ctx, cx - w / 2, top, w, h, r); ctx.clip();
    ctx.fillStyle = '#1d2240'; ctx.fillRect(cx - w / 2, top, w, 74);
    // generic contact avatar (plain circle with initial dot), app name as plain text
    ctx.beginPath(); ctx.arc(cx - w / 2 + 44, top + 44, 18, 0, Math.PI * 2); ctx.fillStyle = '#7f8bb8'; ctx.fill();
    ctx.beginPath(); ctx.arc(cx - w / 2 + 44, top + 39, 7, 0, Math.PI * 2); ctx.fillStyle = '#c9d0ea'; ctx.fill();
    text(o.title || app, cx - w / 2 + 74, top + 44, 'display', 28, '#ffffff', 'left');
    if (o.draw) o.draw(cx - w / 2, top + 74, w, h - 74);
    ctx.restore();
    roundRect(ctx, cx - 34, top + 8, 68, 12, 6); ctx.fillStyle = '#0b0d18'; ctx.fill();
  }
  // metal roller shutter over a screen rect, u 0..1 = how far down
  function shutter(x, y, w, h, u, o = {}) {
    if (u <= 0) return;
    const sh = h * clamp(u);
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#6f7896'); g.addColorStop(0.5, '#9aa3c0'); g.addColorStop(1, '#6f7896');
    ctx.fillStyle = g; ctx.fillRect(x, y, w, sh);
    ctx.strokeStyle = 'rgba(20,24,40,0.45)'; ctx.lineWidth = 3;
    for (let yy = y + sh - 10; yy > y; yy -= 26) { ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x + w, yy); ctx.stroke(); }
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    for (let yy = y + sh - 22; yy > y; yy -= 26) ctx.fillRect(x, yy, w, 4);
    // bottom bar with an accent stripe
    ctx.fillStyle = '#4a5270'; ctx.fillRect(x, y + sh - 20, w, 20); ctx.fillStyle = ACC; ctx.fillRect(x, y + sh - 12, w, 5);
    ctx.restore();
    const lockPop = o.lock || 0;
    if (lockPop > 0 && u >= 0.98) {
      const cx = x + w / 2, cy = y + h * 0.46;
      scaleAt(cx, cy, Math.min(1.12, lockPop), () => {
        const pw = Math.min(w - 40, 250), ph = 210;
        roundRect(ctx, cx - pw / 2, cy - ph / 2, pw, ph, 22); ctx.fillStyle = 'rgba(14,16,30,0.92)'; ctx.fill();
        ctx.lineWidth = 3; ctx.strokeStyle = ACC; roundRect(ctx, cx - pw / 2, cy - ph / 2, pw, ph, 22); ctx.stroke();
        K.drawLock(ctx, cx, cy + 28, 0.82, { open: 0 });
        if (o.label) text(o.label, cx, cy + 68, 'display', o.labelSize || 30, ACC);
      });
    }
  }
  // the nosy assistant: robot leaning by `lean` (radians, negative = toward the left); returns eye point
  function nosy(x, y, s, lean, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(lean);
    K.drawRobot(ctx, 0, 0, s, { t, state: o.state || 'working', talk: 0, seed: o.seed || 5 });
    ctx.restore();
    const d = 172 * s;
    const eye = [x + d * Math.sin(lean), y - d * Math.cos(lean)];
    if (o.tag) { const dt = 245 * s; pill(x + dt * Math.sin(lean), y - dt * Math.cos(lean) - 8, o.tag, o.tagPop == null ? 1 : o.tagPop, { size: 24 }); }
    return eye;
  }
  // scan beam from the eye to a screen rect, with a moving scan line; blocked = beam stops at the shutter with sparks
  function beam(eye, x, y, w, h, a, o = {}) {
    if (a <= 0) return;
    const scanY = y + 20 + ((t * 0.9) % 1) * (h - 40);
    ctx.save();
    ctx.globalAlpha = a;
    const tx = o.left ? x : x + w;               // beam lands on the near edge of the screen
    const g = ctx.createLinearGradient(eye[0], eye[1], tx, scanY);
    g.addColorStop(0, rgba(ACC, 0.55)); g.addColorStop(1, rgba(ACC, 0.12));
    ctx.beginPath(); ctx.moveTo(eye[0], eye[1]); ctx.lineTo(x + (o.left ? w : 0), y + 10); ctx.lineTo(x + (o.left ? w : 0), y + h - 10); ctx.closePath();
    ctx.fillStyle = g; ctx.fill();
    if (!o.blocked) {
      ctx.fillStyle = rgba(ACC, 0.85); ctx.fillRect(x, scanY - 3, w, 6);
      K.glow(ctx, x + w / 2, scanY, w * 0.5, ACC, 0.25);
    } else {
      for (let i = 0; i < 7; i++) {
        const k = (t * 3 + i * 0.37) % 1, sx = x + w * (0.3 + 0.4 * H.hash(i, 3)), sy = y + h * (0.25 + 0.5 * H.hash(i, 7));
        ctx.globalAlpha = a * (1 - k);
        ctx.strokeStyle = ACC; ctx.lineWidth = 4; ctx.lineCap = 'round';
        const ang = H.hash(i, 11) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(ang) * 30 * k, sy + Math.sin(ang) * 30 * k); ctx.stroke();
      }
    }
    ctx.restore();
  }
  function toggle(x, y, on, s = 1) { // x,y = left-middle
    const w = 64 * s, h = 36 * s, k = clamp(on);
    roundRect(ctx, x, y - h / 2, w, h, h / 2); ctx.fillStyle = mixHex('#4a5170', ACC, k); ctx.fill();
    ctx.beginPath(); ctx.arc(x + h / 2 + (w - h) * easeInOutCubic(k), y, h / 2 - 4, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
  }
  function settingsRow(x, y, w, label, on, o = {}) {
    roundRect(ctx, x + 12, y, w - 24, 76, 16); ctx.fillStyle = o.hi ? mixHex('#232a4d', ACC, 0.16 * o.hi) : '#232a4d'; ctx.fill();
    if (o.hi) { ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, o.hi); roundRect(ctx, x + 12, y, w - 24, 76, 16); ctx.stroke(); }
    text(label, x + 30, y + 38, 'ui', o.size || 26, '#ffffff', 'left');
    toggle(x + w - 30 - 58, y + 38, on, 0.9);
  }
  function crossDot(x, y, land, s = 1) {
    if (land <= 0) return;
    const sc = s * (1 + 1.1 * Math.pow(1 - easeOutCubic(clamp(land / 0.5)), 2));
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha = clamp(land * 3);
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fillStyle = N.danger; ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(8, 8); ctx.moveTo(8, -8); ctx.lineTo(-8, 8); ctx.stroke();
    ctx.restore();
  }
  function card(x, y, w, h, pop, fn) { // dark glass card, centre-anchored pop
    if (pop <= 0) return;
    scaleAt(x + w / 2, y + h / 2, Math.min(1.08, 0.6 + 0.4 * pop), () => {
      ctx.globalAlpha = clamp(pop * 2);
      roundRect(ctx, x, y, w, h, 24); ctx.fillStyle = 'rgba(12,14,28,0.92)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; roundRect(ctx, x, y, w, h, 24); ctx.stroke();
      fn(); ctx.globalAlpha = 1;
    });
  }
  function envelope(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    roundRect(ctx, -40, -26, 80, 52, 6); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.strokeStyle = '#9aa3c4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-40, -24); ctx.lineTo(0, 4); ctx.lineTo(40, -24); ctx.stroke();
    ctx.restore();
  }
  function cloud(x, y, s, lit) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.glow(ctx, 0, 0, 160, ACC, 0.12 + 0.2 * lit);
    ctx.fillStyle = '#d9def0';
    for (const [cx, cy, r] of [[-70, 10, 52], [-15, -28, 66], [55, -6, 56], [90, 22, 40], [-110, 30, 34]]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); }
    roundRect(ctx, -140, 10, 270, 56, 28); ctx.fill();
    // server slots
    for (let i = 0; i < 3; i++) {
      roundRect(ctx, -70, -20 + i * 26, 140, 18, 6); ctx.fillStyle = '#3a4675'; ctx.fill();
      ctx.beginPath(); ctx.arc(50, -11 + i * 26, 4, 0, Math.PI * 2); ctx.fillStyle = (Math.sin(t * 7 + i * 2) > 0) ? ACC : '#6d7695'; ctx.fill();
    }
    ctx.restore();
  }
  function msgCard(x, y, s, me) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    roundRect(ctx, -46, -22, 92, 44, 14); ctx.fillStyle = me ? ME : THEM; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; roundRect(ctx, -46, -22, 92, 44, 14); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; roundRect(ctx, -32, -8, 64, 10, 5); ctx.fill();
    ctx.restore();
  }
  function nightRoom() { return K.world.room(ctx, { t, time: 'night', lamp: true, window: true, picture: false, plant: true }); }

  // ================================================================== HOOK
  if (mode === 'hook') {
    const tLand = 0.72;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 500, y: 730 }, { t: D, zoom: 1.06, x: 510, y: 735 }]);
    K.cameraShake(ctx, t, tLand, 0.4, 12);
    nightRoom();
    K.drawPerson(ctx, 215, 1036, 1.6, { t, pose: 'phone', mood: t > tLand + 0.2 ? 'happy' : 'neutral', skin: 1, hair: 3, shirt: 1, hairStyle: 'long', seed: 2, look: 0.4 });
    ctx.fillStyle = 'rgba(8,10,24,0.25)'; ctx.fillRect(0, 0, 1080, 1920);
    const cx = 500, top = 470, w = 320, h = 520;
    // robot leaning out from behind the phone; recoils after the slam
    const rec = smooth(clamp((t - tLand - 0.1) / 0.45));
    const lean = lerp(-0.26, 0.04, rec);
    const eye = nosy(750 + rec * 20, 1035, 1.32, lean, { state: rec > 0.5 ? 'thinking' : 'working' });
    // shutter: already moving at frame 0, accelerates, lands with a small bounce
    const fall = t < tLand ? Math.pow(clamp((t + 0.12) / (tLand + 0.12)), 2) : 1 - 0.05 * Math.exp(-(t - tLand) * 9) * Math.abs(Math.sin((t - tLand) * 22));
    const sx = cx - w / 2, sy = top + 74, sw = w, sh = h - 74;
    phone(cx, top, w, h, { draw: (x, y, ww, hh) => { chat(x, y, ww, hh); shutter(x, y, ww, hh, fall, { lock: K.popIn(t, tLand + 0.12, 0.4), label: P.blocked || 'AI BLOCKED', labelSize: 32 }); } });
    beam(eye, sx, sy, sw, sh, t < tLand ? 1 : clamp(1 - (t - tLand - 0.6) / 0.5), { blocked: t >= tLand });
    // tag, then a "?" over the recoiling robot
    const q = K.popIn(t, tLand + 0.55, 0.4);
    const tagA = 1 - clamp((t - tLand - 0.4) / 0.25);
    if (tagA > 0) { ctx.save(); ctx.globalAlpha = tagA; pill(700, 690, 'AI assistant', 1, { size: 26 }); ctx.restore(); }
    if (q > 0) K.drawSpeechBubble(ctx, 780, 700, Math.min(1, q), { text: '?', size: 46, tail: 'center' });
    ctx.restore();
    return;
  }

  // ================================================================== UPDATE
  if (mode === 'update') {
    const tDate = at(P.dateCue, 0.02) - 0.1, tIos = at(P.iosCue, 0.27) - 0.15, tDef = at(P.defaultCue, 0.5) - 0.1;
    const tAnd = at(P.androidCue, 0.6) - 0.15, tKick = at(P.kickCue, 0.74) - 0.1, tRead = at(P.readCue, 0.9);
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 730 }, { t: D, zoom: 1.04, x: 490, y: 740 }]);
    nightRoom();
    ctx.fillStyle = 'rgba(8,10,24,0.42)'; ctx.fillRect(0, 0, 1080, 1920);
    pill(487, 508, P.date || 'DATE', K.popIn(t, tDate, 0.4), { accent: true });
    const W = 300, HH = 430, TOP = 600;
    const upd = clamp((t - 0.5) / 1.6);            // update progress
    const updDone = t > 2.3;
    const drawUpdate = (x, y, ww, hh) => {
      text(updDone ? 'Updated' : 'Updating...', x + ww / 2, y + hh * 0.4, 'display', 30, '#ffffff');
      roundRect(ctx, x + 40, y + hh * 0.52, ww - 80, 16, 8); ctx.fillStyle = '#2e3557'; ctx.fill();
      roundRect(ctx, x + 40, y + hh * 0.52, (ww - 80) * upd, 16, 8); ctx.fillStyle = ACC; ctx.fill();
      if (updDone) {
        const k = K.popIn(t, 2.3, 0.35);
        scaleAt(x + ww / 2, y + hh * 0.7, Math.min(1.1, k), () => {
          ctx.beginPath(); ctx.arc(x + ww / 2, y + hh * 0.7, 30, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
          ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(x + ww / 2 - 13, y + hh * 0.7); ctx.lineTo(x + ww / 2 - 3, y + hh * 0.7 + 10); ctx.lineTo(x + ww / 2 + 15, y + hh * 0.7 - 12); ctx.stroke();
        });
      }
    };
    // left: iPhone settings, Block Siri AI already on
    const iosK = K.popIn(t, tIos, 0.45);
    phone(300, TOP, W, HH, { title: t < tIos ? app : 'Settings', draw: (x, y, ww, hh) => {
      if (t < tIos) { drawUpdate(x, y, ww, hh); return; }
      text('Privacy', x + 30, y + 40, 'bold', 26, '#9aa3c4', 'left');
      const hi = clamp((t - tIos - 0.2) / 0.4);
      ctx.globalAlpha = clamp(iosK);
      settingsRow(x, y + 70, ww, setting, 1, { hi, size: 27 });
      ctx.globalAlpha = 1;
      pill(x + ww / 2, y + 210, 'ON BY DEFAULT', K.popIn(t, tDef, 0.4), { size: 24, accent: true });
      // little closed shutter icon: screenshots off
      const sk = K.popIn(t, tIos + 0.8, 0.4);
      if (sk > 0) scaleAt(x + ww / 2, y + 290, Math.min(1.1, sk), () => {
        roundRect(ctx, x + ww / 2 - 60, y + 250, 120, 84, 12); ctx.fillStyle = '#9aa3c0'; ctx.fill();
        ctx.strokeStyle = 'rgba(20,24,40,0.5)'; ctx.lineWidth = 3;
        for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x + ww / 2 - 60, y + 266 + k * 18); ctx.lineTo(x + ww / 2 + 60, y + 266 + k * 18); ctx.stroke(); }
        ctx.fillStyle = ACC; ctx.fillRect(x + ww / 2 - 60, y + 326, 120, 6);
      });
    } });
    pill(300, 585, P.phoneA || 'Phone A', K.popIn(t, tIos, 0.4), { size: 26 });
    // right: Android chat; a robot peeks in, shutter drops, Screen security on
    const andK = K.popIn(t, tAnd, 0.4);
    const peek = smooth(clamp((t - tAnd - 0.3) / 0.6)) * (1 - smooth(clamp((t - tKick - 0.5) / 0.6)) * 0.7);
    if (peek > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, TOP + 80); ctx.clip();   // robot peeks over the phone top
      K.drawRobot(ctx, 765, TOP + 230 - 170 * peek, 1.0, { t, state: t > tKick + 0.3 ? 'thinking' : 'working', seed: 8 });
      ctx.restore();
    }
    const dropT = clamp((t - tKick) / 0.4);
    phone(680, TOP, W, HH, { title: app, draw: (x, y, ww, hh) => {
      if (t < tAnd) { drawUpdate(x, y, ww, hh); return; }
      chat(x, y, ww, hh);
      if (peek > 0 && dropT < 1) { ctx.fillStyle = rgba(ACC, 0.7 * peek); ctx.fillRect(x, y + 20 + ((t * 0.9) % 1) * (hh - 40), ww, 5); }
      shutter(x, y, ww, hh, dropT * dropT, { lock: K.popIn(t, tKick + 0.45, 0.4), label: 'Screen security', labelSize: 24 });
      const onK = K.popIn(t, Math.max(tKick + 0.7, tRead - 0.2), 0.4);
      pill(x + ww / 2, y + hh - 14, 'SWITCHES ON', onK, { size: 24, accent: true });
    } });
    pill(610, 585, P.phoneB || 'Phone B', andK, { size: 26 });
    ctx.restore();
    return;
  }

  // ================================================================== SCAN
  if (mode === 'scan') {
    const tScan = at(P.scanCue, 0.19) - 0.3, tCap = at(P.captureCue, 0.44) - 0.1, tSrv = at(P.serverCue, 0.69) - 0.4, tHands = at(P.handsCue, 0.92) - 0.2;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 730 }, { t: D, zoom: 1.05, x: 500, y: 720 }]);
    nightRoom();
    ctx.fillStyle = 'rgba(8,10,24,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
    const why = K.popIn(t, 0.0, 0.35) * (1 - clamp((t - 1.4) / 0.3));
    const cx = 330, top = 520, w = 300, h = 500;
    const rects = [];
    const eye = nosy(790, 1035, 1.05, -0.12, { state: 'working', tag: 'AI assistant', tagPop: K.popIn(t, 0.2, 0.4) });
    phone(cx, top, w, h, { draw: (x, y, ww, hh) => chat(x, y, ww, hh, { rects }) });
    const sx = cx - w / 2, sy = top + 74;
    beam(eye, sx, sy, w, h - 74, clamp((t - tScan) / 0.4));
    // server cloud
    const srv = K.popIn(t, Math.min(tSrv, tCap + 0.6), 0.5);
    if (srv > 0) {
      scaleAt(700, 545, Math.min(1.08, srv), () => cloud(700, 545, 0.95, clamp((t - tCap) / 2)));
      pill(700, 650, 'AI server', srv, { size: 26 });
    }
    // message cards copy off and fly to the cloud
    if (t > tCap) {
      for (let i = 0; i < 8; i++) {
        const r = rects[i % rects.length]; if (!r) continue;
        const t0 = tCap + i * 0.55, u = clamp((t - t0) / 1.1);
        if (u <= 0 || u >= 1) continue;
        const e = easeInOutCubic(u);
        const x0 = r[0] + sx * 0 + r[2] / 2, y0 = r[1] + r[3] / 2;
        const x1 = 700, y1 = 540;
        const px = lerp(x0, x1, e), py = lerp(y0, y1, e) - Math.sin(e * Math.PI) * 170;
        ctx.globalAlpha = u < 0.85 ? 1 : (1 - u) / 0.15;
        msgCard(px, py, lerp(1.35, 0.7, e), r[4]);
        ctx.globalAlpha = 1;
      }
    }
    if (why > 0) text('?', 487, 470, 'display', 120 * Math.min(1.1, why), ACC);
    const hk = K.popIn(t, tHands, 0.45);
    if (hk > 0) {
      pill(330, 496, P.hands || 'Out of ' + app + "'s hands", hk, { accent: true, size: 32 });
    }
    ctx.restore();
    return;
  }

  // ================================================================== CATCH
  if (mode === 'catch') {
    const tShot = at(P.shotCue, 0.16) - 0.15, tOff = at(P.offCue, 0.44) - 0.9, tWarn = at(P.warnCue, 0.6) - 0.2, tCon = at(P.contactsCue, 0.8) - 0.1;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 730 }, { t: D, zoom: 1.05, x: 480, y: 735 }]);
    nightRoom();
    const shocked = t > tShot + 0.2 && t < tOff;
    K.drawPerson(ctx, 190, 1036, 1.55, { t, pose: 'phone', mood: t > tCon ? 'worried' : shocked ? 'shocked' : 'neutral', skin: 3, hair: 0, shirt: 3, hairStyle: 'short', seed: 9, look: 0.5 });
    ctx.fillStyle = 'rgba(8,10,24,0.3)'; ctx.fillRect(0, 0, 1080, 1920);
    const cx = 500, top = 565, w = 320, h = 470;
    const squeeze = Math.max(0, 1 - Math.abs(t - tShot) / 0.25);
    const flash = t > tShot ? Math.exp(-(t - tShot) * 6) : 0;
    const settings = t > tOff;
    const flip = clamp((t - tOff - 0.5) / 0.35);          // toggle flips off
    const lift = smooth(clamp((t - tOff - 1.6) / 0.5));     // back to the chat, shutter lifts
    const back = smooth(clamp((t - tWarn) / 0.6));        // robot peeks back in from the right
    phone(cx, top, w, h, { squeeze, title: settings && lift <= 0 ? 'Settings' : app, draw: (x, y, ww, hh) => {
      if (!settings || lift > 0) {
        chat(x, y, ww, hh, { hi: t > tCon ? 1 : -1 });
      } else {
        text('Privacy', x + 30, y + 40, 'bold', 26, '#9aa3c4', 'left');
        settingsRow(x, y + 70, ww, setting, 1 - flip, { hi: 1, size: 27 });
        text(flip > 0.5 ? 'Screenshots allowed' : '', x + ww / 2, y + 200, 'ui', 24, '#9aa3c4');
      }
      // shutter is closed during the screenshot attempt; lifts after the toggle
      const toastOn = K.popIn(t, tShot + 0.3, 0.4) * (1 - clamp((t - tOff + 0.2) / 0.3));
      if (!settings) shutter(x, y, ww, hh, 1, { lock: clamp(1 - toastOn * 1.5), label: setting, labelSize: 26 });
      else if (lift > 0 && lift < 1) shutter(x, y, ww, hh, 1 - lift);
      // screenshot toast (verbatim message)
      const toast = K.popIn(t, tShot + 0.3, 0.4) * (1 - clamp((t - tOff + 0.2) / 0.3));
      if (toast > 0) scaleAt(x + ww / 2, y + hh - 90, Math.min(1.06, toast), () => {
        roundRect(ctx, x + 14, y + hh - 160, ww - 28, 132, 18); ctx.fillStyle = 'rgba(240,242,250,0.97)'; ctx.fill();
        const lines = H.wrap(ctx, P.toast || "Screenshot prevented by '" + setting + "' setting", 'ui', 24, ww - 64);
        lines.forEach((l, i) => text(l, x + ww / 2, y + hh - 160 + 36 + i * 30 - (lines.length - 3) * 15, 'ui', 24, '#161927'));
      });
      if (flash > 0.01) { ctx.fillStyle = rgba('#ffffff', flash * 0.9); ctx.fillRect(x, y - 74, ww, hh + 74); }
    } });
    if (back > 0) {
      const eye = nosy(lerp(1000, 790, back), 1035, 1.1, -0.18 * back, { state: 'working', tag: 'AI assistant', tagPop: back });
      beam(eye, cx - w / 2, top + 74, w, h - 74, back * clamp((t - tWarn - 0.4) / 0.3));
    }
    // warning
    const wk = K.popIn(t, tCon, 0.45);
    if (wk > 0) {
      K.drawWarning(ctx, 205, 540, 0.55 * Math.min(1.1, wk), { pulse: t });
      pill(530, 540, P.warn || 'Could expose you + your contacts', wk, { size: 28 });
    }
    ctx.restore();
    return;
  }

  // ================================================================== RECALL
  if (mode === 'recall') {
    const tRec = at(P.recallCue, 0.34) - 0.6, tBlock = at(P.blockCue, 0.24) + 0.6, tQ = at(P.quoteCue, 0.85) - 1.3;
    const tCard = tQ - 0.6;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 730 }, { t: D, zoom: 1.05, x: 487, y: 720 }]);
    K.world.office(ctx, { t, time: 'night' });
    ctx.fillStyle = 'rgba(8,10,24,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
    const dim = smooth(clamp((t - tCard) / 0.5));
    // desk + generic monitor
    ctx.save(); ctx.globalAlpha = 1 - 0.55 * dim;
    K.drawDesk(ctx, 470, 1040, 1.5);
    const mx = 470, my = 640, mw = 440, mh = 270;
    roundRect(ctx, mx - 24, my + mh / 2 + 10, 48, 90, 8); ctx.fillStyle = '#3a4160'; ctx.fill();
    roundRect(ctx, mx - 90, my + mh / 2 + 92, 180, 18, 9); ctx.fillStyle = '#3a4160'; ctx.fill();
    roundRect(ctx, mx - mw / 2 - 14, my - mh / 2 - 14, mw + 28, mh + 28, 18); ctx.fillStyle = '#1c2033'; ctx.fill();
    const dark = t > tBlock;
    ctx.save(); roundRect(ctx, mx - mw / 2, my - mh / 2, mw, mh, 8); ctx.clip();
    ctx.fillStyle = '#121527'; ctx.fillRect(mx - mw / 2, my - mh / 2, mw, mh);
    ctx.fillStyle = '#1d2240'; ctx.fillRect(mx - mw / 2, my - mh / 2, mw, 46);
    text(app, mx - mw / 2 + 20, my - mh / 2 + 24, 'display', 24, '#ffffff', 'left');
    chat(mx - mw / 2 + 40, my - mh / 2 + 40, mw - 80, mh - 40);
    if (dark) { const k = clamp((t - tBlock) / 0.3); ctx.fillStyle = rgba('#05060c', k); ctx.fillRect(mx - mw / 2, my - mh / 2, mw, mh); if (k > 0.8) text('Screen security', mx, my, 'display', 30, ACC); }
    ctx.restore();
    pill(mx, my - mh / 2 - 26, P.os || 'Computer', K.popIn(t, 0.25, 0.4), { size: 26 });
    // the "Recall" camera snapping into a photo stack
    const camX = 790, camY = 600;
    const ck = K.popIn(t, Math.min(tRec, 1.2), 0.4);
    if (ck > 0) {
      scaleAt(camX, camY, Math.min(1.1, ck), () => {
        roundRect(ctx, camX - 56, camY - 38, 112, 76, 14); ctx.fillStyle = '#d9def0'; ctx.fill();
        roundRect(ctx, camX - 30, camY - 52, 40, 18, 6); ctx.fillStyle = '#b7bfdc'; ctx.fill();
        ctx.beginPath(); ctx.arc(camX, camY, 26, 0, Math.PI * 2); ctx.fillStyle = '#283152'; ctx.fill();
        ctx.beginPath(); ctx.arc(camX, camY, 14, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
      });
      pill(camX, camY - 66, P.recall || 'Snapshot AI', ck, { size: 26 });
      const per = 0.8, n = Math.floor(Math.max(0, t - 1.2) / per);
      const ph = Math.max(0, t - 1.2) - n * per;
      if (t > 1.2 && t < tCard) { const f = Math.exp(-ph * 9); K.glow(ctx, camX, camY, 90, '#ffffff', 0.7 * f); }
      // stack of snapshots: chat thumbnails before the block, black after
      const shots = Math.min(6, n);
      for (let i = 0; i < shots; i++) {
        const tt = 1.2 + (i + 1) * per, blank = tt > tBlock;
        const px = 760 + (i % 3) * 8, py = 880 - i * 14;
        ctx.save(); ctx.translate(px, py); ctx.rotate((H.hash(i, 5) - 0.5) * 0.3);
        roundRect(ctx, -70, -46, 140, 92, 8); ctx.fillStyle = '#f2f4fa'; ctx.fill();
        roundRect(ctx, -62, -38, 124, 76, 4); ctx.fillStyle = blank ? '#05060c' : '#2e3557'; ctx.fill();
        if (!blank) { ctx.fillStyle = ME; roundRect(ctx, -10, -28, 62, 16, 8); ctx.fill(); ctx.fillStyle = '#5b6488'; roundRect(ctx, -52, -4, 70, 16, 8); ctx.fill(); }
        ctx.restore();
      }
      if (t > tBlock + 0.9) pill(770, 990, 'Nothing to see', K.popIn(t, tBlock + 0.9, 0.4), { size: 24, accent: true });
    }
    ctx.restore();
    // quote card with a caged canary
    const qk = K.popIn(t, tCard, 0.5);
    if (qk > 0) {
      card(150, 470, 700, 330, qk, () => {
        // canary in a cage (left)
        const bx = 250, by = 640;
        ctx.strokeStyle = '#c9a94a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(bx, by - 40, 62, Math.PI, 0); ctx.stroke();
        for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(bx + i * 18, by - 40 - Math.sqrt(Math.max(0, 62 * 62 - (i * 18) ** 2))); ctx.lineTo(bx + i * 18, by + 50); ctx.stroke(); }
        ctx.beginPath(); ctx.moveTo(bx - 66, by + 50); ctx.lineTo(bx + 66, by + 50); ctx.lineWidth = 6; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx - 40, by + 20); ctx.lineTo(bx + 40, by + 20); ctx.lineWidth = 4; ctx.strokeStyle = '#9a6a46'; ctx.stroke();
        const hop = Math.abs(Math.sin(t * 5)) * 5;
        ctx.fillStyle = '#ffd43b';
        ctx.beginPath(); ctx.ellipse(bx, by - hop, 26, 20, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(bx + 18, by - 22 - hop, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#e8a817'; ctx.beginPath(); ctx.ellipse(bx - 6, by - hop + 2, 14, 9, -0.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ff9f1c'; ctx.beginPath(); ctx.moveTo(bx + 31, by - 25 - hop); ctx.lineTo(bx + 42, by - 21 - hop); ctx.lineTo(bx + 31, by - 17 - hop); ctx.fill();
        ctx.fillStyle = '#161927'; ctx.beginPath(); ctx.arc(bx + 22, by - 25 - hop, 3, 0, Math.PI * 2); ctx.fill();
        // quote
        text('“', 360, 530, 'display', 90, ACC, 'left');
        const qLines = P.quoteLines || ['Quote goes here'];
        let fs = 40; ctx.font = H.font('display', fs);
        while (fs > 28 && Math.max(...qLines.map((l) => ctx.measureText(l).width)) > 450) { fs -= 2; ctx.font = H.font('display', fs); }
        const all = qLines.join(' ').split(' '), tw = clamp((t - tQ + 0.8) / 1.6);
        let left = Math.ceil(all.length * tw);
        qLines.forEach((l, i) => {
          const ws = l.split(' '), part = ws.slice(0, Math.max(0, left)).join(' '); left -= ws.length;
          if (part) text(part, 370, 615 + i * (fs * 1.25), 'display', fs, '#ffffff', 'left');
        });
        text(P.by || '— Name,', 370, 735, 'ui', 26, '#c9d0ea', 'left');
        text(P.by2 || 'Role', 370, 768, 'ui', 26, '#c9d0ea', 'left');
      });
    }
    ctx.restore();
    return;
  }

  // ================================================================== CAVEAT
  if (mode === 'caveat') {
    const tc = [at(P.c1Cue, 0.21) - 0.3, at(P.c2Cue, 0.34) - 0.3, at(P.c3Cue, 0.52) - 0.3];
    const tAsk = at(P.askCue, 0.68) - 0.3, tOpt = at(P.optCue, 0.93) - 0.5;
    const gaps = P.gaps || ['Gap one', 'Gap two', 'Gap three'];
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 730 }, { t: D, zoom: 1.04, x: 487, y: 730 }]);
    K.world.city(ctx, { t, time: 'night' });
    ctx.fillStyle = 'rgba(8,10,24,0.4)'; ctx.fillRect(0, 0, 1080, 1920);
    const move = smooth(clamp((t - tAsk) / 0.7));
    // phone with a closed shutter, shrinking to the left for phase 2
    const pcx = lerp(270, 230, move), ps = lerp(1, 0.72, move);
    scaleAt(pcx, 1000, ps, () => {
      phone(pcx, 520, 280, 470, { draw: (x, y, ww, hh) => {
        chat(x, y, ww, hh);
        // shutter with visible gaps that open on each cue
        shutter(x, y, ww, hh, 1, { lock: 1, label: 'Blocked', labelSize: 28 });
        for (let i = 0; i < 3; i++) {
          const g = smooth(clamp((t - tc[i]) / 0.4)) * (1 - move);
          if (g <= 0) continue;
          const gy = y + 70 + i * 120;
          ctx.fillStyle = '#121527'; ctx.fillRect(x + ww * 0.15 + i * 30, gy, ww * 0.35 * g, 12);
          K.glow(ctx, x + ww * 0.3 + i * 30, gy + 6, 40, N.danger, 0.4 * g);
        }
      } });
    });
    // small robot slips a file out under the phone at c3
    const fk = clamp((t - tc[2] - 0.2) / 1.4) * (1 - move);
    if (fk > 0) {
      const rx = lerp(470, 520, fk);
      K.drawRobot(ctx, rx, 1035, 0.75, { t, state: 'working', seed: 4 });
      ctx.save(); ctx.translate(rx - 40, 905 - Math.sin(fk * Math.PI) * 10);
      roundRect(ctx, -34, -22, 68, 46, 6); ctx.fillStyle = '#e8b04a'; ctx.fill(); roundRect(ctx, -34, -30, 30, 12, 4); ctx.fill();
      ctx.restore();
    }
    // phase 1: gap pills (right column)
    for (let i = 0; i < 3; i++) {
      const k = K.popIn(t, tc[i], 0.4) * (1 - move);
      if (k <= 0) continue;
      const y = 610 + i * 120;
      ctx.save(); ctx.globalAlpha = clamp(k);
      ctx.font = H.font('ui', 25); const pw = ctx.measureText(gaps[i]).width + 25 * 1.4 + 4;
      pill(490 + pw / 2, y, gaps[i], k, { size: 25 });
      crossDot(455, y - 22, clamp((t - tc[i]) / 0.5));
      ctx.restore();
    }
    // phase 2: three company towers (text pills only), envelopes fly in
    if (move > 0) {
      const names = P.companies || ['Company A', 'Company B', 'Company C'];
      const xs = [480, 640, 800];
      names.forEach((nm, i) => {
        const k = K.popIn(t, tAsk + 0.2 + i * 0.35, 0.45);
        if (k <= 0) return;
        scaleAt(xs[i], 1035, Math.min(1.05, k), () => K.drawBuilding(ctx, xs[i], 1035, 0.62, { t, color: ['#5b6aa8', '#4f7f8a', '#7a5ba8'][i], floors: 6 + i % 2, lit: 0.6 }));
        pill(xs[i], 1035 - 0.62 * (60 + (6 + i % 2) * 44) - 52, nm, k, { size: 24 });
        const u = clamp((t - tAsk - 0.6 - i * 0.6) / 0.9);
        if (u > 0 && u < 1) { const e = easeInOutCubic(u); envelope(lerp(300, xs[i], e), lerp(760, 720, e) - Math.sin(e * Math.PI) * 140, 0.8); }
        if (u >= 1) envelope(xs[i], 990, 0.5);
      });
      const ok = K.popIn(t, tOpt, 0.45);
      if (ok > 0) {
        card(300, 470, 520, 150, ok, () => {
          text(P.askHead || app + ' asks for', 560, 512, 'ui', 26, '#c9d0ea');
          text(P.ask || 'An easy way to opt out', 560, 568, 'display', 34, ACC);
        });
      }
    }
    ctx.restore();
    return;
  }
}
