# Live Status

## Current stage

`Post-v0.2 source refresh: current NHS data with guarded ward fallbacks`

## Completed

- live v1 release is deployed
- generated WMCA ward overlay pipeline is in production
- CI, upstream monitoring, refresh automation, and live smoke checks are in place
- workflow maintenance and clarity improvements were released as `v0.1.1`
- strategic direction has shifted from transport-led exploration toward a broader regional observatory model
- source feasibility for Phase 1 health/service layers has been confirmed against official publication files
- adapter-aware ingestion groundwork is in place for future non-BCO source types
- compare-layer selection now respects compare-group boundaries in the UI
- SubICB reference geometry and lookup artifacts are generated locally
- two local health layers are implemented from NHS Talking Therapies monthly data
- Midlands annual therapy-type context is generated and shown as a supporting panel for Talking Therapies layers
- a concrete workspace-separation proposal has been drafted to split the mixed map experience into `Regional Context` and `Health Access`
- sync and monitoring now handle partial upstream source periods more safely by falling back to the latest complete publication period while keeping monitor alerts active
- the mixed homepage workspace has been split into a true overview page plus dedicated `/regional-context` and `/health-access` routes
- the shared map shell now accepts workspace-specific catalogs, default layers, and source caveat framing without changing the generated-data contract
- a minimal shared navigation path now links overview, both workspaces, and service status
- the compare-legend bubble size scale now stays within its panel on both workspaces at standard desktop widths
- the workspace split and follow-up polish are being released as `v0.2.0`
- workspace header status is now scoped to the active workspace rather than inheriting the whole-product global status
- Talking Therapies monthly layers now allow for publication lag before being treated as stale
- GVA and fuel-poverty layers are now treated as structurally lagged context layers, with freshness tracked for visibility rather than as an operational defect
- the June 2026 refresh brings Universal Credit in-work data forward to the latest complete BCO period (`2026-02`)
- the June 2026 refresh brings Talking Therapies map layers forward to the NHS March 2026 publication (`2026-03-31`)
- the July 2026 refresh brings both Talking Therapies map layers forward to the NHS May 2026 publication (`2026-05-31`)
- Talking Therapies ingestion now discovers the latest published monthly release from the official NHS series page
- health reference geometry now uses ONS April 2026 Sub ICB boundaries and includes all 11 West Midlands Sub ICB areas in the map contract
- data sync now isolates failures per layer and preserves last successful artifacts without suppressing upstream-monitor alerts
- 2024 fuel-poverty values were identified but intentionally not published because changed May 2026 ward codes do not yet have compatible validated geometry in the current source path
- production verification confirms `urbanmetrics.uk` serves the May 2026 Talking Therapies period, April 2026 Sub ICB geography, and 11 West Midlands health features
- the deployed overview, Regional Context, and Health Access browser journey passes

## In progress

- tracking availability of matching May 2026 ward boundaries so UC, fuel poverty, and GVA can be migrated without misleading spatial joins

## Known operational signal

The current live platform remains operational.

The health workspace is current through May 2026. Global health remains degraded because Universal Credit is using its last complete February 2026 artifact and the live BCO feed now exposes an incomplete January 2026 period on a changed ward-code set.

Fuel poverty and GVA also remain on their last complete artifacts. Their live BCO records use changed May 2026 ward codes without geometry, so the sync reports warnings and refuses to create incompatible maps. The upstream monitor remains failing for all three ward feeds by design.

## Next step

Monitor ONS and BCO for a compatible May 2026 ward boundary source, then migrate UC, fuel poverty, and GVA together with explicit geography validation.
