# Source Refresh Validation Evidence

Date: 2026-07-21

## Shipped source periods

- NHS Talking Therapies Mean Wait: `2026-05-31`
- NHS Talking Therapies Access Within 6 Weeks: `2026-05-31`
- Sub Integrated Care Board reference geography: April 2026, 106 England features
- West Midlands health workspace coverage: 11 Sub ICB locations, including Shropshire, Telford and Wrekin

## Commands and outcomes

- `npm run data:sync`: passed; generated 7 layers, refreshed both NHS layers, and preserved last successful artifacts for UC, fuel poverty, and GVA after explicit completeness failures
- `npm run lint`: passed
- `npm run typecheck`: passed when run after the production build; an earlier parallel invocation raced Next.js regeneration of `.next/types` and was superseded by the ordered pass
- `npm test`: passed, 8 files and 27 tests
- `npm run build`: passed; all overview, workspace, status, and health routes built successfully
- `SITE_URL=http://127.0.0.1:3001 npm run test:e2e`: passed; verified overview navigation, Regional Context controls, Health Access, and the May 2026 source period
- `SITE_URL=http://127.0.0.1:3001 npm run monitor:site`: expected failure because the global health endpoint remains `degraded` while UC is stale and its current BCO period fails completeness validation
- `npm run monitor:upstreams`: expected failure for UC, fuel poverty, and GVA because BCO has moved changed areas to May 2026 ward codes without the geometry required by the layer contract; both NHS layers now pass
- production artifact check at `https://urbanmetrics.uk/generated/layers/nhs-talking-therapies-wait-time.json`: passed with source period `2026-05-31`, geography vintage `Sub ICB 2026`, and 11 mapped features
- `SITE_URL=https://urbanmetrics.uk npm run test:e2e`: passed against the deployed overview and both workspace routes
- `SITE_URL=https://urbanmetrics.uk npm run monitor:site`: expected failure because production correctly retains the explicit global `degraded` status for the unresolved UC source condition

## Negative-path evidence

- unit coverage confirms latest NHS release discovery fails visibly if publisher markup changes
- sync retained complete production artifacts when each incompatible ward source failed validation
- generated status identifies the exact fallback reason per affected layer
- no newer fuel-poverty values were joined to incompatible older ward polygons

## Known limitations

- ONS May 2026 ward names and codes are available, but a matching generalised boundary service was not available during this refresh
- UC remains on the last complete February 2026 artifact
- fuel poverty remains on 2023 and GVA remains on 2023 until the WMCA ward geometry migration can be completed safely
- the global deployment smoke monitor will continue alerting while overall health is degraded; this is intentional operational visibility, not a hidden pass
