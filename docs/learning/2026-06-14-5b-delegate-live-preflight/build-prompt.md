# 5b build prompts — Doer ① and Checker ②

## Doer ①

You are the Doer for **5b — wire `delegate()` into live execution** of MultiAgentOS.
Autonomous, TDD. You are ALREADY on branch `phase/5b-delegate-live` — stay on it.

Read BEFORE coding: `CLAUDE.md` (§5 risky actions, §7 5-check verification, §8 memory
write-lock, §11/§11.bis billing, §12 knowledge), `ROADMAP.md` Phase 5 section,
`docs/learning/2026-06-14-5b-delegate-live-preflight/plan.md` (your spec — follow it
exactly), and `docs/knowledge/sonar-recurring-rules.md`.

Inspect these existing files first (mirror their style):
`packages/agents/src/dispatch.ts`, `packages/agents/src/delegate.ts`,
`packages/agents/src/review-gate.ts`, `packages/agents/src/sandbox-diff.ts`,
`packages/agents/src/library.ts`, `packages/agents/src/testing.ts`,
`packages/agents/src/delegate.test.ts`, `packages/agents/src/dispatch.test.ts`,
`packages/core/src/llm.ts`.

Build the plan's **Step 1** then **Step 2**, each RED-before-GREEN (Vitest), committing
each step (Conventional Commits ≤60 chars, end EVERY message with
`Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`):

1. **delegate.ts** — add `extractDiff()`, `DelegateOutcome`, `delegateWithDiff()`;
   reduce `delegate()` to delegate to it. New `delegate.with-diff.test.ts` (red first).
   `delegate.test.ts` must stay green unchanged.
2. **dispatch.ts** — hoist `OUTPUTS_DIR`; extract `persistTaskDone()` and refactor the
   raw path to use it (pure refactor — `dispatch.test.ts` stays green); add the
   `TIER_B_DELEGATION_MAP` branch + `runDelegatedTask()` that produces a diff, writes
   `<OUTPUTS_DIR>/<taskId>.patch`, runs `reviewProducedDiff(...evidence:false)`, logs a
   `tier_b_review` event, and finalizes via `persistTaskDone`. New
   `dispatch-delegate.test.ts` (red first) proving a delegable task emits a diff carrying
   both Code-Reviewer + Reality-Checker verdicts.

HARD RULES: no `@anthropic-ai/sdk` anywhere; don't touch `packages/core/src/providers/`;
never export `MAS_MOCK_LLM` globally (tests opt in per-suite); execution stays Claude-only
(§11.bis r4) — the gate is advisory and must NOT auto-approve unsubstantiated diffs
(`evidence:false`); writes go to `data/outputs/` only, never `data/memory/` (§8); apply
sonar-recurring-rules proactively (`node:` prefixes, no `use*` helper names, `readonly`
fields, no nested ternaries, hoist duplicated literals, async `execFile`, `localeCompare`
sorts, keep cognitive complexity low by extracting helpers).

If a step runs very long, ship the exit-criterion core (a real mission task emits a
reviewed diff) and document the rest as a `5c` deferral.

WHEN DONE run from repo root and paste exact tails: `pnpm -r test` · `pnpm lint` ·
`pnpm build` · `pnpm --filter @mas/web smoke`; fix until green. Write
`docs/learning/2026-06-14-5b-delegate-live/build-report.md` (shipped, files, the 4 check
tails, deferrals) and commit. Leave commits on the branch; do NOT push.
Return: files created/changed, commit count, pass/fail + numbers of each check.

## Checker ②

You are the Checker for **5b — wire `delegate()` into live execution**. READ-ONLY — do
NOT modify source. Branch `phase/5b-delegate-live`.

Verify against `docs/learning/2026-06-14-5b-delegate-live-preflight/plan.md`, the
`ROADMAP.md` Phase 5 section, and `CLAUDE.md` (§5/§7/§8/§11/§12). For each plan point
(Step 1, Step 2, exit criterion), confirm or fault it with a severity.

RUN the 4 local checks yourself and paste tails + numbers: `pnpm -r test` · `pnpm lint`
· `pnpm build` · `pnpm --filter @mas/web smoke`.

Grep the invariants: no `@anthropic-ai/sdk` import anywhere; no `data/memory/` writes
outside the Memory Keeper; the §5 risk gate in `executeNextTask` still fires before
`executeTaskWithLLM` (delegation runs only for low/medium tasks); execution stays
Claude-only and the gate does not auto-approve `evidence:false` diffs. Assess adherence
to `docs/knowledge/sonar-recurring-rules.md` (duplication, hoisted literals, cognitive
complexity, `node:` prefixes, no `use*` helpers).

Judge whether the exit criterion is met: a real mission task emits a reviewed unified
diff carrying both Code-Reviewer + Reality-Checker verdicts. Judge whether any deferral
is acceptable or a BLOCK.

WRITE the full verdict (markdown + a fenced ```json block
`ReviewerVerdict {verdict: PASS|NEEDS_WORK|BLOCK, findings:[{severity,message}]}`) to
`docs/learning/2026-06-14-5b-delegate-live/checker-verdict.md` and commit ONLY that file
(`docs(5b): checker verdict`, end with the Co-Authored-By line). Do not push.
Prioritize coverage over filtering.
