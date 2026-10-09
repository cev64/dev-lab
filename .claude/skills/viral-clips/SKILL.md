---
name: viral-clips
description: Make faceless, captioned 60-75 s vertical clips about AI from popular podcast episodes (Opus Clip-style) with this repo's engine — find AI episodes, transcribe, pick the moments most likely to go viral with the scoring rubric, cut, render, QA and deliver. Use for the nightly clip run or any request to make, judge or improve clips.
---

# Viral clips: the nightly method

You turn long podcast episodes into short vertical videos that make a stranger stop scrolling, watch to the end and
share. The engine does the mechanics; YOUR judgment picks the moments. Spend most of your thinking on selection and
the hook headline: a perfectly rendered boring clip is worthless.

Reference: `docs/playbook.md` (evidence and sources), `docs/specs/clip-contract.md` (data formats),
`engine/render/README.md` (renderer). Commands run from the repo root unless noted.

## 0. Setup (fresh container, ~5 min)
```
bash scripts/setup.sh            # venv, Python deps, renderer deps, whisper models
source .venv/bin/activate
```

## 1. Find episodes (5 min)
```
cd engine && python -m clipper discover --days 45 --limit 30 && cd ..
```
- Read `work/episodes.json`. Pick 2-3 episodes for tonight (more candidates = better clips), favouring:
  AI relevance in the title (strongest signal) > show reach and priority > recency (last 14 days) > show variety
  (no show twice in a night; rotate shows across nights; check `data/ledger.json` for what ran recently).
- Skip: episodes already in the ledger, the show's own clip/"best moments" episodes, news recaps where AI is one
  item among ten, shows on the blocklist in `data/ledger.json`.

## 2. Fetch, transcribe, scout (the slow part: ~15-20 min per 2-3 h episode)
```
cd engine
python -m clipper fetch <eid>
python -m clipper transcribe <eid>          # whisper base.en, cached; add --max-minutes N to test
python -m clipper scout <eid>
cd ..
```
Run episodes one after another (each uses all 4 cores). While one transcribes, read the scout file of the previous.
Do not use `--publisher` for timing: feed-provided transcripts (e.g. Diary of a CEO) were offset from the audio we
download because ads are inserted dynamically — on 2026-10-09 a clip cut at the transcript's timestamp contained a
different passage. `make` now runs an alignment check and refuses clips whose audio doesn't match the chosen words.

## 3. Select moments (the core skill)
Read `work/episodes/<eid>/scout.md`. Start with the AI-dense windows index at the top, but read the surrounding
text: the best moment often starts 20-60 s before the keywords spike. For long episodes, delegate one episode per
subagent (sonnet) with this file's section 3 pasted in, asking for its top 4 candidates as JSON with scores; then you
(the lead) re-score the finalists yourself and pick.

For every candidate, write down: start/end (s), the first sentence, the last sentence, the one-line idea, and the
rubric scores. Re-read every finalist yourself before choosing:
```
cd engine && python -m clipper text <eid> <start> <end>     # transcript lines with their start/end seconds
```
Boundaries are EXACT by default: `make` keeps your start/end and only nudges them into the nearest gap between words,
so give the start time of the first word you want and the end time of the last word (from `text` or
transcript.json). Add `"rough": true` to a selection only if your times are approximate and you want the engine to
hunt for nearby sentence breaks. Finding the boundaries:
- START on the strongest sentence that is understandable cold: a bold claim, a surprising number, a question that
  creates tension. Cut the host's long question; if the answer needs it, keep only its last clause.
- Never start on "so", "and", "yeah", "I mean", "as I said", or a pronoun whose referent was earlier
  ("he", "it", "that thing"). If context is missing, the hook headline must supply it.
- END on the payoff: the punchline, the reveal, the sharpest line, or a laugh. Cut right after it; no trailing
  "yeah, anyway". If the last line echoes the opening claim, the loop is seamless (bonus).
- Length 62-75 s (the engine snaps to pauses and enforces 58-80 s). One idea per clip.
- Never reorder sentences or splice to change meaning. Never pick a segment containing an ad read.

### Scoring rubric (score 1-5 each; points = weight x score / 5; max 100)
| # | Criterion | Wt | 1 | 3 | 5 |
|---|---|---|---|---|---|
| 1 | Hook in first 1-3 s | 20 | warm-up, filler | clear topic, no tension | bold claim/question/shock in sentence one |
| 2 | Standalone context | 15 | needs earlier context | needs one on-screen label | fully clear cold; subject named in 5 s |
| 3 | Single clear idea | 10 | tangents | one idea, some drift | one idea, opened and closed |
| 4 | Emotion / controversy / surprise | 15 | flat explainer | mild opinion | fear, awe, anger, laughter, counter-intuitive turn |
| 5 | Specific claims and numbers | 10 | vague | one concrete example | dated, numbered, checkable |
| 6 | Named entities | 5 | none | generic | OpenAI, Altman, Musk, Nvidia, Anthropic... named and relevant |
| 7 | Viewer stakes | 10 | abstract | industry-level | jobs, money, kids, privacy, safety, "do this now" |
| 8 | Payoff / ending | 10 | trails off | reaches a conclusion | punchline or sharpest line in the last 3 s |
| 9 | Quotability | 3 | none | decent line | screenshot-worthy line <= 12 words |
| 10 | Loop potential | 2 | flat end | tidy beat | ending echoes the opening |

Gates (instant fail): criterion 1 or 2 scores 1; outside 55-80 s; crosstalk or music that breaks captions; a
plausibly false or defamatory claim about a named person; private individuals, minors, health or legal allegations.
Ship rule: >= 70 ships; 60-69 only to fill the night's 3; < 60 never. Prefer 3 different episodes, or at least 3
different ideas. Stale news (old model names, outdated valuations) loses points on criterion 7.

What tends to win for AI content: "AI will take X job" with a timeline; an insider admitting fear or doubt; a
concrete demo story ("I built X in 20 minutes"); a surprising number; a famous person reacting with awe or
alarm; a funny tangent where a comedian riffs on AI; parenting/kids and AI; money and AI. What loses: technical
architecture talk without stakes, hedged both-sides answers, inside-baseball names with no context.

## 4. Write the packaging for each pick
- **Hook headline** (on screen for the first ~3 s, then docked): <= 8 words, true to the clip, uses a name or a
  number where possible, no all-caps shouting, no clickbait the clip doesn't pay off. Attribute claims
  ("Altman says..."). Formulas that fit AI:
  `[Name] says AI will [X] by [year]` · `Your [job] has [N] years left` · `[CEO] admits [surprising thing]` ·
  `Nobody is ready for [thing]` · `[N]% of [thing] is already AI` · `Why [Company] is scared of [X]` ·
  `What AI engineers fear most` · `He built [X] with AI in [time]` · `[Name]: "[6-word quote]"` ·
  `Is [AI product] making us dumber?` · `Watch this before using ChatGPT` · `The $[N] billion AI mistake`.
- **topic**: 1-2 word chip (AGI, JOBS, ROBOTS, KIDS, MONEY, SAFETY, CHATGPT...).
- **emphasis**: 2-5 words/phrases from the clip to colour (names, numbers, the key noun).
- **title** (file/ledger), **caption** (line 1 new angle on the hook; line 2 `From [Show], ep. "[Title]" with
  [Guest]. Full episode on all podcast apps.`; line 3 a question that invites comments), **hashtags** 3-5: one
  broad (#ai), one topical (#chatgpt/#openai/#agi), one niche (#aiagents/#futureofwork), one audience (#techtok).

- **speakers**: the people heard, from the episode description (e.g. "Steven Bartlett & Jeffrey Ladish"). If you
  can't tell who is speaking on a panel show, use "<Host> & guests"; never guess a name.
- **fixes** (optional): caption corrections for transcription errors only, e.g. `{"Aortman": "Altman",
  "OpenEye": "OpenAI"}`. Scan the clip's words for misheard names before rendering. Never use fixes to change what
  someone said.
- **style** (optional): `neural | flow | horizon | orb`. Leave it out and `make` rotates styles so the night's
  clips all look different.

Write all picks to `work/selections-<date>.json` (format in the clip contract), then:
```
cd engine && python -m clipper make --selections ../work/selections-<date>.json && cd ..
```

## 5. QA every clip before delivering (do not skip)
```
node engine/render/render.mjs --clip work/clips/<id>/clip.json --out /tmp/qa.mp4 --frames-only 3,90,1000,1900
ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate -of compact out/<date>/<id>.mp4
ffmpeg -nostats -i out/<date>/<id>.mp4 -af ebur128 -f null - 2>&1 | grep -E "I:|Peak" | tail -2
```
Look at the stills yourself. Check: hook readable at t=0.1 s; captions on the right words (compare the clip's first
and last caption words with the transcript); nothing overflows or sits outside x 60-915, y 150-1540; credit
readable; 58-80 s; 1080x1920 @ 30 fps; integrated loudness about -14 LUFS. Listen-proxy: the first word of
`words` should start within 0.3 s of t=0 and the clip must not end mid-word. Re-cut or re-hook anything that fails.

## 6. Deliver
- Send the 3 MP4s (and their cover PNGs) to Charlie with `SendUserFile` (status proactive), caption = the 3 hooks.
- Backup: `bash scripts/publish-videos.sh <date>` (pushes branch `videos/<date>`; prunes branches > 14 days).
- `deliveries/<date>.md` (written by `make`) holds the post copy; make sure it's committed.

## 7. Rights and safety (every clip)
- Credit on screen and in the caption; never imply endorsement; never alter meaning; no AI voices or synthetic
  likeness of real people, ever.
- Max one clip per episode per night, <= 75 s, never a run of consecutive segments from one conversation.
- Prefer shows with permission or an official clip channel; record permission status per show in `config/sources.json`.
- On any takedown/complaint Charlie reports: add the show to the blocklist in `data/ledger.json`, log it, and stop
  using it. Three strikes on any show = permanent block.

## 8. Learn
If `ops/PERFORMANCE.md` has new rows from Charlie (views, avg watch %, shares per clip), on Sundays compare top vs
bottom quartile by rubric criterion, hook formula and show; adjust at most two rubric weights per week here and in
docs/playbook.md, and record why in ops/LOG.md.
