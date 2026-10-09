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
| scene | `module`, `params`, `layout` ("full" default / "band"), `span`? | a per-story animated scene (ES module), see "Authoring a scene" |

Explainers should be mostly **scenes** (characters and objects acting out the story); cards are support for 1-2
beats. `sample/explainer-story-clip.json` is a ~90%-scene sample using the five example scenes.

All text is shrink-to-fit inside the card (with a uniform-scale emergency fallback), so nothing can reach the
dock (ends <= ~420) or the captions (>= ~1100). One accent colour per palette (yellow or green), no emoji/logos/photos.
Review: `node render.mjs --clip sample/explainer-clip.json --out /tmp/x/e.png --frames-only 0.1s,6.4s,14.7s,22.9s,30.8s,40.1s,48.8s,59.5s`.
Speed: ~25 fps for cards over the generative background (66 s sample: 85 s total), ~31 fps with a background
video (+ extraction), ~36 fps for full-frame scenes (66 s story sample: 61 s total).

## Engine hooks for other templates
`CLIPKIT.boot(opts)`: `opts.setup(S, ctx)` (may be async) runs after the core layouts are built and may set
`S.layers.mid(ctx, S, t, cover)` (drawn after the background overlay, before progress/hook/captions),
`S.layers.skipBackground(t, cover)` (true = mid paints the whole frame, skip the generative style),
`S.layers.creditGlyph(ctx, S, x, y, size, color, t)` and `S.info` (merged into `__INFO`); `opts.sample` is the
preview fixture. Text/panel helpers (`font`, `fitText`, `wrapBalanced`, `capHeight`, `glassPanel`, ...) are exported
on `CLIPKIT`. With no opts, `ai-shorts` renders byte-identically to before.

## Authoring a scene
A scene is a small ES module written per story that animates what the narration says. Reference it from a beat:
```json
{ "t0": 14.0, "t1": 26.0, "visual": { "type": "scene", "module": "scenes/2026-10-10-agents.js", "span": 2,
  "params": { "task": "Booking the flight" } } }
```
or top level: `"scenes": [{ "module": "...", "t0": 14.0, "t1": 26.0, "params": {} }]` (wins over overlapping beats).
- `module`: absolute, or relative to clip.json. render.mjs serves it; the page imports it before frame 0.
- `layout`: `"full"` (default) draws the **whole 1080x1920 frame** and replaces the background; `"band"` draws an
  855x480 canvas inside the beat card (like the other card types).
- `span: n` on a beat makes one continuous scene over that beat and the next n-1 (their visuals are ignored).
- Full scenes crossfade (350 ms) with the previous scene or card mode, and a scrim is added over the dock and
  caption band. The hook card covers y ~330-790 for the first ~3 s, so start the first scene with an establishing shot.
- **Stage** (full layout): paint the whole frame (use a `world`), but keep the action and any text inside
  x 60-915, y 400-1050 (`info.stage`): the docked header sits at y 206-~420, captions at 1050-1350, credit/progress
  to 1540. Characters' feet around y 1000-1040.
- Failures stop the render with the module path: missing file, no default export, a throw at any t (each scene is
  dry-run at its start, 25 %, end), `Math.random`/`Date.now`/`performance.now` (blocked while drawing), or
  non-determinism (the middle frame is drawn twice and compared).

```js
// scenes/example.js: draw(ctx, t, info) paints one frame; t = seconds since the scene started. Pure function of t.
export default function draw(ctx, t, info) {
  const K = info.helpers.kit, P = info.params, D = info.duration;
  const doneAt = info.timeOf(P.cue || 'done') ?? D * 0.7;      // sync to a narrated word (scene-relative s)
  ctx.save();
  K.camera(ctx, t, [{ t: 0, zoom: 1 }, { t: D, zoom: 1.08, x: 520, y: 760 }]); // gentle push-in
  const room = K.world.office(ctx, { t });                        // a setting, not objects on black
  K.drawDesk(ctx, 600, 1035, 1.3);
  K.drawRobot(ctx, 640, 1000, 1.5, { t, state: t < doneAt ? 'working' : 'happy' });
  K.drawPerson(ctx, 220, 1035, 1.55, { t, pose: t < doneAt ? 'stand' : 'cheer', mood: 'happy', talk: info.env * 0.6 });
  const pop = K.popIn(t, 0.3);                                    // 0 -> 1 with overshoot
  if (pop > 0) K.drawLabel(ctx, 600, 520, pop, { text: P.task || 'Doing the task', dot: true });
  if (t > doneAt) K.drawStamp(ctx, 780, 880, 0.7, { kind: 'check', text: 'DONE', land: (t - doneAt) / 0.5 });
  ctx.restore();
}
```
`info`: `duration`, `width`/`height` (1080x1920 full, 855x480 band), `stage`, `safe`, `env`/`onset` (narration
loudness 0..1 now), `params` (frozen), `beat` (index within a span), `beatT`/`beatDur`, `beats` [{t0, t1}] (scene-
relative), `words` [{w, s, e}] (scene-relative), `wordAt(t)` (word being spoken at scene time t or null),
`timeOf(word, nth = 0)` (scene time it is spoken or null), `accent`, `ink`, `muted`, `fonts`, `helpers`.
`helpers`: `kit`, `world` (= kit.world), `camera`, `rng` (seeded; re-seeded every frame: call in the same order each
frame), `hash(a, b)` (stable noise), `clamp lerp smooth easeOutCubic easeInOutCubic easeOutBack spring phase`,
`roundRect rgba mixHex font(kind, size) fitText(ctx, text, kind, max, min, maxW) wrap(ctx, text, kind, size, maxW)
glow(ctx, x, y, r, color, a)`; font kinds `display` (Montserrat 900), `bold` (800), `condensed` (Anton), `ui`
(Inter 700), `body` (Inter 500).

**Style rules.** Flat, friendly vector (the kit's look): simple rounded shapes, 2-3 tones per object, soft ground
shadows, dark-ish settings. One accent colour (`info.accent`, yellow or green) for what matters; no emoji, no logos
or real brands, no real people or likenesses (kit characters are generic cartoons; never caricature a real person),
no photos. Readable on a phone: text >= 24 px (labels 26-30), key objects >= ~150 px. Motion eases in and out
(popIn, phase, spring), with anticipation and follow-through on big actions (wind-up, overshoot, settle) and small
secondary life (blinks, steam, blinking LEDs). Every scene ends in a settled state (no half-finished motion at t1).
Sync key actions to the narration with `timeOf`.

**Preview** stills at several t (seconds are absolute clip time):
`node render.mjs --clip <clip.json> --out /tmp/x/s.png --frames-only 3s,6s,9s,12s` and look at them.

### Kit reference (`info.helpers.kit`, templates/ai-explainer/kit.js)
All `draw*(ctx, x, y, scale, opts)` are anchored at the **bottom-centre** (where the thing stands); sizes at scale 1
are in `kit.SIZE`. Characters are generic cartoons.
- `drawPerson` ~120x240: `pose` stand|point|shrug|cheer|phone|sit|sit-phone|sit-laptop, `t`, `talk` 0..1, `walk` (s of walking), `typing` 0-2, `mood` happy|neutral|worried|angry|shocked, `skin`/`hair`/`shirt` (0-4 or hex), `hairStyle` short|long|bun|curly|none, `look` -1..1, `flip`, `seat` (false on sofas), `seed`.
- `drawRobot` ~130x225: `state` idle|thinking|working|happy, `t`, `talk`, `flip`, `seed`.
- `drawPhone` 130x240: `t`, `bubbles` (count), `every`, `typing`, `screen` chat|blank.
- `drawLaptop` 260x150: `t`, `screen` code|chart|chat|blank, `typing`.
- `drawServerRack` 120x230: `t`, `activity` 0..1. `drawDataCenter` 330x190: `t`, `activity`, `label`.
- `drawBuilding` 240x420 office/bank tower: `t`, `color`, `floors`, `lit` 0..1, `label`.
- `drawDocument` 140x180: `lines`, `title`, `sign` 0..1 (signature draws), `seal`.
- `drawCoin` 64x64: `spin` (radians), `symbol`. `drawBills` 130x80: `count` 1-8. `drawPriceTag` 130x150: `text`, `t` (swing).
- `drawChart` 270x175: `trend` up|down, `progress` 0..1, `points` [[u, v]].
- `drawLock` 90x125: `open` 0..1. `drawShield` 120x140: `check` 0..1. `drawGlobe` 170x170: `t`, `arcs`, `progress`.
- `drawGavel` 190x120: `hit` 0 (raised) .. 1 (struck). `drawRulebook` 170x210: `open` 0..1, `title`. `drawLectern` 220x232.
- `drawBriefcase` 170x135. `drawClock` 130x130: `t`, `speed` (h/s), `hour`. `drawLightbulb` 100x160: `on` 0..1, `t`.
- `drawWarning` 140x125: `pulse`. `drawSpeechBubble` (anchor = tail tip): `text`, `size`, `maxW`, `tail` left|right|center, `dark`, `pop`.
- `drawStamp` 190x190: `kind` check|cross, `text`, `land` 0..1 (slams in, burst). `drawLabel` pill: `text`, `size`, `dot`, `accent`. `drawDesk` 300x110.
- Props: `kit.props.plant(ctx, x, y, s)`, `mug(ctx, x, y, s, t)` (steam), `floorLamp(ctx, x, y, on, t)`, `window(ctx, x, y, w, h, time, t)`.
- `shadow(ctx, x, y, w)`, `glow(ctx, x, y, r, color, a)`; colours `ACCENT {base, shade, light, deep}`, `NEUTRAL`, `SKIN`, `HAIR`, `SHIRT`; `font.display(size)` etc.

World (`kit.world.*(ctx, opts)`, paints the whole 1080x1920 frame, returns anchors):
- `room` {t, time day|dusk|night, wall, floor, floorY, window, lamp, picture, plant} -> {floorY, feetY}
- `livingRoom` / `livingRoomNight` {t, time, sofa colour, lampOn} -> {sofa: {x, seatY, feetY}, table, floorY} (sit characters with `seat: false` at sofa.x/feetY, scale ~1.9)
- `office` {t, time} -> {floorY, desk}; `city` {t, time, groundY} -> {groundY, feetY}; `serverHall` {t, activity} -> {floorY, feetY}
- `courtroom` {t} -> {bench: {x, y}, podium, floorY} (generic balance emblem, no real seals)

Motion (also on `kit.motion`): `popIn(t, delay, dur)` 0->1 overshoot, `fadeIn/fadeOut`, `slideIn(t, delay, dur, dist)`
offset, `bob(t, amp, speed, phase)`, `shake(t, start, dur, amp)`, `typewriter(text, t, cps, delay)`,
`countUp(value, t, delay, dur, decimals)`, `stagger(items, t, step, delay)` -> local times, `phase(t, a, b, ease)`,
`pathDraw(ctx, pts, progress)`, `pathPoint(pts, u)`, `bezier(x0, y0, x1, y1, x2, y2, x3, y3, n)` -> points,
`camera(ctx, t, [{t, zoom, x, y}])` (x, y = scene point brought to the stage centre 487,725; zoom >= 1), `cameraShake(ctx, t, start, dur, amp)`.

Example scenes in `templates/ai-explainer/scenes/` (all full-frame, generic placeholder text by default):
- `chat-ends.js` (sofa at night, angry typing, zoom into the phone, chat ended, stare) params: messages, replies, title, ended, burst, endWord
- `data-flow.js` (people/devices stream packets into a data center) params: sources, label, time
- `robot-does-job.js` (robot works at a desk, documents stack, coworker reacts, DONE stamp) params: task, reaction impressed|worried, done, cue
- `money-flow.js` (coins arc between two labelled buildings, amount counts up) params: from, to, amount, caption, time
- `rule-stamp.js` (rule book opens, gavel strikes, stamp lands) params: text, kind, title, note, cue
Scenes with 3+ beats (`span`) use the beat boundaries as their phases; otherwise fractions of the duration.

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
  background video; `styles/*.js` backgrounds); `templates/ai-explainer/` (index.html, beats.js, kit.js, scenes/); `fonts/` (Montserrat 800/900, Anton, Inter 500/700 latin woff2, OFL licences);
  `sample/` (fixtures `clip.json`, `explainer-clip.json` (cards), `explainer-story-clip.json` (scenes) + generator).
