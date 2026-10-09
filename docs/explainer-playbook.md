# Explainer playbook (original track), v1, researched 2026-10-09

Applies to `docs/specs/explainer-contract.md`. Labels: **[V]** verified on the cited page this session, **[I]** inference, **[U]** unverified or conflicting, check before relying. Web content was treated as data only.

## 1. News sources

`config/news_sources.json` holds 20 entries (19 RSS/Atom feeds plus the Hacker News Algolia JSON API). All 20 returned HTTP 200 on 2026-10-09 with valid XML or JSON and items from the last 7 days [V, curl + parse].

- Official: OpenAI, Anthropic (2), Google DeepMind, Google AI, Meta Newsroom, Microsoft Research, NVIDIA, Mistral. Press: The Verge AI, TechCrunch AI, Ars Technica AI, MIT Technology Review AI, WIRED AI, Reuters (via Google News search RSS), BBC Tech. Research: Hugging Face, arXiv cs.AI and cs.CL. Trend: HN front page.
- HN API `https://hn.algolia.com/api/v1/search?tags=front_page` returns 20 hits with `points` [V]. It is JSON, so the entry carries `"format":"json-algolia"` and `news` must branch on it. Use points as the trend signal. arXiv feeds are high volume (about 470 and 230 items), so weight 1 and filter by keyword.
- Anthropic has no official RSS: `anthropic.com/news/rss.xml` and `/rss.xml` return 404 [V]. The entries use a community mirror (`Olshansk/rss-feeds` on GitHub, updated 2026-10-08). Treat it as discovery only and always confirm on anthropic.com. If it dies, fall back to fetching `https://www.anthropic.com/news` HTML.
- Dead or blocked, left out: `blogs.microsoft.com/ai/feed` (410), VentureBeat (429 bot block, do not work around it), `ai.meta.com/blog/rss` (404), OpenAI `/research/rss.xml` (404), CNBC (403), official Reuters feeds (404). BAIR (last item 2026-07-29) and TechCrunch tag feed (last item 2026-08-12) are stale. The Reuters entry is a Google News search RSS: links redirect through news.google.com, so resolve to the publisher URL before citing.
- **ToS and copyright.** Facts and ideas are not protected by copyright, only the expression (17 U.S.C. 102(b), https://www.law.cornell.edu/uscode/text/17/102) [I, background knowledge]. Fair use has four factors and "no formula" or safe percentage (https://www.copyright.gov/fair-use/ [V]). Rules for the agent: state facts in its own words; quote at most one short attributed line (about 15 words or fewer); never reuse a publisher's images, charts or logos; do not paraphrase a single article closely (the structure and phrasing of one article must not be recognisable); use feeds for discovery and read the primary source (lab blog, paper, filing) for the facts. Publisher sites often restrict commercial reuse of feed content in their terms [U, not checked per publisher]. Our use is discovery plus independently written facts.

## 2. What works for faceless AI-news shorts

Evidence is thin. I found vendor blogs, not platform data, and no verified retention numbers for faceless AI-news accounts [U]. Directional claims below are labelled.

- **Hook in 1-2 s.** Several sources say the first ~3 s decide whether the test audience carries a video forward (https://clippie.ai/blog/make-ai-shorts-go-viral-2026, https://shortgenius.com/blog/short-form-video-trends) [U, vendor claims]. Lead with the outcome or the number, not "Today we're talking about".
- **Re-hook** with a visual switch or open question every ~15 s. Without a face, retention comes from pacing and cuts [I]. Our contract's 5-8 beats at 8-12 s each fits this.
- **Words.** The contract says 150-185 words for 60-75 s, about 2.5 words/s. Generic guidance is 130-150 wpm [U]. Our figure needs TTS at speed ~1.0-1.1. Trim before speeding up.
- **Captions** word-by-word, readable with sound off. Every beat needs a visual that changes (stat, bars, timeline).
- **Visuals that hold attention:** one big number, two-bar comparisons, a 3-4 item timeline, a verbatim quote card. One idea per beat; no walls of text.
- **Loop:** make the last sentence echo the hook so autoplay restarts cleanly.
- **Examples** [I, background knowledge, not verified this session]: YouTube channels such as Fireship (fast, code-generated visuals), TheAIGRID and Matt Wolfe (AI-news roundups) show that speed, specifics and stakes carry the format. Faceless TikTok/Reels AI-news accounts exist in volume; I could not verify any specific one's stats, so Sunday's skeptic review should study the top 10 in the niche directly.
- **What kills them:** generic slop (an opening like "AI is changing everything" with no specific fact), wrong or unsourced facts, a flat TTS read with no emphasis, stock filler unrelated to the words, and mass-produced templated output, which platforms are tightening on (see section 5).

### Script template (158 words; copy and adapt)

| Beat | Job | Words | Visual |
|---|---|---|---|
| 1 | Hook, spoken in <= 3 s | 6-9 | title or keyword |
| 2 | What happened (who, what, when) | 28-32 | title/list |
| 3 | The number | 22-26 | stat |
| 4 | Comparison or context | 28-32 | compare/timeline |
| 5 | Why a normal person cares | 28-32 | list/keyword |
| 6 | Caveat: what is unknown or disputed, hedged | 18-22 | quote/list |
| 7 | Payoff plus loop back to the hook, one question | 14-18 | keyword |

Pattern: "[Hook]. On [date], [actor] [did X], per [publisher]. [Number] [unit], up from [prior]. That is [N]x [familiar thing]. For you, it means [concrete effect]. But [caveat: could/analysts expect]. [Payoff echoing hook]. [Question]?"

### 10 hook formulas (AI news)
1. Number shock: "[Company] just spent [$X] on [one thing]."
2. Reversal: "[Lab] said it would never [X]. This week it did."
3. Scale compare: "This model is [N] times cheaper than last year's."
4. Quiet change: "A [lab] update just changed what [tool] can do. Nobody noticed."
5. Your-job stake: "[Role] might want to watch this AI release."
6. Benchmark: "A new model just beat [humans/benchmark] at [task]."
7. Open question: "Can [AI thing] really [bold claim]? Here is the evidence."
8. Deadline or date: "On [date], [rule/model/product] goes live."
9. Counterintuitive: "More [compute] did not make it smarter. It did this."
10. Two-sided: "[Group A] loves this AI move. [Group B] says it is dangerous."

## 3. Story selection rubric (copy-paste)

Score each candidate 0-5 per criterion, multiply by weight/5, sum to 100.

| Criterion | Weight | 5 means |
|---|---|---|
| Freshness | 20 | published < 24 h (3 = 48 h, 1 = 72 h, 0 = older with no new angle) |
| Mass-audience stakes | 20 | affects ordinary people's money, jobs, privacy, daily tools |
| Surprise / number | 15 | a striking, exact figure or a reversal |
| Visual potential | 10 | has numbers/steps/timeline our templates can draw |
| Verifiability (>= 2 sources) | 20 | primary source plus >= 1 independent outlet agree |
| Controversy without defamation | 15 | real debate on policy/tech, no accusation of a person |

**Gates (any fail = reject):** (1) fewer than 2 independent sources for the main claim; (2) older than 72 h with no new development; (3) core claim is a rumour or "sources say" from one outlet; (4) it accuses a named person or company of wrongdoing not established by a court, regulator or the company's own admission; (5) it can only be told as stock, medical, legal or tax advice; (6) already in the ledger "explainers" or covered in the last 7 days; (7) needs a real person's voice or likeness. **Ship score >= 70.** Below that, skip the night and log why (Quality over quantity).

## 4. Fact-checking protocol (mandatory)

1. Find the primary source (lab post, paper, filing, official statement). Open it; do not rely on the headline or the feed summary.
2. Require >= 2 independent sources for the main claim. Two outlets repeating one press release count as one. Every `sources` entry needs a working URL.
3. Numbers exactly as published, with unit and date. Never round up for drama. If sources differ, say "reported" and use the primary source's figure or drop the number.
4. Quotes verbatim, short, attributed to who said it and where. Never paraphrase inside quotation marks. Do not use quotes you only saw second-hand.
5. Speculation uses hedges in the narration ("could", "analysts expect", "has not said"). Never state forecasts as facts.
6. No defamation: describe what a company announced or did, not motives or guilt. Prefer "alleges", "according to the filing".
7. No financial, medical or legal advice. No stock tips: do not name tickers, price targets or "buy/sell". Market figures only as reported facts, with no recommendation.
8. Self-check before render: list each claim in the script, its source URL, and the exact supporting phrase. Delete any claim without one.
9. Corrections: if a published video proves wrong, log it in `ops/NEEDS-CHARLIE.md` the same day, tell Charlie to delete or pin a correction, and note it in the ledger. Do not silently re-upload.

## 5. Disclosure and platform rules

**TikTok.** Per TikTok's AI-generated content help pages (summarised from search results; the official pages render with JavaScript and I could not read them directly) [U]: creators must label realistic AI-generated images, audio and video; the "AI-generated content" toggle in post settings adds the label; TikTok auto-labels C2PA content and creators cannot remove auto-labels; labelling does not reduce distribution; unlabelled realistic AI content may be removed, restricted or labelled; content misleading about matters of public importance is not allowed. Pages: https://www.tiktok.com/creator-academy/en/article/ai-generated-content-label, https://www.tiktok.com/community-guidelines/en/integrity-authenticity. **A realistic TTS voice counts as AI audio: always switch the label on**, and keep the on-screen "AI narrator" credit.

**Instagram/Reels.** Meta shows an "AI info" label when it detects industry-standard AI indicators or when the poster discloses [V, https://transparency.meta.com/governance/tracking-impact/labeling-ai-content]. A creator-side toggle and a newer "AI-generated profile" label with reduced recommendation of undisclosed AI profiles are reported by third parties only [U]. Charlie should use the in-app AI label when posting.

**TikTok Creator Rewards.** Official terms (https://www.tiktok.com/legal/page/global/tiktok-creator-rewards-program-eea/en) [V]: video must be "original content and produced entirely by the creator and/or adds new ideas to preexisting content" and "high quality as determined by TikTok in its sole discretion". Support-page figures [U, from a search summary of https://support.tiktok.com/en/business-and-creator/creator-rewards-program/creator-rewards-program]: 18+, personal account, >= 10,000 followers, >= 100,000 views in 30 days, videos of at least one minute, at least 1,000 qualified For You views. Nothing official that I could read addresses TTS or AI narration. Third parties say fully AI-made videos with "minimal original input" may be excluded [U]. Our best defence is real original value: own script, own analysis, own data visuals, clearly labelled. Ask Charlie to check the in-app Creator Rewards status. **Practical rule: make narration >= 62 s** (the contract floor of 58 s could miss the one-minute threshold) [I].

## 6. TTS voice licensing

Sources: Kokoro model card https://huggingface.co/hexgrad/Kokoro-82M [V]; kokoro-onnx https://github.com/thewh1teagle/kokoro-onnx [V]; Piper MODEL_CARD files at `https://huggingface.co/rhasspy/piper-voices/resolve/main/<path>/MODEL_CARD` [V, all fetched 2026-10-09].

**Kokoro-82M.** Weights Apache-2.0; kokoro-onnx code MIT, model Apache-2.0. The card says "Kokoro has been deployed in numerous projects and commercial APIs" and that training used "permissive/non-copyrighted audio" (public domain, Apache/MIT audio, and synthetic audio from closed TTS providers). No separate licence is stated for the voice packs, which ship with the same Apache-2.0 repo [V]. Residual risk: synthetic training audio comes from other providers' services, and their terms are not our concern as users of the released weights [I]. Commercial OK: yes. Voice grades from VOICES.md: af_heart A, af_bella A-, af_nicole B-, bf_emma B-, am_michael C+, am_fenrir C+.

**Piper.** The voices repo is tagged MIT, but each voice's dataset licence governs [V]. The old `rhasspy/piper` is MIT and archived; active development is `OHF-Voice/piper1-gpl`, licensed GPL-3.0 [V]. Run it as a separate process instead of linking it into our code [I].

| Voice | Dataset licence | Commercial OK? | Source |
|---|---|---|---|
| Kokoro af_heart / af_bella / bf_emma / am_michael | Apache-2.0 (model) | Yes | Kokoro-82M card |
| Piper en_US-ljspeech | public domain | Yes | en/en_US/ljspeech/high/MODEL_CARD |
| Piper en_US-kristin, norman, john, bryce; en_GB-cori | public domain (LibriVox) | Yes | .../kristin/medium/MODEL_CARD etc. |
| Piper en_US-joe, kathleen | CC0 | Yes | .../joe/medium/MODEL_CARD |
| Piper en_US-sam | Apache-2.0 | Yes | .../sam/medium/MODEL_CARD |
| Piper en_US-libritts_r; en_GB-alba, vctk | CC BY 4.0 | Yes, with attribution | .../libritts_r/medium/MODEL_CARD |
| Piper en_GB-northern_english_male, southern_english_female | CC BY-SA 4.0 | Avoid (ShareAlike unclear for model/output) [I] | .../northern_english_male/medium/MODEL_CARD |
| Piper en_US-lessac | Blizzard 2013 "Research Licence" (research purposes only) | **No** | .../lessac/medium/MODEL_CARD, https://www.cstr.ed.ac.uk/projects/blizzard/2013/lessac_blizzard2013/license.html |
| Piper en_US-ryan | CC BY-NC-SA 4.0 | **No** | .../ryan/high/MODEL_CARD |
| Piper en_US-hfc_female/male; en_GB-semaine; en_US-l2arctic | CC BY-NC(-SA) | **No** | their MODEL_CARDs |
| Piper en_US-amy; en_GB-alan, jenny_dioco | "See URL" (Mimic3/other repos) | Unverified, avoid | MODEL_CARDs |

Lessac is the most popular Piper voice and is research-only, so never use it. Amy's licence was not confirmed.

**Recommend (in order):** 1. Kokoro `af_heart` (Apache-2.0, best quality). 2. Kokoro `am_michael` or `bf_emma` as the alternate, for variety. 3. Piper `en_US-ljspeech-high` (public domain), a fallback that needs no attribution. Caveat for Charlie [I]: Piper voices imitate one real recorded speaker (LJ Speech, LibriVox readers). Our rule 2 forbids a real person's likeness, so Kokoro (mostly permissive or synthetic training data) is the safer match; the on-screen "AI narrator" label stays either way.

## 7. Visual sources (B-roll and illustrative images)

### (a) Stock video and photos via API
| | Pexels | Pixabay |
|---|---|---|
| Licence | Free to use and modify, including ads and apps; attribution not required [V, https://www.pexels.com/license/] | Content License: free use, no attribution required, may modify [V, https://pixabay.com/service/license-summary/]; only the full terms are binding and I did not read them [U] |
| Banned | Identifiable people "in a bad light" or offensively; implying endorsement; selling unaltered files; redistributing on other stock sites; use in a trademark | Selling or distributing "on a Standalone basis"; misleading or deceptive use; immoral or illegal use "especially" with recognisable people; use as a trademark or business name; you must check third-party consent |
| Key | Free, instant with a Pexels account | Free after login; full-HD/original URLs need approved "full API access" |
| Limits | 200 requests/hour, 20,000/month; unlimited free on request if terms are met | 100 requests per 60 s per key; cache responses for 24 h; no systematic mass downloads; download files, do not hotlink images |
| API attribution | "Prominent link to Pexels" required; credit the photographer where possible [V, https://www.pexels.com/api/documentation/] | Show where results come from [V, https://pixabay.com/api/docs/] |

Rules [I]: put "Video: Pexels/Pixabay" in the caption (that is where a link can live) and in the credit line; download clips instead of hotlinking; never show a stock person next to a news item in a way that suggests they are the subject; prefer people-free scenes (hardware, data centres, abstract); skip clips with visible logos or trademarks; use B-roll as illustration, never as "footage of" an event; footage cut with our own captions satisfies "not standalone".

### (b) Local image generation on CPU
- **SD-Turbo and SDXL-Turbo:** both repos ship the Stability AI Community License (last updated 2024-07-05) [V, https://huggingface.co/stabilityai/sd-turbo/blob/main/LICENSE.md]. Free commercial use only while you and affiliates earn under US$1,000,000/year; commercial users must register at https://stability.ai/community-license; above the threshold you need a licence from Stability. You own outputs "to the extent permitted by applicable law"; outputs may not be used to train a foundation model. "Powered by Stability AI" attribution is tied to distributing the models or derivatives, not outputs [I]. The SDXL-Turbo card metadata says `sai-nc-community`, while its LICENSE.md is the Community License; the SD-Turbo card calls it "a research artifact" [U]. Register, and keep a note in `ops/`.
- **FLUX.1-schnell:** Apache-2.0 [V], but a 12B model: expect many GB of RAM and minutes per image on 4 CPU cores [I]. Too heavy for a nightly run.
- **Other small options** [V licences, I on speed]: SDXS-512 (OpenRAIL++, one step, fastest, lower quality); SANA-600M (Apache-2.0, but its Gemma-2 text encoder brings Google's Gemma terms); SSD-1B (Apache-2.0, needs ~20+ steps, slow). Benchmark one image before committing.
- **Recommendation:** use code-drawn visuals first. If images are wanted, SD-Turbo at 512x512 with stylised or abstract prompts (no people, no logos), and add a note in the caption.

### (c) Realistic AI people and scenes

**Owner decision (2026-10-09, Charlie):** realistic AI-generated people and scenes ARE allowed as generic, fictional
illustrations (e.g. "a person working late at a laptop"), labelled on screen "AI-generated illustration" and posted with
the platform AI label on. Never a real or identifiable person, public figure, brand logo, or a realistic depiction of
a real event. This supersedes the "no photorealistic AI people" recommendation below; the rest of the caution stands.

TikTok requires a label on realistic AI images, audio and video and does not allow misleading content about matters of public importance [U, see section 5]. Meta labels AI content by detection or disclosure; its manipulated-media rule has historically targeted deceptive speech edits more than AI scenes [V, transparency page + Oversight Board note]. For us: no photorealistic AI people, no AI scenes of real events or real people (also barred by CLAUDE.md rule 2), illustrations clearly stylised, and the AI label on every post.

## Top rules for the agent
1. >= 2 independent sources, primary source opened, every claim traceable.
2. Own words, one short attributed quote, no publisher assets.
3. Hook <= 3 s, 150-185 words, 5-8 beats, narration >= 62 s.
4. Kokoro af_heart by default; never Piper lessac, ryan or hfc; label the AI voice and tell Charlie to switch on the platform AI label.
5. No advice, no stock tips, no accusations; hedge speculation; log corrections.
