# Phase 5 · Tier B wrapping — Pre-flight plan

**Date:** 2026-06-14 · **Branch:** `phase/5-tier-b` (cut from `main`) · **Autonomy:** autonomous overnight

## TL;DR
Wire the 58 library agents (`.claude/agents/*.md`) into real specialized work: a typed
Tier B loader, a `delegate()` that wraps a fiche + task into a constrained LLM call returning a
`TaskResult`, the 8 MVP Tier B agents from `AGENTS.md §6`, sandboxed unified-diff production
validated with `git apply --check`, and a Code Reviewer + Reality Checker gate before a diff
reaches the user. Execution stays Claude-only (CLAUDE.md §11.bis rule 4). Mocked LLM in tests —
zero token spend. TDD throughout.

## Intake-audit (targeted, Phase 5)
Method: `docs/workflows/intake-audit-template.md`. Scope: delegation + sandbox patterns only.
- **Kept** (`docs/knowledge/agent-patterns.md`): subagents cannot spawn subagents (Tier B never
  calls Tier A — already enforced by AGENTS.md §11); isolate-context via per-agent sandbox; ≤7
  tools per agent; extract agency-agents "workflow/deliverables" as fiche bodies, no direct import.
- **Decision:** no new dependency, no ADR needed (fits ADR 0001 Claude-engine + §11.bis). `git apply
  --check` is non-mutating → safe read-only validation against the registered project; an optional
  copy-to-`data/sandboxes/` path covers actual application later. Re-audit at Phase 6 gate.
- **Distill:** add a short "Tier B delegation contract" note to `docs/knowledge/agent-patterns.md`.

## Build steps (TDD — red before green each)
1. **Tier B loader** — `packages/agents/src/library.ts`
   - `LibraryAgentFiche { id, name, description, color?, emoji?, vibe?, body, fichePath }`.
   - `loadTierBFiches(dir)` reads `.claude/agents/*.md`, parses frontmatter via `gray-matter`,
     **skips non-agent docs** (files lacking both `name` and `description`: EXECUTIVE-BRIEF,
     QUICKSTART, nexus-strategy). `id` = filename without `.md`.
   - `loadTierBFiche(id, dir)` single lookup → throws if missing.
   - Test: all 8 mapped ids load; docs skipped; unknown id throws; id derived from filename.
2. **Delegation map** — `TIER_B_DELEGATION_MAP` (the 8 rows of `AGENTS.md §6`) in library.ts.
   - Test: map has the 8 entries; every target id resolves to a real fiche on disk.
3. **tier-b-system preface** — `packages/agents/prompts/tier-b-system.md`
   - Constrained tool surface + output discipline (unified patch, no writes outside sandbox,
     Caveman in eco for internal prose, normal for artifacts). Loaded by `delegate()`.
4. **`delegate()`** — `packages/agents/src/delegate.ts`
   - `delegate({ agentId, task, project?, llm, skillContext?, memoryText?, fichesDir? }):
     Promise<TaskResult>`. Builds system = tier-b-preface + fiche body + language/skill/memory
     context; user = task title+description. Calls `llm.call`. Parses response → `TaskResult`
     (`done` with artifacts by default; recognizes a fenced ```diff block → patch artifact;
     `[blocked]` sentinel → blocked). Unknown agent → throws.
   - Test (mockLLM): returns `done`; system prompt contains the fiche body + agent name; diff in
     response surfaces as a `{kind:'patch'}` artifact; `[blocked]` → `blocked` result.
5. **Sandbox diff validation** — `packages/agents/src/sandbox-diff.ts`
   - `validateDiffApplies(diff, repoDir): Promise<{ ok; error? }>` — writes diff to a temp file,
     runs `git apply --check` in `repoDir` (non-mutating). Returns ok/false+stderr.
   - `applyDiffToSandbox(diff, srcDir): Promise<{ sandboxDir; ok; error? }>` — copies tracked files
     into `data/sandboxes/<uuid>/`, applies the diff there (never touches the source tree, CLAUDE.md
     §8). Best-effort; used by the review gate to produce a reviewable tree.
   - Test (temp git repo): clean diff passes; conflicting/garbage diff fails with stderr.
6. **Review gate mocks** — `packages/core/src/llm.ts`
   - `mockCodeReviewer(taskId, { hasDiff })` → PASS (warn if no diff). `mockRealityChecker(taskId,
     { evidence })` → **defaults NEEDS_WORK** (fiche personality); PASS only when `evidence===true`.
   - Test: reality checker default NEEDS_WORK; PASS with evidence; code reviewer PASS shape.
7. **Diff review gate** — `packages/agents/src/review-gate.ts`
   - `reviewProducedDiff({ taskId, diff, repoDir, evidence }): Promise<{ approved; verdicts;
     diffValid }>` — runs `validateDiffApplies` then Code Reviewer + Reality Checker; approved iff
     diff valid AND both PASS. Returns the combined verdicts for the trace.
   - Test: valid diff + evidence → approved; invalid diff → not approved (diffValid false); valid
     diff but no evidence → not approved (Reality Checker NEEDS_WORK).
8. **Exports + knowledge note** — extend `packages/agents/src/index.ts`; add the delegation-contract
   note to `docs/knowledge/agent-patterns.md`. No new top-level files (CLAUDE.md §7) — all under
   existing `packages/agents/` + `packages/core/` + `docs/`.

## Files
- New: `packages/agents/src/library.ts` (+`.test.ts`), `delegate.ts` (+`.test.ts`),
  `sandbox-diff.ts` (+`.test.ts`), `review-gate.ts` (+`.test.ts`),
  `packages/agents/prompts/tier-b-system.md`.
- Edit: `packages/core/src/llm.ts` (+ test), `packages/agents/src/index.ts`,
  `docs/knowledge/agent-patterns.md`.

## Risks / mitigations
- **`git apply --check` env**: needs a git repo in `repoDir`. Tests `git init` a temp dir. The
  validator returns `{ok:false}` (not throw) when not a repo, so a non-git project degrades safely.
- **Bundler `import.meta.url`**: loaders take an explicit `dir`/`fichesDir` arg (default resolved
  like the existing skill router, with try/catch degrade) — never eval at Next bundle time.
- **§11 billing**: no SDK import; delegate takes an injected `LLMClient`. No paid path.
- **§8 memory lock**: delegate only *reads* injected memory text; never writes `data/memory/`.
- **Scope**: if the subagent runs long, ship loader + delegate + sandbox-diff + review-gate with
  ≥3 agents wired and the full 8-entry map validated; defer richer per-agent tool surfaces to 5b
  with a note. The exit criterion (clean diff reviewed by Code Reviewer + Reality Checker) must hold.

## Definition of Done (5 checks — Sonar is the 5th)
1. `pnpm -r test` green (new suites included; never export MAS_MOCK_LLM globally).
2. `pnpm lint` clean (incl. `scripts/lint-no-sdk-payg.sh`).
3. `pnpm build` clean.
4. `pnpm --filter @mas/web smoke` green.
5. `scripts/sonar-pr-issues.sh <pr>` exits 0 (zero open issues + zero to-review hotspots) AND
   `qualitygates/project_status == OK`. Fix every item per `docs/knowledge/sonar-recurring-rules.md`.

Plus the phase exit criterion: a mission-style flow produces a unified diff that `git apply --check`
accepts and that the Code Reviewer + Reality Checker gate evaluates before user validation.
