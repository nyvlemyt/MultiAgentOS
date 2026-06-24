# Phase 9 · Étape 0b — Real doer/checker pipeline — CHECKER VERDICT

> Checker pass against `docs/learning/2026-06-24-0b-preflight/plan.md`, the ROADMAP
> Phase 9 · 0b section, and CLAUDE.md (§5/§7/§8/§11/§12). READ-ONLY review on
> branch `phase/9b-pipeline` (HEAD `c925fc0`). Not pushed.

## Verdict: **PASS**

The binary 0b exit criterion is met, all four official patterns are wired correctly,
every guardrail holds, and the 4 local checks are green. The two deferrals (plan §2.8
implemented-not-deferred; intake-gate out-of-scope) are **acceptable**. Check 5 (Sonar)
is not-yet-runnable (branch not pushed, no PR) — that is by design per the plan, not a
fault; it remains a gating item the orchestrator must clear before merge.

## The 4 local checks (run by the Checker)

| Check | Result | Numbers |
|---|---|---|
| `pnpm -r test` | **PASS** | core 106 · db 15 · skills 28 · memory 87 · agents 114 · web 143 · worker 8 → **501 tests / 87 files / 0 failures** |
| `pnpm lint` | **PASS, exit 0** | `lint-no-sdk-payg.sh` PASS (no forbidden provider SDK imports, §11/§11.bis); all `tsc --noEmit` projects Done |
| `pnpm build` | **PASS, exit 0** | all packages + `apps/web` build Done (route table emitted) |
| `pnpm --filter @mas/web smoke` | **PASS** | **32 passed** (39.9s) |

## Exit-criterion verification

### (a) producer → real critic → bounded correction loop — CONFIRMED
- Loop in `dispatch.ts:722` `runDelegatedTask`: `for (let iteration = 1; iteration <= MAX_REVIEW_ITERATIONS && review && !review.approved; iteration++)`.
- Cap constant `MAX_REVIEW_ITERATIONS = 2` at `dispatch.ts:659` — a plain const, **never env-read** (grep confirmed no `process.env` read for it).
- Task-budget break at `dispatch.ts:724`: `if (spentTokens + lastSpend > (next.budgetTokens ?? Number.MAX_SAFE_INTEGER)) break;` — dual circuit breaker (iteration cap AND budget), per `production-patterns.md:101`.
- No unbounded loop (`while(true)`/`for(;;)`/`while(!`) anywhere in `dispatch.ts` (grep clean).
- `dispatch-eval-loop.test.ts` asserts `review_iteration` count is `>=1 && <=2`, task still `done`, and the last `tier_b_review` records `approved:false` (the §5 human gate owns the final call). PASS.

### (b) no mock critic in the mission doer/checker review path — CONFIRMED
- grep of `mockReviewer|mockSecReviewer|mockQualityController|mockCodeReviewer|mockRealityChecker` returns **NONE** in `dispatch.ts` + `review-gate.ts` (the doer/checker path). `runDelegatedTask`/`runReviewPhase` call only `realReviewer/realSecReviewer/realQualityController/realCodeReviewer` + the deterministic `realityCheck`.
- Remaining occurrences are exactly the documented allowed exceptions: `llm.ts` (kept exports = fallback), `intake-gate.ts` (separate Phase-4.5 subsystem, out of scope, untouched in the branch diff), and core unit tests (`sec-reviewer.test.ts`, `quality-controller.test.ts`, `review-mocks.test.ts`, `dispatch.test.ts` comment).
- The `parseVerdict` NEEDS_WORK fallback exists and is exercised (`reviewers.test.ts` "fail-safes unparseable text to NEEDS_WORK"). PASS.

### (c) dependent tasks receive upstream `last_message` — CONFIRMED
- Injection: `upstreamResults(db, next)` (`dispatch.ts:409`) reads each `dependsOn` task's persisted `last_message` from the `task_done` event payload (via `lastMessageFor`, `dispatch.ts:394`), built into `### Upstream results:` and injected in `executeTaskWithLLM` (`dispatch.ts:816`) — into the user prompt (raw path, `runRawTask:777`) and skillContext (delegated path, `runDelegatedTask:682`).
- Persistence: `persistTaskDone` writes `lastMessage: resp.text.slice(0, LAST_MESSAGE_MAX=2000)` on the `task_done` event (`dispatch.ts:595`) — no schema migration (lower-risk plan §2.9 option).
- Test: `dispatch-chaining.test.ts` — a 2-task chain where t2's producer prompt contains t1's distinctive marker AND the upstream task title; t1's prompt does not. PASS.

## Plan §2 / §3 / §4 point-by-point

| Point | Status | Note |
|---|---|---|
| §2.1 keep mocks, add real critics | ✅ confirm | mock critic fns stay exported in `llm.ts`; intake-gate consumer untouched |
| §2.2 real critics = LLM delegation to fiches | ✅ confirm | `reviewers.ts` loads `fiches/{reviewer,sec-reviewer,quality-controller}.md` via `loadFiche` (fileURLToPath + readFileSync, catch → `FICHE_FALLBACK`), system = `[fiche, COVERAGE_PROMPT, VERDICT_FORMAT]`, model `claude-sonnet-4-6` |
| §2.3 determinism seam | ✅ confirm | `reviewKind?` on `LLMRequest`; `mockLLM()` review-aware via `mockVerdictText`; both vi.mock'd `claudeCodeLLM` clients (`dispatch.test.ts`/`dispatch-delegate.test.ts`) branch on `req.reviewKind → actual.mockVerdictText`; kind labels embedded (`code-review`/`reality-check`/`quality-control`/`sec-review`/`review`); `- [block]` finding line present |
| §2.4 parseVerdict contract | ✅ confirm | parses `## Verdict` + first token; maps NEEDS_CHANGES→NEEDS_WORK; fail-safe NEEDS_WORK on no header (never silent PASS); findings parsed; unit-tested |
| §2.5 Reality Checker deterministic (no LLM) | ✅ confirm | `review-gate.ts`: `evidence = diffValid && (testsCited || diffCoversRequest)`; PASS iff `diffApplies && all PASS`; documented inline; `reality-check` substring kept; new signature drops `evidence:boolean`, adds `llm/taskBrief/lastMessage/taskRisk` |
| §2.6 evaluator-optimizer loop | ✅ confirm | see (a); findings injected via `findingsBlock` (`### Reviewer findings to address:`); each retry billed once, sum charged via `billedResponse`; `review_iteration` event logged |
| §2.7 real runReviewPhase | ✅ confirm | `realQualityController` → `realSecReviewer` (high/blocking) → `realReviewer` (last task); event order/types preserved (`quality_control_verdict` before `review_verdict`); QC-BLOCK short-circuit intact; `quality-controller-wiring.test.ts` green |
| §2.8 plan-time sec | ✅ confirm (implemented) | `realSecReviewer(planLlm, …)` in `planMission` risk fallback, consulted only on `classified.needsLLMFallback`; marked inline as plan-time heuristic not the gate; `risk-classify-wiring.test.ts` (rm rule) green — judged **acceptable** |
| §2.9 prompt chaining | ✅ confirm | see (c) |
| §3 file change list | ✅ confirm | all listed files present/changed; `index.ts` exports `reviewers` + `review-gate` |
| §4 TDD order (steps 1–9) | ✅ confirm | commit log shows one feat commit per step (parseVerdict → mockLLM → real critics → gate → runReviewPhase → loop → chaining → plan-time sec → report); 4 checks green |

## Invariants (grepped)

- §11 no `@anthropic-ai/sdk` anywhere (excl api-fallback) — **NONE found, clean**.
- `packages/core/src/providers/` not in `git diff main..HEAD --name-only` — **untouched, clean**.
- No `data/memory/` writes added — diff hits are docs/comments only; runtime writes go to `data/outputs/` — **clean**.
- `MAS_MOCK_LLM` only read in `selectLLM` (`dispatch.ts:157`); all test assignments are per-test `process.env` set/delete — **never exported globally, clean**.
- §5 risk gate `pauseForRiskGate` fires at `dispatch.ts:878` BEFORE `executeTaskWithLLM` (882) and thus before any LLM call — **intact**.
- Bounded loop only — **clean** (see (a)).
- Determinism: `loadBlockedWindows`/`buildMissionLLM`/`runReviewPhase` take explicit `now: Date` — no buried `Date.now()` in logic.

## Sonar-recurring-rules adherence (proactive scan)

- S5852 disjoint regex: `VERDICT_RE`/`FINDING_RE` (reviewers.ts) and `TEST_CITED_RE` (review-gate.ts) documented as disjoint — no super-linear backtracking. OK.
- S1192 hoisted literals: `OUTPUTS_DIR`, `WINDOW_TTL_MS`, `LAST_MESSAGE_MAX`, `FINDINGS_HEADER`, `REVIEW_KIND_LABEL`, sentinels — all hoisted. OK.
- S2871 `.sort()` comparators: both `.sort()` in dispatch.ts use `(a,b)=>...getTime()`. OK.
- S3735 void promise: only `logEventDetached(): void` return annotation + the `.then(undefined,()=>undefined)` detach pattern (plan-endorsed). OK.
- S5443 `/tmp` literals: none in changed src (tests use `join(tmpdir(),…)`). OK.
- S5906 generic assertions: no `.toBeTruthy()`/`.toBeFalsy()` in the 5 new/changed test files. OK.
- S7776 Set membership: `doneIds`/`new Set(...)` used in `selectRunnableTasks`. OK.

## Findings (3 total — all LOW/INFO, none blocking)

1. **[info] Check 5 (Sonar) not yet verifiable.** Branch is not pushed and no PR exists, so `scripts/sonar-pr-issues.sh <pr>` could not be run. This is by design (the orchestrator pushes + opens the DRAFT PR, then clears Sonar). It remains a **gating prerequisite to merge** — exit 0 (0 open issues, 0 to-review hotspots) AND gate OK still required.
2. **[low] Sentinel collision is test-only, but worth a note.** A real producer's `last_message` that literally contained `[needs-work]`/`[qc-block]`/`risk=blocking` would, under the `mockLLM` seam only, synthesize a non-PASS verdict. This cannot happen with the real `claudeCodeLLM` (it ignores `reviewKind`; the fiche `## Verdict` drives the result), so production is unaffected. No change needed; documented here for completeness.
3. **[info] Eval-loop budget estimate uses the prior iteration's spend as the next estimate** (`lastSpend = outcome.response.inputTokens + outputTokens` before the retry). This is a reasonable conservative heuristic for a circuit breaker and is bounded regardless by the iteration cap; acceptable. No action.

## Deferrals — judged acceptable

- **§2.8 plan-time sec: IMPLEMENTED via `realSecReviewer`** (the plan permitted either implement-or-keep-mock-with-note). It is consulted only on classifier abstention, marked inline as the plan-time heuristic (not the doer/checker gate), and the only wiring test drives the deterministic `rm` rule — green. **Acceptable, not a BLOCK.**
- **`intake-gate.ts` left untouched (out of 0b scope).** It is the separate Phase-4.5 knowledge-intake gate, not the mission doer/checker path; it keeps importing the kept `mockSecReviewer` by design (plan §2.1), 7 tests green. **Acceptable, not a BLOCK.**

## Recommendation

Proceed: push the branch, open the **DRAFT** PR (user merges), then run Check 5
(`scripts/sonar-pr-issues.sh <pr>` exit 0 + `qualitygates/project_status == OK`) on the
HEAD sha. If Sonar is clean, this is merge-ready pending human approval. No source changes
are required from this review.

```json
{
  "verdict": "PASS",
  "findings": [
    { "severity": "info", "message": "Check 5 (Sonar) not yet runnable — branch unpushed, no PR; gating prerequisite to merge (exit 0 + gate OK still required)." },
    { "severity": "low", "message": "Sentinel collision in mockLLM verdict synthesis is test-seam-only; real claudeCodeLLM ignores reviewKind so production is unaffected. Documented, no change needed." },
    { "severity": "info", "message": "Eval-loop budget estimate reuses the prior iteration's spend as the next estimate — conservative and bounded by the iteration cap; acceptable." }
  ]
}
```
