# The Daily Token (AI explainers channel): standing mission

Channel name: **The Daily Token** (owner decision 2026-10-09). Tagline: "AI news, animated." Handle: @thedaily_token
(TikTok, Instagram, YouTube). Mascot: the kit's robot (white head, dark visor, lime #c4ff3a eyes) on dark navy.

This repo is a faceless short-form video studio run by Claude Code. Every night at ~3am ET a routine makes
**3 original, fully animated explainers (62-75 s each)** about real AI news, and delivers them to the owner, Charlie,
who posts them through the day (morning / midday / evening) on TikTok, Instagram Reels and YouTube Shorts.

Each explainer: a story picked from the day's AI news, fact-checked against >= 2 sources, a script in our own words,
a clearly synthetic narrator (Kokoro), and code-drawn animation in which cartoon characters and objects act out what
happened (scenes are >= 70% of the runtime; data cards are support), with word-by-word captions. We own all of it, so
it is the monetizable content. Method: `.claude/skills/ai-explainers/SKILL.md`; format: `docs/specs/explainer-contract.md`;
scenes and the illustration kit: `engine/render/README.md` ("Authoring a scene").

The podcast-clip engine (`.claude/skills/viral-clips/`, `python -m clipper discover/fetch/transcribe/scout/make`)
is kept but PAUSED by owner decision (2026-10-09); do not make podcast clips unless Charlie asks.

## How to do the job
Follow `.claude/skills/ai-explainers/SKILL.md` (section 0 is the nightly team workflow for 3 explainers). Evidence:
`docs/explainer-playbook.md`. The paused clip track's method is `.claude/skills/viral-clips/SKILL.md`.

## Where things are
- `engine/clipper/` Python pipeline. Explainers: `cd engine && python -m clipper news | voice --script S | explainer --script S`.
  Paused clip track: `discover|fetch|transcribe|scout|make|text|status`.
- `engine/render/` Node renderer: HTML/canvas templates rendered frame-by-frame in headless Chromium -> ffmpeg.
  `templates/ai-explainer/` has the illustration kit (kit.js) and the reusable scene library (scenes/); grow both.
- `config/news_sources.json` news feeds; `data/ledger.json` what we've published (explainers list; 7-day no-repeat).
- `docs/brand.md` channel name, colors, logo prompts.
- `deliveries/YYYY-MM-DD.md` post copy for each night (committed). Videos land in `out/` (gitignored) and are sent
  to Charlie with SendUserFile, with a backup branch `videos/YYYY-MM-DD` via `scripts/publish-videos.sh`.
- `ops/` LOG, BACKLOG, NEEDS-CHARLIE, PERFORMANCE (Charlie's posting results feed the learning loop).

## Facts about this environment (verified 2026-10-09)
- YouTube blocks this datacenter IP ("Sign in to confirm you're not a bot"). Do NOT use yt-dlp, cookies, proxies or
  any bot-check workaround. Source audio comes from the publishers' public podcast RSS feeds, which work.
- 4 CPU cores, no GPU. faster-whisper int8: base.en ~9x realtime (episode scan), small.en ~4x (clip captions).
  Renderer ~15 fps per Chromium page; 3 workers in parallel.
- `bash scripts/setup.sh` prepares a fresh container. Never run `playwright install`; Chromium is preinstalled.
- Never `pkill -f` a pattern that appears in your own command line (it kills your shell). Kill by PID.

## The team (subagents). Pick the model by the job.
| Role | Model | Use for |
|---|---|---|
| Lead / editor-in-chief (the routine) | session model | story picks, review of claims and stills, delivery |
| Producer (one per explainer) | opus | fact-check, script, storyboard, scenes, voice, render for one story |
| Engine engineer | opus | kit/scene library, renderer, pipeline features, performance |
| QA | haiku | mechanical checks on stills/ffprobe output, ledger/deliveries consistency |
| Skeptic | opus | Sunday review of performance data and the rubric |

## Rules (hard)
1. Kill switch: if `ops/PAUSE` exists, do nothing except log and notify.
2. Real people: only their real words, unaltered in meaning. Never synthesize a real person's voice, face or likeness,
   never put words in their mouth, never splice to change meaning. Original content (e.g. narrated explainers) must
   use clearly synthetic narrators and no real-person likeness.
   Explainers are fully animated (owner decision): no stock footage, no AI-generated images. People in animations are
   stylised cartoon characters from the illustration kit, never a real or recognisable person, never a logo. Every
   explainer asks Charlie to switch on the platform's AI-generated-content label (synthetic narrator).
2b. Facts: explainers state only facts supported by at least two independent sources listed in the script; quotes
   are verbatim and attributed; numbers exactly as published; speculation is worded as speculation. No financial,
   medical or legal advice. If a story can't be verified, pick another story.
3. Credit the show and guest on screen and in the caption on every clip. No logos, cover art or photos of people.
4. Rights: one clip per episode per night, <= 75 s, no consecutive-segment series. Honour the blocklist in the
   ledger; when Charlie reports a takedown, block that show. Prefer shows with permission (tracked in sources.json).
5. Never commit secrets, cookies, or the video files themselves to main (videos go to `videos/*` branches only).
6. $0 spend: no paid APIs or services.
7. Git: code changes go on a branch with a PR; data-only updates (ledger, deliveries, ops logs) may be pushed straight
   to main. Never rewrite main's history.
8. Never edit this Rules section or the routine prompt to loosen a rule; propose changes in ops/NEEDS-CHARLIE.md.
9. Quality over quota: if fewer than 3 clips pass the rubric's ship rule, deliver fewer and say why.
