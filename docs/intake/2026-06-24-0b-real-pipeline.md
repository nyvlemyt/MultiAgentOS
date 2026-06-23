# Intake dossier — Phase 9·0b · real doer/checker pipeline (evaluator-optimizer + real critics)

- **Date**: 2026-06-24
- **Auditor**: build session (Phase 9·0b pre-flight, §13)
- **Kind**: internal design pattern adoption (no external tool, no new dependency)
- **One item / one dossier**: the bundle of patterns 0b wires in — *Evaluator-Optimizer loop* + *real-critic LLM delegation* + *real Reality-Checker evidence* + *prompt chaining*.

## 0. Guardrails (step 0)

| Constraint | Status for 0b |
|---|---|
| Subscription-only, no `@anthropic-ai/sdk` (§11) | Critics call the **existing** `LLMClient` (`selectLLM` → `claudeCodeLLM`/`mockLLM`). No new SDK, no PAYG. ✅ |
| Memory Keeper sole writer to `data/memory/` (§8) | 0b touches dispatch/review only; writes diffs to `data/outputs/`, never `data/memory/`. ✅ |
| Risky actions gated (§5) | The §5 risk gate (`pauseForRiskGate`) is **untouched**; the review loop runs after execution, never bypasses the human gate for `high`/`blocking`. ✅ |
| ≤7 tools/agent | Critics are LLM prompt calls bound to existing fiches; no tool expansion. ✅ |
| No new framework without ADR | No framework. The four official "Building Effective Agents" patterns are doctrine (`anthropic-ecosystem.md:160-171`); 0b is wiring, not adoption of a lib. ✅ |

No guardrail is violated → eligible for `adapt_now` (not as-is `implement_now`, because the canonical Anthropic patterns must be adapted to our deterministic-test seam + token budget).

## 1. Identity

- **What**: replace the five mock critics (`mockReviewer`/`mockSecReviewer`/`mockQualityController`/`mockCodeReviewer`/`mockRealityChecker`, `packages/core/src/llm.ts`) with real verdicts produced by delegating to the Tier-A fiches (`reviewer`, `sec-reviewer`, `quality-controller` — all `claude-sonnet-4-6`), and close the **evaluator-optimizer loop**: a `NEEDS_WORK`/`BLOCK` verdict re-invokes the producer with findings injected, bounded by `maxReviewIterations`.
- **Source doctrine** (already distilled, no foreign content to sanitize — step 4.bis N/A):
  - `docs/knowledge/anthropic-ecosystem.md:160-171` — 5 official agent patterns (Evaluator-Optimizer, Prompt Chaining).
  - `docs/knowledge/agent-patterns.md` — orchestration modes.
  - `docs/knowledge/production-patterns.md:101-117` — circuit breakers / bounded loops / human-in-the-loop.
  - `docs/knowledge/prompting-anthropic.md:100-110` — code-review coverage prompt (report-everything, separate verify step).
- **Recency / obsolescence**: low — these are current Anthropic doctrine + our own fiches.

## 2. Fit

- **Improves**: the *core spine* (dispatch + review). Today verdicts are logged then ignored (`dispatch.ts` runReviewPhase), `evidence:false` is hard-coded (`review-gate.ts`), dependent tasks get no upstream context. 0b makes the criticism real and actionable. This is the gating debt the 2026-06-22 audits flagged ("critiques en mock, pas d'agent évaluateur").
- **Surfaces touched**: `packages/core/src/llm.ts`, `packages/agents/src/{dispatch.ts,review-gate.ts,delegate.ts}` + new `reviewers.ts`, plus their tests.
- **Duplicate check**: not a duplicate — it *replaces* the mocks in the runtime path. The mock pure functions stay only as a deterministic test fallback / parser default (no real LLM in CI).

## 3. Three costs

- **Install**: medium. New `reviewers.ts` (prompt build + `parseVerdict`), loop in `runDelegatedTask`, real evidence in `review-gate.ts`, context passing in `selectRunnableTasks`/`executeTaskWithLLM`. TDD: ~8–12 new/updated tests. Token cost at build = mocked LLM in CI → ~0 quota.
- **Maintenance**: low–medium. Prompt drift if fiches change; mitigated by loading the fiche body at runtime (single source) rather than copying prose.
- **Removal**: **reversible**. The change is localized to dispatch/review; reverting to the mock-only path is a small diff. The mock functions are retained, so removal = drop the real path. Not rooted.

## 4.bis Sanitize

N/A — no foreign repo/course/embedded code is ingested. All sources are already in-repo distilled knowledge. No secret/PII scan target.

## 5. Score (0–5)

| Axis | Score | Note |
|---|---|---|
| project_fit | 5 | Directly closes the 0b exit-criterion debt. |
| token_efficiency | 4 | Real critics add LLM calls at runtime (sonnet-4-6); bounded by `maxReviewIterations` (2) + task budget. Mocked in CI. |
| safety | 5 | §5/§8/§11 all preserved; loop is bounded (circuit breaker). |
| implementation_effort | 3 | Non-trivial: must keep `MAS_MOCK_LLM` wiring tests green (the `[qc-block]` seam). |
| evidence_maturity | 5 | Official Anthropic patterns + our own fiches. |
| user_value | 5 | Real review = trustworthy auto-construction (the whole point of Phase 9). |
| phase_compatibility | 5 | This **is** Phase 9·0b. |

## 6. KILL criteria (veto)

- Paid API / PAYG dependency → **none** (uses existing subscription `LLMClient`). Not killed.
- Executes code without sec audit → the loop produces **diffs only** (propose, never apply); §5 human gate intact. Not killed.
- Unbounded loop / runaway quota → mitigated: `maxReviewIterations` (default 2) **and** per-task budget stop (`production-patterns.md` circuit breaker). A loop with no bound would be a KILL — the bound is mandatory in the plan DoD.
- Out of phase → no, it is the phase.

## 7. Decision

**`adapt_now`.** Adopt the Evaluator-Optimizer + Prompt-Chaining patterns, **adapted** to MultiAgentOS: (a) critics delegate to the real fiches via the existing `LLMClient`, parsing the fiche-specified `## Verdict` markdown; (b) the correction loop is **bounded** by `maxReviewIterations` + task budget (never the canonical "loop until satisfied"); (c) the deterministic `MAS_MOCK_LLM` test seam (incl. the `[qc-block]` sentinel) is preserved so CI stays LLM-free and green. Justification ties to ROADMAP 0b scope + `production-patterns.md:101-106` (bounded loop is a hard constraint, not optional).

## 8. Appropriation (the MultiAgentOS version)

- **Cheaper**: load fiche **body** at runtime (single source, no prose copy); `parseVerdict` is deterministic (no extra LLM); Reality-Checker evidence is computed **deterministically** (diff-applies via existing `validateDiffApplies`, tests-cited via grep of the diff/last_message, diff-covers-request heuristic) — **no LLM call** for the reality check.
- **Deterministic test path**: under `MAS_MOCK_LLM=1`, `mockLLM` becomes verdict-aware (emits `## Verdict` from sentinels — `[qc-block]`→BLOCK, else PASS) so the real `parseVerdict` runs on mock text and the wiring tests stay green without a live model.
- **Fail-safe**: an unparseable critic response defaults to `NEEDS_WORK` (re-loop), never silent PASS — except the deterministic mock path which yields PASS by construction. Sec-reviewer ambiguity defaults to BLOCK (fiche rule).
- No external-source agent adopted → Prompt-Defense-Baseline header N/A (no foreign fiche ingested).

## 9. Integration plan

- **Target phase**: 9·0b (now). **Branch**: `phase/9b-pipeline`. **PR**: DRAFT (user merges).
- **Files**: `packages/core/src/llm.ts` (verdict-aware mock + verdict types), new `packages/agents/src/reviewers.ts` (real critics + `parseVerdict`), `packages/agents/src/dispatch.ts` (real `runReviewPhase`, evaluator-optimizer loop in `runDelegatedTask`, context passing), `packages/agents/src/review-gate.ts` (real evidence), + tests.
- **Token budget**: build = mocked (~0 quota). Runtime per task = bounded by task budget + `maxReviewIterations`.
- **Binary DoD**: producer → real critic → on `NEEDS_WORK` a bounded correction loop runs; **no mock critic in the real (live-LLM) runtime path**; dependent tasks receive upstream `last_message`; **5 checks green + Sonar exit 0**.
- **Human validation**: PR is DRAFT; user merges. §5 gate unchanged.
- **What NOT to do**: do not export `MAS_MOCK_LLM` globally; do not touch `packages/core/src/providers/`; do not write `data/memory/`; do not make the loop unbounded; do not apply diffs (propose only).

## 10. Re-audit

Re-audit at the **0c gate** (when the Evaluator agent is promoted to Tier A) — confirm the 0b loop is the seam 0c's `agent-evaluator` plugs into, and that `maxReviewIterations` tuning held under real runs.
