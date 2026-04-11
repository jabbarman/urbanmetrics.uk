# Live Status

## Current stage

`Post-v1 planning: workspace separation and route split`

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

## In progress

- preparing the IA and route split that will separate the original Urban Metrics workspace from the health/service workspace
- aligning the next implementation step around a homepage index plus dedicated workspace routes

## Known operational signal

The current live platform remains operational, but several shipped source datasets are stale under their declared freshness rules.

That is still an upstream data-age issue, not a blocking application defect.

## Next step

If approved, implement the workspace split foundation: add a workspace registry, create `/regional-context` and `/health-access`, and convert `/` into an index page.
