// Scene "court-plea" (full frame). A generic courtroom (kit world, balance emblem, no real seals).
// mode "plea" (default): a cartoon defendant stands before the bench with a lawyer; date + court pills; the judge's
//   gavel strikes on the cue word and a stamp ("PLEADED GUILTY") lands; then an allegation panel ("Prosecutors say")
//   shows what is alleged: an item (server with a glowing chip) travels along a dashed arrow from an origin pill to
//   a destination pill.
// mode "caveat": a company representative hands a box of files to an investigator (cooperating); pills say the company
//   is not charged; then the emblem glows and a "presumed innocent" banner appears.
// Fits: guilty pleas, indictments, convictions, settlements, "company not charged / cooperating" caveats.
// params: mode "plea" | "caveat"
//   plea:   date (default "In court"), court ("Federal court"), who ("The defendant"), stamp ("PLEADED GUILTY"),
//           by ("Prosecutors say"), what ("AI servers"), origin ("From here"), dest ("Abroad")
//           cues: cue (stamp, default 38 %), whoCue (12 %), courtCue (48 %), chipCue (item moves, 75 %), destCue (arrives, 90 %)
//   caveat: company ("The company"), notCharged ("Not charged"), coop ("Says it's cooperating"),
//           innocent ("Everyone charged: presumed innocent")
//           cues: notCue (15 %), cue (files handed over, 35 %), innocentCue (70 %)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const pill = (x, y, k, text, o = {}) => { if (k > 0) K.drawLabel(ctx, x, y, Math.min(1.08, k), Object.assign({ text, size: o.size || 30 }, o)); };
  const mode = P.mode || 'plea';

  function serverIcon(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    H.roundRect(ctx, -70, -90, 140, 90, 10); ctx.fillStyle = '#1c2242'; ctx.fill();
    for (let r = 0; r < 2; r++) {
      H.roundRect(ctx, -60, -76 + r * 34, 100, 26, 5); ctx.fillStyle = '#2b3360'; ctx.fill();
      for (let l = 0; l < 3; l++) { const on = H.hash(r * 5 + l, Math.floor(t * 6 + l)) < 0.7; ctx.beginPath(); ctx.arc(26 - l * 11, -63 + r * 34, 3.4, 0, Math.PI * 2); ctx.fillStyle = on ? ACC : 'rgba(255,255,255,0.2)'; ctx.fill(); }
    }
    H.roundRect(ctx, -22, -124, 44, 34, 5); ctx.fillStyle = '#0d1022'; ctx.fill();
    H.roundRect(ctx, -14, -117, 28, 20, 3); ctx.fillStyle = ACC; ctx.fill();
    K.glow(ctx, 0, -107, 46, ACC, 0.45);
    ctx.restore();
  }

  ctx.save();
  if (mode === 'plea') {
    const tWho = at(P.whoCue, D * 0.12), tStamp = at(P.cue, D * 0.38), tCourt = at(P.courtCue, D * 0.48);
    const tChip = at(P.chipCue, D * 0.75), tDest = at(P.destCue || P.chinaCue, D * 0.9);
    const tPanel = Math.min(tChip - 1.6, D - 2.5);
    const gavelAt = tStamp - 0.15;
    K.camera(ctx, t, [{ t: 0, zoom: 1.0 }, { t: gavelAt, zoom: 1.08, x: 520, y: 780 }, { t: tPanel, zoom: 1.0 }, { t: D, zoom: 1.02 }]);
    if (t > gavelAt) K.cameraShake(ctx, t, gavelAt + 0.12, 0.4, 12);
    const room = K.world.courtroom(ctx, { t });
    // judge behind the bench (clipped)
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, room.bench.y + 4); ctx.clip();
    K.drawPerson(ctx, 760, room.bench.y + 170, 1.3, { t, pose: 'stand', flip: true, skin: 3, hair: 4, shirt: '#1d1f2e', hairStyle: 'short', mood: 'neutral', seed: 2, talk: t > tCourt && t < tCourt + 1.5 ? 0.4 : 0 });
    ctx.restore();
    // gavel on the bench: rest, wind up, strike
    let hit = 1;
    if (t >= gavelAt - 0.5 && t < gavelAt) hit = 1 - K.phase(t, gavelAt - 0.5, gavelAt);
    else if (t >= gavelAt) hit = K.phase(t, gavelAt, gavelAt + 0.14, (k) => H.clamp(k) ** 2);
    K.drawGavel(ctx, 600, room.bench.y + 4, 0.95, { hit, shadow: false });
    // defendant + lawyer facing the bench
    K.drawPerson(ctx, 330, 1035, 1.45, { t, pose: 'stand', skin: 1, hair: 0, shirt: '#4a5068', hairStyle: 'short', mood: t > tStamp ? 'worried' : 'neutral', seed: 5, look: 0.6 });
    K.drawPerson(ctx, 150, 1040, 1.35, { t, pose: 'stand', skin: 4, hair: 2, shirt: '#2f3a63', hairStyle: 'long', mood: 'neutral', seed: 8, look: 0.6 });
    K.drawBriefcase(ctx, 200, 1045, 0.5);
    // pills: date then court, who
    const pFade = 1 - smooth((t - tPanel + 0.4) / 0.4);
    if (pFade > 0) {
      ctx.save(); ctx.globalAlpha = pFade;
      pill(290, 470, K.popIn(t, 0.2) * (t < tCourt ? 1 : 1 - smooth((t - tCourt) / 0.2)), P.date || 'In court', { accent: true, size: 32 });
      pill(300, 470, K.popIn(t, tCourt + 0.15), P.court || 'Federal court', { size: 30, dot: true });
      pill(330, 640, K.popIn(t, tWho), P.who || 'The defendant', { size: 28 });
      ctx.restore();
    }
    // stamp
    if (t > tStamp - 0.05 && t < tPanel) {
      const sf = 1 - smooth((t - tPanel + 0.4) / 0.4);
      ctx.save(); ctx.globalAlpha = Math.max(0.0, sf);
      K.drawStamp(ctx, 640, 900, 1.05, { kind: 'check', text: P.stamp || 'PLEADED GUILTY', land: (t - tStamp + 0.05) / 0.5 });
      ctx.restore();
    }
    // the allegation panel
    const pk = K.popIn(t, tPanel, 0.5);
    if (pk > 0) {
      ctx.save(); ctx.translate(487, 640); ctx.scale(pk, pk); ctx.translate(-487, -640);
      H.roundRect(ctx, 80, 430, 815, 420, 30); ctx.fillStyle = 'rgba(8,10,24,0.96)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = H.rgba(ACC, 0.7); ctx.stroke();
      ctx.restore();
      if (pk > 0.9) {
        pill(487, 510, K.popIn(t, tPanel + 0.2), P.by || 'Prosecutors say', { dot: true, size: 30 });
        // server travels along a dashed arrow to the destination
        const pts = K.bezier(260, 720, 400, 570, 600, 570, 740, 720, 40);
        const draw = K.phase(t, tChip, tDest + 0.2);
        ctx.save(); ctx.strokeStyle = H.rgba('#ffffff', 0.5); ctx.lineWidth = 6; ctx.setLineDash([4, 18]); ctx.lineCap = 'round'; ctx.lineDashOffset = -t * 40;
        K.pathDraw(ctx, pts, draw); ctx.restore();
        const sk = K.popIn(t, tPanel + 0.35, 0.45);
        const mv = K.phase(t, tChip + 0.3, tDest + 0.4);
        const [sx, sy] = K.pathPoint(pts, mv);
        if (sk > 0) serverIcon(sx, sy + 40, 1.3 * sk);
        if (sk > 0) pill(sx, sy + 100, sk * (1 - smooth((mv - 0.1) / 0.2)), P.what || 'AI servers', { size: 26 });
        pill(260, 590, K.popIn(t, tPanel + 0.3) * (1 - smooth((mv - 0.1) / 0.2)), P.origin || 'From here', { size: 30 });
        const dk = K.popIn(t, tDest, 0.45);
        if (dk > 0) { K.glow(ctx, 740, 720, 130, ACC, 0.35 * dk); pill(740, 830, dk, P.dest || 'Abroad', { accent: true, size: 38 }); }
      }
    }
  } else {
    const tNot = at(P.notCue, D * 0.15), tCoop = at(P.cue, D * 0.35), tInn = at(P.innocentCue, D * 0.7);
    K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 487, y: 780 }, { t: tCoop + 1, zoom: 1.0 }, { t: tInn, zoom: 1.0 }, { t: D, zoom: 1.06, x: 487, y: 640 }]);
    const room = K.world.courtroom(ctx, { t });
    // emblem glows at the end
    const ek = smooth((t - tInn) / 0.6);
    K.glow(ctx, 540, 470, 220, ACC, 0.45 * ek * (0.85 + 0.15 * Math.sin(t * 3)));
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, 1080, room.bench.y + 4); ctx.clip();
    K.drawPerson(ctx, 760, room.bench.y + 170, 1.3, { t, pose: 'stand', flip: true, skin: 3, hair: 4, shirt: '#1d1f2e', hairStyle: 'short', mood: 'neutral', seed: 2 });
    ctx.restore();
    K.drawGavel(ctx, 600, room.bench.y + 4, 0.95, { hit: 1, shadow: false });
    // company rep (left) hands a file box to an investigator (right)
    K.drawPerson(ctx, 230, 1035, 1.45, { t, pose: t > tCoop - 0.3 && t < tCoop + 1.2 ? 'point' : 'stand', skin: 0, hair: 1, shirt: '#2f7f86', hairStyle: 'curly', mood: 'happy', seed: 3 });
    K.drawPerson(ctx, 760, 1035, 1.45, { t, pose: 'stand', flip: true, skin: 2, hair: 0, shirt: '#3b4580', hairStyle: 'short', mood: 'neutral', seed: 6 });
    K.drawBriefcase(ctx, 840, 1045, 0.55);
    const mv = K.phase(t, tCoop - 0.2, tCoop + 1.0);
    const bx = lerp(330, 650, mv), by = 870 - Math.sin(mv * Math.PI) * 120;
    // box of files
    ctx.save(); ctx.translate(bx, by);
    H.roundRect(ctx, -60, -70, 120, 70, 8); ctx.fillStyle = '#c49a64'; ctx.fill();
    ctx.fillStyle = '#a77d4b'; ctx.fillRect(-60, -70, 120, 14);
    for (let i = 0; i < 4; i++) { H.roundRect(ctx, -48 + i * 24, -96 + (i % 2) * 6, 20, 34, 3); ctx.fillStyle = '#f4f1ea'; ctx.fill(); }
    ctx.restore();
    const sideK = 1 - smooth((t - tInn + 0.3) / 0.3);
    ctx.save(); ctx.globalAlpha = Math.max(0, sideK);
    pill(240, 525, K.popIn(t, 0.15), P.company || 'The company', { size: 32, dot: true });
    pill(240, 595, K.popIn(t, tNot), P.notCharged || 'Not charged', { accent: true, size: 30 });
    pill(280, 665, K.popIn(t, tCoop + 0.2), P.coop || "Says it's cooperating", { size: 28 });
    ctx.restore();
    const ik = K.popIn(t, tInn, 0.5);
    if (ik > 0) {
      ctx.save(); ctx.translate(487, 620); ctx.scale(ik, ik);
      const txt = P.innocent || 'Everyone charged: presumed innocent';
      const ft = H.fitText(ctx, txt, 'bold', 40, 24, 760);
      ctx.font = ft.font; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const w = Math.min(820, ctx.measureText(txt).width + 60);
      H.roundRect(ctx, -w / 2, -44, w, 88, 22); ctx.fillStyle = 'rgba(8,10,24,0.92)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.fillText(txt, 0, 2);
      ctx.restore();
    }
  }
  ctx.restore();
}
