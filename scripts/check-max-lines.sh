#!/usr/bin/env bash
# Étage 3 (God-file guardrail): the floor no write path bypasses — scans tracked SOURCE
# files regardless of how they were written (agent tool, terminal, editor). Wired into
# `pnpm lint`, so it runs locally and in CI. Cap = CLAUDE.md §7 (file < 800 lines).
set -uo pipefail
MAX="${MAX_LINES:-800}"
fail=0
count=0

while IFS= read -r f; do
  [ -f "$f" ] || continue
  case "$f" in
    .claude/skills/*/scripts/*|*/library/*|*/.next/*|*/node_modules/*|*/dist/*) continue ;;
    packages/agents/src/dispatch.ts) continue ;;  # legacy exception → docs/backlog/dispatch-ts-god-file.md
  esac
  n=$(awk 'END{print NR+0}' "$f")
  count=$((count + 1))
  if [ "$n" -gt "$MAX" ]; then
    echo "ERROR: $f — $n lines (cap $MAX, CLAUDE.md §7). Split by responsibility." >&2
    fail=1
  fi
done < <(git ls-files '*.ts' '*.tsx' '*.js' '*.mjs' '*.cjs' '*.sh' '*.py')

if [ "$fail" -eq 0 ]; then
  echo "PASS: $count source files under the $MAX-line cap (§7 God-file guard)"
fi
exit $fail
