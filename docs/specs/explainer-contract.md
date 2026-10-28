# Original explainer track: contract (v1)

Fully original 60-75 s vertical videos about real AI news: a fact-checked script written by the nightly agent, read by
a clearly synthetic open-source TTS narrator, fully animated with code (story-specific scenes with cartoon
characters and objects, plus animated data cards) and word-by-word captions. No B-roll. No real
person's voice, face or likeness. Eligible for platform originality programs (unlike podcast clips).

```
work/explainers/<id>/script.json     written by the agent (below)
work/explainers/<id>/voice.wav       TTS narration, loudness-normalised (-14 LUFS, -1 dBTP)
work/explainers/<id>/clip.json       renderer input (clip contract + beats with times)
out/YYYY-MM-DD/<id>.mp4              final video (+ .cover.png and .thumbnail.png)
out/YYYY-MM-DD/<id>.drive.json       {title, text}: the Google Doc filed in Charlie's Drive folder (config/drive.json)
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
  "followUp": false,
  "sources": [ { "publisher": "The Verge", "title": "...", "url": "https://..." } ],
  "post": {
    "title": "...",
    "cover": "Google's AI works with your laptop shut",
    "tiktok": "Searchable hook line 💻\nWhat happened, 1-2 sentences.\nOne question? 👇",
    "instagram": "Hook line\nWhat happened, 2-3 sentences.\n💬 Question?\n📤 Share prompt.",
    "youtubeTitle": "Google's new AI agent keeps working after you close your laptop",
    "pinnedComment": "Either/or poll: 🤖 = yes, 😬 = no",
    "sources": "The Verge, Google",
    "hashtags": ["#ai", "#google", "#aiagents", "#technews"]
  }
}
```
- Format v2 (2026-10-27): beat 1 is a full-frame scene (cold open; `explainer` refuses anything else); the last beat
  is `scenes/token-take.js` (Token's take + question); the last line runs into the hook (loop). Optional script keys:
  `"loop"` / `"camera"` (default true; false turns the loop dissolve / the scene zoom off). Audio is the narration
  only (Charlie adds a trending TikTok sound when posting).
- 5-8 beats, ~150-180 words total (Kokoro am_michael at speed 1.0 with phrase pauses, measured 2026-10-26: 168 words
  gave 69-71 s; seconds ~= words / 2.45 + 3.2, so this gives ~62-76 s).
- Cadence (optional, see the skill's "Write for the voice"): a beat may set `"pace"` (0.85-1.15, default 1.0), and
  `say` may use `*word*` (stress a weakly read word) and `|` (a deliberate breath). Markup never reaches captions,
  the delivery note or the Drive card. The 62-75 s duration rule is unchanged. Beat 1 is the hook, spoken in <= 3 s.
- `post` is the paste-ready post kit (`explainer` writes it into deliveries/<date>.md): `cover` (<= 7 words, the
  cover/title text), `tiktok` (description body), `instagram` (Reels caption body), `youtubeTitle` (Shorts title, <= 70 chars; the
  Shorts description reuses the `tiktok` body, or `youtube` if set), `pinnedComment` (posted from the
  channel account and pinned), `sources` (publisher names), `hashtags` (3-4 topical). The command appends the follow
  line, "Sources: ... AI narrator." and the hashtags (#thedailytoken first, 5 max) to both bodies. An old-style
  `caption` still works as a fallback.
- `thumbnail` (optional): `{"highlight": "inside it"}`, words of the hook that the thumbnail's title card colours in
  the accent. Without it the thumbnail uses the hook's own highlight (`emphasis`/`topic`/a number), else the card's
  last line.
- `followUp`: true only when retelling a story we covered in the last 7 days because of a genuinely new development.
  Without it, `explainer` refuses a script that shares a source URL with a recent ledger entry.
- Every factual claim must be supported by `sources` (>= 2 independent sources for the main claim). Quotes verbatim.
  Numbers exactly as published. Speculation is labelled as such in the narration ("could", "analysts expect").
- Visual types: scene (story-specific animation module; see engine/render/README.md), title, stat, compare, list,
  quote, timeline, keyword. Text fields short (fit the safe box). 3+ scenes per explainer.

## clip.json additions for explainers (renderer input)
Same as the clip contract (`audio`, `duration`, `words`, `envelope`, `hook`, `topic`, `emphasis`, `theme`) plus:
```json
{ "template": "ai-explainer",
  "beats": [ { "t0": 0.0, "t1": 3.1, "visual": { "type": "title", "text": "..." } } ],
  "credit": {} }
```
- `credit` is empty: owner decision, nothing at the bottom of explainers (no credit line, no progress bar). The
  "AI narrator" disclosure lives in the post caption and the platform's AI-generated label.
- Disclosure: "AI narrator" in the post caption + Charlie switches on the platform's AI-generated label when posting.
- Thumbnail (2026-10-28): `<id>.thumbnail.png` is the v1 opening frame as a picture: the big hook card, solid
  (nothing behind it shows through), in its v1 place (centre y 560, inside TikTok's 3:4 profile-grid crop), over the
  cover's scene frame, with a highlighted phrase. Charlie uploads it as the cover, since v2 opens cold on the action.
- Layout (v2): no big hook card in the video (the header pops in at t = 0; the cover still uses the big card);
  captions centred at y 1265; full scenes are drawn zoomed 1.10 -> 1.15x around (487, 500), so the stage
  (x 60-915, y 400-1050) fills about x 0-980, y 388-1130; the last 0.4 s dissolve into the opening scene.
- Layout (v1, still the clips' layout): hook card -> docked header (same as clips); scenes are full-frame with the action in the stage area
  (x 60-915, y 400-1050); data cards sit in the middle band (y ~ 520-1000); captions y 1050-1350; nothing below the
  captions. Safe box x 60-915, y 150-1540.
