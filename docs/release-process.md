# Release Process

## Pre-release

1. run lint, typecheck, unit tests, build, and smoke coverage
2. run data refresh and upstream validation
3. inspect generated artifacts and status output
4. update docs if source or operations changed

## Deploy

1. merge to the deployment branch
2. confirm hosting environment variables are present
3. wait for deployment success
4. run live smoke checks against the deployed URL

## Post-release checks

1. confirm `/status` is healthy
2. confirm at least one map layer renders
3. confirm alerting channel is still receiving workflow failures
4. record validation evidence under `docs/qa/evidence/`
