# U4 / 0d Wave-Level Checker Verdict — arsenal exploitation

**VERDICT: PASS** — wave 0d (4a–4d) fully DONE; all ROADMAP-442 exit criteria met.

Scope: PR #40 DRAFT, branch `phase/9d-arsenal` (base `phase/9c-roster`), HEAD
`f52d1dc`. 4a + 4b already individually Checker-PASS (`U4a`/`U4b` verdicts). This
review covers **4c + 4d** and the **whole-wave exit criteria + integration**.
Review only — no product code modified; read-only verification commands run.

## 0d EXIT CRITERIA (ROADMAP 442) — each holds, with evidence

1. **Right skill/agent surface by SEMANTIC search (not static tag) — PASS.**
   `selectLibrarySkills` RRF-fuses an injected arsenal retriever (4a:
   `select.ts` source-(b) + `rrfFuse`). `planMission` emits cold-agent
   suggestions from the arsenal (4b: `cold_agent_suggested` event, `dispatch.ts:182`).
   End-to-end wiring traced: `arsenalRetriever = arsenalRetrieverFor()`
   (`dispatch.ts:88`) and `agentLibrary = loadAgentLibrarySafely()`
   (`dispatch.ts:95`) are both built **before** the task loop (`dispatch.ts:112`);
   the retriever is threaded into every in-loop `selectLibrarySkills`
   (`dispatch.ts:116`). One shared per-mission arsenal retriever for both
   skill-select (4a) and agent-suggest (4b).

2. **Agent can query the brain via MCP — PASS.** 4c: opt-in `mcp?: boolean` on
   `ClaudeCodeLLMOptions`; when ON, the SDK `query()` options carry
   `mcpServers: { qmd:{command:'qmd',args:['mcp']} }` + scoped
   `allowedTools:['mcp__qmd__query']` (`llm.real.ts:105`). When OFF (default),
   the spread `...(opts.mcp ? {...} : {})` adds **zero keys** ⇒ byte-identical.
   Core test green: **109/109** (was 107; +2 mcp-on/mcp-off cases).

3. **Golden set green + FTS fallback intact — PASS.** `pnpm --filter @mas/memory test`
   = **88/88** (eval.test 6/6 incl. minScore floor: `floor-ok` minScore 0 passes,
   `floor-too-high` minScore 999 fails — `eval.test.ts:55-64`). All 5 new arsenal
   rows are `qmdOnly:true` (auto-skip on FTS, never fail). Cold-agent assertion
   present: `arsenal-defensive-agent` → AGENT doc `security-defensive-specialist`
   (minScore 0.3), satisfying §3c.

4. **5 checks + Sonar exit 0 — PASS.** Latest completed CI run **28141672410** =
   all 3 jobs `success` (build-test ✓, changes ✓, arsenal-eval ✓ FTS-honest).
   `scripts/sonar-pr-issues.sh 40` → **exit 0** (0 open issues, 0 to-review
   hotspots). (A newer run 28141806646 was in_progress at review time —
   triggered by the prior docs push; changes+arsenal-eval already green,
   build-test running; not blocking, last completed run is authoritative.)

## 4c contract review (pass/fail + evidence)

- **Least-privilege — PASS.** `qmdAllowedTools()` returns `['mcp__qmd__query']`
  only (`llm.real.ts`); no `get`/`multi_get`/`status`. `qmdMcpServers()` exposes
  only the `qmd` server.
- **Opt-in default OFF ⇒ byte-identical — PASS.** `mcp?` undefined by default;
  conditional spread adds no keys. Verified by the mcp-off unit test + core
  109/109 (no existing test regressed).
- **§11 — no `@anthropic-ai/sdk` import added — PASS.** `grep` over the entire
  `packages/core` diff returns NONE. Lint-guard test green in the 109.
- **No long-lived MCP server in worker hot-path — PASS.** Wiring is per-`query()`
  options only; QMD stays queried out-of-worker via CLI (doc-comment confirms).

## 4d contract review (pass/fail + evidence)

- **minScore fails a below-floor-only row — PASS.** `runRetrievalEval` now
  requires a *matching* hit that also clears `minScore` (`eval.ts:86-92`);
  `floor-too-high` (999) fails, `floor-ok` (0) passes (`eval.test.ts:55-64`).
  Omitted ⇒ legacy (any matching hit passes).
- **New arsenal rows all `qmdOnly` — PASS.** All 5 appended rows carry
  `"qmdOnly": true` (`golden-queries.json`), so FTS auto-skips them.
- **CI arsenal step is HONEST — PASS.** `arsenal-eval` job gated by a `changes`
  detector on the exact `arsenalSources()` globs; pins `MAS_RETRIEVAL_BACKEND=fts`
  (CI Node 20 can't host QMD) ⇒ qmdOnly rows auto-skip with a LOUD comment, and
  it still proves `arsenal:build` regenerates + `mem:eval` replays the gold set
  end-to-end (catches a corrupt gold set / broken harness). Not a silent
  skip-everything.
- **Always-on gate rides `pnpm -r test` — PASS.** `eval.test.ts` (FTS fixture)
  runs in the default unit job; confirmed green (6/6).

## Integration / regression findings

- **4a–4d compose cleanly.** One per-mission arsenal retriever shared by 4a
  skill-select + (independently) 4b agent-suggest; no per-task QMD spawn (both
  loaders hoisted above `dispatch.ts:112`). No degraded-flag regression
  (`dispatch-arsenal.test.ts:69` held per U4a). Diff stat: 21 files, +1343/-6 —
  product code confined to `select.ts`/`rrf.ts` (4a), `dispatch.ts`/`mission-llm.ts`/
  `cold-agent-suggest.ts` (4a+4b), `llm.real.ts` (4c), `eval.ts`/`golden-queries.json`
  (4d), plus `ci.yml` + tests + docs.
- **No §5 leak.** 4b is data-only (U4b verified: insert-then-suggest, no
  `TIER_B_DELEGATION_MAP` write, no delegation routing). 4c is opt-in/default-OFF.
- **No 0e scope-creep.** No PDF ingestion, no unified-frontmatter pass, no arsenal
  console UI in the diff. Confirmed clean.
- **No dead code.** Every new symbol (`mcp`, `qmdMcpServers`, `qmdAllowedTools`,
  `minScore`, the 5 arsenal rows, the `arsenal-eval` job) is consumed.

## Bottom line

All four ROADMAP-442 exit criteria hold with evidence; 4c (least-privilege opt-in
MCP, default byte-identical, no §11/§5 breach) and 4d (minScore floor, qmdOnly
honesty, honest CI trigger) both pass their full contracts; 4a+4b compose with one
shared per-mission retriever and no regression. Sonar exit 0, last completed CI
all-green. **PASS — U4 / 0d fully DONE. Next: U5 / U2.**
