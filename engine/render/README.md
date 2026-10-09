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
- Template: `--template`, else clip.json `"template"`, else `theme.template`, else `ai-shorts`. Podcast clips use
  `ai-shorts`; original narrated explainers set `"template": "ai-explainer"` (see below).
- Background video (both templates): `"background": {"video": "<path>"}` (absolute, or relative to the clip file)
  replaces the generative style with that video (e.g. `engine/broll/` output, already graded). render.mjs extracts
  it to JPEG frames at the clip fps (cover-cropped to 1080x1920, ~8 s for 40 s of video), serves them to the
  pages, and each frame draws frame `round(t * fps)` under the overlays (held on the last frame if the video is
  shorter). A readability scrim is added over the header and caption bands. Faster than generative (~31 fps).
- Sample: `node render.mjs --clip sample/clip.json --out /tmp/sample.mp4` (66 s of synthetic speech-like audio;
  `node sample/make-sample.mjs` regenerates `sample/clip.json` + `sample/audio.ogg`).
  Explainer sample (one beat of each visual type, same audio/words): `--clip sample/explainer-clip.json`.

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

## Template `ai-explainer` (original narrated explainers)
Same engine as `ai-shorts` (it loads `../ai-shorts/core.js` and the four styles): hook card -> dock, captions,
progress bar, credit (here e.g. `{"show": "Original explainer", "episode": "Sources in caption", "speakers": "AI narrator"}`,
with a voice-bars glyph instead of the mic). Additions, all in `templates/ai-explainer/beats.js`:
- The background is dimmed (always, deeper while a beat card is up) so the beat visuals read.
- Beat band: a glass card at x 60-915, centred in y 520-1000, sized to its content, showing the visual of the beat
  whose `[t0, t1)` contains t. It springs in over ~300 ms at `t0` and fades out over the last 200 ms before `t1`
  (the last beat stays to the end). Beats that start under the hook card are shown from ~3.2 s. Overlapping
  beats are clipped to the next `t0`; beats with < 0.5 s visible are skipped; unknown types are skipped (console warn).
- Optional per-beat `"label"` (e.g. `"AI-generated illustration"`): small disclosure chip at x 60, y 1008-1048
  while that beat is on screen. Cards are a little more opaque when a background video is used.

```json
"template": "ai-explainer",
"beats": [ { "t0": 0.0, "t1": 9.6, "label": "AI-generated illustration", "visual": { "type": "title", "text": "...", "accent": "word" } } ]
```
| type | fields | look |
|---|---|---|
| title | `text`, `accent`? | 1-3 lines Montserrat 900 caps, shrink-to-fit, accent word = `accent` or first `emphasis` match; lines rise in |
| stat | `value`, `label`, `source`? | giant accent number counting up over 0.8 s with the original format kept (`40%`, `$100B`, `2,000,000`, `3x`, `1.5 million`; non-numeric like `GPT-5` is static); % values get a meter; label; "Source: ..." line |
| compare | `items` [{label, value, display?}] 2-4, `unit`?, `prefix`? ("$"), `title`?, `highlight`? (index, default max) | bars grow staggered, values count up (8,000 / 250K / 2M / 1.5B); log scale automatically when max/min > 50 ("log scale" note); unit shown once in the header |
| list | `items` 2-4 strings or {text, t (absolute s)} | items land one by one across ~70% of the beat (or at `t`), drawn check icons; one shared text size |
| quote | `text` (<= ~20 words), `by` ("Name, where") | big accent quote mark, words fade in, "— Name, where"; text only |
| timeline | `items` 2-5 {t, label, at?} | points on a line, the accent point advances across ~72% of the beat (or at `at`), past/now/future states |
| keyword | `text` | huge Anton word/phrase, letter-by-letter masked rise, accent underline sweep |

All text is shrink-to-fit inside the card (with a uniform-scale emergency fallback), so nothing can reach the
dock (ends <= ~420) or the captions (>= ~1100). One accent colour per palette (yellow or green), no emoji/logos/photos.
Review: `node render.mjs --clip sample/explainer-clip.json --out /tmp/x/e.png --frames-only 0.1s,6.4s,14.7s,22.9s,30.8s,40.1s,48.8s,59.5s`.
Speed: ~25 fps generative (66 s sample: 85 s total), ~31 fps with a background video (+ extraction).

## Engine hooks for other templates
`CLIPKIT.boot(opts)`: `opts.setup(S, ctx)` runs after the core layouts are built and may set
`S.layers.mid(ctx, S, t, cover)` (drawn after the background overlay, before progress/hook/captions),
`S.layers.creditGlyph(ctx, S, x, y, size, color, t)` and `S.info` (merged into `__INFO`); `opts.sample` is the
preview fixture. Text/panel helpers (`font`, `fitText`, `wrapBalanced`, `capHeight`, `glassPanel`, ...) are exported
on `CLIPKIT`. With no opts, `ai-shorts` renders byte-identically to before.

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
select it with `--template`, clip.json `"template"` or `theme.template` (see `templates/ai-explainer/` for one built on the shared engine).

## Files
- `render.mjs` CLI; `templates/ai-shorts/` (core.js engine: audio features, captions, hook, credit, overlay,
  background video; `styles/*.js` backgrounds); `templates/ai-explainer/` (index.html + beats.js); `fonts/` (Montserrat 800/900, Anton, Inter 500/700 latin woff2, OFL licences);
  `sample/` (fixtures `clip.json`, `explainer-clip.json` + generator).
