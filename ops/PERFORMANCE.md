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
| 2026-10-11 | game-ports | TikTok | v1 | 346 | 11.05 | 4.5 | 20 | 0 | 1 | 3 | 2 | Evening slot; FY 85%, Search 14%; drop-off 0:01 |
| 2026-10-11 | chip-swap | TikTok | v1 | 157 | 7.88 | 3.1 | 1 | 0 | 0 | 0 | 0 | Midday slot; FY 79%, Search 15%; drop-off 0:02 |
| 2026-10-12 | first-jobs | TikTok | v1 | 105 | 14.79 | 4.2 | 1 | 0 | 1 | 0 | 1 | Morning slot; Search 79%, FY 19%; drop-off 0:01 |
| 2026-10-12 | yandex-datacenters | TikTok | v1 | 211 | 15.55 | 10.1 | 21 | 2 | 2 | 1 | 2 | Midday slot; FY 97%; drop-off 0:01 |
| 2026-10-12 | si-rebrand | TikTok | v1 | 55 | 16.39 | 1.8 | 3 | 0 | 0 | 1 | 0 | Evening slot; traffic n/a; drop-off 0:01 |
| 2026-10-13 | muse-wonder | TikTok | v1 | 420 | 16.21 | 6.2 | 4 | 0 | 1 | 0 | 1 | Morning slot; Search 62%, FY 37%; drop-off 0:01 |
| 2026-10-13 | chip-casino | TikTok | v1 | 111 | 4.23 | 0.9 | 1 | 0 | 0 | 0 | 0 | Midday slot; FY 90%; drop-off 0:02 |
| 2026-10-13 | self-replicate | TikTok | v1 | 633 | 26.52 | 11.5 | 25 | 2 | 6 | 9 | 8 | Evening slot; FY 70%, Search 28%; drop-off 0:01 |
| 2026-10-14 | office-bug | TikTok | v1 | 305 | 18.12 | 8.4 | 16 | 0 | 2 | 2 | 1 | Evening slot; FY 89%, Search 8%; drop-off 0:02 |
| 2026-10-15 | ai-music-label | TikTok | v1 | 253 | 16.96 | 3.8 | 1 | 0 | 1 | 1 | 0 | Midday slot; Search 51%, FY 47%; drop-off 0:01 |
| 2026-10-15 | states-sue | TikTok | v1 | 124 | 9.78 | 2.3 | 2 | 0 | 0 | 0 | 0 | Evening slot; FY 82%, Search 14%; drop-off 0:01 |
| 2026-10-26 | ai-odyssey | TikTok | v1 | 124 | 5.65 | 1.5 | 2 | 0 | 0 | 1 | 0 | Evening slot; Search 71%, FY 23%; drop-off 0:01 |
| 2026-10-27 | anthropic-ipo | TikTok | v2 | 274 | 14.47 | 9.4 | 10 | 1 | 1 | 1 | 1 | Midday slot; FY 88%, Search 8%; drop-off 0:03 |
| 2026-10-27 | qwen-phone-home | TikTok | v2 | 322 | 23.15 | 13.5 | 10 | 2 | 2 | 6 | 3 | Evening slot; FY 84%, Search 15%; drop-off 0:01 |
| 2026-10-27 | openai-proofs | TikTok | v2 | 572 | 17.3 | 10 | 9 | 3 | 0 | 2 | 1 | Morning slot; FY 73%, Search 24%; drop-off 0:01 |
| 2026-10-28 | genie-worlds | TikTok | v2 | 190 | 10.22 | 4.5 | 2 | 1 | 0 | 2 | 0 | Morning slot; FY 77%, Search 19%; drop-off 0:01 |
| 2026-10-28 | ai-run-company | TikTok | v2 | 158 | 10.23 | 3.1 | 6 | 1 | 0 | 4 | 2 | Midday slot; FY 95%; drop-off 0:01 |
| 2026-10-29 | cs-exodus | TikTok | v2 | 2669 | 21.6 | 9 | 64 | 12 | 9 | 13 | 1 | Morning slot; FY 98%; drop-off 0:01 |
| 2026-10-29 | gemini-carbon | TikTok | v2 | 868 | 13.71 | 3.7 | 21 | 5 | 0 | 4 | 4 | Midday slot; Search 62%, FY 37%; drop-off 0:01 |
| 2026-10-29 | xai-noise | TikTok | v2 | 236 | 6.31 | 1.3 | 3 | 2 | 0 | 0 | 0 | Evening slot; FY 65%, Search 33%; drop-off 0:02 |
| 2026-11-03 | token-bill | TikTok | v2 | 50 | 3.34 | 0 | 1 | 0 | 0 | 0 | 0 | Evening slot; traffic n/a; drop-off 0:01; music -12 dB |
| 2026-11-03 | grid-protectors | TikTok | v2 | 138 | 10.83 | 6.5 | 0 | 1 | 0 | 0 | 0 | Morning slot; FY 70%, Search 25%, Profile 6%; drop-off 0:01; music -12 dB |
| 2026-11-03 | anthropic-rsi | TikTok | v2 | 146 | 6.72 | 2 | 2 | 2 | 1 | 0 | 0 | Midday slot; FY 82%, Search 13%; drop-off 0:01; music -12 dB |
| 2026-11-04 | siri-apps | TikTok | v2 | 0 | 0 | 0 | 0 | 1 | 0 | 0 | 0 | Morning slot; ANOMALY: still 0 views (caption edit / review right after posting, stuck distribution); ignore for story/format decisions; music -12 dB |
| 2026-11-04 | mod-ai-labels | TikTok | v2 | 206 | 5.89 | 1.4 | 2 | 1 | 0 | 0 | 0 | Midday slot; FY 63%, Search 33%; drop-off 0:01; music -12 dB |
| 2026-11-04 | school-search | TikTok | v2 | 269 | 12.83 | 4.4 | 4 | 1 | 0 | 1 | 1 | Evening slot; FY 71%, Search 27%; drop-off 0:01; music -12 dB |
| 2026-11-05 | chatgpt-gifs | TikTok | v2 | 389 | 5.58 | 0.5 | 3 | 1 | 0 | 2 | 0 | Morning slot; Search 64%, FY 35%; drop-off 0:01; music -12 dB |
| 2026-11-05 | linux-948 | TikTok | v2 | 380 | 16.72 | 7.7 | 12 | 1 | 1 | 2 | 0 | Midday slot; FY 93%, Search 5%; drop-off 0:01; sound vol 0 |
| 2026-11-05 | uber-agents | TikTok | v2 | 243 | 15.35 | 7.7 | 5 | 1 | 0 | 1 | 0 | Evening slot; FY 82%, Search 17%; drop-off 0:01; sound vol 0 |
| 2026-11-06 | airbnb-agent | TikTok | v2 | 109 | 3.59 | 0.9 | 0 | 1 | 0 | 0 | 0 | Morning slot; FY 85%, Search 13%; drop-off 0:01; sound vol 0 |
| 2026-11-06 | muse-video | TikTok | v2 | 821 | 15.01 | 7.3 | 11 | 2 | 10 | 3 | 1 | Midday slot; FY 81%, Search 19%; drop-off 0:01; sound vol 0 |
| 2026-11-06 | claude-bank | TikTok | v2 | 201 | 6.36 | 1 | 5 | 0 | 0 | 1 | 0 | Evening slot; FY 80%, Search 18%; drop-off 0:01; sound vol 0 |
| 2026-11-07 | math-checked | TikTok | v2 | 179 | 7.88 | 2.8 | 3 | 0 | 0 | 1 | 1 | Morning slot; FY 94%, Search 5%; drop-off 0:01; sound vol 0 |
| 2026-11-07 | ai-spend-stall | TikTok | v2 | 2 | 5.53 | 0 | 0 | 1 | 0 | 0 | 0 | Midday slot; ANOMALY: 2 views, stuck distribution; ignore for story decisions; sound vol 0 |
| 2026-11-07 | artex-exposed | TikTok | v2 | 451 | 20.38 | 6.1 | 16 | 1 | 1 | 7 | 2 | Evening slot; FY 81%, Search 18%; drop-off 0:01; sound vol 0 |
| 2026-11-08 | metr-doubling | TikTok | v2 | 301 | 10.49 | 3 | 8 | 1 | 0 | 1 | 1 | Morning slot; FY 97%; drop-off 0:01; sound vol 0 |
| 2026-11-08 | rsa-cracks | TikTok | v2 | 293 | 12.41 | 5 | 5 | 1 | 0 | 2 | 0 | Midday slot; FY 83%, Search 16%; drop-off 0:01; sound vol 0 |
| 2026-11-09 | office-hiring | TikTok | v2 | 134 | 8.71 | 2.2 | 0 | 0 | 0 | 0 | 0 | Evening slot; FY 100%; drop-off 0:01; only Nov 9 post on the account (home-robot, jet-power not posted); sound vol 0 |
| 2026-11-10 | insta-effects | TikTok | v2 | 179 | 5.57 | 0.5 | 0 | 1 | 0 | 0 | 0 | Morning slot; FY 54%, Search 46%; drop-off 0:01; sound vol 0 |
| 2026-11-10 | au-ai-law | TikTok | v2 | 134 | 17.18 | 3.5 | 1 | 1 | 0 | 1 | 0 | Midday slot; FY 94%, Search 5%; drop-off 0:01; sound vol 0 |
| 2026-11-10 | apple-ai-packs | TikTok | v2 | 316 | 15.97 | 3.5 | 2 | 2 | 1 | 0 | 0 | Evening slot; FY 91%, Search 8%; drop-off 0:01; sound vol 0 |
| 2026-11-11 | claude-meetings | TikTok | v2 | 440 | 11.96 | 5.1 | 10 | 1 | 2 | 2 | 0 | Morning slot; FY 65%, Search 34%; drop-off 0:01; sound very low (vol 0 or ~-35 dB) |
| 2026-11-11 | ring-drone | TikTok | v2 | 196 | 8.76 | 2 | 3 | 0 | 1 | 0 | 0 | Midday slot; FY 71%, Search 28%; drop-off 0:01; sound very low (vol 0 or ~-35 dB) |
| 2026-11-11 | grok-links | TikTok | v2 | 227 | 8.1 | 1.8 | 3 | 1 | 1 | 3 | 0 | Evening slot; FY 92%, Search 5%; drop-off 0:01; sound very low (vol 0 or ~-35 dB) |
| 2026-11-12 | latham-ai-awards | TikTok | v2 | 150 | 7.07 | 0.7 | 0 | 1 | 0 | 0 | 0 | Morning slot; FY 94%, Search 6%; drop-off 0:01; sound ~-35 dB |
| 2026-11-12 | big-walk-ai | TikTok | v2 | 166 | 16.96 | 9.3 | 1 | 1 | 0 | 1 | 0 | Midday slot; FY 78%, Search 22%; drop-off 0:02; sound ~-35 dB |
| 2026-11-12 | united-agents | TikTok | v2 | 152 | 14.42 | 5.8 | 0 | 1 | 0 | 1 | 0 | Evening slot; FY 94%, Search 6%; drop-off 0:02; sound ~-35 dB |
| 2026-11-13 | faa-smart | TikTok | v2 | 883 | 15.59 | 6.7 | 13 | 3 | 13 | 4 | 2 | Morning slot; Search 77%, FY 22%; drop-off 0:01; sound ~-35 dB |
| 2026-11-13 | ai-freeze-suit | TikTok | v2 | 103 | 13.24 | 5.7 | 0 | 0 | 0 | 0 | 0 | Midday slot; FY 94%, Search 6%; drop-off 0:01; sound ~-35 dB |
| 2026-11-13 | fake-shops | TikTok | v2 | 112 | 5.52 | 0.9 | 0 | 0 | 0 | 0 | 0 | Evening slot; FY 97%; drop-off 0:02; sound ~-35 dB |
| 2026-11-14 | fed-ai-worry | TikTok | v2 | 207 | 8.71 | 3.4 | 7 | 0 | 2 | 4 | 3 | Morning slot; FY 89%, Search 11%; drop-off 0:02; sound ~-35 dB; data <3 days old |
| 2026-11-14 | maya-rediscovery | TikTok | v2 | 226 | 14.45 | 8.4 | 3 | 1 | 0 | 2 | 0 | Midday slot; FY 96%, Search 4%; drop-off 0:01; sound ~-35 dB; data <3 days old |
| 2026-11-14 | chatgpt-wallet | TikTok | v2 | 213 | 7.73 | 1.9 | 1 | 3 | 0 | 0 | 0 | Evening slot; FY 89%, Search 11%; drop-off 0:01; sound ~-35 dB; data <3 days old |
| 2026-11-15 | anthropic-ipo-demand | TikTok | v2 | 156 | 12.12 | 3.8 | 0 | 1 | 0 | 0 | 0 | Morning slot; FY 80%, Search 20%; drop-off 0:01; sound ~-35 dB; data <3 days old |
| 2026-11-15 | ai-exam-cheat | TikTok | v2 | 172 | 14.66 | 5.1 | 3 | 1 | 0 | 1 | 0 | Evening slot; FY 67%, Search 33%; drop-off 0:02; sound ~-35 dB; data <3 days old |
| 2026-11-16 | qwen-no-hacking | TikTok | v2 | 124 | 7.67 | 1.6 | 1 | 1 | 0 | 0 | 0 | Morning slot; FY 84%, Search 16%; drop-off 0:01; sound ~-35 dB; data <1 day old |

What we're watching: v2 should raise Avg watch and Full % (cold open, loop) and Comments (Token's take +
question). Compare v1 vs v2 rows for the same slot (morning, midday, evening).

## Tik's read (2026-11-16)

Source: TikTok Studio, read 2026-11-16 ~10 AM ET (analytics shown as real-time). 62 videos, 39 followers. Account last 7 days (Studio range Nov 8-14): 6.4K views (+90%), likes 105 (+64%), comments 7 (+75%), shares 67 (+644%), profile views 26; net followers +4. Traffic: For You 69.5% / Search 29.8%. All rows above were refreshed with today's numbers.

- **Search is now our biggest single lever.** faa-smart got the most views of the period (883, 77% Search, 13 shares) from people searching the news itself ("faa grounds all flights", "smart ai air traffic control"). Other Search-led videos: chatgpt-gifs (64%), insta-effects (46%), claude-meetings (34%), ai-exam-cheat (33%), and from October cs-exodus is now 2,669 views. For news a normal person would search (flights, airlines, a named app/feature), put the exact name people type ("FAA", "Claude Meetings", "Ring Drone Cam") in the first on-screen text, the caption's first line, and the cover.
- **But Search views don't hold by themselves.** chatgpt-gifs (5.6s avg, 0.5% full), insta-effects (5.6s, 0.5%) and airbnb-agent (3.6s) were the worst holds of the period. "X can now do Y" feature announcements get clicks and then lose people. Lead those with what surprising thing it did, not the feature name alone.
- **For You winners: AI doing something risky or surprising, with a concrete number.** artex-exposed (20.4s avg, 451 views, 7 saves), linux-948 (16.7s, 7.7% full), uber-agents (15.4s, 7.7%), muse-video (821 views, 10 shares), big-walk-ai (17.0s, 9.3% full, gaming backlash), maya-rediscovery (8.4% full), rsa-cracks (5.0%). Security/hacking and "the AI got it wrong" stories keep holding. Favor these, especially for the evening slot.
- **Skip or rework:** corporate/finance/policy items with no visible stakes for the viewer: latham-ai-awards (7.1s, 0.7%), claude-bank (6.4s), chatgpt-wallet (7.7s), fed-ai-worry (8.7s), office-hiring (8.7s, 100% FY, no Search). fake-shops flopped in the evening slot (5.5s, 112 views) even though it was billed as the strongest hook, so "chatbots can mislead you" claims from a vendor test aren't enough. Lead with a real victim or a number.
- **Hook drop-off hasn't moved.** Every video still loses most viewers at 0:01-0:02. The first frame and first 3 words must be the payoff (a number, a name, "AI just did X"). No context sentence first.
- **Comments are flat at about 1 per video** (mostly our own pinned question). Shares are what's growing (faa-smart 13, muse-video 10). Keep the either/or question, and make it about the viewer ("Would you fly with this?") rather than about the company.
- **Sound test (data still thin, but leaning one way):** Nov 3-5 morning posts with music under the voice at -12 dB (6 usable videos) averaged 7.53s watch / 2.47% full. Posts with the sound attached at volume 0 (Nov 5 midday-Nov 10, 13 videos) averaged 11.97s / 3.94%. Since about Nov 11-12 the sound sits at about -35 dB (about 1-3%, so TikTok keeps the sound tag), and those 15 videos averaged 11.13s / 4.15%. Voice-only-level mixes are holding about 50% longer than the audible-music mix, but the -12 dB group is small and had weak stories (token-bill, anthropic-rsi), so this is a lean, not proof. Keep the narration fully dominant. Late-Oct v2 (no music, 8 videos) is still the best stretch: 14.62s / 6.81%, mostly from stronger stories.
- **Anomalies:** siri-apps (0 views) and ai-spend-stall (2 views) got stuck in distribution. Ignore them. Nov 9 only had office-hiring posted, and Nov 15 had 2 posts by design. Rows from Nov 14 on are under 3 days old, so re-read them next week.
