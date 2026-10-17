// Scene "keys-lying-around" (full frame; span 2 beats). How an AI agent got in without breaking anything.
// Beat 1 (hallway at night): three spots on the wall hold keys left out in the open (a settings window, a pinned
//   code sheet, a cloud with an over-full key ring); the keys glow, a robot walks past and collects one per spot on
//   cue (each spot gets a pill), then unlocks a door labelled with the room name; the door swings open.
// Beat 2 (records room): drawers slide open and two folders float up with labels; the robot reads at a desk; a
//   dashed "assigned task" zone on the floor is left behind ("beyond" pill); a wall monitor shows a calm green
//   "No alerts" screen with a "Not caught" pill; finally an envelope flies in with a "reported by" pill.
// Fits: "exposed credentials / passwords in code", "keys left lying around", "nobody noticed", "self-reported".
// params (all optional): keys [{text, cue}] (3), room, files [2], task, beyond, screen, caught, report
//        cues: keysCue, insideCue, beyondCue, caughtCue, reportCue (narration words; else fractions)
function drawKey(ctx, x, y, s, rot, color, dark) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  ctx.fillStyle = color; ctx.strokeStyle = dark; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(-26, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = dark; ctx.beginPath(); ctx.arc(-26, 0, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color; ctx.fillRect(-10, -6, 50, 12); ctx.strokeRect(-10, -6, 50, 12);
  ctx.fillRect(26, 6, 8, 12); ctx.fillRect(14, 6, 7, 9);
  ctx.restore();
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const D = info.duration, ACC = info.accent, N = K.NEUTRAL;
  const at = (w, d) => { const v = w != null ? info.timeOf(w) : null; return v == null ? d : v; };
  const tB = info.beats && info.beats[1] ? info.beats[1].t0 : D * 0.46;
  const keys = (P.keys && P.keys.length ? P.keys : [{ text: 'App settings' }, { text: 'Public code' }, { text: 'Cloud: too much access' }]).slice(0, 3);
  const tKeys = at(P.keysCue, 0.6);
  const kt = keys.map((k, i) => at(k.cue, tB * (0.35 + i * 0.15)));
  const tDoor = Math.min(tB - 0.9, kt[2] + 1.3);
  const tIn = at(P.insideCue, tB + 0.1), tBeyond = at(P.beyondCue, tB + (D - tB) * 0.4);
  const tCaught = at(P.caughtCue, tB + (D - tB) * 0.68), tReport = at(P.reportCue, tB + (D - tB) * 0.88);
  const beat2 = t >= tB;
  const feet = 1010;

  const pill = (text, x, y, a, b, o = {}) => {
    if (t < a || t > b + 0.35) return;
    ctx.save(); ctx.globalAlpha = K.fadeOut(t, b, 0.35);
    K.drawLabel(ctx, x, y, K.popIn(t, a, 0.4), { text, size: o.size || 26, dot: !o.accent, accent: o.accent });
    ctx.restore();
  };

  ctx.save();
  if (!beat2) {
    // ================= beat 1: hallway
    K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 760 }, { t: kt[2] + 0.2, zoom: 1.0, x: 487, y: 770 }, { t: tB, zoom: 1.0, x: 487, y: 790 }]);
    K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 900, wall: '#2b2f52', wallS: '#23264a' });
    const spots = [{ x: 200, y: 650 }, { x: 420, y: 650 }, { x: 630, y: 650 }];
    // spot 1: a settings window (gear + toggles)
    { const { x, y } = spots[0];
      H.roundRect(ctx, x - 90, y - 70, 180, 140, 14); ctx.fillStyle = '#e8ecf7'; ctx.fill();
      H.roundRect(ctx, x - 90, y - 70, 180, 26, 12); ctx.fillStyle = '#b9c1d6'; ctx.fill();
      ['#ff6b5e', '#ffcc33', '#6ee7a8'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x - 72 + i * 16, y - 57, 5, 0, Math.PI * 2); ctx.fill(); });
      ctx.save(); ctx.translate(x - 45, y + 5); ctx.rotate(t * 0.8); ctx.fillStyle = '#5b6aa8';
      for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.fillRect(-5, -26, 10, 12); }
      ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#e8ecf7'; ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      for (let i = 0; i < 3; i++) { H.roundRect(ctx, x + 2, y - 30 + i * 30, 60, 18, 9); ctx.fillStyle = i === 1 ? ACC : '#c3c9dc'; ctx.fill(); ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x + (i === 1 ? 53 : 11), y - 21 + i * 30, 7, 0, Math.PI * 2); ctx.fill(); } }
    // spot 2: a pinned code sheet on a cork board
    { const { x, y } = spots[1];
      H.roundRect(ctx, x - 95, y - 75, 190, 150, 10); ctx.fillStyle = '#9a6a46'; ctx.fill();
      H.roundRect(ctx, x - 80, y - 62, 160, 124, 6); ctx.fillStyle = '#c99a6a'; ctx.fill();
      ctx.save(); ctx.translate(x, y); ctx.rotate(-0.04);
      H.roundRect(ctx, -62, -56, 124, 112, 4); ctx.fillStyle = '#f2f4fa'; ctx.fill();
      const cols = ['#5b6aa8', '#e8786a', '#4fb3a6', '#5b6aa8', '#c3c9dc'];
      for (let i = 0; i < 5; i++) { ctx.fillStyle = cols[i]; H.roundRect(ctx, -50 + (i % 2) * 14, -42 + i * 19, 60 + ((i * 37) % 30), 8, 4); ctx.fill(); }
      ctx.fillStyle = '#ff6b5e'; ctx.beginPath(); ctx.arc(0, -54, 7, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); }
    // spot 3: a cloud with a hook
    { const { x, y } = spots[2];
      ctx.fillStyle = '#dfe4f1';
      [[-50, 10, 40], [-10, -14, 50], [40, 4, 42], [0, 22, 44]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(x + dx, y + dy - 20, r, 0, Math.PI * 2); ctx.fill(); });
      ctx.strokeStyle = '#8a92b8'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y + 40); ctx.lineTo(x, y + 62); ctx.arc(x + 9, y + 62, 9, Math.PI, 0, true); ctx.stroke(); }
    // keys at the spots (+ the cloud's full ring) until picked up; then they fly to the robot
    const keyHome = [[spots[0].x + 40, spots[0].y + 50], [spots[1].x + 30, spots[1].y + 30], [spots[2].x + 10, spots[2].y + 100]];
    const glowK = K.fadeIn(t, tKeys, 0.4);
    // robot walks the hall, arriving under each spot just before its cue
    const rx = (() => {
      const stops = [[0, 130], [kt[0] - 0.3, spots[0].x + 40], [kt[1] - 0.3, spots[1].x + 30], [kt[2] - 0.3, spots[2].x + 20], [tDoor - 0.2, 735]];
      for (let i = 0; i < stops.length - 1; i++) {
        const [a, xa] = stops[i], [b, xb] = stops[i + 1];
        if (t < b) return lerp(xa, xb, smooth(clamp((t - Math.max(a, b - 1.1)) / Math.min(1.1, b - a))));
      }
      return 735;
    })();
    const rS = 0.95, handY = feet - 150;
    keys.forEach((k, i) => {
      const [hx, hy] = keyHome[i];
      const fly = clamp((t - kt[i]) / 0.5);
      const ring = i === 2 ? 3 : 1;
      for (let j = 0; j < ring; j++) {
        const ox = (j - (ring - 1) / 2) * 22, rot = 1.2 + (j - 1) * 0.35;
        const x = lerp(hx + ox, rx + 30, easeOutCubic(fly)), y = lerp(hy + Math.abs(ox) * 0.3, handY - 30 - i * 14, easeOutCubic(fly)) - Math.sin(fly * Math.PI) * 60;
        if (fly <= 0 && glowK > 0) K.glow(ctx, x, y, 46, ACC, 0.35 * glowK * (0.75 + 0.25 * Math.sin(t * 5 + i)));
        if (fly >= 1) continue;
        drawKey(ctx, x, y, 0.9, rot + fly * 2.5, ACC, '#6b5a12');
      }
      if (i === 2) { ctx.strokeStyle = '#8a92b8'; ctx.lineWidth = 4; if (fly <= 0) { ctx.beginPath(); ctx.arc(hx, hy - 12, 26, 0, Math.PI * 2); ctx.stroke(); } }
    });
    // door on the right
    const dx = 822, dTop = feet - 290, open = K.phase(t, tDoor + 0.25, tDoor + 0.9);
    H.roundRect(ctx, dx - 82, dTop - 10, 164, 300, 8); ctx.fillStyle = '#1c2033'; ctx.fill();
    // light spilling from the open door
    if (open > 0) { ctx.save(); ctx.globalAlpha = open; ctx.fillStyle = '#ffe7a8'; ctx.fillRect(dx - 72, dTop, 144, 290 - 10); ctx.restore(); }
    const dw = 144 * (1 - 0.82 * open);
    H.roundRect(ctx, dx - 72, dTop, dw, 280, 6); ctx.fillStyle = '#764d31'; ctx.fill();
    ctx.fillStyle = '#9a6a46'; H.roundRect(ctx, dx - 62, dTop + 14, Math.max(0, dw - 20), 110, 4); ctx.fill(); H.roundRect(ctx, dx - 62, dTop + 140, Math.max(0, dw - 20), 120, 4); ctx.fill();
    if (open < 0.5) {
      ctx.save(); ctx.translate(dx - 72 + dw - 22, dTop + 150);
      ctx.rotate(K.phase(t, tDoor - 0.1, tDoor + 0.25) * Math.PI / 2);
      ctx.fillStyle = '#ffd25a'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#6b5a12'; ctx.fillRect(-2, -7, 4, 14);
      ctx.restore();
    }
    pill(P.room || 'RECORDS', dx, dTop - 22, 0.3, D, { size: 26 });
    // robot
    const walking = keys.some((k, i) => t > kt[i] - 1.4 && t < kt[i] - 0.3) || (t > kt[2] + 0.2 && t < tDoor);
    K.drawRobot(ctx, rx, feet - 4 + (walking ? -Math.abs(Math.sin(t * 9)) * 6 : 0), rS, { t, state: t >= tDoor ? 'happy' : 'working', seed: 5 });
    // collected keys bunch held up next to the robot
    const got = kt.filter((x) => t >= x + 0.5).length;
    for (let i = 0; i < got + (got === 3 ? 2 : 0); i++) drawKey(ctx, rx + 46 + i * 5, handY - 20 - i * 8, 0.7, 1.3 + i * 0.25, ACC, '#6b5a12');
    // pills
    pill('Keys left out', 487, 520, tKeys, kt[0] - 0.2, { size: 30, accent: true });
    keys.forEach((k, i) => pill(k.text, spots[i].x + (i === 2 ? 20 : 0), i === 1 ? 512 : 562, kt[i], tB, { size: 24 }));
  } else {
    // ================= beat 2: records room
    const t2 = t - tB;
    K.camera(ctx, t, [{ t: tB, zoom: 1.0, x: 487, y: 790 }, { t: tB + 1.2, zoom: 1.0, x: 487, y: 760 }, { t: tCaught - 0.4, zoom: 1.0, x: 487, y: 760 },
      { t: tCaught + 0.6, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.0, x: 487, y: 750 }]);
    K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: false, plant: false, floorY: 900, wall: '#2a2d4d', wallS: '#22254a' });
    // filing cabinets (left)
    const cabs = [120, 250];
    cabs.forEach((cx, ci) => {
      H.roundRect(ctx, cx - 58, feet - 300, 116, 296, 8); ctx.fillStyle = '#5a6488'; ctx.fill();
      for (let d = 0; d < 4; d++) {
        const idx = ci * 4 + d, o = K.phase(t, tIn + 0.2 + idx * 0.18, tIn + 0.6 + idx * 0.18) * (idx % 3 === 1 ? 34 : idx % 3 === 0 ? 18 : 0);
        H.roundRect(ctx, cx - 50 + o * 0.25, feet - 290 + d * 72, 100, 64, 6); ctx.fillStyle = o > 0 ? '#7a84aa' : '#6c769c'; ctx.fill();
        if (o > 0) { ctx.fillStyle = '#e8d6a8'; ctx.fillRect(cx - 40 + o * 0.25, feet - 300 + d * 72, 80, 12); }
        H.roundRect(ctx, cx - 18 + o * 0.25, feet - 262 + d * 72, 36, 8, 4); ctx.fillStyle = '#c3c9dc'; ctx.fill();
      }
    });
    // desk with papers and the robot reading
    K.drawDesk(ctx, 560, feet, 1.05);
    const files = (P.files && P.files.length ? P.files : ['Personal data', 'Confidential']).slice(0, 2);
    const rdX = 560;
    K.drawRobot(ctx, rdX, feet - 2, 0.95, { t, state: 'working', seed: 5 });
    K.drawDocument(ctx, rdX - 90, feet - 112, 0.5, { lines: 5 });
    K.drawDocument(ctx, rdX + 92, feet - 112, 0.5, { lines: 4, seal: true });
    // "assigned task" zone left behind by the door
    const zone = K.fadeIn(t, tB + 0.3, 0.4);
    ctx.save(); ctx.globalAlpha = zone; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 30; ctx.strokeStyle = ACC; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.ellipse(800, feet - 10, 70, 22, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
    pill(P.task || 'Assigned task', 790, feet - 44, tB + 0.4, D, { size: 22 });
    // dotted footsteps from the zone to the desk once "beyond" is said
    const steps = K.phase(t, tBeyond - 0.2, tBeyond + 0.8, (k) => k);
    for (let i = 0; i < 5; i++) {
      if (steps < (i + 1) / 5) break;
      const x = lerp(730, 640, i / 4), y = feet - 8 + (i % 2) * 10;
      ctx.fillStyle = 'rgba(255,107,94,0.8)'; ctx.beginPath(); ctx.ellipse(x, y, 10, 5, 0, 0, Math.PI * 2); ctx.fill();
    }
    pill(P.beyond || 'Beyond its task', 760, 905, tBeyond, tCaught - 0.2, { size: 28 });
    // folders floating up from the cabinets
    files.forEach((f, i) => {
      const a = tIn + 0.9 + i * 0.6;
      if (t < a) return;
      const k = easeOutCubic(clamp((t - a) / 0.7));
      const x = lerp(cabs[i], 290 + i * 310, k), y = lerp(feet - 260, 560, k) + K.bob(t, 6, 0.35, i * 0.5);
      ctx.save(); ctx.translate(x, y); ctx.rotate((1 - k) * 0.4 - 0.05 + i * 0.1);
      H.roundRect(ctx, -110, -70, 90, 26, 8); ctx.fillStyle = i ? '#e8a23a' : '#e8c23a'; ctx.fill();
      H.roundRect(ctx, -110, -56, 220, 130, 10); ctx.fillStyle = i ? '#f0b04a' : '#f2d04f'; ctx.fill();
      H.roundRect(ctx, -90, -40, 180, 96, 6); ctx.fillStyle = '#f7f1df'; ctx.fill();
      if (i === 0) { for (let j = 0; j < 3; j++) { ctx.fillStyle = '#8a92b8'; ctx.beginPath(); ctx.arc(-58 + j * 58, -8, 14, 0, Math.PI * 2); ctx.fill(); H.roundRect(ctx, -78 + j * 58, 10, 40, 24, 10); ctx.fill(); } }
      else { for (let j = 0; j < 4; j++) { ctx.fillStyle = j === 1 ? '#161927' : '#c3c9dc'; H.roundRect(ctx, -72, -28 + j * 20, 144 - (j % 2) * 30, 10, 5); ctx.fill(); } }
      ctx.restore();
      pill(f, x, y - 84, a + 0.3, D, { size: 26, accent: i === 1 });
    });
    // wall monitor (right, high): calm screen
    const mx = 828, my = 600;
    H.roundRect(ctx, mx - 86, my - 70, 172, 130, 12); ctx.fillStyle = '#1c2033'; ctx.fill();
    H.roundRect(ctx, mx - 74, my - 58, 148, 106, 6); ctx.fillStyle = '#10301f'; ctx.fill();
    ctx.strokeStyle = '#6ee7a8'; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= 26; i++) { const x = mx - 66 + i * 5.1, y = my + 26 + Math.sin(i * 0.7 + t * 2) * 3; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke();
    ctx.fillStyle = '#6ee7a8'; ctx.font = K.font.ui(24); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.screen || 'No alerts', mx, my - 22);
    ctx.fillStyle = '#3b4260'; ctx.fillRect(mx - 8, my + 60, 16, 22);
    if (t >= tCaught) K.drawStamp(ctx, mx, my + 210, 0.6, { kind: 'cross', text: P.caught || 'Not caught', land: (t - tCaught) / 0.5 });
    // report envelope flies in from the left, lands under the folders
    if (t >= tReport - 0.2) {
      const k = easeOutCubic(clamp((t - tReport + 0.2) / 0.7));
      const x = lerp(-80, 330, k), y = lerp(500, 770, k) - Math.sin(k * Math.PI) * 80;
      ctx.save(); ctx.translate(x, y); ctx.rotate((1 - k) * -0.5);
      H.roundRect(ctx, -60, -40, 120, 80, 8); ctx.fillStyle = N.paper; ctx.fill();
      ctx.strokeStyle = N.lightS; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-60, -38); ctx.lineTo(0, 6); ctx.lineTo(60, -38); ctx.stroke();
      ctx.fillStyle = ACC; ctx.beginPath(); ctx.arc(0, 8, 12, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      pill(P.report || 'Reported by the AI company', 487, 735, tReport + 0.3, D + 1, { size: 28, accent: true });
    }
    // brief white-flash wipe as we step through the door
    const flash = 1 - clamp(t2 / 0.4);
    if (flash > 0) { ctx.save(); ctx.globalAlpha = flash * 0.8; ctx.fillStyle = '#ffe7a8'; ctx.fillRect(-200, -200, 1480, 2320); ctx.restore(); }
  }
  ctx.restore();
}
