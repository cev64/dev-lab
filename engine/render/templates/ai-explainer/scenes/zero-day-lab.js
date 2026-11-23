// Scene "zero-day-lab" (full frame). Night street: a cut-away "server house" for an open-source app. Upstairs is the
// UPLOADS room (scan cards on a shelf), downstairs the locked SYSTEM room (server rack + padlock). Its left wall has a
// column of four small API hatches; little AI-agent robots on the street scan them one by one. The top hatch is the
// upload slot: a file chip with a "../" tag goes in, but instead of landing in UPLOADS it slips down a crack in the
// floor into SYSTEM (a path-traversal metaphor; no real exploit steps). A stopwatch races at the top.
// Metaphor only: no logos, no real people; the app's name is a text pill.
// modes (cues are narration words, "word#n" = (n+1)th time, or numbers of scene seconds):
//   hook    cold open: frame 0 already shows files dropping into SYSTEM, red alarm; the stopwatch races to `time`
//           and locks in the accent on `timeCue`; a "NEW FLAW" ring at the crack on `newCue`.
//   map     the story: app pill + `appSub` on `appCue`/`subCue`; robots scan the hatches from `mapCue`, the upload
//           hatch glows on `slotCue`, crack on `holeCue`; stopwatch runs `mapCue` -> `timeCue`; files go in;
//           `writing` pill on `writeCue`.
//   root    camera into SYSTEM: a robot slips a program chip into the STARTUP file (`hideCue`), power flicker on
//           `bootCue`, padlock springs + ROOT banner on `rootCue`, "never reported" pill on `nobodyCue`, ZERO-DAY
//           stamp on `zeroCue`, pull back, patch plate + `fix` pill on `fixCue`, `notYet` pill on `notYetCue`.
//   nonstop institution building + scan-card screen (`uni`, `scan` on `uniCue`/`scanCue`), then the camera pans to
//           a second, hardened server: robots keep knocking while a clock spins and an HOURS counter runs to `hours`
//           on `hoursCue`; on `heldCue` a shield check + HELD stamp.
//   clues   evidence board: assessor pill (`by`), centre "?" card with `actor`, three clue cards (`clues`), a
//           confidence gauge whose needle settles on MODERATE on `confCue`, a NO GROUP NAMED stamp on `namedCue`.
// Library defaults are generic placeholders ("THE APP", "Open-source app", 05:00 min, 12 hours, "Target server",
// "Sensitive data", "Investigators' assessment", "Suspected actor?", "Clue one-three"); pass the story's names and
// published figures (`app`, `appSub`, `minutes`, `hours`, `uni`, `scan`, `by`, `actor`, `clues` [{text, icon, cue}]).
// Fits: "AI agents hacked a server / found a zero-day", path traversal / file upload bugs, attribution caveats.
const RED = '#ff5a52', NAVY = '#0a0c18';

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration;
  const at = (w, d) => {
    if (w == null || w === '') return d;
    if (typeof w === 'number') return w;
    const [wd, n] = String(w).split('#'); const v = info.timeOf(wd, n ? parseInt(n, 10) : 0); return v == null ? d : v;
  };
  const mode = P.mode || 'map';
  const S = { H, K, P, D, t, info, at, ACC: info.accent };
  if (mode === 'hook') return sceneHouse(ctx, S, 'hook');
  if (mode === 'root') return sceneRoot(ctx, S);
  if (mode === 'nonstop') return sceneNonstop(ctx, S);
  if (mode === 'clues') return sceneClues(ctx, S);
  return sceneHouse(ctx, S, 'map');
}

// ---------------------------------------------------------------- house geometry
const HX0 = 400, HX1 = 880, HTOP = 560, FEET = 1030, MID = 795;
const UP = { x0: 430, x1: 860, y0: 590, y1: MID - 10 }, LO = { x0: 430, x1: 860, y0: MID + 12, y1: FEET - 14 };
const HATCH_X = 400, HATCHES = [640, 730, 820, 910]; // centre y of the hatches on the left wall; [0] = upload slot
const CRACK_X = 560;

function house(ctx, S, st) {
  const { H, K, t, ACC } = S, { roundRect, rgba } = H;
  // body
  K.shadow(ctx, (HX0 + HX1) / 2, FEET, HX1 - HX0 + 60);
  roundRect(ctx, HX0 - 10, HTOP, HX1 - HX0 + 20, FEET - HTOP, 18); ctx.fillStyle = '#3a4170'; ctx.fill();
  roundRect(ctx, HX0 - 26, HTOP - 20, HX1 - HX0 + 52, 28, 10); ctx.fillStyle = '#525a90'; ctx.fill();
  // rooms (cut-away)
  const alarm = st.alarm || 0, pulse = alarm * (0.55 + 0.45 * Math.sin(t * 9));
  roundRect(ctx, UP.x0, UP.y0, UP.x1 - UP.x0, UP.y1 - UP.y0, 10); ctx.fillStyle = '#1b2046'; ctx.fill();
  roundRect(ctx, LO.x0, LO.y0, LO.x1 - LO.x0, LO.y1 - LO.y0, 10); ctx.fillStyle = H.mixHex('#141834', '#4a1220', pulse * 0.8); ctx.fill();
  // floor slab between the rooms
  ctx.fillStyle = '#525a90'; ctx.fillRect(UP.x0 - 4, MID - 10, UP.x1 - UP.x0 + 8, 22);
  // room signs
  sign(ctx, H, UP.x1 - 92, UP.y0 + 30, st.upName || 'UPLOADS', '#2a305e', '#cfd6ff');
  sign(ctx, H, LO.x1 - 92, LO.y0 + 30, st.loName || 'SYSTEM', alarm > 0.3 ? RED : '#2a305e', alarm > 0.3 ? '#ffffff' : '#cfd6ff');
  // uploads shelf with scan cards
  ctx.fillStyle = '#3a4170'; ctx.fillRect(UP.x0 + 140, UP.y1 - 70, 250, 10);
  for (let i = 0; i < 4; i++) scanCard(ctx, H, UP.x0 + 172 + i * 60, UP.y1 - 74, 0.42, i);
  // tray under the slot (empty: the files never land here)
  roundRect(ctx, UP.x0 + 18, UP.y0 + 92, 92, 18, 6); ctx.fillStyle = '#2a305e'; ctx.fill();
  // system room: rack + padlock + startup file
  K.drawServerRack(ctx, LO.x0 + 300, LO.y1 - 2, 0.72, { t, activity: 0.5 + 0.5 * alarm, shadow: false });
  if (alarm > 0) K.glow(ctx, LO.x0 + 300, LO.y1 - 90, 170, RED, 0.35 * pulse);
  K.drawLock(ctx, LO.x0 + 170, LO.y1 - 6, 0.62, { open: st.lockOpen || 0, shadow: false });
  if (st.startup) startupFile(ctx, H, LO.x0 + 70, LO.y1 - 8, 0.8, st.startup, ACC);
  // crack in the floor slab
  const ck = st.crack || 0;
  if (ck > 0) {
    ctx.save(); ctx.strokeStyle = rgba('#05060c', 1); ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(CRACK_X - 26 * ck, MID - 10); ctx.lineTo(CRACK_X - 6, MID - 2); ctx.lineTo(CRACK_X + 10, MID + 4); ctx.lineTo(CRACK_X - 4, MID + 12 * ck); ctx.stroke();
    ctx.strokeStyle = rgba(RED, 0.8 * ck); ctx.lineWidth = 3; ctx.stroke(); ctx.restore();
    if (st.patch > 0) patchPlate(ctx, H, CRACK_X, MID + 1, st.patch, ACC);
  }
  // hatches on the left wall
  HATCHES.forEach((hy, i) => {
    const lit = (st.scanned || 0) > i ? 1 : 0, hot = i === 0 ? (st.slot || 0) : 0;
    roundRect(ctx, HATCH_X - 34, hy - 30, 68, 60, 10); ctx.fillStyle = '#1e2240'; ctx.fill();
    roundRect(ctx, HATCH_X - 26, hy - 8, 52, 14, 5); ctx.fillStyle = hot > 0 ? H.mixHex('#05060c', ACC, hot * (0.6 + 0.4 * Math.sin(t * 8))) : '#05060c'; ctx.fill();
    if (lit) { ctx.beginPath(); ctx.arc(HATCH_X - 22, hy - 19, 6, 0, Math.PI * 2); ctx.fillStyle = i === 0 && hot > 0 ? ACC : '#7fe0a0'; ctx.fill(); }
    if (hot > 0) { ctx.save(); ctx.globalAlpha = hot; ctx.strokeStyle = ACC; ctx.lineWidth = 4; roundRect(ctx, HATCH_X - 40, hy - 36, 80, 72, 14); ctx.stroke(); ctx.restore(); }
  });
  // roof name pill
  if (st.namePop > 0) K.drawLabel(ctx, (HX0 + HX1) / 2 + 10, HTOP - 26, Math.min(1.05, st.namePop), { text: st.name, size: 30, accent: true });
}

function sign(ctx, H, x, y, text, bg, fg) {
  ctx.save(); ctx.font = H.font('ui', 24); const w = ctx.measureText(text).width + 28;
  H.roundRect(ctx, x - w / 2, y - 20, w, 40, 8); ctx.fillStyle = bg; ctx.fill();
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, x, y + 1); ctx.restore();
}
// a small generic scan card: dark film with a pale oval "scan"
function scanCard(ctx, H, x, y, s, i) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  H.roundRect(ctx, -60, -150, 120, 150, 10); ctx.fillStyle = '#0d1226'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = '#8fa2d8'; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -78, 38, 48, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(200,220,255,0.55)'; ctx.fill();
  ctx.beginPath(); ctx.ellipse(0, -78, 24, 32, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(120,150,210,0.7)'; ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -110); ctx.lineTo(0, -46); ctx.strokeStyle = 'rgba(230,240,255,0.6)'; ctx.lineWidth = 4; ctx.stroke();
  if (i % 2) { ctx.beginPath(); ctx.arc(14, -90, 8, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,230,140,0.8)'; ctx.fill(); }
  ctx.restore();
}
// file chip with a "../" tag (the traversal path)
function fileChip(ctx, H, x, y, s, acc, a = 1, rot = 0) {
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  H.glow(ctx, 0, 0, 60, acc, 0.3);
  ctx.beginPath(); ctx.moveTo(-26, -32); ctx.lineTo(12, -32); ctx.lineTo(26, -18); ctx.lineTo(26, 32); ctx.lineTo(-26, 32); ctx.closePath();
  ctx.fillStyle = '#f4f1e8'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = acc; ctx.stroke();
  ctx.font = H.font('bold', 22); ctx.fillStyle = '#1b1f3b'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('../', 0, 4);
  ctx.restore();
}
function startupFile(ctx, H, x, y, s, k, acc) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  H.roundRect(ctx, -46, -120, 92, 120, 8); ctx.fillStyle = '#f4f1e8'; ctx.fill();
  if (k > 1) { ctx.lineWidth = 6; ctx.strokeStyle = RED; ctx.globalAlpha = Math.min(1, k - 1); H.roundRect(ctx, -46, -120, 92, 120, 8); ctx.stroke(); ctx.globalAlpha = 1; }
  // gear
  ctx.translate(0, -66); ctx.fillStyle = '#7a819f';
  for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * Math.PI / 4); ctx.fillRect(-6, -30, 12, 12); ctx.restore(); }
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fillStyle = '#f4f1e8'; ctx.fill();
  ctx.restore();
}
function patchPlate(ctx, H, x, y, k, acc) {
  const s = 1 + 0.6 * Math.pow(1 - Math.min(1, k), 2);
  ctx.save(); ctx.globalAlpha = Math.min(1, k * 2); ctx.translate(x, y); ctx.scale(s, s);
  H.roundRect(ctx, -54, -18, 108, 36, 8); ctx.fillStyle = acc; ctx.fill();
  ctx.fillStyle = '#1b1f3b'; for (const bx of [-42, 42]) { ctx.beginPath(); ctx.arc(bx, 0, 5, 0, Math.PI * 2); ctx.fill(); }
  ctx.font = H.font('display', 20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('FIX', 0, 1);
  ctx.restore();
}
// the stopwatch panel (top)
function stopwatch(ctx, S, x, y, sec, pop, locked, label) {
  const { H } = S, { roundRect, rgba } = H, ACC = S.ACC;
  if (pop <= 0) return;
  const k = Math.min(1.05, pop);
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  roundRect(ctx, -250, -62, 500, 124, 24); ctx.fillStyle = 'rgba(10,12,24,0.9)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = locked > 0 ? rgba(ACC, 0.4 + 0.6 * locked) : 'rgba(255,255,255,0.2)'; ctx.stroke();
  // little watch icon
  ctx.save(); ctx.translate(-190, 4);
  ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fillStyle = '#20243f'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = locked > 0 ? ACC : '#cfd6ff'; ctx.stroke();
  H.roundRect(ctx, -8, -48, 16, 10, 3); ctx.fillStyle = '#cfd6ff'; ctx.fill();
  const a = (sec / 60) * Math.PI * 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sin(a) * 24, -Math.cos(a) * 24); ctx.strokeStyle = locked > 0 ? ACC : RED; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke();
  ctx.restore();
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  ctx.font = H.font('display', 76); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillStyle = locked > 0 ? H.mixHex('#ffffff', ACC, locked) : '#ffffff';
  ctx.fillText(String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0'), -132, 8);
  ctx.font = H.font('ui', 26); ctx.fillStyle = rgba('#ffffff', 0.75); ctx.fillText(label || 'MIN', 120, 10);
  ctx.restore();
  if (locked > 0 && locked < 1) { // burst
    ctx.save(); ctx.strokeStyle = rgba(ACC, 1 - locked); ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2, r0 = 150 + 70 * locked; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * r0 * 1.8, y + Math.sin(an) * r0 * 0.6); ctx.lineTo(x + Math.cos(an) * (r0 + 24) * 1.8, y + Math.sin(an) * (r0 + 24) * 0.6); ctx.stroke(); }
    ctx.restore();
  }
}
function appCard(ctx, S, x, y, k, name) {
  const { H } = S;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.font = H.font('display', 64); const w = ctx.measureText(name).width + 140;
  H.roundRect(ctx, -w / 2, -58, w, 116, 24); ctx.fillStyle = 'rgba(10,12,24,0.9)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(S.ACC, 0.7); ctx.stroke();
  scanCard(ctx, H, -w / 2 + 50, 40, 0.5, 1);
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(name, -w / 2 + 100, 4);
  ctx.restore();
}
function miniBot(ctx, S, x, y, s, o = {}) { S.K.drawRobot(ctx, x, y, s, Object.assign({ t: S.t }, o)); }

// ---------------------------------------------------------------- hook / map
function sceneHouse(ctx, S, kind) {
  const { H, K, P, D, t, at, ACC } = S, { clamp, lerp, smooth, easeOutCubic } = H;
  const hook = kind === 'hook';
  // cue times
  const tApp = hook ? -1 : at(P.appCue, 0.6) - 0.2;
  const tSub = hook ? -1 : at(P.subCue, tApp + 2.2) - 0.2;
  const tMap = hook ? -9 : at(P.mapCue, D * 0.45) - 0.2;
  const tSlot = hook ? -9 : at(P.slotCue, tMap + 0.8) - 0.1;
  const tHole = hook ? -9 : at(P.holeCue, tSlot + 1.2) - 0.1;
  const tTime = at(P.timeCue, hook ? 2.3 : tHole + 1) + (hook ? 0.05 : 0.1);
  const tWrite = hook ? -9 : at(P.writeCue, tTime + 0.7) - 0.15;
  const tNew = hook ? at(P.newCue, 1.4) - 0.1 : 1e9;
  const filesFrom = hook ? -3 : tHole + 0.6;
  const alarm = hook ? 1 : smooth((t - tWrite - 0.2) / 0.5);

  ctx.save();
  if (hook) K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 560, y: 790 }, { t: D, zoom: 1.0, x: 520, y: 760 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: tMap, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 500, y: 760 }]);
  K.world.city(ctx, { t, time: 'night', groundY: 1000 });

  const scanned = hook ? 4 : clamp(Math.floor((t - tMap) / 0.45) + 1, 0, 4);
  house(ctx, S, {
    alarm, crack: hook ? 1 : smooth((t - tHole) / 0.35), slot: hook ? 1 : smooth((t - tSlot) / 0.3), scanned,
  });
  // robots on the street (left)
  const bots = [{ x: 205, s: 0.68, seed: 2 }, { x: 310, s: 0.74, seed: 5 }, { x: 255, s: 0.52, seed: 9 }];
  const walkIn = hook ? 1 : easeOutCubic(clamp((t - 0.2) / 1.4));
  miniBot(ctx, S, lerp(-260, bots[2].x, walkIn), 1000, bots[2].s, { state: hook ? 'working' : 'thinking', seed: 9 });
  bots.forEach((b, i) => {
    const x = lerp(-140 - i * 60, b.x, walkIn);
    const working = hook || (t > tMap && t < tWrite + 0.5);
    if (i === 2) return; // drawn first (behind), below
    miniBot(ctx, S, x, 1030, b.s, { state: t > tWrite + 0.5 && !hook ? 'happy' : working ? 'working' : 'idle', seed: b.seed });
  });
  // scan beam from bot 1 to the current hatch
  if (!hook && t > tMap && t < tSlot + 1.0) {
    const hi = clamp(Math.floor((t - tMap) / 0.45), 0, 3), hy = t > tSlot ? HATCHES[0] : HATCHES[hi];
    const bx = lerp(-140, bots[1].x, walkIn) + 20, by = 1030 - 155 * bots[1].s;
    ctx.save(); ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 12);
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(HATCH_X - 34, hy - 30); ctx.lineTo(HATCH_X - 34, hy + 30); ctx.closePath();
    ctx.fillStyle = ACC; ctx.fill(); ctx.restore();
  }
  // files: thrown from the bot into the upload hatch, then fall down the crack into SYSTEM
  if (t > filesFrom) {
    for (let i = 0; i < 6; i++) {
      const st = filesFrom + i * (hook ? 0.55 : 0.6) + (hook ? -0.2 : 0);
      const u = (t - st) / 1.7;
      if (u <= 0) continue;
      if (!hook && i > 2 && t < tWrite) continue;
      const done = u >= 1;
      // path: bot -> hatch -> along floor -> crack -> drop to the system floor pile
      let x, y, rot = 0;
      const sx = bots[1].x + 30, sy = 1030 - 150;
      if (u < 0.35) { const e = easeOutCubic(u / 0.35); x = lerp(sx, HATCH_X, e); y = lerp(sy, HATCHES[0], e) - Math.sin(e * Math.PI) * 90; rot = e * 0.25; }
      else if (u < 0.6) { const e = (u - 0.35) / 0.25; x = lerp(HATCH_X + 30, CRACK_X, e); y = HATCHES[0] + 20 + e * (MID - 34 - HATCHES[0] - 20); rot = 0.25 - e * 0.1; }
      else { const e = Math.min(1, (u - 0.6) / 0.4); x = CRACK_X + e * (40 + (i % 3) * 34); y = lerp(MID, LO.y1 - 32 - (i % 2) * 18, e * e); rot = 0.15 + e * 0.3 * ((i % 3) - 1); }
      if (done) { x = CRACK_X + 40 + (i % 3) * 34; y = LO.y1 - 32 - (i % 2) * 18; rot = 0.15 * ((i % 3) - 1); }
      fileChip(ctx, H, x, y, 0.95, ACC, 1, rot);
    }
  }
  // NEW FLAW ring (hook)
  if (hook) {
    const r = K.popIn(t, tNew, 0.45);
    if (r > 0) {
      ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 6; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.arc(CRACK_X, MID, 58 * Math.min(1.05, r) + 4 * Math.sin(t * 6), 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      K.drawLabel(ctx, CRACK_X + 10, MID - 66, Math.min(1.05, r), { text: P.newText || 'NEW FLAW', size: 28, accent: true });
    }
  }
  ctx.restore();

  // overlays (no camera)
  if (!hook) { // app name + what it is, until the mapping starts (the stopwatch takes the top)
    const out = 1 - smooth((t - tMap + 0.1) / 0.3);
    const nk = K.popIn(t, tApp, 0.45), sk = K.popIn(t, tSub, 0.45);
    ctx.save(); ctx.globalAlpha = out;
    if (nk > 0 && out > 0) appCard(ctx, S, 487, 520, Math.min(1.05, nk), P.app || 'THE APP');
    if (sk > 0 && out > 0) K.drawLabel(ctx, 487, 640, Math.min(1.05, sk), { text: P.appSub || 'Open-source app', size: 28, dot: true });
    ctx.restore();
  }
  // stopwatch: hook races 09:30 -> 11:00; map runs 00:00 -> 11:00 from mapCue to timeCue
  const target = (P.minutes || 5) * 60;
  const t0 = hook ? -0.3 : tMap, from = hook ? target - 95 : 0;
  const sec = t < t0 ? from : Math.min(target, lerp(from, target, H.easeInOutCubic(clamp((t - t0) / (tTime - t0)))));
  const pop = hook ? 1 : K.popIn(t, tMap, 0.45);
  if (pop > 0) {
    const y = hook ? 480 : 500;
    stopwatch(ctx, S, 487, y, sec, pop, clamp((t - tTime) / 0.6), P.timeLabel || 'MIN');
  }
  if (!hook) {
    const wk = K.popIn(t, tWrite, 0.45);
    if (wk > 0) K.drawLabel(ctx, 640, 1000, Math.min(1.05, wk), { text: P.writing || 'Writing files on the server', size: 28, accent: true });
  }
}

// ---------------------------------------------------------------- root
function sceneRoot(ctx, S) {
  const { H, K, P, D, t, at, ACC } = S, { clamp, lerp, smooth, easeOutCubic } = H;
  const tHide = at(P.hideCue, 0.5) - 0.2, tBoot = at(P.bootCue, 2.5) - 0.2, tRoot = at(P.rootCue, 3.5) - 0.15;
  const tNobody = at(P.nobodyCue, 5.8) - 0.2, tZero = at(P.zeroCue, 8) - 0.1, tFix = at(P.fixCue, 9) - 0.2, tNot = at(P.notYetCue, 10.5) - 0.2;
  const rooted = smooth((t - tRoot) / 0.4);
  const alarm = Math.max(0.35, rooted) * (1 - smooth((t - tFix - 0.3) / 0.8)) ;
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.32, x: 640, y: 880 }, { t: tZero - 0.6, zoom: 1.34, x: 640, y: 870 }, { t: tFix, zoom: 1.04, x: 560, y: 790 }, { t: D, zoom: 1.06, x: 560, y: 790 }]);
  K.cameraShake && t > tRoot && t < tRoot + 0.5 && K.cameraShake(ctx, t, tRoot, 0.4, 8);
  K.world.city(ctx, { t, time: 'night', groundY: 1000 });
  // boot flicker: room lights blink off/on
  const boot = t > tBoot && t < tBoot + 0.7 ? (Math.sin((t - tBoot) * 40) > 0 ? 1 : 0) : 0;
  house(ctx, S, {
    alarm: boot ? 0 : alarm, crack: 1, slot: 0, scanned: 4, lockOpen: easeOutCubic(clamp((t - tRoot) / 0.5)),
    startup: t > tHide + 0.8 ? 1 + smooth((t - tBoot) / 0.4) : 1, patch: K.popIn(t, tFix + 0.2, 0.5),
  });
  if (boot) { ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(LO.x0, LO.y0, LO.x1 - LO.x0, LO.y1 - LO.y0); ctx.restore(); }
  // the file pile from before
  for (let i = 0; i < 4; i++) fileChip(ctx, H, CRACK_X + 40 + (i % 3) * 34, LO.y1 - 32 - (i % 2) * 18, 0.8, ACC, 1, 0.15 * ((i % 3) - 1));
  // robot inside the system room
  const rx = LO.x0 + 120 + 0 * t, ry = LO.y1;
  const hop = t > tRoot && t < tRoot + 0.6 ? -Math.sin((t - tRoot) / 0.6 * Math.PI) * 26 : 0;
  miniBot(ctx, S, LO.x0 + 250, ry + hop, 0.62, { state: t > tRoot ? 'happy' : 'working', seed: 4 });
  // program chip into the startup file
  if (t > tHide) {
    const u = clamp((t - tHide) / 0.8), e = easeOutCubic(u);
    if (u < 1) {
      const x = lerp(LO.x0 + 230, LO.x0 + 70, e), y = lerp(LO.y1 - 130, LO.y1 - 60, e) - Math.sin(u * Math.PI) * 50;
      ctx.save(); ctx.translate(x, y); H.glow(ctx, 0, 0, 40, ACC, 0.4);
      H.roundRect(ctx, -26, -18, 52, 36, 8); ctx.fillStyle = '#161927'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.font = H.font('bold', 18); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('</>', 0, 1); ctx.restore();
    }
  }
  const sp = K.popIn(t, tHide + 0.4, 0.4);
  if (sp > 0 && t < tRoot) K.drawLabel(ctx, LO.x0 + 80, LO.y0 + 42, Math.min(1.05, sp), { text: P.startup || 'Runs at startup', size: 24, dot: true });
  // power icon flash on boot
  if (t > tBoot && t < tBoot + 1.0) {
    const a = 1 - smooth((t - tBoot - 0.6) / 0.4);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(LO.x0 + 300, LO.y0 + 40); ctx.strokeStyle = ACC; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, 0, 22, -Math.PI * 0.3, Math.PI * 1.3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, -28); ctx.lineTo(0, -4); ctx.stroke(); ctx.restore();
  }
  ctx.restore();

  // overlays
  const rp = K.popIn(t, tRoot, 0.45);
  if (rp > 0) {
    const y = lerp(600, 500, smooth((t - tNobody) / 0.5));
    const k = Math.min(1.05, rp);
    ctx.save(); ctx.translate(487, y); ctx.scale(k, k);
    H.roundRect(ctx, -270, -70, 540, 140, 26); ctx.fillStyle = 'rgba(10,12,24,0.9)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = RED; ctx.stroke();
    ctx.font = H.font('display', 84); ctx.fillStyle = RED; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.root || 'ROOT', 0, -8);
    ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.fillText((P.rootSub || 'Total control').toUpperCase(), 0, 46);
    ctx.restore();
  }
  const np = K.popIn(t, tNobody, 0.45);
  if (np > 0) K.drawLabel(ctx, 487, 640, Math.min(1.05, np), { text: P.nobody || 'Never reported before', size: 28, dot: true });
  if (t > tZero && t < tFix + 0.4) {
    const a = 1 - smooth((t - tFix) / 0.4);
    ctx.save(); ctx.globalAlpha = a; K.drawStamp(ctx, 700, 900, 1.0, { kind: 'cross', text: P.zero || 'ZERO-DAY', land: (t - tZero) / 0.5 }); ctx.restore();
  }
  const fp = K.popIn(t, tFix + 0.3, 0.45);
  if (fp > 0) K.drawLabel(ctx, 330, 735, Math.min(1.05, fp), { text: P.fix || 'Fix merged', size: 28, accent: true });
  const yp = K.popIn(t, tNot, 0.45);
  if (yp > 0) {
    K.drawLabel(ctx, 600, 735, Math.min(1.05, yp), { text: P.notYet || 'Patched version: not yet', size: 28, dot: true });
  }
}

// ---------------------------------------------------------------- nonstop
function sceneNonstop(ctx, S) {
  const { H, K, P, D, t, at, ACC } = S, { clamp, lerp, smooth, easeInOutCubic, easeOutCubic, roundRect, rgba } = H;
  const tUni = at(P.uniCue, 1.0) - 0.2, tScan = at(P.scanCue, 2.3) - 0.2, tPan = at(P.panCue, 4.2), tAnother = at(P.anotherCue, 6.2) - 0.2;
  const tHours = at(P.hoursCue, 7.9), tHeld = at(P.heldCue, 10.1) - 0.2;
  const pan = 900 * easeInOutCubic(clamp((t - tPan) / Math.max(0.8, tAnother - tPan)));
  K.world.city(ctx, { t, time: 'night', groundY: 1000 });
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
  ctx.translate(-pan, 0);
  // ---- phase 1: institution building with a scan-card screen
  if (pan < 1000) {
    const bx = 487, fy = 1030;
    K.shadow(ctx, bx, fy, 640);
    roundRect(ctx, bx - 300, 640, 600, fy - 640, 10); ctx.fillStyle = '#4a5288'; ctx.fill();
    // pediment
    ctx.beginPath(); ctx.moveTo(bx - 330, 650); ctx.lineTo(bx, 520); ctx.lineTo(bx + 330, 650); ctx.closePath(); ctx.fillStyle = '#5c66a6'; ctx.fill();
    ctx.beginPath(); ctx.arc(bx, 605, 26, 0, Math.PI * 2); ctx.fillStyle = '#2a305e'; ctx.fill();
    for (let i = 0; i < 6; i++) { roundRect(ctx, bx - 270 + i * 104, 670, 30, fy - 700, 6); ctx.fillStyle = '#6c76b6'; ctx.fill(); }
    roundRect(ctx, bx - 320, fy - 30, 640, 30, 4); ctx.fillStyle = '#5c66a6'; ctx.fill();
    // server rack visible in the doorway
    roundRect(ctx, bx - 70, 800, 140, 200, 10); ctx.fillStyle = '#10142a'; ctx.fill();
    K.drawServerRack(ctx, bx, 1000, 0.75, { t, activity: 0.7, shadow: false });
    const up = K.popIn(t, tUni, 0.45);
    if (up > 0) K.drawLabel(ctx, bx, 500, Math.min(1.05, up), { text: P.uni || 'Target server', size: 30, accent: true });
    // big scan screen floating to the right of the door
    const sp = K.popIn(t, tScan, 0.5);
    if (sp > 0) {
      ctx.save(); ctx.translate(bx + 190, 940 + K.bob(t, 4, 1.2, 0)); ctx.scale(Math.min(1.05, sp), Math.min(1.05, sp));
      roundRect(ctx, -105, -250, 210, 250, 16); ctx.fillStyle = '#0d1226'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#8fa2d8'; ctx.stroke();
      scanCard(ctx, H, 0, -24, 1.3, 1);
      ctx.restore();
      K.drawLabel(ctx, bx + 190, 655, Math.min(1.05, sp), { text: P.scan || 'Sensitive data', size: 26, dot: true });
    }
    // two bots leaving towards the right
    for (let i = 0; i < 2; i++) {
      const x = lerp(bx - 230 + i * 60, bx + 700 + i * 60, easeInOutCubic(clamp((t - tPan + 0.6) / 2.4)));
      miniBot(ctx, S, x, 1030, 0.55, { state: 'idle', seed: 3 + i });
    }
  }
  // ---- phase 2: a hardened server (fortress) at x + 900
  {
    const fx = 487 + 900, fy = 1030;
    // walls
    K.shadow(ctx, fx + 80, fy, 600);
    roundRect(ctx, fx - 140, 640, 480, fy - 640, 12); ctx.fillStyle = '#3a4170'; ctx.fill();
    for (let i = 0; i < 6; i++) { roundRect(ctx, fx - 140 + i * 84, 610, 56, 44, 6); ctx.fillStyle = '#3a4170'; ctx.fill(); }
    for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) { roundRect(ctx, fx - 128 + c * 80 + (r % 2) * 40, 670 + r * 70, 64, 4, 2); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill(); }
    // door with a shield
    roundRect(ctx, fx - 70, 820, 160, fy - 820, 14); ctx.fillStyle = '#1e2240'; ctx.fill();
    const hit = t > tAnother ? Math.abs(Math.sin((t - tAnother) * 7)) : 0;
    K.drawShield(ctx, fx + 10, 990 - hit * 2, 0.95, { check: smooth((t - tHeld - 0.1) / 0.5), shadow: false });
    // sparks on hits
    if (t > tAnother && t < tHeld + 0.3) for (let i = 0; i < 6; i++) {
      const ph = ((t - tAnother) * 3.5 + i / 6) % 1, an = -2.6 + i * 0.25;
      ctx.beginPath(); ctx.arc(fx - 52 + Math.cos(an) * ph * 70, 930 + Math.sin(an) * ph * 70, 5 * (1 - ph), 0, Math.PI * 2); ctx.fillStyle = rgba(ACC, 1 - ph); ctx.fill();
    }
    // robots knocking
    [[fx - 300, 0.66, 2], [fx - 190, 0.6, 6], [fx - 400, 0.52, 8]].forEach(([x, s, seed], i) => {
      const knock = t > tAnother && t < tHeld ? Math.max(0, Math.sin((t - tAnother) * 7 + i)) * 14 : 0;
      miniBot(ctx, S, x + knock, 1030, s, { state: t < tHeld ? 'working' : 'thinking', seed });
    });
    // spinning clock on the wall
    K.drawClock(ctx, fx + 230, 780, 0.8, { t: t > tAnother ? Math.min(t, tHeld) - tAnother : 0, speed: 1.6, hour: 9, shadow: false });
  }
  ctx.restore();
  // overlays: hours counter + held stamp
  const hp = K.popIn(t, tAnother, 0.45);
  if (hp > 0) {
    const tot = P.hours || 12, hrs = Math.round(tot * easeOutCubic(clamp((t - tAnother) / Math.max(0.6, tHours - tAnother + 0.3))));
    const k = Math.min(1.05, hp);
    ctx.save(); ctx.translate(487, 520); ctx.scale(k, k);
    roundRect(ctx, -230, -70, 460, 140, 26); ctx.fillStyle = 'rgba(10,12,24,0.9)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.7); ctx.stroke();
    ctx.font = H.font('display', 92); ctx.fillStyle = ACC; ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(String(hrs), 20, 4);
    ctx.font = H.font('display', 44); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.fillText(P.hoursLabel || 'HOURS', 40, 0);
    ctx.font = H.font('ui', 24); ctx.fillStyle = rgba('#ffffff', 0.7); ctx.fillText(P.hoursSub || 'NO BREAKS', 42, 40);
    ctx.restore();
  }
  if (t > tHeld) K.drawStamp(ctx, 700, 820, 0.9, { kind: 'check', text: P.held || 'HELD', land: (t - tHeld) / 0.5 });
}

// ---------------------------------------------------------------- clues
function sceneClues(ctx, S) {
  const { H, K, P, D, t, at, ACC } = S, { clamp, lerp, smooth, easeOutCubic, roundRect, rgba } = H;
  const tBy = at(P.byCue, 1.4) - 0.2, tActor = at(P.actorCue, 2.2) - 0.2, tConf = at(P.confCue, 3.6) - 0.6;
  const clues = P.clues || [
    { text: 'Clue one', icon: 'chat' },
    { text: 'Clue two', icon: 'clock' },
    { text: 'Clue three', icon: 'pin' },
  ];
  const tNamed = at(P.namedCue, D * 0.9) - 0.25;
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 720 }]);
  K.world.room(ctx, { t, time: 'night', lamp: true, window: false, picture: false, plant: true });
  // corkboard
  const bx0 = 95, bx1 = 880, by0 = 490, by1 = 835;
  roundRect(ctx, bx0 - 14, by0 - 14, bx1 - bx0 + 28, by1 - by0 + 28, 16); ctx.fillStyle = '#5a3d2a'; ctx.fill();
  roundRect(ctx, bx0, by0, bx1 - bx0, by1 - by0, 10); ctx.fillStyle = '#b98a5a'; ctx.fill();
  for (let i = 0; i < 60; i++) { ctx.beginPath(); ctx.arc(bx0 + H.hash(i, 1) * (bx1 - bx0), by0 + H.hash(i, 2) * (by1 - by0), 2.5, 0, Math.PI * 2); ctx.fillStyle = 'rgba(80,50,30,0.35)'; ctx.fill(); }
  // centre card: "?"
  const cx = 487, cy = 600;
  const cards = clues.slice(0, 3).map((c, i) => ({ ...c, x: [235, 487, 740][i], y: 755, t: at(c.cue, D * (0.45 + i * 0.12)) - 0.25 }));
  // strings
  cards.forEach((c) => { const k = smooth((t - c.t - 0.2) / 0.4); if (k > 0) { ctx.save(); ctx.strokeStyle = '#d23a3a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx, cy + 40); ctx.lineTo(lerp(cx, c.x, k), lerp(cy + 40, c.y - 50, k)); ctx.stroke(); ctx.restore(); } });
  roundRect(ctx, cx - 110, cy - 90, 220, 170, 10); ctx.fillStyle = '#f4f1e8'; ctx.fill();
  ctx.save(); ctx.translate(cx, cy - 6); ctx.rotate(Math.sin(t * 1.5) * 0.03);
  ctx.font = H.font('display', 110); ctx.fillStyle = '#2a2f45'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 0); ctx.restore();
  ctx.beginPath(); ctx.arc(cx, cy - 80, 9, 0, Math.PI * 2); ctx.fillStyle = '#d23a3a'; ctx.fill();
  const ap = K.popIn(t, tActor, 0.45);
  if (ap > 0) K.drawLabel(ctx, cx, cy + 66, Math.min(1.05, ap), { text: P.actor || 'Suspected actor?', size: 26, accent: true });
  // clue cards
  cards.forEach((c, i) => {
    const k = K.popIn(t, c.t, 0.45); if (k <= 0) return;
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate((i - 1) * 0.04); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
    roundRect(ctx, -118, -62, 236, 124, 10); ctx.fillStyle = '#fffbe6'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, -54, 8, 0, Math.PI * 2); ctx.fillStyle = '#d23a3a'; ctx.fill();
    icon(ctx, H, c.icon, -78, -2);
    ctx.font = H.font('bold', 24); ctx.fillStyle = '#1b1f3b'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    const lines = H.wrap(ctx, c.text, 'bold', 24, 156);
    (Array.isArray(lines) ? lines : [c.text]).slice(0, 3).forEach((l, j, arr) => ctx.fillText(l, -44, (j - (arr.length - 1) / 2) * 28));
    ctx.restore();
  });
  ctx.restore();
  // assessor pill (top)
  const bp = K.popIn(t, tBy, 0.45);
  if (bp > 0) K.drawLabel(ctx, 487, 480, Math.min(1.05, bp), { text: P.by || "Investigators' assessment", size: 28, dot: true });
  // confidence gauge (below the board)
  const gp = K.popIn(t, tConf, 0.45);
  if (gp > 0) {
    const gx = 487, gy = 1035, R = 150, k = 0.8 * Math.min(1.05, gp);
    ctx.save(); ctx.translate(gx, gy); ctx.scale(k, k);
    roundRect(ctx, -250, -200, 500, 215, 24); ctx.fillStyle = 'rgba(10,12,24,0.92)'; ctx.fill();
    const segs = [['#ff8a6b', 'LOW'], [ACC, 'MODERATE'], ['#7fe0a0', 'HIGH']];
    segs.forEach(([col, lab], i) => {
      const a0 = Math.PI + i * Math.PI / 3 + 0.03, a1 = Math.PI + (i + 1) * Math.PI / 3 - 0.03;
      ctx.beginPath(); ctx.arc(0, -10, R, a0, a1); ctx.strokeStyle = i === 1 ? col : rgba(col, 0.35); ctx.lineWidth = 26; ctx.stroke();
    });
    ctx.font = H.font('ui', 22); ctx.fillStyle = rgba('#ffffff', 0.6); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('LOW', -150, 4); ctx.fillText('HIGH', 150, 4);
    // needle swings and settles on the middle
    const u = clamp((t - tConf - 0.2) / 1.4);
    const ang = (u < 1 ? Math.sin(u * 9) * 0.9 * (1 - u) : 0) - (1 - easeOutCubic(Math.min(1, u * 3))) * 1.2;
    ctx.save(); ctx.translate(0, -10); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(0, -R + 26); ctx.lineTo(8, 0); ctx.closePath(); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(0, -10, 14, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
    const lk = smooth((t - tConf - 1.0) / 0.4);
    ctx.font = H.font('display', 30); ctx.fillStyle = H.mixHex('#ffffff', ACC, lk); ctx.fillText(P.conf || 'MODERATE CONFIDENCE', 0, -184 + 0 * lk);
    ctx.restore();
  }
  if (t > tNamed) K.drawStamp(ctx, cx + 255, cy + 105, 1.0, { kind: 'cross', text: P.named || 'NO GROUP NAMED', land: (t - tNamed) / 0.5 });
}

function icon(ctx, H, kind, x, y) {
  ctx.save(); ctx.translate(x, y);
  ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fillStyle = '#2a305e'; ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  if (kind === 'chat') { H.roundRect(ctx, -17, -14, 34, 22, 6); ctx.fill(); ctx.beginPath(); ctx.moveTo(-8, 8); ctx.lineTo(-12, 17); ctx.lineTo(2, 8); ctx.fill(); }
  else if (kind === 'clock') { ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -10); ctx.moveTo(0, 0); ctx.lineTo(8, 4); ctx.stroke(); }
  else { ctx.beginPath(); ctx.arc(0, -6, 11, Math.PI, 0); ctx.lineTo(0, 17); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(0, -6, 4, 0, Math.PI * 2); ctx.fillStyle = '#2a305e'; ctx.fill(); }
  ctx.restore();
}
