#!/usr/bin/env node
// clip.json -> 1080x1920 H.264/AAC MP4, rendered frame by frame in headless Chromium.
//
//   node render.mjs --clip <clip.json> --out <file.mp4> [--workers 3] [--style auto|neural|flow|horizon|orb]
//                   [--frames-only 0,45,600 | 0.5s,20s] [--template ai-shorts] [--crf 20] [--quiet]
//
// Frame i is drawn at t = i / fps by the page's window.renderFrame(t); nothing depends on wall time, so
// any frame range can be rendered by any worker. Frames are split into contiguous chunks across N
// browsers, each piped (JPEG over CDP) into its own libx264 encoder; chunks are concatenated without
// re-encoding and muxed with the clip audio (AAC 192k, 48 kHz, +faststart). A cover PNG
// (<out minus .mp4>.cover.png) is written alongside.
import { chromium } from 'playwright-core';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const W = 1080, H = 1920;
const CHROME_CANDIDATES = [
  process.env.CHROMIUM_PATH,
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
].filter(Boolean);

// ------------------------------------------------------------------ args
function parseArgs(argv) {
  const a = { workers: 3, template: null, style: null, crf: 20, quiet: false };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i], v = argv[i + 1];
    switch (k) {
      case '--clip': a.clip = v; i++; break;
      case '--out': a.out = v; i++; break;
      case '--workers': a.workers = Math.max(1, parseInt(v, 10) || 1); i++; break;
      case '--frames-only': a.framesOnly = v; i++; break;
      case '--style': a.style = v; i++; break;
      case '--template': a.template = v; i++; break;
      case '--crf': a.crf = parseInt(v, 10); i++; break;
      case '--quiet': a.quiet = true; break;
      case '-h': case '--help': a.help = true; break;
      default: throw new Error(`unknown argument: ${k}`);
    }
  }
  return a;
}
const USAGE = `usage: node render.mjs --clip <clip.json> --out <file.mp4> [--workers 3] [--style auto|neural|flow|horizon|orb]
                        [--frames-only 0,45,600|0.5s,20s] [--template ai-shorts] [--crf 20] [--quiet]`;

// ------------------------------------------------------------------ helpers
const log = (...m) => { if (!ARGS.quiet) console.error('[render]', ...m); };
function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { encoding: opts.binary ? null : 'utf8', maxBuffer: 1 << 30 });
  if (r.status !== 0) throw new Error(`${cmd} failed (${r.status}): ${(r.stderr || '').toString().slice(-2000)}`);
  return r.stdout;
}
function probeDuration(file) {
  const out = run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
  return parseFloat(out);
}
// Loudness envelope per video frame, 0..1 (used only when clip.json has none).
function computeEnvelope(audio, fps, duration) {
  const SR = 16000;
  const pcm = run('ffmpeg', ['-v', 'error', '-i', audio, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], { binary: true });
  const f = new Float32Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.byteLength / 4));
  const frames = Math.ceil(duration * fps), hop = SR / fps, db = [];
  for (let i = 0; i < frames; i++) {
    let acc = 0, c = 0;
    for (let j = Math.floor(i * hop); j < Math.min(f.length, Math.floor((i + 1) * hop)); j++) { acc += f[j] * f[j]; c++; }
    db.push(20 * Math.log10(Math.sqrt(acc / Math.max(1, c)) + 1e-9));
  }
  const sorted = [...db].sort((a, b) => a - b);
  const hi = sorted[Math.floor(sorted.length * 0.97)] ?? -20;
  return db.map((d) => +Math.max(0, Math.min(1, (d - (hi - 36)) / 36)).toFixed(3));
}

function loadClip(path) {
  const clipPath = resolve(path);
  const clip = JSON.parse(readFileSync(clipPath, 'utf8'));
  for (const k of ['audio', 'words', 'hook', 'credit']) if (clip[k] == null) throw new Error(`clip.json is missing "${k}"`);
  clip.audio = resolve(dirname(clipPath), clip.audio);
  if (!existsSync(clip.audio)) throw new Error(`audio not found: ${clip.audio}`);
  clip.fps = Math.round(clip.fps || 30);
  if (!(clip.duration > 0)) clip.duration = probeDuration(clip.audio);
  clip.words = (clip.words || []).filter((w) => w && typeof w.w === 'string' && isFinite(w.s) && isFinite(w.e)).sort((a, b) => a.s - b.s);
  if (!Array.isArray(clip.envelope) || clip.envelope.length < 2) {
    clip.envelope = computeEnvelope(clip.audio, clip.fps, clip.duration);
  }
  clip.theme = Object.assign({ style: 'auto' }, clip.theme || {});
  return clip;
}

function parseFrameList(spec, fps, total) {
  return [...new Set(spec.split(',').map((s) => s.trim()).filter(Boolean).map((s) => {
    const n = s.endsWith('s') ? Math.round(parseFloat(s) * fps) : parseInt(s, 10);
    if (!Number.isFinite(n)) throw new Error(`bad frame spec: ${s}`);
    return Math.min(Math.max(0, n), total - 1);
  }))].sort((a, b) => a - b);
}

// ------------------------------------------------------------------ browser workers
async function startWorker(clip, templateHtml, id) {
  const executablePath = CHROME_CANDIDATES.find((p) => existsSync(p));
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--disable-gpu', '--force-color-profile=srgb', '--font-render-hinting=none', '--hide-scrollbars',
      '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--mute-audio'],
  });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript((c) => { window.__CLIP__ = c; }, clip);
  await page.goto(pathToFileURL(templateHtml).href);
  await page.waitForFunction(() => window.__READY === true || !!window.__ERROR, null, { timeout: 60000 });
  const err = await page.evaluate(() => window.__ERROR || null);
  if (err) throw new Error(`template failed to initialise: ${err}`);
  const info = await page.evaluate(() => window.__INFO);
  const cdp = await page.context().newCDPSession(page);
  // Paint + encode inside the page (OffscreenCanvas.convertToBlob), return the image bytes.
  // ~2-3x faster than Page.captureScreenshot because nothing is composited to the screen.
  const grab = async (t, format) => {
    const r = await cdp.send('Runtime.evaluate', {
      expression: `window.grabFrame(${t}, ${JSON.stringify(format)}, 0.92)`, awaitPromise: true, returnByValue: true,
    });
    if (r.exceptionDetails) throw new Error(`page error at t=${t}: ${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
    return Buffer.from(r.result.value, 'base64');
  };
  return {
    id, info, errors,
    frame: (t, format) => grab(t, format),
    cover: () => grab(-1, 'png'),
    close: () => browser.close(),
  };
}

function startEncoder(file, fps, crf) {
  const ff = spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y',
    '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(crf), '-tune', 'animation',
    '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
    '-r', String(fps), '-g', String(fps * 2), '-an', file], { stdio: ['pipe', 'ignore', 'pipe'] });
  let stderr = '';
  ff.stderr.on('data', (d) => { stderr += d; });
  const done = new Promise((res, rej) => ff.on('close', (code) => (code === 0 ? res() : rej(new Error(`x264 encoder failed: ${stderr}`)))));
  done.catch(() => {});
  return {
    write(buf) { return ff.stdin.write(buf) ? null : new Promise((r) => ff.stdin.once('drain', r)); },
    end() { ff.stdin.end(); return done; },
  };
}

// ------------------------------------------------------------------ main
const ARGS = parseArgs(process.argv.slice(2));
async function main() {
  if (ARGS.help || !ARGS.clip || !ARGS.out) { console.error(USAGE); process.exit(ARGS.help ? 0 : 2); }
  const t0 = Date.now();
  const clip = loadClip(ARGS.clip);
  if (ARGS.style) clip.theme.style = ARGS.style;
  const template = ARGS.template || clip.theme.template || 'ai-shorts';
  const templateHtml = join(HERE, 'templates', template, 'index.html');
  if (!existsSync(templateHtml)) throw new Error(`template not found: ${templateHtml}`);
  const fps = clip.fps;
  const total = Math.round(clip.duration * fps);
  const out = resolve(ARGS.out);
  mkdirSync(dirname(out), { recursive: true });
  const base = out.replace(/\.(mp4|mov|png)$/i, '');

  const frames = ARGS.framesOnly ? parseFrameList(ARGS.framesOnly, fps, total) : null;
  const nWorkers = Math.max(1, Math.min(ARGS.workers, frames ? frames.length : Math.ceil(total / 30)));
  const workers = await Promise.all(Array.from({ length: nWorkers }, (_, i) => startWorker(clip, templateHtml, i)));
  log(`template=${template} style=${workers[0].info.style} palette=${workers[0].info.palette} seed=${workers[0].info.seed} ` +
    `groups=${workers[0].info.groups} frames=${frames ? frames.length : total} workers=${nWorkers}`);

  try {
    if (frames) {
      // stills for review
      const queue = [...frames];
      const written = [];
      await Promise.all(workers.map(async (w) => {
        while (queue.length) {
          const f = queue.shift();
          const png = await w.frame(f / fps, 'png');
          const file = `${base}.f${String(f).padStart(6, '0')}.png`;
          writeFileSync(file, png); written.push(file);
        }
      }));
      writeFileSync(`${base}.cover.png`, await workers[0].cover());
      written.sort().forEach((f) => console.log(f));
      console.log(`${base}.cover.png`);
    } else {
      const tmp = mkdtempSync(join(tmpdir(), 'clip-render-'));
      try {
        const per = Math.ceil(total / nWorkers);
        const chunks = workers.map((w, i) => ({ w, from: i * per, to: Math.min(total, (i + 1) * per), file: join(tmp, `chunk${i}.mp4`) })).filter((c) => c.to > c.from);
        let doneFrames = 0, lastLog = Date.now();
        const tr = Date.now();
        await Promise.all(chunks.map(async (c) => {
          const enc = startEncoder(c.file, fps, ARGS.crf);
          for (let f = c.from; f < c.to; f++) {
            const jpg = await c.w.frame(f / fps, 'jpeg');
            const p = enc.write(jpg); if (p) await p;
            doneFrames++;
            if (Date.now() - lastLog > 5000) {
              lastLog = Date.now();
              const fpsNow = doneFrames / ((Date.now() - tr) / 1000);
              log(`${doneFrames}/${total} frames  ${fpsNow.toFixed(1)} fps  eta ${((total - doneFrames) / fpsNow).toFixed(0)} s`);
            }
          }
          await enc.end();
        }));
        const renderSec = (Date.now() - tr) / 1000;
        log(`frames done: ${total} in ${renderSec.toFixed(1)} s (${(total / renderSec).toFixed(1)} fps)`);
        writeFileSync(`${base}.cover.png`, await workers[0].cover());
        const list = join(tmp, 'list.txt');
        writeFileSync(list, chunks.map((c) => `file '${c.file}'`).join('\n') + '\n');
        const outDur = (total / fps).toFixed(3);
        run('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y',
          '-f', 'concat', '-safe', '0', '-i', list, '-i', clip.audio,
          '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
          '-af', 'apad', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2',
          '-t', outDur, '-movflags', '+faststart', out]);
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
      const mb = (statSync(out).size / 1048576).toFixed(1);
      console.log(out);
      console.log(`${base}.cover.png`);
      log(`wrote ${out} (${mb} MB) in ${((Date.now() - t0) / 1000).toFixed(1)} s total`);
    }
    const errs = workers.flatMap((w) => w.errors);
    if (errs.length) { console.error('[render] page console errors:\n' + [...new Set(errs)].join('\n')); process.exitCode = 3; }
  } finally {
    await Promise.all(workers.map((w) => w.close().catch(() => {})));
  }
}
main().catch((e) => { console.error('[render] ERROR', e.message || e); process.exit(1); });
