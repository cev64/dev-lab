// Scene "usage-meter" (full frame). A phone's built-in AI assistant gets a DAILY usage meter. Generic cartoon phone, no
// logos: the assistant is a lime glowing ring, the "plans" are plain cloud-capped bars with text labels.
// mode "hook"   : (cold open) night room; a big horizontal "DAILY AI LIMIT" meter races from ~3/4 to 100%, slams red
//                 and shakes; the phone screen dims, a padlock drops, a hanging "BACK AT MIDNIGHT" sign swings down; a
//                 person beside it goes from neutral to shocked. Peak inside ~1.5 s.
// mode "recap"  : LAST WEEK card (laptop + fuel-can "AI refills" + sub) -> arrow -> NOW card (phone + small meter);
//                 build + date pills on top, feature chips at the bottom.
// mode "counts" : left: request cards pop on their cues and each fires a chip into the phone's meter (it steps up);
//                 a "Set a timer" card slides through with a "Still works" tick and the meter does not move.
// mode "limit"  : top meter "This device · today"; tablet / phone / laptop each with their own mini meter (deviceCue);
//                 warning toast (warnCue, meter ~85%); hit (hitCue): red, padlock, "paused" pill; midnight (resetCue):
//                 wall clock hands sweep to 12, meter drains, "resets" pill; rollover pill (rollCue).
// mode "plans"  : bar row of plan tiers with cloud caps, heights proportional to v (up to 20x), pop on cues, price tag.
// mode "caveat" : person shrugs by the phone; the meter's end marker is a "?" and wobbles; "not disclosed" pill,
//                 "can shift" pill, swinging BETA tag.
// Fits: any "AI usage cap / quota / allowance / daily limit / pay for more usage" story (assistants, chatbots, image
// tools). params per mode (cue params are narration words, "word#n" = (n+1)th time; without them fractions):
//   hook: limit ("DAILY AI LIMIT"), sign ("BACK AT MIDNIGHT")
//   recap: was, wasSub, wasWhen, now, nowWhen, build, date, chips [2], wasCue, nowCue, buildCue, chipsCue
//   counts: head, items [{text, cue}] (<= 4), free, freeTag, server ("Runs in the cloud"), serverCue, freeCue
//   limit: meterLabel, device, warn, paused, reset, roll, meterCue, deviceCue, warnCue, hitCue, resetCue, rollCue
//   plans: head, tiers [{label, x, v, cue (bar grows), xCue (multiplier pops)}] (<= 5), upTo, price, priceX, headCue, priceCue
//   caveat: unknown, shift, beta, unknownCue, shiftCue, betaCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic, roundRect, mixHex, rgba } = H;
  const mode = P.mode || 'hook';
  const RED = K.NEUTRAL.danger, WARN = K.NEUTRAL.warn;
  const at = (w, f) => {
    if (w == null || w === '') return D * f;
    if (typeof w === 'number') return w;
    const m = String(w).match(/^(.*)#(\d+)$/);
    const v = m ? info.timeOf(m[1], +m[2]) : info.timeOf(w);
    return v == null ? D * f : v;
  };

  // ------------------------------------------------------------------ helpers
  function text(txt, x, y, size, color, kind = 'display', align = 'center', maxW = 0) {
    let fs = size;
    if (maxW) fs = H.fitText(ctx, txt, kind, size, Math.max(18, size * 0.5), maxW).size;
    ctx.font = H.font(kind, fs); ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
    ctx.fillText(txt, x, y);
    return fs;
  }
  function popAt(x, y, p, fn) {
    if (p <= 0) return;
    ctx.save(); ctx.translate(x, y); ctx.scale(p, p); ctx.translate(-x, -y); fn(); ctx.restore();
  }
  // meter colour: accent -> warn -> red
  function meterCol(f) { return f >= 0.999 ? RED : f > 0.8 ? mixHex(WARN, RED, (f - 0.8) / 0.2 * 0.6) : f > 0.6 ? mixHex(ACC, WARN, (f - 0.6) / 0.2) : ACC; }
  // horizontal meter: x0..x1, y top, h; f 0..1
  function meter(x0, y, x1, h, f, o = {}) {
    const w = x1 - x0;
    roundRect(ctx, x0 - 6, y - 6, w + 12, h + 12, (h + 12) / 2); ctx.fillStyle = 'rgba(8,10,22,0.9)'; ctx.fill();
    roundRect(ctx, x0, y, w, h, h / 2); ctx.fillStyle = '#2a3050'; ctx.fill();
    const ff = clamp(f);
    if (ff > 0.005) {
      const col = o.color || meterCol(ff);
      K.glow(ctx, x0 + w * ff, y + h / 2, h * 2.2, col, 0.25 * (o.glow == null ? 1 : o.glow));
      roundRect(ctx, x0, y, Math.max(h, w * ff), h, h / 2); ctx.fillStyle = col; ctx.fill();
      // moving sheen
      ctx.save(); roundRect(ctx, x0, y, Math.max(h, w * ff), h, h / 2); ctx.clip();
      const sx = x0 + ((t * 160) % (w + 200)) - 100;
      const g = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.28)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(x0, y, w, h);
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x0, y + 3, w, h * 0.22);
      ctx.restore();
    }
    // tick marks
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    for (let i = 1; i < 10; i++) ctx.fillRect(x0 + (w * i) / 10 - 1, y + h * 0.3, 2, h * 0.4);
    if (o.label) text(o.label, x0 + 4, y - 26, o.labelSize || 28, '#ffffff', 'ui', 'left');
    if (o.right) text(o.right, x1 - 4, y - 26, o.labelSize || 28, o.rightColor || (ff >= 0.999 ? RED : ACC), 'display', 'right');
  }
  // assistant orb: a generic glowing ring with a small waveform (no real product's look)
  function orb(cx, cy, r, on) {
    const a = 0.35 + 0.65 * on;
    K.glow(ctx, cx, cy, r * 2.4, ACC, 0.35 * on);
    ctx.save(); ctx.globalAlpha = a;
    ctx.lineWidth = r * 0.22; ctx.strokeStyle = mixHex(ACC, '#6b7290', 1 - on);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = r * 0.1; ctx.globalAlpha = a * 0.6;
    ctx.beginPath(); ctx.arc(cx, cy, r * 0.68 + Math.sin(t * 3) * r * 0.05 * on, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = a;
    ctx.fillStyle = mixHex(ACC, '#6b7290', 1 - on);
    for (let i = 0; i < 5; i++) {
      const hh = r * (0.18 + 0.32 * on * (0.5 + 0.5 * Math.sin(t * 7 + i * 1.3)));
      roundRect(ctx, cx - r * 0.42 + i * r * 0.21 - r * 0.05, cy - hh / 2, r * 0.1, hh, r * 0.05); ctx.fill();
    }
    ctx.restore();
  }
  // big phone; o: on (assistant brightness), dim (screen dim), meterF (screen meter, null hides), bubbles
  function phone(cx, top, w, h, o = {}) {
    const r = Math.min(40, w * 0.13);
    K.shadow(ctx, cx, top + h + 8, w * 1.1);
    roundRect(ctx, cx - w / 2 - 12, top - 12, w + 24, h + 24, r + 10); ctx.fillStyle = '#1c2033'; ctx.fill();
    roundRect(ctx, cx - w / 2 - 12, top - 12, w + 24, h + 24, r + 10); ctx.lineWidth = 3; ctx.strokeStyle = '#3b4260'; ctx.stroke();
    roundRect(ctx, cx - w / 2, top, w, h, r); ctx.fillStyle = '#121527'; ctx.fill();
    ctx.save(); roundRect(ctx, cx - w / 2, top, w, h, r); ctx.clip();
    const on = o.on == null ? 1 : o.on;
    K.glow(ctx, cx, top + h * 0.45, w * 0.9, ACC, 0.14 * on);
    let y = top + 46;
    if (o.meterF != null) {
      meter(cx - w / 2 + 30, top + 58, cx + w / 2 - 30, 22, o.meterF, { glow: 0.6 });
      text(o.meterLabel || 'TODAY', cx - w / 2 + 30, top + 34, 20, 'rgba(255,255,255,0.75)', 'ui', 'left');
      y = top + 100;
    }
    // chat bubbles
    const nb = o.bubbles == null ? 3 : o.bubbles;
    for (let i = 0; i < nb; i++) {
      const me = i % 2 === 0, bw = w * (0.5 + 0.2 * H.hash(i, 5)), bh = 40;
      const bx = me ? cx + w / 2 - 22 - bw : cx - w / 2 + 22, by = y + 14 + i * 54;
      if (by + bh > top + h * 0.6) break;
      roundRect(ctx, bx, by, bw, bh, 16); ctx.fillStyle = me ? mixHex(ACC, '#000000', 0.2) : '#2e3557'; ctx.fill();
      ctx.globalAlpha = 0.5; ctx.fillStyle = me ? K.ACCENT.deep : '#ffffff';
      roundRect(ctx, bx + 14, by + 12, bw - 28, 6, 3); ctx.fill(); roundRect(ctx, bx + 14, by + 24, (bw - 28) * 0.6, 6, 3); ctx.fill();
      ctx.globalAlpha = 1;
    }
    orb(cx, top + h * 0.78, Math.min(w * 0.16, 60), on);
    if (o.draw) o.draw(cx, top, w, h);
    if (o.dim) { ctx.fillStyle = `rgba(6,8,18,${0.62 * o.dim})`; ctx.fillRect(cx - w / 2, top, w, h); }
    ctx.restore();
    roundRect(ctx, cx - w * 0.12, top + 10, w * 0.24, 13, 6.5); ctx.fillStyle = '#0b0d18'; ctx.fill();
  }
  function pill(x, y, p, txt, o = {}) { if (p > 0) K.drawLabel(ctx, x, y, p, { text: txt, size: o.size || 28, accent: o.accent, dot: o.dot }); }
  // card: white rounded panel with accent edge
  function card(x0, y0, w, h, fill = '#f2f4fa', edge = ACC) {
    roundRect(ctx, x0, y0, w, h, 20); ctx.fillStyle = fill; ctx.fill();
    roundRect(ctx, x0, y0, 14, h, 7); ctx.fillStyle = edge; ctx.fill();
  }
  function check(x, y, s, col = ACC) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    ctx.strokeStyle = K.ACCENT.deep; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(-10, 1); ctx.lineTo(-3, 9); ctx.lineTo(11, -8); ctx.stroke(); ctx.restore();
  }
  function cross(x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fillStyle = RED; ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-8, -8); ctx.lineTo(8, 8); ctx.moveTo(8, -8); ctx.lineTo(-8, 8); ctx.stroke(); ctx.restore();
  }
  function moon(x, y, r) {
    ctx.save(); K.glow(ctx, x, y, r * 2.4, '#fff1c4', 0.25);
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = '#fff1c4'; ctx.fill();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath(); ctx.arc(x + r * 0.45, y - r * 0.3, r * 0.85, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // hanging sign that drops and swings, settles
  function hangSign(cx, yTop, p, t0, txt, w = 420) {
    if (p <= 0) return;
    const swing = Math.sin((t - t0) * 6) * 0.22 * Math.exp(-(t - t0) * 2.2);
    const drop = (1 - easeOutCubic(clamp(p))) * -320;
    ctx.save(); ctx.translate(cx, yTop + drop); ctx.rotate(swing);
    ctx.strokeStyle = '#b9c1d6'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(-w * 0.32, 0); ctx.lineTo(-w * 0.2, -90); ctx.lineTo(w * 0.2, -90); ctx.lineTo(w * 0.32, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -96, 9, 0, Math.PI * 2); ctx.fillStyle = '#b9c1d6'; ctx.fill();
    K.glow(ctx, 0, 60, w * 0.6, '#fff1c4', 0.18);
    roundRect(ctx, -w / 2, 0, w, 130, 22); ctx.fillStyle = '#20264a'; ctx.fill();
    roundRect(ctx, -w / 2, 0, w, 130, 22); ctx.lineWidth = 5; ctx.strokeStyle = '#fff1c4'; ctx.stroke();
    moon(-w / 2 + 62, 65, 30);
    const lines = String(txt).split('|');
    if (lines.length > 1) {
      text(lines[0], 40, 42, 34, '#fff1c4', 'display', 'center', w - 150);
      text(lines[1], 40, 88, 40, '#ffffff', 'display', 'center', w - 150);
    } else text(lines[0], 40, 65, 40, '#ffffff', 'display', 'center', w - 150);
    ctx.restore();
  }
  function scrim(a) { ctx.fillStyle = `rgba(8,10,24,${a})`; ctx.fillRect(0, 0, 1080, 1920); }

  // ================================================================== modes
  if (mode === 'hook') {
    K.world.room(ctx, { t, time: 'night', lamp: true, window: true, plant: false, picture: false });
    scrim(0.35);
    const tHit = 1.0;
    const f = lerp(0.74, 1, easeOutCubic(clamp(t / tHit)));
    const hit = t >= tHit;
    const sh = K.shake(t, tHit, 0.5, 9);
    // big meter across the top of the stage
    ctx.save(); ctx.translate(sh, 0);
    meter(140, 470, 835, 54, f, { label: P.limit || 'DAILY AI LIMIT', labelSize: 34, right: `${Math.round(f * 100)}%` });
    ctx.restore();
    if (hit) { const b = clamp(1 - (t - tHit) / 0.5); K.glow(ctx, 835, 497, 220, RED, 0.6 * b); }
    // phone
    const dim = H.phase(t, tHit + 0.05, tHit + 0.45);
    const cx = 640, top = 590, w = 300, h = 430;
    ctx.save(); ctx.translate(sh * 0.5, K.bob(t, 4, 0.4));
    phone(cx, top, w, h, { on: 1 - dim, dim, bubbles: 3 });
    const lp = H.phase(t, tHit + 0.1, tHit + 0.45, easeOutCubic);
    if (lp > 0) K.drawLock(ctx, cx, lerp(top + 120, top + 330, lp), 0.95, { open: 0 });
    ctx.restore();
    // person reacts
    K.drawPerson(ctx, 255, 1035, 1.5, { t, pose: hit ? 'shrug' : 'phone', mood: hit ? 'shocked' : 'neutral', look: 0.7, skin: 2, hair: 1, shirt: 2, hairStyle: 'curly', seed: 4 });
    // sign
    const sp = H.phase(t, tHit + 0.25, tHit + 0.75);
    hangSign(cx, 680, sp, tHit + 0.25, P.sign || 'BACK AT|MIDNIGHT', 360);
    return;
  }

  if (mode === 'recap') {
    K.world.room(ctx, { t, time: 'night', lamp: true, window: true, plant: true, picture: false });
    scrim(0.45);
    const tWas = at(P.wasCue, 0.25), tNow = at(P.nowCue, 0.45), tBuild = at(P.buildCue, 0.7), tChips = at(P.chipsCue, 0.8);
    // LAST WEEK card (left)
    const lp = K.popIn(t, 0.1, 0.5);
    const L = { x0: 130, y0: 560, w: 330, h: 380 };
    popAt(L.x0 + L.w / 2, L.y0 + L.h, lp, () => {
      roundRect(ctx, L.x0, L.y0, L.w, L.h, 26); ctx.fillStyle = 'rgba(20,24,46,0.92)'; ctx.fill();
      roundRect(ctx, L.x0, L.y0, L.w, L.h, 26); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,255,255,0.16)'; ctx.stroke();
      text(P.wasWhen || 'LAST WEEK', L.x0 + L.w / 2, L.y0 + 40, 28, 'rgba(255,255,255,0.7)', 'ui');
      K.drawLaptop(ctx, L.x0 + 120, L.y0 + 300, 0.78, { t, screen: 'chart' });
      // fuel can "refill" drops in on wasCue
      const cp = H.phase(t, tWas - 0.3, tWas + 0.2, easeOutCubic);
      if (cp > 0) {
        const fx = L.x0 + 262, fy = lerp(L.y0 + 120, L.y0 + 300, cp);
        ctx.save(); ctx.translate(fx, fy); ctx.rotate(Math.sin((t - tWas) * 5) * 0.1 * Math.exp(-(t - tWas) * 2));
        roundRect(ctx, -46, -120, 92, 120, 14); ctx.fillStyle = ACC; ctx.fill();
        roundRect(ctx, -46, -120, 92, 120, 14); ctx.lineWidth = 4; ctx.strokeStyle = K.ACCENT.shade; ctx.stroke();
        roundRect(ctx, -20, -146, 40, 30, 8); ctx.fillStyle = K.ACCENT.shade; ctx.fill();
        roundRect(ctx, 12, -156, 34, 16, 6); ctx.fillStyle = '#2a2f45'; ctx.fill();
        text('AI', 0, -58, 40, K.ACCENT.deep);
        ctx.restore();
      }
      const tp = K.popIn(t, tWas, 0.45);
      if (tp > 0) {
        text(P.was || 'AI refills', L.x0 + L.w / 2, L.y0 + 330, 40, ACC, 'display', 'center', L.w - 40) ;
        text(P.wasSub || 'Pro apps', L.x0 + L.w / 2, L.y0 + 362, 24, 'rgba(255,255,255,0.75)', 'ui');
      }
    });
    // arrow
    const ap = H.phase(t, tNow - 0.5, tNow, easeOutCubic);
    if (ap > 0) {
      ctx.save(); ctx.globalAlpha = ap; ctx.fillStyle = ACC;
      const ax = 475 + 20 * ap + Math.sin(t * 3) * 4, ay = 750;
      ctx.beginPath(); ctx.moveTo(ax - 10, ay - 16); ctx.lineTo(ax + 24, ay - 16); ctx.lineTo(ax + 24, ay - 34); ctx.lineTo(ax + 56, ay);
      ctx.lineTo(ax + 24, ay + 34); ctx.lineTo(ax + 24, ay + 16); ctx.lineTo(ax - 10, ay + 16); ctx.closePath(); ctx.fill(); ctx.restore();
    }
    // NOW card (right): phone with a meter that ticks up
    const rp = K.popIn(t, tNow - 0.1, 0.55);
    const R = { cx: 705, top: 600, w: 236, h: 360 };
    popAt(R.cx, R.top + R.h, rp, () => {
      text(P.nowWhen || 'NOW', R.cx, R.top - 46, 28, ACC, 'ui');
      const mf = 0.25 + 0.5 * smooth(clamp((t - tNow) / Math.max(1, D - tNow - 1)));
      phone(R.cx, R.top, R.w, R.h, { meterF: mf, bubbles: 2 });
    });
    const np = K.popIn(t, tNow + 0.3, 0.45);
    if (np > 0) pill(R.cx, 1048, np, P.now || 'Daily limit', { accent: true, size: 30 });
    // top pills: build + date
    const bp = K.popIn(t, tBuild - 0.2, 0.45), dp = K.popIn(t, tBuild + 0.25, 0.45);
    pill(300, 500, bp, P.build || 'Beta', { dot: true, size: 30 });
    pill(705, 500, dp, P.date || 'Today', { size: 30 });
    // chips under the LAST WEEK card area -> over the left bottom once the card has done its job
    const chips = (P.chips || ['AI assistant', 'AI features']).slice(0, 2);
    chips.forEach((c, i) => {
      const p = K.popIn(t, tChips + i * 0.45, 0.45);
      if (p <= 0) return;
      pill(295, 1000 + i * 54, p, c, { accent: i === 0, size: 28 });
    });
    return;
  }

  if (mode === 'counts') {
    K.world.room(ctx, { t, time: 'night', lamp: false, window: true, plant: true, picture: false });
    scrim(0.45);
    const items = (P.items || []).slice(0, 4);
    const tItem = items.map((it, i) => at(it.cue, 0.2 + i * 0.12) - 0.15);
    const tFree = at(P.freeCue, 0.85) - 0.6;
    const tServer = at(P.serverCue, 0.05);
    // phone (right)
    const cx = 735, top = 540, w = 236, h = 460;
    // meter value: steps per item card hit
    let mf = 0.1;
    tItem.forEach((ti) => { mf += 0.2 * H.phase(t, ti + 0.75, ti + 1.05, easeOutCubic); });
    // server pill + small cloud link above phone
    const sp = K.popIn(t, Math.max(0.05, tServer - 0.4), 0.5);
    if (sp > 0) {
      pill(cx - 20, 440, sp, P.server || 'Runs in the cloud', { size: 26, dot: true });
    }
    ctx.save(); ctx.translate(0, K.bob(t, 4, 0.35));
    phone(cx, top, w, h, { meterF: mf, bubbles: 3, meterLabel: 'TODAY' });
    ctx.restore();
    // head pill on the left
    const hp = K.popIn(t, Math.max(0.2, tItem[0] - 0.9), 0.45);
    pill(330, 498, hp, P.head || 'Counts toward the limit', { accent: true, size: 28 });
    // item cards
    items.forEach((it, i) => {
      const ti = tItem[i];
      const p = K.popIn(t, ti, 0.45);
      if (p <= 0) return;
      const x0 = 125, y0 = 545 + i * 102, cw = 455, ch = 84;
      popAt(x0 + cw / 2, y0 + ch / 2, p, () => {
        card(x0, y0, cw, ch);
        text(it.text, x0 + 30, y0 + ch / 2 + 2, 32, '#161927', 'bold', 'left', cw - 100);
        const hitP = H.phase(t, ti + 0.75, ti + 1.0);
        // little meter glyph on the card that fills once the chip lands
        roundRect(ctx, x0 + cw - 66, y0 + ch / 2 - 10, 46, 20, 10); ctx.fillStyle = '#d5dae8'; ctx.fill();
        roundRect(ctx, x0 + cw - 66, y0 + ch / 2 - 10, 46 * Math.max(0.2, hitP), 20, 10); ctx.fillStyle = mixHex(ACC, '#000000', 0.1); ctx.fill();
      });
      // chip flying to the phone meter
      const fp = H.phase(t, ti + 0.3, ti + 0.8);
      if (fp > 0 && fp < 1) {
        const pts = K.motion.bezier(x0 + cw, y0 + ch / 2, x0 + cw + 120, y0 - 120, cx - 40, top - 60, cx - 40, top + 69, 24);
        const [px, py] = K.motion.pathPoint(pts, easeOutCubic(fp));
        K.glow(ctx, px, py, 60, ACC, 0.6);
        ctx.beginPath(); ctx.arc(px, py, 16, 0, Math.PI * 2); ctx.fillStyle = ACC; ctx.fill();
      }
      // +1 flash on the meter
      const fl = clamp(1 - (t - ti - 0.8) / 0.5);
      if (t > ti + 0.8 && fl > 0) K.glow(ctx, cx, top + 69, 160, ACC, 0.45 * fl);
    });
    // the free "set a timer" card slides along the bottom, passes the phone, gets a tick
    const fp = H.phase(t, tFree, tFree + 0.9, easeOutCubic);
    if (fp > 0) {
      const x = lerp(-300, 125, fp), y0 = 960, cw = 400, ch = 78;
      card(x, y0, cw, ch, '#e9fbe0', ACC);
      // clock glyph
      ctx.beginPath(); ctx.arc(x + 54, y0 + ch / 2, 22, 0, Math.PI * 2); ctx.fillStyle = '#2a2f45'; ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      const a = t * 2;
      ctx.beginPath(); ctx.moveTo(x + 54, y0 + ch / 2); ctx.lineTo(x + 54 + Math.sin(a) * 14, y0 + ch / 2 - Math.cos(a) * 14); ctx.stroke();
      text(P.free || 'Set a timer', x + 92, y0 + ch / 2 + 2, 30, '#161927', 'bold', 'left', 200);
      const ck = K.popIn(t, tFree + 0.8, 0.4);
      if (ck > 0) check(x + cw - 40, y0 + ch / 2, ck);
      const tg = K.popIn(t, tFree + 1.0, 0.45);
      if (tg > 0) pill(cx, 1048, tg, P.freeTag || 'Still works', { accent: true, size: 28 });
    }
    return;
  }

  if (mode === 'limit') {
    K.world.room(ctx, { t, time: 'night', lamp: true, window: true, plant: false, picture: false });
    scrim(0.42);
    const tMeter = at(P.meterCue, 0.05), tDev = at(P.deviceCue, 0.25), tWarn = at(P.warnCue, 0.45);
    const tHit = at(P.hitCue, 0.6), tReset = at(P.resetCue, 0.8), tRoll = at(P.rollCue, 0.92);
    // main meter value: fill to ~0.85 by warn, 1 at hit, drain after midnight
    let f = 0.15 + 0.15 * smooth(clamp((t - tMeter) / 1.2));
    f = lerp(f, 0.86, H.phase(t, tWarn - 0.8, tWarn, easeOutCubic));
    f = lerp(f, 1, H.phase(t, tHit - 0.2, tHit + 0.15, easeOutCubic));
    const clockGo = H.phase(t, tReset - 1.2, tReset, H.easeInOutCubic);
    f = lerp(f, 0, H.phase(t, tReset, tReset + 0.9, H.easeInOutCubic));
    const hitOn = t >= tHit && t < tReset + 0.3;
    const mp = K.popIn(t, Math.min(0.1, tMeter), 0.45);
    const sh = K.shake(t, tHit, 0.5, 8);
    popAt(487, 497, mp, () => {
      ctx.save(); ctx.translate(sh, 0);
      meter(140, 480, 835, 44, f, { label: P.meterLabel || 'THIS PHONE · TODAY', labelSize: 28, right: `${Math.round(f * 100)}%` });
      ctx.restore();
    });
    // devices
    const dp = K.popIn(t, tDev - 0.2, 0.5);
    const devs = [
      { x: 235, kind: 'tablet', f: 0.42 }, { x: 487, kind: 'phone', f: null }, { x: 745, kind: 'laptop', f: 0.3 },
    ];
    // phone always present (centre); others pop on device cue
    devs.forEach((d, i) => {
      if (d.kind === 'phone') {
        const cx = 487, top = 640, w = 230, h = 350;
        const dim = hitOn ? H.phase(t, tHit, tHit + 0.3) : 0;
        phone(cx, top, w, h, { on: 1 - dim, dim, bubbles: 3 });
        if (hitOn) {
          const lp = H.phase(t, tHit + 0.05, tHit + 0.35, easeOutCubic);
          const fade = 1 - H.phase(t, tReset, tReset + 0.3);
          ctx.save(); ctx.globalAlpha = fade;
          K.drawLock(ctx, cx, lerp(top + 100, top + 250, lp), 0.85, { open: 0 });
          ctx.restore();
        }
        return;
      }
      const p = K.popIn(t, tDev - 0.2 + (i === 2 ? 0.25 : 0), 0.5);
      if (p <= 0) return;
      popAt(d.x, 990, p, () => {
        if (d.kind === 'tablet') {
          roundRect(ctx, d.x - 90, 760, 180, 230, 22); ctx.fillStyle = '#1c2033'; ctx.fill();
          roundRect(ctx, d.x - 78, 772, 156, 206, 14); ctx.fillStyle = '#121527'; ctx.fill();
          orb(d.x, 900, 34, 0.8);
          meter(d.x - 58, 796, d.x + 58, 16, d.f + 0.05 * Math.sin(t * 0.8), { glow: 0.5 });
          K.shadow(ctx, d.x, 996, 170);
        } else {
          K.drawLaptop(ctx, d.x, 995, 0.82, { t, screen: 'blank' });
          orb(d.x, 920, 26, 0.8);
          meter(d.x - 62, 885, d.x + 62, 14, d.f + 0.04 * Math.sin(t * 0.9 + 1), { glow: 0.5 });
        }
      });
    });
    pill(487, 618, dp * (1 - H.phase(t, tWarn - 0.6, tWarn - 0.3)), P.device || 'Per device', { dot: true, size: 28 });
    // warning toast over the phone
    const wp = K.popIn(t, tWarn - 0.15, 0.45) * (1 - H.phase(t, tHit - 0.2, tHit + 0.05));
    if (wp > 0) popAt(487, 590, wp, () => {
      const tw0 = 470;
      roundRect(ctx, 487 - tw0 / 2, 548, tw0, 84, 22); ctx.fillStyle = '#fff4cf'; ctx.fill();
      roundRect(ctx, 487 - tw0 / 2, 548, tw0, 84, 22); ctx.lineWidth = 4; ctx.strokeStyle = WARN; ctx.stroke();
      K.drawWarning(ctx, 487 - tw0 / 2 + 46, 612, 0.42, { pulse: 0.5 + 0.5 * Math.sin(t * 6), shadow: false });
      text(P.warn || "Almost at today's limit", 487 + 30, 591, 30, '#161927', 'bold', 'center', tw0 - 110);
    });
    // paused pill
    const pp = K.popIn(t, tHit + 0.2, 0.45) * (1 - H.phase(t, tReset - 0.1, tReset + 0.2));
    if (pp > 0) popAt(487, 595, pp, () => {
      const tw0 = 500;
      roundRect(ctx, 487 - tw0 / 2, 548, tw0, 84, 22); ctx.fillStyle = RED; ctx.fill();
      text(P.paused || 'Advanced requests paused', 487, 591, 32, '#ffffff', 'bold', 'center', tw0 - 50);
    });
    // clock + moon (appear for the reset)
    const cp = K.popIn(t, tReset - 1.4, 0.5);
    if (cp > 0) {
      popAt(770, 700, cp, () => {
        const hour = lerp(21.5, 24, clockGo);
        K.drawClock(ctx, 770, 735, 1.0, { t: 0, speed: 0, hour });
        moon(822, 604, 24);
      });
    }
    // reset pill + rollover pill
    const rp = K.popIn(t, tReset + 0.35, 0.45);
    if (rp > 0) popAt(487, 590, rp, () => {
      const tw0 = 420;
      roundRect(ctx, 487 - tw0 / 2, 548, tw0, 84, 22); ctx.fillStyle = ACC; ctx.fill();
      text(P.reset || 'Resets ~midnight', 487, 591, 34, K.ACCENT.deep, 'display', 'center', tw0 - 40);
    });
    const op = K.popIn(t, tRoll - 0.1, 0.45);
    if (op > 0) popAt(487, 1050, op, () => {
      pill(487 + 22, 1050, 1, P.roll || 'No rollover', { size: 28 });
      ctx.font = H.font('ui', 28); const tw1 = ctx.measureText(P.roll || 'No rollover').width + 40;
      cross(487 + 22 - tw1 / 2 - 34, 1025, 0.8);
    });
    return;
  }

  if (mode === 'plans') {
    K.world.room(ctx, { t, time: 'night', lamp: true, window: true, plant: true, picture: false });
    scrim(0.5);
    const tiers = (P.tiers || []).slice(0, 5);
    const n = tiers.length || 1;
    const tHead = at(P.headCue, 0.05), tPrice = at(P.priceCue, 0.85);
    const hp = K.popIn(t, Math.max(0.05, tHead - 0.2), 0.5);
    pill(487, 500, hp, P.head || 'Plan: daily AI cap', { accent: true, size: 30 });
    const vmax = Math.max(...tiers.map((x) => x.v || 1));
    const base = 925, maxH = 350, x0 = 175, x1 = 815;
    const step = n > 1 ? (x1 - x0) / (n - 1) : 0, bw = Math.min(120, step * 0.7);
    // floor line
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(80, base + 2, 840, 3);
    let prev = Math.max(0.2, tHead + 0.3);
    tiers.forEach((tr, i) => {
      const ti = tr.cue ? Math.max(prev, at(tr.cue, 0.3 + i * 0.12) + (i > 0 && tiers[i - 1].cue === tr.cue ? 0.5 : 0) - 0.2) : prev + (i ? 0.6 : 0);
      prev = ti;
      const x = x0 + i * step;
      const grow = H.phase(t, ti, ti + 0.8, easeOutCubic);
      const lab = K.popIn(t, ti, 0.4);
      if (lab > 0) popAt(x, base + 36, lab, () => text(tr.label, x, base + 36, 30, '#ffffff', 'bold', 'center', step - 6));
      if (grow <= 0) return;
      const hgt = Math.max(16, (maxH * (tr.v || 1)) / vmax) * grow;
      const top = base - hgt;
      const isTop = (tr.v || 1) === vmax;
      const col = isTop ? ACC : mixHex(ACC, '#5a6390', 0.45 - 0.35 * ((tr.v || 1) / vmax));
      if (isTop) K.glow(ctx, x, top + hgt / 2, 200, ACC, 0.25 + 0.08 * Math.sin(t * 3));
      roundRect(ctx, x - bw / 2, top, bw, hgt, 14); ctx.fillStyle = col; ctx.fill();
      ctx.save(); roundRect(ctx, x - bw / 2, top, bw, hgt, 14); ctx.clip();
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(x - bw / 2, top, bw * 0.28, hgt); ctx.restore();
      // cloud cap
      ctx.fillStyle = '#f2f4fa';
      ctx.beginPath(); ctx.arc(x - bw * 0.22, top - 4, bw * 0.2, 0, Math.PI * 2); ctx.arc(x + 4, top - 14, bw * 0.27, 0, Math.PI * 2);
      ctx.arc(x + bw * 0.26, top - 2, bw * 0.18, 0, Math.PI * 2); ctx.fill();
      roundRect(ctx, x - bw * 0.42, top - 8, bw * 0.84, 18, 9); ctx.fill();
      // multiplier
      const mp = K.popIn(t, tr.xCue ? Math.max(ti + 0.5, at(tr.xCue, 0.5) - 0.15) : ti + 0.5, 0.4);
      if (mp > 0) popAt(x, top - 60, mp, () => {
        if (isTop && P.upTo) text(P.upTo, x, top - 98, 24, 'rgba(255,255,255,0.8)', 'ui');
        text(tr.x || '', x, top - 58, isTop ? 58 : 40, isTop ? ACC : '#ffffff', 'display');
      });
    });
    // price pill under the top tier (e.g. "12 TB = $59.99/mo")
    const tp = K.popIn(t, tPrice - 0.2, 0.45);
    if (tp > 0 && P.price) pill(P.priceX || 640, 1062, tp, P.price, { accent: true, size: 30 });
    return;
  }

  // ------------------------------------------------------------------ caveat
  K.world.room(ctx, { t, time: 'night', lamp: true, window: true, plant: true, picture: false });
  scrim(0.42);
  const tUnk = at(P.unknownCue, 0.2), tShift = at(P.shiftCue, 0.55), tBeta = at(P.betaCue, 0.85);
  const cx = 640, top = 600, w = 290, h = 420;
  // wobbling end-of-limit marker
  const wob = H.phase(t, tShift - 0.2, tShift + 0.3) * (0.12 * Math.sin((t - tShift) * 2.6));
  ctx.save(); ctx.translate(0, K.bob(t, 4, 0.35));
  phone(cx, top, w, h, { bubbles: 3, meterF: 0.55 + wob, meterLabel: 'TODAY' });
  // beta tag swings on the phone corner
  const bp = H.phase(t, tBeta - 0.3, tBeta + 0.1, easeOutCubic);
  if (bp > 0) {
    const swing = Math.sin((t - tBeta) * 6) * 0.35 * Math.exp(-(t - tBeta) * 1.8);
    ctx.save(); ctx.translate(cx + w / 2 + 4, top + 40 - (1 - bp) * 200); ctx.rotate(0.25 + swing);
    ctx.strokeStyle = '#b9c1d6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 40); ctx.stroke();
    roundRect(ctx, -62, 40, 124, 64, 14); ctx.fillStyle = WARN; ctx.fill();
    text(P.beta || 'BETA', 0, 74, 36, '#161927', 'display');
    ctx.restore();
  }
  ctx.restore();
  // big "?" where the limit number would be
  const qp = K.popIn(t, tUnk - 0.1, 0.5);
  if (qp > 0) popAt(cx, top - 20, qp, () => {
    K.glow(ctx, cx, top - 30, 120, ACC, 0.35);
    ctx.save(); ctx.translate(cx, top - 30); ctx.rotate(0.08 * Math.sin(t * 2.2));
    text('?', 0, 0, 120, ACC, 'display'); ctx.restore();
  });
  K.drawPerson(ctx, 270, 1035, 1.5, { t, pose: t > tUnk ? 'shrug' : 'phone', mood: 'worried', look: 0.6, skin: 2, hair: 1, shirt: 2, hairStyle: 'curly', seed: 4 });
  const up = K.popIn(t, tUnk, 0.45), sp = K.popIn(t, tShift - 0.1, 0.45);
  pill(400, 500, up, P.unknown || 'Limit: not disclosed', { accent: true, size: 30 });
  pill(487, 1052, sp, P.shift || 'Can change', { dot: true, size: 28 });
}
