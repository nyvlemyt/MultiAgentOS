# Build report — 5b · Wire `delegate()` into live execution

Date 2026-06-14 · Branch `phase/5b-delegate-live` · Base `main` (PRs #1–#12 merged).

## Shipped

A real mission now routes a Tier-B-mapped task through `delegate()`, produces a
unified diff, persists it under `data/outputs/<taskId>.patch`, and runs it through
the Code-Reviewer + Reality-Checker review gate (`reviewProducedDiff`) before user
validation — logging a `tier_b_review` event carrying both verdicts and the
`diffValid` flag. The exit criterion (a mission task emits a *reviewed* diff) is
demonstrated by `dispatch-delegate.test.ts`.

### Step 1 — `delegate.ts`
- `extractDiff(text): string | null` — trimmed body of the first ```` ```diff ````
  fence, else null. One hoisted module regex (`DIFF_FENCE_RE`, S1192) reused by
  `parseResponse` (`extractDiff(text) !== null`).
- `interface DelegateOutcome { readonly result; readonly diff; readonly response }`
  (`LLMResponse` imported from `@mas/core`).
- `delegateWithDiff(input): Promise<DelegateOutcome>` holds the former `delegate()`
  body; `delegate()` reduced to `return (await delegateWithDiff(input)).result;`
  (public signature unchanged — `delegate.test.ts` stays green untouched).

### Step 2 — `dispatch.ts`
- Hoisted `const OUTPUTS_DIR = 'data/outputs';`.
- Extracted `persistTaskDone(...)` — the shared finalize step (sessionId persist +
  task done/spend + mission spend + single `task_done` event with
  `{ title, sessionId, provider, ...extraPayload }`). Pure refactor; the raw path
  calls it with the memory-context fields, so `dispatch.test.ts` stays green
  (spend 220+80=300, one `task_done` per task).
- `executeTaskWithLLM` now resolves `delegation = TIER_B_DELEGATION_MAP[agentId]`
  and, when set, calls `runDelegatedTask` → `delegateWithDiff` → (if diff + path)
  `gateProducedDiff` (write `.patch`, `reviewProducedDiff({ evidence:false })`, log
  `tier_b_review`) → `persistTaskDone(..., { delegated, tierBFiche, reviewApproved,
  diffValid })`. Raw path extracted to `runRawTask`.
- **Graceful degradation:** the delegation branch is wrapped in try/catch — if the
  fiche cannot load (Next bundler: `import.meta.url` not a `file:` URL, same failure
  mode as `getSkillRouter`/`selectLLM`), it logs `delegation_fallback` and falls
  back to `runRawTask` rather than failing the mission. This fix was required to
  keep the `/missions/[id]/run` inline path (and the `lifecycle` smoke) green.
- `git apply` rejects a trimmed diff with no trailing newline ("corrupt patch");
  `gateProducedDiff` re-adds one before writing/validating.

## Hard rules honored
- No `@anthropic-ai/sdk` anywhere; `packages/core/src/providers/` untouched; lint
  guard green. Execution stays Claude-only (same `selectLLM()` client). The gate is
  advisory (`evidence:false` ⇒ Reality Checker NEEDS_WORK ⇒ never auto-approves);
  it does not pause the mission. Writes go only to `data/outputs/`, never
  `data/memory/`. `MAS_MOCK_LLM` never exported globally (test deletes it,
  `MAS_ROUTING_CONFIG` pinned off, mirroring `dispatch.test.ts`).
- Sonar-recurring rules applied: `node:` import prefixes, hoisted literals
  (`OUTPUTS_DIR`, `DIFF_FENCE_RE`), `readonly` on `DelegateOutcome`, no negated
  ternary (`body === undefined ? null : …`), no nested ternaries, helpers kept
  small (no `use*` names), gate logic extracted to keep complexity low (S3776).

## Files
- `packages/agents/src/delegate.ts` (changed) — `extractDiff`, `DelegateOutcome`,
  `delegateWithDiff`, slimmed `delegate`.
- `packages/agents/src/delegate.with-diff.test.ts` (new) — Step 1 RED→GREEN.
- `packages/agents/src/dispatch.ts` (changed) — `OUTPUTS_DIR`, `persistTaskDone`,
  `runDelegatedTask`, `gateProducedDiff`, `runRawTask`, delegation branch +
  fallback.
- `packages/agents/src/dispatch-delegate.test.ts` (new) — Step 2 RED→GREEN.
- `docs/learning/2026-06-14-5b-delegate-live/build-report.md` (this file).

## Verification (4 checks — local; Sonar/5th check pending PR push)

`pnpm -r test` — PASS
```
apps/web test:  Test Files  14 passed (14)  ·  Tests  64 passed (64)
packages/agents test:  Test Files  16 passed (16)  ·  Tests  68 passed (68)
packages/core 88 · db 13 · skills 11 · memory 41 · worker 4 — all passed
apps/web test: Done   apps/worker test: Done
```

`pnpm lint` — PASS
```
PASS: no forbidden provider SDK imports (§11 + §11.bis)
apps/web lint$ tsc --noEmit
apps/web lint: Done
```

`pnpm build` — PASS
```
apps/web build: ƒ  (Dynamic)  server-rendered on demand
apps/web build: Done
```

`pnpm --filter @mas/web smoke` — PASS
```
  31 passed (29.6s)
```

## Notes / deferrals
- **Worker startup test flake (pre-existing, not 5b):** `apps/worker/src/startup.test.ts`
  spawns a fresh `tsx` worker with a 5s `spawnSync` timeout. Under full `pnpm -r test`
  parallel load the cold-start exceeds 5s and returns `status: null` intermittently;
  it passes comfortably in isolation and passed on the final `pnpm -r test` run.
  Independent of this change (5b only touches `packages/agents`). Backlog: bump the
  spawn timeout or serialize the worker suite.
- **Sonar (5th check):** not run — branch is not pushed per instructions. To run at
  PR time: `scripts/sonar-pr-issues.sh <pr>` must exit 0 + gate status OK.
- Commits on branch (not pushed): `delegateWithDiff` (Step 1) +
  `wire delegate() into live execution + gate` (Step 2). Preflight doc pre-existed.
