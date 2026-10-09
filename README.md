# Fieldwren

Advanced fantasy football analytics that update themselves every night. Free dashboard; $9 Season Pass for the
full Pro data and a live Sheets/Excel feed. Run by a nightly Claude Code routine (see `CLAUDE.md`).

- Business plan: `ops/PLAN.md` · What needs the owner: `ops/NEEDS-CHARLIE.md` · Setup: `ops/SETUP.md`
- Nightly routine prompt: `ops/ROUTINE_PROMPT.md` · Log: `ops/LOG.md` · Backlog: `ops/BACKLOG.md`
- Data model spec: `docs/specs/nfl-snapshot.md` · Design language: `docs/FLUID_GLASS_DESIGN_GUIDE.md`

Stack: static site on Cloudflare Pages, Convex backend (data refresh, licence-gated Pro API, analytics, email list),
Lemon Squeezy checkout, GitHub Actions CI/CD. Data: nflverse (CC-BY 4.0). Not affiliated with the NFL.

```
npm ci
npm test                                            # model unit tests
CONVEX_AGENT_MODE=anonymous npm run test:backend    # e2e backend checks on a local Convex backend
npm run build && python3 -m http.server -d dist     # local site
```
