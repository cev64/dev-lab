// Scene "canary-desk" (full frame, one beat). Night office: a generic cartoon researcher at a desk slips glowing canary
// tags (trackable secrets: small yellow bird badges) into envelopes that fly off into a mail chute. Top pills: who
// (name as TEXT only, never a likeness) and when. Three bait cards pop in on their cues (key / password / link
// icons); on watchCue the cards slide away and a wall monitor appears with tag dots, one lighting up.
// Fits: honeytokens / canary tokens / planted bait / "seeded secrets, then watched".
// params: who, when, cards [{head, sub, icon key|pass|link, cue}] x3, watch; cues: whoCue, whenCue, watchCue
const CANARY = '#ffd23a', CANARY_S = '#e0a91c';
function bird(ctx, x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = CANARY;
  ctx.beginPath(); ctx.ellipse(-2, 4, 15, 11, -0.2, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(10, -7, 8, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-14, 4); ctx.lineTo(-26, -2); ctx.lineTo(-24, 10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = CANARY_S; ctx.beginPath(); ctx.ellipse(-4, 4, 8, 5, -0.4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff9a3c'; ctx.beginPath(); ctx.moveTo(17, -8); ctx.lineTo(24, -5); ctx.lineTo(17, -3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#1b1d2c'; ctx.beginPath(); ctx.arc(12, -9, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function tag(ctx, H, K, x, y, s, lit) {
  if (lit > 0) K.glow(ctx, x, y, 46 * s * (1 + lit * 0.6), CANARY, 0.35 + 0.5 * lit);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = '#20243c'; ctx.beginPath(); ctx.arc(0, 0, 24, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = H.mixHex(CANARY_S, '#ffffff', lit * 0.6); ctx.stroke();
  bird(ctx, -1, 2, 0.62);
  ctx.restore();
}
function envelope(ctx, H, x, y, s, rot = 0) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
  H.roundRect(ctx, -50, -33, 100, 66, 8); ctx.fillStyle = '#f4efe2'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#cdbf9e'; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-48, -30); ctx.lineTo(0, 6); ctx.lineTo(48, -30); ctx.stroke();
  ctx.restore();
}
function icon(ctx, kind, x, y, col) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 6; ctx.lineCap = 'round';
  if (kind === 'key') {
    ctx.beginPath(); ctx.arc(-14, 0, 13, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-1, 0); ctx.lineTo(26, 0); ctx.moveTo(18, 0); ctx.lineTo(18, 10); ctx.moveTo(26, 0); ctx.lineTo(26, 12); ctx.stroke();
  } else if (kind === 'pass') {
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-27 + i * 18, 0, 6, 0, Math.PI * 2); ctx.fill(); }
  } else {
    ctx.beginPath(); ctx.ellipse(-10, 0, 15, 9, -0.6, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(10, 0, 15, 9, -0.6, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.restore();
}

export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, easeOutCubic, easeInOutCubic } = H;
  const D = info.duration, ACC = info.accent;
  const at = (w, d) => { if (!w) return d; const m = String(w).match(/^(.*)#(\d+)$/); const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w); return v == null ? d : v; };
  const tWho = at(P.whoCue, 0.4), tWhen = at(P.whenCue, D * 0.33), tWatch = at(P.watchCue, D * 0.86);
  const cards = (P.cards || [
    { head: 'Cloud keys', sub: 'to empty accounts', icon: 'key' },
    { head: 'Passwords', sub: 'never used before', icon: 'pass' },
    { head: 'Secret links', sub: 'unique web addresses', icon: 'link' }]).slice(0, 3);
  const tc = cards.map((c, i) => at(c.cue, D * (0.48 + i * 0.12)));
  const pill = (text, x, y, a, o = {}) => {
    if (t < a) return;
    K.drawLabel(ctx, x, y, K.popIn(t, a, 0.4), { text, size: o.size || 28, dot: !o.accent, accent: o.accent });
  };

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 760 }, { t: D, zoom: 1.04, x: 487, y: 770 }]);
  K.world.room(ctx, { t, time: 'night', window: true, lamp: true, picture: false, plant: true, floorY: 930 });
  const feet = 1040;
  // mail chute on the right
  const CX = 840;
  H.roundRect(ctx, CX - 55, 600, 110, feet - 600, 16); ctx.fillStyle = '#3b4470'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = '#8f98c8'; ctx.stroke();
  H.roundRect(ctx, CX - 44, 760, 88, 26, 8); ctx.fillStyle = '#0c0e1c'; ctx.fill();
  ctx.font = K.font.ui(24); ctx.fillStyle = '#e8ecf8'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(P.chute || 'To AI', CX, 840); ctx.fillText(P.chute2 || 'services', CX, 870);

  K.drawDesk(ctx, 500, feet, 1.25);
  const top = feet - 110 * 1.25;
  // researcher: generic cartoon, standing behind the desk's left end
  const working = t < tWatch;
  K.drawPerson(ctx, 210, feet, 1.2, { t, pose: working ? 'point' : 'stand', mood: 'happy', skin: 3, hair: 0, shirt: 3, hairStyle: 'bun', seed: 17, look: 0.7, talk: 0 });
  // stack of envelopes on the desk
  for (let i = 0; i < 5; i++) envelope(ctx, H, 420, top - 10 - i * 9, 0.85, (i % 2 ? 0.04 : -0.03));
  // the current envelope gets a tag, then flies into the chute (cycle)
  const per = 1.3, ph = ((t + 0.4) % per) / per;
  const ex = ph < 0.45 ? 560 : lerp(560, CX - 20, easeInOutCubic((ph - 0.45) / 0.55));
  const ey = ph < 0.45 ? top - 40 : lerp(top - 40, 773, easeInOutCubic((ph - 0.45) / 0.55)) - Math.sin(clamp((ph - 0.45) / 0.55) * Math.PI) * 120;
  const es = ph < 0.45 ? 0.95 : lerp(0.95, 0.5, (ph - 0.45) / 0.55);
  envelope(ctx, H, ex, ey, es, ph < 0.45 ? 0 : (ph - 0.45) * 0.6);
  // tag: flies from the researcher's hand to the envelope corner
  const tk = clamp(ph / 0.35);
  const tx = ph < 0.35 ? lerp(300, 600, easeOutCubic(tk)) : ex + 40 * es, ty = ph < 0.35 ? lerp(top - 130, top - 22, easeOutCubic(tk)) - Math.sin(tk * Math.PI) * 60 : ey + 18 * es;
  tag(ctx, H, K, tx, ty, 0.75 * (ph < 0.35 ? 1 : es / 0.95), 0.4);
  // wall monitor on watchCue
  const mon = K.popIn(t, tWatch - 0.2, 0.45);
  if (mon > 0) {
    ctx.save(); ctx.translate(540, 710); ctx.scale(mon, mon);
    H.roundRect(ctx, -250, -120, 500, 240, 18); ctx.fillStyle = '#10142a'; ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = '#8f98c8'; ctx.stroke();
    for (let i = 0; i < 18; i++) {
      const gx = -200 + (i % 6) * 80, gy = -70 + Math.floor(i / 6) * 70;
      const lit = i === 8 ? clamp((t - tWatch - 0.4) / 0.3) : 0;
      tag(ctx, H, K, gx, gy, 0.55, lit);
    }
    ctx.restore();
  }
  ctx.restore();
  // bait cards
  const CW = 232, GAP = 18, X0 = 487 - (CW * 3 + GAP * 2) / 2;
  const away = clamp((t - tWatch + 0.3) / 0.35);
  cards.forEach((c, i) => {
    const p = K.popIn(t, tc[i] - 0.15, 0.4);
    if (p <= 0 || away >= 1) return;
    const cx = X0 + i * (CW + GAP) + CW / 2, cy = 652 - away * 60;
    ctx.save(); ctx.globalAlpha = 1 - away; ctx.translate(cx, cy); ctx.scale(Math.min(1.03, p), Math.min(1.03, p));
    H.roundRect(ctx, -CW / 2, -80, CW, 160, 18); ctx.fillStyle = 'rgba(14,17,33,0.92)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    icon(ctx, c.icon, -60, -36, CANARY);
    tag(ctx, H, K, 70, -36, 0.75, 0.6);
    ctx.font = K.font.display(30); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(c.head, 0, 18);
    ctx.font = K.font.body(24); ctx.fillStyle = '#c9d0e8';
    ctx.fillText(c.sub, 0, 54);
    ctx.restore();
  });
  pill(P.who || 'Researcher: Name, Org', 487, 480, tWho - 0.2, { size: 30 });
  pill(P.when || 'DATES', 487, 556, tWhen - 0.2, { size: 28, accent: true });
  if (t >= tWatch - 0.2) pill(P.watch || 'Then: watch who uses them', 487, 900, tWatch - 0.2, { size: 28, accent: true });
}
