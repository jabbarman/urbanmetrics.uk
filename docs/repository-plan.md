# Repository Plan

## Proposed structure

```text
.
├── .github/
│   └── workflows/
├── data/
│   ├── fixtures/
│   ├── generated/
│   └── source-cache/
├── docs/
│   ├── phase-gates/
│   ├── qa/
│   └── status/
├── public/
├── scripts/
├── src/
│   ├── app/
│   ├── components/
│   ├── content/
│   ├── features/
│   │   ├── dashboard/
│   │   ├── layers/
│   │   ├── map/
│   │   └── status/
│   ├── server/
│   │   ├── datasets/
│   │   ├── health/
│   │   ├── normalization/
│   │   └── validation/
│   └── styles/
└── tests/
    ├── e2e/
    └── unit/
```

## Why this shape

- `src/app` keeps framework routing isolated from business logic
- `src/features` keeps product surfaces modular and easy for future AI sessions to extend
- `src/server` separates data contracts and monitoring logic from presentation code
- `data/generated` makes the deployed site deterministic and cheap to serve
- `scripts` makes scheduled jobs reproducible locally and in CI
- `docs/status` and `docs/phase-gates` preserve delivery state for future Codex sessions

## AI-agent documentation structure

- `AGENTS.md`: root operating rules
- `docs/add-a-new-layer.md`: layer onboarding workflow and checklist
- `docs/data-sources.md`: source registry and operational assumptions
- `docs/architecture.md`: integration boundaries and extension rules
- `docs/release-process.md`: validation and deploy flow
- `docs/monitoring.md`: checks, thresholds, and remediation notes
