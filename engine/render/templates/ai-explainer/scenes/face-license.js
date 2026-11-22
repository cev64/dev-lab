// Scene "face-license" (full frame; from 2026-11-22). An actor licenses his face to an AI studio and a glowing
// "AI copy" of him (a cyan hologram of the same generic cartoon) goes off to act on its own. The actor is a generic
// kit cartoon (never a real person); the studio is plain text, no logos, no posters.
// modes:
//  hook    : cold open (~3 s). Night sound stage; the actor stands in a scanner arch, the scan line is already sweeping
//            at frame 0; a beam fires right at ~0.35 s and his hologram copy builds bottom-up beside him (done ~1.3 s),
//            waves; a stamp (`stamp`, "LICENSED") slams at ~1.6 s. Loop target.
//  deal    : who/credit pills over the actor (whoCue/creditCue); a face card flies from him to a studio desk with a
//            laptop (faceCue) and the studio pills pop (studioCue); then the desk slides away and a big phone rises
//            playing the hologram copy under a series title (titleCue) + "AI-made" pill, then a premiere pill (premiereCue)
//  plot    : a framed "IN THE SHOW" screen: the actor ("Plays himself", playsCue) hands a face card to a studio exec
//            (handCue); the copy steps out of the exec's laptop (doubleCue); police lights sweep, a case file pill lands
//            over the copy (caseCue); the real actor turns shocked and a "didn't do it" pill lands (innocentCue)
//  market  : night market board: a 3x2 grid of generic cartoon face cards, each gets a swinging price tag; a place pill
//            (placeCue) and a big price range: low (lowCue), then low – high (highCue); source pill (srcCue); the first
//            and last price tags read `low` / `high` (defaults "X" / "Y": pass the published figures)
//  you     : night living room; a viewer on the sofa scans their face with a phone (scanCue); a hanging "FOR RENT"
//            sign drops (rentCue); a wall screen lights with their hologram copy acting in shifting sets (copyCue),
//            "never filmed" pill (neverCue)
//  caveat  : a big contract: "Pay" line with shimmering question marks (payCue), blacked out + "Not disclosed" pill
//            (hiddenCue); then it shrinks aside, the actor walks to a director's chair and sits, a clapperboard snaps and
//            a "Helped make creative calls" pill lands (chairCue)
// params: see the modes; cues are narration words ("word#n" = the (n+1)th time spoken), else fractions of the scene.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration;
  const { clamp, lerp, smooth, easeOutCubic, easeInOutCubic, roundRect, rgba, mixHex } = H;
  const ACC = info.accent, N = K.NEUTRAL, mode = P.mode || 'hook';
  const TAU = Math.PI * 2;
  const HOLO = '#62e6ff', HOLO_D = '#1d9fc4', HOLO_L = '#c9f8ff';
  const at = (w, f) => {
    if (w == null || w === '') return D * f;
    if (typeof w === 'number') return w;
    const m = String(w).match(/^(.*)#(\d+)$/);
    const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? D * f : v;
  };
  const rr = (x, y, w, h, r, col) => { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = col; ctx.fill(); };
  const circ = (x, y, r, col) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = col; ctx.fill(); };
  const pop = (t0, d = 0.4) => K.popIn(t, t0, d);
  function pill(x, y, k, text, o = {}) {
    if (k <= 0 || !text) return;
    const size = o.size || 30;
    ctx.save(); ctx.font = K.font.ui(size); const w = ctx.measureText(String(text)).width + size * 1.4 + (o.dot ? size * 0.8 : 0) + 4; ctx.restore();
    let cx = o.left ? x + w / 2 : x;
    cx = Math.max(140 + w / 2, Math.min(840 - w / 2, cx));
    K.drawLabel(ctx, cx, y, Math.min(1.08, k), Object.assign({ text, size }, o));
  }
  function text(str, x, y, kind, size, col, align = 'center', base = 'alphabetic') {
    ctx.font = K.font[kind](size); ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = base; ctx.fillText(str, x, y);
  }
  // the actor: one fixed generic look in every mode
  const ACTOR = { skin: 2, hair: 0, shirt: '#e8786a', pants: '#2d3350', hairStyle: 'short', seed: 3 };
  function actor(x, y, s, o = {}, s2) { K.drawPerson(ctx, x, y, s2 || s, Object.assign({ t }, ACTOR, o)); }
  // hologram copy of a person look: cyan, translucent, scanlines, flicker. reveal 0..1 builds bottom-up
  function holo(x, y, s, o = {}) {
    const reveal = clamp(o.reveal == null ? 1 : o.reveal), a = o.alpha == null ? 1 : o.alpha;
    if (reveal <= 0 || a <= 0) return;
    const h = 262 * s, top = y - h * reveal;
    K.glow(ctx, x, y - 120 * s, 190 * s, HOLO, 0.22 * a * reveal);
    ctx.save();
    ctx.beginPath(); ctx.rect(x - 120 * s, top - 2, 240 * s, h * reveal + 40 * s); ctx.clip();
    ctx.globalAlpha = a * (0.80 + 0.07 * Math.sin(t * 19 + x * 0.1));
    K.drawPerson(ctx, x, y, s, Object.assign({ t, seed: 9 }, o.look || ACTOR, o.person || {},
      { skin: HOLO_L, hair: HOLO_D, shirt: HOLO, pants: HOLO_D }));
    // scanlines over the body (thin, drifting)
    ctx.globalAlpha = a * 0.22; ctx.fillStyle = '#ffffff';
    const off = ((t * 30) % 10) * s;
    for (let yy = y - h + off; yy < y; yy += 10 * s) ctx.fillRect(x - 62 * s, yy, 124 * s, 2 * s);
    ctx.restore();
    if (reveal < 1) { // build line
      ctx.save(); ctx.globalAlpha = a; rr(x - 95 * s, top - 3, 190 * s, 6, 3, HOLO_L); K.glow(ctx, x, top, 120 * s, HOLO, 0.5); ctx.restore();
    }
    // floating mesh dots around the head
    ctx.save(); ctx.globalAlpha = a * reveal * 0.8;
    for (let i = 0; i < 7; i++) {
      const ang = t * 0.9 + i * TAU / 7, r = 62 * s;
      circ(x + Math.cos(ang) * r, y - 212 * s + Math.sin(ang) * r * 0.35, 3.2 * s, HOLO_L);
    }
    ctx.restore();
  }
  // a little face card (head-and-shoulders portrait of a generic look)
  function faceCard(cx, cy, w, h, look, o = {}) {
    const k = o.k == null ? 1 : o.k; if (k <= 0) return;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.rot || 0); ctx.scale(k, k);
    rr(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 18, o.holo ? HOLO : '#f2f4fa');
    rr(-w / 2, -h / 2, w, h, 14, o.bg || '#2c3463');
    ctx.save(); roundRect(ctx, -w / 2, -h / 2, w, h, 14); ctx.clip();
    const s = h / 150;
    const look2 = o.holo ? Object.assign({}, look, { skin: HOLO_L, hair: HOLO_D, shirt: HOLO, pants: HOLO_D }) : look;
    K.drawPerson(ctx, 0, h / 2 + 150 * s, s * 1.0, Object.assign({ t: o.t == null ? t : o.t, mood: o.mood || 'happy', look: 0 }, look2));
    ctx.restore();
    ctx.restore();
  }
  // a sound-stage backdrop (night)
  function stage(o = {}) {
    const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#0c0f2e'); g.addColorStop(0.5, '#161a43'); g.addColorStop(1, '#070815');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    for (let i = 0; i < 9; i++) rr(i * 124 - 20, 300, 110, 730, 8, i % 2 ? '#191e48' : '#1c224f');
    const fg = ctx.createLinearGradient(0, 1030, 0, 1920); fg.addColorStop(0, '#23284c'); fg.addColorStop(1, '#090a16');
    ctx.fillStyle = fg; ctx.fillRect(0, 1030, 1080, 890);
    rr(0, 1026, 1080, 10, 0, '#2c3260');
    for (const [lx, dir] of [[70, 1], [1010, -1]]) {
      ctx.save(); ctx.globalAlpha = 0.09 + 0.03 * Math.sin(t * 1.4 + lx);
      ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.moveTo(lx, 360); ctx.lineTo(lx + dir * 560, 980); ctx.lineTo(lx + dir * 300, 1040); ctx.closePath(); ctx.fill(); ctx.restore();
      rr(lx - 6, 360, 12, 680, 6, '#3b4260');
      ctx.save(); ctx.translate(lx, 360); ctx.rotate(dir * 0.7); rr(-34, -26, 68, 52, 10, '#3b4260'); circ(dir * 30, 0, 18, '#fff3c4'); ctx.restore();
    }
  }
  // scanner arch around a standing person at x (feet y)
  function arch(x, y, w, h, scanT, on = 1) {
    const L = x - w / 2, R = x + w / 2, T = y - h;
    K.shadow(ctx, x, y + 4, w + 60);
    rr(L - 22, T, 26, h, 10, '#3b4260'); rr(R - 4, T, 26, h, 10, '#3b4260');
    rr(L - 30, T - 26, w + 60, 34, 14, '#4a5378');
    for (let i = 0; i < 5; i++) circ(L - 9, T + 40 + i * (h - 80) / 4, 5, H.hash(i, Math.floor(t * 3)) > 0.4 ? HOLO : '#2a3050');
    for (let i = 0; i < 5; i++) circ(R + 9, T + 40 + i * (h - 80) / 4, 5, H.hash(i + 7, Math.floor(t * 3)) > 0.4 ? HOLO : '#2a3050');
    if (on > 0) {
      const sy = T + 20 + (h - 30) * (0.5 - 0.5 * Math.cos(scanT * 2.6));
      ctx.save(); ctx.globalAlpha = on;
      const gr = ctx.createLinearGradient(0, sy - 60, 0, sy);
      gr.addColorStop(0, rgba(HOLO, 0)); gr.addColorStop(1, rgba(HOLO, 0.35));
      ctx.fillStyle = gr; ctx.fillRect(L, sy - 60, w, 60);
      rr(L, sy - 3, w, 6, 3, HOLO_L); K.glow(ctx, x, sy, w * 0.6, HOLO, 0.35);
      ctx.restore();
    }
  }
  function beam(x0, y0, x1, y1, k) {
    if (k <= 0) return;
    ctx.save(); ctx.globalAlpha = clamp(k);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const f = ((t * 1.6 + i / n) % 1);
      const px = lerp(x0, x1, f), py = lerp(y0, y1, f) + Math.sin(f * 7 + i) * 14;
      rr(px - 9, py - 9, 18, 18, 4, i % 3 ? HOLO : HOLO_L);
    }
    ctx.restore();
  }
  function laptopDesk(x, y, s, o = {}) {
    K.drawDesk(ctx, x, y, s);
    K.drawLaptop(ctx, x + 10 * s, y - 104 * s, s * 0.9, { t, screen: o.screen || 'code', typing: o.typing || 0 });
  }
  function caption(x, y, k, str, size, col, maxW) { // a big centred line with pop
    if (k <= 0) return;
    ctx.save(); ctx.translate(x, y); const sc = Math.min(1.06, k); ctx.scale(sc, sc);
    const fs = H.fitText ? H.fitText(ctx, str, 'display', size, size * 0.6, maxW) : size;
    ctx.font = K.font.display(fs); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(6,8,20,0.85)'; ctx.lineJoin = 'round'; ctx.strokeText(str, 0, 0);
    ctx.fillStyle = col; ctx.fillText(str, 0, 0); ctx.restore();
  }

  ctx.save();
  // ====================================================================== hook
  if (mode === 'hook') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 500, y: 760 }]);
    stage();
    const AX = 300, FY = 1030, S = 1.55;
    const tBeam = -1, tBuild = -0.35, tStamp = 1.35;
    arch(AX, FY, 250, 470, t + 0.9, 1 - smooth((t - 2.6) / 0.5) * 0.6);
    actor(AX, FY, S, { pose: 'stand', mood: t > tStamp ? 'shocked' : 'neutral', look: 0.6 });
    beam(AX + 70, 700, 650, 720, clamp((t - tBeam) / 0.2) * (1 - clamp((t - 2.0) / 0.5)));
    const rv = easeOutCubic(clamp((t - tBuild) / 0.85));
    holo(680, FY, S, { reveal: rv, person: { pose: t > 0.9 ? 'cheer' : 'stand', mood: 'happy', flip: true, look: -0.5 } });
    // floor pad under the copy
    ctx.save(); ctx.globalAlpha = 0.5 * rv; ctx.translate(680, FY + 4); ctx.scale(1, 0.22); circ(0, 0, 130, HOLO); ctx.restore();
    pill(780, 1000, pop(0.7), 'AI COPY', { size: 30, dot: true });
    if (t > tStamp) {
      if (t < tStamp + 0.35) K.cameraShake(ctx, t, tStamp, 0.3, 8);
      K.drawStamp(ctx, 487, 640, 0.95, { kind: 'check', text: P.stamp || 'LICENSED', land: (t - tStamp) / 0.5 });
    }
  }
  // ====================================================================== deal
  else if (mode === 'deal') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 740 }]);
    stage();
    const tWho = at(P.whoCue, 0.2), tCred = at(P.creditCue, 0.32), tFace = at(P.faceCue, 0.4), tStu = at(P.studioCue, 0.5);
    const tTitle = at(P.titleCue, 0.75), tPrem = at(P.premiereCue, 0.92);
    const AX = 250, FY = 1030, S = 1.5;
    const gotCard = t > tFace + 1.0;
    actor(AX, FY, S, { pose: t > tFace - 0.1 && t < tFace + 0.8 ? 'point' : 'stand', mood: 'happy', talk: 0, look: 0.5 });
    pill(AX, 520, pop(tWho - 0.15), P.who || 'The actor', { size: 30, accent: true });
    pill(AX, 590, pop(tCred - 0.15), P.credit || 'TV actor', { size: 26 });
    // desk slides out (to the right) when the series appears
    const out = easeInOutCubic(clamp((t - (tTitle - 0.5)) / 0.6));
    const DX = 680 + out * 520;
    if (out < 1) {
      laptopDesk(DX, FY, 1.1, { screen: gotCard ? 'chat' : 'code', typing: gotCard ? 0 : 1 });
      K.drawRobot(ctx, DX + 120, FY - 10, 0.75, { t, state: gotCard ? 'happy' : 'working', flip: true, seed: 4 });
      const ks = pop(tStu - 0.15);
      pill(DX - 30, 640, ks, P.studio || 'Studio', { size: 34, accent: true });
      pill(DX - 30, 700, ks, P.studioSub || 'Startup', { size: 26 });
    }
    // the face card flies actor -> laptop
    const fly = clamp((t - tFace) / 0.9);
    if (t > tFace - 0.2 && fly < 1) {
      const p = easeInOutCubic(fly);
      const x = lerp(AX + 40, DX + 10, p), y = lerp(760, 880, p) - Math.sin(p * Math.PI) * 170;
      faceCard(x, y, 130, 150, ACTOR, { k: Math.min(1, pop(tFace - 0.2)), rot: lerp(-0.1, 0.15, p) });
    }
    if (gotCard && out < 1) { // the laptop screen shows the face being copied
      const k = clamp((t - tFace - 0.9) / 0.4);
      faceCard(DX + 10, 860, 90, 100, ACTOR, { k, holo: true, bg: '#103a52' });
    }
    // the phone with the series
    const up = easeOutCubic(clamp((t - (tTitle - 0.3)) / 0.7));
    if (up > 0) {
      const PX = 640, PW = 330, PH = 560, PY = 1060 - PH - 30 + (1 - up) * 700;
      ctx.save();
      K.glow(ctx, PX, PY + PH / 2, 360, HOLO, 0.12 * up);
      rr(PX - PW / 2 - 14, PY - 14, PW + 28, PH + 28, 46, '#0f1222');
      rr(PX - PW / 2, PY, PW, PH, 34, '#0b1834');
      ctx.save(); roundRect(ctx, PX - PW / 2, PY, PW, PH, 34); ctx.clip();
      const sg = ctx.createLinearGradient(0, PY, 0, PY + PH); sg.addColorStop(0, '#132a55'); sg.addColorStop(1, '#2b1a4a'); ctx.fillStyle = sg; ctx.fillRect(PX - PW / 2, PY, PW, PH);
      for (let i = 0; i < 5; i++) { ctx.globalAlpha = 0.25; rr(PX - PW / 2 + 20 + i * 64, PY + 330 - (i % 2) * 40, 44, 230, 6, '#0a1430'); }
      ctx.globalAlpha = 1;
      holo(PX, PY + PH - 26, 1.25, { person: { pose: 'point', mood: 'neutral', flip: true } });
      ctx.restore();
      rr(PX - 50, PY + 14, 100, 14, 7, '#0f1222');
      text(P.title || 'THE SERIES', PX, PY + 92, 'display', 46, '#ffffff');
      rr(PX - 110, PY + 108, 220, 6, 3, ACC);
      ctx.restore();
      pill(PX, PY - 34, pop(tTitle + 0.3), P.made || 'AI-made', { size: 28, dot: true });
      pill(PX, PY + PH + 0, 0, '', {});
    }
    pill(250, 660, pop(tPrem - 0.1), P.premiere || 'Out now', { size: 28, accent: true, dot: true });
  }
  // ====================================================================== plot
  else if (mode === 'plot') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 740 }]);
    // dark room around a framed screen
    const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#0a0c22'); g.addColorStop(1, '#05060f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    const SX = 140, SY = 450, SW = 695, SH = 590;
    rr(SX - 16, SY - 16, SW + 32, SH + 32, 26, '#2a2f45');
    ctx.save(); roundRect(ctx, SX, SY, SW, SH, 16); ctx.clip();
    const tPlays = at(P.playsCue, 0.15), tHand = at(P.handCue, 0.35), tDouble = at(P.doubleCue, 0.6);
    const tCase = at(P.caseCue, 0.75), tInn = at(P.innocentCue, 0.9);
    // inside: a studio office at dusk
    const ig = ctx.createLinearGradient(0, SY, 0, SY + SH); ig.addColorStop(0, '#2b2f63'); ig.addColorStop(1, '#3a2f5e'); ctx.fillStyle = ig; ctx.fillRect(SX, SY, SW, SH);
    for (let i = 0; i < 4; i++) rr(SX + 30 + i * 180, SY + 110, 150, 210, 8, '#232857');
    rr(SX, SY + SH - 120, SW, 120, 0, '#1d2145');
    const FY = SY + SH - 40;
    // police lights sweep after the case cue
    const cop = clamp((t - tCase + 0.2) / 0.4);
    // exec at a desk on the right
    K.drawPerson(ctx, 730, FY - 34, 1.3, { t, pose: 'stand', skin: 0, hair: 3, shirt: '#3b4260', hairStyle: 'short', mood: t > tDouble ? 'happy' : 'neutral', flip: true, seed: 11 });
    K.drawDesk(ctx, 700, FY, 1.05);
    K.drawLaptop(ctx, 650, FY - 102, 0.82, { t, screen: t > tHand + 0.8 ? 'chat' : 'code' });
    // the actor walks in, hands a face card
    const walkIn = easeOutCubic(clamp(t / 1.4));
    const ax = lerp(SX + 40, 290, walkIn);
    const shocked = t > tInn - 0.6 || (t > tCase && t < tInn);
    actor(ax, FY, 1.05, { pose: t > tHand - 0.1 && t < tHand + 0.9 ? 'point' : (shocked ? 'shrug' : 'stand'), mood: shocked ? 'shocked' : 'happy', walk: walkIn < 1 ? t : null, look: 0.4 }, 1.3);
    const hk = clamp((t - tHand) / 0.8);
    if (t > tHand - 0.1 && hk < 1) {
      const p = easeInOutCubic(hk);
      faceCard(lerp(ax + 90, 650, p), lerp(FY - 200, FY - 180, p) - Math.sin(p * Math.PI) * 80, 100, 116, ACTOR, { k: pop(tHand - 0.1), rot: 0.1 });
    }
    // the copy steps out of the laptop and walks left of centre
    const st = clamp((t - tDouble) / 1.2);
    if (t > tDouble - 0.1) {
      const hx = lerp(650, 500, easeOutCubic(st));
      holo(hx, FY + 4, 1.3, { reveal: easeOutCubic(clamp((t - tDouble) / 0.6)), person: { pose: 'stand', mood: cop > 0 ? 'neutral' : 'happy', flip: true, walk: st < 1 ? t : null } });
    }
    if (cop > 0) {
      const ph = Math.sin(t * 9);
      ctx.save(); ctx.globalAlpha = 0.22 * cop;
      ctx.fillStyle = ph > 0 ? '#ff4d5e' : '#4d7bff'; ctx.fillRect(SX, SY, SW, SH);
      ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.85 * cop;
      // police tape across the bottom
      ctx.translate(SX + SW / 2, FY + 10); ctx.rotate(-0.05);
      rr(-SW / 2 - 20, -18, SW + 40, 36, 2, '#ffcc33');
      ctx.font = K.font.condensed(26); ctx.fillStyle = '#161927'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let i = -3; i <= 3; i++) ctx.fillText('CASE OPEN', i * 120 + ((t * 30) % 120), 1);
      ctx.restore();
    }
    ctx.restore(); // screen clip
    // screen chrome: tag + pills (outside the clip so they can overlap the frame)
    pill(SX + 10, SY + 56, 1, P.tag || 'IN THE SHOW', { left: true, size: 26, dot: true });
    const playsOut = clamp((t - tInn + 0.4) / 0.3);
    if (playsOut < 1) { ctx.save(); ctx.globalAlpha = 1 - playsOut; pill(290, SY + 150, pop(tPlays - 0.1), P.plays || 'Plays himself', { size: 28, accent: true }); ctx.restore(); }
    if (t > tCase - 0.15) {
      const k = pop(tCase - 0.15);
      ctx.save(); ctx.translate(560, SY + 70); const s = Math.min(1.06, k); ctx.scale(s, s); ctx.rotate(-0.06);
      rr(-170, -40, 340, 80, 14, '#ff6b5e');
      text((P.case || 'The crime').toUpperCase(), 0, 12, 'condensed', 40, '#ffffff');
      ctx.restore();
      // dotted leader to the copy
      ctx.save(); ctx.globalAlpha = Math.min(1, k); ctx.setLineDash([6, 8]); ctx.strokeStyle = '#ff6b5e'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(520, SY + 110); ctx.lineTo(505, SY + 170); ctx.stroke(); ctx.restore();
    }
    pill(290, SY + 150, pop(tInn - 0.15), P.innocent || "He didn't do it", { size: 28, accent: true });
  }
  // ====================================================================== market
  else if (mode === 'market') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
    const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#120c2c'); g.addColorStop(0.55, '#24164a'); g.addColorStop(1, '#07060f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    // lantern string
    for (let i = 0; i < 9; i++) {
      const x = 80 + i * 115, y = 430 + Math.sin(i * 0.9) * 14 + Math.sin(t * 1.3 + i) * 3;
      K.glow(ctx, x, y, 60, '#ff9a5a', 0.25);
      rr(x - 16, y - 20, 32, 40, 12, i % 2 ? '#ff6b5e' : '#ffb35c');
    }
    ctx.strokeStyle = '#3a2f5e'; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i < 9; i++) { const x = 80 + i * 115, y = 410 + Math.sin(i * 0.9) * 14; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    // board
    rr(110, 600, 755, 440, 24, '#2f2456'); rr(126, 616, 723, 408, 18, '#3c2f6a');
    const tPlace = at(P.placeCue, 0.2), tLow = at(P.lowCue, 0.4), tHigh = at(P.highCue, 0.6), tSrc = at(P.srcCue, 0.85);
    const looks = [
      { skin: 0, hair: 2, shirt: 1, hairStyle: 'long' }, { skin: 3, hair: 0, shirt: 2, hairStyle: 'short' }, { skin: 1, hair: 4, shirt: 3, hairStyle: 'bun' },
      { skin: 4, hair: 0, shirt: 0, hairStyle: 'curly' }, { skin: 2, hair: 1, shirt: 4, hairStyle: 'short' }, { skin: 1, hair: 3, shirt: 1, hairStyle: 'long' },
    ];
    const prices = [`$${P.low || 'X'}`, '$', '$', '$', '$', `$${P.high || 'Y'}`];
    for (let i = 0; i < 6; i++) {
      const c = i % 3, r = Math.floor(i / 3);
      const cx = 255 + c * 235, cy = 700 + r * 180;
      const k = pop(0.05 + i * 0.12, 0.45);
      faceCard(cx, cy, 140, 140, Object.assign({ seed: i }, looks[i]), { k, mood: 'happy', t: t + i, bg: ['#2c4b7a', '#4a2c6a', '#2c6a5a'][i % 3] });
      // swinging price tag
      const tk = pop(tLow + 0.1 + i * 0.18, 0.4);
      if (tk > 0) {
        const sw = Math.sin(t * 2.4 + i) * 0.18 * Math.exp(-Math.max(0, t - tLow - i * 0.18) * 0.3);
        ctx.save(); ctx.translate(cx + 72, cy - 70); ctx.rotate(0.25 + sw); ctx.scale(Math.min(1.05, tk), Math.min(1.05, tk));
        ctx.strokeStyle = '#d5dae8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 22); ctx.stroke();
        rr(-42, 22, 84, 44, 10, i === 0 || i === 5 ? ACC : '#f2f4fa');
        text(prices[i], 0, 54, 'display', 26, '#161927');
        ctx.restore();
      }
    }
    // headline range counting up
    const kl = pop(tLow - 0.1, 0.45);
    if (kl > 0) {
      const hi = P.high || 'Y'; // no count-up: only published figures ever show
      const showHi = t > tHigh - 0.3;
      const str = showHi ? `$${P.low || 'X'} – $${hi}` : `$${P.low || 'X'}`;
      caption(487, 520, kl, str, 92, ACC, 700);
      pill(487, 600, pop(tHigh + 0.5), P.unit || 'per face', { size: 28 });
    }
    pill(140, 1034, pop(tPlace - 0.1), P.place || 'Place', { left: true, size: 30, accent: true, dot: true });
    pill(840, 1034, pop(tSrc - 0.1), P.src || 'Per report', { size: 26 });
  }
  // ====================================================================== you
  else if (mode === 'you') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
    const room = K.world.livingRoomNight(ctx, { t, sofa: '#3f7f86' });
    const tScan = at(P.scanCue, 0.1), tRent = at(P.rentCue, 0.3), tCopy = at(P.copyCue, 0.62), tNever = at(P.neverCue, 0.85);
    const VIEW = { skin: 1, hair: 2, shirt: '#a08be0', pants: '#2d3350', hairStyle: 'long', seed: 21 };
    // wall screen over the window
    const SX = 540, SY = 410, SW = 340, SH = 260;
    rr(SX - 12, SY - 12, SW + 24, SH + 24, 16, '#0f1222');
    const lit = clamp((t - tCopy + 0.2) / 0.5);
    ctx.save(); roundRect(ctx, SX, SY, SW, SH, 8); ctx.clip();
    ctx.fillStyle = '#0a0c1c'; ctx.fillRect(SX, SY, SW, SH);
    if (lit > 0) {
      ctx.globalAlpha = lit;
      const sets = [['#f2a46a', '#c86b6b'], ['#3a6fb0', '#a9d1ee'], ['#2c6a5a', '#8fd6a8']];
      const si = Math.floor(Math.max(0, t - tCopy) / 1.6) % 3, sc = sets[si];
      const sg = ctx.createLinearGradient(0, SY, 0, SY + SH); sg.addColorStop(0, sc[1]); sg.addColorStop(1, sc[0]); ctx.fillStyle = sg; ctx.fillRect(SX, SY, SW, SH);
      // a set piece per scene: sun / skyline / trees
      if (si === 0) circ(SX + 250, SY + 90, 40, '#ffe3a0');
      if (si === 1) for (let i = 0; i < 6; i++) rr(SX + i * 58, SY + 120 - (i % 3) * 30, 48, 200, 4, '#24406e');
      if (si === 2) for (let i = 0; i < 5; i++) circ(SX + 30 + i * 72, SY + 170, 40, '#1f5a46');
      rr(SX, SY + SH - 40, SW, 40, 0, 'rgba(0,0,0,0.25)');
      const poses = ['cheer', 'point', 'shrug'];
      holo(SX + SW / 2, SY + SH - 12, 0.85, { look: VIEW, person: { pose: poses[si], mood: 'happy', flip: si === 1 } });
      // a tiny REC dot
      circ(SX + 24, SY + 24, 8, Math.sin(t * 6) > 0 ? '#ff6b5e' : '#5a2030');
    }
    ctx.restore();
    // the viewer on the sofa
    const sx = 360;
    K.drawPerson(ctx, sx, room.sofa.feetY, 1.9, Object.assign({ t, pose: t < tCopy ? 'sit-phone' : 'sit', seat: false, mood: t > tCopy + 0.4 ? 'shocked' : 'neutral', look: t > tCopy ? 0.8 : 0 }, VIEW));
    // phone scan line over the face
    const sk = clamp((t - tScan + 0.1) / 0.3) * (1 - clamp((t - tScan - 2.2) / 0.4));
    if (sk > 0) {
      const fy = room.sofa.feetY - 1.9 * 205, sy = fy + Math.sin((t - tScan) * 4) * 45;
      ctx.save(); ctx.globalAlpha = sk;
      ctx.strokeStyle = HOLO; ctx.lineWidth = 4;
      const bx = sx - 62, bw = 124, by = fy - 70, bh = 140;
      for (const [x, y, dx, dy] of [[bx, by, 1, 1], [bx + bw, by, -1, 1], [bx, by + bh, 1, -1], [bx + bw, by + bh, -1, -1]]) {
        ctx.beginPath(); ctx.moveTo(x, y + dy * 26); ctx.lineTo(x, y); ctx.lineTo(x + dx * 26, y); ctx.stroke();
      }
      rr(bx, sy - 2, bw, 4, 2, HOLO_L); K.glow(ctx, sx, sy, 80, HOLO, 0.4);
      ctx.restore();
    }
    // FOR RENT sign drops on strings from the top, swings
    const dk = clamp((t - tRent + 0.25) / 0.5);
    if (dk > 0) {
      const y = lerp(300, 540, easeOutCubic(dk)) , sw = Math.sin((t - tRent) * 3.2) * 0.12 * Math.exp(-Math.max(0, t - tRent) * 0.8);
      ctx.save(); ctx.translate(300, y); ctx.rotate(sw);
      ctx.strokeStyle = '#d5dae8'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-110, -120); ctx.lineTo(-110, -30); ctx.moveTo(110, -120); ctx.lineTo(110, -30); ctx.stroke();
      rr(-160, -34, 320, 92, 14, '#f2f4fa'); rr(-150, -24, 300, 72, 10, ACC);
      text(P.sign || 'FOR RENT', 0, 24, 'condensed', 46, '#161927');
      ctx.restore();
    }
    pill(SX + SW / 2, SY + SH + 74, pop(tCopy + 0.2), 'Your AI copy', { size: 26, dot: true });
    pill(SX + SW / 2, SY + SH + 140, pop(tNever - 0.1), P.never || 'Scenes you never filmed', { size: 30, accent: true });
  }
  // ====================================================================== caveat
  else if (mode === 'caveat') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 740 }]);
    stage();
    const tPay = at(P.payCue, 0.2), tHid = at(P.hiddenCue, 0.35), tCh = at(P.chairCue, 0.62);
    const tMove = Math.max(tHid + 0.9, tCh - 2.2); // contract steps aside, the actor walks to the chair
    const mv = easeInOutCubic(clamp((t - tMove) / 0.8));
    // the copy idles in the back, faint (moves right with the contract move)
    holo(lerp(770, 840, mv), 1030, 1.15, { alpha: lerp(0.55, 0.4, mv), person: { pose: 'stand', mood: 'neutral', flip: true } });
    // contract: centred, then shrinks to the top-left keeping the blacked-out pay line
    const cx0 = 430, cy0 = 520, cw = 470, ch = 470;
    const ck = pop(0.05, 0.45);
    ctx.save();
    ctx.translate(lerp(cx0, 285, mv), lerp(cy0 + ch / 2, 690, mv));
    const s0 = Math.min(1.04, ck) * lerp(1, 0.58, mv); ctx.scale(s0, s0); ctx.rotate(lerp(-0.03, -0.08, mv));
    ctx.translate(-cx0, -(cy0 + ch / 2));
    const cx = cx0, cy = cy0;
    K.shadow(ctx, cx, cy + ch + 10, cw);
    rr(cx - cw / 2, cy, cw, ch, 18, '#f2f4fa');
    text(P.docTitle || 'FACE LICENSE', cx, cy + 66, 'display', 40, '#161927');
    rr(cx - 120, cy + 84, 240, 6, 3, ACC);
    faceCard(cx - 140, cy + 180, 90, 100, ACTOR, { k: 1, holo: true, bg: '#103a52' });
    for (let i = 0; i < 3; i++) rr(cx - 70, cy + 140 + i * 30, 230 - i * 40, 12, 6, '#d5dae8');
    const pk = clamp((t - tPay + 0.2) / 0.3);
    rr(cx - cw / 2 + 36, cy + 270, cw - 72, 90, 14, pk > 0 ? mixHex('#f2f4fa', ACC, 0.25 * pk) : '#e9ecf5');
    text(`${P.payLabel || 'Pay'}:`, cx - cw / 2 + 60, cy + 330, 'bold', 38, '#161927', 'left');
    let str = '$ ';
    for (let i = 0; i < 3; i++) str += H.hash(i, Math.floor(t * 6)) > 0.5 ? '? ' : '?  ';
    ctx.save(); ctx.globalAlpha = 0.85;
    ctx.font = K.font.display(42); ctx.fillStyle = '#8a93a8'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(t > tPay ? str : '$ . . .', cx - 40, cy + 332);
    ctx.restore();
    if (t > tHid - 0.1) { // black bar redaction slams over the amount
      const k = easeOutCubic(clamp((t - tHid + 0.1) / 0.3));
      rr(cx - 50, cy + 290, 230 * k, 56, 8, '#161927');
    }
    rr(cx - cw / 2 + 36, cy + 390, 220, 10, 5, '#d5dae8'); rr(cx - cw / 2 + 36, cy + 420, 160, 10, 5, '#d5dae8');
    ctx.restore();
    // "Not disclosed" pill rides under the contract
    pill(lerp(cx0 + 60, 285, mv), lerp(cy0 + ch + 70, 870, mv), pop(tHid - 0.1), P.hidden || 'Not disclosed', { size: lerp(30, 26, mv), accent: true, dot: true });
    // director's chair scene (after the move)
    if (mv > 0) {
      const CX = 670, FY = 1030;
      ctx.save(); ctx.globalAlpha = mv;
      // chair: crossed legs, canvas seat + back (accent back band, no text)
      K.shadow(ctx, CX, FY + 4, 200);
      ctx.strokeStyle = '#9a6a46'; ctx.lineWidth = 12; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(CX - 70, FY); ctx.lineTo(CX + 60, FY - 120); ctx.moveTo(CX + 70, FY); ctx.lineTo(CX - 60, FY - 120); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(CX - 72, FY - 120); ctx.lineTo(CX - 72, FY - 300); ctx.moveTo(CX + 72, FY - 120); ctx.lineTo(CX + 72, FY - 300); ctx.stroke();
      rr(CX - 78, FY - 300, 156, 58, 8, ACC); rr(CX - 78, FY - 252, 156, 10, 4, mixHex(ACC, '#000000', 0.3));
      rr(CX - 80, FY - 132, 160, 20, 6, '#2d3350');
      ctx.restore();
      // actor walks in from the right, then sits (from tCh - 0.5)
      const walkK = easeOutCubic(clamp((t - tMove - 0.2) / 1.4));
      const seated = t > tCh - 0.5;
      if (!seated) actor(lerp(980, CX + 10, walkK), FY, 1.3, { walk: walkK < 1 ? t : null, flip: true, mood: 'happy' });
      else actor(CX, FY - 20, 1.3, { pose: 'sit', mood: 'happy', seat: false, look: -0.4, flip: true });
      // the chair's front armrest over the legs
      ctx.save(); ctx.globalAlpha = mv; rr(CX - 86, FY - 186, 14, 70, 6, '#9a6a46'); rr(CX + 72, FY - 186, 14, 70, 6, '#9a6a46'); ctx.restore();
      // clapperboard on the floor, snaps shut on the cue
      const ck2 = pop(tCh - 0.3, 0.4);
      if (ck2 > 0) {
        const open = 1 - K.phase(t, tCh + 0.1, tCh + 0.25);
        ctx.save(); ctx.translate(500, FY); ctx.scale(0.85 * Math.min(1.05, ck2), 0.85 * Math.min(1.05, ck2));
        rr(-75, -100, 150, 100, 8, '#1c2033');
        for (let i = 0; i < 3; i++) rr(-60, -80 + i * 24, 120 - i * 30, 8, 4, '#3b4260');
        ctx.save(); ctx.translate(-75, -104); ctx.rotate(-0.55 * open);
        rr(0, -26, 150, 26, 4, '#f2f4fa');
        ctx.fillStyle = '#1c2033'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(10 + i * 30, -26); ctx.lineTo(26 + i * 30, -26); ctx.lineTo(16 + i * 30, 0); ctx.lineTo(0 + i * 30, 0); ctx.closePath(); ctx.fill(); }
        ctx.restore(); ctx.restore();
        if (t > tCh + 0.25 && t < tCh + 0.55) K.glow(ctx, 500, FY - 110, 80, ACC, 0.4 * (1 - (t - tCh - 0.25) / 0.3));
      }
      pill(590, 560, pop(tCh - 0.1), P.chair || 'Helped make creative calls', { size: 30, accent: true });
    }
  }
  ctx.restore();
}
