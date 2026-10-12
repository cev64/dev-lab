// Scene "order-renames" (full frame, 2 beats). Beat 1 (hook): close-up of a civic building's letter sign reading
// `from`; a cartoon sign painter on a step ladder rolls paint over the letters that change. Beat 2: the camera pulls back to three
// government buildings; an official paper floats in, a pen signs it, title/date pills pop, a stamp lands,
// three copies fly to the buildings and every sign's first letter flips to the new letter (the painter paints
// the middle one in). A final pill states the limit ("As far as the law allows"). Ends settled.
// Fits: a government order / rule that renames something, a policy memo sent to agencies, a word being replaced.
// params (all optional):
//   from / to         sign text before / after (default "V1" / "V2"); only differing letters flip (2 letters read best;
//                     3+ make the signs crowd the painter)
//   agencies          3 pediment labels (default ["AGENCY", "DEPARTMENT", "AGENCY"])
//   docTitle, date    pills next to the paper (default "NEW ORDER", none)
//   stamp             stamp text (default = to)
//   law               last pill (optional)
//   agenciesLabel     pill when the agencies are named (default "Government agencies")
//   signCue, agenciesCue, stampCue, flipCue, lawCue, dateCue   narration words (else 18/35/50/70/88/5 % of beat 2)
// (Promoted from 2026-10-12 si-rebrand "si-order"; that story used from "AI", to "SI", agenciesCue "Federal",
//  dateCue "twenty-ninth", agenciesLabel "Federal agencies".)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth } = H;
  const D = info.duration, ACC = info.accent;
  const b1 = info.beats && info.beats[1] ? info.beats[1] : { t0: Math.min(2.8, D * 0.2), t1: D };
  const B0 = b1.t0, B1 = b1.t1, BD = B1 - B0;
  const cueT = (w, frac) => { const v = w ? info.timeOf(w) : null; return v != null ? v : B0 + BD * frac; };
  const signAt = cueT(P.signCue, 0.18), agAt = cueT(P.agenciesCue, 0.35), stampAt = cueT(P.stampCue, 0.5);
  const flipAt = cueT(P.flipCue, 0.7), lawAt = cueT(P.lawCue, 0.88);
  const flyAt = Math.max(stampAt + 0.8, flipAt - 1.1);
  const FROM = String(P.from || 'V1'), TO = String(P.to || 'V2');
  const labels = P.agencies || ['AGENCY', 'DEPARTMENT', 'AGENCY'];

  // ---------- camera: hook close-up on the middle sign, then pull back to the wide shot
  const SIGN_Y = 800;                                   // world y of the middle sign's centre
  const pull = K.phase(t, B0 - 0.15, B0 + 1.0, H.easeInOutCubic);
  const z = lerp(2.0, 1.0, pull);
  const focusX = lerp(470, 487, pull), focusY = lerp(SIGN_Y, 725, pull);
  const screenY = lerp(930, 725, pull);
  ctx.save();
  if (t > stampAt && t < stampAt + 0.5) K.cameraShake(ctx, t, stampAt, 0.4, 10);
  ctx.translate(487, screenY); ctx.scale(z, z); ctx.translate(-focusX, -focusY);

  K.world.city(ctx, { t, time: 'dusk', groundY: 990 });
  // plaza paving
  ctx.fillStyle = '#2b2f4a'; ctx.fillRect(-400, 990, 1900, 60);

  // ---------- three civic buildings with letter signs
  const BX = [190, 487, 784];
  BX.forEach((x, i) => civic(ctx, K, x, 990, labels[i] || 'AGENCY', t));
  BX.forEach((x, i) => {
    const flipT = flipAt + (i === 1 ? 0.9 : (i === 0 ? 0 : 0.25));
    sign(ctx, K, x, SIGN_Y, FROM, TO, i === 1 ? -1 : (t - flipT) / 0.55, ACC, t);
  });
  // middle sign: painted over in the hook, then the new letter is painted in
  const tileW = 62, tileH = 78;
  const diffIdx = [...FROM].map((c, j) => (c !== TO[j] ? j : -1)).filter((j) => j >= 0);
  const x0 = 487 - (FROM.length * (tileW + 10) - 10) / 2;
  const cover = K.phase(t, 0.35, 2.3, smooth);
  const paintIn = K.phase(t, flipAt + 0.6, flipAt + 1.6, smooth);
  diffIdx.forEach((j) => {
    const tx = x0 + j * (tileW + 10), ty = SIGN_Y - tileH / 2;
    // fresh paint covers the old letter top-down
    if (cover > 0 && paintIn < 1) {
      ctx.fillStyle = '#efe9da'; ctx.fillRect(tx + 3, ty + 3, tileW - 6, (tileH - 6) * cover);
      ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(tx + 8, ty + 6, 6, (tileH - 12) * cover);
    }
    // new letter painted in (wipe left to right)
    if (paintIn > 0) {
      ctx.save(); ctx.beginPath(); ctx.rect(tx, ty, tileW * paintIn, tileH); ctx.clip();
      H.roundRect(ctx, tx, ty, tileW, tileH, 8); ctx.fillStyle = ACC; ctx.fill();
      ctx.font = K.font.display(54); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = K.ACCENT.deep;
      ctx.fillText(TO[j], tx + tileW / 2, ty + tileH / 2 + 3);
      ctx.restore();
    }
  });
  // painter on a step ladder left of the middle sign
  const j0 = diffIdx.length ? diffIdx[0] : 0;
  const tileCX = x0 + j0 * (tileW + 10) + tileW / 2;
  const PX = 487 - 150, FEET = 948;
  ladder(ctx, PX + 6, 990, FEET);
  const painting = t < 2.4 || (t > flipAt + 0.5 && t < flipAt + 1.7);
  const cheer = t > flipAt + 1.8;
  K.drawPerson(ctx, PX, FEET, 0.78, { t, pose: painting || cheer ? 'cheer' : 'stand', shirt: '#e0e6f0', pants: '#5d6f9e', skin: 2, hair: 1, hairStyle: 'short', mood: 'happy', seed: 5 });
  // painter's cap
  const headY = FEET + (-104 - 64 - 44) * 0.78;
  ctx.fillStyle = ACC; ctx.beginPath(); ctx.ellipse(PX, headY - 20, 27, 13, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(PX, headY - 22, 36, 6);
  // roller: from the raised right hand to the tile
  if (painting) {
    const k = Math.sin(t * 7) * 5;
    const hx = PX + 58 * 0.78, hy = FEET + (-168 - 66 - k) * 0.78;
    const ry = SIGN_Y + Math.sin(t * 7) * 26;
    ctx.strokeStyle = '#3a3f58'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(tileCX - 10, ry + 6); ctx.stroke();
    H.roundRect(ctx, tileCX - 34, ry - 10, 50, 20, 8); ctx.fillStyle = paintIn > 0 ? ACC : '#f4efe2'; ctx.fill();
  } else {
    // roller resting against the ladder
    ctx.strokeStyle = '#3a3f58'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(PX - 40, 990); ctx.lineTo(PX - 22, 900); ctx.stroke();
    H.roundRect(ctx, PX - 46, 884, 50, 20, 8); ctx.fillStyle = paintIn >= 1 ? ACC : '#f4efe2'; ctx.fill();
  }
  // paint can at the foot of the ladder
  H.roundRect(ctx, PX + 40, 958, 36, 32, 5); ctx.fillStyle = '#8f98b8'; ctx.fill();
  H.roundRect(ctx, PX + 40, 958, 36, 8, 3); ctx.fillStyle = paintIn > 0 ? ACC : '#f4efe2'; ctx.fill();
  ctx.restore();

  // ---------- beat 2 overlay (screen space, wide shot): the order
  if (t > B0 + 0.3) {
    const DX = 232, DY = 690;
    const pop = K.popIn(t, B0 + 0.45, 0.6);
    if (pop > 0) {
      K.glow(ctx, DX, DY - 110, 200, ACC, 0.14 * pop);
      ctx.save(); ctx.translate(DX, DY); ctx.scale(pop, pop); ctx.rotate(-0.04 + 0.02 * Math.sin(t * 1.3)); ctx.translate(-DX, -DY);
      const sgn = K.phase(t, signAt, signAt + 1.1);
      K.drawDocument(ctx, DX, DY, 1.25, { lines: 7, sign: sgn, seal: t > stampAt + 0.3 });
      // pen tracing the signature
      if (sgn > 0 && sgn < 1) {
        const px = DX + lerp(-50, 18, sgn) * 1.25, py = DY - (36 + 12 * Math.sin(sgn * 18)) * 1.25;
        ctx.save(); ctx.translate(px, py); ctx.rotate(0.6);
        H.roundRect(ctx, -6, -70, 12, 64, 5); ctx.fillStyle = '#2a2f45'; ctx.fill();
        ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(0, 6); ctx.lineTo(6, -6); ctx.closePath(); ctx.fillStyle = ACC; ctx.fill();
        ctx.restore();
      }
      // stamp on the paper
      if (t > stampAt - 0.05) K.drawStamp(ctx, DX + 6, DY - 20, 0.62, { kind: 'check', text: P.stamp || TO, land: (t - stampAt + 0.05) / 0.5 });
      ctx.restore();
    }
    // pills on the right
    const pills = [
      { text: P.docTitle || 'NEW ORDER', at: B0 + 0.7, y: 496, accent: true },
      P.date ? { text: P.date, at: cueT(P.dateCue, 0.05), y: 563 } : null,
      { text: P.agenciesLabel || 'Government agencies', at: agAt, y: 630, dot: true },
      P.law ? { text: P.law, at: lawAt, y: 697 } : null,
    ].filter(Boolean);
    pills.forEach((p) => {
      const pp = K.popIn(t, p.at, 0.45);
      if (pp > 0) K.drawLabel(ctx, 640, p.y, pp, { text: p.text, size: 30, accent: p.accent, dot: p.dot });
    });
    // copies fly from the paper to the three signs
    BX.forEach((x, i) => {
      const u = K.phase(t, flyAt + i * 0.15, flyAt + i * 0.15 + 0.95, H.easeInOutCubic);
      if (u <= 0 || u >= 1) return;
      const pts = K.bezier(DX + 40, DY - 120, DX + 200, 380, x - 40, 560, x, SIGN_Y - 40, 24);
      const [qx, qy] = K.pathPoint(pts, u);
      ctx.save(); ctx.globalAlpha = Math.min(1, (1 - u) * 5);
      ctx.translate(qx, qy); ctx.rotate(-0.4 + u * 0.8 + i * 0.1);
      K.drawDocument(ctx, 0, 40, 0.42, { lines: 4, shadow: false });
      ctx.restore();
    });
  }
}

// Classical civic building (generic, no real seal): steps, columns, frieze (the sign sits on it), pediment with text.
function civic(ctx, K, x, y, label, t) {
  const W = 250, stone = '#cfc8b8', shade = '#a9a191', dark = '#8d8676';
  K.shadow(ctx, x, y, 300, 0.35);
  // steps
  for (let i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? shade : stone; ctx.fillRect(x - W / 2 - 16 + i * 8, y - 12 - i * 12, W + 32 - i * 16, 12); }
  const top = 700, frieze = 752, colTop = 846, colBot = y - 36;
  // back wall
  ctx.fillStyle = '#7d7768'; ctx.fillRect(x - W / 2 + 12, colTop, W - 24, colBot - colTop);
  // door + windows glow
  ctx.fillStyle = '#3a3346'; ctx.fillRect(x - 22, colBot - 70, 44, 70);
  ctx.fillStyle = 'rgba(255,220,150,0.55)'; ctx.fillRect(x - 18, colBot - 66, 16, 62); ctx.fillRect(x + 2, colBot - 66, 16, 62);
  // columns
  for (let c = 0; c < 5; c++) {
    const cx = x - W / 2 + 22 + c * ((W - 44) / 4);
    if (c === 2) continue;
    ctx.fillStyle = stone; ctx.fillRect(cx - 11, colTop, 22, colBot - colTop);
    ctx.fillStyle = shade; ctx.fillRect(cx + 4, colTop, 7, colBot - colTop);
    ctx.fillStyle = stone; ctx.fillRect(cx - 15, colTop - 6, 30, 8); ctx.fillRect(cx - 15, colBot - 2, 30, 8);
  }
  // frieze band behind the sign
  ctx.fillStyle = stone; ctx.fillRect(x - W / 2, frieze, W, colTop - frieze);
  ctx.fillStyle = shade; ctx.fillRect(x - W / 2, colTop - 12, W, 12);
  // pediment
  ctx.beginPath(); ctx.moveTo(x - W / 2 - 12, frieze); ctx.lineTo(x, top - 10); ctx.lineTo(x + W / 2 + 12, frieze); ctx.closePath();
  ctx.fillStyle = stone; ctx.fill();
  ctx.beginPath(); ctx.moveTo(x - W / 2 + 14, frieze - 6); ctx.lineTo(x, top + 6); ctx.lineTo(x + W / 2 - 14, frieze - 6); ctx.closePath();
  ctx.fillStyle = shade; ctx.fill();
  ctx.font = K.font.ui(24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#3d3a35';
  ctx.fillText(label, x, frieze - 18);
  ctx.fillStyle = dark; ctx.fillRect(x - W / 2 - 12, frieze - 2, W + 24, 5);
}

// Letter-tile sign board centred at (x, y). flip < 0: never flips; 0..1 flip progress for differing letters.
function sign(ctx, K, x, y, from, to, flip, ACC, t) {
  const tileW = 62, tileH = 78, gap = 10, n = from.length;
  const w = n * (tileW + gap) - gap, x0 = x - w / 2;
  // board
  ctx.fillStyle = '#2a2f45'; roundRect(ctx, x0 - 14, y - tileH / 2 - 12, w + 28, tileH + 24, 12); ctx.fill();
  ctx.fillStyle = '#4a5070'; ctx.fillRect(x - 40, y + tileH / 2 + 12, 8, 14); ctx.fillRect(x + 32, y + tileH / 2 + 12, 8, 14);
  for (let j = 0; j < n; j++) {
    const tx = x0 + j * (tileW + gap), differs = from[j] !== to[j];
    let p = differs && flip >= 0 ? Math.max(0, Math.min(1, flip)) : 0;
    const showNew = p >= 0.5, sy = Math.abs(Math.cos(Math.PI * p));
    ctx.save(); ctx.translate(tx + tileW / 2, y); ctx.scale(1, Math.max(0.04, sy));
    roundRect(ctx, -tileW / 2, -tileH / 2, tileW, tileH, 8);
    ctx.fillStyle = showNew ? ACC : '#efe9da'; ctx.fill();
    ctx.font = K.font.display(54); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = showNew ? K.ACCENT.deep : '#23263a';
    ctx.fillText(showNew ? to[j] : from[j], 0, 3);
    ctx.restore();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function ladder(ctx, x, ground, top) {
  ctx.strokeStyle = '#b07a4a'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x - 30, ground); ctx.lineTo(x - 18, top); ctx.moveTo(x + 30, ground); ctx.lineTo(x + 18, top); ctx.stroke();
  ctx.lineWidth = 5;
  for (let i = 1; i < 4; i++) { const yy = ground - (ground - top) * i / 4; const k = i / 4; ctx.beginPath(); ctx.moveTo(x - 30 + 12 * k, yy); ctx.lineTo(x + 30 - 12 * k, yy); ctx.stroke(); }
  ctx.fillStyle = '#c48b57'; ctx.fillRect(x - 22, top - 6, 44, 8);
}
