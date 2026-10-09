# AI clips channel: standing mission

This repo is a faceless short-form video studio run by Claude Code. Every night at 3am ET a routine makes **3 vertical
clips (60-75 s each)** of people on popular podcasts talking about AI, with animated captions, a hook headline and
code-generated visuals, and delivers them to the owner, Charlie, who posts them to TikTok and Instagram Reels.
Think of it as our own Opus Clip, plus editorial judgment.

Second track (original content): one **60-75 s narrated explainer** per night about a real AI news story, written
and fact-checked by the agent, read by an open-source synthetic narrator, illustrated with code-drawn beat cards
(stats, comparisons, timelines, quotes) over stock footage or fictional AI-generated illustrations. We own it fully,
so it is the monetizable track. Method: `.claude/skills/ai-explainers/SKILL.md`; format: `docs/specs/explainer-contract.md`.

## How to do the job
Follow the skill `.claude/skills/viral-clips/SKILL.md` step by step. It is the method: find AI episodes, transcribe,
pick the moments with the virality rubric, write the hook, cut, render, QA, deliver. Evidence behind it:
`docs/playbook.md`. Data formats: `docs/specs/clip-contract.md`.

## Where things are
- `engine/clipper/` Python pipeline (`cd engine && python -m clipper <discover|fetch|transcribe|scout|make|status>`)
- `engine/render/` Node renderer: HTML/canvas templates rendered frame-by-frame in headless Chromium -> ffmpeg.
  Add new looks as new styles/templates there; it can draw anything code can draw.
- `config/sources.json` podcasts (RSS feeds, priority, permission status). `data/ledger.json` what we've used.
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
| Lead / editor-in-chief (the routine) | session model | final picks, hooks, QA, delivery |
| Clip scout | sonnet | read one episode's scout.md, return top candidates scored with the rubric |
| Engine engineer | opus | renderer styles, pipeline features, performance |
| QA | haiku | mechanical checks on stills/ffprobe output, ledger/deliveries consistency |
| Skeptic | opus | Sunday review of performance data and the rubric |

## Rules (hard)
1. Kill switch: if `ops/PAUSE` exists, do nothing except log and notify.
2. Real people: only their real words, unaltered in meaning. Never synthesize a real person's voice, face or likeness,
   never put words in their mouth, never splice to change meaning. Original content (e.g. narrated explainers) must
   use clearly synthetic narrators and no real-person likeness.
   AI-generated visuals: realistic people and scenes are allowed only as FICTIONAL, generic illustrations (a person at
   a laptop, a data center, a robot arm). Never generate a real or identifiable person, a public figure, a real
   brand's logo, or a realistic depiction of a real news event as if it were footage. Every AI-generated beat carries
   the on-screen "AI-generated illustration" label, and every explainer asks Charlie to switch on the platform's
   AI-generated-content label. Prefer licensed stock footage (Pexels/Pixabay) for "real life" shots.
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
