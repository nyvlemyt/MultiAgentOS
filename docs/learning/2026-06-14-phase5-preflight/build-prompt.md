# Phase 5 — Doer ① and Checker ② prompts (ready to paste)

---

## ① DOER prompt

You are the Doer for **Phase 5 · Tier B wrapping** of MultiAgentOS. Work autonomously, TDD, on
branch `phase/5-tier-b` (already created from `main`). Read `CLAUDE.md` (esp. §5, §7, §8, §11/§11.bis,
§12), `AGENTS.md §6–§11`, and `docs/learning/2026-06-14-phase5-preflight/plan.md` — that plan is your
spec. Mirror the existing code style in `packages/agents/src/`.

**Build, in order, each step red-before-green (Vitest):**

1. **Tier B loader** `packages/agents/src/library.ts` + `library.test.ts`.
   `LibraryAgentFiche { id, name, description, color?, emoji?, vibe?, body, fichePath }`.
   `loadTierBFiches(dir = <.claude/agents resolved>)` parses `*.md` via `gray-matter`, **skips files
   missing both `name` and `description`** (EXECUTIVE-BRIEF, QUICKSTART, nexus-strategy), `id` =
   basename without `.md`. `loadTierBFiche(id, dir)` throws on missing. Resolve the default dir the
   same defensive way as `getSkillRouter()` in `dispatch.ts` (fileURLToPath + try/catch degrade);
   accept an explicit `dir` for tests/bundler safety.

2. **`TIER_B_DELEGATION_MAP`** in library.ts — the 8 rows of `AGENTS.md §6`
   (`engineering-software-architect`, `engineering-frontend-developer`, `engineering-backend-architect`,
   `design-ux-architect`, `design-ui-designer`, `engineering-technical-writer`,
   `testing-performance-benchmarker`, `testing-reality-checker`), each `{ fiche, calledBy[], useCase }`.
   Test: 8 entries; every `fiche` id loads from disk.

3. **`packages/agents/prompts/tier-b-system.md`** — shared delegated-call preface: constrained tool
   surface (read/propose; writes only as unified diffs against the sandbox; no writes outside the
   active project; no `data/memory/` writes — propose candidates only), output discipline (unified
   patch for code, markdown report with 2-line TL;DR otherwise, Caveman only for eco internal prose).

4. **`delegate()`** `packages/agents/src/delegate.ts` + `delegate.test.ts`.
   `delegate({ agentId, task: {title,description}, project?, llm, skillContext?, memoryText?,
   language?, fichesDir? }): Promise<TaskResult>`. System = tier-b preface + fiche body + optional
   language directive + memoryText + skillContext (filter falsy, join `\n\n`). User = `Task: <title>\n\n<description>`.
   Call `llm.call({ system, user, model, mode })`. Parse the response text → `TaskResult`:
   a fenced ` ```diff ` block → `{kind:'done', outputs:[{kind:'patch',path}], memoryCandidates:[]}`;
   `[blocked]` sentinel → `{kind:'blocked', reason, suggested_next}`; else
   `{kind:'done', outputs:[{kind:'markdown',path}], memoryCandidates:[]}`. Unknown agentId → throw.
   Use `import('@mas/core')` types `TaskResult`, `Artifact`, `LLMClient`. Tests use `mockLLM()` and a
   stub LLM whose `call` returns crafted text; assert the system prompt received contains the fiche
   body and agent name.

5. **Sandbox diff** `packages/agents/src/sandbox-diff.ts` + `sandbox-diff.test.ts`.
   `validateDiffApplies(diff, repoDir): Promise<{ok; error?}>` — write diff to an `os.tmpdir()` file,
   `execFile('git', ['apply','--check', file], {cwd:repoDir})`; ok on exit 0, else `{ok:false, error:stderr}`.
   Never throw on a bad diff or non-repo — return `{ok:false}`. `applyDiffToSandbox(diff, srcDir):
   Promise<{sandboxDir; ok; error?}>` — copy `srcDir` (git-tracked files; fall back to a shallow copy)
   into `data/sandboxes/<uuid>/`, `git init` if needed, apply the diff there; never mutate `srcDir`.
   Tests: build a temp git repo, commit a file, craft a clean diff (passes) and a conflicting/garbage
   diff (fails with stderr).

6. **Review mocks** in `packages/core/src/llm.ts` + test.
   `mockCodeReviewer(taskId, { hasDiff }): ReviewerVerdict` → PASS (info), warn finding when `!hasDiff`.
   `mockRealityChecker(taskId, { evidence }): ReviewerVerdict` → **NEEDS_WORK by default**, PASS only
   when `evidence === true` (mirrors the Reality Checker "default to NEEDS WORK" fiche). Export both.

7. **Review gate** `packages/agents/src/review-gate.ts` + `review-gate.test.ts`.
   `reviewProducedDiff({ taskId, diff, repoDir, evidence }): Promise<{approved; diffValid;
   verdicts: ReviewerVerdict[]}>` — `diffValid = (await validateDiffApplies(diff, repoDir)).ok`;
   run `mockCodeReviewer({hasDiff:!!diff})` + `mockRealityChecker({evidence})`; `approved = diffValid
   && both PASS`. Tests: valid diff+evidence → approved; invalid diff → !approved (diffValid false);
   valid diff no evidence → !approved (reality checker NEEDS_WORK).

8. **Wire-up + docs.** Export the new modules from `packages/agents/src/index.ts`. Add a concise
   "Tier B delegation contract" subsection to `docs/knowledge/agent-patterns.md` (cite AGENTS.md §6/§11,
   git-apply gate, Claude-only execution). Do NOT add top-level files.

**Hard rules:** TDD (watch red first). Conventional Commits ≤60 chars ending
`Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`, commit each step. No `@anthropic-ai/sdk`
import anywhere. Provider SDKs stay under `packages/core/src/providers/` (don't touch). Never export
`MAS_MOCK_LLM` globally. Memory writes forbidden outside Memory Keeper. Read
`docs/knowledge/sonar-recurring-rules.md` BEFORE writing code and apply it (no `use*` test-helper
names → S6440; `node:` import prefixes; `readonly`; no nested ternaries; a11y for any UI — none here).

**Run the 4 local checks and report exact output:** `pnpm -r test` · `pnpm lint` · `pnpm build` ·
`pnpm --filter @mas/web smoke`. Do not claim green without pasting the tail of each. Then write a
short build report to `docs/learning/2026-06-14-phase5/build-report.md` (what shipped, files, check
output, any deferrals to 5b) and commit it. Leave the branch pushed.

---

## ② CHECKER prompt

You are the Checker for **Phase 5 · Tier B wrapping**. Read-only — do NOT modify source. Verify the
work on branch `phase/5-tier-b` against `docs/learning/2026-06-14-phase5-preflight/plan.md`, the
Phase 5 section of `ROADMAP.md`, and `AGENTS.md §6`. Confirm:

1. **Loader**: `loadTierBFiches` parses `.claude/agents/*.md`, skips non-agent docs, id=basename.
   The 8 `AGENTS.md §6` ids each resolve. `TIER_B_DELEGATION_MAP` has exactly those 8.
2. **delegate()**: injects the fiche body + preface into the system prompt; returns a `TaskResult`;
   recognizes a diff block as a patch artifact; unknown agent throws. Execution is Claude-only —
   no provider SDK import outside `packages/core/src/providers/`, no `@anthropic-ai/sdk` anywhere.
3. **Sandbox diff**: `validateDiffApplies` uses `git apply --check` (non-mutating) and never throws
   on bad input; `applyDiffToSandbox` writes only under `data/sandboxes/`, never the source tree (§8).
4. **Review gate**: a clean diff is gated by Code Reviewer + Reality Checker; Reality Checker defaults
   NEEDS_WORK without evidence; `approved` requires valid diff AND both PASS.
5. **5 checks**: run `pnpm -r test`, `pnpm lint`, `pnpm build`, `pnpm --filter @mas/web smoke`. For
   the 5th (Sonar) — note it is run by the main session after push; report whether new code follows
   `docs/knowledge/sonar-recurring-rules.md` (no `use*` helpers, `node:` prefixes, readonly, no nested
   ternaries, no duplicated literals).
6. **CLAUDE.md compliance**: §5 risk gates intact, §7 conventions, §8 memory write-lock, §11 billing,
   §12 knowledge note added.

**Write your full verdict** (markdown rationale + a `ReviewerVerdict` JSON block with
`verdict: PASS | NEEDS_WORK | BLOCK` and per-finding `severity`+`message`) to
`docs/learning/2026-06-14-phase5/checker-verdict.md` and commit it. Prioritize coverage over
filtering — list every real finding. Do not skip a finding because it seems minor.
