// Scene "v2-showcase" (full frame, ~12 s): the kit v2 "storybook realism" look and the 12 animation principles.
// Night living room with a parallax camera. A kid on the sofa hears a phone buzz, anticipates, reaches on an arc,
// picks it up and does a squash-and-stretch "take"; an adult walks in from the hall on a curved path (hair and tie
// follow through, then settle when they stop); the mascot robot pops up out of a glowing spot with anticipation,
// overshoot and a damped settle, and waves. Everyone ends in a moving hold (breathing, blinks, drift).
// params: (all optional) kidSkin, adultSkin, sofa (colour), cues are fixed fractions of the duration (12 s nominal).
// Fits: "a new AI feature lands on your phone", "the assistant shows up at home", any everyday-life hook.
export default function draw(ctx, t, info) {
  const H = info.helpers, K2 = H.kit2, M = H.motion, P = info.params || {};
  const { clamp, lerp } = M;
  const D = info.duration || 12, u = D / 12;            // timings are authored for 12 s and stretch with the beat
  const T = (s) => s * u;

  // ---- camera: slow-in/slow-out keys + a moving hold (staging: start on the kid, open up for the adult, settle)
  const cam = K2.cam(t, [
    { t: 0, x: -150, y: 120, zoom: 1.55 }, { t: T(3.9), x: -140, y: 110, zoom: 1.62 },
    { t: T(6.6), x: 30, y: 60, zoom: 1.12 }, { t: T(9.0), x: 20, y: 60, zoom: 1.1 }, { t: D, x: 10, y: 60, zoom: 1.16 },
  ]);
  const W = K2.world2.livingRoom(ctx, { t, cam, sofa: P.sofa });
  const L = W.light;

  // ---- timeline (seconds)
  const buzzAt = T(0.5), noticeAt = T(1.0), reachAt = T(1.55), grabAt = T(2.5), liftAt = T(2.6), takeAt = T(3.85);
  const walkIn = T(4.4), walkOut = T(6.9), robotAt = T(8.3);

  // ---- phone (buzzes on the cushion until the kid grabs it)
  const phoneSpot = [560, 880];
  const buzz = t > buzzAt && t < grabAt ? (0.5 + 0.5 * Math.sin((t - buzzAt) * 9)) * clamp((t - buzzAt) / 0.2) : 0;

  // ---- kid: anticipation -> reach on an arc -> grab -> lift on an arc -> take (squash & stretch) -> moving hold
  const ks = 1.32, kx = 300, ky = W.sofa.feetY;
  const notice = M.act(t, noticeAt, { timing: 'snappy', wind: 0.35 });           // head whips to the buzz
  const reach = M.act(t, reachAt, { timing: 'normal', wind: 0.5, overshoot: 0.04 }); // lean back first, then reach
  const lift = M.ease.inOut((t - liftAt) / T(0.7));
  const take = M.act(t, takeAt, { timing: 'take', wind: 0.6, exag: 1.2 });
  let squash = 0;                                                                     // + stretch / - squash
  if (take.phase === 'anticipate') squash = -0.13 * take.wind;
  else if (take.phase === 'action') squash = 0.2 * (1 - take.k * 0.3);
  squash += M.squashImpact(t, take.hit + 0.02, 0.14, 0.6);
  const bounceY = (tt) => { const a = M.act(tt, takeAt, { timing: 'take', wind: 0.6, exag: 1.2 }); return a.phase === 'action' ? -40 * Math.sin(a.k * Math.PI) : 0; };
  // reach target travels on an arc from the lap to the phone (local coords, relative to the kid's feet)
  const lap = [70, -175], toPhone = [(phoneSpot[0] - kx) / ks, (phoneSpot[1] - ky) / ks - 8], face = [58, -255];
  let pose = 'sit', pose2 = null, poseMix = 0, reachPt = null, hold = null, lean = 0;
  if (t >= reachAt && t < liftAt) {
    const k = clamp(reach.v), p = M.arc(lap, toPhone, clamp(k), 30, (x) => x);
    reachPt = [p[0], p[1]]; pose = 'sit-reach'; lean = -0.12 * reach.wind * (reach.phase === 'anticipate' ? 1 : 0) + 0.06 * clamp(k);
  } else if (t >= liftAt) {
    pose = 'sit-reach'; pose2 = 'sit-phone'; poseMix = lift; hold = 'phone';
    if (lift < 1) { const p = M.arc(toPhone, face, lift, 40); reachPt = [p[0], p[1]]; poseMix = Math.pow(lift, 1.6); }
  }
  // gaze + expression (pose-to-pose on the face)
  const kidLook = t < noticeAt ? M.hold(t, 2, 0.15) : t < takeAt + T(2.2) ? lerp(0, 0.85, clamp(notice.v)) * (t > liftAt ? 0.35 : 1)
    : t < robotAt + T(0.6) ? 0.9 : 0.7;
  let kidExpr = 'sleepy', kidExpr2 = null, kidMix = 0;
  if (t > noticeAt) { kidExpr = 'sleepy'; kidExpr2 = 'curious'; kidMix = clamp(notice.v); }
  if (t > liftAt + T(0.4)) { kidExpr = 'focused'; kidExpr2 = null; }
  if (t > takeAt) { kidExpr = take.phase === 'anticipate' ? 'focused' : 'joy'; kidExpr2 = null; }
  if (t > takeAt + T(1.8)) { kidExpr = 'joy'; kidExpr2 = 'happy'; kidMix = M.ease.inOut((t - takeAt - T(1.8)) / 0.6); }
  if (t > robotAt + T(0.5)) { kidExpr = 'surprised'; kidExpr2 = 'joy'; kidMix = M.ease.out((t - robotAt - T(0.5)) / 0.8); }

  // ---- adult: walks in on a curved path (arcs), slow-in/slow-out, hair + tie follow through, stops, settles
  const path = [[1010, 905], [960, 960], [905, 1010], [840, 1042]];
  const walkK = (tt) => M.ease.inOut((tt - walkIn) / (walkOut - walkIn), 1.8);
  const adultPos = (tt) => M.arcPath(path, walkK(tt));
  const ap = adultPos(t), as = lerp(0.9, 1.13, walkK(t));
  const walking = t > walkIn && t < walkOut;
  const walkPhase = walkK(t) * 2.4 / 0.8;                       // phase advances with distance: no foot sliding
  const stopLean = M.settle(t, walkOut, 0.07, 1.4, 3.5);         // follow-through: the body keeps going, then settles
  const greet = M.act(t, walkOut + T(0.25), { timing: 'normal', wind: 0.25 });
  const adultPose = walking ? 'stand' : 'stand';
  const adultPose2 = t > robotAt + T(1.6) ? 'shrug' : 'hips';
  const adultMix = t > robotAt + T(1.6) ? M.ease.inOut((t - robotAt - T(1.6)) / 0.5) : clamp(greet.v);
  const adultLook = t < walkOut ? -0.3 : t < robotAt + T(0.4) ? -0.75 : -0.45;
  const adultExpr = t < walkOut + T(0.3) ? 'neutral' : t < robotAt + T(0.4) ? 'smirk' : t < robotAt + T(1.4) ? 'surprised' : 'happy';
  const adultTalk = t > walkOut + T(0.5) && t < robotAt ? 0.55 * (0.5 + 0.5 * Math.sin(t * 3)) : 0;

  // ---- robot: glowing spot (anticipation) -> springs up (stretch) -> lands (squash) -> damped settle -> waves
  const rx = 650, ry = 1052, rs = 0.92;
  const spot = clamp((t - (robotAt - T(0.55))) / T(0.45));
  const jump0 = robotAt, jump1 = robotAt + T(0.5);
  const jumpY = (tt) => (tt > jump0 && tt < jump1 ? -150 * Math.sin(((tt - jump0) / (jump1 - jump0)) * Math.PI) : 0);
  const appear = M.act(t, robotAt - T(0.18), { timing: 'snappy', wind: 0.3, overshoot: 0.18 });
  const rScale = clamp(appear.v, 0, 1.25);
  let rSquash = 0;
  if (t > jump0 && t < jump1) { const k = (t - jump0) / (jump1 - jump0); rSquash = 0.28 * Math.cos(k * Math.PI); }   // stretch up, ease to round at the apex
  else if (appear.phase === 'anticipate') rSquash = -0.2 * appear.wind;
  rSquash += M.squashImpact(t, jump1, 0.3, 0.55);
  const rPose = t > jump1 + T(0.7) && t < D - T(1.2) ? 'wave' : 'stand';
  const rState = t > jump1 + T(0.3) ? 'happy' : 'surprised';

  // ================================================================ draw (back to front, all in the depth-1 plane)
  W.stage(ctx, () => {
    if (t < liftAt) K2.drawPhone(ctx, phoneSpot[0], phoneSpot[1], 0.62, { t, lying: true, light: L, buzz, glow: 0.4 + 0.6 * buzz, screen: 'alert' });
    K2.drawHuman(ctx, kx, ky, ks, {
      t, seed: 2, age: 'kid', outfit: 'pajamas', top: '#5a78c8', hairStyle: 'ponytail', hair: 2, skin: P.kidSkin ?? 3, eyes: 0,
      pose, pose2, poseMix, reach: reachPt, hold, lean, seatH: W.sofa.seatH / ks, cushion: W.sofa.color, facing: 0.55, light: L,
      look: kidLook, expr: kidExpr, expr2: kidExpr2, exprMix: kidMix, squash, driveY: bounceY, screen: 1,
    });
    // robot spawn spot (anticipation): ring of lime light + rising sparks
    if (spot > 0 && t < jump1 + T(0.6)) {
      const fade = 1 - clamp((t - jump1) / T(0.6));
      ctx.save(); ctx.translate(rx, ry); ctx.scale(1, 0.24);
      K2.glow(ctx, 0, 0, 160 * spot, K2.MASCOT.eye, 0.55 * fade);
      ctx.strokeStyle = `rgba(196,255,58,${0.8 * fade})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(0, 0, 90 * M.ease.out(spot), 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
      for (let i = 0; i < 7; i++) { const k = ((t * 1.4 + i / 7) % 1), a = i * 2.3; ctx.fillStyle = `rgba(222,255,150,${(1 - k) * fade * spot})`; ctx.beginPath(); ctx.arc(rx + Math.cos(a) * 70 * spot, ry - k * 180, 4, 0, Math.PI * 2); ctx.fill(); }
    }
    if (rScale > 0.01) {
      ctx.save(); ctx.translate(rx, ry); ctx.scale(rScale, rScale); ctx.translate(-rx, -ry);
      K2.drawRobot(ctx, rx, ry, rs, { t, seed: 4, state: rState, pose: rPose, light: L, facing: 0.25, hover: -jumpY(t), squash: rSquash, driveY: jumpY, look: t > jump1 ? -0.2 : 0, shadowA: rScale });
      ctx.restore();
    }
    K2.drawHuman(ctx, ap[0], ap[1], as, {
      t, seed: 7, age: 'adult', outfit: 'office', top: '#e9edf5', bottom: 'charcoal', hairStyle: 'long', hair: 1, skin: P.adultSkin ?? 1,
      walk: walking ? walkPhase : null, cadence: 0.8, stride: 0.75, drive: (tt) => adultPos(tt)[0] * 1.2, facing: walking ? -0.85 : -0.5,
      pose: adultPose, pose2: adultPose2, poseMix: walking ? 0 : adultMix, lean: stopLean, look: adultLook, expr: adultExpr, talk: adultTalk, light: L,
    });
  });
  W.front(ctx);
}
