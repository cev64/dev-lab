# Clip engine contract (v1)

Faceless short-form clips (TikTok / Instagram Reels / YouTube Shorts) cut from public podcast episodes about AI.
Source = the publisher's public podcast RSS audio (YouTube blocks this datacenter IP; do not build on yt-dlp/cookies).
Output = 1080x1920, 30 fps, H.264 + AAC MP4, 60-75 s (TikTok Creator Rewards needs > 60 s), with animated
word-by-word captions, a hook headline, a source credit, and code-generated audio-reactive visuals.

```
config/sources.json         podcasts we pull from (name, feed URL, credit format, priority)
engine/clipper/             Python pipeline (discover, fetch, transcribe, scout, cut, make, package, ledger)
engine/render/              Node renderer (HTML/canvas templates rendered frame-by-frame in headless Chromium)
work/                       scratch (gitignored): episodes, transcripts, clip audio, renders
out/YYYY-MM-DD/             finished videos + covers (gitignored)
deliveries/YYYY-MM-DD.md    committed: post copy, credits, timestamps for each delivered clip
data/ledger.json            committed: episodes processed + clips made (dedupe across nights)
```

## Pipeline CLI (Python, run as `python -m clipper <cmd>` from `engine/`)
- `discover [--days 45] [--limit 30]` -> `work/episodes.json`: recent episodes from config/sources.json whose title or
  description matches AI keywords, not yet in the ledger, ranked (AI relevance x show priority x recency).
- `fetch <eid>` -> `work/episodes/<eid>/audio.mp3` (+ `meta.json`).
- `transcribe <eid> [--model base.en]` -> `work/episodes/<eid>/transcript.json` (cached; word timestamps).
  Prefer a publisher transcript if the feed offers one (`podcast:transcript`), else faster-whisper int8 on CPU.
- `scout <eid>` -> `work/episodes/<eid>/scout.md` (human/LLM-readable: ~30 s paragraphs prefixed `[hh:mm:ss]`,
  each tagged with AI-keyword density and audio energy, AI-dense stretches marked) and `windows.json`.
- `make --selections <file>` -> for each selection: cut + refine + render + package. Selections file:
  `[{ "eid", "start", "end", "hook", "topic", "title", "caption", "hashtags": [...] }]` (start/end in seconds).
  - cut/refine: snap start/end to sentence or pause boundaries within +-4 s, enforce 58-80 s, extract audio,
    loudness-normalize (-14 LUFS, true peak -1 dB), re-transcribe the clip with `small.en` for exact word timings,
    compute a per-frame (30 fps) loudness envelope 0..1, write `work/clips/<id>/clip.json` (below).
  - render: `node engine/render/render.mjs --clip <clip.json> --out out/<date>/<id>.mp4`.
  - package: append to `deliveries/<date>.md`, write the cover PNG next to the mp4, add to ledger.

## clip.json (renderer input)
```json
{
  "id": "2026-10-09-lex-452-agi-timeline",
  "fps": 30,
  "duration": 66.4,
  "audio": "/abs/path/work/clips/<id>/audio.wav",
  "envelope": [0.12, 0.30, ...],
  "words": [{ "w": "So", "s": 0.00, "e": 0.18 }, { "w": "AGI", "s": 0.20, "e": 0.61 }],
  "hook": "He thinks AGI is 3 years away",
  "topic": "AGI",
  "credit": { "show": "Lex Fridman Podcast", "episode": "#452 - Dario Amodei", "speakers": "Lex Fridman & Dario Amodei" },
  "theme": { "seed": 48213, "style": "auto" },
  "emphasis": ["AGI", "three years"]
}
```
- `words` are relative to the clip start. Punctuation stays attached to words. `emphasis` (optional) words/phrases
  get the accent colour when spoken.
- Renderer must work with only `audio`, `duration`, `words`, `hook`, `credit` present (others optional).

## Video design rules (summary; the renderer owns details)
- Safe zones: keep text inside x 60..960, y 220..1500 (TikTok/Reels UI covers the right edge and bottom ~400 px).
- Captions: 2-4 words per group, big (>= 80 px), heavy weight, white with strong outline/shadow, active word
  highlighted + subtle pop, groups break on punctuation/pauses. Never more than 2 lines.
- Hook: big headline for the first ~3 s, then docks small at the top for the rest of the clip.
- Credit always visible and readable: show + episode + speakers. No logos, no cover art, no photos of people.
- Visuals: dark, AI-themed, generative, audio-reactive, seeded per clip; several styles so the feed does not repeat.
- No emoji, no fake UI, no gambling/financial-advice language, nothing implying endorsement by the show.
