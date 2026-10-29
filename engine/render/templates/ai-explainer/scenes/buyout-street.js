// Scene "buyout-street" (full frame). A street of small 1960s ranch houses at dusk/night, with a humming power plant
// (truck-sized gas turbines with exhaust stacks) and a data center on the horizon sending sound rings over the roofs.
// Generic cartoon residents and a generic agent in a suit (no real people, no logos). Modes:
//   hook   (cold open, ~3 s): close on one front yard. A big HOME SALE contract with a highlighted "won't sue" clause
//          is being signed from frame 0; a SOLD sign drops onto the lawn; sound rings pulse from the plant.
//   knock  (~14 s): wide street, letters fly from the plant to each door; place pill, "agent for" pill, offer bubble at
//          a door, then the accent "THE CATCH" chip.
//   noise  (~12 s, night): the plant up close on the left, houses on the right whose windows rattle as rings roll
//          over; "lawsuit filed" pill, three neighbours step out, turbine-count pill, noise pill, verbatim quote panel.
//   scale  (~11 s): two data-center blocks behind a field of gas-turbine trailers that pops in as a counter runs to
//          `count`; a money pill with coins first, then a since-when pill.
//   clause (~11 s): the contract as a big panel over the yard; company's stated reason pill; a RELEASE sheet slides out
//          and its rows tick in with crosses on cue; the homeowner hesitates with the pen.
// Fits: companies buying out neighbours / settlement-for-sale deals; noise or pollution complaints near data centers,
// factories, airports; any "sign away your claims" contract.
// params: mode;
//   hook: contract ("HOME SALE"), clause ("Release: won't sue"), sold ("SOLD");
//   knock: place ("Town"), agent ("Company agent"), offer ("We'll buy your house"), catch ("Drop your lawsuit claims"),
//          placeCue (10%), agentCue (40%), offerCue (56%), catchCue (74%);
//   noise: filed ("Lawsuit filed"), filedCue (9%), three ("Neighbors sue"), threeCue (18%), turbines ("Gas turbines on
//          site"; '' hides it), turbCue (28%), loud ("Near-constant noise"), loudCue (57%), quote ("Quote goes here."),
//          by ("A resident"), quoteCue (80%), quoteW (quote panel width, 760);
//   scale: money ("Big investment"), moneyCue (20%), count (40), unit ("gas turbines"), countCue (45%), since
//          ("Residents: noise began Date"), sinceCue (76%);
//   clause: contract, reason ("Company: it needs the property"), reasonCue (13%), release ("RELEASE OF ALL CLAIMS"),
//           releaseCue (53%), rows [{text, cue}] (2; without cues 1.4 s and 3 s after the release).
// Cues are narration words ("word#n" = the (n+1)th time spoken in the scene) or a number of seconds; without them the
// fractions of the scene above. Pass the story's place, company, quotes and published figures.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, rgba } = H;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const mode = P.mode || 'hook';
  const night = mode === 'noise';
  const GY = 1010;
  const TAU = Math.PI * 2;
  const WAVE = '#ffb36b';

  // ---------- helpers ----------
  const sky = () => {
    const g = ctx.createLinearGradient(0, 0, 0, 900);
    if (night) { g.addColorStop(0, '#0b0f2a'); g.addColorStop(1, '#232a58'); }
    else { g.addColorStop(0, '#2a2c5e'); g.addColorStop(0.6, '#6b4f7d'); g.addColorStop(1, '#e08a6a'); }
    ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, 1200);
    if (night) {
      for (let i = 0; i < 36; i++) {
        const sx = H.hash(i, 3) * 1080, sy = 150 + H.hash(i, 4) * 520, tw = 0.5 + 0.5 * Math.sin(t * 2 + i);
        ctx.globalAlpha = 0.3 + 0.5 * tw; ctx.beginPath(); ctx.arc(sx, sy, 1.5 + H.hash(i, 5) * 1.5, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(860, 330, 34, 0, TAU); ctx.fillStyle = '#f1f3ff'; ctx.fill();
      ctx.beginPath(); ctx.arc(872, 322, 30, 0, TAU); ctx.fillStyle = '#0f1433'; ctx.fill();
    } else {
      K.glow(ctx, 860, 800, 220, '#ff9d6b', 0.45);
      ctx.beginPath(); ctx.arc(860, 800, 44, 0, TAU); ctx.fillStyle = '#ffb27a'; ctx.fill();
    }
  };
  const ground = (hy) => {
    // far tree line + lawn + street
    ctx.fillStyle = night ? '#141a3a' : '#2e2f55';
    for (let i = 0; i < 16; i++) { const x = -40 + i * 76, r = 46 + 22 * H.hash(i, 9); ctx.beginPath(); ctx.arc(x, hy + 10, r, Math.PI, 0); ctx.fill(); }
    const g = ctx.createLinearGradient(0, hy, 0, GY); g.addColorStop(0, night ? '#18284a' : '#33505a'); g.addColorStop(1, night ? '#1d3a4a' : '#3f6a5e');
    ctx.fillStyle = g; ctx.fillRect(-200, hy, 1480, GY - hy + 4);
    ctx.fillStyle = night ? '#2b3150' : '#4a4f72'; ctx.fillRect(-200, GY, 1480, 16);   // sidewalk
    ctx.fillStyle = night ? '#1b1f36' : '#2c3150'; ctx.fillRect(-200, GY + 16, 1480, 60); // street
    const g2 = ctx.createLinearGradient(0, GY + 76, 0, 1920); g2.addColorStop(0, '#191c33'); g2.addColorStop(1, '#0b0d18');
    ctx.fillStyle = g2; ctx.fillRect(-200, GY + 76, 1480, 1000);
  };
  // 1960s ranch house, anchor bottom-centre. o: body colour, roof, rattle (0..1), lit, door ('closed'|'open'), letter
  const house = (x, y, s, o = {}) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 280, 0.35);
    const body = o.body || '#d9c7a6', roof = o.roof || '#6b4a3f';
    roundRect(ctx, -120, -120, 240, 120, 6); ctx.fillStyle = body; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fillRect(60, -120, 60, 120);
    // low gable roof
    ctx.beginPath(); ctx.moveTo(-138, -116); ctx.lineTo(0, -184); ctx.lineTo(138, -116); ctx.closePath(); ctx.fillStyle = roof; ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-138, -122, 276, 8);
    rr(78, -196, 20, 44, 3, '#7a5a4f');                      // chimney
    // windows (rattle = small jitter)
    const r = o.rattle || 0;
    for (const [wx, k] of [[-98, 1], [-38, 2]]) {
      const jx = r * 3.2 * Math.sin(t * 55 + k * 1.7), jy = r * 2.4 * Math.cos(t * 47 + k);
      ctx.save(); ctx.translate(jx, jy);
      roundRect(ctx, wx, -96, 48, 44, 4); ctx.fillStyle = o.lit === false ? '#2a3150' : (night ? '#ffd98a' : '#ffe2a8'); ctx.fill();
      ctx.strokeStyle = '#4a3a33'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(wx + 24, -96); ctx.lineTo(wx + 24, -52); ctx.moveTo(wx, -74); ctx.lineTo(wx + 48, -74); ctx.stroke();
      if (r > 0.05) { ctx.strokeStyle = rgba('#ffffff', 0.5 * r); ctx.lineWidth = 2; for (const d of [-8, 8]) { ctx.beginPath(); ctx.moveTo(wx + (d < 0 ? -6 : 54), -90); ctx.lineTo(wx + (d < 0 ? -12 : 60), -60); ctx.stroke(); } }
      ctx.restore();
    }
    // door + step
    rr(30, -84, 46, 84, 4, o.door === 'open' ? '#1a1410' : '#8a5a3c');
    if (o.door === 'open') { ctx.fillStyle = 'rgba(255,217,138,0.55)'; ctx.fillRect(30, -84, 46, 84); }
    ctx.beginPath(); ctx.arc(68, -42, 3.5, 0, TAU); ctx.fillStyle = '#e8c86b'; ctx.fill();
    rr(22, -6, 62, 8, 3, '#9a9184');
    if (o.letter > 0) {                                       // a letter tucked at the door
      const k = Math.min(1, o.letter);
      ctx.save(); ctx.translate(53, -58); ctx.rotate(-0.15); ctx.scale(k, k);
      rr(-18, -12, 36, 24, 3, '#f4f1e8'); ctx.strokeStyle = '#c9c4b5'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-18, -12); ctx.lineTo(0, 2); ctx.lineTo(18, -12); ctx.stroke(); ctx.restore();
    }
    // shrub
    for (const [bx, br] of [[-118, 22], [-96, 16], [112, 18]]) { ctx.beginPath(); ctx.arc(bx, -10, br, 0, TAU); ctx.fillStyle = night ? '#1f4a3a' : '#3d7a55'; ctx.fill(); }
    ctx.restore();
  };
  function rr(x, y, w, h, r, c) { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = c; ctx.fill(); }
  // gas turbine unit (truck-sized trailer with an exhaust stack), anchor bottom-centre
  const turbine = (x, y, s, k) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    K.shadow(ctx, 0, 0, 200, 0.3);
    rr(-90, -22, 180, 14, 4, '#3a3f5c');                      // trailer bed
    for (const wx of [-60, 50]) { ctx.beginPath(); ctx.arc(wx, -8, 10, 0, TAU); ctx.fillStyle = '#171a26'; ctx.fill(); }
    roundRect(ctx, -84, -78, 168, 58, 26); ctx.fillStyle = '#b9bfd2'; ctx.fill();
    ctx.fillStyle = '#9aa1b8'; ctx.fillRect(-84, -46, 168, 26);
    for (let i = 0; i < 5; i++) rr(-60 + i * 22, -70, 10, 30, 3, '#8a90a8');
    rr(40, -136, 28, 64, 4, '#7d8399');                       // stack
    rr(36, -142, 36, 10, 3, '#6a7088');
    // exhaust puffs + heat shimmer
    for (let i = 0; i < 4; i++) {
      const u = ((t * 0.6 + i / 4 + k * 0.13) % 1);
      ctx.globalAlpha = 0.35 * (1 - u); ctx.beginPath(); ctx.arc(54 + Math.sin(u * 6 + k) * 10, -150 - u * 120, 12 + u * 26, 0, TAU);
      ctx.fillStyle = night ? '#8a91b8' : '#d8d2dc'; ctx.fill();
    }
    ctx.globalAlpha = 1;
    // status light
    const on = Math.sin(t * 6 + k) > 0;
    ctx.beginPath(); ctx.arc(-66, -60, 5, 0, TAU); ctx.fillStyle = on ? '#ff7a59' : '#5a3a3a'; ctx.fill();
    ctx.restore();
  };
  const plant = (x, y, s, n = 4) => {
    // data center block behind, turbines in front
    K.drawDataCenter(ctx, x + 40 * s, y - 40 * s, 0.9 * s, { t, activity: 0.85 });
    for (let i = 0; i < n; i++) turbine(x - 170 * s + i * 125 * s * (4 / n), y + 40 * s + (i % 2) * 16 * s, 0.82 * s, i);
    // fence
    ctx.strokeStyle = 'rgba(200,210,235,0.35)'; ctx.lineWidth = 2;
    for (let i = 0; i < 18; i++) { const fx = x - 260 * s + i * 30 * s; ctx.beginPath(); ctx.moveTo(fx, y + 20 * s); ctx.lineTo(fx, y - 30 * s); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x - 260 * s, y - 24 * s); ctx.lineTo(x + 250 * s, y - 24 * s); ctx.stroke();
  };
  // sound rings expanding from (x, y); amp 0..1
  const rings = (x, y, amp, maxR = 900, n = 5, speed = 170) => {
    ctx.save(); ctx.lineCap = 'round';
    for (let i = 0; i < n; i++) {
      const r = ((t * speed + i * (maxR / n)) % maxR) + 40, a = (1 - r / (maxR + 40)) * amp;
      ctx.strokeStyle = rgba(WAVE, 0.55 * a); ctx.lineWidth = 6 + 4 * a;
      ctx.beginPath(); ctx.arc(x, y, r, -Math.PI * 0.42, Math.PI * 0.05); ctx.stroke();
      // wobbly "hum" ticks on the ring
      ctx.lineWidth = 3;
      for (let j = 0; j < 4; j++) { const ang = -1.1 + j * 0.3, wob = 10 * Math.sin(t * 9 + j + i); ctx.beginPath(); ctx.moveTo(x + Math.cos(ang) * (r - 10 + wob), y + Math.sin(ang) * (r - 10 + wob)); ctx.lineTo(x + Math.cos(ang) * (r + 10 + wob), y + Math.sin(ang) * (r + 10 + wob)); ctx.stroke(); }
    }
    ctx.restore();
  };
  const soldSign = (x, y, s, drop) => {      // drop 0..1 (falls in, bounces)
    if (drop <= 0) return;
    const yy = y - (1 - smooth(clamp(drop / 0.55))) * 150 + (drop > 0.55 ? Math.sin((drop - 0.55) * 18) * 10 * (1 - drop) : 0);
    ctx.save(); ctx.translate(x, yy); ctx.scale(s, s);
    K.shadow(ctx, 0, y - yy, 120, 0.35 * smooth(drop));
    rr(-6, -170, 12, 170, 4, '#f4f1e8');
    rr(-6, -170, 90, 10, 3, '#f4f1e8');
    const sw = Math.sin(t * 3) * 0.05 * (drop >= 1 ? 1 : 2);
    ctx.save(); ctx.translate(60, -160); ctx.rotate(sw);
    ctx.strokeStyle = '#c9c4b5'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-30, 0); ctx.lineTo(-30, 18); ctx.moveTo(30, 0); ctx.lineTo(30, 18); ctx.stroke();
    rr(-80, 18, 160, 78, 8, ACC);
    ctx.font = H.font('display', 40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = K.ACCENT.deep;
    ctx.fillText(P.sold || 'SOLD', 0, 59);
    ctx.restore();
    ctx.restore();
  };
  // contract sheet (centre x, top y, width). o: title, clause, sign (0..1), pulse, rows
  const contract = (cx, top, w, o = {}) => {
    const h = o.h || w * 1.25;
    ctx.save(); ctx.translate(cx, top);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; roundRect(ctx, -w / 2 + 10, 12, w, h, 16); ctx.fill();
    roundRect(ctx, -w / 2, 0, w, h, 16); ctx.fillStyle = '#f6f2e7'; ctx.fill();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const f = H.fitText(ctx, o.title || 'HOME SALE', 'display', Math.round(w * 0.11), 24, w - 60); ctx.font = f.font; ctx.fillStyle = '#20243f';
    ctx.fillText(f.text, 0, 48);
    for (let i = 0; i < 4; i++) rr(-w / 2 + 34, 92 + i * 26, (w - 68) * (i === 3 ? 0.6 : 1 - 0.12 * H.hash(i, 7)), 10, 5, '#d4cdbd');
    // the clause, highlighted
    if (o.clause) {
      const cy = 92 + 4 * 26 + 14, ch = 62, pulse = o.pulse || 0;
      roundRect(ctx, -w / 2 + 22, cy, w - 44, ch, 10); ctx.fillStyle = rgba(ACC, 0.32 + 0.25 * pulse); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
      const fc = H.fitText(ctx, o.clause, 'display', 32, 22, w - 80); ctx.font = fc.font; ctx.fillStyle = '#20243f'; ctx.fillText(fc.text, 0, cy + ch / 2 + 1);
    }
    // signature line + scribble
    const sy = h - 46;
    ctx.fillStyle = '#9a9184'; ctx.fillRect(-w / 2 + 40, sy, w * 0.55, 3);
    ctx.font = H.font('ui', 20); ctx.textAlign = 'left'; ctx.fillStyle = '#8a8273'; ctx.fillText('SIGN HERE', -w / 2 + 40, sy + 22);
    if (o.sign > 0) {
      ctx.strokeStyle = '#2c58c9'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const x0 = -w / 2 + 46, sc = w / 300;
      const pts = K.motion.bezier(x0, sy - 6, x0 + 30 * sc, sy - 60, x0 + 50 * sc, sy + 4, x0 + 80 * sc, sy - 34, 16)
        .concat(K.motion.bezier(x0 + 80 * sc, sy - 34, x0 + 110 * sc, sy - 64, x0 + 120 * sc, sy - 2, x0 + 160 * sc, sy - 26, 16));
      K.motion.pathDraw(ctx, pts, clamp(o.sign));
      if (o.pen) {                                              // pen at the tip
        const tip = K.motion.pathPoint(pts, clamp(o.sign));
        ctx.save(); ctx.translate(tip[0], tip[1]); ctx.rotate(-0.7);
        rr(-6, -96, 12, 86, 5, '#20243f'); rr(-6, -96, 12, 18, 5, ACC);
        ctx.beginPath(); ctx.moveTo(-6, -10); ctx.lineTo(0, 4); ctx.lineTo(6, -10); ctx.closePath(); ctx.fillStyle = '#c9c4b5'; ctx.fill();
        ctx.restore();
      }
    }
    ctx.restore();
    return h;
  };
  const pill = (x, y, k, text, o = {}) => { if (k > 0) K.drawLabel(ctx, x, y, Math.min(1.05, k), Object.assign({ text, size: o.size || 30 }, o)); };

  ctx.save();
  // ======================= HOOK =======================
  if (mode === 'hook') {
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 735 }]);
    sky(); ground(840);
    plant(200, 840, 0.6, 3);
    rings(200, 760, 1, 1000, 5, 210);
    house(487, 960, 1.35, { body: '#e0cfae', rattle: 0.6 + 0.4 * Math.sin(t * 3) });
    // homeowner signs, agent waits with a clipboard
    const signP = clamp((t + 0.45) / 1.25);
    K.drawPerson(ctx, 150, 1040, 1.2, { t, pose: 'point', mood: signP < 1 ? 'worried' : 'neutral', skin: 3, hair: 1, shirt: '#5f8f6a', hairStyle: 'short', seed: 3 });
    K.drawPerson(ctx, 800, 1040, 1.25, { t, pose: 'stand', flip: true, mood: 'happy', skin: 1, hair: 0, shirt: '#3b4a7a', hairStyle: 'short', seed: 8 });
    K.drawDocument(ctx, 742, 900, 0.42, { lines: 4, title: true });
    soldSign(300, 1000, 1.0, clamp((t - 1.2) / 0.8));
    const bob = K.bob(t, 4, 1.4);
    contract(487, 430 + bob, 330, { title: P.contract || 'HOME SALE', clause: P.clause || 'Release: won\'t sue', sign: signP, pen: signP < 1, pulse: 0.5 + 0.5 * Math.sin(t * 6), h: 400 });
  }

  // ======================= KNOCK =======================
  if (mode === 'knock') {
    const tPlace = at(P.placeCue, D * 0.1) - 0.25;
    const tAgent = at(P.agentCue, D * 0.4) - 0.3;
    const tOffer = at(P.offerCue, D * 0.56) - 0.2;
    const tCatch = at(P.catchCue, D * 0.74) - 0.2;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: tOffer, zoom: 1.02, x: 487, y: 740 }, { t: D, zoom: 1.05, x: 487, y: 750 }]);
    sky(); ground(820);
    plant(150, 800, 0.42, 3);
    rings(150, 740, 0.8, 1000, 5, 160);
    const HX = [180, 487, 790], doors = HX.map((x) => x + 53 * 0.95);
    // letters fly from the company site to each door (staggered from the offer cue)
    const tL = [0, 1, 2].map((i) => tOffer - 0.9 + i * 0.45);
    const arrived = tL.map((tl) => clamp((t - tl) / 0.8));
    HX.forEach((x, i) => house(x, 960, 0.95, { body: ['#d9c7a6', '#c9d3b6', '#e0bfa8'][i], roof: ['#6b4a3f', '#4f5a7a', '#7a4f45'][i], letter: arrived[i] >= 1 && !(i === 2 && t > tOffer + 0.9) ? 1 : 0, door: i === 2 && t > tOffer + 0.6 ? 'open' : 'closed', rattle: 0.25 }));
    tL.forEach((tl, i) => {
      const u = arrived[i]; if (u <= 0 || u >= 1) return;
      const x0 = 190, y0 = 690, x1 = HX[i] + 53 * 0.95, y1 = 960 - 58 * 0.95, e = smooth(u);
      const x = lerp(x0, x1, e), y = lerp(y0, y1, e) - Math.sin(e * Math.PI) * 220;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(u * 8) * 0.3); ctx.scale(1.3, 1.3);
      roundRect(ctx, -18, -12, 36, 24, 3); ctx.fillStyle = '#f4f1e8'; ctx.fill(); ctx.strokeStyle = '#c9c4b5'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-18, -12); ctx.lineTo(0, 2); ctx.lineTo(18, -12); ctx.stroke(); ctx.restore();
    });
    // homeowner steps out of the third door with the letter
    const hk = K.popIn(t, tOffer + 0.7, 0.4);
    if (hk > 0) {
      K.drawPerson(ctx, doors[2] - 30, 1040, 1.15 * Math.min(1, hk), { t, pose: t > tCatch ? 'shrug' : 'stand', mood: t > tCatch + 0.4 ? 'worried' : 'neutral', skin: 4, hair: 2, shirt: '#c96a5a', hairStyle: 'long', seed: 5, look: -0.3 });
      if (t < tCatch) K.drawDocument(ctx, doors[2] - 70, 930, 0.32 * Math.min(1, hk), { lines: 3, title: true });
    }
    pill(487, 480, K.popIn(t, tPlace, 0.45), P.place || 'Town', { dot: true, size: 32 });
    const agk = K.popIn(t, tAgent, 0.4);
    if (agk > 0 && t < tCatch) pill(300, 640, agk, P.agent || 'Company agent', { size: 28 });
    const ob = K.popIn(t, tOffer + 0.9, 0.4), obOut = smooth((t - tCatch) / 0.4);
    if (ob > 0 && obOut < 1) { ctx.save(); ctx.globalAlpha = 1 - obOut; K.drawSpeechBubble(ctx, doors[2] - 60, 790, 1, { text: P.offer || "We'll buy your house", size: 32, tail: 'right', pop: Math.min(1.04, ob) }); ctx.restore(); }
    const ck = K.popIn(t, tCatch, 0.45);
    if (ck > 0) {
      ctx.save(); ctx.translate(487, 610); ctx.scale(Math.min(1.04, ck), Math.min(1.04, ck));
      const W = 640, Hh = 150;
      roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 24); ctx.fillStyle = 'rgba(8,10,24,0.94)'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = H.font('ui', 26); ctx.fillStyle = ACC; ctx.fillText('THE CATCH', 0, -40);
      const f = H.fitText(ctx, P.catch || 'Drop your lawsuit claims', 'display', 44, 28, W - 60); ctx.font = f.font; ctx.fillStyle = '#ffffff'; ctx.fillText(f.text, 0, 18);
      ctx.restore();
    }
  }

  // ======================= NOISE =======================
  if (mode === 'noise') {
    const tFiled = at(P.filedCue, D * 0.09) - 0.3;
    const tThree = at(P.threeCue, D * 0.18) - 0.2;
    const tTurb = at(P.turbCue, D * 0.28) - 0.2;
    const tLoud = at(P.loudCue, D * 0.57) - 0.2;
    const tQ = at(P.quoteCue, D * 0.8) - 0.6;
    const amp = 0.55 + 0.45 * smooth((t - tLoud) / 0.8);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: tLoud, zoom: 1.03, x: 470, y: 745 }, { t: D, zoom: 1.06, x: 487, y: 750 }]);
    if (t > tLoud) K.cameraShake(ctx, t, tLoud + 0.1, 0.5, 5);
    sky(); ground(840);
    plant(270, 900, 0.95, 4);
    rings(240, 790, amp, 1100, 6, 190);
    house(650, 960, 0.9, { body: '#d9c7a6', rattle: amp, lit: true });
    house(880, 975, 0.9, { body: '#c9d3b6', roof: '#4f5a7a', rattle: amp });
    // three neighbours step out
    const NB = [[560, 3, 2, '#c96a5a', 'long'], [690, 1, 0, '#5f8f6a', 'short'], [820, 4, 3, '#e0b04f', 'curly']];
    NB.forEach(([x, skin, hair, shirt, hs], i) => {
      const k = K.popIn(t, tThree + i * 0.18, 0.4);
      if (k <= 0) return;
      const covering = t > tLoud;
      K.drawPerson(ctx, x, 1040, 1.05 * Math.min(1, k), { t, pose: covering ? 'shrug' : 'stand', flip: true, mood: covering ? 'angry' : 'worried', skin, hair, shirt, hairStyle: hs, seed: 20 + i, look: -0.6 });
    });
    pill(487, 470, K.popIn(t, tFiled, 0.45) * (1 - smooth((t - tQ) / 0.3)), P.filed || 'Lawsuit filed', { dot: true, size: 30 });
    pill(690, 760, K.popIn(t, tThree + 0.4, 0.4), P.three || 'Neighbors sue', { size: 28 });
    if (P.turbines !== '') pill(330, 690, K.popIn(t, tTurb, 0.4), P.turbines || 'Gas turbines on site', { size: 28 });
    const lk = K.popIn(t, tLoud, 0.4);
    if (lk > 0 && t < tQ) pill(300, 600, lk, P.loud || 'Near-constant noise', { size: 30, accent: true });
    // verbatim quote panel
    const qk = K.popIn(t, tQ, 0.45);
    if (qk > 0) {
      ctx.save(); ctx.translate(487, 500); ctx.scale(Math.min(1.04, qk), Math.min(1.04, qk));
      const W = P.quoteW || 760, Hh = 170;
      roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 24); ctx.fillStyle = 'rgba(8,10,24,0.95)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = rgba(ACC, 0.85); ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = H.font('ui', 24); ctx.fillStyle = ACC; ctx.fillText(String(P.by || 'A resident').toUpperCase(), 0, -Hh / 2 + 32);
      const full = '“' + (P.quote || 'Quote goes here.') + '”';
      const shown = K.typewriter(full, t, 34, tQ + 0.25);
      let size = 40, lines; for (; size >= 28; size -= 2) { lines = H.wrap(ctx, full, 'bold', size, W - 60); if (lines.length <= 2) break; }
      ctx.font = H.font('bold', size); ctx.fillStyle = '#ffffff';
      let left = shown.length; const lh = size * 1.2, y0 = 20 - ((lines.length - 1) * lh) / 2;
      lines.forEach((ln, j) => { const part = ln.slice(0, Math.max(0, left)); left -= ln.length + 1; ctx.fillText(part, -(ctx.measureText(ln).width - ctx.measureText(part).width) / 2, y0 + j * lh); });
      ctx.restore();
    }
  }

  // ======================= SCALE =======================
  // the plant's size: investment pill, a field of turbines that pops in as a counter runs to `count`, a since-when pill
  if (mode === 'scale') {
    const tMoney = at(P.moneyCue, D * 0.2) - 0.3;
    const tCount = at(P.countCue, D * 0.45) - 0.6;
    const tSince = at(P.sinceCue, D * 0.76) - 0.4;
    const count = P.count == null ? 40 : P.count;
    const cp = clamp((t - tCount) / 1.5), shown = Math.round(smooth(cp) * count);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: tCount, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
    sky(); ground(800);
    K.drawDataCenter(ctx, 700, 790, 1.0, { t, activity: 0.9 });
    K.drawDataCenter(ctx, 330, 780, 0.8, { t: t + 2, activity: 0.9 });
    rings(487, 820, 0.35 + 0.65 * smooth(cp), 1100, 6, 180);
    // turbine field, back rows first (perspective)
    const perRow = 10, nRows = Math.ceil(count / perRow);
    const slots = [];
    for (let r = 0; r < nRows; r++) for (let c2 = 0; c2 < perRow; c2++) {
      const i = r * perRow + c2; if (i >= count) break;
      const k = r / Math.max(1, nRows - 1), s = lerp(0.2, 0.34, k), y = lerp(830, 1015, k);
      const span = lerp(620, 800, k), x = 487 - span / 2 + (c2 + 0.5) * (span / perRow) + (r % 2 ? 12 : -12);
      slots.push({ i, x, y, s });
    }
    // reveal order front-to-back would hide the count; pop in in index order (back rows first)
    for (const sl of slots) {
      if (sl.i >= shown) continue;
      const pk = clamp((smooth(cp) * count - sl.i) / 3);
      turbine(sl.x, sl.y, sl.s * Math.min(1, 0.4 + 0.6 * pk), sl.i);
    }
    // counter panel
    const ck = K.popIn(t, tCount - 0.1, 0.45);
    if (ck > 0) {
      ctx.save(); ctx.translate(487, 520); ctx.scale(Math.min(1.04, ck), Math.min(1.04, ck));
      const W = 600, Hh = 110;
      roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 24); ctx.fillStyle = 'rgba(8,10,24,0.95)'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.textBaseline = 'middle';
      ctx.font = H.font('display', 72); ctx.textAlign = 'right'; ctx.fillStyle = ACC; ctx.fillText(String(shown), -60, 6);
      ctx.font = H.font('bold', 40); ctx.textAlign = 'left'; ctx.fillStyle = '#ffffff'; ctx.fillText(P.unit || 'gas turbines', -40, 6);
      ctx.restore();
    }
    // money pill (gives way to the counter), since-when pill
    const mk = K.popIn(t, tMoney, 0.45), mOut = smooth((t - tCount) / 0.3);
    if (mk > 0 && mOut < 1) {
      ctx.save(); ctx.globalAlpha = 1 - mOut;
      ctx.translate(487, 520); ctx.scale(Math.min(1.04, mk) * (1 - mOut), Math.min(1.04, mk) * (1 - mOut));
      for (let i = 0; i < 4; i++) K.drawCoin(ctx, -250 + i * 14, 40 - i * 10, 0.9, { spin: t * 5 + i });
      ctx.restore();
      ctx.save(); ctx.globalAlpha = 1 - mOut; pill(520, 560, mk, P.money || 'Big investment', { size: 36, accent: true }); ctx.restore();
    }
    pill(487, 680, K.popIn(t, tSince, 0.45), P.since || 'Residents: noise began Date', { size: 30, dot: true });
  }

  // ======================= CLAUSE =======================
  if (mode === 'clause') {
    const tReason = at(P.reasonCue, D * 0.13) - 0.3;
    const tRel = at(P.releaseCue, D * 0.53) - 0.3;
    const rows = (P.rows || [{ text: 'No damages from the lawsuit' }, { text: 'No claims of your own' }]).slice(0, 2);
    const tRows = rows.map((r, i) => at(r.cue, tRel + 1.4 + i * 1.6) - 0.25);
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.04, x: 487, y: 720 }]);
    sky(); ground(840);
    plant(150, 830, 0.5, 3);
    rings(150, 770, 0.7, 1000, 5, 160);
    house(487, 950, 1.2, { body: '#e0cfae', rattle: 0.3 });
    const hes = t > tRows[0];
    K.drawPerson(ctx, 150, 1040, 1.2, { t, pose: hes ? 'shrug' : 'stand', mood: hes ? 'worried' : 'neutral', skin: 3, hair: 1, shirt: '#5f8f6a', hairStyle: 'short', seed: 3, look: 0.5 });
    K.drawPerson(ctx, 830, 1040, 1.2, { t, pose: 'point', flip: true, mood: 'happy', skin: 1, hair: 0, shirt: '#3b4a7a', hairStyle: 'short', seed: 8 });
    // sale contract (slides left when the release arrives)
    const slide = smooth((t - tRel) / 0.6);
    const ck = K.popIn(t, 0.05, 0.45);
    ctx.save(); ctx.translate(lerp(0, -150, slide), 0); ctx.globalAlpha = lerp(1, 0.85, slide);
    ctx.translate(487, 430); ctx.scale(Math.min(1.03, ck) * lerp(1, 0.86, slide), Math.min(1.03, ck) * lerp(1, 0.86, slide)); ctx.translate(-487, -430);
    contract(487, 430, 400, { title: P.contract || 'HOME SALE', h: 420, sign: 0 });
    ctx.restore();
    const rk = K.popIn(t, tReason, 0.45);
    if (rk > 0 && slide < 1) { ctx.save(); ctx.globalAlpha = 1 - slide; pill(487, 700, rk, P.reason || 'Company: it needs the property', { size: 30, dot: true }); ctx.restore(); }
    // release sheet slides in from the right
    if (t > tRel - 0.05) {
      const k = K.popIn(t, tRel, 0.5), x = lerp(980, 590, smooth((t - tRel) / 0.55));
      ctx.save(); ctx.translate(x, 450 + K.bob(t, 3, 1.3));
      const W = 470, Hh = 540;
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; roundRect(ctx, -W / 2 + 10, 12, W, Hh, 16); ctx.fill();
      roundRect(ctx, -W / 2, 0, W, Hh, 16); ctx.fillStyle = '#fbf7ec'; ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      rr(-W / 2, 0, W, 76, 16, ACC); ctx.fillStyle = ACC; ctx.fillRect(-W / 2, 50, W, 26);
      const f = H.fitText(ctx, P.release || 'RELEASE OF ALL CLAIMS', 'display', 34, 22, W - 40); ctx.font = f.font; ctx.fillStyle = K.ACCENT.deep; ctx.fillText(f.text, 0, 40);
      rows.forEach((r, i) => {
        const rk2 = K.popIn(t, tRows[i], 0.4); if (rk2 <= 0) return;
        const y = 140 + i * 118;
        ctx.save(); ctx.translate(0, y); ctx.globalAlpha = clamp(rk2);
        roundRect(ctx, -W / 2 + 22, -44, W - 44, 92, 14); ctx.fillStyle = '#f1e9da'; ctx.fill();
        // red cross badge
        ctx.save(); ctx.translate(-W / 2 + 70, 2); ctx.scale(Math.min(1.1, rk2), Math.min(1.1, rk2));
        ctx.beginPath(); ctx.arc(0, 0, 28, 0, TAU); ctx.fillStyle = '#e0505a'; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(10, 10); ctx.moveTo(10, -10); ctx.lineTo(-10, 10); ctx.stroke();
        ctx.restore();
        ctx.textAlign = 'left';
        const lines = H.wrap(ctx, r.text, 'bold', 30, W - 150);
        ctx.font = H.font('bold', 30); ctx.fillStyle = '#20243f';
        lines.slice(0, 2).forEach((ln, j) => ctx.fillText(ln, -W / 2 + 116, 2 + (j - (Math.min(2, lines.length) - 1) / 2) * 34));
        ctx.restore();
      });
      // signature line with a pen hovering, unsigned
      const sy = Hh - 70;
      ctx.fillStyle = '#9a9184'; ctx.fillRect(-W / 2 + 40, sy, W * 0.5, 3);
      ctx.font = H.font('ui', 20); ctx.textAlign = 'left'; ctx.fillStyle = '#8a8273'; ctx.fillText('SIGN AT CLOSING', -W / 2 + 40, sy + 24);
      const hover = K.bob(t, 8, 1.1);
      ctx.save(); ctx.translate(-W / 2 + 120, sy - 30 + hover); ctx.rotate(-0.7);
      rr(-6, -96, 12, 86, 5, '#20243f'); rr(-6, -96, 12, 18, 5, ACC);
      ctx.beginPath(); ctx.moveTo(-6, -10); ctx.lineTo(0, 4); ctx.lineTo(6, -10); ctx.closePath(); ctx.fillStyle = '#c9c4b5'; ctx.fill();
      ctx.restore();
      ctx.restore();
      void k;
    }
  }
  ctx.restore();
}
