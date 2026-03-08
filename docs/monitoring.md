# Monitoring

## Monitoring objectives

Catch these failures automatically:
- upstream unavailable
- stale dataset
- schema drift / missing required fields
- build or deployment failure
- live-site regression on key journeys

## Scheduled checks

### Upstream checks

Run on a schedule in GitHub Actions:
- fetch each active v1 dataset metadata endpoint
- verify required fields still exist
- verify `data_processed` or equivalent freshness marker is within threshold
- verify geometry-bearing datasets still return valid geometry

### Data refresh checks

After each refresh:
- validate generated artifact counts
- compare key schema fingerprints against the previous successful run
- fail if required measures disappear or if geography ids are empty

### Live-site checks

Run against the deployed site:
- homepage returns `200`
- map page renders core layer controls
- `/status` and `/api/health` return expected status payloads
- at least one layer metadata panel renders source and freshness text

## Alert routing

Recommended initial route:
- Discord webhook for failures with actionable context

Failure message should include:
- failing job name
- dataset id or endpoint
- failure class: timeout, stale, schema drift, deployment, smoke
- first useful remediation step

## Freshness policy

Layer metadata should declare one of:
- `monthly`
- `quarterly`
- `annual`
- `irregular`
- `decennial`

Monitoring thresholds should be defined per layer, not globally.

Examples:
- monthly layer: alert after 45 days without a successful refresh unless the source itself is unchanged and documented
- quarterly layer: alert after 120 days
- annual layer: alert after 450 days
- irregular layer: alert when the source becomes unavailable or schema changes, not just because no new issue has been published

## Runbooks

### Upstream timeout

1. retry from CI once
2. if retry succeeds, log as transient
3. if retry fails, hold the last artifact, mark degraded, and alert

### Schema drift

1. freeze deployment of refreshed artifacts
2. attach the unexpected payload fragment to evidence output
3. update the adapter only after reviewing the source change

### Stale data

1. verify the source has not intentionally paused publication
2. keep existing artifact live
3. surface stale warning in the UI and status page

### Deployment regression

1. inspect build logs
2. roll back to the last green deployment if needed
3. keep monitoring alerts active until smoke checks recover
