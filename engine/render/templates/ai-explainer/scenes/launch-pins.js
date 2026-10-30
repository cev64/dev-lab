// Scene "launch-pins" (full frame). A quiet, limited app launch on an abstract night map (stylised sea + made-up
// land blobs, no real borders, no logos: company / app / store names are plain text).
// modes:
//   launch   - an app card (who pill, big app name, kind) drops in with a "shh" finger-to-lips tag ("quietly"), platform
//              chips pop on platCue, then map pins drop one per country on their cues with name flags, a date pill on
//              dateCue. Ends settled (pins pulse).
//   question - two store "privacy label" cards slide up with a few rows; the row (e.g. "Photos") lights in the accent
//              with a "may be collected" tag on photoCue; on replyCue the cards shrink away and the map zooms out: the
//              three lit pins in a dark world, a "No reply" pill with an empty speech bubble, then a big pulsing "?"
//              over the rest of the world with a "Wider launch?" pill on widerCue. Ends settled.
// Fits: limited/regional launches ("only in 3 countries"), "what does the label say", "will it come here?".
// params: mode, app, who, kind, date, platforms [2], pins [{name, cue}] (max 4), labels [2], row, rowNote, noReply,
//   wider, cues: appCue, platCue, dateCue, labelCue, photoCue, replyCue, widerCue
// pin spots on the made-up map (stage coords at zoom 1): north, centre-south, south-east
const SPOTS = [[395, 690], [470, 850], [640, 935], [740, 760]];

function land(ctx, H, rest) {
  // a made-up peninsula + islands; `rest` = extra dark continents (question mode, zoomed out)
  const blob = (pts, col) => {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i <= pts.length; i++) {
      const a = pts[i - 1], b = pts[i % pts.length];
      ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
    ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  };
  const c = '#2f6a63', cs = '#255650';
  if (rest) {
    const d = '#232a4a';
    blob([[-300, 300], [200, 260], [330, 420], [300, 600], [180, 640], [60, 560], [-300, 640]], d);
    blob([[700, 230], [1300, 200], [1360, 640], [1080, 700], [900, 600], [780, 420]], d);
    blob([[880, 1020], [1180, 980], [1300, 1200], [1000, 1280], [860, 1160]], d);
    blob([[-300, 1050], [140, 1080], [180, 1300], [-300, 1350]], d);
  }
  blob([[250, 520], [520, 500], [560, 600], [480, 700], [430, 780], [480, 860], [450, 880], [380, 760], [330, 640]], c);
  blob([[330, 560], [520, 540], [500, 620], [400, 620]], cs);
  blob([[560, 900], [700, 890], [780, 950], [690, 975], [580, 960]], c);
  blob([[720, 980], [860, 990], [880, 1020], [760, 1025]], cs);
  blob([[620, 760], [740, 730], [780, 820], [700, 860], [640, 830]], c);
}

function pin(ctx, x, y, p, col, deep) {
  if (p <= 0) return;
  const drop = (1 - Math.min(1, p)) * -120;
  ctx.save(); ctx.translate(x, y + drop); ctx.scale(Math.min(1.1, p), Math.min(1.1, p));
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-30, -40, -30, -78, 0, -78); ctx.bezierCurveTo(30, -78, 30, -40, 0, 0);
  ctx.fillStyle = col; ctx.fill();
  ctx.beginPath(); ctx.arc(0, -52, 11, 0, 7); ctx.fillStyle = deep; ctx.fill();
  ctx.restore();
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, easeInOutCubic, roundRect } = H;
  const at = (w, d) => { if (!w) return d; const v = info.timeOf(w); return v == null ? d : v; };
  const mode = P.mode === 'question' ? 'question' : 'launch';
  const pins = (P.pins || [{ name: 'Country A' }, { name: 'Country B' }, { name: 'Country C' }]).slice(0, 4);

  // ---------------- background: night sea with a soft grid
  ctx.save();
  const q = mode === 'question';
  const tReply = q ? at(P.replyCue, D * 0.5) - 0.3 : 99;
  const zoomOut = q ? H.phase(t, tReply, tReply + 0.9, easeInOutCubic) : 0;
  const sea = ctx.createLinearGradient(0, 300, 0, 1200); sea.addColorStop(0, '#16224a'); sea.addColorStop(1, '#0f1736');
  ctx.fillStyle = sea; ctx.fillRect(0, 0, 1080, 1920);

  // map layer (camera): launch pushes in slowly; question starts hidden behind the cards then zooms out
  ctx.save();
  const mz = q ? lerp(1.0, 0.72, zoomOut) : lerp(1.04, 1.0, smooth(t / D));
  ctx.translate(540, 760); ctx.scale(mz, mz); ctx.translate(-540, -760);
  if (!q) ctx.translate(0, 60);
  ctx.strokeStyle = 'rgba(120,150,230,0.10)'; ctx.lineWidth = 2;
  for (let x = -400; x <= 1500; x += 90) { ctx.beginPath(); ctx.moveTo(x, -200); ctx.lineTo(x, 2100); ctx.stroke(); }
  for (let y = -200; y <= 2100; y += 90) { ctx.beginPath(); ctx.moveTo(-400, y); ctx.lineTo(1500, y); ctx.stroke(); }
  // sea waves
  ctx.strokeStyle = 'rgba(160,190,255,0.16)'; ctx.lineWidth = 3;
  for (let i = 0; i < 7; i++) {
    const wx = 120 + ((i * 173) % 760), wy = 600 + ((i * 97) % 420), o = Math.sin(t * 1.5 + i) * 6;
    ctx.beginPath(); ctx.moveTo(wx - 24 + o, wy); ctx.quadraticCurveTo(wx - 12 + o, wy - 8, wx + o, wy); ctx.quadraticCurveTo(wx + 12 + o, wy + 8, wx + 24 + o, wy); ctx.stroke();
  }
  land(ctx, H, q);
  // big "?" over the rest of the world (question)
  const tWider = q ? at(P.widerCue, D * 0.85) - 0.3 : 99;
  const wq = K.popIn(t, tWider, 0.5);
  // pins
  pins.forEach((p, i) => {
    const [x, y] = SPOTS[i];
    const tp = q ? -1 : at(p.cue, D * (0.3 + i * 0.12)) - 0.25;
    const pp = q ? 1 : K.popIn(t, tp, 0.5);
    if (pp <= 0) return;
    const pulse = (t - tp) % 1.6;
    if (t > tp + 0.4) { ctx.strokeStyle = ACC; ctx.globalAlpha = 0.6 * (1 - pulse / 1.6); ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(x, y, 20 + 50 * pulse / 1.6, 8 + 18 * pulse / 1.6, 0, 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
    K.glow(ctx, x, y - 50, 90, ACC, 0.25);
    pin(ctx, x, y, pp, ACC, K.ACCENT.deep);
    // name flag
    const fp = q ? 1 : K.popIn(t, tp + 0.15, 0.4);
    if (fp > 0) {
      const right = true;
      ctx.save(); ctx.font = H.font('ui', 30); const w = ctx.measureText(p.name).width + 36;
      const fx = right ? x + 34 : x - 34 - w, fy = y - 96;
      ctx.translate(fx + (right ? 0 : w), fy + 24); ctx.scale(fp, fp); ctx.translate(-(fx + (right ? 0 : w)), -(fy + 24));
      ctx.fillStyle = 'rgba(10,12,22,0.88)'; roundRect(ctx, fx, fy, w, 48, 24); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(p.name, fx + 18, fy + 25);
      ctx.restore();
    }
  });
  if (wq > 0) {
    // the dark rest of the world gets question marks
    [[60, 420, 1.0], [1010, 430, 1.1], [1060, 1120, 0.8], [-20, 1180, 0.8]].forEach(([x, y, s], i) => {
      const k = K.popIn(t, tWider + 0.1 + i * 0.12, 0.45); if (k <= 0) return;
      ctx.save(); ctx.translate(x, y + K.bob(t, 6, 0.4, i * 0.3)); ctx.scale(k * s, k * s);
      ctx.font = H.font('display', 120); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 0);
      ctx.restore();
    });
  }
  ctx.restore(); // map layer
  if (q) { ctx.fillStyle = `rgba(10,14,34,${0.88 * (1 - zoomOut)})`; ctx.fillRect(0, 0, 1080, 1920); }

  if (mode === 'launch') {
    // app card at the top
    const tApp = at(P.appCue, D * 0.18) - 0.6;
    const cp = K.popIn(t, Math.max(0.05, tApp), 0.5);
    if (cp > 0) {
      const X0 = 90, Y0 = 440, W = 500, Hh = 196;
      ctx.save(); ctx.translate(X0 + W / 2, Y0 + Hh / 2); ctx.scale(cp, cp); ctx.translate(-(X0 + W / 2), -(Y0 + Hh / 2));
      ctx.fillStyle = '#f4f6fb'; roundRect(ctx, X0, Y0, W, Hh, 28); ctx.fill();
      // app icon: a hanger in an accent tile
      ctx.fillStyle = ACC; roundRect(ctx, X0 + 26, Y0 + 30, 96, 96, 24); ctx.fill();
      ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.arc(X0 + 74, Y0 + 58, 9, Math.PI, Math.PI * 2.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(X0 + 74, Y0 + 68); ctx.lineTo(X0 + 42, Y0 + 104); ctx.lineTo(X0 + 106, Y0 + 104); ctx.closePath(); ctx.stroke();
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.font = H.font('ui', 24); ctx.fillStyle = '#5a6488'; ctx.fillText(String(P.who || 'Company').toUpperCase(), X0 + 146, Y0 + 50);
      const ns = H.fitText(ctx, P.app || 'New app', 'display', 52, 30, W - 170).size;
      ctx.font = H.font('display', ns); ctx.fillStyle = '#141829'; ctx.fillText(P.app || 'New app', X0 + 146, Y0 + 98);
      ctx.font = H.font('body', 26); ctx.fillStyle = '#3b4672'; ctx.fillText(P.kind || 'AI app', X0 + 146, Y0 + 146);
      ctx.restore();
      // "quietly" tag: a small shh glyph
      const sp = K.popIn(t, Math.max(0.3, tApp + 0.5), 0.4);
      if (sp > 0) K.drawLabel(ctx, X0 + 120, Y0 + Hh + 4 + 40, sp, { text: 'Quiet launch', size: 24, dot: true });
    }
    // platform chips (right of the card)
    const tPlat = at(P.platCue, D * 0.35) - 0.2;
    (P.platforms || ['iPhone', 'Android']).slice(0, 2).forEach((txt, i) => {
      const k = K.popIn(t, tPlat + i * 0.35, 0.4); if (k <= 0) return;
      const x = 760, y = 470 + i * 90;
      ctx.save(); ctx.translate(x, y); ctx.scale(k, k);
      ctx.fillStyle = '#20243a'; roundRect(ctx, -130, -34, 260, 68, 20); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2; roundRect(ctx, -130, -34, 260, 68, 20); ctx.stroke();
      // tiny phone glyph
      ctx.fillStyle = ACC; roundRect(ctx, -108, -22, 26, 44, 6); ctx.fill(); ctx.fillStyle = '#20243a'; roundRect(ctx, -104, -16, 18, 30, 3); ctx.fill();
      ctx.font = H.font('ui', 30); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(txt, -66, 2);
      ctx.restore();
    });
    // "only" bracket text when the pins are down
    const tDate = at(P.dateCue, D * 0.85) - 0.2;
    const dp = K.popIn(t, tDate, 0.45);
    if (dp > 0) K.drawLabel(ctx, 760, 662, dp, { text: P.date || 'Reported this week', size: 28, accent: true });
  } else {
    // ---------------- question mode: two store label cards, then the zoomed-out map
    const tLab = Math.max(0.1, at(P.labelCue, D * 0.2) - 0.8);
    const tPhoto = at(P.photoCue, D * 0.4) - 0.2;
    const out = zoomOut;
    const labels = (P.labels || ['Store A label', 'Store B label']).slice(0, 2);
    const rows = [P.row || 'Photos', 'Name', 'User IDs', 'Diagnostics'];
    labels.forEach((title, i) => {
      const k = K.popIn(t, tLab + i * 0.3, 0.5); if (k <= 0) return;
      const X0 = 100 + i * 400, Y0 = 450, W = 380, Hh = 470;
      ctx.save();
      ctx.globalAlpha = 1 - smooth(out * 1.3);
      ctx.translate(X0 + W / 2, Y0 + Hh / 2 - out * 220); ctx.scale(k * (1 - 0.5 * out), k * (1 - 0.5 * out)); ctx.translate(-(X0 + W / 2), -(Y0 + Hh / 2));
      ctx.fillStyle = '#f4f6fb'; roundRect(ctx, X0, Y0, W, Hh, 28); ctx.fill();
      ctx.fillStyle = '#3b4672'; ctx.font = H.font('ui', 26); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const ts = H.fitText(ctx, title, 'ui', 28, 20, W - 60).size; ctx.font = H.font('ui', ts); ctx.fillText(title, X0 + 30, Y0 + 48);
      ctx.fillStyle = '#d5dae8'; ctx.fillRect(X0 + 30, Y0 + 80, W - 60, 3);
      rows.forEach((r, j) => {
        const ry = Y0 + 130 + j * 82, hot = j === 0;
        const lit = hot ? smooth((t - tPhoto - i * 0.15) / 0.35) : 0;
        if (lit > 0) { ctx.fillStyle = ACC; ctx.globalAlpha *= 1; roundRect(ctx, X0 + 18, ry - 34, W - 36, 68, 18); ctx.save(); ctx.globalAlpha = (1 - smooth(out * 1.3)) * lit; ctx.fill(); ctx.restore(); }
        ctx.fillStyle = hot && lit > 0.5 ? K.ACCENT.deep : '#141829'; ctx.font = H.font(hot ? 'bold' : 'body', hot ? 34 : 28);
        ctx.fillText(r, X0 + 40, ry + 1);
        // little box glyph
        ctx.strokeStyle = hot && lit > 0.5 ? K.ACCENT.deep : '#8a93a8'; ctx.lineWidth = 3; roundRect(ctx, X0 + W - 76, ry - 16, 32, 32, 7); ctx.stroke();
        if (hot && lit > 0.5) { ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(X0 + W - 69, ry); ctx.lineTo(X0 + W - 62, ry + 8); ctx.lineTo(X0 + W - 50, ry - 9); ctx.stroke(); }
      });
      ctx.restore();
    });
    const np = K.popIn(t, tPhoto + 0.5, 0.45);
    if (np > 0 && out < 0.6) { ctx.save(); ctx.globalAlpha = 1 - smooth(out / 0.6); K.drawLabel(ctx, 487, 1010, np, { text: P.rowNote || 'may be collected', size: 30, accent: true }); ctx.restore(); }
    // after reply cue: app name pill top, "no reply" bubble
    if (out > 0) {
      const ap = K.popIn(t, tReply + 0.5, 0.45);
      if (ap > 0) K.drawLabel(ctx, 487, 470, ap, { text: P.app || 'App', size: 30, accent: true });
      const rp = K.popIn(t, tReply + 0.9, 0.45);
      if (rp > 0) {
        // empty speech bubble with dots + "No reply" pill
        ctx.save(); ctx.translate(250, 860); ctx.scale(rp, rp);
        ctx.fillStyle = '#f4f6fb'; roundRect(ctx, -90, -50, 180, 100, 40); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-30, 48); ctx.lineTo(-56, 86); ctx.lineTo(4, 48); ctx.closePath(); ctx.fill();
        for (let d = 0; d < 3; d++) { ctx.beginPath(); ctx.arc(-36 + d * 36, 0, 10, 0, 7); ctx.fillStyle = `rgba(59,70,114,${0.35 + 0.35 * (0.5 + 0.5 * Math.sin(t * 5 - d))})`; ctx.fill(); }
        ctx.restore();
        K.drawLabel(ctx, 250, 985, rp, { text: P.noReply || 'No reply', size: 26 });
      }
      if (wq > 0) {
        // big "?" over the far side + pill
        ctx.save(); ctx.translate(770, 600 + K.bob(t, 8, 0.35)); ctx.scale(wq, wq);
        K.glow(ctx, 0, 0, 170, ACC, 0.3 + 0.1 * Math.sin(t * 3));
        ctx.font = H.font('display', 190); ctx.fillStyle = ACC; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 8);
        ctx.restore();
        K.drawLabel(ctx, 770, 760, wq, { text: P.wider || 'Coming here?', size: 28 });
      }
    }
  }
  ctx.restore();
}
