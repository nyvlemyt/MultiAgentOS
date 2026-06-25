# Phase 9 · Wave 0d — Pre-flight pack

> Per CLAUDE.md §13 (pre-flight before building a wave). 0d wakes the 1 085-fiche
> dormant arsenal: the Skill Router queries QMD for candidates, the orchestrator
> *suggests* (never auto-dispatches) cold agents, the QMD `query` MCP becomes
> agent-callable, and a golden-set eval guards recall in CI.
> **Spec = ADR 0007.** This pack is the operational distillation a builder reads
> tomorrow. Source lines below are verified against the tree on 2026-06-25.

Sub-waves: **4a** Router↔QMD union · **4b** cold-agent suggestion · **4c** QMD MCP
agent-callable · **4d** golden-set enrichment + CI arsenal-trigger.

---

## 1. How to build 0d well — load-bearing principles

Each is a *constraint on the diff*, not a nicety. Citation in parentheses.

1. **QMD proposes, the Router decides.** Semantic retrieval only *adds candidates*.
   The Router keeps ranking, risk-tier model routing (`risk_high→opus` …) and
   budget. A search engine never arbitrates role/budget invariants.
   (ADR 0007 §Décision-1 — « QMD *cherche* · le Router *décide* · le Markdown *stocke* »)

2. **UNION, never replace — keep the deterministic floor.** Shortlist =
   (a) existing static tag-score candidates **∪** (b) semantic candidates. Tags
   alone are lexical-fragile (new vocab invisible); semantic alone is
   non-deterministic + QMD-dependent. Union = recall *and* reproducibility.
   (ADR 0007 §Décision-1 + §Alternatives-rejetées (a))

3. **Fuse the two ranked lists with Reciprocal Rank Fusion (RRF) before the
   ranker.** Do not blind-concatenate — RRF merges heterogeneous rankings
   (tag-score + vector) into one robust order; proven pattern (agentmemory:
   BM25+vector+graph via RRF, 95.2 % R@5). RRF = `Σ 1/(c + rank_i)`, `c≈60`,
   dedupe by id. Pure function, fully unit-testable, **zero LLM**.
   (`docs/knowledge/memory-patterns.md` / `docs/knowledge/agent-patterns.md`)

4. **Inject the retriever, never import it — `select.ts` stays pure.** Add an
   optional `retriever?` to `SelectParams`. No retriever ⇒ **byte-identical**
   to today's tag-only behaviour. Zero new dependency in `packages/skills`.
   (ADR 0007 §Décision-2)

5. **Graceful degradation, never silent.** Retriever absent / FTS-mode / throws
   ⇒ source (b) is empty, fall back to (a); no exception propagates; the
   shortlist is **never emptied by QMD's absence**. A degraded path is logged
   (circuit-breaker discipline), not a quiet quality drop.
   (ADR 0007 §Décision-3 + `docs/knowledge/production-patterns.md:101`; mirror the
   existing `try/catch` swallow seam in `mission-llm.ts:62/77`,
   `UnifiedRetriever` `retriever.ts:373`)

6. **Cold agents are SUGGESTED, never auto-dispatched (§5 gate).** An arsenal
   query may surface a relevant cold agent beyond `TIER_B_DELEGATION_MAP`, but
   invoking an unaudited agent stays human/§5-gated. Discovery without an unsafe
   execution path. (ADR 0007 §Décision-4 + CLAUDE.md §5)

7. **Index L1 summaries only; guard with a golden-set eval in CI.** Index by L1
   summary + frontmatter, never L2 bodies (token discipline §6). The harness
   already exists (`packages/memory/src/eval.ts`); replay the gold set on every
   collection change so any recall regression is a CI failure, not a silent
   drift. (ADR 0007 §Décision-6 + §Alt-rejetées (e))

8. **Token + latency discipline — one arsenal query per mission, not per task.**
   `selectLibrarySkills` stage-1 is "0 tokens" by contract (`select.ts:127`);
   `QmdRetriever.query` is a **blocking `execFileSync` up to 30 s**
   (`retriever.ts:287/309`). Calling it inside the per-task `planMission` loop
   (`dispatch.ts:88`) multiplies a multi-second spawn across every task → breaks
   the zero-cost promise and stalls planning. **Batch + cache one arsenal query
   per mission; reuse the `_memRetriever` singleton.** (CLAUDE.md §6; risk #3 below)

---

## 2. Current wiring & seams — exactly what to change

### 4a — `selectLibrarySkills` queries QMD (union + deterministic fallback)

**Producer side — `packages/skills/src/select.ts`:**
- `SelectParams` (`select.ts:20-31`) has no retriever field. **Add**
  `retriever?: ArsenalRetriever` — a *minimal local interface* (`query(q, opts):
  {id; score}[]`), NOT an import of `@mas/memory` (keeps `packages/skills`
  dependency-free, principle 4). `MemoryHit` is structurally compatible.
- Stage-1 today (`select.ts:141-147`): scope-filter `router.all()` → `scoreSkill`
  (`select.ts:66`, `W_HINT=10·hinted + W_TAG=3·tagOverlap + W_CLUSTER=1`) →
  stable-sort `score desc, id asc` → top-K. **This is source (a).**
- **Add source (b):** when `retriever` present, `retriever.query(taskText, {
  collection: 'mas-arsenal', limit: k })`, map hit ids back to `SkillMeta` via
  `router` (drop ids the router doesn't know / out of scope). Wrap in
  `try/catch` → on throw, (b) = `[]` (principle 5).
- **Fuse (a)+(b) with RRF** → take top-K of the fused order as the shortlist.
  Stage-2 (LLM rank) and the `degraded` flag are unchanged downstream.
- **Keep the `degraded` contract intact:** `degraded` reflects *LLM ranking
  absence* (`select.ts:149-156`), NOT retriever presence. Adding (b) when `llm`
  is still omitted must keep `degraded: true` (see risk #1 — a live test asserts
  it). Optionally extend `buildRationale` to note `+semantic`.

**Caller side — thread the retriever from dispatch:**
- `planMission` (`dispatch.ts:59-142`) calls `selectLibrarySkills` at
  `dispatch.ts:92` with `{task, scope, router}` and **no `llm`** (always
  degraded today — `dispatch-arsenal.test.ts` asserts it). It already caches
  `skillRouter = getSkillRouter()` (`dispatch.ts:71`).
- Build **one** arsenal retriever per mission, **before** the `for` loop
  (`dispatch.ts:88`), scoped to `QMD_ARSENAL` (`'mas-arsenal'`,
  `retriever.ts:224`) — the collection deliberately **excluded** from
  `QMD_MEMORY_COLLECTIONS` (`retriever.ts:233`). Reuse the construction pattern
  in `mission-llm.ts` (`buildRetriever`→`createRetriever`, `mission-llm.ts:49`),
  but with `collections: [QMD_ARSENAL]`. **Expose it from `mission-llm.ts`** (new
  `arsenalRetrieverFor()` next to `memoryContextFor`, same `try/catch`-to-`undefined`
  degradation, same `_memRetriever`-style singleton) so `dispatch.ts` imports it
  rather than reaching into `@mas/memory` directly.
- Pass that retriever into every `selectLibrarySkills` call in the loop. Because
  it is **one** retriever reused across tasks, the 30 s spawn is paid at most
  once/mission (principle 8). The retriever itself is `undefined` under the
  bundler / FTS / no-`.qmd` — fallback to (a) is automatic.

### 4b — orchestrator suggests a cold agent (suggestion only, §5 keeps control)

- Agents are chosen by the **planner** today (`t.agentHint` from
  `mockMissionPlanner`), never inferred from the arsenal. `executeTaskWithLLM`
  looks up `TIER_B_DELEGATION_MAP[next.agentId]` (`dispatch.ts:510`, static
  9-entry map in `library.ts:168`) to decide delegate-vs-raw.
- The cold agent arsenal (`scanAgentLibrary` / `loadAgentLibraryIndex`,
  `library.ts:127/149` → `AgentLibraryMeta {id,name,role,domains,…}`) is
  **loaded but never consulted at dispatch.**
- **Seam:** in `planMission` (`dispatch.ts:88` loop), beside
  `domainScopeFor(t.agentHint)`, score `loadAgentLibraryIndex(repoRoot)` against
  the task (mirror `scoreSkill`'s tag/role overlap, or reuse the same
  `mas-arsenal` retriever filtered to agent docs) and, when the top suggestion
  beats the planner's hint by a margin, **emit a `cold_agent_suggested` event**
  (`logEvent`, payload `{taskId, suggestedAgentId, score, reason}`). 
- **Hard rule (§5):** the suggestion is *data only*. Do **not** rewrite
  `t.agentHint`, do **not** insert into `TIER_B_DELEGATION_MAP`, do **not** route
  delegation to it. There must be **no code path** where an arsenal query alone
  causes an unaudited agent to execute. A human promotes a suggestion later (a
  future Step-3 surface) — out of 0d scope. (ADR 0007 §Décision-4)

### 4c — QMD `query` MCP callable by in-loop agents

- `.mcp.json` declares `qmd` (`command:"qmd" args:["mcp"]`), exposing
  `mcp__qmd__query`. **But the runtime SDK runner does not wire it:**
  `claudeCodeLLM` (`packages/core/src/llm.real.ts:73-90`) calls the Agent SDK
  `query()` with only `cwd / resume / model / permissionMode / effort /
  systemPrompt(preset claude_code) / env` — **no `mcpServers`, no `allowedTools`,
  no `settingSources`/`loadSettingSources`.** Grep confirms zero MCP wiring in
  `packages/` + `apps/worker`. So `.mcp.json` reaches the *interactive CLI*, not
  dispatched in-loop agents. Today QMD reaches agents only **indirectly**:
  `QmdRetriever` shells out and its hits are flattened into the system prompt via
  `buildMemoryContext` (`dispatch.ts:503`).
- **Change:** add to the SDK options object in `llm.real.ts:75`:
  `mcpServers: { qmd: { command: 'qmd', args: ['mcp'] } }` (or load from
  `.mcp.json`) **plus a scoped `allowedTools: ['mcp__qmd__query', …]`** — least
  privilege; do **not** open the full tool surface. Gate it behind an opt-in
  (e.g. a `ClaudeCodeLLMOptions.mcp?: boolean` or env) so the default runtime and
  every existing test stay byte-identical.
- **Acceptance proof (ADR 0007 §Décision-5):** one mission where an agent calls
  `mcp__qmd__query` and receives candidates — assert via an `mcpServers`-shaped
  unit test on the options object (mock the SDK `query`), not a live model call.
- **Do NOT** embed a long-lived MCP server in the worker hot-path — QMD stays
  queried out-of-worker via CLI; the MCP server is for interactive + agent calls
  only. (ADR 0007 §Alt-rejetées (c) + ADR 0003 amendment)

---

## 3. Golden-set eval design (concrete)

**Extend, do not rebuild.** Wave 0a shipped the full harness:
- `packages/memory/src/eval.ts` — engine (`runRetrievalEval`, `GoldenQuery`,
  `formatEvalReport`). A row passes if **any** top-k hit's `id|source|title`
  contains **any** `expect` substring (case-insensitive, `eval.ts:53/83`).
- `packages/memory/src/golden-queries.json` — live gold set (6 rows: 3 semantic
  `mas-knowledge`, 3 `qmdOnly` arsenal).
- `packages/memory/src/eval-cli.ts` — runner, auto-picks qmd vs fts
  (`resolveBackend`), wired as `pnpm mem:eval`.
- `packages/memory/src/eval.test.ts` — CI gate over an in-memory FTS fixture (no
  4.4 GB models), rides `pnpm -r test`.

**0d's job = enrich `golden-queries.json` (more arsenal rows + a score floor).**

**(a) Add arsenal rows** — verified live against `mas-arsenal` on 2026-06-25.
Keep every new arsenal row **`qmdOnly: true`** so it auto-`skip`s (not fails) on
the FTS backend → CI stays green offline (`eval.ts:69`):

| id | query | expect (real artifact) |
|---|---|---|
| `arsenal-defensive-agent` | `agent for defensive security review` | `["security-defensive-specialist","defensive"]` (`mas-arsenal/agent/security-defensive-specialist.md`, score 0.93) |
| `arsenal-prod-audit` | `skill to audit a production system` | `["production-audit","audit"]` |
| `arsenal-db-reviewer` | `review SQL and migrations for safety` | `["database-reviewer"]` |
| `arsenal-security-scan` | `scan agent config for security smells` | `["security-scan"]` |
| `arsenal-phishing` | `detect phishing from email headers` | `["email","phishing","compromise"]` |

(The 3 existing arsenal rows + 3 semantic-knowledge rows stay.)

**(b) Add a score floor.** Extend `GoldenQuery` with optional `minScore?: number`
and pass it through; assert the *matching* hit clears it (the harness already
surfaces `hit.score`; agent queries above land 0.93/0.51, so a floor ~**0.30**
catches silent rank-collapse without false negatives). Update `runRetrievalEval`
to fail a row whose only matching hit is below `minScore`. Add one
`eval.test.ts` case proving a too-low score fails while an above-floor hit passes.

**(c) Cold-agent assertion** — at least one arsenal row must resolve to an
*agent* doc (e.g. `arsenal-defensive-agent`), proving the "agent revue sécu →
right cold agent" path ADR 0007 §Décision-6 calls out.

---

## 4. Build order & TDD checkpoints (4a → 4b → 4c → 4d)

`superpowers:test-driven-development` per CLAUDE.md §7. **Failing test first**,
then the minimal diff to green. The **5-checks gate** (CLAUDE.md §7) closes each
sub-wave: `pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web
smoke` · **SonarCloud** (`scripts/sonar-pr-issues.sh <pr>` exits 0 — zero open
issues + zero to-review hotspots — *and* `qualitygates/project_status == OK`;
read `docs/knowledge/sonar-recurring-rules.md` first).

**4a — Router ↔ QMD union (the heart).**
1. RED: pure RRF unit test in `packages/skills` (two ranked id-lists →
   deterministic fused order; ties broken by id) — fails (no `rrf` fn).
2. RED: `select.test.ts` — with a **stub retriever** returning a skill the
   tag-score *misses*, that skill enters the shortlist; with retriever omitted,
   output is **byte-identical** to today; with retriever **throwing**, output ==
   tag-only (fallback) and `degraded` unchanged. Fails (no `retriever` param).
3. GREEN: add `retriever?` + (b) + RRF + `try/catch` fallback. Keep
   `dispatch-arsenal.test.ts:69` green (`degraded === true`, `skills ===
   skillsJson` under no-`llm`) — see risk #1.
4. RED→GREEN: `dispatch` test — `planMission` builds **one** arsenal retriever
   and reuses it across tasks (assert single construction; risk #3).
5. Gate (5 checks).

**4b — cold-agent suggestion.**
1. RED: `planMission` test — a task whose best library agent differs from
   `t.agentHint` emits a `cold_agent_suggested` event; **`t.agentHint`,
   `tasks.agentId`, and the delegation path are unchanged** (no execution
   leakage, §5). Fails (no suggestion code).
2. GREEN: minimal scorer + `logEvent`. No mutation of routing state.
3. Gate.

**4c — QMD MCP agent-callable.**
1. RED: `llm.real` test — when MCP opt-in is set, the SDK `query` options carry
   `mcpServers.qmd` + `allowedTools` containing `mcp__qmd__query`; when **off**
   (default), options are byte-identical to today (mock the SDK `query`,
   inspect the options arg). Fails (no wiring).
2. GREEN: add the opt-in `mcpServers` + scoped `allowedTools`.
3. Gate (verify no existing `llm.real`/dispatch test regressed — default path
   untouched).

**4d — golden-set + CI arsenal-trigger.**
1. RED: extend `eval.test.ts` for the `minScore` floor (above-floor passes,
   below-floor fails) — fails (no `minScore` support).
2. GREEN: `minScore` in `eval.ts`; add the 5 arsenal rows to
   `golden-queries.json`.
3. Wire CI: `pnpm mem:eval` is **not yet in `.github/workflows/ci.yml`** (it runs
   lint/test/smoke only; `eval.test.ts` rides `pnpm -r test`). Add an
   **arsenal-change step** — `pnpm arsenal:build && pnpm mem:eval` gated on
   `paths:` touching the exact `arsenalSources` (`arsenal.ts:205-213`):
   `packages/skills/library/**`, `packages/agents/library/**`, `.claude/agents/**`,
   `docs/rules/**`, `.claude/commands/**`. On those PRs the runner is `qmd` →
   keep arsenal rows `qmdOnly` honest; on the default unit job the FTS fixture
   keeps it green. (Note CI uses Node 20; `qmd:setup` needs Node ≥22 + 4.4 GB
   models — if the CI runner can't host QMD, gate the arsenal step to run only
   where `MAS_RETRIEVAL_BACKEND` can reach a real index, else it `skip`s every
   `qmdOnly` row and still passes — decide this explicitly, never silently.)
4. Gate.

**Order rationale:** 4a is the value core and the riskiest seam — land it first,
fully gated. 4b/4c are additive read-only/opt-in layers. 4d locks the whole thing
against regression and is cheapest last.

---

## 5. Risks & KILL criteria (intake-audit discipline)

**No-regression risks (from the audit):**
1. **Degraded-decision invariant.** `dispatch-arsenal.test.ts:69` asserts
   `payload.degraded === true` and `skills === skillsJson` under no-`llm`. A
   retriever/ranker that flips `degraded → false` or reorders ids **breaks it.**
   → Keep retriever augmentation deterministic + zero-LLM in `planMission`;
   `degraded` tracks LLM-rank absence only. Update the test only if the contract
   genuinely changes, intentionally.
2. **Bundler / CI degradation contract.** `getSkillRouter` / `selectLLM` /
   `memoryContextFor` all swallow `fileURLToPath` failures → empty router/FTS
   (`mission-llm.ts:62/84/126`); CI forces `MAS_RETRIEVAL_BACKEND=fts`
   (`retriever.ts:415`, no models). Any new retriever-in-selection path **must
   degrade identically** (try/catch → `undefined`/empty, never throw) or it
   crashes Next RSC / CI.
3. **Token + latency.** `QmdRetriever.query` is a synchronous 30 s `execFileSync`
   (`retriever.ts:287/309`). One per task inside the `planMission` loop multiplies
   a blocking spawn across every task → breaks the 0-token stage-1 promise and
   stalls planning. → One batched/cached arsenal query per mission, reuse
   `_memRetriever`-style singleton.

**KILL / descope triggers — stop and re-audit, don't push through:**
- RRF fusion can't be made deterministic *and* keep the existing tests green →
  ship 4a as **union + dedupe + stable tag-score sort** (drop RRF to a 0e
  follow-up); the floor (principle 2) is the non-negotiable, RRF is the
  refinement.
- Wiring `mcpServers` into `llm.real` perturbs the default path or any existing
  test that can't be cleanly opt-in-gated → **defer 4c**; agents already get QMD
  indirectly via `buildMemoryContext`. 0d is still a win without 4c.
- Per-mission arsenal query can't be made single-spawn (latency unacceptable) →
  **descope to FTS-only arsenal candidates** for 0d (deterministic, fast),
  semantic union deferred. Never call QMD per-task.
- Golden rows can't be kept green offline (FTS can't host them and CI can't host
  QMD) → keep them strictly `qmdOnly` (auto-skip) and run the live replay only on
  the arsenal-path trigger; never let a green gate hide a skipped-everything run.

**0e stays deferred (do NOT pull forward):** PDF ingestion of `docs/ressources/`,
unified-frontmatter pass, arsenal console UI. (ADR 0007 §Périmètre — built now
they "sabotent le principe qualité"; built later on a proven 0d core they're
clean.) If a 0d task starts reaching into any of these → stop, it's scope creep.

---

## 6. Resources flagged — separate intake decision (do NOT adopt now)

Flag only; each needs its own `intake-audit` dossier before any adoption:

- **agentmemory (BM25 + vector + graph via RRF, 95.2 % R@5)** — cited in
  `docs/knowledge/memory-patterns.md` as the RRF-fusion source. 0d ports the
  *RRF pattern* only. A future intake could weigh its graph-retrieval layer as a
  Step-3/Jarvis upgrade — out of 0d.
- **QMD MCP full tool surface** (`mcp__qmd__get` / `multi_get` / `status` beyond
  `query`) — 0d wires `query` only (least privilege). Exposing the rest to
  in-loop agents is a separate security/§5 decision.
- **Reference webuis (siteboon/claudecodeui et al., CLAUDE.md §9.bis)** for the
  *agent-callable MCP wiring pattern* (`mcpServers` + `allowedTools` shape) — grep
  the pattern, cite the source file in a leading comment, port the shape; do not
  vendor code. Optional reference for 4c, not an adoption.
- **`agent-as-judge` (You et al., ICML 2025; RES-043 — 90 % vs 70 % human
  agreement)** — already embodied by the Reviewer/Sec-Reviewer ("a producer
  never validates its own output"). Flagged as the complementary doctrine behind
  §Décision-4; no new dependency, no 0d action.
