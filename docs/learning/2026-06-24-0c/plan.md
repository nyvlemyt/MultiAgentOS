# Phase 9 · Wave 0c — Tier A roster at best level — PLAN

> Branch `phase/9c-roster` (cut from tip A `d3cd68e`). Cycle: prepare → do →
> self-verify → Checker → cross-Reviewer (dogfood the promoted evaluator) → gate.
> PR **DRAFT only**, base `phase/9-audit-0a0b`. Never merge (CAMPAIGN §4).

Pre-flight (§12/§13) done by the orchestrator: read `docs/knowledge/vibeflow/agents-skills.md`
**RES-043 agent-as-judge** (4-field auditor template; producer never validates its
own output) + all code seams (`dispatch.ts`, `reviewers.ts`, `core/llm.ts`,
`registry.ts`, every shipped fiche). No new framework. No PAYG. ≤7 tools/agent.

## 0. Exit criteria (binary — CAMPAIGN §5 "Sortie 0c")

- [ ] **C1** `agent-evaluator` promoted to a complete **Tier A fiche** (`packages/agents/fiches/agent-evaluator.md`), every §2 mandatory key filled incl. `escalate_when`, RES-043 lineage, avatar present.
- [ ] **C2** Evaluator **wired into the 0b loop** as a rubric judge (`realAgentEvaluator` in `reviewers.ts`, called in `dispatch.ts runReviewPhase`), **distinct** from the QC/Reviewer/Sec gates (non-blocking, logged as `agent_evaluation`). Green test proves the event fires.
- [ ] **C3** **Planner / orchestrator separated**: `mission-planner` stays the one-shot DAG author; new `orchestrator.md` fiche governs the dispatch loop (claim, budget, §5 gates, eval-loop steering). Both complete fiches + avatars.
- [ ] **C4** **U3** — `validateFiche()` added to `registry.ts`; `loadTierAFiches` rejects any fiche missing a mandatory key; all 9 shipped fiches pass (reviewer/sec-reviewer gain the missing `limits` key). Test proves rejection + all-pass.
- [ ] **C5** **U2** — `AGENTS.md` reconciled: §1 Tier-B `58→60`; §3 roster reflects the 9 shipped fiches (adds quality-controller, agent-evaluator, orchestrator); §7 file list + tree updated; §10 references `validateFiche()`.
- [ ] **C6** 5 checks green + `scripts/sonar-pr-issues.sh <pr>` exit 0 + gate OK; Checker PASS + cross-Reviewer PASS.

## 1. Facts established (no re-exploration needed)

- Tier A fiches today: `context-manager, memory-keeper, mission-planner, quality-controller, reviewer, sec-reviewer, skill-router` (7). After 0c: +`agent-evaluator` +`orchestrator` = **9**.
- `reviewer.md` + `sec-reviewer.md` **miss `limits:`** (others have it) — validateFiche would reject → must add.
- `.claude/agents/` = **60** Tier B fiches (AGENTS.md §1 says 58 → drift). `library/` = 32 (§6.bis already correct).
- `ReviewKind = 'reviewer'|'sec'|'qc'|'code'` in `core/src/llm.ts`; `mockVerdictText` synthesizes a parseable `## Verdict` from sentinels. `realQualityController/realReviewer/realSecReviewer/realCodeReviewer` in `reviewers.ts` via `runCritic`.
- `runReviewPhase` (`dispatch.ts:432`): QC gate → (if not BLOCK) sec on high/blocking + reviewer on last task → validated/blocked → close-out ritual.
- `loadTierAFiches` (registry.ts) has no runtime consumer yet (only re-exported) → adding a throw is safe.

## 2. Work items (TDD red→green, commit per item)

### Item A — core: evaluator review kind  (`packages/core/src/llm.ts`)
1. Add `'evaluator'` to `ReviewKind` + `REVIEW_KIND_LABEL` (`evaluator: 'agent-eval'`).
2. `mockVerdictText` already keys off label — no branch change; new kind flows through.
3. RED: extend `mock-llm-verdict.test.ts` — `mockVerdictText('evaluator', …)` contains `agent-eval` + maps `[needs-work]`→NEEDS_WORK, default→PASS.

### Item B — reviewers: the evaluator critic  (`packages/agents/src/reviewers.ts`)
1. Add `'agent-evaluator'` to `FICHE_FALLBACK` (one-line 5-axis rubric précis).
2. `export async function realAgentEvaluator(llm, {taskId, brief, lastMessage})` → `runCritic` with `ficheId:'agent-evaluator'`, `reviewKind:'evaluator'`.
3. RED: `reviewers.test.ts` — evaluator returns a parseable verdict; `[needs-work]` → NEEDS_WORK.

### Item C — dispatch wiring  (`packages/agents/src/dispatch.ts`)
1. Import `realAgentEvaluator`. In `runReviewPhase`, in the non-QC-BLOCK branch after the reviewer, run the evaluator on `lastTask`, log `agent_evaluation` (agentId `agent-evaluator`, payload = verdict). **Non-blocking** — does NOT flip mission to blocked (distinct from gates; it is the transverse rubric judge, RES-043 4th layer = audit, advisory).
2. RED: new `dispatch-evaluator.test.ts` — after a mission completes review, an `agent_evaluation` event exists for the mission.

### Item D — validateFiche guard  (`packages/agents/src/registry.ts`)  [U3]
1. `const MANDATORY_FICHE_KEYS` = the §2 schema keys (id…escalate_when).
2. `export function validateFiche(fiche): string[]` → list of missing/empty mandatory keys.
3. `loadTierAFiches` calls it per fiche; throws an aggregated `Error` if any invalid (fiche path + missing keys). Non-array/empty `escalate_when`/`limits`/`responsibilities` count as missing.
4. RED: new `registry.test.ts` — a synthetic fiche missing `escalate_when` → non-empty errors; **all real shipped fiches → 0 errors** (regression guard).

### Item E — fiches + avatars
1. `fiches/agent-evaluator.md` (Tier A, id `agent-evaluator`): full §2 schema, RES-043 lineage, 5-axis rubric, deliver/fix/redo verdict, `## Verdict` output block matching `parseVerdict`, ≤7 tools, read-only, `escalate_when`. ≤200 lines / ≤10 process steps / no framework body (agents-skills.md:56 coherence test).
2. `fiches/orchestrator.md` (Tier A, id `orchestrator`): governs the dispatch loop — task claim, budget enforcement, §5 risk gates, eval-loop steering, routes Tier A↔Tier B via the dispatcher; never plans (planner's job), never executes (Tier B's job).
3. Edit `fiches/mission-planner.md`: tighten role to **one-shot DAG author**; remove any loop/dispatch language (move to orchestrator); note the hand-off.
4. Add `limits:` to `reviewer.md` + `sec-reviewer.md` (schema completeness, unblocks validateFiche).
5. Avatars `avatars/agent-evaluator.svg` + `avatars/orchestrator.svg` (same 32×32 stroke style as existing).

### Item F — AGENTS.md reconciliation  [U2]
- §1: `58 fiches` → `60 fiches`.
- §2: note all mandatory keys (incl. `escalate_when`) are enforced at load by `validateFiche()`.
- §3: retitle to the **shipped** Tier A roster; add rows quality-controller, agent-evaluator, orchestrator; mission-planner role = one-shot DAG; add orchestrator as loop owner.
- §4: mark quality-controller "(shipped — see §3)" so it isn't double-counted as future.
- §7: add the 9 fiches + 9 avatars to the tree; note registry.ts runs `validateFiche`.
- §10: keep the rule, point it at `validateFiche()` (now true).

### Item G — reports
`docs/learning/2026-06-24-0c/{build-report.md, checker-verdict.md, reviewer-verdict.md}`.

## 3. Guardrails (CAMPAIGN §4)
PR DRAFT only; never merge `main`; never `--force`; never delete a branch (§5).
§11 no `@anthropic-ai/sdk`, don't touch `providers/`. §8 no `data/memory/` write.
§12 knowledge consulted before fiches. Loops bounded. Quality > quantity.

## 4. Hard-stop + report
§5 guard trips · budget 80% · a Checker/Reviewer cannot reach PASS in the bounded loop.
On stop: write build-report + verdicts, leave the DRAFT stack, resume in a fresh session.
