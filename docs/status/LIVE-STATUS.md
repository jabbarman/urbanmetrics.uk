# Live Status

## Current stage

`Post-v0.2 release: split workspaces and live polish`

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

## In progress

- reviewing the latest generated artifact refresh after deployment
- deciding whether the next slice should focus on automated NHS latest-publication discovery or the next SubICB health/service layer

## Known operational signal

The current live platform remains operational.

The main active degradation is now narrower: the Universal Credit in-work layer is refreshed to the latest complete BCO period but remains delayed against its monthly freshness policy.

BCO now exposes a complete `2026-02` period for Universal Credit in-work, so the earlier incomplete `2026-01` condition is no longer the current issue. The remaining issue is publication lag: `2026-02` is still older than the 60-day monthly freshness threshold on June 2, 2026.

## Next step

Verify the refreshed generated artifacts in production, then decide whether to automate NHS latest-publication discovery so future Talking Therapies releases do not require manually updating CSV URLs.
