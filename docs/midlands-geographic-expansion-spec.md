# Midlands Geographic Expansion Specification

## Status and purpose

**Status:** implemented locally on 5 October 2026; awaiting the normal CI and production deployment flow.

Urban Metrics is currently West Midlands-first. Its economic and civic layers
substantially depend on Birmingham City Observatory (BCO), which is not a
reliable foundation for Nottingham or Leicester. This specification defines an
additive official-data foundation for wider-Midlands neighbourhood context. It
authorises the dedicated workspace and generated artifacts described below; it does not rename or remove existing workspaces.

## Scope decision

### Recommended scope: the two official English Midlands regions

Create a `midlands` geography group comprising the official **East Midlands**
and **West Midlands** regions, selected with stable Government Office Region
codes in a verified ONS lookup. This includes Nottingham and Leicester while
retaining their surrounding areas, rather than treating city boundaries as
complete urban economies.

| Topic | Decision |
| --- | --- |
| Public scope | `Midlands`, explained as “East Midlands + West Midlands” |
| Primary geography | LSOA 2021, filtered to the two official regions |
| Existing WMCA wards | Retain as `West Midlands regional context`; never label them Midlands-wide |
| Nottingham and Leicester | Included in the first Midlands release |
| Health | Remains a distinct Sub ICB service-geography workspace |
| Exclusions | No Wales, Scotland, North West, East of England, or loose “Midlands Engine” footprint |

LSOAs are the common unit because they are stable census statistical
geographies, fit within local authorities, and the recommended first sources
publish at this level. They are neighbourhood context, not precise facts about
individual households or people.

### Approval gate G0 — approved

The owner approved this two-region scope on 3 October 2026. If a later request
is only for Nottingham and/or Leicester urban areas, define exact
local-authority codes and a coverage test in a new decision record. Do not infer
city regions from map bounds, place search, or labels.

## Outcomes and non-goals

The completed release will add a Midlands context workspace, show comparable
neighbourhood indicators across Nottingham, Leicester, and the current West
Midlands footprint, and allow comparisons only where scope, geography, and
vintage match. Each layer exposes source, source period, LSOA 2021 geography,
units, licence, interpretation, and caveats.

It will not introduce a database or vector-tile server, mix ward/LSOA/Sub ICB
measures in one choropleth, create a composite pressure score, add real-time
transport, or remove BCO layers. A pressure score needs a separately approved
methodology.

## Data specification

The first two layers have been shipped locally after their official LSOA joins passed the code-coverage gate.
The other candidates are independent small follow-ups.

| Layer | Official source | Geography / cadence | Caveat and fallback |
| --- | --- | --- | --- |
| IMD 2025 overall deprivation and selected domain deciles | MHCLG: [English indices of deprivation 2025](https://www.gov.uk/government/statistics/english-indices-of-deprivation-2025) | LSOA 2021 / irregular | Deciles are relative to England, not absolute conditions or change. Hold the validated artifact and alert on file/schema/lookup drift. |
| Fuel-poverty proportion | DESNZ: [sub-regional fuel poverty 2026 (2024 data)](https://www.gov.uk/government/statistics/sub-regional-fuel-poverty-data-2026-2024-data) | LSOA / annual | Small-area estimates are modelled; do not imply precise differences or trends. Hold the last artifact and warn after 450 days. |
| Resident population | ONS via Nomis: [small-area population estimates](https://www.nomisweb.co.uk/datasets/pestoa2021) | LSOA 2021 / annual | Estimates may be revised. Preserve release year and fall back on request/schema failure. |
| Economic-activity context | ONS: [Census 2021 TS066](https://www.ons.gov.uk/datasets/TS066/editions/2021/versions/5?showAll=economic_activity) | LSOA or MSOA only if exact extract proves available / decennial | Census Day was 21 March 2021. Mark `referenceOnly`, not a current labour-market signal. |

### Candidate research, not a delivery promise

The delivery discovery phase must test the Nomis [Claimant count by sex and
age](https://www.nomisweb.co.uk/datasets/ucjsa) API for a licensed, stable
geography that can join exactly to the selected LSOA or a separately-labelled
geography. Do not promise it at LSOA level until query output, suppression, and
the boundary join are verified. Apply the same standard to housing,
accessibility, police, and workforce layers.

For each adopted source, add to `docs/data-sources.md`: official source URL,
publisher, licence, auth/rate limit, cadence, source period, raw and target
geography/vintage, lookup provenance, schema assumptions, suppression rules,
fixtures, interpretation, caveat, and fallback. A third-party catalogue may
assist discovery but cannot be the production source without licence review.

## Reference geography and coverage

Build a generic ONS reference-geography adapter that writes:

```text
data/generated/reference-geographies/midlands-lsoa-2021.geojson
data/generated/reference-geographies/midlands-lsoa-2021.lookup.json
```

The lookup contains LSOA code/name, local-authority code/name, region code/name,
boundary vintage, source URL, generated date, expected feature count, and a
checksum of sorted codes. Use ONS **generalised clipped** boundaries for web
maps, retaining product/version metadata; do not ship full-resolution geometry.
ONS describes its boundary products and OGL availability in its
[digital-boundary guidance](https://www.ons.gov.uk/methodology/geography/geographicalproducts/digitalboundaries).

Coverage rules:

- Calculate expected LSOAs by filtering the lookup to approved region codes,
  never from a hand-maintained count.
- After documented source and suppression rules, every required layer has
  exactly that code set; missing, duplicate, unmatched, or out-of-scope codes
  block publication.
- Another geography gets a distinct `compareGroup`.
- Preserve region/local-authority properties so future filters and summaries
  can be tested consistently.

## Architecture

### Scope registry

Add `src/server/datasets/geography-scopes.ts` with a typed `midlands` definition:

```ts
{
  id: "midlands",
  label: "Midlands",
  regionCodes: ["E12000004", "E12000005"],
  primaryGeography: { id: "lsoa-2021", label: "LSOA 2021", vintage: "December 2021" },
  initialViewport: /* verified bounds */,
}
```

The discovery phase must verify the actual lookup field and codes from the ONS
source rather than assuming its schema.

### Geometry/value separation

Current layer artifacts embed geometry in every layer. That is acceptable for a
small ward set but repeatedly transfers thousands of LSOA polygons. For the new
`midlands-lsoa-2021` group, add a compatible schema-2 path:

```text
public/generated/reference-geographies/midlands-lsoa-2021.geojson
public/generated/reference-geographies/midlands-lsoa-2021.lookup.json
public/generated/layers/<layer-id>.json  # metadata, LSOA-keyed values, summaries
public/generated/catalog.json             # layer-to-scope/reference mapping
```

The map loads one reference geometry collection, joins values by LSOA code in
memory (or creates one derived source per active layer), and uses the same
feature-state path for fills, hover, click, and legend. Keep schema-1 reading
for legacy layers until their intentional migration. This is a bounded change
to prevent repeated geometry payloads; it does not require a runtime database.

### Adapter contract and flow

Add a `reference_joined_file` source type beside `bco_api` and `csv_download`.
It declares format, LSOA-code/value fields, source-period rule, scope id,
coverage policy, and Zod schema. It must:

1. discover/download the official release;
2. validate raw columns and types;
3. normalise and join by LSOA code, never name;
4. validate exact coverage, calculate summaries/breaks, and emit schema-2 values; and
5. preserve the prior complete artifact and write visible failure status on any failure.

Never aggregate LSOA values to wards or allocate ward values to LSOAs without a
separately reviewed methodology.

## User experience

`/midlands-context` and its homepage card are implemented. Its scope line is “East Midlands + West Midlands; LSOA 2021.” `/regional-context` remains unchanged. A future brand update must change title, metadata, navigation, and copy together.

The workspace must:

- start at the approved two-region extent and fit to place-search/selection;
- show prominent scope, geography, and boundary-vintage labels;
- show LSOA name/code, local authority, region, source period, value, and interpretation in the selected-area panel;
- calculate legend breaks across the whole approved scope, not the current map view or filter, and explain that rule; and
- prevent a Midlands LSOA overlay from comparing with ward or Sub ICB overlays.

Retain keyboard controls and non-colour descriptions. Before launch, measure compressed geometry transfer, first usable map render, and layer-switch time on a mid-tier mobile emulation. Set explicit targets from that measurement rather than inventing them now.

## Operations and delivery

Extend upstream monitoring and `/status` to report source/discovery outcome, source period, schema outcome, expected/observed/missing/duplicate/suppressed LSOA counts, boundary version/checksum, artifact schema version, and fallback use. Display `Midlands context` separately from existing workspace groups. A new-layer failure cannot stop independent refreshes, but coverage/schema failure must alert and block that layer's publication.

| Cadence | Default policy |
| --- | --- |
| Annual modelled/context data | Warning after 450 days, measured from source period |
| Monthly labour-market data | Initial warning after 90 days; revise after observing publication lag |
| Census/reference data | `referenceOnly`; visible/versioned but not automatically degraded |
| Boundary reference | Check every sync; any code-set change requires review |

### Phased plan and evidence

| Phase | Work | Exit evidence |
| --- | --- | --- |
| A — discovery (2–4 days) | Approve scope; inspect exact ONS boundary/lookup fields, licence, version, feature count and size; profile IMD/fuel files; test Nomis feasibility. | Source matrix, verified URLs, fixture samples where permitted, generated coverage rule, performance baseline. |
| B — foundation (4–6 days) | Scope registry, generic reference adapter, schema-2 loading, IMD/fuel adapters, strict joins, fixtures/fallbacks. | Repeatable sync, exact coverage diagnostics, generated artifact validation. |
| C — workspace (3–5 days) | Route, navigation, map/metadata panel, compatible compare controls, search, accessibility, performance tuning. | Nottingham/Leicester E2E evidence and measured performance budget. |
| D — launch (2–3 days) | Monitoring/status/runbooks, preview then production smoke checks, one scheduled-refresh observation cycle. | Green checks, live-status evidence, reviewed docs, staged promotion. |

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, upstream monitoring, and deployed-site smoke checks at release. Update architecture, data-source, monitoring, deployment, and release documents in the same change; run `git diff --check` before commits.

## Tests and completion criteria

Automated coverage must include reference-region filtering; duplicate/missing codes; changed code set; valid/stale/schema-drift/malformed/suppressed source fixtures; deterministic summaries; fallback retention; incompatible-compare prevention; keyboard metadata updates; and E2E visits to Nottingham and Leicester. Smoke tests must verify the new route, LSOA layer, source metadata, and status payload, without regressing legacy routes.

The expansion is done only when the approved scope and LSOA set are machine-validated; at least IMD and fuel poverty render throughout the scope without unexplained gaps; all layer metadata and degraded states are present; legacy workspaces remain green; and all checks pass or an explicit, approved limitation is recorded.

## Risks and retained decisions

| Risk | Mitigation |
| --- | --- |
| Undefined “Midlands” scope creeps outward | Freeze two-region code scope at G0; additions need a decision record. |
| Source/boundary vintage mismatch | Exact code-lookup validation blocks release. |
| Large map payload | Generalised reference geometry, value-only layers, measured budget. |
| Misleading health/economic comparison | Separate workspaces and compare groups. |
| Modelled/lagged data presented as current | Source period, cadence, caveat, and `referenceOnly` labels. |
| Claimant data unsuitable at target geography | Treat feasibility as research; ship robust contextual layers first. |

After G0, decide whether the brand should remain `Urban Metrics UK` with a Midlands descriptor (recommended initially), whether a local-authority filter is needed at launch (recommended to defer), and what measured performance targets are achievable.

## Research basis

Research checked on 3 October 2026 confirms that MHCLG's IoD 2025 publishes LSOA measures; DESNZ's 2026 sub-regional release supplies 2024 modelled LSOA fuel-poverty estimates and warns against fine local comparisons; ONS publishes relevant census geographies/boundaries under OGL; and Nomis provides small-area population estimates plus a claimant-count dataset whose geography must be verified before adoption.

## Phase A evidence — 3 October 2026

The scope approval has been followed by a read-only source and compatibility
check. These are verified findings for the next implementation task, not
generated production artifacts.

| Check | Verified result |
| --- | --- |
| Boundary artifact | ONS `Lower layer Super Output Areas (December 2021) Boundaries EW BGC (V5)`: [GeoJSON](https://open-geography-portalx-ons.hub.arcgis.com/api/download/v1/items/68515293204e43ca8ab56fa13ae8a547/geojson?layers=0). It contains 35,672 features and the `LSOA21CD`/`LSOA21NM` fields needed by the adapter. |
| Scope lookup | ONS `LSOA (2021) to BUA to LAD to Region (December 2022) Best Fit Lookup in EW (V2)`: [CSV](https://open-geography-portalx-ons.hub.arcgis.com/api/download/v1/items/0352e811ec2c4fc5917f39aea2d1b8a3/csv?layers=0). Required columns are `LSOA21CD`, `LAD22CD`, `LAD22NM`, `RGN22CD`, and `RGN22NM`. |
| Approved scope cardinality | **6,421** unique LSOAs: 2,847 East Midlands (`E12000004`) and 3,574 West Midlands (`E12000005`). All 6,421 occur in the selected BGC boundary artifact; no expected code is missing. |
| IMD source contract | [File 7 CSV](https://assets.publishing.service.gov.uk/media/691ded56d140bbbaa59a2a7d/File_7_IoD2025_All_Ranks_Scores_Deciles_Population_Denominators.csv) has `LSOA code (2021)`, IMD score/rank/decile, domain measures, 2024 local-authority fields, and population denominators. Its LSOA codes cover all 6,421 approved-scope codes with zero gaps. |
| Fuel-poverty source contract | The [2026 XLSX](https://assets.publishing.service.gov.uk/media/6a02febf81a251700a20b42a/fuel-poverty-sub-regional-2026-2024-data-tables.xlsx), `Table 4`, has 2024 LSOA rows with `LSOA Code`, local authority, region, household count, fuel-poor household count, and `Proportion of households fuel poor (%)`. It covers all 6,421 approved-scope codes with zero gaps. |

The canonical expected set for implementation is generated from the lookup at
sync time, not the 6,421 literal. A changed count or checksum must remain a
review gate. The next Phase A task is to confirm source licence wording and
artifact-size/performance budgets, then record those results before starting
the foundation implementation.

## Implementation-readiness assessment — 3 October 2026

The current live interface is known well enough to begin the foundation work.
It already has the product boundaries that the expansion needs:

- the overview presents separate `Regional Context` and `Health Access`
  workspace cards and navigation entries;
- each workspace foregrounds its scope and primary geography before the map;
- the regional map provides primary/secondary layer controls, explicit legends,
  source/freshness notes, and an area-summary panel; and
- its stated design principle is one geography model per workspace so comparisons
  remain interpretable.

The intuitive implementation is consequently a third `Midlands Context`
workspace, labelled “East Midlands + West Midlands; LSOA 2021”, rather than
widening the existing `Regional Context` map or placing LSOA data beside WMCA
ward layers. The current live map loaded its five existing ward layers after its
initial data request and showed no browser-console errors during this check.

Begin with the shared LSOA reference artifact and the two validated source
adapters. Do not build the route or navigation card until those artifacts,
coverage diagnostics, and schema-2 geometry/value loading path are under test;
that keeps the first implementation increment invisible to users and easily
reviewable.
