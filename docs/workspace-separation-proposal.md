# Workspace Separation Proposal

## Purpose

This document proposes a concrete information-architecture change for the live Urban Metrics UK product.

The goal is to separate the original regional context overlays from the newer Talking Therapies and future health/service overlays, while preserving one codebase, one generated-data architecture, and one operational status surface.

If approved, this document should become the basis for implementation work.

## Problem statement

The current live homepage combines two different product modes in one map workspace:

- `Regional context` overlays at `WMCA ward` geography
- `Health and service` overlays at `Sub Integrated Care Board` geography

Even with compare-group protections in place, users still encounter:

- a sudden shift in geography
- a sudden shift in policy domain
- different interpretation and caveat patterns
- a mixed layer selector that asks them to hold multiple mental models at once

User feedback indicates that the current single-workspace structure is no longer the clearest way to present the product.

## Decision

Adopt a two-workspace information architecture inside the existing Urban Metrics UK product:

- `Regional Context`
- `Health Access`

This should be implemented as distinct routes, with the homepage becoming a true landing/index page rather than the only map workspace.

## Proposed route structure

### `/`

Purpose:

- explain the observatory at a high level
- help users choose the right workspace
- link to service status

This page should no longer host the full mixed map workspace.

### `/regional-context`

Purpose:

- provide the original Urban Metrics experience
- focus on labour, deprivation, economic, and civic context layers
- keep the mental model centered on West Midlands local-area context

Expected active layer set:

- Universal Credit claimants in employment
- IMD employment score
- households in fuel poverty
- gross value added
- travel to work by bicycle

Expected geography:

- `WMCA ward`

### `/health-access`

Purpose:

- provide the Talking Therapies and future health/service-access experience
- focus on service access, waits, and supporting health context
- allow future expansion to MHSDS and related health/service layers without disturbing the original workspace

Expected active layer set for the first version:

- Talking Therapies Mean Wait
- Talking Therapies Access Within 6 Weeks

Expected geography:

- `Sub Integrated Care Board`

Expected supporting context:

- Midlands annual therapy-type context panel

### `/status`

Purpose:

- remain the single operational status surface for the full product

This route should stay global rather than being split per workspace.

## User-facing naming

Recommended labels:

- `Urban Metrics UK` as the product brand
- `Regional Context` as the first workspace
- `Health Access` as the second workspace
- `Service Status` for operational status navigation

Avoid:

- `old layers`
- `new layers`
- temporary names that encode chronology rather than user task

These route/workspace names are better because they describe what the user is trying to understand, not when the layer was added.

## Homepage proposal

The homepage should become a calm entry point with three jobs:

1. explain the overall observatory
2. direct users into the right workspace
3. expose status without requiring entry into a map

### Proposed homepage content

- brand and short observatory description
- two workspace cards
- one status card or status link
- supporting highlights about transparency, generated artifacts, and source metadata

### Proposed workspace cards

#### Regional Context

Suggested framing:

`Economic, deprivation, and civic context across the West Midlands at ward geography.`

Suggested CTA:

`Open Regional Context`

#### Health Access

Suggested framing:

`Talking Therapies and future health/service indicators, currently presented at Sub Integrated Care Board geography.`

Suggested CTA:

`Open Health Access`

## Workspace-level behavior

## Regional Context workspace

Should show:

- only regional context layers
- ward-based geography language
- no Talking Therapies companion context
- defaults and summary cards tuned to economic/civic interpretation

Should not show:

- health/service overlays
- therapy-type context panels

## Health Access workspace

Should show:

- only Talking Therapies and future health/service layers
- SubICB geography language
- the annual therapy-type companion panel where relevant
- defaults and summary cards tuned to service access interpretation

Should not show:

- the original economic/civic layers in the selectors

## Shared vs workspace-specific surfaces

### Shared

These should remain shared where possible:

- generated-data loading
- status loading
- base map renderer
- legend component
- ranking component
- area inspector shell
- monitoring and refresh automation

### Workspace-specific

These should become workspace-aware:

- route-level page copy
- visible layer catalog
- default primary layer
- default compare layer
- metric card wording where it depends on workspace meaning
- supporting panels such as the Talking Therapies therapy-type context

## Proposed technical design

The separation should happen at the presentation and workspace-configuration layer, not by splitting the dataset architecture.

### 1. Introduce a workspace registry

Add a small configuration module that declares:

- workspace id
- route path
- title
- description
- allowed layer ids
- default primary layer id
- default compare layer id
- workspace-specific intro copy
- whether supporting panels such as Talking Therapies context should be enabled

This registry should become the source of truth for route behavior.

### 2. Add route-level pages

Expected new pages:

- `src/app/regional-context/page.tsx`
- `src/app/health-access/page.tsx`

### 3. Refactor the current homepage

Current homepage behavior:

- loads the full catalog
- loads status
- renders the mixed map workspace directly

Proposed homepage behavior:

- loads only what is needed for the landing/index experience
- does not render the shared map workspace directly

### 4. Make the map shell workspace-aware

The shared map workspace component should accept:

- a filtered catalog
- route-specific defaults
- workspace-specific framing

This avoids duplicating the map UI while still producing clearly separate experiences.

### 5. Keep status global

The generated status contract and health endpoint do not need to split at this stage.

The workspaces may later show filtered summaries, but:

- `/status` should remain global
- the monitoring model should remain product-wide

## Layer allocation

### Regional Context

- `uc-in-work-rate`
- `imd-employment-score`
- `fuel-poverty-rate`
- `gva-all-industries`
- `travel-to-work-bicycle-rate`

### Health Access

- `nhs-talking-therapies-wait-time`
- `nhs-talking-therapies-six-week-access`

Future likely additions:

- MHSDS service-pressure layer(s)
- additional health/service-access layers that share the health workspace mental model

## Implementation phases

### Phase A: workspace split foundation

Deliver:

- workspace registry
- `/regional-context`
- `/health-access`
- homepage converted into an index page
- route-level filtering of visible layer catalogs
- route-specific default primary and compare layers

This is the minimum meaningful change that addresses user confusion.

### Phase B: navigation and copy polish

Deliver:

- top-level navigation between home, regional context, health access, and status
- refined route-level hero copy
- workspace-specific card and summary wording

### Phase C: health workspace extension

Deliver:

- next health/service layer(s), likely MHSDS
- additional workspace-specific supporting panels as justified

## Acceptance criteria

This change should be considered successful when all of the following are true:

- the homepage no longer presents a mixed map workspace
- users can choose a workspace before entering a map
- the Regional Context workspace exposes only regional context layers
- the Health Access workspace exposes only health/service layers
- geography changes are explicit and no longer surprising
- the health workspace feels intentional rather than appended
- the existing status route remains available and coherent

## Risks and constraints

### Risk: homepage feels too empty after removing the map

Mitigation:

- make the index page visually strong
- keep workspace cards prominent
- show status and explanatory content up front

### Risk: duplicated route-level UI logic

Mitigation:

- keep the map shell shared
- move route differences into a workspace registry rather than copied page logic

### Risk: workspace copy drifts from implementation

Mitigation:

- keep workspace definitions in one registry
- use route-aware props rather than hard-coded page strings where practical

### Risk: status messaging becomes inconsistent

Mitigation:

- keep `/status` global
- defer workspace-specific status filtering until after the route split is stable

## Explicit non-goals for the first implementation slice

The first implementation based on this proposal should not include:

- a repo split
- a separate deployment target
- a split operational health endpoint
- changes to the generated layer contract solely for navigation purposes
- a new brand identity beyond workspace naming

## Recommended first implementation slice

If this proposal is approved, the first code change should do only the following:

1. add a workspace registry
2. add `/regional-context`
3. add `/health-access`
4. convert `/` into an index page
5. wire each workspace route to its own filtered catalog and default layers

This is the smallest implementation that delivers the structural separation users are asking for.

## Decision record

Current status:

- proposal drafted
- no code changes for workspace separation made yet

Next step on approval:

- implement Phase A: workspace split foundation
