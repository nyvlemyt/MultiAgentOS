# Phase 5 · Tier B wrapping — Checker verdict

**Date:** 2026-06-14 · **Branch:** `phase/5-tier-b` · **Reviewer:** Checker (read-only)
**HEAD:** 59a78b1 · **Verdict:** PASS (with one warn on the exit-criterion deferral)

Verified against `docs/learning/2026-06-14-phase5-preflight/plan.md`, `ROADMAP.md`
Phase 5, `AGENTS.md §6`, and `CLAUDE.md` (§5/§7/§8/§11/§11.bis/§12).

---

## 1. Loader (`packages/agents/src/library.ts`)

- `loadTierBFiches(dir)` reads `.claude/agents/*.md`, parses frontmatter via
  `gray-matter`, and **skips non-agent docs by requiring `name` OR `description`**
  (`if (!name && !description) continue;`). Verified: EXECUTIVE-BRIEF, QUICKSTART,
  nexus-strategy have no YAML frontmatter at all, so both fields are undefined →
  correctly skipped. `id` = basename without `.md` (`file.slice(0, -'.md'.length)`).
- Defensive `defaultFichesDir()` mirrors `getSkillRouter()`: `fileURLToPath` in a
  try/catch, degrades to `undefined`/`[]` under a bundler rather than crashing.
- All **8 `AGENTS.md §6` ids resolve to a real file on disk** (confirmed by `ls`
  and by the `TIER_B_DELEGATION_MAP` "every fiche id resolves" test).
- `TIER_B_DELEGATION_MAP` has **exactly the 8 entries** of the §6 table; ids,
  `calledBy`, and `useCase` match the table row-for-row. `DelegationEntry` fields
  are `readonly` (Sonar-clean). Test asserts `.toHaveLength(8)`.

**Finding:** plan/spec note — the slice's loader skip-rule is "lacks name AND
description"; in practice the skipped docs lack *both*. A future agent doc that
declares only one of the two fields would still be loaded. Acceptable for MVP;
worth a note. (info)

## 2. `delegate()` (`packages/agents/src/delegate.ts`)

- System prompt = `[preface, fiche.body, languageDirective?, memoryText?,
  skillContext?]` filtered + joined — confirmed by the test asserting the system
  contains both "Tier B delegated call" and the agent display name, and the
  language test asserting "Respond in French." is injected.
- Returns a `TaskResult`. `parseResponse` recognizes a fenced ```diff block via
  `/```diff[\s\S]*?```/` → `{kind:'patch'}` artifact; `[blocked]` sentinel →
  `{kind:'blocked'}` with the trailing reason; otherwise a markdown artifact.
- Unknown agent → `loadTierBFiche` throws and `delegate` lets it propagate
  (test: `.rejects.toThrow()`).
- **Claude-only execution confirmed:** `grep` for `@anthropic-ai/sdk` across
  `apps/*/src` + `packages/*/src` (excl. `api-fallback`) → NONE; provider SDK
  imports (`openai`, `@google/generative-ai`) outside `packages/core/src/providers`
  → NONE (in fact zero provider-SDK imports anywhere). `delegate` takes an
  injected `LLMClient` — no client instantiation, no paid path. (§11/§11.bis ✓)
- `PREFACE_FALLBACK` inline string guards the bundler path where the prompts file
  cannot be read — good resilience.

## 3. Sandbox diff (`packages/agents/src/sandbox-diff.ts`)

- `validateDiffApplies` runs `git apply --check --whitespace=nowarn` (non-mutating)
  in `repoDir`, wrapped in try/catch → **returns `{ok:false, error}` on any
  failure, never throws** (tests: clean diff ok, garbage `{ok:false}`+stderr,
  non-repo dir `{ok:false}`).
- `applyDiffToSandbox` copies `srcDir` into `data/sandboxes/<uuid>/` and applies
  the diff **there**; test confirms the source `file.txt` still contains "hello"
  while the sandbox contains "goodbye" → **source tree never mutated** (CLAUDE.md
  §8 ✓). Writes are confined to `data/sandboxes/` (gitignored under `data/`).
- Temp `.patch` files are removed in a `finally { unlinkSync }` in both functions.
- **Finding:** `applyDiffToSandbox` intentionally does NOT delete the sandbox dir
  (it must persist for the reviewer). The test cleans its own sandbox, but two
  leftover sandbox UUID dirs exist under `data/sandboxes/` from prior test runs.
  Harmless — `data/` is gitignored (`git check-ignore data/sandboxes` → ignored),
  nothing leaks into the commit. Minor test-hygiene note only. (info)

## 4. Review gate (`review-gate.ts` + core mocks)

- `mockRealityChecker` **defaults to NEEDS_WORK** without evidence, PASS only when
  `evidence===true` (tests confirm both branches).
- `mockCodeReviewer` PASS, adds a `warn` finding when `hasDiff` is false.
- `reviewProducedDiff`: `approved = diffValid && both verdicts === 'PASS'`. Tests:
  valid diff + evidence → approved; garbage diff → `diffValid:false`, not approved;
  valid diff without evidence → not approved (Reality Checker NEEDS_WORK). The gate
  cannot approve an unsubstantiated change. ✓
- `ReviewerVerdict` reused from `@mas/core` (no schema drift).

## 5. The 4 local checks (run from repo root)

| Check | Result | Numbers |
|-------|--------|---------|
| `pnpm -r test` | **PASS** | 214 passed (core 61, db 11, skills 11, memory 41, agents 47, web 42, worker 1). New suites: library 8, delegate 6, sandbox-diff 4, review-gate 3, review-mocks 4. |
| `pnpm lint` | **PASS (exit 0)** | SDK-PAYG guard "no forbidden provider SDK imports"; `pnpm -r lint` tsc --noEmit on memory/skills/web all Done. |
| `pnpm build` | **PASS (exit 0)** | apps/web Next build completes, static+dynamic routes prerendered. |
| `pnpm --filter @mas/web smoke` | **PASS (exit 0)** | 28 passed (32.4s). |

Sonar-recurring-rules pre-assessment (5th check runs post-push by main session):
- No `use*` helper names (S6440) in any new file. ✓
- `node:` import prefixes used throughout (fs/path/url/os/crypto/child_process). ✓
- `DelegationEntry` fields `readonly`; no nested ternaries (the one grep hit is a
  `?? ''` default param, not a ternary). ✓
- No obvious duplicated string literals beyond test fixtures. The CLEAN_DIFF /
  makeTempRepo fixtures are duplicated between `sandbox-diff.test.ts` and
  `review-gate.test.ts` — Sonar may flag the repeated diff literal / helper as
  duplication on the test files. **Watch this on the post-push Sonar run**
  (prior phases hit duplication gates on test lifecycle). (warn)

**Finding:** `pnpm -r lint` only type-checks the 3 packages that declare a `lint`
script (memory, skills, web). `packages/agents` and `packages/core` are NOT
tsc-checked by `pnpm lint` — their type safety is covered only transitively by
`pnpm build`. The new code lives in agents/core, so the build is the real type
gate here; it passed. Pre-existing infra gap, not introduced by this slice. (info)

## 6. Phase exit criterion

The primitives **fully support** "a unified diff that applies clean
(`git apply --check`) reviewed by Code Reviewer + Reality Checker before reaching
the user": `delegate()` produces a `{kind:'patch'}` artifact from a fenced diff,
`validateDiffApplies` gates it with non-mutating `git apply --check`, and
`reviewProducedDiff` requires diffValid AND both reviewers PASS. The logic is
correct and tested end-to-end at the unit level.

**However**, `delegate()` is NOT wired into the live `executeTaskWithLLM` dispatch
path (`dispatch.ts` still routes through its own path; no `delegate` reference
there). The exit criterion is phrased "**A real mission produces** a unified diff
...reviewed...before reaching the user" — that is satisfied **by construction**
(every primitive exists and is tested) but **not demonstrated by an end-to-end
mission run**. The ROADMAP also located `delegate()` "in `dispatch.ts`"; the Doer
shipped it as a standalone tested module instead.

**Judgment:** acceptable as a Phase 5 slice — NOT a BLOCK. The deferral is
explicit in the build report, all gate logic is present and proven, and the plan's
scope clause permitted shipping "loader + delegate + sandbox-diff + review-gate
with ≥3 agents wired and the full 8-entry map validated" (all 8 are mapped). But
the loop is closed only in 5b; until the dispatcher routes execution tasks through
`delegate()` + `reviewProducedDiff`, no production mission actually exercises the
gate. **Marked warn** so 5b's exit explicitly requires the live-path wiring +
one real demonstrated diff→review→approve flow. (warn)

## 7. CLAUDE.md compliance

- **§7 Conventional Commits:** `git log main..HEAD` — 5 `feat(...)`/`fefeat`
  commits + 1 `docs(...)`, all `type(scope): subject`, subjects ≤60 chars. ✓
- **§8 memory write-lock:** no new writer of `data/memory/`. The only references
  are the existing `MemoryStore` (Memory Keeper) and a *forbidding* line in the
  preface. `delegate` only reads injected `memoryText`. ✓
- **§11 billing guard:** SDK-PAYG lint guard green; no `@anthropic-ai/sdk` import;
  injected `LLMClient`, no client instantiation. ✓
- **§12 knowledge:** "Pattern : Contrat de délégation Tier B (Phase 5)" note added
  to `docs/knowledge/agent-patterns.md` (line 202+), covering the delegation
  contract, no Tier B→Tier A spawn, and the `validateDiffApplies`/
  `applyDiffToSandbox` sandbox model. ✓

---

## Summary

All 4 local checks green (214 tests, lint/build/smoke exit 0). Loader, delegate,
sandbox-diff, and review-gate are correctly implemented, well-tested, Claude-only,
and CLAUDE.md-compliant. The one substantive reservation is that `delegate()` is
not wired into the live dispatch path, so the Phase 5 exit criterion is met by
construction but not demonstrated end-to-end — explicitly deferred to 5b and
acceptable for this slice. Verdict: **PASS**, conditioned on 5b closing the
dispatcher wiring and Sonar staying clean on the duplicated test fixtures.

```json
{
  "verdict": "PASS",
  "findings": [
    { "severity": "warn", "message": "delegate() is not wired into the live executeTaskWithLLM dispatch path; the Phase 5 exit criterion (a real mission produces a reviewed diff) is satisfied by construction/unit tests but not demonstrated end-to-end. Deferred to 5b — acceptable for this slice, but 5b's exit must require the live wiring plus one demonstrated diff->validate->review->approve flow." },
    { "severity": "warn", "message": "Test fixtures (CLEAN_DIFF literal + makeTempRepo helper) are duplicated between sandbox-diff.test.ts and review-gate.test.ts. Prior phases hit Sonar duplication gates on test code; watch the post-push Sonar run (S4144/duplication) and dedupe into a shared test helper if flagged." },
    { "severity": "info", "message": "pnpm -r lint only tsc-checks memory/skills/web (the packages declaring a lint script); packages/agents and packages/core — where all new code lives — are type-checked only via pnpm build. Pre-existing infra gap, not introduced here; build passed so types are sound." },
    { "severity": "info", "message": "Loader skip-rule is 'lacks name AND description'; the 3 skipped docs lack both, so it works. A future agent doc declaring only one field would still load. Minor robustness note for MVP." },
    { "severity": "info", "message": "applyDiffToSandbox intentionally does not delete its sandbox dir (needed for review); two leftover sandbox UUID dirs remain under data/sandboxes/ from test runs. Harmless — data/ is gitignored, nothing is committed. Test-hygiene note only." }
  ]
}
```
