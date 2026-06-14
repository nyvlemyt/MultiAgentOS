# Phase 5 · Tier B wrapping — Build report

**Date:** 2026-06-14 · **Branch:** `phase/5-tier-b` · **Author:** Doer (autonomous, TDD)

## What shipped

The 8 MVP Tier B agents from `AGENTS.md §6` are now wired into real delegated
work: a typed loader reads the library fiches, `delegate()` wraps a fiche + task
into a constrained, Claude-only LLM call returning a `TaskResult`, produced diffs
are validated/applied in an isolated sandbox (source tree never mutated, §8), and
a Code Reviewer + Reality Checker gate decides approval before a diff reaches the
user. Mocked LLM throughout — zero token spend.

### Steps (each RED-before-GREEN, Vitest)
1. **Tier B loader** — `loadTierBFiches/loadTierBFiche` over `.claude/agents/*.md`
   via gray-matter; skips the 3 non-agent docs (EXECUTIVE-BRIEF, QUICKSTART,
   nexus-strategy); defensive default-dir resolution like `getSkillRouter()`.
2. **`TIER_B_DELEGATION_MAP`** — the 8 rows of §6; every `fiche` id verified to
   load from disk.
3. **`prompts/tier-b-system.md`** — shared delegated-call preface (read/propose,
   unified-diff-only writes, no cross-project / no `data/memory/` writes, output
   discipline, Caveman only for eco internal prose).
4. **`delegate()`** — builds `[preface, fiche.body, languageDirective?, memory,
   skillContext]` system prompt; parses response → patch artifact (```diff),
   `blocked` (`[blocked]` sentinel), else markdown artifact. Unknown agent throws.
5. **`sandbox-diff.ts`** — `validateDiffApplies` (`git apply --check`, never
   throws) + `applyDiffToSandbox` (copies into `data/sandboxes/<uuid>/`, applies
   there; never mutates srcDir).
6. **Review mocks** — `mockCodeReviewer` (PASS; warn when no diff) and
   `mockRealityChecker` (NEEDS_WORK by default; PASS only with evidence) in core.
7. **`review-gate.ts`** — `reviewProducedDiff`: approved iff diff valid AND both
   reviewers PASS.
8. **Wire-up + docs** — exports from `packages/agents/src/index.ts`; "Contrat de
   délégation Tier B" subsection added to `docs/knowledge/agent-patterns.md`.

## Files touched

New:
- `packages/agents/src/library.ts` (+ `library.test.ts`)
- `packages/agents/src/delegate.ts` (+ `delegate.test.ts`)
- `packages/agents/src/sandbox-diff.ts` (+ `sandbox-diff.test.ts`)
- `packages/agents/src/review-gate.ts` (+ `review-gate.test.ts`)
- `packages/agents/prompts/tier-b-system.md`
- `packages/core/src/review-mocks.test.ts`
- `docs/learning/2026-06-14-phase5/build-report.md`

Edited:
- `packages/core/src/llm.ts` (mockCodeReviewer, mockRealityChecker)
- `packages/agents/src/index.ts` (exports)
- `docs/knowledge/agent-patterns.md` (delegation-contract note)

6 feature commits + this report on `phase/5-tier-b` (not pushed).

## Verification — 4 local checks (tails)

### 1. `pnpm -r test` — PASS
```
packages/core    Tests  61 passed (61)
packages/db      Tests  11 passed (11)
packages/skills  Tests  11 passed (11)
packages/memory  Tests  41 passed (41)
packages/agents  Tests  47 passed (47)
apps/web         Tests  42 passed (42)
apps/worker      Tests   1 passed (1)
```
Total: **214 passed**. New suites: library (8), delegate (6), sandbox-diff (4),
review-gate (3), review-mocks (4).

### 2. `pnpm lint` — PASS (exit 0)
```
PASS: no forbidden provider SDK imports (§11 + §11.bis)
packages/memory lint: Done
packages/skills lint: Done
apps/web lint: Done
```
(`pnpm -r lint` runs tsc --noEmit on the 3 packages that declare a lint script;
the SDK-PAYG guard scans all workspaces.)

### 3. `pnpm build` — PASS (exit 0)
```
apps/web build: ○  (Static)   prerendered as static content
apps/web build: ƒ  (Dynamic)  server-rendered on demand
apps/web build: Done
```

### 4. `pnpm --filter @mas/web smoke` — PASS (exit 0)
```
28 passed (33.2s)
```

## Deferrals to 5b
- Per-agent richer tool surfaces (the preface is a shared, uniform contract for
  all 8; no per-fiche tool gating yet).
- Wiring `delegate()` into the live `executeTaskWithLLM` dispatch path (this slice
  ships the delegation primitives + review gate as a standalone, tested layer;
  hooking the dispatcher to route execution tasks through `delegate()` per
  `agentId` is the integration step for 5b).
- The 5th check (SonarCloud `scripts/sonar-pr-issues.sh <pr>` exit 0 + gate OK)
  runs after the main session opens the PR and the HEAD-sha analysis lands.
