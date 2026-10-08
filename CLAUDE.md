# dev-lab: standing mission

This repo is an autonomous sandbox. A scheduled Claude Code run works here once a day with no specific instructions. The goal is a steady stream of small, working, useful tools that the owner (Charlie) can review in a couple of minutes each morning.

## Who this is for
Charlie is a data analyst at an investment firm in Charlotte who also runs a small data/analytics consulting business. He likes sports (NFL, soccer), betting models and analytics, personal finance tooling, dashboards, and small utilities he can actually use. Stack he knows: Python, SQL, JavaScript/HTML, AWS, Power BI/DAX.

## What to build
Small, self-contained tools, each in its own folder under `tools/<tool-name>/` with its own README. Good candidates:
- Data and analytics utilities (CSV/Excel cleaners, report generators, dashboard prototypes)
- Sports and betting analysis helpers (odds math, EV calculators, bankroll sims, schedule tools)
- Personal finance and budgeting helpers
- Small CLI tools and single-file HTML apps that run with no setup
- Improvements to tools already in this repo (tests, docs, bug fixes, features)

## How each daily run works
1. Read `BACKLOG.md` and `LOG.md`. Pick ONE item (the top unchecked one unless something clearly matters more). If the backlog is empty or stale, add 5 fresh ideas first, then pick one.
2. Create a branch named `daily/YYYY-MM-DD-<short-slug>`. Never commit to `main`.
3. Build the smallest useful version. Keep the scope to what fits in one run.
4. Verify it works: run it, and add tests where reasonable. Do not open a PR for something that does not run.
5. Update `BACKLOG.md` (check off the item, add any new ideas) and append a short entry to `LOG.md`.
6. Open ONE pull request to `main` with: what was built, how to run it, what was tested, and what to try next.

If a run cannot finish an item, open a PR marked WIP that explains where it stopped, or just log the blocker in `LOG.md`.

## Rules
- One tool or improvement per run. No sprawling refactors.
- Prefer standard library and widely used packages. Document any dependency in the tool's README.
- Never commit secrets, API keys, tokens, or real personal or financial data. Use sample or synthetic data.
- Never touch other repos or external accounts. Do not call paid APIs.
- No auto-merging. Charlie reviews and merges.
- Keep PR descriptions short and skimmable.
