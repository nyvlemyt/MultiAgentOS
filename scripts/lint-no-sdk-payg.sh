#!/usr/bin/env bash
# CI guard for CLAUDE.md §11 + §11.bis (ADR 0001, ADR 0002):
#   1. @anthropic-ai/sdk (PAYG) forbidden everywhere except packages/core/src/api-fallback/.
#   2. Non-Anthropic provider SDKs (openai, @google/generative-ai) forbidden
#      outside packages/core/src/providers/.
# Scan roots default to "apps packages"; override via args (used by the fixture test).
set -euo pipefail

if [[ $# -gt 0 ]]; then
  ROOTS=("$@")
else
  ROOTS=(apps packages)
fi

scan() {
  # Match a package name in any IMPORT form: static import/from, dynamic
  # import(), require(), and subpaths. A quote or slash must follow the name so
  # unrelated names (e.g. '@anthropic-ai/sdk-foo') don't false-positive, and an
  # import keyword must precede it so plain string literals (test fixtures,
  # source-id maps) don't either.
  local pkg="$1"
  grep -rnE "(from|import|require)[^'\"]*['\"]${pkg}['\"/]" "${ROOTS[@]}" \
    --include="*.ts" --include="*.tsx" 2>/dev/null \
    | grep -v "node_modules" \
    || true
}

FAIL=0

ANTHROPIC=$(scan "@anthropic-ai/sdk" | grep -v "packages/core/src/api-fallback/" || true)
if [[ -n "$ANTHROPIC" ]]; then
  echo "ERROR: @anthropic-ai/sdk imported outside packages/core/src/api-fallback/" >&2
  echo "       These imports route billing to PAYG — forbidden by CLAUDE.md §11." >&2
  echo "$ANTHROPIC" >&2
  FAIL=1
fi

for pkg in "openai" "@google/generative-ai"; do
  HITS=$(scan "$pkg" | grep -v "packages/core/src/providers/" || true)
  if [[ -n "$HITS" ]]; then
    echo "ERROR: '${pkg}' imported outside packages/core/src/providers/" >&2
    echo "       Provider SDKs are confined there by CLAUDE.md §11.bis (ADR 0002)." >&2
    echo "$HITS" >&2
    FAIL=1
  fi
done

if [[ "$FAIL" -ne 0 ]]; then
  exit 1
fi

echo "PASS: no forbidden provider SDK imports (§11 + §11.bis)"
