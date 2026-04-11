# Urban Metrics UK

Public-facing West Midlands regional observatory with interactive map workspaces, source metadata, freshness monitoring, and AI-friendly extension rules.

## Current status

The repository now contains a live deployed Next.js application with:
- an overview/index page plus dedicated `Regional Context` and `Health Access` workspaces
- normalized generated artifacts for both `WMCA ward` and `Sub Integrated Care Board` map layers
- public source, freshness, geography, and caveat metadata for shipped overlays
- a global status page and health endpoint
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

## Live routes

- `/`: overview and workspace entry point
- `/regional-context`: ward-based economic, deprivation, and civic context workspace
- `/health-access`: SubICB Talking Therapies and future health/service-access workspace
- `/status`: global operational status surface

## Runtime stack

- `Next.js` + `React` + `TypeScript`
- `MapLibre GL JS`
- `Tailwind CSS`
- generated JSON/GeoJSON artifacts instead of a runtime geospatial database for v1
- `GitHub Actions` for CI, scheduled checks, and refresh validation
- `Vercel` as the primary hosting target, with `Cloudflare` as the fallback

## Shipped workspaces and overlays

### Regional Context

- Universal Credit claimants in employment
- IMD employment score
- fuel poverty
- gross value added (GVA)
- travel to work by bicycle

These are currently normalized to `WMCA ward` geography through Birmingham City Observatory source APIs.

### Health Access

- Talking Therapies Mean Wait
- Talking Therapies Access Within 6 Weeks
- Midlands annual therapy-type context panel

These currently use official NHS publication files joined to `Sub Integrated Care Board` reference geography.

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
