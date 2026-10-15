// Scene "fab-trophies-v2" (full frame, kit v2 + motion.js). A chip-factory clean room (world2.factory) with a generic
// "CHIP FOUNDRY" wall sign, a trophy display case (record-profit quarters) and a worker in a clean-room suit.
// modes: "intro"  (2-beat span) the worker heaves the 6th trophy onto the case at againCue (anticipation, arc, heavy
//                 landing with squash; neighbours wobble), cheers; date / name pills; at "reported" he lifts the
//                 Q3 report; at shipCue chips fly on arcs out of the litho bay into two crates with client name pills;
//                 at sixCue the six trophies hop in a staggered wave, the worker jumps, the "N in a row" pill lands.
//        "caveat" 7-slot case with a "?" slot; order slips flutter in on arcs, ever slower; the worker shrugs (ask pill),
//                 then a red "Not stock advice" pill slams down at adviceCue.
//        "payoff" camera pushes in on the case, trophies glint, a question card drops in heavily at qCue with options.
// params as v1 (fab-trophies.js): mode, sign, shelfTitle, date, name, clients, rowText, ask, advice, buyer, question,
//        options, cues againCue, dateCue, nameCue, shipCue, sixCue, askCue, adviceCue, qCue.
export default function draw(ctx, t, info) {
  const H = info.helpers, K2 = H.kit2, M = H.motion, P = info.params || {};
  const { clamp, lerp, ease } = M;
  const D = info.duration, ACC = info.accent, mode = P.mode || 'intro';
  const intro = mode === 'intro', caveat = mode === 'caveat', payoff = mode === 'payoff';
  const cue = (w, fb) => { const v = w != null ? info.timeOf(w) : null; return v != null ? v : fb; };
  const againAt = cue(P.againCue, Math.min(3.2, D * 0.2)) + 0.2;   // lands just after the hook card leaves, on "Again."
  const dateAt = cue(P.dateCue, 4.2), nameAt = cue(P.nameCue, 5.9), repAt = cue('reported', nameAt + 3.8);
  const shipAt = cue(P.shipCue, D * 0.72), sixAt = cue(P.sixCue, D * 0.9), profAt = cue('Profit', sixAt - 1.1);
  const askAt = cue(P.askCue, 0.3), adviceAt = cue(P.adviceCue, D * 0.55), qAt = cue(P.qCue, D * 0.5);
  const nextAt = cue('next.', D - 0.8), tellAt = cue('Tell', D - 1.5), knowsAt = cue('knows', askAt + 0.2);

  // ---------------------------------------------------------------- layout (world, depth-1 plane)
  const CASE = { x0: 150, x1: 600, top: 760, bot: 1030 };
  const nSlots = intro ? 6 : 7, pitch = (CASE.x1 - CASE.x0) / nSlots, TS = intro ? 0.46 : 0.38;
  const slotX = (i) => CASE.x0 + pitch * (i + 0.5);
  const WX = 668, WS = 1.4;                                   // worker feet x, scale (~530 px tall in world)
  const CR = [{ x: 860 }, { x: 1040 }], CRW = 150, CRH = 96;  // crates
  const SRC = [800, 560];                                     // chips leave the litho bay here

  // ---------------------------------------------------------------- camera (feet stay at ~1040 on screen)
  const ck = (tt, x, z, e) => ({ t: tt, x, y: 305 - 318 / z, zoom: z, ease: e });
  let keys;
  if (intro) keys = [ck(0, -30, 1.16), ck(againAt - 0.6, -38, 1.18), ck(againAt + 0.5, -40, 1.1), ck(dateAt + 0.6, -25, 1.08),
    ck(repAt - 0.3, -15, 1.14), ck(repAt + 1.4, -5, 1.16), ck(shipAt - 0.9, -5, 1.15), ck(shipAt - 0.1, 215, 1.05),
    ck(profAt - 0.2, 205, 1.06), ck(profAt + 0.9, -40, 1.04), ck(D, -42, 1.02)];
  else if (caveat) keys = [ck(0, 60, 1.1), ck(adviceAt - 0.4, 55, 1.12), ck(adviceAt + 0.6, 40, 1.16), ck(D, 35, 1.18)];
  else keys = [ck(0, 40, 1.14), ck(qAt - 0.4, -20, 1.24), ck(qAt + 0.8, -10, 1.2), ck(D, -10, 1.22)];
  const cam = K2.cam(t, keys);

  const W = K2.world2.factory(ctx, { t, cam, behind: (g) => sign(g, K2, M, t, P.sign || 'CHIP FOUNDRY', ACC, intro ? shipAt : -9) });
  const L = W.light;

  // ---------------------------------------------------------------- worker timeline
  // celebration = fist pump (keeps the raised hand below the header: y >= 410 on screen)
  const FIST = { sN: 2.0, eN: 1.05, sF: -0.35, eF: -0.9, handN: 'fist', handF: 'fist', lean: -0.03, nod: -0.12 };
  const out = {};
  let pose = 'stand', pose2 = null, poseMix = 0, reach = null, lean = 0, squash = 0, hop = 0, facing = -0.5, look = -0.25;
  let expr = 'neutral', expr2 = null, exprMix = 0, exag = 1;
  const toLocal = (wx, wy) => [(wx - WX) / WS, (wy - 1030) / WS];
  // intro: heave the 6th trophy (heavy timing)
  const heave0 = againAt - 0.9, heave1 = againAt - 0.45;     // anticipation, then action lands at againAt
  const slot6 = [slotX(5), CASE.top];
  const gripDy = 80 * TS;                                     // hand grips the trophy stem
  let trophyInHand = null;
  if (intro) {
    const hipHold = [-34, -196], low = [-28, -176], place = toLocal(slot6[0], slot6[1] - gripDy);
    if (t < heave0) { reach = [hipHold[0] + M.hold(t, 3, 2), hipHold[1] + M.breathe(t, 3).k * 2]; lean = 0.02; expr = 'focused'; look = -0.5; }
    else if (t < heave1) { const k = ease.inOut((t - heave0) / (heave1 - heave0)); reach = [lerp(hipHold[0], low[0], k), lerp(hipHold[1], low[1], k)]; lean = -0.07 * Math.sin(k * Math.PI * 0.5); squash = -0.07 * Math.sin(k * Math.PI * 0.5); expr = 'focused'; look = -0.6; }
    else if (t < againAt) { const k = (t - heave1) / (againAt - heave1); const p = M.arc(low, place, k, 46, (x) => ease.inOut(x, 1.8)); reach = [p[0], p[1]]; lean = lerp(-0.07, 0.1, ease.out(k)); squash = 0.05 * Math.sin(k * Math.PI); expr = 'focused'; look = -0.6; }
    else if (t < againAt + 0.22) { reach = place; lean = 0.1 * (1 - (t - againAt) / 0.22); look = -0.6; expr = 'happy'; }
    if (t < againAt + 0.22) {
      const hand = toLocal(0, 0); // placeholder (hand comes from out after drawing)
      trophyInHand = t < againAt;
    }
    // cheer after placing (snappy, exaggerated), then a proud hand-on-hip moving hold
    const cheer = M.act(t, againAt + 0.25, { timing: 'normal', wind: 0.35, exag: 1.25 });
    const cheerOut = ease.inOut((t - (againAt + 1.5)) / 0.5);
    if (t >= againAt + 0.22) {
      pose = 'stand'; pose2 = FIST; poseMix = clamp(cheer.v) * (1 - cheerOut); exag = 1;
      squash = cheer.phase === 'anticipate' ? -0.08 * cheer.wind : M.squashImpact(t, cheer.hit, 0.08, 0.5);
      expr = 'happy'; expr2 = 'joy'; exprMix = clamp(cheer.v) * (1 - cheerOut * 0.6); look = lerp(-0.4, 0, cheerOut);
      if (cheerOut >= 1) { pose = 'stand'; pose2 = 'hips'; poseMix = ease.inOut((t - (againAt + 2.0)) / 0.6); exag = 1; expr = 'happy'; expr2 = 'smirk'; exprMix = 0.5; look = M.hold(t, 5, 0.12); }
    }
    // the report: lifted on an arc at "reported", shown proudly, then tossed onto the counter at "Profit"
    if (t > repAt - 0.35 && t < profAt + 0.45) {
      const up = M.act(t, repAt - 0.35, { timing: 'normal', wind: 0.4 });
      const from = [-20, -170], show = [-118, -330];
      const k = clamp(up.v, -0.4, 1.08);
      const p = k < 0 ? [from[0], from[1] - k * 30] : M.arc(from, show, clamp(k), 50, (x) => x);
      reach = [p[0] + (k > 1 ? (k - 1) * -40 : 0), p[1] + M.hold(t, 8, 2)];
      pose = 'stand'; pose2 = 'hips'; poseMix = 1; expr = 'happy'; expr2 = 'smirk'; exprMix = 0.6; look = -0.1;
      if (t > profAt - 0.3) { // toss: wind back, flick
        const toss = M.act(t, profAt - 0.3, { timing: 'snappy', wind: 0.6 });
        const back = [-60, -360];
        reach = toss.v < 0 ? [lerp(show[0], back[0], -toss.v / 0.6), lerp(show[1], back[1], -toss.v / 0.6)] : [lerp(back[0], -150, clamp(toss.v)), lerp(back[1], -250, clamp(toss.v))];
      }
    }
    // shipping shot: turn to the crates, present them
    const turn = ease.inOut((t - (shipAt - 1.0)) / 0.7);
    const back2 = ease.inOut((t - (profAt + 0.1)) / 0.6);
    if (t > shipAt - 1.0) facing = lerp(-0.5, 0.4, turn * (1 - back2)) || 0.01;
    if (t > shipAt - 1.0 && t < profAt + 0.7) {
      look = lerp(look, 0.5, turn * (1 - back2));
      const pr = M.act(t, shipAt - 0.25, { timing: 'normal', wind: 0.3 });
      if (t < profAt - 0.35) { reach = null; pose = 'stand'; pose2 = 'present'; poseMix = clamp(pr.v) * (1 - ease.inOut((t - (profAt - 0.9)) / 0.5)); expr = 'happy'; expr2 = 'joy'; exprMix = 0.4 * clamp(pr.v); }
    }
    // "sixth": crouch, jump, land with squash; cheer (exaggerated take)
    const j0 = sixAt + 0.05, jA = 0.22, jAir = 0.5;
    const jt = t - j0;
    if (jt > -0.05) {
      pose = 'stand'; pose2 = FIST; exag = 1; reach = null; facing = -0.35;
      if (jt < jA) { const k = clamp(jt / jA); squash = -0.11 * Math.sin(k * Math.PI * 0.5); poseMix = 0.15 * k; expr = 'happy'; }
      else if (jt < jA + jAir) { const u = (jt - jA) / jAir; hop = 26 * 4 * u * (1 - u); squash = 0.12 * Math.cos(u * Math.PI); poseMix = clamp(ease.out(u * 2.2)); expr = 'joy'; }
      else { squash = M.squashImpact(t, j0 + jA + jAir, 0.12, 0.5); poseMix = 1 - 0.25 * ease.inOut((jt - jA - jAir - 0.6) / 0.8); expr = 'joy'; expr2 = 'happy'; exprMix = ease.inOut((jt - 1.6) / 0.8); }
      look = -0.15;
    }
  }
  if (caveat) {
    facing = -0.45;
    // exaggerated shrug at "knows" with anticipation; worried; then a thoughtful glance at the "?" slot on "next"
    const sh = M.act(t, knowsAt - 0.1, { timing: 'normal', wind: 0.45, exag: 1.3 });
    const relax = ease.inOut((t - (adviceAt - 0.5)) / 0.6);
    pose = 'stand'; pose2 = 'shrug'; poseMix = clamp(sh.v) * (1 - relax); exag = 1.3;
    squash = sh.phase === 'anticipate' ? -0.06 * sh.wind : M.squashImpact(t, sh.hit, 0.05, 0.4);
    expr = 'neutral'; expr2 = 'worried'; exprMix = clamp(sh.v);
    look = lerp(0.4, 0.15, clamp(sh.v));
    if (t > adviceAt - 0.5) { // hands up, palms out ("not advice") -> then think
      const hu = M.act(t, adviceAt - 0.35, { timing: 'normal', wind: 0.3 });
      pose = 'shrug'; pose2 = 'present'; poseMix = clamp(hu.v); expr = 'worried'; expr2 = 'focused'; exprMix = clamp(hu.v) * 0.6; look = 0.0;
      if (t > nextAt - 2.4) { const th = ease.inOut((t - (nextAt - 2.4)) / 0.6); pose = 'present'; pose2 = 'think'; poseMix = th; expr = 'focused'; expr2 = 'thinking'; exprMix = th; look = lerp(0, -0.7, th); }
    }
  }
  if (payoff) {
    facing = -0.45;
    const th = M.act(t, 0.15, { timing: 'normal', wind: 0.2 });
    pose = 'stand'; pose2 = 'think'; poseMix = clamp(th.v); expr = 'thinking'; look = -0.6;
    const tk = M.act(t, qAt + 0.25, { timing: 'take', wind: 0.5, exag: 1.25 });   // reacts to the card landing
    if (t > qAt + 0.25) { expr = 'thinking'; expr2 = 'surprised'; exprMix = clamp(tk.v) * (1 - ease.inOut((t - qAt - 1.0) / 0.5)); squash = tk.phase === 'anticipate' ? -0.06 * tk.wind : M.squashImpact(t, tk.hit, 0.1, 0.5); look = -0.2; }
    if (t > tellAt - 0.3) { const pr = M.act(t, tellAt - 0.3, { timing: 'normal', wind: 0.3 }); pose = 'think'; pose2 = 'present'; poseMix = clamp(pr.v); expr = 'happy'; expr2 = 'joy'; exprMix = 0.5 * clamp(pr.v); look = 0.1; facing = -0.3; }
  }

  // ---------------------------------------------------------------- draw the stage
  W.stage(ctx, () => {
    // crates (back half + contents), behind the worker
    const chips = intro ? chipFlights(shipAt) : [];
    const crSq = CR.map((c, i) => {
      const landed = chips.filter((f) => f.k === i && t > f.t1);
      const lastHit = landed.length ? landed[landed.length - 1].t1 : -9;
      const cs = M.squashImpact(t, lastHit, 0.07, 0.35);
      crate(ctx, K2, M, L, c.x, 1030, cs, landed.length, t, ACC);
      return cs;
    });
    // trophy case + trophies
    displayCase(ctx, K2, L, CASE, P.shelfTitle || 'RECORD-PROFIT QUARTERS', t, M.squashImpact(t, intro ? againAt : -9, 0.025, 0.4));
    for (let i = 0; i < nSlots; i++) {
      const x = slotX(i);
      if (intro && i === 5 && t < againAt) { emptySlot(ctx, K2, x, CASE.top, TS, t, false, ACC); continue; }
      if (i === 6) { emptySlot(ctx, K2, x, CASE.top, TS, t, true, ACC); continue; }
      let dy = 0, sq = 0, rot = 0, glint = 0;
      if (intro) {
        if (i === 5) sq = M.squashImpact(t, againAt, 0.22, 0.55);
        else rot = M.settle(t, againAt + Math.abs(5 - i) * 0.05, 0.07 / (1 + Math.abs(5 - i) * 0.5), 2.8, 4.5);
        const h = trophyHop(M, t, sixAt - 0.2 + i * 0.09, 30); dy = h.dy; sq += h.sq;
      }
      if (payoff) { const g = M.act(t, 0.2 + i * 0.12, { timing: 'snappy', wind: 0.15 }); glint = clamp(g.v) * (0.5 + 0.5 * Math.sin(t * 3 - i * 0.8)); sq = g.phase === 'anticipate' ? -0.06 * g.wind : M.squashImpact(t, g.hit, 0.1, 0.4); }
      ctx.save();
      ctx.translate(x, CASE.top); ctx.rotate(rot); ctx.translate(-x, -CASE.top);
      M.squashTransform(ctx, x, CASE.top, sq, 0);
      K2.drawTrophy(ctx, x, CASE.top + dy, TS, { t: t + i * 0.7, light: L, label: String(i + 1), shadow: dy > -2 });
      if (glint > 0.05) K2.glow(ctx, x, CASE.top - 160 * TS + dy, 140 * TS * 1.6, ACC, 0.35 * glint);
      ctx.restore();
    }
    // landing sparkle for the new trophy
    if (intro && t > againAt && t < againAt + 0.8) {
      const b = (t - againAt) / 0.8, x = slotX(5), y = CASE.top - 110 * TS;
      for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 + 0.3, r = 30 + 90 * ease.out(b); star(ctx, x + Math.cos(a) * r, y + Math.sin(a) * r * 0.8, 7 * (1 - b) + 2, k % 2 ? ACC : '#ffffff', 1 - b); }
      K2.glow(ctx, x, y, 150, ACC, 0.45 * (1 - b));
    }
    // order slips (caveat): float in on arcs from the right, ever slower, land on the right crate's tray
    if (caveat) slips(ctx, K2, M, L, t, CR[0].x, 1030 - CRH, D);
    // the report (intro): document flying / lying on the counter
    // worker
    K2.drawHuman(ctx, WX, 1030 - hop, WS, {
      t, seed: 7, age: 'adult', outfit: 'cleanroom', skin: 3, eyes: 0, pose, pose2, poseMix, reach, lean, facing, look,
      expr, expr2, exprMix, squash, exag, light: L, out, driveY: (tt) => -jumpY(tt, sixAt + 0.05) * 1.2,
    });
    // trophy in the hand (intro, before the landing)
    if (intro && t < againAt && out.hand) {
      K2.drawTrophy(ctx, out.hand[0] - 4, out.hand[1] + gripDy, TS, { t, light: L, label: '6', shadow: false });
    }
    if (intro && t > repAt - 0.35) reportDoc(ctx, K2, M, L, t, out.hand, repAt, profAt);
    // chips in flight (in front of everything except the crate fronts)
    for (const f of chips) {
      if (t < f.t0 || t > f.t1) continue;
      const k = (t - f.t0) / (f.t1 - f.t0);
      const p = M.arc(SRC, [CR[f.k].x + f.dx, 1030 - CRH + 20], k, 120 + f.dx, (x) => ease.inOut(x, 1.25));
      const q = M.arc(SRC, [CR[f.k].x + f.dx, 1030 - CRH + 20], Math.min(1, k + 0.02), 120 + f.dx, (x) => ease.inOut(x, 1.25));
      const st = M.stretchFromVelocity((q[0] - p[0]) * 40, (q[1] - p[1]) * 40, 0.0004, 0.3);
      const born = clamp(k / 0.12);
      ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(born, born);
      M.squashTransform(ctx, 0, 0, st.s, st.angle); ctx.rotate(Math.sin(k * 6 + f.dx) * 0.5);
      K2.drawChip(ctx, 0, 40, 0.22, { t, light: L, glow: 0.8, shadow: false });
      ctx.restore();
    }
    CR.forEach((c, i) => crateFront(ctx, K2, M, L, c.x, 1030, crSq[i]));
  });
  W.front(ctx);

  // ---------------------------------------------------------------- overlays (screen space, crisp text)
  if (intro) {
    // source flash before the chips start (anticipation)
    const sp = W.toScreen(SRC[0], SRC[1]);
    const fl = M.anticipate(t, shipAt - 0.45, 0.45, 1);
    if (fl < 0) K2.glow(ctx, sp[0], sp[1], 180, ACC, -0.6 * fl);
    const dOut = ease.in((t - (nameAt - 0.3)) / 0.3);
    pill(ctx, K2, M, t, 400, 432, P.date || 'Oct 15 · Q3 results', dateAt, dOut, { size: 30, dot: true, maxW: 560 });
    const nOut = ease.in((t - (shipAt - 1.1)) / 0.35);
    pill(ctx, K2, M, t, 395, 432, P.name || 'Chipmaker', nameAt, nOut, { size: 28, maxW: 590 });
    const clients = P.clients || ['Client A', 'Client B'];
    const cOut = ease.in((t - (profAt + 0.2)) / 0.35);
    CR.forEach((c, i) => { const s = W.toScreen(c.x, 1030 - CRH - 40); pill(ctx, K2, M, t, s[0], Math.min(s[1], 900), clients[i], shipAt + i * 0.25, cOut, { size: 30 }); });
    const r = W.toScreen((CASE.x0 + CASE.x1) / 2, 915);
    pill(ctx, K2, M, t, r[0], r[1], P.rowText || '6 in a row', sixAt, 0, { size: 30, accent: true, maxW: 600 });
  }
  if (caveat) {
    const b = W.toScreen(CR[0].x + 40, 560);
    pill(ctx, K2, M, t, 815, 575, P.buyer || 'AI companies', 0.05, 0, { size: 26 });
    const aOut = ease.in((t - (adviceAt - 0.35)) / 0.3);
    const r = W.toScreen((CASE.x0 + CASE.x1) / 2, 915);
    pill(ctx, K2, M, t, r[0] + 20, r[1], P.ask || 'How long will this pace last?', askAt + 0.2, aOut, { size: 28, dot: true, maxW: 640 });
    advicePill(ctx, K2, M, t, r[0] + 20, r[1], P.advice || 'Not stock advice', adviceAt);
  }
  if (payoff) {
    const r = W.toScreen((CASE.x0 + CASE.x1) / 2, 915);
    const qOut = ease.in((t - (qAt - 0.3)) / 0.3);
    pill(ctx, K2, M, t, r[0], r[1], P.rowText || '6 in a row', 0.1, qOut, { size: 32, accent: true });
    questionCard(ctx, K2, M, t, 487, 930, P.question || 'A boom that lasts, or a peak?', P.options || ['LASTS', 'PEAK'], qAt, ACC);
  }

  function chipFlights(at) {
    const f = [];
    for (let k = 0; k < 2; k++) for (let i = 0; i < 8; i++) { const t0 = at - 0.05 + i * 0.42 + k * 0.21; f.push({ k, t0, t1: t0 + 0.8, dx: (H.hash(i, k + 3) - 0.5) * 60 }); }
    return f;
  }
}

// jump height (world px) of the worker's "sixth" jump, for follow-through drive
function jumpY(tt, j0) { const a = tt - j0 - 0.22; return a > 0 && a < 0.5 ? 26 * 4 * (a / 0.5) * (1 - a / 0.5) : 0; }

// trophy hop: anticipation squash, stretch up, land, squash + settle (heavy-ish)
function trophyHop(M, t, t0, h) {
  const a = t - t0;
  if (a < 0) return { dy: 0, sq: 0 };
  if (a < 0.16) return { dy: 0, sq: -0.14 * Math.sin((a / 0.16) * Math.PI * 0.5) };
  if (a < 0.58) { const u = (a - 0.16) / 0.42; return { dy: -h * 4 * u * (1 - u), sq: 0.14 * Math.cos(u * Math.PI) * (u < 0.5 ? 1 : 0.4) }; }
  return { dy: 0, sq: M.squashImpact(t, t0 + 0.58, 0.18, 0.5) };
}

function sign(g, K2, M, t, text, ACC, flashAt) {
  const x = 835, y = 462, w = 290, h = 52;
  g.save();
  g.translate(x, y); g.rotate(M.sway(t, 3, 0.012, 0.25));
  g.strokeStyle = '#3a4458'; g.lineWidth = 4; g.beginPath(); g.moveTo(-110, -h / 2); g.lineTo(-110, -h / 2 - 60); g.moveTo(110, -h / 2); g.lineTo(110, -h / 2 - 60); g.stroke();
  K2.solid(g, () => { g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 12); }, K2.mat('#1a1f33'), [-w / 2, -h / 2, w, h], -1, { rim: 2 });
  const fl = 0.85 + 0.15 * Math.sin(t * 2.3) + (t > flashAt - 0.4 && t < flashAt ? 0.3 : 0);
  K2.glow(g, 0, 0, 170, ACC, 0.16 * fl);
  g.fillStyle = ACC; g.font = K2.font.display(30); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.globalAlpha = Math.min(1, fl); g.fillText(text, 0, 2);
  g.restore();
}

function displayCase(ctx, K2, L, C, title, t, sq) {
  const w = C.x1 - C.x0 + 30, x = (C.x0 + C.x1) / 2;
  ctx.save();
  K2.contactShadow(ctx, x, C.bot, w + 40, 0.55, 0.1);
  ctx.translate(x, C.bot); ctx.scale(1 / (1 + sq), 1 + sq); ctx.translate(-x, -C.bot);
  // backboard (dark, so the gold reads) with the title
  const bb = [C.x0 - 15, C.top - 200, w, 200];
  K2.solid(ctx, () => { ctx.beginPath(); ctx.roundRect(bb[0], bb[1], bb[2], bb[3], [16, 16, 0, 0]); }, K2.mat('#1b2238', L), bb, L.dir, { rim: 2.5, top: 0.15 });
  ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let i = 0; i < 6; i++) ctx.fillRect(bb[0] + 18 + i * (bb[2] - 36) / 6, bb[1] + 46, 2, bb[3] - 52);
  ctx.font = K2.font.ui(19); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.fillText(title, x, bb[1] + 26);
  // counter body
  const body = [C.x0 - 22, C.top, w + 14, C.bot - C.top];
  K2.solid(ctx, () => { ctx.beginPath(); ctx.roundRect(body[0], body[1], body[2], body[3], 10); }, K2.mat('#d6dce8', L), body, L.dir, { rim: 3, ao: 0.3, top: 0.25 });
  ctx.fillStyle = 'rgba(40,50,80,0.12)'; ctx.fillRect(body[0] + 18, body[1] + 40, body[2] - 36, body[3] - 60);
  ctx.strokeStyle = 'rgba(40,50,80,0.18)'; ctx.lineWidth = 2; ctx.strokeRect(body[0] + 18, body[1] + 40, body[2] - 36, body[3] - 60);
  // top slab
  K2.solid(ctx, () => { ctx.beginPath(); ctx.roundRect(C.x0 - 30, C.top - 14, w + 30, 20, 8); }, K2.mat('#8a6a4a', L), [C.x0 - 30, C.top - 14, w + 30, 20], L.dir, { rim: 2, top: 0.5 });
  ctx.restore();
}

function emptySlot(ctx, K2, x, y, s, t, q, ACC) {
  const a = 0.5 + 0.5 * Math.sin(t * 4);
  ctx.save(); ctx.setLineDash([8, 7]); ctx.lineWidth = 3; ctx.strokeStyle = `rgba(255,255,255,${0.3 + 0.3 * a})`;
  ctx.beginPath(); ctx.roundRect(x - 70 * s, y - 230 * s, 140 * s, 222 * s, 12); ctx.stroke(); ctx.setLineDash([]);
  if (q) {
    const b = Math.sin(t * 2.2) * 4;
    K2.glow(ctx, x, y - 120 * s, 120 * s * 1.4, ACC, 0.18 + 0.12 * a);
    ctx.font = K2.font.display(60 * s * 2); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ACC; ctx.fillText('?', x, y - 115 * s + b);
  }
  ctx.restore();
}

function crate(ctx, K2, M, L, x, y, sq, n, t, ACC) {
  const w = 150, h = 96;
  ctx.save();
  K2.contactShadow(ctx, x, y, w + 30, 0.5, 0.14);
  M.squashTransform(ctx, x, y, sq, 0);
  // back wall + inside
  ctx.fillStyle = '#4a3a2c'; ctx.beginPath(); ctx.roundRect(x - w / 2 + 6, y - h - 18, w - 12, 30, 4); ctx.fill();
  // chips piled inside (peeking over the rim)
  const shown = Math.min(n, 8);
  for (let i = 0; i < shown; i++) { const cx = x - 46 + (i % 4) * 30 + (i > 3 ? 14 : 0), cy = y - h + 8 - (i > 3 ? 10 : 0); K2.drawChip(ctx, cx, cy, 0.16, { t, light: L, glow: 0.5, shadow: false }); }
  ctx.restore();
}
function crateFront(ctx, K2, M, L, x, y, sq) {
  const w = 150, h = 96;
  ctx.save(); M.squashTransform(ctx, x, y, sq, 0);
  K2.solid(ctx, () => { ctx.beginPath(); ctx.roundRect(x - w / 2, y - h, w, h, 6); }, K2.mat('#b3895a', L), [x - w / 2, y - h, w, h], L.dir, { rim: 2.5, ao: 0.3, top: 0.2 });
  K2.texture(ctx, 'wood', x - w / 2, y - h, w, h, '#3a2210', 0.25, 5);
  ctx.fillStyle = 'rgba(60,35,15,0.35)'; for (let i = 1; i < 3; i++) ctx.fillRect(x - w / 2, y - h + i * h / 3, w, 3);
  ctx.fillStyle = 'rgba(255,240,210,0.25)'; ctx.fillRect(x - w / 2, y - h, w, 4);
  ctx.restore();
}

function reportDoc(ctx, K2, M, L, t, hand, repAt, profAt) {
  if (!hand) return;
  const { clamp, ease } = M;
  const tossAt = profAt - 0.3 + 0.12 + 0.16;                 // release at the end of the flick
  if (t < tossAt) {
    const rot = 0.12 + M.settle(t, repAt + 0.15, 0.25, 1.6, 3) + M.hold(t, 2, 0.03);
    K2.drawDocument(ctx, hand[0] - 10, hand[1] + 60, 0.62, { t, light: L, title: 'Q3 RESULTS', lines: 6, seal: true, tilt: rot });
    return;
  }
  // flight on an arc to the counter top, floaty, lands flat with a small bounce
  const k = clamp((t - tossAt) / 0.55);
  const p = M.arc([hand[0] - 10, hand[1] + 60], [560, 748], k, 70, (x) => ease.inOut(x, 1.4));
  if (k < 1) { K2.drawDocument(ctx, p[0], p[1], 0.62 * (1 - 0.3 * k), { t, light: L, title: 'Q3 RESULTS', lines: 6, seal: true, tilt: 0.12 + k * 1.3 }); return; }
  const b = M.squashImpact(t, tossAt + 0.55, 0.3, 0.4);
  ctx.save(); ctx.translate(560, 750); ctx.scale(1 - b * 0.3, 1 + b);
  ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, 2, 44, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f3f1ea'; ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(34, 0); ctx.lineTo(46, -10); ctx.lineTo(-28, -10); ctx.closePath(); ctx.fill();
  ctx.restore();
}

function slips(ctx, K2, M, L, t, tx, ty, D) {
  const { clamp, ease } = M;
  // arrival times spread out: the pace slows
  let at = -0.4, n = 0;
  const times = [];
  for (let i = 0; i < 16; i++) { times.push(at); at += 0.32 + i * 0.12; }
  const fl = 1.15;
  for (let i = 0; i < times.length; i++) {
    const t0 = times[i], k = (t - t0) / fl;
    if (k >= 1) { n++; continue; }
    if (k <= 0) continue;
    const s0 = [1040 + (i % 3) * 30, 470 + (i % 2) * 30], s1 = [tx + ((i * 37) % 50) - 25, ty - 6];
    const p = M.arc(s0, s1, k, 60 + (i % 3) * 20, (x) => ease.inOut(x, 1.5));
    const flutter = Math.sin(t * 7 + i) * 0.35 * (1 - k) + (p[2] - Math.PI / 2) * 0.15;
    paper(ctx, p[0], p[1], 0.75, flutter, 1 - Math.abs(Math.sin(t * 5 + i)) * 0.5);
  }
  // tray on the crate with the stack
  ctx.save();
  ctx.fillStyle = '#5c6684'; ctx.beginPath(); ctx.roundRect(tx - 62, ty - 10, 124, 12, 4); ctx.fill();
  const lastLand = times.filter((x) => x + fl < t).pop() || -9;
  const sq = M.squashImpact(t, lastLand + fl, 0.12, 0.3);
  ctx.translate(tx, ty - 8); ctx.scale(1 / (1 + sq), 1 + sq);
  for (let i = 0; i < Math.min(n, 14); i++) { ctx.fillStyle = i % 2 ? '#e9ecf4' : '#f6f7fb'; ctx.beginPath(); ctx.roundRect(-46 + ((i * 7) % 9) - 4, -5 - i * 4, 92, 6, 2); ctx.fill(); }
  ctx.restore();
}
function paper(ctx, x, y, s, rot, sx) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s * Math.max(0.3, sx), s);
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.roundRect(-28, -34, 60, 76, 6); ctx.fill();
  ctx.fillStyle = '#f4f6fb'; ctx.beginPath(); ctx.roundRect(-30, -38, 60, 76, 6); ctx.fill();
  ctx.fillStyle = '#9aa3c7'; for (let i = 0; i < 4; i++) ctx.fillRect(-20, -24 + i * 14, i === 3 ? 22 : 40, 5);
  ctx.restore();
}

function star(ctx, x, y, r, c, a) {
  ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.fillStyle = c; ctx.beginPath();
  for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.4 : r, an = (i / 8) * Math.PI * 2; ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
  ctx.closePath(); ctx.fill(); ctx.restore();
}

// ---------------------------------------------------------------- pills (screen space) with anticipation + overshoot
function popState(M, t, at) { return M.act(t, at - 0.14, { timing: 'snappy', wind: 0.3, overshoot: 0.16 }); }
function pill(ctx, K2, M, t, x, y, text, at, outK, o = {}) {
  const a = popState(M, t, at);
  if (a.phase === 'before' || outK >= 1) return;
  const ACC = K2.ACCENT.base;
  if (a.phase === 'anticipate') { K2.glow(ctx, x, y, 60, ACC, 0.5 * a.wind); ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(x, y, 10 * (1 - 0.6 * a.wind), 0, Math.PI * 2); ctx.fill(); return; }
  const v = Math.max(0, a.v), sx = a.phase === 'action' ? 1 + 0.12 * (1 - a.k) : 1 + M.squashImpact(t, a.hit, -0.08, 0.35) * 0.5;
  ctx.save();
  ctx.globalAlpha = 1 - (outK > 0 ? outK : 0);
  ctx.translate(x, y - (outK > 0 ? 24 * outK : 0)); ctx.scale(v * sx, v / sx);
  let fs = o.size || 28; ctx.font = K2.font.bold(fs);
  const maxW = o.maxW || 860, dotW = o.dot ? 30 : 0;
  let w = ctx.measureText(text).width;
  while (w + 60 + dotW > maxW && fs > 16) { fs--; ctx.font = K2.font.bold(fs); w = ctx.measureText(text).width; }
  const pw = w + 60 + dotW, ph = Math.round(fs * 2.05);
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
  ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, ph / 2);
  if (o.accent) { const g = ctx.createLinearGradient(0, -ph / 2, 0, ph / 2); g.addColorStop(0, K2.ACCENT.light); g.addColorStop(1, ACC); ctx.fillStyle = g; }
  else ctx.fillStyle = 'rgba(12,14,30,0.9)';
  ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.lineWidth = 2; ctx.strokeStyle = o.accent ? 'rgba(255,255,255,0.5)' : 'rgba(255,225,74,0.4)'; ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.beginPath(); ctx.roundRect(-pw / 2 + 10, -ph / 2 + 4, pw - 20, ph * 0.32, ph * 0.16); ctx.fill();
  if (o.dot) { ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(-pw / 2 + 30, 0, 7 + Math.sin(t * 6) * 1.5, 0, Math.PI * 2); ctx.fill(); }
  ctx.fillStyle = o.accent ? '#1a1d33' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, dotW / 2, 1);
  ctx.restore();
}
// red "Not stock advice" pill: rises a little (anticipation), then slams down (heavy) with squash
function advicePill(ctx, K2, M, t, x, y, text, at) {
  const a = M.act(t, at - 0.5, { timing: 'heavy', wind: 0.5, overshoot: 0.02 });
  if (a.phase === 'before') return;
  const drop = a.phase === 'anticipate' ? -40 * a.wind - 60 : a.phase === 'action' ? lerpN(-80, 0, M.ease.in(a.k, 2)) : 0;
  const al = a.phase === 'anticipate' ? a.wind * 0.6 : 1;
  const sq = a.phase === 'action' ? 0.18 * a.k : M.squashImpact(t, a.hit, 0.2, 0.45);
  ctx.save(); ctx.globalAlpha = al; ctx.translate(x, y + drop + 30); M.squashTransform(ctx, 0, 0, sq, 0); ctx.translate(0, -30);
  ctx.font = K2.font.bold(32); const w = ctx.measureText(text).width + 120;
  ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
  ctx.beginPath(); ctx.roundRect(-w / 2, -34, w, 68, 34); const g = ctx.createLinearGradient(0, -34, 0, 34); g.addColorStop(0, '#ff7a6e'); g.addColorStop(1, '#e8433f'); ctx.fillStyle = g; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-w / 2 + 40, 0, 17, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e8433f'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-w / 2 + 29, 11); ctx.lineTo(-w / 2 + 51, -11); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, -w / 2 + 72, 1);
  ctx.restore();
  if (a.phase === 'settle' || a.phase === 'done') { const b = (t - a.hit) / 0.5; if (b < 1) for (let k = 0; k < 8; k++) { const an = Math.PI + (k / 7) * Math.PI; ctx.strokeStyle = `rgba(255,255,255,${0.6 * (1 - b)})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + Math.cos(an) * (w / 2 + 10 + 30 * b), y + 30 + Math.sin(an) * (40 + 20 * b)); ctx.lineTo(x + Math.cos(an) * (w / 2 + 24 + 40 * b), y + 30 + Math.sin(an) * (52 + 26 * b)); ctx.stroke(); } }
}
function lerpN(a, b, k) { return a + (b - a) * k; }
// question card: anticipation (rises), falls heavily, squashes on landing; options pop in staggered
function questionCard(ctx, K2, M, t, x, y, q, opts, at, ACC) {
  const a = M.act(t, at - 0.55, { timing: 'heavy', wind: 0.35, overshoot: 0.03 });
  if (a.phase === 'before') return;
  const fall = a.phase === 'action' ? lerpN(-250, 0, M.ease.in(a.k, 2.2)) : 0;
  const sq = a.phase === 'action' ? 0.2 * a.k : M.squashImpact(t, a.hit, 0.16, 0.55);
  if (a.phase === 'anticipate') { K2.glow(ctx, x, y + 60, 260, ACC, 0.2 * a.wind); return; }
  ctx.save(); ctx.globalAlpha = a.phase === 'action' ? Math.min(1, a.k * 3) : 1; ctx.translate(x, y + fall + 110); M.squashTransform(ctx, 0, 0, sq, 0); ctx.translate(0, -110);
  ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 12;
  ctx.beginPath(); ctx.roundRect(-400, -110, 800, 220, 30); ctx.fillStyle = 'rgba(244,245,252,0.98)'; ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#1a1d33'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let fs = 46; ctx.font = K2.font.display(fs); while (ctx.measureText(q).width > 720 && fs > 26) { fs--; ctx.font = K2.font.display(fs); }
  ctx.fillText(q, 0, -50);
  opts.forEach((o, i) => {
    const p = M.act(t, at + 0.25 + i * 0.22, { timing: 'snappy', wind: 0.3, overshoot: 0.2 });
    if (p.phase === 'before') return;
    const s = Math.max(0.05, p.phase === 'anticipate' ? 0.15 * (1 - p.wind) : p.v);
    ctx.save(); ctx.translate(i ? 170 : -170, 40); ctx.scale(s, s);
    ctx.beginPath(); ctx.roundRect(-140, -38, 280, 76, 38); ctx.fillStyle = i ? '#2a2f55' : ACC; ctx.fill();
    ctx.fillStyle = i ? '#ffffff' : '#1a1d33'; ctx.font = K2.font.display(32); ctx.fillText(o, 0, 3);
    ctx.restore();
  });
  ctx.restore();
}
