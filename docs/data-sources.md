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
| Percentage Universal Credit claimants in employment - WMCA Wards (2025) | https://www.cityobservatory.birmingham.gov.uk/explore/dataset/percentage-universal-credit-claimants-in-employment-wmca-wards-2025/ | None | Inherits BCO API limits | DWP source surfaced under OGL context in BCO metadata | Monthly | Ward | Fresh economic signal | Keep last artifact; mark freshness breach or incomplete latest publication |
| IMD - Indices of Deprivation 2025 - WMCA Wards (2024) | https://www.cityobservatory.birmingham.gov.uk/explore/dataset/imd-indices-of-deprivation-2025-wmca-wards-2024/ | None | Inherits BCO API limits | DLUHC / MHCLG source surfaced under OGL context in BCO metadata | Irregular | Ward 2024 | High-value deprivation context with geometry included | Keep last artifact and show geography-vintage note |
| Gross value added (GVA): All industries - WMCA Wards (2025) | https://www.cityobservatory.birmingham.gov.uk/explore/dataset/gross-value-added-gva-all-industries-wmca-wards-2025/ | None | Inherits BCO API limits | ONS via BCO metadata | Annual, but structurally lagged | Ward | Economic productivity context | Keep last artifact; treat freshness as visibility rather than an operational defect |
| Percentage households in fuel poverty - WMCA Wards | https://www.cityobservatory.birmingham.gov.uk/explore/dataset/percentage-households-in-fuel-poverty-wmca-wards/ | None | Inherits BCO API limits | DESNZ via BCO metadata | Annual, but structurally lagged | Ward | Strong civic/social context layer | Keep last artifact; treat freshness as visibility rather than an operational defect |
| DESNZ sub-regional fuel poverty data 2026 (2024 data) | https://www.gov.uk/government/statistics/sub-regional-fuel-poverty-data-2026-2024-data | None | Published XLSX/ODS downloads rather than an API | OGL v3.0 unless stated otherwise | Annual | LSOA, constituency, local authority, region | Authoritative source for the newer 2024 values now exposed by BCO | Keep the last complete ward artifact until matching May 2026 ward geometry is available and validated |
| Claimant count by sex - WMCA Wards (2021) - Latest | https://www.cityobservatory.birmingham.gov.uk/explore/dataset/claimant-count-by-sex-wmca-wards-2021-latest/ | None | Inherits BCO API limits | Nomis via BCO metadata | Monthly | Ward | Useful summary cards and trend context | Keep last artifact |

## Phase 1 health and workforce sources

| Source | API/docs URL | Auth | Rate limits | Licence | Expected freshness | Geography | Why phase 1 | Fallback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| NHS Talking Therapies monthly statistics | https://digital.nhs.uk/data-and-information/publications/statistical/nhs-talking-therapies-monthly-statistics-including-employment-advisors | None | No explicit API rate limit because the implementation discovers the latest published release and uses its CSV download | Open Government Licence v3.0 unless stated otherwise by the publisher | Monthly, with a publication lag that can extend beyond 60 days from source-period end | Sub ICB | First non-BCO health/service-pressure layer with a clear monthly file and usable subnational geography | Hold last successful artifact, mark layer stale only when the widened publication-lag threshold is breached, and alert if latest-release discovery, file/schema validation, or the geography join fails |
| Talking Therapies monthly activity data file - May 2026 | https://files.digital.nhs.uk/50/96081C/nhstalkingtherapies_month_may_2026_activity_performance.csv | None | File download; avoid unnecessary repeated fetches in CI | Inherits publication licence context | Monthly | Sub ICB, Provider, Commissioning Region, England | Current structured CSV fallback and resolved latest file as of 2026-07-21 | Freeze the last successful artifact on discovery, download, schema, or geography failure |
| NHS Talking Therapies annual therapy-based outcomes | https://digital.nhs.uk/data-and-information/publications/statistical/nhs-talking-therapies-for-anxiety-and-depression-annual-reports/2024-25/therapy-based-outcomes | None | Published ZIP/XLSX downloads rather than an API; avoid repeated large fetches in CI | Open Government Licence v3.0 unless stated otherwise by the publisher | Annual | England, Commissioning Region, Provider | Companion context for therapy-type mix and outcomes on the Talking Therapies layers | Freeze the last successful supporting artifact and hide the companion panel if the annual file fails to download or parse |
| Mental Health Services Monthly Statistics | https://digital.nhs.uk/data-and-information/data-collections-and-data-sets/data-sets/mental-health-services-data-set/statistics-and-reports | None | No explicit API rate limit because the implementation uses published ZIP/CSV downloads | Open Government Licence v3.0 unless stated otherwise by the publisher | Monthly | Sub ICB, ICB, region, England, more | Follow-on service-demand layer after the first Talking Therapies overlay | Hold last successful artifact and alert on schema/join failures |
| Sub Integrated Care Board Locations (April 2026) Boundaries EN BSC | https://services1.arcgis.com/ESMARspQHYMw9BZ9/arcgis/rest/services/Sub_Integrated_Care_Board_Locations_April_2026_Boundaries_EN_BSC/FeatureServer | None | ArcGIS query endpoint; avoid unnecessary repeated fetches in CI | OGL v3.0 via ONS Open Geography portal | Reference boundary | Sub ICB 2026 | Current reference geometry for the health compare group | Keep the last generated reference and health artifacts if the boundary request or matching fails |

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

Current limitation as of 2026-07-21:
- Universal Credit in-work, fuel poverty, and GVA now expose May 2026 ward codes for Birmingham and Coventry while the expected generated artifacts use the preceding 2025 ward set
- the changed BCO rows do not include geometry or centroids, and ONS has published May 2026 ward names/codes but not a matching generalised boundary service yet
- refresh therefore preserves the last complete artifact and reports the validation failure; 2024 fuel-poverty values must not be mapped onto incompatible 2025 ward polygons

### NHS Talking Therapies

Assumptions:
- the series page continues to identify its latest published release with the NHS publication-list markup
- the release page continues to link an `activity_performance.csv` file with the documented field contract
- the pinned May 2026 URLs remain a documented fallback reference, but discovery failure is treated as visible source degradation rather than silently using an older month
- the West Midlands health workspace currently includes 11 Sub ICB locations, including Shropshire, Telford and Wrekin

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
