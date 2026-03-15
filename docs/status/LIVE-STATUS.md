# Live Status

## Current stage

`Post-v1 planning: Phase 1 health and workforce expansion`

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

## In progress

- validating the first SubICB health slice for production readiness
- deciding whether the current two-layer Talking Therapies slice is sufficient for the first Phase 1 push
- preparing the next health/service source after the initial Talking Therapies pair

## Known operational signal

The current live platform remains operational, but several shipped source datasets are stale under their declared freshness rules.

That is still an upstream data-age issue, not a blocking application defect.

## Next step

Commit and push the validated first Talking Therapies SubICB slice, then decide the next health/service source for the following phase-1 increment.
