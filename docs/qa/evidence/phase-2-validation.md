# Phase 2 Validation Evidence

Date: 2026-03-07

## Commands run

- `npm run data:sync`
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run monitor:upstreams`
- `SITE_URL=http://127.0.0.1:3001 npm run monitor:site`

## Outcomes

- data sync: passed, generated 5 normalized WMCA ward layers
- typecheck: passed
- lint: passed
- unit tests: passed
- production build: passed
- upstream monitor: passed against 5 active Birmingham City Observatory datasets
- local site smoke: passed against homepage, status page, and health endpoint

## Manual runtime walkthrough

Verified locally in a browser session:
- homepage loaded with hero, map workspace, controls, and source status cards
- clicking the map updated the area summary panel with cross-layer values
- `/status` rendered operational health per layer
- `/api/health` returned machine-readable JSON with overall status and layer details

## Known limitations at this point

- transport overlay is a census-based travel-behaviour signal, not a live TfWM public-transport feed yet
- publication to a real host was not performed because no repository remote or deployment credentials are available in this workspace
