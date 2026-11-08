// Scene "license-desk" (full frame, 1 beat ~10-12 s). A government licensing office: a cartoon official at a desk with
// a name pill for the agency (text only, no seal); a big licence sheet slides onto the desk with the company name, its
// city and the job it is cleared for; an APPROVED stamp lands; then the sheet slides left, a server rack rolls in and
// chip tiles fly from the sheet into the rack, which lights up. An attribution pill sits on top.
// Fits: export licences, permits, "agency approved company X to do Y", licensing / vetting stories.
// params: by ("According to The New York Times"), agency ("US Commerce Dept."), title ("EXPORT LICENSE"),
//         company ("New Matrix"), place ("Beijing"), job ("Build H200 chips into servers"), stamp ("APPROVED"),
//         chip ("H200"); cues: byCue ("times"), agencyCue ("commerce"), stampCue ("approved"), companyCue ("matrix"),
//         jobCue ("h200"), rackCue ("servers")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, smooth, lerp, roundRect } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tBy = Math.max(0.1, at(P.byCue || 'times', D * 0.2) - 0.9);
  const tAgency = at(P.agencyCue || 'commerce', D * 0.35) - 0.3;
  const tSheet = Math.max(0.2, tAgency - 0.9);
  const tStamp = at(P.stampCue || 'approved', D * 0.42) - 0.15;
  const tCompany = at(P.companyCue || 'matrix', D * 0.58) - 0.5;
  const tJob = at(P.jobCue || 'h200', D * 0.72) - 0.6;
  const tRack = at(P.rackCue || 'servers', D * 0.88) - 1.3;
  const FLOOR = 1010;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 735 }, { t: tStamp, zoom: 1.03, x: 520, y: 740 }, { t: D, zoom: 1.04, x: 500, y: 740 }]);
  K.cameraShake(ctx, t, tStamp + 0.12, 0.3, 5);
  K.world.office(ctx, { t, time: 'day' });

  // official behind the desk (left)
  K.drawPerson(ctx, 215, FLOOR - 40, 1.3, { t, pose: t > tStamp - 0.3 && t < tStamp + 1.2 ? 'point' : 'stand', mood: 'neutral', talk: 0, skin: 1, hair: 4, shirt: '#3d4f7a', hairStyle: 'short', seed: 5, look: 0.8 });
  K.drawDesk(ctx, 330, FLOOR, 1.25);
  const ap = K.popIn(t, tAgency, 0.45);
  if (ap > 0) pill(ctx, H, 270, 545, ap, P.agency || 'US Commerce Dept.', { size: 28 });
  const bp = K.popIn(t, tBy, 0.45);
  if (bp > 0) pill(ctx, H, 487, 460, bp, P.by || 'According to The New York Times', { size: 28 });

  // the licence sheet: slides in from the right onto the desk, later slides left to make room for the rack
  const slideIn = smooth(clamp((t - tSheet) / 0.7));
  const shift = smooth(clamp((t - tRack) / 0.7));
  if (slideIn > 0) {
    const cx = lerp(1250, 560, slideIn) - 120 * shift, cy = 760, s = 1 - 0.18 * shift;
    const W = 400, HH = 330;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((1 - slideIn) * 0.15 - 0.03 * shift); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; roundRect(ctx, -W / 2 + 10, -HH / 2 + 14, W, HH, 14); ctx.fill();
    roundRect(ctx, -W / 2, -HH / 2, W, HH, 14); ctx.fillStyle = '#f5f1e6'; ctx.fill();
    ctx.fillStyle = '#2b3150'; roundRect(ctx, -W / 2, -HH / 2, W, 62, 14); ctx.fill(); ctx.fillRect(-W / 2, -HH / 2 + 40, W, 22);
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('display', 30); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(P.title || 'EXPORT LICENSE', 0, -HH / 2 + 32);
    const cp = clamp((t - tCompany) / 0.3), jp = clamp((t - tJob) / 0.3);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#6a6f85'; ctx.font = H.font('ui', 20); ctx.fillText('Company', -W / 2 + 28, -HH / 2 + 96);
    ctx.globalAlpha = 0.25 + 0.75 * cp;
    ctx.fillStyle = '#1b2033'; ctx.font = H.font('display', 34); ctx.fillText(P.company || 'New Matrix', -W / 2 + 28, -HH / 2 + 134);
    ctx.font = H.font('bold', 24); ctx.fillStyle = '#3a4058'; ctx.fillText(P.place || 'Beijing', -W / 2 + 28, -HH / 2 + 170);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#6a6f85'; ctx.font = H.font('ui', 20); ctx.fillText('Cleared to', -W / 2 + 28, -HH / 2 + 214);
    ctx.globalAlpha = 0.25 + 0.75 * jp;
    const jf = H.fitText(ctx, P.job || 'Build H200 chips into servers', 'bold', 28, 18, W - 56);
    ctx.fillStyle = '#1b2033'; ctx.font = jf.font; ctx.fillText(jf.text, -W / 2 + 28, -HH / 2 + 250);
    ctx.globalAlpha = 1;
    ctx.restore();
    // stamp on the sheet
    K.drawStamp(ctx, cx + 115 * s, cy + 40 * s, 0.6 * s, { kind: 'check', text: P.stamp || 'APPROVED', land: (t - tStamp) / 0.5 });
  }

  // server rack rolls in on the right; chip tiles fly in
  if (t > tRack) {
    const rx = lerp(1150, 760, smooth(clamp((t - tRack) / 0.8)));
    const act = clamp((t - tRack - 1.1) / 1.2);
    K.drawServerRack(ctx, rx, FLOOR, 1.25, { t, activity: 0.15 + 0.85 * act });
    for (let i = 0; i < 3; i++) {
      const u = smooth(clamp((t - tRack - 0.7 - i * 0.25) / 0.6));
      if (u <= 0 || u >= 1) continue;
      const x0 = 440, y0 = 760, x1 = rx, y1 = FLOOR - 220 + i * 60;
      const x = lerp(x0, x1, u), y = lerp(y0, y1, u) - Math.sin(u * Math.PI) * 120;
      chip(ctx, H, x, y, 0.8, ACC, P.chip || 'H200');
    }
    if (act > 0) K.glow(ctx, rx, FLOOR - 140, 160, ACC, 0.25 * act);
  }
  ctx.restore();
}

function chip(ctx, H, x, y, s, ACC, label) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.strokeStyle = '#c8a24a'; ctx.lineWidth = 4;
  for (let i = 0; i < 4; i++) { const o = -27 + i * 18; ctx.beginPath(); ctx.moveTo(o, -48); ctx.lineTo(o, -38); ctx.moveTo(o, 38); ctx.lineTo(o, 48); ctx.moveTo(-48, o); ctx.lineTo(-38, o); ctx.moveTo(38, o); ctx.lineTo(48, o); ctx.stroke(); }
  H.roundRect(ctx, -40, -40, 80, 80, 10); ctx.fillStyle = '#1b2033'; ctx.fill();
  H.roundRect(ctx, -26, -26, 52, 52, 6); ctx.fillStyle = ACC; ctx.fill();
  ctx.fillStyle = '#1b2033'; ctx.font = H.font('display', 16); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, 1);
  ctx.restore();
}

function pill(ctx, H, x, y, pop, text, o = {}) {
  const size = o.size || 30;
  ctx.save(); ctx.font = H.font('bold', size);
  const tw = ctx.measureText(text).width, w = tw + size * 1.4, h = size * 1.8;
  const cx = Math.max(130 + w / 2, Math.min(845 - w / 2, x));
  const k = Math.min(1.04, pop);
  ctx.translate(cx, y); ctx.scale(k, k);
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2);
  ctx.fillStyle = o.accent ? H.kit.ACCENT.base : 'rgba(10,12,22,0.9)'; ctx.fill();
  if (!o.accent) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.22)'; ctx.stroke(); }
  ctx.fillStyle = o.accent ? H.kit.ACCENT.deep : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 2);
  ctx.restore();
}
