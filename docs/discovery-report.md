# Discovery Report

## Recommended v1 scope

Ship a map-first site centered on WMCA wards, with one click-driven summary panel, supporting cards/charts, a public status page, and 4 to 5 launch layers:
- `Percentage Universal Credit claimants in employment - WMCA Wards (2025)`
- `IMD - Indices of Deprivation 2025 - WMCA Wards (2024)`
- `Gross value added (GVA): All industries - WMCA Wards (2025)`
- `Percentage households in fuel poverty - WMCA Wards`
- one transport-related layer for v1, starting with a ward/MSOA transport-access or travel-behaviour layer, with live TfWM overlays reserved for phase 2

The first release should optimise for clarity and resilience rather than breadth. A strong v1 can use one active filled choropleth plus a secondary compare overlay, explicit metadata, and summary cards instead of attempting every source from the brief on day one.

## Recommended stack

- `Next.js` for the application shell, routing, and status endpoints
- `React` client components for the map controls and dashboard interactions
- `TypeScript` across UI, ingestion, and monitoring code
- `MapLibre GL JS` for the main map experience
- `Tailwind CSS` for fast, consistent styling with clear design tokens
- `Zod` for source-shape validation and schema drift detection
- file-based normalized JSON/GeoJSON artifacts for v1 instead of introducing PostGIS immediately
- `Vitest` for unit tests and `Playwright` for smoke coverage
- `GitHub Actions` for CI, scheduled checks, refresh jobs, and alert dispatch

## Recommended data sources

### Ship in v1

- `Birmingham City Observatory API`
  - best fit for v1 map delivery because it already exposes WMCA ward and LSOA geometries, dataset metadata, and a wide range of regionally relevant indicators in a consistent API shape
  - good initial layer candidates are updated monthly, quarterly, annual, or irregularly with clear metadata
- `Nomis / ONS datasets surfaced through Birmingham City Observatory`
  - useful for labour market, claimant, qualification, and economic context layers without custom joins in the first release
- `Department for Levelling Up, Housing & Communities datasets surfaced through Birmingham City Observatory`
  - covers IMD 2025 and related deprivation scores
- `DfT / other transport access indicators surfaced through Birmingham City Observatory`
  - suitable for first transport-related contextual overlays

### Phase 2 candidates

- `Transport for West Midlands API`
  - use for live vehicle, service, or stop-level overlays once credentials and rate-limit handling are in place
- `Police UK API`
  - use for refreshed crime overlays or incident-density derivatives
- `NaPTAN`
  - use for static stop-level transport overlays when direct point layers are required

## Geography decision

Use `WMCA wards` as the default display geography for the first public map experience.

Why:
- more intelligible to public users than LSOA/MSOA
- small enough for fast client rendering
- already available with geometry in the selected v1 source set
- supports clear click summaries and rankings

Caveat:
- some useful transport-access layers are available at `MSOA` and some deprivation sources originate below ward level. The UI and metadata must mark geography mismatches clearly rather than implying direct comparability.

## Primary deployment recommendation

Use `Vercel + GitHub Actions` for v1.

Why:
- lowest-friction path for a Next.js app
- preview deployments and environment handling are simple
- GitHub Actions can own scheduled refreshes and upstream monitoring, avoiding extra runtime infrastructure
- cost stays inside the target budget even if Vercel Pro is adopted

Fallback:
- `Cloudflare Pages/Workers` if cost pressure becomes stronger than framework convenience

## Top risks

- source inconsistency across geography vintages, especially `ward 2024` vs `ward 2025`
- over-reliance on a single aggregator if Birmingham City Observatory changes schemas or availability
- transport live APIs requiring credentials and more careful rate-limit handling than the first release needs
- public misunderstanding when comparing different geographies or stale datasets
- no repository remote or deployment credentials currently present, which blocks actual publication from this workspace
