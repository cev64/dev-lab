// Scene "persona-mask" (full frame). Night stage: three kit robots walk in wearing cartoon human-face masks on sticks
// (pretend artists). On `labelCue` the masks drop one by one and an "AI Persona" pill tags each robot; on
// `countCue` rows of small robot silhouettes fill the back ("Thousands" pill). On `keptCue` velvet-rope posts slide
// in between the robots and a spot-lit "For you" platform where a cartoon listener stands; a "Not recommended by
// default" pill lands. On `followCue` the listener taps "Follow": a dashed link reaches the last robot, its rope
// section lifts and it gets a "Followed" pill.
// Fits: AI-generated artist/creator profiles, disclosure badges, default exclusion from recommendations, opt-in follows.
// params: tag ("AI Persona"), count ("Many profiles"), kept ("Not recommended by default"), feed ("For you"),
//         follow ("Follow"), followed ("Followed"), cues: labelCue, countCue, keptCue, followCue (narration words,
//         "word#n" = (n+1)th time spoken; else fractions of the scene)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const T = { label: at(P.labelCue, D * 0.12), count: at(P.countCue, D * 0.25), kept: at(P.keptCue, D * 0.6), follow: at(P.followCue, D * 0.9) };
  const FEET = 1020, RS = 1.0, RX = [130, 280, 430], ROPE = 545;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 487, y: 740 }, { t: D, zoom: 1.06, x: 487, y: 760 }]);
  K.world.room(ctx, { t, time: 'night', floorY: 900, window: false, lamp: false, picture: false, plant: false, wall: '#221f3d', floor: '#1a1730' });
  // back curtain folds
  for (let i = 0; i < 12; i++) { ctx.fillStyle = i % 2 ? 'rgba(120,40,70,0.22)' : 'rgba(80,25,50,0.22)'; ctx.fillRect(i * 90, 300, 90, 600); }
  ctx.fillStyle = 'rgba(5,7,16,0.25)'; ctx.fillRect(0, 0, 1080, 1920);

  // "thousands": rows of small robot silhouettes in the back
  const cp = smooth((t - T.count) / 1.2);
  if (cp > 0) {
    for (let r = 0; r < 3; r++) for (let c = 0; c < 14; c++) {
      const k = r * 14 + c, show = clamp(cp * 1.4 - H.hash(k, 9) * 0.6);
      if (show <= 0 || c * 40 + 40 > 520) continue;
      const x = 70 + c * 34 + (r % 2) * 17, y = 650 + r * 34;
      ctx.globalAlpha = 0.5 * show;
      ctx.fillStyle = '#9aa3c8';
      H.roundRect(ctx, x - 12, y - 30, 24, 18, 6); ctx.fill();
      H.roundRect(ctx, x - 10, y - 10, 20, 16, 5); ctx.fill();
      ctx.fillStyle = ACC; ctx.fillRect(x - 6, y - 24, 4, 5); ctx.fillRect(x + 2, y - 24, 4, 5);
    }
    ctx.globalAlpha = 1;
  }

  // platform + spotlight + listener (right)
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const sg = ctx.createLinearGradient(0, 400, 0, 1000); sg.addColorStop(0, H.rgba('#fff3c4', 0.02)); sg.addColorStop(1, H.rgba('#fff3c4', 0.16));
  ctx.fillStyle = sg; ctx.beginPath(); ctx.moveTo(760, 400); ctx.lineTo(820, 400); ctx.lineTo(930, 975); ctx.lineTo(620, 975); ctx.closePath(); ctx.fill();
  ctx.restore();
  H.roundRect(ctx, 600, 975, 340, 40, 14); ctx.fillStyle = '#4a3f78'; ctx.fill();
  H.roundRect(ctx, 600, 975, 340, 10, 6); ctx.fillStyle = '#6b5fa8'; ctx.fill();
  const tapping = t > T.follow - 0.3;
  K.drawPerson(ctx, 790, 980, 1.25, { t, pose: 'phone', mood: tapping ? 'happy' : 'neutral', skin: 3, hair: 1, hairStyle: 'long', shirt: '#4fb3a6', look: -0.6, seed: 8 });
  K.drawLabel(ctx, 790, 690, 1, { text: P.feed || 'For you', size: 28, dot: true });

  // rope posts
  const rp = easeOutCubic(clamp((t - T.kept) / 0.5));
  if (rp > 0) {
    const ry = lerp(1150, 0, rp);
    const posts = [ROPE - 10, ROPE + 10];
    ctx.save(); ctx.translate(0, ry);
    // rope between posts drawn as a vertical stack along the front: two posts with a sagging rope (side view)
    const top = 860, bot = 1020;
    for (const px of [ROPE]) {
      H.roundRect(ctx, px - 9, top, 18, bot - top, 6); ctx.fillStyle = '#d9b44a'; ctx.fill();
      ctx.beginPath(); ctx.arc(px, top - 4, 14, 0, Math.PI * 2); ctx.fill();
      H.roundRect(ctx, px - 30, bot - 10, 60, 14, 6); ctx.fill();
    }
    // rope across the robots' path towards the stage: from post to off-left, sagging
    const lift = smooth((t - T.follow - 0.2) / 0.5);
    ctx.strokeStyle = '#c0394b'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(ROPE, top + 10); ctx.quadraticCurveTo(ROPE - 90, top + 70, ROPE - 170, top + 20); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ROPE, top + 10 - lift * 40); ctx.quadraticCurveTo(ROPE + 40, top + 60 - lift * 50, ROPE + 80, top + 20 - lift * 60); ctx.stroke();
    void posts;
    ctx.restore();
  }

  // robots with masks
  RX.forEach((x0, i) => {
    const walkIn = easeOutCubic(clamp(t / 1.3));
    let x = lerp(x0 - 420, x0, walkIn);
    const blocked = t > T.kept + 0.35 ? Math.max(0, Math.sin((t - T.kept - 0.35) * 10) * 6 * (1 - clamp((t - T.kept - 0.35) / 0.6))) : 0;
    x -= blocked;
    // last robot walks through after the follow
    const through = i === 2 ? easeOutCubic(clamp((t - T.follow - 0.4) / 0.9)) : 0;
    x = lerp(x, 600, through);
    const tagged = t > T.label + i * 0.35;
    const state = i === 2 && through > 0 ? 'happy' : t > T.kept + 0.3 ? 'idle' : tagged ? 'thinking' : 'idle';
    K.drawRobot(ctx, x, FEET, RS, { t, state, seed: 3 + i });
    // mask on a stick in front of the head
    const hx = x, hy = FEET - 174 * RS;
    const drop = clamp((t - (T.label + i * 0.35)) / 0.7);
    if (drop < 1) {
      const mx = hx + 6 + drop * 40, my = hy + 4 + 330 * drop * drop, rot = drop * 2.2;
      ctx.save(); ctx.translate(mx, my); ctx.rotate(rot);
      ctx.strokeStyle = '#8a6a4a'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(10, 40); ctx.lineTo(34, 110); ctx.stroke();
      const skins = ['#f1c7a3', '#c98e6a', '#8d5a3b'], hairs = ['#3b2a20', '#e2b04a', '#1d1d24'];
      ctx.beginPath(); ctx.ellipse(0, 0, 52, 58, 0, 0, Math.PI * 2); ctx.fillStyle = skins[i]; ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, -30, 54, 32, 0, Math.PI, 0); ctx.fillStyle = hairs[i]; ctx.fill();
      ctx.fillStyle = '#161927'; ctx.beginPath(); ctx.arc(-18, 2, 6, 0, Math.PI * 2); ctx.arc(18, 2, 6, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#161927'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 18, 16, 0.2, Math.PI - 0.2); ctx.stroke();
      ctx.restore();
    }
    if (tagged) {
      const p = K.popIn(t, T.label + i * 0.35 + 0.2, 0.4);
      if (p > 0) K.drawLabel(ctx, x, hy - 66, Math.min(1, p), { text: P.tag || 'AI Persona', size: 20, accent: true });
    }
  });

  // pills
  const np = K.popIn(t, T.count, 0.45);
  if (np > 0) K.drawLabel(ctx, 300, 520, Math.min(1, np), { text: P.count || 'Many profiles', size: 28, dot: true });
  const kp = K.popIn(t, T.kept + 0.3, 0.45);
  if (kp > 0) K.drawLabel(ctx, 420, 600, Math.min(1, kp), { text: P.kept || 'Not recommended by default', size: 30, accent: true });

  // follow tap + dashed link
  if (t > T.follow - 0.3) {
    const fp = K.popIn(t, T.follow - 0.3, 0.35);
    K.drawSpeechBubble(ctx, 770, 780, Math.min(1, fp), { text: P.follow || 'Follow', size: 28, tail: 'center', pop: fp });
    const lp = smooth((t - T.follow) / 0.5);
    if (lp > 0) {
      const rx = lerp(RX[2], 600, easeOutCubic(clamp((t - T.follow - 0.4) / 0.9)));
      ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -t * 50;
      ctx.beginPath(); ctx.moveTo(760, 860); ctx.lineTo(lerp(760, rx + 40, lp), lerp(860, 900, lp)); ctx.stroke(); ctx.restore();
      const fd = K.popIn(t, T.follow + 0.6, 0.4);
      if (fd > 0) K.drawLabel(ctx, 620, 760, Math.min(1, fd), { text: P.followed || 'Followed', size: 24, dot: true });
    }
  }
  ctx.restore();
}
