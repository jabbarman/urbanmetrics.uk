# AGENTS.md

## Purpose
This repository contains a public-facing West Midlands economic indicator and map overlay website. It is designed to be maintainable by both humans and AI agents. Agents must preserve clarity, robustness, and extensibility.

## Core product goals
- Show Birmingham and West Midlands economic/civic data on an interactive map.
- Allow multiple overlays and easy visual comparison.
- Surface trustworthy metadata: source, freshness, geography, caveats.
- Handle upstream data failures gracefully.
- Support future AI-led extension with minimal friction.

## Agent operating rules
1. Do not make major architectural changes without documenting the reason.
2. Prefer incremental, reviewable changes over broad rewrites.
3. Preserve clear separation between:
   - frontend presentation,
   - backend/data services,
   - ingestion/adapters,
   - monitoring/operations.
4. Any new data source must be added through the documented adapter pattern.
5. Any new layer must include:
   - source documentation,
   - update/freshness logic,
   - fallback/error handling,
   - tests where practical,
   - user-facing metadata.
6. Any operational change must update the relevant docs.
7. Never silently remove a monitoring or alerting mechanism.
8. Be explicit about assumptions and known limitations.

## Preferred workflow
1. Read:
   - README.md
   - docs/architecture.md
   - docs/data-sources.md
   - docs/deployment.md
   - docs/monitoring.md
   - docs/add-a-new-layer.md
2. Produce a short plan before non-trivial changes.
3. Implement in small steps.
4. Run lint, typecheck, tests, and any smoke checks.
5. Summarise what changed, risks, and follow-up work.

## Project principles
- Simplicity over cleverness.
- Observability over hidden failure.
- Data clarity over visual noise.
- Extensibility over one-off hacks.
- Cost awareness in infrastructure choices.

## Data-source onboarding rules
For each new source, document:
- source name,
- API/docs URL,
- auth requirements,
- rate limits,
- licence or usage constraints,
- expected freshness,
- schema assumptions,
- fallback behaviour,
- relevant geography level,
- test fixtures.

## Mapping rules
- Keep legends explicit.
- Avoid misleading comparisons across incompatible geographies.
- Label units and dates clearly.
- Do not present speculative correlations as facts.
- If a layer is stale or unavailable, show that clearly in UI.

## Deployment rules
- Keep deployment reproducible.
- Avoid manual hidden steps.
- Store operational knowledge in docs.
- Keep monthly cost within the intended budget unless explicitly revised.

## Monitoring rules
All critical upstreams and internal services should have:
- basic health checks,
- freshness checks where relevant,
- useful failure messages,
- documented escalation or remediation notes.

## Done criteria for substantial work
A substantial change is not done until:
- code is implemented,
- docs are updated,
- tests/checks pass or limitations are clearly stated,
- operational implications are considered,
- review notes are written.
