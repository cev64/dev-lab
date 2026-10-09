# Backlog

Ranked by expected revenue impact. The nightly run takes the top unchecked item it can finish (P0 first),
unless something is broken. Add ideas at the bottom of the right section; re-rank on Sundays.

## P0 (this week)
- [x] Foundation on main (merged by Charlie 2026-10-09).
- [x] Launch kit for Charlie in `marketing/launch/`: a group-chat message for his fantasy leagues, 3 posts for his
      personal X, 1 LinkedIn post, and per-subreddit notes (read r/fantasyfootball and r/DynastyFF self-promo rules
      first; write posts that add value without a hard sell). Tell him in NEEDS-CHARLIE once the site is live.
- [ ] Social autopilot: `scripts/post-social.mjs` (X API v2 text posts via OAuth 1.0a user context; Bluesky via
      app password) + `.github/workflows/social.yml` (cron ~12:15 and ~18:15 ET) posting today's file from
      `marketing/queue/YYYY-MM-DD.json`; dry-run log when secrets are missing. Text-only on X (link posts cost $0.20;
      put the link in the bio, use a link at most 2x/week). Guarded path: needs-charlie.
- [x] Daily post generator (queue files must be generated from live snapshot once deployed): `scripts/make-posts.ts` turns the latest snapshot into 2 posts/day (risers, xFP leaders,
      FPOE outliers, PROE teams, playoff schedule). Facts only, no hype, nflverse credit where space allows.
- [ ] Player + team pages for SEO: static `nfl/player/<slug>/` for the top ~150 players by xFP and `nfl/team/<abbr>/`,
      generated at build from the snapshot with unique numbers and a short data-driven summary; add to sitemap.
- [ ] Shareable player card image (OG image per player) so links unfurl with the score.

## P1 (next 2-3 weeks)
- [ ] Start/sit compare: pick 2-3 players, side-by-side cards, shareable URL.
- [ ] Waiver radar: combine our opportunity metrics with Sleeper's public trending-adds endpoint (verify terms first).
- [ ] Weekly projection model with a backtest on 2024-2025 (report MAE vs a naive baseline); publish methodology.
- [ ] Tuesday risers email (needs Resend + domain).
- [ ] Trade value view using rest-of-season score.
- [ ] Fantasy Premier League: data model from the public FPL API (bootstrap-static, fixtures, element-summary),
      xG-based metrics, fixture difficulty, `/fpl/` dashboard, FPL Season Pass product (needs-charlie for the product).
- [ ] Items from "Metrics roadmap" in docs/specs/nfl-snapshot.md, best value first.

## P2 (later)
- [ ] Dynasty mode and 2027 draft kit (Jul-Aug).
- [ ] Price/packaging test (Skeptic review first).
- [ ] Pre-trim the play-by-play download to needed columns if refresh time or memory grows.
