// Scene "rename-street" (full frame, spans 5 beats; also works with 3-5). A dusk street of buildings with
// letter-tile signs on their roofs; the camera dollies from building to building, one per beat:
//   beat 1  a government building (sign already renamed) + a locked cabinet of old papers ("Unchanged");
//           the camera pulls back to show the private towers ("Not required"); a sign painter's lift rolls in
//   beat 2+ one tower per beat, each with a quote card (verbatim words + who/where), and one of three modes:
//           "pending": the painter rises on the lift holding the new letter, then a calendar "?" + chip (no date yet)
//           "flip":    the painter points, the differing letters flip to the new name, chip pops
//           "keep":    a painter walks up, shrugs; the sign stays; chip ("No plans") + a small speech bubble
//   last    (when there are towers + 2 beats) wide shot of the whole street, a big letter board above flips
//           between the old and new first letter and settles on "?", with a question pill.
// Generic cartoon characters only; company names appear as plain text on the signs (no logos).
// params (all optional):
//   gov      { sign (default "NEW"), building (pediment text, default "AGENCY"), label (default "Government"),
//              keep (default "Old papers"), keepChip (default "Unchanged") }
//   towers   [{ from, to, label?, mode: pending|flip|keep, quote?, by?, chip?, bubble?, cue, chipCue, quoteCue? }] (1-3)
//            default: two fictional towers ("OLD" -> "NEW" flip, "SAME" keep). Quotes only verbatim + attributed.
//   privateLabel (default "Not required"), question (default "Old name or new?")
//   board    [old, new] letters for the payoff board (default ["A", "B"]); rest: letters after them (default "", none)
//   cues (narration words): privateCue (55 % of beat 1), anywayCue (85 % of beat 1), keepCue (beat 1 + 2.5 s),
//            govCue (payoff glow on the agency, payoff + 0.5 s), towersCue (glow on the towers, payoff + 3 s),
//            qCue (payoff + 4 s); per tower cue (45 %), chipCue (75 %), quoteCue (cue - 0.4 s) of its beat
// (Promoted from 2026-10-12 si-rebrand; that story also used keepCue "rewritten", govCue "federal",
//  towersCue "companies", board ["A", "S"], rest "I".)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth } = H;
  const D = info.duration, ACC = info.accent;
  const towers = (P.towers || [
    { from: 'OLD', to: 'NEW', mode: 'flip', label: 'Company A', chip: 'Renamed' },
    { from: 'SAME', to: 'SAME', mode: 'keep', label: 'Company B', chip: 'No plans to rename', bubble: 'Not for us' },
  ]).slice(0, 3);
  const nb = info.beats && info.beats.length ? info.beats.length : towers.length + 2;
  const beats = info.beats && info.beats.length ? info.beats : Array.from({ length: nb }, (_, i) => ({ t0: D * i / nb, t1: D * (i + 1) / nb }));
  const hasPayoff = beats.length >= towers.length + 2;
  const B = (i) => beats[Math.min(i, beats.length - 1)];
  const cueT = (w, d) => { const v = w ? info.timeOf(w) : null; return v != null ? v : d; };
  const gov = Object.assign({ sign: 'NEW', label: 'Government', keep: 'Old papers', keepChip: 'Unchanged' }, P.gov || {});
  const GOVX = 487, GAP = 760, TX = towers.map((_, i) => GOVX + GAP * (i + 1));
  const privateAt = cueT(P.privateCue, B(0).t0 + (B(0).t1 - B(0).t0) * 0.55);
  const anywayAt = cueT(P.anywayCue, B(0).t0 + (B(0).t1 - B(0).t0) * 0.85);
  const keepAt = cueT(P.keepCue, B(0).t0 + 2.5);
  const payT0 = hasPayoff ? B(towers.length + 1).t0 : D + 1;
  const govCueT = cueT(P.govCue, payT0 + 0.5), towersCueT = cueT(P.towersCue, payT0 + 3);
  const qAt = cueT(P.qCue, payT0 + 4);

  // ---------- camera keys: (cx, s), ground stays at y 1000
  const midX = (GOVX + (TX[TX.length - 1] || GOVX)) / 2;
  const keys = [
    { t: 0, cx: GOVX, s: 1 },
    { t: privateAt - 0.2, cx: GOVX, s: 1 },
    { t: privateAt + 1.0, cx: (GOVX + (TX[0] || GOVX)) / 2, s: 0.74 },
  ];
  towers.forEach((_, i) => {
    keys.push({ t: B(i + 1).t0 - 0.1, cx: i === 0 ? (GOVX + TX[0]) / 2 : TX[i - 1], s: i === 0 ? 0.74 : 1 });
    keys.push({ t: B(i + 1).t0 + 1.1, cx: TX[i], s: 1 });
  });
  if (hasPayoff) { keys.push({ t: payT0 - 0.05, cx: TX[TX.length - 1], s: 1 }); keys.push({ t: payT0 + 1.4, cx: midX, s: 0.34 }); }
  let cam = keys[keys.length - 1];
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t < a.t) { cam = a; break; }
    if (t <= b.t) { const u = H.easeInOutCubic(clamp((t - a.t) / Math.max(0.01, b.t - a.t))); cam = { cx: lerp(a.cx, b.cx, u), s: lerp(a.s, b.s, u) }; break; }
  }
  const SX = (wx) => 487 + (wx - cam.cx) * cam.s, SY = (wy) => 1000 + (wy - 1000) * cam.s;

  // ---------- background (screen space): sky, parallax skyline, street
  backdrop(ctx, K, H, t, cam.cx);
  ctx.save();
  ctx.translate(487, 1000); ctx.scale(cam.s, cam.s); ctx.translate(-cam.cx, -1000);
  // pavement strip in world space
  ctx.fillStyle = '#2b2f4a'; ctx.fillRect(-800, 1000, GAP * 5 + 1600, 40);

  // ---------- government building with renamed sign + cabinet
  const govSign = String(gov.sign || 'NEW');
  civic(ctx, K, GOVX, 1000, (gov.building || 'AGENCY'));
  const govGlow = hasPayoff ? K.phase(t, govCueT, govCueT + 0.6) * (1 - K.phase(t, towersCueT, towersCueT + 0.6)) : 0;
  if (govGlow > 0) K.glow(ctx, GOVX, 790, 260, ACC, 0.35 * govGlow);
  signBoard(ctx, K, H, GOVX, 790, govSign, govSign, 1, ACC, { accentAll: true });
  // cabinet of old papers, locked
  const CX = GOVX + 300;
  K.shadow(ctx, CX, 1000, 190, 0.35);
  H.roundRect(ctx, CX - 75, 790, 150, 210, 10); ctx.fillStyle = '#5b6488'; ctx.fill();
  for (let d = 0; d < 3; d++) {
    H.roundRect(ctx, CX - 62, 806 + d * 64, 124, 54, 6); ctx.fillStyle = '#6e78a0'; ctx.fill();
    H.roundRect(ctx, CX - 18, 826 + d * 64, 36, 10, 5); ctx.fillStyle = '#c9cfe6'; ctx.fill();
    // papers peeking out
    ctx.fillStyle = '#f2f4fa'; ctx.fillRect(CX - 50 + d * 14, 800 + d * 64, 60, 8);
  }
  const lockK = K.phase(t, keepAt, keepAt + 0.5, K.easeOutBack);
  K.drawLock(ctx, CX + 70, 900, 0.6, { open: 1 - clamp(lockK) });

  // ---------- towers
  towers.forEach((tw, i) => {
    const x = TX[i], bi = i + 1, b = B(bi);
    const colors = ['#4f7f9a', '#7a5ba8', '#3f8a7a'];
    K.drawBuilding(ctx, x, 1000, 1.0, { t, color: colors[i % 3], floors: 5, lit: 0.55 });
    if (tw.label) K.drawLabel(ctx, x, 930, 1, { text: tw.label, size: 30, dot: true });
    const cue = cueT(tw.cue, b.t0 + (b.t1 - b.t0) * 0.45), chipAt = cueT(tw.chipCue, b.t0 + (b.t1 - b.t0) * 0.75);
    const mode = tw.mode || 'flip';
    const flip = mode === 'flip' ? (t - cue) / 0.6 : -1;
    const glowC = hasPayoff ? K.phase(t, towersCueT, towersCueT + 0.6) : 0;
    if (glowC > 0) K.glow(ctx, x, 640, 280, ACC, 0.3 * glowC * (0.7 + 0.3 * Math.sin(t * 3 + i)));
    signBoard(ctx, K, H, x, 640, String(tw.from || ''), String(tw.to || tw.from || ''), flip, ACC, {});
    if (mode === 'flip' && t > cue + 0.3 && t < cue + 1.2) burst(ctx, H, x, 640, (t - cue - 0.3) / 0.9, ACC);
    // the painter
    if (mode === 'pending' || mode === 'flip') {
      const from = String(tw.from || ''), to = String(tw.to || '');
      const n = from.length, w = n * 72 - 10, j = Math.max(0, [...from].findIndex((c, k) => c !== to[k]));
      const ssc = signScale(from), side = j >= n / 2 ? 1 : -1;
      const liftX = x + side * ((w + 28) / 2 * ssc + 92);
      let lx = liftX, rise = 1;
      if (mode === 'pending') {
        // rolls in during the previous beat (from the right), then rises
        const roll = K.phase(t, anywayAt - 0.2, b.t0 + 0.6, H.easeInOutCubic);
        lx = lerp(liftX + 900, liftX, roll);
        rise = K.phase(t, b.t0 + 0.8, cue + 0.2, H.easeInOutCubic);
      } else {
        // parked off-screen until its beat; the camera arrives, then it rises
        if (t < b.t0 - 0.1) return;
        rise = K.phase(t, b.t0 + 0.7, b.t0 + 1.6, H.easeInOutCubic);
      }
      const platY = lerp(960, 768, rise);
      lift(ctx, H, lx, 1000, platY);
      const shrug = mode === 'pending' && t > chipAt;
      const pose = mode === 'flip' ? (t > cue + 0.6 ? 'cheer' : t > b.t0 + 1.4 ? 'point' : 'stand') : (shrug ? 'shrug' : 'stand');
      K.drawPerson(ctx, lx + 6, platY, 0.82, { t, pose, flip: side > 0, shirt: '#e0e6f0', pants: '#5d6f9e', skin: i === 1 ? 3 : 2, hair: i === 1 ? 2 : 1, hairStyle: i === 1 ? 'bun' : 'short', mood: shrug ? 'neutral' : 'happy', seed: 7 + i });
      cap(ctx, lx + 6, platY, 0.82, ACC);
      if (mode === 'pending') {
        // the new letter tile, held at the chest (waiting), later leaned on the rail
        const tileY = shrug ? platY - 30 : platY - 150 * 0.82 + K.bob(t, 3, 1.2);
        const tileXh = shrug ? lx + 48 * side : lx - 6;
        tile(ctx, K, H, tileXh, tileY, to[j] || '?', ACC, 0.7);
        if (t > chipAt - 0.2) {
          const cp = K.popIn(t, chipAt - 0.2, 0.5);
          if (cp > 0) calendar(ctx, K, H, lx - side * 52, platY - 18, cp * 0.6, ACC);
        }
      }
    } else if (mode === 'keep') {
      const walk = K.phase(t, b.t0 + 0.2, b.t0 + 2.6, smooth);
      const px = lerp(x - 520, x - 190, walk);
      const walking = walk > 0 && walk < 1;
      const shrug = t > cue + 0.2;
      K.drawPerson(ctx, px, 1015, 1.0, { t, pose: shrug ? 'shrug' : 'stand', walk: walking ? t : undefined, shirt: '#e0e6f0', pants: '#5d6f9e', skin: 4, hair: 0, hairStyle: 'curly', mood: shrug ? 'neutral' : 'happy', seed: 11 });
      cap(ctx, px, 1015, 1.0, ACC);
      // roller over the shoulder / leaning on the ground
      ctx.strokeStyle = '#3a3f58'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(px + 60, 1012); ctx.lineTo(px + 74, 880); ctx.stroke();
      H.roundRect(ctx, px + 50, 862, 52, 22, 8); ctx.fillStyle = '#f4efe2'; ctx.fill();
      if (tw.bubble && t > chipAt) {
        const bp = K.popIn(t, chipAt, 0.5);
        K.drawSpeechBubble(ctx, x + 40, 800, 1, { text: tw.bubble, size: 26, maxW: 300, tail: 'center', pop: bp });
      }
    }
  });
  ctx.restore();

  // ---------- screen-space overlays: pills, quote cards, chips
  // beat 1: cabinet pill + chip, then "Not required" over the private towers
  {
    const a = K.popIn(t, B(0).t0 + 0.25, 0.5) * (K.fadeOut(t, privateAt - 0.3, 0.4));
    if (a > 0 && gov.keep) K.drawLabel(ctx, 650, 600, a, { text: gov.keep, size: 28 });
    const c = K.popIn(t, keepAt, 0.45) * (K.fadeOut(t, privateAt - 0.3, 0.4));
    if (c > 0 && gov.keepChip) K.drawLabel(ctx, 760, 676, c, { text: gov.keepChip, size: 28, accent: true });
    const g = K.popIn(t, B(0).t0 + 0.4, 0.5) * (K.fadeOut(t, B(1).t0, 0.4));
    if (g > 0 && gov.label) K.drawLabel(ctx, SX(GOVX), SY(668), g, { text: gov.label, size: 28, dot: true });
    const pr = K.popIn(t, privateAt + 0.4, 0.5) * (K.fadeOut(t, B(1).t0 + 0.6, 0.4));
    if (pr > 0 && towers.length) K.drawLabel(ctx, SX(TX[0]), SY(520), pr, { text: P.privateLabel || 'Not required', size: 30, accent: true });
  }
  towers.forEach((tw, i) => {
    const b = B(i + 1);
    const qAtT = cueT(tw.quoteCue, cueT(tw.cue, b.t0 + (b.t1 - b.t0) * 0.45) - 0.4);
    const fade = K.fadeOut(t, b.t1 - 0.35, 0.35);
    const qp = K.popIn(t, Math.min(qAtT, b.t1 - 1.5), 0.5) * fade;
    if (qp > 0 && tw.quote) quoteCard(ctx, K, H, tw.quote, tw.by, qp, ACC);
    const chipAt = cueT(tw.chipCue, b.t0 + (b.t1 - b.t0) * 0.75);
    const cp = K.popIn(t, chipAt, 0.45) * fade;
    if (cp > 0 && tw.chip) K.drawLabel(ctx, 487, 1000 - 10, cp, { text: tw.chip, size: 30, accent: true });
  });
  // payoff: big letter board + question
  if (hasPayoff && t > payT0 + 0.6) {
    const bd = P.board || ['A', 'B'], rest = String(P.rest || '');
    const bp = K.popIn(t, payT0 + 0.8, 0.6);
    const settle = t >= qAt;
    const period = 1.1, ph = Math.max(0, t - payT0 - 1.2) / period;
    const k = Math.floor(ph), f = ph - k;
    let p = settle ? 1 : clamp((f - 0.6) / 0.4);
    const a0 = settle ? bd[Math.max(0, k) % 2] : bd[k % 2], a1 = settle ? '?' : bd[(k + 1) % 2];
    const sp = settle ? K.phase(t, qAt, qAt + 0.5) : p;
    ctx.save(); ctx.translate(487, 570); ctx.scale(bp * 1.7, bp * 1.7);
    // board: the flipping letter, then the fixed `rest` letters (72 px pitch); with rest "I" this is the original 2-tile board
    const nT = 1 + rest.length, bw = nT * 72 + 28, x0 = -(nT - 1) * 36;
    ctx.fillStyle = '#2a2f45'; H.roundRect(ctx, -bw / 2, -51, bw, 102, 14); ctx.fill();
    flipTile(ctx, K, H, x0, 0, a0, a1, sp, ACC);
    [...rest].forEach((c, j) => flipTile(ctx, K, H, x0 + 72 * (j + 1), 0, c, c, 0, ACC));
    ctx.restore();
    const q = K.popIn(t, qAt, 0.5);
    if (q > 0) K.drawLabel(ctx, 487, 770, q, { text: P.question || 'Old name or new?', size: 40, accent: true });
  }
}

// ---------------------------------------------------------------- helpers
function backdrop(ctx, K, H, t, cx) {
  const g = ctx.createLinearGradient(0, 0, 0, 1000); g.addColorStop(0, '#2e2f63'); g.addColorStop(1, '#d9826a');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1000);
  K.glow(ctx, 820, 470, 160, '#ffd9a0', 0.35);
  ctx.beginPath(); ctx.arc(820, 470, 46, 0, Math.PI * 2); ctx.fillStyle = '#ffe2b0'; ctx.fill();
  const layers = [['#4a4677', 0.12, 330], ['#363461', 0.25, 230]];
  layers.forEach(([col, par, hmax], L) => {
    const off = cx * par;
    for (let i = -2; i < 16; i++) {
      const wx = i * 150 - (off % 150) - Math.floor(off / 150) * 0, idx = i + Math.floor(off / 150);
      const w = 110 + 40 * H.hash(idx, 7 + L), h = 120 + hmax * H.hash(idx, 13 + L);
      ctx.fillStyle = col; ctx.fillRect(wx, 1000 - h, w, h);
      if (L === 1) for (let r = 0; r < Math.floor(h / 46); r++) for (let c = 0; c < 3; c++) {
        if (H.hash(idx * 31 + r * 7 + c, 99) > 0.7) { ctx.fillStyle = 'rgba(255,217,138,0.35)'; ctx.fillRect(wx + 14 + c * 32, 1000 - h + 16 + r * 46, 14, 18); }
      }
    }
  });
  ctx.fillStyle = '#3a3f5c'; ctx.fillRect(0, 1000, 1080, 40); ctx.fillStyle = '#4b5175'; ctx.fillRect(0, 1000, 1080, 8);
  const g2 = ctx.createLinearGradient(0, 1040, 0, 1920); g2.addColorStop(0, '#22263d'); g2.addColorStop(1, '#0d0f1c');
  ctx.fillStyle = g2; ctx.fillRect(0, 1040, 1080, 880);
}

function civic(ctx, K, x, y, label) {
  const W = 250, stone = '#cfc8b8', shade = '#a9a191';
  K.shadow(ctx, x, y, 300, 0.35);
  for (let i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? shade : stone; ctx.fillRect(x - W / 2 - 16 + i * 8, y - 12 - i * 12, W + 32 - i * 16, 12); }
  const top = 690, frieze = 742, colTop = 836, colBot = y - 36;
  ctx.fillStyle = '#7d7768'; ctx.fillRect(x - W / 2 + 12, colTop, W - 24, colBot - colTop);
  ctx.fillStyle = '#3a3346'; ctx.fillRect(x - 22, colBot - 70, 44, 70);
  ctx.fillStyle = 'rgba(255,220,150,0.55)'; ctx.fillRect(x - 18, colBot - 66, 16, 62); ctx.fillRect(x + 2, colBot - 66, 16, 62);
  for (let c = 0; c < 5; c++) {
    if (c === 2) continue;
    const cx = x - W / 2 + 22 + c * ((W - 44) / 4);
    ctx.fillStyle = stone; ctx.fillRect(cx - 11, colTop, 22, colBot - colTop);
    ctx.fillStyle = shade; ctx.fillRect(cx + 4, colTop, 7, colBot - colTop);
    ctx.fillStyle = stone; ctx.fillRect(cx - 15, colTop - 6, 30, 8); ctx.fillRect(cx - 15, colBot - 2, 30, 8);
  }
  ctx.fillStyle = stone; ctx.fillRect(x - W / 2, frieze, W, colTop - frieze);
  ctx.fillStyle = shade; ctx.fillRect(x - W / 2, colTop - 12, W, 12);
  ctx.beginPath(); ctx.moveTo(x - W / 2 - 12, frieze); ctx.lineTo(x, top - 10); ctx.lineTo(x + W / 2 + 12, frieze); ctx.closePath(); ctx.fillStyle = stone; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - W / 2 + 14, frieze - 6); ctx.lineTo(x, top + 6); ctx.lineTo(x + W / 2 - 14, frieze - 6); ctx.closePath(); ctx.fillStyle = shade; ctx.fill();
  ctx.font = K.font.ui(20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3d3a35'; ctx.fillText(label, x, frieze - 18);
  ctx.fillStyle = '#8d8676'; ctx.fillRect(x - W / 2 - 12, frieze - 2, W + 24, 5);
}

// letter-tile sign centred at (x, y): tiles 62x78 with 10 px gaps. flip < 0 = no flip.
function signScale(from) { const w = from.length * 72 - 10; return Math.min(1, 430 / (w + 28)); }
function signBoard(ctx, K, H, x, y, from, to, flip, ACC, o) {
  const n = from.length, w = n * 72 - 10, ss = signScale(from);
  ctx.save(); ctx.translate(x, y); ctx.scale(ss, ss); ctx.translate(-x, -y);
  const x0 = x - w / 2;
  ctx.fillStyle = '#2a2f45'; H.roundRect(ctx, x0 - 14, y - 51, w + 28, 102, 12); ctx.fill();
  ctx.fillStyle = '#4a5070'; ctx.fillRect(x - w / 4, y + 51, 8, 16); ctx.fillRect(x + w / 4 - 8, y + 51, 8, 16);
  for (let j = 0; j < n; j++) {
    const differs = from[j] !== to[j];
    const p = differs && flip >= 0 ? Math.min(1, flip) : 0;
    flipTile(ctx, K, H, x0 + j * 72 + 31, y, from[j], to[j], p, ACC, o.accentAll || (differs && p >= 0.5));
  }
  ctx.restore();
}
function flipTile(ctx, K, H, cx, cy, a, b, p, ACC, accentForce) {
  const showNew = p >= 0.5, sy = Math.abs(Math.cos(Math.PI * p));
  const acc = accentForce != null ? accentForce : showNew && a !== b;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(1, Math.max(0.04, sy));
  H.roundRect(ctx, -31, -39, 62, 78, 8); ctx.fillStyle = acc ? ACC : '#efe9da'; ctx.fill();
  ctx.font = K.font.display(54); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = acc ? K.ACCENT.deep : '#23263a'; ctx.fillText(showNew ? b : a, 0, 3);
  ctx.restore();
}
function tile(ctx, K, H, cx, cy, ch, ACC, s) {
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.rotate(-0.08);
  H.roundRect(ctx, -31, -39, 62, 78, 8); ctx.fillStyle = ACC; ctx.fill();
  ctx.font = K.font.display(54); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = K.ACCENT.deep; ctx.fillText(ch, 0, 3);
  ctx.restore();
}
function lift(ctx, H, x, ground, platY) {
  // scissor lift: cart, criss-cross arms, platform with rails
  ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(x, ground, 90, 10, 0, 0, Math.PI * 2); ctx.fill();
  H.roundRect(ctx, x - 75, ground - 40, 150, 30, 8); ctx.fillStyle = '#e0a83a'; ctx.fill();
  for (const wx of [-50, 50]) { ctx.beginPath(); ctx.arc(x + wx, ground - 10, 12, 0, Math.PI * 2); ctx.fillStyle = '#1c2033'; ctx.fill(); }
  const top = platY + 14, bot = ground - 40, segs = 4, hseg = (bot - top) / segs;
  ctx.strokeStyle = '#b8862c'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  for (let i = 0; i < segs; i++) {
    const y0 = bot - i * hseg, y1 = y0 - hseg;
    ctx.beginPath(); ctx.moveTo(x - 55, y0); ctx.lineTo(x + 55, y1); ctx.moveTo(x + 55, y0); ctx.lineTo(x - 55, y1); ctx.stroke();
  }
  H.roundRect(ctx, x - 80, platY, 160, 16, 5); ctx.fillStyle = '#e0a83a'; ctx.fill();
  ctx.strokeStyle = '#c99630'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(x - 76, platY); ctx.lineTo(x - 76, platY - 70); ctx.lineTo(x + 76, platY - 70); ctx.lineTo(x + 76, platY); ctx.stroke();
}
function cap(ctx, x, feet, s, ACC) {
  const headY = feet + (-104 - 64 - 44) * s;
  ctx.fillStyle = ACC; ctx.beginPath(); ctx.ellipse(x, headY - 26 * s, 34 * s, 16 * s, 0, Math.PI, 0); ctx.fill();
}
function calendar(ctx, K, H, x, y, s, ACC) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  H.roundRect(ctx, -55, -60, 110, 110, 12); ctx.fillStyle = '#f2f4fa'; ctx.fill();
  H.roundRect(ctx, -55, -60, 110, 30, 12); ctx.fillStyle = '#ff6b5e'; ctx.fill(); ctx.fillRect(-55, -42, 110, 12);
  ctx.fillStyle = '#2a2f45'; ctx.fillRect(-30, -70, 8, 20); ctx.fillRect(22, -70, 8, 20);
  ctx.font = K.font.display(60); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#23263a'; ctx.fillText('?', 0, 14);
  ctx.restore();
}
function burst(ctx, H, x, y, u, ACC) {
  ctx.save(); ctx.strokeStyle = H.rgba(ACC, 1 - u); ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, r0 = 70 + 140 * u, r1 = r0 + 30; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r0 * 1.8, y + Math.sin(a) * r0); ctx.lineTo(x + Math.cos(a) * r1 * 1.8, y + Math.sin(a) * r1); ctx.stroke(); }
  ctx.restore();
}
// quote card in the top of the stage (y ~432-590): verbatim words + attribution
function quoteCard(ctx, K, H, text, by, p, ACC) {
  const q = '“' + text + '”';
  let size = 40; ctx.font = K.font.bold(size);
  const maxW = 720;
  let lines = H.wrap(ctx, q, 'bold', size, maxW);
  while ((lines.length > 2 || Math.max(...lines.map((l) => ctx.measureText(l).width)) > maxW) && size > 28) { size -= 2; ctx.font = K.font.bold(size); lines = H.wrap(ctx, q, 'bold', size, maxW); }
  const bh = lines.length * size * 1.15 + 74, top = 436;
  ctx.save(); ctx.globalAlpha = Math.min(1, p); ctx.translate(487, top + bh / 2); ctx.scale(0.9 + 0.1 * p, 0.9 + 0.1 * p); ctx.translate(-487, -(top + bh / 2));
  H.roundRect(ctx, 487 - 410, top, 820, bh, 22); ctx.fillStyle = 'rgba(12,14,26,0.97)'; ctx.fill();
  ctx.fillStyle = ACC; H.roundRect(ctx, 487 - 410, top + 16, 8, bh - 32, 4); ctx.fill();
  ctx.font = K.font.bold(size); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#ffffff';
  lines.forEach((l, i) => ctx.fillText(l, 487, top + 18 + size * 0.95 + i * size * 1.15));
  ctx.font = K.font.ui(24); ctx.fillStyle = 'rgba(255,255,255,0.72)';
  ctx.fillText(by || '', 487, top + bh - 18);
  ctx.restore();
}
