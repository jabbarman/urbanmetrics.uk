# Deployment Recommendation

## Recommendation

Primary path: `Vercel + GitHub Actions`

Fallback path: `Cloudflare Pages/Workers + GitHub Actions`

## Why Vercel is the primary choice

- best operational fit for a Next.js-first app
- preview deployments and rollback flow are straightforward
- environment variables, logs, and deployment checks are easy for future Codex sessions to reason about
- pushing refreshed generated artifacts to `main` triggers the production deployment without adding extra hosting components

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
- Discord webhook alerting: `£0`
- optional uptime monitor: `£0 to low single digits`

Expected v1 total: comfortably inside `£20-£40/month`

### If a future PostGIS database is needed

- add Neon or another managed Postgres/PostGIS service
- expected additional spend: low-to-mid teens monthly for a credible starter tier

## Operational architecture

- host the web app on Vercel
- keep normalized data artifacts in the repository for v1
- run scheduled refresh and monitoring jobs in GitHub Actions
- let the refresh workflow commit validated `data/generated` and `public/generated` changes back to `main`
- rely on that commit to trigger a fresh Vercel production deployment with the new artifacts
- send alerts to a Discord webhook first because it is low-friction and cheap
- expose `/status` and `/api/health` from the app for human and automated checks

## Required Vercel settings for this repo

- project repository: `jabbarman/urbanmetrics.uk`
- production branch: `main`
- framework preset: `Next.js`
- root directory: repository root `/`
- install command: `npm ci`
- build command: `npm run build`
- output directory: leave unset so Vercel uses the native Next.js output

## Refresh publication flow

1. GitHub Actions runs `npm run data:sync`
2. if schema and coverage validation pass, the workflow commits generated artifacts back to `main`
3. GitHub push triggers a Vercel production deployment
4. scheduled smoke checks validate the deployed site and `/api/health`

This avoids the original failure mode where refreshed artifacts only existed as workflow artifacts and never reached production.

## `DEPLOYMENT_NOT_FOUND` runbook

If `urbanmetrics.uk`, `www.urbanmetrics.uk`, and `urbanmetricsuk.vercel.app` all return Vercel `404` with `x-vercel-error: NOT_FOUND`, treat it as a deployment-alias problem before touching application code.

### What this usually means

- the project has no successful production deployment yet
- the Vercel project is linked to the wrong repository
- the project `Root Directory` is wrong, so Vercel is building the wrong folder
- the production branch is not `main`
- the domain or `vercel.app` alias is attached to a project that is not serving the intended deployment

### What to verify

1. In `Project -> Settings -> Git`, confirm the connected repository is `jabbarman/urbanmetrics.uk` and the production branch is `main`.
2. In `Project -> Settings -> Build and Deployment`, confirm:
   - framework preset is `Next.js`
   - root directory is empty or `/`
   - output directory override is disabled
3. In `Project -> Deployments`, confirm there is at least one successful production deployment for the latest `main` commit.
4. In `Project -> Settings -> Domains`, confirm:
   - `urbanmetrics.uk` is attached to this project
   - `www.urbanmetrics.uk` is attached to this project
   - only one redirect rule exists between apex and `www`
5. After any settings change, trigger a fresh production deployment. Domain changes alone do not fix a missing production alias.

### Fast verification sequence

1. Open `https://urbanmetricsuk.vercel.app/`
2. If that returns Vercel `NOT_FOUND`, fix the project/deployment first
3. Only check `urbanmetrics.uk` after the `vercel.app` hostname serves the app

### Local proof point

This repository currently builds and serves `/` locally with:

```bash
npm ci
npm run build
npm run start
```

That means a Vercel edge `NOT_FOUND` is more likely to be a deployment mapping problem than a missing Next.js route.
