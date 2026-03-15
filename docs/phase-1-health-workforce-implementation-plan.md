# Phase 1 Health And Workforce Implementation Plan

## Purpose

This plan translates the strategic direction update into a practical first implementation stage for the live Urban Metrics platform.

Phase 1 should prove that the existing generated-artifact architecture can ingest official health and workforce sources that are not Birmingham City Observatory APIs, while keeping the public UI map-first, calm, and interpretable.

## Phase 1 goal

Introduce the first health and workforce overlays in a way that is:

- operationally credible
- geographically honest
- compatible with the live production architecture
- extensible to later accessibility and pressure-map work

## Recommended Phase 1 scope

Phase 1 should not attempt to deliver every health concept named in the strategic brief.

The first implementation slice should target:

1. one service-pressure layer from NHS Talking Therapies monthly statistics
2. one mental-health demand or activity layer from Mental Health Services Monthly Statistics
3. denominator support for rate calculations where needed
4. a new health-service geography layer group at SubICB level

This is the safest route because these sources are official, structured, and both expose a workable monthly SubICB geography.

## Why SubICB geography is the right first target

The current platform is built around WMCA ward overlays with geometry supplied by Birmingham City Observatory.

That does not cleanly transfer to Phase 1 health sources because:

- NHS workforce and service datasets are often published by provider, commissioner, or ICB rather than ward
- trust-level data is not a resident-area geography and would be misleading as a choropleth without extra modelling
- some desired datasets are available as CSV or spreadsheet files rather than geometry-rich APIs

The inspected health publication files show that the strongest shared monthly geography is `SubICB`, not `ICB`.

SubICB geography is the best first compromise because it is:

- official and stable
- available with open boundaries
- present in both candidate monthly source files
- appropriate for service capacity and access context
- compatible with a map overlay model without inventing false ward precision

ICB remains a useful secondary geography for some dashboard-style files, but it is not the recommended starting point for the first implementation slice.

## Candidate source set

### Primary source 1: NHS Talking Therapies monthly statistics

Recommended use:

- access / waiting-pressure indicator
- employment-support context where suitable

Confirmed file:

- `https://files.digital.nhs.uk/D8/C94D7C/nhstalkingtherapies_month_mar_2025_activity_performance.csv`

Confirmed schema fields:

- `GROUP_TYPE`
- `ORG_CODE1`
- `ORG_NAME1`
- `ORG_CODE2`
- `ORG_NAME2`
- `MEASURE_ID`
- `MEASURE_NAME`
- `MEASURE_VALUE_SUPPRESSED`

Confirmed geography:

- `GROUP_TYPE = SubICB`
- example key pair: `ORG_CODE1 = 15E`, `ORG_NAME1 = NHS BIRMINGHAM AND SOLIHULL ICB - 15E`

Expected fit:

- structured official publication
- monthly cadence
- suitable for SubICB geography

Why first:

- strongest balance of relevance, cadence, and implementation feasibility

### Primary source 2: Mental Health Services Monthly Statistics

Recommended use:

- demand / caseload / contact / activity pressure indicator

Confirmed file:

- `https://files.digital.nhs.uk/73/127797/MHSDS%20Data_JanPerf_2026.zip`
- internal CSV: `MHSDS Data_JanPerf_2026/MHSDS Data_JanPerf_2026.csv`

Confirmed schema fields:

- `REPORTING_PERIOD_START`
- `REPORTING_PERIOD_END`
- `STATUS`
- `BREAKDOWN`
- `PRIMARY_LEVEL`
- `PRIMARY_LEVEL_DESCRIPTION`
- `SECONDARY_LEVEL`
- `SECONDARY_LEVEL_DESCRIPTION`
- `MEASURE_ID`
- `MEASURE_NAME`
- `MEASURE_VALUE`

Confirmed geography:

- `BREAKDOWN = Sub ICB - GP Practice or Residence`
- example key pair: `PRIMARY_LEVEL = 84H`, `PRIMARY_LEVEL_DESCRIPTION = NHS NORTH EAST AND NORTH CUMBRIA ICB - 84H`

Expected fit:

- structured official publication
- monthly cadence
- suitable for SubICB geography

Why second:

- complements Talking Therapies by showing broader service pressure

### Supporting source: ONS population estimates and health geography references

Recommended use:

- denominator support for rates per population
- geography metadata and validation support

Why needed:

- workforce or demand counts are more interpretable when normalized

### Boundary support: health geography boundaries

Recommended use:

- geometry for the first health/workforce compare group

Confirmed files:

- ICB GeoJSON: `https://open-geography-portalx-ons.hub.arcgis.com/api/download/v1/items/76dad7f9577147b2b636d4f95345d28d/geojson?layers=0`
- SubICB GeoJSON: `https://open-geography-portalx-ons.hub.arcgis.com/api/download/v1/items/fe17bb9ca66446b6b8faf992b5d24274/geojson?layers=0`

Confirmed geometry properties:

- ICB: `ICB23CD`, `ICB23NM`
- SubICB: `SICBL23CD`, `SICBL23NM`

Why needed:

- avoids forcing health indicators onto ward geography without evidence

## Explicit Phase 1 non-goals

Phase 1 should not include:

- live TfWM transport feeds
- vehicle tracking
- composite Regional Pressure scoring
- trust-level choropleths unless a defensible spatial methodology is documented
- broad dashboard expansion before data quality and geography are stable

## Required architectural adjustments

The live v1 architecture remains valid, but these targeted adjustments are needed.

### 1. Source adapter abstraction

Current layer ingestion assumes a Birmingham City Observatory API with:

- `datasetApiUrl`
- paginated `/records`
- source geometry and centroid fields

Phase 1 should introduce source adapter types such as:

- `bco_api`
- `csv_download`
- `manual_file`

Each adapter should expose a common normalized record output for the artifact generator.

### 2. Geometry join path

Phase 1 health layers will likely need reusable geometry lookup rather than source-supplied shapes.

Add a join flow that:

- loads a reference geometry artifact for the target geography
- matches normalized metric records to geometry IDs
- emits a standard `GeneratedLayer` artifact

### 3. Multi-geography compare groups

The platform currently assumes `wmca-ward`.

Add a new compare group for the first health phase:

- `sub-icb`

Each layer must declare:

- geography label
- geography vintage
- compare group
- whether it can be compared directly to other active groups

The UI must continue to avoid misleading comparisons across incompatible geographies.

### 4. Source-type-aware monitoring

Monitoring currently assumes API requests against a single dataset surface.

Phase 1 monitoring should support:

- file availability checks
- schema validation on downloaded tabular files
- freshness checks from publication period fields
- geometry-join coverage validation

### 5. NHS identifier lookup

The inspected health publications and ONS boundary files do not share the same primary codes.

Observed mismatch:

- NHS Talking Therapies uses `ORG_CODE1` values such as `15E` and `D2P2L`
- MHSDS monthly uses `PRIMARY_LEVEL` values such as `84H`
- SubICB boundaries expose `SICBL23CD` values such as `E38000006`
- ICB boundaries expose `ICB23CD` values such as `E54000008`

Observed alignment:

- the human-readable geography names in the NHS files match the ONS boundary naming pattern closely, for example `NHS BIRMINGHAM AND SOLIHULL ICB - 15E`

Phase 1 therefore needs a documented lookup or normalization step between NHS publication identifiers and ONS boundary identifiers.

This should be treated as a first-class adapter concern, not a UI-layer string join.

## Implementation sequence

### Step 1: groundwork

Deliverables:

- source shortlist confirmed against exact publication files
- chosen SubICB boundary source documented
- compare-group design updated to include `sub-icb`
- source adapter contract drafted
- code-lookup strategy drafted for NHS geography identifiers to boundary identifiers

Validation:

- documentation review
- no production behavior change yet

### Step 2: ingestion refactor

Deliverables:

- shared adapter interface
- existing BCO layers migrated to the new interface without changing output contract
- CSV download adapter added with fixtures

Validation:

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npm run data:sync`

### Step 3: geometry and compare-group support

Deliverables:

- reference geometry artifact for SubICBs
- join utility for metric records to reference geometry
- compare-group handling updated for `sub-icb`

Validation:

- coverage tests for SubICB geometry IDs
- negative-path tests for missing join keys
- local build and map smoke check

### Step 4: first health layers

Deliverables:

- first Talking Therapies layer
- first mental-health demand / activity layer
- documentation for source, cadence, caveats, and methodology
- monitoring configuration for both layers

Validation:

- source freshness and schema checks
- generated artifact inspection
- UI smoke check for map, legend, notes, and status output

### Step 5: copy and UX alignment

Deliverables:

- homepage and workspace copy shifted from transport-led framing to regional observatory / health and workforce context
- active layer interpretation text reviewed for non-specialist users

Validation:

- local UX walkthrough
- smoke test of status and map page

## Recommended first layer candidates

The first concrete pair should be:

1. Talking Therapies access or waiting-pressure indicator at SubICB geography
2. Mental health service demand/activity indicator at SubICB geography

These are better first candidates than `psychologists per population` because they are already published in usable monthly files with a shared subnational geography.

Psychological professions workforce layers should remain a Phase 1b candidate pending confirmation of a reliable structured source.

## Documentation changes required during implementation

Phase 1 implementation is not complete unless it updates:

- `docs/data-sources.md`
- `docs/architecture.md`
- `docs/monitoring.md`
- `docs/add-a-new-layer.md`
- status and gate-tracking docs if the delivery workflow advances stage

## Validation standard

Each Phase 1 slice must produce:

- code changes
- generated artifacts
- tests or fixtures for new adapters
- monitoring coverage
- user-facing interpretability text

## Risks

### Geography risk

Some desired workforce datasets may only be usable at trust level.

Mitigation:

- do not fake ward-level precision
- prefer SubICB or other resident-facing geographies first

### Source-format risk

Some health sources may publish reports more readily than machine-friendly files.

Mitigation:

- prioritize sources with official CSV or spreadsheet outputs first
- defer high-friction manual extraction sources

### UX clutter risk

Health and service-pressure additions could pull the product toward a dashboard feel.

Mitigation:

- keep one primary map
- use progressive disclosure
- avoid adding many new cards before the map interaction proves useful

## Phase 1 completion criteria

Phase 1 is complete when:

- the platform supports at least one non-BCO adapter path
- SubICB geography overlays can be rendered and monitored
- at least two health/service layers are live with clear metadata and caveats
- deployment, status, and monitoring behavior remain production-safe
- documentation is updated to reflect the new operating model

## Exact next step

Implement the adapter contract, NHS-code lookup, and SubICB geometry groundwork before building the first health layer.
