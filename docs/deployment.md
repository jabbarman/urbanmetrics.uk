# Deployment Recommendation

## Recommendation

Primary path: `Vercel + GitHub Actions`

Fallback path: `Cloudflare Pages/Workers + GitHub Actions`

## Why Vercel is the primary choice

- best operational fit for a Next.js-first app
- preview deployments and rollback flow are straightforward
- no extra application runtime is needed for scheduled ingestion if GitHub Actions owns refresh jobs
- environment variables, logs, and deployment checks are easy for future Codex sessions to reason about

## Why Cloudflare is the fallback

- lower ongoing infra spend
- strong edge delivery and cron capabilities
- good choice if the app becomes mostly static with lightweight status endpoints

Trade-off:
- more platform-specific setup friction for a Next.js app than Vercel

## Other evaluated options

### Railway

Pros:
- simple service + cron + database model
- good if a future PostGIS service becomes mandatory

Cons:
- higher baseline cost for a mostly static v1
- less compelling than Vercel when a separate database is not yet justified

### Fly.io

Pros:
- flexible runtime control
- can host app and database-adjacent services later

Cons:
- more operational overhead than necessary for v1

## Cost model

### Primary path

- Vercel Hobby or Pro: `£0 to ~£16-£20+ per month` depending on traffic and whether Pro is chosen
- GitHub Actions on a public repo: typically `£0`
- Discord/Slack webhook alerting: `£0`
- optional uptime monitor: `£0 to low single digits`

Expected v1 total: comfortably inside `£20-£40/month`

### If a future PostGIS database is needed

- add Neon or another managed Postgres/PostGIS service
- expected additional spend: low-to-mid teens monthly for a credible starter tier

## Operational architecture

- host the web app on Vercel
- keep normalized data artifacts in the repo or attached build output for v1
- run scheduled refresh and monitoring jobs in GitHub Actions
- send alerts to a Discord webhook first because it is low-friction and cheap
- expose `/status` and `/api/health` from the app for human and automated checks
