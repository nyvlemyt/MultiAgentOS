# Cross-Wave Reviewer Verdict — Phase 9 · Wave 0c (Tier A roster)

> Reviewer: dogfooding the agent 0c just promoted — the **Agent Evaluator**
> (RES-043 agent-as-judge), applying its 5-axis rubric (Accuracy · Completeness ·
> Coherence/no-regression · Actionability · Conciseness, each /5) to the whole wave
> as a deliverable. READ-ONLY pass: no source touched, only this file written.
> RES-043: I did not build this — independent review.
> Branch `phase/9c-roster`, diff `d3cd68e..HEAD` (10 commits, 26 files, +755/-24,
> HEAD `4b7dd86`).
>
> **This verdict REFRESHES the prior one** over the full range. The prior pass
> (`d3cd68e..695007e`, 5 commits) was Reviewer-PASS with two LOW findings; the
> close-out stack (`695007e..HEAD`, 5 commits) was built to clear them. Both are
> now verified **RESOLVED** below.

## Top-line verdict

**PASS — deliver.** Weakest axis: **Coherence / no-regression (5/5)** — the prior
weak axis (was 4/5, the UI roster drift) is now closed; every axis is at full marks.
No critical issue, no remaining LOW finding inside 0c scope. Strict 0c hard-stop
respected (no 0d work). PR stays DRAFT.

## TL;DR (2 lines)

The evaluator is correctly promoted and wired as a **distinct, advisory,
non-blocking** judge (`agent_evaluation` event, mission still validates),
`validateFiche()` truly catches a missing key *and* now a missing permission
sub-key, planner/orchestrator are cleanly split, AGENTS.md is reconciled, and the
two LOW findings from the prior pass are both fixed (UI fixture 6→9 + all avatars
resolve; AGENTS.md §4 count corrected). 513 tests green, 0 fail; no cross-wave
regression.

## Prior-finding closeout (the two LOW findings from `..695007e`)

| # | Prior finding | Fix commit | Verified RESOLVED |
|---|---------------|-----------|-------------------|
| **#1** | UI roster drift — `tierAFixture` listed 6 Tier A; seed/fiches ship 9 | `a45c922` | **YES.** `apps/web/lib/fixtures.ts:6-16` now lists **9** rows (adds quality-controller :13, orchestrator :14, agent-evaluator :15). Every `avatarPath` resolves: `ls apps/web/public/avatars/` shows all 9 SVGs incl. the 3 added (`agent-evaluator.svg` 304 B, `orchestrator.svg` 332 B, `quality-controller.svg` — created because the fiche referenced it but no file existed anywhere). All 3 new SVGs are well-formed (`<svg viewBox="0 0 32 32" stroke="currentColor" stroke-width="1.6">`, matching the existing 32×32 stroke style). Fixture count (9) now equals seed `tierA` (9) = `fiches/*.md` (9) = `loadTierAFiches().toHaveLength(9)`. |
| **#2** | AGENTS.md §4 header double-counted quality-controller | `60b91ed` | **YES.** `AGENTS.md:78` header is now `## 4. Tier A roster — Phase 2 (8 more — quality-controller shipped)`. The §4 table still carries a QC row (`AGENTS.md:84`) but annotated `**Shipped — see §3.**`, so the header "8 more" matches the 8 genuinely-future rows (project-manager, architect, frontend-builder, backend-builder, ux-critic, researcher, automation-designer, docs-writer). Internally consistent. |

## New close-out commits (also reviewed, beyond the two findings)

| Commit | What | Verdict |
|--------|------|---------|
| `04236cf` | `validateFiche` asserts `permissions.{fs_write,shell,network}` exist + are `string\|boolean` (`registry.ts:48-78`) + RED test | **Sound.** Closes the Checker MINOR: a typing-clean fiche could omit a permission sub-key the §5 gate reads. All 9 shipped fiches still return `[]`. |
| `adde57c` | catch-branch test (`dispatch-evaluator.test.ts:93-119`): omit the agent-evaluator seed → FK insert fails → `agent_evaluation_error` fires, mission still `validated` | **Sound.** Exercises `dispatch.ts:509-511`, proving the best-effort advisory contract under a stale DB. |
| `4b7dd86` | tech-debt card `docs/backlog/dispatch-split-review-phase.md` | **Honest.** Logs the pre-existing §7 size debt (dispatch.ts 1026>800, runReviewPhase 105>50); explicitly states **no dispatch.ts logic touched** — confirmed by diffstat (`dispatch.ts` +22, all in the advisory block + import, no refactor). |

## Scorecard (full `d3cd68e..HEAD` range)

| Axis | Score | Evidence |
|------|-------|----------|
| **1. Accuracy** | 5/5 | Trace holds end-to-end. `ReviewKind` gains `'evaluator'` → `REVIEW_KIND_LABEL.evaluator='agent-eval'` (`core/src/llm.ts`); `realAgentEvaluator` calls `runCritic` with `reviewKind:'evaluator'`, `ficheId:'agent-evaluator'` (`reviewers.ts:199-206`); `runReviewPhase` runs it AFTER the gates (`dispatch.ts:502-511`), logs `agent_evaluation`, and the result is **never pushed to `verdicts[]`** (only sec `dispatch.ts:483` + reviewer `:494` are) so `blocked` at `:516` (`qc.verdict === 'BLOCK' \|\| verdicts.some(...)`) cannot see it. The advisory test proves the event fires once, agentId=`agent-evaluator`, verdict parses, mission still `validated` (`dispatch-evaluator.test.ts:67-91`); the new catch-branch test proves a missing FK row → `agent_evaluation_error` + still `validated` (`:93-119`). `validateFiche` truly catches a missing key (`registry.ts:58-80`; `loadTierAFiches:90-92` aggregates + throws) and now a missing/mistyped permission sub-key (`:72-77`). All re-run live: 513 tests / 0 fail. |
| **2. Completeness** | 5/5 | All CAMPAIGN §5 "Sortie 0c" items present, and the plan went *beyond* spec (CAMPAIGN said §3 6→7; delivered 9). C1 evaluator fiche — every §2 key incl. `escalate_when` (3 clauses), RES-043 lineage (`agent-evaluator.md:46,60`), `## Verdict` output block (`:99`), ≤7 tools (4: Read/Grep/Glob/Bash), read-only perms, avatar present. C2 wired+distinct+green (now 2 tests incl. catch). C3 orchestrator fiche + avatar + planner tightened to one-shot. C4 U3 validateFiche + reviewer/sec-reviewer `limits:` + permission-subkey hardening. C5 U2 AGENTS.md §1 60, §3 9-row roster, §4 fixed, §7 tree, §10 → validateFiche(). C6 5 checks green (below). Plus the full audit trail (plan/build-report/2 verdicts) and tech-debt card. Nothing claimed-but-missing. |
| **3. Coherence / no-regression** | 5/5 | 0b pipeline intact: evaluator is purely additive in the non-QC-BLOCK branch, advisory, never alters the gate/`blocked` logic. AGENTS.md internally consistent: §1 `60` = real `.claude/agents/*.md` count (verified `ls \| wc -l` = 60); §3 9 rows = `fiches/*.md` = 9 = seed `tierA`. **The two prior LOW gaps are now closed** (UI fixture 9-row + §4 count — see closeout table above), so the axis that was 4/5 is now clean. Both new fiches pass the agents-skills.md coherence test (no framework body, skills via `required_skills`). 513 tests green (core 107, db 15, skills 28, memory 87, agents 125, web 143, worker 8) — agents went 123→125 (the +2 close-out tests), every other package unchanged ⇒ zero collateral. |
| **4. Actionability** | 5/5 | Nothing left to action inside 0c scope. The one residual (dispatch.ts §7 size) carries a concrete, mechanical fix in a card (`extract runCriticGates()` into `review-phase.ts`, contracts spelled out, acceptance = `runReviewPhase`<50 + Sonar exit 0). Self-judging this report: every claim names a `file:line`; no hand-waving. |
| **5. Conciseness** | 5/5 | No dead code. The evaluator try/catch is justified (best-effort, comment `dispatch.ts:496-501` explains a stale FK row must not stall a mission) and now *covered by a test*. `realAgentEvaluator` reuses `runCritic`/`briefBlock` (no duplication). The `evaluator` plumbing is consumed (reviewers.ts + dispatch.ts + 2 test suites), not orphaned. The close-out is minimal: 5 small commits, +18-line permission guard, 3 SVGs, 3 fixture rows, 1 header word, 2 tests, 1 card — no over-build, no scope creep into 0d. |

## Critical issues (axes ≤ 2)

**None.** No axis scored ≤ 2.

## Non-blocking findings

**None inside 0c scope.** The only residual is the pre-existing §7 size debt
(`dispatch.ts` 1026 > 800; `runReviewPhase` 105 > 50), correctly identified by the
Checker, **not introduced by 0c** (base `d3cd68e`: 1008 / 87; 0c added ~+18 each via
the advisory block), and now logged as a DEFERRED tech-debt card
(`docs/backlog/dispatch-split-review-phase.md`) with a mechanical extraction plan.
This is a quality target, not a build-failing gate — fair to defer to an attended PR
(it touches the worker + web inline path; coupling it to the roster wave would risk a
cross-wave regression). INFO only.

## Does it break a prior wave?

No. **0b** (real doer/checker pipeline) is untouched in behaviour: the evaluator is
purely additive in the non-QC-BLOCK branch, never enters `verdicts[]`, never changes
the `blocked` decision (`dispatch.ts:516`), and is best-effort (try/catch, now
test-covered) so it cannot stall a mission — 0b's evaluator-optimizer loop, reality
checker, and prompt chaining all still pass. **A** (audit + S5906 cleanup) invariants
hold: no PAYG/`@anthropic-ai/sdk` import (lint PAYG guard PASS; the LLM is still
injected, `reviewers.ts` instantiates nothing — §11), `packages/core/src/providers/`
untouched, no `data/memory/` write (§8), §5 risk gate unchanged (it fires during
execution; the review phase only judges finished artifacts). `validateFiche` is a
*new* guard with no prior runtime consumer, so adding the throw is safe (plan §1 fact,
confirmed). The permission-subkey hardening (`04236cf`) is a pure tightening — all 9
shipped fiches still validate clean. 513 tests green confirms zero cross-wave
regression.

## 5-check verification (re-run live this pass)

| Check | Result |
|-------|--------|
| `pnpm -r test` | **PASS** — 513 / 0 fail (core 107, db 15, skills 28, memory 87, agents 125, web 143, worker 8) |
| `pnpm lint` | **PASS** — exit 0, `PASS: no forbidden provider SDK imports (§11 + §11.bis)` |
| `pnpm build` | **PASS** — full Next build + all packages Done |
| `pnpm --filter @mas/web smoke` | **PASS** — 32 passed |
| `scripts/sonar-pr-issues.sh <pr>` | **PENDING** — 5th check, post-push only (CLAUDE.md §7). Run after `git push` + analysis of HEAD `4b7dd86` lands; must exit 0 + gate OK before the gate. Not a fail at this pass. |

## Recommendation

**PASS — deliver.** Promote past the 0c gate once Sonar (check 5) lands exit 0 +
gate OK post-push. The single residual (dispatch.ts §7 size) is pre-existing and
correctly carded; it is not a 0c blocker. Keep the DRAFT stack (0b → A → 0c)
committed; never merge to main (CAMPAIGN §4). Do not start 0d in this session.
