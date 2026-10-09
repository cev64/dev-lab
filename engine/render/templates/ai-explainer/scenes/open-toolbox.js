// Scene "open-toolbox" (full frame). Dusk city plaza: a big cantilever toolbox full of glowing code chips stands open
// (= an open-source project). A title pops above it, a friendly robot rises out of the box and checks a shield for
// weak spots, then people walk in from both sides and each catches a code chip (anyone can download it).
// Ends settled with everyone holding a glowing chip.
// Fits: "open-source / open-weights release", "free to download", "a security tool anyone can use".
// params (all optional): title  big name over the box (default "OPEN TOOL")
//                        tag    small pill under the title (default "OPEN SOURCE")
//                        sub    pill shown when people arrive (default "FREE TO DOWNLOAD")
//                        test / hole / cue  narration words: security check / weak spot found / people take copies
//                               (else 45% / 60% / 80% of the scene)
//                        time   city time of day (default "dusk")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = info.helpers.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tTitle = Math.min(at((P.title || '').toLowerCase() || 'x', 3.4), D * 0.3);
  const tTest = at(P.test, D * 0.45), tHole = at(P.hole, D * 0.6);
  const tTake = at(P.cue, D * 0.8) - 1.6;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 760 }, { t: 3, zoom: 1.04, x: 487, y: 760 }, { t: tTake, zoom: 1.06, x: 487, y: 780 }, { t: D, zoom: 1.0, x: 487, y: 760 }]);
  K.world.city(ctx, { t, time: P.time || 'dusk', groundY: 960 });

  const bx = 487, by = 1030, bs = 1.4;
  const open = K.phase(t, 0.0, 0.9, K.easeOutBack);
  // people walking in from both sides to take copies
  const ppl = [
    { from: -120, to: 168, skin: 0, hair: 2, shirt: 3, hs: 'long', seed: 2, delay: 0 },
    { from: 1180, to: 815, skin: 3, hair: 0, shirt: 1, hs: 'short', seed: 5, delay: 0.35, flip: true },
  ];
  toolbox(ctx, H, K, bx, by, bs, { open, t, title: P.title || 'OPEN TOOL', acc: ACC, chips: 3,
    inner: () => {
      // robot rising out of the box (drawn inside, clipped by the front)
      const rise = K.phase(t, tTest - 0.5, tTest + 0.3, K.easeOutBack);
      if (rise > 0) {
        const state = t < tHole ? 'thinking' : t < tTake ? 'working' : 'happy';
        K.drawRobot(ctx, 0, lerp(120, -95, rise), 1.0, { t, state, seed: 4, talk: 0 });
      }
    } });

  // security check: a shield with a crack that the robot finds
  const sp = K.popIn(t, tTest, 0.4) * (1 - smooth((t - tTake - 0.2) / 0.5));
  if (sp > 0.01) {
    const sx = 800, sy = 800;
    ctx.save(); ctx.globalAlpha = clamp(sp);
    K.drawShield(ctx, sx, sy, 1.1 * sp, { shadow: false });
    if (t > tHole) {
      const c = K.phase(t, tHole, tHole + 0.5);
      ctx.strokeStyle = '#1a1d2e'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      K.pathDraw(ctx, [[sx - 6, sy - 150], [sx + 12, sy - 112], [sx - 10, sy - 86], [sx + 8, sy - 52]], c);
      const ring = K.popIn(t, tHole + 0.3, 0.4);
      if (ring > 0) {
        ctx.strokeStyle = ACC; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(sx + 2, sy - 100, 56 * ring + 4 * Math.sin(t * 6), 0, Math.PI * 2); ctx.stroke();
      }
    }
    ctx.restore();
    // scan beam from the robot to the shield
    if (t > tTest + 0.3 && t < tTake) {
      const k = 0.5 + 0.5 * Math.sin(t * 5);
      ctx.save(); ctx.globalAlpha = 0.18 + 0.12 * k; ctx.fillStyle = ACC;
      ctx.beginPath(); ctx.moveTo(bx + 30, by - 330); ctx.lineTo(sx - 40, sy - 165 + 30 * Math.sin(t * 1.7)); ctx.lineTo(sx - 40, sy - 35 + 30 * Math.sin(t * 1.7)); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
  }

  // people + chips flying to them
  ppl.forEach((p, i) => {
    const t0 = tTake + p.delay, walkDur = 1.5;
    if (t < t0) return;
    const k = clamp((t - t0) / walkDur), x = lerp(p.from, p.to, easeOutCubic(k));
    const walking = k < 1;
    const got = t0 + walkDur + 0.15;
    const caught = t > got + 0.6;
    const s = 1.3;
    K.drawPerson(ctx, x, 1045, s, { t, walk: walking ? t - t0 : null, pose: caught ? (t > got + 1.0 ? 'cheer' : 'stand') : 'stand',
      mood: 'happy', skin: p.skin, hair: p.hair, shirt: p.shirt, hairStyle: p.hs, seed: p.seed, flip: p.flip, look: p.flip ? -0.6 : 0.6 });
    // chip: arc from the box to above the person's head
    if (t > got) {
      const u = clamp((t - got) / 0.6), e = easeOutCubic(u);
      const tx = p.to, ty = 1045 - 330 * s / 1.3 - 30;
      const cx = lerp(bx, tx, e), cy = lerp(by - 250, ty, e) - Math.sin(u * Math.PI) * 160;
      chip(ctx, H, cx, cy + (u >= 1 ? K.bob(t, 5, 0.8, i * 0.3) : 0), 1.0, ACC);
    }
  });

  // title + tags (below the docked header)
  const tp = K.popIn(t, tTitle - 0.1, 0.45);
  if (tp > 0) {
    ctx.save(); ctx.translate(487, 520); ctx.scale(tp, tp);
    const ft = H.fitText(ctx, String(P.title || 'OPEN TOOL'), 'display', 96, 50, 600);
    ctx.font = ft.font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round'; ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(6,7,14,0.85)'; ctx.strokeText(String(P.title || 'OPEN TOOL'), 0, 0);
    ctx.fillStyle = ACC; ctx.fillText(String(P.title || 'OPEN TOOL'), 0, 0);
    ctx.restore();
    const lp = K.popIn(t, tTitle + 0.9, 0.4);
    const swap = smooth((t - tTake) / 0.35);
    if (lp > 0 && swap < 1) { ctx.save(); ctx.globalAlpha = 1 - swap; K.drawLabel(ctx, 487, 600, lp, { text: P.tag || 'OPEN SOURCE', size: 30, dot: true }); ctx.restore(); }
    if (swap > 0) K.drawLabel(ctx, 487, 600, K.popIn(t, tTake, 0.4), { text: P.sub || 'FREE TO DOWNLOAD', size: 30, accent: true });
  }
  ctx.restore();
}

// --- toolbox (bottom-centre anchored, ~300x150 at scale 1, cantilever lids open to both sides) ---------------
function toolbox(ctx, H, K, x, y, s, o) {
  const open = o.open || 0, t = o.t || 0, acc = o.acc;
  const base = '#d65a4a', shade = H.mixHex(base, '#000000', 0.25), light = H.mixHex(base, '#ffffff', 0.18);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  K.shadow(ctx, 0, 0, 380, 0.45);
  // interior + glow + chips
  if (open > 0.02) {
    K.glow(ctx, 0, -170, 200, acc, 0.45 * Math.min(1, open));
    H.roundRect(ctx, -140, -164, 280, 26, 10); ctx.fillStyle = '#141626'; ctx.fill();
    const n = o.chips == null ? 3 : o.chips;
    for (let i = 0; i < n; i++) {
      const cx = (i - (n - 1) / 2) * 82, rise = Math.min(1, open) * (34 + 10 * Math.sin(t * 1.6 + i * 1.9));
      chip(ctx, H, cx, -150 - rise, 0.8, acc);
    }
  }
  if (o.inner) { ctx.save(); ctx.beginPath(); ctx.rect(-400, -900, 800, 750); ctx.clip(); o.inner(); ctx.restore(); }
  // body
  H.roundRect(ctx, -150, -150, 300, 150, 16); ctx.fillStyle = base; ctx.fill();
  ctx.save(); H.roundRect(ctx, -150, -150, 300, 150, 16); ctx.clip(); ctx.fillStyle = shade; ctx.fillRect(70, -152, 90, 160); ctx.restore();
  H.roundRect(ctx, -150, -150, 300, 14, 7); ctx.fillStyle = light; ctx.fill();
  H.roundRect(ctx, -150, -20, 300, 20, 10); ctx.fillStyle = shade; ctx.fill();
  // name plate
  H.roundRect(ctx, -112, -118, 224, 64, 12); ctx.fillStyle = 'rgba(12,14,26,0.78)'; ctx.fill();
  const title = String(o.title || '');
  const ft = H.fitText(ctx, title, 'display', 40, 18, 196); ctx.font = ft.font;
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(title, 0, -85);
  // latches
  for (const lx of [-128, 128]) { H.roundRect(ctx, lx - 10, -156, 20, 28, 5); ctx.fillStyle = '#c9cfdf'; ctx.fill(); }
  // lids (two halves, hinged at the outer top corners)
  const ang = Math.min(1.15, open) * 1.85;
  for (const side of [-1, 1]) {
    ctx.save(); ctx.translate(side * 150, -150); ctx.rotate(side * ang);
    // lid half lies from the hinge towards the centre: local x from 0 to -side*154
    const x0 = side < 0 ? 0 : -154;
    H.roundRect(ctx, x0 - 2, -28, 156, 30, 10); ctx.fillStyle = side < 0 ? light : base; ctx.fill();
    H.roundRect(ctx, x0 - 2, -6, 156, 8, 4); ctx.fillStyle = shade; ctx.fill();
    ctx.restore();
  }
  // handle (only when closed)
  const hA = 1 - Math.min(1, open * 4);
  if (hA > 0) {
    ctx.save(); ctx.globalAlpha = hA; ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-60, -178); ctx.quadraticCurveTo(-60, -218, 0, -218); ctx.quadraticCurveTo(60, -218, 60, -178); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
// glowing code chip ("</>"), centre anchored, ~74x50 at scale 1
function chip(ctx, H, x, y, s, acc) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  H.glow(ctx, 0, 0, 60, acc, 0.35);
  H.roundRect(ctx, -37, -25, 74, 50, 12); ctx.fillStyle = '#161927'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = acc; ctx.stroke();
  ctx.font = H.font('bold', 26); ctx.fillStyle = acc; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('</>', 0, 1);
  ctx.restore();
}
