# Log

Newest first. One entry per nightly run: date, episodes used, clips delivered (hooks + rubric scores), problems, next.

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
