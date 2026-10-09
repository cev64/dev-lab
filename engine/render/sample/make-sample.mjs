#!/usr/bin/env node
// Builds the renderer's test fixture: sample/clip.json + sample/audio.ogg.
// The audio is synthetic "speech-like" voiced babble (harmonic buzz with moving formants and
// consonant noise bursts) timed to a fictional transcript, so captions, pauses and the
// loudness envelope all line up the way a real clip would. Fully deterministic (seeded).
//
//   node sample/make-sample.mjs            (from engine/render/)
import { writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SR = 48000;
const FPS = 30;
const DURATION = 66.0;

const SCRIPT = `So here's the thing most people miss about AI agents. Everyone is watching the chatbots,
the demos, the benchmarks. But the real shift is quieter. It's when the model stops answering questions
and starts finishing tasks. Booking the flight. Fixing the bug. Reconciling the spreadsheet at two in the
morning. And the cost of that is collapsing. Compute that cost a dollar last year costs a few cents now.
So within three years, I think the default for a lot of office work is: you describe the outcome, and an
agent does the first draft of the whole job. Not perfectly. You still check it. But checking is a very
different job than doing. And that's the part nobody is ready for. The bottleneck stops being skill and
starts being judgment. Knowing what good looks like. Knowing when the machine is confidently wrong.
Honestly, that's the skill I'd be building right now, whatever field you're in. Because the tools keep
getting better every single quarter, and the people who learn to direct them will move ten times faster.`;

function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20261009);

// ---- word timings -------------------------------------------------------------------------
const tokens = SCRIPT.split(/\s+/).filter(Boolean);
const raw = [];
let t = 0.08;
for (const w of tokens) {
  const letters = w.replace(/[^A-Za-z0-9]/g, '').length;
  const dur = 0.11 + 0.052 * letters + rnd() * 0.06;
  raw.push({ w, s: t, e: t + dur });
  let gap = 0.03 + rnd() * 0.05;
  if (/[,:]$/.test(w)) gap += 0.18 + rnd() * 0.08;
  if (/[.!?]$/.test(w)) gap += 0.34 + rnd() * 0.2;
  if (w === 'quieter.' || w === 'doing.') gap += 0.45; // a couple of dramatic pauses
  t += dur + gap;
}
const scale = (DURATION - 0.5) / raw[raw.length - 1].e;
const words = raw.map((x) => ({ w: x.w, s: +(x.s * scale).toFixed(3), e: +(x.e * scale).toFixed(3) }));

// ---- synthesis ----------------------------------------------------------------------------
const N = Math.round(DURATION * SR);
const out = new Float32Array(N);
let phase = 0;
let noiseState = 0;
for (let wi = 0; wi < words.length; wi++) {
  const { w, s, e } = words[wi];
  const letters = Math.max(1, w.replace(/[^A-Za-z0-9]/g, '').length);
  const nSyl = Math.max(1, Math.round(letters / 3.2));
  const sylDur = (e - s) / nSyl;
  const stress = /[A-Z]/.test(w[0]) || letters > 7 ? 1.0 : 0.8;
  for (let k = 0; k < nSyl; k++) {
    const a = s + k * sylDur;
    const f1 = 450 + rnd() * 400, f2 = 1100 + rnd() * 1000;
    const amp = (0.55 + rnd() * 0.45) * stress * (k === 0 ? 1 : 0.85);
    const i0 = Math.floor(a * SR), i1 = Math.min(N, Math.floor((a + sylDur) * SR));
    const f0base = 112 + 22 * Math.sin(wi * 0.37) + rnd() * 10;
    // consonant burst
    const burst = Math.floor(0.025 * SR);
    for (let i = i0; i < Math.min(i1, i0 + burst); i++) {
      noiseState = (noiseState * 1103515245 + 12345) >>> 0;
      const n = (noiseState / 4294967296) * 2 - 1;
      out[i] += n * 0.08 * amp * (1 - (i - i0) / burst);
    }
    for (let i = i0; i < i1; i++) {
      const u = (i - i0) / Math.max(1, i1 - i0);
      const env = Math.min(1, u / 0.12) * Math.min(1, (1 - u) / 0.25) * amp;
      const f0 = f0base * (1 + 0.04 * Math.sin(2 * Math.PI * 5.2 * (i / SR))) * (1.06 - 0.12 * u);
      phase += (2 * Math.PI * f0) / SR;
      let v = 0;
      for (let h = 1; h <= 14; h++) {
        const fh = f0 * h;
        const g = 1 / h * (1 + 2.2 * Math.exp(-(((fh - f1) / 160) ** 2)) + 1.6 * Math.exp(-(((fh - f2) / 260) ** 2)));
        v += g * Math.sin(phase * h);
      }
      out[i] += v * 0.11 * env;
    }
  }
}
// light room tone so silence is not digital zero
for (let i = 0; i < N; i++) {
  noiseState = (noiseState * 1103515245 + 12345) >>> 0;
  out[i] += ((noiseState / 4294967296) * 2 - 1) * 0.002;
}
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(out[i]));
const gain = 0.89 / peak;

// ---- envelope (same method as render.mjs computeEnvelope) -----------------------------------
const hop = SR / FPS;
const frames = Math.ceil(DURATION * FPS);
const db = [];
for (let f = 0; f < frames; f++) {
  let acc = 0, c = 0;
  for (let i = Math.floor(f * hop); i < Math.min(N, Math.floor((f + 1) * hop)); i++) { acc += (out[i] * gain) ** 2; c++; }
  db.push(20 * Math.log10(Math.sqrt(acc / Math.max(1, c)) + 1e-9));
}
const sorted = [...db].sort((a, b) => a - b);
const hi = sorted[Math.floor(sorted.length * 0.97)];
const envelope = db.map((d) => +Math.max(0, Math.min(1, (d - (hi - 36)) / 36)).toFixed(3));

// ---- write --------------------------------------------------------------------------------
const tmp = mkdtempSync(join(tmpdir(), 'sample-'));
const wav = join(tmp, 'audio.wav');
const buf = Buffer.alloc(44 + N * 2);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 2, 4); buf.write('WAVE', 8);
buf.write('fmt ', 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 2, 40);
for (let i = 0; i < N; i++) buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, out[i] * gain)) * 32767), 44 + i * 2);
writeFileSync(wav, buf);
const r = spawnSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-i', wav, '-c:a', 'libopus', '-b:a', '40k', join(HERE, 'audio.ogg')]);
rmSync(tmp, { recursive: true, force: true });
if (r.status !== 0) throw new Error('ffmpeg failed: ' + r.stderr);

const clip = {
  id: 'sample-ai-agents',
  fps: FPS,
  duration: DURATION,
  audio: 'audio.ogg',
  envelope,
  words,
  hook: 'AI agents will do your busywork within 3 years',
  topic: 'AI Agents',
  credit: { show: 'The Signal Room (sample)', episode: '#88 - Agents, Compute and Work', speakers: 'Maya Chen & Dev Okafor' },
  theme: { seed: 48213, style: 'auto' },
  emphasis: ['AI agents', 'three years', 'judgment', 'ten times faster', 'collapsing'],
};
writeFileSync(join(HERE, 'clip.json'), JSON.stringify(clip) + '\n');
console.log(`wrote sample/clip.json (${words.length} words, ${DURATION}s) and sample/audio.ogg`);
