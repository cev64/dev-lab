# One-time setup (Charlie)

About 60-90 minutes total, in this order. Each step says what it unlocks. Never paste keys into a chat or a
commit; they go only in the places named below. Make long random tokens with a password generator (40+ chars).

## 0. Tonight, before bed (5 min): the nightly routine
- Create the routine with the prompt in `ops/ROUTINE_PROMPT.md`: repo `cev64/dev-lab`, daily 3:00 AM ET,
  model Opus, a fresh session each run. It can start before anything else below exists; it will build and
  keep NEEDS-CHARLIE.md current.
- Once the run opens the "Fieldwren foundation" PR, review and merge it. It contains the deploy workflows, so
  the agent won't merge it itself.

## 1. Domain (10 min, ~$10/yr) -> a real address
- Cloudflare dashboard -> Domain Registration -> register `fieldwren.com` (at cost). If it's gone, pick another
  name and change `brand` in `config/public.json` (or tell the agent in NEEDS-CHARLIE).

## 2. Cloudflare Pages (10 min) -> the site goes live
- Cloudflare -> My Profile -> API Tokens -> Create Token -> template "Edit Cloudflare Workers" or custom with
  **Account / Cloudflare Pages / Edit**. Copy it.
- Copy your **Account ID** (right sidebar on the account home page).
- GitHub repo -> Settings -> Environments -> New environment `production` -> add secrets
  `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
- After the first successful Deploy run: Cloudflare -> Workers & Pages -> `fieldwren` -> Custom domains ->
  add `fieldwren.com`.
- GitHub repo -> Settings -> Secrets and variables -> Actions -> **Variables** -> `PUBLIC_SITE_URL` = `https://fieldwren.com`.

## 3. Convex (15 min) -> live data, Pro unlocks, analytics
- convex.dev -> sign in with GitHub -> create project `fieldwren` (Free plan; don't add a card).
- Project -> Production deployment -> Settings -> **Deploy keys** -> generate a production deploy key.
  Add it as secret `CONVEX_DEPLOY_KEY` in the GitHub `production` environment. (Only GitHub Actions ever holds it.)
- Production deployment -> Settings -> **Environment variables**, add:
  - `SITE_URL` = `https://fieldwren.com`
  - `SITE_ORIGINS` = `https://fieldwren.com,https://fieldwren.pages.dev`
  - `NFL_SEASON` = `2026`
  - `BRAND_NAME` = `Fieldwren`
  - `METRICS_TOKEN` = a new random 40+ char string (read-only KPIs for the agent)
  - `ADMIN_TOKEN` = a different random 40+ char string (lets the agent trigger a data refresh)
- Copy the deployment's **HTTP Actions URL** (ends in `.convex.site`). Add GitHub Actions **variable**
  `PUBLIC_API_BASE` = that URL.
- Claude cloud environment for the routine (environment menu -> Edit -> Network secrets, or environment variables
  if that section isn't offered): `CONVEX_SITE_URL` (the .convex.site URL), `METRICS_TOKEN`, `ADMIN_TOKEN`.
  Never add the deploy key there.
- GitHub -> Actions -> Deploy -> Run workflow. Check the run is green.

## 4. Lemon Squeezy (20 min + approval wait) -> money
- lemonsqueezy.com -> sign up -> verify identity -> add payout bank -> create store "Fieldwren".
- First, email support: "We sell a fantasy football analytics season pass (stats dashboard and data feed). No
  gambling, no picks. OK to sell?" Keep the reply.
- New product "NFL Season Pass 2026", $9, single payment, **enable license keys** (activation limit 3,
  no expiry; the backend checks keys every 6 hours, so refunds lock out automatically).
  Note the **store ID** and **product ID** (in the URL/settings).
- Settings -> Webhooks -> URL `https://<your>.convex.site/webhooks/lemonsqueezy`, events `order_created` and
  `order_refunded`, set a signing secret.
- Convex production env vars: `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_PRODUCT_IDS` (product ID; comma-separate
  more later), `LEMONSQUEEZY_WEBHOOK_SECRET`.
- Copy the product's **checkout link** and set GitHub Actions variable `PUBLIC_CHECKOUT_URL` to it. Re-run Deploy.
- Test with Lemon Squeezy test mode, then switch the store live.

## 5. Social (15 min) -> daily posts run themselves
- X: create the brand account (@fieldwren if free) -> developer.x.com -> app with Read and Write -> generate
  API key/secret and access token/secret -> add a card, **set a monthly spend cap of $5** (new accounts get a
  $20 credit). Turn on the "Automated" account label in X settings. GitHub `production` secrets:
  `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`.
- Bluesky: create the account -> Settings -> App passwords -> new. GitHub secrets `BSKY_HANDLE`, `BSKY_APP_PASSWORD`.

## 6. Later, optional
- Resend (free) + DNS records on fieldwren.com for the weekly email: Convex env `RESEND_API_KEY`,
  `EMAIL_FROM` (e.g. `Fieldwren <hello@fieldwren.com>`). Marketing emails also need a postal address (CAN-SPAM).
- Google Search Console: add the domain, submit `https://fieldwren.com/sitemap.xml`.

## What you never need to do
Write code, upload files, approve normal PRs, or post daily. You merge the occasional `needs-charlie` PR, share
the launch kit once, and read the push notification when something needs you.
