// Scene "major-doors" (full frame). A campus corridor at dusk with 2-3 classroom doors, each under a name plate.
// Cartoon students with backpacks stream in from the left and turn into the doors; a `dim` door's light flickers
// low and only a rare student goes in, the others glow and most students choose them. Chips pop over doors on
// their cues (e.g. "+6%"); a top panel shows a headline figure (`two` + `twoValue`) on `twoCue`; a `row` pill
// with a double down-arrow hangs over the dim door on `rowCue`. Ends settled (stream keeps walking, chips still).
// params: doors [{label, dim?, chip?, cue?}] (2-3), two (panel title), twoValue (e.g. "-20.5%": counts up, keeps its decimals), twoCue (30%), row, rowCue (5%),
//         every (s between students, 0.85)
// Fits: students / customers / users choosing between options; one option losing people while others grow.
// Door cues default to 55% / 70% / 85%. Students walk past the dim door; they are not shown switching: say what the
// data says.
// Cues are narration words ("word#n" = the (n+1)th time spoken in the scene) or a number of seconds.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, roundRect, rgba } = H;
  const at = (w, d) => { if (typeof w === 'number') return w; const [word, n] = String(w || '').split('#'); const v = word ? info.timeOf(word, n ? +n : 0) : null; return v == null ? d : v; };
  const RED = '#ff5a6e';
  const doors = (P.doors || [{ label: 'A', dim: true }, { label: 'B' }, { label: 'C' }]).slice(0, 3);
  const n = doors.length;
  const xs = n === 3 ? [240, 487, 734] : [300, 680];
  const FY = 1040, DW = 150, DH = 270;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.03, x: 420, y: 760 }, { t: D, zoom: 1.0, x: 487, y: 740 }]);
  // corridor
  const g = ctx.createLinearGradient(0, 0, 0, 1920);
  g.addColorStop(0, '#2c3158'); g.addColorStop(0.5, '#343a66'); g.addColorStop(1, '#161a33');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  ctx.fillStyle = '#283058'; ctx.fillRect(0, 880, 1080, 160);            // wainscot
  ctx.fillStyle = '#3d4577'; ctx.fillRect(0, 874, 1080, 8);
  ctx.fillStyle = '#1d2140'; ctx.fillRect(0, FY - 4, 1080, 900);           // floor
  for (let i = 0; i < 12; i++) { ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fillRect(i * 100 - ((t * 0) % 100), FY + 20, 60, 6); }
  // windows high on the wall between doors (dusk sky)
  for (let i = 0; i < n + 1; i++) {
    const wx = (i === 0 ? xs[0] - 160 : i === n ? xs[n - 1] + 160 : (xs[i - 1] + xs[i]) / 2);
    if (i > 0 && i < n) continue;              // only at the far ends (keep the space over the doors clear)
    if (wx < 20 || wx > 1060) continue;
    roundRect(ctx, wx - 44, 600, 88, 120, 8); ctx.fillStyle = '#1a1f3d'; ctx.fill();
    const sg = ctx.createLinearGradient(0, 606, 0, 714); sg.addColorStop(0, '#6a5a9a'); sg.addColorStop(1, '#e89a7a');
    roundRect(ctx, wx - 38, 606, 76, 108, 6); ctx.fillStyle = sg; ctx.fill();
  }

  // ---- doors
  const doorState = doors.map((d, i) => {
    const x = xs[i];
    const flick = d.dim ? 0.25 + 0.12 * Math.max(0, Math.sin(t * 13) * Math.sin(t * 3.1)) : 0.95;
    H.glow(ctx, x, FY - DH / 2, 200, d.dim ? '#8a93a8' : ACC, d.dim ? 0.06 : 0.18 + 0.04 * Math.sin(t * 2 + i));
    roundRect(ctx, x - DW / 2 - 14, FY - DH - 14, DW + 28, DH + 14, 12); ctx.fillStyle = '#151933'; ctx.fill();
    const dg = ctx.createLinearGradient(0, FY - DH, 0, FY);
    const lit = d.dim ? '#6b7290' : ACC;
    dg.addColorStop(0, rgba(lit, flick)); dg.addColorStop(1, rgba(lit, flick * 0.45));
    roundRect(ctx, x - DW / 2, FY - DH, DW, DH, 8); ctx.fillStyle = dg; ctx.fill();
    // name plate
    ctx.save(); ctx.font = H.font('ui', 24);
    const f = H.fitText(ctx, String(d.label), 'ui', 24, 16, 230);
    ctx.font = f.font; const w = ctx.measureText(f.text).width + 34;
    roundRect(ctx, x - w / 2, FY - DH - 70, w, 44, 10); ctx.fillStyle = d.dim ? '#2a2f45' : '#0d1020'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = d.dim ? 'rgba(255,255,255,0.18)' : rgba(ACC, 0.8); ctx.stroke();
    ctx.fillStyle = d.dim ? '#aab1c8' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(f.text, x, FY - DH - 47);
    ctx.restore();
    return { x, dim: !!d.dim };
  });

  // ---- students: spawn at the left, walk right, turn into their door
  const every = P.every || 0.85, speed = 230, x0 = -70;
  const live = doorState.map((d, i) => i).filter((i) => !doorState[i].dim);
  const dimIdx = doorState.findIndex((d) => d.dim);
  const pick = (i) => {
    if (dimIdx >= 0 && ((i % 9) + 9) % 9 === 4) return dimIdx;      // a rare one still goes in
    return live.length ? live[((i % live.length) + live.length) % live.length] : 0;
  };
  const shirts = ['#6f86e0', '#e8786a', '#a08be0', '#e0a84f', '#5fa8d8', '#4fb3a6'];
  const iMin = Math.floor((t - 8) / every), iMax = Math.floor(t / every) + 6;
  const list = [];
  for (let i = iMin; i <= iMax; i++) {
    const spawn = i * every - 4;                          // students already on screen at t = 0
    const age = t - spawn; if (age < 0) continue;
    const di = pick(i), tx = doorState[di].x;
    const tArrive = (tx - x0) / speed;
    let x, fade = 0, lift = 0;
    if (age < tArrive) x = x0 + age * speed;
    else { x = tx; const k = clamp((age - tArrive) / 0.55); fade = k; lift = k * 26; if (k >= 1) continue; }
    list.push({ i, x, y: FY - lift, fade, walking: age < tArrive, age });
  }
  list.sort((a, b) => a.fade - b.fade);
  for (const s of list) {
    ctx.save(); ctx.globalAlpha = 1 - s.fade;
    const sc = 1.02 - s.fade * 0.08;
    K.drawPerson(ctx, s.x, s.y, sc, { t, walk: s.walking ? s.age + s.i * 0.37 : undefined, mood: 'happy', seed: s.i,
      shirt: shirts[((s.i % 6) + 6) % 6], skin: ((s.i * 3) % 5 + 5) % 5, hair: ((s.i * 2) % 5 + 5) % 5,
      hairStyle: ['short', 'long', 'curly', 'bun', 'short', 'none'][((s.i % 6) + 6) % 6], look: s.walking ? 0.7 : 0 });
    ctx.save(); ctx.translate(s.x, s.y); ctx.scale(sc, sc);
    roundRect(ctx, -60, -176, 34, 58, 12); ctx.fillStyle = '#c94f6d'; ctx.fill();
    roundRect(ctx, -55, -150, 24, 18, 6); ctx.fillStyle = '#a63f5a'; ctx.fill();
    ctx.restore();
    ctx.restore();
  }

  // ---- chips over the doors
  doors.forEach((d, i) => {
    if (!d.chip) return;
    const tc = at(d.cue, D * (0.55 + 0.15 * i)) - 0.15;
    const p = K.popIn(t, tc, 0.45); if (p <= 0) return;
    const x = xs[i], y = FY - DH - 96;
    ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.05, p), Math.min(1.05, p));
    roundRect(ctx, -92, -62, 184, 62, 18); ctx.fillStyle = ACC; ctx.fill();
    ctx.font = H.font('display', 40); ctx.fillStyle = '#141829'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(d.chip), 0, -29);
    ctx.restore();
  });
  // ---- "row" pill over the dim door
  if (P.row && dimIdx >= 0) {
    const p = K.popIn(t, at(P.rowCue, D * 0.05) - 0.1, 0.45);
    if (p > 0) {
      const x = Math.max(xs[dimIdx], 90 + w0(ctx, H, P.row) / 2), y = FY - DH - 96;
      ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.05, p), Math.min(1.05, p));
      ctx.font = H.font('ui', 24); const w = ctx.measureText(String(P.row)).width + 84;
      roundRect(ctx, -w / 2, -62, w, 62, 18); ctx.fillStyle = RED; ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(String(P.row), -w / 2 + 64, -30);
      for (let k = 0; k < 2; k++) { const ax = -w / 2 + 22 + k * 16; ctx.beginPath(); ctx.moveTo(ax - 8, -42); ctx.lineTo(ax + 8, -42); ctx.lineTo(ax, -20); ctx.closePath(); ctx.fill(); }
      ctx.restore();
    }
  }
  // ---- top panel: headline figure
  if (P.two) {
    const tp = at(P.twoCue, D * 0.3) - 0.2;
    const p = K.popIn(t, tp, 0.5);
    if (p > 0) {
      const cx = 487, y0 = 450;
      ctx.save(); ctx.translate(cx, y0); ctx.scale(Math.min(1.03, p), Math.min(1.03, p)); ctx.translate(-cx, -y0);
      roundRect(ctx, 90, y0, 795, 120, 24); ctx.fillStyle = 'rgba(10,12,24,0.92)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = rgba(RED, 0.7); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const f = H.fitText(ctx, String(P.two), 'bold', 32, 22, 470); ctx.font = f.font; ctx.fillText(f.text, 124, y0 + 60);
      const tv = String(P.twoValue || ''), m = tv.match(/-?\d+(\.\d+)?/);
      const k = K.phase(t, tp + 0.2, tp + 1.2, H.easeOutCubic);
      let shown = tv;
      if (m) { const v = parseFloat(m[0]) * k, dec = (m[1] || '').length - 1; shown = tv.replace(m[0], (v < 0 ? '-' : '') + Math.abs(v).toFixed(Math.max(0, dec))); }
      ctx.font = H.font('display', 64); ctx.fillStyle = RED; ctx.textAlign = 'right'; ctx.fillText(shown, 855, y0 + 64);
      ctx.restore();
    }
  }
  ctx.restore();
}

function w0(ctx, H, txt) { ctx.save(); ctx.font = H.font('ui', 24); const w = ctx.measureText(String(txt)).width + 84; ctx.restore(); return w; }
