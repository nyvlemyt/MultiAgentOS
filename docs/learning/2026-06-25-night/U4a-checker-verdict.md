# Checker verdict — sub-wave 0d/4a (Router ↔ QMD union)

**VERDICT: PASS**

Range `phase/9c-roster..phase/9d-arsenal` — commits `84ea586`, `098ddb7`,
`1262cc5`, `1b68944`. Reviewed against `docs/intake/2026-06-25-0d/preflight-pack.md`
§1 principles, §2 "4a" seams, §5 risks. Code not modified — review + tests only.

## 7-point checklist (pass/fail + evidence)

1. **Degraded invariant (#1 trap) — PASS.** `degraded` is derived solely from
   `!p.llm` / llm-rank failure (`select.ts:203-211`); the retriever path never
   touches it. The arsenal source-b test asserts `fused.degraded === true` with a
   live retriever present (`select.test.ts:157`). The contract test
   `dispatch-arsenal.test.ts:69` (`payload.degraded === true` &
   `skills === skillIds` under no-llm) is **unmodified in intent** and green
   (2/2 pass). The new appended `describe` only adds a singleton test — it does
   not weaken :69.

2. **Omitted retriever ⇒ byte-identical — PASS.** RRF fires only when
   `semanticOrder.length > 0` (`select.ts:194`); otherwise `fusedIds = tagOrder`,
   and `byId.map` preserves the exact stable tag-sort order → identical to pre-4a.
   Asserted: `select.test.ts:168-172` (skillIds + degraded equal to plain).

3. **Throwing retriever ⇒ graceful — PASS.** Double-guarded try/catch:
   `arsenalIds` catches at `select.ts:165-167` → returns `[]`; the inner
   `base.query` adapter is also wrapped via the singleton builder. `[]` ⇒ no RRF
   ⇒ tag-only. No exception propagates; shortlist never emptied by QMD absence.
   Asserted: `select.test.ts:175-185`.

4. **RRF determinism — PASS.** `rrf.ts:13-24`: `Σ 1/(c+rank)`, `c=60` default,
   dedupe via `Map` keyed by id, ties broken by `a.localeCompare(b)` (id asc).
   Pure — no `Date`, no `Math.random`, no reliance on map-iteration order (sort
   is total: score desc then id asc). Zero LLM. Determinism asserted across
   repeated calls (`rrf.test.ts:21-24`) and tie-break (`rrf.test.ts:27-32`).

5. **No per-task QMD — PASS.** `arsenalRetrieverFor()` is a module-level singleton
   guarded by `_arsenalBuilt` (`mission-llm.ts:88-90`) — built at most once per
   worker. `planMission` calls it ONCE *before* the task loop (`dispatch.ts:73`)
   and passes the cached instance into every in-loop `selectLibrarySkills`
   (`dispatch.ts:100`). `QmdRetriever.query` (30s execFileSync) is therefore never
   per-task. Asserted: `dispatch-arsenal.test.ts:74-80` (`a === b`, green).

6. **Dependency hygiene — PASS.** `ArsenalRetriever` is a minimal LOCAL interface
   in `select.ts:11-13` (`{id,score}` hits). Grep confirms **no `@mas/memory`
   import** anywhere in `packages/skills/src/` (only a doc-comment mention at
   `select.ts:7`). The `@mas/memory` ↔ `@mas/skills` coupling lives only in
   `mission-llm.ts` (the agents package), the correct seam.

7. **Tests genuinely cover 1-5 — PASS.** The stub-retriever test
   (`select.test.ts:151-162`) proves a tag-MISSED skill (`sec-19`, no auth/login
   tag) *enters* the shortlist via the semantic source while `plain` excludes it —
   real semantic-union behaviour, not a presence smoke test. Omitted/throwing/
   determinism/single-construction each have a dedicated assertion. 17/17 skills
   tests + 2/2 dispatch-arsenal tests green locally.

## Sanity checks
- **No §5 leakage:** 4a is selection-only. No `t.agentHint` mutation, no
  `TIER_B_DELEGATION_MAP` write, no delegation routing in the diff. Retriever
  output only re-orders the skill shortlist.
- **No scope-creep into 4b/4c/4d:** no `cold_agent_suggested` event, no
  `mcpServers`/`allowedTools` wiring in `llm.real`, no `golden-queries.json` /
  `eval.ts` change. Diff is confined to RRF + select + the one retriever singleton
  + its dispatch thread-through.
- **No dead code:** every new symbol (`rrfFuse`, `ArsenalRetriever`, `arsenalIds`,
  `arsenalRetrieverFor`) is consumed. `QMD_ARSENAL='mas-arsenal'` correctly
  imported from `@mas/memory` (`retriever.ts:224`), the collection deliberately
  excluded from `QMD_MEMORY_COLLECTIONS`.
- `1b68944` (S7735 negated-ternary flip in `rrfFuse`) is a cosmetic Sonar fix;
  behaviour identical, tests still green.

## Findings
None blocking. One **nit (non-blocking, informational):** the `_memoryStore`
singleton is shared between `memoryContextFor` and `arsenalRetrieverFor`; both
adapters re-scope queries to their own collections at call time, so there is no
cross-collection bleed — correct as written.

## Bottom line
4a meets every load-bearing principle (§1.2 union floor, §1.3 deterministic RRF,
§1.4 inject-not-import, §1.5 graceful degradation, §1.8 one-query-per-mission) and
trips none of the §5 no-regression risks. Tests genuinely exercise the seams.
**PASS — 4a is fully DONE.**
