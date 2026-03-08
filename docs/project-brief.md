# West Midlands Economic Indicator Website — Codex Delivery Brief

## 1) Mission

Build a modern public website focused on **economic indicators for Birmingham and the West Midlands**, with the ability to **overlay multiple geospatial and transport layers** so users can quickly spot potentially meaningful overlaps.

The first release should make it easy to compare, for example:

* economic indicators by area
* deprivation / employment / population / housing signals
* bus and public transport layers
* congestion or service-performance style layers where available
* future map overlays and dashboard modules added later with minimal manual intervention

This project should be designed from the outset as an **AI-first, continuously extensible platform**. The expectation is that future work will often begin with a prompt such as:

> “Add a new map showing X and a dashboard showing Y, sourced from Z API, and deploy it safely.”

The codebase, documentation, automation, and deployment setup should therefore support a workflow in which Codex can research, plan, implement, test, review, and publish future changes with very little human intervention.

---

## 2) Product Intent

This is not just a static dashboard. It should become a **regional intelligence site** that combines:

* clean modern mapping
* trustworthy public data
* transparent source attribution
* easy comparison between layers
* extensible dashboard widgets
* automated service monitoring and change detection

Primary audience:

* curious members of the public
* policy / civic / local-interest users
* researchers and journalists
* developers and technologists
* the site owner, who may use it as a platform for ongoing AI-assisted development

The user experience should prioritise:

* immediate visual clarity
* fast map interaction
* obvious layer toggling
* clear legends and metadata
* confidence in source freshness
* graceful handling of missing or degraded data feeds

---

## 3) Core Outcomes

Codex should plan and deliver a system that can:

1. Show a **base map of Birmingham and the West Midlands**.
2. Load and display **economic indicator layers** by area.
3. Overlay additional datasets such as **public transport** and other spatial layers.
4. Let a user easily toggle layers, opacity, legends, and area boundaries.
5. Surface **interesting overlaps** visually, not just numerically.
6. Provide supporting charts / cards / summary panels beside the map.
7. Record data source status and freshness.
8. Automatically detect broken APIs, stale feeds, schema drift, and ingestion failures.
9. Notify the owner when data services degrade or break.
10. Support safe future expansion by AI agents operating within explicit project rules.

---

## 4) Suggested Initial Data Sources

Start with a pragmatic first wave of public data sources that are already known to be relevant:

### Local / regional

* **Birmingham City Observatory API** for Birmingham-focused civic and statistical datasets.
* **Transport for West Midlands API** for regional transport data including real-time vehicle and service information where usable.

### National but geographically filterable

* **Police UK API** for location-based crime and outcome data.
* **ONS / NOMIS-style regional statistics** for labour market and demographic data where suitable.
* **Ordnance Survey APIs / mapping products** for geospatial reference and address / boundary support where needed.

Codex should verify each source before implementation and decide which of the following should be used in v1 versus later phases:

* unemployment / claimant or employment indicators
* deprivation-related indicators
* housing or affordability indicators
* population and age structure
* crime / safety context layers
* bus stop / route / real-time service / performance style layers
* administrative boundaries
* ward / MSOA / LSOA / local authority overlays

### Important implementation note

Do not overfit the first release to every available dataset. Prefer a strong v1 with a few good layers over a broad but brittle first build.

---

## 5) Product Requirements

### v1 map experience

The initial release should include:

* a responsive full-page interactive map
* a collapsible layer control panel
* area search / zoom to place
* base map switching if useful
* at least 2–4 meaningful economic or civic indicator overlays
* at least 1 transport-related overlay
* legends, units, source, update date, and explanatory metadata
* the ability to compare at least two layers simultaneously
* opacity controls for overlays
* a side panel with area summary statistics when a region is clicked

### v1 dashboard experience

Alongside or below the map, include:

* headline summary cards
* time-series or comparison charts where data supports it
* area ranking or comparison views
* a clear note when data is incomplete, stale, or not directly comparable

### v1 trust / transparency features

Each dataset shown on the site should expose:

* source name
* source link or provenance reference in documentation
* last successful fetch time
* last published / source update time where available
* geography level
* licence / usage notes where applicable
* caveats on interpretation

---

## 6) Design Direction

The design should be **modern, restrained, data-forward, and credible**.

Desired feel:

* contemporary civic-tech rather than corporate dashboard clutter
* highly legible typography
* generous spacing
* calm visual hierarchy
* clear colour usage for maps and data states
* accessible contrast and keyboard support
* excellent mobile and tablet behaviour, though desktop can be the primary analytical view

Avoid:

* noisy enterprise-dashboard aesthetics
* cramped sidebars
* unexplained heatmaps
* too many metrics at once
* flashy animation that impairs analysis

Codex should choose the stack that best supports this. A likely strong choice would be:

* **Next.js / React / TypeScript** for app framework
* **MapLibre GL JS** or equivalent modern open mapping stack
* **Tailwind CSS** for fast, maintainable styling
* **PostgreSQL + PostGIS** if persistent geospatial storage is needed
* server-side scheduled ingestion jobs and health checks

Alternative choices are acceptable if they are better justified for this project.

---

## 7) Architecture Expectations

Codex should plan the system as a small but serious production platform with distinct concerns:

### Frontend

* map UI
* dashboards / charts
* layer controls
* source metadata display
* graceful degradation if a layer is temporarily unavailable

### Backend / data layer

* dataset adapters / connectors per external API
* normalization pipeline
* caching and persistence
* derived tiles or simplified geometries if required for performance
* internal API for the frontend

### Monitoring / operations

* health checks for each external data source
* scheduled validation of schemas and key fields
* freshness checks
* alerting
* runbooks / docs for likely failures

### AI-first project structure

The repo should make it easy for Codex to add new sources safely. That likely means:

* `AGENTS.md` at repo root
* subordinate docs for architecture, data-source onboarding, deployment, testing, and release rules
* a consistent dataset adapter interface
* explicit contribution / review rules for AI agents
* templates for adding a new layer or chart

---

## 8) Non-Functional Requirements

The system should aim for:

* fast initial render
* responsive map performance on ordinary consumer hardware
* clear caching strategy
* robust handling of upstream API failure
* explicit rate-limit awareness
* good observability
* accessibility baseline (keyboard access, semantic markup, contrast, readable legends)
* maintainable code that another AI session can extend reliably

---

## 9) Automated Review, Monitoring, and Alerting

A core requirement is that broken data services or regressions should be **flagged automatically**.

Codex should implement an operational setup that includes:

### Regular automated checks

* scheduled smoke tests against the live site
* scheduled checks against each upstream API
* stale-data detection
* response-shape / schema validation for known payloads
* checks for map tile / overlay availability
* broken deployment detection

### Alerting

Alerts should be sent to the owner by a low-friction route such as:

* email
* Slack
* Discord
* or another practical notification channel

The implementation should keep monthly costs under control.

### Suggested mechanisms

Codex should evaluate and, if suitable, combine:

* GitHub Actions scheduled workflows
* application health endpoints
* uptime monitoring
* lightweight error tracking / logs
* provider-native cron or scheduled jobs

The system should distinguish between:

* temporary upstream timeout
* authentication / key expiry
* schema drift
* hard API removal
* internal deployment bug

And it should produce actionable messages rather than vague “something failed”.

---

## 10) Testing Expectations

Codex should plan and implement a testing strategy covering:

### Frontend

* component tests where worthwhile
* map / layer interaction tests where feasible
* end-to-end smoke tests for key user journeys

### Backend / data ingestion

* adapter tests against fixture payloads
* schema validation tests
* transformation tests
* fallback / retry behaviour tests

### Operational tests

* monitoring test route / synthetic failure mode
* release smoke tests post-deploy

The final repo should make it easy to run:

* local development
* full test suite
* lint / typecheck
* review / release checks

---

## 11) Delivery Workflow Codex Should Follow

Codex should not jump straight into coding. It should work in a disciplined sequence:

### Phase 1 — Research and framing

* inspect candidate APIs and licences
* identify stable geographies and map boundaries
* compare technical stack options
* propose v1 scope with trade-offs

### Phase 2 — Plan

* produce an implementation plan
* define architecture
* define data model and adapter pattern
* define monitoring strategy
* define deployment options and cost model

### Phase 3 — Build

* scaffold project
* implement data ingestion and normalization
* implement map UI and first overlays
* implement charts / summaries
* implement monitoring and alerting

### Phase 4 — Test and review

* run lint / typecheck / tests
* review code quality
* review UX and accessibility
* review operational resilience

### Phase 5 — Publish

* deploy to the selected platform
* configure domain and environment variables
* configure alerting and recurring checks
* document ongoing operations

### Phase 6 — AI-first hardening

* create repo rules and docs so future Codex sessions can safely extend the platform
* create templates and instructions for adding new layers / dashboards
* ensure future changes can be researched, implemented, tested, reviewed, and published by AI with minimal owner involvement

---

## 12) Deployment Evaluation Requirement

Codex should explicitly evaluate where this site should be deployed.

Budget target:

* approximately **£20–£40 per month** total hosting budget for v1

The recommendation should consider:

* suitability for a modern map-heavy web app
* support for scheduled jobs / background tasks
* simple environment management
* cost predictability
* log access / observability
* low operational overhead
* ease of AI-assisted deployment and maintenance

Codex should compare realistic options and recommend one primary deployment path plus one fallback.

Likely candidates to evaluate include:

* **Vercel**
* **Cloudflare**
* **Railway**
* **Fly.io**
* or another better-justified option

The output should include:

* estimated monthly cost bands
* trade-offs
* recommended hosting architecture
* recommendation for where cron / monitoring should live

---

## 13) Domain Name Suggestion Requirement

Codex should suggest domain names that fit the concept.

The brand should feel:

* regional
* credible
* modern
* analytical
* not too narrow if future dashboards expand beyond Birmingham alone

Possible naming directions to explore:

* West Midlands observatory style naming
* economic atlas / regional lens / metro signals style naming
* neutral civic-tech style naming

Codex should suggest a shortlist of names and indicate which are strongest conceptually. If live availability cannot be verified from inside the development environment, it should say so clearly rather than guessing.

---

## 14) Suggested v1 Functional Scope

A good v1 would likely include:

* interactive map for Birmingham + West Midlands region
* one economic choropleth layer
* one deprivation / social-context layer
* one transport overlay
* click-on-area summary panel
* small dashboard with key charts
* source metadata panel
* health / freshness status page
* basic alerting for broken sources

That is enough to create a useful and credible first release without overbuilding.

---

## 15) Stretch Goals

If time and complexity allow, Codex may consider:

* temporal slider for indicators with time series
* side-by-side comparison mode
* “interesting overlap” annotation cards generated from simple heuristics
* exportable screenshots / share links
* lightweight CMS or config-driven source registry
* automated changelog for data-source drift

These are secondary to a robust first release.

---

## 16) Required Repository Outputs

Codex should produce a repo that includes, at minimum:

* application source code
* deployment config
* environment variable examples
* tests
* monitoring / alerting setup
* architecture documentation
* `README.md`
* `AGENTS.md`
* supporting docs for future AI-driven development

Suggested supporting docs:

* `docs/architecture.md`
* `docs/data-sources.md`
* `docs/add-a-new-layer.md`
* `docs/deployment.md`
* `docs/monitoring.md`
* `docs/release-process.md`
* `docs/domain-and-branding.md`

---

## 17) Explicit Instructions to Codex

Use the brief above to:

1. research the best-fit stack and data-source combination for v1;
2. propose a concrete implementation plan;
3. implement the project in a production-minded way;
4. test and review it thoroughly;
5. publish it to a sensible hosting platform within the target budget;
6. configure automated monitoring and alerting;
7. create AI-friendly repo documentation so future development can be done largely through Codex prompts.

When forced to choose, prefer:

* simplicity over unnecessary complexity
* robustness over novelty
* data clarity over visual flourish
* extensibility over one-off hacks

Be explicit about assumptions, trade-offs, costs, and unknowns.

---

## 18) Working Assumptions

Assume:

* the owner is comfortable with Git, local development, and AI-assisted workflows
* future work will often be requested through Codex rather than manual coding
* the system should be easy to evolve into additional dashboards and overlays
* a modest but real production standard is required even for v1

---

## 19) First Concrete Task for Codex

Before writing production code, produce the following:

1. **A short discovery report**

   * recommended v1 scope
   * recommended stack
   * recommended data sources
   * top risks
   * recommended deployment choice

2. **A phased implementation plan**

   * milestones
   * deliverables
   * estimated complexity

3. **A repository plan**

   * directory structure
   * AI-agent documentation structure
   * deployment and monitoring approach

Then proceed into implementation.

