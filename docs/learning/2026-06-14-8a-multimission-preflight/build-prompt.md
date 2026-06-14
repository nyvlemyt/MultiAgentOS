# 3a build prompts — Doer ① and Checker ②

## Doer ①

You are the Doer for **item 3 / Phase 8 functional half — 3a multi-project parallel execution**
of MultiAgentOS. Autonomous, TDD. You are ALREADY on branch `phase/8a-multimission` — stay on it.
Do NOT push.

Read BEFORE coding (repo root /Users/melvyn/Documents/02_PROJETS/multiAgentOS):
- `CLAUDE.md` (§5 risky actions, §7 5-check verification, §8 memory write-lock, §11/§11.bis billing, §12 knowledge)
- `ROADMAP.md` Phase 8 section
- `docs/learning/2026-06-14-8a-multimission-preflight/plan.md` — YOUR SPEC, follow exactly
- `docs/knowledge/sonar-recurring-rules.md`

Inspect first (mirror style): `apps/worker/src/index.ts`, `packages/agents/src/dispatch.ts`
(`executeNextTask`, `listDispatchableMissions`), `packages/agents/src/autopilot.ts`
(`runAutopilotTick`), `apps/worker/src/autopilot-tick.test.ts` (seeding + `MAS_MOCK_LLM` pattern).

Build the plan's Step 1 then Step 2, each RED-before-GREEN (Vitest), committing each (Conventional
Commits ≤60 chars, end EVERY message `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`):

STEP 1 — new `packages/agents/src/dispatch-tick.ts`:
- `DispatchTickConfig` (readonly `maxConcurrentPerProject`, `maxGlobalConcurrent`),
  `DispatchAdvance`, `DispatchSkip` (reason `'project_cap' | 'global_cap'`), `DispatchTickResult`
  (all readonly fields).
- Pure helper `selectForTick(missions, config)` → `{ selected, skipped }` (deterministic order:
  `createdAt` then `id` via `localeCompare`; per-project cap then global cap). Unit-testable with
  no DB/LLM.
- `async runDispatchTick(db, config)` → list dispatchable, `selectForTick`, `Promise.all`
  `executeNextTask` over selected, map results into `advanced` (missionId/projectId/kind),
  return `{ advanced, skipped }`.
- Export both from the package index (`packages/agents/src/index.ts`).
- RED first `packages/agents/src/dispatch-tick.test.ts`: pure `selectForTick` cases (per-project
  cap, global cap, order) + integration with `MAS_MOCK_LLM=1` per-suite (two projects each one
  dispatched mission → both advanced; one project 3 dispatched + perProjectCap 1 → 1 advanced, 2
  skipped `project_cap`).

STEP 2 — `apps/worker/src/index.ts`:
- Replace the sequential dispatchable `for...of` loop in `tick()` with `runDispatchTick(db, config)`.
- `config` from constants with env override: `MAS_MAX_CONCURRENT_PER_PROJECT` (default 1),
  `MAS_MAX_GLOBAL_CONCURRENT` (default 4); parse once. One-line log `advanced=N skipped=M`.
- Keep `runAutopilotTick` + `maybeEmitDailyReport` after it, unchanged.
- RED first (worker test): two projects advance concurrently in one `tick()` within budget.

HARD RULES: no `@anthropic-ai/sdk`; don't touch `packages/core/src/providers/`; NEVER export
`MAS_MOCK_LLM` globally (tests opt in per-suite — a global export breaks `dispatch.test.ts`'s
vi.mock seam); memory writes only via candidate tables (§8); time-dependent logic takes explicit
`now: Date` if any; apply sonar-recurring-rules (readonly fields, `localeCompare` sorts, hoist
literals, `node:` prefixes, no `use*` helpers, no nested ternaries, low cognitive complexity via
the `selectForTick` helper). Do NOT build the 3b CLI executor — it is deferred (see plan).

WHEN DONE run from repo root and paste exact tails: `pnpm -r test` · `pnpm lint` · `pnpm build` ·
`pnpm --filter @mas/web smoke`; fix until all green. Write
`docs/learning/2026-06-14-8a-multimission/build-report.md` (shipped, files, the 4 check tails, the
3b deferral) and commit it. Leave commits on the branch; do NOT push.
Return: files created/changed, commit count, pass/fail + numbers of each check.

## Checker ②

You are the Checker for **3a multi-project parallel execution**. READ-ONLY — do NOT modify source.
Branch `phase/8a-multimission`. The diff is `git diff phase/techdebt-drizzle-inline HEAD`.

Verify against `docs/learning/2026-06-14-8a-multimission-preflight/plan.md`, `ROADMAP.md` Phase 8,
and `CLAUDE.md` (§5/§7/§8/§11/§12). For each plan point (Step 1, Step 2, exit criterion) confirm or
fault with a severity.

RUN the 4 local checks yourself and paste tails + numbers: `pnpm -r test` · `pnpm lint` ·
`pnpm build` · `pnpm --filter @mas/web smoke`.

Grep the invariants: no `@anthropic-ai/sdk`; no `data/memory/` writes outside Memory Keeper;
`MAS_MOCK_LLM` is NOT exported globally (per-suite only); the §5 risk gate in `executeNextTask`
still fires (parallel advance must not bypass it — a high/blocking task still pauses). Assess
adherence to `docs/knowledge/sonar-recurring-rules.md`. Specifically check: `selectForTick` is
deterministic + pure; the per-project and global caps are both enforced; concurrent advance can't
double-run a task (atomic claim). Judge the exit criterion (two projects advance concurrently
within budget) and whether the 3b deferral is acceptable or a BLOCK.

WRITE the full verdict (markdown + a fenced ```json `ReviewerVerdict {verdict: PASS|NEEDS_WORK|BLOCK,
findings:[{severity,message}]}`) to `docs/learning/2026-06-14-8a-multimission/checker-verdict.md`
and commit ONLY that file (`docs(8a): checker verdict`, end with the Co-Authored-By line). Do not
push. Prioritize coverage over filtering.
