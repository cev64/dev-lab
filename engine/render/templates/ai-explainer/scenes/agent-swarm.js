// Scene "agent-swarm" (full frame). One faceless hooded cartoon operator at a single desk sends a swarm of little
// AI-agent robots to the doors of many buildings at once. Metaphor only: no techniques, no logos, no real people.
// Fits: "one person + many AI agents" scale stories (automated campaigns, bot swarms, agent fleets, mass outreach).
// modes (all cues are narration words or numbers of scene seconds; negative = already happened):
//   cold   (cold open) operator at left, robots arc out of the monitor into ~200 doors on 3 towers; TARGETS counter
//          races to `total`, DAY counter to `days`. Already mid-swarm at frame 0, peaks by ~2.3 s.
//          params: total ("200+"), n (198), days (11), targetsLabel, dayLabel
//   desk   close on the operator's desk: pills (`says`, `who`), a name plate (`name`), the monitor types `tool` + `toolSub`,
//          agent bots pop out of the screen and hover; a sticky `note`; a model chip `model` plugs in + a dim `more` chip.
//          params: says, who, name, tool, toolSub, note, model, more; saysCue, whoCue, nameCue, toolCue, botsCue, noteCue, modelCue
//   map    abstract night map (no real borders): pins drop in 14 clusters while TARGETS counts to `total` and DAY to `days`;
//          start pill, countries pill, big "N DAYS" pill.  params: total, days, start, countries, daysText;
//          startCue, pinsCue, pinsEndCue, countriesCue, daysCue
//   steer  cold layout: the operator gives an instruction bubble, then leans back while robots stream out; at decisionCue
//          three robots freeze with "?" signs, the operator taps, they resume; a before/now pill pair.
//          params: bubble, before, now; bubbleCue, runCue, decisionCue, beforeCue, nowCue
//   doors  street of 4 towers x 50 doors, every door already visited (lime dots, knocks); sector signs light on cues;
//          `open` doors swing open red one by one, an INSIDE counter, rooftop sirens, a cartoon defender runs in.
//          params: towers [4 labels], labelCues [4], targeted, insideLabel, open (9), openCue, openEndCue, alert
//   caveat dark office: assessment clipboard + pill, two model chips (the 2nd "?" under a sweeping magnifier,
//          `unknown` tag), then a forecast pill and a dim row of bots on the horizon.
//          params: by, doc, chip1, chip2, unknown, forecast; byCue, chipCue, unknownCue, forecastCue
export default function draw(ctx, t, info) {
  const P = info.params || {};
  const T = tools(info);
  const f = MODES[P.mode] || MODES.cold;
  ctx.save(); f(ctx, t, info, T); ctx.restore();
}

const RED = '#ff4d5e';

function tools(info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const at = (w, d, nth) => {
    if (typeof w === 'number') return w;
    const v = w ? info.timeOf(w, nth || 0) : null; return v == null ? d : v;
  };
  return { H, K, P, D: info.duration, at, acc: K.ACCENT.base };
}

// ---------------------------------------------------------------- shared drawing
function nightStreet(ctx, H, t, groundY) {
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#060a1c'); g.addColorStop(0.5, '#111a3c'); g.addColorStop(1, '#05070f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  for (let i = 0; i < 70; i++) {
    const x = H.hash(i, 1) * 1080, y = 120 + H.hash(i, 2) * 560, tw = 0.5 + 0.5 * Math.sin(t * 2 + i);
    ctx.globalAlpha = 0.25 + 0.35 * tw * H.hash(i, 3); ctx.fillStyle = '#cfd8ff';
    ctx.fillRect(x, y, 2.5, 2.5);
  }
  ctx.globalAlpha = 1;
  // far skyline silhouettes
  ctx.fillStyle = '#0d1430';
  for (let i = 0; i < 16; i++) {
    const w = 50 + 60 * H.hash(i, 7), h = 120 + 200 * H.hash(i, 8), x = i * 72 - 20;
    ctx.fillRect(x, groundY - h, w, h);
  }
  // ground
  ctx.fillStyle = '#0a0f24'; ctx.fillRect(0, groundY, 1080, 1920 - groundY);
  ctx.fillStyle = '#161e44'; ctx.fillRect(0, groundY, 1080, 10);
}

function roomBg(ctx, H, t, floorY) {
  const g = ctx.createLinearGradient(0, 0, 0, floorY);
  g.addColorStop(0, '#0a0f26'); g.addColorStop(1, '#151d44');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, floorY);
  ctx.strokeStyle = 'rgba(160,190,255,0.05)'; ctx.lineWidth = 2;
  for (let x = 0; x <= 1080; x += 72) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, floorY); ctx.stroke(); }
  // window with a far city at night
  H.roundRect(ctx, 600, 230, 380, 300, 14); ctx.fillStyle = '#070b1c'; ctx.fill();
  ctx.save(); H.roundRect(ctx, 600, 230, 380, 300, 14); ctx.clip();
  for (let i = 0; i < 9; i++) {
    const w = 30 + 20 * H.hash(i, 21), h = 60 + 140 * H.hash(i, 22), x = 600 + i * 44;
    ctx.fillStyle = '#121a3d'; ctx.fillRect(x, 530 - h, w, h);
    for (let j = 0; j < 6; j++) if (H.hash(i * 7 + j, 23) > 0.55) { ctx.fillStyle = 'rgba(255,214,120,0.55)'; ctx.fillRect(x + 6 + (j % 2) * 12, 530 - h + 10 + Math.floor(j / 2) * 22, 6, 8); }
  }
  ctx.restore();
  const fg = ctx.createLinearGradient(0, floorY, 0, 1920);
  fg.addColorStop(0, '#1a2045'); fg.addColorStop(1, '#07091a');
  ctx.fillStyle = fg; ctx.fillRect(0, floorY, 1080, 1920 - floorY);
}

function panel(ctx, H, x, y, w, h, label, value, o = {}) {
  const pop = o.pop == null ? 1 : o.pop;
  if (pop <= 0) return;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2); const s = 0.75 + 0.25 * Math.min(1.05, pop); ctx.scale(s, s); ctx.globalAlpha = Math.min(1, pop * 1.4);
  H.roundRect(ctx, -w / 2, -h / 2, w, h, 20); ctx.fillStyle = 'rgba(8,11,26,0.88)'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = o.color || 'rgba(255,255,255,0.18)'; H.roundRect(ctx, -w / 2, -h / 2, w, h, 20); ctx.stroke();
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
  ctx.font = H.font('ui', 24); ctx.fillStyle = 'rgba(220,226,245,0.8)'; ctx.fillText(label, 0, -h / 2 + 36);
  ctx.font = H.font('display', o.size || 62); ctx.fillStyle = o.color || '#ffffff';
  ctx.fillText(value, 0, h / 2 - 20);
  ctx.restore();
}

// little AI agent: round head, dark visor, accent eyes, tiny thruster. Centre-anchored, ~44 px wide at s = 1.
function miniBot(ctx, H, x, y, s, t, seed, acc, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.tilt || 0);
  if (o.alpha != null) ctx.globalAlpha = o.alpha;
  if (o.flame !== false) {
    const fl = 10 + 4 * Math.sin(t * 30 + seed * 3);
    ctx.beginPath(); ctx.moveTo(-7, 14); ctx.quadraticCurveTo(0, 14 + fl * 1.6, 7, 14); ctx.fillStyle = acc; ctx.globalAlpha *= 0.85; ctx.fill();
    ctx.globalAlpha = o.alpha != null ? o.alpha : 1;
  }
  ctx.strokeStyle = '#c9cfdf'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(0, -27); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -29, 4.5, 0, Math.PI * 2); ctx.fillStyle = acc; ctx.fill();
  H.roundRect(ctx, -22, -19, 44, 34, 14); ctx.fillStyle = '#eef1f8'; ctx.fill();
  H.roundRect(ctx, -16, -12, 32, 18, 8); ctx.fillStyle = '#141a33'; ctx.fill();
  const blink = ((t + seed * 0.71) % 2.9) < 0.1;
  for (const ex of [-7, 7]) { ctx.beginPath(); ctx.ellipse(ex, -3, 3.6, blink ? 0.8 : 3.6, 0, 0, Math.PI * 2); ctx.fillStyle = acc; ctx.fill(); }
  ctx.restore();
}

// faceless hooded cartoon operator, bottom-centre anchored, ~120x262 at s = 1, faces right. o.tap 0..1 = tablet flash,
// o.lean 0..1 = leans back, arms down.
function operator(ctx, H, K, x, y, s, o = {}) {
  const t = o.t || 0, acc = o.acc || '#c4ff3a', lean = o.lean || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.shadow(ctx, 0, 0, 110);
  ctx.rotate(-0.07 * lean);
  const bob = Math.sin(t * 1.5) * 1.5;
  const cloak = '#343a5a', cloakS = '#252a44';
  ctx.translate(0, bob);
  ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -2); ctx.lineTo(54, -2); ctx.quadraticCurveTo(58, -110, 34, -178); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = cloakS; ctx.fillRect(-80, -190, 50, 200); ctx.restore();
  // arm + tablet (raised unless leaning back)
  const ay = lean * 40;
  ctx.strokeStyle = cloak; ctx.lineWidth = 17; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(26, -160); ctx.lineTo(48, -122 + ay); ctx.lineTo(64, -132 + ay * 1.2); ctx.stroke();
  ctx.save(); ctx.translate(72, -138 + ay * 1.2); ctx.rotate(-0.25 + lean * 0.4);
  H.roundRect(ctx, -18, -24, 36, 48, 5); ctx.fillStyle = '#0c0d18'; ctx.fill();
  H.roundRect(ctx, -14, -20, 28, 40, 3); ctx.fillStyle = acc; ctx.globalAlpha = 0.75 + 0.25 * (o.tap || 0); ctx.fill(); ctx.globalAlpha = 1;
  if (o.tap) K.glow(ctx, 0, 0, 70 * o.tap, acc, 0.7 * o.tap);
  ctx.restore();
  ctx.save(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-34, -178); ctx.quadraticCurveTo(-58, -110, -54, -2); ctx.stroke(); ctx.restore();
  // hood (no face: dark opening, two small glowing eyes)
  ctx.beginPath(); ctx.moveTo(0, -262); ctx.quadraticCurveTo(46, -250, 44, -200); ctx.quadraticCurveTo(42, -170, 0, -168); ctx.quadraticCurveTo(-42, -170, -44, -200); ctx.quadraticCurveTo(-46, -244, 0, -262); ctx.closePath();
  ctx.fillStyle = cloak; ctx.fill(); ctx.strokeStyle = 'rgba(160,190,255,0.35)'; ctx.lineWidth = 4; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(10, -204, 25, 24, 0, 0, Math.PI * 2); ctx.fillStyle = '#07080f'; ctx.fill();
  const blink = ((t + 0.7) % 3.1) < 0.12;
  for (const ex of [6, 24]) { ctx.beginPath(); ctx.ellipse(ex, -206, 4.5, blink ? 1 : 4, 0, 0, Math.PI * 2); ctx.fillStyle = '#9fe6ff'; ctx.fill(); }
  ctx.restore();
}

function deskFront(ctx, H, x0, x1, top, bottom) {
  H.roundRect(ctx, x0 - 10, top - 14, x1 - x0 + 20, 22, 8); ctx.fillStyle = '#4a4f73'; ctx.fill();
  H.roundRect(ctx, x0, top + 6, x1 - x0, bottom - top - 6, 10); ctx.fillStyle = '#2c3155'; ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(x0, top + 6, x1 - x0, 14);
}

function monitor(ctx, H, K, x, y, w, h, t, acc, glowA) {
  // x, y = screen top-left; stand below
  ctx.fillStyle = '#20253f'; ctx.fillRect(x + w / 2 - 12, y + h, 24, 40);
  H.roundRect(ctx, x + w / 2 - 60, y + h + 34, 120, 12, 6); ctx.fill();
  H.roundRect(ctx, x - 10, y - 10, w + 20, h + 20, 14); ctx.fillStyle = '#1a1e33'; ctx.fill();
  H.roundRect(ctx, x, y, w, h, 8); ctx.fillStyle = '#0b1328'; ctx.fill();
  if (glowA) K.glow(ctx, x + w / 2, y + h / 2, Math.max(w, h) * 0.7, acc, glowA);
}

function arcPt(x0, y0, x1, y1, u, lift) {
  const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - lift;
  const a = 1 - u;
  return [a * a * x0 + 2 * a * u * cx + u * u * x1, a * a * y0 + 2 * a * u * cy + u * u * y1];
}

// towers with a grid of doors; returns door list [{x, y, tower, i}] (door centre)
function towerLayout(specs) {
  const doors = [], towers = [];
  specs.forEach((s, ti) => {
    const w = s.cols * s.cell + 24, gridH = s.rows * s.cell, top = s.base - gridH - 24 - (s.sign || 0);
    towers.push(Object.assign({}, s, { w, top }));
    for (let r = 0; r < s.rows; r++) for (let c = 0; c < s.cols; c++) {
      doors.push({ x: s.x + 12 + c * s.cell + s.cell / 2, y: s.base - 12 - gridH + r * s.cell + s.cell / 2, tower: ti, i: doors.length });
    }
  });
  return { towers, doors };
}

function drawTowers(ctx, H, K, L, t, acc, doorState, o = {}) {
  L.towers.forEach((tw, ti) => {
    const rise = o.rise ? o.rise(ti) : 1;
    if (rise <= 0) return;
    ctx.save();
    ctx.translate(0, (1 - H.easeOutCubic(Math.min(1, rise))) * 60); ctx.globalAlpha = Math.min(1, rise * 1.5);
    const colr = tw.color || '#1d2652';
    H.roundRect(ctx, tw.x, tw.top, tw.w, tw.base - tw.top, 10); ctx.fillStyle = colr; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(tw.x + tw.w - 14, tw.top + 8, 14, tw.base - tw.top - 8);
    ctx.lineWidth = 3; ctx.strokeStyle = o.alarm && o.alarm(ti) ? H.rgba(RED, 0.4 + 0.4 * Math.abs(Math.sin(t * 5))) : 'rgba(160,190,255,0.14)';
    H.roundRect(ctx, tw.x, tw.top, tw.w, tw.base - tw.top, 10); ctx.stroke();
    if (o.sign) o.sign(tw, ti);
    ctx.restore();
  });
  const dw = L.towers[0].cell * 0.6, dh = L.towers[0].cell * 0.74;
  for (const d of L.doors) {
    const rise = o.rise ? o.rise(d.tower) : 1;
    if (rise <= 0) continue;
    const st = doorState(d);
    const yo = (1 - H.easeOutCubic(Math.min(1, rise))) * 60;
    const x = d.x - dw / 2, y = d.y - dh / 2 + yo;
    ctx.globalAlpha = Math.min(1, rise * 1.5);
    ctx.fillStyle = '#0b1030'; ctx.fillRect(x - 2, y - 2, dw + 4, dh + 2);
    if (st.open > 0) {
      ctx.fillStyle = RED; ctx.fillRect(x, y, dw, dh);
      K.glow(ctx, d.x, d.y + yo, dw * 2.2, RED, 0.55 * st.open);
      ctx.fillStyle = '#3a4374'; ctx.fillRect(x, y, dw * (1 - 0.75 * st.open), dh);
    } else {
      ctx.fillStyle = st.lit ? '#33407a' : '#28315f'; ctx.fillRect(x, y, dw, dh);
      ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(x + dw * 0.72, y + dh * 0.5, 2.5, 2.5);
    }
    if (st.knock > 0) {
      ctx.strokeStyle = H.rgba(acc, st.knock); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(d.x, d.y + yo, dw * (0.6 + 1.1 * (1 - st.knock)), 0, Math.PI * 2); ctx.stroke();
    }
    if (st.dot) { ctx.beginPath(); ctx.arc(x + dw + 1, y + 2, Math.max(3, dw * 0.17), 0, Math.PI * 2); ctx.fillStyle = acc; ctx.fill(); }
    ctx.globalAlpha = 1;
  }
}

function coldLayout() {
  const cell = 28, base = 1010;
  return towerLayout([
    { x: 352, base, cols: 6, rows: 11, cell, color: '#1d2652' },
    { x: 547, base, cols: 6, rows: 11, cell, color: '#222b5c' },
    { x: 742, base, cols: 6, rows: 11, cell, color: '#1b234d' },
  ]);
}
const rankOf = (H, n, salt) => {
  const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => H.hash(a, salt) - H.hash(b, salt));
  const r = new Array(n); idx.forEach((k, j) => { r[k] = j; }); return r;
};

function siren(ctx, H, K, x, y, t, on) {
  H.roundRect(ctx, x - 16, y - 8, 32, 10, 4); ctx.fillStyle = '#3a3f5c'; ctx.fill();
  ctx.beginPath(); ctx.arc(x, y - 8, 14, Math.PI, 0); ctx.fillStyle = on ? RED : '#5a2a35'; ctx.fill();
  if (on) {
    const a = t * 6;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.moveTo(x, y - 12);
      ctx.arc(x, y - 12, 120, a + s * 0.25 + (s > 0 ? Math.PI : 0) - 0.18, a + (s > 0 ? Math.PI : 0) + 0.18);
      ctx.closePath(); ctx.fillStyle = H.rgba(RED, 0.16); ctx.fill();
    }
    ctx.restore();
    K.glow(ctx, x, y - 12, 50, RED, 0.6);
  }
}

// ---------------------------------------------------------------- modes
const MODES = {
  cold(ctx, t, info, T) {
    const { H, K, P, acc } = T;
    nightStreet(ctx, H, t, 1010);
    const L = coldLayout(), N = L.doors.length, rank = rankOf(H, N, 17);
    const T0 = -1.6, SPAN = 3.9, FLY = 0.85;
    const arrive = (k) => T0 + (rank[k] / N) * SPAN;
    const src = [292, 800];
    drawTowers(ctx, H, K, L, t, acc, (d) => {
      const a = arrive(d.i), dt = t - a;
      return { dot: dt >= 0, knock: dt >= 0 && dt < 0.6 ? 1 - dt / 0.6 : 0, lit: dt >= 0 };
    });
    // operator + desk + monitor
    operator(ctx, H, K, 165, 1010, 1.25, { t, acc, tap: 0.5 + 0.5 * Math.sin(t * 9) });
    monitor(ctx, H, K, 232, 790, 120, 80, t, acc, 0.35);
    // monitor face: agent icons streaming
    for (let i = 0; i < 3; i++) miniBot(ctx, H, 256 + i * 36, 832, 0.55, t, i, acc, { flame: false });
    deskFront(ctx, H, 60, 380, 912, 1012);
    // flying bots
    for (let k = 0; k < N; k++) {
      const a = arrive(k), u = (t - (a - FLY)) / FLY;
      if (u <= 0 || u >= 1) continue;
      const d = L.doors[k];
      const [x, y] = arcPt(src[0], src[1], d.x, d.y, H.easeInOutCubic(u), 140 + 80 * H.hash(k, 3));
      miniBot(ctx, H, x, y, 0.62, t, k, acc, { tilt: 0.35 * (1 - u) });
    }
    // counters
    let n = 0; for (let k = 0; k < N; k++) if (t >= arrive(k)) n++;
    const total = String(P.total || '200+');
    const done = n >= N;
    panel(ctx, H, 80, 425, 400, 120, P.targetsLabel || 'TARGETS', done ? total : String(n), { color: done ? acc : '#ffffff', size: 64 });
    const days = P.days || 11, day = 1 + Math.floor((days - 1) * H.clamp((t + 0.6) / 2.9));
    panel(ctx, H, 510, 425, 400, 120, P.dayLabel || 'DAY', `${day} / ${days}`, { color: day >= days ? acc : '#ffffff', size: 64 });
  },

  desk(ctx, t, info, T) {
    const { H, K, P, D, at, acc } = T;
    const tSays = at(P.saysCue, 0.4), tWho = at(P.whoCue, 1.4), tName = at(P.nameCue, 2.4), tTool = at(P.toolCue, 3.6);
    const tBots = at(P.botsCue, 5), tNote = at(P.noteCue, 6.5), tModel = at(P.modelCue, D * 0.85);
    ctx.save();
    roomBg(ctx, H, t, 1010);
    // monitor
    const MX = 440, MY = 590, MW = 440, MH = 260;
    monitor(ctx, H, K, MX, MY, MW, MH, t, acc, t > tTool ? 0.22 : 0.08);
    ctx.save(); H.roundRect(ctx, MX, MY, MW, MH, 8); ctx.clip();
    if (t < tTool) {
      if ((t % 1) < 0.55) { ctx.fillStyle = acc; ctx.fillRect(MX + 30, MY + 40, 18, 30); }
    } else {
      const p = H.clamp((t - tTool) / 0.35);
      ctx.fillStyle = H.rgba(acc, 0.9); ctx.fillRect(MX, MY, MW, 46 * p);
      ctx.font = H.font('ui', 24); ctx.fillStyle = '#0b1328'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      if (p >= 1) ctx.fillText('●  ●  ●', MX + 18, MY + 24);
      const title = String(P.tool || 'AGENT KIT');
      ctx.font = H.font('display', 84); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(K.typewriter ? K.typewriter(title, t, 14, tTool + 0.15) : title, MX + MW / 2, MY + 150);
      const sp = H.clamp((t - tTool - 0.6) / 0.4);
      ctx.globalAlpha = sp; ctx.font = H.font('ui', 30); ctx.fillStyle = 'rgba(220,230,255,0.85)';
      ctx.fillText(P.toolSub || 'AI agent tool', MX + MW / 2, MY + 198); ctx.globalAlpha = 1;
      // agent icons ready to launch
      for (let i = 0; i < 6; i++) {
        const ip = K.popIn(t, tTool + 0.9 + i * 0.08, 0.3);
        if (ip > 0 && t < tBots + i * 0.12) miniBot(ctx, H, MX + 70 + i * 60, MY + 234, 0.6 * ip, t, i, acc, { flame: false });
      }
    }
    ctx.restore();
    // bots that fly out of the screen to a hovering formation
    for (let i = 0; i < 6; i++) {
      const t0 = tBots + i * 0.12, u = H.clamp((t - t0) / 0.7);
      if (t < t0) continue;
      const sx = MX + 70 + i * 60, sy = MY + 234, tx = 500 + i * 70, ty = 470 + (i % 2) * 40;
      const [x, y] = arcPt(sx, sy, tx, ty, H.easeOutCubic(u), 60);
      miniBot(ctx, H, x, y + (u >= 1 ? Math.sin(t * 2.4 + i) * 6 : 0), 0.6 + 0.5 * u, t, i, acc);
    }
    // operator behind the desk, facing the monitor
    operator(ctx, H, K, 245, 1010, 1.32, { t, acc, tap: t > tBots && t < tBots + 0.8 ? 1 - (t - tBots) / 0.8 : 0 });
    deskFront(ctx, H, 90, 900, 900, 1012);
    // sticky note on the monitor
    const np = K.popIn(t, tNote, 0.4);
    if (np > 0) {
      ctx.save(); ctx.translate(MX + MW - 10, MY + 10); ctx.rotate(0.08); ctx.scale(np, np);
      ctx.fillStyle = '#ffe680'; ctx.fillRect(-170, -26, 200, 74);
      ctx.fillStyle = '#5a4a10'; ctx.font = H.font('ui', 24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const nl = String(P.note || 'We covered it|Oct 9').split('|');
      nl.forEach((ln, i) => ctx.fillText(ln, -70, -6 + i * 30 - (nl.length - 1) * 2));
      ctx.restore();
    }
    // model chips on the desk
    const chip = (x, y, text, lit, p) => {
      if (p <= 0) return;
      ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
      ctx.font = H.font('ui', 28); const w = ctx.measureText(text).width + 70;
      H.roundRect(ctx, -w / 2, -52, w, 52, 10); ctx.fillStyle = lit ? acc : '#2a3050'; ctx.fill();
      ctx.fillStyle = lit ? '#1a2a00' : '#9aa3c4';
      for (let i = 0; i < 4; i++) { ctx.fillRect(-w / 2 + 16 + i * 12, -2, 6, 10); ctx.fillRect(w / 2 - 58 + i * 12, -2, 6, 10); }
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = lit ? '#14200a' : '#c7cde6'; ctx.fillText(text, 0, -26);
      if (lit) K.glow(ctx, 0, -26, w * 0.8, acc, 0.35);
      ctx.restore();
    };
    const cp = H.clamp((t - tModel) / 0.45), cx = H.lerp(1150, 560, H.easeOutCubic(cp));
    if (cp > 0) chip(cx, 958, String(P.model || 'AI model'), true, 1);
    chip(800, 958, String(P.more || '+ 2nd model ?'), false, K.popIn(t, tModel + 0.5, 0.35));
    // pills
    const p1 = K.popIn(t, tSays, 0.4); if (p1 > 0) K.drawLabel(ctx, 300, 500, p1, { text: P.says || 'CROWDSTRIKE SAYS', size: 28, dot: true });
    const p2 = K.popIn(t, tWho, 0.4); if (p2 > 0) K.drawLabel(ctx, 300, 572, p2, { text: P.who || 'CHINA-LINKED GROUP', size: 28 });
    const p3 = K.popIn(t, tName, 0.45);
    if (p3 > 0) {
      ctx.save(); ctx.translate(250, 958); ctx.scale(p3, p3);
      ctx.font = H.font('display', 36); const w = ctx.measureText(P.name || 'HACKER GROUP').width + 50;
      H.roundRect(ctx, -w / 2, -34, w, 64, 10); ctx.fillStyle = '#d9c38a'; ctx.fill();
      H.roundRect(ctx, -w / 2 + 6, -28, w - 12, 52, 7); ctx.fillStyle = '#1b1f35'; ctx.fill();
      ctx.fillStyle = acc; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.name || 'HACKER GROUP', 0, 0);
      ctx.restore();
    }
    ctx.restore();
  },

  map(ctx, t, info, T) {
    const { H, K, P, D, at, acc } = T;
    const tStart = at(P.startCue, 0.1), tPins = at(P.pinsCue, 2.3), tPinsEnd = at(P.pinsEndCue, 6.4);
    const tCountries = at(P.countriesCue, 5.8), tDays = at(P.daysCue, D * 0.82);
    // background
    const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#070b1e'); g.addColorStop(0.45, '#0f1838'); g.addColorStop(1, '#05070f');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    const z = H.lerp(1, 1.05, K.phase(t, 0, D));
    ctx.save(); ctx.translate(487, 780); ctx.scale(z, z); ctx.translate(-487, -780);
    ctx.strokeStyle = 'rgba(160,190,255,0.06)'; ctx.lineWidth = 2;
    for (let x = 0; x <= 1080; x += 80) { ctx.beginPath(); ctx.moveTo(x, 560); ctx.lineTo(x, 1010); ctx.stroke(); }
    for (let y = 560; y <= 1010; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }
    // abstract land blobs (no real borders)
    const blobs = [[230, 700, 170, 110, 1], [250, 905, 110, 85, 2], [560, 690, 150, 95, 3], [600, 890, 120, 90, 4], [830, 770, 120, 150, 5]];
    for (const [bx, by, rx, ry, s] of blobs) {
      ctx.beginPath();
      for (let i = 0; i <= 36; i++) {
        const a = (i / 36) * Math.PI * 2, r = 1 + 0.12 * Math.sin(a * 3 + s) + 0.07 * Math.sin(a * 5 + s * 2);
        const x = bx + Math.cos(a) * rx * r, y = by + Math.sin(a) * ry * r;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath(); ctx.fillStyle = '#1a2650'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(160,190,255,0.14)'; ctx.stroke();
    }
    // 14 clusters inside the blobs
    const clusters = [];
    for (let c = 0; c < 14; c++) {
      const b = blobs[c % blobs.length];
      const a = H.hash(c, 41) * Math.PI * 2, r = 0.25 + 0.45 * H.hash(c, 42);
      clusters.push([b[0] + Math.cos(a) * b[2] * r, b[1] + Math.sin(a) * b[3] * r]);
    }
    const N = 200, rank = rankOf(H, N, 29);
    const pinT = (k) => tPins + (rank[k] / N) * (tPinsEnd - tPins);
    const lit = new Array(14).fill(Infinity);
    for (let k = 0; k < N; k++) { const c = k % 14; lit[c] = Math.min(lit[c], pinT(k)); }
    clusters.forEach(([x, y], c) => {
      const p = H.clamp((t - lit[c]) / 0.5);
      if (p <= 0) return;
      const pulse = t > tCountries ? 0.5 + 0.5 * Math.sin((t - tCountries) * 5 + c) : 0;
      ctx.beginPath(); ctx.arc(x, y, 34 + 6 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = H.rgba(acc, 0.08 + 0.1 * p + 0.08 * pulse); ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = H.rgba(acc, 0.25 * p + 0.3 * pulse); ctx.stroke();
    });
    let n = 0;
    for (let k = 0; k < N; k++) {
      const t0 = pinT(k); if (t < t0) continue; n++;
      const c = k % 14, [cx, cy] = clusters[c];
      const a = H.hash(k, 51) * Math.PI * 2, r = 30 * Math.sqrt(H.hash(k, 52));
      const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
      const p = K.popIn(t, t0, 0.3);
      ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
      ctx.beginPath(); ctx.arc(0, -10, 6, Math.PI, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fillStyle = acc; ctx.fill();
      ctx.beginPath(); ctx.arc(0, -10, 2.2, 0, Math.PI * 2); ctx.fillStyle = '#14200a'; ctx.fill();
      ctx.restore();
    }
    ctx.restore();
    const total = String(P.total || '200+'), done = n >= N;
    panel(ctx, H, 80, 425, 400, 120, 'TARGETS', done ? total : String(n), { color: done ? acc : '#fff', pop: K.popIn(t, 0, 0.3) });
    const days = P.days || 11, day = 1 + Math.floor((days - 1) * H.clamp((t - tStart) / Math.max(0.5, tDays - tStart)));
    panel(ctx, H, 510, 425, 400, 120, 'DAY', `${day} / ${days}`, { color: day >= days ? acc : '#fff', pop: K.popIn(t, 0, 0.3) });
    const sp = K.popIn(t, tStart, 0.4); if (sp > 0) K.drawLabel(ctx, 250, 1040, sp, { text: P.start || 'STARTED OCT 17', size: 28, dot: true });
    const cp = K.popIn(t, tCountries, 0.4); if (cp > 0) K.drawLabel(ctx, 715, 1040, cp, { text: P.countries || '14+ COUNTRIES', size: 28 });
    const dp = K.popIn(t, tDays - 0.15, 0.45);
    if (dp > 0) {
      ctx.save(); ctx.translate(487, 790); ctx.scale(dp, dp); ctx.rotate(-0.06);
      ctx.font = H.font('display', 96); const txt = P.daysText || '11 DAYS', w = ctx.measureText(txt).width + 80;
      H.roundRect(ctx, -w / 2, -70, w, 140, 26); ctx.fillStyle = acc; ctx.fill();
      ctx.fillStyle = '#14200a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 6);
      ctx.restore();
    }
  },

  steer(ctx, t, info, T) {
    const { H, K, P, D, at, acc } = T;
    const tBubble = at(P.bubbleCue, 2.8), tRun = at(P.runCue, 5.9), tDec = at(P.decisionCue, 8.8);
    const tGo = tDec + 1.4, tBefore = at(P.beforeCue, 10.4), tNow = at(P.nowCue, 12.5);
    nightStreet(ctx, H, t, 1010);
    const L = coldLayout(), N = L.doors.length;
    const src = [292, 800];
    // launches: a steady stream from tRun, doubled after tNow, stopping 1 s before the end
    const launches = [];
    for (let j = 0; j < 60; j++) {
      const lt = tRun + j * 0.22; if (lt > D - 1.4) break;
      launches.push({ lt, k: (j * 37 + 11) % N, fly: 1.3, j });
      if (lt > tNow) launches.push({ lt: lt + 0.11, k: (j * 53 + 5) % N, fly: 1.1, j: j + 100 });
    }
    // 3 decision bots: launched before tDec, frozen mid-air until tGo
    const dec = [0, 1, 2].map((i) => ({ lt: tDec - 0.45 - i * 0.12, k: [20, 95, 170][i], fly: 1.6, j: 200 + i, dec: true }));
    const eff = (tt) => (tt < tDec ? tt : tt < tGo ? tDec : tt - (tGo - tDec));
    const arrivedAt = new Map();
    for (const b of launches) arrivedAt.set(b.k, Math.min(arrivedAt.get(b.k) ?? Infinity, b.lt + b.fly));
    for (const b of dec) arrivedAt.set(b.k, Math.min(arrivedAt.get(b.k) ?? Infinity, b.lt + b.fly + (tGo - tDec)));
    drawTowers(ctx, H, K, L, t, acc, (d) => {
      const a = arrivedAt.get(d.i); const dt = a == null ? -1 : t - a;
      return { dot: true, lit: true, knock: dt >= 0 && dt < 0.6 ? 1 - dt / 0.6 : 0 };
    });
    const lean = H.smooth(H.clamp((t - tRun) / 0.6)) * (t > tDec && t < tGo ? 0 : 1);
    const tap = t > tDec + 0.3 && t < tGo ? 0.6 + 0.4 * Math.sin(t * 14) : 0;
    operator(ctx, H, K, 165, 1010, 1.25, { t, acc, lean, tap });
    monitor(ctx, H, K, 232, 790, 120, 80, t, acc, 0.3);
    for (let i = 0; i < 3; i++) miniBot(ctx, H, 256 + i * 36, 832, 0.55, t, i, acc, { flame: false });
    deskFront(ctx, H, 60, 380, 912, 1012);
    for (const b of launches) {
      const u = (t - b.lt) / b.fly; if (u <= 0 || u >= 1) continue;
      const d = L.doors[b.k];
      const [x, y] = arcPt(src[0], src[1], d.x, d.y, H.easeInOutCubic(u), 150 + 80 * H.hash(b.j, 3));
      miniBot(ctx, H, x, y, 0.62, t, b.j, acc);
    }
    for (const b of dec) {
      const u = (eff(t) - b.lt) / b.fly; if (u <= 0 || u >= 1) continue;
      const d = L.doors[b.k];
      const [x, y] = arcPt(src[0], src[1], d.x, d.y, H.easeInOutCubic(u), 230);
      miniBot(ctx, H, x, y, 0.8, t, b.j, acc);
      if (t > tDec) {
        const sp = K.popIn(t, tDec + 0.05 + (b.j - 200) * 0.1, 0.35), ok = t > tGo - 0.4;
        if (sp > 0 && t < tGo + 0.5) {
          const fade = t > tGo ? 1 - (t - tGo) / 0.5 : 1;
          ctx.save(); ctx.globalAlpha = fade; ctx.translate(x, y - 62); ctx.scale(sp, sp);
          ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2); ctx.fillStyle = ok ? acc : '#ffffff'; ctx.fill();
          ctx.fillStyle = '#14200a'; ctx.font = H.font('display', 34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(ok ? '✓' : '?', 0, 2); ctx.restore();
          if (t > tDec + 0.3 && t < tGo) {
            ctx.save(); ctx.setLineDash([6, 10]); ctx.lineDashOffset = -t * 60; ctx.strokeStyle = H.rgba(acc, 0.6); ctx.lineWidth = 3;
            ctx.beginPath(); ctx.moveTo(250, 860); ctx.lineTo(x, y - 30); ctx.stroke(); ctx.restore();
          }
        }
      }
    }
    // instruction bubble
    const bp = K.popIn(t, tBubble, 0.4), bOut = H.clamp((t - tRun - 0.8) / 0.4);
    if (bp > 0 && bOut < 1) {
      ctx.save(); ctx.globalAlpha = 1 - bOut;
      K.drawSpeechBubble(ctx, 215, 655, bp, { text: P.bubble || 'Instructions, in Chinese', size: 30, maxW: 380, tail: 'left' });
      ctx.restore();
    }
    // before / now
    const p1 = K.popIn(t, tBefore, 0.4), p2 = K.popIn(t, tNow, 0.4);
    if (p1 > 0) {
      ctx.save(); ctx.globalAlpha = p2 > 0 ? 0.45 : 1;
      K.drawLabel(ctx, 487, 500, p1, { text: P.before || 'BEFORE: ONE AT A TIME', size: 30 }); ctx.restore();
    }
    if (p2 > 0) K.drawLabel(ctx, 487, 578, p2, { text: P.now || 'NOW: MANY AT ONCE', size: 34, accent: true });
  },

  doors(ctx, t, info, T) {
    const { H, K, P, D, at, acc } = T;
    const labels = P.towers || ['Governments', 'Drug makers', 'Chip firms', 'Phone cos'];
    const cues = P.labelCues || [];
    const tOpen = at(P.openCue, D * 0.7), tOpenEnd = at(P.openEndCue, D * 0.9);
    const cell = 32, base = 935;
    const L = towerLayout([0, 1, 2, 3].map((i) => ({ x: 87 + i * 210, base, cols: 5, rows: 10, cell, sign: 50, color: ['#1d2652', '#222b5c', '#1b234d', '#20295a'][i] })));
    const N = L.doors.length;
    nightStreet(ctx, H, t, base);
    const nOpen = P.open || 9;
    const picks = [[0, 13], [0, 36], [1, 7], [1, 29], [1, 46], [2, 18], [2, 41], [3, 11], [3, 33]].slice(0, nOpen).map(([tw, i]) => tw * 50 + i);
    const openT = picks.map((_, j) => tOpen + 0.15 + j * Math.max(0.12, (tOpenEnd - tOpen - 0.15) / Math.max(1, nOpen - 1)));
    const openAt = new Map(picks.map((k, j) => [k, openT[j]]));
    const firstOpenTower = (ti) => { let m = Infinity; picks.forEach((k, j) => { if (Math.floor(k / 50) === ti) m = Math.min(m, openT[j]); }); return m; };
    drawTowers(ctx, H, K, L, t, acc, (d) => {
      const ot = openAt.get(d.i);
      const kn = H.hash(d.i, 61) * 3, ph = ((t + kn) % 3) / 0.6;
      return { dot: true, lit: true, knock: ph < 1 && !(ot != null && t > ot) ? (1 - ph) * 0.8 : 0, open: ot != null ? H.easeOutCubic(H.clamp((t - ot) / 0.4)) : 0 };
    }, {
      rise: (ti) => H.clamp((t - 0.05 - ti * 0.12) / 0.45),
      alarm: (ti) => t > firstOpenTower(ti),
      sign: (tw, ti) => {
        const lt = at(cues[ti], 0.3 + ti * 0.4), p = H.clamp((t - lt) / 0.3);
        H.roundRect(ctx, tw.x + 8, tw.top + 8, tw.w - 16, 40, 8); ctx.fillStyle = p > 0 ? H.mixHex('#0b1030', acc, 0.15 * p) : '#0b1030'; ctx.fill();
        if (p > 0) {
          ctx.save(); ctx.globalAlpha = p;
          const ft = H.fitText(ctx, labels[ti], 'ui', 25, 16, tw.w - 26); ctx.fillStyle = acc; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(ft.text, tw.x + tw.w / 2, tw.top + 29); ctx.restore();
          if (p < 1) K.glow(ctx, tw.x + tw.w / 2, tw.top + 28, 120, acc, 0.4 * (1 - p));
        }
      },
    });
    // sirens on roofs of towers that got an open door
    L.towers.forEach((tw, ti) => { const on = t > firstOpenTower(ti); if (on || t > tOpen - 0.5) siren(ctx, H, K, tw.x + tw.w / 2, tw.top - 4, t, on); });
    // counters
    panel(ctx, H, 80, 422, 400, 108, 'TARGETED', String(P.targeted || '200+'), { pop: K.popIn(t, 0.1, 0.35) });
    let n = 0; openT.forEach((o) => { if (t >= o) n++; });
    const ip = K.popIn(t, tOpen - 0.2, 0.4);
    panel(ctx, H, 510, 422, 400, 108, P.insideLabel || 'CONFIRMED INSIDE', String(n), { pop: ip, color: RED, size: 60 });
    // defender runs in once the first door opens
    const tRun = openT[0] + 0.3;
    if (t > tRun) {
      const u = H.clamp((t - tRun) / 1.4), x = H.lerp(1160, 820, H.easeOutCubic(u));
      K.drawPerson(ctx, x, 1040, 0.5, { t, pose: u < 1 ? 'stand' : 'point', walk: u < 1 ? t - tRun : undefined, mood: 'worried', shirt: 2, hair: 3, hairStyle: 'short', flip: true, look: -1 });
      K.drawShield(ctx, x - 36, 1032, 0.38, { check: 0 });
      const ap = K.popIn(t, tRun + 0.6, 0.35);
      if (ap > 0) K.drawLabel(ctx, 700, 1012, ap, { text: P.alert || 'ALERT', size: 28 });
    }
  },

  caveat(ctx, t, info, T) {
    const { H, K, P, D, at, acc } = T;
    const tBy = at(P.byCue, 0.2), tChip = at(P.chipCue, 3.6), tUnknown = at(P.unknownCue, 5.2), tFc = at(P.forecastCue, 6.4);
    ctx.save();
    roomBg(ctx, H, t, 1010);
    // clipboard with the assessment
    const cp = K.popIn(t, 0, 0.4);
    ctx.save(); ctx.translate(255, 990); ctx.scale(cp, cp); ctx.rotate(-0.04);
    H.roundRect(ctx, -150, -400, 300, 400, 18); ctx.fillStyle = '#8a6a48'; ctx.fill();
    H.roundRect(ctx, -128, -370, 256, 350, 8); ctx.fillStyle = '#eef0f6'; ctx.fill();
    H.roundRect(ctx, -50, -416, 100, 36, 8); ctx.fillStyle = '#b9bccb'; ctx.fill();
    ctx.font = H.font('display', 30); ctx.fillStyle = '#1b2040'; ctx.textAlign = 'center'; ctx.fillText(P.doc || 'ASSESSMENT', 0, -318);
    for (let i = 0; i < 6; i++) {
      const lp = H.clamp((t - 0.3 - i * 0.18) / 0.3);
      ctx.fillStyle = 'rgba(27,32,64,0.3)'; H.roundRect(ctx, -100, -280 + i * 40, 200 * lp * (i % 3 === 2 ? 0.6 : 1), 12, 6); ctx.fill();
    }
    ctx.restore();
    const bp = K.popIn(t, tBy, 0.4); if (bp > 0) K.drawLabel(ctx, 290, 540, bp, { text: P.by || "CROWDSTRIKE'S ASSESSMENT", size: 26, dot: true });
    // model chips
    const chip = (x, y, text, lit, p) => {
      if (p <= 0) return;
      ctx.save(); ctx.translate(x, y); ctx.scale(p, p);
      H.roundRect(ctx, -130, -70, 260, 140, 16); ctx.fillStyle = lit ? acc : '#2a3050'; ctx.fill();
      ctx.fillStyle = lit ? '#1a2a00' : '#7d86a8';
      for (let i = 0; i < 6; i++) { ctx.fillRect(-110 + i * 42, -84, 14, 14); ctx.fillRect(-110 + i * 42, 70, 14, 14); }
      ctx.font = H.font('display', lit ? 40 : 58); ctx.fillStyle = lit ? '#14200a' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 2); ctx.restore();
    };
    chip(705, 610, String(P.chip1 || 'AI model'), true, K.popIn(t, 0.4, 0.4));
    chip(705, 820, String(P.chip2 || '?'), false, K.popIn(t, tChip - 0.3, 0.4));
    if (t > tChip) {
      const u = (t - tChip), mx = 705 + Math.sin(u * 2.6) * 90, my = 800 + Math.cos(u * 3.1) * 30;
      ctx.save(); ctx.translate(mx, my); ctx.globalAlpha = H.clamp(u / 0.3);
      ctx.lineWidth = 12; ctx.strokeStyle = '#c9cfdf'; ctx.beginPath(); ctx.arc(0, 0, 48, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = 'rgba(180,220,255,0.18)'; ctx.fill();
      ctx.lineWidth = 16; ctx.strokeStyle = '#8a6a48'; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(34, 34); ctx.lineTo(74, 74); ctx.stroke();
      ctx.restore();
    }
    const up = K.popIn(t, tUnknown, 0.4); if (up > 0) K.drawLabel(ctx, 705, 960, up, { text: P.unknown || 'NOT IDENTIFIED', size: 26 });
    ctx.restore();
    // forecast: pill + a dim row of bots on the horizon
    const fp = K.popIn(t, tFc, 0.45);
    if (fp > 0) {
      ctx.fillStyle = H.rgba('#05070f', 0.6 * H.clamp((t - tFc) / 0.5)); ctx.fillRect(0, 0, 1080, 1920);
      for (let i = 0; i < 7; i++) {
        const a = H.clamp((t - tFc - 0.15 - i * 0.09) / 0.4);
        if (a > 0) miniBot(ctx, H, 150 + i * 112, 760 + Math.sin(t * 2 + i) * 6 + (1 - a) * 40, 1.5, t, i, acc, { alpha: a * (0.45 + 0.55 * (i % 2)) });
      }
      K.drawLabel(ctx, 487, 905, fp, { text: P.forecast || 'EXPECTS MORE FROM CHINA-LINKED GROUPS', size: 28, accent: true });
    }
  },
};
