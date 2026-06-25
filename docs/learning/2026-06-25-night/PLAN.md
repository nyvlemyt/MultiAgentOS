# Night autonomous build — 2026-06-25

**GO given by user** ("tourne toute la nuit jusqu'à ce que tu ne puisses plus").
This file + `STATE.md` are the **cross-session communication channel**: any fresh
session reads `STATE.md` first, then this plan, and resumes from the first unit not
marked `DONE`. No context is ever lost between sessions.

Method of record: `docs/learning/AUTONOMOUS-PIPELINE.md` (doer/checker sub-agents),
ROADMAP §"Phase 9", CLAUDE.md §5/§7/§11/§12/§13/§14.

---

## Standing decisions (safe defaults — do NOT deviate without the user)

1. **NO merge to `main`.** Every wave = its own branch, chained on the previous,
   PR opened **DRAFT**. The user merges. (Memory: premature merges burned us; the
   0c reviewer verdict says *never merge to main*.) Tonight only **prepares**
   merge-ready stacks + reports.
2. The night GO authorizes **progressing through build waves** (U1 debt → 0d →
   0e/Étape 1 if budget). The usual phase-gate "stop & ask" is superseded **for
   building only**; merges still belong to the user.
3. **No risky/§5 action** beyond `git push` to a feature branch (never `--force`,
   never `main`, never `rm`/`reset --hard`, never `.env`/secrets). Gated actions
   stay gated.
4. **Knowledge-first (§12/§13):** consult `docs/knowledge/` + QMD before any
   agent/skill/memory/ADR artefact. Run the **pre-flight intake-audit before
   building a wave**.
5. **Done = 5 checks + Sonar exit 0** (`pnpm -r test` · typecheck · `pnpm lint` ·
   `pnpm build` · `pnpm --filter @mas/web smoke` + `scripts/sonar-pr-issues.sh`
   exit 0 + gate `OK`). Checker/Reviewer verdicts written to file.
6. Reserve **~1% tokens** for a final debrief.
7. Each unit uses **best LLM** (Opus for build/refactor/judgement; cheaper tiers
   only for mechanical sub-steps).

---

## The pipeline (loop, per unit)

```
pre-flight/spec  →  build (sub-agents, TDD)  →  Checker (mas-reviewer)
   →  Sonar triage+fix  →  verify 5 checks  →  improve  →  commit + push DRAFT
   →  update STATE.md  →  next unit
```

Parallelism rule: **only one tree-mutating unit at a time** (shared working tree).
Read-only analysis (pre-flight, review panels, audits) fans out via the Workflow
tool / parallel sub-agents.

---

## Unit backlog (dependency-ordered)

| # | Unit | Branch / PR | Why ordered here |
|---|------|-------------|------------------|
| **U1** | Tech-debt: split `dispatch.ts` (1026L) → `mission-events.ts` / `mission-llm.ts` / `review-phase.ts`. `dispatch.ts`<800, `runReviewPhase`<50. | `phase/9c-roster` → **#39** | **BLOCKING** — 0d edits `dispatch.ts:274-278`; clean the chokepoint before building on it. |
| **U2** | PR stack readiness report (#37→#38→#39). Verify green, report for morning. **No merge.** | — | Stack must be provably mergeable for the user. |
| **U3** | Phase **0d pre-flight** intake-audit (semantic arsenal retrieval, QMD-in-loop, golden-set eval) → distill into `docs/knowledge/`. | `docs/intake/2026-06-25-0d/` | §13 mandatory before building a wave. |
| **U4** | Phase **0d build** — "le cerveau qui agit". | `phase/9d-arsenal` (chained on 9c) → new DRAFT PR | The next wave; biggest. |
| **U5** | Phase-gate **self-audit §13** + Sonar full-scan debt (S5906 if not solved by #38) + improvements found in U1–U4. | small DRAFT PR(s) | Pay debt before moving on (user mandate). |
| **U6+** | 0e prep (PDF intake pipeline / frontmatter pass) or Étape 1 (live chat) — budget/context permitting. | new branch | Only after 0d is solid. |

### U4 sub-tasks (0d — ROADMAP 433-442)
- **4a** `selectLibrarySkills` (`packages/skills/src/select.ts:135-158`) gains a
  **semantic candidate source** (retriever, `mas-arsenal` collection) in **union**
  with the static tag score. Router stays the **decider**. Pass `retriever` from
  `dispatch.ts:274-278`. **Deterministic fallback** if QMD down (never crash,
  never empty shortlist).
- **4b** Orchestrator (0c) **suggests** a relevant cold agent via arsenal query —
  suggestion layer only; human/§5 keeps control, **never** autonomous cold-agent
  dispatch.
- **4c** QMD `query` MCP tool **callable by agents** in the loop (not just declared
  in `.mcp.json`). Proof: an agent calls `query` mid-mission and gets candidates.
- **4d** **Golden-set arsenal eval** in CI: gold queries → right skill/agent/rule,
  replayed on each collection change (anti-silent-regression).
- Exit 0d: a real mission sees the right skill/agent surface by **semantic search**
  (not static tag) · an agent queries the brain via MCP · golden set green · FTS
  fallback intact · 5 checks + Sonar exit 0.
- **Deferred to 0e** (do NOT pull in): 20+ PDF ingestion, unified frontmatter pass,
  arsenal console UI (→ Étape 3).

---

## Filled cycle prompts (handoff-ready, per `feedback_filled-cycle-prompts`)

### Resume / orchestrator prompt (paste into a fresh session to continue the night)
> Read `docs/learning/2026-06-25-night/STATE.md` then `PLAN.md`. Continue the night
> pipeline from the first unit not marked `DONE`. Obey the standing decisions
> (no merge to main; draft PR chain; 5 checks + Sonar exit 0; knowledge-first).
> For each unit: build via sub-agents → Checker (mas-reviewer) writes a verdict
> file → fix Sonar → verify the 5 checks yourself (never trust an agent's "green")
> → commit + push DRAFT → update STATE.md → next unit. Stop and write a resume
> note when context fills.

### U1 Doer — already dispatched (see STATE.md). Acceptance:
`runReviewPhase`<50 · `dispatch.ts`<800 · 5 checks green · Sonar exit 0 · no
mission-status behaviour change · all prior exports still resolve.

### U1 Checker (run after the Doer returns green)
> Use the `mas-reviewer` skill. Verify the dispatch.ts split against
> `docs/backlog/dispatch-split-review-phase.md` acceptance: (a) `blocked` computed
> from `qc.verdict`+`verdicts[]` only; (b) Agent-Evaluator still advisory (logged
> `agent_evaluation`, never in `verdicts[]`, try/catch); (c) every prior export of
> dispatch.ts still re-exported; (d) `runReviewPhase`<50, `dispatch.ts`<800; (e) no
> behaviour change across dispatch suites. Write the verdict to
> `docs/learning/2026-06-25-night/U1-checker-verdict.md` (PASS / NEEDS_WORK / BLOCK
> + findings).

### U4a Doer (refined after U3 pre-flight)
> Add a semantic candidate source to `selectLibrarySkills`
> (`packages/skills/src/select.ts:135-158`): query the injected `retriever`
> (`mas-arsenal` collection) and **union** its hits with the existing static
> tag-score shortlist; the Router remains the decider. Thread the `retriever`
> param from `dispatch.ts:274-278` through to `selectLibrarySkills`. Add a
> **deterministic fallback**: if the retriever is absent/throws, fall back to the
> current pure-tag behaviour (never crash, never empty shortlist). TDD: write the
> failing tests first (semantic hit surfaces a skill that tag-score alone misses;
> fallback path when retriever is undefined). 5 checks + Sonar exit 0.

### U4 Checker
> Use `mas-reviewer`. Verify 0d exit criteria are met **at runtime** (not "it
> compiles"): a query surfaces the right cold skill/agent semantically; the MCP
> `query` path is reachable by an agent; golden set is green; FTS fallback works
> with QMD off. Write verdict to `docs/learning/2026-06-25-night/U4-checker-verdict.md`.

---

## Cost note
"All night" = work in **waves**, persisting `STATE.md` after each unit. When this
session's context fills, the orchestrator writes a resume note and stops; a fresh
session resumes from `STATE.md` (that is the no-lost-context guarantee). Subscription
billing, but Agent SDK quota is ~4–15× chat — stay lean, eco prose for internal
agent chatter, Opus reserved for build/judgement.
