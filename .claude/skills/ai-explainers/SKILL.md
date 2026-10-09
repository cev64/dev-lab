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
`work/explainers/<id>/script.json` per the contract. 5-8 beats, **165-195 words, narration >= 62 s** (the narrator reads ~2.7 words/s).

| Beat | Job | Words | Visual |
|---|---|---|---|
| 1 | Hook, spoken in <= 3 s | 6-9 | title / keyword |
| 2 | What happened: who, what, when, per whom | 28-32 | title / list |
| 3 | The number | 22-26 | stat |
| 4 | Context or comparison | 28-32 | compare / timeline |
| 5 | Why a normal person cares | 28-32 | list / keyword |
| 6 | The caveat: unknown or disputed, hedged | 18-22 | quote / list |
| 7 | Payoff that echoes the hook + one question | 14-18 | keyword |

Write for the ear: short sentences, concrete nouns, no jargon without a gloss, numbers said the way people say them
("two million", not "2,000,000"; the card shows the digits). Hook formulas that fit: number shock, reversal ("said it
would never... this week it did"), your-job stake, counter-intuitive, two-sided. No "AI is changing everything".

**Scenes are the main event (owner decision):** an explainer is a short animated film of what happened — characters
and objects acting out the story in a setting (a person on a sofa typing at a chatbot, the AI ending the chat, a
company's rulebook being rewritten, a robot at a desk doing someone's job, money flowing between buildings). At least
70% of the runtime is full-frame `scene` beats; animated data cards (stat, compare, timeline...) are support, max 1-2
beats, used only when a number or sequence is the point. Write the scenes for THIS story: use the kit's characters,
objects and `world` settings, sync key actions to the narration with `info.wordAt(t)`, and let one scene run across
several beats when the story continues in the same place (`span`). Reuse/adapt modules in
engine/render/templates/ai-explainer/scenes/ when they fit; save good new ones there for future nights. Plan it like a
storyboard first (one line per beat: setting, who, what happens, what changes), then write the modules, then preview
stills at several t before the full render.

**Fully animated, no B-roll (owner decision 2026-10-09):** no stock footage, no AI-generated images. Every beat
is either a `scene` (preferred for the story's moments: 3+ scenes per explainer) or an animated card (stat, compare,
list, quote, timeline, title, keyword), over the generative animated background. People in scenes are the kit's
stylised cartoon characters only — never a real or recognisable person, never a logo.

`post.caption`: line 1 restates the hook as a fact; line 2 `Sources: <Publisher>, <Publisher>. AI narrator.`;
line 3 a question. Hashtags 3-5: #thedailytoken + #ai + topical + #technews (the channel is The Daily Token).

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
characters clearly stylised and never resembling a real person. ffprobe: 1080x1920, 30 fps, 62-80 s. Loudness about -14 LUFS. Re-read the claim table one
last time against the final script.

## 6. Deliver
SendUserFile with the 3 MP4s + `deliveries/<date>.md` (the explainer command writes each block, with sources and
paste-ready post text). Order them for posting: the strongest hook goes to the evening slot (~6-9pm ET), the next to
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
