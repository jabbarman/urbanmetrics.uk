# Data Sources

## v1 active source strategy

The first shipped overlays should come primarily from the Birmingham City Observatory API because it provides a consistent geospatial API shape, source attribution, and freshness metadata across multiple WMCA-ready datasets.

This is a deliberate v1 trade-off:
- faster delivery
- fewer custom joins
- lower runtime complexity
- one integration surface to monitor closely

The original publishing bodies remain important and are tracked below.

## Active v1 sources

| Source | API/docs URL | Auth | Rate limits | Licence | Expected freshness | Geography | Why v1 | Fallback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Birmingham City Observatory API | https://www.cityobservatory.birmingham.gov.uk/api/explore/v2.1/ | None | Observed response headers on 2026-03-07 showed `X-RateLimit-Limit: 5000` | OGL v3.0 on exposed datasets where stated | Varies by dataset: monthly, quarterly, annual, irregular | WMCA wards, WMCA LSOA 2021, Birmingham wards, more | Consistent API and geometry for multiple launch layers | Freeze last successful artifact and flag dataset stale/unavailable |
| Percentage Universal Credit claimants in employment - WMCA Wards (2025) | https://www.cityobservatory.birmingham.gov.uk/explore/dataset/percentage-universal-credit-claimants-in-employment-wmca-wards-2025/ | None | Inherits BCO API limits | DWP source surfaced under OGL context in BCO metadata | Monthly | Ward | Fresh economic signal | Keep last artifact; mark freshness breach |
| IMD - Indices of Deprivation 2025 - WMCA Wards (2024) | https://www.cityobservatory.birmingham.gov.uk/explore/dataset/imd-indices-of-deprivation-2025-wmca-wards-2024/ | None | Inherits BCO API limits | DLUHC / MHCLG source surfaced under OGL context in BCO metadata | Irregular | Ward 2024 | High-value deprivation context with geometry included | Keep last artifact and show geography-vintage note |
| Gross value added (GVA): All industries - WMCA Wards (2025) | https://www.cityobservatory.birmingham.gov.uk/explore/dataset/gross-value-added-gva-all-industries-wmca-wards-2025/ | None | Inherits BCO API limits | ONS via BCO metadata | Annual | Ward | Economic productivity context | Keep last artifact |
| Percentage households in fuel poverty - WMCA Wards | https://www.cityobservatory.birmingham.gov.uk/explore/dataset/percentage-households-in-fuel-poverty-wmca-wards/ | None | Inherits BCO API limits | BEIS / DESNZ via BCO metadata | Annual | Ward | Strong civic/social context layer | Keep last artifact |
| Claimant count by sex - WMCA Wards (2021) - Latest | https://www.cityobservatory.birmingham.gov.uk/explore/dataset/claimant-count-by-sex-wmca-wards-2021-latest/ | None | Inherits BCO API limits | Nomis via BCO metadata | Monthly | Ward | Useful summary cards and trend context | Keep last artifact |

## Phase 2 candidate sources

| Source | API/docs URL | Auth | Rate limits | Licence | Expected freshness | Geography | Why phase 2 | Fallback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Transport for West Midlands API | https://www.wmnetwork.co.uk/partners-and-media/developers/apis/ | App key | TfWM states traffic should stay below 10,000 hits per day unless agreed otherwise | Check per API and terms | Near-real-time to scheduled depending on endpoint | Stops, services, vehicles | Best option for live regional public transport overlays | Disable live layer if credentials missing or rate-limited |
| Police UK API | https://data.police.uk/docs/ | None | Official docs state no more than 15 requests/second, no more than 250 requests/minute, and no more than 30,000 requests/month | OGL v3.0 | Monthly | Street-level / area / force | Valuable crime context and freshness checks | Use last successful monthly artifact |
| Nomis API | https://www.nomisweb.co.uk/api/v01/help | None | Official docs note concurrent-request guidance and a 25,000-cell extract limit | Crown copyright / OGL context via Nomis copyright guidance | Monthly, quarterly, annual depending on dataset | Ward, SOA, LA, region, more | Strong direct-source fallback if BCO coverage changes | Prefer batched extracts, cache artifacts |
| NaPTAN API | https://beta-naptan.dft.gov.uk/API | None for browse/download flows | Not clearly published | OGL v3.0 | Static / periodic | Stop-level | Useful for static transport point overlays | Ship cached stop extract |

## Source-specific notes

### Birmingham City Observatory

Assumptions:
- API shape is stable enough for v1 but still requires schema validation
- dataset freshness must be evaluated per dataset, not globally
- ward vintage can differ between datasets, so compare UI must surface that explicitly

### TfWM API

Assumptions:
- credentials will not be available in every environment
- first live transport overlays should be optional rather than core to the first public release

### Police UK API

Assumptions:
- best suited to scheduled normalization rather than direct client-side requests
- monthly cadence means the UI should not imply real-time crime reporting

## Test fixtures required for each active source

Each adapter should maintain:
- one happy-path payload fixture
- one stale or missing-field fixture
- one degraded-source fixture where the HTTP request succeeds but the data contract fails
