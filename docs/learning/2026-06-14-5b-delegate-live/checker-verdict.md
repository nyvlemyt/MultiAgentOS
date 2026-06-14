# Checker verdict — 5b · Wire `delegate()` into live execution

Date 2026-06-14 · Branch `phase/5b-delegate-live` · Base `b197981` (main, PRs #1–#12 merged).
Reviewer: Checker (read-only). Scope: `git diff b197981 HEAD` (7 files, +732/-59).

## Verdict: PASS

All five DoD checks are demonstrably green locally, every named plan point landed,
and all six requested invariants hold. One minor finding (a broad post-bill catch)
and one accepted deferral (a pre-existing worker startup flake) — neither blocks.

---

## Local checks (run from repo root)

| Check | Result | Tail / numbers |
|-------|--------|----------------|
| `pnpm -r test` | **PASS** | core 88 · db 13 · skills 11 · memory 41 · agents 68 · worker 4 · web 64 = **289 tests, 0 fail**. `startup.test.ts` passed (no flake this run). |
| `pnpm lint` | **PASS** (EXIT=0) | `PASS: no forbidden provider SDK imports (§11 + §11.bis)` then `tsc --noEmit` Done across all packages. |
| `pnpm build` | **PASS** | `apps/web build: Done` — full Next route table built. |
| `pnpm --filter @mas/web smoke` | **PASS** | `31 passed (28.6s)`. |

5th check (Sonar `scripts/sonar-pr-issues.sh <pr>` exit 0 + gate OK) is correctly
deferred to PR push per instructions — not gradeable here. Code-level Sonar review below.

## Plan-point verification

**Step 1 — surface diff + raw response (`delegate.ts`)** — CONFIRMED.
- `extractDiff(text): string | null` returns the trimmed first-`​```diff` body, else
  null; one hoisted module regex `DIFF_FENCE_RE` (S1192), reused by `parseResponse`
  via `extractDiff(text) !== null`. ✔
- `interface DelegateOutcome { readonly result; readonly diff; readonly response }`
  with `readonly` fields (Sonar). ✔
- `delegateWithDiff` holds the former body; `delegate()` reduced to one line —
  public signature unchanged (`delegate.test.ts` untouched, still green). ✔
- `delegate.with-diff.test.ts` covers diff→patch+non-null, prose→markdown+null,
  `[blocked]`→blocked+null, and `response.inputTokens` surfaced. ✔

**Step 2 — delegation branch + finalize helper (`dispatch.ts`)** — CONFIRMED.
- `OUTPUTS_DIR = 'data/outputs'` hoisted (S1192). ✔
- `persistTaskDone` extracted (sessionId persist + task done/spend + mission spend +
  single `task_done` event with `{ title, sessionId, provider, ...extraPayload }`);
  raw path calls it with the memory-context extraPayload. Pure refactor. ✔
- `executeTaskWithLLM` resolves `delegation = TIER_B_DELEGATION_MAP[next.agentId]` and
  branches to `runDelegatedTask`, else `runRawTask`. ✔
- `runDelegatedTask` → `delegateWithDiff` → (diff + `proj.path`) `gateProducedDiff`
  (writes `<OUTPUTS_DIR>/<id>.patch`, `reviewProducedDiff({evidence:false})`, logs
  `tier_b_review` with verdicts/approved/diffValid/fiche) → `persistTaskDone` with
  `{ delegated, tierBFiche, reviewApproved, diffValid }`. Gate logic lives in its own
  small helper (S3776). ✔
- `dispatch-delegate.test.ts` seeds a low-risk task whose `agentId` is a delegation
  key, drives `executeNextTask` end-to-end, and asserts: one `tier_b_review` event,
  exactly 2 verdicts (a `code-review` message AND a `reality-check` message),
  `diffValid:true`, `fiche` set, task `outputPath` ends `.patch`, status `done`. ✔

**Exit criterion** — MET. A real mission task whose `agentId` maps to
`TIER_B_DELEGATION_MAP` emits a reviewed unified diff carrying both Code-Reviewer +
Reality-Checker verdicts, logged as `tier_b_review`, with an `.patch` outputPath.
`dispatch-delegate.test.ts` is the executable proof (drives `runMission` →
`executeNextTask`, not a unit stub of the helper).

## Invariant checks (grep + read)

1. **No `@anthropic-ai/sdk`** — `grep -rn '@anthropic-ai/sdk' packages/*/src apps/*/src apps/*/app` → NONE. Lint guard prints PASS. ✔
2. **No `data/memory/` writes in new code** — `dispatch.ts`/`delegate.ts` write only to `OUTPUTS_DIR='data/outputs'` (`gateProducedDiff` `mkdirSync`/`writeFileSync`). The `data/memory` hits in dispatch.ts (lines 45/60/72) are a comment + the pre-existing MemoryStore *reader*, not in this diff. §8 lock honored. ✔
3. **§5 risk gate still fires first** — `executeNextTask` checks `next.risk === 'high' || 'blocking'` → `pauseForRiskGate` (dispatch.ts:627) BEFORE calling `executeTaskWithLLM` (line 631). Delegation lives inside `executeTaskWithLLM`, so high/blocking never reach it. ✔
4. **Execution stays Claude-only (§11.bis r4)** — gate uses `evidence:false`; `mockRealityChecker({evidence:false})` returns `NEEDS_WORK` (llm.ts:281,291–294). `approved = diffValid && every verdict PASS` ⇒ an unsubstantiated diff is never auto-approved; the gate is advisory (does not pause). The delegated `llm` is the same `selectLLM()` client — no provider SDK. ✔
5. **No double LLM bill on the bundler fallback** — within `delegateWithDiff`, `loadTierBFiche(agentId)` runs BEFORE `llm.call`. The intended fallback trigger (bundler: `import.meta.url` not a `file:` URL → `loadTierBFiche` throws, mirroring `defaultFichesDir`) therefore throws *pre-bill*, so the catch → `runRawTask` issues the only bill. Safe for the documented case. See finding [minor-1] on the catch breadth. ✔ (with caveat)
6. **`dispatch.test.ts` fixtures preserved** — `git diff` of `dispatch.test.ts` is EMPTY. Fixtures intact: 220 in + 80 out = 300 spend, one `task_done` per task (`spentTokens === 300`, asserted lines 209/245). Note: its planner-seeded tasks t3/t4 DO now route through `runDelegatedTask` (no-diff mock → markdown path), and the suite is still green — confirming `persistTaskDone` preserved the event/spend shape and dispatch.test.ts makes no payload-equality assertions. ✔

## Sonar recurring-rules adherence (code-level)

- **Duplication** — REDUCED as intended: the old inline finalize block (sessionId +
  task done + mission spend + `task_done` event) is now the single `persistTaskDone`,
  called by both paths. Net structural dedup. ✔
- **Hoisted literals (S1192)** — `OUTPUTS_DIR`, `DIFF_FENCE_RE`, `DEFAULT_MODEL`,
  `DEFAULT_MODE`. ✔
- **Negated ternary (S7735)** — `extractDiff` uses `body === undefined ? null : …`
  (positive form), not `!== undefined ?`. ✔
- **No nested ternaries** — none introduced. ✔
- **`node:` prefixes** — `node:fs`, `node:path`, `node:url`, `node:crypto`. ✔
- **No `use*` helper names** — helpers are `persistTaskDone`, `gateProducedDiff`,
  `runDelegatedTask`, `runRawTask`, `repoRootDir`, `extractDiff`. ✔
- **`readonly` fields** — `DelegateOutcome` all readonly; `DelegationEntry` already
  readonly. ✔
- **async `execFile`** — gate reuses `validateDiffApplies` (sandbox-diff already async
  `execFile`); no new sync exec. ✔
- **`localeCompare` sorts** — no new `.sort()` introduced. ✔
- **Regex S5852** — `DIFF_FENCE_RE = /```diff\s*\n([\s\S]*?)```/` uses a lazy capture
  bounded by a literal close-fence; no overlapping/ambiguous quantifiers. ✔
- **S3776 complexity** — `executeTaskWithLLM` shrank (delegation + raw bodies
  extracted); each new helper is small and single-purpose. ✔

## Findings

- **[minor-1] Broad `catch` over post-bill code in the delegation branch.** The
  try/catch in `executeTaskWithLLM` wraps the whole `runDelegatedTask`, but its only
  documented purpose is the *pre-bill* `loadTierBFiche` bundler failure. If
  `gateProducedDiff` (mkdir/writeFile/`git apply`) or `persistTaskDone` (db) throws
  *after* `delegateWithDiff` already billed, the catch falls through to `runRawTask`
  → a **second** `llm.call` (double bill) plus a duplicate finalize attempt. Low
  probability (fs/db errors are rare; the realistic trigger is the pre-bill fiche
  load) and the §6 budget cap still bounds spend, so not a blocker — but the catch
  should be narrowed to the fiche-load step (e.g. resolve the fiche before the LLM
  call, or catch only around `delegateWithDiff`'s load phase), or the fallback should
  be guarded so it never re-bills after a successful delegate call. Recommend
  addressing in 5b or backlogging explicitly.

- **[nit-1] `next.agentId!` non-null assertion in `runDelegatedTask`.** Logically
  sound (`delegation` is only set when `next.agentId` is truthy) and unlikely to trip
  Sonar, but a destructured local would read cleaner. Cosmetic.

## Deferral judgement

- **Worker `startup.test.ts` flake (build-report note)** — ACCEPTABLE, not a block.
  It is pre-existing (5b touches only `packages/agents`), the documented cause is a 5s
  `spawnSync` cold-start timeout under parallel load, and it **passed** on this
  Checker's `pnpm -r test` run. Backlog item (bump timeout / serialize the worker
  suite) is the right call.

```json
{
  "verdict": "PASS",
  "findings": [
    { "severity": "minor", "message": "Broad catch in executeTaskWithLLM delegation branch wraps post-bill code (gateProducedDiff/persistTaskDone); a throw after delegateWithDiff's llm.call would fall back to runRawTask and bill a second LLM call. Documented purpose is the pre-bill bundler fiche-load failure only — narrow the catch to the load step or guard the fallback against re-billing." },
    { "severity": "nit", "message": "next.agentId! non-null assertion in runDelegatedTask is logically guarded but reads better as a destructured local." }
  ]
}
```
