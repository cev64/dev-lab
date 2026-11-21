// Scene "lean-stack" (full frame, one beat). Night study. A dashed "paper" sheet gets a NOT YET cross stamp; on
// postCue it slides away and a big wall screen of proof code types in (file name + language pill); on checkCue a
// scan bar runs down the lines ticking each one ("computer checks each step"); on passCue a CHECK PASSES badge
// lands with a small "per ..." attribution; on stackCue a paper tower rises beside the screen while a page counter
// counts up on countCue, and a generic cartoon mathematician at its foot looks up, shocked. The kit robot watches.
// Fits: "proof / result exists only as machine-checkable code, not a human-readable paper" stories.
// params: paper, notYet, file, lang, checks, pass, passBy, pages, pagesLabel,
//         cues: notCue, postCue, langCue, checkCue, passCue, stackCue, countCue
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tNot = at(P.notCue, D * 0.1) - 0.2;
  const tPost = at(P.postCue, D * 0.2) - 0.2;
  const tLang = at(P.langCue, D * 0.25) - 0.2;
  const tCheck = at(P.checkCue, D * 0.42) - 0.3;
  const tPass = at(P.passCue, D * 0.62) - 0.2;
  const tStack = at(P.stackCue, D * 0.72) - 0.3;
  const tCount = at(P.countCue, D * 0.85) - 0.2;
  const feet = 1035;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.05, x: 470, y: 700 }, { t: tStack, zoom: 1.02, x: 450, y: 720 }, { t: tCount + 0.5, zoom: 1.0, x: 487, y: 725 }, { t: D, zoom: 1.02, x: 500, y: 720 }]);
  K.world.room(ctx, { t, time: 'night', window: false, picture: false, lamp: true, plant: false, floorY: 905 });

  // the missing paper (first ~2.5 s)
  const gone = easeOutCubic(clamp((t - tPost) / 0.6));
  if (gone < 1) {
    ctx.save(); ctx.translate(lerp(487, -300, gone), 640); ctx.rotate(-0.04 - gone * 0.4);
    ctx.setLineDash([16, 12]); ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(240,244,250,0.75)';
    H.roundRect(ctx, -150, -190, 300, 380, 12); ctx.fillStyle = 'rgba(240,244,250,0.06)'; ctx.fill(); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(240,244,250,0.85)'; ctx.font = H.font('display', 34); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(P.paper || 'PAPER'), 0, -130);
    ctx.fillStyle = 'rgba(240,244,250,0.18)'; for (let l = 0; l < 6; l++) ctx.fillRect(-110, -70 + l * 34, 220 - (l % 3) * 40, 10);
    ctx.restore();
    if (t > tNot) K.drawStamp(ctx, 487 - gone * 700, 760, 0.85, { kind: 'cross', text: P.notYet || 'NOT YET', land: (t - tNot) / 0.5 });
  }

  // wall screen with proof code
  const sk = easeOutCubic(clamp((t - tPost - 0.2) / 0.5));
  const sx = 118, sy = 440, sw = 480, sh = 360;
  if (sk > 0) {
    ctx.save(); ctx.globalAlpha = sk; ctx.translate(0, (1 - sk) * 40);
    H.roundRect(ctx, sx - 12, sy - 12, sw + 24, sh + 24, 18); ctx.fillStyle = '#2a2f45'; ctx.fill();
    H.roundRect(ctx, sx, sy, sw, sh, 10); ctx.fillStyle = '#10131f'; ctx.fill();
    // title bar
    ctx.fillStyle = '#1b2033'; H.roundRect(ctx, sx, sy, sw, 46, 10); ctx.fill();
    for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(sx + 24 + i * 22, sy + 23, 7, 0, Math.PI * 2); ctx.fillStyle = ['#ff6b5e', '#ffc14a', '#5fd38a'][i]; ctx.fill(); }
    ctx.fillStyle = '#c9cfde'; ctx.font = H.font('ui', 22); ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(String(P.file || 'proof.code'), sx + 96, sy + 24);
    // code lines typing in, with a scrolling feel
    const nL = 8, lh = 31;
    const typed = clamp((t - tPost - 0.3) / 2.2) * nL;
    const scan = clamp((t - tCheck) / 2.2);
    for (let i = 0; i < nL; i++) {
      const u = clamp(typed - i);
      if (u <= 0) continue;
      const y = sy + 72 + i * lh, ind = (H.hash(i, 3) * 3 | 0) * 22;
      let x = sx + 56 + ind;
      const nTok = 2 + (H.hash(i, 5) * 3 | 0);
      for (let j = 0; j < nTok; j++) {
        const w = (34 + H.hash(i, j + 9) * 70) * clamp(u * nTok - j);
        if (w <= 0) break;
        ctx.fillStyle = j === 0 ? H.mixHex(ACC, '#ffffff', 0.25) : (j % 2 ? 'rgba(160,200,255,0.75)' : 'rgba(255,255,255,0.6)');
        H.roundRect(ctx, x, y - 6, w, 12, 6); ctx.fill();
        x += w + 12;
      }
      // tick when the scan passes the line
      const lineScanned = scan * nL - i;
      if (lineScanned > 0) {
        const k = clamp(lineScanned * 2);
        ctx.save(); ctx.translate(sx + 30, y); ctx.scale(k, k);
        ctx.strokeStyle = ACC; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-2, 6); ctx.lineTo(9, -7); ctx.stroke(); ctx.restore();
      }
    }
    if (scan > 0 && scan < 1) {
      const yy = sy + 60 + scan * nL * lh;
      const g = ctx.createLinearGradient(0, yy - 30, 0, yy + 4); g.addColorStop(0, H.rgba(ACC, 0)); g.addColorStop(1, H.rgba(ACC, 0.35));
      ctx.fillStyle = g; ctx.fillRect(sx + 4, yy - 30, sw - 8, 34);
      ctx.fillStyle = ACC; ctx.fillRect(sx + 4, yy + 2, sw - 8, 3);
    }
    ctx.restore();
  }
  const lk = K.popIn(t, tLang, 0.4);
  if (lk > 0) pill(H, ctx, sx + sw - 100, sy - 8, lk, String(P.lang || 'proof code'), ACC, true, 26);
  const ck = K.popIn(t, tCheck + 0.2, 0.4) * (1 - smooth((t - tPass) / 0.3));
  if (ck > 0.01) pill(H, ctx, sx + sw / 2, sy + sh - 22, ck, String(P.checks || 'a computer checks each step'), ACC, false, 26);
  // pass badge
  const pk = K.popIn(t, tPass, 0.45);
  if (pk > 0) {
    ctx.save(); ctx.translate(sx + sw / 2, sy + sh / 2 + 20); ctx.scale(Math.min(1.06, pk), Math.min(1.06, pk)); ctx.rotate(-0.05);
    H.roundRect(ctx, -190, -62, 380, 124, 22); ctx.fillStyle = ACC; ctx.fill();
    ctx.beginPath(); ctx.arc(-130, -2, 32, 0, Math.PI * 2); ctx.fillStyle = '#14160a'; ctx.fill();
    ctx.strokeStyle = ACC; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(-144, -2); ctx.lineTo(-134, 9); ctx.lineTo(-115, -13); ctx.stroke();
    ctx.fillStyle = '#14160a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const f = H.fitText(ctx, String(P.pass || 'CHECK PASSES'), 'display', 36, 22, 250); ctx.font = f.font; ctx.fillText(f.text, 30, -14);
    const g = H.fitText(ctx, String(P.passBy || 'per source'), 'ui', 22, 16, 250); ctx.font = g.font; ctx.fillText(g.text, 30, 26);
    ctx.restore();
  }

  // paper tower rising beside the screen
  const tx = 778;
  const grow = easeOutCubic(clamp((t - tStack) / 2.2));
  if (grow > 0) {
    const topY = lerp(feet, 470, grow);
    K.shadow(ctx, tx, feet, 220);
    const n = Math.ceil((feet - topY) / 14);
    for (let i = 0; i < n; i++) {
      const y = feet - (i + 1) * 14;
      if (y < topY - 1) break;
      const wob = Math.sin(i * 0.7 + t * 2) * 3 * grow + (H.hash(i, 2) - 0.5) * 10;
      ctx.fillStyle = i % 2 ? '#f2f4fa' : '#dfe3ee';
      ctx.fillRect(tx - 95 + wob, y, 190, 12);
      ctx.fillStyle = 'rgba(28,32,51,0.08)'; ctx.fillRect(tx - 95 + wob, y + 10, 190, 2);
    }
    // fluttering loose pages at the top
    for (let i = 0; i < 3; i++) {
      const u = ((t - tStack) * 0.5 + i / 3) % 1;
      if (t < tStack + 0.8) break;
      ctx.save(); ctx.translate(tx + Math.sin(u * 6 + i) * 70, topY - 20 + u * 140); ctx.rotate(Math.sin(u * 8 + i) * 0.8);
      ctx.globalAlpha = 1 - u; ctx.fillStyle = '#f2f4fa'; ctx.fillRect(-22, -14, 44, 28); ctx.restore();
    }
  }
  // characters
  const shocked = t > tCount;
  K.drawPerson(ctx, 655, feet, 1.12, { t, pose: shocked ? 'shrug' : 'stand', mood: shocked ? 'shocked' : 'neutral', look: 0.6, skin: 2, hair: 1, shirt: 2, hairStyle: 'short', seed: 5 });
  K.drawRobot(ctx, 300, feet, 1.05, { t, state: t > tPass ? 'happy' : (t > tCheck ? 'working' : 'thinking'), seed: 4 });
  ctx.restore();

  // page counter (screen space, above the tower)
  const nk = K.popIn(t, tCount, 0.45);
  if (nk > 0) {
    const target = parseInt(String(P.pages || '10000').replace(/[^0-9]/g, ''), 10) || 0;
    const cur = Math.round(target * easeOutCubic(clamp((t - tCount) / 1.1)));
    ctx.save(); ctx.translate(tx - 20, 545); ctx.scale(Math.min(1.05, nk), Math.min(1.05, nk));
    H.roundRect(ctx, -165, -62, 330, 124, 20); ctx.fillStyle = 'rgba(10,12,24,0.94)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = ACC; ctx.stroke();
    ctx.fillStyle = ACC; ctx.font = H.font('display', 52); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(cur.toLocaleString('en-US') + (cur >= target ? '+' : ''), 0, -14);
    ctx.fillStyle = '#ffffff'; ctx.font = H.font('ui', 24); ctx.fillText(String(P.pagesLabel || 'pages'), 0, 36);
    ctx.restore();
  }
}

function pill(H, ctx, x, y, k, text, ACC, solid, size = 32) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  const f = H.fitText(ctx, text, 'ui', size, 18, 460); ctx.font = f.font;
  const w = ctx.measureText(f.text).width + 52, h = size * 1.8;
  H.roundRect(ctx, -w / 2, -h / 2, w, h, h / 2); ctx.fillStyle = solid ? ACC : 'rgba(10,12,24,0.92)'; ctx.fill();
  if (!solid) { ctx.lineWidth = 2.5; ctx.strokeStyle = ACC; ctx.stroke(); }
  ctx.fillStyle = solid ? '#14160a' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
  ctx.restore();
}
