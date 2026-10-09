# Log

Newest first. One entry per nightly run: date, stories, videos delivered (hooks + scores), problems, next.

- 2026-10-09 (first scheduled nightly run, fired ~17:50 UTC): delivered 3 explainers (order: morning/midday/evening).
  1. "Google's new AI works with your laptop shut" (Gemini agent, Gemini at Work Oct 8; Google Cloud blog, TechCrunch,
     9to5Google, SiliconANGLE). Rubric ~75 (fresh 18, stakes 14, surprise 9, visual 9, verif 19, controversy 6).
     71.4 s, -14.2 LUFS, style neural, 88% scenes.
  2. "This free AI agent just got locked away" (ARTEX goes closed-source after CrowdStrike linked it to attacks on
     South Korean financial firms; Reuters, CrowdStrike, AFP, The Record). Rubric ~84 (19/15/13/9/16/12). 72.9 s,
     -14.3 LUFS, style horizon, 100% scenes. Worded as CrowdStrike's attribution; no person or developer accused.
  3. "This baseball cap wants to read your thoughts" (Sabi $50M seed led by Khosla Ventures; Sabi release, Forbes,
     Crypto Briefing). Rubric ~73 (18/10/14/10/13/8). 68.9 s, -14.3 LUFS, style orb, 100% scenes; all capability
     numbers attributed to Sabi.
  Dropped: Amazon drops data-center NDAs (rendered, 72.7 s) — failed the freshness gate on review (Amazon announced it
  Oct 2; Oct 9 coverage added nothing new); replaced by Sabi. Skipped: USA Today v. OpenAI (unproven allegations
  gate), OpenAI fired safety researchers (named-person misconduct dispute), OpenAI revenue report (single source).
  Timings: setup ~3 min, news 6 s, producers 13-16 min each in parallel, replacement producer 13 min.
  Problems: producers 159/158/158 words (below the 165 floor) because Kokoro af_heart@0.85 reads ~2.25 words/s, not
  2.7 — 165 words would exceed 75 s; whisper base.en hallucinated "Remember," in a silence (checked: not in audio);
  producers shared the scratchpad and one overwrote another's helper (give each its own scratch subfolder);
  `clipper explainer` writes ledger/deliveries itself, so a dropped explainer must be removed by hand.
  Mid-run, main gained the brand (The Daily Token) and a Drive archive step: #thedailytoken added to the 3 post
  texts; no Google Drive connector in this session, so no Drive docs were filed and the Drive repeat check was skipped
  (ledger check only).
  Improve: PR #7 merged — 12 of tonight's scenes promoted to the shared library (9 -> 21), generic defaults, verified
  with stills; word target corrected to ~150-175 words. Bug: scripts/publish-videos.sh fails on a re-run the same day
  (a local videos/<date> branch is left behind); worked around by deleting it (backlog).
  Backup branch videos/2026-10-09 now holds the setup session's clips plus tonight's 3.
- 2026-10-09 (setup session, owner decision): nightly output is now 3 fully animated explainers (3 different stories,
  produced in parallel by 3 producer subagents); the podcast-clip track is paused.
- 2026-10-09 (setup session, part 2): built the ORIGINAL explainer track. news command (19 feeds + Techmeme + HN
  trending), Kokoro af_heart narrator (Apache-2.0) with whisper-aligned word timings, fully animated template (owner:
  no B-roll, no progress bar, nothing at the bottom), illustration kit (cartoon people, robot, 22 objects, 6 settings,
  camera), 9 reusable story scenes. First explainer delivered: "Being cruel to an AI is now against the rules"
  (Anthropic 2026 Usage Policy update; sources Anthropic + The Verge), 73.1 s, -14.2 LUFS, 6 of 7 beats are scenes.
  Owner decisions: free news sources only (X API parked); scenes are the main event; explainer credit removed.
- 2026-10-09 (first production run, in the setup session): 4 episodes scouted (JRE #2551 Kokotajlo, Diary of a CEO
  Ladish, All-In 2026-10-02, Moonshots #301). Delivered 3: "How AI could secretly swing an election" (JRE, 73.2),
  "Replaced by AI users, then by AI" (DOAC, 71.2), "100,000 AI workers, summoned overnight" (Moonshots, 70.6).
  All-In best was 68.2 (mostly politics) so it was not used. Problems found and fixed: boundary snapping moved
  editor-chosen starts/ends (now exact by default); DOAC's publisher transcript was ~75 s offset from the audio
  (dynamic ads) so the first cut was the wrong passage (whisper is now the default + alignment check); whisper word
  edges clipped "useful" (edges now settle into silence); two clips shared a style (styles now rotate).
  Timings: transcribe base.en 8-20 min/episode, scouts ~5 min in parallel, render ~70 s/clip. Backup branch
  videos/2026-10-09.
- 2026-10-09 (setup session with Charlie): repo converted from Fieldwren to the AI clips channel. Verified: YouTube
  blocked from this IP; podcast RSS audio works; faster-whisper base.en ~9x realtime; Chromium canvas renderer ~15 fps
  per page. Built the pipeline, renderer, skill, playbook (research), and nightly routine.
