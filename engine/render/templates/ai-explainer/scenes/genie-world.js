// Scene "genie-world" (full frame). A text prompt turns into a cartoon world you can walk through: a sunrise lakeside
// village that is built just ahead of a walking cartoon person (dark wireframe grid + a glowing "build front" with
// pixel sparks; trees and cottages grow out of the ground as the front passes them).
// Fits: AI world models / "type a prompt, get a playable world" stories, generative games, simulation for robots.
// Generic: no logos, no product UI; names appear only as text pills. Defaults are generic placeholders.
// Cue params are narration words ("word#n" = the (n+1)th time spoken in the scene); without them, fixed fractions.
// modes (one beat each):
//   hook   cold open: the walker strides right, the world builds ahead of her; prompt bar types `prompt`
//   build  void grid, the walker types on a laptop; pills who / name / kind; prompt bar types; the world sweeps into
//          existence; FRAME counter; she stands and walks with the front ahead
//          params: prompt, who, name, kind; cues whoCue, nameCue, kindCue, typeCue, buildCue, frameCue, walkCue
//   edit   prompt bar types edit1 (rain rolls in), then edit2 (a second person pops in), claim pill, speech bubble
//          params: edit1, edit2, line, claim; cues rainCue, personCue, claimCue, talkCue
//   sound  "first" pill; wind / waves / voices light up with sound rings and pills; the world shrinks into a film strip
//          and a robot guide with a magnifier ticks each frame
//          params: first, guide, windLabel, wavesLabel, voicesLabel; cues firstCue, windCue, wavesCue, voicesCue,
//          guideCue, checkCue
//   uses   "Who's it for?" then three tiles: film (camera + clapper TAKE n), game (pencil draws platforms, a block hero
//          hops), robot practice (wide; the robot practises while its world swaps day / snow / night, WORLD n)
//          params: ask, film, game, robot; cues filmCue, gameCue, robotCue
//   drift  timer pill counts up to `timerSecs` (shown as m:ss), the nearest cottage slides and recolours, a tree flickers out, glitch bands,
//          "drift" pill; then a rope barrier with a `testers` sign and a calendar pill `soon`
//          params: timerSecs (120), timerLabel, drift, testers, soon; cues timerCue, driftCue, testersCue, soonCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, mixHex, rgba, hash } = H;
  const TAU = Math.PI * 2;
  const cue = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const ph = (a, b) => H.phase(t, a, b);
  const eo = H.easeOutCubic;
  const mode = P.mode || 'hook';
  const HZ = 822, SHORE = 912, GROUND = 1014;
  const WALKER = { skin: 2, hair: 1, shirt: '#4a7fd6', hairStyle: 'bun', seed: 3 };
  const FRIEND = { skin: 4, hair: 0, shirt: '#e07a5f', hairStyle: 'short', seed: 9 };

  // ------------------------------------------------------------ small helpers
  const circ = (x, y, r, c) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = c; ctx.fill(); };
  const rr = (x, y, w, h, r, c) => { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); };
  const tri = (ax, ay, bx, by, cx, cy, c) => { ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.lineTo(cx, cy); ctx.closePath(); ctx.fillStyle = c; ctx.fill(); };
  function sparkle(x, y, r, c) {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 - Math.PI / 2, rad = i % 2 ? r * 0.32 : r; ctx.lineTo(x + Math.cos(a) * rad, y + Math.sin(a) * rad); }
    ctx.closePath(); ctx.fillStyle = c; ctx.fill();
  }
  function cloud(x, y, s, c) { for (const [dx, dy, r] of [[0, 0, 34], [40, -16, 44], [84, 0, 32], [42, 12, 34]]) circ(x + dx * s, y + dy * s, r * s, c); }
  const pill = (x, y, c, o) => { const p = K.popIn(t, c, 0.4); if (p > 0) K.drawLabel(ctx, x, y, Math.min(p, 1.05) * (o.scale || 1), o); };

  // ------------------------------------------------------------ the world (world x = screen x + scroll)
  const HOUSE_STEP = 520, TREE_STEP = 170;
  const houseX = (k) => k * HOUSE_STEP + 160 + (hash(k, 7) - 0.5) * 90;
  function items(scroll) {
    const out = [], x0 = scroll - 300, x1 = scroll + 1400;
    for (let k = Math.floor(x0 / HOUSE_STEP) - 1; k <= Math.ceil(x1 / HOUSE_STEP); k++) {
      out.push({ kind: 'house', wx: houseX(k), y: SHORE + 30, s: 0.95 + hash(k, 8) * 0.2, k, lit: hash(k, 13) > 0.4 });
    }
    for (let k = Math.floor(x0 / TREE_STEP) - 1; k <= Math.ceil(x1 / TREE_STEP); k++) {
      const wx = k * TREE_STEP + hash(k, 9) * 70;
      const kh = Math.round((wx - 160) / HOUSE_STEP);
      if (Math.abs(wx - houseX(kh)) < 110) continue;
      out.push({ kind: hash(k, 10) > 0.45 ? 'round' : 'pine', wx, y: SHORE + 46 + hash(k, 11) * 30, s: 0.8 + hash(k, 12) * 0.4, k });
    }
    for (let k = Math.floor(x0 / 640) - 1; k <= Math.ceil(x1 / 640); k++) out.push({ kind: 'lamp', wx: k * 640 + 470, y: 1062, s: 1, k });
    out.sort((a, b) => a.y - b.y);
    return out;
  }
  function house(x, y, s, o = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (o.skew) ctx.transform(1, 0, o.skew, 1, 0, 0);
    K.shadow(ctx, 0, 0, 170);
    const body = o.body || '#f3e2c4', roof = o.roof || '#c9583f';
    rr(-70, -100, 140, 100, 6, body); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(22, -100, 48, 100);
    ctx.fillStyle = '#5c4a44'; ctx.fillRect(34, -168, 18, 50);
    for (let i = 0; i < 3; i++) { const p = (t * 0.45 + i / 3 + (o.seed || 0) * 0.17) % 1; circ(43 + p * 26, -176 - p * 80, 8 + p * 12, rgba('#ffffff', 0.4 * (1 - p))); }
    tri(-90, -94, 0, -168, 90, -94, roof); tri(0, -168, 90, -94, 30, -94, mixHex(roof, '#000000', 0.18));
    rr(-18, -58, 36, 58, 5, '#7a4a33');
    const win = o.lit ? '#ffd77a' : '#a9c2e6';
    rr(-58, -82, 30, 26, 4, win); rr(28, -82, 30, 26, 4, win);
    if (o.lit) K.glow(ctx, -43, -69, 40, '#ffd77a', 0.35);
    ctx.restore();
  }
  function tree(x, y, s, kind, sway, seed) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 110);
    ctx.rotate(Math.sin(t * 1.6 + seed) * 0.025 + sway * Math.sin(t * 5 + seed) * 0.06 + sway * 0.05);
    rr(-9, -64, 18, 66, 5, '#7a5236');
    if (kind === 'pine') {
      for (let i = 0; i < 3; i++) { const yy = -60 - i * 46, w = 74 - i * 16; tri(-w, yy, 0, yy - 78, w, yy, i % 2 ? '#2f7a55' : '#36885d'); tri(0, yy - 78, w, yy, w * 0.35, yy, '#24603f'); }
    } else {
      circ(-30, -96, 40, '#3f8f5a'); circ(30, -96, 40, '#33774b'); circ(0, -128, 50, '#4aa063'); circ(-14, -140, 18, rgba('#a8e08a', 0.55));
    }
    ctx.restore();
  }
  function lamp(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 60);
    rr(-6, -200, 12, 200, 4, '#2c3048'); rr(-16, -14, 32, 14, 4, '#2c3048');
    rr(-20, -232, 40, 36, 8, '#3a3f5c'); circ(0, -214, 12, '#ffe39a'); K.glow(ctx, 0, -214, 60, '#ffd27a', 0.35);
    ctx.restore();
  }
  function wire(it, sx) {
    ctx.save(); ctx.strokeStyle = rgba(ACC, 0.5); ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.translate(sx, it.y); ctx.scale(it.s, it.s);
    ctx.beginPath();
    if (it.kind === 'house') { ctx.rect(-70, -100, 140, 100); ctx.moveTo(-90, -94); ctx.lineTo(0, -168); ctx.lineTo(90, -94); }
    else if (it.kind === 'pine') { ctx.moveTo(-74, -60); ctx.lineTo(0, -230); ctx.lineTo(74, -60); ctx.closePath(); }
    else if (it.kind === 'round') { ctx.arc(0, -110, 62, 0, TAU); ctx.moveTo(0, -48); ctx.lineTo(0, 0); }
    else { ctx.moveTo(0, 0); ctx.lineTo(0, -230); }
    ctx.stroke(); ctx.restore();
  }
  // o: scroll, front (screen x; >= 1080 = all built), rain 0..1, sway 0..1, drift 0..1, splash 0..1
  function land(o) {
    const scroll = o.scroll, front = o.front == null ? 9999 : o.front, rain = o.rain || 0;
    // sky
    const g = ctx.createLinearGradient(0, 0, 0, HZ);
    g.addColorStop(0, mixHex('#2c3b84', '#283044', rain)); g.addColorStop(0.55, mixHex('#c47d9c', '#4d5370', rain)); g.addColorStop(1, mixHex('#ffcf98', '#7f8499', rain));
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, HZ + 2);
    const sunX = 760 - scroll * 0.03, sunY = 700;
    K.glow(ctx, sunX, sunY, 260, '#ffd27a', 0.6 * (1 - rain));
    circ(sunX, sunY, 58, rgba('#fff1c9', 1 - 0.85 * rain));
    for (let i = 0; i < 5; i++) {
      const cx = (((hash(i, 3) * 1500 - scroll * 0.08 + t * 14) % 1500) + 1500) % 1500 - 220, cy = 455 + hash(i, 4) * 190;
      cloud(cx, cy, 0.8 + hash(i, 5) * 0.6 + rain * 0.5, rgba(mixHex('#ffe0cc', '#5b6179', rain), 0.55 + 0.4 * rain));
    }
    // mountains (parallax)
    const ridge = (y0, amp, f, par, col, sd) => {
      ctx.beginPath(); ctx.moveTo(0, HZ + 2);
      for (let x = 0; x <= 1080; x += 20) { const w = x + scroll * par; ctx.lineTo(x, y0 - amp * (0.5 + 0.5 * Math.sin(w * f + sd)) - amp * 0.45 * (0.5 + 0.5 * Math.sin(w * f * 2.3 + sd * 2))); }
      ctx.lineTo(1080, HZ + 2); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    };
    ridge(HZ - 30, 120, 0.006, 0.15, mixHex('#8a77b4', '#5c6178', rain), 1.3);
    ridge(HZ, 80, 0.011, 0.3, mixHex('#5d5f9e', '#474c63', rain), 4.1);
    // lake
    const lg = ctx.createLinearGradient(0, HZ, 0, SHORE);
    lg.addColorStop(0, mixHex('#e7a98f', '#6d7389', rain)); lg.addColorStop(1, mixHex('#4f6fb0', '#3b4660', rain));
    ctx.fillStyle = lg; ctx.fillRect(0, HZ, 1080, SHORE - HZ + 2);
    ctx.strokeStyle = rgba('#ffffff', 0.35); ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const y = HZ + 12 + hash(i, 31) * (SHORE - HZ - 24), x = ((hash(i, 32) * 1200 - scroll * 0.6 + t * 18) % 1200 + 1200) % 1200 - 60;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 30 + 30 * hash(i, 33), y); ctx.stroke();
    }
    ctx.strokeStyle = rgba('#fff1c9', 0.55 * (1 - rain)); ctx.lineWidth = 5;
    for (let i = 0; i < 5; i++) { const y = HZ + 12 + i * 16, w = 70 - i * 10 + 10 * Math.sin(t * 3 + i); ctx.beginPath(); ctx.moveTo(sunX - w / 2, y); ctx.lineTo(sunX + w / 2, y); ctx.stroke(); }
    // meadow + path
    const mg = ctx.createLinearGradient(0, SHORE, 0, 1920);
    mg.addColorStop(0, mixHex('#6bb36f', '#4c7a5a', rain)); mg.addColorStop(0.25, mixHex('#4f9a5e', '#3d6650', rain)); mg.addColorStop(1, '#1f4a38');
    ctx.fillStyle = mg; ctx.fillRect(0, SHORE, 1080, 1920 - SHORE);
    ctx.fillStyle = mixHex('#ead0a0', '#a5998a', rain); ctx.fillRect(0, 994, 1080, 52);
    ctx.fillStyle = rgba('#b58e5e', 0.6); ctx.fillRect(0, 990, 1080, 6); ctx.fillRect(0, 1044, 1080, 6);
    for (let i = 0; i < 14; i++) { const x = ((i * 97 - scroll) % 1360 + 1360) % 1360 - 140; rr(x, 1010 + (i % 3) * 9, 26, 8, 4, rgba('#c9a676', 0.8)); }
    // objects, growing in as the front passes them
    for (const it of items(scroll)) {
      let sx = it.wx - scroll;
      if (sx < -200 || sx > 1280) continue;
      const g0 = front >= 1080 ? 1 : clamp((front - sx) / 170);
      if (g0 <= 0) continue;
      const gs = H.easeOutBack(g0);
      if (it.kind === 'house') {
        const o2 = { lit: it.lit, seed: it.k };
        if (o.drift > 0 && Math.abs(sx - 620) < 170) {
          const d = o.drift; sx += 120 * d; o2.body = mixHex('#f3e2c4', '#b58be0', d); o2.roof = mixHex('#c9583f', '#3fa7a0', d); o2.skew = -0.12 * d;
        }
        house(sx, it.y, it.s * gs, o2);
      } else if (it.kind === 'lamp') lamp(sx, it.y, gs);
      else {
        if (o.drift > 0 && sx > 740 && sx < 940) {
          const d = o.drift; const on = d < 0.25 || (d < 0.85 && Math.floor(t * 14) % 2 === 0);
          if (!on) continue;
        }
        tree(sx, it.y, it.s * gs, it.kind, o.sway || 0, it.k);
      }
    }
    if (o.splash > 0) splash(o.splash);
    // the unbuilt world beyond the front
    if (front < 1080) {
      ctx.save(); ctx.beginPath(); ctx.rect(front, 0, 1100, 1920); ctx.clip();
      const vg = ctx.createLinearGradient(0, 0, 0, 1920); vg.addColorStop(0, '#070a1e'); vg.addColorStop(0.42, '#0d1438'); vg.addColorStop(1, '#060918');
      ctx.fillStyle = vg; ctx.fillRect(front - 2, 0, 1100, 1920);
      ctx.strokeStyle = rgba(ACC, 0.32); ctx.lineWidth = 2; ctx.setLineDash([]);
      const sp = 120, off = ((scroll % sp) + sp) % sp;
      for (let i = -14; i <= 24; i++) { const xb = i * sp - off; ctx.beginPath(); ctx.moveTo(540 + (xb - 540) * 0.12, HZ); ctx.lineTo(540 + (xb - 540) * 3, 1920); ctx.stroke(); }
      for (let j = 0; j < 12; j++) { const y = HZ + (1920 - HZ) * Math.pow((j + 0.3) / 12, 2); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }
      ctx.strokeStyle = rgba(ACC, 0.13);
      for (let i = 0; i < 16; i++) { const x = ((i * 90 - scroll * 0.3) % 1440 + 1440) % 1440 - 180; ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x, HZ); ctx.stroke(); }
      for (let y = 380; y < HZ; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }
      for (const it of items(scroll)) { const sx = it.wx - scroll; if (sx > front && sx < 1200) wire(it, sx); }
      ctx.restore();
      // build front: glow, bright edge, pixel sparks
      const gg = ctx.createLinearGradient(front - 90, 0, front + 30, 0);
      gg.addColorStop(0, rgba(ACC, 0)); gg.addColorStop(0.75, rgba(ACC, 0.38)); gg.addColorStop(1, rgba(ACC, 0));
      ctx.fillStyle = gg; ctx.fillRect(front - 90, 0, 120, 1920);
      ctx.fillStyle = rgba('#ffffff', 0.85); ctx.fillRect(front - 2, 0, 4, 1920);
      const fr = Math.floor(t * 10);
      for (let i = 0; i < 44; i++) {
        const x = front + (hash(i, fr) - 0.65) * 110, y = 420 + hash(i, fr + 101) * 700, sz = 8 + hash(i, fr + 202) * 18;
        ctx.fillStyle = rgba(hash(i, 7) > 0.5 ? ACC : '#ffffff', 0.35 + 0.5 * hash(i, fr + 303));
        ctx.fillRect(x, y, sz, sz);
      }
    }
  }
  function splash(a) {
    const rx = 860, ry = SHORE - 4;
    rr(rx - 50, ry - 26, 100, 34, 16, '#6c6f86'); rr(rx - 30, ry - 40, 56, 30, 14, '#80839a');
    for (let i = 0; i < 10; i++) {
      const p = (t * 1.1 + i / 10) % 1, ang = -Math.PI / 2 + (hash(i, 51) - 0.5) * 2.2;
      const x = rx + Math.cos(ang) * 90 * p, y = ry - 30 + Math.sin(ang) * 110 * p + 140 * p * p;
      circ(x, y, 7 * (1 - p) + 2, rgba('#ffffff', a * (1 - p)));
    }
    ctx.strokeStyle = rgba('#ffffff', a * 0.7); ctx.lineWidth = 6; ctx.lineCap = 'round';
    const w = (t * 0.9) % 1; ctx.beginPath(); ctx.ellipse(rx, ry, 60 + 80 * w, 10 + 8 * w, 0, Math.PI, TAU); ctx.globalAlpha = 1 - w; ctx.stroke(); ctx.globalAlpha = 1;
  }
  function rainFx(a) {
    if (a <= 0) return;
    for (let i = 0; i < 6; i++) { const x = -120 + i * 230 + Math.sin(t * 0.5 + i) * 20; cloud(x, 350 + 120 * a + hash(i, 61) * 50, 1.7, rgba('#4a5068', 0.9 * a)); }
    ctx.strokeStyle = rgba('#d8e6ff', 0.6 * a); ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 110; i++) {
      const y = 420 + ((hash(i, 2) * 680 + t * 1100) % 680), x = ((hash(i, 1) * 1180 - (y - 420) * 0.18) % 1180 + 1180) % 1180 - 50;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 7, y + 36); ctx.stroke();
    }
    for (let i = 0; i < 14; i++) { const p = (t * 2 + hash(i, 71)) % 1, x = hash(i, 72) * 1080, y = 1000 + hash(i, 73) * 40; ctx.strokeStyle = rgba('#ffffff', 0.5 * a * (1 - p)); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, y, 4 + 16 * p, 2 + 4 * p, 0, 0, TAU); ctx.stroke(); }
  }
  function soundRings(x, y, a, sd = 0) {
    if (a <= 0) return;
    ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const p = (t * 0.9 + i / 3 + sd) % 1, r = 30 + p * 90;
      ctx.strokeStyle = rgba(ACC, a * (1 - p) * 0.9);
      ctx.beginPath(); ctx.arc(x, y, r, -0.6, 0.6); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, r, Math.PI - 0.6, Math.PI + 0.6); ctx.stroke();
    }
  }
  function waveBubble(x, y, pop, sd) {
    if (pop <= 0) return;
    ctx.save(); ctx.translate(x, y); const s = Math.min(1.05, pop); ctx.scale(s, s);
    tri(-12, -6, 0, 14, 12, -6, '#f4f6fb'); rr(-62, -66, 124, 62, 28, '#f4f6fb');
    for (let i = 0; i < 5; i++) { const h = 12 + 22 * (0.5 + 0.5 * Math.sin(t * 9 + i * 1.3 + sd)); rr(-40 + i * 18 - 4, -35 - h / 2, 9, h, 4, '#2c3b84'); }
    ctx.restore();
  }
  // prompt bar: a text box that types; y = top
  function promptBar(y, text, chars, pop, alpha = 1) {
    if (pop <= 0 || alpha <= 0) return;
    const W = 790, Hh = 88, x0 = 487 - W / 2;
    ctx.save(); ctx.globalAlpha = clamp(pop * 2) * alpha;
    ctx.translate(487, y + Hh / 2); const s = 0.8 + 0.2 * Math.min(1.03, pop); ctx.scale(s, s); ctx.translate(-487, -(y + Hh / 2));
    roundRect(ctx, x0, y, W, Hh, Hh / 2); ctx.fillStyle = 'rgba(10,13,30,0.92)'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.8); ctx.stroke();
    sparkle(x0 + 50, y + Hh / 2, 20, ACC);
    const txt = String(text).slice(0, Math.max(0, chars));
    ctx.font = H.font('ui', 34); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
    ctx.fillText(txt, x0 + 88, y + Hh / 2 + 1);
    if (Math.floor(t * 2.4) % 2 === 0) { ctx.fillStyle = ACC; ctx.fillRect(x0 + 92 + ctx.measureText(txt).width, y + 24, 4, Hh - 48); }
    circ(x0 + W - 46, y + Hh / 2, 28, ACC);
    ctx.strokeStyle = '#0b0f22'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x0 + W - 58, y + Hh / 2); ctx.lineTo(x0 + W - 34, y + Hh / 2); ctx.moveTo(x0 + W - 44, y + Hh / 2 - 10); ctx.lineTo(x0 + W - 34, y + Hh / 2); ctx.lineTo(x0 + W - 44, y + Hh / 2 + 10); ctx.stroke();
    ctx.restore();
  }
  const typed = (text, start, cps = 26) => (t < start ? 0 : Math.floor((t - start) * cps));
  const person = (x, o) => K.drawPerson(ctx, x, GROUND, 1.45, Object.assign({ t }, o));

  ctx.save();
  // ============================================================ modes
  if (mode === 'hook') {
    const scroll = 900 + t * 150;
    land({ scroll, front: 650 + t * 25 });
    person(360, Object.assign({}, WALKER, { walk: t + 0.2, mood: 'happy' }));
    promptBar(450, P.prompt || 'A lakeside village at sunrise', typed(P.prompt || '', -0.6, 30), 1);
  }

  else if (mode === 'build') {
    const cWho = cue(P.whoCue, D * 0.15), cName = cue(P.nameCue, D * 0.27), cKind = cue(P.kindCue, D * 0.38);
    const cType = cue(P.typeCue, D * 0.48), cBuild = cue(P.buildCue, D * 0.62), cFrame = cue(P.frameCue, D * 0.7), cWalk = cue(P.walkCue, D * 0.86);
    const walking = Math.max(0, t - cWalk);
    const scroll = 1320 + walking * 150;
    const sweep = lerp(-60, 700, ph(cBuild - 0.15, cBuild + 1.9));
    land({ scroll, front: sweep });
    const stand = t > cWalk - 0.25;
    if (!stand) {
      const da = 1;
      K.shadow(ctx, 330, GROUND, 150);
      rr(262, 900, 136, 16, 8, '#6a78b8'); rr(322, 914, 16, 100, 4, '#4a5690'); rr(282, 1004, 96, 10, 5, '#4a5690');
      K.drawDesk(ctx, 500, GROUND, 0.8);
      K.drawLaptop(ctx, 486, GROUND - 88, 0.72, { t, screen: 'chat', typing: t > cType - 0.2 && t < cBuild ? 1 : 0, flip: true });
    }
    if (!stand) person(330, Object.assign({}, WALKER, { look: 0.6, pose: 'sit-laptop', typing: t > cType - 0.2 && t < cBuild ? 2 : 0.6, mood: t > cBuild ? 'happy' : 'neutral' }));
    else person(330, Object.assign({}, WALKER, { walk: t > cWalk ? walking : undefined, mood: 'happy' }));
    if (stand && t < cWalk + 0.5) { const p = ph(cWalk - 0.25, cWalk + 0.5); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; sparkle(330 + Math.cos(a) * (60 + 90 * p), 880 + Math.sin(a) * (40 + 70 * p), 14 * (1 - p), rgba(ACC, 1 - p)); } }
    // laptop glow in the void
    if (!stand && t < cBuild + 1) K.glow(ctx, 360, 920, 160, ACC, 0.25 * (1 - ph(cBuild, cBuild + 1)) * (0.8 + 0.2 * Math.sin(t * 6)));
    // pills (leave as she starts walking)
    const out = ph(cWalk - 0.3, cWalk + 0.2);
    ctx.save(); ctx.globalAlpha = 1 - out;
    pill(300, 520, cWho - 0.15, { text: P.who || 'AI LAB', size: 30, dot: true });
    pill(680, 520, cName - 0.15, { text: P.name || 'Model name', size: 34, accent: true });
    pill(760, 745, cKind - 0.15, { text: P.kind || 'World model', size: 30 });
    ctx.restore();
    // prompt bar: types in the middle, then rises to the top as she walks
    const barY = lerp(552, 450, ph(cWalk - 0.3, cWalk + 0.4));
    promptBar(barY, P.prompt || 'A lakeside village at sunrise', typed(P.prompt || '', cType - 0.1, 26), K.popIn(t, cType - 0.35, 0.4));
    // frame counter
    if (t > cFrame - 0.1) {
      const n = 1 + Math.floor(Math.max(0, t - cFrame) * 24);
      pill(780, 850, cFrame - 0.1, { text: 'FRAME ' + String(n).padStart(4, '0'), size: 26, accent: false, dot: true });
    }
  }

  else if (mode === 'edit') {
    const cRain = cue(P.rainCue, D * 0.27), cPerson = cue(P.personCue, D * 0.4), cClaim = cue(P.claimCue, D * 0.62), cTalk = cue(P.talkCue, D * 0.88);
    const scroll = 1500 + Math.min(t, 0.9) * 150;
    const rain = ph(cRain - 0.2, cRain + 1.0);
    land({ scroll, rain });
    // second person: pops in, then walks over
    const fx = lerp(800, 650, ph(cClaim + 0.2, cClaim + 1.6));
    const fPop = K.popIn(t, cPerson + 0.05, 0.45);
    const fWalk = t > cClaim + 0.2 && t < cClaim + 1.6 ? t - cClaim : undefined;
    const talking = t > cTalk - 0.1 ? info.env : 0;
    person(330, Object.assign({}, WALKER, { walk: t < 0.9 ? t + 0.6 : undefined, mood: t > cRain && t < cRain + 1.2 ? 'shocked' : 'happy', look: t > cPerson ? 0.8 : 0 }));
    if (fPop > 0) {
      ctx.save(); ctx.translate(fx, GROUND); ctx.scale(Math.min(fPop, 1.05), Math.min(fPop, 1.05)); ctx.translate(-fx, -GROUND);
      person(fx, Object.assign({}, FRIEND, { flip: true, walk: fWalk, mood: 'happy', talk: talking, pose: t > cTalk + 0.6 ? 'point' : 'stand' }));
      ctx.restore();
      const b = ph(cPerson + 0.05, cPerson + 0.8);
      if (b < 1) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; sparkle(800 + Math.cos(a) * (40 + 140 * b), 840 + Math.sin(a) * (60 + 120 * b), 18 * (1 - b), rgba(ACC, 1 - b)); }
    }
    rainFx(rain);
    // prompt bar: edit 1, then edit 2; fades when the claim lands
    const e1 = P.edit1 || 'make it rain', e2 = P.edit2 || 'add a person';
    const t2 = cPerson - 0.75;
    const txt = t < t2 ? e1 : e2, start = t < t2 ? cRain - 0.95 : t2;
    promptBar(450, txt, typed(txt, start, 24), 1, 1 - ph(cClaim - 0.4, cClaim));
    pill(487, 528, cClaim - 0.15, { text: P.claim || 'People move naturally', size: 30, dot: true });
    if (t > cTalk - 0.15) K.drawSpeechBubble(ctx, 640, 640, 1, { text: P.line || 'Hi there!', size: 32, tail: 'right', pop: Math.min(1.04, K.popIn(t, cTalk - 0.15, 0.4)) });
  }

  else if (mode === 'sound') {
    const cFirst = cue(P.firstCue, D * 0.16), cWind = cue(P.windCue, D * 0.23), cWaves = cue(P.wavesCue, D * 0.37), cVoices = cue(P.voicesCue, D * 0.46);
    const cGuide = cue(P.guideCue, D * 0.58), cCheck = cue(P.checkCue, D * 0.73);
    const scroll = 1635;
    const k = ph(cGuide - 0.1, cGuide + 1.0);
    const wind = ph(cWind - 0.2, cWind + 0.5), waves = ph(cWaves - 0.2, cWaves + 0.4), voices = ph(cVoices - 0.2, cVoices + 0.3);
    const scene = (sc, full) => {
      land({ scroll: sc, rain: full ? 1 - ph(0, 1.2) : 0, sway: wind, splash: waves });
      person(330 + (scroll - sc), Object.assign({}, WALKER, { mood: 'happy', talk: voices > 0 ? Math.max(0, Math.sin(t * 3)) * 0.8 : 0, look: 0.8 }));
      person(650 + (scroll - sc), Object.assign({}, FRIEND, { flip: true, mood: 'happy', talk: voices > 0 ? Math.max(0, -Math.sin(t * 3)) * 0.8 : 0 }));
    };
    if (k <= 0) {
      scene(scroll, true);
      if (wind > 0) {
        ctx.strokeStyle = rgba('#ffffff', 0.55 * wind); ctx.lineWidth = 4; ctx.lineCap = 'round';
        for (let i = 0; i < 7; i++) { const p = (t * 0.7 + i / 7) % 1, x = 1150 - p * 1300, y = 700 + hash(i, 81) * 220; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 60, y - 18, x + 140, y + 4); ctx.stroke(); }
        soundRings(170, 820, wind, 0);
      }
      soundRings(860, 840, waves, 0.4);
      if (voices > 0) { waveBubble(330, 630, K.popIn(t, cVoices - 0.15), 0); waveBubble(650, 630, K.popIn(t, cVoices + 0.15), 2); }
      pill(487, 545, cFirst - 0.45, { text: P.first || 'First with sound', size: 32, accent: true, dot: false });
      pill(170, 740, cWind - 0.15, { text: P.windLabel || 'wind', size: 26 });
      pill(860, 760, cWaves - 0.15, { text: P.wavesLabel || 'waves', size: 26 });
      pill(487, 720, cVoices - 0.15, { text: P.voicesLabel || 'voices', size: 26 });
    } else {
      // studio behind the shrinking world
      const bg = ctx.createLinearGradient(0, 0, 0, 1920); bg.addColorStop(0, '#0a0e26'); bg.addColorStop(1, '#141b44');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, 1080, 1920);
      ctx.strokeStyle = rgba(ACC, 0.08); ctx.lineWidth = 2;
      for (let x = 0; x <= 1080; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1920); ctx.stroke(); }
      for (let y = 0; y <= 1920; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }
      const FW = 400, FH = 200, SC = FW / 1080, CY = 900, GAP = 430;
      const settle = cGuide + 1.0, off = Math.max(0, t - settle) * 140;
      // strip band
      const band = ph(cGuide + 0.5, cGuide + 1.1);
      if (band > 0) {
        ctx.globalAlpha = band;
        rr(-20, CY - FH / 2 - 34, 1120, FH + 68, 10, '#0b0d18');
        for (let i = -2; i < 40; i++) { const x = ((i * 44 - off) % 1144 + 1144) % 1144 - 40; rr(x, CY - FH / 2 - 24, 22, 14, 4, '#2a2f48'); rr(x, CY + FH / 2 + 10, 22, 14, 4, '#2a2f48'); }
        ctx.globalAlpha = 1;
      }
      for (let i = -2; i <= 4; i++) {
        const cx = 487 + i * GAP - off;
        if (i !== 0 && (cx < -200 || cx > 1280)) continue;
        const a = i === 0 ? 1 : ph(cGuide + 0.7, cGuide + 1.2);
        if (a <= 0) continue;
        const s = i === 0 ? lerp(1, SC, H.easeInOutCubic(k)) : SC;
        const fcx = i === 0 ? lerp(540, cx, H.easeInOutCubic(k)) : cx, fcy = i === 0 ? lerp(830, CY, H.easeInOutCubic(k)) : CY;
        const hw = 540, hh = i === 0 ? lerp(1150, 270, H.easeInOutCubic(k)) : 270;
        ctx.save(); ctx.globalAlpha = a;
        ctx.translate(fcx, fcy); ctx.scale(s, s);
        ctx.beginPath(); ctx.rect(-hw, -hh, hw * 2, hh * 2); ctx.clip();
        ctx.translate(-540, -830);
        scene(scroll + i * 140, false);
        ctx.restore();
        if (k >= 1 || i !== 0) {
          ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 4; ctx.strokeStyle = rgba('#ffffff', 0.7); roundRect(ctx, cx - FW / 2, CY - FH / 2, FW, FH, 6); ctx.stroke(); ctx.restore();
        }
        // tick once a frame has passed under the lens after the check cue
        const crossT = settle + (i * GAP) / 140;
        const tp = K.popIn(t, Math.max(crossT, cCheck - 0.1), 0.35);
        if (tp > 0 && t > cCheck - 0.1 && cx <= 490) {
          const bx = cx + FW / 2 - 26, by = CY - FH / 2 + 26;
          ctx.save(); ctx.translate(bx, by); ctx.scale(Math.min(tp, 1.1), Math.min(tp, 1.1));
          circ(0, 0, 24, ACC); ctx.strokeStyle = '#0b0f22'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-3, 8); ctx.lineTo(11, -9); ctx.stroke(); ctx.restore();
        }
      }
      // robot guide with a magnifier over the centre frame
      const rp = K.popIn(t, cGuide + 0.55, 0.5);
      if (rp > 0) {
        ctx.save(); ctx.translate(487, 770); const rs = Math.min(rp, 1.05); ctx.scale(rs, rs); ctx.translate(-487, -770);
        K.drawRobot(ctx, 487, 770, 0.92, { t, state: t > cCheck ? 'working' : 'thinking', seed: 4 });
        ctx.restore();
        const la = clamp(rp);
        ctx.strokeStyle = rgba('#cfd6ea', la); ctx.lineWidth = 12; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(560, 700); ctx.lineTo(545, 805); ctx.stroke();
        ctx.lineWidth = 9; ctx.strokeStyle = rgba('#ffffff', la); ctx.beginPath(); ctx.arc(487, CY, 104, 0, TAU); ctx.stroke();
        ctx.fillStyle = rgba(ACC, 0.12 * la + 0.06 * Math.sin(t * 4) * la); ctx.beginPath(); ctx.arc(487, CY, 100, 0, TAU); ctx.fill();
      }
      pill(487, 545, cGuide + 0.5, { text: P.guide || 'A guide model checks each frame', size: 30, accent: true });
    }
  }

  else if (mode === 'uses') {
    const cFilm = cue(P.filmCue, D * 0.25), cGame = cue(P.gameCue, D * 0.43), cRobot = cue(P.robotCue, D * 0.77);
    land({ scroll: 1635 });
    ctx.fillStyle = 'rgba(6,9,24,0.62)'; ctx.fillRect(0, 0, 1080, 1920);
    const ask = 1 - ph(cFilm - 0.5, cFilm - 0.1);
    if (ask > 0) { ctx.save(); ctx.globalAlpha = ask; pill(487, 760 + Math.sin(t * 2.4) * 8, 0.05, { text: P.ask || "Who's it for?", size: 46, accent: true }); ctx.restore(); }
    const tile = (x, y, w, h, c, title, body) => {
      const p = K.popIn(t, c - 0.3, 0.45); if (p <= 0) return;
      ctx.save(); ctx.translate(x + w / 2, y + h / 2); const s = 0.75 + 0.25 * Math.min(1.03, p); ctx.scale(s, s); ctx.globalAlpha = clamp(p * 2); ctx.translate(-(x + w / 2), -(y + h / 2));
      roundRect(ctx, x, y, w, h, 22); ctx.fillStyle = '#121a3a'; ctx.fill();
      ctx.save(); roundRect(ctx, x, y, w, h, 22); ctx.clip(); body(x, y, w, h, t - c); ctx.restore();
      ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.8); roundRect(ctx, x, y, w, h, 22); ctx.stroke();
      ctx.font = H.font('ui', 26); const tw = ctx.measureText(title).width;
      rr(x + 14, y + 14, tw + 32, 44, 22, 'rgba(8,10,24,0.85)');
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(title, x + 30, y + 37);
      ctx.restore();
    };
    // film
    tile(80, 470, 400, 300, cFilm, P.film || 'Filmmakers', (x, y, w, h, lt) => {
      const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#c47d9c'); g.addColorStop(0.6, '#ffcf98'); g.addColorStop(0.61, '#5aa86a'); g.addColorStop(1, '#2f6b4a');
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
      tree(x + 330, y + 210, 0.55, 'round', 0, 2);
      K.drawPerson(ctx, x + 205, y + 268, 0.62, { t, pose: 'cheer', mood: 'happy', seed: 2, shirt: '#e07a5f' });
      // camera on a tripod
      const cx = x + 90, cy = y + 170;
      ctx.strokeStyle = '#2a2d40'; ctx.lineWidth = 7; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx, cy + 20); ctx.lineTo(cx - 34, cy + 110); ctx.moveTo(cx, cy + 20); ctx.lineTo(cx + 34, cy + 110); ctx.moveTo(cx, cy + 20); ctx.lineTo(cx, cy + 110); ctx.stroke();
      rr(cx - 46, cy - 20, 92, 50, 10, '#2a2d40'); circ(cx - 22, cy - 34, 20, '#2a2d40'); circ(cx + 18, cy - 34, 20, '#2a2d40');
      circ(cx - 22, cy - 34, 7, '#55597a'); circ(cx + 18, cy - 34, 7, '#55597a');
      rr(cx + 44, cy - 10, 24, 30, 5, '#3c4060'); circ(cx - 30, cy - 6, 6, (Math.floor(t * 2) % 2) ? '#ff5a5a' : '#7a2a2a');
      // clapper: snaps every 1.4 s, TAKE n
      const n = Math.min(3, 1 + Math.floor(Math.max(0, lt) / 1.4)), snap = (Math.max(0, lt) % 1.4) / 1.4;
      const open = n >= 3 && lt > 2.8 + 0.4 ? 0 : (snap < 0.6 ? 0.5 * (1 - snap / 0.6) + 0 : 0);
      const kx = x + 318, ky = y + 92;
      rr(kx - 60, ky, 120, 70, 6, '#20222e');
      ctx.font = H.font('display', 24); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('TAKE ' + n, kx, ky + 38);
      ctx.save(); ctx.translate(kx - 60, ky); ctx.rotate(-open * 0.6);
      rr(0, -20, 120, 20, 4, '#f4f6fb'); ctx.fillStyle = '#20222e'; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(8 + i * 30, -20); ctx.lineTo(24 + i * 30, -20); ctx.lineTo(14 + i * 30, 0); ctx.lineTo(-2 + i * 30, 0); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    });
    // game
    tile(495, 470, 400, 300, cGame, P.game || 'Game makers', (x, y, w, h, lt) => {
      ctx.fillStyle = '#16245a'; ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 2;
      for (let gx = x; gx < x + w; gx += 30) { ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke(); }
      for (let gy = y; gy < y + h; gy += 30) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke(); }
      const plats = [[x + 30, y + 250, 110], [x + 160, y + 200, 90], [x + 270, y + 150, 100], [x + 160, y + 105, 70]];
      const lt2 = Math.max(0, lt);
      let tip = null;
      plats.forEach(([px, py, pw], i) => {
        const d = clamp((lt2 - i * 0.55) / 0.45); if (d <= 0) return;
        rr(px, py, pw * d, 18, 6, ACC); ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(px, py + 12, pw * d, 6);
        if (d < 1) tip = [px + pw * d, py];
      });
      if (tip) { // pencil
        ctx.save(); ctx.translate(tip[0], tip[1] - 4); ctx.rotate(-0.7);
        rr(0, -9, 70, 18, 3, '#f2c14e'); tri(0, -9, -18, 0, 0, 9, '#f3d9b1'); tri(-12, -3, -18, 0, -12, 3, '#333'); rr(62, -9, 14, 18, 3, '#e07a8a');
        ctx.restore();
      }
      // hero hops from platform to platform once they exist
      const hop = Math.max(0, lt2 - 0.5) / 0.7, j = Math.min(3, Math.floor(hop)), u = Math.min(1, hop - j);
      const at = (i) => [plats[i][0] + plats[i][2] / 2, plats[i][1]];
      const [ax, ay] = at(Math.min(j, 3)), [bx, by] = at(Math.min(j + 1, 3));
      const done = j >= 3;
      const hx = done ? ax : lerp(ax, bx, u), hy = done ? ay : lerp(ay, by, u) - Math.sin(u * Math.PI) * 60;
      if (lt2 > 0.45) { rr(hx - 18, hy - 38, 36, 38, 8, '#ff8a5c'); circ(hx - 6, hy - 25, 4, '#1a1a2e'); circ(hx + 8, hy - 25, 4, '#1a1a2e'); }
    });
    // robot practice (wide)
    tile(80, 790, 815, 250, cRobot, P.robot || 'Robot practice', (x, y, w, h, lt) => {
      const idx = Math.max(0, Math.floor(Math.max(0, lt) / 0.8)), v = idx % 3;
      const skies = [['#5fa3e0', '#bfe3f4', '#5aa86a'], ['#8d97b0', '#d9dfea', '#f2f5fa'], ['#0b1030', '#26306a', '#1f3a4a']];
      const [s0, s1, gr] = skies[v];
      const g = ctx.createLinearGradient(0, y, 0, y + 190); g.addColorStop(0, s0); g.addColorStop(1, s1);
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.fillStyle = gr; ctx.fillRect(x, y + 190, w, h - 190);
      if (v === 1) for (let i = 0; i < 30; i++) circ(x + hash(i, 91) * w, y + ((hash(i, 92) * h + t * 60) % h), 4, '#ffffff');
      if (v === 2) { circ(x + 700, y + 70, 26, '#f1f3ff'); for (let i = 0; i < 14; i++) circ(x + hash(i, 93) * w, y + hash(i, 94) * 150, 2, '#ffffff'); }
      if (v === 0) { circ(x + 700, y + 70, 30, '#fff1c9'); }
      tree(x + 600, y + 205, 0.6, v === 1 ? 'pine' : 'round', 0, 5);
      // table + box the robot practises lifting
      rr(x + 380, y + 150, 150, 14, 5, '#8a5a3a'); rr(x + 392, y + 164, 12, 40, 3, '#6a4228'); rr(x + 506, y + 164, 12, 40, 3, '#6a4228');
      const lift = 0.5 - 0.5 * Math.cos(Math.max(0, lt) * 2.6);
      const bxp = lerp(x + 455, x + 330, lift), byp = lerp(y + 150, y + 112, lift);
      rr(bxp - 26, byp - 44, 52, 44, 6, '#e0a24e'); ctx.fillStyle = '#c4873a'; ctx.fillRect(bxp - 26, byp - 26, 52, 6);
      K.drawRobot(ctx, x + 250, y + 228, 0.72, { t, state: 'working', seed: 6 });
      ctx.font = H.font('ui', 26); const lab = 'WORLD ' + (idx + 1);
      const lw = ctx.measureText(lab).width + 34; rr(x + w - lw - 18, y + 14, lw, 44, 22, ACC);
      ctx.fillStyle = '#0b0f22'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(lab, x + w - lw - 1, y + 37);
    });
  }

  else if (mode === 'drift') {
    const cTimer = cue(P.timerCue, D * 0.31), cDrift = cue(P.driftCue, D * 0.43), cTest = cue(P.testersCue, D * 0.56), cSoon = cue(P.soonCue, D * 0.78);
    const drift = ph(cDrift - 0.5, cDrift + 1.4);
    land({ scroll: 1635, drift });
    person(330, Object.assign({}, WALKER, { mood: t > cDrift - 0.3 ? 'worried' : 'neutral', look: t > cDrift - 0.3 ? 0.9 : 0, pose: t > cDrift + 0.3 && t < cTest ? 'shrug' : 'stand' }));
    // glitch bands while it drifts
    if (drift > 0.05 && t < cTest) {
      const fr = Math.floor(t * 8);
      for (let i = 0; i < 5; i++) {
        const y = 560 + hash(i, fr) * 480, hgt = 8 + hash(i, fr + 50) * 26, x = hash(i, fr + 70) * 600;
        ctx.fillStyle = rgba(i % 2 ? '#ff4fd8' : ACC, 0.22 * Math.sin(drift * Math.PI) + 0.08); ctx.fillRect(x, y, 200 + hash(i, fr + 90) * 380, hgt);
      }
    }
    const fade = 1 - ph(cTest - 0.35, cTest);
    if (fade > 0) {
      ctx.save(); ctx.globalAlpha = fade;
      const tStart = cTimer - 1.6, secs = Math.round((P.timerSecs || 120) * ph(tStart, cTimer));
      const done = t >= cTimer;
      pill(487, 540, tStart - 0.2, { text: Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0'), size: 44, accent: done });
      pill(487, 612, cTimer - 0.1, { text: P.timerLabel || 'about 2 minutes', size: 26 });
      pill(700, 700, cDrift - 0.15, { text: P.drift || 'Details drift', size: 30, dot: true });
      ctx.restore();
    }
    // testers only: the world dims behind a rope barrier with a sign
    const tb = ph(cTest - 0.25, cTest + 0.4);
    if (tb > 0) {
      ctx.fillStyle = rgba('#060918', 0.5 * tb); ctx.fillRect(0, 0, 1080, 1920);
      const slide = (1 - eo(tb)) * 400;
      for (const [px, dir] of [[170, -1], [804, 1]]) {
        const xx = px + dir * slide;
        K.shadow(ctx, xx, 1046, 90);
        rr(xx - 30, 1030, 60, 16, 6, '#b8892c'); rr(xx - 9, 880, 18, 152, 6, '#d6a83e'); circ(xx, 874, 18, '#f0c55a');
      }
      if (tb > 0.6) {
        const sag = 70 + Math.sin(t * 2) * 3;
        ctx.strokeStyle = '#a3202f'; ctx.lineWidth = 18; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(170, 884); ctx.quadraticCurveTo(487, 884 + sag * 2, 804, 884); ctx.stroke();
        ctx.strokeStyle = '#c93a4a'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(176, 880); ctx.quadraticCurveTo(487, 880 + sag * 2, 798, 880); ctx.stroke();
      }
      const sp = K.popIn(t, cTest + 0.1, 0.45);
      if (sp > 0) {
        const sy = 884 + 70 + 6;
        ctx.save(); ctx.translate(487, sy); ctx.rotate(Math.sin(t * 2.2) * 0.03); const s = Math.min(1.04, sp); ctx.scale(s, s);
        ctx.strokeStyle = '#b8892c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-90, 0); ctx.lineTo(-110, 22); ctx.moveTo(90, 0); ctx.lineTo(110, 22); ctx.stroke();
        rr(-180, 18, 360, 84, 14, '#f0c55a'); rr(-170, 26, 340, 68, 10, '#1b1d2c');
        ctx.font = H.font('display', 34); ctx.fillStyle = '#f0c55a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(String(P.testers || 'Testers only').toUpperCase(), 0, 62);
        ctx.restore();
      }
    }
    // availability: calendar pill
    const cp = K.popIn(t, cSoon - 0.3, 0.45);
    if (cp > 0) {
      const txt = P.soon || 'Coming soon';
      ctx.save(); ctx.font = H.font('ui', 32); const tw = ctx.measureText(txt).width;
      const W = tw + 130, X0 = 487 - W / 2, Y0 = 560;
      ctx.translate(487, Y0 + 45); const s = 0.8 + 0.2 * Math.min(1.04, cp); ctx.scale(s, s); ctx.globalAlpha = clamp(cp * 2); ctx.translate(-487, -(Y0 + 45));
      rr(X0, Y0, W, 90, 45, 'rgba(10,13,30,0.94)'); ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.8); roundRect(ctx, X0, Y0, W, 90, 45); ctx.stroke();
      rr(X0 + 30, Y0 + 22, 52, 50, 8, '#f4f6fb'); rr(X0 + 30, Y0 + 22, 52, 16, 6, '#e0505a'); rr(X0 + 40, Y0 + 16, 6, 14, 3, '#9aa3bd'); rr(X0 + 66, Y0 + 16, 6, 14, 3, '#9aa3bd');
      ctx.font = H.font('display', 22); ctx.fillStyle = '#1b1d2c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', X0 + 56, Y0 + 56);
      ctx.font = H.font('ui', 32); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.fillText(txt, X0 + 100, Y0 + 46);
      ctx.restore();
    }
  }
  ctx.restore();
}
