# Log

Newest first. One entry per nightly run: date, stories, videos delivered (hooks + scores), problems, next.

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
