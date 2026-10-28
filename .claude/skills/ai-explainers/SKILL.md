---
name: ai-explainers
description: Make one original 60-75 s vertical AI-news explainer — pick a real story with the selection rubric, fact-check it against >= 2 sources, write a beat-by-beat script, voice it with the synthetic narrator, add beat animated cards and story-specific animated scenes, render, QA and deliver. Use for the nightly explainer or any request to make or improve explainers.
---

# AI explainers: the nightly method

The clip track borrows other people's words. This track is ours: our story choice, our facts in our own words, our
visuals, a clearly synthetic narrator. It is the channel's monetizable content, so quality and accuracy matter more
than speed. Evidence: `docs/explainer-playbook.md`. Formats: `docs/specs/explainer-contract.md`, scenes + illustration kit: `engine/render/README.md`.

## 0. Nightly team workflow (3 explainers)
Charlie posts three a day (morning, midday, evening), so each night delivers **3 explainers on 3 different stories**.
1. Lead: run `news`, score the candidates (section 1), pick the best 3 that clear the gates. Make them different:
   different companies and different kinds of story (e.g. one money/jobs, one product/people, one weird/ethics).
   If only 1-2 clear the bar, make 1-2 and say why — never pad with weak or unverifiable stories.
2. Lead: spawn 3 **producer** subagents (model: opus) in parallel, one per story. Give each: the story and its source
   URLs, this skill's sections 2-5, the id `<date>-explainer-<slug>`, its working folder work/explainers/<id>/,
   the style it must use (`neural`, `flow`, `horizon` or `orb`; all different), and the instruction to stop after
   rendering and report: the claim table, the storyboard, the scene modules written, still paths, duration, LUFS.
   Producers must not commit or deliver.
3. Lead review (the quality gate): read each claim table against the script (delete or fix any unsupported claim and
   re-render); look at each explainer's stills; reject anything that fails the rules. Then deliver (section 6).
4. Producers' good new scenes: the lead copies the best reusable ones into the shared scene library on a branch +
   PR (they are code), so the library grows every night.

## 1. Pick the story (10 min)
First read `ops/PERFORMANCE.md`: once Charlie has logged numbers, prefer the kinds of story, hooks and formats with
the best average watch time and shares, and note in the delivery what you changed because of them.
```
cd engine && python -m clipper news --days 3 && cd ..     # -> work/news.json, top 15 printed
```
Score the top ~8 stories with the rubric (playbook section 3; weights sum to 100):
freshness 20 · mass-audience stakes 20 · surprise/number 15 · visual potential 10 · verifiability 20 ·
controversy without defamation 15. Gates: < 2 independent sources; > 72 h old with nothing new; single-outlet rumour;
accuses a named person/company of wrongdoing not established by a court, regulator or their own admission; only
tellable as stock/medical/legal advice; already covered (`news` prints ALREADY COVERED from `data/ledger.json`; also
compare with the doc titles in Charlie's Drive folder DailyToken, config/drive.json), unless there is a genuinely new
development, told as a follow-up (`"followUp": true` in the script; the hook says what is new);
needs a real person's voice or likeness. Ship score >= 70, else skip tonight and log why.

Prefer stories a non-technical person would retell at dinner: money, jobs, kids, privacy, safety, a strange new
behaviour, a big number. Avoid inside-baseball benchmark news unless the number is spectacular.

## 2. Fact-check (15 min, mandatory)
Open the primary source (lab post, paper, filing, official statement) and at least one independent outlet with
WebFetch. Two outlets repeating one press release count as one. Write a claim table in your notes:
`claim | source URL | exact supporting phrase`. Delete any claim without a row. Numbers exactly as published with
unit and date; quotes verbatim (<= 15 words), attributed, first-hand only; speculation hedged ("could", "has not
said", "analysts expect"). No motives or guilt; prefer "alleges", "according to". Google News links: resolve to the
publisher URL before citing.

## 3. Write the script (15 min)
`work/explainers/<id>/script.json` per the contract. 5-8 beats, **~150-180 words, narration 62-75 s** (narrator since 2026-10-26: Kokoro am_michael at speed 1.0 with
phrase pauses, ~2.4-2.5 words/s: 168 words gave 69-71 s; seconds ~= words / 2.45 + 3.2; trim if over 75 s).

**Write for the voice (cadence; owner ask 2026-10-26).** The narrator reads each beat in one breath-group and
lengthens the pauses your punctuation asks for, so the script *is* the cadence. Read every beat aloud before voicing.
- Talk, don't recite: contractions (it's, isn't, they're), plain verbs, the way you'd tell a friend. Lead-ins people
  actually say are fine once or twice a script ("So", "Now", "Here's the thing").
- Vary sentence length: mix 2-6 word sentences with 12-20 word ones; never three sentences of the same length or
  shape in a row. A sentence over ~22 words, or with more than one comma-clause, gets split.
- End on the point: English stresses the last important word, so put the number or key word last ("For the other
  493? Flat." not "Flat is how the other 493 did"). Attribution goes at the start or end, short ("he says"), never
  stacked mid-sentence with dates and titles.
- Punctuation is timing: period = full stop and breath (~0.4 s); question mark = a lift and ~0.4 s; colon = set-up
  then reveal (~0.26 s); comma = a small catch; a 1-2 word sentence ("Flat.") is a punchline and gets extra air
  before and after (use once or twice per script). Don't add periods mid-thought just to slow it down.
- No list rhythm: at most one list per script, of 2-3 items, said as "X, Y, and Z". No headline fragments or
  "Number one... number two" read as a sentence.
- Numbers as people say them in speech; captions still show the digits.
- Markup the engine honours (stripped from captions and post copy): `*word*` stresses a small word the voice
  reads weakly (not, isn't, only, still, was) for contrast, at most 2-3 per script; `|` is a deliberate breath
  (~0.3 s) before a reveal, at most 1-2 per script; a beat's `"pace"` (0.85-1.15, default 1.0) speeds or slows the
  whole beat: ~1.03 for the hook, ~0.96 for the quote, caveat and payoff.
- Beat 1 hook: one breath, <= 9 words, no stop or question inside it, so it lands in about 3 s.

**Format v2 (owner decision 2026-10-27; videos stay >= 62 s; audio stays voice only: Charlie adds a trending
TikTok sound when he posts, so no music or sound effects).** Three things every explainer now does:
1. **Cold open.** Beat 1 is a full-frame `scene` that shows the story's most dramatic moment already in motion at
   frame 0 (the robot sliding the file into the mail slot and the BLOCKED stamp landing; the S-1 hitting the desk;
   the proof checker's green tick). No establishing shot, no title card: there is no big hook card any more (only
   the small header, which pops in at t = 0; the cover image still shows the big hook). The hook line says the
   stakes in viewer terms, and the rest of the video goes back and explains ("Here's what happened."). Usually the
   same scene module as the climax beat later, with its cues set so the action peaks inside the first ~2.5 s.
   `explainer` refuses a script whose beat 1 is not a full scene.
2. **Token's take.** The robot mascot is called **Token**. The last beat is always `scenes/token-take.js`: the
   narrator says "Token's take:" and one short opinion line (<= 14 words) that is clearly a take, not a fact: no new
   claims, no advice (financial, medical, legal), no accusations; e.g. "Token's take: a sandbox is only as good as
   the person who checks it." Then the comment question (shown on the card with two chips).
3. **Loop.** The video's last frames dissolve back into the cold open, so write the last words to run into the
   hook: the final sentence is the question, then a 2-5 word lead-in that the hook completes when the video
   restarts ("...Would you run a model you didn't build? Because this week," -> "An AI model tried to phone home").
   Read last line + hook aloud as one sentence; it must make sense.

| Beat | Job | Words | Visual |
|---|---|---|---|
| 1 | Cold open: hook spoken in <= 3 s over the story's peak moment | 6-9 | scene (the action) |
| 2 | What happened: who, what, when, per whom | 28-32 | scene |
| 3 | The number | 22-26 | stat or scene |
| 4 | Context or comparison | 28-32 | scene / compare / timeline |
| 5 | Why a normal person cares | 28-32 | scene |
| 6 | The caveat: unknown or disputed, hedged | 18-22 | scene / quote |
| 7 | Token's take + the question + the loop lead-in | 22-30 | scene: token-take.js |

Write for the ear: short sentences, concrete nouns, no jargon without a gloss, numbers said the way people say them
("two million", not "2,000,000"; the card shows the digits). Hook formulas that fit: number shock, reversal ("said it
would never... this week it did"), your-job stake, counter-intuitive, two-sided. No "AI is changing everything".

**Scenes are the main event (owner decision):** an explainer is a short animated film of what happened — characters
and objects acting out the story in a setting (a person on a sofa typing at a chatbot, the AI ending the chat, a
company's rulebook being rewritten, a robot at a desk doing someone's job, money flowing between buildings). At least
70% of the runtime is full-frame `scene` beats; animated data cards (stat, compare, timeline...) are support, max 1-2
beats, used only when a number or sequence is the point. Write the scenes for THIS story (the template zooms every full scene in ~1.10-1.15x around the stage, with a slow
push-in, so keep action and text inside `info.stage` and it will fill the phone screen): use the kit's characters,
objects and `world` settings, sync key actions to the narration with `info.wordAt(t)`, and let one scene run across
several beats when the story continues in the same place (`span`). Reuse/adapt modules in
engine/render/templates/ai-explainer/scenes/ when they fit; save good new ones there for future nights. Plan it like a
storyboard first (one line per beat: setting, who, what happens, what changes), then write the modules, then preview
stills at several t before the full render.

**Fully animated, no B-roll (owner decision 2026-10-09):** no stock footage, no AI-generated images. Every beat
is either a `scene` (preferred for the story's moments: 3+ scenes per explainer) or an animated card (stat, compare,
list, quote, timeline, title, keyword), over the generative animated background. People in scenes are the kit's
stylised cartoon characters only — never a real or recognisable person, never a logo.

**Post kit** (`post` in script.json; the `explainer` command turns it into paste-ready blocks in the delivery note):
- `cover`: <= 7 words for the cover/title text, usually the hook.
- Thumbnail (script `thumbnail.highlight`, optional): the render writes `<id>.thumbnail.png`, the big title card as a
  picture for the post's cover (v2 videos open on the action, so no frame of the video works as a cover). Set
  `highlight` to the 1-3 hook words that carry the punch ("inside it", "it's on you"); they show in the accent.
- `tiktok`: line 1 is the hook as a searchable sentence with the names people type into TikTok search (company,
  product, topic) + one emoji; then 1-2 sentences of what happened; last line one easy question + 👇.
- `instagram`: same facts, a little fuller (2-3 sentences); then `💬` + the question and `📤` + a share/tag prompt
  ("Send this to the coworker who...", "Tag the friend who...") — shares and saves drive Reels reach.
- `youtubeTitle`: YouTube Shorts title, <= 70 characters, the hook as a searchable statement (names first; no
  clickbait the video doesn't pay off). The Shorts description reuses the `tiktok` body (or `youtube` if set) with a
  subscribe line.
- `pinnedComment`: an either/or emoji poll that takes one tap to answer ("🔓 = keep it open, 🔒 = lock it down").
- `sources`: publisher names; `hashtags`: 3-4 topical (broad #ai + 2 niche + #technews). The command adds the follow
  line, "Sources: ... AI narrator." and #thedailytoken (5 tags max). No #fyp/#viral spam, no bait ("part 2?") we
  won't deliver, and every fact in the post text must be in the claim table.

## 4. Voice and render (from engine/; ~10 min)
```
python -m clipper voice --script ../work/explainers/<id>/script.json      # fails with a word budget if not 62-80 s
python -m clipper explainer --script ../work/explainers/<id>/script.json
```
Scene modules referenced by relative path resolve against the clip.json folder (work/explainers/<id>/); put story
scenes in work/explainers/<id>/scenes/ or reference the shared library under engine/render/templates/ai-explainer/scenes/.
If `voice` says the narration is too short or long, edit the words (not the TTS speed) and re-run.

## 5. QA (do not skip)
Dump stills mid-beat for every beat (`node engine/render/render.mjs --clip <clip.json> --out /tmp/qa.mp4
--frames-only ...`) and look at them: every card legible and inside x 60-915, y 150-1540; captions match the script;
"AI narrator" credit visible; every beat animated (no static card held for > 4 s without motion); cartoon
characters clearly stylised and never resembling a real person; frame 0 already shows the action (cold open);
the last second dissolves back to the opening; Token's take card is legible. ffprobe: 1080x1920, 30 fps, 62-80 s. Loudness about -14 LUFS. Re-read the claim table one
last time against the final script.

## 6. Deliver
SendUserFile with the 3 MP4s, their 3 `.thumbnail.png` + `deliveries/<date>.md` (the explainer command writes each block: cover text, thumbnail, TikTok
description, Instagram caption, YouTube Shorts title + description, pinned comment, sources). To fix post copy after rendering, edit `post` and re-run
`explainer --no-render --date <date>` (rewrites that block only). Order them for posting: the strongest hook goes to the evening slot (~6-9pm ET), the next to
midday (~12pm), the third to the morning (~8am); write that order at the top of the delivery note. Then
`scripts/publish-videos.sh <date>` (backup branch) and commit the ledger + delivery note. Drive archive: for each
explainer, read `out/<date>/<id>.drive.json` and create a Google Doc in the DailyToken folder (Google Drive connector
`create_file`: `title`, `textContent` = text, `contentMimeType` "text/plain", `parentId` from config/drive.json; first
check the folder has no doc with that title). The MP4s themselves are too big to pass through the connector: they go to
Charlie in chat and on the `videos/<date>` branch. No Drive connector in the session: log it and carry on. Remind Charlie to switch ON
the platform's AI-generated content label (synthetic narrator).

## 7. Corrections
If a published explainer proves wrong: add it to `ops/NEEDS-CHARLIE.md` the same day (delete or pin a correction),
note it in the ledger, and add the lesson to this file.
