# Phase 9 · Étape 0b — Real doer/checker pipeline — BUILD REPORT

> Branch: `phase/9b-pipeline` (off `main` @ `ce04cf9`). Built TDD, red→green, one
> commit per plan step. Not pushed; the orchestrator opens the DRAFT PR.
> Spec: `docs/learning/2026-06-24-0b-preflight/plan.md`.

## 1. What shipped (the binary 0b DoD)

A mission task now executes **producer → real critic → on NEEDS_WORK/BLOCK a
bounded correction loop**, and dependent tasks receive upstream context. No mock
critic remains in the mission doer/checker review path. All under the locked
stack with §5/§8/§11 intact and bounded loops (no runaway quota).

The four official patterns are wired:

- **Evaluator-Optimizer** — `runDelegatedTask` re-invokes the producer with the
  prior gate findings injected, **bounded** by `MAX_REVIEW_ITERATIONS = 2` AND the
  task budget; each retry logs a `review_iteration` event.
- **Prompt Chaining** — `upstreamResults()` reads each `dependsOn` task's persisted
  `last_message` (from the `task_done` event payload, no migration) and injects an
  `### Upstream results:` block into the producer prompt (user prompt on the raw
  path, skillContext on the delegated path).
- **Bounded loop / circuit breaker** — iteration cap + per-task budget check; an
  unbounded "loop until satisfied" was treated as a KILL criterion and avoided.
- **Coverage review prompt** — the `prompting-anthropic.md:104-110` text is used
  verbatim in every critic's system prompt (`COVERAGE_PROMPT` in `reviewers.ts`).

## 2. The determinism seam (CI stays live-model-free)

- New `reviewKind?: 'reviewer' | 'sec' | 'qc' | 'code'` field on `LLMRequest`.
- `mockLLM()` is review-aware: when `reviewKind` is set it returns a parseable
  `## Verdict` synthesized from sentinels in `req.user` (`[qc-block]`/`[sec-block]`/
  `risk=blocking` → BLOCK; `[needs-work]` → NEEDS_WORK; else PASS), with the kind
  label embedded in the finding (`code-review`/`reality-check`/`quality-control`/
  `sec-review`/`review`) so substring asserts pass. Exposed as `mockVerdictText()`.
- The two `vi.mock('@mas/core')` `claudeCodeLLM` clients (`dispatch.test.ts`,
  `dispatch-delegate.test.ts`) branch on `req.reviewKind` → `actual.mockVerdictText`.
- The **real** `claudeCodeLLM` ignores `reviewKind`; the fiche's `## Verdict`
  instruction drives the real verdict.
- `parseVerdict` fail-safe = **NEEDS_WORK** with a "could not parse verdict" warn
  finding — never a silent PASS on unparseable text.
- **Reality Checker is deterministic (no LLM)**:
  `evidence = diffApplies && (testsCited || diffCoversRequest)`, default-to-NEEDS_WORK
  without evidence. The Code Reviewer in the gate is the real LLM critic.

## 3. Files

New:
- `packages/agents/src/reviewers.ts` — `realReviewer/realSecReviewer/realQualityController/realCodeReviewer`, `parseVerdict`, fiche loader, `COVERAGE_PROMPT`/`VERDICT_FORMAT`.
- `packages/agents/src/reviewers.test.ts`
- `packages/agents/src/dispatch-eval-loop.test.ts`
- `packages/agents/src/dispatch-chaining.test.ts`
- `packages/core/src/mock-llm-verdict.test.ts`
- `docs/learning/2026-06-24-0b/build-report.md` (this file)

Changed:
- `packages/core/src/llm.ts` — `ReviewKind`, `reviewKind?` field, review-aware `mockLLM` + `mockVerdictText`; all mock critic fns kept (plan §2.1).
- `packages/agents/src/review-gate.ts` — deterministic evidence + `realCodeReviewer`; new signature (drop `evidence:boolean`; add `llm`, `taskBrief`, `lastMessage`, `taskRisk`).
- `packages/agents/src/dispatch.ts` — real `runReviewPhase`; evaluator-optimizer loop; prompt chaining; plan-time `realSecReviewer`; `buildMissionLLM`/`lastMessageFor`/`upstreamResults` helpers; `lastMessage` persisted on `task_done`.
- `packages/agents/src/index.ts` — export `reviewers`.
- `packages/agents/src/dispatch.test.ts`, `dispatch-delegate.test.ts`, `review-gate.test.ts` — verdict-aware mocks / new gate signature.

## 4. The 4 local checks (all green)

1. `pnpm -r test` — **PASS**. core 106 · db 15 · skills 28 · memory 87 · agents 114 · web 143 · worker 8 (all suites passed, exit 0).
2. `pnpm lint` — **PASS, exit 0**. `lint-no-sdk-payg.sh` PASS (no forbidden provider SDK imports, §11/§11.bis); all 7 `tsc --noEmit` projects Done.
3. `pnpm build` — **PASS, exit 0**. All packages + `apps/web` build Done.
4. `pnpm --filter @mas/web smoke` — **PASS**. 32 passed (41.9s).

Check 5 (SonarCloud, `scripts/sonar-pr-issues.sh <pr>` exit 0 + gate OK) runs after
the orchestrator pushes the branch + opens the DRAFT PR. Sonar-recurring rules were
applied proactively (disjoint verdict regex S5852; `Set` membership; hoisted
literals S1192; strict-index guards; `localeCompare`; detached-promise logging).

## 5. Deferrals / decisions

- **Plan-time sec (§2.8): IMPLEMENTED as `realSecReviewer`** (not deferred). One
  client is built once in `planMission` via `buildMissionLLM`; it is consulted only
  when the rule-based classifier abstains (`needsLLMFallback`). Marked inline as the
  plan-time risk heuristic, NOT the doer/checker gate. The `risk-classify-wiring`
  test drives the deterministic `rm` rule (not this fallback) and stays green.
- **`intake-gate.ts` left untouched (out of 0b scope, documented).** It is the
  Phase-4.5 knowledge-intake subsystem (a separate gate), not the mission
  doer/checker path. It still imports the kept `mockSecReviewer` from `@mas/core`
  by design (plan §2.1). Its 7 tests stay green.
- **Mock critic fns kept exported** (`mockReviewer/mockSecReviewer/mockQualityController/mockCodeReviewer/mockRealityChecker`) — deterministic fallback + intake-gate consumer (plan §2.1).
- **No schema migration** for prompt chaining — `last_message` rides the existing
  `task_done` event payload (truncated to 2000 chars, §6 token discipline), the
  lower-risk option in plan §2.9.

## 6. Invariants held

- §11: no `@anthropic-ai/sdk` import anywhere; `providers/` untouched; critics use
  the **injected** `LLMClient` only; `MAS_MOCK_LLM` never exported globally.
- §5: the risk gate (`pauseForRiskGate`) fires before the LLM; the loop proposes
  diffs only — never applies one, never bypasses a human gate.
- §8: no `data/memory/` writes (only `data/outputs/` for diffs/artifacts).
- Time-dependent logic (`loadBlockedWindows`) takes an explicit `now: Date`.
