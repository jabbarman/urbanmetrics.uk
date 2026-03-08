# Phased Implementation Plan

## Phase 1: Discovery and framing

Status: complete in this iteration

Deliverables:
- source verification
- v1 source shortlist
- geography choice
- deployment recommendation
- repository and operating-plan docs

Complexity: medium

## Phase 2: Foundation and scaffolding

Deliverables:
- Next.js TypeScript app scaffold
- design tokens and layout shell
- typed dataset registry
- ingestion scripts for the selected v1 layers
- generated data artifacts committed to `data/generated`
- health/status endpoints

Complexity: medium

## Phase 3: Map and dashboard MVP

Deliverables:
- interactive map with layer panel
- opacity and compare controls
- clickable area summary panel
- supporting cards/charts
- source metadata and freshness UI
- graceful degradation states

Complexity: high

## Phase 4: Automated checks and operations

Deliverables:
- CI for lint, typecheck, tests, and build
- scheduled upstream checks
- stale-data and schema-drift checks
- live-site smoke tests
- alerting via webhook-driven notifications
- operational docs and runbooks

Complexity: medium

## Phase 5: Publish and harden

Deliverables:
- deployment configuration
- production environment examples
- status page verification
- release checklist
- AI-agent extension docs and templates

Complexity: medium

## Phase sequencing notes

- do not add a geospatial database in v1 unless the file-based artifact approach proves insufficient
- do not add live TfWM overlays before the static/derived map experience is stable
- prefer one strong compare mode over multiple half-finished map modes
