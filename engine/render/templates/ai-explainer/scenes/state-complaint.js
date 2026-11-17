// Scene "state-complaint" (full frame, 1 beat). Generic courtroom (kit world, balance emblem, no real seal).
// A cartoon state lawyer (generic, never a real person) stands at a lectern on the left; a big complaint sheet pins
// itself over the bench with the case title; claim rows tick in with stamps on their cues ("Public nuisance",
// "Unfair competition"); then the sheet slides up and shrinks and a verbatim quote panel types in with its
// attribution as text. A robot (stand-in for the AI agents, text pill) waits on the right.
// Fits: "the state sues and alleges X and Y", "the complaint says ...", regulator lawsuits with a quote.
// params (all optional): head ("COMPLAINT"), title ("California v. OpenAI"), claims ([{text, cue}] max 3),
//        claimsTag ("Claims"), quote (verbatim), by ("California Attorney General"), botLabel ("AI agents"),
//        cues: nuisanceCue / unfairCue (used when `claims` is not given), quoteCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, roundRect, rgba } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const RED = '#ff5a52';
  const claims = (P.claims || [{ text: 'Public nuisance', cue: P.nuisanceCue }, { text: 'Unfair competition', cue: P.unfairCue }]).slice(0, 3);
  const tC = claims.map((c, i) => at(c.cue, 1 + i * 1.2) - 0.25);
  const tQ = Math.max(tC[tC.length - 1] + 1.2, at(P.quoteCue, D * 0.55) - 0.9);
  const quote = P.quote || 'The company knowingly tested a dangerous product without proper oversight or safety procedures';

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 487, y: 700 }, { t: tQ, zoom: 1.02, x: 487, y: 720 }, { t: D, zoom: 1.05, x: 487, y: 730 }]);
  const room = K.world.courtroom(ctx, { t });
  K.drawGavel(ctx, 800, room.bench.y + 4, 0.75, { hit: 1, shadow: false });

  // lawyer at the lectern (left) + robot (right)
  K.drawLectern(ctx, 215, 1040, 0.62);
  const talking = t > 0.3 && t < tQ + 0.6;
  K.drawPerson(ctx, 200, 1040, 1.2, { t, pose: talking && t < tQ ? 'point' : 'stand', mood: 'neutral', look: 0.7, skin: 1, hair: 0, shirt: '#2f3b6e', hairStyle: 'bun', seed: 12 });
  K.drawLectern(ctx, 215, 1040, 0.62, { shadow: false });
  K.drawRobot(ctx, 840, 1040, 0.95, { t, state: t > tQ ? 'thinking' : 'idle', flip: true, seed: 6 });
  K.drawLabel(ctx, 840, 790, K.popIn(t, 0.4, 0.4), { text: P.botLabel || 'AI agents', size: 24, dot: true });
  K.drawLabel(ctx, 200, 760, K.popIn(t, 0.2, 0.4), { text: P.who || 'State lawyer', size: 24 });

  // complaint sheet
  const up = easeOutCubic(clamp((t - tQ + 0.2) / 0.6));
  const pk = K.popIn(t, 0.05, 0.5);
  if (pk > 0) {
    const cx = 500, cy = lerp(640, 520, up), sc = Math.min(1.04, pk) * lerp(1, 0.6, up);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(sc, sc); ctx.rotate(-0.02);
    const W = 520, Hh = 150 + claims.length * 78;
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; roundRect(ctx, -W / 2 + 10, -Hh / 2 + 14, W, Hh, 18); ctx.fill();
    roundRect(ctx, -W / 2, -Hh / 2, W, Hh, 18); ctx.fillStyle = '#f4f6fb'; ctx.fill();
    roundRect(ctx, -W / 2, -Hh / 2, W, 70, 18); ctx.fillStyle = '#1b2140'; ctx.fill(); ctx.fillRect(-W / 2, -Hh / 2 + 46, W, 24);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = H.font('display', 36); ctx.fillStyle = '#ffffff'; ctx.fillText(P.head || 'COMPLAINT', 0, -Hh / 2 + 37);
    const f = H.fitText(ctx, P.title || 'California v. OpenAI', 'display', 36, 22, W - 60); ctx.font = f.font; ctx.fillStyle = '#141829';
    ctx.fillText(f.text, 0, -Hh / 2 + 110);
    claims.forEach((c, i) => {
      const y = -Hh / 2 + 172 + i * 78;
      const k = K.popIn(t, tC[i], 0.4);
      ctx.fillStyle = '#e3e7f2'; roundRect(ctx, -W / 2 + 30, y - 30, W - 60, 60, 14); ctx.fill();
      if (k > 0) {
        ctx.save(); ctx.globalAlpha = clamp(k);
        ctx.fillStyle = RED; ctx.beginPath(); ctx.arc(-W / 2 + 66, y, 18 * Math.min(1.1, k), 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.font = H.font('display', 22); ctx.fillText('!', -W / 2 + 66, y + 1);
        ctx.textAlign = 'left'; ctx.font = H.font('bold', 32); ctx.fillStyle = '#141829';
        ctx.fillText(c.text, -W / 2 + 100, y + 2);
        ctx.restore();
        ctx.textAlign = 'center';
      }
    });
    ctx.restore();
  }

  // quote panel
  if (t >= tQ) {
    const k = easeOutCubic(clamp((t - tQ) / 0.45));
    ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 40);
    const x0 = 95, w = 790, y0 = 650;
    const full = '“' + quote + '”';
    const lines = H.wrap(ctx, full, 'bold', 36, w - 70);
    const h = 40 + lines.length * 46 + 64;
    roundRect(ctx, x0, y0, w, h, 24); ctx.fillStyle = 'rgba(10,12,26,0.95)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = ACC; roundRect(ctx, x0, y0, w, h, 24); ctx.stroke();
    const shown = K.typewriter(full, t, 26, tQ + 0.35).length;
    ctx.font = H.font('bold', 36); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    let used = 0;
    lines.forEach((ln, i) => {
      const n = clamp(shown - used, 0, ln.length); used += ln.length + 1;
      let txt = ln.slice(0, n); const sp = txt.lastIndexOf(' ');
      if (n < ln.length) txt = sp > 0 ? txt.slice(0, sp) : '';
      if (txt) ctx.fillText(txt, x0 + 35, y0 + 62 + i * 46);
    });
    ctx.font = H.font('ui', 26); ctx.fillStyle = ACC; ctx.fillText('— ' + (P.by || 'California Attorney General'), x0 + 35, y0 + 62 + lines.length * 46 + 14);
    ctx.restore();
  }
  ctx.restore();
  void smooth; void rgba;
}
