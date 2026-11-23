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
| 2026-10-09 | gemini-agent | TikTok | v1 | 198 | 8.98 | 2.9 | 5 | 0 | 0 | 3 | 2 | Morning slot; FY 89%; drop-off 0:01 |
| 2026-10-09 | sabi-cap | TikTok | v1 | 177 | 5.99 | 3.4 | 1 | 0 | 1 | 0 | 0 | Evening slot; FY 76%, Search 20%; drop-off 0:02 |
| 2026-10-10 | ai-math-flood | TikTok | v1 | 155 | 8.9 | 7.1 | 2 | 0 | 1 | 0 | 0 | Morning slot; FY 70%, Search 25%; drop-off 0:01 |
| 2026-10-10 | rogue-agents | TikTok | v1 | 202 | 13.22 | 7.6 | 5 | 1 | 0 | 1 | 2 | Evening slot; FY 96%; drop-off 0:01 |
| 2026-10-10 | nikon-ai-video | TikTok | v1 | 211 | 14.69 | 3.7 | 3 | 0 | 0 | 0 | 0 | Midday slot; Search 55%, FY 42%; drop-off 0:02 |
| 2026-10-11 | ai-brake | TikTok | v1 | 194 | 10.91 | 3.3 | 7 | 0 | 2 | 0 | 0 | Morning slot; FY 81%, Search 13%; drop-off 0:01 |
| 2026-10-11 | game-ports | TikTok | v1 | 348 | 11.05 | 4.5 | 20 | 0 | 1 | 3 | 2 | Evening slot; FY 85%, Search 14%; drop-off 0:01 |
| 2026-10-11 | chip-swap | TikTok | v1 | 158 | 7.88 | 3.1 | 1 | 0 | 0 | 0 | 0 | Midday slot; FY 79%, Search 15%; drop-off 0:02 |
| 2026-10-12 | first-jobs | TikTok | v1 | 105 | 14.79 | 4.2 | 1 | 0 | 1 | 0 | 1 | Morning slot; Search 79%, FY 19%; drop-off 0:01 |
| 2026-10-12 | yandex-datacenters | TikTok | v1 | 211 | 15.55 | 10.1 | 21 | 2 | 2 | 1 | 2 | Midday slot; FY 97%; drop-off 0:01 |
| 2026-10-12 | si-rebrand | TikTok | v1 | 55 | 16.39 | 1.8 | 3 | 0 | 0 | 1 | 0 | Evening slot; traffic n/a; drop-off 0:01 |
| 2026-10-13 | muse-wonder | TikTok | v1 | 430 | 16.21 | 6.2 | 4 | 0 | 1 | 0 | 1 | Morning slot; Search 62%, FY 37%; drop-off 0:01 |
| 2026-10-13 | chip-casino | TikTok | v1 | 111 | 4.23 | 0.9 | 1 | 0 | 0 | 0 | 0 | Midday slot; FY 90%; drop-off 0:02 |
| 2026-10-13 | self-replicate | TikTok | v1 | 633 | 26.52 | 11.5 | 25 | 2 | 6 | 9 | 8 | Evening slot; FY 70%, Search 28%; drop-off 0:01 |
| 2026-10-14 | office-bug | TikTok | v1 | 310 | 18.12 | 8.4 | 16 | 0 | 2 | 2 | 1 | Evening slot; FY 89%, Search 8%; drop-off 0:02 |
| 2026-10-15 | ai-music-label | TikTok | v1 | 256 | 16.96 | 3.8 | 1 | 0 | 1 | 1 | 0 | Midday slot; Search 51%, FY 47%; drop-off 0:01 |
| 2026-10-15 | states-sue | TikTok | v1 | 124 | 9.78 | 2.3 | 2 | 0 | 0 | 0 | 0 | Evening slot; FY 82%, Search 14%; drop-off 0:01 |
| 2026-10-26 | ai-odyssey | TikTok | v1 | 124 | 5.65 | 1.5 | 2 | 0 | 0 | 1 | 0 | Evening slot; Search 71%, FY 23%; drop-off 0:01 |
| 2026-10-27 | anthropic-ipo | TikTok | v2 | 274 | 14.47 | 9.4 | 10 | 1 | 1 | 1 | 1 | Midday slot; FY 88%, Search 8%; drop-off 0:03 |
| 2026-10-27 | qwen-phone-home | TikTok | v2 | 323 | 23.15 | 13.5 | 10 | 2 | 2 | 6 | 3 | Evening slot; FY 84%, Search 15%; drop-off 0:01 |
| 2026-10-27 | openai-proofs | TikTok | v2 | 588 | 17.3 | 10 | 9 | 3 | 0 | 2 | 1 | Morning slot; FY 73%, Search 24%; drop-off 0:01 |
| 2026-10-28 | genie-worlds | TikTok | v2 | 190 | 10.22 | 4.5 | 2 | 1 | 0 | 2 | 0 | Morning slot; FY 77%, Search 19%; drop-off 0:01 |
| 2026-10-28 | ai-run-company | TikTok | v2 | 158 | 10.23 | 3.1 | 6 | 1 | 0 | 4 | 2 | Midday slot; FY 95%; drop-off 0:01 |
| 2026-10-29 | cs-exodus | TikTok | v2 | 3114 | 21.6 | 9 | 82 | 13 | 9 | 13 | 1 | Morning slot; FY 98%; drop-off 0:01 |
| 2026-10-29 | gemini-carbon | TikTok | v2 | 876 | 13.71 | 3.7 | 21 | 5 | 0 | 4 | 4 | Midday slot; Search 62%, FY 37%; drop-off 0:01 |
| 2026-10-29 | xai-noise | TikTok | v2 | 240 | 6.31 | 1.3 | 3 | 2 | 0 | 0 | 0 | Evening slot; FY 65%, Search 33%; drop-off 0:02 |
| 2026-11-03 | token-bill | TikTok | v2 | 51 | 3.34 | 0 | 1 | 0 | 0 | 0 | 0 | Evening slot; traffic n/a; drop-off 0:01; music -12 dB |
| 2026-11-03 | grid-protectors | TikTok | v2 | 144 | 10.83 | 6.5 | 0 | 1 | 0 | 0 | 0 | Morning slot; FY 70%, Search 25%, Profile 6%; drop-off 0:01; music -12 dB |
| 2026-11-03 | anthropic-rsi | TikTok | v2 | 149 | 6.72 | 2 | 2 | 2 | 1 | 0 | 0 | Midday slot; FY 82%, Search 13%; drop-off 0:01; music -12 dB |
| 2026-11-04 | siri-apps | TikTok | v2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | Morning slot; ANOMALY: still 0 views (caption edit / review right after posting, stuck distribution); ignore for story/format decisions; music -12 dB |
| 2026-11-04 | mod-ai-labels | TikTok | v2 | 214 | 5.89 | 1.4 | 2 | 1 | 0 | 0 | 0 | Midday slot; FY 63%, Search 33%; drop-off 0:01; music -12 dB |
| 2026-11-04 | school-search | TikTok | v2 | 298 | 12.83 | 4.4 | 4 | 1 | 0 | 1 | 1 | Evening slot; FY 71%, Search 27%; drop-off 0:01; music -12 dB |
| 2026-11-05 | chatgpt-gifs | TikTok | v2 | 402 | 5.58 | 0.5 | 3 | 1 | 0 | 2 | 0 | Morning slot; Search 64%, FY 35%; drop-off 0:01; music -12 dB |
| 2026-11-05 | linux-948 | TikTok | v2 | 380 | 16.72 | 7.7 | 12 | 1 | 1 | 2 | 0 | Midday slot; FY 93%, Search 5%; drop-off 0:01; sound vol 0 |
| 2026-11-05 | uber-agents | TikTok | v2 | 244 | 15.35 | 7.7 | 5 | 1 | 0 | 1 | 0 | Evening slot; FY 82%, Search 17%; drop-off 0:01; sound vol 0 |
| 2026-11-06 | airbnb-agent | TikTok | v2 | 112 | 3.59 | 0.9 | 0 | 1 | 0 | 0 | 0 | Morning slot; FY 85%, Search 13%; drop-off 0:01; sound vol 0 |
| 2026-11-06 | muse-video | TikTok | v2 | 864 | 15.01 | 7.3 | 11 | 2 | 10 | 3 | 1 | Midday slot; FY 81%, Search 19%; drop-off 0:01; sound vol 0 |
| 2026-11-06 | claude-bank | TikTok | v2 | 204 | 6.36 | 1 | 6 | 0 | 0 | 1 | 0 | Evening slot; FY 80%, Search 18%; drop-off 0:01; sound vol 0 |
| 2026-11-07 | math-checked | TikTok | v2 | 193 | 7.88 | 2.8 | 3 | 0 | 0 | 1 | 1 | Morning slot; FY 94%, Search 5%; drop-off 0:01; sound vol 0 |
| 2026-11-07 | ai-spend-stall | TikTok | v2 | 3 | 5.53 | 0 | 0 | 1 | 0 | 0 | 0 | Midday slot; ANOMALY: 2 views, stuck distribution; ignore for story decisions; sound vol 0 |
| 2026-11-07 | artex-exposed | TikTok | v2 | 920 | 20.38 | 6.1 | 21 | 2 | 1 | 7 | 2 | Evening slot; FY 81%, Search 18%; drop-off 0:01; sound vol 0 |
| 2026-11-08 | metr-doubling | TikTok | v2 | 302 | 10.49 | 3 | 8 | 1 | 0 | 1 | 1 | Morning slot; FY 97%; drop-off 0:01; sound vol 0 |
| 2026-11-08 | rsa-cracks | TikTok | v2 | 300 | 12.41 | 5 | 5 | 1 | 0 | 2 | 0 | Midday slot; FY 83%, Search 16%; drop-off 0:01; sound vol 0 |
| 2026-11-09 | office-hiring | TikTok | v2 | 135 | 8.71 | 2.2 | 0 | 0 | 0 | 0 | 0 | Evening slot; FY 100%; drop-off 0:01; only Nov 9 post on the account (home-robot, jet-power not posted); sound vol 0 |
| 2026-11-10 | insta-effects | TikTok | v2 | 210 | 5.57 | 0.5 | 0 | 1 | 0 | 0 | 0 | Morning slot; FY 54%, Search 46%; drop-off 0:01; sound vol 0 |
| 2026-11-10 | au-ai-law | TikTok | v2 | 135 | 17.18 | 3.5 | 1 | 1 | 0 | 1 | 0 | Midday slot; FY 94%, Search 5%; drop-off 0:01; sound vol 0 |
| 2026-11-10 | apple-ai-packs | TikTok | v2 | 316 | 15.97 | 3.5 | 2 | 2 | 1 | 0 | 0 | Evening slot; FY 91%, Search 8%; drop-off 0:01; sound vol 0 |
| 2026-11-11 | claude-meetings | TikTok | v2 | 472 | 11.96 | 5.1 | 10 | 1 | 2 | 2 | 0 | Morning slot; FY 65%, Search 34%; drop-off 0:01; sound very low (vol 0 or ~-35 dB) |
| 2026-11-11 | ring-drone | TikTok | v2 | 205 | 8.76 | 2 | 3 | 0 | 1 | 0 | 0 | Midday slot; FY 71%, Search 28%; drop-off 0:01; sound very low (vol 0 or ~-35 dB) |
| 2026-11-11 | grok-links | TikTok | v2 | 234 | 8.1 | 1.8 | 3 | 1 | 1 | 3 | 0 | Evening slot; FY 92%, Search 5%; drop-off 0:01; sound very low (vol 0 or ~-35 dB) |
| 2026-11-12 | latham-ai-awards | TikTok | v2 | 162 | 6.92 | 1.2 | 0 | 1 | 0 | 1 | 0 | Morning slot; FY 86%, Search 12%; drop-off 0:01; sound ~-35 dB |
| 2026-11-12 | big-walk-ai | TikTok | v2 | 177 | 15.83 | 9.4 | 1 | 1 | 0 | 1 | 0 | Midday slot; FY 74%, Search 24%; drop-off 0:02; sound ~-35 dB |
| 2026-11-12 | united-agents | TikTok | v2 | 156 | 14.13 | 6.3 | 0 | 1 | 0 | 1 | 0 | Evening slot; FY 92%, Search 6%; drop-off 0:02; sound ~-35 dB |
| 2026-11-13 | faa-smart | TikTok | v2 | 915 | 14.94 | 6.9 | 13 | 3 | 13 | 4 | 2 | Morning slot; Search 77%, FY 21%; drop-off 0:01; sound ~-35 dB |
| 2026-11-13 | ai-freeze-suit | TikTok | v2 | 105 | 13.21 | 13.9 | 0 | 0 | 0 | 0 | 0 | Midday slot; FY 94%, Search 6%; drop-off 0:01; sound ~-35 dB |
| 2026-11-13 | fake-shops | TikTok | v2 | 113 | 5.68 | 7.8 | 0 | 0 | 0 | 0 | 0 | Evening slot; FY 97%; drop-off 0:02; sound ~-35 dB |
| 2026-11-14 | fed-ai-worry | TikTok | v2 | 213 | 8.38 | 3.7 | 7 | 0 | 2 | 4 | 3 | Morning slot; FY 86%, Search 13%; drop-off 0:01; sound ~-35 dB |
| 2026-11-14 | maya-rediscovery | TikTok | v2 | 233 | 14.3 | 8.2 | 3 | 1 | 0 | 2 | 0 | Midday slot; FY 94%, Search 6%; drop-off 0:01; sound ~-35 dB |
| 2026-11-14 | chatgpt-wallet | TikTok | v2 | 220 | 7.75 | 1.8 | 1 | 3 | 0 | 0 | 0 | Evening slot; FY 86%, Search 14%; drop-off 0:01; sound ~-35 dB |
| 2026-11-15 | anthropic-ipo-demand | TikTok | v2 | 160 | 12.34 | 3.7 | 0 | 1 | 0 | 0 | 0 | Morning slot; FY 78%, Search 21%; drop-off 0:01; sound ~-35 dB |
| 2026-11-15 | ai-exam-cheat | TikTok | v2 | 492 | 11.79 | 3.3 | 6 | 1 | 1 | 2 | 0 | Evening slot; Search 74%, FY 25%; drop-off 0:01; sound ~-35 dB |
| 2026-11-16 | qwen-no-hacking | TikTok | v2 | 251 | 9.47 | 3.1 | 4 | 1 | 0 | 0 | 0 | Morning slot; FY 78%, Search 21%; drop-off 0:01; sound ~-35 dB |
| 2026-11-16 | apple-health-ai | TikTok | v2 | 125 | 5.4 | 1.5 | 0 | 0 | 0 | 0 | 0 | Midday slot; FY 68%, Search 30%; drop-off 0:01; sound ~-35 dB |
| 2026-11-16 | data-centre-march | TikTok | v2 | 111 | 5.54 | 0.9 | 2 | 0 | 0 | 0 | 0 | Evening slot; FY 90%, Search 8%; drop-off 0:01; sound ~-35 dB |
| 2026-11-17 | mythos-amd | TikTok | v2 | 248 | 15.67 | 8.8 | 4 | 1 | 1 | 1 | 0 | Morning slot; FY 84%, Search 14%; drop-off 0:01; sound ~-35 dB |
| 2026-11-17 | siri-limits | TikTok | v2 | 162 | 7.36 | 1.2 | 2 | 1 | 0 | 0 | 0 | Midday slot; Search 73%, FY 24%; drop-off 0:01; sound ~-35 dB |
| 2026-11-17 | ca-sues-openai | TikTok | v2 | 233 | 19.72 | 5.2 | 2 | 2 | 0 | 2 | 0 | Evening slot; FY 77%, Search 18%; drop-off 0:01; sound ~-35 dB |
| 2026-11-18 | genz-ai-friends | TikTok | v2 | 63 | 24.26 | 4.6 | 0 | 2 | 0 | 0 | 0 | Morning slot; traffic n/a (<100 views); drop-off 0:01; sound ~-35 dB |
| 2026-11-18 | ai-war-targets | TikTok | v2 | 137 | 32.46 | 2.8 | 2 | 1 | 0 | 2 | 0 | Midday slot; FY 97%; drop-off 0:01; sound ~-35 dB |
| 2026-11-18 | grok-bot-unasked | TikTok | v2 | 183 | 10.71 | 5.3 | 4 | 1 | 0 | 3 | 0 | Evening slot; FY 65%, Search 34%; drop-off 0:01; sound ~-35 dB |
| 2026-11-19 | gemini-two-months | TikTok | v2 | 113 | 5.47 | 2.3 | 1 | 0 | 0 | 0 | 0 | Morning slot; FY 87%, Search 12%; drop-off 0:01; sound ~-35 dB |
| 2026-11-19 | java4shell | TikTok | v2 | 254 | 16.23 | 6.9 | 5 | 1 | 1 | 2 | 1 | Evening slot; FY 66%, Search 34%; drop-off 0:01; sound ~-35 dB |
| 2026-11-20 | anthropic-debut | TikTok | v2 | 188 | 17.38 | 5.6 | 1 | 1 | 0 | 2 | 1 | Morning slot; Search 84%, FY 15%; drop-off 0:01; sound ~-35 dB; data <3 days old |
| 2026-11-20 | muse-mixups | TikTok | v2 | 140 | 5.33 | 2.0 | 0 | 1 | 1 | 0 | 0 | Midday slot; FY 51%, Search 48%; drop-off 0:01; sound ~-35 dB; data <3 days old |
| 2026-11-20 | doritos-gun-alert | TikTok | v2 | 149 | 16.26 | 5.5 | 10 | 4 | 0 | 2 | 0 | Evening slot; FY 89%, Search 10%; drop-off 0:01; sound ~-35 dB; data <3 days old |
| 2026-11-21 | signal-ai-block | TikTok | v2 | 173 | 11.26 | 3.7 | 1 | 1 | 0 | 1 | 0 | Morning slot; FY 71%, Search 28%; drop-off 0:01; sound ~-35 dB; data <3 days old |
| 2026-11-21 | riemann-claude | TikTok | v2 | 1642 | 22.9 | 7.7 | 32 | 1 | 1 | 4 | 3 | Midday slot; Search 78%, FY 21%; drop-off 0:01; sound ~-35 dB; data <3 days old |
| 2026-11-21 | ai-canaries | TikTok | v2 | 147 | 13.85 | 8.9 | 2 | 1 | 0 | 1 | 0 | Evening slot; FY 99%; drop-off 0:01; sound ~-35 dB; data <3 days old |
| 2026-11-22 | meta-net-zero | TikTok | v2 | 129 | 13.03 | 4.8 | 0 | 2 | 0 | 1 | 0 | Morning slot; FY 80%, Search 19%; drop-off 0:01; sound ~-35 dB; data <1 day old |
| 2026-11-22 | killer-robot-talks | TikTok | v2 | 112 | 8.34 | 3.2 | 2 | 1 | 0 | 2 | 0 | Midday slot; FY 98%; drop-off 0:01; sound ~-35 dB; data <1 day old |
| 2026-11-22 | ai-face-license | TikTok | v2 | 113 | 9.41 | 5.2 | 0 | 0 | 0 | 0 | 0 | Evening slot; FY 56%, Search 44%; drop-off 0:01; sound ~-35 dB; data <1 day old |
| 2026-11-23 | ai-speed-limit | TikTok | v2 | 98 | 19.09 | 11.5 | 0 | 1 | 0 | 0 | 0 | Morning slot; traffic n/a (<100 views); drop-off 0:01; sound ~-35 dB; data <1 day old |

What we're watching: v2 should raise Avg watch and Full % (cold open, loop) and Comments (Token's take +
question). Compare v1 vs v2 rows for the same slot (morning, midday, evening).

## Tik's read (2026-11-23)

Source: TikTok Studio, read 2026-11-23 ~10 AM ET. 82 posts (80 found in the Posts list; Nov 10 apple-ai-packs wasn't in it, so its row is last week's), 46 followers. Account last 7 days (Studio range Nov 15-21): 6.8K views (+6%), likes 110 (+5%), comments 16 (+129%), shares 22 (-67%), profile views 27, net followers +5. Traffic: **Search 53.6% / For You 45.3%**. This is the first week Search beat For You. Studio listed no account-level search queries (each one was too small), so the query notes below come from each video's own page. Rows from Nov 12 on have full fresh numbers; rows before that only have views, likes and comments refreshed.

- **Searchable names are now the main source of views.** riemann-claude got 1,642 views (78% Search, from "riemann hypothesis" in several spellings and languages), 22.9s avg, 7.7% full, 32 likes and 3 follows. It's our best video since cs-exodus. Others led by Search: anthropic-debut (84%, "anthropic ipo", 17.4s avg), ai-exam-cheat (74%, 492 views), siri-limits (73%, "ios 27.3 beta"), muse-mixups (48%, "meta"), and java4shell and grok-bot-unasked (34% each, from the exact names "java4shell" and "grokbot"). When a story has a name people are already typing (a famous problem, a product, a bug name, an IPO), put that exact term in the first on-screen words, the caption's first line and the cover. Post it the same day, while people are still searching.
- **But Search only pays off when the story has stakes.** siri-limits (7.4s avg, 1.2% full), muse-mixups (5.3s, 2.0%), gemini-two-months (5.5s), and apple-health-ai (5.4s) got search clicks and lost people right away. A big-brand "setting/limit/policy changed" story is still the weakest type. Riemann and the Anthropic IPO held because there was a big claim or a big number to wait for.
- **What holds on For You: an AI acting on its own, or an AI getting something wrong that hurt real people.** ca-sues-openai (19.7s avg), doritos-gun-alert (16.3s, 10 likes, 4 comments, our most comments this week), mythos-amd (15.7s, 8.8% full), java4shell (16.2s, 6.9%), ai-canaries (13.9s, 8.9%, 99% For You), meta-net-zero (13.0s). ai-war-targets had a 32.5s avg but only a 2.8% full watch: people stayed into the middle, then left before the end. Tighten its back half. genz-ai-friends held 24.3s, but on only 63 views.
- **Skip or rework:** protests and treaty talks with no visible victim. data-centre-march was given the evening slot as the "strongest hook" and got 5.5s avg and 0.9% full, the worst of the week. killer-robot-talks got 8.3s. The same goes for big-brand settings and feature changes (see above). The "strongest hook" picks for evening aren't beating the other slots: since Nov 16, evenings averaged 13.1s / 5.4% full / 170 views, mornings 14.5s / 5.6% / 158, and midday 13.6s / 3.1% / 386 (mostly Riemann). Pick the evening story by the For You pattern above, not by how dramatic the headline sounds.
- **Hook drop-off still hasn't moved.** All 21 new videos lose most viewers at 0:01. The first frame and the first 3 words must be the payoff: the searched name plus the surprising fact ("Claude may have cracked the Riemann hypothesis"). Don't open with context.
- **Comments rose, shares fell.** Account comments were up 129% (16 total), led by doritos-gun-alert (4), where the question was about real teens. Shares fell 67% because nothing this week had faa-smart's (13) or muse-video's (10) "send this to someone" angle. Keep the either/or question about the viewer, and favor stories people would forward (travel, school, money, safety).
- **Sound test: the data is still too thin to call.** Nov 3-5 morning posts with music under the voice at -12 dB (6 usable videos) averaged 7.53s watch / 2.47% full. Posts with the trending sound at volume 0 (Nov 5 midday to Nov 10, 13 videos) averaged 11.97s / 3.94%. Since about Nov 11-12 the sound has been at about -35 dB (1-3%, so TikTok keeps the sound tag). Those 35 videos averaged 12.66s / 5.02%, or 13.77s / 4.80% for the 21 since Nov 16. Voice-dominant mixes still hold about 65% longer than the -12 dB mix. But the -12 dB group is only 6 videos with weak stories, and the story type moves these numbers far more than the mix does. Keep the narration fully dominant, and don't read more into the comparison than that.
- **Anomalies:** siri-apps (0 views) and ai-spend-stall (3 views) are still stuck; ignore them. Nov 19 had 2 posts by design. Rows from Nov 20 on are under 3 days old, so re-read them next week.
