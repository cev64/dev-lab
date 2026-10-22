// Scene "bots-outnumber" (full frame). A manager's team where AI agent robots come to outnumber the people.
// mode "stat" (default): dusk office; a stat panel counts up to `value` with `label` / `sub`; on arriveCue robots
//   walk in one by one beside the two human team members until they outnumber them; on helperCue a definition
//   pill lands and each robot gets a task chip whose gear spins, then ticks (agents act on their own).
// mode "payoff": night office; the manager stands among the robots (one human left); on bossCue the robots' eyes
//   light; on messCue one robot fumbles a paper stack (papers fly, warning sign, little shake) and everyone turns
//   to the manager; on qCue a question card lands with two answer chips and a pulsing "?".
// params: mode, value ("50%"), label, sub, define, tasks [3 strings], valueCue, arriveCue, helperCue;
//         payoff: question, a, b, bossCue, messCue, qCue
// Fits: "more agents than people", automation of a team, manager-of-bots stories, "who is responsible" payoffs.
export default function draw(ctx, t, info) {
  const P = info.params || {};
  if (P.mode === 'payoff') return payoff(ctx, t, info, P);
  return stat(ctx, t, info, P);
}

function stat(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent;
  const { clamp, lerp } = H;
  const at = (w, d, n = 0) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w, n); return v == null ? d : v; };
  const tVal = at(P.valueCue, 0.2), tArr = Math.max(tVal + 1.2, at(P.arriveCue, D * 0.33));
  const tDef = Math.max(tArr + 2.4, at(P.helperCue, D * 0.66, P.helperNth || 0));
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 780 }, { t: D, zoom: 1.0, x: 487, y: 740 }]);
  K.world.office(ctx, { t, time: 'dusk' });
  // manager on the left, looking at the team
  const surprised = t > tArr + 1.5;
  K.drawPerson(ctx, 150, 1045, 1.25, { t, pose: surprised ? 'shrug' : 'stand', mood: surprised ? 'shocked' : 'neutral', shirt: '#4fb3a6', skin: 3, hair: 2, hairStyle: 'bun', seed: 2, look: 0.8 });
  // two human team members
  K.drawPerson(ctx, 330, 1040, 0.95, { t, pose: 'stand', mood: surprised ? 'worried' : 'happy', shirt: '#e8786a', skin: 1, hair: 3, hairStyle: 'long', seed: 4, look: surprised ? 0.7 : -0.5 });
  K.drawPerson(ctx, 425, 1040, 0.95, { t, pose: 'stand', mood: 'neutral', shirt: '#5fa8d8', skin: 4, hair: 0, hairStyle: 'short', seed: 7, look: surprised ? 0.7 : -0.5 });
  // robots walk in from the right, back row first
  const slots = [[610, 985, 0.72], [740, 985, 0.72], [860, 985, 0.72], [545, 1045, 0.9], [690, 1045, 0.9], [835, 1045, 0.9]];
  const tasks = P.tasks || ['Emails', 'Reports', 'Bookings'];
  slots.forEach(([x, y, s], i) => {
    const t0 = tArr + i * 0.38, k = K.phase(t, t0, t0 + 0.9, H.easeOutCubic);
    if (k <= 0) return;
    const xx = lerp(1180, x, k), hop = k < 1 ? -Math.abs(Math.sin(k * Math.PI * 3)) * 14 : 0;
    const working = t > tDef + 0.3 + (i % 3) * 0.2;
    K.drawRobot(ctx, xx, y + hop, s, { t: t + i, state: working ? 'working' : k < 1 ? 'idle' : 'happy', seed: 30 + i });
    // task chip above front-row robots after the definition
    if (i >= 3 && t > tDef + 0.3) {
      const lt = t - (tDef + 0.3 + (i - 3) * 0.35), p = K.popIn(lt, 0, 0.4);
      if (p > 0) {
        const cy = y - 225 * s - 30;
        K.drawLabel(ctx, x - 14, cy, p, { text: tasks[i - 3] || 'Task', size: 24 });
        const done = lt > 1.4;
        ctx.save(); ctx.font = H.font('ui', 24); const tw = ctx.measureText(tasks[i - 3] || 'Task').width; ctx.restore();
        const gx = x - 14 + tw / 2 + 40, gy = cy - 21;
        ctx.save(); ctx.globalAlpha = clamp(p); ctx.translate(gx, gy);
        if (!done) { ctx.rotate(lt * 4); ctx.strokeStyle = ACC; ctx.lineWidth = 6; for (let g = 0; g < 6; g++) { ctx.rotate(Math.PI / 3); ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, 18); ctx.stroke(); } ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.stroke(); }
        else { const c = K.popIn(lt, 1.4, 0.3); ctx.scale(c, c); ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#11142a'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-2, 7); ctx.lineTo(9, -7); ctx.stroke(); }
        ctx.restore();
      }
    }
  });
  ctx.restore();

  // stat panel
  const pv = K.popIn(t, tVal, 0.5);
  if (pv > 0) {
    const cx = 487, top = 438, w = 760, h = 230;
    ctx.save(); ctx.translate(cx, top + h / 2); ctx.scale(pv, pv); ctx.translate(-cx, -(top + h / 2));
    H.roundRect(ctx, cx - w / 2, top, w, h, 26); ctx.fillStyle = 'rgba(10,12,22,0.84)'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
    const raw = String(P.value || '50%'), num = parseFloat(raw), k = K.phase(t, tVal + 0.1, tVal + 1.0, H.easeOutCubic);
    const shown = isNaN(num) ? raw : raw.replace(/[\d.]+/, String(Math.round(num * k)));
    ctx.fillStyle = ACC; ctx.font = H.font('display', 110); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(shown, cx - w / 2 + 36, top + 140);
    ctx.fillStyle = '#ffffff';
    const lines = [P.label || 'expect more AI agents', P.label2 || 'than people to manage'];
    ctx.font = H.font('bold', 32);
    lines.forEach((l, i) => ctx.fillText(l, cx - w / 2 + 330, top + 80 + i * 42));
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = H.font('ui', 26);
    ctx.fillText(P.sub || 'within a year', cx - w / 2 + 330, top + 178);
    // meter
    const mw = w - 72, mx = cx - w / 2 + 36, my = top + h - 34;
    H.roundRect(ctx, mx, my, mw, 12, 6); ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fill();
    if (!isNaN(num) && k > 0) { H.roundRect(ctx, mx, my, Math.max(12, mw * (num / 100) * k), 12, 6); ctx.fillStyle = ACC; ctx.fill(); }
    ctx.restore();
  }
  // definition pill
  const pd = K.popIn(t, tDef, 0.45);
  if (pd > 0) K.drawLabel(ctx, 487, 728, pd, { text: P.define || 'AI agent = helper that acts on its own', size: 28, dot: true });
}

function payoff(ctx, t, info, P) {
  const H = info.helpers, K = H.kit, D = info.duration, ACC = info.accent;
  const { clamp, lerp } = H;
  const at = (w, d, n = 0) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w, n); return v == null ? d : v; };
  const tBoss = at(P.bossCue, 0.3), tMess = Math.max(tBoss + 1, at(P.messCue, D * 0.55)), tQ = Math.max(tMess + 0.8, at(P.qCue, D * 0.8));
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 760 }, { t: D, zoom: 1.06, x: 487, y: 800 }]);
  if (t > tMess && t < tMess + 0.5) K.cameraShake(ctx, t, tMess, 0.4, 8);
  K.world.office(ctx, { t, time: 'night' });
  const turned = t > tMess + 0.5;
  // back row of robots
  const back = [[200, 975], [330, 975], [650, 975], [780, 975]];
  back.forEach(([x, y], i) => K.drawRobot(ctx, x, y, 0.7, { t: t + i, state: t > tBoss ? 'working' : 'idle', seed: 50 + i, flip: turned ? x > 487 : false }));
  // eyes light up on bossCue
  if (t > tBoss) back.forEach(([x, y], i) => { const g = K.popIn(t, tBoss + i * 0.12, 0.4); if (g > 0) H.glow(ctx, x, y - 150, 50, ACC, 0.25 * clamp(g)); });
  // manager in the middle
  const worried = t > tMess + 0.3;
  K.drawPerson(ctx, 487, 1045, 1.3, { t, pose: t > tQ ? 'shrug' : 'stand', mood: worried ? 'worried' : 'happy', shirt: '#4fb3a6', skin: 3, hair: 2, hairStyle: 'bun', seed: 2, look: worried ? 0.8 : 0 });
  // one human teammate, front-left
  K.drawPerson(ctx, 180, 1045, 0.95, { t, pose: turned ? 'point' : 'stand', mood: 'neutral', shirt: '#e8786a', skin: 1, hair: 3, hairStyle: 'long', seed: 4, look: 0.6 });
  // front-right robot that fumbles the papers
  const rx = 790, ry = 1045;
  const wob = t > tMess && t < tMess + 0.8 ? Math.sin((t - tMess) * 30) * 0.08 * (1 - (t - tMess) / 0.8) : 0;
  ctx.save(); ctx.translate(rx, ry); ctx.rotate(wob); ctx.translate(-rx, -ry);
  K.drawRobot(ctx, rx, ry, 0.95, { t, state: t > tMess ? 'thinking' : 'working', seed: 61, flip: true });
  ctx.restore();
  // papers: held as a stack, then fly and land scattered
  for (let i = 0; i < 6; i++) {
    const k = K.phase(t, tMess + i * 0.05, tMess + 0.9 + i * 0.05, H.easeOutCubic);
    const sx = rx - 70, sy = ry - 120 - i * 6;
    const ex = rx - 260 + i * 70 + (i % 2 ? 20 : -10), ey = ry - 4 - (i % 3) * 3;
    const x = lerp(sx, ex, k), y = lerp(sy, ey, k) - Math.sin(k * Math.PI) * (90 + i * 15);
    ctx.save(); ctx.translate(x, y); ctx.rotate(k * (i % 2 ? 1.4 : -1.1) + (k >= 1 ? 0 : 0));
    K.drawDocument(ctx, 0, 0, 0.32, { shadow: false, lines: 4 });
    ctx.restore();
  }
  const pw = K.popIn(t, tMess + 0.3, 0.4);
  if (pw > 0) K.drawWarning(ctx, rx + 40, ry - 250, 0.6 * pw, { pulse: (t * 2) % 1 });
  ctx.restore();

  // question card
  const pq = K.popIn(t, tQ - 0.1, 0.5);
  if (pq > 0) {
    const cx = 487, top = 440, w = 780, h = 230;
    ctx.save(); ctx.translate(cx, top + h / 2); ctx.scale(pq, pq); ctx.translate(-cx, -(top + h / 2));
    H.roundRect(ctx, cx - w / 2, top, w, h, 26); ctx.fillStyle = 'rgba(10,12,22,0.86)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = H.rgba(ACC, 0.5); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('display', 50); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(P.question || 'Who gets the blame?', cx, top + 86);
    ctx.restore();
    const pa = K.popIn(t, tQ + 0.35, 0.4), pb = K.popIn(t, tQ + 0.6, 0.4);
    if (pa > 0) K.drawLabel(ctx, 300, top + 190, pa * pq, { text: P.a || 'The manager?', size: 30, accent: true });
    if (pb > 0) K.drawLabel(ctx, 674, top + 190, pb * pq, { text: P.b || "The bot's maker?", size: 30 });
    // pulsing "?" over the manager
    const qq = K.popIn(t, tQ + 0.2, 0.4);
    if (qq > 0) { ctx.save(); const s = qq * (1 + 0.06 * Math.sin(t * 6)); ctx.translate(487, 712); ctx.scale(s, s); ctx.fillStyle = ACC; ctx.font = H.font('display', 84); ctx.textAlign = 'center'; ctx.fillText('?', 0, 0); ctx.restore(); }
  }
}
