# Performance (filled in by Charlie, read by the nightly run)

The nightly run reads this before it picks stories (skill section 1), so the more rows, the better it gets.
About 3 days after a video goes up, copy its numbers from TikTok: open the video, tap the `...` (or the views count)
then **Analytics**. One row per video. Leave a cell blank if you don't have it.

| Column | Where it is in TikTok analytics |
|---|---|
| Views | Video views |
| Avg watch (s) | Average watch time |
| Full % | Watched full video |
| Likes / Comments / Shares / Saves | the counts under the video, or Engagement in analytics |
| Follows | New followers (from this video) |
| Format | from the delivery note: `v1` = before 2026-10-27's changes, `v2` = cold open, bigger scenes, Token's take, loop |

Fill rows like: `| 2026-10-27 | qwen-phone-home | TikTok | v1 | views | avg s | full % | ... | evening slot |`.
You can also just paste the numbers to Claude in the faceless-tiktok channel and it will add the rows.

| Posted | Video (id after the date) | Platform | Format | Views | Avg watch (s) | Full % | Likes | Comments | Shares | Saves | Follows | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 2026-10-09 | gemini-agent | TikTok | v1 | 197 | 9.01 | 2.9 | 5 | 0 | 0 | 3 | 2 | Morning slot; FY 89%; drop-off 0:01 |
| 2026-10-09 | sabi-cap | TikTok | v1 | 173 | 6.11 | 3.4 | 1 | 0 | 1 | 0 | 0 | Evening slot; FY 78%, Search 18%; drop-off 0:02 |
| 2026-10-10 | ai-math-flood | TikTok | v1 | 153 | 9.13 | 7.3 | 2 | 0 | 1 | 0 | 0 | Morning slot; FY 72%, Search 23%; drop-off 0:01 |
| 2026-10-10 | rogue-agents | TikTok | v1 | 202 | 13.22 | 7.6 | 5 | 1 | 0 | 1 | 2 | Evening slot; FY 96%; drop-off 0:01 |
| 2026-10-10 | nikon-ai-video | TikTok | v1 | 211 | 14.69 | 3.7 | 3 | 0 | 0 | 0 | 0 | Midday slot; Search 55%, FY 42%; drop-off 0:02 |
| 2026-10-11 | ai-brake | TikTok | v1 | 192 | 11.01 | 3.4 | 7 | 0 | 2 | 0 | 0 | Morning slot; FY 82%, Search 12%; drop-off 0:01 |
| 2026-10-11 | game-ports | TikTok | v1 | 344 | 11.07 | 4.5 | 20 | 0 | 1 | 3 | 2 | Evening slot; FY 86%, Search 13%; drop-off 0:01 |
| 2026-10-11 | chip-swap | TikTok | v1 | 151 | 8.09 | 3.2 | 1 | 0 | 0 | 0 | 0 | Midday slot; FY 81%, Search 13%; drop-off 0:02 |
| 2026-10-12 | first-jobs | TikTok | v1 | 105 | 14.95 | 4.3 | 1 | 0 | 1 | 0 | 1 | Morning slot; Search 79%, FY 19%; drop-off 0:01 |
| 2026-10-12 | yandex-datacenters | TikTok | v1 | 211 | 15.55 | 10.1 | 21 | 2 | 2 | 1 | 2 | Midday slot; FY 97%; drop-off 0:01 |
| 2026-10-12 | si-rebrand | TikTok | v1 | 54 | 15.51 | 1.8 | 3 | 0 | 0 | 1 | 0 | Evening slot; traffic n/a; drop-off 0:01 |
| 2026-10-13 | muse-wonder | TikTok | v1 | 384 | 15.99 | 6.0 | 4 | 0 | 1 | 0 | 1 | Morning slot; Search 59%, FY 40%; drop-off 0:01 |
| 2026-10-13 | chip-casino | TikTok | v1 | 110 | 4.24 | 0.9 | 1 | 0 | 0 | 0 | 0 | Midday slot; FY 91%; drop-off 0:02 |
| 2026-10-13 | self-replicate | TikTok | v1 | 622 | 26.91 | 11.7 | 25 | 2 | 6 | 9 | 8 | Evening slot; FY 72%, Search 26%; drop-off 0:01 |
| 2026-10-14 | office-bug | TikTok | v1 | 301 | 18.23 | 8.5 | 16 | 0 | 2 | 2 | 1 | Evening slot; FY 90%; drop-off 0:02 |
| 2026-10-15 | ai-music-label | TikTok | v1 | 250 | 17.31 | 3.8 | 1 | 0 | 1 | 1 | 0 | Midday slot; Search 49%, FY 48%; drop-off 0:01 |
| 2026-10-15 | states-sue | TikTok | v1 | 124 | 9.78 | 2.3 | 2 | 0 | 0 | 0 | 0 | Evening slot; FY 82%, Search 14%; drop-off 0:01 |
| 2026-10-26 | ai-odyssey | TikTok | v1 | 124 | 5.7 | 1.5 | 2 | 0 | 0 | 1 | 0 | Evening slot; Search 71%, FY 23%; drop-off 0:01 |
| 2026-10-27 | anthropic-ipo | TikTok | v2 | 274 | 14.57 | 9.5 | 10 | 1 | 1 | 1 | 1 | Midday slot; FY 88%, Search 8%; drop-off 0:03 |
| 2026-10-27 | qwen-phone-home | TikTok | v2 | 322 | 23.37 | 12.9 | 10 | 2 | 2 | 6 | 3 | Evening slot; FY 84%, Search 15%; drop-off 0:01 |
| 2026-10-27 | openai-proofs | TikTok | v2 | 562 | 17.46 | 9.8 | 9 | 3 | 0 | 2 | 1 | Morning slot; FY 73%, Search 24%; drop-off 0:01 |
| 2026-10-28 | genie-worlds | TikTok | v2 | 185 | 11.05 | 4.6 | 2 | 1 | 0 | 2 | 0 | Morning slot; FY 77%, Search 19%; drop-off 0:01 |
| 2026-10-28 | ai-run-company | TikTok | v2 | 156 | 10.85 | 3.1 | 6 | 1 | 0 | 4 | 2 | Midday slot; FY 96%; drop-off 0:01 |
| 2026-10-29 | cs-exodus | TikTok | v2 | 1492 | 20.77 | 8.1 | 35 | 10 | 5 | 5 | 1 | Morning slot; FY 97%; drop-off 0:01 |
| 2026-10-29 | gemini-carbon | TikTok | v2 | 768 | 14.99 | 3.6 | 20 | 5 | 0 | 4 | 4 | Midday slot; Search 58%, FY 42%; drop-off 0:01 |
| 2026-10-29 | xai-noise | TikTok | v2 | 206 | 6.97 | 1.4 | 3 | 2 | 0 | 0 | 0 | Evening slot; FY 70%, Search 27%; drop-off 0:02 |
| 2026-11-03 | token-bill | TikTok | v2 | 47 | 3.75 | 0 | 1 | 0 | 0 | 0 | 0 | Evening slot; traffic n/a; drop-off 0:01; data <3 days old |
| 2026-11-03 | grid-protectors | TikTok | v2 | 106 | 12.47 | 5.7 | 0 | 1 | 0 | 0 | 0 | Morning slot; FY 87%, Profile 7%; drop-off 0:01; data <3 days old |
| 2026-11-03 | anthropic-rsi | TikTok | v2 | 140 | 7.19 | 0.7 | 2 | 2 | 1 | 0 | 0 | Midday slot; FY 85%, Search 11%; drop-off 0:01; data <3 days old |
| 2026-11-04 | siri-apps | TikTok | v2 | 0 | 9.61 | 0 | 0 | 1 | 0 | 0 | 0 | Morning slot; traffic n/a; drop-off 0:08; ANOMALY: 0 views, caption edited and went under review right after posting, likely stuck distribution, not content; ignore for story/format decisions; data <3 days old |
| 2026-11-04 | mod-ai-labels | TikTok | v2 | 149 | 6.83 | 1.3 | 1 | 1 | 0 | 0 | 0 | Midday slot; FY 86%, Search 13%; drop-off 0:01; data <3 days old |
| 2026-11-04 | school-search | TikTok | v2 | 185 | 13.01 | 2.7 | 2 | 1 | 0 | 1 | 0 | Evening slot; FY 92%, Search 6%; drop-off 0:01; data <3 days old |
| 2026-11-05 | chatgpt-gifs | TikTok | v2 | 111 | 6.98 | 0.9 | 0 | 1 | 0 | 0 | 0 | Morning slot; FY 80%, Search 18%; drop-off 0:01; data <3 days old |

What we're watching: v2 should raise Avg watch and Full % (cold open, loop) and Comments (Token's take +
question). Compare v1 vs v2 rows for the same slot (morning, midday, evening).

## Tik's read (2026-11-05)

Source: TikTok Studio, read 2026-11-05 ~11 AM ET (Shares/Saves are probable readings). 33 videos, all under 100 followers, so no audience data yet. Account last 7 days: 3.3K views (+306%), comments +600%, traffic For You 73% / Search 26%.

- **Fix the hook first.** On nearly every video most viewers leave at 0:01-0:03. Open on the most surprising concrete claim in the very first frame and first spoken words (a number, or "this AI did X"). No setup, no channel intro, no "today we're looking at".
- **For You picks: human stakes that are relatable or alarming.** Best by far: cs-exodus (jobs/careers; 1,492 views, 20.8s avg, 97% FY). Also strong: AI acting on its own / going rogue: self-replicate (best avg watch 26.9s, 11.7% full, 9 saves, 8 follows), qwen-phone-home (12.9% full, 23.4s), rogue-agents (7.6% full, 96% FY), office-bug (8.5% full); and physical, dramatic events: yandex-datacenters (10.1% full, 97% FY). Weight "mass-audience stakes" and "strange new behaviour" stories up when scoring.
- **Search picks: named new products.** gemini-carbon (768 views, 58% Search), muse-wonder (59% Search), ai-music-label (49%), ai-odyssey (71%), first-jobs (79%). For any product/model story put the exact name (e.g. "Gemini 4 Carbon") in the first on-screen text, the first line of the caption, and the cover. Top queries were "why should i pay for muse wonder", "Exponential Time Hypothesis", "gemma 4", so frame hooks as "what is X" / "is X worth paying for".
- **Skip or rework stories without visible stakes.** CEO quotes, money and policy statements underperform: token-bill (3.75s avg, 47 views), chip-casino (4.24s, 0.9% full), si-rebrand (54 views). Niche or abstract stories too: ai-odyssey (5.7s), sabi-cap (6.1s). If you run one, lead with what it means for a normal person.
- **Possible regression, flag only, don't conclude.** Nov 3-5 videos average ~7-13s watch vs ~11-23s for late-Oct v2. From Nov 3 the posts added a trending instrumental under the voice (voice -6 dB, music -12 dB). It could be hurting clarity, or it could be weaker stories plus data <3 days old. Keep the narration clearly dominant and the first line crisp. Tik will test a few posts without music; re-check these rows after a few more days. siri-apps (0 views) is a distribution anomaly (caption edit / review), not a content signal.
- **Comments are still low, but the question plus pinned comment works** (+600% week over week). End every video on one sharp either/or question and match it in the pinned comment.
- **v1 vs v2 is not settled.** v2's first day (Oct 27) had strong full-watch (9.5-12.9%), but later v2 days were mixed (1.4-8.1%). Story choice matters more than format right now; don't credit or blame the format from these rows alone.
