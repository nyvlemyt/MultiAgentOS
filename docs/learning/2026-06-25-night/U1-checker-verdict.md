# U1 Checker Verdict — split of `dispatch.ts` (review-phase extraction)

**VERDICT: PASS**

- **Branch / commit:** `phase/9c-roster` @ `c19dcca`
- **Scope:** behaviour-preserving split of `packages/agents/src/dispatch.ts`
  (1026 → 690 L) into `mission-events.ts`, `mission-llm.ts`, `review-phase.ts`.
- **Discipline:** mas-reviewer (coverage over filtering). Adversarial pass:
  diffed every moved body against the parent (`c19dcca^`), not just "tests pass".
- **Method:** read all 4 files + every `./dispatch` importer; extracted the
  pre-split `dispatch.ts` to `/tmp` and ran whitespace/comment-normalized diffs
  on the moved functions; ran the agents suite + §11 PAYG guard.

## 7-point checklist

| # | Check | Result | Evidence |
|---|-------|--------|----------|
| 1 | `blocked` from `qc.verdict` + `verdicts[]` only; ternary reason equivalent to original mutable `blockReason` | **PASS** | `review-phase.ts:93` `blocked = qc.verdict==='BLOCK' \|\| verdicts.some(BLOCK)` — byte-identical to orig `dispatch-orig.ts:516`. `review-phase.ts:95` `reason = qc.verdict==='BLOCK' ? 'quality_control_block' : 'review_block'`. Orig (`:477,478,513`) defaults `blockReason='quality_control_block'`, sets `'review_block'` **only inside** `if (qc.verdict!=='BLOCK')`. So orig reason is `'quality_control_block'` **iff** QC BLOCK, else `'review_block'` — the ternary reproduces it exactly. A `verdicts[]` BLOCK can only arise when QC did **not** BLOCK (`review-phase.ts:25` returns early on QC BLOCK, before any `verdicts.push`), so the `verdicts.some(BLOCK)` branch is always reached with `reason='review_block'` — matches orig. `reason` read only inside `if(blocked)` (`:94-97`), same as orig. |
| 2 | Agent-Evaluator stays ADVISORY (logged `agent_evaluation`, never in `verdicts[]`, best-effort try/catch) | **PASS** | `review-phase.ts:50-59`: inside `if(lastTask)` after `verdicts.push(rev)` (`:42`); `try { realAgentEvaluator → logEvent type:'agent_evaluation' } catch { logEvent type:'agent_evaluation_error' }`. No `verdicts.push` of the evaluation anywhere (grep: only `sec`+`rev` pushed). Identical to orig `:502-511`. |
| 3 | Every prior public export of `dispatch.ts` still resolves | **PASS** | Orig public exports = `type Db`, `loadBlockedWindows`, `planMission`, `runMission`, `archiveMission`, `executeNextTask`, `resumeAfterValidation`, `listDispatchableMissions`. New `dispatch.ts:42` `export { loadBlockedWindows, type Db }` + the 6 fn exports retained (`:59,163,173,518,573,684`). `router-persist.test.ts:10` `import { loadBlockedWindows, type Db } from './dispatch'` resolves; `index.ts:2` `export * from './dispatch'` resolves. No moved symbol (`logEvent`/`selectLLM`/`memoryContextFor`/etc.) was ever exported from orig — all internal — so no surface lost. Suite 125/125 green incl. `router-persist`. |
| 4 | `dispatch.ts` < 800 L; `runReviewPhase` body < 50 L | **PASS** | `dispatch.ts` = **690** L (`grep -c`). `runReviewPhase` body = **48** L (`review-phase.ts:65–112`, signature `:64`, close `:113`). |
| 5 | Import graph acyclic: events ← llm ← review-phase ← dispatch; no module imports back into dispatch | **PASS** | `mission-events.ts` imports only `node:crypto`/`drizzle-orm`/`@mas/db` (leaf, no local). `mission-llm.ts:27` ← `./mission-events` only. `review-phase.ts:5,6,7` ← `./mission-events`+`./mission-llm`+`./reviewers`. `dispatch.ts:31,32,39` ← all three. Grep of `from './dispatch'` importers = tests + `dispatch-tick`/`index`/`autopilot` only — **none of the 3 new modules import `./dispatch`**. Acyclic. |
| 6 | No unused imports in `dispatch.ts` (Sonar S1128) | **PASS** | Per-symbol occurrence scan of all 41 imported names in `dispatch.ts`: every symbol appears ≥2× (import + ≥1 use). Same scan clean on all 3 new modules (events/llm/review-phase). |
| 7 | No behaviour change to mission-status outcomes (reason about moved code) | **PASS** | `runReviewPhase` orchestration (atomic `review` claim, `lastTask` sort, project select, `buildMissionLLM`, blocked→`'blocked'` else `'validated'`, close-out ritual try/catch) byte-identical to orig `:438-535`. `runCriticGates` statements identical to orig critic block modulo the `if/return` inversion (item 1) — same `verdicts[]` contents. `loadBlockedWindows`/`buildMissionLLM` bodies diff-clean vs orig (exit 0). Suite 125/125 incl. `dispatch-evaluator`, `quality-controller-wiring`, `dispatch-routing`, `memory-injection`, `language-wiring`. |

## Findings

- **No regressions found.** The QC-BLOCK short-circuit was refactored from a
  `let blockReason` + guarded `if` into an early `return { qc, verdicts }`
  (`review-phase.ts:25`) plus a derived ternary in the caller (`:95`). I verified
  the two encodings are logically equivalent under every QC/verdict combination,
  including the load-bearing invariant that a `verdicts[]` BLOCK is unreachable
  when QC BLOCKs (QC BLOCK returns before any push).
- **Moved bodies are mechanical.** `loadBlockedWindows` and `buildMissionLLM`
  diff to zero against the parent (only `export`/blank-line scaffolding differs).
  `runReviewPhase` and the critic sequence are statement-identical except the
  intended short-circuit inversion.
- **§11 PAYG guard:** PASS (`scripts/lint-no-sdk-payg.sh` — no forbidden SDK
  imports in the 3 new files).
- **Non-blocking note (pre-existing, NOT this commit):** raw `tsc -p
  packages/agents/tsconfig.json` reports `TS2532` strict-null noise in several
  `*.test.ts`. This commit touched **0** test files (`git diff-tree`), the
  `@mas/agents` package exposes no `lint`/`build`/`typecheck` script wired to
  that tsconfig (the gate is `pnpm -r lint` + `@mas/web build` + vitest + smoke +
  Sonar), and the 4 refactored production files compile clean. Not attributable
  to and not widened by this refactor.
- **Verification scope caveat:** I ran the `@mas/agents` suite (125/125) + the
  PAYG guard locally. The full 5-check gate (repo `pnpm -r test` 513, `pnpm
  lint`, `@mas/web build`, smoke 32/32, Sonar exit 0) is asserted by the producer
  in the backlog Resolution block; I did not independently re-run web build /
  smoke / Sonar. They are orthogonal to this agents-only mechanical move and the
  producer's claim is consistent with a 0-test-file, behaviour-preserving diff.

## Bottom line

Logically equivalent, acyclic, export-complete, under threshold, advisory contract intact — **PASS** with high confidence.
