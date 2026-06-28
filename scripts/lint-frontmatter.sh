#!/usr/bin/env bash
# CI gardien for the Living Knowledge OS fiche contract (Brique 1d, ADR 0008
# clause 6 / fiche-contract spec §6). Validates every tracked .md under
# docs/resources/** + docs/knowledge/** against LEGAL_TRANSITIONS (as DATA):
# illegal lifecycle states, orphan terminal states (superseded w/o superseded_by),
# and unresolvable relations. Default tier = tier1 (legacy identity required,
# rich fields grandfathered); pass --strict for the full backbone contract.
# Mirrors scripts/lint-no-sdk-payg.sh.
set -euo pipefail

exec pnpm --filter @mas/memory exec tsx src/frontmatter-check-cli.ts "$@"
