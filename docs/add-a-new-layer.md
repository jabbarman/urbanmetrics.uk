# Add A New Layer

## Goal

Add a new layer without weakening source transparency, tests, or operational checks.

## Required workflow

1. document the source in `docs/data-sources.md`
2. add or update an adapter under `src/server/datasets`
3. define schema validation for the source payload
4. normalize to the internal layer contract
5. add user-facing metadata, legend logic, and caveats
6. add or update tests and fixtures
7. add freshness and schema checks to monitoring config
8. update docs if the layer changes deployment or operational assumptions

## Minimum layer contract

A layer is not complete unless it includes:
- source name
- source URL
- update cadence or freshness rule
- geography level and geography vintage
- units and legend label
- caveats
- fallback behaviour when unavailable

## Adapter checklist

- input endpoint documented
- auth requirements documented
- rate limits documented
- fixture payload committed
- schema validation present
- generated artifact shape tested
- degraded mode tested

## Geography rule

Do not imply direct comparability across incompatible geographies.

If the new layer uses a different geography than the current compare layer:
- show the geography label prominently
- disable misleading compare modes, or
- display an explicit warning in the metadata panel
