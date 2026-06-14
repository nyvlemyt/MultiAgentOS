# Pre-flight — 5b · Wire `delegate()` into live execution

Date 2026-06-14 · Branch `phase/5b-delegate-live` · Base `main` (PRs #1–#12 merged).

## Item
Phase 5 built the Tier B delegation engine (`delegate.ts`), sandbox diff
(`sandbox-diff.ts`) and the review gate (`review-gate.ts`) as an **isolated**
layer with their own tests, but nothing calls them in a real mission. 5b branches
that layer into `executeTaskWithLLM` (`packages/agents/src/dispatch.ts`) so a real
mission routes a Tier-B-mapped task through `delegate()`, produces a diff, and runs
it through the Code-Reviewer + Reality-Checker gate before user validation.

**Exit criterion (ROADMAP Phase 5 / pipeline §1):** a real mission emits a
*reviewed* unified diff — the diff is persisted and carries Code-Reviewer +
Reality-Checker verdicts.

## Intake-audit (§13)
No new external resource / skill / agent / MCP is introduced — 5b is pure internal
wiring of already-audited Phase-5 engines. Per `docs/workflows/intake-audit-template.md`
the audit decision is **n/a (no candidate addition)**; no dossier in `docs/intake/`.
ADRs unchanged (delegation was decided in Phase 5; §11.bis r4 keeps execution
Claude-only). Recorded here per the learning-bootstrap ritual.

## Existing code (read first, mirror style)
- `packages/agents/src/dispatch.ts` — `executeTaskWithLLM` (raw LLM path),
  `resumeAfterValidation`, `selectLLM`, `logEvent`, `memoryContextFor`,
  `getSkillRouter`. The §5 risk gate fires in `executeNextTask` BEFORE
  `executeTaskWithLLM`, so the delegated path runs only for low/medium tasks.
- `packages/agents/src/delegate.ts` — `delegate()`, `parseResponse`, `loadPreface`.
- `packages/agents/src/review-gate.ts` — `reviewProducedDiff()`.
- `packages/agents/src/sandbox-diff.ts` — `validateDiffApplies()` (used by the gate).
- `packages/agents/src/library.ts` — `TIER_B_DELEGATION_MAP` (8 fiche keys).
- `packages/agents/src/testing.ts` — `makeTempGitRepo`, `CLEAN_TEST_DIFF`,
  `GARBAGE_TEST_DIFF`, `seed*` helpers (reuse, don't re-create).
- `packages/core/src/llm.ts` — `LLMResponse`, `LLMClient`; `mockMissionPlanner`
  emits delegable agentHints `design-ux-architect` (t3, low) +
  `engineering-frontend-developer` (t4, medium).

## Key facts that constrain the design
1. `mockMissionPlanner` default plan: **t3** (`design-ux-architect`, low) and
   **t4** (`engineering-frontend-developer`, medium) carry agentHints that ARE
   `TIER_B_DELEGATION_MAP` keys → they will now flow through `delegate()`.
2. `dispatch.test.ts` drives the mocked `claudeCodeLLM` which returns
   `'[test-mock] task executed'` (NO diff block). The delegated path must:
   - still log a single `task_done` event per task,
   - still record spend `inputTokens+outputTokens` (220+80 = 300),
   - still persist `sessionId` back to the project on first call,
   - set `outputPath` to `data/outputs/<id>.md` when there is no diff.
   → existing dispatch tests stay green unchanged.
3. `TaskResult.Artifact` has no diff field; `delegate()` discards the raw diff
   text. We need that text for the gate → surface it without breaking `delegate()`'s
   public signature (delegate.test.ts asserts `delegate()` returns `TaskResult`).
4. The review gate needs `repoDir` = `proj.path`. With the test's no-diff mock the
   gate never runs, so a missing/non-repo `proj.path` in unit tests is harmless.
5. `data/outputs/` is NOT under the §8 memory write-lock (only `data/memory/` is).
   Writing the `.patch` there is allowed.

## Build steps (TDD — red before green, commit each)

### Step 1 — surface the diff + raw response from delegate (delegate.ts)
- Add exported `extractDiff(text: string): string | null` — returns the inner body
  of the first ` ```diff … ``` ` fenced block (trimmed), else null. Use ONE module
  regex constant (hoist; S1192) and reuse it in `parseResponse` (`extractDiff(text) !== null`).
- Add exported `interface DelegateOutcome { result: TaskResult; diff: string | null; response: LLMResponse }`.
- Add exported `async delegateWithDiff(input: DelegateInput): Promise<DelegateOutcome>`
  containing the current `delegate()` body, returning `{ result: parseResponse(...), diff: extractDiff(resp.text), response: resp }`.
- Reduce `delegate()` to `return (await delegateWithDiff(input)).result;` (signature unchanged).
- RED first: `delegate.with-diff.test.ts` — diff response → `diff` non-null + `result.kind==='done'` patch;
  prose → `diff===null` markdown; `[blocked]` → blocked + `diff===null`; `response.inputTokens` surfaced.
- Keep existing `delegate.test.ts` passing untouched.

### Step 2 — delegation branch + shared finalize helper (dispatch.ts)
- Hoist `const OUTPUTS_DIR = 'data/outputs';` (S1192).
- Extract `persistTaskDone(db, m, next, proj, resp, outputPath, extraPayload)` from the
  existing raw path: sessionId persist + task `done`/spend + mission spend + `task_done`
  event (tokens/cache/quota/risk + `{ title, sessionId, provider, ...extraPayload }`).
  Refactor the raw path in `executeTaskWithLLM` to call it (extraPayload = the memory
  context fields) — pure refactor, dispatch.test.ts stays green.
- Add, at the top of `executeTaskWithLLM` after building `llm`/`skillContext`/`memCtx`:
  ```ts
  const delegation = next.agentId ? TIER_B_DELEGATION_MAP[next.agentId] : undefined;
  if (delegation) return runDelegatedTask(db, m, next, { proj, llm, skillContext, memCtx });
  ```
- `runDelegatedTask`: call `delegateWithDiff({ agentId, task, llm, project:{defaultModel,defaultMode},
  skillContext, memoryText: memCtx.text, language })`. If `outcome.diff` and `proj?.path`:
  write the diff to `<OUTPUTS_DIR>/<taskId>.patch`, run
  `reviewProducedDiff({ taskId, diff, repoDir: proj.path, evidence: false })`, log a
  `tier_b_review` event (verdicts + `approved`/`diffValid`), `outputPath = .patch`.
  Then `persistTaskDone(..., extraPayload = { delegated: true, tierBFiche: delegation.fiche,
  reviewApproved: review?.approved ?? null, diffValid: review?.diffValid ?? null })`.
  Keep cognitive complexity low (S3776) — gate logic in its own small helper if needed.
- Keep execution Claude-only (§11.bis r4): the `llm` is the same `selectLLM()` client; no
  provider SDK import; `evidence:false` ⇒ Reality Checker NEEDS_WORK ⇒ unsubstantiated diffs
  are never auto-approved (gate is advisory pre-validation, does not pause the mission).
- RED first: `dispatch-delegate.test.ts` — seed a mission, point a low-risk task's `agentId`
  at a delegation key, stub the LLM (via `MAS_MOCK_LLM`? no — needs a diff) by inserting a
  task whose execution returns a diff. Simplest: unit-test `runDelegatedTask` indirectly is
  hard; instead test the gate wiring at the `delegate`+`reviewProducedDiff` seam against a
  `makeTempGitRepo` + `CLEAN_TEST_DIFF`-style stub LLM, asserting a `tier_b_review` event is
  logged with verdicts and the `.patch` outputPath. If driving through `executeNextTask` is
  needed, add a dedicated mission whose mocked LLM returns a diff (separate vi.mock file).

## Risks
- **Breaking dispatch.test.ts token fixtures** — mitigated: no-diff mock keeps the markdown
  path; `persistTaskDone` preserves the exact spend/event shape. Run dispatch.test.ts first.
- **Sonar duplication** (memory: dup watched, must stay 0) — mitigated by the shared
  `persistTaskDone` helper + hoisted `OUTPUTS_DIR`/diff-regex constants.
- **Cognitive complexity S3776** on `executeTaskWithLLM` — mitigated by extracting
  `runDelegatedTask` + `persistTaskDone`.
- **Sonar recurring smells** — apply `docs/knowledge/sonar-recurring-rules.md`: `node:`
  prefixes, no `use*` helper names, `readonly` on the new interface, async `execFile` only
  (gate already uses it), `localeCompare` for any sort, no nested ternaries.

## Definition of Done (5 checks — §7)
1. `pnpm -r test` green (new delegate + dispatch-delegate suites + all existing).
2. `pnpm lint` green (incl. `scripts/lint-no-sdk-payg.sh`).
3. `pnpm build` green.
4. `pnpm --filter @mas/web smoke` green.
5. `scripts/sonar-pr-issues.sh <pr>` **exits 0** AND gate status OK (zero open issues,
   zero to-review hotspots) on the HEAD sha.
Plus: Checker PASS with no open actionable finding; exit criterion demonstrated
(a mission task emits a diff carrying both reviewer verdicts).
