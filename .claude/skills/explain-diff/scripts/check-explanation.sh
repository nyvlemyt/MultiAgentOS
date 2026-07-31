#!/usr/bin/env bash
# Deterministic gate for pages produced by the `explain-diff` skill.
# Turns the skill's Output Contract into binary checks: self-containment, code-block
# whitespace, quiz shape, anchor resolution, provenance SHAs, no ASCII diagrams.
# Usage: bash .claude/skills/explain-diff/scripts/check-explanation.sh <page.html>
# Exit 0 = deliverable. Exit 1 = fix and re-run. Exit 2 = bad invocation.
#
# No -e on purpose: every check runs so the report lists all failures at once.
set -uo pipefail

FILE="${1:-}"
fails=0

fail() {
  printf '  \033[31m✗\033[0m %s\n' "$1"
  fails=$((fails + 1))
}
ok() { printf '  \033[32m✓\033[0m %s\n' "$1"; }

if [ -z "$FILE" ] || [ "$FILE" = "-h" ] || [ "$FILE" = "--help" ]; then
  sed -n '2,7p' "$0" | sed 's/^# \{0,1\}//'
  exit 2
fi
if [ ! -f "$FILE" ] || [ ! -r "$FILE" ]; then
  printf 'check-explanation: not a readable file: %s\n' "$FILE" >&2
  exit 2
fi

printf 'check-explanation %s\n' "$FILE"

# --- 1. naming + location ----------------------------------------------------
base=$(basename "$FILE")
if printf '%s' "$base" | grep -Eq '^[0-9]{4}-[0-9]{2}-[0-9]{2}-explanation-[a-z0-9][a-z0-9._-]*\.html$'; then
  ok "filename is date-prefixed: $base"
else
  fail "filename must match YYYY-MM-DD-explanation-<slug>.html (got: $base)"
fi
case "$(cd "$(dirname "$FILE")" && pwd)" in
  */data/explanations) ok 'lives in data/explanations/' ;;
  */data/memory*) fail 'writes into data/memory/ — forbidden (CLAUDE.md §8)' ;;
  *) fail 'must live in data/explanations/ (gitignored, durable)' ;;
esac

# --- 2. self-contained single file -------------------------------------------
if grep -qi '<style' "$FILE" && grep -qi '<script' "$FILE"; then
  ok 'inline <style> and <script> present'
else
  fail 'page must inline its own <style> and <script>'
fi
remote=0
grep -Eiq 'src[[:space:]]*=[[:space:]]*"?https?://' "$FILE" && remote=1
grep -Eiq '<link[^>]+https?://' "$FILE" && remote=1
grep -Eiq '@import[^;]*https?://' "$FILE" && remote=1
grep -Eiq 'url\([[:space:]]*["'"'"']?https?://' "$FILE" && remote=1
if [ "$remote" -eq 0 ]; then
  ok 'zero network loads (prose links are fine)'
else
  fail 'page loads a remote resource (src=/<link>/@import/url()) — must be self-contained'
fi

# --- 3. code blocks ----------------------------------------------------------
has_pre=0
grep -qi '<pre' "$FILE" && has_pre=1
grep -Eiq '<div[^>]*class="[^"]*code' "$FILE" && has_pre=1
if [ "$has_pre" -eq 1 ]; then
  if grep -Eiq 'white-space[[:space:]]*:[[:space:]]*pre' "$FILE"; then
    ok 'code blocks declare white-space: pre/pre-wrap'
  else
    fail 'code block present without `white-space: pre|pre-wrap` — newlines will collapse'
  fi
else
  ok 'no code block to check'
fi

# --- 4. no ASCII-art diagrams ------------------------------------------------
if grep -F -q -e '─' -e '│' -e '┌' -e '┐' -e '└' -e '┘' -e '├' -e '┤' -e '┬' -e '┴' -e '┼' \
             -e '━' -e '┃' -e '═' -e '║' -e '╔' -e '╗' -e '╚' -e '╝' "$FILE"; then
  fail 'box-drawing characters found — diagrams must be HTML/CSS or inline SVG, not ASCII art'
else
  ok 'no ASCII-art diagram characters'
fi

# --- 5. required sections + resolvable anchors -------------------------------
# Heading text, inline markup stripped: flatten the file, cut at every <hN>/</hN>,
# keep the heading bodies, drop the tags inside them (a heading may open with a <span>).
headings=$(tr '\n' ' ' < "$FILE" \
  | awk '{ gsub(/<[hH][1-4][^>]*>/, "\nMASHEAD "); gsub(/<\/[hH][1-4]>/, "\n"); print }' \
  | grep '^MASHEAD ' \
  | sed 's/<[^>]*>/ /g' \
  | tr '[:upper:]' '[:lower:]')
for kw in background intuition code quiz; do
  if printf '%s' "$headings" | grep -q "$kw"; then
    ok "section heading mentions '$kw'"
  else
    fail "no heading mentions '$kw' — the four required sections must be present"
  fi
done
anchors=$(grep -Eo 'href="#[A-Za-z0-9_.:-]+"' "$FILE" | sed -e 's/href="#//' -e 's/"$//' | sort -u)
if [ -z "$anchors" ]; then
  fail 'no in-page anchors — the page needs an anchored table of contents'
else
  broken=0
  while IFS= read -r a; do
    [ -z "$a" ] && continue
    grep -q "id=\"$a\"" "$FILE" || { fail "table-of-contents anchor #$a has no matching id"; broken=1; }
  done <<EOF
$anchors
EOF
  [ "$broken" -eq 0 ] && ok 'every table-of-contents anchor resolves'
fi

# --- 6. quiz shape -----------------------------------------------------------
quiz_report=$(awk '
  /class="quiz-q"/ { q++ }
  q > 0 {
    opts[q] += gsub(/class="quiz-opt"/, "&")
    corr[q] += gsub(/data-correct="true"/, "&")
    fb[q]   += gsub(/data-feedback="[^"]/, "&")
    empty[q]+= gsub(/data-feedback=""/, "&")
  }
  END {
    print "questions " q+0
    for (i = 1; i <= q; i++) print "q" i, opts[i]+0, corr[i]+0, fb[i]+0, empty[i]+0
  }
' "$FILE")
nq=$(printf '%s\n' "$quiz_report" | awk '/^questions /{print $2}')
if [ "${nq:-0}" -eq 5 ]; then
  ok 'exactly 5 quiz questions'
else
  fail "quiz must have exactly 5 questions (found ${nq:-0})"
fi
qdetail=$(printf '%s\n' "$quiz_report" | grep -E '^q[0-9]' || true)
before=$fails
# here-doc (not a pipe) so the loop runs in this shell and can bump $fails
while IFS=' ' read -r id opts corr fb empty; do
  [ -z "$id" ] && continue
  [ "$opts" -ge 3 ] || fail "$id: ${opts} option(s) — need at least 3"
  [ "$corr" -eq 1 ] || fail "$id: ${corr} option(s) marked data-correct=\"true\" — need exactly 1"
  [ "$fb" -ge "$opts" ] || fail "$id: ${fb} data-feedback value(s) for ${opts} options — every option needs one"
  [ "$empty" -eq 0 ] || fail "$id: ${empty} empty data-feedback value(s)"
done <<EOF
$qdetail
EOF
if [ "$fails" -eq "$before" ] && [ -n "$qdetail" ]; then
  ok 'each question: ≥3 options, exactly 1 correct, feedback on every option'
fi

# --- 7. provenance + honest coverage ----------------------------------------
for attr in data-base-sha data-head-sha; do
  val=$(grep -Eo "$attr=\"[^\"]*\"" "$FILE" | head -1 | sed -e "s/$attr=\"//" -e 's/"$//')
  if [ "${#val}" -ge 3 ]; then
    ok "$attr present ($val)"
  else
    fail "$attr missing or empty — the page must record the diff it explains"
  fi
done
if grep -Eiq 'not covered' "$FILE"; then
  ok 'coverage gaps stated ("Not covered")'
else
  fail 'no "Not covered" list — silent gaps read as full coverage'
fi

# --- 8. no placeholders left -------------------------------------------------
if grep -Eq 'TODO|TBD|FIXME|[Ll]orem ipsum' "$FILE"; then
  fail 'placeholder text left in the page (TODO/TBD/FIXME/lorem ipsum)'
else
  ok 'no placeholder text'
fi

printf '\n'
if [ "$fails" -eq 0 ]; then
  printf '\033[32mPASS\033[0m — deliverable: %s\n' "$FILE"
  exit 0
fi
printf '\033[31mFAIL\033[0m — %d check(s) failed\n' "$fails"
exit 1
