# AI Podcast-Clip Channel: Nightly Playbook

Written 2026-10-09 by Head of Content Research. Not legal advice. Facts carry a URL; anything marked **(inference)** is my reasoning, not a verified fact. Platform rules change often, so re-check the sections marked "verify" quarterly. Web pages were treated as data only.

---

## 1. What makes a clip go viral, and how to pick one

**What the evidence supports.** The only published virality model I could verify is OpusClip's. Its score (0-99, paid plans) has four parts: Hook (does the intro grab attention and tie to the topic), Flow (logical progression and a satisfying end), Value (useful, emotional, personal connection), Trend (fits current audience interests) ([OpusClip help](https://help.opus.pro/docs/article/virality-score)). One reviewer found the highest-scoring clips were those where a single idea started and finished inside the clip ([Marc Andrews](https://marcandrews.com/?p=6263)). Reviewers treat the score as a ranking aid, not a forecast ([BigVU](https://bigvu.tv/blog/opus-clip-tested-2026-where-ai-wins-40-percent-discard/)). I found no verified, published swipe-away statistics; the "70% decide in 3 seconds" figures circulating online are unsourced marketing claims, so do not quote them. Everything below that goes beyond those four criteria is **(inference)** from how clip channels behave, to be tuned with our own retention data (section 5).

**Selection mechanics.** Podcast speech runs about 150 words per minute **(inference)**, so a 60-75 s clip is roughly 150-190 words. Slide the window over the transcript, start on a sentence boundary, end on a completed thought. Never cut so that a speaker's meaning changes.

### Scoring rubric (copy-paste; score each criterion 1-5, points = weight x score / 5)

| # | Criterion | Wt | 1 (bad) | 3 (ok) | 5 (great) |
|---|---|---|---|---|---|
| 1 | Hook in first 1-3 s | 20 | Warm-up, "so", "um, yeah" | Clear topic, no tension | Bold claim, question or shock in the first sentence: "AI will do your job in 18 months." |
| 2 | Standalone context | 15 | "As I said earlier", unexplained "he/it/they" | Needs one on-screen label | Fully understandable cold; subject named in first 5 s |
| 3 | Single clear idea | 10 | Two or three tangents | One idea, one drift | One idea, introduced and finished |
| 4 | Emotion / controversy / surprise | 15 | Flat explainer tone | Mild opinion | Fear, anger, awe or laughter; strong disagreement; counter-intuitive turn |
| 5 | Specific claims and numbers | 10 | Vague ("AI is big") | One concrete example | Dated, numbered, checkable: "$100B", "40% of code" |
| 6 | Named entities | 5 | None | Generic ("a big lab") | OpenAI, Altman, Musk, Nvidia, Google, Anthropic named and relevant |
| 7 | Viewer stakes | 10 | Abstract or academic | Industry-level | Jobs, money, kids, privacy, safety, or "do this now" for the viewer |
| 8 | Payoff / ending | 10 | Trails off or cuts mid-thought | Reaches a conclusion | Punchline, reveal, or the sharpest line lands in the last 3 s |
| 9 | Quotability | 3 | No standout line | One decent line | A screenshot-worthy line of 12 words or fewer |
| 10 | Loop potential | 2 | Ends flat | Ends on a tidy beat | Last words rhyme with the opening claim, so the replay feels seamless |

**Gates (any one is a hard fail, no matter the score):** criterion 1 or 2 scores 1; clip exceeds 75 s or is under 55 s; audio has crosstalk, music bed or bleed that makes captions unreliable; the claim is plausibly false or defamatory about a named person (see section 4).
**Ship rule:** total >= 70 ships; 60-69 only if fewer than 3 clips clear 70 that night; below 60 never. Log score, source, timestamps, and hook text for every shipped clip.

**Red flags that kill a clip:** "as I mentioned"; opening on the host's long question; a sponsor read or ad break inside the window; inside-baseball names with no context; jargon with no payoff ("RLHF", "MoE") unless the stake is explained in the headline; a guest hedging both ways; the best line in the first 2 s being clipped mid-word; a punchline that depends on video the audience will not see; stale news (models and valuations date quickly); a clip the show already published, such as the "Most Replayed Moment" episodes in the Diary of a CEO feed (verified in its RSS).

### Hook-headline formulas (on-screen text, 8 words or fewer, fill `[ ]`)
1. `[Name] says AI will [do X] by [year]`
2. `AI just [verb] [job/field]`
3. `Nobody is ready for [thing]`
4. `[CEO] admits [surprising thing]`
5. `Why [Company] is [scared/panicking]`
6. `Your [job] has [N] years left`
7. `[N]% of [thing] is already AI`
8. `This is how AI actually [does X]`
9. `Stop doing [X] before AI [Y]`
10. `[Name] on what AI means for kids`
11. `The AI secret [Company] won't discuss`
12. `Sam Altman was asked [question]`
13. `What AI engineers fear most`
14. `AI is now [better than/replacing] [X]`
15. `[Name]: "[shocking 6-word quote]"`
16. `The $[N] billion AI mistake`
17. `Is [AI product] making us dumber?`
18. `He built [X] with AI in [time]`
19. `Why smart people disagree on AI`
20. `Watch this before using ChatGPT`

Rules: the headline must be true to the clip (no promise the clip does not keep); use a name or a number where possible; no all-caps shouting.

### Post caption and hashtags
- **Caption** (both platforms): line 1 restates the hook with a different angle; line 2 credit, `From [Show], ep. "[Title]" with [Guest]`; line 3 one question to prompt comments ("Would you trust it with your job?"). Keep under about 150 characters before the credit.
- **Hashtags** **(inference, no verified platform guidance; A/B test):** TikTok 3-5: one broad (#ai), one topical (#chatgpt / #openai), one niche (#aiagents), one audience (#techtok), plus one show tag only if permitted. Reels 3-5, same mix, all in the caption, not comments. Avoid long hashtag blocks and banned-or-spammy tags.

---

## 2. Format and editing

**Length.**
- TikTok accepts up to 10 minutes ([SocialBu](https://socialbu.com/blog/ideal-length-of-tiktok-videos)). Its Creator Rewards Program requires original videos longer than 1 minute; secondary sources list 10,000 followers and 100,000 views in 30 days (one source disagrees on views), and country lists conflict, so verify in-app ([TTCalculator](https://ttcalculator.net/learn/creator-rewards-program/), [PostFast](https://postfa.st/blog/tiktok-monetization-requirements)).
- **Originality, verified via TikTok's support page summary** ([support.tiktok.com](https://support.tiktok.com/en/business-and-creator/creator-rewards-program/creator-rewards-program), which I could not open directly since it is JavaScript-rendered): content must be original; reproductions of others' content with slight modifications such as filters, fixed text or stickers are excluded, and so are Duets and Stitches. **Implication (inference): captioned podcast excerpts will almost certainly not earn Creator Rewards. Do not plan revenue on it.** Still run clips at 62-75 s so the account is eligible if the content mix ever changes.
- YouTube Shorts: up to 3 minutes for uploads after 2024-10-15 ([Piktochart](https://piktochart.com/blog/how-long-youtube-shorts/)). Reels: sources conflict (90 s, 3 min, 20 min); verify in the account ([Inro](https://www.inro.social/blog/instagram-reels-can-now-be-20-minutes-long-new-time-limit-explained-2025)). Our 60-75 s clips fit all three.

**Captions.** Word-by-word, 2-4 words visible, 64-80 px bold sans-serif, white with a 6-8 px dark outline or soft shadow, the active word in one accent colour (yellow or green), no more than 2 lines **(inference: standard clip-channel styling, not a verified study)**. Never caption over the speaker's lips if video of faces is used. Sync to within 100 ms of the audio.

**1080x1920 safe zones.** Third-party sources disagree: bottom 270-367 px, top about 108-150 px, right 120-164 px, left about 60 px ([AdaptlyPost](https://adaptlypost.com/blog/social-media-safe-zones-2026-complete-guide), [TryMyPost](https://www.trymypost.com/blog/tiktok-ad-specs-2026-safe-zones)). Use the strictest union:
- Keep all text and key visuals inside **x 60-915, y 150-1540** (a 855 x 1390 box).
- Hook headline: y 200-420. Captions: y 1050-1350, centred. Credit line: y 1400-1500, small.
- Nothing important in the bottom 380 px or the right 165 px column.

**Pacing and first frame.** A moving or high-contrast visual and the hook text must be on-screen in frame 1 (the thumbnail often auto-picks frame 1). Start audio on the first spoken word, trimming silence to under 150 ms. Change the visual (zoom, cut, graphic) every 3-5 s **(inference)**. Cut dead air and filler inside the clip, but not so that the speaker sounds spliced.

**Progress bar.** A thin bar (6-8 px, accent colour) at y 1500-1540 inside the safe box, filling over the clip, helps viewers feel the end is near **(inference)**.

**Looping ending.** Cut the last frame at the sentence end; no outro card, no "follow for more". If the opening claim and last line echo, the loop is seamless. Put "Full ep: [Show]" in the caption, not on a closing slate.

**Loudness.** Master to about -14 LUFS integrated with true peak at or below -1 dBTP; YouTube normalises near -14, and sources disagree on TikTok and Instagram (some say -13 to -10), so no verified spec exists ([OpusClip loudness guide](https://opus.pro/blog/best-loudness-normalizers), [OpenClip](https://openclip.app/learn/audio-normalization)). Test one clip at -12 vs -14 and compare retention.

**Cover.** Frame-1 hook text, 4-6 words, high contrast, inside the safe zone, centred in the 3:4 grid crop that profile grids use **(inference)**.

---

## 3. Sources

Every feed below was fetched on 2026-10-09 and returned HTTP 200 with the right show title and a newest episode within days (the exceptions are noted). "AI hits" is my own keyword count (AI, OpenAI, ChatGPT, Anthropic, Claude, Nvidia, AGI, LLM, Altman, robot) over the title and first 600 characters of the description of the latest 50 episodes; it is a rough proxy and over-counts show descriptions. Popularity is **not** verified by a chart this session; "Big" means widely known **(inference)**. Audio: feeds declare full-episode durations; I did not download audio, except a HEAD check on Lex Fridman (full 160-250 MB files).

| Show | RSS feed | Newest | AI hits /50 | Notes |
|---|---|---|---|---|
| Diary of a CEO | `https://feeds.megaphone.fm/thediaryofaceo` | Oct 9 | 14 | Big. Feed also carries its own "Most Replayed Moment" cuts; avoid duplicating |
| All-In | `https://rss.libsyn.com/shows/254861/destinations/1928300.xml` | Oct 2 | 40 | Big in tech; heavy AI and valuations |
| Lex Fridman | `https://lexfridman.com/feed/podcast/` | Sep 17 | 10 | Big. Hours-long; official "Lex Clips" YouTube channel ([lexfridman.com](https://lexfridman.com/podcast/)). Some entries declare a 5 MB placeholder length but the audio is full |
| Joe Rogan | `https://feeds.megaphone.fm/GLT1412515089` | Oct 8 | 4 | Biggest reach; AI only in tangents, search the transcript |
| Dwarkesh Podcast | `https://api.substack.com/feed/podcast/69345.rss` | Oct 1 | 29 | Dense, technical; strong frontier-lab names |
| Big Technology | `https://feeds.megaphone.fm/LI3617121267` | Oct 7 | 49 | Many CEO interviews |
| No Priors | `https://feeds.megaphone.fm/nopriors` | Oct 9 | 45 | Founder-heavy, 30-70 min |
| Moonshots (Diamandis) | `https://feeds.megaphone.fm/DVVTS2890392624` | Oct 7 | 47 | Long, optimistic, jobs-and-money angles |
| 20VC | `https://rss.libsyn.com/shows/61840/destinations/240976.xml` | Oct 8 | 46 | 3 episodes a week |
| Hard Fork (NYT) | `https://feeds.simplecast.com/l2i9YnTd` | Oct 9 | 29 | NYT-owned: higher rights risk |
| Cognitive Revolution | `https://feeds.megaphone.fm/RINTP3108857801` | Oct 8 | 47 | Technical; fewer broad hooks |
| Lenny's Podcast | `https://api.substack.com/feed/podcast/10845.rss` | Oct 4 | 35 | Product and work angle |
| Impact Theory | `https://rss.pdrl.fm/02d1c6/rss.art19.com/tom-bilyeus-impact-theory` | Oct 8 | 37 | Daily |
| Pivot | `https://feeds.megaphone.fm/pivot` | Oct 9 | 39 | New York Magazine; opinionated big-tech takes |
| Theo Von (This Past Weekend) | `https://feeds.megaphone.fm/thispastweekend` | Oct 6 | 1 | Big; AI rare, mine for funny or fearful AI tangents |
| Flagrant (Andrew Schulz) | `https://feeds.megaphone.fm/APPI6857213837` | Oct 8 | 5 | Big; same as Theo |
| StarTalk | `https://feeds.simplecast.com/4T39_jAj` | Oct 6 | 5 | Science framing |
| Huberman Lab | `https://feeds.megaphone.fm/hubermanlab` | Oct 8 | 2 | AI is occasional |
| TED Radio Hour | `https://feeds.npr.org/510298/podcast.xml` | Oct 9 | 7 | NPR: ~50 min, themed, rights-restricted |
| Acquired | `https://feeds.transistor.fm/acquired` | Sep 13 | 6 | Rare 3-5 hour episodes |

Use first: All-In, Diary of a CEO, Dwarkesh, Big Technology, No Priors, Moonshots, 20VC, Lex, Rogan (AI-dense or high-reach). Mine Theo, Flagrant, Rogan, Huberman only when the transcript contains AI keywords.

**Clipping programs and permissions.** I could not verify an open public clipping program for any show above. Searches found only generic marketplaces (Whop and ClipFarm style programs paying roughly $0.80-$3 per 1,000 views; shows approve clips per [FindClout](https://findclout.com/blog/best-podcast-clipping) and [OpenClip](https://openclip.app/clipping/podcast-clipping)), not named-show programs. What I can verify: Lex Fridman runs an official clips channel, and Diary of a CEO publishes its own replayed-moment episodes. Treat every other show as unlicensed unless written permission is on file. **Action for Charlie (inference, low effort):** email show or management contacts for written clip permission, starting with Lex, Dwarkesh, 20VC, No Priors, Big Technology; log replies in the repo.

---

## 4. Rights and platform risk (concise; not legal advice)

**Copyright posture.** Podcast audio is copyrighted by the show and sometimes by the guest. Captions plus generated visuals plus a hook headline is some transformation, but a 60-75 s excerpt that largely substitutes for the original is not safe just because credit is given. Fair use is decided case by case and unreliable for pure excerpt channels **(inference from general principles)**. A lawyer writing on clipping notes owners often expect formal licences and prior approvals ([Loeb & Loeb](https://www.loeb.com/en/insights/passle/2025/10/what-is-clipping-and-how-is-it-changing-social-media)). The general rule for the pipeline: the original's creators decide, not us.

**Platform "unoriginal content" rules.**
- TikTok: see section 2; reproduced content with slight modifications is excluded from Rewards, and the support page summary says flagged videos can be appealed.
- Instagram: secondary coverage (April 2026) says accounts mainly reposting others' content lose recommendation eligibility, and that real transformation (substantial new on-screen context, original graphics) counts while a watermark, light crop or credit alone does not ([Digital Music News](https://www.digitalmusicnews.com/2026/05/01/instagram-debuts-more-original-content-protections-for-creators/), [Planoly](https://planoly.com/blog/instagram-updates-its-original-content-policy)). I did not find the primary Meta post; verify.
- YouTube: official help says the July 2025 change renamed "repetitious" content to "inauthentic content" and left the reused-content policy unchanged; clips need significant commentary, modification or educational or entertainment value ([YouTube Help](https://support.google.com/youtube/answer/1311392)).
- **Reading (inference):** reach on Instagram and monetisation on all three are the exposed areas, even before any takedown. Our edge is added value per clip.

**What triggers takedowns or strikes (inference, common patterns):** a rights holder's complaint (DMCA), automated audio fingerprinting on network-owned shows, clipping a show that discourages it, misleading headlines or context that makes a guest look worse, music in the background, and a channel that is 100% unmodified excerpts.

**Risk-reduction checklist (every clip):**
1. Prefer shows with a permission or official clip channel; log the permission source in the manifest.
2. Cap at 75 s, never more than one clip per episode per day, never chain consecutive segments of one conversation into an "entire episode" series.
3. Add a visible transformation: hook headline, captions, a visual that adds information (a number, chart, name card), plus the caption credit. Aim for the new elements to carry the clip's framing, not just decorate it.
4. Credit format: on-screen (small, in the safe zone) `Source: [Show], [Guest]` and caption `From [Show], ep. "[Title]". Full episode on all podcast apps.` Never imply endorsement or ownership.
5. Do not alter meaning: no reordering sentences, no headline stronger than what was said, no AI-voice quotes. Attribute claims to the speaker ("[Name] claims...") so we are not asserting them.
6. Skip anything about a private individual, minors, health or legal allegations.
7. On a takedown or rights complaint: remove within 24 h, log it, drop that show, notify Charlie. Do not dispute without his approval. Three removals on one show means permanent blocklist.
8. Keep a clip manifest (show, episode URL, timestamps, headline, score, date) for any dispute.

---

## 5. Posting and growth

**Cadence (inference, no verified platform data):** 3 posts a day maximum from the nightly batch; stagger so one posts each evening block rather than all at once. Test 12:00, 18:00 and 21:00 in the audience's main time zone (US Eastern is the working assumption) for the first two weeks, then keep the best two slots. Consistency beats any single time slot.

**First 30 days for a faceless clip page (inference):**
- Days 1-3: post 9 clips across at least 4 different shows and 3 different hook formulas, to learn what the account's audience is.
- Week 1: complete the bio ("Daily AI clips from top podcasts"), pick one niche tag set, and pin the 2 best clips by watch-time.
- Weeks 2-3: double down on the top-quartile hooks; drop shows and formulas in the bottom quartile after at least 5 samples each.
- Reply to early comments within the first hour with a question; pin the best comment.
- Cross-post the same master to Reels and Shorts the same day; re-export per platform without the TikTok watermark; adjust the caption and hashtags. Remove any visible third-party watermarks before posting, since platforms deprioritise them **(inference)**.
- Keep one series identity: fixed caption style, accent colour and headline font so a repeat viewer recognises the page.

**Metrics to track per clip** (from platform analytics, copied into the manifest):
- 3-second hold / hook rate: views at 3 s divided by impressions. Vendor definition, no platform benchmark ([PostEverywhere](https://posteverywhere.ai/social-media-terms/hook-rate)); use your own median as the baseline.
- Average watch time as a share of clip length, and completion rate.
- Rewatch / loop rate (average watch time above 100% of length).
- Shares and saves per 1,000 views (the strongest intent signals, **inference**).
- Follows per 1,000 views, and comments.

**Feedback loop.** Each week Charlie (or the agent) pastes the table of the past 7 days of metrics. The agent then (1) ranks clips by retention and shares, not views alone; (2) correlates against the rubric criteria scores and hook formula IDs; (3) raises the weight of any criterion that separates top-quartile clips from bottom-quartile ones by at least 1 point on average, lowers the one that does not, and updates this file; (4) updates the show priority list; (5) retires hook formulas with fewer than half the median hold. Change at most two weights per week, and record the change in this file.

---

## Top rules to follow tonight
1. Gate on hook (first sentence) and standalone context before anything else; weights decide the rest.
2. One idea, 62-75 s, ends on the punchline, no outro slate.
3. Every clip has a visible transformation plus credit; never alter meaning.
4. Prefer permitted sources; log permission or lack of it; remove on first complaint.
5. Keep text inside x 60-915, y 150-1540; master audio to about -14 LUFS.
