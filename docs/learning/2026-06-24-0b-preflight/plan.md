# Phase 9 · Étape 0b — Real doer/checker pipeline — BUILD PLAN

> Branch: `phase/9b-pipeline` (already created off `main` @ `ce04cf9`). PR = **DRAFT** (user merges).
> Method: `docs/learning/AUTONOMOUS-PIPELINE.md`. Intake decision: `docs/intake/2026-06-24-0b-real-pipeline.md` (`adapt_now`).
> "Done" = **5 checks green + Sonar exit 0**. Read `docs/knowledge/sonar-recurring-rules.md` before writing code.

## 0. Goal (0b exit criterion — the binary DoD)

A mission task executes **producer → real critic → on NEEDS_WORK/BLOCK, a bounded correction loop**; **no mock critic remains in the mission doer/checker review path**; **dependent tasks receive upstream context** (`last_message`). All under the locked stack, §5/§8/§11 intact, bounded loops (no runaway quota).

## 1. The four official patterns we are wiring (doctrine, already distilled)

- **Evaluator-Optimizer** (`anthropic-ecosystem.md:170`) — output → critique → bounded retry.
- **Prompt Chaining** (`anthropic-ecosystem.md:166`) — upstream output → downstream input.
- **Bounded loop / circuit breaker** (`production-patterns.md:101-106`) — `maxReviewIterations` + per-task budget. A loop **MUST** be bounded; an unbounded "loop until satisfied" is a KILL criterion.
- **Coverage review prompt** (`prompting-anthropic.md:104-110`) — "report every issue incl. uncertain/low-severity; a separate verify step filters." Use verbatim in the reviewer system prompt.

## 2. Architecture decisions (READ FIRST — these resolve the hard parts)

### 2.1 Keep the mock functions; ADD real critics
`mockReviewer/mockSecReviewer/mockQualityController/mockCodeReviewer/mockRealityChecker` in `packages/core/src/llm.ts` **stay exported** — they remain (a) the deterministic fallback when a critic LLM returns unparseable text, and (b) the gate used by `intake-gate.ts` (a **separate Phase-4.5 knowledge-intake subsystem**, NOT the mission doer/checker path → **out of 0b scope**, leave it untouched and documented). 0b **rewires the mission review path** to call the new real critics.

### 2.2 Real critics = LLM delegation to the Tier-A fiches
New module **`packages/agents/src/reviewers.ts`** exporting:
- `realReviewer(llm, ctx)` — loads `packages/agents/fiches/reviewer.md`, model `claude-sonnet-4-6`.
- `realSecReviewer(llm, ctx)` — loads `fiches/sec-reviewer.md`, maps `NEEDS_CHANGES`→`NEEDS_WORK`.
- `realQualityController(llm, ctx)` — loads `fiches/quality-controller.md`.
- `realCodeReviewer(llm, ctx)` — uses the `reviewer` fiche (AGENTS.md §6 code-review lens) for the Tier-B diff gate.
- shared `parseVerdict(taskId, text): ReviewerVerdict` (see 2.4).
- a fiche loader mirroring `delegate.ts loadPreface()` (try `fileURLToPath(import.meta.url)` → `../fiches/<id>.md`, `catch` → inline fallback string) so the Next bundler degradation is handled the same way.

Each real critic builds the system prompt = `[ficheBody, COVERAGE_PROMPT, VERDICT_FORMAT_INSTRUCTION]` and the user prompt = the artifact to judge (task brief + diff/`last_message` + injected prior findings on a re-loop). It calls `llm.call({system, user, model:'claude-sonnet-4-6', mode, reviewKind:'<kind>'})` and returns `parseVerdict(...)`.

### 2.3 The determinism seam (THE critical mechanism — get this right)
CI runs with **no live model**. Two test modes exist; both must stay green:
- **`MAS_MOCK_LLM=1`** → `selectLLM` returns `mockLLM()` (e.g. `quality-controller-wiring.test.ts`).
- **vi.mock('@mas/core') of `claudeCodeLLM`** → a hand-rolled client (e.g. `dispatch.test.ts`, `dispatch-delegate.test.ts`).

Add an optional field to `LLMRequest` in `llm.ts`: **`reviewKind?: 'reviewer' | 'sec' | 'qc' | 'code'`**. The real critics set it. Make **`mockLLM()` review-aware**: when `req.reviewKind` is set, return text that is a parseable verdict synthesized from sentinels in `req.user`:
- contains `[qc-block]` → `## Verdict\nBLOCK` (+ a `- [block] ...` finding) — preserves the `quality-controller-wiring` BLOCK test.
- contains `[sec-block]` or `risk=blocking` → `BLOCK`.
- contains `[needs-work]` → `NEEDS_WORK`.
- else → `PASS`.
The finding line MUST embed the kind label so message-substring asserts work (e.g. `code-review` for `reviewKind:'code'`, `quality-control` for `qc`, `sec-review` for `sec`, `review` for `reviewer`).
For the **vi.mock claudeCodeLLM** clients in `dispatch.test.ts` / `dispatch-delegate.test.ts`, update each mock's `call` to branch on `req.reviewKind` and return the same verdict markdown (else the existing producer/exec text). The real `claudeCodeLLM` ignores `reviewKind`; the fiche's `## Verdict` instruction drives the real verdict.

### 2.4 `parseVerdict` contract
Parse `## Verdict` then the first `PASS|NEEDS_WORK|NEEDS_CHANGES|BLOCK` token; map `NEEDS_CHANGES`→`NEEDS_WORK`. Parse `- [block|warn|info] <msg>` lines into `findings`. **Fail-safe**: if no `## Verdict` is found → return `NEEDS_WORK` with a warn finding (`could not parse verdict — defaulting to NEEDS_WORK`). NEVER silent-PASS on unparseable. (Under the deterministic test mock this path is not hit because the mock always emits a `## Verdict`.)

### 2.5 Reality Checker = deterministic (NO LLM)
Replace `mockRealityChecker(evidence:boolean)` in `review-gate.ts` with real evidence computed from the diff + producer output:
- **diff-applies** — reuse `validateDiffApplies(diff, repoDir).ok` (already real).
- **tests-cited** — the diff or `last_message` touches/names a test file (`*.test.ts`, `*.spec.ts`, or `describe(`/`it(`).
- **diff-covers-request** — diff is non-empty AND touches ≥1 path/keyword from the task title/description (simple token overlap heuristic).
`reviewProducedDiff` signature changes: drop `evidence:boolean`, add the producer artifact (`lastMessage: string`, `taskBrief: {title,description}`) + the `llm` + `taskRisk`. Compute `evidence = diffApplies && (testsCited || diffCoversRequest)` (document the rule inline). Verdict: PASS iff `diffApplies && evidence`; else NEEDS_WORK. Keep a `reality-check` substring in the finding message (dispatch-delegate test asserts it). The Code Reviewer in the gate becomes `realCodeReviewer(llm, ...)` (keep a `code-review` substring).

### 2.6 Evaluator-Optimizer loop in `runDelegatedTask` (`dispatch.ts` ~516-566)
After `gateProducedDiff`, if `review.approved === false` (NEEDS_WORK/BLOCK), **re-invoke `delegateWithDiff`** with the prior findings injected into the task description/skillContext (`### Reviewer findings to address:\n- ...`). Bound the loop by **`maxReviewIterations` (default 2)** AND the task budget (`stop if spentTokens + nextEstimate > task.budgetTokens`). Log each iteration as a `review_iteration` event (payload: iteration#, approved, verdicts). After the last iteration: persist the best diff; if still not approved, the task still completes but the gate result records `approved:false` (the §5 human gate / mission review decides). Keep the single-bill guarantee: each `delegateWithDiff` is billed once; the loop bills per iteration (bounded). Add a `maxReviewIterations` field plumbed from a constant (default 2) — do NOT read env globally.

### 2.7 Real `runReviewPhase` (`dispatch.ts` ~330-393)
Obtain an `LLMClient` via the existing `selectLLM({...})` (same opts as `executeTaskWithLLM`; project autonomy/cwd/session). Replace:
- `mockQualityController(...)` → `await realQualityController(llm, {taskId, taskTitles: all.map(t=>t.title), ...})`.
- `mockSecReviewer(...)` → `await realSecReviewer(llm, {taskId, risk, brief})` for each high/blocking task.
- `mockReviewer(...)` → `await realReviewer(llm, {taskId, brief, lastMessage})` on the last task.
Keep the event types/order identical (`quality_control_verdict` before `review_verdict`; sec on high/blocking). Keep QC-BLOCK short-circuit. The `quality-controller-wiring.test.ts` order + status asserts MUST stay green.

### 2.8 Plan-time sec fallback (`dispatch.ts` ~273)
Convert `mockSecReviewer` → `realSecReviewer(llm, ...)` using a `selectLLM`-built client inside `planMission`. Under the deterministic mock this yields PASS unless a `[sec-block]`/`risk=blocking` sentinel is present → preserves current behavior (the only wiring test, `risk-classify-wiring`, triggers the `rm` rule deterministically, not this LLM fallback). If threading an LLM into `planMission` proves invasive, this single site MAY stay `mockSecReviewer` with an inline `// 0b: plan-time risk heuristic, not the doer/checker gate` note — document the choice in the build report. Primary scope is the review/gate path.

### 2.9 Prompt chaining (`dispatch.ts` `selectRunnableTasks` ~321-328 + `executeTaskWithLLM`)
A dependent task must receive its upstream tasks' `last_message`. The producer's text is the LLM response; persist it: on `persistTaskDone`, store the response text (truncated, e.g. ≤2k chars) — either in a new nullable `tasks.lastMessage` column (Drizzle migration; mirror existing column style; regenerate snapshot per the drizzle chain guard) OR in the `task_done` event payload (`lastMessage`) read back via events (no migration — **prefer this, lower risk**). In `executeTaskWithLLM`, before building the producer/critic prompt, fetch the `last_message` of each `dependsOn` task (from the `task_done` events) and inject as `### Upstream results:\n<taskTitle>: <lastMessage>` into the user prompt (raw path) and `memoryText`/`skillContext` (delegated path). Add a test: a 2-task chain where t2's prompt contains t1's output.

## 3. File-by-file change list

| File | Change |
|---|---|
| `packages/core/src/llm.ts` | Add `reviewKind?` to `LLMRequest`; make `mockLLM()` review-aware (sentinel→`## Verdict`). Keep all mock critic fns. |
| `packages/agents/src/reviewers.ts` **(new)** | `realReviewer/realSecReviewer/realQualityController/realCodeReviewer` + `parseVerdict` + fiche loader + `COVERAGE_PROMPT`/`VERDICT_FORMAT` consts. |
| `packages/agents/src/review-gate.ts` | Deterministic real evidence; `realCodeReviewer` for the diff; new signature (drop `evidence:boolean`). |
| `packages/agents/src/dispatch.ts` | Real `runReviewPhase`; evaluator-optimizer loop in `runDelegatedTask`; prompt-chaining inject; plan-time sec (2.8); pass `llm` where needed. |
| `packages/agents/prompts/` | (optional) extract the reviewer coverage/format prompt to a `.md` like `tier-b-system.md`, with inline fallback. |
| Tests | Update `review-gate.test.ts`, `dispatch-delegate.test.ts`, `dispatch.test.ts` (verdict-aware mocks); ADD `reviewers.test.ts` (parseVerdict units + each real critic under mock), `dispatch` evaluator-loop test, prompt-chaining test. Keep `quality-controller-wiring.test.ts`, `risk-classify-wiring.test.ts`, `intake-gate.test.ts` GREEN. |

## 4. TDD order (red → green, commit each, Conventional Commits ≤60 chars)

1. `parseVerdict` + `reviewers.ts` skeleton (unit tests: PASS/NEEDS_WORK/NEEDS_CHANGES→NEEDS_WORK/BLOCK/unparseable→NEEDS_WORK).
2. Review-aware `mockLLM` + `reviewKind` field (unit test: sentinel→verdict).
3. Real critics under mock LLM (each returns expected verdict from sentinels).
4. `review-gate.ts` deterministic evidence + `realCodeReviewer` (update its 3 tests to the new signature/behavior; keep `reality-check`/`code-review` substrings + 2-verdict shape).
5. Real `runReviewPhase` (keep `quality-controller-wiring` green; QC-block short-circuit).
6. Evaluator-optimizer loop in `runDelegatedTask` (new test: NEEDS_WORK → re-invoke producer, bounded at 2, `review_iteration` events).
7. Prompt chaining (new test: t2 receives t1 `last_message`).
8. Plan-time sec (2.8).
9. Full `pnpm -r test`, `pnpm lint`, `pnpm build`, `pnpm --filter @mas/web smoke` green.

## 5. Guardrails (HARD — never break)
- **§11**: never import `@anthropic-ai/sdk`; never touch `packages/core/src/providers/`; critics use the injected `LLMClient` only. `scripts/lint-no-sdk-payg.sh` must stay green.
- **§8**: no writes to `data/memory/` (only `data/outputs/` for diffs).
- **§5**: the risk gate (`pauseForRiskGate`) and `intake-gate` blocking path stay intact; the loop never applies a diff or bypasses a human gate.
- Never export `MAS_MOCK_LLM` globally (breaks `dispatch.test.ts` vi.mock seam).
- Bounded loop only (`maxReviewIterations` default 2 + budget). No `Date.now()` buried in logic — pass `now: Date` where time matters.
- Apply `sonar-recurring-rules.md` proactively: `new Set` for membership (S7776), `localeCompare` sorts (S2871), no `void promise` (S3735 — use the `logEventDetached` pattern), `join(tmpdir(),...)` not `/tmp` literals (S5443), disjoint regex quantifiers (S5852), merge duplicate imports (S3863), no redundant `as` (S4325), hoist duplicated string literals (S1192), avoid `use*`/generic-assertion `expect(x).toBeTruthy()` (S5906 — prefer `.toBe(...)`/specific matchers in NEW tests).

## 6. Definition of Done (the 5 checks)
1. `pnpm -r test` — all green.
2. `pnpm lint` — exit 0.
3. `pnpm build` — exit 0.
4. `pnpm --filter @mas/web smoke` — all passed.
5. `scripts/sonar-pr-issues.sh <pr>` — **exit 0** (0 open issues, 0 to-review hotspots) AND gate OK, after pushing the branch + opening the DRAFT PR.
Plus: build report at `docs/learning/2026-06-24-0b/build-report.md`; Checker verdict at `docs/learning/2026-06-24-0b/checker-verdict.md`.
