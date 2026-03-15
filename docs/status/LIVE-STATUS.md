# Live Status

## Current stage

`Post-v1 planning: Phase 1 health and workforce expansion`

## Completed

- live v1 release is deployed
- generated WMCA ward overlay pipeline is in production
- CI, upstream monitoring, refresh automation, and live smoke checks are in place
- workflow maintenance and clarity improvements were released as `v0.1.1`
- strategic direction has shifted from transport-led exploration toward a broader regional observatory model

## In progress

- assessing health and workforce source feasibility for the next delivery stage
- defining the first non-BCO adapter path for CSV/download-based official datasets
- planning the first ICB-geography implementation slice

## Known operational signal

The current live platform remains operational, but several shipped source datasets are stale under their declared freshness rules.

That is still an upstream data-age issue, not a blocking application defect.

## Next step

Confirm the exact Phase 1 publication files and geography fields for the first health/service datasets, then implement the source-adapter and geometry-join groundwork needed for ICB overlays.
