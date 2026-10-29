# Backlog

The nightly run first delivers the 3 explainers. With leftover time it ships ONE improvement from the top of this list
(on a branch + PR), verified with a render. Re-rank on Sundays. (Podcast-clip items are parked with that track.)

## Next
- [x] (PR #28 merged 2026-10-25: newest build auto-picked; prune 403 still open) render.mjs hard-coded chromium_headless_shell-1194 (gone; 1243 installed): pick the newest
      /opt/pw-browsers/chromium_headless_shell-*/ automatically. Also publish-videos.sh prune gets 403 deleting old videos/*.
- [x] (PR 2026-10-23: drive_card body is pure ASCII + "(end)" tail; read back clean) Drive archive: text/plain docs mangle emojis (mojibake) and drop the last ~20 chars (2026-10-22). Cause: Latin-1 read +
      cut by the UTF-8 byte excess, so ANY non-ASCII char (BMP emoji, "·") breaks it.
- [ ] `clipper explainer --no-package`: render + drive.json without touching deliveries/ledger (parallel producers),
      and let `--no-render` add the ledger entry when the MP4 exists.
- [ ] Library defaults: make self-graded (me=Meta), muse-paywall (Muse/Wonder), fund-link (kospi*/sp* names), and (2026-10-14)
      ai-traces/charged-caveat (OpenAI), cheap-board (Bloomberg), scam-guard intro (DeepMind/GovTech) generic; pass old values explicitly in old clips.
- [ ] Library company-reply.js: text defaults still name OpenAI / "industry-leading age-specific protections"; make generic
      and pass old values in old clips (2026-10-29).
- [ ] Timeline card: label text ~22 px, below the 24 px legibility floor (2026-10-13); raise it.
- [x] (in the 2026-10-15 briefs) Producer brief: each producer uses its own scratchpad subfolder for QA stills (2026-10-13 collision).
- [x] (PR 2026-10-15: drive_safe() in explainer.py writes 4-byte emoji as [name]) Drive docs: emoji arrive garbled (2026-10-12: text/html with &#x..; entities ALSO garbles; writing emoji as
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
- [x] (branch daily/2026-10-23-scene-library) Promote 2026-10-23 scenes: lobby-hill (6 modes; Nvidia / Anthropic / OpenAI / Meta / Google names, $ amounts, July-Sept 2026 and story-word cue defaults -> Company A-C / Firm A-E, round amounts, "This quarter", fractions; arrive gains nameCues); diagnosis-panel, case-race (83/36 -> 70/40), doctor-alone (Suleyman quote -> placeholder), engine-reveal, exam-room (first medical scenes; doctor/clinic helpers stay per file); rollout-tower (UBER / ChatGPT Work / OpenAI / Oct 22 / 30000 -> COMPANY / AI assistant / AI maker / This week / 10000), agent-apps, pilot-grow (1,000 / Codex defaults made generic), inbox-agent (July / -10% / Uber defaults made generic, monthCue alias), coworker-payoff. All 11 accept "word#n" cues. Kit doctor helper (drawDoctor) still a candidate: 4 files carry their own copy (diagnosis-panel, case-race, doctor-alone, exam-room).
- [x] (branch daily/2026-10-19-scenes) Promote 2026-10-19 scenes: robot-standoff (6 modes; delivery robot / officer / courier / balance scale; "word#n" cue syntax; Center City / Uber / Avride / March / $10,000 defaults made generic); slice-off, value-steps, fund-paths, share-grid (+ matchBadge), fine-print, trust-question (benefit fund; Anthropic / Public Benefit Fund / 5% / $48 billion / Business Insider defaults -> Company / New fund / 10% / $10 billion / Source); call-human, scanner-launch (was orb-launch), deepfake-wire, three-match, agent-tether, launch-caveats (was bank-caveat) (human check; World / Money20/20 / Sam Altman / Zoom / Hong Kong / 25.6 / Germany defaults made generic). All story-word cue defaults dropped (fractions). drawOrb copies left per file (variants differ; kit unchanged).
- [x] (branch daily/2026-10-18-scenes) Promote 2026-10-18 scenes: terms-rewrite (3 modes), web-crawlers, shop-site (Meta terms; company/clause/date/quote defaults made generic); agent-door, id-check, door-row, bank-vault, order-overturned (was court-order), click-buy (agents blocked; store/bank/airline name cues dropped); site-bypass (wallet raid; years 24 -> 10, ask generic). wallet-raid not promoted (story-specific: crypto test network, OpenAI quote/dates).
- [x] (branch daily/2026-10-17-scenes) Promote 2026-10-17 scenes: hire-door, time-clock, manager-hands, hq-report (junior hires; generic number defaults); app-review-gate (nudify-app ban; store/rule/count defaults made generic, ruleTag + removed params, cue fallbacks now fractions of the scene); lab-to-live, keys-lying-around, wall-off-test, who-checks-locks (rogue agents; agency defaults made generic, wall-off-test gains code).
- [x] (branch daily/2026-10-16-scenes) Promote 2026-10-16 scenes: tab-peek (ChatGPT in Chrome; mode atlas -> switch, product-name defaults made generic), deepfake-court (deepfake evidence; generic survey/date defaults), lab-inspectors (was inspectors), no-veto, bank-examiner, outside-look (AI inspectors).
- [x] (branch daily/2026-10-15-scenes) Promote 2026-10-15 scenes: eight-filings, sofa-hooked, court-asks, company-reply, kids-question (states sue); player-label, track-sorter, song-flood, app-hop (AI music labels; track-sorter gains detectLabel/tagged/untagged, sofa-hooked gains yes); fab-trophies, earnings-vault, profit-split, wafer-lab (chip-foundry record).
- [x] (PR #15) Promote 2026-10-14 scenes: open-letter-wall, sandbox-escape, incident-logbook, watchdog-payoff, bug-room, ai-traces, cheap-board, charged-caveat, scam-guard.
- [x] (PR #14) Promote 2026-10-13 scenes: launch-stage, muse-paywall, power-bet, self-graded (Muse Wonder); chip-casino, market-board, factory-dim, fund-link, demand-queue (chip casino); smart-home-hop, tv-box-lab, no-off-switch (self-replicate).
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
