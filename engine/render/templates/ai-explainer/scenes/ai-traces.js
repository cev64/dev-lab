// Scene "ai-traces" (full frame). A security lab at night: a small unwrapped device sits on an inspection mat under a
// lamp; the kit robot (the company's own AI) powers up and scans it with a light beam; a wall monitor answers two
// questions one by one ("What is it?" -> answer, "Where did it come from?" -> a dotted trail runs to a generic staff
// badge with a "?"); a cross stamp lands on the badge; a case folder slides out with a tab.
// Fits: "the company used its own AI to investigate", forensics, tracing a device / leak / attack to its source.
// params: twist ("The twist"), ai ("OpenAI's own AI models"), q1 ("What is it?"), a1 ("A hidden audio recorder"),
//         q2 ("Where did it come from?"), stamp ("FIRED"), folder ("Case referred to the FBI"), badge ("Employee")
//         cues: twistCue ("twist"), aiCue ("own"), q1Cue ("what"), q2Cue ("where"), stampCue ("fired"), folderCue ("fbi")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, rgba } = H;
  const TAU = Math.PI * 2;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const rr = (x, y, w, h, r, fill) => { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); };
  const circle = (x, y, r, fill) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); };
  const pill = (x, y, k, text, o = {}) => { if (k > 0) K.drawLabel(ctx, x, y, Math.min(1.08, k), Object.assign({ text, size: o.size || 30 }, o)); };
  const tTwist = at(P.twistCue || 'twist', 0.1), tAI = at(P.aiCue || 'own', D * 0.2) - 0.3;
  const tQ1 = at(P.q1Cue || 'what', D * 0.4) - 0.2, tQ2 = at(P.q2Cue || 'where', D * 0.55) - 0.2;
  const tStamp = at(P.stampCue || 'fired', D * 0.72), tFolder = at(P.folderCue || 'fbi', D * 0.88) - 0.4;

  K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 470, y: 780 }, { t: tQ1, zoom: 1.0 }, { t: D, zoom: 1.03, x: 520, y: 720 }]);
  K.world.room(ctx, { t, time: 'night', floorY: 900, window: false, picture: false, lamp: false, plant: false, wall: '#1d2443' });
  // wall grid
  ctx.strokeStyle = 'rgba(120,140,220,0.08)'; ctx.lineWidth = 2;
  for (let x = 40; x < 1080; x += 70) { ctx.beginPath(); ctx.moveTo(x, 380); ctx.lineTo(x, 900); ctx.stroke(); }

  // wall monitor (right)
  const M = { x: 440, y: 440, w: 460, h: 300 };
  rr(M.x - 10, M.y - 10, M.w + 20, M.h + 20, 16, '#0b0d19');
  rr(M.x, M.y, M.w, M.h, 10, '#121831');
  const mOn = smooth((t - tAI) / 0.5);
  if (mOn > 0) {
    ctx.save(); ctx.globalAlpha = mOn;
    // scan lines
    for (let i = 0; i < 6; i++) rr(M.x + 24, M.y + 22 + i * 12, 60 + 140 * H.hash(i, Math.floor(t * 3)), 5, 2, rgba(ACC, 0.25));
    ctx.restore();
    const row = (y, q, ans, tq, isTrail) => {
      const k = K.popIn(t, tq, 0.4); if (k <= 0) return;
      ctx.save(); ctx.globalAlpha = clamp(k);
      ctx.font = H.font('ui', 32); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#c9d2f5';
      ctx.fillText(K.typewriter(q, t, 26, tq), M.x + 26, y);
      if (ans) {
        const ak = smooth((t - tq - 1.0) / 0.4);
        if (ak > 0) {
          ctx.globalAlpha = ak;
          const f = H.fitText(ctx, ans, 'bold', 34, 24, M.w - 80);
          ctx.font = f.font; ctx.fillStyle = ACC; ctx.fillText(f.text, M.x + 62, y + 44);
          ctx.strokeStyle = ACC; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(M.x + 28, y + 44); ctx.lineTo(M.x + 38, y + 54); ctx.lineTo(M.x + 54, y + 32); ctx.stroke();
        }
      }
      ctx.restore();
    };
    row(M.y + 120, P.q1 || 'What is it?', P.a1 || 'A hidden audio recorder', tQ1);
    row(M.y + 220, P.q2 || 'Where did it come from?', null, tQ2);
  }

  // bench with inspection mat + device under a lamp
  K.shadow(ctx, 360, 1010, 520, 0.35);
  rr(110, 900, 500, 26, 10, '#3d4466'); rr(130, 926, 20, 90, 6, '#262b45'); rr(570, 926, 20, 90, 6, '#262b45');
  rr(250, 880, 230, 22, 6, '#2f6b5c');
  for (let i = 0; i < 8; i++) { ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(258 + i * 28, 882, 2, 18); }
  // desk lamp
  ctx.strokeStyle = '#596085'; ctx.lineWidth = 10; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(540, 898); ctx.lineTo(560, 760); ctx.lineTo(450, 720); ctx.stroke();
  rr(410, 700, 70, 34, 14, '#6b7399');
  K.glow(ctx, 380, 860, 120, '#fff2c8', 0.35);
  // device (unwrapped little board) on the mat
  const dx = 365, dy = 868;
  rr(dx - 46, dy - 34, 92, 34, 6, '#1f6a5f'); rr(dx - 16, dy - 30, 32, 24, 3, '#c9ced8'); rr(dx - 64, dy - 26, 20, 18, 3, '#c8ccd6');
  const blink = (Math.floor(t * 2) % 2 === 0) ? 1 : 0.3; circle(dx + 32, dy - 18, 5, rgba('#ff5a52', blink));

  // robot (the AI) left
  const scanning = t > tAI;
  K.drawRobot(ctx, 175, 1030, 1.4, { t, state: scanning ? (t > tStamp ? 'idle' : 'working') : 'idle', seed: 2, talk: 0 });
  if (scanning) {
    const ex = 205, ey = 1030 - 1.4 * 168;
    const sw = Math.sin((t - tAI) * 3) * 30;
    const k = smooth((t - tAI) / 0.4) * (t > tStamp + 0.5 ? 0.4 : 1);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = k;
    const g = ctx.createLinearGradient(ex, ey, dx, dy); g.addColorStop(0, rgba(ACC, 0.55)); g.addColorStop(1, rgba(ACC, 0.08));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ex, ey - 5); ctx.lineTo(dx + 60 + sw, dy - 40); ctx.lineTo(dx - 60 + sw, dy); ctx.lineTo(ex, ey + 5); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = rgba(ACC, 0.8 * k); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(dx - 55 + sw, dy - 4); ctx.lineTo(dx + 55 + sw, dy - 36); ctx.stroke();
    // data line from the device up to the monitor
    const pts = K.bezier(dx, dy - 40, dx + 20, 800, M.x - 40, 760, M.x + 20, M.y + M.h - 10, 30);
    ctx.save(); ctx.strokeStyle = rgba(ACC, 0.55 * k); ctx.lineWidth = 4; ctx.setLineDash([3, 14]); ctx.lineDashOffset = -t * 50; ctx.lineCap = 'round';
    K.pathDraw(ctx, pts, K.phase(t, tAI, tAI + 0.8)); ctx.restore();
  }
  pill(265, 690, K.popIn(t, tAI + 0.2), P.ai || "OpenAI's own AI models", { size: 26, dot: true });
  pill(240, 480, K.popIn(t, tTwist) * (1 - smooth((t - tQ2) / 0.3)), P.twist || 'The twist', { accent: true, size: 34 });

  // trail from the monitor's 2nd question to a generic badge
  const bx = 760, by = 960;
  const trail = K.phase(t, tQ2 + 0.6, tQ2 + 1.6);
  if (trail > 0) {
    const pts = K.bezier(M.x + M.w - 40, M.y + M.h, M.x + M.w + 10, 800, bx + 40, 790, bx, by - 230, 30);
    ctx.save(); ctx.strokeStyle = rgba(ACC, 0.9); ctx.lineWidth = 6; ctx.setLineDash([4, 16]); ctx.lineCap = 'round'; ctx.lineDashOffset = -t * 40;
    K.pathDraw(ctx, pts, trail); ctx.restore();
  }
  const bk = K.popIn(t, tQ2 + 1.4, 0.45);
  if (bk > 0) {
    ctx.save(); ctx.translate(bx, by); ctx.scale(bk, bk);
    // lanyard + badge card with a generic silhouette and a "?"
    ctx.strokeStyle = '#6b7399'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-30, -250); ctx.lineTo(0, -210); ctx.lineTo(30, -250); ctx.stroke();
    rr(-80, -215, 160, 210, 16, '#e8ebf3'); rr(-80, -215, 160, 40, 16, '#3a4675'); rr(-80, -190, 160, 15, 0, '#3a4675');
    circle(0, -125, 30, '#9aa3bd'); ctx.beginPath(); ctx.ellipse(0, -62, 48, 30, 0, Math.PI, TAU); ctx.fillStyle = '#9aa3bd'; ctx.fill();
    rr(-54, -48, 108, 10, 5, '#c5cbe0'); rr(-40, -30, 80, 10, 5, '#c5cbe0');
    ctx.font = H.font('display', 64); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, -122);
    ctx.restore();
    pill(bx, by + 42, K.popIn(t, tQ2 + 1.7) * (1 - smooth((t - tFolder) / 0.3)), P.badge || 'An employee', { size: 24 });
  }
  if (t > tStamp - 0.05) K.drawStamp(ctx, bx, by - 40, 0.8, { kind: 'cross', text: P.stamp || 'FIRED', land: (t - tStamp + 0.05) / 0.5 });
  // folder slides in
  const fk = K.popIn(t, tFolder, 0.5);
  if (fk > 0) {
    const fx = lerp(1180, 600, H.easeOutCubic(clamp((t - tFolder) / 0.5)));
    ctx.save(); ctx.translate(fx, 820);
    rr(-20, -30, 110, 40, 10, '#c49a64');
    rr(-20, -10, 300, 180, 14, '#d8ae74'); rr(-20, -10, 300, 30, 10, '#c49a64');
    ctx.font = H.font('display', 44); ctx.fillStyle = '#3a2a16'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CASE FILE', 130, 85);
    ctx.restore();
    pill(Math.min(700, fx + 130), 1030, fk, P.folder || 'Referred to the FBI', { accent: true, size: 30 });
  }
}
