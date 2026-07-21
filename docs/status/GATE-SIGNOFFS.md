# Gate Sign-offs

## Discovery Gate

Status: prepared

Evidence:
- `docs/discovery-report.md`
- `docs/implementation-plan.md`
- `docs/architecture.md`
- `docs/data-sources.md`
- `docs/deployment.md`
- `docs/monitoring.md`

## Foundation Gate

Status: satisfied

Evidence:
- `docs/qa/evidence/phase-2-validation.md`
- `src/app/`
- `src/server/datasets/`
- `scripts/sync-data.ts`
- `.github/workflows/ci.yml`
- remote repository: `git@github.com:jabbarman/urbanmetrics.uk.git`

## Review Remediation Gate

Status: technically validated; explicit gate approval remains outstanding

Evidence:
- `docs/qa/evidence/review-remediation-validation.md`
- `docs/qa/evidence/source-refresh-2026-07-21.md`
- `.github/workflows/refresh-data.yml`
- `.github/workflows/monitor-upstreams.yml`
- `scripts/sync-data.ts`
- `scripts/check-upstreams.ts`
- `scripts/check-site.ts`
- `src/features/map/map-explorer.tsx`
- `src/features/map/legend.tsx`
- `tests/e2e/smoke.spec.ts`

Notes:
- local validation passes for lint, typecheck, unit tests, build, and Playwright smoke coverage
- operational monitors now fail correctly when source freshness is genuinely degraded
- July 2026 source-refresh deployment and browser journeys are live-validated; the degraded ward-source state remains explicit and is not treated as a passing monitor
- no gate-pass claim is made without explicit approval evidence
