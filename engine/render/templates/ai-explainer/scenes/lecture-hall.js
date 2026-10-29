// Scene "lecture-hall" (full frame). A college lecture hall seen from the front: a projector screen with the course
// banner, four tiered rows of six cartoon students at long desks with laptops, an EXIT door at the front right.
// A few students pack up and walk out: along their row, down the side aisle and out of the door. Only `leave`
// seats empty (default 3 of 24 = 12.5%; pick `leave` close to your published drop: 24 seats, ~4% each).
// modes: "hook"  cold open: at frame 0 two students are already on their way out, a third stands up; the `chip`
//                (e.g. "-12%") slams onto the screen with a down arrow at ~0.8 s; ends settled.
//        "count" the hall after they left: the empty seats glow; the screen turns into a stats board whose rows
//                count down to each panel's value on its cue (word); students glance at the door.
// params: mode, banner ("INTRO COURSE 101"; split over two lines, second in the accent), chip ("-12%"), chipLabel,
//         leave (3, max 6), panels [{title, value (negative number, e.g. -12.5), cue}] (max 2, count mode),
//         note (small line)
// Cues are narration words ("word#n" = the (n+1)th time spoken in the scene) or a number of seconds.
// Fits: students leaving a major, enrollment drops, classes emptying, a course losing people.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const mode = P.mode || 'hook';
  const hook = mode === 'hook';
  const RED = '#ff5a6e';

  // story clock: hook starts mid-exit; count mode starts after everyone has left
  const T = hook ? t + 1.0 : t + 12;

  ctx.save();
  if (hook) K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 520, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 740 }]);
  else K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 740 }, { t: D, zoom: 1.05, x: 470, y: 720 }]);

  // ---- room
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#232846'); g.addColorStop(0.55, '#2b3156'); g.addColorStop(1, '#141730');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  // wood wall panels behind the rows
  for (let i = 0; i < 7; i++) { roundRect(ctx, -20 + i * 160, 600, 140, 470, 8); ctx.fillStyle = 'rgba(120,86,64,0.18)'; ctx.fill(); }
  // ceiling lights
  for (let i = 0; i < 4; i++) { const x = 160 + i * 250; roundRect(ctx, x - 60, 418, 120, 10, 5); ctx.fillStyle = '#dfe4f1'; ctx.fill(); K.glow(ctx, x, 430, 110, '#ffffff', 0.08); }
  // side wall + exit door (front right)
  ctx.fillStyle = '#1d2140'; ctx.beginPath(); ctx.moveTo(820, 600); ctx.lineTo(1080, 560); ctx.lineTo(1080, 1100); ctx.lineTo(820, 1060); ctx.closePath(); ctx.fill();
  const DX = 872, DY = 1046;
  roundRect(ctx, DX - 52, DY - 230, 104, 230, 8); ctx.fillStyle = '#121527'; ctx.fill();
  roundRect(ctx, DX - 44, DY - 222, 88, 222, 6); ctx.fillStyle = '#3a4675'; ctx.fill();
  ctx.fillStyle = '#2a3358'; ctx.fillRect(DX - 44, DY - 222, 30, 222);
  H.glow(ctx, DX, DY - 120, 120, '#7dff9a', 0.10);
  roundRect(ctx, DX - 50, DY - 284, 100, 40, 8); ctx.fillStyle = '#123a22'; ctx.fill();
  ctx.font = H.font('ui', 26); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#7dff9a';
  ctx.fillText('EXIT', DX, DY - 263);
  // aisle stairs
  for (let i = 0; i < 4; i++) { roundRect(ctx, 760, 740 + i * 104, 70, 12, 4); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill(); }

  // ---- screen
  const SX0 = 130, SX1 = 830, SY0 = 440, SY1 = hook ? 596 : 606;
  roundRect(ctx, SX0 - 10, SY0 - 10, SX1 - SX0 + 20, SY1 - SY0 + 20, 16); ctx.fillStyle = '#0d1020'; ctx.fill();
  roundRect(ctx, SX0, SY0, SX1 - SX0, SY1 - SY0, 10); ctx.fillStyle = '#171c36'; ctx.fill();
  ctx.save(); roundRect(ctx, SX0, SY0, SX1 - SX0, SY1 - SY0, 10); ctx.clip();
  H.glow(ctx, 480, SY0 + 60, 340, ACC, 0.06);
  const banner = String(P.banner || 'INTRO COURSE 101');

  // ---- seats and who leaves
  const ROWS = [{ y: 742, s: 0.55 }, { y: 846, s: 0.65 }, { y: 950, s: 0.76 }, { y: 1052, s: 0.88 }];
  const COLS = 6, X0 = 130, X1 = 700;
  const nLeave = clamp(P.leave == null ? 3 : P.leave | 0, 0, 6);
  const leavers = [ { r: 3, c: 3, L: 0.4 }, { r: 2, c: 2, L: 0.2 }, { r: 1, c: 4, L: 2.2 }, { r: 3, c: 1, L: 2.6 }, { r: 2, c: 0, L: 3.1 }, { r: 1, c: 1, L: 3.6 } ].slice(0, nLeave);
  const leaveOf = (r, c) => leavers.find((l) => l.r === r && l.c === c);
  const seatX = (r, c) => lerp(X0 + r * 6, X1 - r * 6, c / (COLS - 1));
  const SPEED = 300;
  // walk path for a leaver, by story-time since standing up
  function walkPos(l, k) {
    const row = ROWS[l.r], sx = seatX(l.r, l.c);
    const pts = [[sx, row.y, row.s], [790, row.y, row.s], [790, 1052, 0.88], [DX, 1046, 0.86]];
    let d = Math.max(0, k - 0.35) * SPEED;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (d <= len) { const u = len ? d / len : 1; return { x: lerp(a[0], b[0], u), y: lerp(a[1], b[1], u), s: lerp(a[2], b[2], u), seg: i, out: 0 }; }
      d -= len;
    }
    return { x: DX, y: 1046, s: 0.86, seg: 3, out: clamp(d / 60) };
  }
  // screen content
  if (hook) {
    ctx.font = H.font('display', 52); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
    const words = banner.split(' '), half = Math.max(1, Math.floor(words.length / 2));
    const l1 = words.slice(0, half).join(' '), l2 = words.slice(half).join(' ');
    const f1 = H.fitText(ctx, l1, 'display', 50, 26, 360), f2 = H.fitText(ctx, l2 || ' ', 'display', 50, 26, 360);
    ctx.font = f1.font; ctx.fillText(f1.text, SX0 + 34, SY0 + (l2 ? 52 : 78)); if (l2) { ctx.font = f2.font; ctx.fillStyle = ACC; ctx.fillText(f2.text, SX0 + 34, SY0 + 108); }
    // the chip
    const pc = K.popIn(t, 0.75, 0.45);
    if (pc > 0) {
      const cx = 672, cy = SY0 + 70;
      ctx.save(); ctx.translate(cx, cy); const sc = 1.5 - 0.5 * Math.min(1, pc); ctx.scale(sc, sc); ctx.globalAlpha = clamp(pc * 2);
      roundRect(ctx, -150, -52, 300, 104, 20); ctx.fillStyle = RED; ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center';
      const fc = H.fitText(ctx, String(P.chip || '-12%'), 'display', 64, 36, 190); ctx.font = fc.font; ctx.fillText(fc.text, 28, 4);
      // down arrow
      ctx.beginPath(); ctx.moveTo(-122, -18); ctx.lineTo(-90, -18); ctx.lineTo(-90, 6); ctx.lineTo(-74, 6); ctx.lineTo(-106, 40); ctx.lineTo(-138, 6); ctx.lineTo(-122, 6); ctx.closePath(); ctx.fill();
      ctx.restore();
      if (P.chipLabel) { ctx.globalAlpha = clamp((t - 1.0) / 0.3); ctx.font = H.font('ui', 26); ctx.fillStyle = '#c9d0e6'; ctx.textAlign = 'center'; ctx.fillText(String(P.chipLabel), 672, SY0 + 136); ctx.globalAlpha = 1; }
    }
  } else {
    ctx.font = H.font('ui', 26); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#9aa3bd';
    ctx.fillText(banner + (P.note ? '  ·  ' + P.note : ''), SX0 + 30, SY0 + 34);
    const panels = (P.panels || []).slice(0, 2);
    panels.forEach((pn, i) => {
      const tc = at(pn.cue, D * (0.2 + 0.4 * i)) - 0.3;
      const pop = K.popIn(t, tc, 0.4); if (pop <= 0) return;
      const y = SY0 + 82 + i * 62;
      ctx.save(); ctx.globalAlpha = clamp(pop * 2); ctx.translate(-(1 - Math.min(1, pop)) * 40, 0);
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left';
      const f = H.fitText(ctx, String(pn.title), 'bold', 32, 22, 400); ctx.font = f.font; ctx.fillText(f.text, SX0 + 30, y);
      const k = K.phase(t, tc + 0.1, tc + 1.0, H.easeOutCubic);
      const v = (Number(pn.value) || 0) * k;
      ctx.font = H.font('display', 54); ctx.textAlign = 'right'; ctx.fillStyle = RED;
      ctx.fillText((v < 0 ? '-' : '') + Math.abs(v).toFixed(1) + '%', SX1 - 34, y + 4);
      ctx.restore();
    });
  }
  ctx.restore(); // screen clip

  // ---- rows (back to front), leavers inside their row until they reach the aisle
  const aisle = [];
  ROWS.forEach((row, r) => {
    for (let c = 0; c < COLS; c++) {
      const x = seatX(r, c), l = leaveOf(r, c), seed = r * 7 + c;
      const look = hook ? 0 : (t > 1.2 ? 0.8 : 0);
      const style = { skin: (seed * 3) % 5, hair: (seed * 2 + 1) % 5, shirt: ['#6f86e0', '#4fb3a6', '#e8786a', '#a08be0', '#e0a84f', '#5fa8d8'][seed % 6], hairStyle: ['short', 'long', 'curly', 'bun', 'short', 'none'][seed % 6] };
      if (!l || T < l.L) {
        K.drawPerson(ctx, x, row.y, row.s, { t, pose: 'sit-laptop', seat: false, mood: hook || !l ? (hook ? 'neutral' : 'neutral') : 'neutral', look, seed, ...style });
        continue;
      }
      const k = T - l.L, p = walkPos(l, k);
      if (k < 0.35) { // standing up
        const up = H.easeOutCubic(clamp(k / 0.35));
        K.drawPerson(ctx, x, row.y - 6 * up, row.s, { t, pose: up > 0.5 ? 'stand' : 'sit', seat: false, mood: 'neutral', look: 0.8, seed, ...style });
        backpack(ctx, H, x, row.y, row.s, up);
      } else if (p.seg === 0) {
        K.drawPerson(ctx, p.x, p.y, p.s, { t, walk: T + seed * 0.3, mood: 'neutral', look: 0.9, seed, ...style });
        backpack(ctx, H, p.x, p.y, p.s, 1);
      } else if (p.out < 1) aisle.push({ p, seed, style, T });
    }
    // the row's long desk with laptops for the seated
    const dy = row.y - 70 * row.s;
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 12;
    roundRect(ctx, X0 - 80 * row.s - 10, dy, X1 - X0 + 160 * row.s + 20, 74 * row.s + 6, 8); ctx.fillStyle = '#5a3d2c'; ctx.fill();
    ctx.restore();
    roundRect(ctx, X0 - 80 * row.s - 16, dy - 8, X1 - X0 + 160 * row.s + 32, 14, 6); ctx.fillStyle = '#7d5841'; ctx.fill();
    for (let c = 0; c < COLS; c++) {
      const x = seatX(r, c), l = leaveOf(r, c);
      const gone = l && T >= l.L;
      if (!gone) K.drawLaptop(ctx, x, dy + 2, 0.34 * row.s, { t: t + c, screen: 'code', shadow: false, glow: false });
      else if (!hook) {
        // the empty seat glows
        const tg = at((P.panels && P.panels[0] && P.panels[0].cue) || null, 0.6) - 0.3;
        const k2 = clamp((t - tg) / 0.4);
        if (k2 > 0) {
          ctx.save(); ctx.globalAlpha = k2 * (0.75 + 0.25 * Math.sin(t * 4 + c));
          roundRect(ctx, x - 50 * row.s, row.y - 190 * row.s, 100 * row.s, 120 * row.s, 16 * row.s);
          ctx.setLineDash([10, 8]); ctx.lineWidth = 4; ctx.strokeStyle = RED; ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = rgba(RED, 0.12); ctx.fill();
          ctx.restore();
        }
      }
    }
  });
  // walkers in the aisle (in front of the row ends)
  aisle.sort((a, b) => a.p.y - b.p.y).forEach(({ p, seed, style, T: TT }) => {
    ctx.save(); ctx.globalAlpha = 1 - p.out;
    K.drawPerson(ctx, p.x, p.y, p.s, { t, walk: TT + seed * 0.3, mood: 'neutral', look: 0.6, seed, ...style });
    backpack(ctx, H, p.x, p.y, p.s, 1);
    ctx.restore();
  });
  ctx.restore(); // camera
}

// a small backpack on one shoulder (drawn over the person, at its right side)
function backpack(ctx, H, x, y, s, k) {
  if (k <= 0) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= Math.min(1, k * 1.5);
  H.roundRect(ctx, 26, -176, 34, 58, 12); ctx.fillStyle = '#c94f6d'; ctx.fill();
  H.roundRect(ctx, 31, -150, 24, 18, 6); ctx.fillStyle = '#a63f5a'; ctx.fill();
  ctx.fillStyle = '#7d2f44'; ctx.fillRect(18, -180, 10, 6);
  ctx.restore();
}
