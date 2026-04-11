# Live Status

## Current stage

`Post-v1 implementation: workspace separation foundation`

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

## In progress

- reviewing the new route split in the live environment once deployed
- deciding whether the next slice should focus on workspace-specific polish or the next SubICB health/service layer

## Known operational signal

The current live platform remains operational, but several shipped source datasets are stale under their declared freshness rules.

That is still an upstream data-age issue, not a blocking application defect.

One current upstream also appears to publish a newer but incomplete source period for the Universal Credit in-work layer. The sync path now falls back to the latest complete month, while monitoring should continue to flag the incomplete latest release.

## Next step

Verify the split routes in production and then choose the next delivery slice: workspace-specific UX polish or the next health/service data layer.
