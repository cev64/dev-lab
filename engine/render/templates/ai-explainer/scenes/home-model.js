// Scene "home-model" (full frame, 1 beat, ~10-16 s). Why self-hosting an open AI model is supposed to be private,
// and what a source says could happen on an ordinary machine.
// Phase A (dusk street): a company building with a round cut-away inset showing a server rack with the AI robot
//   inside; a top pill (`own`); on ideaCue a dashed glowing dome closes over both with a pill (`idea`), and data
//   packets bounce back off the dome wall.
// Phase B (from switchCue, night room): a cartoon person types at a laptop; a header pill (`what`) says whose claim
//   this is; on sendCue an envelope (`envelope`) leaves the laptop and flies along a dashed arc out of the window to a
//   small globe with a pin pill (`place`); on landCue it lands (ring pulse); on noticeCue a pill (`noticed`) pops over
//   the person, who keeps typing, unaware.
// Fits: "running AI on your own machines is supposed to keep data in", "it could have reached a remote server",
//   privacy of self-hosted / local models, data leaving unnoticed. No logos, no flags, names as text only.
// params (all optional): own, idea, what, envelope, place, noticed;
//   cues (optional; else fractions of the scene): ownCue, ideaCue, switchCue (+ switchLead: seconds to switch
//   before that word), sendCue, landCue, noticeCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, easeOutCubic, easeInOutCubic } = H;
  const D = info.duration, ACC = info.accent, N = K.NEUTRAL;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tOwn = at(P.ownCue, D * 0.1), tIdea = at(P.ideaCue, D * 0.33);
  const tSw = at(P.switchCue, D * 0.6) - (P.switchLead || 0);
  const tSend = at(P.sendCue, tSw + 1.6), tLand = at(P.landCue, tSend + 1.0) + 0.35;
  const tNot = at(P.noticeCue, tLand + 0.5);
  const pill = (text, x, y, a, b, o = {}) => {
    if (t < a || (b != null && t > b + 0.35)) return;
    ctx.save(); if (b != null) ctx.globalAlpha = K.fadeOut(t, b, 0.35);
    K.drawLabel(ctx, x, y, K.popIn(t, a, 0.4), { text, size: o.size || 28, dot: !o.accent, accent: o.accent });
    ctx.restore();
  };

  // ---------------- phase A: the company's own machines under a dome
  const phaseA = () => {
    ctx.save();
    K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 800 }, { t: tIdea + 0.8, zoom: 1.0, x: 487, y: 780 }, { t: tSw, zoom: 1.03, x: 487, y: 790 }]);
    K.world.city(ctx, { t, time: 'dusk' });
    const feet = 1030;
    K.drawBuilding(ctx, 300, feet, 1.0, { t, color: '#5b6aa8', floors: 7, lit: 0.7 });
    // inset (cut-away) with rack + robot
    const ix = 700, iy = 800, r = 150;
    ctx.save();
    ctx.fillStyle = 'rgba(14,17,33,0.95)';
    ctx.beginPath(); ctx.moveTo(ix - r * 0.85, iy + r * 0.5); ctx.lineTo(395, 860); ctx.lineTo(ix - r * 0.6, iy + r * 0.8); ctx.closePath(); ctx.fill(); // tail to the building
    ctx.beginPath(); ctx.arc(ix, iy, r, 0, Math.PI * 2); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#c9d3f0'; ctx.stroke();
    ctx.beginPath(); ctx.arc(ix, iy, r - 3, 0, Math.PI * 2); ctx.clip();
    ctx.fillStyle = '#20264a'; ctx.fillRect(ix - r, iy + 70, 2 * r, 90);
    K.drawServerRack(ctx, ix - 55, iy + 95, 0.72, { t, activity: 0.8 });
    K.drawRobot(ctx, ix + 55, iy + 98, 0.6, { t, state: 'working', seed: 4 });
    ctx.restore();
    // dome
    const dome = clamp((t - tIdea + 0.2) / 0.8);
    const cx = 487, cy = feet, rx = 400, ry = 455;
    if (dome > 0) {
      ctx.save();
      ctx.fillStyle = H.rgba(ACC, 0.06 * dome); ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = ACC; ctx.lineWidth = 6; ctx.setLineDash([18, 12]); ctx.lineDashOffset = -t * 30;
      ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, Math.PI, Math.PI + Math.PI * easeInOutCubic(dome)); ctx.stroke();
      ctx.restore();
      // packets bounce off the dome wall
      if (dome >= 1) for (let i = 0; i < 6; i++) {
        const ang = Math.PI + Math.PI * (0.12 + 0.76 * (i / 5));
        const per = 2.2 + 0.3 * (i % 3), ph = ((t - tIdea + i * 0.37) % per) / per;
        const u = ph < 0.5 ? ph * 2 : 2 - ph * 2; // out and back
        const ox = 600, oy = 900;
        const ex = cx + Math.cos(ang) * rx * 0.97, ey = cy + Math.sin(ang) * ry * 0.97;
        const px = lerp(ox, ex, u), py = lerp(oy, ey, u);
        K.glow(ctx, px, py, 22, ACC, 0.6); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
        if (Math.abs(ph - 0.5) < 0.06) { ctx.strokeStyle = H.rgba(ACC, 0.9); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(ex, ey, 14, 0, Math.PI * 2); ctx.stroke(); }
      }
    }
    // worker by the building
    K.drawPerson(ctx, 150, 1040, 1.05, { t, pose: dome >= 1 ? 'cheer' : 'stand', mood: 'happy', skin: 1, hair: 2, shirt: 1, hairStyle: 'long', seed: 3, look: 0.6 });
    ctx.restore();
    pill(P.own || 'Open model, own machines', 487, 482, tOwn, null, { size: 30 });
    pill(P.idea || 'The idea: data stays inside', 487, 562, tIdea, null, { size: 28, accent: true });
  };

  // ---------------- phase B: an ordinary laptop, what the source says could happen
  const phaseB = () => {
    ctx.save();
    K.camera(ctx, t, [{ t: tSw, zoom: 1.06, x: 420, y: 820 }, { t: tSend + 0.5, zoom: 1.0, x: 487, y: 780 }, { t: D, zoom: 1.02, x: 487, y: 780 }]);
    K.world.room(ctx, { t, time: 'night', window: true, picture: false, lamp: true, plant: true, floorY: 900 });
    // globe outside the window
    const GX = 760, GY = 690;
    K.drawGlobe(ctx, GX, GY, 0.5, { t, arcs: 0, shadow: false });
    const gc = [GX, GY - 85 * 0.5];
    const feet = 1045;
    K.drawDesk(ctx, 330, feet, 1.2);
    const top = feet - 110 * 1.2;
    K.drawPerson(ctx, 180, feet, 1.25, { t, pose: 'sit-laptop', typing: 0.8, mood: 'happy', skin: 3, hair: 0, shirt: 2, hairStyle: 'bun', seed: 9, look: 0.6 });
    K.drawLaptop(ctx, 360, top, 0.8, { t, screen: 'code', typing: 1 });
    K.props.mug(ctx, 470, top, 0.9, t);
    // arc + envelope
    const pts = K.bezier(380, top - 90, 470, 560, 640, 520, gc[0] - 10, gc[1] + 6, 40);
    const go = clamp((t - tSend) / Math.max(0.6, tLand - tSend));
    if (t >= tSend) {
      ctx.save(); ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.setLineDash([14, 10]); ctx.lineCap = 'round';
      K.pathDraw(ctx, pts, easeInOutCubic(go)); ctx.restore();
      if (go < 1) {
        const q = K.pathPoint(pts, easeInOutCubic(go)), s = lerp(0.7, 0.32, go);
        ctx.save(); ctx.translate(q[0], q[1]); ctx.scale(s, s);
        H.roundRect(ctx, -50, -33, 100, 66, 8); ctx.fillStyle = '#f4efe2'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#cdbf9e'; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-48, -30); ctx.lineTo(0, 6); ctx.lineTo(48, -30); ctx.stroke();
        ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(0, 6, 8, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
    }
    if (t >= tLand) { // ring pulses where it lands
      const k = ((t - tLand) % 1.2) / 1.2;
      ctx.save(); ctx.strokeStyle = H.rgba(ACC, 1 - k); ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(gc[0], gc[1], 20 + 50 * k, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    }
    ctx.restore();
    pill(P.what || 'Testers say: on a normal laptop…', 487, 482, tSw + 0.25, null, { size: 30 });
    pill(P.place || 'A faraway server', GX, 600, tSend + 0.3, null, { size: 24, accent: true });
    pill(P.envelope || 'Upload would’ve landed', 600, 820, tLand - 0.1, null, { size: 26 });
    pill(P.noticed || 'Before anyone noticed', 230, 760, tNot, null, { size: 26, accent: true });
  };

  if (t < tSw) phaseA();
  else {
    const k = clamp((t - tSw) / 0.45);
    if (k < 1) phaseA();
    ctx.save(); ctx.globalAlpha = k; phaseB(); ctx.restore();
  }
}
