// Scene "proof-review" (full frame, best as a 2-beat span: caveat + payoff). Dusk review room: a proof document on
// an easel gets a CHECKED machine stamp (`lean`, "Checked by machine") while an hourglass pill says the human review is still
// under way; on panelCue three generic cartoon experts walk in to a table of pages and sweep magnifying glasses
// over them (a "panel" pill); on notCue a "not an endorsement" pill lands. Beat 2: the kit robot waits at the side
// while a glowing trophy floats between robot and experts; on creditCue a pill ("no credit wanted") lands and the
// robot pushes the trophy away; on qCue a question card with a pulsing "?" settles at the top.
// Experts are generic cartoons, never real people; names never drawn.
// Fits: "AI result now under expert review" / "who gets credit for AI discoveries" stories.
// params: doc ("PROOF"), stamp ("CHECKED"), lean, review, panel, notEndorse, credit, question, panelCue, notCue,
//         creditCue, qCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const b2 = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.65;
  const tPanel = at(P.panelCue, D * 0.25) - 0.6;
  const tNot = at(P.notCue, D * 0.55) - 0.4;
  const tCredit = at(P.creditCue, b2 + 2) - 0.3;
  const tQ = at(P.qCue, D - 1.6) - 0.3;
  const feet = 1035;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.08, x: 300, y: 760 }, { t: tPanel, zoom: 1.04, x: 380, y: 760 }, { t: tPanel + 1.5, zoom: 1.0, x: 487, y: 725 }, { t: b2, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 520, y: 740 }]);
  K.world.office(ctx, { t, time: 'dusk' });

  // easel with the proof
  ctx.save(); ctx.strokeStyle = '#764d31'; ctx.lineWidth = 12; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(190, 700); ctx.lineTo(130, feet); ctx.moveTo(250, 700); ctx.lineTo(310, feet); ctx.moveTo(220, 700); ctx.lineTo(220, feet); ctx.stroke(); ctx.restore();
  H.roundRect(ctx, 90, 470, 260, 330, 10); ctx.fillStyle = '#f2f4fa'; ctx.fill();
  ctx.fillStyle = '#1c2033'; ctx.font = H.font('display', 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(P.doc || 'PROOF', 220, 510);
  ctx.fillStyle = '#c3c9da'; for (let l = 0; l < 8; l++) ctx.fillRect(120, 545 + l * 26, 200 - (l % 3) * 30, 8);
  K.drawStamp(ctx, 230, 780, 0.6, { kind: 'check', text: P.stamp || 'CHECKED', land: (t - 0.6) / 0.5 });

  // table with pages
  H.roundRect(ctx, 390, 900, 520, 26, 8); ctx.fillStyle = '#5b4636'; ctx.fill();
  ctx.fillStyle = '#4a382b'; ctx.fillRect(420, 926, 18, 110); ctx.fillRect(862, 926, 18, 110);
  for (let p = 0; p < 5; p++) { ctx.save(); ctx.translate(450 + p * 95, 896); ctx.rotate((H.hash(p, 1) - 0.5) * 0.2); ctx.fillStyle = '#f2f4fa'; ctx.fillRect(-38, -8, 76, 10); ctx.restore(); }

  // three experts walk in on the panel cue
  const ex = [{ x: 480, sk: 0, hr: 3, sh: 4, hs: 'none' }, { x: 640, sk: 4, hr: 0, sh: 3, hs: 'curly' }, { x: 800, sk: 2, hr: 1, sh: 1, hs: 'long' }];
  ex.forEach((e, i) => {
    const wk = clamp((t - tPanel - i * 0.25) / 1.1);
    if (wk <= 0) return;
    const x = lerp(1180 + i * 90, e.x, easeOutCubic(wk));
    const shift = t > b2 ? -40 * smooth((t - b2) / 0.8) : 0;
    K.drawPerson(ctx, x + shift * (i === 2 ? 1 : 0.5), feet, 1.05, { t, walk: wk < 1 ? t : undefined, pose: wk < 1 ? 'stand' : 'point', mood: 'neutral', look: -0.4, flip: true, skin: e.sk, hair: e.hr, shirt: e.sh, hairStyle: e.hs, seed: 20 + i });
    if (wk >= 1) {
      // magnifier sweeping over the table pages
      const lx = x - 70 + Math.sin(t * 1.6 + i * 2) * 26 + shift * (i === 2 ? 1 : 0.5), ly = 878 + Math.cos(t * 1.3 + i) * 5;
      ctx.save(); ctx.strokeStyle = '#764d31'; ctx.lineWidth = 10; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(lx + 24, ly - 24); ctx.lineTo(lx + 60, ly - 70); ctx.stroke();
      ctx.beginPath(); ctx.arc(lx, ly, 32, 0, Math.PI * 2); ctx.fillStyle = 'rgba(190,230,255,0.35)'; ctx.fill();
      ctx.lineWidth = 7; ctx.strokeStyle = '#2a2f45'; ctx.stroke();
      ctx.restore();
    }
  });

  // beat 2: robot waits at the left side, trophy floats
  const rk = smooth((t - b2 + 0.2) / 0.9);
  if (rk > 0) {
    const rx = lerp(-120, 330, easeOutCubic(rk));
    const push = smooth((t - tCredit - 0.3) / 0.6);
    K.drawRobot(ctx, rx, feet, 1.05, { t, state: push > 0.5 ? 'happy' : 'idle', seed: 5, talk: 0 });
    const tk = K.popIn(t, b2 + 0.6, 0.5);
    if (tk > 0.01) {
      const tx = lerp(430, 640, push), ty = 690 + K.bob(t, 8, 1.2, 0);
      trophy(H, K, ctx, tx, ty, tk, ACC);
    }
  }
  ctx.restore();

  // pills (screen space). Beat 1: lean + review + panel + not-endorsement; beat 2 swaps to credit + question.
  const out1 = 1 - smooth((t - b2 + 0.3) / 0.4);
  pill(H, ctx, 640, 470, K.popIn(t, 0.9, 0.4) * out1, P.lean || 'Checked by machine', ACC, true, 380);
  hourglassPill(H, ctx, 640, 545, K.popIn(t, 1.7, 0.4) * out1, P.review || 'Expert review: under way', ACC, t);
  pill(H, ctx, 640, 640, K.popIn(t, tPanel + 1.2, 0.4) * out1, P.panel || 'Outside experts', ACC, false, 380);
  pill(H, ctx, 487, 730, K.popIn(t, tNot, 0.45) * out1, P.notEndorse || 'Not an endorsement', ACC, false, 600, '#ff6b5e');
  pill(H, ctx, 640, 470, K.popIn(t, tCredit, 0.45) * (1 - smooth((t - tQ) / 0.3)), P.credit || 'No credit wanted', ACC, false, 420);
  const qk = K.popIn(t, tQ, 0.5);
  if (qk > 0.01) {
    ctx.save(); ctx.translate(487, 500); ctx.scale(Math.min(1.04, qk), Math.min(1.04, qk));
    H.roundRect(ctx, -400, -70, 800, 140, 28); ctx.fillStyle = 'rgba(10,12,24,0.95)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
    const f = H.fitText(ctx, P.question || 'Who gets the credit?', 'display', 44, 24, 600); ctx.font = f.font;
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, -360, 3);
    const pulse = 1 + 0.08 * Math.sin(t * 5);
    ctx.save(); ctx.translate(320, 0); ctx.scale(pulse, pulse);
    ctx.beginPath(); ctx.arc(0, 0, 44, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
    ctx.font = H.font('display', 58); ctx.fillStyle = '#14160a'; ctx.textAlign = 'center'; ctx.fillText('?', 0, 4);
    ctx.restore(); ctx.restore();
  }
}

function trophy(H, K, ctx, x, y, k, ACC) {
  ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
  K.glow(ctx, 0, -40, 130, ACC, 0.35);
  ctx.fillStyle = ACC;
  ctx.beginPath(); ctx.moveTo(-50, -100); ctx.lineTo(50, -100); ctx.quadraticCurveTo(48, -20, 0, -10); ctx.quadraticCurveTo(-48, -20, -50, -100); ctx.fill();
  ctx.lineWidth = 10; ctx.strokeStyle = ACC; ctx.beginPath(); ctx.arc(-52, -70, 22, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke(); ctx.beginPath(); ctx.arc(52, -70, 22, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
  ctx.fillRect(-8, -12, 16, 30); H.roundRect(ctx, -38, 16, 76, 18, 5); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-22, -72, 8, 20, 0.2, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function hourglassPill(H, ctx, x, y, k, text, ACC, t) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y + 30); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  const f = H.fitText(ctx, text, 'ui', 30, 20, 380); ctx.font = f.font;
  const w = ctx.measureText(f.text).width + 100;
  H.roundRect(ctx, -w / 2, -30, w, 60, 30); ctx.fillStyle = 'rgba(10,12,24,0.92)'; ctx.fill();
  ctx.lineWidth = 2.5; ctx.strokeStyle = ACC; ctx.stroke();
  // hourglass icon, slowly turning
  ctx.save(); ctx.translate(-w / 2 + 36, 0); ctx.rotate(Math.floor(t / 2) % 2 ? Math.PI * H.smooth((t % 2) / 0.4) : 0);
  ctx.fillStyle = ACC; ctx.beginPath(); ctx.moveTo(-12, -18); ctx.lineTo(12, -18); ctx.lineTo(0, 0); ctx.lineTo(12, 18); ctx.lineTo(-12, 18); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 22, 2);
  ctx.restore();
}

function pill(H, ctx, x, y, k, text, ACC, solid, maxW = 600, edge) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y + 30); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  const f = H.fitText(ctx, text, 'ui', 32, 20, maxW); ctx.font = f.font;
  const w = ctx.measureText(f.text).width + 56;
  H.roundRect(ctx, -w / 2, -30, w, 60, 30); ctx.fillStyle = solid ? ACC : 'rgba(10,12,24,0.92)'; ctx.fill();
  if (!solid) { ctx.lineWidth = 3; ctx.strokeStyle = edge || ACC; ctx.stroke(); }
  ctx.fillStyle = solid ? '#14160a' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
  ctx.restore();
}
