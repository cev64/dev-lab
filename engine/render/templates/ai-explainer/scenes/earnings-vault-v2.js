// Scene "earnings-vault-v2" (full frame, kit v2 + motion.js). A night office (world2.office time night) turned into a
// vault: two tall glass tanks fed by coin pipes. At revCue heavy coins drop out of the left pipe (gravity, stretch
// from velocity, squash when they land) and the REVENUE tank fills; label, value and growth pill pop above it; at
// profitCue the camera swings to the PROFIT tank and it fills. Fill heights share one scale (value / max), and a
// dashed "a year ago" line marks value / (1 + growth). An office worker (tie with follow-through) reacts: a take when
// the coins start pouring, presents the revenue tank, turns with anticipation, and cheers on the profit growth.
// params: rev {label, value, amount, growth, pill}, profit {same}, ago, cues revCue, profitCue (as v1 earnings-vault).
export default function draw(ctx, t, info) {
  const H = info.helpers, K2 = H.kit2, M = H.motion, P = info.params || {};
  const { clamp, lerp, ease } = M;
  const D = info.duration, ACC = info.accent;
  const cue = (w, fb) => { const v = w != null ? info.timeOf(w) : null; return v != null ? v : fb; };
  const revAt = cue(P.revCue, D * 0.1), proAt = cue(P.profitCue, D * 0.55);
  const trilAt = cue('trillion', revAt + 2), proUpAt = cue('sixty-eight', proAt + 2.4);
  const R = Object.assign({ label: 'REVENUE', value: 'NT$1.49 trillion', amount: 1494.24, growth: 50.9, pill: '+50.9% vs a year ago' }, P.rev || {});
  const Q = Object.assign({ label: 'PROFIT', value: 'NT$763.06 billion', amount: 763.06, growth: 68.7, pill: '+68.7% vs a year ago' }, P.profit || {});
  const maxA = Math.max(R.amount, Q.amount);

  const ck = (tt, x, z) => ({ t: tt, x, y: 305 - 318 / z, zoom: z });
  const cam = K2.cam(t, [ck(0, -50, 1.1), ck(revAt + 0.6, -48, 1.09), ck(revAt + 4.2, -42, 1.08), ck(proAt - 0.8, -40, 1.07),
    ck(proAt + 0.4, -32, 1.1), ck(proAt + 3.0, -34, 1.09), ck(proUpAt + 0.6, -40, 1.05), ck(D, -40, 1.06)]);
  const W = K2.world2.office(ctx, { t, cam, time: 'night' });
  const L = W.light;

  const TOP = 660, BOT = 1018, TW = 220, IH = BOT - TOP - 24;
  const tanks = [{ x: 200, d: R, at: revAt }, { x: 470, d: Q, at: proAt }];
  const FILL = 3.0, G = 2600;                        // fill duration (s), gravity for heavy coins (px/s^2)
  const levelAt = (k, tt) => { const u = clamp((tt - (k.at + 0.35)) / FILL); return 0.92 * (k.d.amount / maxA) * ease.inOut(u, 1.8); };
  const surfY = (k, tt) => BOT - 12 - levelAt(k, tt) * IH;

  // ---------------------------------------------------------------- worker
  const WX = 752, WS = 1.35;   // beside the tanks (right), clear of their labels
  const take = M.act(t, revAt + 0.15, { timing: 'take', wind: 0.5, exag: 1.25 });
  const pres = M.act(t, revAt + 1.3, { timing: 'normal', wind: 0.3 });
  const turnA = M.act(t, proAt - 0.75, { timing: 'normal', wind: 0.35 });
  const cheer = M.act(t, proUpAt - 0.2, { timing: 'take', wind: 0.6, exag: 1.3 });
  let pose = 'stand', pose2 = 'hips', poseMix = 0.7, facing = -0.45, look = -0.4, squash = 0, expr = 'neutral', expr2 = null, exprMix = 0, nod = 0, hop = 0, exag = 1;
  if (t < proAt - 0.75) {
    if (take.phase !== 'before') { expr = 'neutral'; expr2 = 'surprised'; exprMix = clamp(take.v) * (1 - ease.inOut((t - revAt - 1.2) / 0.5)); squash = take.phase === 'anticipate' ? -0.07 * take.wind : M.squashImpact(t, take.hit, 0.1, 0.5); look = -0.6; }
    if (pres.phase !== 'before') { pose = 'hips'; pose2 = 'present'; poseMix = clamp(pres.v); expr = exprMix > 0.05 ? expr : 'happy'; if (exprMix < 0.05) { expr = 'happy'; expr2 = 'smirk'; exprMix = 0.5; } nod = 0.08 * Math.sin(clamp((t - revAt - 1.6) / 0.6) * Math.PI); }
    if (t > trilAt && t < trilAt + 1.4) { expr = 'happy'; expr2 = 'surprised'; exprMix = Math.sin(clamp((t - trilAt) / 1.4) * Math.PI) * 0.8; }
  } else {
    // turn to the profit tank: dip, swing through front view, settle
    const k = clamp(turnA.v, -0.4, 1.1);
    facing = k < 0 ? -0.45 : lerp(-0.45, -0.62, clamp(k));
    squash = turnA.phase === 'anticipate' ? -0.06 * turnA.wind : M.squashImpact(t, turnA.hit, 0.05, 0.4);
    look = lerp(-0.4, -0.2, clamp(k)); pose = 'present'; pose2 = 'hips'; poseMix = clamp(k); expr = 'curious';
    if (cheer.phase !== 'before') {
      pose = 'stand'; pose2 = { sN: 2.0, eN: 1.05, sF: -0.35, eF: -0.9, handN: 'fist', handF: 'fist', lean: -0.03, nod: -0.12 }; poseMix = clamp(cheer.v) * (1 - 0.3 * ease.inOut((t - proUpAt - 1.6) / 0.8)); exag = 1;
      expr = 'surprised'; expr2 = 'joy'; exprMix = clamp((t - cheer.hit) / 0.3);
      if (cheer.phase === 'anticipate') squash = -0.1 * cheer.wind;
      const a = t - cheer.hit + 0.08;
      if (a > 0 && a < 0.42) { hop = 16 * 4 * (a / 0.42) * (1 - a / 0.42); squash = 0.1 * Math.cos((a / 0.42) * Math.PI); }
      else if (a >= 0.42) squash = M.squashImpact(t, cheer.hit + 0.34, 0.12, 0.5);
      look = -0.25;
    }
  }
  const hopY = (tt) => { const c = M.act(tt, proUpAt - 0.2, { timing: 'take', wind: 0.6, exag: 1.3 }); const a = tt - c.hit + 0.08; return a > 0 && a < 0.42 ? 16 * 4 * (a / 0.42) * (1 - a / 0.42) : 0; };

  // ---------------------------------------------------------------- draw
  W.stage(ctx, () => {
    tanks.forEach((k, idx) => {
      const x = k.x;
      // pipe from the ceiling (shaded cylinder) with a flange; it shakes a little while coins pour (secondary action)
      const pouring = t > k.at + 0.2 && t < k.at + 0.35 + FILL;
      const shake = pouring ? Math.sin(t * 40 + idx) * 1.4 : M.settle(t, k.at + 0.35 + FILL, 2, 3, 5);
      K2.limb(ctx, [x + shake, 150], [x + shake, TOP - 40], 26, 26, K2.mat('#4b5a78', L), L.dir);
      K2.solid(ctx, () => { ctx.beginPath(); ctx.roundRect(x - 40 + shake, TOP - 52, 80, 26, 8); }, K2.mat('#5b6c8e', L), [x - 40, TOP - 52, 80, 26], L.dir, { rim: 2, top: 0.4 });
      // anticipation: a glow + rattle in the pipe mouth just before the first coin
      const pre = M.anticipate(t, k.at - 0.1, 0.4, 1);
      if (pre < 0) K2.glow(ctx, x, TOP - 30, 90, ACC, -0.6 * pre);
      // tank back
      K2.contactShadow(ctx, x, BOT + 10, TW + 60, 0.55, 0.12);
      ctx.fillStyle = 'rgba(150,190,255,0.10)'; ctx.beginPath(); ctx.roundRect(x - TW / 2, TOP, TW, BOT - TOP, 24); ctx.fill();
      // coin pile (fill) with a lumpy, sloshing top surface
      const sy = surfY(k, t), slosh = M.settle(t, k.at + 0.35 + FILL, 6, 1.6, 2.2) + (pouring ? Math.sin(t * 13) * 2 : 0);
      ctx.save(); ctx.beginPath(); ctx.roundRect(x - TW / 2 + 7, TOP + 7, TW - 14, BOT - TOP - 14, 19); ctx.clip();
      if (sy < BOT - 14) {
        const g = ctx.createLinearGradient(0, sy, 0, BOT); g.addColorStop(0, '#ffe08a'); g.addColorStop(0.25, '#e8b93a'); g.addColorStop(1, '#8a5a12');
        ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - TW / 2, BOT);
        for (let i = 0; i <= 12; i++) { const xx = x - TW / 2 + (TW * i) / 12; ctx.lineTo(xx, sy - 6 * Math.abs(Math.sin(i * 1.7 + idx)) + slosh * Math.sin(i / 12 * Math.PI * 2 + t)); }
        ctx.lineTo(x + TW / 2, BOT); ctx.closePath(); ctx.fill();
        for (let yy = BOT - 18; yy > sy + 10; yy -= 22) for (let xx = 0; xx < 7; xx++) {
          const cx = x - TW / 2 + 20 + xx * 37 + ((Math.round(yy / 22)) % 2) * 16;
          ctx.fillStyle = 'rgba(120,70,10,0.28)'; ctx.beginPath(); ctx.ellipse(cx, yy, 16, 6, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = 'rgba(255,240,180,0.18)'; ctx.beginPath(); ctx.ellipse(cx - 3, yy - 2, 9, 2.4, 0, 0, Math.PI * 2); ctx.fill();
        }
      }
      // falling coins: spawn at the pipe mouth, fall under gravity on a slight arc, stretch with speed, squash on landing
      if (t > k.at + 0.2 && t < k.at + 0.35 + FILL + 0.9) {
        for (let i = 0; i < 40; i++) {
          const s0 = k.at + 0.2 + i * 0.075; if (s0 > k.at + 0.35 + FILL - 0.2) break;
          const vx = (H.hash(i, idx + 2) - 0.5) * 260, y0 = TOP - 26;
          const land = surfY(k, s0 + 0.45), dur = Math.sqrt((2 * Math.max(40, land - y0)) / G);
          const a = t - s0; if (a < 0) continue;
          if (a < dur) {
            const px = x + vx * a, py = y0 + 0.5 * G * a * a, st = M.stretchFromVelocity(vx, G * a, 0.00028, 0.4);
            ctx.save(); M.squashTransform(ctx, px, py, st.s, st.angle);
            K2.drawCoin(ctx, px, py + 18, 0.5, { spin: t * 9 + i, shadow: false, light: L }); ctx.restore();
          } else if (a < dur + 0.22) {
            const sq = M.squashImpact(t, s0 + dur, 0.45, 0.22), px = x + vx * dur, py = y0 + 0.5 * G * dur * dur;
            ctx.save(); M.squashTransform(ctx, px, py + 10, sq, 0); K2.drawCoin(ctx, px, py + 18, 0.5, { spin: 0, shadow: false, light: L }); ctx.restore();
          }
        }
      }
      // "a year ago" dashed line (value / (1 + growth), same scale)
      const agoIn = ease.inOut((t - (k.at + 2.8)) / 0.5);
      if (agoIn > 0) {
        const ay = BOT - 12 - 0.92 * (k.d.amount / (1 + k.d.growth / 100) / maxA) * IH;
        ctx.save(); ctx.globalAlpha = agoIn; ctx.setLineDash([12, 10]); ctx.lineWidth = 4; ctx.strokeStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(x - TW / 2 - 10, ay); ctx.lineTo(lerp(x - TW / 2 - 10, x + TW / 2 + 10, agoIn), ay); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = K2.font.ui(22); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = 'rgba(8,10,22,0.85)'; ctx.beginPath(); ctx.roundRect(x - 80, ay + 10, 160, 34, 17); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.fillText(P.ago || 'a year ago', x, ay + 28);
        ctx.restore();
      }
      ctx.restore();
      // glass front: rim light, specular strips, metal caps
      ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(200,225,255,0.55)'; ctx.beginPath(); ctx.roundRect(x - TW / 2, TOP, TW, BOT - TOP, 24); ctx.stroke();
      const sg = ctx.createLinearGradient(x - TW / 2, 0, x + TW / 2, 0); sg.addColorStop(0, 'rgba(255,255,255,0.0)'); sg.addColorStop(0.12, 'rgba(255,255,255,0.16)'); sg.addColorStop(0.2, 'rgba(255,255,255,0.02)'); sg.addColorStop(0.85, 'rgba(255,200,150,0.0)'); sg.addColorStop(0.93, 'rgba(255,190,140,0.14)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg; ctx.beginPath(); ctx.roundRect(x - TW / 2, TOP, TW, BOT - TOP, 24); ctx.fill();
      K2.solid(ctx, () => { ctx.beginPath(); ctx.roundRect(x - TW / 2 - 8, TOP - 10, TW + 16, 22, 10); }, K2.mat('#6d7a96', L), [x - TW / 2 - 8, TOP - 10, TW + 16, 22], L.dir, { rim: 2, top: 0.5 });
      K2.solid(ctx, () => { ctx.beginPath(); ctx.roundRect(x - TW / 2 - 12, BOT - 6, TW + 24, 26, 10); }, K2.mat('#3c4660', L), [x - TW / 2 - 12, BOT - 6, TW + 24, 26], L.dir, { rim: 2, top: 0.4 });
    });
    K2.drawHuman(ctx, WX, 1030 - hop, WS, {
      t, seed: 12, age: 'adult', outfit: 'office', top: '#e9edf5', bottom: 'navy', tie: ACC, hairStyle: 'bun', hair: 1, skin: 1, eyes: 1,
      pose, pose2, poseMix, facing, look, expr, expr2, exprMix, squash, nod, exag, light: L,
      drive: (tt) => { const c = M.act(tt, proAt - 0.75, { timing: 'normal', wind: 0.35 }); return clamp(c.v, -0.4, 1.1) * 60; }, driveY: (tt) => -hopY(tt),
    });
  });
  W.front(ctx);

  // ---------------------------------------------------------------- labels (screen space, attached to the tanks)
  tanks.forEach((k) => {
    const s = W.toScreen(k.x, TOP - 20), x = clamp(s[0], 150, 885), y0 = s[1];   // fixed rows: label 488, value 530, pill 576 (below the header)
    const a = M.act(t, k.at - 0.1, { timing: 'snappy', wind: 0.3, overshoot: 0.15 });
    ctx.save(); ctx.globalAlpha = 0.55 + 0.45 * clamp(a.v);
    ctx.font = K2.font.ui(24); ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 10;
    ctx.fillText(k.d.label, x, 490);
    ctx.restore();
    if (a.phase !== 'before' && a.phase !== 'anticipate') {
      const v = Math.max(0, a.v), sx = a.phase === 'action' ? 1 + 0.15 * (1 - a.k) : 1;
      ctx.save(); ctx.translate(x, 531); ctx.scale(v * sx, v / sx);
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 14;
      let fs = 40; ctx.font = K2.font.display(fs); while (ctx.measureText(k.d.value).width > 272 && fs > 24) { fs--; ctx.font = K2.font.display(fs); }
      ctx.fillText(k.d.value, 0, 0); ctx.restore();
    } else if (a.phase === 'anticipate') { K2.glow(ctx, x, 531, 70, ACC, 0.5 * a.wind); }
    pill(ctx, K2, M, t, x, 577, k.d.pill, k.at + 1.4, 0, { size: 22, accent: true, maxW: 292 });
  });
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
