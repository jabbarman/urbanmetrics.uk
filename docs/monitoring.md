# Monitoring

## Monitoring objectives

Catch these failures automatically:
- upstream unavailable
- stale dataset based on the source period, not the publisher re-index time
- schema drift / missing required fields
- partial geography loss within a layer
- build or deployment failure
- live-site regression on key journeys

## Scheduled checks

### Upstream checks

Run on a schedule in GitHub Actions:
- fetch each active v1 dataset endpoint
- verify the required fields still exist on the records that matter for the map
- verify the latest source period for each layer is within that layer's threshold
- verify geometry-bearing datasets still provide the full expected WMCA ward coverage
- classify failures as `freshness`, `schema`, `request`, or `runtime`

### Data refresh checks

After each refresh:
- validate generated artifact counts
- select one latest record per ward before publishing
- fail if any expected ward drops out or loses required geometry/value fields
- write refreshed artifacts into `data/generated` and `public/generated`
- commit those artifacts back to `main` only when the refresh passes, so production can actually serve the new data

### Live-site checks

Run against the deployed site:
- homepage returns `200`
- map page renders core layer controls
- `/status` and `/api/health` return expected payloads
- `/api/health` must be `ok` or `warning`; `degraded` is treated as a failing smoke result
- at least one layer metadata panel renders source and freshness text

## Alert routing

Recommended initial route:
- Discord webhook for failures with actionable context

Failure message should include:
- failing job name
- dataset id or endpoint summary when available
- failure class: `freshness`, `schema`, `request`, `runtime`, `deployment`, or `smoke`
- the first useful remediation step
- a direct link to the failing workflow run

## Freshness policy

Layer metadata should declare one of:
- `monthly`
- `quarterly`
- `annual`
- `irregular`
- `decennial`

Monitoring thresholds are defined per layer, not globally, and they are evaluated from the source period (`latestSourceDate`) rather than Birmingham City Observatory's `data_processed` timestamp.

Examples:
- monthly layer: alert after 45-60 days without a new source period unless the source itself is documented as paused
- quarterly layer: alert after 120 days
- annual layer: alert after 450 days
- irregular layer: alert when the source becomes unavailable or schema changes, not just because no new issue has been published

## Runbooks

### Upstream timeout

1. retry from CI once
2. if retry succeeds, log as transient
3. if retry fails, hold the last published artifact, mark degraded, and alert

### Schema drift or partial coverage loss

1. freeze publication of refreshed artifacts
2. attach the unexpected field or coverage summary to the workflow output
3. update the adapter only after reviewing the source change

### Stale data

1. verify the source has not intentionally paused publication
2. keep the existing artifact live
3. surface the stale warning in the UI and status page
4. if the layer remains important, replace it with a fresher source rather than masking the degradation

### Deployment regression

1. inspect build logs
2. roll back to the last green deployment if needed
3. keep monitoring alerts active until smoke checks recover
