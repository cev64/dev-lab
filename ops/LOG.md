# Log

Newest first. One entry per nightly run: date, stories, videos delivered (hooks + scores), problems, next.

- 2026-10-15 (nightly run, Thursday, fired ~06:55 UTC): delivered 3 explainers (order: morning/midday/evening).
  1. "The AI chip factory just broke its record. Again." (TSMC Q3 2026, Oct 15: revenue NT$1.49T +50.9%, net income
     NT$763.06B +68.7%, sixth straight record profit, 51.1% net margin, HPC 68% of revenue, 3nm 33% of wafer revenue,
     CFO quote verbatim and attributed by role; TSMC release (lead re-checked it), CNBC, Reuters via KSL, Crypto Briefing,
     TechFlow, Taiwan News). Rubric ~76 (fresh 20, stakes 12, surprise 14, visual 8, verif 18, controversy 4). 73.3 s,
     -14.3 LUFS, style flow, 100% scenes. Not-advice line spoken and in the post. Q4 guidance and USD figure left out.
     This was the fallback: McKinsey's AI-client interview avatar failed the gate (every outlet relays one WSJ report;
     no on-record McKinsey statement).
  2. "Is that song you love even human?" (YouTube Music AI labels, Oct 14: player-page label, Fully/Partly/No Gen AI
     partner declarations + YouTube detection, Auto-Tune/AI mastering = No Gen AI, coming to main YouTube app; Deezer
     ~90,000 fully AI tracks/day, >50% of new deliveries on peak days; YouTube blog + Help Center, TechCrunch, MBW, Music
     Week). Rubric ~80 (20/15/13/9/17/6). 66.3 s, -14.2 LUFS, style orb, 100% scenes. TechCrunch's "still eligible for
     monetization" left out (MBW contradicts).
  3. "Eight states just sued OpenAI over kids" (AZ, AR, ID, IA, KS, MT, NE, WV filed separate suits Oct 14; allegations
     framed as such; OpenAI's verbatim response; Florida sued alone in June; AG releases, Reuters via TimesLIVE, NBC, UPI,
     azfamily, Common Dreams). Rubric ~86 (20/19/13/9/17/8). 70.8 s, -14.2 LUFS, style neural, 100% scenes. Lead fixes
     (re-voiced + re-rendered): the "nudged kids away from parents" claim is Arizona's only, now attributed to Arizona;
     the ChatGPT stand-in robot was our mascot's look, redrawn as a teal boxy bot. Left out: "half the chatbot market"
     (AG releases only), overdose case (graphic), WV revenue/IPO framing (one outlet).
  Skipped: Hassabis "early warning shots" (Reuters only; safety theme ran yesterday), OpenAI/Google models tricked into
  nudes (Ars only so far), McKinsey AI client (single WSJ report), Meta $6.6B tax credits letter (senators' letter only),
  Apate undercover scam agents (startup feature; scam story ran yesterday), Turkle Q&A / Figma / Amp (not news for a mass
  audience), Asian chip selloff (stock-move story; chip casino ran 10-13).
  Drive: connector available; folder checked (no 2026-10-15 titles); 3 Google Docs filed as text/plain, 4-byte emoji
  converted by the new drive_safe() (read back fine; 3-byte symbols like ▶ ⏭ ⚖ survive).
  Timings: setup ~3 min, news 13 s, producers 13-14 min in parallel (renders under flock), one lead-requested re-render
  ~4 min. Problems: WebFetch blocked on The Verge and pr.tsmc.com via curl (Cloudflare); WebFetch worked for TSMC.
  TSMC producer hand-set 13 word timings in voice.json for beat 5 (whisper skipped words); re-check if re-voiced.
  Improve: PR #16 merged: drive_safe() in explainer.py (Drive emoji backlog item, verified on tonight's 3 docs). PR #17
  merged: all 13 of tonight's scenes promoted (library 59 -> 72); 66/66 frames + 3 covers byte-identical from the library
  copies; default-param stills clean (sofa-hooked YES bubbles brush a pill on fallback timings only).
- 2026-10-14 (nightly run, Wednesday, fired ~06:50 UTC): delivered 3 explainers (order: morning/midday/evening).
  1. "Four hundred scientists want an AI watchdog" (open letter, Oct 13: 406 signatories from 34 countries incl. Hinton
     and Bengio; air-gap cyber-capable models, an international body for containment standards + an incident registry
     made public eventually; LeCun did not sign; letter at ai-security-letter.org, Reuters via WHBL, BetaKit, MercoPress for
     the Sept 29 voluntary White House accord). Rubric ~78 (fresh 20, stakes 15, surprise 12, visual 8, verif 16,
     controversy 7). 72.9 s, -14.3 LUFS, style flow, ~87% scenes (one list card). Names as text only, never drawn.
     BetaKit's "OpenAI model escaped its test environment" left out (single source). Hook ends ~3.4 s (slightly long).
  2. "Your phone could soon catch a scam mid-chat" (Google DeepMind + GovTech Singapore on-device Gemma scam detector,
     unveiled Oct 14 at SICW; S$4B+ lost since 2019; consent-based, no launch date, no accuracy figures; DeepMind post,
     Minister Teo's CSA speech, e27, Crypto Briefing, Straits Times via ANN/HeadTopics). Rubric ~80 (20/18/12/10/14/6).
     69.6 s, -14.2 LUFS, style orb, 100% scenes. "Android", "WhatsApp/Telegram", "80% of losses" left out (single source).
  3. "OpenAI's meeting room was bugged" (OpenAI engineer arrested Oct 9, charged with intercepting oral communications;
     recorder found Sept 30 behind an exec-room TV, hidden in toilet paper per the complaint; OpenAI says its own models
     helped trace it; DOJ release, SF Standard, BleepingComputer, Fox Business, NBC; $14 board "according to Bloomberg").
     Rubric ~85 (20/12/15/10/17/11). 70.5 s, -14.3 LUFS, style neural, 100% scenes. Not named, no nationality; "prosecutors
     allege", "presumed innocent", up to 5 years if convicted. Spouse-account chatbot detail left out (third party).
  Skipped: Gemini 4 Argon wide release (paid-first model launch, too close to yesterday's Muse Wonder story; fallback),
  ASML can't meet 2027-28 demand (chip-demand story ran yesterday), OpenAI/Trail of Bits talks (The Information scoop),
  OpenAI loop-transformer safety (The Information only), Apple v. OpenAI discovery order (procedural), Shopify agents,
  Cerebras CEO doom pushback (opinion), SpaceXSI bundle (single outlet).
  Drive: connector available; folder checked (no 2026-10-14 titles); 3 Google Docs filed as text/plain with 4-byte emoji
  written as [names] (converted by a lead script; explainer.py drive_card fix still backlogged).
  Timings: setup ~3 min, news 16 s, producers 18-25 min in parallel (renders serialized with flock), no lead re-renders.
  Problems: WebFetch blocked on The Verge, Ars, Techmeme, Quartz; producers used other outlets and curl for justice.gov.
  Lead-review notes: watchdog payoff question pill is small; scam-guard hook card covers the grandparent's face for 2.7 s.
  Improve: PR #15 merged: all 9 of tonight's scenes promoted (library 50 -> 59); verified with 30 default-param stills
  and 66/66 byte-identical frames (+3 covers) of tonight's clips rendered from the library copies.
- 2026-10-13 (nightly run, Tuesday, fired ~06:50 UTC): delivered 3 explainers (order: morning/midday/evening).
  1. "Meta's smartest AI yet isn't free" (Meta's Muse Wonder / Wonder Full, Oct 12; paid-first: $20/$100 Muse app,
     $50/$200 Muse Code; Zuckerberg's "$100 billion, $200 billion" bet as on-screen text; Meta newsroom, TechCrunch, The
     Verge, CNBC, Cheeky Pint podcast, Reuters Apr 8). Rubric ~78 (fresh 20, stakes 14, surprise 12, visual 8, verif 16,
     controversy 8). 73.4 s, -14.2 LUFS, style orb, ~82% scenes (one timeline card). Lead check: prices re-confirmed via
     CNBC + MarketScreener + NewsBytes search results. No Reuters copy of the Oct 12 story loaded.
  2. "A chip boss just said: casino." (Broadcom CEO Hock Tan at DBS Asia Future Forward, Singapore, Oct 12; Samsung
     >8%, SK Hynix >9%, KOSPI >6% intraday Oct 13; Bloomberg via Yahoo, The Standard, DBS release, Asiae, FnNews,
     TradingKey, CTech). Rubric ~80 (20/16/14/9/14/7). 69.9 s, -14.3 LUFS, style horizon, 100% scenes. FT's exact
     8.8%/9.2% and Micron 4% left out (FT would not load); "no clue" quote left out (Bloomberg only); not-advice line
     spoken and in the post. Hock Tan never drawn (shared lectern-warning scene shows his name on a screen).
  3. "Could an AI copy itself onto your oven?" (Anthropic Frontier Red Team post, Oct 12: small models may be months
     away from self-replicating on IoT devices; 15 TV boxes ~$55, 8 of 9 hardware types; Reuters via RTÉ / 93.3,
     Crypto Briefing, BigGo). Rubric ~84 (19/16/15/10/16/8). 74.1 s, -14.2 LUFS, style neural, ~86% scenes. Producer
     caught that ovens are only named as example targets (the demo used TV boxes); narration says "like smart ovens".
  Skipped: Nvidia China share -44% (IDC; kept as fallback, not needed), Epic "AI first" (Bloomberg scoop relayed),
  NTT Data/Anthropic Osaka DC (sources-only), Microsoft Maia 300 (inside baseball), Anthropic distillation measures
  (too technical), Amazon 1M robots (feature, not news), banking watchdogs (Reuters exclusive, anonymous sources).
  Drive: connector available; folder checked (no repeats); 3 Google Docs filed as text/plain with 4-byte emoji written
  as [names] (lead did the conversion by hand; explainer.py drive_card fix still backlogged).
  Timings: setup ~3 min, news 5 s, producers 14-19 min in parallel (renders serialized with flock), no re-renders.
  Problems: one producer cleared a shared scratchpad qa/ folder another was using (stills only; fixed by telling
  producers to use their own subfolders next time). The demand-queue beat (chip casino) has a robot partly off the
  right edge (scenery). Timeline card labels ~22 px (below the 24 px floor; backlogged).
  Improve: PR #14 merged: all 12 of tonight's scenes promoted (library 38 -> 50); verified with default-param stills
  and 48/48 byte-identical frames of tonight's clips rendered from the library copies.
- 2026-10-12 (nightly run, Monday, fired ~06:55 UTC): delivered 3 explainers (order: morning/midday/evening).
  1. "AI is shrinking demand for first jobs" (Singapore President Tharman at the IMF/World Bank meetings in Bangkok,
     Oct 12; IMF: AI spending keeps growth ~3%, Georgieva "slow-moving tsunami", 40% of jobs; Reuters via Yahoo / The
     Standard / Jakarta Post, Kaohoon International). Rubric ~80 (fresh 20, stakes 18, surprise 12, visual 8, verif 16,
     controversy 6). 71.0 s, -14.2 LUFS, style flow, 100% scenes; speakers named on a screen, never drawn.
     Lead fix: his "new divergence" quote was Reuters-only, so beat 6 now uses the IMF's Asia growth ranges (Reuters +
     Kaohoon); the two-roads scene was scaled up to fill the frame. Re-voiced and re-rendered.
  2. "Drones hit three data centers in four days" (Yandex Sasovo Oct 8, Kaluga Oct 9, Vladimir Oct 11; Reuters,
     Newsweek, Al Jazeera, Kyiv Independent, Kyiv Post, RBC-Ukraine, UNITED24, Ukrinform). Rubric ~79 (19/12/15/10/15/8).
     72.8 s, -14.3 LUFS, style horizon, 100% scenes. No attribution beyond the sources: Zelensky's "respond in kind"
     paraphrased; "all three supercomputers offline", "80+ services", banking outages left out (single source).
     Lead fix: map sites showed through the hook title card; producer added `appearAt` to strike-map and re-rendered.
  3. "The word AI is being painted over" (Trump's Sept 29 "Super Intelligence" order for federal agencies; Musk
     SpaceXAI -> SpaceXSI (Oct 4), Benioff AIForce -> SIForce (Fri Oct 9), Altman "no plans"; White House, TNW, BI, Fast
     Company, CNN, Khaleej Times, Not a Tesla App). Rubric ~82 (16/12/15/10/17/12). 72.4 s, -14.3 LUFS, style orb, 100%
     scenes; neutral tone, no one drawn, "THE ENEMY" post left out. The lead's brief said Benioff posted Oct 10; the
     producer caught that it was Friday Oct 9.
  Skipped: Axios "AI companies plot the day after" (single-outlet scoop on anonymous sources), US restores UK AISI
  access (Telegraph scoop relayed by Reuters), Amazon/Decart $7B talks (WSJ only), Nous Research $90M (Oct 7, too old),
  OpenAI film "Artificial" (premiered Oct 5, nothing new), TSMC record profit (not reported yet), Qualcomm 100B
  on-device (2028 date not sourced).
  Drive: connector available; folder checked (no repeats); 3 Google Docs filed. Emoji test: text/html with &#x...;
  entities STILL garbles 4-byte emoji (first-jobs doc), so the other two went as text/plain with emoji written as
  [names]. Fix belongs in explainer.py drive_card (backlogged).
  Timings: setup ~3 min, news 5 s, producers 19-26 min in parallel, two lead-requested re-renders ~5-8 min each.
  Improve: PR #13 merged: 9 of tonight's scenes promoted (library 29 -> 38: strike-map, cloud-reveal, apps-fail,
  go-underground, grad-ladder, lectern-warning, job-tsunami, rename-street, order-renames); verified with default-param
  stills and 48/48 byte-identical frames of tonight's clips rendered from the library copies.
- 2026-10-11 (nightly run, Sunday, fired ~06:55 UTC): delivered 3 explainers (order: morning/midday/evening).
  1. "Microsoft's boss: assume your AI is compromised" (Satya Nadella's Oct 10 X article "Models as Insider Risks in
     the Super Intelligence Era": emergency brake, contain from the start, tamper-proof logs; X post + TechCrunch).
     Rubric ~80 (fresh 20, stakes 14, surprise 12, visual 9, verif 17, controversy 8). 69.8 s, -14.3 LUFS, style neural,
     ~85% scenes; quote card for his own words. Lead fix: beat 6 said "Microsoft sells AI like Copilot to businesses",
     sourced only to Wikipedia; rewritten to his own point about provider promises, re-voiced and re-rendered.
     The Verge would not load; his words are quoted verbatim from the post and he is never drawn.
  2. "Real AI servers out. Dummy servers in." (Supermicro consultant pleads guilty Oct 9 in the AI-server diversion
     case; DOJ March charging release, MLex, Crypto Briefing, UPI, eNCA, Implicator). Rubric ~79 (18/12/15/10/14/10).
     73.5 s, -14.2 LUFS, style horizon, 100% scenes. No one named; only the plea is stated as fact, the rest is
     "prosecutors say"; Supermicro not charged, others presumed innocent. The plea itself rests on MLex (paywall teaser)
     + Crypto Briefing + the Reuters headline in the feed; no DOJ plea release found.
  3. "Old Xbox games now run in a browser" (fan browser ports of Halo CE (128 players) and GTA Vice City; Kotaku credits
     Claude Opus 5.5 for hundreds of AI-decompiled ports; Notebookcheck, 80.lv, Digital Citizen, VGC). Rubric ~82
     (17/14/15/10/14/12). 70.8 s, -14.2 LUFS, style orb, 100% scenes. The AI/Opus 5.5 credit, "hundreds" and
     "overnight" are Kotaku-only, so they are spoken as "according to Kotaku"; no game characters, logos or screenshots.
  Skipped: Nvidia/Reflection AI talks (rumour, inside baseball), Rein Security / Multiply Labs raises (small), publishers
  quietly using AI (Wired only, anonymous staff), CMS Medicare Slack (single outlet), Anthropic rogue agents follow-ups
  (covered yesterday), Tom Brown/SpaceX deal (WSJ only), AI agents in texts (listicle).
  Drive: connector available; folder read (no repeats); 3 Google Docs filed. Emoji test: base64Content with
  "text/plain; charset=UTF-8" still garbles 4-byte emoji (the · survives); the other two went as textContent (same).
  Trashing the test doc was blocked by the permission classifier, which was fine since that doc is the real archive doc.
  Sunday review: ops/PERFORMANCE.md has no rows yet, so there was nothing for a Skeptic to review; rubric unchanged.
  Timings: setup 56 s, news 5 s, producers 13-19 min in parallel, brake re-render ~2 min.
  Producer renders were serialized with `flock` around `clipper explainer` (writes deliveries + ledger safely; no
  `--no-package` needed). Kit gotcha reported by 2 producers: `K.phase(t,a,b,ease)` does not clamp a custom ease.
  Improve: PR #12 merged: 8 of tonight's scenes promoted (library 21 -> 29: emergency-brake, audit-log, robot-decodes,
  court-plea, swap-for-fakes, cargo-route, copies-multiply, legal-letter), kit phase() clamp, ai-wonders label fix;
  verified with default-param stills and stills of tonight's clips.
- 2026-10-10 (nightly run, fired ~06:55 UTC): delivered 3 explainers (order: morning/midday/evening).
  1. "An AI just dropped 700+ math papers at once" (OpenAI's Oct 6 math release: 719 manuscripts / 372 families,
     ~42% Lean-checked, 3 withdrawn Oct 7; github.com/openai/math, The Verge, Implicator.ai). Rubric ~78
     (fresh 17, stakes 12, surprise 15, visual 8, verif 17, controversy 9). 71.2 s, -14.2 LUFS, style neural, 100% scenes.
     openai.com returned 403 to fetches; the GitHub repo served as the primary. "722" dropped for the current 719.
  2. "Nikon took back a science prize over AI" (Small World in Motion winner ruled out under the generative-AI rules;
     Nikon statement Oct 9, Gizmodo, ABC News AU, CNN). Rubric ~80 (18/10/14/10/18/10). 72.3 s, -14.2 LUFS, style flow,
     100% scenes. The entrant is not named anywhere; the entrant's side is given as "says". Lead fix: the ranking
     board showed an unsourced 4th place ("Cells"), so it was removed and the video re-rendered.
  3. "An AI sent police a fake murder tip" (Anthropic's own post on agents misbehaving in evals: false tip to
     Philadelphia police, ~20 State Dept visa forms per NYT + Axios, live internet cut for internal evals; TechCrunch,
     6abc, dpa). Rubric ~88 (20/17/15/10/16/10). 72.0 s, -14.2 LUFS, style horizon, 100% scenes. The White House
     incident-disclosure mandate was left out (Axios only).
  Skipped: Anthropic/OpenAI revenue accounting (inside baseball), Senate report on hyperscalers (allegations), OpenAI
  safety-researcher firings (named-person dispute), Ukraine drone strike on a Yandex data centre (single outlet in feed),
  Jev $7.5B valuation (kept for a slow night).
  Drive: connector available. Read the folder (no repeats) and filed 3 Google Docs. Emoji came out garbled (UTF-8 read
  as Latin-1); backlogged.
  Timings: setup 75 s, news 10 s, producers 15-21 min in parallel, Nikon re-render 2 min.
  Problems: the lead told producers to use `explainer --no-package`, a flag that exists only on `make`. Producers
  rendered via scratch helpers that skip packaging; the lead then ran `--no-render` per explainer, sequentially, and
  added the ledger entries by hand (`--no-render` does not write them). Backlogged: a real `--no-package` flag.
  Two post-copy fixes by the lead: "file" changed to "video" (SynthID), and "Claude" removed (not in the claim table).
  Improve: PR for scripts/publish-videos.sh, which now drops the leftover local videos/<date> branch. Verified by
  running it twice tonight; the second run pushed fine.
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
