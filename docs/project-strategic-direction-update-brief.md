# Urban Metrics — Strategic Direction Update for Codex

## Purpose of this Document

This brief updates the original Urban Metrics project direction after the first production release. The initial platform architecture, monitoring, and AI‑extensible repository structure are now in place. The next stage of development should focus on **content depth, analytical value, and a refined user experience**.

The core insight guiding this update is:

Urban Metrics should evolve into a **regional intelligence platform**, not a transport dashboard.

Transport layers such as real‑time bus data (e.g., TfWM feeds) are therefore **optional and secondary**, while **health, workforce, deprivation, and accessibility insights** are significantly more valuable.

The project should emphasise **clear spatial insights** rather than overwhelming users with complex dashboards.

---

# Core Vision

Urban Metrics should become a **modern regional observatory for the West Midlands**.

It should allow users to explore how economic conditions, public services, and social pressures interact geographically.

The platform should prioritise:

• elegant spatial visualisation
• carefully chosen datasets
• transparent data provenance
• meaningful comparisons between layers
• clear storytelling through maps

The experience should feel **calm, trustworthy, and analytical** rather than busy or cluttered.

---

# Key Product Principle

Urban Metrics should **avoid becoming a typical "data dashboard"**.

Instead the design should emphasise:

• one primary interactive map
• a small number of carefully selected overlays
• contextual summaries and comparisons
• progressive disclosure of detail

Experienced users should be able to explore deeper insights, but new users should be able to understand the platform within seconds.

---

# Strategic Data Focus

The most valuable layers are those that explain **structural pressures affecting communities**.

Priority domains should be:

## 1. Health and Mental Health

Examples of layers:

• mental health workforce density
• psychologists per population
• therapists per population
• mental health nurses per population
• access to mental health services
• waiting list pressure indicators

Relevant data sources may include:

• NHS Workforce Statistics
• Psychological Professions Workforce Census
• NHS mental health workforce dashboards
• NHS Talking Therapies datasets

These may require ingestion from CSV or structured downloads rather than APIs.

---

## 2. Economic Conditions

Examples:

• employment indicators
• Universal Credit claimants
• local productivity indicators
• economic inactivity

---

## 3. Social Pressure Indicators

Examples:

• deprivation
• fuel poverty
• housing affordability
• population change

---

## 4. Accessibility to Services

Instead of real‑time transport feeds, focus on:

• travel time to hospitals
• travel time to employment centres
• public transport accessibility
• car ownership vs deprivation

These layers help explain **structural disadvantage**.

---

# Signature Feature: Regional Pressure Map

Urban Metrics should introduce a distinctive feature called the **Regional Pressure Map**.

This feature will combine multiple indicators into a visual representation of where communities face the greatest structural pressure.

Example conceptual inputs:

• deprivation
• unemployment
• health demand
• mental health workforce availability
• accessibility to services

The goal is not to produce a simplistic ranking but to provide **an intuitive visual indicator of overlapping pressures**.

The methodology should be transparent and documented.

Users should be able to explore how the pressure score changes when individual components are enabled or disabled.

---

# Transport Data Position

Real‑time TfWM transport data should **not be treated as a core requirement**.

If transport data is added, it should be used for **accessibility modelling or structural transport disadvantage**, not live vehicle tracking.

Possible future transport layers include:

• public transport accessibility index
• commuting patterns
• travel time modelling

These are optional enhancements rather than priorities.

---

# User Experience Principles

The user interface should remain **elegant and focused**.

The design should avoid clutter and excessive dashboard panels.

Desired experience:

• a large primary map
• intuitive layer controls
• subtle contextual insights
• clear legends
• readable typography

When an area is selected, the UI should present:

• a concise area summary
• relevant indicators
• contextual comparisons

Advanced analytical tools should exist but should remain **secondary to the main map interaction**.

---

# Development Phases

To maintain clarity and momentum, the next stage should be implemented in phases.

---

# Phase 1 — Health and Workforce Expansion

Goal: introduce health and workforce insights to Urban Metrics.

Tasks:

1. Implement ingestion pipelines for:

• NHS Workforce Statistics
• Psychological Professions Workforce Census

2. Create new map layers including:

• psychologists per population
• therapists per population
• mental health workforce density

3. Add documentation for each dataset including:

• source
• update frequency
• caveats

4. Ensure monitoring covers:

• dataset freshness
• schema changes

Outcome:

Urban Metrics becomes capable of showing **health workforce capacity across the region**.

---

# Phase 2 — Accessibility and Service Context

Goal: provide context explaining how easily residents can access services.

Tasks:

1. Implement accessibility indicators such as:

• travel time to hospitals
• travel time to employment centres
• transport accessibility proxies

2. Integrate these as optional map overlays.

3. Ensure clear explanations of methodology.

Outcome:

Users can explore the relationship between **service access and community outcomes**.

---

# Phase 3 — Regional Pressure Map

Goal: introduce Urban Metrics' signature analytical feature.

Tasks:

1. Design a transparent methodology combining selected indicators.

2. Create a composite "Regional Pressure" score.

3. Implement an interactive layer showing pressure intensity.

4. Allow users to adjust or inspect contributing indicators.

Outcome:

Urban Metrics gains a distinctive analytical capability.

---

# Monitoring and Data Integrity

Existing monitoring infrastructure should remain in place and expanded as new sources are added.

Each new dataset must include:

• freshness rules
• schema validation
• monitoring integration

Alerts should continue to notify the owner when datasets become stale or fail to update.

---

# AI‑First Development Model

The project should remain designed for **AI‑assisted development**.

Codex should:

• follow the AGENTS.md rules
• implement new layers through the adapter pattern
• update documentation when changes are made
• run tests and monitoring checks before deployment

Future prompts to Codex may request new layers or indicators, and the repository should remain structured to support this workflow.

---

# Immediate Task for Codex

Codex should:

1. Review this updated strategic brief.
2. Evaluate the existing repository and identify required architectural adjustments.
3. Produce an implementation plan for Phase 1.
4. Begin implementing the health and workforce data layers.

---

# Desired Outcome

Urban Metrics should evolve from a promising prototype into a **clear, insightful regional intelligence platform**.

The platform should remain:

• elegant
• credible
• analytically useful
• extensible through AI‑assisted development.

