// Scene "engine-reveal" (full frame). The caveat: the kit robot stands on a cloth-covered pedestal. On muchCue a
// "Much of the gain" pill lands; on openCue the cloth whips off to reveal a big humming engine block labelled with
// the underlying model's name, and gain arrows rise from the engine (not the robot). On layerCue the thin plate
// under the robot lights up with a small "layer" label. Then the top slot swaps to two limit pills (simCue, specCue).
// params: engine, engineTag, layer, most, sim, spec, muchCue, openCue, layerCue, simCue, specCue
// Fits: "the gain comes from the base model, not the wrapper", product built on someone else's model, caveats.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tM = at(P.muchCue, D * 0.15), tO = Math.max(tM + 0.6, at(P.openCue, D * 0.35));
  const tL = Math.max(tO + 1, at(P.layerCue, D * 0.65)), tS = Math.max(tL + 0.8, at(P.simCue, D * 0.82));
  const tP = Math.max(tS + 0.6, at(P.specCue, D * 0.92));

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.1, x: 487, y: 760 }, { t: tO, zoom: 1.04, x: 487, y: 780 }, { t: D, zoom: 1.0, x: 487, y: 725 }]);
  K.world.room(ctx, { t, time: 'night', wall: '#232a44', floor: '#151a2e', window: false, picture: false, lamp: false, plant: false, floorY: 880 });
  // workshop wall stripes
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let i = 0; i < 6; i++) ctx.fillRect(80 + i * 170, 420, 90, 460);

  const ex = 490, ey = 1040, ew = 400, eh = 250;
  const open = K.phase(t, tO, tO + 0.8, H.easeInOutCubic);
  // engine block
  K.shadow(ctx, ex, ey, ew + 60);
  H.roundRect(ctx, ex - ew / 2, ey - eh, ew, eh, 22); ctx.fillStyle = '#39415f'; ctx.fill();
  H.roundRect(ctx, ex - ew / 2, ey - eh, ew, 26, 12); ctx.fillStyle = '#4a5478'; ctx.fill();
  // fans
  for (const fx of [ex - 140, ex + 140]) {
    ctx.save(); ctx.translate(fx, ey - 120);
    ctx.beginPath(); ctx.arc(0, 0, 44, 0, Math.PI * 2); ctx.fillStyle = '#1b2036'; ctx.fill();
    ctx.rotate(t * (2 + 10 * open));
    ctx.fillStyle = '#8b96bb';
    for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.beginPath(); ctx.ellipse(0, -20, 9, 20, 0.4, 0, Math.PI * 2); ctx.fill(); }
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fillStyle = '#c5cde6'; ctx.fill();
    ctx.restore();
  }
  // name plate
  H.roundRect(ctx, ex - 85, ey - 190, 170, 86, 14); ctx.fillStyle = '#12162a'; ctx.fill();
  ctx.fillStyle = ACC; ctx.font = H.font('display', 50); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(P.engine || 'BASE MODEL', ex, ey - 146);
  // vents glow
  for (let i = 0; i < 5; i++) { ctx.fillStyle = H.rgba(ACC, 0.25 + 0.5 * open * (0.5 + 0.5 * Math.sin(t * 6 + i))); H.roundRect(ctx, ex - 70 + i * 30, ey - 80, 18, 46, 6); ctx.fill(); }
  if (open > 0) H.glow(ctx, ex, ey - 130, 260, ACC, 0.18 * open);

  // cloth over the engine, whipped up and away
  if (open < 1) {
    ctx.save();
    ctx.translate(ex + open * 520, ey - eh / 2 - open * 380); ctx.rotate(open * 0.9);
    ctx.globalAlpha = 1 - open;
    ctx.beginPath();
    ctx.moveTo(-ew / 2 - 20, eh / 2 + 6); ctx.lineTo(-ew / 2 - 10, -eh / 2 - 10);
    ctx.quadraticCurveTo(0, -eh / 2 - 40, ew / 2 + 10, -eh / 2 - 10); ctx.lineTo(ew / 2 + 20, eh / 2 + 6);
    for (let k = 0; k < 6; k++) ctx.quadraticCurveTo(ew / 2 - k * 70 - 35, eh / 2 + 18, ew / 2 - (k + 1) * 70 + 20, eh / 2 + 4);
    ctx.closePath(); ctx.fillStyle = '#7a4a8c'; ctx.fill();
    ctx.restore();
  }

  // layer plate + robot on top
  const ly = ey - eh;
  const lit = K.phase(t, tL, tL + 0.5);
  H.roundRect(ctx, ex - 110, ly - 16, 220, 16, 6); ctx.fillStyle = lit > 0 ? H.mixHex('#8b96bb', ACC, lit * (0.6 + 0.4 * Math.sin(t * 6))) : '#8b96bb'; ctx.fill();
  K.drawRobot(ctx, ex, ly - 16, 0.95, { t, state: t > tO ? 'idle' : 'happy', seed: 4 });

  // "?" warning before the reveal
  const pw = K.popIn(t, 0.2, 0.4) * (1 - open);
  if (pw > 0) K.drawWarning(ctx, 200, 1000, pw, { pulse: t });

  // gain arrows from the engine
  if (open > 0.3) {
    for (let i = 0; i < 4; i++) {
      const ph = ((t - tO) * 0.7 + i / 4) % 1, x = ex - 170 + i * 113 + (i > 1 ? 0 : 0), y = ey - eh - 40 - ph * 220;
      if (Math.abs(x - ex) < 70) continue;
      ctx.save(); ctx.globalAlpha = Math.sin(ph * Math.PI) * clamp((open - 0.3) / 0.5);
      ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(x, y - 26); ctx.lineTo(x + 20, y); ctx.lineTo(x + 8, y); ctx.lineTo(x + 8, y + 26); ctx.lineTo(x - 8, y + 26); ctx.lineTo(x - 8, y); ctx.lineTo(x - 20, y); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }
  ctx.restore(); // camera

  // labels (screen space)
  const pt = K.popIn(t, tO + 0.5, 0.45);
  if (pt > 0) K.drawLabel(ctx, 490, 1000, pt, { text: P.engineTag || 'Underlying model', size: 24, dot: true });
  const pl = K.popIn(t, tL, 0.45);
  if (pl > 0) {
    K.drawLabel(ctx, 760, 700, pl, { text: P.layer || 'The layer on top', size: 24 });
    ctx.save(); ctx.globalAlpha = clamp(pl); ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(700, 706); ctx.quadraticCurveTo(640, 760, 600, 770); ctx.stroke(); ctx.restore();
  }
  // top slot: "much of the gain", then the two limits
  const swap = K.phase(t, tS - 0.25, tS);
  const pm = K.popIn(t, tM, 0.45) * (1 - swap);
  if (pm > 0) K.drawLabel(ctx, 487, 500, pm, { text: P.most || 'Much of the gain', size: 32, accent: true });
  const ps = K.popIn(t, tS, 0.45);
  if (ps > 0) K.drawLabel(ctx, 487, 490, ps, { text: P.sim || 'Text-only simulation', size: 28, dot: true });
  const pp = K.popIn(t, tP, 0.45);
  if (pp > 0) {
    K.drawLabel(ctx, 487, 562, pp, { text: P.spec || 'Specialists not compared', size: 28, dot: true });
  }
}
