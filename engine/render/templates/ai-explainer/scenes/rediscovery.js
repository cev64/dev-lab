// Scene "rediscovery" (full frame). An AI "discovery" that turns out to be already published. Cartoon jungle hilltop
// with an overgrown stepped pyramid; a swarm of tiny kit robots (the AI agents); a thick academic journal with a year
// on its cover. Generic cartoons only: no real people, no logos, no real maps or outlet names.
// Fits: "AI claims a find, experts say it was already known" stories (archaeology, science, maths, patents).
// modes (cues are narration words; without them a mode uses fractions of its duration):
//   cold    cold open: robots on the slope plant a NEW! flag on the pyramid (peaks ~0.7 s), then the journal slams
//           down open on the summit (~1.6 s), dust, the flag bends, robots hop back with "?"; year pill.
//           params: flag ("NEW!"), year ("2025"), already ("Already published")
//   scan    (best as a 2-beat span) top-down lidar panel: canopy is swept away by a scan line to show bare-earth
//           contours; mini robots hover over grid tiles; pills: agents, data, area; then a hilltop gets ringed with
//           mound shapes, a letter card ("No registered site here"), and an idea -> reply timeline with an hours pill.
//           params: agents, data, area, flagText, letterHead, letter, from, to, hours;
//           agentsCue, lidarCue, areaCue, flagCue, replyCue, clockCue, hoursCue
//   viral   night: a big phone headline card, copies multiply around it with hearts/shares; an archaeologist cartoon
//           walks in with the journal, holds it open; a "published" pill; the headline copies get "?" marks.
//           params: headline, published; spreadCue, archCue, journalCue
//   compare study at night: robot at a desk with its terrain image (shapes light up), a masked coordinates card with a
//           padlock, the journal opens on a figure; a dashed link between image and figure breaks: MISSED stamp.
//           params: shapes, coords, coordsNote, figure, missed; shapesCue, coordsCue, figuresCue, missCue
//   stamp   dusk callback to the hilltop (journal on the summit, robots resting); a big card reads DISCOVERY, a stamp
//           prints RE in front of it; then a verbatim quote panel types in with attribution.
//           params: word ("DISCOVERY"), re ("RE"), quote, by; reCue, quoteCue
export default function draw(ctx, t, info) {
  const P = info.params || {};
  const T = tools(info);
  (MODES[P.mode] || MODES.cold)(ctx, t, info, T);
}

const RED = '#ff5d6c';
const PAPER = '#f3efe2';

function tools(info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const at = (w, d) => { if (typeof w === 'number') return w; const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  return { H, K, P, D: info.duration, at, ACC: info.accent || K.ACCENT.base };
}

// ---------- shared drawing ----------
function jungle(ctx, t, T, o = {}) {
  const { H, K } = T;
  const dusk = o.time === 'dusk';
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  if (dusk) { g.addColorStop(0, '#2a2350'); g.addColorStop(0.42, '#7a4a6a'); g.addColorStop(0.62, '#d98a6a'); g.addColorStop(1, '#1a2a22'); }
  else { g.addColorStop(0, '#0d1433'); g.addColorStop(0.45, '#1b2a55'); g.addColorStop(0.62, '#244063'); g.addColorStop(1, '#0d1c18'); }
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  // stars / moon
  if (!dusk) {
    for (let i = 0; i < 46; i++) {
      const x = H.hash(i, 3) * 1080, y = 120 + H.hash(i, 4) * 560, tw = 0.5 + 0.5 * Math.sin(t * 2 + i);
      ctx.globalAlpha = 0.3 + 0.5 * tw; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 1.5 + H.hash(i, 5) * 1.5, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    K.glow(ctx, 820, 470, 130, '#dfe6ff', 0.3); ctx.fillStyle = '#eef1ff'; ctx.beginPath(); ctx.arc(820, 470, 36, 0, 7); ctx.fill();
  } else {
    K.glow(ctx, 760, 760, 220, '#ffb27a', 0.45); ctx.fillStyle = '#ffc48f'; ctx.beginPath(); ctx.arc(760, 760, 52, 0, 7); ctx.fill();
  }
  // distant hills
  ctx.fillStyle = dusk ? '#4a3a5a' : '#1a2f45';
  ctx.beginPath(); ctx.moveTo(0, 860);
  for (let x = 0; x <= 1080; x += 40) ctx.lineTo(x, 820 - Math.sin(x / 140) * 40 - H.hash(x, 7) * 18);
  ctx.lineTo(1080, 1920); ctx.lineTo(0, 1920); ctx.fill();
  // big hill
  ctx.fillStyle = dusk ? '#2f4a36' : '#1d3b2c';
  ctx.beginPath(); ctx.moveTo(-20, 1060); ctx.bezierCurveTo(200, 960, 330, 760, 490, 760); ctx.bezierCurveTo(650, 760, 790, 960, 1100, 1060); ctx.lineTo(1100, 1920); ctx.lineTo(-20, 1920); ctx.fill();
  // ground
  ctx.fillStyle = dusk ? '#22382a' : '#152c21'; ctx.fillRect(0, 1035, 1080, 900);
}

// stepped pyramid on the hilltop; anchor = base centre
function pyramid(ctx, x, y, s, T, o = {}) {
  const { H } = T;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const tiers = 5, w0 = 340, th = 44;
  for (let i = 0; i < tiers; i++) {
    const w = w0 - i * 56, yy = -i * th;
    ctx.fillStyle = i % 2 ? '#9a8f78' : '#a89c82'; ctx.fillRect(-w / 2, yy - th, w, th);
    ctx.fillStyle = 'rgba(0,0,0,0.16)'; ctx.fillRect(-w / 2, yy - 8, w, 8);
    // stone lines
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; for (let k = -w / 2 + 30; k < w / 2; k += 42) ctx.fillRect(k, yy - th + 6, 3, th - 14);
  }
  // stairs
  ctx.fillStyle = '#7d735f'; ctx.fillRect(-34, -tiers * th, 68, tiers * th);
  ctx.fillStyle = '#b8ad93'; for (let k = 0; k < tiers * 4; k++) ctx.fillRect(-34, -k * 11 - 4, 68, 3);
  // temple box on top
  ctx.fillStyle = '#8c826c'; ctx.fillRect(-60, -tiers * th - 62, 120, 62);
  ctx.fillStyle = '#2c2a26'; ctx.fillRect(-18, -tiers * th - 44, 36, 44);
  // overgrowth
  if (o.overgrown !== false) {
    for (let i = 0; i < 22; i++) {
      const u = H.hash(i, 11), v = H.hash(i, 12);
      const tier = Math.floor(v * tiers), w = w0 - tier * 56;
      const px = (u - 0.5) * w, py = -tier * th - 6;
      const sw = Math.sin(t0(o) * 1.6 + i) * 2;
      ctx.fillStyle = i % 3 ? '#3f7d4a' : '#58a05c';
      ctx.beginPath(); ctx.ellipse(px + sw, py, 26 + H.hash(i, 13) * 18, 14 + H.hash(i, 14) * 8, 0, 0, 7); ctx.fill();
    }
  }
  ctx.restore();
}
const t0 = (o) => o.t || 0;
const PYR_TOP = 5 * 44 + 62; // height of the pyramid at scale 1

function trees(ctx, t, T, front) {
  const { H } = T;
  const xs = front ? [40, 170, 930, 1050] : [90, 300, 700, 990];
  xs.forEach((x, i) => {
    const y = front ? 1080 : 1000, s = front ? 1.25 : 0.9;
    const sw = Math.sin(t * 0.9 + i * 1.7) * 0.04;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(sw);
    ctx.fillStyle = '#4a3526'; ctx.fillRect(-9, -240, 18, 240);
    for (let l = 0; l < 6; l++) {
      const a = -Math.PI / 2 + (l - 2.5) * 0.5;
      ctx.save(); ctx.translate(0, -240); ctx.rotate(a + Math.PI / 2);
      ctx.fillStyle = l % 2 ? (front ? '#2e6b3c' : '#24563a') : (front ? '#3b8a4b' : '#2c6845');
      ctx.beginPath(); ctx.ellipse(0, -70, 26, 80, 0, 0, 7); ctx.fill(); ctx.restore();
    }
    ctx.restore();
  });
  if (front) {
    for (let i = 0; i < 14; i++) {
      const x = H.hash(i, 21) * 1080, y = 1050 + H.hash(i, 22) * 30, sw = Math.sin(t * 1.3 + i) * 4;
      ctx.fillStyle = i % 2 ? '#2a6038' : '#347a44';
      ctx.beginPath(); ctx.ellipse(x + sw, y, 60, 26, 0, 0, 7); ctx.fill();
    }
  }
}

// thick academic journal. anchor = bottom centre. open 0..1 (closed cover -> open spread with a figure)
function journal(ctx, x, y, s, T, o = {}) {
  const { H, ACC } = T;
  const open = H.clamp(o.open || 0), year = o.year || '2025';
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || 0);
  T.K.shadow(ctx, 0, 6, 320);
  if (open < 0.5) {
    const w = 200 + open * 2 * 40;
    // closed: cover facing up
    H.roundRect(ctx, -w / 2 - 6, -46, w + 12, 46, 8); ctx.fillStyle = '#e9e4d4'; ctx.fill(); // page block
    ctx.fillStyle = '#cfc8b4'; for (let k = 0; k < 5; k++) ctx.fillRect(-w / 2, -38 + k * 7, w, 2);
    H.roundRect(ctx, -w / 2 - 10, -260, w + 20, 222, 10); ctx.fillStyle = '#1f5a63'; ctx.fill();
    ctx.fillStyle = '#17474e'; ctx.fillRect(-w / 2 - 10, -260, 22, 222);
    ctx.fillStyle = PAPER; ctx.font = H.font('display', 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(o.title || 'JOURNAL', 10, -210);
    ctx.fillStyle = 'rgba(243,239,226,0.5)'; ctx.fillRect(-60, -184, 140, 4);
    H.roundRect(ctx, -50, -158, 120, 56, 12); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = '#14160a'; ctx.font = H.font('display', 38); ctx.fillText(year, 10, -128);
  } else {
    const k = (open - 0.5) * 2;
    const w = 300;
    H.roundRect(ctx, -w - 14, -36, w * 2 + 28, 36, 8); ctx.fillStyle = '#1f5a63'; ctx.fill();
    // two pages
    for (const side of [-1, 1]) {
      ctx.save(); ctx.scale(side < 0 ? 1 : H.lerp(0.1, 1, k), 1);
      ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(side * w * 0.5, -46, side * w, -36); ctx.lineTo(side * w, -236); ctx.quadraticCurveTo(side * w * 0.5, -250, 0, -230); ctx.closePath();
      ctx.fillStyle = PAPER; ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-3, -232, 6, 200);
    // left page: text lines + year header
    ctx.fillStyle = '#1f5a63'; ctx.font = H.font('display', 30); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(year, -w + 28, -206);
    ctx.fillStyle = '#c9c1aa'; for (let l = 0; l < 8; l++) ctx.fillRect(-w + 28, -176 + l * 17, 230 - (l % 3) * 40, 6);
    // right page: a figure (contours with a ringed mound)
    if (k > 0.3) {
      ctx.save(); ctx.globalAlpha = H.smooth((k - 0.3) / 0.5);
      H.roundRect(ctx, 24, -220, w - 52, 160, 6); ctx.fillStyle = '#dcd5c0'; ctx.fill();
      ctx.strokeStyle = '#8b8370'; ctx.lineWidth = 2;
      for (let r = 1; r < 6; r++) { ctx.beginPath(); ctx.ellipse(24 + (w - 52) / 2, -140, r * 22, r * 13, 0.2, 0, 7); ctx.stroke(); }
      ctx.fillStyle = '#6f675a'; for (let q = 0; q < 5; q++) ctx.fillRect(24 + (w - 52) / 2 - 30 + (q % 3) * 22, -150 + Math.floor(q / 3) * 18, 14, 10);
      ctx.strokeStyle = RED; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(24 + (w - 52) / 2, -140, 46, 0, 7); ctx.stroke();
      ctx.fillStyle = '#8b8370'; ctx.font = H.font('ui', 20); ctx.textAlign = 'left'; ctx.fillText('Fig. 3', 30, -44);
      ctx.restore();
    }
  }
  ctx.restore();
}

function pill(T, ctx, x, y, k, text, o = {}) {
  const { H, ACC } = T;
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  const size = o.size || 32;
  const f = H.fitText(ctx, text, o.kind || 'ui', size, 22, o.maxW || 640); ctx.font = f.font;
  const w = ctx.measureText(f.text).width + 56, h = size * 1.85;
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = o.solid ? (o.color || ACC) : 'rgba(10,12,24,0.93)'; ctx.fill();
  if (!o.solid) { ctx.lineWidth = 3; ctx.strokeStyle = o.color || ACC; ctx.stroke(); }
  ctx.fillStyle = o.solid ? '#14160a' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
  ctx.restore();
}

function qmark(T, ctx, x, y, k, color) {
  if (k <= 0.01) return;
  const { H } = T;
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, 7); ctx.fillStyle = color || '#ffffff'; ctx.fill();
  ctx.fillStyle = '#14160a'; ctx.font = H.font('display', 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 2);
  ctx.restore();
}

function flag(ctx, x, y, s, T, o = {}) {
  const { H, ACC } = T;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.tilt || 0);
  ctx.fillStyle = '#d9d4cc'; ctx.fillRect(-4, -230, 8, 230);
  const wave = Math.sin((o.t || 0) * 6) * 6 * (o.droop ? 0.2 : 1);
  const droop = o.droop || 0;
  ctx.beginPath(); ctx.moveTo(4, -228);
  ctx.quadraticCurveTo(80, -238 + wave + droop * 40, 160 - droop * 70, -222 + wave + droop * 110);
  ctx.lineTo(160 - droop * 70, -150 + wave + droop * 110);
  ctx.quadraticCurveTo(80, -164 - wave + droop * 40, 4, -150);
  ctx.closePath(); ctx.fillStyle = ACC; ctx.fill();
  ctx.save(); ctx.translate(80 - droop * 30, -188 + droop * 60); ctx.rotate(droop * 0.7);
  ctx.fillStyle = '#14160a'; ctx.font = H.font('display', 40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.text || 'NEW!', 0, 2);
  ctx.restore();
  ctx.restore();
}

function dust(ctx, x, y, t, start, T) {
  const { H } = T;
  const u = (t - start) / 1.1;
  if (u <= 0 || u >= 1) return;
  for (let i = 0; i < 16; i++) {
    const a = Math.PI + (i / 15) * Math.PI, r = 60 + u * (180 + H.hash(i, 31) * 120);
    ctx.globalAlpha = 0.55 * (1 - u);
    ctx.fillStyle = '#d8ccb0';
    ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 1.4, y + Math.sin(a) * r * 0.35 + 10, 18 + u * 26, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ---------- modes ----------
const MODES = {
  cold(ctx, t, info, T) {
    const { H, K, P } = T;
    const tSlam = 1.45, PX = 487, PY = 1010, PS = 1.22;
    const topY = PY - PYR_TOP * PS;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 490, y: 740 }, { t: tSlam, zoom: 1.08, x: 490, y: 730 }, { t: 3.5, zoom: 1.02, x: 490, y: 740 }]);
    if (t > tSlam && t < tSlam + 0.5) K.cameraShake(ctx, t, tSlam, 0.45, 14);
    jungle(ctx, t, T, {});
    trees(ctx, t, T, false);
    pyramid(ctx, PX, PY, PS, T, { t });
    // robots swarm up the stairs and around the summit
    const n = 8;
    for (let i = 0; i < n; i++) {
      const side = i % 2 ? 1 : -1;
      const lane = Math.floor(i / 2); // tier the robot stands on
      const climb = H.clamp(0.75 + t * 0.25 - lane * 0.05);
      const bx = PX + side * (175 - lane * 30) * PS, by = PY - (lane * 44 + 2) * PS - (1 - climb) * 30;
      const hop = t > tSlam ? H.smooth((t - tSlam) / 0.35) * (1 - H.smooth((t - tSlam - 0.35) / 0.4)) : 0;
      const recoil = t > tSlam ? side * 40 * H.easeOutCubic(H.clamp((t - tSlam) / 0.5)) : 0;
      K.drawRobot(ctx, bx + recoil, by - hop * 50, 0.5, { t, state: t < tSlam ? 'working' : 'thinking', seed: i + 1 });
      if (t > tSlam + 0.3 && i < 6) qmark(T, ctx, bx + recoil, by - 135 - hop * 50, K.popIn(t, tSlam + 0.3 + i * 0.07, 0.35));
    }
    // the flag gets planted (peak ~0.7 s), bends when the journal lands
    const plant = H.easeOutCubic(H.clamp((t + 0.25) / 0.7));
    const droop = H.smooth((t - tSlam) / 0.6);
    flag(ctx, PX + 95, topY + 70 + (1 - plant) * 60, 0.95, T, { t, text: P.flag || 'NEW!', tilt: 0.12 * (1 - plant) + droop * 0.5, droop });
    if (t < tSlam) K.glow(ctx, PX + 150, topY - 200, 160, T.ACC, 0.35 * plant * (0.7 + 0.3 * Math.sin(t * 8)));
    // journal falls and slams on the summit
    const fall = H.clamp((t - 0.8) / (tSlam - 0.8));
    const jy = H.lerp(-120, topY + 8, fall * fall);
    const squash = t > tSlam ? 1 - 0.12 * Math.sin(H.clamp((t - tSlam) / 0.25) * Math.PI) : 1;
    if (t > 0.8) { ctx.save(); ctx.translate(PX, jy); ctx.scale(1 / squash, squash); journal(ctx, 0, 0, 0.82, T, { open: 0, year: P.year || '2025', rot: (1 - fall) * -0.3 }); ctx.restore(); }
    if (t >= tSlam) dust(ctx, PX, topY, t, tSlam, T);
    trees(ctx, t, T, true);
    ctx.restore();
    pill(T, ctx, 487, 1040, K.popIn(t, tSlam + 0.45, 0.4), `${P.already || 'Already published'} · ${P.year || '2025'}`, { solid: true, size: 34 });
  },

  scan(ctx, t, info, T) {
    const { H, K, P, D, at, ACC } = T;
    const b2 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.5;
    const tAg = at(P.agentsCue, 1.5) - 0.2, tLid = at(P.lidarCue, 3.5) - 0.2, tArea = at(P.areaCue, 6.5) - 0.2;
    const tFlag = at(P.flagCue, b2 + 0.8) - 0.3, tReply = at(P.replyCue, b2 + 4) - 0.3;
    const tClock = at(P.clockCue, b2 + 7) - 0.3, tHours = at(P.hoursCue, D - 2) - 0.2;
    const MX = 120, MY = 470, MW = 735, MH = 520; // map panel (stage)
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: b2, zoom: 1.0, x: 487, y: 725 }, { t: tFlag + 1, zoom: 1.02, x: 500, y: 715 }, { t: tReply, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.02, x: 487, y: 735 }]);
    // control-room backdrop
    const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#0b1230'); g.addColorStop(1, '#111a3a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    ctx.strokeStyle = 'rgba(120,150,255,0.07)'; ctx.lineWidth = 2;
    for (let x = 0; x < 1080; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1920); ctx.stroke(); }
    for (let y = 0; y < 1920; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }
    // map panel
    H.roundRect(ctx, MX - 12, MY - 12, MW + 24, MH + 24, 22); ctx.fillStyle = '#1b2240'; ctx.fill();
    ctx.save(); H.roundRect(ctx, MX, MY, MW, MH, 14); ctx.clip();
    // bare-earth contour terrain (lidar look)
    ctx.fillStyle = '#26303f'; ctx.fillRect(MX, MY, MW, MH);
    const hx = MX + MW * 0.62, hy = MY + MH * 0.42; // the hilltop
    const hills = [[hx, hy, 1.0], [MX + 170, MY + 360, 0.8], [MX + 120, MY + 120, 0.6], [MX + 600, MY + 430, 0.7]];
    hills.forEach(([cx, cy, s], hi) => {
      for (let r = 7; r >= 1; r--) {
        const c = 40 + r * 9;
        ctx.fillStyle = `rgb(${c + 20},${c + 34},${c + 30})`;
        ctx.beginPath(); ctx.ellipse(cx, cy, r * 30 * s, r * 21 * s, 0.3 + hi, 0, 7); ctx.fill();
      }
    });
    // canopy covers what the scan line has not reached yet
    const sweep = H.clamp((t - tLid) / 4.2);
    const sx = MX + sweep * (MW + 40);
    for (let i = 0; i < 70; i++) {
      const cx = MX + H.hash(i, 51) * MW, cy = MY + H.hash(i, 52) * MH;
      if (cx < sx - 20) continue;
      ctx.fillStyle = i % 3 ? '#2f7a45' : '#3d9152';
      ctx.beginPath(); ctx.arc(cx, cy, 46 + H.hash(i, 53) * 30, 0, 7); ctx.fill();
    }
    if (sweep > 0 && sweep < 1) {
      ctx.fillStyle = ACC; ctx.globalAlpha = 0.9; ctx.fillRect(sx - 4, MY, 6, MH);
      K.glow(ctx, sx, MY + MH / 2, 160, ACC, 0.3); ctx.globalAlpha = 1;
    }
    // grid tiles
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2;
    for (let c = 1; c < 6; c++) { ctx.beginPath(); ctx.moveTo(MX + c * MW / 6, MY); ctx.lineTo(MX + c * MW / 6, MY + MH); ctx.stroke(); }
    for (let r = 1; r < 4; r++) { ctx.beginPath(); ctx.moveTo(MX, MY + r * MH / 4); ctx.lineTo(MX + MW, MY + r * MH / 4); ctx.stroke(); }
    // mound shapes revealed on the hilltop after the flag
    const fk = H.smooth((t - tFlag) / 0.6);
    if (fk > 0) {
      ctx.globalAlpha = fk;
      const sq = [[-46, -26, 36, 26], [0, -34, 30, 22], [32, -6, 40, 30], [-28, 14, 28, 22], [16, 30, 26, 18], [-60, 10, 20, 16]];
      sq.forEach(([dx, dy, w, h]) => { ctx.fillStyle = '#c9d4c8'; ctx.fillRect(hx + dx, hy + dy, w, h); ctx.strokeStyle = ACC; ctx.lineWidth = 3; ctx.strokeRect(hx + dx, hy + dy, w, h); });
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // ring on the hilltop
    if (fk > 0) {
      const pulse = 1 + 0.06 * Math.sin(t * 5);
      ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 6; ctx.setLineDash([16, 10]); ctx.lineDashOffset = -t * 30;
      ctx.beginPath(); ctx.arc(hx, hy, 110 * pulse * K.popIn(t, tFlag, 0.5), 0, 7); ctx.stroke(); ctx.restore();
    }
    // the agents: mini robots hovering over tiles, moving tile to tile
    const nb = 12, appear = (i) => K.popIn(t, tAg + i * 0.08, 0.35);
    for (let i = 0; i < nb; i++) {
      const k = appear(i); if (k <= 0.01) continue;
      const hop = Math.floor((t + H.hash(i, 61) * 3) / 2.2);
      const col = Math.floor(H.hash(i, hop) * 6), row = Math.floor(H.hash(hop, i + 9) * 4);
      let tx = MX + (col + 0.5) * MW / 6, ty = MY + (row + 0.5) * MH / 4 + 40;
      if (fk > 0 && i < 5) { const a = (i / 5) * Math.PI * 2 + t * 0.6; tx = H.lerp(tx, hx + Math.cos(a) * 150, fk); ty = H.lerp(ty, hy + 50 + Math.sin(a) * 110, fk); }
      ctx.save(); ctx.translate(tx, ty + K.bob(t, 6, 0.8, i * 0.3)); ctx.scale(k, k);
      K.drawRobot(ctx, 0, 0, 0.36, { t, state: 'working', seed: i + 2 });
      ctx.restore();
    }
    ctx.restore();

    // beat 1 pills (screen space), above the map
    const out1 = 1 - H.smooth((t - tReply + 0.2) / 0.4);
    pill(T, ctx, 300, 418, K.popIn(t, tAg, 0.4) * out1, P.agents || '48 AI agents', { solid: true, size: 34 });
    pill(T, ctx, 680, 418, K.popIn(t, tLid, 0.4) * out1, P.data || 'Public NASA lidar', { size: 30, maxW: 340 });
    pill(T, ctx, 487, 1030, K.popIn(t, tArea, 0.45) * (1 - H.smooth((t - tFlag + 0.2) / 0.4)), P.area || '≈ 1,200 km² of jungle', { size: 34 });
    pill(T, ctx, 487, 1030, K.popIn(t, tFlag + 0.4, 0.4) * out1, P.flagText || 'Hilltop: looks like a village', { size: 32, color: ACC });

    // beat 2b: the reply letter + idea -> reply timeline
    const lk = K.popIn(t, tReply, 0.5);
    if (lk > 0.01) {
      const ly = 560 + (1 - Math.min(1, lk)) * 80;
      ctx.save(); ctx.translate(487, ly); ctx.scale(Math.min(1.03, lk), Math.min(1.03, lk));
      H.roundRect(ctx, -330, -120, 660, 240, 20); ctx.fillStyle = PAPER; ctx.fill();
      ctx.fillStyle = '#c9c1aa'; ctx.fillRect(-330, -120, 660, 10);
      ctx.fillStyle = '#5a5444'; ctx.font = H.font('ui', 26); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(P.letterHead || "Mexico's heritage institute", -296, -72);
      const msg = P.letter || 'No registered site here';
      const f = H.fitText(ctx, msg, 'display', 44, 26, 590); ctx.font = f.font; ctx.fillStyle = '#1c2033';
      ctx.fillText(K.typewriter(f.text, t, 26, tReply + 0.4), -296, -6);
      ctx.fillStyle = '#c9c1aa'; ctx.fillRect(-296, 50, 420, 6); ctx.fillRect(-296, 72, 300, 6);
      ctx.restore();
    }
    const ck = K.popIn(t, tClock, 0.45);
    if (ck > 0.01) {
      const y = 860;
      ctx.save(); ctx.globalAlpha = Math.min(1, ck);
      H.roundRect(ctx, 130, y - 70, 715, 140, 24); ctx.fillStyle = 'rgba(10,12,24,0.93)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
      const prog = H.smooth((t - tClock - 0.3) / Math.max(0.8, tHours - tClock));
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(300, y + 20); ctx.lineTo(650, y + 20); ctx.stroke();
      ctx.strokeStyle = ACC; ctx.beginPath(); ctx.moveTo(300, y + 20); ctx.lineTo(300 + 350 * prog, y + 20); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = H.font('ui', 28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(P.from || 'Idea', 230, y - 24); ctx.fillText(P.to || 'Official reply', 750, y - 24);
      // lightbulb + envelope icons
      K.drawLightbulb(ctx, 230, y + 52, 0.4, { on: 1, t });
      H.roundRect(ctx, 715, y + 2, 60, 40, 5); ctx.fillStyle = PAPER; ctx.fill();
      ctx.strokeStyle = '#8b8370'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(715, y + 4); ctx.lineTo(745, y + 26); ctx.lineTo(775, y + 4); ctx.stroke();
      // a little clock riding the bar
      K.drawClock(ctx, 300 + 290 * prog, y + 2, 0.36, { t, speed: 6 });
      ctx.restore();
    }
    pill(T, ctx, 487, 1000, K.popIn(t, tHours, 0.45), P.hours || 'Under 72 hours', { solid: true, size: 40 });
  },

  viral(ctx, t, info, T) {
    const { H, K, P, D, at, ACC } = T;
    const tSpread = at(P.spreadCue, 0.3), tArch = at(P.archCue, D * 0.45) - 0.4, tJour = at(P.journalCue, D * 0.7) - 0.3;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 400, y: 700 }, { t: tArch, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 520, y: 735 }]);
    K.world.city(ctx, { t, time: 'night' });
    ctx.fillStyle = 'rgba(8,10,26,0.45)'; ctx.fillRect(0, 0, 1080, 1920);
    // headline copies multiply
    const head = P.headline || 'AI agents discover unmapped Maya site!';
    const spots = [[260, 520], [690, 500], [210, 760], [740, 740], [480, 420], [300, 930], [700, 940]];
    spots.forEach(([x, y], i) => {
      const k = K.popIn(t, tSpread + 0.6 + i * 0.35, 0.4); if (k <= 0.01) return;
      const dim = t > tJour ? 0.55 : 1;
      ctx.save(); ctx.translate(x, y + K.bob(t, 5, 0.5, i * 0.2)); ctx.scale(k * 0.62, k * 0.62); ctx.rotate((H.hash(i, 71) - 0.5) * 0.16);
      ctx.globalAlpha = dim;
      H.roundRect(ctx, -170, -70, 340, 140, 18); ctx.fillStyle = '#f4f6fb'; ctx.fill();
      ctx.fillStyle = RED; H.roundRect(ctx, -150, -52, 70, 24, 6); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.font = H.font('ui', 16); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('NEWS', -115, -40);
      ctx.fillStyle = '#1c2033'; ctx.fillRect(-150, -12, 300, 14); ctx.fillRect(-150, 12, 230, 14);
      ctx.fillStyle = '#c3c9da'; ctx.fillRect(-150, 40, 260, 8);
      ctx.restore();
      if (t > tJour) qmark(T, ctx, x + 90, y - 50, K.popIn(t, tJour + 0.5 + i * 0.1, 0.35), RED);
    });
    // hearts / shares floating up
    for (let i = 0; i < 10; i++) {
      const u = ((t - tSpread) * 0.45 + H.hash(i, 81)) % 1; if (t < tSpread) continue;
      const x = 300 + H.hash(i, 82) * 380 + Math.sin(u * 6 + i) * 20, y = 1000 - u * 520;
      ctx.globalAlpha = (1 - u) * (t > tJour ? 0.3 : 0.9);
      heart(ctx, x, y, 18 + H.hash(i, 83) * 10, i % 3 ? ACC : RED);
      ctx.globalAlpha = 1;
    }
    // the big phone in the middle with the headline
    const pk = K.popIn(t, 0, 0.4);
    const PXc = 487, PYc = 1000, SH = -70;
    ctx.save(); ctx.translate(PXc + SH, PYc); ctx.scale(pk, pk); ctx.translate(-PXc, -PYc);
    H.roundRect(ctx, 327, 470, 320, 540, 40); ctx.fillStyle = '#1b1f30'; ctx.fill();
    H.roundRect(ctx, 343, 500, 288, 480, 26); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    ctx.fillStyle = RED; H.roundRect(ctx, 365, 524, 110, 34, 8); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('ui', 22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('VIRAL', 420, 542);
    ctx.font = H.font('display', 34); ctx.fillStyle = '#1c2033'; ctx.textAlign = 'left';
    wrapLines(ctx, head, 250).slice(0, 5).forEach((l, i) => ctx.fillText(l, 365, 600 + i * 42));
    // jungle thumbnail on the phone
    H.roundRect(ctx, 365, 800, 244, 130, 12); ctx.fillStyle = '#2f6b45'; ctx.fill();
    ctx.fillStyle = '#a89c82'; ctx.beginPath(); ctx.moveTo(420, 915); ctx.lineTo(487, 835); ctx.lineTo(554, 915); ctx.fill();
    ctx.fillStyle = ACC; ctx.fillRect(500, 820, 4, 40); ctx.fillRect(504, 820, 30, 18);
    // share counter row
    ctx.fillStyle = '#5a6078'; ctx.font = H.font('ui', 22); ctx.textAlign = 'left';
    heart(ctx, 380, 958, 12, RED); ctx.fillText('Shared', 400, 958);
    ctx.restore();
    // archaeologist walks in with the journal
    const wk = H.clamp((t - tArch) / 1.2);
    if (wk > 0) {
      const ax = H.lerp(1180, 800, H.easeOutCubic(wk));
      K.drawPerson(ctx, ax, 1040, 1.25, { t, walk: wk < 1 ? t : undefined, pose: t > tJour ? 'point' : 'stand', mood: 'neutral', look: -0.7, flip: true, skin: 2, hair: 1, shirt: 1, hairStyle: 'bun', seed: 41 });
      // sun hat
      ctx.save(); ctx.translate(ax, 1040 - 1.25 * 232); ctx.fillStyle = '#c9a66b';
      ctx.beginPath(); ctx.ellipse(0, 0, 62, 13, 0, 0, 7); ctx.fill(); H.roundRect(ctx, -34, -34, 68, 36, 14); ctx.fill();
      ctx.fillStyle = '#7a5a34'; ctx.fillRect(-34, -8, 68, 8); ctx.restore();
      const open = H.clamp((t - tJour) / 0.5);
      const jx = H.lerp(ax - 60, 770, H.smooth((t - tJour) / 0.6)), jy = H.lerp(960, 720, H.smooth((t - tJour) / 0.6));
      journal(ctx, jx, jy, open > 0 ? 0.46 : 0.45, T, { open: open > 0 ? 0.5 + open * 0.5 : 0, year: '2025' });
    }
    if (t > tJour) K.drawStamp(ctx, PXc + SH, 900, 0.85, { kind: 'cross', text: P.stamp || 'ALREADY KNOWN', land: (t - tJour - 0.6) / 0.5 });
    ctx.restore();
    pill(T, ctx, 487, 1030, K.popIn(t, tJour + 0.3, 0.45), P.published || 'Already in a journal paper · 2025', { solid: true, size: 32 });
  },

  compare(ctx, t, info, T) {
    const { H, K, P, D, at, ACC } = T;
    const tShapes = at(P.shapesCue, D * 0.2) - 0.2, tCoords = at(P.coordsCue, D * 0.4) - 0.3;
    const tFig = at(P.figuresCue, D * 0.65) - 0.4, tMiss = at(P.missCue, D * 0.85) - 0.2;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 300, y: 760 }, { t: tCoords, zoom: 1.0, x: 487, y: 725 }, { t: tMiss, zoom: 1.0, x: 487, y: 725 }, { t: tMiss + 0.8, zoom: 1.05, x: 487, y: 760 }, { t: D, zoom: 1.04, x: 487, y: 750 }]);
    K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true, plant: false, floorY: 920, wall: '#202642' });
    // bookshelf on the right wall
    const x0 = 690, w = 230;
    H.roundRect(ctx, x0, 430, w, 470, 8); ctx.fillStyle = '#3a2c2a'; ctx.fill();
    for (let r = 0; r < 4; r++) {
      ctx.fillStyle = '#5a4038'; ctx.fillRect(x0, 540 + r * 110, w, 10);
      let bx = x0 + 12;
      for (let b = 0; b < 9 && bx < x0 + w - 18; b++) { const bw = 15 + H.hash(r, b) * 13, bh = 62 + H.hash(b, r) * 30; ctx.fillStyle = ['#1f5a63', '#8a5a44', '#4a6aa8', '#7a6a9a', '#a08a5a'][(b + r) % 5]; ctx.fillRect(bx, 540 + r * 110 - bh, bw, bh); bx += bw + 4; }
    }
    // desk
    H.roundRect(ctx, 100, 900, 600, 26, 8); ctx.fillStyle = '#5b4636'; ctx.fill();
    ctx.fillStyle = '#4a382b'; ctx.fillRect(130, 926, 18, 110); ctx.fillRect(650, 926, 18, 110);
    // robot at the desk
    const missK = H.clamp((t - tMiss) / 0.4);
    K.drawRobot(ctx, 170, 1040, 1.2, { t, state: t > tMiss ? 'thinking' : (t > tShapes ? 'working' : 'idle'), seed: 4 });
    // terrain image (agent's view) on a stand
    const IX = 140, IY = 480, IW = 300, IH = 250;
    H.roundRect(ctx, IX - 8, IY - 8, IW + 16, IH + 16, 12); ctx.fillStyle = '#12182e'; ctx.fill();
    ctx.save(); H.roundRect(ctx, IX, IY, IW, IH, 8); ctx.clip();
    ctx.fillStyle = '#26303f'; ctx.fillRect(IX, IY, IW, IH);
    for (let r = 6; r >= 1; r--) { const c = 40 + r * 10; ctx.fillStyle = `rgb(${c + 20},${c + 34},${c + 30})`; ctx.beginPath(); ctx.ellipse(IX + IW / 2, IY + IH / 2, r * 24, r * 17, 0.3, 0, 7); ctx.fill(); }
    const shapes = [[-60, -30, 34, 24], [-10, -40, 30, 22], [30, -10, 38, 28], [-40, 14, 28, 22], [20, 30, 26, 18], [-80, 10, 20, 16]];
    shapes.forEach(([dx, dy, w2, h2], i) => {
      const k = H.smooth((t - tShapes - i * 0.18) / 0.3);
      ctx.fillStyle = '#c9d4c8'; ctx.fillRect(IX + IW / 2 + dx, IY + IH / 2 + dy, w2, h2);
      if (k > 0) { ctx.strokeStyle = ACC; ctx.lineWidth = 3 + k; ctx.globalAlpha = k; ctx.strokeRect(IX + IW / 2 + dx - 3, IY + IH / 2 + dy - 3, w2 + 6, h2 + 6); ctx.globalAlpha = 1; }
    });
    ctx.restore();
    ctx.strokeStyle = '#5a4038'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(IX + IW / 2, IY + IH + 8); ctx.lineTo(IX + IW / 2, 900); ctx.stroke();
    // journal on the desk, opens on the figure
    const jo = H.clamp((t - tFig) / 0.6);
    journal(ctx, 520, 898, 0.62, T, { open: jo > 0 ? 0.5 + jo * 0.5 : 0, year: '2025' });
    // dashed link: image -> figure, breaks on miss
    if (jo >= 1) {
      const p = H.smooth((t - tFig - 0.6) / 0.8);
      const ax = IX + IW / 2 + 40, ay = IY + IH + 10, bx = 520 + 0.62 * 160, by = 898 - 0.62 * 140;
      ctx.save(); ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 30; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.strokeStyle = missK > 0 ? RED : ACC;
      const mx = H.lerp(ax, bx, 0.5), my = H.lerp(ay, by, 0.5) - 30;
      ctx.beginPath(); ctx.moveTo(ax, ay);
      if (missK > 0) { ctx.lineTo(mx - 20, my + 6); ctx.moveTo(mx + 20, my - 6 + missK * 20); ctx.lineTo(bx, by); }
      else { ctx.lineTo(H.lerp(ax, bx, p), H.lerp(ay, by, p)); }
      ctx.stroke(); ctx.restore();
      // magnifier hovering between image and figure until the miss
      if (missK < 1) {
        const u = 0.5 + 0.5 * Math.sin(t * 1.8);
        const lx = H.lerp(ax, bx, u), ly = H.lerp(ay, by, u) - 50;
        ctx.save(); ctx.globalAlpha = 1 - missK; ctx.strokeStyle = '#764d31'; ctx.lineWidth = 9; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(lx + 22, ly + 22); ctx.lineTo(lx + 52, ly + 52); ctx.stroke();
        ctx.beginPath(); ctx.arc(lx, ly, 30, 0, 7); ctx.fillStyle = 'rgba(190,230,255,0.35)'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#d9dff0'; ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();
    // coordinates card (screen space, top right)
    const ck = K.popIn(t, tCoords, 0.45) * (1 - H.smooth((t - tFig + 0.1) / 0.4));
    if (ck > 0.01) {
      ctx.save(); ctx.translate(690, 650); ctx.scale(Math.min(1.04, ck), Math.min(1.04, ck));
      H.roundRect(ctx, -200, -110, 400, 220, 22); ctx.fillStyle = 'rgba(10,12,24,0.95)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.font = H.font('ui', 28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(P.coords || 'Site coordinates', 0, -66);
      ctx.font = H.font('display', 40); ctx.fillStyle = '#8a93a8'; ctx.fillText('••.•••  ••.•••', 0, -10);
      K.drawLock(ctx, -130, 92, 0.42, { open: 0 });
      ctx.fillStyle = ACC; ctx.font = H.font('ui', 28); ctx.textAlign = 'left'; ctx.fillText(P.coordsNote || 'Not published', -90, 58);
      ctx.restore();
    }
    pill(T, ctx, 290, 430, K.popIn(t, tShapes, 0.4) * (1 - H.smooth((t - tFig) / 0.4)), P.shapes || 'Shapes spotted', { solid: true, size: 32 });
    pill(T, ctx, 487, 430, K.popIn(t, tFig + 0.3, 0.4), P.figure || 'Compare: image vs. paper figure', { size: 30, maxW: 700 });
    if (t > tMiss) K.drawStamp(ctx, 700, 820, 0.85, { kind: 'cross', text: P.missed || 'MISSED', land: (t - tMiss) / 0.5 });
  },

  stamp(ctx, t, info, T) {
    const { H, K, P, D, at, ACC } = T;
    const tRe = at(P.reCue, 2.2) - 0.25, tQuote = at(P.quoteCue, D * 0.55) - 0.6;
    const PX = 490, PY = 980, PS = 0.62, topY = PY - PYR_TOP * PS;
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
    jungle(ctx, t, T, { time: 'dusk' });
    trees(ctx, t, T, false);
    pyramid(ctx, PX, PY, PS, T, { t });
    journal(ctx, PX, topY + 4, 0.42, T, { open: 1, year: '2025' });
    for (let i = 0; i < 5; i++) K.drawRobot(ctx, PX - 200 + i * 100 + (i > 1 ? 40 : 0), PY + 40, 0.38, { t, state: 'idle', seed: i + 3 });
    trees(ctx, t, T, true);
    ctx.restore();
    // the word card
    const wk = K.popIn(t, 0.1, 0.45);
    const quoteOn = H.smooth((t - tQuote) / 0.5);
    if (wk > 0.01) {
      const y = H.lerp(560, 450, quoteOn), sc = H.lerp(1, 0.72, quoteOn);
      ctx.save(); ctx.translate(487, y); ctx.scale(Math.min(1.04, wk) * sc, Math.min(1.04, wk) * sc);
      H.roundRect(ctx, -390, -90, 780, 180, 26); ctx.fillStyle = 'rgba(10,12,24,0.95)'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
      const re = P.re || 'RE', word = P.word || 'DISCOVERY';
      const rk = H.clamp((t - tRe) / 0.45);
      ctx.font = H.font('display', 76); ctx.textBaseline = 'middle';
      const ww = ctx.measureText(word).width, rw = ctx.measureText(re).width;
      const total = rk > 0 ? ww + rw : ww, scale = Math.min(1, 700 / total);
      ctx.save(); ctx.scale(scale, scale);
      const x0 = -total / 2;
      ctx.textAlign = 'left'; ctx.fillStyle = '#ffffff';
      ctx.fillText(word, x0 + (rk > 0 ? rw * H.easeOutCubic(rk) : 0) + (rk > 0 ? -rw * (1 - H.easeOutCubic(rk)) * 0 : 0), 4);
      if (rk > 0) {
        const s2 = 1 + 1.4 * Math.pow(1 - H.easeOutCubic(rk), 2);
        ctx.save(); ctx.translate(x0 + rw / 2, 4); ctx.scale(s2, s2); ctx.rotate(-0.08 * (1 - rk));
        ctx.globalAlpha = H.clamp(rk / 0.3); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.fillText(re, 0, 0);
        ctx.restore();
      }
      ctx.restore();
      ctx.restore();
      if (rk > 0.6 && rk < 1) {
        const b = (rk - 0.6) / 0.4; ctx.save(); ctx.strokeStyle = H.rgba(ACC, 1 - b); ctx.lineWidth = 5;
        for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2, r0 = 70 + 30 * b; ctx.beginPath(); ctx.moveTo(150 + Math.cos(a) * r0 - 380, y + Math.sin(a) * r0); ctx.lineTo(150 + Math.cos(a) * (r0 + 18) - 380, y + Math.sin(a) * (r0 + 18)); ctx.stroke(); }
        ctx.restore();
      }
    }
    pill(T, ctx, 487, 690, K.popIn(t, tRe + 0.6, 0.4) * (1 - quoteOn), P.note || 'Post updated by the researcher', { size: 30 });
    // the quote panel
    if (quoteOn > 0.01) {
      const q = P.quote || 'Just spotting something does not add much to our knowledge.';
      ctx.save(); ctx.globalAlpha = quoteOn; ctx.translate(0, (1 - quoteOn) * 40);
      H.roundRect(ctx, 120, 560, 735, 300, 26); ctx.fillStyle = 'rgba(10,12,24,0.95)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = ACC; ctx.fillRect(160, 600, 8, 170);
      const shown = K.typewriter(q, t, 34, tQuote + 0.3);
      ctx.font = H.font('bold', 38); ctx.fillStyle = '#ffffff';
      const lines = wrapLines(ctx, '“' + q + '”', 620);
      let left = shown.length >= q.length ? 1e9 : shown.length + 1;
      lines.forEach((l, i) => { const part = l.slice(0, Math.max(0, left)); left -= l.length + 1; ctx.fillText(part, 200, 640 + i * 50); });
      ctx.fillStyle = '#b8c0d8'; ctx.font = H.font('ui', 26);
      ctx.fillText(P.by || '— Co-author of the 2025 paper, to The Verge', 200, 640 + lines.length * 50 + 24);
      ctx.restore();
    }
  },
};

function wrapLines(ctx, text, maxW) {
  const words = text.split(/\s+/), out = []; let cur = '';
  for (const w of words) { const n = cur ? cur + ' ' + w : w; if (cur && ctx.measureText(n).width > maxW) { out.push(cur); cur = w; } else cur = n; }
  if (cur) out.push(cur);
  return out;
}

function heart(ctx, x, y, r, color) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = color;
  ctx.beginPath(); ctx.moveTo(0, r * 0.9);
  ctx.bezierCurveTo(-r * 1.4, -r * 0.1, -r * 0.6, -r * 1.2, 0, -r * 0.4);
  ctx.bezierCurveTo(r * 0.6, -r * 1.2, r * 1.4, -r * 0.1, 0, r * 0.9);
  ctx.fill(); ctx.restore();
}
