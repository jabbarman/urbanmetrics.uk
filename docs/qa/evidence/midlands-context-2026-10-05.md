# Midlands Context validation evidence

Date: 2026-10-05

## Delivered scope

- `/midlands-context` is a separate workspace for the approved East Midlands + West Midlands scope at LSOA 2021 geography.
- It publishes official IMD 2025 and 2024 fuel-poverty layers using schema-2 value artifacts joined to the shared ONS generalised LSOA reference geography.
- The generated reference contains 6,421 scoped LSOAs. Each generated layer contains 6,421 code-keyed values; duplicate, missing, malformed, and out-of-scope rows block publication.
- Existing Regional Context and Health Access routes remain separate and retain their original compare groups.

## Checks run

- `npm run data:sync`: passed; generated nine catalog layers, including the two Midlands artifacts and their shared reference geography.
- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm test`: passed: 12 files, 35 tests.
- `npm run build`: passed; `/midlands-context` is included in the static route build.
- `SITE_URL=http://127.0.0.1:3001 npm run test:e2e`: passed against the production build; verified overview, Midlands Context, Regional Context, and Health Access journeys.
- `git diff --check`: passed.

## Operational note

Fuel-poverty source data describes 2024 conditions despite its 2026 publication. Its stale state is deliberately visible under the 450-day source-period policy; the layer remains published as modelled structural context with its caveat, rather than being represented as a current signal.
