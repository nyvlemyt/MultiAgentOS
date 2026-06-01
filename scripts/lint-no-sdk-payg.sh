#!/usr/bin/env bash
# CI guard: forbid @anthropic-ai/sdk imports outside the opt-in api-fallback/ directory.
# See CLAUDE.md §11 and ADR 0001.
set -euo pipefail

FORBIDDEN=$(grep -rn "from '@anthropic-ai/sdk'" apps/ packages/ \
  --include="*.ts" --include="*.tsx" \
  | grep -v "node_modules" \
  | grep -v "packages/core/src/api-fallback/" \
  || true)

if [[ -n "$FORBIDDEN" ]]; then
  echo "ERROR: @anthropic-ai/sdk imported outside packages/core/src/api-fallback/"
  echo "       These imports route billing to PAYG — forbidden by CLAUDE.md §11."
  echo ""
  echo "$FORBIDDEN"
  exit 1
fi

echo "PASS: no forbidden @anthropic-ai/sdk imports"
