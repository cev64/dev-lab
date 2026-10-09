---
name: ai-explainers
description: Make one original 60-75 s vertical AI-news explainer — pick a real story with the selection rubric, fact-check it against >= 2 sources, write a beat-by-beat script, voice it with the synthetic narrator, add beat cards and B-roll (stock footage or fictional AI illustrations), render, QA and deliver. Use for the nightly explainer or any request to make or improve explainers.
---

# AI explainers: the nightly method

The clip track borrows other people's words. This track is ours: our story choice, our facts in our own words, our
visuals, a clearly synthetic narrator. It is the channel's monetizable content, so quality and accuracy matter more
than speed. Evidence: `docs/explainer-playbook.md`. Formats: `docs/specs/explainer-contract.md`, `docs/specs/broll.md`.

## 1. Pick the story (10 min)
```
cd engine && python -m clipper news --days 3 && cd ..     # -> work/news.json, top 15 printed
```
Score the top ~8 stories with the rubric (playbook section 3; weights sum to 100):
freshness 20 · mass-audience stakes 20 · surprise/number 15 · visual potential 10 · verifiability 20 ·
controversy without defamation 15. Gates: < 2 independent sources; > 72 h old with nothing new; single-outlet rumour;
accuses a named person/company of wrongdoing not established by a court, regulator or their own admission; only
tellable as stock/medical/legal advice; already covered in the last 7 days (check `data/ledger.json` "explainers");
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
`work/explainers/<id>/script.json` per the contract. 5-8 beats, **150-185 words, narration >= 62 s**.

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

**Custom animation (required, at least one beat per explainer, ideally two):** write a story-specific animated
scene — `{"type":"scene","module":"scenes/<name>.js","params":{...}}` — following "Authoring a scene" in
engine/render/README.md. Animate the story's key moment, not decoration: the chat that gets ended, the price that
collapses, the agent that books the flight, the packets flowing into a data center. Reuse/adapt modules in
engine/render/templates/ai-explainer/scenes/ when they fit and save good new ones there for future nights. Always
preview stills at several t before rendering the full video. Panning B-roll alone never counts as the animation.

B-roll per beat (`broll` field, see docs/specs/broll.md): stock footage when a Pexels/Pixabay key exists
(`{"kind":"stock","query":"server room blue light"}`), else AI illustration (`{"kind":"ai","prompt":"..."}`).
AI prompts describe generic fictional subjects only: "a young woman reading her phone on a train, photorealistic",
"rows of servers in a data center" — never a real person, brand, logo or a real event; the engine refuses those.
Never pair a person shot with a claim so it looks like that person is the subject of the news. Prefer people-free
shots for anything about a specific company.

`post.caption`: line 1 restates the hook as a fact; line 2 `Sources: <Publisher>, <Publisher>`; if stock footage
was used add `Video: Pexels` (or Pixabay); line 3 a question. Hashtags 3-5 (#ai + topical + #technews + audience).

## 4. Voice, B-roll, render (from engine/; ~10 min)
```
python -m clipper voice --script ../work/explainers/<id>/script.json      # fails with a word budget if not 62-80 s
python -m broll fetch --script ../work/explainers/<id>/script.json --out ../work/explainers/<id>/broll \
    --timings ../work/explainers/<id>/voice.json
python -m clipper explainer --script ../work/explainers/<id>/script.json
```
If `voice` says the narration is too short or long, edit the words (not the TTS speed) and re-run.

## 5. QA (do not skip)
Dump stills mid-beat for every beat (`node engine/render/render.mjs --clip <clip.json> --out /tmp/qa.mp4
--frames-only ...`) and look at them: every card legible and inside x 60-915, y 150-1540; captions match the script;
"AI narrator" credit visible; "AI-generated illustration" chip on AI beats; no B-roll shot that could be mistaken for
a real person in the story. ffprobe: 1080x1920, 30 fps, 62-80 s. Loudness about -14 LUFS. Re-read the claim table one
last time against the final script.

## 6. Deliver
Same as the clip track: SendUserFile with the MP4 + cover, `scripts/publish-videos.sh <date>`, delivery block in
`deliveries/<date>.md` (written by the explainer command, includes sources), ledger entry. In the delivery note,
remind Charlie to switch ON the platform's AI-generated content label for explainers.

## 7. Corrections
If a published explainer proves wrong: add it to `ops/NEEDS-CHARLIE.md` the same day (delete or pin a correction),
note it in the ledger, and add the lesson to this file.
