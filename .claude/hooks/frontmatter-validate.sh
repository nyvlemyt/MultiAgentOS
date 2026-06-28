#!/usr/bin/env bash
# PostToolUse hook (Write|Edit): the instant a fiche markdown under
# docs/resources/** or docs/knowledge/** is written, run the Brique 1d
# frontmatter gardien on just that file so a bad lifecycle / unresolvable
# relation / missing tier-1 identity is caught at authoring time, not only in
# CI. Mirrors .claude/hooks/token-watch.sh (stdin JSON, jq, no model tokens).
#
# stdin: PostToolUse JSON { tool_input: { file_path } }. Non-.md or out-of-scope
# paths → silent no-op (cheap pre-filter, no tsx spin-up). A validator error →
# exit 2 so the gardien message is fed back to Claude: the write already landed,
# this prompts an immediate fix.

input="$(cat)"
path="$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty' 2>/dev/null)"
[ -z "$path" ] && exit 0

# Only fiche markdown under the watched roots reaches the validator.
case "$path" in
  *.md) ;;
  *) exit 0 ;;
esac
case "$path" in
  */docs/resources/*|*/docs/knowledge/*|docs/resources/*|docs/knowledge/*) ;;
  *) exit 0 ;;
esac

root="${CLAUDE_PROJECT_DIR:-}"
if [ -z "$root" ]; then
  root="$(git -C "$(dirname "$path")" rev-parse --show-toplevel 2>/dev/null)"
fi
[ -z "$root" ] && exit 0

out="$(cd "$root" && pnpm --filter @mas/memory exec tsx src/frontmatter-check-cli.ts "$path" 2>&1)"
code=$?
if [ "$code" -ne 0 ]; then
  {
    echo "⚠️ Frontmatter gardien — fiche invalide : $path"
    printf '%s\n' "$out" | grep -E "ERROR|FAIL" || printf '%s\n' "$out"
    echo "Corrige le frontmatter (lifecycle légal + identité tier-1 + relations résolvables) avant de continuer."
  } >&2
  exit 2
fi
exit 0
