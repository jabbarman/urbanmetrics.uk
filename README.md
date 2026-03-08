# West Midlands Signals

Public-facing West Midlands economic indicator website with interactive map overlays, source metadata, freshness monitoring, and AI-friendly extension rules.

## Current status

The repository now contains:
- discovery and implementation planning docs
- a working Next.js TypeScript map application scaffold
- normalized WMCA ward overlay artifacts generated from Birmingham City Observatory datasets
- health/status endpoints and a status page
- GitHub Actions for CI, upstream monitoring, refresh validation, and live-site smoke checks

See:
- `docs/project-brief.md`
- `docs/discovery-report.md`
- `docs/implementation-plan.md`
- `docs/repository-plan.md`
- `docs/architecture.md`
- `docs/data-sources.md`
- `docs/deployment.md`
- `docs/monitoring.md`
- `docs/add-a-new-layer.md`
- `docs/domain-and-branding.md`

## Quick start

```bash
npm install
npm run data:sync
npm run dev
```

Validation commands:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run monitor:upstreams
SITE_URL=http://127.0.0.1:3000 npm run monitor:site
```

## Recommended v1 stack

- `Next.js` + `React` + `TypeScript`
- `MapLibre GL JS`
- `Tailwind CSS`
- generated JSON/GeoJSON artifacts instead of a runtime geospatial database for v1
- `GitHub Actions` for CI, scheduled checks, and refresh validation
- `Vercel` as the primary hosting target, with `Cloudflare` as the fallback

## Initial shipped overlays

- Universal Credit claimants in employment
- IMD employment score
- fuel poverty
- gross value added (GVA)
- travel to work by bicycle

All are currently normalized to WMCA ward map layers through the Birmingham City Observatory API.

## Repository shape

- `src/app`: Next.js routes and pages
- `src/features`: map, dashboard, and status UI modules
- `src/server`: dataset contracts, loading logic, and health utilities
- `scripts`: ingestion and monitoring scripts
- `data/generated`: normalized data artifacts for the app and status surfaces
- `public/generated`: browser-accessible copies of generated artifacts
- `docs`: planning, operations, and AI-agent instructions
- `.github/workflows`: CI and scheduled automation

## Working principles

- simplicity over cleverness
- typed boundaries between UI, ingestion, and operations
- explicit source metadata and caveats for every layer
- graceful degradation when an upstream is unavailable
- low-ops deployment within the target monthly budget
