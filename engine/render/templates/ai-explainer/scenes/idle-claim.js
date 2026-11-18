// Scene "idle-claim" (full frame, 1 beat). Night room. A big chat window: the owner's "?" bubble with app icons, the
// agent runs two "checking" rows (ticks), then its verbatim reply types in (`reply`). Then the window shrinks to the
// left and the hidden side appears on the right: two server racks labelled as the platform's servers send dotted
// calls up to small generic app doors that the chat never shows; a "not a cover-up, per X" pill and a
// "0 calls in the chat" mark land on the chat window.
// Fits: "the agent said it did nothing", "the calls ran somewhere the chat can't see", background / server turns.
// params (all optional): reply (verbatim), replyBy ("Grok Bot's reply"), checks ("Checking..."), cover
//        ("Not a cover-up, NewCore says"), servers ("Platform's servers"), none ("0 calls in its chat"),
//        apps [{text, icon}] (max 3), cues: askCue, idleCue, coverCue, serverCue, chatCue
const RED = '#ff5a52';

function appIcon(ctx, H, kind, x, y, s, col) {
  // simple generic glyphs, centre anchor, ~60 px at s = 1
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (kind === 'mail') {
    H.roundRect(ctx, -32, -22, 64, 44, 6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-30, -18); ctx.lineTo(0, 6); ctx.lineTo(30, -18); ctx.stroke();
  } else if (kind === 'cal') {
    H.roundRect(ctx, -28, -24, 56, 50, 6); ctx.stroke();
    ctx.fillRect(-28, -24, 56, 14);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) ctx.fillRect(-18 + c * 14, -2 + r * 12, 8, 7);
    ctx.fillRect(-16, -32, 6, 12); ctx.fillRect(10, -32, 6, 12);
  } else if (kind === 'code') {
    ctx.beginPath(); ctx.moveTo(-14, -18); ctx.lineTo(-30, 0); ctx.lineTo(-14, 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(14, -18); ctx.lineTo(30, 0); ctx.lineTo(14, 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -24); ctx.lineTo(-6, 24); ctx.stroke();
  } else if (kind === 'chat') {
    H.roundRect(ctx, -30, -24, 60, 38, 12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-14, 14); ctx.lineTo(-20, 28); ctx.lineTo(0, 14); ctx.stroke();
  } else if (kind === 'file') {
    ctx.beginPath(); ctx.moveTo(-22, -28); ctx.lineTo(10, -28); ctx.lineTo(24, -14); ctx.lineTo(24, 28); ctx.lineTo(-22, 28); ctx.closePath(); ctx.stroke();
    ctx.fillRect(-12, -6, 26, 5); ctx.fillRect(-12, 6, 26, 5);
  } else { // note
    H.roundRect(ctx, -24, -28, 48, 56, 6); ctx.stroke();
    for (let i = 0; i < 3; i++) ctx.fillRect(-14, -14 + i * 12, 28 - i * 6, 5);
  }
  ctx.restore();
}

function appDoor(ctx, H, K, x, y, o) {
  // a generic app "door" tile, centre anchor 170x118: icon + text label; o: text, icon, lit 0..1, red 0..1, pop
  const pop = o.pop == null ? 1 : o.pop; if (pop <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(pop, pop);
  const W = o.w || 170, Hh = o.h || 118;
  if (o.lit > 0) H.glow(ctx, 0, 0, 150, o.acc, 0.35 * o.lit);
  if (o.red > 0) H.glow(ctx, 0, 0, 150, RED, 0.45 * o.red);
  ctx.fillStyle = 'rgba(0,0,0,0.35)'; H.roundRect(ctx, -W / 2 + 6, -Hh / 2 + 8, W, Hh, 20); ctx.fill();
  H.roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 20);
  ctx.fillStyle = H.mixHex('#2b3260', o.acc, 0.25 * (o.lit || 0)); ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = o.red > 0 ? H.mixHex('#8e98c8', RED, o.red) : H.mixHex('#8e98c8', o.acc, o.lit || 0); ctx.stroke();
  // door knob strip on the right edge
  H.roundRect(ctx, W / 2 - 18, -14, 8, 28, 4); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fill();
  appIcon(ctx, H, o.icon, 0, -16, 0.8, '#ffffff');
  ctx.font = H.font('ui', 26); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(o.text, 0, 34);
  ctx.restore();
}

function reachArm(ctx, H, x0, y0, x1, y1, u, col, grab) {
  // a long robot arm from (x0,y0) toward (x1,y1); u 0..1 = how far it has reached; grabby hand at the tip
  if (u <= 0) return null;
  const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 70;
  const pts = []; for (let i = 0; i <= 24; i++) { const k = (i / 24) * u; const a = 1 - k; pts.push([a * a * x0 + 2 * a * k * mx + k * k * x1, a * a * y0 + 2 * a * k * my + k * k * y1]); }
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#5a6288'; ctx.lineWidth = 16; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  ctx.strokeStyle = '#c9cfe6'; ctx.lineWidth = 10; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
  // joints
  for (let i = 6; i < pts.length; i += 6) { ctx.fillStyle = '#9aa3c6'; ctx.beginPath(); ctx.arc(pts[i][0], pts[i][1], 9, 0, Math.PI * 2); ctx.fill(); }
  const [hx, hy] = pts[pts.length - 1];
  H.glow(ctx, hx, hy, 50, col, 0.5);
  ctx.fillStyle = '#e8ebf7'; ctx.beginPath(); ctx.arc(hx, hy, 15, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#e8ebf7'; ctx.lineWidth = 7;
  const open = 0.5 + 0.5 * grab;
  for (const d of [-1, 0, 1]) { const a = d * 0.6 * open; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx + Math.cos(a) * 26, hy + Math.sin(a) * 26); ctx.stroke(); }
  ctx.restore();
  return [hx, hy];
}

function botHead(ctx, H, x, y, s, acc) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  H.roundRect(ctx, -30, -26, 60, 52, 16); ctx.fillStyle = '#e8ebf7'; ctx.fill();
  H.roundRect(ctx, -23, -17, 46, 32, 10); ctx.fillStyle = '#1b2140'; ctx.fill();
  ctx.fillStyle = acc; H.roundRect(ctx, -13, -9, 8, 16, 4); ctx.fill(); H.roundRect(ctx, 5, -9, 8, 16, 4); ctx.fill();
  ctx.strokeStyle = '#c9cfe6'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -26); ctx.lineTo(0, -38); ctx.stroke();
  ctx.fillStyle = acc; ctx.beginPath(); ctx.arc(0, -40, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const reply = P.reply || '“Overnight into Friday morning I was idle.”';
  const apps = (P.apps || [{ text: 'Email', icon: 'mail' }, { text: 'Calendar', icon: 'cal' }, { text: 'Code', icon: 'code' }]).slice(0, 3);
  const tAsk = Math.max(0.1, at(P.askCue, 0.2) - 0.1);
  const tIdle = Math.max(tAsk + 1.4, at(P.idleCue, D * 0.22) - 0.25);
  const tChk = [tAsk + 0.5, tAsk + 1.0];
  const tCover = Math.max(tIdle + 2.2, at(P.coverCue, D * 0.53) - 0.5);
  const tServ = Math.max(tCover + 1.0, at(P.serverCue, D * 0.78) - 0.6);
  const tChat = Math.max(tServ + 0.6, Math.min(D - 0.6, at(P.chatCue, D * 0.92) - 0.35));
  const shrink = smooth(clamp((t - tCover) / 0.6));

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 720 }, { t: tCover, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.03, x: 500, y: 730 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true, plant: false, floorY: 960 });

  // ---- hidden side (right): servers + calls to app doors
  if (shrink > 0) {
    ctx.save(); ctx.globalAlpha = shrink;
    const sx = [680, 800];
    const act = t > tServ - 0.4 ? 1 : 0.35;
    sx.forEach((x, i) => K.drawServerRack(ctx, x, 1000, 0.95, { t: t + i, activity: act }));
    const doorX = [592, 702, 812], doorY = 575;
    apps.forEach((a, i) => appDoor(ctx, H, K, doorX[i], doorY, { text: a.text, icon: a.icon, pop: K.popIn(t, tCover + 0.2 + i * 0.12, 0.4), lit: 0, red: clamp((t - tServ - 0.2 - i * 0.2) / 0.3) * (0.6 + 0.4 * Math.sin(t * 5 + i)), acc: ACC, w: 96, h: 92 }));
    // dotted calls rising from the racks
    if (t > tServ - 0.3) {
      ctx.setLineDash([4, 14]); ctx.lineDashOffset = -t * 60; ctx.lineCap = 'round';
      apps.forEach((a, i) => {
        const k = clamp((t - tServ + 0.3 - i * 0.2) / 0.5); if (k <= 0) return;
        const x0 = sx[i % 2], y0 = 760, x1 = doorX[i], y1 = doorY + 52;
        ctx.strokeStyle = H.rgba('#ff8a80', 0.9 * k); ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.quadraticCurveTo((x0 + x1) / 2 + 40, (y0 + y1) / 2, lerp(x0, x1, 1), lerp(y0, y1, k)); ctx.stroke();
      });
      ctx.setLineDash([]);
    }
    const svP = K.popIn(t, tServ, 0.4);
    if (svP > 0) K.drawLabel(ctx, 740, 690, svP, { text: P.servers || "Platform's servers", size: 24, dot: true });
    ctx.restore();
  }

  // ---- chat window (shrinks to the left)
  const X0 = lerp(150, 120, shrink), Y0 = lerp(470, 500, shrink), sc = lerp(1, 0.55, shrink);
  ctx.save(); ctx.translate(X0, Y0); ctx.scale(sc, sc);
  const W = 680, Hh = 480;
  ctx.fillStyle = 'rgba(0,0,0,0.4)'; H.roundRect(ctx, 10, 14, W, Hh, 30); ctx.fill();
  H.roundRect(ctx, 0, 0, W, Hh, 30); ctx.fillStyle = '#f2f4fa'; ctx.fill();
  H.roundRect(ctx, 0, 0, W, 74, 30); ctx.fillStyle = '#1b2140'; ctx.fill(); ctx.fillRect(0, 44, W, 30);
  botHead(ctx, H, 50, 40, 0.7, ACC);
  ctx.font = H.font('ui', 28); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(P.title || 'Chat with your bot', 92, 38);
  // owner's "?" bubble (right) with three app icons
  const qp = K.popIn(t, tAsk, 0.4);
  if (qp > 0) {
    ctx.save(); ctx.translate(W - 60, 140); ctx.scale(qp, qp);
    H.roundRect(ctx, -300, -44, 300, 88, 26); ctx.fillStyle = ACC; ctx.fill();
    ['mail', 'cal', 'code'].forEach((k, i) => appIcon(ctx, H, k, -250 + i * 70, 0, 0.6, '#141829'));
    ctx.font = H.font('display', 46); ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.fillText('?', -40, 4);
    ctx.restore();
  }
  // two checking rows
  ctx.font = H.font('ui', 22); ctx.textAlign = 'left';
  tChk.forEach((tc, i) => {
    const p = K.popIn(t, tc, 0.35); if (p <= 0) return;
    const y = 222 + i * 44, done = t > tc + 0.45;
    ctx.save(); ctx.globalAlpha = Math.min(1, p);
    H.roundRect(ctx, 36, y - 18, 250, 36, 18); ctx.fillStyle = '#e0e4f2'; ctx.fill();
    if (done) { ctx.strokeStyle = '#2a8c4a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(52, y); ctx.lineTo(60, y + 8); ctx.lineTo(74, y - 8); ctx.stroke(); }
    else { ctx.strokeStyle = '#6a7090'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(63, y, 10, t * 8, t * 8 + 4.2); ctx.stroke(); }
    ctx.fillStyle = '#3b4160'; ctx.fillText(P.checks || 'Checking apps...', 88, y + 1);
    ctx.restore();
  });
  // the verbatim reply (left), typed
  const rp = K.popIn(t, tIdle, 0.35);
  if (rp > 0) {
    const shown = Math.min(reply.length, Math.floor((t - tIdle) * 30));
    const lines = H.wrap(ctx, reply, 'bold', 34, W - 170);
    let left = shown;
    const bh = lines.length * 42 + 36;
    ctx.save(); ctx.translate(36, 330); ctx.scale(rp, rp);
    H.roundRect(ctx, 0, 0, W - 110, bh, 24); ctx.fillStyle = '#1b2140'; ctx.fill();
    ctx.font = H.font('bold', 34); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    lines.forEach((ln, i) => { const s = ln.slice(0, Math.max(0, left)); left -= ln.length + 1; ctx.fillText(s, 26, 50 + i * 42); });
    ctx.restore();
    botHead(ctx, H, W - 46, 330 + bh - 26, 0.6 * rp, ACC);
  }
  // 0 calls mark over the chat
  const nP = K.popIn(t, tChat, 0.4);
  if (nP > 0) {
    ctx.save(); ctx.translate(W / 2, Hh / 2 + 20); ctx.rotate(-0.1); ctx.scale(nP * 1.4, nP * 1.4);
    ctx.font = H.font('display', 34); const txt = P.none || '0 CALLS IN ITS CHAT'; const w = ctx.measureText(txt).width + 40;
    H.roundRect(ctx, -w / 2, -32, w, 64, 14); ctx.fillStyle = 'rgba(255,90,82,0.95)'; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, 0, 2);
    ctx.restore();
  }
  ctx.restore();

  // ---- small attribution under the chat in phase 1, then the cover-up pill
  const byP = K.popIn(t, tIdle + 0.3, 0.4) * (1 - shrink);
  if (byP > 0) K.drawLabel(ctx, 487, 1010, byP, { text: P.replyBy || "Grok Bot's reply, per NewCore", size: 24 });
  const cP = K.popIn(t, tCover + 0.3, 0.4);
  if (cP > 0) K.drawLabel(ctx, 330, 1010, cP, { text: P.cover || 'Not a cover-up, NewCore says', size: 26, accent: true });
  ctx.restore();
}
