# Backlog

The nightly run first delivers the 3 explainers. With leftover time it ships ONE improvement from the top of this list
(on a branch + PR), verified with a render. Re-rank on Sundays. (Podcast-clip items are parked with that track.)

## Next
- [ ] `clipper explainer --no-package`: render + drive.json without touching deliveries/ledger (parallel producers),
      and let `--no-render` add the ledger entry when the MP4 exists.
- [ ] Drive docs: emoji arrive garbled (2026-10-12: text/html with &#x..; entities ALSO garbles; writing emoji as
      [unicode name] works -> do that in explainer.py drive_card) (text/plain upload read as Latin-1). Tried 2026-10-11: base64Content +
      "text/plain; charset=UTF-8" still garbles. Next: upload text/html with emoji as &#x...; entities, or strip emoji
      from the drive card (explainer.py drive_card).
- [x] kit.js: `K.phase(t, a, b, ease)` should clamp before applying a custom ease (two producers hit it 2026-10-11);
      library `ai-wonders.js`: its label at y 480 touches the docked header (move to ~570).
- [x] (PR #12; agent-office, license-gate, own-copy, sofa-choice not promoted) Promote 2026-10-11 scenes: brake-track, harness-log, agent-office (AI brake); server-swap, plea-court, route-map,
      license-gate (chip swap); ports-multiply, lawyer-letter, robot-decompile, own-copy, sofa-choice + gameProps
      helpers (game ports). Note: work/ is not kept between containers, so promote the same night.
- [x] (PR #13) Promote 2026-10-12 scenes: strike-map (appearAt), cloud-reveal, apps-fail, go-underground, both-sides (Yandex);
      grad-ladder, lectern-warning (real speaker as text on a screen), job-tsunami, two-roads (first jobs); si-order,
      rename-street (+ kit primitives drawSignBoard/drawCivic/drawLift) (SI rebrand).
- [ ] Promote tonight's scenes (tip-form, pull-the-plug, form-flood, loophole-run, spam-delay, paper-flood, proof-checker,
      claimed-proof, prize-stage, microscope-cilia, experts-check, two-claims) into the shared library with stills.
- [x] scripts/publish-videos.sh: delete the leftover local `videos/<date>` branch so a same-day re-run works (PR 2026-10-10).
- [ ] Promote the Sabi scenes after making the product prop a param (claims-pedestal, type-tap-talk, sensor-cap-bench).
- [ ] Scene library growth: aim for 25+ reusable story scenes (launch event on stage with a generic presenter,
      lawsuit/courtroom, layoffs at an office, chip factory, phone app update, kids using AI at school, doctor's office,
      robot in a warehouse, data center power grid, stock-ticker-free 'money' scenes). Each with params + stills.
- [ ] More kit settings: newsroom, classroom, hospital, warehouse, stage/keynote, street by day.
- [ ] Explainer polish: background music bed generated in code (subtle synth pad, ducked under the voice), sound
      effects for stamps/pops/whooshes generated in code; more kit settings (newsroom, hospital, classroom, street at day).
- [ ] (Parked, owner decision 2026-10-09) X pulse: popular AI posts via the official X API ($0.005/post, ~$4.50/mo
      for ~30 posts/night). Revisit once the channel earns money; free sources only until then (Techmeme added).
- [ ] Speaker turns: detect speaker changes (pause + pitch/energy shift, or a light diarization model that runs on CPU
      with no token) and show a small name tag when the speaker changes; never guess a wrong name.
- [ ] "Fact card" overlays: when a clip states a number or names a company/model, show a clean info card (e.g.
      "GPT-5 · OpenAI · 2025") for 2-3 s. Adds real transformation (rights + Reels originality). Facts must be checked.
- [ ] Silence and filler trimming inside a clip (cut "um"s and gaps > 0.6 s) without making speech sound spliced.
- [ ] Two more visual styles; rotate so no two clips in a night share a style.
- [ ] A/B variants: render each clip with 2 hooks; deliver both covers so Charlie can pick.
- [x] Original-content track: fully animated narrated explainers (shipped 2026-10-09).
- [ ] Use publisher transcripts when feeds provide them (faster, more accurate), else whisper.
- [ ] Weekly performance review automation from ops/PERFORMANCE.md.
