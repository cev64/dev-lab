# engine/render: clip.json to MP4

Renders a `clip.json` (see `docs/specs/clip-contract.md`) into a 1080x1920, 30 fps, H.264 + AAC MP4 with
word-by-word captions, a hook headline, a source credit and an audio-reactive generative background.
Each frame is drawn by an HTML/canvas template in headless Chromium.

## Setup
```
cd engine/render && npm ci        # installs playwright-core only (pinned); never run `playwright install`
```
Needs `ffmpeg`/`ffprobe` on PATH (libx264 + aac). Chromium is the Playwright headless shell at
`/opt/pw-browsers/chromium_headless_shell-1194/...`; set `CHROMIUM_PATH` to use another build.

## Usage
```
node render.mjs --clip <clip.json> --out <file.mp4> [--workers 3] [--style auto|neural|flow|horizon|orb]
                [--frames-only 0,45,600 | 0.5s,20s] [--template ai-shorts] [--crf 23] [--maxrate 1.7M] [--quiet]
```
- Writes `<file>.mp4` and `<file>.cover.png` (the hook card over a lit-up background frame, no captions).
- `--frames-only` writes PNG stills `<file>.f000045.png` (frame numbers, or seconds with an `s` suffix) plus
  the cover, and skips the video. Use it to review a style or a layout change.
- `--style` overrides `theme.style` (for testing). Exit code 3 means the page logged console errors.
- Sample: `node render.mjs --clip sample/clip.json --out /tmp/sample.mp4` (66 s of synthetic speech-like audio;
  `node sample/make-sample.mjs` regenerates `sample/clip.json` + `sample/audio.ogg`).

Speed on 4 CPU cores, no GPU: about 23-24 fps with 3 workers, so a 66-70 s clip takes about 90 s.
Output size is capped by VBV (`--maxrate 1.7M`, buffer 2x) to stay under ~15 MB per minute.
Audio is resampled to 48 kHz, limited to stay under -1 dBTP after AAC (`alimiter` at -1.4 dBFS), AAC 192k,
padded to the video length; `+faststart` is set.

## How it works
1. `render.mjs` loads and normalises the clip (relative `audio` paths resolve against the clip file; a
   missing `envelope` is computed from the audio; missing `duration` comes from ffprobe), starts a local
   HTTP server on 127.0.0.1 that serves this directory, and launches N browsers.
2. Each page gets the clip via `window.__CLIP__`, loads fonts (waits for `document.fonts`), builds all
   layouts once, then exposes `window.grabFrame(t)`. Frame i is painted at `t = i / fps` on an OffscreenCanvas,
   encoded to JPEG in the page and POSTed back to the server. Everything is a pure function of `t`
   (seeded RNG, no clocks, no frame-to-frame state), so any worker can render any frame.
3. Frames are split into contiguous chunks, one per worker; each chunk is piped into its own libx264
   encoder (veryfast, crf 23, yuv420p, bt709), then the chunks are concatenated without re-encoding and
   muxed with the audio.

## Input contract (summary)
Required: `audio`, `duration` (or probe-able audio), `words` [{w, s, e}], `hook`, `credit` {show, episode, speakers}.
Optional: `fps` (30), `envelope` (per-frame 0..1), `topic` (chip), `emphasis` (words/phrases always in the
accent colour), `theme` {seed, style: "auto" | style name, palette: index, accent: "#hex", template}.
Style "auto" picks the style and palette from `theme.seed` (falls back to a hash of `id`).

## Layout (template `ai-shorts`)
All text stays inside the safe box x 60-915, y 150-1540 (TikTok/Reels UI covers the right column and bottom).
| Element | Where | Notes |
|---|---|---|
| Hook card | centred ~y 300-800, frames 0 to 2.8 s | visible from frame 0 (thumbnail), up to 3 lines, shrink-to-fit, one keyword in accent |
| Docked header | y 206 to ~340 (stacked chip: ~420) | morphs from the card at 2.8-3.35 s, stays to the end |
| Topic chip | inside card / dock | accent pill |
| Focal visual | y ~650-1000 | style-specific, audio-reactive (signal line, voice ring, sun + equaliser, point sphere) |
| Captions | centred y 1200 (band 1050-1350) | 2-4 words, max 2 lines, >= 84 px heavy type (only a single over-long word shrinks), white with dark outline + shadow, spoken word in accent with a 120 ms pop, emphasis words in accent; no single-word groups unless emphasised; last group stays lit to the end |
| Credit | ~y 1400-1484 | mic glyph + show / episode / speakers, Inter >= 30 px, ellipsised if extreme |
| Progress bar | y 1516, 7 px | inside the safe box |

## Adding a style
1. Create `templates/ai-shorts/styles/<name>.js`:
   ```js
   (function () {
     const K = window.CLIPKIT;
     K.registerStyle({
       name: 'mystyle',
       caption: 'montserrat',   // or 'anton' | 'montserratMixed' (type presets in core.js)
       hook: 'montserrat',      // or 'anton'
       scale: 0.5,              // background render scale (cost is per pixel; 0.5 is plenty for glows)
       palettes: [{ accent: '#ffe14a', accent2: '#4cc9ff', /* any colours your draw() uses */ }],
       init(S) { /* precompute geometry with S.rng (seeded); never Math.random */ },
       draw(ctx, S, t) { /* paint the whole 1080x1920 background for time t */ },
     });
   })();
   ```
   In `draw`, use `S.A.env(t)` (smoothed loudness 0..1), `S.A.raw(t)`, `S.A.onset(t)` (speech attacks) and
   `S.A.cum(t)` (integral of loudness, for motion that speeds up with speech). Helpers on `CLIPKIT`:
   `glow/drawGlow` (cheap additive sprites), `drawSignalLine`, `drawWaveRing`, `hash2`, `mulberry32`, `rgba`, `mixHex`.
   Keep the band y 650-1000 alive (that is where the eye goes between header and captions); keep the caption
   band darker or calmer, and keep accents yellow/green so the spoken word reads.
2. Add a `<script src="styles/<name>.js">` tag in `templates/ai-shorts/index.html` (order = "auto" order;
   appending a style changes which style existing seeds map to).
3. Review: `node render.mjs --clip sample/clip.json --out /tmp/x/s.png --style <name> --frames-only 0.5s,2s,3.5s,20s,40s,65s`
   and check per-layer cost in the page with `window.profileFrame(t)` (aim for under ~35 ms per frame).

A new template is a new folder under `templates/` with an `index.html` that implements the same page
contract (`__CLIP__` in, `__READY`/`__ERROR`, `grabFrame(t, type, quality, postUrl)`, `renderFrame(t)`);
select it with `--template` or `theme.template`.

## Files
- `render.mjs` CLI; `templates/ai-shorts/` (core.js engine: audio features, captions, hook, credit, overlay;
  `styles/*.js` backgrounds); `fonts/` (Montserrat 800/900, Anton, Inter 500/700 latin woff2, OFL licences);
  `sample/` (fixture + generator).
