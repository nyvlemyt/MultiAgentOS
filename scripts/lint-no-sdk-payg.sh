#!/usr/bin/env bash
# CI guard: forbid @anthropic-ai/sdk imports outside the opt-in api-fallback/ directory.
# See CLAUDE.md §11 and ADR 0001.
set -euo pipefail

# Match the package in any import form: single/double quotes, dynamic import(),
# require(), and subpath imports (@anthropic-ai/sdk/...). A quote or slash must
# follow the name so '@anthropic-ai/sdk-foo' (unrelated) doesn't false-positive.
FORBIDDEN=$(grep -rnE "['\"]@anthropic-ai/sdk['\"/]" apps/ packages/ \
  --include="*.ts" --include="*.tsx" \
  | grep -v "node_modules" \
  | grep -v "packages/core/src/api-fallback/" \
  || true)

if [[ -n "$FORBIDDEN" ]]; then
  echo "ERROR: @anthropic-ai/sdk imported outside packages/core/src/api-fallback/" >&2
  echo "       These imports route billing to PAYG — forbidden by CLAUDE.md §11." >&2
  echo "" >&2
  echo "$FORBIDDEN" >&2
  exit 1
fi

echo "PASS: no forbidden @anthropic-ai/sdk imports"
