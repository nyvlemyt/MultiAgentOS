# Phase 3.5b — Checker Verdict (Language mode + Quality Controller)

**Date**: 2026-06-14 · **Branch**: `phase/3.5b-language-qc` · **PR**: #9 · **HEAD**: `1ceebeb`
**Mode**: verification against `docs/learning/2026-06-14-phase3.5b-preflight/plan.md §4` (DoD) + ROADMAP "Phase 3.5 · Features additionnelles" + AGENTS.md §4 + CLAUDE.md §7.
**Method**: canonical commands; `MAS_MOCK_LLM` never exported globally.

## Verdict: **PASS** (after remediation — see §Correction)

All 8 DoD items verified with evidence. 5/5 checks green. Sonar **gate STATUS: OK** + issue script exit 0. No scope creep.

## ⚠️ Correction to first-pass verdict (the gate WAS failing)

The first pass declared PASS while the SonarCloud **quality gate was RED**, blaming "coverage" (per the
build-report). That was wrong twice over:

1. **The real first cause was duplication, not coverage.** `new_duplicated_lines_density = 5.6%` (> 3% gate
   threshold). The two new test files (`apps/web/lib/projects.test.ts` 43.5%, `packages/db/src/language-schema.test.ts`
   24.6%) duplicated the same temp-DB migrate/tmpdir/unlink scaffold cross-file.
2. **`scripts/sonar-pr-issues.sh` is blind to gate-measure failures.** It only queries `issues/search` +
   `hotspots/search`; duplication density and the reliability/maintainability *ratings* are gate conditions, not
   "issues" — so the script can exit 0 while the gate is ERROR. **CLAUDE.md §7's bar (script exit 0) is necessary
   but NOT sufficient; the gate `project_status` must also be OK.** See memory note.

### Remediation applied this session (test-only, no product behaviour change)

| Commit | Fix |
|--------|-----|
| `19e6bf1` | Extract shared temp-DB lifecycle into `@mas/db/testing` (`./testing` subpath export); both new test files import it → `new_duplicated_lines_density` 5.6% → **0.0%**. |
| `1ceebeb` | That helper was named `useTempDb` → SonarCloud's react-hooks rule (S6440) flagged it as a Hook called at top level in the React app = a gate-failing BUG (`new_reliability_rating` 3). Renamed `useTempDb`→`setupTempDb`. Reliability 3 → **1**. |

### Final Sonar state (HEAD `1ceebeb`, analysis polled live)

```
=== gate ===
STATUS: OK
  OK new_reliability_rating       actual=1   thr=1
  OK new_security_rating          actual=1   thr=1
  OK new_maintainability_rating   actual=1   thr=1
  OK new_duplicated_lines_density actual=0.0 thr=3
  OK new_security_hotspots_reviewed actual=100.0 thr=100
=== script ===
PR #9: 0 open issue(s), 0 to-review hotspot(s).
SONAR CLEAN.  exit=0
```

## Findings (per criterion)

| # | Criterion | Result | Evidence |
|---|-----------|--------|----------|
| 1 | Migration 0006 applies clean; legacy rows default `fr` | **PASS** | `0006_dapper_polaris.sql`: `ALTER TABLE projects ADD language text DEFAULT 'fr' NOT NULL`; journal entry present. Round-trip test `packages/db/src/language-schema.test.ts` (3 tests): default→fr, en round-trip, **legacy raw-INSERT omitting column backfills to fr** (line 53-63). Schema enum `['fr','en']` notNull default fr (`schema.ts:21`). |
| 2 | `languageDirective` in BOTH system assemblies; fr→FR/en→EN; no LLM call added | **PASS** | `language.ts`: pure fn, fr→"Respond in French.", en→"Respond in English.", undefined→fr (`language.test.ts` 3). Wired as **first** element in both `system:[...]` arrays — `executeTaskWithLLM` (`dispatch.ts:359`) + `resumeAfterValidation` (`dispatch.ts:526`); `language` added to both project selects (339, 506). `language-wiring.test.ts` (3): fr project→FR, en→EN, and **`capturedSystems.length === 1`** proves no extra LLM call (mock seam `claudeCodeLLM` mocked, not bypassed). |
| 3 | LanguagePill toggles + persists via PATCH | **PASS** | `LanguagePill.tsx`: commits `setLang` only on `res.ok` (S6443-correct, no optimistic revert). `route.ts` PATCH validates `isProjectLanguage` (400), 404 on missing, persists via `setProjectLanguage`. `lib/projects.test.ts` (3) + smoke test #28 "language pill persists and switches the cockpit-shell language" passed (2.1s). |
| 4 | Minimal `t()` dict, fr fallback; deep per-page i18n deferred (not silently missing) | **PASS** | `lib/i18n.ts`: `t(key,lang)` with `lang??'fr'` table fallback then `DICT.fr[key]` then key. nav+topbar keys both fr/en. `i18n.test.ts` (5). Deferral **explicitly documented** in build-report "Deferred" §1 with reason (DoD-critical = agent output language). Sidebar+Topbar consume `t()`. |
| 5 | QC runs in runReviewPhase BEFORE reviewer; BLOCK blocks, PASS proceeds; verdict in /trace; fiche ≤7 tools | **PASS** | `dispatch.ts:252-253`: `mockQualityController` runs first, logs `quality_control_verdict`; `if (qc.verdict !== 'BLOCK')` gates sec/reviewer (255-273); BLOCK→`status:'blocked'` (276-278). `quality-controller-wiring.test.ts` (2): qcIdx < revIdx on PASS path + mission `validated`; BLOCK path → no `review_verdict`, payload verdict BLOCK, mission `blocked`. `quality-controller.test.ts` (2). Generic Timeline renders the event in /trace. Fiche `packages/agents/fiches/quality-controller.md`: tier A, `tools: [Read, Grep, Glob]` (3 ≤ 7), pipeline matches AGENTS.md §4 (`execution → QC → Reviewer → SecReviewer`). |
| 6 | No scope creep | **PASS** | `git diff --stat main...HEAD`: 29 files, all within plan scope (db, core lang/qc/llm, agents dispatch+fiche, web pill/route/i18n/shell, docs). **No** `providers/` or `model-routing.json` change (router intact, §11/§11.bis). No Phase 5 Tier B execution. **No `packages/memory/` change** → producer/receptacle untouched. seed/testing/dispatch.test +1 each = QC roster registration only. |
| 7 | 5 checks green | **PASS** | See below. |
| 8 | (plan §4.8) no provider/router/deep-i18n; producer/receptacle untouched | **PASS** | Same evidence as #6. |

## 5 checks (independently re-run, this session)

| Check | Command | Result |
|-------|---------|--------|
| Tests | `pnpm -r test` | **exit 0** — db 11 · core 57 · skills 11 · memory 41 · agents 26 · web 42 · worker 1 |
| Lint | `pnpm lint` | **exit 0** — no-PAYG guard clean, all `tsc --noEmit` Done |
| Build | `pnpm build` | **exit 0** — clean; `/api/projects/[id]/language` route present |
| Smoke | `pnpm --filter @mas/web smoke` | **28 passed** (35.1s) — incl. #28 language-pill persist/switch |
| Sonar | gate `project_status` + `scripts/sonar-pr-issues.sh 9` | gate **STATUS: OK** (all 5 conditions) **and** script **exit 0** (0 issues / 0 hotspots) — see §Correction for the raw poll |

(Tests/lint/build re-run after remediation: `pnpm -r test` exit 0 — db 11 · core 57 · skills 11 · memory 41 · agents 26 · web 42 · worker 1; `pnpm lint` exit 0; `pnpm build` exit 0.)

## ReviewerVerdict (JSON)

```json
{
  "verdict": "PASS",
  "phase": "3.5b-language-qc",
  "pr": 9,
  "headSha": "1ceebeb",
  "checkedAt": "2026-06-14",
  "remediatedThisSession": ["19e6bf1 dedupe temp-db -> @mas/db/testing", "1ceebeb rename useTempDb->setupTempDb (S6440)"],
  "checks": {
    "test": "pass (189)",
    "lint": "pass",
    "build": "pass",
    "smoke": "pass (28)",
    "sonar": "gate STATUS OK (all conditions) + script exit 0"
  },
  "dod": {
    "1_migration_0006_legacy_fr": "pass",
    "2_directive_both_assemblies_no_llm": "pass",
    "3_languagepill_patch_persist": "pass",
    "4_minimal_i18n_fr_fallback_deep_deferred": "pass",
    "5_qc_before_reviewer_block_pass_trace_fiche": "pass",
    "6_fiche_le7_tools": "pass",
    "7_five_checks_green": "pass",
    "8_no_scope_creep": "pass"
  },
  "findings": [],
  "scopeGuardrails": {
    "providerRouterUnchanged": true,
    "noTierBExecution": true,
    "producerReceptacleUntouched": true,
    "deepPerPageI18nDeferredDocumented": true
  },
  "recommendation": "merge-ready, pending human approval"
}
```

## Notes

- DoD #4 deferral of deep per-page i18n is correct and **documented**, not silently missing (build-report Deferred §1). Compliant with plan §0/§4.
- **Process learning**: `sonar-pr-issues.sh` exit 0 does NOT prove the gate is green — it ignores gate *measure* conditions (duplication density, reliability/maintainability/security ratings). Verification must also check `qualitygates/project_status` → STATUS OK. Recommend CLAUDE.md §7 add the gate-status check (or extend the script to assert `project_status == OK`). The build-report's "gate ERROR = coverage" claim was unverified and wrong.
- Recommendation: **merge-ready**, pending human green light (phase-gate rule).
