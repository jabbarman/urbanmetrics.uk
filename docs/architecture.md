# Architecture

## Summary

The v1 system is a `map-first Next.js application` backed by `generated geospatial artifacts` and `typed source adapters`.

The core architectural decision is to avoid introducing a persistent geospatial database in v1. Instead, scheduled ingestion scripts fetch selected public datasets, normalize them into checked JSON/GeoJSON artifacts, and the frontend consumes those artifacts through local server helpers and status endpoints.

This keeps runtime cost low, simplifies deployment, and still leaves a clean migration path to `PostgreSQL + PostGIS` if later layers require heavier joins, user-generated filters, or much larger feature collections.

## Runtime components

### Frontend

Responsibilities:
- render the map, layer controls, legends, charts, and summary panels
- expose source metadata, freshness, licence notes, and caveats
- show degraded or unavailable layer states clearly

### Data services inside the app

Responsibilities:
- load generated artifacts
- serve health and status payloads
- centralize layer metadata and schema expectations
- prevent UI code from depending directly on raw upstream payloads

### Ingestion and normalization

Responsibilities:
- fetch source records from external APIs
- validate expected fields with `Zod`
- normalize source-specific shapes into a common internal layer model
- emit generated artifacts plus source health metadata

### Monitoring and operations

Responsibilities:
- verify upstream availability
- verify freshness windows and required fields
- smoke test the deployed site and health endpoints
- notify the owner with actionable failure details

## Internal contracts

### Layer registry

Each layer must declare:
- stable id
- title and short description
- source metadata
- geography level and vintage
- units and legend strategy
- freshness policy
- adapter implementation
- fallback behaviour

### Generated artifact contract

Each normalized layer writes:
- `layer.json` with metadata, summary stats, and freshness info
- `layer.geojson` or equivalent geometry-bearing artifact when mapped features are required
- `health.json` with last fetch time, source update time, and validation outcome

## Chosen v1 data path

1. fetch selected Birmingham City Observatory datasets
2. validate required fields per dataset
3. map them into a shared `AreaLayerFeature` model
4. emit generated ward or MSOA artifacts
5. render through a common MapLibre layer renderer

## Future database trigger

Introduce `PostGIS` only if one or more of these become true:
- the app needs dynamic spatial joins or user-defined filters
- artifact sizes become too large for cheap static delivery
- live transport overlays require temporal persistence or derived spatial indexes
- multiple upstreams need cross-source entity resolution at runtime
