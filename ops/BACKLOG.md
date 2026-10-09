# Backlog

The nightly run first delivers the 3 clips. With leftover time it ships ONE engine improvement from the top of this
list (on a branch + PR), verified with a test render. Re-rank on Sundays.

## Next
- [ ] (Parked, owner decision 2026-10-09) X pulse: popular AI posts via the official X API ($0.005/post, ~$4.50/mo
      for ~30 posts/night). Revisit once the channel earns money; free sources only until then (Techmeme added).
- [ ] Speaker turns: detect speaker changes (pause + pitch/energy shift, or a light diarization model that runs on CPU
      with no token) and show a small name tag when the speaker changes; never guess a wrong name.
- [ ] "Fact card" overlays: when a clip states a number or names a company/model, show a clean info card (e.g.
      "GPT-5 · OpenAI · 2025") for 2-3 s. Adds real transformation (rights + Reels originality). Facts must be checked.
- [ ] Silence and filler trimming inside a clip (cut "um"s and gaps > 0.6 s) without making speech sound spliced.
- [ ] Two more visual styles; rotate so no two clips in a night share a style.
- [ ] A/B variants: render each clip with 2 hooks; deliver both covers so Charlie can pick.
- [ ] Original-content track: 60-75 s narrated AI-news explainers (script from verified news, Piper TTS voice with a
      licence that allows commercial use — verify per voice; kinetic typography + charts). Clearly synthetic narrator,
      no real-person likeness. Eligible for TikTok Creator Rewards (clips of other people's podcasts are not).
- [ ] Use publisher transcripts when feeds provide them (faster, more accurate), else whisper.
- [ ] Weekly performance review automation from ops/PERFORMANCE.md.
