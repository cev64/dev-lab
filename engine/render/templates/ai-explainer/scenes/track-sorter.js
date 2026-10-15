// Scene "track-sorter" (full frame, best as a 2-beat span). Night sorting room: a cartoon music partner tosses song
// cards into three bins (FULLY / PARTLY / NO + "GEN AI"), each bin lighting up on its cue. A hovering detector robot
// arrives, scans an untagged "?" card and tags it itself, then drops it in a bin. Beat 2: a pitch-correction panel
// (jagged pitch line straightens) and an "AI mastering" slider panel pop up, fly into the NO bin, check stamp lands.
// Fits: AI disclosure categories, self-declaration vs detection, "what counts as AI" rules.
// params: bins ([["FULLY","GEN AI"],["PARTLY","GEN AI"],["NO","GEN AI"]]), partner ("Partner"), head1, head2, head3,
//         panelA ("Pitch correction"), panelB ("AI mastering"), stamp ("NO GEN AI"), selfBin (0),
//         detectLabel ("Detection tools"), tagged ("Labeled by YouTube"), untagged ("No label  ?")
//         cues: partnerCue, fullyCue, partlyCue, noCue, scanCue, nothingCue, selfCue, autoCue, masterCue, bothCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const at = (w, d, n = 0) => { const v = w ? info.timeOf(w, n) : null; return v == null ? d : v; };
  const b2 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.6;
  const T = {
    partner: at(P.partnerCue || 'partners', 0.4), fully: at(P.fullyCue || 'fully', 2.4), partly: at(P.partlyCue || 'partly', 4),
    no: at(P.noCue || 'no', 5.4), scan: at(P.scanCue || 'detection', 9.3), nothing: at(P.nothingCue || 'nothing', 11.7),
    self: at(P.selfCue || 'itself', 13.6), auto: at(P.autoCue || 'Auto-Tune', b2 + 1.1), master: at(P.masterCue || 'mastering', b2 + 4.9),
    both: at(P.bothCue || 'Both', b2 + 6.1),
  };
  const BIN = [330, 550, 770], BY = 905, BW = 186;
  const bins = P.bins || [['FULLY', 'GEN AI'], ['PARTLY', 'GEN AI'], ['NO', 'GEN AI']];
  const binHit = [T.fully + 0.5, T.partly + 0.5, T.no + 0.5];

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 487, y: 760 }, { t: b2 - 0.5, zoom: 1.0, x: 487, y: 735 }, { t: D, zoom: 1.04, x: 487, y: 740 }]);
  K.world.room(ctx, { t, time: 'night', window: false, lamp: false, picture: false, plant: false });
  // shelves of records on the back wall (texture)
  for (let r = 0; r < 2; r++) {
    const sy = 610 + r * 120;
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(60, sy, 960, 10);
    for (let k = 0; k < 26; k++) { const x = 80 + k * 36 + H.hash(k, r) * 8, h = 60 + 30 * H.hash(k, r + 3); H.roundRect(ctx, x, sy - h, 26, h, 4); ctx.fillStyle = H.mixHex('#3b4260', ['#6f86e0', '#e8786a', '#4fb3a6', '#a08be0'][k % 4], 0.35); ctx.fill(); }
  }
  ctx.fillStyle = 'rgba(5,7,16,0.22)'; ctx.fillRect(0, 0, 1080, 1920);
  K.glow(ctx, 520, 900, 520, '#8fa0ff', 0.12);

  // bins
  bins.forEach((b, i) => {
    const x = BIN[i], hit = t - binHit[i], lit = smooth(hit / 0.4) * (i === 2 && t > T.both ? 1 : 1);
    const bounce = hit > 0 && hit < 0.5 ? Math.sin(hit / 0.5 * Math.PI) * 10 : 0;
    ctx.save(); ctx.translate(x, BY + bounce);
    K.shadow(ctx, 0, 1035 - BY, 200);
    // cards peeking out
    const n = cardsIn(i);
    for (let k = 0; k < n; k++) { ctx.save(); ctx.translate(-40 + k * 34, -14 - (k % 2) * 10); ctx.rotate(-0.2 + k * 0.18); songCard(ctx, 0, 0, 0.62, k === 0 ? kindOf(i) : (i === 2 ? 'human' : kindOf(i))); ctx.restore(); }
    ctx.beginPath(); ctx.moveTo(-BW / 2, 0); ctx.lineTo(BW / 2, 0); ctx.lineTo(BW / 2 - 16, 130); ctx.lineTo(-BW / 2 + 16, 130); ctx.closePath();
    ctx.fillStyle = H.mixHex('#2a2f45', i === 0 ? ACC : i === 1 ? '#8fd0ff' : '#dfe4f1', 0.15 + 0.55 * lit); ctx.fill();
    ctx.strokeStyle = H.mixHex('#3b4260', '#ffffff', 0.3 * lit); ctx.lineWidth = 4; ctx.stroke();
    H.roundRect(ctx, -BW / 2 - 6, -10, BW + 12, 18, 8); ctx.fillStyle = '#3b4260'; ctx.fill();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = K.font.display(b[0].length > 5 ? 32 : 38); ctx.fillStyle = lit > 0.5 ? '#161927' : '#ffffff'; ctx.fillText(b[0], 0, 52);
    ctx.font = K.font.ui(24); ctx.fillStyle = lit > 0.5 ? 'rgba(22,25,39,0.8)' : 'rgba(255,255,255,0.7)'; ctx.fillText(b[1], 0, 92);
    ctx.restore();
    if (lit > 0 && hit < 1.2) K.glow(ctx, x, BY + 40, 150, ACC, 0.3 * (1 - clamp((hit - 0.4) / 0.8)));
  });

  // partner (left)
  const throwing = [T.fully, T.partly, T.no].some((c) => t > c - 0.5 && t < c + 0.4);
  K.drawPerson(ctx, 160, 1038, 1.4, { t, pose: throwing ? 'point' : 'stand', mood: 'happy', skin: 3, hair: 4, hairStyle: 'bun', shirt: '#e8786a', look: 0.6, talk: 0, seed: 2 });
  const pl = K.popIn(t, T.partner, 0.4);
  if (pl > 0) K.drawLabel(ctx, 165, 690, Math.min(1, pl), { text: P.partner || 'Partner', size: 24, dot: true });

  // tossed cards (partner -> bins)
  [[T.fully, 0, 'ai'], [T.partly, 1, 'part'], [T.no, 2, 'human']].forEach(([c, i, kind]) => {
    const u = clamp((t - (c - 0.35)) / 0.85);
    if (u <= 0 || u >= 1) return;
    const x = lerp(225, BIN[i], u), y = lerp(840, BY - 10, u) - Math.sin(u * Math.PI) * (300 + i * 40);
    ctx.save(); ctx.translate(x, y); ctx.rotate(u * 6.28 * 0.5); songCard(ctx, 0, 0, 0.9, kind); ctx.restore();
  });

  // detector robot (hovers in from the right)
  const ra = easeOutCubic(clamp((t - (T.scan - 0.7)) / 0.9));
  if (ra > 0) {
    const rx = lerp(1180, 790, ra), ry = 640 + Math.sin(t * 2.2) * 8;
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(rx, ry + 10, 4, rx, ry + 10, 70); g.addColorStop(0, H.rgba(ACC, 0.5)); g.addColorStop(1, H.rgba(ACC, 0));
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(rx, ry + 12, 70, 24, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    const scanning = t > T.nothing + 0.3 && t < T.self + 0.3;
    K.drawRobot(ctx, rx, ry, 0.85, { t, state: scanning ? 'working' : (t > T.self ? 'happy' : 'thinking'), flip: true, seed: 6 });
    const dl = K.popIn(t, T.scan + 0.2, 0.4);
    if (dl > 0 && t < b2 + 0.3) { ctx.globalAlpha = 1 - smooth((t - b2) / 0.3); K.drawLabel(ctx, 790, 438, Math.min(1, dl), { text: P.detectLabel || 'Detection tools', size: 24, accent: true }); ctx.globalAlpha = 1; }
    // mystery card: appears, gets scanned, tagged, dropped into a bin
    const mp = K.popIn(t, T.nothing, 0.45);
    if (mp > 0) {
      const sb = P.selfBin == null ? 0 : P.selfBin;
      const du = clamp((t - (T.self + 0.6)) / 0.8);
      if (du < 1) {
        const mx = lerp(540, BIN[sb], easeOutCubic(du)), my = lerp(700, BY - 10, du * du) - Math.sin(du * Math.PI) * 60;
        if (scanning) {
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          const sweep = Math.sin((t - T.nothing) * 5) * 30;
          ctx.fillStyle = H.rgba(ACC, 0.22); ctx.beginPath(); ctx.moveTo(rx - 30, ry - 150); ctx.lineTo(mx + 60, my - 70 + sweep); ctx.lineTo(mx + 60, my + 70 + sweep); ctx.closePath(); ctx.fill();
          ctx.restore();
        }
        ctx.save(); ctx.translate(mx, my); ctx.scale(Math.min(1, mp), Math.min(1, mp)); songCard(ctx, 0, 0, 1.1, t > T.self ? 'ai' : 'blank'); ctx.restore();
        // tag
        const tagged = t > T.self;
        const tp = tagged ? K.popIn(t, T.self, 0.4) : 1;
        if (du < 0.7) {
          ctx.save(); ctx.globalAlpha = 1 - smooth((du - 0.3) / 0.4);
          K.drawLabel(ctx, mx, my - 72, Math.min(1, mp) * Math.min(1.05, tp), tagged ? { text: P.tagged || 'Labeled by YouTube', size: 22, accent: true } : { text: P.untagged || 'No label  ?', size: 22 });
          ctx.restore();
        }
      }
    }
  }

  // header pill
  const hp = K.popIn(t, 0.2, 0.45);
  if (t < b2) {
    const txt = t < T.scan ? (P.head1 || 'Partners declare AI use') : (P.head2 || 'YouTube checks too');
    const sw = Math.abs(t - T.scan) < 0.25 ? 1 - Math.abs(t - T.scan) / 0.25 : 0;
    if (hp > 0) K.drawLabel(ctx, 487, 532, Math.min(1, hp) * (1 - 0.3 * sw), { text: txt, size: 30 });
  } else {
    const hp2 = K.popIn(t, b2 + 0.1, 0.45);
    if (hp2 > 0) K.drawLabel(ctx, 487, 532, Math.min(1, hp2), { text: P.head3 || "Doesn't count as AI", size: 32, accent: true });
  }

  // beat 2 panels (fly into the NO bin)
  panel(T.auto, T.master - 0.6, 'pitch', P.panelA || 'Pitch correction', 400);
  panel(T.master, T.both, 'master', P.panelB || 'AI mastering', 574);
  if (t > T.both + 0.6) K.drawStamp(ctx, BIN[2] + 10, 878, 0.62, { kind: 'check', text: P.stamp || 'NO GEN AI', land: (t - T.both - 0.6) / 0.5 });
  ctx.restore();

  // ---- helpers
  function cardsIn(i) {
    let n = t > binHit[i] ? 1 : 0;
    if (i === 0 && t > T.self + 1.4 && (P.selfBin || 0) === 0) n++;
    if (i === (P.selfBin || 0) && i !== 0 && t > T.self + 1.4) n++;
    if (i === 2) { if (t > T.master - 0.2) n++; if (t > T.both + 0.6) n++; }
    return Math.min(3, n);
  }
  function kindOf(i) { return i === 0 ? 'ai' : i === 1 ? 'part' : 'human'; }
  function panel(t0, tFly, kind, title, x0) {
    const p = K.popIn(t, t0, 0.45);
    if (p <= 0) return;
    const fu = clamp((t - tFly) / 0.8);
    if (fu >= 1) return;
    const e = easeOutCubic(fu);
    const cx = lerp(487, BIN[2], e), cy = lerp(kind === 'pitch' ? 700 : 700, BY - 20, e) - Math.sin(fu * Math.PI) * 80;
    const s = Math.min(1, p) * lerp(1, 0.25, e);
    const w = 400, h = 210;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s);
    H.roundRect(ctx, -w / 2, -h / 2, w, h, 26); ctx.fillStyle = '#1c2033'; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.font = K.font.ui(28); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
    ctx.fillText(title, 0, -h / 2 + 36);
    const lt = t - t0;
    if (kind === 'pitch') {
      const fix = smooth((lt - 0.6) / 1.4);
      ctx.strokeStyle = H.mixHex('#ff6b5e', ACC, fix); ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let k = 0; k <= 40; k++) {
        const x = -160 + k * 8, jag = (H.hash(k, 11) - 0.5) * 44 * (1 - fix), y = 30 + Math.sin(k * 0.35 + lt * 2) * 22 + jag;
        if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // knob
      ctx.beginPath(); ctx.arc(150, -h / 2 + 36, 18, 0, Math.PI * 2); ctx.fillStyle = '#3b4260'; ctx.fill();
      const a = -2.2 + 2.6 * fix; ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(150, -h / 2 + 36); ctx.lineTo(150 + Math.cos(a) * 14, -h / 2 + 36 + Math.sin(a) * 14); ctx.stroke();
    } else {
      for (let k = 0; k < 6; k++) {
        const x = -150 + k * 60;
        H.roundRect(ctx, x - 4, -30, 8, 110, 4); ctx.fillStyle = '#3b4260'; ctx.fill();
        const v = 0.5 + 0.35 * Math.sin(lt * 2.4 + k * 1.3) * (1 - smooth((lt - 1.2) / 0.6)) + (k % 2 ? 0.05 : -0.05);
        const yy = 80 - v * 110;
        H.roundRect(ctx, x - 20, yy - 10, 40, 20, 6); ctx.fillStyle = k === 2 ? ACC : '#dfe4f1'; ctx.fill();
      }
    }
    ctx.restore();
    void x0;
  }
  function songCard(c, x, y, s, kind) {
    c.save(); c.translate(x, y); c.scale(s, s);
    const base = kind === 'ai' ? ACC : kind === 'part' ? '#8fd0ff' : kind === 'blank' ? '#5b6380' : '#f2f4fa';
    H.roundRect(c, -50, -50, 100, 100, 16); c.fillStyle = base; c.fill();
    if (kind === 'part') { c.save(); H.roundRect(c, -50, -50, 100, 100, 16); c.clip(); c.fillStyle = ACC; c.beginPath(); c.moveTo(-50, -50); c.lineTo(50, -50); c.lineTo(-50, 50); c.closePath(); c.fill(); c.restore(); }
    const ink = kind === 'blank' ? '#dfe4f1' : '#161927';
    if (kind === 'blank') {
      c.font = K.font.display(58); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = ink; c.fillText('?', 0, 4);
    } else if (kind === 'ai') {
      // little robot face
      H.roundRect(c, -30, -26, 60, 46, 12); c.fillStyle = '#ffffff'; c.fill();
      H.roundRect(c, -22, -16, 44, 22, 8); c.fillStyle = '#161927'; c.fill();
      c.fillStyle = ACC; c.fillRect(-14, -9, 8, 8); c.fillRect(6, -9, 8, 8);
      c.fillStyle = '#161927'; c.font = K.font.ui(18); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('AI', 0, 36);
    } else {
      // music note
      c.fillStyle = ink; c.strokeStyle = ink; c.lineWidth = 7; c.lineCap = 'round';
      c.beginPath(); c.moveTo(-4, 22); c.lineTo(-4, -26); c.lineTo(22, -32); c.lineTo(22, 14); c.stroke();
      c.beginPath(); c.ellipse(-14, 24, 12, 9, -0.4, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.ellipse(12, 16, 12, 9, -0.4, 0, Math.PI * 2); c.fill();
    }
    c.restore();
  }
}
