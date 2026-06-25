# Phase 9 · Vague A — Auto-audit & hardening of foundations 0a/0b — BUILD REPORT

> Branch `phase/9-audit-0a0b` (cut from `phase/9b-pipeline` tip `e1dbe7b`).
> Plan: `docs/learning/2026-06-24-A/plan.md`. Cycle: prepare → do → self-verify →
> Checker → cross-Reviewer → gate. PR **DRAFT only** — the user merges the stack.

Wave A adds **no product features**. It (1) re-proves the 0a foundations hold **at
runtime**, (2) clears the pre-existing `S5906` tech-debt, and (3) self-audits the
foundations. Quality over quantity (CAMPAIGN §6).

## 1. Runtime re-proof of the 0a exit criteria (Task R)

The live QMD MCP brain answered every probe **off the worker process**. Default
backend is **QMD** (`mem:doctor`: `qmd-bin=ok .qmd-index=present forced-fts=false →
backend=qmd`).

| # | 0a criterion | How proven (runtime) | Result |
|---|--------------|----------------------|--------|
| R1 | Semantic knowledge recall | MCP `vec` "avoid forgetting context between sessions" (`mas-knowledge`) → top hit `continuous-learning-and-memory-lifecycle.md` **@ 0.88**; eval `sem-forgetting` ✓ | **PASS** |
| R2 | Arsenal recall | MCP query "audit a PR for security" (`mas-arsenal`) → `performing-serverless-function-security-review` **@ 0.88**, `production-audit`, `security-scan`; eval `arsenal-audit-pr` / `arsenal-security-agent` / `arsenal-memory-skill` ✓ | **PASS** |
| R3 | MCP `query` off-worker | MCP `status` → **1132 docs**, `hasVectorIndex:true`, `needsEmbedding:0`; collections mas-arsenal(1085) / mas-memory(21) / mas-workflows(5) / mas-knowledge(21). Semantic + arsenal queries answered via MCP. | **PASS** (note: MCP exposed but **not yet consumed by agents** — EXPECTED, that is **0d**'s job) |
| R4 | Project-memory by relevance | Wiring proven by green tests: `retriever.test.ts` *"restricts project hits to one project"*, *"does not leak another project"*, *"filters by projectId"*, *"filters by scope"*; `context.test.ts` *"includes a per-project summary referencing prior decisions"* (memory pkg **87/87**). | **PASS (wiring)** + **documented gap** (live demo) |
| R5 | FTS fallback when QMD cut | `MAS_RETRIEVAL_BACKEND=fts pnpm mem:eval` → **exit 0**, prints `backend=fts`, 6 semantic golden queries **skipped (not failed)** — degrades, never crashes; non-silent (`mem:doctor` reports the backend). | **PASS** |
| R6 | Eval harness green | `pnpm mem:eval` (auto) → **6 pass / 0 fail / 0 skip (backend=qmd)**. | **PASS** |

**R4 live-corpus gap (honest note).** The live `mas-memory` collection currently holds
**only global seed docs — zero real `scope:'project'` entries** (no real project
mission has written project registers yet). This is an **empty project corpus, not a
defect**: the relevance + `projectId` scoping is proven by test; the live end-to-end
project-memory demonstration is **deferred** until a real project mission writes
project registers (it will be exercised once 0c/0d missions run, or by a future
seeded project). No project memory was fabricated to fake it (§8 — Keeper is the sole
writer).

**Verdict R**: the 0a renforcée exit criteria are **re-proven at runtime**. The two
honest carry-forwards (live project-memory demo; agents consuming the MCP brain) are
**expected and scheduled into 0c/0d**, not failures.

## 2. S5906 tech-debt cleared (Task S)

- **Before**: 27 open `typescript:S5906` ("prefer specific assertion") across 14 test
  files (pre-existing on `main`, **none introduced by 0a** — confirmed from SonarCloud).
- **After**: all 27 fixed. Every one was the same family — a generic length-equality
  assertion → the specific `toHaveLength` matcher, **intent preserved, none weakened,
  no `// NOSONAR`, no deleted assertion**.
- **Representative before → after**:
  - `expect(loaded.length).toBe(scanned.length)` → `expect(loaded).toHaveLength(scanned.length)` (`skills/library.test.ts`)
  - `expect((await listConversations(db,'agent','p1','other')).length).toBe(0)` → `expect(await listConversations(db,'agent','p1','other')).toHaveLength(0)` (`web/conversations.test.ts`)
  - `expect(rows.filter(t => t.status==='done').length).toBe(1)` → `expect(rows.filter(t => t.status==='done')).toHaveLength(1)` (`worker/autopilot-tick.test.ts`)
- **Tests stayed green** after the pass (all 7 packages). Final Sonar verification of
  "0 of 27 remaining" runs post-push (§4).
- Correctly left untouched: `.length).toBeGreaterThan(…)` / `.toBeLessThanOrEqual(…)`
  bound checks (NOT S5906 — no `toHaveLength` substitute for a `>`/`≤` bound).

## 3. Self-audit findings + dispositions (Task U — §13)

≤8 highest-signal findings; each dispositioned. **1 fixed-now, 3 backlogged, 1 positive.**

| id | artifact | finding | disposition |
|----|----------|---------|-------------|
| U1 | `fiches/quality-controller.md` | Missing the **mandatory `limits` key** (schema `AGENTS.md §2`) — every other Tier A fiche has it. | **fix-now — APPLIED** (commit `2cc9d83`): added a read-only `limits` block derived from the fiche's own role; role unchanged. |
| U2 | `AGENTS.md` §3/§4/§7 | Roster count drift: §3 says "6 agents" but `quality-controller` is the 7th; Tier-B count "58 fiches" actual **60**; §7 file-list/tree omits `quality-controller.md`/`.svg`. | **backlog → 0c** (0c owns the AGENTS.md reconciliation — CAMPAIGN §5). Untouched in Wave A. |
| U3 | `AGENTS.md §10` vs `registry.ts` | §10 claims a fiche without `escalate_when` is "rejected by `registry.ts`" — but `registry.ts` only **types** the fields; there is **no runtime `validateFiche` guard**. U1 (a mandatory key silently missing) proves nothing catches it. | **backlog → 0c** — add a `validateFiche()` that rejects fiches missing mandatory keys, OR soften §10. (Code change → out of Wave A scope.) |
| U4 | `CLAUDE.md §3` | Layout lists `packages/tokens/` which was never created — budget/token logic lives in `packages/core/`. Header says "(planned)" so low-severity, but standing drift. | **backlog** (§3/ROADMAP note) — drop or annotate "(folded into @mas/core)" next time §3 is touched. Not fix-now (touching §3 risks scope creep). |
| U5 | `ADR 0003` (amendment) | Cross-checked end-to-end against `retriever.ts`: QMD-primary + FTS-fallback via `UnifiedRetriever`, non-silent `retrievalDoctor`, store/search/decide boundary, `MemoryRetriever` seam unchanged, `@tobilu/qmd@2.5.3` pin. **No divergence — ADR matches shipped reality.** | **no action** — positive verification. |

**Hand-off to 0c**: U2 (roster reconciliation) and U3 (`validateFiche` guard) are
natural 0c work — 0c already touches `AGENTS.md` and the fiche schema.

## 4. The 5 checks

| Check | Result | Numbers |
|---|---|---|
| `pnpm -r test` | **PASS** | core 106 · db 15 · skills 28 · memory 87 · agents 114 · web 143 · worker 8 → **501 / 0 fail** |
| `pnpm lint` | **PASS, exit 0** | PAYG guard PASS (no forbidden SDK import); all 7 `tsc --noEmit` Done |
| `pnpm build` | **PASS, exit 0** | all packages + `apps/web` build Done |
| `pnpm --filter @mas/web smoke` | **PASS** | **32 passed** |
| **Sonar (check 5)** | _pending post-push_ | target: `scripts/sonar-pr-issues.sh <pr>` exit 0 (0 issues / 0 hotspots, **incl. 0 of 27 S5906**) + `qualitygates/project_status` OK |

## 5. Residual risks / hand-off & exit checklist

- **Deferred (expected, not defects)**: live end-to-end project-memory demo (empty
  project corpus → first real mission); agents **consuming** the MCP brain → **0d**.
- **Backlogged to 0c**: U2 (AGENTS.md roster 6→7 / 58→60 / §7), U3 (`validateFiche`
  guard). **Backlogged (§3)**: U4 (`packages/tokens/` drift).
- **§5/§8/§11 held**: no destructive op; no `data/memory/` write (Keeper-only); no
  `@anthropic-ai/sdk` import; `packages/core/src/providers/` untouched.

### Exit criteria (CAMPAIGN §5 "Sortie A")
- [x] **A1** 0a criteria re-proven at runtime (gaps documented + scheduled into 0c/0d)
- [~] **A2** Full Sonar scan free of S5906 — local fix complete; **verify post-push**
- [x] **A3** §13 self-audit done — fix-or-backlog per finding (1 fixed, 3 backlog, 1 positive)
- [x] **A4** Audit report written (this file)
- [~] **A5** 5 checks — 4 local green; **Sonar pending post-push**

A2/A5 close once the pushed PR's Sonar scan confirms exit 0. A sibling
`checker-verdict.md` is written by the independent Checker subagent.
