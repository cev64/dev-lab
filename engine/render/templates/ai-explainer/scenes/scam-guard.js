// Scene "scam-guard" (full frame). A phone's built-in guard robot spots a scam chat and warns its owner.
// Fits stories about on-device AI safety features (scam / fraud / phishing detection, privacy-preserving AI).
// One module, several modes (one per beat, or `intro` spanning 2 beats):
//   intro     grandparent on a sofa gets a fake "bank" text; camera into the phone; a scam chat builds up, a guard
//             robot rises in the phone; fact cards pop on the right (who / where / model / trained on + chips).
//             params: cards [{title, value, cue}], chips [{text, cue}], msgs [text], from, notif, guardCue
//   pipeline  "inside your phone": messages slide along a lane past a small filter robot (stage 1); a suspicious one
//             turns red and is lifted to a bigger model robot (stage 2) that reads a longer chat snapshot; a big
//             warning card pops. params: stage1, stage2, normal [text], bad, warnTitle, warnText, filterCue,
//             offCue, readCue, spotCue, warnCue, pauseCue
//   losses    night city: three people's phones send coins up into a big counter; "most send it themselves" pill.
//             params: prefix, value, unit, label, selfText, countCue, selfCue
//   privacy   big phone with a consent toggle, a glass dome, and two buildings whose look-beams bounce off the dome.
//             params: toggle, stay, left, right, consentCue, stayCue, neitherCue, readCue
//   caveat    guard robot thinking beside a "launch date ?" calendar, an "accuracy ??" gauge, and a globe.
//             params: dateTitle, accTitle, globeText, launchCue, accCue, globeCue
//   payoff    back on the sofa: the guard robot holds a warning sign on the sofa arm; question pill + toggle.
//             params: question, guardCue, qCue
export default function draw(ctx, t, info) {
  const P = info.params || {};
  const m = P.mode || 'intro';
  const fn = { intro, pipeline, losses, privacy, caveat, payoff }[m] || intro;
  fn(ctx, t, info, P);
}

// ------------------------------------------------------------------ helpers
const RED = '#ff5d5d';
function cueAt(info, word, fallback, nth = 0) { const c = word ? info.timeOf(word, nth) : null; return c == null ? fallback : c; }
function backdrop(ctx, info, top = '#141a33', bot = '#0a0d1c') {
  const g = ctx.createLinearGradient(0, 0, 0, info.height);
  g.addColorStop(0, top); g.addColorStop(1, bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, info.width, info.height);
}
function gridDots(ctx, t, info, alpha = 0.08) {
  ctx.save(); ctx.fillStyle = `rgba(255,255,255,${alpha})`;
  for (let y = 380; y < 1100; y += 48) for (let x = 40; x < 1040; x += 48) {
    const k = 0.5 + 0.5 * Math.sin(t * 1.3 + x * 0.013 + y * 0.021);
    ctx.globalAlpha = 0.4 + 0.6 * k; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
// pill with optional accent / red fill, anchored at bottom-centre
function pill(ctx, H, x, y, text, o = {}) {
  const size = o.size || 28, pop = o.pop == null ? 1 : o.pop;
  if (pop <= 0.001) return;
  ctx.save();
  const maxW = o.maxW || 820;
  const ft = H.fitText(ctx, text, 'ui', size, 18, maxW - size * 1.6);
  ctx.font = ft.font;
  const w = ctx.measureText(ft.text).width + ft.size * 1.6, h = ft.size * 1.9;
  ctx.translate(x, y - h / 2); ctx.scale(pop, pop);
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
  ctx.fillStyle = o.fill || 'rgba(10,12,24,0.9)'; ctx.fill();
  if (!o.fill) { ctx.lineWidth = 2; ctx.strokeStyle = o.stroke || 'rgba(255,255,255,0.22)'; ctx.stroke(); }
  ctx.fillStyle = o.ink || '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(ft.text, 0, 2);
  ctx.restore();
}
// fact card: small muted title + bold value
function factCard(ctx, H, x, y, w, h, title, value, pop, acc) {
  if (pop <= 0.001) return;
  ctx.save();
  const k = H.easeOutBack(pop);
  ctx.globalAlpha *= H.clamp(pop * 2);
  ctx.translate(x + w / 2, y + h / 2); ctx.scale(0.85 + 0.15 * k, 0.85 + 0.15 * k); ctx.translate(-(x + w / 2), -(y + h / 2));
  H.roundRect(ctx, x, y, w, h, 24); ctx.fillStyle = 'rgba(12,15,30,0.92)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
  H.roundRect(ctx, x, y + 16, 7, h - 32, 3.5); ctx.fillStyle = acc; ctx.fill();
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  let ft = H.fitText(ctx, String(title).toUpperCase(), 'ui', 24, 18, w - 50); ctx.font = ft.font; ctx.fillStyle = acc;
  ctx.fillText(ft.text, x + 28, y + 40);
  ft = H.fitText(ctx, value, 'bold', 36, 22, w - 50); ctx.font = ft.font; ctx.fillStyle = '#fff';
  ctx.fillText(ft.text, x + 28, y + 40 + 14 + ft.size);
  ctx.restore();
}
// generic phone body (front view), returns screen rect
function phoneBody(ctx, H, x, y, w, h, acc, glowA = 0.1) {
  H.glow(ctx, x + w / 2, y + h / 2, Math.max(w, h) * 0.8, acc, glowA);
  H.roundRect(ctx, x, y, w, h, w * 0.14); ctx.fillStyle = '#23283c'; ctx.fill();
  H.roundRect(ctx, x + 2, y + 2, 8, h - 4, 4); ctx.fillStyle = '#353c58'; ctx.fill();
  const s = { x: x + 14, y: y + 14, w: w - 28, h: h - 28 };
  H.roundRect(ctx, s.x, s.y, s.w, s.h, w * 0.1); ctx.fillStyle = '#0d0f1c'; ctx.fill();
  H.roundRect(ctx, x + w / 2 - 34, y + 22, 68, 12, 6); ctx.fillStyle = '#1b1f31'; ctx.fill();
  return s;
}
// chat bubble inside a phone; returns height
function bubble(ctx, H, x, y, maxW, text, o = {}) {
  const size = o.size || 26, lines = H.wrap(ctx, text, o.kind || 'body', size, maxW - 36);
  ctx.font = H.font(o.kind || 'body', size);
  const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 36, h = lines.length * size * 1.25 + 24;
  const bx = o.right ? x - w : x, pop = o.pop == null ? 1 : o.pop;
  if (pop <= 0.001) return h;
  ctx.save();
  const ax = o.right ? x : x;
  ctx.translate(ax, y + h); ctx.scale(pop, pop); ctx.translate(-ax, -(y + h));
  H.roundRect(ctx, bx, y, w, h, 22); ctx.fillStyle = o.fill || 'rgba(255,255,255,0.12)'; ctx.fill();
  if (o.stroke) { ctx.lineWidth = 3; ctx.strokeStyle = o.stroke; ctx.stroke(); }
  ctx.fillStyle = o.ink || '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  lines.forEach((l, i) => ctx.fillText(l, bx + 18, y + 12 + size * (0.95 + i * 1.25)));
  ctx.restore();
  return h;
}
function toggle(ctx, H, x, y, on, acc, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  H.roundRect(ctx, -44, -24, 88, 48, 24); ctx.fillStyle = H.mixHex('#4a5068', acc, on); ctx.fill();
  ctx.beginPath(); ctx.arc(H.lerp(-20, 20, on), 0, 19, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
  ctx.restore();
}
function questionMark(ctx, H, x, y, size, color, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.font = H.font('display', size); ctx.fillStyle = color;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', x, y); ctx.restore();
}
function crossMark(ctx, x, y, r, k, color = RED) {
  if (k <= 0) return;
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 10; ctx.lineCap = 'round';
  const a = Math.min(1, k * 2), b = Math.max(0, k * 2 - 1);
  ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x - r + 2 * r * a, y - r + 2 * r * a); ctx.stroke();
  if (b > 0) { ctx.beginPath(); ctx.moveTo(x + r, y - r); ctx.lineTo(x + r - 2 * r * b, y - r + 2 * r * b); ctx.stroke(); }
  ctx.restore();
}
function grandparent(K, ctx, x, y, s, o) {
  K.drawPerson(ctx, x, y, s, Object.assign({ seat: false, skin: 1, hair: 3, shirt: 3, hairStyle: 'bun', seed: 5 }, o));
}

// ------------------------------------------------------------------ intro (2 beats)
function intro(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth } = H;
  const a1 = info.beats.length >= 2 ? info.beats[1].t0 + 0.25 : D * 0.15;
  const zIn = H.phase(t, a1 - 0.35, a1 + 0.6);
  const sofa = { x: 480, feetY: 1030 }, S = 1.9;
  const ph = { x: sofa.x + 8 * S, y: sofa.feetY - 132 * S };

  // ---- wide shot: living room
  if (zIn < 1) {
    ctx.save();
    let z = lerp(1, 1.06, H.phase(t, 0, a1)), cx = 487, cy = 740;
    z = lerp(z, 3.2, zIn); cx = lerp(cx, ph.x, zIn); cy = lerp(cy, ph.y, zIn);
    ctx.translate(487, 725); ctx.scale(z, z); ctx.translate(-cx, -cy);
    const room = K.world.livingRoomNight(ctx, { t });
    const buzz = t > 0.5 && t < 2.2 ? Math.sin(t * 60) * 3 * (1 - smooth((t - 1.6) / 0.6)) : 0;
    K.glow(ctx, ph.x, ph.y - 20, 160, RED, 0.12 + 0.12 * Math.max(0, Math.sin(t * 8)) * (t > 0.5 ? 1 : 0));
    ctx.save(); ctx.translate(buzz, 0);
    grandparent(K, ctx, room.sofa.x, room.sofa.feetY, S, { pose: 'sit-phone', t, mood: t > 1.2 ? 'worried' : 'neutral' });
    ctx.restore();
    // buzz lines
    if (t > 0.5 && t < 2.4) {
      ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 5; ctx.lineCap = 'round';
      for (let i = -1; i <= 1; i += 2) for (let j = 0; j < 2; j++) {
        const f = (t * 3 + j * 0.5) % 1;
        ctx.globalAlpha = 1 - f;
        ctx.beginPath(); ctx.arc(ph.x, ph.y - 30, 34 + j * 18 + f * 10, i > 0 ? -0.6 : Math.PI - 0.6, i > 0 ? 0.6 : Math.PI + 0.6); ctx.stroke();
      }
      ctx.restore();
    }
    // notification banner (below the hook card)
    const np = K.popIn(t, 0.55, 0.4);
    if (np > 0) {
      ctx.save();
      const bx = 520, by = 830, bw = 380, bh = 116;
      ctx.translate(bx + bw / 2, by + bh / 2); ctx.scale(np, np); ctx.translate(-(bx + bw / 2), -(by + bh / 2));
      H.roundRect(ctx, bx, by, bw, bh, 26); ctx.fillStyle = 'rgba(245,247,252,0.97)'; ctx.fill();
      ctx.beginPath(); ctx.arc(bx + 46, by + bh / 2, 24, 0, Math.PI * 2); ctx.fillStyle = RED; ctx.fill();
      ctx.font = H.font('display', 30); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('!', bx + 46, by + bh / 2 + 1);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.font = H.font('ui', 24); ctx.fillStyle = '#5b6070'; ctx.fillText(P.from || '"Your Bank" · now', bx + 86, by + 44);
      const ft = H.fitText(ctx, P.notif || 'Account frozen. Pay now!', 'ui', 28, 20, bw - 104); ctx.font = ft.font; ctx.fillStyle = '#161927';
      ctx.fillText(ft.text, bx + 86, by + 84);
      ctx.restore();
    }
    ctx.restore();
  }

  // ---- close-up: phone on the left, fact cards on the right
  const close = clamp(H.phase(t, a1 - 0.05, a1 + 0.55, smooth));
  if (close <= 0.002) return;
  ctx.save();
  ctx.globalAlpha = close;
  backdrop(ctx, info, '#151a36', '#090b18');
  gridDots(ctx, t, info, 0.06);
  // phone
  const PX = 80, PY = 440, PW = 420, PH = 600;
  const sc = 0.94 + 0.06 * close;
  ctx.save(); ctx.translate(PX + PW / 2, PY + PH / 2); ctx.scale(sc, sc); ctx.translate(-(PX + PW / 2), -(PY + PH / 2));
  const s = phoneBody(ctx, H, PX, PY, PW, PH, ACC, 0.08);
  // header
  H.roundRect(ctx, s.x, s.y, s.w, 86, 40); ctx.fillStyle = 'rgba(255,255,255,0.05)'; ctx.fill();
  ctx.beginPath(); ctx.arc(s.x + 50, s.y + 46, 22, 0, Math.PI * 2); ctx.fillStyle = '#4a5068'; ctx.fill();
  ctx.font = H.font('display', 22); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', s.x + 50, s.y + 47);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = H.font('ui', 26); ctx.fillStyle = '#fff';
  ctx.fillText('Unknown number', s.x + 86, s.y + 54);
  // scam messages (left side), stacked from the top
  const msgs = P.msgs || ['Hello, this is your bank.', 'Your account is frozen.', 'Move your savings to a safe account now.'];
  const gStart = cueAt(info, P.guardCue || 'itself', D * 0.55);
  const flagAt = cueAt(info, P.flagCue || 'pretending', D * 0.85);
  const times = msgs.map((_, i) => a1 + 0.5 + i * 1.6);
  let yy = s.y + 106;
  const flagged = clamp((t - flagAt) / 0.5);
  msgs.forEach((txt, i) => {
    if (t < times[i]) return;
    const pop = K.popIn(t, times[i], 0.35);
    const red = i === msgs.length - 1 ? flagged : i === msgs.length - 2 ? clamp(flagged - 0.3) : 0;
    const h = bubble(ctx, H, s.x + 18, yy, s.w - 60, txt, { pop, size: 27, fill: H.mixHex('#2b3048', '#5a1e26', red), stroke: red > 0.05 ? H.rgba(RED, red) : null });
    yy += (h + 14) * Math.min(1, pop);
  });
  // guard robot rises from the bottom of the screen + scanning beam
  const gp = clamp((t - gStart) / 0.7);
  if (gp > 0) {
    ctx.save(); H.roundRect(ctx, s.x, s.y, s.w, s.h, 40); ctx.clip();
    const gy = s.y + s.h + 10 - 190 * H.easeOutBack(gp);
    // scanning beam over the chat
    if (gp >= 1) {
      const sy = s.y + 100 + ((t - gStart - 0.7) * 160) % (yy - s.y - 90 + 1);
      const grd = ctx.createLinearGradient(0, sy - 30, 0, sy + 4);
      grd.addColorStop(0, H.rgba(ACC, 0)); grd.addColorStop(1, H.rgba(ACC, 0.45));
      ctx.fillStyle = grd; ctx.fillRect(s.x, sy - 30, s.w, 34);
      ctx.fillStyle = ACC; ctx.fillRect(s.x, sy, s.w, 3);
    }
    K.drawRobot(ctx, s.x + s.w - 90, gy + 160, 0.62, { t, state: flagged > 0 ? 'working' : 'thinking', seed: 7 });
    ctx.restore();
  }
  // warning chip once flagged
  if (flagged > 0) pill(ctx, H, s.x + s.w / 2 - 50, s.y + s.h - 28, 'Looks like a scam', { pop: K.popIn(t, flagAt, 0.4), fill: RED, ink: '#fff', size: 26, maxW: 300 });
  ctx.restore();

  // fact cards (right column)
  const cards = P.cards || [
    { title: 'Oct 14 · unveiled by', value: 'Google DeepMind', cue: 'Google' },
    { title: 'with', value: 'GovTech Singapore', cue: 'GovTech' },
    { title: 'Runs', value: 'On the phone itself', cue: 'runs' },
    { title: 'Model', value: 'Small Gemma model', cue: 'Gemma' },
  ];
  const CX = 530, CW = 385, CH = 106, GAP = 16;
  cards.forEach((c, i) => {
    const at = cueAt(info, c.cue, a1 + 1 + i * 2);
    factCard(ctx, H, CX, 440 + i * (CH + GAP), CW, CH, c.title, c.value, clamp((t - at) / 0.45), ACC);
  });
  // trained-on chips
  const chipTitleAt = cueAt(info, 'trained', D * 0.75);
  const cy0 = 440 + cards.length * (CH + GAP);
  if (t > chipTitleAt) {
    ctx.save(); ctx.globalAlpha *= clamp((t - chipTitleAt) / 0.4);
    ctx.font = H.font('ui', 24); ctx.fillStyle = ACC; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText('TRAINED ON LOCAL SCAM CHATS', CX + 4, cy0 + 26);
    ctx.restore();
  }
  const chips = P.chips || [{ text: 'Fake officials', cue: 'officials' }, { text: 'Fake banks', cue: 'banks' }];
  chips.forEach((c, i) => {
    const at = cueAt(info, c.cue, chipTitleAt + 1 + i);
    pill(ctx, H, CX + 95 + i * 200, cy0 + 100, c.text, { pop: K.popIn(t, at, 0.4), size: 25, maxW: 200,  stroke: H.rgba(RED, 0.8) });
  });
  ctx.restore();
}

// ------------------------------------------------------------------ pipeline (1 beat)
function pipeline(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth } = H;
  const fAt = cueAt(info, P.filterCue || 'filter', D * 0.2);
  const offAt = cueAt(info, P.offCue || 'off', D * 0.45);
  const readAt = cueAt(info, P.readCue || 'reads', D * 0.52);
  const spotAt = cueAt(info, P.spotCue || 'manipulation', D * 0.7);
  const warnAt = cueAt(info, P.warnCue || 'warning', D * 0.78);
  const pauseAt = cueAt(info, P.pauseCue || 'pause', D * 0.88);
  backdrop(ctx, info, '#121833', '#080a16');
  gridDots(ctx, t, info, 0.07);
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
  // "inside your phone" frame
  const fr = K.popIn(t, 0.1, 0.5);
  ctx.save(); ctx.globalAlpha *= clamp(fr);
  H.roundRect(ctx, 66, 452, 848, 600, 56); ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
  H.roundRect(ctx, 490 - 60, 466, 120, 14, 7); ctx.fillStyle = 'rgba(255,255,255,0.14)'; ctx.fill();
  ctx.restore();
  pill(ctx, H, 487, 448, P.inside || 'INSIDE YOUR PHONE', { pop: fr, size: 24, fill: ACC, ink: '#0b0d18', maxW: 400 });

  // lane
  const laneY = 1000;
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 4; ctx.setLineDash([18, 16]); ctx.lineDashOffset = -t * 60;
  ctx.beginPath(); ctx.moveTo(80, laneY + 10); ctx.lineTo(900, laneY + 10); ctx.stroke(); ctx.restore();

  // stage 1: filter robot + scanner gate
  const gx = 300;
  const s1 = K.popIn(t, 0.6, 0.5);
  if (s1 > 0) {
    ctx.save(); ctx.translate(gx, laneY); ctx.scale(s1, s1); ctx.translate(-gx, -laneY);
    const active = t > fAt;
    const beamA = active ? 0.22 + 0.1 * Math.sin(t * 8) : 0.06;
    const gr = ctx.createLinearGradient(gx - 40, 0, gx + 40, 0);
    gr.addColorStop(0, H.rgba(ACC, 0)); gr.addColorStop(0.5, H.rgba(ACC, beamA)); gr.addColorStop(1, H.rgba(ACC, 0));
    ctx.fillStyle = gr; ctx.fillRect(gx - 60, 640, 120, laneY - 630);
    K.drawRobot(ctx, gx - 130, laneY - 40, 0.9, { t, state: active ? 'working' : 'idle', seed: 4 });
    ctx.restore();
  }
  pill(ctx, H, gx - 60, 640, P.stage1 || '1 · Low-power filter', { pop: K.popIn(t, fAt - 0.2, 0.4), size: 26, maxW: 420 });

  // stage 2: bigger model robot on a platform
  const s2x = 720, s2y = 860;
  const s2 = K.popIn(t, 1.0, 0.5);
  if (s2 > 0) {
    ctx.save(); ctx.translate(s2x, s2y); ctx.scale(s2, s2); ctx.translate(-s2x, -s2y);
    H.roundRect(ctx, s2x - 110, s2y, 220, 30, 12); ctx.fillStyle = '#2d3352'; ctx.fill();
    H.roundRect(ctx, s2x - 90, s2y + 30, 180, laneY - s2y - 20, 10); ctx.fillStyle = '#1f2440'; ctx.fill();
    const st = t > spotAt ? 'working' : t > readAt ? 'thinking' : 'idle';
    K.drawRobot(ctx, s2x + 40, s2y, 0.95, { t, state: st, seed: 9 });
    ctx.restore();
  }
  pill(ctx, H, s2x, 590, P.stage2 || '2 · Gemma model', { pop: K.popIn(t, readAt - 0.3, 0.4), size: 26, fill: ACC, ink: '#0b0d18', maxW: 360 });

  // the chat snapshot the model reads
  const snap = clamp((t - readAt) / 0.6);
  if (snap > 0) {
    const sx = 520, sy = 620, sw = 170, sh = 260 * smooth(snap);
    ctx.save();
    H.roundRect(ctx, sx, sy, sw, Math.max(20, sh), 18); ctx.fillStyle = 'rgba(240,243,250,0.95)'; ctx.fill();
    ctx.beginPath(); H.roundRect(ctx, sx, sy, sw, Math.max(20, sh), 18); ctx.clip();
    const rows = 6;
    for (let i = 0; i < rows; i++) {
      const ry = sy + 18 + i * 40; const right = i % 2 === 1;
      const w = 70 + 50 * H.hash(i, 3);
      const bad = t > spotAt && !right && i >= 2;
      ctx.fillStyle = bad ? H.mixHex('#c9cfdd', RED, clamp((t - spotAt - i * 0.12) / 0.3)) : (right ? H.mixHex(ACC, '#ffffff', 0.3) : '#c9cfdd');
      H.roundRect(ctx, right ? sx + sw - 14 - w : sx + 14, ry, w, 26, 12); ctx.fill();
    }
    // reading line
    if (t < spotAt + 0.6) { const ly = sy + 10 + ((t - readAt) * 140) % 240; ctx.fillStyle = H.rgba(ACC, 0.9); ctx.fillRect(sx, ly, sw, 4); }
    ctx.restore();
    if (t > spotAt) pill(ctx, H, sx + sw / 2, sy + 262 + 56, 'Manipulation?', { pop: K.popIn(t, spotAt + 0.2, 0.4), size: 24, fill: RED, maxW: 260 });
  }

  // messages along the lane
  const speed = 300;
  const normal = P.normal || ['Lunch at 1?', 'Running late!', 'Happy birthday!', 'Got the photos'];
  const bad = P.bad || 'Officer here. Pay the fine now.';
  const items = [];
  const t0 = fAt + 0.1;
  normal.forEach((txt, i) => items.push({ txt, start: t0 + i * 1.25 + (i >= 2 ? 3.6 : 0), bad: false }));
  const badStart = offAt - (gx + 140) / speed;
  items.push({ txt: bad, start: badStart, bad: true });
  ctx.save(); H.roundRect(ctx, 70, 456, 840, 592, 52); ctx.clip();
  for (const it of items) {
    const age = t - it.start; if (age < 0 || (!it.bad && it.start > warnAt - 1.5)) continue;
    let x = -140 + age * speed, y = laneY - 40, scale = 1, red = 0, alpha = 1;
    if (it.bad) {
      const atGate = (gx + 140) / speed;
      if (age > atGate) {
        x = gx + 0; red = clamp((age - atGate) / 0.3);
        const lift = clamp((t - (readAt - 0.6)) / 0.7);
        const e = H.easeInOutCubic(lift);
        x = lerp(gx, 560, e); y = lerp(laneY - 40, 700, e) - Math.sin(e * Math.PI) * 90; scale = lerp(1, 0.8, e); alpha = 1 - smooth((lift - 0.8) / 0.2);
      }
    } else if (x > gx - 20 && x < gx + 120) { /* passing the gate */ }
    if (x > 960 || alpha <= 0.01) continue;
    ctx.save(); ctx.globalAlpha *= alpha;
    ctx.translate(x, y); ctx.scale(scale, scale);
    ctx.font = H.font('ui', 26);
    const w = ctx.measureText(it.txt).width + 40;
    H.roundRect(ctx, -w / 2, -26, w, 52, 26);
    ctx.fillStyle = it.bad ? H.mixHex('#3a4060', RED, red) : '#3a4060'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(it.txt, 0, 1);
    ctx.restore();
    // pass tick for normal messages right after the gate
    if (!it.bad && x > gx + 40 && x < gx + 330 && t > fAt) {
      ctx.save(); ctx.globalAlpha *= 1 - clamp((x - gx - 230) / 100);
      ctx.strokeStyle = ACC; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(x - 14, laneY - 96); ctx.lineTo(x - 2, laneY - 84); ctx.lineTo(x + 18, laneY - 108); ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();

  // the warning card
  const wp = clamp((t - warnAt) / 0.45);
  if (wp > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(5,6,14,${0.55 * smooth(wp)})`; ctx.fillRect(0, 0, info.width, info.height);
    const k = H.easeOutBack(wp), cx = 487, cy = 760;
    ctx.translate(cx, cy); ctx.scale(0.6 + 0.4 * k, 0.6 + 0.4 * k); ctx.translate(-cx, -cy);
    const x = 130, y = 560, w = 714, h = 400;
    H.glow(ctx, cx, cy, 420, '#ffcc33', 0.12);
    H.roundRect(ctx, x, y, w, h, 40); ctx.fillStyle = '#f5f7fc'; ctx.fill();
    H.roundRect(ctx, x, y, w, 20, 10); ctx.fillStyle = '#ffcc33'; ctx.fill();
    const pulse = t > warnAt + 0.5 ? 0.5 + 0.5 * Math.sin((t - warnAt) * 5) : 0;
    K.drawWarning(ctx, cx, y + 200, 1.05, { pulse, shadow: false });
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    let ft = H.fitText(ctx, P.warnTitle || 'Possible scam', 'display', 50, 30, w - 80); ctx.font = ft.font; ctx.fillStyle = '#161927';
    ctx.fillText(ft.text, cx, y + 272);
    const pp = clamp((t - pauseAt) / 0.4);
    ft = H.fitText(ctx, P.warnText || 'Pause before you send money', 'ui', 36, 22, w - 80); ctx.font = ft.font;
    ctx.fillStyle = H.mixHex('#5b6070', '#c0392b', pp);
    ctx.fillText(ft.text, cx, y + 336);
    if (pp > 0) { ctx.fillStyle = H.rgba('#c0392b', pp); const tw = ctx.measureText(ft.text).width; ctx.fillRect(cx - tw / 2 * pp, y + 352, tw * pp, 5); }
    ctx.restore();
  }
}

// ------------------------------------------------------------------ losses (1 beat)
function losses(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth } = H;
  const cntAt = cueAt(info, P.countCue || 'four', D * 0.35);
  const selfAt = cueAt(info, P.selfCue || 'most', D * 0.72);
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 487, y: 760 }]);
  K.world.city(ctx, { t, time: 'night', groundY: 1000 });
  ctx.fillStyle = 'rgba(6,8,20,0.35)'; ctx.fillRect(0, 0, info.width, info.height);
  const sgp = K.popIn(t, 0.1, 0.4) * (1 - H.clamp((t - cntAt + 0.4) / 0.3));
  if (sgp > 0.01) pill(ctx, H, 487, 600, P.place || 'SINGAPORE', { pop: sgp, size: 40, fill: ACC, ink: '#0b0d18', maxW: 500 });
  // three people with phones; coins fly up into the counter
  const ppl = [{ x: 210, sk: 0, hr: 1, sh: 0, hs: 'short' }, { x: 487, sk: 3, hr: 3, sh: 2, hs: 'bun' }, { x: 765, sk: 2, hr: 0, sh: 1, hs: 'curly' }];
  ppl.forEach((p, i) => {
    const mood = t > selfAt ? 'worried' : 'neutral';
    K.drawPerson(ctx, p.x, 1030, 1.1, { pose: 'phone', t, typing: t > selfAt ? 1 : 0, mood, skin: p.sk, hair: p.hr, shirt: p.sh, hairStyle: p.hs, seed: 11 + i });
    // "Send" button press after selfAt
    const sp = K.popIn(t, selfAt + 0.3 + i * 0.25, 0.35);
    if (sp > 0) pill(ctx, H, p.x + 40, 880, 'SEND', { pop: sp, size: 22, fill: ACC, ink: '#0b0d18', maxW: 140 });
  });
  // coins: stream from phones to the counter between cntAt-0.6 and the end
  for (let i = 0; i < 18; i++) {
    const who = i % 3, start = cntAt - 0.8 + i * 0.32, age = t - start;
    if (age < 0 || age > 1.3) continue;
    const u = H.easeInOutCubic(age / 1.3);
    const x0 = ppl[who].x + 10, y0 = 850, x1 = 487 + (who - 1) * 120, y1 = 640;
    const x = lerp(x0, x1, u), y = lerp(y0, y1, u) - Math.sin(u * Math.PI) * 60;
    ctx.save(); ctx.globalAlpha *= 1 - smooth((age - 1.05) / 0.25);
    K.drawCoin(ctx, x, y, 0.75, { spin: t * 7 + i, symbol: '$', shadow: false });
    ctx.restore();
  }
  // counter panel
  const cp = K.popIn(t, cntAt - 0.35, 0.45);
  if (cp > 0) {
    ctx.save(); ctx.translate(487, 540); ctx.scale(cp, cp); ctx.translate(-487, -540);
    H.roundRect(ctx, 100, 440, 774, 210, 36); ctx.fillStyle = 'rgba(10,12,26,0.92)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(ACC, 0.6); ctx.stroke();
    const v = P.value || 4, k = clamp((t - cntAt) / 1.2);
    const shown = t < cntAt ? 0 : Math.round(v * H.easeOutCubic(k) * 10) / 10;
    const txt = `${P.prefix || 'S$'}${k >= 1 ? v : shown.toFixed(1)} ${P.unit || 'BILLION+'}`;
    const ft = H.fitText(ctx, txt, 'display', 104, 50, 700); ctx.font = ft.font;
    ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(ft.text, 487, 568);
    const f2 = H.fitText(ctx, P.label || 'lost to scams in Singapore since 2019', 'ui', 32, 20, 700); ctx.font = f2.font; ctx.fillStyle = '#fff';
    ctx.fillText(f2.text, 487, 622);
    ctx.restore();
  }
  // "most send it themselves" pill
  pill(ctx, H, 487, 740, P.selfText || 'Most victims send the money themselves', { pop: K.popIn(t, selfAt, 0.45), size: 30, fill: RED, maxW: 800 });
}

// ------------------------------------------------------------------ privacy (1 beat)
function privacy(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth } = H;
  const conAt = cueAt(info, P.consentCue || 'consent', D * 0.4);
  const stayAt = cueAt(info, P.stayCue || 'stay', D * 0.5);
  const neiAt = cueAt(info, P.neitherCue || 'neither', D * 0.72);
  const readAt = cueAt(info, P.readCue || 'read', D * 0.9);
  backdrop(ctx, info, '#161b38', '#090b18');
  gridDots(ctx, t, info, 0.06);
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 760 }, { t: D, zoom: 1.0 }]);
  // buildings (behind)
  const bp = K.popIn(t, neiAt - 0.2, 0.5);
  const blds = [{ x: 170, label: P.left || 'Google', col: '#4d5f9e' }, { x: 805, label: P.right || 'Government', col: '#6a5a9e' }];
  if (bp > 0) blds.forEach((b) => {
    ctx.save(); ctx.translate(b.x, 1010); ctx.scale(bp, bp); ctx.translate(-b.x, -1010);
    K.drawBuilding(ctx, b.x, 1010, 0.72, { t, color: b.col, floors: 7, lit: 0.6 });
    ctx.restore();
    pill(ctx, H, b.x, 1040, b.label, { pop: bp, size: 24, maxW: 210 });
  });
  // phone
  const PX = 317, PY = 520, PW = 340, PH = 500;
  const pp = K.popIn(t, 0.1, 0.5);
  ctx.save(); ctx.translate(487, 1000); ctx.scale(pp, pp); ctx.translate(-487, -1000);
  const s = phoneBody(ctx, H, PX, PY, PW, PH, ACC, 0.1);
  // toggle row
  H.roundRect(ctx, s.x + 12, s.y + 40, s.w - 24, 70, 20); ctx.fillStyle = 'rgba(255,255,255,0.07)'; ctx.fill();
  ctx.font = H.font('ui', 22); ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(P.toggle || 'Scam check', s.x + 30, s.y + 76);
  const on = H.easeOutBack(clamp((t - conAt) / 0.4));
  toggle(ctx, H, s.x + s.w - 66, s.y + 76, clamp(on), ACC, 0.8);
  // chat lines
  for (let i = 0; i < 4; i++) {
    const right = i % 2 === 1, w = 90 + 60 * H.hash(i, 21), y = s.y + 140 + i * 56;
    ctx.fillStyle = right ? H.mixHex(ACC, '#ffffff', 0.25) : 'rgba(255,255,255,0.16)';
    H.roundRect(ctx, right ? s.x + s.w - 16 - w : s.x + 16, y, w, 40, 18); ctx.fill();
  }
  // tiny guard at the bottom
  K.drawRobot(ctx, s.x + s.w / 2, s.y + s.h - 4, 0.45, { t, state: on > 0.5 ? 'happy' : 'idle', seed: 7 });
  ctx.restore();
  // consent pill
  pill(ctx, H, 487, 500, 'Only with your consent', { pop: K.popIn(t, conAt, 0.4), size: 28, fill: ACC, ink: '#0b0d18', maxW: 500 });
  // glass dome around the phone
  const dome = clamp((t - stayAt) / 0.6);
  if (dome > 0) {
    ctx.save();
    const r = 330 * H.easeOutBack(dome);
    ctx.beginPath(); ctx.ellipse(487, 790, r * 0.72, r * 0.86, 0, 0, Math.PI * 2);
    ctx.fillStyle = H.rgba(ACC, 0.06); ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = H.rgba(ACC, 0.55 + 0.2 * Math.sin(t * 3)); ctx.stroke();
    ctx.restore();
  }
  // look beams from the buildings that bounce off the dome
  if (t > neiAt) blds.forEach((b, i) => {
    const st = neiAt + 0.25 + i * 0.6, u = clamp((t - st) / 0.5);
    if (u <= 0) return;
    const side = b.x < 487 ? 1 : -1;
    const x0 = b.x + side * 20, y0 = 730, x1 = 487 - side * 232, y1 = 770;
    const xe = lerp(x0, x1, H.easeOutCubic(u));
    ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 5; ctx.setLineDash([14, 12]); ctx.lineDashOffset = -t * 40;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(xe, lerp(y0, y1, u)); ctx.stroke(); ctx.restore();
    // eye icon at the start
    ctx.save(); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(x0, y0, 26, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#161927'; ctx.beginPath(); ctx.arc(x0, y0, 8, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // blocked at the dome
    const bk = clamp((t - st - 0.5) / 0.4);
    if (bk > 0) {
      H.glow(ctx, x1, y1, 70, RED, 0.25 * (1 - smooth((t - st - 0.9) / 0.8)) + 0.05);
      crossMark(ctx, x1, y1, 20, bk);
    }
  });
  // closing pill
  const cp = K.popIn(t, readAt - 0.1, 0.4);
  if (cp > 0) pill(ctx, H, 487, 1040, "Can't read your chats", { pop: cp, size: 26, fill: RED, maxW: 380 });
}

// ------------------------------------------------------------------ caveat (1 beat)
function caveat(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth } = H;
  const lAt = cueAt(info, P.launchCue || 'launch', D * 0.08);
  const aAt = cueAt(info, P.accCue || 'accuracy', D * 0.26);
  const gAt = cueAt(info, P.globeCue || 'exploring', D * 0.62);
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true, plant: true });
  ctx.fillStyle = 'rgba(6,8,20,0.3)'; ctx.fillRect(0, 0, info.width, info.height);
  // calendar
  const cp = K.popIn(t, lAt, 0.45);
  if (cp > 0) {
    const x = 120, y = 450, w = 330, h = 250;
    ctx.save(); ctx.translate(x + w / 2, y + h); ctx.scale(cp, cp); ctx.translate(-(x + w / 2), -(y + h));
    H.roundRect(ctx, x, y, w, h, 26); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    H.roundRect(ctx, x, y, w, 70, 26); ctx.fillStyle = RED; ctx.fill(); ctx.fillRect(x, y + 40, w, 30);
    for (let i = 0; i < 2; i++) { H.roundRect(ctx, x + 80 + i * 150, y - 16, 16, 40, 8); ctx.fillStyle = '#9aa2b8'; ctx.fill(); }
    ctx.font = H.font('ui', 26); ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.dateTitle || 'LAUNCH DATE', x + w / 2, y + 38);
    const wob = Math.sin((t - lAt) * 3) * 0.08;
    ctx.save(); ctx.translate(x + w / 2, y + 160); ctx.rotate(wob); questionMark(ctx, H, 0, 0, 120, '#161927'); ctx.restore();
    ctx.restore();
  }
  // accuracy gauge
  const gp = K.popIn(t, aAt, 0.45);
  if (gp > 0) {
    const x = 520, y = 450, w = 340, h = 250, cx = x + w / 2, cy = y + 165;
    ctx.save(); ctx.translate(cx, y + h); ctx.scale(gp, gp); ctx.translate(-cx, -(y + h));
    H.roundRect(ctx, x, y, w, h, 26); ctx.fillStyle = 'rgba(10,12,26,0.94)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke();
    ctx.font = H.font('ui', 26); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.accTitle || 'ACCURACY', cx, y + 38);
    ctx.lineWidth = 22; ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.14)'; ctx.beginPath(); ctx.arc(cx, cy, 90, Math.PI, 2 * Math.PI); ctx.stroke();
    // needle wanders: unknown
    const ang = Math.PI * (1.5 + 0.35 * Math.sin((t - aAt) * 2.3) * Math.cos((t - aAt) * 0.9));
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * 74, cy + Math.sin(ang) * 74); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.font = H.font('display', 40); ctx.fillStyle = '#fff'; ctx.fillText('??%', cx, cy + 50);
    ctx.restore();
  }
  // "not published yet" pill under both
  pill(ctx, H, 487, 735, P.notYet || 'Not announced yet', { pop: K.popIn(t, aAt + 0.9, 0.4), size: 28, fill: RED, maxW: 420 });
  // robot thinking
  K.drawRobot(ctx, 220, 1020, 1.05, { t, state: t > gAt ? 'happy' : 'thinking', seed: 7 });
  // globe with arcs
  const gl = K.popIn(t, gAt - 0.2, 0.5);
  if (gl > 0) {
    ctx.save(); ctx.translate(660, 1030); ctx.scale(gl, gl); ctx.translate(-660, -1030);
    K.drawGlobe(ctx, 660, 1030, 1.35, { t, arcs: 4, progress: clamp((t - gAt) / 1.2) });
    ctx.restore();
    pill(ctx, H, 660, 815, P.globeText || 'Other countries? (exploring)', { pop: K.popIn(t, gAt + 0.3, 0.4), size: 25, maxW: 420 });
  }
}

// ------------------------------------------------------------------ payoff (1 beat)
function payoff(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent;
  const { clamp, smooth } = H;
  const gAt = cueAt(info, P.guardCue || 'guard', D * 0.15);
  const qAt = cueAt(info, P.qCue || 'Would', D * 0.65);
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 520, y: 800 }, { t: D, zoom: 1.0 }]);
  const room = K.world.livingRoomNight(ctx, { t });
  grandparent(K, ctx, room.sofa.x - 40, room.sofa.feetY, 1.9, { pose: 'sit', t, mood: 'happy' });
  // phone resting on the sofa, warning on screen
  const px = 640, py = 905;
  ctx.save(); ctx.translate(px, py); ctx.rotate(-0.12);
  H.roundRect(ctx, -46, -84, 92, 84, 14); ctx.fillStyle = '#23283c'; ctx.fill();
  H.roundRect(ctx, -40, -78, 80, 72, 10); ctx.fillStyle = '#f5f7fc'; ctx.fill();
  K.drawWarning(ctx, 0, -18, 0.4, { shadow: false, pulse: 0.5 + 0.5 * Math.sin(t * 5) });
  ctx.restore();
  // guard robot hops onto the sofa arm with a sign
  const hop = clamp((t - gAt) / 0.6);
  if (hop > 0) {
    const y = 790 - Math.sin(hop * Math.PI) * 90 + (1 - hop) * 60;
    ctx.save(); ctx.globalAlpha *= clamp(hop * 3);
    K.drawRobot(ctx, 770, y, 0.75, { t, state: 'happy', seed: 7 });
    ctx.restore();
    // sign
    const sp = K.popIn(t, gAt + 0.5, 0.4);
    if (sp > 0) pill(ctx, H, 640, y - 120, P.sign || 'PAUSE', { pop: sp, size: 30, fill: '#ffcc33', ink: '#161927', maxW: 220 });
  }
  // question panel
  const qp = clamp((t - qAt) / 0.45);
  if (qp > 0) {
    ctx.save();
    const k = H.easeOutBack(qp);
    ctx.translate(487, 488); ctx.scale(0.7 + 0.3 * k, 0.7 + 0.3 * k); ctx.translate(-487, -488);
    ctx.globalAlpha *= clamp(qp * 2);
    H.roundRect(ctx, 130, 430, 714, 116, 34); ctx.fillStyle = 'rgba(10,12,26,0.94)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(ACC, 0.7); ctx.stroke();
    const ft = H.fitText(ctx, P.question || 'Would you switch it on?', 'display', 44, 26, 500); ctx.font = ft.font;
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(ft.text, 175, 490);
    toggle(ctx, H, 760, 488, clamp((t - qAt - 0.5) / 0.4), ACC, 1.1);
    ctx.restore();
  }
}
