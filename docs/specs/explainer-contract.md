# Original explainer track: contract (v1)

Fully original 60-75 s vertical videos about real AI news: a fact-checked script written by the nightly agent, read by
a clearly synthetic open-source TTS narrator, with code-generated visuals per beat and word-by-word captions. No real
person's voice, face or likeness. Eligible for platform originality programs (unlike podcast clips).

```
work/explainers/<id>/script.json     written by the agent (below)
work/explainers/<id>/voice.wav       TTS narration, loudness-normalised (-14 LUFS, -1 dBTP)
work/explainers/<id>/clip.json       renderer input (clip contract + beats with times)
out/YYYY-MM-DD/<id>.mp4              final video (+ .cover.png)
```

## Commands (from `engine/`)
- `python -m clipper news [--days 3]` -> `work/news.json`: recent AI headlines from config/news_sources.json feeds
  (title, publisher, url, published, summary), deduped, ranked by recency x source weight.
- `python -m clipper voice --script <script.json>` -> voice.wav + word timings (TTS, then whisper alignment) + beat
  start/end times. Fails if the narration is outside 58-80 s (tells you how many words to cut/add).
- `python -m clipper explainer --script <script.json> [--date D]` -> voice (if needed) + clip.json + render + package
  (deliveries/<date>.md block with sources, ledger entry under "explainers").

## script.json (written by the agent)
```json
{
  "id": "2026-10-10-explainer-agents-jobs",
  "hook": "AI agents just got a real job",
  "topic": "AGENTS",
  "beats": [
    { "say": "One sentence or two of narration.", "visual": { "type": "title", "text": "Agents are here" } },
    { "say": "...", "visual": { "type": "stat", "value": "40%", "label": "of new code at Google is AI-written",
                                 "source": "Google earnings call, Oct 2026" } },
    { "say": "...", "visual": { "type": "compare", "unit": "tokens", "items": [
        { "label": "2023", "value": 8000 }, { "label": "2026", "value": 2000000 } ] } },
    { "say": "...", "visual": { "type": "list", "items": ["Writes code", "Books travel", "Files reports"] } },
    { "say": "...", "visual": { "type": "quote", "text": "Exact quote, verbatim", "by": "Name, where said" } },
    { "say": "...", "visual": { "type": "timeline", "items": [ { "t": "2022", "label": "ChatGPT" } ] } },
    { "say": "...", "visual": { "type": "keyword", "text": "ONE WORD" } }
  ],
  "emphasis": ["40%", "agents"],
  "voice": "default",
  "sources": [ { "publisher": "The Verge", "title": "...", "url": "https://..." } ],
  "post": { "title": "...", "caption": "line 1\nSources: The Verge, Google blog\nquestion?", "hashtags": ["#ai"] }
}
```
- 5-8 beats, 150-185 words total (about 60-75 s at the narrator's pace). Beat 1 is the hook, spoken in <= 3 s.
- Every factual claim must be supported by `sources` (>= 2 independent sources for the main claim). Quotes verbatim.
  Numbers exactly as published. Speculation is labelled as such in the narration ("could", "analysts expect").
- Visual types: title, stat, compare, list, quote, timeline, keyword. Text fields short (fit the safe box).

## clip.json additions for explainers (renderer input)
Same as the clip contract (`audio`, `duration`, `words`, `envelope`, `hook`, `topic`, `emphasis`, `theme`) plus:
```json
{ "template": "ai-explainer",
  "beats": [ { "t0": 0.0, "t1": 3.1, "visual": { "type": "title", "text": "..." } } ],
  "credit": { "show": "Original explainer", "episode": "Sources in caption", "speakers": "AI narrator" } }
```
- The narrator is labelled "AI narrator" on screen (honest disclosure; also tell Charlie to switch on the platform's
  AI-generated label when posting).
- Layout: hook card -> docked header (same as clips), the beat visual in the middle band (y ~ 560-1020), captions
  y 1050-1350, credit/sources line y 1400-1500, progress bar ~1520. Safe box x 60-915, y 150-1540.
