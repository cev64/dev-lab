// Scene "deepfake-court" (full frame). Deepfake evidence in a generic cartoon courtroom (kit world, balance emblem,
// no real seals). Real people (witnesses, judges) are NEVER drawn: speakers are empty lecterns with text name pills;
// the judge / committee members / jurors are generic kit cartoons.
// modes:
//   hearing (best as a 2-beat span: hook + what happened) cartoon judge at the bench (gavel tap in the hook), two empty
//           witness lecterns with mics get text name pills on their cues, date + place pills, a committee name plate
//           drops onto the bench, then "Fake video?" / "Fake audio?" chips.
//           (date + place share one pill centred at x 740: keep both short, ~20 chars in all)
//           params: date, place, committee, left, right, chips [2], dateCue, placeCue, leftCue, rightCue, committeeCue, chipsCue
//   twins   courtroom monitor shows two near-identical clips; a magnifying glass sweeps them and fails ("?" in the lens,
//           CAN'T TELL stamp); attributed paraphrase cards (no quote marks) swap below.
//           params: by, lines [{who, text, cue}] (max 2), scanCue, failCue, stamp
//   survey  board of dots (one per respondent) fills while the total counts up; `hits` dots light in the accent; a
//           cartoon judge beside the board shrugs. params: total, hits, label, sub, source, totalCue, hitsCue
//   rule    giant rule book opens; a pencil writes step 1 (clip tagged FAKE? + evidence folder) and step 2 (balance tips
//           to AUTHENTIC). params: title, steps [2], draftCue, step1Cue, backCue, step2Cue, tipCue, real, fake, tag
//   stakes  living room at night: worried person on the sofa, phone card plays a voice note + video tagged FAKED;
//           three stake tiles (family | doc | gavel icons) pop on cues; later the card flips to REAL and a
//           "CALLED FAKE" stamp lands. params: tiles [{text, icon, cue}], voiceCue, realCue, dismissCue, faked, realText, stamp
//   caveat  rule book titled DRAFT on a lectern + "Not approved" pill; two generic committee members disagree (speech
//           bubble with a paraphrase, the other one shrugs). params: draft, notApproved, bubble, who, draftCue, approvedCue, bubbleCue
//   payoff  courtroom: judge (left) vs jury box (right), two identical clips on a monitor, question card, JUDGE / JURY
//           chips on cues. params: question, a, b, qCue, aCue, bCue
// Fits: deepfakes / fake evidence / authenticity rules / "can you tell what's real" stories.
// Defaults are generic placeholders (speakers "Company A" / "Company B", survey total 200 / hits 12): always pass the
// story's names and its published numbers. Library copy of the 2026-10-16 deepfake-evidence story scene.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const mode = P.mode || 'hearing';
  const at = (w, d, nth = 0) => { const v = w ? info.timeOf(w, nth) : null; return v == null ? d : v; };
  const env = { ctx, t, info, H, K, P, at, D: info.duration, ACC: info.accent };
  ctx.save();
  if (mode === 'twins') twins(env);
  else if (mode === 'survey') survey(env);
  else if (mode === 'rule') rule(env);
  else if (mode === 'stakes') stakes(env);
  else if (mode === 'caveat') caveat(env);
  else if (mode === 'payoff') payoff(env);
  else hearing(env);
  ctx.restore();
}

// ------------------------------------------------------------------ shared drawing
const ROBE = '#1b1d29';
function panel(ctx, H, x, y, w, h, r, fill, stroke, lw = 3) {
  H.roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill();
  if (stroke) { ctx.lineWidth = lw; ctx.strokeStyle = stroke; H.roundRect(ctx, x, y, w, h, r); ctx.stroke(); }
}
function textFit(ctx, H, str, x, y, kind, max, min, maxW, color, align = 'center') {
  const f = H.fitText(ctx, String(str), kind, max, min, maxW);
  ctx.font = f.font; ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillText(f.text, x, y);
}
function wrapText(ctx, H, str, x, y, kind, size, maxW, color, lh = 1.18, maxLines = 3, align = 'center') {
  let s = size, lines;
  for (; s >= 22; s -= 2) { lines = H.wrap(ctx, String(str), kind, s, maxW); if (lines.length <= maxLines) break; }
  ctx.font = H.font(kind, s); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
  const y0 = y - ((lines.length - 1) * s * lh) / 2;
  lines.forEach((ln, i) => ctx.fillText(ln, x, y0 + i * s * lh));
  return { size: s, lines, y0 };
}
function dim(ctx, a) { ctx.fillStyle = `rgba(5,6,14,${a})`; ctx.fillRect(0, 0, 1080, 1920); }
function pop(K, t, at, dur = 0.4) { return Math.min(1.05, Math.max(0, K.popIn(t, at, dur))); }

// generic cartoon judge behind the bench (only upper body shows)
function benchPerson(ctx, K, room, x, t, o) {
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, room.bench.y + 4); ctx.clip();
  K.drawPerson(ctx, x, room.bench.y + 170, 1.3, Object.assign({ t, shirt: ROBE, hairStyle: 'short', skin: 2, hair: 4, seed: 4 }, o));
  ctx.restore();
}

// a video clip frame with a generic cartoon speaker (same drawing for both clips: "near-identical")
function videoClip(ctx, H, K, cx, cy, w, h, t, o = {}) {
  ctx.save();
  panel(ctx, H, cx - w / 2, cy - h / 2, w, h, 16, '#0d0f1c', 'rgba(255,255,255,0.35)', 3);
  ctx.beginPath(); H.roundRect(ctx, cx - w / 2 + 8, cy - h / 2 + 8, w - 16, h - 16, 10); ctx.clip();
  const g = ctx.createLinearGradient(0, cy - h / 2, 0, cy + h / 2); g.addColorStop(0, '#34407a'); g.addColorStop(1, '#1e2550');
  ctx.fillStyle = g; ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
  // window shape behind the speaker
  ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fillRect(cx + w * 0.12, cy - h * 0.36, w * 0.26, h * 0.34);
  const s = (h / 240) * 1.25;
  K.drawPerson(ctx, cx - w * 0.04, cy + h * 0.95, s, { t, pose: 'stand', talk: 0.5 + 0.5 * Math.sin(t * 9), shirt: '#2f8f83', skin: 3, hair: 1, hairStyle: 'long', mood: 'happy', seed: 2 });
  // play bar
  ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(cx - w / 2, cy + h / 2 - 34, w, 34);
  const u = ((t * 0.12) % 1);
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(cx - w / 2 + 44, cy + h / 2 - 19, w - 64, 5);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - w / 2 + 44, cy + h / 2 - 19, (w - 64) * u, 5);
  ctx.beginPath(); ctx.moveTo(cx - w / 2 + 16, cy + h / 2 - 27); ctx.lineTo(cx - w / 2 + 32, cy + h / 2 - 17); ctx.lineTo(cx - w / 2 + 16, cy + h / 2 - 7); ctx.closePath(); ctx.fill();
  ctx.restore();
  if (o.tag) { // corner tag
    ctx.save(); ctx.font = H.font('display', 26); const tw = ctx.measureText(o.tag).width + 26;
    panel(ctx, H, cx - w / 2 + 14, cy - h / 2 + 14, tw, 40, 10, o.tagColor || 'rgba(10,12,22,0.85)');
    ctx.fillStyle = o.tagInk || '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(o.tag, cx - w / 2 + 27, cy - h / 2 + 35);
    ctx.restore();
  }
}

function magnifier(ctx, H, x, y, r, ang, o = {}) {
  ctx.save(); ctx.translate(x, y);
  // handle
  ctx.save(); ctx.rotate(ang);
  H.roundRect(ctx, -14, r - 4, 28, r * 1.25, 12); ctx.fillStyle = '#5a3d2c'; ctx.fill();
  H.roundRect(ctx, -18, r - 12, 36, 26, 8); ctx.fillStyle = '#c9ccd8'; ctx.fill();
  ctx.restore();
  // lens
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fillStyle = 'rgba(190,225,255,0.18)'; ctx.fill();
  ctx.lineWidth = 16; ctx.strokeStyle = '#d9dce6'; ctx.stroke();
  ctx.lineWidth = 5; ctx.strokeStyle = '#9aa0b4'; ctx.beginPath(); ctx.arc(0, 0, r + 7, 0, Math.PI * 2); ctx.stroke();
  ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.ellipse(-r * 0.38, -r * 0.4, r * 0.16, r * 0.3, 0.7, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.globalAlpha = 1;
  if (o.q > 0) {
    ctx.save(); ctx.scale(o.q, o.q); ctx.font = H.font('display', r * 1.1); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = o.color || '#ffffff'; ctx.fillText('?', 0, 6); ctx.restore();
  }
  ctx.restore();
}

function lecternMic(ctx, K, H, x, y, s, t, talking, ACC) {
  K.drawLectern(ctx, x, y, s);
  const top = y - 232 * s;
  ctx.save();
  ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(x + 30 * s, top + 6); ctx.quadraticCurveTo(x + 36 * s, top - 40 * s, x + 10 * s, top - 62 * s); ctx.stroke();
  H.roundRect(ctx, x - 4 * s, top - 92 * s, 26 * s, 40 * s, 12 * s); ctx.fillStyle = '#3b4260'; ctx.fill();
  if (talking > 0) {
    ctx.lineWidth = 5;
    for (let i = 0; i < 3; i++) {
      const ph = ((t * 1.6 + i / 3) % 1);
      ctx.strokeStyle = H.rgba(ACC, talking * (1 - ph));
      ctx.beginPath(); ctx.arc(x + 9 * s, top - 72 * s, 30 + ph * 70, -Math.PI * 0.85, -Math.PI * 0.15); ctx.stroke();
    }
  }
  ctx.restore();
}

function clipIcon(ctx, H, x, y, w, h, ACC) { // tiny video frame icon with a play triangle
  panel(ctx, H, x - w / 2, y - h / 2, w, h, 10, '#2a2f48');
  ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(x - 10, y - 14); ctx.lineTo(x + 16, y); ctx.lineTo(x - 10, y + 14); ctx.closePath(); ctx.fill();
}
function waveIcon(ctx, x, y, w, t, color, n = 9, amp = 18) {
  ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 6; ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const xx = x - w / 2 + (i + 0.5) * (w / n);
    const a = amp * (0.35 + 0.65 * Math.abs(Math.sin(t * 6 + i * 1.3)));
    ctx.beginPath(); ctx.moveTo(xx, y - a); ctx.lineTo(xx, y + a); ctx.stroke();
  }
  ctx.restore();
}

// ------------------------------------------------------------------ modes
function hearing(E) {
  const { ctx, t, H, K, P, at, D, ACC } = E;
  const tDate = at(P.dateCue, 3.6) - 0.25, tPlace = at(P.placeCue, 4.4) - 0.25;
  const tL = at(P.leftCue, D * 0.42) - 0.25, tR = at(P.rightCue, D * 0.5) - 0.25;
  const tCom = at(P.committeeCue, D * 0.63) - 0.3, tChips = at(P.chipsCue, D * 0.8) - 0.25;
  const gavelAt = 3.7;
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 487, y: 780 }, { t: 3.2, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 760 }]);
  K.cameraShake(ctx, t, gavelAt + 0.14, 0.35, 10);
  const room = K.world.courtroom(ctx, { t });
  // judge looks at whoever speaks
  let look = 0;
  if (t > tL) look = -0.7;
  if (t > tR) look = 0.7;
  if (t > tChips) look = Math.sin((t - tChips) * 1.4) * 0.7;
  benchPerson(ctx, K, room, 395, t, { pose: t < gavelAt + 0.6 && t > gavelAt - 0.6 ? 'point' : 'stand', mood: t > tChips ? 'worried' : 'neutral', look, talk: 0 });
  // gavel tap in the hook (wind up, strike)
  let hit = 1;
  if (t > gavelAt - 0.6 && t < gavelAt) hit = 1 - K.phase(t, gavelAt - 0.6, gavelAt - 0.1);
  else if (t >= gavelAt && t < gavelAt + 0.2) hit = K.phase(t, gavelAt, gavelAt + 0.14, (k) => k * k);
  K.drawGavel(ctx, 640, room.bench.y + 4, 0.85, { hit, shadow: false });
  // committee name plate drops onto the bench front
  const pk = K.phase(t, tCom, tCom + 0.5, K.easeOutBack);
  if (pk > 0) {
    const y = H.lerp(520, 645, pk);
    ctx.save(); ctx.globalAlpha = H.clamp(pk * 2);
    panel(ctx, H, 205, y, 670, 76, 12, '#c9a24a', '#8a6a24', 4);
    textFit(ctx, H, P.committee || 'Evidence rules committee', 540, y + 39, 'display', 34, 22, 620, '#2a1d0c');
    ctx.restore();
  }
  // lecterns: speakers never drawn, names as text only
  const idle = t < 3.3 ? 0.6 : 0;
  const talkL = t > tL && t < tR + 0.2 ? 1 : (t > tChips && Math.floor((t - tChips) / 1.1) % 2 === 0 ? 0.8 : 0);
  const talkR = t > tR && t < tCom + 1.0 ? 1 : (t > tChips && Math.floor((t - tChips) / 1.1) % 2 === 1 ? 0.8 : 0);
  lecternMic(ctx, K, H, 250, 1045, 0.95, t, t > tL ? talkL : (Math.floor(t / 0.9) % 2 === 0 ? idle : 0), ACC);
  lecternMic(ctx, K, H, 730, 1045, 0.95, t, t > tR ? talkR : (Math.floor(t / 0.9) % 2 === 1 ? idle : 0), ACC);
  const lk = pop(K, t, tL), rk = pop(K, t, tR);
  if (lk > 0) K.drawLabel(ctx, 250, 1000, lk, { text: P.left || 'Company A', size: 30, accent: true });
  if (rk > 0) K.drawLabel(ctx, 730, 1000, rk, { text: P.right || 'Company B', size: 30, accent: true });
  // date + place
  const dk = pop(K, t, tDate), plk = pop(K, t, tPlace);
  if (dk > 0) K.drawLabel(ctx, 740, 478, dk, { text: (P.date || 'Today') + (plk > 0 ? ' \u00b7 ' + (P.place || 'Court') : ''), size: 30, dot: true });
  // chips between the lecterns
  const chips = P.chips || ['Fake video?', 'Fake audio?'];
  chips.slice(0, 2).forEach((c, i) => {
    const k = pop(K, t, tChips + i * 0.45);
    if (k <= 0) return;
    const cy = 815 + i * 105;
    ctx.save(); ctx.translate(490, cy); ctx.scale(k, k);
    panel(ctx, H, -120, -40, 240, 80, 22, 'rgba(10,12,26,0.92)', H.rgba(ACC, 0.85), 3);
    if (i === 0) clipIcon(ctx, H, -78, 0, 56, 44, ACC); else waveIcon(ctx, -78, 0, 52, t, ACC, 5, 14);
    textFit(ctx, H, c, 28, 1, 'bold', 28, 20, 150, '#ffffff');
    ctx.restore();
  });
}

function twins(E) {
  const { ctx, t, H, K, P, at, D, ACC } = E;
  const lines = (P.lines || [{ who: 'One speaker', text: 'Humans can\'t tell them apart', cue: null }]).slice(0, 2);
  const tLine = lines.map((l, i) => at(l.cue, i === 0 ? D * 0.2 : D * 0.75) - 0.25);
  const tScan = at(P.scanCue, D * 0.3) - 0.5, tFail = at(P.failCue, D * 0.48);
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 487, y: 700 }]);
  const room = K.world.courtroom(ctx, { t });
  dim(ctx, 0.5);
  const bk = pop(K, t, 0.15);
  if (bk > 0) K.drawLabel(ctx, 487, 470, bk, { text: P.by || 'According to reports', size: 28, dot: true });
  // monitor on a stand
  const mk = K.phase(t, 0, 0.45, K.easeOutCubic);
  ctx.save(); ctx.globalAlpha = mk;
  ctx.fillStyle = '#2a2f45'; ctx.fillRect(470, 830, 34, 40);
  panel(ctx, H, 92, 495, 790, 345, 24, '#1c2033', 'rgba(255,255,255,0.25)', 3);
  const fail = t > tFail;
  const qk = fail ? pop(K, t, tFail + 0.1) : 0;
  videoClip(ctx, H, K, 290, 668, 360, 300, t, { tag: fail ? 'REAL?' : 'A' });
  videoClip(ctx, H, K, 684, 668, 360, 300, t + 0.02, { tag: fail ? 'AI?' : 'B' });
  ctx.restore();
  // magnifier: sweep A -> B -> centre, then fails
  if (t > tScan - 0.4) {
    const xs = [[tScan - 0.4, 960], [tScan + 0.2, 300], [tScan + 0.2 + (tFail - tScan) * 0.45, 684], [tFail, 487]];
    let x = 487;
    for (let i = 0; i < xs.length - 1; i++) if (t >= xs[i][0]) x = H.lerp(xs[i][1], xs[i + 1][1], H.easeInOutCubic(H.clamp((t - xs[i][0]) / Math.max(0.05, xs[i + 1][0] - xs[i][0]))));
    if (t >= tFail) x = 487;
    const droop = t > tLine[1] && lines.length > 1 ? K.phase(t, tLine[1], tLine[1] + 0.8) : 0;
    const shake = fail ? K.shake(t, tFail, 0.5, 10) : 0;
    const y = 660 + K.bob(t, 6, 0.8) + droop * 60;
    magnifier(ctx, H, x + shake, y, 92, -0.6 + droop * 0.9, { q: qk, color: ACC });
  }
  if (fail) K.drawStamp(ctx, 760, 850, 0.72, { kind: 'cross', text: P.stamp || "CAN'T TELL", land: H.clamp((t - tFail - 0.5) / 0.5) });
  // attributed paraphrase cards (no quote marks)
  lines.forEach((l, i) => {
    const start = tLine[i], end = i + 1 < lines.length ? tLine[i + 1] - 0.1 : D + 1;
    if (t < start || t > end + 0.3) return;
    const k = Math.min(pop(K, t, start), 1 - H.clamp((t - end) / 0.3));
    if (k <= 0) return;
    ctx.save(); ctx.translate(487, 958); ctx.scale(k, k);
    panel(ctx, H, -395, -88, 790, 176, 24, 'rgba(10,12,26,0.95)', H.rgba(ACC, 0.8), 3);
    textFit(ctx, H, String(l.who || '').toUpperCase(), 0, -52, 'ui', 26, 22, 700, ACC);
    wrapText(ctx, H, l.text, 0, 18, 'bold', 38, 730, '#ffffff', 1.15, 2);
    ctx.restore();
  });
}

function survey(E) {
  const { ctx, t, H, K, P, at, D, ACC } = E;
  const total = P.total || 200, hits = Math.min(P.hits || 12, 60);
  const tTotal = at(P.totalCue, D * 0.35), tHits = at(P.hitsCue, D * 0.7) - 0.2;
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 470, y: 720 }]);
  K.world.courtroom(ctx, { t });
  dim(ctx, 0.55);
  const pk = K.phase(t, 0, 0.45, K.easeOutCubic);
  ctx.save(); ctx.globalAlpha = pk;
  panel(ctx, H, 78, 430, 690, 592, 28, 'rgba(10,12,26,0.95)', H.rgba(ACC, 0.6), 3);
  // header: total counts up, then the hits
  const n = Math.round(total * H.easeOutCubic(H.clamp((t - 0.3) / Math.max(0.5, tTotal - 0.3))));
  textFit(ctx, H, String(n), 250, 505, 'display', 92, 60, 300, '#ffffff');
  wrapText(ctx, H, P.label || 'answered', 250, 585, 'ui', 26, 300, '#c9d2f5', 1.15, 2);
  const hk = pop(K, t, tHits, 0.45);
  if (hk > 0) {
    ctx.save(); ctx.translate(590, 505); ctx.scale(hk, hk);
    textFit(ctx, H, String(P.hits || 12), 0, 0, 'display', 92, 60, 300, ACC);
    ctx.restore();
    ctx.save(); ctx.globalAlpha = H.clamp(hk);
    wrapText(ctx, H, P.sub || 'said yes', 590, 585, 'ui', 26, 300, ACC, 1.15, 2);
    ctx.restore();
  }
  // grid: one dot per respondent
  const cols = 40, x0 = 103, y0 = 645, px = 16, py = 14;
  const shown = Math.round(total * H.clamp((t - 0.3) / Math.max(0.5, tTotal - 0.3)));
  const hitIdx = new Set(); for (let k = 0; k < hits; k++) hitIdx.add((k * 61 + 17 + Math.floor(k / 4) * 7) % total);
  for (let i = 0; i < total; i++) {
    const c = i % cols, r = Math.floor(i / cols);
    const x = x0 + c * px + px / 2, y = y0 + r * py + py / 2;
    if (i >= shown) { ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill(); continue; }
    if (hitIdx.has(i) && t > tHits) {
      const order = [...hitIdx].indexOf(i), k = K.popIn(t, tHits + order * 0.05, 0.35);
      H.glow(ctx, x, y, 34, ACC, 0.7 * H.clamp(k));
      ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(x, y, 5.5 + 5 * Math.max(0, k), 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = t > tHits ? 'rgba(201,210,245,0.35)' : 'rgba(201,210,245,0.7)';
      ctx.beginPath(); ctx.arc(x, y, 5.2, 0, Math.PI * 2); ctx.fill();
    }
  }
  if (P.source) textFit(ctx, H, P.source, 423, 995, 'body', 24, 20, 640, '#9aa3c7');
  ctx.restore();
  // cartoon judge (generic) beside the board
  const shrug = t > tHits + 0.7;
  K.drawPerson(ctx, 850, 1040, 0.88, { t, pose: shrug ? 'shrug' : 'stand', shirt: ROBE, skin: 2, hair: 4, hairStyle: 'short', mood: t > tHits ? 'shocked' : 'neutral', look: -0.8, flip: true, seed: 4 });
}

function rule(E) {
  const { ctx, t, H, K, P, at, D, ACC } = E;
  const steps = P.steps || ['Say it\'s fake? Show evidence', 'Then prove it\'s more likely than not authentic'];
  const tDraft = at(P.draftCue, D * 0.15) - 0.3;
  const t1 = at(P.step1Cue, D * 0.3) - 0.2, tBack = at(P.backCue, t1 + 2.0) - 0.2;
  const t2 = at(P.step2Cue, D * 0.62) - 0.2, tTip = at(P.tipCue, D * 0.9);
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 740 }]);
  K.world.courtroom(ctx, { t });
  dim(ctx, 0.42);
  const hk = pop(K, t, tDraft);
  if (hk > 0) K.drawLabel(ctx, 487, 478, hk, { text: P.title || 'Draft rule', size: 32, accent: true });
  // big open book
  const op = K.phase(t, 0.15, 1.0, K.easeOutCubic);
  const BX = 487, BY0 = 515, BY1 = 1012, PW = 368;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(BX, BY1 + 18, 420 * Math.max(0.3, op), 22, 0, 0, Math.PI * 2); ctx.fill();
  panel(ctx, H, BX - (PW + 20) * Math.max(0.12, op), BY0 - 8, (PW + 20) * 2 * Math.max(0.12, op), BY1 - BY0 + 22, 16, '#2b3463');
  for (const side of [-1, 1]) {
    ctx.save(); ctx.translate(BX, 0); ctx.scale(side * Math.max(0.1, op), 1);
    panel(ctx, H, 4, BY0, PW, BY1 - BY0, 10, '#f2f4fa');
    ctx.fillStyle = '#d5dae8'; ctx.fillRect(4, BY0, 18, BY1 - BY0);
    ctx.restore();
  }
  ctx.restore();
  if (op < 0.98) return;
  const LX = BX - PW / 2 - 4, RX = BX + PW / 2 + 4, INK = '#1d2238';
  // faint ruled lines
  ctx.fillStyle = '#e1e5f0';
  for (const cx of [LX, RX]) for (let i = 0; i < 6; i++) ctx.fillRect(cx - 140, 860 + i * 22, 280, 4);
  // step badges
  const badge = (x, y, n, k) => { if (k <= 0) return; ctx.save(); ctx.translate(x, y); ctx.scale(k, k); ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill(); ctx.font = H.font('display', 34); ctx.fillStyle = '#10131f'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(n), 0, 2); ctx.restore(); };
  const b1 = pop(K, t, t1), b2 = pop(K, t, t2);
  badge(LX - 140, 560, 1, b1); badge(RX - 140, 560, 2, b2);
  // step 1 icon: clip tagged FAKE? + evidence folder slides in
  if (b1 > 0) {
    ctx.save(); ctx.translate(LX - 20, 665); ctx.scale(b1, b1);
    panel(ctx, H, -95, -62, 190, 124, 14, '#2a2f48');
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-14, -22); ctx.lineTo(22, 0); ctx.lineTo(-14, 22); ctx.closePath(); ctx.fill();
    panel(ctx, H, -40, -96, 120, 44, 10, '#ff6b5e');
    textFit(ctx, H, P.tag || 'FAKE?', 20, -73, 'display', 28, 20, 108, '#2a0d0a');
    ctx.restore();
    const fk = K.phase(t, tBack, tBack + 0.5, K.easeOutBack);
    if (fk > 0) {
      const fx = H.lerp(LX + 260, LX + 95, fk);
      ctx.save(); ctx.translate(fx, 720); ctx.rotate(0.08);
      panel(ctx, H, -62, -48, 124, 92, 8, '#e3b04b'); panel(ctx, H, -62, -60, 56, 18, 6, '#e3b04b');
      ctx.fillStyle = '#7a5410'; ctx.font = H.font('ui', 20); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('EVIDENCE', 0, 0);
      ctx.restore();
    }
  }
  // step 2 icon: balance scale tips toward AUTHENTIC
  if (b2 > 0) {
    const tilt = 0.26 * K.phase(t, t2 + 0.6, Math.max(t2 + 1.2, tTip), H.easeInOutCubic);
    ctx.save(); ctx.translate(RX, 690); ctx.scale(b2, b2);
    ctx.fillStyle = '#3b4260'; ctx.fillRect(-6, -90, 12, 150); H.roundRect(ctx, -50, 54, 100, 16, 8); ctx.fill();
    ctx.save(); ctx.translate(0, -90); ctx.rotate(-tilt);
    ctx.fillStyle = '#3b4260'; H.roundRect(ctx, -130, -6, 260, 12, 6); ctx.fill();
    const pan = (px, lbl, col) => {
      ctx.save(); ctx.translate(px, 0); ctx.rotate(tilt);
      ctx.strokeStyle = '#3b4260'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-34, 70); ctx.lineTo(0, 0); ctx.lineTo(34, 70); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 72, 52, 14, 0, 0, Math.PI); ctx.fillStyle = col; ctx.fill();
      ctx.font = H.font('ui', 22); ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(lbl, 0, 108);
      ctx.restore();
    };
    pan(-120, P.real || 'AUTHENTIC', ACC); pan(120, P.fake || 'FAKE', '#ff6b5e');
    ctx.restore();
    ctx.restore();
  }
  // pencil writes the step text
  const write = (str, cx, start) => {
    if (t < start) return;
    const shown = K.typewriter(str, t, 26, start + 0.3);
    if (!shown) return;
    const res = wrapText(ctx, H, shown, cx, 880, 'bold', 32, 300, INK, 1.15, 4);
    if (shown.length < str.length) {
      const last = res.lines[res.lines.length - 1] || '';
      ctx.font = H.font('bold', res.size);
      const px = cx + ctx.measureText(last).width / 2 + 10, py = res.y0 + (res.lines.length - 1) * res.size * 1.15;
      pencil(ctx, H, px, py - 4, t, ACC);
    }
  };
  write(steps[0], LX, t1); write(steps[1], RX, t2);
}
function pencil(ctx, H, x, y, t, ACC) {
  ctx.save(); ctx.translate(x, y + Math.sin(t * 30) * 2); ctx.rotate(-0.7);
  H.roundRect(ctx, -6, -70, 18, 60, 4); ctx.fillStyle = ACC; ctx.fill();
  ctx.fillStyle = '#f0c9a0'; ctx.beginPath(); ctx.moveTo(-6, -10); ctx.lineTo(12, -10); ctx.lineTo(3, 8); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ff8fa0'; ctx.fillRect(-6, -80, 18, 10);
  ctx.restore();
}

function stakes(E) {
  const { ctx, t, H, K, P, at, D, ACC } = E;
  const tiles = (P.tiles || [{ text: 'Custody fight', icon: 'family' }, { text: 'Lawsuit', icon: 'doc' }, { text: 'Criminal case', icon: 'gavel' }]).slice(0, 3);
  const tVoice = at(P.voiceCue, D * 0.12) - 0.3;
  const tT = tiles.map((x, i) => at(x.cue, D * (0.35 + i * 0.12)) - 0.25);
  const tReal = at(P.realCue, D * 0.75) - 0.2, tDis = at(P.dismissCue, D * 0.85);
  K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.04, x: 520, y: 760 }]);
  const room = K.world.livingRoomNight(ctx, { t });
  const worried = t > tVoice + 0.4;
  K.drawPerson(ctx, 360, room.sofa.feetY, 1.9, { t, pose: 'sit-phone', seat: false, mood: worried ? 'worried' : 'neutral', skin: 1, hair: 2, hairStyle: 'curly', shirt: '#b5564a', look: 0.5, seed: 9 });
  // phone card
  const ck = pop(K, t, tVoice);
  if (ck > 0) {
    ctx.save(); ctx.translate(770, 835); ctx.scale(ck, ck);
    panel(ctx, H, -135, -150, 270, 300, 28, '#121527', 'rgba(255,255,255,0.3)', 3);
    // voice note row
    panel(ctx, H, -115, -130, 230, 70, 35, '#2a2f48');
    ctx.beginPath(); ctx.arc(-80, -95, 22, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    ctx.fillStyle = '#10131f'; ctx.beginPath(); ctx.moveTo(-87, -106); ctx.lineTo(-70, -95); ctx.lineTo(-87, -84); ctx.closePath(); ctx.fill();
    waveIcon(ctx, 15, -95, 150, t, '#ffffff', 9, 18);
    // video thumbnail
    videoClip(ctx, H, K, 0, 30, 230, 160, t);
    ctx.restore();
    const real = t > tReal;
    const tag = real ? (P.realText || 'REAL') : (P.faked || 'FAKED');
    const tk = real ? pop(K, t, tReal) : ck;
    if (tk > 0) {
      ctx.save(); ctx.translate(770, 668); ctx.scale(tk, tk);
      panel(ctx, H, -80, -26, 160, 52, 14, real ? '#3ccf7a' : '#ff6b5e');
      textFit(ctx, H, tag, 0, 1, 'display', 30, 20, 140, real ? '#0b2a17' : '#2a0d0a');
      ctx.restore();
    }
    if (t > tDis) K.drawStamp(ctx, 770, 960, 0.78, { kind: 'cross', text: P.stamp || 'CALLED FAKE', land: H.clamp((t - tDis) / 0.5) });
  }
  // stake tiles
  const TW = 250, TH = 176, xs = [205, 487, 769], ty = 527;
  tiles.forEach((tile, i) => {
    const k = pop(K, t, tT[i], 0.45);
    if (k <= 0) return;
    ctx.save(); ctx.translate(xs[i], ty); ctx.scale(k, k);
    panel(ctx, H, -TW / 2, -TH / 2, TW, TH, 24, 'rgba(10,12,26,0.94)', H.rgba(ACC, 0.75), 3);
    const age = t - tT[i];
    if (tile.icon === 'family') {
      K.drawPerson(ctx, -52, 22, 0.42, { t, pose: 'point', mood: 'angry', shirt: '#3b4580', hair: 1, hairStyle: 'short', skin: 0, seed: 1, look: 0.8 });
      K.drawPerson(ctx, 52, 22, 0.42, { t, pose: 'point', mood: 'angry', shirt: '#b5564a', hair: 3, hairStyle: 'bun', skin: 3, seed: 5, flip: true, look: 0.8 });
      K.drawPerson(ctx, 0, 22, 0.28, { t, pose: 'stand', mood: 'worried', shirt: '#e3b04b', hair: 2, hairStyle: 'curly', skin: 1, seed: 7 });
    } else if (tile.icon === 'doc') {
      ctx.save(); ctx.rotate(-0.08); K.drawDocument(ctx, 0, 24, 0.55, { lines: 5, title: 'LAWSUIT', sign: H.clamp(age / 1.2) }); ctx.restore();
    } else {
      const hit = age < 0.5 ? 1 - H.clamp(age / 0.4) : K.phase(t, tT[i] + 0.5, tT[i] + 0.64, (q) => q * q);
      K.drawGavel(ctx, 0, 18, 0.62, { hit, shadow: false });
    }
    textFit(ctx, H, tile.text, 0, 58, 'bold', 30, 22, TW - 30, '#ffffff');
    ctx.restore();
  });
}

function caveat(E) {
  const { ctx, t, H, K, P, at, D, ACC } = E;
  const tDraft = at(P.draftCue, D * 0.25) - 0.3, tApp = at(P.approvedCue, tDraft + 0.9) - 0.2;
  const tBub = at(P.bubbleCue, D * 0.5) - 0.2;
  K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 560, y: 760 }, { t: D, zoom: 1.0 }]);
  const room = K.world.courtroom(ctx, { t });
  K.drawGavel(ctx, 800, room.bench.y + 4, 0.85, { hit: 1, shadow: false });
  // lectern with the draft book
  K.drawLectern(ctx, 640, 1045, 1.1);
  const top = 1045 - 232 * 1.1;
  K.glow(ctx, 640, top - 110, 180, ACC, 0.12 + 0.08 * Math.sin(t * 3));
  K.drawRulebook(ctx, 640, top + 8 + K.bob(t, 3, 0.6), 1.0, { open: 0, title: P.draft || 'DRAFT' });
  const nk = pop(K, t, tApp);
  if (nk > 0) K.drawLabel(ctx, 640, top - 222, nk, { text: P.notApproved || 'Not approved', size: 30, dot: true });
  // generic committee members
  const talking = t > tBub;
  K.drawPerson(ctx, 175, 1040, 1.15, { t, pose: talking ? 'point' : 'stand', mood: 'neutral', shirt: '#3b4580', skin: 0, hair: 0, hairStyle: 'short', look: 0.7, talk: talking ? 0.4 + 0.4 * Math.sin(t * 8) : 0, seed: 3 });
  K.drawPerson(ctx, 860, 1040, 1.1, { t, pose: talking && t > tBub + 1.2 ? 'shrug' : 'stand', mood: talking ? 'worried' : 'neutral', shirt: '#6b4a8a', skin: 2, hair: 3, hairStyle: 'bun', flip: true, look: 0.7, seed: 8 });
  const wk = pop(K, t, tBub - 0.2);
  if (wk > 0) K.drawLabel(ctx, 487, 478, wk, { text: P.who || 'Some members', size: 30, accent: true });
  const bk = pop(K, t, tBub, 0.45);
  if (bk > 0) K.drawSpeechBubble(ctx, 200, 735, 1, { text: P.bubble || 'Today\'s rules already work', size: 32, maxW: 330, tail: 'left', pop: bk });
}

function payoff(E) {
  const { ctx, t, H, K, P, at, D, ACC } = E;
  const tQ = at(P.qCue, D * 0.4) - 0.3, tA = at(P.aCue, D * 0.68) - 0.2, tB = at(P.bCue, D * 0.84) - 0.2;
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 720 }, { t: D, zoom: 1.0 }]);
  const room = K.world.courtroom(ctx, { t });
  // monitor with the two identical clips
  ctx.fillStyle = '#2a2f45'; ctx.fillRect(470, 780, 34, 100);
  panel(ctx, H, 262, 575, 450, 215, 20, '#1c2033', 'rgba(255,255,255,0.25)', 3);
  videoClip(ctx, H, K, 375, 682, 205, 185, t);
  videoClip(ctx, H, K, 600, 682, 205, 185, t + 0.02);
  const q = 0.7 + 0.3 * Math.sin(t * 4);
  ctx.save(); ctx.font = H.font('display', 52); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = H.rgba(ACC, q);
  ctx.fillText('?', 452, 622); ctx.fillText('?', 677, 622); ctx.restore();
  // judge (generic) left
  K.drawPerson(ctx, 165, 1040, 1.22, { t, pose: t > tA ? 'point' : 'stand', shirt: ROBE, skin: 2, hair: 4, hairStyle: 'short', mood: 'neutral', look: 0.8, seed: 4 });
  // jury box right
  const jx = [655, 725, 795, 865];
  ctx.save(); ctx.beginPath(); ctx.rect(560, 700, 520, 205); ctx.clip();
  jx.forEach((x, i) => K.drawPerson(ctx, x, 1010, 0.75, { t, pose: 'stand', shirt: ['#2f8f83', '#b5564a', '#3b4580', '#e3b04b'][i], skin: i % 5, hair: (i + 2) % 5, hairStyle: ['long', 'short', 'curly', 'bun'][i], mood: 'neutral', look: -0.6, seed: 10 + i }));
  ctx.restore();
  panel(ctx, H, 600, 900, 300, 140, 10, '#6b4a36'); panel(ctx, H, 588, 888, 324, 22, 8, '#7d5841');
  // question + chips
  const qk = pop(K, t, tQ, 0.45);
  if (qk > 0) {
    ctx.save(); ctx.translate(487, 500); ctx.scale(qk, qk);
    panel(ctx, H, -400, -58, 800, 116, 26, 'rgba(10,12,26,0.95)', H.rgba(ACC, 0.6 + 0.4 * Math.sin(t * 3) * H.clamp(t - tB)), 4);
    textFit(ctx, H, P.question || 'Who decides?', 0, 2, 'display', 50, 30, 740, '#ffffff');
    ctx.restore();
  }
  const ak = pop(K, t, tA), bk = pop(K, t, tB);
  if (ak > 0) K.drawLabel(ctx, 165, 728, ak, { text: P.a || 'JUDGE', size: 34, accent: true });
  if (bk > 0) K.drawLabel(ctx, 760, 820, bk, { text: P.b || 'JURY', size: 34, accent: true });
}
