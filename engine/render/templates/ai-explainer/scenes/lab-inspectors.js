// Scene "lab-inspectors" (full frame). Outside safety inspectors (generic cartoons with clipboards + lanyard badges)
// move into a company's AI lab.
// mode "arrive" (best as a 2-beat span: hook + what happened):
//   beat 1: dusk street, a lab tower with a text name pill (no logo); a line of inspectors walks to the door, camera
//   pushes into the doorway. beat 2: inside, rows of empty desks; date pill; on countCue the inspectors pop in at the
//   desks while a counter pill ticks to `count`; then laptops / office / tools pills (itemCues) and the laptops open.
// mode "payoff": night street, the lab tower with one lit window; on deskCue a round inset shows an inspector at a
//   desk inside; on qCue a question card with two answer chips and a pulsing "?". A passer-by looks up.
// Fits: auditors / inspectors / regulators / watchdogs embedded inside a company; "who checks the AI labs" endings.
// params: mode, company ("AI LAB"), team ("Inspectors"), count ("6"), countLabel ("outside researchers"),
//         date (""), items (3 strings), countCue, dateCue, itemCues (3 words), question, yes, no, deskCue, qCue
// Defaults are generic (no company names). Library copy of the 2026-10-16 AI-inspectors story scene.
export default function draw(ctx, t, info) {
  const P = info.params || {};
  if (P.mode === 'payoff') return payoff(ctx, t, info, P);
  return arrive(ctx, t, info, P);
}

// an inspector: kit person + lanyard badge + clipboard tucked under the arm
function inspector(K, H, ctx, x, y, s, o, ACC) {
  K.drawPerson(ctx, x, y, s, o);
  const sit = (o.pose || '').startsWith('sit');
  const bob = o.walk != null && !sit ? -Math.abs(Math.sin(o.walk * 1.8 * Math.PI * 2)) * 5 : 0;
  const shY = (sit ? -78 : -104) - 64 + bob;
  const dir = o.flip ? -1 : 1;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  // lanyard + badge
  ctx.strokeStyle = ACC; ctx.lineWidth = 3; ctx.beginPath();
  ctx.moveTo(-9, shY - 2); ctx.lineTo(0, shY + 30); ctx.lineTo(9, shY - 2); ctx.stroke();
  H.roundRect(ctx, -12, shY + 28, 24, 30, 4); ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.fillStyle = ACC; ctx.fillRect(-12, shY + 28, 24, 9);
  ctx.fillStyle = '#9aa3bd'; ctx.fillRect(-7, shY + 42, 14, 3); ctx.fillRect(-7, shY + 49, 10, 3);
  // clipboard (tucked under the far arm)
  if (o.clipboard !== false && !sit) {
    ctx.save(); ctx.translate(-dir * 40, shY + 56); ctx.rotate(-dir * 0.12);
    H.roundRect(ctx, -20, -30, 40, 54, 5); ctx.fillStyle = '#9a6a46'; ctx.fill();
    H.roundRect(ctx, -16, -24, 32, 44, 3); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    H.roundRect(ctx, -8, -34, 16, 9, 3); ctx.fillStyle = '#c9ced9'; ctx.fill();
    ctx.fillStyle = '#b9c1d6'; for (let i = 0; i < 4; i++) ctx.fillRect(-11, -16 + i * 9, i === 3 ? 12 : 22, 3);
    ctx.restore();
  }
  ctx.restore();
}

function pillText(H, ctx, x, y, k, text, ACC, o = {}) {
  if (k <= 0) return;
  const size = o.size || 30;
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  ctx.font = H.font('ui', size);
  const w = Math.min(o.maxW || 800, ctx.measureText(text).width + size * 1.6 + (o.check ? size : 0)), h = size * 1.8;
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
  ctx.fillStyle = o.solid ? ACC : 'rgba(10,12,24,0.9)'; ctx.fill();
  if (!o.solid) { ctx.lineWidth = 2.5; ctx.strokeStyle = H.rgba(ACC, 0.75); ctx.stroke(); }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  let tx = 0;
  if (o.check) {
    tx = size * 0.5;
    const cx = -w / 2 + size * 0.95;
    ctx.strokeStyle = o.solid ? '#1a1d0a' : ACC; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(cx - 9, 1); ctx.lineTo(cx - 2, 8); ctx.lineTo(cx + 11, -8); ctx.stroke();
  }
  ctx.fillStyle = o.solid ? '#14160a' : '#ffffff';
  const f = H.fitText(ctx, text, 'ui', size, 20, w - size * 1.4 - (o.check ? size : 0)); ctx.font = f.font;
  ctx.fillText(f.text, tx, 2);
  ctx.restore();
}

function arrive(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent;
  const { clamp, smooth } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tB = info.beats && info.beats[1] ? info.beats[1].t0 : Math.min(3, D * 0.2);
  const tCut = tB + 0.15;
  const tDate = Math.max(tCut + 0.4, at(P.dateCue, tB + 0.3));
  const tCount = at(P.countCue, tB + (D - tB) * 0.3) - 0.1;
  const items = (P.items || ['Laptops', 'Office space', 'Internal tools']).slice(0, 3);
  const cues = P.itemCues || [];
  const tItem = items.map((_, i) => at(cues[i], tB + (D - tB) * (0.65 + i * 0.1)) - 0.15);
  const n = Math.max(1, Math.min(6, parseInt(P.count || '6', 10) || 6));
  const shirts = ['#4fb3a6', '#6f86e0', '#e8786a', '#a08be0', '#e0a84f', '#5fa8d8'];

  if (t < tCut) {
    // ---- exterior: inspectors walk to the lab door
    ctx.save();
    const push = smooth((t - (tCut - 0.9)) / 0.9);
    K.camera(ctx, t, [{ t: 0, zoom: 1.02, x: 487, y: 760 }, { t: Math.max(0.1, tCut - 0.9), zoom: 1.06, x: 520, y: 800 }, { t: tCut, zoom: 1.9, x: 640, y: 960 }]);
    K.world.city(ctx, { t, time: 'dusk', groundY: 990 });
    K.drawBuilding(ctx, 640, 1000, 0.95, { t, color: '#4d5d9a', floors: 8, lit: 0.55 });
    K.drawLabel(ctx, 640, 1052, 1, { text: P.company || 'AI LAB', size: 28, dot: true });
    for (let i = 0; i < n; i++) {
      const start = 60 - i * 105, x = Math.min(540 - i * 14, start + t * 170);
      const walking = x < 540 - i * 14 - 1;
      inspector(K, H, ctx, x, 1035, 1.2, { t, walk: walking ? t + i * 0.13 : undefined, pose: 'stand', shirt: shirts[i % 6], skin: (i * 2) % 5, hair: (i + 1) % 5, hairStyle: ['short', 'bun', 'curly', 'long', 'short', 'none'][i % 6], mood: 'neutral', seed: i * 3 + 1 }, ACC);
    }
    ctx.restore();
    if (push > 0) { ctx.fillStyle = `rgba(6,7,16,${0.85 * push})`; ctx.fillRect(0, 0, 1080, 1920); }
    return;
  }

  // ---- interior: desks fill with inspectors
  const lt = t - tCut;
  ctx.save();
  K.camera(ctx, lt, [{ t: 0, zoom: 1.06, x: 487, y: 760 }, { t: Math.max(0.5, D - tCut), zoom: 1.0, x: 487, y: 740 }]);
  K.world.office(ctx, { t, time: 'dusk' });
  const lightsOn = smooth((t - tItem[1]) / 0.5);
  if (lightsOn > 0) K.glow(ctx, 487, 820, 520, ACC, 0.16 * lightsOn);
  const xs = [205, 487, 769];
  const rows = [{ y: 835, s: 0.86 }, { y: 1045, s: 0.96 }];
  let idx = 0;
  rows.forEach((r, ri) => {
    xs.forEach((x, ci) => {
      const i = idx++;
      const k = i < n ? K.popIn(t, tCount + i * 0.2, 0.4) : 0;
      if (k > 0) {
        ctx.save(); ctx.translate(x, r.y - 6); ctx.scale(Math.min(1.05, k), Math.min(1.05, k)); ctx.translate(-x, -(r.y - 6));
        inspector(K, H, ctx, x, r.y - 6, r.s * 1.15, { t, pose: 'sit-laptop', typing: t > tItem[2] ? 1 : 0, shirt: shirts[i % 6], skin: (i * 2) % 5, hair: (i + 1) % 5, hairStyle: ['short', 'bun', 'curly', 'long', 'short', 'none'][i % 6], mood: 'happy', seed: i * 3 + 1, seat: true }, ACC);
        ctx.restore();
      }
      K.drawDesk(ctx, x, r.y, r.s);
      const lk = K.popIn(t, tItem[0] + i * 0.08, 0.35);
      if (lk > 0) K.drawLaptop(ctx, x, r.y - 110 * r.s, r.s * 0.62 * Math.min(1.05, lk), { t: t - tItem[0], screen: t > tItem[2] ? 'code' : 'blank', typing: true });
      void ci; void ri;
    });
  });
  ctx.restore();

  // top band: date pill, then the counter
  const dk = K.popIn(t, tDate, 0.4) * (1 - smooth((t - tCount) / 0.3));
  if (dk > 0.01 && P.date) pillText(H, ctx, 487, 485, dk, P.date, ACC, { size: 32 });
  const ck = K.popIn(t, tCount, 0.45);
  if (ck > 0) {
    const shown = Math.min(n, Math.floor(clamp((t - tCount) / (0.2 * n)) * n + (t > tCount + 0.05 ? 1 : 0)));
    ctx.save(); ctx.translate(487, 488); ctx.scale(Math.min(1.05, ck), Math.min(1.05, ck));
    const W = 640, Hh = 104;
    H.roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 24); ctx.fillStyle = 'rgba(8,10,24,0.92)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.font = H.font('display', 76); ctx.fillStyle = ACC; ctx.fillText(String(shown), -W / 2 + 70, 6);
    ctx.textAlign = 'left';
    const f1 = H.fitText(ctx, P.countLabel || 'outside researchers', 'bold', 36, 24, W - 170); ctx.font = f1.font; ctx.fillStyle = '#ffffff'; ctx.fillText(f1.text, -W / 2 + 135, -15);
    const f2 = H.fitText(ctx, 'from ' + (P.team || 'an outside group'), 'ui', 28, 20, W - 170); ctx.font = f2.font; ctx.fillStyle = 'rgba(255,255,255,0.75)'; ctx.fillText(f2.text, -W / 2 + 135, 25);
    ctx.restore();
  }
  // item pills (one row under the counter)
  const ix = [205, 487, 769];
  items.forEach((it, i) => {
    const k = K.popIn(t, tItem[i], 0.4);
    if (k > 0) pillText(H, ctx, ix[i], 588 + K.bob(t, 3, 0.9, i * 0.3), k, it, ACC, { size: 27, check: true, maxW: 280, solid: i === 0 && t < tItem[0] + 0.6 });
  });
  // fade in from the door push
  const fin = 1 - smooth(lt / 0.35);
  if (fin > 0) { ctx.fillStyle = `rgba(6,7,16,${0.85 * fin})`; ctx.fillRect(0, 0, 1080, 1920); }
}

function payoff(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent;
  const { clamp, smooth } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tDesk = at(P.deskCue, D * 0.45) - 0.3;
  const tQ = at(P.qCue, D * 0.62) - 0.25;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 760 }, { t: tQ, zoom: 1.05, x: 540, y: 780 }, { t: D, zoom: 1.07, x: 540, y: 790 }]);
  K.world.city(ctx, { t, time: 'night', groundY: 990 });
  K.drawBuilding(ctx, 600, 1000, 1.0, { t, color: '#3e4a80', floors: 8, lit: 0.25 });
  K.drawLabel(ctx, 600, 1052, 1, { text: P.company || 'AI LAB', size: 28, dot: true });
  // the inspectors' window glows (row 4, col 2 of the tower)
  const wx = 600 - 88 + 1 * 46 + 16, wy = 1000 - (60 + 8 * 44) + 26 + 4 * 44 + 14;
  const pulse = 0.6 + 0.4 * Math.sin(t * 3);
  K.glow(ctx, wx, wy, 70, ACC, 0.5 * pulse);
  H.roundRect(ctx, wx - 16, wy - 14, 32, 28, 4); ctx.fillStyle = ACC; ctx.fill();
  // passer-by looks up
  K.drawPerson(ctx, 200, 1035, 1.15, { t, pose: t > tQ ? 'shrug' : 'phone', mood: 'neutral', look: 0.6, skin: 2, hair: 1, shirt: 3, hairStyle: 'long', seed: 7 });
  ctx.restore();

  // inset: the inspector at a desk inside
  const ik = K.popIn(t, tDesk, 0.45) * (1 - 0.35 * smooth((t - tQ) / 0.4));
  if (ik > 0) {
    const cx = 755, cy = 560, R = 135;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(Math.min(1.05, ik), Math.min(1.05, ik));
    // dotted link to the lit window
    ctx.save(); ctx.setLineDash([6, 10]); ctx.strokeStyle = H.rgba(ACC, 0.8); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-60, R - 10); ctx.lineTo(wx - cx, wy - cy - 10); ctx.stroke(); ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fillStyle = '#2b3356'; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.fillStyle = '#232a48'; ctx.fillRect(-R, 40, 2 * R, R);
    inspector(K, H, ctx, -10, 92, 0.62, { t, pose: 'sit-laptop', typing: 1, shirt: '#4fb3a6', skin: 1, hair: 0, hairStyle: 'bun', mood: 'happy', seed: 2, seat: true }, ACC);
    K.drawDesk(ctx, -10, 100, 0.62);
    K.drawLaptop(ctx, -10, 100 - 68, 0.42, { t, screen: 'code', typing: true });
    ctx.restore();
    ctx.lineWidth = 6; ctx.strokeStyle = ACC; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  // question card
  const qk = K.popIn(t, tQ, 0.5);
  if (qk > 0) {
    ctx.save(); ctx.translate(487, 560); ctx.scale(Math.min(1.04, qk), Math.min(1.04, qk));
    const W = 800, Hh = 290;
    H.roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 30); ctx.fillStyle = 'rgba(8,10,24,0.95)'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const q = P.question || 'Should every AI company let inspectors in?';
    let size = 48, lines; for (; size >= 30; size -= 2) { lines = H.wrap(ctx, q, 'display', size, W - 80); if (lines.length <= 2) break; }
    ctx.font = H.font('display', size); ctx.fillStyle = '#ffffff';
    lines.forEach((ln, j) => ctx.fillText(ln, 0, -58 + (j - (lines.length - 1) / 2) * size * 1.15));
    const ch = [P.yes || 'Let them in', P.no || 'Keep them out'];
    ch.forEach((c, i) => {
      const k = K.popIn(t, tQ + 0.5 + i * 0.25, 0.35);
      if (k <= 0) return;
      ctx.save(); ctx.translate(i ? 190 : -190, 78); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
      H.roundRect(ctx, -170, -36, 340, 72, 36); ctx.fillStyle = i ? 'rgba(255,255,255,0.12)' : ACC; ctx.fill();
      const f = H.fitText(ctx, c, 'ui', 32, 22, 300); ctx.font = f.font; ctx.fillStyle = i ? '#ffffff' : '#14160a'; ctx.fillText(f.text, 0, 2);
      ctx.restore();
    });
    ctx.restore();
    // pulsing "?"
    const pk = K.popIn(t, tQ + 1.0, 0.4);
    if (pk > 0) {
      const s = Math.min(1.05, pk) * (1 + 0.06 * Math.sin(t * 5));
      ctx.save(); ctx.translate(880, 410); ctx.scale(s, s);
      ctx.beginPath(); ctx.arc(0, 0, 44, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
      ctx.font = H.font('display', 56); ctx.fillStyle = '#14160a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 4);
      ctx.restore();
    }
  }
  void clamp;
}
