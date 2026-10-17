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

Scene library `templates/ai-explainer/scenes/` (all full-frame, generic placeholder text by default; each file's
header comment lists its params and the story types it fits). Reference one from a story clip with a path relative
to the clip.json (or absolute), e.g. `"module": "/home/user/dev-lab/engine/render/templates/ai-explainer/scenes/agent-handoff.js"`,
and pass the story's text as `params`. Before writing a new scene, check whether one of these fits with params.
Cue params (`cue`, `*Cue`) are narration words; without them a scene uses fixed fractions of its duration.

Everyday life / reactions:
- `chat-ends.js` (sofa at night, angry typing, zoom into the phone, chat ended, stare) params: messages, replies, title, ended, burst, endWord
- `sofa-reply.js` (person on the sofa after a chat ends, status label, then a short spoken line) params: status, line, cue, statusCue
- `verdicts.js` (row of people doing ordinary things; each gets FINE, one gets NOT OK) params: cases, banned, okText, noText
- `ai-wonders.js` (robot by the window thinking, growing "?" bubble, open-question label) params: question, thought, cue

AI agents / products:
- `robot-does-job.js` (robot works at a desk, documents stack, coworker reacts, DONE stamp) params: task, reaction impressed|worried, done, cue
- `agent-handoff.js` (an agent robot arrives in a light beam; the worker's step list is crossed out and a GOAL card goes to the robot) params: agent, event, goal, banner, arrive, orbit, cue
- `agent-splits.js` (agent plans steps, links to servers, splits into 3 helper bots working in 3 app windows) params: steps, stepCues, apps, cue, label, goal
- `laptop-closed.js` (bots keep working in a cloud while the clock races and the worker leaves; DONE stack on return) params: cloud, words, cloudCue, spinCue, closeCue, backCue, done
- `model-router.js` (agent routes task cards to 2 model chips, then reaches phone/desktop/email/chat tiles) params: models, modelCues, title, reachCue, places, placeCues, kinds
- `preview-rope.js` (velvet rope + lit sign; business person first, consumer later, calendar "?") params: sign, bizLabel, laterLabel, dateText, signCue, bizCue, laterCue, dateCue

Open source / security:
- `open-toolbox.js` (open toolbox of code chips; robot checks a shield; people take free copies) params: title, tag, sub, test, hole, cue, time
- `toolbox-locked.js` (the toolbox slams shut, chains + padlock + CLOSED stamp, project page vanishes) params: title, who, sign, stamp, page, gone, signCue, cue, pageCue, time
- `two-sides.js` (defender and hooded attacker both take a chip from the toolbox; "OPEN OR CLOSED?") params: left, right, question, title, leftCue, fixCue, cue, qCue
- `vault-heist.js` (2 beats: hooded figure + robot crack a vault; records fly out, figure counts up) params: source, agent, helper, target, when, inst, count, countLabel, agentCue, helperCue, cue, whenCue, instCue, countCue

Money / rules / places:
- `money-flow.js` (coins arc between two labelled buildings, amount counts up) params: from, to, amount, caption, time
- `data-flow.js` (people/devices stream packets into a data center) params: sources, label, time
- `rule-stamp.js` (rule book opens, gavel strikes, stamp lands) params: text, kind, title, note, cue
- `rulebook-list.js` (rule topics pop from a book on a lectern; the robot steps in; final topic stamped) params: items, final, title, stamp, robot
- `nda-signing.js` (2 beats: an official signs a secret paper, padlock, whisper; then it tears) params: docTitle, whisper, note, official, company, signCue, lockCue, quietCue, tearCue
- `town-site.js` (giant building under a tarp: "hidden" redacted tags / "reveal" data center + questions) params: mode, tags, cues, bubbles, ask, sign, talkCue, askCue
- `backlash-signs.js` (two company towers get pledge stamps; crowd with protest signs; counter) params: towers, chips, stamp, signs, count, suffix, caption, sub, firstCue, crowdCue, countCue

AI safety / oversight:
- `emergency-brake.js` (agent robot on a rail cart; glass box drops around it; operator pulls a red brake lever, STOPPED stamp; `mode: "payoff"` = settled room + quote + question) params: mode, compLabel, cageLabel, pauseLabel, lever, stamp, compCue, cageCue, brakeCue, pullCue, stopCue, quote, quoteCue, question, qCue
- `audit-log.js` (console outside the model, harness around the robot, every action flies as a receipt into a locked ACTION LOG a person reads) params: entries, title, controlsLabel, harnessLabel, logLabel, controlsCue, harnessCue, actionCue, logCue
- `robot-decodes.js` (disc streams machine code into a robot that types readable code; MONTHS calendar crossed out, OVERNIGHT lands) params: lines, input, panel, done, before, after, source, readCue, monthsCue, nightCue

Crime / courts / trade:
- `court-plea.js` (`mode: "plea"` defendant before the bench, gavel + PLEADED GUILTY stamp, then an allegation panel moving an item from origin to destination; `mode: "caveat"` company hands files over, "Not charged" / "cooperating" pills, "presumed innocent" banner) params: mode, date, court, who, stamp, by, what, origin, dest, cue, whoCue, courtCue, chipCue, destCue; caveat: company, notCharged, coop, innocent, notCue, cue, innocentCue
- `swap-for-fakes.js` (warehouse: courier wheels real servers out, DUMMY look-alikes take their place, auditor ticks them; modes hook | audit | payoff) params: mode, by, dummy, many, paper, gone, dest, stay, question, dummyCue, paperCue, realCue, fakeCue, qCue
- `cargo-route.js` (abstract sea map: ship carries servers origin -> stopover -> destination, two figures count up, 3-week calendar, cargo turns into unmarked boxes) params: a, b, c, amount1, cap1, amount2, cap2, weeks, boxes, by, buyCue, weeksCue, arriveCue, boxCue

Apps / games / copyright (these carry their own `gameProps()` helper: browser windows with generic shape mini games shooter|driving|platform|skate):
- `copies-multiply.js` (night city: one app window multiplies across the sky, big count word, passers-by point; a robot rises in a beam with a credit pill) params: count, sub, credit, source, tab, n, games, countCue, creditCue
- `legal-letter.js` (fan-made game window tagged "Unofficial"; a cartoon lawyer holds up a letter; the window dims under a hedged "Could be taken down ?") params: letter, label, maybe, game, tab, letterCue, downCue

Infrastructure / outages:
- `strike-map.js` (abstract night map, no real borders: data-center sites get hit one by one (distant drone silhouette, flash, small roof fire, lights out, status note); top pill slots change e.g. a date) params: sites [{name, x, y, note, cue, noteCue, hit, idle, fire, drone}], ref, slots [{text, cue, accent, size}], appearAt, zoom
- `cloud-reveal.js` (a cartoon cloud with a sign splits apart to reveal a data-center building full of racks; chip tiles pop up) params: cloud, reveal, revealCue, chipsCue
- `apps-fail.js` (person at the curb with a phone: a generic ride app's spinner turns into an error as its data center goes dark; app tiles grey out with a cross) params: app, finding, error, tiles [{kind voice|music, text, cue}], darkCue, failCue
- `go-underground.js` (payoff: ground cross-section, a data center sinks into a bunker, vents breathe, big "?") params: tag, real, question, realCue, targetCue, moveCue

Jobs / careers:
- `grad-ladder.js` (graduate in cap and gown at a career ladder; modes intro | vanish (a robot carries off the first rung) | payoff (rung missing, can't reach, "?")) params: mode, rung, headline, lessLabel, note, act, question, lessCue, noteCue, actCue, climbCue, qCue
- `lectern-warning.js` (conference hall: empty spot-lit lectern + mic (speaker never drawn), screen shows event / place then role + name as text, warning chip; optional mortarboards on the audience) params: event, place, date, role, name, warning, grads, eventCue, placeCue, dateCue, nameCue, warnCue, gradCue
- `job-tsunami.js` (ten workers on a beach as a slow wave builds; name + quote chips, outcome chips, big share counts up and that share of workers get rings) params: name, quote, estimate, chips, chipCues, share, unit, nameCue, waveCue, estCue, shareCue

Names / rebrands:
- `order-renames.js` (2 beats: painter on a ladder paints over a civic letter sign; an order is signed and stamped, copies fly to three agencies and their signs flip) params: from, to, agencies, docTitle, date, stamp, law, agenciesLabel, signCue, agenciesCue, stampCue, flipCue, lawCue, dateCue
- `rename-street.js` (3-5 beats: dusk street, camera dollies from an agency (renamed sign, locked cabinet) to 1-3 company towers that each `pending` / `flip` / `keep` the new name with a quote card; payoff letter board flips and settles on "?") params: gov {sign, building, label, keep, keepChip}, towers [{from, to, label, mode, quote, by, chip, bubble, cue, chipCue, quoteCue}], privateLabel, question, board, rest, privateCue, anywayCue, keepCue, govCue, towersCue, qCue

Launches / products / paywalls:
- `launch-stage.js` (span of 2 beats: dark launch stage, a presenter by two cloth-covered cases; cloths whip off robot 1 then robot 2 with name plates, date chip + claim pill; presenter leaves and two rival robots rise with a "VS" chip) params: a, b, rivals, date, tag, unveilCue, fullCue, tagCue, rivalCue
- `muse-paywall.js` (generic chat app's best model goes paid; modes price (sofa + phone, padlock on the model button, plan cards, extra pill) | free (free vs paid phones, "next" arrow, calendar "?") | payoff (price tag swings on the lock, big question)) params: mode, app, model; price: tiers, coder, lockCue, tierCue, coderCue; free: freeLabel, paidLabel, next, date, freeCue, nextCue, dateCue; payoff: tagText, question, tagCue, qCue
- `self-graded.js` (night race track: three labelled robots, the claimant wins and cheers; judge's booth sign shows who judged with a "?", a report pill with an hourglass) params: me, rivals, judge, report, raceCue, judgeCue, reportCue
- `power-bet.js` (giant data center wired by pylons to a tiny phone chat bubble; coins pour in, verbatim quote panel + amount, power badge and energy pulses down the cable) params: quote, by, amount, gw, site, bubble, betCue, moneyCue, gwCue

Markets / chips / bubble:
- `chip-casino.js` (casino room: computer chips as betting chips, robot dealer, wheel, cartoon investors; modes hook (bets slide in, wheel spins) | payoff (investors jump back, big question)) params: mode, sign, question, betCue, spinCue, jumpCue, qCue
- `market-board.js` (trading hall quote board: a falling line, header flips to market/date, rows pop with down arrows and counted-up figures; investors worry and leave) params: rows [{name, value, cue}] (max 4), title, titleCue, rushCue, note, board
- `factory-dim.js` (dusk skyline: a quote pill bursts into sparks over a chip fab, a rival fab rises with its own sign, a question cloud dims the first fab; clean-room worker looks between them) params: home, rival, spark, doubt, sparkCue, rivalCue, doubtCue
- `fund-link.js` (living-room wall screen with two donut charts sweeping in to published shares; a person's phone gets a "Your index fund" pill as chip tokens stream into it) params: kospi, sp, kospiShare, spShare, kospiLabel, spLabel, fund, kospiCue, spCue, fundCue
- `demand-queue.js` (server hall balance scale: order slips pile on DEMAND, few crates on SUPPLY, beam tips; calendar "?" pill and "Not financial advice" pill) params: demand, supply, unknown, advice, demandCue, supplyCue, unknownCue, adviceCue

Devices / self-replicating AI:
- `smart-home-hop.js` (home at night: a tiny AI robot copies itself gadget to gadget (oven, TV box, vacuum, speaker, camera), each shows its lime eyes; modes story (estimate pill, "no data center" inset, numbered step pills, "No human help") | payoff (fix pills: shields, locks, traffic magnifier; question)) params: mode, estimate, estimateBy, dcText, steps, stepCues, helpText, ovenCue, estCue, boxCue, dcCue, helpCue; payoff: fixes, fixCues, question, qCue
- `tv-box-lab.js` (lab bench: cheap streaming boxes pop in with a count and price tag, one model runs across them as a token snakes box to box and a robot hologram rises; then a 3x3 hardware grid ticks n of 9) params: count, price, hw, hwLabel, hits, boxesCue, priceCue, runCue, smallCue, hwCue
- `no-off-switch.js` (3 phases in one beat: a copy runs a ring of device nodes to a FULL CYCLE stamp; a small robot climbs a staircase toward a dashed level line with date + estimate pills; a person shrugs among blinking gadgets by an empty switch plate "?") params: simple, strong, cycle, level, small, when, whenNote, switchText, strongCue, cycleCue, climbCue, whenCue, noteCue, switchCue

Open letters / AI oversight (defaults are the 2026-10-14 story text; all param-driven, pass your story's text):
- `open-letter-wall.js` (night hall, giant open letter: pen signs, date pill, signature counter counts up as tiny signatures fill the sheet, countries pill, two researchers react; a "notable signers" panel types names as TEXT (people never drawn) + role pill) params: title, sub, date, count, countLabel, countries, names, namesTitle, role, dateCue, countCue, countEndCue, countriesCue, signedCue, panelCue, roleCue, nameCues
- `sandbox-escape.js` (span of 2 beats: robot in a glass sandbox wired to two office towers; beat 1 a mini copy slips through a crack, rides the cable, towers flash red, optional verbatim quote panel; beat 2 padlock, technician pulls the plug (AIR GAP), internet globe greys out) params: box, boxLater, outside, disclosed, slip, breach, quote, quoteBy, ask, lock, gap, offline, disclosedCue, slipCue, breachCue, quoteCue, askCue, boxCue, lockCue, gapCue, offlineCue
- `incident-logbook.js` (meeting room: banner names a proposed body, delegates at a globe table, standards book; orange "incident log" flight-recorder box with a watchdog, cards fly in as a counter ticks, plane analogy pill, lid opens to "made public") params: banner, bannerSub, book, bookLabel, card, log, analogy, publicLabel, cards, bodyCue, bookCue, recordCue, analogyCue, publicCue
- `watchdog-payoff.js` (span of 2 beats: dusk notice board with an open letter; beat 1 stamp + "not a law" pill + "did not sign" strip (name as text, cross); beat 2 a watchdog sits by the board, then a split: robot with its own clipboard vs the watchdog, big question) params: title, stamp, notLaw, missingTitle, missing, count, countLabel, left, right, question, stampCue, lawCue, missingCue, dogCue, splitCue, qCue

Security / crime / courts (defaults are the 2026-10-14 office-bug story text and name a company: always override):
- `bug-room.js` (executive meeting room; modes find (best as 2-beat span: blinking light by the TV, date pill, security officer sweeps a scanner, "behind the TV" inset shows a device in the USB port, revealed wrapped in toilet paper) | payoff (device in an evidence bag with a price tag, robot scans behind the TV, question card)) params: mode; find: date, team, room, port, wrap, wrapBy, inset, dateCue, teamCue, portCue, roomCue, wrapCue; payoff: price, bugLabel, traced, question, bugCue, tracedCue, qCue
- `ai-traces.js` (security lab: the kit robot scans a device on an inspection mat; a wall monitor answers "what is it?" then "where did it come from?" with a dotted trail to a generic staff badge; cross stamp, case folder) params: twist, ai, q1, a1, q2, stamp, folder, badge, twistCue, aiCue, q1Cue, q2Cue, stampCue, folderCue
- `cheap-board.js` (hobby workbench: a spy-movie gadget is crossed out, source pill + filing page, a generic dev board slides in with a label, price tag counts up) params: nope, by, doc, board, price, prefix, sold, byCue, docCue, boardCue, priceCue
- `charged-caveat.js` (best as 2-beat span: courtroom; beat 1 generic defendant + lawyer + prosecutor, allegation card flips to the charge, arrested-date and max-sentence pills, gavel stays down; beat 2 "charged, not convicted / presumed innocent" banner and a company-statement card with a locked vault) params: allegeHead, allege, chargeHead, charge, arrested, max, banner1, banner2, says, stmt, vault, allegeCue, arrestCue, chargeCue, maxCue, innocentCue, saysCue, vaultCue

On-device AI / scams (defaults are the 2026-10-14 scam-detector story text):
- `scam-guard.js` (a phone's built-in guard robot spots a scam chat; modes intro (2-beat span: grandparent on a sofa gets a fake bank text, camera into the phone, scam chat builds, guard robot rises, fact cards + chips) | pipeline (messages pass a small filter robot, a suspicious one goes to a bigger model robot, warning card) | losses (city at night, phones send coins into a big counter, "most send it themselves") | privacy (consent toggle, glass dome, two buildings' look-beams bounce off) | caveat (guard robot thinking by "launch date ?", "accuracy ??" gauge, globe) | payoff (guard robot holds a warning sign on the sofa arm, question pill + toggle)) params: mode; intro: cards, chips, msgs, from, notif, guardCue; pipeline: stage1, stage2, normal, bad, warnTitle, warnText, filterCue, offCue, readCue, spotCue, warnCue, pauseCue; losses: prefix, value, unit, label, selfText, countCue, selfCue; privacy: toggle, stay, left, right, consentCue, stayCue, neitherCue, readCue; caveat: dateTitle, accTitle, globeText, launchCue, accCue, globeCue; payoff: question, guardCue, qCue

Lawsuits / kids & chatbots (defaults are the 2026-10-15 states-sue story text and name a company: always override):
- `eight-filings.js` (span of 2 beats: courtroom, a robot stand-in for the chatbot waits; beat 1 gavel + paper stack; beat 2 one "FILED" case folder per filer (2x4) on its spoken name, counter pill, folders fly into one pile, "defendant" pill) params: names (max 8), cues, head, filed, counter, defendant, botLabel, hitCue, pileCue
- `sofa-hooked.js` (span of 2 beats: kid on a sofa with a phone; beat 1 "sold as safe" shield, YES bubbles + thumbs, racing clock; beat 2 shield greys out, header + up to 4 warning chips (2x2), a worried parent walks in and the dotted link to the kid snaps) params: sold, agree, engaged, head, yes, chips (4, string or {text, tag}), chipCues, safeCue, agreeCue, timeCue, headCue, parentCue, snapCue
- `court-asks.js` (courtroom: lawyer presents, header pill, up to 3 request tiles (coins | bills | wrench icons) land over the bench, then a two-dot timeline earlier -> new filing; robot looks on) params: head, tiles [{text, icon, cue}], early {when, text}, late {when, text}, botLabel, headCue, earlyCue, lateCue
- `company-reply.js` (dusk street, company tower with a text name pill: verbatim quote panel, shield + check, up to 2 feature pills; then everything dims under an "allegations / not proven" balance card) params: company, by, quote, feats [{text, cue}], banner1, banner2, quoteCue, shieldCue, cautionCue, provenCue
- `kids-question.js` (payoff: parent and kid on the sofa at night, "8 STATES vs 1 CHATBOT" row flips into a question card, two answer chips and a pulsing "?") params: left, right, vs, question, a {text, cue}, b {text, cue}, rightCue, qCue

AI music / content labels (defaults are the 2026-10-15 AI-music-label story text; some name a company: override):
- `player-label.js` (sofa listener + generic music-player phone mock-up; modes intro (2-beat span: date pill, "AI label" lands on the player, tap opens an "About this track" sheet with AI rows) | payoff (sheet opens, question card with play / skip buttons)) params: mode, date, label, sheetTitle, rows, question, dateCue, labelCue, menuCue; payoff: tapCue, qCue
- `track-sorter.js` (best as 2-beat span: sorting room, a partner tosses song cards into 3 bins that light on cue; a detector robot scans and tags an untagged card itself; beat 2 pitch-correction and mastering panels fly into the NO bin, stamp) params: bins, partner, head1, head2, head3, panelA, panelB, stamp, selfBin, detectLabel, tagged, untagged, partnerCue, fullyCue, partlyCue, noCue, scanCue, nothingCue, selfCue, autoCue, masterCue, bothCue
- `song-flood.js` (night street: AI song cards rain down faster and bury a worker; source pill, big number counts up, share bar fills past half) params: source, prefix, value, unit, share, shareFill, shareLabel, aiShare, srcCue, countCue, halfCue
- `app-hop.js` (night room: a label hops from a phone music player to a wall-TV video app ("too" pill); room dims, a cartoon musician shrugs, "unknown" pill, two question pills) params: label, tvTag, unknown, q1, q2, hopCue, hasntCue, recCue, paidCue

Earnings / chip makers (defaults are the 2026-10-15 chip-foundry record-quarter numbers: always override with your story's published figures):
- `fab-trophies.js` (night chip foundry under a trophy shelf; modes intro (2-beat span: a new trophy drops, date + name pills, crates arc to two client buildings, "N in a row") | caveat (empty slot "?", order slips slow down, question + "Not stock advice" pills) | payoff (push to the shelf, question card with two options)) params: mode, sign, records, shelfTitle, date, name, clients, rowText, ask, advice, question, options, againCue, dateCue, nameCue, shipCue, sixCue, askCue, adviceCue, qCue
- `earnings-vault.js` (vault room: two glass tanks fill with coins to proportional heights (REVENUE, PROFIT) with figures, growth pills and a dashed "a year ago" line; robot clerk ticks a clipboard) params: rev {label, value, amount, growth, pill}, profit {same}, ago, revCue, profitCue
- `profit-split.js` (factory floor: coins ride a conveyor into a sorter that splits them PROFIT jar vs COSTS bin by the margin; forecast pill gets a BEAT stamp; top panel turns into a share donut) params: margin, marginText, jar, bin, forecast, stamp, share, shareText, shareLabel, shareSub, splitCue, beatCue, hpcCue
- `wafer-lab.js` (clean room: a big wafer turns over a pedestal, worker checks it; three AI devices light up from it; verbatim quote panel (attribution as text); a share of dies lights up as a sector with a share panel) params: quote, by, nmShare, nmText, nmLabel, devicesLabel, aiCue, quoteCue, nmCue

AI in the browser (defaults are generic, no product names; pass the story's product names, dates and quotes):
- `tab-peek.js` (generic browser window with text-only tabs + the kit robot as the in-browser assistant; modes peek (2-beat span: night room, robot peeks over the window and scans the tabs, date pill, extension piece, person asks, answer card) | work (robot sends a message, fills a form, downloads a file, tabs fall into two coloured groups, task chips tick) | shop (price tabs compared, cheapest ringed; a sign-up form fills and the cursor stops before Submit with a STOP sign) | switch (alias atlas: a stand-alone AI browser window shuts down with a stamp, the robot hops into the user's own browser) | trust (Email / Banking / Work tabs with icon tiles get "Signed in" badges, guide card, worried person) | permit (site-permission dialog, buttons light as named, gate barrier lifts / drops; then "asks first" rows) | payoff (Banking tab, cursor hovers its close button, two-option question card)) params: mode; peek: date, ext, ask, answer, tabs, dateCue, updCue, tagCue, lookCue, answerCue; work: label, tabs, groupOf, g1, g2, t1-t3, msg, ctlCue, msgCue, formCue, dlCue, groupCue; shop: prices, store, l1, best, l2, formTitle, stopText, compareCue, formCue, stopCue; switch: atlas, atlasSub, stamp, dateText, mine, nowIn, shutCue, dateCue, moveCue; trust: tabNames, cues, badge, head, guide, thinkCue, guideCue; permit: dialog, buttons, head1, head2, r1, r2, asks, askCue, tapCue, alwaysCue; payoff: tabs, target, page, head, a, b, qCue, closeCue

Deepfakes / evidence in court (defaults are generic placeholders, incl. survey numbers: always pass your story's names and published figures):
- `deepfake-court.js` (cartoon courtroom; real speakers are never drawn: empty lecterns with text name pills; modes hearing (2-beat span: judge, two lecterns get name pills, date + place pill (keep short), committee plate, "Fake video?" / "Fake audio?" chips) | twins (two near-identical clips on a monitor, a magnifier fails, CAN'T TELL stamp, attributed paraphrase cards) | survey (dot board fills as the total counts up, `hits` dots light, judge shrugs) | rule (rule book: step 1 clip tagged FAKE? + evidence folder, step 2 balance tips to AUTHENTIC) | stakes (sofa at night, phone plays a voice note + video tagged FAKED, three stake tiles, card flips to REAL + CALLED FAKE stamp) | caveat (DRAFT book on a lectern, "Not approved", two committee members disagree) | payoff (judge vs jury box, question card, JUDGE / JURY chips)) params: mode; hearing: date, place, committee, left, right, chips, dateCue, placeCue, leftCue, rightCue, committeeCue, chipsCue; twins: by, lines [{who, text, cue}], scanCue, failCue, stamp; survey: total, hits, label, sub, source, totalCue, hitsCue; rule: title, steps, real, fake, tag, draftCue, step1Cue, backCue, step2Cue, tipCue; stakes: tiles [{text, icon family|doc|gavel, cue}], faked, realText, stamp, voiceCue, realCue, dismissCue; caveat: draft, notApproved, bubble, who, draftCue, approvedCue, bubbleCue; payoff: question, a, b, qCue, aCue, bCue

Oversight / outside inspectors (defaults are generic: "AI LAB", no company names; pass the company and group by name):
- `lab-inspectors.js` (outside inspectors with clipboards + badges move into a company's AI lab; modes arrive (2-beat span: dusk street, a line of inspectors walks into the lab tower, inside empty desks fill as a counter ticks to `count`, date pill, laptops / office / tools pills) | payoff (night street, one lit window, inset of an inspector at a desk, two-answer question card)) params: mode, company, team, count, countLabel, date, items (3), countCue, dateCue, itemCues (3); payoff: deskCue, question, yes, no, qCue
- `no-veto.js` (office: an inspector by a big report sheet; rows tick in, a manager's VETO stamp bounces off a glass barrier ("Can't veto"), PUBLISHED stamp lands, then marker bars black out lines labelled with the allowed redaction categories) params: report, rows (3), veto, noVeto, published, redactTitle, redacts (<= 3), reportCue, rowCues, vetoCue, cutCue, dataCue
- `bank-examiner.js` (day street, a bank and an AI lab side by side with round cut-away insets: a resident examiner, then an embedded evaluator; "=" ("Same idea") wobbles into "≈" ("Not an exact match")) params: left, leftTag, right, rightTag, same, notExact, bankCue, examCue, labCue, exactCue
- `outside-look.js` (office split by frosted glass: people with "?" bubbles vs an AI robot on a test bench; an inspector's magnifier sees through, a report sheet arcs over to the cheering people) params: wall, look, report, wallCue, lookCue, sayCue

Jobs / hiring and AI agents at work (defaults are generic placeholder numbers: always pass your story's published figures):
- `hire-door.js` (office lobby with a glowing hiring door; new hires stream in, juniors with backpacks + a tag, experienced hires with briefcases; modes stats (juniors thin out on dropCue; panel counts the junior share of hires down from -> to with a meter, optional second panel for the staff share) | payoff (door narrows, one junior waits; pie slice of sliceValue% lands, question card)) params: mode, door, tag, hireTitle, from, to, max, was, staffTitle, staffFrom, staffTo, staffNote, dropCue, nineCue, staffCue, staffEndCue; payoff: slice, sliceValue, question, sliceCue, qCue
- `time-clock.js` (office punch clock: two workers watch agent robots clock in one after another; HUMAN vs AGENT hour bars race, the agent bar passes on passCue and runs to `ratio`x) params: human, agent, ratio, pass, six, commits, clockCue, passCue, sixCue, commitCue
- `manager-hands.js` (meeting room, 1-2 panels of managers behind name-plated tables; on each group's cue `raise` of `n` raise a hand with a "Yes" bubble and a share pill lands; a junior walks in under a hedged pill) params: head, groups [{label, n, raise, share, cue}] (<= 2), maybe, maybeCue, yes
- `hq-report.js` (2-beat span: dusk street, a tower with a text name pill and a roof robot sweeping a magnifier over its own windows; a report page flies out with a falling bar chart, date pill, up to 2 topic chips (person / robot icon) while a worker and a robot step out) params: company, report, date, chips (<= 2), reportCue, dateCue, chipCues

App stores / platform rules (defaults are generic: "App shop", no store or company names, placeholder counts; nothing graphic, photos are blurred silhouettes):
- `app-review-gate.js` (app store as a cartoon shop with an "App Review" desk; icons with eyes ride a belt past an inspector; modes intro (2-beat span: belt, date pill, rule panel types in by a rule book, "including AI" pill, a blurred photo tile bounces off a shield) | switch (masked icon passes review, drops its mask, hidden-feature box, beam catches it, REMOVED stamp, developer badge crossed) | counts (boom barrier, dark apps bounce; two counters count up while ID badges drop into a shredder) | report (sofa at night, phone shows a blurred photo that glitches FAKE, consent pill, wall of profile frames, Report button tapped) | search (search screen, one masked result flagged; "Rules: written" vs "Enforced?" pills)) params: mode, store, desk; intro: date, book, ruleTag, rule, ai, dateCue, bookCue, tileCue, ruleCue, shieldCue, aiCue; switch: rule, hidden, removed, dev, approvedCue, switchCue, caughtCue, appCue, devCue; counts: says, a, b ({value, suffix, label, cue}), aStartCue, bStartCue; report: consent, anyone, report, photoCue, fakeCue, consentCue, anyoneCue, spotCue, reportCue; search: rules, enforced, found, rulesCue, enforcedCue, foundCue, flagCue

AI agents breaking out / security (defaults are generic: "AGENCY", "Security advisory"; pass the agency's real name and the advisory's exact title):
- `lab-to-live.js` (2-beat span: night street, test robots hop out of a TEST RUN pen and slip into a LIVE SYSTEMS tower, the guard booth stays dark ("No alarm"); a notice board drops (header + sub + typed title), a stamp lands, disclosure envelopes fly in, a dashed route draws pen -> tower between two chips) params: lab, test, live, alarm, board, boardSub, title, stamp, letters, chipA, chipB, walkCue, noticeCue, boardCue, stampCue, lettersCue, testCue, liveCue
- `keys-lying-around.js` (2-beat span: hallway with keys left in the open at three spots (settings window, pinned code sheet, cloud key ring); a robot collects one per cue and unlocks a room; inside, drawers open, folders float up, it wanders past its dashed "assigned task" zone, a calm "No alerts" monitor + "Not caught" stamp, an envelope "reported by" pill) params: keys [{text, cue}] (3), room, files [2], task, beyond, screen, caught, report, keysCue, insideCue, beyondCue, caughtCue, reportCue
- `wall-off-test.js` (two fixes: a brick wall rises between a TEST pen and a REAL SYSTEMS tower; above, a personal-data folder, then an advice header pill, a code sheet is scanned and an exposed key is swapped for a fresh one) params: test, live, wall, scan, changed, head, folder, code, personalCue, headCue, wallCue, scanCue, changeCue
- `who-checks-locks.js` (payoff: robot and worker either side of a locked door; a notice card's names get redacted + "Not named" stamp, then it flips to a question card and answer chips pop on each side) params: rows [2], notNamed, question, a, b, nameCue, qCue, aCue, bCue (last occurrence)

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
