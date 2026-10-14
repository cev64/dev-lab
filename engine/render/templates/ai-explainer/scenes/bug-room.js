// Scene "bug-room" (full frame). A generic executive meeting room: wall TV, long table, empty chairs.
// mode "find" (default, works well as a 2-beat span from the hook): the room sits dim with a tiny blinking light at
//   the TV's corner; a date pill pops; a cartoon security officer walks in sweeping a scanner wand whose signal rings
//   grow near the TV; an inset "Behind the TV" bubble shows a lump plugged into the TV's USB port with a blinking LED;
//   the TV screen shows the room name; the lump is revealed as wrapped toilet paper (roll icon + pill).
// mode "payoff": same room at night; the device sits in an evidence bag on the table with a swinging price tag; a robot
//   (the AI) scans behind the TV with a light beam; pills, then a question card.
// Fits: hidden devices, office security, bugging / surveillance, "found behind the TV".
// params: find:   date ("Sept. 30"), team ("Security team"), room ("EXECUTIVE|MEETING ROOM"), port ("USB port, back of the TV"),
//                 wrap ("Hidden in toilet paper"), wrapBy ("per the complaint"), inset ("Behind the TV")
//                 cues: dateCue ("thirtieth"), teamCue ("security"), portCue ("plugged"), roomCue ("executive"), wrapCue ("toilet")
//         payoff: price ("$14"), bugLabel ("$14 bug"), traced ("Traced with help from AI"), question ("Would your office check behind the TV?")
//                 cues: bugCue ("fourteendollar"), tracedCue ("traced"), qCue ("would")
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, roundRect, rgba } = H;
  const TAU = Math.PI * 2;
  const mode = P.mode || 'find';
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const rr = (x, y, w, h, r, fill) => { roundRect(ctx, x, y, w, h, r); ctx.fillStyle = fill; ctx.fill(); };
  const circle = (x, y, r, fill) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fillStyle = fill; ctx.fill(); };
  const pill = (x, y, k, text, o = {}) => { if (k > 0) K.drawLabel(ctx, x, y, Math.min(1.08, k), Object.assign({ text, size: o.size || 30 }, o)); };
  const RED = '#ff5a52';

  // ---------------------------------------------------------------- set
  const night = mode === 'payoff';
  K.camera(ctx, t, mode === 'find'
    ? [{ t: 0, zoom: 1.06, x: 487, y: 700 }, { t: 2.4, zoom: 1.0 }, { t: D, zoom: 1.03, x: 487, y: 720 }]
    : [{ t: 0, zoom: 1.0 }, { t: D, zoom: 1.05, x: 487, y: 700 }]);
  K.world.room(ctx, { t, time: night ? 'night' : 'dusk', floorY: 900, window: false, picture: false, lamp: false, plant: false, wall: night ? '#1f2544' : '#283157' });
  // wall panels
  for (let i = 0; i < 6; i++) rr(30 + i * 172, 400, 150, 470, 10, night ? '#232a4c' : '#2c365f');
  // ceiling light strip
  rr(160, 360, 660, 14, 7, night ? '#39406a' : '#e9ecf6');
  if (!night) K.glow(ctx, 487, 380, 260, '#ffffff', 0.08);

  // TV
  const TV = { x: 317, y: 480, w: 340, h: 210 };
  K.shadow(ctx, 487, TV.y + TV.h + 18, 300, 0.25);
  rr(TV.x - 10, TV.y - 10, TV.w + 20, TV.h + 20, 14, '#0c0e1a');
  const screenOn = mode === 'payoff' ? 1 : smooth((t - at(P.roomCue || 'executive', D * 0.7) + 0.3) / 0.5);
  rr(TV.x, TV.y, TV.w, TV.h, 8, H.mixHex('#121527', '#22305e', screenOn));
  ctx.save(); ctx.globalAlpha = 0.12; ctx.beginPath(); ctx.moveTo(TV.x + 30, TV.y); ctx.lineTo(TV.x + 130, TV.y); ctx.lineTo(TV.x + 60, TV.y + TV.h); ctx.lineTo(TV.x - 40 + 30, TV.y + TV.h); ctx.closePath(); ctx.clip(); rr(TV.x, TV.y, TV.w, TV.h, 8, '#ffffff'); ctx.restore();
  if (screenOn > 0) {
    ctx.save(); ctx.globalAlpha = screenOn; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lines = String(P.room || 'EXECUTIVE|MEETING ROOM').split('|');
    lines.forEach((ln, i) => {
      const f = H.fitText(ctx, ln, 'display', 40, 24, TV.w - 50);
      ctx.font = f.font; ctx.fillStyle = i === 0 ? ACC : '#ffffff';
      ctx.fillText(f.text, 487, TV.y + TV.h / 2 + (i - (lines.length - 1) / 2) * 52);
    });
    K.glow(ctx, 487, TV.y + TV.h / 2, 260, '#6d86ff', 0.12 * screenOn);
    ctx.restore();
  }
  // the lump peeking out at the TV's lower right corner
  const lumpX = TV.x + TV.w + 4, lumpY = TV.y + TV.h - 6;
  const showLump = mode === 'find';
  if (showLump) {
    circle(lumpX, lumpY, 13, '#e9e4d8'); circle(lumpX + 8, lumpY - 9, 10, '#f4f1ea');
    const blink = (Math.floor(t * 2) % 2 === 0) ? 1 : 0.2;
    circle(lumpX + 5, lumpY + 2, 4.5, rgba(RED, blink));
    if (blink > 0.5) K.glow(ctx, lumpX + 5, lumpY + 2, 30, RED, 0.6);
  }

  // table + chairs
  const chairXs = [210, 350, 490, 630, 770];
  chairXs.forEach((cx) => { rr(cx - 46, 760, 92, 120, 22, '#3a3f5f'); rr(cx - 40, 768, 80, 100, 18, '#454b70'); });
  K.shadow(ctx, 490, 1000, 820, 0.35);
  rr(110, 860, 760, 34, 14, '#6b4a36'); rr(110, 860, 760, 10, 6, '#7d5841');
  rr(150, 894, 26, 120, 8, '#4f3628'); rr(804, 894, 26, 120, 8, '#4f3628');
  // notepads / glasses on the table
  for (const nx of [230, 470, 700]) { rr(nx - 34, 846, 68, 14, 3, '#e8ebf3'); rr(nx + 46, 826, 16, 32, 5, 'rgba(200,220,255,0.35)'); }
  K.props.plant(ctx, 960, 1010, 1.1);

  if (mode === 'find') {
    const tDate = at(P.dateCue || 'thirtieth', D * 0.2) - 0.35;
    const tTeam = at(P.teamCue || 'security', D * 0.33) - 0.6;
    const tPort = at(P.portCue || 'plugged', D * 0.5) - 0.2;
    const tWrap = at(P.wrapCue || 'toilet', D * 0.88) - 0.2;
    // security officer walks in from the left to under the TV's right corner
    const walkDur = 2.4, x0 = -90, x1 = 760;
    const wk = clamp((t - tTeam) / walkDur);
    const px = lerp(x0, x1, H.easeInOutCubic(wk));
    const walking = t > tTeam && wk < 1;
    if (t > tTeam - 0.1) {
      const sc = 1.45;
      K.drawPerson(ctx, px, 1035, sc, { t, pose: walking ? 'stand' : 'point', walk: walking ? t - tTeam : null, skin: 2, hair: 0, hairStyle: 'short', shirt: '#2d3a66', mood: wk >= 1 && t > tPort ? 'shocked' : 'neutral', seed: 4, look: -0.3 });
      // scanner wand in the right hand (pointing up-left to the TV corner when standing)
      const hx = walking ? px + 34 * sc : px + 98 * sc, hy = walking ? 1035 - 100 * sc : 1035 - 176 * sc;
      const near = clamp(1 - Math.abs(px - x1) / 600);
      ctx.save(); ctx.translate(hx, hy); ctx.rotate(walking ? 0.2 : -0.5);
      rr(-8, -6, 16, 60, 6, '#1b1e30'); rr(-14, -48, 28, 46, 10, '#2f3550');
      circle(0, -38, 8, rgba(ACC, 0.4 + 0.6 * near * (0.5 + 0.5 * Math.sin(t * 18))));
      ctx.restore();
      // signal rings from the wand tip, faster / brighter when close
      const tipX = hx + (walking ? 8 : -18), tipY = hy - 40;
      for (let i = 0; i < 3; i++) {
        const ph = ((t * (1 + 2 * near)) + i / 3) % 1;
        ctx.strokeStyle = rgba(ACC, (1 - ph) * (0.25 + 0.6 * near)); ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(tipX, tipY, 16 + ph * 70, 0, TAU); ctx.stroke();
      }
      pill(px, 640, K.popIn(t, tTeam + 0.4) * (1 - smooth((t - tPort - 0.2) / 0.3)), P.team || 'Security team', { size: 26, dot: true });
    }
    // date pill
    pill(220, 470, K.popIn(t, tDate), P.date || 'Sept. 30', { accent: true, size: 34 });

    // inset: behind the TV
    const ik = K.popIn(t, tPort, 0.5);
    if (ik > 0) {
      const cx = 240, cy = 800, R = 150;
      // connector line from the TV corner to the bubble
      ctx.save(); ctx.globalAlpha = clamp(ik);
      ctx.strokeStyle = rgba(ACC, 0.8); ctx.lineWidth = 4; ctx.setLineDash([6, 10]);
      ctx.beginPath(); ctx.moveTo(lumpX, lumpY); ctx.lineTo(cx + R * 0.7, cy - R * 0.7); ctx.stroke(); ctx.setLineDash([]);
      circle(lumpX, lumpY, 22, 'rgba(0,0,0,0)'); ctx.lineWidth = 4; ctx.strokeStyle = ACC; ctx.beginPath(); ctx.arc(lumpX + 4, lumpY - 2, 26, 0, TAU); ctx.stroke();
      ctx.restore();
      ctx.save(); ctx.translate(cx, cy); ctx.scale(ik, ik);
      circle(0, 0, R + 10, ACC);
      ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.clip();
      rr(-R, -R, 2 * R, 2 * R, 0, '#20243a');
      // TV back panel with vents and a port strip
      rr(-R, -R, 2 * R - 40, 2 * R, 0, '#2c3150');
      for (let i = 0; i < 6; i++) rr(-R + 30, -R + 30 + i * 20, 150, 8, 4, '#232740');
      rr(30, -40, 36, 150, 8, '#1a1d30');
      rr(36, 20, 24, 14, 3, '#0a0b14'); rr(36, 60, 24, 14, 3, '#0a0b14');
      // the device in the USB port: small board + paper wrap
      const wrapK = clamp((t - tWrap) / 0.6);
      const bx = 64, by = -8;
      rr(bx - 30, by + 18, 34, 18, 4, '#c8ccd6');           // plug in the port
      rr(bx - 12, by - 10, 70, 56, 6, '#1f6a5f');             // tiny board
      rr(bx + 8, by + 2, 26, 22, 3, '#c9ced8');
      // toilet paper wad over the board
      const wad = [[bx + 30, by + 14, 46], [bx + 4, by - 6, 36], [bx + 52, by - 10, 32], [bx + 30, by + 46, 34], [bx + 62, by + 30, 30]];
      wad.forEach(([x, y, r], i) => { circle(x, y, r, i % 2 ? '#ece7db' : '#f6f3ec'); });
      ctx.strokeStyle = 'rgba(160,150,130,0.35)'; ctx.lineWidth = 2;
      for (let i = 0; i < 9; i++) { const a = i * 0.7; ctx.beginPath(); ctx.arc(bx + 30 + Math.cos(a) * 30, by + 14 + Math.sin(a) * 26, 3, 0, TAU); ctx.stroke(); }
      const blink = (Math.floor(t * 2) % 2 === 0) ? 1 : 0.25;
      circle(bx + 40, by + 4, 9, rgba(RED, blink)); if (blink > 0.5) K.glow(ctx, bx + 40, by + 4, 50, RED, 0.7);
      // wrap highlight pulse on the cue
      if (wrapK > 0) { ctx.strokeStyle = rgba(ACC, 0.9 * (1 - 0.5 * wrapK)); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(bx + 32, by + 16, 70 + 8 * Math.sin(t * 5), 0, TAU); ctx.stroke(); }
      ctx.restore();
      pill(cx - 35, cy - R - 8, ik, P.inset || 'Behind the TV', { size: 26, dot: true });
      // port pill (until the wrap cue)
      pill(270, 1010, K.popIn(t, tPort + 0.9) * (1 - smooth((t - tWrap + 0.1) / 0.3)), P.port || 'Plugged into a USB port', { size: 26 });
    }
    // wrap: toilet roll icon + pill
    const wk2 = K.popIn(t, tWrap, 0.45);
    if (wk2 > 0) {
      ctx.save(); ctx.translate(560, 860); ctx.scale(wk2 * 0.8, wk2 * 0.8);
      K.shadow(ctx, 0, 6, 110);
      rr(-46, -96, 92, 96, 10, '#f4f1ea'); rr(10, -96, 36, 96, 10, '#e2ddd0');
      ctx.save(); ctx.translate(0, -96); ctx.scale(1, 0.32); circle(0, 0, 46, '#fbfaf6'); circle(0, 0, 16, '#b9a888'); ctx.restore();
      ctx.restore();
      pill(270, 1010, wk2, P.wrap || 'Hidden in toilet paper', { accent: true, size: 28 });
      pill(565, 1010, K.popIn(t, tWrap + 0.5), P.wrapBy || 'per the complaint', { size: 24 });
    }
  } else {
    // payoff
    const tBug = at(P.bugCue || 'fourteendollar', 0.1), tTr = at(P.tracedCue || 'traced', D * 0.35), tQ = at(P.qCue || 'would', D * 0.65);
    // evidence bag on the table with the board and a price tag
    const ek = K.popIn(t, Math.max(0.05, tBug - 0.2), 0.5);
    if (ek > 0) {
      ctx.save(); ctx.translate(300, 860); ctx.scale(ek * 1.25, ek * 1.25);
      rr(-90, -150, 180, 150, 14, 'rgba(210,225,255,0.22)');
      ctx.strokeStyle = 'rgba(220,230,255,0.55)'; ctx.lineWidth = 3; roundRect(ctx, -90, -150, 180, 150, 14); ctx.stroke();
      rr(-90, -150, 180, 26, 8, RED); ctx.fillStyle = '#fff'; ctx.font = H.font('ui', 18); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('EVIDENCE', 0, -136);
      rr(-50, -96, 100, 70, 8, '#1f6a5f'); rr(-20, -82, 40, 32, 4, '#c9ced8'); rr(-68, -74, 22, 24, 4, '#c8ccd6');
      const blink = (Math.floor(t * 2) % 2 === 0) ? 1 : 0.3; circle(32, -40, 7, rgba(ACC, blink));
      ctx.restore();
      // tag swinging from the bag corner
      const sw = Math.sin(t * 2.4) * 0.12 * Math.exp(-Math.max(0, t - tBug) * 0.25);
      ctx.save(); ctx.translate(412, 700); ctx.rotate(sw);
      ctx.strokeStyle = '#d9d4cc'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(30, 40); ctx.stroke();
      ctx.translate(30, 40); ctx.scale(ek, ek);
      rr(-10, 0, 150, 76, 14, ACC); circle(6, 38, 7, '#1f2544');
      ctx.fillStyle = K.ACCENT.deep; ctx.font = H.font('display', 44); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(P.price || '$14', 76, 40);
      ctx.restore();
    }
    // robot scans behind the TV
    const rk = K.popIn(t, Math.max(0.2, tTr - 0.6), 0.5);
    const rx = 770, ry = 1030;
    K.drawRobot(ctx, rx, ry, 1.35 * Math.max(0.001, Math.min(1, rk)), { t, state: t > tQ ? 'thinking' : 'working', seed: 5, flip: true });
    if (rk > 0.9) {
      const sweep = 0.5 + 0.5 * Math.sin(t * 2.2);
      const ex = rx - 30, ey = ry - 1.35 * 165;
      const tx = TV.x + TV.w + 6, ty = TV.y + 30 + sweep * (TV.h - 40);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(ex, ey, tx, ty); g.addColorStop(0, rgba(ACC, 0.5)); g.addColorStop(1, rgba(ACC, 0.05));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(ex, ey - 6); ctx.lineTo(tx, ty - 40); ctx.lineTo(tx, ty + 40); ctx.lineTo(ex, ey + 6); ctx.closePath(); ctx.fill();
      ctx.restore();
      K.glow(ctx, tx, ty, 60, ACC, 0.5);
    }
    pill(300, 470, K.popIn(t, tBug + 0.3) * (1 - smooth((t - tQ + 0.2) / 0.3)), P.bugLabel || 'A $14 bug', { accent: true, size: 32 });
    pill(487, 1010, K.popIn(t, tTr) * (1 - smooth((t - tQ + 0.2) / 0.3)), P.traced || 'Traced with help from AI', { size: 26, dot: true });
    // question card
    const qk = K.popIn(t, tQ, 0.5);
    if (qk > 0) {
      ctx.save(); ctx.translate(487, 600); ctx.scale(qk, qk);
      rr(-400, -110, 800, 220, 30, 'rgba(8,10,24,0.94)');
      ctx.lineWidth = 4; ctx.strokeStyle = ACC; roundRect(ctx, -400, -110, 800, 220, 30); ctx.stroke();
      const q = P.question || 'Would your office check behind the TV?';
      const lines = H.wrap(ctx, q, 'display', 50, 700);
      ctx.font = H.font('display', 50); ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      lines.forEach((ln, i) => ctx.fillText(ln, 0, (i - (lines.length - 1) / 2) * 62));
      ctx.restore();
    }
  }
}
