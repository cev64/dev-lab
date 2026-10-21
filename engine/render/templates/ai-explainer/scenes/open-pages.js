// Scene "open-pages" (full frame, 1 beat). Night office: a researcher at a laptop opens shared pages; one by one, up to
// 4 page cards fly out of the laptop into a 2x2 grid on the wall, each with an icon, a short generic title and
// redacted (blacked-out) lines so no real content is shown. A count pill and an "Illustration" tag sit on top; the
// researcher's mood turns worried. Ends settled (cards breathe, laptop glows).
// Fits: "researchers found X, Y, Z" lists of exposed documents / records / leaks.
// params (all optional): pages [{title, icon: 'chart'|'money'|'calendar'|'note', cue}] (<= 4), count ("Pages opened"),
//   countCue (narration word; "word#n" = (n+1)th time spoken); page titles are illustrative, contents always redacted
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, easeOutCubic, roundRect } = H;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const pages = (P.pages || [{ title: 'Revenue review', icon: 'chart' }, { title: 'Loan application', icon: 'money' }, { title: 'Staff vacation calendar', icon: 'calendar' }, { title: 'Call prep notes', icon: 'note' }]).slice(0, 4);
  const tp = pages.map((p, i) => at(p.cue, D * (0.2 + i * 0.2)) - 0.35);
  const tCount = at(P.countCue, D * 0.05) - 0.2;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.06, x: 520, y: 820 }, { t: tp[0], zoom: 1.0 }, { t: D, zoom: 1.02, x: 487, y: 720 }]);
  K.world.room(ctx, { t, time: 'night', floorY: 1000, window: false, lamp: false, picture: false, plant: true, wall: '#232845', wallS: '#1d2140' });
  // desk + laptop + researcher
  const LX = 600, LY = 960;
  K.drawDesk(ctx, LX, 1035, 1.25);
  K.glow(ctx, LX, LY - 70, 200, ACC, 0.18 + 0.06 * Math.sin(t * 3));
  K.drawLaptop(ctx, LX, LY - 30, 0.95, { t, screen: 'chat', typing: true });
  const worried = t > tp[1] + 0.5;
  K.drawPerson(ctx, 230, 1035, 1.05, { t, pose: worried ? 'shrug' : 'point', mood: worried ? 'worried' : 'neutral', skin: 0, hair: 2, shirt: '#6f8cff', hairStyle: 'short', seed: 31, look: 1 });
  ctx.restore();

  // count pill + illustration tag
  const cp = K.popIn(t, tCount, 0.45);
  if (cp > 0) K.drawLabel(ctx, 487, 470, cp, { text: P.count || 'Pages opened', size: 30, accent: true });

  // page cards
  const slots = [[290, 495], [690, 495], [290, 665], [690, 665]];
  const CW = 360, CH = 150;
  const icon = (kind, x, y) => {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = ACC; ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 4;
    roundRect(ctx, -30, -30, 60, 60, 14); ctx.fill();
    ctx.strokeStyle = K.ACCENT.deep; ctx.fillStyle = K.ACCENT.deep;
    if (kind === 'chart') { for (let i = 0; i < 3; i++) { ctx.fillRect(-16 + i * 12, 14 - (10 + i * 8), 8, 10 + i * 8); } }
    else if (kind === 'money') { ctx.font = H.font('display', 40); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('$', 0, 3); }
    else if (kind === 'calendar') { ctx.strokeRect(-17, -13, 34, 30); ctx.fillRect(-17, -13, 34, 9); for (let a = 0; a < 3; a++) for (let b = 0; b < 2; b++) ctx.fillRect(-12 + a * 10, 0 + b * 8, 5, 5); }
    else { ctx.beginPath(); ctx.moveTo(-14, -16); ctx.lineTo(14, -16); ctx.moveTo(-14, -4); ctx.lineTo(14, -4); ctx.moveTo(-14, 8); ctx.lineTo(6, 8); ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke(); }
    ctx.restore();
  };
  pages.forEach((pg, i) => {
    const u = H.phase(t, tp[i], tp[i] + 0.7, easeOutCubic);
    if (u <= 0) return;
    const [sx, sy] = slots[i];
    const x = lerp(LX, sx, u), y = lerp(LY - 80, sy + CH / 2, u) - Math.sin(u * Math.PI) * 80;
    const s = lerp(0.25, 1, u) * (1 + 0.012 * Math.sin(t * 2 + i));
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate((1 - u) * 0.3 + (i % 2 ? 0.02 : -0.02));
    roundRect(ctx, -CW / 2 + 6, -CH / 2 + 8, CW, CH, 18); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
    roundRect(ctx, -CW / 2, -CH / 2, CW, CH, 18); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    icon(pg.icon || ['chart', 'money', 'calendar', 'note'][i], -CW / 2 + 52, -CH / 2 + 46);
    const ttl = pg.title || 'Page';
    const fs = 28;
    ctx.font = H.font('display', fs); ctx.fillStyle = '#1b1f33'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    // wrap to 2 lines if needed
    const lines = H.wrap(ctx, ttl, 'display', fs, CW - 110);
    lines.slice(0, 2).forEach((ln, k) => ctx.fillText(ln, -CW / 2 + 96, -CH / 2 + 46 + (k - (lines.length > 1 ? 0.5 : 0)) * fs * 1.1));
    // redacted lines
    for (let k = 0; k < 2; k++) {
      const red = clamp((t - tp[i] - 0.7 - k * 0.2) / 0.3);
      roundRect(ctx, -CW / 2 + 24, 12 + k * 30, (CW - 48) * (k ? 0.65 : 0.9) * red, 20, 6); ctx.fillStyle = '#1b1f33'; ctx.fill();
    }
    ctx.restore();
  });
}
