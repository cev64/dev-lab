// Scene "outside-look" (full frame, 1 beat). Office split by a frosted glass wall: on the left, ordinary people
// with phones and "?" bubbles; on the right, behind the frost, an AI robot on a test bench with gauges and a rack.
// A pill on the glass says what is hidden ("Not shared in public"). On lookCue an inspector (badge + magnifier)
// steps up to the glass and the magnifier lens shows the robot clearly ("Outside look" pill); on sayCue a report
// sheet arcs over the wall to the people, who cheer, with a "What they find" pill.
// Fits: why independent checks matter / "you can't see inside an AI company" / transparency explainers.
// params: wall ("Not shared in public"), look ("Outside look"), report ("What they find"), wallCue, lookCue, sayCue
// Defaults are generic (no company names). Library copy of the 2026-10-16 AI-inspectors story scene.
export default function draw(ctx, t, info) {
  const H = info.helpers, K = H.kit, P = info.params || {}, D = info.duration, ACC = info.accent;
  const { clamp, lerp, smooth, easeOutCubic } = H;
  const at = (w, d) => { const v = w ? info.timeOf(w) : null; return v == null ? d : v; };
  const tWall = at(P.wallCue, 2.3) - 0.3;
  const tLook = at(P.lookCue, D * 0.6) - 1.2;
  const tSay = at(P.sayCue, D * 0.85) - 0.3;
  const feet = 1035, GX = 520;

  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1.04, x: 487, y: 750 }, { t: tLook, zoom: 1.0, x: 487, y: 730 }, { t: tSay, zoom: 1.06, x: 560, y: 760 }, { t: D, zoom: 1.02, x: 487, y: 740 }]);
  K.world.office(ctx, { t, time: 'day' });

  const behind = () => {
    // test bench with the robot and gauges (right side)
    H.roundRect(ctx, 600, 930, 300, 26, 8); ctx.fillStyle = '#3b4260'; ctx.fill();
    ctx.fillStyle = '#2a2f45'; ctx.fillRect(620, 956, 16, 80); ctx.fillRect(864, 956, 16, 80);
    K.drawRobot(ctx, 700, 930, 0.95, { t, state: 'working', seed: 4 });
    K.drawServerRack(ctx, 850, 930, 0.75, { t, activity: 0.9 });
    // gauge dial
    ctx.save(); ctx.translate(800, 620);
    ctx.beginPath(); ctx.arc(0, 0, 46, Math.PI, 0); ctx.fillStyle = '#e9edf7'; ctx.fill();
    ctx.strokeStyle = '#ff6b5e'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, 0, 38, Math.PI * 1.7, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = ACC; ctx.beginPath(); ctx.arc(0, 0, 38, Math.PI, Math.PI * 1.4); ctx.stroke();
    ctx.rotate(-Math.PI / 2 + Math.sin(t * 1.3) * 0.7); ctx.strokeStyle = '#161927'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -32); ctx.stroke(); ctx.restore();
  };
  behind();
  // frosted glass over the right side
  const frost = 0.78;
  ctx.save();
  ctx.fillStyle = `rgba(205,215,240,${frost})`; ctx.fillRect(GX, 470, 1080 - GX, feet - 470 + 5);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 10;
  for (let i = 0; i < 6; i++) { const x = GX + 40 + i * 95; ctx.beginPath(); ctx.moveTo(x, 490); ctx.lineTo(x + 70, 560); ctx.stroke(); }
  ctx.fillStyle = '#5b6380'; ctx.fillRect(GX - 8, 462, 16, feet - 462 + 5); ctx.fillRect(GX, 462, 1080 - GX, 12);
  ctx.restore();

  // public on the left
  const cheer = t > tSay + 0.7;
  const ppl = [{ x: 110, sk: 2, hr: 1, sh: 2, hs: 'long', seed: 3 }, { x: 255, sk: 4, hr: 0, sh: 0, hs: 'short', seed: 8 }];
  ppl.forEach((p, i) => {
    K.drawPerson(ctx, p.x, feet, 1.12, { t, pose: cheer ? 'cheer' : (i ? 'shrug' : 'phone'), mood: cheer ? 'happy' : 'neutral', look: 0.6, skin: p.sk, hair: p.hr, shirt: p.sh, hairStyle: p.hs, seed: p.seed });
    if (!cheer && t > 0.4) {
      const k = K.popIn(t, 0.4 + i * 0.35, 0.35) * (1 - smooth((t - tLook) / 0.4));
      if (k > 0.02) {
        ctx.save(); ctx.translate(p.x + 30, feet - 320 + K.bob(t, 4, 0.8, i)); ctx.scale(k, k);
        ctx.beginPath(); ctx.arc(0, 0, 30, 0, Math.PI * 2); ctx.fillStyle = '#ffffff'; ctx.fill();
        ctx.font = H.font('display', 38); ctx.fillStyle = '#161927'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('?', 0, 3);
        ctx.restore();
      }
    }
  });

  // inspector walks up to the glass with a magnifier
  const wk = clamp((t - tLook) / 1.0);
  if (t > tLook - 0.6) {
    const ix = lerp(-80, 420, easeOutCubic(wk));
    K.drawPerson(ctx, ix, feet, 1.15, { t, walk: wk < 1 ? t : undefined, pose: wk >= 1 ? 'point' : 'stand', shirt: '#4fb3a6', skin: 1, hair: 0, hairStyle: 'bun', mood: 'happy', seed: 2 });
    // badge
    ctx.save(); ctx.translate(ix, feet); ctx.scale(1.15, 1.15);
    ctx.strokeStyle = ACC; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-9, -170); ctx.lineTo(0, -138); ctx.lineTo(9, -170); ctx.stroke();
    H.roundRect(ctx, -12, -140, 24, 30, 4); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.fillStyle = ACC; ctx.fillRect(-12, -140, 24, 9);
    ctx.restore();
  }
  // magnifier lens reveals the robot through the frost
  const lens = smooth((t - tLook - 0.8) / 0.5);
  if (lens > 0) {
    const lx = lerp(560, 700, smooth((t - tLook - 0.8) / 1.2)), ly = 790 + Math.sin(t * 1.2) * 8, R = 150 * lens;
    ctx.save(); ctx.beginPath(); ctx.arc(lx, ly, R, 0, Math.PI * 2); ctx.clip();
    K.world.office(ctx, { t, time: 'day' });
    behind();
    ctx.restore();
    ctx.save(); ctx.lineWidth = 14; ctx.strokeStyle = '#2a2f45'; ctx.beginPath(); ctx.arc(lx, ly, R, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 5; ctx.strokeStyle = ACC; ctx.beginPath(); ctx.arc(lx, ly, Math.max(1, R - 9), 0, Math.PI * 2); ctx.stroke();
    // handle back to the inspector's hand
    ctx.strokeStyle = '#764d31'; ctx.lineWidth = 18; ctx.lineCap = 'round';
    const a = Math.atan2(ly - 845, lx - 520);
    ctx.beginPath(); ctx.moveTo(lx - Math.cos(a) * R, ly - Math.sin(a) * R); ctx.lineTo(lx - Math.cos(a) * (R + 70 * lens), ly - Math.sin(a) * (R + 70 * lens)); ctx.stroke();
    ctx.restore();
  }

  // report sheet arcs over the wall to the people
  const u = clamp((t - tSay) / 0.9);
  if (u > 0) {
    const x = lerp(640, 190, easeOutCubic(u)), y = lerp(640, 760, u) - Math.sin(u * Math.PI) * 220;
    ctx.save(); ctx.translate(x, y); ctx.rotate((1 - u) * -0.8); const s = 0.8 + 0.3 * u; ctx.scale(s, s);
    K.glow(ctx, 0, 0, 120, ACC, 0.35);
    H.roundRect(ctx, -55, -70, 110, 140, 8); ctx.fillStyle = '#f2f4fa'; ctx.fill();
    ctx.fillStyle = ACC; ctx.fillRect(-40, -54, 60, 10);
    ctx.fillStyle = '#c3c9da'; for (let j = 0; j < 6; j++) ctx.fillRect(-40, -30 + j * 15, 80 - (j === 5 ? 34 : 0), 6);
    ctx.restore();
  }
  ctx.restore();

  // pills (screen space)
  pill(H, ctx, 690, 430, K.popIn(t, tWall, 0.4) * (1 - smooth((t - tLook - 0.6) / 0.3)), P.wall || 'Not shared in public', ACC, false);
  pill(H, ctx, 700, 430, K.popIn(t, tLook + 0.9, 0.4) * (1 - smooth((t - tSay) / 0.3)), P.look || 'Outside look', ACC, true);
  pill(H, ctx, 487, 430, K.popIn(t, tSay + 0.4, 0.4), P.report || 'What they find', ACC, true);
}

function pill(H, ctx, x, y, k, text, ACC, solid) {
  if (k <= 0.01) return;
  ctx.save(); ctx.translate(x, y + 30); ctx.scale(Math.min(1.05, k), Math.min(1.05, k));
  const f = H.fitText(ctx, text, 'ui', 32, 22, 520); ctx.font = f.font;
  const w = ctx.measureText(f.text).width + 56;
  H.roundRect(ctx, -w / 2, -29, w, 58, 29); ctx.fillStyle = solid ? ACC : 'rgba(10,12,24,0.92)'; ctx.fill();
  if (!solid) { ctx.lineWidth = 2.5; ctx.strokeStyle = ACC; ctx.stroke(); }
  ctx.fillStyle = solid ? '#14160a' : '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(f.text, 0, 2);
  ctx.restore();
}
