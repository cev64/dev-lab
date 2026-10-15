// Scene "fab-trophies" (full frame). Night: a generic chip foundry (sawtooth roof, clean-air vents, lit windows, a
// facade sign) under a floating "record" shelf of trophies. Generic buildings and cartoon people only, no logos.
// modes: "intro"  (best as a 2-beat span) 5 trophies on the shelf; at againCue a 6th drops in with a burst; then a date
//                 pill (dateCue), a name pill (nameCue), chip crates arc from the fab to two client buildings with name
//                 pills (shipCue), and the shelf flashes with an "N in a row" pill (sixCue).
//        "caveat" 6 trophies + an empty 7th slot with "?"; order slips arc from client buildings into the fab and slow
//                 down; question pill (askCue) and a "Not stock advice" pill (adviceCue); the worker shrugs.
//        "payoff" camera pushes to the shelf, trophies gleam, a question card lands at qCue with two options.
// params: mode, sign, records (5 -> 6), shelfTitle, date, name, clients [a, b], rowText, ask, advice, question, options
//         cues: againCue, dateCue, nameCue, shipCue, sixCue, askCue, adviceCue, qCue (fallbacks: fractions of D)
// Fits: "record quarter / Nth record in a row" money stories about a factory or maker.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent, mode = P.mode || 'intro';
  const cue = (w, fb) => { const v = w != null ? info.timeOf(w) : null; return v != null ? v : fb; };

  const intro = mode === 'intro', caveat = mode === 'caveat', payoff = mode === 'payoff';
  const againAt = cue(P.againCue, Math.min(3.2, D * 0.2));
  const b1 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.25;
  const dateAt = cue(P.dateCue, b1 + 0.2), nameAt = cue(P.nameCue, b1 + 1.6);
  const shipAt = cue(P.shipCue, D * 0.6), sixAt = cue(P.sixCue, D * 0.85);
  const askAt = cue(P.askCue, 0.3), adviceAt = cue(P.adviceCue, D * 0.55), qAt = cue(P.qCue, D * 0.45);

  ctx.save();
  if (intro) K.camera(ctx, t, [{ t: 0, zoom: 1.14, x: 487, y: 860 }, { t: Math.max(againAt - 0.4, 0.5), zoom: 1.08, x: 487, y: 760 }, { t: againAt + 1.6, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.02, x: 487, y: 735 }]);
  else if (caveat) K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.04, x: 487, y: 740 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 487, y: 700 }]);

  // ---- night sky + ground
  const g = ctx.createLinearGradient(0, 0, 0, 1000); g.addColorStop(0, '#0b1030'); g.addColorStop(0.65, '#1c2350'); g.addColorStop(1, '#2d2d5e');
  ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, 1220);
  for (let i = 0; i < 40; i++) { const tw = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.7); ctx.fillStyle = H.rgba('#ffffff', 0.15 + 0.35 * tw * H.hash(i, 9)); ctx.beginPath(); ctx.arc(-60 + H.hash(i, 1) * 1200, 120 + H.hash(i, 2) * 560, 1.5 + 1.5 * H.hash(i, 3), 0, Math.PI * 2); ctx.fill(); }
  for (let i = 0; i < 13; i++) { const w = 60 + 50 * H.hash(i, 3), h = 70 + 150 * H.hash(i, 7); ctx.fillStyle = '#191d40'; ctx.fillRect(-60 + i * 95, 1000 - h, w, h); }
  ctx.fillStyle = '#262a50'; ctx.fillRect(-200, 1000, 1480, 30);
  const gg = ctx.createLinearGradient(0, 1030, 0, 1920); gg.addColorStop(0, '#141631'); gg.addColorStop(1, '#07080f');
  ctx.fillStyle = gg; ctx.fillRect(-200, 1030, 1480, 1000);

  // ---- client buildings (left / right)
  const clients = P.clients || ['Client A', 'Client B'];
  const showClients = intro ? K.phase(t, shipAt - 0.6, shipAt + 0.2, H.easeOutCubic) : 1;
  const CL = [{ x: 140, c: '#4f6aa8' }, { x: 835, c: '#4f8f8a' }];
  if (showClients > 0) {
    CL.forEach((b, i) => {
      ctx.save(); ctx.beginPath(); ctx.rect(-200, -200, 1480, 1230); ctx.clip();
      K.drawBuilding(ctx, b.x, 1020 + (1 - showClients) * 240, 0.56, { t, color: b.c, floors: 5, lit: 0.55, label: '' });
      ctx.restore();
    });
  }

  // ---- the fab
  const fabX = 487, fabY = 1020, fs = 1.05;
  fab(ctx, H, K, ACC, fabX, fabY, fs, { t, lit: 0.8, sign: P.sign || 'CHIP FOUNDRY', glow: intro ? 0.5 + 0.5 * K.phase(t, againAt, againAt + 0.6) : 1 });

  // crates of chips arcing from the fab to both clients (intro), or order slips arcing into the fab (caveat)
  if (intro && t > shipAt) {
    for (let k = 0; k < 2; k++) {
      const tx = CL[k].x, ty = 925;
      for (let i = 0; i < 9; i++) {
        const st = shipAt + 0.15 + i * 0.55 + k * 0.27, u = (t - st) / 1.1;
        if (u <= 0 || u >= 1) continue;
        const x = lerp(fabX + (k ? 90 : -90), tx, u), y = lerp(760, ty, u) - Math.sin(u * Math.PI) * 150;
        chip(ctx, H, ACC, x, y, 22, u * 3 + i);
      }
    }
  }
  if (caveat) {
    for (let k = 0; k < 2; k++) {
      for (let i = 0; i < 14; i++) {
        // slips get further apart over time: the pace slows
        const st = 0.2 + i * (0.45 + i * 0.09) + k * 0.25, u = (t - st) / 1.2;
        if (u <= 0 || u >= 1) continue;
        const x = lerp(CL[k].x, fabX + (k ? 70 : -70), u), y = lerp(860, 800, u) - Math.sin(u * Math.PI) * 130;
        slip(ctx, H, x, y, 0.8, u * 2 - 1);
      }
    }
  }

  // client name pills (drawn over the flying crates)
  if (showClients > 0 && !payoff) CL.forEach((b, i) => {
    const lp = intro ? K.popIn(t, shipAt, 0.4) : 1;
    if (lp > 0) K.drawLabel(ctx, b.x + (caveat ? (i ? -8 : 8) : 0), 812, lp, { text: caveat ? (P.buyer || 'AI companies') : clients[i], size: caveat ? 22 : 26 });
  });

  // ---- worker in a clean-room suit
  const cheer = intro && ((t > againAt && t < againAt + 1.6) || (t > sixAt && t < sixAt + 1.8));
  const shrug = caveat && t > askAt + 0.3;
  K.drawPerson(ctx, 712, 1040, 1.05, { t, pose: cheer ? 'cheer' : (shrug ? 'shrug' : 'stand'), mood: cheer ? 'happy' : (shrug ? 'worried' : 'neutral'), shirt: '#e8ecf7', hairStyle: 'none', skin: 2, seed: 7, look: -0.4, flip: true });

  ctx.restore(); // camera

  // ---- trophy shelf (screen space, stays put)
  const slots = intro ? 6 : 7;
  const sx0 = 105, sx1 = 870, shelfY = 640;
  const shelfIn = intro ? K.phase(t, 0, 0.6) : 1;
  ctx.save(); ctx.globalAlpha = shelfIn;
  H.roundRect(ctx, sx0 - 10, 445, sx1 - sx0 + 20, 220, 22); ctx.fillStyle = 'rgba(8,10,24,0.78)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = H.rgba(ACC, 0.35); ctx.stroke();
  ctx.font = K.font.ui(24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = H.rgba('#ffffff', 0.75);
  ctx.fillText(P.shelfTitle || 'RECORD-PROFIT QUARTERS', 487, 478);
  H.roundRect(ctx, sx0 + 10, shelfY - 6, sx1 - sx0 - 20, 14, 7); ctx.fillStyle = '#6b5a3a'; ctx.fill();
  const step = (sx1 - sx0 - 40) / slots;
  const flash = intro ? K.phase(t, sixAt, sixAt + 0.4) * (1 - K.phase(t, sixAt + 1.2, sixAt + 2.2)) : 0;
  const gleam = payoff ? K.phase(t, 0.3, 1.2) : 0;
  for (let i = 0; i < slots; i++) {
    const x = sx0 + 20 + step * (i + 0.5);
    if (i === 5 && intro) {
      // the new trophy drops in on "again"
      const u = clamp((t - (againAt - 0.45)) / 0.45);
      if (u <= 0) { slotOutline(ctx, H, x, shelfY, 0.5 + 0.5 * Math.sin(t * 5)); continue; }
      const y = u < 1 ? lerp(300, shelfY, u * u) : shelfY - Math.abs(Math.sin((t - againAt) * 10)) * 26 * Math.exp(-(t - againAt) * 4);
      trophy(ctx, H, K, ACC, x, y, 1.0, { shine: 1, t, n: i + 1 });
      if (t > againAt && t < againAt + 0.9) {
        const b = (t - againAt) / 0.9;
        for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, r = 40 + 110 * H.easeOutCubic(b); ctx.fillStyle = H.rgba(k % 2 ? ACC : '#ffffff', 1 - b); ctx.beginPath(); ctx.arc(x + Math.cos(a) * r, shelfY - 60 + Math.sin(a) * r, 6 * (1 - b) + 2, 0, Math.PI * 2); ctx.fill(); }
        K.glow(ctx, x, shelfY - 60, 160, ACC, 0.5 * (1 - b));
      }
      continue;
    }
    if (i === 6) { // empty 7th slot (caveat / payoff)
      slotOutline(ctx, H, x, shelfY, 0.6 + 0.4 * Math.sin(t * 4));
      ctx.font = K.font.display(54); ctx.fillStyle = H.rgba(ACC, 0.7 + 0.3 * Math.sin(t * 4)); ctx.textAlign = 'center'; ctx.fillText('?', x, shelfY - 52);
      continue;
    }
    const wig = flash > 0 ? Math.sin(t * 18 - i) * 4 * flash : 0;
    const sh = intro ? 0.35 + 0.65 * Math.max(flash, 0.5 + 0.5 * Math.sin(t * 1.3 - i * 0.6)) : 0.6 + 0.4 * Math.max(gleam * Math.max(0, Math.sin(t * 3 - i * 0.8)), 0);
    trophy(ctx, H, K, ACC, x, shelfY - Math.max(0, wig), slots > 6 ? 0.78 : 1.0, { shine: sh, t, n: i + 1 });
  }
  ctx.restore();

  // ---- pills between shelf and fab (y ~ 740)
  if (intro) {
    const dIn = K.popIn(t, dateAt, 0.4), dOut = K.phase(t, nameAt - 0.25, nameAt);
    if (dIn > 0 && dOut < 1) { ctx.save(); ctx.globalAlpha = 1 - dOut; K.drawLabel(ctx, 487, 745 - 20 * dOut, dIn, { text: P.date || 'Oct 15 · Q3 results', size: 28, dot: true }); ctx.restore(); }
    const nIn = K.popIn(t, nameAt, 0.4), nOut = K.phase(t, sixAt - 0.25, sixAt);
    if (nIn > 0 && nOut < 1) { ctx.save(); ctx.globalAlpha = 1 - nOut; K.drawLabel(ctx, 487, 745, nIn, { text: P.name || 'Chipmaker', size: 28 }); ctx.restore(); }
    const rIn = K.popIn(t, sixAt, 0.45);
    if (rIn > 0) K.drawLabel(ctx, 487, 750, rIn, { text: P.rowText || '6 in a row', size: 34, accent: true });
  }
  if (caveat) {
    const aIn = K.popIn(t, askAt, 0.45), aOut = K.phase(t, adviceAt - 0.3, adviceAt);
    if (aIn > 0 && aOut < 1) { ctx.save(); ctx.globalAlpha = 1 - aOut; K.drawLabel(ctx, 487, 748, aIn, { text: P.ask || 'How long will this pace last?', size: 30, dot: true }); ctx.restore(); }
    const vIn = K.popIn(t, adviceAt, 0.45);
    if (vIn > 0) {
      ctx.save(); ctx.translate(487, 748); ctx.scale(vIn, vIn);
      ctx.font = K.font.bold(32); const txt = P.advice || 'Not stock advice'; const w = ctx.measureText(txt).width + 120;
      H.roundRect(ctx, -w / 2, -64, w, 64, 32); ctx.fillStyle = '#ff5d5d'; ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-w / 2 + 40, -32, 17, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ff5d5d'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-w / 2 + 29, -21); ctx.lineTo(-w / 2 + 51, -43); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(txt, -w / 2 + 72, -31);
      ctx.restore();
    }
  }
  if (payoff) {
    const r6 = K.popIn(t, 0.2, 0.45), qIn = K.popIn(t, qAt, 0.5);
    if (r6 > 0 && qIn < 0.3) K.drawLabel(ctx, 487, 750, r6, { text: P.rowText || '6 in a row', size: 34, accent: true });
    if (qIn > 0) {
      ctx.save(); ctx.translate(487, 860); ctx.scale(qIn, qIn);
      H.roundRect(ctx, -400, -190, 800, 230, 30); ctx.fillStyle = 'rgba(240,242,252,0.97)'; ctx.fill();
      ctx.fillStyle = '#1a1d33'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const q = P.question || 'A boom that lasts, or a peak?';
      const ft = H.fitText(ctx, q, 'display', 46, 28, 720); ctx.font = ft.font; ctx.fillText(q, 0, -125);
      const opts = P.options || ['LASTS', 'PEAK'];
      opts.forEach((o, i) => {
        const ox = i ? 170 : -170, op = K.popIn(t, qAt + 0.35 + i * 0.2, 0.4);
        if (op <= 0) return;
        ctx.save(); ctx.translate(ox, -35); ctx.scale(op, op);
        H.roundRect(ctx, -140, -40, 280, 80, 40); ctx.fillStyle = i ? '#2a2f55' : ACC; ctx.fill();
        ctx.fillStyle = i ? '#ffffff' : '#1a1d33'; ctx.font = K.font.display(32); ctx.fillText(o, 0, 3);
        ctx.restore();
      });
      ctx.restore();
    }
  }
}

function fab(ctx, H, K, ACC, x, y, s, o) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.shadow(ctx, 0, 0, 460, 0.4);
  const W = 420, Hh = 210, base = '#6c7fb8', shade = H.mixHex(base, '#000000', 0.3);
  H.roundRect(ctx, -W / 2, -Hh, W, Hh, 10); ctx.fillStyle = base; ctx.fill();
  ctx.fillStyle = shade; ctx.fillRect(W / 2 - 110, -Hh, 110, Hh);
  ctx.fillStyle = H.mixHex(base, '#ffffff', 0.15);
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-W / 2 + i * 70, -Hh); ctx.lineTo(-W / 2 + i * 70 + 70, -Hh); ctx.lineTo(-W / 2 + i * 70 + 70, -Hh - 40); ctx.closePath(); ctx.fill(); }
  for (let i = 0; i < 3; i++) {
    H.roundRect(ctx, -150 + i * 110, -Hh - 70, 40, 34, 6); ctx.fillStyle = shade; ctx.fill();
    // clean-air puffs
    for (let k = 0; k < 2; k++) { const u = ((o.t * 0.5 + k * 0.5 + i * 0.3) % 1); ctx.fillStyle = H.rgba('#cfd6ff', 0.18 * (1 - u)); ctx.beginPath(); ctx.arc(-130 + i * 110, -Hh - 80 - u * 60, 12 + u * 16, 0, Math.PI * 2); ctx.fill(); }
  }
  for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) {
    if (r === 1 && (c === 2 || c === 3)) continue;
    const on = H.hash(c + r * 7, Math.floor(o.t * 0.7)) < o.lit;
    H.roundRect(ctx, -185 + c * 62, -Hh + 76 + r * 64, 42, 42, 5);
    ctx.fillStyle = on ? H.rgba('#ffe7a8', 0.9) : '#1c2140'; ctx.fill();
  }
  H.roundRect(ctx, -46, -84, 92, 84, 6); ctx.fillStyle = '#1c2033'; ctx.fill();
  ctx.fillStyle = H.rgba(ACC, 0.35 + 0.3 * Math.sin(o.t * 3)); ctx.fillRect(-46, -84, 92, 6);
  // facade sign
  H.roundRect(ctx, -150, -Hh + 14, 300, 50, 12); ctx.fillStyle = '#0d0f1e'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(ACC, 0.4 + 0.6 * o.glow); ctx.stroke();
  K.glow(ctx, 0, -Hh + 39, 180, ACC, 0.18 * o.glow);
  ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const ft = H.fitText(ctx, o.sign, 'display', 28, 18, 270); ctx.font = ft.font; ctx.fillText(o.sign, 0, -Hh + 40);
  ctx.restore();
}

function trophy(ctx, H, K, ACC, x, y, s, o) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const gold = ACC, deep = H.mixHex(ACC, '#000000', 0.35), light = H.mixHex(ACC, '#ffffff', 0.45);
  if (o.shine > 0.2) K.glow(ctx, 0, -60, 70, ACC, 0.25 * o.shine);
  H.roundRect(ctx, -30, -18, 60, 18, 4); ctx.fillStyle = '#3a3550'; ctx.fill();
  ctx.fillStyle = deep; ctx.fillRect(-8, -40, 16, 22);
  ctx.beginPath(); ctx.moveTo(-34, -110); ctx.lineTo(34, -110); ctx.quadraticCurveTo(32, -50, 0, -40); ctx.quadraticCurveTo(-32, -50, -34, -110); ctx.closePath();
  ctx.fillStyle = gold; ctx.fill();
  ctx.lineWidth = 6; ctx.strokeStyle = gold;
  ctx.beginPath(); ctx.arc(-36, -88, 14, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(36, -88, 14, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
  ctx.fillStyle = H.rgba(light, 0.6 * o.shine + 0.2); ctx.fillRect(-22, -104, 8, 40);
  ctx.fillStyle = deep; ctx.font = K.font.display(24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(o.n), 0, -80);
  ctx.restore();
}

function slotOutline(ctx, H, x, y, a) {
  ctx.save(); ctx.setLineDash([8, 8]); ctx.lineWidth = 3; ctx.strokeStyle = H.rgba('#ffffff', 0.25 + 0.25 * a);
  H.roundRect(ctx, x - 40, y - 120, 80, 116, 14); ctx.stroke(); ctx.restore();
}

function chip(ctx, H, ACC, x, y, r, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(rot) * 0.3);
  ctx.fillStyle = '#c9a54a';
  for (let i = -2; i <= 2; i++) { ctx.fillRect(i * r * 0.32 - 2, -r - 6, 4, 8); ctx.fillRect(i * r * 0.32 - 2, r - 2, 4, 8); ctx.fillRect(-r - 6, i * r * 0.32 - 2, 8, 4); ctx.fillRect(r - 2, i * r * 0.32 - 2, 8, 4); }
  H.roundRect(ctx, -r, -r, 2 * r, 2 * r, 5); ctx.fillStyle = '#20243d'; ctx.fill();
  H.roundRect(ctx, -r * 0.5, -r * 0.5, r, r, 3); ctx.fillStyle = ACC; ctx.fill();
  ctx.restore();
}

function slip(ctx, H, x, y, s, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot * 0.25); ctx.scale(s, s);
  H.roundRect(ctx, -30, -38, 60, 76, 6); ctx.fillStyle = '#f2f4fb'; ctx.fill();
  ctx.fillStyle = '#9aa3c7'; for (let i = 0; i < 4; i++) ctx.fillRect(-20, -24 + i * 14, i === 3 ? 22 : 40, 5);
  ctx.restore();
}
