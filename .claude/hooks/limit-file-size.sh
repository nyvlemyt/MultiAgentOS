#!/usr/bin/env bash
# Étage 1 (God-file guardrail, intake 2026-07-31-god-file-guardrails.md): refuse a
# Write/Edit that would push a SOURCE file past CLAUDE.md §7's cap. Pedagogic layer —
# the agent gets the refusal and re-plans. Terminal writes bypass it by design; the
# uncrossable floor is scripts/check-max-lines.sh in CI (étage 3).
set -uo pipefail
MAX_LINES="${MAX_LINES:-800}"

INPUT=$(cat)
command -v jq >/dev/null 2>&1 || exit 0   # no jq ⇒ stay out of the way (CI floor still holds)
TOOL=$(printf '%s' "$INPUT" | jq -r '.tool_name // empty')
FILE=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')
[ -n "$FILE" ] || exit 0

# Scope: source code only. Docs/markdown are capped editorially (§7), not by this hook.
case "$FILE" in
  *.ts|*.tsx|*.js|*.mjs|*.cjs|*.sh|*.py) ;;
  *) exit 0 ;;
esac
# Generated / vendored / state — never our line budget. Every pattern is anchored with
# `*/` because the tool always hands us an ABSOLUTE path: a bare `.claude/...` glob
# never matches and the exclusion is silently inert.
case "$FILE" in
  */.claude/skills/*/scripts/*|*/library/*|*/.next/*|*/node_modules/*|*/data/*|*/dist/*) exit 0 ;;
  *) ;;
esac
# Documented legacy exceptions (each one owns a backlog card that closes it).
case "$FILE" in
  */packages/agents/src/dispatch.ts) exit 0 ;;
  *) ;;
esac

lines() { printf '%s' "$INPUT" | jq -rj "$1" | awk 'END{print NR+0}'; }

case "$TOOL" in
  Write) NEW=$(lines '.tool_input.content // ""') ;;
  Edit)
    CUR=0; [ -f "$FILE" ] && CUR=$(awk 'END{print NR+0}' "$FILE")
    OLD=$(lines '.tool_input.old_string // ""')
    ADD=$(lines '.tool_input.new_string // ""')
    NEW=$(( CUR - OLD + ADD ))
    ;;
  *) exit 0 ;;
esac

if [ "$NEW" -gt "$MAX_LINES" ]; then
  jq -n --arg f "$FILE" --arg n "$NEW" --arg m "$MAX_LINES" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: ("Refuse: \($f) would reach \($n) lines; the project cap is \($m) (CLAUDE.md §7). Split it into modules with one responsibility each, then retry. Same cap is enforced in CI by scripts/check-max-lines.sh, so raising it here does not help.")
    }
  }'
fi
exit 0
