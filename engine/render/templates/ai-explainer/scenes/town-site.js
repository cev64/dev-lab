// Scene "town-site" (full frame). A town street with a giant building hidden under a tarp next to a crane.
// mode "hidden": puzzled townspeople stand in front; redacted info tags (label + black marker bar) are struck
//   through one by one. Ends with all tags redacted, people shrugging.
// mode "reveal": night; the tarp lifts to reveal a humming data center; townspeople gather and talk (speech
//   bubbles), then a big accent question label. Ends settled.
// Fits: data-center / big-facility stories, "locals weren't told", "what's being built next door?".
// params (all optional): mode    "hidden" (default) | "reveal"
//                        tags    hidden: [{label, redact}] up to 3 (default SIZE / WATER & POWER / COMPANY)
//                        cues    hidden: words that trigger each tag (else evenly spaced)
//                        bubbles reveal: 2 speech-bubble texts (default ["How much water?", "Who's building it?"])
//                        ask     reveal: final label (default "Next door?"); sign  label on the building (default "Data center")
//                        talkCue / askCue  reveal: words for the bubbles / question (else 45% / 80%)
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {};
  const { clamp, lerp, smooth } = H;
  const D = info.duration, ACC = info.accent;
  const reveal = P.mode === 'reveal';
  const cueT = (w, d) => { const v = w ? info.timeOf(w) : null; return v != null ? v : d; };

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.06, x: 487, y: 760 }]);
  K.world.city(ctx, { t, time: reveal ? 'night' : 'dusk', groundY: 980 });
  const BY = 985;
  drawCrane(ctx, 120, BY, t, reveal ? 0.55 : 0.85);

  // reveal: the building underneath, then the tarp lifts off
  const lift = reveal ? K.phase(t, 0.4, 1.9) : 0;
  if (reveal) {
    const act = 0.4 + 0.6 * smooth((t - 1.2) / 2);
    K.drawDataCenter(ctx, 487, BY, 1.6, { t, activity: act, label: P.sign || null });
    // hum rings
    ctx.save(); ctx.strokeStyle = H.rgba(ACC, 0.5); ctx.lineWidth = 4;
    for (let i = 0; i < 3; i++) {
      const ph = (t * 0.7 + i / 3) % 1; ctx.globalAlpha = (1 - ph) * K.fadeIn(t, 1.6, 0.5);
      ctx.beginPath(); ctx.ellipse(487, BY - 150, 290 + ph * 110, 180 + ph * 60, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    }
    ctx.restore();
  }
  if (lift < 1) {
    ctx.save();
    ctx.globalAlpha = 1 - smooth((lift - 0.55) / 0.45);
    ctx.translate(0, -700 * lift * lift);
    drawShroud(ctx, H, K, 487, BY, 620, 400, t, ACC, lift);
    ctx.restore();
  }

  // townspeople
  const people = reveal
    ? [{ x: 150, s: 1.25, o: { skin: 3, hair: 0, hairStyle: 'curly', shirt: 2, seed: 1 } },
       { x: 300, s: 1.15, o: { skin: 1, hair: 2, hairStyle: 'long', shirt: 3, seed: 2 } },
       { x: 690, s: 1.15, o: { skin: 4, hair: 0, hairStyle: 'short', shirt: 1, seed: 3, flip: true } },
       { x: 830, s: 1.25, o: { skin: 0, hair: 3, hairStyle: 'bun', shirt: 0, seed: 4, flip: true } }]
    : [{ x: 160, s: 1.3, o: { skin: 3, hair: 0, hairStyle: 'curly', shirt: 2, seed: 1 } },
       { x: 320, s: 1.2, o: { skin: 1, hair: 2, hairStyle: 'long', shirt: 3, seed: 2 } },
       { x: 815, s: 1.3, o: { skin: 0, hair: 3, hairStyle: 'bun', shirt: 0, seed: 4, flip: true } }];

  if (!reveal) {
    const tags = (P.tags || [{ label: 'SIZE' }, { label: 'WATER & POWER' }, { label: 'COMPANY' }]).slice(0, 3);
    const cues = P.cues || [];
    const times = tags.map((_, i) => cueT(cues[i], 0.8 + i * (D * 0.75 / tags.length)));
    const lastAt = times[times.length - 1];
    people.forEach((p, i) => {
      const pose = t > times[0] + 0.3 + i * 0.25 ? 'shrug' : 'stand';
      K.drawPerson(ctx, p.x, 1040, p.s, Object.assign({ t, pose, mood: t > lastAt ? 'worried' : 'neutral', look: p.o.flip ? -0.4 : 0.4 }, p.o));
    });
    ctx.restore();
    // redacted tags in screen space (stage top)
    tags.forEach((tg, i) => {
      const at = times[i] - 0.25, pop = K.popIn(t, at, 0.35);
      if (pop <= 0) return;
      const y = 440 + i * 92, w = 600, h = 70, x = 487 - w / 2;
      ctx.save(); ctx.translate(487, y + h / 2); ctx.scale(pop, pop); ctx.translate(-487, -(y + h / 2));
      H.roundRect(ctx, x, y, w, h, 18); ctx.fillStyle = 'rgba(10,12,22,0.9)'; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.stroke();
      ctx.font = H.font('ui', 32); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#ffffff';
      ctx.fillText(tg.label, x + 26, y + h / 2 + 1);
      const lw = ctx.measureText(tg.label).width;
      // marker bar wipes in
      const bx = x + 26 + lw + 22, bw = (x + w - 22) - bx, wipe = K.phase(t, at + 0.3, at + 0.75);
      H.roundRect(ctx, bx, y + 16, bw, h - 32, 6); ctx.fillStyle = 'rgba(255,255,255,0.08)'; ctx.fill();
      if (wipe > 0) {
        H.roundRect(ctx, bx, y + 14, Math.max(8, bw * wipe), h - 28, 6); ctx.fillStyle = '#000000'; ctx.fill();
        ctx.lineWidth = 2; ctx.strokeStyle = H.rgba(ACC, 0.8); ctx.stroke();
      }
      if (wipe >= 1) {
        ctx.font = H.font('ui', 26); ctx.textAlign = 'center'; ctx.fillStyle = H.rgba(ACC, 0.9);
        ctx.fillText(tg.redact || 'REDACTED', bx + bw / 2, y + h / 2 + 1);
      }
      ctx.restore();
    });
  } else {
    const talkAt = cueT(P.talkCue, D * 0.45), askAt = cueT(P.askCue, D * 0.8);
    people.forEach((p, i) => {
      const walkIn = clamp((t - 0.2 - i * 0.15) / 1.4);
      const dir = p.x < 487 ? -1 : 1;
      const x = p.x + dir * 160 * (1 - H.easeOutCubic(walkIn));
      const talking = (i === 0 || i === 3) && t > talkAt && t < talkAt + 1.8;
      const pose = walkIn < 1 ? 'stand' : t > askAt + 0.3 && (i === 1 || i === 2) ? 'point' : 'stand';
      K.drawPerson(ctx, x, 1040, p.s, Object.assign({ t, pose, walk: walkIn < 1 ? t : null, mood: 'happy', talk: talking ? 0.4 + 0.5 * info.env : 0, look: p.o.flip ? -0.5 : 0.5 }, p.o));
    });
    ctx.restore();
    const bubbles = P.bubbles || ['How much water?', "Who's building it?"];
    const b1 = K.popIn(t, talkAt, 0.35), b2 = K.popIn(t, talkAt + 0.7, 0.35);
    if (b1 > 0) K.drawSpeechBubble(ctx, 190, 650, 1, { text: bubbles[0], size: 30, tail: 'left', pop: b1 });
    if (b2 > 0) K.drawSpeechBubble(ctx, 800, 560, 1, { text: bubbles[1], size: 30, tail: 'right', pop: b2 });
    const ask = K.popIn(t, askAt, 0.45);
    if (ask > 0) K.drawLabel(ctx, 487, 470, ask, { text: P.ask || 'Next door?', size: 44, accent: true });
  }
}

function drawCrane(ctx, x, by, t, alpha) {
  ctx.save(); ctx.strokeStyle = '#ffcc55'; ctx.lineWidth = 7; ctx.globalAlpha = alpha;
  const top = by - 520;
  ctx.beginPath(); ctx.moveTo(x - 18, by); ctx.lineTo(x - 18, top); ctx.moveTo(x + 18, by); ctx.lineTo(x + 18, top); ctx.stroke();
  ctx.lineWidth = 3;
  for (let y = by; y > top; y -= 36) { ctx.beginPath(); ctx.moveTo(x - 18, y); ctx.lineTo(x + 18, y - 36); ctx.stroke(); }
  ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x - 90, top); ctx.lineTo(x + 330, top); ctx.stroke();
  ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, top - 60); ctx.lineTo(x + 330, top); ctx.moveTo(x, top - 60); ctx.lineTo(x - 90, top); ctx.stroke();
  const hx = x + 260 + Math.sin(t * 0.9) * 8;
  ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x + 260, top); ctx.lineTo(hx, top + 120); ctx.stroke();
  ctx.fillStyle = '#ffcc55'; ctx.fillRect(hx - 10, top + 118, 20, 14);
  ctx.restore();
}

// Giant building hidden under a tarp (anchor bottom-centre). Humming glow + vents bumping the cloth.
function drawShroud(ctx, H, K, cx, by, w, h, t, ACC, lift = 0) {
  const top = by - h, l = cx - w / 2, r = cx + w / 2;
  K.glow(ctx, cx, top + h * 0.4, w * 0.7, ACC, 0.10 + 0.06 * Math.sin(t * 3));
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(l - 18, by);
  ctx.lineTo(l + 6, top + 40);
  ctx.quadraticCurveTo(l + 10, top, l + 50, top);
  for (let i = 0; i < 3; i++) {
    const bx = cx - w * 0.28 + i * w * 0.28;
    ctx.lineTo(bx - 46, top); ctx.quadraticCurveTo(bx, top - 46, bx + 46, top);
  }
  ctx.lineTo(r - 50, top); ctx.quadraticCurveTo(r - 10, top, r - 6, top + 40);
  ctx.lineTo(r + 18, by);
  const flap = 8 + 40 * lift;
  for (let i = 0; i <= 12; i++) ctx.lineTo(r + 18 - (i / 12) * (w + 36), by - 8 + flap * Math.sin(i * 1.7 + t * (1.2 + 6 * lift)));
  ctx.closePath();
  ctx.fillStyle = '#6d7699'; ctx.fill();
  ctx.clip();
  for (let i = 0; i < 9; i++) {
    const fx = l + (i + 0.5) * (w / 9) + Math.sin(t * 0.8 + i) * 3;
    const g = ctx.createLinearGradient(fx - 26, 0, fx + 26, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.5, 'rgba(20,24,48,0.35)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.fillRect(fx - 26, top - 50, 52, h + 60);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(l - 20, top - 50, w * 0.22, h + 60);
  ctx.restore();
  if (lift <= 0) {
    ctx.strokeStyle = '#d9c9a0'; ctx.lineWidth = 4;
    for (const [a, b] of [[l + 30, l - 60], [r - 30, r + 60]]) { ctx.beginPath(); ctx.moveTo(a, top + 30); ctx.quadraticCurveTo((a + b) / 2, top + h * 0.6, b, by); ctx.stroke(); }
  }
  const sw = Math.sin(t * 1.6) * 0.06;
  ctx.save(); ctx.translate(cx, top + h * 0.45); ctx.rotate(sw);
  H.roundRect(ctx, -60, 0, 120, 120, 18); ctx.fillStyle = '#1c2033'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.stroke();
  ctx.font = K.font.display(86); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = ACC; ctx.fillText('?', 0, 64);
  ctx.restore();
}
