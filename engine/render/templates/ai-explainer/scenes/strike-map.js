// Scene "strike-map" (full frame). A stylised night map (abstract land, faint roads, a reference city dot, no real
// borders): small data-center buildings at named sites. A top pill slot shows an intro line, then a date that
// changes. At each site's cue a tiny distant drone silhouette glides in, the site flashes, a small roof fire flickers
// with smoke, the building's lights go dark and a status note pops under it. Non-graphic; no people.
// Fits: outages / attacks / shutdowns at several facilities over days, "three sites in four days", rolling blackouts.
// params (all optional; default: three unnamed sites "Site A/B/C" hit at 30/50/70 %, no top pill):
//         sites   [{ name, x, y, note, cue, noteCue, hit (already down at t=0), fire (bool, default true), drone (bool) }]
//         (idle: true = never hit in this scene)
//         ref     { name, x, y } reference city dot (optional)
//         slots   [{ text, cue, accent }] top pill texts in order (each replaces the previous at its cue)
//         appearAt  scene time the sites + roads appear (default 0; e.g. 3.1 to wait for the hook title to dock)
//         zoom    end zoom of the slow push-in (default 1.04)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth } = H;
  const D = info.duration;
  const at = (w, d, nth) => { const v = w ? info.timeOf(w, nth || 0) : null; return v == null ? d : v; };
  const sites = (P.sites || [
    { name: 'Site A', x: 760, y: 690, cue: null }, { name: 'Site B', x: 230, y: 830 }, { name: 'Site C', x: 700, y: 960 },
  ]).map((s, i) => Object.assign({}, s, { tHit: s.hit ? -99 : s.idle ? 1e9 : at(s.cue, D * (0.3 + 0.2 * i), s.nth), tNote: s.hit ? -99 : at(s.noteCue, null) }));
  sites.forEach((s) => { if (s.tNote == null) s.tNote = s.tHit + 0.9; });

  // ---- background: night land
  const g = ctx.createLinearGradient(0, 0, 0, 1920); g.addColorStop(0, '#070b1e'); g.addColorStop(0.45, '#0f1838'); g.addColorStop(1, '#05070f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
  const z = lerp(1, P.zoom || 1.04, K.phase(t, 0, D));
  let shakeAmp = 0, shakeStart = -9;
  sites.forEach((s) => { if (t >= s.tHit && t < s.tHit + 0.5) { shakeStart = s.tHit; shakeAmp = 7; } });
  ctx.save(); ctx.translate(487, 760); ctx.scale(z, z); ctx.translate(-487, -760);
  if (shakeAmp) K.cameraShake(ctx, t, shakeStart, 0.45, shakeAmp);
  // land blob
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2, r = 1 + 0.07 * Math.sin(a * 3 + 1.2) + 0.05 * Math.sin(a * 7 + 0.4);
    const x = 487 + Math.cos(a) * 520 * r, y = 790 + Math.sin(a) * 420 * r;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath(); ctx.fillStyle = '#18234a'; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(160,190,255,0.12)'; ctx.stroke();
  // grid
  ctx.strokeStyle = 'rgba(160,190,255,0.06)'; ctx.lineWidth = 2;
  for (let x = 0; x <= 1080; x += 90) { ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x, 1300); ctx.stroke(); }
  for (let y = 300; y <= 1300; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1080, y); ctx.stroke(); }
  // faint forest/field patches
  for (let i = 0; i < 14; i++) {
    const px = 120 + H.hash(i, 3) * 760, py = 480 + H.hash(i, 4) * 560;
    ctx.globalAlpha = 0.35; ctx.beginPath(); ctx.ellipse(px, py, 40 + 40 * H.hash(i, 5), 18 + 14 * H.hash(i, 6), 0, 0, Math.PI * 2);
    ctx.fillStyle = '#1f2d5a'; ctx.fill(); ctx.globalAlpha = 1;
  }
  // roads from the reference city to each site
  const ref = P.ref, APP = P.appearAt || 0;
  if (ref) {
    ctx.save(); ctx.globalAlpha = smooth((t - APP) / 0.6); ctx.setLineDash([3, 16]); ctx.lineCap = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(200,215,255,0.22)';
    sites.forEach((s) => { ctx.beginPath(); ctx.moveTo(ref.x, ref.y); ctx.quadraticCurveTo((ref.x + s.x) / 2 + 30, (ref.y + s.y) / 2 - 40, s.x, s.y - 30); ctx.stroke(); });
    ctx.restore();
    K.glow(ctx, ref.x, ref.y, 60, '#ffffff', 0.25);
    ctx.beginPath(); ctx.arc(ref.x, ref.y, 10, 0, Math.PI * 2); ctx.fillStyle = '#dfe4f1'; ctx.fill();
    ctx.font = K.font.ui(26); ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(223,228,241,0.75)'; ctx.fillText(ref.name, ref.x, ref.y + 44);
  }

  // ---- sites
  sites.forEach((s, i) => {
    const age = t - s.tHit, hitDone = age >= 0;
    const pop = Math.min(1, K.popIn(t, APP + 0.15 + i * 0.18, 0.45));
    if (pop <= 0) return;
    const sc = 0.62 * pop;
    // drone silhouette gliding in from above over the 1.3 s before the hit
    if (s.drone !== false && age > -1.3 && age < 0) {
      const u = (age + 1.3) / 1.3, sx = lerp(s.x + 260, s.x + 10, smooth(u)), sy = lerp(s.y - 520, s.y - 110, smooth(u));
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(0.35); ctx.globalAlpha = 0.9 * clamp(u / 0.2);
      ctx.fillStyle = '#8f98b8'; ctx.strokeStyle = '#8f98b8'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-18, -12); ctx.lineTo(18, 12); ctx.moveTo(18, -12); ctx.lineTo(-18, 12); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
      for (const [dx, dy] of [[-18, -12], [18, 12], [18, -12], [-18, 12]]) { ctx.beginPath(); ctx.ellipse(dx, dy, 9, 3, 0, 0, Math.PI * 2); ctx.fillStyle = 'rgba(200,215,255,0.35)'; ctx.fill(); }
      if (Math.floor(t * 6) % 2 === 0) K.glow(ctx, 0, 0, 16, '#ff6b5e', 0.9);
      ctx.restore();
    }
    const act = hitDone ? 0 : 0.75;
    K.drawDataCenter(ctx, s.x, s.y, sc, { t: t + i, activity: act });
    if (hitDone) {
      // building lights out: dark overlay over the body
      ctx.save(); ctx.globalAlpha = 0.55 * smooth((age - 0.2) / 0.8); H.roundRect(ctx, s.x - 165 * sc, s.y - 186 * sc, 330 * sc, 186 * sc, 10); ctx.fillStyle = '#04060f'; ctx.fill(); ctx.restore();
      // flash
      if (age < 0.6) { K.glow(ctx, s.x, s.y - 60, 260, '#ffb347', 0.9 * (1 - age / 0.6)); K.glow(ctx, s.x, s.y - 60, 120, '#ffffff', 0.7 * (1 - age / 0.6)); }
      // small roof fire + smoke (fades to a smoulder for already-down sites)
      if (s.fire !== false) {
        const heat = s.hit ? 0.35 : clamp(1 - Math.max(0, age - 4) / 6, 0.35, 1);
        for (let k = 0; k < 6; k++) {
          const ph = ((t * 0.45 + k / 6) % 1), px = s.x - 50 + k * 22 + 14 * Math.sin(t + k), py = s.y - 120 - ph * 170;
          ctx.globalAlpha = 0.45 * Math.sin(ph * Math.PI) * clamp(age / 0.5);
          ctx.beginPath(); ctx.arc(px, py, 18 + ph * 34, 0, Math.PI * 2); ctx.fillStyle = '#5b6276'; ctx.fill();
        }
        ctx.globalAlpha = 1;
        for (let k = 0; k < 4; k++) {
          const fx = s.x - 54 + k * 34, fl = (26 + 14 * Math.sin(t * 11 + k * 1.7)) * heat * clamp(age / 0.3);
          if (fl <= 1) continue;
          K.glow(ctx, fx, s.y - 115, 50 * heat, '#ff9a3c', 0.5 * heat);
          ctx.beginPath(); ctx.moveTo(fx - 12, s.y - 108); ctx.quadraticCurveTo(fx - 10, s.y - 108 - fl, fx, s.y - 112 - fl * 1.5); ctx.quadraticCurveTo(fx + 10, s.y - 108 - fl, fx + 12, s.y - 108); ctx.closePath();
          ctx.fillStyle = '#ff9a3c'; ctx.fill();
          ctx.beginPath(); ctx.moveTo(fx - 6, s.y - 108); ctx.quadraticCurveTo(fx - 5, s.y - 108 - fl * 0.5, fx, s.y - 110 - fl * 0.8); ctx.quadraticCurveTo(fx + 5, s.y - 108 - fl * 0.5, fx + 6, s.y - 108); ctx.closePath();
          ctx.fillStyle = '#ffd36b'; ctx.fill();
        }
      }
    }
    // name pill above, status note below
    K.drawLabel(ctx, s.x, s.y - 128, pop, { text: s.name, size: 28, dot: !hitDone, accent: false });
    const np = K.popIn(t, s.tNote, 0.4);
    if (s.note && (s.hit || np > 0)) K.drawLabel(ctx, s.x, s.y + 62, s.hit ? 1 : Math.min(1.06, np), { text: s.note, size: 26, accent: true });
  });
  ctx.restore();

  // ---- top pill slot (outside the camera so it stays put)
  const slots = (P.slots || []).map((s, i) => ({ ...s, t: at(s.cue, i === 0 ? 0.3 : D * 0.4 * i) }));
  let cur = -1; slots.forEach((s, i) => { if (t >= s.t) cur = i; });
  if (cur >= 0) {
    const s = slots[cur], next = slots[cur + 1];
    let k = Math.min(1.06, K.popIn(t, s.t, 0.45));
    if (next) k *= 1 - smooth((t - (next.t - 0.25)) / 0.25);
    if (k > 0) K.drawLabel(ctx, 487, 500, k, { text: s.text, size: s.size || 34, accent: !!s.accent, dot: !s.accent });
  }
}
