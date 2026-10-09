# Decisions

Append-only. Date, decision, why, who/what reviewed it.

- 2026-10-09: Business = fantasy analytics (Fieldwren), not a template shop or betting tools. Why: template market is
  price-compressed and AI-replicable; Lemon Squeezy/Polar/Stripe restrict gambling; a self-refreshing data product
  fits a nightly agent and Charlie's interests. Reviewed: research, growth, CTO, skeptic subagents.
- 2026-10-09: No Etsy (owner). Sell on our own site via Lemon Squeezy (merchant of record, license keys, 5% + 50c).
- 2026-10-09: Hosting on Cloudflare Pages; GitHub Pages forbids commercial sites. Backend on Convex free plan (owner).
- 2026-10-09: Free data served as a static file by Cloudflare (rebuilt twice daily); Convex serves only Pro data,
  gzipped, to stay inside the free plan's 1 GB/month file egress.
- 2026-10-09: Data source nflverse (CC-BY 4.0). FTN charting not used until licence verified.
- 2026-10-09: X API is pay-per-use (~$0.015/text post, $0.20 with URL; $20 starter credit); use text posts, cap spend.
- 2026-10-09: Self-merge allowed for non-guarded paths when CI is green (see CLAUDE.md rule 7).
- 2026-10-09: Brand "Fieldwren" (fieldwren.com unregistered per RDAP on 2026-10-09; Charlie to buy).
