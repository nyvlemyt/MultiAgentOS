#!/usr/bin/env bash
# PostToolUse hook: estimate remaining context tokens straight from the session
# transcript (no model tokens spent) and, past a high threshold, remind to leave
# room for a final debrief. See memory feedback_session-token-debrief.
#
# Reads the PostToolUse hook JSON on stdin: { "transcript_path": "...", ... }.
# Tunables (env): CLAUDE_CONTEXT_WINDOW (default 200000), CLAUDE_TOKEN_THRESHOLD
# (percent, default 98).

WINDOW="${CLAUDE_CONTEXT_WINDOW:-200000}"
THRESHOLD="${CLAUDE_TOKEN_THRESHOLD:-98}"

input="$(cat)"
transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty' 2>/dev/null)"
if [ -z "$transcript" ] || [ ! -f "$transcript" ]; then
  exit 0
fi

# Current context occupancy = the last assistant usage record (input + both
# cache buckets). Reading the transcript costs no model tokens.
used="$(jq -s '
  [ .[] | select(.message.usage != null) | .message.usage ]
  | last
  | ((.input_tokens // 0) + (.cache_read_input_tokens // 0) + (.cache_creation_input_tokens // 0))
' "$transcript" 2>/dev/null)"
case "$used" in ''|null) used=0 ;; esac

pct=$(( used * 100 / WINDOW ))
remaining=$(( WINDOW - used ))
if [ "$remaining" -lt 0 ]; then remaining=0; fi

if [ "$pct" -ge "$THRESHOLD" ]; then
  msg="⚠️ Contexte ~${pct}% utilisé (~${remaining} tokens restants, estimé). Garde de la marge pour le debrief final (résumé + conclusion) MAINTENANT avant de continuer."
  jq -cn --arg m "$msg" '{hookSpecificOutput:{hookEventName:"PostToolUse",additionalContext:$m}}'
fi
exit 0
