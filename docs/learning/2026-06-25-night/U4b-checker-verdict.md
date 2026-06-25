# U4b Checker Verdict — cold-agent suggestion (§5 data-only)

**Scope:** PR #40 DRAFT, branch `phase/9d-arsenal`, commits `4932095` (feature) +
`f51c22b` (CI fix). Sub-wave 0d/4b. Diff: `git --no-pager diff 1262cc5..phase/9d-arsenal -- packages/agents`.
Spec: `docs/intake/2026-06-25-0d/preflight-pack.md` §2/§4/§5 "4b".

Touched: `packages/agents/src/cold-agent-suggest.ts` (new), `cold-agent-suggest.test.ts` (new),
`packages/agents/src/dispatch.ts` (wiring).

## VERDICT: **PASS** — 4b is fully DONE.

The §5 DATA-ONLY invariant holds with no detectable leakage path. All 6 checks pass.

## 6-point checklist (evidence)

1. **§5 DATA-ONLY (critical) — PASS.**
   - `tasks.agentId` is persisted as the planner hint `agentId: t.agentHint`
     (`dispatch.ts:142`) **inside the `db.insert(tasks)`** — which executes
     *before* the suggestion block. The suggestion code (`dispatch.ts:168-188`)
     runs after the insert and performs **only** a `logEvent`; it never UPDATEs
     `tasks`, never re-assigns `t.agentHint`, never writes `TIER_B_DELEGATION_MAP`,
     never calls `delegate*`/routes execution.
   - `scoreColdAgentSuggestion` (`cold-agent-suggest.ts:46-80`) returns a plain
     `ColdAgentSuggestion` value object — no mutation, no I/O. `planMission`
     consumes it solely to build the event payload.
   - `TIER_B_DELEGATION_MAP` is a `const` static map (`library.ts`); nothing in
     the 4b diff mutates it. No `[suggestedAgentId]` write anywhere.
   - **Test asserts all three non-mutations + map absence**, not just "an event
     fired" (`cold-agent-suggest.test.ts:92-101`): `t6Row.agentId === 'reviewer'`
     (unchanged), `t6Row.agentId !== payload.suggestedAgentId`, and
     `TIER_B_DELEGATION_MAP[payload.suggestedAgentId] === undefined`.
   - **No code path** where the arsenal suggestion causes an unaudited agent to
     execute. Confirmed.

2. **Event correctness — PASS.** Exactly one `cold_agent_suggested` per qualifying
   task: the scorer returns at most one best suggestion per task and the event is
   emitted only `if (suggestion)` (`dispatch.ts:175`). Payload is exactly
   `{taskId, suggestedAgentId, score, reason}` (`dispatch.ts:179-184`). No event
   when the hint wins — the margin gate `best.score - hintScore < SUGGEST_MARGIN`
   returns `undefined` (`cold-agent-suggest.ts:78`). Test asserts ≤1/task
   (`byTask` count === 1) and the hint-wins no-event case (`t2` undefined,
   test:118-124).

3. **Determinism + zero-LLM — PASS.** `scoreColdAgentSuggestion` is pure: token
   overlap over `role+name+domains`, ties broken `meta.id < best.meta.id`
   (lexical asc, `cold-agent-suggest.ts:74`). No `Date`, no `Math.random`, no QMD,
   no network, no per-task spawn. Library index loaded **once** per mission
   (`agentLibrary = loadAgentLibrarySafely()` before the loop, `dispatch.ts:95`).

4. **Graceful degradation — PASS.** `loadAgentLibrarySafely()` wraps
   `loadAgentLibraryIndex(repoRootDir())` in try/catch → `[]` (`dispatch.ts:59-65`),
   mirroring `getSkillRouter()`'s bundler seam (`repoRootDir()` throws when
   `import.meta.url` is not a `file:` URL under Next). `loadAgentLibraryIndex`
   itself returns `[]` when `index.json` is absent (`library.ts:150-152`). With an
   empty library, `scoreColdAgentSuggestion` short-circuits `if (library.length
   === 0) return undefined` (`cold-agent-suggest.ts:55`) ⇒ **0 suggestions, no
   throw**. The f51c22b CI fix is the test-side `beforeAll(buildAgentLibraryIndex)`
   that rebuilds the gitignored artifact so the *positive* path has data — it does
   not alter runtime degradation.

5. **Tests genuinely cover 1-4 — PASS.** Beating case (`language-reviewer` beats
   `reviewer` hint, scorer test:43-54; planMission t6 event test:73-101);
   non-beating case (scorer test:56-62 returns undefined; planMission t2 no-event
   test:118-124); missing-index path covered transitively by `library.length===0`
   short-circuit + the degradation seam (the empty-library branch is unit-reachable
   via the scorer's first guard). 4 tests, all green locally.

6. **No dead code / no scope-creep / no behaviour change — PASS.** New module is
   fully consumed; no 4c (`mcpServers`/`llm.real`) or 4d (`golden-queries`/eval)
   reach. Existing dispatch outcomes unchanged: the insert and all prior events are
   byte-identical; the suggestion is purely additive. Regression check:
   `dispatch*` suite 26/26 green, `cold-agent-suggest` 4/4 green locally.

## Findings

- No §5 violation. No regression. The ordering (insert-then-suggest) and the
  value-object scorer make an execution-leak path structurally impossible in this
  diff.
- Minor (non-blocking, not a defect): the spec text mentions an option to "reuse
  the same `mas-arsenal` retriever filtered to agent docs"; the builder chose the
  deterministic tag/role-overlap path instead (zero-LLM, fully unit-testable) —
  this is the safer, spec-compliant choice (principle 3, zero-LLM), not a gap.

## Bottom line

**PASS.** §5 DATA-ONLY holds end to end; the suggestion is data only, asserted by
test on all three non-mutations plus delegation-map absence. Event payload/cardinality
correct, scorer pure+deterministic, degradation graceful (missing index ⇒ 0
suggestions, never a throw), tests genuinely cover the beating / non-beating /
missing-index cases, no scope-creep, no regression. **4b fully DONE.**
