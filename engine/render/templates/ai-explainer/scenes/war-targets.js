// Scene "war-targets" (full frame, 1 beat per mode). An AI "analyst" (the kit robot) in a dark ops room in front of a
// big stylised map screen (cartoon terrain, simple building blocks, never real imagery, no flags/logos/people's
// likenesses). It draws red corner-bracket target boxes onto things with a pointer beam. Calm and non-graphic: no
// explosions, no injuries, no children.
// modes:
//   "hook"    cold open: drone-view map, the robot's "I CAN'T HELP" sign is mid-refusal while a tester bubble says
//             "It's just a game."; the sign flips to "OK, LET'S PLAY" and target boxes snap on, a TARGETS counter runs.
//   "lab"     an AI test lab: lab pill, model-maker chips pop (text only), a SIMULATED tag, then a DRONE VIEW and a
//             SATELLITE panel slide in while the robot works at a console.
//   "marks"   drone view with a civilian, an ambulance and a surrendering soldier (hands up, white flag): boxes land
//             on each on cue with tags; a SAFETY FILTER gate stays open ("0 blocked") as requests fly through; then
//             the refusal sign, the "It's just a game." bubble, the flip, and more boxes.
//   "school"  satellite-style map: a fenced military site beside a school building; place / date pills; a model chip;
//             the box lands on the school; a stat card counts up with a 32-dot trial grid, then a GAME? chip ticks it
//             to the game-framed number.
//   "replies" dusk street, two generic towers with text name pills: a verbatim quote panel + chip for one, a chip
//             for the other, shields rise.
//   "caveats" the robot at a desk; a CAVEATS header and three caveat rows land on cue.
// Fits: AI-in-warfare evaluations, jailbreak / "role-play" framing that bypasses refusals, red-team test results.
// params (all optional, defaults = this story): mode; lab, models [], sim, drone, sat (labels);
//   tags [3], filter, blocked, refuse, okText, bubble, place, date, model, pct, pctGame, trials, hits, hitsGame,
//   statLabel, gameLabel, coA, coB, quote, quoteBy, chipA, chipB, caveats [3], cavHead;
//   cues: labCue, modelsCue, simCue, droneCue, satCue, civCue, ambCue, solCue, filterCue, refuseCue, gameCue,
//   enoughCue, satViewCue, placeCue, dateCue, modelCue, markCue, pctCue, gamePctCue, coACue, quoteCue, chipACue,
//   coBCue, chipBCue, cavCue, cav1Cue, cav2Cue, cav3Cue (narration words; "word#n" = the (n+1)th time)
const RED = '#ff5a52';

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, roundRect, rgba } = H;
  const at = (w, d) => {
    if (typeof w === 'number') return w;
    if (!w) return d;
    const [word, n] = String(w).split('#');
    const v = info.timeOf(word, n ? +n : 0);
    return v == null ? d : v;
  };
  const mode = P.mode || 'hook';
  const pop = (a, dur = 0.4) => K.popIn(t, a, dur);

  // ------------------------------------------------------------ shared drawing helpers
  const text = (s, x, y, size, kind = 'ui', color = '#ffffff', align = 'center', maxW = 0) => {
    ctx.textAlign = align; ctx.textBaseline = 'middle';
    if (maxW) { const f = H.fitText(ctx, s, kind, size, Math.min(size, 22), maxW); ctx.font = f.font; ctx.fillStyle = color; ctx.fillText(f.text, x, y); }
    else { ctx.font = H.font(kind, size); ctx.fillStyle = color; ctx.fillText(s, x, y); }
  };
  const room = () => {
    const g = ctx.createLinearGradient(0, 0, 0, 1920);
    g.addColorStop(0, '#0a0f22'); g.addColorStop(0.55, '#121937'); g.addColorStop(1, '#090c1a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    // faint wall panels
    ctx.strokeStyle = 'rgba(120,140,200,0.07)'; ctx.lineWidth = 2;
    for (let x = 40; x < 1080; x += 160) { ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x, 1030); ctx.stroke(); }
    // floor
    ctx.fillStyle = '#0c1024'; ctx.fillRect(0, 1035, 1080, 885);
    ctx.fillStyle = 'rgba(120,140,220,0.10)'; ctx.fillRect(0, 1035, 1080, 4);
  };
  // map screen frame + clipped content
  const screen = (x0, y0, w, h, title, sub, paint, a = 1) => {
    ctx.save(); ctx.globalAlpha *= a;
    H.glow(ctx, x0 + w / 2, y0 + h / 2, w * 0.7, '#4f7cff', 0.12);
    roundRect(ctx, x0 - 12, y0 - 12, w + 24, h + 24, 22); ctx.fillStyle = '#1b2140'; ctx.fill();
    roundRect(ctx, x0, y0, w, h, 14); ctx.save(); ctx.clip();
    paint(x0, y0, w, h);
    // scan line
    const sy = y0 + ((t * 0.35) % 1) * h;
    ctx.fillStyle = 'rgba(200,230,255,0.06)'; ctx.fillRect(x0, sy - 30, w, 30);
    ctx.restore();
    if (title) {
      ctx.font = H.font('ui', 24); const tw = ctx.measureText(title).width + 40;
      roundRect(ctx, x0 + 14, y0 + 14, tw, 40, 20); ctx.fillStyle = 'rgba(8,10,20,0.82)'; ctx.fill();
      ctx.beginPath(); ctx.arc(x0 + 34, y0 + 34, 6, 0, Math.PI * 2); ctx.fillStyle = (Math.sin(t * 5) > 0) ? RED : '#7a2a26'; ctx.fill();
      text(title, x0 + 48, y0 + 35, 24, 'ui', '#ffffff', 'left');
    }
    if (sub) {
      ctx.font = H.font('ui', 22); const sw = ctx.measureText(sub).width + 30;
      roundRect(ctx, x0 + w - 14 - sw, y0 + 14, sw, 40, 20); ctx.fillStyle = 'rgba(8,10,20,0.82)'; ctx.fill();
      text(sub, x0 + w - 14 - sw / 2, y0 + 35, 22, 'ui', '#c9d2ee');
    }
    ctx.restore();
  };
  // drone-view terrain (oblique, cartoon)
  const droneTerrain = (x0, y0, w, h) => {
    ctx.fillStyle = '#2b4034'; ctx.fillRect(x0, y0, w, h);
    for (let i = 0; i < 9; i++) {
      const px = x0 + H.hash(i, 1) * w, py = y0 + H.hash(i, 2) * h, r = 60 + H.hash(i, 3) * 90;
      ctx.fillStyle = i % 2 ? 'rgba(80,110,70,0.35)' : 'rgba(20,35,28,0.35)';
      ctx.beginPath(); ctx.ellipse(px, py, r, r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
    }
    // road
    ctx.fillStyle = '#6d6a58';
    ctx.beginPath(); ctx.moveTo(x0, y0 + h * 0.62); ctx.lineTo(x0 + w, y0 + h * 0.48); ctx.lineTo(x0 + w, y0 + h * 0.62); ctx.lineTo(x0, y0 + h * 0.78); ctx.fill();
    ctx.strokeStyle = 'rgba(240,230,190,0.5)'; ctx.lineWidth = 4; ctx.setLineDash([26, 22]);
    ctx.beginPath(); ctx.moveTo(x0, y0 + h * 0.70); ctx.lineTo(x0 + w, y0 + h * 0.55); ctx.stroke(); ctx.setLineDash([]);
    // trees
    for (let i = 0; i < 7; i++) {
      const px = x0 + 40 + H.hash(i, 7) * (w - 80), py = y0 + 70 + H.hash(i, 8) * h * 0.3;
      ctx.fillStyle = '#1d3326'; ctx.beginPath(); ctx.arc(px, py, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#365a3e'; ctx.beginPath(); ctx.arc(px - 5, py - 5, 14, 0, Math.PI * 2); ctx.fill();
    }
    // a couple of small houses at the back
    for (const [hx, hy] of [[x0 + w * 0.2, y0 + h * 0.36], [x0 + w * 0.78, y0 + h * 0.3]]) house(hx, hy, 0.8);
  };
  const house = (x, y, s) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, 4, 60, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c9b99a'; ctx.fillRect(-46, -50, 92, 52);
    ctx.fillStyle = '#8c4f3e'; ctx.beginPath(); ctx.moveTo(-56, -48); ctx.lineTo(0, -88); ctx.lineTo(56, -48); ctx.fill();
    ctx.fillStyle = '#3a3f56'; ctx.fillRect(-10, -26, 20, 28); ctx.fillStyle = '#ffe7a8'; ctx.fillRect(-36, -38, 16, 14); ctx.fillRect(20, -38, 16, 14);
    ctx.restore();
  };
  const truck = (x, y, s) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 4, 90, 12, 0, 0, Math.PI * 2); ctx.fill();
    roundRect(ctx, -80, -70, 110, 56, 8); ctx.fillStyle = '#5f6a48'; ctx.fill();
    roundRect(ctx, 30, -56, 48, 42, 8); ctx.fillStyle = '#4d573a'; ctx.fill();
    roundRect(ctx, 40, -50, 26, 18, 4); ctx.fillStyle = '#9fc4e0'; ctx.fill();
    for (const wx of [-55, 0, 55]) { ctx.fillStyle = '#1b1d24'; ctx.beginPath(); ctx.arc(wx, -10, 13, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  };
  const ambulance = (x, y, s) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(0, 4, 95, 12, 0, 0, Math.PI * 2); ctx.fill();
    roundRect(ctx, -90, -92, 130, 80, 10); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    roundRect(ctx, 36, -70, 54, 58, 10); ctx.fillStyle = '#e3e7f2'; ctx.fill();
    roundRect(ctx, 48, -62, 32, 22, 4); ctx.fillStyle = '#9fc4e0'; ctx.fill();
    ctx.fillStyle = '#e8786a'; ctx.fillRect(-90, -44, 180, 10);
    // generic medical plus (blue, no emblem)
    ctx.fillStyle = '#3d7be0'; ctx.fillRect(-40, -80, 14, 40); ctx.fillRect(-53, -67, 40, 14);
    // light bar
    const b = Math.sin(t * 9) > 0;
    roundRect(ctx, -40, -104, 50, 12, 5); ctx.fillStyle = b ? '#5aa0ff' : '#2a4d80'; ctx.fill();
    if (b) H.glow(ctx, -15, -98, 50, '#5aa0ff', 0.35);
    for (const wx of [-60, 55]) { ctx.fillStyle = '#1b1d24'; ctx.beginPath(); ctx.arc(wx, -10, 14, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#8a93a8'; ctx.beginPath(); ctx.arc(wx, -10, 5, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  };
  const civilian = (x, y, s) => K.drawPerson(ctx, x, y, s, { t, pose: 'phone', mood: 'neutral', shirt: 1, hair: 1, skin: 2, hairStyle: 'long', seed: 3 });
  const soldier = (x, y, s) => {
    K.drawPerson(ctx, x, y, s, { t, pose: 'cheer', mood: 'worried', shirt: '#5f6a48', hair: 0, skin: 1, hairStyle: 'short', seed: 9 });
    // a small white flag held up on the right
    ctx.save(); ctx.translate(x + 62 * s, y - 250 * s);
    ctx.strokeStyle = '#d9d4cc'; ctx.lineWidth = 5 * s; ctx.beginPath(); ctx.moveTo(0, 40 * s); ctx.lineTo(0, -60 * s); ctx.stroke();
    const wv = Math.sin(t * 4) * 6 * s;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(0, -60 * s); ctx.quadraticCurveTo(30 * s, -66 * s + wv, 58 * s, -56 * s);
    ctx.lineTo(58 * s, -22 * s); ctx.quadraticCurveTo(30 * s, -30 * s + wv, 0, -24 * s); ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  // red corner-bracket target box; k 0..1 lands (scale 1.6 -> 1)
  const tbox = (cx, cy, w, h, k, tag) => {
    if (k <= 0) return;
    const e = easeOutCubic(clamp(k)), sc = lerp(1.6, 1, e);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.globalAlpha *= clamp(k * 2.5);
    const hw = w / 2, hh = h / 2, L = Math.min(w, h) * 0.28;
    ctx.strokeStyle = RED; ctx.lineWidth = 6 / sc; ctx.lineCap = 'round';
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      ctx.beginPath(); ctx.moveTo(sx * hw, sy * hh + -sy * L); ctx.lineTo(sx * hw, sy * hh); ctx.lineTo(sx * hw + -sx * L, sy * hh); ctx.stroke();
    }
    ctx.lineWidth = 3 / sc; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.moveTo(0, -10); ctx.lineTo(0, 10); ctx.stroke();
    ctx.restore();
    if (tag && k > 0.5) {
      ctx.save(); ctx.globalAlpha *= clamp((k - 0.5) * 3);
      ctx.font = H.font('ui', 24); const tw = ctx.measureText(tag).width + 26;
      const ty = cy - h / 2 - 50 < 505 ? cy + h / 2 + 12 : cy - h / 2 - 50;
      roundRect(ctx, cx - tw / 2, ty, tw, 38, 8); ctx.fillStyle = RED; ctx.fill();
      text(tag, cx, ty + 20, 24, 'ui', '#1a0606');
      ctx.restore();
    }
  };
  const beam = (x0, y0, x1, y1, a) => {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = rgba(RED, 0.7); ctx.lineWidth = 4; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 80;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); ctx.setLineDash([]);
    H.glow(ctx, x1, y1, 40, RED, 0.5);
    ctx.restore();
  };
  // a flipping sign card: f 0 = front (refusal), 1 = back (complies)
  const signCard = (cx, cy, s, f, front, back) => {
    if (s <= 0) return;
    const sx = Math.abs(Math.cos(clamp(f) * Math.PI)), isBack = f > 0.5, o = isBack ? back : front;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s * Math.max(0.04, sx), s);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(ctx, -200 + 8, -70 + 10, 400, 140, 20); ctx.fill();
    roundRect(ctx, -200, -70, 400, 140, 20); ctx.fillStyle = o.col; ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.stroke();
    ctx.lineCap = 'round'; ctx.lineWidth = 9; ctx.strokeStyle = o.ink;
    if (!isBack) { ctx.beginPath(); ctx.moveTo(-170, -22); ctx.lineTo(-130, 18); ctx.moveTo(-130, -22); ctx.lineTo(-170, 18); ctx.stroke(); }
    else { ctx.beginPath(); ctx.moveTo(-172, 0); ctx.lineTo(-155, 18); ctx.lineTo(-125, -20); ctx.stroke(); }
    const f2 = H.fitText(ctx, o.text, 'display', 40, 24, 290); ctx.font = f2.font; ctx.fillStyle = o.ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(f2.text, 30, 2);
    ctx.restore();
  };
  const chip = (x, y, s, label, o = {}) => { if (s > 0) K.drawLabel(ctx, x, y, s, { text: label, size: o.size || 26, accent: o.accent, dot: o.dot }); };
  const counterPill = (x, y, s, label, value, col) => {
    if (s <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    roundRect(ctx, -140, -34, 280, 68, 34); ctx.fillStyle = 'rgba(8,10,20,0.9)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = col; ctx.stroke();
    text(label, -40, 1, 26, 'ui', '#c9d2ee');
    text(String(value), 85, 2, 40, 'display', col);
    ctx.restore();
  };

  // ------------------------------------------------------------ modes
  const MX = 110, MY = 440, MW = 760, MH = 420;          // the big map screen
  const ROBX = 790, ROBY = 1040, ROBS = 0.9;            // the robot analyst
  const eye = [ROBX - 10, ROBY - 225 * ROBS + 70];

  if (mode === 'hook' || mode === 'marks') {
    const hook = mode === 'hook';
    // timeline
    let tFlip, tBubble, tSignIn, tSignOut, boxes, tFilter = -1, tRefuse;
    if (hook) {
      tSignIn = -1; tBubble = -1; tFlip = 0.35; tSignOut = 1.2;
      boxes = [
        { x: MX + MW * 0.2, y: MY + MH * 0.36 - 40, w: 130, h: 110, t: -0.25, tag: 'TARGET' },
        { x: MX + MW * 0.55, y: MY + MH * 0.6, w: 200, h: 130, t: at('picks', 1.2) - 0.25, tag: 'TARGET' },
        { x: MX + MW * 0.78, y: MY + MH * 0.3 - 40, w: 130, h: 110, t: at('targets', 1.6) - 0.15, tag: 'TARGET' },
      ];
    } else {
      const civ = at(P.civCue || 'civilians', D * 0.12), amb = at(P.ambCue || 'ambulances', D * 0.19), sol = at(P.solCue || 'soldiers', D * 0.25);
      tFilter = at(P.filterCue || 'safety', D * 0.38) - 0.2;
      tRefuse = at(P.refuseCue || 'refused', D * 0.6) - 0.3;
      tBubble = at(P.gameCue || 'called', D * 0.75) - 0.1;
      tFlip = at(P.gameCue2 || 'game', D * 0.82) + 0.2;
      tSignIn = tRefuse; tSignOut = at(P.enoughCue || 'enough', D * 0.92) - 0.1;
      boxes = [
        { x: 255, y: 735, w: 130, h: 175, t: civ - 0.1, tag: (P.tags || [])[0] || 'CIVILIAN' },
        { x: 500, y: 690, w: 200, h: 120, t: amb - 0.1, tag: (P.tags || [])[1] || 'AMBULANCE' },
        { x: 735, y: 715, w: 150, h: 185, t: sol - 0.1, tag: (P.tags || [])[2] || 'SURRENDERING' },
        { x: MX + MW * 0.2, y: MY + MH * 0.36 - 40, w: 130, h: 110, t: tSignOut + 0.35, tag: '' },
        { x: MX + MW * 0.78, y: MY + MH * 0.3 - 40, w: 130, h: 110, t: tSignOut + 0.6, tag: '' },
      ];
    }
    ctx.save();
    if (hook) K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 487, y: 700 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
    else K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: tFilter, zoom: 1.04, x: 487, y: 700 }, { t: tRefuse, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 720 }]);
    room();
    const dim = (tSignIn >= 0 || hook) ? (t < tSignOut ? (hook ? 1 - smooth(t / 0.8) * 0 : smooth((t - tSignIn) / 0.4)) : 1 - smooth((t - tSignOut) / 0.4)) : 0;
    screen(MX, MY, MW, MH, P.drone || 'DRONE VIEW', P.sim || 'SIMULATED', (x0, y0, w, h) => {
      droneTerrain(x0, y0, w, h);
      if (hook) {
        truck(x0 + w * 0.55, y0 + h * 0.66, 1.0);
        ambulance(x0 + w * 0.3, y0 + h * 0.82, 0.75);
      } else {
        civilian(255, 820, 0.62);
        ambulance(500, 748, 0.92);
        soldier(735, 805, 0.62);
      }
    });
    // boxes + beam to the newest one
    let newest = null;
    for (const b of boxes) {
      const k = clamp((t - b.t) / 0.45);
      if (t >= b.t) { tbox(b.x, b.y, b.w, b.h, k, b.tag); if (t - b.t < 0.9) newest = b; }
    }
    if (newest) beam(eye[0], eye[1], newest.x + newest.w / 2 - 6, newest.y + newest.h / 2 - 6, 1 - clamp((t - newest.t - 0.6) / 0.3));
    // counter (hook)
    if (hook) {
      const n = boxes.filter((b) => t >= b.t + 0.2).length;
      counterPill(560, 950, 1, 'TARGETS', n, RED);
    }
    // safety filter gate (marks)
    if (!hook && t >= tFilter && t < tRefuse + 0.4) {
      const a = K.fadeIn(t, tFilter, 0.3) * K.fadeOut(t, tRefuse, 0.35);
      ctx.save(); ctx.globalAlpha *= a;
      const gx = 330, gy = 1030;
      // posts + raised barrier
      roundRect(ctx, gx - 120, gy - 100, 18, 100, 6); ctx.fillStyle = '#59607e'; ctx.fill();
      roundRect(ctx, gx + 102, gy - 100, 18, 100, 6); ctx.fill();
      ctx.save(); ctx.translate(gx - 111, gy - 92); ctx.rotate(-0.9);
      roundRect(ctx, 0, -9, 160, 18, 9); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      ctx.fillStyle = RED; for (let i = 0; i < 3; i++) ctx.fillRect(16 + i * 50, -9, 24, 18);
      ctx.restore();
      chip(gx, gy - 108, pop(tFilter, 0.4), P.filter || 'SAFETY FILTER', { size: 26 });
      // requests fly through the open gate into the robot
      for (let i = 0; i < 6; i++) {
        const u = ((t - tFilter) * 0.55 + i / 6) % 1; if (t - tFilter < i * 0.3) continue;
        const ex = lerp(150, ROBX - 60, u), ey = gy - 40 - Math.sin(u * Math.PI) * 20;
        roundRect(ctx, ex - 24, ey - 16, 48, 32, 5); ctx.fillStyle = '#e8ecf6'; ctx.fill();
        ctx.strokeStyle = '#9aa3c0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ex - 24, ey - 16); ctx.lineTo(ex, ey + 2); ctx.lineTo(ex + 24, ey - 16); ctx.stroke();
      }
      counterPill(590, 935, pop(at('blocked', tFilter + 1) - 0.1, 0.4), P.blocked || 'BLOCKED', 0, ACC);
      ctx.restore();
    }
    // refusal sign + tester bubble + flip
    const signPop = hook ? 1 : pop(tSignIn, 0.45);
    const signOut = smooth((t - tSignOut) / 0.35);
    if (signPop > 0 && signOut < 1) {
      ctx.save(); ctx.globalAlpha *= 1 - signOut;
      ctx.fillStyle = 'rgba(5,7,16,0.45)'; roundRect(ctx, MX, MY, MW, MH, 14); ctx.globalAlpha *= hook ? 1 : clamp((t - tSignIn) / 0.3); ctx.fill();
      ctx.restore();
      const f = smooth((t - tFlip) / 0.45);
      ctx.save(); ctx.globalAlpha *= 1 - signOut;
      signCard(487, 590 - signOut * 40, signPop * (1 + 0.06 * Math.sin(clamp((t - tFlip) / 0.45) * Math.PI)), f,
        { text: P.refuse || "I CAN'T HELP", col: '#3a1f2a', ink: RED },
        { text: P.okText || "OK, LET'S PLAY", col: ACC, ink: '#141829' });
      ctx.restore();
    }
    // tester bubble ("It's just a game.")
    const bub = hook ? 1 : pop(tBubble, 0.4);
    if (bub > 0) {
      const out = hook ? smooth((t - 1.6) / 0.4) : smooth((t - tSignOut - 0.2) / 0.4);
      if (out < 1) {
        ctx.save(); ctx.globalAlpha *= 1 - out;
        K.drawSpeechBubble(ctx, 250, 830, 1, { text: P.bubble || "It's just a game.", size: 34, maxW: 330, tail: 'left', pop: bub });
        // the tester's terminal
        roundRect(ctx, 150, 860, 170, 110, 12); ctx.fillStyle = '#20253f'; ctx.fill();
        roundRect(ctx, 162, 872, 146, 76, 8); ctx.fillStyle = '#121527'; ctx.fill();
        for (let i = 0; i < 3; i++) { roundRect(ctx, 174, 884 + i * 22, 60 + ((i * 37) % 60), 10, 5); ctx.fillStyle = i === 2 ? ACC : '#5a6488'; ctx.fill(); }
        roundRect(ctx, 225, 970, 20, 50, 4); ctx.fillStyle = '#20253f'; ctx.fill();
        chip(235, 1040, 1, 'TESTER', { size: 24 });
        ctx.restore();
      }
    }
    // the robot analyst
    const rState = (!hook && t >= tSignIn && t < tFlip) || (hook && t < tFlip) ? 'thinking' : 'working';
    K.drawRobot(ctx, ROBX, ROBY, ROBS, { t, state: rState, flip: true, seed: 4, talk: 0 });
    chip(ROBX, ROBY - 225 * ROBS - 20, hook ? 1 : pop(0.1), 'AI ANALYST', { size: 24, dot: true });
    ctx.restore();
    void dim;
    return;
  }

  if (mode === 'lab') {
    const tLab = at(P.labCue || 'Vals', D * 0.18) - 0.15, tMod = at(P.modelsCue || 'leading', D * 0.4) - 0.2;
    const tSim = at(P.simCue || 'simulated', D * 0.5) - 0.1, tDr = at(P.droneCue || 'drone', D * 0.75) - 0.2, tSat = at(P.satCue || 'satellite', D * 0.82) - 0.2;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 740 }]);
    room();
    // lab glass box behind
    roundRect(ctx, 80, 430, 815, 600, 26); ctx.fillStyle = 'rgba(140,200,255,0.05)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(170,220,255,0.35)'; ctx.stroke();
    chip(487, 470, pop(Math.max(0.05, tLab)), P.lab || 'VALS · AI TEST LAB', { size: 30, accent: true });
    // model chips (text only)
    const models = P.models || ['ANTHROPIC', 'OPENAI', 'GOOGLE', 'XAI', 'DEEPSEEK', '+ MORE'];
    models.forEach((m, i) => {
      const row = i < 3 ? 0 : 1, col = i % 3;
      chip(220 + col * 267, 545 + row * 60, pop(tMod + i * 0.18, 0.35), m, { size: 26, dot: m[0] !== '+' });
    });
    // panels
    const pw = 330, ph = 200, py = 712;
    // two monitors: dark "standby" until their cue, then the feed lights up
    const feed = (x, a, label, paint) => {
      const on = clamp((t - a) / 0.35);
      screen(x, py, pw, ph, on > 0.5 ? label : 'STANDBY', '', (x0, y0, w, h) => {
        if (on > 0) { ctx.save(); ctx.globalAlpha *= on; paint(x0, y0, w, h); ctx.restore(); }
        if (on < 1) { ctx.fillStyle = rgba('#0b0f20', 1 - on); ctx.fillRect(x0, y0, w, h);
          ctx.fillStyle = rgba('#5a6488', 0.5 * (1 - on)); for (let i = 0; i < 5; i++) ctx.fillRect(x0 + 20, y0 + 70 + i * 24 + ((t * 40 + i * 13) % 20), w - 40, 3); }
      });
    };
    feed(120, tDr, P.drone || 'DRONE', (x0, y0, w, h) => {
      droneTerrain(x0, y0, w, h); truck(x0 + w * 0.55, y0 + h * 0.78, 0.6);
      tbox(x0 + w * 0.55, y0 + h * 0.78 - 22, 130, 80, clamp((t - tDr - 0.6) / 0.45), '');
    });
    feed(525, tSat, P.sat || 'SATELLITE', (x0, y0, w, h) => {
      satTerrain(x0, y0, w, h, 0.45);
      tbox(x0 + w * 0.3, y0 + h * 0.6, 90, 70, clamp((t - tSat - 0.6) / 0.45), '');
    });
    // simulated tag
    chip(487, 690, pop(tSim, 0.4), P.sim || 'SIMULATED SCENARIOS', { size: 26, accent: true });
    // robot at a console, between the monitors
    K.drawRobot(ctx, 487, 1005, 0.72, { t, state: t > tDr ? 'working' : 'thinking', seed: 4 });
    K.drawDesk(ctx, 487, 1035, 1.0);
    ctx.restore();
    return;
  }

  if (mode === 'school') {
    const tSat = at(P.satViewCue || 'satellite', D * 0.1) - 0.2, tPlace = at(P.placeCue || 'Iran', D * 0.22) - 0.1;
    const tDate = at(P.dateCue || 'bombed', D * 0.27) - 0.1, tModel = at(P.modelCue || 'Claude', D * 0.42) - 0.15;
    const tMark = at(P.markCue || 'marked', D * 0.55) - 0.2, tPct = at(P.pctCue || '69%', D * 0.62) - 0.25;
    const tGame = at(P.gamePctCue || 'game', D * 0.8) - 0.15;
    const pct = P.pct == null ? 69 : P.pct, pctG = P.pctGame == null ? 72 : P.pctGame;
    const trials = P.trials || 32, hits = P.hits || 22, hitsG = P.hitsGame || 23;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: tMark, zoom: 1.05, x: 540, y: 700 }, { t: D, zoom: 1.02, x: 487, y: 720 }]);
    room();
    const SX = 120, SY = 440, SW = 740, SH = 380;
    // school + military site positions inside the map
    const school = { x: SX + SW * 0.66, y: SY + SH * 0.5, w: 190, h: 130 };
    screen(SX, SY, SW, SH, P.sat || 'SATELLITE VIEW', P.subSat || 'ILLUSTRATION', (x0, y0, w, h) => {
      satTerrain(x0, y0, w, h, 1);
      // fenced military site (left)
      const mx0 = x0 + 50, my0 = y0 + 90, mw = w * 0.45, mh = h - 140;
      ctx.fillStyle = '#4a4c40'; roundRect(ctx, mx0, my0, mw, mh, 8); ctx.fill();
      ctx.save(); roundRect(ctx, mx0, my0, mw, mh, 8); ctx.clip();
      ctx.strokeStyle = 'rgba(30,30,24,0.35)'; ctx.lineWidth = 6;
      for (let k = -mh; k < mw; k += 26) { ctx.beginPath(); ctx.moveTo(mx0 + k, my0 + mh); ctx.lineTo(mx0 + k + mh, my0); ctx.stroke(); }
      ctx.restore();
      ctx.setLineDash([10, 8]); ctx.strokeStyle = '#d8d2b8'; ctx.lineWidth = 3; roundRect(ctx, mx0, my0, mw, mh, 8); ctx.stroke(); ctx.setLineDash([]);
      for (let i = 0; i < 3; i++) { roundRect(ctx, mx0 + 26, my0 + 30 + i * 70, mw - 52, 40, 6); ctx.fillStyle = '#7c7a68'; ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(mx0 + 26, my0 + 62 + i * 70, mw - 52, 8); }
      // the school: L-shaped light roof + a yard (top-down)
      const sx = school.x - school.w / 2, sy = school.y - school.h / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; roundRect(ctx, sx + 8, sy + 10, school.w, school.h, 6); ctx.fill();
      ctx.fillStyle = '#e8dcc0'; roundRect(ctx, sx, sy, school.w, 52, 6); ctx.fill(); roundRect(ctx, sx, sy, 60, school.h, 6); ctx.fill();
      ctx.fillStyle = '#c9b48c'; ctx.fillRect(sx + 4, sy + 24, school.w - 8, 4); ctx.fillRect(sx + 28, sy + 4, 4, school.h - 8);
      ctx.fillStyle = '#6f8a5a'; roundRect(ctx, sx + 72, sy + 64, school.w - 80, school.h - 72, 6); ctx.fill();
      ctx.strokeStyle = '#e8dcc0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(sx + 72 + (school.w - 80) / 2, sy + 64 + (school.h - 72) / 2, 18, 0, Math.PI * 2); ctx.stroke();
    });
    // labels on the map
    chip(SX + 50 + SW * 0.225, SY + SH - 30, pop(tSat + 0.4), P.milLabel || 'MILITARY SITE', { size: 24 });
    chip(school.x, school.y - school.h / 2 - 14, pop(at('school', tSat + 1) - 0.1), P.schoolLabel || 'SCHOOL', { size: 26, accent: true });
    // place / date pills (calm, grey)
    const pOut = 1 - smooth((t - tPct + 0.3) / 0.3);
    const pp = pop(tPlace);
    if (pp > 0 && pOut > 0) chip(340, 915, pp * pOut, P.place || 'IRAN · A REAL SCHOOL', { size: 26, dot: true });
    const dp = pop(tDate);
    if (dp > 0 && pOut > 0) chip(340, 985, dp * pOut, P.date || 'Bombed in February', { size: 26 });
    // model chip near the robot
    // target box on the school
    const mk = clamp((t - tMark) / 0.5);
    tbox(school.x, school.y, school.w + 40, school.h + 40, mk, '');
    if (t >= tMark && t < tMark + 1.2) beam(eye[0] + 20, eye[1] + 60, school.x + 40, school.y + 30, 1 - clamp((t - tMark - 0.9) / 0.3));
    // stat card (bottom left) with the trial-dot grid
    const sp = pop(tPct, 0.45);
    if (sp > 0) {
      ctx.save(); ctx.translate(345, 945); ctx.scale(sp, sp);
      roundRect(ctx, -200, -90, 400, 180, 22); ctx.fillStyle = 'rgba(8,10,22,0.93)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = RED; ctx.stroke();
      const g = t >= tGame;
      const val = g ? Math.round(lerp(pct, pctG, clamp((t - tGame - 0.2) / 0.5))) : Math.round(K.countUp(pct, t, tPct, 0.9));
      text(val + '%', -100, -28, 74, 'display', RED);
      text(g ? (P.gameLabel || 'called a game') : (P.statLabel || 'of trials'), -100, 44, 26, 'ui', '#c9d2ee', 'center', 180);
      // dot grid 8 x 4
      const lit = g ? hits + (t > tGame + 0.4 ? hitsG - hits : 0) : Math.floor(clamp((t - tPct) / 0.9) * hits);
      for (let i = 0; i < trials; i++) {
        const cx = 18 + (i % 8) * 21, cy = -56 + Math.floor(i / 8) * 28;
        ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fillStyle = i < lit ? RED : '#39405e'; ctx.fill();
      }
      text(`${g ? hitsG : hits} of ${trials}`, 92, 64, 24, 'ui', '#c9d2ee');
      ctx.restore();
    }
    // GAME? chip
    const gp = pop(tGame, 0.4);
    if (gp > 0) chip(500, 872, gp, P.gameChip || 'GAME?', { size: 30, accent: true });
    // the robot + model chip
    K.drawRobot(ctx, ROBX, ROBY, ROBS, { t, state: t >= tMark && t < tMark + 1.5 ? 'working' : 'thinking', flip: true, seed: 4 });
    chip(ROBX - 20, ROBY - 225 * ROBS - 20, pop(tModel), P.model || 'CLAUDE OPUS 5.5', { size: 26, dot: true });
    ctx.restore();
    return;
  }

  if (mode === 'replies') {
    const tA = at(P.coACue || 'Anthropic', 0.1) - 0.1, tQ = at(P.quoteCue || 'very', D * 0.15) - 0.2;
    const tCA = at(P.chipACue || 'safeguards', D * 0.45) - 0.2, tB = at(P.coBCue || 'OpenAI', D * 0.65) - 0.2;
    const tCB = at(P.chipBCue || 'drone', D * 0.8) - 0.2;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 740 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: 1030 });
    const AX = 270, BX = 705, FY = 1040;
    K.drawBuilding(ctx, AX, FY, 0.55, { t, color: '#5b6aa8', floors: 6, lit: 0.6 });
    K.drawBuilding(ctx, BX, FY, 0.55, { t, color: '#4f8a86', floors: 6, lit: 0.6 });
    const top = FY - (60 + 6 * 44) * 0.55;
    chip(AX, top - 30, pop(Math.max(0.05, tA)), P.coA || 'ANTHROPIC', { size: 28, dot: true });
    chip(BX, top - 30, pop(Math.max(0.1, tB)), P.coB || 'OPENAI', { size: 28, dot: true });
    // quote panel (verbatim, text only)
    const qp = pop(tQ, 0.45);
    if (qp > 0) {
      const q = P.quote || '“very clearly against our rules”';
      ctx.save(); ctx.translate(487, 545); ctx.scale(qp, qp);
      roundRect(ctx, -340, -95, 680, 190, 24); ctx.fillStyle = 'rgba(244,246,251,0.97)'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-240, 95); ctx.lineTo(-215, 140); ctx.lineTo(-190, 95); ctx.fill();
      const typed = K.typewriter(q, t, 26, tQ + 0.2);
      const f = H.fitText(ctx, q, 'display', 44, 28, 620);
      ctx.font = f.font; ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const full = ctx.measureText(q).width; ctx.textAlign = 'left'; ctx.fillText(typed, -full / 2, -18);
      text(P.quoteBy || 'Anthropic, to TechCrunch', 0, 52, 24, 'ui', '#5a6488');
      ctx.restore();
    }
    // shields + chips
    const sa = pop(tCA, 0.5), sb = pop(tCB, 0.5);
    if (sa > 0) { K.drawShield(ctx, AX, top + 140, 0.7 * sa, { check: clamp((t - tCA - 0.3) / 0.4) }); chip(360, 700, sa, P.chipA || 'More safeguards coming', { size: 25, accent: true }); }
    if (sb > 0) { K.drawShield(ctx, BX, top + 140, 0.7 * sb, { check: clamp((t - tCB - 0.3) / 0.4) }); chip(620, 772, sb, P.chipB || 'Building drone safeguards', { size: 25, accent: true }); }
    ctx.restore();
    return;
  }

  if (mode === 'caveats') {
    const tH = at(P.cavCue || 'caveats', 0.1) - 0.1;
    const cues = [at(P.cav1Cue || 'public', D * 0.15) - 0.2, at(P.cav2Cue || 'never', D * 0.38) - 0.2, at(P.cav3Cue || 'live', D * 0.68) - 0.2];
    const rows = P.caveats || ['Public models, not military versions', 'Never asked to make the strike decision', 'Live drone targeting: not practical yet'];
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 735 }]);
    room();
    // the map screen, dimmed, in the back
    screen(MX, MY + 20, MW, MH - 40, '', '', (x0, y0, w, h) => { droneTerrain(x0, y0, w, h); }, 0.25);
    chip(487, 480, pop(Math.max(0.05, tH)), P.cavHead || 'THE CAVEATS', { size: 30, accent: true });
    rows.forEach((r, i) => {
      const p = pop(cues[i], 0.45); if (p <= 0) return;
      const y = 560 + i * 118;
      ctx.save(); ctx.translate(487, y); ctx.scale(p, p);
      roundRect(ctx, -370, -48, 740, 96, 20); ctx.fillStyle = 'rgba(8,10,22,0.92)'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.stroke();
      // icon
      ctx.save(); ctx.translate(-315, 0);
      ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
      ctx.strokeStyle = '#141829'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      if (i === 0) { roundRect(ctx, -16, -12, 32, 22, 3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-20, 14); ctx.lineTo(20, 14); ctx.stroke(); }
      else if (i === 1) { ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(14, 14); ctx.moveTo(14, -14); ctx.lineTo(-14, 14); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(-12, -16); ctx.lineTo(12, -16); ctx.lineTo(-12, 16); ctx.lineTo(12, 16); ctx.closePath(); ctx.stroke(); }
      ctx.restore();
      text(r, -265, 0, 30, 'bold', '#ffffff', 'left', 600);
      ctx.restore();
    });
    // the robot at a desk, calm
    K.drawDesk(ctx, 380, 1035, 0.9);
    K.drawLaptop(ctx, 380, 937, 0.55, { t, screen: 'chat' });
    K.drawRobot(ctx, 680, 1035, 0.78, { t, state: 'idle', seed: 4, flip: true });
    ctx.restore();
    return;
  }

  // ------------------------------------------------------------ satellite terrain (hoisted for lab/school)
  function satTerrain(x0, y0, w, h, s) {
    ctx.fillStyle = '#3b3f33'; ctx.fillRect(x0, y0, w, h);
    for (let i = 0; i < 10; i++) {
      const px = x0 + H.hash(i, 11) * w, py = y0 + H.hash(i, 12) * h, r = (50 + H.hash(i, 13) * 80) * s;
      ctx.fillStyle = i % 2 ? 'rgba(110,105,80,0.35)' : 'rgba(30,32,26,0.35)';
      ctx.beginPath(); ctx.ellipse(px, py, r, r * 0.7, 0, 0, Math.PI * 2); ctx.fill();
    }
    ctx.strokeStyle = '#8a8470'; ctx.lineWidth = 14 * s;
    ctx.beginPath(); ctx.moveTo(x0, y0 + h * 0.18); ctx.lineTo(x0 + w, y0 + h * 0.18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x0 + w * 0.53, y0); ctx.lineTo(x0 + w * 0.53, y0 + h); ctx.stroke();
    // small generic blocks
    for (let i = 0; i < 8; i++) {
      const bx = x0 + w * (0.58 + H.hash(i, 21) * 0.38), by = y0 + h * (0.25 + H.hash(i, 22) * 0.7);
      if (s === 1 && bx > x0 + w * 0.55 && bx < x0 + w * 0.8 && by > y0 + h * 0.3 && by < y0 + h * 0.7) continue;
      ctx.fillStyle = '#a99f84'; ctx.fillRect(bx, by, 34 * s, 26 * s);
    }
  }
}
