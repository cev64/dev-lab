// Scene "coworker-payoff" (full frame, 1 short beat, payoff). Office at dusk: a punch clock on the wall; the robot
// helper slots a time card ("AI coworker") into it on clockCue: ding, the clock face flashes and a "Clocked in" pill
// pops; a worker at the next desk waves. Then the room dims and a question card lands with two answer chips and a
// pulsing "?". Ends settled.
// params: card ("AI coworker"), clocked ("Clocked in"), question ("An AI agent at your desk?"), a ("Yes please"),
//         b ("No thanks"), clockCue, qCue
// Fits: payoff for AI tools arriving at work, "would you want one?".
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tClock = at(P.clockCue, D * 0.35) - 0.25, tQ = Math.max(tClock + 0.8, at(P.qCue, D * 0.6) - 0.25);

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 470, y: 760 }, { t: D, zoom: 1.0 }]);
  K.world.office(ctx, { t, time: 'dusk' });
  // punch clock on a post
  const CX = 610, CY = 640;
  roundRect(ctx, CX - 12, CY + 80, 24, 1045 - CY - 80, 6); ctx.fillStyle = '#3d4570'; ctx.fill();
  K.shadow(ctx, CX, 1045, 140);
  roundRect(ctx, CX - 90, CY - 110, 180, 200, 20); ctx.fillStyle = '#c9cfe3'; ctx.fill();
  roundRect(ctx, CX - 90, CY + 40, 180, 50, 0); ctx.fillStyle = '#a9b0c8'; ctx.fill();
  const flash = clamp(1 - Math.abs(t - tClock - 0.15) / 0.35);
  ctx.beginPath(); ctx.arc(CX, CY - 30, 62, 0, Math.PI * 2); ctx.fillStyle = H.mixHex('#ffffff', ACC, flash); ctx.fill();
  ctx.strokeStyle = '#2a2f45'; ctx.lineWidth = 6; ctx.stroke();
  const ang = t < tClock ? t * 0.4 : tClock * 0.4 + (t - tClock) * 0.1;
  ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(CX, CY - 30); ctx.lineTo(CX + Math.sin(ang * 6) * 44, CY - 30 - Math.cos(ang * 6) * 44); ctx.stroke();
  ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(CX, CY - 30); ctx.lineTo(CX + Math.sin(-1.6) * 28, CY - 30 - Math.cos(-1.6) * 28); ctx.stroke();
  roundRect(ctx, CX - 44, CY + 52, 88, 14, 5); ctx.fillStyle = '#1c2033'; ctx.fill(); // card slot
  if (flash > 0) K.glow(ctx, CX, CY - 30, 140, ACC, 0.5 * flash);
  // time card: robot holds it, slides into the slot
  const ins = H.easeInOutCubic(clamp((t - tClock + 0.5) / 0.5));
  const cardY = lerp(CY + 200, CY + 105, ins), cardX = lerp(CX + 110, CX, ins);
  ctx.save(); ctx.translate(cardX, cardY);
  roundRect(ctx, -34, -50, 68, 100, 6); ctx.fillStyle = '#f2f4fa'; ctx.fill(); ctx.fillStyle = ACC; ctx.fillRect(-34, -50, 68, 16);
  ctx.fillStyle = '#9aa3bd'; for (let i = 0; i < 4; i++) ctx.fillRect(-24, -24 + i * 14, 48, 5);
  ctx.restore();
  // redraw the clock's lower front over the card so it looks inserted
  roundRect(ctx, CX - 90, CY + 66, 180, 24, 0); ctx.fillStyle = '#a9b0c8'; ctx.fill();
  K.drawRobot(ctx, CX + 190, 1045, 1.15, { t, state: t > tClock + 0.1 ? 'happy' : 'idle', flip: true, seed: 6 });
  // worker at a desk on the left waves
  K.drawDesk(ctx, 250, 1045, 1.1);
  K.drawPerson(ctx, 180, 1045, 1.2, { t, pose: t > tClock + 0.2 && t < tQ + 0.4 ? 'cheer' : 'sit-laptop', mood: 'happy', skin: 1, hair: 4, shirt: 3, hairStyle: 'curly', seed: 15, look: 0.8 });
  ctx.restore();

  const pc = K.popIn(t, 0.15, 0.4);
  if (pc > 0) K.drawLabel(ctx, CX + 110, 470, pc, { text: P.card || 'AI coworker', size: 30 });
  const pk = K.popIn(t, tClock + 0.2, 0.45);
  if (pk > 0) K.drawLabel(ctx, CX, 860, pk, { text: P.clocked || 'Clocked in', size: 32, accent: true, dot: false });

  // question card
  const qd = smooth((t - tQ) / 0.4), qk = K.popIn(t, tQ, 0.5);
  if (qk > 0) {
    ctx.fillStyle = `rgba(6,7,16,${0.45 * qd})`; ctx.fillRect(0, 0, 1080, 1920);
    ctx.save(); ctx.translate(487, 680); ctx.scale(Math.min(1.05, qk), Math.min(1.05, qk));
    const W = 800, Hh = 340;
    roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 30); ctx.fillStyle = 'rgba(8,10,24,0.96)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
    const pulse = 1 + 0.06 * Math.sin((t - tQ) * 5);
    ctx.save(); ctx.translate(0, -88); ctx.scale(pulse, pulse);
    ctx.font = H.font('display', 84); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 4);
    ctx.restore();
    const f = H.fitText(ctx, P.question || 'An AI agent at your desk?', 'display', 48, 28, W - 70);
    ctx.font = f.font; ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 6);
    [P.a || 'Yes please', P.b || 'No thanks'].forEach((o, i) => {
      const k = K.popIn(t, tQ + 0.4 + i * 0.25, 0.4); if (k <= 0) return;
      ctx.save(); ctx.translate(i ? 170 : -170, 100); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
      roundRect(ctx, -140, -34, 280, 68, 34); ctx.fillStyle = i ? 'rgba(255,107,94,0.95)' : ACC; ctx.fill();
      ctx.font = H.font('ui', 32); ctx.fillStyle = i ? '#2a0f0c' : K.ACCENT.deep; ctx.fillText(o, 0, 2);
      ctx.restore();
    });
    ctx.restore();
  }
}
