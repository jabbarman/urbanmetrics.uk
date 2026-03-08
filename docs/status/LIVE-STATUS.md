# Live Status

## Current stage

`Phase 4: release hardening and live validation`

## Completed

- discovery, architecture, and operational docs
- Next.js TypeScript map application scaffold
- generated WMCA ward overlay pipeline
- interactive primary/compare map workspace
- status page and `/api/health` endpoint
- CI, upstream monitoring, refresh automation, and live smoke checks
- review-remediation fixes for refresh publication, freshness logic, coverage validation, graceful layer degradation, actionable alerts, legend clarity, and end-to-end smoke coverage

## In progress

- pushing the remediation batch to production
- validating the Vercel deployment on `urbanmetrics.uk`
- deciding first-release readiness with the corrected health gate

## Known operational signal

Under the corrected source-period freshness logic, three shipped layers are currently stale from the source itself:
- Universal Credit claimants in employment
- households in fuel poverty
- gross value added

That is an upstream data-age issue, not a remaining implementation defect.

## Next step

Deploy the remediation batch to production, validate `/status` and `/api/health`, and only cut the first release if the live release gate is acceptable.
