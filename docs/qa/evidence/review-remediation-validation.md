# Review Remediation Validation

Date: 2026-03-08

## Findings addressed

1. refresh workflow now publishes validated generated artifacts to `main`
2. freshness is evaluated from source periods, not BCO reprocessing timestamps
3. sync fails on partial WMCA ward coverage loss
4. map workspace tolerates single-layer load failure
5. live smoke checks fail on degraded health
6. Discord alerts include failure class, summary, remediation, and run URL
7. compare overlay legend shows a quantitative bubble scale
8. Playwright smoke test matches the current site branding and layout

## Local validation

Passed:
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run test:e2e`
- `npm run build`
- `npm run data:sync`

Expected failing operational checks after the freshness fix:
- `npm run monitor:upstreams`
- `SITE_URL=http://127.0.0.1:3001 npm run monitor:site`

Reason:
- `uc-in-work-rate` latest source period `2025-12` exceeds the 60 day monthly threshold
- `fuel-poverty-rate` latest source period `2023` exceeds the 450 day annual threshold
- `gva-all-industries` latest source period `2023` exceeds the 450 day annual threshold

## Interpretation

These failures reflect the real current age of the shipped source datasets. They indicate an operational release risk, not a remaining code defect in the remediation work.
