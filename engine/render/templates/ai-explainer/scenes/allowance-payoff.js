// Scene "allowance-payoff" (full frame, 1 beat, payoff). Dusk street, two store fronts with text name pills: on lockCue
// the left one's doors shut and a padlock drops on them with a robot left outside ("AI out"); on the right a person hands
// the agent robot a glowing allowance card ("<card>") on cardCue, it beams and holds it up. Then the street dims under a
// question card ("|" = line break) with two answer chips and a pulsing "?". Ends settled.
// Fits: payoff for "one company shuts AI out, another lets it in with limits", any open-vs-closed + "would you?" ending.
// params: left ("Store A"), right ("Store B"), out ("AI out"), card ("Spending limit"), question ("Would you?"),
//         a ("Yes"), b ("No way"), cues ("word#n"; without them fractions): lockCue, cardCue, qCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba, mixHex } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tLock = at(P.lockCue, D * 0.15) - 0.25;
  const tCard = at(P.cardCue, D * 0.45) - 0.6;
  const tQ = at(P.qCue, D * 0.65) - 0.3;
  const feet = 1030;

  K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 330, y: 780 }, { t: tCard - 0.6, zoom: 1.03, x: 640, y: 780 }, { t: tQ, zoom: 1.0 }, { t: D, zoom: 1.0 }]);
  K.world.city(ctx, { t, time: 'dusk', groundY: 1000 });

  function store(x0, x1, body, stripe, doorX, openAmt) {
    roundRect(ctx, x0, 620, x1 - x0, 380, 12); ctx.fillStyle = body; ctx.fill();
    for (let i = 0; i < 6; i++) {
      const a = lerp(x0 - 8, x1 + 8, i / 6), b = lerp(x0 - 8, x1 + 8, (i + 1) / 6);
      ctx.beginPath(); ctx.moveTo(a, 720); ctx.lineTo(b, 720); ctx.lineTo(b + 3, 760); ctx.arc((a + b) / 2 + 3, 760, (b - a) / 2, 0, Math.PI); ctx.closePath();
      ctx.fillStyle = i % 2 ? '#e8edf8' : stripe; ctx.fill();
    }
    const dw = 160, top = 810;
    K.glow(ctx, doorX, 900, 190, ACC, 0.05 + 0.3 * openAmt);
    roundRect(ctx, doorX - dw / 2 - 8, top - 8, dw + 16, 1000 - top + 8, 8); ctx.fillStyle = '#1a1d36'; ctx.fill();
    ctx.fillStyle = '#fff1c4'; ctx.fillRect(doorX - dw / 2, top, dw, 1000 - top);
    const half = (dw / 2) * (1 - 0.88 * openAmt);
    ctx.fillStyle = mixHex(body, '#ffffff', 0.25);
    ctx.fillRect(doorX - dw / 2, top, half, 1000 - top); ctx.fillRect(doorX + dw / 2 - half, top, half, 1000 - top);
  }
  const shut = smooth((t - tLock) / 0.3);
  store(40, 450, '#5a3f6e', '#b07ad6', 245, 0.5 * (1 - shut));
  store(520, 1020, '#2f4f7a', '#4f8fd6', 800, 1);
  // padlock drops onto the left doors
  const ld = K.phase(t, tLock + 0.2, tLock + 0.6, K.easeOutBack);
  if (ld > 0) K.drawLock(ctx, 245, lerp(760, 960, ld), 0.8, { open: 0 });
  // robot outside left
  K.drawRobot(ctx, 380 + K.shake(t, tLock + 0.5, 0.35, 5), feet, 0.9, { t, state: t > tLock + 0.4 ? 'thinking' : 'idle', seed: 12, flip: true });
  if (t > tLock + 0.5) K.drawLabel(ctx, 245, 720, Math.min(1.05, K.popIn(t, tLock + 0.5, 0.4)), { text: P.out || 'AI out', size: 26 });

  // right: person hands the robot an allowance card
  K.drawPerson(ctx, 610, feet, 1.25, { t, pose: t > tCard - 0.3 && t < tCard + 0.8 ? 'point' : 'stand', mood: 'happy', skin: 0, hair: 4, shirt: 3, hairStyle: 'curly', seed: 31, look: 0.6 });
  const rx = 820;
  K.drawRobot(ctx, rx, feet, 1.05, { t, state: t > tCard + 0.5 ? 'happy' : 'idle', seed: 2, flip: true });
  const fly = K.phase(t, tCard, tCard + 0.6, H.easeInOutCubic);
  if (t > tCard - 0.2) {
    const cx = lerp(660, rx - 10, fly), cy = lerp(880, 690, fly) - Math.sin(fly * Math.PI) * 60;
    const s = lerp(0.6, 1.0, fly);
    K.glow(ctx, cx, cy, 110, ACC, 0.35 * fly);
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(lerp(-0.5, -0.08, fly) + 0.03 * Math.sin(t * 3)); ctx.scale(s, s);
    roundRect(ctx, -80, -50, 160, 100, 14); ctx.fillStyle = ACC; ctx.fill();
    roundRect(ctx, -62, -32, 34, 26, 5); ctx.fillStyle = '#d9c27a'; ctx.fill();
    ctx.fillStyle = K.ACCENT.deep; ctx.fillRect(-62, 18, 110, 10);
    ctx.restore();
    if (fly >= 1) K.drawLabel(ctx, rx - 10, 620, Math.min(1.05, K.popIn(t, tCard + 0.6, 0.4)), { text: P.card || 'Spending limit', size: 26, accent: true });
  }
  // name pills
  K.drawLabel(ctx, 245, 600, Math.min(1.05, K.popIn(t, 0.1, 0.4)), { text: P.left || 'Store A', size: 30, dot: true });
  K.drawLabel(ctx, 770, 600, Math.min(1.05, K.popIn(t, 0.2, 0.4)), { text: P.right || 'Store B', size: 30, dot: true, accent: true });

  // question card
  if (t > tQ - 0.2) {
    const dim = K.phase(t, tQ - 0.2, tQ + 0.3);
    ctx.fillStyle = rgba('#05060f', 0.55 * dim); ctx.fillRect(-100, -100, 1280, 2120);
    const k = K.popIn(t, tQ - 0.1, 0.5);
    ctx.save(); ctx.translate(487, 650); ctx.scale(Math.min(1.03, k), Math.min(1.03, k));
    roundRect(ctx, -400, -160, 800, 320, 28); ctx.fillStyle = 'rgba(14,16,30,0.96)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; roundRect(ctx, -400, -160, 800, 320, 28); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = K.font.display(52); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lines = (P.question || 'Would you?').split('|');
    lines.forEach((l, i) => ctx.fillText(l, 0, -50 - (lines.length - 1) * 31 + i * 62 + 20));
    const q = 0.85 + 0.15 * Math.sin(t * 5);
    ctx.save(); ctx.translate(345, -115); ctx.scale(q, q); ctx.fillStyle = ACC; ctx.font = K.font.display(70); ctx.fillText('?', 0, 0); ctx.restore();
    ctx.restore();
    K.drawLabel(ctx, 300, 780, K.popIn(t, tQ + 0.5, 0.4), { text: P.a || 'Yes', size: 30, accent: true });
    K.drawLabel(ctx, 674, 780, K.popIn(t, tQ + 0.75, 0.4), { text: P.b || 'No way', size: 30 });
  }
}
