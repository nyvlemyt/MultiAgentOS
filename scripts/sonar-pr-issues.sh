#!/usr/bin/env bash
# Sonar PR gate for the verification ritual.
#
# The quality GATE only fails on rating thresholds — it stays green while
# MINOR/MAJOR code smells pile up on new code. This script is stricter: it
# fails if SonarCloud reports ANY open issue OR any to-review security hotspot
# on the PR's new code. Run it after `git push` (SonarCloud scans on push),
# poll until the analysis of your HEAD sha lands, then fix every reported item
# until this exits 0.
#
# Usage:  scripts/sonar-pr-issues.sh <pr-number>
# Env:    SONAR_PROJECT (default: nyvlemyt_MultiAgentOS2)
#
# Read-only, unauthenticated (public project API). Exit 0 = clean, 1 = issues,
# 2 = usage/analysis-not-ready.
set -euo pipefail

PR="${1:-}"
PROJECT="${SONAR_PROJECT:-nyvlemyt_MultiAgentOS2}"
BASE="https://sonarcloud.io/api"

if [[ -z "$PR" ]]; then
  echo "usage: $0 <pr-number>" >&2
  exit 2
fi

issues_json="$(curl -fsS "$BASE/issues/search?componentKeys=$PROJECT&pullRequest=$PR&resolved=false&ps=200")"
hotspots_json="$(curl -fsS "$BASE/hotspots/search?projectKey=$PROJECT&pullRequest=$PR&status=TO_REVIEW&ps=200")"

issue_count="$(printf '%s' "$issues_json" | python3 -c 'import json,sys; print(json.load(sys.stdin)["total"])')"
hotspot_count="$(printf '%s' "$hotspots_json" | python3 -c 'import json,sys; print(len(json.load(sys.stdin).get("hotspots",[])))')"

printf '%s' "$issues_json" | python3 -c '
import json, sys
for i in json.load(sys.stdin)["issues"]:
    loc = i["component"].split(":", 1)[-1] + ":" + str(i.get("line", "?"))
    print("  [{:8}] {:11} {:20} {}".format(i["severity"], i["type"], i["rule"], loc))
    print("             " + i["message"])
'
printf '%s' "$hotspots_json" | python3 -c '
import json, sys
for h in json.load(sys.stdin).get("hotspots", []):
    loc = h["component"].split(":", 1)[-1] + ":" + str(h.get("line", "?"))
    print("  [HOTSPOT {}] {:20} {}".format(h["vulnerabilityProbability"], h.get("ruleKey", ""), loc))
    print("             " + h["message"])
'

total=$((issue_count + hotspot_count))
echo "----"
echo "PR #$PR: $issue_count open issue(s), $hotspot_count to-review hotspot(s)."
if [[ "$total" -gt 0 ]]; then
  echo "SONAR NOT CLEAN — fix all of the above before declaring the phase done." >&2
  exit 1
fi
echo "SONAR CLEAN."
