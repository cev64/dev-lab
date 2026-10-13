// Scene "factory-dim" (full frame). Dusk industrial skyline: a big chip fab on the left with a lit sign. At sparkCue a
// quote pill ("casino") flies in and bursts into sparks over the fab ("not the only spark"); at rivalCue a rival
// fab rises from the ground on the right with its own sign and lights coming on; at doubtCue a question cloud forms
// over the first fab and its sign and windows dim. A worker in a clean-room suit looks from one to the other.
// params: home (sign of the first fab), rival (sign of the rising one), spark (pill text, default "\"casino\""),
//         doubt (question label), cues: sparkCue (10 %), rivalCue (35 %), doubtCue (70 %)
// Fits: competition / "a rival is catching up" / "the boom may cool" stories. Generic buildings, no logos.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp } = H;
  const D = info.duration, ACC = info.accent;
  const cue = (w, fb) => { const v = w != null ? info.timeOf(w) : null; return v != null ? v : fb; };
  const sparkAt = cue(P.sparkCue, D * 0.1), rivalAt = cue(P.rivalCue, D * 0.35), doubtAt = cue(P.doubtCue, D * 0.7);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.05, x: 487, y: 760 }]);
  // sky
  const g = ctx.createLinearGradient(0, 0, 0, 1000); g.addColorStop(0, '#141a3e'); g.addColorStop(0.6, '#3c2f5e'); g.addColorStop(1, '#6a4766');
  ctx.fillStyle = g; ctx.fillRect(-200, -200, 1480, 1200);
  K.glow(ctx, 760, 900, 380, '#ff9a6a', 0.18);
  // far skyline
  for (let i = 0; i < 12; i++) { const w = 70 + 40 * H.hash(i, 3), h = 80 + 160 * H.hash(i, 7); ctx.fillStyle = '#2a2448'; ctx.fillRect(-40 + i * 100, 960 - h, w, h); }
  // ground
  ctx.fillStyle = '#2b2b45'; ctx.fillRect(-200, 960, 1480, 40);
  const gg = ctx.createLinearGradient(0, 1000, 0, 1920); gg.addColorStop(0, '#1b1c30'); gg.addColorStop(1, '#090a14');
  ctx.fillStyle = gg; ctx.fillRect(-200, 1000, 1480, 1000);

  const dim = K.phase(t, doubtAt, doubtAt + 1.4);
  // home fab (left)
  fab(ctx, H, K, ACC, 300, 1000, 1.0, { t, lit: lerp(0.85, 0.2, dim), sign: P.home || 'Chip fab', signOn: lerp(1, 0.25, dim) * (1 - 0.6 * Math.max(0, Math.sin(clamp((t - doubtAt) / 0.5) * Math.PI * 3)) * (t > doubtAt && t < doubtAt + 0.5 ? 1 : 0)) });
  // rival fab rises (right)
  const rise = K.phase(t, rivalAt - 0.2, rivalAt + 1.6, H.easeOutCubic);
  if (rise > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(-200, -200, 1480, 1200); ctx.clip();
    fab(ctx, H, K, ACC, 720, 1000 + (1 - rise) * 380, 0.8, { t, lit: 0.2 + 0.7 * K.phase(t, rivalAt + 1, rivalAt + 2.5), sign: P.rival || 'Rival', signOn: K.phase(t, rivalAt + 0.8, rivalAt + 1.4), rival: true });
    ctx.restore();
    // rising dust
    if (t < rivalAt + 2) for (let i = 0; i < 6; i++) { const a = clamp(1 - (t - rivalAt) / 2); ctx.fillStyle = H.rgba('#c9c0e0', 0.25 * a); ctx.beginPath(); ctx.arc(600 + i * 48, 990 - H.hash(i, 1) * 20, 22 + 14 * H.hash(i, 2), 0, Math.PI * 2); ctx.fill(); }
  }

  // worker in a clean-room suit between the fabs, looking from one to the other
  const look = t < rivalAt ? -0.6 : (t < doubtAt ? 0.7 : -0.5);
  K.drawPerson(ctx, 515, 1045, 1.35, { t, pose: t > doubtAt ? 'shrug' : 'stand', mood: t > doubtAt ? 'worried' : (t > rivalAt ? 'shocked' : 'neutral'), look, shirt: '#e8ecf7', hair: 3, skin: 1, hairStyle: 'none', seed: 4, flip: look < 0 });
  ctx.restore(); // camera

  // spark: a quote pill flies in and bursts
  const sp = K.phase(t, sparkAt - 0.9, sparkAt, H.easeInOutCubic);
  if (t < sparkAt + 0.2 && sp > 0) {
    const x = lerp(-120, 300, sp), y = lerp(430, 560, sp);
    K.drawLabel(ctx, x, y, 1, { text: P.spark || '"casino"', size: 30, accent: true });
  }
  if (t >= sparkAt && t < sparkAt + 1.2) {
    const u = (t - sparkAt) / 1.2;
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * Math.PI * 2, r = 30 + 170 * H.easeOutCubic(u);
      ctx.fillStyle = H.rgba(i % 2 ? ACC : '#ffb36b', 1 - u);
      ctx.beginPath(); ctx.arc(300 + Math.cos(a) * r, 540 + Math.sin(a) * r * 0.7, 7 * (1 - u) + 2, 0, Math.PI * 2); ctx.fill();
    }
    K.glow(ctx, 300, 540, 200, ACC, 0.4 * (1 - u));
  }
  // doubt cloud with the question
  const dp = K.popIn(t, doubtAt + 0.1, 0.5);
  if (dp > 0) {
    ctx.save(); ctx.translate(487, 470); ctx.scale(dp, dp);
    const q = String(P.doubt || 'How long can it last?');
    ctx.font = K.font.bold(38); const w = Math.min(780, ctx.measureText(q).width + 110);
    ctx.fillStyle = 'rgba(240,242,252,0.96)';
    for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(-w / 2 + 40 + i * (w - 80) / 6, (i % 2 ? -28 : -12), 52, 0, Math.PI * 2); ctx.fill(); }
    H.roundRect(ctx, -w / 2, -40, w, 90, 45); ctx.fill();
    ctx.beginPath(); ctx.arc(40, 80, 16, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(30, 112, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#1a1d33'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const ft = H.fitText(ctx, q, 'bold', 38, 26, w - 60); ctx.font = ft.font; ctx.fillText(q, 0, 6);
    ctx.restore();
  }
}

// a generic chip fab: wide low hall, sawtooth roof, clean-air vents, a sign on a frame above. Bottom-centre anchor.
function fab(ctx, H, K, ACC, x, y, s, o) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.shadow(ctx, 0, 0, 440, 0.4);
  const W = 400, Hh = 230, base = o.rival ? '#5a5f8f' : '#6c7fb8', shade = H.mixHex(base, '#000000', 0.3);
  H.roundRect(ctx, -W / 2, -Hh, W, Hh, 10); ctx.fillStyle = base; ctx.fill();
  ctx.fillStyle = shade; ctx.fillRect(W / 2 - 110, -Hh, 110, Hh);
  // sawtooth roof
  ctx.fillStyle = H.mixHex(base, '#ffffff', 0.15);
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-W / 2 + i * 80, -Hh); ctx.lineTo(-W / 2 + i * 80 + 80, -Hh); ctx.lineTo(-W / 2 + i * 80 + 80, -Hh - 46); ctx.closePath(); ctx.fill(); }
  // vents
  for (let i = 0; i < 3; i++) { H.roundRect(ctx, -150 + i * 110, -Hh - 80, 40, 40, 6); ctx.fillStyle = shade; ctx.fill(); }
  // windows
  for (let r = 0; r < 2; r++) for (let c = 0; c < 6; c++) {
    const on = H.hash(c + r * 7 + (o.rival ? 50 : 0), Math.floor(o.t * 0.5)) < o.lit;
    H.roundRect(ctx, -170 + c * 58, -Hh + 40 + r * 70, 40, 44, 5);
    ctx.fillStyle = on ? H.rgba('#ffe7a8', 0.9) : '#1c2140'; ctx.fill();
  }
  // door
  H.roundRect(ctx, -40, -80, 80, 80, 6); ctx.fillStyle = '#1c2033'; ctx.fill();
  // sign
  ctx.font = K.font.display(34); const tw = ctx.measureText(o.sign).width + 60;
  ctx.fillStyle = '#2a2f45'; ctx.fillRect(-tw / 2 + 30, -Hh - 130, 8, 50); ctx.fillRect(tw / 2 - 38, -Hh - 130, 8, 50);
  H.roundRect(ctx, -tw / 2, -Hh - 200, tw, 76, 16); ctx.fillStyle = '#0d0f1e'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = H.rgba(o.rival ? '#ff8a6a' : ACC, 0.2 + 0.8 * o.signOn); ctx.stroke();
  if (o.signOn > 0.05) K.glow(ctx, 0, -Hh - 162, 220, o.rival ? '#ff8a6a' : ACC, 0.22 * o.signOn);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = H.rgba(o.rival ? '#ffb39e' : ACC, 0.25 + 0.75 * o.signOn);
  ctx.fillText(o.sign, 0, -Hh - 160);
  ctx.restore();
}
