# Wave A — Plan (Auto-audit & hardening of foundations 0a/0b)

> Campaign: Phase 9 · Étape 0 (`docs/learning/2026-06-24-campaign-0/CAMPAIGN.md §5 "Vague A"`).
> Branch: `phase/9-audit-0a0b` (cut from the tip of `phase/9b-pipeline` / 0b). PR: **DRAFT only — never merge, never `--force`, never delete branches (§5).**
> Cycle (CAMPAIGN §3): prepare → do → self-verify → Checker → cross-Reviewer → improve (bounded) → gate.
> This is the **prepare** artifact. Doers follow it literally.

---

## 0. Goal & binary exit criteria for Wave A

Wave A does **not** add product features. It proves the 0a foundations hold *at runtime*, clears the S5906 tech-debt, and self-audits the foundations. "Done" is binary:

| # | Exit criterion (from CAMPAIGN §5 "Sortie A") | Binary check |
|---|----------------------------------------------|--------------|
| A1 | 0a exit criteria re-proven **at runtime**, OR any gap honestly documented + scheduled into 0d/0e | Task R table fully filled, every row DONE-with-evidence or DOCUMENTED-GAP with a target wave |
| A2 | Full Sonar scan free of `S5906` | `curl …rules=typescript:S5906&resolved=false` returns **0** issues for the PR's new code AND the 27 pre-existing are fixed; `scripts/sonar-pr-issues.sh <pr>` exit 0 + gate OK |
| A3 | §13 self-audit of foundations done — fix-or-backlog per finding | Task U findings list, each with a `fix-now` or `backlog` disposition |
| A4 | Audit report written | `docs/learning/2026-06-24-A/build-report.md` exists with the 5 sections of Task Audit-report |
| A5 | 5 checks + Sonar exit 0 | `pnpm -r test` · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke` all exit 0; Sonar (A2) |

**Stop-and-report conditions (CAMPAIGN §4):** any §5 guard trips (rm / reset --hard / write outside repo / secret / non-allowlisted host); budget hits 80 %; Checker/Reviewer cannot reach PASS within the bounded loop. The stack persists on the branch → resume losslessly.

**Tasks:** R (runtime re-proof) · S (S5906 cleanup) · U (self-audit) · Audit-report. R, S, U are **independent files** → can run as **parallel Doers**; Audit-report is written last by the orchestrator after R/S/U land.

---

## Task R — Runtime re-proof of the 0a exit criteria

The 0a renforcée exit criteria (ROADMAP §"Critères de sortie 0a renforcée"): semantic-knowledge recall · arsenal recall · project-memory by relevance · FTS fallback when QMD is cut · MCP `query` answers off-worker · eval harness green. Re-prove each **at runtime**, not "it compiles".

### R checklist (criterion → how to prove → status)

| Criterion | How to prove (exact) | Status |
|-----------|----------------------|--------|
| **R1 · Semantic knowledge recall** | Live QMD: `vec` query "avoid forgetting context between sessions" (collection `mas-knowledge`) → top hit `continuous-learning-and-memory-lifecycle.md` @ ~0.88. | **DONE (evidence: orchestrator runtime probe — top hit @ 0.88).** Record the hit in build-report. |
| **R2 · Arsenal recall** | Live QMD: query "audit a PR for security" → `performing-serverless-function-security-review` @ ~0.88 + `production-audit` + `security-scan`. | **DONE (evidence: orchestrator runtime probe — top hit @ 0.88).** Record in build-report. |
| **R3 · MCP `query` off-worker** | The QMD MCP brain answers outside the worker process. | **DONE (evidence: orchestrator probe — `status` → 1132 docs, `hasVectorIndex:true`; semantic + arsenal queries answered via MCP).** Record `status` line in build-report. **Note: MCP exposed but NOT consumed by agents — EXPECTED, that is 0d's job. Document, do not fix here.** |
| **R4 · Project-memory by relevance** | Two-layer proof — see R4 detail below. | **TO PROVE** by Doer-R. |
| **R5 · FTS fallback when QMD is cut** | `MAS_RETRIEVAL_BACKEND=fts pnpm mem:eval` exits 0 (semantic/qmdOnly golden queries are *skipped*, not failed, on FTS — `eval.ts:69`); the run prints `backend=fts`. | **TO PROVE** by Doer-R. |
| **R6 · Eval harness green (default backend)** | `pnpm mem:eval` (auto backend) exits 0. If QMD is locally available it runs `backend=qmd`; otherwise `fts`. Capture which. | **TO PROVE** by Doer-R. |

### R4 detail — project-memory by relevance (the subtle one)

Goal: prove that `buildMemoryContext` retrieves **this project's** memory by relevance (`scope:'project'` + `projectId` filter), without leaking other projects.

1. **Code/wiring proof (authoritative).** The path is already wired: `buildMemoryContext` (`packages/memory/src/context.ts:81`) → `retrieveItems(store, query, 'project', MAX_PROJECT_ITEMS, opts, projectId)` → `opts.retriever.query(query, { scope:'project', limit, projectId })`. Both backends honour `projectId` (FTS via prefix-LIKE `retriever.ts:141-143`; QMD via post-filter `retriever.ts:346`). **Run the existing tests covering this path** (`packages/memory/src/context.test.ts`, `retriever.test.ts`) and confirm green — this is the runtime proof of the relevance+scope wiring. Cite the passing test name(s) in the report.
2. **Live-corpus reality check (honest gap note).** The orchestrator probed the live `mas-memory` collection ("decision blocker learning") and it returned **only global seed docs** (`mas-memory/global/knowledge/…`) — **no real `scope:'project'` entries exist in the live brain yet**, because no real project mission has written project memory. This is **not a defect**: it is an empty project-corpus. **Document it as such**: the wiring + filter are proven by test; the live end-to-end project-memory demonstration is deferred until a real project mission writes project registers (it will be exercised once 0c/0d missions run, or by a future seeded project). Do **not** fabricate project memory to "prove" it (§8 — Keeper is the sole writer of `data/memory/`; tests may use temp dirs only).

Doer-R deliverable: fill the R table with PASS/evidence per row; for R4 cite the green test + the documented live-corpus note; write nothing to `data/memory/`.

> **No code change expected in Task R.** If a re-proof exposes a genuine wiring bug (e.g. fallback crashes instead of degrading), fix it **TDD red→green** (write the failing test first), keep the diff minimal, and log it as a finding in build-report. Otherwise R is pure verification.

---

## Task S — Clear the S5906 debt (27 issues, pre-existing on main, none from 0a)

`typescript:S5906` "prefer specific assertion": replace generic assertions (`.toBeTruthy()` / `.toBeFalsy()` / `expect(x).toBe(true|false)`) with the most specific matcher (`.toBe(expectedValue)`, `.toEqual(…)`, `.toHaveLength(n)`, `.toContain(…)`, `.toBeDefined()`, `.toBeNull()`, …) that **preserves the test's intent**. This is mechanical → **one Doer**.

### Procedure (Doer-S)

1. **Fetch the exact lines + messages from SonarCloud** (do not guess):
   ```
   curl -fsS "https://sonarcloud.io/api/issues/search?componentKeys=nyvlemyt_MultiAgentOS2&rules=typescript:S5906&resolved=false&ps=200"
   ```
   Parse `component` (file) + `line` + `message` per issue.
2. For **each** issue, open the file at the cited line, understand what the test asserts, and replace with the **most specific** matcher that keeps the same intent. **No weakening** — never replace a precise check with a looser one; never delete an assertion to silence the rule; never use `// NOSONAR`.
3. After **each file**, run `pnpm -r test` (or the file's package test) → must stay **green**. Commit per file (or per small group) with a Conventional Commit subject ≤60 chars, e.g. `test: specific assertions (S5906) in dispatch.test.ts`.

### The 14-file inventory (27 issues — confirmed from SonarCloud)

| File | Count |
|------|-------|
| `apps/web/lib/agent-fiche.test.ts` | 3 |
| `apps/web/lib/conversations.test.ts` | 4 |
| `apps/web/lib/decisions.test.ts` | 1 |
| `apps/web/lib/ideas.test.ts` | 1 |
| `apps/web/lib/reports.test.ts` | 2 |
| `apps/worker/src/autopilot-tick.test.ts` | 5 |
| `packages/agents/src/daily-report.test.ts` | 1 |
| `packages/agents/src/dispatch-tick.test.ts` | 2 |
| `packages/agents/src/dispatch.test.ts` | 3 |
| `packages/agents/src/language-wiring.test.ts` | 1 |
| `packages/agents/src/risk-classify-wiring.test.ts` | 1 |
| `packages/memory/src/auto-capture.test.ts` | 1 |
| `packages/skills/src/library.test.ts` | 1 |
| `packages/skills/src/select.test.ts` | 1 |
| **Total** | **27** |

> The exact line numbers shift between snapshots — **always re-fetch from the API** (step 1) rather than trusting a stale line list. The count per file above is the acceptance target: after the pass, the API call must return **0** open S5906 issues.

Doer-S deliverable: 0 of 27 S5906 remaining (verified by re-running the curl), all tests green, before/after assertion examples captured for the report.

---

## Task U — §13 self-audit of the foundations (timeboxed, highest-signal only)

Re-audit already-built foundation artifacts against current best knowledge in `docs/knowledge/` (CLAUDE.md §13 self-audit ritual). **Bounded**: read-and-judge, not rewrite. Output = a findings list; each finding gets `fix-now` (small, safe, in-scope) or `backlog` (larger / cross-cutting → card or ROADMAP note).

### Artifacts to audit (scope — do not expand)

1. **`CLAUDE.md`** — internal consistency after the campaign so far (§3 layout, §7 5-checks, §11 billing, §12/§13). Flag any drift between stated rules and what 0a/0b actually shipped.
2. **`AGENTS.md`** — known drift to flag (do **not** fix here — it is **0c's** job, CAMPAIGN §5): §3 says "6 agents" but `quality-controller` is already in §4 table (l.76) ⇒ roster count stale; §7 file list / tree may lag `packages/agents/fiches/` (actual: `context-manager, memory-keeper, mission-planner, quality-controller, reviewer, sec-reviewer, skill-router`). Record as **backlog → 0c**.
3. **Tier A fiches** (`packages/agents/fiches/*.md`) — check each against the canonical schema (`AGENTS.md §2`): all keys present, **`escalate_when` mandatory**, `limits`, `quality_criteria`. Flag any fiche missing a mandatory key.
4. **ADR 0003** (`docs/decisions/0003-memory-storage-format.md`) — confirm the 2026-06-22 amendment matches the shipped reality (QMD live, FTS non-silent fallback, store/search/decide frontier, `MemoryRetriever` seam). Flag any divergence between ADR prose and `retriever.ts`.

### Method (Doer-U)

For each artifact: read it, cross-check against the relevant `docs/knowledge/` file (use `docs/knowledge/vibeflow/INDEX.md` to locate the right one — e.g. `agent-patterns.md` / `memory-patterns.md` / `prompting-anthropic.md` / `skills-reference.md`), produce **≤8 findings total** (highest signal — quality over quantity, CAMPAIGN §6). Each finding: `id · artifact · what's wrong/stale · disposition (fix-now|backlog) · if fix-now, the exact edit`. **fix-now edits must be small and safe** (doc typo, stale count, missing fiche key); anything structural (e.g. AGENTS.md 6→7) is **backlog → 0c**. Do not touch agent fiches in a way that pre-empts 0c.

Doer-U deliverable: the findings list (goes into build-report §3); apply only the `fix-now` edits, commit them (`docs: self-audit fix-now corrections (Wave A)`).

---

## Task Audit-report — `docs/learning/2026-06-24-A/build-report.md`

Written **last** by the orchestrator once R/S/U land. Required structure (5 sections):

1. **Runtime-proof table (Task R).** The R1–R6 table with status + concrete evidence per row (the QMD scores, the `status` line, the green test names, the `mem:eval` exit + backend). The R4 live-corpus gap + R3 "MCP exposed not consumed → 0d" notes spelled out.
2. **S5906 before/after (Task S).** Count before (27) → after (0, with the verifying curl output); 2-3 representative before/after assertion diffs; per-file confirmation tests stayed green.
3. **Self-audit findings + dispositions (Task U).** The ≤8 findings table; which were fixed-now (with commit), which backlogged (with target: 0c card / ROADMAP note).
4. **5-check results (A5).** `pnpm -r test` (test count) · `pnpm lint` · `pnpm build` · `pnpm --filter @mas/web smoke` (assertion count) · Sonar (`scripts/sonar-pr-issues.sh <pr>` exit 0 + gate OK) — each with pass/fail + numbers.
5. **Residual risks / hand-off.** Anything deferred (R4 live demo, MCP consumption → 0d) and the binary exit-criteria checklist (A1–A5) ticked.

A sibling `checker-verdict.md` is written by the independent Checker subagent (not by the Doers).

---

## TDD note

Wave A is **mostly mechanical + verification** — little new feature code.
- **Task S**: covered by **existing tests staying green** after each file. No new tests; an assertion that becomes more specific is still exercised by the same test.
- **Task R**: pure verification. **Only if** a re-proof exposes a real wiring bug (e.g. fallback crashes instead of degrading to FTS) → **red→green**: write the failing test first, then the minimal fix, then green. Log it as a finding.
- **Task U**: doc/fiche edits only; no code logic, no tests needed (lint/build must still pass).

---

## Guardrails reminder (CLAUDE.md)

- **§5 — no destructive ops:** no `rm`, no `git reset --hard`, no `--force`, **no branch deletion**, no writes outside the repo, no secret writes, no non-allowlisted hosts. PR **DRAFT only**; the user merges the stack.
- **§8 — memory write-lock:** **do not write `data/memory/`** — the Memory Keeper is the sole writer. Tests may use **temp dirs only** (`MAS_MEMORY_ROOT` / tmp). Do not fabricate project memory to "prove" R4.
- **§11 — billing isolation:** **never** import `@anthropic-ai/sdk`; **do not touch `packages/core/src/providers/`**. No new LLM client. (The S5906 work is test files only — trivially compliant; grep-verify no SDK import sneaks in.)
- **§12/§13 — knowledge first:** consult `docs/knowledge/` (via `vibeflow/INDEX.md`) before the self-audit; ≤5 memory items injected per call if any.
- **Bounded scope (CAMPAIGN §4/§6):** quality over quantity. Do **not** drift into 0c work (AGENTS.md 6→7, fiche rewrites) — flag it, backlog it. Do **not** start 0d (MCP consumption, Skill Router → QMD). Stop-and-report on any §5 trip, 80 % budget, or unreachable Checker/Reviewer PASS.
